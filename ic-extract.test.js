#!/usr/bin/env node
/**
 * ic-extract.test.js — 抽取驗證器的測試
 *
 * 守的不變式（每一條都對應一種「錯的值進到資料庫」的方式）：
 *   1) 編出來的 quote 一定要被擋下來（模型最危險的失敗）
 *   2) quote 在文件裡，但數字對不上 → 擋下來（不信任何引擎的算術與單位換算）
 *   3) 量級不合理 → 擋下來（IQ 不可能 160 mA）
 *   4) 值取自 Absolute Maximum 卻沒標明 → 擋下來（那是不可超過值，不是工作值）
 *   5) 文字／旗標型的判斷，quote 那一行必須自己就足以支持同樣的判斷
 *   6) 通過的要真的通過 —— 閘門不能嚴到把對的也擋掉
 */
'use strict';
const path = require('path');
const V = require('./tools/ic-extract/verify.js');
const { claimsFromRules } = require('./tools/ic-extract/from-rules.js');
const fs = require('fs');

let pass = 0, fail = 0;
const ok = (name, cond, detail) => {
  if (cond) { pass++; return; }
  fail++; console.log('  FAIL: ' + name + (detail ? '  → ' + detail : ''));
};

/* ---------- 假的 datasheet（三頁），拿來驗各種宣稱 ---------- */
const PAGES = [
  ['ACME1234 Low-power I/O expander',
    'Operating temperature -40 °C to 85 °C',
    'Low standby current consumption: 1.5 µA typical'].join('\n'),
  ['Absolute Maximum Ratings',
    'Supply voltage VCC -0.5 to 6.5 V',
    'Storage temperature -65 °C to 150 °C'].join('\n'),
  ['Recommended Operating Conditions',
    'Supply voltage VCC 2.7 V to 3.6 V',
    'All input/output pins have weak pull-up resistors connected to them',
    'Oscillator Frequency f OSC 0.8 1 1.2 MHz'].join('\n'),
];

/* ---------- 1) 通過的要通過 ---------- */
{
  const r = V.verifyClaim({ key: 'iq', value: '1.5 µA', n: 1.5e-6, quote: 'Low standby current consumption: 1.5 µA typical', page: 1 }, PAGES);
  ok('正常的宣稱要通過', r.ok, r.reason);
  ok('回報正確頁碼', r.page === 1, String(r.page));

  const t = V.verifyClaim({ key: 'temp', value: '-40 ~ 85 °C', lo: -40, hi: 85, quote: 'Operating temperature -40 °C to 85 °C', page: 1 }, PAGES);
  ok('範圍型宣稱要通過', t.ok, t.reason);

  const v = V.verifyClaim({ key: 'vin', value: '2.7 ~ 3.6 V', lo: 2.7, hi: 3.6, quote: 'Supply voltage VCC 2.7 V to 3.6 V', page: 3 }, PAGES);
  ok('工作電壓（在 Recommended 段）要通過', v.ok, v.reason);
}

/* ---------- 2) 編的 quote 要被擋 ---------- */
{
  const r = V.verifyClaim({ key: 'iq', value: '1 µA', n: 1e-6, quote: 'Typical quiescent current is 1 µA over the full range', page: 1 }, PAGES);
  ok('文件裡沒有這句話 → 擋下', !r.ok && r.reason === 'quote-not-found', r.reason);
}

/* ---------- 3) quote 是真的，但數字被改過 ---------- */
{
  const r = V.verifyClaim({ key: 'iq', value: '15 µA', n: 15e-6, quote: 'Low standby current consumption: 1.5 µA typical', page: 1 }, PAGES);
  ok('數字與出處對不上 → 擋下', !r.ok && r.reason === 'number-mismatch', r.reason);
  const s = V.verifyClaim({ key: 'iq', value: '1.5 µA', n: 1.5e-6, quote: 'Low standby current consumption: 1.5 µA typical', page: 3 }, PAGES);
  ok('頁碼指錯 → 擋下', !s.ok && s.reason === 'wrong-page', s.reason);
}

/* ---------- 4) 量級不合理 ---------- */
{
  const r = V.verifyClaim({ key: 'iq', value: '160 mA', n: 0.16, quote: 'Low standby current consumption: 1.5 µA typical', page: 1 }, PAGES);
  ok('IQ 160 mA 這種量級 → 擋下', !r.ok, r.reason);
  const n = V.verifyClaim({ key: 'temp', lo: 20, hi: 25, value: '20 ~ 25 °C', quote: 'Operating temperature -40 °C to 85 °C', page: 1 }, PAGES);
  ok('溫度範圍太窄（像是抓到測試條件）→ 擋下', !n.ok, n.reason);
}

