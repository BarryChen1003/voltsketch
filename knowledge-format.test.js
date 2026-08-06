/**
 * knowledge-format.test.js — 知識卡「原理說明」排版器回歸測試（node）
 * 守的不變式：分段只改排版、絕不改內容。
 *   - 重組後文字（去空白）必須等於原文（去空白）→ 零字丟失/竄改
 *   - 短文（<120 字）維持單段，不被切碎
 *   - 長文每段落在可掃讀長度（無 >200 字的牆、無 <25 字的碎片）
 *   - HTML 逸脫：< > & 不得原樣輸出（防注入/破版）
 */
'use strict';

// 只取 formatPrinciples 的實作（避開 knowledge.js 的 DOM 相依）
const fs = require('fs');
const src = fs.readFileSync('./knowledge.js', 'utf8');
const m = src.match(/formatPrinciples\(text\)\s*\{[\s\S]*?\n  \},/);
if (!m) { console.log('FAIL: 找不到 formatPrinciples 實作'); process.exit(1); }
// 空輸入那條走 this.T('kb_no_desc')（畫面上的字一律四語），測試裡沒有 I18N → 給個假的
const HOST = { T: k => k };
const formatPrinciples = new Function('return function ' + m[0].replace(/,$/, ''))().bind(HOST);

let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) pass++; else { fail++; console.log('  FAIL: ' + msg); } };
const textOf = html => html.replace(/<[^>]+>/g, '');
const strip = s => String(s).replace(/\s/g, '');

// 1) 短文不切
{
  const short = '鋰電池充電需遵循 CC-CV 曲線：先恆流至 4.2V，再恆壓至電流降到 0.05C。';
  const out = formatPrinciples(short);
  ok((out.match(/<p/g) || []).length === 1, '短文維持單段');
  ok(strip(textOf(out)) === strip(short), '短文內容不變');
}

// 2) 長文分多段、內容零丟失、段長合理
{
  const long = '矩陣式頭燈的架構是「恆流源＋串聯 LED 串＋每顆 LED 並聯一個旁路開關」：升壓級把電池 9–16V 抬到 LED 串電壓，輸出以恆流流過整串；矩陣管理器內含多路旁路 FET，把個別 LED 短路即熄滅該像素，PWM 旁路占空比即調光。這架構的巧妙在恆流源不用管像素開關，電流永遠一樣，只是流過 LED 或旁路 FET 的差別；但旁路切換瞬間 LED 串電壓跳變，恆流環路要夠快跟上。診斷是車規重點：單顆 LED 開路、短路都要偵測回報。PWM 調光頻率要避開人眼與車載相機頻閃。熱設計上幾十瓦的 LED 熱由金屬基板帶走。';
  const out = formatPrinciples(long);
  const paras = out.match(/<p[^>]*>([\s\S]*?)<\/p>/g) || [];
  ok(paras.length >= 3, `長文應切多段（得 ${paras.length}）`);
  ok(strip(textOf(out)) === strip(long), '長文內容零丟失');
  const lens = paras.map(p => textOf(p).length);
  ok(Math.max(...lens) <= 200, `無超長段落（最長 ${Math.max(...lens)}）`);
  ok(Math.min(...lens) >= 25, `無碎片段落（最短 ${Math.min(...lens)}）`);
}

// 3) 定義句加粗（段首「詞：」）
{
  const t = '開關導通：能量存進變壓器磁化電感，次級二極體反偏不導通。開關關斷：磁能經次級繞組釋放到輸出，先存後放故名返馳。穩壓：輸出經光耦回授到一次側控制器調占空比，維持輸出穩定不飄。';
  const out = formatPrinciples(t);
  ok(/<strong>[^<]+：<\/strong>/.test(out), '段首定義句加粗');
  ok(strip(textOf(out)) === strip(t), '加粗不改內容');
}

// 4) HTML 逸脫
{
  const evil = '測試 <script>alert(1)</script> 與 A&B 以及 5<10 的情況，這段要夠長才會進入分段邏輯，所以再補一些文字讓它超過門檻值繼續往下處理。還要第三句話才會觸發切段。';
  const out = formatPrinciples(evil);
  ok(!/<script>/.test(out), '<script> 被逸脫');
  ok(out.includes('&lt;') && out.includes('&amp;'), '角括號與 & 逸脫');
}

// 5) 空值
// 假 T 直接回 key，所以這裡驗的是「有走 i18n 的 no-desc 文案」而不是寫死中文
ok(/kb_no_desc/.test(formatPrinciples('')), '空內容回 no-desc 文案');
ok(/kb_no_desc/.test(formatPrinciples(null)), 'null 回 no-desc 文案');

console.log(`\nknowledge-format.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
