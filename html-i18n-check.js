/**
 * html-i18n-check.js — HTML 裡「會顯示、但沒接 i18n」的中文
 *
 * 硬規矩 6：畫面上的字一律四語。HTML 這條路是 data-i18n / data-i18n-title /
 * data-i18n-placeholder / data-i18n-aria，字典在 i18n.js。這支負責擋新的硬編中文。
 *
 * 已知合法、不算漏的：
 *   - `.nav-link`：i18n.js 的 apply() 依 href 用 NAV_MAP 翻
 *   - `.brand h1`：apply() 用 brand_title 翻
 *   - `#totalCount` 之類由 JS 寫入的節點（HTML 裡只是預設值）
 *   - pcb.html 的邀請碼說明：那段有行內連結，走頁內的 MSG 四語模板
 *
 * 用法：node html-i18n-check.js [--strict] [--list]
 */
'use strict';

const fs = require('fs');

const ALLOW_TEXT = [
  /^0 個主題$/,                      // knowledge.html #totalCount，JS 會覆寫
  /^目前以邀請碼開放/, /^聯絡資訊$/, /^；訂閱$/, /^12 個月方案$/, /^亦自動開通。$/  // pcb.html gate（頁內 MSG 模板）
];

const openTagBefore = (s, at) => {
  const lt = s.lastIndexOf('<', at);
  return lt < 0 ? '' : s.slice(lt, at + 1);
};

let total = 0;
const rows = [];
for (const f of fs.readdirSync('.').filter(n => n.endsWith('.html'))) {
  const src = fs.readFileSync(f, 'utf8');
  const body = src
    .replace(/<script[\s\S]*?<\/script>/g, m => ' '.repeat(m.length))
    .replace(/<style[\s\S]*?<\/style>/g, m => ' '.repeat(m.length))
    .replace(/<!--[\s\S]*?-->/g, m => ' '.repeat(m.length))
    .replace(/<head[\s\S]*?<\/head>/g, m => ' '.repeat(m.length));
  const hits = [];
  for (const m of body.matchAll(/>([^<>]*[㐀-鿿][^<>]*)</g)) {
    const txt = m[1].trim();
    if (!txt || ALLOW_TEXT.some(re => re.test(txt))) continue;
    const tag = openTagBefore(body, m.index);
    if (/data-i18n=/.test(tag)) continue;
    if (/class="[^"]*nav-link/.test(tag)) continue;
    if (/^<h1/.test(tag) && /class="brand"/.test(body.slice(Math.max(0, m.index - 300), m.index))) continue;
    hits.push(txt.slice(0, 50));
  }
  for (const m of body.matchAll(/<[a-z][a-z0-9]*(?:[^<>"']|"[^"]*"|'[^']*')*>/g)) {
    const tag = m[0];
    for (const [attr, dataAttr] of [['title', 'data-i18n-title'], ['placeholder', 'data-i18n-placeholder'], ['aria-label', 'data-i18n-aria']]) {
      const a = tag.match(new RegExp(attr + '="([^"]*)"'));
      if (!a || !/[㐀-鿿]/.test(a[1])) continue;
      if (tag.includes(dataAttr + '=')) continue;
      hits.push('[' + attr + '] ' + a[1].slice(0, 50));
    }
  }
  if (hits.length) { rows.push([f, hits]); total += hits.length; }
}

console.log(`html-i18n-check: 沒接 i18n 的中文 ${total} 處，${rows.length} 個檔`);
for (const [f, h] of rows) {
  console.log(`  ${f}（${h.length}）`);
  if (process.argv.includes('--list')) h.forEach(s => console.log('      ' + s));
}
if (process.argv.includes('--strict') && total) {
  console.log('FAIL: HTML 還有寫死的中文（加 data-i18n 並在 i18n.js 補四語）');
  process.exit(1);
}
console.log('OK');
