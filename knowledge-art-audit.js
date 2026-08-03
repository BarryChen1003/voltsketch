#!/usr/bin/env node
/**
 * knowledge-art-audit.js — 知識卡圖的「視覺」稽核（比既有三支更嚴）
 *
 * 既有檢查抓不到的兩類問題（使用者實際看圖時一眼就看到）：
 *   1) 視覺斷線：接線端點吸附到「附近」的腳位就算過，但畫面上還差 10px 沒碰到元件。
 *      這裡改成：端點必須真的落在某個元件（data-sym 群組 / 方塊）的邊界上或另一條線的端點上，
 *      容差只給 2px。
 *   2) 字貼著圖：既有檢查是「字框與線框相交才算」，擦邊 0.5px 也算過。
 *      這裡要求字框與任何線/框/元件至少留 CLEAR px 的間隙。
 *
 * 用法：
 *   node knowledge-art-audit.js               # 掃全部
 *   node knowledge-art-audit.js id1 id2       # 只掃指定圖
 *   node knowledge-art-audit.js --clear=4     # 調整字的最小間隙（預設 3）
 */
'use strict';

global.window = {};
require('./schematic-symbols.js');
require('./knowledge-circuits2.js');
const CIRCUITS = global.window.CIRCUITS2;

const args = process.argv.slice(2);
const CLEAR = +(args.find(a => a.startsWith('--clear=')) || '--clear=3').split('=')[1];
const only = args.filter(a => !a.startsWith('--'));
const TOL = 2;               // 端點視為「接上」的容差

/* ---------- 字寬估算（與 svg-overlap-check 同係數） ---------- */
const CJK = /[⺀-鿿豈-﫿＀-￯]/;
const textBox = (x, y, s, size, anchor) => {
  let w = 0;
  for (const ch of String(s)) w += CJK.test(ch) ? size : size * 0.52;
  const x0 = anchor === 'start' ? x : anchor === 'end' ? x - w : x - w / 2;
  return { x: x0, y: y - size * 0.82, w, h: size * 1.08, s };
};

