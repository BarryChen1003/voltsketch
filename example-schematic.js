/**
 * example-schematic.js — 「範例應用」畫這個範例自己的應用電路
 *
 * 立場（2026-07-22 修正）：先前版本是把卡片主圖複製一份、只換 IC 標籤 → 同一頁出現兩張
 * 一模一樣的圖，範例區等於沒有存在價值。現在改成只畫「卡片主圖沒有的東西」：
 *   - 這個範例的**實際輸入/輸出電壓**（5V → 3.3V），不是泛用的 Vin/Vout
 *   - **回授分壓 R1/R2**：輸出電壓是被它決定的，卡片教學圖沒畫，這才是應用重點
 *   - 該範例指名的**料號**
 *
 * 硬性條件：抽不出「兩個不同電壓」或認不出拓樸 → 回傳 null，交給方塊鏈圖。
 * 寧可少畫，也不要再產生一張跟主圖重複的圖。
 *
 * 誠實界定：拓樸是該類轉換器的標準應用接法；腳名是標準功能腳；R1/R2 只標示分壓關係，
 * 不給具體阻值（阻值取決於該 IC 的 VFB，是料號相依的，不憑印象編）。
 */
window.ExampleSchematic = (function () {
  'use strict';

  const PART_RE = /\b([A-Z][A-Z0-9]{1,}[0-9][A-Z0-9]*(?:-[A-Z0-9.]+)?)\b/g;
  const NOT_PART = /^(USB|I2C|SPI|LED|PWM|ADC|DAC|RGB|GPIO|VBUS|CAN|LIN|DDR|EMI|EMC|PCB|SMD|AEC|ISO|IEC|IEEE|IPC|JEDEC|RS485|RS232|UART|LDO|MCU|FPGA|SOC|BOM|ESD|TVS|MOS|FET|BGA|QFN|SOT|SOIC|LQFP|VAC|VDC|RMS|SAR|FOC|BLDC|NTC|PTC|MLCC|CC|CV)/;

  const txtOf = ex => [ex && ex.title, ex && ex.application, ex && ex.circuit].filter(Boolean).join(' ');

  function findPart(ex) {
    const hits = [...String(txtOf(ex)).matchAll(PART_RE)].map(m => m[1])
      .filter(p => /\d/.test(p) && p.length >= 4 && !NOT_PART.test(p));
    return hits[0] || null;
  }

  // 抽「A → B」電壓對：先找 "5V to 3.3V" / "3.3V→1.8V" 這種明確配對，退而求其次取前兩個相異電壓
  function findRails(ex) {
    const t = String(txtOf(ex));
    const pair = t.match(/(\d+(?:\.\d+)?)\s*V\s*(?:to|→|轉|-->|➜)\s*[±]?(\d+(?:\.\d+)?)\s*V/i);
    if (pair) return { vin: pair[1] + 'V', vout: (/±/.test(pair[0]) ? '±' : '') + pair[2] + 'V' };
    const all = [...t.matchAll(/(\d+(?:\.\d+)?)\s*V\b/gi)].map(m => m[1]);
    const uniq = [...new Set(all)];
    if (uniq.length >= 2) return { vin: uniq[0] + 'V', vout: uniq[1] + 'V' };
    return null;
  }

  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const wrapSvg = (w, h, g) => `<svg viewBox="0 0 ${w} ${h}" width="100%" style="max-width:${w}px">${g}</svg>`;

  // ---------- 應用電路（皆含實際電壓 + 回授分壓，卡片主圖沒有） ----------

  // Buck 應用：Vin→Cin→VIN；SW→L→Vout；Cout；Vout→R1→FB→R2→GND
  function buckApp(part, vin, vout) {
    const S = window.Sym; if (!S) return null;
    const cx = 132, cy = 62, ww = 76;
    const leadL = S.pins.icLeadL(cx, ww), leadR = S.pins.icLeadR(cx, ww);
    const vinY = S.icPinY(cy, 2, 0), enY = S.icPinY(cy, 2, 1);
    const swY = S.icPinY(cy, 2, 0), fbY = S.icPinY(cy, 2, 1);
    const NODE = 208, VOUT = 300;
    let g = '';
    // 輸入
    g += S.line(16, vinY, leadL, vinY) + S.txt(14, vinY - 10, esc(vin), { anchor: 'start', size: 10, weight: 'bold', fill: '#0e9f6e' });
    g += S.junction(46, vinY) + S.line(46, vinY, 46, vinY + 14) + S.capacitor(46, vinY + 36, { label: 'Cin' }) + S.ground(46, vinY + 62, {});
    g += S.line(leadL, enY, 62, enY) + S.line(62, enY, 62, vinY) + S.junction(62, vinY);
    g += S.ic(cx, cy, { width: ww, height: 60, label: esc(part), pinsLeft: ['VIN', 'EN'], pinsRight: ['SW', 'FB'] });
    // SW → L → Vout
    g += S.line(leadR, swY, NODE, swY) + S.junction(NODE, swY);
    g += S.line(NODE, swY, 232, swY) + S.inductor(256, swY, { label: 'L' }) + S.line(280, swY, VOUT, swY);
    g += S.junction(VOUT, swY) + S.line(VOUT, swY, 342, swY);
    g += S.txt(346, swY - 10, esc(vout), { anchor: 'start', size: 10, weight: 'bold', fill: '#0e9f6e' });
    // 續流二極體
    g += S.line(NODE, swY, NODE, swY + 12)
      + `<g transform="rotate(-90 ${NODE} ${swY + 27})">${S.diode(NODE, swY + 27, {})}</g>`
      + S.ground(NODE, swY + 60, {}) + S.txt(NODE + 15, swY + 30, 'D', { anchor: 'start', size: 9, fill: '#64748b' });
    // Cout
    g += S.line(VOUT, swY, VOUT, swY + 14) + S.capacitor(VOUT, swY + 36, { label: 'Cout', labelSide: 'right' }) + S.ground(VOUT, swY + 62, {});
    // 回授分壓：Vout → R1 → FB 節點 → R2 → GND；FB 節點回 IC
    // 水平回程走 y=126：IC 標籤畫在框外下方（cy+h/2+14≈106），走 108 會直接穿過標籤。
    const RX = 150, RUN = 126, r1y = 152, fbN = 182, r2y = 212;
    g += S.line(VOUT, swY, VOUT, RUN) + S.line(VOUT, RUN, RX, RUN) + S.line(RX, RUN, RX, r1y - 24);
    g += S.resistor(RX, r1y, { horizontal: false, label: 'R1' });
    g += S.line(RX, r1y + 24, RX, fbN) + S.junction(RX, fbN);
    g += S.resistor(RX, r2y, { horizontal: false, label: 'R2' }) + S.line(RX, fbN, RX, r2y - 24);
    g += S.line(RX, r2y + 24, RX, 248) + S.ground(RX, 248, {});
    // FB 節點 → IC FB 腳（走 x=leadR+12 的垂直回程）
    g += S.line(RX, fbN, leadR + 12, fbN) + S.line(leadR + 12, fbN, leadR + 12, fbY) + S.line(leadR + 12, fbY, leadR, fbY);
    return wrapSvg(400, 274, g);
  }

  // Boost 應用：Vin→L→SW 節點→D→Vout；Cout；回授分壓
  function boostApp(part, vin, vout) {
    const S = window.Sym; if (!S) return null;
    const cx = 128, cy = 74, ww = 74;
    const leadL = S.pins.icLeadL(cx, ww), leadR = S.pins.icLeadR(cx, ww);
    const vinY = S.icPinY(cy, 2, 0), enY = S.icPinY(cy, 2, 1);
    const swY = S.icPinY(cy, 2, 0), fbY = S.icPinY(cy, 2, 1);
    const NODE = 206, VOUT = 300;
    let g = '';
    g += S.line(14, 26, 40, 26) + S.txt(12, 16, esc(vin), { anchor: 'start', size: 10, weight: 'bold', fill: '#0e9f6e' });
    g += S.inductor(64, 26, { label: 'L' }) + S.line(88, 26, NODE, 26) + S.junction(NODE, 26);
    g += S.junction(40, 26) + S.line(40, 26, 40, vinY) + S.line(40, vinY, leadL, vinY);
    g += S.line(leadL, enY, 56, enY) + S.line(56, enY, 56, vinY) + S.junction(56, vinY);
    g += S.ic(cx, cy, { width: ww, height: 60, label: esc(part), pinsLeft: ['VIN', 'EN'], pinsRight: ['SW', 'FB'] });
    g += S.line(leadR, swY, NODE, swY) + S.line(NODE, swY, NODE, 26);
    g += S.diode(236, 26, { horizontal: true }) + S.txt(236, 15, 'D', { size: 9, fill: '#64748b' });
    g += S.line(258, 26, VOUT, 26) + S.junction(VOUT, 26) + S.line(VOUT, 26, 342, 26);
    g += S.txt(346, 16, esc(vout), { anchor: 'start', size: 10, weight: 'bold', fill: '#0e9f6e' });
    g += S.line(VOUT, 26, VOUT, 44) + S.capacitor(VOUT, 66, { label: 'Cout', labelSide: 'right' }) + S.ground(VOUT, 92, {});
    // 回授分壓（水平回程避開 IC 標籤：標籤在 cy+h/2+14≈118）
    const RX = 150, RUN = 138, r1y = 164, fbN = 194, r2y = 224;
    g += S.line(VOUT, 26, VOUT, RUN) + S.line(VOUT, RUN, RX, RUN) + S.line(RX, RUN, RX, r1y - 24);
    g += S.resistor(RX, r1y, { horizontal: false, label: 'R1' });
    g += S.line(RX, r1y + 24, RX, fbN) + S.junction(RX, fbN);
    g += S.resistor(RX, r2y, { horizontal: false, label: 'R2' }) + S.line(RX, fbN, RX, r2y - 24);
    g += S.line(RX, r2y + 24, RX, 260) + S.ground(RX, 260, {});
    g += S.line(RX, fbN, leadR + 12, fbN) + S.line(leadR + 12, fbN, leadR + 12, fbY) + S.line(leadR + 12, fbY, leadR, fbY);
    return wrapSvg(400, 286, g);
  }

  // LDO 應用：固定輸出型（AMS1117-3.3 這類），重點在 Cin/Cout 與壓差發熱
  function ldoApp(part, vin, vout) {
    const S = window.Sym; if (!S) return null;
    const cx = 150, cy = 56, ww = 88;
    const leadL = S.pins.icLeadL(cx, ww), leadR = S.pins.icLeadR(cx, ww);
    const vinY = S.icPinY(cy, 2, 0), gndY = S.icPinY(cy, 2, 1), voutY = S.icPinY(cy, 1, 0);
    let g = '';
    g += S.line(16, vinY, leadL, vinY) + S.txt(14, vinY - 10, esc(vin), { anchor: 'start', size: 10, weight: 'bold', fill: '#0e9f6e' });
    g += S.junction(46, vinY) + S.line(46, vinY, 46, vinY + 14) + S.capacitor(46, vinY + 36, { label: 'Cin' }) + S.ground(46, vinY + 62, {});
    g += S.ic(cx, cy, { width: ww, height: 58, label: esc(part), pinsLeft: ['VIN', 'GND'], pinsRight: ['VOUT'] });
    g += S.line(leadL, gndY, 100, gndY) + S.line(100, gndY, 100, vinY + 76) + S.ground(100, vinY + 76, {});
    g += S.line(leadR, voutY, 300, voutY) + S.txt(304, voutY - 10, esc(vout), { anchor: 'start', size: 10, weight: 'bold', fill: '#0e9f6e' });
    g += S.junction(264, voutY) + S.line(264, voutY, 264, voutY + 14) + S.capacitor(264, voutY + 36, { label: 'Cout', labelSide: 'right' }) + S.ground(264, voutY + 62, {});
    // 壓差發熱：這是 LDO 應用最關鍵、卡片教學圖不會標的實務數字關係
    const dv = (parseFloat(vin) - parseFloat(vout));
    if (isFinite(dv) && dv > 0)
      g += S.txt(200, vinY + 108, `壓差 ${vin}−${vout} = ${(Math.round(dv * 100) / 100)}V，全部×I 變成熱`, { size: 9, fill: '#d97706' });
    return wrapSvg(360, vinY + 128, g);
  }

  // 卡片 → 拓樸（只有這幾類的應用接法是唯一且標準的，其餘不畫）
  function topoOf(item) {
    const id = (item && item.id) || '';
    if (/buck-boost/.test(id)) return null;                 // 雙輸出/反相變體多，不憑印象畫
    if (/ldo/.test(id)) return ldoApp;
    if (/boost/.test(id)) return boostApp;
    if (/buck|switch|dc-dc|regulator/.test(id)) return buckApp;
    return null;
  }

  /**
   * @return {{svg:string, part:string, note:string}|null}
   */
  function build(item, ex) {
    const part = findPart(ex);
    let rails = findRails(ex);
    // 沒料號或沒有明確的輸入→輸出電壓 → 畫不出「範例專屬」的東西，交給方塊鏈圖
    if (!part || !rails || rails.vin === rails.vout) return null;
    const fn = topoOf(item);
    if (!fn) return null;

    // 電壓方向必須與拓樸相符：LDO/Buck 只能降壓、Boost 只能升壓。
    // 抽取可能取錯順序（標題「3.3V 穩壓」＋內文「從 5V 產生 3.3V」會先抓到 3.3V）→ 這裡校正。
    const nv = s => parseFloat(String(s).replace(/[^\d.]/g, ''));
    const a = nv(rails.vin), b = nv(rails.vout);
    if (isFinite(a) && isFinite(b)) {
      const stepUp = fn === boostApp;
      if (stepUp ? a > b : a < b) rails = { vin: rails.vout, vout: rails.vin };   // 反了就對調
      const a2 = nv(rails.vin), b2 = nv(rails.vout);
      if (stepUp ? a2 >= b2 : a2 <= b2) return null;   // 對調後仍矛盾 → 資料不足，不硬畫
    }

    const svg = fn(part, rails.vin, rails.vout);
    if (!svg) return null;
    const kind = fn === ldoApp ? 'LDO' : fn === boostApp ? 'Boost' : 'Buck';
    return {
      svg, part,
      note: `${part} 的 ${kind} 應用接法：${rails.vin} → ${rails.vout}。`
        + (fn === ldoApp ? 'Cin/Cout 容值依 datasheet 穩定度要求選。'
          : 'R1/R2 決定輸出電壓，比值依該 IC 的 VFB 由 datasheet 計算。')
        + '腳名為標準功能腳，實際腳位以原廠 datasheet 為準。'
    };
  }

  return { build, findPart, findRails, _buck: buckApp, _boost: boostApp, _ldo: ldoApp };
})();
