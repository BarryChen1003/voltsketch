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
require('./pcb-index.js');   // 繞線的節點索引
require('./pcb-rules.js');   // planRipup 要把線丟回 A* 重繞
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

// ---------- 連鎖推擠（planChain）：A 推 B、B 再推 C ----------
// 單輪推擠碰到「B 挪開會撞到 C」就整個放棄——連鎖存在的理由就是這個情況。
// 這一節同時驗「單輪確實會拒絕」與「連鎖確實成功」，
// 只驗其中一邊的話，測不出連鎖有沒有真的做事。
{
  const B = tr({ x1: 0, y1: 0, x2: 20, y2: 0, net: 'B' });
  const C = tr({ x1: 0, y1: 0.35, x2: 20, y2: 0.35, net: 'C' });
  const st = board([B, C]);
  const seg = tr({ x1: 0, y1: -0.35, x2: 20, y2: -0.35, net: 'A' });

  const one = S.plan(st, padAbs, seg, { clearance: CL });
  eq(one.ok, false, '連鎖 1：單輪推擠應該拒絕（B 挪開會撞到 C）');
  ok(String(one.reason).indexOf('wouldBreak') === 0, '連鎖 2：而且理由是「會弄壞別的地方」');

  const ch = S.planChain(st, padAbs, seg, { clearance: CL, depth: 3 });
  ok(ch.ok, '連鎖 3：連鎖推擠應該成功');
  eq(ch.moves.length, 2, '連鎖 4：B 與 C 都要移動');
  ok(ch.rounds >= 2, '連鎖 5：至少兩輪（第二輪才輪到 C）');

  const n = S.apply(st, ch);
  eq(n, 2, '連鎖 6：套用兩條');
  eq(ch.blockers, 2, '連鎖 6b：擋路的要算**相異條數**，不是每輪相加（板上只有 2 條就不能報 4）');
  const need = CL.traceToTrace + 0.3;
  ok(B.y1 - (-0.35) >= need - 1e-6, '連鎖 7：推完之後 seg↔B 間距足夠');
  ok(C.y1 - B.y1 >= need - 1e-6, '連鎖 8：**B↔C 間距也足夠**（沒有把違規往外推一格就算了）');
}

// 連鎖：**使用者剛畫的那一段永遠不可以被推走**
// 呼叫端是「先把新線放進 traces、再推擠」，所以連鎖第二輪起 seg 只是清單裡的一條普通線。
// 沒有保護的話，B 被推開之後會回頭把 A（使用者剛畫完的線）推走——
// 使用者會看到自己剛畫的線自己跑掉，而且完全不知道為什麼。
{
  const A = tr({ x1: -6, y1: -0.25, x2: 6, y2: -0.25, net: 'A' });
  const B = tr({ x1: -9, y1: 0, x2: 9, y2: 0, net: 'B' });
  const C = tr({ x1: -9, y1: 0.35, x2: 9, y2: 0.35, net: 'C' });
  const st = board([A, B, C]);          // A 已經在清單裡（跟真的呼叫端一樣）
  const a0 = A.y1;
  const ch = S.planChain(st, padAbs, A, { clearance: CL, depth: 3 });
  ok(ch.ok, '連鎖 10a：連鎖應該成功');
  ok(!ch.moves.some(m => m.trace === A), '連鎖 10b：計畫裡**不可以**有「移動 A」這一筆');
  eq(ch.moves.length, 2, '連鎖 10b2：只動 B 與 C');
  S.apply(st, ch);
  eq(A.y1, a0, '連鎖 10c：套用之後使用者剛畫的那一段一動也沒動');
  ok(B.y1 - A.y1 >= CL.traceToTrace + 0.3 - 1e-6, '連鎖 10d：而且 B 真的被推開了（證明 10c 不是因為根本沒推）');
  ok(C.y1 - B.y1 >= CL.traceToTrace + 0.3 - 1e-6, '連鎖 10e：C 也被推開');
}

