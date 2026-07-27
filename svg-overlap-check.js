/**
 * svg-overlap-check.js — 圖表「文字不得與圖形/文字重疊」檢查（node）
 *
 * 鐵律：任何圖表的文字都不可以壓在圖形或別的文字上。疊在一起等於圖和字同時失效。
 * 目視會漏（尤其中文字寬、方塊往下擺、畫布沒同步加高），所以一律用程式驗。
 *
 * 做法：估每個 <text> 的 bbox，與所有 <rect>、<line>、其他 <text> 做碰撞測試。
 *   - 字寬：CJK/全形 ≈ size×1.0，其他 ≈ size×0.52（sans-serif 實測近似）
 *   - anchor=middle 置中、start 向右、end 向左；baseline 在 y → 上緣 y-size×0.82、下緣 y+size×0.26
 *   - 容差 PAD：小於 1px 的擦邊不算（描邊寬度造成的視覺誤差）
 *
 * 刻意排除的合法情形：
 *   - 方塊「自己的」標題/副標（文字本來就該在框內）→ 以「文字中心是否落在該 rect 內」判定為 label，跳過
 *   - 標示為裝飾的細線（stroke-width < 1.2，如鐵芯雙槓、虛線邊界）→ 不算圖形碰撞
 *
 * ⚠ 範圍與精度限制（誠實說明，別把它當唯一保證）：
 *   1. 只掃 window.CIRCUITS2 這 73 張程式生成圖；knowledge.js 內嵌與其他 knowledge-*.js
 *      的卡片圖不在其中。全站權威檢查要用瀏覽器 getBBox 實測（見本檔尾附的 snippet）。
 *   2. 字寬是估算值，與瀏覽器實際排版有出入：實測曾抓到本估算器漏掉的「bulk 貼著整流方塊」。
 *      → 估算器負責擋 CI 回歸；最終驗收仍以瀏覽器實測為準。
 *
 * 瀏覽器實測 snippet（貼進 knowledge.html 的 console）：
 *   把每張 circuits[0].svg 塞進離屏 div，對每個 <text>.getBBox() 與所有 <rect>.getBBox()
 *   做碰撞；文字中心落在某 rect 內視為該框標題、跳過。
 */
'use strict';

global.window = {};
require('./schematic-symbols.js');
require('./knowledge-circuits2.js');
const ART = global.window.CIRCUITS2 || {};

const PAD = 1.0;
const isWide = ch => /[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹯＀-｠￠-￦]/.test(ch);

function textBox(x, y, str, size, anchor) {
  let w = 0;
  for (const ch of str) w += isWide(ch) ? size * 1.0 : size * 0.52;
  const x0 = anchor === 'start' ? x : anchor === 'end' ? x - w : x - w / 2;
  return { x0, y0: y - size * 0.82, x1: x0 + w, y1: y + size * 0.26, str };
}

const decode = s => s.replace(/<\/?tspan[^>]*>/g, '')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

// ── transform 支援（2026-07-27 補）──
// 舊版是平面 regex，看不到 <g transform>：圖被 scale/translate 之後座標全錯，
// 會憑原始座標誤報「互壓」（gan-gate-drive 放大置中後就中了這個坑）。
const IDENT = [1, 0, 0, 1, 0, 0];
const mul = (m, n) => [
  m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1],
  m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3],
  m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]
];
const xy = (m, x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
const scaleOf = m => Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2])) || 1;
function tmat(str) {
  let m = IDENT, t;
  const re = /(translate|scale|rotate|matrix)\s*\(([^)]*)\)/g;
  while ((t = re.exec(str))) {
    const v = t[2].trim().split(/[\s,]+/).map(Number);
    if (t[1] === 'translate') m = mul(m, [1, 0, 0, 1, v[0] || 0, v.length > 1 ? v[1] : 0]);
    else if (t[1] === 'scale') m = mul(m, [v[0], 0, 0, v.length > 1 ? v[1] : v[0], 0, 0]);
    else if (t[1] === 'matrix') m = mul(m, v);
    else {
      const r = (v[0] || 0) * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
      const rot = [c, s, -s, c, 0, 0];
      m = v.length >= 3
        ? mul(mul(mul(m, [1, 0, 0, 1, v[1], v[2]]), rot), [1, 0, 0, 1, -v[1], -v[2]])
        : mul(m, rot);
    }
  }
  return m;
}