/* ---------- 5) 取自絕對最大額定 ---------- */
{
  const bad = V.verifyClaim({ key: 'vin', value: '-0.5 ~ 6.5 V', lo: -0.5, hi: 6.5, quote: 'Supply voltage VCC -0.5 to 6.5 V', page: 2 }, PAGES);
  ok('工作電壓抓到 Absolute Maximum → 擋下', !bad.ok, bad.reason);
  const tagged = V.verifyClaim({ key: 'temp', value: '-65 ~ 150 °C', lo: -65, hi: 150, srcTag: 'fromAbsMax', quote: 'Storage temperature -65 °C to 150 °C', page: 2 }, PAGES);
  ok('標明「取自絕對最大額定」就放行（報告會顯示出處）', tagged.ok, tagged.reason);
}

/* ---------- 6) 文字／旗標型：出處那一行要自己撐得住結論 ---------- */
{
  const good = V.verifyClaim({ key: 'iopull', value: '有', flag: true, quote: 'All input/output pins have weak pull-up resistors connected to them', page: 3 }, PAGES);
  ok('內建上拉：出處講得出來 → 通過', good.ok, good.reason);
  const bad = V.verifyClaim({ key: 'iopull', value: '有', flag: true, quote: 'Operating temperature -40 °C to 85 °C', page: 1 }, PAGES);
  ok('內建上拉：引用了不相干的句子 → 擋下', !bad.ok && bad.reason === 'quote-does-not-support', bad.reason);
}

/* ---------- 7) MIN TYP MAX：單位掛在行尾，三個值都算數 ---------- */
{
  const r = V.verifyClaim({ key: 'fsw', value: '1 MHz', n: 1e6, quote: 'Oscillator Frequency f OSC 0.8 1 1.2 MHz', page: 3 }, PAGES);
  ok('取 typ 值也驗得過', r.ok, r.reason);
  ok('三欄的值都解析得到', V.valuesIn('Oscillator Frequency f OSC 0.8 1 1.2 MHz', 'Hz').indexOf(8e5) >= 0);
}

/* ---------- 8) 正負號：只有宣稱方明說是絕對值才准忽略 ---------- */
{
  const pages = ['I OH High-level output current P07-P00 -10 mA'];
  const strict = V.verifyClaim({ key: 'iout', value: '10 mA', n: 0.01, quote: pages[0], page: 1 }, pages);
  ok('沒標絕對值時，正負要一致', !strict.ok && strict.reason === 'number-mismatch', strict.reason);
  const flagged = V.verifyClaim({ key: 'iout', value: '-10 mA', n: 0.01, absolute: true, quote: pages[0], page: 1 }, pages);
  ok('標了 absolute 才放行', flagged.ok, flagged.reason);
}

/* ---------- 8b) 範圍的破折號不是負號 ---------- */
{
  // Nexperia 74LVC4066 的電源列抽出來是「V CC supply voltage 1.65 -5.5 V」，
  // 那個「-」是 1.65 到 5.5 的分隔。讀成 -5.5 的話，正確的宣稱會被誤判成造假。
  const pages = ['V CC supply voltage 1.65 -5.5 V'];
  const r = V.verifyClaim({ key: 'vin', value: '1.65 ~ 5.5 V', lo: 1.65, hi: 5.5, quote: pages[0], page: 1 }, pages);
  ok('範圍分隔的破折號不會讓正確宣稱被擋', r.ok, r.reason);
  // 但真正的負值仍要讀得出來
  ok('句首的負號照樣是負號', V.numbersIn('-40 °C to 85 °C').indexOf(-40) >= 0);
}

/* ---------- 9) 缺件 ---------- */
{
  ok('沒有 quote → 擋下', !V.verifyClaim({ key: 'iq', n: 1e-6 }, PAGES).ok);
  ok('quote 太短 → 擋下', !V.verifyClaim({ key: 'iq', n: 1e-6, quote: '1.5' }, PAGES).ok);
  ok('沒有 key → 擋下', !V.verifyClaim({ n: 1e-6, quote: 'Low standby current consumption: 1.5 µA typical' }, PAGES).ok);
}

/* ---------- 10) 規則引擎的產出，本身也要驗得過 ---------- */
{
  const fx = f => fs.readFileSync(path.join(__dirname, 'tools', 'ds-compare', 'fixtures', f), 'utf8');
  // fixture 是裁過的單頁文字，當成一頁餵進去
  [['pca9555a.txt', 'PCA9555A.pdf'], ['pca9535.txt', 'pca9535.pdf'], ['rt6150.txt', 'rt6150.pdf'],
  ['w25q128jv.txt', 'w25q128jv.pdf'], ['axp209.txt', 'axp209.pdf']].forEach(([f, name]) => {
    const pages = [fx(f)];
    const { claims } = claimsFromRules(pages, name);
    const res = V.verifyAll(claims, pages);
    ok(name + ' 的規則產出全部驗得過（' + res.pass + '/' + res.total + '）', res.total > 0 && res.fail === 0,
      res.rows.filter(r => !r.ok).map(r => r.key + ':' + r.reason).join(','));
  });
}

console.log(`ic-extract.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
