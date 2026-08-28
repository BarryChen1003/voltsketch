/**
 * pcb-index.js — 共用空間索引
 *
 * 為什麼要有：DRC、繞線、鋪銅目前各自臨時建一套網格（pcb-drc.js 的 SpatialGrid、
 * pcb-rules.js 裡兩處手寫的 cell 桶化、pcb-pour.js 的柵格）。同一份幾何被重複整理
 * 三次，而且三套的邊界處理細節不完全一樣——改了其中一套的行為，另外兩套不會跟著改。
 *
 * 跟 pcb-drc.js 內建那一版的差別：
 *   1. **可以移除**。原本那版只有 insert/query，所以「改一條線」只能整個重建。
 *      增量 DRC 需要的是「拔掉舊的、放進新的」。
 *   2. 帶 id，query 回傳的是 id 集合，呼叫端自己查物件——避免同一個物件
 *      在多個桶裡被回傳多次時還要靠物件參照去重。
 *   3. 外框計算集中在這裡（走線／弧／via／pad 各一個），三個模組不必各算各的。
 *
 * 格子大小的選法：取「最大物件尺寸」等級。太小會讓一個長走線插進上百個桶，
 * 太大會退化成全比對。呼叫端沒指定時用 autoCell 從資料本身估。
 *
 * 純函式：不碰 DOM，node 可直接測。測試：pcb-index.test.js
 */
