/**
 * tools/verify/emit.js — 產出「要交給第三方工具驗」的檔案
 *
 * 為什麼要有這一支：我們自己的檢查（gerber-check、step.test、ipc2581.test…）驗的是
 * 「我們的產生器有沒有照我們的規則做」。那些檢查很硬，但它們跟被驗的東西**出自同一套
 * 假設**——如果我們對 Gerber 格式的理解本身就錯了，自己驗自己永遠是綠的。
 *
 * 這一支只負責把檔案吐出來；判斷交給裝在本機的三個獨立工具：
 *   - gerbonara（Python，pcb-tools 的後繼）讀 Gerber／Excellon
 *   - kicad-cli（KiCad 10）對我們匯出的 .kicad_pcb 跑它自己的 DRC
 *   - FreeCADCmd（OCCT 核心）開我們的 STEP，驗實體有效性
 *
 * 用法：node tools/verify/emit.js [boardId]
 * 產物：tools/verify/out/<board>/…（不進 git）
 */
'use strict';

const fs = require('fs');
const path = require('path');
const W = path.resolve(__dirname, '..', '..');
const OUT = path.join(__dirname, 'out');

// ---------- DOM stub（載 pcb.js 但不跑 init）----------
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
 'pcb-rules', 'pcb-stackup', 'pcb-constraints', 'pcb-drc', 'pcb-fabs', 'pcb-arc',
 'kicad-io', 'pcb-step', 'pcb-step-model'].forEach(m => R(m + '.js'));
['PcbHistory', 'FootprintGen', 'RefFP', 'PartsLib', 'PCB_REFBOARDS', 'IC_DATA', 'NetRules',
 'Ratsnest', 'AutoRoute', 'RouteAll', 'Stackup', 'Padstack', 'Backdrill', 'FabProfiles',
 'ConstraintMgr', 'PadDrc', 'KicadIO', 'PcbStep', 'StepModel', 'PcbArc']
  .forEach(k => { global[k] = global.window[k]; });

const GerberExport = require(path.join(W, 'supabase/functions/_shared/gerber.mjs'));

let src = fs.readFileSync(path.join(W, 'pcb.js'), 'utf8').replace(/pcbApp\.init\(\);\s*/m, '');
eval(src);
const app = global.window.pcbApp;
global.pcbApp = app; global.window.pcbApp = app;
['render', 'renderPartsList', 'syncSelPanel', 'populateEmiSelects', 'renderLayerList', 'toast',
 'checkTraceRules', 'renderNetPanel', 'renderBusPanel', 'renderLayerList'].forEach(m => { app[m] = noop; });
app.canvas = canvasStub; app.ctx = ctxStub;
const padAbs = app.padAbs.bind(app);

const mkdir = d => fs.mkdirSync(d, { recursive: true });
const want = process.argv[2];
const boards = (global.PCB_REFBOARDS || []).filter(b => !want || b.id === want);
if (!boards.length) { console.error('找不到公版：' + want); process.exit(1); }

const index = [];
for (const b of boards) {
  app.loadRefBoard(b.id);
  const st = app.state;
  st.netRules = window.NetRules ? window.NetRules.load() : [];
  const dir = path.join(OUT, b.id);
  mkdir(path.join(dir, 'gerber'));

  // ---- Gerber / Excellon ----
  const g = GerberExport.build(st, padAbs, b.id);
  for (const f of g.files) fs.writeFileSync(path.join(dir, 'gerber', f.name), f.text, 'utf8');

  // ---- KiCad（給 kicad-cli 跑它自己的 DRC）----
  // 專案檔一定要一起給：KiCad 7 之後設計規則不在板檔裡，只給板檔的話它會用自己的預設值，
  // 於是報一堆「規則不一樣」造成的假警報（實測 242 → 97）。
  fs.writeFileSync(path.join(dir, 'board.kicad_pcb'), window.KicadIO.buildNew(st), 'utf8');
  fs.writeFileSync(path.join(dir, 'board.kicad_pro'),
    window.KicadIO.buildProject(app.loadDrcRules(), 'board'), 'utf8');

  // ---- STEP（給 FreeCAD 的 OCCT 開）----
  const stp = window.PcbStep.build(st, { thickness: 1.6, name: b.id });
  fs.writeFileSync(path.join(dir, 'board.step'), stp.text, 'utf8');

  // ---- 我們自己算出來的數字：第三方要拿去對照的就是這些 ----
  const cu = (st.layerStack || []).filter(l => l.kind === 'copper');
  const thtPads = [];
  for (const c of (st.components || [])) for (const p of (c.pads || [])) {
    if (p.drill > 0) thtPads.push(padAbs(c, p));
  }
  index.push({
    id: b.id, dir,
    expect: {
      boardWidth: st.boardWidth, boardHeight: st.boardHeight,
      copperLayers: cu.length,
      traces: (st.traces || []).length,
      vias: (st.vias || []).length,
      thtPads: thtPads.length,
      drills: (st.vias || []).length + thtPads.length,
      components: (st.components || []).length,
      stepSolids: stp.stats.solids,
      thickness: 1.6
    },
    gerberFiles: g.files.map(f => f.name)
  });
  console.log(b.id.padEnd(16), 'gerber ' + g.files.length + ' 檔', '| step 實體 ' + stp.stats.solids,
    '| kicad_pcb ok');
}

fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(index, null, 2), 'utf8');
console.log('\n產物在 ' + OUT + '（index.json 帶著我們自己算的數字，給第三方對照）');
