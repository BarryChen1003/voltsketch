/**
 * spice-measure.js — 波形探針、游標量測與自動量測（window.SpiceMeasure）
 *
 * 波形畫得出來，但「這一點是多少伏」「上升時間多久」「−3dB 在哪」只能用眼睛估。
 * 這支把那些讀數變成算出來的數字。
 *
 * 兩條界線，寫在最前面免得被當成示波器：
 *   1. **只算取樣點之間的線性內插**。求解器給的是離散點，兩點之間真正的波形
 *      這裡不知道。所以上升時間之類的量測，精度上限就是取樣間隔——
 *      量出來的數字附帶 `samples` 與 `dt`，呼叫端要判斷夠不夠細。
 *   2. **量不出來就回 null，不回 0**。「找不到 10% 交越點」與「上升時間是 0」
 *      是兩件完全不同的事，混在一起會讓使用者以為訊號是理想方波。
 *
 * 純函式，node 測得到（spice-measure.test.js）。
 */
window.SpiceMeasure = (function () {
  'use strict';

  const isNum = v => typeof v === 'number' && isFinite(v);

  /**
   * 在遞增的 xs 上找 x 的位置並線性內插 ys。
   * 超出範圍回 null（不外插——外插出來的數字看起來一樣真，但完全是編的）。
   */
  function interp(xs, ys, x) {
    if (!xs || !ys || xs.length < 2 || xs.length !== ys.length) return null;
    if (!isNum(x) || x < xs[0] || x > xs[xs.length - 1]) return null;
    // 二分找區間（取樣點可能上萬個，線性掃描會讓游標拖起來卡）
    let lo = 0, hi = xs.length - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (xs[mid] <= x) lo = mid; else hi = mid; }
    const x0 = xs[lo], x1 = xs[hi];
    if (x1 === x0) return ys[lo];
    const u = (x - x0) / (x1 - x0);
    return ys[lo] + (ys[hi] - ys[lo]) * u;
  }

  /** 探針：某個時間點上，若干條訊號各是多少。回 {t, values:{name:v}} */
  function probe(res, t, names) {
    const out = { t, values: {} };
    if (!res || !res.t || !res.nodes) return out;
    const list = names && names.length ? names : Object.keys(res.nodes);
    for (const n of list) out.values[n] = interp(res.t, res.nodes[n], t);
    return out;
  }

  /**
   * 游標量測：兩個游標之間的差。
   * 回 { dt, dv:{name:Δv}, freq }；freq＝1/dt（dt 為 0 時回 null，不回 Infinity）。
   */
  function cursors(res, t1, t2, names) {
    const a = probe(res, t1, names), b = probe(res, t2, names);
    const dt = t2 - t1;
    const dv = {};
    for (const n of Object.keys(a.values)) {
      const va = a.values[n], vb = b.values[n];
      dv[n] = (va == null || vb == null) ? null : vb - va;
    }
    return { a, b, dt, dv, freq: Math.abs(dt) > 0 ? 1 / Math.abs(dt) : null };
  }

  // ---------------- 基本統計 ----------------
  function stats(ys) {
    if (!ys || !ys.length) return null;
    let min = Infinity, max = -Infinity, sum = 0, sq = 0, n = 0;
    for (const v of ys) {
      if (!isNum(v)) continue;
      if (v < min) min = v;
      if (v > max) max = v;
      sum += v; sq += v * v; n++;
    }
    if (!n) return null;
    return { min, max, pp: max - min, avg: sum / n, rms: Math.sqrt(sq / n), n };
  }

  // 交越點：ys 第一次穿過 level 的 x（線性內插）。dir: 1=上升、-1=下降、0=不限。
  function crossing(xs, ys, level, dir, fromIndex) {
    if (!xs || !ys || xs.length !== ys.length) return null;
    for (let i = (fromIndex || 0) + 1; i < ys.length; i++) {
      const a = ys[i - 1], b = ys[i];
      if (!isNum(a) || !isNum(b)) continue;
      const up = a < level && b >= level, down = a > level && b <= level;
      if ((dir > 0 && !up) || (dir < 0 && !down) || (!dir && !up && !down)) continue;
      if (b === a) return { x: xs[i], i };
      const u = (level - a) / (b - a);
      return { x: xs[i - 1] + (xs[i] - xs[i - 1]) * u, i };
    }
    return null;
  }

  /**
   * 上升時間（10%→90%）。level 以整段的 min/max 為基準。
   * 找不到交越點回 null——不是 0。
   */
  function riseTime(xs, ys, lo, hi) {
    const s = stats(ys);
    if (!s || s.pp === 0) return null;
    const a = s.min + s.pp * (lo == null ? 0.1 : lo);
    const b = s.min + s.pp * (hi == null ? 0.9 : hi);
    const c1 = crossing(xs, ys, a, 1, 0);
    if (!c1) return null;
    const c2 = crossing(xs, ys, b, 1, c1.i - 1);
    if (!c2) return null;
    return c2.x - c1.x;
  }

  function fallTime(xs, ys, lo, hi) {
    const s = stats(ys);
    if (!s || s.pp === 0) return null;
    const b = s.min + s.pp * (hi == null ? 0.9 : hi);
    const a = s.min + s.pp * (lo == null ? 0.1 : lo);
    const c1 = crossing(xs, ys, b, -1, 0);
    if (!c1) return null;
    const c2 = crossing(xs, ys, a, -1, c1.i - 1);
    if (!c2) return null;
    return c2.x - c1.x;
  }

  /**
   * 週期與頻率：取中位準的**連續兩次上升交越**。
   * 只找到一次交越就回 null——一個週期都沒走完的波形沒有頻率可言。
   */
  function period(xs, ys) {
    const s = stats(ys);
    if (!s || s.pp === 0) return null;
    const mid = (s.min + s.max) / 2;
    const c1 = crossing(xs, ys, mid, 1, 0);
    if (!c1) return null;
    const c2 = crossing(xs, ys, mid, 1, c1.i);
    if (!c2) return null;
    return c2.x - c1.x;
  }
  function frequency(xs, ys) { const p = period(xs, ys); return p && p > 0 ? 1 / p : null; }

  /** 責任週期：高於中位準的時間佔一個週期的比例（回 0..1） */
  function dutyCycle(xs, ys) {
    const s = stats(ys);
    if (!s || s.pp === 0) return null;
    const mid = (s.min + s.max) / 2;
    const up = crossing(xs, ys, mid, 1, 0);
    if (!up) return null;
    const down = crossing(xs, ys, mid, -1, up.i);
    if (!down) return null;
    const up2 = crossing(xs, ys, mid, 1, down.i);
    if (!up2) return null;
    const T = up2.x - up.x;
    return T > 0 ? (down.x - up.x) / T : null;
  }

  /** 過衝：最大值超過穩態（取最後 10% 的平均）的比例 */
  function overshoot(xs, ys) {
    const s = stats(ys);
    if (!s) return null;
    const tailFrom = Math.max(0, Math.floor(ys.length * 0.9));
    const tail = stats(ys.slice(tailFrom));
    if (!tail || tail.avg === 0) return null;
    const settle = tail.avg;
    const over = s.max - settle;
    return over <= 0 ? 0 : over / Math.abs(settle);
  }

  /** 一次算一整組（波形面板直接用） */
  function summary(xs, ys) {
    const s = stats(ys);
    if (!s) return null;
    return {
      min: s.min, max: s.max, pp: s.pp, avg: s.avg, rms: s.rms,
      rise: riseTime(xs, ys), fall: fallTime(xs, ys),
      period: period(xs, ys), freq: frequency(xs, ys),
      duty: dutyCycle(xs, ys), overshoot: overshoot(xs, ys),
      samples: s.n, dt: (xs && xs.length > 1) ? (xs[xs.length - 1] - xs[0]) / (xs.length - 1) : null
    };
  }

  // ---------------- AC ----------------
  const dB = v => (v > 0 ? 20 * Math.log10(v) : null);

  /**
   * −3dB 頻率：以**通帶最大增益**為基準往下 3dB 的第一個交越。
   * 用「頻率最低那一點」當基準是錯的：帶通與高通的低頻端本來就衰減，
   * 那樣會量出一個不存在的轉角。
   * 回 { f, gain, refGain } 或 null。
   */
  function cutoff(acRes, name, opts) {
    opts = opts || {};
    if (!acRes || !acRes.f || !acRes.nodes || !acRes.nodes[name]) return null;
    const f = acRes.f, mag = acRes.nodes[name].mag;
    if (!f || f.length < 2) return null;
    let ref = -Infinity;
    for (const m of mag) if (isNum(m) && m > ref) ref = m;
    if (!(ref > 0)) return null;
    const target = ref / Math.SQRT2;                    // −3dB
    const dir = opts.dir === 'up' ? 1 : -1;             // 預設找往下掉的那個轉角
    const c = crossing(f, mag, target, dir, 0);
    if (!c) return null;
    return { f: c.x, gain: target, refGain: ref, refdB: dB(ref) };
  }

  /** 某個頻率下的增益（線性與 dB）與相位 */
  function gainAt(acRes, name, freq) {
    if (!acRes || !acRes.nodes || !acRes.nodes[name]) return null;
    const m = interp(acRes.f, acRes.nodes[name].mag, freq);
    const p = interp(acRes.f, acRes.nodes[name].phase, freq);
    if (m == null) return null;
    return { f: freq, mag: m, dB: dB(m), phase: p };
  }

  return { interp, probe, cursors, stats, crossing, riseTime, fallTime, period, frequency, dutyCycle, overshoot, summary, cutoff, gainAt, dB };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = window.SpiceMeasure;
