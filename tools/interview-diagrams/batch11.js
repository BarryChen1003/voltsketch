/**
 * batch11.js — 電路類 B 轉成符號庫風格（q6 q8 q11 q19 q21/q33 q25 q36）
 *
 *   q6   I2C 匯流排：開汲極 + 兩顆上拉電阻（鋸齒）+ 一主二從
 *   q8   SPI 串聯電阻：串在驅動端；MISO 的源頭是 Slave，所以電阻在對側
 *   q11  RC Snubber：跨 D-S 的 R+C，右邊配「有/無 snubber」的 VDS 振鈴波形
 *   q19  LDO 損耗：電路 + 功率長條（2.5W 進、1.65W 出、0.85W 變熱）
 *   q21  去耦電容擺放（= q33 同一張）：左邊貼著腳、右邊掛長 stub
 *   q25  Latch-up：寄生 PNPN 等效電路（PNP 要射極朝上，見下方 pnpUp）
 *   q36  SW 節點佈局：高頻迴路高亮、SW 銅面、回授繞開、單點接地
 *
 * 版面沿用 batch9/batch10 的分帶：標題 20 / 欄標題 46 / 電源軌 66 / 上管 110-160 /
 * 節點 ~200 / 地 ~254 / 說明 290+。畫布寬一律 520。
 *
 * 為什麼自己組 pnpUp：Sym.npn({pnp:true}) 的 C 固定在上、E 固定在下，
 * 而 latch-up 的寄生 PNP 是「射極接 VDD（上）、集極接基板（下）」，剛好上下相反。
 * 包 rotate/scale 會讓檢查器讀不到座標（README 已載明），所以照 light.js 的 diodeV 慣例
 * 用同一組筆觸自己組一顆。
 */
const { Sym, BG, T, title, wire, diodeV, hl, INK, MUTED, OK, BAD, WARN, FAINT } = require('./light.js');
const D = {};

/** PNP，射極在上（箭頭畫在射極斜線上、指向基極板 = PNP 定義）。端點與 Sym.npn 對齊：
 *  base=(x-26,y)、emitter=(x+8,y-30)、collector=(x+8,y+30)。 */
const pnpUp = (x, y, o = {}) => {
  const color = o.color || Sym.color, w = 2;
  let g = Sym.line(x - 26, y, x - 12, y, { color, w })
    + Sym.line(x - 12, y - 13, x - 12, y + 13, { color, w: 2.6 })
    + Sym.line(x - 12, y - 5, x + 8, y - 18, { color, w })     // 射極斜線（上）
    + Sym.line(x + 8, y - 18, x + 8, y - 30, { color, w })
    + Sym.line(x - 12, y + 5, x + 8, y + 18, { color, w })     // 集極斜線（下）
    + Sym.line(x + 8, y + 18, x + 8, y + 30, { color, w });
  // 箭頭：沿射極斜線指回基極板（PNP 的電流由射極流入基極）
  g += Sym.tri(`${x + 3.2},${y - 10.1} ${x - 1.2},${y - 16.8} ${x - 5},${y - 9.6}`, { color, fill: color });
  return `<g data-sym="pnp">${g}</g>`;
};

