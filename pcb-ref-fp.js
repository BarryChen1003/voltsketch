/**
 * pcb-ref-fp.js — 開源公版料件 footprint 解析器
 * 用途：pcb-refboards.js 的教學重建版料件（只有 ref/part/x/y/w/h）載入時，
 *       依 part 字串 pattern 配出真 pad 幾何（pin number／已知腳名），達到可讀的 layout 細節。
 * 誠實界定：封裝與球圖多為「依公開 datasheet 常識推估」的 IPC 名目近似，
 *       腳名只在有把握時給（W25Q/AT24C/AP2112K/UEXT/USB…），沒把握就只給號碼；
 *       BGA 球圖為近似網格（非原廠 ball map）。量產請以原廠 land pattern 為準。
 * pad schema 與 footprint-gen / parts-lib / kicad-io 相同：
 *       {num,name,x,y,rot,w,h,shape,drill,side,type,net,rr,cu}
 * 座標：元件中心為原點，mm，y 向下。
 */
window.RefFP = (function () {
  'use strict';

  const r2 = v => Math.round(v * 1000) / 1000;
  const P = (num, name, x, y, w, h, extra) => Object.assign(
    { num: String(num), name: name || '', x: r2(x), y: r2(y), rot: 0, w: r2(w), h: r2(h), shape: 'roundrect', rr: 0.25, drill: 0, side: 'F', type: 'smd', net: '', cu: true }, extra || {});
  const THT = { shape: 'circle', rr: 0, type: 'thru_hole', side: '*' };

  // ---------------- IC：合成 pins → FootprintGen ----------------

  // 數字腳 1..n（names 依序給已知腳名）＋可選 EP
  function numPins(n, names, ep) {
    const pins = [];
    for (let i = 1; i <= n; i++) pins.push({ num: String(i), name: (names && names[i - 1]) || '' });
    if (ep) pins.push({ num: 'EP', name: ep, ep: true });
    return pins;
  }

  // JEDEC 列字母（跳 I,O,Q,S,X,Z），>20 列用 AA、AB…
  const ROWS = 'ABCDEFGHJKLMNPRTUVWY';
  const rowName = i => i < 20 ? ROWS[i] : 'A' + ROWS[i - 20];

  // 球陣 pins：rows×cols；skip(ri,ci) 回 true 的位置不長球（近似 depopulation）
  function ballPins(rows, cols, skip) {
    const pins = [];
    for (let ri = 0; ri < rows; ri++)
      for (let ci = 0; ci < cols; ci++) {
        if (skip && skip(ri, ci)) continue;
        pins.push({ num: rowName(ri) + (ci + 1), name: '' });
      }
    return pins;
  }

  // DDR3 x16 FBGA-96：9 欄只長 1-3、7-9（中間走線通道），16 列 → 96 球
  const ddr3Skip = (ri, ci) => ci >= 3 && ci <= 5;
  // eMMC FBGA-153 近似：13×13 挖中央 4×4 → 153（非 JEDEC 原圖，教學近似）
  const emmcSkip = (ri, ci) => ri >= 4 && ri <= 7 && ci >= 4 && ci <= 7;
  // i.MX6Q FCBGA-624 近似：25×25 挖正中央 1 球 → 624
  const mx6Skip = (ri, ci) => ri === 12 && ci === 12;

  // IC 規格表：pattern → { pkg(給 FootprintGen 解析), pins }
  // guess:true = 封裝為推估（part 字串沒寫、憑常識配），warnings 標註
  const IC_SPECS = [
    { re: /^RP2040/i, pkg: 'QFN-56 7×7mm 0.4mm pitch', pins: () => numPins(56, null, 'GND') },
    { re: /W25Q\d+/i, pkg: 'SOIC-8 5.3×5.2mm 1.27mm pitch', pins: () => numPins(8, ['/CS', 'DO', '/WP', 'GND', 'DI', 'CLK', '/HOLD', 'VCC']) },
    { re: /AT24C\d+/i, pkg: 'SOIC-8 3.9×4.9mm 1.27mm pitch', pins: () => numPins(8, ['A0', 'A1', 'A2', 'GND', 'SDA', 'SCL', 'WP', 'VCC']) },
    { re: /ATmega328P/i, pkg: 'TQFP-32 7×7mm 0.8mm pitch', pins: () => numPins(32) },
    { re: /ATmega16U2/i, pkg: 'QFN-32 5×5mm 0.5mm pitch', pins: () => numPins(32, null, 'GND') },
    { re: /AP2112K/i, pkg: 'SOT-23-5', pins: () => numPins(5, ['VIN', 'GND', 'EN', 'NC', 'VOUT']) },
    { re: /Li-?ion charger/i, pkg: 'SOT-23-5', pins: () => numPins(5, ['STAT', 'VSS', 'VBAT', 'VDD', 'PROG']), guess: true },
    { re: /RT6150/i, pkg: 'WDFN-10 3×3mm 0.5mm pitch', pins: () => numPins(10, null, 'GND') },
    { re: /LAN8710/i, pkg: 'QFN-32 5×5mm 0.5mm pitch', pins: () => numPins(32, null, 'GND') },
    { re: /RTL8201/i, pkg: 'QFN-32 5×5mm 0.5mm pitch', pins: () => numPins(32, null, 'GND'), guess: true },
    { re: /AXP209/i, pkg: 'QFN-48 6×6mm 0.4mm pitch', pins: () => numPins(48, null, 'GND'), guess: true },
    { re: /AR8031/i, pkg: 'QFN-48 6×6mm 0.4mm pitch', pins: () => numPins(48, null, 'GND') },
    { re: /PF0100/i, pkg: 'QFN-56 8×8mm 0.5mm pitch', pins: () => numPins(56, null, 'GND') },
    { re: /PCA9450/i, pkg: 'QFN-56 7×7mm 0.4mm pitch', pins: () => numPins(56, null, 'GND') },
    { re: /MAX2871/i, pkg: 'QFN-32 5×5mm 0.5mm pitch', pins: () => numPins(32, null, 'GND') },
    { re: /Si5351/i, pkg: 'MSOP-10 3×3mm 0.5mm pitch', pins: () => numPins(10) },
    { re: /USB-?UART/i, pkg: 'SOIC-16 3.9×9.9mm 1.27mm pitch', pins: () => numPins(16), guess: true },
    { re: /PoE PD/i, pkg: 'SOIC-16 3.9×9.9mm 1.27mm pitch', pins: () => numPins(16), guess: true },
    { re: /FPGA/i, pkg: 'TQFP-100 14×14mm 0.5mm pitch', pins: () => numPins(100), guess: true },
    { re: /取樣 ?ADC/i, pkg: 'QFN-48 7×7mm 0.5mm pitch', pins: () => numPins(48, null, 'GND'), guess: true },
    { re: /混頻器|mixer/i, pkg: 'QFN-24 4×4mm 0.5mm pitch', pins: () => numPins(24, null, 'GND'), guess: true },
    { re: /RF ?開關|RF ?switch/i, pkg: 'SC-70 1.25×2mm 0.65mm pitch', pins: () => numPins(6), guess: true },
    { re: /LDO/i, pkg: 'SOT-23-5', pins: () => numPins(5), guess: true },
    { re: /DC-?DC 輔助/i, pkg: 'SOT-23-5', pins: () => numPins(5), guess: true },
    { re: /i\.?MX233/i, pkg: 'LQFP-128 14×14mm 0.4mm pitch', pins: () => numPins(128) },
    { re: /i\.?MX6Q/i, pkg: 'FCBGA-624 21×21mm 0.8mm pitch', pins: () => ballPins(25, 25, mx6Skip), guess: true },
    { re: /i\.?MX8M/i, pkg: 'FCBGA-484 14×14mm 0.6mm pitch', pins: () => ballPins(22, 22), guess: true },
    { re: /Allwinner A20|A20 \(BGA/i, pkg: 'BGA-441 19×19mm 0.8mm pitch', pins: () => ballPins(21, 21), guess: true },
    { re: /DDR3/i, pkg: 'FBGA-96 7.5×13mm 0.8mm pitch', pins: () => ballPins(16, 9, ddr3Skip) },
    { re: /LPDDR4/i, pkg: 'FBGA-200 10×14.5mm 0.65mm pitch', pins: () => ballPins(20, 10), guess: true },
    { re: /mDDR|SDRAM/i, pkg: 'VFBGA-60 8×9mm 0.8mm pitch', pins: () => ballPins(10, 6), guess: true },
    { re: /eMMC/i, pkg: 'FBGA-153 11.5×13mm 0.5mm pitch', pins: () => ballPins(13, 13, emmcSkip), guess: true }
  ];

  // ESP32-WROOM-32 模組：38 腳（左 14、下 9、右 15，官方腳序）＋熱墊
  const WROOM_NAMES = ['GND', '3V3', 'EN', 'SENSOR_VP', 'SENSOR_VN', 'IO34', 'IO35', 'IO32', 'IO33', 'IO25', 'IO26', 'IO27', 'IO14', 'IO12',
    'GND', 'IO13', 'SD2', 'SD3', 'CMD', 'CLK', 'SD0', 'SD1', 'IO15',
    'IO2', 'IO0', 'IO4', 'IO16', 'IO17', 'IO5', 'IO18', 'IO19', 'NC', 'IO21', 'RXD0', 'TXD0', 'IO22', 'IO23', 'GND'];
  function esp32Wroom() {
    const bw = 18, bh = 25.5, pitch = 1.27, padL = 1.5, padW = 0.9;
    const pads = [];
    for (let i = 0; i < 14; i++)  // 左 1–14（上→下）
      pads.push(P(i + 1, WROOM_NAMES[i], -bw / 2 + padL / 2 - 0.4, (i - 6.5) * pitch + 2, padL, padW));
    for (let i = 0; i < 9; i++)   // 下 15–23（左→右）
      pads.push(P(i + 15, WROOM_NAMES[i + 14], (i - 4) * pitch, bh / 2 - padL / 2 + 0.4, padW, padL));
    for (let i = 0; i < 15; i++)  // 右 24–38（下→上）
      pads.push(P(i + 24, WROOM_NAMES[i + 23], bw / 2 - padL / 2 + 0.4, (6.5 - i) * pitch + 2, padL, padW));
    pads.push(P('EP', 'GND', 0, 2, 5, 5, { shape: 'rect', rr: 0 }));
    return { pads, body: { w: bw, h: bh }, pkg: 'Module-38 18×25.5mm 1.27mm pitch' };
  }

  function synthIC(part) {
    if (/ESP32-?WROOM/i.test(part)) { const m = esp32Wroom(); return { pads: m.pads, body: m.body, pkg: m.pkg, warnings: [] }; }
    if (/NCP1117|^1117|LDO \(SOT-223\)/i.test(part)) {
      // SOT-223（FootprintGen 家族表沒有，取 parts-lib 同幾何、掛實腳名）
      const pads = [P(1, 'GND', -2.3, 2.9, 1.2, 1.8), P(2, 'OUT', 0, 2.9, 1.2, 1.8), P(3, 'IN', 2.3, 2.9, 1.2, 1.8),
        P(4, 'OUT(TAB)', 0, -2.9, 3.6, 2.2, { shape: 'rect', rr: 0 })];
      return { pads, body: { w: 6.5, h: 3.5 }, pkg: 'SOT-223', warnings: [] };
    }
    const spec = IC_SPECS.find(s => s.re.test(part));
    if (!spec || !window.FootprintGen) return null;
    const r = window.FootprintGen.fromIC({ part, package: spec.pkg, pins: spec.pins() });
    if (!r || !r.ok) return null;
    const warnings = (r.meta.warnings || []).slice();
    if (spec.guess) warnings.push('封裝為推估（板上料件未標，依常識近似）');
    return { pads: r.pads, body: r.body, pkg: spec.pkg, warnings };
  }

  // ---------------- 被動件 ----------------

  // 尺寸 → parts-lib chip 變體（IPC 名目 pad）
  const CHIP_MAP = [[0.6, '0201'], [1.0, '0402'], [1.6, '0603'], [2.0, '0805'], [3.2, '1206']];
  const chipVariant = w => CHIP_MAP.reduce((a, b) => Math.abs(b[0] - w) < Math.abs(a[0] - w) ? b : a)[1];

  function viaPartsLib(cat, variant, names) {
    if (!window.PartsLib) return null;
    const r = window.PartsLib.build(cat, variant);
    if (!r || !r.ok) return null;
    if (names) r.pads.forEach((p, i) => { if (names[i] != null) p.name = names[i]; });
    return { pads: r.pads, body: r.body, pkg: variant, warnings: [] };
  }

  // 任意尺寸 2-pad（功率電感、RF 級等 chip 表外尺寸）
  function generic2(w, h, n1, n2) {
    const padL = Math.max(0.3, w * 0.3), padW = Math.max(0.3, h * 0.9);
    const c = w / 2 - padL / 2 + 0.1;
    return { pads: [P(1, n1 || '', -c, 0, padL, padW), P(2, n2 || '', c, 0, padL, padW)], body: { w, h }, pkg: `2-pad ${w}×${h}mm`, warnings: [] };
  }

  // 陶瓷諧振器 3 腳（in/gnd/out）
  const resonator3 = (w, h) => ({
    pads: [P(1, 'IN', -w / 2 + 0.5, 0, 0.8, h * 0.9), P(2, 'GND', 0, 0, 0.8, h * 0.9), P(3, 'OUT', w / 2 - 0.5, 0, 0.8, h * 0.9)],
    body: { w, h }, pkg: `Resonator-3 ${w}×${h}mm`, warnings: []
  });

  // 變壓器 4+4（左一次側、右二次側，教學近似）
  function transformer8(w, h) {
    const pads = [];
    for (let i = 0; i < 4; i++) {
      const y = (i - 1.5) * (h / 4.2);
      pads.push(P(i + 1, 'PRI', -w / 2 + 0.8, y, 1.4, 0.8));
      pads.push(P(i + 5, 'SEC', w / 2 - 0.8, y, 1.4, 0.8));
    }
    return { pads, body: { w, h }, pkg: `XFMR-8 ${w}×${h}mm`, warnings: ['腳位教學近似'] };
  }

  // 方向耦合器 4 埠
  const coupler4 = (w, h) => ({
    pads: [P(1, 'IN', -w / 2 + 0.6, h / 2 - 0.5, 1.0, 0.8), P(2, 'OUT', w / 2 - 0.6, h / 2 - 0.5, 1.0, 0.8),
      P(3, 'CPL', -w / 2 + 0.6, -h / 2 + 0.5, 1.0, 0.8), P(4, 'ISO', w / 2 - 0.6, -h / 2 + 0.5, 1.0, 0.8)],
    body: { w, h }, pkg: `Coupler-4 ${w}×${h}mm`, warnings: []
  });

  // 排阻 2×4（SATA 串接端接）
  function rArray8(w, h) {
    const pads = [];
    for (let i = 0; i < 4; i++) {
      const x = (i - 1.5) * (w / 4.4);
      pads.push(P(i + 1, '', x, h / 2 - 0.3, 0.5, 0.6));
      pads.push(P(8 - i, '', x, -h / 2 + 0.3, 0.5, 0.6));
    }
    return { pads, body: { w, h }, pkg: `R-array 2×4 ${w}×${h}mm`, warnings: [] };
  }

  function passive(c) {
    const pre = (String(c.ref || '').match(/^[A-Za-z]+/) || [''])[0].toUpperCase();
    const part = String(c.part || '');
    if (pre === 'R') return viaPartsLib('res', chipVariant(c.w));
    if (pre === 'C') return viaPartsLib('cap', chipVariant(c.w));
    if (pre === 'FB') return viaPartsLib('bead', chipVariant(c.w));
    if (pre === 'LED') return viaPartsLib('led', chipVariant(c.w));
    if (pre === 'L') return c.w <= 2 ? viaPartsLib('ind', chipVariant(c.w)) : generic2(c.w, c.h, '1', '2');
    if (pre === 'D') return viaPartsLib('dio', 'SMA (DO-214AC)');
    if (pre === 'Q') return viaPartsLib('tran', 'SOT-23');
    if (pre === 'T') return transformer8(c.w, c.h);
    if (pre === 'Y') {
      if (/resonator/i.test(part)) return resonator3(c.w, c.h);
      if (c.w >= 3 && c.h >= 2.2) return viaPartsLib('xtal', '3225 (4-pad)', ['X1', 'GND', 'X2', 'GND']);
      return viaPartsLib('cap', chipVariant(c.w), ['X1', 'X2']);   // 2012 級 2-pad（32.768k）
    }
    if (pre === 'U') { // kind=passive 的 RF/端接件
      if (/coupler/i.test(part)) return coupler4(c.w, c.h);
      if (/termination/i.test(part)) return rArray8(c.w, c.h);
      return generic2(c.w, c.h, 'IN', 'OUT');
    }
    return null;
  }

  // ---------------- 連接器／開關／機構 ----------------

  // 排針（列主序＝IDC 慣例：1 上左、2 下左、3 上次欄…；同 parts-lib header numbering）
  function header(rows, cols, names, pitch) {
    const pt = pitch || 2.54;
    const pads = []; let num = 1;
    for (let ci = 0; ci < cols; ci++)
      for (let ri = 0; ri < rows; ri++) {
        pads.push(P(num, (names && names[num - 1]) || String(num),
          (ci - (cols - 1) / 2) * pt, (ri - (rows - 1) / 2) * pt, 1.7, 1.7,
          Object.assign({}, THT, { drill: 1.0 }, num === 1 ? { shape: 'rect' } : {})));
        num++;
      }
    return { pads, body: { w: cols * pt, h: rows * pt }, pkg: `HDR ${rows}×${cols}`, warnings: [] };
  }

  const UEXT_NAMES = ['3.3V', 'GND', 'TXD', 'RXD', 'SCL', 'SDA', 'MISO', 'MOSI', 'SCK', 'SSEL'];
  const ISP_NAMES = ['MISO', 'VCC', 'SCK', 'MOSI', '/RST', 'GND'];

  // USB-C 16P（全功能腳、雙列近似排列）＋外殼 4 腳
  function usbC() {
    const A = [['A1', 'GND'], ['A4', 'VBUS'], ['A5', 'CC1'], ['A6', 'D+'], ['A7', 'D-'], ['A8', 'SBU1'], ['A9', 'VBUS'], ['A12', 'GND']];
    const B = [['B12', 'GND'], ['B9', 'VBUS'], ['B8', 'SBU2'], ['B7', 'D-'], ['B6', 'D+'], ['B5', 'CC2'], ['B4', 'VBUS'], ['B1', 'GND']];
    const pads = [];
    A.forEach((p, i) => pads.push(P(p[0], p[1], (i - 3.5) * 0.8, -1.6, 0.6, 1.1)));
    B.forEach((p, i) => pads.push(P(p[0], p[1], (i - 3.5) * 0.8, 1.6, 0.6, 1.1)));
    [[-4.3, -2.2], [4.3, -2.2], [-4.3, 2.6], [4.3, 2.6]].forEach((s, i) =>
      pads.push(P('S' + (i + 1), 'SHELL', s[0], s[1], 1.2, 2.2, Object.assign({}, THT, { shape: 'oval', drill: 0.6 }))));
    return { pads, body: { w: 9.4, h: 7.4 }, pkg: 'USB-C 16P', warnings: ['腳位排列近似（實體混排）'] };
  }

  function usbMicro() {
    const names = ['VBUS', 'D-', 'D+', 'ID', 'GND'];
    const pads = names.map((n, i) => P(i + 1, n, (i - 2) * 0.65, -1.3, 0.4, 1.35));
    [[-3, 1], [3, 1], [-1.2, 1.6], [1.2, 1.6]].forEach((s, i) =>
      pads.push(P('S' + (i + 1), 'SHELL', s[0], s[1], 1.5, 1.7, Object.assign({}, THT, { drill: 0.85 }))));
    return { pads, body: { w: 7, h: 4.5 }, pkg: 'micro-USB 5P', warnings: [] };
  }

  // USB A/B THT（4 訊號＋2 殼）
  function usbTht(w, h, dual) {
    const names = ['VBUS', 'D-', 'D+', 'GND'];
    const pads = names.map((n, i) => P(i + 1, n, (i - 1.5) * 2.0, -h / 2 + 2, 1.7, 1.7, Object.assign({}, THT, { drill: 0.9 })));
    pads.push(P('S1', 'SHELL', -w / 2 + 0.8, 0, 2.4, 2.4, Object.assign({}, THT, { drill: 1.6 })));
    pads.push(P('S2', 'SHELL', w / 2 - 0.8, 0, 2.4, 2.4, Object.assign({}, THT, { drill: 1.6 })));
    return { pads, body: { w, h }, pkg: 'USB THT', warnings: dual ? ['雙埠簡化為單組腳位'] : [] };
  }

  const HDMI_NAMES = ['TMDS D2+', 'D2 SH', 'TMDS D2-', 'TMDS D1+', 'D1 SH', 'TMDS D1-', 'TMDS D0+', 'D0 SH', 'TMDS D0-',
    'CLK+', 'CLK SH', 'CLK-', 'CEC', 'UTIL', 'SCL', 'SDA', 'GND', '+5V', 'HPD'];
  function hdmi(w, h) {
    const pads = HDMI_NAMES.map((n, i) => P(i + 1, n, (i - 9) * 0.5, -h / 2 + 0.8, 0.3, 1.4));
    [[-w / 2 + 1, 1], [w / 2 - 1, 1], [-w / 2 + 1, h / 2 - 0.8], [w / 2 - 1, h / 2 - 0.8]].forEach((s, i) =>
      pads.push(P('S' + (i + 1), 'SHELL', s[0], s[1], 1.6, 1.8, Object.assign({}, THT, { drill: 0.9 }))));
    return { pads, body: { w, h }, pkg: 'HDMI-A 19P', warnings: [] };
  }

  const RJ45_NAMES = ['TRD0+', 'TRD0-', 'TRD1+', 'TRD2+', 'TRD2-', 'TRD1-', 'TRD3+', 'TRD3-'];
  function rj45(w, h) {
    const pads = RJ45_NAMES.map((n, i) => P(i + 1, n, (i - 3.5) * 1.27, -h / 2 + 1.6, 1.5, 1.5, Object.assign({}, THT, { drill: 0.9 })));
    pads.push(P('S1', 'SHELL', -w / 2 + 1, h / 2 - 3, 2.6, 2.6, Object.assign({}, THT, { drill: 1.6 })));
    pads.push(P('S2', 'SHELL', w / 2 - 1, h / 2 - 3, 2.6, 2.6, Object.assign({}, THT, { drill: 1.6 })));
    return { pads, body: { w, h }, pkg: 'RJ45 8P', warnings: [] };
  }

  const SD_NAMES = ['DAT2', 'CD/DAT3', 'CMD', 'VDD', 'CLK', 'VSS', 'DAT0', 'DAT1'];
  function microSd(w, h) {
    const pads = SD_NAMES.map((n, i) => P(i + 1, n, (i - 3.5) * 1.1, -h / 2 + 0.8, 0.7, 1.4));
    pads.push(P('S1', 'SHELL', -w / 2 + 0.6, h / 2 - 1.5, 1.2, 1.6));
    pads.push(P('S2', 'SHELL', w / 2 - 0.6, h / 2 - 1.5, 1.2, 1.6));
    return { pads, body: { w, h }, pkg: 'microSD push', warnings: [] };
  }

  // SATA data(7)+power(15) 直列近似
  function sata(w, h) {
    const S = ['GND', 'A+', 'A-', 'GND', 'B-', 'B+', 'GND'];
    const PWR = ['3V3', '3V3', '3V3', 'GND', 'GND', 'GND', '5V', '5V', '5V', 'GND', 'GND', 'GND', '12V', '12V', '12V'];
    const pads = [];
    S.forEach((n, i) => pads.push(P('S' + (i + 1), n, 0, -h / 2 + 0.8 + i * 0.7, 2.0, 0.4)));
    PWR.forEach((n, i) => pads.push(P('P' + (i + 1), n, 0, -h / 2 + 6.6 + i * 0.42, 2.0, 0.3)));
    return { pads, body: { w, h }, pkg: 'SATA 7+15', warnings: [] };
  }

  // Mini PCIe 52 邊接指（奇下偶上，0.5 近似）
  function miniPcie(w, h) {
    const pads = [];
    for (let i = 0; i < 26; i++) {
      pads.push(P(2 * i + 2, String(2 * i + 2), (i - 12.5) * 0.5, -1.2, 0.35, 1.6));
      pads.push(P(2 * i + 1, String(2 * i + 1), (i - 12.5) * 0.5, 1.2, 0.35, 1.6));
    }
    return { pads, body: { w, h }, pkg: 'miniPCIe 52P', warnings: ['邊接指間距壓縮近似'] };
  }

  function fpc(n, w, h) {
    const pads = [];
    for (let i = 0; i < n; i++) pads.push(P(i + 1, String(i + 1), (i - (n - 1) / 2) * 0.5, 0, 0.3, 1.8));
    pads.push(P('S1', 'ANCHOR', -(n / 2) * 0.5 - 1, 0, 1.2, 2.2));
    pads.push(P('S2', 'ANCHOR', (n / 2) * 0.5 + 1, 0, 1.2, 2.2));
    return { pads, body: { w, h }, pkg: `FPC ${n}P 0.5mm`, warnings: [] };
  }

  // 板對板細 pitch 2×40
  function b2b(w, h) {
    const pads = [];
    for (let i = 0; i < 40; i++) {
      pads.push(P(2 * i + 1, String(2 * i + 1), -1.0, (i - 19.5) * 0.5, 0.9, 0.3));
      pads.push(P(2 * i + 2, String(2 * i + 2), 1.0, (i - 19.5) * 0.5, 0.9, 0.3));
    }
    return { pads, body: { w, h }, pkg: 'B2B 2×40 0.5mm', warnings: ['腳數近似'] };
  }

  function jst2() {
    return {
      pads: [P(1, 'BAT+', -1, 0, 1.7, 1.7, Object.assign({}, THT, { drill: 0.8, shape: 'rect' })),
        P(2, 'GND', 1, 0, 1.7, 1.7, Object.assign({}, THT, { drill: 0.8 }))],
      body: { w: 6, h: 4.5 }, pkg: 'JST-PH 2P', warnings: []
    };
  }

  function barrel(w, h) {
    return {
      pads: [P(1, 'TIP(+)', -w / 2 + 1.5, 0, 2.4, 3.2, Object.assign({}, THT, { shape: 'oval', drill: 1.1 })),
        P(2, 'SLEEVE(-)', w / 2 - 1.5, 0, 2.4, 3.2, Object.assign({}, THT, { shape: 'oval', drill: 1.1 })),
        P(3, 'SHUNT', 0, h / 2 - 1, 2.4, 3.2, Object.assign({}, THT, { shape: 'oval', drill: 1.1 }))],
      body: { w, h }, pkg: 'DC Jack 3P', warnings: []
    };
  }

  function sma(w, h) {
    const pads = [P(1, 'SIG', 0, 0, 2.0, 2.0, Object.assign({}, THT, { drill: 1.3 }))];
    [[-2.54, -2.54], [2.54, -2.54], [-2.54, 2.54], [2.54, 2.54]].forEach((s, i) =>
      pads.push(P('G' + (i + 1), 'GND', s[0], s[1], 2.2, 2.2, Object.assign({}, THT, { drill: 1.5 }))));
    return { pads, body: { w, h }, pkg: 'SMA edge 5P', warnings: [] };
  }

  function tact(w, h) {
    const px = w / 2 + 0.7, py = Math.max(0.8, h / 2 - 0.4);
    return {
      pads: [P(1, 'A', -px, -py, 1.2, 0.9), P(2, 'A', px, -py, 1.2, 0.9),
        P(3, 'B', -px, py, 1.2, 0.9), P(4, 'B', px, py, 1.2, 0.9)],
      body: { w, h }, pkg: 'Tact 4P', warnings: []
    };
  }

  function dipSw2() {
    const pads = [];
    [['1', 'S1', -1.27, -1.27], ['2', 'S2', 1.27, -1.27], ['3', 'S2', 1.27, 1.27], ['4', 'S1', -1.27, 1.27]].forEach(d =>
      pads.push(P(d[0], d[1], d[2], d[3], 1.6, 1.6, Object.assign({}, THT, { drill: 0.9 }))));
    return { pads, body: { w: 5.4, h: 5.4 }, pkg: 'DIP-SW 2pos', warnings: [] };
  }

  function conn(c) {
    const part = String(c.part || '');
    const pre = (String(c.ref || '').match(/^[A-Za-z]+/) || [''])[0].toUpperCase();
    // 開關類
    if (pre === 'SW') return /DIP/i.test(part) ? dipSw2() : tact(c.w, c.h);
    // 具名連接器
    if (/USB-?C/i.test(part)) return usbC();
    if (/OTG|micro\b(?!SD)/i.test(part) && /USB/i.test(part)) return usbMicro();
    if (/USB/i.test(part)) return usbTht(c.w, c.h, /x2/i.test(part));
    if (/HDMI/i.test(part)) return hdmi(c.w, c.h);
    if (/RJ45|Ethernet(?!.*header)/i.test(part) && !/daughter/i.test(part)) return rj45(c.w, c.h);
    if (/microSD/i.test(part)) return microSd(c.w, c.h);
    if (/SATA/i.test(part)) return sata(c.w, c.h);
    if (/PCIe/i.test(part)) return miniPcie(c.w, c.h);
    if (/FPC\s*40|LCD FPC/i.test(part)) return fpc(40, c.w, c.h);
    if (/Board-to-board/i.test(part)) return b2b(c.w, c.h);
    if (/JST|LiPo|Battery/i.test(part)) return jst2();
    if (/Barrel|power jack/i.test(part)) return barrel(c.w, c.h);
    if (/SMA|RF (Out|Port)/i.test(part)) return sma(c.w, c.h);
    if (/UEXT/i.test(part)) return header(2, 5, UEXT_NAMES);
    if (pre === 'ICSP' || /ICSP/i.test(part)) return header(2, 3, ISP_NAMES);
    // 泛用排針：由外形推行列（橫放 cols 沿 w、直放沿 h）
    const horiz = c.w >= c.h;
    const cols = Math.max(1, Math.round((horiz ? c.w : c.h) / 2.54));
    const rows = Math.min(2, Math.max(1, Math.round((horiz ? c.h : c.w) / 2.54)));
    let names = null;
    if (/A0-A5/i.test(part)) names = ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'];
    else if (/D0-D13/i.test(part)) names = Array.from({ length: 14 }, (_, i) => 'D' + i);
    else if (/Power Header/i.test(part)) names = ['RST', '3V3', '5V', 'GND', 'GND', 'VIN'];
    const r = horiz ? header(rows, cols, names) : header(cols, rows, names); // 直放：rows 沿 h
    if (!horiz) { r.body = { w: rows * 2.54, h: cols * 2.54 }; }
    r.warnings = (r.warnings || []).concat(names ? [] : ['腳數由外形推估']);
    return r;
  }

  function mech(c) {
    const part = String(c.part || '');
    const pre = (String(c.ref || '').match(/^[A-Za-z]+/) || [''])[0].toUpperCase();
    if (pre === 'TP') {
      const name = part.replace(/^TP\s*/i, '') || 'TP';
      return { pads: [P(1, name, 0, 0, 1.2, 1.2, { shape: 'circle', rr: 0 })], body: { w: c.w, h: c.h }, pkg: 'TP Ø1.2', warnings: [] };
    }
    const m = part.match(/M(\d(?:\.\d)?)/);
    const drill = m ? ({ '2': 2.2, '2.5': 2.7, '3': 3.2, '4': 4.3 })[m[1]] || 3.2 : 3.2;
    return {
      pads: [P(1, 'NPTH', 0, 0, drill, drill, { shape: 'circle', rr: 0, drill, type: 'np_thru_hole', side: '*', cu: false })],
      body: { w: drill + 0.6, h: drill + 0.6 }, pkg: `NPTH Ø${drill}`, warnings: []
    };
  }

  // ---------------- 入口 ----------------

  // 直放排針：header(cols, rows) 產出的 body 已在 conn() 修正；此處統一收尾
  function resolve(c) {
    let r = null;
    try {
      if (c.kind === 'mech') r = mech(c);
      else if (c.kind === 'conn') r = conn(c);
      else if (c.kind === 'passive') r = passive(c);
      else if (c.kind === 'ic') {
        // 先查 IC 庫（完全同名才用，避免張冠李戴），再查公版規格表
        const ic = (window.IC_DATA || []).find(x => String(x.part).toUpperCase() === String(c.part).toUpperCase());
        if (ic && window.FootprintGen) {
          const g = window.FootprintGen.fromIC(ic);
          if (g && g.ok) r = { pads: g.pads, body: g.body, pkg: ic.package || '', warnings: g.meta.warnings || [] };
        }
        if (!r) r = synthIC(String(c.part || ''));
      }
    } catch (e) { return { ok: false, reason: e.message }; }
    if (!r || !r.pads || !r.pads.length) return { ok: false };
    return {
      ok: true, pads: r.pads, body: r.body, pkg: r.pkg || '',
      meta: { warnings: r.warnings || [], source: '公版教學重建：pattern 推估 footprint（IPC 名目近似，量產以原廠 land pattern 為準）' }
    };
  }

  return { resolve };
})();
