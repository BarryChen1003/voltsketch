/**
 * odb-check.js — ODB++ 匯出正確性驗證（node，無瀏覽器）
 *
 * 為什麼要這支：ODB++ 是「有結構」的格式，錯法跟 Gerber 不一樣——
 * 檔案長得像模像樣、CAM 也開得起來，但層別對錯、符號編號指到不存在的符號、
 * 座標少翻一次 Y，都是打樣之後才會發現的錯。所以這裡不只看檔案在不在，
 * 而是把 features 讀回來跟版面資料逐筆比對（readback）。
 *
 * 驗項（每片公版跑一次）：
 *   - 結構：matrix/matrix、misc/info、stephdr、profile、每個銅層與 drill 的 features
 *   - matrix：LAYER 筆數 = 銅層 + 1；DRILL 的 START/END 對得上頭尾銅層
 *   - 符號：features 用到的每個 $n 都有定義（指到不存在的符號＝CAM 端整層爆掉）
 *   - 計數：每層 L 記錄數 = 該層走線數；P 記錄數 = 該層 pad 數 + via 數
 *   - readback：每筆 L 記錄的座標都對得上某條走線（含 Y 翻正），容差 1e-6
 *   - 鑽孔：drill 層 P 數 = via + THT pad，且座標對得上
 *   - 界內：所有座標落在板框 +2mm 內
 *   - 決定性：同一片板連跑兩次，位元組完全相同
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
['PcbHistory', 'FootprintGen', 'RefFP', 'PartsLib', 'PCB_REFBOARDS', 'IC_DATA'].forEach(k => { global[k] = global.window[k]; });

let src = fs.readFileSync('./pcb.js', 'utf8').replace(/pcbApp\.init\(\);\s*/m, '');
eval(src);
const app = global.window.pcbApp;
['render', 'renderPartsList', 'syncSelPanel', 'populateEmiSelects', 'renderLayerList', 'toast', 'checkTraceRules'].forEach(m => { app[m] = noop; });
app.canvas = canvasStub; app.ctx = ctxStub;

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL: ' + m); } };
const padAbs = (comp, pad) => { const th = (comp.rot || 0) * Math.PI / 180, c = Math.cos(th), s = Math.sin(th); return { x: comp.x + pad.x * c + pad.y * s, y: comp.y - pad.x * s + pad.y * c }; };

// ---------- features 解析（把檔案讀回成記錄）----------
function parseFeatures(text) {
  const syms = new Map();
  const lines = [], pads = [], surfaces = [];
  const used = new Set();
  for (const raw of text.split(String.fromCharCode(10))) {
    const ln = raw.trim();
    if (!ln || ln.startsWith('#')) continue;
    if (ln.startsWith('$')) {
      const m = /^\$(\d+)\s+(.+)$/.exec(ln);
      if (m) syms.set(+m[1], m[2]);
      continue;
    }
    const t = ln.split(/\s+/);
    if (t[0] === 'L') {
      used.add(+t[5]);
      lines.push({ x1: +t[1], y1: -(+t[2]), x2: +t[3], y2: -(+t[4]), sym: +t[5] });
    } else if (t[0] === 'P') {
      used.add(+t[3]);
      pads.push({ x: +t[1], y: -(+t[2]), sym: +t[3] });
    } else if (t[0] === 'S') {
      surfaces.push({});
    }
  }
  return { syms, lines, pads, surfaces, used };
}

