// 製造功能模組（EasyEDA 有、我們原本沒有的那幾項）
//   window.Mfg.teardrops(...)   淚滴：pad/via 與走線接合處補銅，抗鑽偏與應力裂
//   window.Mfg.stitchVias(...)  縫合孔：鋪銅內自動撒接地 via
//   window.Mfg.drillTable(...)  鑽孔表：刀具/孔徑/數量/鍍通，板廠必要文件
//   window.Mfg.panelize(...)    拼板：V-Cut / 郵票孔 / 工藝邊
//
// 全部寫成純函式（吃 state、回資料，不碰 DOM），node 可直接測。
// 每一項都比「照參數畫出來」多做一件事：**先問這樣做合不合法**——
// 淚滴會不會撞到別的網路、縫合孔會不會落在不該落的地方、拼板尺寸板廠做不做得了。
// 做得出來不難，難的是做出來能送廠。
(() => {
  'use strict';

  const T = (k, vars) => (typeof window !== 'undefined' && window.I18N) ? window.I18N.t(k, vars) : k;

  // ---------- 幾何小工具 ----------
  const segDist = (px, py, x1, y1, x2, y2) => {
    const dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy;
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * dx + (py - y1) * dy) / l2;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
  };
  const inPoly = (x, y, pts) => {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside;
    }
    return inside;
  };
  // pad 的等效半徑：圓形取半徑，方形取內切半徑（保守，淚滴不會凸出 pad 外）
  const padRadius = p => Math.min(p.w || 0.5, p.h || 0.5) / 2;

  const padAbsOf = (app, c, p) => app.padAbs(c, p);

  // ---------- 1) 淚滴 ----------
  // 幾何：pad 中心 P、半徑 R，走線自 P 往方向 u 離開、半寬 hw。
  // 淚滴＝從 pad 圓周上兩個切點，沿走線兩側收斂到距離 L 處的走線邊緣。
  // 用圓弧取樣成多邊形，Gerber 以 region 輸出。
  const Teardrops = {
    // opts: { ratio (L = R*ratio，預設 2), seg (弧取樣段數), clearance (與異網的最小淨空) }
    build(state, padAbs, opts) {
      opts = Object.assign({ ratio: 2, seg: 8, clearance: 0.15 }, opts || {});
      const out = [], skipped = [];
      const targets = [];
      (state.components || []).forEach(c => (c.pads || []).forEach(p => {
        if (p.cu === false) return;
        const a = padAbs(c, p);
        const layers = p.side === '*' ? null : [p.side === 'B' ? 'B.Cu' : 'F.Cu'];
        targets.push({ x: a.x, y: a.y, r: padRadius(p), net: p.net || '', layers, kind: 'pad' });
      }));
      (state.vias || []).forEach(v => {
        targets.push({ x: v.x, y: v.y, r: (v.od || 0.6) / 2, net: v.net || '', layers: null, kind: 'via' });
      });

      for (const t of (state.traces || [])) {
        const hw = (t.width || 0.3) / 2;
        for (const end of [[t.x1, t.y1, t.x2, t.y2], [t.x2, t.y2, t.x1, t.y1]]) {
          const [ex, ey, ox, oy] = end;
          const tgt = targets.find(g =>
            Math.hypot(g.x - ex, g.y - ey) <= g.r &&
            (!g.net || !t.net || g.net === t.net) &&
            (!g.layers || g.layers.indexOf(t.layer || 'F.Cu') >= 0));
          if (!tgt) continue;
          // 走線比 pad 還粗就不需要淚滴
          if (hw >= tgt.r - 1e-9) { skipped.push({ reason: 'traceWiderThanPad', x: ex, y: ey }); continue; }
          const len = Math.hypot(ox - ex, oy - ey);
          if (len < 1e-9) continue;
          const ux = (ox - ex) / len, uy = (oy - ey) / len;
          const L = Math.min(tgt.r * opts.ratio, len);       // 不可長過走線本身
          if (L <= tgt.r) { skipped.push({ reason: 'traceTooShort', x: ex, y: ey }); continue; }
          const poly = this.shape(tgt.x, tgt.y, tgt.r, ux, uy, hw, L, opts.seg);
          // 合法性：淚滴多邊形上的點不可離異網銅太近
          const bad = this.conflict(poly, state, padAbs, t, opts.clearance);
          if (bad) { skipped.push({ reason: 'clearance', x: ex, y: ey, with: bad }); continue; }
          out.push({ layer: t.layer || 'F.Cu', net: t.net || tgt.net, pts: poly, at: [ex, ey] });
        }
      }
      return { teardrops: out, skipped };
    },

    // 單顆淚滴的多邊形。
    // 接觸點在 pad 圓周的 ±90 度（淚滴在 pad 這一端要跟 pad 一樣寬，這才是淚滴的用意：
    // 把「細走線直接撞上大焊盤」那個應力集中點攤開）。從接觸點沿二次貝茲收斂到
    // 距離 L 處的走線邊緣，控制點靠 pad 側，做出貼著 pad 再拉直的外形。
    // pad 那一側用通過圓心的弦收邊即可——pad 本體的銅會蓋回去。
    shape(cx, cy, R, ux, uy, hw, L, seg) {
      const px = -uy, py = ux;                    // 走線法向
      const P = (a, b) => [cx + ux * a + px * b, cy + uy * a + py * b];   // (沿線, 法向) → 絕對座標
      const n = Math.max(2, seg | 0);
      const cx0 = L * 0.35;                       // 控制點：貼著 pad 先走一段再收斂
      const side = sign => {
        const out = [];
        for (let i = 0; i <= n; i++) {
          const t = i / n, mt = 1 - t;
          // 二次貝茲：(0, R) → 控制點 (cx0, R) → (L, hw)
          const a = mt * mt * 0 + 2 * mt * t * cx0 + t * t * L;
          const b = (mt * mt * R + 2 * mt * t * R + t * t * hw) * sign;
          out.push(P(a, b));
        }
        return out;
      };
      return side(1).concat(side(-1).reverse());
    },

    // 淚滴會不會撞到別的網路：拿多邊形頂點對「異網 pad / 走線 / via」量距離
    conflict(poly, state, padAbs, self, clearance) {
      const net = self.net || '';
      const layer = self.layer || 'F.Cu';
      for (const c of (state.components || [])) {
        for (const p of (c.pads || [])) {
          if (p.cu === false) continue;
          if (net && (p.net || '') === net) continue;
          if (p.side !== '*' && (p.side === 'B' ? 'B.Cu' : 'F.Cu') !== layer) continue;
          const a = padAbs(c, p);
          const rad = Math.hypot(p.w || 0.5, p.h || 0.5) / 2;
          for (const pt of poly) if (Math.hypot(pt[0] - a.x, pt[1] - a.y) < rad + clearance) return 'pad';
        }
      }
      for (const t of (state.traces || [])) {
        if (t === self) continue;
        if ((t.layer || 'F.Cu') !== layer) continue;
        if (net && (t.net || '') === net) continue;
        const rad = (t.width || 0.3) / 2;
        for (const pt of poly) if (segDist(pt[0], pt[1], t.x1, t.y1, t.x2, t.y2) < rad + clearance) return 'trace';
      }
      for (const v of (state.vias || [])) {
        if (net && (v.net || '') === net) continue;
        const rad = (v.od || 0.6) / 2;
        for (const pt of poly) if (Math.hypot(pt[0] - v.x, pt[1] - v.y) < rad + clearance) return 'via';
      }
      return null;
    }
  };

  // ---------- 2) 縫合孔 ----------
  // EasyEDA 讓你直接填間距。間距要填多少其實有依據：接地平面上的縫合孔要夠密，
  // 才不會在關心的頻率變成裂縫天線。慣例取 λ/20（保守派用 λ/10）。
  // 所以這裡讓使用者填「最高關心頻率」，間距由我們算，並把算式寫在回傳裡。
  const Stitch = {
    C_MM_S: 299792458000,   // 光速，mm/s

    // f: Hz；er: 介電常數；div: λ 的分母（預設 20）
    spacingFor(fHz, er, div) {
      if (!(fHz > 0) || !(er >= 1)) return null;
      const d = div > 0 ? div : 20;
      const lambda = this.C_MM_S / (fHz * Math.sqrt(er));   // 介質內波長 mm
      return { spacing: lambda / d, lambda, div: d };
    },

    // opts: { spacing 或 {freqHz, er, div}, net, clearance, viaOd, viaDrill, margin }
    place(state, padAbs, zone, opts) {
      opts = Object.assign({ clearance: 0.3, viaOd: 0.7, viaDrill: 0.3, margin: 0.5 }, opts || {});
      let spacing = opts.spacing, basis = null;
      if (!(spacing > 0) && opts.freqHz) {
        const s = this.spacingFor(opts.freqHz, opts.er || 4.4, opts.div);
        if (!s) return { vias: [], skipped: 0, basis: null };
        spacing = s.spacing; basis = s;
      }
      if (!(spacing > 0)) return { vias: [], skipped: 0, basis: null };

      const xs = zone.pts.map(p => p[0]), ys = zone.pts.map(p => p[1]);
      const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
      const r = opts.viaOd / 2, need = r + opts.clearance;
      const net = opts.net != null ? opts.net : (zone.net || '');
      const vias = [];
      let skipped = 0;

      for (let y = y0 + opts.margin; y <= y1 - opts.margin + 1e-9; y += spacing) {
        for (let x = x0 + opts.margin; x <= x1 - opts.margin + 1e-9; x += spacing) {
          // 必須整顆 via（含淨空）都在鋪銅裡：只看中心會讓邊緣的 via 半個掉出去
          if (!inPoly(x, y, zone.pts)) { skipped++; continue; }
          if (!this.insideBy(x, y, zone.pts, need)) { skipped++; continue; }
          if (this.blocked(x, y, need, state, padAbs, zone.layer, net)) { skipped++; continue; }
          if (vias.some(v => Math.hypot(v.x - x, v.y - y) < opts.viaOd + opts.clearance)) { skipped++; continue; }
          vias.push({ x, y, od: opts.viaOd, id: opts.viaDrill, net, stitch: true });
        }
      }
      return { vias, skipped, basis };
    },

    // 點到多邊形邊界的距離是否 >= d（用邊取樣，夠用且不必做偏移多邊形）
    insideBy(x, y, pts, d) {
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        if (segDist(x, y, pts[j][0], pts[j][1], pts[i][0], pts[i][1]) < d) return false;
      }
      return true;
    },

    blocked(x, y, need, state, padAbs, layer, net) {
      for (const c of (state.components || [])) {
        for (const p of (c.pads || [])) {
          if (p.cu === false) continue;
          const a = padAbs(c, p);
          // 穿孔 via 會鑽穿整疊板，所以任何一面的 pad 都算障礙
          if (Math.hypot(a.x - x, a.y - y) < Math.hypot(p.w || 0.5, p.h || 0.5) / 2 + need) return true;
        }
      }
      for (const t of (state.traces || [])) {
        if (net && (t.net || '') === net && (t.layer || 'F.Cu') === layer) continue;
        if (segDist(x, y, t.x1, t.y1, t.x2, t.y2) < (t.width || 0.3) / 2 + need) return true;
      }
      for (const v of (state.vias || [])) {
        if (Math.hypot(v.x - x, v.y - y) < (v.od || 0.6) / 2 + need) return true;
      }
      for (const k of (state.keepouts || [])) {
        if (inPoly(x, y, k.pts)) return true;
      }
      return false;
    }
  };

  // ---------- 3) 鑽孔表 ----------
  // 板廠要的不只是鑽孔檔，還要一張「哪支刀、幾個孔、鍍不鍍通」的表可以對。
  // 多做一件事：把每支刀拿去比選定板廠的下限，過不了的直接在表上標出來。
  const DrillTable = {
    build(state, padAbs, fabRules) {
      const rows = new Map();   // key: size|plated
      const add = (d, plated) => {
        const k = (Math.round(d * 1000) / 1000) + '|' + (plated ? 'PTH' : 'NPTH');
        rows.set(k, (rows.get(k) || 0) + 1);
      };
      // 分組規則必須與 gerber.mjs 的匯出端一字不差，否則面板顯示的表跟送廠的表會不一樣。
      // gerber-mfg.test.js 拿兩邊逐列比對，分岔就會紅。
      (state.vias || []).forEach(v => add(v.id || 0.3, true));
      (state.components || []).forEach(c => (c.pads || []).forEach(p => {
        if (!(p.drill > 0)) return;
        // 開槽走長圓孔，尺寸取短邊，一律鍍通
        if (p.slot) { add(Math.min(p.slot.w, p.slot.h), true); return; }
        add(p.drill, p.type !== 'np_thru_hole');
      }));
      (state.panelBites || []).forEach(b => add(b.d || 0.6, false));
      const list = [...rows.entries()].map(([k, n]) => {
        const [d, kind] = k.split('|');
        const size = +d;
        const row = { size, plated: kind === 'PTH', count: n, tool: 0, warn: null };
        if (fabRules && typeof fabRules.minDrill === 'number' && size < fabRules.minDrill - 1e-9)
          row.warn = { code: 'belowFabMin', limit: fabRules.minDrill };
        return row;
      }).sort((a, b) => a.size - b.size || (a.plated === b.plated ? 0 : a.plated ? -1 : 1));
      list.forEach((r, i) => { r.tool = i + 1; });
      return list;
    },

    toText(list, title) {
      const L = ['G04 ' + (title || 'Drill table') + '*',
        'Tool  Size(mm)  Plated  Qty  Note'];
      for (const r of list) {
        L.push([
          ('T' + r.tool).padEnd(5),
          r.size.toFixed(3).padStart(8),
          (r.plated ? 'PTH' : 'NPTH').padStart(7),
          String(r.count).padStart(5),
          r.warn ? ('  BELOW FAB MIN ' + r.warn.limit + 'mm') : ''
        ].join(' '));
      }
      L.push('Total holes: ' + list.reduce((a, r) => a + r.count, 0));
      return L.join('\n') + '\n';
    }
  };

  // ---------- 4) 拼板 ----------
  // V-Cut 只能走整條直線（刀是直的），所以只有規則矩陣拼得了 V-Cut；
  // 交錯排列或有凸出的板框一律要走郵票孔。這條規則 EasyEDA 讓你自己撞，
  // 這裡直接擋下來並說明原因。
  const Panel = {
    // opts: { cols, rows, gap (板間距 mm), rail (工藝邊寬, 0=不要), method 'vcut'|'mousebite' }
    plan(state, opts) {
      opts = Object.assign({ cols: 2, rows: 2, gap: 0, rail: 5, method: 'vcut' }, opts || {});
      const w = state.boardWidth || 100, h = state.boardHeight || 80;
      const cols = Math.max(1, Math.floor(opts.cols)), rows = Math.max(1, Math.floor(opts.rows));
      const gap = opts.method === 'vcut' ? 0 : Math.max(0, opts.gap);   // V-Cut 板與板必須相接
      const rail = Math.max(0, opts.rail);
      const panelW = cols * w + (cols - 1) * gap + 2 * rail;
      const panelH = rows * h + (rows - 1) * gap + 2 * rail;

      const placements = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          placements.push({
            row: r, col: c,
            // 以拼板中心為原點的偏移量
            dx: -panelW / 2 + rail + c * (w + gap) + w / 2,
            dy: -panelH / 2 + rail + r * (h + gap) + h / 2
          });
        }
      }

      // 分割線：V-Cut 一路貫穿整片；郵票孔只在板與板之間
      const cuts = [];
      if (opts.method === 'vcut') {
        for (let c = 1; c < cols; c++) {
          const x = -panelW / 2 + rail + c * w;
          cuts.push({ type: 'vcut', x1: x, y1: -panelH / 2, x2: x, y2: panelH / 2 });
        }
        for (let r = 1; r < rows; r++) {
          const y = -panelH / 2 + rail + r * h;
          cuts.push({ type: 'vcut', x1: -panelW / 2, y1: y, x2: panelW / 2, y2: y });
        }
        if (rail > 0) {
          cuts.push({ type: 'vcut', x1: -panelW / 2 + rail, y1: -panelH / 2, x2: -panelW / 2 + rail, y2: panelH / 2 });
          cuts.push({ type: 'vcut', x1: panelW / 2 - rail, y1: -panelH / 2, x2: panelW / 2 - rail, y2: panelH / 2 });
          cuts.push({ type: 'vcut', x1: -panelW / 2, y1: -panelH / 2 + rail, x2: panelW / 2, y2: -panelH / 2 + rail });
          cuts.push({ type: 'vcut', x1: -panelW / 2, y1: panelH / 2 - rail, x2: panelW / 2, y2: panelH / 2 - rail });
        }
      }

      const area = panelW * panelH;
      return {
        panelW, panelH, cols, rows, gap, rail, method: opts.method,
        placements, cuts,
        boards: cols * rows,
        utilization: area > 0 ? (cols * rows * w * h) / area : 0
      };
    },

    // 郵票孔：板與板之間那條縫上排一列小 NPTH 孔，掰斷用。
    // V-Cut 不需要（刀直接劃），所以只有 mousebite 會產生。
    bites(plan, opts) {
      opts = Object.assign({ hole: 0.6, pitch: 1.0, groups: 3, span: 5 }, opts || {});
      if (plan.method !== 'mousebite') return [];
      const holes = [];
      const w = (plan.panelW - 2 * plan.rail - (plan.cols - 1) * plan.gap) / plan.cols;
      const h = (plan.panelH - 2 * plan.rail - (plan.rows - 1) * plan.gap) / plan.rows;
      const n = Math.max(1, Math.round(opts.span / opts.pitch));
      // 縫的中線位置（垂直縫：板與板之間；含工藝邊與板之間那兩條）
      const vLines = [];
      for (let c = 0; c <= plan.cols; c++) {
        if (c === 0 && plan.rail <= 0) continue;
        if (c === plan.cols && plan.rail <= 0) continue;
        vLines.push(-plan.panelW / 2 + plan.rail + c * w + (c - 0.5) * plan.gap + (c === 0 ? -plan.gap / 2 : 0));
      }
      const hLines = [];
      for (let r = 0; r <= plan.rows; r++) {
        if (r === 0 && plan.rail <= 0) continue;
        if (r === plan.rows && plan.rail <= 0) continue;
        hLines.push(-plan.panelH / 2 + plan.rail + r * h + (r - 0.5) * plan.gap + (r === 0 ? -plan.gap / 2 : 0));
      }
      // 每條縫上放 groups 組，每組 n 個孔
      const put = (fx, fy, len) => {
        for (let gi = 0; gi < opts.groups; gi++) {
          const centre = -len / 2 + len * (gi + 1) / (opts.groups + 1);
          for (let k = 0; k < n; k++) {
            const off = centre + (k - (n - 1) / 2) * opts.pitch;
            holes.push(fx ? { x: fx, y: off, d: opts.hole } : { x: off, y: fy, d: opts.hole });
          }
        }
      };
      vLines.forEach(x => put(x, null, plan.panelH - 2 * plan.rail));
      hLines.forEach(y => put(null, y, plan.panelW - 2 * plan.rail));
      return holes;
    },

    // 把計畫真的套上去：複製每一片板的所有幾何到各個位置，回傳一份新的 state。
    // 不做這一步的話「拼板」只是畫幾條線，匯出去板廠拿到的還是單片板。
    apply(state, plan, opts) {
      const off = (o, dx, dy) => {
        const c = JSON.parse(JSON.stringify(o));
        if (c.x != null) { c.x += dx; c.y += dy; }
        if (c.x1 != null) { c.x1 += dx; c.y1 += dy; c.x2 += dx; c.y2 += dy; }
        if (Array.isArray(c.pts)) c.pts = c.pts.map(p => [p[0] + dx, p[1] + dy]);
        return c;
      };
      const out = Object.assign({}, state, {
        boardWidth: plan.panelW, boardHeight: plan.panelH,
        components: [], traces: [], vias: [], userZones: [], zones: [],
        zoneFills: [], keepouts: [], texts: [], teardrops: [],
        panel: plan, kicad: null, edgeSegs: []
      });
      plan.placements.forEach((pl, i) => {
        const tag = '-p' + (i + 1);
        (state.components || []).forEach(c => {
          const n = off(c, pl.dx, pl.dy);
          n.id = (c.id || 'c') + tag;
          n.ref = (c.ref || '') + (i ? tag : '');   // 第一片保留原 refdes，其餘加後綴
          out.components.push(n);
        });
        (state.traces || []).forEach(t => { const n = off(t, pl.dx, pl.dy); n.id = (t.id || 't') + tag; out.traces.push(n); });
        (state.vias || []).forEach(v => { const n = off(v, pl.dx, pl.dy); n.id2 = (v.id2 || '') + tag; out.vias.push(n); });
        (state.userZones || []).forEach(z => out.userZones.push(off(z, pl.dx, pl.dy)));
        (state.zones || []).forEach(z => out.zones.push(off(z, pl.dx, pl.dy)));
        (state.zoneFills || []).forEach(z => out.zoneFills.push(off(z, pl.dx, pl.dy)));
        (state.keepouts || []).forEach(k => out.keepouts.push(off(k, pl.dx, pl.dy)));
        (state.texts || []).forEach(t => out.texts.push(off(t, pl.dx, pl.dy)));
        (state.teardrops || []).forEach(t => out.teardrops.push(off(t, pl.dx, pl.dy)));
      });
      // 郵票孔以 NPTH 進鑽孔檔
      const bites = this.bites(plan, opts);
      if (bites.length) out.panelBites = bites;
      return out;
    },

    // 這片拼板送得了哪一家：尺寸、V-Cut 可行性、板廠上限
    check(plan, fabProfile, fabTier) {
      const issues = [];
      if (plan.method === 'vcut' && plan.gap > 0)
        issues.push({ code: 'vcutNeedsZeroGap', severity: 'error' });
      if (fabProfile && fabTier && fabTier.rules) {
        const B = fabTier.rules.board;
        if (B) {
          const fits = (plan.panelW <= B.maxW && plan.panelH <= B.maxH) ||
                       (plan.panelH <= B.maxW && plan.panelW <= B.maxH);
          if (!fits) issues.push({
            code: 'panelTooBig', severity: 'error',
            limit: B.maxW + '×' + B.maxH,
            actual: plan.panelW.toFixed(1) + '×' + plan.panelH.toFixed(1)
          });
        }
      }
      if (plan.utilization < 0.5)
        issues.push({ code: 'lowUtilization', severity: 'warn', actual: Math.round(plan.utilization * 100) });
      return issues;
    }
  };

  const Mfg = { Teardrops, Stitch, DrillTable, Panel, _geom: { segDist, inPoly, padRadius } };

  // ---------- UI 綁定（只有瀏覽器才跑；node 測試載入時整段跳過）----------
  function bindUI() {
    const $ = id => document.getElementById(id);
    const num = (id, d) => { const el = $(id); const v = el ? parseFloat(el.value) : NaN; return isNaN(v) ? d : v; };
    const app = window.pcbApp;
    if (!app) return;
    const toast = (m, k) => app.toast && app.toast(m, k || 'info');
    const say = (id, txt) => { const el = $(id); if (el) el.textContent = txt; };
    const rules = () => app.loadDrcRules().clearance;
    const ps = () => (window.Padstack ? window.Padstack.load() : { od: 0.7, drill: 0.3 });
    const fabTier = () => {
      if (!window.FabProfiles) return null;
      const id = FabProfiles.selectedId();
      const prof = FabProfiles.byId(id);
      const cu = (app.state.layerStack || []).filter(l => l.kind === 'copper').length || 2;
      return { prof, tier: FabProfiles.tierFor(prof, cu) };
    };

    const on = (id, fn) => { const el = $(id); if (el && !el._mfgBound) { el._mfgBound = true; el.addEventListener('click', fn); } };

    // --- 板框 DXF ---
    const dxfFile = $('dxfFile');
    if (dxfFile && !dxfFile._mfgBound) {
      dxfFile._mfgBound = true;
      dxfFile.addEventListener('change', e => {
        const f = e.target.files && e.target.files[0];
        if (!f || !window.PcbDxf) return;
        const rd = new FileReader();
        rd.onload = () => {
          const layer = ($('dxfLayer') || {}).value || '';
          const unit = ($('dxfUnit') || {}).value || 'mm';
          const r = window.PcbDxf.parse(String(rd.result), { layer: layer.trim() || null, assumeUnit: unit });
          if (!r.segs.length) { say('dxfOut', T('dxf_empty')); toast(T('dxf_empty'), 'warn'); return; }
          const b = window.PcbDxf.toBoard(r.segs);
          const chk = window.PcbDxf.checkClosed(r.segs, 0.01);
          app.hist();
          app.state.edgeSegs = b.edgeSegs;
          app.state.boardWidth = Math.max(1, Math.ceil(b.w));
          app.state.boardHeight = Math.max(1, Math.ceil(b.h));
          const wI = $('boardWidth'), hI = $('boardHeight');
          if (wI) wI.value = app.state.boardWidth;
          if (hI) hI.value = app.state.boardHeight;
          app.render();
          let msg = T('dxf_done', {
            n: r.segs.length, w: b.w, h: b.h,
            unit: r.unitSource, ent: Object.keys(r.entities).join('/') || '-'
          });
          // 板框沒封閉板廠切不出來——這是匯入之後最該先知道的事，不能等送件才發現
          if (!chk.closed) {
            const at = chk.openEnds.slice(0, 3)
              .map(pt => '(' + pt.x.toFixed(2) + ',' + pt.y.toFixed(2) + ')').join(' ');
            msg += ' │ ' + T('dxf_open', { n: chk.openEnds.length, at });
          }
          if (r.warnings.some(w => w.code === 'unitsAssumed')) msg += ' │ ' + T('dxf_unitwarn', { unit });
          say('dxfOut', msg);
          toast(msg, chk.closed && !r.warnings.length ? 'info' : 'warn');
        };
        rd.readAsText(f);
      });
    }
    on('dxfExport', () => {
      if (!window.PcbDxf) return;
      const text = window.PcbDxf.build(app.state, {});
      const blob = new Blob([text], { type: 'application/dxf' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'board-outline.dxf';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      say('dxfOut', T('dxf_exported'));
    });

    on('stepExport', () => {
      if (!window.PcbStep) return;
      const th = num('stepThick', 1.6);
      const r = window.PcbStep.build(app.state, { thickness: th, name: 'hardwareai-board' });
      const v = window.PcbStep.verify(r.text);
      if (!v.ok) {   // 產出壞檔就不要給使用者，寧可什麼都不給
        say('stepOut', T('step_bad', { why: v.problems.map(x => x.code).join(', ') }));
        toast(T('step_bad', { why: v.problems.map(x => x.code).join(', ') }), 'error');
        return;
      }
      const blob = new Blob([r.text], { type: 'application/step' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'board-3d.step';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      let msg = T('step_done', { n: r.stats.solids, p: r.stats.parts, e: r.entities, th });
      if (r.warnings.some(x => x.code === 'outlineNotClosed')) msg += ' │ ' + T('step_openoutline');
      msg += ' │ ' + T('step_caveat');
      say('stepOut', msg);
      toast(msg, r.warnings.length ? 'warn' : 'info');
    });

    // --- 淚滴 ---
    on('tdRun', () => {
      app.hist();
      const r = Teardrops.build(app.state, app.padAbs.bind(app), {
        ratio: num('tdRatio', 2), clearance: rules().traceToTrace
      });
      app.state.teardrops = r.teardrops;
      app.render();
      if (!r.teardrops.length && !r.skipped.length) { say('tdOut', T('mfg_td_none')); return; }
      const why = [...new Set(r.skipped.map(x => x.reason))].join(', ') || '-';
      const msg = T('mfg_td_done', { n: r.teardrops.length, skip: r.skipped.length, why });
      say('tdOut', msg); toast(msg, r.skipped.length ? 'warn' : 'info');
    });
    on('tdClear', () => {
      const n = (app.state.teardrops || []).length;
      app.hist(); app.state.teardrops = []; app.render();
      say('tdOut', T('mfg_td_cleared', { n }));
    });

    // --- 縫合孔 ---
    on('stRun', () => {
      const zones = (app.state.userZones || []);
      if (!zones.length) { say('stOut', T('mfg_st_nozone')); toast(T('mfg_st_nozone'), 'warn'); return; }
      const fGHz = num('stFreq', 2.4), div = num('stDiv', 20);
      // εr 取當前走線層在疊層裡的實際值，沒有就退 4.4
      let er = 4.4;
      try {
        if (window.Stackup) {
          const gm = Stackup.geomFor(Stackup.load(app.state), app.state, app.state.traceLayer || 'F.Cu');
          if (gm && gm.er > 1) er = gm.er;
        }
      } catch (e) { }
      app.hist();
      const p = ps();
      let total = 0, basis = null;
      for (const z of zones) {
        const r = Stitch.place(app.state, app.padAbs.bind(app), z, {
          freqHz: fGHz * 1e9, er, div,
          clearance: rules().traceToTrace, viaOd: p.od, viaDrill: p.drill
        });
        basis = basis || r.basis;
        r.vias.forEach(v => app.state.vias.push(Object.assign({ id2: 'stitch-' + (app.state.vias.length) }, v)));
        total += r.vias.length;
      }
      app.state.ratsnest = null;
      app.render();
      if (!basis) { say('stOut', '-'); return; }
      const msg = T('mfg_st_done', {
        n: total, sp: basis.spacing.toFixed(2), div: basis.div,
        lam: basis.lambda.toFixed(1), f: fGHz, er: er.toFixed(2)
      });
      say('stOut', msg); toast(msg, 'info');
    });
    on('stClear', () => {
      const before = app.state.vias.length;
      app.hist();
      app.state.vias = app.state.vias.filter(v => !v.stitch);
      app.state.ratsnest = null; app.render();
      say('stOut', T('mfg_st_cleared', { n: before - app.state.vias.length }));
    });

    // --- 鑽孔表 ---
    on('dtRun', () => {
      const ft = fabTier();
      const min = (ft && ft.tier && ft.tier.rules && typeof ft.tier.rules.minDrill === 'number') ? ft.tier.rules.minDrill : null;
      const list = DrillTable.build(app.state, app.padAbs.bind(app), min != null ? { minDrill: min } : null);
      say('dtOut', DrillTable.toText(list, (ft && ft.prof) ? ft.prof.name : ''));
    });

    // --- 拼板 ---
    const planNow = () => Panel.plan(app.state, {
      cols: num('pnCols', 2), rows: num('pnRows', 2),
      rail: num('pnRail', 5), gap: 2,
      method: ($('pnMethod') || {}).value || 'vcut'
    });
    const describe = plan => {
      const ft = fabTier();
      const lines = [T('mfg_pn_res', {
        cols: plan.cols, rows: plan.rows, n: plan.boards,
        w: plan.panelW.toFixed(1), h: plan.panelH.toFixed(1),
        u: Math.round(plan.utilization * 100)
      })];
      const issues = Panel.check(plan, ft && ft.prof, ft && ft.tier);
      for (const i of issues) {
        if (i.code === 'panelTooBig') lines.push(T('mfg_pn_toobig', { name: ft.prof.name, limit: i.limit, actual: i.actual }));
        else if (i.code === 'lowUtilization') lines.push(T('mfg_pn_lowuse', { actual: i.actual }));
      }
      return { text: lines.join('\n'), issues };
    };
    on('pnPreview', () => {
      const d = describe(planNow());
      say('pnOut', d.text);
      if (d.issues.some(i => i.severity === 'error')) toast(d.text, 'warn');
    });
    on('pnApply', () => {
      const plan = planNow();
      const d = describe(plan);
      say('pnOut', d.text);
      app.hist();
      const next = Panel.apply(app.state, plan);
      Object.keys(next).forEach(k => { app.state[k] = next[k]; });
      const wI = document.getElementById('boardWidth'), hI = document.getElementById('boardHeight');
      if (wI) wI.value = plan.panelW; if (hI) hI.value = plan.panelH;
      app.state.ratsnest = null;
      app.renderPartsList && app.renderPartsList();
      app.render();
      toast(T('mfg_pn_applied', { n: plan.boards, w: plan.panelW.toFixed(1), h: plan.panelH.toFixed(1) }),
            d.issues.some(i => i.severity === 'error') ? 'warn' : 'info');
    });
  }

  if (typeof window !== 'undefined') {
    window.Mfg = Mfg;
    window.MfgUI = { bind: bindUI };
    if (typeof document !== 'undefined') {
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(bindUI, 0));
      else setTimeout(bindUI, 0);
    }
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = Mfg;
})();
