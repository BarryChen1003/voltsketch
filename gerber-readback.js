/**
 * gerber-readback.js — 把匯出的 Gerber 解析回幾何，跟原始板比對（node，無瀏覽器）
 *
 * 為什麼要跟 gerber-check.js 分開：
 *   gerber-check 驗的是「檔案結構對不對」——表頭、層數、鑽孔數、行數。
 *   結構全對，銅箔畫錯位置或線寬給錯，它一樣是綠的。
 *   板廠拿到的是幾何，不是行數。這支反過來做：讀回 RS-274X，重建出
 *   每一層有哪些線段與焊盤，再回頭問「原始板上的每一條走線都在裡面嗎、
 *   位置對嗎、線寬對嗎」，以及「有沒有多出原本不存在的銅」。
 *
 * 驗項（每片公版）：
 *   - 每條走線都在對應銅層的 Gerber 裡找得到（端點誤差 < 1µm）
 *   - 該走線用的孔徑（aperture）直徑 = 走線寬度
 *   - Gerber 裡的線段數 = 原始走線數（不多不少，沒有幽靈銅箔）
 *   - 走線只出現在它自己那一層，不會漏到別層
 *   - 每個表面 pad 在對應層有 flash 或 region，座標對得上
 *   - 孔徑表裡沒有未被使用的定義、也沒有用到未定義的 D 碼
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

// ---------- DOM stub（載 pcb.js 但不跑 init）----------
const noop = () => {};
const ctxStub = new Proxy({}, { get: () => () => undefined });
const canvasStub = { width: 680, height: 478, getContext: () => ctxStub, getBoundingClientRect: () => ({ left: 0, top: 0, width: 680, height: 478 }), addEventListener: noop, style: {}, parentElement: { clientWidth: 680, clientHeight: 478 } };
const docStub = { querySelector: (s) => (s === '#pcbCanvas' ? canvasStub : null), querySelectorAll: () => [], getElementById: () => null, createElement: () => ({ addEventListener: noop, style: {}, click: noop }), addEventListener: noop, body: {} };
const lsStub = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };
global.window = { I18N: null, localStorage: lsStub, addEventListener: noop, innerWidth: 1280, innerHeight: 720 };
global.document = docStub; global.localStorage = lsStub; global.window.document = docStub;

const fs = require('fs');
try { require('./ic-data.js'); } catch (e) {}
require('./footprint-gen.js'); require('./parts-lib.js'); require('./pcb-ref-fp.js');
require('./pcb-refboards.js'); require('./pcb-history.js');
global.GerberExport = require('./supabase/functions/_shared/gerber.mjs');
['PcbHistory', 'FootprintGen', 'RefFP', 'PartsLib', 'PCB_REFBOARDS', 'IC_DATA'].forEach(k => { global[k] = global.window[k]; });

let src = fs.readFileSync('./pcb.js', 'utf8').replace(/pcbApp\.init\(\);\s*/m, '');
eval(src);
const app = global.window.pcbApp;
['render', 'renderPartsList', 'syncSelPanel', 'populateEmiSelects', 'renderLayerList', 'toast', 'checkTraceRules'].forEach(m => { app[m] = noop; });
app.canvas = canvasStub; app.ctx = ctxStub;

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL: ' + m); } };
const padAbs = (comp, pad) => { const th = (comp.rot || 0) * Math.PI / 180, c = Math.cos(th), s = Math.sin(th); return { x: comp.x + pad.x * c + pad.y * s, y: comp.y - pad.x * s + pad.y * c }; };

