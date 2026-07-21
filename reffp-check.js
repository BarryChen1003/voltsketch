/**
 * reffp-check.js — 公版 footprint 解析器程式化檢查（node reffp-check.js）
 * 驗：覆蓋率、pad 幾何健全（NaN/零尺寸/編號重複）、pad 不離 body 過遠、指標料件 pad 數。
 * 過 = exit 0；任何 FAIL = exit 1。
 */
'use strict';
global.window = {};
// i18n 不載（需 DOM）；FootprintGen 的 T() 無 I18N 時回 key，不影響幾何檢查
try { require('./ic-data.js'); } catch (e) { console.log('ic-data 載入失敗：' + e.message); }
require('./footprint-gen.js');
require('./parts-lib.js');
require('./pcb-refboards.js');
require('./pcb-ref-fp.js');

const boards = window.PCB_REFBOARDS || [];
let fails = 0, warns = 0;
const FAIL = m => { console.log('FAIL ' + m); fails++; };
const WARN = m => { console.log('warn ' + m); warns++; };

// 指標料件：part pattern → 期望 pad 數（含 EP/殼）
const EXPECT = [
  [/^RP2040$/, 57], [/W25Q16/, 8], [/AT24C16/, 8], [/^ATmega328P/, 32], [/ATmega16U2/, 33],
  [/DDR3/, 96], [/eMMC/, 153], [/i\.MX6Q/, 624], [/UEXT/, 10], [/USB-C/, 20],
  [/ESP32-WROOM/, 39], [/HDMI/, 23], [/ICSP/, 6], [/M3 mount/, 1], [/NCP1117/, 4]
];

const stats = { total: 0, withPads: 0, byKind: {} };
const misses = [];

for (const b of boards) {
  for (const c of (b.components || [])) {
    stats.total++;
    stats.byKind[c.kind] = stats.byKind[c.kind] || { n: 0, ok: 0 };
    stats.byKind[c.kind].n++;
    const r = window.RefFP.resolve(c);
    const tag = `${b.id}/${c.ref} (${c.part})`;
    if (!r || !r.ok) { misses.push(tag + (r && r.reason ? ' — ' + r.reason : '')); continue; }
    stats.withPads++;
    stats.byKind[c.kind].ok++;

    // 幾何健全
    if (!(r.body.w > 0) || !(r.body.h > 0) || isNaN(r.body.w) || isNaN(r.body.h)) FAIL(tag + ' body 尺寸壞：' + JSON.stringify(r.body));
    const seen = new Set();
    const maxR = Math.max(r.body.w, r.body.h) * 1.2 + 3; // pad 允許略出 body（翼腳/殼腳）
    for (const p of r.pads) {
      if ([p.x, p.y, p.w, p.h].some(v => typeof v !== 'number' || isNaN(v))) { FAIL(tag + ` pad ${p.num} NaN 座標/尺寸`); break; }
      if (!(p.w > 0) || !(p.h > 0)) { FAIL(tag + ` pad ${p.num} 尺寸 ≤0`); break; }
      if (seen.has(p.num)) { FAIL(tag + ` pad 編號重複：${p.num}`); break; }
      seen.add(p.num);
      if (Math.abs(p.x) > maxR || Math.abs(p.y) > maxR) { FAIL(tag + ` pad ${p.num} 離 body 過遠 (${p.x},${p.y}) body ${r.body.w}×${r.body.h}`); break; }
      if (p.type === 'thru_hole' && !(p.drill > 0)) { FAIL(tag + ` pad ${p.num} THT 無鑽孔`); break; }
      if (p.drill > 0 && p.type !== 'np_thru_hole' && p.drill >= Math.min(p.w, p.h)) { FAIL(tag + ` pad ${p.num} 鑽孔 ≥ pad（環寬 ≤0）`); break; }
    }

    // 指標 pad 數
    for (const [re, n] of EXPECT)
      if (re.test(String(c.part)) && r.pads.length !== n)
        FAIL(tag + ` pad 數 ${r.pads.length} ≠ 期望 ${n}`);
  }
}

console.log('--- 覆蓋率 ---');
for (const [k, v] of Object.entries(stats.byKind)) console.log(`${k}: ${v.ok}/${v.n}`);
console.log(`總計: ${stats.withPads}/${stats.total}`);
if (misses.length) { console.log('--- 未配到 footprint ---'); misses.forEach(m => console.log('  ' + m)); }

// 覆蓋率門檻：ic/passive/conn 100%（mech 也應 100%，全都有 builder）
if (stats.withPads !== stats.total) FAIL(`覆蓋率 ${stats.withPads}/${stats.total}，有料件沒配到`);

console.log(fails ? `\nFAIL ×${fails}（warn ×${warns}）` : `\nPASS（warn ×${warns}）`);
process.exit(fails ? 1 : 0);
