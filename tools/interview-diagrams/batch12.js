/**
 * batch12.js — flyback 五題（q28–q32）改用符號庫重畫
 *
 * 五題共用同一張返馳充電器底圖，各自疊自己的高亮路徑：
 *   q28 一次側主迴路（黃）＋高壓線段（紅）
 *   q29 二次側整流迴路（黃）
 *   q30 共模雜訊路徑（綠）：Q1 汲極 -> Cps -> 二次側 -> CY -> 一次地
 *   q31 回授路徑（綠）：VOUT -> 分壓 -> TL431 -> 光耦 -> FB
 *   q32 供電路徑（橘）：啟動 Rst 與 AUX 接手兩條
 *
 * 畫布 720x480（720 是 flyback 這組既有的例外寬度，檢查器上限也是 720）。
 *
 * 符號庫沒有的東西，照 light.js 的 diodeV 慣例用同一組筆觸自己組，不包 transform
 * （檢查器讀不到 transform）：
 *   coilV   垂直繞組（Sym.inductor 只有水平版）
 *   capH    水平電容（Sym.capacitor 只有垂直版）；Cps 用它的虛線版
 *   diodeHL 水平二極體、陰極朝左（Sym.diode 固定陰極在右）
 *   fuse    保險絲＝矩形加穿過的導線（IEC 符號，不是偷懶的方框）
 *
 * 兩個刻意的「無點交叉」（標準畫法：沒有實心點就是不相接）：
 *   (450,195) AUX 上端引線跨過汲極引線
 *   (340,352) FB 訊號線跨過一次側地匯流排
 * 交叉點不准放 junction，verify-batch12.js 有斷言。
 */
const { Sym, BG, T, title, wire, hl, INK, MUTED, OK, BAD, WARN, FAINT } = require('./light.js');
const D = {};
const C = Sym.color;

/** 垂直繞組：n 個半圓，dir=-1 凸左、dir=+1 凸右（凸起一律朝離開鐵芯的方向）。 */
const coilV = (x, y0, n, dir) => {
  let d = `M ${x} ${y0}`;
  for (let i = 0; i < n; i++) d += ` A 4.5 4.5 0 1 ${dir > 0 ? 1 : 0} ${x} ${y0 + (i + 1) * 9}`;
  return `<g data-sym="coil"><path d="${d}" fill="none" stroke="${C}" stroke-width="2"/></g>`;
};

/** 水平電容：兩片垂直極板，引線左右出。dashed=true 用於寄生電容 Cps。 */
const capH = (x, y, o = {}) => {
  const dash = o.dashed ? ' stroke-dasharray="4 3"' : '';
  const ln = (x1, y1, x2, y2, w) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.color || C}" stroke-width="${w}" stroke-linecap="round"${dash}/>`;
  return `<g data-sym="capacitor">${ln(x - 22, y, x - 5, y, 2)}${ln(x - 5, y - 11, x - 5, y + 11, 2.6)}`
    + `${ln(x + 5, y - 11, x + 5, y + 11, 2.6)}${ln(x + 5, y, x + 22, y, 2)}</g>`;
};

/** 水平二極體，陰極在左（電流由右往左）。 */
const diodeHL = (x, y) => `<g data-sym="diode">`
  + Sym.line(x + 22, y, x + 8, y, { w: 2 })
  + Sym.tri(`${x + 8},${y - 8} ${x + 8},${y + 8} ${x - 8},${y}`, { fill: 'none', w: 2 })
  + Sym.line(x - 8, y - 8, x - 8, y + 8, { w: 2 })
  + Sym.line(x - 8, y, x - 22, y, { w: 2 })
  + '</g>';

/** 保險絲：導線穿過一個矩形（IEC 符號）。 */
const fuse = (x, y) => `<g data-sym="fuse">`
  + `<rect x="${x - 15}" y="${y - 7}" width="30" height="14" fill="none" stroke="${C}" stroke-width="2"/>`
  + '</g>';

