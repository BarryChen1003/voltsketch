/**
 * example-diagram.test.js — 範例應用方塊鏈圖回歸測試（node）
 * 守的不變式：
 *   ① 只切鏈結分隔（+ ＋ →），不切詞內的「/」「，」（5V/9V、90~264VAC 不能被拆開）
 *   ② 單段不畫圖（一句話畫一個框沒有資訊量）
 *   ③ 中文禁則：收尾標點不置行首、起始括號不置行尾、不出現孤立標點行
 *   ④ 版面：畫布寬不超過上限；文字一定畫在方塊內（bbox 由字寬回推，故驗尺寸關係）
 *   ⑤ HTML 逸脫：<>& 不得原樣輸出
 */
'use strict';
global.window = {};
require('./example-diagram.js');
const ED = global.window.ExampleDiagram;

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL: ' + m); } };
const eq = (a, b, m) => ok(a === b, `${m}（得 ${JSON.stringify(a)}，期望 ${JSON.stringify(b)}）`);

// ① 分隔符
{
  eq(ED._split('橋式整流 + GaN QR Flyback（UCG28846 類）+ 光耦回授').length, 3, '+ 切三段');
  eq(ED._split('A → B → C').length, 3, '→ 切三段');
  eq(ED._split('90~264VAC 進、5V/9V 出、隔離').length, 1, '斜線/頓號不切（詞內符號）');
  eq(ED._split('使用 MP2315 的高效 Buck 轉換器').length, 1, '純句子單段');
  ok(ED._split('橋式整流 + GaN QR Flyback（UCG28846 類）+ 光耦回授')[1].includes('UCG28846'),
    '括號內容留在同一段');
}

// ② 單段不畫
{
  ok(ED.build('使用 MP2315 的高效 Buck 轉換器') === null, '單段回 null');
  ok(ED.build('') === null, '空字串回 null');
  ok(!!ED.build('A + B'), '兩段有圖');
}

// ③ 中文禁則
{
  const NOSTART = '）〉》」』】〕｝、。，．；：？！·…～%),.;:?!';
  const NOEND = '（〈《「『【〔｛(';
  const samples = [
    'GaN QR Flyback（UCG28846 類）',
    '同步整流（SR）控制器＋驅動變壓器',
    '前級 pre-regulator（LM5xxx-Q1，寬輸入 buck-boost）',
    'PoE PD 控制器（隔離 flyback，IEEE 802.3bt）'
  ];
  samples.forEach(s => {
    const ls = ED._wrap(s, 188, 13);
    ls.forEach((l, i) => {
      if (i > 0) ok(!NOSTART.includes(l[0]), `禁則·行首不得為收尾標點：「${l}」`);
      if (i < ls.length - 1) ok(!NOEND.includes(l[l.length - 1]), `禁則·行尾不得為起始括號：「${l}」`);
      ok(!(l.length === 1 && NOSTART.includes(l)), `禁則·不得孤立標點行：「${l}」`);
    });
  });
}

// ④ 版面上限
{
  const long = Array.from({ length: 8 }, (_, i) => `區塊${i + 1}名稱較長一些用來測換行`).join(' + ');
  const svg = ED.build(long);
  const vb = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  ok(+vb[1] <= 700, `畫布寬 ${vb[1]} 不超過 700`);
  ok(+vb[2] > 0, '畫布高為正');
  const rects = [...svg.matchAll(/<rect x="([\d.-]+)" y="([\d.-]+)" width="([\d.]+)" height="([\d.]+)"/g)]
    .map(m => ({ x: +m[1], y: +m[2], w: +m[3], h: +m[4] }));
  eq(rects.length, 8, '八段畫八個方塊');
  ok(rects.every(r => r.x >= -0.5 && r.y >= -0.5 && r.x + r.w <= +vb[1] + 0.5 && r.y + r.h <= +vb[2] + 0.5),
    '方塊全在畫布內');
  const ovl = rects.some((a, i) => rects.some((b, j) => j > i &&
    a.x < b.x + b.w - 0.5 && a.x + a.w > b.x + 0.5 && a.y < b.y + b.h - 0.5 && a.y + a.h > b.y + 0.5));
  ok(!ovl, '方塊互不重疊');
}

// ⑤ 逸脫
{
  const svg = ED.build('A<script> + B&C + D>E');
  ok(!/<script>/.test(svg), '<script> 被逸脫');
  ok(svg.includes('&lt;') && svg.includes('&amp;'), '角括號與 & 逸脫');
}

console.log(`\nexample-diagram.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
