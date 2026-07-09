// pad 級 DRC 引擎：真 pad 幾何算間距 / 環寬 / 鑽孔餘裕
// 幾何約定與 pcb.js padAbs、gerber-export.js 一致：
//   abs = at + (rx·cosθ + ry·sinθ, −rx·sinθ + ry·cosθ)，pad.rot 為總角度（KiCad 慣例）
// pad 統一表示為「旋轉核心矩形＋圓角半徑 r」：
//   rect r=0；roundrect r=rr·min(w,h)；circle/oval 為 stadium r=min(w,h)/2；
//   custom 以外框矩形近似（結果附註）。兩形狀距離 = 核心多邊形距離 − rA − rB。
window.PadDrc = (() => {

  // ---------- 基礎幾何 ----------
  const ptSegDist = (px, py, x1, y1, x2, y2) => {
    const dx = x2 - x1, dy = y2 - y1, len2 = dx * dx + dy * dy;
    if (len2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * dx + (py - y1) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
  };

  const orient = (ax, ay, bx, by, cx, cy) => (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);

  const segSegDist = (ax, ay, bx, by, cx, cy, dx, dy) => {
    const o1 = orient(ax, ay, bx, by, cx, cy), o2 = orient(ax, ay, bx, by, dx, dy);
    const o3 = orient(cx, cy, dx, dy, ax, ay), o4 = orient(cx, cy, dx, dy, bx, by);
    if (o1 * o2 < 0 && o3 * o4 < 0) return 0; // 真交叉
    return Math.min(
      ptSegDist(ax, ay, cx, cy, dx, dy), ptSegDist(bx, by, cx, cy, dx, dy),
      ptSegDist(cx, cy, ax, ay, bx, by), ptSegDist(dx, dy, ax, ay, bx, by));
  };

  const ptInPoly = (px, py, pts) => {
    if (pts.length < 3) return false;
    let sign = 0;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      const cr = (b[0] - a[0]) * (py - a[1]) - (b[1] - a[1]) * (px - a[0]);
      if (cr !== 0) { const s = cr > 0 ? 1 : -1; if (sign === 0) sign = s; else if (s !== sign) return false; }
    }
    return true;
  };

  const edges = pts => {
    if (pts.length === 1) return [[pts[0], pts[0]]];
    const e = [];
    for (let i = 0; i < pts.length; i++) e.push([pts[i], pts[(i + 1) % pts.length]]);
    return e;
  };

  const polyDist = (A, B) => {
    if (ptInPoly(B[0][0], B[0][1], A) || ptInPoly(A[0][0], A[0][1], B)) return 0;
    let m = Infinity;
    for (const [a1, a2] of edges(A)) for (const [b1, b2] of edges(B))
      m = Math.min(m, segSegDist(a1[0], a1[1], a2[0], a2[1], b1[0], b1[1], b2[0], b2[1]));
    return m;
  };

  // ---------- pad 形狀 ----------
  const padShape = (comp, pad, padAbs) => {
    const a = padAbs(comp, pad);
    const w = pad.w || 0, h = pad.h || 0;
    let r = 0, approx = false;
    if (pad.shape === 'circle' || pad.shape === 'oval') r = Math.min(w, h) / 2;
    else if (pad.shape === 'roundrect') r = (pad.rr > 0 ? pad.rr : 0.25) * Math.min(w, h);
    else if (pad.shape === 'custom') approx = true;
    const hw = Math.max(0, w / 2 - r), hh = Math.max(0, h / 2 - r);
    return { cx: a.x, cy: a.y, th: (pad.rot || 0) * Math.PI / 180, hw, hh, r, circ: Math.hypot(w, h) / 2, approx };
  };

  const corners = s => {
    if (s.hw === 0 && s.hh === 0) return [[s.cx, s.cy]];
    const c = Math.cos(s.th), sn = Math.sin(s.th);
    const pt = (rx, ry) => [s.cx + rx * c + ry * sn, s.cy - rx * sn + ry * c];
    return [pt(-s.hw, -s.hh), pt(s.hw, -s.hh), pt(s.hw, s.hh), pt(-s.hw, s.hh)];
  };

  const padDist = (sa, sb) => polyDist(corners(sa), corners(sb)) - sa.r - sb.r;

  const segPadDist = (x1, y1, x2, y2, s) => {
    const C = corners(s);
    if (C.length >= 3 && (ptInPoly(x1, y1, C) || ptInPoly(x2, y2, C))) return -s.r;
    let d = Infinity;
    for (const [a, b] of edges(C)) d = Math.min(d, segSegDist(a[0], a[1], b[0], b[1], x1, y1, x2, y2));
    return d - s.r;
  };

  const ptPadDist = (x, y, s) => {
    const C = corners(s);
    if (C.length >= 3 && ptInPoly(x, y, C)) return -s.r;
    let d = Infinity;
    for (const [a, b] of edges(C)) d = Math.min(d, ptSegDist(x, y, a[0], a[1], b[0], b[1]));
    return d - s.r;
  };

  // 鑽孔 → capsule（圓孔＝零長，開槽＝沿長軸線段）
  const holeCapsule = (comp, pad, padAbs) => {
    const a = padAbs(comp, pad);
    if (pad.slot) {
      const L = Math.max(pad.slot.w, pad.slot.h), D = Math.min(pad.slot.w, pad.slot.h);
      const half = (L - D) / 2;
      const th = (pad.rot || 0) * Math.PI / 180, c = Math.cos(th), sn = Math.sin(th);
      const rx = pad.slot.w >= pad.slot.h ? half : 0, ry = pad.slot.w >= pad.slot.h ? 0 : half;
      return { x1: a.x + rx * c + ry * sn, y1: a.y - rx * sn + ry * c,
               x2: a.x - rx * c - ry * sn, y2: a.y + rx * sn - ry * c, r: D / 2, d: D };
    }
    return { x1: a.x, y1: a.y, x2: a.x, y2: a.y, r: pad.drill / 2, d: pad.drill };
  };

  const capsuleGap = (a, b) => segSegDist(a.x1, a.y1, a.x2, a.y2, b.x1, b.y1, b.x2, b.y2) - a.r - b.r;

  // ---------- DRC 主流程 ----------
  const run = (state, padAbs, rules) => {
    const res = [], tally = {}, CAP = 30;
    const add = (key, type, message) => {
      tally[key] = (tally[key] || 0) + 1;
      if (tally[key] <= CAP) res.push({ type, message });
    };
    const fmt = n => n.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
    const at = s => `@(${s.cx.toFixed(1)},${s.cy.toFixed(1)})`;
    const cl = rules.clearance, via = rules.via;
    const holeGapMin = cl.holeToHole || 0.25, EPS = 1e-9;

    // 展平銅 pad（NPTH 無銅只入孔清單）
    const pads = [], holes = [];
    let customCount = 0;
    (state.components || []).forEach(c => (c.pads || []).forEach(p => {
      const hasCopper = p.type !== 'np_thru_hole' && p.w > 0 && p.h > 0 && p.cu !== false;
      if (p.drill > 0) holes.push({ cap: holeCapsule(c, p, padAbs), label: `${c.ref || c.label}.${p.num}` });
      if (!hasCopper) return;
      const sh = padShape(c, p, padAbs);
      if (sh.approx) customCount++;
      pads.push({ sh, p, net: p.net || '', side: p.side || 'F',
                  plated: p.drill > 0, label: `${c.ref || c.label}.${p.num}` });
    }));
    (state.vias || []).forEach((v, i) => {
      const r = (v.id || 0.3) / 2;
      holes.push({ cap: { x1: v.x, y1: v.y, x2: v.x, y2: v.y, r, d: r * 2 }, label: `via#${i + 1}` });
    });

    const sideOverlap = (a, b) => a === '*' || b === '*' || a === b;
    const padOnLayer = (side, layerId) =>
      side === '*' ? /\.Cu$/.test(layerId) : layerId === (side === 'B' ? 'B.Cu' : 'F.Cu');

    // 1) pad ↔ pad 淨距
    for (let i = 0; i < pads.length; i++) for (let j = i + 1; j < pads.length; j++) {
      const A = pads[i], B = pads[j];
      if (A.net && A.net === B.net) continue;
      if (!sideOverlap(A.side, B.side)) continue;
      const cd = Math.hypot(A.sh.cx - B.sh.cx, A.sh.cy - B.sh.cy);
      if (cd - A.sh.circ - B.sh.circ >= cl.padToPad) continue;
      const d = padDist(A.sh, B.sh);
      if (d < cl.padToPad - EPS)
        add('焊盤間距', 'error',
          `焊盤間距：${A.label}(${A.net || '無網路'}) ↔ ${B.label}(${B.net || '無網路'}) ` +
          `${fmt(Math.max(0, d))}mm < ${cl.padToPad}mm ${at(A.sh)}`);
    }

    // 2) 走線 ↔ pad 淨距
    const traces = state.traces || [];
    for (const t of traces) {
      const tw = (t.width || 0.3) / 2, tl = t.layer || 'F.Cu';
      for (const P of pads) {
        if (t.net && t.net === P.net) continue;
        if (!padOnLayer(P.side, tl)) continue;
        if (ptSegDist(P.sh.cx, P.sh.cy, t.x1, t.y1, t.x2, t.y2) - P.sh.circ - tw >= cl.traceToPad) continue;
        const d = segPadDist(t.x1, t.y1, t.x2, t.y2, P.sh) - tw;
        if (d < cl.traceToPad - EPS)
          add('走線對焊盤', 'error',
            `走線(${t.net || '無網路'}/${tl}) ↔ 焊盤 ${P.label}(${P.net || '無網路'}) ` +
            `淨距 ${fmt(Math.max(0, d))}mm < ${cl.traceToPad}mm ${at(P.sh)}`);
      }
    }

    // 3) 走線 ↔ 走線 淨距（線寬感知；同 net、跨層不比）
    //    兩端 net 都未知時：貼合視為手繪接點不報，僅近距報 warning
    const tb = traces.map(t => {
      const m = (t.width || 0.3) / 2;
      return { minx: Math.min(t.x1, t.x2) - m, maxx: Math.max(t.x1, t.x2) + m,
               miny: Math.min(t.y1, t.y2) - m, maxy: Math.max(t.y1, t.y2) + m };
    });
    for (let i = 0; i < traces.length; i++) for (let j = i + 1; j < traces.length; j++) {
      const a = traces[i], b = traces[j];
      if ((a.layer || 'F.Cu') !== (b.layer || 'F.Cu')) continue;
      if (a.net && b.net && a.net === b.net) continue;
      if (tb[i].minx > tb[j].maxx + cl.traceToTrace || tb[j].minx > tb[i].maxx + cl.traceToTrace ||
          tb[i].miny > tb[j].maxy + cl.traceToTrace || tb[j].miny > tb[i].maxy + cl.traceToTrace) continue;
      const d = segSegDist(a.x1, a.y1, a.x2, a.y2, b.x1, b.y1, b.x2, b.y2)
        - (a.width || 0.3) / 2 - (b.width || 0.3) / 2;
      if (d >= cl.traceToTrace - EPS) continue;
      if (!a.net || !b.net) {
        if (d > 0) add('走線間距(無網路)', 'warning',
          `走線#${i + 1} ↔ #${j + 1} 淨距 ${fmt(d)}mm < ${cl.traceToTrace}mm（無網路資訊，若非同一網請調整）`);
      } else {
        add('走線間距', 'error',
          `走線間距：${a.net} ↔ ${b.net}（${a.layer || 'F.Cu'}）淨距 ${fmt(Math.max(0, d))}mm < ${cl.traceToTrace}mm ` +
          `@(${a.x1.toFixed(1)},${a.y1.toFixed(1)})`);
      }
    }

    // 4) via 淨距（通孔 via 貫穿全層）
    const vias = state.vias || [];
    for (let i = 0; i < vias.length; i++) {
      const v = vias[i], vr = (v.od || 0.6) / 2, vnet = v.net || '';
      for (let j = i + 1; j < vias.length; j++) {
        const u = vias[j];
        if (vnet && vnet === (u.net || '')) continue;
        const d = Math.hypot(v.x - u.x, v.y - u.y) - vr - (u.od || 0.6) / 2;
        if (d < cl.viaToVia - EPS)
          add('via間距', 'error', `via#${i + 1}(${vnet || '無網路'}) ↔ via#${j + 1}(${u.net || '無網路'}) 淨距 ${fmt(Math.max(0, d))}mm < ${cl.viaToVia}mm @(${v.x.toFixed(1)},${v.y.toFixed(1)})`);
      }
      for (const t of traces) {
        if (vnet && vnet === (t.net || '')) continue;
        const d = ptSegDist(v.x, v.y, t.x1, t.y1, t.x2, t.y2) - vr - (t.width || 0.3) / 2;
        if (d < cl.traceToTrace - EPS)
          add('via對走線', 'error', `via#${i + 1}(${vnet || '無網路'}) ↔ 走線(${t.net || '無網路'}/${t.layer || 'F.Cu'}) 淨距 ${fmt(Math.max(0, d))}mm < ${cl.traceToTrace}mm @(${v.x.toFixed(1)},${v.y.toFixed(1)})`);
      }
      for (const P of pads) {
        if (vnet && vnet === P.net) continue;
        const d = ptPadDist(v.x, v.y, P.sh) - vr;
        if (d < cl.padToPad - EPS)
          add('via對焊盤', 'error', `via#${i + 1}(${vnet || '無網路'}) ↔ 焊盤 ${P.label}(${P.net || '無網路'}) 淨距 ${fmt(Math.max(0, d))}mm < ${cl.padToPad}mm @(${v.x.toFixed(1)},${v.y.toFixed(1)})`);
      }
    }

    // 5) 環寬（annular ring）：THT pad 與 via
    for (const P of pads) {
      if (!P.plated) continue;
      const p = P.p;
      const ring = p.slot
        ? Math.min((p.w - p.slot.w) / 2, (p.h - p.slot.h) / 2)
        : (Math.min(p.w, p.h) - p.drill) / 2;
      if (ring < -EPS)
        add('環寬', 'error', `焊盤 ${P.label} 鑽孔大於焊盤（環寬 ${fmt(ring)}mm）${at(P.sh)}`);
      else if (ring < via.minRing - EPS)
        add('環寬', 'error', `焊盤 ${P.label} 環寬 ${fmt(ring)}mm < ${via.minRing}mm（斷環風險）${at(P.sh)}`);
    }
    vias.forEach((v, i) => {
      const ring = ((v.od || 0.6) - (v.id || 0.3)) / 2;
      if (ring < via.minRing - EPS)
        add('via環寬', 'warning', `via#${i + 1} 環寬 ${fmt(ring)}mm < ${via.minRing}mm @(${v.x.toFixed(1)},${v.y.toFixed(1)})`);
    });

    // 6) 鑽孔：最小孔徑 + 孔對孔餘裕（斷鑽風險，與網路無關）
    for (const H of holes) {
      if (H.cap.d > 0 && H.cap.d < via.minDrill - EPS)
        add('最小孔徑', 'warning', `${H.label} 鑽孔 ${fmt(H.cap.d)}mm < ${via.minDrill}mm`);
    }
    for (let i = 0; i < holes.length; i++) for (let j = i + 1; j < holes.length; j++) {
      const g = capsuleGap(holes[i].cap, holes[j].cap);
      if (g < holeGapMin - EPS)
        add('孔對孔', 'error', `鑽孔過近：${holes[i].label} ↔ ${holes[j].label} 孔壁距 ${fmt(Math.max(0, g))}mm < ${holeGapMin}mm（斷鑽風險）`);
    }

    // 7) courtyard 重疊（KiCad 匯入元件有 CrtYd 外框才查；旋轉矩形精確判斷）
    const cyComps = (state.components || []).filter(c => c.crtyd);
    for (let i = 0; i < cyComps.length; i++) for (let j = i + 1; j < cyComps.length; j++) {
      const A = cyComps[i], B = cyComps[j];
      if ((A.side || 'top') !== (B.side || 'top')) continue;
      const poly = c => {
        const b = c.crtyd;
        const th = (c.rot || 0) * Math.PI / 180, co = Math.cos(th), si = Math.sin(th);
        return [[b.minx, b.miny], [b.maxx, b.miny], [b.maxx, b.maxy], [b.minx, b.maxy]]
          .map(([rx, ry]) => [c.x + rx * co + ry * si, c.y - rx * si + ry * co]);
      };
      if (polyDist(poly(A), poly(B)) <= EPS)
        add('courtyard', 'warning', `courtyard 重疊：${A.ref || A.label} ↔ ${B.ref || B.label} @(${A.x.toFixed(1)},${A.y.toFixed(1)})`);
    }

    // 8) 絲印壓 pad（同面，絲印線與 pad 銅面真重疊才報，比照 KiCad；文字不查）
    const SILK_CL = 0;
    for (const c of (state.components || [])) {
      for (const g of (c.silk || [])) {
        if (g.kind !== 'line') continue;
        const th = (c.rot || 0) * Math.PI / 180, co = Math.cos(th), si = Math.sin(th);
        const ax = c.x + g.x1 * co + g.y1 * si, ay = c.y - g.x1 * si + g.y1 * co;
        const bx = c.x + g.x2 * co + g.y2 * si, by = c.y - g.x2 * si + g.y2 * co;
        for (const P of pads) {
          if (P.side !== '*' && P.side !== g.side) continue;
          if (ptSegDist(P.sh.cx, P.sh.cy, ax, ay, bx, by) - P.sh.circ - (g.w || 0.12) / 2 >= SILK_CL) continue;
          const d = segPadDist(ax, ay, bx, by, P.sh) - (g.w || 0.12) / 2;
          if (d < SILK_CL - EPS)
            add('絲印壓pad', 'warning', `絲印線壓到焊盤銅面：${c.ref || c.label} 絲印 ↔ ${P.label}（重疊 ${fmt(Math.abs(d))}mm）${at(P.sh)}`);
        }
      }
    }

    // 9) 走線 ↔ 板框（有真實板框幾何才做；矩形近似版在 pcb.js）
    const eSegs = state.edgeSegs || [];
    if (eSegs.length) {
      const lim = cl.traceToEdge;
      for (let i = 0; i < traces.length; i++) {
        const t = traces[i], tw = (t.width || 0.3) / 2;
        let m = Infinity, mEnd = Infinity;
        for (const e of eSegs) {
          m = Math.min(m, segSegDist(t.x1, t.y1, t.x2, t.y2, e.x1, e.y1, e.x2, e.y2));
          mEnd = Math.min(mEnd, ptSegDist(t.x1, t.y1, e.x1, e.y1, e.x2, e.y2), ptSegDist(t.x2, t.y2, e.x1, e.y1, e.x2, e.y2));
        }
        const d = m - tw;
        if (d >= lim - EPS) continue;
        const loc = `@(${t.x1.toFixed(1)},${t.y1.toFixed(1)})`;
        if (d >= -EPS)
          add('走線對板框', 'warning', `走線#${i + 1}(${t.net || '無網路'}) 距板框 ${fmt(Math.max(0, d))}mm < ${lim}mm ${loc}`);
        else if (mEnd <= tw + EPS)
          add('走線止於板框', 'warning', `走線#${i + 1}(${t.net || '無網路'}) 止於板框（城堡孔/邊緣鍍金屬刻意設計則可忽略）${loc}`);
        else
          add('走線跨越板框', 'error', `走線#${i + 1}(${t.net || '無網路'}) 跨越板框 ${loc}`);
      }
    }

    // 誠實附註
    if (customCount > 0)
      res.push({ type: 'info', message: `${customCount} 個 custom 形狀焊盤以外框矩形近似檢查` });
    if ((state.zoneFills || []).length > 0)
      res.push({ type: 'info', message: '鋪銅避讓未檢查（沿用 KiCad 填充結果）' });
    Object.entries(tally).forEach(([k, n]) => {
      if (n > CAP) res.push({ type: 'info', message: `${k}：僅列前 ${CAP} 筆，另有 ${n - CAP} 筆（共 ${n}）` });
    });
    return res;
  };

  return { run, _geom: { ptSegDist, segSegDist, ptInPoly, polyDist, padShape, corners, padDist, segPadDist, ptPadDist, holeCapsule, capsuleGap } };
})();