function parse(svg) {
  const texts = [], rects = [], lines = [];
  const stack = [IDENT];
  const re = /<(\/?)(g|svg|text|rect|line)\b([^>]*?)(\/?)>/g;
  let t;
  while ((t = re.exec(svg))) {
    const close = t[1] === '/', tag = t[2], body = t[3], self = t[4] === '/';
    const m = stack[stack.length - 1];
    if (tag === 'g' || tag === 'svg') {
      if (close) { if (stack.length > 1) stack.pop(); continue; }
      const tr = (body.match(/transform="([^"]*)"/) || [])[1];
      stack.push(tr ? mul(m, tmat(tr)) : m);
      if (self) stack.pop();
      continue;
    }
    if (close) continue;
    const A = n => { const v = (body.match(new RegExp(n + '="(-?[\\d.]+)"')) || [])[1]; return v === undefined ? null : +v; };
    if (tag === 'text') {
      const end = svg.indexOf('</text>', re.lastIndex);
      const str = decode(svg.slice(re.lastIndex, end < 0 ? re.lastIndex : end)).trim();
      if (!str) continue;
      const anchor = (body.match(/text-anchor="(\w+)"/) || [])[1] || 'start';
      const size = A('font-size') || 10;
      const [px, py] = xy(m, A('x') || 0, A('y') || 0);
      texts.push(textBox(px, py, str, size * scaleOf(m), anchor));
    } else if (tag === 'rect') {
      const x = A('x'), y = A('y'), w = A('width'), h = A('height');
      const p = [xy(m, x, y), xy(m, x + w, y), xy(m, x + w, y + h), xy(m, x, y + h)];
      rects.push({ x0: Math.min(...p.map(q => q[0])), y0: Math.min(...p.map(q => q[1])),
                   x1: Math.max(...p.map(q => q[0])), y1: Math.max(...p.map(q => q[1])) });
    } else if (tag === 'line') {
      const w = A('stroke-width');
      if (w !== null && w < 1.2) continue;                       // 裝飾細線不算
      const a = xy(m, A('x1'), A('y1')), b = xy(m, A('x2'), A('y2'));
      lines.push([a[0], a[1], b[0], b[1]]);
    }
  }
  return { texts, rects, lines };
}

const hit = (a, b) => a.x0 < b.x1 - PAD && a.x1 > b.x0 + PAD && a.y0 < b.y1 - PAD && a.y1 > b.y0 + PAD;
// 線段是否穿過 bbox（取樣＋端點；線都是直角/斜線，取樣足夠）
function lineHitsBox(s, b) {
  const [x1, y1, x2, y2] = s;
  const n = Math.max(2, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 2));
  for (let i = 0; i <= n; i++) {
    const t = i / n, px = x1 + (x2 - x1) * t, py = y1 + (y2 - y1) * t;
    if (px > b.x0 + PAD && px < b.x1 - PAD && py > b.y0 + PAD && py < b.y1 - PAD) return true;
  }
  return false;
}

function check(id, svg) {
  const { texts, rects, lines } = parse(svg);
  const out = [];
  texts.forEach((t, i) => {
    // 方塊自己的標題：文字必須**整個**在框內才算（原本只看中心點，導致
    // 「背靠背（雙向斷）」這種騎在框邊上的標籤被誤判為框標題而漏報）。
    const ownBox = rects.find(r => t.x0 >= r.x0 - 1 && t.x1 <= r.x1 + 1 && t.y0 >= r.y0 - 1 && t.y1 <= r.y1 + 1);
    if (ownBox) return;
    const at = `@(${Math.round((t.x0 + t.x1) / 2)},${Math.round(t.y1 - (t.y1 - t.y0) * 0.26)})`;
    rects.forEach(r => { if (hit(t, r)) out.push(`「${t.str}」${at} 壓到方塊`); });
    lines.forEach(s => { if (lineHitsBox(s, t)) out.push(`「${t.str}」${at} 被線穿過`); });
    texts.forEach((o, j) => { if (j > i && hit(t, o)) out.push(`「${t.str}」${at} 與「${o.str}」互壓`); });
  });
  return [...new Set(out)];
}

const strict = process.argv.includes('--strict');
const ids = Object.keys(ART);
let total = 0;
const bad = [];
for (const id of ids) {
  let svg;
  try { svg = ART[id]().svg; } catch (e) { bad.push({ id, list: ['產生失敗 ' + e.message] }); continue; }
  const list = check(id, svg);
  if (list.length) { total += list.length; bad.push({ id, list }); }
}

console.log(`svg-overlap-check: 掃 ${ids.length} 張圖，文字重疊 ${total} 處（${bad.length} 張圖）`);
if (bad.length) {
  console.log('');
  bad.sort((a, b) => b.list.length - a.list.length).forEach(r => {
    console.log(`  ~ ${r.id}（${r.list.length}）`);
    r.list.slice(0, 4).forEach(s => console.log(`      ${s}`));
  });
}
// --max N：棘輪上限。目標是 0；在還沒清完前先鎖住現況，確保只會變好不會變壞。
const maxArg = process.argv.find(a => a.startsWith('--max='));
const cap = maxArg ? +maxArg.split('=')[1] : null;
if (strict && total) { console.log('\nFAIL：文字與圖形重疊（鐵律：圖跟字不能疊）'); process.exit(1); }
if (cap !== null && total > cap) {
  console.log(`\nFAIL：重疊 ${total} 處 > 上限 ${cap}。新圖不得再壓字（鐵律）。`);
  process.exit(1);
}
if (cap !== null && total < cap) console.log(`\n（已優於上限 ${cap} → 請把 CI 的 --max 調降到 ${total}，把進度鎖住）`);
console.log(total ? '' : '\nOK：無文字重疊');
process.exit(0);
