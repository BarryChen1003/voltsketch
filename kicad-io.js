/**
 * kicad-io.js — KiCad .kicad_pcb 匯入/匯出（s-expression，v6/v7/v8）
 * 設計原則（零落差）：匯入時保留整棵解析樹；匯出時只回寫「被編輯過的節點」
 * （元件位置）並附加「新增的走線/via」，其餘節點原樣序列化——沒動的幾何不會變。
 * 用法：
 *   KicadIO.importText(text)  → { tree, model }   // model 供 pcbApp 載入
 *   KicadIO.exportText(kicadState, appState) → text  // 匯出（含編輯回寫）
 *   KicadIO.buildNew(appState) → text   // 從零建基本 .kicad_pcb（無 pad 腳位，僅外框/走線/via）
 */
window.KicadIO = (function () {
  'use strict';

  // ---------- s-expression 解析 ----------
  function parse(text) {
    let i = 0;
    const n = text.length;
    function skipWs() { while (i < n && /\s/.test(text[i])) i++; }
    function atom() {
      if (text[i] === '"') {
        i++;
        let s = '';
        while (i < n && text[i] !== '"') {
          if (text[i] === '\\' && i + 1 < n) { s += text[i + 1]; i += 2; }
          else { s += text[i]; i++; }
        }
        i++; // closing quote
        return { q: true, v: s };
      }
      let s = '';
      while (i < n && !/[\s()]/.test(text[i])) { s += text[i]; i++; }
      return s;
    }
    function list() {
      i++; // (
      const out = [];
      for (;;) {
        skipWs();
        if (i >= n) throw new Error('unexpected EOF in s-expression');
        if (text[i] === ')') { i++; return out; }
        if (text[i] === '(') out.push(list());
        else out.push(atom());
      }
    }
    skipWs();
    if (text[i] !== '(') throw new Error('not an s-expression file');
    return list();
  }

  const BARE = /^[A-Za-z0-9_.\-+*/%:~$?{}<>^|#@!&,;=[\]]+$/;
  function atomText(a) {
    if (typeof a === 'object' && a.q !== undefined) {
      return '"' + a.v.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
    }
    const s = String(a);
    return (s !== '' && BARE.test(s)) ? s : '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
  }
  function serialize(node, depth) {
    depth = depth || 0;
    if (!Array.isArray(node)) return atomText(node);
    const hasList = node.some(Array.isArray);
    const inner = node.map(c => serialize(c, depth + 1));
    if (!hasList || inner.join(' ').length < 90) return '(' + inner.join(' ') + ')';
    const pad = '  '.repeat(depth + 1);
    let out = '(';
    let head = [];
    let k = 0;
    while (k < node.length && !Array.isArray(node[k])) { head.push(inner[k]); k++; }
    out += head.join(' ');
    for (; k < node.length; k++) out += '\n' + pad + inner[k];
    return out + '\n' + '  '.repeat(depth) + ')';
  }

  // ---------- 樹查詢 ----------
  const val = a => (typeof a === 'object' && a.q !== undefined) ? a.v : String(a);
  const num = a => parseFloat(val(a));
  function find(list, key) { return list.find(c => Array.isArray(c) && val(c[0]) === key); }
  function findAll(list, key) { return list.filter(c => Array.isArray(c) && val(c[0]) === key); }

  // ---------- 匯入 ----------
  function importText(text) {
    const tree = parse(text);
    if (val(tree[0]) !== 'kicad_pcb') throw new Error('不是 kicad_pcb 檔（根節點=' + val(tree[0]) + '）');

    // 銅層
    const layersNode = find(tree, 'layers') || [];
    const cuLayers = layersNode.filter(c => Array.isArray(c) && /\.Cu$/.test(val(c[1] || ''))).map(c => val(c[1]));

    // nets
    const nets = findAll(tree, 'net').map(nn => ({ n: num(nn[1]), name: val(nn[2] || '') }));
    const netName = n => { const f = nets.find(x => x.n === n); return f ? f.name : ''; };

    // footprints（v6+ footprint、v5 module）
    const comps = [];
    for (const fp of findAll(tree, 'footprint').concat(findAll(tree, 'module'))) {
      const at = find(fp, 'at') || [];
      const kx = num(at[1]) || 0, ky = num(at[2]) || 0, rot = num(at[3]) || 0;
      const layer = val((find(fp, 'layer') || [])[1] || 'F.Cu');
      // ref/value：v8 property、v6 fp_text
      let ref = '', value = '';
      for (const p of findAll(fp, 'property')) {
        if (val(p[1]) === 'Reference') ref = val(p[2]);
        if (val(p[1]) === 'Value') value = val(p[2]);
      }
      for (const t of findAll(fp, 'fp_text')) {
        if (val(t[1]) === 'reference') ref = ref || val(t[2]);
        if (val(t[1]) === 'value') value = value || val(t[2]);
      }
      // pads
      const pads = [];
      let minx = 0, miny = 0, maxx = 0, maxy = 0, first = true;
      for (const pd of findAll(fp, 'pad')) {
        const pat = find(pd, 'at') || [];
        const px = num(pat[1]) || 0, py = num(pat[2]) || 0, prot = num(pat[3]) || 0;
        const size = find(pd, 'size') || [];
        const pw = num(size[1]) || 0.5, ph = num(size[2]) || pw;
        const drillN = find(pd, 'drill');
        let drill = 0, slot = null; // slot = 橢圓鑽（開槽）{w,h}
        if (drillN) {
          if (val(drillN[1]) === 'oval') {
            const dw = num(drillN[2]) || 0, dh = num(drillN[3]) || dw;
            drill = Math.min(dw, dh);
            slot = { w: dw, h: dh };
          } else drill = num(drillN[1]) || 0;
        }
        const pLayers = (find(pd, 'layers') || []).slice(1).map(val);
        const side = pLayers.some(l => l === '*.Cu') ? '*' : (pLayers.some(l => l === 'B.Cu') ? 'B' : 'F');
        const pnetN = find(pd, 'net');
        const rrN = find(pd, 'roundrect_rratio');
        pads.push({
          num: val(pd[1]), type: val(pd[2]), shape: val(pd[3]),
          x: px, y: py, rot: prot, w: pw, h: ph, drill, slot,
          rr: rrN ? num(rrN[1]) : 0,
          side, net: pnetN ? val(pnetN[2] || '') : '',
          cu: pLayers.some(l => l.endsWith('.Cu')), // paste/mask-only pad（鋼網開窗）無銅
          node: pd // 旋轉編輯回寫用（pad at 角度是總角度，隨 footprint 旋轉必須同步改）
        });
        const ex = Math.abs(px) + pw / 2, ey = Math.abs(py) + ph / 2;
        if (first) { minx = -ex; maxx = ex; miny = -ey; maxy = ey; first = false; }
        else { minx = Math.min(minx, -ex); maxx = Math.max(maxx, ex); miny = Math.min(miny, -ey); maxy = Math.max(maxy, ey); }
      }
      // 外形 bbox：courtyard/fab 線 > pad bbox
      for (const ln of findAll(fp, 'fp_line').concat(findAll(fp, 'fp_rect'))) {
        const lay = val((find(ln, 'layer') || [])[1] || '');
        if (!/CrtYd|Fab/.test(lay)) continue;
        for (const key of ['start', 'end']) {
          const pt = find(ln, key);
          if (!pt) continue;
          const x = num(pt[1]), y = num(pt[2]);
          if (first) { minx = maxx = x; miny = maxy = y; first = false; }
          else { minx = Math.min(minx, x); maxx = Math.max(maxx, x); miny = Math.min(miny, y); maxy = Math.max(maxy, y); }
        }
      }
      // 絲印圖形（相對座標）＋courtyard 外框（DRC 用）
      const strokeW = n => {
        const st = find(n, 'stroke');
        return num((find(st || [], 'width') || [])[1]) || num((find(n, 'width') || [])[1]) || 0.12;
      };
      const silk = [], cyPts = [];
      const shapeNodes = [
        ...findAll(fp, 'fp_line').map(n => ['line', n]),
        ...findAll(fp, 'fp_rect').map(n => ['rect', n]),
        ...findAll(fp, 'fp_circle').map(n => ['circle', n]),
        ...findAll(fp, 'fp_arc').map(n => ['arc', n])
      ];
      for (const [kind, n] of shapeNodes) {
        const lay = val((find(n, 'layer') || [])[1] || '');
        const silky = /^[FB]\.SilkS$/.test(lay), cy = /CrtYd$/.test(lay);
        if (!silky && !cy) continue;
        const P = key => { const p = find(n, key); return p ? [num(p[1]), num(p[2])] : null; };
        const side = lay[0]; // F/B
        if (kind === 'line') {
          const s = P('start'), e = P('end');
          if (!s || !e) continue;
          if (silky) silk.push({ kind: 'line', x1: s[0], y1: s[1], x2: e[0], y2: e[1], w: strokeW(n), side });
          if (cy) cyPts.push(s, e);
        } else if (kind === 'rect') {
          const s = P('start'), e = P('end');
          if (!s || !e) continue;
          if (silky) {
            const w = strokeW(n);
            silk.push({ kind: 'line', x1: s[0], y1: s[1], x2: e[0], y2: s[1], w, side });
            silk.push({ kind: 'line', x1: e[0], y1: s[1], x2: e[0], y2: e[1], w, side });
            silk.push({ kind: 'line', x1: e[0], y1: e[1], x2: s[0], y2: e[1], w, side });
            silk.push({ kind: 'line', x1: s[0], y1: e[1], x2: s[0], y2: s[1], w, side });
          }
          if (cy) cyPts.push(s, e);
        } else if (kind === 'circle') {
          const c = P('center'), e = P('end');
          if (!c || !e) continue;
          const r = Math.hypot(e[0] - c[0], e[1] - c[1]);
          if (silky) silk.push({ kind: 'circle', cx: c[0], cy: c[1], r, w: strokeW(n), side });
          if (cy) cyPts.push([c[0] - r, c[1] - r], [c[0] + r, c[1] + r]);
        } else if (kind === 'arc') {
          const s = P('start'), m = P('mid'), e = P('end');
          if (!s || !m || !e) continue; // v5 angle 形式不支援，略過
          if (silky) silk.push({ kind: 'arc', x1: s[0], y1: s[1], xm: m[0], ym: m[1], x2: e[0], y2: e[1], w: strokeW(n), side });
          if (cy) cyPts.push(s, m, e);
        }
      }
      let crtyd = null;
      if (cyPts.length) {
        const xs = cyPts.map(p => p[0]), ys = cyPts.map(p => p[1]);
        crtyd = { minx: Math.min(...xs), miny: Math.min(...ys), maxx: Math.max(...xs), maxy: Math.max(...ys) };
      }
      // 可見絲印文字（reference/value/user；hide 略過）
      const silkTexts = [];
      for (const t of findAll(fp, 'fp_text')) {
        if (t.some(x => val(x) === 'hide')) continue;
        const lay = val((find(t, 'layer') || [])[1] || '');
        if (!/^[FB]\.SilkS$/.test(lay)) continue;
        const kindT = val(t[1]);
        const content = kindT === 'reference' ? ref : (kindT === 'value' ? value : val(t[2]));
        const a = find(t, 'at') || [];
        const font = find(find(t, 'effects') || [], 'font') || [];
        const sz = find(font, 'size') || [];
        silkTexts.push({
          text: String(content || ''), x: num(a[1]) || 0, y: num(a[2]) || 0, rot0: num(a[3]) || 0,
          size: num(sz[1]) || 1, thick: num((find(font, 'thickness') || [])[1]) || 0.15, side: lay[0]
        });
      }
      comps.push({
        node: fp, lib: val(fp[1] || ''), ref, value, layer, kx, ky, rot, pads,
        bw: Math.max(0.6, maxx - minx), bh: Math.max(0.6, maxy - miny),
        silk, silkTexts, crtyd,
        // fp_text 節點+原始角度（footprint 旋轉編輯時回寫絲印字方向用）
        texts: findAll(fp, 'fp_text').map(t => { const a = find(t, 'at') || []; return { node: t, rot0: num(a[3]) || 0 }; })
      });
    }

    // 板級絲印圖形（絕對座標）
    const silkGr = [];
    for (const [kind, tag] of [['line', 'gr_line'], ['rect', 'gr_rect'], ['circle', 'gr_circle'], ['arc', 'gr_arc']]) {
      for (const n of findAll(tree, tag)) {
        const lay = val((find(n, 'layer') || [])[1] || '');
        if (!/^[FB]\.SilkS$/.test(lay)) continue;
        const P = key => { const p = find(n, key); return p ? [num(p[1]), num(p[2])] : null; };
        const w = (() => { const st = find(n, 'stroke'); return num((find(st || [], 'width') || [])[1]) || num((find(n, 'width') || [])[1]) || 0.12; })();
        const side = lay[0];
        if (kind === 'line') {
          const s = P('start'), e = P('end');
          if (s && e) silkGr.push({ kind: 'line', x1: s[0], y1: s[1], x2: e[0], y2: e[1], w, side });
        } else if (kind === 'rect') {
          const s = P('start'), e = P('end');
          if (s && e) {
            silkGr.push({ kind: 'line', x1: s[0], y1: s[1], x2: e[0], y2: s[1], w, side });
            silkGr.push({ kind: 'line', x1: e[0], y1: s[1], x2: e[0], y2: e[1], w, side });
            silkGr.push({ kind: 'line', x1: e[0], y1: e[1], x2: s[0], y2: e[1], w, side });
            silkGr.push({ kind: 'line', x1: s[0], y1: e[1], x2: s[0], y2: s[1], w, side });
          }
        } else if (kind === 'circle') {
          const c = P('center'), e = P('end');
          if (c && e) silkGr.push({ kind: 'circle', cx: c[0], cy: c[1], r: Math.hypot(e[0] - c[0], e[1] - c[1]), w, side });
        } else if (kind === 'arc') {
          const s = P('start'), m = P('mid'), e = P('end');
          if (s && m && e) silkGr.push({ kind: 'arc', x1: s[0], y1: s[1], xm: m[0], ym: m[1], x2: e[0], y2: e[1], w, side });
        }
      }
    }

    // 走線
    const traces = findAll(tree, 'segment').map(sg => {
      const s = find(sg, 'start') || [], e = find(sg, 'end') || [];
      return {
        x1: num(s[1]), y1: num(s[2]), x2: num(e[1]), y2: num(e[2]),
        width: num((find(sg, 'width') || [])[1]) || 0.2,
        layer: val((find(sg, 'layer') || [])[1] || 'F.Cu'),
        net: netName(num((find(sg, 'net') || [])[1]) || 0)
      };
    });
    // 弧線走線：三點求圓，折 16 段近似渲染（原節點保留；Gerber 匯出用 arcsRaw 出真圓弧 G02/G03）
    const arcSegs = [];
    const arcsRaw = [];
    for (const arc of findAll(tree, 'arc')) {
      const s = find(arc, 'start'), m = find(arc, 'mid'), e = find(arc, 'end');
      if (!s || !m || !e) continue;
      const w = num((find(arc, 'width') || [])[1]) || 0.2;
      const layer = val((find(arc, 'layer') || [])[1] || 'F.Cu');
      const net = netName(num((find(arc, 'net') || [])[1]) || 0);
      arcsRaw.push({ x1: num(s[1]), y1: num(s[2]), xm: num(m[1]), ym: num(m[2]), x2: num(e[1]), y2: num(e[2]), width: w, layer, net });
      const pts = arcPoints(num(s[1]), num(s[2]), num(m[1]), num(m[2]), num(e[1]), num(e[2]), 16);
      for (let k = 0; k + 1 < pts.length; k++) {
        arcSegs.push({ x1: pts[k][0], y1: pts[k][1], x2: pts[k + 1][0], y2: pts[k + 1][1], width: w, layer, net, fromArc: true });
      }
    }

    // via
    const vias = findAll(tree, 'via').map(vv => {
      const at = find(vv, 'at') || [];
      return {
        x: num(at[1]), y: num(at[2]),
        od: num((find(vv, 'size') || [])[1]) || 0.6,
        id: num((find(vv, 'drill') || [])[1]) || 0.3,
        net: netName(num((find(vv, 'net') || [])[1]) || 0)
      };
    });

    // 鋪銅（zone）：外框多邊形供渲染；filled_polygon（KiCad 已算好的灌銅結果，含避讓）供 Gerber
    const zones = [];
    const zoneFills = [];
    for (const z of findAll(tree, 'zone')) {
      const layer = val((find(z, 'layer') || [])[1] || (find(z, 'layers') || [])[1] || 'F.Cu');
      const net = val((find(z, 'net_name') || [])[1] || '');
      const poly = find(z, 'polygon');
      const pts = poly ? findAll(find(poly, 'pts') || [], 'xy').map(p => [num(p[1]), num(p[2])]) : [];
      if (pts.length >= 3) zones.push({ layer, net, pts });
      for (const fp2 of findAll(z, 'filled_polygon')) {
        const fLayer = val((find(fp2, 'layer') || [])[1] || layer);
        const fpts = findAll(find(fp2, 'pts') || [], 'xy').map(p => [num(p[1]), num(p[2])]);
        if (fpts.length >= 3) zoneFills.push({ layer: fLayer, net, pts: fpts });
      }
    }

    // 板框（Edge.Cuts）
    const edgeSegs = [];
    let bx = [Infinity, -Infinity], by = [Infinity, -Infinity];
    const touch = (x, y) => { bx[0] = Math.min(bx[0], x); bx[1] = Math.max(bx[1], x); by[0] = Math.min(by[0], y); by[1] = Math.max(by[1], y); };
    for (const g of findAll(tree, 'gr_line').concat(findAll(tree, 'gr_rect'), findAll(tree, 'gr_arc'), findAll(tree, 'gr_circle'))) {
      if (val((find(g, 'layer') || [])[1] || '') !== 'Edge.Cuts') continue;
      const kind = val(g[0]);
      if (kind === 'gr_line') {
        const s = find(g, 'start'), e = find(g, 'end');
        edgeSegs.push({ x1: num(s[1]), y1: num(s[2]), x2: num(e[1]), y2: num(e[2]) });
        touch(num(s[1]), num(s[2])); touch(num(e[1]), num(e[2]));
      } else if (kind === 'gr_rect') {
        const s = find(g, 'start'), e = find(g, 'end');
        const x1 = num(s[1]), y1 = num(s[2]), x2 = num(e[1]), y2 = num(e[2]);
        edgeSegs.push({ x1, y1, x2, y2: y1 }, { x1: x2, y1, x2, y2 }, { x1: x2, y1: y2, x2: x1, y2 }, { x1, y1: y2, x2: x1, y2: y1 });
        touch(x1, y1); touch(x2, y2);
      } else if (kind === 'gr_arc') {
        const s = find(g, 'start'), m = find(g, 'mid'), e = find(g, 'end');
        if (s && m && e) {
          const pts = arcPoints(num(s[1]), num(s[2]), num(m[1]), num(m[2]), num(e[1]), num(e[2]), 16);
          for (let k = 0; k + 1 < pts.length; k++) edgeSegs.push({ x1: pts[k][0], y1: pts[k][1], x2: pts[k + 1][0], y2: pts[k + 1][1] });
          pts.forEach(p => touch(p[0], p[1]));
        }
      } else if (kind === 'gr_circle') {
        const c = find(g, 'center'), e = find(g, 'end');
        if (c && e) {
          const r = Math.hypot(num(e[1]) - num(c[1]), num(e[2]) - num(c[2]));
          touch(num(c[1]) - r, num(c[2]) - r); touch(num(c[1]) + r, num(c[2]) + r);
          const cx = num(c[1]), cy = num(c[2]);
          for (let k = 0; k < 24; k++) {
            const a1 = k / 24 * Math.PI * 2, a2 = (k + 1) / 24 * Math.PI * 2;
            edgeSegs.push({ x1: cx + r * Math.cos(a1), y1: cy + r * Math.sin(a1), x2: cx + r * Math.cos(a2), y2: cy + r * Math.sin(a2) });
          }
        }
      }
    }
    if (!isFinite(bx[0])) { bx = [0, 100]; by = [0, 80]; }

    return {
      tree,
      model: {
        cuLayers, nets, comps, traces: traces.concat(arcSegs), arcsRaw, vias, zones, zoneFills, edgeSegs, silkGr,
        bbox: { x: bx[0], y: by[0], w: bx[1] - bx[0], h: by[1] - by[0] }
      }
    };
  }

  // 三點圓弧 → 折線點列
  function arcPoints(x1, y1, xm, ym, x2, y2, nSeg) {
    const d = 2 * (x1 * (ym - y2) + xm * (y2 - y1) + x2 * (y1 - ym));
    if (Math.abs(d) < 1e-9) return [[x1, y1], [x2, y2]];
    const s1 = x1 * x1 + y1 * y1, sm = xm * xm + ym * ym, s2 = x2 * x2 + y2 * y2;
    const cx = (s1 * (ym - y2) + sm * (y2 - y1) + s2 * (y1 - ym)) / d;
    const cy = (s1 * (x2 - xm) + sm * (x1 - x2) + s2 * (xm - x1)) / d;
    const r = Math.hypot(x1 - cx, y1 - cy);
    let a1 = Math.atan2(y1 - cy, x1 - cx), am = Math.atan2(ym - cy, xm - cx), a2 = Math.atan2(y2 - cy, x2 - cx);
    // 讓弧經過中點：調整 a2 / am 到 a1 的同向展開
    const norm = a => { while (a < a1) a += Math.PI * 2; return a; };
    am = norm(am); a2 = norm(a2);
    if (am > a2) { a2 = a2 - Math.PI * 2; am = am - Math.PI * 2; const t = a1; a1 = a2; a2 = t; }
    const pts = [];
    for (let k = 0; k <= nSeg; k++) {
      const a = a1 + (a2 - a1) * k / nSeg;
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    return pts;
  }

  // ---------- 匯出（整樹回寫）----------
  function fmt(x) { return (Math.round(x * 1e6) / 1e6).toString(); }

  function exportText(kicad, appState) {
    const { tree, off } = kicad;
    // 1) 元件位置回寫（編輯器移動過的）
    for (const comp of appState.components) {
      if (!comp.kicadNode) continue;
      const at = find(comp.kicadNode, 'at');
      if (!at) continue;
      at[1] = fmt(comp.x + off.x);
      at[2] = fmt(comp.y + off.y);
      // 旋轉回寫：footprint at 角度 + 每 pad at 角度（KiCad pad 角度是總角度）
      // 只在值有變時動節點，未編輯的保持原字節形式（零落差原則）
      const rot = comp.rot || 0;
      if ((num(at[3]) || 0) !== rot) {
        if (rot !== 0) at[3] = fmt(rot); else at.length = 3;
      }
      for (const p of comp.pads || []) {
        if (!p.node) continue;
        const pat = find(p.node, 'at');
        if (!pat) continue;
        const pr = p.rot || 0;
        if ((num(pat[3]) || 0) !== pr) {
          if (pr !== 0) pat[3] = fmt(pr); else pat.length = 3;
        }
      }
      // fp_text 角度回寫：目標 = 原始角度 + (目前 rot − 匯入時 rot)，冪等
      const tDelta = (((rot - (comp.kicadRot0 || 0)) % 360) + 360) % 360;
      for (const t of comp.kicadTexts || []) {
        const tat = find(t.node, 'at');
        if (!tat) continue;
        const target = (((t.rot0 + tDelta) % 360) + 360) % 360;
        if ((num(tat[3]) || 0) !== target) {
          if (target !== 0) tat[3] = fmt(target); else tat.length = 3;
        }
      }
    }
    // 2) 新增走線/via 附加到樹尾
    for (const t of appState.traces) {
      if (!t.id || String(t.id).indexOf('trace-') !== 0) continue; // 只加使用者新畫的
      tree.push(['segment',
        ['start', fmt(t.x1 + off.x), fmt(t.y1 + off.y)],
        ['end', fmt(t.x2 + off.x), fmt(t.y2 + off.y)],
        ['width', fmt(t.width || 0.3)],
        ['layer', { q: true, v: t.layer || 'F.Cu' }],
        ['net', '0']
      ]);
    }
    for (const v of appState.vias) {
      if (!v.user) continue;
      tree.push(['via',
        ['at', fmt(v.x + off.x), fmt(v.y + off.y)],
        ['size', fmt(v.od || 0.6)], ['drill', fmt(v.id || 0.3)],
        ['layers', { q: true, v: 'F.Cu' }, { q: true, v: 'B.Cu' }],
        ['net', '0']
      ]);
    }
    return serialize(tree, 0) + '\n';
  }

  // 從零建立基本檔（無 kicad 樹時）：外框 + 走線 + via + 元件示意（fab 外框，無 pad）
  function buildNew(appState) {
    const W = appState.boardWidth, H = appState.boardHeight;
    const cu = [['0', { q: true, v: 'F.Cu' }, 'signal']];
    const n = Math.max(2, appState.layers || 2);
    for (let i = 1; i <= n - 2; i++) cu.push([String(i), { q: true, v: 'In' + i + '.Cu' }, 'signal']);
    cu.push(['31', { q: true, v: 'B.Cu' }, 'signal']);
    cu.push(['44', { q: true, v: 'Edge.Cuts' }, 'user']);
    cu.push(['37', { q: true, v: 'F.SilkS' }, 'user']);
    const netNames = ['', ...new Set(appState.traces.map(t => t.net).filter(Boolean))];
    const tree = ['kicad_pcb',
      ['version', '20240108'], ['generator', { q: true, v: 'voltsketch' }],
      ['general', ['thickness', '1.6']],
      ['paper', { q: true, v: 'A4' }],
      ['layers', ...cu],
      ...netNames.map((nm, i) => ['net', String(i), { q: true, v: nm }])
    ];
    const netNo = nm => String(Math.max(0, netNames.indexOf(nm || '')));
    const ox = W / 2 + 20, oy = H / 2 + 20; // KiCad 慣例正座標區
    // 板框
    const rect = [[-W / 2, -H / 2, W / 2, -H / 2], [W / 2, -H / 2, W / 2, H / 2], [W / 2, H / 2, -W / 2, H / 2], [-W / 2, H / 2, -W / 2, -H / 2]];
    for (const [x1, y1, x2, y2] of rect) {
      tree.push(['gr_line', ['start', fmt(x1 + ox), fmt(y1 + oy)], ['end', fmt(x2 + ox), fmt(y2 + oy)],
        ['stroke', ['width', '0.1'], ['type', 'default']], ['layer', { q: true, v: 'Edge.Cuts' }]]);
    }
    // 元件：fab 外框示意（誠實：無 pad 腳位，位置/尺寸正確）
    for (const c of appState.components) {
      const w = c.w || 4, h = c.h || 3;
      tree.push(['footprint', { q: true, v: 'VoltSketch:' + (c.part || c.type || 'block') },
        ['layer', { q: true, v: c.side === 'bottom' ? 'B.Cu' : 'F.Cu' }],
        ['at', fmt(c.x + ox), fmt(c.y + oy)],
        ['property', { q: true, v: 'Reference' }, { q: true, v: c.ref || c.label || '' },
          ['at', '0', fmt(-h / 2 - 1), '0'], ['layer', { q: true, v: 'F.SilkS' }],
          ['effects', ['font', ['size', '1', '1'], ['thickness', '0.15']]]],
        ['fp_rect', ['start', fmt(-w / 2), fmt(-h / 2)], ['end', fmt(w / 2), fmt(h / 2)],
          ['stroke', ['width', '0.1'], ['type', 'default']], ['layer', { q: true, v: 'F.Fab' }]]
      ]);
    }
    for (const t of appState.traces) {
      tree.push(['segment', ['start', fmt(t.x1 + ox), fmt(t.y1 + oy)], ['end', fmt(t.x2 + ox), fmt(t.y2 + oy)],
        ['width', fmt(t.width || 0.3)], ['layer', { q: true, v: t.layer || 'F.Cu' }], ['net', netNo(t.net)]]);
    }
    for (const v of appState.vias) {
      tree.push(['via', ['at', fmt(v.x + ox), fmt(v.y + oy)], ['size', fmt(v.od || 0.6)], ['drill', fmt(v.id || 0.3)],
        ['layers', { q: true, v: 'F.Cu' }, { q: true, v: 'B.Cu' }], ['net', netNo(v.net)]]);
    }
    return serialize(tree, 0) + '\n';
  }

  return { parse, serialize, importText, exportText, buildNew, _arcPoints: arcPoints };
})();
