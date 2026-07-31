/**
 * light.js — 面試題圖的共用底層（淺底藍線條，與 schematic-symbols.js 同一套視覺）
 * 所有新圖都從這裡取 BG / T / wire / 顏色，避免每個 batch 各自定義又走鐘。
 */
const Sym = require('../../schematic-symbols.js');

const INK = '#1d2943';      // 主要文字
const MUTED = '#64748b';    // 次要文字
const OK = '#15803d';       // 綠：導通 / 正確 / 高電位
const BAD = '#b91c1c';      // 紅：截止 / 錯誤 / 低電位
const WARN = '#b45309';     // 橘：量測、注意
const FAINT = '#94a3b8';    // 灰：座標軸、輔助線

const BG = (w, h) => `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">`
  + `<rect width="${w}" height="${h}" fill="#ffffff"/>`;

// 自己寫 text：Sym.txt 會自動下標產生 tspan，CI 檢查器的字寬估算讀不到
const T = (x, y, s, o = {}) => `<text x="${x}" y="${y}" fill="${o.fill || INK}" font-size="${o.size || 11}"`
  + `${o.anchor ? ` text-anchor="${o.anchor}"` : ''}${o.weight ? ` font-weight="${o.weight}"` : ''}>${s}</text>`;

const title = (w, s) => T(w / 2, 20, s, { size: 13, weight: 'bold', anchor: 'middle' });
const wire = (x1, y1, x2, y2) => Sym.line(x1, y1, x2, y2, { w: 2 });

/** 垂直二極體：Sym.diode 只有水平版，這裡用同樣的筆觸自己組一顆。 */
const diodeV = (x, y, o = {}) => {
  const color = o.color || Sym.color, w = 2;
  const up = o.cathodeUp !== false;      // 預設陰極朝上（續流二極體常見方向）
  let g = Sym.line(x, y - 22, x, y - 8, { color, w }) + Sym.line(x, y + 8, x, y + 22, { color, w });
  if (up) {
    g += Sym.tri(`${x - 8},${y + 8} ${x + 8},${y + 8} ${x},${y - 8}`, { color, fill: 'none', w });
    g += Sym.line(x - 8, y - 8, x + 8, y - 8, { color, w });
  } else {
    g += Sym.tri(`${x - 8},${y - 8} ${x + 8},${y - 8} ${x},${y + 8}`, { color, fill: 'none', w });
    g += Sym.line(x - 8, y + 8, x + 8, y + 8, { color, w });
  }
  return `<g data-sym="diode">${g}</g>`;
};

/** 電流路徑高亮：半透明粗線畫在元件底下（stroke-opacity < 0.5，重疊檢查會自動略過）。 */
const hl = (d, color) => `<path d="${d}" fill="none" stroke="${color || '#f59e0b'}" stroke-width="9"`
  + ` stroke-opacity="0.30" stroke-linecap="round" stroke-linejoin="round"/>`;

module.exports = { Sym, BG, T, title, wire, diodeV, hl, INK, MUTED, OK, BAD, WARN, FAINT };
