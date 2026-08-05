/**
 * art-i18n-check.js — 知識卡「圖」的四語覆蓋率檢查
 *
 * 硬規矩 6：新功能一律四語，圖上的字也算。
 *
 * 做法：**照頁面真正的路徑**取圖——把 knowledge.js 的 applyCircuitArt /
 * normalizeSvgScale / getSampleKnowledge 三個方法切出來實跑一次，
 * 拿到的就是 152 張卡最後會顯示的 circuits[]。所以三種圖都涵蓋：
 *   1. CIRCUITS2 自動補圖（knowledge-circuits2.js，畫的時候就換語言）
 *   2. CircuitSVG 掛卡的圖（knowledge.js，同樣畫的時候換語言）
 *   3. 卡片自帶的內嵌 svg（靜態字串，render 時用 localizeSvgText 換字）
 * 外加每張圖上方的圖說（circuits[].description）。
 *
 * 從畫出來的 SVG 反推該翻的字，不是 grep 原始碼的字串常數，
 * 所以陣列、樣板字串、helper 傳進去的字都跑不掉。
 *
 * 用法：
 *   node art-i18n-check.js                       # 摘要
 *   node art-i18n-check.js --strict              # 有漏就 exit 1（CI 用）
 *   node art-i18n-check.js --list=en             # 列出該語言還沒翻的字（前 40 條）
 *   node art-i18n-check.js --dump=missing.json   # 未翻清單（依圖分組）寫成 JSON，給翻譯批次用
 *
 * 只認「含中日韓字元」的字串要翻：VOUT / 100µs / R1 / TPS65185 這種不用。
 */
'use strict';

const fs = require('fs');
const LANGS = ['en', 'ja', 'ko'];

global.window = {};
global.document = { addEventListener() { }, readyState: 'complete', querySelector: () => null, querySelectorAll: () => [] };
require('./schematic-symbols.js');
require('./knowledge-art-i18n.js');
require('./knowledge-circuits2.js');
for (const f of fs.readdirSync('.')) {
  if (/^knowledge-(extra|paid|video)/.test(f) && f.endsWith('.js')) {
    try { require('./' + f); } catch (e) { console.log('載入 ' + f + ' 失敗：' + e.message); }
  }
}

const kjs = fs.readFileSync('./knowledge.js', 'utf8');
const cs = kjs.indexOf('const CircuitSVG = {'), ce = kjs.indexOf('const knowledgeApp = {');
if (cs < 0 || ce < 0) { console.log('FAIL: 找不到 CircuitSVG'); process.exit(1); }
const CircuitSVG = new Function('window', kjs.slice(cs, ce) + '\nreturn CircuitSVG;')(global.window);

// knowledgeApp 的三個方法（applyCircuitArt … getSampleKnowledge）切出來當成獨立物件跑
const ms = kjs.indexOf('  circuitArtMap() {');
const me = kjs.indexOf('\n  },', kjs.indexOf('return __data;', ms)) + '\n  },'.length;
if (ms < 0 || me < ms) { console.log('FAIL: 找不到 circuitArtMap/getSampleKnowledge'); process.exit(1); }
const APP = new Function('window', 'CircuitSVG', 'return {' + kjs.slice(ms, me) + '};')(global.window, CircuitSVG);
const DICT = global.window.ART_I18N || {};

const hasCJK = s => /[㐀-鿿぀-ヿ가-힯]/.test(s);
const decode = s => s.replace(/<\/?tspan[^>]*>/g, '')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

global.window.ART_LANG = 'zh';
const data = APP.getSampleKnowledge();

const need = new Map();          // 中文原文 → 出現在哪些圖
const add = (s, where) => { if (!need.has(s)) need.set(s, new Set()); need.get(s).add(where); };

let cards = 0, figs = 0;
for (const item of data) {
  cards++;
  (item.circuits || []).forEach((c, i) => {
    if (!c) return;
    figs++;
    const where = item.id + '#' + i;
    if (c.description && hasCJK(c.description)) add(c.description, where + '(圖說)');
    if (!c.svg) return;
    let m; const re = /<text[^>]*>([\s\S]*?)<\/text>/g;
    while ((m = re.exec(c.svg))) { const t = decode(m[1]); if (hasCJK(t)) add(t, where); }
  });
}

const missing = {};
for (const l of LANGS) missing[l] = [];
for (const [s, ids] of need) {
  const e = DICT[s];
  for (const l of LANGS) if (!e || !e[l]) missing[l].push({ s, ids: [...ids] });
}
const orphan = Object.keys(DICT).filter(k => !need.has(k));

console.log(`知識卡 ${cards} 張，圖 ${figs} 張`);
console.log(`圖上該翻的中文字串 ${need.size} 條`);
for (const l of LANGS) {
  const done = need.size - missing[l].length;
  console.log(`  ${l}: ${done}/${need.size}` + (missing[l].length ? `  未翻 ${missing[l].length}` : '  ✓'));
}
if (orphan.length) console.log(`字典有 ${orphan.length} 條沒被任何圖用到（圖改過字就會這樣，可刪）`);

const listArg = process.argv.find(x => x.startsWith('--list='));
if (listArg) {
  const l = listArg.split('=')[1];
  (missing[l] || []).slice(0, 40).forEach(m => console.log(`  [${m.ids[0]}] ${m.s}`));
  if ((missing[l] || []).length > 40) console.log(`  …還有 ${missing[l].length - 40} 條`);
}

const dumpArg = process.argv.find(x => x.startsWith('--dump='));
if (dumpArg) {
  // 依圖分組：翻譯時同一張圖的字排在一起，才看得出上下文
  const byFig = {};
  for (const [s, ids] of need) {
    const e = DICT[s];
    if (LANGS.every(l => e && e[l])) continue;
    const fig = [...ids][0].replace(/\(圖說\)$/, '');
    (byFig[fig] = byFig[fig] || []).push(s);
  }
  fs.writeFileSync(dumpArg.split('=')[1], JSON.stringify(byFig, null, 2), 'utf8');
  console.log('未翻清單寫到 ' + dumpArg.split('=')[1] + `（${Object.keys(byFig).length} 張圖）`);
}

if (process.argv.includes('--strict') && LANGS.some(l => missing[l].length)) {
  console.log('FAIL: 圖上的字沒有四語齊全');
  process.exit(1);
}
console.log('OK');