/* ---------- 迷你 SVG 解析（追蹤 data-sym / data-deco 群組） ---------- */
function parse(svg) {
  const texts = [], segs = [], boxes = [], symBoxes = [];
  const stack = [];
  const num = (t, k, d) => { const m = t.match(new RegExp(k + '="([-\\d.]+)"')); return m ? +m[1] : d; };
  const re = /<(\/?)(g|line|rect|text|polyline|polygon|circle|path|ellipse)\b([^>]*)>([^<]*)/g;
  let m;
  const push = (arr, o) => { o.sym = stack.some(t => t.sym); o.deco = stack.some(t => t.deco); arr.push(o); };
  const addSeg = (x1, y1, x2, y2, w, o) => push(segs, { x1, y1, x2, y2, w: w || 2, ...o });
  while ((m = re.exec(svg))) {
    const [, close, tag, attrs, inner] = m;
    if (tag === 'g') {
      if (close) stack.pop();
      else stack.push({ sym: /data-sym=/.test(attrs), deco: /data-deco=/.test(attrs) });
      continue;
    }
    if (close) continue;
    if (tag === 'line') {
      addSeg(num(attrs, 'x1'), num(attrs, 'y1'), num(attrs, 'x2'), num(attrs, 'y2'), num(attrs, 'stroke-width', 2));
    } else if (tag === 'rect') {
      const b = { x: num(attrs, 'x'), y: num(attrs, 'y'), w: num(attrs, 'width'), h: num(attrs, 'height') };
      push(boxes, b);
      const e = [[b.x, b.y, b.x + b.w, b.y], [b.x + b.w, b.y, b.x + b.w, b.y + b.h],
      [b.x + b.w, b.y + b.h, b.x, b.y + b.h], [b.x, b.y + b.h, b.x, b.y]];
      e.forEach(([a, c, d, f]) => addSeg(a, c, d, f, 1.6, { edge: true }));
    } else if (tag === 'text') {
      const size = num(attrs, 'font-size', 11);
      const anchor = (attrs.match(/text-anchor="([^"]+)"/) || [])[1] || 'middle';
      const s = inner.replace(/&[a-z]+;/g, '?').trim();
      if (s) push(texts, textBox(num(attrs, 'x'), num(attrs, 'y'), s, size, anchor));
    } else if (tag === 'polyline' || tag === 'polygon') {
      const pts = ((attrs.match(/points="([^"]+)"/) || [])[1] || '').trim().split(/\s+/).map(p => p.split(',').map(Number));
      if (tag === 'polygon' && pts.length) pts.push(pts[0]);
      for (let i = 1; i < pts.length; i++) addSeg(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], num(attrs, 'stroke-width', 1.5));
    } else if (tag === 'circle' || tag === 'ellipse') {
      const cx = num(attrs, 'cx'), cy = num(attrs, 'cy');
      const rx = num(attrs, 'r', num(attrs, 'rx', 3)), ry = num(attrs, 'r', num(attrs, 'ry', 3));
      push(boxes, { x: cx - rx, y: cy - ry, w: rx * 2, h: ry * 2, dot: true });
    } else if (tag === 'path') {
      const d = (attrs.match(/d="([^"]+)"/) || [])[1] || '';
      let cx = 0, cy = 0, sx = 0, sy = 0;
      d.replace(/([MHVLAZ])\s*([-\d.,\s]*)/gi, (_, c, a) => {
        const n = a.trim().split(/[\s,]+/).filter(v => v !== '').map(Number);
        const C = c.toUpperCase();
        if (C === 'M') { cx = n[0]; cy = n[1]; sx = cx; sy = cy; }
        else if (C === 'L') { for (let i = 0; i < n.length; i += 2) { addSeg(cx, cy, n[i], n[i + 1], 2); cx = n[i]; cy = n[i + 1]; } }
        else if (C === 'H') { n.forEach(v => { addSeg(cx, cy, v, cy, 2); cx = v; }); }
        else if (C === 'V') { n.forEach(v => { addSeg(cx, cy, cx, v, 2); cy = v; }); }
        else if (C === 'A') { addSeg(cx, cy, n[5], n[6], 2); cx = n[5]; cy = n[6]; }
        else if (C === 'Z') { addSeg(cx, cy, sx, sy, 2); cx = sx; cy = sy; }
        return '';
      });
    }
  }
  // 元件外框：data-sym 群組的所有筆畫合成一個 bbox
  const symSegs = segs.filter(s => s.sym);
  const groups = [];
  symSegs.forEach(s => {
    const b = { x: Math.min(s.x1, s.x2), y: Math.min(s.y1, s.y2), X: Math.max(s.x1, s.x2), Y: Math.max(s.y1, s.y2) };
    const near = groups.find(g => b.x <= g.X + 6 && b.X >= g.x - 6 && b.y <= g.Y + 6 && b.Y >= g.y - 6);
    if (near) { near.x = Math.min(near.x, b.x); near.y = Math.min(near.y, b.y); near.X = Math.max(near.X, b.X); near.Y = Math.max(near.Y, b.Y); }
    else groups.push(b);
  });
  groups.forEach(g => symBoxes.push({ x: g.x, y: g.y, w: g.X - g.x, h: g.Y - g.y }));
  return { texts, segs, boxes, symBoxes };
}

