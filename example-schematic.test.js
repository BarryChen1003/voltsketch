/**
 * example-schematic.test.js — 範例應用電路回歸測試（node，DOM stub）
 * 守的不變式（都是踩過的坑）：
 *   ① 不得與卡片主圖相同：範例圖一定要有主圖沒有的東西（實際電壓、R1/R2）
 *   ② 電壓方向必須符合拓樸：LDO/Buck 只能降壓、Boost 只能升壓
 *      （曾把「3.3V 穩壓 ｜ 從 5V 產生 3.3V」抽成 3.3V→5V，LDO 升壓是不可能的）
 *   ③ 資料不足（沒料號 / 沒有兩個相異電壓 / 拓樸不明）→ 回 null，不硬畫
 */
'use strict';

const noop = () => {};
global.window = {};
require('./schematic-symbols.js');
require('./example-schematic.js');
const ES = global.window.ExampleSchematic;

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL: ' + m); } };
const eq = (a, b, m) => ok(a === b, `${m}（得 ${JSON.stringify(a)}，期望 ${JSON.stringify(b)}）`);

const card = (id) => ({ id, circuits: [{ svg: '<svg viewBox="0 0 10 10"></svg>' }] });

// ① 料號抽取
{
  eq(ES.findPart({ title: '5V to 3.3V Buck', circuit: '使用 MP2315 的高效 Buck 轉換器' }), 'MP2315', '抽出 MP2315');
  eq(ES.findPart({ title: '3.3V 穩壓', circuit: '使用 AMS1117-3.3 的典型應用電路' }), 'AMS1117-3.3', '抽出帶後綴料號');
  ok(!ES.findPart({ title: 'I2C 上拉', circuit: 'I2C 需要上拉電阻' }), '協定名不算料號');
}

// ② 電壓抽取
{
  const r = ES.findRails({ title: '5V to 3.3V Buck', application: '從 5V 電源產生 3.3V' });
  eq(r.vin, '5V', 'vin=5V'); eq(r.vout, '3.3V', 'vout=3.3V');
  ok(!ES.findRails({ title: 'RF 供電', application: '為 RF 放大器提供低噪聲電源' }), '沒電壓回 null');
}

// ③ 方向校正：LDO 不能升壓
{
  const ex = { title: '3.3V 穩壓', application: '從 5V USB 電源產生 3.3V', circuit: '使用 AMS1117-3.3 的典型應用電路' };
  const raw = ES.findRails(ex);
  ok(raw.vin === '3.3V', '（前提）原始抽取確實是反的 3.3V 在前');
  const r = ES.build(card('ldo-regulator'), ex);
  ok(!!r, 'LDO 範例有產生圖');
  ok(/5V → 3\.3V/.test(r.note), `方向被校正成 5V → 3.3V（實得：${r && r.note}）`);
}

// ④ Boost 必須升壓
{
  const r = ES.build(card('boost-converter'),
    { title: '3.3V to 5V Boost', application: '從 3.3V 電池產生 5V USB 電源', circuit: '使用 MT3608 的 2A Boost' });
  ok(!!r && /3\.3V → 5V/.test(r.note), 'Boost 方向 3.3V → 5V');
}

// ⑤ 圖內容必須是「範例專屬」：實際電壓 + 回授分壓
{
  const r = ES.build(card('buck-converter'),
    { title: '5V to 3.3V Buck', application: '從 5V 電源產生 3.3V', circuit: '使用 MP2315 的高效 Buck 轉換器' });
  ok(!!r, 'Buck 範例有圖');
  ok(r.svg.includes('>5V<') && r.svg.includes('>3.3V<'), '圖上有實際電壓 5V / 3.3V');
  ok(r.svg.includes('>R1<') && r.svg.includes('>R2<'), '圖上有回授分壓 R1/R2');
  ok(r.svg.includes('>MP2315<'), '圖上有料號');
  ok(!r.svg.includes('>Vin<') && !r.svg.includes('>Vout<'), '不再用泛用 Vin/Vout（那是卡片主圖的畫法）');
}

// ⑥ 資料不足就不畫
{
  ok(ES.build(card('buck-converter'), { title: 'Buck 應用', application: '一般降壓', circuit: '用降壓轉換器' }) === null,
    '沒料號沒電壓 → null');
  ok(ES.build(card('flyback-converter'), { title: 'X', application: '5V to 3.3V', circuit: '使用 UC3842' }) === null,
    '拓樸不在支援清單 → null（不憑印象畫 Flyback 應用）');
  ok(ES.build(card('buck-boost-converter'), { title: '5V to ±12V', application: '運放電源', circuit: '使用 TPS65133' }) === null,
    'buck-boost 變體多 → null');
}

console.log(`\nexample-schematic.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
