// 3D 板面檢視。
//
// 畫得出來的東西：真實板框（KiCad 匯入的 Edge.Cuts 會串成多邊形擠出，串不起來才退回矩形）、
// 板厚依疊層、頂/底面元件（高度與顏色依 kind：IC 較高、被動件依封裝尺寸、連接器最高）、
// pad（含穿孔 pad 的鍍通銅柱）、頂/底層走線、via（銅環＋鑽孔）、鋪銅（使用者畫的與 KiCad 匯入的）。
//
// 誠實界定（不要因為它看起來像 3D 就當成機構圖）：
//   - 元件是**方塊**，不是原廠 3D 模型；高度是依封裝尺寸估的，不是真高度。
//   - 內層走線不畫（只畫頂/底層）；阻焊與絲印不畫。
//   - 板框若無 Edge.Cuts 幾何，用外接矩形近似。
//   - 要出機構圖請用 STEP 匯出（那也是佔位方塊，見 NEW-SESSION §8）。
//
// 效能：同材質的方塊全部合併成 InstancedMesh。一顆 mesh 一個 draw call，
// openrex-imx6（1436 pad）舊版會產生數千個 mesh，轉起來會頓。
//
// Three.js 一律從 vendor/ 自行代管載入，不走 CDN。
// 原本這裡抓 cdn.jsdelivr.net：本機 dev server 不套 _headers 所以看起來正常，
// 上線 CSP 是 `script-src 'self' https://static.cloudflareinsights.com`，一定被擋，
// 使用者只會看到「3D 檢視按了沒反應」。（2026-08-25 發現；csp-hash.js 已加守門）
window.Pcb3D = (() => {
  // 硬規矩 6：畫面上的字一律四語。I18N 沒載入就退回 key。
  const T = (k, v) => (window.I18N ? window.I18N.t(k, v) : k);
  let loaded = null;
  const THREE_FILES = ['./vendor/three-0.128.0.min.js', './vendor/three-orbitcontrols-0.128.0.js'];
  function loadThree() {
    if (loaded) return loaded;
    loaded = new Promise((resolve, reject) => {
      const next = i => {
        if (i >= THREE_FILES.length) return resolve();
        const el = document.createElement('script');
        el.src = THREE_FILES[i];
        el.onload = () => next(i + 1);
        // 檔案不在 vendor/ 就直說「尚未代管」，不要退回 CDN 假裝可用
        el.onerror = () => reject(new Error(T('p3d_err_vendor', { file: THREE_FILES[i] })));
        document.head.appendChild(el);
      };
      next(0);
    });
    return loaded;
  }

  let modal = null, renderer = null, animId = 0, onResize = null;

  function close() {
    if (animId) cancelAnimationFrame(animId);
    animId = 0;
    if (onResize) { window.removeEventListener('resize', onResize); onResize = null; }
    if (renderer) { renderer.dispose(); renderer = null; }
    if (modal) { modal.remove(); modal = null; }
    document.removeEventListener('keydown', escClose);
  }
  function escClose(e) { if (e.key === 'Escape') close(); }

  // ---------- 幾何小工具 ----------

  // Edge.Cuts 線段串成封閉多邊形。串不起來（有缺口、分岔）就回 null，由呼叫端退回矩形。
  // 這件事跟 ODB++ 的 profile 是同一個問題，作法也刻意一致。
  function outlineFromSegs(segs) {
    const list = (segs || []).filter(s => Number.isFinite(s.x1) && Number.isFinite(s.y1));
    if (list.length < 3) return null;
    const EPS = 0.02;
    const same = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]) <= EPS;
    const pool = list.map(s => [[s.x1, s.y1], [s.x2, s.y2]]);
    const pts = [pool[0][0], pool[0][1]];
    pool.splice(0, 1);
    let guard = pool.length + 2;
    while (pool.length && guard-- > 0) {
      const tail = pts[pts.length - 1];
      const i = pool.findIndex(s => same(s[0], tail) || same(s[1], tail));
      if (i < 0) break;
      const s = pool.splice(i, 1)[0];
      pts.push(same(s[0], tail) ? s[1] : s[0]);
    }
    if (pool.length || pts.length < 4 || !same(pts[0], pts[pts.length - 1])) return null;
    pts.pop();
    return pts;
  }

  // 元件高度（mm）：沒有原廠 3D 模型，只能依 kind 與封裝尺寸估。
  // 這是「看起來合理」不是「量得出來」，所以提示列會講明是近似。
  function heightOf(c) {
    const w = Math.max(0.6, c.w || 2), h = Math.max(0.6, c.h || 2);
    const small = Math.min(w, h), big = Math.max(w, h);
    switch (c.kind) {
      case 'mech': return 0;                                  // 安裝孔不是元件，不畫方塊
      case 'conn': return Math.min(11, Math.max(3, small * 0.9));
      case 'ic': return big > 12 ? 1.6 : Math.min(1.4, Math.max(0.8, small * 0.12));
      case 'passive': return Math.min(1.2, Math.max(0.35, small * 0.5));
      default: return Math.min(3, Math.max(0.8, small * 0.45));
    }
  }

  const KIND_COLOR = { ic: 0x263238, passive: 0x455a64, conn: 0x37474f, mech: 0x90a4ae };

  function open(state, padAbs) {
    return loadThree().then(() => build(state, padAbs), err => { alert(err.message); });
  }

  function build(state, padAbs) {
    close();
    const W = state.boardWidth || 100, H = state.boardHeight || 80;
    const cuCount = ((state.layerStack || []).filter(l => l.kind === 'copper').length) || 2;
    // 板厚：1.6mm 是常規；層數多的板通常也還是 1.6，但 8 層以上做厚一點比較接近實物
    const TH = cuCount >= 8 ? 2.0 : 1.6;

    const outline = outlineFromSegs(state.edgeSegs);
    const stats = { comps: 0, pads: 0, traces: 0, vias: 0, zones: 0 };

    modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(10,12,20,.92);z-index:9999;display:flex;flex-direction:column';
    modal.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 16px;color:#ecf0f1;font-size:13px">' +
      '<span id="p3dHint" style="flex:1"></span>' +
      '<button id="p3dClose" style="padding:6px 14px;cursor:pointer">' + T('p3d_close') + '</button></div>' +
      '<div id="p3dHost" style="flex:1;min-height:0"></div>' +
      '<div id="p3dStats" style="padding:6px 16px;color:#95a5a6;font-size:12px;font-family:monospace"></div>';
    document.body.appendChild(modal);
    modal.querySelector('#p3dClose').addEventListener('click', close);
    document.addEventListener('keydown', escClose);
    modal.querySelector('#p3dHint').textContent = T('p3d_hint');

    const host = modal.querySelector('#p3dHost');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x10131c);
    const span = Math.max(W, H);
    const cam = new THREE.PerspectiveCamera(50, Math.max(1, host.clientWidth) / Math.max(1, host.clientHeight), 0.1, 4000);
    cam.position.set(0, span * 0.85, span * 0.75);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(Math.max(1, host.clientWidth), Math.max(1, host.clientHeight));
    host.appendChild(renderer.domElement);
    const ctrl = new THREE.OrbitControls(cam, renderer.domElement);
    ctrl.target.set(0, 0, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.62));
    const dl = new THREE.DirectionalLight(0xffffff, 0.55);
    dl.position.set(span * 0.6, span * 1.2, span * 0.8);
    scene.add(dl);
    const dl2 = new THREE.DirectionalLight(0xffffff, 0.25);
    dl2.position.set(-span * 0.7, span * 0.4, -span * 0.6);
    scene.add(dl2);

    const mat = {
      board: new THREE.MeshLambertMaterial({ color: 0x14532d }),
      pad: new THREE.MeshLambertMaterial({ color: 0xd4af37 }),
      barrel: new THREE.MeshLambertMaterial({ color: 0xc9a227 }),
      hole: new THREE.MeshBasicMaterial({ color: 0x05070c }),
      traceF: new THREE.MeshLambertMaterial({ color: 0xc0392b }),
      traceB: new THREE.MeshLambertMaterial({ color: 0x2980b9 }),
      pourF: new THREE.MeshLambertMaterial({ color: 0x8e44ad, transparent: true, opacity: 0.55 }),
      pourB: new THREE.MeshLambertMaterial({ color: 0x16a085, transparent: true, opacity: 0.55 }),
      comp: {}
    };
    for (const k of Object.keys(KIND_COLOR)) mat.comp[k] = new THREE.MeshLambertMaterial({ color: KIND_COLOR[k] });
    mat.comp.other = new THREE.MeshLambertMaterial({ color: 0x37474f });
    mat.compBottom = new THREE.MeshLambertMaterial({ color: 0x546e7a });

    // ---- 板 ----
    if (outline) {
      const shape = new THREE.Shape(outline.map(p => new THREE.Vector2(p[0], p[1])));
      const geo = new THREE.ExtrudeGeometry(shape, { depth: TH, bevelEnabled: false });
      const m = new THREE.Mesh(geo, mat.board);
      m.rotation.x = Math.PI / 2;          // XY 平面 → 站到 XZ（y 是厚度方向）
      m.position.y = TH / 2;
      scene.add(m);
    } else {
      scene.add(new THREE.Mesh(new THREE.BoxGeometry(W, TH, H), mat.board));
    }

    // ---- 同材質方塊合併成 InstancedMesh ----
    // 一顆 mesh 一個 draw call。舊版一個 pad 一顆 mesh，大板直接頓住。
    const boxes = new Map();   // material → [{x,y,z,w,h,d,rotY}]
    const pushBox = (m, b) => { if (!boxes.has(m)) boxes.set(m, []); boxes.get(m).push(b); };
    const cyls = new Map();    // material → [{x,y,z,r,h}]
    const pushCyl = (m, c) => { if (!cyls.has(m)) cyls.set(m, []); cyls.get(m).push(c); };

    // ---- 元件與 pad ----
    for (const c of (state.components || [])) {
      const bottom = (c.side || 'top') === 'bottom';
      const hgt = heightOf(c);
      if (hgt > 0) {
        stats.comps++;
        pushBox(bottom ? mat.compBottom : (mat.comp[c.kind] || mat.comp.other), {
          x: c.x, y: bottom ? -(TH / 2 + hgt / 2) : TH / 2 + hgt / 2, z: c.y,
          w: Math.max(0.6, c.w || 3), h: hgt, d: Math.max(0.6, c.h || 2),
          rotY: (c.rot || 0) * Math.PI / 180
        });
      }
      for (const p of (c.pads || [])) {
        const a = padAbs(c, p);
        const thru = p.side === '*';
        if (p.cu !== false) {
          stats.pads++;
          const pw = Math.max(0.2, p.w || 0.5), ph = Math.max(0.2, p.h || 0.5);
          const onBottom = p.side === 'B' || (p.side === '*' && bottom);
          if (thru) {
            // 穿孔 pad：上下各一片銅 + 中間鍍通銅柱
            pushBox(mat.pad, { x: a.x, y: TH / 2 + 0.03, z: a.y, w: pw, h: 0.06, d: ph, rotY: (p.rot || 0) * Math.PI / 180 });
            pushBox(mat.pad, { x: a.x, y: -(TH / 2 + 0.03), z: a.y, w: pw, h: 0.06, d: ph, rotY: (p.rot || 0) * Math.PI / 180 });
            if (p.drill > 0) pushCyl(mat.barrel, { x: a.x, y: 0, z: a.y, r: p.drill / 2 + 0.05, h: TH });
          } else {
            pushBox(mat.pad, {
              x: a.x, y: onBottom ? -(TH / 2 + 0.03) : TH / 2 + 0.03, z: a.y,
              w: pw, h: 0.06, d: ph, rotY: (p.rot || 0) * Math.PI / 180
            });
          }
        }
        // 鑽孔（含無銅的機構孔）：挖不了洞就用深色圓柱表示，至少看得出那裡有孔
        if (p.drill > 0) pushCyl(mat.hole, { x: a.x, y: 0, z: a.y, r: p.drill / 2, h: TH + 0.3 });
      }
    }

    // ---- 走線（只畫頂/底層）----
    for (const t of (state.traces || [])) {
      const layer = t.layer || 'F.Cu';
      const bottom = layer === 'B.Cu';
      if (!bottom && layer !== 'F.Cu') continue;
      const L = Math.hypot(t.x2 - t.x1, t.y2 - t.y1);
      if (L < 1e-6) continue;
      stats.traces++;
      pushBox(bottom ? mat.traceB : mat.traceF, {
        x: (t.x1 + t.x2) / 2, y: bottom ? -(TH / 2 + 0.04) : TH / 2 + 0.04, z: (t.y1 + t.y2) / 2,
        w: L, h: 0.05, d: Math.max(0.08, t.width || 0.3),
        rotY: -Math.atan2(t.y2 - t.y1, t.x2 - t.x1)
      });
    }

    // ---- via：銅環 + 鑽孔 ----
    for (const v of (state.vias || [])) {
      stats.vias++;
      pushCyl(mat.barrel, { x: v.x, y: 0, z: v.y, r: (v.od || 0.6) / 2, h: TH + 0.12 });
      pushCyl(mat.hole, { x: v.x, y: 0, z: v.y, r: Math.max(0.05, (v.drill || 0.3) / 2), h: TH + 0.3 });
    }

    // ---- 鋪銅 ----
    const zones = [].concat(state.userZones || [], state.zoneFills || []);
    for (const z of zones) {
      const pts = z.pts || [];
      if (pts.length < 3) continue;
      const bottom = (z.layer || 'F.Cu') === 'B.Cu';
      if (!bottom && (z.layer || 'F.Cu') !== 'F.Cu') continue;
      stats.zones++;
      const shape = new THREE.Shape(pts.map(p => new THREE.Vector2(p[0], p[1])));
      const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.04, bevelEnabled: false });
      const m = new THREE.Mesh(geo, bottom ? mat.pourB : mat.pourF);
      m.rotation.x = Math.PI / 2;
      m.position.y = bottom ? -(TH / 2 + 0.02) : TH / 2 + 0.02;
      scene.add(m);
    }

    // ---- 實際建立 InstancedMesh ----
    const unitBox = new THREE.BoxGeometry(1, 1, 1);
    const unitCyl = new THREE.CylinderGeometry(1, 1, 1, 14);
    const dummy = new THREE.Object3D();
    for (const [material, list] of boxes) {
      if (!list.length) continue;
      const im = new THREE.InstancedMesh(unitBox, material, list.length);
      list.forEach((b, i) => {
        dummy.position.set(b.x, b.y, b.z);
        dummy.rotation.set(0, b.rotY || 0, 0);
        dummy.scale.set(b.w, b.h, b.d);
        dummy.updateMatrix();
        im.setMatrixAt(i, dummy.matrix);
      });
      im.instanceMatrix.needsUpdate = true;
      scene.add(im);
    }
    for (const [material, list] of cyls) {
      if (!list.length) continue;
      const im = new THREE.InstancedMesh(unitCyl, material, list.length);
      list.forEach((c, i) => {
        dummy.position.set(c.x, c.y, c.z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(c.r, c.h, c.r);
        dummy.updateMatrix();
        im.setMatrixAt(i, dummy.matrix);
      });
      im.instanceMatrix.needsUpdate = true;
      scene.add(im);
    }

    const statsEl = modal.querySelector('#p3dStats');
    if (statsEl) {
      statsEl.textContent = T('p3d_stats', {
        comps: stats.comps, pads: stats.pads, traces: stats.traces, vias: stats.vias, zones: stats.zones,
        th: TH.toFixed(1), cu: cuCount
      }) + (outline ? '' : '　' + T('p3d_rect_outline'));
    }

    onResize = () => {
      if (!renderer) return;
      const w = Math.max(1, host.clientWidth), h = Math.max(1, host.clientHeight);
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);
    (function loop() {
      if (!renderer) return;
      ctrl.update();
      renderer.render(scene, cam);
      animId = requestAnimationFrame(loop);
    })();
    return { stats, outline: !!outline, thickness: TH };
  }

  return { open, close, _outlineFromSegs: outlineFromSegs, _heightOf: heightOf };
})();
