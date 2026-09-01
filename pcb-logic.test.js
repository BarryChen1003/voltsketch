/**
 * pcb-logic.test.js — PCB 編輯器邏輯層回歸測試（node，無瀏覽器）
 * 目的：把「靠手動瀏覽器實測」的互動邏輯固化成可重跑測試，改碼即自動驗、防回歸。
 * 手法：stub DOM/canvas，載入 pcb.js 但「不跑 init()」（避開重 DOM 初始化），
 *       直接測純邏輯方法與狀態變化。渲染類方法覆寫成 no-op。
 * 涵蓋：nextRef / snapTarget / traceHit / traceEndpointHit / padAbs /
 *       PcbHistory undo-redo / pasteClipboard / 多選刪除 filter / refBoardParts /
 *       AutoRoute 淨空遵從 / autoRoute 讀 DRC 規則 / meanderTune 長度數學 / Backdrill 殘樁 /
 *       Stackup.geomFor 層感知阻抗幾何 / calcImpedance 已知值與單調性。
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
require('./pcb-index.js');   // 繞線的節點索引走共用的那一份
require('./pcb-nets.js');    // calcImpedance 的公式本體在這裡（pcb.js 只轉呼叫）
require('./pcb-fpinst.js');  // 元件實例／封裝庫分離
require('./pcb-rules.js');
require('./pcb-stackup.js');
require('./pcb-constraints.js');
require('./pcb-drc.js');
require('./pcb-fabs.js');

// pcb.js 內部以「裸全域」引用這些（瀏覽器 window 屬性＝全域）；node 需手動鏡射到 global
['PcbHistory', 'FootprintGen', 'RefFP', 'PartsLib', 'PCB_REFBOARDS', 'IC_DATA',
 'NetRules', 'Ratsnest', 'AutoRoute', 'Stackup', 'Padstack', 'Backdrill', 'FabProfiles', 'ConstraintMgr', 'PadDrc',
 'NetModel', 'FpInst'].forEach(k => { global[k] = global.window[k]; });

// ---------- 載入 pcb.js，但移除檔尾 init() ----------
let src = fs.readFileSync('./pcb.js', 'utf8');
src = src.replace(/pcbApp\.init\(\);\s*/m, '/* init skipped in test */');
eval(src);                       // 內含 window.pcbApp = pcbApp
const app = global.window.pcbApp;
global.pcbApp = app;          // pcb-stackup.js 等模組用裸全域 pcbApp 引用（瀏覽器有、node 要手動鏡射）

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

// ---------- 幾何小工具（本檔測試用）----------
const segDist = (px, py, x1, y1, x2, y2) => {
  const dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy;
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
};
const minDistToSegs = (px, py, segs) =>
  segs.reduce((m, s) => Math.min(m, segDist(px, py, s.x1, s.y1, s.x2, s.y2)), Infinity);

// 9) AutoRoute 遵守 clearance：淨空調大 → 路徑真的讓開（純函式層）
{
  const AR = window.AutoRoute;
  ok(!!AR, 'AutoRoute 應載入');
  const padAbs = (c, p) => ({ x: c.x + p.x, y: c.y + p.y });
  const mkState = () => ({
    boardWidth: 40, boardHeight: 30, traces: [], vias: [],
    components: [
      { id: 'a', ref: 'J1', x: -15, y: 0, rot: 0, pads: [{ x: 0, y: 0, w: 1, h: 1, side: 'F', net: 'SIG' }] },
      { id: 'b', ref: 'J2', x: 15, y: 0, rot: 0, pads: [{ x: 0, y: 0, w: 1, h: 1, side: 'F', net: 'SIG' }] },
      { id: 'o', ref: 'J3', x: 0, y: 0, rot: 0, pads: [{ x: 0, y: 0, w: 1, h: 1, side: 'F', net: 'GND' }] }
    ]
  });
  const line = { x1: -15, y1: 0, x2: 15, y2: 0, net: 'SIG' };

  // 9a 數字 clearance（舊呼叫相容）：小淨空 → 貼著障礙繞
  const tight = AR.route(mkState(), padAbs, line, { clearance: 0.15, width: 0.25, grid: 0.25 });
  ok(tight.ok, '9a 小淨空應繞得出來');
  const dTight = minDistToSegs(0, 0, tight.segs);
  // 障礙 pad 對角半徑 hypot(1,1)/2=0.707，+0.15 淨空 +0.125 半線寬 = 0.982
  ok(dTight > 0.85, `9a 小淨空仍應大於障礙半徑（得 ${dTight.toFixed(3)}）`);
  ok(dTight < 1.6, `9a 小淨空時應貼著障礙走（得 ${dTight.toFixed(3)}）`);

  // 9b DRC 規則物件：traceToPad 調到 2.0 → 必須讓得更開
  const wide = AR.route(mkState(), padAbs, line, {
    clearance: { traceToTrace: 0.15, traceToPad: 2.0, traceToEdge: 0 }, width: 0.25, grid: 0.25
  });
  ok(wide.ok, '9b 大淨空應仍繞得出來');
  const dWide = minDistToSegs(0, 0, wide.segs);
  // 期望 >= 0.707+2.0+0.125 = 2.832，扣一格 grid 容差
  ok(dWide > 2.5, `9b traceToPad=2.0 應讓開 >=2.5mm（得 ${dWide.toFixed(3)}）`);
  ok(dWide > dTight + 1.0, `9b 大淨空必須明顯比小淨空遠（${dWide.toFixed(3)} vs ${dTight.toFixed(3)}）`);

  // 9c traceToEdge 真的會擋路：板邊用3mm 走廊在淨空拉到 3 時應被封死
  {
    const st = mkState();
    // x=0 立一道牆，從 y=-12 一路到頂邊；只剩牆底與板底之間的窄走廊
    const wall = { id: 'w', ref: 'W1', x: 0, y: 0, rot: 0, pads: [] };
    for (let y = -12; y <= 15; y += 1) wall.pads.push({ x: 0, y, w: 1, h: 1, side: 'F', net: 'GND' });
    st.components[2] = wall;
    const open1 = AR.route(st, padAbs, line, { clearance: { traceToEdge: 0 }, width: 0.25, grid: 0.25 });
    const shut = AR.route(st, padAbs, line, { clearance: { traceToEdge: 3 }, width: 0.25, grid: 0.25 });
    ok(open1.ok, '9c 無板邊淨空時應從板底走廊鑽過去');
    ok(!shut.ok, '9c traceToEdge=3 應封死走廊、繞不出來');
    if (open1.ok) {
      const lowest = open1.segs.reduce((m, sg) => Math.min(m, sg.y1, sg.y2), Infinity);
      ok(lowest < -12, `9c 無板邊淨空時路徑應壓到 y<-12（得 ${lowest.toFixed(2)}）`);
    }
  }

  // 9d 靠板邊的 pad 在大板邊淨空下仍須繞得出來（逃逸泡泡）
  {
    const st = mkState();
    st.components[0].y = -14; st.components[1].y = -14;   // 兩顆19 pad 距板底只有 1mm
    st.components[2].y = 10;                              // 障礙挪開
    const eLine = { x1: -15, y1: -14, x2: 15, y2: -14, net: 'SIG' };
    const r9d = AR.route(st, padAbs, eLine, { clearance: { traceToEdge: 3 }, width: 0.25, grid: 0.25 });
    ok(r9d.ok, '9d 靠邊 pad 在 traceToEdge=3 下仍應繞得出來');
    if (r9d.ok) {
      // 離端點較遠的部分必須已經離開淨空帶（|x|<10 處）
      let worst = Infinity;
      for (const sg of r9d.segs) for (const pt of [[sg.x1, sg.y1], [sg.x2, sg.y2]])
        if (Math.abs(pt[0]) < 10) worst = Math.min(worst, 15 - Math.abs(pt[1]));
      ok(worst > 2.5, `9d 遠離端點處應已離板邊 >=2.5mm（得 ${worst.toFixed(2)}）`);
    }
  }
}

// 10) autoRoute() 真的讀 loadDrcRules()（鎖住 clearance 硬寫 0.15 的回歸）
{
  const savedState = app.state;
  const savedRules = app.loadDrcRules;
  app.state = Object.assign({}, savedState, {
    boardWidth: 40, boardHeight: 30, traces: [], vias: [], ratsnest: null,
    traceLayer: 'F.Cu', traceWidth: 0.25, selectedSet: [], selected: null,
    components: [
      { id: 'a', ref: 'J1', x: -15, y: 0, rot: 0, pads: [{ x: 0, y: 0, w: 1, h: 1, side: 'F', net: 'SIG' }] },
      { id: 'b', ref: 'J2', x: 15, y: 0, rot: 0, pads: [{ x: 0, y: 0, w: 1, h: 1, side: 'F', net: 'SIG' }] },
      { id: 'o', ref: 'J3', x: 0, y: 0, rot: 0, pads: [{ x: 0, y: 0, w: 1, h: 1, side: 'F', net: 'GND' }] }
    ]
  });
  // 假裝使用者把 DRC 淨空拉到 2mm
  app.loadDrcRules = () => ({
    clearance: { traceToTrace: 2.0, traceToPad: 2.0, padToPad: 2.0, traceToEdge: 0, viaToVia: 2.0, holeToHole: 0.25 },
    width: { minTrace: 0.1, maxTrace: 20, minPowerTrace: 0.3 },
    via: { minDrill: 0.2, minRing: 0.15 }, maskSliver: 0.15, compSpacing: 2, cinDist: 5
  });
  app.autoRoute();
  const routed = app.state.traces;
  ok(routed.length > 0, '10 autoRoute 應產生走線');
  // 淨空是「同層」才算：障礙是 F 面的 SMD pad，走線從 B.Cu 從它底下穿過是合法的。
  const f10 = routed.filter(t => (t.layer || 'F.Cu') === 'F.Cu');
  const d10 = minDistToSegs(0, 0, f10);
  ok(d10 > 2.5, `10 autoRoute 必須套用 DRC 淨空 2.0（F.Cu 得 ${d10.toFixed(3)}；硬寫 0.15 會 <1.6）`);
  app.state = savedState;
  app.loadDrcRules = savedRules;
}

// 11) meanderTune：蛇形補完後長度應命中目標（±0.05mm）
{
  const savedState = app.state;
  const savedGet = documentStub.getElementById;
  const stubs = { tuneNet: { value: 'CLK' }, tuneTarget: { value: '45' }, tuneMsg: { textContent: '' } };
  documentStub.getElementById = (id) => (Object.prototype.hasOwnProperty.call(stubs, id) ? stubs[id] : null);
  app.state = Object.assign({}, savedState, {
    traces: [{ id: 't1', x1: -20, y1: 0, x2: 20, y2: 0, width: 0.3, layer: 'F.Cu', net: 'CLK' }],
    vias: [], ratsnest: null
  });
  const before11 = window.NetRules.netLength(app.state.traces, 'CLK');
  eq(Math.round(before11 * 100) / 100, 40, '11 起始長度應為 40mm');
  app.meanderTune();
  const after11 = window.NetRules.netLength(app.state.traces, 'CLK');
  ok(Math.abs(after11 - 45) < 0.05, `11 蛇形後長度應命中 45mm ±0.05（得 ${after11.toFixed(4)}）`);
  ok(app.state.traces.every(t => t.net === 'CLK' && t.width === 0.3), '11 蛇形段應保留 net 與線寬');
  // 端點不可跑掉：仍要接回原本兩端
  const xs11 = app.state.traces.reduce((a, t) => a.concat([t.x1, t.x2]), []);
  ok(Math.min.apply(null, xs11) <= -20 + 1e-6 && Math.max.apply(null, xs11) >= 20 - 1e-6, '11 蛇形後仍接回原兩端點');
  app.state = savedState;
  documentStub.getElementById = savedGet;
}

// 12) Backdrill.compute：4 層板 via 只走 In1 → 上下各一支背鑽
{
  const BD = window.Backdrill;
  ok(!!BD, 'Backdrill 應載入');
  const copper = ['F.Cu', 'In1.Cu', 'In2.Cu', 'B.Cu'];
  const st12 = {
    vias: [{ x: 0, y: 0, od: 0.6, net: 'D0' }],
    traces: [
      { x1: 0, y1: 0, x2: 5, y2: 0, layer: 'In1.Cu', net: 'D0' },
      { x1: 0, y1: 0, x2: -5, y2: 0, layer: 'In1.Cu', net: 'D0' }
    ]
  };
  const out12 = BD.compute(st12, copper, null);
  eq(out12.length, 2, '12 只用 In1 的 via 應產生上下兩支背鑽');
  const top12 = out12.find(b => b.side === 'T'), bot12 = out12.find(b => b.side === 'B');
  ok(!!top12 && !!bot12, '12 應各有頂側與底側背鑽');
  eq(top12.to, 'In1.Cu', '12 頂側背鑽鑽到最上使用層');
  eq(top12.removed, 1, '12 頂側移除 1 層殘樁（F.Cu）');
  eq(bot12.removed, 2, '12 底側移除 2 層殘樁（In2 + B）');
  ok(Math.abs(top12.d - 0.8) < 1e-9, '12 背鑽刀徑 = via 外徑 0.6 + 0.2 過切');
  // 2 層板沒有殘樁可鑽
  eq(BD.compute(st12, ['F.Cu', 'B.Cu'], null).length, 0, '12 2 層板不應產生背鑽');
  // 全層都用到的 via 也不該背鑽
  const stFull = {
    vias: [{ x: 0, y: 0, od: 0.6, net: 'D1' }],
    traces: copper.map((L, i) => ({ x1: 0, y1: 0, x2: i + 1, y2: 0, layer: L, net: 'D1' }))
  };
  eq(BD.compute(stFull, copper, null).length, 0, '12 貫穿全層的 via 無殘樁');
}

// 13) Stackup.geomFor：阻抗幾何必須跟著「實際走線層」跑，不是永遠拿頂層
{
  const SK = window.Stackup;
  ok(!!SK, 'Stackup 應載入');
  const st4 = { layerStack: app.buildLayerStack(4) };
  const ids4 = st4.layerStack.filter(l => l.kind === 'copper').map(l => l.id);
  eq(ids4.join(','), 'F.Cu,In1.Cu,In2.Cu,B.Cu', '13 4 層銅層順序');
  const d4 = {
    oz: { 'F.Cu': 1, 'In1.Cu': 0.5, 'In2.Cu': 0.5, 'B.Cu': 1 },
    diel: [{ t: 0.2, er: 4.4 }, { t: 1.0, er: 4.6 }, { t: 0.2, er: 4.4 }]
  };

  // 外層 → microstrip，h 取緊鄰的第一層介電，參考層是 In1（GND 平面）
  const gTop = SK.geomFor(d4, st4, 'F.Cu');
  ok(!!gTop, '13 F.Cu 應推得出幾何');
  eq(gTop.kind, 'microstrip', '13 外層應為 microstrip');
  ok(Math.abs(gTop.h - 0.2) < 1e-9, '13 F.Cu 的 h 應取第 1 介電層 0.2mm');
  ok(Math.abs(gTop.er - 4.4) < 1e-9, '13 F.Cu 的 εr 應為 4.4');
  ok(Math.abs(gTop.t - 0.035) < 1e-9, '13 F.Cu 銅厚 1oz = 0.035mm');
  eq(gTop.ref, 'In1.Cu', '13 F.Cu 參考層為 In1.Cu');
  eq(gTop.warn.length, 0, '13 參考 GND 平面時不應有警告');

  // 底層 → 取最後一層介電，銅厚各自算
  const gBot = SK.geomFor(d4, st4, 'B.Cu');
  eq(gBot.kind, 'microstrip', '13 B.Cu 應為 microstrip');
  ok(Math.abs(gBot.h - 0.2) < 1e-9, '13 B.Cu 的 h 應取最後一層介電');
  eq(gBot.ref, 'In2.Cu', '13 B.Cu 參考層為 In2.Cu');

  // 內層 → stripline，h 取上下平均、εr 取厚度加權；不對稱與參考訊號層都要示警
  const gIn = SK.geomFor(d4, st4, 'In1.Cu');
  eq(gIn.kind, 'stripline', '13 內層應為 stripline');
  ok(Math.abs(gIn.h - 0.6) < 1e-9, `13 In1 的 h 應為上下平均 0.6（得 ${gIn.h}）`);
  ok(Math.abs(gIn.er - (4.4 * 0.2 + 4.6 * 1.0) / 1.2) < 1e-9, '13 In1 的 εr 應為厚度加權平均');
  ok(Math.abs(gIn.t - 0.0175) < 1e-9, '13 In1 銅厚 0.5oz = 0.0175mm');
  eq(gIn.ref, 'F.Cu/In2.Cu', '13 In1 參考層為上下兩銅層');
  ok(gIn.warn.indexOf('asym') >= 0, '13 上下介電 0.2 vs 1.0 應報 asym');
  ok(gIn.warn.indexOf('refsig') >= 0, '13 參考層含訊號層 F.Cu 應報 refsig');

  // 2 層板：參考層是另一面訊號層，必須示警（回流路徑不連續）
  const st2 = { layerStack: app.buildLayerStack(2) };
  const d2 = { oz: { 'F.Cu': 1, 'B.Cu': 1 }, diel: [{ t: 1.5, er: 4.5 }] };
  const g2 = SK.geomFor(d2, st2, 'F.Cu');
  ok(Math.abs(g2.h - 1.5) < 1e-9, '13 2 層板 h = 1.5mm');
  ok(g2.warn.indexOf('refsig') >= 0, '13 2 層板參考面是訊號層，應示警');

  // 不存在的層回 null，不亂編
  eq(SK.geomFor(d4, st4, 'In7.Cu'), null, '13 未知層應回 null');
}

