/**
 * backannotate.test.js — refdes / net 改名的雙向同步驗證（node）
 *
 * 為什麼這一支重要：Sch2Pcb.merge() 合併時寫的是
 *   Object.assign({}, nc, { x: old.x, y: old.y, rot: old.rot })
 * 也就是 **ref 與 net 以線路圖為準、位置以板子為準**。
 * 所以 PCB 端改了 refdes 卻沒有回寫的話，下一次同步就被蓋回去——
 * 使用者會看到「我明明改過，同步一次又變回來」，而且中間沒有任何錯誤訊息。
 *
 * 這支同時把「回寫之後再同步一次，改動要活著」整條路走一遍。
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

global.window = {};
const S2P = require('./pcb-sch2pcb.js') || global.window.Sch2Pcb;
const Sch2Pcb = global.window.Sch2Pcb || S2P;

let pass = 0, fail = 0;
function eq(a, b, msg) {
  const ok = JSON.stringify(a) === JSON.stringify(b);
  if (ok) pass++; else { fail++; console.error(`FAIL ${msg}\n  expected ${JSON.stringify(b)}\n  got      ${JSON.stringify(a)}`); }
}
const ok = (v, msg) => eq(!!v, true, msg);

const mkPages = () => ([
  {
    name: 'P1', data: {
      components: [
        { id: 'r1', type: 'resistor', label: 'R1', x: 0, y: 0 },
        { id: 'c1', type: 'capacitor', label: 'C1', x: 100, y: 0 },
      ],
      wires: [
        { x1: 0, y1: 0, x2: 50, y2: 0, net: 'VCC' },
        { x1: 50, y1: 0, x2: 100, y2: 0, net: 'VCC' },
        { x1: 0, y1: 50, x2: 100, y2: 50, net: 'GND' },
      ],
    },
  },
  {
    name: 'P2', data: {
      components: [{ id: 'u1', type: 'ic', label: 'U1', x: 0, y: 0 }],
      wires: [{ x1: 0, y1: 0, x2: 30, y2: 0, net: 'VCC' }],
    },
  },
]);

// ---- 1. refdes 回寫 ----
{
  const pages = mkPages();
  const r = Sch2Pcb.annotateRef(pages, 'r1', 'R7');
  eq([r.changed, r.found, r.conflict], [1, 1, null], '1.1 改到一顆');
  eq(pages[0].data.components[0].label, 'R7', '1.2 線路圖上的 label 真的變了');
  eq(pages[0].data.components[1].label, 'C1', '1.3 沒有動到別顆');
}
{
  // 撞名不可以改——兩顆 R1 會讓 BOM / 網表 / 電測全部對不上
  const pages = mkPages();
  const r = Sch2Pcb.annotateRef(pages, 'r1', 'C1');
  eq([r.changed, r.conflict], [0, 'c1'], '1.4 撞名時不改，並回報是誰佔用');
  eq(pages[0].data.components[0].label, 'R1', '1.5 原本的 label 一格沒動');
}
{
  // 跨頁撞名也要抓到
  const pages = mkPages();
  const r = Sch2Pcb.annotateRef(pages, 'r1', 'U1');
  eq([r.changed, r.conflict], [0, 'u1'], '1.6 跨頁撞名也擋');
}
{
  const pages = mkPages();
  eq(Sch2Pcb.annotateRef(pages, 'r1', '   ').changed, 0, '1.7 空白名稱不改');
  eq(Sch2Pcb.annotateRef(pages, 'nope', 'R9').found, 0, '1.8 找不到那顆就回報 found=0');
  eq(pages[0].data.components[0].label, 'R1', '1.9 而且什麼都沒改到');
}
{
  // 改成自己現在的名字＝沒事做，但不算失敗
  const pages = mkPages();
  const r = Sch2Pcb.annotateRef(pages, 'r1', 'R1');
  eq([r.changed, r.found, r.conflict], [0, 1, null], '1.10 改成同名時 changed=0 但 found=1');
}

// ---- 2. net 改名 ----
{
  const pages = mkPages();
  const r = Sch2Pcb.renameNet(pages, 'VCC', '3V3');
  eq([r.changed, r.pages, r.conflict], [3, 2, null], '2.1 兩頁共三段導線都改到');
  eq(pages[0].data.wires.map(w => w.net), ['3V3', '3V3', 'GND'], '2.2 P1 的 VCC 改了、GND 沒動');
  eq(pages[1].data.wires[0].net, '3V3', '2.3 P2 的也改了（跨頁同名就是同一條 net）');
}
{
  // 改成已存在的名字＝合併兩條網路，那是電性變更，不可以當改名做掉
  const pages = mkPages();
  const r = Sch2Pcb.renameNet(pages, 'VCC', 'GND');
  eq([r.changed, r.conflict], [0, 'GND'], '2.4 撞名時不改，回報衝突');
  eq(pages[0].data.wires.map(w => w.net), ['VCC', 'VCC', 'GND'], '2.5 一條都沒動');
}
{
  const pages = mkPages();
  eq(Sch2Pcb.renameNet(pages, 'VCC', 'VCC').changed, 0, '2.6 同名不做事');
  eq(Sch2Pcb.renameNet(pages, '', 'X').changed, 0, '2.7 空的舊名不做事');
  eq(Sch2Pcb.renameNet(pages, 'VCC', '').changed, 0, '2.8 空的新名不做事');
  eq(Sch2Pcb.renameNet(pages, 'NOSUCH', 'X').changed, 0, '2.9 不存在的 net 改 0 條');
}

// ---- 3. 邊界 ----
eq(Sch2Pcb.annotateRef(null, 'r1', 'R9').changed, 0, '3.1 pages 為 null 不炸');
eq(Sch2Pcb.renameNet(null, 'A', 'B').changed, 0, '3.2 renameNet 吃 null 不炸');
eq(Sch2Pcb.annotateRef([{ data: {} }], 'r1', 'R9').found, 0, '3.3 頁面沒有 components 不炸');
eq(Sch2Pcb.renameNet([{ data: {} }], 'A', 'B').changed, 0, '3.4 頁面沒有 wires 不炸');
eq(Sch2Pcb.renameNet([{ data: { wires: [null, { net: 'A' }] } }], 'A', 'B').changed, 1, '3.5 陣列裡有 null 不炸');

// ---- 4. 回寫之後再同步一次，改動要活著（整條路）----
{
  const pages = mkPages();
  // PCB 端把 r1 改名成 R7 並回寫
  Sch2Pcb.annotateRef(pages, 'r1', 'R7');

  // 模擬一次 ECO 同步：線路圖 → 轉換 → 與既有板子 merge
  const schComps = pages[0].data.components;
  const converted = schComps.map(c => ({
    id: 'sch-' + c.id, ref: c.label, x: 0, y: 0, rot: 0, pads: [],
  }));
  const existing = [
    { id: 'sch-r1', ref: 'R1', x: 12, y: 34, rot: 90, pads: [] },   // 板子上還是舊名、但位置是使用者擺的
    { id: 'sch-c1', ref: 'C1', x: 50, y: 60, rot: 0, pads: [] },
  ];
  const m = Sch2Pcb.merge(existing, converted);
  const r1 = m.components.find(c => c.id === 'sch-r1');
  eq(r1.ref, 'R7', '4.1 同步之後 ref 是回寫過的 R7（沒有被蓋回 R1）');
  eq([r1.x, r1.y, r1.rot], [12, 34, 90], '4.2 而且使用者擺的位置與旋轉都保住了');
}
{
  // 反例：沒有回寫的話，同步就會把 PCB 端的改名蓋掉
  const pages = mkPages();
  const converted = pages[0].data.components.map(c => ({ id: 'sch-' + c.id, ref: c.label, x: 0, y: 0, rot: 0, pads: [] }));
  const existing = [{ id: 'sch-r1', ref: 'R7', x: 12, y: 34, rot: 90, pads: [] }];
  const m = Sch2Pcb.merge(existing, converted);
  eq(m.components.find(c => c.id === 'sch-r1').ref, 'R1',
    '4.3 沒有回寫時同步會把 R7 蓋回 R1——這正是必須回寫的理由');
}

console.log(`\nbackannotate.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
