/**
 * refboard-route-audit.js — 公版「還有多少沒繞、為什麼繞不過」的量測工具（只讀，不寫檔）
 *
 * 硬規矩 14「先量再改」的那個「量」。2026-09-01 這支的產出直接改變了要做的事：
 * 原訂是「改繞線策略提高成功率」，量完發現 134 條未繞裡有 118 條當場就繞得出來——
 * 真正缺的是「資料從來沒補繞過」與繞線器收線層的 bug（見 NEW-SESSION §8）。
 *
 * 每片板報四個數字：
 *   未繞       載入後 Ratsnest 還看得到的連線
 *   單獨可繞   把那條線放到「只有 pad、沒有其他走線」的板上重繞，繞得過的數量
 *   幾何不可繞 單獨都繞不過 → pad 擠死／板邊／禁佈區，不是壅塞
 *   全繞一次   真實板況下（含拆線重試）一次能繞成幾條
 *
 * 用法：node tools/refboard-route-audit.js
 */
'use strict';

const path = require('path');
const fs = require('fs');
const W = path.resolve(__dirname, '..');
const R = f => require(path.join(W, f));

// ---------- DOM stub（載 pcb.js 但不跑 init）----------
const noop = () => {};
const ctxStub = new Proxy({}, { get: () => () => undefined });
const canvasStub = { width: 680, height: 478, getContext: () => ctxStub, getBoundingClientRect: () => ({ left: 0, top: 0, width: 680, height: 478 }), addEventListener: noop, style: {}, parentElement: { clientWidth: 680, clientHeight: 478 } };
const drcBox = { innerHTML: '' };   // runDrc 會把結果寫進 #drcResults
const docStub = { querySelector: (s) => (s === '#pcbCanvas' ? canvasStub : (s === '#drcResults' ? drcBox : null)), querySelectorAll: () => [], getElementById: () => null, createElement: () => ({ addEventListener: noop, style: {}, click: noop }), addEventListener: noop, body: {} };
const lsStub = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };
global.window = { I18N: null, localStorage: lsStub, addEventListener: noop, innerWidth: 1280, innerHeight: 720 };
global.document = docStub; global.localStorage = lsStub; global.window.document = docStub;

try { R('ic-data.js'); } catch (e) { /* IC 資料非必要 */ }
['footprint-gen', 'parts-lib', 'pcb-ref-fp', 'pcb-refboards', 'pcb-history', 'pcb-rules',
 'pcb-stackup', 'pcb-constraints', 'pcb-drc', 'pcb-fabs'].forEach(m => R(m + '.js'));
['PcbHistory', 'FootprintGen', 'RefFP', 'PartsLib', 'PCB_REFBOARDS', 'IC_DATA', 'NetRules', 'Ratsnest',
 'AutoRoute', 'RouteAll', 'Stackup', 'Padstack', 'Backdrill', 'FabProfiles', 'ConstraintMgr', 'PadDrc']
  .forEach(k => { global[k] = global.window[k]; });

let src = fs.readFileSync(path.join(W, 'pcb.js'), 'utf8').replace(/pcbApp\.init\(\);\s*/m, '');
eval(src);
const app = global.window.pcbApp;
global.pcbApp = app; global.window.pcbApp = app;   // pcb-stackup 等模組用裸全域引用
['render', 'renderPartsList', 'syncSelPanel', 'populateEmiSelects', 'renderLayerList', 'toast', 'checkTraceRules'].forEach(m => { app[m] = noop; });
app.canvas = canvasStub; app.ctx = ctxStub;

const padAbs = app.padAbs.bind(app);
const GEOM = window.PadDrc._geom;
const rules = app.loadDrcRules();
const CL = rules.clearance;

