/**
 * gen-fix-diagrams.js — 由 interview-bank.js 抽出 q5/q6/q13 的 SVG，
 * 產生把圖補回 DB（zh/en answer）的 SQL。純產生器，不動 repo 資料。
 * 用法：node gen-fix-diagrams.js > ../../supabase/sql/interview-fix-diagrams.sql
 */
const path = require('path');
const WEB = require('path').join(__dirname, '../..');
global.window = {};
require(path.join(WEB, 'interview-bank.js'));

const TARGETS = [
  { id: 'q5',  like: '%Open-Drain 與 Push-Pull%',     note: 'IO 輸出架構：Push-Pull vs Open-Drain' },
  { id: 'q6',  like: '%I2C Bus 介面配線圖%',           note: 'I2C 匯流排接線' },
  { id: 'q13', like: '%Buck 轉換器的電流路徑圖%',      note: 'Buck 上管 ON / OFF 電流路徑' },
];

const EMPTY_BOX = '<div class="exam-diagram-box"></div>';
const out = [];

out.push('-- interview-fix-diagrams.sql — 補回 q5/q6/q13 被剝掉的電路圖（zh + en）');
out.push('-- 背景：interview-questions-seed.sql 抽取時 SVG 被剝掉，DB 只剩空的');
out.push('--       <div class="exam-diagram-box"></div>；ja/ko（interview-i18n.sql）反而有圖。');
out.push('-- 產生器：scratchpad/gen-fix-diagrams.js（來源 = interview-bank.js，已上線驗證過的圖）');
out.push('-- 用法：Supabase Dashboard → SQL Editor → 全部貼上 → Run。');
out.push('--       可重複執行：marker 被換掉後 replace() 找不到目標，第二次跑不會有副作用。');
out.push('');

for (const t of TARGETS) {
  const q = window.INTERVIEW_BANK.find(x => x.id === t.id);
  if (!q) throw new Error('missing question ' + t.id);
  const m = q.zh.answer.match(/<div class="exam-diagram-box">([\s\S]*?<\/svg>)<\/div>/);
  if (!m) throw new Error('no diagram in ' + t.id);
  const svg = m[1];
  if (svg.includes('$vsq$') || svg.includes('$box$')) throw new Error('dollar-quote collision in ' + t.id);
  const filled = '<div class="exam-diagram-box">' + svg + '</div>';

  out.push(`-- ${t.id}：${t.note}（SVG ${svg.length} chars）`);
  out.push('update public.interview_questions');
  out.push(`   set answer    = replace(answer,    $box$${EMPTY_BOX}$box$, $vsq$${filled}$vsq$),`);
  out.push(`       answer_en = replace(answer_en, $box$${EMPTY_BOX}$box$, $vsq$${filled}$vsq$)`);
  out.push(` where question like $q$${t.like}$q$;`);
  out.push('');
}

out.push('-- 驗收：三列都要 zh_has_svg = t 且 en_has_svg = t，empty_box_left = f');
out.push('select id, left(question, 24) as q,');
out.push("       answer    like '%<svg%' as zh_has_svg,");
out.push("       answer_en like '%<svg%' as en_has_svg,");
out.push(`       (answer like $box$%${EMPTY_BOX}%$box$ or answer_en like $box$%${EMPTY_BOX}%$box$) as empty_box_left`);
out.push('  from public.interview_questions');
out.push(' where ' + TARGETS.map(t => `question like $q$${t.like}$q$`).join('\n    or ') + ';');
out.push('');

process.stdout.write(out.join('\n'));
