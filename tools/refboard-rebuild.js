/**
 * refboard-rebuild.js — 把公版從「示意佈局」重建成「幾何上做得出來的佈局」。
 *
 * 為什麼要有這支：公版原本的走線是手畫的示意直線，直接壓過別人的 pad；
 * 有些元件之間的 pad 也擠在一起。8 片合計 388 個 DRC error，而且是新訪客
 * 進站看到的第一個東西。手工重畫八片板不現實，所以把它變成可重跑的流程：
 *
 *   1. 丟掉示意走線與示意 via（它們本來就壓在 pad 上，重繞後也沒有意義）
 *   2. 擺位鬆弛：pad 太近的元件互相推開。安裝孔不動、連接器少動
 *      （它們在真板上就固定在板邊），優先推被動元件。
 *   3. 用真的繞線器重繞：0.15mm 線、多層、拆線重試。
 *
 * 一定要從「git 上的原始資料」跑：這支會把結果寫回 pcb-refboards.js，
 * 對著已經重建過的資料再跑一次，等於拿上一輪的走線端點當輸入，一代一代漂移，
 * 也就不再能從原始檔重現。重跑前先 。
 *
 * 用法：
 *   node tools/refboard-rebuild.js            # 全部 8 片，寫回 pcb-refboards.js
 *   node tools/refboard-rebuild.js --dry      # 只跑不寫檔（看數字用）
 *   node tools/refboard-rebuild.js rp2040-pico30 librevna
 *
 * 誠實界定：這不是「照原廠重畫」。公版資料本來就是教學重建版，沒有完整 netlist
 * （pad 的 net 只能從示意走線的端點回推，多數 pad 仍然沒有 net）。所以繞不完的
 * net 會留著飛線，重建後的板子是「幾何上乾淨、電性上仍是近似」。
 */
'use strict';

const path = require('path');
const fs = require('fs');
const W = path.resolve(__dirname, '..');
const R = f => require(path.join(W, f));

// ---------- DOM stub（載 pcb.js 但不跑 init）----------
const noop = () => {};
const ctxStub = new Proxy({}, { get: () => () => undefined });
const canvasStub = { width: 680, height: 478, getContext: () => ctxStub, getBoundingClientRect: () => ({ left: 0, top: 0, width: 680, height: 478 }), addEventListener: noop, style: {}, parentElement: { clientWidth: 680, clientHeight: 478 } };
const drcBox = { innerHTML: '' };   // runDrc 會把結果寫進 #drcResults
const docStub = { querySelector: (s) => (s === '#pcbCanvas' ? canvasStub : (s === '#drcResults' ? drcBox : null)), querySelectorAll: () => [], getElementById: () => null, createElement: () => ({ addEventListener: noop, style: {}, click: noop }), addEventListener: noop, body: {} };
const lsStub = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };
global.window = { I18N: null, localStorage: lsStub, addEventListener: noop, innerWidth: 1280, innerHeight: 720 };
global.document = docStub; global.localStorage = lsStub; global.window.document = docStub;

try { R('ic-data.js'); } catch (e) { /* IC 資料非必要 */ }
['footprint-gen', 'parts-lib', 'pcb-ref-fp', 'pcb-refboards', 'pcb-history', 'pcb-rules',
 'pcb-stackup', 'pcb-constraints', 'pcb-drc', 'pcb-fabs'].forEach(m => R(m + '.js'));
['PcbHistory', 'FootprintGen', 'RefFP', 'PartsLib', 'PCB_REFBOARDS', 'IC_DATA', 'NetRules', 'Ratsnest',
 'AutoRoute', 'RouteAll', 'Stackup', 'Padstack', 'Backdrill', 'FabProfiles', 'ConstraintMgr', 'PadDrc']
  .forEach(k => { global[k] = global.window[k]; });

