#!/usr/bin/env node
/**
 * patch-bank.js — 把某個 batch 產生的圖寫回 interview-bank.js
 *
 *   node patch-bank.js batch11.js            # 寫回該 batch 的全部題目
 *   node patch-bank.js batch11.js q6 q8      # 只寫回指定題目
 *   node patch-bank.js batch11.js --dry      # 只報告不寫檔
 *
 * 做法是「在原始檔字串上做定點替換」，不是重新序列化整個 bank：
 * bank 檔混用 CRLF 與 LF（410/576），整檔 JSON.stringify 回寫會動到 244 個位元組的
 * 換行，diff 會蓋滿整個檔案、也看不出真正改了哪張圖。
 *
 * 保護措施：
 *   - 每個被替換的 answer 字串必須在原始檔中「剛好出現一次」，否則中止。
 *   - 寫完重新載入，逐題比對：沒指名的題目一個位元組都不准變。
 */
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const [batchFile, ...ids] = args.filter(a => !a.startsWith('--'));
if (!batchFile) { console.error('用法：node patch-bank.js <batchN.js> [q6 q8 ...] [--dry]'); process.exit(2); }

const D = require(path.resolve(__dirname, batchFile));
const targets = ids.length ? ids : Object.keys(D);
const bankPath = path.join(__dirname, '..', '..', 'interview-bank.js');

for (const id of targets) if (!D[id]) { console.error(`${batchFile} 沒有 ${id}`); process.exit(2); }

const load = () => { const g = {}; delete require.cache[require.resolve(bankPath)];
  global.window = g; require(bankPath); return g.INTERVIEW_BANK; };

const before = load();
const beforeById = Object.fromEntries(before.map(q => [q.id, JSON.stringify(q)]));
let src = fs.readFileSync(bankPath, 'utf8');
const BOX = /<div class="exam-diagram-box">[\s\S]*?<\/div>/;

const report = [];
for (const id of targets) {
  const q = before.find(x => x.id === id);
  if (!q) { console.error(`interview-bank.js 沒有 ${id}`); process.exit(2); }
  const box = `<div class="exam-diagram-box">${D[id]}</div>`;
  for (const lang of ['zh', 'en']) {
    const oldAnswer = q[lang].answer;
    const newAnswer = BOX.test(oldAnswer) ? oldAnswer.replace(BOX, box) : box + oldAnswer;
    if (newAnswer === oldAnswer) { report.push(`${id}.${lang} 無變更`); continue; }
    const oldLit = JSON.stringify(oldAnswer), newLit = JSON.stringify(newAnswer);
    const hits = src.split(oldLit).length - 1;
    if (hits !== 1) { console.error(`中止：${id}.${lang} 的 answer 在檔中出現 ${hits} 次（預期 1）`); process.exit(1); }
    src = src.replace(oldLit, () => newLit);
    report.push(`${id}.${lang} ${oldAnswer.length} -> ${newAnswer.length} bytes`);
  }
}

if (dry) { console.log(report.join('\n')); console.log('\n--dry：沒有寫檔'); process.exit(0); }

fs.writeFileSync(bankPath, src);
const after = load();
if (after.length !== before.length) { console.error('中止：題數變了'); process.exit(1); }
const strayed = after.filter(q => !targets.includes(q.id) && beforeById[q.id] !== JSON.stringify(q)).map(q => q.id);
if (strayed.length) { console.error('中止：沒指名的題目被動到 -> ' + strayed.join(', ')); process.exit(1); }
const wrong = targets.filter(id => {
  const q = after.find(x => x.id === id);
  return !q.zh.answer.includes(D[id]) || !q.en.answer.includes(D[id]);
});
if (wrong.length) { console.error('中止：寫回後對不上 -> ' + wrong.join(', ')); process.exit(1); }

console.log(report.join('\n'));
console.log(`\n寫回 ${targets.length} 題（${targets.join(' ')}），其餘 ${after.length - targets.length} 題逐位元組不變。`);
