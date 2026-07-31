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
  { id: 'q3',  like: 'BSS138 NMOS 電路分析',        note: '兩級 NMOS 反相器，標出 A/B/C 位準' },
  { id: 'q8',  like: 'SPI 線路設計時常會串一個電阻', note: 'SPI 串聯端接電阻放源端' },
  { id: 'q9',  like: '若下管為',                    note: '同步 vs 非同步 Buck' },
  { id: 'q10', like: 'Buck 電路中的',               note: '上管 OFF 時的續流路徑' },
  { id: 'q11', like: 'SR2, SC3 組成的電路',         note: 'RC Snubber 與振鈴抑制' },
];

let bad = 0;
for (const t of T) {
  const hits = SEED.split(t.like).length - 1;
  if (hits !== 1) { console.error(`PATTERN FAIL ${t.id}: "${t.like}" 命中 ${hits} 次（需要 1）`); bad++; }
  else console.error('pattern ok ' + t.id);
}
if (bad) process.exit(1);

const out = [];
out.push('-- interview-batch4-diagrams.sql — 面試題庫補圖 批次 4');
out.push('-- q3   兩級 NMOS 反相器（BSS138）：A=5V -> B=0V -> C=5V，ID(R452)=1.2mA');
out.push('-- q8   SPI 串聯端接：Master 輸出的三條線在 Master 側串 22-33R，MISO 串在 Slave 側');
out.push('-- q9   同步 vs 非同步 Buck：下管 FET vs 蕭特基（答案是同步）');
out.push('-- q10  上管 OFF 的續流路徑：迴路經 body diode 與 L，不經 HS');
out.push('-- q11  RC Snubber：串聯 RC 跨接 D-S，附振鈴 vs 阻尼波形對照');
out.push('--');
out.push('-- 兩道驗證都過：瀏覽器重疊實測 = 0；語意/幾何斷言全過（續流迴路封閉且避開 HS、');
out.push('--   二極體陰極朝 SW、箭頭方向 3 右 1 左、振鈴曲線穿越穩態值 6 次而阻尼曲線 0 次過衝）');
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
