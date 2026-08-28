/**
 * make-verify-boards.js — 產生「拿去真 CAM／CAD 開」的最小測試板
 *
 * 為什麼要專門造板而不是用公版：
 *   公版的 pad 幾乎都沒有 net、也沒有鋪銅與圓弧，正好避開了最容易爆的那些東西。
 *   這裡刻意把每一種「我們自己驗得過、但真工具可能不吃」的特徵都塞進去：
 *     圓弧走線（G02/G03）、鋪銅的內孔、熱風焊盤輻條、負極性、
 *     旋轉的矩形 pad、長圓 pad、通孔與盲埋孔、非矩形板框、內層。
 *
 * 產出到 verify-out/，每片板一個資料夾，裡面是可以直接丟給工具的檔案。
 * verify-out/ 已進 .gitignore（產物不進 repo）。
 *
 * 用法：node tools/make-verify-boards.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'verify-out');

global.window = {};
global.ClipperLib = require(path.join(ROOT, 'vendor/clipper-6.4.2.js'));
const PcbArc = require(path.join(ROOT, 'pcb-arc.js'));
global.window.PcbArc = PcbArc;
const PourGeom = require(path.join(ROOT, 'pcb-pour-geom.js'));
const FE = require(path.join(ROOT, 'footprint-editor.js'));

const padAbs = (c, p) => {
  const th = ((c.rot || 0) * Math.PI) / 180, co = Math.cos(th), s = Math.sin(th);
  return { x: c.x + p.x * co + p.y * s, y: c.y - p.x * s + p.y * co };
};

const CL = { traceToTrace: 0.2, traceToPad: 0.2, traceToEdge: 0.3, padToPad: 0.15, viaToVia: 0.2, holeToHole: 0.25 };
const RULES = {
  clearance: CL,
  width: { minTrace: 0.1, maxTrace: 20, minPowerTrace: 0.3 },
  via: { minDrill: 0.2, minRing: 0.15 },
  maskSliver: 0.15, compSpacing: 2, cinDist: 5,
};

// ---------------------------------------------------------------- 板子定義

/**
 * A. 幾何地獄板 —— 專門測「形狀對不對」
 * 圓弧走線、旋轉 pad、長圓 pad、通孔、非矩形板框。
 */
function boardGeometry() {
  const st = {
    name: 'A-geometry',
    boardWidth: 40, boardHeight: 30,
    layerStack: [{ id: 'F.Cu', kind: 'copper' }, { id: 'B.Cu', kind: 'copper' }],
    components: [], traces: [], vias: [], userZones: [], keepouts: [],
    // 非矩形板框：右上角切一個 45° 斜角。真 CAM 對 Profile 的封閉性很挑。
    edgeSegs: [
      { x1: -20, y1: -15, x2: 12, y2: -15 },
      { x1: 12, y1: -15, x2: 20, y2: -7 },
      { x1: 20, y1: -7, x2: 20, y2: 15 },
      { x1: 20, y1: 15, x2: -20, y2: 15 },
      { x1: -20, y1: 15, x2: -20, y2: -15 },
    ],
  };

  // 旋轉 45° 的 SOIC-8：矩形 pad 帶旋轉是最常被畫錯的一種
  const soic = FE.dual({ pins: 8, pitch: 1.27, span: 5.4, padW: 1.5, padH: 0.6, name: 'SOIC-8' });
  const u1 = FE.toComponent(soic, 'U1', -8, 0);
  u1.rot = 45;
  u1.pads.forEach((p, i) => { p.net = 'N' + (i + 1); p.side = 'F'; });
  st.components.push(u1);

  // 通孔 DIP：pad 1 方形、其餘圓形、全部有鑽孔
  const dip = FE.dual({ pins: 8, pitch: 2.54, span: 7.62, padW: 1.6, padH: 1.6, tht: true, drill: 0.8, name: 'DIP-8' });
  const u2 = FE.toComponent(dip, 'U2', 8, -8);
  u2.pads.forEach((p, i) => { p.net = 'T' + (i + 1); p.side = '*'; });
  st.components.push(u2);

  // 長圓 pad（oval）：CAM 端常用不同的近似方式
  st.components.push({
    id: 'j1', ref: 'J1', part: 'OVAL-2', x: 8, y: 8, rot: 30, side: 'top', kind: 'part', w: 4, h: 3,
    pads: [
      { num: 1, x: -1.2, y: 0, w: 2.0, h: 1.0, shape: 'oval', rot: 0, side: 'F', net: 'OV1' },
      { num: 2, x: 1.2, y: 0, w: 2.0, h: 1.0, shape: 'oval', rot: 90, side: 'F', net: 'OV2' },
    ],
  });

  // 真圓弧走線：90°、180°、以及一段小半徑的
  const mkArc = (cx, cy, r, a0deg, a1deg, net, w) => {
    const a0 = a0deg * Math.PI / 180, a1 = a1deg * Math.PI / 180;
    const p0 = [cx + r * Math.cos(a0), cy + r * Math.sin(a0)];
    const p1 = [cx + r * Math.cos(a1), cy + r * Math.sin(a1)];
    return {
      x1: p0[0], y1: p0[1], x2: p1[0], y2: p1[1],
      width: w || 0.3, layer: 'F.Cu', net,
      arc: PcbArc.fromCenter(cx, cy, p0[0], p0[1], p1[0], p1[1], true),
    };
  };
  st.traces.push(mkArc(-14, -10, 3, 0, 90, 'ARC90'));
  st.traces.push(mkArc(-14, 6, 4, 0, 180, 'ARC180', 0.5));
  st.traces.push(mkArc(0, -11, 0.8, 0, 270, 'ARCSMALL', 0.2));   // 小半徑：折線化最明顯
  // 直線走線接在弧兩端，確認接點對得上
  st.traces.push({ x1: -11, y1: -10, x2: -5, y2: -10, width: 0.3, layer: 'F.Cu', net: 'ARC90' });
  st.traces.push({ x1: -18, y1: 6, x2: -18, y2: 12, width: 0.5, layer: 'B.Cu', net: 'ARC180' });

  // via：一般通孔
  st.vias.push({ x: -5, y: -10, d: 0.6, od: 0.6, drill: 0.3, net: 'ARC90' });
  st.vias.push({ x: -18, y: 6, d: 0.8, od: 0.8, drill: 0.4, net: 'ARC180' });

  return st;
}

