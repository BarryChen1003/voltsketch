/**
 * interview-i18n-check.js — 面試題庫的四語覆蓋率
 *
 * 硬規矩 6：新增或修改的內容，四語都要同時完成。題庫分兩個檔：
 *   - interview-bank.js       zh + en（q.zh / q.en，各有 text/answer）
 *   - interview-bank-i18n.js  ja + ko（INTERVIEW_BANK_I18N[qid].ja / .ko，另有 catJa/catKo）
 * ja/ko 的 answer 用 {{SVG}} 沿用 zh 版的圖（interview.html 渲染時代入），所以圖不必重畫。
 *
 * 用法：node interview-i18n-check.js [--strict]
 */
'use strict';

global.window = {};
require('./interview-bank.js');
require('./interview-bank-i18n.js');
const B = global.window.INTERVIEW_BANK || [];
const I = global.window.INTERVIEW_BANK_I18N || {};

const miss = { en: [], ja: [], ko: [], cat: [] };
let svgReuse = 0, hasFig = 0;

for (const q of B) {
  if (!q.zh || !q.zh.text || !q.zh.answer) miss.en.push(q.id + '(zh 本身就缺)');
  if (!q.en || !q.en.text || !q.en.answer) miss.en.push(q.id);
  if (!q.catZh || !q.catEn) miss.cat.push(q.id + '(zh/en 類別)');
  const t = I[q.id] || {};
  for (const l of ['ja', 'ko']) {
    const e = t[l];
    if (!e || !e.text || !e.answer) { miss[l].push(q.id); continue; }
  }
  if (!t.catJa || !t.catKo) miss.cat.push(q.id + '(ja/ko 類別)');
  // 圖：zh 有圖時，ja/ko 應該用 {{SVG}} 沿用，不要各自貼一份
  const zhFig = /<div class="exam-diagram-box">[\s\S]*?<\/svg><\/div>/.test(q.zh.answer || '');
  if (zhFig) {
    hasFig++;
    for (const l of ['ja', 'ko']) {
      const e = t[l];
      if (e && e.answer && e.answer.indexOf('{{SVG}}') >= 0) svgReuse++;
    }
  }
}

console.log(`面試題 ${B.length} 題`);
for (const l of ['en', 'ja', 'ko']) {
  console.log(`  ${l}: ${B.length - miss[l].length}/${B.length}` + (miss[l].length ? `  缺 ${miss[l].join(',')}` : '  ✓'));
}
console.log(`  類別名稱四語：${miss.cat.length ? '缺 ' + miss.cat.join(',') : '✓'}`);
console.log(`  有圖的題 ${hasFig} 題，ja+ko 以 {{SVG}} 沿用中文圖 ${svgReuse}/${hasFig * 2} 處`);

const bad = miss.en.length || miss.ja.length || miss.ko.length || miss.cat.length;
if (process.argv.includes('--strict') && bad) {
  console.log('FAIL: 面試題庫沒有四語齊全');
  process.exit(1);
}
console.log(bad ? 'WARN' : 'OK');
