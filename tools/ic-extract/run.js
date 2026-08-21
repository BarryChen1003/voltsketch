/**
 * run.js — 建庫用的批次流程：PDF → 宣稱 → 驗證 → 人工覆核清單。
 *
 * 用法：
 *   node tools/ic-extract/run.js <file.pdf> [more.pdf ...]
 *       用現有規則產生宣稱，逐條驗證，輸出覆核清單
 *   node tools/ic-extract/run.js --claims claims.json <file.pdf>
 *       驗證別的引擎（模型或人工）產生的宣稱；claims.json 是 claim 陣列
 *
 * 輸出：tools/ic-extract/out/<檔名>.review.json
 *   pass  = 四道覆核都過，可以進資料庫（仍建議人看一眼）
 *   fail  = 不可信，一律當成未擷取；reason 說明是哪一道沒過
 *
 * 這支不會去改 ic-data.js。要不要收，是人的決定。
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { pdfPages } = require('./pdf-pages.js');
const { claimsFromRules } = require('./from-rules.js');
const { verifyAll } = require('./verify.js');

const OUT = path.join(__dirname, 'out');

function summarise(name, res, extra) {
  const pct = res.total ? Math.round((res.pass / res.total) * 100) : 0;
  const reasons = Object.entries(res.byReason).map(([k, v]) => k + '×' + v).join(' ');
  console.log(name.padEnd(28) + ' 宣稱 ' + String(res.total).padStart(2)
    + '｜通過 ' + String(res.pass).padStart(2) + ' (' + pct + '%)'
    + '｜沒過 ' + String(res.fail).padStart(2) + (reasons ? '（' + reasons + '）' : '')
    + (extra ? '｜' + extra : ''));
}

async function main() {
  const args = process.argv.slice(2);
  let claimsFile = null;
  const i = args.indexOf('--claims');
  if (i >= 0) { claimsFile = args[i + 1]; args.splice(i, 2); }
  if (!args.length) {
    console.log('用法: node tools/ic-extract/run.js <file.pdf> [...]  或  --claims <claims.json> <file.pdf>');
    process.exit(1);
  }
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

  let allTotal = 0, allPass = 0;
  for (const f of args) {
    const name = path.basename(f);
    let pages;
    try { pages = await pdfPages(f); } catch (e) { console.log(name.padEnd(28) + ' 讀不了: ' + e.message); continue; }

    let claims, meta = {};
    if (claimsFile) {
      claims = JSON.parse(fs.readFileSync(claimsFile, 'utf8'));
      if (!Array.isArray(claims)) claims = claims.claims || [];
    } else {
      const r = claimsFromRules(pages, name);
      claims = r.claims;
      meta = { part: r.part, mfr: r.mfr, noQuote: r.noQuote, warn: r.warn };
    }

    const res = verifyAll(claims, pages);
    allTotal += res.total; allPass += res.pass;
    const extra = meta.noQuote ? '無出處可驗 ' + meta.noQuote.length + ' 項' : '';
    summarise(name, res, extra);
    res.rows.filter(r => !r.ok).forEach(r => console.log('    ✗ ' + r.key + ' = ' + r.value + '  → ' + r.reason));

    const out = path.join(OUT, name.replace(/\.[^.]+$/, '') + '.review.json');
    fs.writeFileSync(out, JSON.stringify({ file: name, pages: pages.length, ...meta, result: res }, null, 1));
  }
  if (args.length > 1) console.log('—— 合計 ' + allPass + '/' + allTotal + ' 通過');
}

main().catch(e => { console.error(e); process.exit(1); });