/**
 * B. 鋪銅板 —— 專門測「極性對不對」
 * 內孔、熱風焊盤輻條、孤島、跨層鋪銅。清除極性畫錯的話，
 * 在我們的檢查裡看不出來，真 CAM 一開就是整片銅或整片空。
 */
function boardPour() {
  const st = {
    name: 'B-pour',
    boardWidth: 50, boardHeight: 40,
    layerStack: [{ id: 'F.Cu', kind: 'copper' }, { id: 'B.Cu', kind: 'copper' }],
    components: [], traces: [], vias: [], keepouts: [],
    userZones: [
      { layer: 'F.Cu', net: 'GND', pts: [[-20, -15], [20, -15], [20, 15], [-20, 15]], clearance: 0.3, thermal: true, user: true },
      { layer: 'B.Cu', net: 'VCC', pts: [[-18, -13], [18, -13], [18, 13], [-18, 13]], clearance: 0.3, thermal: false, user: true },
    ],
  };

  // 一排 pad：一半接 GND（要有熱風焊盤輻條）、一半不接（要被完整挖掉）
  const chip = FE.chip({ span: 1.55, padW: 0.8, padH: 0.9, name: 'R0603' });
  for (let i = 0; i < 6; i++) {
    const c = FE.toComponent(chip, 'R' + (i + 1), -12 + i * 5, -6);
    c.pads[0].net = i % 2 ? 'GND' : 'SIG' + i;
    c.pads[1].net = 'SIG' + (i + 10);
    c.pads.forEach(p => { p.side = 'F'; });
    st.components.push(c);
  }

  // 通孔元件：兩面都要挖
  const dip = FE.dual({ pins: 8, pitch: 2.54, span: 7.62, padW: 1.6, padH: 1.6, tht: true, drill: 0.8 });
  const u1 = FE.toComponent(dip, 'U1', 0, 6);
  u1.pads.forEach((p, i) => { p.net = i === 3 ? 'GND' : 'D' + i; p.side = '*'; });
  st.components.push(u1);

  // 穿過鋪銅的異網走線：兩側都要留出淨空
  st.traces.push({ x1: -18, y1: 11, x2: 18, y2: 11, width: 0.4, layer: 'F.Cu', net: 'HISPEED' });
  st.traces.push({ x1: -18, y1: -11, x2: 18, y2: -11, width: 0.25, layer: 'B.Cu', net: 'HISPEED2' });

  // 刻意造一塊孤島：一小塊被走線圍起來、又沒有同網連接點
  st.traces.push({ x1: 12, y1: 2, x2: 17, y2: 2, width: 0.4, layer: 'F.Cu', net: 'ISO' });
  st.traces.push({ x1: 17, y1: 2, x2: 17, y2: 8, width: 0.4, layer: 'F.Cu', net: 'ISO' });
  st.traces.push({ x1: 17, y1: 8, x2: 12, y2: 8, width: 0.4, layer: 'F.Cu', net: 'ISO' });
  st.traces.push({ x1: 12, y1: 8, x2: 12, y2: 2, width: 0.4, layer: 'F.Cu', net: 'ISO' });

  // 禁佈區：鋪銅要避開
  st.keepouts = [{ layer: 'F.Cu', pts: [[-19, -14], [-15, -14], [-15, -10], [-19, -10]] }];

  st.vias.push({ x: 0, y: 0, d: 0.6, od: 0.6, drill: 0.3, net: 'GND' });
  st.vias.push({ x: 4, y: 0, d: 0.6, od: 0.6, drill: 0.3, net: 'SIG1' });

  // B.Cu 的 VCC 鋪銅需要一個同網連接點，否則整塊會被判成孤島丟掉
  // （孤島判定的準則就是「這塊銅裡面有沒有同網的 pad／via／走線端點」）。
  // 第一版忘了給，B.Cu 產出 0 座島——那樣就驗不到底層鋪銅了。
  st.vias.push({ x: -6, y: 0, d: 0.8, od: 0.8, drill: 0.4, net: 'VCC' });
  st.vias.push({ x: 10, y: -4, d: 0.8, od: 0.8, drill: 0.4, net: 'VCC' });
  st.traces.push({ x1: -6, y1: 0, x2: 10, y2: -4, width: 0.5, layer: 'B.Cu', net: 'VCC' });

  return st;
}

