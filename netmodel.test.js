/**
 * netmodel.test.js — net 一級物件（pcb-nets.js / NetModel）驗證（node）
 *
 * 三個重點，都對應真的會壞的事：
 *   1. **參照列舉不可以漏**。改名漏掉一種圖元的症狀是「鋪銅還掛在舊網路上，
 *      而且畫面上看不出來」——沒有錯誤訊息，只是電性從此不對。
 *      這支的第 1 節就是那個舊 bug 的回歸測試（userZones / teardrops）。
 *   2. **阻抗數字對得上 IPC-2141 的閉式解**。不對「上次跑出來的數字」比對：
 *      參考值是照公式手算的，寫在斷言旁邊。
 *      解算器（widthFor / gapFor）另外跟正算函式 round-trip，兩條不同的路。
 *   3. **量出來的差分對間距，跟 NetRules 的耦合判定講的是同一件事**。
 *      兩邊是刻意分開的兩份實作（一個量、一個判），所以要有一條把它們釘在
 *      同一塊合成板上對照，否則哪天其中一邊改了定義沒人會發現。
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

// pcb-stackup.js 在載入時就會掛 UI，node 需要最小 DOM stub（測的是它的純函式 geomFor）
const noop = () => {};
global.document = { readyState: 'complete', addEventListener: noop, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
global.window = { I18N: null, document: global.document, addEventListener: noop };
const NM = require('./pcb-nets.js');
require('./pcb-stackup.js');
require('./pcb-rules.js');
const Stackup = global.window.Stackup;
const NetRules = global.window.NetRules;

let pass = 0, fail = 0;
function eq(a, b, msg) {
  const ok = JSON.stringify(a) === JSON.stringify(b);
  if (ok) pass++; else { fail++; console.error(`FAIL ${msg}\n  expected ${JSON.stringify(b)}\n  got      ${JSON.stringify(a)}`); }
}
const ok = (v, msg) => eq(!!v, true, msg);
function near(a, b, tol, msg) {
  const d = Math.abs(a - b);
  if (d <= tol) pass++; else { fail++; console.error(`FAIL ${msg}\n  expected ${b} ±${tol}\n  got      ${a} (差 ${d})`); }
}

const seg = (x1, y1, x2, y2, net, w, layer) => ({ x1, y1, x2, y2, net, width: w == null ? 0.3 : w, layer: layer || 'F.Cu' });

// ---- 1. 參照列舉：六種圖元一個都不能漏（舊 bug 回歸）----
{
  const st = {
    components: [{ id: 'U1', pads: [{ num: '1', net: 'OLD' }, { num: '2', net: 'KEEP' }] }],
    traces: [seg(0, 0, 1, 0, 'OLD')],
    vias: [{ x: 1, y: 0, net: 'OLD' }],
    zones: [{ layer: 'F.Cu', net: 'OLD', pts: [] }],
    userZones: [{ layer: 'B.Cu', net: 'OLD', pts: [] }],
    teardrops: [{ layer: 'F.Cu', net: 'OLD', pts: [] }],
    highlightNet: 'OLD'
  };
  eq(NM.refs(st).length, 7, '1.1 六種圖元（元件兩個 pad）全部列到');
  eq(NM.names(st), ['KEEP', 'OLD'], '1.2 net 名清單');

  const n = NM.rename(st, 'OLD', 'NEW');
  eq(n, 6, '1.3 改名要動到六處（pad/走線/via/KiCad 鋪銅/使用者鋪銅/淚滴）');
  eq(st.userZones[0].net, 'NEW', '1.4 使用者畫的鋪銅一定要跟著改（以前漏掉這個）');
  eq(st.teardrops[0].net, 'NEW', '1.5 淚滴一定要跟著改（以前漏掉這個）');
  eq(st.zones[0].net, 'NEW', '1.6 KiCad 鋪銅');
  eq(st.vias[0].net, 'NEW', '1.7 via');
  eq(st.components[0].pads[1].net, 'KEEP', '1.8 不同名的不可以被改到');
  eq(st.highlightNet, 'NEW', '1.9 高亮狀態跟著改，否則高亮會消失');
}

// ---- 2. 屬性表：寫、清、改名時一起搬 ----
{
  const st = { traces: [seg(0, 0, 10, 0, 'A'), seg(0, 1, 10, 1, 'B')] };
  NM.set(st, 'A', { z0: 50, ztol: 8, note: 'clk' });
  eq(NM.get(st, 'A').z0, 50, '2.1 寫得進去');
  eq(NM.get(st, 'A').ztol, 8, '2.2 容差');
  eq(NM.get(st, 'B').ztol, 10, '2.3 沒設的容差有預設 10%');
  eq(NM.get(st, 'B').hasProps, false, '2.4 沒設過的不算有屬性');

  NM.set(st, 'A', { z0: 0 });
  eq(NM.get(st, 'A').z0, 0, '2.5 給 0 等於清掉');
  NM.set(st, 'A', { ztol: '', note: '' });
  eq(Object.keys(st.netProps).indexOf('A'), -1, '2.6 全部清空後整筆移除，不留空物件');

  NM.set(st, 'A', { z0: 50 });
  NM.rename(st, 'A', 'A2');
  eq(NM.get(st, 'A2').z0, 50, '2.7 改名要把屬性一起搬過去');
  eq(st.netProps.A, undefined, '2.8 舊名字的屬性要清掉');
  NM.set(st, 'A2', { z0: 'abc' });
  eq(NM.get(st, 'A2').z0, 0, '2.9 非數字不寫進去');
}

// ---- 3. 差分對：命名猜測 vs 明講 ----
{
  eq(NM.autoPair('USB_DP', ['USB_DP', 'USB_DN']), 'USB_DN', '3.1 USB 的 D+/D− 寫成 DP/DN 也認得（尾綴仍是 P/N）');
  eq(NM.autoPair('USB_P', ['USB_P', 'USB_N', 'GND']), 'USB_N', '3.2 _P → _N');
  eq(NM.autoPair('CLK+', ['CLK+', 'CLK-']), 'CLK-', '3.3 +/-');
  eq(NM.autoPair('LVDS0P', ['LVDS0P', 'LVDS0N']), 'LVDS0N', '3.4 沒有底線也認');
  eq(NM.autoPair('D_P', ['D_P', 'D_N', 'D-']), '', '3.5 兩個候選就不猜，交給使用者明講');
  eq(NM.autoPair('GND', ['GND', 'VCC']), '', '3.6 沒有極性尾綴');

  const st = { traces: [seg(0, 0, 1, 0, 'RX_P'), seg(0, 1, 1, 1, 'RX_N'), seg(0, 2, 1, 2, 'CLK')] };
  eq(NM.get(st, 'RX_P').pairSource, 'name', '3.7 沒明講時來源標成「猜的」');
  NM.setPair(st, 'RX_P', 'CLK');
  eq(NM.get(st, 'RX_P').pair, 'CLK', '3.8 明講的優先於命名猜測');
  eq(NM.get(st, 'RX_P').pairSource, 'explicit', '3.9 來源標成明講');
  eq(NM.get(st, 'CLK').pair, 'RX_P', '3.10 配對一定要對稱寫兩邊');

  NM.setPair(st, 'RX_P', 'RX_N');
  eq(NM.get(st, 'CLK').pair, '', '3.11 改配對時舊對手要斷乾淨，不可以留三角關係');
  eq(NM.get(st, 'RX_N').pair, 'RX_P', '3.12 新對手雙向');
  NM.setPair(st, 'RX_P', '');
  eq([NM.get(st, 'RX_P').pair, NM.get(st, 'RX_N').pairSource], ['RX_N', 'name'], '3.13 解除明講後退回命名猜測');
}

// ---- 4. IPC-2141：對手算的閉式解 ----
// microstrip Z0 = 87/√(εr+1.41) · ln(5.98h/(0.8w+t))
//   w=0.25 h=0.2 t=0.035 εr=4.4：87/√5.81 = 36.0898；ln(1.196/0.235) = ln(5.089362) = 1.627153
//   → 36.0898 × 1.627153 = 58.72Ω
// stripline Z0 = 60/√εr · ln(1.9(2h+t)/(0.8w+t))
//   w=0.2 h=0.2 t=0.035 εr=4.4：60/√4.4 = 28.6032；ln(0.8265/0.195) = ln(4.238462) = 1.444200
//   → 28.6032 × 1.444200 = 41.31Ω
// Zdiff(microstrip) = 2·Z0·(1 − 0.48·e^(−0.96 s/h))；s=h → e^−0.96 = 0.382893
//   → 2 × 58.72 × (1 − 0.183789) = 95.86Ω
{
  near(NM.impedance('microstrip', 0.25, 0.2, 0.035, 4.4).z0, 58.72, 0.05, '4.1 microstrip 閉式解');
  near(NM.impedance('stripline', 0.2, 0.2, 0.035, 4.4).z0, 41.31, 0.05, '4.2 stripline 閉式解');
  near(NM.impedance('diff-microstrip', 0.25, 0.2, 0.035, 4.4, 0.2).zdiff, 95.86, 0.1, '4.3 Zdiff 閉式解');
  eq(NM.impedance('diff-microstrip', 0.25, 0.2, 0.035, 4.4), null, '4.4 差分模式沒給間距回 null');
  eq(NM.impedance('microstrip', 0, 0.2, 0.035, 4.4), null, '4.5 線寬 0 回 null');
  eq(NM.impedance('microstrip', 0.25, 0.2, 0.035, 1), null, '4.6 εr ≤ 1 回 null');
  eq(NM.impedance('bogus', 0.25, 0.2, 0.035, 4.4), null, '4.7 認不得的型式回 null，不硬給數字');
  // 單調性：線越寬阻抗越低
  const a = NM.impedance('microstrip', 0.2, 0.2, 0.035, 4.4).z0;
  const b = NM.impedance('microstrip', 0.4, 0.2, 0.035, 4.4).z0;
  ok(a > b, '4.8 線越寬 Z0 越低');
}

// ---- 5. 解算器：跟正算函式 round-trip（兩條不同的路）----
{
  // 回傳的線寬是 1µm 網格上的值，所以不能要求阻抗完全相等。
  // 真正要驗的是「這是網格上最好的那一格」——左右各挪 1µm 都不會更接近目標。
  const best = (kind, target, h, t, er) => {
    const w = kind === 'stripline'
      ? NM.widthFor('stripline', target, h, t, er) : NM.widthFor('microstrip', target, h, t, er);
    if (w == null) return null;
    const err = ww => Math.abs(NM.impedance(kind, ww, h, t, er).z0 - target);
    return { w, e0: err(w), eL: err(w - 0.001), eR: err(w + 0.001) };
  };
  for (const target of [40, 50, 60, 75, 90]) {
    const b = best('microstrip', target, 0.2, 0.035, 4.4);
    ok(b != null, `5.1 ${target}Ω 在這個疊層解得出線寬`);
    ok(b.e0 <= b.eL && b.e0 <= b.eR, `5.2 ${target}Ω 是 1µm 網格上最接近的那一格`);
    near(NM.impedance('microstrip', b.w, 0.2, 0.035, 4.4).z0, target, 0.15, `5.2b ${target}Ω 誤差在 1µm 量化能造成的範圍內`);
  }
  const bs = best('stripline', 50, 0.2, 0.035, 4.4);
  ok(bs.e0 <= bs.eL && bs.e0 <= bs.eR, '5.3 stripline 也要是網格上最好的一格');
  eq(NM.widthFor('microstrip', 500, 0.2, 0.035, 4.4), null, '5.4 做不到的目標回 null，不回邊界值');
  // 1Ω 只有在 ln 引數 < 1（阻抗算成負的）的荒謬線寬才「達得到」——必須拒絕
  eq(NM.widthFor('microstrip', 1, 0.2, 0.035, 4.4), null, '5.5 低到超出近似式有效範圍的目標回 null');
  eq(NM.widthFor('microstrip', 0, 0.2, 0.035, 4.4), null, '5.6 目標 0 回 null');
  // 有效範圍：microstrip 上限 w/h = 3
  const wide = NM.widthFor('microstrip', NM.impedance('microstrip', 0.59, 0.2, 0.035, 4.4).z0, 0.2, 0.035, 4.4);
  ok(wide != null && wide <= 0.6 + 1e-9, '5.6b 解出來的線寬不超過 w/h = 3 的有效範圍');

  for (const target of [90, 100, 110]) {
    const s = NM.gapFor('microstrip', target, 0.25, 0.2, 0.035, 4.4);
    ok(s != null, `5.7 Zdiff ${target}Ω 解得出間距`);
    near(NM.impedance('diff-microstrip', 0.25, 0.2, 0.035, 4.4, s).zdiff, target, 0.02, `5.8 Zdiff ${target}Ω 解回來要一致`);
  }
  eq(NM.gapFor('microstrip', 500, 0.25, 0.2, 0.035, 4.4), null, '5.9 做不到的 Zdiff 回 null');
}

// ---- 6. 量差分對：對得上「照著擺出來的」幾何 ----
{
  // 兩條平行線，中心距 0.45mm、線寬 0.25 → 邊到邊 0.45 − 0.25 = 0.20mm
  const st = {
    traces: [
      seg(0, 0, 20, 0, 'RX_P', 0.25), seg(0, 0.45, 20, 0.45, 'RX_N', 0.25)
    ]
  };
  const g = NM.pairGeometry(st, 'RX_P', 'RX_N');
  near(g.gap, 0.2, 1e-6, '6.1 量到的邊到邊間距＝擺出來的間距');
  eq(g.coupled, 1, '6.2 整段平行 → 耦合 100%');
  eq(g.layer, 'F.Cu', '6.3 主要層');
  eq([g.lenA, g.lenB, g.skew], [20, 20, 0], '6.4 長度與長度差');

  // 一長一短 → skew
  const st2 = { traces: [seg(0, 0, 20, 0, 'A', 0.25), seg(0, 0.45, 17, 0.45, 'B', 0.25)] };
  eq(NM.pairGeometry(st2, 'A', 'B').skew, 3, '6.5 長度差');

  // 離很遠 → 不是一對，拒絕給間距（不可以硬算 Zdiff）
  const st3 = { traces: [seg(0, 0, 20, 0, 'A', 0.25), seg(0, 9, 20, 9, 'B', 0.25)] };
  const g3 = NM.pairGeometry(st3, 'A', 'B');
  eq([g3.gap, g3.coupled], [null, 0], '6.6 沒有耦合就回 null，不給假數字');

  // 只有前 1/5 靠在一起 → 耦合比例不足，一樣拒絕
  const st4 = { traces: [seg(0, 0, 20, 0, 'A', 0.25), seg(0, 0.45, 4, 0.45, 'B', 0.25)] };
  const g4 = NM.pairGeometry(st4, 'A', 'B');
  ok(g4.coupled < 0.3, '6.7 只有一小段並走 → 耦合比例低於門檻');
  eq(g4.gap, null, '6.7b 耦合比例不足就拒絕給間距');
  // 大部分並走 → 要給
  const st4b = { traces: [seg(0, 0, 20, 0, 'A', 0.25), seg(0, 0.45, 14, 0.45, 'B', 0.25)] };
  const g4b = NM.pairGeometry(st4b, 'A', 'B');
  ok(g4b.coupled >= 0.3, '6.7c 大部分並走 → 耦合比例過門檻');
  near(g4b.gap, 0.2, 1e-6, '6.7d 並走那一段的間距量得出來');

  // 不同層不算一對
  const st5 = { traces: [seg(0, 0, 20, 0, 'A', 0.25, 'F.Cu'), seg(0, 0.45, 20, 0.45, 'B', 0.25, 'B.Cu')] };
  eq(NM.pairGeometry(st5, 'A', 'B').gap, null, '6.8 不同層不算耦合');

  // 一邊沒走線
  eq(NM.pairGeometry({ traces: [seg(0, 0, 1, 0, 'A')] }, 'A', 'B').gap, null, '6.9 對手沒走線');
}

// ---- 7. 跟 NetRules 對照：量的跟判的講同一件事 ----
// NetModel 量出 0.20mm；NetRules 拿 gap=0.2 的規則去判，同一塊板必須判成「耦合、無違規」，
// 拿 gap=0.5 的規則去判則必須報違規。兩邊對 gap 的定義（邊到邊）因此被釘在一起。
{
  const st = { traces: [seg(0, 0, 20, 0, 'RX_P', 0.25), seg(0, 0.45, 20, 0.45, 'RX_N', 0.25)] };
  near(NM.pairGeometry(st, 'RX_P', 'RX_N').gap, 0.2, 1e-6, '7.1 量到 0.20mm');
  const good = NetRules.audit([{ pattern: '/^RX_/', minW: 0, maxLen: 0, pairTol: 0, gap: 0.2 }], st);
  eq(good.length, 0, '7.2 用量到的 gap 當規則 → NetRules 判定無違規');
  const bad = NetRules.audit([{ pattern: '/^RX_/', minW: 0, maxLen: 0, pairTol: 0, gap: 0.5 }], st);
  ok(bad.length > 0, '7.3 用差很多的 gap 當規則 → NetRules 必須報違規（否則這條測不到東西）');
}

// ---- 8. 稽核：目標阻抗 ----
// 疊層直接注入，不碰 localStorage：node 沒有 localStorage，而且注入才驗得到「換疊層結論要變」。
{
  const state = {
    layerStack: [
      { id: 'F.Cu', kind: 'copper', type: 'Signal' },
      { id: 'In1.Cu', kind: 'copper', type: 'GND' },
      { id: 'In2.Cu', kind: 'copper', type: 'PWR' },
      { id: 'B.Cu', kind: 'copper', type: 'Signal' }
    ],
    traces: [seg(0, 0, 20, 0, 'CLK', 0.25, 'F.Cu')],
    components: [], vias: []
  };
  const stack = { oz: { 'F.Cu': 1, 'In1.Cu': 1, 'In2.Cu': 1, 'B.Cu': 1 }, diel: [{ t: 0.2, er: 4.4 }, { t: 0.5, er: 4.4 }, { t: 0.2, er: 4.4 }] };
  const g = Stackup.geomFor(stack, state, 'F.Cu');
  eq([g.kind, g.h, g.er], ['microstrip', 0.2, 4.4], '8.1 疊層推得出外層幾何');

  eq(NM.audit(state, { stackup: stack }).length, 0, '8.2 沒設目標就不報');

  NM.set(state, 'CLK', { z0: 50 });
  const r1 = NM.audit(state, { stackup: stack });
  eq(r1.length, 1, '8.3 0.25mm ≈ 58.7Ω 離 50Ω 超過 10% → 報一條');
  eq(r1[0].type, 'warning', '8.4 是 warning 不是 error（近似式不該擋人）');

  // 照建議的線寬改，警告必須消失——這條是「建議值真的有用」的證明
  const want = NM.widthFor('microstrip', 50, g.h, g.t, g.er);
  state.traces[0].width = want;
  eq(NM.audit(state, { stackup: stack }).length, 0, '8.5 照建議線寬改完，警告消失');

  // 容差放寬也該消失（原線寬差 17.4%）
  state.traces[0].width = 0.25;
  NM.set(state, 'CLK', { ztol: 20 });
  eq(NM.audit(state, { stackup: stack }).length, 0, '8.6 容差放寬到 20% 就不報');
  NM.set(state, 'CLK', { ztol: 10 });

  // 層感知：同樣的 0.25mm、同樣的 50Ω 目標，外層（microstrip，58.7Ω）超差要報，
  // 內層（stripline，介電 0.5/0.2 → 約 51Ω）在容差內不該報。
  // 忽略層別的實作會讓這兩條其中一條紅。
  eq(NM.audit(state, { stackup: stack }).length, 1, '8.7 外層 0.25mm 對 50Ω 超差 → 報');
  state.traces[0].layer = 'In2.Cu';
  eq(Stackup.geomFor(stack, state, 'In2.Cu').kind, 'stripline', '8.8 內層是 stripline');
  eq(NM.audit(state, { stackup: stack }).length, 0, '8.9 同樣線寬同樣目標，內層在容差內 → 不報');
  state.traces[0].layer = 'F.Cu';

  // 疊層推不出幾何（只有一層銅）→ 說推不出來，不可以當作通過
  const thin = { layerStack: [{ id: 'F.Cu', kind: 'copper', type: 'Signal' }], traces: state.traces, netProps: state.netProps };
  const r3 = NM.audit(thin, { stackup: { oz: { 'F.Cu': 1 }, diel: [] } });
  eq([r3.length, r3[0].type], [1, 'info'], '8.10 推不出幾何要出聲（不可以靜靜當作通過）');
}

// ---- 9. 稽核：配對完整性與過期屬性 ----
{
  const st = {
    traces: [seg(0, 0, 10, 0, 'A'), seg(0, 1, 10, 1, 'B')],
    components: [], vias: [], netProps: {}
  };
  NM.set(st, 'A', { pair: 'GONE' });
  const r1 = NM.audit(st, { stackup: null });
  // node 沒有 I18N，T() 回 key 本身——所以斷言比對的是「哪一種發現」，比比對譯文更精確
  eq(r1.filter(x => x.message === 'nm_drc_pair_gone').length, 1, '9.1 配對指向板上沒有的 net → 報');

  st.netProps = { A: { pair: 'B' }, B: { pair: 'C' } };
  const r2 = NM.audit(st, { stackup: null });
  eq(r2.filter(x => x.type === 'warning').length, 2, '9.2 單邊配對兩邊各報一條');

  // 過期屬性
  const st3 = { traces: [seg(0, 0, 10, 0, 'A')], components: [], vias: [], netProps: { A: { z0: 50 }, DEAD: { z0: 50 } } };
  eq(NM.stale(st3), ['DEAD'], '9.3 找得出過期屬性');
  const r3 = NM.audit(st3, { stackup: null });
  eq(r3.filter(x => x.message === 'nm_drc_stale').length, 1, '9.4 過期屬性報一條');
  eq(r3.find(x => x.message === 'nm_drc_stale').type, 'info', '9.5 只是 info，不擋');
  eq(NM.gc(st3), ['DEAD'], '9.6 gc 回報清掉哪些');
  eq(Object.keys(st3.netProps), ['A'], '9.7 gc 之後只留還在的');
  eq(NM.stale(st3).length, 0, '9.8 清完就沒有過期的了');

  // gc 之後，指向被清掉的 net 的反向配對也要斷
  const st4 = { traces: [seg(0, 0, 10, 0, 'A')], components: [], vias: [], netProps: { A: { pair: 'DEAD' }, DEAD: { pair: 'A' } } };
  NM.gc(st4);
  eq(NM.get(st4, 'A').pair, '', '9.9 gc 之後不可以留下指向不存在 net 的配對');
}

// ---- 10. 稽核：差動目標阻抗 ----
{
  const state = {
    layerStack: [{ id: 'F.Cu', kind: 'copper', type: 'Signal' }, { id: 'B.Cu', kind: 'copper', type: 'GND' }],
    traces: [seg(0, 0, 20, 0, 'RX_P', 0.25), seg(0, 0.45, 20, 0.45, 'RX_N', 0.25)],
    components: [], vias: [], netProps: {}
  };
  const stack = { oz: { 'F.Cu': 1, 'B.Cu': 1 }, diel: [{ t: 0.2, er: 4.4 }] };
  // 量到的間距 0.20mm → Zdiff ≈ 95.9Ω。目標 100Ω 差 4.1%，在 10% 容差內 → 不該報。
  NM.set(state, 'RX_P', { zdiff: 100 });
  eq(NM.audit(state, { stackup: stack }).length, 0, '10.1 差 4.1% 在容差內 → 不報');

  // 目標拉到 110Ω（差 12.9%）→ 必須報。
  // 不用 120Ω：0.25mm 線在這個疊層的 Zdiff 上限是 2×Z0 ≈ 117Ω，120 根本達不到，
  // gapFor 會（正確地）回 null，那就變成在測另一件事了。
  NM.set(state, 'RX_P', { zdiff: 110 });
  const r = NM.audit(state, { stackup: stack });
  eq([r.length, r[0].type], [1, 'warning'], '10.1b 差 20% 超出容差 → 報一條');

  // 照建議的間距擺，警告消失
  const g = Stackup.geomFor(stack, state, 'F.Cu');
  const wantS = NM.gapFor(g.kind, 110, 0.25, g.h, g.t, g.er);
  ok(wantS != null, '10.2 解得出達成 110Ω 需要的間距');
  eq(NM.gapFor(g.kind, 130, 0.25, g.h, g.t, g.er), null, '10.2a 超過 2×Z0 的 Zdiff 達不到，回 null');
  state.traces[1].y1 = state.traces[1].y2 = 0.25 + wantS;
  eq(NM.audit(state, { stackup: stack }).length, 0, '10.2b 照建議間距擺完，警告消失');

  // 拉開到不耦合 → 改報「量不出來」，不可以靜靜通過
  state.traces[1].y1 = state.traces[1].y2 = 9;
  const r3 = NM.audit(state, { stackup: stack });
  eq(r3.length, 1, '10.3 拉開之後還是要出聲');
  eq(r3[0].message, 'nm_drc_nocouple', '10.4 報的是「量不出差動間距」，不是硬算出來的阻抗誤差');
}

// ---- 11. summary：面板要的東西 ----
{
  const st = { traces: [seg(0, 0, 1, 0, 'A'), seg(0, 1, 1, 1, 'B')], netProps: { A: { z0: 50 } } };
  const s = NM.summary(st);
  eq(s.map(x => x.name), ['A', 'B'], '11.1 依名字排序');
  eq(s[0].z0, 50, '11.2 帶屬性');
  eq(s[1].z0, 0, '11.3 沒屬性的給 0');
}

// ---- 12. 邊界 ----
{
  eq(NM.refs(null).length, 0, '12.1 null state 不炸');
  eq(NM.names({}), [], '12.2 空 state');
  eq(NM.rename({ traces: [] }, 'A', 'A'), 0, '12.3 改成同名不做事');
  eq(NM.rename({ traces: [] }, '', 'B'), 0, '12.4 空名不做事');
  eq(NM.audit(null).length, 0, '12.5 null state 稽核不炸');
  eq(NM.set({}, '', { z0: 50 }), null, '12.6 空 net 名不寫');
  eq(NM.setPair({ netProps: {} }, 'A', 'A'), true, '12.7 自己配自己＝解除配對，不留自環');
  const st = { netProps: {} };
  NM.setPair(st, 'A', 'A');
  eq(NM.get(st, 'A').pair, '', '12.8 自環真的沒留下');
}

console.log(`\nnetmodel.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