/* ---------- q6：I2C 匯流排 ---------- */
{
  const SCL = 150, SDA = 190, BOXY = 252;
  const dev = (cx, name, sub) => Sym.ic(cx, BOXY, { width: 90, height: 52 })
    + T(cx, BOXY - 6, name, { anchor: 'middle', weight: 'bold' })
    + T(cx, BOXY + 12, sub, { anchor: 'middle', fill: MUTED });
  // 每個裝置：左腳上 SCL、右腳上 SDA（上 SCL 的那條會跨過 SDA，無點=不相接，標準畫法）
  const stubs = cx => wire(cx - 20, BOXY - 26, cx - 20, SCL) + Sym.junction(cx - 20, SCL)
    + wire(cx + 20, BOXY - 26, cx + 20, SDA) + Sym.junction(cx + 20, SDA);

  D.q6 = BG(520, 340)
    + title(520, 'I2C: open-drain bus, the pull-ups do the pulling')
    // VDD 與兩顆上拉電阻
    + Sym.rail(60, 56)
    + T(72, 62, 'VDD', { fill: BAD, weight: 'bold' })
    + wire(60, 68, 60, 80) + wire(60, 80, 110, 80)
    + Sym.resistor(60, 110, { horizontal: false })
    + wire(60, 80, 60, 86) + wire(60, 134, 60, SCL)
    + T(48, 106, 'Rp', { anchor: 'end', weight: 'bold', fill: BAD })
    + T(48, 122, '4.7k', { anchor: 'end', fill: MUTED })
    + Sym.resistor(110, 110, { horizontal: false })
    + wire(110, 80, 110, 86) + wire(110, 134, 110, SDA)
    + T(122, 106, 'Rp', { weight: 'bold', fill: BAD })
    + T(122, 122, '4.7k', { fill: MUTED })
    // 兩條匯流排
    + wire(60, SCL, 470, SCL) + T(476, SCL + 4, 'SCL', { weight: 'bold' })
    + wire(110, SDA, 470, SDA) + T(476, SDA + 4, 'SDA', { weight: 'bold' })
    + T(300, 124, 'SCL: master drives, slave may stretch it low', { anchor: 'middle', fill: MUTED })
    + T(180, 178, 'SDA is bidirectional', { anchor: 'middle', fill: MUTED })
    // 一主二從
    + dev(90, 'Master', 'MCU') + stubs(90)
    + dev(270, 'Slave', '0x48') + stubs(270)
    + dev(430, 'Slave', '0x50') + stubs(430)
    + T(10, 306, 'Open-drain: a device can only pull LOW. Rp does all the pulling HIGH.', { fill: INK })
    + T(10, 326, 'Rp min = (VDD-VOL)/IOL ~ 1k here. Rp max from tr / (0.847 x Cb), Cb <= 400pF.', { fill: MUTED })
    + '</svg>';
}

/* ---------- q8：SPI 串聯電阻 ---------- */
{
  const nets = [[120, 'SCLK'], [158, 'MOSI'], [234, 'CS#']];
  const MISO = 196;
  let g = '';
  for (const [y, name] of nets) {
    g += wire(110, y, 146, y) + Sym.resistor(170, y) + wire(194, y, 415, y)
      + T(300, y - 10, name, { anchor: 'middle' })
      + Sym.tri(`264,${y - 4} 264,${y + 4} 272,${y}`, { fill: Sym.color });   // 主 -> 從
  }
  D.q8 = BG(520, 330)
    + title(520, 'SPI series resistor: it belongs at the driver')
    + T(260, 46, '22-33 ohm, one per line, close to the source', { size: 12, anchor: 'middle', fill: MUTED })
    + Sym.ic(70, 177, { width: 80, height: 150 })
    + T(70, 170, 'Master', { anchor: 'middle', weight: 'bold' })
    + T(70, 188, 'driver', { anchor: 'middle', fill: MUTED })
    + Sym.ic(455, 177, { width: 80, height: 150 })
    + T(455, 170, 'Slave', { anchor: 'middle', weight: 'bold' })
    + T(455, 188, 'flash', { anchor: 'middle', fill: MUTED })
    + g
    // MISO：源頭在 Slave，所以電阻擺到對側
    + wire(110, MISO, 331, MISO) + Sym.resistor(355, MISO) + wire(379, MISO, 415, MISO)
    + T(250, MISO - 10, 'MISO', { anchor: 'middle' })
    + Sym.tri(`276,${MISO - 4} 276,${MISO + 4} 268,${MISO}`, { fill: Sym.color })
    + T(200, 94, 'R at the driver end, not the far end', { fill: WARN })
    + T(140, 220, 'MISO source is the slave', { fill: WARN })
    + T(10, 290, 'R + Rout ~ Z0 at the driver, so the reflected edge dies where it started.', { fill: INK })
    + T(10, 310, 'SCLK, MOSI and CS# are master-driven; MISO is not - its resistor sits at the slave.', { fill: MUTED })
    + '</svg>';
}