// ---------- RS-274X 讀回 ----------
// 只認匯出端真的會產生的那幾種指令：孔徑定義、選孔徑、G01/G03 走線、D01/D02/D03、
// 以及 G36/G37 區域填充。看到不認得的指令就記下來，避免「靜靜忽略」。
function parseGerber(text) {
  const apertures = new Map();       // 'D10' -> {shape:'C', dims:[0.25]}
  const segs = [];                   // {x1,y1,x2,y2,d}  d = 孔徑直徑
  const flashes = [];                // {x,y,d}
  const regions = [];                // {pts:[[x,y],...]}
  const usedD = new Set();
  const unknown = [];
  let curD = null, cx = null, cy = null, inRegion = false, regPts = [];

  for (const raw of text.split(/\r?\n/)) {
    const ln = raw.trim();
    if (!ln) continue;
    let m;
    if ((m = /^%ADD(\d+)([A-Z]),([\d.Xx]+)\*%$/.exec(ln))) {
      apertures.set('D' + m[1], { shape: m[2], dims: m[3].split(/[Xx]/).map(Number) });
      continue;
    }
    if (/^%/.test(ln) || /^G04/.test(ln) || ln === 'M02*' || /^%LP/.test(ln)) continue;
    if ((m = /^(D\d+)\*$/.exec(ln))) { curD = m[1]; usedD.add(curD); continue; }
    if (ln === 'G36*') { inRegion = true; regPts = []; continue; }
    if (ln === 'G37*') { inRegion = false; if (regPts.length >= 3) regions.push({ pts: regPts.slice() }); continue; }
    if (/^G0[13]\*$/.test(ln)) continue;
    if ((m = /^(?:G0[13])?X(-?\d+)Y(-?\d+)(?:I(-?\d+)J(-?\d+))?D(0[123])\*$/.exec(ln))) {
      const x = +m[1] / 1e6, y = -(+m[2]) / 1e6, op = m[5];
      if (op === '02') { cx = x; cy = y; if (inRegion) regPts = [[x, y]]; }
      else if (op === '01') {
        if (inRegion) regPts.push([x, y]);
        else {
          const ap = apertures.get(curD);
          segs.push({ x1: cx, y1: cy, x2: x, y2: y, d: ap ? ap.dims[0] : null, ap: curD, arc: !!m[3] });
        }
        cx = x; cy = y;
      } else {                                   // D03 flash
        const ap = apertures.get(curD);
        flashes.push({ x, y, d: ap ? ap.dims[0] : null, ap: curD, shape: ap ? ap.shape : null });
        cx = x; cy = y;
      }
      continue;
    }
    unknown.push(ln);
  }
  return { apertures, segs, flashes, regions, usedD, unknown };
}

const near = (a, b, tol) => Math.abs(a - b) <= (tol == null ? 1e-6 : tol);
// 點在多邊形內（射線法）。pad 畫成 G36/G37 region 時，「附近有沒有頂點」不是正確判準：
// 1.4x0.2 的 roundrect，角頂點離中心 0.658mm，用距離門檻不是太鬆就是太緊。
const inPoly = (x, y, pts) => {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
};
const sameSeg = (s, t, tol) =>
  (near(s.x1, t.x1, tol) && near(s.y1, t.y1, tol) && near(s.x2, t.x2, tol) && near(s.y2, t.y2, tol)) ||
  (near(s.x1, t.x2, tol) && near(s.y1, t.y2, tol) && near(s.x2, t.x1, tol) && near(s.y2, t.y1, tol));

const boards = global.PCB_REFBOARDS || [];
ok(boards.length >= 8, `應有 8 片以上公版（得 ${boards.length}）`);

let totalTraces = 0, totalSegs = 0;

