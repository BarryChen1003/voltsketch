/**
 * pcb-mesh.test.js — 3D 顯示模型匯入（pcb-mesh.js）
 *
 * 這支守的是三件「錯了看起來像模型本身畫壞」的事：
 *   1. KiCad .wrl 的 1 單位 = 2.54mm。照 mm 讀會小成 1/2.54，
 *      畫面上像是原廠模型做錯了，實際上是我們的換算漏了。
 *   2. VRML 的面用 -1 分隔且不保證是三角形。不做扇形三角化會少畫面，
 *      模型破破爛爛——但仍然「有東西」，所以只看有沒有渲染是抓不到的。
 *   3. 索引超出頂點數要當場報錯。丟給 GPU 會是一句看不懂的 WebGL 錯誤。
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

const fs = require('fs');
const path = require('path');
const M = require('./pcb-mesh.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL: ' + m); } };
const eq = (a, b, m) => ok(a === b, `${m} (得 ${JSON.stringify(a)}，期望 ${JSON.stringify(b)})`);
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m} (得 ${a}，期望 ${b}±${tol})`);

// 一個單位立方體的 VRML（KiCad 風格：Shape → IndexedFaceSet）
const WRL_CUBE = `#VRML V2.0 utf8
Shape {
  appearance Appearance { material Material { diffuseColor 0.10 0.20 0.30 } }
  geometry IndexedFaceSet {
    coord Coordinate { point [
      0 0 0, 1 0 0, 1 1 0, 0 1 0,
      0 0 1, 1 0 1, 1 1 1, 0 1 1 ] }
    coordIndex [ 0,1,2,3,-1, 4,5,6,7,-1 ]
  }
}`;

// ---- 1. VRML 基本 ----
{
  const m = M.parseWrl(WRL_CUBE);
  eq(m.positions.length, 24, '1.1 8 個頂點 × 3');
  // 兩個四邊形 → 各拆成 2 個三角形
  eq(m.tris, 4, '1.2 四邊形要扇形三角化（2 面 → 4 三角形）');
  eq(m.indices.length, 12, '1.3 索引數 = 三角形 × 3');
  ok(m.color && Math.abs(m.color[0] - 0.1) < 1e-9, '1.4 抓得到 diffuseColor');
}

// ---- 2. KiCad 單位換算 ----
{
  const m = M.parseWrl(WRL_CUBE);
  near(m.bbox.maxx, 2.54, 1e-9, '2.1 預設用 KiCad 換算：1 單位 = 2.54mm');
  const raw = M.parseWrl(WRL_CUBE, { scale: 1 });
  near(raw.bbox.maxx, 1, 1e-9, '2.2 可以覆寫成 1:1');
  eq(M.KICAD_WRL_SCALE, 2.54, '2.3 換算常數擺在模組上，不是散在各處的魔術數字');
}

// ---- 3. 多個 Shape 要合併，索引要平移 ----
{
  const two = WRL_CUBE + '\n' + WRL_CUBE.replace('#VRML V2.0 utf8', '');
  const m = M.parseWrl(two);
  eq(m.positions.length, 48, '3.1 兩個 Shape 的頂點都收進來');
  eq(m.tris, 8, '3.2 面數加倍');
  const n = m.positions.length / 3;
  ok(m.indices.every(i => i >= 0 && i < n), '3.3 第二段的索引要平移（否則都指到第一段）');
  ok(m.indices.some(i => i >= 8), '3.4 真的有指到第二段的頂點');
}

// ---- 4. OBJ ----
{
  const obj = [
    '# 一個三角形加一個四邊形',
    'v 0 0 0', 'v 1 0 0', 'v 1 1 0', 'v 0 1 0',
    'f 1 2 3',
    'f 1/1 2/2 3/3 4/4'
  ].join('\n');
  const m = M.parseObj(obj);
  eq(m.positions.length, 12, '4.1 4 個頂點');
  eq(m.tris, 3, '4.2 三角形 1 + 四邊形拆 2');
  eq(m.indices[0], 0, '4.3 OBJ 索引從 1 起算，要減 1');

  const neg = ['v 0 0 0', 'v 1 0 0', 'v 1 1 0', 'f -3 -2 -1'].join('\n');
  eq(M.parseObj(neg).indices.join(','), '0,1,2', '4.4 負索引是從尾巴數回來');

  const vn = ['v 0 0 0', 'v 1 0 0', 'v 1 1 0', 'f 1//1 2//2 3//3'].join('\n');
  eq(M.parseObj(vn).tris, 1, '4.5 v//vn 寫法也要吃');
}

// ---- 5. 壞檔要報錯，不可以回空模型 ----
{
  const boom = (fn, why) => { try { fn(); ok(false, why + '（應該 throw）'); } catch (e) { ok(true, why); } };
  boom(() => M.parseWrl('#VRML V2.0 utf8\nShape { }'), '5.1 沒有 IndexedFaceSet');
  boom(() => M.parseObj('v 0 0 0\nv 1 0 0'), '5.2 只有頂點沒有面');
  boom(() => M.parseObj('# 空的'), '5.3 空檔');
  // 索引超出頂點數：放行的話會變成看不懂的 WebGL 錯誤
  boom(() => M.parseObj(['v 0 0 0', 'v 1 0 0', 'v 1 1 0', 'f 1 2 9'].join('\n')), '5.4 索引超出頂點數');
  boom(() => M.parse('x', 'part.step'), '5.5 STEP 要明講不支援顯示（只支援匯出）');
  boom(() => M.parse('x', 'part.zip'), '5.6 認不得的副檔名不硬讀');
}

// ---- 6. 分派 ----
{
  eq(M.parse(WRL_CUBE, 'a.wrl').tris, 4, '6.1 .wrl 走 VRML');
  eq(M.parse('v 0 0 0\nv 1 0 0\nv 1 1 0\nf 1 2 3', 'a.obj').tris, 1, '6.2 .obj 走 OBJ');
  eq(M.parse(WRL_CUBE, 'A.WRL').tris, 4, '6.3 副檔名大小寫不拘');
}

// ---- 7. 擺放：置中、貼板面、可依封裝縮放 ----
{
  const m = M.parseWrl(WRL_CUBE, { scale: 1 });      // 1×1×1，原點在角落
  const p = M.placement(m, { w: 5, h: 5 }, { fit: false });
  eq(p.scale, 1, '7.1 不 fit 就不縮放');
  near(p.offset[0], -0.5, 1e-9, '7.2 X 置中');
  near(p.offset[1], -0.5, 1e-9, '7.3 Y 置中');
  near(p.offset[2], 0, 1e-9, '7.4 Z 底部貼板面（模型原點在底面時位移 0）');

  // 原點在中心的模型：Z 要往上推半個高度，不然一半陷進板子裡
  const centered = { bbox: { minx: -1, maxx: 1, miny: -1, maxy: 1, minz: -0.5, maxz: 0.5 } };
  near(M.placement(centered, { w: 2, h: 2 }, { fit: false }).offset[2], 0.5, 1e-9, '7.5 原點在中心也要貼平');

  const fitted = M.placement(m, { w: 5, h: 4 }, { fit: true });
  near(fitted.scale, 4, 1e-9, '7.6 fit 取較小的比例（4/1），不可以撐破封裝');
  near(fitted.size.w, 4, 1e-9, '7.7 縮放後的尺寸算得出來');
  eq(M.placement(null, { w: 2, h: 2 }).scale, 1, '7.8 沒有模型不可以爆');
}

// ---- 8. 真的接上畫面 ----
{
  const three = fs.readFileSync(path.join(__dirname, 'pcb-3d.js'), 'utf8');
  ok(three.indexOf('PcbMesh') > 0, '8.1 pcb-3d.js 有用到網格模型');
  const html = fs.readFileSync(path.join(__dirname, 'pcb.html'), 'utf8');
  ok(html.indexOf('pcb-mesh.js') > 0, '8.2 pcb.html 有載入模組');
  ok(html.indexOf('meshFile') > 0, '8.3 有匯入入口');
}

console.log(`\npcb-mesh.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
