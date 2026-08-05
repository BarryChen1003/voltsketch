/**
 * symbol-overlap-check.js — 知識卡電路圖「元件疊在一起」檢查（node）
 *
 * 為什麼需要：wire-gap-check 管接線、svg-overlap-check 管文字，兩支都看不到
 *   「兩個元件符號互相壓在一起」。實際踩到的三種：
 *     1) 多相 VRM：兩顆輸出電容圓心只差 12px（極板寬 ±11）→ 整片重合
 *     2) 多相 VRM：電感跨 188..236，DrMOS 方塊右緣 192 → 電感戳進方塊
 *     3) 返馳式：MOSFET 框整塊壓在 bulk 電容的接地符號上
 *   放大 1.3 倍後這些才變明顯，但它們一直都在。
 *
 * 為什麼不能只用 bbox 相交：誤報一堆。
 *   - 橋式整流四顆二極體是旋轉 45° 擺的：外框互相咬到，圖形其實沒碰
 *   - LED 串相鄰二極體共用引線：引線本來就重疊（同一條線畫兩次）
 *   - 虛線框（「IC 內部」）刻意把元件包起來
 *
 * 判準（三條，都在原始座標上量；最外層那個純 scale 會被忽略）：
 *   A. 筆畫真交叉：A 的線段與 B 的線段「內部」相交（共端點、共線重疊不算）
 *      → 抓電感戳進方塊、接地壓在 MOSFET 上
 *   B. 方塊 vs 方塊：兩個 rect 只要疊超過 2px 就算錯（方塊永遠不該互疊）
 *   C. 符號 vs 符號／符號 vs 方塊：bbox 重疊面積 ≥ 較小者的 35%
 *      → 抓兩顆電容疊在一起；旋轉符號的角落互咬（<10%）與串接引線（~23%）不會中
 *   容器例外：一方完全被另一方包住（虛線框）→ 合法。
 *
 * 用法：
 *   node symbol-overlap-check.js             # 報告
 *   node symbol-overlap-check.js --selftest  # 證明三種缺陷抓得到、三種合法情形不誤報
 *   node symbol-overlap-check.js --strict    # CI：比 symbol-overlap-baseline.json 變差就 exit 1
 *   node symbol-overlap-check.js --update    # 重寫基線
 */
'use strict';

const fs = require('fs');

// ── 幾何小工具 ──
const I = [1, 0, 0, 1, 0, 0];
const mul = (m, n) => [
  m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1],
  m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3],
  m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]
];
const apply = (m, x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
function tmat(str) {
  let m = I, t;
  const re = /(translate|scale|rotate|matrix)\s*\(([^)]*)\)/g;
  while ((t = re.exec(str))) {
    const v = t[2].trim().split(/[\s,]+/).map(Number);
    if (t[1] === 'translate') m = mul(m, [1, 0, 0, 1, v[0] || 0, v.length > 1 ? v[1] : 0]);
    else if (t[1] === 'scale') m = mul(m, [v[0], 0, 0, v.length > 1 ? v[1] : v[0], 0, 0]);
    else if (t[1] === 'matrix') m = mul(m, v);
    else {
      const r = (v[0] || 0) * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
      const rot = [c, s, -s, c, 0, 0];
      m = v.length >= 3 ? mul(mul(mul(m, [1, 0, 0, 1, v[1], v[2]]), rot), [1, 0, 0, 1, -v[1], -v[2]]) : mul(m, rot);
    }
  }
  return m;
}
const attr = (s, n) => { const m = s.match(new RegExp(n + '="([^"]*)"')); return m ? m[1] : null; };
const num = (s, n) => { const v = attr(s, n); return v === null ? null : +v; };

/**
 * 解析成「元件清單」：每個元件有 type、線段集合、bbox。
 * 元件＝<g data-sym> 群組，或不在 data-sym 內的 <rect>（方塊圖的框）。
 * data-deco 群組（裝飾）整組跳過。
 */
