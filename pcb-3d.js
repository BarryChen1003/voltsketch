// 3D 板面檢視。
//
// 畫得出來的東西：真實板框（KiCad 匯入的 Edge.Cuts 會串成多邊形擠出，串不起來才退回矩形）、
// 板厚依疊層、頂/底面元件（高度與顏色依 kind：IC 較高、被動件依封裝尺寸、連接器最高）、
// pad（含穿孔 pad 的鍍通銅柱）、頂/底層走線、via（銅環＋鑽孔）、鋪銅（使用者畫的與 KiCad 匯入的）。
//
// 誠實界定（不要因為它看起來像 3D 就當成機構圖）：
//   - 元件外型由 pad 佈局反推（pcb-3d-shapes.js）：QFP 有四邊引腳、排針一根根、
//     晶振是金屬罐。**這是推論不是原廠 3D 模型**，尺寸與高度都是估的；
//     判不出封裝時退回方塊，classify() 會把那筆標成 guessed。
//   - 內層走線不畫（只畫頂/底層）。
//   - 阻焊、pad 開窗、絲印是「貼圖」不是幾何：夠遠看像真板子，貼到臉上會看到解析度。
//   - 板子資料沒有絲印圖形時，refdes 會被當絲印畫上去（真板子上那些字就是絲印），
//     但只在元件放得下時畫，放不下寧可不畫也不壓字。
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

  // 元件本體色：真實板子上 IC 是黑色環氧樹脂、連接器是黑膠或金屬、被動件是深色陶瓷。
  // 原本一整排藍灰色看起來像玩具，不像板子。
  const KIND_COLOR = { ic: 0x15171b, passive: 0x2a2d33, conn: 0x1f2228, mech: 0xb0b6bd };

  // 阻焊與絲印的顏色（EasyEDA 的預設綠板白字）
  const MASK_GREEN = '#0d7a3a', MASK_EDGE = 0x0d7a3a, SILK_WHITE = '#f2f5f7', PAD_GOLD = '#d8b45c';

  // footprint 相對點 → 絕對座標。公式必須跟 pcb.js compRel 一致，
  // 不一致的話 3D 的絲印會整片轉錯角度，而 2D 看起來卻是對的。
  function compRel(c, rx, ry) {
    const th = (c.rot || 0) * Math.PI / 180, cs = Math.cos(th), sn = Math.sin(th);
    return { x: c.x + rx * cs + ry * sn, y: c.y - rx * sn + ry * cs };
  }

  /**
   * 把散在三個地方的絲印（元件圖形、元件文字、板上獨立圖形）攤平成一張清單，
   * 座標一律絕對。純函式，node 測得到——3D 看起來對不對很難用眼睛驗，
   * 但「有幾個絲印項目、座標轉對了沒」算得出來。
   */
  function silkItems(state) {
    const out = [];
    for (const c of (state.components || [])) {
      const toAbs = (rx, ry) => compRel(c, rx, ry);
      for (const g of (c.silk || [])) out.push({ g: g, abs: toAbs, side: g.side || 'F', kind: g.kind });
      for (const t of (c.silkTexts || [])) {
        const a = compRel(c, t.x, t.y);
        out.push({ text: t.text, x: a.x, y: a.y, size: t.size || 1, side: t.side || 'F', kind: 'text' });
      }
    }
    for (const g of (state.silkGr || [])) out.push({ g: g, abs: (x, y) => ({ x: x, y: y }), side: g.side || 'F', kind: g.kind });
    return out;
  }

  /**
   * 板面貼圖：阻焊（綠）＋ pad 開窗（金）＋ 絲印（白）畫成一張圖，貼在板子表面。
   *
   * 為什麼用貼圖不用幾何：絲印是幾千條線與文字，做成 mesh 會爆 draw call；
   * 而且真實板子上這三樣本來就是「印在表面」，不是立體物。
   * 板框外一律留透明，非矩形板才不會有一圈綠色多出來。
   */
  function faceTexture(state, padAbs, side, box) {
    const mm = box.w, mmH = box.h;
    const ppm = Math.min(48, Math.max(10, 3200 / Math.max(mm, mmH)));  // 每 mm 幾個像素
    const cv = document.createElement('canvas');
    cv.width = Math.max(64, Math.round(mm * ppm));
    cv.height = Math.max(64, Math.round(mmH * ppm));
    const g = cv.getContext('2d');
    // 底面是從板子下方看，左右要鏡像，否則絲印是反的
    const X = x => (side === 'B' ? (box.x2 - x) : (x - box.x1)) * ppm;
    const Y = y => (y - box.y1) * ppm;

    g.clearRect(0, 0, cv.width, cv.height);
    g.fillStyle = MASK_GREEN;
    const out = box.outline;
    if (out && out.length > 2) {
      g.beginPath();
      out.forEach((p, i) => (i ? g.lineTo(X(p[0]), Y(p[1])) : g.moveTo(X(p[0]), Y(p[1]))));
      g.closePath(); g.fill();
    } else {
      g.fillRect(0, 0, cv.width, cv.height);
    }

    // pad 開窗：阻焊在 pad 上是挖空的，露出銅
    g.fillStyle = PAD_GOLD;
    for (const c of (state.components || [])) {
      for (const pd of (c.pads || [])) {
        if (pd.cu === false) continue;
        const onSide = pd.side === '*' || pd.side === side || (!pd.side && side === 'F');
        if (!onSide) continue;
        const a = padAbs(c, pd);
        const w = Math.max(0.1, pd.w || 0.5) * ppm, h = Math.max(0.1, pd.h || 0.5) * ppm;
        g.save();
        g.translate(X(a.x), Y(a.y));
        g.rotate(-(pd.rot || 0) * Math.PI / 180 * (side === 'B' ? -1 : 1));
        if (pd.shape === 'circle' || pd.shape === 'oval') {
          g.beginPath(); g.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2); g.fill();
        } else {
          g.fillRect(-w / 2, -h / 2, w, h);
        }
        if (pd.drill > 0) {
          g.beginPath(); g.arc(0, 0, Math.max(1, pd.drill / 2 * ppm), 0, Math.PI * 2);
          g.fillStyle = '#0b0d10'; g.fill(); g.fillStyle = PAD_GOLD;
        }
        g.restore();
      }
    }

    // 絲印
    g.strokeStyle = SILK_WHITE; g.fillStyle = SILK_WHITE; g.lineCap = 'round';
    for (const it of silkItems(state)) {
      if ((it.side || 'F') !== side) continue;
      if (it.kind === 'text') {
        g.save();
        g.font = Math.max(6, it.size * ppm) + 'px monospace';
        g.textAlign = 'center';
        g.fillText(it.text, X(it.x), Y(it.y) + it.size * ppm * 0.35);
        g.restore();
        continue;
      }
      const it_g = it.g, abs = it.abs;
      g.lineWidth = Math.max(1, (it_g.w || 0.12) * ppm);
      g.beginPath();
      if (it_g.kind === 'region' && it_g.pts) {
        it_g.pts.forEach((pt, i) => { const a = abs(pt[0], pt[1]); i ? g.lineTo(X(a.x), Y(a.y)) : g.moveTo(X(a.x), Y(a.y)); });
        g.closePath(); g.fill(); continue;
      }
      if (it_g.kind === 'line') {
        const a = abs(it_g.x1, it_g.y1), b = abs(it_g.x2, it_g.y2);
        g.moveTo(X(a.x), Y(a.y)); g.lineTo(X(b.x), Y(b.y));
      } else if (it_g.kind === 'circle') {
        const c = abs(it_g.cx, it_g.cy);
        g.arc(X(c.x), Y(c.y), Math.max(1, it_g.r * ppm), 0, Math.PI * 2);
      } else if (it_g.kind === 'arc') {
        const pts = (window.KicadIO && window.KicadIO._arcPoints)
          ? window.KicadIO._arcPoints(it_g.x1, it_g.y1, it_g.xm, it_g.ym, it_g.x2, it_g.y2, 12)
          : [[it_g.x1, it_g.y1], [it_g.x2, it_g.y2]];
        pts.forEach((pt, i) => { const a = abs(pt[0], pt[1]); i ? g.lineTo(X(a.x), Y(a.y)) : g.moveTo(X(a.x), Y(a.y)); });
      } else { continue; }
      g.stroke();
    }

    // refdes 當絲印：多數匯入來源沒有 silkTexts（實測 RP2040 公版是 0 筆），
    // 少了字，板面光禿禿，離真板子最遠的就是這一點。
    // 只在元件本體放得下時才畫：畫不下硬塞會壓到旁邊的元件，那是圖字重疊。
    g.fillStyle = SILK_WHITE;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    for (const c of (state.components || [])) {
      const cSide = (c.side || 'top') === 'bottom' ? 'B' : 'F';
      if (cSide !== side) continue;
      const ref = c.ref || c.label || '';
      if (!ref) continue;
      const bw = Math.max(0.5, c.w || 2), bh = Math.max(0.5, c.h || 2);
      const size = Math.max(0.5, Math.min(1.4, bh * 0.45));
      g.font = Math.max(5, size * ppm) + 'px monospace';
      if (g.measureText(ref).width > bw * ppm * 0.92) continue;   // 放不下就不畫
      g.fillText(ref, X(c.x), Y(c.y));
    }

    return cv;
  }

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
      '<button id="p3dMode" style="padding:6px 14px;cursor:pointer;margin-right:8px"></button>' +
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
    // 阻尼：放手後慢慢停，轉起來才像在轉一塊實體板子（loop 已每幀 ctrl.update()）
    ctrl.enableDamping = true;
    ctrl.dampingFactor = 0.08;

    scene.add(new THREE.AmbientLight(0xffffff, 0.46));
    // 半球光：上方偏白、下方偏暗藍。少了它，板子的暗面會死黑，看起來像剪紙
    scene.add(new THREE.HemisphereLight(0xdfe9ff, 0x0a1018, 0.55));
    const dl = new THREE.DirectionalLight(0xffffff, 0.55);
    dl.position.set(span * 0.6, span * 1.2, span * 0.8);
    scene.add(dl);
    const dl2 = new THREE.DirectionalLight(0xffffff, 0.25);
    dl2.position.set(-span * 0.7, span * 0.4, -span * 0.6);
    scene.add(dl2);

    // 阻焊是亮面的，全霧面材質看起來像塑膠板。Phong + specular 才有板子的反光。
    const mat = {
      board: new THREE.MeshPhongMaterial({ color: MASK_EDGE, shininess: 26, specular: 0x2e6b4a }),
      pad: new THREE.MeshPhongMaterial({ color: 0xd8b45c, shininess: 78, specular: 0x8a7a3a }),
      barrel: new THREE.MeshPhongMaterial({ color: 0xc9a227, shininess: 60, specular: 0x6b5f2a }),
      hole: new THREE.MeshBasicMaterial({ color: 0x05070c }),
      traceF: new THREE.MeshLambertMaterial({ color: 0xc0392b }),
      traceB: new THREE.MeshLambertMaterial({ color: 0x2980b9 }),
      pourF: new THREE.MeshLambertMaterial({ color: 0x8e44ad, transparent: true, opacity: 0.55 }),
      pourB: new THREE.MeshLambertMaterial({ color: 0x16a085, transparent: true, opacity: 0.55 }),
      comp: {}
    };
    for (const k of Object.keys(KIND_COLOR)) mat.comp[k] = new THREE.MeshPhongMaterial({ color: KIND_COLOR[k], shininess: 18, specular: 0x2b2f36 });
    mat.comp.other = new THREE.MeshPhongMaterial({ color: 0x23262b, shininess: 16, specular: 0x24272c });
    mat.compBottom = new THREE.MeshPhongMaterial({ color: 0x2c3138, shininess: 16, specular: 0x24272c });

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

    // ---- 阻焊 + 絲印貼圖（真實外觀）----
    // 板面的綠、pad 的金、絲印的白畫成一張貼圖鋪在板子表面。
    // 局部座標刻意用 (x, -y)／(x, y)：跟板子 mesh 同一套旋轉，
    // pad 與貼圖才會對齊；分開算兩套轉換一定會偏。
    const bounds = (() => {
      if (outline && outline.length > 2) {
        const xs = outline.map(q => q[0]), ys = outline.map(q => q[1]);
        const x1 = Math.min.apply(null, xs), x2 = Math.max.apply(null, xs);
        const y1 = Math.min.apply(null, ys), y2 = Math.max.apply(null, ys);
        return { x1: x1, x2: x2, y1: y1, y2: y2, w: Math.max(1, x2 - x1), h: Math.max(1, y2 - y1), outline: outline };
      }
      return { x1: -W / 2, x2: W / 2, y1: -H / 2, y2: H / 2, w: W, h: H, outline: null };
    })();

    const faceMeshes = [];
    ['F', 'B'].forEach(side => {
      let cv;
      try { cv = faceTexture(state, padAbs, side, bounds); } catch (e) { return; }
      const tex = new THREE.CanvasTexture(cv);
      tex.flipY = false;                       // uv v=0 對到 canvas 第 0 列
      tex.anisotropy = 4;
      const top = side === 'F';
      const corners = [[bounds.x1, bounds.y1], [bounds.x2, bounds.y1], [bounds.x2, bounds.y2], [bounds.x1, bounds.y2]];
      const order = [0, 1, 2, 0, 2, 3];
      const pos = [], uvs = [];
      order.forEach(i => {
        const bx = corners[i][0], by = corners[i][1];
        pos.push(bx, top ? -by : by, 0);
        uvs.push((bx - bounds.x1) / bounds.w, (by - bounds.y1) / bounds.h);
      });
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      geo.computeVertexNormals();
      const m = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
        map: tex, transparent: true, shininess: 30, specular: 0x2e6b4a, side: THREE.DoubleSide
      }));
      m.rotation.x = top ? -Math.PI / 2 : Math.PI / 2;
      m.position.y = top ? TH / 2 + 0.035 : -(TH / 2 + 0.035);
      scene.add(m);
      faceMeshes.push(m);
    });

    // ---- 同材質方塊合併成 InstancedMesh ----
    // 一顆 mesh 一個 draw call。舊版一個 pad 一顆 mesh，大板直接頓住。
    // 外型零件的材質快取：同色共用一份，InstancedMesh 才合併得起來（不然一顆腳一個 draw call）
    const SHINY = window.Pcb3DShapes
      ? [Pcb3DShapes.COLORS.metalCap, Pcb3DShapes.COLORS.lead, Pcb3DShapes.COLORS.pin, Pcb3DShapes.COLORS.alu]
      : [];
    const shapeMats = new Map();
    const shapeMat = color => {
      if (!shapeMats.has(color)) {
        const shiny = SHINY.indexOf(color) >= 0;
        shapeMats.set(color, new THREE.MeshPhongMaterial({
          color: color, shininess: shiny ? 46 : 18, specular: shiny ? 0x5c636c : 0x2b2f36
        }));
      }
      return shapeMats.get(color);
    };

    const boxes = new Map();   // material → [{x,y,z,w,h,d,rotY}]
    const pushBox = (m, b) => { if (!boxes.has(m)) boxes.set(m, []); boxes.get(m).push(b); };
    const cyls = new Map();    // material → [{x,y,z,r,h}]
    const pushCyl = (m, c) => { if (!cyls.has(m)) cyls.set(m, []); cyls.get(m).push(c); };

    // ---- 元件與 pad ----
    for (const c of (state.components || [])) {
      const bottom = (c.side || 'top') === 'bottom';
      // 元件外型：QFP 有四邊引腳、排針一根根、電解電容是圓柱（Pcb3DShapes 判斷）。
      // 模組沒載入才退回一塊方塊——那是舊行為，不是預期行為。
      const shp = window.Pcb3DShapes ? Pcb3DShapes.partsFor(c) : null;
      if (shp && shp.parts.length) {
        stats.comps++;
        const rot = (c.rot || 0) * Math.PI / 180;
        const cs = Math.cos(rot), sn = Math.sin(rot);
        for (const pt of shp.parts) {
          // 零件座標相對元件中心且未旋轉；這裡套用元件旋轉，公式跟 padAbs 同一套，
          // 不同套的話腳會轉到 pad 外面（2D 看起來卻正常）。
          const rx = c.x + pt.x * cs + pt.z * sn;
          const rz = c.y - pt.x * sn + pt.z * cs;
          const yy = bottom ? -(TH / 2 + pt.y) : (TH / 2 + pt.y);
          const m = shapeMat(pt.color);
          if (pt.shape === 'cyl') pushCyl(m, { x: rx, y: yy, z: rz, r: pt.r, h: pt.h });
          else pushBox(m, { x: rx, y: yy, z: rz, w: pt.w, h: pt.h, d: pt.d, rotY: rot });
        }
      } else {
        const hgt = heightOf(c);
        if (hgt > 0) {
          stats.comps++;
          pushBox(bottom ? mat.compBottom : (mat.comp[c.kind] || mat.comp.other), {
            x: c.x, y: bottom ? -(TH / 2 + hgt / 2) : TH / 2 + hgt / 2, z: c.y,
            w: Math.max(0.6, c.w || 3), h: hgt, d: Math.max(0.6, c.h || 2),
            rotY: (c.rot || 0) * Math.PI / 180
          });
        }
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

    // ---- 真實外觀 / 佈線檢視 ----
    // 真板子上走線被阻焊蓋著，看不到紅藍線；但要看佈線時又需要那個顏色。
    // 兩種都給，預設真實外觀（那才是使用者要的樣子）。
    const layoutOnly = [];
    scene.traverse(o => {
      if (o.material && (o.material === mat.traceF || o.material === mat.traceB ||
          o.material === mat.pourF || o.material === mat.pourB)) layoutOnly.push(o);
    });
    let realistic = true;
    const applyMode = () => {
      faceMeshes.forEach(m => { m.visible = realistic; });
      layoutOnly.forEach(m => { m.visible = !realistic; });
      const btn = modal.querySelector('#p3dMode');
      if (btn) btn.textContent = T(realistic ? 'p3d_mode_layout' : 'p3d_mode_real');
    };
    modal.querySelector('#p3dMode')?.addEventListener('click', () => { realistic = !realistic; applyMode(); });
    applyMode();

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

  return { open, close, _outlineFromSegs: outlineFromSegs, _heightOf: heightOf, _silkItems: silkItems, _compRel: compRel };
})();
