/**
 * batch8.js — 改用站上既有的符號庫 schematic-symbols.js 重畫
 *
 * 使用者指出：電阻不該畫成方框，要鋸齒；MOSFET 要有本體。
 * 這站本來就有 `Sym`（schematic-symbols.js），檔頭寫著「風格參考使用者提供圖片：
 * 電阻=鋸齒、NMOS=閘極板+通道+本體箭頭+體二極體」——正是使用者貼的那張參考圖。
 * 先前是我自己刻方框，沒用它。改回來，也順帶與知識庫 146 卡同一套視覺。
 *
 * 兩件配套：
 *   1) Sym 是淺色底藍線條 → 這批圖自己畫白底；.exam-diagram-box 已改成透明底
 *   2) Sym 內建標籤是 9-10px（低於本專案 >=11 規格）→ 一律 showPins:false，文字自己畫
 *
 * 版面預算（符號比方框佔空間，先切帶再放元件，避免又擠在一起）：
 *   標題 y 0-30 / 電路 y 40-250 / 說明 y 260+
 */
const Sym = require('../../schematic-symbols.js');

const INK = '#1d2943';      // 主要文字
const MUTED = '#64748b';    // 次要文字
const OK = '#15803d';       // 綠：導通/高電位
const BAD = '#b91c1c';      // 紅：截止/低電位
const D = {};

const BG = (w, h) => `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">`
  + `<rect width="${w}" height="${h}" fill="#ffffff"/>`;
// 自己寫 text：Sym.txt 會自動下標產生 tspan，CI 檢查器的字寬估算讀不到
const T = (x, y, s, o = {}) => `<text x="${x}" y="${y}" fill="${o.fill || INK}" font-size="${o.size || 11}"`
  + `${o.anchor ? ` text-anchor="${o.anchor}"` : ''}${o.weight ? ` font-weight="${o.weight}"` : ''}>${s}</text>`;
const wire = (x1, y1, x2, y2) => Sym.line(x1, y1, x2, y2, { w: 2 });

/* ---------- q3：BSS138 兩級 NMOS 反相器 ---------- */
{
  // Sym.nmos 端點：閘極 (cx-30,cy)、右上 (cx+26,cy-20)、右下 (cx+26,cy+20)
  // 汲極在上、源極在下 → flip:true（本體與體二極體跟著對調）
  const CY = 170;
  const stage = (cx, railX, railV, rlabel, fet, node, nodeVal, nodeColor) => {
    const p = Sym.pins.nmos(cx, CY);
    return Sym.rail(railX, 52)
      + T(railX + 14, 58, railV, { fill: BAD, weight: 'bold' })
      + Sym.resistor(railX, 100, { horizontal: false })
      + T(railX + 14, 96, rlabel)
      + T(railX + 14, 112, '10k', { fill: MUTED })
      + wire(railX, 64, railX, 76)
      + wire(railX, 124, railX, 150)
      + wire(p.s[0], p.s[1], railX, 150)                    // 汲極 → 節點
      + Sym.junction(railX, 150)
      + T(railX + 10, 140, `${node} = ${nodeVal}`, { fill: nodeColor, weight: 'bold' })
      + Sym.nmos(cx, CY, { flip: true, showPins: false })
      + T(cx - 30, 206, fet, { anchor: 'end', weight: 'bold' })
      + wire(p.d[0], p.d[1], p.d[0], 214)                   // 源極 → 地
      + Sym.ground(p.d[0], 228);
  };
  D.q3 = BG(520, 300)
    + T(260, 20, 'BSS138 two-stage inverter: A HIGH -> B LOW -> C HIGH',
        { size: 13, weight: 'bold', anchor: 'middle' })
    // 輸入 A 經 R1 進第一級閘極
    + T(14, 174, 'A = 5V', { fill: OK, weight: 'bold' })
    + wire(60, 170, 66, 170)
    + Sym.resistor(90, 170)
    + T(90, 150, 'R1', { anchor: 'middle' })
    + T(90, 196, '10k', { anchor: 'middle', fill: MUTED })
    + wire(114, 170, 120, 170)
    + stage(150, 230, '12V', 'R452', 'Q27', 'B', '0V', BAD)
    // B 點驅動第二級閘極
    + Sym.poly('230,150 300,150 300,170 340,170', { w: 2 })
    + stage(370, 450, '5V', 'R453', 'Q28', 'C', '5V', OK)
    + T(10, 272, 'Q27 on: B is pulled to GND. ID = 12V / 10k = 1.2mA', { fill: INK })
    + T(10, 292, 'Q28 off: no current in R453, so C sits at 5V. BSS138 VTH = 1.5V typ.', { fill: MUTED })
    + '</svg>';
}

