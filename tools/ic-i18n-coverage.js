#!/usr/bin/env node
/**
 * ic-i18n-coverage.js — IC 翻譯三條線的覆蓋率實測 + 待譯清單產生器。
 *
 * 用法（從 repo 任一處）：
 *   node tools/ic-i18n-coverage.js [outDir]
 *
 * 量三條線：
 *   1. 條目層 IC_I18N[part]（ic-i18n-data.js）
 *   2. pins[].desc 共享字串（ic-pin-i18n-data.js）
 *   3. secondSource 共享字串（ic-crit-i18n-data.js）
 *   2 與 3 共用同一個去重字典 IC_STR_I18N（= IC_PIN_I18N）。
 *
 * 產出（預設寫到 outDir，預設 = 本檔所在目錄）：
 *   pin-todo.json / ss-todo.json —— 未譯字串，**依出現次數降序**（先譯高頻最划算）。
 *
 * 同時驗字典完整性：每個 key 必須 en/ja/ko 齊，且不得混入簡體字。
 */
const fs = require('fs');
const path = require('path');

const WEB = path.resolve(__dirname, '..');
const outDir = process.argv[2] ? path.resolve(process.argv[2]) : __dirname;

global.window = { IC_I18N: {}, IC_PIN_I18N: {} };
const load = f => eval(fs.readFileSync(path.join(WEB, f), 'utf8'));
load('ic-data.js');
load('ic-i18n-data.js');
load('ic-pin-i18n-data.js');
load('ic-crit-i18n-data.js');

const data = window.IC_DATA;
const ENT = window.IC_I18N;
const STR = window.IC_PIN_I18N;

// --- 1. 條目層 ---
const entDone = data.filter(ic => ENT[ic.part]).length;

// --- 2/3. 共享字串（zh 原文 -> 出現次數）---
const collect = pick => {
  const m = new Map();
  data.forEach(ic => pick(ic).forEach(s0 => {
    const s = (s0 || '').trim();
    if (s) m.set(s, (m.get(s) || 0) + 1);
  }));
  return m;
};
const pinSet = collect(ic => (ic.pins || []).map(p => p.desc));
const ssSet = collect(ic => ic.secondSource || []);

const cov = m => {
  let done = 0, inst = 0, instDone = 0;
  const todo = [];
  for (const [s, n] of m) {
    inst += n;
    const t = STR[s];
    if (t && t.en && t.ja && t.ko) { done++; instDone += n; }
    else todo.push([s, n]);
  }
  todo.sort((a, b) => b[1] - a[1]); // 高頻優先
  return { total: m.size, done, inst, instDone, todo: todo.map(([s, n]) => ({ s, n })) };
};
const pc = cov(pinSet), sc = cov(ssSet);
const pct = (a, b) => b ? (a / b * 100).toFixed(1) + '%' : 'n/a';

console.log('=== IC entry i18n ===');
console.log(`  ${entDone}/${data.length} parts (${pct(entDone, data.length)})`);
console.log('=== pins[].desc (shared string dict) ===');
console.log(`  unique   ${pc.done}/${pc.total} (${pct(pc.done, pc.total)})  remaining ${pc.todo.length}`);
console.log(`  weighted ${pc.instDone}/${pc.inst} (${pct(pc.instDone, pc.inst)})  <- 實際腳位數`);
console.log('=== secondSource (shared string dict) ===');
console.log(`  unique   ${sc.done}/${sc.total} (${pct(sc.done, sc.total)})  remaining ${sc.todo.length}`);

// --- 字典完整性 ---
// 只列非日文新字型的簡化字，避免繁簡共用字假報（別加 阻/准/据/别/无/与 這類）
const SIMP = '电车网无关门线转组级这样说请读论应变压频继别';
let bad = 0, simp = 0;
for (const k of Object.keys(STR)) {
  const t = STR[k];
  for (const lang of ['en', 'ja', 'ko']) {
    const v = t[lang];
    if (typeof v !== 'string' || !v.trim()) { console.log('MISSING', lang, '|', k); bad++; continue; }
    for (const ch of SIMP) if (v.includes(ch)) { console.log('SIMP-HIT', lang, ch, '|', k); simp++; }
  }
}
console.log('=== shared dict ===');
console.log(`  keys ${Object.keys(STR).length} | missing-lang ${bad} | simplified ${simp}`, bad + simp === 0 ? 'OK' : 'FAIL');

fs.writeFileSync(path.join(outDir, 'pin-todo.json'), JSON.stringify(pc.todo, null, 1));
fs.writeFileSync(path.join(outDir, 'ss-todo.json'), JSON.stringify(sc.todo, null, 1));
console.log('wrote pin-todo.json, ss-todo.json ->', outDir);
process.exit(bad + simp === 0 ? 0 : 1);