(async () => {
  const mod = await import('./supabase/functions/_shared/odbpp.mjs');
  const boards = global.PCB_REFBOARDS || [];
  ok(boards.length > 0, 'PCB_REFBOARDS 應載入');

  for (const b of boards) {
    app.loadRefBoard(b.id);
    const st = app.state;
    const r = mod.build(st, padAbs, b.id);
    const tag = b.id;
    const cu = (st.layerStack || []).filter(l => l.kind === 'copper');
    const nameOf = i => (i === 0 ? 'top' : i === cu.length - 1 ? 'bot' : 'in' + i);
    const get = suffix => r.files.find(f => f.name === b.id + suffix);

    // 1) 結構
    ok(!!get('/matrix/matrix'), `${tag}: 有 matrix/matrix`);
    ok(!!get('/misc/info'), `${tag}: 有 misc/info`);
    ok(!!get('/steps/pcb/stephdr'), `${tag}: 有 stephdr`);
    ok(!!get('/steps/pcb/profile'), `${tag}: 有 profile`);
    ok(!!get('/steps/pcb/layers/drill/features'), `${tag}: 有 drill 層`);
    cu.forEach((l, i) => ok(!!get('/steps/pcb/layers/' + nameOf(i) + '/features'), `${tag}: 有 ${nameOf(i)} 層`));

    // 2) matrix 的層數與鑽孔跨層
    const matrix = get('/matrix/matrix');
    if (matrix) {
      const rows = (matrix.text.match(/LAYER \{/g) || []).length;
      ok(rows === cu.length + 1, `${tag}: matrix LAYER 筆數 ${rows} = 銅層 ${cu.length} + drill`);
      ok(matrix.text.includes('START_NAME=' + nameOf(0).toUpperCase()),
         `${tag}: drill 起始層 = ${nameOf(0).toUpperCase()}`);
      ok(matrix.text.includes('END_NAME=' + nameOf(cu.length - 1).toUpperCase()),
         `${tag}: drill 結束層 = ${nameOf(cu.length - 1).toUpperCase()}`);
    }

    // 3) 每層：符號完整、計數、readback、界內
    const halfW = st.boardWidth / 2 + 2, halfH = st.boardHeight / 2 + 2;
    cu.forEach((layer, i) => {
      const f = get('/steps/pcb/layers/' + nameOf(i) + '/features');
      if (!f) return;
      ok(!/NaN|undefined/.test(f.text), `${tag}/${nameOf(i)}: 無 NaN/undefined`);
      const p = parseFeatures(f.text);
      const missing = [...p.used].filter(s => !p.syms.has(s));
      ok(missing.length === 0, `${tag}/${nameOf(i)}: 每個用到的符號都有定義（缺 ${missing.length}）`);

      const srcTraces = (st.traces || []).filter(t => (t.layer || 'F.Cu') === layer.id);
      const srcArcs = (st.kicadArcs || []).filter(a => a.layer === layer.id);
      ok(p.lines.length === srcTraces.length + srcArcs.length,
         `${tag}/${nameOf(i)}: L 記錄 ${p.lines.length} = 走線 ${srcTraces.length} + 弧 ${srcArcs.length}`);

      const onLayer = side => side === '*' || (side === 'F' && i === 0) || (side === 'B' && i === cu.length - 1);
      let srcPads = 0;
      (st.components || []).forEach(c => (c.pads || []).forEach(pd => { if (pd.cu !== false && onLayer(pd.side)) srcPads++; }));
      ok(p.pads.length === srcPads + (st.vias || []).length,
         `${tag}/${nameOf(i)}: P 記錄 ${p.pads.length} = pad ${srcPads} + via ${(st.vias || []).length}`);

      // readback：每筆 L 都要對得上一條真的走線（Y 翻正是最容易漏的一步）
      const unmatched = p.lines.filter(L2 => !srcTraces.concat(srcArcs).some(t =>
        Math.abs(t.x1 - L2.x1) < 1e-5 && Math.abs(t.y1 - L2.y1) < 1e-5 &&
        Math.abs(t.x2 - L2.x2) < 1e-5 && Math.abs(t.y2 - L2.y2) < 1e-5));
      ok(unmatched.length === 0, `${tag}/${nameOf(i)}: 每筆 L 都對得上版面走線（對不上 ${unmatched.length}）`);

      const oob = p.lines.filter(L2 => Math.abs(L2.x1) > halfW || Math.abs(L2.y1) > halfH || Math.abs(L2.x2) > halfW || Math.abs(L2.y2) > halfH)
        .concat(p.pads.filter(q => Math.abs(q.x) > halfW || Math.abs(q.y) > halfH));
      ok(oob.length === 0, `${tag}/${nameOf(i)}: 座標在板框內（越界 ${oob.length}）`);
    });

    // 4) 鑽孔層
    const drill = get('/steps/pcb/layers/drill/features');
    if (drill) {
      const p = parseFeatures(drill.text);
      let tht = 0;
      const targets = (st.vias || []).map(v => ({ x: v.x, y: v.y }));
      (st.components || []).forEach(c => (c.pads || []).forEach(pd => {
        if (pd.drill > 0) { tht++; targets.push(padAbs(c, pd)); }
      }));
      ok(p.pads.length === tht + (st.vias || []).length,
         `${tag}: drill P 記錄 ${p.pads.length} = THT pad ${tht} + via ${(st.vias || []).length}`);
      const bad = p.pads.filter(h => !targets.some(t => Math.hypot(h.x - t.x, h.y - t.y) < 1e-5));
      ok(bad.length === 0, `${tag}: 每個鑽孔都對得上 pad/via（對不上 ${bad.length}）`);
    }

    // 5) profile 是封閉面
    const prof = get('/steps/pcb/profile');
    if (prof) {
      ok(/^S P 0/m.test(prof.text) && /^OB /m.test(prof.text) && /^OE$/m.test(prof.text) && /^SE$/m.test(prof.text),
         `${tag}: profile 有完整的 S/OB/OE/SE`);
      const os = (prof.text.match(/^OS /gm) || []).length;
      ok(os >= 3, `${tag}: profile 至少 3 段（實際 ${os}）`);
    }

    // 6) 決定性：同一片板連跑兩次要位元組相同（有時間戳就會壞在這裡）
    const again = mod.build(st, padAbs, b.id);
    ok(JSON.stringify(again.files) === JSON.stringify(r.files), `${tag}: 連跑兩次輸出相同`);

    // 7) 誠實警告要帶回去
    ok(r.warnings.some(w => w.k === 'odb_w_subset'), `${tag}: 要回報「這是子集」的警告`);
  }

  console.log(`odb-check: ${pass} passed, ${fail} failed（跨 ${boards.length} 片公版）`);
  process.exit(fail ? 1 : 0);
})();
