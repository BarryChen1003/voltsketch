/**
 * blindvia.test.js — 盲埋孔（blind / buried via）驗證（node，無瀏覽器）
 *
 * 盲埋孔不是「多一種 via」而已，它牽動三件事：
 *   ① 路由器：換層時只需要跨到的那一段層是空的，不是整根柱子
 *   ② 匯出：板廠是照「哪一段層」分次鑽的，混在同一個鑽孔檔裡他們無從判斷
 *   ③ 板廠能力：四家的一般線上下單流程都不接，做得出來不等於送得出去
 * 三件缺一件，使用者就會拿到一份看起來完整、實際上做不出來的檔。
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

const noop = () => {};
global.window = { I18N: null, localStorage: { getItem: () => null, setItem: noop }, addEventListener: noop };
global.document = {
  addEventListener: noop, getElementById: () => null, querySelector: () => null,
  querySelectorAll: () => [], createElement: () => ({ addEventListener: noop, style: {}, click: noop }),
  readyState: 'complete', body: {}
};
global.window.document = global.document;
require('./pcb-index.js');   // 繞線的節點索引走共用的那一份
require('./pcb-rules.js');
require('./pcb-fabs.js');
const GerberExport = require('./supabase/functions/_shared/gerber.mjs');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL: ' + m); } };
const eq = (a, b, m) => ok(a === b, `${m} (得 ${JSON.stringify(a)}，期望 ${JSON.stringify(b)})`);
const padAbs = (c, p) => ({ x: c.x + p.x, y: c.y + p.y });
const LAYERS = ['F.Cu', 'In1.Cu', 'In2.Cu', 'B.Cu'];

const stack4 = () => [
  { id: 'F.Cu', kind: 'copper', type: 'Signal' }, { id: 'In1.Cu', kind: 'copper', type: 'Signal' },
  { id: 'In2.Cu', kind: 'copper', type: 'Signal' }, { id: 'B.Cu', kind: 'copper', type: 'Signal' },
  { id: 'F.SilkS', kind: 'silk' }, { id: 'B.SilkS', kind: 'silk' }, { id: 'Edge.Cuts', kind: 'edge' }
];

// ============ 1) 路由器：跨層範圍 ============
{
  const board = () => {
    const traces = [];
    for (let y = -15; y <= 15; y += 0.4) {
      traces.push({ x1: 0, y1: y, x2: 0.01, y2: y, width: 0.5, layer: 'F.Cu', net: 'W' });
      traces.push({ x1: 0, y1: y, x2: 0.01, y2: y, width: 0.5, layer: 'B.Cu', net: 'W' });
    }
    return {
      boardWidth: 40, boardHeight: 30, traces, vias: [], keepouts: [],
      components: [
        { id: 'a', ref: 'J1', x: -15, y: 0, rot: 0, pads: [{ x: 0, y: 0, w: 1, h: 1, side: 'F', net: 'SIG' }] },
        { id: 'b', ref: 'J2', x: 15, y: 0, rot: 0, pads: [{ x: 0, y: 0, w: 1, h: 1, side: 'F', net: 'SIG' }] }
      ]
    };
  };
  const line = { x1: -15, y1: 0, x2: 15, y2: 0, net: 'SIG' };
  const opt = {
    layers: LAYERS, width: 0.25, grid: 0.25, viaOd: 0.7, viaDrill: 0.3,
    clearance: { traceToTrace: 0.15, traceToPad: 0.15, traceToEdge: 0.2 }
  };

  const thru = window.AutoRoute.route(board(), padAbs, line, Object.assign({ blindBuried: false }, opt));
  ok(thru.ok, '1 只允許穿孔時應繞得出來');
  ok(thru.vias.length > 0, '1 應有換層 via');
  ok(thru.vias.every(v => v.from === 'F.Cu' && v.to === 'B.Cu'),
     `1 只允許穿孔時每顆 via 都要跨全部層（得 ${thru.vias.map(v => v.from + '→' + v.to).join(',')}）`);

  const bb = window.AutoRoute.route(board(), padAbs, line, Object.assign({ blindBuried: true }, opt));
  ok(bb.ok, '1 允許盲埋孔時應繞得出來');
  ok(bb.vias.length > 0, '1 應有換層 via');
  ok(bb.vias.some(v => !(v.from === 'F.Cu' && v.to === 'B.Cu')),
     `1 允許盲埋孔時應出現不跨全層的 via（得 ${bb.vias.map(v => v.from + '→' + v.to).join(',')}）`);
  ok(bb.vias.every(v => LAYERS.indexOf(v.from) >= 0 && LAYERS.indexOf(v.to) >= 0), '1 跨層兩端都要是合法銅層');
  ok(bb.vias.every(v => LAYERS.indexOf(v.from) < LAYERS.indexOf(v.to)), '1 from 應在 to 之上（順序一致）');

  // 預設不開盲埋孔：四家板廠的一般流程都不接，預設就該是送得出去的
  const dflt = window.AutoRoute.route(board(), padAbs, line, opt);
  ok(dflt.vias.every(v => v.from === 'F.Cu' && v.to === 'B.Cu'), '1 未指定時預設只做穿孔');
}

// ============ 1b) 埋孔：跨層不從第 0 層起算 ============
// 上面那組路徑都從 F.Cu 出發，所以「span 從 lo 起」與「span 從 0 起」算出來一樣，
// 分不出實作對不對。這裡逼出一顆真正的埋孔（In1→In2）：
// F.Cu 與 B.Cu 全被佔滿（只能走內層），In1 右半有牆、In2 左半有牆，
// 所以路徑必須在中間從 In1 換到 In2，而且那個位置的 F.Cu 是被佔的——
// 若實作要求 span 從第 0 層起算，這顆換層就下不去。
{
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const board = () => ({
    boardWidth: 40, boardHeight: 30, traces: [], vias: [],
    // 用禁佈區封鎖，不要用上萬條小線段：同樣的效果，但快兩個數量級，
    // CI 跑得動才有意義（第一版用線段填滿，一支測試就要好幾分鐘）。
    keepouts: [
      { layer: 'F.Cu', pts: rect(-19, -14, 19, 14) },     // 外層整片封死
      { layer: 'B.Cu', pts: rect(-19, -14, 19, 14) },
      { layer: 'In1.Cu', pts: rect(6, -14, 7, 14) },      // In1 右側有牆
      { layer: 'In2.Cu', pts: rect(-7, -14, -6, 14) }     // In2 左側有牆
    ],
    components: [
      // 穿孔 pad：起訖層不限，路徑可以直接從內層開始
      { id: 'a', ref: 'J1', x: -15, y: 0, rot: 0, pads: [{ x: 0, y: 0, w: 1.4, h: 1.4, side: '*', net: 'SIG' }] },
      { id: 'b', ref: 'J2', x: 15, y: 0, rot: 0, pads: [{ x: 0, y: 0, w: 1.4, h: 1.4, side: '*', net: 'SIG' }] }
    ]
  });
  const line = { x1: -15, y1: 0, x2: 15, y2: 0, net: 'SIG' };
  const opt = {
    layers: LAYERS, width: 0.25, grid: 0.25, viaOd: 0.7, viaDrill: 0.3,
    clearance: { traceToTrace: 0.15, traceToPad: 0.15, traceToEdge: 0.2 }
  };
  const r = window.AutoRoute.route(board(), padAbs, line, Object.assign({ blindBuried: true }, opt));
  ok(r.ok, '1b 允許盲埋孔時，這片只有內層可走的板應繞得出來');
  if (r.ok) {
    const inner = r.vias.filter(v => v.from !== 'F.Cu' && v.to !== 'B.Cu');
    ok(inner.length > 0,
       `1b 應出現不含外層的埋孔（得 ${r.vias.map(v => v.from + '→' + v.to).join(',') || '無 via'}）`);
    ok(r.segs.some(sg => sg.layer === 'In1.Cu') && r.segs.some(sg => sg.layer === 'In2.Cu'),
       '1b 路徑應同時用到兩個內層');
    ok(r.segs.every(sg => sg.layer !== 'F.Cu' && sg.layer !== 'B.Cu'),
       '1b 外層被佔滿，路徑不該出現在外層');
  }
  // 只允許穿孔時：板邊還留了一點空隙，所以未必失敗——但**不可能**出現埋孔。
  // 「必定失敗」那種斷言在這個佈局下不成立（板邊有空），寫了只是自己騙自己。
  const thru = window.AutoRoute.route(board(), padAbs, line, Object.assign({ blindBuried: false }, opt));
  ok(thru.vias.every(v => v.from === 'F.Cu' && v.to === 'B.Cu'),
     `1b 只允許穿孔時不可出現埋孔（得 ${thru.vias.map(v => v.from + '→' + v.to).join(',') || '無 via'}）`);
  // 標成穿孔就得真的能穿：整根柱子都要空。F.Cu 的禁佈區蓋住 x∈[-19,19]、y∈[-14,14]，
  // 所以標成 F→B 的 via 一顆都不能落在那個範圍內。
  // 少了這一條，「換層只檢查 lo..hi 卻仍標成穿孔」這種寫法測不出來——
  // 那會在柱子沒空的地方放穿孔，板子鑽下去直接打穿別層的銅。
  const inKeepout = v => Math.abs(v.x) <= 19 && Math.abs(v.y) <= 14;
  eq(thru.vias.filter(inKeepout).length, 0,
     `1b 標成穿孔的 via 不可落在外層禁佈區內（${thru.vias.length} 顆中有 ${thru.vias.filter(inKeepout).length} 顆）`);

  // 上面封的是 F.Cu（第 0 層），而柱子檢查本來就從第 0 層起算，
  // 所以測不出「終點層有沒有被檢查」。這一版只封 B.Cu（最後一層），
  // 專門守住 span 的上界：少了它，「只檢查到 hi 就標成穿孔」這種寫法會漏掉。
  // F.Cu 中間一道貫穿的牆（逼得非換層不可），B.Cu 全封（穿孔柱子的最後一層不通）。
  // 正確行為：穿孔下不去 → 誠實失敗。若實作只檢查到 hi 就標成穿孔，
  // 它會在 B.Cu 被封的位置放一顆「穿孔」，鑽下去直接打穿底層的銅。
  const boardTail = () => {
    const b = board();
    // 兩端改成 F 面 SMD：穿孔 pad 會讓路徑直接從內層起步，根本不需要換層，
    // 那就測不到 via 的跨層檢查了。
    b.components = b.components.map(c => Object.assign({}, c, {
      pads: c.pads.map(p => Object.assign({}, p, { side: 'F' }))
    }));
    b.keepouts = [
      { layer: 'F.Cu', pts: rect(-0.5, -20, 0.5, 20) },     // 貫穿板高的牆，繞不過去
      { layer: 'B.Cu', pts: rect(-25, -20, 25, 20) }        // 蓋滿整片（含板邊），不留縫
    ];
    return b;
  };
  const thruTail = window.AutoRoute.route(boardTail(), padAbs, line, Object.assign({ blindBuried: false }, opt));
  // 失敗時沒有 vias 欄位，先給空陣列再判——否則測試會用 TypeError 收場，
  // 那是「測試壞了」不是「發現問題」，兩者在 CI 上看起來一樣但意義完全不同。
  const tailVias = thruTail.vias || [];
  eq(tailVias.filter(inKeepout).length, 0,
     `1b 底層被封時不可放出「穿孔」（${tailVias.length} 顆中有 ${tailVias.filter(inKeepout).length} 顆落在禁佈區）`);
  // B.Cu 整片封死 → 穿孔柱子哪裡都不通 → 必須換層才過得去，但穿孔換不了 → 誠實失敗。
  // 這一條是守 span 上界的：若實作只檢查到 hi 就標成穿孔，它會在這裡「成功」，
  // 產出一顆鑽下去會打穿底層銅的假穿孔。
  eq(thruTail.ok, false, '1b 底層整片封死時，只允許穿孔就該誠實回報繞不出來');
  const bbTail = window.AutoRoute.route(boardTail(), padAbs, line, Object.assign({ blindBuried: true }, opt));
  ok(bbTail.ok, '1b 同一片板允許盲埋孔就應繞得出來（證明失敗是穿孔下不去，不是路由器無能）');
}

// ============ 2) 匯出：依跨層分檔 ============
{
  const mk = vias => ({
    boardWidth: 40, boardHeight: 30, layers: 4, layerStack: stack4(),
    visibleLayers: LAYERS.concat(['F.SilkS', 'B.SilkS', 'Edge.Cuts']),
    components: [], traces: [], vias,
    zones: [], zoneFills: [], userZones: [], keepouts: [], texts: [], kicadArcs: [], teardrops: []
  });
  const fileOf = (r, frag) => r.files.find(f => f.name.indexOf(frag) >= 0);
  const drillCoords = text => {
    const out = []; const re = /^X(-?[\d.]+)Y(-?[\d.]+)/gm; let m;
    while ((m = re.exec(text))) out.push({ x: +m[1], y: -(+m[2]) });
    return out;
  };

  // 純穿孔：只有一個 PTH 檔
  const thru = GerberExport.build(mk([
    { x: 0, y: 0, od: 0.7, id: 0.3, net: 'A' },
    { x: 2, y: 0, od: 0.7, id: 0.3, from: 'F.Cu', to: 'B.Cu', net: 'A' }   // 明寫全跨＝穿孔
  ]), padAbs, 'bv');
  eq(drillCoords(fileOf(thru, 'PTH.drl').text).length, 2, '2 兩顆穿孔都應在 PTH 檔');
  ok(!thru.files.some(f => /F_Cu-In/.test(f.name)), '2 沒有盲埋孔就不該生出跨層檔');

  // 盲孔 F→In1 與埋孔 In1→In2：各自一檔
  const bb = GerberExport.build(mk([
    { x: 0, y: 0, od: 0.7, id: 0.3, net: 'A' },                                    // 穿孔
    { x: 2, y: 0, od: 0.5, id: 0.25, from: 'F.Cu', to: 'In1.Cu', net: 'B' },       // 盲孔
    { x: 4, y: 0, od: 0.5, id: 0.25, from: 'F.Cu', to: 'In1.Cu', net: 'C' },       // 同跨層
    { x: 6, y: 0, od: 0.5, id: 0.25, from: 'In1.Cu', to: 'In2.Cu', net: 'D' }      // 埋孔
  ]), padAbs, 'bv');
  eq(drillCoords(fileOf(bb, 'PTH.drl').text).length, 1, '2 只有真正的穿孔留在 PTH 檔');
  const f1 = bb.files.find(f => /F_Cu-In1_Cu/.test(f.name));
  const f2 = bb.files.find(f => /In1_Cu-In2_Cu/.test(f.name));
  ok(!!f1, '2 應產生 F.Cu→In1.Cu 的鑽孔檔');
  ok(!!f2, '2 應產生 In1.Cu→In2.Cu 的鑽孔檔');
  eq(drillCoords(f1.text).length, 2, '2 同跨層的兩顆應在同一個檔');
  eq(drillCoords(f2.text).length, 1, '2 埋孔一顆');
  ok(/Blind\/buried via span/.test(f1.text), '2 檔頭要標明這是盲埋孔的哪一段');
  ok(/F\.Cu to In1\.Cu/.test(f1.text), '2 檔頭要寫出起訖層');

  // 鑽孔表：盲埋孔與穿孔同尺寸也不可併成一列（不同刀次）
  const same = GerberExport.build(mk([
    { x: 0, y: 0, od: 0.7, id: 0.3, net: 'A' },
    { x: 5, y: 0, od: 0.7, id: 0.3, from: 'F.Cu', to: 'In1.Cu', net: 'B' }
  ]), padAbs, 'bv');
  const rows = fileOf(same, 'DrillTable.txt').text.split(/\r?\n/).filter(l => /^T\d+\s/.test(l));
  const total = rows.reduce((a, l) => a + (+(/\s(\d+)\s*$/.exec(l.replace(/\s+$/, '')) || [0, 0])[1] || 0), 0);
  ok(/Total holes: 2/.test(fileOf(same, 'DrillTable.txt').text), '2 鑽孔表總數應為 2');
  ok(rows.length >= 1, '2 鑽孔表應有刀具列');
}

// ============ 3) 板廠能力：做得出來不等於送得出去 ============
{
  const FP = window.FabProfiles;
  const mk = vias => ({
    boardWidth: 40, boardHeight: 30, layers: 4, layerStack: stack4(),
    components: [], traces: [], texts: [], vias
  });
  const thru = FP.check(mk([{ x: 0, y: 0, od: 0.7, id: 0.3, net: 'A' }]), 'jlcpcb', padAbs);
  ok(!thru.findings.some(f => f.code === 'blindBuriedUnsupported'), '3 純穿孔不該被判不支援');

  const bb = FP.check(mk([{ x: 0, y: 0, od: 0.5, id: 0.25, from: 'F.Cu', to: 'In1.Cu', net: 'A' }]), 'jlcpcb', padAbs);
  const hit = bb.findings.find(f => f.code === 'blindBuriedUnsupported');
  ok(!!hit, '3 盲孔在 JLCPCB 一般流程應被判不支援');
  eq(hit.severity, 'error', '3 這是會被退件的等級');
  ok(/F\.Cu-In1\.Cu/.test(String(hit.actual)), '3 應說出是哪一段跨層');

  // 明寫全跨的不算盲埋孔
  const full = FP.check(mk([{ x: 0, y: 0, od: 0.7, id: 0.3, from: 'F.Cu', to: 'B.Cu', net: 'A' }]), 'jlcpcb', padAbs);
  ok(!full.findings.some(f => f.code === 'blindBuriedUnsupported'), '3 明寫 F→B 等於穿孔，不算盲埋孔');

  // 四家都要有判定（不可有人漏掉而靜靜放行）
  FP.list.forEach(p => {
    const r = FP.check(mk([{ x: 0, y: 0, od: 0.5, id: 0.25, from: 'F.Cu', to: 'In1.Cu', net: 'A' }]), p.id, padAbs);
    const flagged = r.findings.some(f => f.code === 'blindBuriedUnsupported');
    const skipped = (r.skipped || []).indexOf('blindBuried') >= 0;
    ok(flagged || skipped, `3 ${p.name} 對盲埋孔要嘛判定要嘛列 skipped，不可靜靜放行`);
  });
}

console.log(`\nblindvia.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
