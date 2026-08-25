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

      // traceNodes 先照 net 分桶：原本每個 net 都掃過整份 traceNodes 做字串前綴比對，
      // 50 個 net × 2 萬條走線＝100 萬次 startsWith，光這裡就佔掉大半時間。
      const tnByNet = new Map();
      Object.entries(traceNodes).forEach(entry => {
        const k = entry[0];
        const at = k.indexOf('|');
        const n = at < 0 ? '' : k.slice(0, at);
        let a = tnByNet.get(n);
        if (!a) { a = []; tnByNet.set(n, a); }
        a.push(entry[1]);
      });

      for (const [net, arr] of Object.entries(byNet)) {
        const tns = tnByNet.get(net) || [];
        // 走線自身兩端相連
        tns.forEach(v => union(arr, v[0], v[1]));

        // 節點鄰近合併與 T 接原本都是全比對（節點² 與 走線×節點）。
        // 這裡用空間網格只比鄰桶：判定條件一字未改，網格只是候選篩選。
        let maxR = EPS;
        for (const n of arr) if ((n.r || EPS) > maxR) maxR = n.r || EPS;
        const cell = Math.max(0.5, 2 * maxR);
        const nodeBuckets = new Map();
        const bk = (ix, iy) => ix + ',' + iy;
        arr.forEach((n, i) => {
          if (n.key === 'zone') return;
          const k = bk(Math.floor(n.x / cell), Math.floor(n.y / cell));
          let a = nodeBuckets.get(k);
          if (!a) { a = []; nodeBuckets.set(k, a); }
          a.push(i);
        });
        const nearIdx = (x, y, r) => {
          const out = [];
          const x0 = Math.floor((x - r) / cell), x1 = Math.floor((x + r) / cell);
          const y0 = Math.floor((y - r) / cell), y1 = Math.floor((y + r) / cell);
          for (let iy = y0; iy <= y1; iy++) for (let ix = x0; ix <= x1; ix++) {
            const a = nodeBuckets.get(bk(ix, iy));
            if (a) for (let t = 0; t < a.length; t++) out.push(a[t]);
          }
          return out;
        };

        // 節點鄰近合併（pad/via 半徑、端點 EPS；跨層不併——via 是 '*' 可跨）
        for (let i = 0; i < arr.length; i++) {
          const a = arr[i];
          if (a.key === 'zone') continue;
          for (const j of nearIdx(a.x, a.y, maxR)) {
            if (j <= i) continue;
            const b = arr[j];
            if (b.key === 'zone') continue;
            if (!layerOk(a.layer, b.layer)) continue;
            if (Math.hypot(a.x - b.x, a.y - b.y) <= Math.max(a.r || EPS, b.r || EPS)) union(arr, a, b);
          }
        }
        // T 接：pad/via 落在走線段上
        tns.forEach(v => {
          const a = v[0], t = v[2];
          const cx = (t.x1 + t.x2) / 2, cy = (t.y1 + t.y2) / 2;
          const half = Math.hypot(t.x2 - t.x1, t.y2 - t.y1) / 2 + maxR;
          for (const idx of nearIdx(cx, cy, half)) {
            const n = arr[idx];
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
        // 這就是 Prim：每次把離「已連起來那一堆」最近的分量接上。
        // 舊寫法每一輪都重掃整個已合併集合 × 所有剩餘分量，比二次方還差
        //（2 萬條走線的板量到 51 秒）。改成惰性更新：每個未併入的分量只記
        // 自己對已併入集合的最近點對，新併入一塊時只拿「新加入的點」去更新。
        // 產生的邊與舊寫法相同（同樣是最小生成樹，取最近者併入）。
        const real = g => g.filter(n => n.key !== 'zone');
        const rest = [];
        for (let i = 1; i < groups.length; i++) {
          const nodes = real(groups[i]);
          if (nodes.length) rest.push({ nodes, best: null });
        }
        let frontier = real(groups[0]);
        while (rest.length && frontier.length) {
          for (const r of rest) {
            for (const a of frontier) for (const b of r.nodes) {
              const d = Math.hypot(a.x - b.x, a.y - b.y);
              if (!r.best || d < r.best.d) r.best = { d, a, b };
            }
          }
          let bi = -1;
          for (let i = 0; i < rest.length; i++)
            if (rest[i].best && (bi < 0 || rest[i].best.d < rest[bi].best.d)) bi = i;
          if (bi < 0) break;   // 剩下的分量只有 zone 點，沒有實體節點可拉線
          const pick = rest.splice(bi, 1)[0];
          lines.push({ x1: pick.best.a.x, y1: pick.best.a.y, x2: pick.best.b.x, y2: pick.best.b.y, net });
          frontier = pick.nodes;
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
    // 網格 A* 繞線。opt.layers 給銅層 id 陣列就會做多層繞線（穿孔 via 換層）；
    // 不給就退回單層，行為與舊版一致（既有呼叫端不必改）。
    //
    // 只做穿孔 via，不做盲埋孔：穿孔會鑽穿整疊板，所以換層的那一格必須「每一層都空」，
    // 這用另一張 viaBlocked 圖判定（半徑取 via 外徑，比走線寬）。
    // 回傳 segs 每段帶 layer，換層處回傳 vias。
    route(state, padAbs, line, opt) {
      opt = Object.assign({
        grid: 0.25, clearance: 0.15, width: 0.25, layer: 'F.Cu',
        maxCells: 500000, viaCost: 12, viaOd: 0.7, viaDrill: 0.3, layers: null
      }, opt || {});
      const layers = (Array.isArray(opt.layers) && opt.layers.length) ? opt.layers.slice() : [opt.layer];
      const L = layers.length;
      const W = state.boardWidth || 100, H = state.boardHeight || 80;
      const g = opt.grid, ox = -W / 2, oy = -H / 2;
      const nx = Math.floor(W / g) + 1, ny = Math.floor(H / g) + 1;
      if (nx * ny * L > opt.maxCells) return { ok: false, reason: T('rule_grid_too_big') };

      const plane = nx * ny;
      const blocked = new Uint8Array(plane * L);   // 每層各一張：走線能不能走
      const viaBlk = new Uint8Array(plane);        // 穿孔能不能下在這一格
      const idx = (ix, iy, il) => il * plane + iy * nx + ix;
      const vidx = (ix, iy) => iy * nx + ix;
      const inb = (ix, iy) => ix >= 0 && iy >= 0 && ix < nx && iy < ny;

      const stamp = (arr, at, x, y, r) => {
        const x0 = Math.max(0, Math.floor((x - r - ox) / g)), x1 = Math.min(nx - 1, Math.ceil((x + r - ox) / g));
        const y0 = Math.max(0, Math.floor((y - r - oy) / g)), y1 = Math.min(ny - 1, Math.ceil((y + r - oy) / g));
        for (let iy = y0; iy <= y1; iy++) for (let ix = x0; ix <= x1; ix++)
          if (Math.hypot(ox + ix * g - x, oy + iy * g - y) <= r) arr[at(ix, iy)] = 1;
      };
      const stampSeg = (arr, at, x1, y1, x2, y2, r) => {
        const len = Math.hypot(x2 - x1, y2 - y1), n = Math.max(1, Math.ceil(len / (g / 2)));
        for (let i = 0; i <= n; i++) stamp(arr, at, x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n, r);
      };

      // clearance 可給數字（全障礙共用，舊呼叫相容）或 DRC 規則物件
      // {traceToTrace, traceToPad, traceToEdge, ...}。這裡繞的是「走線」，所以：
      // 對 pad 用 traceToPad、對走線與 via 用 traceToTrace（via 對走線而言就是一塊銅）、
      // 對板邊用 traceToEdge。padToPad/holeToHole 管的是別的組合，不適用。
      const clObj = (opt.clearance && typeof opt.clearance === 'object') ? opt.clearance : null;
      const clNum = (typeof opt.clearance === 'number' && opt.clearance >= 0) ? opt.clearance : 0.15;
      const clOf = (k, d) => { const v = clObj ? clObj[k] : clNum; return (typeof v === 'number' && v >= 0) ? v : d; };
      const half = opt.width / 2;
      const cPad = clOf('traceToPad', clNum), cTrace = clOf('traceToTrace', clNum);
      const cVia = clOf('viaToVia', cTrace), cEdge = clOf('traceToEdge', 0);
      const vHalf = opt.viaOd / 2;
      const mEdge = cEdge + half;
      const net = line.net || '';

      const layerIdx = id => layers.indexOf(id);
      const padLayers = p => {
        // 穿孔 pad（side '*'）在每一層都是障礙；SMD 只擋自己那一面。
        if (p.side === '*') return layers.map((_, i) => i);
        const id = p.side === 'B' ? 'B.Cu' : 'F.Cu';
        const i = layerIdx(id);
        return i >= 0 ? [i] : [];
      };

      (state.components || []).forEach(c => (c.pads || []).forEach(p => {
        if (p.cu === false) return;
        const a = padAbs(c, p);
        const rad = Math.hypot(p.w || 0.5, p.h || 0.5) / 2;
        const mine = net && (p.net || '') === net;
        if (!mine) for (const il of padLayers(p)) stamp(blocked, (ix, iy) => idx(ix, iy, il), a.x, a.y, rad + cPad + half);
        // 穿孔 via 會鑽穿整疊板，所以不管 pad 在哪一面都擋得住它
        if (!mine) stamp(viaBlk, vidx, a.x, a.y, rad + cPad + vHalf);
      }));
      (state.traces || []).forEach(t => {
        if (net && (t.net || '') === net) return;
        const il = layerIdx(t.layer || 'F.Cu');
        const rad = (t.width || 0.3) / 2;
        if (il >= 0) stampSeg(blocked, (ix, iy) => idx(ix, iy, il), t.x1, t.y1, t.x2, t.y2, rad + cTrace + half);
        stampSeg(viaBlk, vidx, t.x1, t.y1, t.x2, t.y2, rad + cTrace + vHalf);
      });
      (state.vias || []).forEach(v => {
        if (net && (v.net || '') === net) return;
        const rad = (v.od || 0.6) / 2;
        for (let il = 0; il < L; il++) stamp(blocked, (ix, iy) => idx(ix, iy, il), v.x, v.y, rad + cTrace + half);
        stamp(viaBlk, vidx, v.x, v.y, rad + cVia + vHalf);
      });

      // 禁佈區：DRC 會事後抓（drc_keepout），但路由器不該先產生違規再讓人去修。
      // 穿孔 via 鑽穿整疊板，所以任一層的禁佈區都擋得住它。
      const inPoly = (px, py, pts) => {
        let inside = false;
        for (let a = 0, b = pts.length - 1; a < pts.length; b = a++) {
          const xi = pts[a][0], yi = pts[a][1], xj = pts[b][0], yj = pts[b][1];
          if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) inside = !inside;
        }
        return inside;
      };
      (state.keepouts || []).forEach(k => {
        if (!k.pts || k.pts.length < 3) return;
        const kx = k.pts.map(p => p[0]), ky = k.pts.map(p => p[1]);
        const x0 = Math.max(0, Math.floor((Math.min.apply(null, kx) - ox) / g));
        const x1 = Math.min(nx - 1, Math.ceil((Math.max.apply(null, kx) - ox) / g));
        const y0 = Math.max(0, Math.floor((Math.min.apply(null, ky) - oy) / g));
        const y1 = Math.min(ny - 1, Math.ceil((Math.max.apply(null, ky) - oy) / g));
        // 三種情況要分清楚，混在一起會讓別層的禁佈區擋住這一層：
        //   未指定層（或 '*'）→ 擋所有層；指定層在繞線層裡 → 只擋那一層；
        //   指定層不在繞線層裡 → 走線不受影響，但穿孔 via 仍要避開（它鑽穿整疊板）。
        const all = !k.layer || k.layer === '*';
        const li = all ? -1 : layerIdx(k.layer);
        for (let iy = y0; iy <= y1; iy++) for (let ix = x0; ix <= x1; ix++) {
          if (!inPoly(ox + ix * g, oy + iy * g, k.pts)) continue;
          if (all) { for (let il = 0; il < L; il++) blocked[idx(ix, iy, il)] = 1; }
          else if (li >= 0) blocked[idx(ix, iy, li)] = 1;
          viaBlk[vidx(ix, iy)] = 1;
        }
      });

      const toCell = (x, y) => [Math.round((x - ox) / g), Math.round((y - oy) / g)];
      const [sx, sy] = toCell(line.x1, line.y1), [ex, ey] = toCell(line.x2, line.y2);
      if (!inb(sx, sy) || !inb(ex, ey)) return { ok: false, reason: T('rule_ep_outside') };

      // 端點可以落在哪些層：由該處同 net 的 pad 決定。找不到 pad（端點是走線端或 via）就都可以。
      const layersAtEnd = (x, y) => {
        const set = new Set();
        (state.components || []).forEach(c => (c.pads || []).forEach(p => {
          if (p.cu === false) return;
          if (net && (p.net || '') !== net) return;
          const a = padAbs(c, p);
          if (Math.hypot(a.x - x, a.y - y) > Math.hypot(p.w || 0.5, p.h || 0.5) / 2 + g) return;
          padLayers(p).forEach(i => set.add(i));
        }));
        if (!set.size) for (let i = 0; i < L; i++) set.add(i);
        return [...set];
      };
      const startLs = layersAtEnd(line.x1, line.y1), endLs = layersAtEnd(line.x2, line.y2);
      if (startLs.every(il => blocked[idx(sx, sy, il)]) || endLs.every(il => blocked[idx(ex, ey, il)]))
        return { ok: false, reason: T('rule_ep_blocked') };

      // 板邊淨空（traceToEdge）。擺在端點檢查之後：靠邊的 pad 本身可能違規，
      // 但那是 DRC 該報的事，不該讓繞線直接失敗，所以最後幫端點開逃逸泡泡。
      if (mEdge > 0) {
        const edgeOnly = new Uint8Array(plane * L);
        for (let iy = 0; iy < ny; iy++) {
          const y = oy + iy * g, dy = Math.min(y - oy, oy + H - y);
          for (let ix = 0; ix < nx; ix++) {
            const x = ox + ix * g;
            const d = Math.min(x - ox, ox + W - x, dy);
            if (d < mEdge) for (let il = 0; il < L; il++) {
              const k = idx(ix, iy, il);
              if (!blocked[k]) edgeOnly[k] = 1;
              blocked[k] = 1;
            }
            if (d < cEdge + vHalf) viaBlk[vidx(ix, iy)] = 1;
          }
        }
        const bubble = (cx, cy) => {
          const r = mEdge + g;
          const x0 = Math.max(0, Math.floor(cx - r / g)), x1 = Math.min(nx - 1, Math.ceil(cx + r / g));
          const y0 = Math.max(0, Math.floor(cy - r / g)), y1 = Math.min(ny - 1, Math.ceil(cy + r / g));
          for (let iy = y0; iy <= y1; iy++) for (let ix = x0; ix <= x1; ix++) {
            if (Math.hypot((ix - cx) * g, (iy - cy) * g) > r) continue;
            for (let il = 0; il < L; il++) { const k = idx(ix, iy, il); if (edgeOnly[k]) blocked[k] = 0; }
          }
        };
        bubble(sx, sy); bubble(ex, ey);
      }

      // A*（binary heap）。狀態＝(格, 層)；換層是一條額外的邊，成本 viaCost。
      const N = plane * L;
      const gc = new Float32Array(N).fill(Infinity);
      const par = new Int32Array(N).fill(-1);
      const heap = [];
      const push = (f, i) => { heap.push([f, i]); let k = heap.length - 1; while (k > 0) { const p = (k - 1) >> 1; if (heap[p][0] <= heap[k][0]) break; [heap[p], heap[k]] = [heap[k], heap[p]]; k = p; } };
      const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let k = 0; for (;;) { const l = 2 * k + 1, r = l + 1; let m = k; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === k) break; [heap[m], heap[k]] = [heap[k], heap[m]]; k = m; } } return top; };
      // 啟發式只看平面距離：換層成本非負，所以仍然可採納（不會高估）
      const hOf = i => { const c = i % plane; const dx = Math.abs((c % nx) - ex), dy = Math.abs(Math.floor(c / nx) - ey); return (dx + dy) + (1.41421356 - 2) * Math.min(dx, dy); };
      const DIR = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.41421356], [1, -1, 1.41421356], [-1, 1, 1.41421356], [-1, -1, 1.41421356]];
      const goalSet = new Set(endLs.map(il => idx(ex, ey, il)));

      for (const il of startLs) {
        const s0 = idx(sx, sy, il);
        if (blocked[s0]) continue;
        gc[s0] = 0; push(hOf(s0), s0);
      }
      let found = -1, guard = 0;
      while (heap.length) {
        if (++guard > N * 12) break;
        const [f, cur] = pop();
        if (f > gc[cur] + hOf(cur) + 1e-6) continue;      // 淘汰 stale 項（lazy deletion）
        if (goalSet.has(cur)) { found = cur; break; }
        const il = Math.floor(cur / plane), c = cur % plane;
        const cx0 = c % nx, cy0 = Math.floor(c / nx);
        for (const [dx, dy, w] of DIR) {
          const ix = cx0 + dx, iy = cy0 + dy;
          if (!inb(ix, iy)) continue;
          const ni = idx(ix, iy, il);
          if (blocked[ni]) continue;
          if (dx && dy && (blocked[idx(cx0 + dx, cy0, il)] || blocked[idx(cx0, cy0 + dy, il)])) continue; // 禁切角
          const ng = gc[cur] + w;
          if (ng < gc[ni] - 1e-9) { gc[ni] = ng; par[ni] = cur; push(ng + hOf(ni), ni); }
        }
        // 換層：穿孔 via 必須整根柱子都空，所以只看 viaBlk 一張圖
        if (L > 1 && !viaBlk[c]) {
          for (let jl = 0; jl < L; jl++) {
            if (jl === il) continue;
            const ni = idx(cx0, cy0, jl);
            if (blocked[ni]) continue;
            const ng = gc[cur] + opt.viaCost;
            if (ng < gc[ni] - 1e-9) { gc[ni] = ng; par[ni] = cur; push(ng + hOf(ni), ni); }
          }
        }
      }
      if (found < 0) return { ok: false, reason: T('rule_no_path') };

      // 回溯：同層連續格合併成線段，換層處吐一顆 via
      const path = [];
      for (let cur = found; cur !== -1; cur = par[cur]) path.push(cur);
      path.reverse();
      const segs = [], vias = [];
      const XY = i => { const c = i % plane; return [ox + (c % nx) * g, oy + Math.floor(c / nx) * g]; };
      let runStart = XY(path[0]), runLayer = Math.floor(path[0] / plane), pd = null, prevXY = runStart;
      const flush = (to, layer) => {
        if (Math.hypot(to[0] - runStart[0], to[1] - runStart[1]) > 1e-9)
          segs.push({ x1: runStart[0], y1: runStart[1], x2: to[0], y2: to[1], layer: layers[layer] });
      };
      for (let i = 1; i < path.length; i++) {
        const cur = path[i], il = Math.floor(cur / plane);
        const xy = XY(cur);
        if (il !== runLayer) {                       // 換層：先收掉這一層的線，再放 via
          flush(prevXY, runLayer);
          vias.push({ x: prevXY[0], y: prevXY[1], od: opt.viaOd, drill: opt.viaDrill });
          runStart = prevXY; runLayer = il; pd = null;
          continue;
        }
        const d = [Math.round((xy[0] - prevXY[0]) / g), Math.round((xy[1] - prevXY[1]) / g)];
        if (pd && (d[0] !== pd[0] || d[1] !== pd[1])) { flush(prevXY, runLayer); runStart = prevXY; }
        pd = d; prevXY = xy;
      }
      // 收尾：最後一段拉到真正的端點座標（不是格點），才會準確落在 pad 上
      flush([line.x2, line.y2], runLayer);
      // 起點同理：把第一段的起點換成真實座標
      if (segs.length) {
        const first = segs[0];
        if (Math.hypot(first.x1 - line.x1, first.y1 - line.y1) < g * 1.5) { first.x1 = line.x1; first.y1 = line.y1; }
      }
      return { ok: true, segs, vias };
    }
  };

  window.NetRules = NetRules;
  window.Ratsnest = Ratsnest;
  window.AutoRoute = AutoRoute;
})();