/* ---------- 幾何 ---------- */
const distToSeg = (px, py, s) => {
  const dx = s.x2 - s.x1, dy = s.y2 - s.y1, L2 = dx * dx + dy * dy;
  const t = L2 ? Math.max(0, Math.min(1, ((px - s.x1) * dx + (py - s.y1) * dy) / L2)) : 0;
  return Math.hypot(px - (s.x1 + t * dx), py - (s.y1 + t * dy));
};
const boxGap = (b, r) => {                     // 字框到矩形的間隙（負值＝重疊）
  const dx = Math.max(r.x - (b.x + b.w), b.x - (r.x + r.w));
  const dy = Math.max(r.y - (b.y + b.h), b.y - (r.y + r.h));
  if (dx >= 0 || dy >= 0) return Math.max(dx, dy);
  return Math.max(dx, dy);
};
const segGapToBox = (s, b) => {                // 線段到字框的最短距離（0＝穿過）
  const inside = (x, y) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
  if (inside(s.x1, s.y1) || inside(s.x2, s.y2)) return 0;
  const edges = [[b.x, b.y, b.x + b.w, b.y], [b.x + b.w, b.y, b.x + b.w, b.y + b.h],
  [b.x + b.w, b.y + b.h, b.x, b.y + b.h], [b.x, b.y + b.h, b.x, b.y]];
  let best = Infinity;
  for (const [ex1, ey1, ex2, ey2] of edges) {
    const e = { x1: ex1, y1: ey1, x2: ex2, y2: ey2 };
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      best = Math.min(best, distToSeg(s.x1 + (s.x2 - s.x1) * t, s.y1 + (s.y2 - s.y1) * t, e));
    }
  }
  return best;
};

/* ---------- 稽核一張圖 ---------- */
function audit(id) {
  const svg = CIRCUITS[id]().svg;
  const { texts, segs, boxes, symBoxes } = parse(svg);
  const found = [];
  const wires = segs.filter(s => !s.sym && !s.deco && !s.edge);
  const targets = [...boxes.filter(b => !b.dot && !b.deco), ...symBoxes];

  // 1) 視覺斷線：接線端點必須落在元件邊界上（±TOL）或另一條線上
  const onBox = (x, y) => targets.some(b => {
    const inx = x >= b.x - TOL && x <= b.x + b.w + TOL, iny = y >= b.y - TOL && y <= b.y + b.h + TOL;
    if (!inx || !iny) return false;
    const dEdge = Math.min(Math.abs(x - b.x), Math.abs(x - (b.x + b.w)), Math.abs(y - b.y), Math.abs(y - (b.y + b.h)));
    const insideDeep = x > b.x + TOL && x < b.x + b.w - TOL && y > b.y + TOL && y < b.y + b.h - TOL;
    return insideDeep || dEdge <= TOL;
  });
  wires.forEach(w => {
    [[w.x1, w.y1], [w.x2, w.y2]].forEach(([x, y]) => {
      if (onBox(x, y)) return;
      const other = segs.some(s => s !== w && !s.deco && distToSeg(x, y, s) <= TOL);
      if (!other) found.push(`斷線 (${x},${y})`);
    });
  });

  // 2) 元件接腳沒被接到：電容/電阻/電感/二極體的兩個引線端點，必須有接線碰到（±TOL）
  //    （接地與電源旗標是單端符號，本來就只有一端，跳過）
  const SINGLE = /ground|flag/;
  const symGroups = [];
  {
    const re2 = /<g data-sym="([a-z]+)">([\s\S]*?)<\/g>/g;
    let mm;
    while ((mm = re2.exec(svg))) {
      const kind = mm[1];
      if (SINGLE.test(kind)) continue;
      const pts = [];
      let m3; const lre = /<line x1="([-\d.]+)" y1="([-\d.]+)" x2="([-\d.]+)" y2="([-\d.]+)"/g;
      while ((m3 = lre.exec(mm[2]))) pts.push([+m3[1], +m3[2]], [+m3[3], +m3[4]]);
      const pre = /<path d="M ([-\d.]+) ([-\d.]+)/g;
      while ((m3 = pre.exec(mm[2]))) pts.push([+m3[1], +m3[2]]);
      if (!pts.length) continue;
      const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
      const horiz = (Math.max(...xs) - Math.min(...xs)) >= (Math.max(...ys) - Math.min(...ys));
      const ends = horiz
        ? [pts.find(p => p[0] === Math.min(...xs)), pts.find(p => p[0] === Math.max(...xs))]
        : [pts.find(p => p[1] === Math.min(...ys)), pts.find(p => p[1] === Math.max(...ys))];
      symGroups.push({ kind, ends });
    }
  }
  symGroups.forEach(g => g.ends.forEach(([x, y]) => {
    // 只認「接線」或「方塊（B/IC 框）」；不能認元件自己的 bbox，否則每個腳都落在自己身上 = 永遠通過
    const hit = wires.some(w => distToSeg(x, y, w) <= TOL)
      || boxes.some(b => !b.dot && !b.deco && x >= b.x - TOL && x <= b.x + b.w + TOL && y >= b.y - TOL && y <= b.y + b.h + TOL);
    if (!hit) found.push(`${g.kind} 接腳沒接上 (${x},${y})`);
  }));

  // 3) 字要離圖形至少 CLEAR px（線、元件、方塊；不含自己所屬方塊的標題）
  texts.forEach(t => {
    const own = boxes.some(b => !b.dot && t.x + t.w / 2 > b.x && t.x + t.w / 2 < b.x + b.w
      && t.y + t.h / 2 > b.y && t.y + t.h / 2 < b.y + b.h);
    if (own) return;
    let worst = Infinity, what = '';
    segs.forEach(s => { const g = segGapToBox(s, t) - s.w / 2; if (g < worst) { worst = g; what = `線(${s.x1},${s.y1})-(${s.x2},${s.y2})`; } });
    targets.forEach(b => { const g = boxGap(t, b); if (g < worst) { worst = g; what = `框(${b.x},${b.y},${b.w}x${b.h})`; } });
    texts.forEach(o => { if (o === t) return; const g = boxGap(t, { x: o.x, y: o.y, w: o.w, h: o.h }); if (g < worst) { worst = g; what = `字「${o.s.slice(0, 10)}」`; } });
    if (worst < CLEAR) found.push(`字太貼「${t.s.slice(0, 14)}」間隙 ${worst.toFixed(1)}px → ${what}`);
  });
  return found;
}

