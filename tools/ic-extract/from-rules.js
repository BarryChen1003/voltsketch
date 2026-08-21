/**
 * from-rules.js — 用現有的規則引擎產生「宣稱」(claims)。
 *
 * 用途有兩個：
 *   1) 讓現在的規則產出也能被驗證器覆核（不是只有模型需要被查）
 *   2) 當基準線：日後換別的引擎時，拿同一批 datasheet 比「抽到幾項 / 驗過幾項」
 *
 * 只有走 findNum()/findRange() 的參數帶得出出處（src），其餘（封裝、介面、內建上拉…）
 * 目前沒有出處可驗，會另外列在 noQuote 裡 —— 不混進通過率，免得數字好看但不誠實。
 */
'use strict';
const DS = require('../../ds-compare.js');
const { flat } = require('./verify.js');

/** 值落在哪一頁：拿出處原文列回頭在每頁裡找 */
function pageOf(src, flatPages) {
  const q = flat(src);
  if (!q) return null;
  const i = flatPages.findIndex(p => p.indexOf(q) >= 0);
  return i < 0 ? null : i + 1;
}

/**
 * @param pages string[] 每頁文字
 * @param fileName 用來辨識料號
 * @returns { part, mfr, claims, noQuote }
 */
function claimsFromRules(pages, fileName) {
  const text = pages.join('\n');
  const parsed = DS.parse(text, fileName);
  const flatPages = pages.map(flat);
  const claims = [], noQuote = [];

  DS.RULES.forEach(r => {
    const p = parsed.params[r.key];
    if (!p) return;
    if (!p.src && !(p.srcList && p.srcList.length)) { noQuote.push({ key: r.key, value: p.value }); return; }
    // srcList = 好幾列共同支撐一個判斷（多封裝、介面清單、內建功能清單）
    const c = p.srcList && p.srcList.length
      ? { key: r.key, value: p.value, quotes: p.srcList, page: pageOf(p.srcList[0], flatPages) }
      : { key: r.key, value: p.value, quote: p.src, page: pageOf(p.src, flatPages) };
    if (p.n !== undefined) c.n = p.n;
    if (p.lo !== undefined) { c.lo = p.lo; c.hi = p.hi; }
    if (p.srcTag) c.srcTag = p.srcTag;
    // IOH 在 datasheet 是負值，規則存的是絕對值 —— 要告訴驗證器，否則正負對不起來
    if (p.abs) c.absolute = true;
    // 顯示值常帶單位或括號說明（「1.5 µA」「-40 ~ 85 °C」），文字比對會失敗，
    // 但這幾類本來就是靠數字驗，不是靠字面
    if (c.n !== undefined || c.lo !== undefined) c.textFree = true;
    claims.push(c);
  });

  return { part: parsed.part, mfr: parsed.mfr, chars: parsed.chars, warn: parsed.warn, claims, noQuote };
}

module.exports = { claimsFromRules, pageOf };
