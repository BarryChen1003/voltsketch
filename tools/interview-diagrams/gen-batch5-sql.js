/**
 * gen-batch3-sql.js — batch3 七題的圖寫進線上 DB。
 * 圖只寫一次，四個語言欄位共用（圖內標籤是英文/符號）。
 * 冪等：欄位已含 <svg 就跳過。送出前驗每個 LIKE 樣式在 seed 中恰好命中 1 題。
 */
const fs = require('fs');
const WEB = require('path').join(__dirname, '../..');
global.window = {};
require(WEB + '/interview-bank.js');
const BANK = global.window.INTERVIEW_BANK;
const SEED = fs.readFileSync(WEB + '/interview-questions-seed.sql', 'utf8');

const T = [
  { id: 'q18', like: 'tr (上升時間) FAIL',            note: 'tr-Rp 關係：為什麼加大 Rp 是錯的' },
  { id: 'q20', like: '什麼是 ESD',                    note: 'HBM vs CDM 五項對照' },
  { id: 'q21', like: 'Bypass Capacitor（旁路電容）和', note: '去耦電容擺位與 via' },
  { id: 'q23', like: 'PCB 設計中，高速差分對走線',      note: '差分對走線 對 vs 錯' },
  { id: 'q24', like: 'MOSFET 選型時需要關注',          note: '六參數 + FOM 權衡曲線' },
  { id: 'q25', like: '什麼是 Latch-up',               note: '寄生 SCR 等效電路' },
];

let bad = 0;
for (const t of T) {
  const hits = SEED.split(t.like).length - 1;
  if (hits !== 1) { console.error(`PATTERN FAIL ${t.id}: "${t.like}" 命中 ${hits} 次（需要 1）`); bad++; }
  else console.error('pattern ok ' + t.id);
}
if (bad) process.exit(1);

const out = [];
out.push('-- interview-batch5-diagrams.sql — 面試題庫補圖 批次 5（bank 最後 6 題）');
out.push('-- q18  tr = 0.8473 x Rp x Cb 的直線圖：2.2k -> 186ns PASS、10k -> 847ns FAIL');
out.push('-- q20  ESD 模型 HBM vs CDM 五項對照（含 HBM 峰值 2kV/1.5k = 1.33A）');
out.push('-- q21  去耦電容擺位：rail -> 10uF -> 100nF -> pin，三個接地 via');
out.push('-- q23  差分對走線 對 vs 錯（正確側等長等距實測 skew = 0）');
out.push('-- q24  MOSFET 六參數 + 兩條等 FOM 曲線');
out.push('-- q25  Latch-up 寄生 PNPN 等效電路（含交叉耦合與紅色低阻抗路徑）');
out.push('--');
out.push('-- 驗證：瀏覽器重疊實測 = 0；語意/幾何斷言全過。');
out.push('-- 其中 q18 的斷言抓到真 bug：tr 公式單位少除 1000（kohm x pF 已經是 ns），');
out.push('--   修正前曲線與標點全部跑到畫布外，重疊檢查卻是乾淨的 — 只驗重疊不夠。');
out.push('-- 用法：Supabase Dashboard → SQL Editor → 全部貼上 → Run。冪等，可重跑。');
out.push('');

for (const t of T) {
  const q = BANK.find(x => x.id === t.id);
  const m = q.zh.answer.match(/<div class="exam-diagram-box">[\s\S]*?<\/svg><\/div>/);
  if (!m) throw new Error('no diagram: ' + t.id);
  const box = m[0];
  if (box.includes('$vsq$') || box.includes('$q$') || box.includes('\\')) throw new Error('unsafe payload: ' + t.id);
  out.push(`-- ${t.id}：${t.note}`);
  out.push('update public.interview_questions set');
  for (const col of ['answer', 'answer_en', 'answer_ja', 'answer_ko']) {
    out.push(`  ${col} = case when ${col} is not null and ${col} not like '%<svg%' then n.box || ${col} else ${col} end${col === 'answer_ko' ? '' : ','}`);
  }
  out.push(`  from (select $vsq$${box}$vsq$ as box) n`);
  out.push(` where question like $q$%${t.like}%$q$;`);
  out.push('');
}

out.push('-- 驗收：七列的 zh / en 都要 t');
out.push("select left(question, 22) as q,");
out.push("       answer like '%<svg%' as zh, answer_en like '%<svg%' as en,");
out.push("       answer_ja like '%<svg%' as ja, answer_ko like '%<svg%' as ko");
out.push('  from public.interview_questions');
out.push(' where ' + T.map(t => `question like $q$%${t.like}%$q$`).join('\n    or ') + ';');
out.push('');

process.stdout.write(out.join('\n'));
