/**
 * ci-parity-check.js — NEW-SESSION.md §6 的檢查清單與 .github/workflows/ci.yml 必須一致
 *
 * 為什麼要有這支：2026-08-27 新增的 18 支測試本機 §6 一直有跑，但一支都沒進 ci.yml——
 * 本機全綠，push 上去根本不擋。清單型的東西靠「記得同時改兩個地方」一定會漂。
 *
 * 為什麼不是一行 node -e：2026-08-28 第一版就是寫在 §6 裡的一行指令，
 * 而它用 `indexOf('## 6. 檢查')` 找章節——結果找到的是**自己那行指令裡的字串**，
 * 掃出 0 支測試，然後開心地回報「CI 缺：無」。**假通過比沒有檢查更糟**。
 * 所以：章節用行首標題比對，而且掃到 0 支就當失敗。
 *
 * 用法：node ci-parity-check.js
 * 過 = exit 0；有落差或掃不到東西 = exit 1。
 */
'use strict';
const fs = require('fs');

const MIN_EXPECTED = 40;   // §6 目前 60+ 支；掉到這個數以下代表解析壞了，不是真的變少

function section(md, startRe, endRe) {
  const lines = md.split('\n');
  let a = -1, b = lines.length;
  for (let i = 0; i < lines.length; i++) {
    if (a < 0) { if (startRe.test(lines[i])) a = i + 1; }
    else if (endRe.test(lines[i])) { b = i; break; }
  }
  return a < 0 ? '' : lines.slice(a, b).join('\n');
}

const md = fs.readFileSync(__dirname + '/NEW-SESSION.md', 'utf8');
const yml = fs.readFileSync(__dirname + '/.github/workflows/ci.yml', 'utf8');

// 章節標題只認**行首**的 `## 6.` / `## 7.`，內文提到的不算
const sec = section(md, /^## 6\./, /^## 7\./);
const RE = /^node ([A-Za-z0-9_.-]+\.m?js)/gm;
const doc = [...new Set([...sec.matchAll(RE)].map(m => m[1]))];
const ci = new Set([...yml.matchAll(/node ([A-Za-z0-9_.-]+\.m?js)/g)].map(m => m[1]));

let bad = 0;
if (doc.length < MIN_EXPECTED) {
  console.error(`FAIL: §6 只掃到 ${doc.length} 支（預期 ≥${MIN_EXPECTED}）——解析壞了，不是清單真的變短`);
  bad = 1;
}
const missing = doc.filter(f => !ci.has(f));
if (missing.length) {
  console.error(`FAIL: §6 有、ci.yml 沒有（push 上去不會擋）：\n  ${missing.join('\n  ')}`);
  bad = 1;
}
// 反向：CI 跑的檔案要真的存在，否則 CI 會在那一步紅得莫名其妙
const gone = [...ci].filter(f => !fs.existsSync(__dirname + '/' + f));
if (gone.length) {
  console.error(`FAIL: ci.yml 指到不存在的檔：${gone.join(', ')}`);
  bad = 1;
}

if (!bad) console.log(`ci-parity: §6 ${doc.length} 支｜ci.yml ${ci.size} 支｜完全一致`);
process.exit(bad);
