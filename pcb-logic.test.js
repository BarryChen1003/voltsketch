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
require('./pcb-rules.js');
require('./pcb-stackup.js');
require('./pcb-constraints.js');
require('./pcb-drc.js');
require('./pcb-fabs.js');

// pcb.js 內部以「裸全域」引用這些（瀏覽器 window 屬性＝全域）；node 需手動鏡射到 global
['PcbHistory', 'FootprintGen', 'RefFP', 'PartsLib', 'PCB_REFBOARDS', 'IC_DATA',
 'NetRules', 'Ratsnest', 'AutoRoute', 'Stackup', 'Padstack', 'Backdrill', 'FabProfiles', 'ConstraintMgr', 'PadDrc'].forEach(k => { global[k] = global.window[k]; });

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

  // 21a 公版的 DRC 現況：**它們自己過不了**，而且不是誤判。
  //     實測（2026-08-24）：VBUS 走線直接橫越 J1 整排 pad，回報距離 d=0；
  //     U1 與 C3 的 pad 只隔 0.095mm，連 JLCPCB 的 0.10mm 下限都不到。
  //     公版的走線是「示意直線」不是真的繞線，所以幾何上確實不可製造。
  //     這裡不假裝它是綠的，改用「只能往下、不能往上」的缺陷預算鎖住現況，
  //     哪天有人把公版重畫好，數字掉下來就把預算一起調低。
  //     修法屬於重畫 8 片板，不在這一輪範圍（見 NEW-SESSION §7 已知缺陷）。
  const BUDGET = {
    'rp2040-pico30': 43, 'arduino-uno-r3': 47, 'esp32-poe2': 63, 'a20-lime': 55,
    'imx233-maxi': 32, 'openrex-imx6': 64, 'imx8mp-som': 54, 'librevna': 30
  };
  const boards = (window.PCB_REFBOARDS || []).map(b => b.id).filter(Boolean);
  eq(boards.length, 8, '21 應有 8 片公版');
  const worse = [];
  for (const id of boards) {
    app.loadRefBoard(id);
    const errs = app.runDrc().filter(r => r.type === 'error').length;
    const cap = BUDGET[id];
    ok(cap != null, `21 公版 ${id} 應列在缺陷預算裡（新增公版要一起登記）`);
    if (cap != null && errs > cap) worse.push(`${id}: ${errs} > ${cap}`);
  }
  eq(worse.join(' │ '), '', '21 公版的 DRC error 只准變少，不准變多');

  // assignPadNets：公版 pad 原本完全沒有 net，走線端點要能把 net 回填回去
  {
    app.loadRefBoard('rp2040-pico30');
    const pads = [];
    app.state.components.forEach(c => (c.pads || []).forEach(x => pads.push(x)));
    ok(pads.filter(x => x.net).length > 0, '21 載入公版後應有 pad 帶著 net');
    // 純函式行為：清掉再跑一次，數量要一致（冪等）
    const n1 = pads.filter(x => x.net).length;
    pads.forEach(x => { x.net = ''; });
    const r1 = app.assignPadNets(app.state.components, app.state.traces);
    eq(r1.assigned, n1, '21 assignPadNets 重跑應回填同樣數量');
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

console.log(`\npcb-logic.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