// 14) calcImpedance：已知值 + 單調性（公式接錯參數會被抓到）
{
  const ci = app.calcImpedance.bind(app);
  // microstrip w=0.35 h=0.2 t=0.035 εr=4.4 → 87/√5.81·ln(1.196/0.315) ≈ 48.2Ω
  const z = ci('microstrip', 0.35, 0.2, 0.035, 4.4);
  ok(z && Math.abs(z.z0 - 48.2) < 0.5, `14 已知 microstrip 應約 48.2Ω（得 ${z && z.z0.toFixed(2)}）`);

  // 單調性：線寬↑ → Z0↓；介電厚↑ → Z0↑；εr↑ → Z0↓
  const zw = ci('microstrip', 0.50, 0.2, 0.035, 4.4).z0;
  const zh = ci('microstrip', 0.35, 0.3, 0.035, 4.4).z0;
  const ze = ci('microstrip', 0.35, 0.2, 0.035, 4.9).z0;
  ok(zw < z.z0, `14 線寬變大 Z0 應變小（${zw.toFixed(2)} < ${z.z0.toFixed(2)}）`);
  ok(zh > z.z0, `14 介電變厚 Z0 應變大（${zh.toFixed(2)} > ${z.z0.toFixed(2)}）`);
  ok(ze < z.z0, `14 εr 變大 Z0 應變小（${ze.toFixed(2)} < ${z.z0.toFixed(2)}）`);

  // 同幾何下 stripline 應低於 microstrip（兩面被平面夾住，電容大）
  const sl = ci('stripline', 0.35, 0.2, 0.035, 4.4).z0;
  ok(sl < z.z0, `14 同幾何 stripline 應低於 microstrip（${sl.toFixed(2)} < ${z.z0.toFixed(2)}）`);

  // 差分：Zdiff < 2×Z0，且間距拉開會趨近 2×Z0
  const dNear = ci('diff-microstrip', 0.35, 0.2, 0.035, 4.4, 0.15);
  const dFar = ci('diff-microstrip', 0.35, 0.2, 0.035, 4.4, 0.60);
  ok(dNear.zdiff < 2 * dNear.z0, '14 Zdiff 應小於 2×Z0（耦合拉低）');
  ok(dFar.zdiff > dNear.zdiff, `14 間距拉開 Zdiff 應變大（${dFar.zdiff.toFixed(2)} > ${dNear.zdiff.toFixed(2)}）`);
  ok(dFar.zdiff < 2 * dFar.z0, '14 間距再大仍不應超過 2×Z0');

  // 參數不合法要回 null，不回 NaN
  eq(ci('microstrip', 0, 0.2, 0.035, 4.4), null, '14 w=0 應回 null');
  eq(ci('microstrip', 0.35, 0.2, 0.035, 0.5), null, '14 εr<1 應回 null');
  eq(ci('diff-microstrip', 0.35, 0.2, 0.035, 4.4), null, '14 差分缺 s 應回 null');
}

// 15) 板層數變多後，疊層資料要對齊銅層數（瀏覽器實測抓到的洞）
//     舊行為：面板開著時把板子從 2 層改成 4 層，疊層仍是 1 層介電，
//     內層阻抗推導直接回 null，而且存檔會把正確的 3 層介電覆蓋成 1 層。
{
  const SK = window.Stackup;
  const st4 = { layerStack: app.buildLayerStack(4) };
  // 模擬「這片板本來是 2 層」留下的舊資料
  localStorage.setItem('vs-stackup-v1', JSON.stringify({ oz: { 'F.Cu': 1, 'B.Cu': 1 }, diel: [{ t: 1.5, er: 4.5 }] }));

  const loaded = SK.load(st4);
  eq(loaded.diel.length, 3, '15 4 層板應補齊成 3 層介電');
  ok(loaded.diel.every(d => d.t > 0 && d.er > 1), '15 補出來的介電層要有合法預設值');
  ['F.Cu', 'In1.Cu', 'In2.Cu', 'B.Cu'].forEach(id => ok(loaded.oz[id] > 0, `15 ${id} 應有銅厚預設`));
  ok(Math.abs(loaded.diel[0].t - 1.5) < 1e-9, '15 既有的第 1 層介電值不可被覆蓋');

  // 對齊後內層才推得出幾何（沒對齊會是 null）
  const gIn = SK.geomFor(loaded, st4, 'In1.Cu');
  ok(!!gIn, '15 對齊後內層應推得出阻抗幾何');
  eq(gIn.kind, 'stripline', '15 內層應為 stripline');

  // 反向：沒對齊的短陣列就是會回 null，這正是瀏覽器上看到的症狀
  eq(SK.geomFor({ oz: { 'In1.Cu': 1 }, diel: [{ t: 1.5, er: 4.5 }] }, st4, 'In1.Cu'), null,
     '15 介電層數不足時應誠實回 null，不是硬編一個數字');

  // 縮回 2 層要截斷，不留下多餘介電層
  const st2 = { layerStack: app.buildLayerStack(2) };
  eq(SK.load(st2).diel.length, 1, '15 縮回 2 層應只剩 1 層介電');
  localStorage.removeItem('vs-stackup-v1');
}

