/**
 * gerber-export.js — Gerber X2（RS-274X）＋ Excellon 鑽孔匯出（打版包 ZIP）
 * 座標約定：Gerber Y 軸向上（業界/KiCad plot 慣例）→ 輸出 Y = −板座標 y。
 * 格式：%FSLAX46Y46*%（4.6，mm×1e6 整數）、%MOMM*%。
 * 幾何策略：
 *   - 走線＝C 光圈 D01；圓弧走線＝G75 G02/G03 真圓弧（非折線）。
 *   - pad：軸對齊純矩形→R 光圈 flash、圓→C flash；roundrect/oval/任意旋轉→G36 區域精確外形
 *     （圓角以 16 段/角折線，最大徑向偏差 ≈0.3µm，遠小於板廠 ±25µm 公差）。
 *   - 鋪銅＝KiCad filled_polygon（已含避讓）→ G36 區域；無 filled_polygon 的 zone 列入警告。
 *   - 鑽孔＝Excellon METRIC 小數座標；圓孔 T 工具、橢圓孔 G85 開槽。
 * 誠實界定：絲印層（SilkS）未匯出（模型未抽取）；手放無 pad 元件不會出現在銅層——皆列入回報。
 */
window.GerberExport = (function () {
  'use strict';

  // ---------- CRC32 + ZIP（store，無壓縮） ----------
  const CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[n] = c >>> 0;
    }
    return t;
  })();
  function crc32(bytes) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }
  function zipStore(files) { // files: [{name, text}]
    const enc = new TextEncoder();
    const parts = [], central = [];
    let offset = 0;
    const u16 = v => new Uint8Array([v & 255, (v >> 8) & 255]);
    const u32 = v => new Uint8Array([v & 255, (v >> 8) & 255, (v >> 16) & 255, (v >>> 24) & 255]);
    for (const f of files) {
      const name = enc.encode(f.name), data = enc.encode(f.text);
      const crc = crc32(data);
      const local = [u32(0x04034b50), u16(20), u16(0), u16(0), u16(0), u16(0), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), name, data];
      central.push({ name, data, crc, offset });
      local.forEach(p => parts.push(p));
      offset += local.reduce((a, p) => a + p.length, 0);
    }
    const cdStart = offset;
    for (const c of central) {
      [u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(0), u16(0), u32(c.crc), u32(c.data.length), u32(c.data.length),
        u16(c.name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(c.offset), c.name].forEach(p => parts.push(p));
      offset += 46 + c.name.length;
    }
    [u32(0x06054b50), u16(0), u16(0), u16(central.length), u16(central.length), u32(offset - cdStart), u32(cdStart), u16(0)].forEach(p => parts.push(p));
    const total = parts.reduce((a, p) => a + p.length, 0);
    const out = new Uint8Array(total);
    let pos = 0;
    parts.forEach(p => { out.set(p, pos); pos += p.length; });
    return out;
  }

  // ---------- Gerber 檔生成器 ----------
  const IC = mm => String(Math.round(mm * 1e6)); // 4.6 整數座標
  const AP = mm => (Math.round(mm * 1e6) / 1e6).toFixed(6); // 光圈定義用小數

  function GerberFile(fileFunction, polarity) {
    const head = [
      '%TF.GenerationSoftware,VoltSketch,web,1.0*%',
      '%TF.FileFunction,' + fileFunction + '*%',
      '%TF.FilePolarity,' + (polarity || 'Positive') + '*%',
      '%FSLAX46Y46*%',
      '%MOMM*%'
    ];
    const apertures = new Map(); // key → Dnn
    let dnext = 10;
    const body = [];
    let curD = null;
    function aperture(def) {
      if (!apertures.has(def)) {
        apertures.set(def, 'D' + dnext);
        dnext++;
      }
      return apertures.get(def);
    }
    function use(def) {
      const d = aperture(def);
      if (curD !== d) { body.push(d + '*'); curD = d; }
    }
    const api = {
      stats: { flash: 0, draw: 0, arc: 0, region: 0 },
      flash(x, y, def) { use(def); body.push('X' + IC(x) + 'Y' + IC(-y) + 'D03*'); api.stats.flash++; },
      line(x1, y1, x2, y2, widthMm) {
        use('C,' + AP(widthMm));
        body.push('G01*');
        body.push('X' + IC(x1) + 'Y' + IC(-y1) + 'D02*');
        body.push('X' + IC(x2) + 'Y' + IC(-y2) + 'D01*');
        api.stats.draw++;
      },
      // 三點圓弧（板座標，y 向下）→ G75 多象限圓弧
      arc3(x1, y1, xm, ym, x2, y2, widthMm) {
        const c = circleFrom3(x1, y1, xm, ym, x2, y2);
        if (!c) { api.line(x1, y1, x2, y2, widthMm); return; }
        use('C,' + AP(widthMm));
        // 翻 Y 後判向：cross>0 → CCW(G03)
        const cross = (xm - x1) * ((-y2) - (-ym)) - ((-ym) - (-y1)) * (x2 - xm);
        const g = cross > 0 ? 'G03' : 'G02';
        body.push('G75*');
        body.push('X' + IC(x1) + 'Y' + IC(-y1) + 'D02*');
        body.push(g + 'X' + IC(x2) + 'Y' + IC(-y2) + 'I' + IC(c.cx - x1) + 'J' + IC(y1 - c.cy) + 'D01*');
        body.push('G01*');
        api.stats.arc++;
      },
      // 區域：pts = [[x,y],...]（板座標），直線邊界
      region(pts) {
        if (pts.length < 3) return;
        body.push('G36*');
        body.push('X' + IC(pts[0][0]) + 'Y' + IC(-pts[0][1]) + 'D02*');
        body.push('G01*');
        for (let i = 1; i < pts.length; i++) body.push('X' + IC(pts[i][0]) + 'Y' + IC(-pts[i][1]) + 'D01*');
        body.push('X' + IC(pts[0][0]) + 'Y' + IC(-pts[0][1]) + 'D01*');
        body.push('G37*');
        api.stats.region++;
      },
      text() {
        const apDefs = [...apertures.entries()].map(([def, d]) => '%AD' + d + def + '*%');
        return head.concat(apDefs, ['G01*'], body, ['M02*']).join('\n') + '\n';
      }
    };
    return api;
  }

  function circleFrom3(x1, y1, xm, ym, x2, y2) {
    const d = 2 * (x1 * (ym - y2) + xm * (y2 - y1) + x2 * (y1 - ym));
    if (Math.abs(d) < 1e-9) return null;
    const s1 = x1 * x1 + y1 * y1, sm = xm * xm + ym * ym, s2 = x2 * x2 + y2 * y2;
    return {
      cx: (s1 * (ym - y2) + sm * (y2 - y1) + s2 * (y1 - ym)) / d,
      cy: (s1 * (x2 - xm) + sm * (x1 - x2) + s2 * (xm - x1)) / d
    };
  }

  // pad 精確外形（板座標多邊形；圓角以 8 段/角折線近似，弦差 < 1µm @ r≤1mm）
  function padOutline(cx, cy, w, h, rotDeg, radius) {
    const r = Math.min(radius || 0, Math.min(w, h) / 2);
    const hw = w / 2, hh = h / 2;
    const th = (rotDeg || 0) * Math.PI / 180;
    const cos = Math.cos(th), sin = Math.sin(th);
    const pts = [];
    const corner = (sx, sy, a0) => { // 角圓心（相對）＋起始角，掃 90°（連續繞行）
      const ccx = sx * (hw - r), ccy = sy * (hh - r);
      if (r === 0) { pts.push([sx * hw, sy * hh]); return; }
      const N = 16; // 16 段/角：最大徑向偏差 r(1−cos(π/64)) ≈ 0.3µm @ r=0.25mm
      for (let i = 0; i <= N; i++) {
        const a = a0 + (Math.PI / 2) * (i / N);
        pts.push([ccx + r * Math.cos(a), ccy + r * Math.sin(a)]);
      }
    };
    // 連續繞行（y 向下）：右下 0°→90° → 左下 90°→180° → 左上 180°→270° → 右上 270°→360°
    corner(1, 1, 0);
    corner(-1, 1, Math.PI / 2);
    corner(-1, -1, Math.PI);
    corner(1, -1, Math.PI * 3 / 2);
    // 旋轉（KiCad 正角度=視覺逆時針，y 向下 → x' = x·cos + y·sin, y' = −x·sin + y·cos）
    return pts.map(p => [cx + p[0] * cos + p[1] * sin, cy - p[0] * sin + p[1] * cos]);
  }

  // pad → 銅層繪製（flash 或 region）
  function emitPad(gf, comp, pad, padAbsFn) {
    const p = padAbsFn(comp, pad);
    const rot = ((pad.rot || 0) % 360 + 360) % 360; // pad.rot 已是總角度（含 footprint 旋轉）
    const axis = rot % 90 === 0;
    const swap = rot % 180 !== 0;
    const w = swap && axis ? pad.h : pad.w, h = swap && axis ? pad.w : pad.h;
    if (pad.shape === 'circle') { gf.flash(p.x, p.y, 'C,' + AP(pad.w)); return; }
    if (pad.shape === 'rect' && axis) { gf.flash(p.x, p.y, 'R,' + AP(w) + 'X' + AP(h)); return; }
    if (pad.shape === 'oval' && axis) { gf.flash(p.x, p.y, 'O,' + AP(w) + 'X' + AP(h)); return; }
    // roundrect / 任意角度 → 精確區域
    const radius = pad.shape === 'oval' ? Math.min(pad.w, pad.h) / 2
      : pad.shape === 'roundrect' ? (pad.rr || 0.25) * Math.min(pad.w, pad.h)
      : 0;
    gf.region(padOutline(p.x, p.y, pad.w, pad.h, rot, radius));
  }

  // ---------- 主建置 ----------
  function build(state, padAbsFn, baseName) {
    const warnings = [];
    const cuStack = (state.layerStack || []).filter(l => l.kind === 'copper');
    const files = [];
    const base = (baseName || 'voltsketch').replace(/\.kicad_pcb$/i, '');

    // 每一銅層一檔
    cuStack.forEach((layer, idx) => {
      const posTag = idx === 0 ? 'Top' : (idx === cuStack.length - 1 ? 'Bot' : 'Inr');
      const gf = GerberFile('Copper,L' + (idx + 1) + ',' + posTag);
      // 鋪銅（墊底）
      (state.zoneFills || []).forEach(z => { if (z.layer === layer.id) gf.region(z.pts); });
      // 走線（跳過弧線折線，改出真圓弧）
      (state.traces || []).forEach(t => {
        if (t.fromArc) return;
        if ((t.layer || 'F.Cu') === layer.id) gf.line(t.x1, t.y1, t.x2, t.y2, t.width || 0.3);
      });
      (state.kicadArcs || []).forEach(a => {
        if (a.layer === layer.id) gf.arc3(a.x1, a.y1, a.xm, a.ym, a.x2, a.y2, a.width || 0.3);
      });
      // via（全銅層）
      (state.vias || []).forEach(v => gf.flash(v.x, v.y, 'C,' + AP(v.od || 0.6)));
      // pad：F 面→第一層、B 面→最後層、THT(*)→全層
      (state.components || []).forEach(c => {
        (c.pads || []).forEach(pad => {
          const hit = pad.side === '*' || (pad.side === 'F' && idx === 0) || (pad.side === 'B' && idx === cuStack.length - 1);
          if (hit) emitPad(gf, c, pad, padAbsFn);
        });
      });
      files.push({ name: base + '-' + layer.id.replace('.', '_') + '.gbr', gf });
    });

    // 防焊層（開窗＝pad 同外形；KiCad 預設 margin 0）
    const maskDefs = [['F', 'Soldermask,Top', '-F_Mask.gbr'], ['B', 'Soldermask,Bot', '-B_Mask.gbr']];
    for (const [side, fn, suffix] of maskDefs) {
      const gf = GerberFile(fn, 'Negative');
      (state.components || []).forEach(c => {
        (c.pads || []).forEach(pad => {
          if (pad.side === side || pad.side === '*') emitPad(gf, c, pad, padAbsFn);
        });
      });
      (state.vias || []).forEach(v => { /* via 蓋油：不開窗（tented），業界常規 */ });
      files.push({ name: base + suffix, gf });
    }

    // 板框
    const gfEdge = GerberFile('Profile,NP');
    const edges = (state.edgeSegs && state.edgeSegs.length) ? state.edgeSegs
      : [{ x1: -state.boardWidth / 2, y1: -state.boardHeight / 2, x2: state.boardWidth / 2, y2: -state.boardHeight / 2 },
         { x1: state.boardWidth / 2, y1: -state.boardHeight / 2, x2: state.boardWidth / 2, y2: state.boardHeight / 2 },
         { x1: state.boardWidth / 2, y1: state.boardHeight / 2, x2: -state.boardWidth / 2, y2: state.boardHeight / 2 },
         { x1: -state.boardWidth / 2, y1: state.boardHeight / 2, x2: -state.boardWidth / 2, y2: -state.boardHeight / 2 }];
    edges.forEach(e => gfEdge.line(e.x1, e.y1, e.x2, e.y2, 0.1));
    files.push({ name: base + '-Edge_Cuts.gbr', gf: gfEdge });

    // ---------- Excellon 鑽孔 ----------
    const fd = mm => (Math.round(mm * 1000) / 1000).toString();
    function drillFile(entries, slots) { // entries: [{x,y,d}], slots: [{x1,y1,x2,y2,d}]
      const tools = [...new Set(entries.map(e => e.d).concat(slots.map(s => s.d)))].sort((a, b) => a - b);
      const lines = ['M48', 'METRIC,TZ'];
      tools.forEach((d, i) => lines.push('T' + (i + 1) + 'C' + fd(d)));
      lines.push('%', 'G90', 'G05');
      tools.forEach((d, i) => {
        const hits = entries.filter(e => e.d === d), sl = slots.filter(s => s.d === d);
        if (!hits.length && !sl.length) return;
        lines.push('T' + (i + 1));
        hits.forEach(e => lines.push('X' + fd(e.x) + 'Y' + fd(-e.y)));
        sl.forEach(s => lines.push('X' + fd(s.x1) + 'Y' + fd(-s.y1) + 'G85X' + fd(s.x2) + 'Y' + fd(-s.y2)));
      });
      lines.push('T0', 'M30');
      return lines.join('\n') + '\n';
    }
    const pth = [], npth = [], slots = [];
    (state.vias || []).forEach(v => pth.push({ x: v.x, y: v.y, d: v.id || 0.3 }));
    (state.components || []).forEach(c => {
      (c.pads || []).forEach(pad => {
        if (!pad.drill || pad.drill <= 0) return;
        const p = padAbsFn(c, pad);
        const bucket = pad.type === 'np_thru_hole' ? npth : pth;
        if (pad.slot) {
          // 開槽：沿 pad 旋轉方向的長軸
          const len = Math.max(pad.slot.w, pad.slot.h) - Math.min(pad.slot.w, pad.slot.h);
          const horiz = pad.slot.w >= pad.slot.h;
          const th = -(pad.rot || 0) * Math.PI / 180;
          const dx = (horiz ? len / 2 : 0), dy = (horiz ? 0 : len / 2);
          const rx = dx * Math.cos(th) - dy * Math.sin(th), ry = dx * Math.sin(th) + dy * Math.cos(th);
          slots.push({ x1: p.x - rx, y1: p.y - ry, x2: p.x + rx, y2: p.y + ry, d: Math.min(pad.slot.w, pad.slot.h) });
        } else bucket.push({ x: p.x, y: p.y, d: pad.drill });
      });
    });
    const drills = [{ name: base + '-PTH.drl', text: drillFile(pth, slots) }];
    if (npth.length) drills.push({ name: base + '-NPTH.drl', text: drillFile(npth, []) });

    // ---------- 警告（誠實回報） ----------
    const zonesNoFill = (state.zones || []).length > 0 && (!state.zoneFills || !state.zoneFills.length);
    if (zonesNoFill) warnings.push('板上有 ' + state.zones.length + ' 個鋪銅 zone 但檔內無 filled_polygon（KiCad 內按 B 灌銅後再存檔），銅層 Gerber 不含鋪銅');
    const noPadComps = (state.components || []).filter(c => !c.pads || !c.pads.length);
    if (noPadComps.length) warnings.push(noPadComps.length + ' 個元件無 pad 幾何（手放/公版示意），不會出現在銅層：' + noPadComps.slice(0, 8).map(c => c.ref || c.label).join(',') + (noPadComps.length > 8 ? '…' : ''));
    warnings.push('絲印層（SilkS）未匯出（本模型未抽取絲印圖形）');

    const out = files.map(f => ({ name: f.name, text: f.gf.text(), stats: f.gf.stats })).concat(drills.map(d => ({ name: d.name, text: d.text, stats: null })));
    return { files: out, warnings, drillCounts: { pth: pth.length, npth: npth.length, slots: slots.length } };
  }

  function downloadZip(state, padAbsFn, baseName) {
    const r = build(state, padAbsFn, baseName);
    const zip = zipStore(r.files.map(f => ({ name: f.name, text: f.text })));
    const blob = new Blob([zip], { type: 'application/zip' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (baseName || 'voltsketch').replace(/\.kicad_pcb$/i, '') + '-gerber.zip';
    a.click();
    URL.revokeObjectURL(a.href);
    return r;
  }

  return { build, downloadZip, zipStore, _padOutline: padOutline };
})();
