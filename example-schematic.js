/**
 * example-schematic.js — 「範例應用」用真接線圖呈現（而非只有方塊鏈）
 *
 * 做法：不自己畫新電路。取該知識卡「已經驗證過」的拓樸圖（circuits[0].svg），
 *      把 IC 方塊的標籤換成這個範例指名的料號 → 讀者看到的是這顆 IC 怎麼接。
 *
 * 為什麼不逐張手繪：每顆 IC 的實際腳位只有原廠 datasheet 說了算。憑印象畫腳位＝
 *      製造看起來很確定的錯誤（就是電路動畫被整批砍掉的原因）。所以：
 *        - 拓樸：沿用卡片本身已驗證的接法，不新編
 *        - 腳名：該拓樸的標準功能腳（VIN/EN/SW/FB…），不聲稱是該料號的實際 pinout
 *        - 圖下固定標註「典型應用接法，實際腳位以原廠 datasheet 為準」
 *
 * S.ic() 的 IC 標籤畫在框外下方（font-size=10 + bold），所以換較長的料號不會撐破框；
 * 但可能壓到鄰近元件 → 交付前一律用瀏覽器實測驗（鐵律：圖與字不得重疊）。
 */
window.ExampleSchematic = (function () {
  'use strict';

  // 料號樣式：含數字的英數型號（MP2315 / TPS54331 / AMS1117-3.3 / BSS138 / TXS0102）
  const PART_RE = /\b([A-Z][A-Z0-9]{1,}[0-9][A-Z0-9]*(?:-[A-Z0-9.]+)?)\b/g;
  // 這些是規格/標準/協定，不是料號
  const NOT_PART = /^(USB|I2C|SPI|LED|PWM|ADC|DAC|RGB|GPIO|VBUS|CAN|LIN|DDR|EMI|EMC|PCB|SMD|AEC|ISO|IEC|IEEE|IPC|JEDEC|RS485|RS232|UART|LDO|MCU|FPGA|SOC|BOM|ESD|TVS|MOS|FET|BGA|QFN|SOT|SOIC|LQFP|VAC|VDC|RMS|SAR|FOC|BLDC|NTC|PTC|MLCC)/;

  function findPart(ex) {
    const txt = [ex.title, ex.application, ex.circuit].filter(Boolean).join(' ');
    const hits = [...String(txt).matchAll(PART_RE)].map(m => m[1])
      .filter(p => /\d/.test(p) && p.length >= 4 && !NOT_PART.test(p));
    return hits[0] || null;
  }

  // 卡片拓樸圖裡的 IC 標籤：S.ic() 畫成 font-size="10" + font-weight="bold"
  const IC_LABEL_RE = /(<text[^>]*font-size="10"[^>]*font-weight="bold"[^>]*>)([^<]*)(<\/text>)/;

  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // ---------- 內建 IC 應用接法 ----------
  // 只收「接法唯一、教科書標準」的拓樸。卡片本身畫的是分立元件內部原理（如 ldoBasic 畫 pass MOSFET、
  // boost 畫開關管）時，把料號貼上去會是錯的 → 改用這裡的 IC 應用接法重畫。
  const wrapSvg = (w, h, g) =>
    `<svg viewBox="0 0 ${w} ${h}" width="100%" style="max-width:${w}px">${g}</svg>`;

  // 三端 LDO 應用：Vin→Cin→VIN，VOUT→Cout→Vout，GND 接地
  function ldoApp(part) {
    const S = window.Sym; if (!S) return null;
    const cx = 150, cy = 60, ww = 84;
    const leadL = S.pins.icLeadL(cx, ww), leadR = S.pins.icLeadR(cx, ww);
    const vinY = S.icPinY(cy, 2, 0), gndY = S.icPinY(cy, 2, 1), voutY = S.icPinY(cy, 1, 0);
    let g = '';
    g += S.line(16, vinY, leadL, vinY) + S.txt(14, vinY - 9, 'Vin', { anchor: 'start', size: 9, fill: '#64748b' });
    g += S.junction(44, vinY) + S.line(44, vinY, 44, vinY + 14) + S.capacitor(44, vinY + 36, { label: 'Cin' }) + S.ground(44, vinY + 62, {});
    g += S.ic(cx, cy, { width: ww, height: 62, label: part, pinsLeft: ['VIN', 'GND'], pinsRight: ['VOUT'] });
    // GND 腳 → 地（往左下繞開 Cin）
    g += S.line(leadL, gndY, 96, gndY) + S.line(96, gndY, 96, vinY + 76) + S.ground(96, vinY + 76, {});
    // VOUT → Cout → Vout
    g += S.line(leadR, voutY, 268, voutY) + S.txt(272, voutY - 9, 'Vout', { anchor: 'start', size: 9, fill: '#64748b' });
    g += S.junction(240, voutY) + S.line(240, voutY, 240, voutY + 14) + S.capacitor(240, voutY + 36, { label: 'Cout', labelSide: 'right' }) + S.ground(240, voutY + 62, {});
    return wrapSvg(310, vinY + 106, g);
  }

  // Boost IC 應用：Vin→L→SW 節點；SW 節點→D→Vout；Cout 到地；Vout→FB
  function boostApp(part) {
    const S = window.Sym; if (!S) return null;
    const cx = 128, cy = 74, ww = 74;
    const leadL = S.pins.icLeadL(cx, ww), leadR = S.pins.icLeadR(cx, ww);
    const vinY = S.icPinY(cy, 2, 0), enY = S.icPinY(cy, 2, 1);
    const swY = S.icPinY(cy, 2, 0), fbY = S.icPinY(cy, 2, 1);
    const NODE = 214;
    let g = '';
    // Vin → L → SW 節點
    g += S.line(14, 26, 40, 26) + S.txt(12, 19, 'Vin', { anchor: 'start', size: 9, fill: '#64748b' });
    g += S.inductor(64, 26, { label: 'L' });
    g += S.line(88, 26, NODE, 26) + S.junction(NODE, 26);
    // Vin 也供 VIN / EN
    g += S.junction(40, 26) + S.line(40, 26, 40, vinY) + S.line(40, vinY, leadL, vinY);
    g += S.line(leadL, enY, 54, enY) + S.line(54, enY, 54, vinY) + S.junction(54, vinY);
    g += S.ic(cx, cy, { width: ww, height: 62, label: part, pinsLeft: ['VIN', 'EN'], pinsRight: ['SW', 'FB'] });
    // SW 腳 → SW 節點（內部開關對地）
    g += S.line(leadR, swY, NODE, swY) + S.line(NODE, swY, NODE, 26);
    // SW 節點 → D → Vout
    g += S.diode(244, 26, { horizontal: true }) + S.txt(244, 14, 'D', { size: 9, fill: '#64748b' });
    g += S.line(266, 26, 320, 26) + S.txt(324, 19, 'Vout', { anchor: 'start', size: 9, fill: '#64748b' });
    // Cout 標籤放左側：右側是 FB 回授線的回程（x=320），放右邊會被線穿過
    g += S.junction(294, 26) + S.line(294, 26, 294, 44) + S.capacitor(294, 66, { label: 'Cout' }) + S.ground(294, 92, {});
    // FB ← Vout（沿底部）
    const fbB = 130;
    g += S.line(leadR, fbY, leadR + 10, fbY) + S.line(leadR + 10, fbY, leadR + 10, fbB)
      + S.line(leadR + 10, fbB, 320, fbB) + S.line(320, fbB, 320, 26);
    return wrapSvg(360, 150, g);
  }

  // 卡片 → 內建應用拓樸（只在該卡確實是這個拓樸時才套）
  const BUILTIN = [
    { ids: /^(ldo-regulator|ldo-selection|ldo-noise|thermal-design)$/, fn: ldoApp, kind: 'LDO 應用' },
    { ids: /^(boost-converter)$/, fn: boostApp, kind: 'Boost 應用' }
  ];

  /**
   * @param {object} item 知識卡（要有 circuits[0].svg）
   * @param {object} ex   範例（title/application/circuit）
   * @return {{svg:string, part:string, note:string}|null}
   */
  function build(item, ex) {
    const part = findPart(ex);
    if (!part) return null;                       // 沒指名料號就沒必要重畫一張一樣的圖

    // ① 卡片圖本身就有 IC 方塊 → 直接把標籤換成料號（沿用已驗證拓樸）
    const base = item && item.circuits && item.circuits[0] && item.circuits[0].svg;
    if (base && /^<svg/.test(String(base).trim()) && IC_LABEL_RE.test(base)) {
      return {
        svg: base.replace(IC_LABEL_RE, (m, open, old, close) => open + esc(part) + close),
        part,
        note: `典型應用接法（拓樸取自本卡電路圖，IC 標為 ${part}）；腳名為該拓樸標準功能腳，實際腳位以原廠 datasheet 為準。`
      };
    }
    // ② 卡片畫的是分立元件內部原理（沒有 IC 方塊）→ 用內建的 IC 應用接法
    const bi = BUILTIN.find(b => b.ids.test(item && item.id));
    if (bi) {
      const svg = bi.fn(esc(part));
      if (svg) return {
        svg, part,
        note: `${bi.kind}典型接法（IC 標為 ${part}）；腳名為該拓樸標準功能腳，電容值與實際腳位以原廠 datasheet 為準。`
      };
    }
    return null;
  }

  return { build, findPart, _labelRe: IC_LABEL_RE, _ldoApp: ldoApp, _boostApp: boostApp };
})();
