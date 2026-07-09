/**
 * footprint-gen.js — IC 庫參數化 footprint 產生器（IPC-7351 名目密度「近似」）
 * 用途：把 ic-data.js 條目變成可放上 PCB Layout 的真 pad 幾何（取代方框示意）。
 * 誠實界定：尺寸缺漏時用「家族＋腳數」預設表推估，回傳 meta.warnings 標明；
 * 量產前應以原廠 datasheet 的 land pattern 章節覆核。
 * 座標：元件中心為原點，mm，y 向下（與 pcbApp/KiCad 匯入一致）。
 * pad 欄位與 kicad-io 匯入相同 schema：{num,name,x,y,rot,w,h,shape,drill,side,type,net,rr,cu}
 */
window.FootprintGen = (function () {
  'use strict';

  const STD_PITCH = [0.35, 0.4, 0.5, 0.65, 0.8, 0.95, 1.0, 1.27, 2.54];
  const snapPitch = p => STD_PITCH.reduce((a, b) => Math.abs(b - p) < Math.abs(a - p) ? b : a);

  // 家族判定（第一個封裝為準；「A / B」複列取 A）
  function parsePackage(str) {
    const s = String(str || '').split('/')[0];
    const famM = s.match(/(DHVQFN|HVQFN|WQFN|VQFN|HR-?QFN|QFN|HTSSOP|TSSOP|MSOP|VSSOP|SSOP|SOIC|SOP\b|SC-?70|SOT-?23|SOT\b|X2SON|WSON|SON\b|WDFN|DFN|TLGA|LGA|DSBGA|FCBGA|BGA|HTQFP|TQFP|LQFP|QFP|PDIP|DIP|CFP|DFP|SO(?=\d))/i);
    let fam = famM ? famM[1].toUpperCase().replace('-', '') : null;
    // 別名歸位：SO14→SOIC、CFP/DFP（陶瓷/雙列 flatpack）→SOIC 型雙列、DHVQFN→QFN
    if (fam === 'SO') fam = 'SOIC';
    if (fam === 'CFP' || fam === 'DFP') fam = 'CFP';
    if (fam === 'DHVQFN') fam = 'QFN';
    const cntM = s.match(/(\d{1,3})\s*[-–]?\s*(?:pin|Pin|腳)/) || s.match(/[A-Z](?:QFN|SON|DFN|SOIC|SSOP|SOP|SOT|QFP|GA)[^\d]{0,6}(\d{1,3})/i) || s.match(/-(\d{1,3})\b/);
    const dimM = s.match(/(\d+(?:\.\d+)?)\s*[×x]\s*(\d+(?:\.\d+)?)\s*mm/);
    const pitchM = s.match(/(\d\.\d+)\s*mm\s*pitch/i);
    return {
      fam,
      count: cntM ? parseInt(cntM[1]) : null,
      bw: dimM ? parseFloat(dimM[1]) : null,
      bh: dimM ? parseFloat(dimM[2]) : null,
      pitch: pitchM ? parseFloat(pitchM[1]) : null
    };
  }

  // 家族分類
  const QUAD_NL = ['QFN', 'WQFN', 'VQFN', 'HVQFN', 'HRQFN'];
  const DUAL_GW = ['SOIC', 'TSSOP', 'HTSSOP', 'MSOP', 'VSSOP', 'SSOP', 'SOP', 'SOT23', 'SOT', 'SC70', 'CFP'];
  const DUAL_NL = ['WSON', 'SON', 'WDFN', 'DFN', 'X2SON'];
  const QUAD_GW = ['HTQFP', 'TQFP', 'LQFP', 'QFP'];
  const GRID = ['LGA', 'TLGA', 'BGA', 'DSBGA', 'FCBGA'];
  const THT_DUAL = ['PDIP', 'DIP'];

  // 家族預設（body 寬 mm、pitch mm、pad 長）——缺尺寸時用
  const DUAL_DEFAULTS = {
    SOIC: { bw: 3.9, pitch: 1.27, padL: 1.55, padHalfSpanExtra: 1.5 },
    SOP: { bw: 7.5, pitch: 1.27, padL: 1.8, padHalfSpanExtra: 1.9 },
    TSSOP: { bw: 4.4, pitch: 0.65, padL: 1.35, padHalfSpanExtra: 1.2 },
    HTSSOP: { bw: 4.4, pitch: 0.65, padL: 1.35, padHalfSpanExtra: 1.2 },
    MSOP: { bw: 3.0, pitch: 0.65, padL: 1.3, padHalfSpanExtra: 1.1 },
    VSSOP: { bw: 3.0, pitch: 0.5, padL: 1.3, padHalfSpanExtra: 1.1 },
    SSOP: { bw: 5.3, pitch: 0.65, padL: 1.5, padHalfSpanExtra: 1.3 },
    SOT23: { bw: 1.6, pitch: 0.95, padL: 1.1, padHalfSpanExtra: 1.0 },
    SOT: { bw: 1.6, pitch: 0.65, padL: 1.1, padHalfSpanExtra: 1.0 },
    SC70: { bw: 1.25, pitch: 0.65, padL: 0.9, padHalfSpanExtra: 0.8 },
    CFP: { bw: 6.9, pitch: 1.27, padL: 1.8, padHalfSpanExtra: 1.8 },
    PDIP: { bw: 6.35, pitch: 2.54, padL: 0, padHalfSpanExtra: 1.15 },
    DIP: { bw: 6.35, pitch: 2.54, padL: 0, padHalfSpanExtra: 1.15 }
  };

  // 數字腳集合（排除 EP/非數字）
  function numericPins(ic) {
    return (ic.pins || []).filter(p => !p.ep && /^\d+$/.test(String(p.num).trim()));
  }
  function epPin(ic) {
    return (ic.pins || []).find(p => p.ep);
  }

  const mkPad = (num, name, x, y, w, h, extra) => Object.assign(
    { num: String(num), name: name || '', x: r2(x), y: r2(y), rot: 0, w: r2(w), h: r2(h), shape: 'roundrect', rr: 0.25, drill: 0, side: 'F', type: 'smd', net: '', cu: true }, extra || {});
  const r2 = v => Math.round(v * 1000) / 1000;

  // ---- 四邊無鉛（QFN 系）----
  function quadNoLead(ic, pk, warn) {
    const pins = numericPins(ic);
    const n = pins.length;
    if (n % 4 !== 0) { warn.push('腳數 ' + n + ' 非 4 倍數，改用雙列近似'); return dualGullwing(ic, pk, warn, 'TSSOP'); }
    const per = n / 4;
    let bw = pk.bw, bh = pk.bh;
    let pitch = pk.pitch;
    if (!pitch && bw) pitch = snapPitch((Math.min(bw, bh || bw) - 1.5) / (per - 1));
    if (!pitch) { pitch = 0.5; warn.push('pitch 未載，預設 0.5mm'); }
    if (!bw) { bw = bh = r2(per * pitch + 1.6); warn.push('封裝尺寸未載，依腳數推估 ' + bw + 'mm'); }
    if (!bh) bh = bw;
    const padL = 0.9, padW = Math.min(0.6 * pitch, pitch - 0.2);
    const half = i => (i - (per - 1) / 2) * pitch;
    const pads = [];
    const byNum = {}; pins.forEach(p => byNum[+p.num] = p);
    for (let k = 1; k <= n; k++) {
      const p = byNum[k];
      if (!p) { warn.push('缺 pin ' + k); continue; }
      let x, y, w, h;
      if (k <= per) { x = -bw / 2; y = half(k - 1); w = padL; h = padW; }               // 左（上→下）
      else if (k <= 2 * per) { x = half(k - per - 1); y = bh / 2; w = padW; h = padL; } // 下（左→右）
      else if (k <= 3 * per) { x = bw / 2; y = -half(k - 2 * per - 1); w = padL; h = padW; } // 右（下→上）
      else { x = -half(k - 3 * per - 1); y = -bh / 2; w = padW; h = padL; }             // 上（右→左）
      pads.push(mkPad(k, p.name, x, y, w, h));
    }
    const ep = epPin(ic);
    if (ep) pads.push(mkPad(ep.num, ep.name, 0, 0, r2(bw * 0.55), r2(bh * 0.55), { shape: 'rect', rr: 0 }));
    return { pads, body: { w: bw, h: bh }, meta: { family: 'QFN', pitch } };
  }

  // ---- 雙列（翼腳/無鉛/DIP 通用）----
  function dualGullwing(ic, pk, warn, famOverride) {
    const pins = numericPins(ic);
    const n = pins.length;
    if (n % 2 !== 0) warn.push('腳數 ' + n + ' 非偶數，右列少一腳');
    const per = Math.ceil(n / 2);
    const fam = famOverride || pk.fam;
    const d = DUAL_DEFAULTS[fam] || DUAL_DEFAULTS.SOIC;
    const pitch = pk.pitch || d.pitch;
    const bw = pk.bw || d.bw;
    const bh = pk.bh || r2((per - 1) * pitch + 1.6);
    const tht = THT_DUAL.includes(fam);
    const noLead = DUAL_NL.includes(fam);
    const padL = noLead ? 0.8 : d.padL;
    const padW = tht ? 1.5 : Math.min(0.6 * pitch, pitch - 0.15);
    const xC = noLead ? bw / 2 - padL / 2 + 0.2 : bw / 2 + d.padHalfSpanExtra - padL / 2;
    const half = i => (i - (per - 1) / 2) * pitch;
    const pads = [];
    const byNum = {}; pins.forEach(p => byNum[+p.num] = p);
    for (let k = 1; k <= n; k++) {
      const p = byNum[k];
      if (!p) { warn.push('缺 pin ' + k); continue; }
      const left = k <= per;
      const idx = left ? k - 1 : (n - k);           // 右列由下往上
      const x = left ? -xC : xC;
      const y = half(idx);
      pads.push(tht
        ? mkPad(k, p.name, x, y, 1.6, 1.6, { shape: 'circle', drill: 0.8, type: 'thru_hole', side: '*' })
        : mkPad(k, p.name, x, y, padL, padW));
    }
    const ep = epPin(ic);
    if (ep) pads.push(mkPad(ep.num, ep.name, 0, 0, r2(bw * 0.5), r2(bh * 0.55), { shape: 'rect', rr: 0 }));
    return { pads, body: { w: bw, h: bh }, meta: { family: fam, pitch } };
  }

  // ---- 四邊翼腳（QFP 系）----
  function quadGullwing(ic, pk, warn) {
    const r = quadNoLead(ic, Object.assign({}, pk, { pitch: pk.pitch || 0.5 }), warn);
    if (!r) return null;
    // 翼腳向外延伸：pad 中心外移、加長
    const bw = r.body.w, bh = r.body.h;
    for (const p of r.pads) {
      if (p.shape === 'rect' && p.rr === 0) continue; // EP
      if (Math.abs(Math.abs(p.x) - bw / 2) < 0.6) { p.x = r2(Math.sign(p.x) * (bw / 2 + 0.6)); p.w = r2(p.w + 0.5); }
      else { p.y = r2(Math.sign(p.y) * (bh / 2 + 0.6)); p.h = r2(p.h + 0.5); }
    }
    r.meta.family = 'QFP';
    return r;
  }

  // ---- 格狀（LGA/BGA，球號 A1..K10；JEDEC 列字母跳 I,O,Q,S,X,Z）----
  const ROWS = 'ABCDEFGHJKLMNPRTUVWY';
  function grid(ic, pk, warn) {
    const balls = (ic.pins || []).filter(p => !p.ep && /^[A-Z]{1,2}\d{1,2}$/.test(String(p.num).trim()));
    if (balls.length < 4) return null;
    let maxR = 0, maxC = 0;
    const parsed = [];
    for (const p of balls) {
      const m = String(p.num).match(/^([A-Z]{1,2})(\d{1,2})$/);
      const ri = ROWS.indexOf(m[1]);
      if (ri < 0) { warn.push('球號列字母 ' + m[1] + ' 超出支援'); return null; }
      const ci = parseInt(m[2]) - 1;
      maxR = Math.max(maxR, ri); maxC = Math.max(maxC, ci);
      parsed.push({ p, ri, ci });
    }
    const rows = maxR + 1, cols = maxC + 1;
    let pitch = pk.pitch;
    if (!pitch && pk.bw) pitch = snapPitch(Math.min(pk.bw / cols, (pk.bh || pk.bw) / rows));
    if (!pitch) { pitch = 0.5; warn.push('pitch 未載，預設 0.5mm'); }
    const bw = pk.bw || r2(cols * pitch), bh = pk.bh || r2(rows * pitch);
    const d = r2(pitch * 0.55);
    const pads = parsed.map(({ p, ri, ci }) =>
      mkPad(p.num, p.name, (ci - (cols - 1) / 2) * pitch, (ri - (rows - 1) / 2) * pitch, d, d, { shape: 'circle', rr: 0 }));
    return { pads, body: { w: bw, h: bh }, meta: { family: 'GRID', pitch, rows, cols } };
  }

  function fromIC(ic) {
    const warn = [];
    const pk = parsePackage(ic.package);
    if (!pk.fam) return { ok: false, reason: '封裝家族無法辨識：' + (ic.package || '(空)') };
    let r = null;
    try {
      if (GRID.includes(pk.fam)) r = grid(ic, pk, warn);
      else if (QUAD_NL.includes(pk.fam)) r = quadNoLead(ic, pk, warn);
      else if (QUAD_GW.includes(pk.fam)) r = quadGullwing(ic, pk, warn);
      else if (DUAL_GW.includes(pk.fam) || DUAL_NL.includes(pk.fam) || THT_DUAL.includes(pk.fam)) r = dualGullwing(ic, pk, warn);
    } catch (e) { return { ok: false, reason: '產生失敗：' + e.message }; }
    if (!r || !r.pads.length) return { ok: false, reason: '此封裝腳號型態不支援參數化（如角落腳/混合編號）' };
    // 腳數核對：數字腳全進 pad 才算成功
    const expect = numericPins(ic).length + (epPin(ic) ? 1 : 0);
    if (r.pads.length !== expect) warn.push('pad 數 ' + r.pads.length + ' ≠ 條目腳數 ' + expect);
    r.ok = true;
    r.meta.source = '參數化 IPC-7351 名目近似（量產前以原廠 land pattern 覆核）';
    r.meta.warnings = warn;
    return r;
  }

  return { fromIC, parsePackage };
})();
