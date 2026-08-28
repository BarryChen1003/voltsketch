/**
 * pcb-drag.js — 整條走線拖曳 ＋ 對齊輔助線（window.TraceDrag）
 *
 * ── 拖整條走線 ──
 * 目前只拖得動端點。拖整段的難處不是「怎麼移動」，是**移動之後還連著嗎**：
 *   端點壓在別條走線的端點上 → 那條要跟著拉長（不然接點裂開）
 *   端點壓在 pad 或 via 上     → 那是接線點，跟著移動就是把線從 pad 上扯下來
 *
 * 對第二種，這裡的做法是**補一小段**：pad 那一端留在原地，補一條從 pad 到
 * 新位置的短線。這是業界工具的行為，也是唯一不會偷偷斷線的做法。
 * 「拒絕拖曳」比較安全但沒有用——pad→轉角→pad 是最常見的走線，
 * 那樣等於這個功能對真的板子完全不能用。
 *
 * ── 對齊輔助線 ──
 * 拖東西的時候，跟附近的 pad / 走線端點 / 板框中心對齊了就畫一條線。
 * 只回「對齊了什麼」，畫線是呼叫端的事。
 *
 * 純函式（吃 state 回計畫，不碰 DOM、不改 state），node 可直接測（pcb-drag.test.js）。
 */
