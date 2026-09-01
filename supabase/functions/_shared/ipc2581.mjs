/**
 * ipc2581.mjs — IPC-2581 匯出（Revision C 的可製造子集）
 *
 * 為什麼要有：Gerber 是一疊影像、ODB++ 是專有格式（Siemens），
 * IPC-2581 是**開放標準的單一 XML 檔**，把疊構、網表、元件、鑽孔、
 * 板廠需求全部寫在同一份裡。北美與歐洲的板廠越來越常收這個。
 *
 * 誠實界定（不要對外宣稱「完整 IPC-2581」）：
 *   有：Content（層別與功能）、LogicalNet（網表）、Step 的 Profile（板框）、
 *       LayerFeature（走線／pad／via／鋪銅，含圓弧與內孔）、
 *       Package/Component（元件與腳位）、DrillSpec（鑽孔）、
 *       BOM（料號與數量）。
 *   有（2026-09-01 補）：受控阻抗需求（Z0 / Zdiff / 容差 / 配對 net / 實際走線的層與線寬），
 *       掛在 LogicalNet 底下的 NonstandardAttribute。**不自創 <Spec>/<Impedance> 這類標準元素**：
 *       猜錯 schema 會讓整份檔驗不過，比沒帶更糟。目標值來自 netspec.mjs 同一份來源。
 *   沒有：Stackup 的材料與介電常數（我們沒有那些資料）、
 *       DFX 的完整規則集、Approval/Change history。
 *   幾何：圓弧用 <Arc>（真圓弧，不是弦線）；roundrect pad 以 rect 近似。
 *
 * 座標：IPC-2581 用右手座標（Y 向上），本站 state 是 Y 向下 → Y 一律取負。
 * 單位：MILLIMETER。
 *
 * 純計算，不碰 DOM。Deno（Edge Function）與 Node（CI 測試）共用。
 * 測試：ipc2581.test.js
 */
'use strict';

// 阻抗目標只有一份來源：netspec.mjs 讀 state.netProps。匯出端各抄一份的下場是
// 「Gerber 包說 50Ω、XML 說 47Ω」，而收到兩份檔的板廠不知道該信誰。
import { buildNetSpec } from './netspec.mjs';

const NL = String.fromCharCode(10);
const T = (k, vars) => ({ k, v: vars || {} });

// XML 屬性值與文字都要跳脫。少跳一個 & 就整份檔解析不了，
// 而 refdes 與 part 名是使用者輸入的，什麼字元都可能出現。
const X = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

const N = v => (Math.round((Number(v) + Number.EPSILON) * 1e6) / 1e6).toFixed(6);
const NY = v => N(-v);

// IPC-2581 的 id 只能是 NCName（不能以數字開頭、不能有空白與大部分符號）
const ID = s => 'x' + String(s == null ? '' : s).replace(/[^\w.-]/g, '_');

const LAYER_FN = {
  'F.Cu': 'CONDUCTOR', 'B.Cu': 'CONDUCTOR',
  'F.Mask': 'SOLDERMASK', 'B.Mask': 'SOLDERMASK',
  'F.Paste': 'SOLDERPASTE', 'B.Paste': 'SOLDERPASTE',
  'F.SilkS': 'SILKSCREEN', 'B.SilkS': 'SILKSCREEN',
  'Edge.Cuts': 'BOARD_OUTLINE',
};
const layerFn = id => LAYER_FN[id] || (/\.Cu$/.test(id) ? 'CONDUCTOR' : 'DOCUMENT');
const layerSide = id => (/^F\./.test(id) ? 'TOP' : /^B\./.test(id) ? 'BOTTOM' : /^In/.test(id) ? 'INTERNAL' : 'NONE');

// ---------- 幾何片段 ----------

function polyXml(pts, indent, closed) {
  const p = indent;
  const out = [p + '<Polygon>'];
  out.push(p + '  <PolyBegin x="' + N(pts[0][0]) + '" y="' + NY(pts[0][1]) + '"/>');
  for (let i = 1; i < pts.length; i++) {
    out.push(p + '  <PolyStepSegment x="' + N(pts[i][0]) + '" y="' + NY(pts[i][1]) + '"/>');
  }
  if (closed !== false) out.push(p + '  <PolyStepSegment x="' + N(pts[0][0]) + '" y="' + NY(pts[0][1]) + '"/>');
  out.push(p + '</Polygon>');
  return out;
}

