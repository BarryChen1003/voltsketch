/**
 * pour.test.js — 鋪銅孤島偵測驗證（node，無瀏覽器）
 *
 * 孤島是這個編輯器少數「靜默做出壞板」的地方：跟自己網路斷開的銅，
 * 畫面上跟正常鋪銅一模一樣，DRC 也不報（它沒違反任何間距規則），
 * 但那是一塊浮空的天線。所以這支要證明的是：
 *   ① 真的斷開的抓得到 ② 還連著的不可誤判 ③ 挖除範圍蓋得住孤島本體
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

const P = require('./pcb-pour.js');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL: ' + m); } };
const eq = (a, b, m) => ok(a === b, `${m} (得 ${JSON.stringify(a)}，期望 ${JSON.stringify(b)})`);
const padAbs = (c, p) => ({ x: c.x + p.x, y: c.y + p.y });

const ZONE = { layer: 'F.Cu', net: 'GND', clearance: 0.3, pts: [[-10, -10], [10, -10], [10, 10], [-10, 10]] };
// 下半有一顆 GND pad 當連接點；中間一條 SIG 走線把鋪銅切成上下兩半
const base = () => ({
  components: [{ id: 'g', ref: 'J1', x: 0, y: -8, rot: 0, pads: [{ x: 0, y: 0, w: 1, h: 1, side: 'F', net: 'GND' }] }],
  traces: [{ x1: -12, y1: 0, x2: 12, y2: 0, width: 1.0, layer: 'F.Cu', net: 'SIG' }],
  vias: [], keepouts: []
});
const run = (st, z, o) => P.orphans(st, z || ZONE, padAbs, Object.assign({ res: 0.2 }, o || {}));

// ============ 1) 切開就要抓到 ============
{
  const r = run(base());
  eq(r.stats.blocks, 2, '1 被走線切開應成兩塊');
  eq(r.stats.connected, 1, '1 只有下半接得到 GND');
  eq(r.stats.orphans, 1, '1 上半應判為孤島');
  ok(r.cuts.length > 0, '1 應產生挖除範圍');
  ok(r.stats.orphanAreaMm2 > 100, `1 孤島面積應可觀（得 ${r.stats.orphanAreaMm2}）`);
  ok(r.stats.orphanAreaMm2 < r.stats.totalAreaMm2, '1 孤島面積不可等於全部');

  // 挖除範圍要蓋住孤島本體：上半的點應落在某個挖除矩形內
  const covers = (x, y) => r.cuts.some(c => {
    const xs = c.pts.map(p => p[0]), ys = c.pts.map(p => p[1]);
    return x >= Math.min.apply(null, xs) && x <= Math.max.apply(null, xs) &&
           y >= Math.min.apply(null, ys) && y <= Math.max.apply(null, ys);
  });
  ok(covers(0, 5), '1 上半中心應被挖除範圍蓋住');
  ok(covers(-8, 8), '1 上半角落也要蓋住');
  ok(!covers(0, -5), '1 下半（有連接的那半）不可被挖掉');
  ok(!covers(0, -9), '1 GND pad 附近不可被挖掉');
}

// ============ 2) 還連著的不可誤判 ============
{
  // 上半補一顆 GND via → 兩半都接上
  const st = base();
  st.vias = [{ x: 0, y: 5, od: 0.7, id: 0.3, net: 'GND' }];
  const r = run(st);
  eq(r.stats.connected, 2, '2 兩塊都應判為已連接');
  eq(r.stats.orphans, 0, '2 不可有孤島');
  eq(r.cuts.length, 0, '2 不可產生挖除範圍');

  // 沒有任何切割 → 整塊一體
  const whole = base();
  whole.traces = [];
  const rw = run(whole);
  eq(rw.stats.blocks, 1, '2 沒有切割時應只有一塊');
  eq(rw.stats.orphans, 0, '2 整塊相連不可判孤島');

  // 同網走線不會切開鋪銅
  const sameNet = base();
  sameNet.traces = [{ x1: -12, y1: 0, x2: 12, y2: 0, width: 1.0, layer: 'F.Cu', net: 'GND' }];
  eq(run(sameNet).stats.orphans, 0, '2 同網走線不該切開自己的鋪銅');

  // 別層的走線不影響這一層
  const otherLayer = base();
  otherLayer.traces[0].layer = 'B.Cu';
  eq(run(otherLayer).stats.orphans, 0, '2 別層的走線不可切開這一層的鋪銅');

  // 同網 pad 也算連接點（不是只有 via）
  const padOnly = base();
  padOnly.components.push({ id: 'g2', ref: 'J2', x: 0, y: 8, rot: 0, pads: [{ x: 0, y: 0, w: 1, h: 1, side: 'F', net: 'GND' }] });
  eq(run(padOnly).stats.orphans, 0, '2 上半的同網 pad 應讓它不算孤島');

  // 同網走線也算
  const traceOnly = base();
  traceOnly.traces.push({ x1: -5, y1: 5, x2: 5, y2: 5, width: 0.3, layer: 'F.Cu', net: 'GND' });
  eq(run(traceOnly).stats.orphans, 0, '2 上半的同網走線應讓它不算孤島');
}

// ============ 3) 多個孤島 ============
{
  // 兩條橫線把鋪銅切成三條，只有中間那條有 GND pad
  const st = base();
  st.components[0].y = 0;                                   // GND pad 移到中間
  st.traces = [
    { x1: -12, y1: -5, x2: 12, y2: -5, width: 1.0, layer: 'F.Cu', net: 'SIG' },
    { x1: -12, y1: 5, x2: 12, y2: 5, width: 1.0, layer: 'F.Cu', net: 'SIG' }
  ];
  const r = run(st);
  eq(r.stats.blocks, 3, '3 兩條切線應切成三塊');
  eq(r.stats.orphans, 2, '3 上下兩條都是孤島');
  eq(r.stats.connected, 1, '3 只有中間接得到');
  ok(r.cuts.length >= 2, '3 應為兩個孤島都產生挖除範圍');
}

// ============ 4) 面積門檻 ============
{
  const r = run(base());
  const big = run(base(), null, { minAreaMm2: r.stats.orphanAreaMm2 + 1 });
  eq(big.stats.orphans, 0, '4 門檻高於孤島面積時不應回報');
  eq(big.cuts.length, 0, '4 被門檻濾掉就不該產生挖除範圍');
  const small = run(base(), null, { minAreaMm2: 1 });
  eq(small.stats.orphans, 1, '4 門檻低於孤島面積時仍應回報');
}

// ============ 5) 禁佈區與無網路鋪銅 ============
{
  // 禁佈區也會切開鋪銅
  const st = base();
  st.traces = [];
  st.keepouts = [{ layer: 'F.Cu', pts: [[-12, -1], [12, -1], [12, 1], [-12, 1]] }];
  const r = run(st);
  eq(r.stats.blocks, 2, '5 禁佈區應切開鋪銅');
  eq(r.stats.orphans, 1, '5 禁佈區另一側沒有連接點就是孤島');

  // 無網路的鋪銅：整塊本來就浮空，不做判定（否則會把整塊挖掉）
  const noNet = base();
  const z2 = Object.assign({}, ZONE, { net: '' });
  const r2 = P.orphans(noNet, z2, padAbs, { res: 0.2 });
  eq(r2.stats.orphans, 0, '5 無網路的鋪銅不做孤島判定');
  eq(r2.cuts.length, 0, '5 無網路的鋪銅不可被挖掉');
  eq(r2.stats.skipped, 'noNet', '5 應標明是刻意跳過，而不是「剛好沒有孤島」');
}

// ============ 6) 連通性用 4 連通：對角相接不算連通 ============
{
  // 兩個方向的對角都要測：列優先掃描下，只有「向下」的對角有機會把兩塊併起來，
  // 所以主對角與反對角各放一個測資，才蓋得住 c+nx+1 與 c+nx-1 兩種寫法。
  const grid = { mask: new Uint8Array([1, 0, 0, 1]), nx: 2, ny: 2, x0: 0, y0: 0, res: 1 };
  const l = P.label(grid);
  eq(l.count, 2, '6 主對角相接的兩格不可算同一塊（實體銅在對角處接不牢）');
  eq(P.label({ mask: new Uint8Array([0, 1, 1, 0]), nx: 2, ny: 2, x0: 0, y0: 0, res: 1 }).count, 2,
     '6 反對角相接的兩格也不可算同一塊');
  const grid2 = { mask: new Uint8Array([1, 1, 0, 0]), nx: 2, ny: 2, x0: 0, y0: 0, res: 1 };
  eq(P.label(grid2).count, 1, '6 左右相接算同一塊');
  eq(P.label({ mask: new Uint8Array(4), nx: 2, ny: 2, x0: 0, y0: 0, res: 1 }).count, 0, '6 全空應為 0 塊');
}

// ============ 7) 解析度：講清楚代價 ============
{
  const coarse = run(base(), null, { res: 0.5 });
  const fine = run(base(), null, { res: 0.1 });
  eq(coarse.stats.res, 0.5, '7 應回報用了什麼解析度');
  eq(fine.stats.res, 0.1, '7 解析度可調');
  eq(coarse.stats.orphans, 1, '7 粗解析度也要抓得到明顯的孤島');
  eq(fine.stats.orphans, 1, '7 細解析度結果一致');
  ok(Math.abs(coarse.stats.orphanAreaMm2 - fine.stats.orphanAreaMm2) < 20,
     `7 兩種解析度的孤島面積應接近（${coarse.stats.orphanAreaMm2} vs ${fine.stats.orphanAreaMm2}）`);
}

// ============ 8) apply：整份 state 一次跑完 ============
{
  const st = base();
  st.userZones = [ZONE, Object.assign({}, ZONE, { net: 'GND', pts: [[20, -5], [30, -5], [30, 5], [20, 5]] })];
  const r = P.apply(st, padAbs, { res: 0.3 });
  ok(r.islands >= 1, '8 應找到孤島');
  ok(st.userZones[0].orphanCuts.length > 0, '8 挖除範圍應掛回 zone');
  ok(Array.isArray(st.userZones[1].orphanCuts), '8 每塊鋪銅都要有 orphanCuts 欄位（即使是空的）');
  // 第二塊完全沒有 GND 連接點 → 整塊都是孤島
  ok(st.userZones[1].orphanCuts.length > 0, '8 完全沒有連接點的鋪銅整塊都算孤島');

  // 沒有鋪銅時不可爆
  const empty = P.apply({ userZones: [], components: [], traces: [], vias: [] }, padAbs, {});
  eq(empty.islands, 0, '8 沒有鋪銅時回 0');
}

console.log(`\npour.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
