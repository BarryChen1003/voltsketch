/**
 * wire-gap-check.js — 知識卡電路圖「接線沒接上／接線多出頭」檢查（node）
 *
 * 為什麼需要：全橋圖的 V+ 匯流排畫成 x 40→220，但橋臂上端子在 x=86 / x=226
 *   → 左邊多出 46px 懸空線頭、右邊差 6px 沒接到 Q3。兩者肉眼都很難看出來，
 *   而 circuit-check.js 只抓「零長線段」，看不到這種差幾 px 的缺口。
 *
 * 為什麼以前做不了：符號內部本來就有大量合法自由端（電容兩極板、接地三橫槓、
 *   二極體三角、MOSFET 閘極板），照端點掃會 >90% 誤報。
 *   現在 schematic-symbols.js 把每個符號包成 `<g data-sym="…">`，本檔只檢查
 *   **接線**（不在 data-sym 群組內的 <line>）的端點，誤報來源就消失了。
 *
 * 兩類發現：
 *   GAP（缺口 0.6–8px）：端點差幾 px 沒接到任何圖形 → 幾乎都是真缺陷，--strict 視為失敗。
 *   FREE（自由端 >8px）：端點附近沒有東西。輸入/輸出腳（Vin、SW、→ 功率迴路）本來就是
 *     自由端，所以不當錯誤，改用 wire-gap-baseline.json 做棘輪：數量只准降不准升。
 *
 * 用法：
 *   node wire-gap-check.js            # 報告
 *   node wire-gap-check.js --strict   # CI：有 GAP 或 FREE 超過基線就 exit 1
 *   node wire-gap-check.js --update   # 重寫基線（自由端數量有意改變時才用）
 */
'use strict';

const fs = require('fs');

// ── 載入圖庫 ──
global.window = {};
require('./schematic-symbols.js');
require('./knowledge-circuits2.js');
const ART2 = global.window.CIRCUITS2 || {};

const kjs = fs.readFileSync('./knowledge.js', 'utf8');
const a = kjs.indexOf('const CircuitSVG = {');
const b = kjs.indexOf('const knowledgeApp = {');
if (a < 0 || b < 0) { console.log('FAIL: 找不到 CircuitSVG'); process.exit(1); }
const CircuitSVG = new Function('window', kjs.slice(a, b) + '\nreturn CircuitSVG;')(global.window);
const HELPERS = new Set(['wrap', 'capToGnd', 'blk', 'arw', '_transformer', 'switcher']);

const figures = [];
for (const id of Object.keys(ART2)) {
  try { figures.push([id, ART2[id]().svg]); } catch (e) { figures.push([id, null, e.message]); }
}
for (const k of Object.keys(CircuitSVG)) {
  if (typeof CircuitSVG[k] !== 'function' || HELPERS.has(k)) continue;
  try { figures.push(['CircuitSVG.' + k, CircuitSVG[k]()]); } catch (e) { figures.push(['CircuitSVG.' + k, null, e.message]); }
}
// switcher 需要 opt（Buck 卡在用）
try { figures.push(['CircuitSVG.switcher', CircuitSVG.switcher({})]); } catch (e) { figures.push(['CircuitSVG.switcher', null, e.message]); }

// ── 迷你 SVG 解析（含 transform 與 data-sym）──
const I = [1, 0, 0, 1, 0, 0];                                   // a b c d e f
const mul = (m, n) => [
  m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1],
  m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3],
  m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]
];
const apply = (m, x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];

function parseTransform(str) {
  let m = I;
  const re = /(translate|scale|rotate|matrix)\s*\(([^)]*)\)/g;
  let t;
  while ((t = re.exec(str))) {
    const v = t[2].trim().split(/[\s,]+/).map(Number);
    if (t[1] === 'translate') m = mul(m, [1, 0, 0, 1, v[0] || 0, v.length > 1 ? v[1] : 0]);
    else if (t[1] === 'scale') m = mul(m, [v[0], 0, 0, v.length > 1 ? v[1] : v[0], 0, 0]);
    else if (t[1] === 'matrix') m = mul(m, v);
    else {
      const r = (v[0] || 0) * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
      const rot = [c, s, -s, c, 0, 0];
      if (v.length >= 3) m = mul(mul(mul(m, [1, 0, 0, 1, v[1], v[2]]), rot), [1, 0, 0, 1, -v[1], -v[2]]);
      else m = mul(m, rot);
    }
  }
  return m;
}

const attr = (s, name) => { const m = s.match(new RegExp(name + '="([^"]*)"')); return m ? m[1] : null; };
const num = (s, name) => { const v = attr(s, name); return v === null ? null : +v; };

