/**
 * pcb-arc.test.js — 圓弧幾何驗證（node）
 *
 * 對解析解比對。圓弧的好處就是幾乎每個量都有閉式解：
 *   半徑 1 的四分之一圓，弧長 = π/2
 *   圓心到弧上任一點 = r
 *   圓外一點到圓的距離 = |到圓心距離 − r|（前提是投影落在弧上）
 *   與圓相切的直線到弧的距離 = 0
 *
 * 細分誤差也要驗：宣稱「弦高 ≤ tol」就要真的量一次最大弦高。
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

const A = require('./pcb-arc.js');

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

const PI = Math.PI;
// 單位圓上的四分之一圓：(1,0) → (0,1)，逆時針
const Q = A.fromCenter(0, 0, 1, 0, 0, 1, true);

// ---- 1. 建構 ----
{
  near(Q.r, 1, 1e-12, '1.1 半徑 1');
  near(Q.a0, 0, 1e-12, '1.2 起始角 0');
  near(Q.sweep, PI / 2, 1e-12, '1.3 掃過 90 度');
  near(A.length(Q), PI / 2, 1e-12, '1.4 弧長 = rθ = π/2（解析解）');
  eq(A.startPt(Q).map(v => Math.round(v * 1e9) / 1e9), [1, 0], '1.5 起點');
  eq(A.endPt(Q).map(v => Math.round(v * 1e9) / 1e9), [0, 1], '1.6 終點');
}
{
  // 順時針：(0,1) → (1,0)，掃過的應該還是 90 度（建構時換方向讓 a1 > a0）
  const cw = A.fromCenter(0, 0, 0, 1, 1, 0, false);
  near(cw.sweep, PI / 2, 1e-12, '1.7 順時針也是 90 度');
  near(A.length(cw), PI / 2, 1e-12, '1.8 弧長一樣');
}
{
  // 整圓
  const full = A.fromCenter(0, 0, 1, 0, 1, 0, true);
  near(full.sweep, 2 * PI, 1e-9, '1.9 起訖同點＝整圓');
  near(A.length(full), 2 * PI, 1e-9, '1.10 整圓周長 2πr');
}

// ---- 2. 三點定弧 ----
{
  // (1,0) → (√2/2, √2/2) → (0,1)：單位圓的四分之一
  const a = A.from3(1, 0, Math.SQRT1_2, Math.SQRT1_2, 0, 1);
  ok(a, '2.1 三點定得出弧');
  near(a.cx, 0, 1e-9, '2.2 圓心 x = 0');
  near(a.cy, 0, 1e-9, '2.3 圓心 y = 0');
  near(a.r, 1, 1e-9, '2.4 半徑 1');
  near(a.sweep, PI / 2, 1e-9, '2.5 掃過 90 度');
}
{
  eq(A.from3(0, 0, 1, 1, 2, 2), null, '2.6 三點共線回 null（那是線段不是弧）');
  eq(A.from3(0, 0, 1, 0, 2, 0), null, '2.7 水平共線也是 null');
}
{
  // 反方向的三點：中點在另一側
  const a = A.from3(1, 0, -Math.SQRT1_2, -Math.SQRT1_2, 0, 1);
  near(a.r, 1, 1e-9, '2.8 反向弧半徑仍是 1');
  near(a.sweep, 3 * PI / 2, 1e-9, '2.9 走的是大弧（270 度）');
}

// ---- 3. 點到弧：精確解 ----
{
  // 圓外一點，投影落在弧上
  near(A.ptArcDist(2, 0, Q), 1, 1e-12, '3.1 (2,0) 到單位圓弧 = 2 − 1 = 1');
  near(A.ptArcDist(0, 3, Q), 2, 1e-12, '3.2 (0,3) 距離 = 3 − 1 = 2');
  near(A.ptArcDist(Math.SQRT1_2 * 5, Math.SQRT1_2 * 5, Q), 4, 1e-12, '3.3 45 度方向 5 倍距離 = 4');
  // 圓內一點
  near(A.ptArcDist(0.5, 0, Q), 0.5, 1e-12, '3.4 圓內 (0.5,0) 距離 = 1 − 0.5');
  near(A.ptArcDist(0, 0, Q), 1, 1e-12, '3.5 圓心到弧 = r');
  // 弧上的點
  near(A.ptArcDist(1, 0, Q), 0, 1e-12, '3.6 弧的起點距離 0');
  near(A.ptArcDist(Math.SQRT1_2, Math.SQRT1_2, Q), 0, 1e-12, '3.7 弧中點距離 0');
}
{
  // 投影落在弧外 → 取端點。(2,-2) 的角度是 -45°，不在 [0°,90°] 內
  const d = A.ptArcDist(2, -2, Q);
  near(d, Math.hypot(2 - 1, -2 - 0), 1e-12, '3.8 投影落在弧外時取較近的端點（起點 (1,0)）');
  // (-2, 2) 角度 135°，也在弧外 → 取終點 (0,1)
  near(A.ptArcDist(-2, 2, Q), Math.hypot(-2 - 0, 2 - 1), 1e-12, '3.9 另一側取終點');
}

// ---- 4. 細分：誤差要真的在容差內 ----
{
  for (const tol of [0.1, 0.01, 0.001]) {
    const pts = A.toPoints(Q, tol);
    // 實測每一段的弦高：段中點到圓的距離
    let worst = 0;
    for (let i = 1; i < pts.length; i++) {
      const mx = (pts[i - 1][0] + pts[i][0]) / 2, my = (pts[i - 1][1] + pts[i][1]) / 2;
      worst = Math.max(worst, Math.abs(1 - Math.hypot(mx, my)));
    }
    ok(worst <= tol + 1e-12, `4.x tol=${tol} 時實測最大弦高 ${worst.toExponential(2)} ≤ 容差`);
    ok(worst >= tol / 8, `4.x tol=${tol} 時沒有過度細分（實測 ${worst.toExponential(2)}）`);
  }
}
{
  const n = A.segCount(Q, 0.001);
  near(A.chordError(Q, n), 0.001, 0.001, '4.7 宣稱的弦高上界與容差同一量級');
  ok(A.chordError(Q, n) <= 0.001 + 1e-12, '4.8 宣稱的上界確實不超過容差');
  ok(A.segCount(Q, 10) === 1, '4.9 容差比半徑大時一段就夠');
  ok(A.toSegments(Q, 0.01).length === A.toPoints(Q, 0.01).length - 1, '4.10 段數 = 點數 − 1');
}

// ---- 5. 弧到線段 ----
{
  // 與圓相切的直線 y = 1（切點 (0,1) 正好是弧的終點）→ 距離 0
  const r = A.arcSegDist(Q, -1, 1, 1, 1, 1e-4);
  near(r.d, 0, 1e-3, '5.1 切線距離 0');
  ok(r.err <= 1e-4, '5.2 回報的誤差上界在容差內');
}
{
  // 平行於 x 軸、y = 3 的線段：最近點是弧的最高點 (0,1)，距離 2
  const r = A.arcSegDist(Q, -5, 3, 5, 3, 1e-5);
  near(r.d, 2, 1e-4, '5.3 y=3 的直線到單位圓弧 = 2（解析解）');
}
{
  // 穿過圓的線段 → 距離 0
  const r = A.arcSegDist(Q, -2, 0.5, 2, 0.5, 1e-4);
  near(r.d, 0, 1e-9, '5.4 穿過弧的線段距離 0');
}
{
  // 線段在弧的「開口側」：弧只有第一象限，線段在第三象限
  const r = A.arcSegDist(Q, -3, -3, -2, -2, 1e-4);
  // 最近是弧的端點 (1,0) 或 (0,1) 到線段 (-2,-2) 的距離
  const expect = Math.min(
    Math.hypot(1 + 2, 0 + 2), Math.hypot(0 + 2, 1 + 2));
  near(r.d, expect, 1e-3, '5.5 弧在另一象限時取端點距離');
}

// ---- 6. 弧到弧 ----
{
  // 同心圓弧：半徑 1 與 2，距離 1
  const outer = A.fromCenter(0, 0, 2, 0, 0, 2, true);
  const r = A.arcArcDist(Q, outer, 1e-4);
  near(r.d, 1, 1e-3, '6.1 同心弧距離 = 半徑差');
}
{
  // 相切的兩個圓：圓心距 = r1 + r2
  const b = A.fromCenter(3, 0, 2, 0, 4, 0, true);   // 圓心 (3,0) 半徑 1，整圈
  const r = A.arcArcDist(Q, b, 1e-4);
  near(r.d, 1, 1e-3, '6.2 圓心距 3、半徑各 1 → 最近距離 1');
}

// ---- 7. 走線間距（含寬度）----
{
  // 弧走線（寬 0.3）與 y=3 的直線走線（寬 0.2）：中心線距離 2，銅間距 = 2 − 0.15 − 0.1
  const g = A.trackGap({ arc: Q, width: 0.3 }, { x1: -5, y1: 3, x2: 5, y2: 3, width: 0.2 }, 1e-5);
  near(g.gap, 2 - 0.15 - 0.1, 1e-4, '7.1 弧對線段的銅間距扣掉兩邊半寬');
}
{
  // 兩條都是線段時要退回精確計算，誤差 0
  const g = A.trackGap({ x1: 0, y1: 0, x2: 10, y2: 0, width: 0.3 }, { x1: 0, y1: 1, x2: 10, y2: 1, width: 0.3 }, 1e-5);
  near(g.gap, 1 - 0.3, 1e-12, '7.2 兩條線段的間距是精確值');
  eq(g.err, 0, '7.3 沒有弧就沒有細分誤差');
}

// ---- 8. 外框 ----
{
  const b = A.bbox(Q);
  near(b.x0, 0, 1e-12, '8.1 第一象限弧的 x 最小值 = 0（終點）');
  near(b.y0, 0, 1e-12, '8.2 y 最小值 = 0（起點）');
  near(b.x1, 1, 1e-12, '8.3 x 最大值 = 1');
  near(b.y1, 1, 1e-12, '8.4 y 最大值 = 1');
}
{
  // 跨過 90 度的弧，外框上緣要是 r 不是端點
  const a = A.fromCenter(0, 0, 1, 0, -1, 0, true);   // 上半圓
  near(A.bbox(a).y1, 1, 1e-12, '8.5 上半圓的外框上緣 = r（極值點在弧上）');
  near(A.bbox(a).y0, 0, 1e-12, '8.6 下緣 = 0（端點）');
}

// ---- 9. contains ----
{
  ok(A.contains(Q, PI / 4), '9.1 45 度在第一象限弧上');
  ok(!A.contains(Q, -PI / 4), '9.2 −45 度不在');
  ok(!A.contains(Q, PI), '9.3 180 度不在');
  ok(A.contains(Q, 0), '9.4 起點角在');
  ok(A.contains(Q, PI / 2), '9.5 終點角在');
}

// ---- 10. 退化情況 ----
{
  const zero = A.fromCenter(5, 5, 5, 5, 5, 5, true);
  eq(A.segCount(zero, 0.01), 1, '10.1 零半徑不會除以零');
  ok(isFinite(A.ptArcDist(0, 0, zero)), '10.2 零半徑的點距離是有限值');
  ok(isFinite(A.arcSegDist(zero, 0, 0, 1, 1, 0.01).d), '10.3 零半徑弧對線段不炸');
}

console.log(`\npcb-arc.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
