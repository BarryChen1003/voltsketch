/**
 * pcb-index.test.js — 共用空間索引驗證（node）
 *
 * 空間索引的錯有一種特別惡劣的形式：**漏掉候選**。
 * 漏掉的結果是 DRC 少報一條違規——沒有錯誤訊息、沒有例外，
 * 只是那條違規從此不存在。所以這支的重點全部放在「不可以漏」：
 *   查詢範圍跟外框只碰到一條邊、物件跨很多格、負座標、剛好落在格線上。
 *
 * 另一組重點是 remove：增量 DRC 全靠它，拔不乾淨就會查到已經不存在的東西。
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

const IX = require('./pcb-index.js');

let pass = 0, fail = 0;
function eq(a, b, msg) {
  const ok = JSON.stringify(a) === JSON.stringify(b);
  if (ok) pass++; else { fail++; console.error(`FAIL ${msg}\n  expected ${JSON.stringify(b)}\n  got      ${JSON.stringify(a)}`); }
}
const ok = (v, msg) => eq(!!v, true, msg);
const sorted = s => [...s].sort();

// ---- 1. box 基礎 ----
{
  eq(IX.box(3, 4, 1, 2), { x0: 1, y0: 2, x1: 3, y1: 4 }, '1.1 座標順序反了也要正規化');
  eq(IX.expand(IX.box(0, 0, 1, 1), 0.5), { x0: -0.5, y0: -0.5, x1: 1.5, y1: 1.5 }, '1.2 膨脹');
  ok(IX.overlaps(IX.box(0, 0, 2, 2), IX.box(1, 1, 3, 3)), '1.3 重疊');
  ok(!IX.overlaps(IX.box(0, 0, 1, 1), IX.box(2, 2, 3, 3)), '1.4 不重疊');
  ok(IX.overlaps(IX.box(0, 0, 1, 1), IX.box(1, 1, 2, 2)), '1.5 只碰到一個角也算重疊（不可以漏）');
  eq(IX.union([IX.box(0, 0, 1, 1), IX.box(5, 5, 6, 6)]), { x0: 0, y0: 0, x1: 6, y1: 6 }, '1.6 聯集');
  eq(IX.union([]), null, '1.7 空清單回 null');
  eq(IX.area(IX.box(0, 0, 2, 3)), 6, '1.8 面積');
}

// ---- 2. 圖元外框：一定要含半寬 ----
{
  const t = { x1: 0, y1: 0, x2: 10, y2: 0, width: 0.4 };
  eq(IX.traceBox(t), { x0: -0.2, y0: -0.2, x1: 10.2, y1: 0.2 }, '2.1 走線外框含半寬（DRC 量的是銅邊不是中心線）');
  eq(IX.traceBox(t, 0.3), { x0: -0.5, y0: -0.5, x1: 10.5, y1: 0.5 }, '2.2 再加規則距離');
  const v = { x: 5, y: 5, d: 0.6 };
  eq(IX.viaBox(v), { x0: 4.7, y0: 4.7, x1: 5.3, y1: 5.3 }, '2.3 via 外框');
  eq(IX.padBox({ cx: 1, cy: 2, circ: 0.5 }), { x0: 0.5, y0: 1.5, x1: 1.5, y1: 2.5 }, '2.4 pad 用外接圓');
  eq(IX.padBox({ x: 0, y: 0, w: 2, h: 1 }), { x0: -1, y0: -1, x1: 1, y1: 1 }, '2.5 旋轉未知時取較長邊（寧可多篩）');
  eq(IX.polyBox([[0, 0], [3, 1], [1, 4]]), { x0: 0, y0: 0, x1: 3, y1: 4 }, '2.6 多邊形外框');
  eq(IX.polyBox([]), null, '2.7 空多邊形回 null');
}
{
  // 弧的外框要用 PcbArc（極值點可能不在端點上）
  global.window = global.window || {};
  const A = require('./pcb-arc.js');
  globalThis.PcbArc = A;
  const arc = A.fromCenter(0, 0, 1, 0, -1, 0, true);   // 上半圓
  const b = IX.traceBox({ x1: 1, y1: 0, x2: -1, y2: 0, width: 0.2, arc });
  eq(Math.round(b.y1 * 1000) / 1000, 1.1, '2.8 上半圓的外框上緣是 r + 半寬（不是端點）');
}

// ---- 3. 索引：不可以漏 ----
{
  const ix = IX.create(1);
  ix.insert('a', IX.box(0, 0, 0.5, 0.5));
  ix.insert('b', IX.box(5, 5, 5.5, 5.5));
  eq(sorted(ix.query(IX.box(0, 0, 1, 1))), ['a'], '3.1 查得到 a');
  eq(sorted(ix.query(IX.box(5, 5, 6, 6))), ['b'], '3.2 查得到 b');
  eq(sorted(ix.query(IX.box(2, 2, 3, 3))), [], '3.3 中間查不到東西');
  eq(sorted(ix.query(IX.box(0, 0, 6, 6))), ['a', 'b'], '3.4 大範圍兩個都查得到');
}
{
  // 跨很多格的長條物件
  const ix = IX.create(1);
  ix.insert('long', IX.box(0, 0, 100, 0.1));
  for (const x of [0, 25, 50, 99]) {
    eq(sorted(ix.query(IX.box(x, 0, x + 0.1, 0.1))), ['long'], '3.5 長物件在 x=' + x + ' 查得到');
  }
  eq(sorted(ix.query(IX.box(50, 5, 51, 6))), [], '3.6 離開它的 y 範圍就查不到');
}
{
  // 剛好落在格線上：最容易漏的情況
  const ix = IX.create(1);
  ix.insert('onLine', IX.box(1, 1, 1, 1));      // 退化成一個點，剛好在格線交點
  eq(sorted(ix.query(IX.box(1, 1, 1, 1))), ['onLine'], '3.7 格線上的點查得到');
  eq(sorted(ix.query(IX.box(0.9, 0.9, 1.1, 1.1))), ['onLine'], '3.8 跨格線的範圍查得到');
}
{
  // 負座標（板子原點在中心，一半的東西是負的）
  const ix = IX.create(2);
  ix.insert('neg', IX.box(-10, -10, -9, -9));
  eq(sorted(ix.query(IX.box(-10, -10, -9, -9))), ['neg'], '3.9 負座標查得到');
  eq(sorted(ix.query(IX.box(-11, -11, -8, -8))), ['neg'], '3.10 負座標的大範圍也查得到');
  eq(sorted(ix.query(IX.box(9, 9, 10, 10))), [], '3.11 對稱的正座標查不到（沒有把符號搞丟）');
}
{
  // 只碰到一條邊
  const ix = IX.create(1);
  ix.insert('x', IX.box(0, 0, 1, 1));
  eq(sorted(ix.query(IX.box(1, 0, 2, 1))), ['x'], '3.12 只碰到右邊界也要回傳（不可以漏）');
  eq(sorted(ix.query(IX.box(1.001, 0, 2, 1))), [], '3.13 差 0.001 就真的不重疊');
}

// ---- 4. 移除：增量 DRC 的命脈 ----
{
  const ix = IX.create(1);
  ix.insert('a', IX.box(0, 0, 3, 3));           // 跨 4×4 = 16 格
  eq(ix.size(), 1, '4.1 插入後 1 個');
  ok(ix.buckets() > 1, '4.2 確實跨多格');
  eq(ix.remove('a'), true, '4.3 移除回 true');
  eq(ix.size(), 0, '4.4 移除後 0 個');
  eq(ix.buckets(), 0, '4.5 空桶要一起清掉（不清會一直長）');
  eq(sorted(ix.query(IX.box(0, 0, 3, 3))), [], '4.6 移除後查不到——拔不乾淨會查到已經不存在的東西');
  eq(ix.remove('a'), false, '4.7 重複移除回 false');
  eq(ix.remove('nope'), false, '4.8 移除不存在的回 false');
}
{
  // 重新插入同一個 id = 更新位置
  const ix = IX.create(1);
  ix.insert('m', IX.box(0, 0, 1, 1));
  ix.insert('m', IX.box(10, 10, 11, 11));
  eq(ix.size(), 1, '4.9 同 id 重插不會變兩個');
  eq(sorted(ix.query(IX.box(0, 0, 1, 1))), [], '4.10 舊位置查不到了');
  eq(sorted(ix.query(IX.box(10, 10, 11, 11))), ['m'], '4.11 新位置查得到');
}
{
  const ix = IX.create(1);
  ix.insert('a', IX.box(0, 0, 1, 1));
  ix.insert('b', IX.box(0, 0, 1, 1));           // 同一格兩個
  ix.remove('a');
  eq(sorted(ix.query(IX.box(0, 0, 1, 1))), ['b'], '4.12 移除其中一個不影響另一個');
}

// ---- 5. autoCell ----
{
  const boxes = [IX.box(0, 0, 1, 1), IX.box(0, 0, 1, 1), IX.box(0, 0, 100, 1)];
  const c = IX.autoCell(boxes, 1);
  ok(c > 1 && c < 100, '5.1 用平均而不是最大（一條長電源線不該讓整塊板變一格）：' + c.toFixed(1));
  eq(IX.autoCell([], 3), 3, '5.2 空清單用 fallback');
  ok(IX.autoCell([IX.box(0, 0, 0.01, 0.01)], 1) >= 0.25, '5.3 有下限，不會小到爆炸');
  ok(IX.autoCell([IX.box(0, 0, 1e6, 1e6)], 1) <= 50, '5.4 有上限');
}

// ---- 6. dirtyRect：舊位置與新位置都要算 ----
{
  const changes = [{ before: IX.box(0, 0, 1, 1), after: IX.box(10, 10, 11, 11) }];
  const d = IX.dirtyRect(changes, 0.2);
  eq(d, { x0: -0.2, y0: -0.2, x1: 11.2, y1: 11.2 },
    '6.1 涵蓋舊位置與新位置（只算新的話，舊位置的違規會永遠留著）');
}
{
  eq(IX.dirtyRect([{ before: null, after: IX.box(0, 0, 1, 1) }], 0), { x0: 0, y0: 0, x1: 1, y1: 1 }, '6.2 新增（沒有 before）');
  eq(IX.dirtyRect([{ before: IX.box(0, 0, 1, 1), after: null }], 0), { x0: 0, y0: 0, x1: 1, y1: 1 }, '6.3 刪除（沒有 after）');
  eq(IX.dirtyRect([], 1), null, '6.4 沒有改動回 null');
  eq(IX.dirtyRect(null, 1), null, '6.5 null 不炸');
}

// ---- 7. 索引的結果要跟全比對一致（隨機資料交叉驗證）----
{
  // 固定種子的偽亂數，讓失敗可以重現
  let seed = 12345;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const items = [];
  for (let i = 0; i < 300; i++) {
    const x = rnd() * 100 - 50, y = rnd() * 100 - 50;
    const w = rnd() * 8 + 0.1, h = rnd() * 8 + 0.1;
    items.push({ id: 'i' + i, b: IX.box(x, y, x + w, y + h) });
  }
  const ix = IX.create(IX.autoCell(items.map(i => i.b), 1));
  items.forEach(i => ix.insert(i.id, i.b));

  let mismatch = 0;
  for (let k = 0; k < 60; k++) {
    const x = rnd() * 100 - 50, y = rnd() * 100 - 50;
    const q = IX.box(x, y, x + rnd() * 12, y + rnd() * 12);
    const fromIndex = sorted(ix.query(q));
    const brute = items.filter(i => IX.overlaps(i.b, q)).map(i => i.id).sort();
    if (JSON.stringify(fromIndex) !== JSON.stringify(brute)) mismatch++;
  }
  eq(mismatch, 0, '7.1 300 個物件 × 60 次查詢，索引結果與全比對完全一致');
}
{
  // 刪一半之後仍然一致
  let seed = 999;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const items = [];
  for (let i = 0; i < 200; i++) {
    const x = rnd() * 60 - 30, y = rnd() * 60 - 30;
    items.push({ id: 'j' + i, b: IX.box(x, y, x + rnd() * 5, y + rnd() * 5) });
  }
  const ix = IX.create(2);
  items.forEach(i => ix.insert(i.id, i.b));
  const kept = [];
  items.forEach((it, i) => { if (i % 2) ix.remove(it.id); else kept.push(it); });
  eq(ix.size(), kept.length, '7.2 刪一半之後數量正確');
  let mismatch = 0;
  for (let k = 0; k < 40; k++) {
    const x = rnd() * 60 - 30, y = rnd() * 60 - 30;
    const q = IX.box(x, y, x + rnd() * 10, y + rnd() * 10);
    const a = sorted(ix.query(q));
    const b = kept.filter(i => IX.overlaps(i.b, q)).map(i => i.id).sort();
    if (JSON.stringify(a) !== JSON.stringify(b)) mismatch++;
  }
  eq(mismatch, 0, '7.3 刪除之後查詢結果仍與全比對一致');
}

// ---- 8. 邊界 ----
{
  const ix = IX.create(0);
  eq(ix.cell, 1, '8.1 格子大小 0 要回退成 1（否則除以零）');
  eq(ix.insert('a', null), false, '8.2 插入 null 外框回 false');
  eq(sorted(ix.query(null)), [], '8.3 查 null 回空');
  ix.insert('x', IX.box(0, 0, 1, 1));
  ix.clear();
  eq([ix.size(), ix.buckets()], [0, 0], '8.4 clear 清乾淨');
}

console.log(`\npcb-index.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
