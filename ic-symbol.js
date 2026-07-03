/**
 * ic-symbol.js — IC 元件符號渲染引擎（資料驅動）
 * 仿 datasheet Pin Configuration 圖：四邊接腳、腳號在框內、腳名在框外、
 * 上/下腳名垂直、接腳線細（同連接線）、Thermal Pad/底部 GND 自動補一支腳拉出。
 * 名稱中以 {…} 包住的片段 → 上劃線（active-low，如 AIN6/GPIO2/{FAULT}）。
 *
 * 用法：ICSymbol.render(ic) → { svg, width, height }
 * ic.pins: [{ num, name, side:'L'|'R'|'T'|'B' }]（每邊依陣列順序排：L/R 上→下、T/B 左→右）
 * ic.thermalPad: { name:'GND' } | null
 */
window.ICSymbol = (function () {
  const C = '#1d2943';        // 框線
  const PINC = '#1f4fd1';     // 接腳線（細，同連接線）
  const TXT = '#0f172a';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); }

  // 名稱 → tspan（{…} 內上劃線）。可選 rotate 由外層 <text> 控制。
  function nameSpans(name) {
    const parts = String(name).split(/(\{[^}]*\})/).filter(s => s !== '');
    return parts.map(p => {
      const over = /^\{.*\}$/.test(p);
      const txt = esc(over ? p.slice(1, -1) : p);
      return over ? `<tspan text-decoration="overline">${txt}</tspan>` : `<tspan>${txt}</tspan>`;
    }).join('');
  }

  const epName = p => p && p.ep ? String(p.name) + ' (EP)' : (p ? p.name : '');

  function render(ic) {
    const pins = ic.pins || [];
    const bySide = { L: [], R: [], T: [], B: [] };
    pins.forEach(p => { (bySide[p.side] || bySide.L).push(p); });

    const PITCH = 32, LEAD = 26, NGAP = 12, GROW_W = 40, GROW_H = 40;
    const nL = bySide.L.length, nR = bySide.R.length, nT = bySide.T.length, nB = bySide.B.length;
    const bodyH = Math.max(nL, nR, 2) * PITCH + GROW_H;
    const bodyW = Math.max(nT, nB, 2) * PITCH + GROW_W;
    // 名稱留白：左右橫名較長，上下名垂直
    const MX = 132, MY = 120;
    const bx = MX, by = MY, bw = bodyW, bh = bodyH;
    const W = bw + 2 * MX, H = bh + 2 * MY;

    let g = '';
    // 框
    g += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="#fff" stroke="${C}" stroke-width="2.5"/>`;
    // pin1 記號（左上小圓）
    g += `<circle cx="${bx + 12}" cy="${by + 12}" r="3.5" fill="none" stroke="${C}" stroke-width="1.5"/>`;

    const lead = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${PINC}" stroke-width="1.2" stroke-linecap="round"/>`;
    const numTxt = (x, y, n, rot) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="11" fill="${TXT}" font-family="system-ui,sans-serif"${rot ? ` transform="rotate(${rot} ${x} ${y})"` : ''}>${esc(n)}</text>`;
    const nameTxt = (x, y, name, anchor, rot) => `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="12" fill="${TXT}" font-family="system-ui,sans-serif"${rot ? ` transform="rotate(${rot} ${x} ${y})"` : ''}>${nameSpans(name)}</text>`;

    // 左：上→下；腳號框內、腳名框外（橫）
    bySide.L.forEach((p, i) => {
      const y = by + bh * (i + 1) / (nL + 1);
      g += lead(bx, y, bx - LEAD, y);
      g += numTxt(bx + 13, y + 4, p.num);
      g += nameTxt(bx - LEAD - NGAP, y + 4, epName(p), 'end');
    });
    // 右：上→下
    bySide.R.forEach((p, i) => {
      const y = by + bh * (i + 1) / (nR + 1);
      g += lead(bx + bw, y, bx + bw + LEAD, y);
      g += numTxt(bx + bw - 13, y + 4, p.num);
      g += nameTxt(bx + bw + LEAD + NGAP, y + 4, epName(p), 'start');
    });
    // 上：左→右；腳號框內(垂直)、腳名框外(垂直，讀向下→上)
    bySide.T.forEach((p, i) => {
      const x = bx + bw * (i + 1) / (nT + 1);
      g += lead(x, by, x, by - LEAD);
      g += numTxt(x, by + 16, p.num, -90);
      g += nameTxt(x, by - LEAD - NGAP, epName(p), 'start', -90);
    });
    // 下：左→右
    bySide.B.forEach((p, i) => {
      const x = bx + bw * (i + 1) / (nB + 1);
      g += lead(x, by + bh, x, by + bh + LEAD);
      g += numTxt(x, by + bh - 10, p.num, -90);
      g += nameTxt(x, by + bh + LEAD + NGAP, epName(p), 'end', -90);
    });

    const svg = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${g}</svg>`;
    return { svg, width: W, height: H };
  }

  return { render };
})();
