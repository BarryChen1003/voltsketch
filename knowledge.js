// === 電路圖建構器（用 schematic-symbols.js 真實符號，避免框框/文字壓圖）===
// 回傳純 SVG 字串，可正常存入 localStorage。
const CircuitSVG = {
  wrap(w, h, inner) {
    return `<svg viewBox="0 0 ${w} ${h}" width="100%" style="max-width:${w}px">${inner}</svg>`;
  },

  // Level Shift（BSS138 雙向電平轉換）
  levelShift() {
    const S = window.Sym; if (!S) return '';
    const p = S.pins.nmos(160, 120); // g=130,120 / s=186,100 / d=186,140
    let g = '';
    // VCCA 3.3V 電源旗標(向上) + R1 + 閘極
    g += S.line(95, 25, 130, 25);
    g += S.line(95, 25, 95, 13); g += S.line(86, 13, 104, 13); g += S.txt(95, 8, 'VCCA 3.3V', { size: 8, fill: '#64748b' });
    g += S.resistor(95, 55, { horizontal: false, label: 'R1', value: '10k', labelSide: 'left' });
    g += S.line(95, 25, 95, 31);   // R1 頂端接 VCCA 匯流排（修正未連）
    g += S.line(95, 79, 95, 100);
    g += S.line(130, 120, 130, 25); g += S.junction(130, 25);
    // NMOS（含體二極體；腳位字另置，避免被線蓋）
    g += S.nmos(160, 120, { showPins: false, bodyDiode: true });
    g += S.txt(160, 170, 'BSS138', { size: 9, fill: '#64748b' });
    g += S.txt(122, 116, 'G', { anchor: 'end', size: 9 });
    g += S.txt(196, 94, 'S', { anchor: 'start', size: 9 });
    g += S.txt(196, 152, 'D', { anchor: 'start', size: 9 });
    // 低壓側 SDA_L → 源極接點(164,100)，止於 MOS 不超出
    g += S.line(60, 100, 164, 100); g += S.junction(95, 100); g += S.junction(164, 100); g += S.txt(42, 103, 'SDA_L', { size: 9 });
    // VCCB 5V 旗標 + R2 → 高壓側
    g += S.line(225, 25, 225, 31);
    g += S.line(225, 25, 225, 13); g += S.line(216, 13, 234, 13); g += S.txt(225, 8, 'VCCB 5V', { size: 8, fill: '#64748b' });
    g += S.resistor(225, 55, { horizontal: false, label: 'R2', value: '10k', labelSide: 'right' });
    g += S.line(225, 79, 225, 140);
    // 高壓側 SDA_H → 汲極(186,140)
    g += S.line(p.d[0], p.d[1], 278, 140); g += S.junction(225, 140); g += S.txt(296, 143, 'SDA_H', { size: 9 });
    return this.wrap(320, 185, g);
  },

  // 基本 LDO：pass PMOS（含體二極體）+ 誤差放大器 + 基準 + 回授分壓
  ldoBasic() {
    const S = window.Sym; if (!S) return '';
    let g = '';
    // Vin → pass PMOS 源極(156,30)
    g += S.line(20, 30, 156, 30); g += S.txt(18, 23, 'Vin', { anchor: 'start', size: 9, fill: '#64748b' });
    g += S.junction(50, 30); g += this.capToGnd(S, 50, 30, 'Cin');
    g += S.nmos(130, 50, { p: true, showPins: false }); // src=156,30 / drain=156,70 / gate=100,50
    g += S.txt(130, 96, 'pass MOSFET', { size: 8, fill: '#64748b' });
    g += S.txt(98, 42, 'G', { anchor: 'end', size: 9 });    // 閘極
    g += S.txt(162, 26, 'S', { anchor: 'start', size: 9 });  // 源極(右上)
    g += S.txt(166, 80, 'D', { anchor: 'start', size: 9 });  // 汲極(右下角)，遠離分壓
    // 汲極 → Vout（拉長，元件分開）
    g += S.line(156, 70, 282, 70); g += S.txt(284, 63, 'Vout', { anchor: 'end', size: 9, fill: '#64748b' });
    g += S.junction(205, 70); g += this.capToGnd(S, 205, 70, 'Cout', 'right');
    // 回授分壓 R1/R2（右移留空，與 MOS 分開）
    g += S.junction(248, 70); g += S.line(248, 70, 248, 76);
    g += S.resistor(248, 100, { horizontal: false, label: 'R1', labelSide: 'right' }); // 76..124
    g += S.junction(248, 124);
    g += S.resistor(248, 148, { horizontal: false, label: 'R2', labelSide: 'right' }); // 124..172
    g += S.line(248, 172, 248, 178); g += S.ground(248, 178, {});
    // 誤差放大器（輸出 → 閘極）
    g += `<polygon points="62,126 98,126 80,93" fill="#fff" stroke="${S.color}" stroke-width="2"/>`;
    g += S.line(80, 93, 80, 50); g += S.line(80, 50, 100, 50);
    g += S.txt(104, 116, 'EA', { anchor: 'start', size: 8, fill: '#64748b' });
    // − 回授：分壓抽頭(248,124) 沿最底部繞到 EA −（不壓任何電容）
    g += S.line(248, 124, 230, 124); g += S.line(230, 124, 230, 200); g += S.line(230, 200, 72, 200); g += S.line(72, 200, 72, 126);
    g += S.txt(64, 123, '−', { anchor: 'end', size: 10, raw: true });
    // + 基準
    g += S.line(88, 126, 88, 150); g += S.txt(96, 150, 'Vref', { anchor: 'start', size: 8, fill: '#64748b' });
    g += S.txt(92, 123, '+', { anchor: 'start', size: 10, raw: true });
    return this.wrap(300, 214, g);
  },

  // MOSFET 低端開關
  mosfetSwitch() {
    const S = window.Sym; if (!S) return '';
    const p = S.pins.nmos(150, 120); // s=[176,100]上, d=[176,140]下, g=[120,120]
    let g = '';
    // V+ → 負載 → 上端子（汲極）
    g += S.rail(176, 15, 'V+'); g += S.line(176, 15, 176, 31);
    g += S.resistor(176, 55, { horizontal: false, label: 'RL', value: '負載' }); // 引線 31..79
    g += S.line(176, 79, p.s[0], p.s[1]); // 79 → (176,100)
    g += S.nmos(150, 120, { source: 'D', drain: 'S', gate: 'G', showPins: false, flip: true });
    // 下端子（源極）→ 地
    g += S.line(p.d[0], p.d[1], 176, 156); g += S.ground(176, 170, {});
    // 輸出節點
    g += S.line(176, 100, 212, 100); g += S.junction(176, 100); g += S.txt(214, 103, '輸出', { anchor: 'start', size: 8, fill: '#64748b' });
    // 閘極 ← Rg ← PWM
    g += S.resistor(96, 120, { horizontal: true, label: 'Rg' }); // 引線 72..120 → 閘極 120
    g += S.line(72, 120, 52, 120); g += S.txt(48, 123, 'PWM', { anchor: 'end', size: 8, fill: '#64748b' });
    return this.wrap(240, 200, g);
  },

  // ---- 共用小工具 ----
  capToGnd(S, x, yTop, label, labelSide) {
    let g = S.line(x, yTop, x, yTop + 14);
    g += S.capacitor(x, yTop + 36, label ? { label, labelSide } : {});
    g += S.ground(x, yTop + 62, {});
    return g;
  },

  // 切換式電源（buck/boost/buck-boost 共用骨架）
  switcher(opt) {
    const S = window.Sym; if (!S) return '';
    const icPins = opt.icPins || { l: ['VIN', 'EN'], r: ['SW', 'FB'] };
    const cx = 95, cy = 78, ww = 70;
    const leadR = S.pins.icLeadR(cx, ww), leadL = S.pins.icLeadL(cx, ww); // 144 / 46
    const swY = S.icPinY(cy, icPins.r.length, 0);
    const fbY = S.icPinY(cy, icPins.r.length, icPins.r.length - 1);
    const vinY = S.icPinY(cy, icPins.l.length, 0);
    const enY = icPins.l.length > 1 ? S.icPinY(cy, icPins.l.length, 1) : null;
    const A = 168;       // SW 節點 x
    let g = '';
    // Vin → VIN（Cin 拉遠離 IC）
    g += S.line(10, vinY, leadL, vinY); g += S.txt(8, vinY - 8, 'Vin', { anchor: 'start', size: 9, fill: '#64748b' });
    g += this.capToGnd(S, 30, vinY, 'Cin'); g += S.junction(30, vinY);
    // EN 接 VIN（致能拉高）
    if (enY !== null) { g += S.line(leadL, enY, 42, enY); g += S.line(42, enY, 42, vinY); g += S.junction(42, vinY); }
    g += S.ic(cx, cy, { width: ww, height: 74, label: opt.ic || 'DC-DC', pinsLeft: icPins.l, pinsRight: icPins.r });
    // SW → 節點A → L → Vout
    g += S.line(leadR, swY, A, swY); g += S.junction(A, swY);
    g += S.line(A, swY, 196, swY); g += S.inductor(220, swY, { label: 'L' });
    g += S.line(244, swY, 280, swY); g += S.txt(282, swY - 8, 'Vout', { anchor: 'end', size: 9, fill: '#64748b' });
    // 續流二極體（節點A → 地），與其他線分開
    g += S.line(A, swY, A, swY + 11);
    g += `<g transform="rotate(-90 ${A} ${swY + 26})">${S.diode(A, swY + 26, {})}</g>`; // 垂直（cathode 朝上接 SW 節點）
    g += S.ground(A, swY + 60, {});
    g += S.txt(A + 14, swY + 28, 'D', { anchor: 'start', size: 9, fill: '#64748b' });
    // 輸出電容
    g += this.capToGnd(S, 262, swY, 'Cout', 'right'); g += S.junction(262, swY);
    // 回授 FB ← Vout（沿底部繞行，不與二極體交叉）
    const fbBottom = swY + 78;
    g += S.line(leadR, fbY, leadR + 8, fbY); g += S.line(leadR + 8, fbY, leadR + 8, fbBottom);
    g += S.line(leadR + 8, fbBottom, 300, fbBottom); g += S.line(300, fbBottom, 300, swY);
    g += S.line(300, swY, 280, swY); g += S.junction(280, swY);
    return this.wrap(320, swY + 95, g);
  },

  boost() {
    const S = window.Sym; if (!S) return '';
    const p = S.pins.nmos(150, 90); // s=[176,70]上, d=[176,110]下, g=[120,90]
    let g = '';
    g += S.line(20, 50, 46, 50); g += S.txt(18, 42, 'Vin', { anchor: 'start', size: 9, fill: '#64748b' });
    g += S.inductor(70, 50, { label: 'L' }); // 引線 46..94
    g += S.line(94, 50, 176, 50); g += S.junction(176, 50); // 開關節點
    // 開關節點 → 上端子（汲極）；下端子（源極）→ 地
    g += S.line(176, 50, p.s[0], p.s[1]); // 50 → (176,70)
    g += S.nmos(150, 90, { source: 'D', drain: 'S', gate: 'G', showPins: false, flip: true });
    g += S.line(p.d[0], p.d[1], 176, 126); g += S.ground(176, 140, {});
    g += S.line(p.g[0], p.g[1], 92, 90); g += S.txt(88, 93, 'PWM', { anchor: 'end', size: 8, fill: '#64748b' });
    // 二極體 → 輸出
    g += S.line(176, 50, 188, 50); g += S.diode(210, 50, { label: 'D' }); // 引線 188..232
    g += S.line(232, 50, 262, 50); g += S.txt(264, 42, 'Vout', { anchor: 'end', size: 9, fill: '#64748b' });
    g += this.capToGnd(S, 248, 50, 'Cout'); g += S.junction(248, 50);
    return this.wrap(300, 170, g);
  },

  // I2C 匯流排
  i2cBus() {
    const S = window.Sym; if (!S) return '';
    const mcuLead = S.pins.icLeadR(40, 44);   // 76
    const senLead = S.pins.icLeadL(200, 50);  // 161
    const sdaY = S.icPinY(90, 2, 0), sclY = S.icPinY(90, 2, 1); // 81 / 99
    let g = '';
    g += S.ic(40, 90, { width: 44, height: 70, label: 'MCU', pinsRight: ['SDA', 'SCL'] });
    g += S.ic(200, 90, { width: 50, height: 70, label: 'Sensor', pinsLeft: ['SDA', 'SCL'] });
    // 匯流排
    g += S.line(mcuLead, sdaY, senLead, sdaY); g += S.txt(125, sdaY - 6, 'SDA', { size: 8, fill: '#64748b' });
    g += S.line(mcuLead, sclY, senLead, sclY); g += S.txt(125, sclY - 6, 'SCL', { size: 8, fill: '#64748b' });
    // 上拉電阻 → VCC（電源旗標明確向上）
    g += S.line(100, 18, 150, 18);                                  // VCC 匯流排
    g += S.line(125, 18, 125, 8); g += S.line(117, 8, 133, 8);      // 往上的電源旗標
    g += S.txt(140, 11, 'VCC', { anchor: 'start', size: 8, fill: '#64748b' });
    g += S.resistor(100, 50, { horizontal: false, label: 'Rp' });   // 引線 26..74
    g += S.line(100, 26, 100, 18); g += S.line(100, 74, 100, sdaY); g += S.junction(100, sdaY);
    g += S.resistor(150, 50, { horizontal: false, label: 'Rp' });
    g += S.line(150, 26, 150, 18); g += S.line(150, 74, 150, sclY); g += S.junction(150, sclY);
    return this.wrap(245, 150, g);
  },

  // SPI 匯流排
  spiBus() {
    const S = window.Sym; if (!S) return '';
    const mLead = S.pins.icLeadR(40, 46), sLead = S.pins.icLeadL(210, 46); // 77 / 173
    const names = ['SCLK', 'MOSI', 'MISO', 'CS'];
    let g = '';
    g += S.ic(40, 70, { width: 46, height: 90, label: 'Master', pinsRight: names });
    g += S.ic(210, 70, { width: 46, height: 90, label: 'Slave', pinsLeft: names });
    names.forEach((nm, i) => {
      const y = S.icPinY(70, 4, i);
      g += S.line(mLead, y, sLead, y); g += S.txt(125, y - 4, nm, { size: 8, fill: '#64748b' });
    });
    return this.wrap(250, 140, g);
  },

  // LDO 低噪聲（含 NR/旁路電容）
  ldoNoise() {
    const S = window.Sym; if (!S) return '';
    const cx = 112, ww = 78;
    const leadL = S.pins.icLeadL(cx, ww), leadR = S.pins.icLeadR(cx, ww); // 59 / 165
    const inY = S.icPinY(60, 2, 0), outY = S.icPinY(60, 2, 0), nrY = S.icPinY(60, 2, 1); // 51 / 51 / 69
    let g = '';
    g += S.line(16, inY, leadL, inY); g += S.txt(14, inY - 8, 'Vin', { anchor: 'start', size: 9, fill: '#64748b' });
    g += this.capToGnd(S, 36, inY, 'Cin'); g += S.junction(36, inY);
    // EN 接 VIN（常開；亦可由 MCU 控制，不可懸空）
    g += S.line(leadL, nrY, 48, nrY); g += S.line(48, nrY, 48, inY); g += S.junction(48, inY);
    g += S.ic(cx, 60, { width: ww, height: 64, label: '低噪聲 LDO', pinsLeft: ['IN', 'EN'], pinsRight: ['OUT', 'NR'] });
    g += S.line(leadR, outY, 232, outY); g += S.txt(234, outY - 8, 'Vout', { anchor: 'end', size: 9, fill: '#64748b' });
    g += this.capToGnd(S, 212, outY, 'Cout', 'right'); g += S.junction(212, outY); // Cout 靠右
    g += this.capToGnd(S, leadR, nrY, 'Cnr', 'right');  // Cnr 靠右，與 Cout(更右) 明確分開、避開 IC 標籤
    return this.wrap(262, 172, g);
  },

  // 反相放大器（Vin→Rg→−，Rf 回授，+ 接地；增益 −Rf/Rg）
  opamp() {
    const S = window.Sym; if (!S) return '';
    let g = '';
    // 運放三角（− 上、+ 下）
    g += `<polygon points="75,40 75,100 130,70" fill="#fff" stroke="${S.color}" stroke-width="2"/>`;
    g += S.txt(82, 57, '−', { size: 11, raw: true }); g += S.txt(82, 86, '+', { size: 11, raw: true });
    // 輸入級：Vin → Rg → − 節點(60,53)
    g += S.txt(10, 45, 'Vin', { anchor: 'start', size: 9, fill: '#64748b' });
    g += S.resistor(36, 53, { horizontal: true, label: 'Rg' }); // 引線 12..60
    g += S.line(60, 53, 75, 53); g += S.junction(60, 53);        // → − 輸入
    // 回授 Rf：− 節點 → 上方 → 輸出
    g += S.line(60, 53, 60, 28); g += S.line(60, 28, 91, 28);
    g += S.resistor(115, 28, { horizontal: true, label: 'Rf' }); // 引線 91..139
    g += S.line(139, 28, 158, 28); g += S.line(158, 28, 158, 70); g += S.junction(158, 70);
    // 輸出
    g += S.line(130, 70, 185, 70); g += S.txt(187, 62, 'Vout', { anchor: 'end', size: 9, fill: '#64748b' });
    // + 輸入接地
    g += S.line(75, 87, 58, 87); g += S.line(58, 87, 58, 108); g += S.ground(58, 108, {});
    return this.wrap(210, 140, g);
  },

  // ESD/TVS 保護
  esdTVS() {
    const S = window.Sym; if (!S) return '';
    let g = '';
    g += S.line(20, 40, 200, 40);
    g += S.txt(20, 32, 'I/O', { anchor: 'start', size: 9, fill: '#64748b' });
    g += S.txt(202, 32, '到晶片', { anchor: 'end', size: 9, fill: '#64748b' });
    g += S.junction(110, 40);
    // TVS 到地（用雙向二極體示意）
    g += S.line(110, 40, 110, 60);
    g += `<g transform="rotate(90 110 75)">${S.diode(110, 75, {})}</g>`;
    g += S.txt(128, 78, 'TVS', { anchor: 'start', size: 9, fill: '#64748b' });
    g += S.line(110, 90, 110, 100); g += S.ground(110, 100, {});
    return this.wrap(220, 130, g);
  },

  // 防反接（PMOS）
  reversePolarity() {
    const S = window.Sym; if (!S) return '';
    const p = S.pins.nmos(110, 55); // s=[136,35]上, d=[136,75]下, g=[80,55]
    let g = '';
    // V+輸入 → 源極(上) ；汲極(下) → 系統（串聯，body diode 防反接）
    g += S.txt(136, 16, 'V+輸入', { size: 9, fill: '#64748b' }); g += S.line(136, 20, 136, 35);
    g += S.nmos(110, 55, { p: true, showPins: false });
    g += S.line(136, 75, 136, 100); g += S.txt(150, 98, '系統', { anchor: 'start', size: 9, fill: '#64748b' });
    // 閘極接地（P-MOS 正常極性導通）
    g += S.line(p.g[0], p.g[1], 50, 55); g += S.line(50, 55, 50, 86); g += S.ground(50, 100, {});
    g += S.txt(110, 120, 'P-MOS 防反接（閘極接地）', { size: 8, fill: '#64748b' });
    return this.wrap(220, 132, g);
  },

  // 去耦電容配置
  decoupling() {
    const S = window.Sym; if (!S) return '';
    const xs = [56, 116, 176], vals = ['10µF', '100nF', '1nF'];
    let g = '';
    g += S.line(56, 30, 236, 30);                                 // VCC 匯流排
    g += S.line(116, 16, 116, 30); g += S.line(106, 16, 126, 16); g += S.txt(116, 11, 'VCC', { size: 9, fill: '#64748b' });
    xs.forEach((x, i) => {
      g += this.capToGnd(S, x, 30); g += S.junction(x, 30);
      g += S.txt(x, 120, vals[i], { size: 9, fill: '#64748b' });  // 值置電容下方
    });
    g += S.ic(236, 62, { width: 40, height: 50, label: 'IC', pinsLeft: ['VCC'] });
    g += S.line(216, 52, 216, 30); g += S.junction(216, 30);
    return this.wrap(280, 144, g);
  },

  // 共模扼流圈
  commonModeChoke() {
    const S = window.Sym; if (!S) return '';
    let g = '';
    g += S.line(20, 40, 60, 40); g += S.inductor(85, 40, {}); g += S.line(110, 40, 200, 40);
    g += S.line(20, 80, 60, 80); g += S.inductor(85, 80, {}); g += S.line(110, 80, 200, 80);
    // 耦合線（鐵芯）
    g += S.line(70, 55, 100, 55, { w: 1 }); g += S.line(70, 65, 100, 65, { w: 1 });
    g += S.txt(20, 32, 'L1', { anchor: 'start', size: 9, fill: '#64748b' });
    g += S.txt(20, 100, 'L2', { anchor: 'start', size: 9, fill: '#64748b' });
    g += S.txt(110, 105, '共模扼流圈', { anchor: 'start', size: 9, fill: '#64748b' });
    return this.wrap(220, 120, g);
  },

  // TVS 選型示意
  tvsSelect() {
    const S = window.Sym; if (!S) return '';
    let g = '';
    g += S.line(20, 40, 90, 40); g += S.junction(90, 40);
    g += S.txt(20, 32, 'Vbus', { anchor: 'start', size: 9, fill: '#64748b' });
    g += S.line(90, 40, 160, 40); g += S.txt(162, 32, '負載', { anchor: 'end', size: 9, fill: '#64748b' });
    g += S.line(90, 40, 90, 58);
    g += `<g transform="rotate(90 90 73)">${S.diode(90, 73, {})}</g>`;
    g += S.txt(108, 76, 'TVS', { anchor: 'start', size: 9, fill: '#64748b' });
    g += S.line(90, 88, 90, 98); g += S.ground(90, 98, {});
    return this.wrap(180, 128, g);
  },

  // LED 驅動（定電流 + 串接 LED）
  ledDriver() {
    const S = window.Sym; if (!S) return '';
    let g = '';
    g += S.rail(40, 15, 'V+'); g += S.line(40, 15, 40, 35);
    // LED 串（垂直，旋轉後引線在 ±22）
    g += `<g transform="rotate(90 40 57)">${S.diode(40, 57, {})}</g>`;   // 35..79
    g += `<g transform="rotate(90 40 101)">${S.diode(40, 101, {})}</g>`; // 79..123
    g += S.junction(40, 79);
    g += S.txt(58, 92, 'LED×n', { anchor: 'start', size: 9, fill: '#64748b' });
    g += S.line(40, 123, 40, 135);
    // 限流電阻 + 接地
    g += S.resistor(40, 159, { horizontal: false, label: 'R', value: '限流' }); // 135..183
    g += S.line(40, 183, 40, 193); g += S.ground(40, 207, {});
    return this.wrap(150, 235, g);
  },

  // 電池充電
  batteryCharger() {
    const S = window.Sym; if (!S) return '';
    const leadL = S.pins.icLeadL(100, 74), leadR = S.pins.icLeadR(100, 74); // 49 / 151
    const batY = S.icPinY(65, 2, 0); // 56
    let g = '';
    g += S.line(20, 65, leadL, 65); g += S.txt(18, 57, 'VBUS', { anchor: 'start', size: 9, fill: '#64748b' });
    g += S.ic(100, 65, { width: 74, height: 70, label: '充電 IC', pinsLeft: ['VIN'], pinsRight: ['BAT', 'STAT'] });
    g += S.line(leadR, batY, 190, batY); g += S.junction(190, batY);
    g += S.line(190, batY, 190, 76); g += S.source(190, 100, { label: 'Batt' }); // 電池上端 76
    g += S.line(190, 124, 190, 132); g += S.ground(190, 146, {});
    return this.wrap(230, 170, g);
  },

  // 電流偵測（高側分流 + 放大）
  currentSensing() {
    const S = window.Sym; if (!S) return '';
    let g = '';
    g += S.line(20, 40, 60, 40);
    g += S.txt(20, 32, 'Vbus', { anchor: 'start', size: 9, fill: '#64748b' });
    g += S.resistor(85, 40, { horizontal: true, label: 'Rshunt' });
    g += S.line(110, 40, 160, 40); g += S.txt(162, 32, '負載', { anchor: 'end', size: 9, fill: '#64748b' });
    g += S.junction(60, 40); g += S.junction(110, 40);
    g += S.line(60, 40, 60, 75); g += S.line(110, 40, 110, 65);
    g += `<polygon points="70,60 70,100 120,80" fill="#fff" stroke="${S.color}" stroke-width="2"/>`;
    g += S.line(120, 80, 152, 80);
    g += S.txt(135, 72, 'INA', { anchor: 'start', size: 9, fill: '#64748b' });
    return this.wrap(180, 130, g);
  },

  // 差分對 + 終端
  diffPair() {
    const S = window.Sym; if (!S) return '';
    let g = '';
    g += S.line(20, 40, 180, 40, { color: '#dc2626' }); g += S.txt(20, 32, 'D+', { anchor: 'start', size: 9, fill: '#dc2626' });
    g += S.line(20, 80, 180, 80, { color: '#1f4fd1' }); g += S.txt(20, 100, 'D−', { anchor: 'start', size: 9, fill: '#1f4fd1' });
    g += S.txt(100, 26, '差分阻抗 ' + '90Ω', { size: 9, fill: '#64748b' });
    // 終端電阻（差分跨接，旋轉後引線在 200,36 與 200,84）
    g += S.line(180, 40, 200, 40); g += S.line(200, 40, 200, 36);
    g += S.line(180, 80, 200, 80); g += S.line(200, 80, 200, 84);
    g += `<g transform="rotate(90 200 60)">${S.resistor(200, 60, { horizontal: true })}</g>`;
    g += S.txt(214, 64, 'Rt', { anchor: 'start', size: 9, fill: '#64748b' });
    return this.wrap(240, 120, g);
  },

  // 阻抗匹配（源 + 串聯 R + 線 + 負載）
  impedance() {
    const S = window.Sym; if (!S) return '';
    let g = '';
    // 驅動端（buffer）
    g += `<polygon points="24,50 24,80 52,65" fill="#fff" stroke="${S.color}" stroke-width="2"/>`;
    g += S.line(12, 65, 24, 65); g += S.txt(34, 100, '驅動端', { size: 8, fill: '#64748b' });
    // 源端串聯匹配 Rs (= Z0 − Rout)
    g += S.line(52, 65, 64, 65); g += S.resistor(88, 65, { horizontal: true, label: 'Rs' }); // 64..112
    g += S.txt(88, 86, '源端串聯', { size: 7, fill: '#64748b' });
    // 傳輸線 Z0
    g += S.line(112, 65, 250, 65); g += S.txt(182, 56, 'Z0 = 50Ω 傳輸線', { size: 8, fill: '#64748b' });
    g += S.junction(250, 65);
    // 末端並聯匹配 Rt (= Z0) → GND
    g += S.line(250, 65, 250, 71); g += S.resistor(250, 95, { horizontal: false, label: 'Rt', value: '50Ω', labelSide: 'left' }); // 71..119
    g += S.line(250, 119, 250, 125); g += S.ground(250, 125, {});
    g += S.txt(250, 150, '末端並聯', { size: 7, fill: '#64748b' });
    // 接收端（buffer）
    g += S.line(250, 65, 290, 65); g += S.junction(250, 65);
    g += `<polygon points="290,52 290,78 316,65" fill="#fff" stroke="${S.color}" stroke-width="2"/>`;
    g += S.line(316, 65, 330, 65); g += S.txt(303, 100, '接收端', { size: 8, fill: '#64748b' });
    return this.wrap(345, 166, g);
  },

  // USB 差分（含 AC 耦合）
  usbDiff() {
    const S = window.Sym; if (!S) return '';
    let g = '';
    g += S.line(20, 40, 90, 40, { color: '#dc2626' }); g += S.txt(20, 32, 'SSTX+', { anchor: 'start', size: 8, fill: '#dc2626' });
    g += `<g transform="rotate(90 110 40)">${S.capacitor(110, 40, {})}</g>`;
    g += S.line(130, 40, 200, 40, { color: '#dc2626' });
    g += S.line(20, 80, 90, 80, { color: '#1f4fd1' }); g += S.txt(20, 100, 'SSTX−', { anchor: 'start', size: 8, fill: '#1f4fd1' });
    g += `<g transform="rotate(90 110 80)">${S.capacitor(110, 80, {})}</g>`;
    g += S.line(130, 80, 200, 80, { color: '#1f4fd1' });
    g += S.txt(110, 115, 'AC 耦合電容', { size: 9, fill: '#64748b' });
    return this.wrap(220, 130, g);
  },

  // EMI π 型濾波
  emiFilter() {
    const S = window.Sym; if (!S) return '';
    let g = '';
    // In → C1 節點 → L → C2 節點 → Out（電感引線對齊，不留縫）
    g += S.line(20, 45, 60, 45); g += S.txt(18, 37, 'In', { anchor: 'start', size: 9, fill: '#64748b' });
    g += S.junction(60, 45);
    g += S.line(60, 45, 76, 45); g += S.inductor(100, 45, { label: 'L' }); g += S.line(124, 45, 140, 45); // L 引線 76..124
    g += S.junction(140, 45);
    g += S.line(140, 45, 180, 45); g += S.txt(182, 37, 'Out', { anchor: 'end', size: 9, fill: '#64748b' });
    g += this.capToGnd(S, 60, 45, 'C1');
    g += this.capToGnd(S, 140, 45, 'C2', 'right');
    g += S.txt(100, 138, 'π 型 LC 濾波', { size: 9, fill: '#64748b' }); // 說明移到最底，不貼 GND
    return this.wrap(210, 150, g);
  },

  // PDN 電容陣列
  pdn() {
    const S = window.Sym; if (!S) return '';
    const vals = ['100µF', '10µF', '1µF', '100nF', '10nF'];
    const xs = vals.map((_, i) => 56 + i * 66); // 拉寬間距，容值放電容旁不打架
    let g = '';
    g += S.line(xs[0], 30, xs[xs.length - 1], 30);                 // VDD 平面匯流排
    const mid = (xs[0] + xs[xs.length - 1]) / 2;
    g += S.line(mid, 16, mid, 30); g += S.line(mid - 10, 16, mid + 10, 16);
    g += S.txt(mid, 11, 'VDD 平面', { size: 9, fill: '#64748b' });
    vals.forEach((lab, i) => {
      const x = xs[i];
      g += this.capToGnd(S, x, 30, lab); g += S.junction(x, 30);   // 容值放電容左側（旁邊）
    });
    g += S.txt(mid, 122, '多級去耦電容（大→小）', { size: 9, fill: '#64748b' });
    return this.wrap(xs[xs.length - 1] + 56, 136, g);
  },

  // 車用瞬態保護
  automotiveTransient() {
    const S = window.Sym; if (!S) return '';
    let g = '';
    g += S.line(20, 45, 50, 45); g += S.txt(20, 37, 'VBAT', { anchor: 'start', size: 9, fill: '#64748b' });
    // 反向保護二極體
    g += S.diode(72, 45, { label: '反接保護' });
    g += S.line(94, 45, 130, 45); g += S.junction(130, 45);
    g += S.line(130, 45, 200, 45); g += S.txt(202, 37, 'ECU', { anchor: 'end', size: 9, fill: '#64748b' });
    // TVS load dump
    g += S.line(130, 45, 130, 63);
    g += `<g transform="rotate(90 130 78)">${S.diode(130, 78, {})}</g>`;
    g += S.txt(148, 81, 'TVS（Load Dump）', { anchor: 'start', size: 8, fill: '#64748b' });
    g += S.line(130, 93, 130, 100); g += S.ground(130, 100, {});
    return this.wrap(260, 130, g);
  },

  // ADC/DAC 參考與濾波
  adcDac() {
    const S = window.Sym; if (!S) return '';
    const leadL = S.pins.icLeadL(110, 80); // 56
    const ainY = S.icPinY(70, 2, 0), vrefY = S.icPinY(70, 2, 1); // 61 / 79
    let g = '';
    g += S.ic(110, 70, { width: 80, height: 80, label: 'ADC', pinsLeft: ['AIN', 'VREF'], pinsRight: ['SCLK', 'SDO'] });
    g += S.line(20, ainY, leadL, ainY); g += S.txt(18, ainY - 8, 'AIN', { anchor: 'start', size: 9, fill: '#64748b' });
    // VREF 旁路電容
    g += S.line(20, vrefY, leadL, vrefY); g += S.junction(40, vrefY); g += S.txt(18, vrefY - 8, 'VREF', { anchor: 'start', size: 8, fill: '#64748b' });
    g += this.capToGnd(S, 40, vrefY, 'Cref');
    return this.wrap(220, 180, g);
  },

  // 嵌入式電源樹
  embeddedPower() {
    const S = window.Sym; if (!S) return '';
    let g = '';
    // 5V → Buck → 3.3V
    g += S.line(10, 40, S.pins.icLeadL(70, 58), 40); g += S.txt(10, 33, '5V', { anchor: 'start', size: 9, fill: '#64748b' });
    g += S.ic(70, 40, { width: 58, height: 34, label: 'Buck', pinsLeft: ['IN'], pinsRight: ['OUT'] });
    g += S.line(S.pins.icLeadR(70, 58), 40, 150, 40); g += S.junction(150, 40); g += S.txt(150, 30, '3.3V', { size: 8, fill: '#64748b' });
    // 3.3V → LDO → 1.8V
    g += S.line(150, 40, S.pins.icLeadL(210, 58), 40);
    g += S.ic(210, 40, { width: 58, height: 34, label: 'LDO', pinsLeft: ['IN'], pinsRight: ['OUT'] });
    g += S.line(S.pins.icLeadR(210, 58), 40, 256, 40); g += S.txt(258, 33, '1.8V', { anchor: 'end', size: 8, fill: '#64748b' });
    // 3.3V 分支 → LDO → 1.2V
    const branchX = S.pins.icLeadL(150, 58); // 107
    g += S.line(150, 40, 150, 75); g += S.line(150, 75, branchX, 75); g += S.line(branchX, 75, branchX, 110);
    g += S.ic(150, 110, { width: 58, height: 34, label: 'LDO', pinsLeft: ['IN'], pinsRight: ['OUT'] });
    g += S.line(S.pins.icLeadR(150, 58), 110, 235, 110); g += S.txt(237, 103, '1.2V', { anchor: 'end', size: 8, fill: '#64748b' });
    return this.wrap(270, 162, g);
  },

  // 變壓器（中心 x,y；上下各一線圈 + 鐵芯）
  _transformer(S, x, y, opt = {}) {
    const c = S.color; let g = '';
    // 一次側線圈（左，垂直三弧）
    for (let i = 0; i < 3; i++) g += `<path d="M ${x - 14} ${y - 24 + i * 16} a 8 8 0 0 1 0 16" fill="none" stroke="${c}" stroke-width="2"/>`;
    // 二次側線圈（右）
    for (let i = 0; i < 3; i++) g += `<path d="M ${x + 14} ${y - 24 + i * 16} a 8 8 0 0 0 0 16" fill="none" stroke="${c}" stroke-width="2"/>`;
    // 鐵芯
    g += S.line(x - 2, y - 26, x - 2, y + 26, { w: 1.5 }); g += S.line(x + 2, y - 26, x + 2, y + 26, { w: 1.5 });
    // 引腳
    g += S.line(x - 14, y - 24, x - 14, y - 30); g += S.line(x - 14, y + 24, x - 14, y + 30);
    g += S.line(x + 14, y - 24, x + 14, y - 30); g += S.line(x + 14, y + 24, x + 14, y + 30);
    if (opt.ratio) g += S.txt(x, y + 44, opt.ratio, { size: 8, fill: '#64748b' });
    return g;
  },

  // Flyback 返馳式隔離轉換器
  flyback() {
    const S = window.Sym; if (!S) return '';
    const p = S.pins.nmos(70, 120); // s=[96,100]上, d=[96,140]下, g=[40,120]
    let g = '';
    // 一次側：Vin → 變壓器一次上；一次下(96,100) = MOSFET 上端子(汲極)
    g += S.rail(60, 18, 'Vin'); g += S.line(60, 18, 60, 40); g += S.line(60, 40, 96, 40);
    g += this._transformer(S, 110, 70, { ratio: '1:N' }); // 一次下端腳 (96,100)
    g += S.nmos(70, 120, { source: 'D', drain: 'S', gate: 'G', showPins: false, flip: true });
    g += S.junction(96, 100);
    g += S.line(p.d[0], p.d[1], 96, 154); g += S.ground(96, 168, {});
    g += S.line(p.g[0], p.g[1], 26, 120); g += S.txt(22, 123, 'PWM', { anchor: 'end', size: 8, fill: '#64748b' });
    // 二次側：二極體 → Vout、Cout、二次地
    g += S.line(124, 40, 128, 40); g += S.diode(150, 40, { label: 'D' }); // 引線 128..172
    g += S.line(172, 40, 228, 40); g += S.txt(230, 32, 'Vout', { anchor: 'end', size: 9, fill: '#64748b' });
    g += S.junction(210, 40); g += S.line(210, 40, 210, 56); g += S.capacitor(210, 78, { label: 'Cout' }); g += S.line(210, 100, 210, 120);
    g += S.line(124, 100, 124, 120); g += S.line(124, 120, 210, 120);
    g += S.ground(167, 134, {});
    return this.wrap(260, 200, g);
  },

  // 半橋（高低側 NMOS）
  halfBridge() {
    const S = window.Sym; if (!S) return '';
    const hs = S.pins.nmos(150, 55), ls = S.pins.nmos(150, 120);
    let g = '';
    g += S.rail(176, 15, 'V+'); g += S.line(176, 15, hs.s[0], hs.s[1]); // 15 → (176,35) 高側上端子
    g += S.nmos(150, 55, { showPins: false, flip: true });
    g += S.nmos(150, 120, { showPins: false, flip: true });
    // SW 節點：高側下端子(176,75) — 低側上端子(176,100)
    g += S.line(hs.d[0], hs.d[1], ls.s[0], ls.s[1]);
    g += S.junction(176, 87); g += S.line(176, 87, 214, 87); g += S.txt(216, 90, 'SW 輸出', { anchor: 'start', size: 8, fill: '#64748b' });
    // 低側下端子 → 地
    g += S.line(ls.d[0], ls.d[1], 176, 154); g += S.ground(176, 168, {});
    // 閘極
    g += S.line(hs.g[0], hs.g[1], 92, 55); g += S.txt(88, 58, 'HG', { anchor: 'end', size: 8, fill: '#64748b' });
    g += S.line(ls.g[0], ls.g[1], 92, 120); g += S.txt(88, 123, 'LG', { anchor: 'end', size: 8, fill: '#64748b' });
    return this.wrap(260, 200, g);
  },

  // 閘極驅動 IC + 自舉供電
  gateDriver() {
    const S = window.Sym; if (!S) return '';
    const leadL = S.pins.icLeadL(70, 56), leadR = S.pins.icLeadR(70, 56); // 28 / 112
    const hoY = S.icPinY(70, 2, 0), loY = S.icPinY(70, 2, 1);             // 61 / 79
    let g = '';
    g += S.ic(70, 70, { width: 56, height: 64, label: 'Gate Driver', pinsLeft: ['IN'], pinsRight: ['HO', 'LO'] });
    g += S.line(20, 70, leadL, 70); g += S.txt(18, 62, 'PWM', { anchor: 'start', size: 8, fill: '#64748b' });
    g += S.line(leadR, hoY, 150, hoY); g += S.txt(152, hoY + 3, 'HO→高側閘極', { anchor: 'start', size: 8, fill: '#64748b' });
    g += S.line(leadR, loY, 150, loY); g += S.txt(152, loY + 3, 'LO→低側閘極', { anchor: 'start', size: 8, fill: '#64748b' });
    g += S.txt(70, 134, '自舉供電驅動高側', { size: 8, fill: '#64748b' });
    return this.wrap(230, 148, g);
  },

  // 遲滯比較器（Schmitt）
  comparator() {
    const S = window.Sym; if (!S) return '';
    let g = '';
    g += S.line(20, 55, 50, 55); g += S.txt(20, 47, 'Vin', { anchor: 'start', size: 9, fill: '#64748b' });
    g += `<polygon points="60,30 60,80 120,55" fill="#fff" stroke="${S.color}" stroke-width="2"/>`;
    g += S.txt(74, 50, '−', { size: 12 }); g += S.txt(74, 72, '+', { size: 12 });
    g += S.line(120, 55, 175, 55); g += S.txt(177, 47, 'Vout', { anchor: 'end', size: 9, fill: '#64748b' });
    // 正回授 Rf 形成遲滯（標籤放電阻下方，避免壓到三角）
    g += S.line(150, 55, 150, 95); g += S.junction(150, 55);
    g += S.resistor(105, 95, { horizontal: true }); g += S.txt(105, 113, 'Rf', { size: 9, fill: '#64748b' });
    g += S.line(70, 95, 55, 95); g += S.line(55, 95, 55, 72); g += S.line(55, 72, 50, 72);
    g += S.txt(110, 132, '正回授 → 遲滯', { size: 9, fill: '#64748b' });
    return this.wrap(200, 148, g);
  },

  // TL431 並聯基準
  tl431() {
    const S = window.Sym; if (!S) return '';
    let g = '';
    g += S.rail(60, 15, 'Vcc'); g += S.line(60, 15, 60, 30);
    g += S.resistor(60, 55, { horizontal: false, label: 'R1' });
    g += S.line(60, 79, 60, 95); g += S.junction(60, 95);
    g += S.txt(78, 98, 'Vref=2.5V', { anchor: 'start', size: 8, fill: '#64748b' });
    // TL431 以分流符號示意
    g += S.line(60, 95, 60, 110);
    g += `<g transform="rotate(180 60 125)">${S.diode(60, 125, {})}</g>`;
    g += S.line(45, 110, 45, 95); g += S.line(45, 95, 60, 95); // 參考腳回授
    g += S.line(60, 140, 60, 150); g += S.ground(60, 150, {});
    g += S.txt(60, 175, 'TL431 可調分流基準', { size: 8, fill: '#64748b' });
    return this.wrap(180, 185, g);
  },

  // RC 低通濾波
  rcLowpass() {
    const S = window.Sym; if (!S) return '';
    let g = '';
    g += S.line(20, 45, 50, 45); g += S.txt(20, 37, 'Vin', { anchor: 'start', size: 9, fill: '#64748b' });
    g += S.resistor(75, 45, { horizontal: true, label: 'R' });
    g += S.line(100, 45, 150, 45); g += S.junction(130, 45);
    g += S.line(150, 45, 175, 45); g += S.txt(177, 37, 'Vout', { anchor: 'end', size: 9, fill: '#64748b' });
    g += this.capToGnd(S, 130, 45, 'C');
    g += S.txt(95, 130, 'fc = 1/(2πRC)', { size: 9, fill: '#64748b' });
    return this.wrap(200, 140, g);
  },

  // 晶體振盪（皮爾斯）
  crystalOsc() {
    const S = window.Sym; if (!S) return '';
    const leadR = S.pins.icLeadR(55, 40); // 89
    const xiY = S.icPinY(60, 2, 0), xoY = S.icPinY(60, 2, 1); // 51 / 69
    let g = '';
    g += S.ic(55, 60, { width: 40, height: 50, label: 'MCU', pinsRight: ['XI', 'XO'] });
    // XI / XO → 晶體兩端（垂直晶體於 x=130，51..69）
    g += S.line(leadR, xiY, 130, xiY); g += S.junction(100, xiY);
    g += S.line(leadR, xoY, 156, xoY); g += S.junction(130, xoY); g += S.junction(156, xoY);
    // 晶體（兩極板 + 石英）
    g += S.line(130, xiY, 130, 53); g += S.line(123, 53, 137, 53, { w: 2.4 });
    g += `<rect x="125" y="55" width="10" height="10" fill="none" stroke="${S.color}" stroke-width="1.5"/>`;
    g += S.line(123, 67, 137, 67, { w: 2.4 }); g += S.line(130, 67, 130, xoY);
    g += S.txt(130, 44, 'XTAL', { size: 8, fill: '#64748b' });
    // 負載電容（左右分開，各自到地）
    g += this.capToGnd(S, 100, xiY, 'CL1');
    g += this.capToGnd(S, 156, xoY, 'CL2', 'right'); // 標籤靠右避開晶體
    return this.wrap(216, 170, g);
  },

  // NTC 熱敏分壓
  ntcThermistor() {
    const S = window.Sym; if (!S) return '';
    let g = '';
    g += S.rail(60, 15, 'Vcc'); g += S.line(60, 15, 60, 30);
    g += S.resistor(60, 55, { horizontal: false, label: 'R 上拉' });
    g += S.line(60, 79, 60, 95); g += S.junction(60, 95);
    g += S.line(60, 95, 120, 95); g += S.txt(122, 98, '→ ADC', { anchor: 'start', size: 8, fill: '#64748b' });
    g += S.resistor(60, 120, { horizontal: false, label: 'NTC' });
    g += S.line(60, 144, 60, 150); g += S.ground(60, 150, {});
    g += S.txt(60, 175, 'NTC 分壓溫度量測', { size: 8, fill: '#64748b' });
    return this.wrap(180, 185, g);
  },

  // 熱插拔 / 浪湧限流（垂直串聯 MOSFET）
  hotSwap() {
    const S = window.Sym; if (!S) return '';
    const p = S.pins.nmos(170, 100); // s=[196,80]上, d=[196,120]下, g=[140,100]
    let g = '';
    // Vin → Rsense → 上端子(汲極) → 下端子(源極) → 負載
    g += S.txt(196, 12, 'Vin', { size: 9, fill: '#64748b' }); g += S.line(196, 16, 196, 24);
    g += S.resistor(196, 48, { horizontal: false, label: 'Rsense' }); // 引線 24..72
    g += S.line(196, 72, p.s[0], p.s[1]); g += S.junction(196, 72);
    g += S.nmos(170, 100, { source: 'D', drain: 'S', gate: 'G', showPins: false, flip: true });
    g += S.line(p.d[0], p.d[1], 196, 150); g += S.txt(210, 150, '負載', { anchor: 'start', size: 9, fill: '#64748b' });
    // 控制器：GATE → 閘極；SENSE → Rsense 下節點
    g += S.ic(91, 100, { width: 70, height: 44, label: 'Hot-Swap', pinsLeft: ['SENSE'], pinsRight: ['GATE'] });
    // GATE 腳外端 = 140 = 閘極 (140,100) 直接相接
    g += S.line(42, 100, 42, 72); g += S.line(42, 72, 196, 72);
    g += S.txt(120, 178, '緩啟動限制浪湧電流', { anchor: 'middle', size: 8, fill: '#64748b' });
    return this.wrap(250, 190, g);
  },

  // 光耦回授隔離
  optocoupler() {
    const S = window.Sym; if (!S) return '';
    let g = '';
    g += `<rect x="70" y="35" width="60" height="60" rx="3" fill="none" stroke="${S.color}" stroke-width="2"/>`;
    // 一次側 LED
    g += S.line(40, 50, 78, 50);
    g += `<g transform="rotate(90 90 55)">${S.diode(90, 55, {})}</g>`;
    g += `<path d="M 96 48 l 6 -6 M 99 48 l 6 -6" stroke="${S.color}" stroke-width="1"/>`;
    g += S.line(90, 67, 90, 88); g += S.line(40, 88, 90, 88);
    g += S.txt(30, 53, 'In', { anchor: 'end', size: 8, fill: '#64748b' });
    // 二次側電晶體
    g += S.line(110, 42, 110, 55); g += S.line(122, 50, 160, 50); g += S.txt(162, 53, 'Out', { anchor: 'start', size: 8, fill: '#64748b' });
    g += S.line(110, 70, 110, 95); g += S.line(110, 95, 160, 95);
    g += S.txt(100, 115, '光耦：一二次側隔離回授', { size: 8, fill: '#64748b' });
    return this.wrap(200, 130, g);
  },

  // ORing / 理想二極體
  oring() {
    const S = window.Sym; if (!S) return '';
    let g = '';
    g += S.line(20, 35, 45, 35); g += S.txt(20, 27, 'A路', { anchor: 'start', size: 8, fill: '#64748b' });
    g += S.diode(67, 35, {}); g += S.line(89, 35, 130, 35); g += S.junction(130, 35);
    g += S.line(20, 80, 45, 80); g += S.txt(20, 95, 'B路', { anchor: 'start', size: 8, fill: '#64748b' });
    g += S.diode(67, 80, {}); g += S.line(89, 80, 130, 80);
    g += S.line(130, 35, 130, 80); g += S.line(130, 57, 175, 57); g += S.txt(177, 60, '輸出', { anchor: 'start', size: 8, fill: '#64748b' });
    g += S.txt(95, 115, 'ORing：雙電源自動切換', { size: 8, fill: '#64748b' });
    return this.wrap(220, 130, g);
  },

  // 電荷泵倍壓（Dickson）
  chargePump() {
    const S = window.Sym; if (!S) return '';
    let g = '';
    g += S.line(20, 40, 45, 40); g += S.txt(20, 32, 'Vin', { anchor: 'start', size: 8, fill: '#64748b' });
    g += S.diode(67, 40, {}); g += S.line(89, 40, 130, 40); g += S.junction(110, 40);
    g += S.diode(152, 40, {}); g += S.line(174, 40, 215, 40); g += S.junction(195, 40);
    g += S.txt(217, 32, '≈2Vin', { anchor: 'end', size: 8, fill: '#64748b' });
    // 飛跨電容（時脈驅動）
    g += this.capToGnd(S, 110, 40, 'Cfly');
    g += this.capToGnd(S, 195, 40, 'Cout');
    g += S.txt(110, 120, '時脈切換泵升電壓', { size: 8, fill: '#64748b' });
    return this.wrap(240, 130, g);
  },

  // 整流橋（菱形，二極體陰極朝 V+、陽極朝 V−）
  bridgeRectifier() {
    const S = window.Sym; if (!S) return '';
    let g = '';
    // 四顆二極體：節點 AC1(74,51/59) AC2(146,51/59) V+(106/114,19) V-(106/114,91)
    g += `<g transform="rotate(-45 90 35)">${S.diode(90, 35, {})}</g>`;   // AC1→V+
    g += `<g transform="rotate(-135 90 75)">${S.diode(90, 75, {})}</g>`;  // V-→AC1
    g += `<g transform="rotate(-135 130 35)">${S.diode(130, 35, {})}</g>`;// AC2→V+
    g += `<g transform="rotate(-45 130 75)">${S.diode(130, 75, {})}</g>`; // V-→AC2
    // 節點匯合
    g += S.line(74, 51, 74, 59); g += S.line(146, 51, 146, 59);
    g += S.line(106, 19, 114, 19); g += S.line(106, 91, 114, 91);
    // AC 輸入
    g += S.line(40, 55, 74, 55); g += S.junction(74, 55); g += S.txt(36, 58, 'AC1', { anchor: 'end', size: 8, fill: '#64748b' });
    g += S.line(146, 55, 180, 55); g += S.junction(146, 55); g += S.txt(182, 58, 'AC2', { anchor: 'start', size: 8, fill: '#64748b' });
    // 直流輸出
    g += S.line(110, 19, 110, 8); g += S.junction(110, 19); g += S.txt(118, 11, 'V+', { anchor: 'start', size: 8, fill: '#64748b' });
    g += S.line(110, 91, 110, 106); g += S.junction(110, 91); g += S.ground(110, 120, {});
    g += S.txt(110, 145, '全橋整流（+ 濾波電容）', { size: 8, fill: '#64748b' });
    return this.wrap(210, 152, g);
  },

  // H 橋馬達驅動（4× NMOS）
  hBridge() {
    const S = window.Sym; if (!S) return '';
    const q1 = S.pins.nmos(60, 55), q3 = S.pins.nmos(180, 55);
    const q2 = S.pins.nmos(60, 120), q4 = S.pins.nmos(180, 120);
    let g = '';
    g += S.nmos(60, 55, { showPins: false, flip: true }); g += S.nmos(180, 55, { showPins: false, flip: true });
    g += S.nmos(60, 120, { showPins: false, flip: true }); g += S.nmos(180, 120, { showPins: false, flip: true });
    // V+ 匯流排接上臂上端子 (86,35)/(206,35)
    g += S.rail(146, 16, 'V+'); g += S.line(146, 16, 146, 28); g += S.line(86, 28, 206, 28);
    g += S.line(q1.s[0], 28, q1.s[0], q1.s[1]); g += S.line(q3.s[0], 28, q3.s[0], q3.s[1]);
    // 節點 A：Q1 下端子(86,75) — Q2 上端子(86,100)
    g += S.line(q1.d[0], q1.d[1], q2.s[0], q2.s[1]); g += S.junction(86, 90);
    // 節點 B：Q3 下端子(206,75) — Q4 上端子(206,100)
    g += S.line(q3.d[0], q3.d[1], q4.s[0], q4.s[1]); g += S.junction(206, 90);
    // 馬達跨接 A-B
    g += S.line(86, 90, 132, 90); g += S.circ(146, 90, 14, {}); g += S.txt(146, 94, 'M', { size: 11, weight: 'bold' });
    g += S.line(160, 90, 206, 90);
    // 下臂源極 → 地匯流排
    g += S.line(q2.d[0], q2.d[1], 86, 155); g += S.line(q4.d[0], q4.d[1], 206, 155);
    g += S.line(86, 155, 206, 155); g += S.ground(146, 169, {});
    // 閘極標籤
    g += S.txt(q1.g[0] - 2, q1.g[1] - 4, 'Q1', { anchor: 'end', size: 8, fill: '#64748b' });
    g += S.txt(q2.g[0] - 2, q2.g[1] - 4, 'Q2', { anchor: 'end', size: 8, fill: '#64748b' });
    g += S.txt(q3.g[0] - 2, q3.g[1] - 4, 'Q3', { anchor: 'end', size: 8, fill: '#64748b' });
    g += S.txt(q4.g[0] - 2, q4.g[1] - 4, 'Q4', { anchor: 'end', size: 8, fill: '#64748b' });
    return this.wrap(250, 200, g);
  },

  // 負載開關（PMOS，垂直串聯）
  loadSwitch() {
    const S = window.Sym; if (!S) return '';
    const p = S.pins.nmos(90, 45); // s=[116,25]上, d=[116,65]下, g=[60,45]
    let g = '';
    // Vin → 源極(上) ；汲極(下) → 負載
    g += S.txt(116, 14, 'Vin', { size: 9, fill: '#64748b' }); g += S.line(116, 18, 116, 25);
    g += S.nmos(90, 45, { p: true, showPins: false });
    g += S.line(116, 65, 116, 92); g += S.txt(130, 90, '負載', { anchor: 'start', size: 9, fill: '#64748b' });
    // 閘極 EN 控制
    g += S.line(p.g[0], p.g[1], 38, 45); g += S.txt(34, 48, 'EN', { anchor: 'end', size: 8, fill: '#64748b' });
    g += S.txt(90, 112, 'P-MOS 高側負載開關', { size: 8, fill: '#64748b' });
    return this.wrap(210, 124, g);
  },

  // RC 緩衝（Snubber）
  rcSnubber() {
    const S = window.Sym; if (!S) return '';
    let g = '';
    g += S.line(20, 40, 60, 40); g += S.junction(60, 40); g += S.txt(20, 32, '開關節點', { anchor: 'start', size: 8, fill: '#64748b' });
    g += S.line(60, 40, 130, 40); g += S.junction(130, 40); g += S.txt(132, 38, '→ 整流', { anchor: 'start', size: 8, fill: '#64748b' });
    // RC 串聯到地
    g += S.line(60, 40, 60, 58); g += S.resistor(60, 75, { horizontal: false, label: 'Rs' });
    g += S.line(60, 87, 60, 95); g += `<g>${S.capacitor(60, 117, { label: 'Cs' })}</g>`;
    g += S.line(60, 139, 60, 145); g += S.ground(60, 145, {});
    g += S.txt(130, 110, 'RC Snubber 抑制振鈴/突波', { anchor: 'start', size: 8, fill: '#64748b' });
    return this.wrap(260, 178, g);
  },

  // Forward 正激式隔離轉換器（變壓器 + 一次 MOSFET + 二次整流/續流 + LC）
  forwardConverter() {
    const S = window.Sym; if (!S) return '';
    const p = S.pins.nmos(70, 120); // s=[96,100]上(汲), d=[96,140]下(源), g=[40,120]
    let g = '';
    g += S.rail(60, 18, 'Vin'); g += S.line(60, 18, 60, 40); g += S.line(60, 40, 96, 40);
    g += this._transformer(S, 110, 70, { ratio: '1:N' }); // 一次下腳 (96,100)
    g += S.nmos(70, 120, { source: 'D', drain: 'S', gate: 'G', showPins: false, flip: true }); g += S.junction(96, 100);
    g += S.line(p.d[0], p.d[1], 96, 154); g += S.ground(96, 168, {});
    g += S.line(p.g[0], p.g[1], 26, 120); g += S.txt(22, 123, 'PWM', { anchor: 'end', size: 8, fill: '#64748b' });
    // 二次：整流二極體 D1 → 節點A → 輸出電感 L → Vout
    g += S.line(124, 40, 128, 40); g += S.diode(150, 40, { label: 'D1' }); // 引線 128..172
    g += S.junction(172, 40); g += S.line(172, 40, 176, 40); g += S.inductor(200, 40, { label: 'L' }); // 176..224
    g += S.line(224, 40, 252, 40); g += S.txt(254, 32, 'Vout', { anchor: 'end', size: 9, fill: '#64748b' });
    // 續流二極體 D2：節點A → 地（陰極朝 A=上，續流時電感電流由地經 D2 流回）
    g += S.line(172, 40, 172, 52); g += `<g transform="rotate(-90 172 67)">${S.diode(172, 67, {})}</g>`; // 52..82
    g += S.line(172, 82, 172, 110);
    // Cout 與 二次地
    g += S.junction(238, 40); g += S.line(238, 40, 238, 56); g += S.capacitor(238, 78, { label: 'Cout' }); g += S.line(238, 100, 238, 110);
    g += S.line(124, 100, 124, 110); g += S.line(124, 110, 238, 110);
    g += S.ground(190, 124, {});
    return this.wrap(280, 190, g);
  },

  // CAN 收發器節點（含 120Ω 終端）
  canTransceiver() {
    const S = window.Sym; if (!S) return '';
    const leadL = S.pins.icLeadL(70, 70), leadR = S.pins.icLeadR(70, 70); // 21 / 119
    const txdY = S.icPinY(70, 2, 0), rxdY = S.icPinY(70, 2, 1);  // 61 / 79
    const hY = S.icPinY(70, 2, 0), lY = S.icPinY(70, 2, 1);      // CANH 61 / CANL 79
    let g = '';
    g += S.ic(70, 70, { width: 70, height: 64, label: 'CAN 收發器', pinsLeft: ['TXD', 'RXD'], pinsRight: ['CANH', 'CANL'] });
    g += S.line(leadL, txdY, 20, txdY); g += S.txt(18, txdY + 3, 'TXD', { anchor: 'end', size: 8, fill: '#64748b' });
    g += S.line(leadL, rxdY, 20, rxdY); g += S.txt(18, rxdY + 3, 'RXD', { anchor: 'end', size: 8, fill: '#64748b' });
    // 匯流排 CANH/CANL → 120Ω 終端
    g += S.line(leadR, hY, 210, hY); g += S.junction(210, hY); g += S.line(210, hY, 210, 46);
    g += S.line(leadR, lY, 210, lY); g += S.junction(210, lY); g += S.line(210, lY, 210, 94);
    g += S.resistor(210, 70, { horizontal: false, label: '120Ω', labelSide: 'right' }); // 引線 46..94
    g += S.txt(125, hY - 6, 'CANH', { size: 8, fill: '#64748b' }); g += S.txt(125, lY + 12, 'CANL', { size: 8, fill: '#64748b' });
    return this.wrap(258, 140, g);
  },

  // RS-485 收發器（半雙工，120Ω 終端）
  rs485Transceiver() {
    const S = window.Sym; if (!S) return '';
    const leadL = S.pins.icLeadL(70, 70), leadR = S.pins.icLeadR(70, 70); // 21 / 119
    const aY = S.icPinY(78, 2, 0), bY = S.icPinY(78, 2, 1); // A 69 / B 87
    let g = '';
    g += S.ic(70, 78, { width: 70, height: 80, label: 'RS-485', pinsLeft: ['DI', 'RO', 'DE/RE'], pinsRight: ['A', 'B'] });
    ['DI', 'RO', 'DE/RE'].forEach((nm, i) => { const y = S.icPinY(78, 3, i); g += S.line(leadL, y, 20, y); g += S.txt(18, y + 3, nm, { anchor: 'end', size: 7, fill: '#64748b' }); });
    g += S.line(leadR, aY, 210, aY); g += S.junction(210, aY); g += S.line(210, aY, 210, 54);
    g += S.line(leadR, bY, 210, bY); g += S.junction(210, bY); g += S.line(210, bY, 210, 102);
    g += S.resistor(210, 78, { horizontal: false, label: '120Ω', labelSide: 'right' }); // 54..102
    g += S.txt(125, aY - 6, 'A', { size: 8, fill: '#64748b' }); g += S.txt(125, bY + 12, 'B', { size: 8, fill: '#64748b' });
    return this.wrap(258, 150, g);
  },

  // 繼電器驅動（低端 NMOS + 線圈 + 飛輪二極體）
  relayDriver() {
    const S = window.Sym; if (!S) return '';
    const p = S.pins.nmos(120, 120); // s=[146,100]上(汲), d=[146,140]下(源), g=[90,120]
    let g = '';
    g += S.rail(146, 15, 'V+'); g += S.line(146, 15, 146, 31);
    // 線圈（垂直電感 31..79）
    g += `<g transform="rotate(90 146 55)">${S.inductor(146, 55, { label: '' })}</g>`;
    g += S.txt(120, 58, '繼電器線圈', { anchor: 'end', size: 8, fill: '#64748b' });
    g += S.junction(146, 31); g += S.line(146, 79, p.s[0], p.s[1]); // 線圈下 → 汲極(146,100)
    g += S.nmos(120, 120, { source: 'D', drain: 'S', gate: 'G', showPins: false, flip: true });
    g += S.line(p.d[0], p.d[1], 146, 156); g += S.ground(146, 170, {});
    g += S.line(p.g[0], p.g[1], 60, 120); g += S.txt(56, 123, 'IN', { anchor: 'end', size: 8, fill: '#64748b' });
    // 飛輪二極體（跨線圈，陰極朝 V+）
    g += S.junction(146, 79); g += S.line(146, 79, 190, 79);
    g += `<g transform="rotate(-90 190 57)">${S.diode(190, 57, {})}</g>`; // 陽極(190,79) 陰極(190,35)
    g += S.line(190, 35, 190, 31); g += S.line(190, 31, 146, 31);
    g += S.txt(206, 60, '飛輪', { anchor: 'start', size: 8, fill: '#64748b' });
    return this.wrap(240, 202, g);
  },

  // 惠斯通電橋（4 電阻 + 差動輸出）
  wheatstoneBridge() {
    const S = window.Sym; if (!S) return '';
    let g = '';
    // 上節點 V+ (y=20)，下節點 GND (y=140)，左中(60,80) 右中(160,80)
    g += S.rail(110, 12, 'V+'); g += S.line(60, 20, 160, 20); g += S.line(110, 12, 110, 20);
    g += S.line(60, 20, 60, 26); g += S.line(160, 20, 160, 26);
    g += S.resistor(60, 50, { horizontal: false, label: 'R1' });  // 26..74
    g += S.resistor(160, 50, { horizontal: false, label: 'R2' });
    g += S.line(60, 74, 60, 80); g += S.junction(60, 80);
    g += S.line(160, 74, 160, 80); g += S.junction(160, 80);
    g += S.resistor(60, 110, { horizontal: false, label: 'R3' }); // 86..134
    g += S.resistor(160, 110, { horizontal: false, label: 'R4' });
    g += S.line(60, 80, 60, 86); g += S.line(160, 80, 160, 86);
    g += S.line(60, 134, 60, 140); g += S.line(160, 134, 160, 140);
    g += S.line(60, 140, 160, 140); g += S.ground(110, 154, {});
    // 差動輸出
    g += S.line(60, 80, 36, 80); g += S.txt(34, 83, 'Vo+', { anchor: 'end', size: 8, fill: '#64748b' });
    g += S.line(160, 80, 184, 80); g += S.txt(186, 83, 'Vo−', { anchor: 'start', size: 8, fill: '#64748b' });
    return this.wrap(220, 188, g);
  },

  // 電流鏡（NPN，Q1 二極體接法 + Q2 鏡像）
  currentMirror() {
    const S = window.Sym; if (!S) return '';
    const q1 = S.pins.bjt(90, 105), q2 = S.pins.bjt(170, 105); // b/c/e
    let g = '';
    // Vcc 軌
    g += S.rail(130, 14, 'Vcc'); g += S.line(130, 14, 130, 20); g += S.line(98, 20, 178, 20);
    // Rref → Q1 集極；Rload → Q2 集極
    g += S.resistor(98, 45, { horizontal: false, label: 'Rref' }); g += S.line(98, 21, 98, 20); g += S.line(98, 69, q1.c[0], q1.c[1]); // 69→(98,75)
    g += S.resistor(178, 45, { horizontal: false, label: 'Rload' }); g += S.line(178, 21, 178, 20); g += S.line(178, 69, q2.c[0], q2.c[1]);
    g += S.txt(196, 48, 'I_out', { anchor: 'start', size: 8, fill: '#64748b' });
    // 電晶體
    g += S.npn(90, 105, { showPins: false }); g += S.npn(170, 105, { showPins: false });
    g += S.txt(70, 100, 'Q1', { anchor: 'end', size: 8, fill: '#64748b' }); g += S.txt(150, 100, 'Q2', { anchor: 'end', size: 8, fill: '#64748b' });
    // Q1 二極體接法：基極 → 集極（左側繞行，避開本體）
    g += S.line(q1.b[0], q1.b[1], 50, 105); g += S.line(50, 105, 50, 75); g += S.line(50, 75, q1.c[0], q1.c[1]); g += S.junction(q1.c[0], q1.c[1]);
    // 基極匯流排 Q1—Q2
    g += S.line(q1.b[0], q1.b[1], q2.b[0], q2.b[1]); g += S.junction(q1.b[0], q1.b[1]); g += S.junction(q2.b[0], q2.b[1]);
    // 射極 → 地
    g += S.line(q1.e[0], q1.e[1], 98, 152); g += S.line(q2.e[0], q2.e[1], 178, 152);
    g += S.line(98, 152, 178, 152); g += S.ground(138, 166, {});
    return this.wrap(230, 196, g);
  },

  // NPN 低端開關
  bjtSwitch() {
    const S = window.Sym; if (!S) return '';
    const q = S.pins.bjt(120, 110); // b=[94,110], c=[128,80], e=[128,140]
    let g = '';
    // Vcc → 負載 RL → 集極
    g += S.rail(128, 14, 'Vcc'); g += S.line(128, 14, 128, 30);
    g += S.resistor(128, 54, { horizontal: false, label: 'RL', value: '負載' }); // 30..78
    g += S.line(128, 78, q.c[0], q.c[1]); // 78→(128,80)
    g += S.npn(120, 110, { showPins: false });
    // 集極輸出節點
    g += S.junction(q.c[0], q.c[1]); g += S.line(q.c[0], q.c[1], 168, 80); g += S.txt(170, 83, '輸出', { anchor: 'start', size: 8, fill: '#64748b' });
    // 射極 → 地
    g += S.line(q.e[0], q.e[1], 128, 156); g += S.ground(128, 170, {});
    // 基極 ← Rb ← IN
    g += S.resistor(70, 110, { horizontal: true, label: 'Rb' }); // 46..94 → base 94
    g += S.line(46, 110, 28, 110); g += S.txt(24, 113, 'IN', { anchor: 'end', size: 8, fill: '#64748b' });
    g += S.txt(120, 192, 'NPN 低端開關（基極電阻限流）', { size: 8, fill: '#64748b' });
    return this.wrap(220, 200, g);
  },

  // 推挽轉換器（中心抽頭一次側 + 兩開關交替 + 中心抽頭二次全波整流）
  pushPull() {
    const S = window.Sym; if (!S) return '';
    let g = '';
    // 一次側中心抽頭（水平兩半繞組）
    g += S.inductor(100, 48, {}); g += S.inductor(252, 48, {}); // 76..124 / 228..276
    g += S.line(124, 48, 228, 48); g += S.junction(176, 48);    // 中心抽頭節點
    // V+（中心抽頭往上）
    g += S.line(176, 48, 176, 24); g += S.line(164, 24, 188, 24); g += S.txt(176, 18, 'V+', { size: 9, fill: '#64748b' });
    // Q1 / Q2（汲極接一次兩端，源極各自接地）
    g += S.line(76, 48, 76, 75); g += S.nmos(50, 95, { showPins: false, flip: true }); g += S.line(76, 115, 76, 131); g += S.ground(76, 131, {});
    g += S.txt(16, 98, 'G1', { anchor: 'end', size: 8, fill: '#64748b' });
    g += S.line(276, 48, 276, 75); g += S.nmos(250, 95, { showPins: false, flip: true }); g += S.line(276, 115, 276, 131); g += S.ground(276, 131, {});
    g += S.txt(224, 84, 'G2', { anchor: 'middle', size: 8, fill: '#64748b' });
    // 二次側中心抽頭（水平）+ 鐵芯耦合
    g += S.inductor(135, 86, {}); g += S.inductor(185, 86, {}); // 111..159 / 161..209
    g += S.line(159, 86, 161, 86); g += S.junction(160, 86);
    g += S.line(111, 62, 209, 62, { w: 1 }); g += S.line(111, 70, 209, 70, { w: 1 }); // 鐵芯
    g += S.txt(105, 89, 'Ns', { anchor: 'end', size: 8, fill: '#64748b' });
    // D1 / D2 全波整流 → +Vout
    g += S.line(111, 86, 111, 105); g += `<g transform="rotate(90 111 127)">${S.diode(111, 127, {})}</g>`; g += S.line(111, 149, 111, 165);
    g += S.line(209, 86, 209, 105); g += `<g transform="rotate(90 209 127)">${S.diode(209, 127, {})}</g>`; g += S.line(209, 149, 209, 165);
    g += S.line(111, 165, 235, 165); g += S.junction(209, 165); g += S.txt(206, 159, 'Vout', { anchor: 'end', size: 9, fill: '#64748b' });
    // 中心抽頭 → 輸出負端（往下，與 +Vout 軌為標準無接點交叉）
    g += S.line(160, 86, 160, 209);
    g += S.line(160, 209, 235, 209); g += S.ground(160, 223, {});
    // Cout（+Vout 軌 ↔ 返回軌）
    g += S.capacitor(235, 187, { label: 'Cout', labelSide: 'right' });
    return this.wrap(300, 238, g);
  },

  // 全橋轉換器（4 開關橋臂驅動變壓器一次側；二次側橋式整流）
  fullBridge() {
    const S = window.Sym; if (!S) return '';
    const q1 = S.pins.nmos(60, 60), q3 = S.pins.nmos(200, 60);
    const q2 = S.pins.nmos(60, 120), q4 = S.pins.nmos(200, 120);
    let g = '';
    // V+ 匯流排（上臂汲極）
    g += S.rail(130, 14, 'V+'); g += S.line(40, 28, 220, 28); g += S.line(130, 18, 130, 28);
    g += S.nmos(60, 60, { showPins: false, flip: true }); g += S.nmos(200, 60, { showPins: false, flip: true });
    g += S.nmos(60, 120, { showPins: false, flip: true }); g += S.nmos(200, 120, { showPins: false, flip: true });
    g += S.line(q1.s[0], 28, q1.s[0], q1.s[1]); g += S.line(q3.s[0], 28, q3.s[0], q3.s[1]);
    // 節點 A（Q1 下端子—Q2 上端子）、B（Q3—Q4）
    g += S.line(q1.d[0], q1.d[1], q2.s[0], q2.s[1]); g += S.junction(86, 90);
    g += S.line(q3.d[0], q3.d[1], q4.s[0], q4.s[1]); g += S.junction(226, 90);
    // 變壓器一次側（A—B 之間，水平）
    g += S.line(86, 90, 110, 90); g += S.inductor(134, 90, { label: 'Np' }); // 110..158
    g += S.line(158, 90, 226, 90); g += S.junction(226, 90);
    // 下臂源極 → 地
    g += S.line(q2.d[0], q2.d[1], 86, 158); g += S.line(q4.d[0], q4.d[1], 226, 158);
    g += S.line(86, 158, 226, 158); g += S.ground(156, 172, {});
    // 閘極標籤
    g += S.txt(q1.g[0] - 2, q1.g[1] - 4, 'Q1', { anchor: 'end', size: 8, fill: '#64748b' });
    g += S.txt(q2.g[0] - 2, q2.g[1] - 4, 'Q2', { anchor: 'end', size: 8, fill: '#64748b' });
    g += S.txt(q3.g[0] - 2, q3.g[1] - 4, 'Q3', { anchor: 'end', size: 8, fill: '#64748b' });
    g += S.txt(q4.g[0] - 2, q4.g[1] - 4, 'Q4', { anchor: 'end', size: 8, fill: '#64748b' });
    g += S.txt(134, 200, '全橋驅動一次側；二次側經橋式整流輸出', { anchor: 'middle', size: 8, fill: '#64748b' });
    return this.wrap(290, 215, g);
  },

  // Zener 並聯穩壓（Rs 限流 + Zener 箝位）
  zenerReg() {
    const S = window.Sym; if (!S) return '';
    let g = '';
    g += S.line(20, 45, 50, 45); g += S.txt(18, 37, 'Vin', { anchor: 'start', size: 9, fill: '#64748b' });
    g += S.resistor(75, 45, { horizontal: true, label: 'Rs' }); // 51..99
    g += S.line(99, 45, 130, 45); g += S.junction(130, 45);
    // Zener → GND（陰極朝上=Vout 端）
    g += S.line(130, 45, 130, 60);
    g += `<g transform="rotate(-90 130 75)">${S.diode(130, 75, {})}</g>`; // 垂直齊納
    g += S.line(130, 90, 130, 98); g += S.ground(130, 98, {});
    g += S.txt(146, 78, 'Zener', { anchor: 'start', size: 8, fill: '#64748b' });
    // Vout
    g += S.line(130, 45, 190, 45); g += S.txt(192, 37, 'Vout', { anchor: 'end', size: 9, fill: '#64748b' });
    return this.wrap(210, 128, g);
  },

  // PWM 控制（鋸齒 vs 誤差電壓 → 比較器 → PWM）
  pwmControl() {
    const S = window.Sym; if (!S) return '';
    let g = '';
    // 鋸齒波 → 比較器 +
    g += `<polyline points="20,40 40,28 40,40 60,28 60,40 80,28 80,40" fill="none" stroke="${S.color}" stroke-width="2"/>`;
    g += S.txt(20, 22, '鋸齒波', { anchor: 'start', size: 8, fill: '#64748b' });
    g += S.line(80, 34, 100, 34);
    // 誤差電壓 → 比較器 −
    g += S.line(20, 80, 100, 80); g += S.txt(20, 92, 'Vctrl(誤差)', { anchor: 'start', size: 8, fill: '#64748b' });
    // 比較器
    g += `<polygon points="100,24 100,90 150,57" fill="#fff" stroke="${S.color}" stroke-width="2"/>`;
    g += S.txt(110, 40, '+', { size: 11, raw: true }); g += S.txt(110, 76, '−', { size: 11, raw: true });
    // PWM 輸出
    g += S.line(150, 57, 170, 57);
    g += `<polyline points="170,72 185,72 185,42 205,42 205,72 220,72 220,42 240,42" fill="none" stroke="${S.color}" stroke-width="2"/>`;
    g += S.line(170, 57, 170, 72);
    g += S.txt(205, 92, 'PWM 輸出', { anchor: 'middle', size: 8, fill: '#64748b' });
    g += S.txt(125, 120, '占空比 = 誤差電壓決定', { anchor: 'middle', size: 8, fill: '#64748b' });
    return this.wrap(250, 135, g);
  },

  // DDR / VTT 終端（串聯 + 並聯到 VTT=Vdd/2）
  ddrTermination() {
    const S = window.Sym; if (!S) return '';
    let g = '';
    // 驅動端
    g += `<polygon points="24,40 24,70 50,55" fill="#fff" stroke="${S.color}" stroke-width="2"/>`;
    g += S.line(12, 55, 24, 55); g += S.txt(34, 90, '驅動', { size: 8, fill: '#64748b' });
    // 傳輸線
    g += S.line(50, 55, 150, 55); g += S.txt(100, 47, 'Z0 走線', { size: 8, fill: '#64748b' });
    g += S.junction(150, 55);
    // 末端並聯 Rt → VTT 軌
    g += S.line(150, 55, 150, 54); g += S.resistor(150, 30, { horizontal: false, label: 'Rt', labelSide: 'right' }); // 引線 6..54
    g += S.line(120, 6, 180, 6); g += S.txt(184, 9, 'VTT=Vdd/2', { anchor: 'start', size: 8, fill: '#64748b' }); // VTT 軌
    // 接收端
    g += S.line(150, 55, 200, 55); g += `<polygon points="200,40 200,70 226,55" fill="#fff" stroke="${S.color}" stroke-width="2"/>`;
    g += S.line(226, 55, 240, 55); g += S.txt(213, 90, '接收', { size: 8, fill: '#64748b' });
    g += S.txt(125, 110, '末端並聯到 VTT（戴維寧/VTT 終端）', { anchor: 'middle', size: 8, fill: '#64748b' });
    return this.wrap(255, 122, g);
  },

  // 光電二極體跨阻放大 (TIA)
  photodiodeTia() {
    const S = window.Sym; if (!S) return '';
    let g = '';
    // 光電二極體 → − 輸入
    g += `<g transform="rotate(90 40 70)">${S.diode(40, 70, {})}</g>`; // 垂直光電二極體
    g += S.txt(14, 73, 'PD光', { anchor: 'start', size: 8, fill: '#64748b' });
    g += S.line(40, 92, 40, 110); g += S.ground(40, 110, {}); // 陽極接地(反偏)
    g += S.line(40, 48, 40, 35); g += S.line(40, 35, 75, 35); // 陰極 → − 節點
    // 運放
    g += `<polygon points="75,20 75,70 130,45" fill="#fff" stroke="${S.color}" stroke-width="2"/>`;
    g += S.txt(83, 40, '−', { size: 11, raw: true }); g += S.txt(83, 62, '+', { size: 11, raw: true });
    g += S.junction(75, 35);
    // + 接地
    g += S.line(75, 58, 60, 58); g += S.line(60, 58, 60, 78); g += S.ground(60, 78, {});
    // Rf 回授（− → 輸出）
    g += S.line(75, 35, 75, 20); g += S.line(75, 20, 91, 20);
    g += S.resistor(115, 20, { horizontal: true, label: 'Rf' }); // 91..139
    g += S.line(139, 20, 155, 20); g += S.line(155, 20, 155, 45); g += S.junction(155, 45);
    // 輸出
    g += S.line(130, 45, 185, 45); g += S.txt(187, 37, 'Vout', { anchor: 'end', size: 9, fill: '#64748b' });
    g += S.txt(110, 95, 'Vout = −I_PD × Rf', { anchor: 'middle', size: 8, fill: '#64748b' });
    return this.wrap(210, 128, g);
  },

  // 儀表放大器（3-opamp INA）：兩級輸入緩衝(A1/A2)+Rg 設增益，A3 差動級除共模。
  instrumentationAmp() {
    const S = window.Sym; if (!S) return '';
    const col = S.color;
    let g = '';
    // ---- A1 輸入緩衝（上）----
    g += `<polygon points="95,30 95,70 150,50" fill="#fff" stroke="${col}" stroke-width="2"/>`;
    g += S.txt(104, 44, '+', { size: 10, raw: true });
    g += S.txt(104, 65, '−', { size: 10, raw: true });
    g += S.txt(120, 50, 'A1', { size: 8, fill: '#64748b' });
    g += S.line(95, 40, 45, 40); g += S.txt(42, 43, 'V1', { anchor: 'end', size: 9, fill: '#64748b' }); // 外部輸入
    g += S.line(95, 60, 70, 60); g += S.junction(70, 60);   // − 節點 N1
    g += S.line(150, 50, 175, 50); g += S.junction(175, 50); // 輸出 O1
    // R1 回授（N1 → 上 → R1 → O1）
    g += S.line(70, 60, 70, 24); g += S.line(70, 24, 91, 24);
    g += S.resistor(115, 24, { horizontal: true, label: 'R1' });
    g += S.line(139, 24, 175, 24); g += S.line(175, 24, 175, 50);
    // ---- A2 輸入緩衝（下，鏡像）----
    g += `<polygon points="95,180 95,220 150,200" fill="#fff" stroke="${col}" stroke-width="2"/>`;
    g += S.txt(104, 194, '−', { size: 10, raw: true });
    g += S.txt(104, 215, '+', { size: 10, raw: true });
    g += S.txt(120, 200, 'A2', { size: 8, fill: '#64748b' });
    g += S.line(95, 210, 45, 210); g += S.txt(42, 213, 'V2', { anchor: 'end', size: 9, fill: '#64748b' });
    g += S.line(95, 190, 70, 190); g += S.junction(70, 190); // − 節點 N2
    g += S.line(150, 200, 175, 200); g += S.junction(175, 200); // 輸出 O2
    // R1' 回授（N2 → 下 → R1 → O2），標籤手動置下避免壓三角
    g += S.line(70, 190, 70, 232); g += S.line(70, 232, 91, 232);
    g += S.resistor(115, 232, { horizontal: true });
    g += S.txt(115, 248, 'R1', { size: 10 });
    g += S.line(139, 232, 175, 232); g += S.line(175, 232, 175, 200);
    // 增益電阻 Rg（N1 ↔ N2）
    g += S.line(70, 60, 70, 101); g += S.line(70, 149, 70, 190);
    g += S.resistor(70, 125, { horizontal: false, label: 'Rg', labelSide: 'left' });
    // ---- A3 差動放大（右）----
    g += `<polygon points="275,105 275,145 320,125" fill="#fff" stroke="${col}" stroke-width="2"/>`;
    g += S.txt(284, 119, '−', { size: 10, raw: true });
    g += S.txt(282, 138, '+', { size: 10, raw: true });
    g += S.txt(296, 125, 'A3', { size: 8, fill: '#64748b' });
    g += S.line(320, 125, 360, 125); g += S.junction(340, 125);
    g += S.txt(362, 128, 'Vout', { anchor: 'start', size: 9, fill: '#64748b' });
    // 上輸入：O1 → R2 → A3 −
    g += S.line(175, 50, 200, 50); g += S.line(200, 50, 200, 115); g += S.line(200, 115, 206, 115);
    g += S.resistor(230, 115, { horizontal: true, label: 'R2' });
    g += S.line(254, 115, 275, 115);
    // 下輸入：O2 → R2 → A3 +（標籤置下）
    g += S.line(175, 200, 200, 200); g += S.line(200, 200, 200, 135); g += S.line(200, 135, 206, 135);
    g += S.resistor(230, 135, { horizontal: true });
    g += S.txt(230, 150, 'R2', { size: 10 });
    g += S.line(254, 135, 275, 135); g += S.junction(264, 135);
    // + 端參考電阻 R3 → 地
    g += S.line(264, 135, 264, 165);
    g += S.resistor(264, 189, { horizontal: false, label: 'R3', labelSide: 'right' });
    g += S.line(264, 213, 264, 222); g += S.ground(264, 222, {});
    // − 端回授 R3（輸出 → R3 → A3 −）
    g += S.line(340, 125, 340, 90); g += S.line(340, 90, 314, 90);
    g += S.resistor(290, 90, { horizontal: true, label: 'R3' });
    g += S.line(266, 90, 266, 115); g += S.junction(266, 115); g += S.line(266, 115, 275, 115);
    return this.wrap(400, 256, g);
  },

  // 雙 FET 防漏 / 開汲極域隔離（兩級 NMOS 開汲極緩衝，上拉接 STBY）
  preventLeakage() {
    const S = window.Sym; if (!S) return '';
    let g = '';
    // VCC_3V3_STBY 軌 + 旗標
    g += S.line(64, 34, 300, 34);
    g += S.line(182, 34, 182, 22); g += S.line(173, 22, 191, 22);
    g += S.txt(182, 16, 'VCC_3V3_STBY', { size: 8, fill: '#64748b' });
    g += S.junction(64, 34); g += S.junction(182, 34);
    // R388 10k 上拉 → LR_L（左 FET 閘）
    g += S.line(64, 34, 64, 68);
    g += S.resistor(64, 92, { horizontal: false, label: 'R388', value: '10k', labelSide: 'left' });
    g += S.line(64, 116, 64, 150); g += S.junction(64, 150);
    g += S.line(64, 150, 30, 150); g += S.txt(28, 153, 'LR_L', { anchor: 'end', size: 9 });
    g += S.line(64, 150, 64, 210); g += S.line(64, 210, 80, 210);
    // R387 100k 上拉 → RTC_CLR_G
    g += S.line(182, 34, 182, 68);
    g += S.resistor(182, 92, { horizontal: false, label: 'R387', value: '100k', labelSide: 'right' });
    g += S.line(182, 116, 182, 150); g += S.junction(182, 150);
    // M1（左）：閘=LR_L、汲=RTC_CLR_G(上)、源=GND(下)
    g += S.nmos(110, 210, { showPins: false, flip: true });
    g += S.txt(78, 206, 'G', { anchor: 'end', size: 9 });
    g += S.txt(140, 188, 'D', { anchor: 'start', size: 9 });
    g += S.txt(140, 234, 'S', { anchor: 'start', size: 9 });
    g += S.txt(108, 256, 'M1', { size: 8, fill: '#64748b' });
    g += S.line(136, 190, 136, 150);                       // 汲 → N_G
    g += S.line(136, 230, 136, 262); g += S.ground(136, 262, {}); // 源 → GND
    // RTC_CLR_G 節點 → M2 閘
    g += S.txt(150, 141, 'RTC_CLR_G', { size: 8, fill: '#64748b' });
    g += S.line(182, 150, 240, 150); g += S.line(240, 150, 240, 210);
    // M2（右）：閘=RTC_CLR_G、汲=輸出、源=GND
    g += S.nmos(270, 210, { showPins: false, flip: true });
    g += S.txt(238, 206, 'G', { anchor: 'end', size: 9 });
    g += S.txt(293, 185, 'D', { anchor: 'end', size: 9 });
    g += S.txt(300, 234, 'S', { anchor: 'start', size: 9 });
    g += S.txt(268, 256, 'M2', { size: 8, fill: '#64748b' });
    g += S.line(296, 230, 296, 262); g += S.ground(296, 262, {}); // 源 → GND
    g += S.line(296, 190, 360, 190);                       // 汲 → 輸出
    g += S.txt(330, 178, 'RTC_CLR_OD_L', { size: 8, fill: '#64748b' });
    return this.wrap(400, 300, g);
  },

  // Bandgap 基準：概念圖（CTAT VBE + PTAT ΔVBE → 溫度無關 Vref≈1.2V）
  bandgapConcept() {
    const S = window.Sym; if (!S) return '';
    const col = S.color;
    let g = '';
    function box(x, y, w, h, t1, t2) {
      let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="#fff" stroke="${col}" stroke-width="2"/>`;
      s += S.txt(x + w / 2, y + h / 2 - 2, t1, { size: 9, weight: '600' });
      s += S.txt(x + w / 2, y + h / 2 + 12, t2, { size: 8, fill: '#64748b' });
      return s;
    }
    // 兩個產生器
    g += box(24, 30, 132, 48, 'VBE (CTAT)', '−2 mV/°C');
    g += box(24, 130, 132, 48, 'ΔVBE × M (PTAT)', '+ ~2 mV/°C');
    // 加總節點
    g += S.circ(232, 104, 20, { color: col, w: 2, fill: '#fff' });
    g += S.txt(232, 110, 'Σ', { size: 16, weight: '600' });
    // 連線（加箭頭）：B1 → Σ
    g += S.line(156, 54, 192, 54); g += S.line(192, 54, 192, 90); g += S.line(192, 90, 210, 99);
    g += S.tri('210,99 202,94 205,103', { color: col, fill: col });
    g += S.txt(184, 86, '+', { size: 11, raw: true });
    // B2 → Σ
    g += S.line(156, 154, 192, 154); g += S.line(192, 154, 192, 118); g += S.line(192, 118, 210, 109);
    g += S.tri('210,109 205,105 202,114', { color: col, fill: col });
    g += S.txt(184, 128, '+', { size: 11, raw: true });
    // Σ → Vref
    g += S.line(252, 104, 300, 104); g += S.tri('300,104 292,100 292,108', { color: col, fill: col });
    g += S.txt(306, 100, 'Vref ≈ 1.2V', { anchor: 'start', size: 10, weight: '600' });
    g += S.txt(306, 114, '≈ 0 ppm/°C', { anchor: 'start', size: 8, fill: '#64748b' });
    return this.wrap(420, 200, g);
  },

  // Bandgap 核心 schematic：運放強制 VA=VB，左 Q1(×1)、右 R3+Q2(×N)，Vref=VBE+M·ΔVBE
  bandgapCore() {
    const S = window.Sym; if (!S) return '';
    const col = S.color;
    let g = '';
    // Vref 軌
    g += S.line(80, 50, 305, 50);
    g += S.junction(80, 50); g += S.junction(160, 50); g += S.junction(305, 50);
    g += S.txt(180, 44, 'Vref ≈ 1.2V', { size: 9, weight: '600' });
    // 左支路 R1 → nodeA → Q1(×1)
    g += S.line(80, 50, 80, 66);
    g += S.resistor(80, 90, { horizontal: false, label: 'R1', labelSide: 'left' });
    g += S.line(80, 114, 80, 140); g += S.junction(80, 140);
    g += S.npn(72, 170, { showPins: false });                   // collector(80,140) emitter(80,200) base(46,170)
    g += S.line(46, 170, 46, 140); g += S.line(46, 140, 80, 140); // 二極體接法(base=collector)
    g += S.line(80, 200, 80, 216); g += S.ground(80, 216, {});
    g += S.txt(98, 158, 'A=1', { size: 8, fill: '#64748b' });
    // 右支路 R2 → nodeB → R3 → Q2(×N)
    g += S.line(160, 50, 160, 66);
    g += S.resistor(160, 90, { horizontal: false, label: 'R2', labelSide: 'right' });
    g += S.line(160, 114, 160, 140); g += S.junction(160, 140);
    g += S.resistor(160, 164, { horizontal: false, label: 'R3', labelSide: 'right' }); // term 140..188
    g += S.line(160, 188, 160, 190);
    g += S.npn(152, 220, { showPins: false });                  // collector(160,190) emitter(160,250) base(126,220)
    g += S.line(126, 220, 126, 190); g += S.line(126, 190, 160, 190);
    g += S.line(160, 250, 160, 266); g += S.ground(160, 266, {});
    g += S.txt(178, 208, 'A=N', { size: 8, fill: '#64748b' });
    // 運放：+ = nodeA、− = nodeB、out → Vref
    g += `<polygon points="250,110 250,170 305,140" fill="#fff" stroke="${col}" stroke-width="2"/>`;
    g += S.txt(256, 130, '+', { size: 11, raw: true });
    g += S.txt(256, 161, '−', { size: 11, raw: true });
    g += S.txt(274, 144, 'A1', { size: 8, fill: '#64748b' });
    g += S.line(305, 140, 305, 50);                              // out → Vref 軌
    // + 感測 ← nodeA（lane y=125，經 R2/nodeB 間隙不接觸）
    g += S.line(250, 125, 120, 125); g += S.line(120, 125, 120, 140); g += S.line(120, 140, 80, 140);
    // − 感測 ← nodeB
    g += S.line(250, 155, 200, 155); g += S.line(200, 155, 200, 140); g += S.line(200, 140, 160, 140);
    return this.wrap(340, 290, g);
  },

  // 電源監控 / Reset IC（voltage supervisor）：VCC<Vth → 開汲極 /RST 拉低 + 延時
  powerSupervisor() {
    const S = window.Sym; if (!S) return '';
    let g = '';
    // VCC 軌 + 旗標
    g += S.line(50, 40, 290, 40); g += S.junction(50, 40); g += S.junction(245, 40);
    g += S.line(50, 40, 50, 30); g += S.line(42, 30, 58, 30); g += S.txt(50, 24, 'VCC', { size: 8, fill: '#64748b' });
    // 監控 IC
    g += S.ic(160, 100, { width: 92, pinsLeft: ['VCC', 'GND'], pinsRight: ['/RST'], label: 'Supervisor' });
    g += S.txt(160, 160, 'MAX809 / TPS3823', { size: 8, fill: '#64748b' });
    // VCC 腳 → 軌 + 旁路電容
    g += S.line(100, 91, 50, 91); g += S.line(50, 91, 50, 40);
    g += S.junction(72, 91); g += this.capToGnd(S, 72, 91, 'C1');
    // GND 腳 → 地
    g += S.line(100, 109, 100, 150); g += S.ground(100, 150, {});
    // /RST 開汲極輸出 + 上拉 → MCU
    g += S.line(220, 100, 245, 100); g += S.junction(245, 100);
    g += S.resistor(245, 70, { horizontal: false, label: 'Rpu', labelSide: 'right' }); // term 46..94
    g += S.line(245, 94, 245, 100); g += S.line(245, 46, 245, 40);
    g += S.line(245, 100, 300, 100); g += S.txt(298, 113, '→ MCU /RESET', { anchor: 'end', size: 8, fill: '#64748b' });
    // 說明
    g += S.txt(180, 170, 'VCC<Vth → /RST 拉低 + 延時釋放', { size: 8, fill: '#64748b' });
    return this.wrap(360, 186, g);
  },

  // 比較器 vs 運放：並排對比（左=開迴路比較器+遲滯、右=閉迴路運放）
  comparatorVsOpamp() {
    const S = window.Sym; if (!S) return '';
    const col = S.color;
    let g = '';
    // ---- 左：比較器 ----
    g += `<polygon points="55,40 55,90 100,65" fill="#fff" stroke="${col}" stroke-width="2"/>`;
    g += `<path d="M 66 68 L 74 68 L 74 62 L 80 62 M 80 62 L 72 62 L 72 68 L 66 68" fill="none" stroke="${col}" stroke-width="1.3"/>`;
    g += S.txt(61, 56, '+', { size: 10, raw: true }) + S.txt(61, 84, '−', { size: 10, raw: true });
    g += S.line(22, 53, 55, 53) + S.txt(20, 56, 'Vin', { anchor: 'end', size: 8, fill: '#64748b' });
    g += S.line(22, 81, 55, 81) + S.txt(20, 84, 'Vref', { anchor: 'end', size: 8, fill: '#64748b' });
    g += S.line(100, 65, 145, 65) + S.txt(147, 62, '數位 H/L', { anchor: 'start', size: 8, fill: '#64748b' });
    g += S.txt(77, 110, '比較器', { size: 10, weight: '600' });
    g += S.txt(77, 124, '開迴路·快·數位輸出', { size: 8, fill: '#64748b' });
    // ---- 右：運放(閉迴路) ----
    g += `<polygon points="240,40 240,90 285,65" fill="#fff" stroke="${col}" stroke-width="2"/>`;
    g += S.txt(246, 56, '−', { size: 10, raw: true }) + S.txt(246, 84, '+', { size: 10, raw: true });
    g += S.line(205, 53, 224, 53); g += S.junction(224, 53);
    g += S.line(224, 53, 240, 53);
    // Rf 回授迴圈
    g += S.line(285, 65, 320, 65); g += S.junction(308, 65);
    g += S.line(308, 65, 308, 30); g += S.line(308, 30, 224, 30); g += S.line(224, 30, 224, 53);
    g += S.txt(266, 26, 'Rf', { size: 8, fill: '#64748b' });
    g += S.txt(322, 62, '線性 Vout', { anchor: 'start', size: 8, fill: '#64748b' });
    // + 接地
    g += S.line(240, 81, 222, 81); g += S.line(222, 81, 222, 95); g += S.ground(222, 95, {});
    g += S.txt(258, 110, '運放 OP', { size: 10, weight: '600' });
    g += S.txt(258, 124, '閉迴路·線性·需補償', { size: 8, fill: '#64748b' });
    return this.wrap(400, 140, g);
  },

  // RC 高通濾波（C 串聯，R 對地）
  rcHighpass() {
    const S = window.Sym; if (!S) return '';
    let g = '';
    g += S.line(20, 45, 38, 45); g += S.txt(18, 37, 'Vin', { anchor: 'start', size: 9, fill: '#64748b' });
    g += `<g transform="rotate(90 60 45)">${S.capacitor(60, 45, {})}</g>`;
    g += S.txt(60, 26, 'C', { size: 9, fill: '#64748b' });
    g += S.line(82, 45, 150, 45); g += S.junction(110, 45);
    g += S.line(150, 45, 178, 45); g += S.txt(180, 37, 'Vout', { anchor: 'end', size: 9, fill: '#64748b' });
    g += S.line(110, 45, 110, 52);
    g += S.resistor(110, 76, { horizontal: false, label: 'R', labelSide: 'right' });
    g += S.line(110, 100, 110, 104); g += S.ground(110, 104, {});
    g += S.txt(95, 138, 'fc = 1/(2πRC)', { size: 9, fill: '#64748b' });
    return this.wrap(210, 150, g);
  },

  // RC 時間延遲（R 串聯，C 對地，節點電壓以 τ=RC 上升）
  rcDelay() {
    const S = window.Sym; if (!S) return '';
    let g = '';
    g += S.line(20, 45, 50, 45); g += S.txt(18, 37, 'Vin階躍', { anchor: 'start', size: 8, fill: '#64748b' });
    g += S.resistor(75, 45, { horizontal: true, label: 'R' });
    g += S.line(100, 45, 150, 45); g += S.junction(130, 45);
    g += S.line(150, 45, 178, 45); g += S.txt(180, 37, 'Vout', { anchor: 'end', size: 9, fill: '#64748b' });
    g += this.capToGnd(S, 130, 45, 'C');
    g += S.txt(95, 130, 'τ = RC（63%）；至門檻≈0.7RC', { size: 8, fill: '#64748b' });
    return this.wrap(210, 140, g);
  },

  // 運放積分器（Vin→R→−，C 回授，+ 接地）
  opIntegrator() {
    const S = window.Sym; if (!S) return '';
    let g = '';
    g += `<polygon points="75,40 75,100 130,70" fill="#fff" stroke="${S.color}" stroke-width="2"/>`;
    g += S.txt(82, 57, '−', { size: 11, raw: true }); g += S.txt(82, 86, '+', { size: 11, raw: true });
    g += S.txt(10, 45, 'Vin', { anchor: 'start', size: 9, fill: '#64748b' });
    g += S.resistor(36, 53, { horizontal: true, label: 'R' });
    g += S.line(60, 53, 75, 53); g += S.junction(60, 53);
    g += S.line(60, 53, 60, 28); g += S.line(60, 28, 93, 28);
    g += `<g transform="rotate(90 115 28)">${S.capacitor(115, 28, {})}</g>`;
    g += S.txt(115, 14, 'C', { size: 9, fill: '#64748b' });
    g += S.line(137, 28, 158, 28); g += S.line(158, 28, 158, 70); g += S.junction(158, 70);
    g += S.line(130, 70, 185, 70); g += S.txt(187, 62, 'Vout', { anchor: 'end', size: 9, fill: '#64748b' });
    g += S.line(75, 87, 58, 87); g += S.line(58, 87, 58, 108); g += S.ground(58, 108, {});
    g += S.txt(100, 130, 'Vout = −1/(RC)∫Vin dt', { size: 8, fill: '#64748b' });
    return this.wrap(210, 145, g);
  },

  // 運放微分器（Vin→C→−，R 回授，+ 接地）
  opDifferentiator() {
    const S = window.Sym; if (!S) return '';
    let g = '';
    g += `<polygon points="75,40 75,100 130,70" fill="#fff" stroke="${S.color}" stroke-width="2"/>`;
    g += S.txt(82, 57, '−', { size: 11, raw: true }); g += S.txt(82, 86, '+', { size: 11, raw: true });
    g += S.txt(8, 45, 'Vin', { anchor: 'start', size: 9, fill: '#64748b' });
    g += `<g transform="rotate(90 38 53)">${S.capacitor(38, 53, {})}</g>`;  // leads (16,53)(60,53)
    g += S.txt(38, 39, 'C', { size: 9, fill: '#64748b' });
    g += S.line(60, 53, 75, 53); g += S.junction(60, 53);
    g += S.line(60, 53, 60, 28); g += S.line(60, 28, 91, 28);
    g += S.resistor(115, 28, { horizontal: true, label: 'R' });
    g += S.line(139, 28, 158, 28); g += S.line(158, 28, 158, 70); g += S.junction(158, 70);
    g += S.line(130, 70, 185, 70); g += S.txt(187, 62, 'Vout', { anchor: 'end', size: 9, fill: '#64748b' });
    g += S.line(75, 87, 58, 87); g += S.line(58, 87, 58, 108); g += S.ground(58, 108, {});
    g += S.txt(100, 130, 'Vout = −RC·dVin/dt', { size: 8, fill: '#64748b' });
    return this.wrap(210, 145, g);
  }
};

// Knowledge Base Application
const knowledgeApp = {
  items: [],
  currentCategory: 'all',
  currentProduct: 'all',
  searchQuery: '',

  async init() {
    await this.loadFromStorage();
    this.renderCards();
    this.bindEvents();
    this.updateCounts();
  },

  async loadFromStorage() {
    // 內建知識版本。改版時遞增 → 強制重新載入內建主題，避免舊 cache 只剩少數主題
    const BUILTIN_VERSION = '2026-07-11-extra3';   // 內容/翻譯更新務必遞增，否則舊 cache 蓋住新卡
    const sample = this.getSampleKnowledge();
    const saved = localStorage.getItem('knowledgeBase');
    const savedVer = localStorage.getItem('knowledgeBaseVersion');

    if (saved && savedVer === BUILTIN_VERSION) {
      this.items = JSON.parse(saved);
      // 合併使用者後續上傳/新增的卡片，但確保內建主題齊全
      const ids = new Set(this.items.map(i => i.id));
      const missing = sample.filter(s => !ids.has(s.id));
      if (missing.length) {
        this.items = [...sample, ...this.items.filter(i => !sample.some(s => s.id === i.id))];
        await this.saveToStorage();
      }
    } else {
      // 首次載入或版本過舊：載入全部內建主題
      this.items = sample;
      localStorage.setItem('knowledgeBaseVersion', BUILTIN_VERSION);
      await this.saveToStorage();
    }
  },

  async saveToStorage() {
    localStorage.setItem('knowledgeBase', JSON.stringify(this.items));
  },

  // 以新符號電路覆蓋舊框框電路（離散元件主題；PCB 疊層/Via/散熱等示意圖維持原樣）
  applyCircuitArt(data) {
    if (typeof CircuitSVG === 'undefined' || !window.Sym) return;
    const map = {
      'buck-converter': () => CircuitSVG.switcher({ ic: 'Buck', icPins: { l: ['VIN', 'EN'], r: ['SW', 'FB'] } }),
      'buck-converter-advanced': () => CircuitSVG.switcher({ ic: 'Buck IC', icPins: { l: ['VIN', 'EN'], r: ['SW', 'FB'] } }),
      'buck-boost-converter': () => CircuitSVG.switcher({ ic: 'Buck-Boost', icPins: { l: ['VIN', 'EN'], r: ['SW', 'FB'] } }),
      'boost-converter': () => CircuitSVG.boost(),
      'i2c-communication': () => CircuitSVG.i2cBus(),
      'spi-design': () => CircuitSVG.spiBus(),
      'ldo-noise': () => CircuitSVG.ldoNoise(),
      'ldo-selection': () => CircuitSVG.ldoBasic(),
      'op-amp-basics': () => CircuitSVG.opamp(),
      'opamp-configurations': () => CircuitSVG.opamp(),
      'current-sensing': () => CircuitSVG.currentSensing(),
      'esd-protection': () => CircuitSVG.esdTVS(),
      'tvd-selection': () => CircuitSVG.tvsSelect(),
      'reverse-polarity': () => CircuitSVG.reversePolarity(),
      'automotive-transient': () => CircuitSVG.automotiveTransient(),
      'decoupling-capacitor': () => CircuitSVG.decoupling(),
      'common-mode-choke': () => CircuitSVG.commonModeChoke(),
      'emi-filtering': () => CircuitSVG.emiFilter(),
      'pdn-design': () => CircuitSVG.pdn(),
      'impedance-matching': () => CircuitSVG.impedance(),
      'differential-pair': () => CircuitSVG.diffPair(),
      'usb-design': () => CircuitSVG.usbDiff(),
      'led-driver': () => CircuitSVG.ledDriver(),
      'battery-charger': () => CircuitSVG.batteryCharger(),
      'adc-dac-basics': () => CircuitSVG.adcDac(),
      'embedded-power-design': () => CircuitSVG.embeddedPower()
    };
    data.forEach(item => {
      const fn = map[item.id];
      if (!fn) return;
      const svg = fn();
      if (!svg) return;
      if (!Array.isArray(item.circuits) || item.circuits.length === 0) {
        item.circuits = [{ type: 'schematic', description: item.title + ' 電路', svg }];
      } else {
        item.circuits[0].svg = svg;
      }
    });
    return data;
  },

  getSampleKnowledge() {
    const __data = [
      {
        id: 'level-shift',
        title: 'Level Shift 電路',
        category: 'signal-processing',
        description: '用於不同電壓域之間的訊號轉換，例如 3.3V MCU 與 5V Sensor 通訊。',
        principles: '當 A 域電壓為 3.3V，B 域電壓為 5V 時，直接連接可能導致高壓域的電流流入低壓域，造成損壞。Level Shift 電路使用 MOSFET 或專用 IC 來實現雙向電壓轉換。',
        circuits: [
          {
            type: 'bidirectional',
            description: '雙向 Level Shift 電路（使用 MOSFET）',
            svg: CircuitSVG.levelShift()
          }
        ],
        keyFormulas: [
          'BSS138 雙向：兩側各經 Rp 上拉至自身電壓域（VCC_L / VCC_H）',
          'I_d = k(V_gs − V_th)²（飽和區，平方律）'
        ],
        designNotes: [
          '選擇適合的 MOSFET（低 Vth、低 Rds_on）',
          '注意傳播延遲，高速訊號需選擇快速 MOSFET',
          '考慮最大資料率，選擇適合的驅動能力',
          '加上拉電阻確保訊號完整性'
        ],
        commonMistakes: [
          '忘記加上拉電阻',
          '忽略寄生電容影響',
          '未考慮溫度對 MOSFET 參數的影響',
          '選擇不適合的 MOSFET 類型'
        ],
        examples: [
          {
            title: 'I2C Level Shift',
            application: '3.3V MCU 與 5V Sensor 通訊',
            circuit: '使用 BSS138 MOSFET 的雙向 I2C Level Shift'
          },
          {
            title: 'UART Level Shift',
            application: '3.3V MCU 與 5V GPS 模組通訊',
            circuit: '使用專用 Level Shift IC（如 TXS0102）'
          }
        ],
        relatedTopics: ['i2c', 'uart', 'mosfet'],
        sourcePdf: null,
        createdAt: '2026-06-02T10:00:00Z',
        updatedAt: '2026-06-02T10:00:00Z'
      },
      {
        id: 'ldo-regulator',
        title: 'LDO 穩壓器',
        category: 'power-management',
        description: 'Low Dropout Regulator，用於將較高電壓轉換為穩定的低電壓輸出。',
        principles: 'LDO 使用線性調整元件（通常是 MOSFET）來穩定輸出電壓。當輸入電壓變化或負載電流變化時，LDO 會自動調整內部電阻來保持輸出電壓穩定。',
        circuits: [
          {
            type: 'basic',
            description: '基本 LDO 穩壓電路',
            svg: CircuitSVG.ldoBasic()
          }
        ],
        keyFormulas: [
          'Vout = Vref * (1 + R1/R2)',
          'Dropout Voltage = Vin - Vout',
          'Power Efficiency = Vout/Vin * 100%'
        ],
        designNotes: [
          '選擇適合的輸出電容（ESR 要符合規格）',
          '注意散熱，大電流時需考慮熱阻',
          '輸入輸出壓差不能太小（大於 Dropout Voltage）',
          '考慮負載瞬態響應'
        ],
        commonMistakes: [
          '輸出電容 ESR 不符合規格',
          '散熱不足導致過熱保護',
          '輸入電壓過低導致無法穩壓',
          '未考慮負載電流變化'
        ],
        examples: [
          {
            title: '3.3V 穩壓',
            application: '從 5V USB 電源產生 3.3V',
            circuit: '使用 AMS1117-3.3 的典型應用電路'
          }
        ],
        relatedTopics: ['buck', 'boost', 'power-supply'],
        sourcePdf: null,
        createdAt: '2026-06-02T10:00:00Z',
        updatedAt: '2026-06-02T10:00:00Z'
      },
      {
        id: 'buck-converter',
        title: 'Buck 降壓轉換器',
        category: 'power-management',
        description: '開關式降壓轉換器，效率高於 LDO，適合大電流應用。',
        principles: 'Buck 轉換器使用開關元件（MOSFET）、電感和電容來實現高效的電壓轉換。通過調整開關的占空比（Duty Cycle）來控制輸出電壓。',
        circuits: [
          {
            type: 'basic',
            description: '基本 Buck 轉換器電路',
            svg: `<svg viewBox="0 0 260 100" width="260" height="100">
              <!-- Vin -->
              <line x1="10" y1="30" x2="35" y2="30" stroke="#1d2943" stroke-width="2"/>
              <text x="10" y="22" font-size="9">Vin</text>
              <!-- Switch -->
              <rect x="35" y="18" width="40" height="24" fill="white" stroke="#1d2943" stroke-width="1.5"/>
              <text x="55" y="34" text-anchor="middle" font-size="8">SW</text>
              <!-- SW node to inductor and diode -->
              <line x1="75" y1="30" x2="105" y2="30" stroke="#1d2943" stroke-width="2"/>
              <!-- Diode from SW to GND (cathode at SW) -->
              <line x1="85" y1="30" x2="85" y2="50" stroke="#1d2943" stroke-width="1.5"/>
              <polygon points="80,58 90,58 85,50" fill="#1d2943"/>
              <line x1="85" y1="58" x2="85" y2="68" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="78" y1="68" x2="92" y2="68" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="80" y1="72" x2="90" y2="72" stroke="#1d2943" stroke-width="1"/>
              <text x="95" y="62" font-size="7">D</text>
              <!-- Inductor L -->
              <path d="M105,30 Q110,20 115,30 Q120,40 125,30 Q130,20 135,30 Q140,40 145,30" fill="none" stroke="#1d2943" stroke-width="2"/>
              <text x="125" y="18" text-anchor="middle" font-size="8">L</text>
              <!-- L to Vout node -->
              <line x1="145" y1="30" x2="180" y2="30" stroke="#1d2943" stroke-width="2"/>
              <!-- Cout: top to Vout, bottom to GND -->
              <line x1="180" y1="30" x2="180" y2="42" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="170" y1="42" x2="190" y2="42" stroke="#1d2943" stroke-width="2"/>
              <line x1="170" y1="47" x2="190" y2="47" stroke="#1d2943" stroke-width="2"/>
              <line x1="180" y1="47" x2="180" y2="58" stroke="#1d2943" stroke-width="1.5"/>
              <text x="180" y="40" text-anchor="middle" font-size="7">C</text>
              <!-- GND symbol for Cout -->
              <line x1="172" y1="58" x2="188" y2="58" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="175" y1="62" x2="185" y2="62" stroke="#1d2943" stroke-width="1"/>
              <!-- Vout -->
              <line x1="180" y1="30" x2="230" y2="30" stroke="#1d2943" stroke-width="2"/>
              <text x="235" y="22" font-size="9">Vout</text>
              <!-- GND bus -->
              <line x1="35" y1="78" x2="172" y2="78" stroke="#1d2943" stroke-width="1.5"/>
            </svg>`
          }
        ],
        keyFormulas: [
          'Vout = Vin * D',
          'D = Ton / (Ton + Toff)',
          'ΔIL = (Vin - Vout) * D / (f * L)（電感漣波電流）',
          'Efficiency = Pout / Pin * 100%'
        ],
        designNotes: [
          'EN 致能腳：圖中接 VIN 代表「常開」。EN 不可懸空(會誤觸發)；要常開就拉到 VIN(EN 耐壓夠可直接接，不夠則經電阻分壓接、順便設 UVLO 欠壓門檻)；要做電源順序/省電則由 MCU 控制。',
          'FB 回授腳必接：IC 靠 FB 感測輸出電壓來調占空比穩壓，懸空會失控。固定輸出 IC 的 FB 直接接 Vout；可調 IC 經 R1/R2 分壓接 Vout。',
          '選擇適合的開關頻率（權衡效率與元件大小）',
          '電感值要足夠大以維持連續導通模式（CCM）',
          '輸出電容要選擇低 ESR 的類型',
          '注意 PCB layout，減少開關噪聲'
        ],
        commonMistakes: [
          '電感值選擇不當導致紋波過大',
          'PCB layout 不良導致 EMI 問題',
          '未考慮輕載效率',
          '輸出電容 ESR 過高'
        ],
        examples: [
          {
            title: '5V to 3.3V Buck',
            application: '從 5V 電源產生 3.3V',
            circuit: '使用 MP2315 的高效 Buck 轉換器'
          }
        ],
        relatedTopics: ['boost', 'ldo', 'power-supply'],
        sourcePdf: null,
        createdAt: '2026-06-02T10:00:00Z',
        updatedAt: '2026-06-02T10:00:00Z'
      },
      {
        id: 'i2c-communication',
        title: 'I2C 通訊協定',
        category: 'communication',
        description: 'Inter-Integrated Circuit，兩線式序列通訊協定，常用於晶片間通訊。',
        principles: 'I2C 使用兩條線（SDA 資料線、SCL 時脈線）進行通訊。支援多主機多從機架構，每個從機有唯一的 7-bit 或 10-bit 位址。',
        circuits: [
          {
            type: 'basic',
            description: '基本 I2C 連接電路',
            svg: `<svg viewBox="0 0 220 110" width="220" height="110">
              <!-- MCU -->
              <rect x="15" y="20" width="50" height="60" fill="white" stroke="#1d2943" stroke-width="1.5"/>
              <text x="40" y="55" text-anchor="middle" font-size="9">MCU</text>
              <!-- Sensor -->
              <rect x="155" y="20" width="50" height="60" fill="white" stroke="#1d2943" stroke-width="1.5"/>
              <text x="180" y="55" text-anchor="middle" font-size="9">Sensor</text>
              <!-- SDA line -->
              <line x1="65" y1="35" x2="155" y2="35" stroke="#1d2943" stroke-width="1.5"/>
              <!-- SCL line -->
              <line x1="65" y1="65" x2="155" y2="65" stroke="#1d2943" stroke-width="1.5"/>
              <!-- SDA pull-up resistor -->
              <line x1="110" y1="35" x2="110" y2="15" stroke="#1d2943" stroke-width="1.5"/>
              <rect x="105" y="15" width="10" height="18" fill="white" stroke="#1d2943" stroke-width="1"/>
              <line x1="110" y1="15" x2="110" y2="5" stroke="#1d2943" stroke-width="1.5"/>
              <text x="120" y="10" font-size="7">Rp</text>
              <!-- SCL pull-up resistor -->
              <line x1="110" y1="65" x2="110" y2="45" stroke="#1d2943" stroke-width="1.5"/>
              <rect x="105" y="45" width="10" height="18" fill="white" stroke="#1d2943" stroke-width="1"/>
              <line x1="110" y1="45" x2="110" y2="35" stroke="#1d2943" stroke-width="1.5"/>
              <text x="120" y="42" font-size="7">Rp</text>
              <!-- VCC label -->
              <text x="110" y="3" text-anchor="middle" font-size="8">VCC</text>
              <!-- GND line -->
              <line x1="40" y1="80" x2="40" y2="95" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="180" y1="80" x2="180" y2="95" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="40" y1="95" x2="180" y2="95" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="110" y1="95" x2="110" y2="103" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="104" y1="103" x2="116" y2="103" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="106" y1="107" x2="114" y2="107" stroke="#1d2943" stroke-width="1"/>
              <!-- Labels -->
              <text x="85" y="30" font-size="8">SDA</text>
              <text x="85" y="60" font-size="8">SCL</text>
            </svg>`
          }
        ],
        keyFormulas: [
          'Clock Frequency: 100kHz (Standard), 400kHz (Fast), 1MHz (Fast Plus)',
          'Rp(min) = (VCC − Vol)/Iol（Vol=0.4V, Iol=3mA）；Rp(max) ≈ tr/(0.847·Cbus)',
          'Bus Capacitance: Max 400pF'
        ],
        designNotes: [
          'SDA 和 SCL 需要上拉電阻（通常 2.2kΩ 到 10kΩ）',
          '注意總線電容限制，過長會影響訊號品質',
          '不同電壓域需要 Level Shift',
          '地址衝突需小心處理'
        ],
        commonMistakes: [
          '忘記加上拉電阻',
          '上拉電阻值選擇不當',
          '未考慮總線電容限制',
          '地址衝突未處理'
        ],
        examples: [
          {
            title: '溫度感測器讀取',
            application: '讀取 AHT20 溫度感測器',
            circuit: 'I2C 連接 AHT20，讀取溫濕度資料'
          }
        ],
        relatedTopics: ['spi', 'uart', 'level-shift'],
        sourcePdf: null,
        createdAt: '2026-06-02T10:00:00Z',
        updatedAt: '2026-06-02T10:00:00Z'
      },
      // === 電源設計知識 ===
      {
        id: 'buck-converter-advanced',
        title: 'Buck 轉換器進階設計',
        category: 'power-management',
        description: '開關穩壓器的進階設計技巧，包含電流檢測、熱回路優化、EMI 濾波。',
        principles: 'Buck 轉換器透過開關元件（MOSFET）的高速切換，配合電感和電容實現高效的電壓轉換。進階設計需要考慮電流模式控制、熱回路面積最小化、以及 EMI 濾波器設計。',
        circuits: [
          {
            type: 'current-mode',
            description: '電流模式 Buck 轉換器',
            svg: `<svg viewBox="0 0 300 130" width="300" height="130">
              <!-- Controller -->
              <rect x="10" y="35" width="60" height="50" fill="white" stroke="#1d2943" stroke-width="1.5"/>
              <text x="40" y="65" text-anchor="middle" font-size="9">Controller</text>
              <!-- Gate drive lines -->
              <line x1="70" y1="50" x2="95" y2="50" stroke="#1d2943" stroke-width="1.5"/>
              <text x="82" y="44" font-size="6">GH</text>
              <line x1="70" y1="70" x2="95" y2="70" stroke="#1d2943" stroke-width="1.5"/>
              <text x="82" y="78" font-size="6">GL</text>
              <!-- High-Side MOSFET -->
              <rect x="95" y="30" width="45" height="25" fill="white" stroke="#1d2943" stroke-width="1.5"/>
              <text x="117" y="47" text-anchor="middle" font-size="7">High-Side</text>
              <!-- Low-Side MOSFET -->
              <rect x="95" y="65" width="45" height="25" fill="white" stroke="#1d2943" stroke-width="1.5"/>
              <text x="117" y="82" text-anchor="middle" font-size="7">Low-Side</text>
              <!-- Vin to High-Side -->
              <line x1="5" y1="20" x2="95" y2="20" stroke="#1d2943" stroke-width="2"/>
              <line x1="95" y1="20" x2="95" y2="30" stroke="#1d2943" stroke-width="1.5"/>
              <text x="5" y="14" font-size="8">Vin</text>
              <!-- SW node -->
              <line x1="117" y1="55" x2="117" y2="65" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="117" y1="55" x2="150" y2="55" stroke="#1d2943" stroke-width="2"/>
              <!-- Inductor -->
              <path d="M150,55 Q155,45 160,55 Q165,65 170,55 Q175,45 180,55 Q185,65 190,55" fill="none" stroke="#1d2943" stroke-width="2"/>
              <text x="170" y="42" text-anchor="middle" font-size="8">L</text>
              <!-- L to Cout node -->
              <line x1="190" y1="55" x2="220" y2="55" stroke="#1d2943" stroke-width="2"/>
              <!-- Cout to GND -->
              <line x1="220" y1="55" x2="220" y2="70" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="210" y1="70" x2="230" y2="70" stroke="#1d2943" stroke-width="2"/>
              <line x1="210" y1="74" x2="230" y2="74" stroke="#1d2943" stroke-width="2"/>
              <line x1="220" y1="74" x2="220" y2="85" stroke="#1d2943" stroke-width="1.5"/>
              <text x="220" y="68" text-anchor="middle" font-size="7">Cout</text>
              <!-- GND -->
              <line x1="212" y1="85" x2="228" y2="85" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="215" y1="89" x2="225" y2="89" stroke="#1d2943" stroke-width="1"/>
              <!-- Low-Side to GND -->
              <line x1="117" y1="90" x2="117" y2="100" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="110" y1="100" x2="220" y2="100" stroke="#1d2943" stroke-width="1.5"/>
              <!-- Vout -->
              <line x1="220" y1="55" x2="265" y2="55" stroke="#1d2943" stroke-width="2"/>
              <text x="270" y="50" font-size="8">Vout</text>
              <!-- Current sense -->
              <rect x="95" y="100" width="30" height="10" fill="#e8f4f8" stroke="#1d2943" stroke-width="1"/>
              <text x="110" y="108" text-anchor="middle" font-size="6">Rs</text>
              <line x1="70" y1="85" x2="70" y2="100" stroke="#1d2943" stroke-width="1" stroke-dasharray="3"/>
              <line x1="70" y1="100" x2="95" y2="100" stroke="#1d2943" stroke-width="1" stroke-dasharray="3"/>
              <text x="70" y="115" font-size="6">Isense</text>
            </svg>`
          }
        ],
        keyFormulas: [
          'D = Vout / Vin (CCM)',
          'IL_peak = IL_avg + ΔIL/2',
          'ΔIL = (Vin - Vout) * D / (f * L)',
          'RMS_current = IL_avg * √(1 + (ΔIL/IL_avg)²/12)'
        ],
        designNotes: [
          'EN 致能腳：圖中接 VIN = 常開。不可懸空；常開接 VIN(或經電阻分壓兼設 UVLO)，需控制則接 MCU。',
          'FB 回授腳必接：IC 用 FB 感測輸出做閉迴路穩壓，固定輸出接 Vout、可調輸出經 R1/R2 分壓接 Vout；懸空則無法穩壓。',
          '電流感測電阻選擇：通常 10mΩ ~ 50mΩ',
          '熱回路面積最小化：高頻電流迴路面積要小',
          '輸入電容靠近 IC 放置，減少寄生電感',
          'SW 節點走線要短，減少 EMI 輻射',
          '電感飽和電流要大於峰值電流 1.3 倍以上'
        ],
        commonMistakes: [
          '電流感測電阻過大導致效率降低',
          '熱回路面積過大導致 EMI 超標',
          '輸入電容距離 IC 遠，導致輸入電壓不穩定',
          '電感選擇不當導致進入 DCM 模式',
          '未考慮輕載效率優化'
        ],
        examples: [
          {
            title: '12V to 3.3V Buck',
            application: '從 12V 電源產生 3.3V 給 MCU 供電',
            circuit: '使用 TPS54331 的 3A Buck 轉換器'
          },
          {
            title: '5V to 1.2V Buck',
            application: '從 5V USB 電源產生 1.2V 給核心供電',
            circuit: '使用 TPS62085 的高效 Buck 轉換器'
          }
        ],
        relatedTopics: ['ldo', 'boost', 'emi-filter'],
        sourcePdf: 'power-design.html',
        createdAt: '2026-06-02T10:00:00Z',
        updatedAt: '2026-06-02T10:00:00Z'
      },
      {
        id: 'ldo-noise',
        title: 'LDO 低噪聲設計',
        category: 'power-management',
        description: '低噪聲 LDO 的設計原理與應用，適用於類比電路、RF、精密量測。',
        principles: 'LDO 的噪聲主要來自參考電壓源、誤差放大器、以及 PSRR 不足。低噪聲 LDO 透過使用低噪聲參考源、高增益誤差放大器、以及良好的電源抑制比來降低輸出噪聲。',
        circuits: [
          {
            type: 'low-noise',
            description: '低噪聲 LDO 電路',
            svg: `<svg viewBox="0 0 220 90" width="220" height="90">
              <!-- Vin -->
              <line x1="5" y1="35" x2="25" y2="35" stroke="#1d2943" stroke-width="2"/>
              <text x="5" y="28" font-size="8">Vin</text>
              <!-- Cin to GND -->
              <line x1="25" y1="35" x2="25" y2="50" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="15" y1="50" x2="35" y2="50" stroke="#1d2943" stroke-width="2"/>
              <line x1="15" y1="54" x2="35" y2="54" stroke="#1d2943" stroke-width="2"/>
              <line x1="25" y1="54" x2="25" y2="62" stroke="#1d2943" stroke-width="1.5"/>
              <text x="25" y="48" text-anchor="middle" font-size="7">Cin</text>
              <!-- GND symbol for Cin -->
              <line x1="19" y1="62" x2="31" y2="62" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="21" y1="66" x2="29" y2="66" stroke="#1d2943" stroke-width="1"/>
              <!-- Cin to LDO -->
              <line x1="25" y1="35" x2="55" y2="35" stroke="#1d2943" stroke-width="2"/>
              <!-- LDO -->
              <rect x="55" y="20" width="50" height="30" fill="white" stroke="#1d2943" stroke-width="1.5"/>
              <text x="80" y="40" text-anchor="middle" font-size="9">LDO</text>
              <!-- LDO to Cout -->
              <line x1="105" y1="35" x2="135" y2="35" stroke="#1d2943" stroke-width="2"/>
              <!-- Cout to GND -->
              <line x1="135" y1="35" x2="135" y2="50" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="125" y1="50" x2="145" y2="50" stroke="#1d2943" stroke-width="2"/>
              <line x1="125" y1="54" x2="145" y2="54" stroke="#1d2943" stroke-width="2"/>
              <line x1="135" y1="54" x2="135" y2="62" stroke="#1d2943" stroke-width="1.5"/>
              <text x="135" y="48" text-anchor="middle" font-size="7">Cout</text>
              <!-- GND symbol for Cout -->
              <line x1="129" y1="62" x2="141" y2="62" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="131" y1="66" x2="139" y2="66" stroke="#1d2943" stroke-width="1"/>
              <!-- Cout to Vout -->
              <line x1="135" y1="35" x2="195" y2="35" stroke="#1d2943" stroke-width="2"/>
              <text x="200" y="28" font-size="8">Vout</text>
              <!-- Labels -->
              <text x="80" y="14" text-anchor="middle" font-size="7">low noise</text>
              <text x="135" y="78" text-anchor="middle" font-size="7">low ESR</text>
            </svg>`
          }
        ],
        keyFormulas: [
          'Output Noise = √(vn² + (dn * Vin)²)',
          'PSRR = 20*log(Vin_ripple/Vout_ripple)',
          ' Dropout Voltage = Vin - Vout',
          'Thermal Resistance (θJA) = (Tj - Ta) / Pd'
        ],
        designNotes: [
          'EN 致能腳：開關 LDO 輸出用。要常開就接 VIN(本圖如此)，不可懸空(會誤觸發)；要省電/電源順序則由 MCU 控制。NR 腳則接旁路電容(Cnr)過濾基準噪聲。',
          '選擇超低噪聲 LDO（如 TPS7A47）',
          '輸入輸出電容選擇低 ESR 類型',
          '避免使用陶瓷電容在某些 LDO 上（可能不穩定）',
          '散熱設計：大電流時注意熱阻',
          'PSRR 在高頻時會下降，需要外部濾波'
        ],
        commonMistakes: [
          '使用高 ESR 電容導致噪聲增加',
          '未考慮 LDO 的穩定性補償',
          '散熱不足導致熱關斷',
          '輸入電壓過低導致無法穩壓',
          '忽略負載瞬態響應'
        ],
        examples: [
          {
            title: 'RF 電路供電',
            application: '為 RF 放大器提供低噪聲電源',
            circuit: '使用 TPS7A4700 超低噪聲 LDO'
          },
          {
            title: '類比電路供電',
            application: '為精密運放提供低噪聲電源',
            circuit: '使用 ADP7118 低噪聲 LDO'
          }
        ],
        relatedTopics: ['buck', 'power-supply', 'analog'],
        sourcePdf: 'power-design.html',
        createdAt: '2026-06-02T10:00:00Z',
        updatedAt: '2026-06-02T10:00:00Z'
      },
      // === 信號完整性知識 ===
      {
        id: 'impedance-matching',
        title: '阻抗匹配設計',
        category: 'high-speed',
        description: '高速訊號的阻抗匹配原理與實作，減少反射與訊號失真。',
        principles: '當訊號在傳輸線中傳播時，如果阻抗不連續，會產生反射。阻抗匹配透過確保源端、傳輸線、負載端阻抗一致，來最小化反射。常見的匹配方式包括串聯匹配、並聯匹配、AC 匹配等。',
        circuits: [
          {
            type: 'series-termination',
            description: '串聯終端匹配',
            svg: `<svg viewBox="0 0 250 60" width="250" height="60">
              <rect x="10" y="20" width="40" height="20" fill="white" stroke="#1d2943" stroke-width="2"/>
              <text x="30" y="35" text-anchor="middle" font-size="8">Driver</text>
              <line x1="50" y1="30" x2="70" y2="30" stroke="#1d2943" stroke-width="2"/>
              <rect x="70" y="25" width="20" height="10" fill="white" stroke="#1d2943" stroke-width="2"/>
              <text x="80" y="33" text-anchor="middle" font-size="7">Rs</text>
              <line x1="90" y1="30" x2="180" y2="30" stroke="#1d2943" stroke-width="2"/>
              <text x="135" y="25" font-size="8">Z0 = 50Ω</text>
              <rect x="180" y="20" width="40" height="20" fill="white" stroke="#1d2943" stroke-width="2"/>
              <text x="200" y="35" text-anchor="middle" font-size="8">Receiver</text>
              <text x="10" y="15" font-size="8">Zs = 50Ω</text>
            </svg>`
          }
        ],
        keyFormulas: [
          'Z0 = √(L/C) (傳輸線特性阻抗)',
          'Reflection Coefficient Γ = (ZL - Z0) / (ZL + Z0)',
          'RS = Z0 - ZS (串聯匹配電阻)',
          'RP = Z0 (並聯匹配電阻)'
        ],
        designNotes: [
          '微帶線阻抗：Z0 = 87/√(Dk+1.41) * ln(5.98*h/(0.8*w+t))',
          '帶狀線阻抗：Z0 = 60/√Dk * ln(4*b/(0.67*(0.8*w+t)))',
          '差分阻抗：Zdiff = 2*Z0*(1 - 0.48*exp(-0.96*s/h))',
          '阻抗公差通常要求 ±10%',
          '玻纖效應會導致阻抗波動，需要考慮'
        ],
        commonMistakes: [
          '未考慮阻抗匹配導致反射',
          '匹配電阻位置不正確',
          '未考慮傳輸線效應（電長度 > λ/6）',
          '忽略返回路徑的不連續',
          '差分對 Skew 未控制'
        ],
        examples: [
          {
            title: 'DDR4 資料線匹配',
            application: 'DDR4 記憶體介面的阻抗匹配',
            circuit: '使用 On-Die Termination (ODT) 和串聯匹配'
          },
          {
            title: 'USB 3.0 差分對',
            application: 'USB 3.0 SuperSpeed 訊號匹配',
            circuit: '差分阻抗 90Ω，使用 AC 耦合電容'
          }
        ],
        relatedTopics: ['transmission-line', 'crosstalk', 'eye-diagram'],
        sourcePdf: 'si-pi.html',
        createdAt: '2026-06-02T10:00:00Z',
        updatedAt: '2026-06-02T10:00:00Z'
      },
      {
        id: 'pdn-design',
        title: 'PDN 電源分配網路設計',
        category: 'high-speed',
        description: '電源分配網路的設計原則，確保高速電路的電源完整性。',
        principles: 'PDN（Power Distribution Network）負責將電源從穩壓器分配到所有 IC 的電源腳。良好的 PDN 設計需要確保在所有頻率範圍內，電源阻抗低於目標阻抗，以維持電壓穩定。',
        circuits: [
          {
            type: 'pdn-basic',
            description: '基本 PDN 結構',
            svg: `<svg viewBox="0 0 300 110" width="300" height="110">
              <!-- VRM -->
              <rect x="10" y="30" width="45" height="35" fill="white" stroke="#1d2943" stroke-width="1.5"/>
              <text x="32" y="52" text-anchor="middle" font-size="8">VRM</text>
              <!-- Power rail -->
              <line x1="55" y1="40" x2="265" y2="40" stroke="#1d2943" stroke-width="2"/>
              <!-- Cbulk (100uF) -->
              <line x1="80" y1="40" x2="80" y2="55" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="72" y1="55" x2="88" y2="55" stroke="#1d2943" stroke-width="2"/>
              <line x1="72" y1="60" x2="88" y2="60" stroke="#1d2943" stroke-width="2"/>
              <line x1="80" y1="60" x2="80" y2="75" stroke="#1d2943" stroke-width="1.5"/>
              <text x="80" y="52" text-anchor="middle" font-size="6">100uF</text>
              <!-- Cmid (10uF) -->
              <line x1="130" y1="40" x2="130" y2="55" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="122" y1="55" x2="138" y2="55" stroke="#1d2943" stroke-width="2"/>
              <line x1="122" y1="60" x2="138" y2="60" stroke="#1d2943" stroke-width="2"/>
              <line x1="130" y1="60" x2="130" y2="75" stroke="#1d2943" stroke-width="1.5"/>
              <text x="130" y="52" text-anchor="middle" font-size="6">10uF</text>
              <!-- Clocal (100nF) -->
              <line x1="180" y1="40" x2="180" y2="55" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="172" y1="55" x2="188" y2="55" stroke="#1d2943" stroke-width="2"/>
              <line x1="172" y1="60" x2="188" y2="60" stroke="#1d2943" stroke-width="2"/>
              <line x1="180" y1="60" x2="180" y2="75" stroke="#1d2943" stroke-width="1.5"/>
              <text x="180" y="52" text-anchor="middle" font-size="6">100nF</text>
              <!-- Clocal2 (10nF) -->
              <line x1="220" y1="40" x2="220" y2="55" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="212" y1="55" x2="228" y2="55" stroke="#1d2943" stroke-width="2"/>
              <line x1="212" y1="60" x2="228" y2="60" stroke="#1d2943" stroke-width="2"/>
              <line x1="220" y1="60" x2="220" y2="75" stroke="#1d2943" stroke-width="1.5"/>
              <text x="220" y="52" text-anchor="middle" font-size="6">10nF</text>
              <!-- GND rail -->
              <line x1="60" y1="75" x2="235" y2="75" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="147" y1="75" x2="147" y2="83" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="140" y1="83" x2="154" y2="83" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="143" y1="87" x2="151" y2="87" stroke="#1d2943" stroke-width="1"/>
              <!-- IC -->
              <rect x="250" y="25" width="35" height="25" fill="white" stroke="#1d2943" stroke-width="1.5"/>
              <text x="267" y="42" text-anchor="middle" font-size="8">IC</text>
              <line x1="265" y1="40" x2="265" y2="50" stroke="#1d2943" stroke-width="1.5"/>
              <!-- Labels -->
              <text x="150" y="100" text-anchor="middle" font-size="7">頻率範圍：DC ~ GHz（大電容→低頻，小電容→高頻）</text>
            </svg>`
          }
        ],
        keyFormulas: [
          'Z_target = ΔV / I_transient',
          'C = I * Δt / ΔV',
          'ESL_effective = ESL / N (並聯電容)',
          'Resonant Frequency = 1 / (2π√(L*C))'
        ],
        designNotes: [
          '目標阻抗計算：Ztarget = Vripple_allowed / I_transient',
          '電容選擇：大電容用於低頻，小電容用於高頻',
          '電容放置：靠近 IC 電源腳',
          '過孔設計：減少寄生電感',
          '平面層設計：完整的電源/接地平面'
        ],
        commonMistakes: [
          '未計算目標阻抗',
          '電容選擇不當（ESR/ESL 不匹配）',
          '電容放置距離 IC 過遠',
          '過孔數量不足導致高頻阻抗過高',
          '電源平面不完整導致阻抗不連續'
        ],
        examples: [
          {
            title: 'FPGA PDN 設計',
            application: '為大規模 FPGA 設計 PDN',
            circuit: '多級電容配置 + 完整電源平面'
          },
          {
            title: 'DDR4 PDN 設計',
            application: 'DDR4 記憶體介面的電源分配',
            circuit: '專用電源層 + 去耦電容陣列'
          }
        ],
        relatedTopics: ['decoupling', 'power-integrity', 'emi'],
        sourcePdf: 'si-pi.html',
        createdAt: '2026-06-02T10:00:00Z',
        updatedAt: '2026-06-02T10:00:00Z'
      },
      // === PCB Layout 知識 ===
      {
        id: 'pcb叠层设计',
        title: 'PCB 疊層設計原則',
        category: 'high-speed',
        description: 'PCB 疊層結構的設計原則，確保訊號完整性與電源完整性。',
        principles: 'PCB 疊層設計是高速電路設計的基礎。良好的疊層結構可以提供完整的參考平面、控制阻抗、減少 EMI。常見的疊層結構包括 4 層板和 6 層板。',
        circuits: [
          {
            type: '4-layer',
            description: '4 層板標準結構',
            svg: `<svg viewBox="0 0 200 80" width="200" height="80">
              <rect x="20" y="10" width="160" height="10" fill="#e74c3c" stroke="#1d2943" stroke-width="1"/>
              <text x="100" y="18" text-anchor="middle" font-size="8" fill="white">Signal (Top)</text>
              <rect x="20" y="25" width="160" height="10" fill="#3498db" stroke="#1d2943" stroke-width="1"/>
              <text x="100" y="33" text-anchor="middle" font-size="8" fill="white">GND Plane</text>
              <rect x="20" y="40" width="160" height="10" fill="#f39c12" stroke="#1d2943" stroke-width="1"/>
              <text x="100" y="48" text-anchor="middle" font-size="8" fill="white">Power Plane</text>
              <rect x="20" y="55" width="160" height="10" fill="#e74c3c" stroke="#1d2943" stroke-width="1"/>
              <text x="100" y="63" text-anchor="middle" font-size="8" fill="white">Signal (Bottom)</text>
            </svg>`
          }
        ],
        keyFormulas: [
          '阻抗控制：Z0 = 87/√(Dk+1.41) * ln(5.98*h/(0.8*w+t))',
          '串擾減少：間距 ≥ 3W（3W 法則）',
          '傳輸線延遲(微帶)：Tpd ≈ 85·√(0.475·Dk + 0.67) ps/inch（FR4 約 140~180 ps/inch）'
        ],
        designNotes: [
          '電源層和接地層成對出現',
          '高速訊號層緊鄰接地層',
          '訊號層之間有接地層隔離',
          '外層訊號線較短，內層較長',
          '考慮阻抗控制需求',
          '平衡疊層以減少翹曲'
        ],
        commonMistakes: [
          '未考慮阻抗控制',
          '參考平面不完整',
          '訊號層與參考平面距離過大',
          '未考慮返回路徑',
          '疊層不平衡導致翹曲'
        ],
        examples: [
          {
            title: '4 層板設計',
            application: '一般數位電路',
            circuit: 'Signal-GND-Power-Signal'
          },
          {
            title: '6 層板設計',
            application: '高速訊號電路',
            circuit: 'Signal-GND-Signal-Signal-Power-Signal'
          }
        ],
        relatedTopics: ['impedance', 'emi', 'signal-integrity'],
        sourcePdf: 'pcb-layout.html',
        createdAt: '2026-06-02T10:00:00Z',
        updatedAt: '2026-06-02T10:00:00Z'
      },
      {
        id: 'pcb走线规则',
        title: 'PCB 走線規則',
        category: 'high-speed',
        description: 'PCB 走線的設計規則，包括間距、長度匹配、轉角等。',
        principles: 'PCB 走線設計需要考慮阻抗控制、串擾、長度匹配、EMI 等因素。正確的走線規則可以確保訊號品質和電磁相容性。',
        circuits: [],
        keyFormulas: [
          '3W 法則：走線中心間距 ≥ 3 倍線寬',
          '5W 法則：走線中心間距 ≥ 5 倍線寬',
          '差分對 Skew：ΔL < 5mil'
        ],
        designNotes: [
          '高速訊號走線在完整平面層',
          '避免 90° 轉角，使用 45° 或圓弧',
          '差分對等長匹配',
          '減少 stub（殘枝）',
          '跨越分割平面時加回流電容',
          '走線長度匹配（DDR、USB 等）'
        ],
        commonMistakes: [
          '使用 90° 轉角',
          '差分對 Skew 過大',
          '走線跨分割平面',
          '未考慮返回路徑',
          'stub 過長導致諧振'
        ],
        examples: [
          {
            title: 'DDR4 走線',
            application: 'DDR4 記憶體介面',
            circuit: '資料線組內 Skew < 5mil，組間 Skew < 50mil'
          },
          {
            title: 'USB 3.0 走線',
            application: 'USB 3.0 SuperSpeed',
            circuit: '差分阻抗 90Ω，Skew < 5mil'
          }
        ],
        relatedTopics: ['impedance', 'crosstalk', 'emi'],
        sourcePdf: 'pcb-layout.html',
        createdAt: '2026-06-02T10:00:00Z',
        updatedAt: '2026-06-02T10:00:00Z'
      },
      {
        id: 'emi-filtering',
        title: 'EMI 濾波器設計',
        category: 'emi-emc',
        description: '電磁干擾濾波器的設計原則與應用。',
        principles: 'EMI 濾波器用於抑制電磁干擾，保護電路正常工作。常見的 EMI 濾波器包括鐵氧體磁珠、LC 濾波器、π 型濾波器等。',
        circuits: [
          {
            type: 'ferrite-bead',
            description: '鐵氧體磁珠濾波',
            svg: `<svg viewBox="0 0 180 80" width="180" height="80">
              <!-- Input -->
              <line x1="10" y1="30" x2="35" y2="30" stroke="#1d2943" stroke-width="2"/>
              <text x="10" y="22" font-size="8">In</text>
              <!-- Ferrite Bead -->
              <rect x="35" y="20" width="30" height="20" fill="white" stroke="#1d2943" stroke-width="1.5"/>
              <text x="50" y="34" text-anchor="middle" font-size="8">FB</text>
              <!-- FB to output node -->
              <line x1="65" y1="30" x2="110" y2="30" stroke="#1d2943" stroke-width="2"/>
              <!-- Capacitor to GND -->
              <line x1="110" y1="30" x2="110" y2="40" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="100" y1="40" x2="120" y2="40" stroke="#1d2943" stroke-width="2"/>
              <line x1="100" y1="45" x2="120" y2="45" stroke="#1d2943" stroke-width="2"/>
              <line x1="110" y1="45" x2="110" y2="55" stroke="#1d2943" stroke-width="1.5"/>
              <text x="110" y="38" text-anchor="middle" font-size="7">C</text>
              <!-- GND symbol -->
              <line x1="102" y1="55" x2="118" y2="55" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="105" y1="59" x2="115" y2="59" stroke="#1d2943" stroke-width="1"/>
              <!-- Output -->
              <line x1="110" y1="30" x2="155" y2="30" stroke="#1d2943" stroke-width="2"/>
              <text x="160" y="22" font-size="8">Out</text>
            </svg>`
          }
        ],
        keyFormulas: [
          '阻抗 Z = R + jωL',
          '截止頻率 fc = 1/(2π√(LC))',
          '插入損耗 IL = 20*log(Vout/Vin)'
        ],
        designNotes: [
          '鐵氧體磁珠選擇：注意阻抗頻率特性',
          'LC 濾波器：選擇適合的截止頻率',
          'π 型濾波器：適合寬頻帶濾波',
          '接地設計：低阻抗接地路徑',
          '元件放置：靠近噪聲源'
        ],
        commonMistakes: [
          '未考慮阻抗頻率特性',
          '濾波器諧振頻率不當',
          '接地路徑過長',
          '元件放置位置不當',
          '未考慮溫度效應'
        ],
        examples: [
          {
            title: '電源 EMI 濾波',
            application: 'DC-DC 轉換器輸出濾波',
            circuit: '鐵氧體磁珠 + 旁路電容'
          },
          {
            title: '訊號線 EMI 濾波',
            application: '高速訊號線濾波',
            circuit: 'LC 濾波器 + 共模扼流圈'
          }
        ],
        relatedTopics: ['emi', 'shielding', 'grounding'],
        sourcePdf: 'bus-emc.html',
        createdAt: '2026-06-02T10:00:00Z',
        updatedAt: '2026-06-02T10:00:00Z'
      },
      {
        id: 'usb-design',
        title: 'USB 介面設計',
        category: 'communication',
        description: 'USB 介面的硬體設計要點，包括阻抗匹配、ESD 保護等。',
        principles: 'USB 介面需要考慮差分阻抗匹配、ESD 保護、電源設計、訊號完整性等。USB 2.0 差分阻抗為 90Ω，USB 3.0 SuperSpeed 為 90Ω。',
        circuits: [
          {
            type: 'usb2',
            description: 'USB 2.0 基本電路',
            svg: `<svg viewBox="0 0 260 100" width="260" height="100">
              <!-- USB Connector -->
              <rect x="10" y="20" width="40" height="50" fill="white" stroke="#1d2943" stroke-width="1.5"/>
              <text x="30" y="50" text-anchor="middle" font-size="8">USB</text>
              <!-- VBUS (5V) -->
              <line x1="30" y1="20" x2="30" y2="10" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="30" y1="10" x2="80" y2="10" stroke="#1d2943" stroke-width="1.5"/>
              <text x="55" y="7" font-size="7">VBUS 5V</text>
              <!-- VBUS filter cap -->
              <line x1="80" y1="10" x2="80" y2="18" stroke="#1d2943" stroke-width="1"/>
              <line x1="74" y1="18" x2="86" y2="18" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="74" y1="21" x2="86" y2="21" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="80" y1="21" x2="80" y2="28" stroke="#1d2943" stroke-width="1"/>
              <text x="80" y="16" text-anchor="middle" font-size="5">C</text>
              <!-- D+ with pull-up -->
              <line x1="30" y1="35" x2="55" y2="35" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="55" y1="35" x2="85" y2="35" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="70" y1="35" x2="70" y2="28" stroke="#1d2943" stroke-width="1"/>
              <rect x="65" y="22" width="10" height="6" fill="white" stroke="#1d2943" stroke-width="0.8"/>
              <line x1="70" y1="22" x2="70" y2="18" stroke="#1d2943" stroke-width="1"/>
              <text x="78" y="26" font-size="5">1.5k</text>
              <text x="55" y="42" font-size="6">D+</text>
              <!-- D- -->
              <line x1="30" y1="50" x2="55" y2="50" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="55" y1="50" x2="85" y2="50" stroke="#1d2943" stroke-width="1.5"/>
              <text x="55" y="57" font-size="6">D-</text>
              <!-- ESD Protection -->
              <rect x="85" y="30" width="25" height="25" fill="white" stroke="#1d2943" stroke-width="1.5"/>
              <text x="97" y="46" text-anchor="middle" font-size="6">ESD</text>
              <!-- ESD to IC -->
              <line x1="110" y1="35" x2="140" y2="35" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="110" y1="50" x2="140" y2="50" stroke="#1d2943" stroke-width="1.5"/>
              <!-- IC -->
              <rect x="140" y="25" width="40" height="35" fill="white" stroke="#1d2943" stroke-width="1.5"/>
              <text x="160" y="47" text-anchor="middle" font-size="8">IC</text>
              <!-- GND -->
              <line x1="30" y1="70" x2="30" y2="80" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="160" y1="60" x2="160" y2="80" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="30" y1="80" x2="160" y2="80" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="95" y1="80" x2="95" y2="86" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="89" y1="86" x2="101" y2="86" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="91" y1="90" x2="99" y2="90" stroke="#1d2943" stroke-width="1"/>
            </svg>`
          }
        ],
        keyFormulas: [
          '差分阻抗：Zdiff = 90Ω (USB 2.0)',
          '資料速率：12Mbps (Full Speed), 480Mbps (High Speed)',
          '共模電壓：0-3.3V'
        ],
        designNotes: [
          '差分阻抗控制：90Ω ±10%',
          'D+ 和 D- 等長匹配',
          '加 ESD 保護元件',
          'VBUS 加濾波電容',
          '連接器處注意阻抗不連續'
        ],
        commonMistakes: [
          '阻抗不匹配',
          'D+ 和 D- 長度不等',
          '未加 ESD 保護',
          'VBUS 濾波不足',
          '走線跨分割平面'
        ],
        examples: [
          {
            title: 'USB Type-C 設計',
            application: 'USB Type-C 連接器',
            circuit: '差分對匹配 + ESD 保護 + CC 腳位'
          }
        ],
        relatedTopics: ['usb', 'esd', 'impedance'],
        sourcePdf: 'bus-emc.html',
        createdAt: '2026-06-02T10:00:00Z',
        updatedAt: '2026-06-02T10:00:00Z'
      },
      {
        id: 'spi-design',
        title: 'SPI 介面設計',
        category: 'communication',
        description: 'SPI 介面的硬體設計要點，包括時脈頻率、訊號完整性等。',
        principles: 'SPI（Serial Peripheral Interface）是一種高速、全雙工的序列通訊協定。SPI 使用 4 條線：MOSI、MISO、SCK、CS。',
        circuits: [
          {
            type: 'spi-basic',
            description: '基本 SPI 連接',
            svg: `<svg viewBox="0 0 200 80" width="200" height="80">
              <rect x="10" y="20" width="40" height="40" fill="white" stroke="#1d2943" stroke-width="2"/>
              <text x="30" y="45" text-anchor="middle" font-size="8">Master</text>
              <rect x="150" y="20" width="40" height="40" fill="white" stroke="#1d2943" stroke-width="2"/>
              <text x="170" y="45" text-anchor="middle" font-size="8">Slave</text>
              <line x1="50" y1="30" x2="150" y2="30" stroke="#1d2943" stroke-width="2"/>
              <text x="100" y="25" font-size="7">MOSI</text>
              <line x1="50" y1="40" x2="150" y2="40" stroke="#1d2943" stroke-width="2"/>
              <text x="100" y="35" font-size="7">MISO</text>
              <line x1="50" y1="50" x2="150" y2="50" stroke="#1d2943" stroke-width="2"/>
              <text x="100" y="45" font-size="7">SCK</text>
              <line x1="50" y1="60" x2="150" y2="60" stroke="#1d2943" stroke-width="2"/>
              <text x="100" y="55" font-size="7">CS</text>
            </svg>`
          }
        ],
        keyFormulas: [
          '時脈頻率：最高 50MHz（標準 SPI）',
          '資料速率：等於時脈頻率',
          '傳輸模式：CPOL 和 CPHA'
        ],
        designNotes: [
          '時脈線 SCK 走線要短',
          'CS 線要加上拉電阻',
          '多從機時注意 CS 號驅動能力',
          '高速 SPI 要考慮阻抗匹配',
          '訊號線長度匹配'
        ],
        commonMistakes: [
          'SCK 走線過長導致時序問題',
          '未加上拉電阻',
          'CS 驅動能力不足',
          '未考慮訊號完整性',
          '接線錯誤（MOSI/MISO 交叉）'
        ],
        examples: [
          {
            title: 'SPI Flash 連接',
            application: '連接 SPI Flash 記憶體',
            circuit: '4 線 SPI 連接 + CS 控制'
          }
        ],
        relatedTopics: ['i2c', 'uart', 'spi'],
        sourcePdf: 'bus-emc.html',
        createdAt: '2026-06-02T10:00:00Z',
        updatedAt: '2026-06-02T10:00:00Z'
      },
      {
        id: 'op-amp-basics',
        title: '運算放大器基礎',
        category: 'analog',
        description: '運放的核心原理：虛短虛斷、九大類應用電路',
        principles: '理想運放兩大原則：虛短（同相端與反相端電位相等）和虛斷（流入兩輸入端的電流為零）。所有運放電路分析都從這兩條原則出發。',
        circuits: [
          {
            type: 'inverting',
            description: '反相放大器',
            svg: null
          },
          {
            type: 'non-inverting',
            description: '同相放大器',
            svg: null
          }
        ],
        keyFormulas: [
          '反相放大 A_V = −Rf / Rin',
          '同相放大 A_V = 1 + Rf / Rin',
          '差分放大 Vout = (Rf/R1)(V2−V1)',
          'GBW = Gain × Bandwidth',
          'SR ≥ 2π·f·Vp'
        ],
        designNotes: [
          '同相端接補償電阻 Rb = R1 ∥ Rf（平衡偏置電流）',
          '實際可用帶寬 ≈ GBW / 閉環增益',
          '單電源運放必須建立 VCC/2 虛擬地',
          '去耦電容 0.1μF 靠近電源腳'
        ],
        commonMistakes: [
          '用通用運放做比較器（應使用專用比較器 IC）',
          'GBW 不足導致帶寬不夠',
          '壓擺率 SR 不足導致失真',
          '微分器未加限頻導致振盪'
        ],
        examples: [
          {
            title: '反相放大器',
            application: '訊號放大',
            circuit: 'Rf=100k, Rin=10k, Av=-10'
          },
          {
            title: 'Sallen-Key 低通濾波器',
            application: '音訊濾波',
            circuit: '二階 Butterworth 低通'
          }
        ],
        relatedTopics: ['ldo', 'analog', 'filter'],
        sourcePdf: null,
        createdAt: '2026-06-03T10:00:00Z',
        updatedAt: '2026-06-03T10:00:00Z'
      },
      {
        id: 'mosfet-switching',
        title: 'MOSFET 開關設計',
        category: 'transistor',
        description: '功率 MOSFET 的開關特性、驅動電路、損耗分析',
        principles: 'MOSFET 作為開關使用時，需確保 Vgs > Vth 以完全導通。開關損耗包括導通損耗 (I²·Rds_on) 和開關損耗 (½·V·I·(tr+tf)·f)。',
        circuits: [
          {
            type: 'low-side-switch',
            description: 'NMOS 低端開關（含閘極電阻）',
            svg: CircuitSVG.mosfetSwitch()
          }
        ],
        keyFormulas: [
          'P_cond = I²_drain × Rds_on',
          'P_switch = ½ × Vds × Id × (tr + tf) × f',
          'Vgs_th = 2~4V (logic level)',
          'Rds_on ∝ 1/(Vgs - Vth)'
        ],
        designNotes: [
          '選擇邏輯級 MOSFET（Vgs_th < 3V）可直接 MCU 驅動',
          '閘極電阻控制開關速度與 EMI',
          '同步整流替代肖特基二極體提升效率',
          '注意 Miller 平台期間的損耗'
        ],
        commonMistakes: [
          '閘極驅動電壓不足導致 Rds_on 過高',
          '未考慮 body diode 反向恢復',
          '並聯 MOSFET 未均流',
          '熱設計不足導致熱失控'
        ],
        examples: [
          {
            title: 'Buck 同步整流',
            application: 'DC-DC 轉換器',
            circuit: '高側 + 低側 MOSFET 互補開關'
          }
        ],
        relatedTopics: ['buck', 'ldo', 'power-supply'],
        sourcePdf: null,
        createdAt: '2026-06-03T10:00:00Z',
        updatedAt: '2026-06-03T10:00:00Z'
      },
      {
        id: 'adc-dac-basics',
        title: 'ADC / DAC 基礎',
        category: 'data-conversion',
        description: '類比數位轉換器與數位類比轉換器的工作原理與選型',
        principles: 'ADC 將類比訊號轉換為數位訊號，關鍵參數包括解析度（位元數）、取樣率、SNR、ENOB。DAC 則進行反向轉換。常見架構有 SAR、Delta-Sigma、Pipeline、Flash。',
        circuits: [],
        keyFormulas: [
          'SNR = 6.02N + 1.76 dB (理想 N 位元 ADC)',
          'ENOB = (SINAD - 1.76) / 6.02',
          '取樣率 fs ≥ 2 × fmax (Nyquist)',
          'LSB = Vref / 2^N'
        ],
        designNotes: [
          'SAR ADC：中等速度（~1MSPS），中等解析度（12-18 bit）',
          'Delta-Sigma ADC：高解析度（16-24 bit），低速度',
          '參考電源品質直接影響 ADC 精度',
          '數位電源與類比電源分離，單點接地'
        ],
        commonMistakes: [
          '未考慮取樣率導致混疊',
          '參考電源噪聲影響精度',
          '數位回流路徑干擾類比訊號',
          '未加抗混疊濾波器'
        ],
        examples: [
          {
            title: '溫度量測',
            application: 'RTD/熱電偶訊號調理',
            circuit: 'Delta-Sigma ADC + PGA + 參考源'
          }
        ],
        relatedTopics: ['analog', 'signal-processing', 'power-supply'],
        sourcePdf: null,
        createdAt: '2026-06-03T10:00:00Z',
        updatedAt: '2026-06-03T10:00:00Z'
      },
      {
        id: 'esd-protection',
        title: 'ESD 保護設計',
        category: 'protection',
        description: '靜電放電保護的原理與實作，保護敏感元件',
        principles: 'ESD 事件可產生數千伏特的瞬態電壓，透過 TVS 二極體、ESD 保護 IC、壓敏電阻等元件將能量洩放至地，保護後端電路。',
        circuits: [],
        keyFormulas: [
          'V_clamp = V_breakdown + I_pp × R_dyn',
          'ESD 能量 E = ½ × C × V²（HBM：C=100pF）',
          '響應時間 < 1ns (TVS)',
          '電容負載 < 1pF (高速訊號)'
        ],
        designNotes: [
          'TVS 二極體放置在連接器入口處',
          '保護線路要短且寬，降低寄生電感',
          'USB/HDMI 等高速介面選擇低電容 ESD',
          '系統級 ESD 需考慮 IEC 61000-4-2'
        ],
        commonMistakes: [
          'ESD 保護元件距離連接器過遠',
          '接地路徑過長降低保護效果',
          '未考慮保護元件的電容對高速訊號的影響',
          '只做器件級不做系統級 ESD'
        ],
        examples: [
          {
            title: 'USB Type-C ESD',
            application: 'USB 介面保護',
            circuit: 'TVS 陣列 + 共模濾波'
          },
          {
            title: '按鍵 ESD',
            application: '使用者接觸介面',
            circuit: '壓敏電阻 + 濾波電容'
          }
        ],
        relatedTopics: ['usb', 'protection', 'emi'],
        sourcePdf: null,
        createdAt: '2026-06-03T10:00:00Z',
        updatedAt: '2026-06-03T10:00:00Z'
      },
      {
        id: 'measurement-basics',
        title: '電子量測基礎',
        category: 'measurement',
        description: '示波器、萬用表、信號發生器等常用量測儀器的使用',
        principles: '量測是驗證電路設計的關鍵步驟。示波器觀察時域波形，頻譜分析儀觀察頻域特性，萬用表量測 DC 參數，LCR 電橋量測被動元件。',
        circuits: [],
        keyFormulas: [
          '上升時間 tr(10%-90%) ≈ 0.35 / 帶寬',
          '取樣率 ≥ 10 × 信號最高頻率',
          '解析度 = V_range / 2^bits',
          '共模抑制比 CMRR = 20log(Vcm/Vout)'
        ],
        designNotes: [
          '示波器探棒接地線要短，減少環路面積',
          '使用差分探棒量測浮地訊號',
          '數位訊號量測選擇足夠帶寬的探棒',
          '注意量測儀器的輸入阻抗對電路的影響'
        ],
        commonMistakes: [
          '探棒接地線過長引入噪聲',
          '量測時改變了被測電路的工作狀態',
          '觸發設定不當導致波形不穩定',
          '未校準儀器導致量測誤差'
        ],
        examples: [
          {
            title: '電源漣波量測',
            application: 'DC-DC 轉換器輸出品質',
            circuit: '使用差分探棒 + 20MHz 帶寬限制'
          }
        ],
        relatedTopics: ['signal-processing', 'analog', 'power-supply'],
        sourcePdf: null,
        createdAt: '2026-06-03T10:00:00Z',
        updatedAt: '2026-06-03T10:00:00Z'
      },
      {
        id: 'embedded-power-design',
        title: '嵌入式系統電源設計',
        category: 'embedded',
        description: 'MCU/FPGA 等嵌入式系統的電源架構設計',
        principles: '嵌入式系統通常需要多組電源：核心電壓（1.0-1.2V）、I/O 電壓（3.3V）、類比電壓（2.5V）等。電源上電順序、暫態響應、低功耗設計是關鍵。',
        circuits: [],
        keyFormulas: [
          'P_total = Σ(P_core + P_io + P_static)',
          '上電時間差 Δt > 10ms (典型)',
          '旁路電容 C ≥ ΔI × Δt / ΔV',
          '睡眠電流 < 10μA (RTC 模式)'
        ],
        designNotes: [
          '多組電源需控制上電順序（先核心後 I/O）',
          '使用 PMIC 或多通道 PMIC 簡化設計',
          '核心電源 PDN 需低阻抗設計',
          '低功耗設計：關閉未使用的電源域'
        ],
        commonMistakes: [
          '上電順序不當導致鎖死（Latch-up）',
          '電源暫態響應不足導致 MCU 重置',
          '未考慮負載電流變化導致電壓跌落',
          '類比電源與數位電源未隔離'
        ],
        examples: [
          {
            title: 'STM32 電源設計',
            application: 'ARM Cortex-M MCU',
            circuit: '3.3V LDO + 1.2V 內核電源 + 上電順序控制'
          }
        ],
        relatedTopics: ['ldo', 'power-supply', 'fpga'],
        sourcePdf: null,
        createdAt: '2026-06-03T10:00:00Z',
        updatedAt: '2026-06-03T10:00:00Z'
      },
      // === 新增 20 張核心知識卡片 ===
      {
        id: 'boost-converter',
        title: 'Boost 升壓轉換器',
        category: 'power-management',
        description: '開關式升壓轉換器，將低電壓轉換為高電壓輸出。',
        principles: 'Boost 轉換器透過電感儲能和釋能實現升壓。當開關導通時，電感儲能；當開關關斷時，電感電壓與輸入電壓疊加，通過二極體向負載供電。輸出電壓始終高於輸入電壓。',
        circuits: [
          {
            type: 'basic',
            description: '基本 Boost 轉換器電路',
            svg: `<svg viewBox="0 0 260 100" width="260" height="100">
              <line x1="10" y1="30" x2="40" y2="30" stroke="#1d2943" stroke-width="2"/>
              <text x="10" y="22" font-size="9">Vin</text>
              <path d="M40,30 Q45,20 50,30 Q55,40 60,30 Q65,20 70,30" fill="none" stroke="#1d2943" stroke-width="2"/>
              <text x="55" y="18" text-anchor="middle" font-size="8">L</text>
              <line x1="70" y1="30" x2="90" y2="30" stroke="#1d2943" stroke-width="2"/>
              <rect x="90" y="18" width="40" height="24" fill="white" stroke="#1d2943" stroke-width="1.5"/>
              <text x="110" y="34" text-anchor="middle" font-size="8">SW</text>
              <line x1="90" y1="30" x2="90" y2="55" stroke="#1d2943" stroke-width="1.5"/>
              <polygon points="85,63 95,63 90,55" fill="#1d2943"/>
              <line x1="90" y1="63" x2="90" y2="73" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="83" y1="73" x2="97" y2="73" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="85" y1="77" x2="95" y2="77" stroke="#1d2943" stroke-width="1"/>
              <text x="100" y="67" font-size="7">D</text>
              <line x1="110" y1="30" x2="110" y2="18" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="110" y1="18" x2="180" y2="18" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="180" y1="18" x2="180" y2="30" stroke="#1d2943" stroke-width="2"/>
              <line x1="180" y1="30" x2="180" y2="42" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="170" y1="42" x2="190" y2="42" stroke="#1d2943" stroke-width="2"/>
              <line x1="170" y1="47" x2="190" y2="47" stroke="#1d2943" stroke-width="2"/>
              <line x1="180" y1="47" x2="180" y2="58" stroke="#1d2943" stroke-width="1.5"/>
              <text x="180" y="40" text-anchor="middle" font-size="7">C</text>
              <line x1="172" y1="58" x2="188" y2="58" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="175" y1="62" x2="185" y2="62" stroke="#1d2943" stroke-width="1"/>
              <line x1="180" y1="30" x2="240" y2="30" stroke="#1d2943" stroke-width="2"/>
              <text x="245" y="22" font-size="9">Vout</text>
            </svg>`
          }
        ],
        keyFormulas: [
          'Vout = Vin / (1 - D)',
          'D = 1 - Vin/Vout',
          'IL = Iout / (1 - D)',
          'Duty Cycle D = Ton / T'
        ],
        designNotes: [
          '選擇適合的電感（飽和電流 > 峰值電流 1.3 倍）',
          '輸入電容要靠近 IC，減少輸入紋波',
          '二極體選擇低 Vf 的肖特基二極體',
          '注意輸出電壓不能超過 IC 最大額定值',
          'PCB layout 減少開關迴路面積'
        ],
        commonMistakes: [
          '電感飽和電流不足導致效率降低',
          '輸出電容 ESR 過高導致紋波過大',
          '二極體反向恢復時間影響效率',
          'PCB layout 不良導致 EMI 問題',
          '未考慮輕載時的 DCM 模式'
        ],
        examples: [
          {
            title: '3.3V to 5V Boost',
            application: '從 3.3V 電池產生 5V USB 電源',
            circuit: '使用 MT3608 的 2A Boost 轉換器'
          },
          {
            title: '12V to 24V Boost',
            application: 'LED 驅動電源',
            circuit: '使用 LM2587 的 5A Boost 轉換器'
          }
        ],
        relatedTopics: ['buck', 'buck-boost', 'power-supply'],
        sourcePdf: null,
        createdAt: '2026-06-12T10:00:00Z',
        updatedAt: '2026-06-12T10:00:00Z'
      },
      {
        id: 'buck-boost-converter',
        title: 'Buck-Boost 升降壓轉換器',
        category: 'power-management',
        description: '可升壓可降壓的開關轉換器，輸出電壓可正可負。',
        principles: 'Buck-Boost 轉換器結合了 Buck 和 Boost 的特點，可以實現任意電壓轉換。反相 Buck-Boost 輸出與輸入反相；非反相 Buck-Boost 使用四個開關實現正輸出。',
        circuits: [
          {
            type: 'inverting',
            description: '反相 Buck-Boost 電路',
            svg: `<svg viewBox="0 0 220 90" width="220" height="90">
              <line x1="10" y1="30" x2="30" y2="30" stroke="#1d2943" stroke-width="2"/>
              <text x="10" y="22" font-size="8">Vin</text>
              <rect x="30" y="18" width="35" height="24" fill="white" stroke="#1d2943" stroke-width="1.5"/>
              <text x="47" y="34" text-anchor="middle" font-size="7">SW</text>
              <line x1="65" y1="30" x2="85" y2="30" stroke="#1d2943" stroke-width="2"/>
              <path d="M85,30 Q90,20 95,30 Q100,40 105,30" fill="none" stroke="#1d2943" stroke-width="2"/>
              <text x="95" y="18" text-anchor="middle" font-size="7">L</text>
              <line x1="105" y1="30" x2="130" y2="30" stroke="#1d2943" stroke-width="2"/>
              <line x1="130" y1="30" x2="130" y2="42" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="120" y1="42" x2="140" y2="42" stroke="#1d2943" stroke-width="2"/>
              <line x1="120" y1="47" x2="140" y2="47" stroke="#1d2943" stroke-width="2"/>
              <line x1="130" y1="47" x2="130" y2="58" stroke="#1d2943" stroke-width="1.5"/>
              <text x="130" y="40" text-anchor="middle" font-size="6">C</text>
              <line x1="122" y1="58" x2="138" y2="58" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="125" y1="62" x2="135" y2="62" stroke="#1d2943" stroke-width="1"/>
              <line x1="130" y1="30" x2="190" y2="30" stroke="#1d2943" stroke-width="2"/>
              <text x="195" y="22" font-size="8">Vout</text>
              <text x="100" y="78" text-anchor="middle" font-size="7">Vout = -Vin * D/(1-D)</text>
            </svg>`
          }
        ],
        keyFormulas: [
          'Vout = -Vin * D / (1 - D)（反相）',
          'Vout = Vin * D / (1 - D)（非反相）',
          'D = Vout / (Vin + Vout)',
          '電感電流 ΔIL = Vin * D / (f * L)'
        ],
        designNotes: [
          '反相 Buck-Boost 輸出為負電壓',
          '非反相 Buck-Boost 使用四個開關',
          '電感選擇需考慮峰值電流',
          '輸出電容需承受較大紋波電流',
          '注意占空比極限（D > 0.5 升壓，D < 0.5 降壓）'
        ],
        commonMistakes: [
          '未考慮反相輸出的接地問題',
          '電感值選擇不當導致連續/不連續模式混亂',
          '輸出電容紋波電流額定值不足',
          '開關頻率過低導致電感體積過大',
          '未考慮輕載效率'
        ],
        examples: [
          {
            title: '5V to ±12V',
            application: '運放正負電源',
            circuit: '使用 TPS65133 的雙輸出 Buck-Boost'
          }
        ],
        relatedTopics: ['buck', 'boost', 'power-supply'],
        sourcePdf: null,
        createdAt: '2026-06-12T10:00:00Z',
        updatedAt: '2026-06-12T10:00:00Z'
      },
      {
        id: 'ldo-selection',
        title: 'LDO 選型指南',
        category: 'power-management',
        description: '如何根據應用需求選擇適合的 LDO 穩壓器。',
        principles: 'LDO 選型需考慮：輸入/輸出電壓範圍、負載電流、 Dropout Voltage、PSRR、輸出噪聲、靜態電流、封裝散熱能力等參數。',
        circuits: [
          {
            type: 'selection-guide',
            description: 'LDO 選型決策流程',
            svg: `<svg viewBox="0 0 280 120" width="280" height="120">
              <rect x="10" y="10" width="60" height="25" fill="#e8f4f8" stroke="#1d2943" stroke-width="1.5" rx="3"/>
              <text x="40" y="27" text-anchor="middle" font-size="7">確認需求</text>
              <line x1="40" y1="35" x2="40" y2="45" stroke="#1d2943" stroke-width="1.5"/>
              <polygon points="35,50 45,50 40,45" fill="#1d2943"/>
              <rect x="10" y="50" width="60" height="25" fill="#e8f4f8" stroke="#1d2943" stroke-width="1.5" rx="3"/>
              <text x="40" y="67" text-anchor="middle" font-size="7">Vin/Vout/Iout</text>
              <line x1="70" y1="62" x2="100" y2="62" stroke="#1d2943" stroke-width="1.5"/>
              <rect x="100" y="50" width="70" height="25" fill="#e8f4f8" stroke="#1d2943" stroke-width="1.5" rx="3"/>
              <text x="135" y="67" text-anchor="middle" font-size="7">計算功耗</text>
              <text x="135" y="77" text-anchor="middle" font-size="6">Pd=(Vin-Vout)*Iout</text>
              <line x1="170" y1="62" x2="200" y2="62" stroke="#1d2943" stroke-width="1.5"/>
              <rect x="200" y="50" width="70" height="25" fill="#e8f4f8" stroke="#1d2943" stroke-width="1.5" rx="3"/>
              <text x="235" y="67" text-anchor="middle" font-size="7">選擇封裝</text>
              <text x="235" y="77" text-anchor="middle" font-size="6">SOT23/SOT89/QFN</text>
              <line x1="235" y1="75" x2="235" y2="85" stroke="#1d2943" stroke-width="1.5"/>
              <rect x="180" y="85" width="110" height="25" fill="#d4edda" stroke="#1d2943" stroke-width="1.5" rx="3"/>
              <text x="235" y="102" text-anchor="middle" font-size="7">驗證熱阻 θJA</text>
            </svg>`
          }
        ],
        keyFormulas: [
          'Pd = (Vin - Vout) × Iout',
          'Tj = Ta + Pd × θJA',
          '效率 η = Vout/Vin × 100%',
          'Dropout = Vin - Vout (min)'
        ],
        designNotes: [
          '功耗 Pd = (Vin-Vout)*Iout，確保 Tj < 125°C',
          'Dropout Voltage 必須小於 Vin-Vout',
          '高 PSRR LDO 適合 RF/類比電路',
          '低噪聲 LDO 適合精密量測電路',
          '靜態電流 Iq 影響電池壽命'
        ],
        commonMistakes: [
          '未計算功耗導致過熱',
          '選擇的 LDO Dropout 過高',
          '未考慮 PSRR 頻率特性',
          '散熱設計不足',
          '輸出電容 ESR 不符合規格'
        ],
        examples: [
          {
            title: '3.3V to 1.8V',
            application: 'MCU 核心電源',
            circuit: '選擇 TPS7A20（低噪聲、高 PSRR）'
          },
          {
            title: '5V to 3.3V',
            application: '感測器電源',
            circuit: '選擇 AMS1117（低成本、大電流）'
          }
        ],
        relatedTopics: ['buck', 'ldo', 'power-supply'],
        sourcePdf: null,
        createdAt: '2026-06-12T10:00:00Z',
        updatedAt: '2026-06-12T10:00:00Z'
      },
      {
        id: 'power-sequencing',
        title: '電源上電順序設計',
        category: 'power-management',
        description: '多組電源的上電順序控制，確保系統正確啟動。',
        principles: '許多 IC（如 FPGA、DSP、ARM）要求多組電源按照特定順序上電。例如：核心電壓先上電，I/O 電壓後上電。錯誤的順序可能導致鎖死（Latch-up）或永久損壞。',
        circuits: [
          {
            type: 'simple-delay',
            description: 'RC 延遲上電電路',
            svg: `<svg viewBox="0 0 200 70" width="200" height="70">
              <text x="10" y="15" font-size="8">Power_EN</text>
              <line x1="10" y1="20" x2="30" y2="20" stroke="#1d2943" stroke-width="1.5"/>
              <rect x="30" y="15" width="20" height="10" fill="white" stroke="#1d2943" stroke-width="1"/>
              <text x="40" y="23" text-anchor="middle" font-size="6">R</text>
              <line x1="50" y1="20" x2="70" y2="20" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="70" y1="20" x2="70" y2="30" stroke="#1d2943" stroke-width="1"/>
              <line x1="60" y1="30" x2="80" y2="30" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="60" y1="34" x2="80" y2="34" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="70" y1="34" x2="70" y2="42" stroke="#1d2943" stroke-width="1"/>
              <text x="70" y="28" text-anchor="middle" font-size="5">C</text>
              <line x1="62" y1="42" x2="78" y2="42" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="65" y1="46" x2="75" y2="46" stroke="#1d2943" stroke-width="1"/>
              <line x1="70" y1="20" x2="100" y2="20" stroke="#1d2943" stroke-width="1.5"/>
              <rect x="100" y="12" width="40" height="16" fill="white" stroke="#1d2943" stroke-width="1.5"/>
              <text x="120" y="24" text-anchor="middle" font-size="7">LDO_EN</text>
              <text x="120" y="58" text-anchor="middle" font-size="7">Delay = R × C</text>
            </svg>`
          }
        ],
        keyFormulas: [
          'Delay = R × C（RC 延遲）',
          '上電時間差 Δt > 10ms（典型）',
          '核心電壓先於 I/O 電壓',
          '監控電壓需在穩定後釋放 Reset'
        ],
        designNotes: [
          '使用 PMIC 內建上電順序控制',
          'RC 延遲電路簡單但精度低',
          '專用上電順序 IC（如 TPS3808）更可靠',
          '監控電壓穩定後再釋放 MCU Reset',
          '考慮掉電時的反向順序'
        ],
        commonMistakes: [
          '上電順序不當導致鎖死',
          '未考慮掉電時的反向順序',
          '延遲時間不足',
          '監控電壓閾值設置不當',
          '未考慮負載影響上電時間'
        ],
        examples: [
          {
            title: 'FPGA 上電順序',
            application: 'Xilinx Artix-7 FPGA',
            circuit: 'VCCINT(1.0V) → VCCAUX(1.8V) → VCCO(3.3V)'
          }
        ],
        relatedTopics: ['ldo', 'power-supply', 'embedded'],
        sourcePdf: null,
        createdAt: '2026-06-12T10:00:00Z',
        updatedAt: '2026-06-12T10:00:00Z'
      },
      {
        id: 'decoupling-capacitor',
        title: '去耦電容選擇與放置',
        category: 'power-management',
        description: '去耦電容的原理、選型、放置策略，確保電源完整性。',
        principles: '去耦電容為 IC 提供局部電荷儲存，減少電源阻抗。不同容值的電容覆蓋不同頻率範圍：大電容（10-100µF）低頻，小電容（0.1µF-10nF）高頻。',
        circuits: [
          {
            type: 'multi-cap',
            description: '多級去耦電容配置',
            svg: `<svg viewBox="0 0 250 80" width="250" height="80">
              <line x1="10" y1="20" x2="240" y2="20" stroke="#1d2943" stroke-width="2"/>
              <text x="5" y="15" font-size="7">VCC</text>
              <rect x="40" y="20" width="12" height="18" fill="white" stroke="#1d2943" stroke-width="1"/>
              <line x1="46" y1="38" x2="46" y2="50" stroke="#1d2943" stroke-width="1"/>
              <line x1="38" y1="50" x2="54" y2="50" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="40" y1="54" x2="52" y2="54" stroke="#1d2943" stroke-width="1"/>
              <line x1="46" y1="54" x2="46" y2="60" stroke="#1d2943" stroke-width="1"/>
              <text x="46" y="16" text-anchor="middle" font-size="5">100µF</text>
              <rect x="90" y="20" width="10" height="15" fill="white" stroke="#1d2943" stroke-width="1"/>
              <line x1="95" y1="35" x2="95" y2="45" stroke="#1d2943" stroke-width="1"/>
              <line x1="88" y1="45" x2="102" y2="45" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="88" y1="49" x2="102" y2="49" stroke="#1d2943" stroke-width="1"/>
              <line x1="95" y1="49" x2="95" y2="55" stroke="#1d2943" stroke-width="1"/>
              <text x="95" y="16" text-anchor="middle" font-size="5">10µF</text>
              <rect x="135" y="20" width="8" height="12" fill="white" stroke="#1d2943" stroke-width="1"/>
              <line x1="139" y1="32" x2="139" y2="40" stroke="#1d2943" stroke-width="1"/>
              <line x1="133" y1="40" x2="145" y2="40" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="133" y1="43" x2="145" y2="43" stroke="#1d2943" stroke-width="1"/>
              <line x1="139" y1="43" x2="139" y2="48" stroke="#1d2943" stroke-width="1"/>
              <text x="139" y="16" text-anchor="middle" font-size="5">100nF</text>
              <rect x="175" y="20" width="6" height="10" fill="white" stroke="#1d2943" stroke-width="1"/>
              <line x1="178" y1="30" x2="178" y2="36" stroke="#1d2943" stroke-width="1"/>
              <line x1="173" y1="36" x2="183" y2="36" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="173" y1="39" x2="183" y2="39" stroke="#1d2943" stroke-width="1"/>
              <line x1="178" y1="39" x2="178" y2="43" stroke="#1d2943" stroke-width="1"/>
              <text x="178" y="16" text-anchor="middle" font-size="5">10nF</text>
              <rect x="210" y="20" width="20" height="25" fill="white" stroke="#1d2943" stroke-width="1.5"/>
              <text x="220" y="36" text-anchor="middle" font-size="7">IC</text>
            </svg>`
          }
        ],
        keyFormulas: [
          '諧振頻率 f0 = 1 / (2π√(L×C))',
          '阻抗 Z = √(ESR² + (Xc-Xl)²)',
          '容值越大，諧振頻率越低',
          'ESL 越小，高頻性能越好'
        ],
        designNotes: [
          '每個 IC 電源腳都應有去耦電容',
          '電容盡量靠近 IC 放置（< 5mm）',
          '大電容用於低頻，小電容用於高頻',
          '選擇低 ESL 的陶瓷電容（0402/0201）',
          '過孔連接減少寄生電感'
        ],
        commonMistakes: [
          '電容距離 IC 過遠',
          '只用單一容值',
          '未考慮 ESR/ESL 影響',
          '過孔數量不足',
          '未考慮溫度對容值的影響'
        ],
        examples: [
          {
            title: 'MCU 去耦',
            application: 'ARM Cortex-M MCU',
            circuit: '每腳 100nF + 共用 10µF'
          }
        ],
        relatedTopics: ['pdn', 'power-supply', 'emi'],
        sourcePdf: null,
        createdAt: '2026-06-12T10:00:00Z',
        updatedAt: '2026-06-12T10:00:00Z'
      },
      {
        id: 'common-mode-choke',
        title: '共模扼流圈設計',
        category: 'emi-emc',
        description: '共模噪聲抑制原理與共模扼流圈選型。',
        principles: '共模扼流圈利用磁通抵消原理，對差分訊號呈現低阻抗，對共模噪聲呈現高阻抗。廣泛用於 USB、HDMI、電源線 EMI 濾波。',
        circuits: [
          {
            type: 'cm-choke',
            description: '共模扼流圈電路',
            svg: `<svg viewBox="0 0 200 80" width="200" height="80">
              <line x1="10" y1="25" x2="40" y2="25" stroke="#1d2943" stroke-width="1.5"/>
              <text x="10" y="18" font-size="7">In+</text>
              <line x1="10" y1="50" x2="40" y2="50" stroke="#1d2943" stroke-width="1.5"/>
              <text x="10" y="60" font-size="7">In-</text>
              <rect x="40" y="15" width="50" height="50" fill="white" stroke="#1d2943" stroke-width="1.5"/>
              <text x="65" y="35" text-anchor="middle" font-size="7">共模扼流圈</text>
              <path d="M50,40 Q55,30 60,40 Q65,50 70,40 Q75,30 80,40" fill="none" stroke="#1d2943" stroke-width="1.5"/>
              <path d="M50,55 Q55,45 60,55 Q65,65 70,55 Q75,45 80,55" fill="none" stroke="#1d2943" stroke-width="1.5"/>
              <text x="65" y="48" text-anchor="middle" font-size="5">同名端</text>
              <line x1="90" y1="25" x2="130" y2="25" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="90" y1="50" x2="130" y2="50" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="130" y1="25" x2="130" y2="35" stroke="#1d2943" stroke-width="1"/>
              <line x1="122" y1="35" x2="138" y2="35" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="122" y1="39" x2="138" y2="39" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="130" y1="39" x2="130" y2="47" stroke="#1d2943" stroke-width="1"/>
              <text x="130" y="33" text-anchor="middle" font-size="5">Cg</text>
              <line x1="130" y1="50" x2="130" y2="60" stroke="#1d2943" stroke-width="1"/>
              <line x1="123" y1="60" x2="137" y2="60" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="125" y1="63" x2="135" y2="63" stroke="#1d2943" stroke-width="1"/>
              <line x1="130" y1="25" x2="170" y2="25" stroke="#1d2943" stroke-width="1.5"/>
              <text x="175" y="22" font-size="7">Out+</text>
              <line x1="130" y1="50" x2="170" y2="50" stroke="#1d2943" stroke-width="1.5"/>
              <text x="175" y="55" font-size="7">Out-</text>
            </svg>`
          }
        ],
        keyFormulas: [
          '共模阻抗 Zcm = jωLcm',
          '差分阻抗 Zdm ≈ 0（磁通抵消）',
          '額定電流 ≥ 負載電流',
          'DCR 越小越好（減少壓降）'
        ],
        designNotes: [
          '選擇適合的額定電流（留 20% 餘量）',
          '注意 DCR 對壓降的影響',
          '高頻應用選擇鐵氧體磁芯',
          '差分訊號線要緊耦合',
          '放置在連接器入口處'
        ],
        commonMistakes: [
          '額定電流不足導致飽和',
          'DCR 過大導致壓降',
          '未考慮差分訊號完整性',
          '放置位置不當',
          '磁芯材料選擇不當'
        ],
        examples: [
          {
            title: 'USB 共模濾波',
            application: 'USB 2.0/3.0 EMI 濾波',
            circuit: '共模扼流圈 + 差模電容'
          }
        ],
        relatedTopics: ['emi', 'usb', 'filter'],
        sourcePdf: null,
        createdAt: '2026-06-12T10:00:00Z',
        updatedAt: '2026-06-12T10:00:00Z'
      },
      {
        id: 'emi-layout',
        title: 'EMI PCB Layout 技巧',
        category: 'emi-emc',
        description: 'PCB 層面減少 EMI 的 Layout 技巧。',
        principles: 'EMI 的根本原因是高頻電流迴路面積。透過減小迴路面積、提供低阻抗返回路徑、使用完整參考平面等方法，可以有效降低 EMI。',
        circuits: [
          {
            type: 'current-loop',
            description: '電流迴路面積示意',
            svg: `<svg viewBox="0 0 250 80" width="250" height="80">
              <rect x="10" y="10" width="40" height="20" fill="white" stroke="#1d2943" stroke-width="1.5"/>
              <text x="30" y="24" text-anchor="middle" font-size="7">Driver</text>
              <rect x="180" y="10" width="40" height="20" fill="white" stroke="#1d2943" stroke-width="1.5"/>
              <text x="200" y="24" text-anchor="middle" font-size="7">Recv</text>
              <line x1="50" y1="20" x2="180" y2="20" stroke="#1d2943" stroke-width="2"/>
              <text x="115" y="15" font-size="7">訊號路徑</text>
              <line x1="180" y1="30" x2="50" y2="30" stroke="#3498db" stroke-width="2" stroke-dasharray="4"/>
              <text x="115" y="40" font-size="7">返回路徑（平面層）</text>
              <rect x="60" y="50" width="100" height="20" fill="#f0f0f0" stroke="#1d2943" stroke-width="1"/>
              <text x="110" y="64" text-anchor="middle" font-size="7">GND Plane</text>
              <text x="125" y="55" font-size="6" fill="green">小迴路面積 = 低 EMI</text>
            </svg>`
          }
        ],
        keyFormulas: [
          'EMI ∝ I × A × f²',
          'A = 迴路面積',
          '減少 A 可有效降低 EMI',
          '返回路徑緊鄰訊號路徑'
        ],
        designNotes: [
          '高速訊號走線緊鄰參考平面',
          '保持完整、連續的參考平面',
          '避免訊號線跨越分割平面',
          '減少 via 數量和 stub 長度',
          '使用保護走線或共模扼流圈'
        ],
        commonMistakes: [
          '訊號線跨越分割平面',
          '參考平面不連續',
          '返回路徑過長',
          '未考慮電源平面的高頻特性',
          'connector 處未加濾波'
        ],
        examples: [
          {
            title: '高速訊號 Layout',
            application: 'USB 3.0、HDMI 等',
            circuit: '訊號層緊鄰 GND 平面，保持完整參考平面'
          }
        ],
        relatedTopics: ['emi', 'pcb', 'signal-integrity'],
        sourcePdf: null,
        createdAt: '2026-06-12T10:00:00Z',
        updatedAt: '2026-06-12T10:00:00Z'
      },
      {
        id: 'tvd-selection',
        title: 'TVS 二極體選型',
        category: 'protection',
        description: 'TVS 二極體的選型原則與應用電路。',
        principles: 'TVS（Transient Voltage Suppressor）二極體在過壓時快速導通（< 1ns），將電壓鉗位在安全範圍，保護後端電路。選型需考慮鉗位電壓、功率額定值、電容等。',
        circuits: [
          {
            type: 'tvs-basic',
            description: 'TVS 保護電路',
            svg: `<svg viewBox="0 0 200 70" width="200" height="70">
              <line x1="10" y1="30" x2="50" y2="30" stroke="#1d2943" stroke-width="2"/>
              <text x="10" y="22" font-size="8">Vin</text>
              <rect x="50" y="20" width="30" height="20" fill="white" stroke="#1d2943" stroke-width="1.5"/>
              <text x="65" y="34" text-anchor="middle" font-size="7">TVS</text>
              <line x1="65" y1="40" x2="65" y2="52" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="57" y1="52" x2="73" y2="52" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="59" y1="55" x2="71" y2="55" stroke="#1d2943" stroke-width="1"/>
              <line x1="80" y1="30" x2="140" y2="30" stroke="#1d2943" stroke-width="2"/>
              <rect x="140" y="20" width="40" height="20" fill="white" stroke="#1d2943" stroke-width="1.5"/>
              <text x="160" y="34" text-anchor="middle" font-size="7">Load</text>
              <text x="100" y="60" text-anchor="middle" font-size="6">Vclamp = Vbr + Ipp × Rdyn</text>
            </svg>`
          }
        ],
        keyFormulas: [
          'Vclamp = Vbr + Ipp × Rdyn',
          'Power = Vclamp × Ipp',
          'Capacitance < 1pF (高速)',
          'Response time < 1ns'
        ],
        designNotes: [
          'VRWM > 工作電壓（確保正常時不導通）',
          'Vclamp < 待保護 IC 的最大額定電壓',
          '高速訊號選擇低電容 TVS',
          'TVS 放置在連接器入口處',
          '接地路徑要短且寬'
        ],
        commonMistakes: [
          'VRWM 選擇過低導致正常時導通',
          'Vclamp 過高無法保護 IC',
          '電容過大影響高速訊號',
          '接地路徑過長',
          '未考慮功率額定值'
        ],
        examples: [
          {
            title: 'USB TVS',
            application: 'USB 介面 ESD 保護',
            circuit: '選擇 USBLC6-2SC6（低電容、0402 封裝）'
          }
        ],
        relatedTopics: ['esd', 'usb', 'protection'],
        sourcePdf: null,
        createdAt: '2026-06-12T10:00:00Z',
        updatedAt: '2026-06-12T10:00:00Z'
      },
      {
        id: 'reverse-polarity',
        title: '防反接保護電路',
        category: 'protection',
        description: '電源極性反接保護的方法與電路設計。',
        principles: '電源極性反接可能損壞電路。常用保護方法包括：串聯二極體（簡單但有壓降）、MOSFET 防反接（低壓降）、橋式整流（不分極性但效率低）。',
        circuits: [
          {
            type: 'mosfet-reverse',
            description: 'MOSFET 防反接電路',
            svg: `<svg viewBox="0 0 200 60" width="200" height="60">
              <line x1="10" y1="25" x2="40" y2="25" stroke="#1d2943" stroke-width="2"/>
              <text x="10" y="18" font-size="8">Vin+</text>
              <rect x="40" y="15" width="40" height="20" fill="white" stroke="#1d2943" stroke-width="1.5"/>
              <text x="60" y="29" text-anchor="middle" font-size="7">P-MOS</text>
              <text x="60" y="12" text-anchor="middle" font-size="6">S</text>
              <text x="80" y="12" text-anchor="middle" font-size="6">D</text>
              <line x1="80" y1="25" x2="140" y2="25" stroke="#1d2943" stroke-width="2"/>
              <rect x="140" y="15" width="40" height="20" fill="white" stroke="#1d2943" stroke-width="1.5"/>
              <text x="160" y="29" text-anchor="middle" font-size="7">Load</text>
              <line x1="60" y1="35" x2="60" y2="45" stroke="#1d2943" stroke-width="1"/>
              <line x1="52" y1="45" x2="68" y2="45" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="54" y1="48" x2="66" y2="48" stroke="#1d2943" stroke-width="1"/>
              <text x="60" y="55" text-anchor="middle" font-size="5">G（接Vin+）</text>
            </svg>`
          }
        ],
        keyFormulas: [
          '二極體壓降 Vf = 0.3~0.7V',
          'MOSFET Rds_on = 幾 mΩ',
          '效率 η = (Vin - Vdrop)/Vin',
          '功率損耗 P = I² × Rds_on'
        ],
        designNotes: [
          'MOSFET 防反接：選擇低 Rds_on 的 P-MOS',
          '二極體防反接：選擇肖特基（低 Vf）',
          '橋式整流：不分極性但有 2 個二極體壓降',
          '大電流應用優先選擇 MOSFET 方案',
          '注意 MOSFET 的 Vgs 額定值'
        ],
        commonMistakes: [
          '二極體壓降過大導致效率低',
          'MOSFET Vgs 額定值不足',
          '未考慮反向漏電流',
          '散熱設計不足',
          '選擇不適合的保護方案'
        ],
        examples: [
          {
            title: '電池防反接',
            application: '電池供電設備',
            circuit: 'P-MOS 防反接 + 過流保護'
          }
        ],
        relatedTopics: ['protection', 'power-supply', 'automotive'],
        sourcePdf: null,
        createdAt: '2026-06-12T10:00:00Z',
        updatedAt: '2026-06-12T10:00:00Z'
      },
      {
        id: 'thermal-design',
        title: 'PCB 散熱設計',
        category: 'pcb-design',
        description: '功率元件的散熱計算與 PCB 散熱設計。',
        principles: '功率元件產生的熱量需要有效散熱，否則會導致效率降低、壽命縮短、甚至損壞。散熱設計包括熱阻計算、散熱路徑優化、散熱元件選擇。',
        circuits: [
          {
            type: 'thermal-model',
            description: '熱阻模型',
            svg: `<svg viewBox="0 0 250 60" width="250" height="60">
              <rect x="10" y="15" width="40" height="30" fill="#ffcccc" stroke="#1d2943" stroke-width="1.5"/>
              <text x="30" y="34" text-anchor="middle" font-size="7">Tj</text>
              <line x1="50" y1="30" x2="70" y2="30" stroke="#1d2943" stroke-width="2"/>
              <text x="60" y="25" text-anchor="middle" font-size="6">θJC</text>
              <rect x="70" y="15" width="40" height="30" fill="#ffcccc" stroke="#1d2943" stroke-width="1.5"/>
              <text x="90" y="34" text-anchor="middle" font-size="7">Tc</text>
              <line x1="110" y1="30" x2="130" y2="30" stroke="#1d2943" stroke-width="2"/>
              <text x="120" y="25" text-anchor="middle" font-size="6">θCS</text>
              <rect x="130" y="15" width="40" height="30" fill="#ffcccc" stroke="#1d2943" stroke-width="1.5"/>
              <text x="150" y="34" text-anchor="middle" font-size="7">Ts</text>
              <line x1="170" y1="30" x2="190" y2="30" stroke="#1d2943" stroke-width="2"/>
              <text x="180" y="25" text-anchor="middle" font-size="6">θSA</text>
              <rect x="190" y="15" width="40" height="30" fill="#ffcccc" stroke="#1d2943" stroke-width="1.5"/>
              <text x="210" y="34" text-anchor="middle" font-size="7">Ta</text>
            </svg>`
          }
        ],
        keyFormulas: [
          'Tj = Ta + Pd × θJA',
          'θJA = θJC + θCS + θSA',
          'Pd = (Vin - Vout) × Iout',
          'Tj(max) < 125°C（典型）'
        ],
        designNotes: [
          '計算熱阻：θJA = θJC + θCS + θSA',
          '增加散熱過孔（熱焊盤下方）',
          '使用厚銅層散熱',
          '加散熱片或熱墊',
          '考慮氣流方向和散熱路徑'
        ],
        commonMistakes: [
          '未計算熱阻導致過熱',
          '散熱過孔數量不足',
          '未考慮周圍元件的熱影響',
          '散熱片方向不當',
          '未進行熱仿真驗證'
        ],
        examples: [
          {
            title: 'LDO 散熱',
            application: 'AMS1117 3.3V LDO',
            circuit: 'SOT223 封裝 + 散熱過孔 + 銅皮散熱'
          }
        ],
        relatedTopics: ['pcb', 'power-supply', 'thermal'],
        sourcePdf: null,
        createdAt: '2026-06-12T10:00:00Z',
        updatedAt: '2026-06-12T10:00:00Z'
      },
      {
        id: 'via-design',
        title: 'PCB Via 設計',
        category: 'pcb-design',
        description: '過孔（Via）的類型、設計規則與寄生效應。',
        principles: 'Via 連接不同層的走線，但會引入寄生電容和寄生電感，影響高速訊號品質。Via 設計需要考慮孔徑、孔環、stub 長度、反鑽等。',
        circuits: [
          {
            type: 'via-types',
            description: 'Via 類型比較',
            svg: `<svg viewBox="0 0 250 80" width="250" height="80">
              <rect x="10" y="5" width="50" height="70" fill="none" stroke="#1d2943" stroke-width="1.5" stroke-dasharray="3"/>
              <line x1="35" y1="10" x2="35" y2="70" stroke="#1d2943" stroke-width="3"/>
              <text x="35" y="78" text-anchor="middle" font-size="6">通孔</text>
              <rect x="70" y="5" width="50" height="70" fill="none" stroke="#1d2943" stroke-width="1.5" stroke-dasharray="3"/>
              <line x1="95" y1="10" x2="95" y2="40" stroke="#1d2943" stroke-width="3"/>
              <text x="95" y="78" text-anchor="middle" font-size="6">盲孔</text>
              <rect x="130" y="5" width="50" height="70" fill="none" stroke="#1d2943" stroke-width="1.5" stroke-dasharray="3"/>
              <line x1="155" y1="25" x2="155" y2="55" stroke="#1d2943" stroke-width="3"/>
              <text x="155" y="78" text-anchor="middle" font-size="6">埋孔</text>
              <rect x="190" y="5" width="50" height="70" fill="none" stroke="#1d2943" stroke-width="1.5" stroke-dasharray="3"/>
              <line x1="215" y1="10" x2="215" y2="30" stroke="#1d2943" stroke-width="2"/>
              <text x="215" y="78" text-anchor="middle" font-size="6">微孔</text>
            </svg>`
          }
        ],
        keyFormulas: [
          'C_via ≈ 0.3~0.5pF',
          'L_via ≈ 0.8~1.0nH',
          '阻抗不連續 ΔZ ≈ 5~10%',
          'Stub 長度 < λ/20'
        ],
        designNotes: [
          '高速訊號使用反鑽（backdrill）去除 stub',
          '微孔（Microvia）適合 HDI 設計',
          'via 孔徑盡量小以減少寄生效應',
          'via 旁加接地過孔提供返回路徑',
          '注意 via 的製程能力限制'
        ],
        commonMistakes: [
          '未考慮 via 的寄生效應',
          'stub 過長導致諧振',
          'via 孔徑過小導致製程困難',
          '未提供返回路徑',
          '未考慮 via 的熱效應'
        ],
        examples: [
          {
            title: '高速 via 設計',
            application: '10Gbps+ 訊號',
            circuit: '反鑽 + 接地過孔陣列'
          }
        ],
        relatedTopics: ['pcb', 'signal-integrity', 'emi'],
        sourcePdf: null,
        createdAt: '2026-06-12T10:00:00Z',
        updatedAt: '2026-06-12T10:00:00Z'
      },
      {
        id: 'grounding-design',
        title: '接地設計原則',
        category: 'pcb-design',
        description: 'PCB 接地策略：單點接地、多點接地、混合接地。',
        principles: '接地是 EMI 和訊號完整性的基礎。低頻電路使用單點接地避免地迴路；高頻電路使用多點接地降低接地阻抗；混合電路需要分區接地。',
        circuits: [
          {
            type: 'grounding-types',
            description: '接地方式比較',
            svg: `<svg viewBox="0 0 250 80" width="250" height="80">
              <text x="40" y="10" text-anchor="middle" font-size="7">單點接地</text>
              <line x1="20" y1="20" x2="40" y2="40" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="40" y1="20" x2="40" y2="40" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="60" y1="20" x2="40" y2="40" stroke="#1d2943" stroke-width="1.5"/>
              <circle cx="40" cy="40" r="3" fill="#1d2943"/>
              <line x1="40" y1="43" x2="40" y2="55" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="32" y1="55" x2="48" y2="55" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="34" y1="58" x2="46" y2="58" stroke="#1d2943" stroke-width="1"/>
              <text x="120" y="10" text-anchor="middle" font-size="7">多點接地</text>
              <line x1="100" y1="20" x2="100" y2="55" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="120" y1="20" x2="120" y2="55" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="140" y1="20" x2="140" y2="55" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="92" y1="55" x2="148" y2="55" stroke="#1d2943" stroke-width="2"/>
              <text x="200" y="10" text-anchor="middle" font-size="7">分區接地</text>
              <rect x="175" y="20" width="50" height="25" fill="#ffcccc" stroke="#1d2943" stroke-width="1"/>
              <text x="200" y="36" text-anchor="middle" font-size="6">類比</text>
              <rect x="175" y="48" width="50" height="25" fill="#ccffcc" stroke="#1d2943" stroke-width="1"/>
              <text x="200" y="64" text-anchor="middle" font-size="6">數位</text>
            </svg>`
          }
        ],
        keyFormulas: [
          '單點接地：f < 1MHz',
          '多點接地：f > 10MHz',
          '接地阻抗 Z = R + jωL',
          '地迴路面積 ∝ EMI'
        ],
        designNotes: [
          '低頻電路使用單點接地',
          '高頻電路使用多點接地',
          '類比/數位電路分區接地',
          '單點接地點選在電源入口',
          '保持完整的接地平面'
        ],
        commonMistakes: [
          '地迴路導致 EMI',
          '接地平面不完整',
          '類比/數位地未分離',
          '接地路徑過長',
          '未考慮高頻接地特性'
        ],
        examples: [
          {
            title: '混合訊號接地',
            application: 'ADC 電路接地',
            circuit: '類比分區 + 數位分區 + 單點連接'
          }
        ],
        relatedTopics: ['pcb', 'emi', 'analog'],
        sourcePdf: null,
        createdAt: '2026-06-12T10:00:00Z',
        updatedAt: '2026-06-12T10:00:00Z'
      },
      {
        id: 'differential-pair',
        title: '差分對走線設計',
        category: 'high-speed',
        description: '差分訊號的走線規則與阻抗控制。',
        principles: '差分對利用兩條訊號的差值傳輸資料，具有良好的抗共模噪聲能力。設計要點：阻抗匹配、等長匹配、緊耦合、對稱走線。',
        circuits: [
          {
            type: 'diff-pair',
            description: '差分對走線',
            svg: `<svg viewBox="0 0 220 60" width="220" height="60">
              <rect x="10" y="15" width="35" height="30" fill="white" stroke="#1d2943" stroke-width="1.5"/>
              <text x="27" y="34" text-anchor="middle" font-size="7">TX</text>
              <line x1="45" y1="25" x2="180" y2="25" stroke="#1d2943" stroke-width="2"/>
              <line x1="45" y1="35" x2="180" y2="35" stroke="#1d2943" stroke-width="2"/>
              <text x="112" y="20" text-anchor="middle" font-size="6">D+</text>
              <text x="112" y="45" text-anchor="middle" font-size="6">D-</text>
              <rect x="180" y="15" width="35" height="30" fill="white" stroke="#1d2943" stroke-width="1.5"/>
              <text x="197" y="34" text-anchor="middle" font-size="7">RX</text>
              <text x="112" y="55" text-anchor="middle" font-size="6">間距 s（緊耦合）</text>
            </svg>`
          }
        ],
        keyFormulas: [
          'Zdiff = 2 × Z0 × (1 - 0.48 × exp(-0.96×s/h))',
          'Skew < 5mil（組內）',
          '間距 s < 2× 介質厚度 h',
          '差分阻抗：USB 90Ω, PCIe 85Ω'
        ],
        designNotes: [
          '差分對等長匹配（Skew < 5mil）',
          '保持固定間距（緊耦合）',
          '避免在差分對之間插入其他走線',
          '轉角使用 45° 或圓弧',
          '跨越分割平面時加回流電容'
        ],
        commonMistakes: [
          '差分對 Skew 過大',
          '間距不一致',
          '差分對之間插入其他走線',
          '未考慮返回路徑',
          '阻抗不匹配'
        ],
        examples: [
          {
            title: 'USB 3.0 差分對',
            application: 'USB 3.0 SuperSpeed',
            circuit: '差分阻抗 90Ω，Skew < 5mil'
          }
        ],
        relatedTopics: ['impedance', 'usb', 'signal-integrity'],
        sourcePdf: null,
        createdAt: '2026-06-12T10:00:00Z',
        updatedAt: '2026-06-12T10:00:00Z'
      },
      {
        id: 'automotive-transient',
        title: '車用電源瞬態保護',
        category: 'automotive',
        description: '汽車電源線的瞬態特性與保護設計。',
        principles: '汽車電源線存在多種瞬態：冷啟動（6V）、負載突降（40-100V）、拋負載等。需要使用 TVS、穩壓二極體等進行保護。',
        circuits: [
          {
            type: 'automotive-tvs',
            description: '車用 TVS 保護電路',
            svg: `<svg viewBox="0 0 220 70" width="220" height="70">
              <line x1="10" y1="30" x2="40" y2="30" stroke="#1d2943" stroke-width="2"/>
              <text x="10" y="22" font-size="7">VBAT</text>
              <text x="10" y="40" font-size="6">9-16V</text>
              <rect x="40" y="18" width="30" height="24" fill="white" stroke="#1d2943" stroke-width="1.5"/>
              <text x="55" y="34" text-anchor="middle" font-size="7">TVS</text>
              <line x1="55" y1="42" x2="55" y2="52" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="47" y1="52" x2="63" y2="52" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="49" y1="55" x2="61" y2="55" stroke="#1d2943" stroke-width="1"/>
              <line x1="70" y1="30" x2="110" y2="30" stroke="#1d2943" stroke-width="2"/>
              <rect x="110" y="18" width="30" height="24" fill="white" stroke="#1d2943" stroke-width="1.5"/>
              <text x="125" y="34" text-anchor="middle" font-size="7">DC-DC</text>
              <line x1="140" y1="30" x2="190" y2="30" stroke="#1d2943" stroke-width="2"/>
              <rect x="190" y="18" width="25" height="24" fill="white" stroke="#1d2943" stroke-width="1.5"/>
              <text x="202" y="34" text-anchor="middle" font-size="7">Load</text>
              <text x="110" y="60" text-anchor="middle" font-size="6">ISO 7637-2 瞬態測試</text>
            </svg>`
          }
        ],
        keyFormulas: [
          '負載突降：40-100V, 100-400ms',
          '冷啟動：6V, 10s',
          'TVS 額定功率 > 瞬態能量',
          'V_br > 最大工作電壓'
        ],
        designNotes: [
          'TVS 選擇需覆蓋所有瞬態類型',
          '注意 TVS 的功率額定值',
          'DC-DC 輸入需加 LC 濾波',
          '考慮冷啟動時的低輸入電壓',
          '接地路徑要短且寬'
        ],
        commonMistakes: [
          'TVS 功率額定值不足',
          '未考慮所有瞬態類型',
          '接地路徑過長',
          '未考慮冷啟動低壓',
          '濾波不足導致 EMI'
        ],
        examples: [
          {
            title: '12V 汽車電源',
            application: '車載電子設備',
            circuit: 'TVS + 共模扼流圈 + DC-DC'
          }
        ],
        relatedTopics: ['automotive', 'protection', 'emi'],
        sourcePdf: null,
        createdAt: '2026-06-12T10:00:00Z',
        updatedAt: '2026-06-12T10:00:00Z'
      },
      {
        id: 'led-driver',
        title: 'LED 驅動電路設計',
        category: 'power-management',
        description: 'LED 驅動的恆流/恆壓設計與效率優化。',
        principles: 'LED 需要恆流驅動以確保亮度一致和壽命。驅動方式包括：電阻限流（簡單但效率低）、線性恆流（中等）、開關恆流（高效率）。',
        circuits: [
          {
            type: 'led-cc',
            description: '恆流 LED 驅動',
            svg: `<svg viewBox="0 0 200 70" width="200" height="70">
              <line x1="10" y1="30" x2="30" y2="30" stroke="#1d2943" stroke-width="2"/>
              <text x="10" y="22" font-size="8">Vin</text>
              <rect x="30" y="18" width="40" height="24" fill="white" stroke="#1d2943" stroke-width="1.5"/>
              <text x="50" y="34" text-anchor="middle" font-size="7">CC Driver</text>
              <line x1="70" y1="30" x2="100" y2="30" stroke="#1d2943" stroke-width="2"/>
              <polygon points="95,22 105,22 100,15" fill="none" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="100" y1="30" x2="100" y2="38" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="92" y1="38" x2="108" y2="38" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="94" y1="41" x2="106" y2="41" stroke="#1d2943" stroke-width="1"/>
              <text x="100" y="48" text-anchor="middle" font-size="6">LED</text>
              <line x1="100" y1="41" x2="100" y2="50" stroke="#1d2943" stroke-width="1.5"/>
              <rect x="100" y="50" width="30" height="10" fill="white" stroke="#1d2943" stroke-width="1"/>
              <text x="115" y="58" text-anchor="middle" font-size="5">Rs</text>
              <line x1="115" y1="60" x2="115" y2="65" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="107" y1="65" x2="123" y2="65" stroke="#1d2943" stroke-width="1.5"/>
              <line x1="109" y1="68" x2="121" y2="68" stroke="#1d2943" stroke-width="1"/>
              <text x="140" y="35" font-size="6">Iled = Vref / Rs</text>
            </svg>`
          }
        ],
        keyFormulas: [
          'Iled = (Vin - Vled) / Rs（電阻限流）',
          'Iled = Vref / Rs（恆流驅動）',
          'Pled = Vled × Iled',
          '效率 η = Pled / Pin'
        ],
        designNotes: [
          '恆流驅動確保亮度一致',
          '選擇適合的 Vref（低壓降提高效率）',
          'Rs 選擇低溫漂電阻',
          '注意 LED 的正向電壓範圍',
          '大功率 LED 需要散熱設計'
        ],
        commonMistakes: [
          '使用電阻限流導致亮度不一致',
          'Rs 溫漂導致電流變化',
          '未考慮 LED 正向電壓變化',
          '散熱不足導致 LED 壽命縮短',
          '驅動電路效率過低'
        ],
        examples: [
          {
            title: '3W LED 驅動',
            application: '照明應用',
            circuit: 'LM3404 恆流驅動 + 電感'
          }
        ],
        relatedTopics: ['power-supply', 'buck', 'automotive'],
        sourcePdf: null,
        createdAt: '2026-06-12T10:00:00Z',
        updatedAt: '2026-06-12T10:00:00Z'
      },
      {
        id: 'battery-charger',
        title: '電池充電電路設計',
        category: 'power-management',
        description: '鋰電池充電管理電路與充電IC選型。',
        principles: '鋰電池充電需遵循 CC-CV（恆流-恆壓）曲線：先以恆流充電至4.2V，再以恆壓充電至電流降至0.05C。充電IC需具備過充、過放、過流保護。',
        circuits: [
          {
            type: 'cc-cv',
            description: 'CC-CV 充電曲線',
            svg: `<svg viewBox="0 0 200 80" width="200" height="80">
              <line x1="20" y1="70" x2="180" y2="70" stroke="#1d2943" stroke-width="1.5"/>
              <text x="100" y="78" text-anchor="middle" font-size="7">時間</text>
              <line x1="20" y1="70" x2="20" y2="10" stroke="#1d2943" stroke-width="1.5"/>
              <text x="10" y="40" text-anchor="middle" font-size="7" transform="rotate(-90,10,40)">電壓/電流</text>
              <line x1="20" y1="20" x2="80" y2="20" stroke="#e74c3c" stroke-width="2"/>
              <line x1="80" y1="20" x2="150" y2="20" stroke="#e74c3c" stroke-width="2" stroke-dasharray="4"/>
              <text x="50" y="15" font-size="6" fill="#e74c3c">Vbat (4.2V)</text>
              <line x1="20" y1="50" x2="80" y2="30" stroke="#3498db" stroke-width="2"/>
              <line x1="80" y1="30" x2="150" y2="65" stroke="#3498db" stroke-width="2"/>
              <text x="50" y="45" font-size="6" fill="#3498db">Icharge</text>
              <text x="40" y="60" font-size="6">CC 階段</text>
              <text x="110" y="45" font-size="6">CV 階段</text>
            </svg>`
          }
        ],
        keyFormulas: [
          'CC 階段：I = 恆定（0.5C~1C）',
          'CV 階段：V = 4.2V（±50mV）',
          '充電時間 ≈ 2~3 小時',
          '截止電流 = 0.05C'
        ],
        designNotes: [
          '選擇帶 CC-CV 的充電 IC',
          '充電電流選擇（0.5C~1C）',
          '電池保護電路（過充/過放/過流）',
          '溫度監控（充電時禁止低溫）',
          '充電指示 LED 設計'
        ],
        commonMistakes: [
          '充電電流過大導致電池壽命縮短',
          'CV 電壓不精準導致過充',
          '未加溫度保護',
          '未加電池反接保護',
          '充電 IC 散熱不足'
        ],
        examples: [
          {
            title: '18650 充電',
            application: '單節鋰電池充電',
            circuit: 'TP4056 + DW01 保護'
          }
        ],
        relatedTopics: ['power-supply', 'protection', 'embedded'],
        sourcePdf: null,
        createdAt: '2026-06-12T10:00:00Z',
        updatedAt: '2026-06-12T10:00:00Z'
      },
      {
        id: 'opamp-configurations',
        title: '運放九種基本組態',
        category: 'analog',
        description: '運算放大器的九種基本電路組態與應用。',
        principles: '基於虛短虛斷原則，運放可實現：反相放大、同相放大、差分放大、積分器、微分器、電壓隨耦器、電流-電壓轉換、比較器、儀器放大器。',
        circuits: [
          {
            type: 'configs-table',
            description: '九種組態比較',
            svg: `<svg viewBox="0 0 250 100" width="250" height="100">
              <rect x="5" y="5" width="75" height="20" fill="#e8f4f8" stroke="#1d2943" stroke-width="1"/>
              <text x="42" y="18" text-anchor="middle" font-size="6">反相放大</text>
              <rect x="85" y="5" width="75" height="20" fill="#e8f4f8" stroke="#1d2943" stroke-width="1"/>
              <text x="122" y="18" text-anchor="middle" font-size="6">同相放大</text>
              <rect x="165" y="5" width="75" height="20" fill="#e8f4f8" stroke="#1d2943" stroke-width="1"/>
              <text x="202" y="18" text-anchor="middle" font-size="6">差分放大</text>
              <rect x="5" y="30" width="75" height="20" fill="#d4edda" stroke="#1d2943" stroke-width="1"/>
              <text x="42" y="43" text-anchor="middle" font-size="6">積分器</text>
              <rect x="85" y="30" width="75" height="20" fill="#d4edda" stroke="#1d2943" stroke-width="1"/>
              <text x="122" y="43" text-anchor="middle" font-size="6">微分器</text>
              <rect x="165" y="30" width="75" height="20" fill="#d4edda" stroke="#1d2943" stroke-width="1"/>
              <text x="202" y="43" text-anchor="middle" font-size="6">電壓隨耦器</text>
              <rect x="5" y="55" width="75" height="20" fill="#fff3cd" stroke="#1d2943" stroke-width="1"/>
              <text x="42" y="68" text-anchor="middle" font-size="6">I-V 轉換</text>
              <rect x="85" y="55" width="75" height="20" fill="#fff3cd" stroke="#1d2943" stroke-width="1"/>
              <text x="122" y="68" text-anchor="middle" font-size="6">比較器</text>
              <rect x="165" y="55" width="75" height="20" fill="#fff3cd" stroke="#1d2943" stroke-width="1"/>
              <text x="202" y="68" text-anchor="middle" font-size="6">儀器放大器</text>
            </svg>`
          }
        ],
        keyFormulas: [
          '反相：Av = -Rf/Rin',
          '同相：Av = 1 + Rf/Rin',
          '差分：Vout = (Rf/R1)(V2-V1)',
          '積分：Vout = -1/(RC)∫Vin dt',
          '微分：Vout = -RC × dVin/dt'
        ],
        designNotes: [
          '同相端補償電阻 Rb = Rin ∥ Rf（平衡偏置電流）',
          '單電源需建 VCC/2 虛擬地',
          '積分器需加限幅防止飽和',
          '微分器需加限頻防止振盪',
          '去耦電容 0.1µF 靠近電源腳'
        ],
        commonMistakes: [
          '未加補償電阻導致 DC 偏置',
          '積分器未限幅導致飽和',
          '微分器振盪',
          'GBW 不足導致帶寬不夠',
          'SR 不足導致大訊號失真'
        ],
        examples: [
          {
            title: '光電流轉換',
            application: '光二極體訊號調理',
            circuit: '跨阻放大器（I-V 轉換）'
          }
        ],
        relatedTopics: ['analog', 'adc', 'filter'],
        sourcePdf: null,
        createdAt: '2026-06-12T10:00:00Z',
        updatedAt: '2026-06-12T10:00:00Z'
      },
      {
        id: 'current-sensing',
        title: '電流偵測電路',
        category: 'analog',
        description: '電流偵測的方法：分流電阻、霍爾感測器、變壓器。',
        principles: '電流偵測方法包括：分流電阻（低側/高側）、霍爾感測器（隔離）、電流互感器（AC）。選擇取決於精度、成本、隔離需求。',
        circuits: [
          {
            type: 'low-side',
            description: '低側電流偵測',
            svg: `<svg viewBox="0 0 200 60" width="200" height="60">
              <line x1="10" y1="25" x2="40" y2="25" stroke="#1d2943" stroke-width="2"/>
              <rect x="40" y="15" width="40" height="20" fill="white" stroke="#1d2943" stroke-width="1.5"/>
              <text x="60" y="29" text-anchor="middle" font-size="7">Load</text>
              <line x1="80" y1="25" x2="100" y2="25" stroke="#1d2943" stroke-width="2"/>
              <rect x="100" y="15" width="30" height="20" fill="white" stroke="#1d2943" stroke-width="1.5"/>
              <text x="115" y="29" text-anchor="middle" font-size="7">Rs</text>
              <text x="115" y="12" text-anchor="middle" font-size="5">10mΩ</text>
              <line x1="130" y1="25" x2="160" y2="25" stroke="#1d2943" stroke-width="2"/>
              <text x="165" y="22" font-size="7">GND</text>
              <line x1="115" y1="35" x2="115" y2="45" stroke="#1d2943" stroke-width="1.5"/>
              <rect x="115" y="45" width="30" height="10" fill="white" stroke="#1d2943" stroke-width="1"/>
              <text x="130" y="53" text-anchor="middle" font-size="5">Amp</text>
              <text x="115" y="58" font-size="5">V = I × Rs</text>
            </svg>`
          }
        ],
        keyFormulas: [
          'V = I × Rs',
          '功率損耗 P = I² × Rs',
          '低側：接地端偵測',
          '高側：電源端偵測'
        ],
        designNotes: [
          'Rs 選擇：精度、功率、溫漂',
          '低側偵測：簡單但抬高 GND',
          '高側偵測：需專用 IC',
          '四線偵測（Kelvin）減少誤差',
          '差分放大器讀取 Rs 電壓'
        ],
        commonMistakes: [
          'Rs 功率額定值不足',
          'Rs 溫漂導致精度下降',
          '低側偵測抬高 GND',
          '走線引入額外阻抗',
          '放大器偏置電壓影響精度'
        ],
        examples: [
          {
            title: 'Buck 電流限制',
            application: 'DC-DC 轉換器過流保護',
            circuit: '低側 Rs + 差分放大器'
          }
        ],
        relatedTopics: ['analog', 'power-supply', 'protection'],
        sourcePdf: null,
        createdAt: '2026-06-12T10:00:00Z',
        updatedAt: '2026-06-12T10:00:00Z'
      },
      {
        id: 'flyback-converter',
        title: 'Flyback 返馳式隔離轉換器',
        category: 'power-management',
        description: '一二次側隔離的切換式電源，常用於 AC-DC 與隔離 DC-DC。',
        principles: '開關導通時能量存於變壓器一次側電感；關斷時能量經二次側二極體釋放到輸出。一二次匝比決定電壓比，提供電氣隔離。',
        circuits: [{ type: 'isolated', description: 'Flyback 隔離轉換器', svg: CircuitSVG.flyback() }],
        keyFormulas: ['Vout = Vin × (Ns/Np) × D/(1-D)', '需考慮漏感造成的電壓尖峰', '匝比 n = Np/Ns'],
        designNotes: ['一次側需 RCD 箝位吸收漏感能量', '注意變壓器飽和與磁滯損耗', '光耦 + TL431 做隔離回授', 'Y 電容跨接一二次地降低共模噪聲'],
        commonMistakes: ['漏感箝位不足燒毀開關', '變壓器設計未留磁通裕度', '輸出二極體耐壓不足'],
        examples: [{ title: '12V 隔離電源', application: '工業 AC-DC', circuit: '使用 UC3842 控制的 Flyback' }],
        relatedTopics: ['buck', 'transformer', 'optocoupler'], sourcePdf: 'hardware-pdfs (BUCK-BOOST/隔離)', createdAt: '2026-06-13T10:00:00Z', updatedAt: '2026-06-13T10:00:00Z'
      },
      {
        id: 'half-bridge',
        title: '半橋 (Half-Bridge) 拓樸',
        category: 'power-management',
        description: '高側 + 低側 MOSFET 串接，中點為開關節點，用於 DC-DC、馬達、逆變。',
        principles: '高低側 MOSFET 互補導通（含死區時間），中點電壓在 V+ 與地之間切換。高側需自舉或隔離驅動。',
        circuits: [{ type: 'topology', description: '半橋（高/低側 NMOS）', svg: CircuitSVG.halfBridge() }],
        keyFormulas: ['Vsw 平均 = V+ × D', '死區時間 tdead 防直通', '自舉電壓 ≈ V+ − Vf'],
        designNotes: ['務必加死區時間避免上下臂直通', '高側用自舉電容或隔離電源', 'SW 節點走線短、減少振鈴', '考慮 body diode 反向恢復損耗'],
        commonMistakes: ['死區不足導致直通燒管', '自舉電容容量不足高側驅動失效', '閘極電阻過小造成振鈴'],
        examples: [{ title: '同步 Buck', application: 'DC-DC', circuit: '半橋 + 電感輸出' }],
        relatedTopics: ['gate-driver', 'mosfet', 'buck'], sourcePdf: 'hardware-pdfs (half-bridge)', createdAt: '2026-06-13T10:00:00Z', updatedAt: '2026-06-13T10:00:00Z'
      },
      {
        id: 'gate-driver',
        title: '閘極驅動與自舉電路',
        category: 'transistor',
        description: '提供足夠電流快速開關功率 MOSFET/IGBT，高側採自舉供電。',
        principles: '閘極電容需大電流充放電才能快速切換。高側 MOSFET 源極浮動，靠自舉電容在低側導通時充電供電。',
        circuits: [{ type: 'driver', description: '閘極驅動 IC + 自舉電容', svg: CircuitSVG.gateDriver() }],
        keyFormulas: ['Qg 總閘極電荷決定驅動電流', 'tsw ≈ Qg / Idrive', 'Cboot ≥ 10 × Qg/ΔV'],
        designNotes: ['自舉二極體選快恢復、耐壓足', '閘極電阻調開關速度與 EMI', '驅動 IC 靠近 MOSFET 放置'],
        commonMistakes: ['自舉電容太小高側掉電', '無米勒箝位導致誤導通'],
        examples: [{ title: '半橋驅動', application: '馬達/DC-DC', circuit: 'IR2110 自舉驅動' }],
        relatedTopics: ['half-bridge', 'mosfet'], sourcePdf: 'hardware-pdfs (gate driver)', createdAt: '2026-06-13T10:00:00Z', updatedAt: '2026-06-13T10:00:00Z'
      },
      {
        id: 'comparator-hysteresis',
        title: '遲滯比較器 (Schmitt)',
        category: 'analog',
        description: '加正回授形成遲滯，抗噪聲、避免輸出抖動。',
        principles: '比較器輸出經電阻正回授到同相端，使切換門檻分上下兩個值（VTH、VTL），輸入噪聲在遲滯帶內不會造成輸出翻轉。',
        circuits: [{ type: 'analog', description: '遲滯比較器（正回授）', svg: CircuitSVG.comparator() }],
        keyFormulas: ['VH = VTH − VTL', 'VTH/VTL 由 Rf 與 R1 分壓決定'],
        designNotes: ['遲滯量需大於噪聲振幅', '開漏輸出需加上拉', '高速應用注意傳播延遲'],
        commonMistakes: ['誤用運放當比較器導致振盪', '遲滯不足輸出抖動'],
        examples: [{ title: '電壓監測', application: 'UVLO', circuit: 'LM393 遲滯比較' }],
        relatedTopics: ['op-amp', 'voltage-reference'], sourcePdf: 'hardware-pdfs (comparator)', createdAt: '2026-06-13T10:00:00Z', updatedAt: '2026-06-13T10:00:00Z'
      },
      {
        id: 'comparator-vs-opamp',
        title: '比較器 vs 運放 (OP) 差異',
        category: 'analog',
        description: '比較器與運放外形像、用途不同：比較器是開迴路數位輸出、運放是閉迴路線性。誤用會振盪或變慢。',
        principles: '比較器(comparator)專為「開迴路比較兩電壓→輸出數位高/低」設計：輸出級為開漏或推挽軌對軌、無相位補償、速度快、常內建遲滯。運放(op-amp)為「閉迴路線性放大」設計：有相位補償保證負回授穩定，開迴路當比較器用時轉態慢、可能振盪、輸出非數位準位。比較器不可接負回授(會在線性區震盪)；運放不可無回授當比較器。',
        circuits: [{ type: 'concept', description: '比較器(開迴路) vs 運放(閉迴路) 對比', svg: CircuitSVG.comparatorVsOpamp() }],
        keyFormulas: ['比較器：Vout = (V+ > V−) ? VOH : VOL', '運放(負回授)：Vout = A(V+ − V−)，虛短 V+≈V−', '遲滯：VH = VTH − VTL'],
        designNotes: ['比較器開漏輸出要加上拉到邏輯電壓', '比較器加正回授(遲滯)抗噪，勿加負回授', '運放需負回授+補償，別無回授當比較器', '注意比較器傳播延遲、運放 GBW/SR', '輸出要接邏輯時選比較器(準位明確)'],
        commonMistakes: ['用運放當比較器→慢/振盪/準位不明', '比較器接負回授→線性區震盪', '比較器忘了上拉(開漏浮接)', '混淆兩者輸出特性'],
        examples: [{ title: '過壓偵測', application: '門檻判斷→數位旗標', circuit: '比較器 + 遲滯 + 上拉' }],
        relatedTopics: ['comparator-hysteresis', 'op-amp-basics', 'opamp-configurations'], sourcePdf: '使用者需求 (comparator vs op-amp)', createdAt: '2026-06-17T10:00:00Z', updatedAt: '2026-06-17T10:00:00Z'
      },
      {
        id: 'tl431-reference',
        title: 'TL431 可調分流基準',
        category: 'power-management',
        description: '可程式並聯穩壓/基準，常用於電源回授與監測。',
        principles: '內部 2.5V 基準，REF 腳電壓達 2.5V 時陰極開始導通分流。外部分壓設定調節點電壓。',
        circuits: [{ type: 'reference', description: 'TL431 分流基準', svg: CircuitSVG.tl431() }],
        keyFormulas: ['Vka = 2.5 × (1 + R1/R2)', 'Ika 需 > 1mA 以維持調節'],
        designNotes: ['限流電阻確保最小工作電流', '回授常配光耦做隔離', '注意電容負載穩定性'],
        commonMistakes: ['工作電流不足無法穩壓', '相位補償不當振盪'],
        examples: [{ title: '隔離電源回授', application: 'Flyback', circuit: 'TL431 + 光耦' }],
        relatedTopics: ['flyback', 'optocoupler', 'ldo'], sourcePdf: 'hardware-pdfs (voltage reference)', createdAt: '2026-06-13T10:00:00Z', updatedAt: '2026-06-13T10:00:00Z'
      },
      {
        id: 'rc-lowpass-filter',
        title: 'RC 低通濾波器',
        category: 'signal-processing',
        description: '最基本的一階低通，用於去噪、抗混疊、緩啟動。',
        principles: '電阻與電容串並聯，高頻被電容旁路衰減，截止頻率 fc = 1/(2πRC)，每十倍頻衰減 20dB。',
        circuits: [{ type: 'filter', description: '一階 RC 低通', svg: CircuitSVG.rcLowpass() }],
        keyFormulas: ['fc = 1/(2πRC)', '−3dB @ fc', '相移 45° @ fc'],
        designNotes: ['ADC 前置抗混疊濾波', 'R 太大受輸入阻抗影響', '考慮電容介質吸收'],
        commonMistakes: ['截止頻率設計錯誤', '源/負載阻抗未納入計算'],
        examples: [{ title: 'ADC 抗混疊', application: '量測', circuit: 'RC 前置濾波' }],
        relatedTopics: ['adc', 'emi-filter'], sourcePdf: 'hardware-pdfs (RC filter)', createdAt: '2026-06-13T10:00:00Z', updatedAt: '2026-06-13T10:00:00Z'
      },
      {
        id: 'crystal-oscillator',
        title: '晶體振盪電路 (Pierce)',
        category: 'signal-processing',
        description: 'MCU/MPU 的時脈來源，晶體 + 兩負載電容。',
        principles: 'Pierce 架構利用反相放大器與晶體形成正回授振盪，兩負載電容決定振盪頻率精度。',
        circuits: [{ type: 'oscillator', description: '皮爾斯晶體振盪', svg: CircuitSVG.crystalOsc() }],
        keyFormulas: ['CL = (C1×C2)/(C1+C2) + Cstray', 'f 由晶體與 CL 決定'],
        designNotes: ['負載電容匹配晶體規格', '走線短、加地保護環', '避免相鄰高速訊號干擾'],
        commonMistakes: ['負載電容值錯誤頻率偏移', '佈線過長無法起振'],
        examples: [{ title: 'MCU 主時脈', application: '嵌入式', circuit: '8MHz 晶體 + 2×18pF' }],
        relatedTopics: ['emi', 'pcb-layout'], sourcePdf: 'hardware-pdfs (oscillator)', createdAt: '2026-06-13T10:00:00Z', updatedAt: '2026-06-13T10:00:00Z'
      },
      {
        id: 'ntc-thermistor',
        title: 'NTC 熱敏電阻溫度量測',
        category: 'measurement',
        description: '用 NTC 分壓接 ADC，量測溫度。',
        principles: 'NTC 阻值隨溫度上升而下降，與固定上拉電阻分壓，ADC 讀取分壓電壓再查表/Steinhart 方程換算溫度。',
        circuits: [{ type: 'sensor', description: 'NTC 分壓量溫', svg: CircuitSVG.ntcThermistor() }],
        keyFormulas: ['1/T = A + B·ln(R) + C·ln(R)³', 'Vadc = Vcc × Rntc/(Rpu+Rntc)'],
        designNotes: ['選上拉值使目標溫區解析度最佳', '自熱效應降低量測電流', '加 RC 濾波抗噪'],
        commonMistakes: ['自熱造成讀值偏高', '線性化未做誤差大'],
        examples: [{ title: '電池溫度監測', application: '充電保護', circuit: '10k NTC + 10k 上拉' }],
        relatedTopics: ['adc', 'rc-filter'], sourcePdf: 'hardware-pdfs (thermistor/NTC)', createdAt: '2026-06-13T10:00:00Z', updatedAt: '2026-06-13T10:00:00Z'
      },
      {
        id: 'hot-swap',
        title: '熱插拔 / 浪湧限流',
        category: 'protection',
        description: '帶電插拔時限制浪湧電流，保護連接器與電源。',
        principles: '串聯 MOSFET 由熱插拔控制器以分流電阻偵測電流，控制閘極緩慢開啟限制 dI/dt 與 inrush，並提供過流保護。',
        circuits: [{ type: 'protection', description: '熱插拔控制 + 串聯 MOSFET', svg: CircuitSVG.hotSwap() }],
        keyFormulas: ['Ilimit = Vsense_th / Rsense', 'SOA 需涵蓋啟動時 V×I', 'dV/dt 由閘極電容設定'],
        designNotes: ['MOSFET 須落在安全工作區 (SOA)', '緩啟動電容設定 inrush 斜率', '加去耦電容於負載端'],
        commonMistakes: ['MOSFET 超出 SOA 燒毀', 'inrush 過大觸發上游保護'],
        examples: [{ title: '伺服器板卡', application: '帶電插拔', circuit: 'LTC4215 熱插拔' }],
        relatedTopics: ['inrush', 'load-switch', 'mosfet'], sourcePdf: 'hardware-pdfs (hot-swap/inrush)', createdAt: '2026-06-13T10:00:00Z', updatedAt: '2026-06-13T10:00:00Z'
      },
      {
        id: 'optocoupler-feedback',
        title: '光耦隔離回授',
        category: 'power-management',
        description: '跨越隔離障壁傳遞回授/訊號，維持一二次側電氣隔離。',
        principles: '一次側 LED 發光驅動二次側光電晶體，以光傳遞訊號，達成電氣隔離。常配 TL431 做隔離電源回授。',
        circuits: [{ type: 'isolation', description: '光耦隔離回授', svg: CircuitSVG.optocoupler() }],
        keyFormulas: ['CTR = Ic/If (電流傳輸比)', 'If 由限流電阻設定'],
        designNotes: ['考慮 CTR 隨溫度/老化衰退', '隔離爬電距離符合安規', '頻寬有限不適合高速'],
        commonMistakes: ['CTR 餘量不足回授失效', '一二次地未正確分離'],
        examples: [{ title: '隔離電源回授', application: 'Flyback', circuit: 'PC817 + TL431' }],
        relatedTopics: ['flyback', 'tl431'], sourcePdf: 'hardware-pdfs (optocoupler)', createdAt: '2026-06-13T10:00:00Z', updatedAt: '2026-06-13T10:00:00Z'
      },
      {
        id: 'oring-power',
        title: 'ORing 雙電源切換 / 理想二極體',
        category: 'power-management',
        description: '兩路電源並接自動取較高者，理想二極體降低壓降。',
        principles: '二極體 OR 接讓較高電壓供電、阻止回灌；理想二極體用 MOSFET + 控制器取代蕭特基，大幅降低導通壓降與損耗。',
        circuits: [{ type: 'power', description: 'ORing 雙電源', svg: CircuitSVG.oring() }],
        keyFormulas: ['Ploss = I² × Rds_on (理想二極體)', '蕭特基壓降 ≈ 0.3~0.5V'],
        designNotes: ['理想二極體控制器防回灌', '注意切換瞬間電壓跌落', '大電流用低 Rds_on MOSFET'],
        commonMistakes: ['二極體壓降造成發熱', '無回灌保護損壞電源'],
        examples: [{ title: '雙電源備援', application: '伺服器', circuit: 'LM5050 理想二極體' }],
        relatedTopics: ['load-switch', 'hot-swap'], sourcePdf: 'hardware-pdfs (ORing/ideal diode)', createdAt: '2026-06-13T10:00:00Z', updatedAt: '2026-06-13T10:00:00Z'
      },
      {
        id: 'charge-pump',
        title: '電荷泵 (Charge Pump)',
        category: 'power-management',
        description: '用電容與開關泵升或反相電壓，無電感的小功率電源。',
        principles: '時脈交替切換飛跨電容，將電荷搬移到輸出電容，可做倍壓、反相或分壓。適合小電流負載。',
        circuits: [{ type: 'converter', description: 'Dickson 倍壓電荷泵', svg: CircuitSVG.chargePump() }],
        keyFormulas: ['Vout ≈ N × Vin (理想)', 'Rout ≈ 1/(f×Cfly)', '輸出阻抗隨頻率下降'],
        designNotes: ['飛跨電容值與頻率決定輸出電流', '低 ESR 電容降低漣波', '僅適合輕載'],
        commonMistakes: ['負載過重電壓崩潰', '電容選太小漣波大'],
        examples: [{ title: 'LCD 偏壓', application: '顯示器', circuit: '倍壓電荷泵' }],
        relatedTopics: ['boost', 'ldo'], sourcePdf: 'hardware-pdfs (charge pump)', createdAt: '2026-06-13T10:00:00Z', updatedAt: '2026-06-13T10:00:00Z'
      },
      {
        id: 'bridge-rectifier',
        title: '全橋整流 + 濾波',
        category: 'power-management',
        description: 'AC 轉 DC 的基礎：四二極體整流橋 + 平滑電容。',
        principles: '四顆二極體在交流正負半週都導通，輸出單向脈動 DC，再以大電容平滑成近似直流。',
        circuits: [{ type: 'rectifier', description: '全橋整流', svg: CircuitSVG.bridgeRectifier() }],
        keyFormulas: ['Vdc ≈ Vpk − 2×Vf', '紋波 ΔV ≈ Iload/(f×C)', 'f = 2×fline (全波)'],
        designNotes: ['二極體耐壓 > Vpk', '電容耐壓與紋波電流足夠', '注意湧入電流加 NTC/限流'],
        commonMistakes: ['電容耐壓不足爆裂', '無限流啟動湧入過大'],
        examples: [{ title: 'AC-DC 前級', application: '電源供應器', circuit: '橋式整流 + 470µF' }],
        relatedTopics: ['flyback', 'inrush'], sourcePdf: 'hardware-pdfs (bridge rectifier)', createdAt: '2026-06-13T10:00:00Z', updatedAt: '2026-06-13T10:00:00Z'
      },
      {
        id: 'h-bridge-motor',
        title: 'H 橋馬達驅動',
        category: 'transistor',
        description: '四顆 MOSFET 控制直流馬達正反轉與調速。',
        principles: '對角 MOSFET 成對導通決定馬達電流方向（正反轉），PWM 調工作週期控制轉速。需死區避免直通。',
        circuits: [{ type: 'driver', description: 'H 橋（4× NMOS + 馬達）', svg: CircuitSVG.hBridge() }],
        keyFormulas: ['Vmotor = V+ × (D正 − D反)', '需死區時間防直通'],
        designNotes: ['加飛輪/body diode 續流', '電流取樣保護堵轉', 'PWM 頻率避開可聞噪聲'],
        commonMistakes: ['上下臂直通燒管', '無續流路徑反電動勢損壞'],
        examples: [{ title: '直流馬達調速', application: '機器人', circuit: 'DRV8871 H 橋' }],
        relatedTopics: ['half-bridge', 'gate-driver', 'mosfet'], sourcePdf: 'hardware-pdfs (motor driver/H-bridge)', createdAt: '2026-06-13T10:00:00Z', updatedAt: '2026-06-13T10:00:00Z'
      },
      {
        id: 'load-switch',
        title: 'PMOS 負載開關',
        category: 'transistor',
        description: '用 PMOS 高側開關控制子系統電源通斷。',
        principles: 'PMOS 源極接 Vin、汲極接負載，閘極拉低導通。常加閘極上拉與 RC 控制開啟斜率，避免 inrush。',
        circuits: [{ type: 'switch', description: 'P-MOS 高側負載開關', svg: CircuitSVG.loadSwitch() }],
        keyFormulas: ['Vgs(on) = −(Vin − Ven_low)', 'dV/dt 由閘極 RC 決定'],
        designNotes: ['閘極上拉確保預設關閉', '加 RC 緩開降低 inrush', '反向保護避免回灌'],
        commonMistakes: ['無上拉導致誤導通', '開啟太快 inrush 過大'],
        examples: [{ title: '子系統電源閘控', application: '省電', circuit: 'PMOS + EN 控制' }],
        relatedTopics: ['hot-swap', 'oring', 'mosfet'], sourcePdf: 'hardware-pdfs (load switch)', createdAt: '2026-06-13T10:00:00Z', updatedAt: '2026-06-13T10:00:00Z'
      },
      {
        id: 'rc-snubber',
        title: 'RC 緩衝電路 (Snubber)',
        category: 'protection',
        description: '抑制開關節點振鈴與電壓尖峰，降低 EMI。',
        principles: 'RC 串聯跨接在開關或二極體兩端，吸收寄生 LC 振盪能量，阻尼振鈴並限制 dV/dt。',
        circuits: [{ type: 'protection', description: 'RC Snubber', svg: CircuitSVG.rcSnubber() }],
        keyFormulas: ['Rs ≈ √(Lpar/Cpar)', 'Cs ≥ Cpar', 'Ploss = Cs×V²×f'],
        designNotes: ['先量測振鈴頻率再算寄生值', 'Rs 兼顧阻尼與損耗', '電阻功率額定足夠'],
        commonMistakes: ['Cs 過大損耗發熱', '未量測憑感覺選值'],
        examples: [{ title: 'Flyback 一次側', application: '隔離電源', circuit: 'RCD/RC 箝位' }],
        relatedTopics: ['flyback', 'emi', 'half-bridge'], sourcePdf: 'hardware-pdfs (snubber)', createdAt: '2026-06-13T10:00:00Z', updatedAt: '2026-06-13T10:00:00Z'
      },
      {
        id: 'forward-converter',
        title: 'Forward 正激式隔離轉換器',
        category: 'power-management',
        description: '隔離型切換電源，開關導通時能量直接經變壓器傳到二次側。',
        principles: '與 Flyback 不同，Forward 在開關導通時即把能量正向傳遞到二次側，二次側需整流二極體 D1、續流二極體 D2 與輸出電感 L 構成 LC 濾波。需磁復位避免變壓器飽和。',
        circuits: [{ type: 'isolated', description: 'Forward 正激轉換器', svg: CircuitSVG.forwardConverter() }],
        keyFormulas: ['Vout = Vin × (Ns/Np) × D', 'D < 0.5（需磁復位時間）', 'L 維持 CCM'],
        designNotes: ['需第三繞組或 RCD 做磁復位', 'D1 整流 / D2 續流二極體耐流足', '輸出 LC 決定漣波', '比 Flyback 適合較大功率'],
        commonMistakes: ['未磁復位導致變壓器飽和', '占空比超過 0.5', '續流二極體選錯'],
        examples: [{ title: '中功率隔離電源', application: '工業/通訊', circuit: '單端正激 + 磁復位繞組' }],
        relatedTopics: ['flyback', 'half-bridge', 'transformer'], sourcePdf: 'hardware-pdfs (forward converter)', createdAt: '2026-06-13T10:00:00Z', updatedAt: '2026-06-13T10:00:00Z'
      },
      {
        id: 'can-transceiver',
        title: 'CAN 收發器與終端',
        category: 'communication',
        description: '差分 CAN 匯流排介面，兩端各一個 120Ω 終端電阻。',
        principles: 'CAN 以 CANH/CANL 差分傳輸抗噪。匯流排兩端各接 120Ω 終端匹配特性阻抗，避免反射。收發器 TXD/RXD 接 MCU。',
        circuits: [{ type: 'interface', description: 'CAN 節點 + 120Ω 終端', svg: CircuitSVG.canTransceiver() }],
        keyFormulas: ['終端 = 兩端各 120Ω（並聯 60Ω）', '差分電壓：顯性 ~2V / 隱性 ~0V', '速率 ≤ 1Mbps (CAN)'],
        designNotes: ['僅匯流排兩端放終端，中間節點不放', 'CANH/CANL 走差分對等長', '加共模扼流圈抑制 EMI', 'TVS 做匯流排 ESD 保護'],
        commonMistakes: ['每個節點都加終端造成負載過重', '終端漏放導致反射', '差分對不等長'],
        examples: [{ title: '車用 CAN 網路', application: '汽車電子', circuit: 'TJA1050 收發器 + 120Ω' }],
        relatedTopics: ['rs485-transceiver', 'common-mode-choke', 'esd-protection'], sourcePdf: 'hardware-pdfs (CAN)', createdAt: '2026-06-13T10:00:00Z', updatedAt: '2026-06-13T10:00:00Z'
      },
      {
        id: 'rs485-transceiver',
        title: 'RS-485 收發器與終端',
        category: 'communication',
        description: '半雙工差分匯流排，A/B 兩線，兩端 120Ω 終端。',
        principles: 'RS-485 用 A/B 差分線長距離多點通訊。DE/RE 控制收發方向。兩端各 120Ω 終端，並常加偏壓電阻維持空閒電平。',
        circuits: [{ type: 'interface', description: 'RS-485 節點 + 120Ω 終端', svg: CircuitSVG.rs485Transceiver() }],
        keyFormulas: ['終端 = 兩端各 120Ω', '差分門檻 ±200mV', '最多 32 單位負載 (標準)'],
        designNotes: ['半雙工需控制 DE/RE 方向', '偏壓電阻維持空閒顯性', '長線兩端終端、避免反射', 'failsafe 偏壓避免懸空誤觸'],
        commonMistakes: ['方向控制時序錯造成匯流排衝突', '無偏壓懸空誤碼', '終端位置錯誤'],
        examples: [{ title: '工業 Modbus', application: '工控網路', circuit: 'MAX485 + 120Ω + 偏壓' }],
        relatedTopics: ['can-transceiver', 'differential-pair'], sourcePdf: 'hardware-pdfs (RS-485)', createdAt: '2026-06-13T10:00:00Z', updatedAt: '2026-06-13T10:00:00Z'
      },
      {
        id: 'relay-driver',
        title: '繼電器驅動（飛輪二極體）',
        category: 'transistor',
        description: '用 MOSFET/BJT 低端驅動繼電器線圈，並聯飛輪二極體洩放反電動勢。',
        principles: '繼電器線圈為電感，開關關斷瞬間產生高壓反電動勢。並聯飛輪二極體（陰極朝 V+）提供電流續流路徑，保護開關元件。',
        circuits: [{ type: 'driver', description: '低端 MOSFET + 線圈 + 飛輪二極體', svg: CircuitSVG.relayDriver() }],
        keyFormulas: ['反電動勢 V = −L·di/dt', '飛輪二極體耐流 ≥ 線圈電流', '釋放時間隨二極體類型'],
        designNotes: ['飛輪二極體務必反並聯於線圈', '快速釋放可加齊納（耐壓較高）', 'MOSFET/BJT 需足夠電流驅動', '注意接點電弧與壽命'],
        commonMistakes: ['漏接飛輪二極體燒毀開關', '二極體極性接反', '驅動電流不足繼電器不動作'],
        examples: [{ title: 'MCU 控繼電器', application: '家電/工控', circuit: 'NMOS 低端 + 1N4148 飛輪' }],
        relatedTopics: ['mosfet-switching', 'reverse-polarity'], sourcePdf: 'hardware-pdfs (relay/flyback diode)', createdAt: '2026-06-13T10:00:00Z', updatedAt: '2026-06-13T10:00:00Z'
      },
      {
        id: 'wheatstone-bridge',
        title: '惠斯通電橋（感測）',
        category: 'measurement',
        description: '四電阻電橋，量測微小電阻變化（應變、壓力、溫度）。',
        principles: '四電阻組成電橋，激勵電壓加在上下，差動輸出取兩中點。橋平衡時輸出為零；感測元件阻值變化破壞平衡，輸出與變化量成比例，再經儀表放大器放大。',
        circuits: [{ type: 'sensor', description: '惠斯通電橋差動輸出', svg: CircuitSVG.wheatstoneBridge() }],
        keyFormulas: ['平衡：R1/R3 = R2/R4', 'Vo = Vex × (ΔR/R)/4（單臂）', '半橋/全橋提升靈敏度'],
        designNotes: ['用儀表放大器讀差動小訊號', '激勵電壓穩定、考慮自熱', '導線電阻用三/四線補償', '溫漂用對稱配置抵消'],
        commonMistakes: ['共模未抑制誤差大', '激勵不穩定影響讀值', '導線電阻未補償'],
        examples: [{ title: '應變規/秤重', application: '量測', circuit: '全橋應變規 + INA' }],
        relatedTopics: ['current-sensing', 'op-amp-basics', 'ntc-thermistor'], sourcePdf: 'hardware-pdfs (Wheatstone/strain)', createdAt: '2026-06-13T10:00:00Z', updatedAt: '2026-06-13T10:00:00Z'
      },
      {
        id: 'current-mirror',
        title: '電流鏡 (Current Mirror)',
        category: 'analog',
        description: '用一支參考電流複製出等比例電流，類比 IC 的基本構件。',
        principles: 'Q1 二極體接法（基極接集極）設定參考電流；Q2 與 Q1 共用基極—射極電壓，因此複製出相同（或按面積比例）的集極電流。需 Vbe 匹配與良好熱耦合。',
        circuits: [{ type: 'analog', description: 'NPN 電流鏡', svg: CircuitSVG.currentMirror() }],
        keyFormulas: ['I_out = I_ref × (面積比)', 'I_ref = (Vcc − Vbe)/Rref', '受 Early 效應與 Vbe 匹配影響'],
        designNotes: ['Q1、Q2 須匹配並熱耦合', '加射極退化電阻改善匹配', '考慮 Early 效應（輸出阻抗）', 'Wilson/cascode 提升精度'],
        commonMistakes: ['電晶體未匹配導致鏡像誤差', '忽略 Early 效應', '熱梯度造成不對稱'],
        examples: [{ title: '偏置電流源', application: '類比 IC', circuit: '基本兩管電流鏡' }],
        relatedTopics: ['op-amp-basics', 'bjt-switch'], sourcePdf: 'hardware-pdfs (current mirror)', createdAt: '2026-06-13T10:00:00Z', updatedAt: '2026-06-13T10:00:00Z'
      },
      {
        id: 'bjt-switch',
        title: 'NPN 電晶體開關',
        category: 'transistor',
        description: '用 NPN 低端開關驅動負載，基極電阻限流使其飽和導通。',
        principles: '基極經限流電阻注入足夠電流使 BJT 飽和（Vce ≈ 0.2V），集極負載導通。需 Ib > Ic/β 確保飽和。關斷時基極無電流，集極截止。',
        circuits: [{ type: 'switch', description: 'NPN 低端開關', svg: CircuitSVG.bjtSwitch() }],
        keyFormulas: ['Ib ≥ Ic / β（飽和需過驅動）', 'Rb = (Vin − Vbe)/Ib', 'Vce(sat) ≈ 0.2V'],
        designNotes: ['基極電阻確保飽和（過驅動 2~5×）', '感性負載加飛輪二極體', '高速可加基極—射極洩放電阻', '功率損耗 = Vce(sat) × Ic'],
        commonMistakes: ['基極電流不足未飽和、發熱', '感性負載漏接飛輪二極體', '基極電阻過大開關慢'],
        examples: [{ title: '驅動 LED/繼電器', application: '通用開關', circuit: 'NPN + 基極電阻' }],
        relatedTopics: ['mosfet-switching', 'relay-driver', 'current-mirror'], sourcePdf: 'hardware-pdfs (BJT switch)', createdAt: '2026-06-13T10:00:00Z', updatedAt: '2026-06-13T10:00:00Z'
      },
      {
        id: 'push-pull-converter',
        title: '推挽轉換器 (Push-Pull)',
        category: 'power-management',
        description: '中心抽頭一次側 + 兩開關交替導通的隔離轉換器，中功率常用。',
        principles: '一次側中心抽頭接 V+，兩顆 MOSFET 交替導通，使變壓器磁通雙向擺動(利用率高)。二次側多用中心抽頭全波整流。兩開關不可同時導通。',
        circuits: [{ type: 'isolated', description: '推挽轉換器（中心抽頭）', svg: CircuitSVG.pushPull() }],
        keyFormulas: ['Vout ≈ (Ns/Np) × Vin × D × 2（全波）', '開關耐壓 ≥ 2×Vin（加漏感尖峰）', '需死區避免直通'],
        designNotes: ['兩開關務必交替、加死區，避免同時導通燒管', '開關 Vds 至少 2×Vin，留漏感尖峰裕度', '變壓器中心抽頭對稱、減少磁通不平衡', '加磁通平衡/電流模式避免偏磁飽和'],
        commonMistakes: ['偏磁(磁通不平衡)導致飽和', '開關耐壓不足(2×Vin)', '無死區造成直通'],
        examples: [{ title: '中功率隔離電源', application: '通訊/工業', circuit: '推挽 + 中心抽頭全波整流' }],
        relatedTopics: ['flyback', 'forward-converter', 'full-bridge-converter', 'half-bridge'], sourcePdf: 'hardware-pdfs (push-pull)', createdAt: '2026-06-14T10:00:00Z', updatedAt: '2026-06-14T10:00:00Z'
      },
      {
        id: 'full-bridge-converter',
        title: '全橋轉換器 (Full-Bridge)',
        category: 'power-management',
        description: '四顆開關組成橋臂驅動變壓器一次側，適合大功率隔離轉換。',
        principles: '四顆 MOSFET 分對角導通(Q1+Q4 / Q2+Q3)，使一次側獲得正負交替的全幅電壓，變壓器利用率最佳。二次側多用橋式或中心抽頭整流。',
        circuits: [{ type: 'isolated', description: '全橋驅動變壓器一次側', svg: CircuitSVG.fullBridge() }],
        keyFormulas: ['Vout ≈ (Ns/Np) × Vin × D', '開關耐壓 ≈ Vin（優於推挽的 2×Vin）', '需死區時間防同臂直通'],
        designNotes: ['對角開關成對導通，務必加死區避免同臂直通', '高側需自舉或隔離驅動', '可用移相控制(phase-shift)達 ZVS 軟切換', '一次側加隔直電容防偏磁'],
        commonMistakes: ['同臂上下直通燒管', '高側驅動供電不足', '偏磁未處理導致飽和'],
        examples: [{ title: '大功率隔離電源', application: '伺服器/充電樁', circuit: '移相全橋 + 同步整流' }],
        relatedTopics: ['half-bridge', 'push-pull-converter', 'gate-driver', 'h-bridge-motor'], sourcePdf: 'hardware-pdfs (full-bridge)', createdAt: '2026-06-14T10:00:00Z', updatedAt: '2026-06-14T10:00:00Z'
      },
      {
        id: 'pwm-control',
        title: 'PWM 控制原理',
        category: 'power-management',
        description: '鋸齒波與誤差電壓比較產生 PWM，是切換式電源/馬達調速的核心。',
        principles: '比較器將固定頻率鋸齒波與誤差放大器輸出(Vctrl)比較：鋸齒 > Vctrl 時輸出高，反之低 → 產生占空比隨 Vctrl 變化的方波。閉迴路調 Vctrl 即穩壓/調速。',
        circuits: [{ type: 'control', description: 'PWM 產生（鋸齒 vs 誤差電壓）', svg: CircuitSVG.pwmControl() }],
        keyFormulas: ['D = Vctrl / Vramp_pk', 'fsw = 鋸齒波頻率', 'Vout = Vin × D (Buck)'],
        designNotes: ['鋸齒波線性度影響調變精度', '加斜率補償避免電流模式次諧波振盪', '比較器需快、低延遲', '注意最小/最大占空比限制'],
        commonMistakes: ['誤差放大器補償不當導致振盪', '占空比飽和失去調節', '雜訊耦合到比較器誤觸發'],
        examples: [{ title: 'Buck 控制環', application: 'DC-DC', circuit: '電壓模式 PWM' }],
        relatedTopics: ['buck-converter', 'comparator-hysteresis', 'op-amp-basics'], sourcePdf: 'hardware-pdfs (PWM)', createdAt: '2026-06-14T10:00:00Z', updatedAt: '2026-06-14T10:00:00Z'
      },
      {
        id: 'ddr-termination',
        title: 'DDR / VTT 終端',
        category: 'high-speed',
        description: '高速記憶體匯流排用 VTT(=Vdd/2) 終端，抑制反射確保訊號完整。',
        principles: 'DDR 訊號速率高，走線需阻抗匹配。常用末端並聯電阻接到 VTT(中點電壓)終端，或晶片內建 ODT(On-Die Termination)。VTT 由專用 VTT 穩壓器(可吸/灌電流)提供。',
        circuits: [{ type: 'high-speed', description: 'VTT 並聯終端', svg: CircuitSVG.ddrTermination() }],
        keyFormulas: ['Rt = Z0（匹配特性阻抗）', 'VTT = Vdd/2', 'VTT 穩壓器需 source/sink 電流'],
        designNotes: ['VTT 軌需大量去耦、低阻抗', '終端電阻靠近接收端', '善用 ODT 減少外部元件', 'VTT 走線寬、短，雙向電流'],
        commonMistakes: ['VTT 去耦不足造成跳動', '終端位置錯誤殘留反射', '用一般 LDO 當 VTT(不能灌電流)'],
        examples: [{ title: 'DDR3/DDR4 匯流排', application: '記憶體', circuit: 'VTT 終端 + ODT' }],
        relatedTopics: ['impedance-matching', 'differential-pair', 'decoupling-capacitor'], sourcePdf: 'hardware-pdfs (DDR/VTT)', createdAt: '2026-06-14T10:00:00Z', updatedAt: '2026-06-14T10:00:00Z'
      },
      {
        id: 'zener-regulator',
        title: 'Zener 並聯穩壓',
        category: 'power-management',
        description: '限流電阻 + 齊納二極體箝位，最簡單的小電流穩壓/箝位。',
        principles: '齊納二極體反向擊穿時兩端電壓近似固定(Vz)。串聯限流電阻 Rs 吸收 Vin 與 Vz 的差，Zener 並聯於輸出箝位電壓。適合小電流參考或保護。',
        circuits: [{ type: 'regulator', description: 'Zener 並聯穩壓', svg: CircuitSVG.zenerReg() }],
        keyFormulas: ['Rs = (Vin − Vz)/(Iz + Iload)', 'Iz 需維持在 Izk ~ Izm 之間', 'P_zener = Vz × Iz'],
        designNotes: ['限流電阻確保 Zener 工作電流', '負載電流變化大時穩壓差', '注意 Zener 功耗與溫度係數', '大電流場合改用 LDO'],
        commonMistakes: ['Rs 選錯使 Iz 不足或過大', '忽略 Zener 功耗燒毀', '當大電流穩壓器用(效率差)'],
        examples: [{ title: '簡易基準/箝位', application: '保護/偏壓', circuit: 'Rs + Zener' }],
        relatedTopics: ['ldo-regulator', 'tl431-reference', 'tvd-selection'], sourcePdf: 'hardware-pdfs (zener)', createdAt: '2026-06-14T10:00:00Z', updatedAt: '2026-06-14T10:00:00Z'
      },
      {
        id: 'photodiode-tia',
        title: '光電二極體跨阻放大 (TIA)',
        category: 'analog',
        description: '把光電二極體的微小電流轉成電壓，光感測/光通訊前端。',
        principles: '光電二極體受光產生電流 I_PD。接到運放反相輸入(虛地)，回授電阻 Rf 把電流轉成電壓：Vout = −I_PD × Rf。+ 端接地，− 端為虛地使二極體零偏壓(光伏)或反偏(光導)。',
        circuits: [{ type: 'analog', description: '跨阻放大器 (TIA)', svg: CircuitSVG.photodiodeTia() }],
        keyFormulas: ['Vout = −I_PD × Rf', '頻寬 ∝ 1/(Rf × Cin)', '回授加 Cf 補償穩定'],
        designNotes: ['Rf 大→增益高但頻寬低、噪聲高', '加回授電容 Cf 補償避免振盪', '低偏置電流運放、低輸入電容', 'PCB 保護環降低漏電流'],
        commonMistakes: ['無 Cf 補償導致振盪', '運放偏置電流造成誤差', '佈線漏電流影響微小電流'],
        examples: [{ title: '光感測前端', application: '光通訊/感測', circuit: '光電二極體 + TIA' }],
        relatedTopics: ['op-amp-basics', 'current-sensing'], sourcePdf: 'hardware-pdfs (transimpedance/TIA)', createdAt: '2026-06-14T10:00:00Z', updatedAt: '2026-06-14T10:00:00Z'
      },
      {
        id: 'instrumentation-amplifier',
        title: '儀表放大器 (3-opamp INA)',
        category: 'analog',
        description: '三運放儀表放大器：高輸入阻抗、高 CMRR，量測感測器微小差動訊號（橋式、熱電偶、分流）。',
        principles: '前級 A1/A2 為同相緩衝，提供極高輸入阻抗；增益電阻 Rg 跨接兩 − 端，差動訊號全落在 Rg 上，共模訊號則同進同出不被放大。後級 A3 為標準差動放大器，把 A1/A2 輸出相減並除去共模。單一 Rg 即可調整全段增益且不影響 CMRR。',
        circuits: [{ type: 'analog', description: '三運放儀表放大器', svg: CircuitSVG.instrumentationAmp() }],
        keyFormulas: ['Vout = (1 + 2R1/Rg) × (R3/R2) × (V2 − V1)', '前級增益 = 1 + 2R1/Rg', '後級增益 = R3/R2', 'CMRR 取決於 R2/R3 比例匹配'],
        designNotes: ['Rg 改增益不影響 CMRR，前級對稱免電阻匹配', '後級 R2/R3 需精密匹配(0.1%)以保 CMRR', '用低偏壓、低漂移運放降低失調', 'Ref 腳可接虛擬地做電平位移', '直接用整合式 INA(INA128/AD620)省匹配麻煩'],
        commonMistakes: ['後級電阻不匹配使 CMRR 劣化', 'Rg 容差直接變成增益誤差', 'Ref 腳由高阻抗源驅動破壞 CMRR', '輸入偏壓電流無回流路徑導致飽和'],
        examples: [{ title: '橋式感測讀取', application: '稱重/壓力/應變', circuit: '惠斯通電橋 + INA + ADC' }],
        relatedTopics: ['op-amp-basics', 'opamp-configurations', 'wheatstone-bridge', 'current-sensing'], sourcePdf: 'hardware-pdfs (儀表放大器, 35 篇)', createdAt: '2026-06-15T10:00:00Z', updatedAt: '2026-06-15T10:00:00Z'
      },
      {
        id: 'prevent-leakage-fet',
        title: '雙 FET 防漏 / 開汲極域隔離',
        category: 'protection',
        description: '兩級 BSS138 NMOS 開汲極緩衝，把訊號跨電壓域傳遞且防止反灌漏電（常見於 RTC/STBY 域）。',
        principles: '每級 = NMOS + 上拉電阻 = 反相器。第一級閘極在來源域(上拉 R388 接 STBY)，把 LR_L 反相成 RTC_CLR_G；第二級閘極接 RTC_CLR_G，汲極為開汲極輸出 RTC_CLR_OD_L(上拉在目的域)。兩次反相抵消→整體為非反相開汲極緩衝。開汲極「只吸不灌」+ 上拉接常開 STBY 軌(100k 大阻值)，使任一電壓域斷電時不會經 I/O 鉗位二極體反灌供電，達到防漏與域隔離。',
        circuits: [{ type: 'protection', description: '雙 NMOS 開汲極防漏緩衝', svg: CircuitSVG.preventLeakage() }],
        keyFormulas: ['每級反相：Vout 高 ⇔ 閘極低', 'LR_L 低→RTC_CLR_G 高→OD_L 拉低(有效)', '待機電流 ≈ VSTBY / R_pullup(100k→~33µA 最壞)', '開汲極輸出：只吸電流(low)、釋放時高阻'],
        designNotes: ['上拉接常開 STBY 軌、用大阻值(100k)壓低靜態電流', '開汲極輸出防止對未上電域反灌(防漏核心)', 'BSS138 體二極體方向需與防反灌一致', '閘極 DC 不耗流、無漏電路徑', '邊緣較慢(R×C)，適合靜態 reset/clear 訊號'],
        commonMistakes: ['上拉接到會斷電的主軌→失去防漏意義', '用主動推挽輸出取代開汲極→對未上電域反灌', '極性(兩次反相)算錯', '上拉阻值過小→待機電流過大', '長走線 + 大上拉→抗噪差/上升慢'],
        examples: [{ title: 'RTC_CLR 跨域', application: 'RTC/STBY 域 reset 隔離', circuit: 'BSS138×2(SOT363) + 10k/100k 上拉' }],
        relatedTopics: ['level-shift', 'esd-protection', 'reverse-polarity', 'mosfet-switch'], sourcePdf: '使用者實例 (PREVENT LEAKAGE)', createdAt: '2026-06-15T10:00:00Z', updatedAt: '2026-06-15T10:00:00Z'
      },
      {
        id: 'bandgap-reference',
        title: 'Bandgap 能隙基準',
        category: 'analog',
        description: '把負溫度係數的 VBE 與正溫度係數的 ΔVBE 相加，產生≈1.2V、幾乎不隨溫度變的精密電壓基準。',
        principles: 'BJT 的 VBE 隨溫度下降(CTAT，約 −2mV/°C)。兩顆射極面積比 1:N 的 BJT 在相同電流下產生 ΔVBE = VT·ln(N)，VT=kT/q 隨溫度上升(PTAT，正係數)。把 ΔVBE 乘上係數 M 使其斜率 +2mV/°C，與 VBE 相加 → 斜率抵消，得 Vref = VBE + M·VT·ln(N) ≈ Eg/q ≈ 1.2V（矽能隙電壓），溫漂可低到數十 ppm/°C。常用運放強制兩支路節點等電位，R 比設定 M。',
        circuits: [
          { type: 'concept', description: 'CTAT + PTAT 相加得溫度無關 Vref', svg: CircuitSVG.bandgapConcept() },
          { type: 'schematic', description: '運放型 bandgap 核心（Q1×1 / Q2×N + R1/R2/R3）', svg: CircuitSVG.bandgapCore() }
        ],
        keyFormulas: ['Vref = VBE + M·VT·ln(N) ≈ 1.2V', 'VT = kT/q ≈ 26mV @300K', 'ΔVBE = VT·ln(N)（面積比 N）', 'VBE 約 −2mV/°C；PTAT 項調到 +2mV/°C 抵消'],
        designNotes: ['面積比 N 常取 8（佈局成 3×3 共質心）', 'R 比決定 M，需精密匹配與共質心佈局', '運放失調電壓直接成基準誤差→用 chopper/auto-zero', '加啟動電路避免落在零電流穩態', '輸出加緩衝與去耦；曲率補償可再降溫漂'],
        commonMistakes: ['無啟動電路→卡在 0V 簡併點', 'R/BJT 不匹配→溫漂與初始誤差大', '運放失調未處理→基準偏移', '負載直接拉基準節點→壓降/不穩', '忽略曲率(高階溫度項)導致中溫凸起'],
        examples: [{ title: '片上 1.2V 基準', application: 'ADC/DAC/LDO 參考', circuit: '運放型 bandgap + 啟動電路' }],
        relatedTopics: ['ldo-selection', 'tl431-reference', 'adc-dac-basics', 'current-mirror'], sourcePdf: 'hardware-pdfs (bandgap, 5 篇)', createdAt: '2026-06-15T10:00:00Z', updatedAt: '2026-06-15T10:00:00Z'
      },
      {
        id: 'power-supervisor',
        title: '電源監控 / Reset IC',
        category: 'power-management',
        description: '電壓監控器(supervisor)：偵測 VCC 低於門檻時拉低 /RESET 並延時釋放，確保 MCU 在電源穩定後才啟動。',
        principles: 'IC 內含精密基準(常為 bandgap)與比較器，把 VCC 分壓和 Vth 比較。VCC<Vth 時 /RESET(開汲極、低有效)被拉低；VCC 回升超過門檻+遲滯後，再經固定延時(reset timeout)才釋放，給晶振/電源穩定時間。開汲極輸出需外接上拉到 MCU 的 I/O 電壓域，可多源 wired-AND。進階款含手動 reset(MR)、看門狗(WDI)、視窗監控。',
        circuits: [{ type: 'schematic', description: 'Supervisor + 上拉 + 旁路電容 → MCU /RESET', svg: CircuitSVG.powerSupervisor() }],
        keyFormulas: ['VCC < Vth → /RST = 低(有效)', '釋放條件：VCC > Vth + Vhys 且過延時 tRST', '門檻常見：4.63/2.93/2.63/1.67V 等', '開汲極：Rpu 接 MCU 域電壓'],
        designNotes: ['/RST 是開汲極→務必加上拉(到 MCU I/O 電壓)', 'Vth 選在 MCU 最低工作電壓之上、留遲滯', '延時要夠長覆蓋電源/晶振穩定', '旁路電容靠近 VCC 腳濾雜訊避免誤觸發', '多監控源可 wired-AND 共用 /RST 線', '看門狗款需 MCU 定期踢 WDI'],
        commonMistakes: ['/RST 忘了上拉→浮接亂 reset', '門檻太低→MCU 在欠壓區仍跑', '延時太短→電源未穩就放行', 'VCC 腳無去耦→雜訊誤觸發', '上拉接錯電壓域→電平不符'],
        examples: [{ title: 'MCU 上電復位', application: '嵌入式系統開機', circuit: 'MAX809/TPS3823 + Rpu + 旁路電容' }],
        relatedTopics: ['bandgap-reference', 'prevent-leakage-fet', 'embedded-power-design', 'decoupling-capacitor'], sourcePdf: 'hardware-pdfs (supervisor/reset)', createdAt: '2026-06-15T10:00:00Z', updatedAt: '2026-06-15T10:00:00Z'
      },
      {
        id: 'rc-highpass',
        title: 'RC 高通濾波器',
        category: 'analog',
        products: ['通用', '音訊', '感測'],
        description: '一階 RC 高通：濾掉直流/低頻，通過高頻；交流耦合、隔直常用。',
        principles: 'C 串聯、R 對地。低頻時 C 阻抗大→輸出小；高頻時 C 近似短路→訊號通過。截止頻率 fc=1/(2πRC)，−3dB 點，−20dB/decade 滾降。',
        circuits: [{ type: 'filter', description: '一階 RC 高通', svg: CircuitSVG.rcHighpass() }],
        keyFormulas: ['fc = 1/(2πRC)', '高於 fc 通過、低於 fc 衰減', '−20dB/decade 滾降', '相位 +45° @fc'],
        designNotes: ['交流耦合隔直：C 取夠大使 fc 低於訊號最低頻', '輸入阻抗受 R 影響，注意負載', '與低通串接成帶通'],
        commonMistakes: ['C 太小→低頻被砍', 'R 太小→負載重', '忽略後級輸入電容改變 fc'],
        examples: [{ title: '音訊交流耦合', application: '隔直流偏壓', circuit: 'C 串聯 + R 對地' }],
        relatedTopics: ['rc-lowpass', 'op-amp-basics'], sourcePdf: null, createdAt: '2026-06-19T10:00:00Z', updatedAt: '2026-06-19T10:00:00Z'
      },
      {
        id: 'rc-delay',
        title: 'RC 時間延遲電路',
        category: 'analog',
        products: ['通用', '電源', 'MCU'],
        description: 'R 串聯 + C 對地，階躍輸入後節點電壓以 τ=RC 指數上升，做上電延遲/去抖/軟啟動。',
        principles: '階躍輸入經 R 對 C 充電，Vc(t)=Vin(1−e^(−t/RC))。τ=RC 時達 63%；到比較器門檻 Vth 的延遲 td=RC·ln(Vin/(Vin−Vth))。常接 Schmitt/比較器產生乾淨的延遲數位邊緣。',
        circuits: [{ type: 'timing', description: 'RC 延遲（充電曲線）', svg: CircuitSVG.rcDelay() }],
        keyFormulas: ['Vc(t) = Vin(1 − e^(−t/RC))', 'τ = RC（63%）', '到 50%≈0.69RC', 'td = RC·ln(Vin/(Vin−Vth))'],
        designNotes: ['後接 Schmitt 觸發避免邊緣抖動', 'C 漏電與運放偏壓電流影響長延遲精度', '需精確延遲改用計時 IC(555)或 MCU'],
        commonMistakes: ['直接接邏輯閘→緩變邊緣造成抖動/穿透電流', '用電解電容→容差/漏電大', '忽略放電路徑'],
        examples: [{ title: '上電延遲致能', application: '電源時序', circuit: 'R+C → 比較器 → EN' }],
        relatedTopics: ['rc-lowpass', 'power-sequencing', 'comparator-hysteresis'], sourcePdf: null, createdAt: '2026-06-19T10:00:00Z', updatedAt: '2026-06-19T10:00:00Z'
      },
      {
        id: 'op-integrator',
        title: '運放積分器',
        category: 'analog',
        products: ['通用', '感測', '控制'],
        description: 'Vin→R→反相端、C 回授：輸出為輸入對時間的積分，用於波形產生、控制環路、ΔΣ。',
        principles: '虛地使流過 R 的電流 Vin/R 全部對 C 充電，Vout=−1/(RC)∫Vin dt。方波輸入→三角波輸出。直流增益無限大→需並聯 Rf 限制低頻增益並防飽和。',
        circuits: [{ type: 'analog', description: '運放積分器（C 回授）', svg: CircuitSVG.opIntegrator() }],
        keyFormulas: ['Vout = −1/(RC)∫Vin dt', '方波→三角波', '單位增益頻率 = 1/(2πRC)', '並聯 Rf 設低頻增益上限'],
        designNotes: ['C 並聯大 Rf 防直流飽和/偏移累積', '低偏壓電流運放、補償輸入偏置', '重置開關清除初始電荷'],
        commonMistakes: ['無 Rf→偏移累積到飽和', '忽略運放失調被積分放大', 'C 漏電造成漂移'],
        examples: [{ title: '三角波產生', application: '波形/PWM', circuit: '方波→積分器→三角波' }],
        relatedTopics: ['op-differentiator', 'opamp-configurations', 'rc-lowpass'], sourcePdf: null, createdAt: '2026-06-19T10:00:00Z', updatedAt: '2026-06-19T10:00:00Z'
      },
      {
        id: 'op-differentiator',
        title: '運放微分器',
        category: 'analog',
        products: ['通用', '感測', '控制'],
        description: 'Vin→C→反相端、R 回授：輸出為輸入對時間的微分，用於邊緣偵測、PD 控制。',
        principles: '流過 C 的電流 C·dVin/dt 全部流過 Rf，Vout=−RC·dVin/dt。三角波輸入→方波輸出。高頻增益隨頻率上升→易放大噪聲與振盪，需串入小電阻/並聯小電容限頻。',
        circuits: [{ type: 'analog', description: '運放微分器（R 回授）', svg: CircuitSVG.opDifferentiator() }],
        keyFormulas: ['Vout = −RC·dVin/dt', '三角波→方波', '高頻增益 ∝ f（需限頻）', '加 Rs 串 C：fz=1/(2πRsC)'],
        designNotes: ['輸入串小電阻 Rs + 回授並小 Cf 限高頻增益防振盪', '低噪聲運放', '注意對高頻噪聲敏感'],
        commonMistakes: ['未限頻→高頻噪聲被放大/振盪', '直接微分含噪訊號', 'GBW 不足相位餘裕不夠'],
        examples: [{ title: '邊緣/變化率偵測', application: '訊號處理/控制', circuit: '三角波→微分器→方波' }],
        relatedTopics: ['op-integrator', 'opamp-configurations'], sourcePdf: null, createdAt: '2026-06-19T10:00:00Z', updatedAt: '2026-06-19T10:00:00Z'
      }
    ];
    if (window.KNOWLEDGE_EXTRA) __data.push(...window.KNOWLEDGE_EXTRA);   // 特殊線路卡（knowledge-extra.js）
    __data.forEach(it => { if (!it.products || !it.products.length) it.products = ['通用']; });
    this.applyCircuitArt(__data);
    return __data;
  },

  // ---- 常用線路拓樸維度（降壓/升壓/DC-DC/AC-DC/DC-AC/AC-AC/LDO）----
  TOPOS: [['all', '全部'], ['buck', '降壓 Buck'], ['boost', '升壓 Boost'], ['ldo', 'LDO 線性'],
          ['acdc', 'AC-DC'], ['dcac', 'DC-AC 逆變'], ['acac', 'AC-AC'], ['dcdc', 'DC-DC 其他']],
  currentTopo: 'all',
  itemTopo(item) {
    const t = (item.title || '') + ' ' + (item.description || '');
    if (/AC[- ]?DC|整流|返馳|Flyback|LLC/i.test(t)) return 'acdc';
    if (/DC[- ]?AC|逆變|inverter/i.test(t)) return 'dcac';
    if (/AC[- ]?AC/i.test(t)) return 'acac';
    if (/升壓|Boost/i.test(t)) return 'boost';
    if (/降壓|Buck/i.test(t)) return 'buck';
    if (/LDO|線性穩壓/i.test(t)) return 'ldo';
    if (/DC[- ]?DC/i.test(t)) return 'dcdc';
    return null;
  },
  renderTopoFilter() {
    const host = document.querySelector('#topoFilter');
    if (!host) return;
    host.innerHTML = this.TOPOS.map(([v, label]) => {
      const active = (this.currentTopo === v) ? ' background:#0e9f6e;color:#fff;border-color:#0e9f6e;' : '';
      return `<button class="topo-btn" data-topo="${v}" style="padding:3px 8px;border:1px solid #cbd5e1;border-radius:6px;background:#fff;font-size:12px;cursor:pointer;${active}">${label}</button>`;
    }).join('');
    host.querySelectorAll('.topo-btn').forEach(b => b.addEventListener('click', () => {
      this.currentTopo = b.dataset.topo;
      this.renderTopoFilter();
      this.renderCards();
    }));
  },

  getFilteredItems() {
    return this.items.filter(item => {
      const matchesCategory = this.currentCategory === 'all' || item.category === this.currentCategory ||
        (['emc', 'emi'].includes(this.currentCategory) && item.category === 'emi-emc');
      const matchesTopo = !this.currentTopo || this.currentTopo === 'all' || this.itemTopo(item) === this.currentTopo;
      const prods = item.products || ['通用'];
      const matchesProduct = !this.currentProduct || this.currentProduct === 'all' ||
        prods.includes(this.currentProduct) || prods.includes('通用');
      const matchesSearch = !this.searchQuery ||
        item.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchesCategory && matchesTopo && matchesProduct && matchesSearch;
    });
  },

  renderCards() {
    const container = document.querySelector('#knowledgeGrid');
    if (!container) return;

    const filtered = this.getFilteredItems();

    // 熱門主題付費鎖：選到鎖定主題且未解鎖 → 顯示升級卡，不出內容
    const kbLock = window.KB_LOCK && !window.KB_LOCK.unlocked;
    const lockedProds = (window.KB_LOCK && window.KB_LOCK.prods) || [];
    if (kbLock && lockedProds.includes(this.currentProduct)) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px 24px; background:#fff; border:1px solid #e2e8f0; border-radius:12px;">
          <p style="font-size: 44px; margin-bottom: 12px;">🔒</p>
          <h3 style="color:#0f172a; margin:0 0 8px;">「${this.currentProduct}」為付費主題</h3>
          <p style="color:#64748b; font-size:14px; margin:0 0 18px;">電子紙、車用電子（電動車）、AI 伺服器、手機、筆電、智慧手錶等熱門主題內容需 VIP 解鎖。</p>
          <a class="primary-button" style="padding:10px 22px; text-decoration:none;" href="upgrade.html">升級 VIP 解鎖</a>
        </div>`;
      return;
    }
    const isLockedItem = it => kbLock && (it.products || []).some(p => lockedProds.includes(p)) && !(it.products || []).includes('通用');

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--muted);">
          <p style="font-size: 48px; margin-bottom: 16px;">📚</p>
          <p>尚無知識卡片</p>
          <p style="font-size: 14px;">上傳 PDF 或手動新增知識</p>
        </div>
      `;
      return;
    }

    const _L = (window.I18N && I18N.lang) || 'zh';
    container.innerHTML = filtered.map(raw => {
      const item = (_L !== 'zh' && raw.i18n && raw.i18n[_L]) ? Object.assign({}, raw, raw.i18n[_L]) : raw;
      const locked = isLockedItem(item);
      return `
      <div class="knowledge-card" data-id="${item.id}" data-locked="${locked ? 1 : 0}"${locked ? ' style="opacity:.65"' : ''}>
        <div class="card-header">
          <div class="card-category">${this.getCategoryName(item.category)}${locked ? ' 🔒' : ''}</div>
          <div class="card-title">${item.title}</div>
        </div>
        <div class="card-body">
          <div class="card-description">${locked ? '付費主題內容，升級 VIP 解鎖完整說明與電路圖。' : (item.description || '')}</div>
          <div class="card-tags">
            ${(item.circuits || []).slice(0, 2).map(c => `<span class="card-tag">${c.type}</span>`).join('')}
          </div>
        </div>
      </div>`;
    }).join('');

    // Bind click events（鎖定卡導向升級頁）
    container.querySelectorAll('.knowledge-card').forEach(el => {
      el.addEventListener('click', () => {
        if (el.dataset.locked === '1') { location.href = 'upgrade.html'; return; }
        this.showDetail(el.dataset.id);
      });
    });
  },

  getCategoryName(category) {
    const names = {
      'power-management': '電源管理',
      'signal-processing': '訊號處理',
      'communication': '通訊介面',
      'transistor': '電晶體應用',
      'protection': '保護電路',
      'high-speed': '高速設計',
      'emi-emc': 'EMI/EMC',
      'emc': 'EMC 設計',
      'emi': 'EMI 對策',
      'interview': '面試題目',
      'analog': '類比電路',
      'data-conversion': '資料轉換',
      'measurement': '量測儀器',
      'embedded': '嵌入式系統'
    };
    return names[category] || category;
  },

  updateCounts() {
    const total = this.items.length;
    const sfx = { zh: ' 個主題', en: ' topics', ja: '件', ko: '개 주제' };
    const l = (window.I18N && I18N.lang) || 'zh';
    document.querySelector('#totalCount').textContent = `${total}${sfx[l] || sfx.zh}`;
  },

  // 公式下標（HTML）：Vout→V<sub>out</sub>、Rds_on→Rds<sub>on</sub>、R1→R<sub>1</sub>
  subHtml(s) {
    return String(s)
      .replace(/([A-Za-z]+)_([A-Za-z0-9]+)/g, '$1<sub>$2</sub>')
      .replace(/\b([VI])(out|in|ref|gs|ds|th|dd|cc|bus|bat|load|pk|sat|dc|drain)\b/gi, '$1<sub>$2</sub>')
      .replace(/\b([RCLQ])(\d+)\b/g, '$1<sub>$2</sub>');
  },

  showDetail(id) {
    let item = this.items.find(i => i.id === id);
    if (!item) return;
    // 內容層 i18n：卡片帶 item.i18n[lang] 就覆蓋（缺欄位自動 fallback 中文）
    const _L = (window.I18N && I18N.lang) || 'zh';
    if (_L !== 'zh' && item.i18n && item.i18n[_L]) item = Object.assign({}, item, item.i18n[_L]);

    const modal = document.querySelector('#knowledgeModal');
    const title = document.querySelector('#modalTitle');
    const body = document.querySelector('#modalBody');

    title.textContent = item.title;

    // 只有明確對應的主題才顯示動畫（避免瞎配）
    const hasAnim = typeof CircuitAnimation !== 'undefined'
      && CircuitAnimation.topicAnimationMap
      && !!CircuitAnimation.topicAnimationMap[item.id];

    body.innerHTML = `
      <div class="detail-section">
        <h3>原理說明</h3>
        <p>${item.principles || '無說明'}</p>
      </div>

      ${(item.circuits || []).map(circuit => `
        <div class="detail-section">
          <h3>${circuit.description}</h3>
          <div class="circuit-image">
            ${circuit.svg || '<p>暫無電路圖</p>'}
          </div>
        </div>
      `).join('')}

      ${(item.keyFormulas || []).length > 0 ? `
        <div class="detail-section">
          <h3>關鍵公式</h3>
          ${item.keyFormulas.map(f => `<div class="formula-box">${this.subHtml(f)}</div>`).join('')}
        </div>
      ` : ''}

      ${(item.designNotes || []).length > 0 ? `
        <div class="detail-section">
          <h3>設計注意事項</h3>
          <ul class="note-list">
            ${item.designNotes.map(n => `<li>${n}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${(item.commonMistakes || []).length > 0 ? `
        <div class="detail-section">
          <h3>常見錯誤</h3>
          <ul class="note-list mistake-list">
            ${item.commonMistakes.map(m => `<li>${m}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${(item.examples || []).length > 0 ? `
        <div class="detail-section">
          <h3>範例應用</h3>
          ${item.examples.map(ex => `
            <div style="padding: 12px; background: var(--panel-soft); border-radius: var(--radius); margin-bottom: 8px;">
              <strong>${ex.title}</strong>
              <p style="font-size: 14px; color: var(--muted); margin-top: 4px;">${ex.application}</p>
              <p style="font-size: 13px; margin-top: 4px;">${ex.circuit}</p>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${hasAnim ? `
      <div class="detail-section">
        <h3>電路動畫</h3>
        <div id="animationContainer" style="border: 1px solid var(--line); border-radius: var(--radius); padding: 12px; min-height: 180px;">
          <div id="animationTitle" style="font-size: 13px; color: var(--accent-strong); font-weight: 600; margin-bottom: 8px;"></div>
          <div id="animationDisplay" style="min-height: 150px; display: flex; align-items: center; justify-content: center; color: var(--muted);"></div>
        </div>
      </div>` : ''}
    `;

    // 僅在有「明確且相關」對應時顯示動畫（不瞎配無關動畫）
    if (hasAnim) {
      const animDisplay = document.querySelector('#animationDisplay');
      const animTitle = document.querySelector('#animationTitle');
      if (animDisplay && typeof CircuitAnimation !== 'undefined') {
        const animId = CircuitAnimation.topicAnimationMap[item.id];
        const anim = CircuitAnimation.animations[animId];
        animDisplay.innerHTML = '';
        CircuitAnimation.createAnimation('#animationDisplay', animId);
        if (animTitle && anim) animTitle.textContent = `▶ ${anim.name}`;
      }
    }

    modal.hidden = false;
  },

  closeModal() {
    document.querySelector('#knowledgeModal').hidden = true;
  },

  async handlePdfUpload(files) {
    // TODO: Implement PDF parsing
    alert(`已收到 ${files.length} 個 PDF 檔案。PDF 解析功能即將實作。`);
  },

  renderProductFilter() {
    const host = document.querySelector('#productFilter');
    if (!host) return;
    const prods = ['all', '通用', '筆電', '手機', '平板', '智慧手錶', '車用電子', '電子紙', 'AI 伺服器', '網通', 'WiFi 路由器', 'IoT', '耳機', '滑鼠', '硬碟', '風扇', '電器', '音訊', '感測', '控制', '電源', 'MCU'];
    // 熱門主題付費解鎖（軟鎖；權限由 plan.js 查 user_plans/profiles，KB_LOCK 由 knowledge.html 設定）
    const kbLock = window.KB_LOCK && !window.KB_LOCK.unlocked;
    const lockedProds = (window.KB_LOCK && window.KB_LOCK.prods) || [];
    host.innerHTML = prods.map(p => {
      let label = p === 'all' ? '全部' : p;
      if (kbLock && lockedProds.includes(p)) label += ' 🔒';
      const active = (this.currentProduct === p) ? ' background:#1f4fd1;color:#fff;border-color:#1f4fd1;' : '';
      return `<button class="prod-btn" data-product="${p}" style="padding:3px 8px;border:1px solid #cbd5e1;border-radius:6px;background:#fff;font-size:12px;cursor:pointer;${active}">${label}</button>`;
    }).join('');
    host.querySelectorAll('.prod-btn').forEach(b => b.addEventListener('click', () => {
      this.currentProduct = b.dataset.product;
      this.renderProductFilter();
      this.renderCards();
    }));
  },

  bindEvents() {
    this.renderProductFilter();
    this.renderTopoFilter();
    // Category filter
    document.querySelectorAll('.category-item').forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        this.currentCategory = item.dataset.category;
        this.renderCards();
      });
    });

    // Search
    document.querySelector('#searchInput')?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.renderCards();
    });

    // Close modal
    document.querySelector('#closeModal')?.addEventListener('click', () => this.closeModal());
    document.querySelector('#knowledgeModal')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this.closeModal();
    });
    // ESC 關閉
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.querySelector('#knowledgeModal');
        if (modal && !modal.hidden) this.closeModal();
      }
    });

    // PDF upload
    document.querySelector('#pdfUpload')?.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handlePdfUpload(e.target.files);
      }
    });
  }
};

// Toast notification
function showToast(message, duration = 3000) {
  const host = document.querySelector('#toastHost');
  const template = document.querySelector('#toastTemplate');
  if (!host || !template) return;

  const toast = template.content.cloneNode(true).querySelector('.toast');
  toast.textContent = message;
  host.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, duration);
}

// Initialize
knowledgeApp.init();
