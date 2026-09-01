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

// ============ 2b) 階層：舊分頁沒有 path 欄位，收到要當根層（不可整包丟掉）============
{
  const m = CP.validate({ v: 1, from: 'sch', ids: ['d2'] });
  ok(m !== null, '2b 沒帶 path 的舊訊息仍應收下');
  eq(m.path, '', '2b 沒帶 path 就當根層');
  eq(CP.validate({ v: 1, from: 'sch', ids: ['d2'], path: 'PWR1' }).path, 'PWR1', '2b 有 path 要留住');
  eq(CP.validate({ v: 1, from: 'sch', ids: ['d2'], path: 42 }).path, '', '2b path 不是字串就當沒有');
}

// ============ 2c) 階層路徑純函式 ============
// 攤平後的 id 是「實例路徑/區域 id」。兩側都靠這組函式換算，錯了就會選到別層同名的元件。
{
  eq(CP.splitPath('PWR1/r12').path, 'PWR1', '2c 抽出層');
  eq(CP.splitPath('PWR1/r12').local, 'r12', '2c 抽出區域 id');
  eq(CP.splitPath('A/B/r12').path, 'A/B', '2c 多層：只有最後一段是元件 id');
  eq(CP.splitPath('r12').path, '', '2c 根層的元件沒有路徑');
  eq(CP.joinPath('PWR1', 'r12'), 'PWR1/r12', '2c 組回全名');
  eq(CP.joinPath('', 'r12'), 'r12', '2c 根層不加斜線');
  eq(CP.joinPath('PWR1', ''), '', '2c 沒有區域 id 就不該生出 id');
  eq(CP.qualify(['r12', 'c3'], 'PWR1').join(','), 'PWR1/r12,PWR1/c3', '2c 區域 id 補上層');
  eq(CP.qualify(['DRV1/q1'], 'PWR1').join(','), 'DRV1/q1', '2c 已經是全名的不可再加一層');
  eq(CP.qualify(['r12'], '').join(','), 'r12', '2c 根層等同不變');
  eq(CP.localize(['PWR1/r12', 'DRV1/q1', 'r9'], 'PWR1').join(','), 'r12', '2c 只留那一層的，別層不硬塞');
  eq(CP.localize(['PWR1/r12'], '').join(','), '', '2c 根層拿不到子圖裡的元件');
  eq(CP.dominantPath(['PWR1/a', 'PWR1/b', 'DRV1/c']), 'PWR1', '2c 跨層多選跳成員最多的那一層');
  eq(CP.dominantPath(['DRV1/c', 'PWR1/a', 'PWR1/b']), 'PWR1', '2c 順序不影響結果');
  eq(CP.dominantPath(['a', 'b']), '', '2c 全在根層');
  eq(CP.dominantPath([]), '', '2c 空選取不可爆');
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

  // ============ 5) 階層：子圖裡的選取要對得上 ============
  // 這一節防的是最貴的那個失敗：階層設計兩邊各自「有反應」，但永遠選不到對方。
  const pSel = { ids: [] };
  const sSel = { ids: [], path: 'PWR1' };
  let schJumpedTo = null;
  const pcbH = CP.attach({
    side: 'pcb',
    getSelection: () => pSel.ids,
    applySelection: (ids, path) => { pSel.ids = CP.qualify(ids, path); }
  });
  const schH = CP.attach({
    side: 'sch',
    getSelection: () => sSel.ids,
    getPath: () => sSel.path,
    applySelection: (ids, path) => {
      const full = CP.qualify(ids, path);
      schJumpedTo = CP.dominantPath(full);      // 線路圖那側會跳到這一層
      sSel.path = schJumpedTo;
      sSel.ids = CP.localize(full, schJumpedTo);
    }
  });

  sSel.ids = ['r12'];
  schH.notify();
  await tick();
  eq(pSel.ids.join(','), 'PWR1/r12', '5 子圖裡的選取要帶著層送到 PCB');

  // 同一批區域 id、換一張子圖：PCB 收到的必須是另一顆
  sSel.path = 'DRV1';
  schH.notify();
  await tick();
  eq(pSel.ids.join(','), 'DRV1/r12', '5 換層之後同名的區域 id 應指向另一顆（層要進廣播 key）');

  // PCB 跨層多選 → 線路圖跳到成員最多的那一層，別層的丟掉
  pSel.ids = ['PWR1/r12', 'PWR1/c3', 'DRV1/q1'];
  pcbH.notify();
  await tick();
  eq(schJumpedTo, 'PWR1', '5 跨層多選應跳到成員最多的那一層');
  eq(sSel.ids.join(','), 'r12,c3', '5 只留那一層的元件，別層的不可硬塞進來');

  // 根層的元件仍照舊（不可因為加了階層就壞掉）
  pSel.ids = ['d2'];
  pcbH.notify();
  await tick();
  eq(schJumpedTo, '', '5 根層元件不應被當成某一層');
  eq(sSel.ids.join(','), 'd2', '5 根層連動照舊');
  pcbH.dispose(); schH.dispose();

  // ============ 6) 真的接上畫面（功能藏起來等於沒有做）============
  {
    const fsx = require('fs'), pathx = require('path');
    const pcbjs = fsx.readFileSync(pathx.join(__dirname, 'pcb.js'), 'utf8');
    const appjs = fsx.readFileSync(pathx.join(__dirname, 'app.js'), 'utf8');
    const sheets = fsx.readFileSync(pathx.join(__dirname, 'sheets.js'), 'utf8');
    const html = fsx.readFileSync(pathx.join(__dirname, 'pcb.html'), 'utf8');
    ok(pcbjs.indexOf('applySelection: (ids, path)') > 0, '6 PCB 側要收下對方的層');
    ok(pcbjs.indexOf('selHierPath') > 0, '6 PCB 側要能反查是哪一層');
    ok(pcbjs.indexOf('selectSameSheet') > 0, '6 PCB 側要有整層選取');
    ok(html.indexOf('selHierRow') > 0, '6 選取面板要有階層列');
    ok(html.indexOf('selHierPick') > 0, '6 面板要有「選同層」按鈕');
    ok(appjs.indexOf('getPath: curPath') > 0, '6 線路圖側送出時要附上自己的層');
    ok(appjs.indexOf('Sheets.gotoPath') > 0, '6 線路圖側收到別層的選取要跳過去');
    ok(sheets.indexOf('gotoPath') > 0, '6 sheets.js 要提供跳層');
    ok(sheets.indexOf('curPath') > 0, '6 sheets.js 要提供目前的層');
  }

  console.log(`\ncrossprobe.test: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