// 內孔：Polygon 之後接 Cutout，這是 IPC-2581 表示「有洞的面」的方式。
// 跟 ODB++ 的 I/H contour、Gerber 的清除極性是同一件事的三種寫法。
function cutoutXml(pts, indent) {
  const p = indent;
  const out = [p + '<Cutout>'];
  out.push(p + '  <PolyBegin x="' + N(pts[0][0]) + '" y="' + NY(pts[0][1]) + '"/>');
  for (let i = 1; i < pts.length; i++) {
    out.push(p + '  <PolyStepSegment x="' + N(pts[i][0]) + '" y="' + NY(pts[i][1]) + '"/>');
  }
  out.push(p + '  <PolyStepSegment x="' + N(pts[0][0]) + '" y="' + NY(pts[0][1]) + '"/>');
  out.push(p + '</Cutout>');
  return out;
}

// 走線：直線用 <Line>，真圓弧用 <Arc>（帶圓心，不是弦線近似）
function traceXml(t, indent) {
  const p = indent;
  const w = t.width || 0.3;
  const a = t.arc;
  if (a && Number.isFinite(a.cx) && a.r > 0) {
    // clockwise 屬性以 IPC 的座標系（Y 向上）為準；我們的 Y 向下，方向要反過來
    const cw = a.a1 > a.a0 ? 'true' : 'false';
    return [
      p + '<Features>',
      p + '  <Xform/>',
      p + '  <Location x="0" y="0"/>',
      p + '  <Arc startX="' + N(t.x1) + '" startY="' + NY(t.y1) + '"' +
      ' endX="' + N(t.x2) + '" endY="' + NY(t.y2) + '"' +
      ' centerX="' + N(a.cx) + '" centerY="' + NY(a.cy) + '" clockWise="' + cw + '">',
      p + '    <LineDesc lineEnd="ROUND" lineWidth="' + N(w) + '"/>',
      p + '  </Arc>',
      p + '</Features>',
    ];
  }
  return [
    p + '<Features>',
    p + '  <Xform/>',
    p + '  <Location x="0" y="0"/>',
    p + '  <Line startX="' + N(t.x1) + '" startY="' + NY(t.y1) + '"' +
    ' endX="' + N(t.x2) + '" endY="' + NY(t.y2) + '">',
    p + '    <LineDesc lineEnd="ROUND" lineWidth="' + N(w) + '"/>',
    p + '  </Line>',
    p + '</Features>',
  ];
}

function padXml(x, y, pad, indent) {
  const p = indent;
  const w = pad.w || 0.6, h = pad.h || 0.6;
  const rot = ((pad.rot || 0) % 360 + 360) % 360;
  const shape = pad.shape === 'circle'
    ? '<Circle diameter="' + N(w) + '"/>'
    : pad.shape === 'oval'
      ? '<Oval width="' + N(w) + '" height="' + N(h) + '"/>'
      : '<RectCenter width="' + N(w) + '" height="' + N(h) + '"/>';
  return [
    p + '<Features>',
    p + '  <Xform rotation="' + N(rot) + '"/>',
    p + '  <Location x="' + N(x) + '" y="' + NY(y) + '"/>',
    p + '  <StandardPrimitive>' + shape + '</StandardPrimitive>',
    p + '</Features>',
  ];
}

// ---------- 主流程 ----------

/**
 * @returns { files:[{name,text}], warnings, stats }
 */
