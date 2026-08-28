/**
 * pcb-step-model.js — 匯入自己的 STEP，綁到封裝上（window.StepModel）
 *
 * 目前 STEP 匯出的元件全是「封裝外框擠出高度」的方塊，只代表佔位空間。
 * 這支讓使用者拿原廠給的 STEP（或自己畫的）綁到某個封裝上，
 * 匯出時就放真的模型，機構端的干涉檢查才有意義。
 *
 * **不做內建模型庫**：那是別人的商業資料，跟明確不做的 LCSC 生態同一條線。
 * 這裡做的是「匯入你自己有的那一份」。
 *
 * ── 怎麼合併（重要的取捨）──
 * 外來檔的實體編號從 #1 開始，跟我們的一定會撞。兩條路：
 *   (a) 保留外來檔的裝配結構（MAPPED_ITEM + 變換矩陣）
 *   (b) 把外來實體整段搬進來、編號平移，並**把座標直接算好**
 * 這裡走 (b)。理由：(a) 的裝配語意在不同 CAD 之間解讀不一致，寫錯了是
 * 「打得開但位置不對」——比打不開難發現得多。(b) 出來的檔跟我們自己產的
 * 完全同一種形狀，既有的參照完整性檢查照樣驗得到。
 * 代價：同一顆料放十次就有十份幾何，檔案變大。誠實寫在這裡。
 *
 * ── 只搬座標，不搬方向以外的東西 ──
 * CARTESIAN_POINT 要旋轉＋平移；DIRECTION / VECTOR 只能旋轉**不能平移**
 * （它們是方向不是位置）。搞混的話模型會歪掉，而且外觀上像是「模型畫錯了」。
 *
 * 純函式（不碰 DOM），node 測得到（pcb-step-model.test.js）。
 */
