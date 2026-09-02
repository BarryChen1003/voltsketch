/**
 * parts-lib.js — 基本電子零件庫（被動／分立／機構件的參數化 footprint ＋ 通用 IC 封裝）
 * pad schema 與 footprint-gen / kicad-io 相同：{num,name,x,y,rot,w,h,shape,drill,side,type,net,rr,cu}
 * 尺寸為 IPC-7351 名目近似；量產前以原廠 datasheet land pattern 覆核。
 * 座標：元件中心為原點，mm，y 向下。
 */
window.PartsLib = (function () {
  'use strict';

  const r2 = v => Math.round(v * 1000) / 1000;
  const P = (num, name, x, y, w, h, extra) => Object.assign(
    { num: String(num), name: name || '', x: r2(x), y: r2(y), rot: 0, w: r2(w), h: r2(h), shape: 'roundrect', rr: 0.25, drill: 0, side: 'F', type: 'smd', net: '', cu: true }, extra || {});
  const THT = { shape: 'circle', rr: 0, type: 'thru_hole', side: '*' };

  // ---- 2-pad chip（電阻/電容/電感/磁珠/LED/保險絲共用）----
  // c=pad 中心 ±x、padL=pad 寬(x)、padW=pad 高(y)、body bw×bh
  const chip = (c, padL, padW, bw, bh, n1, n2) => ({
    pads: [P(1, n1 || '1', -c, 0, padL, padW), P(2, n2 || '2', c, 0, padL, padW)],
    body: { w: bw, h: bh }
  });
  const CHIP = {
    '0201': [0.35, 0.35, 0.35, 0.6, 0.3],
    '0402': [0.48, 0.55, 0.62, 1.0, 0.5],
    '0603': [0.75, 0.8, 0.95, 1.6, 0.8],
    '0805': [0.95, 0.95, 1.4, 2.0, 1.25],
    '1206': [1.45, 1.15, 1.7, 3.2, 1.6],
    '1210': [1.45, 1.15, 2.6, 3.2, 2.5],
    '1812': [2.0, 1.4, 3.4, 4.6, 3.2],
    '2512': [2.9, 1.5, 3.3, 6.3, 3.2]
  };
  const chipOf = (sz, n1, n2) => { const d = CHIP[sz]; return chip(d[0], d[1], d[2], d[3], d[4], n1, n2); };

  // ---- 二極體（pin1=K 陰極，pin2=A 陽極）----
  const DIODE = {
    'SOD-323': () => chip(1.05, 0.8, 0.9, 1.7, 1.3, 'K', 'A'),
    'SOD-123': () => chip(1.55, 1.0, 1.2, 2.8, 1.8, 'K', 'A'),
    'SMA (DO-214AC)': () => chip(2.0, 1.6, 1.8, 4.4, 2.8, 'K', 'A'),
    'SMB (DO-214AA)': () => chip(2.2, 2.0, 2.2, 5.4, 3.6, 'K', 'A'),
    'SMC (DO-214AB)': () => chip(3.2, 2.4, 3.2, 7.9, 5.9, 'K', 'A')
  };

  // ---- 電晶體 / MOSFET ----
  const TRAN = {
    'SOT-23': () => ({
      pads: [P(1, 'B/G', -0.95, 1.1, 0.9, 1.0), P(2, 'E/S', 0.95, 1.1, 0.9, 1.0), P(3, 'C/D', 0, -1.1, 0.9, 1.0)],
      body: { w: 2.9, h: 1.3 }
    }),
    'SOT-23-5': () => ({
      pads: [P(1, '1', -0.95, 1.1, 0.6, 1.0), P(2, '2', 0, 1.1, 0.6, 1.0), P(3, '3', 0.95, 1.1, 0.6, 1.0),
             P(4, '4', 0.95, -1.1, 0.6, 1.0), P(5, '5', -0.95, -1.1, 0.6, 1.0)],
      body: { w: 2.9, h: 1.6 }
    }),
    'SOT-89': () => ({
      pads: [P(1, '1', -1.5, 1.5, 0.8, 1.2), P(2, '2', 0, 1.5, 0.8, 1.2), P(3, '3', 1.5, 1.5, 0.8, 1.2),
             P(4, 'TAB(2)', 0, -1.2, 2.0, 1.8, { shape: 'rect', rr: 0 })],
      body: { w: 4.5, h: 2.5 }
    }),
    'SOT-223': () => ({
      pads: [P(1, '1', -2.3, 2.9, 1.2, 1.8), P(2, '2', 0, 2.9, 1.2, 1.8), P(3, '3', 2.3, 2.9, 1.2, 1.8),
             P(4, 'TAB(2)', 0, -2.9, 3.6, 2.2, { shape: 'rect', rr: 0 })],
      body: { w: 6.5, h: 3.5 }
    }),
    'DPAK (TO-252)': () => ({
      pads: [P(1, '1', -2.28, 4.7, 1.1, 1.6), P(3, '3', 2.28, 4.7, 1.1, 1.6),
             P(2, 'TAB(2)', 0, -1.6, 6.2, 5.8, { shape: 'rect', rr: 0 })],
      body: { w: 6.6, h: 6.1 }
    }),
    'D2PAK (TO-263)': () => ({
      pads: [P(1, '1', -2.54, 7.0, 1.3, 2.2), P(3, '3', 2.54, 7.0, 1.3, 2.2),
             P(2, 'TAB(2)', 0, -2.3, 10.8, 8.4, { shape: 'rect', rr: 0 })],
      body: { w: 10.2, h: 9.2 }
    })
  };

  // ---- 鉭電容（EIA，pin1=+）----
  const TANT = {
    '3216 (A)': () => chip(1.35, 1.4, 1.4, 3.2, 1.6, '+', '-'),
    '3528 (B)': () => chip(1.55, 1.6, 2.2, 3.5, 2.8, '+', '-'),
    '6032 (C)': () => chip(2.4, 2.0, 2.4, 6.0, 3.2, '+', '-'),
    '7343 (D)': () => chip(2.9, 2.2, 2.4, 7.3, 4.3, '+', '-')
  };

  // ---- 鋁電解 SMD（pin1=+）----
  const ECAP = {
    'Ø6.3mm': () => chip(2.35, 2.6, 1.6, 6.6, 6.6, '+', '-'),
    'Ø8mm': () => chip(3.0, 3.2, 2.0, 8.3, 8.3, '+', '-'),
    'Ø10mm': () => chip(3.85, 3.8, 2.0, 10.3, 10.3, '+', '-')
  };

  // ---- 晶振 ----
  const XTAL = {
    '3225 (4-pad)': () => ({
      pads: [P(1, '1', -1.1, 0.8, 1.4, 1.15), P(2, '2', 1.1, 0.8, 1.4, 1.15),
             P(3, '3', 1.1, -0.8, 1.4, 1.15), P(4, '4', -1.1, -0.8, 1.4, 1.15)],
      body: { w: 3.2, h: 2.5 }
    }),
    '5032 (2-pad)': () => chip(1.9, 2.0, 2.4, 5.0, 3.2),
    'HC-49S SMD': () => chip(4.35, 4.6, 2.0, 11.5, 4.8)
  };

  // ---- 排針 2.54 THT（1×N / 2×N；pin1 方形 pad）----
  function header(rows, cols) {
    const pads = [];
    let num = 1;
    for (let c = 0; c < cols; c++) {
      for (let rIdx = 0; rIdx < rows; rIdx++) {
        const x = (c - (cols - 1) / 2) * 2.54;
        const y = (rIdx - (rows - 1) / 2) * 2.54;
        pads.push(P(num, String(num), x, y, 1.7, 1.7, Object.assign({}, THT, { drill: 1.0 }, num === 1 ? { shape: 'rect' } : {})));
        num++;
      }
    }
    return { pads, body: { w: cols * 2.54, h: rows * 2.54 } };
  }

  // ---- 螺絲端子 5.08 THT ----
  function terminal(n) {
    const pads = [];
    for (let i = 0; i < n; i++)
      pads.push(P(i + 1, String(i + 1), (i - (n - 1) / 2) * 5.08, 0, 2.6, 2.6, Object.assign({}, THT, { drill: 1.3 }, i === 0 ? { shape: 'rect' } : {})));
    return { pads, body: { w: n * 5.08, h: 8.1 } };
  }

  // ---- JST 線對板連接器（THT 上進線 header）----
  //
  // 為什麼這幾顆要單獨刻、不能用家族推估：連接器的孔位是**廠商規定的**，
  // 不是從封裝名推得出來的。推錯的後果不是線寬差一點，是接頭插不進去。
  // 所以只做「原廠 datasheet 有 PC board layout 那一頁」的型號，數字逐個對過。
  //
  // 出處（2026-09-02 取自 JST 官方 datasheet）：
  //   PH  https://www.jst-mfg.com/product/pdf/eng/ePH.pdf
  //       pitch 2.0±0.05、孔 φ0.7 +0.1/0、header B*B-PH-K-S 本體 B = (n−1)×2.0 + 3.9、寬 4.5、高 6
  //   XH  https://www.jst-mfg.com/product/pdf/eng/eXH.pdf
  //       pitch 2.5±0.05、孔 φ0.9 +0.1/0（2 腳版是 φ1）、header B*B-XH-A 本體 B = (n−1)×2.5 + 4.9、寬 5.75、高 7
  //
  // 孔徑取公差帶的上緣（PH 0.8、XH 1.0）：兩份 datasheet 的 Note 都明講
  // 「玻纖板請考慮加大孔徑」，而我們的使用者做的就是 FR4。
  // pad 外徑 = 孔 + 2×0.25 環寬（JLCPCB 建議值 0.25，絕對下限 0.18）——datasheet 不規定 pad，
  // 那是板廠能力的事，不是連接器的事。
  //
  // 本體外框置中：PH 的 layout 其實標了「腳列離外框 1.7」（另一側 2.8），但 PartsLib 的
  // body 只有寬高、沒有偏移，表達不了。pad 位置不受影響（那才是碰到銅的東西），
  // 外框只是示意——要精確外框的話得先讓 body 支援偏移。
  const jstTht = (n, pitch, hole, bodyExtra, bodyW) => {
    const pads = [];
    const od = r2(hole + 0.5);                    // 環寬 0.25 × 2
    for (let i = 0; i < n; i++) {
      pads.push(P(i + 1, String(i + 1), (i - (n - 1) / 2) * pitch, 0, od, od,
        Object.assign({}, THT, { drill: hole }, i === 0 ? { shape: 'rect' } : { shape: 'circle' })));
    }
    return { pads, body: { w: r2((n - 1) * pitch + bodyExtra), h: bodyW } };
  };
  const JST_N = ['2P', '3P', '4P', '5P', '6P', '7P', '8P', '9P', '10P', '12P', '14P', '16P'];
  const jstN = v => parseInt(v, 10);

  // ---- 測試點 / 安裝孔 ----
  const tp = d => ({ pads: [P(1, 'TP', 0, 0, d, d, { shape: 'circle', rr: 0 })], body: { w: d + 0.4, h: d + 0.4 } });
  const hole = d => ({ pads: [P(1, 'NPTH', 0, 0, d, d, { shape: 'circle', rr: 0, drill: d, type: 'np_thru_hole', side: '*', cu: false })], body: { w: d + 0.6, h: d + 0.6 } });

  // ---- 通用 IC 封裝（走 FootprintGen，不另刻一套幾何）----
  //
  // 為什麼要有這一組：以前 IC 的封裝**只能由料號決定**——`Sch2Pcb` 在 ic-data 裡找不到
  // 那顆料就整個放棄（`icNotInLibrary`）。可是「這顆是 SOIC-8」是設計者知道、而且跟料號
  // 無關的事實：拿一顆還沒進庫的 MCU 畫板，不該因此連封裝都綁不了。
  //
  // 幾何一律交給 `FootprintGen.fromIC`（同一份 IPC-7351 名目近似），這裡只是把
  // 「封裝名＋腳數」包成它認得的形狀。自己再刻一套 SOIC/QFN 的話，同一個封裝會在兩個
  // 地方長出不一樣的 pad，而兩邊看起來都對。
  //
  // 誠實界定：`fromIC` 對尺寸缺漏的家族會用「家族＋腳數」推估並回 `meta.warnings`，
  // 那些警告原樣往上帶——不要在這一層吞掉。
  const icFp = (pkg, n) => {
    const FG = (typeof window !== 'undefined' && window.FootprintGen) ||
               (typeof globalThis !== 'undefined' && globalThis.FootprintGen) || null;
    if (!FG || !FG.fromIC) return null;       // 沒載產生器就是「做不到」，不要自己編一個
    const ic = { part: pkg, package: pkg, pins: [] };
    for (let i = 1; i <= n; i++) ic.pins.push({ num: String(i), name: String(i) });
    const r = FG.fromIC(ic);
    if (!r || !r.ok || !r.pads || !r.pads.length) return null;
    return { pads: r.pads, body: r.body, warnings: (r.meta && r.meta.warnings) || [] };
  };
  // 變體名字本身就是封裝名（"SOIC-8"），腳數直接從名字尾巴取，不另外維護一張對照表
  const icGen = v => {
    const m = /(\d{1,3})$/.exec(String(v));
    return m ? icFp(String(v), parseInt(m[1], 10)) : null;
  };
  const IC_PKGS = {
    soic:  ['SOIC-8', 'SOIC-14', 'SOIC-16', 'SOIC-18', 'SOIC-20', 'SOIC-24', 'SOIC-28'],
    tssop: ['TSSOP-8', 'TSSOP-14', 'TSSOP-16', 'TSSOP-20', 'TSSOP-24', 'TSSOP-28', 'TSSOP-38'],
    ssop:  ['SSOP-8', 'SSOP-16', 'SSOP-20', 'SSOP-24', 'SSOP-28'],
    msop:  ['MSOP-8', 'MSOP-10', 'MSOP-12', 'MSOP-16'],
    qfn:   ['QFN-16', 'QFN-20', 'QFN-24', 'QFN-28', 'QFN-32', 'QFN-40', 'QFN-48', 'QFN-64'],
    qfp:   ['LQFP-32', 'LQFP-44', 'LQFP-48', 'LQFP-64', 'LQFP-80', 'LQFP-100', 'TQFP-32', 'TQFP-44', 'TQFP-64', 'TQFP-100'],
    dip:   ['DIP-4', 'DIP-6', 'DIP-8', 'DIP-14', 'DIP-16', 'DIP-18', 'DIP-20', 'DIP-24', 'DIP-28', 'DIP-40']
  };

  // ---- 型錄：id / refdes 前綴 / 規格表 ----
  const CHIP_R = ['0201', '0402', '0603', '0805', '1206', '1210', '2512'];
  const CHIP_S = ['0402', '0603', '0805', '1206'];
  const CATALOG = [
    { id: 'res',  ref: 'R',  variants: CHIP_R, gen: v => chipOf(v) },
    { id: 'cap',  ref: 'C',  variants: ['0201', '0402', '0603', '0805', '1206', '1210'], gen: v => chipOf(v) },
    { id: 'ind',  ref: 'L',  variants: CHIP_S.concat(['1210']), gen: v => chipOf(v) },
    { id: 'bead', ref: 'FB', variants: CHIP_S, gen: v => chipOf(v) },
    { id: 'led',  ref: 'D',  variants: CHIP_S, gen: v => chipOf(v, 'K', 'A') },
    { id: 'dio',  ref: 'D',  variants: Object.keys(DIODE), gen: v => DIODE[v]() },
    { id: 'tran', ref: 'Q',  variants: Object.keys(TRAN), gen: v => TRAN[v]() },
    { id: 'tant', ref: 'C',  variants: Object.keys(TANT), gen: v => TANT[v]() },
    { id: 'ecap', ref: 'C',  variants: Object.keys(ECAP), gen: v => ECAP[v]() },
    { id: 'xtal', ref: 'Y',  variants: Object.keys(XTAL), gen: v => XTAL[v]() },
    { id: 'hdr',  ref: 'J',  variants: ['1×2', '1×3', '1×4', '1×5', '1×6', '1×8', '1×10', '1×20', '2×3', '2×5', '2×8', '2×10', '2×20'],
      gen: v => { const m = v.match(/(\d+)×(\d+)/); return header(parseInt(m[1]), parseInt(m[2])); } },
    { id: 'term', ref: 'J',  variants: ['2P', '3P', '4P'], gen: v => terminal(parseInt(v)) },
    { id: 'fuse', ref: 'F',  variants: ['0603', '1206', '1812'], gen: v => chipOf(v) },
    { id: 'tp',   ref: 'TP', variants: ['Ø1.0', 'Ø1.5', 'Ø2.0'], gen: v => tp(parseFloat(v.slice(1))) },
    { id: 'hole', ref: 'H',  variants: ['M2 (Ø2.2)', 'M2.5 (Ø2.7)', 'M3 (Ø3.2)', 'M4 (Ø4.3)'],
      gen: v => hole(parseFloat(v.match(/Ø([\d.]+)/)[1])) },
    // JST：孔徑照 datasheet 公差帶上緣（FR4），本體長度照 header 表的 B 欄
    { id: 'jstph', ref: 'J', variants: JST_N, src: "datasheet", gen: v => jstTht(jstN(v), 2.0, 0.8, 3.9, 4.5) },
    { id: 'jstxh', ref: 'J', variants: JST_N, src: "datasheet", gen: v => jstTht(jstN(v), 2.5, 1.0, 4.9, 5.75) },
    { id: 'soic',  ref: 'U', variants: IC_PKGS.soic,  gen: icGen },
    { id: 'tssop', ref: 'U', variants: IC_PKGS.tssop, gen: icGen },
    { id: 'ssop',  ref: 'U', variants: IC_PKGS.ssop,  gen: icGen },
    { id: 'msop',  ref: 'U', variants: IC_PKGS.msop,  gen: icGen },
    { id: 'qfn',   ref: 'U', variants: IC_PKGS.qfn,   gen: icGen },
    { id: 'qfp',   ref: 'U', variants: IC_PKGS.qfp,   gen: icGen },
    { id: 'dip',   ref: 'U', variants: IC_PKGS.dip,   gen: icGen }
  ];

  function list() { return CATALOG.map(c => ({ id: c.id, ref: c.ref, variants: c.variants })); }

  function build(catId, variant) {
    const cat = CATALOG.find(c => c.id === catId);
    if (!cat || !cat.variants.includes(variant)) return { ok: false };
    const r = cat.gen(variant);
    // IC 家族是交給 FootprintGen 產的，它可能產不出來（沒載入、或那個封裝它認不得）。
    // 回一個 pads 是 undefined 的「成功」會讓呼叫端在放件時才爆，而且看不出是誰的錯。
    if (!r || !r.pads || !r.pads.length) return { ok: false, reason: 'generatorFailed', lib: catId, variant };
    return {
      ok: true, ref: cat.ref, name: variant,
      pads: r.pads, body: r.body,
      meta: {
        // 出處要照實講。連接器是照原廠 datasheet 的 PC board layout 建的，
        // 對它說「IPC-7351 名目近似、請覆核原廠 land pattern」是假的——我們已經用了原廠的圖。
        // 而且這兩類的可靠度不同：被動件推估差一點只是焊點大小差一點，
        // 連接器孔位推估錯的後果是那顆料裝不上去。呼叫端要能分辨。
        src: cat.src === 'datasheet' ? 'datasheet' : 'ipc',
        source: 'IPC-7351 名目近似（量產前以原廠 land pattern 覆核）',
        // 推估來的尺寸原樣往上帶：吞掉的話，使用者會以為這個 footprint 跟被動件一樣可靠
        warnings: r.warnings || []
      }
    };
  }

  return { list, build };
})();