(function (root) {
  'use strict';

  const box = (x0, y0, x1, y1) => ({
    x0: Math.min(x0, x1), y0: Math.min(y0, y1),
    x1: Math.max(x0, x1), y1: Math.max(y0, y1),
  });

  const expand = (b, m) => ({ x0: b.x0 - m, y0: b.y0 - m, x1: b.x1 + m, y1: b.y1 + m });

  const overlaps = (a, b) => !(a.x1 < b.x0 || b.x1 < a.x0 || a.y1 < b.y0 || b.y1 < a.y0);

  function union(list) {
    const bs = (list || []).filter(Boolean);
    if (!bs.length) return null;
    let o = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
    for (const b of bs) {
      o.x0 = Math.min(o.x0, b.x0); o.y0 = Math.min(o.y0, b.y0);
      o.x1 = Math.max(o.x1, b.x1); o.y1 = Math.max(o.y1, b.y1);
    }
    return o;
  }

  const area = b => (b ? Math.max(0, b.x1 - b.x0) * Math.max(0, b.y1 - b.y0) : 0);

  // ---- 圖元外框 ----
  // 一律含半寬：DRC 量的是銅箔邊緣，不是中心線。忘了加半寬會讓貼邊的東西被篩掉。
  function traceBox(t, margin) {
    const hw = (t.width || 0.3) / 2 + (margin || 0);
    if (t.arc && root.PcbArc) {
      const b = root.PcbArc.bbox(t.arc);
      return expand(box(b.x0, b.y0, b.x1, b.y1), hw);
    }
    return expand(box(t.x1, t.y1, t.x2, t.y2), hw);
  }

  function viaBox(v, margin) {
    const r = (v.d || v.drill || 0.3) / 2 + (margin || 0);
    return box(v.x - r, v.y - r, v.x + r, v.y + r);
  }

  // pad 已經被 padShape 算成含旋轉的外接圓時，用 circ；否則用 w/h
  function padBox(p, margin) {
    const m = margin || 0;
    if (p.circ != null && p.cx != null) return box(p.cx - p.circ - m, p.cy - p.circ - m, p.cx + p.circ + m, p.cy + p.circ + m);
    const hw = Math.max(p.w || 0, p.h || 0) / 2 + m;   // 旋轉未知時取較長邊，寧可多篩一點
    return box(p.x - hw, p.y - hw, p.x + hw, p.y + hw);
  }

  function polyBox(pts, margin) {
    if (!pts || !pts.length) return null;
    const xs = pts.map(p => (Array.isArray(p) ? p[0] : p.x));
    const ys = pts.map(p => (Array.isArray(p) ? p[1] : p.y));
    return expand(box(Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)), margin || 0);
  }

  /**
   * 從外框清單估一個合理的格子大小。
   * 取「平均邊長」而不是最大：一片板上通常有一兩條超長的電源走線，
   * 用最大值會讓格子大到整塊板只有一格，索引等於沒有。
   */
  function autoCell(boxes, fallback) {
    const bs = (boxes || []).filter(Boolean);
    if (!bs.length) return fallback || 1;
    let sum = 0;
    for (const b of bs) sum += Math.max(b.x1 - b.x0, b.y1 - b.y0);
    const avg = sum / bs.length;
    return Math.max(0.25, Math.min(50, avg || (fallback || 1)));
  }

  /**
   * 空間索引。id 可以是任何字串或數字。
   */
  function create(cell) {
    const c = cell > 0 ? cell : 1;
    const buckets = new Map();     // "ix,iy" → Set(id)
    const boxes = new Map();       // id → box（移除時要知道它在哪些桶）
    const key = (ix, iy) => ix + ',' + iy;

    const each = (b, fn) => {
      const x0 = Math.floor(b.x0 / c), x1 = Math.floor(b.x1 / c);
      const y0 = Math.floor(b.y0 / c), y1 = Math.floor(b.y1 / c);
      for (let iy = y0; iy <= y1; iy++) for (let ix = x0; ix <= x1; ix++) fn(key(ix, iy));
    };

    return {
      cell: c,
      insert(id, b) {
        if (!b) return false;
        if (boxes.has(id)) this.remove(id);
        boxes.set(id, b);
        each(b, k => {
          let s = buckets.get(k);
          if (!s) { s = new Set(); buckets.set(k, s); }
          s.add(id);
        });
        return true;
      },
      remove(id) {
        const b = boxes.get(id);
        if (!b) return false;
        each(b, k => {
          const s = buckets.get(k);
          if (!s) return;
          s.delete(id);
          if (!s.size) buckets.delete(k);
        });
        boxes.delete(id);
        return true;
      },
      // 回傳可能與 b 重疊的 id（外框已先過一次，所以不會回傳明顯不相干的）
      query(b) {
        const out = new Set();
        if (!b) return out;
        each(b, k => {
          const s = buckets.get(k);
          if (!s) return;
          for (const id of s) {
            const ob = boxes.get(id);
            if (ob && overlaps(ob, b)) out.add(id);
          }
        });
        return out;
      },
      boxOf: id => boxes.get(id) || null,
      has: id => boxes.has(id),
      size: () => boxes.size,
      buckets: () => buckets.size,
      clear() { buckets.clear(); boxes.clear(); },
      ids: () => [...boxes.keys()],
    };
  }

  /**
   * 從一批改動算出「要重新檢查的範圍」。
   * @param changes [{ before: box|null, after: box|null }]
   * @param margin  間距規則（要把規則距離算進去，不然剛好在邊界外的鄰居會被漏掉）
   *
   * before 與 after 都要算：一條走線從 A 移到 B，A 附近原本的違規要消失、
   * B 附近可能出現新的違規。只算 after 的話，舊位置的違規會永遠留著。
   */
  function dirtyRect(changes, margin) {
    const bs = [];
    for (const ch of (changes || [])) {
      if (ch && ch.before) bs.push(ch.before);
      if (ch && ch.after) bs.push(ch.after);
    }
    const u = union(bs);
    return u ? expand(u, margin || 0) : null;
  }

  const PcbIndex = {
    create, box, expand, overlaps, union, area, autoCell, dirtyRect,
    traceBox, viaBox, padBox, polyBox,
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = PcbIndex;
  root.PcbIndex = PcbIndex;
})(typeof window !== 'undefined' ? window : globalThis);
