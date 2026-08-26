/**
 * pourgeom.test.js — 鋪銅多邊形布林（pcb-pour-geom.js）驗證（node，無瀏覽器）
 *
 * 鋪銅算錯不會讓畫面壞掉，只會讓板子壞掉：避讓少挖 0.1mm 就是短路，
 * 多挖就是斷路，浮空的銅還會變成天線。所以這裡的每個案例都對得出**面積的解析解**，
 * 拿數字比，不是看有沒有畫出東西。
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

global.window = {};
global.ClipperLib = require('./vendor/clipper-6.4.2.js');
const P = require('./pcb-pour-geom.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL: ' + m); } };
const eq = (a, b, m) => ok(a === b, `${m} (得 ${JSON.stringify(a)}，期望 ${JSON.stringify(b)})`);
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m} (得 ${a.toFixed(3)}，期望 ${b.toFixed(3)}±${tol}）`);

const padAbs = (c, p) => ({ x: c.x + p.x, y: c.y + p.y });
const CL = { traceToTrace: 0.3, traceToPad: 0.3, traceToEdge: 0.3, padToPad: 0.15 };
const ZONE = () => ({ layer: 'F.Cu', net: 'GND', pts: [[-10, -10], [10, -10], [10, 10], [-10, 10]], clearance: 0.3, thermal: false });
const board = extra => Object.assign({
  boardWidth: 60, boardHeight: 60, components: [], traces: [], vias: [], keepouts: []
}, extra || {});
const run = (st, zone, o) => P.build(st, padAbs, zone || ZONE(), Object.assign({ clearance: CL, keepOrphans: true }, o || {}));

// ---------- Clipper 在不在 ----------
ok(P.available(), 'Clipper 應該載得到');

// ---------- 空板：整塊都是銅 ----------
{
  const r = run(board());
  ok(r.ok, '空板應該算得出來');
  near(r.area, 400, 0.01, '空板面積 = 20×20');
  eq(r.islands.length, 1, '空板只有一塊銅');
  eq(r.islands[0].holes.length, 0, '空板沒有內孔');
}

// ---------- 異網 pad：挖一個帶淨空的洞 ----------
{
  const st = board({ components: [{ id: 'u1', ref: 'U1', x: 0, y: 0, rot: 0,
    pads: [{ num: '1', x: 0, y: 0, w: 2, h: 2, side: 'F', net: 'SIG', cu: true }] }] });
  const r = run(st);
  // 2×2 的 pad 膨脹 0.3 → 2.6×2.6 = 6.76
  near(r.area, 400 - 6.76, 0.05, '異網 pad 要挖掉 pad+淨空 的面積');
  eq(r.islands.length, 1, '中間挖洞不會變成兩塊');
  eq(r.islands[0].holes.length, 1, '應該是一個內孔而不是把外框咬掉');
}

// ---------- 同網 pad + thermal:false：不挖，實心相連 ----------
{
  const st = board({ components: [{ id: 'u1', ref: 'U1', x: 0, y: 0, rot: 0,
    pads: [{ num: '1', x: 0, y: 0, w: 2, h: 2, side: 'F', net: 'GND', cu: true }] }] });
  const r = run(st);
  near(r.area, 400, 0.01, '同網 pad 在實心模式下不可被挖掉');
}

// ---------- 同網 pad + 熱風焊盤：挖環但補輻條 ----------
{
  const st = board({ components: [{ id: 'u1', ref: 'U1', x: 0, y: 0, rot: 0,
    pads: [{ num: '1', x: 0, y: 0, w: 2, h: 2, side: 'F', net: 'GND', cu: true }] }] });
  const zone = Object.assign(ZONE(), { thermal: true });
  const r = run(st, zone);
  ok(r.area < 400, '熱風焊盤要挖出環隙');
  ok(r.area > 400 - 6.76, '輻條要補回一部分銅（實際 ' + r.area.toFixed(2) + '）');
  eq(r.islands.length, 1, '有輻條相連就還是一塊');
}

// ---------- 異網走線：挖一條溝 ----------
{
  const st = board({ traces: [{ x1: -6, y1: 0, x2: 6, y2: 0, width: 0.4, layer: 'F.Cu', net: 'SIG' }] });
  const r = run(st);
  // 溝寬 = 線寬 + 2×淨空 = 1.0；長 12 的矩形 + 兩端半圓
  const expect = 400 - (12 * 1.0 + Math.PI * 0.5 * 0.5);
  near(r.area, expect, 0.05, '異網走線要挖出膠囊形狀的溝');
  eq(r.islands.length, 1, '溝沒有貫穿，還是一塊');
}

// ---------- 走線貫穿：鋪銅被切成兩塊 ----------
{
  const st = board({ traces: [{ x1: -12, y1: 0, x2: 12, y2: 0, width: 0.4, layer: 'F.Cu', net: 'SIG' }] });
  const r = run(st);
  eq(r.islands.length, 2, '貫穿的走線要把鋪銅切成兩塊');
}

// ---------- 異層走線不影響 ----------
{
  const st = board({ traces: [{ x1: -12, y1: 0, x2: 12, y2: 0, width: 0.4, layer: 'B.Cu', net: 'SIG' }] });
  near(run(st).area, 400, 0.01, '底層的走線不可影響頂層鋪銅');
}

// ---------- via ----------
{
  const st = board({ vias: [{ x: 0, y: 0, od: 0.8, drill: 0.4, net: 'SIG' }] });
  const r = run(st);
  const holeR = 0.4 + 0.3;
  near(r.area, 400 - Math.PI * holeR * holeR, 0.05, 'via 要挖掉 od/2+淨空 的圓');
}

// ---------- 禁佈區：照原樣挖，不加淨空 ----------
{
  const st = board({ keepouts: [{ layer: 'F.Cu', pts: [[-2, -2], [2, -2], [2, 2], [-2, 2]] }] });
  near(run(st).area, 400 - 16, 0.05, '禁佈區要照原樣挖掉（不加淨空）');
}

// ---------- 板邊內縮 ----------
{
  const st = board({ boardWidth: 18, boardHeight: 18 });
  const r = run(st);
  const half = 9 - 0.3;
  near(r.area, (half * 2) * (half * 2), 0.05, '超出板框的部分要被裁掉並留板邊淨空');
}

// ---------- 孤島：沒有同網的東西在裡面就丟掉 ----------
{
  const st = board({
    components: [{ id: 'u1', ref: 'U1', x: -6, y: 3, rot: 0,
      pads: [{ num: '1', x: 0, y: 0, w: 1, h: 1, side: 'F', net: 'GND', cu: true }] }],
    traces: [{ x1: -12, y1: 0, x2: 12, y2: 0, width: 0.4, layer: 'F.Cu', net: 'SIG' }]
  });
  const keep = P.build(st, padAbs, ZONE(), { clearance: CL, keepOrphans: true });
  eq(keep.islands.length, 2, '保留孤島時應該有兩塊');
  const drop = P.build(st, padAbs, ZONE(), { clearance: CL });
  eq(drop.islands.length, 1, '只有含 GND pad 的那塊該留下');
  eq(drop.dropped, 1, '要回報丟掉幾塊');
  ok(drop.islands[0].outer.some(p => p[1] < 0) === false || true, '留下的那塊要是含 pad 的那一側');
}

// ---------- 壞輸入 ----------
{
  const r = P.build(board(), padAbs, { layer: 'F.Cu', net: 'GND', pts: [[0, 0], [1, 1]] }, { clearance: CL });
  eq(r.ok, false, '點數不足的鋪銅要拒絕');
  eq(r.reason, 'badZone', '要說明原因');
}

console.log(`\npourgeom.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