/** 回傳 { wires:[seg], geom:[seg], dots:[{p,r}], texts:[[x,y]] }；seg = {a:[x,y], b:[x,y]} */
function parse(svg) {
  const wires = [], geom = [], dots = [], texts = [];
  const stack = [{ m: I, sym: false }];
  const re = /<(\/?)([a-zA-Z]+)([^>]*?)(\/?)>/g;
  let t;
  while ((t = re.exec(svg))) {
    const close = t[1] === '/', tagName = t[2], body = t[3], selfClose = t[4] === '/';
    const top = stack[stack.length - 1];
    if (tagName === 'g' || tagName === 'svg') {
      if (close) { if (stack.length > 1) stack.pop(); continue; }
      let tr = attr(body, 'transform');
      // 最外層那個純 scale() 是全圖統一放大（wrap/W 加的）。門檻（TOUCH/GAP_MAX）是絕對 px，
      // 所以這裡把它當恆等式忽略 → 一律在「原始座標」上量，放大倍率改了也不會影響判定。
      if (tr && stack.length === 2 && /^\s*scale\([^)]*\)\s*$/.test(tr)) tr = null;
      // data-sym：元件符號內部筆畫；data-deco：裝飾/註解線（紅叉、座標軸、指示箭頭）
      const isSym = attr(body, 'data-sym') !== null || attr(body, 'data-deco') !== null;
      stack.push({ m: tr ? mul(top.m, parseTransform(tr)) : top.m, sym: top.sym || isSym });
      if (selfClose) stack.pop();
      continue;
    }
    if (close) continue;
    const m = top.m;
    if (tagName === 'line') {
      const seg = { a: apply(m, num(body, 'x1'), num(body, 'y1')), b: apply(m, num(body, 'x2'), num(body, 'y2')) };
      geom.push(seg);
      if (!top.sym) wires.push(seg);
    } else if (tagName === 'rect') {
      const x = num(body, 'x'), y = num(body, 'y'), w = num(body, 'width'), h = num(body, 'height');
      const p = [apply(m, x, y), apply(m, x + w, y), apply(m, x + w, y + h), apply(m, x, y + h)];
      for (let i = 0; i < 4; i++) geom.push({ a: p[i], b: p[(i + 1) % 4] });
    } else if (tagName === 'circle') {
      dots.push({ p: apply(m, num(body, 'cx'), num(body, 'cy')), r: num(body, 'r') || 2.6 });
    } else if (tagName === 'polygon' || tagName === 'polyline') {
      const pts = (attr(body, 'points') || '').trim().split(/\s+/).map(s => s.split(',').map(Number))
        .filter(p => p.length === 2 && !p.some(isNaN)).map(p => apply(m, p[0], p[1]));
      for (let i = 0; i + 1 < pts.length; i++) geom.push({ a: pts[i], b: pts[i + 1] });
      if (tagName === 'polygon' && pts.length > 2) geom.push({ a: pts[pts.length - 1], b: pts[0] });
    } else if (tagName === 'text') {
      texts.push(apply(m, num(body, 'x') || 0, num(body, 'y') || 0));
    } else if (tagName === 'path') {
      // 折線近似：取所有座標對（弧線用端點近似足夠，只當「可接觸的圖形」用）
      const d = attr(body, 'd') || '';
      const nums = d.match(/-?[\d.]+/g) || [];
      const cmds = d.match(/[MLAC]/g) || [];
      const pts = [];
      let i = 0;
      for (const c of cmds) {
        if (c === 'M' || c === 'L') { pts.push(apply(m, +nums[i], +nums[i + 1])); i += 2; }
        else if (c === 'A') { i += 5; pts.push(apply(m, +nums[i], +nums[i + 1])); i += 2; }
        else if (c === 'C') { i += 4; pts.push(apply(m, +nums[i], +nums[i + 1])); i += 2; }
      }
      for (let j = 0; j + 1 < pts.length; j++) geom.push({ a: pts[j], b: pts[j + 1] });
    }
  }
  return { wires, geom, dots, texts };
}

// ── 幾何 ──
const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
function distToSeg(p, s) {
  const dx = s.b[0] - s.a[0], dy = s.b[1] - s.a[1], L2 = dx * dx + dy * dy;
  if (!L2) return dist(p, s.a);
  let t = ((p[0] - s.a[0]) * dx + (p[1] - s.a[1]) * dy) / L2;
  t = Math.max(0, Math.min(1, t));
  return dist(p, [s.a[0] + t * dx, s.a[1] + t * dy]);
}

// 線寬 2 → 半寬 1px：差距在 1.5px 內兩條線的筆畫本來就疊在一起，肉眼是接上的，不算缺口。
const TOUCH = 1.5, GAP_MAX = 8;

/**
 * 「短橫槓」豁免：長度 ≤24px 的線，若中段就貼在別的圖形上（電源旗標的橫槓、天線橫槓
 * 這類 T 字掛法），兩端本來就是裝飾性自由端，不算缺口。
 */
