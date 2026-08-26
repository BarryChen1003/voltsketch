/**
 * shove.test.js — 推擠（pcb-shove.js）驗證（node，無瀏覽器）
 *
 * 推擠最危險的失敗不是「推不動」，是「推動了但把別的地方弄壞」，
 * 而且弄壞的地方不一定在畫面中央。所以這裡的重點是**不該推的時候不要推**：
 * 端點卡在 pad/via 上、推出去會撞到別人、推的距離太誇張，都要照實回報失敗。
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

global.window = {};
require('./pcb-drc.js');
const S = require('./pcb-shove.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL: ' + m); } };
const eq = (a, b, m) => ok(a === b, `${m} (得 ${JSON.stringify(a)}，期望 ${JSON.stringify(b)})`);

const padAbs = (c, p) => ({ x: c.x + p.x, y: c.y + p.y });
const CL = { traceToTrace: 0.15, traceToPad: 0.15, padToPad: 0.15, traceToEdge: 0.3, viaToVia: 0.15, holeToHole: 0.25 };
const tr = (o) => Object.assign({ width: 0.3, layer: 'F.Cu' }, o);
const board = (traces, extra) => Object.assign({
  boardWidth: 60, boardHeight: 40, components: [], vias: [], keepouts: [], traces
}, extra || {});

// ---------- 基本：平行的鄰居要被推開 ----------
{
  const st = board([tr({ x1: -10, y1: 0.3, x2: 10, y2: 0.3, net: 'OLD' })]);
  const seg = tr({ x1: -10, y1: 0, x2: 10, y2: 0, net: 'NEW' });
  const r = S.plan(st, padAbs, seg, { clearance: CL });
  ok(r.ok, '平行鄰居應該推得開');
  eq(r.blockers, 1, '應該只有一條擋路');
  ok(r.moves[0].dy > 0, '要往遠離新線的那一側推（實際 dy=' + r.moves[0].dy.toFixed(3) + '）');
  const n = S.apply(st, r);
  eq(n, 1, '套用後應移動一條');
  const gap = st.traces[0].y1 - 0 - 0.15 - 0.15;
  ok(gap >= CL.traceToTrace - 1e-9, '推開後淨距要達標（實際 ' + gap.toFixed(3) + '）');
}

// ---------- 沒有人擋路就不要亂動 ----------
{
  const st = board([tr({ x1: -10, y1: 5, x2: 10, y2: 5, net: 'OLD' })]);
  const r = S.plan(st, padAbs, tr({ x1: -10, y1: 0, x2: 10, y2: 0, net: 'NEW' }), { clearance: CL });
  ok(r.ok, '沒擋路時回成功');
  eq(r.blockers, 0, '沒擋路時 blockers 為 0');
  eq(r.moves.length, 0, '沒擋路時不產生移動');
}

// ---------- 同 net 不算擋路（本來就要接在一起）----------
{
  const st = board([tr({ x1: -10, y1: 0.2, x2: 10, y2: 0.2, net: 'SAME' })]);
  const r = S.plan(st, padAbs, tr({ x1: -10, y1: 0, x2: 10, y2: 0, net: 'SAME' }), { clearance: CL });
  eq(r.blockers, 0, '同 net 不算擋路');
}

// ---------- 異層不算擋路 ----------
{
  const st = board([tr({ x1: -10, y1: 0.2, x2: 10, y2: 0.2, net: 'OLD', layer: 'B.Cu' })]);
  const r = S.plan(st, padAbs, tr({ x1: -10, y1: 0, x2: 10, y2: 0, net: 'NEW' }), { clearance: CL });
  eq(r.blockers, 0, '異層不算擋路');
}

// ---------- 端點卡在 pad 上 → 不可推（推了就斷線）----------
{
  const st = board([tr({ x1: -10, y1: 0.3, x2: 10, y2: 0.3, net: 'OLD' })], {
    components: [{ id: 'u1', ref: 'U1', x: -10, y: 0.3, rot: 0,
      pads: [{ num: '1', x: 0, y: 0, w: 1, h: 1, side: 'F', net: 'OLD', cu: true }] }]
  });
  const r = S.plan(st, padAbs, tr({ x1: -10, y1: 0, x2: 10, y2: 0, net: 'NEW' }), { clearance: CL });
  eq(r.ok, false, 'pad 上的端點不可被推走');
  eq(r.reason, 'anchored', '要說明是因為端點被釘住');
  eq(r.moves.length, 0, '失敗時不可留下半套移動');
}

// ---------- 端點卡在 via 上 → 同理 ----------
{
  const st = board([tr({ x1: -10, y1: 0.3, x2: 10, y2: 0.3, net: 'OLD' })], {
    vias: [{ x: 10, y: 0.3, od: 0.7, drill: 0.3, net: 'OLD' }]
  });
  const r = S.plan(st, padAbs, tr({ x1: -10, y1: 0, x2: 10, y2: 0, net: 'NEW' }), { clearance: CL });
  eq(r.ok, false, 'via 上的端點不可被推走');
  eq(r.reason, 'anchored', 'via 也算釘住');
}

// ---------- 推出去會撞到第三條 → 不可推 ----------
{
  const st = board([
    tr({ x1: -10, y1: 0.3, x2: 10, y2: 0.3, net: 'OLD' }),
    tr({ x1: -10, y1: 0.75, x2: 10, y2: 0.75, net: 'THIRD' })
  ]);
  const r = S.plan(st, padAbs, tr({ x1: -10, y1: 0, x2: 10, y2: 0, net: 'NEW' }), { clearance: CL });
  eq(r.ok, false, '推出去會撞到第三條就不可推');
  ok(String(r.reason).indexOf('wouldBreak') === 0, '要說明是會撞到別的東西（實際 ' + r.reason + '）');
  eq(st.traces[0].y1, 0.3, '失敗時原本的線不可被動到');
}

// ---------- 推出去會壓到 pad → 不可推 ----------
{
  const st = board([tr({ x1: -10, y1: 0.3, x2: 10, y2: 0.3, net: 'OLD' })], {
    components: [{ id: 'u2', ref: 'U2', x: 0, y: 0.9, rot: 0,
      pads: [{ num: '1', x: 0, y: 0, w: 1, h: 1, side: 'F', net: 'OTHER', cu: true }] }]
  });
  const r = S.plan(st, padAbs, tr({ x1: -10, y1: 0, x2: 10, y2: 0, net: 'NEW' }), { clearance: CL });
  eq(r.ok, false, '推出去會壓到別人的 pad 就不可推');
}

// ---------- 要推的距離太遠 → 拒絕 ----------
{
  const st = board([tr({ x1: -10, y1: 0.05, x2: 10, y2: 0.05, net: 'OLD' })]);
  const r = S.plan(st, padAbs, tr({ x1: -10, y1: 0, x2: 10, y2: 0, net: 'NEW' }), { clearance: CL, maxMove: 0.1 });
  eq(r.ok, false, '超過 maxMove 要拒絕');
  eq(r.reason, 'tooFar', '要說明是距離太遠');
}

// ---------- 同 net 接在端點上的線要跟著走（否則自己的網路被扯斷）----------
{
  const st = board([
    tr({ x1: -10, y1: 0.3, x2: 12, y2: 0.3, net: 'OLD' }),
    tr({ x1: 12, y1: 0.3, x2: 16, y2: 6, net: 'OLD' })
  ]);
  const r = S.plan(st, padAbs, tr({ x1: -10, y1: 0, x2: 10, y2: 0, net: 'NEW' }), { clearance: CL });
  ok(r.ok, '有同 net 續線時仍應推得開');
  eq(r.moves[0].followers.length, 1, '續線要被列為跟著走的');
  S.apply(st, r);
  const a = st.traces[0], b = st.traces[1];
  ok(Math.abs(b.x1 - a.x2) < 1e-9 && Math.abs(b.y1 - a.y2) < 1e-9,
     '推完之後兩條仍要接在同一點（實際 ' + b.x1.toFixed(2) + ',' + b.y1.toFixed(2) + ' vs ' + a.x2.toFixed(2) + ',' + a.y2.toFixed(2) + '）');
}

// ---------- 規則沒給就不要亂猜 ----------
{
  const st = board([tr({ x1: -10, y1: 0.3, x2: 10, y2: 0.3, net: 'OLD' })]);
  const r = S.plan(st, padAbs, tr({ x1: -10, y1: 0, x2: 10, y2: 0, net: 'NEW' }), {});
  eq(r.ok, false, '沒有間距規則時不可推');
  eq(r.reason, 'noRules', '要說明是缺規則');
}

console.log(`\nshove.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