// ================= 量測：每片公版還剩幾條沒繞、為什麼繞不過 =================
// 硬規矩 14「先量再改」。這支不寫任何檔，只回報數字。
//   總飛線     = 載入公版後 Ratsnest 還看得到的連線（＝還沒繞的）
//   已繞       = 板上既有走線覆蓋掉的（用 pad 的 net 與走線推算不可靠，所以只報飛線）
//   單獨可繞   = 把這條線放到「只有 pad、沒有其他走線」的板上重繞一次還是失敗
//                → 失敗＝幾何問題（pad 擠死、板邊、禁佈區），不是壅塞
//   壅塞       = 單獨可繞、但在真實板況下繞不過 → 空間被別的線佔走
// 線寬與淨空一定要跟 refboard-fill 走同一份政策（tools/refboard-policy.js）。
// 用 0.15mm ＋ 預設淨空去量會偏樂觀：POWER class 的下限是 0.3~0.5mm，
// 量出來「繞得過」的線，補繞時用真正的線寬根本塞不進去。
const policy = require('./refboard-policy.js').makePolicy(window, CL);
const netsOn = st => {
  const all = new Set();
  (st.components || []).forEach(c => (c.pads || []).forEach(pd => { if (pd.net) all.add(pd.net); }));
  (st.traces || []).forEach(t => { if (t.net) all.add(t.net); });
  return all;
};
const OPTS = (st, net) => ({
  layers: (st.layerStack || []).filter(l => l.kind === 'copper').map(l => l.id),
  layer: 'F.Cu',
  width: policy.widthOf(net),
  clearance: policy.clearanceFor([net], netsOn(st)),
  viaOd: Math.max(0.6, policy.widthOf(net) + 0.3), viaDrill: 0.3, grid: 0.1,
  order: 'short', ripup: true, passes: 3, budgetMs: 12000
});

const rows = [];
for (const b of (window.PCB_REFBOARDS || [])) {
  app.loadRefBoard(b.id);
  app.state.netRules = window.NetRules ? window.NetRules.load() : [];
  const st = app.state;
  const lines = window.Ratsnest.compute(st, padAbs);
  const traces = (st.traces || []).length;

  // 逐條放到「只有元件、沒有走線」的板上單獨試繞
  const bare = Object.assign({}, st, { traces: [], vias: [] });
  let soloOk = 0, soloFail = 0;
  const failNets = [];
  for (const l of lines) {
    const r = window.RouteAll.run(bare, padAbs, [l], Object.assign(OPTS(st, l.net), { ripup: false, passes: 1, budgetMs: 3000 }));
    if (r.routed.length) soloOk++; else { soloFail++; failNets.push(l.net || '(no net)'); }
  }

  // 真實板況：一次全部丟進去（含拆線重試）
  const work = Object.assign({}, st, { traces: (st.traces || []).slice(), vias: (st.vias || []).slice() });
  // 一次全部丟進去時，線寬取這批裡最寬的那條（同一批只能有一個 width）
  const wideNet = lines.map(l => l.net).sort((a, b) => policy.widthOf(b) - policy.widthOf(a))[0];
  const all = window.RouteAll.run(work, padAbs, lines, OPTS(st, wideNet));

  rows.push({
    id: b.id, pads: st.components.reduce((n, c) => n + (c.pads || []).length, 0),
    layers: (st.layerStack || []).filter(l => l.kind === 'copper').length,
    traces, open: lines.length, soloOk, soloFail,
    routedNow: all.routed.length, stillFail: all.failed.length,
    ripped: all.ripped, ms: Math.round(all.ms || 0),
    fails: [...new Set(failNets)].slice(0, 6)
  });
  console.log(rows[rows.length - 1].id.padEnd(16),
    'pads', String(rows[rows.length - 1].pads).padStart(5),
    '| 層', rows[rows.length - 1].layers,
    '| 現有走線', String(traces).padStart(4),
    '| 未繞', String(lines.length).padStart(3),
    '| 單獨可繞', String(rows[rows.length - 1].soloOk).padStart(3),
    '| 幾何不可繞', String(rows[rows.length - 1].soloFail).padStart(3),
    '| 全繞一次成功', String(rows[rows.length - 1].routedNow).padStart(3),
    '| 仍失敗', String(rows[rows.length - 1].stillFail).padStart(3),
    '|', rows[rows.length - 1].ms + 'ms');
}

const sum = (k) => rows.reduce((n, r) => n + r[k], 0);
console.log('');
console.log('合計：未繞 ' + sum('open') + '｜其中單獨都繞不過（幾何） ' + sum('soloFail') +
  '｜在真實板況下繞成 ' + sum('routedNow') + '｜仍失敗 ' + sum('stillFail'));
console.log('樣本失敗 net：');
rows.filter(r => r.fails.length).forEach(r => console.log('  ' + r.id + ': ' + r.fails.join(', ')));
