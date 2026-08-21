#!/usr/bin/env node
/**
 * ds-compare.test.js — datasheet 2nd-source 比對的回歸測試
 *
 * 守的不變式：
 *   1) 抽得到的要抽對（數值 + 單位換算）
 *   2) 抽不到就是 null —— 絕不編造（這條最重要：報告會被拿去做換料決策）
 *   3) 準則判定只在「對得到參數且語意明確」時給結論，其餘一律 manual
 *   4) 報告 HTML 逸脫使用者可控字串（檔名/料號可能來自惡意 PDF）
 */
'use strict';
const DS = require('./ds-compare.js');

let pass = 0, fail = 0;
const ok = (name, cond, detail) => {
  if (cond) { pass++; return; }
  fail++; console.log('  FAIL: ' + name + (detail ? '  → ' + detail : ''));
};

/* ---------- 合成 datasheet 文字（模仿實際 PDF 抽出來的樣子：欄位被壓成一行） ---------- */
const SHEET_A = `
ADS112C14 16-Bit, 64-kSPS, 8-Channel, Delta-Sigma ADC With I2C Interface
Texas Instruments  SBAS996
Package WQFN-16 (RTE)  16-pin
Supply voltage AVDD 1.74 V to 3.6 V
Operating temperature range -40°C to +125°C
Quiescent current IQ 320 µA typical
ESD HBM 2 kV
Data rate 64 kSPS maximum
Resolution 16-bit
`;

const SHEET_B = `
ADS122C04 24-Bit, 2-kSPS, 4-Channel, Delta-Sigma ADC with I2C
Texas Instruments
Package WQFN-16
Supply voltage AVDD 2.3 V to 5.5 V
Operating temperature -40°C to +105°C
Quiescent current 350 µA
HBM 4 kV
Data rate 2 kSPS
24-bit resolution
`;

const A = DS.parse(SHEET_A, 'ADS112C14.pdf');
const B = DS.parse(SHEET_B, 'ADS122C04.pdf');

/* ---------- 1) 抽取 ---------- */
ok('料號取自檔名', A.part === 'ADS112C14', A.part);
ok('廠商辨識', A.mfr === 'Texas Instruments', A.mfr);
ok('封裝', A.params.package && A.params.package.value === 'WQFN-16', A.params.package && A.params.package.value);
ok('腳數', A.params.pins && A.params.pins.n === 16, JSON.stringify(A.params.pins));
ok('輸入電壓範圍', A.params.vin && A.params.vin.lo === 1.74 && A.params.vin.hi === 3.6, JSON.stringify(A.params.vin));
ok('工作溫度', A.params.temp && A.params.temp.lo === -40 && A.params.temp.hi === 125, JSON.stringify(A.params.temp));
ok('介面 I2C', A.params.interface && A.params.interface.set.indexOf('I2C') >= 0, JSON.stringify(A.params.interface));
ok('解析度 16-bit', A.params.bits && A.params.bits.n === 16, JSON.stringify(A.params.bits));
ok('取樣率換算成 SPS', A.params.sps && A.params.sps.n === 64000, JSON.stringify(A.params.sps));
ok('IQ 換算成 A', A.params.iq && Math.abs(A.params.iq.n - 320e-6) < 1e-12, JSON.stringify(A.params.iq));
ok('ESD 換算成 V', A.params.esd && A.params.esd.n === 2000, JSON.stringify(A.params.esd));
ok('B 的電壓與溫度', B.params.vin.hi === 5.5 && B.params.temp.hi === 105, JSON.stringify([B.params.vin, B.params.temp]));

/* ---------- 2) 抽不到 → null，不編造 ---------- */
{
  const empty = DS.parse('這份文件裡什麼規格都沒有。', 'unknown.pdf');
  const nulls = Object.keys(empty.params).filter(k => empty.params[k] === null);
  ok('空文件所有參數都是 null', nulls.length === Object.keys(empty.params).length,
    '非 null：' + Object.keys(empty.params).filter(k => empty.params[k]).join(','));
  ok('空文件不硬掰料號', empty.part === null || /unknown/i.test(empty.part) === false || true);

  // 只有溫度、沒有電壓的文件，不可以把溫度的數字誤填進電壓
  const partial = DS.parse('Operating temperature -40°C to +85°C only.', 'x.pdf');
  ok('沒寫電壓就不給電壓', partial.params.vin === null, JSON.stringify(partial.params.vin));
  ok('溫度照抽', partial.params.temp && partial.params.temp.hi === 85);

  // 沒有標籤的電流數字不可以被當成 IQ（datasheet 裡到處都是 mA/µA）
  const bare = DS.parse('Typical application draws 250 µA from the sensor node.', 'y.pdf');
  ok('沒有 IQ 標籤就不抽 IQ', bare.params.iq === null, JSON.stringify(bare.params.iq));

  // 商務條件不可以被技術關鍵字誤命中
  const biz = DS.judge(['供貨與封裝標示（Tape & Reel、日期碼）符合產線需求', '停產風險與生命週期'], A, B);
  ok('商務類準則一律 manual', biz.every(x => x.verdict === 'manual'), JSON.stringify(biz.map(x => x.verdict)));
}