let src = fs.readFileSync(path.join(W, 'pcb.js'), 'utf8').replace(/pcbApp\.init\(\);\s*/m, '');
eval(src);
const app = global.window.pcbApp;
global.pcbApp = app; global.window.pcbApp = app;   // pcb-stackup 等模組用裸全域引用
['render', 'renderPartsList', 'syncSelPanel', 'populateEmiSelects', 'renderLayerList', 'toast', 'checkTraceRules'].forEach(m => { app[m] = noop; });
app.canvas = canvasStub; app.ctx = ctxStub;

const padAbs = app.padAbs.bind(app);
const GEOM = window.PadDrc._geom;
const rules = app.loadDrcRules();
const CL = rules.clearance;

// 用整套 runDrc，不是只有 PadDrc：Constraint Manager 的 class 線寬/線長也算數。
// 只驗 PadDrc 的話會漏掉「電源線只有 0.15mm」這種錯（第一版就漏了 13 條）。
const errsOf = () => app.runDrc().filter(f => f.type === "error");
const tally = list => { const o = {}; list.forEach(f => { o[f.message] = (o[f.message] || 0) + 1; }); return o; };

// 元件可以被推多遠：安裝孔完全不動（板上的孔位是機構決定的），
// 連接器只微調（真板上它們固定在板邊），IC 次之，被動元件最自由。
const MOBILITY = { mech: 0, conn: 0.25, ic: 0.5, passive: 1 };
const mobilityOf = c => (MOBILITY[c.kind] != null ? MOBILITY[c.kind] : 0.6);

