/**
 * build-ic-append.js — 驗證新 IC 條目並附加進 ic-data.js
 * 用法:
 *   node build-ic-append.js new-entries.json          # 只驗證（結構+重複+render）
 *   node build-ic-append.js new-entries.json --apply  # 驗證通過後寫入 ic-data.js
 * new-entries.json = 條目陣列，格式照 ic-data.js schema（KSZ9031RNX 為範本）。
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WEB = 'C:\\Users\\User\\Documents\\Web';
const IC_DATA = path.join(WEB, 'ic-data.js');
const SIDES = new Set(['L', 'R', 'T', 'B']);
const REQ_STR = ['part', 'mfr', 'category', 'subcategory', 'package', 'whatIs', 'func', 'usedIn', 'desc', 'datasheet'];

const file = process.argv[2];
const apply = process.argv.includes('--apply');
if (!file) { console.error('usage: node build-ic-append.js <entries.json> [--apply]'); process.exit(2); }

const entries = JSON.parse(fs.readFileSync(file, 'utf8'));
if (!Array.isArray(entries) || !entries.length) { console.error('FAIL: entries.json 必須是非空陣列'); process.exit(1); }

let src = fs.readFileSync(IC_DATA, 'utf8');
// 重複檢查用頂層 IC_DATA part（regex 會誤抓 dropIn 引用字串——TAS2120 曾因此假重複）
const existing = (() => {
  const g = { window: {} };
  new Function('window', src)(g.window);
  return new Set((g.window.IC_DATA || []).map(x => String(x.part).toUpperCase()));
})();

const errs = [];
for (const e of entries) {
  const tag = e.part || '(no part)';
  for (const k of REQ_STR) if (typeof e[k] !== 'string' || !e[k].trim()) errs.push(`${tag}: 欄位 ${k} 缺或空`);
  if (e.part && existing.has(e.part.toUpperCase())) errs.push(`${tag}: 已存在於 ic-data.js`);
  if (!Array.isArray(e.pins) || !e.pins.length) { errs.push(`${tag}: pins 缺`); continue; }
  const nums = new Set();
  for (const p of e.pins) {
    if (!p.num || !p.name || !p.side || !p.type) errs.push(`${tag} pin ${p.num || '?'}: num/name/side/type 缺一`);
    if (!SIDES.has(p.side)) errs.push(`${tag} pin ${p.num}: side=${p.side} 非 L/R/T/B`);
    if (typeof p.desc !== 'string' || !p.desc.trim()) errs.push(`${tag} pin ${p.num}: desc 缺`);
    if (nums.has(String(p.num))) errs.push(`${tag}: pin num ${p.num} 重複`);
    nums.add(String(p.num));
  }
  for (const k of ['specs', 'secondSource', 'dropIn']) if (e[k] !== undefined && !Array.isArray(e[k])) errs.push(`${tag}: ${k} 非陣列`);
  // 簡體字檢查（常見混入字）
  const zh = JSON.stringify(e);
  const simp = zh.match(/[们径设电动务处发无产从与线让复对时间韩国际级动态运两为这个书体]/g);
  if (simp) {
    const SIMP_ONLY = '们径设电动务处发无产从与线让复对时间为这体书'.split('');
    const hits = [...new Set(simp)].filter(c => '们设电务处发无产从与线让复对为这体书径动'.includes(c) && !'電動線對時間國際級'.includes(c));
    // 白名單：這些字繁簡同形常誤報，用保守清單
    const bad = [...new Set(simp)].filter(c => '们设务处发无产让复为这体书径'.includes(c));
    if (bad.length) errs.push(`${tag}: 疑似簡體字混入: ${bad.join(' ')}`);
  }
}
if (errs.length) { console.error('FAIL 結構驗證:'); errs.forEach(e => console.error('  - ' + e)); process.exit(1); }
console.log(`PASS 結構驗證: ${entries.length} 顆（${entries.map(e => e.part).join(', ')}），pins: ${entries.map(e => e.pins.length).join('/')}`);

if (apply) {
  const idx = src.lastIndexOf('\n];');
  if (idx < 0) { console.error('FAIL: 找不到檔尾 ];'); process.exit(1); }
  const blocks = entries.map(e => {
    const j = JSON.stringify(e, null, 2).split('\n').map(l => '  ' + l).join('\n');
    return j;
  }).join(',\n');
  src = src.slice(0, idx) + ',\n' + blocks + src.slice(idx);
  fs.writeFileSync(IC_DATA, src);
  execSync(`node --check "${IC_DATA}"`, { stdio: 'inherit' });
  console.log('PASS node --check');
}

// render 實測（apply 前用記憶體版，apply 後用檔案版）
global.window = global;
const dataSrc = apply ? fs.readFileSync(IC_DATA, 'utf8') : null;
eval(fs.readFileSync(IC_DATA, 'utf8'));
eval(fs.readFileSync(path.join(WEB, 'ic-symbol.js'), 'utf8'));
if (!apply) window.IC_DATA.push(...entries);
for (const e of entries) {
  const ic = window.IC_DATA.find(x => x.part === e.part);
  const sym = window.ICSymbol.render(ic);
  if (!sym || !sym.svg || !sym.svg.includes('<svg') || !sym.width || !sym.height) {
    console.error(`FAIL render: ${e.part}`); process.exit(1);
  }
  console.log(`PASS render: ${e.part} svg=${sym.svg.length}ch ${sym.width}x${sym.height} pins=${ic.pins.length}`);
}
const parts = window.IC_DATA.map(x => x.part);
console.log(`IC_DATA 總數: ${parts.length}（重複 part: ${parts.length - new Set(parts).size}）`);