function parseParts(svg) {
  const parts = [];
  let cur = null;                                   // 目前正在收集的元件
  const stack = [{ m: I, deco: false, depth: 0 }];
  const re = /<(\/?)([a-zA-Z]+)([^>]*?)(\/?)>/g;
  let t;
  const push = (seg) => { if (cur) cur.segs.push(seg); };
  while ((t = re.exec(svg))) {
    const close = t[1] === '/', tag = t[2], body = t[3], self = t[4] === '/';
    const top = stack[stack.length - 1];
    if (tag === 'g' || tag === 'svg') {
      if (close) {
        const popped = stack.pop();
        if (cur && popped && popped.opensPart) { parts.push(cur); cur = null; }
        continue;
      }
      let tr = attr(body, 'transform');
      // 最外層純 scale＝全圖統一放大 → 忽略，一律在原始座標上量
      if (tr && stack.length === 2 && /^\s*scale\([^)]*\)\s*$/.test(tr)) tr = null;
      const sym = attr(body, 'data-sym');
      const deco = top.deco || attr(body, 'data-deco') !== null;
      const opensPart = !!sym && !cur && !deco;
      if (opensPart) cur = { type: sym, segs: [] };
      stack.push({ m: tr ? mul(top.m, tmat(tr)) : top.m, deco, opensPart });
      if (self) { const p = stack.pop(); if (cur && p.opensPart) { parts.push(cur); cur = null; } }
      continue;
    }
    if (close) continue;
    const m = top.m;
    if (top.deco) continue;
    if (tag === 'line') {
      push([apply(m, num(body, 'x1'), num(body, 'y1')), apply(m, num(body, 'x2'), num(body, 'y2'))]);
    } else if (tag === 'polygon' || tag === 'polyline') {
      const pts = (attr(body, 'points') || '').trim().split(/\s+/).map(s => s.split(',').map(Number))
        .filter(p => p.length === 2 && p.every(Number.isFinite)).map(p => apply(m, p[0], p[1]));
      for (let i = 0; i + 1 < pts.length; i++) push([pts[i], pts[i + 1]]);
      if (tag === 'polygon' && pts.length > 2) push([pts[pts.length - 1], pts[0]]);
    } else if (tag === 'path') {
      const d = attr(body, 'd') || '';
      const nums = (d.match(/-?[\d.]+/g) || []).map(Number);
      const cmds = d.match(/[MLACQ]/g) || [];
      const pts = []; let i = 0;
      for (const c of cmds) {
        if (c === 'M' || c === 'L') { pts.push(apply(m, nums[i], nums[i + 1])); i += 2; }
        else if (c === 'A') { i += 5; pts.push(apply(m, nums[i], nums[i + 1])); i += 2; }
        else if (c === 'C') { i += 4; pts.push(apply(m, nums[i], nums[i + 1])); i += 2; }
        else if (c === 'Q') { i += 2; pts.push(apply(m, nums[i], nums[i + 1])); i += 2; }
      }
      for (let j = 0; j + 1 < pts.length; j++) push([pts[j], pts[j + 1]]);
    } else if (tag === 'rect') {
      const x = num(body, 'x'), y = num(body, 'y'), w = num(body, 'width'), h = num(body, 'height');
      if (![x, y, w, h].every(Number.isFinite)) continue;
      const p = [apply(m, x, y), apply(m, x + w, y), apply(m, x + w, y + h), apply(m, x, y + h)];
      const segs = [[p[0], p[1]], [p[1], p[2]], [p[2], p[3]], [p[3], p[0]]];
      if (cur) segs.forEach(push);                  // 符號自帶的框（如 Sym.ic）算符號的一部分
      else parts.push({ type: 'block', segs });     // 方塊圖的框
    }
  }
  if (cur) parts.push(cur);
  parts.forEach(p => { p.bbox = bboxOf(p.segs); });
  return parts.filter(p => p.segs.length);
}

function bboxOf(segs) {
  const xs = [], ys = [];
  segs.forEach(([a, b]) => { xs.push(a[0], b[0]); ys.push(a[1], b[1]); });
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}
const area = b => Math.max(0, b[2] - b[0]) * Math.max(0, b[3] - b[1]);
const inter = (a, b) => [Math.max(a[0], b[0]), Math.max(a[1], b[1]), Math.min(a[2], b[2]), Math.min(a[3], b[3])];
const contains = (a, b) => a[0] <= b[0] + 1 && a[1] <= b[1] + 1 && a[2] >= b[2] - 1 && a[3] >= b[3] - 1;

