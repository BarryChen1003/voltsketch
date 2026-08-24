/**
 * pcb-logic.test.js — PCB 編輯器邏輯層回歸測試（node，無瀏覽器）
 * 目的：把「靠手動瀏覽器實測」的互動邏輯固化成可重跑測試，改碼即自動驗、防回歸。
 * 手法：stub DOM/canvas，載入 pcb.js 但「不跑 init()」（避開重 DOM 初始化），
 *       直接測純邏輯方法與狀態變化。渲染類方法覆寫成 no-op。
 * 涵蓋：nextRef / snapTarget / traceHit / traceEndpointHit / padAbs /
 *       PcbHistory undo-redo / pasteClipboard / 多選刪除 filter / refBoardParts /
 *       AutoRoute 淨空遵從 / autoRoute 讀 DRC 規則 / meanderTune 長度數學 / Backdrill 殘樁。
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

// pcb.js 內部以「裸全域」引用這些（瀏覽器 window 屬性＝全域）；node 需手動鏡射到 global
['PcbHistory', 'FootprintGen', 'RefFP', 'PartsLib', 'PCB_REFBOARDS', 'IC_DATA',
 'NetRules', 'Ratsnest', 'AutoRoute', 'Stackup', 'Padstack', 'Backdrill'].forEach(k => { global[k] = global.window[k]; });

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
  const d10 = minDistToSegs(0, 0, routed);
  ok(d10 > 2.5, `10 autoRoute 必須套用 DRC 淨空 2.0（得 ${d10.toFixed(3)}；硬寫 0.15 會 <1.6）`);
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

console.log(`\npcb-logic.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
