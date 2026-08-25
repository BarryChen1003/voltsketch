/**
 * gerber-pour.test.js — 鋪銅（copper pour）匯出幾何驗證（node，無瀏覽器）
 *
 * 為什麼要單獨一支：
 *   鋪銅在 Gerber 裡是用「極性」畫的——先畫一整塊暗區域（LPD），再切成清除極性
 *   （LPC）把異網 pad／走線／via 的避讓挖掉，最後切回暗極性補上熱風焊盤的輻條。
 *   這代表**同一個座標會被畫很多次，最後一次才算數**。只數指令行數或看檔案有沒有
 *   產生，完全看不出銅到底留在哪裡。避讓少挖 0.1mm，板子做出來就是短路。
 *
 *   這支把 F.Cu 的 Gerber 依序重放，做成「這個座標最後是銅還是空」的查詢函式，
 *   再拿它去問該短的地方有沒有短、該連的地方有沒有連。
 *
 * 驗項：
 *   - 異網 pad／走線／via 周圍必須被挖空，且淨空 >= 設定值
 *   - 同網 pad 開熱風焊盤：環隙要挖開，但四根輻條要留著（否則焊不上／散熱過好）
 *   - 同網 via 是實心連接，不可被挖空
 *   - 鋪銅不可溢出自己的多邊形範圍
 *   - 關掉 thermal 時同網 pad 應為實心，不再有環隙
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

const noop = () => {};
const ctxStub = new Proxy({}, { get: () => () => undefined });
const canvasStub = { width: 680, height: 478, getContext: () => ctxStub, getBoundingClientRect: () => ({ left: 0, top: 0, width: 680, height: 478 }), addEventListener: noop, style: {}, parentElement: { clientWidth: 680, clientHeight: 478 } };
const docStub = { querySelector: (s) => (s === '#pcbCanvas' ? canvasStub : null), querySelectorAll: () => [], getElementById: () => null, createElement: () => ({ addEventListener: noop, style: {}, click: noop }), addEventListener: noop, body: {} };
const lsStub = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };
global.window = { I18N: null, localStorage: lsStub, addEventListener: noop, innerWidth: 1280, innerHeight: 720 };
global.document = docStub; global.localStorage = lsStub; global.window.document = docStub;

const GerberExport = require('./supabase/functions/_shared/gerber.mjs');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL: ' + m); } };
const padAbs = (comp, pad) => { const th = (comp.rot || 0) * Math.PI / 180, c = Math.cos(th), s = Math.sin(th); return { x: comp.x + pad.x * c + pad.y * s, y: comp.y - pad.x * s + pad.y * c }; };

// ---------- 依序重放 Gerber，做成「這一點最後是銅嗎」 ----------
// 關鍵是順序與極性：後畫的蓋前畫的，%LPC*% 之後畫的是「挖掉」。
function buildCopperMap(text) {
  const aps = new Map();
  const ops = [];                    // {dark, kind:'region'|'line'|'flash', ...}
  let curD = null, dark = true, cx = null, cy = null, inRegion = false, regPts = [];
  const diam = () => { const a = aps.get(curD); return a ? a.dims[0] : 0; };

  for (const raw of text.split(/\r?\n/)) {
    const ln = raw.trim();
    if (!ln) continue;
    let m;
    if ((m = /^%ADD(\d+)([A-Z]),([\d.Xx]+)\*%$/.exec(ln))) { aps.set('D' + m[1], { shape: m[2], dims: m[3].split(/[Xx]/).map(Number) }); continue; }
    if (ln === '%LPC*%') { dark = false; continue; }
    if (ln === '%LPD*%') { dark = true; continue; }
    if (/^%/.test(ln) || /^G04/.test(ln) || ln === 'M02*') continue;
    if ((m = /^(D\d+)\*$/.exec(ln))) { curD = m[1]; continue; }
    if (ln === 'G36*') { inRegion = true; regPts = []; continue; }
    if (ln === 'G37*') { inRegion = false; if (regPts.length >= 3) ops.push({ dark, kind: 'region', pts: regPts.slice() }); continue; }
    if (/^G0[13]\*$/.test(ln)) continue;
    if ((m = /^(?:G0[13])?X(-?\d+)Y(-?\d+)(?:I(-?\d+)J(-?\d+))?D(0[123])\*$/.exec(ln))) {
      const x = +m[1] / 1e6, y = -(+m[2]) / 1e6, op = m[5];
      if (op === '02') { cx = x; cy = y; if (inRegion) regPts = [[x, y]]; }
      else if (op === '01') {
        if (inRegion) regPts.push([x, y]);
        else if (!m[3]) ops.push({ dark, kind: 'line', x1: cx, y1: cy, x2: x, y2: y, w: diam() });
        cx = x; cy = y;
      } else { ops.push({ dark, kind: 'flash', x, y, d: diam() }); cx = x; cy = y; }
      continue;
    }
  }

  const inPoly = (x, y, pts) => {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside;
    }
    return inside;
  };
  const onSeg = (x, y, o) => {
    const dx = o.x2 - o.x1, dy = o.y2 - o.y1, l2 = dx * dx + dy * dy;
    let t = l2 ? ((x - o.x1) * dx + (y - o.y1) * dy) / l2 : 0;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    return Math.hypot(x - (o.x1 + t * dx), y - (o.y1 + t * dy)) <= o.w / 2;
  };
  const hits = (x, y, o) => o.kind === 'region' ? inPoly(x, y, o.pts)
    : o.kind === 'line' ? onSeg(x, y, o)
    : Math.hypot(x - o.x, y - o.y) <= o.d / 2;

  // 最後一個蓋到這一點的物件決定它是銅還是空
  return (x, y) => {
    let cu = false;
    for (const o of ops) if (hits(x, y, o)) cu = o.dark;
    return cu;
  };
}

// ---------- 測試板 ----------
const ZONE = [[-18, -13], [18, -13], [18, 13], [-18, 13]];
const CL = 0.3;
function board(opts) {
  opts = opts || {};
  return {
    boardWidth: 40, boardHeight: 30, layers: 2,
    layerStack: [
      { id: 'F.Cu', kind: 'copper', type: 'Signal' }, { id: 'B.Cu', kind: 'copper', type: 'Signal' },
      { id: 'F.SilkS', kind: 'silk' }, { id: 'B.SilkS', kind: 'silk' }, { id: 'Edge.Cuts', kind: 'edge' }
    ],
    visibleLayers: ['F.Cu', 'B.Cu', 'F.SilkS', 'B.SilkS', 'Edge.Cuts'],
    components: [
      { id: 'r1', ref: 'R1', x: -10, y: 0, rot: 0, pads: [{ x: 0, y: 0, w: 1, h: 1, shape: 'rect', side: 'F', net: 'SIG' }] },
      { id: 'r2', ref: 'R2', x: 10, y: 0, rot: 0, pads: [{ x: 0, y: 0, w: 1, h: 1, shape: 'rect', side: 'F', net: 'GND' }] }
    ],
    traces: [{ x1: -5, y1: -8, x2: 5, y2: -8, width: 0.3, layer: 'F.Cu', net: 'SIG' }],
    vias: [
      { x: -5, y: 8, od: 0.7, id: 0.3, net: 'SIG' },
      { x: 5, y: 8, od: 0.7, id: 0.3, net: 'GND' }
    ],
    zones: [], zoneFills: [], texts: [], keepouts: [], kicadArcs: [],
    userZones: [{ layer: 'F.Cu', net: 'GND', pts: ZONE, clearance: CL, thermal: opts.thermal !== false, user: true }]
  };
}
const fcuOf = st => {
  const r = GerberExport.build(st, padAbs, 'pourtest');
  const f = r.files.find(x => x.name.indexOf('F_Cu') >= 0);
  return buildCopperMap(f.text);
};

// ---------- 1) 熱風焊盤開著 ----------
{
  const cu = fcuOf(board());

  // 鋪銅本體：離所有東西都遠的地方要有銅
  ok(cu(-15, 10), '1 鋪銅內部空曠處應有銅');
  ok(cu(15, -10), '1 鋪銅內部另一角也應有銅');
  // 多邊形外不可有銅（不可溢出）
  ok(!cu(-19.5, 0), '1 鋪銅不可溢出左邊界');
  ok(!cu(0, 14), '1 鋪銅不可溢出上邊界');

  // 異網 pad（R1，SIG）。注意：避讓挖完之後匯出還會把 pad 本體畫回來，
  // 所以 pad 中心有銅是對的（那是 pad 自己）。要驗的是 pad 邊緣到 pad邊+淨空
  // 之間的「間隙環」有沒有真的空出來。
  ok(cu(-10, 0), '1 pad 本體應有銅（避讓之後 pad pass 畫回來）');
  ok(!cu(-10 + 0.5 + CL * 0.5, 0), `1 異網 pad 間隙環內（+${(0.5 + CL * 0.5).toFixed(2)}mm）不可有鋪銅`);
  ok(cu(-10 + 0.5 + CL + 0.12, 0), '1 間隙環之外應恢復有鋪銅');

  // 實測間隙：從 pad 邊往外掃，量「空的那一段有多寬」
  {
    let gapStart = null, gapEnd = null;
    for (let d = 0.01; d <= 2.0; d += 0.005) {
      const c = cu(-10 + 0.5 + d, 0);
      if (!c && gapStart === null) gapStart = d;
      if (!c) gapEnd = d;
      if (c && gapStart !== null) break;
    }
    const gap = (gapStart === null) ? 0 : (gapEnd - gapStart + 0.01);
    ok(gap >= CL - 0.02, `1 異網 pad 實測間隙 ${gap.toFixed(3)}mm 應 >= ${CL}mm`);
    ok(gap < CL + 0.25, `1 間隙也不該挖過頭（得 ${gap.toFixed(3)}mm）`);
  }

  // 異網走線：線上與淨空帶內不可有鋪銅
  ok(cu(0, -8), '1 走線本體應有銅');
  ok(!cu(0, -8 + 0.15 + CL * 0.5), '1 異網走線淨空帶內不可有銅');
  ok(cu(0, -8 + 0.15 + CL + 0.12), '1 異網走線淨空之外應有銅');

  // 異網 via：要挖空；同網 via：實心連接
  ok(cu(-5 + 0.35 + CL + 0.12, 8), '1 異網 via 間隙之外應有鋪銅');
  ok(!cu(-5 + 0.35 + CL * 0.5, 8), '1 異網 via 淨空帶內不可有銅');
  ok(cu(5, 8), '1 同網 via 應為實心連接，不可被挖空');
  ok(cu(5 + 0.35 + CL * 0.5, 8), '1 同網 via 周圍也不該有環隙');

  // 同網 pad（R2，GND）＋thermal：環隙要挖開，輻條要留著
  // pad 半寬 0.5，環隙落在 0.5~0.5+CL 之間；輻條沿 0/90/180/270 度
  const ringR = 0.5 + CL * 0.5;
  ok(cu(10 + ringR, 0), '1 熱風焊盤：0 度方向應有輻條（銅）');
  ok(cu(10, 0 + ringR), '1 熱風焊盤：90 度方向應有輻條（銅）');
  ok(cu(10 - ringR, 0), '1 熱風焊盤：180 度方向應有輻條（銅）');
  ok(cu(10, 0 - ringR), '1 熱風焊盤：270 度方向應有輻條（銅）');
  // 45 度方向是環隙，必須是空的——否則等於實心連接、失去熱風焊盤的意義
  const dg = ringR / Math.SQRT2;
  ok(!cu(10 + dg, 0 + dg), '1 熱風焊盤：45 度方向應為環隙（無銅）');
  ok(!cu(10 - dg, 0 + dg), '1 熱風焊盤：135 度方向應為環隙（無銅）');
  ok(!cu(10 - dg, 0 - dg), '1 熱風焊盤：225 度方向應為環隙（無銅）');
  ok(!cu(10 + dg, 0 - dg), '1 熱風焊盤：315 度方向應為環隙（無銅）');

  // 輻條數要剛好 4 根：繞一圈數銅／空的交替次數
  {
    let runs = 0, prev = null;
    for (let a = 0; a < 360; a += 1) {
      const th = a * Math.PI / 180;
      const v = cu(10 + ringR * Math.cos(th), 0 + ringR * Math.sin(th));
      if (prev !== null && v !== prev) runs++;
      prev = v;
    }
    ok(runs === 8, `1 熱風焊盤繞一圈應有 4 段銅（8 次明暗交替，得 ${runs}）`);
  }
}

// ---------- 2) 關掉 thermal ----------
{
  const cu = fcuOf(board({ thermal: false }));
  // 同網 pad 應為實心：環隙位置也該有銅
  const ringR = 0.5 + CL * 0.5;
  const dg = ringR / Math.SQRT2;
  ok(cu(10 + dg, 0 + dg), '2 關掉 thermal 後同網 pad 應實心連接（45 度也有銅）');
  ok(cu(10, 0 + ringR), '2 關掉 thermal 後 90 度方向仍有銅');
  // 異網那一側行為不變
  ok(!cu(-10 + 0.5 + CL * 0.5, 0), '2 關掉 thermal 不影響異網 pad 的避讓');
  ok(!cu(0, -8 + 0.15 + CL * 0.5), '2 關掉 thermal 不影響異網走線的避讓');
}

// ---------- 3) 沒有鋪銅時不可憑空生出銅 ----------
{
  const st = board(); st.userZones = [];
  const cu = fcuOf(st);
  ok(!cu(-15, 10), '3 沒有鋪銅時空曠處不可有銅');
  ok(cu(-10, 0), '3 沒有鋪銅時 pad 本身仍要有銅');
}


// ---------- 4) 孤島：偵測出來的要真的沒進 Gerber ----------
{
  const Pour = require('./pcb-pour.js');
  // 20x20 GND 鋪銅，中間一條 SIG 走線切成上下兩半；GND 連接點只在下半。
  const st = {
    boardWidth: 40, boardHeight: 30, layers: 2,
    layerStack: [
      { id: 'F.Cu', kind: 'copper', type: 'Signal' }, { id: 'B.Cu', kind: 'copper', type: 'Signal' },
      { id: 'F.SilkS', kind: 'silk' }, { id: 'B.SilkS', kind: 'silk' }, { id: 'Edge.Cuts', kind: 'edge' }
    ],
    visibleLayers: ['F.Cu', 'B.Cu', 'F.SilkS', 'B.SilkS', 'Edge.Cuts'],
    components: [{ id: 'g', ref: 'J1', x: 0, y: -8, rot: 0, pads: [{ x: 0, y: 0, w: 1, h: 1, shape: 'rect', side: 'F', net: 'GND' }] }],
    traces: [{ x1: -12, y1: 0, x2: 12, y2: 0, width: 1.0, layer: 'F.Cu', net: 'SIG' }],
    vias: [], zones: [], zoneFills: [], texts: [], keepouts: [], kicadArcs: [], teardrops: [],
    userZones: [{ layer: 'F.Cu', net: 'GND', clearance: 0.3, thermal: true, user: true,
                  pts: [[-10, -10], [10, -10], [10, 10], [-10, 10]] }]
  };

  // 挖除之前：上半有銅（那就是孤島）
  const before = fcuOf(st);
  ok(before(0, 5), '4 未處理時上半有銅——那塊就是孤島');
  ok(before(0, -5), '4 下半本來就有銅');

  const rep = Pour.apply(st, padAbs, { res: 0.2 });
  ok(rep.islands >= 1, `4 應偵測到孤島（得 ${rep.islands}）`);
  ok(rep.areaMm2 > 100, `4 孤島面積應可觀（得 ${rep.areaMm2}）`);

  // 挖除之後：上半不可再有銅，下半不受影響
  const after = fcuOf(st);
  ok(!after(0, 5), '4 孤島挖除後上半不可再有鋪銅');
  ok(!after(-8, 8), '4 孤島角落也要挖乾淨');
  ok(!after(8, 3), '4 孤島右側也要挖乾淨');
  ok(after(0, -5), '4 有連接的下半必須保留');
  ok(after(-8, -8), '4 下半角落也要保留');
  ok(after(0, -8), '4 GND pad 本體仍在');

  // 上半補一顆 GND via → 不再是孤島，銅要回來
  st.userZones[0].orphanCuts = [];
  st.vias = [{ x: 0, y: 5, od: 0.7, id: 0.3, net: 'GND' }];
  const rep2 = Pour.apply(st, padAbs, { res: 0.2 });
  ok(rep2.islands === 0, `4 上半接上 GND 後不應再有孤島（得 ${rep2.islands}）`);
  const back = fcuOf(st);
  ok(back(3, 5), '4 接上之後上半的鋪銅應該回來');
}

console.log(`\ngerber-pour.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