// protect 機制本身（_computeMoves）。
// 上面 10a–10e 那組幾何裡，被推開的線剛好不會回頭推 A，所以那組測不到這個守衛。
// 與其湊一個牽強的幾何，直接測機制：把某條線放進 protect，它就不可以出現在擋路清單裡。
// （這個守衛存在的理由是連鎖第二輪起 seg 只是清單裡的一條普通線，會被當成可推的鄰居。）
{
  const B = tr({ x1: -9, y1: 0.2, x2: 9, y2: 0.2, net: 'B' });
  const st = board([B]);
  const pusher = tr({ x1: -6, y1: 0, x2: 6, y2: 0, net: 'A' });
  const free = S._computeMoves(st, padAbs, pusher, CL, { maxMove: 2 });
  eq(free.moves.length, 1, 'protect 1：沒保護時 B 是擋路的');
  const guarded = S._computeMoves(st, padAbs, pusher, CL, { maxMove: 2, protect: [B] });
  eq(guarded.moves.length, 0, 'protect 2：放進 protect 之後就不可以被當成擋路的');
  eq(guarded.blockers, 0, 'protect 3：也不算進擋路數');
}

// seg **已經在 state.traces 裡**（呼叫端就是先落地再推擠）時，驗證不可以再複製一份：
// 那條線會跟自己的分身距離 0，而沒有 net 的線連 sameNet 都不成立 →
// 每次都判成 wouldBreak，推擠看起來壞掉，實際上是驗證多算了一條。
{
  const A = tr({ x1: -6, y1: -0.25, x2: 6, y2: -0.25, net: '' });
  const B = tr({ x1: -9, y1: 0, x2: 9, y2: 0, net: 'B' });
  const stIn = board([A, B]);
  const rIn = S.plan(stIn, padAbs, A, { clearance: CL });
  ok(rIn.ok, '連鎖 10f：seg 已在清單裡時，單輪推擠仍要成功（不可被自己的分身擋下）');
  eq(rIn.moves.length, 1, '連鎖 10g：推 B 一條');

  // 對照：seg 不在清單裡時本來就會成功——兩邊結果要一致
  const A2 = tr({ x1: -6, y1: -0.25, x2: 6, y2: -0.25, net: '' });
  const B2 = tr({ x1: -9, y1: 0, x2: 9, y2: 0, net: 'B' });
  const stOut = board([B2]);
  const rOut = S.plan(stOut, padAbs, A2, { clearance: CL });
  eq(rIn.ok, rOut.ok, '連鎖 10h：seg 在不在清單裡，結論必須一樣');
  eq(rIn.moves[0].dy.toFixed(4), rOut.moves[0].dy.toFixed(4), '連鎖 10i：位移量也要一樣');
}

// 連鎖：深度不夠就要照實說，不可以套用半套結果
{
  const rows = [];
  for (let i = 0; i < 6; i++) rows.push(tr({ x1: 0, y1: i * 0.35, x2: 20, y2: i * 0.35, net: 'N' + i }));
  const st = board(rows);
  const seg = tr({ x1: 0, y1: -0.35, x2: 20, y2: -0.35, net: 'A' });
  const shallow = S.planChain(st, padAbs, seg, { clearance: CL, depth: 1 });
  eq(shallow.ok, false, '連鎖 9：深度 1 推不完六排，要回失敗');
  // 理由要說「推不完」，不是含糊的「會弄壞東西」——使用者看到前者知道可以調深度，
  // 看到後者只會以為這裡根本推不動。這一條也讓「有沒有做深度檢查」測得出來。
  eq(shallow.reason, 'chain:tooDeep', '連鎖 9b：理由要明確是深度不夠');
  eq(shallow.moves.length, 0, '連鎖 10：失敗時不可以留下半套移動');
  const before = rows.map(t => t.y1).join(',');
  S.apply(st, shallow);
  eq(rows.map(t => t.y1).join(','), before, '連鎖 11：失敗的計畫套用下去要一個位元組都不動');
}

// 連鎖：**收斂了但結果違規** —— 這種情況深度檢查不會叫，只有最後那一次全套驗證擋得住。
// 沒有這一條的話，「連鎖最後有沒有驗證」測不出來（深度檢查會先攔下大部分案例）。
{
  const B = tr({ x1: 0, y1: 0, x2: 20, y2: 0, net: 'B' });
  // 另一個網路的 pad 就在 B 上方一點點：B 被推過去就會撞到它，
  // 而 pad 不是走線，推不動也不會產生下一輪，所以深度檢查永遠不會觸發。
  const st = board([B], {
    components: [{ id: 'U9', x: 10, y: 0.45, pads: [{ num: '1', x: 0, y: 0, w: 0.4, h: 0.4, net: 'P' }] }]
  });
  const seg = tr({ x1: 0, y1: -0.3, x2: 20, y2: -0.3, net: 'A' });
  const ch = S.planChain(st, padAbs, seg, { clearance: CL, depth: 3 });
  eq(ch.ok, false, '連鎖 11b：推開之後會撞到別的網路的 pad → 要拒絕');
  ok(String(ch.reason).indexOf('chain:wouldBreak') === 0, '連鎖 11c：理由是「會弄壞別的地方」');
  eq(ch.moves.length, 0, '連鎖 11d：拒絕時不留半套移動');
}