/* ---------- 共用底圖 ---------- */
const base = () => ''
  // --- AC 輸入、保險絲、共模電感 ---
  + T(12, 84, 'L', { anchor: 'end', weight: 'bold' })
  + T(12, 124, 'N', { anchor: 'end', weight: 'bold' })
  + wire(16, 80, 100, 80) + fuse(67, 80) + T(67, 64, 'F1', { anchor: 'middle', weight: 'bold' })
  + wire(16, 120, 100, 120)
  + Sym.inductor(124, 80) + Sym.inductor(124, 120)
  + Sym.line(100, 96, 148, 96, { w: 1.6 }) + Sym.line(100, 104, 148, 104, { w: 1.6 })
  + T(124, 66, 'L1', { anchor: 'middle', weight: 'bold' })
  + T(124, 142, 'CM choke', { anchor: 'middle', fill: MUTED })
  // --- 橋式整流 ---
  + wire(148, 80, 162, 80) + wire(148, 120, 162, 120)
  + Sym.ic(190, 100, { width: 56, height: 70 })
  + T(190, 96, 'BD1', { anchor: 'middle', weight: 'bold' })
  + T(190, 114, 'bridge', { anchor: 'middle', fill: MUTED })
  + T(222, 72, '+', { fill: BAD, weight: 'bold' })
  + T(222, 136, '-', { fill: MUTED, weight: 'bold' })
  // --- 高壓母線與大電容 ---
  + wire(218, 80, 472, 80)
  + T(232, 72, 'HV+ 120-370VDC', { fill: BAD, weight: 'bold' })
  + wire(218, 120, 218, 352)
  + wire(218, 352, 472, 352)
  + T(300, 368, 'PGND', { anchor: 'middle', fill: MUTED })
  + Sym.capacitor(240, 150) + wire(240, 80, 240, 128) + wire(240, 172, 240, 352)
  + Sym.junction(240, 80) + Sym.junction(240, 352)
  + T(254, 120, 'C1', { weight: 'bold' }) + T(254, 136, '400V', { fill: MUTED })
  // --- 啟動電阻與 VDD ---
  + Sym.junction(310, 80) + wire(310, 80, 310, 92)
  + Sym.resistor(310, 116, { horizontal: false }) + wire(310, 140, 310, 225)
  + T(322, 112, 'Rst', { weight: 'bold' }) + T(322, 128, '1M', { fill: MUTED })
  + Sym.junction(310, 170) + Sym.junction(310, 195)
  + wire(310, 170, 278, 170) + Sym.capacitor(278, 196)
  + wire(278, 218, 278, 352) + Sym.junction(278, 352)
  + T(278, 162, 'Cvdd', { anchor: 'middle', fill: MUTED })
  // --- 輔助繞組整流 D2 ---
  + wire(472, 195, 370, 195) + diodeHL(348, 195) + wire(326, 195, 310, 195)
  + T(348, 182, 'D2', { anchor: 'middle', weight: 'bold' })
  // --- 控制 IC（腳名畫在框內：框內文字是該框的標題，檢查器視為合法，也不用跟走線搶空間）---
  + Sym.ic(340, 285, { width: 80, height: 120 })
  + T(340, 244, 'U1', { anchor: 'middle', weight: 'bold' })
  + T(340, 262, 'PWM', { anchor: 'middle', fill: MUTED })
  + T(306, 290, 'VDD', {})
  + T(374, 270, 'GATE', { anchor: 'end' })
  + T(374, 306, 'CS', { anchor: 'end' })
  + T(306, 330, 'FB', {})
  + wire(380, 264, 394, 264)
  + wire(380, 300, 450, 300) + Sym.junction(450, 300)
  + wire(340, 345, 340, 412) + wire(340, 412, 445, 412)
  // --- 主開關與感流電阻 ---
  + wire(472, 172, 472, 178) + wire(472, 178, 450, 178) + wire(450, 178, 450, 244)
  + Sym.nmos(424, 264, { flip: true, showPins: false })
  + T(430, 236, 'Q1', { anchor: 'end', weight: 'bold' })
  + wire(450, 284, 450, 300) + Sym.resistor(450, 324, { horizontal: false }) + wire(450, 348, 450, 352)
  + T(438, 320, 'Rs', { anchor: 'end', weight: 'bold' }) + T(438, 336, '0.5R', { anchor: 'end', fill: MUTED })
  // --- 變壓器 T1：一次 / 輔助（左）、二次（右），中間鐵芯 ---
  + T(490, 76, 'T1', { anchor: 'middle', weight: 'bold' })
  + coilV(472, 100, 8, -1) + coilV(472, 195, 5, -1) + coilV(508, 100, 10, 1)
  + Sym.line(484, 92, 484, 320, { w: 1.6 }) + Sym.line(490, 92, 490, 320, { w: 1.6 })
  + Sym.junction(478, 104) + Sym.junction(478, 236) + Sym.junction(502, 186)
  + T(456, 140, 'P', { anchor: 'end', weight: 'bold' })
  + T(444, 214, 'AUX', { anchor: 'end', weight: 'bold' })
  + T(524, 160, 'S', { weight: 'bold' })
  + wire(472, 240, 472, 352) + Sym.junction(472, 352)
  // 繞組間寄生電容（虛線＝寄生，不是真的零件）
  + capH(490, 130, { dashed: true, color: MUTED })
  + T(524, 134, 'Cps', { fill: MUTED })
  // --- 隔離帶 ---
  + `<line x1="499" y1="58" x2="499" y2="462" stroke="#94a3b8" stroke-width="1.4" stroke-dasharray="6 5"/>`
  + T(499, 52, 'ISOLATION', { anchor: 'middle', weight: 'bold', fill: MUTED })
  // --- 二次側整流與輸出 ---
  + wire(508, 100, 508, 86) + wire(508, 86, 542, 86)
  + Sym.diode(564, 86) + wire(586, 86, 690, 86)
  + T(564, 72, 'D3', { anchor: 'middle', weight: 'bold' })
  + T(690, 74, 'VOUT+', { anchor: 'end', weight: 'bold' })
  + Sym.junction(630, 86) + Sym.capacitor(630, 140)
  + wire(630, 86, 630, 118) + wire(630, 162, 630, 300) + Sym.junction(630, 300)
  + T(646, 136, 'Cout', { weight: 'bold' }) + T(646, 152, '470u', { fill: MUTED })   // 642 距極板只有 1px，瀏覽器實測會判壓線
  + wire(508, 190, 508, 300) + wire(508, 300, 690, 300)
  + T(690, 290, 'VOUT-', { anchor: 'end', weight: 'bold' })
  + T(575, 316, 'SGND', { anchor: 'middle', fill: MUTED })
  // --- Y 電容：跨在一次地與二次地之間 ---
  + wire(472, 352, 472, 380) + capH(494, 380) + wire(516, 380, 516, 300) + Sym.junction(516, 300)
  + T(494, 404, 'CY', { anchor: 'middle', weight: 'bold' })
  // --- 光耦（跨隔離帶）---
  + Sym.ic(490, 400, { width: 90, height: 50 })
  + T(490, 396, 'U2', { anchor: 'middle', weight: 'bold' })
  + T(490, 414, 'opto', { anchor: 'middle', fill: MUTED })
  + wire(445, 388, 420, 388) + wire(420, 388, 420, 352) + Sym.junction(420, 352)
  // --- 回授：分壓、TL431、光耦 LED ---
  + Sym.junction(670, 86) + wire(670, 86, 706, 86) + wire(706, 86, 706, 340)
  + wire(706, 340, 552, 340) + Sym.junction(670, 340)
  + wire(552, 340, 552, 388) + wire(535, 388, 552, 388)
  + Sym.resistor(670, 364, { horizontal: false }) + wire(670, 340, 670, 340)
  + wire(670, 388, 670, 410) + Sym.junction(670, 410)
  + Sym.resistor(670, 434, { horizontal: false }) + wire(670, 458, 545, 458)
  + wire(545, 458, 545, 300) + Sym.junction(545, 300)
  + T(684, 364, 'R1', {}) + T(684, 434, 'R2', {})
  + Sym.ic(600, 400, { width: 56, height: 50 })
  + T(600, 404, 'TL431', { anchor: 'middle', weight: 'bold' })
  + wire(628, 368, 670, 368) + Sym.junction(670, 368)
  + wire(535, 412, 572, 412)
  + wire(600, 425, 600, 440) + wire(600, 440, 545, 440) + Sym.junction(545, 440);

