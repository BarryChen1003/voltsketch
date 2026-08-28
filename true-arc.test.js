/**
 * true-arc.test.js — 真圓弧走線的端到端驗證（node）
 *
 * §8 記的缺陷是「導角輸出的是線段不是真圓弧」。這支驗整條路都通了：
 *   Mfg.Mitre 的 trueArc 模式 → 產出帶 arc 欄位的走線
 *   → DRC 量得到真弧的距離（drc-arc.test.js 已驗）
 *   → Gerber 輸出 G02/G03 而不是一串折線
 *
 * 幾何對解析解：夾角 90° 的轉角、切點距轉角 cut，圓角半徑必然是 cut·tan(45°) = cut，
 * 圓心必然在角平分線上距轉角 cut·√2。
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

global.window = {};
const PcbArc = require('./pcb-arc.js');
globalThis.PcbArc = PcbArc;
global.window.PcbArc = PcbArc;
require('./pcb-mfg.js');
const Mfg = global.window.Mfg;

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

const padAbs = (c, p) => ({ x: c.x + p.x, y: c.y + p.y });

// 90 度轉角：(-10,0) → (0,0) → (0,10)
function corner90() {
  return {
    boardWidth: 60, boardHeight: 60,
    layerStack: [{ id: 'F.Cu', kind: 'copper' }, { id: 'B.Cu', kind: 'copper' }],
    components: [], vias: [], zones: [], userZones: [],
    traces: [
      { x1: -10, y1: 0, x2: 0, y2: 0, width: 0.3, layer: 'F.Cu', net: 'A' },
      { x1: 0, y1: 0, x2: 0, y2: 10, width: 0.3, layer: 'F.Cu', net: 'A' },
    ],
  };
}

(async () => {
  ok(!!Mfg && !!Mfg.Mitre, '0.1 Mfg.Mitre 載入');

  // ---- 1. 認得出轉角 ----
  {
    const st = corner90();
    const cs = Mfg.Mitre.corners(st, padAbs);
    eq(cs.length, 1, '1.1 找到一個轉角');
    near(cs[0].deg, 90, 1e-9, '1.2 夾角 90 度');
    eq([cs[0].x, cs[0].y], [0, 0], '1.3 轉角位置');
  }

  // ---- 2. trueArc 模式：幾何對解析解 ----
  {
    const st = corner90();
    const cut = 1;
    const r = Mfg.Mitre.apply(st, padAbs, { radius: cut, mode: 'trueArc' });
    eq(r.changed, 1, '2.1 導了一個角');
    eq(r.added.length, 1, '2.2 只加一條走線（不是一串折線）');

    const seg = r.added[0];
    ok(seg.arc, '2.3 帶 arc 欄位');
    // 90 度：r = cut·tan(45°) = cut
    near(seg.arc.r, cut, 1e-9, '2.4 圓角半徑 = cut·tan(θ/2) = 1（解析解）');
    // 圓心在角平分線上，距轉角 r/sin(45°) = √2
    near(Math.hypot(seg.arc.cx - 0, seg.arc.cy - 0), Math.SQRT2, 1e-9, '2.5 圓心距轉角 √2（解析解）');
    // 兩條邊被切短
    const t0 = r.traces[0], t1 = r.traces[1];
    near(t0.x2, -cut, 1e-9, '2.6 第一條被切到 x=-1');
    near(t1.y1, cut, 1e-9, '2.7 第二條被切到 y=1');
    // 弧的起訖點就是切點
    near(seg.x1, -cut, 1e-9, '2.8 弧起點 x');
    near(seg.y1, 0, 1e-9, '2.9 弧起點 y');
    near(seg.x2, 0, 1e-9, '2.10 弧終點 x');
    near(seg.y2, cut, 1e-9, '2.11 弧終點 y');
    // 弧上的點確實都在半徑上
    const pts = PcbArc.toPoints(seg.arc, 0.001);
    let worst = 0;
    for (const p of pts) worst = Math.max(worst, Math.abs(Math.hypot(p[0] - seg.arc.cx, p[1] - seg.arc.cy) - seg.arc.r));
    ok(worst < 1e-9, '2.12 弧上每個點到圓心的距離都等於 r');
    // 掃過的角度應該是 180° − 90° = 90°
    near(seg.arc.sweep * 180 / Math.PI, 90, 1e-6, '2.13 掃過 90 度（180° 減夾角）');
  }

  // ---- 3. 折線模式行為不變（回歸保護）----
  {
    const st = corner90();
    const r = Mfg.Mitre.apply(st, padAbs, { radius: 1, mode: 'arc', seg: 6 });
    eq(r.added.length, 6, '3.1 折線模式仍然產出 6 段');
    eq(r.added.every(s => !s.arc), true, '3.2 折線模式不帶 arc 欄位');
  }
  {
    const st = corner90();
    const r = Mfg.Mitre.apply(st, padAbs, { radius: 1, mode: '45' });
    eq(r.added.length, 1, '3.3 45 度切角一條');
    eq(!!r.added[0].arc, false, '3.4 而且不帶 arc');
  }

  // ---- 4. PcbArc 不在時要退回折線，不可以產出殘缺的 arc ----
  {
    const savedG = globalThis.PcbArc, savedW = global.window.PcbArc;
    delete globalThis.PcbArc; delete global.window.PcbArc;
    const st = corner90();
    const r = Mfg.Mitre.apply(st, padAbs, { radius: 1, mode: 'trueArc', seg: 6 });
    globalThis.PcbArc = savedG; global.window.PcbArc = savedW;
    eq(r.added.every(s => !s.arc), true, '4.1 PcbArc 不在時不產出 arc 欄位');
    ok(r.added.length >= 1, '4.2 但仍然導得出角（退回折線）');
  }

  // ---- 5. 不同角度 ----
  {
    // 60 度轉角。夾角量的是「從轉角往外的兩個方向」之間的角：
    // 邊 A 的方向是 (-1,0)，所以要夾 60° 的話邊 B 的方向必須是
    // (cos120°, sin120°) = (-0.5, √3/2) —— 終點 (-5, 5√3)。
    // 用 (5, 5√3) 的話夾角是 120° 而不是 60°（第一版就是這樣寫錯的）。
    const st = corner90();
    st.traces[1] = { x1: 0, y1: 0, x2: -5, y2: 5 * Math.sqrt(3), width: 0.3, layer: 'F.Cu', net: 'A' };
    const cs = Mfg.Mitre.corners(st, padAbs);
    near(cs[0].deg, 60, 1e-6, '5.1 夾角 60 度');
    const cut = 1;
    const r = Mfg.Mitre.apply(st, padAbs, { radius: cut, mode: 'trueArc' });
    const seg = r.added[0];
    // r = cut·tan(30°)
    near(seg.arc.r, cut * Math.tan(Math.PI / 6), 1e-6, '5.2 60 度的圓角半徑 = cut·tan(30°)');
    near(seg.arc.sweep * 180 / Math.PI, 120, 1e-4, '5.3 掃過 120 度（180−60）');
  }

  // ---- 6. Gerber 輸出真圓弧 ----
  {
    const gerber = await import('./supabase/functions/_shared/gerber.mjs');
    const st = corner90();
    const r = Mfg.Mitre.apply(st, padAbs, { radius: 1, mode: 'trueArc' });
    st.traces = r.traces.concat(r.added);

    const g = gerber.build(st, padAbs, 'arc');
    const cu = g.files.find(f => /F_Cu\.gbr$/.test(f.name));
    ok(cu, '6.1 有輸出 F_Cu');
    ok(!/NaN|undefined/.test(cu.text), '6.2 沒有 NaN');
    ok(/G75\*/.test(cu.text), '6.3 有 G75（多象限圓弧模式）');
    ok(/G0[23]X/.test(cu.text), '6.4 有 G02 或 G03（真圓弧指令）');
    eq(cu.stats.arc, 1, '6.5 統計顯示一段弧');
    eq(cu.stats.draw, 2, '6.6 兩條直線段（被切短的那兩條）');
  }
  {
    // 對照：折線模式不會產生 G02/G03
    const gerber = await import('./supabase/functions/_shared/gerber.mjs');
    const st = corner90();
    const r = Mfg.Mitre.apply(st, padAbs, { radius: 1, mode: 'arc', seg: 6 });
    st.traces = r.traces.concat(r.added);
    const g = gerber.build(st, padAbs, 'poly');
    const cu = g.files.find(f => /F_Cu\.gbr$/.test(f.name));
    eq(cu.stats.arc, 0, '6.7 折線模式沒有弧');
    eq(cu.stats.draw, 8, '6.8 折線模式是 2 + 6 = 8 條直線');
  }

  // ---- 7. Gerber 的弧回讀：圓心與半徑要對得回來 ----
  {
    const gerber = await import('./supabase/functions/_shared/gerber.mjs');
    const GI = require('./gerber-import.js');
    const st = corner90();
    const r = Mfg.Mitre.apply(st, padAbs, { radius: 1, mode: 'trueArc' });
    st.traces = r.traces.concat(r.added);
    const g = gerber.build(st, padAbs, 'rt');
    const cu = g.files.find(f => /F_Cu\.gbr$/.test(f.name));

    const parsed = GI.parseGerber(cu.text, { name: cu.name });
    const arcs = parsed.primitives.filter(p => p.kind === 'arc');
    eq(arcs.length, 1, '7.1 解析回來一段弧');
    const a = arcs[0];
    // Gerber 的 Y 是翻過的，圓心 y 要取負才對得回板座標
    const orig = r.added[0].arc;
    near(a.cx, orig.cx, 1e-5, '7.2 圓心 x round-trip 一致');
    near(-a.cy, orig.cy, 1e-5, '7.3 圓心 y round-trip 一致（Y 翻回來）');
    const rr = Math.hypot(a.x1 - a.cx, a.y1 - a.cy);
    near(rr, orig.r, 1e-5, '7.4 半徑 round-trip 一致');
  }

  console.log(`\ntrue-arc.test: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
