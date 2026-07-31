/**
 * gen-flyback-sql.js — q28–q32：把 DB 裡的舊 flyback 圖換成修正版（字級 10、0 重疊）。
 * 這五筆 DB 已經有 <svg>，前端回填會跳過 → 只能靠 SQL 換掉。
 * 幾何完全沒動（已驗），只有字級與 6 個標籤位置變了。
 * 冪等：用 regexp_replace 換掉整個 exam-diagram-box，重跑結果相同。
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
out.push('-- interview-flyback-fix.sql — q28–q32 共用底圖：字級 7→10、6 個標籤挪離走線');
out.push('-- 為什麼要跑：這五筆 DB 已含舊圖，前端回填只補「沒有圖」的答案，不會覆蓋既有圖。');
out.push('-- 改了什麼：字級 +3（桌機有效字級 5.1px → 9.9px），Q1/Cps/Cout/400V/VDD/D3 六個標籤移開走線。');
out.push('--           元件座標與拓樸一字未動（line/rect/polygon/path 逐字比對相同）。');
out.push('-- 驗證：瀏覽器 getBBox+getCTM 實測，14 張圖 / 281 個文字 / 重疊 0。');
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
    out.push(`  ${col} = case when ${col} like '%<svg%'`);
    out.push(`    then regexp_replace(${col}, $re$<div class="exam-diagram-box">.*</svg></div>$re$, n.box)`);
    out.push(`    else ${col} end${col === 'answer_ko' ? '' : ','}`);
  }
  out.push(`  from (select $vsq$${box}$vsq$ as box) n`);
  out.push(` where question like $q$%${t.like}%$q$;`);
  out.push('');
}

out.push('-- 驗收：五列都要 zh_font10 = t（新圖字級 10，舊圖是 7）');
out.push("select left(question, 20) as q,");
out.push(`       answer like '%font-size="10"%' as zh_font10,`);
out.push(`       answer like '%y="166"%' as q1_label_moved,`);
out.push("       length(answer) as len");
out.push('  from public.interview_questions');
out.push(' where ' + T.map(t => `question like $q$%${t.like}%$q$`).join('\n    or ') + ';');
out.push('');

process.stdout.write(out.join('\n'));
