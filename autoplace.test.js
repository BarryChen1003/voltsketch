/**
 * autoplace.test.js — PCB 自動擺件（粗排）驗證（node）
 *
 * 這種功能最容易「看起來有動」但結果不能用。所以測的是可判定的幾何性質：
 *   1. 擺完之後不重疊（這是整個功能的重點，重疊就等於沒做）。
 *   2. 全部在板框內——包含力導向那條路徑，那裡最容易把元件甩出板外。
 *   3. 鎖住的元件一格都不能動。
 *   4. 同樣輸入永遠同樣輸出（沒有亂數，不然使用者按兩次結果不一樣）。
 *   5. 電源/地那種接了半塊板的網路不可以被當成連接（會把所有東西吸成一坨）。
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

const AP = require('./pcb-autoplace.js');

let pass = 0, fail = 0;
function eq(a, b, msg) {
  const ok = JSON.stringify(a) === JSON.stringify(b);
  if (ok) pass++; else { fail++; console.error(`FAIL ${msg}\n  expected ${JSON.stringify(b)}\n  got      ${JSON.stringify(a)}`); }
}
const ok = (v, msg) => eq(!!v, true, msg);

const C = (ref, w, h, x, y, pads) => ({ ref, id: 'sch-' + ref, x: x || 0, y: y || 0, w, h, pads: pads || [] });
const P = net => ({ net });

// 擺完之後實際檢查幾何（不看 plan 自己回報的數字，自己重算）
function geom(comps, res, W, H, gap, margin) {
  const list = comps.map(c => ({ ...c }));
  AP.apply(list, res.moves);
  let overlap = 0, outside = 0;
  for (let a = 0; a < list.length; a++) {
    const A = list[a];
    if (A.x - A.w / 2 < margin - 1e-6 || A.x + A.w / 2 > W - margin + 1e-6 ||
        A.y - A.h / 2 < margin - 1e-6 || A.y + A.h / 2 > H - margin + 1e-6) outside++;
    for (let b = a + 1; b < list.length; b++) {
      const B = list[b];
      if (Math.abs(B.x - A.x) < (A.w + B.w) / 2 + gap - 1e-6 &&
          Math.abs(B.y - A.y) < (A.h + B.h) / 2 + gap - 1e-6) overlap++;
    }
  }
  return { overlap, outside, list };
}

// ---- 1. 全部疊在原點的一堆元件 ----
{
  const comps = [];
  for (let i = 0; i < 12; i++) comps.push(C('R' + i, 3, 1.5, 0, 0));
  const res = AP.plan(comps, { boardWidth: 60, boardHeight: 40 });
  const g = geom(comps, res, 60, 40, 0.8, 2);
  eq(res.moves.length, 12, '1.1 12 顆全部被移動（原本都疊在原點）');
  eq(g.overlap, 0, '1.2 擺完沒有任何重疊');
  eq(g.outside, 0, '1.3 全部在板框內');
  eq(res.linked, 0, '1.4 沒有 net 就不跑力導向');
}

// ---- 2. 可重現 ----
{
  const mk = () => [C('U1', 10, 10), C('R1', 2, 1), C('C1', 2, 1), C('R2', 2, 1)];
  const a = AP.plan(mk(), { boardWidth: 40, boardHeight: 30 });
  const b = AP.plan(mk(), { boardWidth: 40, boardHeight: 30 });
  eq(a.moves, b.moves, '2.1 同樣輸入兩次結果完全相同（無亂數）');
}

// ---- 3. 大件先放 ----
{
  const comps = [C('R1', 2, 1), C('U1', 12, 12), C('C1', 2, 1)];
  const res = AP.plan(comps, { boardWidth: 40, boardHeight: 30 });
  const g = geom(comps, res, 40, 30, 0.8, 2);
  const u = g.list.find(c => c.ref === 'U1');
  ok(u.x - u.w / 2 <= 2 + 1e-6, '3.1 面積最大的 U1 排在最左（大件先放）');
  eq(g.overlap, 0, '3.2 仍然不重疊');
}

// ---- 4. 鎖住的不能動 ----
{
  const comps = [C('U1', 10, 10, 30, 20), C('R1', 2, 1, 0, 0), C('R2', 2, 1, 0, 0)];
  const res = AP.plan(comps, { boardWidth: 60, boardHeight: 40, locked: ['U1'] });
  eq(res.moves.some(m => m.ref === 'U1'), false, '4.1 鎖住的 U1 不在移動清單裡');
  const g = geom(comps, res, 60, 40, 0.8, 2);
  const u = g.list.find(c => c.ref === 'U1');
  eq([u.x, u.y], [30, 20], '4.2 U1 座標一格都沒動');
  eq(g.overlap, 0, '4.3 其它元件會讓開，不跟鎖住的重疊');
}

// ---- 5. net 連接：相連的要靠近 ----
{
  const comps = [
    C('U1', 6, 6, 0, 0, [P('D0'), P('D1')]),
    C('R1', 2, 1, 0, 0, [P('D0')]),
    C('R2', 2, 1, 0, 0, [P('D1')]),
    C('X9', 2, 1, 0, 0, []),                      // 完全不相連
  ];
  const res = AP.plan(comps, { boardWidth: 60, boardHeight: 40 });
  ok(res.linked >= 2, '5.1 有抓到連接對');
  const g = geom(comps, res, 60, 40, 0.8, 2);
  const d = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const u = g.list.find(c => c.ref === 'U1');
  const r1 = g.list.find(c => c.ref === 'R1');
  const x9 = g.list.find(c => c.ref === 'X9');
  ok(d(u, r1) < d(u, x9), '5.2 相連的 R1 比不相連的 X9 更靠近 U1');
  eq(g.overlap, 0, '5.3 力導向之後仍然不重疊');
  eq(g.outside, 0, '5.4 力導向之後仍然全在板框內');
}

// ---- 6. 電源/地不可以被當成連接 ----
{
  // 12 顆全部接 GND，只有兩顆另外接 SIG
  const comps = [];
  for (let i = 0; i < 12; i++) comps.push(C('C' + i, 2, 1, 0, 0, [P('GND')]));
  comps[0].pads.push(P('SIG')); comps[1].pads.push(P('SIG'));
  const links = AP.adjacency(comps, { maxFanout: 8 });
  eq(links.length, 1, '6.1 GND（12 顆）被忽略，只留 SIG 那一對');
  eq([links[0].i, links[0].j], [0, 1], '6.2 留下的是接 SIG 的那兩顆');
}
{
  const comps = [C('A', 2, 1, 0, 0, [P('N1')]), C('B', 2, 1, 0, 0, [P('N1')]), C('C', 2, 1, 0, 0, [P('N1')])];
  eq(AP.adjacency(comps, { maxFanout: 8 }).length, 3, '6.3 3 顆共網路 → 3 對（未超過門檻）');
}
{
  // 小板陷阱：6 顆元件、GND 接 5 顆。絕對門檻 8 抓不到，會把整塊板吸成一坨。
  // 這是在瀏覽器實測時抓到的，不是想像出來的案例。
  const comps = [
    C('U1', 10, 10, 0, 0, [P('D0'), P('D1'), P('GND')]),
    C('R1', 2, 1, 0, 0, [P('D0'), P('GND')]),
    C('R2', 2, 1, 0, 0, [P('D1'), P('GND')]),
    C('C1', 2, 1, 0, 0, [P('GND')]),
    C('C2', 2, 1, 0, 0, [P('GND')]),
    C('J1', 8, 4, 0, 0, []),
  ];
  const links = AP.adjacency(comps, {});
  eq(links.length, 2, '6.4 6 顆板子上的 GND（接 5 顆）不可以被當成連接，只留 D0/D1 兩對');
  eq(links.map(l => l.i + '-' + l.j), ['0-1', '0-2'], '6.5 留下的是 U1-R1 與 U1-R2');
}
{
  // 名字看得出來是電源的，不管接幾顆都排除
  const comps = [C('A', 2, 1, 0, 0, [P('VCC')]), C('B', 2, 1, 0, 0, [P('VCC')])];
  eq(AP.adjacency(comps, {}).length, 0, '6.6 VCC 兩顆也排除（靠網名，不靠數量）');
  ok(AP.POWER_RE.test('3V3') && AP.POWER_RE.test('AGND') && AP.POWER_RE.test('vdd'), '6.7 常見電源網名都認得');
  eq(AP.POWER_RE.test('SDA'), false, '6.8 訊號網名不會被誤判成電源');
}

// ---- 7. 塞不下的元件照實回報 ----
{
  const comps = [C('BIG', 200, 200, 5, 5), C('R1', 2, 1, 0, 0)];
  const res = AP.plan(comps, { boardWidth: 50, boardHeight: 40 });
  eq(res.skipped, ['BIG'], '7.1 大過板框的元件被標出來，不硬塞');
  eq(res.moves.some(m => m.ref === 'BIG'), false, '7.2 也不會去移動它');
}

// ---- 8. 邊界 ----
eq(AP.plan([], { boardWidth: 50, boardHeight: 40 }).moves, [], '8.1 空陣列不炸');
eq(AP.plan(null, {}).moves, [], '8.2 null 不炸');
{
  const comps = [C('R1', 0, 0, 0, 0)];            // 零尺寸
  const res = AP.plan(comps, { boardWidth: 50, boardHeight: 40 });
  const g = geom(comps, res, 50, 40, 0.8, 2);
  eq(g.outside, 0, '8.3 零尺寸元件不會被算出 NaN 或跑出板外');
}
{
  // 板子太小塞不下所有元件時，不可以出框（寧可擠也不出去）
  const comps = [];
  for (let i = 0; i < 30; i++) comps.push(C('R' + i, 3, 3, 0, 0));
  const res = AP.plan(comps, { boardWidth: 20, boardHeight: 20 });
  const g = geom(comps, res, 20, 20, 0.8, 2);
  eq(g.outside, 0, '8.4 板子塞不下時仍然全部留在板框內（會重疊，但不出框）');
  ok(g.overlap > 0, '8.5 而且重疊有發生——這是誠實的結果，不是假裝排好了');
  ok(res.overlaps > 0, '8.6 plan() 自己也回報了重疊數，讓 UI 能提醒使用者');
}

// ---- 9. apply ----
{
  const comps = [C('R1', 2, 1, 0, 0), C('R2', 2, 1, 0, 0)];
  const n = AP.apply(comps, [{ id: 'sch-R1', ref: 'R1', to: { x: 9, y: 8 } }]);
  eq([n, comps[0].x, comps[0].y, comps[1].x], [1, 9, 8, 0], '9.1 apply 只動指定的那顆');
  eq(AP.apply(comps, [{ id: 'nope', ref: 'nope', to: { x: 1, y: 1 } }]), 0, '9.2 找不到就跳過');
}

console.log(`\nautoplace.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
