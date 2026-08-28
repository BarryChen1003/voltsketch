/**
 * spice-sweep.js — 參數掃描與蒙地卡羅（window.SpiceSweep）
 *
 * 「這個電路照設計值會動」跟「一整批用有公差的料做出來也會動」是兩件事。
 * 這支跑第二件：把元件值換掉，重跑，看那個你在乎的數字散成什麼樣子。
 *
 * 三條規矩：
 *   1. **可重現**。亂數走自己的種子產生器，同一個 seed 永遠同一批樣本。
 *      拿 Math.random 的話，同一張圖每次跑出不同結論，那種結果沒有人能拿去做決定。
 *   2. **不改原始網表**。每一輪都在副本上換值；原始資料一個位元組都不動。
 *   3. **不算統計顯著性**。這裡只回樣本、分位數與通過率。
 *      蒙地卡羅的樣本不是獨立實驗，把它講成「95% 信心」是誤導。
 *
 * 分布：'uniform'（公差內均勻）與 'gauss'（公差＝3σ，截斷在 ±公差）。
 * 3σ 是業界對「公差」最常見的解讀；截斷是因為超出標示公差的料本來就該被篩掉。
 *
 * 純函式：求解器由呼叫端注入（run(netlist)→結果），所以 node 測得到、
 * 也可以拿假的求解器測掃描邏輯本身。
 */
