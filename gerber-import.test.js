/**
 * gerber-import.test.js — Gerber / Excellon 匯入驗證（node）
 *
 * 主力是 round-trip：拿自家 gerber.mjs 產生的檔案解析回來，比對幾何。
 * 這比手寫期望值強，因為兩邊是獨立實作——parser 若把座標格式或 Y 軸搞錯，
 * round-trip 立刻對不上，手寫期望值卻可能連錯兩次剛好相消。
 *
 * 另外針對「別人家的檔案」補了單元測試：後導零省略、英吋、G74 單象限弧、
 * 沒有小數點的 Excellon——這些自家產生器不會產出，但匯入一定會遇到。
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

const GI = require('./gerber-import.js');
const { build } = require('./supabase/functions/_shared/gerber.mjs');

let pass = 0, fail = 0;
function eq(a, b, msg) {
  const ok = JSON.stringify(a) === JSON.stringify(b);
  if (ok) pass++; else { fail++; console.error(`FAIL ${msg}\n  expected ${JSON.stringify(b)}\n  got      ${JSON.stringify(a)}`); }
}
const ok = (v, msg) => eq(!!v, true, msg);
function near(a, b, tol, msg) {
  const d = Math.abs(a - b);
  if (d <= tol) pass++; else { fail++; console.error(`FAIL ${msg}\n  ${a} 與 ${b} 差 ${d} > ${tol}`); }
}

// ---- 0. 座標格式 ----
eq(GI._parseFS('FSLAX46Y46'), { zero: 'L', mode: 'A', xi: 4, xd: 6, yi: 4, yd: 6 }, '0.1 FS 解析');
eq(GI._coord('10800000', 4, 6, 'L'), 10.8, '0.2 前導零省略');
eq(GI._coord('-10000000', 4, 6, 'L'), -10, '0.3 負座標');
eq(GI._coord('108', 2, 4, 'T'), 10.8, '0.4 後導零省略：108 補成 108000 → 10.8（不是 1.08，方向別搞反）');
eq(GI._coord('', 4, 6, 'L'), null, '0.5 空字串回 null');

eq(GI._parseAD('ADD10C,0.300000'), { code: 'D10', type: 'C', params: [0.3] }, '0.6 圓形光圈');
eq(GI._parseAD('ADD11R,1.000000X1.200000'), { code: 'D11', type: 'R', params: [1, 1.2] }, '0.7 矩形光圈');
eq(GI._apertureSize({ type: 'R', params: [1, 1.2] }), { w: 1, h: 1.2, shape: 'rect' }, '0.8 矩形尺寸');
eq(GI._apertureSize({ type: 'O', params: [2, 1] }), { w: 2, h: 1, shape: 'oval' }, '0.9 長圓尺寸');

// ---- 1. 層別判斷 ----
eq(GI.layerFromFunction('Copper,L1,Top'), 'F.Cu', '1.1 %TF 頂層銅');
eq(GI.layerFromFunction('Copper,L4,Bot'), 'B.Cu', '1.2 %TF 底層銅');
eq(GI.layerFromFunction('Copper,L2,Inr'), 'In2.Cu', '1.3 %TF 內層銅');
eq(GI.layerFromFunction('Soldermask,Top'), 'F.Mask', '1.4 %TF 阻焊');
eq(GI.layerFromFunction('Profile,NP'), 'Edge.Cuts', '1.5 %TF 板框');
eq(GI.layerFromName('board.GTL'), 'F.Cu', '1.6 副檔名 .GTL＝頂層銅');
eq(GI.layerFromName('board-F_Cu.gbr'), 'F.Cu', '1.7 KiCad 命名');
eq(GI.layerFromName('board.GBL'), 'B.Cu', '1.8 .GBL＝底層銅');
eq(GI.layerFromName('board.GKO'), 'Edge.Cuts', '1.9 .GKO＝板框');

// ---- 2. round-trip：自家產生器 → 解析 → 比幾何 ----
const st = {
  boardWidth: 40, boardHeight: 30,
  layerStack: [{ id: 'F.Cu', kind: 'copper' }, { id: 'B.Cu', kind: 'copper' }],
  components: [{
    ref: 'R1', x: 10, y: 10, rot: 0, side: 'top', pads: [
      { x: -0.8, y: 0, w: 1.0, h: 1.2, shape: 'rect', num: 1, net: 'N1', side: 'F' },
      { x: 0.8, y: 0, w: 1.0, h: 1.2, shape: 'rect', num: 2, net: 'N2', side: 'F' },
    ],
  }],
  traces: [
    { x1: 10.8, y1: 10, x2: 20, y2: 10, layer: 'F.Cu', width: 0.3, net: 'N2' },
    { x1: 20, y1: 10, x2: 20, y2: 20, layer: 'F.Cu', width: 0.25, net: 'N2' },
    { x1: 5, y1: 5, x2: 8, y2: 5, layer: 'B.Cu', width: 0.4, net: 'N3' },
  ],
  vias: [{ x: 20, y: 20, d: 0.3, drill: 0.3, net: 'N2' }],
};
const padAbs = (c, p) => {
  const th = ((c.rot || 0) * Math.PI) / 180, co = Math.cos(th), s = Math.sin(th);
  return { x: c.x + p.x * co + p.y * s, y: c.y - p.x * s + p.y * co };
};
const gen = build(st, padAbs, 'rt');
const fileOf = re => gen.files.find(f => re.test(f.name));

{
  const f = fileOf(/F_Cu/);
  ok(f, '2.0 產生器有輸出 F_Cu');
  const g = GI.parseGerber(f.text, { name: f.name });
  eq(g.unit, 'MM', '2.1 單位 MM');
  eq(g.layer, 'F.Cu', '2.2 從 %TF 認出 F.Cu');
  eq(g.warnings, [], '2.3 自家檔案不該有任何警告');
  eq(g.stats.lines, 2, '2.4 兩條走線');
  eq(g.stats.flashes, 3, '2.5 三個閃光（2 個 pad + 1 個 via）');

  const L = g.primitives.filter(p => p.kind === 'line');
  // Gerber 的 Y 向上，產生器輸出時取負，所以解析回來要再取負才對得回原始座標
  eq([L[0].x1, -L[0].y1, L[0].x2, -L[0].y2], [10.8, 10, 20, 10], '2.6 第一條走線座標完全一致');
  near(L[0].w, 0.3, 1e-9, '2.7 線寬 0.3 對得回來');
  eq([L[1].x1, -L[1].y1, L[1].x2, -L[1].y2], [20, 10, 20, 20], '2.8 第二條走線座標一致');
  near(L[1].w, 0.25, 1e-9, '2.9 第二條線寬 0.25（不同光圈有正確切換）');

  const F = g.primitives.find(p => p.kind === 'flash');
  eq([F.x, -F.y], [20, 20], '2.10 via 位置一致');
  near(F.w, 0.6, 1e-9, '2.11 via 外徑 0.6（drill 0.3 + 環寬）');
}
{
  const f = fileOf(/B_Cu/);
  const g = GI.parseGerber(f.text, { name: f.name });
  eq(g.layer, 'B.Cu', '2.12 底層認得出來');
  const L = g.primitives.filter(p => p.kind === 'line');
  eq(L.length, 1, '2.13 底層只有一條走線（頂層的沒有混進來）');
  eq([L[0].x1, -L[0].y1, L[0].x2, -L[0].y2], [5, 5, 8, 5], '2.14 底層走線座標一致');
}
{
  // 阻焊是負片、pad 用 region 畫，確認 region 有被解析出來
  const f = fileOf(/F_Mask/);
  const g = GI.parseGerber(f.text, { name: f.name });
  eq(g.layer, 'F.Mask', '2.15 阻焊層認得出來');
  ok(g.stats.regions + g.stats.flashes > 0, '2.16 阻焊層有幾何（pad 開窗）');
}

// ---- 3. Excellon round-trip ----
{
  const f = fileOf(/\.drl$/);
  ok(f, '3.0 有鑽孔檔');
  const d = GI.parseExcellon(f.text);
  eq(d.unit, 'MM', '3.1 METRIC');
  eq(d.stats.holes, 1, '3.2 一個孔');
  eq(d.stats.tools, 1, '3.3 一支鑽頭');
  near(d.holes[0].d, 0.3, 1e-9, '3.4 孔徑 0.3');
  eq([d.holes[0].x, -d.holes[0].y], [20, 20], '3.5 孔位一致');
  eq(d.warnings, [], '3.6 自家鑽孔檔不該有警告');
}

// ---- 4. toBoard ----
{
  const layers = gen.files.filter(f => /_Cu\.gbr$/.test(f.name)).map(f => ({ name: f.name, text: f.text }));
  const drills = gen.files.filter(f => /\.drl$/.test(f.name)).map(f => ({ name: f.name, text: f.text }));
  const b = GI.toBoard(layers, drills);
  eq(b.traces.length, 3, '4.1 三條走線都回來了');
  eq(b.vias.length, 1, '4.2 一個 via');
  const t = b.traces.find(x => x.layer === 'F.Cu' && x.width === 0.3);
  eq([t.x1, t.y1, t.x2, t.y2], [10.8, 10, 20, 10], '4.3 toBoard 已把 Y 翻回編輯器方向');
  eq(b.traces.every(x => x.net === ''), true, '4.4 net 一律空白（Gerber 沒有網路資訊，不可以亂猜）');
  eq(b.report.lossy.includes('no_nets'), true, '4.5 report 明講「沒有網路」');
  eq(b.report.lossy.includes('no_components'), true, '4.6 report 明講「沒有元件」');
  eq(b.report.layers.length, 2, '4.7 逐層統計有回報');
}

// ---- 5. 別人家的檔案：後導零、英吋、G74 ----
{
  // 後導零省略 + 英吋。1 inch = 25.4mm
  const src = '%FSTAX24Y24*%\n%MOIN*%\n%ADD10C,0.010000*%\nD10*\nX1Y1D02*\nX2Y1D01*\nM02*';
  const g = GI.parseGerber(src);
  eq(g.unit, 'IN', '5.1 英吋單位');
  const L = g.primitives[0];
  // 後導零省略：X1 補成 100000，以 2.4 格式解讀 = 10.0000 inch = 254mm。
  // 方向很容易搞反——省略的是「尾巴的零」，所以數字要往右補滿，不是往左。
  near(L.x1, 254, 1e-6, '5.2 後導零省略 + 英吋：X1 → 10 inch → 254mm');
  near(L.x2, 508, 1e-6, '5.3 終點 X2 → 20 inch → 508mm');
  near(L.w, 0.254, 1e-6, '5.4 光圈直徑也換成 mm');
}
{
  // G75 多象限逆時針四分之一圓：從 (1,0) 繞原點到 (0,1)
  const src = '%FSLAX36Y36*%\n%MOMM*%\n%ADD10C,0.200000*%\nG75*\nD10*\nX1000000Y0D02*\nG03X0Y1000000I-1000000J0D01*\nM02*';
  const g = GI.parseGerber(src);
  eq(g.stats.arcs, 1, '5.5 解析出一段弧');
  const a = g.primitives[0];
  eq([a.cx, a.cy], [0, 0], '5.6 圓心算對（I/J 是相對起點的偏移）');
  eq(a.ccw, true, '5.7 G03＝逆時針');
  const pts = GI.arcPoints(a, 8);
  near(Math.hypot(pts[4][0], pts[4][1]), 1, 1e-9, '5.8 取樣點都在半徑 1 上');
  near(pts[0][0], 1, 1e-9, '5.9 取樣從起點開始');
  near(pts[8][1], 1, 1e-9, '5.10 取樣到終點結束');
}
{
  // G74 單象限：I/J 無正負號，要自己試出正確象限
  const src = '%FSLAX36Y36*%\n%MOMM*%\n%ADD10C,0.200000*%\nG74*\nD10*\nX1000000Y0D02*\nG03X0Y1000000I1000000J0D01*\nM02*';
  const g = GI.parseGerber(src);
  const a = g.primitives[0];
  near(a.cx, 0, 1e-9, '5.11 G74 圓心 x 試出正確象限');
  near(a.cy, 0, 1e-9, '5.12 G74 圓心 y 試出正確象限');
}
{
  // 沒有小數點的 Excellon（很多板廠工具這樣輸出）
  const src = 'M48\nMETRIC,TZ,000.000\nT1C0.800\n%\nG90\nT1\nX010000Y-020000\nM30';
  const d = GI.parseExcellon(src);
  eq(d.stats.holes, 1, '5.13 無小數點也解析得出來');
  near(d.holes[0].x, 10, 1e-9, '5.14 X 依格式 3.3 解析成 10mm');
  near(d.holes[0].y, -20, 1e-9, '5.15 Y 解析成 -20mm');
  near(d.holes[0].d, 0.8, 1e-9, '5.16 孔徑 0.8');
}
{
  // G85 長槽要照實回報，不可以當成圓孔靜靜吃掉
  const src = 'M48\nMETRIC,TZ\nT1C1.0\n%\nG90\nT1\nX10.0Y-5.0G85X15.0Y-5.0\nM30';
  const d = GI.parseExcellon(src);
  eq(d.stats.slots, 1, '5.17 長槽有被認出來');
  eq(d.holes[0].slot, true, '5.18 標記為 slot');
  const b = GI.toBoard([], [{ name: 'x.drl', text: src }]);
  eq(b.vias.length, 0, '5.19 長槽不會被當成 via 匯入');
  ok(b.warnings.some(w => /slot_not_imported/.test(w)), '5.20 而且有警告，不是靜靜消失');
}

// ---- 6. 不支援的東西要照實說 ----
{
  const src = '%FSLAX46Y46*%\n%MOMM*%\n%AMDONUT*\n1,1,0.5,0,0*\n%\n%ADD10DONUT*%\nD10*\nX0Y0D03*\nM02*';
  const g = GI.parseGerber(src);
  ok(g.warnings.some(w => /aperture_macros/.test(w)), '6.1 光圈巨集有警告（不假裝畫得出來）');
}
{
  const src = '%FSLIX46Y46*%\n%MOMM*%\nM02*';
  const g = GI.parseGerber(src);
  ok(g.warnings.some(w => /incremental/.test(w)), '6.2 增量座標有警告');
}
{
  const g = GI.parseGerber('%MOMM*%\nX100Y100D01*\nM02*');
  ok(g.warnings.some(w => /coord_before_fs/.test(w)), '6.3 沒有 FS 就出現座標要報錯');
}
eq(GI.parseGerber('').stats.lines, 0, '6.4 空字串不炸');
eq(GI.parseGerber(null).primitives, [], '6.5 null 不炸');
eq(GI.parseExcellon('').holes, [], '6.6 空鑽孔檔不炸');
eq(GI.toBoard(null, null).traces, [], '6.7 toBoard 吃 null 不炸');

console.log(`\ngerber-import.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
