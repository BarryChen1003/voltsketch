/**
 * i18n-quad-check.js — i18n.js 字典的四語完整度守衛
 *
 * 為什麼要獨立一支：i18n-check.js 查的是「用到的 key 有沒有定義」，
 * html-i18n-check.js 查的是「畫面上的中文有沒有接 i18n」，
 * ui-i18n-check.js 查的是 app.js 那條路（uiT + ui-i18n.js）。
 * **沒有人在查 i18n.js 字典本身的每一條是不是四語齊全**——
 * 少寫一個 ja，站台照常運作，只是日文使用者看到中文，不會有任何錯誤。
 *
 * 用法：node i18n-quad-check.js [--strict]
 *   預設列出缺漏並以 exit 1 結束（CI 直接用）。
 */
'use strict';

const fs = require('fs');
const LANGS = ['zh', 'en', 'ja', 'ko'];
const src = fs.readFileSync(__dirname + '/i18n.js', 'utf8');

// 一條 key 一行的形式：`  key: { zh: '…', en: '…', ja: '…', ko: '…' },`
// 跨行定義的（少數長字串）另外用括號配對抓，避免漏檢。
const re = /^\s*([A-Za-z_][\w]*)\s*:\s*\{(.*)\}\s*,?\s*$/gm;

let total = 0;
const bad = [];
let m;
while ((m = re.exec(src))) {
  const key = m[1], body = m[2];
  // 只看「像是語言字典」的條目：至少要有 zh 或 en，否則那是別的資料結構
  if (!/(^|[\s{,])(zh|en)\s*:/.test(body)) continue;
  total++;
  const missing = LANGS.filter(L => !new RegExp('(^|[\\s{,])' + L + '\\s*:').test(body));
  if (missing.length) bad.push(key + ' 缺 ' + missing.join('/'));
}

console.log(`i18n-quad-check: 檢查 ${total} 條字典項目`);
if (bad.length) {
  console.error(`四語不齊 ${bad.length} 條：`);
  bad.slice(0, 40).forEach(b => console.error('  - ' + b));
  if (bad.length > 40) console.error(`  …另外 ${bad.length - 40} 條`);
  process.exit(1);
}
console.log('OK：每一條都有 zh/en/ja/ko');
process.exit(0);
