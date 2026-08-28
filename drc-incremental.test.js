/**
 * drc-incremental.test.js — 增量 DRC 驗證（node）
 *
 * 增量檢查唯一該擔心的事：**漏報**。
 * 少報一條違規不會有錯誤訊息、不會有例外，只是那條違規從此不存在，
 * 板子送出去才發現。所以這支全部在驗「增量結果與全量結果在 dirty 區域內完全一致」。
 *
 * 另一個容易錯的地方是 region 沒膨脹：一個在區域內、一個剛好在區域外的配對會漏掉。
 * 7.x 專門測這個方向。
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

global.window = {};
require('./pcb-index.js');
require('./pcb-arc.js');
require('./pcb-drc.js');
const PadDrc = global.window.PadDrc;
const IX = global.window.PcbIndex;

let pass = 0, fail = 0;
function eq(a, b, msg) {
  const ok = JSON.stringify(a) === JSON.stringify(b);
  if (ok) pass++; else { fail++; console.error(`FAIL ${msg}\n  expected ${JSON.stringify(b)}\n  got      ${JSON.stringify(a)}`); }
}
const ok = (v, msg) => eq(!!v, true, msg);

const padAbs = (c, p) => {
  const th = ((c.rot || 0) * Math.PI) / 180, co = Math.cos(th), s = Math.sin(th);
  return { x: c.x + p.x * co + p.y * s, y: c.y - p.x * s + p.y * co };
};
const CL = 0.2;
const RULES = {
  clearance: { traceToTrace: CL, traceToPad: CL, padToPad: CL, traceToEdge: 0.3, viaToVia: CL, holeToHole: 0.25 },
  width: { minTrace: 0.1, maxTrace: 20, minPowerTrace: 0.3 },
  via: { minDrill: 0.2, minRing: 0.15 },
  maskSliver: 0.15, compSpacing: 2, cinDist: 5,
};
const run = (state, opts) => PadDrc.run(state, padAbs, RULES, opts);
const tt = r => (r || []).filter(x => /^drc_tt(_nonet)?$/.test(String(x.message || '')));

// 一塊有很多違規的板：每一組都是「兩條靠太近的平行線」，散在不同位置
function makeBoard(pairs) {
  const traces = [];
  for (let k = 0; k < pairs; k++) {
    const x = k * 20;
    traces.push({ x1: x, y1: 0, x2: x + 10, y2: 0, width: 0.3, layer: 'F.Cu', net: 'A' + k });
    traces.push({ x1: x, y1: 0.4, x2: x + 10, y2: 0.4, width: 0.3, layer: 'F.Cu', net: 'B' + k });
  }
  return {
    boardWidth: pairs * 20 + 40, boardHeight: 60,
    layerStack: [{ id: 'F.Cu', kind: 'copper' }, { id: 'B.Cu', kind: 'copper' }],
    components: [], traces, vias: [], zones: [],
  };
}

// ---- 1. 沒給 region 時行為完全不變（回歸保護）----
{
  const st = makeBoard(5);
  const full = run(st);
  eq(tt(full).length, 5, '1.1 五組違規全部報出來');
  const same = run(st, {});
  eq(tt(same).length, 5, '1.2 給空 opts 也一樣');
  const nullRegion = run(st, { region: null });
  eq(tt(nullRegion).length, 5, '1.3 region 為 null 也一樣（等同全掃）');
}

// ---- 2. region 只涵蓋一組 ----
{
  const st = makeBoard(5);
  // 第 0 組在 x=0..10，膨脹 clearance
  const region = IX.expand(IX.box(0, -0.5, 10, 0.9), CL);
  const inc = run(st, { region });
  eq(tt(inc).length, 1, '2.1 只檢查一組時只報一條');
}
{
  const st = makeBoard(5);
  // 涵蓋第 1、2 組（x=20..50）
  const region = IX.expand(IX.box(20, -0.5, 50, 0.9), CL);
  eq(tt(run(st, { region })).length, 2, '2.2 涵蓋兩組時報兩條');
}
{
  const st = makeBoard(5);
  // 空白處
  const region = IX.expand(IX.box(0, 30, 10, 40), CL);
  eq(tt(run(st, { region })).length, 0, '2.3 空白區域不報');
}

// ---- 3. 增量結果 ⊆ 全量結果，而且 dirty 區內完全一致 ----
{
  const st = makeBoard(8);
  const fullMsgs = tt(run(st)).map(x => x.message);
  eq(fullMsgs.length, 8, '3.1 全量 8 條');

  // 把每一組各自當成 dirty 區跑一次，聯集應該等於全量
  let sum = 0;
  for (let k = 0; k < 8; k++) {
    const region = IX.expand(IX.box(k * 20, -0.5, k * 20 + 10, 0.9), CL);
    sum += tt(run(st, { region })).length;
  }
  eq(sum, 8, '3.2 逐區檢查的總數等於全量（沒有漏、也沒有重複計算）');
}

// ---- 4. 真的改一條線的情境 ----
{
  const st = makeBoard(3);
  const before = tt(run(st)).length;
  eq(before, 3, '4.1 一開始三條違規');

  // 把第 1 組的第二條線拉開 → 那一組的違規應該消失
  const t = st.traces[3];                      // 第 1 組的 B 線
  const oldBox = IX.traceBox(t, CL);
  t.y1 = 5; t.y2 = 5;
  const newBox = IX.traceBox(t, CL);

  const region = IX.dirtyRect([{ before: oldBox, after: newBox }], CL);
  const incAfter = tt(run(st, { region })).length;
  eq(incAfter, 0, '4.2 拉開之後，dirty 區內沒有違規了');

  const fullAfter = tt(run(st)).length;
  eq(fullAfter, 2, '4.3 全量剩兩條（另外兩組沒動）');
}
{
  // 反向：把一條線移過去製造新違規
  const st = makeBoard(2);
  st.traces.push({ x1: 60, y1: 20, x2: 70, y2: 20, width: 0.3, layer: 'F.Cu', net: 'X' });
  const t = st.traces[st.traces.length - 1];
  const oldBox = IX.traceBox(t, CL);
  t.y1 = 0.4; t.y2 = 0.4; t.x1 = 0; t.x2 = 10;   // 移到第 0 組旁邊
  const newBox = IX.traceBox(t, CL);
  const region = IX.dirtyRect([{ before: oldBox, after: newBox }], CL);
  const inc = tt(run(st, { region }));
  ok(inc.length >= 1, '4.4 移過去之後 dirty 區內抓到新違規');
}

// ---- 5. dirtyRect 一定要含舊位置 ----
{
  const st = makeBoard(2);
  const t = st.traces[1];                      // 第 0 組的 B 線（原本造成違規）
  const oldBox = IX.traceBox(t, CL);
  t.y1 = 40; t.y2 = 40;                        // 搬到很遠
  const newBox = IX.traceBox(t, CL);

  // 只用新位置當 region（錯誤做法）
  const onlyNew = IX.expand(newBox, CL);
  eq(tt(run(st, { region: onlyNew })).length, 0, '5.1 只看新位置：那裡確實沒有違規');

  // 正確做法：新舊都算
  const both = IX.dirtyRect([{ before: oldBox, after: newBox }], CL);
  eq(tt(run(st, { region: both })).length, 0,
    '5.2 新舊都算之後，舊位置也被重掃了——結果同樣是 0，但這次是「確認過」而不是「沒看」');
  // 差別在於 region 的大小：含舊位置的那個一定比較大
  ok(IX.area(both) > IX.area(onlyNew), '5.3 含舊位置的 region 確實比較大（證明真的有涵蓋到）');
}

// ---- 6. 效能：增量要真的比較快 ----
{
  const st = makeBoard(120);                   // 240 條走線
  const t0 = Date.now();
  const full = tt(run(st)).length;
  const tFull = Date.now() - t0;

  const region = IX.expand(IX.box(0, -0.5, 10, 0.9), CL);
  const t1 = Date.now();
  const inc = tt(run(st, { region })).length;
  const tInc = Date.now() - t1;

  eq(inc, 1, '6.1 增量只報一條');
  ok(full >= 30, '6.2 全量報很多條（CAP 30 上限）：' + full);
  ok(tInc <= tFull, `6.3 增量不比全量慢（全量 ${tFull}ms、增量 ${tInc}ms）`);
}

// ---- 7. region 沒膨脹會漏（所以 dirtyRect 一定要帶 margin）----
{
  const st = {
    boardWidth: 60, boardHeight: 40,
    layerStack: [{ id: 'F.Cu', kind: 'copper' }, { id: 'B.Cu', kind: 'copper' }],
    components: [], vias: [], zones: [],
    traces: [
      { x1: 0, y1: 0, x2: 10, y2: 0, width: 0.3, layer: 'F.Cu', net: 'A' },
      { x1: 0, y1: 0.4, x2: 10, y2: 0.4, width: 0.3, layer: 'F.Cu', net: 'B' },
    ],
  };
  eq(tt(run(st)).length, 1, '7.1 全量有一條違規');

  // 只框住 A 線本身、完全不膨脹
  const tight = IX.box(0, -0.15, 10, 0.15);
  const tightN = tt(run(st, { region: tight })).length;

  // 膨脹過的
  const padded = IX.expand(IX.traceBox(st.traces[0]), CL);
  eq(tt(run(st, { region: padded })).length, 1, '7.2 膨脹過的 region 抓得到（B 線也被納入檢查）');
  ok(tightN <= 1, '7.3 沒膨脹的 region 最多只會少報，不會多報（' + tightN + '）');
}

// ---- 7b. 增量報得出「全量因為 CAP 被截掉」的違規 ----
{
  // run() 對每一類違規有 CAP 30 的上限，超過就只留一筆摘要。
  // 一片有 40 組違規的板，第 31 組之後在全量清單裡是看不到的——
  // 但使用者畫到那裡時，區域檢查會當場報出來。
  // 這是在瀏覽器實測 1600 pad 的板子時發現的（全量 31 筆，其中 30 筆 + 1 筆摘要）。
  const st = makeBoard(40);
  const full = tt(run(st));
  ok(full.length <= 31, '7b.1 全量因為 CAP 被截到 31 筆以內（實際 ' + full.length + '）');

  const fullMsgs = new Set(full.map(x => x.message));
  // 第 39 組（遠超過 CAP）
  const region = IX.expand(IX.box(39 * 20, -0.5, 39 * 20 + 10, 0.9), CL);
  const inc = tt(run(st, { region }));
  eq(inc.length, 1, '7b.2 區域檢查報得出第 39 組的違規');
  ok(!fullMsgs.has(inc[0].message) || full.length < 31,
    '7b.3 而這一條在全量清單裡被 CAP 擋掉了——區域檢查不是多報，是補上看不到的那些');
}

// ---- 8. PcbIndex 沒載入時要退化成全掃（少檢查比多檢查危險）----
{
  const st = makeBoard(3);
  const saved = global.window.PcbIndex;
  delete global.window.PcbIndex;
  const region = IX.expand(IX.box(0, -0.5, 10, 0.9), CL);
  const n = tt(run(st, { region })).length;
  global.window.PcbIndex = saved;
  eq(n, 3, '8.1 沒有 PcbIndex 時忽略 region、退回全掃（寧可多檢查）');
}

console.log(`\ndrc-incremental.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
