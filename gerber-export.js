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
 * 誠實界定：絲印文字用內建向量字體重繪（非 KiCad 原生字形）；手放無 pad 元件不會出現在銅層——皆列入回報。
 */
window.GerberExport = (function () {
  'use strict';

  // i18n：I18N 未載（純 node harness）時回 key
  const T = (k, vars) => (typeof window !== 'undefined' && window.I18N) ? window.I18N.t(k, vars) : k;

  // 點在多邊形內（even-odd ray cast；pts=[[x,y],…]）
  const ptInPoly = (px, py, pts) => {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
      if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  };

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
      '%TF.GenerationSoftware,HardwareAI,web,1.0*%',
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
      lpc() { body.push('%LPC*%'); },   // 清除極性（鋪銅避讓）
      lpd() { body.push('%LPD*%'); },   // 恢復暗極性
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

  // ---------- 內建向量字體（絲印文字用；0-9 A-Z 常用符號，未知字元畫方框） ----------
  // 每字 = 折線陣列，座標 0..0.7(寬) × 0..1(高，y 向上)
  const VFONT = {
    '0': [[[0, 0], [0.7, 0], [0.7, 1], [0, 1], [0, 0]], [[0, 0], [0.7, 1]]],
    '1': [[[0.15, 0.8], [0.35, 1], [0.35, 0]], [[0.15, 0], [0.55, 0]]],
    '2': [[[0, 1], [0.7, 1], [0.7, 0.5], [0, 0.5], [0, 0], [0.7, 0]]],
    '3': [[[0, 1], [0.7, 1], [0.7, 0], [0, 0]], [[0.2, 0.5], [0.7, 0.5]]],
    '4': [[[0, 1], [0, 0.5], [0.7, 0.5]], [[0.7, 1], [0.7, 0]]],
    '5': [[[0.7, 1], [0, 1], [0, 0.5], [0.7, 0.5], [0.7, 0], [0, 0]]],
    '6': [[[0.7, 1], [0, 1], [0, 0], [0.7, 0], [0.7, 0.5], [0, 0.5]]],
    '7': [[[0, 1], [0.7, 1], [0.3, 0]]],
    '8': [[[0, 0], [0.7, 0], [0.7, 1], [0, 1], [0, 0]], [[0, 0.5], [0.7, 0.5]]],
    '9': [[[0.7, 0.5], [0, 0.5], [0, 1], [0.7, 1], [0.7, 0], [0, 0]]],
    'A': [[[0, 0], [0, 0.8], [0.35, 1], [0.7, 0.8], [0.7, 0]], [[0, 0.45], [0.7, 0.45]]],
    'B': [[[0, 0], [0, 1], [0.55, 1], [0.7, 0.85], [0.7, 0.6], [0.55, 0.5], [0, 0.5]], [[0.55, 0.5], [0.7, 0.4], [0.7, 0.15], [0.55, 0], [0, 0]]],
    'C': [[[0.7, 0.15], [0.55, 0], [0.15, 0], [0, 0.15], [0, 0.85], [0.15, 1], [0.55, 1], [0.7, 0.85]]],
    'D': [[[0, 0], [0, 1], [0.5, 1], [0.7, 0.8], [0.7, 0.2], [0.5, 0], [0, 0]]],
    'E': [[[0.7, 0], [0, 0], [0, 1], [0.7, 1]], [[0, 0.5], [0.5, 0.5]]],
    'F': [[[0, 0], [0, 1], [0.7, 1]], [[0, 0.5], [0.5, 0.5]]],
    'G': [[[0.7, 0.85], [0.55, 1], [0.15, 1], [0, 0.85], [0, 0.15], [0.15, 0], [0.55, 0], [0.7, 0.15], [0.7, 0.45], [0.4, 0.45]]],
    'H': [[[0, 0], [0, 1]], [[0.7, 0], [0.7, 1]], [[0, 0.5], [0.7, 0.5]]],
    'I': [[[0.35, 0], [0.35, 1]], [[0.15, 0], [0.55, 0]], [[0.15, 1], [0.55, 1]]],
    'J': [[[0.7, 1], [0.7, 0.15], [0.55, 0], [0.15, 0], [0, 0.15]]],
    'K': [[[0, 0], [0, 1]], [[0.7, 1], [0, 0.5], [0.7, 0]]],
    'L': [[[0, 1], [0, 0], [0.7, 0]]],
    'M': [[[0, 0], [0, 1], [0.35, 0.6], [0.7, 1], [0.7, 0]]],
    'N': [[[0, 0], [0, 1], [0.7, 0], [0.7, 1]]],
    'O': [[[0.15, 0], [0.55, 0], [0.7, 0.15], [0.7, 0.85], [0.55, 1], [0.15, 1], [0, 0.85], [0, 0.15], [0.15, 0]]],
    'P': [[[0, 0], [0, 1], [0.55, 1], [0.7, 0.85], [0.7, 0.6], [0.55, 0.45], [0, 0.45]]],
    'Q': [[[0.15, 0], [0.55, 0], [0.7, 0.15], [0.7, 0.85], [0.55, 1], [0.15, 1], [0, 0.85], [0, 0.15], [0.15, 0]], [[0.45, 0.25], [0.7, 0]]],
    'R': [[[0, 0], [0, 1], [0.55, 1], [0.7, 0.85], [0.7, 0.6], [0.55, 0.45], [0, 0.45]], [[0.35, 0.45], [0.7, 0]]],
    'S': [[[0.7, 0.85], [0.55, 1], [0.15, 1], [0, 0.85], [0.15, 0.55], [0.55, 0.45], [0.7, 0.15], [0.55, 0], [0.15, 0], [0, 0.15]]],
    'T': [[[0, 1], [0.7, 1]], [[0.35, 1], [0.35, 0]]],
    'U': [[[0, 1], [0, 0.15], [0.15, 0], [0.55, 0], [0.7, 0.15], [0.7, 1]]],
    'V': [[[0, 1], [0.35, 0], [0.7, 1]]],
    'W': [[[0, 1], [0.15, 0], [0.35, 0.4], [0.55, 0], [0.7, 1]]],
    'X': [[[0, 0], [0.7, 1]], [[0, 1], [0.7, 0]]],
    'Y': [[[0, 1], [0.35, 0.5], [0.7, 1]], [[0.35, 0.5], [0.35, 0]]],
    'Z': [[[0, 1], [0.7, 1], [0, 0], [0.7, 0]]],
    '.': [[[0.3, 0], [0.42, 0], [0.42, 0.12], [0.3, 0.12], [0.3, 0]]],
    ',': [[[0.35, 0.12], [0.3, -0.1]]],
    '-': [[[0.1, 0.5], [0.6, 0.5]]],
    '+': [[[0.1, 0.5], [0.6, 0.5]], [[0.35, 0.25], [0.35, 0.75]]],
    '/': [[[0, 0], [0.7, 1]]],
    '_': [[[0, 0], [0.7, 0]]],
    ':': [[[0.3, 0.2], [0.42, 0.2], [0.42, 0.32], [0.3, 0.32], [0.3, 0.2]], [[0.3, 0.68], [0.42, 0.68], [0.42, 0.8], [0.3, 0.8], [0.3, 0.68]]],
    '(': [[[0.5, 1], [0.3, 0.7], [0.3, 0.3], [0.5, 0]]],
    ')': [[[0.2, 1], [0.4, 0.7], [0.4, 0.3], [0.2, 0]]],
    ' ': []
  };
  const VBOX = [[[0.05, 0.1], [0.65, 0.1], [0.65, 0.9], [0.05, 0.9], [0.05, 0.1]]]; // 未知字元

  // 絲印文字 → 線段（中心對齊；board 座標 y 向下；mirror=底面）
  function emitText(gf, ax, ay, rotDeg, sizeMm, thickMm, text, mirror) {
    const s = String(text || '');
    if (!s) return;
    const adv = 0.9 * sizeMm;
    const W = s.length * adv - 0.2 * sizeMm;
    const th = (rotDeg || 0) * Math.PI / 180;
    const c = Math.cos(th), sn = Math.sin(th);
    const put = (lx, lyUp) => {
      let rx = lx, ry = -lyUp;          // 文字 y 向上 → 板座標 y 向下
      if (mirror) rx = -rx;
      return { x: ax + rx * c + ry * sn, y: ay - rx * sn + ry * c };
    };
    for (let i = 0; i < s.length; i++) {
      const ch = s[i].toUpperCase();
      const glyph = VFONT[ch] !== undefined ? VFONT[ch] : VBOX;
      const x0 = -W / 2 + i * adv;
      for (const poly of glyph) {
        for (let k = 0; k + 1 < poly.length; k++) {
          const a = put(x0 + poly[k][0] * sizeMm, (poly[k][1] - 0.5) * sizeMm);
          const b = put(x0 + poly[k + 1][0] * sizeMm, (poly[k + 1][1] - 0.5) * sizeMm);
          gf.line(a.x, a.y, b.x, b.y, thickMm || 0.15);
        }
      }
    }
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
    const base = (baseName || 'hardwareai').replace(/\.kicad_pcb$/i, '');

    // 每一銅層一檔
    cuStack.forEach((layer, idx) => {
      const posTag = idx === 0 ? 'Top' : (idx === cuStack.length - 1 ? 'Bot' : 'Inr');
      const gf = GerberFile('Copper,L' + (idx + 1) + ',' + posTag);
      // 鋪銅（墊底）
      (state.zoneFills || []).forEach(z => { if (z.layer === layer.id) gf.region(z.pts); });
      // 使用者鋪銅：暗區域 + LPC 清除極性避讓（標準 Gerber 技法；後續暗物件會蓋回）
      const uz = (state.userZones || []).filter(z => z.layer === layer.id);
      if (uz.length) {
        uz.forEach(z => gf.region(z.pts));
        gf.lpc();
        const spokes = []; // 熱風焊盤輻條（LPD 後畫，避免被後續清除）
        for (const z of uz) {
          const cl = z.clearance || 0.3;
          const thermalOn = z.thermal !== false && !!z.net;
          (state.components || []).forEach(cp => (cp.pads || []).forEach(pad => {
            if (pad.cu === false) return;
            const hit = pad.side === '*' || (pad.side === 'F' && idx === 0) || (pad.side === 'B' && idx === cuStack.length - 1);
            if (!hit) return;
            const p = padAbsFn(cp, pad);
            const radius = pad.shape === 'circle' ? pad.w / 2 + cl
              : pad.shape === 'oval' ? Math.min(pad.w, pad.h) / 2 + cl
              : pad.shape === 'roundrect' ? (pad.rr || 0.25) * Math.min(pad.w, pad.h) + cl : cl;
            if (z.net && (pad.net || '') === z.net) {
              // 同網 pad：熱風焊盤＝清出環隙＋4 輻條（pad 本體由後續 pad pass 補回）
              if (thermalOn && ptInPoly(p.x, p.y, z.pts)) {
                gf.region(padOutline(p.x, p.y, pad.w + 2 * cl, pad.h + 2 * cl, ((pad.rot || 0) % 360 + 360) % 360, radius));
                const L = Math.max(pad.w, pad.h) / 2 + cl + 0.05;
                const a0 = ((pad.rot || 0) % 360) * Math.PI / 180;
                for (let k = 0; k < 4; k++) {
                  const a = a0 + k * Math.PI / 2;
                  spokes.push([p.x, p.y, p.x + L * Math.cos(a), p.y + L * Math.sin(a)]);
                }
              }
              return;
            }
            gf.region(padOutline(p.x, p.y, pad.w + 2 * cl, pad.h + 2 * cl, ((pad.rot || 0) % 360 + 360) % 360, radius));
          }));
          (state.traces || []).forEach(t => {
            if (t.fromArc) return;
            if ((t.layer || 'F.Cu') !== layer.id) return;
            if (z.net && (t.net || '') === z.net) return;
            gf.line(t.x1, t.y1, t.x2, t.y2, (t.width || 0.3) + 2 * cl);
          });
          (state.kicadArcs || []).forEach(a => {
            if (a.layer !== layer.id) return;
            if (z.net && (a.net || '') === z.net) return;
            gf.arc3(a.x1, a.y1, a.xm, a.ym, a.x2, a.y2, (a.width || 0.3) + 2 * cl);
          });
          (state.vias || []).forEach(v => {
            if (z.net && (v.net || '') === z.net) return; // 同網 via＝實心連接（業界常規）
            gf.flash(v.x, v.y, 'C,' + AP((v.od || 0.6) + 2 * cl));
          });
        }
        gf.lpd();
        spokes.forEach(s => gf.line(s[0], s[1], s[2], s[3], 0.4)); // 輻條 0.4mm
      }
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
      // pad：F 面→第一層、B 面→最後層、THT(*)→全層；paste/mask-only 開窗（cu:false）不進銅層
      (state.components || []).forEach(c => {
        (c.pads || []).forEach(pad => {
          if (pad.cu === false) return;
          const hit = pad.side === '*' || (pad.side === 'F' && idx === 0) || (pad.side === 'B' && idx === cuStack.length - 1);
          if (hit) emitPad(gf, c, pad, padAbsFn);
        });
      });
      files.push({ name: base + '-' + layer.id.replace('.', '_') + '.gbr', gf, fn: 'Copper,L' + (idx + 1) + ',' + posTag, pol: 'Positive' });
    });

    // 防焊層（開窗＝pad 同外形；KiCad 預設 margin 0；paste-only 開窗不進防焊）
    const maskDefs = [['F', 'Soldermask,Top', '-F_Mask.gbr'], ['B', 'Soldermask,Bot', '-B_Mask.gbr']];
    for (const [side, fn, suffix] of maskDefs) {
      const gf = GerberFile(fn, 'Negative');
      (state.components || []).forEach(c => {
        (c.pads || []).forEach(pad => {
          if (pad.cu === false) return;
          if (pad.side === side || pad.side === '*') emitPad(gf, c, pad, padAbsFn);
        });
      });
      (state.vias || []).forEach(v => { /* via 蓋油：不開窗（tented），業界常規 */ });
      files.push({ name: base + suffix, gf, fn, pol: 'Negative' });
    }

    // 鋼網 paste 層：SMD 上錫膏 pad 同形＋paste-only 拆分開窗（QFN EP 常見）；THT/NPTH 不上錫膏
    const pasteDefs = [['F', 'Paste,Top', '-F_Paste.gbr'], ['B', 'Paste,Bot', '-B_Paste.gbr']];
    let epFullPaste = 0;
    for (const [side, fn, suffix] of pasteDefs) {
      const gf = GerberFile(fn);
      (state.components || []).forEach(c => {
        (c.pads || []).forEach(pad => {
          if (pad.drill > 0 || pad.type === 'np_thru_hole') return;
          if (pad.side !== side) return;
          if (pad.paste === false) return; // KiCad 匯入且該 pad 無 Paste 層（EP 由拆分開窗供錫）
          // 手建 footprint 的 EP（置中大 pad）=100% 錫膏開窗，計數供警告
          if (pad.paste === undefined && pad.x === 0 && pad.y === 0 && Math.min(pad.w || 0, pad.h || 0) >= 2) epFullPaste++;
          emitPad(gf, c, pad, padAbsFn);
        });
      });
      files.push({ name: base + suffix, gf, fn, pol: 'Positive' });
    }

    // 絲印層（footprint 圖形＋文字＋板級圖形；文字用內建向量字體）
    const rot2 = deg => (deg % 360 + 360) % 360;
    const silkDefs = [['F', 'Legend,Top', '-F_SilkS.gbr'], ['B', 'Legend,Bot', '-B_SilkS.gbr']];
    let silkCount = 0;
    for (const [side, fn, suffix] of silkDefs) {
      const gf = GerberFile(fn);
      const emitShape = (g, toAbs) => {
        if (g.side !== side) return;
        silkCount++;
        if (g.kind === 'line') {
          const a = toAbs(g.x1, g.y1), b = toAbs(g.x2, g.y2);
          gf.line(a.x, a.y, b.x, b.y, g.w || 0.12);
        } else if (g.kind === 'circle') {
          const cc = toAbs(g.cx, g.cy);
          // 整圓：兩段半圓 G75 圓弧
          gf.arc3(cc.x - g.r, cc.y, cc.x, cc.y - g.r, cc.x + g.r, cc.y, g.w || 0.12);
          gf.arc3(cc.x + g.r, cc.y, cc.x, cc.y + g.r, cc.x - g.r, cc.y, g.w || 0.12);
        } else if (g.kind === 'arc') {
          const a = toAbs(g.x1, g.y1), m = toAbs(g.xm, g.ym), b = toAbs(g.x2, g.y2);
          gf.arc3(a.x, a.y, m.x, m.y, b.x, b.y, g.w || 0.12);
        }
      };
      (state.components || []).forEach(c => {
        const th = (c.rot || 0) * Math.PI / 180, co = Math.cos(th), si = Math.sin(th);
        const toAbs = (rx, ry) => ({ x: c.x + rx * co + ry * si, y: c.y - rx * si + ry * co });
        (c.silk || []).forEach(g => emitShape(g, toAbs));
        (c.silkTexts || []).forEach(t => {
          if (t.side !== side) return;
          silkCount++;
          const p = toAbs(t.x, t.y);
          const delta = (c.rot || 0) - (c.kicadRot0 !== undefined ? c.kicadRot0 : (c.rot || 0));
          emitText(gf, p.x, p.y, rot2(t.rot0 + delta), t.size || 1, t.thick || 0.15, t.text, side === 'B');
        });
      });
      (state.silkGr || []).forEach(g => emitShape(g, (x, y) => ({ x, y })));
      files.push({ name: base + suffix, gf, fn, pol: 'Positive' });
    }

    // 板框
    const gfEdge = GerberFile('Profile,NP');
    const edges = (state.edgeSegs && state.edgeSegs.length) ? state.edgeSegs
      : [{ x1: -state.boardWidth / 2, y1: -state.boardHeight / 2, x2: state.boardWidth / 2, y2: -state.boardHeight / 2 },
         { x1: state.boardWidth / 2, y1: -state.boardHeight / 2, x2: state.boardWidth / 2, y2: state.boardHeight / 2 },
         { x1: state.boardWidth / 2, y1: state.boardHeight / 2, x2: -state.boardWidth / 2, y2: state.boardHeight / 2 },
         { x1: -state.boardWidth / 2, y1: state.boardHeight / 2, x2: -state.boardWidth / 2, y2: -state.boardHeight / 2 }];
    edges.forEach(e => gfEdge.line(e.x1, e.y1, e.x2, e.y2, 0.1));
    files.push({ name: base + '-Edge_Cuts.gbr', gf: gfEdge, fn: 'Profile,NP', pol: 'Positive' });

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
    // 背鑽（depth-controlled；per-side 檔＋must-not-cut 註解，板廠依此設鑽深）
    const bds = state.backdrills || [];
    if (bds.length) {
      for (const [side, suffix] of [['T', '-Backdrill-Top.drl'], ['B', '-Backdrill-Bot.drl']]) {
        const list = bds.filter(b => b.side === side);
        if (!list.length) continue;
        const mnc = [...new Set(list.map(b => b.to))].join(', ');
        const head = '; Backdrill from ' + (side === 'T' ? 'TOP' : 'BOTTOM') + ' - depth-controlled, must-not-cut layer(s): ' + mnc + '\n';
        drills.push({ name: base + suffix, text: head + drillFile(list.map(b => ({ x: b.x, y: b.y, d: b.d })), []) });
      }
    }

    // ---------- CPL 貼片座標檔（SMT 置件；座標系與 Gerber 一致：Y 向上、板中心原點） ----------
    const cplEsc = v => { v = String(v == null ? '' : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    const cplRows = [['Designator', 'Val', 'Package', 'Mid X', 'Mid Y', 'Rotation', 'Layer']];
    let cplSkipped = 0;
    (state.components || []).forEach(c => {
      if (!c.pads || !c.pads.length) { cplSkipped++; return; }
      cplRows.push([
        c.ref || c.label || '', c.part || '', c.package || '',
        c.x.toFixed(4) + 'mm', (-c.y).toFixed(4) + 'mm',
        String(Math.round(((c.rot || 0) % 360 + 360) % 360)),
        (c.side || 'top') === 'bottom' ? 'Bottom' : 'Top'
      ].map(cplEsc));
    });
    const cplText = cplRows.map(r => r.join(',')).join('\n') + '\n';

    // ---------- IPC-D-356A 電測 netlist（inch CUST 0 慣例，座標 0.0001"） ----------
    function ipc356Text() {
      const L = [
        'C  IPC-D-356A netlist  generated by HardwareAI',
        'C  units: inches x 0.0001 (CUST 0), KiCad-compatible layout',
        'P  JOB   ' + base,
        'P  CODE  00',
        'P  UNITS CUST 0',
        'P  DIM   N'
      ];
      const tm = mm => Math.round(mm / 25.4 * 10000); // mm → 0.1 mil
      const f6 = v => (v < 0 ? '-' : '+') + String(Math.min(999999, Math.abs(v))).padStart(6, '0');
      const f4 = v => String(Math.max(0, Math.min(9999, Math.round(v)))).padStart(4, '0');
      const netf = n => String(n || 'N/C').replace(/\s+/g, '_').slice(0, 14).padEnd(14);
      const reff = r => String(r || '').slice(0, 6).padEnd(6);
      const pinf = p => String(p || '').slice(0, 4).padEnd(4);
      let recs = 0;
      (state.components || []).forEach(c => {
        (c.pads || []).forEach(pad => {
          if (pad.cu === false || pad.type === 'np_thru_hole') return;
          const p = padAbsFn(c, pad);
          const tht = pad.drill > 0;
          const rot = Math.round(((pad.rot || 0) % 360 + 360) % 360);
          let rec = (tht ? '317' : '327') + netf(pad.net) + '   ' + reff(c.ref || c.label) + '-' + pinf(pad.num);
          rec += tht ? ('D' + f4(tm(pad.drill)) + 'PA00') : ('      A' + (pad.side === 'B' ? '02' : '01'));
          rec += 'X' + f6(tm(p.x)) + 'Y' + f6(tm(-p.y));
          rec += 'X' + f4(tm(pad.w || 0)) + 'Y' + f4(tm(pad.h || 0));
          rec += 'R' + String(rot).padStart(3, '0') + ' S0';
          L.push(rec);
          recs++;
        });
      });
      (state.vias || []).forEach(v => {
        let rec = '317' + netf(v.net) + '   ' + reff('VIA') + '-' + pinf('');
        rec += 'D' + f4(tm(v.id || 0.3)) + 'PA00';
        rec += 'X' + f6(tm(v.x)) + 'Y' + f6(tm(-v.y));
        rec += 'X' + f4(tm(v.od || 0.6)) + 'Y' + f4(tm(v.od || 0.6));
        rec += 'R000 S3'; // 蓋油 via
        L.push(rec);
        recs++;
      });
      L.push('999');
      return { text: L.join('\n') + '\n', recs };
    }
    const ipc = ipc356Text();

    // ---------- Gerber Job（X2 .gbrjob，CAM 對檔用） ----------
    const jobText = JSON.stringify({
      Header: { GenerationSoftware: { Vendor: 'HardwareAI', Application: 'web', Version: '1.0' }, CreationDate: new Date().toISOString() },
      GeneralSpecs: {
        ProjectId: { Name: base },
        Size: { X: state.boardWidth, Y: state.boardHeight },
        LayerNumber: cuStack.length,
        BoardThickness: 1.6
      },
      FilesAttributes: files.map(f => ({ Path: f.name, FileFunction: f.fn || '', FilePolarity: f.pol || 'Positive' }))
    }, null, 2) + '\n';

    // ---------- 警告（誠實回報） ----------
    const zonesNoFill = (state.zones || []).length > 0 && (!state.zoneFills || !state.zoneFills.length);
    if (zonesNoFill) warnings.push(T('ge_w_nofill', { n: state.zones.length }));
    const noPadComps = (state.components || []).filter(c => !c.pads || !c.pads.length);
    if (noPadComps.length) warnings.push(T('ge_w_nopad', { n: noPadComps.length, list: noPadComps.slice(0, 8).map(c => c.ref || c.label).join(',') + (noPadComps.length > 8 ? '…' : '') }));
    if ((state.userZones || []).length)
      warnings.push(T('ge_w_userzone', { cl: (state.userZones[0] || {}).clearance || 0.3 }));
    if (silkCount > 0) warnings.push(T('ge_w_silk'));
    else warnings.push(T('ge_w_nosilk'));
    if (epFullPaste) warnings.push(T('ge_w_ep', { n: epFullPaste }));
    if (cplSkipped) warnings.push(T('ge_w_cpl', { n: cplSkipped }));
    warnings.push(T('ge_w_ipc'));

    const out = files.map(f => ({ name: f.name, text: f.gf.text(), stats: f.gf.stats }))
      .concat(drills.map(d => ({ name: d.name, text: d.text, stats: null })))
      .concat([
        { name: base + '-CPL.csv', text: cplText, stats: null },
        { name: base + '.ipc', text: ipc.text, stats: null },
        { name: base + '-job.gbrjob', text: jobText, stats: null }
      ]);
    return { files: out, warnings, drillCounts: { pth: pth.length, npth: npth.length, slots: slots.length }, cplCount: cplRows.length - 1, ipcRecords: ipc.recs };
  }

  function downloadZip(state, padAbsFn, baseName) {
    const r = build(state, padAbsFn, baseName);
    const zip = zipStore(r.files.map(f => ({ name: f.name, text: f.text })));
    const blob = new Blob([zip], { type: 'application/zip' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (baseName || 'hardwareai').replace(/\.kicad_pcb$/i, '') + '-gerber.zip';
    a.click();
    URL.revokeObjectURL(a.href);
    return r;
  }

  return { build, downloadZip, zipStore, _padOutline: padOutline };
})();