// 16) FabProfiles：中立多廠 DFM。重點是「未公開的欄位要誠實跳過」，不是硬湊數字
{
  const FP = window.FabProfiles;
  ok(!!FP, 'FabProfiles 應載入');
  const padAbs = (c, p) => ({ x: c.x + p.x, y: c.y + p.y });

  // 每個 profile 都要有出處與擷取日期，否則規格無從查證
  FP.list.forEach(p => {
    ok(/^https?:\/\//.test(p.source || ''), `16 ${p.id} 應有官方出處 URL`);
    ok(/^\d{4}-\d{2}-\d{2}$/.test(p.fetched || ''), `16 ${p.id} 應標擷取日期`);
    ok(p.tiers && p.tiers.length > 0, `16 ${p.id} 應至少有一個檔位`);
  });

  // 檔位要依板層數選：OSH Park 2 層與 4 層線寬不同（6mil vs 5mil）
  const osh = FP.byId('oshpark');
  const t2 = FP.tierFor(osh, 2), t4 = FP.tierFor(osh, 4);
  ok(Math.abs(t2.rules.minTrace - 0.1524) < 1e-6, '16 OSH Park 2 層最小線寬 6mil');
  ok(Math.abs(t4.rules.minTrace - 0.127) < 1e-6, '16 OSH Park 4 層最小線寬 5mil');
  eq(FP.tierFor(osh, 6), null, '16 OSH Park 不做 6 層，應回 null');
  eq(FP.tierFor(FP.byId('pcbway'), 20), null, '16 PCBWay standard 檔上限 14 層');

  // 一片乾淨的板：4 層、線寬 0.2、via 0.6/0.3、都離板邊夠遠 → 各廠都該過
  const clean = {
    boardWidth: 50, boardHeight: 40, layers: 4,
    layerStack: app.buildLayerStack(4),
    traces: [{ x1: -10, y1: 0, x2: 10, y2: 0, width: 0.2, layer: 'F.Cu', net: 'A' }],
    vias: [{ x: 0, y: 5, od: 0.6, id: 0.3, net: 'A' }],
    components: [], texts: []
  };
  const rJ = FP.check(clean, 'jlcpcb', padAbs);
  ok(rJ.ok, '16 乾淨板在 JLCPCB 應通過');
  eq(rJ.findings.filter(f => f.severity === 'error').length, 0, '16 乾淨板不應有 error');

  // 線寬 0.08 < 各家下限（JLC/PCBWay 0.10、OSH 0.127、Seeed 0.1016）→ 全部要抓到
  const thin = JSON.parse(JSON.stringify(clean));
  thin.layerStack = app.buildLayerStack(4);
  thin.traces[0].width = 0.08;
  ['jlcpcb', 'pcbway', 'seeed'].forEach(id => {
    const r = FP.check(thin, id, padAbs);
    const f = r.findings.find(x => x.code === 'traceTooThin');
    ok(!!f, `16 ${id} 應抓到線寬過細`);
    ok(Math.abs(f.actual - 0.08) < 1e-9, `16 ${id} 應回報實際線寬 0.08`);
    eq(f.severity, 'error', `16 ${id} 線寬過細屬 error`);
  });

  // 環寬：JLCPCB 4 層絕對下限 0.15、建議 0.20 → 0.17 應是 warn 而不是 error
  const ring = JSON.parse(JSON.stringify(clean));
  ring.layerStack = app.buildLayerStack(4);
  ring.vias = [{ x: 0, y: 5, od: 0.64, id: 0.30, net: 'A' }];   // 環寬 0.17
  const rr = FP.check(ring, 'jlcpcb', padAbs);
  const fw = rr.findings.find(f => f.code === 'annularBelowRec');
  ok(!!fw && fw.severity === 'warn', '16 環寬 0.17 應是「低於建議值」的 warn');
  ok(rr.ok, '16 只有 warn 時整體仍算可製造');

  // 環寬 0.10 < 0.15 → error
  const ring2 = JSON.parse(JSON.stringify(ring));
  ring2.layerStack = app.buildLayerStack(4);
  ring2.vias = [{ x: 0, y: 5, od: 0.50, id: 0.30, net: 'A' }];
  const rr2 = FP.check(ring2, 'jlcpcb', padAbs);
  ok(rr2.findings.some(f => f.code === 'annularTooThin' && f.severity === 'error'), '16 環寬 0.10 應是 error');
  ok(!rr2.ok, '16 有 error 時不可宣稱可製造');

  // 誠實條款：Seeed 官方頁沒公開環寬/板邊/絲印 → 必須列進 skipped，不可拿別家的值頂替
  const rS = FP.check(clean, 'seeed', padAbs);
  ['minAnnular', 'minEdgeClearance', 'minSilkHeight'].forEach(k =>
    ok(rS.skipped.indexOf(k) >= 0, `16 Seeed 未公開 ${k}，應列入 skipped`));
  ok(!rS.findings.some(f => f.code === 'annularTooThin' || f.code === 'edgeClearance'),
     '16 未公開的規則不可產生 finding（等於編數字）');

  // 板邊淨空：走線壓到離邊 0.1mm，JLCPCB(0.20) 與 OSH Park(0.381) 都該抓，PCBWay(0.25) 也是
  const edge = JSON.parse(JSON.stringify(clean));
  edge.layerStack = app.buildLayerStack(4);
  edge.traces = [{ x1: -24.95, y1: 0, x2: 0, y2: 0, width: 0.2, layer: 'F.Cu', net: 'A' }];
  const re1 = FP.check(edge, 'jlcpcb', padAbs);
  ok(re1.findings.some(f => f.code === 'edgeClearance'), '16 貼板邊走線 JLCPCB 應抓到');

  // 超出板廠尺寸上限
  const big = JSON.parse(JSON.stringify(clean));
  big.layerStack = app.buildLayerStack(4);
  big.boardWidth = 900; big.boardHeight = 700;
  ok(FP.check(big, 'jlcpcb', padAbs).findings.some(f => f.code === 'boardTooBig'), '16 900×700 超過 JLCPCB 上限');

  // 層數超過該廠能力 → 直接回 layerCount error，不是靜靜通過
  const many = JSON.parse(JSON.stringify(clean));
  many.layerStack = app.buildLayerStack(20);
  const rM = FP.check(many, 'oshpark', padAbs);
  ok(!rM.ok && rM.findings.some(f => f.code === 'layerCount'), '16 20 層在 OSH Park 應回 layerCount error');

  // compare：能做的排前面
  const cmp = FP.compare(thin, padAbs);
  eq(cmp.length, FP.list.length, '16 compare 應涵蓋所有板廠');
  // 可製造的排前面；同組內「公開規格越完整」排越前。
  // 刻意不讓 error 數當第一鍵：公開得少的廠可檢查點少、錯誤自然少，
  // 用 error 數排會把資料最不透明的廠捧到第一名（Seeed 沒公開環寬/板邊就是這種情形）。
  const errCount = r => r.findings.filter(f => f.severity === 'error').length;
  for (let i = 1; i < cmp.length; i++) {
    const a = cmp[i - 1], b = cmp[i];
    ok(!(b.ok && !a.ok), '16 compare 應把可製造的排在前面');
    if (a.ok === b.ok) ok(a.skipped.length <= b.skipped.length, '16 同組內揭露越完整應排越前');
  }
  const seeed = cmp.findIndex(r => r.profile.id === 'seeed');
  const jlc = cmp.findIndex(r => r.profile.id === 'jlcpcb');
  ok(jlc < seeed, '16 Seeed 未公開 4 項，不可因錯誤數少就排在 JLCPCB 之前');
  ok(errCount(cmp[seeed]) <= errCount(cmp[jlc]), '16 （前提）Seeed 的 error 數確實比較少，排序仍不該被它騙過去');
}

// 17) 線距與 via 焊環：資料檔裡有這兩條規則，但一直沒被檢查
{
  const FP = window.FabProfiles;
  const padAbs = (c, p) => ({ x: c.x + p.x, y: c.y + p.y });
  const base = () => ({
    boardWidth: 50, boardHeight: 40, layers: 2, layerStack: app.buildLayerStack(2),
    components: [], texts: [], vias: [],
    traces: [
      { x1: -10, y1: 0, x2: 10, y2: 0, width: 0.2, layer: 'F.Cu', net: 'A' },
      { x1: -10, y1: 0.25, x2: 10, y2: 0.25, width: 0.2, layer: 'F.Cu', net: 'B' }
    ]
  });
  // 兩條中心距 0.25、各半寬 0.1 → 邊到邊 0.05 < 0.10
  const tight = FP.check(base(), 'jlcpcb', padAbs);
  const fs = tight.findings.find(f => f.code === 'spaceTooTight');
  ok(!!fs, '17 應抓到線距不足');
  ok(Math.abs(fs.actual - 0.05) < 1e-9, `17 應回報邊到邊實際間距 0.05（得 ${fs && fs.actual}）`);
  eq(fs.severity, 'error', '17 線距不足屬 error');

  // 同一個 net 不算違規（同網相接本來就會靠在一起）
  const sameNet = base(); sameNet.traces[1].net = 'A';
  ok(!FP.check(sameNet, 'jlcpcb', padAbs).findings.some(f => f.code === 'spaceTooTight'), '17 同 net 不應報線距');

  // 不同層不算
  const otherLayer = base(); otherLayer.traces[1].layer = 'B.Cu';
  ok(!FP.check(otherLayer, 'jlcpcb', padAbs).findings.some(f => f.code === 'spaceTooTight'), '17 異層不應報線距');

  // 拉開到 0.4 中心距（邊到邊 0.2）就該過
  const wide = base(); wide.traces[1].y1 = 0.4; wide.traces[1].y2 = 0.4;
  ok(!FP.check(wide, 'jlcpcb', padAbs).findings.some(f => f.code === 'spaceTooTight'), '17 間距足夠不應誤報');

  // 交叉的兩條線距離 0，一定要抓到（只比端點會漏）
  const cross = base();
  cross.traces[1] = { x1: 0, y1: -5, x2: 0, y2: 5, width: 0.2, layer: 'F.Cu', net: 'B' };
  ok(FP.check(cross, 'jlcpcb', padAbs).findings.some(f => f.code === 'spaceTooTight'), '17 交叉走線必須抓到（端點都很遠）');

  // via 焊環外徑：JLCPCB 下限 0.25
  const vp = base();
  vp.vias = [{ x: 0, y: 10, od: 0.2, id: 0.15, net: 'A' }];
  ok(FP.check(vp, 'jlcpcb', padAbs).findings.some(f => f.code === 'viaPadTooSmall'), '17 via 焊環 0.2 < 0.25 應抓到');
  // PCBWay 沒公開這項 → 必須列 skipped，不可借用 JLCPCB 的值
  const rp = FP.check(vp, 'pcbway', padAbs);
  ok(rp.skipped.indexOf('minViaPad') >= 0, '17 PCBWay 未公開 minViaPad，應列 skipped');
  ok(!rp.findings.some(f => f.code === 'viaPadTooSmall'), '17 未公開的規則不可產生 finding');
}

// 18) 選定板廠：DRC 與匯出閘門都讀這裡，所以要能存、能過期、能給回填值
{
  const FP = window.FabProfiles;
  localStorage.removeItem(FP.SEL_KEY);
  eq(FP.selectedId(), FP.list[0].id, '18 沒選過時回第一家，不回 undefined');
  ok(FP.select('pcbway'), '18 select 合法 id 應成功');
  eq(FP.selectedId(), 'pcbway', '18 選擇要持久化');
  eq(FP.select('not-a-fab'), false, '18 不存在的 id 應拒絕');
  eq(FP.selectedId(), 'pcbway', '18 拒絕後不可污染既有選擇');
  localStorage.setItem(FP.SEL_KEY, 'ghost-fab');
  eq(FP.selectedId(), FP.list[0].id, '18 存了不存在的 id 要退回預設，不可回 ghost');

  // 過期判定
  const jl = FP.byId('jlcpcb');
  const soon = Date.parse(jl.fetched + 'T00:00:00Z') + 30 * 24 * 3600 * 1000;
  const later = Date.parse(jl.fetched + 'T00:00:00Z') + 400 * 24 * 3600 * 1000;
  eq(FP.isStale(jl, 12, soon), false, '18 擷取後一個月不算過期');
  eq(FP.isStale(jl, 12, later), true, '18 擷取後 400 天應算過期');
  eq(FP.isStale({ fetched: '' }, 12, later), true, '18 沒有擷取日期一律當過期');

  // DRC 回填值：要對得上該廠該檔位的公開數字
  const r2 = FP.drcRulesFor('jlcpcb', 2);
  ok(Math.abs(r2.clearance - 0.10) < 1e-9, '18 JLCPCB 線距回填 0.10');
  ok(Math.abs(r2.minTrace - 0.10) < 1e-9, '18 JLCPCB 線寬回填 0.10');
  ok(Math.abs(r2.edge - 0.20) < 1e-9, '18 JLCPCB 板邊回填 0.20');
  const ro = FP.drcRulesFor('oshpark', 4);
  ok(Math.abs(ro.minTrace - 0.127) < 1e-6, '18 OSH Park 4 層線寬回填 5mil');
  ok(Math.abs(ro.edge - 0.381) < 1e-6, '18 OSH Park 板邊回填 15mil');
  // 未公開的要回 null，讓 UI 保留原值而不是填 0
  const rs = FP.drcRulesFor('seeed', 2);
  eq(rs.edge, null, '18 Seeed 未公開板邊，應回 null 而不是 0');
  eq(FP.drcRulesFor('oshpark', 8), null, '18 該廠做不了的層數應回 null');
  // mil 換算的浮點尾巴不可外流到 DRC 欄位（6mil = 0.15239999999999998）
  const r6 = FP.drcRulesFor('oshpark', 2);
  ok(String(r6.minTrace).length <= 6, `18 回填值應四捨五入到 4 位（得 ${r6.minTrace}）`);
  eq(r6.minTrace, 0.1524, '18 OSH Park 2 層線寬應為乾淨的 0.1524');
  Object.values(FP.list).forEach(pf => [2, 4].forEach(n => {
    const r = FP.drcRulesFor(pf.id, n);
    if (!r) return;
    Object.values(r).forEach(v => { if (v != null) ok(String(v).length <= 7, `18 ${pf.id} 回填值不可有浮點尾巴（得 ${v}）`); });
  }));
  localStorage.removeItem(FP.SEL_KEY);

  // 內建的 via 預設值必須過得了各家的絕對下限，
  // 否則使用者什麼都還沒改就先被退件（舊預設 0.6/0.3 環寬 0.15 < JLC 0.18）
  {
    localStorage.removeItem('vs-padstack-v1');
    const ps = window.Padstack.load();
    const ring = (ps.od - ps.drill) / 2;
    ok(ring >= 0.18 - 1e-9, `18 預設 via 環寬 ${ring} 應 >= JLCPCB 絕對下限 0.18`);
    const padAbs2 = (c, pd) => ({ x: c.x + pd.x, y: c.y + pd.y });
    const st18 = {
      boardWidth: 50, boardHeight: 40, layers: 2, layerStack: app.buildLayerStack(2),
      components: [], texts: [], traces: [],
      vias: [{ x: 0, y: 0, od: ps.od, id: ps.drill, net: 'A' }]
    };
    FP.list.forEach(pf => {
      const r = FP.check(st18, pf.id, padAbs2);
      ok(!r.findings.some(f => f.code === 'annularTooThin'),
         `18 預設 via 不應在 ${pf.name} 被判環寬不足`);
      ok(!r.findings.some(f => f.code === 'drillTooSmall'),
         `18 預設鄜徑不應在 ${pf.name} 被判過小`);
    });
  }
}

// 19) A-2 差分對間距優先序：Constraint class pairGap > NetRules gap > 0.2 預設
{
  const CM = window.ConstraintMgr;
  ok(!!CM, '19 ConstraintMgr 應載入');
  const savedNR = app.state.netRules;
  localStorage.removeItem('vs-constraints-v1');

  eq(app.diffGapOf('SOME_NET'), 0.2, '19 什麼規則都沒有時回 0.2 預設');

  // NetRules 有 gap → 蓋過預設
  app.state.netRules = [{ pattern: 'USB', minW: 0, maxLen: 0, gap: 0.35 }];
  ok(Math.abs(app.diffGapOf('USB_DP') - 0.35) < 1e-9, '19 NetRules 的 gap 應蓋過 0.2 預設');
  ok(Math.abs(app.diffGapOf('CLK') - 0.2) < 1e-9, '19 不匹配的 net 仍回預設');

  // Constraint class pairGap → 再蓋過 NetRules（DIFF class 內建 pairGap 0.2）
  const cls = CM.load();
  const diff = cls.classes.find(c => c.id === 'diff');
  diff.elec.pairGap = 0.45;
  diff.patterns = ['/_[PN]$/'];
  CM.save(cls);
  ok(Math.abs(app.diffGapOf('USB_P') - 0.45) < 1e-9,
     `19 Constraint pairGap 應蓋過 NetRules（得 ${app.diffGapOf('USB_P')}）`);
  // pairGap 為 0 視為沒設，要往下退回 NetRules（0.35），不是當成 0mm 間距、也不是直接跳到預設
  diff.elec.pairGap = 0;
  CM.save(cls);
  ok(Math.abs(app.diffGapOf('USB_P') - 0.35) < 1e-9,
     `19 pairGap=0 應退回 NetRules 的 0.35（得 ${app.diffGapOf('USB_P')}）`);
  ok(app.diffGapOf('USB_P') > 0, '19 任何情況都不可回 0mm 間距');
  ok(Math.abs(app.diffGapOf('NO_MATCH_NET') - 0.2) < 1e-9, '19 三層都不匹配才回 0.2 預設');

  localStorage.removeItem('vs-constraints-v1');
  app.state.netRules = savedNR;
}

// 20) A-3 走線規則稽核：三種違規各一個案例，合規的不可誤報
{
  const NR = window.NetRules;
  const rules = [
    { pattern: 'PWR', minW: 0.5, maxLen: 0, pairTol: 0 },
    { pattern: 'CLK', minW: 0, maxLen: 30, pairTol: 0 },
    { pattern: '/_[PN]$/', minW: 0, maxLen: 0, pairTol: 0.5 }
  ];
  const mkState = traces => ({ traces, vias: [], components: [] });

  // 線寬下限
  const thin = mkState([{ x1: 0, y1: 0, x2: 10, y2: 0, width: 0.3, layer: 'F.Cu', net: 'PWR_5V' }]);
  ok(NR.audit(rules, thin).length > 0, '20 線寬 0.3 < 下限 0.5 應被抓到');
  const okW = mkState([{ x1: 0, y1: 0, x2: 10, y2: 0, width: 0.6, layer: 'F.Cu', net: 'PWR_5V' }]);
  eq(NR.audit(rules, okW).length, 0, '20 線寬 0.6 合規不可誤報');

  // 長度上限
  const long = mkState([{ x1: 0, y1: 0, x2: 40, y2: 0, width: 0.2, layer: 'F.Cu', net: 'CLK0' }]);
  ok(NR.audit(rules, long).length > 0, '20 長度 40 > 上限 30 應被抓到');
  const okL = mkState([{ x1: 0, y1: 0, x2: 20, y2: 0, width: 0.2, layer: 'F.Cu', net: 'CLK0' }]);
  eq(NR.audit(rules, okL).length, 0, '20 長度 20 合規不可誤報');

  // 差分長度差
  const skew = mkState([
    { x1: 0, y1: 0, x2: 20, y2: 0, width: 0.2, layer: 'F.Cu', net: 'D0_P' },
    { x1: 0, y1: 1, x2: 25, y2: 1, width: 0.2, layer: 'F.Cu', net: 'D0_N' }
  ]);
  ok(NR.audit(rules, skew).length > 0, '20 差分長度差 5mm > 容差 0.5 應被抓到');
  const okS = mkState([
    { x1: 0, y1: 0, x2: 20, y2: 0, width: 0.2, layer: 'F.Cu', net: 'D0_P' },
    { x1: 0, y1: 1, x2: 20.3, y2: 1, width: 0.2, layer: 'F.Cu', net: 'D0_N' }
  ]);
  eq(NR.audit(rules, okS).length, 0, '20 差分長度差 0.3 < 容差 0.5 不可誤報');

  // 完全沒有規則時不可憑空產出違規
  eq(NR.audit([], skew).length, 0, '20 沒有規則就不該有違規');
}

// 21) A-4 runDrc：先確認 8 片公版自己過得了（線路圖那次的教訓）
{
  const savedState = app.state;
  const savedQS = documentStub.querySelector;
  const drcBox = { innerHTML: '' };
  documentStub.querySelector = sel => (sel === '#drcResults' ? drcBox : (sel === '#pcbCanvas' ? canvasStub : null));

  function mkPlain(extra) {
    const ls = app.buildLayerStack(2);
    return Object.assign({
      boardWidth: 50, boardHeight: 40, layers: 2, layerStack: ls,
      visibleLayers: ls.map(l => l.id),
      components: [], traces: [], vias: [], zones: [], userZones: [], keepouts: [], texts: [],
      netRules: [], selectedSet: [], selected: null
    }, extra || {});
  }

  // 21a 公版的 DRC 現況。2026-08-26 用 tools/refboard-rebuild.js 重建過一輪：
  //     示意走線換成真的繞線、擺位鬆弛推開太近的元件、8 種 footprint 的 pad 互疊也修掉了。
  //     合計 388 -> 0。
  //     預算只准往下：哪天再降就把數字一起調低，變多就是有人把板子改壞了。
  const BUDGET = {
    'rp2040-pico30': 0, 'arduino-uno-r3': 0, 'esp32-poe2': 0, 'a20-lime': 0,
    'imx233-maxi': 0, 'openrex-imx6': 0, 'imx8mp-som': 0, 'librevna': 0
  };
  const boards = (window.PCB_REFBOARDS || []).map(b => b.id).filter(Boolean);
  eq(boards.length, 8, '21 應有 8 片公版');
  const worse = [];
  for (const id of boards) {
    app.loadRefBoard(id);
    // 瀏覽器的 init() 會載入 NetRules（預設含 VIN 0.5mm / GND 0.3mm）。
    // node 不跑 init，不補這行的話這裡永遠是綠的，使用者打開卻看得到違規。
    app.state.netRules = window.NetRules ? window.NetRules.load() : [];
    const errs = app.runDrc().filter(r => r.type === 'error').length;
    const cap = BUDGET[id];
    ok(cap != null, `21 公版 ${id} 應列在缺陷預算裡（新增公版要一起登記）`);
    if (cap != null && errs > cap) worse.push(`${id}: ${errs} > ${cap}`);
  }
  eq(worse.join(' │ '), '', '21 公版的 DRC error 只准變少，不准變多');

  // 21b 未繞預算。DRC 全 0 不代表板子接得起來——2026-09-01 實測 8 片共 134 條未繞，
  // 其中一半以上是**零長度飛線**：同一點、同 net、不同層、缺 via，畫面上看不見。
  // 根因是繞線器收線時允許收在別層（已修，見第 39 節），資料端由 tools/refboard-fill.js 縫回來。
  // 這個預算跟 DRC 一樣只准往下：變多就是有人把板子改壞了，或繞線器又退步了。
  const OPEN_BUDGET = {
    'rp2040-pico30': 8, 'arduino-uno-r3': 8, 'esp32-poe2': 5, 'a20-lime': 3,
    'imx233-maxi': 2, 'openrex-imx6': 7, 'imx8mp-som': 4, 'librevna': 6
  };
  // 剩下的零長度飛線：那個點要打 via 才接得起來，但 via 放下去會撞到鄰居
  //（密腳 B2B／BGA 區，實測 DRC 0 -> 1~4）。正解是逃逸繞線把接點挪開再打，
  // 不在「補繞」的範圍內，所以先記成預算。同樣只准往下。
  const ZERO_BUDGET = {
    'rp2040-pico30': 1, 'arduino-uno-r3': 0, 'esp32-poe2': 0, 'a20-lime': 0,
    'imx233-maxi': 2, 'openrex-imx6': 1, 'imx8mp-som': 2, 'librevna': 0
  };
  const openWorse = [], zeroLen = [];
  for (const id of boards) {
    app.loadRefBoard(id);
    app.state.netRules = window.NetRules ? window.NetRules.load() : [];
    const rl = window.Ratsnest.compute(app.state, app.padAbs.bind(app));
    const cap = OPEN_BUDGET[id];
    ok(cap != null, `21b 公版 ${id} 應列在未繞預算裡`);
    if (cap != null && rl.length > cap) openWorse.push(`${id}: ${rl.length} > ${cap}`);
    const z = rl.filter(l => Math.hypot(l.x2 - l.x1, l.y2 - l.y1) < 1e-6).length;
    if (z > (ZERO_BUDGET[id] || 0)) zeroLen.push(`${id}: ${z} > ${ZERO_BUDGET[id] || 0}`);
  }
  eq(openWorse.join(' │ '), '', '21b 公版的未繞條數只准變少');
  // 零長度飛線＝同一點、同 net、不同層、缺 via 的壞接點：畫面上看不見，使用者只覺得飛線降不下去
  eq(zeroLen.join(' │ '), '', '21b 公版的零長度飛線只准變少');

  // pad 的 net 有兩個來源：公版資料自帶的 padNets 表，以及走線端點回推（assignPadNets）。
  // 2026-08-26 之前只有後者，所以多數 pad 沒有 net、繞線器只能把它們當障礙。
  {
    app.loadRefBoard('rp2040-pico30');
    const pads = [];
    app.state.components.forEach(c => (c.pads || []).forEach(x => pads.push(x)));
    const loaded = pads.filter(x => x.net).length;
    ok(loaded > 0, '21 載入公版後應有 pad 帶著 net');
    // 純函式行為：清掉之後只靠走線回推，數量不會超過載入時（padNets 的那些回不來）
    pads.forEach(x => { x.net = ''; });
    const r1 = app.assignPadNets(app.state.components, app.state.traces);
    ok(r1.assigned > 0, '21 走線端點要能回推出 net');
    ok(r1.assigned <= loaded, '21 只靠走線回推不該多過載入時的數量（實際 ' + r1.assigned + ' vs ' + loaded + '）');
    const r2 = app.assignPadNets(app.state.components, app.state.traces);
    eq(r2.assigned, 0, '21 已經有 net 的 pad 不可被重複指派');
    // 走線沒有 net 就不該亂指派
    const comps = [{ id: 'c', ref: 'R1', x: 0, y: 0, rot: 0, pads: [{ x: 0, y: 0, w: 1, h: 1, side: 'F', net: '' }] }];
    eq(app.assignPadNets(comps, [{ x1: 0, y1: 0, x2: 5, y2: 0, net: '' }]).assigned, 0,
       '21 走線沒有 net 時不可憑空給 pad 指派');
    // 端點落在 pad 上才算，離太遠不算
    eq(app.assignPadNets(comps, [{ x1: 0, y1: 0, x2: 5, y2: 0, net: 'SIG' }]).assigned, 1, '21 端點落在 pad 上應指派');
    comps[0].pads[0].net = '';
    eq(app.assignPadNets(comps, [{ x1: 9, y1: 9, x2: 5, y2: 5, net: 'SIG' }]).assigned, 0, '21 端點離很遠不可指派');
  }

  // PadDrc 缺席時 DRC 是「不完整」不是「通過」：要看得到警告，不能只是一條 info
  {
    const savedPD = window.PadDrc;
    app.state = mkPlain();
    delete window.PadDrc; delete global.PadDrc;
    const res = app.runDrc();
    ok(res.some(r => r.type === 'warning'), '21 PadDrc 沒載入時應升級為 warning，不可只給 info');
    window.PadDrc = savedPD; global.PadDrc = savedPD;
  }

  // 21b 造出來的違規要抓得到
  const mk = mkPlain;

  // 線距不足
  app.state = mk({ traces: [
    { x1: -10, y1: 0, x2: 10, y2: 0, width: 0.2, layer: 'F.Cu', net: 'A' },
    { x1: -10, y1: 0.2, x2: 10, y2: 0.2, width: 0.2, layer: 'F.Cu', net: 'B' }
  ] });
  ok(app.runDrc().some(r => r.type === 'error'), '21 間距不足應報 error');

  // via 落在禁佈區
  app.state = mk({
    vias: [{ x: 0, y: 0, od: 0.6, id: 0.3, net: 'A' }],
    keepouts: [{ layer: 'F.Cu', pts: [[-5, -5], [5, -5], [5, 5], [-5, 5]] }],
    traces: [{ x1: 0, y1: 0, x2: 3, y2: 0, width: 0.2, layer: 'F.Cu', net: 'A' }]
  });
  const koRes = app.runDrc();
  ok(koRes.some(r => r.type === 'error'), '21 禁佈區內的銅應報 error');

  // 合規的板不可誤報 error
  app.state = mk({ traces: [
    { x1: -10, y1: 0, x2: 10, y2: 0, width: 0.2, layer: 'F.Cu', net: 'A' },
    { x1: -10, y1: 3, x2: 10, y2: 3, width: 0.2, layer: 'F.Cu', net: 'B' }
  ] });
  eq(app.runDrc().filter(r => r.type === 'error').length, 0, '21 合規板不可誤報 error');

  app.state = savedState;
  documentStub.querySelector = savedQS;
}

// 22) 多層繞線：舊版只在單層繞、不會下 via，兩層以上的板等於沒有 autoRoute
{
  const AR = window.AutoRoute;
  const padAbs = (c, p) => ({ x: c.x + p.x, y: c.y + p.y });
  // 一道從上到下貫穿板子的牆（F.Cu 走線），單層時必定繞不過去
  const wallState = () => {
    const traces = [];
    for (let y = -15; y <= 15; y += 0.4) traces.push({ x1: 0, y1: y, x2: 0.01, y2: y, width: 0.5, layer: 'F.Cu', net: 'WALL' });
    return {
      boardWidth: 40, boardHeight: 30, traces, vias: [],
      components: [
        // 兩端是 F 面 SMD：路徑一定要從 F.Cu 起、F.Cu 終，中間才有換層的必要。
        // 若用穿孔 pad（side '*'），路由器會整條走 B.Cu、一顆 via 都不用——那也是對的。
        { id: 'a', ref: 'J1', x: -15, y: 0, rot: 0, pads: [{ x: 0, y: 0, w: 1, h: 1, side: 'F', net: 'SIG' }] },
        { id: 'b', ref: 'J2', x: 15, y: 0, rot: 0, pads: [{ x: 0, y: 0, w: 1, h: 1, side: 'F', net: 'SIG' }] }
      ]
    };
  };
  const line = { x1: -15, y1: 0, x2: 15, y2: 0, net: 'SIG' };
  const optBase = { clearance: { traceToTrace: 0.15, traceToPad: 0.15, traceToEdge: 0.2 }, width: 0.25, grid: 0.25 };

  const one = AR.route(wallState(), padAbs, line, Object.assign({ layers: ['F.Cu'] }, optBase));
  eq(one.ok, false, '22 單層時被 F.Cu 的牆擋死，應該繞不出來');

  const two = AR.route(wallState(), padAbs, line, Object.assign({ layers: ['F.Cu', 'B.Cu'] }, optBase));
  ok(two.ok, '22 兩層時應該能換層繞過去');
  ok(two.vias.length >= 2, `22 換層必須成對下 via（得 ${two.vias.length}）`);
  const used = new Set(two.segs.map(sg => sg.layer));
  ok(used.has('F.Cu') && used.has('B.Cu'), '22 路徑應同時用到兩層');
  ok(two.segs.every(sg => sg.layer), '22 每一段都必須標明層別');

  // via 落點不可壓在障礙上（穿孔會鑽穿整疊板）
  for (const v of two.vias) {
    let clear = true;
    for (const t of wallState().traces) {
      const d = Math.hypot(v.x - t.x1, v.y - t.y1);
      if (d < (t.width / 2) + (v.od / 2)) { clear = false; break; }
    }
    ok(clear, `22 via @(${v.x.toFixed(2)},${v.y.toFixed(2)}) 不可壓在既有銅上`);
  }

  // via 成本要有作用：成本拉到極高時，寧可繞遠也不換層
  const st2 = wallState();
  st2.traces = st2.traces.filter(t => t.y1 > -10);      // 牆下方開個口，讓平面繞得過去
  const cheap = AR.route(st2, padAbs, line, Object.assign({ layers: ['F.Cu', 'B.Cu'], viaCost: 1 }, optBase));
  const dear = AR.route(st2, padAbs, line, Object.assign({ layers: ['F.Cu', 'B.Cu'], viaCost: 9999 }, optBase));
  ok(cheap.ok && dear.ok, '22 兩種 via 成本下都應繞得出來');
  eq(dear.vias.length, 0, '22 via 成本極高時應完全不換層');
  ok(cheap.vias.length > 0, '22 via 成本極低時應該樂於換層');

  // 單層呼叫（不給 layers）行為不變，且不可產生 via
  const legacy = AR.route(wallState(), padAbs,
    { x1: -15, y1: 0, x2: -5, y2: 0, net: 'SIG' }, Object.assign({ layer: 'F.Cu' }, optBase));
  ok(legacy.ok, '22 舊式單層呼叫仍應可用');
  eq(legacy.vias.length, 0, '22 單層不可產生 via');
  ok(legacy.segs.every(sg => sg.layer === 'F.Cu'), '22 單層的段別應全是 F.Cu');
}

// 22b) 禁佈區：路由器不該先產生違規再讓 DRC 去抓
{
  const AR = window.AutoRoute;
  const padAbs = (c, p) => ({ x: c.x + p.x, y: c.y + p.y });
  const mk = ko => ({
    boardWidth: 40, boardHeight: 30, traces: [], vias: [],
    components: [
      { id: 'a', ref: 'J1', x: -15, y: 0, rot: 0, pads: [{ x: 0, y: 0, w: 1, h: 1, side: 'F', net: 'SIG' }] },
      { id: 'b', ref: 'J2', x: 15, y: 0, rot: 0, pads: [{ x: 0, y: 0, w: 1, h: 1, side: 'F', net: 'SIG' }] }
    ],
    keepouts: ko
  });
  const line = { x1: -15, y1: 0, x2: 15, y2: 0, net: 'SIG' };
  const opt = { layers: ['F.Cu'], width: 0.25, clearance: { traceToTrace: 0.15, traceToPad: 0.15, traceToEdge: 0 }, grid: 0.25 };
  const poly = [[-6, -6], [6, -6], [6, 6], [-6, 6]];
  const inPoly = (x, y, pts) => {
    let v = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) v = !v;
    }
    return v;
  };
  const inside = r => {
    let n = 0;
    (r.segs || []).forEach(s => { for (let t = 0; t <= 1; t += 0.02) {
      if (inPoly(s.x1 + (s.x2 - s.x1) * t, s.y1 + (s.y2 - s.y1) * t, poly)) n++; } });
    return n;
  };

  const r = AR.route(mk([{ layer: 'F.Cu', pts: poly }]), padAbs, line, opt);
  ok(r.ok, '22b 有禁佈區時應繞得過去');
  eq(inside(r), 0, '22b 走線一個點都不可落在禁佈區內');
  ok(r.segs.length > 1, '22b 應該是繞過去而不是直線穿過');

  // 沒有禁佈區時走直線（證明上面的繞路真的是禁佈區造成的）
  const free = AR.route(mk([]), padAbs, line, opt);
  eq(free.segs.length, 1, '22b 沒有禁佈區時應走直線');

  // 禁佈區封死整條路徑 → 誠實回報繞不出來，不可硬穿
  const sealed = AR.route(mk([{ layer: 'F.Cu', pts: [[-6, -15], [6, -15], [6, 15], [-6, 15]] }]), padAbs, line, opt);
  eq(sealed.ok, false, '22b 禁佈區封死時應回報繞不出來');

  // 別層的禁佈區不該擋住這一層
  const otherLayer = AR.route(mk([{ layer: 'B.Cu', pts: poly }]), padAbs, line, opt);
  eq(otherLayer.segs.length, 1, '22b 別層的禁佈區不應擋住 F.Cu');

  // layer 未指定（'*'）代表所有層
  const allLayers = AR.route(mk([{ pts: poly }]), padAbs, line, opt);
  eq(inside(allLayers), 0, '22b 未指定層的禁佈區應擋住所有層');
}

