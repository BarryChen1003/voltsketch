/**
 * odb-verify.js — 解開的 ODB++ 資料夾自我檢查
 *
 * 用法：
 *   node tools/odb-verify.js "C:\\Users\\User\\Downloads\\hardwareai-odbpp\\hardwareai"
 *
 * 這支檢查的是**結構與自洽**，不是「板廠打得開」。兩者的差別很重要：
 * 結構過了只代表這包沒有明顯壞掉；真正算數的仍然是拿 CAM 軟體開一次
 * （VERIFY-EXPORTS.md 第 2 節）。所以最後一行會把這句話印出來，
 * 免得有人拿「檢查全過」當成送廠沒問題。
 *
 * 抓得到的錯（都是「打得開但是錯的」那一類）：
 *   - matrix 列了某層，但 layers/ 底下沒有那個資料夾（CAM 會顯示空層）
 *   - 反過來：有資料夾但 matrix 沒列（CAM 直接看不到那一層）
 *   - features 用了沒有定義的符號 $n（形狀變成未知，多數 CAM 靜靜跳過）
 *   - 座標超出板框（單位或縮放錯了最典型的症狀）
 *   - profile 沒有封閉（板廠退件的常見原因）
 *   - drill 層的 START_NAME/END_NAME 指到不存在的層（盲埋孔跨層寫錯）
 *
 * 過 = exit 0；有錯 = exit 1（警告不影響 exit code）。
 */
'use strict';

const fs = require('fs');
const path = require('path');

const root = process.argv[2];
if (!root) {
  console.error('用法：node tools/odb-verify.js <解開後的 ODB++ 資料夾>');
  process.exit(2);
}

const errs = [], warns = [], notes = [];
const E = m => errs.push(m);
const W = m => warns.push(m);
const N = m => notes.push(m);

const rd = p => { try { return fs.readFileSync(p, 'utf8'); } catch (e) { return null; } };
const exists = p => fs.existsSync(p);
const num = v => { const n = parseFloat(v); return isFinite(n) ? n : null; };

// ---- 1. 必要檔案 ----
const matrixTxt = rd(path.join(root, 'matrix', 'matrix'));
if (!matrixTxt) E('缺 matrix/matrix（CAM 靠它知道有哪些層、順序如何）');
const infoTxt = rd(path.join(root, 'misc', 'info'));
if (!infoTxt) W('缺 misc/info（不致命，但板廠看不到單位與版本）');

// ---- 2. matrix 解析 ----
function blocks(txt, kind) {
  const out = [];
  const re = new RegExp(kind + '\\s*\\{([\\s\\S]*?)\\}', 'g');
  let m;
  while ((m = re.exec(txt || ''))) {
    const o = {};
    for (const line of m[1].split(/\r?\n/)) {
      const kv = /^\s*([A-Z_]+)=(.*)$/.exec(line);
      if (kv) o[kv[1]] = kv[2].trim();
    }
    out.push(o);
  }
  return out;
}

const steps = blocks(matrixTxt, 'STEP');
const layers = blocks(matrixTxt, 'LAYER');
if (!steps.length) E('matrix 裡沒有 STEP');
if (!layers.length) E('matrix 裡沒有 LAYER');

const stepNames = steps.map(s => String(s.NAME || '').toLowerCase()).filter(Boolean);
N('step：' + stepNames.join(', '));
N('matrix 列出 ' + layers.length + ' 層：' + layers.map(l => l.NAME + '(' + l.TYPE + ')').join(', '));

