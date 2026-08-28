/**
 * asset-leak-check.js — 部署資產的雙向守衛
 *
 * wrangler 會把整個目錄當靜態資產上傳，靠 .assetsignore 排除不該公開的東西。
 * 那份清單原本是**逐檔列**的，所以每新增一支檢查腳本就要記得回來加一行——
 * 漏了不會有任何徵兆，只是那支腳本從此掛在公開網域上。
 * 2026-08-27 就這樣漏了四支（csp-hash / vendor-check / gerber-readback / i18n-quad-check）。
 *
 * 改成 pattern 之後又有反方向的風險：pattern 太寬會把站台真正在用的檔擋掉。
 * schematic-check.js 就差點被 `*-check.js` 吃掉——擋掉的話線路圖檢查會靜靜
 * 退回舊的存在性規則，畫面上完全看不出來。
 *
 * 所以這支同時查兩個方向：
 *   1. 沒有任何 HTML 引用、也沒被 .assetsignore 擋 → 會被公開（洩漏）
 *   2. 有 HTML 引用、卻被 .assetsignore 擋 → 站台會少一支檔（功能靜靜消失）
 *
 * 用法：node asset-leak-check.js [--strict]
 */
'use strict';

const fs = require('fs');
const path = __dirname;

// 站台實際引用的檔（HTML 的 script/link src）
const used = new Set();
for (const f of fs.readdirSync(path).filter(x => x.endsWith('.html'))) {
  const s = fs.readFileSync(path + '/' + f, 'utf8');
  for (const m of s.matchAll(/(?:src|href)="\.\/([^"?]+)/g)) used.add(m[1]);
}

// .assetsignore 用 .gitignore 語法：後面的規則覆蓋前面，`!` 是否定
const rules = fs.readFileSync(path + '/.assetsignore', 'utf8')
  .split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));

function ignored(name) {
  let hit = false;
  for (const r of rules) {
    const neg = r.startsWith('!');
    const p = neg ? r.slice(1) : r;
    const match = (p === name) ||
      (p.startsWith('*') && name.endsWith(p.slice(1))) ||
      (p.endsWith('/') && name.startsWith(p));
    if (match) hit = !neg;
  }
  return hit;
}

// 只看根目錄的 .js / .mjs：子目錄（supabase/、tools/、vendor/）另有整目錄的規則
const files = fs.readdirSync(path).filter(x => /\.(js|mjs)$/.test(x));

const leaked = files.filter(n => !used.has(n) && !ignored(n));
const blocked = [...used].filter(u => /\.(js|mjs)$/.test(u) && ignored(u));

console.log(`asset-leak-check: 根目錄 ${files.length} 支腳本｜站台引用 ${[...used].filter(u => /\.(js|mjs)$/.test(u)).length} 支`);

let bad = 0;
if (leaked.length) {
  bad++;
  console.error(`\n會被公開但站台沒在用（${leaked.length} 支）——加進 .assetsignore：`);
  leaked.forEach(n => console.error('  - ' + n));
}
if (blocked.length) {
  bad++;
  console.error(`\n站台在用卻被 .assetsignore 擋掉（${blocked.length} 支）——加一條 !${blocked[0]} 之類的否定規則：`);
  blocked.forEach(n => console.error('  - ' + n));
}

if (!bad) {
  console.log('OK：沒有洩漏，也沒有誤擋');
  process.exit(0);
}
process.exit(1);