/* ---------- 棘輪基線（沿用 wire-gap / symbol-overlap 的做法：只准降不准升） ----------
 * 既有那 73 張圖是先前累積的帳，一次清不完。基線鎖住「不准變差」，新畫的圖必須是 0。 */
const fs = require('fs');
const BASE = './knowledge-art-baseline.json';
const baseline = fs.existsSync(BASE) ? JSON.parse(fs.readFileSync(BASE, 'utf8')) : {};
const quiet = args.includes('--quiet');

const ids = only.length ? only : Object.keys(CIRCUITS);
const now = {};
let total = 0;
console.log(`knowledge-art-audit：掃 ${ids.length} 張圖（字最小間隙 ${CLEAR}px、端點容差 ${TOL}px）\n`);
for (const id of ids) {
  const f = audit(id);
  if (!f.length) continue;
  now[id] = f.length;
  total += f.length;
  if (!quiet) {
    console.log(`  ~ ${id}（${f.length}）`);
    f.slice(0, 6).forEach(x => console.log('      ' + x));
  }
}
console.log(total ? `\n共 ${total} 項（${Object.keys(now).length} 張圖）` : '\n乾淨');

if (args.includes('--update')) {
  fs.writeFileSync(BASE, JSON.stringify(now, null, 2) + '\n');
  console.log(`已寫入基線 ${BASE}（${Object.keys(now).length} 張圖）`);
  process.exit(0);
}
if (args.includes('--strict')) {
  const worse = ids.filter(id => (now[id] || 0) > (baseline[id] || 0));
  const better = Object.keys(baseline).filter(id => (now[id] || 0) < baseline[id]);
  if (better.length) console.log(`改善：${better.map(id => `${id} ${baseline[id]}→${now[id] || 0}`).join('、')}（跑 --update 收進基線）`);
  if (worse.length) {
    console.log(`\n比基線變差：\n${worse.map(id => `  ✗ ${id}: ${baseline[id] || 0} → ${now[id]}`).join('\n')}`);
    process.exit(1);
  }
  console.log('OK：未比基線變差');
}
process.exit(0);
