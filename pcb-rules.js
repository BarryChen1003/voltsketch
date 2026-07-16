// Layout 規則引擎 + 飛線（ratsnest）
// window.NetRules：net 規則表（線寬下限/線長上限/差分對長度差），localStorage 持久
// window.Ratsnest：未連線飛線計算（pad/via/走線端點連通性，同 net 分量間拉最近點）
// 兩者皆純資料函式，node harness 可直接測。
(() => {
  const KEY = 'vs-net-rules-v1';
  const DEFAULTS = [
    { pattern: 'GND', minW: 0.3, maxLen: 0, pairTol: 0 },
    { pattern: 'VIN', minW: 0.5, maxLen: 0, pairTol: 0 },
    { pattern: '/_TX[PN]$/', minW: 0, maxLen: 50, pairTol: 0.5 }
  ];

  const matchPat = (pattern, net) => {
    if (!pattern || !net) return false;
    if (pattern.length > 2 && pattern[0] === '/' && pattern.endsWith('/')) {
      try { return new RegExp(pattern.slice(1, -1), 'i').test(net); } catch (e) { return false; }
    }
    return net.toLowerCase().includes(pattern.toLowerCase());
  };

  // i18n：I18N 未載（純 node harness）時回 key
  const T = (k, vars) => (typeof window !== 'undefined' && window.I18N) ? window.I18N.t(k, vars) : k;

  const NetRules = {
    load() {
      try {
        const s = (typeof localStorage !== 'undefined') && localStorage.getItem(KEY);
        if (s) return JSON.parse(s);
      } catch (e) { /* 損壞回預設 */ }
      return DEFAULTS.map(r => ({ ...r }));
    },
    save(rules) {
      try { if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, JSON.stringify(rules)); } catch (e) {}
    },
    // 第一條命中的規則生效
    match(rules, net) {
      for (const r of rules) if (matchPat(r.pattern, net)) return r;
      return null;
    },
    netLength(traces, net) {
      let L = 0;
      for (const t of traces) if ((t.net || '') === net) L += Math.hypot(t.x2 - t.x1, t.y2 - t.y1);
      return L;
    },
    // 全面稽核：給 DRC 用。回 [{type,message}]
    audit(rules, state) {
      const res = [];
      const traces = state.traces || [];
      const nets = [...new Set(traces.map(t => t.net).filter(Boolean))];
      // 1) 線寬下限（逐 net 聚合）
      for (const net of nets) {
        const r = this.match(rules, net);
        if (!r) continue;
        if (r.minW > 0) {
          const bad = traces.filter(t => t.net === net && (t.width || 0.3) < r.minW - 1e-9);
          if (bad.length) {
            const minSeen = Math.min(...bad.map(t => t.width || 0.3));
            res.push({ type: 'error', message: T('rule_minw', { net, n: bad.length, minW: r.minW, minSeen, pattern: r.pattern }) });
          }
        }
        // 2) 線長上限
        if (r.maxLen > 0) {
          const L = this.netLength(traces, net);
          if (L > r.maxLen + 1e-9)
            res.push({ type: 'error', message: T('rule_maxlen', { net, len: L.toFixed(2), maxLen: r.maxLen, pattern: r.pattern }) });
        }
      }
      // 3) 差分對長度差：pairTol>0 的規則，命中 net 依基底名配對（去尾 P/N/+/-/_P/_N）
      const pairGroups = r => {
        const hit = nets.filter(n => matchPat(r.pattern, n));
        const base = n => n.replace(/(_?[PN]|[+-])$/i, '');
        const groups = {};
        hit.forEach(n => { (groups[base(n)] = groups[base(n)] || []).push(n); });
        return Object.values(groups).filter(g => g.length === 2);
      };
      for (const r of rules) {
        if (!(r.pairTol > 0)) continue;
        for (const g of pairGroups(r)) {
          const L0 = this.netLength(traces, g[0]), L1 = this.netLength(traces, g[1]);
          const d = Math.abs(L0 - L1);
          if (d > r.pairTol + 1e-9)
            res.push({ type: 'warning', message: T('rule_pairlen', { a: g[0], la: L0.toFixed(2), b: g[1], lb: L1.toFixed(2), d: d.toFixed(2), tol: r.pairTol }) });
        }
      }
      // 4) 差分對間距/耦合：gap>0 的規則（目標邊到邊 gap，容差 ±max(25%, 0.05mm)）
      //    逐段分類：過近（< gap−tol）=error；耦合（gap±tol）；未耦合（> gap+tol 或同層無對手）
      //    未耦合長度佔比 > 20% 報 warning（進出 pad 的短引出段屬正常，故留佔比餘裕）
      const ptSeg = (px, py, x1, y1, x2, y2) => {
        const dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy;
        if (l2 === 0) return Math.hypot(px - x1, py - y1);
        let t = ((px - x1) * dx + (py - y1) * dy) / l2;
        t = Math.max(0, Math.min(1, t));
        return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
      };
      for (const r of rules) {
        if (!(r.gap > 0)) continue;
        const tol = Math.max(0.05, r.gap * 0.25);
        for (const g of pairGroups(r)) {
          const segsA = traces.filter(t => t.net === g[0]);
          const segsB = traces.filter(t => t.net === g[1]);
          if (!segsA.length || !segsB.length) continue;
          // 逐點取樣分類（每 ~0.5mm 一樣本）：整段取 min 會被「端點擦到」誤判整段耦合
          let total = 0, coupled = 0, tooClose = 0, worstClose = Infinity;
          for (const a of segsA) {
            const len = Math.hypot(a.x2 - a.x1, a.y2 - a.y1);
            if (len < 1e-9) continue;
            total += len;
            const nS = Math.max(2, Math.ceil(len / 0.5));
            const dl = len / nS;
            for (let s = 0; s < nS; s++) {
              const f = (s + 0.5) / nS;
              const px = a.x1 + (a.x2 - a.x1) * f, py = a.y1 + (a.y2 - a.y1) * f;
              let best = Infinity;
              for (const b of segsB) {
                if ((a.layer || 'F.Cu') !== (b.layer || 'F.Cu')) continue;
                const gap = ptSeg(px, py, b.x1, b.y1, b.x2, b.y2) - (a.width || 0.3) / 2 - (b.width || 0.3) / 2;
                if (gap < best) best = gap;
              }
              if (best < r.gap - tol - 1e-9) { tooClose += dl; worstClose = Math.min(worstClose, best); }
              else if (best <= r.gap + tol + 1e-9) coupled += dl;
            }
          }
          if (total < 1e-9) continue;
          if (tooClose > 1e-9)
            res.push({ type: 'error', message: T('rule_gap_close', { a: g[0], b: g[1], len: tooClose.toFixed(2), worst: Math.max(0, worstClose).toFixed(3), gap: r.gap, tol: tol.toFixed(2) }) });
          const unc = total - coupled - tooClose;
          if (unc > total * 0.2 + 1e-9)
            res.push({ type: 'warning', message: T('rule_gap_uncoupled', { a: g[0], b: g[1], unc: unc.toFixed(2), total: total.toFixed(2), pct: Math.round(unc / total * 100), gap: r.gap, tol: tol.toFixed(2) }) });
        }
      }
      return res;
    }
  };

  // ---------- 飛線 ----------
  const EPS = 0.05; // 端點視為同點的容差 mm
  const Ratsnest = {
    // 回傳 [{x1,y1,x2,y2,net}]。連通性：走線兩端／鄰近節點／T 接／鋪銅（點在同 net 同層鋪銅內＝連上）
    compute(state, padAbs) {
      const lines = [];
      // 蒐集節點：每 net → [{x,y,layer,r,key}]（union-find）
      const byNet = {};
      const add = (net, x, y, key, layer) => {
        if (!net) return null;
        const arr = byNet[net] = byNet[net] || [];
        const n = { x, y, id: arr.length, parent: arr.length, key, layer: layer || '*' };
        arr.push(n);
        return n;
      };
      (state.components || []).forEach(c => (c.pads || []).forEach(p => {
        if (p.cu === false || !p.net) return;
        const a = padAbs(c, p);
        const n = add(p.net, a.x, a.y, 'pad', p.side === '*' ? '*' : (p.side === 'B' ? 'B.Cu' : 'F.Cu'));
        if (n) n.r = Math.max(p.w || 0, p.h || 0) / 2 + EPS;
      }));
      (state.vias || []).forEach(v => {
        const n = add(v.net, v.x, v.y, 'via', '*');
        if (n) n.r = (v.od || 0.6) / 2 + EPS;
      });
      const traceNodes = {};
      (state.traces || []).forEach((t, i) => {
        if (!t.net) return;
        const L = t.layer || 'F.Cu';
        const a = add(t.net, t.x1, t.y1, 'te', L), b = add(t.net, t.x2, t.y2, 'te', L);
        if (a && b) traceNodes[t.net + '|' + i] = [a, b, t];
      });
      // 鋪銅 → 虛擬 hub 節點（座標取外框第一點，僅在孤立時可能成為飛線端點）
      const zonesByNet = {};
      (state.zoneFills || []).concat(state.userZones || []).forEach(z => {
        if (!z.net || !(z.pts || []).length) return;
        (zonesByNet[z.net] = zonesByNet[z.net] || []).push(z);
      });
      Object.entries(zonesByNet).forEach(([net, zs]) => {
        zs.forEach(z => {
          const n = add(net, z.pts[0][0], z.pts[0][1], 'zone', z.layer || 'F.Cu');
          if (n) n.zpts = z.pts;
        });
      });

      const find = (arr, i) => { while (arr[i].parent !== i) i = arr[i].parent = arr[arr[i].parent].parent; return i; };
      const union = (arr, a, b) => { const ra = find(arr, a.id), rb = find(arr, b.id); if (ra !== rb) arr[ra].parent = rb; };
      const layerOk = (a, b) => a === '*' || b === '*' || a === b;

      for (const [net, arr] of Object.entries(byNet)) {
        // 走線自身兩端相連
        Object.entries(traceNodes).forEach(([k, [a, b]]) => { if (k.startsWith(net + '|')) union(arr, a, b); });
        // 節點鄰近合併（pad/via 半徑、端點 EPS；跨層不併——via 是 '*' 可跨）
        for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) {
          const a = arr[i], b = arr[j];
          if (a.key === 'zone' || b.key === 'zone') continue;
          if (!layerOk(a.layer, b.layer)) continue;
          if (Math.hypot(a.x - b.x, a.y - b.y) <= Math.max(a.r || EPS, b.r || EPS)) union(arr, a, b);
        }
        // T 接：pad/via 落在走線段上
        Object.entries(traceNodes).forEach(([k, [a, , t]]) => {
          if (!k.startsWith(net + '|')) return;
          for (const n of arr) {
            if (n.key === 'te' || n.key === 'zone') continue;
            if (!layerOk(n.layer, t.layer || 'F.Cu')) continue;
            if (ptSeg(n.x, n.y, t.x1, t.y1, t.x2, t.y2) <= (n.r || EPS)) union(arr, a, n);
          }
        });
        // 鋪銅連通：同層節點落在鋪銅多邊形內（或距外框 EPS 內）
        for (const zn of arr) {
          if (zn.key !== 'zone') continue;
          for (const n of arr) {
            if (n === zn || n.key === 'zone') continue;
            if (!layerOk(n.layer, zn.layer)) continue;
            if (ptInPoly(n.x, n.y, zn.zpts) || distToPoly(n.x, n.y, zn.zpts) <= (n.r || EPS)) union(arr, zn, n);
          }
        }
        // 分量 → 貪婪接最近對；只含 zone 虛擬點的孤立分量不畫飛線
        const comps = {};
        arr.forEach(n => { const r = find(arr, n.id); (comps[r] = comps[r] || []).push(n); });
        const groups = Object.values(comps).filter(g => g.some(n => n.key !== 'zone'));
        if (groups.length <= 1) continue;
        while (groups.length > 1) {
          let best = null;
          for (let i = 1; i < groups.length; i++) {
            for (const a of groups[0]) for (const b of groups[i]) {
              if (a.key === 'zone' || b.key === 'zone') continue;
              const d = Math.hypot(a.x - b.x, a.y - b.y);
              if (!best || d < best.d) best = { d, a, b, gi: i };
            }
          }
          if (!best) break; // 分量只剩 zone 點，無實體節點可拉線
          lines.push({ x1: best.a.x, y1: best.a.y, x2: best.b.x, y2: best.b.y, net });
          groups[0] = groups[0].concat(groups.splice(best.gi, 1)[0]);
        }
      }
      return lines;

      function ptSeg(px, py, x1, y1, x2, y2) {
        const dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy;
        if (l2 === 0) return Math.hypot(px - x1, py - y1);
        let t = ((px - x1) * dx + (py - y1) * dy) / l2;
        t = Math.max(0, Math.min(1, t));
        return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
      }
      function ptInPoly(px, py, pts) {
        let inside = false;
        for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
          const xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
          if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) inside = !inside;
        }
        return inside;
      }
      function distToPoly(px, py, pts) {
        let m = Infinity;
        for (let i = 0, j = pts.length - 1; i < pts.length; j = i++)
          m = Math.min(m, ptSeg(px, py, pts[j][0], pts[j][1], pts[i][0], pts[i][1]));
        return m;
      }
    }
  };

  // ---------- 單網 A* 佈線（試驗性：單層、格點 0.25mm、8 向、無推擠無 via 插入） ----------
  const AutoRoute = {
    route(state, padAbs, line, opt) {
      opt = Object.assign({ grid: 0.25, clearance: 0.15, width: 0.25, layer: 'F.Cu', maxCells: 500000 }, opt || {});
      const W = state.boardWidth || 100, H = state.boardHeight || 80;
      const g = opt.grid, ox = -W / 2, oy = -H / 2;
      const nx = Math.floor(W / g) + 1, ny = Math.floor(H / g) + 1;
      if (nx * ny > opt.maxCells) return { ok: false, reason: T('rule_grid_too_big') };
      const blocked = new Uint8Array(nx * ny);
      const idx = (ix, iy) => iy * nx + ix;
      const inb = (ix, iy) => ix >= 0 && iy >= 0 && ix < nx && iy < ny;
      const mark = (x, y, r) => {
        const x0 = Math.max(0, Math.floor((x - r - ox) / g)), x1 = Math.min(nx - 1, Math.ceil((x + r - ox) / g));
        const y0 = Math.max(0, Math.floor((y - r - oy) / g)), y1 = Math.min(ny - 1, Math.ceil((y + r - oy) / g));
        for (let iy = y0; iy <= y1; iy++) for (let ix = x0; ix <= x1; ix++)
          if (Math.hypot(ox + ix * g - x, oy + iy * g - y) <= r) blocked[idx(ix, iy)] = 1;
      };
      const markSeg = (x1, y1, x2, y2, r) => {
        const L = Math.hypot(x2 - x1, y2 - y1), n = Math.max(1, Math.ceil(L / (g / 2)));
        for (let i = 0; i <= n; i++) mark(x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n, r);
      };
      const margin = opt.clearance + opt.width / 2;
      const net = line.net || '';
      (state.components || []).forEach(c => (c.pads || []).forEach(p => {
        if (p.cu === false) return;
        if (net && (p.net || '') === net) return;
        const sideOk = p.side === '*' || (opt.layer === 'F.Cu' && p.side === 'F') || (opt.layer === 'B.Cu' && p.side === 'B');
        if (!sideOk) return;
        const a = padAbs(c, p);
        mark(a.x, a.y, Math.hypot(p.w || 0.5, p.h || 0.5) / 2 + margin);
      }));
      (state.traces || []).forEach(t => {
        if ((t.layer || 'F.Cu') !== opt.layer) return;
        if (net && (t.net || '') === net) return;
        markSeg(t.x1, t.y1, t.x2, t.y2, (t.width || 0.3) / 2 + margin);
      });
      (state.vias || []).forEach(v => {
        if (net && (v.net || '') === net) return;
        mark(v.x, v.y, (v.od || 0.6) / 2 + margin);
      });
      const toCell = (x, y) => [Math.round((x - ox) / g), Math.round((y - oy) / g)];
      const [sx, sy] = toCell(line.x1, line.y1), [ex, ey] = toCell(line.x2, line.y2);
      if (!inb(sx, sy) || !inb(ex, ey)) return { ok: false, reason: T('rule_ep_outside') };
      if (blocked[idx(sx, sy)] || blocked[idx(ex, ey)]) return { ok: false, reason: T('rule_ep_blocked') };
      // A*（binary heap）
      const gc = new Float32Array(nx * ny).fill(Infinity);
      const par = new Int32Array(nx * ny).fill(-1);
      const heap = [];
      const push = (f, i) => { heap.push([f, i]); let k = heap.length - 1; while (k > 0) { const p = (k - 1) >> 1; if (heap[p][0] <= heap[k][0]) break; [heap[p], heap[k]] = [heap[k], heap[p]]; k = p; } };
      const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let k = 0; for (;;) { const l = 2 * k + 1, r = l + 1; let m = k; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === k) break; [heap[m], heap[k]] = [heap[k], heap[m]]; k = m; } } return top; };
      const h = (ix, iy) => { const dx = Math.abs(ix - ex), dy = Math.abs(iy - ey); return (dx + dy) + (1.41421356 - 2) * Math.min(dx, dy); };
      const s0 = idx(sx, sy);
      gc[s0] = 0; push(h(sx, sy), s0);
      const DIR = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.41421356], [1, -1, 1.41421356], [-1, 1, 1.41421356], [-1, -1, 1.41421356]];
      const goal = idx(ex, ey);
      let found = false, guard = 0;
      while (heap.length) {
        if (++guard > nx * ny * 12) break;
        const [f, cur] = pop();
        if (f > gc[cur] + h(cur % nx, Math.floor(cur / nx)) + 1e-6) continue; // 淘汰 stale 項（lazy deletion）
        if (cur === goal) { found = true; break; }
        const cy0 = Math.floor(cur / nx), cx0 = cur % nx;
        for (const [dx, dy, w] of DIR) {
          const ix = cx0 + dx, iy = cy0 + dy;
          if (!inb(ix, iy)) continue;
          const ni = idx(ix, iy);
          if (blocked[ni]) continue;
          if (dx && dy && (blocked[idx(cx0 + dx, cy0)] || blocked[idx(cx0, cy0 + dy)])) continue; // 禁切角
          const ng = gc[cur] + w;
          if (ng < gc[ni] - 1e-9) { gc[ni] = ng; par[ni] = cur; push(ng + h(ix, iy), ni); }
        }
      }
      if (!found) return { ok: false, reason: T('rule_no_path') };
      // 回溯 + 共線合併
      const cells = [];
      for (let cur = goal; cur !== -1; cur = par[cur]) cells.push([cur % nx, Math.floor(cur / nx)]);
      cells.reverse();
      const pts = [[line.x1, line.y1]];
      let pd = null;
      for (let i = 1; i < cells.length; i++) {
        const d = [cells[i][0] - cells[i - 1][0], cells[i][1] - cells[i - 1][1]];
        if (pd && (d[0] !== pd[0] || d[1] !== pd[1])) pts.push([ox + cells[i - 1][0] * g, oy + cells[i - 1][1] * g]);
        pd = d;
      }
      pts.push([line.x2, line.y2]);
      const segs = [];
      for (let i = 1; i < pts.length; i++) {
        if (Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]) < 1e-9) continue;
        segs.push({ x1: pts[i - 1][0], y1: pts[i - 1][1], x2: pts[i][0], y2: pts[i][1] });
      }
      return { ok: true, segs };
    }
  };

  window.NetRules = NetRules;
  window.Ratsnest = Ratsnest;
  window.AutoRoute = AutoRoute;
})();
