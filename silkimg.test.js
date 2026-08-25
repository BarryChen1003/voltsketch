/**
 * silkimg.test.js — 圖片轉絲印驗證（node，無瀏覽器）
 *
 * 兩個重點：
 *   1. 幾何要對——像素位置換算成 mm 後不可跑掉、實心區塊要合併成大矩形而不是一堆碎片。
 *   2. **太細的絲印印不出來**。板廠 minSilkWidth 是 0.15mm，低於這個寬度印出來斷斷續續，
 *      而且是收到板才發現。所以「有沒有把太細的抓出來」跟「轉得出來」一樣重要。
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

const S = require('./pcb-silkimg.js');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL: ' + m); } };
const eq = (a, b, m) => ok(a === b, `${m} (得 ${JSON.stringify(a)}，期望 ${JSON.stringify(b)})`);
const near = (a, b, t, m) => ok(Math.abs(a - b) <= (t || 1e-6), `${m} (得 ${a}，期望 ${b}）`);

// 用字串畫測試圖：'#' = 墨、'.' = 空白
function img(rows) {
  const h = rows.length, w = rows[0].length;
  const g = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) g[y * w + x] = rows[y][x] === '#' ? 0 : 255;
  return { gray: g, w, h };
}

// ============ 1) 二值化 ============
{
  const g = new Uint8Array([0, 100, 130, 255]);
  const m = S.toMask(g, 4, 1, { level: 128 });
  eq(Array.from(m).join(''), '1100', '1 低於門檻的算墨');
  eq(Array.from(S.toMask(g, 4, 1, { level: 50 })).join(''), '1000', '1 門檻調低墨變少');
  eq(Array.from(S.toMask(g, 4, 1, { level: 128, invert: true })).join(''), '0011', '1 反相應對調');
  eq(Array.from(S.toMask(g, 4, 1, {})).join(''), '1100', '1 預設門檻 128');
}

// ============ 2) 區段與合併：實心區塊要變成一塊，不是一堆碎片 ============
{
  const a = img([
    '......',
    '.####.',
    '.####.',
    '.####.',
    '......'
  ]);
  const runs = S.runsOf(S.toMask(a.gray, a.w, a.h, {}), a.w, a.h);
  eq(runs.length, 3, '2 三列各一個區段');
  const rects = S.mergeRuns(runs);
  eq(rects.length, 1, '2 x 範圍相同的相鄰列應合併成一個矩形');
  eq(JSON.stringify(rects[0]), JSON.stringify({ x0: 1, x1: 4, y0: 1, y1: 3 }), '2 合併後的矩形範圍');

  // 階梯形不可亂合併
  const b = img([
    '##....',
    '####..',
    '######'
  ]);
  const rb = S.mergeRuns(S.runsOf(S.toMask(b.gray, b.w, b.h, {}), b.w, b.h));
  eq(rb.length, 3, '2 每列 x 範圍不同時不可合併');

  // 同一列多個區段
  const c = img([
    '##..##',
    '##..##'
  ]);
  const rc = S.mergeRuns(S.runsOf(S.toMask(c.gray, c.w, c.h, {}), c.w, c.h));
  eq(rc.length, 2, '2 同一列的兩段應各自合併成兩個矩形');
  ok(rc.every(r => r.y0 === 0 && r.y1 === 1), '2 兩個矩形都應跨兩列');

  // 中間斷開的同 x 範圍不可跨過空白合併
  const d = img([
    '.##.',
    '....',
    '.##.'
  ]);
  const rd = S.mergeRuns(S.runsOf(S.toMask(d.gray, d.w, d.h, {}), d.w, d.h));
  eq(rd.length, 2, '2 中間隔了空白列不可合併');

  // 全白 / 全黑
  eq(S.mergeRuns(S.runsOf(S.toMask(img(['....']).gray, 4, 1, {}), 4, 1)).length, 0, '2 全白應無矩形');
  eq(S.mergeRuns(S.runsOf(S.toMask(img(['####', '####']).gray, 4, 2, {}), 4, 2)).length, 1, '2 全黑應為一個矩形');
}

// ============ 3) 座標換算：mm 與 y 軸方向 ============
{
  // 圖形刻意靠上（第 0 列），y 軸翻轉與否算出來的值才會不同。
  // 放在正中間的話兩種寫法結果一樣，測不出翻轉有沒有做。
  const a = img([
    '.##.',
    '....',
    '....'
  ]);
  const r = S.build(a.gray, a.w, a.h, { mmPerPx: 0.5, ox: 0, oy: 0 });
  eq(r.rects.length, 1, '3 應有一個矩形');
  const pts = r.shapes[0].pts;
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  near(Math.min.apply(null, xs), 0.5, 1e-9, '3 左緣 = 1px × 0.5mm');
  near(Math.max.apply(null, xs), 1.5, 1e-9, '3 右緣 = 3px × 0.5mm（含端）');
  // 影像 y 向下、板子 y 向上：第 1 列（由上算）應落在較高的 y
  // 第 0 列在影像最上方 → 板子座標要落在最上方（y 最大 = 影像高 3px × 0.5）
  near(Math.max.apply(null, ys), 1.5, 1e-9, '3 影像最上一列應對到板子最上方');
  near(Math.min.apply(null, ys), 1.0, 1e-9, '3 下緣應在 1.0mm，不是 0（沒翻轉會變 0~0.5）');
  eq(pts.length, 4, '3 矩形應為 4 點多邊形');
  eq(r.shapes[0].kind, 'region', '3 應輸出填充區域');
  eq(r.shapes[0].side, 'F', '3 預設頂層絲印');
  eq(S.build(a.gray, a.w, a.h, { side: 'B' }).shapes[0].side, 'B', '3 可指定底層');

  // 位移
  const off = S.build(a.gray, a.w, a.h, { mmPerPx: 0.5, ox: 10, oy: -5 });
  near(Math.min.apply(null, off.shapes[0].pts.map(p => p[0])), 10.5, 1e-9, '3 ox 應平移 x');
  near(Math.max.apply(null, off.shapes[0].pts.map(p => p[1])), -5 + 1.5, 1e-9, '3 oy 應平移 y');

  // 尺寸統計
  near(r.stats.widthMm, 2.0, 1e-9, '3 影像寬 4px × 0.5 = 2mm');
  near(r.stats.heightMm, 1.5, 1e-9, '3 影像高 3px × 0.5 = 1.5mm');
}

// ============ 4) 太細的絲印：抓得出來、可剔除 ============
{
  // 中間那條 8px × 1px 是關鍵：短邊 0.1mm 不合格、長邊 0.8mm 合格。
  // 沒有這種長寬懸殊的形狀，「取短邊」寫成「取長邊」也測不出來。
  const a = img([
    '.####....',
    '.####....',
    '.........',
    '.########',   // 長細條：短邊 1px、長邊 8px
    '.........'
  ]);
  // mmPerPx 0.1 → 上面那塊短邊 2px = 0.2mm（過關）；單點 0.1mm（不過）
  const r = S.build(a.gray, a.w, a.h, { mmPerPx: 0.1, minSilkWidth: 0.15 });
  eq(r.rects.length, 2, '4 應有兩塊');
  eq(r.stats.tooThin, 1, '4 應抓到 1 塊太細');
  near(r.stats.thinnestMm, 0.1, 1e-9, '4 最細處 0.1mm');
  eq(r.stats.limit, 0.15, '4 應記錄用的是哪個下限');
  eq(r.stats.dropped, 0, '4 預設保留，只回報不剔除');

  const dropped = S.build(a.gray, a.w, a.h, { mmPerPx: 0.1, minSilkWidth: 0.15, onTooThin: 'drop' });
  eq(dropped.rects.length, 1, '4 選擇剔除時應只剩合格的那一塊');
  eq(dropped.stats.dropped, 1, '4 應回報剔除了幾塊');
  ok(dropped.shapes.every(s => s.kind === 'region'), '4 剔除後輸出仍合法');

  // 放大解析度後同一張圖就過得了
  const bigger = S.build(a.gray, a.w, a.h, { mmPerPx: 0.2, minSilkWidth: 0.15 });
  eq(bigger.stats.tooThin, 0, '4 放大之後不應再有太細的');

  // 沒給下限就不判定
  const noLim = S.build(a.gray, a.w, a.h, { mmPerPx: 0.1 });
  eq(noLim.stats.tooThin, 0, '4 沒給板廠下限時不做判定');
  eq(noLim.stats.limit, null, '4 沒給下限時應標明');
}

// ============ 5) 灰階轉換：透明要當白色 ============
{
  const mk = px => ({ data: new Uint8ClampedArray(px), width: px.length / 4, height: 1 });
  const g = S.grayFrom(mk([0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 0]));
  eq(g[0], 0, '5 不透明黑 → 0');
  eq(g[1], 255, '5 不透明白 → 255');
  eq(g[2], 255, '5 全透明的黑應視為白（去背區不可當成墨）');
  const half = S.grayFrom(mk([0, 0, 0, 128]));
  ok(half[0] > 100 && half[0] < 160, `5 半透明黑應落在中間（得 ${half[0]}）`);
}

// ============ 6) 邊界情況 ============
{
  const blank = img(['....', '....']);
  const r = S.build(blank.gray, 4, 2, { mmPerPx: 0.1, minSilkWidth: 0.15 });
  eq(r.shapes.length, 0, '6 全白圖應無輸出');
  eq(r.stats.inkPx, 0, '6 墨量 0');
  eq(r.stats.thinnestMm, 0, '6 沒有形狀時最細處回 0，不可回 Infinity');
  eq(S.build(new Uint8Array(0), 0, 0, {}).shapes.length, 0, '6 空圖不可爆');

  // 大量細碎不可讓合併爆掉（棋盤格是最糟的情況）
  const n = 40;
  const g2 = new Uint8Array(n * n);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) g2[y * n + x] = ((x + y) % 2) ? 255 : 0;
  const chk = S.build(g2, n, n, { mmPerPx: 0.1 });
  eq(chk.rects.length, n * n / 2, '6 棋盤格每一格各自成塊');
  ok(chk.shapes.every(s => s.pts.length === 4), '6 每塊都應是 4 點多邊形');
}

console.log(`\nsilkimg.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
