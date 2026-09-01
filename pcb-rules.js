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

        // 空間索引走共用的 PcbIndex（pcb-index.js）。原本這裡有一份手寫的桶化，
        // DRC 有一份、鋪銅有一份——同一份幾何被整理三次，而且三套的邊界處理
        // 細節不完全一樣，改了其中一套另外兩套不會跟著改。
        //
        // 判定條件一字未改：索引只負責挑候選，真正的距離比較還在下面那幾行。
        const IXM = (typeof window !== 'undefined' && window.PcbIndex) ||
                    (typeof globalThis !== 'undefined' && globalThis.PcbIndex) || null;
        let nearIdx;
        if (IXM) {
          const nodeIx = IXM.create(cell);
          arr.forEach((n, i) => {
            if (n.key === 'zone') return;
            const r = n.r || EPS;
            nodeIx.insert(i, IXM.box(n.x - r, n.y - r, n.x + r, n.y + r));
          });
          nearIdx = (x, y, r) => [...nodeIx.query(IXM.box(x - r, y - r, x + r, y + r))];
        } else {
          // PcbIndex 沒載入時退回全比對。慢，但**結果一樣**——
          // 少挑一個候選就是少一次合併，那種錯會讓網路莫名其妙斷開。
          nearIdx = () => arr.map((_, i) => i);
        }

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
    /**
     * 補短斷口：兩段同 net、同一層的銅只差零點幾 mm 沒接上時，直接補一段線接起來。
     *
     * 為什麼要獨立一支：A* 繞線器補不了這種。它的起點／終點格子若落在鄰居的淨空遮罩裡
     * 就直接判 `rule_ep_blocked`——而 0.2mm 斷口的兩端**本來就貼在別人的淨空範圍內**
     * （那是密腳區）。實測 8 片公版有 8 條這種，佔未繞數的 15%。
     *
     * 只做「一段直線」，不繞路：要繞路就是真的沒接上，該走繞線器。
     * 回 { ok, seg } 或 { ok:false, reason }；呼叫端要再跑一次 DRC 確認。
     */
    closeGap(state, padAbs, line, opt) {
      opt = opt || {};
      const G = (typeof window !== 'undefined' && window.PadDrc && window.PadDrc._geom) || null;
      if (!G) return { ok: false, reason: 'no_geom' };
      const net = String(line.net || '');
      if (!net) return { ok: false, reason: 'no_net' };
      const len = Math.hypot(line.x2 - line.x1, line.y2 - line.y1);
      const maxGap = opt.maxGap || 0.6;
      if (len < 1e-6) return { ok: false, reason: 'zero_length' };   // 那是缺 via，走 escapeVia
      if (len > maxGap) return { ok: false, reason: 'too_long' };    // 太長就該走繞線器

      const w = opt.width || 0.2;
      const tol = opt.tol || 0.06;
      const cu = (state.layerStack || []).filter(l => l.kind === 'copper').map(l => l.id);
      // 兩端各自貼在哪些層的同 net 銅上
      const layersAt = (x, y) => {
        const out = new Set();
        (state.traces || []).forEach(t => {
          if (String(t.net || '') !== net) return;
          if (Math.hypot(t.x1 - x, t.y1 - y) <= tol || Math.hypot(t.x2 - x, t.y2 - y) <= tol)
            out.add(t.layer || 'F.Cu');
        });
        (state.components || []).forEach(c => (c.pads || []).forEach(p => {
          if (p.cu === false || String(p.net || '') !== net) return;
          const a = padAbs(c, p);
          if (Math.hypot(a.x - x, a.y - y) > Math.max(p.w || 0.5, p.h || 0.5)) return;
          if (p.side === '*' || p.drill > 0) cu.forEach(l => out.add(l));
          else out.add(p.side === 'B' ? cu[cu.length - 1] : cu[0]);
        }));
        return out;
      };
      const A = layersAt(line.x1, line.y1), B = layersAt(line.x2, line.y2);
      const common = [...A].filter(l => B.has(l));
      if (!common.length) return { ok: false, reason: 'no_common_layer' };  // 不同層＝要 via，不是斷口

      const cl = opt.clearance || {};
      const cTrace = (typeof cl.traceToTrace === 'number') ? cl.traceToTrace : 0.15;
      const cPad = (typeof cl.traceToPad === 'number') ? cl.traceToPad : cTrace;
      for (const layer of common) {
        let clear = true;
        for (const c of (state.components || [])) {
          for (const p of (c.pads || [])) {
            if (p.cu === false || String(p.net || '') === net) continue;
            const a = padAbs(c, p);
            if (Math.hypot(a.x - line.x1, a.y - line.y1) > 3 && Math.hypot(a.x - line.x2, a.y - line.y2) > 3) continue;
            if (p.side !== '*' && !(p.drill > 0)) {
              const pl = p.side === 'B' ? cu[cu.length - 1] : cu[0];
              if (pl !== layer) continue;
            }
            if (G.segPadDist(line.x1, line.y1, line.x2, line.y2, G.padShape(c, p, padAbs)) - w / 2 < cPad) { clear = false; break; }
          }
          if (!clear) break;
        }
        if (!clear) continue;
        for (const t of (state.traces || [])) {
          if (String(t.net || '') === net) continue;
          if ((t.layer || 'F.Cu') !== layer) continue;
          if (G.segSegDist(line.x1, line.y1, line.x2, line.y2, t.x1, t.y1, t.x2, t.y2)
              - w / 2 - (t.width || 0.3) / 2 < cTrace) { clear = false; break; }
        }
        if (!clear) continue;
        return { ok: true, seg: { x1: line.x1, y1: line.y1, x2: line.x2, y2: line.y2, layer, width: w, net } };
      }
      return { ok: false, reason: 'not_clear' };
    },

    /**
     * 逃逸 via（escape via）。
     *
     * 問題：同一個點上有兩層的同 net 銅（例如 SMD pad 在頂層、走線收在底層），
     * 中間缺一顆 via。密腳區把 via 直接放在那個點上會撞到隔壁腳的淨空，
     * 於是那條連線永遠繞不完——症狀是一條**零長度飛線**（畫面上看不見）。
     *
     * 作法跟真實 layout 一樣：**把 via 往外挪，用短線接出去**。
     * 兩層都要接：via 在 C 點連通各層，但兩層的銅都還停在 P 點，
     * 所以每一層各補一段 P→C 的短線（pad 那層那一段就是逃逸線本身）。
     *
     * 先用幾何粗篩（只看附近的銅），選中的候選再交給呼叫端跑一次真正的 DRC 確認——
     * 每個候選都跑全板 DRC 的話，一個點要幾十秒。
     *
     * 回 { ok, via, stubs, r, dir } 或 { ok:false, reason }
     */
    escapeVia(state, padAbs, at, opt) {
      opt = opt || {};
      const G = (typeof window !== 'undefined' && window.PadDrc && window.PadDrc._geom) || null;
      if (!G) return { ok: false, reason: 'no_geom' };
      const net = String(at.net || '');
      if (!net) return { ok: false, reason: 'no_net' };
      const px = at.x, py = at.y;
      const cl = opt.clearance || {};
      const cTrace = (typeof cl.traceToTrace === 'number') ? cl.traceToTrace : 0.15;
      const cPad = (typeof cl.traceToPad === 'number') ? cl.traceToPad : cTrace;
      const cVia = (typeof cl.viaToVia === 'number') ? cl.viaToVia : cTrace;
      const cEdge = (typeof cl.traceToEdge === 'number') ? cl.traceToEdge : 0.3;
      const od = opt.viaOd || 0.7, drill = opt.viaDrill || 0.3, w = opt.width || 0.2;
      const cu = (state.layerStack || []).filter(l => l.kind === 'copper').map(l => l.id);
      const EPS = 1e-6;

      // 這個點上，哪幾層有這條 net 的銅？兩層以上才需要 via。
      const layersHere = new Set();
      (state.components || []).forEach(c => (c.pads || []).forEach(p => {
        if (p.cu === false || String(p.net || '') !== net) return;
        const a = padAbs(c, p);
        if (Math.hypot(a.x - px, a.y - py) > Math.max(p.w || 0.5, p.h || 0.5)) return;
        if (p.side === '*') cu.forEach(l => layersHere.add(l));
        else layersHere.add(p.side === 'B' ? cu[cu.length - 1] : cu[0]);
      }));
      // 哪一層已經有走線收在這一點——那一層不必補新線，把既有那條的端點拉過去就好。
      // 兩層各放一段幾何完全相同的短線，會被 gerber-readback 判成「走線漏到別的銅層」，
      // 而且真實 layout 也是拉端點，不是疊一段一模一樣的線。
      const endAt = new Map();
      (state.traces || []).forEach((t, idx) => {
        if (String(t.net || '') !== net) return;
        const l = t.layer || 'F.Cu';
        if (Math.hypot(t.x1 - px, t.y1 - py) < 1e-3) { layersHere.add(l); if (!endAt.has(l)) endAt.set(l, { index: idx, end: 1 }); }
        else if (Math.hypot(t.x2 - px, t.y2 - py) < 1e-3) { layersHere.add(l); if (!endAt.has(l)) endAt.set(l, { index: idx, end: 2 }); }
      });
      const layers = [...layersHere].filter(l => cu.indexOf(l) >= 0);
      if (layers.length < 2) return { ok: false, reason: 'not_a_layer_join' };

      // 這顆逃逸孔要跨哪一段層。opt.blindBuried 打開時只跨「真的要接的那兩層」，
      // 於是只有那幾層的銅會擋路——密腳區的死路有一半是穿孔要求「每一層都空」造成的。
      // 沒打開就是穿孔：從頭跨到尾，行為與舊版相同。
      const li = layers.map(l => cu.indexOf(l)).filter(i => i >= 0).sort((a, b) => a - b);
      const span = opt.blindBuried && li.length >= 2
        ? [li[0], li[li.length - 1]] : [0, Math.max(0, cu.length - 1)];
      const inSpan = i => i >= span[0] && i <= span[1];
      const padOnSpan = p => {
        if (p.side === '*' || p.drill > 0) return true;                 // 穿孔 pad 每層都有銅
        return inSpan(p.side === 'B' ? cu.length - 1 : 0);
      };

      // 附近的異網銅（只取用得到的範圍，省掉全板掃描）
      const R = 4;
      const foreignPads = [];
      (state.components || []).forEach(c => (c.pads || []).forEach(p => {
        if (p.cu === false) return;
        const a = padAbs(c, p);
        if (Math.hypot(a.x - px, a.y - py) > R) return;
        if (String(p.net || '') === net) return;
        if (!padOnSpan(p)) return;
        foreignPads.push(G.padShape(c, p, padAbs));
      }));
      const foreignTraces = (state.traces || []).filter(t =>
        String(t.net || '') !== net &&
        inSpan(cu.indexOf(t.layer || 'F.Cu') < 0 ? 0 : cu.indexOf(t.layer || 'F.Cu')) &&
        Math.min(Math.hypot(t.x1 - px, t.y1 - py), Math.hypot(t.x2 - px, t.y2 - py)) <= R + 2);
      const foreignVias = (state.vias || []).filter(v =>
        String(v.net || '') !== net && Math.hypot(v.x - px, v.y - py) <= R + 1);

      // 既有走線的「幾何指紋」（端點排序後的字串，方向無關）。
      // 逃逸線如果剛好跟別層的同 net 走線完全重合，gerber-readback 會判成
      // 「同一條線出現在兩層」——那條檢查是用來抓「Gerber 寫錯層」的，不能為了這裡放寬。
      const segKey = (x1, y1, x2, y2) => {
        const a = [+x1.toFixed(3), +y1.toFixed(3)], b = [+x2.toFixed(3), +y2.toFixed(3)];
        const [p, q] = (a[0] < b[0] || (a[0] === b[0] && a[1] <= b[1])) ? [a, b] : [b, a];
        return p.concat(q).join(',');
      };
      const existing = new Set((state.traces || []).map(t => segKey(t.x1, t.y1, t.x2, t.y2)));

      const halfW = (state.boardWidth || 100) / 2, halfH = (state.boardHeight || 80) / 2;
      const fits = (cx, cy) => {
        if (Math.hypot(cx - px, cy - py) > EPS && existing.has(segKey(px, py, cx, cy))) return false;
        // 板邊
        if (Math.abs(cx) + od / 2 + cEdge > halfW || Math.abs(cy) + od / 2 + cEdge > halfH) return false;
        // via 對異網 pad／走線／via
        for (const s of foreignPads) if (G.ptPadDist(cx, cy, s) - od / 2 < cPad) return false;
        for (const t of foreignTraces)
          if (G.ptSegDist(cx, cy, t.x1, t.y1, t.x2, t.y2) - od / 2 - (t.width || 0.3) / 2 < cTrace) return false;
        for (const v of foreignVias)
          if (Math.hypot(v.x - cx, v.y - cy) - od / 2 - (v.od || 0.6) / 2 < cVia) return false;
        // 短線（P→C）對異網銅。兩層共用同一條幾何，取最嚴的判定。
        if (Math.hypot(cx - px, cy - py) > EPS) {
          for (const s of foreignPads)
            if (G.segPadDist(px, py, cx, cy, s) - w / 2 < cPad) return false;
          for (const t of foreignTraces)
            if (G.segSegDist(px, py, cx, cy, t.x1, t.y1, t.x2, t.y2) - w / 2 - (t.width || 0.3) / 2 < cTrace) return false;
          for (const v of foreignVias)
            if (G.ptSegDist(v.x, v.y, px, py, cx, cy) - w / 2 - (v.od || 0.6) / 2 < cTrace) return false;
        }
        return true;
      };

      // 先試原地（不必逃逸就別逃），再一圈一圈往外找。
      // 角度取 24 個方向：密腳區能出去的縫隙常常只有一個方向。
      const radii = [0, 0.35, 0.5, 0.7, 0.9, 1.2, 1.6, 2.0];
      const dirs = 24;
      for (const r of radii) {
        if (r === 0) {
          if (fits(px, py)) return { ok: true, r: 0, dir: 0, span,
            via: { x: px, y: py, od, drill, net, from: cu[span[0]], to: cu[span[1]] }, stubs: [] };
          continue;
        }
        for (let k = 0; k < dirs; k++) {
          const th = (k / dirs) * Math.PI * 2;
          const cx = +(px + Math.cos(th) * r).toFixed(3), cy = +(py + Math.sin(th) * r).toFixed(3);
          if (!fits(cx, cy)) continue;
          return {
            ok: true, r, dir: th, span,
            // 跨層要寫進 via：盲埋孔匯出照跨層分檔，沒有這兩個欄位板廠不知道鑽多深
            via: { x: cx, y: cy, od, drill, net, from: cu[span[0]], to: cu[span[1]] },
            // 有既有走線收在這點的層 → 拉端點；其餘（pad 那層）→ 補一段逃逸線
            stubs: layers.filter(l => !endAt.has(l))
              .map(l => ({ x1: px, y1: py, x2: cx, y2: cy, layer: l, width: w, net })),
            extend: layers.filter(l => endAt.has(l))
              .map(l => Object.assign({ layer: l, to: { x: cx, y: cy } }, endAt.get(l)))
          };
        }
      }
      return { ok: false, reason: 'no_room' };
    },

    // 網格 A* 繞線。opt.layers 給銅層 id 陣列就會做多層繞線（穿孔 via 換層）；
    // 不給就退回單層，行為與舊版一致（既有呼叫端不必改）。
    //
    // 只做穿孔 via，不做盲埋孔：穿孔會鑽穿整疊板，所以換層的那一格必須「每一層都空」，
    // 這用另一張 viaBlocked 圖判定（半徑取 via 外徑，比走線寬）。
    // 回傳 segs 每段帶 layer，換層處回傳 vias。
    route(state, padAbs, line, opt) {
      opt = Object.assign({
        grid: 0.25, clearance: 0.15, width: 0.25, layer: 'F.Cu',
        maxCells: 4000000, viaCost: 12, viaOd: 0.7, viaDrill: 0.3, layers: null, blindBuried: false
      }, opt || {});
      const layers = (Array.isArray(opt.layers) && opt.layers.length) ? opt.layers.slice() : [opt.layer];
      const L = layers.length;
      const W = state.boardWidth || 100, H = state.boardHeight || 80;
      // 格點太細會超過上限。舊版直接回「格點太大」放棄——但使用者要的是繞線，
      // 不是一句錯誤訊息。改成自動放粗到塞得下為止，並回報實際用了多粗，
      // 因為放粗代表窄通道可能過不去，那是他該知道的事。
      let g = opt.grid, coarsened = false;
      let nx = Math.floor(W / g) + 1, ny = Math.floor(H / g) + 1;
      while (nx * ny * L > opt.maxCells && g < 2) {
        g *= 1.5; coarsened = true;
        nx = Math.floor(W / g) + 1; ny = Math.floor(H / g) + 1;
      }
      if (nx * ny * L > opt.maxCells) return { ok: false, reason: T('rule_grid_too_big') };
      const ox = -W / 2, oy = -H / 2;

      const plane = nx * ny;
      const blocked = new Uint8Array(plane * L);   // 每層各一張：走線能不能走
      // 逐層的「這一格能不能有 via 銅柱」。穿孔要整根柱子都空；
      // 盲埋孔只要跨到的那一段層空著就行，所以不能共用一張圖。
      const viaBlk = new Uint8Array(plane * L);
      const idx = (ix, iy, il) => il * plane + iy * nx + ix;
      const vidx = (ix, iy, il) => (il || 0) * plane + iy * nx + ix;
      const vall = (ix, iy) => { for (let il = 0; il < L; il++) viaBlk[vidx(ix, iy, il)] = 1; };
      const inb = (ix, iy) => ix >= 0 && iy >= 0 && ix < nx && iy < ny;

      const stamp = (arr, at, x, y, r) => {
        const x0 = Math.max(0, Math.floor((x - r - ox) / g)), x1 = Math.min(nx - 1, Math.ceil((x + r - ox) / g));
        const y0 = Math.max(0, Math.floor((y - r - oy) / g)), y1 = Math.min(ny - 1, Math.ceil((y + r - oy) / g));
        for (let iy = y0; iy <= y1; iy++) for (let ix = x0; ix <= x1; ix++)
          if (Math.hypot(ox + ix * g - x, oy + iy * g - y) <= r) arr[at(ix, iy)] = 1;
      };
      const stampAllLayers = (x, y, r) => {
        for (let il = 0; il < L; il++) stamp(viaBlk, (ix, iy) => vidx(ix, iy, il), x, y, r);
      };
      const stampSegAllLayers = (x1, y1, x2, y2, r) => {
        for (let il = 0; il < L; il++) stampSeg(viaBlk, (ix, iy) => vidx(ix, iy, il), x1, y1, x2, y2, r);
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
      const cHole = clOf('holeToHole', cTrace);   // 機構孔用孔對孔淨距，不是銅箔淨距
      const vHalf = opt.viaOd / 2;
      const mEdge = cEdge + half;
      // 繞一條時 net 是單一字串。差分對繞的是「中心線」，兩個 net 的 pad／走線都算自己人，
      // 由 line.nets 傳進來（見 routePair）；沒給就退回單 net，行為與舊版一致。
      const nets = (Array.isArray(line.nets) && line.nets.length) ? line.nets.filter(Boolean) : (line.net ? [line.net] : []);
      const net = nets.length === 1 ? nets[0] : '';
      const isMine = v => nets.length > 0 && nets.indexOf(v || '') >= 0;

      const layerIdx = id => layers.indexOf(id);
      const padLayers = p => {
        // 穿孔 pad（side '*'）在每一層都是障礙；SMD 只擋自己那一面。
        if (p.side === '*') return layers.map((_, i) => i);
        const id = p.side === 'B' ? 'B.Cu' : 'F.Cu';
        const i = layerIdx(id);
        return i >= 0 ? [i] : [];
      };

      (state.components || []).forEach(c => (c.pads || []).forEach(p => {
        const a = padAbs(c, p);
        if (p.cu === false) {
          // 無銅的機構孔（NPTH，例如 M3 安裝孔）：沒有銅箔，但鑽頭照樣會把
          // 上面的走線與 via 一起吃掉。舊版在這裡直接 return，於是自動繞線
          // 會大方地穿過安裝孔——畫面上看起來很正常，做出來那條線是斷的。
          if (!(p.drill > 0)) return;
          const hr = p.drill / 2;
          for (let il = 0; il < L; il++) stamp(blocked, (ix, iy) => idx(ix, iy, il), a.x, a.y, hr + cTrace + half);
          stampAllLayers(a.x, a.y, hr + cHole + vHalf);
          return;
        }
        const rad = Math.hypot(p.w || 0.5, p.h || 0.5) / 2;
        const mine = isMine(p.net);
        if (!mine) for (const il of padLayers(p)) stamp(blocked, (ix, iy) => idx(ix, iy, il), a.x, a.y, rad + cPad + half);
        // pad 的銅柱阻擋：穿孔 pad 每一層都有銅，SMD 只有自己那一面。
        // 舊版一律擋所有層，那對穿孔 via 是對的，但會讓盲埋孔沒地方下。
        if (!mine) {
          if (p.side === '*') stampAllLayers(a.x, a.y, rad + cPad + vHalf);
          else padLayers(p).forEach(il =>
            stamp(viaBlk, (ix, iy) => vidx(ix, iy, il), a.x, a.y, rad + cPad + vHalf));
        }
      }));
      (state.traces || []).forEach(t => {
        if (isMine(t.net)) return;
        const il = layerIdx(t.layer || 'F.Cu');
        const rad = (t.width || 0.3) / 2;
        if (il >= 0) stampSeg(blocked, (ix, iy) => idx(ix, iy, il), t.x1, t.y1, t.x2, t.y2, rad + cTrace + half);
        if (il >= 0) stampSeg(viaBlk, (ix, iy) => vidx(ix, iy, il), t.x1, t.y1, t.x2, t.y2, rad + cTrace + vHalf);
      });
      (state.vias || []).forEach(v => {
        if (isMine(v.net)) return;
        const rad = (v.od || 0.6) / 2;
        for (let il = 0; il < L; il++) stamp(blocked, (ix, iy) => idx(ix, iy, il), v.x, v.y, rad + cTrace + half);
        stampAllLayers(v.x, v.y, rad + cVia + vHalf);
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
          if (all) vall(ix, iy); else if (li >= 0) viaBlk[vidx(ix, iy, li)] = 1; else vall(ix, iy);
        }
      });

      const toCell = (x, y) => [Math.round((x - ox) / g), Math.round((y - oy) / g)];
      const [sx, sy] = toCell(line.x1, line.y1), [ex, ey] = toCell(line.x2, line.y2);
      if (!inb(sx, sy) || !inb(ex, ey)) return { ok: false, reason: T('rule_ep_outside') };

      // 端點可以落在哪些層：由該處同 net 的 pad 決定。找不到 pad（端點是走線端或 via）就都可以。
      // 端點能用哪幾層＝那個點上真的有銅的那幾層。
      // pad 之外還要看**既有的走線端點與 via**：飛線的一端常常不是 pad，而是另一段走線的端點
      // （公版就是這樣）。漏掉這一段，set 會是空的而退回「所有層都行」，
      // 於是繞線器可以在別層收線、不打 via——兩段銅落在同一個座標卻沒有連上。
      // DRC 不會抗議（銅沒有互相違規），飛線只多出一條**零長度**的線，畫面上看不見。
      // 2026-09-01 實測：8 片公版 134 條未繞裡，這種零長度的佔一半以上。
      const layersAtEnd = (x, y) => {
        const set = new Set();
        (state.components || []).forEach(c => (c.pads || []).forEach(p => {
          if (p.cu === false) return;
          if (nets.length && !isMine(p.net)) return;
          const a = padAbs(c, p);
          if (Math.hypot(a.x - x, a.y - y) > Math.hypot(p.w || 0.5, p.h || 0.5) / 2 + g) return;
          padLayers(p).forEach(i => set.add(i));
        }));
        // via 是穿孔銅柱：落在它上面等於每一層都接得到
        (state.vias || []).forEach(v => {
          if (nets.length && !isMine(v.net)) return;
          if (Math.hypot(v.x - x, v.y - y) > (v.od || 0.6) / 2 + g) return;
          for (let i = 0; i < L; i++) set.add(i);
        });
        // 既有走線的端點：只有它自己那一層
        if (!set.size) {
          (state.traces || []).forEach(t => {
            if (nets.length && !isMine(t.net)) return;
            if (Math.hypot(t.x1 - x, t.y1 - y) > g && Math.hypot(t.x2 - x, t.y2 - y) > g) return;
            const li = layers.indexOf(t.layer || 'F.Cu');
            if (li >= 0) set.add(li);
          });
        }
        if (!set.size) for (let i = 0; i < L; i++) set.add(i);
        return [...set];
      };
      const startLs = layersAtEnd(line.x1, line.y1), endLs = layersAtEnd(line.x2, line.y2);

      // 端點不必固定在 pad 正中央：走線本來就可以從自己這顆 pad 的任何一處出發。
      // 只認中心那一格的話，密腳封裝一律「起點就被封住」——公版實測 25 條裡有 7 條卡在這裡，
      // 而實務上這叫逃逸繞線（escape routing），從 pad 邊緣出來是標準做法。
      // 取內切圓（min(w,h)/2）而不是外接圓：保證挑到的格子真的在 pad 銅箔內。
      const cellsInPadAt = (px, py, layersOf) => {
        const cells = [];
        (state.components || []).forEach(c => (c.pads || []).forEach(pd => {
          if (pd.cu === false) return;
          const a = padAbs(c, pd);
          const rOuter = Math.hypot(pd.w || 0.5, pd.h || 0.5) / 2;
          if (Math.hypot(a.x - px, a.y - py) > rOuter + g) return;
          const rIn = Math.max(g, Math.min(pd.w || 0.5, pd.h || 0.5) / 2);
          const x0 = Math.max(0, Math.floor((a.x - rIn - ox) / g)), x1 = Math.min(nx - 1, Math.ceil((a.x + rIn - ox) / g));
          const y0 = Math.max(0, Math.floor((a.y - rIn - oy) / g)), y1 = Math.min(ny - 1, Math.ceil((a.y + rIn - oy) / g));
          for (let iy = y0; iy <= y1; iy++) for (let ix = x0; ix <= x1; ix++) {
            if (Math.hypot(ox + ix * g - a.x, oy + iy * g - a.y) > rIn) continue;
            for (const il of layersOf) cells.push(idx(ix, iy, il));
          }
        }));
        return cells;
      };
      const startCells = cellsInPadAt(line.x1, line.y1, startLs);
      const endCells = cellsInPadAt(line.x2, line.y2, endLs);
      const freeStart = startCells.filter(k => !blocked[k]);
      const freeEnd = endCells.filter(k => !blocked[k]);
      const startDead = startLs.every(il => blocked[idx(sx, sy, il)]) && !freeStart.length;
      const endDead = endLs.every(il => blocked[idx(ex, ey, il)]) && !freeEnd.length;
      if (startDead || endDead) {
        // 起點／終點的格子本身就被鄰近物件的淨空蓋住＝這個腳位用目前線寬出不來。
        // 「失敗」對使用者沒用，「用 0.15mm 就出得來」才有用，所以順手算一下。
        const which = startDead ? 'start' : 'end';
        const px = which === 'start' ? line.x1 : line.x2;
        const py = which === 'start' ? line.y1 : line.y2;
        let room = Infinity;
        (state.components || []).forEach(c => (c.pads || []).forEach(pd => {
          if (pd.cu === false) return;
          if (net && (pd.net || '') === net) return;
          const a = padAbs(c, pd);
          const d = Math.hypot(a.x - px, a.y - py) - Math.hypot(pd.w || 0.5, pd.h || 0.5) / 2;
          if (d < room) room = d;
        }));
        // room = 到最近異網 pad 邊緣的距離；扣掉淨空之後乘 2 就是還塞得下的線寬
        const fits = (room === Infinity) ? null : Math.max(0, (room - cPad) * 2);
        return {
          ok: false, reason: T('rule_ep_blocked'),
          detail: { at: which, x: px, y: py, maxWidth: fits == null ? null : Math.floor(fits * 1000) / 1000 }
        };
      }

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
            if (d < cEdge + vHalf) vall(ix, iy);
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
      const goalSet = new Set(freeEnd.length ? freeEnd : endLs.map(il => idx(ex, ey, il)));

      const seeds = freeStart.length ? freeStart : startLs.map(il => idx(sx, sy, il));
      for (const s0 of seeds) {
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
        // 換層。穿孔要整根柱子都空；盲埋孔只要跨到的那一段層空著。
        // 預設只做穿孔——四家板廠的一般線上下單都不接盲埋孔（見 pcb-fabs.js），
        // 想用要自己開，開了之後板廠檢查會擋下來提醒。
        if (L > 1) {
          for (let jl = 0; jl < L; jl++) {
            if (jl === il) continue;
            const ni = idx(cx0, cy0, jl);
            if (blocked[ni]) continue;
            const lo = Math.min(il, jl), hi = Math.max(il, jl);
            const spanLo = opt.blindBuried ? lo : 0;
            const spanHi = opt.blindBuried ? hi : L - 1;
            let free = true;
            for (let k = spanLo; k <= spanHi && free; k++) if (viaBlk[vidx(cx0, cy0, k)]) free = false;
            if (!free) continue;
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
          // 帶上跨層：盲埋孔匯出要照跨層分檔，沒有這兩個欄位板廠不知道鑽多深
          vias.push({
            x: prevXY[0], y: prevXY[1], od: opt.viaOd, drill: opt.viaDrill,
            from: opt.blindBuried ? layers[Math.min(runLayer, il)] : layers[0],
            to: opt.blindBuried ? layers[Math.max(runLayer, il)] : layers[L - 1]
          });
          runStart = prevXY; runLayer = il; pd = null;
          continue;
        }
        const d = [Math.round((xy[0] - prevXY[0]) / g), Math.round((xy[1] - prevXY[1]) / g)];
        if (pd && (d[0] !== pd[0] || d[1] !== pd[1])) { flush(prevXY, runLayer); runStart = prevXY; }
        pd = d; prevXY = xy;
      }
      // 收尾：終點落在自己這顆 pad 的銅箔內就夠了（逃逸繞線可能從 pad 邊緣進出）。
      // 只有離真正的端點夠近才拉過去——那一段沒有經過 A* 的淨空檢查，硬拉會擦到鄰居的 pad。
      // arduino-uno-r3 實測就是這樣多出一個 drc_trace_pad。
      // opt.snapEnds：差分對的中心線兩端是「兩顆 pad 的中點」，不在任何 pad 上，
      // 不拉到底會讓展開後的兩條扇出長度不一樣（skew 從 0.05 變 0.8mm）。
      const endNear = opt.snapEnds === true ||
        Math.hypot(prevXY[0] - line.x2, prevXY[1] - line.y2) < g * 1.5;
      flush(endNear ? [line.x2, line.y2] : prevXY, runLayer);
      // 起點同理：把第一段的起點換成真實座標
      if (segs.length) {
        const first = segs[0];
        if (Math.hypot(first.x1 - line.x1, first.y1 - line.y1) < g * 1.5) { first.x1 = line.x1; first.y1 = line.y1; }
      }
      return { ok: true, segs, vias, grid: g, coarsened };
    },

    // 差分對繞線：繞一次「中心線」，再往兩側展開成兩條平行走線。
    //
    // 為什麼不各繞各的：兩條各自找路就會各自繞路，耦合度與長度差都不受控，
    // 差分對要的共模抑制與差動阻抗也就沒了。中心線只走一次，展開後兩條天生平行、
    // 長度只在轉角與扇出處差一點（回傳 skew 讓呼叫端決定要不要補償）。
    //
    // 走廊寬度＝2×線寬＋間距：用這個寬度去繞中心線，展開後兩條才真的塞得下，
    // 不會出現「中心線過得去、展開後壓到別人」。
    //
    // 回 { ok, a:{segs,vias}, b:{segs,vias}, gap, skew, grid, coarsened } 或 { ok:false, reason }
    /**
     * 差分對展開後的檢查：把候選的線放進板子的副本跑**真正的 DRC**，
     * error 變多就回第一個違規、否則回 null。
     *
     * 為什麼不自己寫一套比距離的檢查：寫過，然後漏掉 pad 外形／圓角／旋轉的判定細節，
     * 結果是「繞線說可以、DRC 說不行」，而使用者兩邊都看不出誰對。判定只留一份。
     *
     * **兩條線分開驗**（各自跟板子上既有的銅比），不是一起丟進去：
     * 一對差分線的間距本來就小於一般淨空，而 DRC 的 `traceToTrace` 是一個平的數字、
     * 不認識差分對——一起驗的話，每一對都會報一堆 `drc_tt`，等於這個功能不能用。
     * 對內間距由 `pairGap`（阻抗規格）決定，那是另一件事，不在這裡判。
     */
    _pairClearance(state, padAbs, paths, nets, opt, viasA, viasB) {
      const D = (typeof window !== 'undefined' && window.PadDrc) || null;
      if (!D || !D.run) return null;                 // 沒載入 DRC 就不擋（測試環境會載）
      // DRC 需要完整的 rules（clearance ＋ via）。呼叫端沒給就跟編輯器要同一份；
      // 兩邊都沒有就不擋——寧可不檢查，也不要用半套規則產生假警報。
      const rules = opt.drcRules || opt.rules ||
        ((typeof window !== 'undefined' && window.pcbApp && window.pcbApp.loadDrcRules)
          ? window.pcbApp.loadDrcRules() : null);
      if (!rules || !rules.clearance) return null;
      const errsOf = st => D.run(st, padAbs, rules).filter(f => f.type === 'error');
      const before = errsOf(state).length;
      const vias = [viasA, viasB];
      for (let k = 0; k < paths.length; k++) {
        const segs = (paths[k] || []).map(s => ({
          x1: s.x1, y1: s.y1, x2: s.x2, y2: s.y2, layer: s.layer || opt.layer || 'F.Cu',
          width: opt.width || 0.25, net: nets[k]
        }));
        const vs = (vias[k] || []).map(v => ({ x: v.x, y: v.y, od: v.od, drill: v.drill, net: nets[k] }));
        const probe = Object.assign({}, state, {
          traces: (state.traces || []).concat(segs),
          vias: (state.vias || []).concat(vs)
        });
        const after = errsOf(probe);
        if (after.length > before) {
          const e = after[after.length - 1] || {};
          return { kind: e.message || 'drc', net: nets[k], x: e.x, y: e.y, added: after.length - before };
        }
      }
      return null;
    },

    routePair(state, padAbs, lineA, lineB, opt) {
      opt = Object.assign({ width: 0.25, pairGap: 0.2 }, opt || {});
      const w = opt.width, gap = opt.pairGap;
      if (!(gap > 0)) return { ok: false, reason: 'pair_gap' };
      if (!lineA || !lineB || !lineA.net || !lineB.net || lineA.net === lineB.net) return { ok: false, reason: 'pair_nets' };

      // 飛線兩端的方向不保證一致（A 從左到右、B 可能從右到左）。
      // 照原方向配對會把中心線接成交叉的 X，所以取兩種配法裡距離小的那個。
      const dStraight = Math.hypot(lineA.x1 - lineB.x1, lineA.y1 - lineB.y1) + Math.hypot(lineA.x2 - lineB.x2, lineA.y2 - lineB.y2);
      const dSwapped = Math.hypot(lineA.x1 - lineB.x2, lineA.y1 - lineB.y2) + Math.hypot(lineA.x2 - lineB.x1, lineA.y2 - lineB.y1);
      const B = dSwapped < dStraight
        ? { x1: lineB.x2, y1: lineB.y2, x2: lineB.x1, y2: lineB.y1, net: lineB.net }
        : lineB;

      const center = {
        x1: (lineA.x1 + B.x1) / 2, y1: (lineA.y1 + B.y1) / 2,
        x2: (lineA.x2 + B.x2) / 2, y2: (lineA.y2 + B.y2) / 2,
        nets: [lineA.net, B.net]
      };
      const r = AutoRoute.route(state, padAbs, center, Object.assign({}, opt, { width: 2 * w + gap, snapEnds: true }));
      if (!r.ok) return { ok: false, reason: r.reason || 'no_path' };
      if (!r.segs.length) return { ok: false, reason: 'no_path' };

      const off = (gap + w) / 2;
      // 展開：每段沿法線位移 d。轉角處兩段位移後接不起來，補一小段連接；
      // 換層處不補（那裡本來就要放 via）。
      const offsetPath = (segs, d) => {
        const out = [];
        let prev = null;
        for (const sg of segs) {
          const dx = sg.x2 - sg.x1, dy = sg.y2 - sg.y1, len = Math.hypot(dx, dy);
          if (len < 1e-9) continue;
          const nx2 = -dy / len * d, ny2 = dx / len * d;
          const cur = { x1: sg.x1 + nx2, y1: sg.y1 + ny2, x2: sg.x2 + nx2, y2: sg.y2 + ny2, layer: sg.layer };
          if (prev && prev.layer === cur.layer && Math.hypot(cur.x1 - prev.x2, cur.y1 - prev.y2) > 1e-9)
            out.push({ x1: prev.x2, y1: prev.y2, x2: cur.x1, y2: cur.y1, layer: cur.layer });
          out.push(cur);
          prev = cur;
        }
        return out;
      };
      // via 也要跟著分開兩顆：取離它最近那一段的法線方向位移
      const offsetVias = (vias, d) => (vias || []).map(v => {
        let best = null;
        for (const sg of r.segs) {
          const dd = Math.min(Math.hypot(sg.x1 - v.x, sg.y1 - v.y), Math.hypot(sg.x2 - v.x, sg.y2 - v.y));
          if (!best || dd < best.d) best = { d: dd, sg };
        }
        if (!best) return Object.assign({}, v);
        const dx = best.sg.x2 - best.sg.x1, dy = best.sg.y2 - best.sg.y1, len = Math.hypot(dx, dy) || 1;
        return Object.assign({}, v, { x: v.x + (-dy / len) * d, y: v.y + (dx / len) * d });
      });

      // 哪一條走哪一側：看 A 的起點落在中心線方向的左邊還右邊，
      // 選錯邊會讓兩條在扇出處交叉。
      const f0 = r.segs[0];
      const cx = (f0.x2 - f0.x1) * (lineA.y1 - center.y1) - (f0.y2 - f0.y1) * (lineA.x1 - center.x1);
      const sideA = cx >= 0 ? off : -off;

      // 扇出：展開後的頭尾在中心線兩側，要接回各自真正的 pad 座標
      const fanout = (path, sx, sy, ex, ey) => {
        if (!path.length) return path;
        const first = path[0], last = path[path.length - 1];
        if (Math.hypot(first.x1 - sx, first.y1 - sy) > 1e-9)
          path.unshift({ x1: sx, y1: sy, x2: first.x1, y2: first.y1, layer: first.layer });
        if (Math.hypot(last.x2 - ex, last.y2 - ey) > 1e-9)
          path.push({ x1: last.x2, y1: last.y2, x2: ex, y2: ey, layer: last.layer });
        return path;
      };
      const pathA = fanout(offsetPath(r.segs, sideA), lineA.x1, lineA.y1, lineA.x2, lineA.y2);
      const pathB = fanout(offsetPath(r.segs, -sideA), B.x1, B.y1, B.x2, B.y2);

      // 展開之後要**重新檢查淨空**。
      // 中心線是拿「2w + gap」的走廊繞出來的，走廊本身乾淨；但扇出段與轉角補段
      // 是展開之後才生出來的幾何，**不在那條走廊裡**。空板上看不出來（附近沒別的銅），
      // 密板上就直接壓到鄰居：2026-09-01 把成對繞接進公版補繞，實測
      // esp32 +8、a20-lime +21、openrex-imx6 +42 個 DRC error。
      // 檢查不過就回失敗，讓呼叫端退回「兩條各自單獨繞」——那條路本來就有完整的淨空檢查。
      const vA = offsetVias(r.vias, sideA), vB = offsetVias(r.vias, -sideA);
      const viol = AutoRoute._pairClearance(state, padAbs, [pathA, pathB],
        [lineA.net, B.net], Object.assign({}, opt, { width: w }), vA, vB);
      if (viol) {
        // 最常見的原因不是「真的沒空間」，而是**中心線落在格點上**：
        // 格點 0.25 時中心線可能整體偏半格，展開後那半格就把其中一條推到鄰居的 pad 上。
        // 實測（USB 差分對、pad 相距 1.0mm）：grid 0.25 與 0.125 都違規，0.05 剛好落在中心線上、檢查通過。
        // 所以往細裡試幾階，全都不行才算真的沒空間。
        if (!opt._fine) {
          const g0 = opt.grid || 0.25;
          const ladder = [g0 / 2, g0 / 4, 0.05].filter(g => g < g0 - 1e-9 && g >= 0.02);
          for (const g of ladder) {
            const r2 = AutoRoute.routePair(state, padAbs, lineA, lineB,
              Object.assign({}, opt, { grid: g, _fine: true }));
            if (r2.ok) return r2;
          }
        }
        return { ok: false, reason: 'pair_clearance', at: viol };
      }

      const total = segs2 => segs2.reduce((a, sg) => a + Math.hypot(sg.x2 - sg.x1, sg.y2 - sg.y1), 0);

      return {
        ok: true,
        a: { net: lineA.net, segs: pathA, vias: vA },
        b: { net: B.net, segs: pathB, vias: vB },
        gap, skew: Math.abs(total(pathA) - total(pathB)),
        grid: r.grid, coarsened: r.coarsened
      };
    }
  };

  // 多條一起繞的策略層。route() 是「繞一條」的原語，這裡負責決定順序、
  // 以及繞不過去時要不要拆掉別人重來。
  //
  // 舊版就是照飛線原順序一條一條繞，繞不過就算了——公版實測成功率 70%。
  // 失敗幾乎都不是「真的沒有路」，而是先繞的那幾條剛好把路堵死了。
  // 兩個標準做法：
  //   ① 短的先繞：短線選擇少、長線繞路空間大，先做選擇少的那些。
  //   ② rip-up & retry：繞不過去時把擋路的（別的 net、且是自動繞的）拆掉，
  //      讓這條先過，再把被拆的重新排隊。設回合上限，避免兩條互相拆到天荒地老。
  const RouteAll = {
    /**
     * lines: [{x1,y1,x2,y2,net}]；opts 同 route()，另外：
     *   order 'short'|'none'（預設 short）、ripup（預設 true）、passes（預設 3）、budgetMs
     * 回 { routed:[{line,segs,vias}], failed:[line], passes, ripped, ms }
     */
    run(state, padAbs, lines, opts) {
      opts = Object.assign({ order: 'short', ripup: true, passes: 3, budgetMs: 8000 }, opts || {});
      const t0 = (typeof performance !== 'undefined' && performance.now) ? () => performance.now() : () => Date.now();
      const start = t0();

      // 在自己的暫存 state 上繞，成功才回給呼叫端套用
      const work = Object.assign({}, state, {
        traces: (state.traces || []).slice(),
        vias: (state.vias || []).slice()
      });

      const queue = lines.map((l, i) => ({ l, i }));
      if (opts.order === 'short') {
        queue.sort((a, b) =>
          (Math.hypot(a.l.x2 - a.l.x1, a.l.y2 - a.l.y1) - Math.hypot(b.l.x2 - b.l.x1, b.l.y2 - b.l.y1))
          || (a.i - b.i));                       // 同長度照原順序，結果才是決定性的
      }

      const routed = new Map();                  // i → {line, segs, vias}
      let ripped = 0;

      // ---- 第一階段：不拆，照順序繞一輪 ----
      let failed = [];
      for (const item of queue) {
        if (t0() - start > opts.budgetMs) { failed.push(item); continue; }
        const r = AutoRoute.route(work, padAbs, item.l, opts);
        if (r.ok) { this.commit(work, item, r); routed.set(item.i, { line: item.l, segs: r.segs, vias: r.vias || [] }); }
        else failed.push(item);
      }

      // ---- 第二階段：對繞不過的嘗試拆線，但**只准變好** ----
      // 第一版寫成「拆了就繼續跑」，結果拆線連鎖把已經繞好的一起帶走，
      // 20 顆元件的板從 95% 掉到 10%。拆線本來是要救失敗的那幾條，
      // 不是拿已經成功的去換。所以改成：每次嘗試前存檔，總數沒變多就整個回滾。
      if (opts.ripup && failed.length) {
        for (let pass = 0; pass < opts.passes && failed.length; pass++) {
          const before = failed.length;
          const still = [];
          for (const item of failed) {
            if (t0() - start > opts.budgetMs) { still.push(item); continue; }
            const snap = {
              traces: work.traces.slice(), vias: work.vias.slice(),
              routed: new Map(routed), count: routed.size
            };
            const victims = this.blockers(work, item.l, opts);
            if (!victims.length) { still.push(item); continue; }
            this.remove(work, victims);
            const victimIds = [...new Set(victims.map(v => v._ri))];
            victimIds.forEach(id => routed.delete(id));

            const r = AutoRoute.route(work, padAbs, item.l, opts);
            if (r.ok) {
              this.commit(work, item, r);
              routed.set(item.i, { line: item.l, segs: r.segs, vias: r.vias || [] });
              // 被拆的那幾條當場重繞回去
              for (const id of victimIds) {
                const src = queue.find(q => q.i === id);
                if (!src) continue;
                const rr = AutoRoute.route(work, padAbs, src.l, opts);
                if (rr.ok) { this.commit(work, src, rr); routed.set(id, { line: src.l, segs: rr.segs, vias: rr.vias || [] }); }
              }
            }
            if (routed.size > snap.count) {
              ripped += victims.length;
            } else {
              // 沒賺到就回滾，維持第一階段的成果
              work.traces = snap.traces; work.vias = snap.vias;
              routed.clear(); snap.routed.forEach((v, k) => routed.set(k, v));
              still.push(item);
            }
          }
          failed = still;
          if (failed.length === before) break;   // 這一輪一條都沒救回來就停
        }
      }

      const out = [];
      [...routed.keys()].sort((a, b) => a - b).forEach(k => out.push(routed.get(k)));

      // 把失敗原因彙整出來。只說「失敗 N 條」使用者不知道要改什麼；
      // 「23 條的起點被鄰近 pad 封住，改用 0.15mm 就出得來」才是可行動的資訊。
      const reasons = {};
      let widthHint = null;
      for (const item of failed) {
        const r = AutoRoute.route(work, padAbs, item.l, opts);
        const key = r.ok ? 'wouldRouteNow' : (r.reason || 'unknown');
        reasons[key] = (reasons[key] || 0) + 1;
        // 取最小值：那是「全部都出得來」的上限，也就是真正卡住的那一腳。
        // 取最大值會報出最寬鬆那條的數字，看起來很好但照著改仍然繞不過。
        if (r.detail && r.detail.maxWidth > 0)
          widthHint = widthHint == null ? r.detail.maxWidth : Math.min(widthHint, r.detail.maxWidth);
      }
      return {
        routed: out,
        failed: failed.map(x => x.l),
        reasons, widthHint,
        ripped,
        ms: Math.round(t0() - start)
      };
    },

    commit(work, item, r) {
      r.segs.forEach((sg, k) => work.traces.push({
        id: 'ra-' + item.i + '-' + k, _ri: item.i, _auto: true,
        x1: sg.x1, y1: sg.y1, x2: sg.x2, y2: sg.y2,
        width: sg.width || 0.25, layer: sg.layer, net: item.l.net
      }));
      (r.vias || []).forEach((v, k) => work.vias.push({
        id: 'rv-' + item.i + '-' + k, _ri: item.i, _auto: true,
        x: v.x, y: v.y, od: v.od, id2: v.drill, net: item.l.net
      }));
    },

    // 擋路的：走線起訖點連線附近、**別的 net**、而且是這一輪自動繞出來的。
    // 只拆自己剛剛放的，不動使用者手繞的線——那是他的設計意圖。
    blockers(work, line, opts) {
      const pad = (opts.width || 0.25) / 2 + 2;
      const minx = Math.min(line.x1, line.x2) - pad, maxx = Math.max(line.x1, line.x2) + pad;
      const miny = Math.min(line.y1, line.y2) - pad, maxy = Math.max(line.y1, line.y2) + pad;
      const hit = [];
      for (const t of work.traces) {
        if (!t._auto) continue;
        if ((t.net || '') === (line.net || '')) continue;
        if (Math.min(t.x1, t.x2) > maxx || Math.max(t.x1, t.x2) < minx) continue;
        if (Math.min(t.y1, t.y2) > maxy || Math.max(t.y1, t.y2) < miny) continue;
        hit.push(t);
      }
      // 依所屬飛線去重：要拆就整條拆掉，拆一半會留下斷線
      const ids = new Set(hit.map(t => t._ri));
      return work.traces.filter(t => t._auto && ids.has(t._ri))
        .concat(work.vias.filter(v => v._auto && ids.has(v._ri)));
    },

    remove(work, victims) {
      const set = new Set(victims);
      work.traces = work.traces.filter(t => !set.has(t));
      work.vias = work.vias.filter(v => !set.has(v));
      work._ripped = (work._ripped || []).concat(victims);
    },

    restore(work, victims) {
      victims.forEach(v => { (v.x1 !== undefined ? work.traces : work.vias).push(v); });
      const set = new Set(victims);
      work._ripped = (work._ripped || []).filter(v => !set.has(v));
    }
  };

  window.RouteAll = RouteAll;
  window.NetRules = NetRules;
  window.Ratsnest = Ratsnest;
  window.AutoRoute = AutoRoute;
})();
