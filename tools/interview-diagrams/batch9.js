/**
 * batch9.js — q5 / q9 改用符號庫重畫（使用者點名的兩張）
 *   q5 Push-Pull vs Open-Drain：上下管都要是真的 MOSFET，Rp 要是鋸齒電阻
 *   q9 同步 vs 非同步 Buck：HS/LS 是 MOSFET、L 是電感、下管換蕭特基時是真的二極體
 * 配色與版面比照 q3（白底、Sym 藍線條、標籤 11px）。
 *
 * 垂直預算（第一版把電源軌放 y=40，撞到欄標題；元件標籤貼著閘極線也被線穿）：
 *   標題 20 / 欄標題 46 / 電源軌 66 / 上管 ~110 / 節點 ~166 / 下管 ~215 / 地 264 / 說明 290+
 */
const { Sym, BG, T, title, wire, diodeV, INK, MUTED, OK, BAD } = require('./light.js');
const D = {};

/* ---------- q5：Push-Pull vs Open-Drain ---------- */
{
  const TOPY = 110, OUTY = 160, BOTY = 210;
  const half = (cx, opts) => {
    const NX = cx + 26;                        // 汲/源極引線的 x
    const top = Sym.pins.nmos(cx, TOPY);
    const bot = Sym.pins.nmos(cx, BOTY);
    let g = Sym.rail(NX, 66)
      + T(NX + 10, 72, 'VDD', { fill: BAD, weight: 'bold' });
    if (opts.pmos) {
      // PMOS 上管：源極接 VDD（上）、汲極接輸出（下）
      g += Sym.nmos(cx, TOPY, { p: true, showPins: false })
        + wire(NX, 78, top.s[0], top.s[1])
        + wire(top.d[0], top.d[1], NX, OUTY)
        + T(cx - 36, 96, 'P', { anchor: 'end', weight: 'bold', fill: OK })
        + wire(top.g[0], top.g[1], cx - 60, TOPY);
    } else {
      g += Sym.resistor(NX, TOPY, { horizontal: false })
        + wire(NX, 78, NX, TOPY - 24)
        + wire(NX, TOPY + 24, NX, OUTY)
        + T(NX + 12, TOPY - 4, 'Rp', { weight: 'bold', fill: BAD })
        + T(NX + 12, TOPY + 12, opts.rpValue, { fill: MUTED });
    }
    g += Sym.nmos(cx, BOTY, { flip: true, showPins: false })
      + wire(bot.s[0], bot.s[1], NX, OUTY)                 // 汲極 -> 輸出
      + wire(bot.d[0], bot.d[1], NX, 250)                  // 源極 -> 地
      + Sym.ground(NX, 264)
      + T(cx - 36, 196, 'N', { anchor: 'end', weight: 'bold', fill: INK })
      + wire(bot.g[0], bot.g[1], cx - 60, BOTY)
      + Sym.junction(NX, OUTY)
      + wire(NX, OUTY, NX + 60, OUTY)
      + T(NX + 66, OUTY + 4, 'OUT', { weight: 'bold' });
    return g;
  };
  D.q5 = BG(520, 320)
    + title(520, 'Push-Pull vs Open-Drain output stage')
    + T(120, 46, 'Push-Pull', { size: 12, weight: 'bold', anchor: 'middle', fill: OK })
    + T(380, 46, 'Open-Drain', { size: 12, weight: 'bold', anchor: 'middle', fill: BAD })
    + Sym.line(258, 58, 258, 276, { w: 1, color: '#cbd5e1' })
    // 左：互補推挽，IN 同時驅動兩個閘極
    + half(110, { pmos: true })
    + Sym.poly(`50,${TOPY} 50,${BOTY}`, { w: 2 })
    + Sym.junction(50, OUTY)
    + wire(24, OUTY, 50, OUTY)
    + T(18, OUTY + 4, 'IN', { anchor: 'end', weight: 'bold' })
    // 右：只有下管，IN 只驅動它
    + half(370, { pmos: false, rpValue: '4.7k' })
    + wire(284, BOTY, 310, BOTY)
    + T(278, BOTY + 4, 'IN', { anchor: 'end', weight: 'bold' })
    + T(10, 292, 'Push-Pull drives both rails, so two of them must never share a net.', { fill: INK })
    + T(10, 312, 'Open-Drain only sinks. Rp sets the rise time and burns current while LOW - but wire-AND works.', { fill: MUTED })
    + '</svg>';
}

/* ---------- q9：同步 vs 非同步 Buck ---------- */
{
  const HSY = 112, SWY = 166, LSY = 222;
  const side = (x0, lowSide) => {
    const cx = x0 + 40;
    const NX = cx + 26;                        // SW 所在的引線 x
    const hs = Sym.pins.nmos(cx, HSY);
    const ls = Sym.pins.nmos(cx, LSY);
    let g = Sym.rail(NX, 66)
      + T(NX + 10, 72, 'VIN', { fill: BAD, weight: 'bold' })
      + Sym.nmos(cx, HSY, { flip: true, showPins: false })
      + wire(NX, 78, hs.s[0], hs.s[1])                     // VIN -> 汲極
      + wire(hs.d[0], hs.d[1], NX, SWY)                    // 源極 -> SW
      + T(cx - 36, 98, 'HS', { anchor: 'end', weight: 'bold', fill: OK })
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
      + Sym.ground(NX, 264);
    if (lowSide === 'fet') {
      g += Sym.nmos(cx, LSY, { flip: true, showPins: false })
        + wire(ls.s[0], ls.s[1], NX, SWY)                  // 汲極 -> SW
        + wire(ls.d[0], ls.d[1], NX, 250)                  // 源極 -> 地
        + T(cx - 36, 208, 'LS', { anchor: 'end', weight: 'bold', fill: OK });
    } else {
      // 蕭特基：陰極朝上接 SW、陽極接地（續流方向由地往 SW）
      g += diodeV(NX, LSY - 6, { cathodeUp: true })
        + wire(NX, SWY, NX, LSY - 28)
        + wire(NX, LSY + 16, NX, 250)
        + T(NX + 14, LSY - 2, 'D', { weight: 'bold', fill: BAD });
    }
    return g;
  };
  D.q9 = BG(520, 340)
    + title(520, 'Synchronous vs Non-synchronous Buck')
    + T(130, 46, 'Synchronous  (the answer)', { size: 12, weight: 'bold', anchor: 'middle', fill: OK })
    + T(390, 46, 'Non-synchronous', { size: 12, weight: 'bold', anchor: 'middle', fill: MUTED })
    + Sym.line(258, 58, 258, 276, { w: 1, color: '#cbd5e1' })
    + side(20, 'fet')
    + side(280, 'diode')
    + T(10, 306, 'Low side is a MOSFET: drop is ID x RDS(on), so efficiency wins - but it needs dead time.', { fill: INK })
    + T(10, 326, 'Low side is a Schottky: VF 0.3-0.5V whatever the current. Cheaper, worse at low VOUT.', { fill: MUTED })
    + '</svg>';
}

module.exports = D;
