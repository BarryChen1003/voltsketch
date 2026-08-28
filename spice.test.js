/**
 * spice.test.js — MNA 求解器驗證（node）
 *
 * 每一條都對**解析解**比對，不對「上次跑出來的數字」比對。
 * 理由：迴歸測試只能保證「跟以前一樣」，保證不了「對」。分壓器該是 5V 就是 5V，
 * RC 在 t=τ 該是 63.2% 就是 63.2%，這些有閉式解的東西沒有藉口。
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

const S = require('./spice.js');

let pass = 0, fail = 0;
function eq(a, b, msg) {
  const ok = JSON.stringify(a) === JSON.stringify(b);
  if (ok) pass++; else { fail++; console.error(`FAIL ${msg}\n  expected ${JSON.stringify(b)}\n  got      ${JSON.stringify(a)}`); }
}
const ok = (v, msg) => eq(!!v, true, msg);
function near(a, b, tol, msg) {
  const d = Math.abs(a - b);
  if (d <= tol) pass++; else { fail++; console.error(`FAIL ${msg}\n  ${a} 與 ${b} 差 ${d} > ${tol}`); }
}
// 相對誤差版（大數值用）
function rel(a, b, pct, msg) {
  const d = Math.abs(a - b) / (Math.abs(b) || 1);
  if (d <= pct) pass++; else { fail++; console.error(`FAIL ${msg}\n  ${a} 與 ${b} 相對誤差 ${(d * 100).toFixed(3)}% > ${(pct * 100)}%`); }
}

// ---- 0. 數值字串 ----
eq(S.parseValue('10k'), 10000, '0.1 10k');
near(S.parseValue('100n'), 1e-7, 1e-20, '0.2 100n');
eq(S.parseValue('1meg'), 1e6, '0.3 1meg（不可以被讀成 1 毫）');
eq(S.parseValue('1m'), 1e-3, '0.4 1m＝1 毫');
eq(S.parseValue('4k7'), 4700, '0.5 4k7＝4.7k');
eq(S.parseValue('2.2u'), 2.2e-6, '0.6 2.2u');
eq(S.parseValue(47), 47, '0.7 數字原樣');
eq(S.parseValue(''), 0, '0.8 空字串回 0');
eq(S.parseValue('abc'), 0, '0.9 非數字回 0');

// ---- 1. DC 分壓器 ----
{
  const net = [
    { id: 'V1', type: 'V', nodes: ['in', '0'], value: 10 },
    { id: 'R1', type: 'R', nodes: ['in', 'mid'], value: 1000 },
    { id: 'R2', type: 'R', nodes: ['mid', '0'], value: 1000 },
  ];
  const r = S.dcOp(net);
  ok(r.converged, '1.1 收斂');
  near(r.nodes.in, 10, 1e-9, '1.2 輸入節點 10V');
  near(r.nodes.mid, 5, 1e-9, '1.3 分壓中點 5V（解析解）');
  near(r.branches.V1, -5e-3, 1e-9, '1.4 電源電流 5mA（MNA 慣例流出為負）');
}
{
  // 不對稱分壓：1k / 3k → 10 × 3/(1+3) = 7.5V
  const r = S.dcOp([
    { id: 'V1', type: 'V', nodes: ['in', '0'], value: 10 },
    { type: 'R', nodes: ['in', 'mid'], value: 1000 },
    { type: 'R', nodes: ['mid', '0'], value: 3000 },
  ]);
  near(r.nodes.mid, 7.5, 1e-9, '1.5 不對稱分壓 7.5V');
}
{
  // 三段分壓，驗證多節點
  const r = S.dcOp([
    { type: 'V', nodes: ['1', '0'], value: 12 },
    { type: 'R', nodes: ['1', '2'], value: 1000 },
    { type: 'R', nodes: ['2', '3'], value: 2000 },
    { type: 'R', nodes: ['3', '0'], value: 3000 },
  ]);
  near(r.nodes['2'], 12 * 5000 / 6000, 1e-9, '1.6 三段分壓節點 2');
  near(r.nodes['3'], 12 * 3000 / 6000, 1e-9, '1.7 三段分壓節點 3');
}

// ---- 2. 電流源與並聯 ----
{
  // 1mA 灌進 2k 與 2k 並聯（=1k）→ 1V
  const r = S.dcOp([
    { type: 'I', nodes: ['0', 'a'], value: 1e-3 },
    { type: 'R', nodes: ['a', '0'], value: 2000 },
    { type: 'R', nodes: ['a', '0'], value: 2000 },
  ]);
  near(r.nodes.a, 1, 1e-9, '2.1 1mA 進 1k 並聯 → 1V');
}

// ---- 3. DC 下電容開路、電感短路 ----
{
  const r = S.dcOp([
    { type: 'V', nodes: ['in', '0'], value: 5 },
    { type: 'R', nodes: ['in', 'out'], value: 1000 },
    { type: 'C', nodes: ['out', '0'], value: 1e-6 },
  ]);
  near(r.nodes.out, 5, 1e-6, '3.1 DC 時電容開路 → 沒有壓降，out = 5V');
}
{
  const r = S.dcOp([
    { type: 'V', nodes: ['in', '0'], value: 5 },
    { type: 'L', nodes: ['in', 'out'], value: 1e-3 },
    { type: 'R', nodes: ['out', '0'], value: 1000 },
  ]);
  near(r.nodes.out, 5, 1e-6, '3.2 DC 時電感短路 → out = in = 5V');
}

// ---- 4. RC 步階響應（瞬態）----
{
  // τ = RC = 1k × 1µF = 1ms。t=τ 時 63.212%，t=3τ 時 95.021%
  const R = 1000, C = 1e-6, tau = R * C;
  const r = S.tran([
    { type: 'V', nodes: ['in', '0'], value: 0, tran: { kind: 'step', v1: 0, v2: 1, td: 0 } },
    { type: 'R', nodes: ['in', 'out'], value: R },
    { type: 'C', nodes: ['out', '0'], value: C },
  ], { stop: 5 * tau, step: tau / 500 });
  ok(r.converged, '4.1 瞬態收斂');
  ok(r.t.length > 100, '4.2 有取到足夠的點');
  const at = tt => {
    let bi = 0;
    for (let i = 1; i < r.t.length; i++) if (Math.abs(r.t[i] - tt) < Math.abs(r.t[bi] - tt)) bi = i;
    return r.nodes.out[bi];
  };
  rel(at(tau), 1 - Math.exp(-1), 0.01, '4.3 t=τ 時 63.2%（解析解）');
  rel(at(2 * tau), 1 - Math.exp(-2), 0.01, '4.4 t=2τ 時 86.5%');
  rel(at(3 * tau), 1 - Math.exp(-3), 0.01, '4.5 t=3τ 時 95.0%');
  near(r.nodes.out[0], 0, 1e-6, '4.6 起始電壓 0');
  rel(at(5 * tau), 1 - Math.exp(-5), 0.02, '4.7 t=5τ 時 99.3%');
}

// ---- 5. RL 步階響應 ----
{
  // τ = L/R = 1mH / 100Ω = 10µs。電阻上的電壓 = V(1 - e^-t/τ)
  const R = 100, L = 1e-3, tau = L / R;
  const r = S.tran([
    { type: 'V', nodes: ['in', '0'], value: 0, tran: { kind: 'step', v1: 0, v2: 1, td: 0 } },
    { type: 'L', nodes: ['in', 'out'], value: L },
    { type: 'R', nodes: ['out', '0'], value: R },
  ], { stop: 5 * tau, step: tau / 500 });
  ok(r.converged, '5.1 RL 瞬態收斂');
  const at = tt => {
    let bi = 0;
    for (let i = 1; i < r.t.length; i++) if (Math.abs(r.t[i] - tt) < Math.abs(r.t[bi] - tt)) bi = i;
    return r.nodes.out[bi];
  };
  rel(at(tau), 1 - Math.exp(-1), 0.02, '5.2 RL t=τ 時電阻電壓 63.2%');
  rel(at(3 * tau), 1 - Math.exp(-3), 0.02, '5.3 RL t=3τ 時 95.0%');
}

// ---- 6. AC 低通 ----
{
  // RC 低通，f_-3dB = 1/(2πRC)。1k + 159.15nF → 約 1kHz
  const R = 1000, C = 1 / (2 * Math.PI * 1000 * 1000);   // 讓 fc 剛好 1kHz
  const fc = 1 / (2 * Math.PI * R * C);
  const r = S.ac([
    { type: 'V', nodes: ['in', '0'], value: 0, ac: 1 },
    { type: 'R', nodes: ['in', 'out'], value: R },
    { type: 'C', nodes: ['out', '0'], value: C },
  ], { start: fc / 100, stop: fc * 100, points: 40 });
  ok(r.converged, '6.1 AC 收斂');
  const at = f => {
    let bi = 0;
    for (let i = 1; i < r.f.length; i++) if (Math.abs(Math.log(r.f[i] / f)) < Math.abs(Math.log(r.f[bi] / f))) bi = i;
    return { mag: r.nodes.out.mag[bi], ph: r.nodes.out.phase[bi], f: r.f[bi] };
  };
  rel(at(fc / 100).mag, 1, 0.01, '6.2 遠低於轉角頻率增益 ≈ 1');
  rel(at(fc).mag, Math.SQRT1_2, 0.02, '6.3 轉角頻率增益 = 1/√2（-3dB，解析解）');
  near(at(fc).ph, -45, 2, '6.4 轉角頻率相位 -45°（解析解）');
  // 一階低通每十倍頻降 20dB
  const a = at(fc * 10).mag, b = at(fc * 100).mag;
  rel(20 * Math.log10(a / b), 20, 0.06, '6.5 每十倍頻 -20dB（一階斜率）');
}
{
  // RC 高通：出力取在電阻上
  const R = 1000, C = 1 / (2 * Math.PI * 1000 * 1000);
  const fc = 1 / (2 * Math.PI * R * C);
  const r = S.ac([
    { type: 'V', nodes: ['in', '0'], value: 0, ac: 1 },
    { type: 'C', nodes: ['in', 'out'], value: C },
    { type: 'R', nodes: ['out', '0'], value: R },
  ], { start: fc / 100, stop: fc * 100, points: 40 });
  const at = f => {
    let bi = 0;
    for (let i = 1; i < r.f.length; i++) if (Math.abs(Math.log(r.f[i] / f)) < Math.abs(Math.log(r.f[bi] / f))) bi = i;
    return { mag: r.nodes.out.mag[bi], ph: r.nodes.out.phase[bi] };
  };
  rel(at(fc).mag, Math.SQRT1_2, 0.02, '6.6 高通轉角也是 -3dB');
  near(at(fc).ph, 45, 2, '6.7 高通轉角相位 +45°');
  rel(at(fc * 100).mag, 1, 0.02, '6.8 遠高於轉角增益 ≈ 1');
}
{
  // LC 串聯諧振：f0 = 1/(2π√(LC))，諧振時電阻上電壓最大
  const L = 1e-3, C = 1e-6, Rs = 10;
  const f0 = 1 / (2 * Math.PI * Math.sqrt(L * C));
  const r = S.ac([
    { type: 'V', nodes: ['in', '0'], value: 0, ac: 1 },
    { type: 'L', nodes: ['in', 'a'], value: L },
    { type: 'C', nodes: ['a', 'out'], value: C },
    { type: 'R', nodes: ['out', '0'], value: Rs },
  ], { start: f0 / 10, stop: f0 * 10, points: 60 });
  let bi = 0;
  for (let i = 1; i < r.f.length; i++) if (r.nodes.out.mag[i] > r.nodes.out.mag[bi]) bi = i;
  rel(r.f[bi], f0, 0.05, '6.9 LC 串聯諧振峰在 f0 = 1/(2π√LC)（解析解）');
}

// ---- 7. 二極體 ----
{
  // 1V 經 1k 推二極體：順向壓降應該落在 0.4–0.8V，電流 ≈ (1-Vd)/1k
  const r = S.dcOp([
    { type: 'V', nodes: ['in', '0'], value: 1 },
    { type: 'R', nodes: ['in', 'a'], value: 1000 },
    { type: 'D', nodes: ['a', '0'], model: { is: 1e-14, n: 1 } },
  ]);
  ok(r.converged, '7.1 二極體電路收斂');
  ok(r.nodes.a > 0.35 && r.nodes.a < 0.8, '7.2 順向壓降落在合理範圍（' + r.nodes.a.toFixed(3) + 'V）');
  // 用 Shockley 反推：Id = Is(e^(Vd/VT) - 1) 應該與 (1-Vd)/1k 一致
  const vd = r.nodes.a;
  const id_diode = 1e-14 * (Math.exp(vd / S.VT()) - 1);
  const id_res = (1 - vd) / 1000;
  rel(id_diode, id_res, 0.02, '7.3 二極體電流與電阻電流一致（KCL 自洽）');
}
{
  // 逆向：二極體反接，幾乎不導通
  const r = S.dcOp([
    { type: 'V', nodes: ['in', '0'], value: 1 },
    { type: 'R', nodes: ['in', 'a'], value: 1000 },
    { type: 'D', nodes: ['0', 'a'], model: { is: 1e-14, n: 1 } },
  ]);
  ok(r.converged, '7.4 逆向也收斂');
  near(r.nodes.a, 1, 1e-3, '7.5 逆向截止 → 電阻上幾乎沒壓降');
}

// ---- 8. MOSFET ----
{
  // NMOS 共源：Vgs=3, Vth=1 → Vov=2；飽和區 Id = (kp·W/L/2)·Vov²
  const kp = 2e-5, wl = 100, vth = 1, vgs = 3;
  const idExpect = (kp * wl / 2) * Math.pow(vgs - vth, 2);
  const rd = 500;   // Rd 太大會掉進線性區：Id·Rd 必須小到 Vd > Vov 才是飽和區
  const r = S.dcOp([
    { type: 'V', nodes: ['dd', '0'], value: 5 },
    { type: 'V', nodes: ['g', '0'], value: vgs },
    { type: 'R', nodes: ['dd', 'd'], value: rd },
    { type: 'M', nodes: ['d', 'g', '0'], model: { vth, kp, wl, lambda: 0 } },
  ]);
  ok(r.converged, '8.1 MOSFET 電路收斂');
  const idActual = (5 - r.nodes.d) / rd;
  rel(idActual, idExpect, 0.02, '8.2 飽和區汲極電流符合平方律（解析解）');
  ok(r.nodes.d > vgs - vth, '8.3 確實工作在飽和區（Vds > Vov）');
}
{
  // Vgs 低於 Vth → 截止，汲極被上拉到 VDD
  const r = S.dcOp([
    { type: 'V', nodes: ['dd', '0'], value: 5 },
    { type: 'V', nodes: ['g', '0'], value: 0.5 },
    { type: 'R', nodes: ['dd', 'd'], value: 1000 },
    { type: 'M', nodes: ['d', 'g', '0'], model: { vth: 1, kp: 2e-5, wl: 100 } },
  ]);
  near(r.nodes.d, 5, 1e-3, '8.4 Vgs < Vth 截止，汲極 = VDD');
}

// ---- 9. 失敗要照實說 ----
{
  const r = S.dcOp([]);
  eq(r.converged, false, '9.1 空網表不收斂');
  ok(r.warnings.includes('no_nodes'), '9.2 而且說明原因');
}
{
  // 兩個電壓源硬接在一起＝矛盾，矩陣奇異
  const r = S.dcOp([
    { type: 'V', nodes: ['a', '0'], value: 5 },
    { type: 'V', nodes: ['a', '0'], value: 3 },
  ]);
  eq(r.converged, false, '9.3 電壓源打架不可以硬給一組數字');
  ok(r.warnings.some(w => /singular/.test(w)), '9.4 回報矩陣奇異');
}
{
  // 浮接節點靠 Gmin 撐住，不應該讓整個分析垮掉
  const r = S.dcOp([
    { type: 'V', nodes: ['a', '0'], value: 5 },
    { type: 'R', nodes: ['a', '0'], value: 1000 },
    { type: 'R', nodes: ['float1', 'float2'], value: 1000 },
  ]);
  ok(r.converged, '9.5 有浮接節點時仍然解得出來（Gmin 撐住）');
  near(r.nodes.a, 5, 1e-9, '9.6 而且主電路的解不受影響');
}

// ---- 10. 時變源 ----
{
  const e = { type: 'V', nodes: ['a', '0'], value: 0, tran: { kind: 'sine', amp: 2, freq: 1000, offset: 1 } };
  near(S.srcValue(e, 0), 1, 1e-12, '10.1 正弦 t=0 時等於偏移');
  near(S.srcValue(e, 1 / 4000), 3, 1e-12, '10.2 四分之一週期時到峰值');
  near(S.srcValue(e, 3 / 4000), -1, 1e-12, '10.3 四分之三週期時到谷值');
}
{
  const e = { type: 'V', nodes: ['a', '0'], tran: { kind: 'pulse', v1: 0, v2: 5, td: 1e-6, tr: 1e-6, pw: 2e-6, tf: 1e-6, per: 10e-6 } };
  near(S.srcValue(e, 0), 0, 1e-12, '10.4 延遲前是 v1');
  near(S.srcValue(e, 1.5e-6), 2.5, 1e-12, '10.5 上升緣中點是一半');
  near(S.srcValue(e, 3e-6), 5, 1e-12, '10.6 平頂是 v2');
  near(S.srcValue(e, 9e-6), 0, 1e-12, '10.7 週期尾端回到 v1');
}

// ---- 11. 正弦穩態瞬態（跟 AC 對答案）----
{
  // RC 低通在轉角頻率驅動，穩態振幅應該是輸入的 1/√2
  const R = 1000, C = 1 / (2 * Math.PI * 1000 * 1000);
  const fc = 1 / (2 * Math.PI * R * C);
  const r = S.tran([
    { type: 'V', nodes: ['in', '0'], value: 0, tran: { kind: 'sine', amp: 1, freq: fc, offset: 0 } },
    { type: 'R', nodes: ['in', 'out'], value: R },
    { type: 'C', nodes: ['out', '0'], value: C },
  ], { stop: 20 / fc, step: 1 / (fc * 400) });
  ok(r.converged, '11.1 正弦瞬態收斂');
  // 取最後 5 個週期的峰值，避開起始暫態
  const tail = r.nodes.out.slice(Math.floor(r.nodes.out.length * 0.75));
  const amp = (Math.max(...tail) - Math.min(...tail)) / 2;
  rel(amp, Math.SQRT1_2, 0.03, '11.2 轉角頻率的穩態振幅 = 1/√2（與 AC 分析一致）');
}

console.log(`\nspice.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
