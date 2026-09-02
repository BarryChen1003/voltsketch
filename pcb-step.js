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

    const pt = (x, y, z) => w.put('CARTESIAN_POINT(\'\',(' + f(x) + ',' + f(y) + ',' + f(z) + '))');
    const dir = (x, y, z) => w.put('DIRECTION(\'\',(' + f(x) + ',' + f(y) + ',' + f(z) + '))');

    const vLo = [], vHi = [];
    for (const p of poly) {
      vLo.push(w.put('VERTEX_POINT(\'\',#' + pt(p[0], p[1], z0) + ')'));
      vHi.push(w.put('VERTEX_POINT(\'\',#' + pt(p[0], p[1], z1) + ')'));
    }

    // 邊的曲線要**真的通過那兩個端點**。
    // 舊版所有邊共用一條「過原點、方向 +X」的 LINE：拓樸看起來對（每條邊剛好被兩個面用到、
    // 方向相反），尤拉示性數也對，所以我們自己的檢查全綠——但幾何整個是假的。
    // OCCT 開起來的症狀是「Self-intersecting wire / Unorientable shape」。
    const line = (ax, ay, az, bx, by, bz, va, vb) => {
      const dx = bx - ax, dy = by - ay, dz = bz - az;
      const L = Math.hypot(dx, dy, dz) || 1;
      const crv = w.put('LINE(\'\',#' + pt(ax, ay, az) + ',#' +
        w.put('VECTOR(\'\',#' + dir(dx / L, dy / L, dz / L) + ',' + f(L) + ')') + ')');
      return w.put('EDGE_CURVE(\'\',#' + va + ',#' + vb + ',#' + crv + ',.T.)');
    };
    const eLo = [], eHi = [], eUp = [];
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      eLo.push(line(poly[i][0], poly[i][1], z0, poly[j][0], poly[j][1], z0, vLo[i], vLo[j]));
      eHi.push(line(poly[i][0], poly[i][1], z1, poly[j][0], poly[j][1], z1, vHi[i], vHi[j]));
      eUp.push(line(poly[i][0], poly[i][1], z0, poly[i][0], poly[i][1], z1, vLo[i], vHi[i]));
    }

    /**
     * 一個面。法向（nx,ny,nz）給的是**這個面真正朝外的方向**，參考方向 rx.. 要跟它垂直。
     * 舊版所有面都用 +Z 當平面法向——頂面底面剛好對，四個側面的平面根本不含那圈邊，
     * 於是 OCCT 判定 wire 自交、面不可定向。same_sense 一律 .T.：
     * 方向靠「平面本身就朝外」表達，不靠翻轉旗標，少一層可以搞錯的間接。
     */
    const face = (loopEdges, ox, oy, oz, nx, ny, nz, rx, ry, rz) => {
      const oriented = loopEdges.map(([e, fwd]) => w.put('ORIENTED_EDGE(\'\',*,*,#' + e + ',' + (fwd ? '.T.' : '.F.') + ')'));
      const loop = w.put('EDGE_LOOP(\'\',(' + oriented.map(o => '#' + o).join(',') + '))');
      const bound = w.put('FACE_OUTER_BOUND(\'\',#' + loop + ',.T.)');
      const ax = w.put('AXIS2_PLACEMENT_3D(\'\',#' + pt(ox, oy, oz) + ',#' + dir(nx, ny, nz) + ',#' + dir(rx, ry, rz) + ')');
      const pl = w.put('PLANE(\'\',#' + ax + ')');
      return w.put('ADVANCED_FACE(\'\',(#' + bound + '),#' + pl + ',.T.)');
    };

    const faces = [];
    // 底面：法向 −Z。從下往上看要逆時針＝從上往下看是順時針，所以邊反向繞。
    faces.push(face(eLo.map((e, i) => [eLo[n - 1 - i], false]),
      poly[0][0], poly[0][1], z0, 0, 0, -1, 1, 0, 0));
    // 頂面：法向 +Z，照原本的逆時針
    faces.push(face(eHi.map(e => [e, true]),
      poly[0][0], poly[0][1], z1, 0, 0, 1, 1, 0, 0));
    // 側面：底邊(正) → 右垂直(正) → 頂邊(反) → 左垂直(反)
    // 逆時針多邊形的外側法向＝把邊方向 (dx,dy) 轉 −90°，也就是 (dy,−dx)。
    // 參考方向取邊本身，於是面內座標 X＝沿邊、Y＝向上，那圈邊剛好逆時針繞著法向。
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const dx = poly[j][0] - poly[i][0], dy = poly[j][1] - poly[i][1];
      const L = Math.hypot(dx, dy) || 1;
      faces.push(face([[eLo[i], true], [eUp[j], true], [eHi[i], false], [eUp[i], false]],
        poly[i][0], poly[i][1], z0, dy / L, -dx / L, 0, dx / L, dy / L, 0));
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
            // 攤平的代價要量出來：同一顆料放十次就有十份幾何（理由見 pcb-step-model.js 檔頭）。
            // 不量的話，使用者只看到「檔案怎麼這麼大」，不會知道那是這個取捨造成的，
            // 也就沒有依據判斷「值不值得改成裝配結構」。
            stats.modelUse = stats.modelUse || {};
            stats.modelUse[key] = (stats.modelUse[key] || 0) + 1;
            if (stats.modelUse[key] > 1) stats.dupEntities = (stats.dupEntities || 0) + pr.entities.length;
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
    const rep = w.put('ADVANCED_BREP_SHAPE_REPRESENTATION(\'' + opts.name + '\',(#' + ax + ',' +
      solids.map(s => '#' + s).join(',') + '),#' + ctx + ')');

    // ---- 產品結構：沒有這一段，真的 CAD 讀出來是**空的** ----
    //
    // STEP reader 不是從 shape representation 進去的，是從 PRODUCT_DEFINITION 走
    // PRODUCT_DEFINITION_SHAPE → SHAPE_DEFINITION_REPRESENTATION 才找到幾何。
    // 以前這裡只寫了 ADVANCED_BREP_SHAPE_REPRESENTATION，於是：
    //   - 我們自己的 step.test.js 全綠（參照完整、流形、尤拉示性數都對）
    //   - FreeCAD／OCCT 開起來 **0 個物件、shape isNull**（2026-09-02 實測 146KB 的檔）
    // 幾何一直都是對的，只是沒有任何門讓人走進來。
    // 這也是「自己驗自己永遠是綠的」最貴的一課：驗的是我們對格式的理解，
    // 而錯的正是那個理解。
    const appCtx = w.put("APPLICATION_CONTEXT('automotive design')");
    w.put("APPLICATION_PROTOCOL_DEFINITION('international standard','automotive_design',2000,#" + appCtx + ')');
    const prodCtx = w.put("PRODUCT_CONTEXT('',#" + appCtx + ",'mechanical')");
    const nm = String(opts.name || 'board').replace(/'/g, "''");
    const prod = w.put("PRODUCT('" + nm + "','" + nm + "','',(#" + prodCtx + '))');
    w.put("PRODUCT_RELATED_PRODUCT_CATEGORY('part','',(#" + prod + '))');
    const pdf = w.put("PRODUCT_DEFINITION_FORMATION('','',#" + prod + ')');
    const pdCtx = w.put("PRODUCT_DEFINITION_CONTEXT('part definition',#" + appCtx + ",'design')");
    const pd = w.put("PRODUCT_DEFINITION('design','',#" + pdf + ',#' + pdCtx + ')');
    const pds = w.put("PRODUCT_DEFINITION_SHAPE('','',#" + pd + ')');
    w.put('SHAPE_DEFINITION_REPRESENTATION(#' + pds + ',#' + rep + ')');

    // 幾何被複製了幾份：唯一模型數 vs 放置次數。裝配結構做得出來的話，
    // 省下來的就是 dupEntities 這些實體。這是給「該不該改成裝配」的判斷依據，
    // 不是警告——攤平是刻意的選擇，不是 bug。
    if (stats.modelUse) {
      stats.modelUnique = Object.keys(stats.modelUse).length;
      stats.modelPlacements = Object.values(stats.modelUse).reduce((a, n) => a + n, 0);
      stats.dupEntities = stats.dupEntities || 0;
      delete stats.modelUse;                 // 中繼資料，不進對外的統計
    }
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