for (const b of boards) {
  app.loadRefBoard(b.id);
  const st = app.state;
  const r = global.GerberExport.build(st, padAbs, b.id);
  const tag = b.id;

  const cuLayers = (st.layerStack || []).filter(l => l.kind === 'copper').map(l => l.id);
  const parsed = {};
  for (const lid of cuLayers) {
    // 檔名慣例：<id>-<Layer>.gbr，層 id 的點換成底線
    const key = lid.replace(/\./g, '_');
    const f = r.files.find(x => new RegExp(key + '\\.gbr$').test(x.name) || x.name.indexOf(key) >= 0);
    if (!f) continue;
    parsed[lid] = parseGerber(f.text);
  }
  ok(Object.keys(parsed).length === cuLayers.length,
     `${tag}: 每個銅層都要找得到並解析成功（${Object.keys(parsed).length}/${cuLayers.length}）`);

  // 1) 沒有解析不了的指令——有的話代表匯出用了這支沒認得的語法，不能當作沒事
  for (const lid of Object.keys(parsed)) {
    const u = parsed[lid].unknown;
    ok(u.length === 0, `${tag}/${lid}: 應無法解析不了的 Gerber 指令（${u.length} 行，例：${u[0] || ''}）`);
  }

  // 2) 每條走線都要在它自己那一層找得到，端點與線寬都對
  const missing = [], wrongW = [], leaked = [];
  for (const t of (st.traces || [])) {
    const lid = t.layer || 'F.Cu';
    const P = parsed[lid];
    if (!P) { missing.push(t); continue; }
    const hit = P.segs.find(s => sameSeg(s, t, 1e-6));
    if (!hit) { missing.push(t); continue; }
    if (!near(hit.d, t.width || 0.3, 1e-6)) wrongW.push({ t, got: hit.d });
    // 同一條線不該同時出現在別層
    for (const other of Object.keys(parsed)) {
      if (other === lid) continue;
      if (parsed[other].segs.some(s => sameSeg(s, t, 1e-6))) { leaked.push({ t, other }); break; }
    }
  }
  ok(missing.length === 0, `${tag}: 每條走線都要出現在 Gerber 裡（漏 ${missing.length}/${(st.traces || []).length}）`);
  ok(wrongW.length === 0, `${tag}: 走線孔徑直徑要等於線寬（不符 ${wrongW.length}${wrongW[0] ? `，例 ${wrongW[0].t.width}→${wrongW[0].got}` : ''}）`);
  ok(leaked.length === 0, `${tag}: 走線不可漏到別的銅層（${leaked.length} 條）`);

  // 3) 不可有多出來的銅箔線段：Gerber 的線段數要等於該層走線數
  //    （pad 走 flash/region、板框在 Edge_Cuts，都不會計入這裡）
  for (const lid of Object.keys(parsed)) {
    const want = (st.traces || []).filter(t => (t.layer || 'F.Cu') === lid).length;
    const got = parsed[lid].segs.filter(s => !s.arc).length;
    ok(got === want, `${tag}/${lid}: Gerber 線段數 ${got} = 原始走線數 ${want}（多出來＝幽靈銅箔）`);
    totalTraces += want; totalSegs += got;
  }

  // 4) 表面 pad 要有對應的銅（flash 或 region），座標對得上
  const surfacePads = [];
  (st.components || []).forEach(c => (c.pads || []).forEach(p => {
    if (p.cu === false) return;
    const a = padAbs(c, p);
    const lid = p.side === 'B' ? 'B.Cu' : 'F.Cu';
    if (p.side === '*') { surfacePads.push({ a, lid: 'F.Cu' }); surfacePads.push({ a, lid: 'B.Cu' }); }
    else surfacePads.push({ a, lid });
  }));
  let padMiss = 0;
  for (const sp of surfacePads) {
    const P = parsed[sp.lid];
    if (!P) { padMiss++; continue; }
    const byFlash = P.flashes.some(f => near(f.x, sp.a.x, 0.002) && near(f.y, sp.a.y, 0.002));
    // pad 中心必須真的落在銅裡面，不是「附近有銅」
    const byRegion = P.regions.some(rg => inPoly(sp.a.x, sp.a.y, rg.pts));
    if (!byFlash && !byRegion) padMiss++;
  }
  ok(padMiss === 0, `${tag}: 每個表面 pad 都要有對應銅箔（漏 ${padMiss}/${surfacePads.length}）`);

  // 5) 孔徑表要乾淨：用到的都有定義，定義了的都有用到
  for (const lid of Object.keys(parsed)) {
    const P = parsed[lid];
    const undef = [...P.usedD].filter(d => !P.apertures.has(d));
    const unused = [...P.apertures.keys()].filter(d => !P.usedD.has(d));
    ok(undef.length === 0, `${tag}/${lid}: 不可使用未定義的孔徑（${undef.join(',')}）`);
    ok(unused.length === 0, `${tag}/${lid}: 不可定義了卻沒用到的孔徑（${unused.join(',')}）`);
  }
}

// 防「0/0 假通過」：真的有讀到東西才算數
ok(totalTraces > 100, `全部公版的走線數應 >100（得 ${totalTraces}），否則這支等於沒驗`);
ok(totalSegs === totalTraces, `Gerber 線段總數 ${totalSegs} = 走線總數 ${totalTraces}`);

console.log(`\ngerber-readback: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