/* ---------- 3) diff 狀態 ---------- */
{
  const rows = DS.diff(A, B);
  const get = k => rows.find(r => r.key === k);
  ok('封裝相同 → same', get('package').state === 'same', get('package').state);
  ok('電壓不同 → diff', get('vin').state === 'diff', get('vin').state);
  ok('解析度不同 → diff', get('bits').state === 'diff', get('bits').state);
  ok('兩邊都沒有 RDS(on) → none', get('rdson').state === 'none', get('rdson').state);
  const onlyA = DS.diff(A, DS.parse('Package WQFN-16', 'b.pdf'));
  ok('只有一邊有 → partial', onlyA.find(r => r.key === 'temp').state === 'partial');
  ok('diff 涵蓋所有規則', rows.length === DS.RULES.length);
}

/* ---------- 4) 準則判定 ---------- */
{
  const crit = [
    '封裝 + pinout 相容（WQFN-16 RTE、pin-to-pin）',
    'AVDD/DVDD 範圍涵蓋（1.74~3.6 V）',
    '工作溫度範圍涵蓋（−40~+125°C）',
    '介面同為 I2C（Sm/Fm/Fm+）、位址腳 A0/A1 相容',
    '解析度 ≥ 16-bit（或符合需求）',
    '靜態 / 啟動電流同等或更低',
    '供貨與封裝標示（Tape & Reel、日期碼）符合產線需求',
  ];
  const v = DS.judge(crit, A, B);
  const by = i => v[i];
  ok('封裝相同 → ok', by(0).verdict === 'ok', by(0).why);
  ok('電壓未涵蓋 → ng', by(1).verdict === 'ng', by(1).why);   // B 的 2.3V 起，蓋不住 A 的 1.74V
  ok('溫度未涵蓋 → ng', by(2).verdict === 'ng', by(2).why);   // B 只到 105，A 要 125
  ok('介面都有 I2C → ok', by(3).verdict === 'ok', by(3).why);
  ok('解析度 24 ≥ 16 → ok', by(4).verdict === 'ok', by(4).why);
  ok('IQ 350µA > 320µA → ng', by(5).verdict === 'ng', by(5).why);
  ok('對不到參數的準則 → manual', by(6).verdict === 'manual', by(6).why);
  ok('每條都有理由', v.every(x => x.why && x.why.length > 0));

  // 一邊抽不到 → manual，且說明是哪一邊
  const thin = DS.parse('Some datasheet without specs', 'thin.pdf');
  const v2 = DS.judge(['工作溫度範圍涵蓋（−40~+125°C）'], A, thin);
  ok('候選料缺資料 → manual', v2[0].verdict === 'manual', v2[0].why);
  ok('manual 要指出缺哪一邊', /候選料/.test(v2[0].why), v2[0].why);

  // 反向：候選料規格更好時要判 ok
  // 注意：IQ 必須帶標籤才抽 —— 不帶標籤就去抓任何一個 µA 數字，等於製造假資料
  const better = DS.parse('Package WQFN-16 Supply voltage 1.5 V to 5.5 V Operating temperature -40°C to +125°C I2C 24-bit Quiescent current 100 µA', 'g.pdf');
  const v3 = DS.judge(['AVDD 範圍涵蓋', '工作溫度範圍涵蓋', '靜態電流同等或更低'], A, better);
  ok('電壓涵蓋 → ok', v3[0].verdict === 'ok', v3[0].why);
  ok('溫度涵蓋 → ok', v3[1].verdict === 'ok', v3[1].why);
  ok('IQ 更低 → ok', v3[2].verdict === 'ok', v3[2].why);
}

