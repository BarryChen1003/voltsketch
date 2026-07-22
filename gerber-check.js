/**
 * gerber-check.js — Gerber/Excellon 匯出正確性程式化驗證（node，無瀏覽器）
 * 為什麼：企業用戶把 HardwareAI 匯出的 Gerber 送板廠，匯出錯＝報廢板。
 *         這支對每片公版跑一次匯出，驗結構與幾何一致性，防匯出回歸。
 * 驗項：
 *   - 每個 .gbr：正確 FS/MO 表頭、以 M02* 收尾、無 NaN、座標在板框內
 *   - 銅層數 = layerStack 銅層數；Edge_Cuts 有實際線段
 *   - Excellon .drl：M48/METRIC 表頭、至少一支刀、M30 收尾、無 NaN
 *   - 鑽孔數 = via + THT pad；每個鑽孔座標對得上某 THT pad/via（對齊）
 *   - CPL 行數 = 有 pad 的元件數；IPC 以 999 收尾、記錄數 = 銅 pad + via
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

// ---------- DOM stub（載 pcb.js 但不跑 init）----------
const noop = () => {};
const ctxStub = new Proxy({}, { get: () => () => undefined });
const canvasStub = { width: 680, height: 478, getContext: () => ctxStub, getBoundingClientRect: () => ({ left: 0, top: 0, width: 680, height: 478 }), addEventListener: noop, style: {}, parentElement: { clientWidth: 680, clientHeight: 478 } };
const docStub = { querySelector: (s) => (s === '#pcbCanvas' ? canvasStub : null), querySelectorAll: () => [], getElementById: () => null, createElement: () => ({ addEventListener: noop, style: {}, click: noop }), addEventListener: noop, body: {} };
const lsStub = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };
global.window = { I18N: null, localStorage: lsStub, addEventListener: noop, innerWidth: 1280, innerHeight: 720 };
global.document = docStub; global.localStorage = lsStub; global.window.document = docStub;

const fs = require('fs');
try { require('./ic-data.js'); } catch (e) {}
require('./footprint-gen.js'); require('./parts-lib.js'); require('./pcb-ref-fp.js');
require('./pcb-refboards.js'); require('./pcb-history.js'); require('./gerber-export.js');
['PcbHistory', 'FootprintGen', 'RefFP', 'PartsLib', 'PCB_REFBOARDS', 'IC_DATA', 'GerberExport'].forEach(k => { global[k] = global.window[k]; });

let src = fs.readFileSync('./pcb.js', 'utf8').replace(/pcbApp\.init\(\);\s*/m, '');
eval(src);
const app = global.window.pcbApp;
['render', 'renderPartsList', 'syncSelPanel', 'populateEmiSelects', 'renderLayerList', 'toast', 'checkTraceRules'].forEach(m => { app[m] = noop; });
app.canvas = canvasStub; app.ctx = ctxStub;

// ---------- 斷言 ----------
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL: ' + m); } };
const padAbs = (comp, pad) => { const th = (comp.rot || 0) * Math.PI / 180, c = Math.cos(th), s = Math.sin(th); return { x: comp.x + pad.x * c + pad.y * s, y: comp.y - pad.x * s + pad.y * c }; };

// gerber 座標抽取（X<int>Y<int>，1e6=mm；y 已被匯出取負）
function coords(text) {
  const out = [];
  const re = /X(-?\d+)Y(-?\d+)D0[123]\*/g; let m;
  while ((m = re.exec(text))) out.push({ x: +m[1] / 1e6, y: -(+m[2]) / 1e6 });
  return out;
}
// Excellon 鑽孔座標（X<f>Y<f>，mm；y 取負）
function drillCoords(text) {
  const out = [];
  const re = /^X(-?[\d.]+)Y(-?[\d.]+)/gm; let m;
  while ((m = re.exec(text))) out.push({ x: +m[1], y: -(+m[2]) });
  return out;
}

const boards = global.PCB_REFBOARDS || [];
ok(boards.length > 0, 'PCB_REFBOARDS 應載入');

