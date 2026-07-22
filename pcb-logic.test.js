/**
 * pcb-logic.test.js — PCB 編輯器邏輯層回歸測試（node，無瀏覽器）
 * 目的：把「靠手動瀏覽器實測」的互動邏輯固化成可重跑測試，改碼即自動驗、防回歸。
 * 手法：stub DOM/canvas，載入 pcb.js 但「不跑 init()」（避開重 DOM 初始化），
 *       直接測純邏輯方法與狀態變化。渲染類方法覆寫成 no-op。
 * 涵蓋：nextRef / snapTarget / traceHit / traceEndpointHit / padAbs /
 *       PcbHistory undo-redo / pasteClipboard / 多選刪除 filter / refBoardParts。
 * 過 = exit 0；任何斷言失敗 = exit 1。
 */
'use strict';

// ---------- DOM / 環境 stub ----------
const noop = () => {};
const ctxStub = new Proxy({}, { get: () => () => undefined });
const canvasStub = {
  width: 680, height: 478,
  getContext: () => ctxStub,
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 680, height: 478 }),
  addEventListener: noop, style: {},
  parentElement: { clientWidth: 680, clientHeight: 478 },
};
const elStub = { addEventListener: noop, style: {}, innerHTML: '', value: '', textContent: '', click: noop, querySelector: () => null, querySelectorAll: () => [], appendChild: noop };
const documentStub = {
  querySelector: (s) => (s === '#pcbCanvas' ? canvasStub : null),
  querySelectorAll: () => [],
  getElementById: () => null,
  createElement: () => Object.assign({}, elStub),
  addEventListener: noop,
  body: elStub,
};
const localStorageStub = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };

global.window = { I18N: null, localStorage: localStorageStub, addEventListener: noop, innerWidth: 1280, innerHeight: 720, devicePixelRatio: 1 };
global.document = documentStub;
global.localStorage = localStorageStub;
global.window.document = documentStub;

// ---------- 載入相依（assign 到 window）----------
const fs = require('fs');
try { require('./ic-data.js'); } catch (e) { /* IC 資料非必要 */ }
require('./footprint-gen.js');
require('./parts-lib.js');
require('./pcb-ref-fp.js');
require('./pcb-refboards.js');
require('./pcb-history.js');

// pcb.js 內部以「裸全域」引用這些（瀏覽器 window 屬性＝全域）；node 需手動鏡射到 global
['PcbHistory', 'FootprintGen', 'RefFP', 'PartsLib', 'PCB_REFBOARDS', 'IC_DATA'].forEach(k => { global[k] = global.window[k]; });

// ---------- 載入 pcb.js，但移除檔尾 init() ----------
let src = fs.readFileSync('./pcb.js', 'utf8');
src = src.replace(/pcbApp\.init\(\);\s*/m, '/* init skipped in test */');
eval(src);                       // 內含 window.pcbApp = pcbApp
const app = global.window.pcbApp;

// 覆寫渲染/DOM 類方法為 no-op（測邏輯不測畫面）
['render', 'renderPartsList', 'syncSelPanel', 'populateEmiSelects', 'renderLayerList',
 'toast', 'checkTraceRules', 'renderNetRules', 'renderNetlist', 'generateNetlist'].forEach(m => { app[m] = noop; });
app.canvas = canvasStub;
app.ctx = ctxStub;
app.state.layerStack = app.buildLayerStack(2);
app.state.visibleLayers = app.state.layerStack.map(l => l.id);

// ---------- 迷你斷言框架 ----------
let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) { pass++; } else { fail++; console.log('  FAIL: ' + msg); } };
const eq = (a, b, msg) => ok(a === b, `${msg} (得 ${JSON.stringify(a)}，期望 ${JSON.stringify(b)})`);

// 放一片公版當測試資料
app.loadRefBoard('rp2040-pico30');
const baseN = app.state.components.length;
ok(baseN > 0, 'loadRefBoard 應載入元件');
ok(app.state.components.some(c => (c.pads || []).length), 'refBoardParts 應掛上 pads');

// 1) nextRef 不撞號
const maxU = Math.max(0, ...app.state.components.filter(c => /^U\d+$/.test(c.ref || '')).map(c => +c.ref.slice(1)));
eq(app.nextRef('U'), 'U' + (maxU + 1), 'nextRef(U) 應為 max+1');
eq(app.nextRef('R'), 'R' + (Math.max(0, ...app.state.components.filter(c => /^R\d+$/.test(c.ref || '')).map(c => +c.ref.slice(1))) + 1), 'nextRef(R) 應為 max+1');

// 2) padAbs / snapTarget：某 pad 絕對座標附近應 snap 回該 pad、帶 net
const c0 = app.state.components.find(c => c.pads && c.pads.length);
const pad0 = app.padAbs(c0, c0.pads[0]);
ok(typeof pad0.x === 'number' && !isNaN(pad0.x), 'padAbs 回合法座標');
const st = app.snapTarget(pad0.x + 0.05, pad0.y + 0.05);
ok(st && Math.hypot(st.x - pad0.x, st.y - pad0.y) < 0.5, 'snapTarget 應吸到附近 pad');

// 3) traceHit / traceEndpointHit
if (app.state.traces.length) {
  const t = app.state.traces[0];
  const midx = (t.x1 + t.x2) / 2, midy = (t.y1 + t.y2) / 2;
  eq(app.traceHit(midx, midy), t, 'traceHit 中點應命中該走線');
  const eph = app.traceEndpointHit(t.x1, t.y1);
  ok(eph && eph.trace === t && eph.end === 'a', 'traceEndpointHit 起點應回 end=a');
}