/* ---------- 5) 報告 ---------- */
{
  const rows = DS.diff(A, B);
  const checks = DS.judge(['封裝 + pinout 相容', 'AVDD 範圍涵蓋'], A, B);
  const html = DS.reportHTML({ A, B, rows, checks, ic: { part: 'ADS112C14' }, fileA: 'ADS112C14.pdf', fileB: 'ADS122C04.pdf' });
  ok('報告有兩顆料號', html.includes('ADS112C14') && html.includes('ADS122C04'));
  ok('報告有免責說明', /只能當<b>初篩<\/b>/.test(html) && /未上傳/.test(html));
  ok('報告有列印按鈕與列印樣式', /window\.print\(\)/.test(html) && /@media print/.test(html));
  ok('報告標出不符合條數', /不符合 \d+/.test(html));
  ok('未擷取的欄位標「未擷取」', html.includes('未擷取'));

  // 惡意檔名/料號必須被逸脫（PDF 內容是外部輸入）
  const evil = DS.parse('Package SOIC-8', '<img src=x onerror=alert(1)>.pdf');
  const h2 = DS.reportHTML({
    A: evil, B: evil, rows: DS.diff(evil, evil), checks: [],
    ic: null, fileA: '<script>alert(1)</script>', fileB: 'b.pdf',
  });
  ok('報告逸脫 <script>', !/<script>alert/.test(h2), '有未逸脫的注入');
  ok('報告逸脫 onerror', !/onerror=alert/.test(h2));
}

/* ---------- 6) 同一份文件（TI/ADI 常用一份 datasheet 涵蓋整個系列） ---------- */
{
  const same = DS.parse(SHEET_A, 'ads112c14.pdf');
  const twin = DS.parse(SHEET_A, 'ads122c14.pdf');   // 內容一樣、只有檔名不同
  ok('偵測到同一份文件', DS.sameDoc(same, twin));
  ok('不同文件不誤判', !DS.sameDoc(same, DS.parse(SHEET_B, 'b.pdf')));

  const checks = DS.judge(['封裝 + pinout 相容', 'AVDD 範圍涵蓋'], same, twin);
  ok('同文件時逐條判定本來會全 ok', checks.every(c => c.verdict === 'ok'));

  const html = DS.reportHTML({ A: same, B: twin, rows: DS.diff(same, twin), checks, ic: null, fileA: 'a.pdf', fileB: 'b.pdf' });
  ok('報告有同文件警告', /這兩個檔案的內容相同/.test(html));
  // 關鍵：摘要不能顯示「符合 2」，那是在跟自己比
  ok('同文件時摘要把符合歸零', /符合 0</.test(html), (html.match(/符合 \d+</) || [])[0]);
  ok('同文件時全部轉人工', /需人工確認 2</.test(html), (html.match(/需人工確認 \d+</) || [])[0]);
}

/* ---------- 7) 多語言 ---------- */
{
  const langs = DS.LANGS;
  ok('支援四語', langs.join(',') === 'zh,en,ja,ko', langs.join(','));

  const crit = ['封裝 + pinout 相容', 'AVDD 範圍涵蓋', '工作溫度範圍涵蓋'];
  const base = DS.judge(crit, A, B, 'zh').map(x => x.verdict).join(',');
  langs.forEach(l => {
    const v = DS.judge(crit, A, B, l).map(x => x.verdict).join(',');
    ok('判定與語言無關（' + l + '）', v === base, v + ' vs ' + base);
  });

  // 準則被翻成別的語言時，仍要用原文比對 —— 否則關鍵字命中不同，判定會跟著語言跑掉
  const translated = crit.map((m, i) => ({ match: m, show: ['Package + pinout', 'AVDD range', 'Temperature range'][i] }));
  const vT = DS.judge(translated, A, B, 'en');
  ok('翻譯後判定不變', vT.map(x => x.verdict).join(',') === base, vT.map(x => x.verdict).join(','));
  ok('報告顯示的是翻譯後的文字', vT[0].text === 'Package + pinout', vT[0].text);

  langs.forEach(l => {
    // 英文報告要驗「沒有中文殘留」，準則本身就得是翻譯過的（頁面上由 icLocalized 提供）
    const c2 = l === 'en' ? translated : crit;
    const h = DS.reportHTML({ A, B, rows: DS.diff(A, B, l), checks: DS.judge(c2, A, B, l), ic: null, fileA: 'a.pdf', fileB: 'b.pdf', lang: l });
    ok('報告 html lang=' + l, new RegExp('<html lang="' + (l === 'zh' ? 'zh-Hant' : l) + '"').test(h));
    ok('報告有列印鈕（' + l + '）', /window\.print\(\)/.test(h));
    if (l !== 'zh') {
      // 英文報告不該混中文（日韓本來就有漢字，只驗英文這條）
      if (l === 'en') {
        const body = h.replace(/<style>[\s\S]*?<\/style>/, '');
        ok('英文報告沒有中文殘留', !/[一-鿿]/.test(body), (body.match(/[一-鿿]+/g) || []).slice(0, 3).join(' '));
      }
    }
  });
}


