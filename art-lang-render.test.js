/**
 * art-lang-render.test.js — 圖的語言切換路徑測試
 *
 * 驗的是「換語言時，三種圖各自換得掉」以及「zh 完全沒被動到」：
 *   1. CIRCUITS2 自動補圖（畫的時候換）
 *   2. CircuitSVG 掛卡的圖（畫的時候換）
 *   3. 卡片自帶的內嵌 svg（render 時換字）
 *   4. 圖說（circuits[].description）
 * 用臨時字典測，不依賴 knowledge-art-i18n.js 翻到哪裡——覆蓋率是 art-i18n-check.js 的事。
 *
 * 執行：node art-lang-render.test.js
 */
'use strict';

const fs = require('fs');
const assert = require('assert');

global.window = {};
global.document = { addEventListener() { }, readyState: 'complete', querySelector: () => null, querySelectorAll: () => [] };
require('./schematic-symbols.js');
require('./knowledge-art-i18n.js');
require('./knowledge-circuits2.js');
for (const f of fs.readdirSync('.')) {
  if (/^knowledge-(extra|paid|video)/.test(f) && f.endsWith('.js')) { try { require('./' + f); } catch (e) { } }
}

const kjs = fs.readFileSync('./knowledge.js', 'utf8');
const cs = kjs.indexOf('const CircuitSVG = {'), ce = kjs.indexOf('const knowledgeApp = {');
const CircuitSVG = new Function('window', kjs.slice(cs, ce) + '\nreturn CircuitSVG;')(global.window);
const ms = kjs.indexOf('  circuitArtMap() {');
const me = kjs.indexOf('\n  },', kjs.indexOf('return __data;', ms)) + '\n  },'.length;
const APP = new Function('window', 'CircuitSVG', 'return {' + kjs.slice(ms, me) + '};')(global.window, CircuitSVG);

const text = svg => [...String(svg).matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g)].map(m => m[1]);
let pass = 0, fail = 0;
const t = (name, fn) => { try { fn(); pass++; } catch (e) { fail++; console.log('  ✗ ' + name + ': ' + e.message); } };

global.window.ART_LANG = 'zh';
const data = APP.getSampleKnowledge();

// 找三種樣本
const hasZhText = c => c && c.svg && text(c.svg).some(s => /[㐀-鿿]/.test(s) && !/[<>]/.test(s));
const autoCard = data.find(d => window.CIRCUITS2[d.id] && (d.circuits || []).length === 1
  && d.circuits[0].type === 'diagram' && hasZhText(d.circuits[0]));
// 掛 CircuitSVG 又圖上有中文的卡（switcher 那張全是英文訊號名，測不到換字）
const svgCard = data.find(d => APP.circuitArtMap()[d.id] && (d.circuits || []).some(hasZhText));
const inlineCard = data.find(d => (d.circuits || []).some(c =>
  c && c.svg && !window.CIRCUITS2[d.id] && !APP.circuitArtMap()[d.id] && /<text[^>]*>[^<]*[㐀-鿿]/.test(c.svg)));

assert(autoCard && svgCard && inlineCard, '三種樣本都要找得到');
console.log(`樣本：自動圖=${autoCard.id} CircuitSVG=${svgCard.id} 內嵌=${inlineCard.id}`);

// 臨時字典：取每種圖上的第一句中文
const pick = card => {
  const c = (card.circuits || []).find(hasZhText);
  assert(c, card.id + ' 上找不到中文字');
  return text(c.svg).find(s => /[㐀-鿿]/.test(s) && !/[<>]/.test(s));
};
const a1 = pick(autoCard), s1 = pick(svgCard), i1 = pick(inlineCard);
const cap = (autoCard.circuits[0].description || '');
window.ART_I18N = {
  [a1]: { en: 'AUTO-EN', ja: 'AUTO-JA', ko: 'AUTO-KO' },
  [s1]: { en: 'SVGF-EN', ja: 'SVGF-JA', ko: 'SVGF-KO' },
  [i1]: { en: 'INLINE-EN', ja: 'INLINE-JA', ko: 'INLINE-KO' },
  [cap]: { en: 'CAP-EN', ja: 'CAP-JA', ko: 'CAP-KO' }
};

t('1 自動圖 en 換字', () => {
  const out = APP.localizedCircuits(autoCard, 'en');
  assert(text(out[0].svg).includes('AUTO-EN'), '沒換到');
});
t('2 CircuitSVG 圖 en 換字', () => {
  const out = APP.localizedCircuits(svgCard, 'en');
  assert(out.some(c => text(c.svg).includes('SVGF-EN')), '沒換到');
});
t('3 內嵌 svg en 換字', () => {
  const out = APP.localizedCircuits(inlineCard, 'en');
  assert(out.some(c => c.svg && text(c.svg).includes('INLINE-EN')), '沒換到');
});
t('4 圖說 en 換字', () => {
  const out = APP.localizedCircuits(autoCard, 'en');
  assert(out[0].description === 'CAP-EN' || /CAP-EN/.test(out[0].description), '圖說是 ' + out[0].description);
});
t('5 zh 走原路（物件同一個，沒有重畫）', () => {
  assert.strictEqual(APP.localizedCircuits(autoCard, 'zh'), autoCard.circuits);
});
t('6 換語言不改動 this.items 的原始資料', () => {
  const before = autoCard.circuits[0].svg;
  APP.localizedCircuits(autoCard, 'ja');
  assert.strictEqual(autoCard.circuits[0].svg, before, '原始 svg 被改掉了');
});
t('7 字典查不到就留中文', () => {
  const out = APP.localizedCircuits(autoCard, 'ko');
  const zh = text(autoCard.circuits[0].svg).filter(s => /[㐀-鿿]/.test(s) && s !== a1);
  const now = text(out[0].svg);
  assert(zh.every(s => now.includes(s)), '沒翻的字不該消失');
});
t('8 三種語言各自拿到自己的譯文', () => {
  for (const [l, want] of [['en', 'AUTO-EN'], ['ja', 'AUTO-JA'], ['ko', 'AUTO-KO']]) {
    assert(text(APP.localizedCircuits(autoCard, l)[0].svg).includes(want), l + ' 錯');
  }
});
t('9 內嵌 svg 有 tspan 的整段不動（避免破壞排版）', () => {
  const svg = '<svg><text x="1" y="2">前<tspan>後</tspan></text></svg>';
  assert.strictEqual(APP.localizeSvgText(svg, 'en'), svg);
});
t('10 每張圖都能在四語下畫出來（不丟例外、不空）', () => {
  for (const l of ['zh', 'en', 'ja', 'ko']) {
    for (const item of data) {
      const out = APP.localizedCircuits(item, l);
      for (const c of out) if (c && c.svg) assert(/^<svg/.test(String(c.svg).trim()), item.id + ' ' + l + ' 圖壞了');
    }
  }
});

console.log(`\n${fail ? 'FAIL' : 'OK'}：${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