// 4) PcbHistory：push → 改動 → undo → redo
if (window.PcbHistory) {
  const n0 = app.state.components.length;
  app.hist();                                  // 快照
  app.state.components.push({ id: 'x', ref: 'X9', x: 0, y: 0, pads: [] });
  eq(app.state.components.length, n0 + 1, 'push 後 +1');
  ok(window.PcbHistory.undo(app), 'undo 應成功');
  eq(app.state.components.length, n0, 'undo 後回原數');
  ok(window.PcbHistory.redo(app), 'redo 應成功');
  eq(app.state.components.length, n0 + 1, 'redo 後回 +1');
  window.PcbHistory.undo(app);                 // 復原測試污染
}

// 5) pasteClipboard：複製 3 顆 → 貼上 +3、新 refdes 不撞、位置 +2mm
{
  const pick = app.state.components.slice(0, 3);
  app.state.clipboard = pick.map(c => JSON.parse(JSON.stringify(c)));
  const before = app.state.components.length;
  const beforeRefs = new Set(app.state.components.map(c => c.ref));
  app.pasteClipboard();
  eq(app.state.components.length, before + 3, '貼上後 +3');
  const pasted = app.state.selectedSet;
  eq(pasted.length, 3, '貼上後選取 3 顆');
  ok(pasted.every(c => !beforeRefs.has(c.ref)), '貼上元件 refdes 全新、不撞號');
  ok(pasted.every((c, i) => Math.abs(c.x - (pick[i].x + 2)) < 1e-6), '貼上位置 +2mm');
}

// 6) 多選刪除 filter（模擬 keydown 的刪除邏輯）
{
  const before = app.state.components.length;
  const del = new Set(app.state.components.slice(0, 3));
  app.state.components = app.state.components.filter(c => !del.has(c));
  eq(app.state.components.length, before - 3, '多選刪除 -3');
}

// 7) FootprintGen 覆蓋率不回歸（IC 全數有 footprint）
{
  const ics = window.IC_DATA || [];
  ok(ics.length >= 190, `IC_DATA 應載入（得 ${ics.length}，防 0/0 假通過）`);
  let boxes = 0;
  for (const ic of ics) { const r = window.FootprintGen.fromIC(ic); if (!r || !r.ok) boxes++; }
  eq(boxes, 0, `IC footprint 覆蓋率：${ics.length - boxes}/${ics.length}，不應有方框`);
}

// 8) 對齊 / 分佈 / 微調 / 群組旋轉（A：編輯器手感）
{
  const mk = (id, x, y, w, h) => ({ id, ref: id, x, y, w: w || 2, h: h || 2, rot: 0, pads: [] });
  // 對齊 left：三顆不同 x → 左緣對齊
  let g = [mk('A', 0, 0, 2, 2), mk('B', 10, 5, 4, 2), mk('C', 20, -5, 2, 2)];
  app.state.components = g.slice();
  app.state.selectedSet = g.slice(); app.state.selected = g[2];
  app.alignSelected('left');
  const leftEdge = Math.min(...g.map(c => c.x - c.w / 2));
  ok(g.every(c => Math.abs((c.x - c.w / 2) - leftEdge) < 1e-6), '對齊 left：左緣一致');
  // 對齊 centerH：x 全等
  app.alignSelected('centerH');
  ok(g.every(c => Math.abs(c.x - g[0].x) < 1e-6), '對齊 centerH：x 一致');

  // 分佈 h：中心等距
  g = [mk('A', 0, 0), mk('B', 3, 0), mk('C', 30, 0)];
  app.state.components = g.slice(); app.state.selectedSet = g.slice();
  app.distributeSelected('h');
  const xs = g.map(c => c.x).sort((a, b) => a - b);
  ok(Math.abs((xs[1] - xs[0]) - (xs[2] - xs[1])) < 1e-6, '分佈 h：相鄰間距相等');
  eq(xs[0], 0, '分佈保留首'); eq(xs[2], 30, '分佈保留尾');

  // 微調：全體 +1,-1
  g = [mk('A', 5, 5), mk('B', 8, 8)];
  app.state.components = g.slice(); app.state.selectedSet = g.slice(); app.state.selected = g[1];
  app.nudgeSelected(1, -1);
  ok(Math.abs(g[0].x - 6) < 1e-6 && Math.abs(g[0].y - 4) < 1e-6 && Math.abs(g[1].x - 9) < 1e-6, '微調：全體同步平移');

  // 群組旋轉 90°：繞群組中心，兩顆對調象限
  g = [mk('A', -10, 0), mk('B', 10, 0)];
  app.state.components = g.slice(); app.state.selectedSet = g.slice(); app.state.selected = g[1];
  app.rotateSelected(90);
  // 中心 (0,0)，90° 後 (-10,0)->(0,-10)、(10,0)->(0,10)
  ok(Math.abs(g[0].x) < 1e-6 && Math.abs(g[0].y - (-10)) < 1e-4, '群組旋轉：A 公轉到 (0,-10)');
  ok(Math.abs(g[1].x) < 1e-6 && Math.abs(g[1].y - 10) < 1e-4, '群組旋轉：B 公轉到 (0,10)');
  eq(g[0].rot, 90, '群組旋轉：各自自轉 90');
}

console.log(`\npcb-logic.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