for (const b of boards) {
  app.loadRefBoard(b.id);
  const st = app.state;
  const r = global.GerberExport.build(st, padAbs, b.id);
  const tag = b.id;
  const byName = {}; r.files.forEach(f => { byName[f.name.replace(b.id, '')] = f; });

  // 1) 每個 .gbr 表頭/收尾/NaN/座標界內
  const halfW = st.boardWidth / 2 + 2, halfH = st.boardHeight / 2 + 2;
  const gbrs = r.files.filter(f => f.name.endsWith('.gbr'));
  ok(gbrs.length > 0, `${tag}: 有 .gbr 檔`);
  for (const f of gbrs) {
    ok(f.text.includes('%FSLAX46Y46*%') && f.text.includes('%MOMM*%'), `${tag}/${f.name}: FS/MO 表頭`);
    ok(/M02\*\s*$/.test(f.text), `${tag}/${f.name}: M02* 收尾`);
    ok(!/NaN|undefined/.test(f.text), `${tag}/${f.name}: 無 NaN/undefined`);
    const oob = coords(f.text).filter(p => Math.abs(p.x) > halfW || Math.abs(p.y) > halfH);
    ok(oob.length === 0, `${tag}/${f.name}: 座標在板框內（越界 ${oob.length}）`);
  }

  // 2) 銅層數
  const cuCount = (st.layerStack || []).filter(l => l.kind === 'copper').length;
  const cuFiles = gbrs.filter(f => /_Cu\.gbr$/.test(f.name)).length;
  ok(cuFiles === cuCount, `${tag}: 銅層檔數 ${cuFiles} = layerStack 銅層 ${cuCount}`);

  // 3) Edge_Cuts 有線段
  const edge = r.files.find(f => /Edge_Cuts\.gbr$/.test(f.name));
  ok(edge && /D01\*/.test(edge.text), `${tag}: Edge_Cuts 有實際板框線段`);

  // 4) Excellon PTH
  const drl = r.files.find(f => /-PTH\.drl$/.test(f.name));
  ok(drl, `${tag}: 有 PTH.drl`);
  if (drl) {
    ok(drl.text.startsWith('M48') && /METRIC/.test(drl.text), `${tag}: PTH 表頭 M48/METRIC`);
    ok(/M30\s*$/.test(drl.text), `${tag}: PTH 以 M30 收尾`);
    ok(!/NaN/.test(drl.text), `${tag}: PTH 無 NaN`);
  }

  // 5) 鑽孔數 = via + THT pad（drillCounts.pth）
  let thtPads = 0;
  (st.components || []).forEach(c => (c.pads || []).forEach(p => { if (p.drill > 0 && p.type !== 'np_thru_hole' && !p.slot) thtPads++; }));
  const expectPth = (st.vias || []).length + thtPads;
  ok(r.drillCounts.pth === expectPth, `${tag}: PTH 鑽孔數 ${r.drillCounts.pth} = via+THTpad ${expectPth}`);

  // 6) 每個鑽孔對得上 THT pad/via 座標（對齊；容差 0.02mm）
  if (drl) {
    const targets = (st.vias || []).map(v => ({ x: v.x, y: v.y }));
    (st.components || []).forEach(c => (c.pads || []).forEach(p => { if (p.drill > 0 && p.type !== 'np_thru_hole' && !p.slot) targets.push(padAbs(c, p)); }));
    const holes = drillCoords(drl.text);
    const unmatched = holes.filter(h => !targets.some(t => Math.hypot(h.x - t.x, h.y - t.y) < 0.02));
    ok(unmatched.length === 0, `${tag}: 每個鑽孔對齊某 pad/via（未對齊 ${unmatched.length}）`);
  }

  // 7) CPL 行數 = 有 pad 的元件
  const withPad = (st.components || []).filter(c => c.pads && c.pads.length).length;
  ok(r.cplCount === withPad, `${tag}: CPL ${r.cplCount} = 有pad元件 ${withPad}`);

  // 8) IPC 收尾＋記錄數
  const ipc = r.files.find(f => f.name.endsWith('.ipc'));
  ok(ipc && /999\s*$/.test(ipc.text), `${tag}: IPC 以 999 收尾`);
  let cuPads = 0;
  (st.components || []).forEach(c => (c.pads || []).forEach(p => { if (p.cu !== false && p.type !== 'np_thru_hole') cuPads++; }));
  ok(r.ipcRecords === cuPads + (st.vias || []).length, `${tag}: IPC 記錄 ${r.ipcRecords} = 銅pad+via ${cuPads + (st.vias || []).length}`);
}

console.log(`\ngerber-check: ${pass} passed, ${fail} failed（跨 ${boards.length} 片公版）`);
process.exit(fail ? 1 : 0);