// 23) routableLayers：訊號不該從 GND／PWR 平面穿過去
{
  const saved = app.state.layerStack;
  app.state.layerStack = app.buildLayerStack(2);
  eq(app.routableLayers().join(','), 'F.Cu,B.Cu', '23 2 層板兩面都可繞');

  app.state.layerStack = app.buildLayerStack(4);
  eq(app.routableLayers().join(','), 'F.Cu,B.Cu', '23 4 層板的 In1(GND)/In2(PWR) 不可繞訊號');

  // 把內層改成 Signal 就該納入
  app.state.layerStack = app.buildLayerStack(4);
  app.state.layerStack.find(l => l.id === 'In1.Cu').type = 'Signal';
  eq(app.routableLayers().join(','), 'F.Cu,In1.Cu,B.Cu', '23 內層改成 Signal 後應可繞');

  // Mixed 也算可繞
  app.state.layerStack = app.buildLayerStack(4);
  app.state.layerStack.find(l => l.id === 'In2.Cu').type = 'Mixed';
  eq(app.routableLayers().join(','), 'F.Cu,In2.Cu,B.Cu', '23 Mixed 層應可繞');

  // 全部都是平面時不可回空陣列（會讓 autoRoute 整個不能用）
  app.state.layerStack = app.buildLayerStack(4);
  app.state.layerStack.filter(l => l.kind === 'copper').forEach(l => { l.type = 'GND'; });
  ok(app.routableLayers().length >= 1, '23 全是平面時仍要至少回一層，不可回空');

  app.state.layerStack = saved;
}

// 24) polyArea（鞋帶公式）：EMI 迴路面積全靠它
{
  const P = (x, y) => ({ x, y });
  eq(app.polyArea([P(0, 0), P(4, 0), P(4, 3), P(0, 3)]), 12, '24 4x3 矩形面積 12');
  eq(app.polyArea([P(0, 0), P(4, 0), P(0, 3)]), 6, '24 直角三角形面積 6');
  // 反向繞行不可變成負的（面積沒有方向）
  eq(app.polyArea([P(0, 3), P(4, 3), P(4, 0), P(0, 0)]), 12, '24 反向繞行面積相同');
  eq(app.polyArea([P(0, 0), P(1, 1)]), 0, '24 少於 3 點回 0');
  eq(app.polyArea([]), 0, '24 空陣列回 0');
  // 共線三點面積 0，不可回 NaN
  eq(app.polyArea([P(0, 0), P(1, 1), P(2, 2)]), 0, '24 共線三點面積 0');
}

// 25) EMI 迴路檢查：面積分級與距離告警
{
  const savedQSA = documentStub.querySelectorAll;
  const savedRender = app.renderEmiResults;
  let got = null;
  app.renderEmiResults = issues => { got = issues; };

  const run = (roles, comps) => {
    app.state.components = comps;
    documentStub.querySelectorAll = sel => (sel === '.emi-role'
      ? Object.keys(roles).map(r => ({ dataset: { role: r }, value: roles[r] }))
      : []);
    app.runEmiCheck();
    return got;
  };
  const C = (id, x, y) => ({ id, ref: id, x, y, rot: 0, pads: [] });

  // 緊湊佈局：輸入迴路 <25mm² → green
  let comps = [C('cin', 0, 0), C('ic', 2, 0), C('d', 2, 2), C('l', 4, 2), C('cout', 4, 0)];
  let iss = run({ cin: 'cin', ic: 'ic', d: 'd' }, comps);
  ok(iss.some(i => i.sev === 'ok'), '25 緊湊輸入迴路應評為 ok');
  ok(Math.abs(app.state.emiLoops.inArea - 2) < 1e-9, `25 (0,0)(2,0)(2,2) 面積應為 2（得 ${app.state.emiLoops.inArea}）`);

  // 拉開到 >100mm² → err
  comps = [C('cin', 0, 0), C('ic', 20, 0), C('d', 20, 20)];
  iss = run({ cin: 'cin', ic: 'ic', d: 'd' }, comps);
  ok(app.state.emiLoops.inArea > 100, '25 拉開後面積應 >100mm²');
  ok(iss.some(i => i.sev === 'err'), '25 面積 >100mm² 應評為 err');
  // Cin 離 IC 20mm > 5mm 門檻
  ok(iss.length >= 2, '25 應同時回面積與距離告警');

  // 中間帶：25~100mm² → warn
  comps = [C('cin', 0, 0), C('ic', 10, 0), C('d', 10, 10)];
  iss = run({ cin: 'cin', ic: 'ic', d: 'd' }, comps);
  ok(app.state.emiLoops.inArea > 25 && app.state.emiLoops.inArea < 100, '25 面積應落在 25~100 之間');
  ok(iss.some(i => i.sev === 'warn'), '25 中間帶應評為 warn');

  // 角色不足 3 個 → 只能給 info，不可硬算面積
  iss = run({ cin: 'cin' }, [C('cin', 0, 0)]);
  ok(iss.every(i => i.sev === 'info'), '25 角色不足時只給 info');
  eq(app.state.emiLoops.inArea, 0, '25 角色不足時面積應為 0，不可亂算');

  app.renderEmiResults = savedRender;
  documentStub.querySelectorAll = savedQSA;
  app.state.components = [];
}

// 26) 熱簡估：IPC-2221 最小線寬要對得上手冊查表值
{
  const savedRender = app.renderThermalResults;
  let got = null;
  app.renderThermalResults = issues => { got = issues; };
  const run = p => { app.runThermalSimple(p); return got; };
  // 訊息裡的線寬字串抽回來（i18n 未載時 pcbT 回 key，所以直接重算比對）
  const widthOf = (I, dT, oz) => {
    const A = Math.pow(I / (0.048 * Math.pow(dT, 0.44)), 1 / 0.725);
    return (A / (oz * 1.378)) * 0.0254;
  };
  // 手冊查表：1A / ΔT10℃ / 1oz 外層 ≈ 11~12mil ≈ 0.30mm
  ok(Math.abs(widthOf(1, 10, 1) - 0.300) < 0.005, `26 1A/10℃/1oz 應約 0.30mm（得 ${widthOf(1, 10, 1).toFixed(4)}）`);
  ok(Math.abs(widthOf(2, 20, 1) - 0.513) < 0.005, `26 2A/20℃/1oz 應約 0.513mm（得 ${widthOf(2, 20, 1).toFixed(4)}）`);

  // 驗程式「實際算出來的數字」而不是原始碼字串：註解裡提到舊常數也不該讓測試變紅
  {
    const savedI18N = window.I18N;
    window.I18N = { t: (k, v) => JSON.stringify(v || {}) };
    const r = run({ oz: 1, dT: 10, Ta: 25, I: 1, P: 0.1, areaCm2: 10, vias: 20 });
    window.I18N = savedI18N;
    const w = JSON.parse(r[0].msg).w;
    ok(Math.abs(parseFloat(w) - 0.30) < 0.01,
       `26 runThermalSimple 實際回報的線寬應約 0.30mm（得 ${w}；換算寫反會變 0.47）`);
  }

  // 單調性：電流大→線寬大；容許溫升大→線寬小；銅厚→線寬小
  ok(widthOf(2, 10, 1) > widthOf(1, 10, 1), '26 電流變大線寬應變大');
  ok(widthOf(1, 20, 1) < widthOf(1, 10, 1), '26 容許溫升變大線寬應變小');
  ok(widthOf(1, 10, 2) < widthOf(1, 10, 1), '26 銅厚加倍線寬應減半左右');
  ok(Math.abs(widthOf(1, 10, 2) - widthOf(1, 10, 1) / 2) < 1e-9, '26 線寬與銅厚成反比');

  // Tj 分級：>125 err、>85 warn、其餘 ok
  const sevOf = p => { const r = run(p); return r[1].sev; };
  eq(sevOf({ oz: 1, dT: 10, Ta: 25, I: 1, P: 0.1, areaCm2: 10, vias: 20 }), 'ok', '26 低功耗大面積應 ok');
  eq(sevOf({ oz: 1, dT: 10, Ta: 25, I: 1, P: 3, areaCm2: 1, vias: 0 }), 'err', '26 3W 小面積應 err');
  // 散熱面積變大 → Tj 變低（θ 單調）
  const tj = p => { const th = Math.max(20, 80 / (1 + p.areaCm2 * 0.6 + p.vias * 0.08)); return p.Ta + p.P * th; };
  ok(tj({ Ta: 25, P: 1, areaCm2: 5, vias: 0 }) < tj({ Ta: 25, P: 1, areaCm2: 1, vias: 0 }), '26 散熱面積變大 Tj 應變低');
  ok(tj({ Ta: 25, P: 1, areaCm2: 1, vias: 30 }) < tj({ Ta: 25, P: 1, areaCm2: 1, vias: 0 }), '26 散熱 via 變多 Tj 應變低');
  // θ 有下限 20，不可因為面積灌很大就算出室溫
  ok(tj({ Ta: 25, P: 1, areaCm2: 1000, vias: 0 }) >= 45 - 1e-9, '26 θ 有下限 20，Tj 不可無限降');

  app.renderThermalResults = savedRender;
}

// 27) 大板效能：防止 DRC / 飛線退回二次方
//     這幾段原本是全比對：1000 條走線 789ms、20000 條 58 秒。
//     加了空間網格與惰性 Prim 之後是 26ms / 1.9 秒。門檻放得比實測寬很多，
//     不是在追效能數字，是在擋「有人把網格拿掉」這種回歸。
{
  const savedState = app.state;
  const savedQS = documentStub.querySelector;
  const drcBox = { innerHTML: '' };
  documentStub.querySelector = sel => (sel === '#drcResults' ? drcBox : (sel === '#pcbCanvas' ? canvasStub : null));

  const mkBoard = n => {
    let seed = 12345;
    const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    const st = {
      boardWidth: 200, boardHeight: 150, layers: 2, layerStack: app.buildLayerStack(2),
      visibleLayers: ['F.Cu', 'B.Cu'], components: [], traces: [], vias: [],
      zones: [], zoneFills: [], userZones: [], keepouts: [], texts: [], netRules: [],
      selectedSet: [], selected: null
    };
    for (let i = 0; i < n; i++) {
      const x = -95 + rnd() * 190, y = -70 + rnd() * 140;
      st.traces.push({ id: 't' + i, x1: x, y1: y, x2: x + rnd() * 8 - 4, y2: y + rnd() * 8 - 4,
        width: 0.25, layer: 'F.Cu', net: 'N' + (i % 50) });
    }
    return st;
  };

  app.state = mkBoard(1000);
  let t0 = Date.now();
  app.runDrc();
  const ms1k = Date.now() - t0;
  ok(ms1k < 400, `27 1000 條走線的 runDrc 應在 400ms 內（實測 ${ms1k}ms；二次方版本是 789ms）`);

  app.state = mkBoard(4000);
  t0 = Date.now();
  app.runDrc();
  const ms4k = Date.now() - t0;
  ok(ms4k < 3000, `27 4000 條走線的 runDrc 應在 3s 內（實測 ${ms4k}ms）`);

  // 成長率：四倍資料量不該變成十六倍時間。門檻取 8 倍，留給常數項與雜訊。
  const ratio = ms4k / Math.max(1, ms1k);
  ok(ratio < 8, `27 資料量 ×4 時耗時不該 ×8 以上（實測 ×${ratio.toFixed(1)}；二次方會是 ×16 起跳）`);

  // 飛線本身也要守住
  app.state = mkBoard(4000);
  t0 = Date.now();
  const rl = window.Ratsnest.compute(app.state, app.padAbs.bind(app));
  const msR = Date.now() - t0;
  ok(msR < 3000, `27 4000 條走線的飛線計算應在 3s 內（實測 ${msR}ms）`);
  ok(rl.length >= 0, '27 飛線應回傳結果');

  app.state = savedState;
  documentStub.querySelector = savedQS;
}

