/**
 * pcb-mesh.js — 3D 顯示用的網格模型匯入（VRML .wrl / Wavefront .obj）
 *
 * 為什麼不是 STEP：STEP 是 B-rep（NURBS 曲面 + 拓樸），要畫出來得先鑲嵌成三角形，
 * 那需要一顆 CAD kernel（OpenCascade 之類，WASM 好幾 MB）。這個站的規矩是外部資源
 * 一律自行代管，為了 3D 好看塞進去一顆幾 MB 的 kernel 不划算。
 * 所以：**STEP 繼續只走匯出**（pcb-step-model.js 把真模型併進匯出檔），
 * **畫面上顯示走已經鑲嵌好的格式**——KiCad 每顆封裝都附 .wrl，OBJ 也隨處都是。
 *
 * 兩個會咬人的地方，下面都守著：
 *   - **KiCad 的 .wrl 單位不是 mm**：1 單位 = 2.54mm（0.1 inch）。照 mm 讀進來，
 *     模型會小成 1/2.54，看起來「像是模型畫錯了」。預設帶這個換算，可覆寫。
 *   - **VRML 的 coordIndex 用 -1 分隔多邊形**，而且多邊形不一定是三角形。
 *     不做扇形三角化就會少畫一半的面，模型看起來破破爛爛。
 *
 * 純函式、不碰 DOM、不碰 Three.js：回 { positions, indices, color, bbox, tris }，
 * 呼叫端自己餵給 BufferGeometry。所以 node 測得到「面數對不對、單位換算對不對」。
 */
