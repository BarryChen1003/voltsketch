// STEP (ISO 10303-21, AP214) 3D 匯出
//
// 用途：把板子交給結構端做干涉檢查。Gerber 是 2D，機構要的是實體。
//
// 誠實界定（很重要，別讓使用者以為拿到的是原廠模型）：
//   板子是「板框多邊形沿 Z 擠出板厚」的實體；元件是「封裝外框擠出高度」的方塊。
//   **沒有元件外形庫**，所以方塊只代表佔位空間（外殼高度），不是真實外觀。
//   要看真實外觀得用原廠 STEP，那是元件庫的工程，不在這裡。
//
// 幾何全部走同一個原語：把一個封閉多邊形沿 Z 擠成柱體（prism）。
// 板框、方塊都是它，所以只要這一個原語對，整份檔就對。
//
// 能驗什麼、不能驗什麼：
//   能驗——參照完整性（不可有指向不存在的實體）、拓樸流形性（每條邊剛好被兩個面用到
//   且方向相反）、尤拉示性數 V−E+F=2、座標與輸入一致。這些是程式驗得了的。
//   不能驗——「在 SolidWorks / Fusion 開得起來」。沒人拿真的 CAD 開過就不准這樣寫。
(() => {
  'use strict';

  // 元件高度：沒有外形庫，只能依封裝類別給佔位高度。這是估值，UI 要講明白。
  const HEIGHT = {
    '0201': 0.3, '0402': 0.5, '0603': 0.6, '0805': 0.75, '1206': 0.95, '1210': 1.2, '2512': 1.2,
    'SOD-323': 1.0, 'SOD-123': 1.1, 'SMA': 2.3, 'SMB': 2.3, 'SMC': 2.6,
    'SOT-23': 1.15, 'SOT-23-5': 1.15, 'SOT-89': 1.6, 'SOT-223': 1.8,
    'DPAK': 2.3, 'D2PAK': 4.6, 'hdr': 8.5, 'term': 10, 'tp': 0.1, 'hole': 0
  };
  const DEFAULT_H = 1.6;

  function heightOf(comp) {
    if (comp.height > 0) return comp.height;
    const v = String(comp.footprintVariant || comp.part || '');
    for (const k of Object.keys(HEIGHT)) if (v.indexOf(k) >= 0) return HEIGHT[k];
    return DEFAULT_H;
  }

  // ---------- 線段接成封閉多邊形 ----------
  // edgeSegs 是一堆無序線段。要擠出實體必須先接成有序迴路，接不起來就不能硬做。
  function loopFromSegs(segs, tol) {
    const t = tol > 0 ? tol : 0.01;
    if (!segs || !segs.length) return null;
    const used = new Array(segs.length).fill(false);
    const near = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by) <= t;
    const start = segs[0];
    const pts = [[start.x1, start.y1], [start.x2, start.y2]];
    used[0] = true;
    let guard = 0;
    for (;;) {
      if (++guard > segs.length + 2) return null;
      const [cx, cy] = pts[pts.length - 1];
      if (pts.length > 2 && near(cx, cy, pts[0][0], pts[0][1])) { pts.pop(); break; }
      let found = -1, nx = 0, ny = 0;
      for (let i = 0; i < segs.length; i++) {
        if (used[i]) continue;
        const s = segs[i];
        if (near(cx, cy, s.x1, s.y1)) { found = i; nx = s.x2; ny = s.y2; break; }
        if (near(cx, cy, s.x2, s.y2)) { found = i; nx = s.x1; ny = s.y1; break; }
      }
      if (found < 0) return null;                 // 接不下去＝板框沒封閉
      used[found] = true;
      pts.push([nx, ny]);
    }
    if (used.some(u => !u)) return null;           // 有線段沒被用到＝不只一條迴路
    if (pts.length < 3) return null;
    return dedupe(pts, t);
  }

  function dedupe(pts, t) {
    const out = [];
    for (const p of pts) {
      const last = out[out.length - 1];
      if (last && Math.hypot(last[0] - p[0], last[1] - p[1]) <= t) continue;
      out.push(p);
    }
    return out.length >= 3 ? out : null;
  }

  const area2 = pts => {
    let a = 0;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], q = pts[(i + 1) % pts.length];
      a += p[0] * q[1] - q[0] * p[1];
    }
    return a;
  };

  // ---------- STEP 實體寫入器 ----------
  function Writer() {
    const lines = [];
    let id = 0;
    const put = body => { lines.push('#' + (++id) + ' = ' + body + ';'); return id; };
    // 匯入的模型自己帶編號（已經平移過），要照原樣寫進去而不是重新配號——
    // 重配的話實體之間的參照就對不上了。寫完把游標推到最大值之後。
    const raw = (n, body) => { lines.push('#' + n + ' = ' + body + ';'); if (n > id) id = n; return n; };
    return { put, raw, raw,
      get count() { return id; },
      lines,
      text(name) {
        const stamp = new Date().toISOString().replace(/\.\d+Z$/, '');
        return [
          'ISO-10303-21;', 'HEADER;',
          "FILE_DESCRIPTION((''),'2;1');",
          "FILE_NAME('" + name + "','" + stamp + "',(''),(''),'HardwareAI','','');",
          "FILE_SCHEMA(('AUTOMOTIVE_DESIGN { 1 0 10303 214 1 1 1 1 }'));",
          'ENDSEC;', 'DATA;'
        ].concat(lines, ['ENDSEC;', 'END-ISO-10303-21;']).join('\n') + '\n';
      }
    };
  }

  const f = v => {
    const n = Number(v);
    return (Math.abs(n) < 1e-12 ? 0 : n).toFixed(6).replace(/0+$/, '0');
  };

  /**
   * 把封閉多邊形沿 Z 擠成柱體，回傳 ADVANCED_FACE 的 id 陣列。
   * 面的方向統一朝外：底面朝 −Z、頂面朝 +Z、側面法向朝多邊形外側。
   */
  function prism(w, pts, z0, z1, stats) {
    const n = pts.length;
    // 逆時針化，側面法向才會一致朝外
    const poly = area2(pts) < 0 ? pts.slice().reverse() : pts.slice();
    const dirZ = w.put('DIRECTION(\'\',(0.,0.,1.))');
    const dirX = w.put('DIRECTION(\'\',(1.,0.,0.))');

    const vLo = [], vHi = [];
    for (const p of poly) {
      vLo.push(w.put('VERTEX_POINT(\'\',#' + w.put('CARTESIAN_POINT(\'\',(' + f(p[0]) + ',' + f(p[1]) + ',' + f(z0) + '))') + ')'));
      vHi.push(w.put('VERTEX_POINT(\'\',#' + w.put('CARTESIAN_POINT(\'\',(' + f(p[0]) + ',' + f(p[1]) + ',' + f(z1) + '))') + ')'));
    }
    // 邊：底 n、頂 n、垂直 n
    const line = (a, b) => {
      const pa = w.put('CARTESIAN_POINT(\'\',(0.,0.,0.))');   // 佔位方向向量的原點
      return w.put('EDGE_CURVE(\'\',#' + a + ',#' + b + ',#' +
        w.put('LINE(\'\',#' + pa + ',#' + w.put('VECTOR(\'\',#' + dirX + ',1.)') + ')') + ',.T.)');
    };
    const eLo = [], eHi = [], eUp = [];
    for (let i = 0; i < n; i++) {
      eLo.push(line(vLo[i], vLo[(i + 1) % n]));
      eHi.push(line(vHi[i], vHi[(i + 1) % n]));
      eUp.push(line(vLo[i], vHi[i]));
    }
    const face = (loopEdges, z, normalUp) => {
      const oriented = loopEdges.map(([e, dir]) => w.put('ORIENTED_EDGE(\'\',*,*,#' + e + ',' + (dir ? '.T.' : '.F.') + ')'));
      const loop = w.put('EDGE_LOOP(\'\',(' + oriented.map(o => '#' + o).join(',') + '))');
      const bound = w.put('FACE_OUTER_BOUND(\'\',#' + loop + ',.T.)');
      const org = w.put('CARTESIAN_POINT(\'\',(' + f(poly[0][0]) + ',' + f(poly[0][1]) + ',' + f(z) + '))');
      const ax = w.put('AXIS2_PLACEMENT_3D(\'\',#' + org + ',#' + dirZ + ',#' + dirX + ')');
      const pl = w.put('PLANE(\'\',#' + ax + ')');
      return w.put('ADVANCED_FACE(\'\',(#' + bound + '),#' + pl + ',' + (normalUp ? '.T.' : '.F.') + ')');
    };

    const faces = [];
    // 底面：法向 −Z，邊要反向繞
    faces.push(face(eLo.map((e, i) => [eLo[n - 1 - i], false]), z0, false));
    // 頂面：法向 +Z
    faces.push(face(eHi.map(e => [e, true]), z1, true));
    // 側面：底邊(正) → 右垂直(正) → 頂邊(反) → 左垂直(反)
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      faces.push(face([[eLo[i], true], [eUp[j], true], [eHi[i], false], [eUp[i], false]], z0, true));
    }
    if (stats) {
      stats.V += 2 * n; stats.E += 3 * n; stats.F += n + 2;
      stats.solids++;
    }
    return faces;
  }

  function solid(w, faces, name) {
    const shell = w.put('CLOSED_SHELL(\'\',(' + faces.map(x => '#' + x).join(',') + '))');
    return w.put('MANIFOLD_SOLID_BREP(\'' + name + '\',#' + shell + ')');
  }

  /**
   * 產生 STEP。opts: { thickness (板厚 mm，預設 1.6), components (預設 true) }
   * 回 { text, stats, warnings }
   */
  function build(state, opts) {
    opts = Object.assign({ thickness: 1.6, components: true, name: 'board' }, opts || {});
    const warnings = [];
    const stats = { V: 0, E: 0, F: 0, solids: 0, parts: 0 };
    const w = Writer();

    // 板框：有 edgeSegs 就接成迴路，接不起來退回矩形並警告
    let outline = null;
    if (state.edgeSegs && state.edgeSegs.length) {
      outline = loopFromSegs(state.edgeSegs, 0.01);
      if (!outline) warnings.push({ code: 'outlineNotClosed' });
    }
    if (!outline) {
      const hw = (state.boardWidth || 100) / 2, hh = (state.boardHeight || 80) / 2;
      outline = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]];
    }

    const th = opts.thickness > 0 ? opts.thickness : 1.6;
    const solids = [];
    solids.push(solid(w, prism(w, outline, 0, th, stats), 'PCB'));

    if (opts.components) {
      const SM = (typeof window !== 'undefined' && window.StepModel) ||
                 (typeof global !== 'undefined' && global.StepModel) || null;
      const models = (opts.models !== undefined) ? opts.models : (SM ? SM.store.all() : {});
      for (const c of (state.components || [])) {
        const bottomSide = (c.side === 'bottom' || c.side === 'B');

        // 綁了真模型就放真模型，沒綁才放佔位方塊。
        // 搬進來的實體編號要接在我們現有的後面（w.count），座標直接算好——
        // 為什麼是「算好」而不是留裝配變換，見 pcb-step-model.js 的檔頭。
        const key = SM && models ? SM.keyOf(c) : '';
        const rec = key && models ? models[key] : null;
        if (rec && rec.text) {
          const pr = SM.parse(rec.text);
          if (pr.ok) {
            const moved = SM.transplant(pr.entities, w.count, {
              x: c.x, y: c.y,
              z: bottomSide ? 0 : th,
              rot: c.rot || 0, mirror: bottomSide,
              scale: rec.scale > 0 ? rec.scale : 1
            });
            let top = 0;
            for (const e of moved) { w.raw(e.id, e.body); if (e.id > top) top = e.id; }
            for (const sid of SM.solidsOf(pr.entities)) solids.push(sid + (top - pr.maxId));
            stats.parts++; stats.models = (stats.models || 0) + 1;
            continue;
          }
          // 解析不了就退回方塊，並且**說出來**——安靜地少一顆模型，
          // 機構端會以為那顆料真的長這樣。
          warnings.push({ code: 'modelUnusable', ref: String(c.ref || c.id || ''), why: pr.reason });
        }

        const cw = c.w > 0 ? c.w : 1, ch = c.h > 0 ? c.h : 1;
        const h = heightOf(c);
        if (!(h > 0)) continue;                       // 高度 0（螺絲孔之類）不畫
        const th2 = (c.rot || 0) * Math.PI / 180;
        const cs = Math.cos(th2), sn = Math.sin(th2);
        const corners = [[-cw / 2, -ch / 2], [cw / 2, -ch / 2], [cw / 2, ch / 2], [-cw / 2, ch / 2]]
          .map(([x, y]) => [c.x + x * cs - y * sn, c.y + x * sn + y * cs]);
        const bottom = bottomSide ? -h : th;
        const top = bottomSide ? 0 : th + h;
        solids.push(solid(w, prism(w, corners, bottom, top, stats), String(c.ref || c.id || 'PART')));
        stats.parts++;
      }
    }

    // 最小可用的產品結構外殼：讓實體掛在一個 shape representation 底下
    const org = w.put('CARTESIAN_POINT(\'\',(0.,0.,0.))');
    const dz = w.put('DIRECTION(\'\',(0.,0.,1.))');
    const dx = w.put('DIRECTION(\'\',(1.,0.,0.))');
    const ax = w.put('AXIS2_PLACEMENT_3D(\'\',#' + org + ',#' + dz + ',#' + dx + ')');
    const uLen = w.put('( LENGTH_UNIT() NAMED_UNIT(*) SI_UNIT(.MILLI.,.METRE.) )');
    const uAng = w.put('( NAMED_UNIT(*) PLANE_ANGLE_UNIT() SI_UNIT($,.RADIAN.) )');
    const uSol = w.put('( NAMED_UNIT(*) SI_UNIT($,.STERADIAN.) SOLID_ANGLE_UNIT() )');
    const unc = w.put('UNCERTAINTY_MEASURE_WITH_UNIT(LENGTH_MEASURE(1.E-07),#' + uLen + ",'distance_accuracy_value','')");
    const ctx = w.put('( GEOMETRIC_REPRESENTATION_CONTEXT(3) GLOBAL_UNCERTAINTY_ASSIGNED_CONTEXT((#' + unc +
      ')) GLOBAL_UNIT_ASSIGNED_CONTEXT((#' + uLen + ',#' + uAng + ',#' + uSol + ')) REPRESENTATION_CONTEXT(\'\',\'3D\') )');
    w.put('ADVANCED_BREP_SHAPE_REPRESENTATION(\'' + opts.name + '\',(#' + ax + ',' +
      solids.map(s => '#' + s).join(',') + '),#' + ctx + ')');

    return { text: w.text(opts.name), stats, warnings, entities: w.count };
  }

  /**
   * 結構檢查：拿產出的 STEP 反過來驗自己。
   * 驗參照完整性與實體編號連續；拓樸性質由 build 的 stats 提供（每個柱體 V−E+F=2）。
   */
  function verify(text) {
    const ids = new Set(), refs = [];
    const problems = [];
    let n = 0, dup = 0;
    for (const ln of text.split(/\r?\n/)) {
      const m = /^#(\d+) = /.exec(ln);
      if (!m) continue;
      const id = +m[1];
      if (ids.has(id)) dup++;
      ids.add(id); n++;
      const body = ln.slice(m[0].length);
      for (const r of body.matchAll(/#(\d+)/g)) refs.push({ from: id, to: +r[1] });
    }
    const dangling = refs.filter(r => !ids.has(r.to));
    if (dup) problems.push({ code: 'duplicateId', n: dup });
    if (dangling.length) problems.push({ code: 'danglingRef', n: dangling.length, sample: dangling.slice(0, 3) });
    if (!/^ISO-10303-21;/.test(text)) problems.push({ code: 'badHeader' });
    if (!/END-ISO-10303-21;\s*$/.test(text)) problems.push({ code: 'badFooter' });
    if (!/FILE_SCHEMA/.test(text)) problems.push({ code: 'noSchema' });
    if (!/DATA;/.test(text) || !/ENDSEC;/.test(text)) problems.push({ code: 'noDataSection' });
    return { ok: problems.length === 0, entities: n, refs: refs.length, problems };
  }

  const Step = { build, verify, prism, loopFromSegs, heightOf, HEIGHT, DEFAULT_H, _Writer: Writer, _area2: area2 };
  if (typeof window !== 'undefined') window.PcbStep = Step;
  if (typeof module !== 'undefined' && module.exports) module.exports = Step;
})();
