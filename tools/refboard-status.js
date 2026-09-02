/**
 * refboard-status.js — 量每片公版的真實狀態，寫回 pcb-refboards.js 的 `status`。
 *
 * 為什麼要有：公版卡片以前只寫名字、SoC、層數、尺寸——看起來就像一片做完的板。
 * 實際上它們是**照真板重建**的：有未繞的線、有缺 via 的壞接點。使用者按下「載入」
 * 之後才發現飛線降不下去，而他不會知道那是資料的狀態還是他操作錯了。
 *
 * 為什麼要寫回資料而不是即時算：即時算要對每片板跑一次 Ratsnest（8 片約 4 秒），
 * 開分頁就卡。寫進資料就是常數，代價是**會過期**——所以 `pcb-logic.test.js` 第 21b 節
 * 會拿實測值對照存進去的值，對不上就紅。過期的誠實標示比沒有標示更糟。
 *
 * 用法：
 *   node tools/refboard-status.js --dry    # 只印，不寫檔
 *   node tools/refboard-status.js          # 寫回 pcb-refboards.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const W = path.resolve(__dirname, '..');

const noop = () => {};
const ctxStub = new Proxy({}, { get: () => () => undefined });
const canvasStub = { width: 680, height: 478, getContext: () => ctxStub, getBoundingClientRect: () => ({ left: 0, top: 0, width: 680, height: 478 }), addEventListener: noop, style: {}, parentElement: { clientWidth: 680, clientHeight: 478 } };
const drcBox = { innerHTML: '' };
const docStub = {
  querySelector: (s) => (s === '#pcbCanvas' ? canvasStub : (s === '#drcResults' ? drcBox : null)),
  querySelectorAll: () => [], getElementById: () => null,
  createElement: () => ({ addEventListener: noop, style: {}, click: noop }),
  addEventListener: noop, body: {}
};
const lsStub = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };
global.window = { I18N: null, localStorage: lsStub, addEventListener: noop, innerWidth: 1280, innerHeight: 720 };
global.document = docStub; global.localStorage = lsStub; global.window.document = docStub;

const R = f => require(path.join(W, f));
try { R('ic-data.js'); } catch (e) { /* IC 資料非必要 */ }
['footprint-gen', 'parts-lib', 'pcb-ref-fp', 'pcb-refboards', 'pcb-history', 'pcb-index',
 'pcb-rules', 'pcb-stackup', 'pcb-constraints', 'pcb-drc', 'pcb-fabs', 'pcb-arc'].forEach(m => R(m + '.js'));
['PcbHistory', 'FootprintGen', 'RefFP', 'PartsLib', 'PCB_REFBOARDS', 'IC_DATA', 'NetRules',
 'Ratsnest', 'AutoRoute', 'RouteAll', 'Stackup', 'Padstack', 'Backdrill', 'FabProfiles',
 'ConstraintMgr', 'PadDrc', 'PcbArc'].forEach(k => { global[k] = global.window[k]; });

let src = fs.readFileSync(path.join(W, 'pcb.js'), 'utf8').replace(/pcbApp\.init\(\);\s*/m, '');
eval(src);
const app = global.window.pcbApp;
global.pcbApp = app; global.window.pcbApp = app;
['render', 'renderPartsList', 'syncSelPanel', 'populateEmiSelects', 'renderLayerList', 'toast',
 'checkTraceRules', 'renderNetPanel', 'renderBusPanel'].forEach(m => { app[m] = noop; });
app.canvas = canvasStub; app.ctx = ctxStub;

/** 一片板的真實狀態。跟 pcb-logic.test.js 第 21b 節量的是同一組數字。 */
function measure(id) {
  app.loadRefBoard(id);
  const st = app.state;
  st.netRules = window.NetRules ? window.NetRules.load() : [];
  const rl = window.Ratsnest.compute(st, app.padAbs.bind(app));
  const zero = rl.filter(l => Math.hypot(l.x2 - l.x1, l.y2 - l.y1) < 1e-6).length;
  const errs = window.PadDrc.run(st, app.padAbs.bind(app), app.loadDrcRules())
    .filter(f => f.type === 'error').length;
  return { unrouted: rl.length, zeroLen: zero, drcErrors: errs, traces: (st.traces || []).length };
}

const dry = process.argv.includes('--dry');
const today = new Date().toISOString().slice(0, 10);
const boards = global.PCB_REFBOARDS || [];
const rows = [];
for (const b of boards) {
  const m = measure(b.id);
  rows.push(Object.assign({ id: b.id }, m));
  console.log(b.id.padEnd(16),
    '未繞', String(m.unrouted).padStart(3),
    '｜零長度', String(m.zeroLen).padStart(2),
    '｜DRC error', String(m.drcErrors).padStart(2),
    '｜走線', m.traces);
}

if (dry) { console.log('\n--dry：沒有寫檔'); process.exit(0); }

// 寫回：只動 status 這個欄位，其餘原樣。整份 JSON.stringify 會把上千行走線重排，
// diff 變成整檔改寫，看不出真正動了什麼。
const file = path.join(W, 'pcb-refboards.js');
let text = fs.readFileSync(file, 'utf8');
let changed = 0;
for (const r of rows) {
  const status = `"status": { "unrouted": ${r.unrouted}, "zeroLen": ${r.zeroLen}, "measured": "${today}" }`;
  // 每片板的開頭是 `"id": "<id>",`
  const anchor = new RegExp('("id":\\s*"' + r.id.replace(/[-.]/g, '\\$&') + '",)');
  if (!anchor.test(text)) { console.error('找不到 ' + r.id + ' 的 id 欄位'); process.exit(1); }
  // 已經有 status 就換掉，沒有就插在 id 後面
  const existing = new RegExp('("id":\\s*"' + r.id.replace(/[-.]/g, '\\$&') + '",)\\s*\\n(\\s*)"status":[^}]*}');
  if (existing.test(text)) text = text.replace(existing, (mm, p1, indent) => p1 + '\n' + indent + status);
  else text = text.replace(anchor, (mm, p1) => p1 + '\n    ' + status + ',');
  changed++;
}
fs.writeFileSync(file, text, 'utf8');
console.log('\n已寫回 pcb-refboards.js（' + changed + ' 片）。記得跑 node pcb-logic.test.js —— ' +
  '第 21b 節會拿實測值對照存進去的值，過期就紅。');