// 連鎖：端點釘在 pad 上的仍然不可以推（界線跟單輪一致）
{
  const B = tr({ x1: 0, y1: 0, x2: 20, y2: 0, net: 'B' });
  const st = board([B], { components: [{ id: 'U1', x: 0, y: 0, pads: [{ num: '1', x: 0, y: 0, w: 1, h: 1, net: 'B' }] }] });
  const seg = tr({ x1: 0, y1: -0.1, x2: 20, y2: -0.1, net: 'A' });
  const ch = S.planChain(st, padAbs, seg, { clearance: CL, depth: 3 });
  eq(ch.ok, false, '連鎖 12：端點釘在 pad 上的線不可以被連鎖推走');
  ok(String(ch.reason).indexOf('chain:') === 0, '連鎖 13：理由要標明是連鎖階段擋下的');
}

// 連鎖：沒東西擋就什麼都不做（不要無中生有）
{
  const st = board([tr({ x1: 0, y1: 10, x2: 20, y2: 10, net: 'B' })]);
  const seg = tr({ x1: 0, y1: -10, x2: 20, y2: -10, net: 'A' });
  const ch = S.planChain(st, padAbs, seg, { clearance: CL, depth: 3 });
  eq(ch.ok, true, '連鎖 14：沒有擋路的');
  eq(ch.moves.length, 0, '連鎖 15：不動任何東西');
  eq(ch.rounds, 0, '連鎖 16：零輪');
}

// 連鎖：缺規則跟單輪一樣要擋
{
  const st = board([tr({ x1: 0, y1: 0.3, x2: 10, y2: 0.3, net: 'B' })]);
  const ch = S.planChain(st, padAbs, tr({ x1: 0, y1: 0, x2: 10, y2: 0, net: 'A' }), { depth: 3 });
  eq(ch.ok, false, '連鎖 17：沒有間距規則時不可推');
  eq(ch.reason, 'noRules', '連鎖 18：要說明是缺規則');
}

