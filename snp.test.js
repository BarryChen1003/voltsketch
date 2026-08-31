/**
 * snp.test.js — Touchstone S 參數解析（snp.js）
 *
 * 這個格式最惡的錯是**靜靜給錯東西**：2 埠檔案的行順序是 S11 S21 S12 S22，
 * 照直覺讀成 S11 S12 S21 S22，畫出來的插入損耗其實是反射損耗——曲線形狀依然
 * 「看起來很合理」，沒有人會發現。所以第 2 節整節在守那個換位。
 *
 * 其餘守的是格式的三種變體（MA/DB/RI）、四種頻率單位、註解與續行，
 * 以及壞檔案要**明確報錯**而不是回一半資料。
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

const fs = require('fs');
const path = require('path');
const S = require('./snp.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL: ' + m); } };
const eq = (a, b, m) => ok(a === b, `${m} (得 ${JSON.stringify(a)}，期望 ${JSON.stringify(b)})`);
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m} (得 ${a}，期望 ${b}±${tol})`);

// ---- 1. 選項行與單位 ----
{
  const r = S.parse('# MHZ S RI R 75\n100 0.1 0\n', 'x.s1p');
  eq(r.ports, 1, '1.1 檔名推埠數');
  eq(r.z0, 75, '1.2 參考阻抗');
  eq(r.freqs[0], 100e6, '1.3 MHz 換算成 Hz');

  eq(S.parse('# GHZ S MA R 50\n1 1 0\n', 'a.s1p').freqs[0], 1e9, '1.4 GHz');
  eq(S.parse('# KHZ S MA R 50\n1 1 0\n', 'a.s1p').freqs[0], 1000, '1.5 kHz');
  eq(S.parse('# HZ S MA R 50\n1 1 0\n', 'a.s1p').freqs[0], 1, '1.6 Hz');
  // 沒有選項行是合法的，要用標準預設（GHz / S / MA / 50Ω）
  const dflt = S.parse('1 1 0\n', 'a.s1p');
  eq(dflt.freqs[0], 1e9, '1.7 沒有選項行用預設 GHz');
  eq(dflt.z0, 50, '1.8 沒有選項行用預設 50Ω');
}

// ---- 2. 2 埠的行順序（S11 S21 S12 S22）----
{
  // 刻意讓四個值都不一樣，換位錯了一定看得出來
  const txt = [
    '! 測試檔',
    '# GHZ S RI R 50',
    '1.0  0.1 0   0.7 0   0.3 0   0.2 0'
  ].join('\n');
  const r = S.parse(txt, 'dut.s2p');
  eq(r.ports, 2, '2.1 2 埠');
  near(r.s[0][0][0].re, 0.1, 1e-12, '2.2 S11 = 第一組');
  near(r.s[0][1][0].re, 0.7, 1e-12, '2.3 **S21 = 第二組**（不是 S12）');
  near(r.s[0][0][1].re, 0.3, 1e-12, '2.4 **S12 = 第三組**');
  near(r.s[0][1][1].re, 0.2, 1e-12, '2.5 S22 = 第四組');
  // series() 也要跟著對：插入損耗拿的是 S21
  near(S.series(r, 2, 1)[0], 20 * Math.log10(0.7), 1e-9, '2.6 series(2,1) 是插入損耗');
  near(S.series(r, 1, 2)[0], 20 * Math.log10(0.3), 1e-9, '2.7 series(1,2) 是反向傳輸');
}

// ---- 3. 三種數值格式 ----
{
  const ri = S.parse('# GHZ S RI R 50\n1 0 -1\n', 'a.s1p').s[0][0][0];
  near(ri.re, 0, 1e-12, '3.1 RI 實部');
  near(ri.im, -1, 1e-12, '3.2 RI 虛部');

  const ma = S.parse('# GHZ S MA R 50\n1 0.5 90\n', 'a.s1p').s[0][0][0];
  near(ma.re, 0, 1e-9, '3.3 MA：角度 90° 的實部是 0');
  near(ma.im, 0.5, 1e-9, '3.4 MA 幅值');

  const db = S.parse('# GHZ S DB R 50\n1 -6.0206 0\n', 'a.s1p').s[0][0][0];
  near(db.re, 0.5, 1e-4, '3.5 DB：-6.02dB ≈ 幅值 0.5');
  near(S.db(db), -6.0206, 1e-3, '3.6 db() 換回去要一致');
}

// ---- 4. 註解、續行、多埠 ----
{
  const txt = [
    '!整行註解',
    '# GHZ S RI R 50',
    '1.0 0.1 0 0.2 0 0.3 0   ! 行尾註解',
    '    0.4 0 0.5 0 0.6 0',
    '    0.7 0 0.8 0 0.9 0'
  ].join('\n');
  const r = S.parse(txt, 'x.s3p');
  eq(r.ports, 3, '4.1 3 埠');
  eq(r.freqs.length, 1, '4.2 折成三行仍是一個頻點');
  near(r.s[0][2][2].re, 0.9, 1e-12, '4.3 續行讀得完整（S33）');
  // 3 埠不做 2 埠那個換位，S12 就是第二組
  near(r.s[0][0][1].re, 0.2, 1e-12, '4.4 3 埠不套用 2 埠換位');
}

// ---- 5. 壞檔案要報錯，不可以回一半 ----
{
  const boom = (txt, name, why) => {
    try { S.parse(txt, name); ok(false, why + '（應該要 throw，卻回了結果）'); }
    catch (e) { ok(true, why); }
  };
  boom('', 'a.s2p', '5.1 空檔');
  boom('# GHZ S MA R 50\n1 0.5 abc\n', 'a.s1p', '5.2 非數字');
  boom('# GHZ S MA R 50\n1 0.5 0 0.5\n', 'a.s2p', '5.3 欄位數不整除（缺一半資料）');
  boom('# GHZ Z MA R 50\n1 0.5 0\n', 'a.s1p', '5.4 Z 參數不硬轉成 S');
  boom('[Version] 2.0\n# GHZ S MA R 50\n1 0.5 0\n', 'a.s2p', '5.5 Touchstone v2 明確不支援');
  // 檔名沒有 .sNp 時用欄位數反推；反推不出來也要報錯
  boom('# GHZ S MA R 50\n1 0.5 0 0.4 0\n', 'noext', '5.6 埠數推不出來');
}

// ---- 6. 摘要 ----
{
  const txt = [
    '# GHZ S DB R 50',
    '1.0  -20 0   -0.5 0   -0.5 0   -20 0',
    '2.0  -15 0   -1.0 0   -1.0 0   -15 0',
    '3.0  -10 0   -4.0 0   -4.0 0   -10 0'
  ].join('\n');
  const r = S.parse(txt, 'cable.s2p');
  const sum = S.summary(r);
  eq(sum.ports, 2, '6.1 埠數');
  eq(sum.points, 3, '6.2 頻點數');
  eq(sum.fMin, 1e9, '6.3 起始頻率');
  eq(sum.fMax, 3e9, '6.4 結束頻率');
  near(sum.worstS11, -10, 1e-6, '6.5 最差回波損耗＝阻抗最不匹配那點');
  eq(sum.worstS11Freq, 3e9, '6.6 最差點的頻率');
  // -3dB：起點 -0.5dB，門檻 -3.5dB，落在 2→3GHz 之間（線性內插）
  ok(sum.f3dB > 2e9 && sum.f3dB < 3e9, '6.7 -3dB 頻寬要內插，不是直接回跌破的那一點');

  const one = S.summary(S.parse('# GHZ S DB R 50\n1 -12 0\n', 'ant.s1p'));
  eq(one.f3dB, undefined, '6.8 單埠沒有插入損耗，不可以硬給 -3dB');
  near(one.worstS11, -12, 1e-9, '6.9 單埠仍有回波損耗');
}

// ---- 7. 顯示用格式 ----
{
  eq(S.fmtFreq(2.4e9), '2.400 GHz', '7.1 GHz');
  eq(S.fmtFreq(100e6), '100.0 MHz', '7.2 MHz（大於 10MHz 用一位小數，多的位數是雜訊）');
  eq(S.fmtFreq(1500), '1.5 kHz', '7.3 kHz');
  eq(S.fmtFreq(NaN), '—', '7.4 NaN 要有明確顯示，不可以是 "NaN Hz"');
}

// ---- 8. 真的接上畫面 ----
{
  const html = fs.readFileSync(path.join(__dirname, 'pcb.html'), 'utf8');
  ok(html.indexOf('snp.js') > 0, '8.1 pcb.html 有載入 snp.js');
  ok(html.indexOf('snpFile') > 0, '8.2 有檔案選擇入口');
  const ui = fs.readFileSync(path.join(__dirname, 'snp-ui.js'), 'utf8');
  ok(ui.indexOf('Snp.parse') > 0, '8.3 UI 走同一支解析器（不可以自己再寫一份）');
}

console.log(`\nsnp.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
