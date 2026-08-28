/**
 * pcb-nets.js — net 升級成一級物件（window.NetModel）
 *
 * 為什麼要有這一層：
 *   net 在這個 codebase 一直只是「散在圖元上的一個字串欄位」。字串沒地方掛屬性，
 *   所以「這條要 50Ω」「這兩條是一對」只能靠命名慣例猜（ConstraintMgr 的 pattern、
 *   NetRules 的去尾 P/N），猜錯了使用者也沒有地方可以講清楚。
 *
 * 為什麼不改成 id：
 *   把 pad/走線/via/鋪銅上的 net 換成 id，等於每一張存過的板子都要遷移，
 *   而且 net 名字本來就是線路圖與板子之間的共同語言（改名已有雙向同步）。
 *   所以 **識別仍然是名字**，屬性另外放在 state.netProps[name]，改名時一起搬。
 *
 * 這支檔案同時是三件事的唯一一份實作：
 *   1. **net 參照列舉**（refs）。以前 renameNetName 手抄四個陣列，漏掉 userZones 與
 *      teardrops：改完名字使用者畫的鋪銅還掛在舊網路上，畫面上完全看不出來。
 *   2. **IPC-2141 阻抗近似式**（impedance）。pcbApp.calcImpedance 轉呼叫這裡。
 *   3. **目標阻抗 → 線寬**（widthFor）。算得出來才叫「目標」，不然只是一個註記。
 *
 * 純函式、不碰 DOM，node 測得到（netmodel.test.js）。UI 綁在 pcb.js。
 */
