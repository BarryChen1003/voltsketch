/**
 * drc-arc.test.js — DRC 對真圓弧走線的判定（node）
 *
 * §8 記的缺陷是「導角輸出的是線段不是真圓弧，因為 DRC 的距離運算吃不了弧」。
 * 這支驗的就是那條路現在通了：帶 arc 欄位的走線，DRC 量到的間距要對，
 * 而且**貼著界線的弧不可以被放行**——細分一定會把距離量得比真值大一點，
 * 所以實作要把弦高上界扣掉。這支專門盯那個方向。
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

global.window = {};
require('./pcb-arc.js');
require('./pcb-drc.js');
const PadDrc = global.window.PadDrc;
const A = global.window.PcbArc;

let pass = 0, fail = 0;
function eq(a, b, msg) {
  const ok = JSON.stringify(a) === JSON.stringify(b);
  if (ok) pass++; else { fail++; console.error(`FAIL ${msg}\n  expected ${JSON.stringify(b)}\n  got      ${JSON.stringify(a)}`); }
}
const ok = (v, msg) => eq(!!v, true, msg);

const padAbs = (c, p) => {
  const th = ((c.rot || 0) * Math.PI) / 180, co = Math.cos(th), s = Math.sin(th);
  return { x: c.x + p.x * co + p.y * s, y: c.y - p.x * s + p.y * co };
};

// 半徑 10 的四分之一圓弧走線，圓心 (0,0)，從 (10,0) 逆時針到 (0,10)
const arc = A.fromCenter(0, 0, 10, 0, 0, 10, true);
const arcTrace = (net, width) => ({
  x1: 10, y1: 0, x2: 0, y2: 10, width: width || 0.3, layer: 'F.Cu', net,
  arc,
});

// 直線走線，離圓心距離 = |y|，所以與弧的中心線距離 = |y| - 10（y > 10 時）
const lineTrace = (y, net, width) => ({
  x1: -20, y1: y, x2: 20, y2: y, width: width || 0.3, layer: 'F.Cu', net,
});

// rules.clearance 是一個「各種間距」的物件，不是單一數字——
// 傳數字進去的話 cl.traceToTrace 是 undefined，每一條比較都變成
// `d >= undefined` = false，結果是「一條都不報」而不是報錯。
function runDrc(traces, cl) {
  const state = {
    boardWidth: 60, boardHeight: 60,
    layerStack: [{ id: 'F.Cu', kind: 'copper' }, { id: 'B.Cu', kind: 'copper' }],
    components: [], traces, vias: [], zones: [],
  };
  return PadDrc.run(state, padAbs, {
    clearance: { traceToTrace: cl, traceToPad: cl, padToPad: cl, traceToEdge: 0.3, viaToVia: cl, holeToHole: 0.25 },
    width: { minTrace: 0.1, maxTrace: 20, minPowerTrace: 0.3 },
    via: { minDrill: 0.2, minRing: 0.15 },
    maskSliver: 0.15, compSpacing: 2, cinDist: 5,
  });
}
// node 環境沒有 window.I18N，pcb-drc.js 的 T() 會原樣回傳 i18n key，
// 所以走線對走線的違規就是 message === 'drc_tt'（有 net）或 'drc_tt_nonet'（無 net）。
// 這比用中文字面過濾穩：翻譯改字不會讓測試失效。
const ttErrors = r => (r || []).filter(x => /^drc_tt(_nonet)?$/.test(String(x.message || '')));

// ---- 0. 模組載入 ----
ok(!!PadDrc, '0.1 PadDrc 載入');
ok(!!A, '0.2 PcbArc 載入');
ok(!!PadDrc._geom, '0.3 _geom 有匯出');

// ---- 1. 弧與遠處的直線：不該報 ----
{
  // 弧最高點 (0,10)，直線 y=12 → 中心線距離 2、銅間距 2−0.15−0.15=1.7，遠大於 0.2
  const r = runDrc([arcTrace('A'), lineTrace(12, 'B')], 0.2);
  eq(ttErrors(r).length, 0, '1.1 間距 1.7mm 遠大於規則 0.2mm，不該報');
}

// ---- 2. 弧與貼近的直線：一定要報 ----
{
  // 直線 y=10.25 → 中心線距離 0.25、銅間距 0.25−0.3=−0.05（重疊）
  const r = runDrc([arcTrace('A'), lineTrace(10.25, 'B')], 0.2);
  ok(ttErrors(r).length > 0, '2.1 銅箔重疊一定要報');
}
{
  // 銅間距剛好 0.15（小於規則 0.2）：中心線距離 0.45
  const r = runDrc([arcTrace('A'), lineTrace(10.45, 'B')], 0.2);
  ok(ttErrors(r).length > 0, '2.2 間距 0.15 < 規則 0.2，要報');
}

// ---- 3. 貼著界線：細分誤差不可以讓違規被放行（這支的重點）----
{
  // 銅間距剛好等於規則 0.2 的「稍微不足」側：中心線距離 0.499
  // 真值 = 0.499 − 0.3 = 0.199 < 0.2 → 違規。
  // 細分會把距離量大一點，若實作沒有扣掉弦高上界，這一條會被漏掉。
  const r = runDrc([arcTrace('A'), lineTrace(10.499, 'B')], 0.2);
  ok(ttErrors(r).length > 0, '3.1 差 0.001mm 的違規也要抓到（有扣掉細分誤差）');
}
{
  // 反向：明確合格的一側不該誤報。中心線距離 0.6 → 銅間距 0.3 > 0.2
  const r = runDrc([arcTrace('A'), lineTrace(10.6, 'B')], 0.2);
  eq(ttErrors(r).length, 0, '3.2 明確合格的不可以誤報');
}

// ---- 4. 同網路不報 ----
{
  const r = runDrc([arcTrace('SAME'), lineTrace(10.25, 'SAME')], 0.2);
  eq(ttErrors(r).length, 0, '4.1 同一個網路的弧與線不算違規');
}

// ---- 5. 不同層不報 ----
{
  const t = lineTrace(10.25, 'B');
  t.layer = 'B.Cu';
  const r = runDrc([arcTrace('A'), t], 0.2);
  eq(ttErrors(r).length, 0, '5.1 不同層不算違規');
}

// ---- 6. 弧對弧 ----
{
  // 同心弧：半徑 10 與 10.4，銅間距 = 0.4 − 0.3 = 0.1 < 0.2 → 要報
  const outer = A.fromCenter(0, 0, 10.4, 0, 0, 10.4, true);
  const t2 = { x1: 10.4, y1: 0, x2: 0, y2: 10.4, width: 0.3, layer: 'F.Cu', net: 'B', arc: outer };
  const r = runDrc([arcTrace('A'), t2], 0.2);
  ok(ttErrors(r).length > 0, '6.1 同心弧間距不足要報');
}
{
  // 同心弧拉開：半徑差 1.0，銅間距 0.7 > 0.2
  const outer = A.fromCenter(0, 0, 11, 0, 0, 11, true);
  const t2 = { x1: 11, y1: 0, x2: 0, y2: 11, width: 0.3, layer: 'F.Cu', net: 'B', arc: outer };
  const r = runDrc([arcTrace('A'), t2], 0.2);
  eq(ttErrors(r).length, 0, '6.2 拉開之後不報');
}

// ---- 7. 沒有 arc 欄位的走線行為完全不變（回歸保護）----
{
  const a = { x1: 0, y1: 0, x2: 10, y2: 0, width: 0.3, layer: 'F.Cu', net: 'A' };
  const b = { x1: 0, y1: 0.4, x2: 10, y2: 0.4, width: 0.3, layer: 'F.Cu', net: 'B' };
  const r = runDrc([a, b], 0.2);
  ok(ttErrors(r).length > 0, '7.1 純線段的判定照舊（間距 0.1 < 0.2 要報）');
  const c = { x1: 0, y1: 1.5, x2: 10, y2: 1.5, width: 0.3, layer: 'F.Cu', net: 'C' };
  eq(ttErrors(runDrc([a, c], 0.2)).length, 0, '7.2 純線段拉開之後不報');
}

// ---- 8. PcbArc 沒載入時要能退化，不可以整個 DRC 停擺 ----
{
  // 直接呼叫 trackGap 確認弧存在時的行為，再確認 DRC 對「有 arc 但沒有 PcbArc」
  // 的情境不會丟例外（這裡用移除全域的方式模擬）
  const saved = global.window.PcbArc;
  let threw = false;
  try {
    delete global.window.PcbArc;
    runDrc([arcTrace('A'), lineTrace(12, 'B')], 0.2);
  } catch (e) { threw = true; }
  global.window.PcbArc = saved;
  eq(threw, false, '8.1 PcbArc 不在時 DRC 仍然跑得完（退回線段處理）');
}

console.log(`\ndrc-arc.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