'use strict';
(function (root) {
  const Mesh = {};

  Mesh.KICAD_WRL_SCALE = 2.54;    // KiCad .wrl 的 1 單位 = 2.54mm

  const num = v => { const n = parseFloat(v); return isFinite(n) ? n : null; };

  /** 把 [a,b,c,d] 這種多邊形拆成三角形扇。VRML 的面不保證是三角形。 */
  function fan(idx, out) {
    for (let i = 1; i + 1 < idx.length; i++) out.push(idx[0], idx[i], idx[i + 1]);
  }

  function bboxOf(pos) {
    if (!pos.length) return null;
    const b = { minx: Infinity, miny: Infinity, minz: Infinity, maxx: -Infinity, maxy: -Infinity, maxz: -Infinity };
    for (let i = 0; i < pos.length; i += 3) {
      b.minx = Math.min(b.minx, pos[i]); b.maxx = Math.max(b.maxx, pos[i]);
      b.miny = Math.min(b.miny, pos[i + 1]); b.maxy = Math.max(b.maxy, pos[i + 1]);
      b.minz = Math.min(b.minz, pos[i + 2]); b.maxz = Math.max(b.maxz, pos[i + 2]);
    }
    return b;
  }

  /** VRML 2.0：抓每個 IndexedFaceSet 的 point[] 與 coordIndex[]，順便抓 diffuseColor。 */
  Mesh.parseWrl = function (text, opt) {
    const src = String(text || '');
    if (!/IndexedFaceSet/.test(src)) throw new Error('mesh_err_nofaces');
    const scale = (opt && opt.scale != null) ? opt.scale : Mesh.KICAD_WRL_SCALE;
    const positions = [], indices = [];
    let color = null;

    const colM = /diffuseColor\s+([0-9.eE+-]+)\s+([0-9.eE+-]+)\s+([0-9.eE+-]+)/.exec(src);
    if (colM) color = [num(colM[1]) || 0, num(colM[2]) || 0, num(colM[3]) || 0];

    // 一個檔可能有很多 Shape。每一段的索引是各自從 0 起算，合併時要平移。
    const re = /point\s*\[([\s\S]*?)\]([\s\S]*?)coordIndex\s*\[([\s\S]*?)\]/g;
    let m, found = 0;
    while ((m = re.exec(src))) {
      found++;
      const base = positions.length / 3;
      const pts = m[1].split(/[\s,]+/).map(num).filter(v => v !== null);
      if (pts.length % 3 !== 0) throw new Error('mesh_err_points');
      for (let i = 0; i < pts.length; i++) positions.push(pts[i] * scale);
      const raw = m[3].split(/[\s,]+/).map(num).filter(v => v !== null);
      let poly = [];
      for (const v of raw) {
        if (v < 0) { if (poly.length >= 3) fan(poly.map(k => k + base), indices); poly = []; }
        else poly.push(v);
      }
      if (poly.length >= 3) fan(poly.map(k => k + base), indices);   // 有些檔最後一面沒有 -1
    }
    if (!found) throw new Error('mesh_err_nofaces');
    if (!indices.length) throw new Error('mesh_err_empty');
    return { positions: positions, indices: indices, color: color, bbox: bboxOf(positions), tris: indices.length / 3 };
  };

  /** Wavefront OBJ：v / f。f 支援 v、v/vt、v//vn 三種寫法與負索引。 */
  Mesh.parseObj = function (text, opt) {
    const scale = (opt && opt.scale != null) ? opt.scale : 1;   // OBJ 慣例就是 mm 或公制，不硬套 2.54
    const positions = [], indices = [];
    const lines = String(text || '').split(/\r?\n/);
    let sawV = false;
    for (const line of lines) {
      const t = line.trim();
      if (!t || t[0] === '#') continue;
      const parts = t.split(/\s+/);
      if (parts[0] === 'v') {
        const x = num(parts[1]), y = num(parts[2]), z = num(parts[3]);
        if (x === null || y === null || z === null) throw new Error('mesh_err_points');
        positions.push(x * scale, y * scale, z * scale);
        sawV = true;
      } else if (parts[0] === 'f') {
        const idx = [];
        for (let i = 1; i < parts.length; i++) {
          const first = parts[i].split('/')[0];
          let v = parseInt(first, 10);
          if (!isFinite(v)) continue;
          // OBJ 索引從 1 起算；負數是「從尾巴數回來」
          v = v < 0 ? (positions.length / 3) + v : v - 1;
          idx.push(v);
        }
        if (idx.length >= 3) fan(idx, indices);
      }
    }
    if (!sawV) throw new Error('mesh_err_nofaces');
    if (!indices.length) throw new Error('mesh_err_empty');
    // 索引超出頂點數＝檔案壞了。放著不管會在 GPU 端當掉，訊息比這裡難懂一百倍。
    const n = positions.length / 3;
    for (const i of indices) if (i < 0 || i >= n) throw new Error('mesh_err_index');
    return { positions: positions, indices: indices, color: null, bbox: bboxOf(positions), tris: indices.length / 3 };
  };

  /** 依副檔名分派。認不得的副檔名要明講，不要當成 OBJ 硬讀。 */
  Mesh.parse = function (text, fileName, opt) {
    const ext = String(fileName || '').toLowerCase().split('.').pop();
    if (ext === 'wrl' || ext === 'vrml') return Mesh.parseWrl(text, opt);
    if (ext === 'obj') return Mesh.parseObj(text, opt);
    if (ext === 'step' || ext === 'stp') throw new Error('mesh_err_step');
    throw new Error('mesh_err_ext:' + ext);
  };

  /**
   * 把模型擺到封裝上要用的變換：置中 + 貼板面。
   * 回 { scale, offset:[x,y,z] }，呼叫端套上去即可。
   *
   * fit=true 時依封裝外框等比縮放。原廠模型的單位常常是錯的（尤其是網路上抓的），
   * 縮放到跟封裝差不多大，比忠實呈現一個 100 倍大的模型有用。
   */
  Mesh.placement = function (mesh, comp, opt) {
    const o = opt || {};
    const b = mesh && mesh.bbox;
    if (!b) return { scale: 1, offset: [0, 0, 0] };
    const mw = b.maxx - b.minx, md = b.maxy - b.miny, mh = b.maxz - b.minz;
    let scale = 1;
    if (o.fit && comp && comp.w > 0 && comp.h > 0 && mw > 0 && md > 0) {
      scale = Math.min(comp.w / mw, comp.h / md);
    }
    return {
      scale: scale,
      // XY 置中、Z 底部貼板面（模型原點在哪都不能假設）
      offset: [-(b.minx + b.maxx) / 2 * scale, -(b.miny + b.maxy) / 2 * scale, -b.minz * scale],
      size: { w: mw * scale, d: md * scale, h: mh * scale }
    };
  };

  // ---- 儲存 ----
  // 鍵沿用 StepModel.keyOf（FpInst 的封裝身分）：綁一次 0603，板上所有 0603 都吃得到，
  // 換一片板也還在。兩邊用同一把鑰匙，使用者才不會「匯出有模型、畫面沒有」。
  Mesh.LS_KEY = 'vs-mesh-models-v1';
  // localStorage 是整個網域共用的（跟 STEP 模型、設計檔搶額度），所以單檔要壓。
  // 座標砍到 0.001mm：3D 顯示看不出差別，字串長度掉一半以上。
  Mesh.MAX_BYTES = 1200 * 1024;

  Mesh.compact = function (mesh, name, opt) {
    const r3 = v => Math.round(v * 1000) / 1000;
    return {
      name: name || '',
      positions: (mesh.positions || []).map(r3),
      indices: mesh.indices || [],
      color: mesh.color || null,
      bbox: mesh.bbox || null,
      tris: mesh.tris || 0,
      fit: !!(opt && opt.fit)
    };
  };

  Mesh.meshStore = {
    all() {
      try { return JSON.parse((typeof localStorage !== 'undefined' && localStorage.getItem(Mesh.LS_KEY)) || '{}') || {}; }
      catch (e) { return {}; }
    },
    get(key) { return key ? (this.all()[key] || null) : null; },
    // 回 {ok:false, why} 而不是安靜失敗：額度滿了要講出來，
    // 不然使用者以為綁好了、開 3D 卻還是方塊。
    set(key, rec) {
      if (!key || !rec) return { ok: false, why: 'mesh_err_nokey' };
      const json = JSON.stringify(rec);
      if (json.length > Mesh.MAX_BYTES) return { ok: false, why: 'mesh_err_toobig' };
      const m = this.all();
      m[key] = rec;
      try { localStorage.setItem(Mesh.LS_KEY, JSON.stringify(m)); return { ok: true }; }
      catch (e) { return { ok: false, why: 'mesh_err_quota' }; }
    },
    remove(key) {
      const m = this.all();
      if (!(key in m)) return false;
      delete m[key];
      try { localStorage.setItem(Mesh.LS_KEY, JSON.stringify(m)); return true; } catch (e) { return false; }
    },
    keys() { return Object.keys(this.all()); }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = Mesh;
  root.PcbMesh = Mesh;
})(typeof window !== 'undefined' ? window : globalThis);
