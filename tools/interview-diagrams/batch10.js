/**
 * batch10.js — 電路類 A 轉成符號庫風格
 *   q1 / q4  NPN 本體（Sym.npn）+ 四工作區對照表
 *   q10      上管 OFF 的續流路徑（Sym.nmos 本身就畫了體二極體，正好是這題的主角）
 *   q13      Buck 兩相電流路徑
 *   q15      NMOS 反相器 + IN/OUT 波形
 * 版面沿用 batch9 的分帶：標題 20 / 欄標題 46 / 電源軌 66 / 上管 110 / 節點 166 / 下管 215 / 地 264
 */
const { Sym, BG, T, title, wire, hl, INK, MUTED, OK, BAD, WARN, FAINT } = require('./light.js');
const D = {};

/* ---------- q1 / q4：NPN 本體 + 四工作區 ---------- */
{
  const CX = 150, CY = 150;
  const p = Sym.pins.bjt(CX, CY);              // b=(CX-26,CY) c=(CX+8,CY-30) e=(CX+8,CY+30)
  const rows = [
    ['SATURATION', 'fwd', 'fwd', 'VCE(sat) = 0.2V', OK],
    ['ACTIVE', 'fwd', 'rev', 'IC = beta x IB', '#1f4fd1'],
    ['CUTOFF', 'rev', 'rev', 'IC = 0', BAD],
    ['REVERSE ACTIVE', 'rev', 'fwd', 'low gain, rare', WARN],
  ];
  let s = BG(520, 300)
    + title(520, 'NPN bias: the two junctions decide the region')
    + Sym.npn(CX, CY, { showPins: false })
    + wire(p.c[0], p.c[1], p.c[0], 96)
    + T(p.c[0] + 6, 92, 'C', { fill: MUTED })
    + wire(p.e[0], p.e[1], p.e[0], 204)
    + T(p.e[0] + 6, 212, 'E', { fill: MUTED })
    + wire(p.b[0], p.b[1], 96, CY)
    + T(100, 142, 'B', { fill: MUTED })
    // VBC：集極電位 -> 基極電位
    + Sym.line(84, 96, p.c[0], 96, { w: 1.2, color: FAINT })
    + Sym.line(68, CY, 96, CY, { w: 1.2, color: FAINT })
    + Sym.line(84, 96, 84, CY, { w: 1.6, color: '#1f4fd1' })
    + Sym.tri('80,104 88,104 84,96', { color: '#1f4fd1', fill: '#1f4fd1' })
    + Sym.tri('80,142 88,142 84,150', { color: '#1f4fd1', fill: '#1f4fd1' })
    + T(78, 126, 'VBC', { anchor: 'end', weight: 'bold', fill: '#1f4fd1' })
    // VBE：基極電位 -> 射極電位
    + Sym.line(68, 204, p.e[0], 204, { w: 1.2, color: FAINT })
    + Sym.line(68, CY, 68, 204, { w: 1.6, color: OK })
    + Sym.tri('64,158 72,158 68,150', { color: OK, fill: OK })
    + Sym.tri('64,196 72,196 68,204', { color: OK, fill: OK })
    + T(62, 182, 'VBE', { anchor: 'end', weight: 'bold', fill: OK })
    + T(186, 116, 'BC junction', { fill: MUTED })
    + T(186, 196, 'BE junction', { fill: MUTED })
    // 右側對照表
    + Sym.line(268, 56, 268, 232, { w: 1, color: '#cbd5e1' })
    + T(282, 72, 'region', { fill: MUTED })
    + T(430, 72, 'VBE', { anchor: 'middle', fill: MUTED })
    + T(478, 72, 'VBC', { anchor: 'middle', fill: MUTED })
    + Sym.line(280, 80, 508, 80, { w: 1.2, color: FAINT });
  rows.forEach(([name, vbe, vbc, note, col], i) => {
    const y = 106 + i * 30;
    s += T(282, y, name, { fill: col, weight: 'bold' })
      + T(282, y + 15, note, { fill: MUTED })
      + T(430, y, vbe, { anchor: 'middle' })
      + T(478, y, vbc, { anchor: 'middle' });
  });
  s += T(10, 272, 'fwd = that junction conducts (about 0.7V on silicon). rev = it blocks.', { fill: INK })
    + T(10, 292, 'Saturation needs overdrive too: IB above IC/beta, not just VBE past 0.7V.', { fill: MUTED })
    + '</svg>';
  D.q1 = s;
  D.q4 = s;
}

/* ---------- Buck 共用骨架（q10 / q13 都用） ---------- */
const HSY = 112, SWY = 166, LSY = 222;
function buck(x0, o = {}) {
  const cx = x0 + 40, NX = cx + 26;
  const hs = Sym.pins.nmos(cx, HSY), ls = Sym.pins.nmos(cx, LSY);
  return {
    cx, NX, hs, ls,
    body:
      Sym.rail(NX, 66)
      + T(NX + 10, 72, 'VIN', { fill: BAD, weight: 'bold' })
      + Sym.nmos(cx, HSY, { flip: true, showPins: false, color: o.hsColor })
      + wire(NX, 78, hs.s[0], hs.s[1])
      + wire(hs.d[0], hs.d[1], NX, SWY)
      + T(cx - 36, 98, 'HS', { anchor: 'end', weight: 'bold', fill: o.hsLabel || OK })
      + Sym.nmos(cx, LSY, { flip: true, showPins: false })
      + wire(ls.s[0], ls.s[1], NX, SWY)
      + wire(ls.d[0], ls.d[1], NX, 250)
      + T(cx - 36, 208, 'LS', { anchor: 'end', weight: 'bold', fill: o.lsLabel || OK })
      + Sym.junction(NX, SWY)
      + T(NX - 8, SWY - 8, 'SW', { anchor: 'end', weight: 'bold', fill: MUTED })
      + wire(NX, SWY, NX + 24, SWY)
      + Sym.inductor(NX + 48, SWY)
      + T(NX + 48, SWY - 16, 'L', { anchor: 'middle', weight: 'bold' })
      + wire(NX + 72, SWY, NX + 96, SWY)
      + Sym.junction(NX + 96, SWY)
      + Sym.resistor(NX + 96, SWY + 40, { horizontal: false })
      + wire(NX + 96, SWY, NX + 96, SWY + 16)
      + wire(NX + 96, SWY + 64, NX + 96, 250)
      + T(NX + 108, SWY + 44, 'Load', { fill: MUTED })
      + Sym.ground(NX + 96, 264)
      + Sym.ground(NX, 264),
  };
}

