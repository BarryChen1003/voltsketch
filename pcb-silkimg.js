// 圖片轉絲印（logo / 標記）
//
// 作法：灰階 → 二值化 → 逐列取出連續黑色區段（run）→ 垂直合併成矩形 → 每個矩形一塊填充區域。
// 不做 marching squares 那種輪廓向量化：矩形分解對「logo 這種塊狀圖」已經夠，
// 而且輸出是精確的矩形，不會有平滑輪廓帶來的誤差，也不必爭論簡化參數要設多少。
//
// 比「轉出來就好」多做的事：
//   **太細的絲印印不出來**。板廠有 minSilkWidth（JLCPCB/PCBWay 都是 0.15mm），
//   低於這個寬度的線條印出來會斷斷續續，而且是收到板才發現。
//   這裡把每個矩形的短邊拿去比選定板廠的下限，低於的直接數給你看，並可選擇自動剔除或加粗。
//
// 純函式（吃灰階陣列，不碰 DOM 也不解碼圖檔），node 可直接測。
// 圖檔解碼留給呼叫端（瀏覽器用 canvas 取 ImageData）。
(() => {
  'use strict';

  /** 灰階 → 二值遮罩。level 0..255，invert 反相（預設暗色為墨） */
  function toMask(gray, w, h, opts) {
    opts = opts || {};
    const level = (typeof opts.level === 'number') ? opts.level : 128;
    const inv = !!opts.invert;
    const m = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) {
      const dark = gray[i] < level;
      m[i] = (inv ? !dark : dark) ? 1 : 0;
    }
    return m;
  }

  /** 逐列的連續區段：[{y, x0, x1}]，x1 為含端（inclusive） */
  function runsOf(mask, w, h) {
    const out = [];
    for (let y = 0; y < h; y++) {
      let x = 0;
      while (x < w) {
        while (x < w && !mask[y * w + x]) x++;
        if (x >= w) break;
        const x0 = x;
        while (x < w && mask[y * w + x]) x++;
        out.push({ y, x0, x1: x - 1 });
      }
    }
    return out;
  }

  /** 垂直合併：x 範圍相同且列相鄰的 run 併成一個矩形 [{x0,x1,y0,y1}] */
  function mergeRuns(runs) {
    const open = new Map();     // 'x0,x1' → 進行中的矩形
    const done = [];
    let lastY = -2;
    for (const r of runs) {
      if (r.y !== lastY && r.y !== lastY + 1) { /* 不連續也沒關係，下面用 y1 判斷 */ }
      lastY = r.y;
    }
    // 依列處理，才能正確判斷「上一列有沒有同樣的 x 範圍」
    const byRow = new Map();
    runs.forEach(r => {
      if (!byRow.has(r.y)) byRow.set(r.y, []);
      byRow.get(r.y).push(r);
    });
    const rows = [...byRow.keys()].sort((a, b) => a - b);
    for (const y of rows) {
      const seen = new Set();
      for (const r of byRow.get(y)) {
        const k = r.x0 + ',' + r.x1;
        seen.add(k);
        const cur = open.get(k);
        if (cur && cur.y1 === y - 1) cur.y1 = y;
        else {
          if (cur) done.push(cur);
          open.set(k, { x0: r.x0, x1: r.x1, y0: y, y1: y });
        }
      }
      // 這一列沒再出現的，收掉
      for (const [k, v] of [...open]) {
        if (!seen.has(k) && v.y1 < y) { done.push(v); open.delete(k); }
      }
    }
    open.forEach(v => done.push(v));
    return done.sort((a, b) => a.y0 - b.y0 || a.x0 - b.x0);
  }

  /**
   * 矩形 → 絲印填充區域。
   * opts: { mmPerPx, ox, oy, side, imgH } — imgH 用來把影像的 y 軸（向下）翻成板子的 y 軸
   */
  function toShapes(rects, opts) {
    opts = Object.assign({ mmPerPx: 0.1, ox: 0, oy: 0, side: 'F', imgH: 0 }, opts || {});
    const s = opts.mmPerPx, H = opts.imgH;
    return rects.map(r => {
      // 像素 (x,y) 覆蓋 [x, x+1) × [y, y+1)
      const x0 = opts.ox + r.x0 * s, x1 = opts.ox + (r.x1 + 1) * s;
      const yTop = opts.oy + (H - r.y0) * s, yBot = opts.oy + (H - (r.y1 + 1)) * s;
      return {
        kind: 'region', side: opts.side,
        pts: [[x0, yBot], [x1, yBot], [x1, yTop], [x0, yTop]]
      };
    });
  }

  /** 每個矩形的短邊（＝這一塊絲印最細的地方） */
  const thinnestOf = (rects, mmPerPx) =>
    rects.map(r => Math.min((r.x1 - r.x0 + 1), (r.y1 - r.y0 + 1)) * mmPerPx);

  /**
   * 主流程。gray: Uint8ClampedArray/Array 長度 w*h。
   * opts: { level, invert, mmPerPx, ox, oy, side, minSilkWidth, onTooThin: 'keep'|'drop' }
   * 回 { shapes, rects, stats }
   */
  function build(gray, w, h, opts) {
    opts = Object.assign({ mmPerPx: 0.1, side: 'F', ox: 0, oy: 0, onTooThin: 'keep' }, opts || {});
    const mask = toMask(gray, w, h, opts);
    const runs = runsOf(mask, w, h);
    let rects = mergeRuns(runs);
    const widths = thinnestOf(rects, opts.mmPerPx);
    const lim = (typeof opts.minSilkWidth === 'number' && opts.minSilkWidth > 0) ? opts.minSilkWidth : null;
    let tooThin = 0;
    if (lim != null) {
      tooThin = widths.filter(v => v < lim - 1e-9).length;
      if (opts.onTooThin === 'drop') {
        rects = rects.filter((r, i) => widths[i] >= lim - 1e-9);
      }
    }
    const shapes = toShapes(rects, {
      mmPerPx: opts.mmPerPx, ox: opts.ox, oy: opts.oy, side: opts.side, imgH: h
    });
    const inkPx = mask.reduce((a, v) => a + v, 0);
    return {
      shapes, rects,
      stats: {
        imgW: w, imgH: h, inkPx,
        rects: rects.length, runs: runs.length,
        widthMm: +(w * opts.mmPerPx).toFixed(3), heightMm: +(h * opts.mmPerPx).toFixed(3),
        thinnestMm: widths.length ? +Math.min.apply(null, widths).toFixed(4) : 0,
        tooThin, limit: lim, dropped: (lim != null && opts.onTooThin === 'drop') ? tooThin : 0
      }
    };
  }

  /** 從 ImageData 取灰階（瀏覽器用；node 測試直接餵陣列） */
  function grayFrom(imageData) {
    const d = imageData.data, n = imageData.width * imageData.height;
    const g = new Uint8ClampedArray(n);
    for (let i = 0; i < n; i++) {
      const a = d[i * 4 + 3] / 255;
      // 透明的當白色（不印），否則會把去背區當成墨
      const lum = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2];
      g[i] = Math.round(lum * a + 255 * (1 - a));
    }
    return g;
  }

  const SilkImg = { build, toMask, runsOf, mergeRuns, toShapes, thinnestOf, grayFrom };
  if (typeof window !== 'undefined') window.PcbSilkImg = SilkImg;
  if (typeof module !== 'undefined' && module.exports) module.exports = SilkImg;
})();