// 28) RouteAll：順序、拆線、以及「拆線只准變好」
{
  const RA = window.RouteAll;
  ok(!!RA, '28 RouteAll 應載入');
  const padAbs = (c, p) => ({ x: c.x + p.x, y: c.y + p.y });
  const rules = app.loadDrcRules();
  const baseOpt = {
    layers: ['F.Cu'], width: 0.25, clearance: rules.clearance,
    viaOd: 0.7, viaDrill: 0.3, grid: 0.2
  };

  // 刻意造壅塞：一道牆只留一個容得下一條線的窄口。
  // A 短、會先繞而佔掉窄口；B 只有窄口可走。不拆 → B 失敗；拆 → 兩條都成。
  const congested = () => {
    const st = {
      boardWidth: 60, boardHeight: 40, traces: [], vias: [], keepouts: [], components: []
    };
    const wall = { id: 'w', ref: 'W1', x: 0, y: 0, rot: 0, pads: [] };
    for (let y = -19; y <= 19; y += 0.8) {
      if (Math.abs(y) < 0.9) continue;
      wall.pads.push({ num: 'w', x: 0, y, w: 0.8, h: 0.8, side: 'F', net: 'WALL', cu: true });
    }
    st.components.push(wall);
    const pin = (id, x, net) => ({ id, ref: id, x, y: 0, rot: 0,
      pads: [{ num: '1', x: 0, y: 0, w: 1, h: 1, side: 'F', net, cu: true }] });
    st.components.push(pin('a1', -4, 'A'), pin('a2', 4, 'A'), pin('b1', -25, 'B'), pin('b2', 25, 'B'));
    return st;
  };
  const linesOf = st => window.Ratsnest.compute(st, padAbs);

  const st1 = congested();
  const noRip = RA.run(st1, padAbs, linesOf(st1), Object.assign({ ripup: false }, baseOpt));
  const st2 = congested();
  const withRip = RA.run(st2, padAbs, linesOf(st2), Object.assign({ ripup: true, passes: 3 }, baseOpt));

  ok(withRip.routed.length >= noRip.routed.length,
     `28 拆線只准變好或持平（不拆 ${noRip.routed.length}、拆 ${withRip.routed.length}）`);
  ok(withRip.routed.length > noRip.routed.length,
     `28 這個壅塞情境拆線應該要多救回至少一條（${noRip.routed.length} → ${withRip.routed.length}）`);
  ok(withRip.ripped > 0, '28 應該真的有拆到東西');

  // 空輸入
  eq(RA.run(congested(), padAbs, [], baseOpt).routed.length, 0, '28 沒有飛線時回空');

  // 決定性：同樣的輸入跑兩次結果要一樣（順序排序有做對）
  const a = RA.run(congested(), padAbs, linesOf(congested()), Object.assign({ ripup: true, passes: 3 }, baseOpt));
  const b = RA.run(congested(), padAbs, linesOf(congested()), Object.assign({ ripup: true, passes: 3 }, baseOpt));
  eq(a.routed.length, b.routed.length, '28 同輸入兩次的成功數應相同');
  eq(JSON.stringify(a.routed.map(x => x.line.net)), JSON.stringify(b.routed.map(x => x.line.net)),
     '28 同輸入兩次繞成的 net 順序應相同');

  // 短的先繞：把順序關掉不可讓結果變好（只是驗排序有生效、不會亂）
  const noOrder = RA.run(congested(), padAbs, linesOf(congested()),
    Object.assign({ ripup: false, order: 'none' }, baseOpt));
  ok(noOrder.routed.length <= withRip.routed.length, '28 關掉排序不該比開著還好');

  // **拆線只准變好**。第一版寫成「拆了就繼續」，拆線連鎖把已經繞好的一起帶走，
  // 20 顆元件的板從 95% 掉到 10%。單一情境測不出這件事——要嘛第一階段全過（第二階段
  // 根本不跑），要嘛拆線剛好都有賺。所以改成性質測試：一組不同密度／不同擺位的板，
  // 每一片都必須滿足「拆 >= 不拆」。只要有任何一片走進破壞路徑，這裡就會紅。
  {
    const mkBoard = (n, span, seedInit) => {
      let seed = seedInit;
      const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
      const st = { boardWidth: 60, boardHeight: 60, traces: [], vias: [], keepouts: [], components: [] };
      const cols = Math.max(2, Math.round(Math.sqrt(n)));
      for (let i = 0; i < n; i++) {
        const b = window.PartsLib.build('res', '0603');
        const pads = b.pads.map(q => Object.assign({}, q));
        pads[0].net = 'N' + i;
        pads[1].net = 'N' + ((i + 1) % n);          // 串成環：拆一條就牽動鄰居
        st.components.push({
          id: 'c' + i, ref: 'R' + (i + 1),
          x: -span / 2 + (i % cols) * (span / cols) + rnd() * 0.6,
          y: -span / 2 + Math.floor(i / cols) * (span / cols) + rnd() * 0.6,
          rot: (rnd() < 0.5 ? 0 : 90), w: b.body.w, h: b.body.h, pads
        });
      }
      return st;
    };
    // 後面幾片刻意排得很密（間距 2～3mm），第一階段一定會有繞不過的，
    // 第二階段（拆線）才真的被走到。密度不夠的話這個測試等於沒測。
    const cases = [[12, 14, 7], [20, 20, 13], [30, 26, 19],
                   [24, 9, 31], [30, 10, 37], [40, 12, 41]];
    let worse = 0, exercised = 0, checked = 0;
    for (const [n, span, sd] of cases) {
      const a = mkBoard(n, span, sd), b = mkBoard(n, span, sd);
      const plain = RA.run(a, padAbs, window.Ratsnest.compute(a, padAbs),
        Object.assign({ ripup: false }, baseOpt));
      const rip = RA.run(b, padAbs, window.Ratsnest.compute(b, padAbs),
        Object.assign({ ripup: true, passes: 3 }, baseOpt));
      checked++;
      if (plain.failed.length) exercised++;          // 第一階段有失敗＝第二階段真的跑了
      if (rip.routed.length < plain.routed.length) worse++;
    }
    eq(worse, 0, '28 任何一片板都不可因為拆線而變差（這是回滾守衛在守的事）');
    ok(checked === cases.length, '28 每一片都要跑到');
    ok(exercised > 0, `28 至少要有一片板的第一階段會失敗，第二階段才真的被走到（得 ${exercised}/${checked}）`);
  }

  // 失敗原因與線寬提示要有內容
  const tight = {
    boardWidth: 30, boardHeight: 20, traces: [], vias: [], keepouts: [],
    components: [{
      id: 'u', ref: 'U1', x: 0, y: 0, rot: 0, pads: [
        // 目標腳被上下兩顆異網 pad 夾住，0.25mm 線寬出不來
        { num: '1', x: 0, y: 0, w: 0.4, h: 0.4, side: 'F', net: 'SIG', cu: true },
        { num: '2', x: 0, y: 0.55, w: 0.4, h: 0.4, side: 'F', net: 'X', cu: true },
        { num: '3', x: 0, y: -0.55, w: 0.4, h: 0.4, side: 'F', net: 'Y', cu: true },
        { num: '4', x: 0.55, y: 0, w: 0.4, h: 0.4, side: 'F', net: 'Z', cu: true },
        { num: '5', x: -0.55, y: 0, w: 0.4, h: 0.4, side: 'F', net: 'W', cu: true }
      ]
    }, {
      id: 'j', ref: 'J1', x: 10, y: 0, rot: 0,
      pads: [{ num: '1', x: 0, y: 0, w: 1, h: 1, side: 'F', net: 'SIG', cu: true }]
    }]
  };
  const rt = RA.run(tight, padAbs, window.Ratsnest.compute(tight, padAbs), Object.assign({ ripup: false }, baseOpt));
  ok(rt.failed.length > 0, '28 被夾住的腳位應該繞不出來');
  ok(rt.reasons.rule_ep_blocked > 0, '28 失敗原因應為「起點被封住」');
  ok(rt.widthHint != null && rt.widthHint >= 0,
     `28 應給得出線寬提示（得 ${rt.widthHint}）`);
  ok(rt.widthHint < 0.25, `28 提示的線寬應小於目前用的 0.25（得 ${rt.widthHint}）`);
}

// 29) 等長調諧跨段：舊版只挑最長那一段，塞不下就整個放棄
{
  const savedState = app.state;
  const savedGet = documentStub.getElementById;
  const stub = (netV, targetV) => {
    const els = { tuneNet: { value: netV }, tuneTarget: { value: String(targetV) }, tuneMsg: { textContent: '' } };
    documentStub.getElementById = id => (Object.prototype.hasOwnProperty.call(els, id) ? els[id] : null);
  };
  const setTraces = arr => {
    app.state = Object.assign({}, savedState, { traces: arr, vias: [], ratsnest: null });
  };
  const len = () => window.NetRules.netLength(app.state.traces, 'CLK');

  // 單段就夠：行為與舊版一致
  setTraces([{ id: 'a', x1: -20, y1: 0, x2: 20, y2: 0, width: 0.3, layer: 'F.Cu', net: 'CLK' }]);
  stub('CLK', 45);
  app.meanderTune();
  ok(Math.abs(len() - 45) < 0.05, `29 單段：長度應命中 45（得 ${len().toFixed(3)}）`);

  // **跨段**：三小段，任何一段都吃不下全部補償量，加起來才夠。
  // 每段 6mm、線寬 0.3 → s=1.2、kMax=floor(5/1.2)=4 → 單段容量 2×4×3=24mm。
  // 要補 30mm：舊版挑最長那段（6mm，容量 24）塞不下就放棄，新版要攤到多段。
  setTraces([
    { id: 'a', x1: -9, y1: 0, x2: -3, y2: 0, width: 0.3, layer: 'F.Cu', net: 'CLK' },
    { id: 'b', x1: -3, y1: 0, x2: 3, y2: 0, width: 0.3, layer: 'F.Cu', net: 'CLK' },
    { id: 'c', x1: 3, y1: 0, x2: 9, y2: 0, width: 0.3, layer: 'F.Cu', net: 'CLK' }
  ]);
  const before = len();
  eq(Math.round(before * 100) / 100, 18, '29 起始長度 18mm');
  stub('CLK', before + 30);
  app.meanderTune();
  const after = len();
  ok(Math.abs(after - (before + 30)) < 0.05,
     `29 跨段：三段合力應補到 ${(before + 30).toFixed(2)}（得 ${after.toFixed(3)}）`);
  ok(app.state.traces.length > 3, '29 蛇形後段數應變多');
  ok(app.state.traces.every(t => t.net === 'CLK' && t.width === 0.3), '29 蛇形段應保留 net 與線寬');
  // 端點不可跑掉
  const xs = app.state.traces.reduce((a, t) => a.concat([t.x1, t.x2]), []);
  ok(Math.min.apply(null, xs) <= -9 + 1e-6 && Math.max.apply(null, xs) >= 9 - 1e-6, '29 兩端仍接回原位');

  // 容量算式本身
  const cap = app.meanderCapacity({ x1: 0, y1: 0, x2: 6, y2: 0, width: 0.3 }, 3.0);
  eq(cap.kMax, 4, '29 6mm 段、s=1.2、兩端留 1mm → 4 個彎');
  ok(Math.abs(cap.cap - 24) < 1e-9, '29 容量 = 2 × 4 × 3.0 = 24mm');
  eq(app.meanderCapacity({ x1: 0, y1: 0, x2: 1, y2: 0, width: 0.3 }, 3.0).cap, 0, '29 太短的段容量為 0');

  // 全部段加起來都不夠 → 要講出「差多少、只塞得下多少」，不是丟一句失敗
  setTraces([{ id: 'a', x1: 0, y1: 0, x2: 3, y2: 0, width: 0.3, layer: 'F.Cu', net: 'CLK' }]);
  const shortBefore = len();
  stub('CLK', shortBefore + 500);
  const msgs = [];
  const savedToast = app.toast;
  app.toast = m => msgs.push(String(m));
  app.meanderTune();
  app.toast = savedToast;
  ok(Math.abs(len() - shortBefore) < 1e-9, '29 補不夠時不可改動走線');
  ok(msgs.length > 0, '29 補不夠時要有訊息');

  app.state = savedState;
  documentStub.getElementById = savedGet;
}

// 30) 頂列「新建」：清版面、可 Ctrl+Z 救回、順手清掉自動存檔
// 這三顆頂列按鈕（新建/儲存/匯出）在 2026-08-26 之前完全沒接處理器，點了沒反應。
// 接上之後這裡守著行為；「按鈕有沒有接上」則由 dead-button-check.js 守著。
if (window.PcbHistory && typeof app.newBoard === 'function') {
  const savedState = app.state;
  const savedConfirm = global.window.confirm;
  const LS = 'hardwareai-pcb-autosave';

  app.state = JSON.parse(JSON.stringify(savedState));
  app.state.components = [];
  app.state.traces = [];
  app._pristine = JSON.stringify(app.state);            // init() 拍的原始狀態

  app.state.components = [{ id: 'c1', ref: 'R1', x: 5, y: 5, pads: [] }];
  app.state.traces = [{ id: 't1', x1: 0, y1: 0, x2: 4, y2: 0, width: 0.3, layer: 'F.Cu', net: 'N1' }];
  localStorage.setItem(LS, JSON.stringify({ v: 1, t: Date.now(), data: '{}' }));

  // 使用者按「取消」→ 什麼都不能動
  global.window.confirm = () => false;
  eq(app.newBoard(), false, '30 取消時 newBoard 回 false');
  eq(app.state.components.length, 1, '30 取消時元件不可被清掉');
  ok(localStorage.getItem(LS) !== null, '30 取消時自動存檔不可被清掉');

  // 使用者按「確定」→ 清空、且自動存檔一起清掉
  global.window.confirm = () => true;
  eq(app.newBoard(), true, '30 確認後 newBoard 回 true');
  eq(app.state.components.length, 0, '30 新建後元件清空');
  eq(app.state.traces.length, 0, '30 新建後走線清空');
  eq(localStorage.getItem(LS), null, '30 新建要清掉自動存檔（不清會在重整後復活）');

  // Ctrl+Z 救得回來
  ok(window.PcbHistory.undo(app), '30 新建後 undo 應成功');
  eq(app.state.components.length, 1, '30 undo 後元件回來');
  eq(app.state.traces.length, 1, '30 undo 後走線回來');

  // 沒拍過原始狀態就不准動（init 沒跑完的情況）
  const noPristine = app._pristine;
  app._pristine = null;
  eq(app.newBoard(), false, '30 沒有原始狀態快照時不可清版面');
  eq(app.state.components.length, 1, '30 沒有快照時元件必須留著');
  app._pristine = noPristine;

  global.window.confirm = savedConfirm;
  app.state = savedState;
}


// 31) 差分對自動繞線：中心線繞一次再展開，兩條要真的平行、等長、各自接回自己的 pad
// 舊版 autoRoute 完全不認差分對（pcb-rules.js 200 行以後沒有任何 pair 邏輯），
// 兩條各繞各的：耦合度與長度差都不受控。
{
  const AR = window.AutoRoute;
  ok(!!(AR && AR.routePair), '31 AutoRoute.routePair 應存在');
  const padAbs = (c, p2) => ({ x: c.x + p2.x, y: c.y + p2.y });
  const rules = app.loadDrcRules();
  const W = 0.25, GAP = 0.3;
  const conn = (id, x) => ({ id, ref: id, x, y: 0, rot: 0, pads: [
    { num: '1', x: 0, y: -0.5, w: 0.6, h: 0.6, side: 'F', net: 'USB_P', cu: true },
    { num: '2', x: 0, y: 0.5, w: 0.6, h: 0.6, side: 'F', net: 'USB_N', cu: true }] });
  const mk = () => ({ boardWidth: 60, boardHeight: 40, traces: [], vias: [], keepouts: [],
    components: [conn('j1', -20), conn('u1', 20)] });
  const opt = { layers: ['F.Cu'], layer: 'F.Cu', width: W, clearance: rules.clearance,
    viaOd: 0.7, viaDrill: 0.3, grid: 0.25, pairGap: GAP };
  const lp = { x1: -20, y1: -0.5, x2: 20, y2: -0.5, net: 'USB_P' };
  const ln = { x1: -20, y1: 0.5, x2: 20, y2: 0.5, net: 'USB_N' };
  const near = (x, y, X, Y) => Math.hypot(x - X, y - Y) < 1e-6;
  const ptSeg = (px, py, x1, y1, x2, y2) => {
    const dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy;
    let t = l2 ? ((px - x1) * dx + (py - y1) * dy) / l2 : 0;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + dx * t), py - (y1 + dy * t));
  };
  // 沿 A 逐點取樣量到 B 的邊到邊距離，算耦合佔比（做法與 NetRules 的差分對檢查一致）
  const coupling = res => {
    const tol = Math.max(0.05, GAP * 0.25);
    let total = 0, coupled = 0, tooClose = 0;
    for (const sg of res.a.segs) {
      const len = Math.hypot(sg.x2 - sg.x1, sg.y2 - sg.y1);
      const n = Math.max(2, Math.ceil(len / 0.5));
      for (let i = 0; i < n; i++) {
        const f = (i + 0.5) / n;
        const px = sg.x1 + (sg.x2 - sg.x1) * f, py = sg.y1 + (sg.y2 - sg.y1) * f;
        let best = Infinity;
        for (const sb of res.b.segs) best = Math.min(best, ptSeg(px, py, sb.x1, sb.y1, sb.x2, sb.y2));
        const gap = best - W;
        total += len / n;
        if (Math.abs(gap - GAP) <= tol) coupled += len / n;
        if (gap < GAP - tol) tooClose += len / n;
      }
    }
    return { ratio: total ? coupled / total : 0, tooClose };
  };

  const r = AR.routePair(mk(), padAbs, lp, ln, opt);
  ok(r.ok, '31 淨空板上差分對要繞得過');
  if (r.ok) {
    const aFirst = r.a.segs[0], aLast = r.a.segs[r.a.segs.length - 1];
    const bFirst = r.b.segs[0], bLast = r.b.segs[r.b.segs.length - 1];
    ok(near(aFirst.x1, aFirst.y1, lp.x1, lp.y1) && near(aLast.x2, aLast.y2, lp.x2, lp.y2), '31 P 兩端要接在自己的 pad 上');
    ok(near(bFirst.x1, bFirst.y1, ln.x1, ln.y1) && near(bLast.x2, bLast.y2, ln.x2, ln.y2), '31 N 兩端要接在自己的 pad 上');
    const c = coupling(r);
    ok(c.ratio >= 0.8, '31 耦合長度佔比要 >= 80%（實際 ' + (100 * c.ratio).toFixed(1) + '%）');
    ok(c.tooClose === 0, '31 不可有任何一段比目標間距還近（實際 ' + c.tooClose.toFixed(2) + 'mm）');
    ok(r.skew <= 0.5, '31 兩條長度差要 <= 0.5mm（實際 ' + r.skew.toFixed(3) + 'mm）');
    eq(r.gap, GAP, '31 回報的間距要是要求的那個');
  }

  // 飛線方向相反：照原方向配對會接成交叉的 X，耦合度會爛掉
  const rev = AR.routePair(mk(), padAbs, lp, { x1: ln.x2, y1: ln.y2, x2: ln.x1, y2: ln.y1, net: 'USB_N' }, opt);
  ok(rev.ok, '31 反向飛線也要繞得過');
  if (rev.ok) {
    const c2 = coupling(rev);
    ok(c2.ratio >= 0.8, '31 反向時耦合佔比仍要 >= 80%（實際 ' + (100 * c2.ratio).toFixed(1) + '%）');
    const bF = rev.b.segs[0], bL = rev.b.segs[rev.b.segs.length - 1];
    ok((near(bF.x1, bF.y1, ln.x1, ln.y1) && near(bL.x2, bL.y2, ln.x2, ln.y2))
       || (near(bF.x1, bF.y1, ln.x2, ln.y2) && near(bL.x2, bL.y2, ln.x1, ln.y1)),
       '31 反向時兩端仍要各自接回自己的 pad');
  }

  // 拒絕不合理輸入，而不是繞出爛東西
  eq(AR.routePair(mk(), padAbs, lp, ln, Object.assign({}, opt, { pairGap: 0 })).ok, false, '31 沒給間距不可繞');
  eq(AR.routePair(mk(), padAbs, lp, lp, opt).ok, false, '31 同一個 net 不算差分對');

  // 單條繞線的行為不可被 nets 改動（回歸）
  const single = AR.route(mk(), padAbs, lp, opt);
  ok(single.ok, '31 單條繞線仍要正常（沒被 line.nets 改壞）');
}