/**
 * C. 元件與網表板 —— 專門測 ODB++ 的 CMP/TOP/NET 與 IPC-356
 * 兩面元件、沒接網路的機構孔、同一封裝重複使用。
 */
function boardNetlist() {
  const st = {
    name: 'C-netlist',
    boardWidth: 40, boardHeight: 30,
    layerStack: [{ id: 'F.Cu', kind: 'copper' }, { id: 'In1.Cu', kind: 'copper' },
                 { id: 'In2.Cu', kind: 'copper' }, { id: 'B.Cu', kind: 'copper' }],
    components: [], traces: [], vias: [], userZones: [], keepouts: [],
  };

  const soic = FE.dual({ pins: 8, pitch: 1.27, span: 5.4, padW: 1.5, padH: 0.6, name: 'SOIC-8' });
  const chip = FE.chip({ span: 1.55, padW: 0.8, padH: 0.9, name: 'R0603' });

  // 頂面
  const u1 = FE.toComponent(soic, 'U1', -8, 4);
  u1.pads.forEach((p, i) => { p.net = ['VCC', 'SDA', 'SCL', 'GND', 'D0', 'D1', 'D2', 'VCC'][i]; p.side = 'F'; });
  st.components.push(u1);

  // 同一種封裝用三次：ODB++ 的 PKG 段應該只寫一次
  for (let i = 0; i < 3; i++) {
    const r = FE.toComponent(chip, 'R' + (i + 1), 4 + i * 4, 4);
    r.pads[0].net = 'SDA'; r.pads[1].net = 'VCC';
    r.pads.forEach(p => { p.side = 'F'; });
    st.components.push(r);
  }

  // 底面元件（ODB++ 的 comp_+_bot 與 mirror 標記）
  const u2 = FE.toComponent(soic, 'U2', 0, -6);
  u2.side = 'bottom';
  u2.pads.forEach((p, i) => { p.net = i === 0 ? 'VCC' : i === 3 ? 'GND' : 'B' + i; p.side = 'B'; });
  st.components.push(u2);

  // 機構孔：沒有 net，ODB++ 應該標 -1、IPC-356 不該把它當測點
  st.components.push({
    id: 'h1', ref: 'H1', part: 'MTG-M3', x: -16, y: -11, rot: 0, side: 'top', kind: 'part', w: 6, h: 6,
    pads: [{ num: 1, x: 0, y: 0, w: 6, h: 6, shape: 'circle', drill: 3.2, side: '*', net: '' }],
  });

  st.traces.push({ x1: -5.3, y1: 2.7, x2: 3.2, y2: 2.7, layer: 'F.Cu', width: 0.25, net: 'SDA' });
  st.traces.push({ x1: 0, y1: 0, x2: 0, y2: -3, layer: 'In1.Cu', width: 0.3, net: 'VCC' });
  st.traces.push({ x1: 2, y1: 0, x2: 2, y2: -3, layer: 'In2.Cu', width: 0.3, net: 'GND' });

  // 盲埋孔：跨層範圍要進 ODB++ 的 matrix
  st.vias.push({ x: 0, y: 0, d: 0.6, od: 0.6, drill: 0.3, net: 'VCC', from: 'F.Cu', to: 'In1.Cu' });
  st.vias.push({ x: 2, y: 0, d: 0.6, od: 0.6, drill: 0.3, net: 'GND' });

  return st;
}

