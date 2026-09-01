/**
 * refboard-rebuild.js — 把公版從「示意佈局」重建成「幾何上做得出來的佈局」。
 *
 * 為什麼要有這支：公版原本的走線是手畫的示意直線，直接壓過別人的 pad；
 * 有些元件之間的 pad 也擠在一起。8 片合計 388 個 DRC error，而且是新訪客
 * 進站看到的第一個東西。手工重畫八片板不現實，所以把它變成可重跑的流程：
 *
 *   1. 丟掉示意走線與示意 via（它們本來就壓在 pad 上，重繞後也沒有意義）
 *   2. 擺位鬆弛：pad 太近的元件互相推開。安裝孔不動、連接器少動
 *      （它們在真板上就固定在板邊），優先推被動元件。
 *   3. 用真的繞線器重繞：0.15mm 線、多層、拆線重試。
 *
 * 一定要從「git 上的原始資料」跑：這支會把結果寫回 pcb-refboards.js，
 * 對著已經重建過的資料再跑一次，等於拿上一輪的走線端點當輸入，一代一代漂移，
 * 也就不再能從原始檔重現。重跑前先 `git checkout pcb-refboards.js`。
 *
 * 用法：
 *   node tools/refboard-rebuild.js            # 全部 8 片，寫回 pcb-refboards.js
 *   node tools/refboard-rebuild.js --dry      # 只跑不寫檔（看數字用）
 *   node tools/refboard-rebuild.js rp2040-pico30 librevna
 *
 * 誠實界定：這不是「照原廠重畫」。公版資料本來就是教學重建版，沒有完整 netlist
 * （pad 的 net 只能從示意走線的端點回推，多數 pad 仍然沒有 net）。所以繞不完的
 * net 會留著飛線，重建後的板子是「幾何上乾淨、電性上仍是近似」。
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
const layersOf = () => app.routableLayers();
const OPTS = () => ({
  layers: layersOf(), layer: app.state.traceLayer || 'F.Cu',
  width: 0.15, clearance: CL, viaOd: 0.7, viaDrill: 0.3, grid: 0.25,
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
    const r = window.RouteAll.run(bare, padAbs, [l], Object.assign(OPTS(), { ripup: false, passes: 1, budgetMs: 3000 }));
    if (r.routed.length) soloOk++; else { soloFail++; failNets.push(l.net || '(no net)'); }
  }

  // 真實板況：一次全部丟進去（含拆線重試）
  const work = Object.assign({}, st, { traces: (st.traces || []).slice(), vias: (st.vias || []).slice() });
  const all = window.RouteAll.run(work, padAbs, lines, OPTS());

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
