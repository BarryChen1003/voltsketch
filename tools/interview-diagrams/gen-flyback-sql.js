/**
 * gen-flyback-sql.js — q28–q32：把 DB 裡的舊 flyback 圖換成 bank 裡的現行版。
 * 這五筆 DB 已經有 <svg>，前端回填只補「沒有圖」的答案 → 只能靠 SQL 換掉。
 * 圖一律取自 interview-bank.js（唯一真相），所以重畫過就重跑這支。
 * 冪等：三種狀態都收斂到同一個 box —— 有舊圖用 regexp_replace 換掉、
 * 只有空的 exam-diagram-box 就填進去、兩者都沒有就前置。
 */
const fs = require('fs');
const WEB = require('path').join(__dirname, '../..');
global.window = {};
require(WEB + '/interview-bank.js');
const BANK = global.window.INTERVIEW_BANK;
const BATCH2 = fs.readFileSync(WEB + '/supabase/sql/interview-batch2.sql', 'utf8');

const T = [
  { id: 'q28', like: '開關切換的大電流路徑', note: '一次側主迴路 + 高壓線段' },
  { id: 'q29', like: '輸出整流大電流路徑',   note: '二次側主迴路' },
  { id: 'q30', like: '寄生電容跑到二次側',   note: '共模雜訊路徑 + CY' },
  { id: 'q31', like: 'TL431 與光耦',         note: '回授訊號路徑' },
  { id: 'q32', like: '輔助繞組還沒有電',     note: '啟動供電 / 輔助供電' },
];

let bad = 0;
for (const t of T) {
  const hits = BATCH2.split(t.like).length - 1;
  if (hits !== 1) { console.error(`PATTERN FAIL ${t.id}: "${t.like}" 在 batch2.sql 命中 ${hits} 次（需要 1）`); bad++; }
  else console.error(`pattern ok ${t.id}`);
}
if (bad) process.exit(1);

const out = [];
out.push('-- interview-flyback-fix.sql — q28–q32 共用底圖：改用站上的符號庫重畫');
out.push('-- 為什麼要跑：這五筆 DB 已含舊圖，前端回填只補「沒有圖」的答案，不會覆蓋既有圖。');
out.push('-- 改了什麼：整張重畫。元件改用 schematic-symbols.js（電阻鋸齒、MOSFET 有體二極體、');
out.push('--           繞組是線圈不是方框），白底藍線條，字級 11，四語共用同一張。');
out.push('-- 驗證：interview-diagram-check 0 發現；verify-batch12.js 66 條拓樸/極性斷言全過；');
out.push('--       瀏覽器 getBBox+getCTM 實測重疊 0。');
out.push('-- 用法：Supabase Dashboard → SQL Editor → 全部貼上 → Run。冪等，可重跑。');
out.push('');

for (const t of T) {
  const q = BANK.find(x => x.id === t.id);
  const m = q.zh.answer.match(/<div class="exam-diagram-box">[\s\S]*?<\/svg><\/div>/);
  if (!m) throw new Error('no diagram: ' + t.id);
  const box = m[0];
  if ((q.zh.answer.match(/<svg/g) || []).length !== 1) throw new Error(t.id + ': expected exactly 1 svg');
  if (box.includes('$vsq$') || box.includes('$q$') || box.includes('\\')) throw new Error('unsafe payload: ' + t.id);
  // 圖只寫一次，四個語言欄位共用（不然同一張 11.8KB 的 SVG 要貼四遍）
  out.push(`-- ${t.id}：${t.note}`);
  out.push('update public.interview_questions set');
  for (const col of ['answer', 'answer_en', 'answer_ja', 'answer_ko']) {
    // 三種既有狀態都要收斂：有舊圖 / 只有空的 box（seed 抽題時把 svg 剝掉了）/ 完全沒有
    out.push(`  ${col} = case when ${col} like '%<svg%'`);
    out.push(`    then regexp_replace(${col}, $re$<div class="exam-diagram-box">.*</svg></div>$re$, n.box)`);
    out.push(`    when ${col} like '%<div class="exam-diagram-box"></div>%'`);
    out.push(`    then replace(${col}, $re$<div class="exam-diagram-box"></div>$re$, n.box)`);
    out.push(`    when ${col} is not null then n.box || ${col}`);
    out.push(`    else ${col} end${col === 'answer_ko' ? '' : ','}`);
  }
  out.push(`  from (select $vsq$${box}$vsq$ as box) n`);
  out.push(` where question like $q$%${t.like}%$q$;`);
  out.push('');
}

out.push('-- 驗收：五列的四個語言欄位都要 sym = t（新圖有 data-sym，舊圖沒有）');
out.push("select left(question, 20) as q,");
out.push(`       answer like '%data-sym%' as zh_sym, answer_en like '%data-sym%' as en_sym,`);
out.push(`       answer_ja like '%data-sym%' as ja_sym, answer_ko like '%data-sym%' as ko_sym,`);
out.push("       length(answer) as len");
out.push('  from public.interview_questions');
out.push(' where ' + T.map(t => `question like $q$%${t.like}%$q$`).join('\n    or ') + ';');
out.push('');

process.stdout.write(out.join('\n'));
