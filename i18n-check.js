/**
 * i18n-check.js — i18n key 完整性檢查（node）
 * 分兩級嚴重度：
 *   FAIL（擋 CI）：JS 用 pcbT('k') / I18N.t('k') 但 k 未定義 → 執行期回傳原始 key、
 *                  toast/UI 直接顯示 "k"（曾發生 pj_copied 等）。這是真 bug。
 *   WARN（不擋）：HTML data-i18n="k" 但 k 未定義 → 元素保留硬編文字（中文 fallback），
 *                  只是非中文語言未翻譯；不致顯示原始 key。
 *   WARN（不擋）：已定義 key 四語不齊。
 * 只驗字面字串；動態拼接（pcbT('pre_'+x)、三元）無法靜態驗，略過。
 */
'use strict';
const fs = require('fs');

// ---------- 1) 定義 key（i18n.js，每條目單行）----------
const lines = fs.readFileSync('./i18n.js', 'utf8').split('\n');
const defined = new Set();
const langMissing = [];
for (const line of lines) {
  const m = line.match(/^\s*([A-Za-z0-9_]+):\s*\{.*\bzh:/);
  if (!m) continue;
  const key = m[1];
  defined.add(key);
  ['en', 'ja', 'ko'].forEach(l => { if (!new RegExp('\\b' + l + ':').test(line)) langMissing.push(key + ' 缺 ' + l); });
}

// ---------- 1b) app.js 自有的字典（線路圖編輯器的 82 詞條，zh/en/ja/ko 各一份）----------
// index.html 的 data-i18n="select" 這類 key 是 app.applyI18n() 翻的，不在 i18n.js 裡，
// 不納進來就會有 80 幾筆假的「未定義」，把真正的漏翻蓋掉。
const appSrc = fs.readFileSync('./app.js', 'utf8');
const appStart = appSrc.indexOf('  i18n: {');
if (appStart >= 0) {
  const langs = {};
  for (const L of ['zh', 'en', 'ja', 'ko']) {
    const i = appSrc.indexOf('\n    ' + L + ': {', appStart);
    if (i < 0) continue;
    const seg = appSrc.slice(i, appSrc.indexOf('\n    }', i));
    langs[L] = new Set([...seg.matchAll(/^\s{6}([A-Za-z0-9_]+):/gm)].map(m => m[1]));
  }
  for (const k of langs.zh || []) {
    defined.add(k);
    ['en', 'ja', 'ko'].forEach(l => { if (!(langs[l] && langs[l].has(k))) langMissing.push('app.js ' + k + ' 缺 ' + l); });
  }
}

// ---------- 2) 用到的字面 key（分 JS / HTML）----------
const jsUsed = new Map(), htmlUsed = new Map();
const add = (map, k, w) => { if (!map.has(k)) map.set(k, w); };
const files = (ext) => fs.readdirSync('.').filter(f => f.endsWith(ext));

for (const f of files('.js')) {
  if (/i18n/.test(f)) continue;   // i18n 資料檔本身不掃
  const src = fs.readFileSync(f, 'utf8');
  // this.T('key') 是 knowledge.js 的薄包裝（I18N 沒載入時退回 key），一樣要納入檢查
  const re = /(?:pcbT|I18N\.t|this\.T)\(\s*['"]([A-Za-z0-9_.]+)['"]\s*[),]/g; let m;
  while ((m = re.exec(src))) add(jsUsed, m[1], f);
}
for (const f of files('.html')) {
  const src = fs.readFileSync(f, 'utf8');
  const re = /data-i18n(?:-placeholder|-title|-aria)?=["']([A-Za-z0-9_.]+)["']/g; let m;
  while ((m = re.exec(src))) add(htmlUsed, m[1], f);
}

// ---------- 3) 比對 ----------
const jsMissing = [...jsUsed].filter(([k]) => !defined.has(k));
const htmlMissing = [...htmlUsed].filter(([k]) => !defined.has(k));

console.log(`i18n-check: 定義 ${defined.size}｜JS 用 ${jsUsed.size}｜HTML 用 ${htmlUsed.size}`);
if (langMissing.length) console.log(`warn: ${langMissing.length} 個 key 四語不齊（非中文語言會退回中文/英文）`);
if (htmlMissing.length) {
  console.log(`warn: ${htmlMissing.length} 個 data-i18n key 未定義（保留硬編文字，僅未翻譯）：`);
  htmlMissing.slice(0, 12).forEach(([k, w]) => console.log(`  ~ ${k} ← ${w}`));
}
if (jsMissing.length) {
  console.log(`\nFAIL: ${jsMissing.length} 個 pcbT/I18N.t key 未定義（UI 會顯示原始 key）：`);
  jsMissing.forEach(([k, w]) => console.log(`  ✗ ${k} ← ${w}`));
  process.exit(1);
}
console.log('PASS：所有 pcbT/I18N.t 字面 key 都有定義');
process.exit(0);