/** 線段「內部」相交（共端點、共線重疊都不算）。 */
function crosses(p, p2, q, q2) {
  const r = [p2[0] - p[0], p2[1] - p[1]], s = [q2[0] - q[0], q2[1] - q[1]];
  const den = r[0] * s[1] - r[1] * s[0];
  if (Math.abs(den) < 1e-9) return false;                     // 平行/共線
  const t = ((q[0] - p[0]) * s[1] - (q[1] - p[1]) * s[0]) / den;
  const u = ((q[0] - p[0]) * r[1] - (q[1] - p[1]) * r[0]) / den;
  const e = 0.06;                                             // 端點附近不算（引線相接是合法的）
  return t > e && t < 1 - e && u > e && u < 1 - e;
}

const AREA_RATIO = 0.35, BLOCK_PAD = 2;

function checkFigure(svg) {
  const parts = parseParts(svg);
  const hits = [];
  const at = b => `[${b.map(n => Math.round(n)).join(',')}]`;
  for (let i = 0; i < parts.length; i++) {
    for (let j = i + 1; j < parts.length; j++) {
      const A = parts[i], B = parts[j];
      // 用「膨脹 1px」判是否相鄰：直線的 bbox 面積是 0，用面積當門就會整對被跳過
      const grow = (bx, d) => [bx[0] - d, bx[1] - d, bx[2] + d, bx[3] + d];
      const near = inter(grow(A.bbox, 1), grow(B.bbox, 1));
      if (near[2] < near[0] || near[3] < near[1]) continue;
      const ib = inter(A.bbox, B.bbox);
      if (contains(A.bbox, B.bbox) || contains(B.bbox, A.bbox)) continue;   // 容器（虛線框包元件）
      // 接點/接地/旗標貼在別的元件引線上是正常接法
      const skip = t => /junction|ground|flag|rail/.test(t);
      // A. 筆畫真交叉
      let cross = false;
      for (const s1 of A.segs) { for (const s2 of B.segs) { if (crosses(s1[0], s1[1], s2[0], s2[1])) { cross = true; break; } } if (cross) break; }
      if (cross) { hits.push(`${A.type}${at(A.bbox)} 與 ${B.type}${at(B.bbox)} 筆畫交叉`); continue; }
      if (skip(A.type) || skip(B.type)) continue;
      // B. 方塊 vs 方塊
      if (A.type === 'block' && B.type === 'block') {
        if (ib[2] - ib[0] > BLOCK_PAD && ib[3] - ib[1] > BLOCK_PAD) hits.push(`方塊${at(A.bbox)} 與 方塊${at(B.bbox)} 互疊`);
        continue;
      }
      // C. 面積比
      const ratio = area(ib) / Math.max(1, Math.min(area(A.bbox), area(B.bbox)));
      if (ratio >= AREA_RATIO) hits.push(`${A.type}${at(A.bbox)} 與 ${B.type}${at(B.bbox)} 重疊 ${Math.round(ratio * 100)}%`);
    }
  }
  return [...new Set(hits)];
}

// ── 自我測試 ──
if (process.argv.includes('--selftest')) {
  const L = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#000" stroke-width="2"/>`;
  const capAt = x => `<g data-sym="capacitor">${L(x, 90, x, 101)}${L(x - 11, 101, x + 11, 101)}${L(x - 11, 111, x + 11, 111)}${L(x, 111, x, 134)}</g>`;
  const cases = [
    ['電容疊在一起', `<svg>${capAt(306)}${capAt(318)}</svg>`, r => r.length >= 1],
    ['電容分開', `<svg>${capAt(296)}${capAt(322)}</svg>`, r => r.length === 0],
    ['電感戳進方塊', `<svg><rect x="132" y="26" width="60" height="28"/><g data-sym="inductor">${L(188, 40, 236, 40)}</g></svg>`, r => r.length >= 1],
    ['電感在方塊外', `<svg><rect x="132" y="26" width="60" height="28"/><g data-sym="inductor">${L(196, 40, 244, 40)}</g></svg>`, r => r.length === 0],
    ['兩個方塊互疊', `<svg><rect x="317" y="27" width="73" height="39"/><rect x="317" y="56" width="73" height="39"/></svg>`, r => r.length >= 1],
    ['串接二極體共用引線', `<svg><g data-sym="diode">${L(236, 78, 250, 78)}${L(258, 70, 258, 86)}${L(258, 78, 280, 78)}</g><g data-sym="diode">${L(270, 78, 284, 78)}${L(292, 70, 292, 86)}${L(292, 78, 314, 78)}</g></svg>`, r => r.length === 0],
    ['虛線框包住元件', `<svg><rect x="40" y="20" width="200" height="160" stroke-dasharray="6 4"/><g data-sym="nmos">${L(100, 60, 140, 60)}${L(120, 40, 120, 80)}</g></svg>`, r => r.length === 0]
  ];
  let bad = 0;
  cases.forEach(([name, svg, ok]) => {
    const r = checkFigure(svg);
    const pass = ok(r);
    if (!pass) bad++;
    console.log(`  ${pass ? '✓' : '✗'} ${name}｜發現 ${r.length}${r.length ? '：' + r[0] : ''}`);
  });
  console.log(bad ? `\nselftest FAIL（${bad} 項）` : `\nselftest OK：${cases.length}/${cases.length}`);
  process.exit(bad ? 1 : 0);
}

