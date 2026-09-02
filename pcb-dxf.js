// DXF 板框匯入／匯出
//
// 為什麼需要：板框常常不是我們畫的——結構工程師給一張 DXF，上面有外形、螺絲孔、
// 避讓缺口。手動照著描一定會差，差幾條線板廠就切錯。
//
// 比「讀進來就好」多做的事：
//   1. **單位**：DXF 的 $INSUNITS 常常沒填或填錯。有填就照它換算，沒填就明講「假設 mm」，
//      並回報尺寸讓使用者一眼看出是不是差了 25.4 倍。
//   2. **封閉性**：板框沒封閉板廠切不出來。這裡把線段接成迴路，開口在哪個座標直接指出來。
//      EasyEDA 讓你匯進來，等送件被退才知道。
//   3. **弧線**：ARC/CIRCLE/LWPOLYLINE 的 bulge 都轉成線段，弦高誤差可設定並回報。
//
// 純函式（不碰 DOM），node 可直接測。
(() => {
  'use strict';

  const MM_PER_INCH = 25.4;
  // $INSUNITS 對照（DXF 規格）。只列會遇到的，其餘回 null 讓呼叫端知道「沒認出來」。
  const UNIT_MM = { 1: MM_PER_INCH, 2: MM_PER_INCH * 12, 4: 1, 5: 10, 6: 1000, 13: 1e-6 };

  // DXF 是「群組碼 / 值」成對出現的文字檔
  function tokenize(text) {
    const lines = String(text).split(/\r?\n/);
    const out = [];
    for (let i = 0; i + 1 < lines.length; i += 2) {
      const code = parseInt(lines[i].trim(), 10);
      if (isNaN(code)) continue;
      out.push([code, lines[i + 1].trim()]);
    }
    return out;
  }

  // 圓弧轉線段：依弦高誤差決定段數，段數至少 4、至多 256
  function arcSegs(cx, cy, r, a0deg, a1deg, sag) {
    const tol = sag > 0 ? sag : 0.02;
    let sweep = (a1deg - a0deg) % 360;
    if (sweep <= 0) sweep += 360;
    const rad = sweep * Math.PI / 180;
    // 弦高 = r(1-cos(θ/2))，反解每段角度
    const per = 2 * Math.acos(Math.max(-1, Math.min(1, 1 - tol / Math.max(r, 1e-9))));
    let n = Math.ceil(rad / Math.max(per, 1e-6));
    n = Math.max(4, Math.min(256, n));
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const a = (a0deg + sweep * i / n) * Math.PI / 180;
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    const segs = [];
    for (let i = 1; i < pts.length; i++)
      segs.push({ x1: pts[i - 1][0], y1: pts[i - 1][1], x2: pts[i][0], y2: pts[i][1] });
    return segs;
  }

  // LWPOLYLINE 的 bulge：b = tan(θ/4)，θ 為包含角（正為逆時針）
  function bulgeSegs(x1, y1, x2, y2, b, sag) {
    if (!b) return [{ x1, y1, x2, y2 }];
    const theta = 4 * Math.atan(b);
    const d = Math.hypot(x2 - x1, y2 - y1);
    if (d < 1e-12) return [];
    const r = d / (2 * Math.sin(Math.abs(theta) / 2));
    // 圓心：弦中點沿法向偏移
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    const h = r * Math.cos(theta / 2);
    const ux = (x2 - x1) / d, uy = (y2 - y1) / d;
    const cx = mx - uy * h * Math.sign(theta) * -1;
    const cy = my + ux * h * Math.sign(theta) * -1;
    const a0 = Math.atan2(y1 - cy, x1 - cx) * 180 / Math.PI;
    const a1 = Math.atan2(y2 - cy, x2 - cx) * 180 / Math.PI;
    return theta > 0 ? arcSegs(cx, cy, r, a0, a1, sag) : arcSegs(cx, cy, r, a1, a0, sag).reverse()
      .map(s => ({ x1: s.x2, y1: s.y2, x2: s.x1, y2: s.y1 }));
  }

  /**
   * 解析 DXF。opts: { layer (只取這一層), sagitta (弧線弦高誤差 mm), assumeUnit ('mm'|'inch') }
   * 回 { segs, unitScale, unitSource, entities, warnings }
   */
  function parse(text, opts) {
    opts = opts || {};
    const toks = tokenize(text);
    const warnings = [];
    const entities = {};
    const segs = [];

    // ---- 單位 ----
    let unitScale = null, unitSource = 'none';
    for (let i = 0; i + 1 < toks.length; i++) {
      if (toks[i][0] === 9 && toks[i][1] === '$INSUNITS') {
        const v = parseInt(toks[i + 1][1], 10);
        if (UNIT_MM[v] != null) { unitScale = UNIT_MM[v]; unitSource = '$INSUNITS=' + v; }
        else warnings.push({ code: 'unknownUnits', value: v });
        break;
      }
    }
    if (unitScale == null) {
      unitScale = opts.assumeUnit === 'inch' ? MM_PER_INCH : 1;
      unitSource = 'assumed:' + (opts.assumeUnit === 'inch' ? 'inch' : 'mm');
      warnings.push({ code: 'unitsAssumed', assumed: opts.assumeUnit === 'inch' ? 'inch' : 'mm' });
    }

    const sag = (opts.sagitta > 0 ? opts.sagitta : 0.02) / unitScale;   // 誤差門檻換到 DXF 座標系
    const wantLayer = opts.layer || null;

    // ---- 實體 ----
    let i = 0;
    // 跳到 ENTITIES 段；沒有就整份掃（有些簡化輸出沒有 SECTION 結構）
    const entIdx = toks.findIndex((t, k) => t[0] === 2 && t[1] === 'ENTITIES');
    if (entIdx >= 0) i = entIdx + 1; else warnings.push({ code: 'noEntitiesSection' });

    const readEntity = start => {
      const g = {};                                   // 群組碼 → 值（重複的存陣列）
      let k = start + 1;
      for (; k < toks.length; k++) {
        const [c, v] = toks[k];
        if (c === 0) break;                           // 下一個實體
        if (g[c] === undefined) g[c] = [v]; else g[c].push(v);
      }
      return { g, next: k };
    };
    const num = (g, c, d) => (g[c] && g[c].length ? parseFloat(g[c][0]) : d);

    while (i < toks.length) {
      const [code, val] = toks[i];
      if (code !== 0) { i++; continue; }
      if (val === 'ENDSEC' || val === 'EOF') break;
      const { g, next } = readEntity(i);
      const layer = (g[8] && g[8][0]) || '0';
      const take = !wantLayer || layer === wantLayer;
      entities[val] = (entities[val] || 0) + 1;

      if (take) {
        if (val === 'LINE') {
          segs.push({ x1: num(g, 10, 0), y1: num(g, 20, 0), x2: num(g, 11, 0), y2: num(g, 21, 0) });
        } else if (val === 'CIRCLE') {
          arcSegs(num(g, 10, 0), num(g, 20, 0), num(g, 40, 0), 0, 360, sag).forEach(s => segs.push(s));
        } else if (val === 'ARC') {
          arcSegs(num(g, 10, 0), num(g, 20, 0), num(g, 40, 0), num(g, 50, 0), num(g, 51, 0), sag).forEach(s => segs.push(s));
        } else if (val === 'LWPOLYLINE') {
          const xs = (g[10] || []).map(Number), ys = (g[20] || []).map(Number);
          const closed = (num(g, 70, 0) & 1) === 1;
          // bulge（42）只出現在有弧的頂點，位置無法只靠順序對齊，
          // 所以逐頂點對齊：DXF 規範 42 緊接在該頂點的 10/20 之後。這裡重掃一次取得對應。
          const bulges = lwBulges(toks, i, next);
          const n = Math.min(xs.length, ys.length);
          for (let v = 1; v < n; v++)
            bulgeSegs(xs[v - 1], ys[v - 1], xs[v], ys[v], bulges[v - 1] || 0, sag).forEach(s => segs.push(s));
          if (closed && n > 2)
            bulgeSegs(xs[n - 1], ys[n - 1], xs[0], ys[0], bulges[n - 1] || 0, sag).forEach(s => segs.push(s));
        } else if (val === 'POLYLINE') {
          // 舊式 POLYLINE：後面接一串 VERTEX，直到 SEQEND
          const closed = (num(g, 70, 0) & 1) === 1;
          const pts = [];
          let k = next;
          while (k < toks.length) {
            if (toks[k][0] !== 0) { k++; continue; }
            if (toks[k][1] === 'SEQEND') { k++; break; }
            if (toks[k][1] !== 'VERTEX') break;
            const ve = readEntity(k);
            pts.push([num(ve.g, 10, 0), num(ve.g, 20, 0)]);
            k = ve.next;
          }
          for (let v = 1; v < pts.length; v++)
            segs.push({ x1: pts[v - 1][0], y1: pts[v - 1][1], x2: pts[v][0], y2: pts[v][1] });
          if (closed && pts.length > 2)
            segs.push({ x1: pts[pts.length - 1][0], y1: pts[pts.length - 1][1], x2: pts[0][0], y2: pts[0][1] });
          i = k; continue;
        }
      }
      i = next;
    }

    // 換算成 mm 並丟掉零長線段
    const out = segs
      .map(s => ({ x1: s.x1 * unitScale, y1: s.y1 * unitScale, x2: s.x2 * unitScale, y2: s.y2 * unitScale }))
      .filter(s => Math.hypot(s.x2 - s.x1, s.y2 - s.y1) > 1e-9);
    if (!out.length) warnings.push({ code: 'noGeometry' });
    return { segs: out, unitScale, unitSource, entities, warnings };
  }

  // LWPOLYLINE 的 bulge 需要知道它接在哪個頂點後面，只看 42 的順序會錯位
  function lwBulges(toks, start, end) {
    const b = [];
    let vi = -1;
    for (let k = start + 1; k < end; k++) {
      const [c] = toks[k];
      if (c === 10) { vi++; b[vi] = 0; }
      else if (c === 42 && vi >= 0) b[vi] = parseFloat(toks[k][1]) || 0;
    }
    return b;
  }

  /**
   * 封閉性檢查：把線段接成迴路，回報開口。
   * 板框沒封閉板廠切不出來，這是匯入之後最該先問的一件事。
   */
  function checkClosed(segs, tol) {
    const t = tol > 0 ? tol : 0.01;
    // 依實際距離分群，不用格點取整：取整會讓 0 與 0.005 在容差 0.01 下
    // 落到不同的桶（round(0.5) 進位），明明接得上卻被判成兩個開口。
    const clusters = [];   // {x, y, n}
    const put = (x, y) => {
      for (const c of clusters) {
        if (Math.hypot(c.x - x, c.y - y) <= t) { c.n++; return; }
      }
      clusters.push({ x, y, n: 1 });
    };
    for (const s of segs) { put(s.x1, s.y1); put(s.x2, s.y2); }
    const deg = new Map(), pos = new Map();
    clusters.forEach((c, i) => { deg.set(i, c.n); pos.set(i, [c.x, c.y]); });
    // 封閉輪廓上每個端點都應該剛好被兩條線用到
    const open = [], branch = [];
    deg.forEach((n, k) => {
      if (n === 1) open.push({ x: pos.get(k)[0], y: pos.get(k)[1] });
      else if (n > 2) branch.push({ x: pos.get(k)[0], y: pos.get(k)[1], n });
    });
    return { closed: open.length === 0, openEnds: open, branchPoints: branch };
  }

  /** 置中並回板框尺寸；PCB 的座標系以板中心為原點 */
  function toBoard(segs, opts) {
    opts = opts || {};
    if (!segs.length) return { edgeSegs: [], w: 0, h: 0, bbox: null };
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    segs.forEach(s => {
      x0 = Math.min(x0, s.x1, s.x2); x1 = Math.max(x1, s.x1, s.x2);
      y0 = Math.min(y0, s.y1, s.y2); y1 = Math.max(y1, s.y1, s.y2);
    });
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    // DXF 的 Y 軸向上，畫布向下；跟 KiCad 匯入一致取負
    const flip = opts.flipY === false ? 1 : -1;
    return {
      edgeSegs: segs.map(s => ({
        x1: s.x1 - cx, y1: (s.y1 - cy) * flip,
        x2: s.x2 - cx, y2: (s.y2 - cy) * flip
      })),
      w: +(x1 - x0).toFixed(4), h: +(y1 - y0).toFixed(4),
      bbox: { x0, x1, y0, y1 }
    };
  }

  /** 匯出：把板框（與可選的鑽孔）寫成 DXF，給結構工程師對位 */
  function build(state, opts) {
    opts = opts || {};
    const L = ['0', 'SECTION', '2', 'HEADER', '9', '$INSUNITS', '70', '4', '0', 'ENDSEC',
      '0', 'SECTION', '2', 'ENTITIES'];
    const line = (x1, y1, x2, y2, layer) => {
      L.push('0', 'LINE', '8', layer, '10', String(x1), '20', String(-y1), '30', '0',
        '11', String(x2), '21', String(-y2), '31', '0');
    };
    const segs = (state.edgeSegs && state.edgeSegs.length) ? state.edgeSegs : (() => {
      const w = (state.boardWidth || 100) / 2, h = (state.boardHeight || 80) / 2;
      return [{ x1: -w, y1: -h, x2: w, y2: -h }, { x1: w, y1: -h, x2: w, y2: h },
              { x1: w, y1: h, x2: -w, y2: h }, { x1: -w, y1: h, x2: -w, y2: -h }];
    })();
    segs.forEach(s => line(s.x1, s.y1, s.x2, s.y2, 'Edge_Cuts'));
    if (opts.holes !== false) {
      (state.vias || []).forEach(v => {
        const r = (v.id || v.drill || 0.3) / 2;
        L.push('0', 'CIRCLE', '8', 'Drill', '10', String(v.x), '20', String(-v.y), '30', '0', '40', String(r));
      });
    }
    L.push('0', 'ENDSEC', '0', 'EOF');
    return L.join('\n') + '\n';
  }

  const Dxf = { parse, checkClosed, toBoard, build, _arcSegs: arcSegs, _bulgeSegs: bulgeSegs, MM_PER_INCH };
  if (typeof window !== 'undefined') window.PcbDxf = Dxf;
  if (typeof module !== 'undefined' && module.exports) module.exports = Dxf;
})();
