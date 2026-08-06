/**
 * ui-i18n-check.js — 線路圖編輯器畫面文字的四語覆蓋率
 *
 * 硬規矩 6：畫面上的字一律四語。這支負責 app.js 那條路（uiT + ui-i18n.js）：
 *   1. 每個 uiT('…') 的字面都要在 ui-i18n.js 有 en/ja/ko（缺一個就紅）
 *   2. PARAM_SCHEMA 的標籤 l: 與選項 opt: 的中文也要在字典裡（它們是 render 時才翻的）
 *   3. 順便報「還沒接上的中文字面」——只報不擋，因為資料表裡的中文是合法的 key
 *
 * 用法：node ui-i18n-check.js [--strict] [--list]
 */
'use strict';

const fs = require('fs');
const LANGS = ['en', 'ja', 'ko'];

global.window = {};
require('./ui-i18n.js');
const D = global.window.UI_I18N || {};

const src = fs.readFileSync('./app.js', 'utf8');

// 1) uiT('…') 用到的 key
const used = new Set();
const reUse = /uiT\(\s*'((?:[^'\\]|\\.)*)'/g;
let m;
while ((m = reUse.exec(src))) used.add(m[1].replace(/\\'/g, "'"));

// 1b) 整個陣列丟給 uiT 的（BOM 表頭 `[...].map(uiT)` / `.map(h => uiT(h))`）
const reArr = /\[([^\]]*)\]\s*\.map\(\s*(?:uiT|\w+\s*=>\s*uiT\()/g;
while ((m = reArr.exec(src))) {
  for (const one of m[1].matchAll(/'((?:[^'\\]|\\.)*)'/g)) used.add(one[1]);
}

// 2) PARAM_SCHEMA 的 l: 與 opt:（render 時走 uiT，字典要有）
const schemaStart = src.indexOf('PARAM_SCHEMA: {');
const schemaEnd = src.indexOf('\n  },', schemaStart);
const schema = schemaStart >= 0 ? src.slice(schemaStart, schemaEnd) : '';
const hasCJK = s => /[㐀-鿿]/.test(s);
for (const mm of schema.matchAll(/l:\s*'([^']*)'/g)) if (hasCJK(mm[1])) used.add(mm[1]);
for (const mm of schema.matchAll(/opt:\s*\[([^\]]*)\]/g)) {
  for (const o of mm[1].matchAll(/'([^']*)'/g)) if (hasCJK(o[1])) used.add(o[1]);
}

const missing = [];
for (const k of used) {
  const e = D[k];
  if (!e) { missing.push([k, '整條沒有']); continue; }
  const lack = LANGS.filter(l => !e[l]);
  if (lack.length) missing.push([k, '缺 ' + lack.join('/')]);
}

// 3) 還沒接上的中文（只報不擋）：程式碼區的中文字面，扣掉 uiT 內、資料表、註解
const i18nEnd = src.indexOf('\n  },', src.indexOf('  i18n: {'));
const code = src.slice(i18nEnd).replace(/uiT\(\s*'(?:[^'\\]|\\.)*'/g, '').replace(/\/\/[^\n]*/g, '');
const loose = new Set();
for (const mm of code.matchAll(/'((?:[^'\\\n]|\\.)*)'/g)) if (hasCJK(mm[1]) && !used.has(mm[1])) loose.add(mm[1]);
for (const mm of code.matchAll(/`((?:[^`\\]|\\.)*)`/g)) if (hasCJK(mm[1])) loose.add(mm[1].slice(0, 60));

console.log(`ui-i18n-check: 字典 ${Object.keys(D).length} 條｜app.js 用到 ${used.size} 條`);
console.log(`四語不齊：${missing.length}`);
missing.slice(0, 30).forEach(([k, why]) => console.log(`  ✗ ${why}：${k}`));
if (loose.size) {
  console.log(`還沒接上 i18n 的中文字面：${loose.size}（資料表的中文是合法的 key，這裡只提醒）`);
  if (process.argv.includes('--list')) [...loose].slice(0, 40).forEach(s => console.log('  ~ ' + s));
}

const orphan = Object.keys(D).filter(k => !used.has(k));
if (orphan.length) {
  console.log(`字典有 ${orphan.length} 條沒被用到（可刪）`);
  orphan.slice(0, 10).forEach(k => console.log('  · ' + k));
}

if (process.argv.includes('--strict') && missing.length) {
  console.log('FAIL: 畫面文字沒有四語齊全');
  process.exit(1);
}
console.log('OK');
