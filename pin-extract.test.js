// pin-extract.test.js — 腳位抽取的守衛。
//
// 順序很重要：先證明這支測試抓得到已知的壞法（§8「稽核器自己也會有 bug」），
// 再相信它對真 fixture 的乾淨報告。
const fs = require('fs');
const path = require('path');
const PinExtract = require('./pin-extract.js');

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) pass++; else { fail++; console.log('  FAIL: ' + msg); } }
function eq(a, b, msg) { ok(a === b, msg + ' — 得到 ' + JSON.stringify(a) + '，預期 ' + JSON.stringify(b)); }

const fixDir = path.join(__dirname, 'tools', 'pin-extract', 'fixtures');
const fixtures = fs.readdirSync(fixDir).filter(f => f.endsWith('.json'))
  .map(f => JSON.parse(fs.readFileSync(path.join(fixDir, f), 'utf8')));

// ---- 1. 自我測試：把 fixture 弄壞，抽取必須跟著壞掉 ----
// 若下面任何一種破壞後「結果照樣正確」，代表這支測試根本沒在驗東西。
(function selfTest() {
  const base = JSON.parse(JSON.stringify(fixtures[0]));
  const mutants = [
    ['拿掉 Pin Functions 標題', p => { p.pages[0] = p.pages[0].filter(i => !/Pin Functions/i.test(i[3])); }],
    // 註：拿掉單一個表頭標籤不算破壞——欄位是從內容的 x 分群推出來的，
    // 少一個標籤本來就該照樣抽得到。要表頭全沒了，才該找不到表。
    ['拿掉所有表頭標籤', p => { p.pages[0] = p.pages[0].filter(i => !/^(NAME|NO\.|PIN|TYPE|DESCRIPTION)$/.test(i[3].trim())); }],
    ['把腳號欄的 x 移到描述欄', p => { p.pages[0].forEach(i => { if (/^[1-8]$/.test(i[3]) && i[0] < 100) i[0] = 300; }); }],
    ['刪掉一半的腳位列', p => { p.pages[0] = p.pages[0].filter(i => !/^(GND2|OUTN|OUTP|VDD2)$/.test(i[3].trim())); }]
  ];
  mutants.forEach(([label, mutate]) => {
    const p = JSON.parse(JSON.stringify(base));
    mutate(p);
    const r = PinExtract.extract(p.pages);
    const same = r.ok && r.pins.length === base.expect.pins.length &&
      r.pins.every((pin, i) => pin.num === base.expect.pins[i].num && pin.name === base.expect.pins[i].name);
    ok(!same, '自我測試「' + label + '」：弄壞之後結果應該不一樣，但抽出來一模一樣');
  });
})();

// ---- 2. 真 fixture：抽出來的腳位要跟人工核對過的答案一致 ----
fixtures.forEach(fx => {
  const r = PinExtract.extract(fx.pages);
  console.log('\n' + fx.part + '：' + (r.ok ? '抽到 ' + r.pins.length + ' 腳' : '失敗') +
    (r.warnings.length ? '｜警告 ' + r.warnings.length : ''));
  ok(r.ok, fx.part + ' 應該抽得到腳位');
  eq(r.pins.length, fx.expect.pins.length, fx.part + ' 腳數');
  fx.expect.pins.forEach((want, i) => {
    const got = r.pins[i] || {};
    eq(got.num, want.num, fx.part + ' 第 ' + (i + 1) + ' 列腳號');
    eq(got.name, want.name, fx.part + ' 第 ' + (i + 1) + ' 列腳名');
  });
  // 舊 parser 的招牌垃圾：頁尾版權年份、章節標題、Thermal Pad 說明文字
  const junk = r.pins.filter(p => /^(Texas|Thermal|Application|Copyright|Submit|Product)$/i.test(p.name) || +p.num > 500);
  eq(junk.length, 0, fx.part + ' 不該抽到頁尾/章節標題那種垃圾');
});

// ---- 3. 抽不到的時候要明講，不要吐半成品 ----
(function failLoudly() {
  const empty = PinExtract.extract([[[10, 700, 8, 'This datasheet is a scanned image']]]);
  eq(empty.ok, false, '沒有 Pin Functions 表時 ok 必須是 false');
  eq(empty.pins.length, 0, '沒有 Pin Functions 表時不准回傳腳位');
  ok(empty.warnings.length > 0, '失敗時要給得出原因');
})();

console.log('\npin-extract.test: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