// ---------- 擺位鬆弛 ----------
// 每一輪把所有違規對的推力加起來一次套用（不是一次只修最糟的那對），
// 否則 1400 個 pad 的板子要跑上千輪還會來回震盪。
function relax(st, rounds) {
  const comps = st.components || [];
  const sideOv = (a, b) => a === '*' || b === '*' || a === b;
  let lastBad = Infinity;
  const w0 = st.boardWidth, h0 = st.boardHeight;
  let stall = 0, grown = 0, best = Infinity;
  for (let round = 0; round < rounds; round++) {
    const pads = [];
    comps.forEach(c => (c.pads || []).forEach(p => {
      // 無銅的機構孔也要進來：它沒有銅箔，但鑽頭會跟別的孔互相干涉。
      if (p.cu === false && !(p.drill > 0)) return;
      const sh = GEOM.padShape(c, p, padAbs);
      pads.push({ c, p, sh, net: p.net || '', noCu: p.cu === false });
    }));
    if (!pads.length) return { rounds: round, bad: 0, grewW: st.boardWidth - w0, grewH: st.boardHeight - h0 };

    // 空間網格：只比鄰桶，避免 N² （openrex 有 1400+ pad）
    const maxCirc = pads.reduce((m, q) => Math.max(m, q.sh.circ), 0);
    const cell = Math.max(0.5, 2 * maxCirc + CL.padToPad);
    const buckets = new Map();
    const key = (ix, iy) => ix + ',' + iy;
    pads.forEach((q, i) => {
      const k = key(Math.floor(q.sh.cx / cell), Math.floor(q.sh.cy / cell));
      if (!buckets.has(k)) buckets.set(k, []);
      buckets.get(k).push(i);
    });

    const push = new Map();   // comp → {dx, dy, n}
    const addPush = (c, dx, dy) => {
      const e = push.get(c) || { dx: 0, dy: 0, n: 0 };
      e.dx += dx; e.dy += dy; e.n++;
      push.set(c, e);
    };
    let bad = 0;
    for (let i = 0; i < pads.length; i++) {
      const A = pads[i];
      const ix = Math.floor(A.sh.cx / cell), iy = Math.floor(A.sh.cy / cell);
      for (let gx = ix - 1; gx <= ix + 1; gx++) for (let gy = iy - 1; gy <= iy + 1; gy++) {
        const arr = buckets.get(key(gx, gy));
        if (!arr) continue;
        for (const j of arr) {
          if (j <= i) continue;
          const B = pads[j];
          if (A.c === B.c) continue;                       // 同一顆元件內部＝footprint 的事，reffp-check 管
          // 同 net 的銅箔可以靠近（本來就要連），但孔還是要分開——鑽頭不管網路名。
          const sameNet = !!(A.net && A.net === B.net);
          const copperPair = !sameNet && !A.noCu && !B.noCu && sideOv(A.p.side, B.p.side);
          const drillPair = A.p.drill > 0 && B.p.drill > 0;
          if (!copperPair && !drillPair) continue;
          const cd = Math.hypot(A.sh.cx - B.sh.cx, A.sh.cy - B.sh.cy);
          if (cd - A.sh.circ - B.sh.circ >= CL.padToPad && cd - (A.p.drill || 0) / 2 - (B.p.drill || 0) / 2 >= CL.holeToHole) continue;
          // 兩種違規都要推：pad 銅箔太近，以及鑽孔太近（孔距是板廠的獨立限制）
          const d = copperPair ? GEOM.padDist(A.sh, B.sh) : Infinity;
          const holeGap = drillPair ? cd - (A.p.drill + B.p.drill) / 2 : Infinity;
          const padBad = d < CL.padToPad - 1e-9;
          const holeBad = holeGap < CL.holeToHole - 1e-9;
          if (!padBad && !holeBad) continue;
          bad++;
          const need = Math.max(padBad ? CL.padToPad - d : 0, holeBad ? CL.holeToHole - holeGap : 0) + 0.02;
          let dx = A.c.x - B.c.x, dy = A.c.y - B.c.y;
          const L = Math.hypot(dx, dy);
          if (L < 1e-6) { dx = 1; dy = 0; } else { dx /= L; dy /= L; }
          const ma = mobilityOf(A.c), mb = mobilityOf(B.c);
          const tot = ma + mb;
          if (tot <= 0) continue;                          // 兩顆都不能動（例如兩個安裝孔）
          addPush(A.c, dx * need * (ma / tot), dy * need * (ma / tot));
          addPush(B.c, -dx * need * (mb / tot), -dy * need * (mb / tot));
        }
      }
    }
    if (!bad) return { rounds: round, bad: 0, grewW: st.boardWidth - w0, grewH: st.boardHeight - h0 };

    const halfW = st.boardWidth / 2, halfH = st.boardHeight / 2;
    // 夾在板內要用「pad 的外框」不是元件中心：只夾中心的話，靠邊的連接器
    // 中心還在板上、pad 已經跑到板外。esp32-poe2 實測 208 個座標越界，
    // Gerber 匯出檢查會直接紅。
    const extentOf = c => {
      let ex = 0, ey = 0;
      (c.pads || []).forEach(pd => {
        const a = padAbs(c, pd);
        ex = Math.max(ex, Math.abs(a.x - c.x) + (pd.w || 0.5) / 2);
        ey = Math.max(ey, Math.abs(a.y - c.y) + (pd.h || 0.5) / 2);
      });
      return { ex, ey };
    };
    for (const [c, e] of push) {
      // 平均而非累加：同時被三顆推的元件不該被彈飛
      const nx = c.x + (e.dx / e.n) * 0.7, ny = c.y + (e.dy / e.n) * 0.7;
      const { ex, ey } = extentOf(c);
      const limX = Math.max(0, halfW - ex - 0.1), limY = Math.max(0, halfH - ey - 0.1);
      c.x = Math.max(-limX, Math.min(limX, nx));
      c.y = Math.max(-limY, Math.min(limY, ny));
    }
    // 推不開就把板框放大：公版的板框是「教學重建版」的近似值，產生出來的封裝
    // 比原廠的大一點是常態。硬夾在板內會讓元件貼著邊卡死（esp32-poe2 實測跑滿
    // 300 輪還剩 11 對），寧可板子大 2mm 也不要留違規。
    // 判準看「有沒有創新低」不是跟上一輪比——違規數會來回震盪，比上一輪永遠重置不了。
    if (bad < best) { best = bad; stall = 0; } else stall++;
    if (stall >= 20 && grown < 0.4) {
      st.boardWidth += 2; st.boardHeight += 2;
      grown += 2 / Math.max(w0, h0); stall = 0; best = Infinity;
    }
    lastBad = bad;
  }
  return { rounds, bad: lastBad, hitLimit: true, grewW: st.boardWidth - w0, grewH: st.boardHeight - h0 };
}