// ── 掃全部圖 ──
// --lang=zh|en|ja|ko：換語言後字寬變、元件不動，仍要確認字沒壓到符號。
global.window = {};
global.window.ART_LANG = (process.argv.find(a => a.startsWith('--lang=')) || '=zh').split('=')[1] || 'zh';
require('./schematic-symbols.js');
require('./knowledge-art-i18n.js');
require('./knowledge-circuits2.js');
const ART2 = global.window.CIRCUITS2 || {};
const kjs = fs.readFileSync('./knowledge.js', 'utf8');
const a = kjs.indexOf('const CircuitSVG = {'), b = kjs.indexOf('const knowledgeApp = {');
const CircuitSVG = new Function('window', kjs.slice(a, b) + '\nreturn CircuitSVG;')(global.window);
const HELPERS = new Set(['wrap', '_S', 'capToGnd', 'blk', 'arw', '_transformer', 'switcher', 'normalizeSvgScale']);

const figures = [];
for (const id of Object.keys(ART2)) {
  try { figures.push([id, ART2[id]().svg]); } catch (e) { figures.push([id, null, e.message]); }
}
for (const k of Object.keys(CircuitSVG)) {
  if (typeof CircuitSVG[k] !== 'function' || HELPERS.has(k)) continue;
  try { figures.push(['CircuitSVG.' + k, CircuitSVG[k]()]); } catch (e) { figures.push(['CircuitSVG.' + k, null, e.message]); }
}
try { figures.push(['CircuitSVG.switcher', CircuitSVG.switcher({})]); } catch (e) { figures.push(['CircuitSVG.switcher', null, e.message]); }

const BASE = './symbol-overlap-baseline.json';
const baseline = fs.existsSync(BASE) ? JSON.parse(fs.readFileSync(BASE, 'utf8')) : {};
const now = {}; const rows = [];
let total = 0, errored = 0;
for (const [id, svg, err] of figures) {
  if (err) { rows.push({ id, err }); errored++; continue; }
  const hits = checkFigure(svg);
  if (hits.length) { total += hits.length; now[id] = hits.length; rows.push({ id, hits }); }
}

console.log(`symbol-overlap-check: 掃 ${figures.length} 張圖，元件互疊 ${total} 處（${Object.keys(now).length} 張圖）`);
rows.forEach(r => {
  if (r.err) { console.log(`  ✗ ${r.id}: 產生失敗 ${r.err}`); return; }
  console.log(`  ~ ${r.id}（${r.hits.length}）`);
  r.hits.slice(0, 3).forEach(h => console.log(`      ${h}`));
});

if (process.argv.includes('--update')) {
  fs.writeFileSync(BASE, JSON.stringify(now, null, 2) + '\n');
  console.log(`\n已寫入基線 ${BASE}（${Object.keys(now).length} 張圖）`);
}
const regressions = Object.keys(now).filter(id => now[id] > (baseline[id] || 0)).map(id => `${id}: ${baseline[id] || 0} → ${now[id]}`);
if (regressions.length) { console.log('\n比基線變差：'); regressions.forEach(r => console.log(`  ✗ ${r}`)); }
const improved = Object.keys(baseline).filter(id => (now[id] || 0) < baseline[id]);
if (improved.length) console.log(`\n（有 ${improved.length} 張圖比基線更好，修完可跑 --update 收緊棘輪）`);

if (process.argv.includes('--strict') && (errored || regressions.length)) { console.log('\nFAIL（--strict）'); process.exit(1); }
console.log(regressions.length ? '\n（報告模式，不視為失敗）' : '\nOK：未比基線變差');
process.exit(0);
