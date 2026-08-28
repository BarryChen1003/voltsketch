/**
 * sch-spice.test.js — 線路圖 → SPICE 網表的轉換驗證（node）
 *
 * 轉換層最危險的失敗是「轉出一個能跑但錯的網表」：接地認錯、電容單位差 10⁶、
 * 認不得的元件被當成短路。這些都會產生看起來合理的數字，沒有任何錯誤訊息。
 * 所以這支測的是轉換的每一個決定，而且最後用**解析解**驗端到端。
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

global.window = {};
require('./spice.js');
require('./circuit-engine.js');
require('./sch-spice.js');
const SS = global.window.SchSpice;
const CE = global.window.CircuitEngine;
const Spice = global.window.Spice;

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

ok(!!SS, '0.1 SchSpice 載入');
ok(!!CE && !!CE.computeNets, '0.2 CircuitEngine 載入');
ok(!!Spice, '0.3 Spice 載入');

// 用 CircuitEngine 的 getPins 取得腳位座標，接線就照那些座標畫
const P = (c, i) => CE.getPins(c)[i];
function wireBetween(a, ai, b, bi) {
  const p = P(a, ai), q = P(b, bi);
  return { x1: p.x, y1: p.y, x2: q.x, y2: q.y };
}

// ---- 1. 分壓器：端到端對解析解 ----
{
  const V1 = { id: 'v1', type: 'source', x: 0, y: 0, rotation: 0, label: 'V1', value: 10 };
  const R1 = { id: 'r1', type: 'resistor', x: 200, y: 0, rotation: 0, label: 'R1', value: 1000 };
  const R2 = { id: 'r2', type: 'resistor', x: 400, y: 0, rotation: 0, label: 'R2', value: 3000 };
  const G1 = { id: 'g1', type: 'ground', x: 0, y: 200, rotation: 0, label: '' };
  const comps = [V1, R1, R2, G1];
  const wires = [
    wireBetween(V1, 0, R1, 0),
    wireBetween(R1, 1, R2, 0),
    wireBetween(R2, 1, G1, 0),
    wireBetween(V1, 1, G1, 0),
  ];

  const nl = SS.toNetlist(comps, wires, CE);
  eq(nl.unsupported, [], '1.1 全部認得');
  eq(nl.groundCount, 1, '1.2 認出一個接地符號');
  eq(nl.elements.length, 3, '1.3 三個電路元件（接地不算元件）');
  eq(nl.elements.map(e => e.type).sort(), ['R', 'R', 'V'], '1.4 型別對應');
  eq(nl.warnings, [], '1.5 沒有警告');

  const r = SS.dc(comps, wires, CE);
  ok(r.ok, '1.6 DC 收斂');
  // 10V 經 1k / 3k 分壓：中點 = 10 × 3/4 = 7.5V
  const mid = nl.elements.find(e => e.id === 'R1').nodes[1];
  near(r.result.nodes[mid], 7.5, 1e-6, '1.7 分壓中點 7.5V（解析解）');
}

// ---- 2. 並聯：單迴路估算算不出來的那種 ----
{
  // 10V → R1(1k) → 節點 A → 兩顆 2k 並聯到地。等效 1k，所以 A = 5V
  const V1 = { id: 'v1', type: 'source', x: 0, y: 0, rotation: 0, label: 'V1', value: 10 };
  const R1 = { id: 'r1', type: 'resistor', x: 200, y: 0, rotation: 0, label: 'R1', value: 1000 };
  const R2 = { id: 'r2', type: 'resistor', x: 400, y: 0, rotation: 0, label: 'R2', value: 2000 };
  const R3 = { id: 'r3', type: 'resistor', x: 400, y: 100, rotation: 0, label: 'R3', value: 2000 };
  const G1 = { id: 'g1', type: 'ground', x: 0, y: 300, rotation: 0, label: '' };
  const comps = [V1, R1, R2, R3, G1];
  const wires = [
    wireBetween(V1, 0, R1, 0),
    wireBetween(R1, 1, R2, 0),
    wireBetween(R1, 1, R3, 0),
    wireBetween(R2, 1, G1, 0),
    wireBetween(R3, 1, G1, 0),
    wireBetween(V1, 1, G1, 0),
  ];
  const r = SS.dc(comps, wires, CE);
  ok(r.ok, '2.1 並聯電路收斂');
  const a = r.netlist.elements.find(e => e.id === 'R1').nodes[1];
  near(r.result.nodes[a], 5, 1e-6, '2.2 兩顆 2k 並聯 = 1k → 中點 5V（並聯算得出來）');
}

// ---- 3. 單位換算：電容存的是 µF、電感是 µH ----
{
  const C1 = { id: 'c1', type: 'capacitor', x: 0, y: 0, rotation: 0, label: 'C1', value: 100 };  // 100µF
  const L1 = { id: 'l1', type: 'inductor', x: 100, y: 0, rotation: 0, label: 'L1', value: 10 };   // 10µH
  const nl = SS.toNetlist([C1, L1], [], CE);
  const c = nl.elements.find(e => e.type === 'C');
  const l = nl.elements.find(e => e.type === 'L');
  near(c.value, 100e-6, 1e-15, '3.1 電容 100（µF）→ 1e-4 F');
  near(l.value, 10e-6, 1e-15, '3.2 電感 10（µH）→ 1e-5 H');
}

// ---- 4. 接地：所有接到 ground 的網路都變成 '0' ----
{
  const R1 = { id: 'r1', type: 'resistor', x: 0, y: 0, rotation: 0, label: 'R1', value: 1000 };
  const G1 = { id: 'g1', type: 'ground', x: 0, y: 200, rotation: 0, label: '' };
  const nl = SS.toNetlist([R1, G1], [wireBetween(R1, 1, G1, 0)], CE);
  const r = nl.elements[0];
  ok(r.nodes.includes('0'), '4.1 接到 ground 的那一腳節點是 0');
  eq(nl.groundCount, 1, '4.2 接地數量正確');
}
{
  const R1 = { id: 'r1', type: 'resistor', x: 0, y: 0, rotation: 0, label: 'R1', value: 1000 };
  const nl = SS.toNetlist([R1], [], CE);
  ok(nl.warnings.includes('no_ground'), '4.3 沒有接地要警告（不然錯誤會變成看不懂的 singular_matrix）');
  ok(nl.warnings.includes('no_source'), '4.4 沒有電源也要警告');
}

// ---- 5. 認不得的元件不可以被硬塞 ----
{
  const U1 = { id: 'u1', type: 'opamp', x: 0, y: 0, rotation: 0, label: 'U1' };
  const R1 = { id: 'r1', type: 'resistor', x: 200, y: 0, rotation: 0, label: 'R1', value: 1000 };
  const nl = SS.toNetlist([U1, R1], [], CE);
  eq(nl.unsupported.map(u => u.type), ['opamp'], '5.1 運放列進 unsupported');
  eq(nl.elements.length, 1, '5.2 而且不會被當成短路或開路塞進網表');
  const r = SS.dc([U1, R1], [], CE);
  eq([r.ok, r.reason], [false, 'unsupported'], '5.3 有不支援的元件就拒絕分析，不給一個錯的答案');
}
{
  // 純顯示用的符號不算「不支援」，只是跳過
  const T1 = { id: 't1', type: 'text', x: 0, y: 0, rotation: 0, label: '' };
  const SH = { id: 's1', type: 'shield', x: 0, y: 0, rotation: 0, label: '' };
  const nl = SS.toNetlist([T1, SH], [], CE);
  eq(nl.unsupported, [], '5.4 文字與屏蔽罩不算不支援');
  eq(nl.elements.length, 0, '5.5 但也不會進網表');
}

// ---- 6. vrail：一端天生接地 ----
{
  const VR = { id: 'vr1', type: 'vrail', x: 0, y: 0, rotation: 0, label: '3V3', value: 3.3 };
  const R1 = { id: 'r1', type: 'resistor', x: 100, y: 0, rotation: 0, label: 'R1', value: 1000 };
  const G1 = { id: 'g1', type: 'ground', x: 0, y: 300, rotation: 0, label: '' };
  const comps = [VR, R1, G1];
  const wires = [wireBetween(VR, 0, R1, 0), wireBetween(R1, 1, G1, 0)];
  const nl = SS.toNetlist(comps, wires, CE);
  const v = nl.elements.find(e => e.type === 'V');
  ok(v, '6.1 vrail 變成電壓源');
  eq(v.nodes[1], '0', '6.2 另一端直接接 0');
  near(v.value, 3.3, 1e-12, '6.3 電壓值帶過來');
  const r = SS.dc(comps, wires, CE);
  ok(r.ok, '6.4 vrail 電路解得出來');
  near(r.result.nodes[v.nodes[0]], 3.3, 1e-9, '6.5 節點電壓 = 3.3V');
}

// ---- 7. 開關 ----
{
  const mk = closed => ({ id: 's1', type: 'switch', x: 0, y: 0, rotation: 0, label: 'SW1', closed });
  const on = SS.toNetlist([mk(true)], [], CE).elements[0];
  const off = SS.toNetlist([mk(false)], [], CE).elements[0];
  eq(on.type, 'R', '7.1 開關用電阻近似');
  ok(on.value < 1, '7.2 閉合是小電阻');
  ok(off.value > 1e6, '7.3 斷開是大電阻（不是移除元件——移除會讓節點浮接更難解）');
}

// ---- 8. 瞬態端到端：RC 步階 ----
{
  // 電壓源的 DC 值要是 0：瞬態會先解一次工作點當起始條件，
  // 值留 1 的話工作點就已經是 1V（電容 DC 開路），曲線一開始就在頂端，
  // 根本沒有上升過程可以驗。步階由下面的 tran 設定提供。
  const V1 = { id: 'v1', type: 'source', x: 0, y: 0, rotation: 0, label: 'V1', value: 0 };
  const R1 = { id: 'r1', type: 'resistor', x: 200, y: 0, rotation: 0, label: 'R1', value: 1000 };
  const C1 = { id: 'c1', type: 'capacitor', x: 400, y: 0, rotation: 0, label: 'C1', value: 1 }; // 1µF
  const G1 = { id: 'g1', type: 'ground', x: 0, y: 300, rotation: 0, label: '' };
  const comps = [V1, R1, C1, G1];
  const wires = [
    wireBetween(V1, 0, R1, 0),
    wireBetween(R1, 1, C1, 0),
    wireBetween(C1, 1, G1, 0),
    wireBetween(V1, 1, G1, 0),
  ];
  const nl = SS.toNetlist(comps, wires, CE);
  const out = nl.elements.find(e => e.type === 'C').nodes[0];
  // τ = 1k × 1µF = 1ms
  const tau = 1e-3;
  // 把電壓源換成步階
  nl.elements.find(e => e.type === 'V').tran = { kind: 'step', v1: 0, v2: 1, td: 0 };
  const r = Spice.tran(nl.elements, { stop: 5 * tau, step: tau / 400 });
  ok(r.converged, '8.1 瞬態收斂');
  const at = tt => {
    let bi = 0;
    for (let i = 1; i < r.t.length; i++) if (Math.abs(r.t[i] - tt) < Math.abs(r.t[bi] - tt)) bi = i;
    return r.nodes[out][bi];
  };
  const rel = (a, b) => Math.abs(a - b) / Math.abs(b);
  ok(rel(at(tau), 1 - Math.exp(-1)) < 0.02, '8.2 t=τ 時 63.2%（整條路端到端對解析解）');
  ok(rel(at(3 * tau), 1 - Math.exp(-3)) < 0.02, '8.3 t=3τ 時 95.0%');
}

// ---- 9. 邊界 ----
eq(SS.toNetlist([], [], CE).warnings, ['empty'], '9.1 空電路');
eq(SS.toNetlist(null, null, CE).warnings, ['empty'], '9.2 null 不炸');
eq(SS.toNetlist([{ id: 'x', type: 'resistor', x: 0, y: 0 }], [], null).warnings, ['no_engine'], '9.3 沒有引擎要講');

console.log(`\nsch-spice.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
