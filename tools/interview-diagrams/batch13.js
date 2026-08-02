/**
 * batch13.js — 波形/曲線八題（q7 q12 q16 q17 q18 q24 q26 q27）轉成符號庫畫風
 *
 *   q7  SPI 四種模式：CPOL 決定閒置準位、CPHA 決定第幾個邊沿取樣
 *   q12 Buck 工作週期：D = VOUT/VIN = 30%，波形的高電位段就是 30%
 *   q16 I2C Fast Mode 五項時序：SCL 波形標 tr/tf/tLOW/tHIGH，下面列規格
 *   q17 由 tr 反推 Rp 上限：兩條 RC 充電曲線（1.8k 過、4.7k 不過）
 *   q18 哪個不是修法：tr 對 Rp 是正比直線，(C) 把 Rp 調大 = 往上跑
 *   q24 MOSFET 選型六參數 + FOM：右邊是 RDS(on)-Qg 的取捨曲線
 *   q26 RC 低通：電路 + 波德圖，-3dB 點與 -20dB/dec 斜率
 *   q27 Setup / Hold：時鐘與資料波形，取樣邊沿前後的兩個窗
 *
 * q18 與 q26 在舊版有 8 筆瀏覽器實測的擦邊重疊（估算器的 2px 容差看不到），
 * 這輪重畫一併清掉：文字一律放在曲線之外，不再貼著線走。
 */
const { Sym, BG, T, title, wire, INK, MUTED, OK, BAD, WARN, FAINT } = require('./light.js');
const D = {};

/** 座標軸（左下原點）。 */
const axes = (x0, y0, x1, y1) => Sym.line(x0, y1, x0, y0, { w: 1.4, color: FAINT })
  + Sym.line(x0, y0, x1, y0, { w: 1.4, color: FAINT });

/** 取樣邊沿標記：實心倒三角，尖端朝下指著邊沿。 */
const mark = (x, y, color) => Sym.tri(`${x - 5},${y - 9} ${x + 5},${y - 9} ${x},${y}`, { color, fill: color });

/* ---------- q7：SPI 四種模式 ---------- */
{
  const X0 = 150, HALF = 40, EDGES = 8;          // 4 個時脈 = 8 個邊沿
  const row = (cy, cpol, cpha) => {
    const hi = cy - 14, lo = cy + 14;
    // 閒置準位由 CPOL 決定；每個邊沿翻轉一次
    let lvl = cpol ? hi : lo;
    const pts = [`${X0 - 30},${lvl}`, `${X0},${lvl}`];
    for (let i = 0; i < EDGES; i++) {
      const x = X0 + i * HALF;
      lvl = lvl === hi ? lo : hi;
      pts.push(`${x},${lvl}`);
      pts.push(`${x + HALF},${lvl}`);
    }
    let g = Sym.poly(pts.join(' '), { w: 2 });
    // CPHA=0 取樣第一個邊沿（i 偶數），CPHA=1 取樣第二個（i 奇數）
    for (let i = cpha; i < EDGES; i += 2) g += mark(X0 + i * HALF, cy - 20, WARN);
    return g;
  };
  const label = (cy, n, cpol, cpha, note) => T(10, cy - 2, 'Mode ' + n, { weight: 'bold' })
    + T(10, cy + 14, `CPOL ${cpol} / CPHA ${cpha}`, { fill: MUTED })
    + (note ? T(10, cy + 30, note, { fill: OK }) : '');

  D.q7 = BG(520, 350)
    + title(520, 'SPI has four modes, and CPOL / CPHA are the whole story')
    + label(90, 0, 0, 0, 'most used') + row(90, 0, 0)
    + label(150, 1, 0, 1) + row(150, 0, 1)
    + label(210, 2, 1, 0) + row(210, 1, 0)
    + label(270, 3, 1, 1) + row(270, 1, 1)
    + T(150, 302, 'triangles = the edge that samples the data', { fill: WARN })
    + T(10, 320, 'CPOL sets the idle level of SCLK. CPHA picks which edge samples.', { fill: INK })
    + T(10, 340, 'Master and slave must agree on the mode, or every byte comes back wrong.', { fill: MUTED })
    + '</svg>';
}