/* ---------- q2：NMOS 本體 + 轉移特性 ---------- */
{
  const X0 = 270, XV = 340, XE = 480, Y0 = 200, YT = 70;
  const k = (Y0 - YT) / Math.pow(XE - XV, 2);
  const pts = [];
  for (let x = X0; x <= XV; x += 10) pts.push(x + ',' + Y0);
  for (let x = XV; x <= XE; x += 10) pts.push(x + ',' + (Y0 - k * Math.pow(x - XV, 2)).toFixed(1));
  const p = Sym.pins.nmos(120, 120);
  D.q2 = BG(520, 272)
    + T(260, 20, 'NMOS: insulated gate, VTH decides ON or OFF',
        { size: 13, weight: 'bold', anchor: 'middle' })
    + Sym.nmos(120, 120, { flip: true, showPins: false })
    + T(74, 110, 'G', { anchor: 'end', fill: MUTED })
    + T(194, 104, 'D', { fill: MUTED })
    + T(194, 148, 'S', { fill: MUTED })
    + wire(p.s[0], p.s[1], 190, 100)                     // 汲極往右
    + wire(p.d[0], p.d[1], 190, 140)                     // 源極往右
    + wire(190, 140, 190, 180)
    + Sym.ground(190, 194)
    + wire(p.g[0], p.g[1], 60, 120)                      // 閘極往左
    // VGS 量在閘極與源極之間
    + Sym.line(60, 120, 40, 120, { w: 1.2, color: '#94a3b8' })
    + Sym.line(40, 180, 190, 180, { w: 1.2, color: '#94a3b8' })
    + Sym.line(40, 120, 40, 180, { w: 1.6, color: '#b45309' })
    + Sym.tri('36,128 44,128 40,120', { color: '#b45309', fill: '#b45309' })
    + Sym.tri('36,172 44,172 40,180', { color: '#b45309', fill: '#b45309' })
    + T(48, 154, 'VGS', { fill: '#b45309', weight: 'bold' })
    // 轉移特性
    + Sym.line(X0, 60, X0, Y0, { w: 1.4, color: '#94a3b8' })
    + Sym.line(X0, Y0, 500, Y0, { w: 1.4, color: '#94a3b8' })
    + Sym.poly(pts.join(' '), { w: 2 })
    + Sym.line(XV, 80, XV, Y0, { w: 1.2, color: BAD })
    + T(X0 - 6, 56, 'ID', { fill: MUTED, anchor: 'end' })
    + T(500, 220, 'VGS', { fill: MUTED, anchor: 'end' })
    + T(XV + 4, 220, 'VTH', { fill: BAD })
    + T(276, 120, 'OFF: ID = 0', { fill: BAD })
    // 字框右緣必須停在曲線爬升到同一高度之前（x<463），否則會被曲線穿過
    + T(350, 96, 'ID = k (VGS-VTH)^2', { fill: OK })
    + T(10, 244, 'Gate plate and channel never touch - that gap is the oxide, so IG is ~pA.', { fill: INK })
    + T(10, 264, 'The body diode comes with the FET. VTH is no hard wall: below it the device still leaks.', { fill: MUTED })
    + '</svg>';
}

module.exports = D;
