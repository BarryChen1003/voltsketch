/**
 * crossprobe.test.js — 線路圖 ↔ PCB 選取連動驗證（node，無瀏覽器）
 *
 * 這種雙向連動最容易壞在兩個地方：
 *   1. 回音：A 通知 B，B 套用後又通知 A，兩邊無限彈。
 *   2. 亂收訊息：形狀不對、別的版本、自己發的，收進去就選到錯的元件。
 * 所以這支主要就在測這兩件事，外加 id 對應不可亂猜。
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

// --- 最小的 BroadcastChannel 假實作，讓兩個「分頁」在同一個 process 裡對話 ---
const buses = new Map();
global.BroadcastChannel = class {
  constructor(name) {
    this.name = name; this.onmessage = null; this.closed = false;
    if (!buses.has(name)) buses.set(name, new Set());
    buses.get(name).add(this);
  }
  postMessage(data) {
    const copy = JSON.parse(JSON.stringify(data));
    for (const p of buses.get(this.name)) {
      if (p === this || p.closed) continue;
      if (p.onmessage) p.onmessage({ data: copy });
    }
  }
  close() { this.closed = true; buses.get(this.name).delete(this); }
};
global.window = { addEventListener: () => {} };
global.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); } };

const CP = require('./pcb-crossprobe.js');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL: ' + m); } };
const eq = (a, b, m) => ok(a === b, `${m} (得 ${JSON.stringify(a)}，期望 ${JSON.stringify(b)})`);
const tick = () => new Promise(r => setTimeout(r, 5));

// ============ 1) id 對應：對不到的不准亂猜 ============
{
  eq(CP.schIdOf({ id: 'sch-d2' }), 'd2', '1 轉換來的元件應抽得出線路圖 id');
  eq(CP.schIdOf({ id: 'ref-t-3' }), null, '1 公版元件對不到線路圖，應回 null');
  eq(CP.schIdOf({ id: 'comp-12345' }), null, '1 手動放的元件應回 null');
  eq(CP.schIdOf({ id: 'sch-' }), null, '1 空的後綴不算有效對應');
  eq(CP.schIdOf({}), null, '1 沒有 id 應回 null');
  eq(CP.schIdOf(null), null, '1 null 不可爆');
  eq(CP.pcbIdOf('d2'), 'sch-d2', '1 反向對應');
  eq(CP.pcbIdOf(''), null, '1 空字串不可產生 id');
}

// ============ 2) 訊息驗證：形狀不對一律丟掉 ============
{
  eq(CP.validate(null), null, '2 null');
  eq(CP.validate({}), null, '2 空物件');
  eq(CP.validate({ v: 1, from: 'pcb' }), null, '2 缺 ids');
  eq(CP.validate({ v: 1, from: 'x', ids: [] }), null, '2 來源不合法');
  eq(CP.validate({ v: 2, from: 'pcb', ids: [] }), null, '2 版本不符應丟掉');
  eq(CP.validate({ v: 1, from: 'pcb', ids: 'abc' }), null, '2 ids 不是陣列');
  ok(CP.validate({ v: 1, from: 'pcb', ids: ['a'] }) !== null, '2 合法訊息應通過');
  eq(CP.validate({ v: 1, from: 'pcb', ids: ['a'], src: 'me' }, 'me'), null, '2 自己發的不可收');
  const cleaned = CP.validate({ v: 1, from: 'sch', ids: ['a', 2, null, 'b', ''] });
  eq(cleaned.ids.join(','), 'a,b', '2 非字串與空字串應濾掉');
  eq(CP.validate({ v: 1, from: 'sch', ids: new Array(999).fill('x') }).ids.length, 500, '2 過長的清單應截斷');
}

// ============ 3) 兩側連動 ============
(async () => {
  const pcbSel = { ids: [] }, schSel = { ids: [] };
  const log = { pcbApplied: 0, schApplied: 0 };

  const pcb = CP.attach({
    side: 'pcb',
    getSelection: () => pcbSel.ids,
    applySelection: ids => { pcbSel.ids = ids.slice(); log.pcbApplied++; pcb.notify(); }
  });
  const sch = CP.attach({
    side: 'sch',
    getSelection: () => schSel.ids,
    applySelection: ids => { schSel.ids = ids.slice(); log.schApplied++; sch.notify(); }
  });

  // PCB 選了 → 線路圖跟著選
  pcbSel.ids = ['d2'];
  pcb.notify();
  await tick();
  eq(schSel.ids.join(','), 'd2', '3 PCB 選取應同步到線路圖');
  eq(log.schApplied, 1, '3 線路圖應套用一次');

  // 線路圖選了 → PCB 跟著選
  schSel.ids = ['d3'];
  sch.notify();
  await tick();
  eq(pcbSel.ids.join(','), 'd3', '3 線路圖選取應同步到 PCB');

  // **回音防護**：applySelection 裡面又呼叫 notify，不可無限彈
  const before = log.pcbApplied + log.schApplied;
  pcbSel.ids = ['d2', 'd3'];
  pcb.notify();
  await tick();
  eq(schSel.ids.join(','), 'd2,d3', '3 多選也要同步');
  const after = log.pcbApplied + log.schApplied;
  ok(after - before <= 2, `3 一次選取最多觸發一次對側套用，不可彈來彈去（多了 ${after - before} 次）`);

  // 沒變就不重送
  const n1 = log.schApplied;
  pcb.notify(); pcb.notify(); pcb.notify();
  await tick();
  eq(log.schApplied, n1, '3 選取沒變時不應重複廣播');

  // 清空選取也要同步
  pcbSel.ids = [];
  pcb.notify();
  await tick();
  eq(schSel.ids.length, 0, '3 取消選取應同步');

  // dispose 之後不再收
  sch.dispose();
  const n2 = log.schApplied;
  pcbSel.ids = ['d9'];
  pcb.notify();
  await tick();
  eq(log.schApplied, n2, '3 dispose 之後不應再收到訊息');
  pcb.dispose();

  // ============ 4) 同側不互相處理 ============
  const a = { ids: [] }, b = { ids: [] };
  let aApplied = 0, bApplied = 0;
  const p1 = CP.attach({ side: 'pcb', getSelection: () => a.ids, applySelection: ids => { a.ids = ids; aApplied++; } });
  const p2 = CP.attach({ side: 'pcb', getSelection: () => b.ids, applySelection: ids => { b.ids = ids; bApplied++; } });
  a.ids = ['z']; p1.notify();
  await tick();
  eq(bApplied, 0, '4 兩個 PCB 分頁之間不應互相套用（同側略過）');
  p1.dispose(); p2.dispose();

  console.log(`\ncrossprobe.test: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
