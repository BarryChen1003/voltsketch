/**
 * schematic-symbols.js
 * 共用電路符號庫（IEEE 線條風格，藍色），供 index.html 編輯器與 knowledge.html 知識庫共用。
 * 每個 builder 接受中心座標 (x, y) 與 options，回傳 SVG 字串片段（絕對座標）。
 * 風格參考使用者提供圖片：電阻=鋸齒、NMOS=閘極板+通道+本體箭頭+體二極體、雙NMOS=外框內兩顆。
 */
(function (global) {
  'use strict';

  const C = '#1f4fd1';   // 主線條藍
  const FILL = '#1f4fd1'; // 箭頭/實心填充

  // ---- 低階繪圖輔助 ----
  function ln(x1, y1, x2, y2, opt = {}) {
    const c = opt.color || C, w = opt.w || 2;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
  }
  function poly(points, opt = {}) {
    const c = opt.color || C, w = opt.w || 2, fill = opt.fill || 'none';
    return `<polyline points="${points}" fill="${fill}" stroke="${c}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
  }
  function tri(points, opt = {}) {
    const c = opt.color || C, fill = opt.fill || FILL;
    return `<polygon points="${points}" fill="${fill}" stroke="${c}" stroke-width="${opt.w || 1}"/>`;
  }
  function circ(cx, cy, r, opt = {}) {
    const c = opt.color || C, w = opt.w || 2, fill = opt.fill || 'none';
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${c}" stroke-width="${w}"/>`;
  }
  function dotJ(cx, cy, opt = {}) {
    return `<circle cx="${cx}" cy="${cy}" r="${opt.r || 2.6}" fill="${opt.color || C}"/>`;
  }
  // 自動下標：Vout→V_out、VCC→V_CC、SDA_L→SDA_L(L 下標)；非此型維持原樣
  function subscriptize(s, size) {
    const sub = Math.round(size * 0.72);
    const str = String(s);
    let m;
    if ((m = str.match(/^([A-Za-z]+)_([A-Za-z0-9+\-]+)$/))) {
      return `${m[1]}<tspan dy="2" font-size="${sub}">${m[2]}</tspan>`;
    }
    if ((m = str.match(/^(V)([A-Za-z][A-Za-z0-9]*)(\s.*)?$/))) {
      return `${m[1]}<tspan dy="2" font-size="${sub}">${m[2]}</tspan><tspan dy="-2">${m[3] || ''}</tspan>`;
    }
    return str;
  }
  function txt(x, y, s, opt = {}) {
    const anchor = opt.anchor || 'middle', size = opt.size || 11, fill = opt.fill || '#1d2943';
    const weight = opt.weight ? ` font-weight="${opt.weight}"` : '';
    const inner = opt.raw ? String(s) : subscriptize(s, size);
    return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" fill="${fill}"${weight} font-family="system-ui,sans-serif">${inner}</text>`;
  }

  // ---- 元件符號 ----

  /** 電阻：鋸齒（圖2 風格）。預設水平；horizontal:false 則垂直。終端間距 48。 */
  function resistor(x, y, opt = {}) {
    const color = opt.color || C, w = opt.w || 2;
    let g = '';
    if (opt.horizontal !== false) {
      // 終端 x-24..x+24，鋸齒在 -12..12
      g += ln(x - 24, y, x - 12, y, { color, w });
      g += poly(
        `${x - 12},${y} ${x - 9},${y - 7} ${x - 3},${y + 7} ${x + 3},${y - 7} ${x + 9},${y + 7} ${x + 12},${y}`,
        { color, w }
      );
      g += ln(x + 12, y, x + 24, y, { color, w });
      if (opt.label) g += txt(x, y - 12, opt.label, { size: opt.size || 10 });
      if (opt.value) g += txt(x, y + 18, opt.value, { size: opt.size || 9, fill: '#64748b' });
    } else {
      g += ln(x, y - 24, x, y - 12, { color, w });
      g += poly(
        `${x},${y - 12} ${x - 7},${y - 9} ${x + 7},${y - 3} ${x - 7},${y + 3} ${x + 7},${y + 9} ${x},${y + 12}`,
        { color, w }
      );
      g += ln(x, y + 12, x, y + 24, { color, w });
      const right = opt.labelSide === 'right';
      const lx = right ? x + 14 : x - 14, la = right ? 'start' : 'end';
      if (opt.label) g += txt(lx, y - 3, opt.label, { anchor: la, size: opt.size || 10 });
      if (opt.value) g += txt(lx, y + 10, opt.value, { anchor: la, size: opt.size || 9, fill: '#64748b' });
    }
    return g;
  }

  /** 電容（無極性）。垂直方向，兩平行板。 */
  function capacitor(x, y, opt = {}) {
    const color = opt.color || C, w = opt.w || 2;
    let g = '';
    g += ln(x, y - 22, x, y - 5, { color, w });
    g += ln(x - 11, y - 5, x + 11, y - 5, { color, w: 2.6 });
    g += ln(x - 11, y + 5, x + 11, y + 5, { color, w: 2.6 });
    g += ln(x, y + 5, x, y + 22, { color, w });
    // 標籤側可選（預設左），與板子保持距離避免被導線穿過
    const cr = opt.labelSide === 'right';
    const clx = cr ? x + 15 : x - 15, cla = cr ? 'start' : 'end';
    if (opt.label) g += txt(clx, y - 1, opt.label, { anchor: cla, size: 9, fill: '#64748b' });
    if (opt.value) g += txt(clx, y + 11, opt.value, { anchor: cla, size: 9, fill: '#64748b' });
    return g;
  }

  /** 接地。 */
  function ground(x, y, opt = {}) {
    const color = opt.color || C, w = opt.w || 2;
    let g = '';
    g += ln(x, y - 14, x, y, { color, w });
    g += ln(x - 12, y, x + 12, y, { color, w });
    g += ln(x - 8, y + 5, x + 8, y + 5, { color, w });
    g += ln(x - 4, y + 10, x + 4, y + 10, { color, w });
    // 預設不印 GND 字（接地符號本身已明確），避免字壓線；需要才傳 opt.label
    if (opt.label) g += txt(x, y + 22, opt.label, { size: 9, fill: '#64748b' });
    return g;
  }

  /** 二極體。水平，陰極在右。 */
  function diode(x, y, opt = {}) {
    const color = opt.color || C, w = opt.w || 2;
    let g = '';
    g += ln(x - 22, y, x - 8, y, { color, w });
    g += tri(`${x - 8},${y - 8} ${x - 8},${y + 8} ${x + 8},${y}`, { color, fill: 'none', w });
    g += ln(x + 8, y - 8, x + 8, y + 8, { color, w });
    g += ln(x + 8, y, x + 22, y, { color, w });
    if (opt.label) g += txt(x, y - 14, opt.label, { size: 10 });
    return g;
  }

  /** 電感。 */
  function inductor(x, y, opt = {}) {
    const color = opt.color || C, w = opt.w || 2;
    let g = ln(x - 24, y, x - 18, y, { color, w });
    let d = `M ${x - 18} ${y}`;
    for (let i = 0; i < 4; i++) {
      const bx = x - 18 + i * 9;
      d += ` A 4.5 4.5 0 1 1 ${bx + 9} ${y}`;
    }
    g += `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}"/>`;
    g += ln(x + 18, y, x + 24, y, { color, w });
    if (opt.label) g += txt(x, y - 12, opt.label, { size: 10 });
    return g;
  }

  /** 直流電源（電池）。垂直，+ 在上。 */
  function source(x, y, opt = {}) {
    const color = opt.color || C, w = opt.w || 2;
    let g = '';
    g += ln(x, y - 24, x, y - 10, { color, w });
    g += ln(x - 12, y - 10, x + 12, y - 10, { color, w: 2.8 }); // 長板 +
    g += ln(x - 6, y - 3, x + 6, y - 3, { color, w });          // 短板 -
    g += ln(x - 12, y + 4, x + 12, y + 4, { color, w: 2.8 });
    g += ln(x - 6, y + 11, x + 6, y + 11, { color, w });
    g += ln(x, y + 11, x, y + 24, { color, w });
    g += txt(x + 16, y - 9, '+', { anchor: 'start', size: 12 });
    if (opt.label) g += txt(x + 16, y + 6, opt.label, { anchor: 'start', size: 9, fill: '#64748b' });
    return g;
  }

  /** 接點（導線交會實心點）。 */
  function junction(x, y, opt = {}) { return dotJ(x, y, opt); }

  /** 電源軌標記（VCC/箭頭朝上）。 */
  function rail(x, y, label, opt = {}) {
    const color = opt.color || C, w = opt.w || 2;
    let g = ln(x, y, x, y + 12, { color, w });
    g += ln(x - 8, y, x + 8, y, { color, w });
    if (label) g += txt(x, y - 6, label, { size: 9, fill: '#64748b' });
    return g;
  }

  /**
   * NMOS（圖3 風格）：閘極板 + 通道 + 本體左向箭頭(N通道) + 體二極體 + S/D 軌。
   * 中心 (x,y)。終端：Gate=(x-30,y) 左、Source=(x+26,y-20) 右上、Drain=(x+26,y+20) 右下。
   */
  function nmos(x, y, opt = {}) {
    const color = opt.color || C, w = opt.w || 2;
    const showPins = opt.showPins !== false;
    let g = '';
    // 閘極
    g += ln(x - 30, y, x - 16, y, { color, w });
    g += ln(x - 16, y - 12, x - 16, y + 12, { color, w: 2.6 }); // 閘極板
    // 通道（與閘極間隙=絕緣）
    g += ln(x - 9, y - 13, x - 9, y + 13, { color, w: 2.6 });
    // 源極支路（上）
    g += ln(x - 9, y - 8, x + 4, y - 8, { color, w });
    g += ln(x + 4, y - 8, x + 4, y - 20, { color, w });
    g += ln(x + 4, y - 20, x + 26, y - 20, { color, w });
    // 汲極支路（下）
    g += ln(x - 9, y + 8, x + 4, y + 8, { color, w });
    g += ln(x + 4, y + 8, x + 4, y + 20, { color, w });
    g += ln(x + 4, y + 20, x + 26, y + 20, { color, w });
    // 本體連線 + 箭頭（N=左向朝通道；P=右向）
    g += ln(x - 9, y, x + 4, y, { color, w });
    if (opt.p) {
      g += tri(`${x - 2},${y - 4} ${x - 2},${y + 4} ${x + 4},${y}`, { color, fill: color });
    } else {
      g += tri(`${x - 3},${y - 4} ${x - 3},${y + 4} ${x - 9},${y}`, { color, fill: color });
    }
    // 本體接源極（flip=true 時汲源上下對調，源極在下）
    const flip = !!opt.flip;
    g += ln(x + 4, y, x + 4, flip ? y + 8 : y - 8, { color, w });
    // 體二極體（業界 FET 必有；預設畫，opt.bodyDiode===false 才省略）
    // 體二極體陰極=「汲極(NMOS)/源極(PMOS)」。預設源上汲下：NMOS 陰極在下、PMOS 陰極在上；flip 上下對調。
    if (opt.bodyDiode !== false) {
      const cathodeTop = (opt.p && !flip) || (!opt.p && flip);
      if (cathodeTop) {
        // 陰極(棒)在上、三角底在下、頂點朝上
        g += ln(x + 18, y + 20, x + 18, y + 6, { color, w });   // 下引線→三角底(陽極側)
        g += tri(`${x + 12},${y + 6} ${x + 24},${y + 6} ${x + 18},${y - 6}`, { color, fill: 'none', w });
        g += ln(x + 12, y - 6, x + 24, y - 6, { color, w });    // 陰極棒
        g += ln(x + 18, y - 6, x + 18, y - 20, { color, w });   // 陰極→上引線
      } else {
        // 陰極(棒)在下、三角底在上、頂點朝下
        g += ln(x + 18, y - 20, x + 18, y - 6, { color, w });   // 上引線→三角底(陽極側)
        g += tri(`${x + 12},${y - 6} ${x + 24},${y - 6} ${x + 18},${y + 6}`, { color, fill: 'none', w });
        g += ln(x + 12, y + 6, x + 24, y + 6, { color, w });    // 陰極棒
        g += ln(x + 18, y + 6, x + 18, y + 20, { color, w });   // 陰極→下引線
      }
    }
    if (showPins) {
      g += txt(x - 32, y + 3, opt.gate || 'G', { anchor: 'end', size: 10 });
      g += txt(x + 28, y - 18, opt.source || 'S', { anchor: 'start', size: 10 });
      g += txt(x + 28, y + 23, opt.drain || 'D', { anchor: 'start', size: 10 });
    }
    if (opt.label) g += txt(x, y + 36, opt.label, { size: 10, fill: '#64748b' });
    return g;
  }

  /**
   * 雙 NMOS（圖4 風格）：外框內兩顆 NMOS（上：S1/D1，下：D2/S2 鏡像），G1/G2 左出，ON/OFF 註記。
   * 中心 (x,y)，框 64x108。
   */
  function dualnmos(x, y, opt = {}) {
    const color = opt.color || C, w = opt.w || 2;
    let g = '';
    // 外框
    g += `<rect x="${x - 32}" y="${y - 54}" width="64" height="108" rx="3" fill="none" stroke="${color}" stroke-width="${w}"/>`;

    // 單顆精簡 MOSFET glyph：cx,cy 為其中心；flip=true 時上下鏡像（汲極在上）
    function fet(cx, cy, flip) {
      const s = flip ? -1 : 1; // s 控制源/汲方向
      let f = '';
      // 閘極（向左出框）
      f += ln(x - 32, cy, cx - 12, cy, { color, w });
      f += ln(cx - 12, cy - 10, cx - 12, cy + 10, { color, w: 2.4 });
      // 通道
      f += ln(cx - 6, cy - 11, cx - 6, cy + 11, { color, w: 2.4 });
      // 源極（s 方向）
      f += ln(cx - 6, cy - 6 * s, cx + 4, cy - 6 * s, { color, w });
      f += ln(cx + 4, cy - 6 * s, cx + 4, cy - 16 * s, { color, w });
      f += ln(cx + 4, cy - 16 * s, x + 32, cy - 16 * s, { color, w });
      // 汲極（反向）
      f += ln(cx - 6, cy + 6 * s, cx + 4, cy + 6 * s, { color, w });
      f += ln(cx + 4, cy + 6 * s, cx + 4, cy + 16 * s, { color, w });
      f += ln(cx + 4, cy + 16 * s, x + 32, cy + 16 * s, { color, w });
      // 本體箭頭（左向）
      f += ln(cx - 6, cy, cx + 4, cy, { color, w });
      f += tri(`${cx - 1},${cy - 3.5} ${cx - 1},${cy + 3.5} ${cx - 6},${cy}`, { color, fill: color });
      return f;
    }

    fet; // 上顆：源極在上（flip=false）
    g += fet(x - 2, y - 27, false);
    // 下顆：鏡像（汲極在上）
    g += fet(x - 2, y + 27, true);

    // 端點標籤
    g += txt(x - 34, y - 30, opt.g1 || 'G1', { anchor: 'end', size: 9 });
    g += txt(x - 34, y + 24, opt.g2 || 'G2', { anchor: 'end', size: 9 });
    g += txt(x + 34, y - 43, 'S1', { anchor: 'start', size: 9 });
    g += txt(x + 34, y - 11, 'D1', { anchor: 'start', size: 9 });
    g += txt(x + 34, y + 11, 'D2', { anchor: 'start', size: 9 });
    g += txt(x + 34, y + 43, 'S2', { anchor: 'start', size: 9 });
    if (opt.on) g += txt(x, y + 70, opt.on, { size: 9, fill: '#64748b' });
    if (opt.off) g += txt(x, y + 82, opt.off, { size: 9, fill: '#64748b' });
    return g;
  }

  /**
   * BJT（雙極性電晶體）。NPN 預設；opt.pnp=true 為 PNP。
   * 中心 (x,y)。終端：base=(x-26,y) 左、collector=(x+8,y-30) 上、emitter=(x+8,y+30) 下。
   * 射極箭頭：NPN 朝外（射極端）、PNP 朝內（基極端）。
   */
  function npn(x, y, opt = {}) {
    const color = opt.color || C, w = opt.w || 2;
    const showPins = opt.showPins !== false, pnp = !!opt.pnp;
    let g = '';
    // 基極
    g += ln(x - 26, y, x - 12, y, { color, w });
    g += ln(x - 12, y - 13, x - 12, y + 13, { color, w: 2.6 });
    // 集極（上）與射極（下）對角線 + 引線
    g += ln(x - 12, y - 5, x + 8, y - 18, { color, w });
    g += ln(x + 8, y - 18, x + 8, y - 30, { color, w });
    g += ln(x - 12, y + 5, x + 8, y + 18, { color, w });
    g += ln(x + 8, y + 18, x + 8, y + 30, { color, w });
    // 射極箭頭
    if (pnp) {
      // 朝基極（沿射極對角線往左上），箭頭靠基極端
      g += tri(`${x - 12},${y + 5} ${x - 5},${y + 5} ${x - 8},${y + 12}`, { color, fill: color });
    } else {
      // 朝射極端（往右下），箭頭靠射極端
      g += tri(`${x + 8},${y + 18} ${x},${y + 16} ${x + 4},${y + 10}`, { color, fill: color });
    }
    if (showPins) {
      g += txt(x - 28, y + 3, opt.base || 'B', { anchor: 'end', size: 9 });
      g += txt(x + 14, y - 28, opt.collector || 'C', { anchor: 'start', size: 9 });
      g += txt(x + 14, y + 32, opt.emitter || 'E', { anchor: 'start', size: 9 });
    }
    if (opt.label) g += txt(x, y + 46, opt.label, { size: 9, fill: '#64748b' });
    return g;
  }

  /**
   * 邏輯閘（IEEE 形狀）。中心 (x,y)。
   * type: and / or / nand / nor / xor / xnor / not / buffer
   * 終端：2 輸入閘 in=(x-28,y∓7)、out=(x+28,y)；單輸入閘 in=(x-28,y)、out=(x+28,y)。
   */
  function gate(x, y, opt = {}) {
    const color = opt.color || C, w = opt.w || 2;
    const type = opt.type || 'and';
    const bubble = ['nand', 'nor', 'xnor', 'not'].includes(type);
    const orFam = ['or', 'nor', 'xor', 'xnor'].includes(type);
    const oneIn = ['not', 'buffer'].includes(type);
    let g = '', outX;
    if (oneIn) {
      g += `<path d="M ${x - 14} ${y - 13} L ${x - 14} ${y + 13} L ${x + 16} ${y} Z" fill="#fff" stroke="${color}" stroke-width="${w}"/>`;
      outX = 16;
    } else if (orFam) {
      g += `<path d="M ${x - 16} ${y - 15} Q ${x + 2} ${y - 15} ${x + 18} ${y} Q ${x + 2} ${y + 15} ${x - 16} ${y + 15} Q ${x - 6} ${y} ${x - 16} ${y - 15} Z" fill="#fff" stroke="${color}" stroke-width="${w}"/>`;
      if (type === 'xor' || type === 'xnor') g += `<path d="M ${x - 22} ${y - 15} Q ${x - 12} ${y} ${x - 22} ${y + 15}" fill="none" stroke="${color}" stroke-width="${w}"/>`;
      outX = 18;
    } else { // and / nand
      g += `<path d="M ${x - 15} ${y - 15} L ${x + 5} ${y - 15} A 15 15 0 0 1 ${x + 5} ${y + 15} L ${x - 15} ${y + 15} Z" fill="#fff" stroke="${color}" stroke-width="${w}"/>`;
      outX = 20;
    }
    if (bubble) { g += circ(x + outX + 4, y, 4, { color, w, fill: '#fff' }); outX += 8; }
    if (oneIn) {
      g += ln(x - 28, y, x - 14, y, { color, w });
      g += ln(x + outX, y, x + 28, y, { color, w });
    } else {
      const bx = orFam ? -13 : -15;
      g += ln(x - 28, y - 7, x + bx, y - 7, { color, w });
      g += ln(x - 28, y + 7, x + bx, y + 7, { color, w });
      g += ln(x + outX, y, x + 28, y, { color, w });
    }
    return g;
  }

  // 腳位 Y（整數間距，置中），讓接線可精準對齊
  const PIN_PITCH = 18, PIN_LEAD = 14;
  function icPinY(cy, n, i, pitch) { return cy + (i - (n - 1) / 2) * (pitch || PIN_PITCH); }

  /** IC 方框（含腳位文字）。pinsLeft / pinsRight 為字串陣列。腳位等距整數座標。 */
  function ic(x, y, opt = {}) {
    const color = opt.color || C, w = opt.w || 2;
    const pinsL = opt.pinsLeft || [], pinsR = opt.pinsRight || [];
    const pitch = opt.pitch || PIN_PITCH;
    const ww = opt.width || 90;
    const maxN = Math.max(pinsL.length, pinsR.length, 1);
    const hh = Math.max(opt.height || 60, (maxN - 1) * pitch + 26);
    let g = `<rect x="${x - ww / 2}" y="${y - hh / 2}" width="${ww}" height="${hh}" rx="3" fill="#fff" stroke="${color}" stroke-width="${w}"/>`;
    pinsL.forEach((p, i) => {
      const py = icPinY(y, pinsL.length, i, pitch);
      g += ln(x - ww / 2 - PIN_LEAD, py, x - ww / 2, py, { color, w });
      g += txt(x - ww / 2 + 5, py + 3, p, { anchor: 'start', size: 8 });
    });
    pinsR.forEach((p, i) => {
      const py = icPinY(y, pinsR.length, i, pitch);
      g += ln(x + ww / 2, py, x + ww / 2 + PIN_LEAD, py, { color, w });
      g += txt(x + ww / 2 - 5, py + 3, p, { anchor: 'end', size: 8 });
    });
    if (opt.label) g += txt(x, y + hh / 2 + 14, opt.label, { size: 10, weight: 'bold' });
    return g;
  }

  /** 連接器（OUT/IN/GND 之類的接腳框）。 */
  function connector(x, y, pins, opt = {}) {
    const color = opt.color || C, w = opt.w || 2;
    const hh = (pins.length) * 18 + 8;
    let g = `<rect x="${x - 16}" y="${y - hh / 2}" width="32" height="${hh}" fill="#fff" stroke="${color}" stroke-width="${w}"/>`;
    pins.forEach((p, i) => {
      const py = y - hh / 2 + 14 + i * 18;
      g += txt(x, py, p, { size: 9 });
      g += ln(x - 16, py - 3, x - 24, py - 3, { color, w });
    });
    if (opt.label) g += txt(x, y - hh / 2 - 6, opt.label, { size: 9, fill: '#64748b' });
    return g;
  }

  // 精確接點座標（讓接線對齊，避免 magic number 斷線）
  const pins = {
    // NMOS/PMOS 端點：gate 左、source 右上、drain 右下
    nmos: (x, y) => ({ g: [x - 30, y], s: [x + 26, y - 20], d: [x + 26, y + 20] }),
    // BJT 端點：base 左、collector 上、emitter 下
    bjt: (x, y) => ({ b: [x - 26, y], c: [x + 8, y - 30], e: [x + 8, y + 30] }),
    icLeadL: (x, ww) => x - ww / 2 - PIN_LEAD,
    icLeadR: (x, ww) => x + ww / 2 + PIN_LEAD,
    icY: icPinY,
    // 邏輯閘端點：2 輸入 / 單輸入；輸出右
    gate: (x, y, oneIn) => oneIn ? ({ in: [x - 28, y], out: [x + 28, y] }) : ({ in1: [x - 28, y - 7], in2: [x - 28, y + 7], out: [x + 28, y] })
  };

  const Sym = {
    line: ln, poly, tri, circ, txt, junction,
    resistor, capacitor, ground, diode, inductor, source, rail,
    nmos, dualnmos, npn, gate, ic, connector,
    pins, icPinY,
    color: C
  };

  global.Sym = Sym;
  if (typeof module !== 'undefined' && module.exports) module.exports = Sym;
})(typeof window !== 'undefined' ? window : this);
