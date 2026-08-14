/**
 * news-i18n-check.js — 硬體新技術資料的完整性檢查
 *
 * 守三件事：
 *   1. 四語齊全（硬規矩 6）：每則的 zh/en/ja/ko 都要有 title、summary、why。
 *   2. **每則都有出處**：url 是 http(s)、date 是 YYYY-MM 或 YYYY-MM-DD。
 *      沒有出處的條目一律不准進站——這站砍過兩批不可驗的內容。
 *   3. 欄位值合法：region 與 cat 只能用固定代碼（那是篩選用的值，翻譯了就篩不到）。
 *
 * 用法：node news-i18n-check.js [--strict]
 */
'use strict';

const LANGS = ['zh', 'en', 'ja', 'ko'];
const FIELDS = ['title', 'summary', 'why'];
const REGIONS = ['US', 'TW', 'CN', 'KR', 'JP'];
const CATS = ['power', 'semi', 'pcb', 'emc', 'circuit'];
// kind 決定「這則歸哪一次更新掃出來的」：news 每天、paper 每月 1 號。也是頁面上的第三個篩選軸。
const KINDS = ['news', 'paper'];

global.window = {};
require('./news-data.js');
const NEWS = global.window.NEWS || [];

const bad = [];
const ids = new Set();
let verified = 0;

for (const n of NEWS) {
  const at = n && n.id ? n.id : '(缺 id)';
  if (!n.id) bad.push('缺 id 的條目');
  else if (ids.has(n.id)) bad.push(`${at}: id 重複`);
  ids.add(n.id);

  if (!/^https?:\/\//.test(String(n.url || ''))) bad.push(`${at}: url 不是 http(s) 連結`);
  if (!/^\d{4}-\d{2}(-\d{2})?$/.test(String(n.date || ''))) bad.push(`${at}: date 要是 YYYY-MM 或 YYYY-MM-DD`);
  if (!n.source) bad.push(`${at}: 缺 source`);
  if (!REGIONS.includes(n.region)) bad.push(`${at}: region「${n.region}」不在 ${REGIONS.join('/')}`);
  if (!CATS.includes(n.cat)) bad.push(`${at}: cat「${n.cat}」不在 ${CATS.join('/')}`);
  if (!KINDS.includes(n.kind)) bad.push(`${at}: kind「${n.kind}」不在 ${KINDS.join('/')}`);
  if (typeof n.verified !== 'boolean') bad.push(`${at}: verified 要是 true/false`);
  if (n.verified) verified++;

  for (const l of LANGS) {
    const e = n[l];
    if (!e) { bad.push(`${at}: 缺 ${l}`); continue; }
    for (const f of FIELDS) {
      if (!e[f] || !String(e[f]).trim()) bad.push(`${at}: ${l}.${f} 是空的`);
    }
  }
}

// 依領域/地區統計，順便讓人看得出涵蓋面有沒有偏
const by = (key) => {
  const m = {};
  NEWS.forEach(n => { m[n[key]] = (m[n[key]] || 0) + 1; });
  return Object.entries(m).map(([k, v]) => `${k} ${v}`).join('、');
};

console.log(`硬體新技術：${NEWS.length} 則（已核對原文 ${verified}）`);
console.log(`  領域：${by('cat')}`);
console.log(`  地區：${by('region')}`);
console.log(`  類型：${by('kind')}`);
console.log(`  四語與出處：${bad.length ? bad.length + ' 項有問題' : '✓'}`);
bad.slice(0, 30).forEach(s => console.log('    ✗ ' + s));

if (process.argv.includes('--strict') && bad.length) {
  console.log('FAIL: 新技術資料不完整');
  process.exit(1);
}
console.log('OK');
