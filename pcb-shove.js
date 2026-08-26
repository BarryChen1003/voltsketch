// 推擠（push-and-shove 的子集）
//
// 使用者畫了一條線，路上有別的網路的走線擋著。業界工具的做法是把擋路的那條「推開」，
// 而不是叫使用者自己繞。這支做的是其中最常見、也最好驗的一種：**把平行的鄰居側推**。
//
// 誠實界定 —— 這不是完整的 push-and-shove：
//   - 只做平移，不重繞。擋路的線維持原本的方向與長度，整條往旁邊挪。
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

  const Shove = {
    /**
     * 規劃推擠。state 不會被改動。
     * seg：剛畫好（或正在畫）的那一段 {x1,y1,x2,y2,width,layer,net}
     * 回 { ok, moves:[{trace, dx, dy, followers:[{trace,end}]}], blockers, reason }
     */
    plan(state, padAbs, seg, opts) {
      opts = Object.assign({ clearance: null, maxMove: 2 }, opts || {});
      const gm = geom();
      if (!gm) return { ok: false, reason: 'noGeom', moves: [], blockers: 0 };
      const cl = opts.clearance;
      if (!cl) return { ok: false, reason: 'noRules', moves: [], blockers: 0 };
      const lay = layerOf(seg), hw = (seg.width || 0.3) / 2;

      // 1) 誰擋路
      const blockers = [];
      for (const t of (state.traces || [])) {
        if (t === seg) continue;
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

      // 5) 在副本上套用，整份重驗。推動了卻把別的地方弄壞，比推不動嚴重得多。
      const clone = Object.assign({}, state, {
        traces: (state.traces || []).map(t => Object.assign({}, t))
      });
      const idxOf = t => (state.traces || []).indexOf(t);
      const movedClones = [];
      for (const m of moves) {
        const ct = clone.traces[idxOf(m.trace)];
        ct.x1 += m.dx; ct.y1 += m.dy; ct.x2 += m.dx; ct.y2 += m.dy;
        movedClones.push(ct);
        for (const f of m.followers) {
          const cf = clone.traces[idxOf(f.trace)];
          if (f.end === 'a') { cf.x1 += m.dx; cf.y1 += m.dy; } else { cf.x2 += m.dx; cf.y2 += m.dy; }
          movedClones.push(cf);
        }
      }
      // 新畫的那一段也要進副本一起驗（它是造成推擠的原因，必須跟推開後的結果相容）
      const segClone = Object.assign({}, seg);
      clone.traces.push(segClone);
      for (const ct of movedClones.concat([segClone])) {
        const why = violation(clone, padAbs, ct, cl, null);
        if (why) return { ok: false, reason: 'wouldBreak:' + why, moves: [], blockers: blockers.length };
      }
      return { ok: true, moves, blockers: blockers.length };
    },

    // 把計畫套用到真的 state 上。回移動了幾條。
    apply(state, planResult) {
      if (!planResult || !planResult.ok) return 0;
      let n = 0;
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

    _violation: violation,
    _anchored: anchored,
    _T: T
  };

  if (typeof window !== 'undefined') window.Shove = Shove;
  if (typeof module !== 'undefined' && module.exports) module.exports = Shove;
})();