/* ---------- q12：Buck 工作週期 ---------- */
{
  const HI = 100, LO = 150, T0 = 300, PER = 100, ON = 30;
  D.q12 = BG(520, 330)
    + title(520, 'Buck duty cycle: D = VOUT / VIN')
    // 左：精簡 buck
    + Sym.rail(80, 66) + T(92, 72, '5VDUAL = 5V', { fill: BAD, weight: 'bold' })
    + Sym.nmos(54, 110, { flip: true, showPins: false })
    + wire(80, 78, 80, 90) + wire(80, 130, 80, 160)
    + wire(18, 110, 24, 110) + T(24, 140, 'PWM', { weight: 'bold' })
    + Sym.junction(80, 160) + T(88, 152, 'SW', { fill: MUTED })
    + Sym.diode(80, 196) + wire(80, 160, 80, 174) + wire(80, 218, 80, 240) + Sym.ground(80, 254)
    + wire(80, 160, 104, 160) + Sym.inductor(128, 160) + T(128, 144, 'L', { anchor: 'middle' })
    + wire(152, 160, 176, 160) + Sym.junction(176, 160)
    + Sym.capacitor(176, 196) + wire(176, 160, 176, 174) + wire(176, 218, 176, 240) + Sym.ground(176, 254)
    + wire(176, 160, 214, 160)
    + T(220, 156, 'V_SM', { weight: 'bold', fill: OK }) + T(220, 172, '1.5V', { fill: MUTED })
    // 右：SW 節點波形，高電位段 = 30%
    + Sym.line(292, 60, 292, 200, { w: 1, color: '#cbd5e1' })
    + Sym.poly(`${T0},${LO} ${T0},${HI} ${T0 + ON},${HI} ${T0 + ON},${LO} ${T0 + PER},${LO} `
      + `${T0 + PER},${HI} ${T0 + PER + ON},${HI} ${T0 + PER + ON},${LO} ${T0 + 2 * PER},${LO}`, { w: 2 })
    + T(294, 104, '5V', { anchor: 'end', fill: MUTED }) + T(294, 154, '0V', { anchor: 'end', fill: MUTED })
    + T(T0 + ON / 2, 92, 'tON', { anchor: 'middle', fill: WARN, weight: 'bold' })
    + Sym.line(T0, 168, T0 + PER, 168, { w: 1.2, color: MUTED })
    + Sym.line(T0, 164, T0, 172, { w: 1.2, color: MUTED })
    + Sym.line(T0 + PER, 164, T0 + PER, 172, { w: 1.2, color: MUTED })
    + T(T0 + PER / 2, 186, 'one period T', { anchor: 'middle', fill: MUTED })
    + T(T0 + PER / 2, 206, 'D = tON / T = 30%', { anchor: 'middle', weight: 'bold' })
    + T(10, 290, 'D = VOUT / VIN = 1.5V / 5V = 0.30, so the high side is on 30% of each cycle.', { fill: INK })
    + T(10, 310, 'With the drops: D = (1.5+0.05)/(5-0.05+0.05) = 0.31. The ideal formula is close.', { fill: MUTED })
    + '</svg>';
}

/* ---------- q16：I2C Fast Mode 的五項 SCL 時序 ---------- */
{
  const HI = 90, LO = 150, P70 = 108, P30 = 132;   // 30% / 70% VDD 的量測點
  // 梯形波：上升 100->130、下降 210->240、再上升 320->350、再下降 430->460
  const wave = '60,150 100,150 130,90 210,90 240,150 320,150 350,90 430,90 460,150 490,150';
  const cross = (x0, x1, yA, yB, y) => x0 + (x1 - x0) * (y - yA) / (yB - yA);
  const r30 = cross(100, 130, LO, HI, P30), r70 = cross(100, 130, LO, HI, P70);
  const f70 = cross(210, 240, HI, LO, P70), f30 = cross(210, 240, HI, LO, P30);
  const r2 = cross(320, 350, LO, HI, P30);
  const span = (x0, x1, y, color) => Sym.line(x0, y, x1, y, { w: 1.2, color })
    + Sym.line(x0, y - 4, x0, y + 4, { w: 1.2, color })
    + Sym.line(x1, y - 4, x1, y + 4, { w: 1.2, color });

  D.q16 = BG(520, 360)
    + title(520, 'I2C Fast Mode: the five SCL timing checks')
    + Sym.line(60, P70, 480, P70, { w: 1, color: FAINT })
    + Sym.line(60, P30, 480, P30, { w: 1, color: FAINT })
    + T(486, P70 + 4, '70%', { fill: MUTED }) + T(486, P30 + 4, '30%', { fill: MUTED })
    + Sym.poly(wave, { w: 2 })
    + span(r30, r70, 76, BAD) + T((r30 + r70) / 2, 70, 'tr', { anchor: 'middle', fill: BAD, weight: 'bold' })
    + span(f70, f30, 76, BAD) + T((f70 + f30) / 2, 70, 'tf', { anchor: 'middle', fill: BAD, weight: 'bold' })
    + span(r70, f70, 172, WARN) + T((r70 + f70) / 2, 188, 'tHIGH >= 0.6us', { anchor: 'middle', fill: WARN })
    + span(f30, r2, 172, WARN) + T((f30 + r2) / 2, 188, 'tLOW >= 1.3us', { anchor: 'middle', fill: WARN })
    + T(10, 226, '1   fSCL <= 400 kHz', { fill: INK })
    + T(10, 248, '2   tLOW >= 1.3us, tHIGH >= 0.6us', { fill: INK })
    + T(10, 270, '3   tr 20-300ns, tf <= 300ns        <- the one that usually fails', { fill: BAD })
    + T(10, 292, '4   tSU:DAT >= 100ns, tHD:DAT 0-0.9us', { fill: INK })
    + T(10, 314, '5   tHD:STA >= 0.6us, tSU:STO >= 0.6us, tBUF >= 1.3us', { fill: INK })
    + T(10, 342, 'All of them are measured at the 30% / 70% VDD crossings, not at the rails.', { fill: MUTED })
    + '</svg>';
}

