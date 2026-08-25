/**
 * gerber-mfg.test.js — 製造功能真的有進到匯出檔（node，無瀏覽器）
 *
 * pcb-mfg.test.js 驗的是「算出來的幾何對不對」。這支驗的是下一段：
 * 那些幾何有沒有真的變成板廠收得到的東西——淚滴要在銅層的 Gerber 裡、
 * 郵票孔要在 NPTH 鑽孔檔裡、鑽孔表要跟前端面板顯示的一模一樣。
 *
 * 最後一項是刻意的：鑽孔表在前端（pcb-mfg.js，給面板看）與後端
 * （gerber.mjs，實際送廠）各有一份實作。兩份分岔的話，使用者看到的表
 * 跟送出去的表就會不一樣，而且不會有人發現。這裡逐列比對把它們釘在一起。
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

const fs = require('fs');
try { require('./ic-data.js'); } catch (e) {}
require('./footprint-gen.js'); require('./parts-lib.js'); require('./pcb-ref-fp.js');
require('./pcb-refboards.js'); require('./pcb-history.js');
const Mfg = require('./pcb-mfg.js');
const GerberExport = require('./supabase/functions/_shared/gerber.mjs');
['PcbHistory', 'FootprintGen', 'RefFP', 'PartsLib', 'PCB_REFBOARDS', 'IC_DATA'].forEach(k => { global[k] = global.window[k]; });

let src = fs.readFileSync('./pcb.js', 'utf8').replace(/pcbApp\.init\(\);\s*/m, '');
eval(src);
const app = global.window.pcbApp;
['render', 'renderPartsList', 'syncSelPanel', 'populateEmiSelects', 'renderLayerList', 'toast', 'checkTraceRules'].forEach(m => { app[m] = noop; });
app.canvas = canvasStub; app.ctx = ctxStub;

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL: ' + m); } };
const eq = (a, b, m) => ok(a === b, `${m} (得 ${JSON.stringify(a)}，期望 ${JSON.stringify(b)})`);
const padAbs = (comp, pad) => { const th = (comp.rot || 0) * Math.PI / 180, c = Math.cos(th), s = Math.sin(th); return { x: comp.x + pad.x * c + pad.y * s, y: comp.y - pad.x * s + pad.y * c }; };

const fileOf = (r, frag) => r.files.find(f => f.name.indexOf(frag) >= 0);
const regionCount = text => (text.match(/G36\*/g) || []).length;
const drillCoords = text => {
  const out = []; const re = /^X(-?[\d.]+)Y(-?[\d.]+)/gm; let m;
  while ((m = re.exec(text))) out.push({ x: +m[1], y: -(+m[2]) });
  return out;
};

// ============ 1) 淚滴進得了銅層 ============
{
  const base = {
    boardWidth: 40, boardHeight: 30, layers: 2,
    layerStack: [{ id: 'F.Cu', kind: 'copper', type: 'Signal' }, { id: 'B.Cu', kind: 'copper', type: 'Signal' },
      { id: 'F.SilkS', kind: 'silk' }, { id: 'B.SilkS', kind: 'silk' }, { id: 'Edge.Cuts', kind: 'edge' }],
    visibleLayers: ['F.Cu', 'B.Cu', 'F.SilkS', 'B.SilkS', 'Edge.Cuts'],
    components: [{ id: 'u', ref: 'U1', x: 0, y: 0, rot: 0, pads: [{ x: 0, y: 0, w: 2, h: 2, side: 'F', net: 'SIG' }] }],
    traces: [{ x1: 0, y1: 0, x2: 10, y2: 0, width: 0.3, layer: 'F.Cu', net: 'SIG' }],
    vias: [], zones: [], zoneFills: [], userZones: [], keepouts: [], texts: [], kicadArcs: [], teardrops: []
  };
  const before = GerberExport.build(base, padAbs, 'td');
  const nBefore = regionCount(fileOf(before, 'F_Cu').text);

  const td = Mfg.Teardrops.build(base, padAbs, { clearance: 0.15 });
  eq(td.teardrops.length, 1, '1 測試板應算得出 1 顆淚滴');
  const withTd = Object.assign({}, base, { teardrops: td.teardrops });
  const after = GerberExport.build(withTd, padAbs, 'td');
  const fcu = fileOf(after, 'F_Cu').text;
  eq(regionCount(fcu), nBefore + 1, '1 淚滴應在 F.Cu 多出一個 region');

  // 座標要真的出現在檔案裡（不是畫在別的地方）
  const pt = td.teardrops[0].pts[0];
  const enc = v => String(Math.round(v * 1e6));
  ok(fcu.indexOf('X' + enc(pt[0])) >= 0, '1 淚滴頂點的 X 座標應出現在 F.Cu');
  // 放到 B.Cu 就不該出現在 F.Cu
  const onB = Object.assign({}, base, { teardrops: [Object.assign({}, td.teardrops[0], { layer: 'B.Cu' })] });
  const rb = GerberExport.build(onB, padAbs, 'td');
  eq(regionCount(fileOf(rb, 'F_Cu').text), nBefore, '1 B.Cu 的淚滴不可畫到 F.Cu');
  eq(regionCount(fileOf(rb, 'B_Cu').text), regionCount(fileOf(before, 'B_Cu').text) + 1, '1 B.Cu 的淚滴應畫在 B.Cu');
}

