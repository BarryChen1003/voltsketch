/**
 * pdf-pages.js — 把 PDF 轉成「每頁一段文字」。
 *
 * 刻意用網站自己那份 pdf.js（vendor/）與同一支 linesFromItems：
 * 驗證器看到的文字，必須跟訪客瀏覽器裡看到的一模一樣，
 * 否則「本機驗過」不代表「線上也對」。
 *
 * 只在 Node 跑（建庫用），不進前端。
 */
'use strict';
const fs = require('fs');
const path = require('path');
const DS = require('../../ds-compare.js');

const VENDOR = path.join(__dirname, '..', '..', 'vendor');
const pdfjs = require(path.join(VENDOR, 'pdf-3.11.174.min.js'));
pdfjs.GlobalWorkerOptions.workerSrc = path.join(VENDOR, 'pdf-3.11.174.worker.min.js');

/** @returns {Promise<string[]>} 每頁一段文字，index 0 = 第 1 頁 */
async function pdfPages(file) {
  const data = new Uint8Array(fs.readFileSync(file));
  const pdf = await pdfjs.getDocument({ data, useSystemFonts: false }).promise;
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const tc = await page.getTextContent();
    pages.push(DS.linesFromItems(tc.items).join('\n'));
  }
  return pages;
}

module.exports = { pdfPages };

if (require.main === module) {
  const f = process.argv[2];
  if (!f) { console.log('用法: node tools/ic-extract/pdf-pages.js <file.pdf> [頁碼]'); process.exit(1); }
  pdfPages(f).then(pages => {
    const n = process.argv[3] ? Number(process.argv[3]) : null;
    if (n) { console.log(pages[n - 1] || '(沒有這一頁)'); return; }
    console.log(f + '：' + pages.length + ' 頁，' + pages.join('\n').length + ' 字');
  }).catch(e => { console.error('讀不了:', e.message); process.exit(1); });
}
