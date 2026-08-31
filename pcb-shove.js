// 推擠（push-and-shove 的子集）
//
// 使用者畫了一條線，路上有別的網路的走線擋著。業界工具的做法是把擋路的那條「推開」，
// 而不是叫使用者自己繞。這支做的是其中最常見、也最好驗的一種：**把平行的鄰居側推**。
//
// 誠實界定 —— 這不是完整的 push-and-shove：
//   - 先試平移；平移不行（端點卡在 pad、或要挪太遠）才改**繞路**：把那條線改走一段
//     45° 梯形繞道，端點原地不動。繞道也失敗才放棄。
//   - 繞路只處理「一條線繞開一條線」，不做整區重繞（那是真正的 router 的工作）。
//   - 端點卡在 pad 或 via 上的線**不動**：那個端點是連接點，挪了就斷線。
//   - 推不動就照實回報，由呼叫端決定（我們的呼叫端會保留原本的警告，不會假裝成功）。
//   - 不做連鎖推擠（A 推 B、B 再推 C）。一輪推不開就算失敗。
//
// 為什麼要這些限制：推擠最危險的失敗不是「推不動」，而是「推動了但把別的地方弄壞」。
// 所以每一次移動都要在套用之前，拿全套幾何重新驗一遍（走線、pad、via、板邊、禁佈區）。
//
// 純函式（吃 state 回計畫，不碰 DOM、不改 state），node 可直接測。
(() => {
  'use strict';

  const T = (k, vars) => (typeof window !== 'undefined' && window.I18N) ? window.I18N.t(k, vars) : k;

  const geom = () => (typeof window !== 'undefined' && window.PadDrc && window.PadDrc._geom) || null;

  const layerOf = t => t.layer || 'F.Cu';
  const sameNet = (a, b) => !!(a && b && a === b);

  // 端點是不是卡在 pad / via 上（卡住就不能移動整條線）
  function anchored(state, padAbs, x, y, net) {
    for (const v of (state.vias || [])) {
      if (Math.hypot(v.x - x, v.y - y) <= (v.od || 0.7) / 2) return true;
    }
    for (const c of (state.components || [])) for (const p of (c.pads || [])) {
      if (p.cu === false) continue;
      const a = padAbs(c, p);
      if (Math.hypot(a.x - x, a.y - y) <= Math.hypot(p.w || 0.5, p.h || 0.5) / 2) return true;
    }
    return false;
  }

  // 移動之後，這條線對周遭還合不合法。回 null 表示沒問題，否則回原因。
  function violation(state, padAbs, t, cl, ignore) {
    const gm = geom();
    if (!gm) return null;
    const lay = layerOf(t), hw = (t.width || 0.3) / 2;
    for (const o of (state.traces || [])) {
      if (o === t || (ignore && ignore.indexOf(o) >= 0)) continue;
      if (layerOf(o) !== lay) continue;
      if (sameNet(o.net, t.net)) continue;
      const d = gm.segSegDist(t.x1, t.y1, t.x2, t.y2, o.x1, o.y1, o.x2, o.y2) - hw - (o.width || 0.3) / 2;
      if (d < cl.traceToTrace - 1e-9) return 'trace';
    }
    for (const c of (state.components || [])) for (const p of (c.pads || [])) {
      if (p.cu === false) continue;
      if (sameNet(p.net, t.net)) continue;
      const side = p.side;
      if (!(side === '*' || (side === 'B' ? lay === 'B.Cu' : lay === 'F.Cu'))) continue;
      const d = gm.segPadDist(t.x1, t.y1, t.x2, t.y2, gm.padShape(c, p, padAbs)) - hw;
      if (d < cl.traceToPad - 1e-9) return 'pad';
    }
    for (const v of (state.vias || [])) {
      if (sameNet(v.net, t.net)) continue;
      const d = gm.ptSegDist(v.x, v.y, t.x1, t.y1, t.x2, t.y2) - (v.od || 0.7) / 2 - hw;
      if (d < cl.traceToTrace - 1e-9) return 'via';
    }
    const hwB = (state.boardWidth || 100) / 2, hhB = (state.boardHeight || 80) / 2;
    const dEdge = Math.min(hwB - Math.max(Math.abs(t.x1), Math.abs(t.x2)),
                           hhB - Math.max(Math.abs(t.y1), Math.abs(t.y2))) - hw;
    if (dEdge < cl.traceToEdge - 1e-9) return 'edge';
    for (const k of (state.keepouts || [])) {
      if (!k.pts || k.pts.length < 3) continue;
      if (k.layer && k.layer !== '*' && k.layer !== lay) continue;
      if (gm.ptInPoly(t.x1, t.y1, k.pts) || gm.ptInPoly(t.x2, t.y2, k.pts)) return 'keepout';
      for (let a = 0; a < k.pts.length; a++) {
        const p1 = k.pts[a], p2 = k.pts[(a + 1) % k.pts.length];
        if (gm.segSegDist(t.x1, t.y1, t.x2, t.y2, p1[0], p1[1], p2[0], p2[1]) - hw < 0) return 'keepout';
      }
    }
    return null;
  }

  /**
   * 算「誰擋路、各要往哪邊挪多少」——**不做驗證**。
   *
   * 抽出來是為了連鎖推擠：plan() 在中途就把「移動之後會撞到別人」判為失敗，
   * 而那正是連鎖存在的理由（A 推 B、B 再推 C）。所以驗證要留給呼叫端決定
   * 什麼時候做：單輪推擠當場驗，連鎖推擠等整條鏈算完再一次驗。
   */
  function computeMoves(state, padAbs, seg, cl, opts) {
    {
      const gm = geom();
      if (!gm) return { ok: false, reason: 'noGeom', moves: [], blockers: 0 };
      const lay = layerOf(seg), hw = (seg.width || 0.3) / 2;

      // 1) 誰擋路
      const blockers = [];
      const protect = (opts && opts.protect) || null;
      for (const t of (state.traces || [])) {
        if (t === seg) continue;
        // protect：**使用者剛畫的那一段永遠不可以被推走**。
        // 第一輪靠 t === seg 就擋掉了，但連鎖第二輪起是「被推開的線去推別人」，
        // 那時 seg 只是 traces 裡的一條普通線——會被推走，而且推的是使用者剛畫完的東西。
        if (protect && protect.indexOf(t) >= 0) continue;
        if (layerOf(t) !== lay) continue;
        if (sameNet(t.net, seg.net)) continue;
        const d = gm.segSegDist(seg.x1, seg.y1, seg.x2, seg.y2, t.x1, t.y1, t.x2, t.y2) - hw - (t.width || 0.3) / 2;
        if (d < cl.traceToTrace - 1e-9) blockers.push({ t, d });
      }
      if (!blockers.length) return { ok: true, moves: [], blockers: 0 };

      const moves = [];
      for (const b of blockers) {
        const t = b.t;
        // 2) 端點卡在 pad/via 上就不能整條移動——那是連接點
        if (anchored(state, padAbs, t.x1, t.y1, t.net) || anchored(state, padAbs, t.x2, t.y2, t.net)) {
          return { ok: false, reason: 'anchored', moves: [], blockers: blockers.length };
        }
        // 3) 推的方向＝這條線自己的法線，往遠離新線的那一側
        const dx = t.x2 - t.x1, dy = t.y2 - t.y1;
        const len = Math.hypot(dx, dy);
        if (len < 1e-6) return { ok: false, reason: 'degenerate', moves: [], blockers: blockers.length };
        let nx = -dy / len, ny = dx / len;
        const midT = { x: (t.x1 + t.x2) / 2, y: (t.y1 + t.y2) / 2 };
        const midS = { x: (seg.x1 + seg.x2) / 2, y: (seg.y1 + seg.y2) / 2 };
        if ((midT.x - midS.x) * nx + (midT.y - midS.y) * ny < 0) { nx = -nx; ny = -ny; }
        const need = (cl.traceToTrace - b.d) + 0.02;
        if (need > opts.maxMove) return { ok: false, reason: 'tooFar', moves: [], blockers: blockers.length };

        // 4) 同 net 接在端點上的其他走線要跟著走，否則推開＝把自己的網路扯斷
        const followers = [];
        for (const o of (state.traces || [])) {
          if (o === t || !sameNet(o.net, t.net) || layerOf(o) !== lay) continue;
          if (Math.hypot(o.x1 - t.x1, o.y1 - t.y1) < 0.02 || Math.hypot(o.x1 - t.x2, o.y1 - t.y2) < 0.02) followers.push({ trace: o, end: 'a' });
          if (Math.hypot(o.x2 - t.x1, o.y2 - t.y1) < 0.02 || Math.hypot(o.x2 - t.x2, o.y2 - t.y2) < 0.02) followers.push({ trace: o, end: 'b' });
        }
        moves.push({ trace: t, dx: nx * need, dy: ny * need, followers });
      }

      // 一條線可能同時是「擋路的」也是「別人的續線」。兩邊都套用等於位移兩次，
      // 結果是它自己飛出去、接點也對不上。整條會移動的，就不要再當成續線調端點。
      const movedSet = new Set(moves.map(m => m.trace));
      for (const m of moves) m.followers = m.followers.filter(f => !movedSet.has(f.trace));

      return { ok: true, moves, blockers: blockers.length };
    }
  }

  /**
   * 在副本上套用一組移動並整份重驗。
   * 推動了卻把別的地方弄壞，比推不動嚴重得多——所以每次都拿全套幾何再驗一遍。
   * 回 null 表示沒問題，否則回原因字串。
   */
  function verifyMoves(state, padAbs, seg, moves, cl) {
    const clone = Object.assign({}, state, {
      traces: (state.traces || []).map(t => Object.assign({}, t))
    });
    const idxOf = t => (state.traces || []).indexOf(t);
    const movedClones = [];
    for (const m of moves) {
      const ct = clone.traces[idxOf(m.trace)];
      if (!ct) continue;
      ct.x1 += m.dx; ct.y1 += m.dy; ct.x2 += m.dx; ct.y2 += m.dy;
      movedClones.push(ct);
      for (const f of (m.followers || [])) {
        const cf = clone.traces[idxOf(f.trace)];
        if (!cf) continue;
        if (f.end === 'a') { cf.x1 += m.dx; cf.y1 += m.dy; } else { cf.x2 += m.dx; cf.y2 += m.dy; }
        movedClones.push(cf);
      }
    }
    // 新畫的那一段也要進副本一起驗（它是造成推擠的原因，必須跟推開後的結果相容）。
    // **但呼叫端多半已經把它放進 state.traces 了**（先落地再推擠），
    // 再 push 一份就會出現「它跟自己的分身距離 0」——沒有 net 的線連 sameNet 都不成立，
    // 於是每次都判成 wouldBreak:trace，推擠看起來壞掉但其實是驗證多算了一條。
    const segIdx = (state.traces || []).indexOf(seg);
    const segClone = segIdx >= 0 ? clone.traces[segIdx] : Object.assign({}, seg);
    if (segIdx < 0) clone.traces.push(segClone);
    for (const ct of movedClones.concat([segClone])) {
      const why = violation(clone, padAbs, ct, cl, null);
      if (why) return 'wouldBreak:' + why;
    }
    return null;
  }

  /**
   * 繞路：把擋路的那一條改走一段繞道，端點原地不動。
   *
   * 為什麼需要它：平移對「兩端都卡在 pad 上」的線完全無效——那正是密集板上最常見的情況
   * （每條線都從某顆 pad 出發、到另一顆 pad）。舊版遇到就回 anchored 放棄，
   * 使用者看到的是「推擠沒作用」，而擋路的線其實只要繞一個小彎就過得去。
   *
   * 形狀是梯形凸起：沿著原線走到衝突區之前，用 45° 斜出去，平行走過衝突區，再 45° 收回來。
   * **45° 是刻意的**：這個編輯器的走線本來就吸 0/45/90，繞出來的線要跟手畫的長得一樣，
   * 不然使用者會覺得板子上多了一段「不是我畫的東西」。
   *
   * 回 { ok, segments } 或 { ok:false, reason }。不改 state。
   */
  function detour(state, padAbs, seg, t, cl, opts) {
    const gm = geom();
    if (!gm) return { ok: false, reason: 'noGeom' };
    const ux = t.x2 - t.x1, uy = t.y2 - t.y1;
    const len = Math.hypot(ux, uy);
    if (len < 1e-6) return { ok: false, reason: 'degenerate' };
    const dx = ux / len, dy = uy / len;
    let nx = -dy, ny = dx;
    // 往遠離新線的那一側繞（跟平移同一個判斷）
    const midT = { x: (t.x1 + t.x2) / 2, y: (t.y1 + t.y2) / 2 };
    const midS = { x: (seg.x1 + seg.x2) / 2, y: (seg.y1 + seg.y2) / 2 };
    if ((midT.x - midS.x) * nx + (midT.y - midS.y) * ny < 0) { nx = -nx; ny = -ny; }

    const hw = (t.width || 0.3) / 2, hs = (seg.width || 0.3) / 2;
    const want = cl.traceToTrace + hw + hs;

    // 衝突區：沿著 t 取樣，找出「離新線太近」的那一段參數區間。
    // 用取樣而不是解析解：新線可能是任意角度，解析解的分支比取樣容易寫錯，
    // 而這裡的精度只要夠決定繞道範圍就行（步進 0.1mm）。
    const step = Math.max(0.05, Math.min(0.25, len / 40));
    let s0 = Infinity, s1 = -Infinity, worst = 0;
    for (let d0 = 0; d0 <= len + 1e-9; d0 += step) {
      const px = t.x1 + dx * d0, py = t.y1 + dy * d0;
      const gap = gm.ptSegDist(px, py, seg.x1, seg.y1, seg.x2, seg.y2);
      if (gap < want) { s0 = Math.min(s0, d0); s1 = Math.max(s1, d0); worst = Math.max(worst, want - gap); }
    }
    if (!(s1 >= s0)) return { ok: false, reason: 'noConflict' };

    const off = worst + 0.02;                      // 要繞開多遠
    const maxOff = (opts && opts.maxDetour) || 3;  // 保險絲：繞太遠等於重畫整條線
    if (off > maxOff) return { ok: false, reason: 'tooFar' };

    // 斜出去/收回來各佔 off（45°）。空間不夠就把梯形壓成三角形。
    const ramp = off;
    let a0 = s0 - ramp, a1 = s1 + ramp;
    if (a0 < 0.05 || a1 > len - 0.05) {
      // 衝突區太靠近端點：端點是接點不能動，硬繞會把線頭拉離 pad
      return { ok: false, reason: 'nearEnd' };
    }
    const P = (along, side) => ({ x: t.x1 + dx * along + nx * side, y: t.y1 + dy * along + ny * side });
    const pts = [{ x: t.x1, y: t.y1 }, P(a0, 0), P(s0, off), P(s1, off), P(a1, 0), { x: t.x2, y: t.y2 }];

    const mk = (p1, p2) => Object.assign({}, t, {
      id: 'sh-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
      x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, detour: true
    });
    const segments = [];
    for (let i = 0; i + 1 < pts.length; i++) {
      if (Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y) < 1e-6) continue;
      segments.push(mk(pts[i], pts[i + 1]));
    }
    if (!segments.length) return { ok: false, reason: 'degenerate' };

    // 驗：把原線換成繞道之後，每一段都要合法。**這一步不可以省**——
    // 繞開 A 卻撞上 B 是這個功能最容易出的錯，而且畫面上看起來很合理。
    const clone = Object.assign({}, state, {
      traces: (state.traces || []).filter(x => x !== t).map(x => Object.assign({}, x))
    });
    if ((state.traces || []).indexOf(seg) < 0) clone.traces.push(Object.assign({}, seg));
    clone.traces.push.apply(clone.traces, segments);
    for (const ns of segments) {
      const why = violation(clone, padAbs, ns, cl, null);
      if (why) return { ok: false, reason: 'wouldBreak:' + why };
    }
    return { ok: true, segments: segments, offset: off, replaced: t };
  }

  /** 所有擋路的線都試繞路。只要有一條繞不開就整個放棄——半套結果比失敗更糟。 */
  function planDetours(state, padAbs, seg, cl, opts) {
    const gm = geom();
    if (!gm) return { ok: false, reason: 'noGeom' };
    const lay = layerOf(seg), hw = (seg.width || 0.3) / 2;
    const protect = (opts && opts.protect) || null;
    const reroutes = [];
    let work = state;
    for (const t of (state.traces || [])) {
      if (t === seg) continue;
      if (protect && protect.indexOf(t) >= 0) continue;
      if (layerOf(t) !== lay) continue;
      if (sameNet(t.net, seg.net)) continue;
      const d = gm.segSegDist(seg.x1, seg.y1, seg.x2, seg.y2, t.x1, t.y1, t.x2, t.y2) - hw - (t.width || 0.3) / 2;
      if (d >= cl.traceToTrace - 1e-9) continue;
      const r = detour(work, padAbs, seg, t, cl, opts);
      if (!r.ok) return { ok: false, reason: 'detour:' + r.reason, moves: [], blockers: reroutes.length + 1 };
      reroutes.push({ trace: t, segments: r.segments, offset: r.offset });
      // 下一條要看到「前一條已經繞開」的狀態，否則兩條會繞到同一個位置
      work = Object.assign({}, work, {
        traces: (work.traces || []).filter(x => x !== t).concat(r.segments)
      });
    }
    if (!reroutes.length) return { ok: false, reason: 'noBlockers' };
    return { ok: true, moves: [], reroutes: reroutes, blockers: reroutes.length };
  }

  const Shove = {
    /**
     * 規劃推擠（單輪）。state 不會被改動。
     * seg：剛畫好（或正在畫）的那一段 {x1,y1,x2,y2,width,layer,net}
     * 回 { ok, moves:[{trace, dx, dy, followers:[{trace,end}]}], blockers, reason }
     */
    plan(state, padAbs, seg, opts) {
      opts = Object.assign({ clearance: null, maxMove: 2 }, opts || {});
      const cl = opts.clearance;
      if (!cl) return { ok: false, reason: 'noRules', moves: [], blockers: 0 };
      const r = computeMoves(state, padAbs, seg, cl, opts);
      // 平移失敗（端點卡在 pad 上、或要挪太遠）時改試繞路。
      // 兩端都在 pad 上是密集板的常態，舊版遇到就整個放棄——
      // 使用者看到的是「推擠沒作用」，而那條線其實只要繞個小彎。
      if (!r.ok && (r.reason === 'anchored' || r.reason === 'tooFar') && opts.detour !== false) {
        const d = planDetours(state, padAbs, seg, cl, opts);
        if (d.ok) return d;
        // reason 保持原本那個列舉值（呼叫端與測試靠它分辨主因），
        // 繞路為什麼也不行放在另一個欄位——把兩件事併成一個字串，字串就不再是列舉。
        return { ok: false, reason: r.reason, detourReason: d.reason, moves: [], blockers: r.blockers };
      }
      if (!r.ok || !r.moves.length) return r;
      const why = verifyMoves(state, padAbs, seg, r.moves, cl);
      if (why) {
        if (opts.detour !== false) {
          const d = planDetours(state, padAbs, seg, cl, opts);
          if (d.ok) return d;
        }
        return { ok: false, reason: why, moves: [], blockers: r.blockers };
      }
      return r;
    },

    /**
     * 連鎖推擠：A 推 B、B 再推 C。
     *
     * 單輪推擠碰到「B 挪開之後會撞到 C」就整個放棄——但那正是連鎖要處理的情況。
     * 這裡的做法是：在一份工作副本上一輪一輪往外推，**中途不驗**，
     * 整條鏈算完再拿全套幾何驗一次。中途驗會把每一個中間狀態都判成失敗。
     *
     * 仍然只做平移、不重繞（跟單輪一樣的界線）。差別只在「能不能傳下去」。
     * depth 是保險絲：沒有它，一片密集的板子可以一路推到板邊，
     * 使用者畫一條線結果半塊板在動。
     *
     * 回 { ok, moves, blockers, rounds, reason }；moves 是**累計**位移（一條線一筆）。
     */
    planChain(state, padAbs, seg, opts) {
      opts = Object.assign({ clearance: null, maxMove: 2, depth: 3 }, opts || {});
      const cl = opts.clearance;
      if (!cl) return { ok: false, reason: 'noRules', moves: [], blockers: 0, rounds: 0 };
      const depth = Math.max(1, Math.min(8, opts.depth | 0 || 3));
      // 連鎖失敗時也要能改繞路。只接單輪的話會出現「開了連鎖反而不會繞」，
      // 那種行為使用者永遠猜不到。
      const tryDetour = (reason, blockers) => {
        if (opts.detour === false) return { ok: false, reason: reason, moves: [], blockers: blockers, rounds: 0 };
        const d = planDetours(state, padAbs, seg, cl, opts);
        if (d.ok) return Object.assign({ rounds: 0 }, d);
        return { ok: false, reason: reason, detourReason: d.reason, moves: [], blockers: blockers, rounds: 0 };
      };

      // 工作副本：一輪一輪在上面推，真的 state 一個位元組都不動
      const idxOf = t => (state.traces || []).indexOf(t);
      const work = Object.assign({}, state, {
        traces: (state.traces || []).map(t => Object.assign({}, t))
      });
      const accum = new Map();          // 原始 trace → {dx, dy, followers}
      const bump = (origTrace, dx, dy, followers) => {
        const cur = accum.get(origTrace) || { trace: origTrace, dx: 0, dy: 0, followers: [] };
        cur.dx += dx; cur.dy += dy;
        for (const f of (followers || [])) if (!cur.followers.some(x => x.trace === f.trace && x.end === f.end)) cur.followers.push(f);
        accum.set(origTrace, cur);
      };

      // seg 通常已經被呼叫端 push 進 state.traces（先落地再推擠）。
      // 找出它在工作副本裡的那一份並保護起來，連鎖才不會回頭推使用者剛畫的線。
      const segIdx = (state.traces || []).indexOf(seg);
      const protect = segIdx >= 0 ? [work.traces[segIdx]] : [];
      const roundOpts = Object.assign({}, opts, { protect });

      let pushers = [Object.assign({}, seg)];
      // 擋路的要算**相異條數**，不是每輪相加：同一條線在第一輪被推、第二輪又被當成
      // 擋路的算一次，訊息就會變成「4 條推不開」但板上只有 2 條，使用者無從對照。
      const blockerSet = new Set();
      let rounds = 0;
      for (let r = 0; r < depth; r++) {
        const nextPushers = [];
        let movedThisRound = 0;
        for (const pusher of pushers) {
          const res = computeMoves(work, padAbs, pusher, cl, roundOpts);
          // 平移這一輪推不動 → 整條鏈放棄，改試繞路（繞路是對「端點焊死」唯一有效的手段）
          if (!res.ok) return tryDetour('chain:' + res.reason, res.blockers || blockerSet.size);
          if (!res.moves.length) continue;
          for (const m of res.moves) {
            // m.trace 是工作副本裡的物件；換回原始的那一條才記得住
            const wi = work.traces.indexOf(m.trace);
            const orig = wi >= 0 ? state.traces[wi] : null;
            if (!orig) return { ok: false, reason: 'chain:lostTrace', moves: [], blockers: blockerSet.size, rounds: r };
            const origFollowers = (m.followers || []).map(f => {
              const fi = work.traces.indexOf(f.trace);
              return fi >= 0 ? { trace: state.traces[fi], end: f.end } : null;
            }).filter(Boolean);
            blockerSet.add(orig);
            bump(orig, m.dx, m.dy, origFollowers);
            // 在工作副本上真的移動，下一輪才看得到新的擋路關係
            m.trace.x1 += m.dx; m.trace.y1 += m.dy; m.trace.x2 += m.dx; m.trace.y2 += m.dy;
            for (const f of (m.followers || [])) {
              if (f.end === 'a') { f.trace.x1 += m.dx; f.trace.y1 += m.dy; }
              else { f.trace.x2 += m.dx; f.trace.y2 += m.dy; }
            }
            nextPushers.push(m.trace);   // 被推開的線，下一輪換它去推別人
            movedThisRound++;
          }
        }
        if (!movedThisRound) break;
        rounds = r + 1;
        pushers = nextPushers;
      }

      const moves = [...accum.values()];
      if (!moves.length) return { ok: true, moves: [], blockers: 0, rounds: 0 };
      // 推到 depth 還沒收斂＝還有東西擋著，硬套用會留下違規。照實說。
      for (const pusher of pushers) {
        const still = computeMoves(work, padAbs, pusher, cl, roundOpts);
        if (still.ok && still.moves.length) return tryDetour('chain:tooDeep', blockerSet.size);
      }
      const why = verifyMoves(state, padAbs, seg, moves, cl);
      if (why) return tryDetour('chain:' + why, blockerSet.size);
      return { ok: true, moves, blockers: blockerSet.size, rounds };
    },

    // 把計畫套用到真的 state 上。回移動了幾條。
    apply(state, planResult) {
      if (!planResult || !planResult.ok) return 0;
      let n = 0;
      // 繞路：把原線換成一串新線段。先做這個再做平移，兩者不會同時出現，
      // 但順序寫死比較好推理。
      for (const rr of (planResult.reroutes || [])) {
        const i = (state.traces || []).indexOf(rr.trace);
        if (i < 0) continue;
        state.traces.splice(i, 1, ...rr.segments);
        n++;
      }
      for (const m of planResult.moves) {
        m.trace.x1 += m.dx; m.trace.y1 += m.dy;
        m.trace.x2 += m.dx; m.trace.y2 += m.dy;
        n++;
        for (const f of m.followers) {
          if (f.end === 'a') { f.trace.x1 += m.dx; f.trace.y1 += m.dy; }
          else { f.trace.x2 += m.dx; f.trace.y2 += m.dy; }
        }
      }
      return n;
    },

    _detour: detour,
    _planDetours: planDetours,
    _violation: violation,
    _anchored: anchored,
    _computeMoves: computeMoves,
    _verifyMoves: verifyMoves,
    _T: T
  };

  if (typeof window !== 'undefined') window.Shove = Shove;
  if (typeof module !== 'undefined' && module.exports) module.exports = Shove;
})();
