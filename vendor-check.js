#!/usr/bin/env node
/**
 * vendor-check.js — 兩件事的守衛（D1 資安總檢 D-4）：
 *   1. 會部署的頁面不准再從外部網域載入腳本或樣式。
 *   2. vendor/ 裡的檔案要跟 vendor/README.md 記錄的 SHA-256 相符。
 *
 * 為什麼要 (2)：自行代管的意義是「這份程式碼我看過、而且不會變」。
 * 沒有雜湊對照，vendor/ 就只是另一個沒人看管的目錄，
 * 誰改了一行、或升版時忘了更新來源紀錄，都不會有人發現。
 *
 * 跑法：node vendor-check.js [--strict]
 */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = __dirname;
const strict = process.argv.includes('--strict');
let problems = 0;
const fail = (msg) => { problems++; console.log('  ✗ ' + msg); };

// ---- 哪些路徑不會被部署（與 .assetsignore 一致）----
const NOT_DEPLOYED = [/^Ref[\\/]/, /^tools[\\/]/, /^supabase[\\/]/, /^node_modules[\\/]/, /^\.git[\\/]/];
const isDeployed = (rel) => !NOT_DEPLOYED.some((re) => re.test(rel));

// ---- 1) 外部資源掃描 ----
// 只看真的會去抓的東西：script src / link href。
// 內文裡的網址（canonical、og:url、說明文字）不算，那些不會執行。
const EXTERNAL = /<(?:script[^>]*\ssrc|link[^>]*\shref)\s*=\s*["'](https?:\/\/[^"']+)["']/gi;
// 例外：canonical/alternate 這類 rel 不會載入資源
const INERT_REL = /rel\s*=\s*["'](?:canonical|alternate|me|preconnect|dns-prefetch)["']/i;

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    const rel = path.relative(root, full);
    if (NOT_DEPLOYED.some((re) => re.test(rel))) continue;
    if (e.isDirectory()) walk(full, out);
    else if (/\.html$/.test(e.name)) out.push(rel);
  }
  return out;
}

const pages = walk(root);
let externalHits = 0;
for (const rel of pages) {
  const src = fs.readFileSync(path.join(root, rel), 'utf8');
  for (const m of src.matchAll(EXTERNAL)) {
    const tag = m[0];
    if (INERT_REL.test(tag)) continue;
    externalHits++;
    fail(rel + ' 仍從外部載入：' + m[1]);
  }
}

// ds-compare.js 會設定 pdf.js 的 worker 路徑，那也是一個載入點
const dsc = fs.readFileSync(path.join(root, 'ds-compare.js'), 'utf8');
const wm = dsc.match(/workerSrc\s*=\s*["']([^"']+)["']/);
if (wm && /^https?:\/\//.test(wm[1])) { externalHits++; fail('ds-compare.js 的 workerSrc 指向外部：' + wm[1]); }

// ---- 2) vendor/ 雜湊比對 ----
const vendorDir = path.join(root, 'vendor');
const readme = path.join(vendorDir, 'README.md');
let checked = 0;
if (!fs.existsSync(readme)) {
  fail('找不到 vendor/README.md —— 沒有它就沒有「應該長什麼樣」的依據');
} else {
  const md = fs.readFileSync(readme, 'utf8');
  const recorded = new Map();
  for (const m of md.matchAll(/\|\s*`([^`]+)`\s*\|\s*(\S+)\s*\|\s*`([0-9a-f]{64})`\s*\|/g)) {
    recorded.set(m[1], { url: m[2], sha: m[3] });
  }
  if (recorded.size === 0) fail('vendor/README.md 沒有任何雜湊紀錄');

  for (const [file, info] of recorded) {
    const p = path.join(vendorDir, file);
    if (!fs.existsSync(p)) { fail('README 記載了 ' + file + '，但檔案不存在'); continue; }
    const got = crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
    if (got !== info.sha) fail(file + ' 內容與 README 記錄的雜湊不符（被改過或升版沒更新紀錄）');
    else checked++;
  }
  // 反向：有檔案但沒紀錄
  for (const f of fs.readdirSync(vendorDir)) {
    if (!/\.js$/.test(f)) continue;
    if (!recorded.has(f)) fail('vendor/' + f + ' 沒有記在 README，來源不明');
  }
}

// ---- 3) 被引用的 vendor 檔要真的存在 ----
for (const rel of pages) {
  const src = fs.readFileSync(path.join(root, rel), 'utf8');
  for (const m of src.matchAll(/["']\.\/(vendor\/[^"']+)["']/g)) {
    if (!fs.existsSync(path.join(root, m[1]))) fail(rel + ' 引用了不存在的 ' + m[1]);
  }
}

console.log(`vendor-check: 掃 ${pages.length} 個會部署的頁面｜外部資源 ${externalHits} 個｜vendor 雜湊相符 ${checked} 個`);
if (problems === 0) { console.log('OK'); process.exit(0); }
console.log(`FAIL: ${problems} 個問題`);
process.exit(strict ? 1 : 0);
