/**
 * spice-sweep.test.js — 參數掃描與蒙地卡羅（spice-sweep.js）
 *
 * 這支守三件事：
 *   1. **可重現**。同一個 seed 必須永遠給同一批樣本。做不到的話，
 *      同一張圖每次跑出不同結論，那種結果沒有人能拿去做決定。
 *   2. **不改原始網表**。每一輪都在副本上換值——原始資料被改到的話，
 *      跑完掃描回頭看電路，值已經是最後一輪那組了。
 *   3. **抽出來的值真的落在公差內**。這條測不到的話，公差設 1% 卻抽出 ±50%
 *      也沒人會發現，而結論會變成「這個電路很脆弱」。
 *
 * 求解器用假的：這裡測的是掃描邏輯，不是 MNA（那是 spice.test.js 的事）。
 * 最後一節接真的 Spice 跑一次，證明兩邊接得起來。
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

global.window = {};
const W = require('./spice-sweep.js');

let pass = 0, fail = 0;
function eq(a, b, msg) {
  const okk = JSON.stringify(a) === JSON.stringify(b);
  if (okk) pass++; else { fail++; console.error(`FAIL ${msg}\n  expected ${JSON.stringify(b)}\n  got      ${JSON.stringify(a)}`); }
}
const ok = (v, msg) => eq(!!v, true, msg);
function near(a, b, tol, msg) {
  if (a == null) { fail++; console.error(`FAIL ${msg}  得 null，期望 ${b}`); return; }
  const d = Math.abs(a - b);
  if (d <= tol) pass++; else { fail++; console.error(`FAIL ${msg}\n  ${a} 與 ${b} 差 ${d} > ${tol}`); }
}

// ---- 1. 種子亂數：同種子同結果 ----
{
  const a = W.rng(42), b = W.rng(42), c = W.rng(43);
  const A = [], B = [], C = [];
  for (let i = 0; i < 8; i++) { A.push(a()); B.push(b()); C.push(c()); }
  eq(A, B, '1.1 **同一個 seed 給同一串**（不可重現的模擬沒有人能拿來做決定）');
  ok(JSON.stringify(A) !== JSON.stringify(C), '1.2 不同 seed 給不同串');
  ok(A.every(v => v >= 0 && v < 1), '1.3 值域 [0,1)');
  // 均勻性：8000 抽的平均應該接近 0.5
  const r = W.rng(7); let sum = 0;
  for (let i = 0; i < 8000; i++) sum += r();
  near(sum / 8000, 0.5, 0.02, '1.4 大致均勻');
}

// ---- 2. 常態抽樣：截斷在 ±3σ ----
{
  const r = W.rng(1);
  let mx = 0, sum = 0, n = 20000;
  for (let i = 0; i < n; i++) { const z = W.gauss(r); mx = Math.max(mx, Math.abs(z)); sum += z; }
  ok(mx <= 3 + 1e-9, '2.1 **截斷在 ±3σ**（超出標示公差的料本來就該被篩掉）');
  near(sum / n, 0, 0.03, '2.2 平均約 0');
  ok(W.gauss(W.rng(5), 1) <= 1 + 1e-9, '2.3 截斷值可調');
}

// ---- 3. 數列 ----
{
  eq(W.linSpace(0, 10, 5), [0, 2.5, 5, 7.5, 10], '3.1 等差');
  const lg = W.logSpace(1, 1000, 4);
  near(lg[0], 1, 1e-9, '3.2 等比起點');
  near(lg[1], 10, 1e-9, '3.3 等比中段');
  near(lg[3], 1000, 1e-9, '3.4 等比終點');
  eq(W.logSpace(0, 10, 3), [], '3.5 對數掃不接受 0');
  eq(W.linSpace(0, 1, 1), [], '3.6 至少兩點');
}

// ---- 4. 換值：不可以改到原始網表 ----
{
  const nl = [{ id: 'R1', type: 'R', value: 1000 }, { id: 'C1', type: 'C', value: 1e-6 }];
  const out = W.withValues(nl, { R1: 2000 });
  eq(out[0].value, 2000, '4.1 副本換了值');
  eq(nl[0].value, 1000, '4.2 **原始網表一個位元組都不能動**');
  ok(out[0] !== nl[0], '4.3 是新物件不是同一個');
  eq(out[1], nl[1], '4.4 沒換的沿用同一個物件（不必無謂複製）');
  eq(W.withValues(nl, { NOPE: 1 }), null, '4.5 id 對不到要回 null（是設定寫錯，不是結果不好看）');
}

// ---- 5. 參數掃描 ----
{
  const nl = [{ id: 'R1', type: 'R', value: 1000 }];
  // 假求解器：輸出就是 R 的兩倍，方便對答案
  const run = n => ({ converged: true, v: n[0].value * 2 });
  const r = W.sweep(nl, { id: 'R1', values: [1, 2, 3] }, run, res => res.v);
  eq(r.ok, true, '5.1 成功');
  eq(r.points.map(p => p.metric), [2, 4, 6], '5.2 每個值各跑一次');
  eq(r.points.map(p => p.value), [1, 2, 3], '5.3 值也記著');

  const r2 = W.sweep(nl, { id: 'R1', from: 0, to: 10, steps: 5 }, run, res => res.v);
  eq(r2.points.map(p => p.value), [0, 2.5, 5, 7.5, 10], '5.4 from/to/steps');
  const r3 = W.sweep(nl, { id: 'R1', from: 1, to: 1000, steps: 4, scale: 'log' }, run, res => res.v);
  near(r3.points[1].value, 10, 1e-9, '5.5 對數掃');

  // 不收斂的那幾點要落到 failed，不可以混進 points 當成有效資料
  const flaky = n => n[0].value === 2 ? { converged: false } : { converged: true, v: n[0].value };
  const r4 = W.sweep(nl, { id: 'R1', values: [1, 2, 3] }, flaky, res => res.v);
  eq(r4.points.map(p => p.value), [1, 3], '5.6 **不收斂的不進 points**');
  eq(r4.failed, [{ value: 2, why: 'notConverged' }], '5.7 而且要列出來');
  // 丟例外的也一樣
  const boom = n => { if (n[0].value === 2) throw new Error('x'); return { converged: true, v: 1 }; };
  eq(W.sweep(nl, { id: 'R1', values: [1, 2] }, boom, () => 1).failed, [{ value: 2, why: 'threw' }], '5.8 例外也照實記');

  eq(W.sweep(nl, { id: 'NOPE', values: [1] }, run, () => 1).reason, 'noSuchElement:NOPE', '5.9 元件不存在');
  eq(W.sweep(nl, { id: 'R1', values: [] }, run, () => 1).reason, 'noValues', '5.10 沒有值');
  eq(W.sweep(nl, { id: 'R1', values: new Array(501).fill(1) }, run, () => 1).reason, 'tooMany', '5.11 點數上限');
  eq(W.sweep(null, { id: 'R1' }, run, () => 1).reason, 'badArgs', '5.12 空網表');
}

// ---- 6. 蒙地卡羅 ----
{
  const nl = [{ id: 'R1', type: 'R', value: 1000 }, { id: 'C1', type: 'C', value: 1e-6 }];
  const run = n => ({ converged: true, v: n[0].value });
  const parts = [{ id: 'R1', nominal: 1000, tol: 0.01, dist: 'uniform' }];

  const a = W.monteCarlo(nl, parts, run, r => r.v, { runs: 200, seed: 9 });
  const b = W.monteCarlo(nl, parts, run, r => r.v, { runs: 200, seed: 9 });
  eq(a.samples.map(s => s.metric), b.samples.map(s => s.metric), '6.1 **同 seed 同結果**');
  const c = W.monteCarlo(nl, parts, run, r => r.v, { runs: 200, seed: 10 });
  ok(JSON.stringify(a.samples.map(s => s.metric)) !== JSON.stringify(c.samples.map(s => s.metric)), '6.2 換 seed 換結果');

  // 抽出來的值真的在 ±1% 內
  const outOfBand = a.samples.filter(s => Math.abs(s.metric - 1000) > 10 + 1e-9);
  eq(outOfBand.length, 0, '6.3 **每一個樣本都落在標示公差內**');
  ok(a.stats.max - a.stats.min > 5, '6.4 而且真的有散開（不是每次都抽到標稱值）');
  eq(a.samples.length, 200, '6.5 跑滿 200 輪');
  eq(nl[0].value, 1000, '6.6 原始網表沒被改到');

  // 常態分布：3σ ＝ 公差，所以仍然不會超出 ±1%
  const g = W.monteCarlo(nl, [{ id: 'R1', nominal: 1000, tol: 0.01, dist: 'gauss' }], run, r => r.v, { runs: 500, seed: 3 });
  eq(g.samples.filter(s => Math.abs(s.metric - 1000) > 10 + 1e-9).length, 0, '6.7 常態也不超出公差（公差＝3σ 並截斷）');
  ok(g.stats.sd < a.stats.sd, '6.8 常態比均勻集中（同樣公差下標準差較小）');

  eq(W.monteCarlo(nl, [{ id: 'R1', nominal: 1000 }], run, r => r.v, {}).reason, 'badPart:R1', '6.9 缺公差要擋');
  eq(W.monteCarlo(nl, [], run, r => r.v, {}).reason, 'badArgs', '6.10 沒有元件');
  eq(W.monteCarlo(nl, [{ id: 'NOPE', nominal: 1, tol: 0.1 }], run, r => r.v, { runs: 2 }).reason, 'noSuchElement', '6.11 元件不存在');
}

// ---- 7. 統計與良率 ----
{
  const d = W.describe([1, 2, 3, 4, 5]);
  eq([d.n, d.min, d.max, d.mean, d.p50], [5, 1, 5, 3, 3], '7.1 基本量');
  near(d.sd, Math.sqrt(2.5), 1e-12, '7.2 樣本標準差（n−1）');
  eq(W.describe([]), null, '7.3 空');
  eq(W.describe([1, 'x', null, 3]).n, 2, '7.4 非數字剔除');
  // 刻意不給信心區間
  ok(!('ci' in d) && !('confidence' in d), '7.5 **不給信心區間**（蒙地卡羅的樣本不是獨立實驗）');

  eq(W.yieldWithin([1, 2, 3, 4, 5], 2, 4), { pass: 3, total: 5, ratio: 0.6 }, '7.6 良率');
  eq(W.yieldWithin([1, 2, 3], null, 2).pass, 2, '7.7 只給上界');
  eq(W.yieldWithin([1, 2, 3], 2, null).pass, 2, '7.8 只給下界');
  eq(W.yieldWithin([], 0, 1), null, '7.9 空');
}

// ---- 8. 接真的 Spice：RC 低通的轉角隨 R 掃描而移動 ----
{
  const S = require('./spice.js');
  const M = require('./spice-measure.js');
  const R = 1591.5, C = 1e-7;                       // fc = 1/(2πRC) ≈ 1000Hz
  const netlist = () => ([
    { id: 'V1', type: 'V', nodes: ['in', '0'], value: 0, ac: 1 },
    { id: 'R1', type: 'R', nodes: ['in', 'out'], value: R },
    { id: 'C1', type: 'C', nodes: ['out', '0'], value: C }
  ]);
  // AC 的選項名是 start/stop/points/sweep，而且**電壓源要帶 ac 振幅**。
  // 兩件事任一個弄錯，出來的是一整條 0：圖是平的、−3dB 一律量不到，而且不報錯。
  // 2026-08-28 第一版就是用了不存在的選項名（from/to/ppd），靠預設值誤打誤撞會過——
  // 所以下面 8.1b 明確驗「掃描範圍真的生效」。
  const runAc = nl => S.ac(nl, { start: 10, stop: 100000, points: 40, sweep: 'dec' });
  const base = runAc(netlist());
  ok(base.converged, '8.1 AC 收斂');
  near(base.f[0], 10, 1e-9, '8.1b **起始頻率要是我指定的 10Hz**（選項名寫錯會退回預設值而看不出來）');
  ok(base.f[base.f.length - 1] >= 100000 - 1, '8.1c 終止頻率也要到 100kHz');
  ok(Math.max.apply(null, base.nodes.out.mag) > 0, '8.1d 輸出不可以是一整條 0（沒有 ac 振幅時就會這樣）');
  const fc0 = M.cutoff(base, 'out');
  ok(fc0 != null && Math.abs(fc0.f - 1000) / 1000 < 0.05, `8.2 標稱轉角 ≈1kHz（得 ${fc0 && fc0.f.toFixed(0)}）`);

  // R 加倍 → 轉角減半。這是掃描有沒有真的換到值的證明。
  const sw = W.sweep(netlist(), { id: 'R1', values: [R, 2 * R] }, runAc,
    res => { const c = M.cutoff(res, 'out'); return c ? c.f : null; });
  eq(sw.ok, true, '8.3 掃描成功');
  eq(sw.points.length, 2, '8.4 兩個點');
  const ratio = sw.points[0].metric / sw.points[1].metric;
  near(ratio, 2, 0.1, '8.5 **R 加倍 → 轉角減半**（證明每一輪真的換了值）');

  // 蒙地卡羅：R ±10% → 轉角也該散開約 ±10%
  const mc = W.monteCarlo(netlist(), [{ id: 'R1', nominal: R, tol: 0.1, dist: 'uniform' }], runAc,
    res => { const c = M.cutoff(res, 'out'); return c ? c.f : null; }, { runs: 40, seed: 11 });
  ok(mc.ok && mc.stats, '8.6 蒙地卡羅跑得完');
  ok(mc.stats.max / mc.stats.min > 1.1, '8.7 轉角真的散開了');
  ok(mc.stats.max / mc.stats.min < 1.35, '8.8 而且散開的幅度跟 ±10% 對得上（不是失控）');
}

console.log(`\nspice-sweep.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