const legend = (color, text) => T(10, 44, text, { fill: color, weight: 'bold' });

/* ---------- q28：一次側主迴路 + 高壓線段 ---------- */
D.q28 = BG(720, 480)
  + title(720, 'Flyback charger: primary main loop and the high-voltage run')
  + hl('M 240 80 H 472 V 178 H 450 V 352 H 240 V 80')
  + hl('M 84 80 H 218 M 84 120 H 218', '#ef4444')
  + hl('M 218 80 H 472 V 178 H 450 V 244', '#ef4444')
  + base()
  + legend(BAD, 'yellow = switching loop   red = high voltage')
  + '</svg>';

/* ---------- q29：二次側整流迴路 ---------- */
D.q29 = BG(720, 480)
  + title(720, 'Flyback charger: the secondary rectification loop')
  + hl('M 508 86 H 630 V 300 H 508 V 86')
  + base()
  + legend(WARN, 'yellow = secondary pulse current')
  + '</svg>';

/* ---------- q30：共模雜訊路徑 ---------- */
D.q30 = BG(720, 480)
  + title(720, 'Flyback charger: where common-mode noise goes')
  + hl('M 450 244 V 178 H 472 V 130 H 508 V 300 H 516 V 380 H 472 V 352', '#16a34a')
  + base()
  + legend(OK, 'green = common-mode current through Cps and CY')
  + '</svg>';

/* ---------- q31：回授路徑 ---------- */
D.q31 = BG(720, 480)
  + title(720, 'Flyback charger: the feedback path to the FB pin')
  + hl('M 630 86 H 706 V 340 H 670 V 410 M 670 368 H 628 M 600 425 V 440', '#16a34a')
  + hl('M 706 340 H 552 V 388 M 535 412 H 572 M 445 412 H 340 V 345', '#16a34a')
  + base()
  + legend(OK, 'green = VOUT -> divider -> TL431 -> opto -> FB')
  + '</svg>';

/* ---------- q32：啟動與輔助供電 ---------- */
D.q32 = BG(720, 480)
  + title(720, 'Flyback charger: start-up supply and the auxiliary takeover')
  + hl('M 310 80 V 225', '#f97316')
  + hl('M 472 195 H 310 V 225', '#f97316')
  + base()
  + legend(WARN, 'orange = start-up through Rst, then AUX takes over')
  + '</svg>';

module.exports = D;