/* ---------- q11：RC Snubber ---------- */
{
  // VDS 波形：t=0 在 x=330 關斷，穩態 140（=VIN），無 snubber 的尖峰衝到 70（越過 VBR 線 92）
  const curve = (amp, tau, per) => {
    const pts = ['302,190', '330,190'];
    for (let t = 0; t <= 170; t += 2) {
      const y = 140 - amp * Math.exp(-t / tau) * Math.cos(t / per);
      pts.push(`${330 + t},${y.toFixed(1)}`);
    }
    return pts.join(' ');
  };
  D.q11 = BG(520, 340)
    + title(520, 'RC snubber: what SR2 + SC3 actually do')
    // 左：開關 + 寄生電感 + snubber
    + Sym.rail(40, 66) + T(40, 58, 'VIN', { anchor: 'middle', weight: 'bold', fill: BAD })
    + wire(40, 78, 40, 84) + wire(40, 84, 70, 84)
    + Sym.inductor(94, 84) + T(94, 70, 'Lstray', { anchor: 'middle', fill: MUTED })
    + wire(118, 84, 150, 84) + wire(150, 84, 150, 140)
    + Sym.junction(150, 104)
    + Sym.nmos(124, 160, { flip: true, showPins: false })
    + T(120, 206, 'Q1', { anchor: 'middle' })
    + wire(94, 160, 50, 160) + T(44, 164, 'PWM', { anchor: 'end', weight: 'bold' })
    + wire(150, 180, 150, 240) + Sym.junction(150, 206) + Sym.ground(150, 254)
    // snubber 支路：R 串 C，跨在汲-源之間
    + wire(150, 104, 215, 104)
    + Sym.resistor(215, 132, { horizontal: false })
    + wire(215, 104, 215, 108) + wire(215, 156, 215, 162)
    + Sym.capacitor(215, 184)
    + wire(215, 206, 150, 206)
    + T(227, 128, 'SR2', { weight: 'bold' }) + T(227, 144, '1-10 ohm', { fill: MUTED })
    + T(227, 180, 'SC3', { weight: 'bold' }) + T(227, 196, '100p-1n', { fill: MUTED })
    + Sym.line(284, 60, 284, 260, { w: 1, color: '#cbd5e1' })
    // 右：VDS 波形
    + Sym.line(300, 76, 300, 200, { w: 1.4, color: FAINT })
    + Sym.line(300, 200, 505, 200, { w: 1.4, color: FAINT })
    + T(304, 72, 'VDS', { fill: MUTED })
    + Sym.line(300, 92, 500, 92, { w: 1.2, color: BAD })
    + T(498, 86, 'VBR(DSS)', { anchor: 'end', fill: BAD })
    + Sym.poly(curve(70, 60, 6), { w: 2, color: BAD })
    + Sym.poly(curve(22, 18, 9), { w: 2, color: OK })
    + T(300, 222, 'no snubber: spike + ringing', { fill: BAD })
    + T(300, 240, 'with RC snubber: damped', { fill: OK })
    + T(10, 300, 'Snubber = R + C across drain-source: C takes the Lstray spike, R burns the ring.', { fill: INK })
    + T(10, 320, 'R ~ sqrt(Lstray/Coss), C > 2 x Coss, mounted at the FET pins or it adds its own L.', { fill: MUTED })
    + '</svg>';
}

/* ---------- q19：LDO 損耗 ---------- */
{
  // 功率長條：2.5W 進 = 140px（56px/W）。熱 0.85W -> 48px、輸出 1.65W -> 92px
  const bar = (x, y, h, fill) => `<rect x="${x}" y="${y}" width="40" height="${h}" fill="${fill}" opacity="0.18" stroke="${fill}" stroke-width="1.4"/>`;
  D.q19 = BG(520, 330)
    + title(520, 'LDO at 500mA: the drop becomes heat')
    + Sym.rail(70, 56) + T(82, 62, 'VIN 5V', { weight: 'bold', fill: BAD })
    + wire(70, 68, 70, 120) + wire(70, 120, 125, 120)
    + Sym.ic(180, 120, { width: 110, height: 64 })
    + T(180, 116, 'LDO', { anchor: 'middle', weight: 'bold' })
    + T(180, 134, 'linear pass FET', { anchor: 'middle', fill: MUTED })
    + wire(235, 120, 300, 120) + Sym.junction(300, 120)
    + T(242, 112, '500mA', {})
    + T(306, 116, '3.3V', { fill: OK, weight: 'bold' })
    + Sym.resistor(300, 160, { horizontal: false })
    + wire(300, 120, 300, 136) + wire(300, 184, 300, 200) + Sym.ground(300, 214)
    + T(312, 156, 'load', { fill: MUTED })
    + Sym.line(340, 60, 340, 240, { w: 1, color: '#cbd5e1' })
    + bar(360, 90, 48, BAD) + bar(360, 138, 92, OK)
    + T(380, 80, '2.5W in', { anchor: 'middle' })
    + T(408, 118, '0.85W heat', { fill: BAD })
    + T(408, 188, '1.65W out', { fill: OK })
    + T(380, 250, '66% efficient', { anchor: 'middle', weight: 'bold', fill: OK })
    + T(10, 290, 'Ploss = (VIN - VOUT) x IL = 1.7V x 0.5A = 0.85W, and efficiency is just VOUT/VIN.', { fill: INK })
    + T(10, 310, 'That 0.85W is heat: TJ = 25 + 0.85 x 50 = 67.5 C at 50 C/W. Bigger drop -> use a buck.', { fill: MUTED })
    + '</svg>';
}