// 走線端點貼在哪顆 pad 上（取最近的一顆；找不到就回 null，之後沿用原座標）。
// 吸附半徑＝pad 外接圓再加 0.5mm：394 個示意走線端點裡，97 個真的落在 pad 內、
// 76 個差 0.5mm 以內——後者顯然是「想接上但沒對準」。再遠就不猜了（>0.5mm 佔 55%），
// 硬吸附等於自己發明電路連接。
function anchorOf(st, x, y, net) {
  let best = null;
  for (const c of (st.components || [])) for (const pd of (c.pads || [])) {
    if (pd.cu === false) continue;
    // 只吸同 net 或還沒有 net 的 pad。不設限的話會吸到隔壁腳：
    // rp2040-pico30 的 XOUT 被吸到 Y1.3（XIN）上，等於自己發明一個短路。
    if (net && pd.net && pd.net !== net) continue;
    const a = padAbs(c, pd);
    const d = Math.hypot(a.x - x, a.y - y);
    if (d > Math.hypot(pd.w || 0.5, pd.h || 0.5) / 2 + 0.5) continue;
    if (!best || d < best.d) best = { ref: c.ref, num: pd.num, d };
  }
  return best;
}

function posOf(st, an, fx, fy) {
  if (!an) return { x: fx, y: fy };
  const c = (st.components || []).find(z => z.ref === an.ref);
  const pd = c && (c.pads || []).find(q => q.num === an.num);
  if (!c || !pd) return { x: fx, y: fy };
  return padAbs(c, pd);
}

// ---------- 主流程 ----------
const args = process.argv.slice(2);
const dry = args.includes('--dry');
const want = args.filter(a => !a.startsWith('--'));
const boards = (window.PCB_REFBOARDS || []).filter(b => !want.length || want.includes(b.id));
if (!boards.length) { console.error('沒有符合的公版 id'); process.exit(1); }