// 32) autoRoute 的差分對整合：成對的先繞，非成對的原樣交給 RouteAll
{
  const savedState = app.state;
  const pads = (net1, net2) => [
    { num: '1', x: 0, y: -0.5, w: 0.6, h: 0.6, side: 'F', net: net1, cu: true },
    { num: '2', x: 0, y: 0.5, w: 0.6, h: 0.6, side: 'F', net: net2, cu: true }];
  app.state = Object.assign({}, savedState, {
    boardWidth: 60, boardHeight: 40, traces: [], vias: [], keepouts: [], userZones: [],
    components: [
      { id: 'j1', ref: 'J1', x: -20, y: 0, rot: 0, pads: pads('USB_P', 'USB_N') },
      { id: 'u1', ref: 'U1', x: 20, y: 0, rot: 0, pads: pads('USB_P', 'USB_N') },
      { id: 'r1', ref: 'R1', x: -20, y: 10, rot: 0, pads: [{ num: '1', x: 0, y: 0, w: 0.6, h: 0.6, side: 'F', net: 'SDA', cu: true }] },
      { id: 'r2', ref: 'R2', x: 20, y: 10, rot: 0, pads: [{ num: '1', x: 0, y: 0, w: 0.6, h: 0.6, side: 'F', net: 'SDA', cu: true }] }
    ]
  });
  const opts = { layers: ['F.Cu'], layer: 'F.Cu', width: 0.25, clearance: app.loadDrcRules().clearance,
    viaOd: 0.7, viaDrill: 0.3, grid: 0.25 };
  const lines = window.Ratsnest.compute(app.state, app.padAbs.bind(app));
  eq(lines.length, 3, '32 三條飛線（USB_P、USB_N、SDA）');
  const dp = app.autoRoutePairs(lines, opts);
  eq(dp.pairs, 1, '32 應該認出一對差分對');
  eq(dp.failed, 0, '32 淨空板上不該有繞不過的對');
  eq(dp.rest.length, 1, '32 非成對的 SDA 要留給 RouteAll');
  eq(dp.rest[0].net, 'SDA', '32 留下來的要是 SDA');
  ok(app.state.traces.some(t => t.net === 'USB_P'), '32 P 的走線要寫進版面');
  ok(app.state.traces.some(t => t.net === 'USB_N'), '32 N 的走線要寫進版面');
  ok(!app.state.traces.some(t => t.net === 'SDA'), '32 這一步不可順手把 SDA 繞掉');
  ok(dp.skew <= 0.5, '32 回報的長度差要在 0.5mm 內（實際 ' + dp.skew.toFixed(3) + 'mm）');
  // 沒有配對網名的板子：一對都不該認出來，飛線原樣交回
  app.state.traces = [];
  const solo = app.autoRoutePairs(
    [{ x1: -20, y1: 10, x2: 20, y2: 10, net: 'SDA' }], opts);
  eq(solo.pairs, 0, '32 沒有配對網名時不可硬湊成對');
  eq(solo.rest.length, 1, '32 沒配對時飛線原樣交回');
  app.state = savedState;
}

// 33) 機構孔（NPTH）要擋得住自動繞線
// 舊版 route() 看到 cu:false 就整個略過，於是走線與 via 會大方地穿過 M3 安裝孔。
// 畫面上完全正常，做出來那條線被鑽頭吃掉。
{
  const AR = window.AutoRoute;
  const padAbs2 = (c, p2) => ({ x: c.x + p2.x, y: c.y + p2.y });
  const rules33 = app.loadDrcRules();
  // 一道牆只留一個 6mm 的口，口的正中央放一個 3.2mm 的安裝孔。
  // 繞得過去就必須繞過孔；穿過去＝沒看見孔。
  const mk = (withHole) => {
    const st = { boardWidth: 40, boardHeight: 30, traces: [], vias: [], keepouts: [], components: [] };
    const wall = { id: 'w', ref: 'W1', x: 0, y: 0, rot: 0, pads: [] };
    for (let y = -14; y <= 14; y += 0.8) {
      if (Math.abs(y) < 3) continue;
      wall.pads.push({ num: 'w' + y, x: 0, y, w: 0.8, h: 0.8, side: 'F', net: 'WALL', cu: true });
    }
    st.components.push(wall);
    if (withHole) st.components.push({ id: 'mh', ref: 'MH1', x: 0, y: 0, rot: 0,
      pads: [{ num: '1', x: 0, y: 0, w: 3.2, h: 3.2, shape: 'circle', drill: 3.2, type: 'np_thru_hole', side: '*', cu: false }] });
    const pin = (id, x) => ({ id, ref: id, x, y: 0, rot: 0,
      pads: [{ num: '1', x: 0, y: 0, w: 1, h: 1, side: 'F', net: 'A', cu: true }] });
    st.components.push(pin('a1', -12), pin('a2', 12));
    return st;
  };
  const opt33 = { layers: ['F.Cu'], layer: 'F.Cu', width: 0.25, clearance: rules33.clearance,
    viaOd: 0.7, viaDrill: 0.3, grid: 0.2 };
  const line33 = { x1: -12, y1: 0, x2: 12, y2: 0, net: 'A' };

  const open = AR.route(mk(false), padAbs2, line33, opt33);
  ok(open.ok, '33 沒有安裝孔時這個缺口繞得過（對照組）');

  const holed = AR.route(mk(true), padAbs2, line33, opt33);
  if (holed.ok) {
    // 繞得過去也可以，但不准從孔裡穿過去
    const holeR = 1.6, need = holeR + rules33.clearance.traceToPad + 0.125;
    const ptSeg = (px, py, x1, y1, x2, y2) => {
      const dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy;
      let t = l2 ? ((px - x1) * dx + (py - y1) * dy) / l2 : 0;
      t = Math.max(0, Math.min(1, t));
      return Math.hypot(px - (x1 + dx * t), py - (y1 + dy * t));
    };
    let closest = Infinity;
    holed.segs.forEach(s => { closest = Math.min(closest, ptSeg(0, 0, s.x1, s.y1, s.x2, s.y2)); });
    ok(closest >= holeR - 1e-6, '33 走線不可穿過安裝孔（最近 ' + closest.toFixed(2) + 'mm、孔半徑 ' + holeR + 'mm）');
  } else {
    ok(true, '33 孔把唯一的缺口塞住時，繞不過去也是正確答案');
  }
}

// 34) 逃逸繞線：pad 中心被鄰居的淨空蓋住時，要能從 pad 邊緣出來
// 舊版只把 pad 正中央那一格當起點，被蓋住就直接回 rule_ep_blocked。
// 公版實測 25 條裡有 7 條卡在這裡，而實務上從 pad 邊緣出線是標準做法。
{
  const AR = window.AutoRoute;
  const padAbs34 = (c, p2) => ({ x: c.x + p2.x, y: c.y + p2.y });
  const rules34 = app.loadDrcRules();
  // A 是 2×2 的大 pad；正上方 1.6mm 處放一顆異網 pad，它的淨空正好蓋住 A 的中心，
  // 但蓋不到 A 的下緣。中心被蓋住 → 舊版失敗；下緣還空著 → 新版該繞得出來。
  const st34 = {
    boardWidth: 40, boardHeight: 30, traces: [], vias: [], keepouts: [],
    components: [
      { id: 'a1', ref: 'A1', x: -10, y: 0, rot: 0, pads: [{ num: '1', x: 0, y: 0, w: 2, h: 2, side: 'F', net: 'NET1', cu: true }] },
      { id: 'b1', ref: 'B1', x: -10, y: -1.6, rot: 0, pads: [{ num: '1', x: 0, y: 0, w: 2, h: 2, side: 'F', net: 'OTHER', cu: true }] },
      { id: 'a2', ref: 'A2', x: 10, y: 0, rot: 0, pads: [{ num: '1', x: 0, y: 0, w: 2, h: 2, side: 'F', net: 'NET1', cu: true }] }
    ]
  };
  const opt34 = { layers: ['F.Cu'], layer: 'F.Cu', width: 0.25, clearance: rules34.clearance,
    viaOd: 0.7, viaDrill: 0.3, grid: 0.1 };
  const r34 = AR.route(st34, padAbs34, { x1: -10, y1: 0, x2: 10, y2: 0, net: 'NET1' }, opt34);
  ok(r34.ok, '34 pad 中心被蓋住時仍要從 pad 邊緣繞出來' + (r34.ok ? '' : '（' + JSON.stringify(r34.reason) + '）'));
  if (r34.ok) {
    // 起點必須仍在 A1 的銅箔內（不是憑空從旁邊開始）
    const s = r34.segs[0];
    ok(Math.abs(s.x1 - (-10)) <= 1 && Math.abs(s.y1) <= 1,
       '34 起點要落在 A1 的 pad 銅箔內（實際 ' + s.x1.toFixed(2) + ',' + s.y1.toFixed(2) + '）');
    const e = r34.segs[r34.segs.length - 1];
    ok(Math.abs(e.x2 - 10) <= 1 && Math.abs(e.y2) <= 1,
       '34 終點要落在 A2 的 pad 銅箔內（實際 ' + e.x2.toFixed(2) + ',' + e.y2.toFixed(2) + '）');
  }

  // 真的被封死時仍要誠實回報，不可假裝繞得過
  const boxed = JSON.parse(JSON.stringify(st34));
  [[0, 2.2], [0, -2.2], [2.2, 0], [-2.2, 0]].forEach((d, i) => boxed.components.push({
    id: 'w' + i, ref: 'W' + i, x: -10 + d[0], y: d[1], rot: 0,
    pads: [{ num: '1', x: 0, y: 0, w: 2, h: 2, side: 'F', net: 'WALL', cu: true }]
  }));
  const r34b = AR.route(boxed, padAbs34, { x1: -10, y1: 0, x2: 10, y2: 0, net: 'NET1' }, opt34);
  eq(r34b.ok, false, '34 四面被異網 pad 圍死時要照實回報失敗');
}

// 35) 繞線時的即時淨空：pad / via / 板邊 / 禁佈區都要算，不是只比走線
// 舊版只比「同層異網走線」，所以畫過一整排 pad 也一聲不吭，等按下去才被 DRC 罵。
// 測試環境沒有載 I18N，pcbT 直接回 key，所以這裡比對的是 key 本身。
{
  const savedState = app.state;
  const mk = extra => Object.assign({
    boardWidth: 40, boardHeight: 30, layers: 2, layerStack: app.buildLayerStack(2),
    visibleLayers: ['F.Cu', 'B.Cu'], components: [], traces: [], vias: [], keepouts: [],
    userZones: [], texts: [], netRules: [], selectedSet: [], selected: null,
    traceLayer: 'F.Cu', traceWidth: 0.3
  }, extra || {});

  // pad：距離要算得出來，而且要指名是哪一顆
  app.state = mk({ components: [{ id: 'r1', ref: 'R1', x: 0, y: 1, rot: 0,
    pads: [{ num: '2', x: 0, y: 0, w: 1, h: 1, side: 'F', net: 'VCC', cu: true }] }] });
  const nearPad = app.previewClearance({ x1: -5, y1: 0, x2: 5, y2: 0, net: 'SDA' });
  ok(!!nearPad, '35 應該回報最近的物件');
  if (nearPad) {
    eq(nearPad.what, 'R1.2', '35 要指名是哪一顆 pad');
    // pad 下緣在 y=0.5，走線半寬 0.15 → 淨距 0.35
    ok(Math.abs(nearPad.d - 0.35) < 1e-6, '35 pad 淨距要算對（實際 ' + nearPad.d.toFixed(3) + '）');
  }

  // 同 net 的 pad 不算違規（本來就要接上去）
  const sameNet = app.previewClearance({ x1: -5, y1: 0, x2: 5, y2: 0, net: 'VCC' });
  ok(!sameNet || sameNet.what !== 'R1.2', '35 同 net 的 pad 不該被當成障礙');

  // via
  app.state = mk({ vias: [{ x: 0, y: 0.8, od: 0.7, drill: 0.3, net: 'GND' }] });
  const nearVia = app.previewClearance({ x1: -5, y1: 0, x2: 5, y2: 0, net: 'SDA' });
  ok(nearVia && Math.abs(nearVia.d - (0.8 - 0.35 - 0.15)) < 1e-6,
     '35 via 淨距要算對（實際 ' + (nearVia ? nearVia.d.toFixed(3) : 'null') + '）');

  // 板邊：40×30 的板，y=14.8 那條線離上緣 0.2，扣半寬剩 0.05
  app.state = mk({});
  const nearEdge = app.previewClearance({ x1: -5, y1: 14.8, x2: 5, y2: 14.8, net: 'SDA' });
  ok(nearEdge && nearEdge.what === 'pj_obj_edge', '35 靠板邊時要回報板邊');
  ok(nearEdge && Math.abs(nearEdge.d - 0.05) < 1e-6,
     '35 板邊淨距要算對（實際 ' + (nearEdge ? nearEdge.d.toFixed(3) : 'null') + '）');

  // 禁佈區：穿過去就是負值
  app.state = mk({ keepouts: [{ layer: 'F.Cu', pts: [[-2, -2], [2, -2], [2, 2], [-2, 2]] }] });
  const inKeep = app.previewClearance({ x1: -5, y1: 0, x2: 5, y2: 0, net: 'SDA' });
  ok(inKeep && inKeep.d < 0, '35 走線穿過禁佈區要回報負淨距');

  // 空板：沒有東西可比也不可以爆
  app.state = mk({ boardWidth: 400, boardHeight: 400 });
  const empty = app.previewClearance({ x1: -5, y1: 0, x2: 5, y2: 0, net: 'SDA' });
  ok(empty && empty.what === 'pj_obj_edge', '35 空板時最近的東西就是板邊');

  app.state = savedState;
}

// 36) 橡皮筋：拖元件時走線端點要跟著 pad 走
// 舊版拖動元件時走線原地不動——畫面上還連著、電性上已經斷了，而且 DRC 不會報
// （斷開的走線沒有違反任何間距規則）。
{
  const savedState = app.state;
  const mkBoard = () => {
    const c1 = { id: 'r1', ref: 'R1', x: 0, y: 0, rot: 0, pads: [
      { num: '1', x: -1, y: 0, w: 1, h: 1, side: 'F', net: 'N1', cu: true },
      { num: '2', x: 1, y: 0, w: 1, h: 1, side: 'F', net: 'N2', cu: true }] };
    const c2 = { id: 'r2', ref: 'R2', x: 10, y: 0, rot: 0, pads: [
      { num: '1', x: 0, y: 0, w: 1, h: 1, side: 'F', net: 'N2', cu: true }] };
    return Object.assign({}, savedState, {
      boardWidth: 60, boardHeight: 40, layers: 2, layerStack: app.buildLayerStack(2),
      components: [c1, c2], vias: [], keepouts: [], userZones: [], selectedSet: [], selected: null,
      traces: [
        { id: 't1', x1: 1, y1: 0, x2: 10, y2: 0, width: 0.3, layer: 'F.Cu', net: 'N2' },
        { id: 't2', x1: -1, y1: 0, x2: -8, y2: 0, width: 0.3, layer: 'F.Cu', net: 'N1' },
        { id: 't3', x1: 4, y1: 6, x2: 8, y2: 6, width: 0.3, layer: 'F.Cu', net: 'N9' }
      ]
    });
  };

  app.state = mkBoard();
  const r1 = app.state.components[0];
  const n = app.beginRubber([r1]);
  eq(n, 2, '36 R1 的兩支腳各接一條走線');
  ok(!app.state.rubber.some(x => x.t.id === 't3'), '36 沒有接在 pad 上的走線不可被抓進來');

  r1.x = 5; r1.y = 3;
  app.updateRubber();
  const t1 = app.state.traces.find(t => t.id === 't1');
  const t2 = app.state.traces.find(t => t.id === 't2');
  const t3 = app.state.traces.find(t => t.id === 't3');
  ok(Math.abs(t1.x1 - 6) < 1e-9 && Math.abs(t1.y1 - 3) < 1e-9, '36 接在 pad2 的那端要跟到 (6,3)（實際 ' + t1.x1 + ',' + t1.y1 + '）');
  ok(Math.abs(t1.x2 - 10) < 1e-9 && Math.abs(t1.y2) < 1e-9, '36 另一端接在 R2 上，不可被拖走');
  ok(Math.abs(t2.x1 - 4) < 1e-9 && Math.abs(t2.y1 - 3) < 1e-9, '36 接在 pad1 的那端要跟到 (4,3)');
  ok(Math.abs(t3.x1 - 4) < 1e-9 && Math.abs(t3.y1 - 6) < 1e-9, '36 沒接上的走線不可被動到');

  // 端點不在 pad 正中央時，偏移要保留（不可被吸到中心）
  app.state = mkBoard();
  const r1b = app.state.components[0];
  app.state.traces[0].x1 = 1.3; app.state.traces[0].y1 = 0.2;
  app.beginRubber([r1b]);
  r1b.x = 5;
  app.updateRubber();
  const t1b = app.state.traces[0];
  ok(Math.abs(t1b.x1 - 6.3) < 1e-9 && Math.abs(t1b.y1 - 0.2) < 1e-9,
     '36 端點相對 pad 的偏移要保留（實際 ' + t1b.x1.toFixed(2) + ',' + t1b.y1.toFixed(2) + '）');

  // 異網的走線端點不可被抓（幾何上重疊也不行）
  app.state = mkBoard();
  app.state.traces.push({ id: 't4', x1: 1, y1: 0, x2: 3, y2: 5, width: 0.3, layer: 'F.Cu', net: 'OTHER' });
  app.beginRubber([app.state.components[0]]);
  ok(!app.state.rubber.some(x => x.t.id === 't4'), '36 異網走線就算端點壓在 pad 上也不可跟著走');

  app.state = savedState;
}

