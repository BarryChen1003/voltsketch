/**
 * annotate.test.js — 線路圖 refdes 自動編號驗證（node）
 *
 * 盯住四件事：
 *   1. 排序方向（先上後下、再左至右），而且肉眼同高的元件不可以因為差幾 px 就跳帶。
 *   2. fill 模式「絕對不可以」動到已經編好的號碼——那會讓使用者的板子與筆記全部對不上。
 *   3. 補號要補進空洞（R1、R3 之間補 R2），不是接在最大號後面。
 *   4. GND / 電源軌不編號（它們是網路符號，編了 BOM 會髒）。
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

const A = require('./annotate.js');

let pass = 0, fail = 0;
function eq(a, b, msg) {
  const ok = JSON.stringify(a) === JSON.stringify(b);
  if (ok) pass++; else { fail++; console.error(`FAIL ${msg}\n  expected ${JSON.stringify(b)}\n  got      ${JSON.stringify(a)}`); }
}
const ok = (v, msg) => eq(!!v, true, msg);

const C = (id, type, x, y, label) => ({ id, type, x, y, label: label || '' });
const applied = (comps, res) => { A.apply(comps, res.changes); return comps.map(c => c.label); };

// ---- 1. splitRef ----
eq(A.splitRef('R12'), { p: 'R', n: 12 }, '1.1 拆出前綴與號碼');
eq(A.splitRef('R'), { p: 'R', n: null }, '1.2 只有前綴');
eq(A.splitRef(''), null, '1.3 空字串');
eq(A.splitRef('  U7 '), { p: 'U', n: 7 }, '1.4 前後空白不影響');
eq(A.splitRef('74HC00'), { p: '74HC00', n: null }, '1.5 認不得的名字當「已命名」，不去動它');

// ---- 2. 前綴表 ----
eq(A.prefixOf('resistor'), 'R', '2.1 電阻 R');
eq(A.prefixOf('nmos'), 'Q', '2.2 MOSFET 用 Q（不是 app.js 那個帶數字的 M1）');
eq(A.prefixOf('opamp'), 'U', '2.3 運放 U');
eq(A.prefixOf('xtal'), 'Y', '2.4 晶振 Y');
eq(A.prefixOf('ground'), null, '2.5 接地沒有前綴');

// ---- 3. 排序：先上後下、再左至右 ----
{
  const comps = [
    C('a', 'resistor', 300, 100), C('b', 'resistor', 100, 100),
    C('c', 'resistor', 200, 300), C('d', 'resistor', 50, 300),
  ];
  const r = A.plan(comps, { mode: 'renumber' });
  eq(r.changes.map(c => c.id + '=' + c.to), ['b=R1', 'a=R2', 'd=R3', 'c=R4'], '3.1 上排先編、排內由左至右');
}
{
  // 肉眼同高但 y 差 3px：不可以被拆成兩帶
  const comps = [C('a', 'resistor', 300, 100), C('b', 'resistor', 100, 103)];
  const r = A.plan(comps, { mode: 'renumber' });
  eq(r.changes.map(c => c.id + '=' + c.to), ['b=R1', 'a=R2'], '3.2 y 差 3px 視為同一帶，仍照 x 排');
}
{
  // 真的差一帶就要分開
  const comps = [C('a', 'resistor', 300, 100), C('b', 'resistor', 100, 200)];
  const r = A.plan(comps, { mode: 'renumber' });
  eq(r.changes.map(c => c.id + '=' + c.to), ['a=R1', 'b=R2'], '3.3 y 差 100px 分帶，上面的先編');
}

// ---- 4. fill 模式不可以動既有編號 ----
{
  const comps = [
    C('a', 'resistor', 100, 100, 'R7'),
    C('b', 'resistor', 200, 100, ''),
    C('c', 'capacitor', 300, 100, 'C3'),
    C('d', 'capacitor', 400, 100, ''),
  ];
  const r = A.plan(comps, { mode: 'fill' });
  eq(r.changes.map(c => c.id + '=' + c.to), ['b=R1', 'd=C1'], '4.1 只編沒號碼的，R7/C3 不動');
  eq(applied(comps, r), ['R7', 'R1', 'C3', 'C1'], '4.2 套用後既有編號原封不動');
}
{
  // 補號要補洞，不是接在最大號後面
  const comps = [
    C('a', 'resistor', 100, 100, 'R1'),
    C('b', 'resistor', 200, 100, 'R3'),
    C('c', 'resistor', 300, 100, ''),
    C('d', 'resistor', 400, 100, ''),
  ];
  const r = A.plan(comps, { mode: 'fill' });
  eq(r.changes.map(c => c.to), ['R2', 'R4'], '4.3 先補 R2 這個洞，再接 R4');
}
{
  // 前綴不符（電阻卻叫 C5）要重編，不能留著誤導
  const comps = [C('a', 'resistor', 100, 100, 'C5')];
  const r = A.plan(comps, { mode: 'fill' });
  eq(r.changes.map(c => c.from + '→' + c.to), ['C5→R1'], '4.4 前綴與型別不符要改掉');
}

// ---- 5. renumber 模式：每個前綴從 1 開始 ----
{
  const comps = [
    C('a', 'resistor', 100, 100, 'R99'),
    C('b', 'capacitor', 200, 100, 'C42'),
    C('c', 'resistor', 300, 100, 'R7'),
  ];
  const r = A.plan(comps, { mode: 'renumber' });
  eq(applied(comps, r), ['R1', 'C1', 'R2'], '5.1 全部重編，各前綴從 1 開始');
}

// ---- 6. 不編號的型別 ----
{
  const comps = [
    C('g1', 'ground', 100, 100), C('g2', 'ground', 200, 100),
    C('v1', 'vrail', 300, 100), C('r1', 'resistor', 400, 100),
  ];
  const r = A.plan(comps, { mode: 'renumber' });
  eq(r.changes.map(c => c.id), ['r1'], '6.1 GND 與電源軌不編號');
  eq(r.skipped.sort(), ['g1', 'g2', 'v1'], '6.2 被跳過的有回報，不是靜靜消失');
}

// ---- 7. 重複編號要報出來 ----
{
  const comps = [
    C('a', 'resistor', 100, 100, 'R1'),
    C('b', 'resistor', 200, 100, 'R1'),
    C('c', 'capacitor', 300, 100, 'C1'),
  ];
  const r = A.plan(comps, { mode: 'fill' });
  eq(r.dupes, ['R1'], '7.1 抓到重複的 R1');
  // fill 模式下兩顆都「有合格編號」，所以不動——重複是回報給使用者決定，不擅自改
  eq(r.changes.length, 0, '7.2 fill 不擅自處理重複（改了會讓使用者的走線註記對不上）');
}

// ---- 8. 邊界 ----
eq(A.plan([], { mode: 'renumber' }).changes, [], '8.1 空陣列不炸');
eq(A.plan(null, { mode: 'fill' }).changes, [], '8.2 null 不炸');
{
  const comps = [C('a', 'resistor', 0, 0)];
  eq(A.plan(comps, {}).changes.map(c => c.to), ['R1'], '8.3 沒給 mode 預設 fill');
  eq(A.plan(comps, { mode: 'fill' }).counts, { R: 1 }, '8.4 counts 有算');
}
{
  // 未知型別不可以被編成 X1 佔號
  const comps = [C('a', 'wormhole', 100, 100), C('b', 'resistor', 200, 100)];
  const r = A.plan(comps, { mode: 'renumber' });
  eq(r.changes.map(c => c.id + '=' + c.to), ['b=R1'], '8.5 未知型別不編號');
}
{
  // apply 只改 changes 指到的，其它一律不動
  const comps = [C('a', 'resistor', 100, 100, 'R5'), C('b', 'resistor', 200, 100, '')];
  const n = A.apply(comps, [{ id: 'b', from: '', to: 'R1' }]);
  eq([n, comps[0].label, comps[1].label], [1, 'R5', 'R1'], '8.6 apply 只動指定的那顆');
  eq(A.apply(comps, [{ id: 'nope', to: 'R9' }]), 0, '8.7 id 不存在就跳過，不新增元件');
}

console.log(`\nannotate.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
