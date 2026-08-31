/**
 * sch-swap.test.js — pin / gate swap（sch-swap.js ＋ Sch2Pcb 的綁定與回寫）
 *
 * 這個功能只有兩種致命錯法：
 *   1. **換了不該換的腳**。LED 兩腳對調＝裝反，板子做出來才知道。
 *      第 2 節逐一釘住「哪些型別**不可以**換」——只驗「可以換的能換」測不到這件事。
 *   2. **換完活不過下一次同步**。merge() 的 net 以線路圖為準，
 *      交換只寫在板子上的話，ECO 一跑就被蓋回去而且沒有任何訊息。
 *      第 5 節把「換 → 回寫 → 再同步一次」整條路走完。
 *
 * 另外釘住 composeSwap 是**合成**不是覆寫：換過去再換回來要回到乾淨狀態，
 * 不可以留下一組恆等的排列（那會讓稽核報一條根本不存在的交換）。
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

global.window = { I18N: null };
require('./parts-lib.js');
try { require('./ic-data.js'); } catch (e) { }
require('./footprint-gen.js');
const SW = require('./sch-swap.js');
global.PartsLib = global.window.PartsLib;
global.FootprintGen = global.window.FootprintGen;
global.IC_DATA = global.window.IC_DATA || [];
global.SchSwap = SW;
const S2P = require('./pcb-sch2pcb.js') || global.window.Sch2Pcb;
const Sch2Pcb = global.window.Sch2Pcb || S2P;

let pass = 0, fail = 0;
function eq(a, b, msg) {
  const okk = JSON.stringify(a) === JSON.stringify(b);
  if (okk) pass++; else { fail++; console.error(`FAIL ${msg}\n  expected ${JSON.stringify(b)}\n  got      ${JSON.stringify(a)}`); }
}
const ok = (v, msg) => eq(!!v, true, msg);

const twoPin = () => [{ name: 'a', index: 0 }, { name: 'b', index: 1 }];
const netOf = (id, i) => 'N' + i;
const padsOf = comps => Sch2Pcb.convert(comps, twoPin, netOf, {}).components[0].pads.map(p => p.num + '=' + p.net).join(' ');

// ---- 1. 可以換的 ----
{
  for (const t of ['resistor', 'inductor', 'bead', 'fuse', 'varistor', 'gdt', 'xtal', 'lamp'])
    ok(SW.canSwapPins({ type: t }, 'a', 'b'), `1.1 ${t} 兩腳對稱，可換`);
  for (const t of ['and', 'or', 'nand', 'nor', 'xor', 'xnor'])
    ok(SW.canSwapPins({ type: t }, '1', '2'), `1.2 ${t} 的兩隻輸入可換`);
}

// ---- 2. **不可以**換的（這一節才是重點）----
{
  // 有極性：換了就是裝反
  ok(!SW.canSwapPins({ type: 'led' }, 'a', 'k'), '2.1 LED 不可換（換了就是裝反）');
  ok(!SW.canSwapPins({ type: 'diode' }, 'a', 'k'), '2.2 二極體不可換');
  ok(!SW.canSwapPins({ type: 'tvs' }, 'a', 'b'), '2.3 TVS 不可換');
  // 電容沒有「有沒有極性」這個欄位 → 分不出來就不要猜
  ok(!SW.canSwapPins({ type: 'capacitor' }, 'a', 'b'), '2.4 電容預設不可換（電解有極性，型別上分不出來）');
  // 三腳元件
  ok(!SW.canSwapPins({ type: 'npn' }, 'B', 'C'), '2.5 電晶體不可換');
  ok(!SW.canSwapPins({ type: 'nmos' }, 'G', 'D'), '2.6 MOS 不可換');
  ok(!SW.canSwapPins({ type: 'opamp' }, 'IN+', 'IN-'), '2.7 OP 的 IN+/IN− 不等價');
  // 邏輯閘：輸入可換不代表輸出/電源可換
  ok(!SW.canSwapPins({ type: 'nand' }, '1', '4'), '2.8 輸入不可以跟輸出換');
  ok(!SW.canSwapPins({ type: 'nand' }, '5', '3'), '2.9 VCC 不可以跟 GND 換');
  // 其它
  ok(!SW.canSwapPins({ type: 'resistor' }, 'a', 'a'), '2.10 自己跟自己不算換');
  ok(!SW.canSwapPins({ type: 'resistor' }, 'a', ''), '2.11 空腳名');
  ok(!SW.canSwapPins({ type: '沒這種' }, 'a', 'b'), '2.12 不認得的型別一律不可換');
  ok(!SW.canSwapPins(null, 'a', 'b'), '2.13 null');
}

// ---- 3. 使用者可以明確開放／關閉 ----
{
  const c = { type: 'capacitor', swapGroups: [['a', 'b']] };
  ok(SW.canSwapPins(c, 'a', 'b'), '3.1 元件自己寫 swapGroups 可以開放');
  const shut = { type: 'resistor', swapGroups: [] };
  ok(!SW.canSwapPins(shut, 'a', 'b'), '3.2 明講成空陣列＝這顆一隻都不准換（覆寫內建表）');
  eq(SW.groupsFor({ type: 'resistor' }), [['a', 'b']], '3.3 內建表');
  eq(SW.groupsFor({ type: 'resistor', swapGroups: [['x']] }), [], '3.4 只有一隻的組不算組');
  // 內建表不可以被呼叫端改到
  const g = SW.groupsFor({ type: 'resistor' }); g.push(['zz']);
  eq(SW.groupsFor({ type: 'resistor' }), [['a', 'b']], '3.5 回的是副本，改不到內建表');
}

// ---- 4. 排列：合成而不是覆寫 ----
{
  const r = { type: 'resistor' };
  eq(SW.permutationOf(r), {}, '4.1 沒換過就是空的');
  const s1 = SW.composeSwap(r, 'a', 'b');
  eq(s1, { ok: true, pinSwap: { a: 'b', b: 'a' } }, '4.2 換一次');
  r.pinSwap = s1.pinSwap;
  const s2 = SW.composeSwap(r, 'a', 'b');
  eq(s2, { ok: true, pinSwap: null }, '4.3 **再換一次要回到乾淨狀態**（合成，不是覆寫）');
  eq(SW.composeSwap({ type: 'led' }, 'a', 'k'), { ok: false, reason: 'notSwappable' }, '4.4 不可換的擋下來');
  eq(SW.composeSwap({ type: 'resistor' }, 'a', 'a'), { ok: false, reason: 'same' }, '4.5 同一隻腳');
  eq(SW.permutationOf({ pinSwap: { a: 'a' } }), {}, '4.6 恆等項不算排列');
  eq(SW.mapPin({ type: 'resistor', pinSwap: { a: 'b', b: 'a' } }, 'a'), 'b', '4.7 mapPin');
  eq(SW.mapPin({ type: 'resistor' }, 'a'), 'a', '4.8 沒換過就是自己');
  eq(SW.hasSwaps([{ type: 'resistor' }]), false, '4.9 沒有交換');
  eq(SW.hasSwaps([{ type: 'resistor', pinSwap: { a: 'b', b: 'a' } }]), true, '4.10 有交換');
}

// ---- 5. 端到端：換 → 回寫 → 再同步一次還在 ----
{
  const r = { id: 'r1', type: 'resistor', label: 'R1' };
  eq(padsOf([r]), '1=N0 2=N1', '5.1 未換時 pad1 取第 0 腳');

  r.pinSwap = SW.composeSwap(r, 'a', 'b').pinSwap;
  eq(padsOf([r]), '1=N1 2=N0', '5.2 換過之後 pad1 取第 1 腳');
  eq(Sch2Pcb.convert([r], twoPin, netOf, {}).components[0].notes.indexOf('pinSwap') >= 0, true, '5.3 轉換結果要標出「這顆有交換」');

  // 回寫到線路圖，再從線路圖同步一次 —— 這是「活不活得過 ECO」的真正考驗
  const pages = [{ name: 'P1', data: { components: [{ id: 'r1', type: 'resistor', label: 'R1' }] } }];
  const w = Sch2Pcb.annotateSwap(pages, 'r1', r.pinSwap);
  eq(w, { changed: 1, found: 1 }, '5.4 回寫');
  eq(pages[0].data.components[0].pinSwap, { a: 'b', b: 'a' }, '5.5 線路圖元件上留著');
  eq(padsOf(pages[0].data.components), '1=N1 2=N0', '5.6 **再同步一次，交換還在**（沒回寫的話這裡會變回 1=N0）');

  // merge 之後也要還在（ECO 用的是新轉出來的那顆）
  const fresh = Sch2Pcb.convert(pages[0].data.components, twoPin, netOf, {}).components;
  const old = [Object.assign({}, fresh[0], { x: 9, y: 9 })];
  const m = Sch2Pcb.merge(old, fresh);
  eq(m.components[0].pads.map(p => p.net).join(','), 'N1,N0', '5.7 ECO 合併後交換仍在');
  eq([m.components[0].x, m.components[0].y], [9, 9], '5.8 而且位置還是板子上的');

  // 清掉
  eq(Sch2Pcb.annotateSwap(pages, 'r1', null), { changed: 1, found: 1 }, '5.9 清掉');
  eq('pinSwap' in pages[0].data.components[0], false, '5.10 欄位整個移除，不留空物件');
  eq(padsOf(pages[0].data.components), '1=N0 2=N1', '5.11 清掉之後回到原狀');
  eq(Sch2Pcb.annotateSwap(pages, '不存在', { a: 'b' }), { changed: 0, found: 0 }, '5.12 找不到那顆');
}

// ---- 6. gate swap 的前提 ----
{
  const a = { id: '1', type: 'nand', name: '74HC00', footprint: 'ic:SOIC-14' };
  const b = { id: '2', type: 'nand', name: '74HC00', footprint: 'ic:SOIC-14' };
  ok(SW.canSwapGates(a, b), '6.1 同型同料號同封裝 → 可換');
  ok(!SW.canSwapGates(a, a), '6.2 自己跟自己不算');
  ok(!SW.canSwapGates(a, Object.assign({}, b, { type: 'nor' })), '6.3 型別不同');
  ok(!SW.canSwapGates(a, Object.assign({}, b, { name: '74HC08' })), '6.4 **料號不同不可以換**（74HC00 的閘不是 74HC08 的閘）');
  ok(!SW.canSwapGates(a, Object.assign({}, b, { footprint: 'ic:TSSOP-14' })), '6.5 封裝不同＝兩顆不一樣的料');
  ok(!SW.canSwapGates(a, null), '6.6 null');
  ok(!SW.canSwapGates({ type: '' }, { type: '' }), '6.7 沒有型別');
}

// ---- 7. 稽核：交換是隱形的，一定要列出來 ----
{
  const k = r => r.map(x => x.message);   // node 沒有 I18N，T() 回 key
  eq(SW.audit([{ type: 'resistor', label: 'R1' }]).length, 0, '7.1 沒換過就不出聲');
  const on = SW.audit([{ type: 'resistor', label: 'R1', pinSwap: { a: 'b', b: 'a' } }]);
  eq([on.length, on[0].type, on[0].message], [1, 'info', 'swap_drc_active'], '7.2 有交換要列出來（畫面上看不出來）');
  // 資料被手改壞：排列指到不可換的腳
  const bad = SW.audit([{ type: 'led', label: 'D1', pinSwap: { a: 'k', k: 'a' } }]);
  eq([bad.length, bad[0].type, bad[0].message], [1, 'error', 'swap_drc_invalid'], '7.3 指到不可換的腳 → error');
  eq(SW.audit([]).length, 0, '7.4 空');
  eq(SW.audit(null).length, 0, '7.5 null');
}

// ---- 同型元件對調（gate swap 的 UI 依據）----
// 判準只回 true/false 的話，畫面只能說「不能換」；使用者不知道是型別不同、
// 料號不同還是封裝不同——三種的處置完全不一樣，所以這裡守「理由」。
{
  const g = (o) => Object.assign({ type: 'nand', name: '74HC00', footprint: 'SOIC-14', x: 0, y: 0, rot: 0 }, o || {});
  const W = SchSwap.canSwapGatesWhy;

  ok(W(g(), g({ x: 5 })).ok, 'gate: 同型別同料號同封裝可換');
  eq(W(g(), g({ name: '74HC08' })).why, 'part', 'gate: 料號不同要說是料號');
  eq(W(g(), g({ type: 'and' })).why, 'type', 'gate: 型別不同要說是型別');
  eq(W(g(), g({ footprint: 'TSSOP-14' })).why, 'footprint', 'gate: 封裝不同要說是封裝');
  const one = g();
  eq(W(one, one).why, 'same', 'gate: 同一顆不可以跟自己換');
  eq(W(null, g()).why, 'need_two', 'gate: 少一顆要講');
  eq(W(g({ type: '' }), g({ type: '' })).why, 'no_type', 'gate: 沒有型別就判不了，不可以放行');
  // 理由要跟 canSwapGates 的判斷一致，否則畫面說不能換、程式卻換了
  ok(W(g(), g({ x: 5 })).ok === SchSwap.canSwapGates(g(), g({ x: 5 })), 'gate: 兩支判準結果一致');

  const a = g({ x: 1, y: 2, rot: 0 }), b = g({ x: 9, y: 8, rot: 90 });
  const pl = SchSwap.swapPlacement(a, b);
  eq(pl.a.x, 9, 'gate: a 拿到 b 的 x');
  eq(pl.a.rot, 90, 'gate: 角度也要跟著換（不換的話腳位方向不對）');
  eq(pl.b.y, 2, 'gate: b 拿到 a 的 y');
  // 回新值、不動原物件：呼叫端要先問過判準再套用，就地改的話那道守門測不到
  eq(a.x, 1, 'gate: 不可以就地改原物件');
  eq(SchSwap.swapPlacement(a, a), null, 'gate: 跟自己換回 null');
  eq(SchSwap.swapPlacement(a, null), null, 'gate: 缺一顆回 null');
}

// ---- 真的接上畫面 ----
{
  const fsx = require('fs'), pathx = require('path');
  const app = fsx.readFileSync(pathx.join(__dirname, 'pcb.js'), 'utf8');
  ok(app.indexOf('swapSelGates') > 0, 'gate: pcb.js 有對調入口');
  ok(app.indexOf('ratsnestLength') > 0, 'gate: 有量飛線總長（不然使用者不知道換了有沒有比較好）');
  const html = fsx.readFileSync(pathx.join(__dirname, 'pcb.html'), 'utf8');
  ok(html.indexOf('selSwapGateBtn') > 0, 'gate: pcb.html 有按鈕');
}

console.log(`\nsch-swap.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