function build(state, padAbsFn, baseName) {
  const warnings = [T('ipc_w_subset')];
  const base = String(baseName || 'hardwareai').replace(/[^\w.-]/g, '_') || 'hardwareai';
  const cu = (state.layerStack || []).filter(l => l.kind === 'copper');
  if (!cu.length) return { files: [], warnings: [T('ipc_w_nolayers')], stats: { layers: 0 } };

  const stats = { layers: cu.length, nets: 0, components: 0, traces: 0, pads: 0, vias: 0, arcs: 0, cutouts: 0 };

  // --- 網表 ---
  const netSet = new Set();
  (state.components || []).forEach(c => (c.pads || []).forEach(p => { if (p.net) netSet.add(String(p.net)); }));
  (state.traces || []).forEach(t => { if (t.net) netSet.add(String(t.net)); });
  (state.vias || []).forEach(v => { if (v.net) netSet.add(String(v.net)); });
  const nets = [...netSet].sort();
  stats.nets = nets.length;

  // --- 受控阻抗需求 ---
  // 沒有任何 net 設過屬性就完全不寫（跟 -NetSpec.txt 同一條規則）：
  // 寫出一組空屬性，等於告訴板廠「這片板沒有阻抗要求」，那是另一個意思。
  const netSpec = buildNetSpec(state, { name: base });
  const specOf = new Map((netSpec ? netSpec.rows : []).map(r => [r.net, r]));
  stats.netSpecs = specOf.size;
  if (netSpec) warnings.push(T('ipc_w_netspec'));
  // 有要求但還沒畫任何銅的 net 也要留在檔裡（標 NOT_ROUTED）。
  // 只列有幾何的 net，等於「還沒繞的那條就沒有要求」——那正是最需要傳出去的一條。
  for (const r of specOf.keys()) if (!netSet.has(r)) nets.push(r);
  nets.sort();
  stats.nets = nets.length;

  // --- 板框 ---
  const W = state.boardWidth || 100, H = state.boardHeight || 80;
  const outline = (() => {
    const segs = (state.edgeSegs || []).filter(s => Number.isFinite(s.x1));
    const rect = [[-W / 2, -H / 2], [W / 2, -H / 2], [W / 2, H / 2], [-W / 2, H / 2]];
    if (segs.length < 3) return rect;
    const EPS = 0.01;
    const same = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]) <= EPS;
    const pool = segs.map(s => [[s.x1, s.y1], [s.x2, s.y2]]);
    const pts = [pool[0][0], pool[0][1]];
    pool.splice(0, 1);
    let guard = pool.length + 2;
    while (pool.length && guard-- > 0) {
      const tail = pts[pts.length - 1];
      const i = pool.findIndex(s => same(s[0], tail) || same(s[1], tail));
      if (i < 0) break;
      const s = pool.splice(i, 1)[0];
      pts.push(same(s[0], tail) ? s[1] : s[0]);
    }
    if (pool.length || pts.length < 4 || !same(pts[0], pts[pts.length - 1])) {
      warnings.push(T('ipc_w_outline'));
      return rect;
    }
    pts.pop();
    return pts;
  })();

  const L = [];
  L.push('<?xml version="1.0" encoding="UTF-8"?>');
  L.push('<IPC-2581 revision="C" xmlns="http://webstds.ipc.org/2581">');

  // --- Content：這份檔裡有哪些層、哪些功能 ---
  L.push('  <Content roleRef="Owner">');
  L.push('    <FunctionMode mode="FABRICATION"/>');
  L.push('    <StepRef name="' + X(base) + '"/>');
  cu.forEach((l, i) => {
    L.push('    <LayerRef name="' + X(l.id) + '"/>');
  });
  L.push('    <BomRef name="' + X(base) + '_bom"/>');
  L.push('  </Content>');

  // --- Bom：料號與數量 ---
  const byPart = new Map();
  for (const c of (state.components || [])) {
    const key = String(c.part || c.ref || 'UNKNOWN');
    if (!byPart.has(key)) byPart.set(key, []);
    byPart.get(key).push(c.ref || '?');
  }
  L.push('  <Bom name="' + X(base) + '_bom">');
  L.push('    <BomHeader assembly="' + X(base) + '" revision="1"/>');
  let bi = 0;
  for (const [part, refs] of [...byPart.entries()].sort()) {
    L.push('    <BomItem OEMDesignNumberRef="' + X(part) + '" quantity="' + refs.length + '" category="ELECTRICAL">');
    for (const r of refs) L.push('      <RefDes name="' + X(r) + '" packageRef="' + ID(part) + '" populate="true"/>');
    L.push('    </BomItem>');
    bi++;
  }
  L.push('  </Bom>');

  // --- Ecad：實際的幾何 ---
  L.push('  <Ecad name="' + X(base) + '">');
  L.push('    <CadHeader units="MILLIMETER"/>');
  L.push('    <CadData>');

  // 層別定義
  cu.forEach((l, i) => {
    L.push('      <Layer name="' + X(l.id) + '" layerFunction="' + layerFn(l.id) +
      '" side="' + layerSide(l.id) + '" polarity="POSITIVE"/>');
  });
  L.push('      <Layer name="Edge.Cuts" layerFunction="BOARD_OUTLINE" side="NONE" polarity="POSITIVE"/>');

  // 疊構（只有順序與厚度，沒有材料——我們沒有那些資料）
  L.push('      <Stackup stackupStatus="PROPOSED" totalFinishedThickness="1.600000">');
  L.push('        <StackupGroup name="primary" thickness="1.600000">');
  cu.forEach((l, i) => {
    L.push('          <StackupLayer layerOrGroupRef="' + X(l.id) + '" thickness="0.035000" sequence="' + (i + 1) + '"/>');
  });
  L.push('        </StackupGroup>');
  L.push('      </Stackup>');

  // 封裝定義（同一種只寫一次）
  const pkgSeen = new Set();
  for (const c of (state.components || [])) {
    const part = String(c.part || c.ref || 'UNKNOWN');
    if (pkgSeen.has(part)) continue;
    pkgSeen.add(part);
    L.push('      <Package name="' + ID(part) + '" type="OTHER" pinOne="1" pinOneOrientation="OTHER"');
    L.push('               height="' + N(c.h3d || 1) + '">');
    L.push('        <Outline>');
    L.push.apply(L, polyXml([[-(c.w || 2) / 2, -(c.h || 2) / 2], [(c.w || 2) / 2, -(c.h || 2) / 2],
      [(c.w || 2) / 2, (c.h || 2) / 2], [-(c.w || 2) / 2, (c.h || 2) / 2]], '          '));
    L.push('        </Outline>');
    for (const p of (c.pads || [])) {
      L.push('        <Pin number="' + X(p.num) + '" type="' + (p.drill > 0 ? 'THRU' : 'SURFACE') + '"' +
        ' electricalType="ELECTRICAL">');
      L.push('          <Location x="' + N(p.x) + '" y="' + NY(p.y) + '"/>');
      L.push('        </Pin>');
    }
    L.push('      </Package>');
  }

  // Step：一塊板
  L.push('      <Step name="' + X(base) + '">');
  L.push('        <Datum x="0.000000" y="0.000000"/>');
  L.push('        <Profile>');
  L.push.apply(L, polyXml(outline, '          '));
  L.push('        </Profile>');

  // 元件實例
  for (const c of (state.components || [])) {
    if (!(c.pads || []).length) continue;
    stats.components++;
    const side = (c.side === 'bottom' || c.side === 'B') ? 'BOTTOM' : 'TOP';
    L.push('        <Component refDes="' + X(c.ref || 'REF') + '" packageRef="' + ID(c.part || c.ref || 'UNKNOWN') +
      '" layerRef="' + X(side === 'TOP' ? cu[0].id : cu[cu.length - 1].id) + '" mountType="' +
      ((c.pads || []).some(p => p.drill > 0) ? 'THMT' : 'SMT') + '" part="' + X(c.part || '') + '">');
    L.push('          <NonstandardAttribute name="side" value="' + side + '" type="STRING"/>');
    L.push('          <Xform rotation="' + N(((c.rot || 0) % 360 + 360) % 360) + '"/>');
    L.push('          <Location x="' + N(c.x) + '" y="' + NY(c.y) + '"/>');
    L.push('        </Component>');
  }

  // 網表：每條 net 底下列出它接到的腳位
  const nsAttr = (name, value, type) =>
    '          <NonstandardAttribute name="' + X(name) + '" value="' + X(value) + '" type="' + type + '"/>';
  for (const net of nets) {
    L.push('        <LogicalNet name="' + X(net) + '">');
    for (const c of (state.components || [])) {
      for (const p of (c.pads || [])) {
        if (String(p.net || '') !== net) continue;
        L.push('          <PinRef componentRef="' + X(c.ref || 'REF') + '" pin="' + X(p.num) + '"/>');
      }
    }
    // 阻抗需求用 NonstandardAttribute 帶出——這份檔的 Component 也是用同一個機制帶 side。
    // 讀不懂的 CAM 會忽略；讀得懂的至少拿得到設計端的要求，而不是完全收不到。
    const sp = specOf.get(net);
    if (sp) {
      if (sp.z0 != null) L.push(nsAttr('impedanceZ0Ohm', sp.z0, 'FLOAT'));
      if (sp.zdiff != null) L.push(nsAttr('impedanceZdiffOhm', sp.zdiff, 'FLOAT'));
      if (sp.z0 != null || sp.zdiff != null) L.push(nsAttr('impedanceTolerancePercent', sp.tol, 'FLOAT'));
      if (sp.pair) L.push(nsAttr('differentialPairNet', sp.pair, 'STRING'));
      if (sp.note) L.push(nsAttr('impedanceNote', sp.note, 'STRING'));
      // 實際畫出來的幾何：板廠要對的是這個，不是規則裡寫的目標線寬。
      // 沒繞的 net 明講 NOT_ROUTED，留白會被當成漏印。
      if (sp.routed) {
        L.push(nsAttr('routedLayers', sp.layers.join('/'), 'STRING'));
        L.push(nsAttr('routedWidthsMm', sp.widths.join('/'), 'STRING'));
      } else {
        L.push(nsAttr('routedLayers', 'NOT_ROUTED', 'STRING'));
      }
    }
    L.push('        </LogicalNet>');
  }

  // 每一層的幾何
  for (const layer of cu) {
    L.push('        <LayerFeature layerRef="' + X(layer.id) + '">');

    // pad
    for (const c of (state.components || [])) {
      for (const p of (c.pads || [])) {
        if (p.cu === false) continue;
        const onTop = layer.id === cu[0].id, onBot = layer.id === cu[cu.length - 1].id;
        const hit = p.side === '*' || (p.side === 'F' && onTop) || (p.side === 'B' && onBot);
        if (!hit) continue;
        const a = padAbsFn(c, p);
        L.push('          <Set net="' + X(p.net || '') + '" padUsage="' + (p.drill > 0 ? 'TERMINATION' : 'TERMINATION') + '">');
        L.push.apply(L, padXml(a.x, a.y, p, '            '));
        L.push('          </Set>');
        stats.pads++;
      }
    }

    // 走線（含真圓弧）
    for (const t of (state.traces || [])) {
      if ((t.layer || 'F.Cu') !== layer.id) continue;
      if (t.fromArc) continue;
      L.push('          <Set net="' + X(t.net || '') + '">');
      L.push.apply(L, traceXml(t, '            '));
      L.push('          </Set>');
      stats.traces++;
      if (t.arc) stats.arcs++;
    }

    // via（全銅層）
    for (const v of (state.vias || [])) {
      L.push('          <Set net="' + X(v.net || '') + '" padUsage="VIA">');
      L.push.apply(L, padXml(v.x, v.y, { w: v.od || 0.6, h: v.od || 0.6, shape: 'circle' }, '            '));
      L.push('          </Set>');
      if (layer.id === cu[0].id) stats.vias++;
    }

    // 鋪銅：布林結果有 holes 就寫成 Cutout
    for (const z of (state.userZones || [])) {
      if (z.layer !== layer.id) continue;
      const islands = Array.isArray(z.fillPolys)
        ? z.fillPolys
        : [{ outer: z.pts, holes: [] }];
      for (const is of islands) {
        if (!is.outer || is.outer.length < 3) continue;
        L.push('          <Set net="' + X(z.net || '') + '" geometryUsage="PLANE">');
        L.push('            <Features>');
        L.push('              <Xform/>');
        L.push('              <Location x="0" y="0"/>');
        L.push('              <Contour>');
        L.push.apply(L, polyXml(is.outer, '                '));
        for (const h of (is.holes || [])) {
          if (h && h.length >= 3) { L.push.apply(L, cutoutXml(h, '                ')); stats.cutouts++; }
        }
        L.push('              </Contour>');
        L.push('            </Features>');
        L.push('          </Set>');
      }
    }

    L.push('        </LayerFeature>');
  }

  L.push('      </Step>');
  L.push('    </CadData>');
  L.push('  </Ecad>');

  // --- 鑽孔 ---
  const drills = [];
  (state.components || []).forEach(c => (c.pads || []).forEach(p => {
    if (p.drill > 0) { const a = padAbsFn(c, p); drills.push({ x: a.x, y: a.y, d: p.drill, plated: true }); }
  }));
  (state.vias || []).forEach(v => drills.push({ x: v.x, y: v.y, d: v.drill || 0.3, plated: true }));
  if (drills.length) {
    L.push('  <DrillSpec>');
    const byD = new Map();
    for (const d of drills) {
      const k = N(d.d);
      if (!byD.has(k)) byD.set(k, []);
      byD.get(k).push(d);
    }
    let ti = 1;
    for (const [dia, list] of [...byD.entries()].sort((a, b) => +a[0] - +b[0])) {
      L.push('    <DrillTool name="T' + (ti++) + '" diameter="' + dia + '" plated="true" quantity="' + list.length + '"/>');
    }
    L.push('  </DrillSpec>');
  }

  L.push('</IPC-2581>');

  return {
    files: [{ name: base + '.xml', text: L.join(NL) + NL }],
    warnings, stats,
  };
}

export { build, X as _esc, layerFn as _layerFn };