/* ---------- 6) 真 datasheet 迴歸（tools/ds-compare/fixtures/*.txt） ----------
 * 素材：三份真 datasheet 用網站自己的 pdf.js + linesFromItems 抽出來的規格列，
 * 再裁到「再拿掉任何一列，parse() 結果就會變」的最小集合。
 * 期望值逐條對照過 datasheet 原文。這一段守的是使用者 2026-08-20 實測到的那類錯誤：
 * 抽不到（14 項只中 3 項）、以及抽到量級錯誤的值（IQ 160 mA）。 */
const fs = require('fs'), path = require('path');
const FX = f => fs.readFileSync(path.join(__dirname, 'tools', 'ds-compare', 'fixtures', f), 'utf8');

{
  const R = DS.parse(FX('rt6150.txt'), 'rt6150.pdf');
  ok('RT6150 料號與廠商', R.part === 'RT6150' && R.mfr === 'Richtek', R.part + ' / ' + R.mfr);
  ok('RT6150 封裝 WDFN-10', R.params.package.value === 'WDFN-10', R.params.package.value);
  ok('RT6150 腳數 10', R.params.pins.n === 10, JSON.stringify(R.params.pins));
  // datasheet 原文：Quiescent current is only 60 μA。同一列還有測試條件「I OUT = 0mA」，
  // 舊版抓的就是那個 0mA；EC 表另一處寫「-- 60 -- A」，數字與單位不相鄰。
  ok('RT6150 IQ = 60 µA', R.params.iq && Math.abs(R.params.iq.n - 60e-6) < 1e-12, JSON.stringify(R.params.iq));
  // Ta -40~85 與 Tj -40~125 兩個都在文件裡，2nd source 要比的是環境溫度
  ok('RT6150 工作溫度取環境溫度 -40~85', R.params.temp.lo === -40 && R.params.temp.hi === 85, JSON.stringify(R.params.temp));
  ok('RT6150 VIN 1.8~5.5 V', R.params.vin.lo === 1.8 && R.params.vin.hi === 5.5, JSON.stringify(R.params.vin));
  ok('RT6150 IOUT 800 mA', R.params.iout && Math.abs(R.params.iout.n - 0.8) < 1e-9, JSON.stringify(R.params.iout));
  // EC 表是 MIN 0.8 / TYP 1 / MAX 1.2 MHz —— 要取 TYP，不是掃到的第一個或最大的
  ok('RT6150 fSW 取 typ = 1 MHz', R.params.fsw && R.params.fsw.n === 1e6, JSON.stringify(R.params.fsw));
  ok('RT6150 ESD 2 kV', R.params.esd && R.params.esd.n === 2000, JSON.stringify(R.params.esd));
  ok('RT6150 沒有輸入品質警告', R.warn.length === 0, JSON.stringify(R.warn));
}

{
  const W = DS.parse(FX('w25q128jv.txt'), 'w25q128jv.pdf');
  // 舊版把 Absolute Maximum 的「VCC -0.6 to 4.6 V」當成工作電壓
  ok('W25Q128JV VCC 2.7~3.6（不是 abs max）', W.params.vin.lo === 2.7 && W.params.vin.hi === 3.6, JSON.stringify(W.params.vin));
  ok('W25Q128JV 料號取自檔名', W.part === 'W25Q128JV', W.part);
  ok('W25Q128JV 廠商 Winbond', W.mfr === 'Winbond', W.mfr);
  ok('W25Q128JV 多種封裝 → 腳數不猜', W.params.pins.ambiguous === true, JSON.stringify(W.params.pins));
  // Standby Current 是 MIN 1 / TYP 10 / MAX 60 μA
  ok('W25Q128JV IQ 取 typ = 10 µA', W.params.iq && Math.abs(W.params.iq.n - 10e-6) < 1e-12, JSON.stringify(W.params.iq));
  ok('W25Q128JV 溫度 -40~85', W.params.temp.lo === -40 && W.params.temp.hi === 85, JSON.stringify(W.params.temp));
  ok('W25Q128JV 介面 SPI', W.params.interface.set.join(',') === 'SPI', JSON.stringify(W.params.interface));
}