/* ---------- q13：兩相電流路徑 ---------- */
{
  const L = buck(20), R = buck(280);
  // 相 1：VIN -> HS -> SW -> L -> 負載 -> 地
  const p1 = `M ${L.NX} 78 V ${SWY} H ${L.NX + 96} V 250`;
  // 相 2：地 -> LS -> SW -> L -> 負載 -> 地（封閉續流迴路）
  const p2 = `M ${R.NX} 250 V ${SWY} H ${R.NX + 96} V 250 H ${R.NX}`;
  D.q13 = BG(520, 330)
    + title(520, 'Buck current path (highlighted = conducting)')
    + T(130, 46, 'Phase 1: HS ON, LS OFF', { size: 12, weight: 'bold', anchor: 'middle', fill: OK })
    + T(390, 46, 'Phase 2: HS OFF, LS ON', { size: 12, weight: 'bold', anchor: 'middle', fill: '#1f4fd1' })
    + Sym.line(258, 58, 258, 276, { w: 1, color: '#cbd5e1' })
    + hl(p1) + L.body
    + hl(p2) + R.body
    + T(10, 296, 'Phase 1: iL rises, di/dt = (VIN - VOUT) / L', { fill: INK })
    + T(10, 316, 'Phase 2: the inductor keeps the current going through LS - di/dt = -VOUT / L', { fill: MUTED })
    + '</svg>';
}

/* ---------- q10：續流路徑（走體二極體） ---------- */
{
  const B = buck(130, { hsLabel: MUTED, lsLabel: MUTED });
  const loop = `M ${B.NX} 250 V ${SWY} H ${B.NX + 96} V 250 H ${B.NX}`;
  D.q10 = BG(520, 330)
    + title(520, 'When HS opens, the inductor current needs a path')
    + hl(loop) + B.body
    + T(B.cx - 36, 128, 'OFF', { anchor: 'end', weight: 'bold', fill: BAD })
    + T(B.NX + 150, 120, 'iL cannot stop instantly:', { fill: INK })
    + T(B.NX + 150, 140, 'V = L x di/dt would spike.', { fill: INK })
    + T(B.NX + 150, 168, 'The LS body diode (drawn', { fill: OK })
    + T(B.NX + 150, 188, 'inside the FET) takes it', { fill: OK })
    + T(B.NX + 150, 208, 'during dead time.', { fill: OK })
    + T(10, 296, 'Sync buck: that path is the LS body diode, VF ~0.7V - lossy, so keep dead time short.', { fill: INK })
    + T(10, 316, 'Non-sync buck: a real Schottky does the same job at VF ~0.3V.', { fill: MUTED })
    + '</svg>';
}

/* ---------- q15：NMOS 反相器 + 波形 ---------- */
{
  const cx = 120, cy = 190, NX = cx + 26;
  const p = Sym.pins.nmos(cx, cy);
  D.q15 = BG(520, 300)
    + title(520, 'NMOS inverter: FET pulls down, resistor pulls up')
    + Sym.rail(NX, 66)
    + T(NX + 10, 72, '5V', { fill: BAD, weight: 'bold' })
    + Sym.resistor(NX, 110, { horizontal: false })
    + T(NX + 12, 106, '10k', { fill: MUTED })
    + wire(NX, 78, NX, 86)
    + wire(NX, 134, NX, 150)
    + Sym.junction(NX, 150)
    + wire(NX, 150, NX + 60, 150)
    + T(NX + 66, 154, 'OUT', { weight: 'bold' })
    + Sym.nmos(cx, cy, { flip: true, showPins: false })
    + wire(p.s[0], p.s[1], NX, 150)
    + wire(p.d[0], p.d[1], NX, 230)
    + Sym.ground(NX, 244)
    + wire(p.g[0], p.g[1], 40, cy)
    + T(34, cy + 4, 'IN', { anchor: 'end', weight: 'bold' })
    // 波形：IN 方波、OUT 反相（下降瞬時、上升帶 RC 斜率）
    + T(276, 92, 'IN', { anchor: 'end', fill: WARN, weight: 'bold' })
    + Sym.poly('284,100 320,100 320,74 374,74 374,100 428,100 428,74 494,74', { w: 2, color: WARN })
    + T(276, 172, 'OUT', { anchor: 'end', fill: '#1f4fd1', weight: 'bold' })
    + Sym.poly('284,154 320,154 320,180 374,180 386,154 428,154 428,180 494,180', { w: 2, color: '#1f4fd1' })
    + T(392, 140, 'slow rise: 10k x Cload', { fill: BAD })
    + T(10, 272, 'IN low -> FET off -> OUT pulled to 5V. IN high -> FET on -> OUT ~0V.', { fill: INK })
    + T(10, 292, 'Static current 5V/10k = 0.5mA while on. Fall is FET-driven, rise is resistor-only.', { fill: MUTED })
    + '</svg>';
}

module.exports = D;