// ---------- 繞路：兩端焊死的平行鄰居 ----------
// 平移對「兩端都卡在 pad 上」的線完全無效，而那是密集板的常態。舊版遇到就回 anchored 放棄，
// 使用者看到的是「推擠沒作用」，其實那條線只要中段鼓一個包就讓得開。
//
// 這一段最重要的兩條：**端點不可以動**（動了就從 pad 上脫落——畫面上還連著、電性已經斷）；
// **繞開 A 不可以撞上 B**（這個功能最容易出、而且看起來最合理的錯）。
{
  const pads = [{ id: 'C1', x: -12, y: 0.35, pads: [{ num: '1', x: 0, y: 0, w: 1, h: 1, side: 'F', net: 'OLD' }] },
                { id: 'C2', x: 12, y: 0.35, pads: [{ num: '1', x: 0, y: 0, w: 1, h: 1, side: 'F', net: 'OLD' }] }];
  const old = tr({ x1: -12, y1: 0.35, x2: 12, y2: 0.35, net: 'OLD' });
  const st = board([old], { components: pads });
  // 新線只在中段跟它靠太近（兩端離得夠遠，繞道的斜邊才有地方擺）
  const seg = tr({ x1: -4, y1: 0, x2: 4, y2: 0, net: 'NEW' });

  const r = S.plan(st, padAbs, seg, { clearance: CL });
  ok(r.ok, '繞路：兩端焊死時要改用繞路，不可以直接放棄');
  ok(r.reroutes && r.reroutes.length === 1, '繞路：一條擋路的線 → 一筆繞路');
  const segs = (r.reroutes && r.reroutes[0] && r.reroutes[0].segments) || [];
  ok(segs.length >= 3, '繞路：至少三段（斜出去、平行過、斜回來）');

  if (segs.length) {
    const a = segs[0], z = segs[segs.length - 1];
    ok(Math.abs(a.x1 - old.x1) < 1e-9 && Math.abs(a.y1 - old.y1) < 1e-9, '繞路：起點原地不動');
    ok(Math.abs(z.x2 - old.x2) < 1e-9 && Math.abs(z.y2 - old.y2) < 1e-9, '繞路：終點原地不動');
    let joined = true;
    for (let i = 0; i + 1 < segs.length; i++) {
      if (Math.hypot(segs[i].x2 - segs[i + 1].x1, segs[i].y2 - segs[i + 1].y1) > 1e-9) joined = false;
    }
    ok(joined, '繞路：每一段首尾相接（有斷口的話畫面看起來連著、實際上斷了）');
    ok(segs.every(x => x.net === 'OLD' && x.layer === old.layer && x.width === old.width),
       '繞路：net／層／線寬沿用原線');
    // 繞出去的方向要遠離新線：新線在 y=0，原線在 y=0.35，所以要往 +y 鼓
    ok(segs.some(x => Math.max(x.y1, x.y2) > old.y1 + 0.1), '繞路：往遠離新線的那一側鼓');
  }

  // 套用之後真的不再違規
  const st2 = board([Object.assign({}, old)], { components: pads });
  const r2 = S.plan(st2, padAbs, seg, { clearance: CL });
  const n = S.apply(st2, r2);
  eq(n, 1, '繞路：apply 回報改了一條');
  ok(st2.traces.length >= 3, '繞路：原線被換成多段');
  const withSeg = Object.assign({}, st2, { traces: st2.traces.concat([seg]) });
  ok(st2.traces.every(t => !S._violation(withSeg, padAbs, t, CL, null)), '繞路：套用後沒有任何一段違規');
}

// ---------- 繞路要拒絕的情況 ----------
{
  const pads = [{ id: 'C1', x: -12, y: 0, pads: [{ num: '1', x: 0, y: 0, w: 1, h: 1, side: 'F', net: 'OLD' }] },
                { id: 'C2', x: 12, y: 0, pads: [{ num: '1', x: 0, y: 0, w: 1, h: 1, side: 'F', net: 'OLD' }] }];
  const old = tr({ x1: -12, y1: 0, x2: 12, y2: 0, net: 'OLD' });

  // 橫穿：同一層上根本繞不開（要換層打 via 才行）。硬繞只會撞到新線本身——
  // 這種情況必須失敗，不可以生出一條「看起來繞開了、其實還壓著」的線。
  const cross = board([old], { components: pads });
  const segCross = tr({ x1: 0, y1: -6, x2: 0, y2: 6, net: 'NEW' });
  const rCross = S.plan(cross, padAbs, segCross, { clearance: CL });
  ok(!rCross.ok, '繞路：同層橫穿無解，要失敗');
  ok(String(rCross.detourReason || '').indexOf('wouldBreak') >= 0, '繞路：失敗理由要說得出是「繞了還是會撞」');

  // 衝突區貼著端點：繞道的斜邊沒地方擺，寧可失敗也不可以把線頭拉離 pad
  const nearEnd = board([old], { components: pads });
  const segEnd = tr({ x1: -11.8, y1: -0.35, x2: -11.4, y2: -0.35, net: 'NEW' });
  const rEnd = S.plan(nearEnd, padAbs, segEnd, { clearance: CL });
  ok(!rEnd.ok, '繞路：衝突區貼著端點時不硬繞');

  // 同一個網路不算擋路（本來就可以碰）
  const same = board([tr({ x1: -12, y1: 0.35, x2: 12, y2: 0.35, net: 'NEW' })], { components: pads });
  const rSame = S.plan(same, padAbs, tr({ x1: -4, y1: 0, x2: 4, y2: 0, net: 'NEW' }), { clearance: CL });
  eq((rSame.reroutes || []).length, 0, '繞路：同網路不繞');
}

