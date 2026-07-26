/**
 * example-diagram.js — 「範例應用」訊號鏈自動方塊圖
 *
 * 為什麼：範例的 circuit 欄本來就是一條訊號鏈的文字（「橋式整流 + GaN QR Flyback + 光耦回授」），
 *         但純文字讀者得自己在腦中排出方塊順序。自動解析成方塊鏈 → 一次對全部卡生效，
 *         不必逐張手繪，也不會有人工畫錯。
 *
 * 鐵律遵守：圖與字絕不重疊。字都畫在各自方塊「內部」（方塊尺寸由字寬回推），
 *          箭頭只畫在方塊之間的間隙，畫布高度由排版結果反推 → 不可能溢出或互壓。
 *
 * 字寬係數（2026-07-22 於瀏覽器 getBBox 實測校準，system-ui/sans-serif）：
 *   CJK/全形 ≈ 1.025em、其他 ≈ 0.531em；ascent ≈ 1.0em、descent ≈ 0.25em。
 */
window.ExampleDiagram = (function () {
  'use strict';

  const FS = 13;            // 方塊文字（要大要清楚）
  const LH = 18;            // 行高
  const PADX = 14, PADY = 11;
  const MAXW = 700;         // 畫布可用寬（modal 內容區約 760）
  const MINBW = 92, MAXTW = 188;   // 方塊最小寬、內文最大寬
  const ARROW = 30;         // 方塊間箭頭區寬
  const ROWGAP = 20;

  const C_LINE = '#cbd5e1', C_FILL = '#f8fafc', C_TXT = '#0f172a', C_ARROW = '#0e9f6e';

  const isWide = ch => /[ᄀ-ᅟ⺀-䶿가-힣一-鿿豈-﫿︰-﹏＀-｠￠-￦]/.test(ch);
  const chW = (ch, size) => (isWide(ch) ? size * 1.025 : size * 0.531);
  const strW = (s, size) => [...s].reduce((a, c) => a + chW(c, size), 0);
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // 中文排版禁則：收尾標點不可置於行首；起始括號不可置於行尾
  const NO_LINE_START = '）〉》」』】〕｝、。，．；：？！·…ー～%）,.;:?!';
  const NO_LINE_END = '（〈《「『【〔｛(';

  // 依最大寬把字串折行（CJK 逐字、拉丁按空白斷詞），並套用禁則
  function wrap(text, maxw, size) {
    const tokens = [];
    let buf = '';
    for (const ch of text) {
      if (isWide(ch)) { if (buf) { tokens.push(buf); buf = ''; } tokens.push(ch); }
      else if (ch === ' ') { if (buf) { tokens.push(buf); buf = ''; } }
      else buf += ch;
    }
    if (buf) tokens.push(buf);

    const lines = [];
    let cur = '';
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      const cand = cur && !isWide(t[0]) && !isWide(cur[cur.length - 1]) ? cur + ' ' + t : cur + t;
      if (cur && strW(cand, size) > maxw) {
        // 禁則①：這個 token 是收尾標點 → 不換行，硬留在本行（方塊寬度會跟著長，不會壓到別的東西）
        if (NO_LINE_START.includes(t[0])) { cur = cand; continue; }
        // 禁則②：本行結尾是起始括號 → 把它一起帶到下一行
        let carry = '';
        if (NO_LINE_END.includes(cur[cur.length - 1])) { carry = cur[cur.length - 1]; cur = cur.slice(0, -1); }
        lines.push(cur);
        cur = carry + t;
      } else cur = cand;
    }
    if (cur) lines.push(cur);
    return lines.length ? lines : [text];
  }

  // 只切「鏈結」分隔符：+ ＋ →。斜線/逗號多半在詞內（5V/9V、90~264VAC，…），不切。
  function split(circuit) {
    return String(circuit || '')
      .split(/\s*(?:\+|＋|→|➜)\s*/)
      .map(s => s.trim())
      .filter(Boolean);
  }

  function build(circuit) {
    const parts = split(circuit);
    if (parts.length < 2) return null;          // 單段＝一句話，畫一個框沒有資訊量

    // 1) 每塊排版
    const blocks = parts.map(p => {
      const lines = wrap(p, MAXTW, FS);
      const tw = Math.max(...lines.map(l => strW(l, FS)));
      return { lines, w: Math.max(MINBW, Math.ceil(tw) + PADX * 2), h: lines.length * LH + PADY * 2 };
    });
    const rowH = Math.max(...blocks.map(b => b.h));

    // 2) 流式排列，超寬換行
    const rows = [];
    let row = [], rw = 0;
    blocks.forEach(b => {
      const need = (row.length ? ARROW : 0) + b.w;
      if (row.length && rw + need > MAXW) { rows.push({ items: row, w: rw }); row = []; rw = 0; }
      rw += (row.length ? ARROW : 0) + b.w;
      row.push(b);
    });
    if (row.length) rows.push({ items: row, w: rw });

    const W = Math.max(...rows.map(r => r.w));
    const H = rows.length * rowH + (rows.length - 1) * ROWGAP;

    // 3) 繪製
    let g = '';
    let y = 0;
    rows.forEach((r, ri) => {
      let x = 0;
      r.items.forEach((b, bi) => {
        if (bi) {   // 同列箭頭
          const ax = x, ay = y + rowH / 2;
          g += `<line x1="${ax + 5}" y1="${ay}" x2="${ax + ARROW - 9}" y2="${ay}" stroke="${C_ARROW}" stroke-width="2"/>`
            + `<polygon points="${ax + ARROW - 9},${ay - 4.5} ${ax + ARROW - 9},${ay + 4.5} ${ax + ARROW - 1},${ay}" fill="${C_ARROW}"/>`;
          x += ARROW;
        }
        const by = y + (rowH - b.h) / 2;
        g += `<rect x="${x}" y="${by}" width="${b.w}" height="${b.h}" rx="8" fill="${C_FILL}" stroke="${C_LINE}" stroke-width="1.5"/>`;
        // 文字置中在方塊內（垂直置中：首行基線 = 方塊中線 - (n-1)*LH/2 + FS*0.36）
        const cx = x + b.w / 2;
        const first = by + b.h / 2 - (b.lines.length - 1) * LH / 2 + FS * 0.36;
        b.lines.forEach((ln, li) => {
          g += `<text x="${cx}" y="${first + li * LH}" text-anchor="middle" font-size="${FS}" fill="${C_TXT}" font-family="system-ui,sans-serif">${esc(ln)}</text>`;
        });
        x += b.w;
      });
      // 換列指示：上一列末端往下、下一列開頭續接
      if (ri < rows.length - 1) {
        const ex = Math.min(r.w, W) - 8;
        g += `<path d="M ${ex} ${y + rowH} L ${ex} ${y + rowH + ROWGAP / 2} L 10 ${y + rowH + ROWGAP / 2} L 10 ${y + rowH + ROWGAP - 2}" `
          + `fill="none" stroke="${C_ARROW}" stroke-width="1.6" stroke-dasharray="4 3"/>`
          + `<polygon points="${10 - 4},${y + rowH + ROWGAP - 3} ${10 + 4},${y + rowH + ROWGAP - 3} 10,${y + rowH + ROWGAP + 3}" fill="${C_ARROW}"/>`;
      }
      y += rowH + ROWGAP;
    });

    return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:${W}px;display:block;margin:0 auto" role="img" aria-label="${esc(circuit)}">${g}</svg>`;
  }

  return { build, _split: split, _wrap: wrap, _strW: strW };
})();
