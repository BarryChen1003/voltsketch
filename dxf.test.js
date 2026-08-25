/**
 * dxf.test.js — DXF 板框匯入／匯出驗證（node，無瀏覽器）
 *
 * 板框是結構工程師給的，描錯板廠就切錯。所以這支不只問「有沒有讀到線」，
 * 而是問：單位對不對、弧線接得起來嗎、**板框封閉嗎**、來回一趟幾何有沒有跑掉。
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

const D = require('./pcb-dxf.js');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL: ' + m); } };
const eq = (a, b, m) => ok(a === b, `${m} (得 ${JSON.stringify(a)}，期望 ${JSON.stringify(b)})`);
const near = (a, b, t, m) => ok(Math.abs(a - b) <= (t || 1e-6), `${m} (得 ${a}，期望 ${b}±${t || 1e-6})`);

const dxf = (...rows) => ['0', 'SECTION', '2', 'ENTITIES'].concat(rows, ['0', 'ENDSEC', '0', 'EOF']).join('\n');
const withUnits = (u, ...rows) => ['0', 'SECTION', '2', 'HEADER', '9', '$INSUNITS', '70', String(u), '0', 'ENDSEC',
  '0', 'SECTION', '2', 'ENTITIES'].concat(rows, ['0', 'ENDSEC', '0', 'EOF']).join('\n');
const LINE = (x1, y1, x2, y2, layer) => ['0', 'LINE', '8', layer || '0',
  '10', String(x1), '20', String(y1), '11', String(x2), '21', String(y2)];
const RECT = (w, h, layer) => [].concat(
  LINE(0, 0, w, 0, layer), LINE(w, 0, w, h, layer), LINE(w, h, 0, h, layer), LINE(0, h, 0, 0, layer));

// ============ 1) 基本讀取 ============
{
  const r = D.parse(withUnits(4, ...RECT(100, 60)), {});
  eq(r.segs.length, 4, '1 矩形應讀到 4 段');
  eq(r.entities.LINE, 4, '1 應統計到 4 個 LINE 實體');
  eq(r.warnings.length, 0, '1 有 $INSUNITS 時不應有警告');
  const b = D.toBoard(r.segs);
  eq(b.w, 100, '1 板寬 100mm');
  eq(b.h, 60, '1 板高 60mm');
  ok(D.checkClosed(r.segs).closed, '1 矩形應判定為封閉');

  // 置中：所有座標的中心應為原點
  const cx = b.edgeSegs.reduce((a, s) => a + s.x1 + s.x2, 0) / (b.edgeSegs.length * 2);
  near(cx, 0, 1e-9, '1 匯入後應以板中心為原點');
  // Y 軸要翻（DXF 向上、畫布向下）
  const src = D.parse(withUnits(4, ...LINE(0, 0, 0, 10)), {});
  const bt = D.toBoard(src.segs);
  ok(bt.edgeSegs[0].y1 > bt.edgeSegs[0].y2, '1 Y 軸應翻轉');
  const noFlip = D.toBoard(src.segs, { flipY: false });
  ok(noFlip.edgeSegs[0].y1 < noFlip.edgeSegs[0].y2, '1 flipY:false 時不翻');
}

// ============ 2) 單位：最容易差 25.4 倍的地方 ============
{
  const mm = D.parse(withUnits(4, ...RECT(100, 60)), {});
  const inch = D.parse(withUnits(1, ...RECT(100, 60)), {});
  eq(D.toBoard(mm.segs).w, 100, '2 $INSUNITS=4 應視為 mm');
  near(D.toBoard(inch.segs).w, 2540, 1e-3, '2 $INSUNITS=1 應換算成 mm（100in = 2540mm）');
  eq(mm.unitSource, '$INSUNITS=4', '2 應回報單位來源');

  // 沒填單位：要假設並且**明講**，不可靜靜當 mm
  const none = D.parse(dxf(...RECT(50, 40)), {});
  eq(D.toBoard(none.segs).w, 50, '2 沒填單位時預設當 mm');
  ok(none.warnings.some(w => w.code === 'unitsAssumed'), '2 沒填單位必須發警告');
  eq(none.unitSource, 'assumed:mm', '2 應標明是假設的');
  const asInch = D.parse(dxf(...RECT(2, 1)), { assumeUnit: 'inch' });
  near(D.toBoard(asInch.segs).w, 50.8, 1e-6, '2 指定假設 inch 時應換算');
  // 認不出來的單位碼要回報
  const weird = D.parse(withUnits(99, ...RECT(10, 10)), {});
  ok(weird.warnings.some(w => w.code === 'unknownUnits'), '2 無法辨識的單位碼要回報');
}

// ============ 3) 圖層過濾 ============
{
  const src = withUnits(4, ...RECT(100, 60, 'OUTLINE'), ...LINE(10, 10, 20, 20, 'NOTES'));
  eq(D.parse(src, {}).segs.length, 5, '3 不過濾時應讀到全部 5 段');
  eq(D.parse(src, { layer: 'OUTLINE' }).segs.length, 4, '3 過濾 OUTLINE 應只剩 4 段');
  eq(D.parse(src, { layer: 'NOTES' }).segs.length, 1, '3 過濾 NOTES 應只剩 1 段');
  eq(D.parse(src, { layer: '不存在' }).segs.length, 0, '3 不存在的層應回 0 段');
  ok(D.parse(src, { layer: '不存在' }).warnings.some(w => w.code === 'noGeometry'), '3 讀不到幾何要警告');
}

// ============ 4) 弧線 ============
{
  // 整圓：起訖點應接得起來，且半徑正確
  const c = D.parse(withUnits(4, '0', 'CIRCLE', '8', '0', '10', '0', '20', '0', '40', '10'), {});
  ok(c.segs.length >= 4, '4 CIRCLE 應轉成多段');
  ok(D.checkClosed(c.segs, 0.01).closed, '4 CIRCLE 轉出來應該是封閉的');
  const rs = c.segs.map(s => Math.hypot(s.x1, s.y1));
  ok(rs.every(v => Math.abs(v - 10) < 1e-6), '4 CIRCLE 每個頂點應落在半徑 10 上');

  // 弦高誤差：容差放寬 → 段數變少
  const coarse = D.parse(withUnits(4, '0', 'CIRCLE', '8', '0', '10', '0', '20', '0', '40', '10'), { sagitta: 1 });
  ok(coarse.segs.length < c.segs.length, '4 弦高容差放寬時段數應變少');

  // ARC：0→90 度，端點要對
  const a = D.parse(withUnits(4, '0', 'ARC', '8', '0', '10', '0', '20', '0', '40', '10', '50', '0', '51', '90'), {});
  const first = a.segs[0], last = a.segs[a.segs.length - 1];
  near(first.x1, 10, 1e-6, '4 ARC 起點 x');
  near(first.y1, 0, 1e-6, '4 ARC 起點 y');
  near(last.x2, 0, 1e-6, '4 ARC 終點 x');
  near(last.y2, 10, 1e-6, '4 ARC 終點 y');
  // 弧上每點半徑一致
  ok(a.segs.every(s => Math.abs(Math.hypot(s.x1, s.y1) - 10) < 1e-6), '4 ARC 每點應落在半徑上');
}

// ============ 5) 聚合線 ============
{
  // LWPOLYLINE：閉合旗標
  const lw = (closed, ...pts) => {
    const rows = ['0', 'LWPOLYLINE', '8', '0', '90', String(pts.length / 2), '70', closed ? '1' : '0'];
    for (let i = 0; i < pts.length; i += 2) rows.push('10', String(pts[i]), '20', String(pts[i + 1]));
    return rows;
  };
  const open = D.parse(withUnits(4, ...lw(false, 0, 0, 10, 0, 10, 10)), {});
  eq(open.segs.length, 2, '5 未閉合的 3 點聚合線應產生 2 段');
  ok(!D.checkClosed(open.segs).closed, '5 未閉合就是未閉合');

  const closed = D.parse(withUnits(4, ...lw(true, 0, 0, 10, 0, 10, 10)), {});
  eq(closed.segs.length, 3, '5 閉合旗標應補上收尾那一段');
  ok(D.checkClosed(closed.segs).closed, '5 閉合旗標的聚合線應封閉');

  // bulge：兩點加半圓 bulge=1，應轉成弧而不是直線
  const rows = ['0', 'LWPOLYLINE', '8', '0', '90', '2', '70', '0',
    '10', '0', '20', '0', '42', '1', '10', '10', '20', '0'];
  const bulged = D.parse(withUnits(4, ...rows), {});
  ok(bulged.segs.length > 1, '5 bulge 應轉成多段弧，不是一條直線');
  const maxOff = Math.max(...bulged.segs.map(s => Math.abs(s.y1)));
  near(maxOff, 5, 0.05, '5 bulge=1 是半圓，弧高應為半徑 5');

  // 舊式 POLYLINE / VERTEX
  const poly = ['0', 'POLYLINE', '8', '0', '70', '1',
    '0', 'VERTEX', '8', '0', '10', '0', '20', '0',
    '0', 'VERTEX', '8', '0', '10', '10', '20', '0',
    '0', 'VERTEX', '8', '0', '10', '10', '20', '10',
    '0', 'SEQEND', '8', '0'];
  const p = D.parse(withUnits(4, ...poly), {});
  eq(p.segs.length, 3, '5 閉合的舊式 POLYLINE 應產生 3 段');
  ok(D.checkClosed(p.segs).closed, '5 舊式 POLYLINE 也要判得出封閉');
}

// ============ 6) 封閉性：板框沒封閉板廠切不出來 ============
{
  // 少一條邊
  const broken = D.parse(withUnits(4, ...LINE(0, 0, 100, 0), ...LINE(100, 0, 100, 60), ...LINE(100, 60, 0, 60)), {});
  const chk = D.checkClosed(broken.segs);
  eq(chk.closed, false, '6 缺一邊應判定未封閉');
  eq(chk.openEnds.length, 2, '6 應指出 2 個開口端點');
  const xs = chk.openEnds.map(p => p.x).sort((a, b) => a - b);
  near(xs[0], 0, 1e-6, '6 開口應在 x=0');
  near(xs[1], 0, 1e-6, '6 兩個開口都在 x=0（起點與終點）');

  // 幾乎接上但差 0.005mm：容差內應視為接上
  const nearly = D.parse(withUnits(4,
    ...LINE(0, 0, 100, 0), ...LINE(100, 0, 100, 60), ...LINE(100, 60, 0, 60), ...LINE(0, 60, 0, 0.005)), {});
  ok(D.checkClosed(nearly.segs, 0.01).closed, '6 差 0.005mm 在 0.01 容差內應視為封閉');
  ok(!D.checkClosed(nearly.segs, 0.001).closed, '6 容差收到 0.001 就應該報未封閉');

  // 分岔點（同一點接三條線）要報出來
  const branch = D.parse(withUnits(4, ...RECT(100, 60), ...LINE(0, 0, -10, -10)), {});
  const bc = D.checkClosed(branch.segs);
  ok(bc.branchPoints.length >= 1, '6 一點接三條線應報分岔');
  eq(bc.closed, false, '6 有懸空端點就不算封閉');
}

// ============ 7) 匯出與來回一趟 ============
{
  const state = {
    boardWidth: 80, boardHeight: 50,
    edgeSegs: [{ x1: -40, y1: -25, x2: 40, y2: -25 }, { x1: 40, y1: -25, x2: 40, y2: 25 },
               { x1: 40, y1: 25, x2: -40, y2: 25 }, { x1: -40, y1: 25, x2: -40, y2: -25 }],
    vias: [{ x: 10, y: 5, od: 0.7, id: 0.3 }]
  };
  const text = D.build(state, {});
  ok(/\$INSUNITS/.test(text) && /\n4\n/.test(text), '7 匯出應標明單位為 mm');
  ok(/Edge_Cuts/.test(text), '7 板框應寫在 Edge_Cuts 層');
  ok(/CIRCLE/.test(text), '7 鑽孔應以 CIRCLE 匯出');
  ok(D.build(state, { holes: false }).indexOf('CIRCLE') < 0, '7 holes:false 時不應匯出鑽孔');

  // 來回一趟：幾何不可跑掉
  const back = D.parse(text, { layer: 'Edge_Cuts' });
  eq(back.segs.length, 4, '7 來回後仍應是 4 段');
  const b2 = D.toBoard(back.segs);
  eq(b2.w, 80, '7 來回後板寬不變');
  eq(b2.h, 50, '7 來回後板高不變');
  ok(D.checkClosed(back.segs).closed, '7 來回後仍應封閉');
  // 每一段都要找得回原來的那一段（含 Y 翻轉，兩次翻回原樣）
  const same = (a, b) => (Math.abs(a.x1 - b.x1) < 1e-6 && Math.abs(a.y1 - b.y1) < 1e-6 &&
                          Math.abs(a.x2 - b.x2) < 1e-6 && Math.abs(a.y2 - b.y2) < 1e-6) ||
                         (Math.abs(a.x1 - b.x2) < 1e-6 && Math.abs(a.y1 - b.y2) < 1e-6 &&
                          Math.abs(a.x2 - b.x1) < 1e-6 && Math.abs(a.y2 - b.y1) < 1e-6);
  const lost = state.edgeSegs.filter(s => !b2.edgeSegs.some(t => same(s, t)));
  eq(lost.length, 0, '7 來回一趟每一段都要對得回去');

  // 沒有 edgeSegs 時用矩形板框
  const rect = D.build({ boardWidth: 20, boardHeight: 10, vias: [] }, {});
  eq(D.parse(rect, { layer: 'Edge_Cuts' }).segs.length, 4, '7 沒有自訂板框時應匯出矩形 4 段');
}

// ============ 8) 壞輸入不可爆 ============
{
  eq(D.parse('', {}).segs.length, 0, '8 空字串應回 0 段');
  eq(D.parse('這不是 DXF', {}).segs.length, 0, '8 亂碼應回 0 段');
  eq(D.parse(dxf('0', 'LINE', '8', '0', '10', 'NaN', '20', '0', '11', '5', '21', '0'), {}).segs.length, 0,
     '8 座標壞掉的線段應被丟掉，不可產生 NaN');
  const noSec = D.parse(['0', 'LINE', '8', '0', '10', '0', '20', '0', '11', '5', '21', '0'].join('\n'), {});
  ok(noSec.warnings.some(w => w.code === 'noEntitiesSection'), '8 沒有 ENTITIES 段要警告但仍嘗試解析');
  eq(D.toBoard([]).edgeSegs.length, 0, '8 空線段陣列不可爆');
  eq(D.checkClosed([]).closed, true, '8 空輸入視為沒有開口');
}

console.log(`\ndxf.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
