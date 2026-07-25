/**
 * circuit-check.js — 知識卡電路圖「接線塌陷」檢查（node）
 * 為什麼：圖由程式生成＋自動吸附（L() 兩端會吸到 12–14px 內的腳位/方塊邊）。
 *         當一條線的兩端被吸到同一個點，那條線就塌成零長度＝你要的接線根本沒畫出來。
 *         acdc-flyback 就是這樣斷了主軌與二次側地（另加 MOSFET D/S 接反，見該卡註解）。
 *
 * 只查一個高訊號、零誤報的缺陷：**零長線段**。
 * 刻意「不」查懸空端點／近距未接——符號內部本來就有大量合法自由端
 * （電容兩極板、接地三橫槓、二極體三角、MOSFET 閘極板），那種檢查誤報率 >90%，
 * 報了只會被忽略，不如不報。
 *
 * 零長線段不必然是壞掉（可能該接點已被別的符號的引線覆蓋，如 ground 自帶 stem），
 * 但每一個都值得人工看一眼 → 預設報告模式；--strict 時視為錯誤（給 CI）。
 */
'use strict';

global.window = {};
require('./schematic-symbols.js');
require('./knowledge-circuits2.js');
const ART = global.window.CIRCUITS2 || {};

function zeroLenSegs(svg) {
  const out = [];
  const re = /<line[^>]*x1="(-?[\d.]+)"[^>]*y1="(-?[\d.]+)"[^>]*x2="(-?[\d.]+)"[^>]*y2="(-?[\d.]+)"/g;
  let m;
  while ((m = re.exec(svg))) {
    const [x1, y1, x2, y2] = [+m[1], +m[2], +m[3], +m[4]];
    if (Math.hypot(x2 - x1, y2 - y1) < 0.5) out.push([x1, y1]);
  }
  return out;
}

const strict = process.argv.includes('--strict');
const ids = Object.keys(ART);
let total = 0;
const bad = [];
for (const id of ids) {
  let svg;
  try { svg = ART[id]().svg; } catch (e) { bad.push({ id, err: e.message }); continue; }
  const z = zeroLenSegs(svg);
  if (z.length) { total += z.length; bad.push({ id, pts: z }); }
}

console.log(`circuit-check: 掃 ${ids.length} 張圖，塌陷（零長）線段共 ${total} 條`);
if (bad.length) {
  console.log('');
  bad.forEach(r => {
    if (r.err) { console.log(`  ✗ ${r.id}: 產生失敗 ${r.err}`); return; }
    console.log(`  ~ ${r.id}: ${r.pts.length} 條 @ ${r.pts.map(p => `(${p})`).join(' ')}`);
  });
  console.log('\n說明：該處的接線被吸附塌成一點。多數要補 LR()（不吸附）或改接點；');
  console.log('      少數是多餘的線（該接點已被符號自帶引線覆蓋），刪掉即可。');
}
if (strict && (total || bad.some(b => b.err))) { console.log('\nFAIL（--strict）'); process.exit(1); }
console.log(total ? '\n（報告模式，不視為失敗）' : '\nOK：無塌陷線段');
process.exit(0);
