/**
 * pcb-arc.js — 圓弧幾何（真圓弧走線的地基）
 *
 * 為什麼要有這一支：目前的導角（Mfg.Mitre）輸出的是貝茲取樣後的線段，
 * 下游 DRC／鋪銅／匯出全部吃線段。要做「真圓弧走線」，第一件事是
 * DRC 的距離運算要能處理弧——不然畫得出弧、DRC 卻量錯間距，
 * 那是比沒有圓弧更糟的狀態（看起來合格，實際上不合格）。
 *
 * 精度策略（重點，別當成「隨便取樣」）：
 *   點到弧    給**精確解**：投影到圓上，角度落在弧內就是 |d - r|，否則取兩端點較近者。
 *   弧對線段  沒有簡潔的閉式解。用自適應細分後套既有的 segSegDist，
 *             細分密度由容差反推：弦高誤差 h = r(1 - cos(Δθ/2))，
 *             要 h ≤ tol 就取 Δθ ≤ 2·acos(1 - tol/r)。
 *             也就是**誤差有上界而且算得出來**，不是「取 32 段應該夠」。
 *   回報      每個距離函式都可以回傳 { d, err }，err 是這次細分的弦高上界，
 *             DRC 要判「是否違規」時可以把 err 算進安全邊。
 *
 * 角度慣例：一律逆時針從 a0 到 a1，a1 > a0（順時針的弧在建構時就換方向）。
 *
 * 純函式：不碰 DOM，node 可直接測。測試：pcb-arc.test.js
 */