/* ---------- q17：由 tr 反推 Rp 上限 ---------- */
{
  // 時間軸拉到 1400ns：4.7k 那條要到 1132ns 才碰到 70%，畫到 1000ns 會看不到它其實更慢
  const X0 = 70, X1 = 490, Y0 = 250, Y1 = 90, TMAX = 1400;
  const px = t => X0 + (X1 - X0) * t / TMAX;
  const py = v => Y0 - (Y0 - Y1) * v;                        // v = 0..1（相對 VDD）
  const curve = tau => {
    const p = [];
    for (let t = 0; t <= TMAX; t += 25) p.push(`${px(t).toFixed(1)},${py(1 - Math.exp(-t / tau)).toFixed(1)}`);
    return p.join(' ');
  };
  const TAU_OK = 1770 * 200e-12 * 1e9;      // 354ns
  const TAU_BAD = 4700 * 200e-12 * 1e9;     // 940ns
  D.q17 = BG(520, 340)
    + title(520, 'Rp ceiling comes from the rise time, not from taste')
    + axes(X0, Y0, X1 + 10, Y1 - 10)
    + Sym.line(X0, py(0.3), X1, py(0.3), { w: 1, color: FAINT })
    + Sym.line(X0, py(0.7), X1, py(0.7), { w: 1, color: FAINT })
    + T(X0 - 6, py(0.3) + 4, '30%', { anchor: 'end', fill: MUTED })
    + T(X0 - 6, py(0.7) + 4, '70%', { anchor: 'end', fill: MUTED })
    + Sym.poly(curve(TAU_OK), { w: 2, color: OK })
    + Sym.poly(curve(TAU_BAD), { w: 2, color: BAD })
    + T(X1 + 4, Y0 + 20, 'time', { anchor: 'end', fill: MUTED })
    + T(110, 110, 'Rp 1.8k: tr = 300ns  (pass)', { fill: OK, weight: 'bold' })
    + T(300, 214, 'Rp 4.7k: tr = 796ns  (fail)', { fill: BAD, weight: 'bold' })
    + T(10, 300, 'Rp(max) = tr / (0.8473 x Cb) = 300ns / (0.8473 x 200pF) = 1.77k.', { fill: INK })
    + T(10, 320, 'Floor is Rp(min) = (VDD-VOL)/IOL = (3.3-0.4)/3mA = 967 ohm, so 1.5k is the pick.', { fill: MUTED })
    + '</svg>';
}