window.TraceDrag = (function () {
  'use strict';

  const EPS = 1e-6;
  const layerOf = t => t.layer || 'F.Cu';
  const near = (ax, ay, bx, by, tol) => Math.hypot(ax - bx, ay - by) <= tol;

  /** 這個點是不是壓在 pad 或 via 上（＝接線點，不能跟著整段移動） */
  function anchorAt(state, padAbs, x, y, tol) {
    tol = tol == null ? 0.05 : tol;
    for (const v of (state.vias || [])) {
      if (near(x, y, v.x, v.y, Math.max(tol, (v.od || 0.6) / 2))) return { kind: 'via', x: v.x, y: v.y, net: v.net || '' };
    }
    for (const c of (state.components || [])) {
      for (const p of (c.pads || [])) {
        if (p.cu === false) continue;
        const a = padAbs ? padAbs(c, p) : { x: p.x, y: p.y };
        if (near(x, y, a.x, a.y, Math.max(tol, Math.max(p.w || 0.5, p.h || 0.5) / 2))) {
          return { kind: 'pad', x: a.x, y: a.y, net: p.net || '' };
        }
      }
    }
    return null;
  }

  /**
   * 拖曳計畫。**只算不動**——套用是 apply 的事，這樣同一份計畫可以先拿去驗、再套用。
   * 回 {
   *   ok, reason,
   *   move:  要整段移動的走線（就是被拖的那條）
   *   stretch: [{trace, end}] 共用端點、要跟著拉長的鄰居
   *   stubs:   [{x, y, end}] 壓在 pad/via 上、要補一小段的端點
   * }
   */
  function plan(state, padAbs, trace, opts) {
    opts = opts || {};
    const tol = opts.tol == null ? 0.05 : opts.tol;
    if (!trace) return { ok: false, reason: 'noTrace', move: null, stretch: [], stubs: [] };
    if (Math.hypot(trace.x2 - trace.x1, trace.y2 - trace.y1) < EPS)
      return { ok: false, reason: 'zeroLength', move: null, stretch: [], stubs: [] };

    const ends = [{ end: 'a', x: trace.x1, y: trace.y1 }, { end: 'b', x: trace.x2, y: trace.y2 }];
    const stretch = [], stubs = [];
    for (const e of ends) {
      // 鄰居：同層、同 net、端點重合的其它走線。跟著拉長就不會裂開。
      for (const t of (state.traces || [])) {
        if (t === trace) continue;
        if (layerOf(t) !== layerOf(trace)) continue;
        if (near(t.x1, t.y1, e.x, e.y, tol)) stretch.push({ trace: t, end: 'a', from: e.end });
        else if (near(t.x2, t.y2, e.x, e.y, tol)) stretch.push({ trace: t, end: 'b', from: e.end });
      }
      // 壓在 pad/via 上：那一端不能移動，改成補一小段接回去
      const anc = anchorAt(state, padAbs, e.x, e.y, tol);
      if (anc) stubs.push({ end: e.end, x: anc.x, y: anc.y, kind: anc.kind });
    }
    return { ok: true, reason: '', move: trace, stretch, stubs };
  }

  /**
   * 套用位移。回 { moved, stretched, added }。
   * 補的短線用跟原線一樣的層/寬/net——它就是原本那條線的一部分，
   * 給不同的屬性會讓 DRC 與匯出把它當成另一件事。
   */
  function apply(state, pl, dx, dy) {
    if (!pl || !pl.ok || !pl.move) return { moved: 0, stretched: 0, added: 0 };
    const t = pl.move;
    // 先記住原本的端點：補線要從「原本壓在 pad 上的位置」拉到新位置
    const before = { x1: t.x1, y1: t.y1, x2: t.x2, y2: t.y2 };
    t.x1 += dx; t.y1 += dy; t.x2 += dx; t.y2 += dy;

    for (const s of pl.stretch) {
      if (s.end === 'a') { s.trace.x1 += dx; s.trace.y1 += dy; }
      else { s.trace.x2 += dx; s.trace.y2 += dy; }
    }

    let added = 0;
    for (const st of pl.stubs) {
      const ax = st.x, ay = st.y;                                  // pad/via 原位（不動）
      const nx = st.end === 'a' ? t.x1 : t.x2, ny = st.end === 'a' ? t.y1 : t.y2;
      if (near(ax, ay, nx, ny, 1e-9)) continue;                    // 沒真的移動就不補
      (state.traces || []).push({
        id: 'trace-stub-' + Date.now() + '-' + ((state.traces || []).length),
        x1: ax, y1: ay, x2: nx, y2: ny,
        width: t.width || 0.3, layer: layerOf(t), net: t.net || '', stub: true
      });
      added++;
    }
    // before 只在補線時用得到；留著回傳讓呼叫端能做「取消拖曳」
    return { moved: 1, stretched: pl.stretch.length, added, before };
  }

  // ---------------- 對齊輔助線 ----------------
  /**
   * 拖曳中的點跟附近有沒有對齊。回 [{axis:'x'|'y', at, kind, d}]，
   * axis='x' 表示「x 座標對齊了」（畫一條垂直線）。
   *
   * 只收**真的對齊**的（差距 ≤ tol），而且一個軸最多回一條（最近的那個）——
   * 一次畫五條輔助線跟沒有輔助線一樣沒用。
   */
  function guides(state, padAbs, pt, opts) {
    opts = opts || {};
    const tol = opts.tol == null ? 0.15 : opts.tol;
    const skip = opts.skip || null;             // 不要跟自己對齊
    const cand = [];
    const add = (x, y, kind) => { cand.push({ x, y, kind }); };

    for (const c of (state.components || [])) {
      add(c.x, c.y, 'comp');
      for (const p of (c.pads || [])) {
        if (p.cu === false) continue;
        const a = padAbs ? padAbs(c, p) : { x: p.x, y: p.y };
        add(a.x, a.y, 'pad');
      }
    }
    for (const v of (state.vias || [])) add(v.x, v.y, 'via');
    for (const t of (state.traces || [])) {
      if (skip && t === skip) continue;
      add(t.x1, t.y1, 'trace'); add(t.x2, t.y2, 'trace');
    }
    add(0, 0, 'center');                        // 板框中心（座標原點）

    let bx = null, by = null;
    for (const c of cand) {
      const dx = Math.abs(c.x - pt.x), dy = Math.abs(c.y - pt.y);
      if (dx <= tol && (!bx || dx < bx.d)) bx = { axis: 'x', at: c.x, kind: c.kind, d: dx };
      if (dy <= tol && (!by || dy < by.d)) by = { axis: 'y', at: c.y, kind: c.kind, d: dy };
    }
    const out = [];
    if (bx) out.push(bx);
    if (by) out.push(by);
    return out;
  }

  /** 對齊後的落點：有輔助線就吸過去（拖曳時真的貼齊，不是只畫線騙人） */
  function snapToGuides(pt, gs) {
    let x = pt.x, y = pt.y;
    for (const g of (gs || [])) { if (g.axis === 'x') x = g.at; else if (g.axis === 'y') y = g.at; }
    return { x, y };
  }

  return { plan, apply, guides, snapToGuides, anchorAt };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = window.TraceDrag;
