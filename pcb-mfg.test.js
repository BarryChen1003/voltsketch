/**
 * pcb-mfg.test.js — 製造功能（淚滴 / 縫合孔 / 鑽孔表 / 拼板）驗證（node，無瀏覽器）
 *
 * 這幾項 EasyEDA 都有。做得出來不難，難的是**做出來能送廠**：
 * 淚滴不能撞到別的網路、縫合孔不能落在別人的銅上、拼板尺寸板廠要做得了。
 * 所以這支測的重點不是「有沒有產生東西」，而是「產生的東西合不合法」。
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

const M = require('./pcb-mfg.js');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL: ' + m); } };
const eq = (a, b, m) => ok(a === b, `${m} (得 ${JSON.stringify(a)}，期望 ${JSON.stringify(b)})`);
const padAbs = (c, p) => ({ x: c.x + p.x, y: c.y + p.y });
const { segDist, inPoly } = M._geom;

// ============ 1) 淚滴 ============
{
  const mk = extra => Object.assign({
    boardWidth: 40, boardHeight: 30, vias: [], keepouts: [],
    components: [{ id: 'u', ref: 'U1', x: 0, y: 0, rot: 0, pads: [{ x: 0, y: 0, w: 2, h: 2, side: 'F', net: 'SIG' }] }],
    traces: [{ x1: 0, y1: 0, x2: 10, y2: 0, width: 0.3, layer: 'F.Cu', net: 'SIG' }]
  }, extra || {});

  const r = M.Teardrops.build(mk(), padAbs, { clearance: 0.15 });
  eq(r.teardrops.length, 1, '1 走線接上同網 pad 應產生 1 顆淚滴');
  const td = r.teardrops[0];
  eq(td.layer, 'F.Cu', '1 淚滴應在走線那一層');
  eq(td.net, 'SIG', '1 淚滴應帶著 net');
  ok(td.pts.length >= 4, '1 淚滴多邊形至少 4 點');

  // 幾何界線：所有點都在 pad 中心到 L 之間，不可超出
  const R = 1, L = R * 2;
  ok(td.pts.every(p => p[0] >= -R - 1e-6 && p[0] <= L + 1e-6), '1 淚滴不可超出 pad 半徑到 L 的範圍');
  ok(td.pts.every(p => Math.abs(p[1]) <= R + 1e-6), '1 淚滴寬度不可超過 pad 半徑');
  // 走線側末端寬度應收斂到線寬。末端那兩點在陣列中間（上緣走到底、下緣反向接回），
  // 不是最後兩個，所以用「x 最大」來挑。
  const tip = td.pts.filter(p => Math.abs(p[0] - L) < 1e-6);
  eq(tip.length, 2, '1 末端應剛好兩點（上下緣各一）');
  ok(Math.abs(Math.abs(tip[0][1] - tip[1][1]) - 0.3) < 1e-6,
     `1 淚滴末端寬度應等於線寬 0.3（得 ${Math.abs(tip[0][1] - tip[1][1]).toFixed(4)}）`);
  // pad 端寬度應等於 pad 直徑（淚滴的用意就是把應力點攤到整個 pad 寬）
  const root = td.pts.filter(p => Math.abs(p[0]) < 1e-6);
  eq(root.length, 2, '1 pad 端應剛好兩點');
  ok(Math.abs(Math.abs(root[0][1] - root[1][1]) - 2 * R) < 1e-6,
     `1 淚滴 pad 端寬度應等於 pad 直徑 ${2 * R}（得 ${Math.abs(root[0][1] - root[1][1]).toFixed(4)}）`);
  // 從 pad 端到走線端寬度必須單調收斂，不可中間鼓出去
  {
    const half = td.pts.length / 2;
    let mono = true;
    for (let i = 1; i < half; i++) if (Math.abs(td.pts[i][1]) > Math.abs(td.pts[i - 1][1]) + 1e-9) mono = false;
    ok(mono, '1 淚滴寬度必須單調收斂');
  }
  // 面積 > 0（多邊形沒有自交塌掉）
  let area = 0;
  for (let i = 0; i < td.pts.length; i++) {
    const a = td.pts[i], b = td.pts[(i + 1) % td.pts.length];
    area += a[0] * b[1] - b[0] * a[1];
  }
  ok(Math.abs(area) / 2 > 0.5, `1 淚滴面積應明顯 >0（得 ${(Math.abs(area) / 2).toFixed(3)}）`);

  // 走線比 pad 粗 → 不需要淚滴
  const wide = mk({ traces: [{ x1: 0, y1: 0, x2: 10, y2: 0, width: 3, layer: 'F.Cu', net: 'SIG' }] });
  eq(M.Teardrops.build(wide, padAbs, {}).teardrops.length, 0, '1 走線比 pad 粗時不應產生淚滴');
  eq(M.Teardrops.build(wide, padAbs, {}).skipped[0].reason, 'traceWiderThanPad', '1 應說明跳過原因');

  // 異網不接：pad 是 SIG、走線是 GND → 不產生
  const other = mk({ traces: [{ x1: 0, y1: 0, x2: 10, y2: 0, width: 0.3, layer: 'F.Cu', net: 'GND' }] });
  eq(M.Teardrops.build(other, padAbs, {}).teardrops.length, 0, '1 異網不可產生淚滴');

  // 層不對：pad 在 F、走線在 B → 不產生
  const layerX = mk({ traces: [{ x1: 0, y1: 0, x2: 10, y2: 0, width: 0.3, layer: 'B.Cu', net: 'SIG' }] });
  eq(M.Teardrops.build(layerX, padAbs, {}).teardrops.length, 0, '1 走線不在 pad 那一面時不可產生淚滴');

  // **合法性**：旁邊擺一顆異網 pad，淚滴會撞到 → 必須跳過而不是硬畫
  const tight = mk();
  tight.components.push({ id: 'x', ref: 'R9', x: 0.9, y: 1.0, rot: 0, pads: [{ x: 0, y: 0, w: 0.6, h: 0.6, side: 'F', net: 'OTHER' }] });
  const rt = M.Teardrops.build(tight, padAbs, { clearance: 0.15 });
  eq(rt.teardrops.length, 0, '1 會撞到異網 pad 時不可產生淚滴');
  eq(rt.skipped[0].reason, 'clearance', '1 跳過原因應為 clearance');
  eq(rt.skipped[0].with, 'pad', '1 應說出撞到什麼');
  // 把它挪遠就該恢復
  tight.components[1].y = 4;
  ok(M.Teardrops.build(tight, padAbs, { clearance: 0.15 }).teardrops.length === 1, '1 障礙挪遠後應恢復產生淚滴');

  // 兩端都接 pad → 兩顆
  const both = mk({
    components: [
      { id: 'a', ref: 'U1', x: 0, y: 0, rot: 0, pads: [{ x: 0, y: 0, w: 2, h: 2, side: 'F', net: 'SIG' }] },
      { id: 'b', ref: 'U2', x: 10, y: 0, rot: 0, pads: [{ x: 0, y: 0, w: 2, h: 2, side: 'F', net: 'SIG' }] }
    ]
  });
  eq(M.Teardrops.build(both, padAbs, {}).teardrops.length, 2, '1 兩端都接 pad 應產生 2 顆');

  // via 也要有淚滴
  const withVia = mk({
    components: [],
    vias: [{ x: 0, y: 0, od: 1.2, id: 0.4, net: 'SIG' }],
    traces: [{ x1: 0, y1: 0, x2: 10, y2: 0, width: 0.3, layer: 'F.Cu', net: 'SIG' }]
  });
  eq(M.Teardrops.build(withVia, padAbs, {}).teardrops.length, 1, '1 via 也應產生淚滴');

  // 走線太短塞不下淚滴 → 跳過並說明
  const shortT = mk({ traces: [{ x1: 0, y1: 0, x2: 0.8, y2: 0, width: 0.3, layer: 'F.Cu', net: 'SIG' }] });
  const rs = M.Teardrops.build(shortT, padAbs, {});
  eq(rs.teardrops.length, 0, '1 走線太短不應硬塞淚滴');
  eq(rs.skipped[0].reason, 'traceTooShort', '1 應說明走線太短');
}

// ============ 2) 縫合孔 ============
{
  // 間距依據：λ = c / (f * sqrt(er))，取 λ/20
  const s = M.Stitch.spacingFor(2.4e9, 4.4, 20);
  ok(Math.abs(s.lambda - 299792458000 / (2.4e9 * Math.sqrt(4.4))) < 1e-6, '2 λ 應為 c/(f·√εr)');
  ok(Math.abs(s.spacing - s.lambda / 20) < 1e-9, '2 間距應為 λ/20');
  ok(Math.abs(s.spacing - 2.98) < 0.05, `2 2.4GHz/εr4.4 間距應約 2.98mm（得 ${s.spacing.toFixed(3)}）`);
  // 頻率變高 → 間距變小；εr 變大 → 間距變小
  ok(M.Stitch.spacingFor(5e9, 4.4, 20).spacing < s.spacing, '2 頻率變高間距應變小');
  ok(M.Stitch.spacingFor(2.4e9, 9, 20).spacing < s.spacing, '2 εr 變大間距應變小');
  eq(M.Stitch.spacingFor(0, 4.4, 20), null, '2 頻率 0 應回 null 不是 Infinity');
  eq(M.Stitch.spacingFor(2.4e9, 0.5, 20), null, '2 εr<1 不合法應回 null');

  const zone = { layer: 'F.Cu', net: 'GND', pts: [[-10, -10], [10, -10], [10, 10], [-10, 10]] };
  const st = {
    boardWidth: 40, boardHeight: 30, keepouts: [],
    components: [{ id: 'u', ref: 'U1', x: 0, y: 0, rot: 0, pads: [{ x: 0, y: 0, w: 4, h: 4, side: 'F', net: 'SIG' }] }],
    traces: [{ x1: -8, y1: 6, x2: 8, y2: 6, width: 0.5, layer: 'F.Cu', net: 'SIG' }],
    vias: []
  };
  const res = M.Stitch.place(st, padAbs, zone, { spacing: 3, clearance: 0.3, viaOd: 0.7, viaDrill: 0.3, margin: 0.5 });
  ok(res.vias.length > 0, '2 應撒得出縫合孔');
  ok(res.vias.every(v => v.net === 'GND'), '2 縫合孔應繼承鋪銅的 net');
  ok(res.vias.every(v => v.stitch === true), '2 縫合孔應標記 stitch');

  // 全部要在鋪銅內、且離邊界夠遠
  const need = 0.35 + 0.3;
  ok(res.vias.every(v => inPoly(v.x, v.y, zone.pts)), '2 縫合孔必須落在鋪銅多邊形內');
  ok(res.vias.every(v => M.Stitch.insideBy(v.x, v.y, zone.pts, need)), '2 縫合孔含淨空必須完全在鋪銅內');

  // 不可壓到 pad 或走線
  ok(res.vias.every(v => Math.hypot(v.x, v.y) >= Math.hypot(4, 4) / 2 + need - 1e-9),
     '2 縫合孔不可壓到 pad（含淨空）');
  ok(res.vias.every(v => segDist(v.x, v.y, -8, 6, 8, 6) >= 0.25 + need - 1e-9),
     '2 縫合孔不可壓到走線（含淨空）');
  // 彼此不可太近
  let tooClose = 0;
  for (let i = 0; i < res.vias.length; i++)
    for (let j = i + 1; j < res.vias.length; j++)
      if (Math.hypot(res.vias[i].x - res.vias[j].x, res.vias[i].y - res.vias[j].y) < 0.7) tooClose++;
  eq(tooClose, 0, '2 縫合孔彼此不可重疊');

  // 禁佈區內不可撒
  const stK = Object.assign({}, st, { keepouts: [{ layer: 'F.Cu', pts: [[-5, -5], [5, -5], [5, 5], [-5, 5]] }] });
  const resK = M.Stitch.place(stK, padAbs, zone, { spacing: 3, clearance: 0.3 });
  ok(resK.vias.every(v => !inPoly(v.x, v.y, stK.keepouts[0].pts)), '2 禁佈區內不可撒縫合孔');
  ok(resK.vias.length < res.vias.length, '2 有禁佈區時數量應變少');

  // 用頻率推間距的路徑要走得通，且與直接給間距一致
  const byFreq = M.Stitch.place(st, padAbs, zone, { freqHz: 2.4e9, er: 4.4, clearance: 0.3 });
  ok(byFreq.basis && Math.abs(byFreq.basis.spacing - s.spacing) < 1e-9, '2 用頻率時應回報推導依據');
  ok(byFreq.vias.length > 0, '2 用頻率推間距也要撒得出來');

  // 參數不合法不可爆
  eq(M.Stitch.place(st, padAbs, zone, {}).vias.length, 0, '2 沒給間距也沒給頻率應回空陣列');
}

// ============ 3) 鑽孔表 ============
{
  const st = {
    vias: [
      { x: 0, y: 0, od: 0.7, id: 0.3 }, { x: 1, y: 0, od: 0.7, id: 0.3 },
      { x: 2, y: 0, od: 0.6, id: 0.25 }
    ],
    components: [{
      id: 'j', ref: 'J1', x: 0, y: 0, rot: 0, pads: [
        { x: 0, y: 0, w: 1.6, h: 1.6, drill: 0.9, side: '*', net: 'A' },
        { x: 2, y: 0, w: 1.6, h: 1.6, drill: 0.9, side: '*', net: 'B' },
        { x: 4, y: 0, w: 3, h: 3, drill: 3.2, type: 'np_thru_hole', side: '*', net: '' }
      ]
    }]
  };
  const t = M.DrillTable.build(st, padAbs, null);
  eq(t.length, 4, '3 應歸成 4 種刀（0.25/0.3/0.9/3.2）');
  eq(t[0].size, 0.25, '3 應由小到大排序');
  eq(t[0].tool, 1, '3 刀號應從 1 開始');
  eq(t[t.length - 1].tool, 4, '3 刀號應連續');
  const t03 = t.find(r => Math.abs(r.size - 0.3) < 1e-9);
  eq(t03.count, 2, '3 0.3mm 應有 2 個孔');
  eq(t03.plated, true, '3 via 應算 PTH');
  const t32 = t.find(r => Math.abs(r.size - 3.2) < 1e-9);
  eq(t32.plated, false, "3 type='np_thru_hole' 的 pad 應算 NPTH");
  eq(t.reduce((a, r) => a + r.count, 0), 6, '3 總孔數應為 6');

  // 比選定板廠下限：過不了的要標出來
  const flagged = M.DrillTable.build(st, padAbs, { minDrill: 0.3 });
  const f025 = flagged.find(r => Math.abs(r.size - 0.25) < 1e-9);
  ok(f025.warn && f025.warn.code === 'belowFabMin', '3 低於板廠下限的刀要標警告');
  ok(flagged.filter(r => r.warn).length === 1, '3 只有真的過不了的那一支要標');
  ok(flagged.find(r => Math.abs(r.size - 0.9) < 1e-9).warn === null, '3 合格的刀不可誤標');

  const txt = M.DrillTable.toText(t, 'test');
  ok(/Tool\s+Size/.test(txt), '3 文字表要有表頭');
  ok(/Total holes: 6/.test(txt), '3 文字表要有總數');
  ok(/T1\s+0\.250/.test(txt), '3 文字表要列出刀號與尺寸');
  ok(/BELOW FAB MIN/.test(M.DrillTable.toText(flagged, 'x')), '3 有警告時文字表要寫出來');

  // 沒有孔的板不可爆
  eq(M.DrillTable.build({ vias: [], components: [] }, padAbs, null).length, 0, '3 沒有孔應回空陣列');
}

// ============ 4) 拼板 ============
{
  const st = { boardWidth: 50, boardHeight: 40 };
  const p = M.Panel.plan(st, { cols: 3, rows: 2, rail: 5, method: 'vcut' });
  eq(p.panelW, 160, '4 3 片寬 + 兩側 5mm 工藝邊 = 160mm');
  eq(p.panelH, 90, '4 2 片高 + 兩側 5mm 工藝邊 = 90mm');
  eq(p.boards, 6, '4 應排 6 片');
  eq(p.placements.length, 6, '4 擺放清單應有 6 筆');
  ok(Math.abs(p.utilization - (6 * 50 * 40) / (160 * 90)) < 1e-9, '4 利用率算式');
  ok(Math.abs(p.utilization - 0.8333) < 0.001, `4 利用率應約 83.3%（得 ${(p.utilization * 100).toFixed(1)}%）`);

  // 每片的位置：不可重疊、要落在拼板內
  for (const a of p.placements) {
    ok(Math.abs(a.dx) + 25 <= 80 + 1e-9, '4 每片都要落在拼板寬度內');
    ok(Math.abs(a.dy) + 20 <= 45 + 1e-9, '4 每片都要落在拼板高度內');
  }
  let overlap = 0;
  for (let i = 0; i < p.placements.length; i++)
    for (let j = i + 1; j < p.placements.length; j++) {
      const a = p.placements[i], b = p.placements[j];
      if (Math.abs(a.dx - b.dx) < 50 - 1e-9 && Math.abs(a.dy - b.dy) < 40 - 1e-9) overlap++;
    }
  eq(overlap, 0, '4 拼板內的板子不可互相重疊');

  // V-Cut：板與板必須相接（gap 一律歸零），切割線要貫穿整片
  const withGap = M.Panel.plan(st, { cols: 2, rows: 1, rail: 0, gap: 3, method: 'vcut' });
  eq(withGap.gap, 0, '4 V-Cut 必須把板間距歸零（刀走直線、不能有縫）');
  eq(withGap.panelW, 100, '4 V-Cut 2 片寬應為 100mm');
  eq(withGap.cuts.length, 1, '4 2×1 無工藝邊應只有 1 條 V-Cut');
  ok(withGap.cuts[0].y1 === -withGap.panelH / 2 && withGap.cuts[0].y2 === withGap.panelH / 2,
     '4 V-Cut 必須貫穿整片拼板');
  eq(p.cuts.length, 7, '4 3×2 帶工藝邊應有 2+1+4 = 7 條 V-Cut');

  // 郵票孔：板間距保留
  const mb = M.Panel.plan(st, { cols: 2, rows: 1, rail: 0, gap: 2, method: 'mousebite' });
  eq(mb.gap, 2, '4 郵票孔應保留板間距');
  eq(mb.panelW, 102, '4 郵票孔 2 片 + 2mm 間距 = 102mm');
  eq(mb.cuts.length, 0, '4 郵票孔不產生 V-Cut 線');

  // 板廠檢查
  const jlc = { layers: {}, tiers: [] };
  const tier = { rules: { board: { minW: 3, minH: 3, maxW: 670, maxH: 600 } } };
  eq(M.Panel.check(p, jlc, tier).filter(i => i.severity === 'error').length, 0, '4 160×90 在 JLCPCB 上限內');
  const huge = M.Panel.plan(st, { cols: 20, rows: 20, rail: 5, method: 'vcut' });
  const iss = M.Panel.check(huge, jlc, tier);
  ok(iss.some(i => i.code === 'panelTooBig'), '4 超過板廠上限要報 panelTooBig');
  // 長邊可以轉 90 度塞進去
  const tall = M.Panel.plan({ boardWidth: 50, boardHeight: 100 }, { cols: 1, rows: 6, rail: 0, method: 'vcut' });
  const tierNarrow = { rules: { board: { maxW: 600, maxH: 1200 } } };
  eq(M.Panel.check(tall, jlc, tierNarrow).filter(i => i.code === 'panelTooBig').length, 0,
     '4 50×600 直放塞不下但轉 90 度可以，不應誤報');
  // 利用率太低要提醒
  const sparse = M.Panel.plan(st, { cols: 1, rows: 1, rail: 30, method: 'vcut' });
  ok(M.Panel.check(sparse, jlc, tier).some(i => i.code === 'lowUtilization'), '4 利用率過低要提醒');
  // V-Cut 帶間距是矛盾設定
  const bad = M.Panel.plan(st, { cols: 2, rows: 1, method: 'vcut' });
  bad.gap = 3;
  ok(M.Panel.check(bad, jlc, tier).some(i => i.code === 'vcutNeedsZeroGap'), '4 V-Cut 有間距要報錯');
}


// ============ 5) 拼板：真的把板面複製出去 ============
{
  const st = {
    boardWidth: 50, boardHeight: 40,
    components: [{ id: 'r1', ref: 'R1', x: 5, y: 5, rot: 0, pads: [{ x: 0, y: 0, w: 1, h: 1, side: 'F', net: 'A' }] }],
    traces: [{ id: 't1', x1: 0, y1: 0, x2: 10, y2: 0, width: 0.3, layer: 'F.Cu', net: 'A' }],
    vias: [{ x: 2, y: 2, od: 0.7, id: 0.3, net: 'A' }],
    userZones: [{ layer: 'F.Cu', net: 'A', pts: [[-5, -5], [5, -5], [5, 5], [-5, 5]], clearance: 0.3 }],
    zones: [], zoneFills: [], keepouts: [], texts: [], teardrops: []
  };
  const plan = M.Panel.plan(st, { cols: 2, rows: 2, rail: 5, method: 'vcut' });
  const pan = M.Panel.apply(st, plan);

  eq(pan.boardWidth, 110, '5 拼板後板寬應為 110mm');
  eq(pan.boardHeight, 90, '5 拼板後板高應為 90mm');
  eq(pan.components.length, 4, '5 元件應複製 4 份');
  eq(pan.traces.length, 4, '5 走線應複製 4 份');
  eq(pan.vias.length, 4, '5 via 應複製 4 份');
  eq(pan.userZones.length, 4, '5 鋪銅應複製 4 份');

  // refdes：第一片保留原名，其餘要能區分（不然 BOM/CPL 會撞號）
  const refs = pan.components.map(c => c.ref);
  eq(refs[0], 'R1', '5 第一片應保留原 refdes');
  eq(new Set(refs).size, 4, '5 四片的 refdes 不可撞號');
  eq(new Set(pan.components.map(c => c.id)).size, 4, '5 元件 id 不可撞號');

  // 座標：每一片都要落在拼板範圍內，而且互不重疊
  const half = { w: pan.boardWidth / 2, h: pan.boardHeight / 2 };
  ok(pan.components.every(c => Math.abs(c.x) <= half.w && Math.abs(c.y) <= half.h), '5 複製後元件應在拼板內');
  ok(pan.traces.every(t => Math.abs(t.x1) <= half.w && Math.abs(t.x2) <= half.w), '5 複製後走線應在拼板內');
  const seen = new Set(pan.components.map(c => c.x + ',' + c.y));
  eq(seen.size, 4, '5 四片的元件座標必須各不相同');

  // 鋪銅多邊形也要跟著位移，不可留在原地
  const zoneCentres = pan.userZones.map(z => z.pts.reduce((a, q) => [a[0] + q[0] / 4, a[1] + q[1] / 4], [0, 0]).map(v => Math.round(v)));
  eq(new Set(zoneCentres.map(c => c.join(','))).size, 4, '5 四份鋪銅的位置必須各不相同');

  // 原始 state 不可被改到（純函式）
  eq(st.components.length, 1, '5 apply 不可改動原始 state');
  eq(st.boardWidth, 50, '5 apply 不可改動原始板寬');

  // 1×1 拼板等於原板加工藝邊
  const one = M.Panel.apply(st, M.Panel.plan(st, { cols: 1, rows: 1, rail: 0, method: 'vcut' }));
  eq(one.components.length, 1, '5 1×1 不應複製');
  eq(one.boardWidth, 50, '5 1×1 無工藝邊時板寬不變');
}

// ============ 6) 郵票孔 ============
{
  const st = { boardWidth: 50, boardHeight: 40 };
  const vc = M.Panel.plan(st, { cols: 2, rows: 2, rail: 5, method: 'vcut' });
  eq(M.Panel.bites(vc).length, 0, '6 V-Cut 不應產生郵票孔（刀直接劃）');

  const mb = M.Panel.plan(st, { cols: 2, rows: 1, rail: 5, gap: 2, method: 'mousebite' });
  const holes = M.Panel.bites(mb, { hole: 0.6, pitch: 1.0, groups: 3, span: 5 });
  ok(holes.length > 0, '6 郵票孔應產生孔');
  eq(holes.length, 5 * 15, '6 3 條垂直縫 + 2 條水平縫 × 每縫 3 組 × 每組 5 孔 = 75');
  ok(holes.every(h => h.d === 0.6), '6 孔徑應照設定');

  // 全部要落在拼板內
  ok(holes.every(h => Math.abs(h.x) <= mb.panelW / 2 + 1e-9 && Math.abs(h.y) <= mb.panelH / 2 + 1e-9),
     '6 郵票孔必須落在拼板範圍內');
  // 同一組內的孔要等距
  const col = holes.filter(h => Math.abs(h.x - holes[0].x) < 1e-9).map(h => h.y).sort((a, b) => a - b);
  const d0 = col[1] - col[0];
  ok(col.slice(1).every((v, i) => Math.abs((v - col[i]) - d0) < 1e-6 || Math.abs(v - col[i]) > d0 + 1e-6),
     '6 同一組內的孔應等距');
  // 孔不可互相重疊
  let dup = 0;
  for (let i = 0; i < holes.length; i++)
    for (let j = i + 1; j < holes.length; j++)
      if (Math.hypot(holes[i].x - holes[j].x, holes[i].y - holes[j].y) < 0.6) dup++;
  eq(dup, 0, '6 郵票孔不可互相重疊');

  // apply 會把郵票孔帶出去
  const st2 = Object.assign({ components: [], traces: [], vias: [], userZones: [], zones: [], zoneFills: [], keepouts: [], texts: [] }, st);
  const panMb = M.Panel.apply(st2, mb);
  ok(panMb.panelBites && panMb.panelBites.length === holes.length, '6 apply 應把郵票孔帶進 state');
  const panVc = M.Panel.apply(st2, vc);
  ok(!panVc.panelBites, '6 V-Cut 拼板不應有郵票孔');
}

console.log(`\npcb-mfg.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
