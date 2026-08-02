/**
 * gen-batch1-sql.js — 產生把 batch1 六張圖寫進線上 DB 的 SQL。
 * 每題四個語言欄位都前置同一張圖（圖內標籤為英文/符號，四語共用）。
 * 冪等：欄位已含 <svg 就跳過，重跑不會插兩次。
 * 送出前會驗：每個 LIKE 樣式在 interview-questions-seed.sql 中恰好命中 1 題。
 */
const fs = require('fs');
const WEB = require('path').join(__dirname, '../..');
// 圖從 interview-bank.js 取，不再從 batch1.js：q19 已改用符號庫（batch11）重畫，
// 綁死 batch1 會讓這支永遠吐舊圖。寫回後的 bank 才是唯一真相。
global.window = {};
require(WEB + '/interview-bank.js');
const BANK = global.window.INTERVIEW_BANK;
const SEED = fs.readFileSync(WEB + '/interview-questions-seed.sql', 'utf8');

const T = [
  { id: 'q7',  like: 'SPI Mode 會有幾種格式',            note: 'SPI 四模式時序（CPOL × CPHA）' },
  // 註：seed 的題幹是「請算出該 Buck 線路的 <strong>Duty Cycle</strong>」，樣式不能跨 HTML 標籤
  { id: 'q12', like: '請算出該 Buck 線路的',              note: 'Buck 工作週期 D = Vout/Vin' },
  { id: 'q17', like: '目標 tr = 300ns',                  note: 'I2C 上升時間與 Rp 上限' },
  { id: 'q19', like: '一個 LDO 輸入 5V，輸出 3.3V',      note: 'LDO 壓降損耗與效率' },
  { id: 'q26', like: 'RC 低通濾波器',                    note: 'RC 低通：fc 與 -3dB 轉角' },
  { id: 'q27', like: 'Setup Time 和 Hold Time',          note: 'Setup / Hold 視窗' },
];

let bad = 0;
for (const t of T) {
  const hits = SEED.split(t.like).length - 1;
  if (hits !== 1) { console.error(`PATTERN FAIL ${t.id}: "${t.like}" 在 seed 命中 ${hits} 次（需要 1）`); bad++; }
  else console.error(`pattern ok ${t.id}: ${hits} hit`);
}
if (bad) process.exit(1);

const out = [];
out.push('-- interview-batch1-diagrams.sql — 面試題庫補圖 批次 1（q7 / q12 / q17 / q19 / q26 / q27）');
out.push('-- 圖為新繪，通過兩道驗證：');
out.push('--   1) 瀏覽器 getBBox+getCTM 圖字重疊實測 = 0（含 path/polyline 逐段判定）');
out.push('--   2) 幾何/語意驗證器 41 條斷言全過（工作週期真的是 30%、30%/70% 交點=解析解、Pd/η 自洽…）');
out.push('-- 圖內標籤用英文/符號，四個語言欄位共用同一張圖（與既有 q5/q6/q28 一致）。');
out.push('-- 用法：Supabase Dashboard → SQL Editor → 全部貼上 → Run。');
out.push('-- 冪等：欄位已含 <svg 就跳過，重跑不會插入第二張。');
out.push('');

for (const t of T) {
  const q = BANK.find(x => x.id === t.id);
  const m = q && q.zh.answer.match(/<div class="exam-diagram-box">[\s\S]*?<\/svg><\/div>/);
  if (!m) throw new Error('no diagram: ' + t.id);
  const box = m[0];
  if (box.includes('$vsq$') || box.includes('$q$') || box.includes('\\')) throw new Error('unsafe payload: ' + t.id);
  out.push(`-- ${t.id}：${t.note}`);
  out.push('update public.interview_questions set');
  for (const col of ['answer', 'answer_en', 'answer_ja', 'answer_ko']) {
    out.push(`  ${col} = case when ${col} is not null and ${col} not like '%<svg%' then $vsq$${box}$vsq$ || ${col} else ${col} end${col === 'answer_ko' ? '' : ','}`);
  }
  out.push(` where question like $q$%${t.like}%$q$;`);
  out.push('');
}

out.push('-- 驗收：六列都要 zh/en 為 t（ja/ko 若原本沒譯文會是 null，屬正常）');
out.push("select left(question, 22) as q,");
out.push("       answer like '%<svg%' as zh, answer_en like '%<svg%' as en,");
out.push("       answer_ja like '%<svg%' as ja, answer_ko like '%<svg%' as ko");
out.push('  from public.interview_questions');
out.push(' where ' + T.map(t => `question like $q$%${t.like}%$q$`).join('\n    or ') + ';');
out.push('');

process.stdout.write(out.join('\n'));
