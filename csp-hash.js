#!/usr/bin/env node
/**
 * csp-hash.js — 把每段 inline <script> 的 SHA-256 寫進 _headers 的 script-src
 *
 * 為什麼要這支（D1 資安總檢的延伸）：
 *   原本 script-src 帶著 'unsafe-inline'，意思是「頁面裡直接寫的任何 <script> 都可以跑」。
 *   瀏覽器分不出哪一段是我們寫的、哪一段是攻擊者注入的——兩者都是 inline。
 *   所以那條 CSP 擋得住「從外部網域載入腳本」，擋不住「注入的程式碼直接執行」。
 *
 *   拿掉 'unsafe-inline' 有三種做法：nonce（靜態代管發不了每次不同的值）、
 *   把 inline 全部搬進獨立檔案（要動 15 段、11 個頁面），或是 hash。
 *   這支走 hash：把每段的雜湊列進 CSP，只有內容完全吻合的才准執行。
 *   注入進來的內容雜湊對不上，就跑不起來。
 *
 * 代價（必須知道，否則會出現「改完上線發現整頁壞掉」）：
 *   **任何一段 inline script 改一個字，雜湊就失效，那段就不會執行。**
 *   所以改完 HTML 一定要重跑這支。CI 有 --check 會擋住忘記重跑的情況。
 *
 * 用法：
 *   node csp-hash.js           更新 _headers
 *   node csp-hash.js --check   只檢查是否為最新（CI 用；不符回 exit 1）
 */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = __dirname;
const check = process.argv.includes('--check');

// 與 .assetsignore 一致：這些路徑不會被部署，不必納入
const NOT_DEPLOYED = [/^Ref[\\/]/, /^tools[\\/]/, /^supabase[\\/]/, /^node_modules[\\/]/,
  /^\.git[\\/]/, /^\.github[\\/]/, /^\.claude[\\/]/, /^hardware-knowledge-site[\\/]/,
  /^knowledge-db[\\/]/, /^knowledge-assets[\\/]/, /^hardware-pdfs[\\/]/];

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

// 抓可執行的 inline <script>：有 src 的不算（那是外部檔），
// ld+json 是資料區塊、瀏覽器不執行，也不需要雜湊。
const INLINE = /<script(?![^>]*\ssrc=)([^>]*)>([\s\S]*?)<\/script>/gi;
const isDataBlock = (attrs) => /type\s*=\s*["'](application\/ld\+json|application\/json|text\/template)["']/i.test(attrs);

const pages = walk(root).sort();
const hashes = new Map();   // hash → [檔案]
let count = 0;
const inlineHandlers = [];

for (const rel of pages) {
  const src = fs.readFileSync(path.join(root, rel), 'utf8');
  for (const m of src.matchAll(INLINE)) {
    if (isDataBlock(m[1])) continue;
    // CSP 的雜湊算的是「元素內的原始文字」，一個位元組都不能差
    const h = 'sha256-' + crypto.createHash('sha256').update(m[2], 'utf8').digest('base64');
    if (!hashes.has(h)) hashes.set(h, []);
    hashes.get(h).push(rel);
    count++;
  }
  // inline 事件處理器（onclick=…）雜湊蓋不到，只有 'unsafe-hashes' 能放行。
  // 與其開那個口子，不如改成 addEventListener。
  //
  // 掃之前要先把 <script> 區塊與 HTML 註解拿掉：第一版沒拿掉，結果把
  // 程式碼註解裡「原本是 onclick="…"」這種說明文字當成真的屬性抓出來。
  const markupOnly = src
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');
  for (const m of markupOnly.matchAll(/\son(?:click|change|input|load|error|submit|keydown|mouseover)\s*=\s*["']/gi)) {
    inlineHandlers.push(rel);
  }
}

if (inlineHandlers.length) {
  console.log('FAIL: 還有 inline 事件處理器，雜湊蓋不到它們：');
  [...new Set(inlineHandlers)].forEach((f) => console.log('  ' + f));
  console.log('請改成 addEventListener。');
  process.exit(1);
}

const list = [...hashes.keys()].sort();
const hashPart = list.map((h) => `'${h}'`).join(' ');

const headersPath = path.join(root, '_headers');
let headers = fs.readFileSync(headersPath, 'utf8');
const cspLine = headers.split(/\r?\n/).find((l) => /Content-Security-Policy:/i.test(l));
if (!cspLine) { console.log('FAIL: _headers 裡找不到 Content-Security-Policy'); process.exit(1); }

const newScriptSrc = `script-src 'self' https://static.cloudflareinsights.com ${hashPart}`;
const updated = cspLine.replace(/script-src [^;]*/, newScriptSrc);

if (check) {
  if (cspLine.trim() === updated.trim()) {
    console.log(`csp-hash: ${count} 段 inline script（${list.length} 個相異雜湊）｜_headers 是最新的`);
    console.log('OK');
    process.exit(0);
  }
  console.log('FAIL: _headers 的 script-src 雜湊與目前的 inline script 不符。');
  console.log('       有人改了 inline script 但沒重跑 `node csp-hash.js`。');
  console.log('       不修的話，那幾段上線後會被 CSP 擋掉、整頁功能停擺。');
  process.exit(1);
}

if (cspLine.trim() === updated.trim()) {
  console.log(`csp-hash: ${count} 段 inline script（${list.length} 個相異雜湊）｜已是最新，未變更`);
  process.exit(0);
}
headers = headers.replace(cspLine, updated);
fs.writeFileSync(headersPath, headers);
console.log(`csp-hash: ${count} 段 inline script（${list.length} 個相異雜湊）→ 已寫入 _headers`);
list.forEach((h, i) => console.log(`  ${String(i + 1).padStart(2)}  ${h}  ${hashes.get(h).join(', ')}`));