/* ---------- q18：tr 對 Rp 是正比，(C) 是反方向 ---------- */
{
  // Cb 取 100pF：這樣 4.7k 落在 300ns 之上（FAIL）、2.2k 落在之下（PASS），
  // (A) 的箭頭才真的跨過限制線。用 200pF 的話 2.2k 是 373ns，照樣不過，圖會自相矛盾。
  const X0 = 70, Y0 = 250, CB = 100, TR = k => 0.8473 * k * CB;   // tr(ns), Rp 單位 kohm
  const px = k => X0 + k * 34.17, py = ns => Y0 - ns * 0.1545;
  const arrow = (x1, y1, x2, y2, color) => {
    const a = Math.atan2(y2 - y1, x2 - x1), h = 9, w = 4.5;
    const bx = x2 - h * Math.cos(a), by = y2 - h * Math.sin(a);
    return Sym.line(x1, y1, bx, by, { w: 2, color })
      + Sym.tri(`${(bx - w * Math.sin(a)).toFixed(1)},${(by + w * Math.cos(a)).toFixed(1)} `
        + `${(bx + w * Math.sin(a)).toFixed(1)},${(by - w * Math.cos(a)).toFixed(1)} ${x2},${y2}`, { color, fill: color });
  };
  D.q18 = BG(520, 340)
    + title(520, 'I2C tr FAIL: which knob turns the wrong way')
    + T(10, 46, 'answer: (C) raising Rp makes tr worse', { fill: BAD, weight: 'bold' })
    + T(500, 46, 'Cb = 100pF', { anchor: 'end', fill: MUTED })
    + axes(X0, Y0, 500, 80)
    + Sym.poly(`${px(0)},${py(0)} ${px(12)},${py(TR(12))}`, { w: 2 })
    + Sym.line(X0, py(300), 500, py(300), { w: 1.2, color: BAD })
    + T(496, py(300) - 6, '300ns limit', { anchor: 'end', fill: BAD })
    + arrow(px(4.7), py(TR(4.7)), px(2.2), py(TR(2.2)), OK)
    + arrow(px(2.2), py(TR(2.2)), px(10), py(TR(10)), BAD)
    + T(150, 246, '(A) 4.7k -> 2.2k: tr drops under the limit', { fill: OK })
    + T(240, 96, '(C) 2.2k -> 10k: tr blows past it', { fill: BAD })
    + T(500, 268, 'Rp', { anchor: 'end', fill: MUTED })
    + T(X0 - 6, 86, 'tr', { anchor: 'end', fill: MUTED })
    + T(10, 292, 'tr = 0.8473 x Rp x Cb. A FAIL means tr is too big, so Rp or Cb must come down.', { fill: INK })
    + T(10, 312, '(B) and (D) both shrink Cb - same formula, the other factor. Only (C) goes up.', { fill: MUTED })
    + '</svg>';
}

/* ---------- q24：MOSFET 六參數 + FOM ---------- */
{
  const rows = [
    ['V(BR)DSS', 'breakdown, >= 1.2 x Vmax'],
    ['RDS(on)', 'conduction loss = I^2 x R'],
    ['Qg', 'gate charge -> switching loss'],
    ['VGS(th)', 'threshold the driver must clear'],
    ['ID(max)', 'continuous drain current'],
    ['SOA', 'safe V x I x time envelope'],
  ];
  let list = '';
  rows.forEach(([sym, txt], i) => {
    const y = 76 + i * 26;
    list += T(10, y, sym, { weight: 'bold' }) + T(96, y, txt, { fill: MUTED });
  });
  // 等 FOM 曲線：R x Q = 定值（越靠左下越好）
  const px = q => 300 + q * 5, py = r => 250 - r * 4;         // q:0..40nC, r:0..40mohm
  const hyper = k => {
    const p = [];
    for (let q = 6; q <= 40; q += 1) { const r = k / q; if (r <= 40) p.push(`${px(q).toFixed(1)},${py(r).toFixed(1)}`); }
    return p.join(' ');
  };
  D.q24 = BG(520, 340)
    + title(520, 'Picking a MOSFET: six numbers and one trade-off')
    + list
    + axes(300, 250, 510, 80)
    + Sym.poly(hyper(200), { w: 2 })
    + Sym.junction(px(10), py(20)) + Sym.junction(px(25), py(8))
    + T(px(10) + 8, py(20) - 6, 'low RDS(on)', { fill: OK })
    + T(px(25) + 8, py(8) - 6, 'low Qg', { fill: OK })
    + T(300, 66, 'FOM = RDS(on) x Qg', { weight: 'bold' })
    + T(510, 268, 'Qg', { anchor: 'end', fill: MUTED })
    + T(294, 86, 'RDS(on)', { anchor: 'end', fill: MUTED })
    + T(10, 292, 'FOM = RDS(on) x Qg, and smaller is better: it prices conduction against switching.', { fill: INK })
    + T(10, 312, 'Low frequency and big current -> chase RDS(on). Fast switching -> chase Qg.', { fill: MUTED })
    + '</svg>';
}