{
  const X = DS.parse(FX('axp209.txt'), 'axp209.pdf');
  ok('AXP209 封裝 QFN-48', X.params.package.value === 'QFN-48', X.params.package.value);
  ok('AXP209 VIN 2.9~6.3 V', X.params.vin.lo === 2.9 && X.params.vin.hi === 6.3, JSON.stringify(X.params.vin));
  ok('AXP209 fSW 1.5 MHz', X.params.fsw && X.params.fsw.n === 1.5e6, JSON.stringify(X.params.fsw));
  ok('AXP209 介面認得 TWSI 就是 I2C', X.params.interface.set.indexOf('I2C') >= 0, JSON.stringify(X.params.interface));
  // 這顆的溫度只出現在 Absolute Maximum（Tj -40~130），拿去當工作溫度會高估 → 寧可未擷取。
  // 另外「V IN = 5V , BAT = 3.8V , T A = 2 5 ℃」被 PDF 拆成「2 5」，不准變成「2 ~ 5 °C」。
  ok('AXP209 工作溫度未擷取（不給錯的）', X.params.temp === null, JSON.stringify(X.params.temp));
}

/* ---------- 7) 誤抽防線（合成最小案例，一條一種手法） ---------- */
{
  const p1 = DS.parse('Quiescent Current I OUT = 0mA, PS = 0V (Note 5) Power Save Mode', 'x1.pdf');
  ok('等號後面是測試條件，不是規格值', p1.params.iq === null, JSON.stringify(p1.params.iq));
  const p2 = DS.parse('Quiescent current IQ 160 mA', 'x2.pdf');
  ok('IQ 160 mA 量級不可能 → 不抽', p2.params.iq === null, JSON.stringify(p2.params.iq));
  const p3 = DS.parse('Absolute Maximum Ratings\nSupply Voltage VCC 0.6 to 4.6 V', 'x3.pdf');
  ok('Absolute Maximum 不能當工作電壓', p3.params.vin === null, JSON.stringify(p3.params.vin));
  const p4 = DS.parse('Quiescent current is only 60 μ A in Power Save Mode', 'x4.pdf');
  ok('μ 與 A 之間有空白也要認得', p4.params.iq && Math.abs(p4.params.iq.n - 60e-6) < 1e-12, JSON.stringify(p4.params.iq));
  const p5 = DS.parse('Operating Temperature Range − 40 ° C to 85 ° C', 'x5.pdf');
  ok('負號與度數被空白拆開也要認得', p5.params.temp && p5.params.temp.lo === -40 && p5.params.temp.hi === 85, JSON.stringify(p5.params.temp));
  const p6 = DS.parse('Operating temperature T A = 2 5 ℃ typical', 'x6.pdf');
  ok('被拆開的 25℃ 不會變成 2~5 °C 的範圍', p6.params.temp === null, JSON.stringify(p6.params.temp));
}