window.StepModel = (function () {
  'use strict';

  const MAX_BYTES = 8 * 1024 * 1024;     // 單一模型上限；再大瀏覽器記憶體會很難看
  const LS_KEY = 'vs-step-models-v1';

  /**
   * 解析 STEP 的 DATA 段。只做我們需要的事：切出一條條 `#N = BODY;`。
   * 不做語意分析——那是 CAD 的工作，這裡只搬運。
   * 回 { ok, entities:[{id, body}], maxId, header } 或 { ok:false, reason }
   */
  function parse(text) {
    const s = String(text || '');
    if (!s) return { ok: false, reason: 'empty' };
    if (s.length > MAX_BYTES) return { ok: false, reason: 'tooLarge' };
    if (!/ISO-10303-21/i.test(s)) return { ok: false, reason: 'notStep' };
    const dm = /\bDATA\s*;/i.exec(s);
    if (!dm) return { ok: false, reason: 'noData' };
    const from = dm.index + dm[0].length;
    // ENDSEC 要找 **DATA 之後那一個**。直接對整份 search 會抓到 HEADER 的那個
    // （它在 DATA 前面），切出來的範圍是空的——症狀是「完全合法的檔說沒有實體」。
    const em = /\bENDSEC\s*;/i.exec(s.slice(from));
    const body = s.slice(from, em ? from + em.index : s.length);

    const entities = [];
    let maxId = 0;
    // `#12 = TYPE(...);`。字串裡可能有分號與括號，所以要逐字掃而不是 split(';')。
    const re = /#(\d+)\s*=\s*/g;
    let m;
    while ((m = re.exec(body))) {
      const id = parseInt(m[1], 10);
      const start = m.index + m[0].length;
      let i = start, depth = 0, inStr = false;
      for (; i < body.length; i++) {
        const ch = body[i];
        if (inStr) { if (ch === "'") { if (body[i + 1] === "'") i++; else inStr = false; } continue; }
        if (ch === "'") { inStr = true; continue; }
        if (ch === '(') depth++;
        else if (ch === ')') depth--;
        else if (ch === ';' && depth === 0) break;
      }
      if (i >= body.length) return { ok: false, reason: 'unterminated' };
      entities.push({ id, body: body.slice(start, i).trim() });
      if (id > maxId) maxId = id;
      re.lastIndex = i;
    }
    if (!entities.length) return { ok: false, reason: 'noEntities' };
    return { ok: true, entities, maxId, header: s.slice(0, dm.index) };
  }

  /** 這份模型裡有哪些實體（回 body 開頭的型別名，統計用） */
  function typesOf(entities) {
    const out = {};
    for (const e of (entities || [])) {
      const m = /^\(?\s*([A-Za-z_][A-Za-z0-9_]*)/.exec(e.body || '');
      const t = m ? m[1].toUpperCase() : '?';
      out[t] = (out[t] || 0) + 1;
    }
    return out;
  }

  /** 頂層實體：我們要掛進自己 shape representation 的那些 */
  function solidsOf(entities) {
    return (entities || [])
      .filter(e => /^\s*(MANIFOLD_SOLID_BREP|BREP_WITH_VOIDS|SHELL_BASED_SURFACE_MODEL)\s*\(/i.test(e.body))
      .map(e => e.id);
  }

  const F = v => {
    if (!isFinite(v)) return '0.';
    const s = (Math.round(v * 1e6) / 1e6).toString();
    return /[.eE]/.test(s) ? s : s + '.';
  };

  /**
   * 把一組實體搬過來：編號 +offset、座標套上變換。
   *
   * xf: { x, y, z, rot（度，繞 Z）, mirror（底面：Z 翻面）, scale }
   *
   * **CARTESIAN_POINT 旋轉＋平移；DIRECTION／VECTOR 只旋轉**。
   * 把 DIRECTION 也平移的話，法向量會被加上一個偏移量，
   * 模型看起來會歪掉或整個翻過去——而且是「打得開但不對」那種錯。
   */
  function transplant(entities, offset, xf) {
    xf = Object.assign({ x: 0, y: 0, z: 0, rot: 0, mirror: false, scale: 1 }, xf || {});
    const th = (xf.rot || 0) * Math.PI / 180;
    const cs = Math.cos(th), sn = Math.sin(th);
    const k = xf.scale > 0 ? xf.scale : 1;
    const mz = xf.mirror ? -1 : 1;

    const rotOnly = (x, y, z) => [ (x * cs - y * sn) * k, (x * sn + y * cs) * k, z * k * mz ];
    const place = (x, y, z) => {
      const [rx, ry, rz] = rotOnly(x, y, z);
      return [rx + xf.x, ry + xf.y, rz + xf.z];
    };

    const out = [];
    for (const e of (entities || [])) {
      // 參照編號整批平移
      let body = e.body.replace(/#(\d+)/g, (_, n) => '#' + (parseInt(n, 10) + offset));
      const head = /^\s*([A-Za-z_][A-Za-z0-9_]*)/.exec(body);
      const type = head ? head[1].toUpperCase() : '';
      if (type === 'CARTESIAN_POINT' || type === 'DIRECTION' || type === 'VECTOR') {
        body = body.replace(/\(\s*(-?[\d.eE+-]+)\s*,\s*(-?[\d.eE+-]+)\s*,\s*(-?[\d.eE+-]+)\s*\)/,
          (whole, a, b, c) => {
            const x = parseFloat(a), y = parseFloat(b), z = parseFloat(c);
            if (!isFinite(x) || !isFinite(y) || !isFinite(z)) return whole;
            // DIRECTION 是單位向量，縮放會讓它不再是單位向量 → 只旋轉不縮放不平移
            const v = (type === 'CARTESIAN_POINT')
              ? place(x, y, z)
              : [x * cs - y * sn, x * sn + y * cs, z * mz];
            return '(' + F(v[0]) + ',' + F(v[1]) + ',' + F(v[2]) + ')';
          });
      }
      out.push({ id: e.id + offset, body });
    }
    return out;
  }

  /** 參照完整性：搬完之後不可以有指向不存在的實體 */
  function danglingRefs(entities) {
    const have = new Set((entities || []).map(e => e.id));
    const bad = [];
    for (const e of (entities || [])) {
      const re = /#(\d+)/g; let m;
      while ((m = re.exec(e.body))) {
        const n = parseInt(m[1], 10);
        if (!have.has(n)) bad.push({ from: e.id, to: n });
      }
    }
    return bad;
  }

  // ---------------- 綁定的存放 ----------------
  // key ＝ FpInst 的 refKey（封裝的身分），所以同一顆封裝在哪塊板上都認得。
  // 存 localStorage：模型是使用者自己的檔案，不上傳雲端（也沒必要）。
  const store = {
    all() {
      try { return JSON.parse((typeof localStorage !== 'undefined' && localStorage.getItem(LS_KEY)) || '{}') || {}; }
      catch (e) { return {}; }
    },
    get(key) { return this.all()[key] || null; },
    set(key, rec) {
      if (!key || !rec) return false;
      const m = this.all();
      m[key] = rec;
      try { localStorage.setItem(LS_KEY, JSON.stringify(m)); return true; }
      catch (e) { return false; }          // 配額滿了就回 false，讓 UI 講出來
    },
    remove(key) {
      const m = this.all();
      if (!(key in m)) return false;
      delete m[key];
      try { localStorage.setItem(LS_KEY, JSON.stringify(m)); return true; } catch (e) { return false; }
    },
    keys() { return Object.keys(this.all()); }
  };

  /** 元件 → 綁定的 key。沒有 FpInst（或沒蓋章）就沒有身分，回空字串。 */
  function keyOf(comp) {
    const FI = (typeof window !== 'undefined') && window.FpInst;
    if (!FI || !comp) return '';
    const ref = FI.refOf(comp);
    return ref ? FI.refKey(ref) : '';
  }

  return { MAX_BYTES, LS_KEY, parse, typesOf, solidsOf, transplant, danglingRefs, store, keyOf, _F: F };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = window.StepModel;