// 37) 網路清單 / 未接線統計
// 「還有幾條沒接」原本只能看飛線用眼睛數。這裡列成表，數字要跟飛線一致。
{
  const savedState = app.state;
  const pad = (num, x, y, net) => ({ num, x, y, w: 1, h: 1, side: 'F', net, cu: true });
  app.state = Object.assign({}, savedState, {
    boardWidth: 60, boardHeight: 40, layers: 2, layerStack: app.buildLayerStack(2),
    components: [
      { id: 'r1', ref: 'R1', x: -10, y: 0, rot: 0, pads: [pad('1', 0, 0, 'VCC'), pad('2', 2, 0, 'SDA')] },
      { id: 'r2', ref: 'R2', x: 10, y: 0, rot: 0, pads: [pad('1', 0, 0, 'VCC'), pad('2', 2, 0, 'SDA')] }
    ],
    traces: [{ id: 't1', x1: -10, y1: 0, x2: 10, y2: 0, width: 0.3, layer: 'F.Cu', net: 'VCC' }],
    vias: [], keepouts: [], userZones: [], selectedSet: [], selected: null, highlightNet: null
  });

  const s = app.netSummary();
  eq(s.netCount, 2, '37 應該有 VCC 與 SDA 兩個網路');
  const vcc = s.list.find(r => r.net === 'VCC');
  const sda = s.list.find(r => r.net === 'SDA');
  eq(vcc.pads, 2, '37 VCC 有兩顆 pad');
  eq(vcc.traces, 1, '37 VCC 有一段走線');
  ok(Math.abs(vcc.len - 20) < 1e-9, '37 VCC 長度 20mm（實際 ' + vcc.len + '）');
  eq(vcc.open, 0, '37 VCC 已接完，未接線 0');
  eq(sda.traces, 0, '37 SDA 還沒有走線');
  ok(sda.open > 0, '37 SDA 要算成未接線');
  eq(s.openTotal, sda.open, '37 未接線總數要等於各網路加總');

  // 排序：未接線多的排前面（佈線時要先看那些）
  eq(s.list[0].net, 'SDA', '37 未接線的網路要排在前面');

  // 沒有 net 的 pad 與走線不可混進來
  app.state.components[0].pads.push(pad('3', 4, 0, ''));
  app.state.traces.push({ id: 't2', x1: 0, y1: 5, x2: 5, y2: 5, width: 0.3, layer: 'F.Cu', net: '' });
  eq(app.netSummary().netCount, 2, '37 無 net 的 pad/走線不算一個網路');

  app.state = savedState;
}

// 38) 匯流排群組佈線：一次拉一束
// 這一節守兩件事：只動這一束（別的 net 不可以被順手繞掉），
// 以及**照匯流排順序排隊**——照長度排會讓一束線互相穿過去，出來像打結。
{
  const savedState = app.state;
  const members = ['D0', 'D1', 'D2', 'D3'];
  const padOf = net => [{ num: '1', x: 0, y: 0, w: 0.6, h: 0.6, side: 'F', net: net, cu: true }];
  const comps = [];
  members.forEach((n, i) => {
    comps.push({ id: 'l' + i, ref: 'L' + i, x: -20, y: -6 + i * 4, rot: 0, pads: padOf(n) });
    comps.push({ id: 'r' + i, ref: 'R' + i, x: 20, y: -6 + i * 4, rot: 0, pads: padOf(n) });
  });
  comps.push({ id: 'x1', ref: 'X1', x: -20, y: 14, rot: 0, pads: padOf('SDA') });
  comps.push({ id: 'x2', ref: 'X2', x: 20, y: 14, rot: 0, pads: padOf('SDA') });
  app.state = Object.assign({}, savedState, {
    boardWidth: 60, boardHeight: 44, traces: [], vias: [], keepouts: [], userZones: [],
    components: comps,
    busGroups: [{ spec: 'D[0..3]', base: 'D', members: members.slice() }]
  });

  const okRun = app.routeBus('D[0..3]');
  ok(okRun === true, '38 整束佈線應回報成功');
  members.forEach(n => ok(app.state.traces.some(t => t.net === n), '38 ' + n + ' 要繞出走線'));
  ok(!app.state.traces.some(t => t.net === 'SDA'), '38 不可順手繞掉這一束以外的 net');

  // 排隊順序是這個功能的全部價值：照長度排（RouteAll 的預設）會讓一束線互相穿過去。
  // 用「幾何看起來沒交叉」去測不可靠——線長一樣時兩種排法結果相同，測不出差別。
  // 所以直接驗交給繞線器的順序與 order 選項。
  {
    const RA = window.RouteAll;
    const real = RA.run;
    let sawNets = null, sawOrder = null;
    // 用 call 保住 this：RouteAll.run 內部呼叫 this.commit，用箭頭函式轉呼叫會直接爆
    RA.run = (st, pa, lines2, o) => { sawNets = lines2.map(l => l.net); sawOrder = o.order; return real.call(RA, st, pa, lines2, o); };
    // 線長刻意不同：照長度排會變成 D3,D2,D1,D0，照匯流排排才是 D0..D3
    app.state.traces = [];
    app.state.components.forEach(c => {
      const m = /^R(\d)$/.exec(c.ref);
      if (m) c.x = 20 - Number(m[1]) * 3;
    });
    app.routeBus('D[0..3]');
    RA.run = real;
    eq(sawOrder, 'none', '38 要指定 order:none（照匯流排順序，不讓繞線器照長度重排）');
    eq((sawNets || []).join(','), members.join(','), '38 交給繞線器的順序要照匯流排成員順序');
  }

  // 不存在的匯流排要安靜回 false，不可以爆
  eq(app.routeBus('NOPE[0..1]'), false, '38 沒有這束就回 false');
  app.state = savedState;
}

// 39) 繞線收尾要收在「那個點真的有銅」的層——否則產出接不到東西的浮空銅
// 這個缺陷不會被 DRC 抓到（銅沒有互相違規），飛線只會多一條**零長度**的線，
// 畫面上看不見。2026-09-01 實測 8 片公版 134 條未繞裡，這種佔一半以上。
{
  const savedState = app.state;
  const ls = app.buildLayerStack(4);
  const IN1 = ls.filter(l => l.kind === 'copper')[1].id;
  app.state = Object.assign({}, savedState, {
    boardWidth: 60, boardHeight: 30, layerStack: ls, visibleLayers: ls.map(l => l.id),
    components: [{ id: 'u1', ref: 'U1', x: 20, y: 0, rot: 0, pads: [
      { num: '1', x: 0, y: 0, w: 0.8, h: 0.8, side: 'F', net: 'N1', cu: true }] }],
    // 既有走線在內層，端點停在 (-5,0)：那裡沒有 pad、也沒有 via
    traces: [{ x1: -15, y1: 0, x2: -5, y2: 0, layer: IN1, width: 0.2, net: 'N1' }],
    vias: [], keepouts: [], userZones: []
  });
  const line = { x1: -5, y1: 0, x2: 20, y2: 0, net: 'N1' };
  const r = window.AutoRoute.route(app.state, app.padAbs.bind(app), line, {
    layers: ls.filter(l => l.kind === 'copper').map(l => l.id), layer: 'F.Cu',
    width: 0.2, clearance: app.loadDrcRules().clearance, viaOd: 0.7, viaDrill: 0.3, grid: 0.25
  });
  ok(r.ok, '39 這條線應該繞得出來');
  if (r.ok) {
    const at = (x, y, p) => Math.hypot(p.x - x, p.y - y) < 0.4;
    // 起點那一端：要嘛第一段就走在既有走線的那一層，要嘛在那個點放一顆 via 換層
    const first = (r.segs || []).find(s => Math.hypot(s.x1 - line.x1, s.y1 - line.y1) < 0.4 ||
                                            Math.hypot(s.x2 - line.x1, s.y2 - line.y1) < 0.4);
    const viaThere = (r.vias || []).some(v => at(line.x1, line.y1, v));
    ok(!!first || viaThere, '39 起點附近要有線段或 via');
    const onSameLayer = first && (first.layer === IN1);
    ok(onSameLayer || viaThere,
      '39 收在既有走線的端點時，要走同一層或當場打 via（否則那段銅接不到任何東西）');
  }
  app.state = savedState;
}

// 40) 縮放與解析度：放大要真的看得更清楚
// 站主回報「放大有極限、而且越放大越糊」。兩個原因：
//   1. 上限寫死 3（30px/mm）——BGA 球距 0.4mm 只有 12px，那還沒開始放大。
//   2. canvas 的 backing store 沒有乘 devicePixelRatio，在 1.25×／2× 螢幕上
//      等於用一半解析度畫，放大也不會變清楚（糊的是畫布不是幾何）。
{
  const savedState = app.state;
  const savedDpr = app.dpr;

  // 上限：要能放到看得見 0.4mm 球距的程度（>= 100px/mm）
  app.state.zoom = 1; app.state.panX = 0; app.state.panY = 0;
  for (let i = 0; i < 40; i++) app.zoomIn();
  ok(app.state.zoom * 10 >= 100, '40 放大上限要 >= 100px/mm（實得 ' + (app.state.zoom * 10).toFixed(0) + 'px/mm）');
  eq(app.state.zoom, app.ZOOM_MAX, '40 連續放大應停在 ZOOM_MAX');
  for (let i = 0; i < 60; i++) app.zoomOut();
  eq(app.state.zoom, app.ZOOM_MIN, '40 連續縮小應停在 ZOOM_MIN');

  // 以某一點為錨縮放：那一點底下的板面座標不可以跑掉
  app.state.zoom = 1; app.state.panX = 0; app.state.panY = 0;
  const sx = 200, sy = 150;
  const mmOf = () => ({
    x: (sx - app.state.panX - app.viewW / 2) / (10 * app.state.zoom),
    y: (sy - app.state.panY - app.viewH / 2) / (10 * app.state.zoom)
  });
  const before = mmOf();
  app.zoomAt(4, sx, sy);
  const after = mmOf();
  ok(Math.hypot(after.x - before.x, after.y - before.y) < 1e-6,
    '40 以游標為錨縮放時，游標下的板面座標不可位移（差 ' +
    Math.hypot(after.x - before.x, after.y - before.y).toFixed(4) + 'mm）');

  // backing store 要跟著 devicePixelRatio；繪圖用的邏輯尺寸不受影響
  const fakeCanvas = { width: 0, height: 0, style: {}, parentElement: { clientWidth: 800, clientHeight: 600 } };
  const realCanvas = app.canvas, realRender = app.render;
  app.canvas = fakeCanvas; app.render = () => {};
  global.window.devicePixelRatio = 2;
  app.dpr = null;
  app.resizeCanvas();
  eq(fakeCanvas.width, 1600, '40 backing store 寬要 = CSS 寬 × dpr');
  eq(fakeCanvas.height, 1200, '40 backing store 高要 = CSS 高 × dpr');
  eq(app.viewW, 800, '40 繪圖用的邏輯寬仍是 CSS px');
  eq(fakeCanvas.style.width, undefined, '40 不可以寫 inline 的 CSS 尺寸（#pcbCanvas 是 100%，寫死會把畫布凍在 1px）');
  global.window.devicePixelRatio = 1;
  app.dpr = null; app.resizeCanvas();
  eq(fakeCanvas.width, 800, '40 dpr 回到 1 時 backing store 要跟著回來');
  app.canvas = realCanvas; app.render = realRender; app.dpr = savedDpr;
  app.state = savedState;
}

// 41) pad 的 net 回推：端點要真的落在那顆 pad 上，而且只給最近的一顆
// 舊版用外接圓（對角半徑）判定：0.2×0.85mm 的 QFN pad 半徑 0.44mm，
// 在 0.4mm 間距下會伸進隔壁腳——rp2040 公版的 pin15/16 因此都被標成 XIN，
// 而 XIN／XOUT 是石英振盪器的兩條不同 net。
{
  const savedState = app.state;
  const pad = (num, x, y) => ({ num, x, y, w: 0.2, h: 0.85, side: 'F', cu: true, shape: 'rect' });
  app.state = Object.assign({}, savedState, {
    components: [{ id: 'u1', ref: 'U1', x: 0, y: 0, rot: 0,
      pads: [pad('15', 0, 0), pad('16', 0.4, 0), pad('17', 0.8, 0)] }],
    traces: [{ x1: 0, y1: 0, x2: -5, y2: 0, layer: 'F.Cu', width: 0.15, net: 'XIN' }],
    vias: []
  });
  const r = app.assignPadNets(app.state.components, app.state.traces);
  const pads = app.state.components[0].pads;
  eq(pads[0].net, 'XIN', '41 端點落在 pin15 上，pin15 要拿到 net');
  eq(pads[1].net || '', '', '41 隔壁的 pin16 不可以被同一條線標上（0.4mm 間距）');
  eq(pads[2].net || '', '', '41 更遠的 pin17 當然也不行');
  eq(r.assigned, 1, '41 只該指派一顆');

  // 端點落在兩顆 pad 中間的空隙：兩顆都不該拿到 net。
  // 這一條才是真正在測「落點判定」——上面那條被「取最近的一顆」擋著也會過。
  app.state.components[0].pads.forEach(p => { p.net = ''; });
  app.state.traces = [{ x1: 0.22, y1: 0, x2: -5, y2: 0, layer: 'F.Cu', width: 0.15, net: 'XIN' }];
  const rGap = app.assignPadNets(app.state.components, app.state.traces);
  eq(rGap.assigned, 0, '41 端點在 pad 之間的空隙時，不可以硬塞給最近的那一顆');
  eq(app.state.components[0].pads[0].net || '', '', '41 空隙上的端點不算落在 pin15 上');

  // 端點落在 pad 邊緣（逃逸繞線常態）仍要算命中
  app.state.components[0].pads.forEach(p => { p.net = ''; });
  app.state.traces = [{ x1: 0, y1: 0.4, x2: -5, y2: 5, layer: 'F.Cu', width: 0.15, net: 'XIN' }];
  app.assignPadNets(app.state.components, app.state.traces);
  eq(app.state.components[0].pads[0].net, 'XIN', '41 端點在 pad 長邊邊緣也要算落在 pad 上');

  // 同一顆 pad 被兩個 net 拉到＝資料矛盾，回報 conflicts 且不指派
  app.state.components[0].pads.forEach(p => { p.net = ''; });
  app.state.traces = [
    { x1: 0, y1: 0, x2: -5, y2: 0, layer: 'F.Cu', width: 0.15, net: 'XIN' },
    { x1: 0, y1: 0, x2: -5, y2: 3, layer: 'F.Cu', width: 0.15, net: 'GND' }
  ];
  const r2 = app.assignPadNets(app.state.components, app.state.traces);
  ok(r2.conflicts >= 1, '41 同一顆 pad 兩個 net 要回報 conflict');
  eq(app.state.components[0].pads[0].net || '', '', '41 矛盾時不可以隨便挑一個指派');

  // 圓形 pad 用橢圓判定，不是外接方形
  app.state = Object.assign({}, savedState, {
    components: [{ id: 'j1', ref: 'J1', x: 0, y: 0, rot: 0,
      pads: [{ num: '1', x: 0, y: 0, w: 1, h: 1, side: 'F', cu: true, shape: 'circle' }] }],
    traces: [{ x1: 0.45, y1: 0.45, x2: 5, y2: 5, layer: 'F.Cu', width: 0.15, net: 'N1' }],
    vias: []
  });
  app.assignPadNets(app.state.components, app.state.traces);
  eq(app.state.components[0].pads[0].net || '', '', '41 圓形 pad 的角落不算在 pad 內（0.45,0.45 在外接方形內、圓外）');
  app.state = savedState;
}

