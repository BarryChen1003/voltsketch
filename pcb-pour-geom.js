// 鋪銅幾何（多邊形布林版）
//
// 原本的鋪銅避讓是**柵格**做的（見 pcb-pour.js 檔頭）：把區域畫成點陣、扣掉避讓、
// 洪水填充找孤島。誤差是可預期的，但解析度以下的細頸會被當成斷開，
// 而且輸出是一堆小矩形而不是真正的多邊形。
//
// 這支改用 Clipper（vendor/clipper-6.4.2.js）做真正的多邊形布林：
//   鋪銅區 −（異網 pad／走線／via 各自膨脹淨空後的聯集）−（禁佈區）∩（板框內縮）
//   同網 pad 依設定做熱風焊盤（挖環再補四根輻條）或直接實心相連。
//
// 為什麼可以改：Clipper 用整數座標（這裡放大 1e5，即 0.01µm），自交、共線、
// 浮點退化那些問題由它處理，而且它是 CAM 業界用了十幾年的實作，不是我們自己刻的。
//
// 誠實界定：
//   - 回傳的是「銅要留在哪裡」的多邊形（含內孔），不是影像。呼叫端負責畫與匯出。
//   - 圓形/橢圓 pad 以 24 邊多邊形近似（0.15mm pad 的誤差約 1µm，遠小於製造公差）。
//   - 孤島判定用「這塊銅裡面有沒有同網的 pad／via／走線端點」，跟柵格版同一個準則。
//
// 純函式（不碰 DOM），node 可直接測。
(() => {
  'use strict';

  const S = 1e5;                       // mm → 整數（0.01µm）
  const toI = v => Math.round(v * S);
  const toMM = v => v / S;
  const CIRCLE_SEGS = 24;

  const lib = () => (typeof window !== 'undefined' && window.ClipperLib) ||
                    (typeof global !== 'undefined' && global.ClipperLib) || null;

  const toPath = pts => pts.map(p => ({ X: toI(p[0]), Y: toI(p[1]) }));
  const fromPath = path => path.map(p => [toMM(p.X), toMM(p.Y)]);

  // 矩形（可旋轉）
  function rectPath(cx, cy, w, h, rotDeg) {
    const th = (rotDeg || 0) * Math.PI / 180, c = Math.cos(th), s = Math.sin(th);
    const hw = w / 2, hh = h / 2;
    return [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]]
      .map(([x, y]) => [cx + x * c + y * s, cy - x * s + y * c]);
  }

  function circlePath(cx, cy, r) {
    const out = [];
    for (let i = 0; i < CIRCLE_SEGS; i++) {
      const a = i / CIRCLE_SEGS * Math.PI * 2;
      out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    return out;
  }

  // 走線＝膠囊。用矩形＋兩端圓形的聯集交給 Clipper 處理，不自己算膠囊外形。
  function tracePaths(t, extra) {
    const dx = t.x2 - t.x1, dy = t.y2 - t.y1;
    const len = Math.hypot(dx, dy);
    const r = (t.width || 0.3) / 2 + extra;
    if (len < 1e-9) return [circlePath(t.x1, t.y1, r)];
    const ux = dx / len, uy = dy / len;
    const nx = -uy * r, ny = ux * r;
    return [
      [[t.x1 + nx, t.y1 + ny], [t.x2 + nx, t.y2 + ny], [t.x2 - nx, t.y2 - ny], [t.x1 - nx, t.y1 - ny]],
      circlePath(t.x1, t.y1, r), circlePath(t.x2, t.y2, r)
    ];
  }

  function padPaths(comp, pad, padAbs, extra) {
    const a = padAbs(comp, pad);
    const w = (pad.w || 0.5) + 2 * extra, h = (pad.h || 0.5) + 2 * extra;
    if (pad.shape === 'circle') return [circlePath(a.x, a.y, w / 2)];
    if (pad.shape === 'oval') {
      // 橢圓用「矩形 + 兩端圓」近似：與 DRC 的 capsule 判定同一套形狀
      const r = Math.min(w, h) / 2;
      const long = Math.max(w, h) - 2 * r;
      const horiz = w >= h;
      const rot = (pad.rot || 0) * Math.PI / 180;
      const ux = horiz ? Math.cos(rot) : -Math.sin(rot);
      const uy = horiz ? -Math.sin(rot) : -Math.cos(rot);
      const c1 = [a.x - ux * long / 2, a.y - uy * long / 2];
      const c2 = [a.x + ux * long / 2, a.y + uy * long / 2];
      return [rectPath(a.x, a.y, w, h, pad.rot || 0), circlePath(c1[0], c1[1], r), circlePath(c2[0], c2[1], r)];
    }
    return [rectPath(a.x, a.y, w, h, pad.rot || 0)];
  }

  // 自己造的 clip 路徑統一成同一個繞向（subject 不動，理由見 clip()）。
  // 互相抵銷：走線的膠囊是「矩形 + 兩端圓」，圓是逆時針、矩形是順時針的話，
  // 兩端的圓會把矩形挖掉一塊——實測少挖了 0.785mm²，避讓就不夠。
  function normOrient(C, paths) {
    return paths.map(path => (C.Clipper.Orientation(path) ? path : path.slice().reverse()));
  }

  function clip(C, subject, clips, type) {
    const c = new C.Clipper();
    // subject 一律照原樣：它可能是上一步的結果，內孔的繞向本來就與外框相反，
    // 統一繞向會把內孔變成實心，聯集之後洞就自己填回去了（實測避讓全部消失）。
    c.AddPaths(subject, C.PolyType.ptSubject, true);
    if (clips && clips.length) c.AddPaths(normOrient(C, clips), C.PolyType.ptClip, true);
    const tree = new C.PolyTree();
    c.Execute(type, tree, C.PolyFillType.pftNonZero, C.PolyFillType.pftNonZero);
    return tree;
  }

  function treeToIslands(C, tree) {
    const out = [];
    const walk = node => {
      for (const child of node.Childs()) {
        if (!child.IsHole()) {
          const island = { outer: fromPath(child.Contour()), holes: [] };
          for (const h of child.Childs()) {
            if (h.IsHole()) island.holes.push(fromPath(h.Contour()));
            walk(h);           // 洞裡面還可以有島
          }
          out.push(island);
        } else {
          walk(child);
        }
      }
    };
    walk(tree);
    return out;
  }

  const ptInPoly = (x, y, pts) => {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside;
    }
    return inside;
  };

  const areaOf = pts => {
    let a = 0;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) a += (pts[j][0] * pts[i][1] - pts[i][0] * pts[j][1]);
    return Math.abs(a / 2);
  };

  const PourGeom = {
    available() { return !!lib(); },

    /**
     * 算出一塊鋪銅實際留下的銅。
     * zone: { layer, net, pts, clearance, thermal }
     * opts: { clearance:{traceToTrace,traceToPad,traceToEdge}, spokeWidth, keepOrphans }
     * 回 { ok, islands:[{outer,holes}], dropped, area, warnings, reason }
     */
    build(state, padAbs, zone, opts) {
      const C = lib();
      if (!C) return { ok: false, reason: 'noClipper', islands: [], dropped: 0, area: 0 };
      if (!zone || !zone.pts || zone.pts.length < 3) return { ok: false, reason: 'badZone', islands: [], dropped: 0, area: 0 };
      opts = Object.assign({ clearance: null, spokeWidth: 0.4, keepOrphans: false }, opts || {});
      const cl = opts.clearance || {};
      const gap = (zone.clearance > 0 ? zone.clearance : (cl.traceToTrace || 0.3));
      const lay = zone.layer || 'F.Cu';
      const net = zone.net || '';
      const warnings = [];

      // 1) 起始區域＝鋪銅外框 ∩ 板框內縮（板邊淨空）
      const bw = (state.boardWidth || 100) / 2 - (cl.traceToEdge || 0.3);
      const bh = (state.boardHeight || 80) / 2 - (cl.traceToEdge || 0.3);
      let tree = clip(C,
        [toPath(zone.pts)],
        [toPath([[-bw, -bh], [bw, -bh], [bw, bh], [-bw, bh]])],
        C.ClipType.ctIntersection);
      let current = C.Clipper.PolyTreeToPaths(tree);
      if (!current.length) return { ok: true, islands: [], dropped: 0, area: 0, warnings };

      // 2) 扣掉異網的銅（各自膨脹淨空）
      const cuts = [];
      const spokes = [];
      for (const c of (state.components || [])) for (const p of (c.pads || [])) {
        if (p.cu === false) continue;
        const side = p.side;
        if (!(side === '*' || (side === 'B' ? lay === 'B.Cu' : lay === 'F.Cu'))) continue;
        const isMine = net && (p.net || '') === net;
        if (isMine) {
          if (zone.thermal === false) continue;             // 實心相連：不挖
          // 熱風焊盤：挖出環隙，再補四根輻條把 pad 接回鋪銅
          cuts.push(...padPaths(c, p, padAbs, gap));
          const a = padAbs(c, p);
          const reach = Math.max(p.w || 0.5, p.h || 0.5) / 2 + gap + 0.05;
          const sw = opts.spokeWidth;
          for (let k = 0; k < 4; k++) {
            const ang = (p.rot || 0) * Math.PI / 180 + k * Math.PI / 2;
            spokes.push(rectPath(a.x + Math.cos(ang) * reach / 2, a.y + Math.sin(ang) * reach / 2,
              reach, sw, -ang * 180 / Math.PI));
          }
        } else {
          cuts.push(...padPaths(c, p, padAbs, cl.traceToPad != null ? Math.max(gap, cl.traceToPad) : gap));
        }
      }
      for (const t of (state.traces || [])) {
        if ((t.layer || 'F.Cu') !== lay) continue;
        if (net && (t.net || '') === net) continue;         // 同網走線本來就該連在一起
        cuts.push(...tracePaths(t, gap));
      }
      for (const v of (state.vias || [])) {
        if (net && (v.net || '') === net) continue;
        cuts.push(circlePath(v.x, v.y, (v.od || 0.7) / 2 + gap));
      }
      for (const k of (state.keepouts || [])) {
        if (!k.pts || k.pts.length < 3) continue;
        if (k.layer && k.layer !== '*' && k.layer !== lay) continue;
        cuts.push(k.pts.map(p => [p[0], p[1]]));            // 禁佈區照原樣，不加淨空
      }

      if (cuts.length) {
        tree = clip(C, current, cuts.map(toPath), C.ClipType.ctDifference);
        current = C.Clipper.PolyTreeToPaths(tree);
      }
      // 熱風輻條補回去（要在扣完之後，否則會被自己的環隙吃掉）
      if (spokes.length) {
        tree = clip(C, current, spokes.map(toPath), C.ClipType.ctUnion);
        current = C.Clipper.PolyTreeToPaths(tree);
      }
      tree = clip(C, current, [], C.ClipType.ctUnion);      // 整理成 PolyTree（外框/內孔分層）
      let islands = treeToIslands(C, tree);

      // 3) 孤島：這塊銅裡面沒有任何同網的東西＝浮空的銅，拿掉。
      //    判準與柵格版一致；差別只在這裡是用多邊形內含測試，不是洪水填充。
      let dropped = 0;
      if (net && !opts.keepOrphans) {
        const anchors = [];
        for (const c of (state.components || [])) for (const p of (c.pads || [])) {
          if (p.cu === false || (p.net || '') !== net) continue;
          const side = p.side;
          if (!(side === '*' || (side === 'B' ? lay === 'B.Cu' : lay === 'F.Cu'))) continue;
          const a = padAbs(c, p);
          anchors.push([a.x, a.y]);
        }
        for (const v of (state.vias || [])) if ((v.net || '') === net) anchors.push([v.x, v.y]);
        for (const t of (state.traces || [])) {
          if ((t.layer || 'F.Cu') !== lay || (t.net || '') !== net) continue;
          anchors.push([t.x1, t.y1], [t.x2, t.y2], [(t.x1 + t.x2) / 2, (t.y1 + t.y2) / 2]);
        }
        const before = islands.length;
        islands = islands.filter(is => anchors.some(a =>
          ptInPoly(a[0], a[1], is.outer) && !is.holes.some(h => ptInPoly(a[0], a[1], h))));
        dropped = before - islands.length;
        if (!islands.length && before) warnings.push({ k: 'pourgeom_all_orphan', v: { n: before } });
      }

      const area = islands.reduce((sum, is) => sum + areaOf(is.outer) - is.holes.reduce((h, p) => h + areaOf(p), 0), 0);
      return { ok: true, islands, dropped, area, warnings };
    },

    _rectPath: rectPath, _circlePath: circlePath, _tracePaths: tracePaths, _areaOf: areaOf, _ptInPoly: ptInPoly
  };

  if (typeof window !== 'undefined') window.PourGeom = PourGeom;
  if (typeof module !== 'undefined' && module.exports) module.exports = PourGeom;
})();