(function (root) {
  'use strict';

  const TAU = Math.PI * 2;
  const norm = a => { let x = a % TAU; if (x < 0) x += TAU; return x; };

  /**
   * 由圓心 + 起訖點建弧。
   * @param ccw true = 逆時針（Gerber 的 G03）
   * @returns { cx, cy, r, a0, a1, sweep }  a1 一律 > a0，sweep = a1 - a0 ∈ (0, 2π]
   */
  function fromCenter(cx, cy, x1, y1, x2, y2, ccw) {
    const r = Math.hypot(x1 - cx, y1 - cy);
    let a0 = Math.atan2(y1 - cy, x1 - cx);
    let a1 = Math.atan2(y2 - cy, x2 - cx);
    if (ccw) { while (a1 <= a0 + 1e-12) a1 += TAU; }
    else { while (a1 >= a0 - 1e-12) a1 -= TAU; const t = a0; a0 = a1; a1 = t; }
    return { cx, cy, r, a0, a1, sweep: a1 - a0 };
  }

  /**
   * 三點定弧（KiCad 的 kicadArcs 就是這個形式：起點、中點、終點）。
   * 三點共線時回 null——那不是弧，是線段，呼叫端該當線段處理。
   */
  function from3(x1, y1, xm, ym, x2, y2) {
    const d = 2 * (x1 * (ym - y2) + xm * (y2 - y1) + x2 * (y1 - ym));
    if (Math.abs(d) < 1e-12) return null;
    const s1 = x1 * x1 + y1 * y1, sm = xm * xm + ym * ym, s2 = x2 * x2 + y2 * y2;
    const cx = (s1 * (ym - y2) + sm * (y2 - y1) + s2 * (y1 - ym)) / d;
    const cy = (s1 * (x2 - xm) + sm * (x1 - x2) + s2 * (xm - x1)) / d;
    // 中點落在起→訖這條弦的哪一側決定方向。
    // 叉積 (M−S)×(E−S) 的 z 分量為正 ⇒ 中點在弦的左側 ⇒ 這段弧是逆時針。
    const cross = (xm - x1) * (y2 - y1) - (ym - y1) * (x2 - x1);
    return fromCenter(cx, cy, x1, y1, x2, y2, cross > 0);
  }

  const startPt = a => [a.cx + a.r * Math.cos(a.a0), a.cy + a.r * Math.sin(a.a0)];
  const endPt = a => [a.cx + a.r * Math.cos(a.a1), a.cy + a.r * Math.sin(a.a1)];
  const ptAt = (a, t) => {
    const th = a.a0 + (a.a1 - a.a0) * t;
    return [a.cx + a.r * Math.cos(th), a.cy + a.r * Math.sin(th)];
  };
  const length = a => a.r * a.sweep;

  // 角度 θ 是否落在這段弧上
  function contains(a, th) {
    const rel = norm(th - a.a0);
    return rel <= a.sweep + 1e-12;
  }

  /**
   * 需要幾段才能讓弦高誤差 ≤ tol。
   * 弦高 h = r(1 - cos(Δθ/2))。反解 Δθ = 2·acos(1 - tol/r)。
   * tol ≥ r 時一段就夠（整個弧的偏差都比容差小）。
   */
  function segCount(a, tol) {
    const t = tol > 0 ? tol : 1e-3;
    if (!(a.r > 0)) return 1;
    if (t >= a.r) return 1;
    const dth = 2 * Math.acos(1 - t / a.r);
    if (!(dth > 0)) return 512;
    return Math.max(1, Math.min(4096, Math.ceil(a.sweep / dth)));
  }

  // 實際細分後的弦高上界（回報用，讓 DRC 能把誤差算進安全邊）
  function chordError(a, n) {
    if (!(a.r > 0) || n < 1) return 0;
    return a.r * (1 - Math.cos(a.sweep / n / 2));
  }

  /** 細分成折線點列。點數 = segCount + 1。 */
  function toPoints(a, tol) {
    const n = segCount(a, tol);
    const pts = [];
    for (let i = 0; i <= n; i++) pts.push(ptAt(a, i / n));
    return pts;
  }

  /** 細分成線段陣列 [[x1,y1,x2,y2], …]。 */
  function toSegments(a, tol) {
    const p = toPoints(a, tol);
    const out = [];
    for (let i = 1; i < p.length; i++) out.push([p[i - 1][0], p[i - 1][1], p[i][0], p[i][1]]);
    return out;
  }

  // ---- 距離 ----

  const ptSegDist = (px, py, x1, y1, x2, y2) => {
    const dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy;
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * dx + (py - y1) * dy) / l2;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
  };

  const segSegDist = (ax, ay, bx, by, cx, cy, dx, dy) => {
    // 相交就是 0
    const d1 = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    const d2 = (bx - ax) * (dy - ay) - (by - ay) * (dx - ax);
    const d3 = (dx - cx) * (ay - cy) - (dy - cy) * (ax - cx);
    const d4 = (dx - cx) * (by - cy) - (dy - cy) * (bx - cx);
    if (((d1 > 0) !== (d2 > 0)) && ((d3 > 0) !== (d4 > 0))) return 0;
    return Math.min(
      ptSegDist(ax, ay, cx, cy, dx, dy), ptSegDist(bx, by, cx, cy, dx, dy),
      ptSegDist(cx, cy, ax, ay, bx, by), ptSegDist(dx, dy, ax, ay, bx, by));
  };

  /**
   * 點到弧的距離。**精確解**，不細分。
   * 把點的角度投影到圓上：落在弧內就是 |到圓心距離 − r|；
   * 落在弧外就取兩個端點裡較近的那個。
   */
  function ptArcDist(px, py, a) {
    const th = Math.atan2(py - a.cy, px - a.cx);
    const d = Math.hypot(px - a.cx, py - a.cy);
    if (contains(a, th)) return Math.abs(d - a.r);
    const s = startPt(a), e = endPt(a);
    return Math.min(Math.hypot(px - s[0], py - s[1]), Math.hypot(px - e[0], py - e[1]));
  }

  /**
   * 弧到線段的距離。細分後取最小值。
   * @returns { d, err } err 是弦高上界——細分後量到的距離**最多**比真值大 err，
   *          所以 DRC 判違規時用 d + err 才是保守的做法。
   */
  function arcSegDist(a, x1, y1, x2, y2, tol) {
    const segs = toSegments(a, tol);
    let m = Infinity;
    for (const s of segs) m = Math.min(m, segSegDist(s[0], s[1], s[2], s[3], x1, y1, x2, y2));
    return { d: m, err: chordError(a, segs.length) };
  }

  /** 弧到弧的距離。兩邊都細分。 */
  function arcArcDist(a, b, tol) {
    const sa = toSegments(a, tol), sb = toSegments(b, tol);
    let m = Infinity;
    for (const p of sa) for (const q of sb) m = Math.min(m, segSegDist(p[0], p[1], p[2], p[3], q[0], q[1], q[2], q[3]));
    return { d: m, err: chordError(a, sa.length) + chordError(b, sb.length) };
  }

  /**
   * 兩條有寬度的走線（其中至少一條是弧）之間的銅間距。
   * 走線用「膠囊」模型：中心線 ± 半寬，跟 pcb-drc.js 的 capsuleGap 同一套。
   */
  function trackGap(a, b, tol) {
    const ra = (a.width || 0.3) / 2, rb = (b.width || 0.3) / 2;
    let r;
    if (a.arc && b.arc) r = arcArcDist(a.arc, b.arc, tol);
    else if (a.arc) r = arcSegDist(a.arc, b.x1, b.y1, b.x2, b.y2, tol);
    else if (b.arc) r = arcSegDist(b.arc, a.x1, a.y1, a.x2, a.y2, tol);
    else r = { d: segSegDist(a.x1, a.y1, a.x2, a.y2, b.x1, b.y1, b.x2, b.y2), err: 0 };
    return { gap: r.d - ra - rb, err: r.err };
  }

  /** 弧的軸對齊外框（空間索引用）。極值點在 0/90/180/270 度落在弧上時出現。 */
  function bbox(a) {
    const p = [startPt(a), endPt(a)];
    for (let k = 0; k < 4; k++) {
      const th = k * Math.PI / 2;
      if (contains(a, th)) p.push([a.cx + a.r * Math.cos(th), a.cy + a.r * Math.sin(th)]);
    }
    const xs = p.map(q => q[0]), ys = p.map(q => q[1]);
    return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
  }

  const PcbArc = {
    fromCenter, from3, startPt, endPt, ptAt, length, contains,
    segCount, chordError, toPoints, toSegments,
    ptArcDist, arcSegDist, arcArcDist, trackGap, bbox,
    _ptSegDist: ptSegDist, _segSegDist: segSegDist, _norm: norm,
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = PcbArc;
  root.PcbArc = PcbArc;
})(typeof window !== 'undefined' ? window : globalThis);
