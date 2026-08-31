/**
 * pcb-3d-shapes.js — 依封裝推元件外型（純函式、不碰 Three.js、不碰 DOM）
 *
 * 為什麼需要這個：3D 檢視把每顆元件畫成一塊方塊。遠看還行，一放大就露餡——
 * QFP 沒有四邊的引腳、排針沒有一根根的針、電解電容不是圓柱、金屬殼不是黑的。
 * 使用者拿 EasyEDA 的 3D 來比，差最多的就是這件事。
 *
 * 為什麼不解析 STEP：STEP 是 B-rep 實體模型，瀏覽器端解析＋鑲嵌是另一個量級的工程，
 * 而且多數元件根本沒有模型檔。這裡走的是「用 pad 佈局反推封裝長相」——
 * pad 在四邊就是 QFP、兩排帶孔且間距 2.54 就是排針、兩顆大 pad 又圓又對稱就是電解電容。
 * 猜不出來就回方塊，並在型別上標明是 fallback，不假裝知道。
 *
 * 這裡只回「形狀規格」（幾個盒子、幾根柱子、各自多大），不建立任何 mesh，
 * 所以 node 測得到：分類對不對、引腳有沒有長在 pad 上、高度合不合理，全部算得出來。
 */
'use strict';
(function (root) {
  const S = {};

  // 真實材質色：黑色環氧樹脂、深色陶瓷、鍍錫金屬殼、金腳
  S.COLORS = {
    epoxy: 0x15171b,     // IC 本體
    ceramic: 0x2a2d33,   // 被動件本體
    metalCap: 0x99a1ab,  // 金屬殼（晶振、USB、遮蔽罩）：鍍鎳鋼色。太白會像保麗龍
    plastic: 0x1f2228,   // 連接器塑膠
    lead: 0xaeb5bd,      // 引腳（鍍錫）
    pin: 0xd8b45c,       // 排針（鍍金）
    alu: 0x8e959e,       // 電解電容鋁殼
    led: 0xd8dee6
  };

  const num = v => (typeof v === 'number' && isFinite(v)) ? v : 0;
  const str = v => String(v == null ? '' : v);

  /** pad 相對元件中心的分邊統計。旋轉不影響：pad 座標本來就是相對元件的。 */
  S.padSides = function (comp) {
    const pads = (comp && comp.pads) || [];
    const out = { left: 0, right: 0, top: 0, bottom: 0, total: pads.length, drilled: 0 };
    if (!pads.length) return out;
    const w = Math.max(0.1, num(comp.w) || 2), h = Math.max(0.1, num(comp.h) || 2);
    for (const p of pads) {
      if (num(p.drill) > 0) out.drilled++;
      const x = num(p.x), y = num(p.y);
      // 靠哪一邊：比較 x/y 相對半寬半高的比例，才不會被長方形封裝誤導
      if (Math.abs(x) / w > Math.abs(y) / h) { if (x < 0) out.left++; else out.right++; }
      else { if (y < 0) out.top++; else out.bottom++; }
    }
    return out;
  };

  /** 最小 pad 間距（同一排的節距）。排針判斷要用，量不到回 0。 */
  S.pitch = function (comp) {
    const pads = (comp && comp.pads) || [];
    if (pads.length < 2) return 0;
    let best = Infinity;
    for (let i = 0; i < pads.length; i++) {
      for (let j = i + 1; j < pads.length; j++) {
        const d = Math.hypot(num(pads[i].x) - num(pads[j].x), num(pads[i].y) - num(pads[j].y));
        if (d > 0.05 && d < best) best = d;
      }
    }
    return best === Infinity ? 0 : best;
  };

  /**
   * 分類。回 { type, guessed } —— guessed=true 表示「看不出來，用方塊頂著」，
   * 呼叫端要知道這是猜的，不是判斷出來的。
   */
  S.classify = function (comp) {
    const c = comp || {};
    const ref = str(c.ref).toUpperCase(), part = str(c.part).toUpperCase();
    const sides = S.padSides(c);
    const w = Math.max(0.1, num(c.w) || 2), h = Math.max(0.1, num(c.h) || 2);
    const small = Math.min(w, h), big = Math.max(w, h);

    if (c.kind === 'mech' || (!sides.total && !num(c.w))) return { type: 'none', guessed: false };

    // 金屬殼類：晶振、USB、遮蔽罩。這些在真板子上是亮面金屬，畫成黑方塊最不像
    if (/^Y|^X\d/.test(ref) || /MHZ|XTAL|CRYSTAL|OSC/.test(part)) return { type: 'can', guessed: false };
    if (/USB|RJ45|HDMI|SHIELD|SHELL/.test(part)) return { type: 'shell', guessed: false };

    // 排針／排母：有孔、腳多、節距 2.0–2.6mm
    const pitch = S.pitch(c);
    if (sides.drilled >= 4 && pitch >= 1.9 && pitch <= 2.7) return { type: 'header', guessed: false, pitch: pitch };

    // 電解電容：兩腳、外形接近正方、又不小（陶瓷 0402 不會有這尺寸）
    if (sides.total === 2 && small >= 2.5 && big / small <= 1.35 && /^C/.test(ref)) {
      return { type: 'electrolytic', guessed: false };
    }

    // 晶片電阻電容：兩顆 pad 在左右（或上下）兩端
    if (sides.total === 2 && big <= 7) return { type: 'chip', guessed: false };

    // 四邊有腳＝QFP；兩排＝SOIC/DIP
    const withPads = sides.left + sides.right + sides.top + sides.bottom;
    if (withPads >= 8) {
      const fourSided = sides.left > 0 && sides.right > 0 && sides.top > 0 && sides.bottom > 0;
      if (fourSided) return { type: 'qfp', guessed: false };
      return { type: 'soic', guessed: false };
    }

    if (c.kind === 'conn') return { type: 'shell', guessed: false };
    if (c.kind === 'ic') return { type: 'soic', guessed: true };
    return { type: 'box', guessed: true };
  };

  /** 本體高度（mm）。跟 pcb-3d.js 原本的 heightOf 一致的量級，但依型別細分。 */
  S.bodyHeight = function (comp, type) {
    const w = Math.max(0.6, num(comp.w) || 2), h = Math.max(0.6, num(comp.h) || 2);
    const small = Math.min(w, h), big = Math.max(w, h);
    switch (type) {
      case 'none': return 0;
      case 'chip': return Math.min(0.85, Math.max(0.3, small * 0.35));
      case 'electrolytic': return Math.min(12, Math.max(3, small * 1.15));
      case 'can': return Math.min(4, Math.max(1.2, small * 0.55));
      case 'header': return 2.5;
      case 'shell': return Math.min(11, Math.max(3, small * 0.9));
      case 'qfp': return big > 12 ? 1.55 : Math.min(1.4, Math.max(0.85, small * 0.13));
      case 'soic': return Math.min(1.7, Math.max(1.05, small * 0.18));
      default: return Math.min(3, Math.max(0.8, small * 0.45));
    }
  };

  /**
   * 完整外型：回一組零件（相對元件中心的座標，未旋轉；旋轉由呼叫端統一套用）。
   * 每個零件 { shape:'box'|'cyl', color, x, y(高度中心), z, w, h, d, r }
   * y 一律是「離板面多高」，呼叫端再加板厚與正反面。
   */
  S.partsFor = function (comp) {
    const c = comp || {};
    const cls = S.classify(c);
    const type = cls.type;
    if (type === 'none') return { type: type, guessed: cls.guessed, parts: [] };

    const w = Math.max(0.6, num(c.w) || 2), h = Math.max(0.6, num(c.h) || 2);
    const H = S.bodyHeight(c, type);
    const parts = [];
    const C = S.COLORS;
    const box = (color, x, y, z, bw, bh, bd) => parts.push({ shape: 'box', color: color, x: x, y: y, z: z, w: bw, h: bh, d: bd });
    const cyl = (color, x, y, z, r, ch) => parts.push({ shape: 'cyl', color: color, x: x, y: y, z: z, r: r, h: ch });

    if (type === 'chip') {
      // 陶瓷本體 + 兩端的金屬電極（真實的 0603 就是這個樣子）
      const capW = Math.max(0.15, w * 0.22);
      box(C.ceramic, 0, H / 2, 0, w - capW * 2, H, h);
      box(C.lead, -(w - capW) / 2, H / 2, 0, capW, H * 0.92, h * 0.96);
      box(C.lead, (w - capW) / 2, H / 2, 0, capW, H * 0.92, h * 0.96);
      return { type: type, guessed: cls.guessed, parts: parts };
    }

    if (type === 'electrolytic') {
      const r = Math.min(w, h) / 2;
      cyl(C.alu, 0, H / 2, 0, r, H);
      cyl(0x2b3138, 0, H + 0.01, 0, r * 0.96, 0.02);   // 頂面的十字防爆刻痕用深色圓片代表
      return { type: type, guessed: cls.guessed, parts: parts };
    }

    if (type === 'can') {
      cyl(C.metalCap, 0, H / 2, 0, Math.min(w, h) / 2, H);
      return { type: type, guessed: cls.guessed, parts: parts };
    }

    if (type === 'header') {
      box(C.plastic, 0, H * 0.35 / 2, 0, w, H * 0.35, h);        // 黑色塑膠座
      for (const p of (c.pads || [])) {
        // 針從塑膠座往上長。方針 0.64mm 見方是 2.54 排針的實際尺寸
        box(C.pin, num(p.x), H / 2, num(p.y), 0.64, H, 0.64);
      }
      return { type: type, guessed: cls.guessed, parts: parts };
    }

    if (type === 'shell') {
      box(C.metalCap, 0, H / 2, 0, w, H, h);
      return { type: type, guessed: cls.guessed, parts: parts };
    }

    // qfp / soic：本體內縮，引腳從本體伸出來壓在 pad 上
    const inset = type === 'qfp' ? 0.72 : 0.62;      // 本體佔封裝外框的比例，其餘是腳
    const bw = Math.max(0.4, w * inset), bd = Math.max(0.4, h * inset);
    box(C.epoxy, 0, H / 2, 0, bw, H, bd);
    box(0x3a4048, -bw / 2 + Math.min(0.5, bw * 0.16), H + 0.005, -bd / 2 + Math.min(0.5, bd * 0.16), Math.min(0.5, bw * 0.16), 0.01, Math.min(0.5, bd * 0.16)); // pin 1 標記
    for (const p of (c.pads || [])) {
      const px = num(p.x), pz = num(p.y);
      const lw = Math.max(0.15, num(p.w) || 0.3), ld = Math.max(0.15, num(p.h) || 0.3);
      box(C.lead, px, H * 0.28, pz, lw, H * 0.22, ld);
    }
    return { type: type, guessed: cls.guessed, parts: parts };
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = S;
  root.Pcb3DShapes = S;
})(typeof window !== 'undefined' ? window : globalThis);
