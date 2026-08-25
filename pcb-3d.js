// 簡易 3D 板面檢視（教學級）：板=矩形板厚 1.6mm、元件=方塊、pad=薄片、走線=細條、via=圓柱
// Three.js 按需從 CDN 懶載入（開啟 3D 時才抓，不影響頁面初載）。
// 誠實界定：非精確 3D 模型（無元件外形庫、鋪銅不顯示、板框以外接矩形近似）。
window.Pcb3D = (() => {
  // 硬規矩 6：畫面上的字一律四語。I18N 沒載入就退回 key。
  const T = (k, v) => (window.I18N ? window.I18N.t(k, v) : k);
  let loaded = null;
  // Three.js 一律從 vendor/ 自行代管載入，不走 CDN。
  // 原本這裡抓 cdn.jsdelivr.net：本機 dev server 不套 _headers 所以看起來正常，
  // 上線 CSP 是 `script-src 'self' https://static.cloudflareinsights.com`，一定被擋，
  // 使用者只會看到「3D 檢視按了沒反應」。（2026-08-25 發現；csp-hash.js 已加守門）
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

  let modal = null, renderer = null, animId = 0;

  function close() {
    if (animId) cancelAnimationFrame(animId);
    animId = 0;
    if (renderer) { renderer.dispose(); renderer = null; }
    if (modal) { modal.remove(); modal = null; }
    document.removeEventListener('keydown', escClose);
  }
  function escClose(e) { if (e.key === 'Escape') close(); }

  async function open(state, padAbs) {
    try { await loadThree(); } catch (err) { alert(err.message); return; }
    close();
    const W = state.boardWidth || 100, H = state.boardHeight || 80, TH = 1.6;
    modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(10,12,20,.92);z-index:9999;display:flex;flex-direction:column';
    modal.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 16px;color:#ecf0f1;font-size:14px">' +
      '<span>' + T('p3d_hint') + '</span>' +
      '<button id="p3dClose" style="padding:6px 14px;cursor:pointer">' + T('p3d_close') + '</button></div>' +
      '<div id="p3dHost" style="flex:1"></div>';
    document.body.appendChild(modal);
    modal.querySelector('#p3dClose').addEventListener('click', close);
    document.addEventListener('keydown', escClose);

    const host = modal.querySelector('#p3dHost');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x10131c);
    const cam = new THREE.PerspectiveCamera(50, host.clientWidth / host.clientHeight, 0.1, 2000);
    cam.position.set(0, Math.max(W, H) * 0.9, Math.max(W, H) * 0.75);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(host.clientWidth, host.clientHeight);
    host.appendChild(renderer.domElement);
    const ctrl = new THREE.OrbitControls(cam, renderer.domElement);
    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const dl = new THREE.DirectionalLight(0xffffff, 0.6);
    dl.position.set(60, 120, 80);
    scene.add(dl);

    const mat = {
      board: new THREE.MeshLambertMaterial({ color: 0x1b5e20 }),
      comp: new THREE.MeshLambertMaterial({ color: 0x37474f }),
      compB: new THREE.MeshLambertMaterial({ color: 0x546e7a }),
      pad: new THREE.MeshBasicMaterial({ color: 0xd4af37 }),
      traceF: new THREE.MeshBasicMaterial({ color: 0xc0392b }),
      traceB: new THREE.MeshBasicMaterial({ color: 0x2980b9 }),
      via: new THREE.MeshBasicMaterial({ color: 0xb8c2cc })
    };
    // 板（外接矩形近似）
    scene.add(new THREE.Mesh(new THREE.BoxGeometry(W, TH, H), mat.board));
    // 元件
    for (const c of (state.components || [])) {
      const bw = Math.max(0.8, c.w || 3), bh = Math.max(0.8, c.h || 2);
      const hgt = Math.min(4, Math.max(1, Math.min(bw, bh) * 0.45));
      const bottom = (c.side || 'top') === 'bottom';
      const m = new THREE.Mesh(new THREE.BoxGeometry(bw, hgt, bh), bottom ? mat.compB : mat.comp);
      m.position.set(c.x, bottom ? -(TH / 2 + hgt / 2) : TH / 2 + hgt / 2, c.y);
      m.rotation.y = (c.rot || 0) * Math.PI / 180;
      scene.add(m);
      // pad 薄片
      for (const p of (c.pads || [])) {
        if (p.cu === false) continue;
        const a = padAbs(c, p);
        const onBottom = p.side === 'B' || (p.side === '*' && bottom);
        const py = p.side === '*' ? 0 : (onBottom ? -(TH / 2 + 0.03) : TH / 2 + 0.03);
        const pm = new THREE.Mesh(new THREE.BoxGeometry(Math.max(0.2, p.w || 0.5), p.side === '*' ? TH + 0.1 : 0.06, Math.max(0.2, p.h || 0.5)), mat.pad);
        pm.position.set(a.x, py, a.y);
        pm.rotation.y = (p.rot || 0) * Math.PI / 180;
        scene.add(pm);
      }
    }
    // 走線（上限 3000 段防卡）
    let n = 0;
    for (const t of (state.traces || [])) {
      if (++n > 3000) break;
      const L = Math.hypot(t.x2 - t.x1, t.y2 - t.y1);
      if (L < 1e-6) continue;
      const bottom = (t.layer || 'F.Cu') === 'B.Cu';
      if (!bottom && (t.layer || 'F.Cu') !== 'F.Cu') continue; // 內層不畫
      const g = new THREE.BoxGeometry(L, 0.05, Math.max(0.1, t.width || 0.3));
      const m = new THREE.Mesh(g, bottom ? mat.traceB : mat.traceF);
      m.position.set((t.x1 + t.x2) / 2, bottom ? -(TH / 2 + 0.05) : TH / 2 + 0.05, (t.y1 + t.y2) / 2);
      m.rotation.y = -Math.atan2(t.y2 - t.y1, t.x2 - t.x1);
      scene.add(m);
    }
    // via
    for (const v of (state.vias || [])) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry((v.od || 0.6) / 2, (v.od || 0.6) / 2, TH + 0.15, 12), mat.via);
      m.position.set(v.x, 0, v.y);
      scene.add(m);
    }
    const onResize = () => {
      if (!renderer) return;
      cam.aspect = host.clientWidth / host.clientHeight;
      cam.updateProjectionMatrix();
      renderer.setSize(host.clientWidth, host.clientHeight);
    };
    window.addEventListener('resize', onResize);
    (function loop() {
      if (!renderer) { window.removeEventListener('resize', onResize); return; }
      ctrl.update();
      renderer.render(scene, cam);
      animId = requestAnimationFrame(loop);
    })();
  }

  return { open, close };
})();