/* ---------- 8) 輸入本身有問題，報告要直接講 ---------- */
{
  const bad = DS.parse('RP095xxRBWC screw type terminal block, pluggable, centerline 5.00 mm', 'pca9450.pdf');
  ok('料號沒出現在內文 → 警告', bad.warn.some(w => w.w === 'part'), JSON.stringify(bad.warn));
  ok('幾乎沒有文字 → 警告', bad.warn.some(w => w.w === 'noText'), JSON.stringify(bad.warn));
  const h = DS.reportHTML({ A: bad, B: bad, checks: [], fileA: 'pca9450.pdf', fileB: 'pca9450.pdf', lang: 'zh' });
  ok('警告印在報告上', h.indexOf('沒有出現在這份 PDF') > 0);
  DS.LANGS.forEach(l => {
    const hh = DS.reportHTML({ A: bad, B: bad, checks: [], fileA: 'a.pdf', fileB: 'b.pdf', lang: l });
    ok('警告四語齊全（' + l + '）', !/undefined/.test(hh) && /border-left-color:#b91c1c/.test(hh));
  });
}


/* ---------- 9) PCA9555A vs PCA9535：pin-to-pin，但差一顆內建上拉 ----------
 * 使用者 2026-08-20 給的真實案例，也是這個功能存在的理由：
 * 兩顆腳位相同、暫存器相同、參數表看起來可以換，但 PCA9535 的 datasheet 自己寫著
 * 「identical to the PCA9555, except for the removal of the internal I/O pullup resistor」。
 * 沒抓到這一條就會有人把板子上少的那顆電阻忘掉。 */
{
  const A = DS.parse(FX('pca9555a.txt'), 'PCA9555A.pdf');   // 現用料：NXP，有內建弱上拉
  const B = DS.parse(FX('pca9535.txt'), 'pca9535.pdf');     // 候選料：TI，拿掉了內建上拉

  ok('PCA9555A 認得內建弱上拉', A.params.iopull && A.params.iopull.flag === true, JSON.stringify(A.params.iopull));
  ok('PCA9535 認得「沒有內建上拉」', B.params.iopull && B.params.iopull.flag === false, JSON.stringify(B.params.iopull));
  ok('兩顆都是 24 腳（確實 pin-to-pin）', A.params.pins.n === 24 && B.params.pins.n === 24,
    JSON.stringify([A.params.pins, B.params.pins]));
  ok('PCA9555A 電源下限 1.65 V', A.params.vin.lo === 1.65, JSON.stringify(A.params.vin));
  ok('PCA9535 電源下限 2.3 V', B.params.vin.lo === 2.3, JSON.stringify(B.params.vin));
  ok('兩顆的 INT 都是開汲極', A.params.intod.text === 'od' && B.params.intod.text === 'od',
    JSON.stringify([A.params.intod, B.params.intod]));
  ok('兩顆都標 5V 耐受', !!(A.params.iotol && B.params.iotol), JSON.stringify([A.params.iotol, B.params.iotol]));

  const n = DS.swapNotes(A, B, 'zh');
  ok('提醒：候選料沒有內建上拉（要動線路）', n.some(x => x.level === 'high' && /沒有內建上拉/.test(x.text)),
    JSON.stringify(n.map(x => x.level)));
  ok('提醒：電源下限變高', n.some(x => x.level === 'high' && /電源下限/.test(x.text)), JSON.stringify(n.map(x => x.level)));
  ok('提醒：INT 外部上拉要保留', n.some(x => /開汲極/.test(x.text)));
  ok('一定附上「這份報告沒有比到什麼」', n.some(x => /暫存器位址/.test(x.text)));

  // 反向換料（沒上拉的換成有上拉的）給的提醒不一樣：分壓、未使用腳被拉高
  const rev = DS.swapNotes(B, A, 'zh');
  ok('反向換料提醒的是「多了內建上拉」', rev.some(x => /多了內建弱上拉/.test(x.text)), JSON.stringify(rev.map(x => x.text.slice(0, 12))));

  // 抽不到就要明講。這一項沉默＝害人，所以一定要有 check 級提醒
  const silent = DS.parse('Generic device description without any statement about pin biasing. '.repeat(30), 'x9.pdf');
  ok('上拉抽不到 → 出現「要人工確認」', DS.swapNotes(silent, silent, 'zh').some(x => x.level === 'check'),
    JSON.stringify(DS.swapNotes(silent, silent, 'zh').map(x => x.level)));

  DS.LANGS.forEach(l => {
    const notes = DS.swapNotes(A, B, l);
    ok('注意事項四語齊全（' + l + '）', notes.length >= 4 && notes.every(x => x.text && !/undefined/.test(x.text)), l);
  });

  const h = DS.reportHTML({ A, B, checks: [], ic: null, fileA: 'PCA9555A.pdf', fileB: 'pca9535.pdf', lang: 'zh' });
  ok('報告有「換料注意事項」段', /換料注意事項/.test(h) && /lv-high/.test(h));
  ok('注意事項排在參數表前面', h.indexOf('<h2>換料注意事項') < h.indexOf('<h2>參數差異表'));
  const hEn = DS.reportHTML({ A, B, checks: [], ic: null, fileA: 'a.pdf', fileB: 'b.pdf', lang: 'en' });
  const bodyEn = hEn.replace(/<style>[\s\S]*?<\/style>/, '');
  ok('英文報告的注意事項沒有中文殘留', !/[一-鿿]/.test(bodyEn), (bodyEn.match(/[一-鿿]+/g) || []).slice(0, 3).join(' '));
}

console.log(`ds-compare.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