/* ---------- q21 / q33：去耦電容擺放 ---------- */
{
  D.q21 = BG(520, 340)
    + title(520, 'Decoupling: what matters is the loop, not the capacitor')
    + T(135, 46, 'right at the pin', { size: 12, anchor: 'middle', weight: 'bold', fill: OK })
    + T(395, 46, 'parked far away', { size: 12, anchor: 'middle', weight: 'bold', fill: BAD })
    + Sym.line(266, 58, 266, 286, { w: 1, color: '#cbd5e1' })
    // 左：plane -> 10u -> 100n -> pin
    + Sym.rail(60, 66) + T(72, 72, 'VDD plane', { fill: MUTED })
    + wire(60, 78, 60, 100) + wire(60, 100, 195, 100)
    + Sym.capacitor(100, 140) + wire(100, 100, 100, 118) + wire(100, 162, 100, 180)
    + Sym.junction(100, 100) + Sym.ground(100, 194)
    + T(88, 144, '10u', { anchor: 'end', fill: MUTED })
    + Sym.capacitor(170, 140) + wire(170, 100, 170, 118) + wire(170, 162, 170, 180)
    + Sym.junction(170, 100) + Sym.ground(170, 194)
    + T(158, 144, '100n', { anchor: 'end', weight: 'bold' })
    + Sym.ic(220, 100, { width: 50, height: 44 }) + T(220, 104, 'IC', { anchor: 'middle', weight: 'bold' })
    + T(100, 222, 'short fat via', { anchor: 'middle', fill: MUTED })
    // 右：掛在長 stub 上的同一顆電容
    + Sym.rail(320, 66) + T(332, 72, 'VDD plane', { fill: MUTED })
    + wire(320, 78, 320, 100) + wire(320, 100, 455, 100)
    + Sym.junction(350, 100) + wire(350, 100, 350, 168)
    + Sym.capacitor(350, 190) + wire(350, 212, 350, 226) + Sym.ground(350, 240)
    + T(362, 150, 'long stub', { fill: BAD })
    + T(362, 166, 'adds ESL', { fill: BAD })
    + Sym.ic(480, 100, { width: 50, height: 44 }) + T(480, 104, 'IC', { anchor: 'middle', weight: 'bold' })
    + T(368, 120, 'too far to help', { fill: BAD })
    + T(10, 306, '100n hugs the pin, 10u sits behind it: plane -> bulk -> ceramic -> pin, never a T-stub.', { fill: INK })
    + T(10, 326, 'One cap per power pin, ground via short and fat - the loop area is the real inductance.', { fill: MUTED })
    + '</svg>';
  D.q33 = D.q21;
}

