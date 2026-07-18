/**
 * vs-model.js — HardwareAI 標準資料模型 v1
 *  A) HardwareAISymbolModel：單顆 IC 符號的正式模型（pin 座標、標準電氣型別、graphics、preserved）。
 *     由 ic-data.js 的 entry 正規化（normalizeIC）而來；所有匯出 adapter（vs-adapters.js）
 *     一律吃這個模型，不直接吃 ic-data —— 之後擴格式只動 adapter，不動資料。
 *  B) HardwareAIDesign v1：整體設計檔中繼格式（sources/components/schematic/board/preserved）。
 *     preserved 原則：不認識的資料原樣保存、匯出時合併回去，不 silent loss。
 *  單位：內部座標 mil，格線 100 mil（與 KiCad/OrCAD 格線相容；KiCad adapter 再換算 mm）。
 */
window.VSModel = (function () {
  const SCHEMA_VERSION = '1.0';
  const GRID = 100;   // mil；pin 一律落格線（EDA 匯出鐵則：pin 不在格線 = 線接不到）
  const PITCH = 100;  // pin 間距（mil）
  const LEAD = 100;   // pin 腳長（mil）

  // ---- 標準電氣型別 enum ----
  // power_in | ground | analog_in | analog_out | analog_io | digital_in | digital_out |
  // bidirectional | open_drain | passive | no_connect
  const ETYPES = ['power_in', 'ground', 'analog_in', 'analog_out', 'analog_io',
    'digital_in', 'digital_out', 'bidirectional', 'open_drain', 'passive', 'no_connect'];

  function electricalType(p) {
    const t = String(p.type || ''), n = String(p.name || ''), tn = t + ' ' + n;
    if (p.ep || /Ground|GND/.test(t) || /^GND\d*$/.test(n) || /^[AP]GND\d*$/.test(n)) return 'ground';
    if (/No Connect|^NC$|^DNC$/i.test(t) || /^NC$|^DNC$/.test(n)) return 'no_connect';
    if (/Power|Supply|VDD|VCC|AVDD|DVDD|PVDD|IOVDD|VBAT|VIN\b|VSUP|VSS/.test(tn)) return 'power_in';
    if (/開汲|open.?drain/i.test(t)) return 'open_drain';
    if (/I\/O|IO\b|GPIO|SDA/.test(t)) {
      return /Analog/i.test(t) ? 'analog_io' : 'bidirectional';
    }
    if (/Analog In/i.test(t)) return 'analog_in';
    if (/Analog Out/i.test(t)) return 'analog_out';
    if (/Digital In|^In\b/i.test(t)) return 'digital_in';
    if (/Digital Out|^Out\b/i.test(t)) return 'digital_out';
    if (/In\b/.test(t)) return 'digital_in';
    if (/Out\b/.test(t)) return 'digital_out';
    return 'passive';
  }

  // ---- ic-data entry → HardwareAISymbolModel ----
  // 座標系：符號中心 (0,0)；L/R 腳依陣列順序上→下、T/B 左→右（同 ic-symbol.js / ic-export.js 慣例）。
  const KNOWN_FIELDS = ['part', 'mfr', 'category', 'subcategory', 'package', 'whatIs', 'func',
    'usedIn', 'desc', 'datasheet', 'pins', 'thermalPad', 'specs', 'secondSource', 'dropIn'];

  function normalizeIC(ic) {
    const g = { L: [], R: [], T: [], B: [] };
    (ic.pins || []).forEach(p => (g[p.side] || g.L).push(p));
    const nL = g.L.length, nR = g.R.length, nT = g.T.length, nB = g.B.length;
    // 腳位置一律取 PITCH 整數倍（偶數腳邊不做半格置中 —— 半格會脫離格線）：
    //   垂直邊：y = top - i*PITCH，top = ceil((n-1)/2)*PITCH
    //   水平邊：x = -left + i*PITCH，left = ceil((n-1)/2)*PITCH
    const topOf = n => Math.ceil((n - 1) / 2) * PITCH;
    const halfH = topOf(Math.max(nL, nR, 1)) + PITCH;
    const halfW = topOf(Math.max(nT, nB, 1)) + PITCH;

    const pins = [];
    const push = (p, x, y, side, orient) => pins.push({
      number: String(p.num),
      name: String(p.name),
      electricalType: electricalType(p),
      rawType: p.type || '',
      description: p.desc || '',
      isExposedPad: !!p.ep,
      x, y, side, orientation: orient, length: LEAD
    });
    g.L.forEach((p, i) => push(p, -(halfW + LEAD), topOf(nL) - i * PITCH, 'left', 0));
    g.R.forEach((p, i) => push(p, +(halfW + LEAD), topOf(nR) - i * PITCH, 'right', 180));
    g.T.forEach((p, i) => push(p, -topOf(nT) + i * PITCH, +(halfH + LEAD), 'top', 270));
    g.B.forEach((p, i) => push(p, -topOf(nB) + i * PITCH, -(halfH + LEAD), 'bottom', 90));

    // 不在 KNOWN_FIELDS 的欄位 → preserved（不丟資料）
    const vendorProperties = {};
    Object.keys(ic).forEach(k => { if (!KNOWN_FIELDS.includes(k)) vendorProperties[k] = ic[k]; });

    return {
      schemaVersion: SCHEMA_VERSION,
      id: (ic.part || '') + (ic.package ? '_' + String(ic.package).split(/[\s(]/)[0] : ''),
      partNumber: ic.part || '',
      manufacturer: ic.mfr || '',
      category: ic.category || '',
      package: ic.package || '',
      footprint: '',                       // 之後 footprint 模型補
      datasheet: ic.datasheet || '',
      body: { x: -halfW, y: -halfH, width: halfW * 2, height: halfH * 2 },
      pins,
      powerPins: pins.filter(p => p.electricalType === 'power_in').map(p => p.name),
      groundPins: pins.filter(p => p.electricalType === 'ground').map(p => p.name),
      interfaces: detectInterfaces(ic),
      replacements: (ic.dropIn || []).map(d => ({ partNumber: d.part, note: d.note || '' })),
      graphics: [{ type: 'rect', x: -halfW, y: -halfH, width: halfW * 2, height: halfH * 2 }],
      properties: {
        value: ic.part || '', description: ic.desc || '',
        whatIs: ic.whatIs || '', func: ic.func || '', usedIn: ic.usedIn || '',
        subcategory: ic.subcategory || ''
      },
      specs: ic.specs || [],
      secondSource: ic.secondSource || [],
      preserved: { rawBlocks: [], unknownObjects: [], vendorProperties }
    };
  }

  function detectInterfaces(ic) {
    const names = (ic.pins || []).map(p => String(p.name)).join(' ');
    const out = [];
    if (/SDA|SCL\b/.test(names)) out.push('I2C');
    if (/SCLK|SDI\b|SDO\b|MOSI|MISO|\bCS\b|nCS/.test(names)) out.push('SPI');
    if (/CANH|CANL/.test(names)) out.push('CAN');
    if (/TXD|RXD/.test(names)) out.push('UART/LIN');
    if (/FSYNC|SBCLK|SDIN/.test(names)) out.push('I2S/TDM');
    return out;
  }

  // ---- 驗證（匯出前必跑）----
  function validateSymbol(m) {
    const errors = [];
    if (!m.partNumber) errors.push('partNumber 空');
    if (!m.pins || !m.pins.length) errors.push('無 pin');
    const nums = (m.pins || []).map(p => p.number);
    if (new Set(nums).size !== nums.length) errors.push('pin number 重複');
    (m.pins || []).forEach(p => {
      if (!p.name) errors.push('pin ' + p.number + ' 名稱空');
      if (!ETYPES.includes(p.electricalType)) errors.push('pin ' + p.number + ' 電氣型別非法: ' + p.electricalType);
      if (p.x % GRID !== 0 || p.y % GRID !== 0) errors.push('pin ' + p.number + ' 不在格線 (' + p.x + ',' + p.y + ')');
    });
    return { ok: errors.length === 0, errors };
  }

  // ---- 固定尺寸縮放（不開放任意倍率，保證落格線）----
  const SCALES = { compact: 0.5, normal: 1, large: 2 };
  function scaleSymbol(m, sizeName) {
    const s = SCALES[sizeName] || 1;
    if (s === 1) return m;
    const sc = v => Math.round(v * s / GRID) * GRID;  // 縮放後仍對齊格線
    return {
      ...m,
      body: { x: sc(m.body.x), y: sc(m.body.y), width: sc(m.body.width), height: sc(m.body.height) },
      pins: m.pins.map(p => ({ ...p, x: sc(p.x), y: sc(p.y), length: Math.max(GRID, sc(p.length)) })),
      graphics: m.graphics.map(g => g.type === 'rect'
        ? { ...g, x: sc(g.x), y: sc(g.y), width: sc(g.width), height: sc(g.height) } : g)
    };
  }

  // ---- HardwareAIDesign v1 骨架 ----
  function newDesign() {
    return {
      schemaVersion: SCHEMA_VERSION,
      sources: [],
      components: [],
      symbols: {},
      footprints: {},
      nets: [],
      schematic: { pages: [], wires: [], labels: [], junctions: [] },
      board: { layers: [], tracks: [], vias: [], pads: [], zones: [], texts: [], outlines: [] },
      preserved: { rawBlocks: [], unknownObjects: [], vendorProperties: {} }
    };
  }

  return { SCHEMA_VERSION, GRID, ETYPES, normalizeIC, validateSymbol, scaleSymbol, newDesign, electricalType };
})();
