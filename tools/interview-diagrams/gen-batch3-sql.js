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
  { id: 'q1',  like: 'BJT (NPN) 的飽和',        note: 'BJT 四工作區象限圖（飽和/截止條件）' },
  { id: 'q2',  like: 'NMOSFET 的開啟',          note: 'NMOS 轉移特性與 VTH' },
  { id: 'q4',  like: 'BJT 的四種工作區域',      note: 'BJT 四工作區（與 q1 同圖）' },
  { id: 'q14', like: '請填寫以下邏輯閘的真值表', note: '邏輯閘真值表' },
  { id: 'q15', like: '上方接 10KΩ 上拉到 5V',   note: 'NMOS 反相器 + IN/OUT 波形' },
  { id: 'q16', like: 'I2C Fast Mode 規格中',    note: 'I2C Fast mode 關鍵時序' },
  { id: 'q22', like: '差分阻抗設計',            note: '差分對疊構剖面（按比例）' },
];

let bad = 0;
for (const t of T) {
  const hits = SEED.split(t.like).length - 1;
  if (hits !== 1) { console.error(`PATTERN FAIL ${t.id}: "${t.like}" 命中 ${hits} 次（需要 1）`); bad++; }
  else console.error('pattern ok ' + t.id);
}
if (bad) process.exit(1);

const out = [];
out.push('-- interview-batch3-diagrams.sql — 面試題庫補圖 批次 3');
out.push('-- q1 / q4  BJT 四工作區象限圖（同一張圖，兩題共用）');
out.push('-- q2       NMOS 轉移特性與 VTH');
out.push('-- q14      邏輯閘真值表');
out.push('-- q15      NMOS 反相器 + IN/OUT 波形（下降緣瞬時、上升緣帶 RC 斜率）');
out.push('-- q16      I2C Fast mode 關鍵時序');
out.push('-- q22      差分對疊構剖面（8px = 1mil，按比例）');
out.push('--');
out.push('-- 兩道驗證都過：瀏覽器 getBBox+getCTM 重疊 = 0；語意/幾何斷言全過');
out.push('--   （真值表 20 格逐格比對布林運算、平方律曲線逐點比對、OUT 波形逐段驗反相、');
out.push('--     疊構 W/S/H 比例、S/H=1.25 的耦合因子 0.855）');
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
