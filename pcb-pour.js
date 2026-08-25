// 鋪銅孤島偵測（orphan island removal）
//
// 問題：鋪銅被異網 pad／走線／via 的避讓切開之後，可能留下一塊「跟自己的網路完全斷開」
// 的銅。它在畫面上跟正常鋪銅長得一模一樣，DRC 也不會報——因為它沒有違反任何間距規則。
// 但那是一塊浮空的銅：對 EMC 是天線，對阻抗是不可控的耦合，正規 EDA 一律移除。
// 這是這個編輯器少數「靜默做出壞板」的地方。
//
// 作法：把鋪銅區域柵格化，扣掉避讓，再從「該網路的 pad／via／走線」洪水填充。
// 填不到的連通塊就是孤島。孤島用跟圖片絲印同一套 run→矩形合併轉回幾何，
// 交給匯出端以清除極性挖掉。
//
// 為什麼用柵格不用多邊形布林：布林運算要處理自交、共線、浮點退化，寫對很難也難驗；
// 柵格的解析度是明講的參數，誤差可預期，而且連通性判斷是教科書演算法。
// 代價是解析度以下的細頸會被當成斷開——這一點會回報出來，不會假裝沒有。
(() => {
  'use strict';

  const inPoly = (x, y, pts) => {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside;
    }
    return inside;
  };
  const segDist = (px, py, x1, y1, x2, y2) => {
    const dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy;
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * dx + (py - y1) * dy) / l2;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
  };

  /**
   * 把一塊鋪銅柵格化。回 { mask, nx, ny, x0, y0, res }
   * mask: 1 = 這一格有銅（在多邊形內、且不在任何避讓範圍內）
   */
  function rasterize(state, zone, padAbs, opts) {
    opts = Object.assign({ res: 0.1, clearance: zone.clearance || 0.3 }, opts || {});
    const res = opts.res;
    const xs = zone.pts.map(p => p[0]), ys = zone.pts.map(p => p[1]);
    const x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs);
    const y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    const nx = Math.max(1, Math.ceil((x1 - x0) / res) + 1);
    const ny = Math.max(1, Math.ceil((y1 - y0) / res) + 1);
    const mask = new Uint8Array(nx * ny);
    const at = (ix, iy) => iy * nx + ix;
    const X = ix => x0 + ix * res, Y = iy => y0 + iy * res;

    for (let iy = 0; iy < ny; iy++)
      for (let ix = 0; ix < nx; ix++)
        if (inPoly(X(ix), Y(iy), zone.pts)) mask[at(ix, iy)] = 1;

    const cl = opts.clearance;
    const net = zone.net || '';
    const layer = zone.layer || 'F.Cu';
    const carve = (cx, cy, r) => {
      const a0 = Math.max(0, Math.floor((cx - r - x0) / res)), a1 = Math.min(nx - 1, Math.ceil((cx + r - x0) / res));
      const b0 = Math.max(0, Math.floor((cy - r - y0) / res)), b1 = Math.min(ny - 1, Math.ceil((cy + r - y0) / res));
      for (let iy = b0; iy <= b1; iy++) for (let ix = a0; ix <= a1; ix++)
        if (Math.hypot(X(ix) - cx, Y(iy) - cy) <= r) mask[at(ix, iy)] = 0;
    };
    const carveSeg = (ax, ay, bx, by, r) => {
      const a0 = Math.max(0, Math.floor((Math.min(ax, bx) - r - x0) / res));
      const a1 = Math.min(nx - 1, Math.ceil((Math.max(ax, bx) + r - x0) / res));
      const b0 = Math.max(0, Math.floor((Math.min(ay, by) - r - y0) / res));
      const b1 = Math.min(ny - 1, Math.ceil((Math.max(ay, by) + r - y0) / res));
      for (let iy = b0; iy <= b1; iy++) for (let ix = a0; ix <= a1; ix++)
        if (segDist(X(ix), Y(iy), ax, ay, bx, by) <= r) mask[at(ix, iy)] = 0;
    };

    (state.components || []).forEach(c => (c.pads || []).forEach(p => {
      if (p.cu === false) return;
      const onLayer = p.side === '*' || (p.side === 'B' ? 'B.Cu' : 'F.Cu') === layer;
      if (!onLayer) return;
      if (net && (p.net || '') === net) return;              // 同網 pad 是連接點，不挖
      const a = padAbs(c, p);
      carve(a.x, a.y, Math.hypot(p.w || 0.5, p.h || 0.5) / 2 + cl);
    }));
    (state.traces || []).forEach(t => {
      if ((t.layer || 'F.Cu') !== layer) return;
      if (net && (t.net || '') === net) return;
      carveSeg(t.x1, t.y1, t.x2, t.y2, (t.width || 0.3) / 2 + cl);
    });
    (state.vias || []).forEach(v => {
      if (net && (v.net || '') === net) return;
      carve(v.x, v.y, (v.od || 0.6) / 2 + cl);
    });
    (state.keepouts || []).forEach(k => {
      if (k.layer && k.layer !== '*' && k.layer !== layer) return;
      if (!k.pts || k.pts.length < 3) return;
      for (let iy = 0; iy < ny; iy++) for (let ix = 0; ix < nx; ix++)
        if (mask[at(ix, iy)] && inPoly(X(ix), Y(iy), k.pts)) mask[at(ix, iy)] = 0;
    });

    return { mask, nx, ny, x0, y0, res };
  }

  /** 標記連通塊（4 連通；對角相接不算連通，銅在對角處實際上也接不牢） */
  function label(grid) {
    const { mask, nx, ny } = grid;
    const lab = new Int32Array(nx * ny).fill(0);
    const sizes = [0];
    let next = 1;
    const stack = [];
    for (let s = 0; s < nx * ny; s++) {
      if (!mask[s] || lab[s]) continue;
      const id = next++;
      let n = 0;
      stack.push(s);
      lab[s] = id;
      while (stack.length) {
        const c = stack.pop();
        n++;
        const cx = c % nx, cy = (c - cx) / nx;
        if (cx > 0 && mask[c - 1] && !lab[c - 1]) { lab[c - 1] = id; stack.push(c - 1); }
        if (cx < nx - 1 && mask[c + 1] && !lab[c + 1]) { lab[c + 1] = id; stack.push(c + 1); }
        if (cy > 0 && mask[c - nx] && !lab[c - nx]) { lab[c - nx] = id; stack.push(c - nx); }
        if (cy < ny - 1 && mask[c + nx] && !lab[c + nx]) { lab[c + nx] = id; stack.push(c + nx); }
      }
      sizes[id] = n;
    }
    return { lab, count: next - 1, sizes };
  }

  /** 哪些連通塊接得到自己的網路（同網 pad／via／走線落在塊內即算接上） */
  function connectedIds(state, zone, padAbs, grid, lab) {
    const { nx, ny, x0, y0, res } = grid;
    const net = zone.net || '';
    const layer = zone.layer || 'F.Cu';
    const hit = new Set();
    const idAt = (x, y) => {
      const ix = Math.round((x - x0) / res), iy = Math.round((y - y0) / res);
      if (ix < 0 || iy < 0 || ix >= nx || iy >= ny) return 0;
      return lab[iy * nx + ix];
    };
    // 同網物件的位置：pad 中心、via 中心、走線沿線取樣
    const mark = (x, y) => { const id = idAt(x, y); if (id) hit.add(id); };
    const markAround = (x, y, r) => {
      mark(x, y);
      for (let a = 0; a < 8; a++) mark(x + r * Math.cos(a * Math.PI / 4), y + r * Math.sin(a * Math.PI / 4));
    };
    if (!net) return hit;                       // 無網路的鋪銅本來就整塊浮空，不判定
    (state.components || []).forEach(c => (c.pads || []).forEach(p => {
      if (p.cu === false || (p.net || '') !== net) return;
      const onLayer = p.side === '*' || (p.side === 'B' ? 'B.Cu' : 'F.Cu') === layer;
      if (!onLayer) return;
      const a = padAbs(c, p);
      markAround(a.x, a.y, Math.max(p.w || 0.5, p.h || 0.5) / 2 + res);
    }));
    (state.vias || []).forEach(v => {
      if ((v.net || '') !== net) return;
      markAround(v.x, v.y, (v.od || 0.6) / 2 + res);
    });
    (state.traces || []).forEach(t => {
      if ((t.net || '') !== net || (t.layer || 'F.Cu') !== layer) return;
      const L = Math.hypot(t.x2 - t.x1, t.y2 - t.y1);
      const n = Math.max(1, Math.ceil(L / res));
      for (let i = 0; i <= n; i++) mark(t.x1 + (t.x2 - t.x1) * i / n, t.y1 + (t.y2 - t.y1) * i / n);
    });
    return hit;
  }

  /** 把某些連通塊轉回矩形（逐列 run → 垂直合併，與圖片絲印同一套） */
  function rectsOf(grid, lab, ids) {
    const { nx, ny, x0, y0, res } = grid;
    const want = new Set(ids);
    const runs = [];
    for (let iy = 0; iy < ny; iy++) {
      let ix = 0;
      while (ix < nx) {
        while (ix < nx && !want.has(lab[iy * nx + ix])) ix++;
        if (ix >= nx) break;
        const s = ix;
        while (ix < nx && want.has(lab[iy * nx + ix])) ix++;
        runs.push({ y: iy, x0: s, x1: ix - 1 });
      }
    }
    const open = new Map(), done = [];
    const byRow = new Map();
    runs.forEach(r => { if (!byRow.has(r.y)) byRow.set(r.y, []); byRow.get(r.y).push(r); });
    for (const y of [...byRow.keys()].sort((a, b) => a - b)) {
      const seen = new Set();
      for (const r of byRow.get(y)) {
        const k = r.x0 + ',' + r.x1;
        seen.add(k);
        const cur = open.get(k);
        if (cur && cur.y1 === y - 1) cur.y1 = y;
        else { if (cur) done.push(cur); open.set(k, { x0: r.x0, x1: r.x1, y0: y, y1: y }); }
      }
      for (const [k, v] of [...open]) if (!seen.has(k) && v.y1 < y) { done.push(v); open.delete(k); }
    }
    open.forEach(v => done.push(v));
    // 柵格格心代表該格，轉回幾何時往外放半格，孤島才會被完整挖掉
    const h = res / 2;
    return done.map(r => ({
      pts: [
        [x0 + r.x0 * res - h, y0 + r.y0 * res - h],
        [x0 + r.x1 * res + h, y0 + r.y0 * res - h],
        [x0 + r.x1 * res + h, y0 + r.y1 * res + h],
        [x0 + r.x0 * res - h, y0 + r.y1 * res + h]
      ]
    }));
  }

  /**
   * 主流程：找出一塊鋪銅裡的孤島。
   * opts: { res, clearance, minAreaMm2 (小於這個面積不回報，預設 0) }
   * 回 { islands: [{cells, areaMm2, cuts:[{pts}]}], stats }
   */
  function orphans(state, zone, padAbs, opts) {
    opts = Object.assign({ res: 0.1, minAreaMm2: 0 }, opts || {});
    // 無網路的鋪銅整塊本來就浮空，沒有「該連到哪裡」可言。
    // 硬套孤島判定會把整塊挖掉——那是刪掉使用者畫的東西，不是修正錯誤。
    if (!zone.net) {
      return {
        orphanIds: [], cuts: [],
        stats: { res: opts.res, blocks: 0, connected: 0, orphans: 0, orphanAreaMm2: 0, totalAreaMm2: 0, skipped: 'noNet' }
      };
    }
    const grid = rasterize(state, zone, padAbs, opts);
    const { lab, count, sizes } = label(grid);
    const connected = connectedIds(state, zone, padAbs, grid, lab);
    const cellArea = grid.res * grid.res;
    const orphanIds = [];
    for (let id = 1; id <= count; id++) {
      if (connected.has(id)) continue;
      if (sizes[id] * cellArea < opts.minAreaMm2) continue;
      orphanIds.push(id);
    }
    const cuts = orphanIds.length ? rectsOf(grid, lab, orphanIds) : [];
    return {
      orphanIds, cuts,
      stats: {
        res: grid.res, blocks: count,
        connected: connected.size, orphans: orphanIds.length,
        orphanAreaMm2: +(orphanIds.reduce((a, id) => a + sizes[id], 0) * cellArea).toFixed(3),
        totalAreaMm2: +(sizes.reduce((a, v) => a + v, 0) * cellArea).toFixed(3)
      }
    };
  }

  /** 對整份 state 的所有鋪銅跑一次；把 cuts 掛回 zone.orphanCuts */
  function apply(state, padAbs, opts) {
    let total = 0, zones = 0, area = 0;
    (state.userZones || []).forEach(z => {
      const r = orphans(state, z, padAbs, opts);
      z.orphanCuts = r.cuts;
      if (r.stats.orphans) { zones++; total += r.stats.orphans; area += r.stats.orphanAreaMm2; }
    });
    return { zones, islands: total, areaMm2: +area.toFixed(3) };
  }

  const Pour = { rasterize, label, connectedIds, rectsOf, orphans, apply, _inPoly: inPoly };
  if (typeof window !== 'undefined') window.PcbPour = Pour;
  if (typeof module !== 'undefined' && module.exports) module.exports = Pour;
})();