const out = [];
for (const b of boards) {
  app.loadRefBoard(b.id);
  const st = app.state;
  const before = errsOf();

  const specs = (st.traces || []).map(t => ({
    net: t.net, x1: t.x1, y1: t.y1, x2: t.x2, y2: t.y2,
    a: anchorOf(st, t.x1, t.y1, t.net), b: anchorOf(st, t.x2, t.y2, t.net)
  }));
  st.traces = [];
  st.vias = [];
  const rx = relax(st, 300);

  // 端點跟著 pad 走：鬆弛前記下每條示意走線的兩端貼在哪顆 pad，鬆弛後用該 pad 的新座標。
  // 直接沿用舊座標的話，元件被推開之後走線接的是空氣（DRC 會全綠，因為那裡本來就沒東西）；
  // 改用 Ratsnest 重算也不行——公版多數 pad 沒有 net，算出來的飛線比原本的示意走線少得多。
  const lines = specs.map(sp => {
    const A = posOf(st, sp.a, sp.x1, sp.y1), B = posOf(st, sp.b, sp.x2, sp.y2);
    return { x1: A.x, y1: A.y, x2: B.x, y2: B.y, net: sp.net };
  });

  const cuLayers = (st.layerStack || []).filter(l => l.kind === 'copper').map(l => l.id);
  // 線寬要照 Constraint Manager 的 class 走：POWER（GND/VCC/VIN…）下限 0.3mm。
  // 第一版一律 0.15mm，DRC 幾何全綠，但 cm_e_width 報了 13 條——電源線細到不能用。
  // 寬的先繞：它的選擇最少，等窄線把通道占滿就再也塞不進去。
  const cmData = window.ConstraintMgr ? ConstraintMgr.load() : null;
  const widthOf = net => {
    const cls = cmData ? ConstraintMgr.classOf(cmData, net || "") : null;
    const minW = cls && cls.phys && cls.phys.minW;
    // NetRules 是另一套規則（pattern → 最小線寬），預設就有 VIN 0.5mm、GND 0.3mm。
    // 只看 ConstraintMgr 會漏掉它：node 沒有 localStorage 所以 netRules 是空的，
    // 瀏覽器一載入就是預設值——工具說 0、使用者打開卻看到「VIN 有 11 段 < 0.5mm」。
    const nr = window.NetRules ? window.NetRules.match(window.NetRules.load(), net || "") : null;
    const nrMin = nr && nr.minW > 0 ? nr.minW : 0;
    return Math.max(0.15, minW || 0, nrMin);
  };
  // 淨空也要照 Constraint Manager 的矩陣走：預設 default|power 要 0.2mm、diff|power 要 0.25mm，
  // 比全域的 0.15 嚴。用全域值繞出來的線會過 PadDrc 但被 cm_e_clear 抓到。
  const clearanceFor = nets => {
    if (!cmData) return CL;
    const all = new Set();
    (st.components || []).forEach(c => (c.pads || []).forEach(pd => { if (pd.net) all.add(pd.net); }));
    lines.forEach(l => { if (l.net) all.add(l.net); });
    let need = CL.traceToTrace;
    for (const a of nets) for (const b of all) need = Math.max(need, ConstraintMgr.clearanceBetween(cmData, a, b, CL.traceToTrace));
    return Object.assign({}, CL, { traceToTrace: need, traceToPad: Math.max(CL.traceToPad, need) });
  };
  const groups = new Map();
  lines.forEach(l => {
    const w = widthOf(l.net);
    if (!groups.has(w)) groups.set(w, []);
    groups.get(w).push(l);
  });
  const rr = { routed: [], failed: [], reasons: {} };
  for (const w of [...groups.keys()].sort((a, b) => b - a)) {
    const grp = groups.get(w);
    const one = window.RouteAll.run(st, padAbs, grp, {
      layers: cuLayers, layer: "F.Cu", width: w,
      clearance: clearanceFor(grp.map(l => l.net)), viaOd: Math.max(0.6, w + 0.3), viaDrill: 0.3,
      grid: 0.1, order: "short", ripup: true, passes: 6,
      // 這是離線工具，不是使用者按下去要等的按鈕：時間給夠。
      // 90 秒的版本有 11~12 條是「時間到才失敗」（RouteAll 回報 wouldRouteNow），
      // 不是真的沒有路。每條線抓 20 秒，大板才有機會繞完。
      budgetMs: 30000 + 20000 * grp.length
    });
    one.routed.forEach((x, i) => {
      x.segs.forEach((sg, k) => st.traces.push({
        x1: +sg.x1.toFixed(3), y1: +sg.y1.toFixed(3), x2: +sg.x2.toFixed(3), y2: +sg.y2.toFixed(3),
        layer: sg.layer || "F.Cu", width: w, net: x.line.net
      }));
      (x.vias || []).forEach(v => st.vias.push({
        x: +v.x.toFixed(3), y: +v.y.toFixed(3), od: v.od, drill: v.drill, net: x.line.net
      }));
    });
    rr.routed.push(...one.routed);
    rr.failed.push(...(one.failed || []));
    for (const [k, n] of Object.entries(one.reasons || {})) rr.reasons[k] = (rr.reasons[k] || 0) + n;
  }

  // 使用者載入公版時，pad 的 net 是由「當時的走線」回推的（loadRefBoard → assignPadNets）。
  // 重建後走線變了，回推結果也會變。驗收必須用重新回推後的狀態，否則工具說 0、
  // 載進來卻有錯——esp32 的 via 就是這樣漏掉的（那顆 pad 重建前有 net、重建後沒有）。
  // 先把這一輪的 pad net 收成表（之後寫進公版資料，載入時直接套用）,
  const padNets = {};
  (st.components || []).forEach(c => {
    (c.pads || []).forEach(pd => {
      if (!pd.net) return;
      (padNets[c.ref] = padNets[c.ref] || {})[pd.num] = pd.net;
    });
  });
  // 再照 loadRefBoard 的順序重建一次：清空 → 套 padNets → 從走線回推。
  // 驗收要用使用者實際會看到的狀態，否則工具說 0、載進來卻有錯。
  (st.components || []).forEach(c => (c.pads || []).forEach(pd => { pd.net = ""; }));
  (st.components || []).forEach(c => {
    const m = padNets[c.ref];
    if (!m) return;
    (c.pads || []).forEach(pd => { if (m[pd.num]) pd.net = m[pd.num]; });
  });
  app.assignPadNets(st.components, st.traces);
  // 驗收要跟瀏覽器同條件：init() 會載入 NetRules，node 不跑 init 所以要自己補
  st.netRules = window.NetRules ? window.NetRules.load() : [];
  const after = errsOf();
  // 驗收：每條走線的兩端都要真的落在同 net 的 pad 上（或另一條同 net 走線的端點）
  const padPts = [];
  (st.components || []).forEach(c => (c.pads || []).forEach(pd => {
    if (pd.cu === false || !pd.net) return;
    const a = padAbs(c, pd);
    padPts.push({ x: a.x, y: a.y, net: pd.net, r: Math.max(pd.w || 0.5, pd.h || 0.5) / 2 + 0.05 });
  }));
  const onPad = (x, y, net) => padPts.some(q => q.net === net && Math.hypot(q.x - x, q.y - y) <= q.r);
  const onWire = (x, y, net, self) => st.traces.some(t => t !== self && t.net === net &&
    (Math.hypot(t.x1 - x, t.y1 - y) < 0.06 || Math.hypot(t.x2 - x, t.y2 - y) < 0.06));
  let ends = 0, endsOk = 0;
  st.traces.forEach(t => {
    [[t.x1, t.y1], [t.x2, t.y2]].forEach(([x, y]) => {
      ends++;
      if (onPad(x, y, t.net) || onWire(x, y, t.net, t)) endsOk++;
    });
  });
  out.push({ id: b.id, ends, endsOk, reasons: rr.reasons || {}, before: before.length, after: after.length, routed: rr.routed.length, lines: lines.length,
    rx, beforeTally: tally(before), afterTally: tally(after) });

  if (!dry) {
    // 寫回資料：只動 components 的 x/y、traces、vias，其餘欄位原樣保留
    b.components.forEach(c => {
      const live = st.components.find(z => z.ref === c.ref);
      if (!live) return;
      c.x = +live.x.toFixed(3); c.y = +live.y.toFixed(3);
    });
    b.w = st.boardWidth; b.h = st.boardHeight;   // 鬆弛可能把板框推大
    b.padNets = padNets;
    b.traces = st.traces;
    b.vias = st.vias;
  }
}