// 42) 差分對展開後要重新檢查淨空
// routePair 繞的是中心線（走廊寬 2w+gap），再把兩條線往兩側位移展開。
// 走廊乾淨不代表展開後乾淨：扇出段與轉角補段是展開之後才生出來的幾何。
// 2026-09-01 實測：把成對繞接進公版補繞，esp32 +8、a20-lime +21、openrex +42 個 DRC error。
{
  const savedState = app.state;
  const pads = (n1, n2) => [
    { num: '1', x: 0, y: -0.5, w: 0.6, h: 0.6, side: 'F', net: n1, cu: true },
    { num: '2', x: 0, y: 0.5, w: 0.6, h: 0.6, side: 'F', net: n2, cu: true }];
  const base = () => ({
    boardWidth: 60, boardHeight: 40, layers: 2, layerStack: app.buildLayerStack(2),
    visibleLayers: ['F.Cu', 'B.Cu'], traces: [], vias: [], keepouts: [], userZones: [],
    components: [
      { id: 'j1', ref: 'J1', x: -20, y: 0, rot: 0, pads: pads('D_P', 'D_N') },
      { id: 'u1', ref: 'U1', x: 20, y: 0, rot: 0, pads: pads('D_P', 'D_N') }
    ]
  });
  const opts = {
    layers: ['F.Cu'], layer: 'F.Cu', width: 0.2, clearance: app.loadDrcRules().clearance,
    viaOd: 0.7, viaDrill: 0.3, grid: 0.25, pairGap: 0.2
  };
  const lineOf = net => {
    const ls = window.Ratsnest.compute(app.state, app.padAbs.bind(app));
    return ls.find(l => l.net === net);
  };

  // 空板：繞得出來（這是原本就會過的案例，確認沒有被檢查誤殺）
  app.state = Object.assign({}, savedState, base());
  const okRes = window.AutoRoute.routePair(app.state, app.padAbs.bind(app), lineOf('D_P'), lineOf('D_N'), opts);
  ok(okRes.ok, '42 空板上的差分對仍要繞得出來（檢查不可誤殺）');

  // 障礙要放在**展開之後**的扇出段上，不能放在中心線的走廊裡——
  // 放走廊裡的話中心線本來就會繞開，測不到「展開後才產生的幾何」。
  // 所以先繞一次、看展開結果落在哪，再把障礙放上去重繞。
  const fan = okRes.a.segs[0];
  const st2 = base();
  st2.components.push({ id: 'x1', ref: 'X1', x: (fan.x1 + fan.x2) / 2, y: (fan.y1 + fan.y2) / 2, rot: 0,
    pads: [{ num: '1', x: 0, y: 0, w: 0.3, h: 0.3, side: 'F', net: 'OTHER', cu: true }] });
  app.state = Object.assign({}, savedState, st2);
  const bad = window.AutoRoute.routePair(app.state, app.padAbs.bind(app), lineOf('D_P'), lineOf('D_N'), opts);
  ok(!bad.ok, '42 展開後會壓到別的 net 就要回失敗，不可以照樣回 ok');
  eq(bad.reason, 'pair_clearance', '42 失敗原因要講清楚是淨空，不是「沒有路」');

  // 檢查器本身：同一對的銅不算違規（不然自己會擋自己）
  const g = window.AutoRoute._pairClearance(app.state, app.padAbs.bind(app),
    [[{ x1: -20, y1: -0.5, x2: 20, y2: -0.5, layer: 'F.Cu' }]], ['D_P', 'D_N'], opts);
  ok(g === null || g.kind !== 'pad' || g.ref !== 'J1', '42 同一對自己的 pad 不算違規');
  app.state = savedState;
}

// 43) 逃逸 via：密腳區放不下 via 時，往外挪並補短線
// 零長度飛線＝同一點有兩層的同 net 銅、中間缺 via。BGA／QFN 底下沒有空間把 via
// 放在 pad 正下方，真實 layout 的作法就是逃逸：via 往外挪，兩層各補一段短線。
{
  const savedState = app.state;
  // 0.5mm 間距的一排 pad，中間那顆的 net 在底層也有一段線收在同一點
  const row = [];
  for (let i = 0; i < 5; i++) {
    row.push({ num: String(i + 1), x: (i - 2) * 0.5, y: 0, w: 0.25, h: 0.9, side: 'F',
      net: i === 2 ? 'SIG' : ('N' + i), cu: true });
  }
  const mk = () => Object.assign({}, savedState, {
    boardWidth: 30, boardHeight: 20, layers: 2, layerStack: app.buildLayerStack(2),
    visibleLayers: ['F.Cu', 'B.Cu'], keepouts: [], userZones: [], vias: [],
    components: [{ id: 'u1', ref: 'U1', x: 0, y: 0, rot: 0, pads: row.map(p => Object.assign({}, p)) }],
    traces: [{ x1: 0, y1: 0, x2: 0, y2: -6, layer: 'B.Cu', width: 0.2, net: 'SIG' }]
  });
  app.state = mk();
  const rules = app.loadDrcRules();
  const opt = { clearance: rules.clearance, viaOd: 0.7, viaDrill: 0.3, width: 0.2 };

  // 原地放不下：0.7mm 的 via 放在 0.5mm 間距的 pad 正中央，一定撞到左右鄰居
  const errs = () => window.PadDrc.run(app.state, app.padAbs.bind(app), rules).filter(f => f.type === 'error').length;
  const base = errs();
  app.state.vias.push({ x: 0, y: 0, od: 0.7, drill: 0.3, net: 'SIG' });
  ok(errs() > base, '43 前提：via 直接放在密腳中央會違規（不然這個測試沒有意義）');
  app.state.vias.pop();

  const esc = window.AutoRoute.escapeVia(app.state, app.padAbs.bind(app), { x: 0, y: 0, net: 'SIG' }, opt);
  ok(esc.ok, '43 應該找得到逃逸位置');
  ok(esc.r > 0, '43 逃逸的 via 要離開原點（實得 ' + (esc.r || 0).toFixed(2) + 'mm）');
  // 兩層都要接到新 via，但**不是各放一段一模一樣的線**：
  // 已經有走線收在該點的層（這裡是 B.Cu）要拉端點，pad 那層才補新的逃逸線。
  // 兩層疊同一段幾何會被 gerber-readback 判成「走線漏到別的銅層」，實測紅過。
  const touched = esc.stubs.map(s => s.layer).concat((esc.extend || []).map(e => e.layer)).sort();
  eq(touched.join(','), 'B.Cu,F.Cu', '43 兩層都要接到新 via（一層補線、一層拉端點）');
  eq(esc.stubs.length, 1, '43 只有 pad 那層需要新的逃逸線');
  eq((esc.extend || []).length, 1, '43 既有走線那層要拉端點，不可以疊一段一樣的線');
  eq(esc.extend[0].layer, 'B.Cu', '43 拉的是底層那條');

  // 套用之後：不可以產生新的 DRC 違規
  esc.stubs.forEach(s => app.state.traces.push(Object.assign({}, s)));
  esc.extend.forEach(e => {
    const t = app.state.traces[e.index];
    if (e.end === 1) { t.x1 = e.to.x; t.y1 = e.to.y; } else { t.x2 = e.to.x; t.y2 = e.to.y; }
  });
  app.state.vias.push(esc.via);
  eq(errs(), base, '43 逃逸之後不可以留下新的違規');

  // 完全沒有空間時要老實回失敗，不可以硬放
  app.state = mk();
  app.state.boardWidth = 1.2; app.state.boardHeight = 1.2;      // 板子只比那排 pad 大一點點
  const tight = window.AutoRoute.escapeVia(app.state, app.padAbs.bind(app), { x: 0, y: 0, net: 'SIG' }, opt);
  eq(tight.ok, false, '43 真的沒空間就要回失敗');
  eq(tight.reason, 'no_room', '43 失敗原因要講清楚');

  // via 放得下、但**短線會穿過別條 net 的線**：這種也要拒絕。
  // 只檢查 via 位置的話，會放出一顆「接得到、但半路短路」的逃逸孔。
  // 佈置：SIG pad 四周圍一圈異網 pad（只留正東一個缺口），缺口上橫著一條細的異網走線。
  // 東邊夠遠的地方 via 放得下，但從原點過去的短線一定會穿過那條線。
  {
    const st = Object.assign({}, savedState, {
      boardWidth: 30, boardHeight: 20, layers: 2, layerStack: app.buildLayerStack(2),
      visibleLayers: ['F.Cu', 'B.Cu'], keepouts: [], userZones: [], vias: [],
      components: [{ id: 'u1', ref: 'U1', x: 0, y: 0, rot: 0,
        pads: [{ num: '1', x: 0, y: 0, w: 0.25, h: 0.9, side: 'F', net: 'SIG', cu: true }] }],
      traces: [
        { x1: 0, y1: 0, x2: 0, y2: -6, layer: 'B.Cu', width: 0.2, net: 'SIG' },
        { x1: 0.8, y1: -1.5, x2: 0.8, y2: 1.5, layer: 'F.Cu', width: 0.05, net: 'WALL' }
      ]
    });
    for (let k = 1; k < 8; k++) {
      const th = (k / 8) * Math.PI * 2;
      st.components.push({ id: 'w' + k, ref: 'W' + k, x: Math.cos(th) * 0.75, y: Math.sin(th) * 0.75, rot: 0,
        pads: [{ num: '1', x: 0, y: 0, w: 0.6, h: 0.6, side: 'F', net: 'W' + k, cu: true }] });
    }
    app.state = st;
    const blocked = window.AutoRoute.escapeVia(app.state, app.padAbs.bind(app), { x: 0, y: 0, net: 'SIG' }, opt);
    if (blocked.ok) {
      const G = window.PadDrc._geom;
      const wall = st.traces.find(t => t.net === 'WALL');
      const worst = Math.min.apply(null, blocked.stubs.map(s =>
        G.segSegDist(s.x1, s.y1, s.x2, s.y2, wall.x1, wall.y1, wall.x2, wall.y2) - s.width / 2 - wall.width / 2));
      ok(worst >= rules.clearance.traceToTrace - 1e-6,
        '43 逃逸的短線不可以穿過別條 net（最近 ' + worst.toFixed(3) + 'mm，門檻 ' + rules.clearance.traceToTrace + '）');
    } else {
      eq(blocked.reason, 'no_room', '43 出不去就老實回 no_room');
    }
  }

  // 這個點只有一層有銅 → 不是「缺 via」，不該亂放
  app.state = mk();
  app.state.traces = [];
  const solo = window.AutoRoute.escapeVia(app.state, app.padAbs.bind(app), { x: 0, y: 0, net: 'SIG' }, opt);
  eq(solo.ok, false, '43 只有一層有銅時不該放 via');
  eq(solo.reason, 'not_a_layer_join', '43 要說明是「不是換層點」而不是「沒空間」');
  app.state = savedState;
}

// 44) 盲埋孔：跨層要一路帶到底（繞線器 → DRC → 逃逸孔 → UI）
// 這個功能在繞線器裡早就有，但**沒有任何呼叫端傳過那個選項**，等於藏起來沒做。
// 而且 DRC 以前把每顆 via 都當穿孔：一顆 In1–In2 的埋孔會被拿去跟頂層的線比距離，
// 報一個實體上不存在的違規——使用者只能把功能關掉。
{
  const savedState = app.state;
  const stack4 = app.buildLayerStack(4);
  const cu = stack4.filter(l => l.kind === 'copper').map(l => l.id);
  eq(cu.length, 4, '44 前提：四層板有四個銅層');

  // 頂層一條別的 net 的線，正好壓在埋孔的位置上方
  app.state = Object.assign({}, savedState, {
    boardWidth: 30, boardHeight: 20, layers: 4, layerStack: stack4,
    visibleLayers: cu.slice(), components: [], keepouts: [], userZones: [],
    traces: [{ x1: -5, y1: 0, x2: 5, y2: 0, layer: cu[0], width: 0.3, net: 'OTHER' }],
    vias: [{ x: 0, y: 0, od: 0.6, drill: 0.3, net: 'SIG', from: cu[1], to: cu[2] }]
  });
  const rules = app.loadDrcRules();
  const errs = () => window.PadDrc.run(app.state, app.padAbs.bind(app), rules).filter(f => f.type === 'error');
  eq(errs().length, 0, '44 埋孔沒有跨到頂層，不該跟頂層的線報違規');

  // 同一顆改成穿孔（沒有 from/to）就該報——不然這條測試等於什麼都沒測
  app.state.vias = [{ x: 0, y: 0, od: 0.6, drill: 0.3, net: 'SIG' }];
  ok(errs().length > 0, '44 穿孔跨到頂層，還是要照報');

  // 逃逸孔：打開盲埋之後，只有**跨到的層**擋得住它。
  // 所以障礙要放在底層：頂層→In1 的盲孔不必理會底層，穿孔則非閃不可。
  const pad = (net, side, w, h) => ({ num: '1', x: 0, y: 0, w: w || 0.25, h: h || 0.9, side, net, cu: true });
  const mk = () => Object.assign({}, savedState, {
    boardWidth: 30, boardHeight: 20, layers: 4, layerStack: stack4, visibleLayers: cu.slice(),
    keepouts: [], userZones: [], vias: [],
    components: [
      { id: 'u1', ref: 'U1', x: 0, y: 0, rot: 0, pads: [pad('SIG', 'F')] },
      // 底層四周塞滿別的 net 的 pad：穿孔一定放不下，盲孔不受影響
      { id: 'b1', ref: 'B1', x: -0.75, y: 0, rot: 0, pads: [pad('X1', 'B', 0.6, 2.4)] },
      { id: 'b2', ref: 'B2', x: 0.75, y: 0, rot: 0, pads: [pad('X2', 'B', 0.6, 2.4)] },
      { id: 'b3', ref: 'B3', x: 0, y: -0.75, rot: 0, pads: [pad('X3', 'B', 2.4, 0.6)] },
      { id: 'b4', ref: 'B4', x: 0, y: 0.75, rot: 0, pads: [pad('X4', 'B', 2.4, 0.6)] }
    ],
    traces: [{ x1: 0, y1: 0, x2: 0, y2: -6, layer: cu[1], width: 0.2, net: 'SIG' }]
  });
  const opt = { clearance: rules.clearance, viaOd: 0.7, viaDrill: 0.3, width: 0.2 };
  app.state = mk();
  const thru = window.AutoRoute.escapeVia(app.state, app.padAbs.bind(app), { x: 0, y: 0, net: 'SIG' }, opt);
  app.state = mk();
  const bb = window.AutoRoute.escapeVia(app.state, app.padAbs.bind(app), { x: 0, y: 0, net: 'SIG' },
    Object.assign({ blindBuried: true }, opt));
  ok(bb.ok, '44 允許盲埋時，底層的擁擠不該擋住頂層→In1 的逃逸孔');
  eq(bb.ok ? bb.via.from : '', cu[0], '44 逃逸孔的跨層從 pad 那層起算');
  eq(bb.ok ? bb.via.to : '', cu[1], '44 跨到走線那層就好，不必鑽穿整疊板');
  eq(bb.ok ? bb.r : -1, 0, '44 底層的障礙既然跨不到，就該原地放（不必逃逸）');
  ok(!thru.ok || thru.r > 0, '44 穿孔在同一個點上放不下（不然這條測試沒有意義）');

  // 真的接上畫面：以前這個選項只有測試在用
  {
    const fsx = require('fs'), pathx = require('path');
    const js = fsx.readFileSync(pathx.join(__dirname, 'pcb.js'), 'utf8');
    const html = fsx.readFileSync(pathx.join(__dirname, 'pcb.html'), 'utf8');
    ok(js.indexOf('blindBuried: !!this.state.blindBuried') > 0, '44 自動佈線要把選項傳給繞線器');
    ok(html.indexOf('blindBuriedToggle') > 0, '44 面板要有開關（藏起來等於沒做）');
    ok(js.indexOf('pj_bb_on') > 0, '44 打開時要講清楚板廠多半不接');
  }
  app.state = savedState;
}

// 45) 補短斷口：同 net、同層、只差零點幾 mm 沒接上
// A* 繞線器補不了這種——那兩端本來就貼在鄰居的淨空範圍內（密腳區），
// 起訖格子被判 blocked 就直接放棄。實測 8 片公版有 8 條這種，佔未繞數的 15%。
{
  const savedState = app.state;
  const rules = app.loadDrcRules();
  const opt = { clearance: rules.clearance, width: 0.2 };
  const base = () => Object.assign({}, savedState, {
    boardWidth: 30, boardHeight: 20, layers: 2, layerStack: app.buildLayerStack(2),
    visibleLayers: ['F.Cu', 'B.Cu'], components: [], vias: [], keepouts: [], userZones: [],
    traces: [
      { x1: -5, y1: 0, x2: -0.15, y2: 0, layer: 'F.Cu', width: 0.2, net: 'SIG' },
      { x1: 0.15, y1: 0, x2: 5, y2: 0, layer: 'F.Cu', width: 0.2, net: 'SIG' }
    ]
  });
  app.state = base();
  const line = { x1: -0.15, y1: 0, x2: 0.15, y2: 0, net: 'SIG' };
  const g = window.AutoRoute.closeGap(app.state, app.padAbs.bind(app), line, opt);
  ok(g.ok, '45 同層 0.3mm 的斷口要補得起來');
  eq(g.ok ? g.seg.layer : '', 'F.Cu', '45 補在兩端共同的那一層');
  eq(g.ok ? g.seg.net : '', 'SIG', '45 補的線要是同一條 net');

  // 補完之後飛線要真的消失（不然只是多一段銅）
  app.state.traces.push(Object.assign({}, g.seg));
  const after = window.Ratsnest.compute(app.state, app.padAbs.bind(app)).filter(l => l.net === 'SIG');
  eq(after.length, 0, '45 補完之後 SIG 不該還有飛線');

  // 斷口上有別的 net 的線橫過去 → 不可以硬補（那是短路）
  app.state = base();
  app.state.traces.push({ x1: 0, y1: -2, x2: 0, y2: 2, layer: 'F.Cu', width: 0.2, net: 'OTHER' });
  const blocked = window.AutoRoute.closeGap(app.state, app.padAbs.bind(app), line, opt);
  eq(blocked.ok, false, '45 斷口上橫著別條 net 就不可以補');
  eq(blocked.reason, 'not_clear', '45 理由要講清楚是淨空不夠');

  // 兩端在不同層 → 那是缺 via，不是斷口
  app.state = base();
  app.state.traces[1].layer = 'B.Cu';
  const cross = window.AutoRoute.closeGap(app.state, app.padAbs.bind(app), line, opt);
  eq(cross.ok, false, '45 兩端不同層不該用補線解決');
  eq(cross.reason, 'no_common_layer', '45 要講清楚是沒有共同層（該走 escapeVia）');

  // 邊界：零長度是缺 via，太長就該走繞線器
  app.state = base();
  eq(window.AutoRoute.closeGap(app.state, app.padAbs.bind(app),
    { x1: 0, y1: 0, x2: 0, y2: 0, net: 'SIG' }, opt).reason, 'zero_length', '45 零長度要交給 escapeVia');
  eq(window.AutoRoute.closeGap(app.state, app.padAbs.bind(app),
    { x1: -5, y1: 0, x2: 5, y2: 0, net: 'SIG' }, opt).reason, 'too_long', '45 太長就該走繞線器，不可以一條直線硬穿過去');
  app.state = savedState;
}

console.log(`\npcb-logic.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