/* ---------- q25：Latch-up 寄生 PNPN ---------- */
{
  const prevention = [
    '1. Guard rings: P+ to VDD, N+ to GND',
    '2. Power up VDD before any IO pin',
    '3. Series resistor on the IO pin',
    '4. ESD diodes to both rails',
    '5. Dense substrate and well taps',
  ];
  let list = '';
  prevention.forEach((s, i) => { list += T(288, 84 + i * 22, s, {}); });

  D.q25 = BG(520, 360)
    + title(520, 'Latch-up: the parasitic PNPN nobody drew')
    + Sym.line(268, 60, 268, 300, { w: 1, color: '#cbd5e1' })
    // VDD 匯流
    + Sym.rail(200, 74) + T(212, 80, 'VDD', { weight: 'bold', fill: BAD })
    + wire(60, 86, 200, 86)
    // Rwell：VDD -> n-well（= PNP 基極 = NPN 集極）
    + Sym.resistor(60, 116, { horizontal: false })
    + wire(60, 86, 60, 92) + wire(60, 140, 60, 154) + wire(60, 154, 94, 154)
    + T(48, 112, 'Rwell', { anchor: 'end', fill: MUTED })
    // Q1 PNP：射極接 VDD、集極接基板
    + pnpUp(120, 154)
    + wire(128, 124, 128, 86) + Sym.junction(128, 86)
    + T(140, 150, 'Q1 (PNP)', {})
    + wire(128, 184, 128, 222) + wire(128, 222, 174, 222)
    // Q2 NPN：射極接地、集極回 n-well（交叉耦合，這個交叉是本題的重點）
    + Sym.npn(200, 222, { showPins: false })
    + T(214, 196, 'Q2 (NPN)', {})
    + wire(208, 192, 208, 196) + wire(208, 196, 74, 196) + wire(74, 196, 74, 154)
    + Sym.junction(74, 154)
    + wire(208, 252, 208, 286)
    // Rsub：基板電阻
    + Sym.junction(150, 222) + wire(150, 222, 150, 226)
    + Sym.resistor(150, 250, { horizontal: false })
    + wire(150, 274, 150, 286)
    + T(162, 250, 'Rsub', { fill: MUTED })
    + wire(150, 286, 208, 286) + Sym.junction(180, 286) + Sym.ground(180, 300)
    // 觸發：IO 被拉到 GND 以下，往基板注入電流
    + wire(96, 222, 128, 222) + Sym.junction(128, 222)
    + Sym.tri('112,218 112,226 122,222', { color: WARN, fill: WARN })
    + T(20, 214, 'IO pin below GND', { fill: WARN })
    + T(20, 246, 'injects into substrate', { fill: WARN })
    + T(396, 46, 'How to stop it', { size: 12, anchor: 'middle', weight: 'bold', fill: OK })
    + list
    + T(288, 220, 'Once it fires, only a power cycle', { fill: BAD })
    + T(288, 238, 'clears it - the current holds it on.', { fill: BAD })
    + T(10, 324, 'p+/n-well/p-sub/n+ is a thyristor: fire it and VDD shorts to GND through the die.', { fill: INK })
    + T(10, 344, 'Rwell and Rsub are the substrate resistances - guard rings and taps make them small.', { fill: MUTED })
    + '</svg>';
}

/* ---------- q36：SW 節點佈局 ---------- */
{
  D.q36 = BG(520, 340)
    + title(520, 'Switch-node layout: loop, copper, feedback')
    // 高頻迴路（半透明高亮畫在元件底下）
    + hl('M 40 120 H 75 V 150 H 200 V 240 H 40 V 120')
    + Sym.rail(40, 108) + T(40, 98, 'VIN', { anchor: 'middle', weight: 'bold', fill: BAD })
    + wire(40, 120, 75, 120) + Sym.junction(40, 120)
    + Sym.capacitor(40, 168) + wire(40, 120, 40, 146) + wire(40, 190, 40, 240)
    + T(28, 166, 'Cin', { anchor: 'end', fill: MUTED })
    + Sym.ic(120, 150, { width: 90, height: 110 })
    + T(120, 146, 'Buck IC', { anchor: 'middle', weight: 'bold' })
    + T(120, 164, 'controller', { anchor: 'middle', fill: MUTED })
    // SW 節點 -> L -> VOUT
    + wire(165, 150, 206, 150) + T(185, 142, 'SW', { anchor: 'middle', weight: 'bold', fill: BAD })
    + T(215, 128, 'small SW copper', { fill: MUTED })
    + Sym.inductor(230, 150) + T(230, 178, 'L', { anchor: 'middle' })
    + wire(254, 150, 340, 150) + Sym.junction(290, 150) + Sym.junction(200, 150)
    + T(346, 154, 'VOUT', { weight: 'bold' })
    // 續流二極體與輸出電容
    + diodeV(200, 196, { cathodeUp: true }) + wire(200, 150, 200, 174) + wire(200, 218, 200, 240)
    + T(212, 200, 'D', { fill: BAD, weight: 'bold' })
    + Sym.capacitor(290, 196) + wire(290, 150, 290, 174) + wire(290, 218, 290, 240)
    + T(302, 196, 'Cout', { fill: MUTED })
    // 單點接地
    + wire(40, 240, 290, 240) + Sym.junction(200, 240) + Sym.junction(245, 240)
    + Sym.ground(245, 254) + T(258, 258, 'single-point GND', { fill: MUTED })
    + T(60, 230, 'keep this loop small', { fill: WARN })
    // 回授繞到上方，遠離 SW
    + wire(340, 150, 340, 74) + wire(340, 74, 110, 74) + wire(110, 74, 110, 95)
    + T(225, 66, 'feedback routed away from SW', { anchor: 'middle', fill: WARN })
    + T(10, 300, 'The hot loop is Cin -> IC -> SW -> D -> back to Cin. Its area is the EMI antenna.', { fill: INK })
    + T(10, 320, 'Keep SW copper small, feedback far from it, and let the grounds meet at one point.', { fill: MUTED })
    + '</svg>';
}

module.exports = D;