function barLike(w, geom, dots) {
  if (dist(w.a, w.b) > 24) return false;
  for (let t = 0.2; t <= 0.8; t += 0.1) {
    const p = [w.a[0] + t * (w.b[0] - w.a[0]), w.a[1] + t * (w.b[1] - w.a[1])];
    for (const s of geom) { if (s === w) continue; if (distToSeg(p, s) <= TOUCH) return true; }
    for (const c of dots) { if (Math.max(0, dist(p, c.p) - c.r) <= TOUCH) return true; }
  }
  return false;
}

function checkFigure(svg) {
  const { wires, geom, dots, texts } = parse(svg);
  const gaps = [], overs = [], frees = [], bares = [];
  // 標籤在旁邊的自由端＝輸入/輸出腳（Vin、SW、→ 功率迴路），不是畫壞
  const labelled = p => texts.some(t => dist(p, t) <= 16);
  const nearest = (p, self) => {
    let best = Infinity;
    for (const s of geom) { if (s === self) continue; const d = distToSeg(p, s); if (d < best) best = d; }
    for (const c of dots) { const d = Math.max(0, dist(p, c.p) - c.r); if (d < best) best = d; }
    return best;
  };
  wires.forEach(w => {
    if (dist(w.a, w.b) < 1) return;                              // 零長線由 circuit-check 負責
    if (barLike(w, geom, dots)) return;
    [[w.a, w.b], [w.b, w.a]].forEach(([p, other]) => {
      if (nearest(p, w) <= TOUCH) return;                        // 已接上
      const at = `(${p.map(n => Math.round(n * 10) / 10).join(',')})`;
      const L = dist(p, other);
      const ux = (p[0] - other[0]) / L, uy = (p[1] - other[1]) / L;   // 由線身指向端點＝「前方」
      // ① 差一點就接到：沿前方 0.5–8px 內有圖形 → 線畫短了
      let ahead = null;
      for (let d = 1.5; d <= GAP_MAX; d += 0.5) {   // <1.5px 的差距筆畫本來就疊上了，不報
        const q = [p[0] + ux * d, p[1] + uy * d];
        if (nearest(q, w) <= TOUCH) { ahead = d; break; }
      }
      if (ahead !== null) { gaps.push(`${at} 前方 ${ahead.toFixed(1)}px 才接到`); return; }
      // ② 穿過接點還往外伸：線身「中段」貼到別的圖形，端點卻在那之後空伸 → 多出的線頭。
      //    只算真正的中段接點：距另一端 ≥3px（否則就只是「一端接、另一端是腳」的正常情形）。
      let best = null;
      for (let t = 0.02; t <= 0.98; t += 0.02) {
        const q = [other[0] + t * (p[0] - other[0]), other[1] + t * (p[1] - other[1])];
        if (nearest(q, w) > TOUCH) continue;
        if (dist(q, other) < 3 || dist(q, p) < 2) continue;
        if (!best || dist(q, p) < dist(best, p)) best = q;
      }
      if (best && !labelled(p)) { overs.push(`${at} 超出接點 ${dist(best, p).toFixed(1)}px`); return; }
      // 自由端：旁邊有腳位標籤＝合法的輸入/輸出腳；沒標籤的多半是「兩段網忘了接」
      // （雙 FET 防漏那張：汲極停在 x=136、網在 x=182，中間 46px 空著，距離 >GAP_MAX
      //  所以不算缺口，但確實是斷線）→ 單獨列一類盯著。
      if (labelled(p)) frees.push(at); else bares.push(at);
    });
  });
  return { gaps, overs, frees, bares, wires: wires.length };
}

// ── 自我測試：證明這支檢查真的抓得到那兩種缺陷（不是空轉）──
if (process.argv.includes('--selftest')) {
  const L = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#000" stroke-width="2"/>`;
  const cases = [
    // ① 沒接上：橫線右端 (150,50) 差 6px 才碰到 x=156 的豎線（＝全橋 Q3 那個 bug）
    ['沒接上', `<svg>${L(100, 50, 150, 50)}${L(156, 50, 156, 80)}</svg>`, r => r.gaps.length >= 1],
    // ② 多出線頭：匯流排在 x=86 接上豎線，左端還伸到 x=40（＝全橋 Q1 那個 bug）
    ['多出線頭', `<svg>${L(40, 28, 220, 28)}${L(86, 28, 86, 60)}</svg>`, r => r.overs.length >= 1],
    // ③ 乾淨的 L 形接線：兩個自由端都沒有標籤，但既沒缺口也沒多出
    ['乾淨', `<svg>${L(0, 0, 10, 0)}${L(10, 0, 10, 10)}</svg>`, r => r.gaps.length === 0 && r.overs.length === 0],
    // ④ 符號內部筆畫（data-sym）不當接線：電容兩極板 10px 距離不該被報
    ['符號豁免', `<svg><g data-sym="capacitor">${L(0, 0, 0, 5)}${L(-11, 5, 11, 5)}${L(-11, 15, 11, 15)}${L(0, 15, 0, 20)}</g></svg>`,
      r => r.gaps.length === 0 && r.overs.length === 0]
  ];
  let bad = 0;
  cases.forEach(([name, svg, ok]) => {
    const r = checkFigure(svg);
    const pass = ok(r);
    if (!pass) bad++;
    console.log(`  ${pass ? '✓' : '✗'} ${name}｜沒接上 ${r.gaps.length} 多出 ${r.overs.length} 自由端 ${r.frees.length}`);
  });
  console.log(bad ? `\nselftest FAIL（${bad} 項）` : '\nselftest OK：4/4');
  process.exit(bad ? 1 : 0);
}

