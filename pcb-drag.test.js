/**
 * pcb-drag.test.js — 整條走線拖曳 ＋ 對齊輔助線（pcb-drag.js）
 *
 * 拖整段最惡的失敗是**無聲斷線**：把壓在 pad 上的那一端跟著拖走，
 * 畫面上線還在、只是不再碰到 pad——DRC 不會叫（那不是違規，只是沒接），
 * 飛線會多一條但很容易被當成本來就沒繞完。所以第 2、3 節整整兩節在守
 * 「pad 那一端不可以被拖走」與「鄰居要跟著拉長」。
 *
 * 對齊輔助線的重點在**不要一次畫五條**：每個軸只留最近的那一條，
 * 否則畫面上滿滿的線跟沒有輔助線一樣沒用。
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

global.window = {};
const D = require('./pcb-drag.js');

let pass = 0, fail = 0;
function eq(a, b, msg) {
  const okk = JSON.stringify(a) === JSON.stringify(b);
  if (okk) pass++; else { fail++; console.error(`FAIL ${msg}\n  expected ${JSON.stringify(b)}\n  got      ${JSON.stringify(a)}`); }
}
const ok = (v, msg) => eq(!!v, true, msg);
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg} (得 ${a}，期望 ${b}±${tol})`);

const seg = (x1, y1, x2, y2, o) => Object.assign({ x1, y1, x2, y2, width: 0.3, layer: 'F.Cu', net: 'N1' }, o || {});
const padAbs = (c, p) => ({ x: c.x + (p.x || 0), y: c.y + (p.y || 0) });
const comp = (x, y, net) => ({ id: 'U1', x, y, pads: [{ num: '1', x: 0, y: 0, w: 1, h: 1, net: net || 'N1' }] });

// ---- 1. anchorAt ----
{
  const st = { components: [comp(10, 10)], vias: [{ x: 30, y: 30, od: 0.6, net: 'N1' }], traces: [] };
  eq(D.anchorAt(st, padAbs, 10, 10).kind, 'pad', '1.1 壓在 pad 上');
  eq(D.anchorAt(st, padAbs, 30, 30).kind, 'via', '1.2 壓在 via 上');
  eq(D.anchorAt(st, padAbs, 50, 50), null, '1.3 空曠處');
  // pad 有大小，稍微偏一點還是算壓在上面
  eq(D.anchorAt(st, padAbs, 10.3, 10).kind, 'pad', '1.4 pad 半徑內都算');
  // cu:false 的 pad 不是接線點
  const noCu = { components: [{ id: 'M1', x: 10, y: 10, pads: [{ num: '1', x: 0, y: 0, w: 1, h: 1, cu: false }] }], vias: [], traces: [] };
  eq(D.anchorAt(noCu, padAbs, 10, 10), null, '1.5 非銅 pad（機構孔）不算接線點');
}

// ---- 2. 計畫：鄰居要跟著、pad 那一端要補線 ----
{
  // pad(10,10) —A— (20,10) —B— (30,10) —C— pad(40,10)
  const A = seg(10, 10, 20, 10), B = seg(20, 10, 30, 10), C = seg(30, 10, 40, 10);
  const st = { components: [comp(10, 10), Object.assign(comp(40, 10), { id: 'U2' })], vias: [], traces: [A, B, C] };

  const pB = D.plan(st, padAbs, B);
  eq(pB.ok, true, '2.1 中間那段拖得動');
  eq(pB.stretch.length, 2, '2.2 兩端各有一個鄰居要跟著拉長');
  eq(pB.stubs.length, 0, '2.3 中間那段兩端都沒壓在 pad 上，不必補線');

  const pA = D.plan(st, padAbs, A);
  eq(pA.stubs.map(s => s.end + ':' + s.kind), ['a:pad'], '2.4 靠 pad 那一端要補線');
  eq(pA.stretch.length, 1, '2.5 另一端有鄰居 B');

  // 只有一段、兩端都在 pad 上：兩端都要補
  const solo = seg(10, 10, 40, 10);
  const st2 = { components: [comp(10, 10), Object.assign(comp(40, 10), { id: 'U2' })], vias: [], traces: [solo] };
  eq(D.plan(st2, padAbs, solo).stubs.length, 2, '2.6 兩端都在 pad 上 → 兩端都補（不是拒絕拖曳）');

  // 不同層的線不算鄰居
  const other = seg(20, 10, 20, 40, { layer: 'B.Cu' });
  const st3 = { components: [], vias: [], traces: [B, other] };
  eq(D.plan(st3, padAbs, B).stretch.length, 0, '2.7 不同層的端點重合不算鄰居');

  eq(D.plan(st, padAbs, null).ok, false, '2.8 null');
  eq(D.plan(st, padAbs, seg(5, 5, 5, 5)).reason, 'zeroLength', '2.9 零長度');
}

// ---- 3. 套用：**pad 那一端不可以被拖走** ----
{
  const A = seg(10, 10, 20, 10), B = seg(20, 10, 30, 10);
  const st = { components: [comp(10, 10)], vias: [], traces: [A, B] };
  const pl = D.plan(st, padAbs, A);
  const r = D.apply(st, pl, 0, 5);

  eq([A.x1, A.y1, A.x2, A.y2], [10, 15, 20, 15], '3.1 被拖的那段整段移動');
  eq([B.x1, B.y1], [20, 15], '3.2 鄰居的共用端點跟著走（不然接點裂開）');
  eq([B.x2, B.y2], [30, 10], '3.3 鄰居的另一端不動（所以是拉長不是平移）');
  eq(r.added, 1, '3.4 補了一段回 pad');
  const stub = st.traces.find(t => t.stub);
  eq([stub.x1, stub.y1, stub.x2, stub.y2], [10, 10, 10, 15], '3.5 補的那段從 **pad 原位** 拉到新位置');
  eq([stub.net, stub.layer, stub.width], ['N1', 'F.Cu', 0.3], '3.6 補的線屬性跟原線一樣（不然 DRC 與匯出當成另一件事）');

  // 反例守衛：沒有補線的話，pad 就真的斷了。這條證明 3.5 測到的是補線而不是巧合。
  const st4 = { components: [comp(10, 10)], vias: [], traces: [seg(10, 10, 20, 10)] };
  const t4 = st4.traces[0];
  const pl4 = D.plan(st4, padAbs, t4);
  pl4.stubs = [];                                  // 假裝不補
  D.apply(st4, pl4, 0, 5);
  eq(st4.traces.length, 1, '3.7 不補線時就只剩那一段');
  ok(!D.anchorAt(st4, padAbs, t4.x1, t4.y1), '3.8 而且它已經不碰 pad 了（＝無聲斷線，補線就是在防這個）');

  // 沒有位移就不要補一條零長度的線
  const st5 = { components: [comp(10, 10)], vias: [], traces: [seg(10, 10, 20, 10)] };
  eq(D.apply(st5, D.plan(st5, padAbs, st5.traces[0]), 0, 0).added, 0, '3.9 沒移動就不補');
  eq(D.apply(st5, { ok: false }, 1, 1).added, 0, '3.10 計畫不成立就什麼都不做');
}

// ---- 4. via 也是接線點 ----
{
  const t = seg(30, 30, 50, 30);
  const st = { components: [], vias: [{ x: 30, y: 30, od: 0.6, net: 'N1' }], traces: [t] };
  const pl = D.plan(st, padAbs, t);
  eq(pl.stubs.map(s => s.kind), ['via'], '4.1 via 端也要補線');
  D.apply(st, pl, 3, 0);
  const stub = st.traces.find(x => x.stub);
  eq([stub.x1, stub.y1], [30, 30], '4.2 補線從 via 原位出發');
}

// ---- 5. 對齊輔助線 ----
{
  const st = {
    components: [comp(10, 10)],
    vias: [{ x: 40, y: 25, od: 0.6 }],
    traces: [seg(60, 80, 70, 80)]
  };
  eq(D.guides(st, padAbs, { x: 10.05, y: 99 }).map(g => g.axis + '@' + g.at), ['x@10'], '5.1 x 對齊 pad');
  eq(D.guides(st, padAbs, { x: 99, y: 25.05 }).map(g => g.axis + '@' + g.at), ['y@25'], '5.2 y 對齊 via');
  eq(D.guides(st, padAbs, { x: 10.02, y: 25.02 }).map(g => g.axis).sort(), ['x', 'y'], '5.3 兩軸同時對齊');
  eq(D.guides(st, padAbs, { x: 55, y: 55 }).length, 0, '5.4 沒對齊就不要畫線');
  eq(D.guides(st, padAbs, { x: 0.05, y: 0.05 }).map(g => g.kind), ['center', 'center'], '5.5 板框中心也是對齊目標');

  // 每個軸只留最近的一條——一次畫五條跟沒有一樣
  const many = { components: [comp(10, 10), Object.assign(comp(10.1, 40), { id: 'U2' }), Object.assign(comp(10.05, 60), { id: 'U3' })], vias: [], traces: [] };
  // 取樣點 10.06：離 10 是 0.06、離 10.1 是 0.04、離 10.05 是 0.01。
  // 故意讓「最近的」不是清單裡第一個，否則這一條測不出排序有沒有做。
  const gs = D.guides(many, padAbs, { x: 10.06, y: 99 });
  eq(gs.length, 1, '5.6 三個候選也只回一條');
  eq(gs[0].at, 10.05, '5.7 而且是**最近**的那一個，不是第一個找到的');

  // 不要跟自己對齊
  const self = seg(20, 20, 30, 20);
  const st2 = { components: [], vias: [], traces: [self] };
  eq(D.guides(st2, padAbs, { x: 20, y: 99 }, { skip: self }).length, 0, '5.8 skip 掉自己');
  eq(D.guides(st2, padAbs, { x: 20, y: 99 }).length, 1, '5.9 沒 skip 時就會對到（證明 5.8 測到的是 skip）');

  eq(D.guides({}, padAbs, { x: 1, y: 1 }).length, 0, '5.10 空 state 只剩中心，1,1 不對齊');
}

// ---- 6. 吸附到輔助線 ----
{
  eq(D.snapToGuides({ x: 10.02, y: 5 }, [{ axis: 'x', at: 10 }]), { x: 10, y: 5 }, '6.1 真的貼過去（不是只畫線騙人）');
  eq(D.snapToGuides({ x: 1, y: 2 }, []), { x: 1, y: 2 }, '6.2 沒輔助線就不動');
  eq(D.snapToGuides({ x: 1, y: 2 }, null), { x: 1, y: 2 }, '6.3 null');
  eq(D.snapToGuides({ x: 1, y: 2 }, [{ axis: 'x', at: 9 }, { axis: 'y', at: 8 }]), { x: 9, y: 8 }, '6.4 兩軸都吸');
}

console.log(`\npcb-drag.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