window.NetModel = (function () {
  'use strict';

  const T = (k, vars) => (typeof window !== 'undefined' && window.I18N) ? window.I18N.t(k, vars) : k;
  const r3 = v => Math.round(v * 1000) / 1000;
  const num = v => (typeof v === 'number' && isFinite(v) && v > 0) ? v : 0;

  // ---------------- 1. net 參照列舉 ----------------
  // 帶 net 欄位的圖元全都在這裡。新增一種帶 net 的圖元 → 只加這一行，
  // 改名、統計、稽核三邊自動跟上。
  const REF_SPECS = [
    { key: 'components', viaPads: true },
    { key: 'traces' },
    { key: 'vias' },
    { key: 'zones' },      // KiCad 匯入的鋪銅
    { key: 'userZones' },  // 使用者自己畫的鋪銅
    { key: 'teardrops' }   // Mfg.Teardrops 產生（帶 net，匯出時當 region）
  ];

  // 回 [{kind, obj, owner}]；obj 一定有 .net 可讀可寫
  function refs(state) {
    const out = [];
    if (!state) return out;
    for (const spec of REF_SPECS) {
      const arr = state[spec.key];
      if (!Array.isArray(arr)) continue;
      for (const o of arr) {
        if (!o) continue;
        if (spec.viaPads) { for (const pd of (o.pads || [])) if (pd) out.push({ kind: 'pad', obj: pd, owner: o }); }
        else out.push({ kind: spec.key, obj: o, owner: null });
      }
    }
    return out;
  }

  // 板上實際用到的 net 名（排序）。屬性表裡有、板上沒有的不算——那是過期資料。
  function names(state) {
    const s = new Set();
    for (const r of refs(state)) if (r.obj.net) s.add(r.obj.net);
    return [...s].sort();
  }

  // ---------------- 2. 屬性表 ----------------
  const propsOf = state => (state && state.netProps) || {};
  function propsRW(state) {
    if (!state.netProps || typeof state.netProps !== 'object') state.netProps = {};
    return state.netProps;
  }

  // 差分對命名慣例：XXX_P/XXX_N、XXXP/XXXN、XXX+/XXX-
  // 只認「同 base、極性相反、而且板上真的兩條都在」的組合，猜不到就不猜。
  const POL_RE = /^(.*?)(_?)([PN]|[+\-])$/i;
  function split(name) {
    const m = POL_RE.exec(String(name || ''));
    if (!m || !m[1]) return null;
    const p = m[3].toUpperCase();
    return { base: m[1], sep: m[2], pol: (p === 'P' || p === '+') ? 'P' : 'N' };
  }
  function autoPair(name, all) {
    const s = split(name);
    if (!s) return '';
    const wantP = s.pol === 'N';
    const cands = [];
    for (const n of (all || [])) {
      if (n === name) continue;
      const t = split(n);
      if (!t || t.base !== s.base) continue;
      if ((t.pol === 'P') !== wantP) continue;
      cands.push(n);
    }
    // 兩個以上候選（DATA_P 同時對到 DATA+ 與 DATA_P）就不猜，交給使用者明講
    return cands.length === 1 ? cands[0] : '';
  }

  // 明講的配對優先；沒明講才用命名猜。回 {net, source:'explicit'|'name'|''}
  function pairOf(state, name, all) {
    const p = propsOf(state)[name];
    if (p && typeof p.pair === 'string' && p.pair && p.pair !== name) return { net: p.pair, source: 'explicit' };
    return { net: autoPair(name, all || names(state)), source: 'name' };
  }

  // ConstraintMgr 的 class（唯讀，純資訊）。沒載入就空的。
  function classOf(name) {
    const CM = (typeof window !== 'undefined') && window.ConstraintMgr;
    if (!CM) return '';
    try { const c = CM.classOf(CM.load(), name); return c ? c.name : ''; } catch (e) { return ''; }
  }

  // 解析後的 net 物件。屬性表沒寫的欄位一律給明確的預設，呼叫端不必再判 undefined。
  function get(state, name, all) {
    const p = propsOf(state)[name] || {};
    const pr = pairOf(state, name, all);
    return {
      name,
      z0: num(p.z0),                       // 目標單端阻抗 Ω（0 = 不檢查）
      zdiff: num(p.zdiff),                 // 目標差動阻抗 Ω（0 = 不檢查）
      ztol: num(p.ztol) || 10,             // 容差 %
      pair: pr.net,
      pairSource: pr.net ? pr.source : '',
      note: typeof p.note === 'string' ? p.note : '',
      cls: classOf(name),
      hasProps: Object.keys(p).length > 0
    };
  }

  // 寫屬性。空值＝清掉那一欄；整筆變空就把 key 移除，
  // 不然 netProps 會被一堆 {} 塞滿，存檔跟著變大而且看起來像有設定。
  const FIELDS = ['z0', 'zdiff', 'ztol', 'pair', 'note'];
  function set(state, name, patch) {
    if (!name) return null;
    const P = propsRW(state);
    const cur = Object.assign({}, P[name] || {});
    for (const k of FIELDS) {
      if (!(k in (patch || {}))) continue;
      const v = patch[k];
      if (k === 'pair' || k === 'note') {
        const s = String(v == null ? '' : v).trim();
        if (s) cur[k] = s; else delete cur[k];
      } else {
        const n = parseFloat(v);
        if (isFinite(n) && n > 0) cur[k] = r3(n); else delete cur[k];
      }
    }
    if (Object.keys(cur).length) P[name] = cur; else delete P[name];
    return P[name] || null;
  }

  // 配對一定要對稱寫兩邊。只寫單邊的話，從另一條點進去看不到配對，
  // 而稽核又會報「單邊配對」——使用者會以為是 bug。
  function setPair(state, a, b) {
    if (!a) return false;
    const P = propsRW(state);
    // 舊的對手（不論從哪一邊記的）先斷乾淨，否則會留下三角關係
    const unlink = n => {
      const old = (P[n] || {}).pair;
      if (old) set(state, old, { pair: '' });
      set(state, n, { pair: '' });
      for (const k of Object.keys(P)) if (P[k] && P[k].pair === n) set(state, k, { pair: '' });
    };
    unlink(a);
    if (!b || b === a) return true;
    unlink(b);
    set(state, a, { pair: b });
    set(state, b, { pair: a });
    return true;
  }

  // ---------------- 3. 改名 ----------------
  // 六個陣列 + 屬性表 + 對面的 pair 反向參照，一次到位。
  // 回改動的參照數（不含屬性表）。呼叫端負責 hist() 與重名檢查。
  function rename(state, from, to) {
    if (!from || !to || from === to) return 0;
    let n = 0;
    for (const r of refs(state)) if (r.obj.net === from) { r.obj.net = to; n++; }
    const P = propsRW(state);
    if (P[from]) { P[to] = Object.assign({}, P[to] || {}, P[from]); delete P[from]; }
    for (const k of Object.keys(P)) if (P[k] && P[k].pair === from) P[k].pair = to;
    if (state.highlightNet === from) state.highlightNet = to;
    return n;
  }

  // 板上已經沒有的 net 的屬性。不自動刪：使用者可能只是暫時把走線刪光在重繞，
  // 屬性刪掉就回不來了。回清單讓 UI 問。
  function stale(state) {
    const live = new Set(names(state));
    return Object.keys(propsOf(state)).filter(n => !live.has(n)).sort();
  }
  function gc(state) {
    const rm = stale(state);
    const P = propsRW(state);
    for (const n of rm) delete P[n];
    // 反向 pair 指向被刪的，也要斷乾淨
    for (const k of Object.keys(P)) if (P[k] && rm.indexOf(P[k].pair) >= 0) set(state, k, { pair: '' });
    return rm;
  }

  // ---------------- 4. 阻抗（全站唯一一份 IPC-2141）----------------
  // ±10% 等級的近似式。正式設計用板廠的場型解算器；這裡的用途是
  // 「線寬離目標差多少、該改成多少」，不是拿去下單的數字。
  function impedance(kind, w, h, t, er, s) {
    if (!(w > 0 && h > 0 && t > 0 && er > 1)) return null;
    const ms = 87 / Math.sqrt(er + 1.41) * Math.log(5.98 * h / (0.8 * w + t));
    const sl = 60 / Math.sqrt(er) * Math.log(1.9 * (2 * h + t) / (0.8 * w + t));
    if (kind === 'microstrip') return { z0: ms };
    if (kind === 'stripline') return { z0: sl };
    if (kind === 'diff-microstrip') {
      if (!(s > 0)) return null;
      return { z0: ms, zdiff: 2 * ms * (1 - 0.48 * Math.exp(-0.96 * s / h)) };
    }
    if (kind === 'diff-stripline') {
      if (!(s > 0)) return null;
      return { z0: sl, zdiff: 2 * sl * (1 - 0.347 * Math.exp(-2.9 * s / h)) };
    }
    return null;
  }

  // 目標 Z0 → 線寬（二分；Z0 對 w 單調遞減）。
  // 目標落在有效範圍外就回 null，不回邊界值——回 0.02 或 10 會讓使用者照著改，
  // 改完發現還是不對，卻不知道問題出在疊層。
  //
  // 搜尋範圍不是「隨便給一個大區間」：IPC-2141 的兩條式子都是曲線擬合，
  // 線太寬時 ln 的引數會掉到 1 以下、算出負阻抗。照官方標示的適用範圍設上限：
  //   microstrip 0.1 ≤ w/h ≤ 3.0；stripline w ≤ 0.35·(2h+t)。
  // 超出範圍寧可說「這個疊層在近似式的有效範圍內做不到」，
  // 也不要回一個公式已經失效的數字。
  const W_LO = 0.02;
  function widthRange(kind, h, t) {
    const lo = Math.max(W_LO, 0.1 * h);
    const hi = kind === 'stripline' ? 0.35 * (2 * h + t) : 3 * h;
    return hi > lo ? { lo, hi } : null;
  }
  function widthFor(kind, z0, h, t, er) {
    if (!(z0 > 0)) return null;
    const rg = widthRange(kind, h, t);
    if (!rg) return null;
    const f = w => { const r = impedance(kind, w, h, t, er); return r ? r.z0 : null; };
    const zHi = f(rg.lo), zLo = f(rg.hi);   // 窄線＝高阻抗
    if (zHi == null || zLo == null || !(zLo > 0)) return null;
    if (z0 > zHi || z0 < zLo) return null;
    let lo = rg.lo, hi = rg.hi;
    for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; if (f(mid) > z0) lo = mid; else hi = mid; }
    return r3((lo + hi) / 2);
  }

  // 目標 Zdiff → 邊到邊間距（線寬固定；Zdiff 對 s 單調遞增）
  const S_LO = 0.02, S_HI = 5;
  function gapFor(kind, zdiff, w, h, t, er) {
    if (!(zdiff > 0)) return null;
    const dk = kind === 'stripline' ? 'diff-stripline' : 'diff-microstrip';
    const f = s => { const r = impedance(dk, w, h, t, er, s); return r ? r.zdiff : null; };
    const a = f(S_LO), b = f(S_HI);
    if (a == null || b == null) return null;
    if (zdiff < a || zdiff > b) return null;
    let lo = S_LO, hi = S_HI;
    for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; if (f(mid) < zdiff) lo = mid; else hi = mid; }
    return r3((lo + hi) / 2);
  }

  // ---------------- 5. 量一對 net 實際走出來的樣子 ----------------
  // 跟 NetRules 的差分對檢查刻意分開：NetRules 問的是「有沒有照『指定的』gap 走」
  // （分類 + 報違規），這裡問的是「實際走出來的 gap 是多少」（量測，拿去算 Zdiff）。
  // 一個是判定、一個是輸入，共用會讓兩邊都得遷就對方。gap 定義相同（邊到邊），
  // netmodel.test.js 有一條把兩邊釘在同一塊合成板上對照。
  //
  // 耦合比例低於 30% 就回 gap=null：從沒有耦合的兩條線硬算 Zdiff，
  // 只會給出一個看起來很精確的假數字。
  const SAMPLE = 0.5;
  function ptSeg(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy;
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    const u = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / l2));
    return Math.hypot(px - (x1 + u * dx), py - (y1 + u * dy));
  }
  const segLen = t => Math.hypot(t.x2 - t.x1, t.y2 - t.y1);
  function netLength(state, net, layer) {
    let L = 0;
    for (const t of (state.traces || [])) {
      if (t.net !== net) continue;
      if (layer && (t.layer || 'F.Cu') !== layer) continue;
      L += segLen(t);
    }
    return L;
  }
  function medianOf(a) {
    if (!a.length) return null;
    const s = a.slice().sort((x, y) => x - y);
    const m = s.length >> 1;
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }

  function pairGeometry(state, a, b) {
    const live = (state.traces || []).filter(t => segLen(t) > 1e-9);
    const A = live.filter(t => t.net === a), B = live.filter(t => t.net === b);
    const out = {
      gap: null, coupled: 0, layer: '', wA: 0, wB: 0,
      lenA: r3(netLength(state, a)), lenB: r3(netLength(state, b)), skew: 0, samples: 0
    };
    out.skew = r3(Math.abs(out.lenA - out.lenB));
    if (!A.length || !B.length) return out;
    // 主要層＝該 net 走最長的那一層；跨層的差分對本來就不該用單一 Zdiff 描述
    const byLayer = {};
    for (const t of A) { const l = t.layer || 'F.Cu'; byLayer[l] = (byLayer[l] || 0) + segLen(t); }
    const layer = Object.keys(byLayer).sort((x, y) => byLayer[y] - byLayer[x])[0];
    const As = A.filter(t => (t.layer || 'F.Cu') === layer), Bs = B.filter(t => (t.layer || 'F.Cu') === layer);
    if (!As.length || !Bs.length) return out;
    out.layer = layer;
    out.wA = r3(medianOf(As.map(t => t.width || 0.3)));
    out.wB = r3(medianOf(Bs.map(t => t.width || 0.3)));
    const halfSum = (out.wA + out.wB) / 2;
    // 耦合窗口綁線寬（3 倍線寬、下限 0.3mm）。綁一個固定 mm 值的話，
    // 細線的板子會把「只是剛好經過附近」的線段算成耦合，耦合比例就失去意義。
    const win = Math.max(0.3, 3 * Math.max(out.wA, out.wB));
    const gaps = [];
    let total = 0, near = 0;
    for (const s of As) {
      const L = segLen(s);
      const n = Math.max(1, Math.ceil(L / SAMPLE));
      for (let i = 0; i < n; i++) {
        const u = (i + 0.5) / n;
        const px = s.x1 + (s.x2 - s.x1) * u, py = s.y1 + (s.y2 - s.y1) * u;
        let d = Infinity;
        for (const o of Bs) d = Math.min(d, ptSeg(px, py, o.x1, o.y1, o.x2, o.y2));
        const g = d - halfSum;
        total += L / n;
        if (g <= win) { near += L / n; gaps.push(g); }
      }
    }
    out.samples = gaps.length;
    out.coupled = total > 0 ? r3(near / total) : 0;
    if (out.coupled >= 0.3 && gaps.length) out.gap = r3(medianOf(gaps));
    return out;
  }

  // ---------------- 6. 稽核（併入 runDrc）----------------
  // opts.stackup 可注入（node 測用）；沒給就跟 Stackup 要。
  function audit(state, opts) {
    opts = opts || {};
    const res = [];
    if (!state) return res;
    const all = names(state);
    const live = new Set(all);
    const P = propsOf(state);
    const SK = (typeof window !== 'undefined') && window.Stackup;
    const stack = opts.stackup || (SK ? SK.load(state) : null);
    const geomFor = layer => {
      if (!stack || !SK) return null;
      try { return SK.geomFor(stack, state, layer); } catch (e) { return null; }
    };

    // (1) 單端目標阻抗 vs 實際線寬。**依層分組**：同一條 net 換到內層，
    //     公式從 microstrip 變 stripline，同樣線寬阻抗差得很多。
    for (const name of all) {
      const net = get(state, name, all);
      if (!(net.z0 > 0)) continue;
      const segs = (state.traces || []).filter(t => t.net === name && segLen(t) > 1e-9);
      if (!segs.length) continue;
      const layers = [...new Set(segs.map(t => t.layer || 'F.Cu'))];
      for (const layer of layers) {
        const g = geomFor(layer);
        if (!g) { res.push({ type: 'info', message: T('nm_drc_nogeom', { net: name, layer }) }); continue; }
        const widths = [...new Set(segs.filter(t => (t.layer || 'F.Cu') === layer).map(t => r3(t.width || 0.3)))];
        for (const w of widths) {
          const z = impedance(g.kind, w, g.h, g.t, g.er);
          if (!z) continue;
          const err = (z.z0 - net.z0) / net.z0 * 100;
          if (Math.abs(err) <= net.ztol + 1e-9) continue;
          const want = widthFor(g.kind, net.z0, g.h, g.t, g.er);
          res.push({
            type: 'warning',
            message: T('nm_drc_z0', {
              net: name, layer, w: w.toFixed(3), z: z.z0.toFixed(1), target: net.z0,
              tol: net.ztol, err: (err > 0 ? '+' : '') + err.toFixed(1),
              want: want == null ? T('nm_unreachable') : want.toFixed(3)
            })
          });
        }
      }
    }

    // (2) 差動目標阻抗。gap 是量出來的；量不到（沒耦合）就說量不到，不硬算。
    const done = new Set();
    for (const name of all) {
      const net = get(state, name, all);
      if (!(net.zdiff > 0) || !net.pair) continue;
      const key = [name, net.pair].sort().join('|');
      if (done.has(key)) continue;
      done.add(key);
      if (!live.has(net.pair)) continue;   // (3) 會報
      const pg = pairGeometry(state, name, net.pair);
      if (!pg.layer) continue;
      if (pg.gap == null) {
        res.push({ type: 'warning', message: T('nm_drc_nocouple', { a: name, b: net.pair, pct: Math.round(pg.coupled * 100) }) });
        continue;
      }
      const g = geomFor(pg.layer);
      if (!g) { res.push({ type: 'info', message: T('nm_drc_nogeom', { net: name, layer: pg.layer }) }); continue; }
      const dk = g.kind === 'stripline' ? 'diff-stripline' : 'diff-microstrip';
      const w = (pg.wA + pg.wB) / 2;
      const z = impedance(dk, w, g.h, g.t, g.er, pg.gap);
      if (!z || !(z.zdiff > 0)) continue;
      const err = (z.zdiff - net.zdiff) / net.zdiff * 100;
      if (Math.abs(err) <= net.ztol + 1e-9) continue;
      const wantGap = gapFor(g.kind, net.zdiff, w, g.h, g.t, g.er);
      res.push({
        type: 'warning',
        message: T('nm_drc_zdiff', {
          a: name, b: net.pair, layer: pg.layer, gap: pg.gap.toFixed(3), w: r3(w).toFixed(3),
          z: z.zdiff.toFixed(1), target: net.zdiff, tol: net.ztol,
          err: (err > 0 ? '+' : '') + err.toFixed(1),
          want: wantGap == null ? T('nm_unreachable') : wantGap.toFixed(3)
        })
      });
    }

    // (3) 配對完整性：指到板上沒有的 net / 對面沒有指回來
    for (const name of Object.keys(P).sort()) {
      const want = (P[name] || {}).pair;
      if (!want) continue;
      if (!live.has(name)) continue;                       // 屬性過期由 (4) 講
      if (!live.has(want)) { res.push({ type: 'warning', message: T('nm_drc_pair_gone', { net: name, pair: want }) }); continue; }
      const back = (P[want] || {}).pair;
      if (back !== name) res.push({ type: 'warning', message: T('nm_drc_pair_oneway', { net: name, pair: want, back: back || '—' }) });
    }

    // (4) 過期屬性：板上已經沒有這條 net 了
    const st = stale(state);
    if (st.length) res.push({ type: 'info', message: T('nm_drc_stale', { n: st.length, nets: st.slice(0, 5).join(', ') }) });

    return res;
  }

  // 面板用的摘要列（net 名 + 有沒有設目標 + 配對）
  function summary(state) {
    const all = names(state);
    return all.map(n => get(state, n, all));
  }

  return {
    refs, names, get, set, setPair, pairOf, autoPair, split,
    rename, stale, gc, summary,
    impedance, widthFor, gapFor, pairGeometry, netLength, audit,
    FIELDS
  };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = window.NetModel;