/* ---------- q26：RC 低通 ---------- */
{
  const X0 = 260, X1 = 500, Y0 = 250, Y1 = 90;                // 100Hz..100kHz, 0..-40dB
  const fx = f => X0 + (X1 - X0) * Math.log10(f / 100) / 3;
  const fy = db => Y1 + (-db) * 4;
  const FC = 1 / (2 * Math.PI * 10e3 * 10e-9);                // 1591.5 Hz
  const DECADES = Math.log10(1e5 / FC);                      // fc 到 100kHz 有幾個十倍頻
  const mag = [];
  for (let i = 0; i <= 60; i++) {
    const f = 100 * Math.pow(10, 3 * i / 60);
    mag.push(`${fx(f).toFixed(1)},${fy(-10 * Math.log10(1 + (f / FC) ** 2)).toFixed(1)}`);
  }
  D.q26 = BG(520, 340)
    + title(520, 'RC low-pass: where the corner is and how fast it falls')
    // 左：電路
    + T(14, 124, 'IN', { anchor: 'end', weight: 'bold' })
    + wire(20, 120, 36, 120) + Sym.resistor(60, 120) + wire(84, 120, 140, 120)
    + T(60, 102, 'R 10k', { anchor: 'middle', weight: 'bold' })
    + Sym.junction(140, 120)
    + Sym.capacitor(140, 160) + wire(140, 120, 140, 138) + wire(140, 182, 140, 200) + Sym.ground(140, 214)
    + T(152, 158, 'C 10n', { weight: 'bold' })
    + wire(140, 120, 196, 120) + T(202, 124, 'OUT', { weight: 'bold' })
    + Sym.line(232, 70, 232, 260, { w: 1, color: '#cbd5e1' })
    // 右：波德圖
    + axes(X0, Y0, X1 + 8, Y1 - 10)
    + Sym.line(X0, fy(0), fx(FC), fy(0), { w: 1, color: FAINT })
    + Sym.poly(`${fx(FC).toFixed(1)},${fy(0)} ${X1},${fy(-20 * DECADES).toFixed(1)}`, { w: 1, color: FAINT })
    + Sym.poly(mag.join(' '), { w: 2 })
    + Sym.line(fx(FC), fy(0), fx(FC), Y0, { w: 1, color: FAINT })
    + Sym.junction(fx(FC), fy(-3))
    + T(fx(FC) + 8, fy(-3) - 10, '-3dB at fc', { fill: BAD, weight: 'bold' })   // 離曲線 7px：0.5px 門檻的瀏覽器實測會抓 1.5px 擦邊
    + T(fx(FC), 274, 'fc = 1.59 kHz', { anchor: 'middle', weight: 'bold' })
    + T(496, 160, '-20 dB/dec', { anchor: 'end', fill: MUTED })
    + T(X1 + 8, 268, 'f', { anchor: 'end', fill: MUTED })
    + T(X0 - 6, Y1 - 4, 'gain', { anchor: 'end', fill: MUTED })
    + T(10, 292, 'fc = 1/(2 pi R C) = 1/(2 pi x 10k x 10n) = 1591.5 Hz, and the phase there is -45 deg.', { fill: INK })
    + T(10, 312, '-3dB is half the power (0.707 of the voltage); past fc it falls 20dB per decade.', { fill: MUTED })
    + '</svg>';
}

/* ---------- q27：Setup / Hold ---------- */
{
  const EDGE = 260;
  D.q27 = BG(520, 330)
    + title(520, 'Setup and hold: the window around the sampling edge')
    + T(6, 114, 'CLK', { weight: 'bold' })
    + Sym.poly(`40,130 ${EDGE},130 ${EDGE},90 340,90 340,130 480,130`, { w: 2 })
    + T(6, 204, 'DATA', { weight: 'bold' })
    + Sym.poly(`40,220 200,220 200,180 320,180 320,220 480,220`, { w: 2, color: WARN })
    + `<line x1="${EDGE}" y1="86" x2="${EDGE}" y2="248" stroke="#94a3b8" stroke-width="1.4" stroke-dasharray="5 4"/>`
    + T(268, 82, 'sampling edge', { fill: MUTED })
    + Sym.line(200, 248, EDGE, 248, { w: 1.4, color: OK })
    + Sym.line(200, 244, 200, 252, { w: 1.4, color: OK })
    + Sym.line(EDGE, 244, EDGE, 252, { w: 1.4, color: OK })
    + T(230, 266, 'tsu', { anchor: 'middle', fill: OK, weight: 'bold' })
    + Sym.line(EDGE, 248, 320, 248, { w: 1.4, color: OK })
    + Sym.line(320, 244, 320, 252, { w: 1.4, color: OK })
    + T(290, 266, 'th', { anchor: 'middle', fill: OK, weight: 'bold' })
    + T(340, 200, 'data must sit still across both', { fill: MUTED })
    + T(10, 292, 'Setup slack = Tclk - Tco - Tcomb - tsu >= 0. Fix it with a slower clock or less logic.', { fill: INK })
    + T(10, 312, 'Hold slack = Tco + Tcomb - th >= 0. Fix it with delay. Violate either -> metastability.', { fill: MUTED })
    + '</svg>';
}

module.exports = D;