// ============ 2) 郵票孔進得了 NPTH ============
{
  const st = {
    boardWidth: 50, boardHeight: 40, layers: 2,
    layerStack: [{ id: 'F.Cu', kind: 'copper', type: 'Signal' }, { id: 'B.Cu', kind: 'copper', type: 'Signal' },
      { id: 'F.SilkS', kind: 'silk' }, { id: 'B.SilkS', kind: 'silk' }, { id: 'Edge.Cuts', kind: 'edge' }],
    visibleLayers: ['F.Cu', 'B.Cu', 'F.SilkS', 'B.SilkS', 'Edge.Cuts'],
    components: [], traces: [], vias: [{ x: 0, y: 0, od: 0.7, id: 0.3, net: 'A' }],
    zones: [], zoneFills: [], userZones: [], keepouts: [], texts: [], kicadArcs: [], teardrops: []
  };
  const plan = Mfg.Panel.plan(st, { cols: 2, rows: 1, rail: 5, gap: 2, method: 'mousebite' });
  const pan = Mfg.Panel.apply(st, plan);
  ok(pan.panelBites.length > 0, '2 拼板應產生郵票孔');

  const r = GerberExport.build(pan, padAbs, 'mb');
  const npth = fileOf(r, 'NPTH.drl');
  ok(!!npth, '2 應產生 NPTH 鑽孔檔');
  const holes = drillCoords(npth.text);
  eq(holes.length, pan.panelBites.length, '2 NPTH 孔數應等於郵票孔數');
  // 每個郵票孔都要在檔案裡找得到（容差 1µm）
  const missing = pan.panelBites.filter(b => !holes.some(h => Math.abs(h.x - b.x) < 0.001 && Math.abs(h.y - b.y) < 0.001));
  eq(missing.length, 0, '2 每個郵票孔都應出現在 NPTH 檔');
  // 郵票孔不可跑進 PTH
  const pth = drillCoords(fileOf(r, 'PTH.drl').text);
  eq(pth.length, r.drillCounts.pth, '2 PTH 數應與統計一致');
  ok(pan.panelBites.every(b => !pth.some(h => Math.abs(h.x - b.x) < 0.001 && Math.abs(h.y - b.y) < 0.001)),
     '2 郵票孔不可被算成鍍通孔');
}

