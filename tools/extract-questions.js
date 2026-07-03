// 從 hw-engineer-pro.html 抽出 questions 陣列（雙語），產生 interview-questions-seed.sql
// 用法：node tools/extract-questions.js
const fs = require('fs');
const path = require('path');

const SRC = 'C:/Users/User/Documents/Claude/Projects/Hardware/hw-engineer-pro.html';
const OUT = path.join(__dirname, '..', 'interview-questions-seed.sql');

const html = fs.readFileSync(SRC, 'utf8');

// 找 `var questions = [` 並做字串感知的中括號配對，切出陣列字面值
const startIdx = html.indexOf('var questions = [');
if (startIdx < 0) { console.error('找不到 questions 陣列'); process.exit(1); }
const arrStart = html.indexOf('[', startIdx);
let i = arrStart, depth = 0, inStr = null, prev = '';
for (; i < html.length; i++) {
  const c = html[i];
  if (inStr) {
    if (c === inStr && prev !== '\\') inStr = null;
  } else if (c === '"' || c === "'" || c === '`') {
    inStr = c;
  } else if (c === '[') depth++;
  else if (c === ']') { depth--; if (depth === 0) { i++; break; } }
  prev = c;
}
const arrText = html.slice(arrStart, i);

function evalQuestions(isZh) {
  // 沙箱：提供 isZh；其他未定義識別字(examDiagram* 等圖解 helper)一律 stub 成空
  // stub 同時可被呼叫(回'')也可被字串連接(回'')
  function stub() { return ''; }
  stub[Symbol.toPrimitive] = () => '';
  stub.toString = () => '';
  const handler = {
    has: () => true,
    get: (_t, k) => {
      if (k === 'isZh') return isZh;
      if (k === Symbol.unscopables) return undefined;
      return stub;
    }
  };
  const sandbox = new Proxy({}, handler);
  // eslint-disable-next-line no-new-func
  return Function('sandbox', 'with(sandbox){ return ' + arrText + '; }')(sandbox);
}

let zh, en;
try { zh = evalQuestions(true); en = evalQuestions(false); }
catch (e) { console.error('eval 失敗：', e.message); process.exit(1); }

// 正規化分類：把有 catLabel 的傳播到同 cat 的所有題
const catMap = {};
zh.forEach(q => { if (q.cat && q.catLabel) catMap[q.cat] = q.catLabel; });
zh.forEach(q => { q._cat = catMap[q.cat] || q.catLabel || q.cat || '其他'; });

console.log('題目數：', zh.length);
const cats = {};
zh.forEach(q => { cats[q._cat] = (cats[q._cat] || 0) + 1; });
console.log('分類：'); Object.entries(cats).forEach(([k, v]) => console.log('  ', k, v));

const sq = s => "'" + String(s == null ? '' : s).replace(/'/g, "''") + "'";
let sql = '-- 面試題庫種子（由 hw-engineer-pro.html 自動抽取，雙語）\n';
sql += '-- 先跑 supabase-schema.sql 再跑本檔。重跑前可先 truncate。\n';
sql += '-- truncate table public.interview_questions restart identity;\n\n';
sql += 'insert into public.interview_questions (category, question, answer, question_en, answer_en) values\n';
const rows = zh.map((q, idx) => {
  const e = en[idx] || {};
  return '  (' + [sq(q._cat), sq(q.text), sq(q.answer), sq(e.text), sq(e.answer)].join(', ') + ')';
});
sql += rows.join(',\n') + ';\n';
fs.writeFileSync(OUT, sql, 'utf8');
console.log('已寫出：', OUT, '（', rows.length, '題,', Buffer.byteLength(sql), 'bytes ）');