for (const r of out) {
  console.log(r.id.padEnd(15),
    'DRC ' + String(r.before).padStart(4) + ' -> ' + String(r.after).padStart(4),
    '| 繞成 ' + r.routed + '/' + r.lines,
    '| 端點落在 pad ' + r.endsOk + '/' + r.ends + ' | 板框 +' + (r.rx.grewW || 0) + 'mm | 鬆弛 ' + r.rx.rounds + ' 輪' + (r.rx.hitLimit ? '(剩 ' + r.rx.bad + ' 對)' : ''),
    '|', JSON.stringify(r.afterTally), '| 繞不過的原因', JSON.stringify(r.reasons));
}
const sum = k => out.reduce((a, r) => a + r[k], 0);
console.log('---');
console.log('合計 DRC error ' + sum('before') + ' -> ' + sum('after') + '，繞成 ' + sum('routed') + '/' + sum('lines') + ' 條');

if (!dry) {
  const file = path.join(W, 'pcb-refboards.js');
  const text = fs.readFileSync(file, 'utf8');
  const head = text.slice(0, text.indexOf('window.PCB_REFBOARDS'));
  fs.writeFileSync(file, head + 'window.PCB_REFBOARDS = ' + JSON.stringify(window.PCB_REFBOARDS, null, 2) + ';\n', 'utf8');
  console.log('已寫回 pcb-refboards.js（' + boards.length + ' 片）');
} else {
  console.log('--dry：沒有寫檔');
}