// ---------- 推不動也繞不開 → 拆掉重繞 ----------
// 平移與繞路都只在同一層動手腳，所以**同層橫穿**永遠無解：那要換層打 via，
// 而換層是繞線器的事。這一段守「拆掉重繞」這條退路，以及它的驗收條件。
{
  const stack = [{ id: 'F.Cu', kind: 'copper' }, { id: 'B.Cu', kind: 'copper' }];
  // 橫穿：舊線與新線在同一層垂直交叉，兩端都焊在 pad 上（推不動也繞不開）
  const pads = [
    { id: 'a', ref: 'A', x: 0, y: -8, pads: [{ num: '1', x: 0, y: 0, w: 0.8, h: 0.8, side: 'F', net: 'OLD', cu: true }] },
    { id: 'b', ref: 'B', x: 0, y: 8, pads: [{ num: '1', x: 0, y: 0, w: 0.8, h: 0.8, side: 'F', net: 'OLD', cu: true }] }
  ];
  const cross = () => Object.assign(board(
    [tr({ x1: 0, y1: -8, x2: 0, y2: 8, net: 'OLD' })],
    { components: pads.map(p => JSON.parse(JSON.stringify(p))) }
  ), { layerStack: stack.slice(), visibleLayers: ['F.Cu', 'B.Cu'] });

  const seg = tr({ x1: -6, y1: 0, x2: 6, y2: 0, net: 'NEW' });
  const st1 = cross();
  const plain = S.plan(st1, padAbs, seg, { clearance: CL });
  ok(!plain.ok, '前提：同層橫穿推不動也繞不開（不然這一段沒有意義）');
  eq(plain.blockers, 1, '前提：確實有一條擋路');

  const st2 = cross();
  st2.traces.push(seg);
  const rp = S.planRipup(st2, padAbs, seg, CL, { grid: 0.25 });
  ok(rp.ok, '拆掉重繞應該找得到路（可以換層）');
  eq((rp.reroutes || []).length, 1, '只重繞擋路的那一條');
  if (rp.ok) {
    const segs = rp.reroutes[0].segments;
    ok(segs.length >= 1, '重繞後要有走線');
    ok(segs.some(s => s.layer === 'B.Cu') || (rp.reroutes[0].vias || []).length > 0,
      '橫穿只能靠換層解決：要嘛走到另一層、要嘛有 via');
    // 端點不可以跑掉：重繞只換路徑，不換連接點
    const xs = segs.map(s => [s.x1, s.y1, s.x2, s.y2]);
    const hasA = xs.some(a => Math.hypot(a[0] - 0, a[1] + 8) < 0.3 || Math.hypot(a[2] - 0, a[3] + 8) < 0.3);
    const hasB = xs.some(a => Math.hypot(a[0] - 0, a[1] - 8) < 0.3 || Math.hypot(a[2] - 0, a[3] - 8) < 0.3);
    ok(hasA && hasB, '重繞後兩端仍要落在原本的 pad 上');
  }

  // 套用之後：via 要一起放進去，否則那條線在板子上是斷的
  const st3 = cross();
  st3.traces.push(seg);
  const rp3 = S.planRipup(st3, padAbs, seg, CL, { grid: 0.25 });
  if (rp3.ok) {
    const viasBefore = st3.vias.length;
    S.apply(st3, rp3);
    eq(st3.vias.length, viasBefore + (rp3.reroutes[0].vias || []).length, '重繞帶來的 via 要一起套用');
  }

  // 驗收閘門：重繞之後 DRC 變差就要退回。
  // 這裡用「DRC 規則比繞線器用的淨空嚴」來製造那個情況——繞線器找得到路，
  // 但那條路在 DRC 眼裡是違規。沒有這道閘門的話，使用者會看到「已重繞」
  // 而板子上多了幾個他沒做過的違規。
  {
    const st = cross();
    st.traces.push(seg);
    const strict = {
      clearance: { traceToTrace: 3, traceToPad: 3, padToPad: 3, traceToEdge: 0.3, viaToVia: 3, holeToHole: 3 },
      via: { annular: 0.05, drill: 0.2 }
    };
    const gated = S.planRipup(st, padAbs, seg, CL, { grid: 0.25, drcRules: strict });
    eq(gated.ok, false, '重繞後 DRC 變差就要退回');
    eq(gated.reason, 'ripup:drc', '退回的理由要講清楚是 DRC');
  }

  // 沒有擋路的線就不該回報成功（不然呼叫端會以為做了什麼）
  const clean = Object.assign(board([]), { layerStack: stack.slice() });
  eq(S.planRipup(clean, padAbs, seg, CL, {}).reason, 'noBlockers', '沒有擋路的線要回 noBlockers');
}

console.log(`\nshove.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
