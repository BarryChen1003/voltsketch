/**
 * add-pcb-entries.js — 把 interview-pcb.sql 的 6 題加進 interview-bank.js（q33–q38），每題前置電路圖。
 * 為什麼要加：前端回填是拿 DB 題幹去比對 bank.js，bank.js 沒有這 6 題就永遠補不到圖。
 * 題幹/答案一律從 SQL 原檔解析，不手抄。
 */
const fs = require('fs');
const WEB = require('path').join(__dirname, '../..');
const PATH = WEB + '/interview-bank.js';
const D = require('./batch6.js');
const IDS = ['q33', 'q34', 'q35', 'q36', 'q37', 'q38'];

/* --- 解析 SQL 的 values 區塊：每題六個單引號字串 --- */
const sql = fs.readFileSync(WEB + '/supabase/sql/interview-pcb.sql', 'utf8');
const body = sql.slice(sql.indexOf('from (values'), sql.indexOf(') as v('));
const strs = [];
for (let i = 0; i < body.length; i++) {
  if (body[i] !== "'") continue;
  let j = i + 1, buf = '';
  while (j < body.length) {
    if (body[j] === "'" && body[j + 1] === "'") { buf += "'"; j += 2; continue; }
    if (body[j] === "'") break;
    buf += body[j++];
  }
  strs.push(buf); i = j;
}
if (strs.length !== 36) throw new Error('expected 36 strings (6 rows x 6 cols), got ' + strs.length);
const rows = [];
for (let i = 0; i < 36; i += 6) {
  const [cat, catEn, q, a, qEn, aEn] = strs.slice(i, i + 6);
  rows.push({ cat, catEn, q, a, qEn, aEn });
}

/* --- 組成 bank 條目 --- */
const entries = rows.map((r, i) => {
  const box = '<div class="exam-diagram-box">' + D[IDS[i]] + '</div>';
  return {
    id: IDS[i], cat: 'pcb', catZh: r.cat, catEn: r.catEn, type: 'qa',
    zh: { text: r.q, answer: box + r.a },
    en: { text: r.qEn, answer: box + r.aEn },
  };
});

/* --- 寫回檔案（沿用 1 空格縮排的既有格式） --- */
let src = fs.readFileSync(PATH, 'utf8');
if (src.indexOf('"id": "q33"') >= 0) throw new Error('q33 already present - refusing to double-insert');
const tail = src.lastIndexOf('];');
const block = entries.map(e => JSON.stringify(e, null, 1).split('\n').map(l => ' ' + l).join('\n')).join(',\n');
src = src.slice(0, tail).replace(/\s*$/, '') + ',\n' + block + '\n' + src.slice(tail);
fs.writeFileSync(PATH, src);

/* --- 驗收 --- */
global.window = {};
require(PATH);
const bank = global.window.INTERVIEW_BANK;
let fail = 0;
const ok = (n, c, d) => { console.log((c ? 'PASS ' : 'FAIL ') + n + (d ? '  ' + d : '')); if (!c) fail++; };
ok('題數 32 -> 38', bank.length === 38, bank.length + ' 題');
rows.forEach((r, i) => {
  const e = bank.find(q => q.id === IDS[i]);
  ok(IDS[i] + ' 題幹與 SQL 一字不差', e && e.zh.text === r.q, e ? e.zh.text.slice(0, 18) : 'missing');
  ok(IDS[i] + ' 英文題幹一致', e.en.text === r.qEn);
  ok(IDS[i] + ' 答案 = 圖 + SQL 原文', e.zh.answer.endsWith(r.a) && e.en.answer.endsWith(r.aEn));
  ok(IDS[i] + ' 圖在最前面', e.zh.answer.startsWith('<div class="exam-diagram-box"><svg'));
});
ok('全部 38 題都有圖', bank.filter(q => /<svg/.test(q.zh.answer)).length === 38,
  bank.filter(q => /<svg/.test(q.zh.answer)).length + ' 題有圖');
console.log('\n' + (fail ? 'FAILED ' + fail : 'ALL PASS'));
process.exit(fail ? 1 : 0);
