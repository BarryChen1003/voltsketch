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
            res.push({ type: 'error', message: `規則線寬：${net} 有 ${bad.length} 段 < ${r.minW}mm（最細 ${minSeen}mm，規則「${r.pattern}」）` });
          }
        }
        // 2) 線長上限
        if (r.maxLen > 0) {
          const L = this.netLength(traces, net);
          if (L > r.maxLen + 1e-9)
            res.push({ type: 'error', message: `規則線長：${net} 總長 ${L.toFixed(2)}mm > ${r.maxLen}mm（規則「${r.pattern}」）` });
        }
      }
      // 3) 差分對長度差：pairTol>0 的規則，命中 net 依基底名配對（去尾 P/N/+/-/_P/_N）
      for (const r of rules) {
        if (!(r.pairTol > 0)) continue;
        const hit = nets.filter(n => matchPat(r.pattern, n));
        const base = n => n.replace(/(_?[PN]|[+-])$/i, '');
        const groups = {};
        hit.forEach(n => { (groups[base(n)] = groups[base(n)] || []).push(n); });
        for (const [b, g] of Object.entries(groups)) {
          if (g.length !== 2) continue;
          const L0 = this.netLength(traces, g[0]), L1 = this.netLength(traces, g[1]);
          const d = Math.abs(L0 - L1);
          if (d > r.pairTol + 1e-9)
            res.push({ type: 'warning', message: `差分對長度差：${g[0]}(${L0.toFixed(2)}mm) vs ${g[1]}(${L1.toFixed(2)}mm) 差 ${d.toFixed(2)}mm > ${r.pairTol}mm` });
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
      (state.zoneFills || []).forEach(z => {
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

  window.NetRules = NetRules;
  window.Ratsnest = Ratsnest;
})();