/**
 * D. 3D／機構板 —— 專門測 STEP
 * 非矩形板框、通孔、不同高度的元件。
 */
function boardMech() {
  const st = boardGeometry();
  st.name = 'D-mech';
  // 幾個有高度差的元件（STEP 匯出會拉伸成方塊）
  st.components.forEach((c, i) => { c.h3d = [1.2, 3.5, 8][i % 3]; });
  return st;
}

// ---------------------------------------------------------------- 產生

async function main() {
  const gerber = await import('file://' + path.join(ROOT, 'supabase/functions/_shared/gerber.mjs').replace(/\\/g, '/'));
  const odb = await import('file://' + path.join(ROOT, 'supabase/functions/_shared/odbpp.mjs').replace(/\\/g, '/'));

  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  const boards = [boardGeometry(), boardPour(), boardNetlist(), boardMech()];
  const summary = [];

  for (const st of boards) {
    const dir = path.join(OUT, st.name);
    fs.mkdirSync(dir, { recursive: true });

    // 鋪銅一律先算布林（跟站台匯出前的行為一致）
    const pour = (st.userZones || []).length
      ? PourGeom.applyAll(st, padAbs, { clearance: CL })
      : { islands: 0, dropped: 0, failed: 0 };

    const g = gerber.build(st, padAbs, st.name);
    for (const f of g.files) fs.writeFileSync(path.join(dir, f.name.replace(st.name + '-', '').replace(st.name, 'job')), f.text);

    const o = odb.build(st, padAbs, st.name);
    for (const f of o.files) {
      const p = path.join(dir, 'odb', f.name.split('/').slice(1).join('/'));
      fs.mkdirSync(path.dirname(p), { recursive: true });
      fs.writeFileSync(p, f.text);
    }

    // STEP（給 FreeCAD／SolidWorks 開）
    let stepOk = false;
    try {
      const step = require(path.join(ROOT, 'pcb-step.js')) || global.window.PcbStep;
      const S = global.window.PcbStep || step;
      if (S && S.build) {
        const r = S.build(st, padAbs, { thickness: 1.6 });
        if (r && (r.text || r.step)) { fs.writeFileSync(path.join(dir, st.name + '.step'), r.text || r.step); stepOk = true; }
      }
    } catch (e) { /* 產不出來就在 summary 標 false，不擋其它格式 */ }

    // KiCad（給 KiCad 開）
    let kicadOk = false;
    try {
      require(path.join(ROOT, 'kicad-io.js'));
      const K = global.window.KicadIO;
      if (K && K.buildNew) {
        fs.writeFileSync(path.join(dir, st.name + '.kicad_pcb'), K.buildNew(st));
        kicadOk = true;
      }
    } catch (e) { /* 同上 */ }

    // 板子本身（可以丟回站台重現）
    fs.writeFileSync(path.join(dir, 'board.json'),
      JSON.stringify({ app: 'hardwareai-pcb', v: 1, data: st }, null, 1));

    const cu = g.files.filter(f => /_Cu\.gbr$/.test(f.name));
    summary.push({
      board: st.name,
      gerberFiles: g.files.length,
      odbFiles: o.files.length,
      arcs: cu.reduce((n, f) => n + (f.stats ? f.stats.arc : 0), 0),
      regions: cu.reduce((n, f) => n + (f.stats ? f.stats.region : 0), 0),
      flashes: cu.reduce((n, f) => n + (f.stats ? f.stats.flash : 0), 0),
      pourIslands: pour.islands, pourDropped: pour.dropped,
      gerberWarnings: g.warnings.length, odbWarnings: o.warnings.length, stepOk, kicadOk,
    });
  }

  fs.writeFileSync(path.join(OUT, 'summary.json'), JSON.stringify(summary, null, 1));
  console.log('產生於 ' + OUT + '\n');
  for (const s of summary) {
    console.log(`${s.board.padEnd(12)} Gerber ${String(s.gerberFiles).padStart(2)} 檔 / ODB++ ${String(s.odbFiles).padStart(2)} 檔` +
      ` | 弧 ${s.arcs}  區域 ${s.regions}  閃光 ${s.flashes}` +
      ` | 鋪銅島 ${s.pourIslands}（丟 ${s.pourDropped}）` +
      ` | 警告 G${s.gerberWarnings}/O${s.odbWarnings}` +
      ` | STEP ${s.stepOk ? "✓" : "✗"} KiCad ${s.kicadOk ? "✓" : "✗"}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