// ============ 3) 鑽孔表：前端與後端必須逐列一致 ============
{
  const parseTable = text => text.split(/\r?\n/)
    .filter(l => /^T\d+\s/.test(l))
    .map(l => {
      const m = /^T(\d+)\s+([\d.]+)\s+(PTH|NPTH)\s+(\d+)(.*)$/.exec(l.trim());
      return m ? { tool: +m[1], size: +m[2], plated: m[3] === 'PTH', count: +m[4], warn: /BELOW FAB MIN/.test(m[5]) } : null;
    }).filter(Boolean);

  const boards = global.PCB_REFBOARDS || [];
  ok(boards.length >= 8, `3 應有 8 片以上公版（得 ${boards.length}）`);
  let totalRows = 0;
  for (const b of boards) {
    app.loadRefBoard(b.id);
    const st = app.state;
    const r = GerberExport.build(st, padAbs, b.id);
    const f = fileOf(r, 'DrillTable.txt');
    ok(!!f, `${b.id}: 製造包應含鑽孔表`);
    if (!f) continue;
    const exported = parseTable(f.text);
    const frontend = Mfg.DrillTable.build(st, padAbs, null);
    eq(exported.length, frontend.length, `${b.id}: 前後端刀具數應一致`);
    totalRows += exported.length;
    let diff = 0;
    exported.forEach((e, i) => {
      const g = frontend[i];
      if (!g) { diff++; return; }
      if (Math.abs(e.size - g.size) > 1e-9 || e.plated !== g.plated || e.count !== g.count || e.tool !== g.tool) diff++;
    });
    eq(diff, 0, `${b.id}: 前後端鑽孔表逐列必須一致（不一致 ${diff} 列）`);
    // 總孔數要對得上 Excellon 實際輸出
    const total = exported.reduce((a, x) => a + x.count, 0);
    eq(total, r.drillCounts.pth + r.drillCounts.npth + r.drillCounts.slots,
       `${b.id}: 鑽孔表總數應等於 PTH+NPTH+槽`);
    ok(/Total holes: /.test(f.text), `${b.id}: 鑽孔表應有總計行`);
  }
  ok(totalRows > 10, `3 全部公版加起來應有 >10 列刀具（得 ${totalRows}），否則等於沒驗`);

  // 公版裡沒有開槽 pad 也沒有 NPTH pad，光靠它們釘不住那兩條規則。
  // 補一片把所有孔型都用到的合成板：一般鍍通孔、NPTH、開槽、via、郵票孔。
  {
    const st = {
      boardWidth: 60, boardHeight: 40, layers: 2,
      layerStack: [{ id: 'F.Cu', kind: 'copper', type: 'Signal' }, { id: 'B.Cu', kind: 'copper', type: 'Signal' },
        { id: 'F.SilkS', kind: 'silk' }, { id: 'B.SilkS', kind: 'silk' }, { id: 'Edge.Cuts', kind: 'edge' }],
      visibleLayers: ['F.Cu', 'B.Cu', 'F.SilkS', 'B.SilkS', 'Edge.Cuts'],
      components: [{
        id: 'j', ref: 'J1', x: 0, y: 0, rot: 0, pads: [
          { x: -8, y: 0, w: 1.6, h: 1.6, drill: 0.9, side: '*', net: 'A' },
          { x: -5, y: 0, w: 1.6, h: 1.6, drill: 0.9, side: '*', net: 'B' },
          { x: 0, y: 0, w: 3.4, h: 3.4, drill: 3.2, type: 'np_thru_hole', side: '*', net: '' },
          // 開槽短邊(1.2)刻意不等於 pad.drill(1.0)：兩者相同的話，前端漏掉開槽規則也看不出來
          { x: 6, y: 0, w: 3, h: 1.6, drill: 1.0, slot: { w: 2.4, h: 1.2 }, side: '*', net: 'C' }
        ]
      }],
      traces: [], vias: [{ x: 10, y: 5, od: 0.7, id: 0.3, net: 'A' }],
      panelBites: [{ x: 20, y: 0, d: 0.6 }, { x: 21, y: 0, d: 0.6 }],
      zones: [], zoneFills: [], userZones: [], keepouts: [], texts: [], kicadArcs: [], teardrops: []
    };
    const r = GerberExport.build(st, padAbs, 'mix');
    const exported = parseTable(fileOf(r, 'DrillTable.txt').text);
    const frontend = Mfg.DrillTable.build(st, padAbs, null);
    ok(exported.length >= 5, `3 混合孔型應有 >=5 種刀（得 ${exported.length}）`);
    eq(exported.length, frontend.length, '3 混合孔型：前後端刀具數應一致');
    let diff = 0;
    exported.forEach((e, i) => {
      const g = frontend[i];
      if (!g || Math.abs(e.size - g.size) > 1e-9 || e.plated !== g.plated || e.count !== g.count || e.tool !== g.tool) diff++;
    });
    eq(diff, 0, '3 混合孔型：前後端鑽孔表逐列必須一致');
    // 個別規則要真的被走到
    ok(frontend.some(x => Math.abs(x.size - 1.2) < 1e-9 && x.plated), '3 開槽應以短邊 1.2mm 計、且算鍍通');
    ok(frontend.some(x => Math.abs(x.size - 3.2) < 1e-9 && !x.plated), '3 np_thru_hole 應算 NPTH');
    ok(frontend.some(x => Math.abs(x.size - 0.6) < 1e-9 && !x.plated), '3 郵票孔應算 NPTH');
  }

  // 板廠下限警告要真的寫進檔案
  app.loadRefBoard(boards[0].id);
  const flagged = GerberExport.build(Object.assign({}, app.state, { fabMinDrill: 99 }), padAbs, 'x');
  ok(/BELOW FAB MIN 99mm/.test(fileOf(flagged, 'DrillTable.txt').text), '3 低於板廠下限要寫進鑽孔表');
  const clean = GerberExport.build(Object.assign({}, app.state, { fabMinDrill: 0.05 }), padAbs, 'x');
  ok(!/BELOW FAB MIN/.test(fileOf(clean, 'DrillTable.txt').text), '3 都合格時不可亂標警告');
}

console.log(`\ngerber-mfg.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
