/**
 * dead-button-check.js — 找出「有 UI、按下去沒反應」的按鈕。
 *
 * 為什麼要這支：2026-08-26 發現 pcb.html 頂列的「新建 / 儲存 / 匯出」三顆
 * 從來沒接上任何處理器——id 在 109 支 js 與頁面內嵌 script 裡零引用，
 * 點下去 DOM 完全沒變化。這種缺陷靠看畫面看不出來（按鈕長得好好的），
 * 只有掃引用才抓得到。
 *
 * 判定：<button id="X"> 若 X 沒出現在任何 .js、也沒出現在該頁的內嵌 <script>，
 * 而且該 button 也沒有 inline onclick，就是死按鈕。
 *
 * 誠實界定：這是字串比對，不是資料流分析。
 *   - 動態組出來的 id（'btn' + n）抓不到，會漏報。
 *   - id 只出現在註解裡也算「有引用」，會誤判為活的。
 *   兩種都寧可漏報，不製造假警報——這支的價值在「完全沒被提到」這個強訊號。
 *
 * 用法：node dead-button-check.js   （有死按鈕回 exit 1）
 */
const fs = require('fs');
const path = require('path');

const dir = process.argv[2] || __dirname;
const htmls = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
const jsFiles = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
const jsBlob = jsFiles.map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');

// id 被「提到」的判定：加引號或 # 前綴，避免 'save' 之類短字串到處誤命中
const mentions = (hay, id) =>
  hay.includes("'" + id) || hay.includes('"' + id) || hay.includes('`' + id) || hay.includes('#' + id);

const dead = [];
let checked = 0;

for (const h of htmls) {
  const html = fs.readFileSync(path.join(dir, h), 'utf8');
  const inline = (html.match(/<script(?![^>]*src)[^>]*>[\s\S]*?<\/script>/g) || []).join('\n');
  for (const tag of html.match(/<button[^>]*>/g) || []) {
    const m = tag.match(/id="([^"]+)"/);
    if (!m || tag.includes('onclick=')) continue;
    checked++;
    const id = m[1];
    if (!mentions(jsBlob, id) && !mentions(inline, id)) dead.push(h + ' :: #' + id);
  }
}

if (dead.length) {
  console.error('dead-button-check: ' + dead.length + ' 顆按鈕沒有任何處理器');
  dead.forEach(d => console.error('  ' + d));
  console.error('接上處理器，或把按鈕拿掉——不要留著騙使用者按。');
  process.exit(1);
}
console.log('dead-button-check: ' + checked + ' 顆有 id 的按鈕全部接上處理器（掃 ' + htmls.length + ' 頁 / ' + jsFiles.length + ' 支 js）');
