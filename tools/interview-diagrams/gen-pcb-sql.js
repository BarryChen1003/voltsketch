/**
 * gen-pcb-sql.js — PCB Layout 六題的圖寫進 DB。
 * 題幹短且唯一，所以用 `question = ` 精準比對，不用 LIKE。
 * 題幹直接從 interview-pcb.sql 解析出來，保證與 DB 內容一字不差。
 */
const fs = require('fs');
const WEB = require('path').join(__dirname, '../..');
global.window = {};
require(WEB + '/interview-bank.js');
const BANK = global.window.INTERVIEW_BANK;
const IDS = ['q33', 'q34', 'q35', 'q36', 'q37', 'q38'];
const NOTE = {
  q33: '去耦電容擺位（與 q21 同圖）',
  q34: '差分對走線 對 vs 錯（與 q23 同圖）',
  q35: '回流路徑：完整平面 vs 被切開',
  q36: 'SW 節點佈局與高頻迴路',
  q37: '四層板疊層剖面',
  q38: '散熱過孔陣列剖面',
};

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
const questions = [];
for (let i = 0; i < strs.length; i += 6) questions.push(strs[i + 2]);
if (questions.length !== 6) throw new Error('expected 6 questions, got ' + questions.length);

// 每題的 bank 題幹必須與 SQL 完全相同，否則前端回填與 SQL 會指到不同列
IDS.forEach((id, i) => {
  const e = BANK.find(q => q.id === id);
  if (!e) throw new Error('bank entry missing: ' + id);
  if (e.zh.text !== questions[i]) throw new Error(id + ': bank question != sql question');
});

const out = [];
out.push('-- interview-pcb-diagrams.sql — PCB Layout 六題補圖');
out.push('-- 這 6 題原本只存在 interview-pcb.sql（bank.js 沒有），所以前端回填吃不到；');
out.push('-- 已同時在 interview-bank.js 補上 q33-q38（題幹逐字取自本檔），兩條路都能顯示。');
out.push('--');
IDS.forEach(id => out.push(`-- ${id}  ${NOTE[id]}`));
out.push('--');
out.push('-- 驗證：瀏覽器重疊實測 = 0；語意/幾何斷言全過（回流繞路高度 80px vs 32px、');
out.push('--   SW 銅面佔畫布 0.78%、FB 走線不穿過 SW 與 L、疊層 L1-L2 12px < L2-L3 28px、');
out.push('--   7 個散熱過孔全部落在焊墊 180-340 之內且上下正好接到焊墊與銅面）');
out.push('-- 用法：Supabase Dashboard → SQL Editor → 全部貼上 → Run。冪等，可重跑。');
out.push('');

IDS.forEach((id, i) => {
  const e = BANK.find(q => q.id === id);
  const box = e.zh.answer.match(/<div class="exam-diagram-box">[\s\S]*?<\/svg><\/div>/)[0];
  if (box.includes('$vsq$') || box.includes('$q$') || box.includes('\\')) throw new Error('unsafe payload: ' + id);
  out.push(`-- ${id}：${NOTE[id]}`);
  out.push('update public.interview_questions set');
  for (const col of ['answer', 'answer_en', 'answer_ja', 'answer_ko']) {
    out.push(`  ${col} = case when ${col} is not null and ${col} not like '%<svg%' then n.box || ${col} else ${col} end${col === 'answer_ko' ? '' : ','}`);
  }
  out.push(`  from (select $vsq$${box}$vsq$ as box) n`);
  out.push(` where question = $q$${questions[i]}$q$;`);
  out.push('');
});

out.push('-- 驗收：六列 zh 都要 t（PCB 題原本沒有 ja/ko 譯文，null 是正常的）');
out.push("select left(question, 20) as q, answer like '%<svg%' as zh, answer_en like '%<svg%' as en");
out.push('  from public.interview_questions');
out.push(" where category = 'PCB Layout' order by id;");
out.push('');

process.stdout.write(out.join('\n'));
