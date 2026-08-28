/**
 * spice-measure.test.js — 波形量測（spice-measure.js）
 *
 * 每一條都對**解析解**比對：正弦的 RMS 就是 A/√2、斜坡的 10–90% 就是 0.8 倍、
 * RC 低通的 −3dB 就在 1/(2πRC)。不對「上次跑出來的數字」比對。
 *
 * 另外釘住兩件「寧可不給數字」的行為：
 *   - 取樣範圍外**不外插**（外插出來的數字看起來一樣真，但完全是編的）
 *   - 量不出來回 **null 不回 0**（「找不到交越點」與「上升時間 0」是兩件事）
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

global.window = {};
const M = require('./spice-measure.js');

let pass = 0, fail = 0;
function eq(a, b, msg) {
  const okk = JSON.stringify(a) === JSON.stringify(b);
  if (okk) pass++; else { fail++; console.error(`FAIL ${msg}\n  expected ${JSON.stringify(b)}\n  got      ${JSON.stringify(a)}`); }
}
const ok = (v, msg) => eq(!!v, true, msg);
function near(a, b, tol, msg) {
  if (a == null) { fail++; console.error(`FAIL ${msg}\n  得 null，期望 ${b}`); return; }
  const d = Math.abs(a - b);
  if (d <= tol) pass++; else { fail++; console.error(`FAIL ${msg}\n  ${a} 與 ${b} 差 ${d} > ${tol}`); }
}
const rel = (a, b, pct, msg) => near(a, b, Math.abs(b) * pct, msg);

// 造波形
function gen(n, f) { const xs = [], ys = []; for (let i = 0; i < n; i++) { const x = i / (n - 1); xs.push(x); ys.push(f(x)); } return { xs, ys }; }

// ---- 1. 內插：線上精確、範圍外不外插 ----
{
  const xs = [0, 1, 2, 3], ys = [0, 10, 20, 30];
  eq(M.interp(xs, ys, 1.5), 15, '1.1 線上精確');
  eq(M.interp(xs, ys, 0), 0, '1.2 端點');
  eq(M.interp(xs, ys, 3), 30, '1.3 另一端');
  eq(M.interp(xs, ys, 3.1), null, '1.4 **範圍外不外插**');
  eq(M.interp(xs, ys, -0.1), null, '1.5 另一側也不外插');
  eq(M.interp(xs, ys, NaN), null, '1.6 NaN');
  eq(M.interp([1], [1], 1), null, '1.7 只有一點無法內插');
  eq(M.interp(xs, [0, 1], 1), null, '1.8 長度不一致');
  // 二分搜尋要在大量取樣點上也對
  const big = gen(10001, x => 3 * x);
  near(M.interp(big.xs, big.ys, 0.3333), 0.9999, 1e-6, '1.9 一萬點也精確');
}

// ---- 2. 統計：對正弦的解析解 ----
{
  const A = 2;
  const { xs, ys } = gen(20001, x => A * Math.sin(2 * Math.PI * x));   // 剛好一個週期
  const s = M.stats(ys);
  near(s.max, A, 1e-3, '2.1 峰值');
  near(s.min, -A, 1e-3, '2.2 谷值');
  near(s.pp, 2 * A, 1e-3, '2.3 峰對峰');
  near(s.avg, 0, 1e-3, '2.4 一個週期的平均是 0');
  near(s.rms, A / Math.SQRT2, 1e-3, '2.5 **正弦 RMS ＝ A/√2**');
  eq(M.stats([]), null, '2.6 空');
  eq(M.stats(null), null, '2.7 null');
  // 直流的 RMS 就是它自己
  near(M.stats([5, 5, 5, 5]).rms, 5, 1e-12, '2.8 直流 RMS');
}

// ---- 3. 交越點 ----
{
  const xs = [0, 1, 2], ys = [0, 10, 0];
  near(M.crossing(xs, ys, 5, 1, 0).x, 0.5, 1e-12, '3.1 上升交越（線性內插）');
  near(M.crossing(xs, ys, 5, -1, 0).x, 1.5, 1e-12, '3.2 下降交越');
  eq(M.crossing(xs, ys, 99, 1, 0), null, '3.3 沒有交越回 null');
  near(M.crossing(xs, ys, 5, 0, 0).x, 0.5, 1e-12, '3.4 不限方向取第一個');
  eq(M.crossing(null, null, 1, 1, 0), null, '3.5 null');
}

// ---- 4. 上升／下降時間：斜坡的 10–90% ＝ 0.8 倍 ----
{
  // 0→1 的線性斜坡，全長 1 秒
  const { xs, ys } = gen(100001, x => x);
  near(M.riseTime(xs, ys), 0.8, 1e-4, '4.1 **線性斜坡的 10–90% ＝ 0.8**');
  near(M.riseTime(xs, ys, 0.2, 0.8), 0.6, 1e-4, '4.2 20–80% ＝ 0.6');
  // 下降斜坡
  const down = gen(100001, x => 1 - x);
  near(M.fallTime(down.xs, down.ys), 0.8, 1e-4, '4.3 下降時間');
  // 平的訊號沒有上升時間 —— 回 null 不是 0
  const flat = gen(100, () => 1);
  eq(M.riseTime(flat.xs, flat.ys), null, '4.4 **平的訊號回 null，不是 0**');
  eq(M.fallTime(flat.xs, flat.ys), null, '4.5 同理');
  // 只上升到一半就結束：找不到 90% 交越
  const half = { xs: [0, 1], ys: [0, 1] };
  ok(M.riseTime(half.xs, half.ys) != null, '4.6 兩點的斜坡仍量得出來');
}

// ---- 5. 週期／頻率／責任週期 ----
{
  const f0 = 50;
  const { xs, ys } = gen(200001, x => Math.sin(2 * Math.PI * f0 * x));   // 1 秒 50 個週期
  rel(M.period(xs, ys), 1 / f0, 1e-3, '5.1 週期');
  rel(M.frequency(xs, ys), f0, 1e-3, '5.2 **頻率 ＝ 50Hz**');
  near(M.dutyCycle(xs, ys), 0.5, 1e-3, '5.3 正弦的責任週期是 50%');

  // 25% 方波
  const sq = gen(200001, x => ((x * 20) % 1) < 0.25 ? 1 : 0);
  near(M.dutyCycle(sq.xs, sq.ys), 0.25, 2e-3, '5.4 **25% 方波量得出 25%**');
  rel(M.frequency(sq.xs, sq.ys), 20, 1e-2, '5.5 方波頻率');

  // 只有半個週期 → 沒有頻率可言
  const halfCycle = gen(1001, x => Math.sin(Math.PI * x));
  eq(M.period(halfCycle.xs, halfCycle.ys), null, '5.6 **一個週期都沒走完就回 null**');
  eq(M.frequency(halfCycle.xs, halfCycle.ys), null, '5.7 同理');
}

// ---- 6. 過衝 ----
{
  // 前段衝到 1.2、之後穩在 1.0
  const { xs, ys } = gen(2001, x => x < 0.1 ? 1.2 * (x / 0.1) : (x < 0.2 ? 1.2 : 1.0));
  near(M.overshoot(xs, ys), 0.2, 1e-6, '6.1 過衝 20%');
  const clean = gen(2001, x => x < 0.1 ? x / 0.1 : 1);
  near(M.overshoot(clean.xs, clean.ys), 0, 1e-9, '6.2 沒有過衝就是 0');
}

// ---- 7. 探針與游標 ----
{
  const res = { t: [0, 1, 2], nodes: { a: [0, 10, 20], b: [5, 5, 5] } };
  eq(M.probe(res, 1.5).values, { a: 15, b: 5 }, '7.1 探針同時讀多條');
  eq(M.probe(res, 1.5, ['a']).values, { a: 15 }, '7.2 指定訊號');
  eq(M.probe(res, 9).values, { a: null, b: null }, '7.3 範圍外回 null');
  const c = M.cursors(res, 0.5, 1.5, ['a']);
  eq([c.dt, c.dv.a], [1, 10], '7.4 兩游標之間的 Δt 與 Δv');
  near(c.freq, 1, 1e-12, '7.5 1/Δt');
  eq(M.cursors(res, 1, 1, ['a']).freq, null, '7.6 **Δt=0 回 null，不回 Infinity**');
  eq(M.probe(null, 1).values, {}, '7.7 沒有結果不炸');
}

// ---- 8. AC：−3dB 與增益 ----
{
  // RC 低通的解析振幅：1/√(1+(f/fc)²)，fc = 1000
  const fc = 1000;
  const f = [], mag = [], phase = [];
  for (let i = 0; i <= 4000; i++) {
    const fr = 10 * Math.pow(10, 3 * i / 4000);          // 10Hz → 10kHz 對數掃
    f.push(fr);
    mag.push(1 / Math.sqrt(1 + (fr / fc) * (fr / fc)));
    phase.push(-Math.atan(fr / fc) * 180 / Math.PI);
  }
  const ac = { converged: true, f, nodes: { out: { mag, phase } } };
  rel(M.cutoff(ac, 'out').f, fc, 5e-3, '8.1 **−3dB 落在 1/(2πRC)**');
  near(M.gainAt(ac, 'out', fc).mag, 1 / Math.SQRT2, 1e-3, '8.2 fc 上的增益 ＝ 0.707');
  near(M.gainAt(ac, 'out', fc).dB, -3.01, 0.05, '8.3 ＝ −3dB');
  near(M.gainAt(ac, 'out', fc).phase, -45, 0.1, '8.4 fc 上相位 −45°');
  eq(M.gainAt(ac, 'nope', 100), null, '8.5 沒有這條訊號');
  eq(M.cutoff({ f: [], nodes: {} }, 'out'), null, '8.6 空');

  // 帶通：低頻端本來就衰減。用「第一個點」當基準會量出一個不存在的轉角，
  // 所以基準必須是**通帶最大增益**。
  const f2 = [], m2 = [];
  for (let i = 0; i <= 4000; i++) {
    const fr = 10 * Math.pow(10, 4 * i / 4000);          // 10Hz → 100kHz
    f2.push(fr);
    const lo = fr / 100, hi = fr / 10000;                 // 高通角 100Hz、低通角 10kHz
    m2.push((lo / Math.sqrt(1 + lo * lo)) * (1 / Math.sqrt(1 + hi * hi)));
  }
  const bp = { converged: true, f: f2, nodes: { out: { mag: m2, phase: m2.map(() => 0) } } };
  const cut = M.cutoff(bp, 'out');
  ok(cut != null, '8.7 帶通也量得到轉角');
  rel(cut.refGain, 1, 0.02, '8.8 **基準是通帶最大增益（≈1），不是低頻端那個很小的值**');
  rel(cut.f, 10000, 0.05, '8.9 往下找到的是高頻轉角 10kHz');
}

// ---- 9. summary 一次給一整組 ----
{
  const { xs, ys } = gen(20001, x => Math.sin(2 * Math.PI * 10 * x));
  const s = M.summary(xs, ys);
  rel(s.freq, 10, 1e-2, '9.1 頻率');
  near(s.rms, 1 / Math.SQRT2, 1e-3, '9.2 RMS');
  eq(s.samples, 20001, '9.3 取樣數要報出來（量測精度的上限就是它）');
  near(s.dt, 1 / 20000, 1e-9, '9.4 取樣間隔也要報');
  eq(M.summary([], []), null, '9.5 空');
}

console.log(`\nspice-measure.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