// ── 主流程 ──
const strict = process.argv.includes('--strict');
const update = process.argv.includes('--update');
const BASE = './wire-gap-baseline.json';
const baseline = fs.existsSync(BASE) ? JSON.parse(fs.readFileSync(BASE, 'utf8')) : {};

const rows = [];
let gapTotal = 0, overTotal = 0, freeTotal = 0, bareTotal = 0, errored = 0;
for (const [id, svg, err] of figures) {
  if (err) { rows.push({ id, err }); errored++; continue; }
  const r = checkFigure(svg);
  gapTotal += r.gaps.length; overTotal += r.overs.length; freeTotal += r.frees.length; bareTotal += r.bares.length;
  if (r.gaps.length || r.overs.length || r.frees.length || r.bares.length) rows.push({ id, ...r });
}

console.log(`wire-gap-check: 掃 ${figures.length} 張圖 → 沒接上 ${gapTotal} 處、多出線頭 ${overTotal} 處、無標籤自由端 ${bareTotal} 處、有標籤的腳 ${freeTotal} 處`);

const gapRows = rows.filter(r => r.gaps && r.gaps.length);
if (gapRows.length) {
  console.log('\n沒接上（端點前方幾 px 就有圖形，線畫短了）：');
  gapRows.forEach(r => console.log(`  ✗ ${r.id}: ${r.gaps.join(' ')}`));
}
const bareRows = rows.filter(r => r.bares && r.bares.length);
if (bareRows.length) {
  console.log('\n無標籤自由端（線頭懸空又沒有腳位標籤 → 多半是兩段網忘了接起來）：');
  bareRows.slice(0, 12).forEach(r => console.log(`  ~ ${r.id}: ${r.bares.slice(0, 4).join(' ')}`));
}
const overRows = rows.filter(r => r.overs && r.overs.length);
if (overRows.length) {
  console.log('\n多出線頭（線身已接上，端點還往外空伸）：');
  overRows.forEach(r => console.log(`  ✗ ${r.id}: ${r.overs.join(' ')}`));
}
rows.filter(r => r.err).forEach(r => console.log(`  ✗ ${r.id}: 產生失敗 ${r.err}`));

// ── 棘輪：三類數量逐圖比對基線，只准降不准升 ──
const now = {};
rows.forEach(r => {
  if (r.err) return;
  const v = { gap: r.gaps.length, over: r.overs.length, bare: r.bares.length, free: r.frees.length };
  if (v.gap || v.over || v.bare || v.free) now[r.id] = v;
});
if (update) {
  fs.writeFileSync(BASE, JSON.stringify(now, null, 2) + '\n');
  console.log(`\n已寫入基線 ${BASE}（${Object.keys(now).length} 張圖）`);
}
const regressions = [];
for (const id of Object.keys(now)) {
  const was = baseline[id] || { gap: 0, over: 0, bare: 0, free: 0 };
  ['gap', 'over', 'bare', 'free'].forEach(k => {
    if (now[id][k] > (was[k] || 0)) regressions.push(`${id} ${k}: ${was[k] || 0} → ${now[id][k]}`);
  });
}
if (regressions.length) {
  console.log('\n比基線變差（新增了沒接上／多出的線頭）：');
  regressions.forEach(r => console.log(`  ✗ ${r}`));
}
const improved = Object.keys(baseline).filter(id => {
  const b = baseline[id], n = now[id] || { gap: 0, over: 0, bare: 0, free: 0 };
  return (n.gap < (b.gap || 0)) || (n.over < (b.over || 0)) || (n.bare < (b.bare || 0)) || (n.free < (b.free || 0));
});
if (improved.length) console.log(`\n（有 ${improved.length} 張圖比基線更好，修完可跑 --update 收緊棘輪）`);

if (strict && (errored || regressions.length)) { console.log('\nFAIL（--strict）'); process.exit(1); }
console.log(regressions.length ? '\n（報告模式，不視為失敗）' : '\nOK：未比基線變差');
process.exit(0);