// ---- 3. 每個 step 的檔案 ----
for (const st of stepNames) {
  const sdir = path.join(root, 'steps', st);
  if (!exists(sdir)) { E('matrix 有 step「' + st + '」但 steps/ 底下沒有這個資料夾'); continue; }
  if (!exists(path.join(sdir, 'stephdr'))) W(st + '：缺 stephdr');

  // profile：板框。沒有或沒封閉，板廠會退件
  const prof = rd(path.join(sdir, 'profile'));
  if (!prof) {
    E(st + '：缺 profile（板框）——CAM 不知道板子外形');
  } else {
    const pts = [...prof.matchAll(/^O[BS]\s+(-?[\d.]+)\s+(-?[\d.]+)/gm)].map(m => [num(m[1]), num(m[2])]);
    if (pts.length < 3) E(st + '：profile 少於 3 個點，畫不出封閉外形');
    else {
      const a = pts[0], b = pts[pts.length - 1];
      const closed = Math.abs(a[0] - b[0]) < 1e-6 && Math.abs(a[1] - b[1]) < 1e-6;
      if (!closed) E(st + '：profile 沒有封閉（頭尾點不同）——板廠退件的常見原因');
      let area = 0;
      for (let i = 0; i < pts.length - 1; i++) area += pts[i][0] * pts[i + 1][1] - pts[i + 1][0] * pts[i][1];
      area = Math.abs(area) / 2;
      if (area <= 0) E(st + '：profile 面積是 0');
      else N(st + '：板框 ' + pts.length + ' 點、面積 ' + area.toFixed(1) + ' mm²');
      var profBox = pts.reduce((b2, p) => ({
        minx: Math.min(b2.minx, p[0]), maxx: Math.max(b2.maxx, p[0]),
        miny: Math.min(b2.miny, p[1]), maxy: Math.max(b2.maxy, p[1])
      }), { minx: Infinity, maxx: -Infinity, miny: Infinity, maxy: -Infinity });
    }
  }

  // 層資料夾 ↔ matrix 雙向比對
  const ldir = path.join(sdir, 'layers');
  const onDisk = exists(ldir) ? fs.readdirSync(ldir).filter(d => fs.statSync(path.join(ldir, d)).isDirectory()) : [];
  const inMatrix = layers.map(l => String(l.NAME || '').toLowerCase());

  for (const l of layers) {
    const name = String(l.NAME || '').toLowerCase();
    // 元件層放在 components/ 不是 layers/——照 layers 找會誤報成缺檔。
    // （這條是寫這支工具時自己踩到的：第一版對著使用者真實的匯出包報了兩個假錯。）
    if (String(l.TYPE || '').toUpperCase() === 'COMPONENT') continue;
    const dir = path.join(ldir, name);
    if (!exists(dir)) { E(st + '：matrix 列了「' + l.NAME + '」但沒有 layers/' + name + '/（CAM 會顯示空層）'); continue; }
    const feat = rd(path.join(dir, 'features'));
    if (feat == null) { E(st + '/' + name + '：缺 features 檔'); continue; }

    // 符號表：$n 要先定義才能用。用了沒定義的符號，多數 CAM 靜靜跳過那一筆
    const defined = new Set([...feat.matchAll(/^\$(\d+)\s+\S+/gm)].map(m => m[1]));
    const used = new Set();
    let feats = 0, badCoord = 0, outside = 0;
    for (const line of feat.split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t[0] === '#' || t[0] === '$') continue;
      const m = /^([PLASTB])\s+(.*)$/.exec(t);
      if (!m) continue;
      feats++;
      const parts = m[2].split(/\s+/);
      // P/L 的座標在最前面；符號索引緊接其後
      const xs = parts.map(num).filter(v => v !== null);
      if (!xs.length) { badCoord++; continue; }
      const symIdx = /^P/.test(m[1]) ? 2 : (/^L/.test(m[1]) ? 4 : null);
      if (symIdx != null && parts[symIdx] != null && /^\d+$/.test(parts[symIdx])) used.add(parts[symIdx]);
      if (typeof profBox === 'object' && profBox && isFinite(profBox.minx)) {
        const pad = 5;   // 留一點餘裕：板框外的工具孔/靶標是合法的
        for (let i = 0; i + 1 < xs.length; i += 2) {
          const x = xs[i], y = xs[i + 1];
          if (x < profBox.minx - pad || x > profBox.maxx + pad || y < profBox.miny - pad || y > profBox.maxy + pad) { outside++; break; }
        }
      }
    }
    const missing = [...used].filter(u => !defined.has(u));
    if (missing.length) E(st + '/' + name + '：用了沒有定義的符號 $' + missing.join(', $'));
    if (badCoord) E(st + '/' + name + '：' + badCoord + ' 筆沒有可解析的座標');
    if (outside) W(st + '/' + name + '：' + outside + ' 筆座標落在板框外 5mm 以上（單位或縮放錯了最典型的症狀）');
    if (!feats) W(st + '/' + name + '：一筆 feature 都沒有（空層）');
    N(st + '/' + name + '：' + feats + ' 筆 feature、' + defined.size + ' 個符號');
  }

  for (const d of onDisk) {
    if (inMatrix.indexOf(d) < 0) E(st + '：有 layers/' + d + '/ 但 matrix 沒列——CAM 根本看不到這一層');
  }

  // 盲埋孔：drill 層的跨層名稱要真的存在
  for (const l of layers.filter(x => String(x.TYPE).toUpperCase() === 'DRILL')) {
    for (const k of ['START_NAME', 'END_NAME']) {
      const v = String(l[k] || '').toLowerCase();
      if (!v) { W(st + '：drill 層「' + l.NAME + '」沒有 ' + k + '（穿孔可以省，盲埋孔不行）'); continue; }
      if (inMatrix.indexOf(v) < 0) E(st + '：drill 層「' + l.NAME + '」的 ' + k + '=' + l[k] + ' 指到不存在的層');
    }
  }

  // 元件層：有列就要有檔
  for (const l of layers.filter(x => String(x.TYPE).toUpperCase() === 'COMPONENT')) {
    const f = path.join(sdir, 'components', String(l.NAME || '').toLowerCase());
    if (!exists(f)) { E(st + '：matrix 列了元件層「' + l.NAME + '」但 components/ 底下沒有'); continue; }
    const txt = rd(f) || '';
    const cmps = (txt.match(/^CMP\s+/gm) || []).length;
    N(st + '：' + l.NAME + ' 有 ' + cmps + ' 顆元件');
    if (!cmps) W(st + '：' + l.NAME + ' 一顆元件都沒有');
  }
}

// ---- 4. 單位一致 ----
if (infoTxt) {
  const u = /UNITS=(\w+)/.exec(infoTxt);
  N('misc/info 單位：' + (u ? u[1] : '(未寫)'));
  for (const st of stepNames) {
    const hdr = rd(path.join(root, 'steps', st, 'stephdr')) || '';
    const u2 = /UNITS=(\w+)/.exec(hdr);
    if (u && u2 && u[1] !== u2[1]) E('單位不一致：misc/info=' + u[1] + '，' + st + '/stephdr=' + u2[1]);
  }
}

// ---- 輸出 ----
console.log('ODB++ 結構檢查：' + root);
console.log('');
notes.forEach(m => console.log('  · ' + m));
if (warns.length) { console.log(''); warns.forEach(m => console.log('  ! ' + m)); }
if (errs.length) { console.log(''); errs.forEach(m => console.log('  ✕ ' + m)); }
console.log('');
console.log(errs.length ? ('結構有 ' + errs.length + ' 個問題（見上面 ✕）') : '結構檢查通過' + (warns.length ? '（有 ' + warns.length + ' 個警告）' : ''));
console.log('注意：這只檢查結構與自洽。**「板廠打得開」仍然只有真的 CAM 軟體開過才算**，見 VERIFY-EXPORTS.md 第 2 節。');
process.exit(errs.length ? 1 : 0);