window.SpiceSweep = (function () {
  'use strict';

  const isNum = v => typeof v === 'number' && isFinite(v);

  /**
   * 種子亂數（mulberry32）。挑它的理由：短、夠均勻、而且**同一個種子跨瀏覽器同一串**——
   * 拿 Math.random 的話同一張圖每次結論都不一樣。
   */
  function rng(seed) {
    let a = (seed >>> 0) || 0x9e3779b9;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** Box-Muller，取一個標準常態；截斷在 ±clip σ 之內（超出就重抽） */
  function gauss(r, clip) {
    const lim = clip == null ? 3 : clip;
    for (let i = 0; i < 64; i++) {
      const u = Math.max(1e-12, r()), v = r();
      const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
      if (Math.abs(z) <= lim) return z;
    }
    return 0;   // 抽不到就回中心值，不要卡在迴圈裡
  }

  /** 等比數列（元件值掃描用；電阻電容按十倍頻掃比線性有意義） */
  function logSpace(from, to, n) {
    if (!(from > 0) || !(to > 0) || !(n > 1)) return [];
    const out = [];
    const k = Math.log(to / from) / (n - 1);
    for (let i = 0; i < n; i++) out.push(from * Math.exp(k * i));
    return out;
  }
  function linSpace(from, to, n) {
    if (!isNum(from) || !isNum(to) || !(n > 1)) return [];
    const out = [];
    for (let i = 0; i < n; i++) out.push(from + (to - from) * i / (n - 1));
    return out;
  }

  // 副本 + 換值。id 對不到就回 null，讓呼叫端知道是設定寫錯而不是結果不好看。
  function withValues(netlist, values) {
    const ids = new Set(Object.keys(values || {}));
    const out = [];
    for (const e of (netlist || [])) {
      const id = String(e.id != null ? e.id : '');
      if (id && ids.has(id)) { out.push(Object.assign({}, e, { value: values[id] })); ids.delete(id); }
      else out.push(e);
    }
    return ids.size ? null : out;
  }

  /**
   * 參數掃描：一個元件的值走一串，每個值跑一次。
   * spec: { id, values:[...] } 或 { id, from, to, steps, scale:'log'|'lin' }
   * run:  (netlist) => 任意結果
   * metric: (結果, 值) => 數字（要比較的那個量）
   * 回 { ok, points:[{value, metric, result}], failed:[{value, why}] }
   */
  function sweep(netlist, spec, run, metric) {
    const res = { ok: false, reason: '', points: [], failed: [] };
    if (!netlist || !spec || !spec.id || typeof run !== 'function') { res.reason = 'badArgs'; return res; }
    let vals = Array.isArray(spec.values) ? spec.values.slice() : null;
    if (!vals) {
      const n = spec.steps | 0;
      vals = (spec.scale === 'log') ? logSpace(spec.from, spec.to, n) : linSpace(spec.from, spec.to, n);
    }
    vals = vals.filter(isNum);
    if (!vals.length) { res.reason = 'noValues'; return res; }
    if (vals.length > 500) { res.reason = 'tooMany'; return res; }

    for (const v of vals) {
      const nl = withValues(netlist, { [spec.id]: v });
      if (!nl) { res.reason = 'noSuchElement:' + spec.id; return res; }
      let r;
      try { r = run(nl); } catch (e) { res.failed.push({ value: v, why: 'threw' }); continue; }
      if (!r || r.converged === false) { res.failed.push({ value: v, why: 'notConverged' }); continue; }
      const m = metric ? metric(r, v) : null;
      res.points.push({ value: v, metric: isNum(m) ? m : null, result: r });
    }
    res.ok = res.points.length > 0;
    if (!res.ok && !res.reason) res.reason = 'allFailed';
    return res;
  }

  /**
   * 蒙地卡羅：一次抽一組元件值，跑 n 輪。
   * parts: [{ id, nominal, tol, dist:'uniform'|'gauss' }]，tol 是比例（0.01 = ±1%）
   * 回 { ok, runs, samples:[{values, metric}], stats, failed }
   */
  function monteCarlo(netlist, parts, run, metric, opts) {
    opts = Object.assign({ runs: 100, seed: 1 }, opts || {});
    const res = { ok: false, reason: '', samples: [], failed: [], stats: null, runs: 0, seed: opts.seed };
    if (!netlist || !Array.isArray(parts) || !parts.length || typeof run !== 'function') { res.reason = 'badArgs'; return res; }
    const runs = Math.max(1, Math.min(5000, opts.runs | 0 || 100));
    for (const p of parts) {
      if (!p || !p.id || !isNum(p.nominal) || !isNum(p.tol) || p.tol < 0) { res.reason = 'badPart:' + (p && p.id); return res; }
    }
    const r = rng(opts.seed);

    for (let i = 0; i < runs; i++) {
      const values = {};
      for (const p of parts) {
        const dev = (p.dist === 'gauss') ? gauss(r) / 3 : (r() * 2 - 1);   // gauss：公差＝3σ
        values[p.id] = p.nominal * (1 + p.tol * dev);
      }
      const nl = withValues(netlist, values);
      if (!nl) { res.reason = 'noSuchElement'; return res; }
      let out;
      try { out = run(nl); } catch (e) { res.failed.push({ i, why: 'threw' }); continue; }
      if (!out || out.converged === false) { res.failed.push({ i, why: 'notConverged' }); continue; }
      const m = metric ? metric(out, values) : null;
      res.samples.push({ i, values, metric: isNum(m) ? m : null });
    }
    res.runs = runs;
    const ms = res.samples.map(s => s.metric).filter(isNum);
    res.stats = describe(ms);
    res.ok = res.samples.length > 0;
    if (!res.ok && !res.reason) res.reason = 'allFailed';
    return res;
  }

  /**
   * 樣本統計。**刻意不給信心區間**：蒙地卡羅的樣本是同一個模型的重複求解，
   * 不是獨立的實驗；把它講成「95% 信心」是拿模擬的精度冒充現實的把握。
   * 回分位數與通過率就好，那些是樣本本身講得出來的事。
   */
  function describe(values) {
    const xs = (values || []).filter(isNum).slice().sort((a, b) => a - b);
    if (!xs.length) return null;
    const q = p => {
      const idx = (xs.length - 1) * p;
      const lo = Math.floor(idx), hi = Math.ceil(idx);
      return lo === hi ? xs[lo] : xs[lo] + (xs[hi] - xs[lo]) * (idx - lo);
    };
    const n = xs.length;
    const mean = xs.reduce((a, b) => a + b, 0) / n;
    const varr = n > 1 ? xs.reduce((a, b) => a + (b - mean) * (b - mean), 0) / (n - 1) : 0;
    return {
      n, min: xs[0], max: xs[n - 1], mean, sd: Math.sqrt(varr),
      p1: q(0.01), p50: q(0.5), p99: q(0.99), q1: q(0.25), q3: q(0.75)
    };
  }

  /** 落在 [lo, hi] 之內的比例（良率）。界線任一邊給 null 代表不限。 */
  function yieldWithin(values, lo, hi) {
    const xs = (values || []).filter(isNum);
    if (!xs.length) return null;
    let n = 0;
    for (const v of xs) {
      if (isNum(lo) && v < lo) continue;
      if (isNum(hi) && v > hi) continue;
      n++;
    }
    return { pass: n, total: xs.length, ratio: n / xs.length };
  }

  return { rng, gauss, logSpace, linSpace, withValues, sweep, monteCarlo, describe, yieldWithin };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = window.SpiceSweep;
