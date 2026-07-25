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

function parse(svg) {
  const texts = [], rects = [], lines = [];
  let m;
  const reT = /<text x="(-?[\d.]+)" y="(-?[\d.]+)" text-anchor="(\w+)" font-size="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g;
  while ((m = reT.exec(svg))) {
    const str = decode(m[5]).trim();
    if (str) texts.push(textBox(+m[1], +m[2], str, +m[4], m[3]));
  }
  const reR = /<rect x="(-?[\d.]+)" y="(-?[\d.]+)" width="([\d.]+)" height="([\d.]+)"/g;
  while ((m = reR.exec(svg))) rects.push({ x0: +m[1], y0: +m[2], x1: +m[1] + +m[3], y1: +m[2] + +m[4] });
  const reL = /<line x1="(-?[\d.]+)" y1="(-?[\d.]+)" x2="(-?[\d.]+)" y2="(-?[\d.]+)"[^>]*stroke-width="([\d.]+)"/g;
  while ((m = reL.exec(svg))) {
    if (+m[5] < 1.2) continue;                       // 裝飾細線不算
    lines.push([+m[1], +m[2], +m[3], +m[4]]);
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
    const cx = (t.x0 + t.x1) / 2, cy = (t.y0 + t.y1) / 2;
    // 方塊自己的標題：文字中心落在框內 → 合法，該文字整個跳過（含與該框的線）
    const ownBox = rects.find(r => cx > r.x0 && cx < r.x1 && cy > r.y0 && cy < r.y1);
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
