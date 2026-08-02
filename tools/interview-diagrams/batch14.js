/**
 * batch14.js — 表格/剖面最後八題（q14 q20 q22 q23=q34 q35 q37 q38）
 *
 *   q14 邏輯閘真值表：五個閘用 Sym.gate 畫出來，表格的值由程式算不是手打
 *   q20 ESD：HBM 與 CDM 的等效電路並排 + 差異表
 *   q22 差分阻抗：微帶線剖面（W/S/H/T 按比例畫）+ 兩條公式的實算
 *   q23 差分對規則（與 q34 同圖）：對的走法 vs 跨層/跨分割
 *   q35 回流路徑：完整地平面 vs 挖了槽的地平面，迴路面積差在哪
 *   q37 四層板疊層：剖面 + 每層的角色與間距
 *   q38 散熱：散熱焊盤下的過孔陣列把熱送進內層銅面
 *
 * 剖面圖的比例尺統一 1mil = 8px（q22/q37），這樣 W/S/H 的相對關係是真的按比例，
 * 不是隨手畫的示意圖；verify-batch14.js 會回推座標檢查比例。
 */
const { Sym, BG, T, title, wire, hl, INK, MUTED, OK, BAD, WARN, FAINT } = require('./light.js');
const D = {};

const COPPER = '#1f4fd1', DIEL = '#e2e8f0';
/** 剖面用的實心層：銅是深藍、介質是淺灰。文字一律放在框外或框心。 */
const layer = (x, y, w, h, fill, o = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${o.op ? ` opacity="${o.op}"` : ''}`
  + ` stroke="${o.stroke || fill}" stroke-width="1"/>`;

/* ---------- q14：邏輯閘真值表 ---------- */
{
  const cols = [
    ['AND', (a, b) => a & b, 190],
    ['OR', (a, b) => a | b, 260],
    ['NAND', (a, b) => 1 - (a & b), 330],
    ['NOR', (a, b) => 1 - (a | b), 400],
    ['XOR', (a, b) => a ^ b, 470],
  ];
  let head = '', body = '';
  cols.forEach(([name, , x]) => {
    head += T(x, 52, name, { anchor: 'middle', weight: 'bold' })
      + Sym.gate(x, 76, { type: name.toLowerCase() });
  });
  [[0, 0], [0, 1], [1, 0], [1, 1]].forEach(([a, b], i) => {
    const y = 130 + i * 28;
    body += T(40, y, String(a), { anchor: 'middle' }) + T(90, y, String(b), { anchor: 'middle' });
    cols.forEach(([, f, x]) => { body += T(x, y, String(f(a, b)), { anchor: 'middle' }); });
  });
  D.q14 = BG(520, 330)
    + title(520, 'Truth table, and the gate that draws each column')
    + head
    + T(40, 96, 'A', { anchor: 'middle', weight: 'bold' }) + T(90, 96, 'B', { anchor: 'middle', weight: 'bold' })
    + Sym.line(20, 104, 500, 104, { w: 1.2, color: FAINT })
    + Sym.line(120, 60, 120, 228, { w: 1, color: FAINT })
    + body
    + T(10, 270, 'NAND is the universal gate: wire enough of them and you get every other one.', { fill: INK })
    + T(10, 290, 'XOR is the disagreement detector - it outputs 1 only when the inputs differ.', { fill: MUTED })
    + '</svg>';
}

/* ---------- q20：ESD 的 HBM 與 CDM ---------- */
{
  const rowY = [232, 254, 276];
  const rows = [
    ['discharge time', '~150ns', '~1ns  (much faster)'],
    ['typical class', '2000V  (Class 2)', '500V  (Class C4)'],
    ['what it kills', 'junction burn-out', 'gate oxide punch-through'],
  ];
  let table = T(190, 210, 'HBM', { weight: 'bold', fill: BAD }) + T(340, 210, 'CDM', { weight: 'bold', fill: WARN });
  rows.forEach(([k, a, b], i) => {
    table += T(10, rowY[i], k, { fill: MUTED }) + T(190, rowY[i], a, {}) + T(340, rowY[i], b, {});
  });
  D.q20 = BG(520, 340)
    + title(520, 'ESD: the same energy, two very different models')
    + Sym.line(258, 60, 258, 196, { w: 1, color: '#cbd5e1' })
    + Sym.line(10, 190, 510, 190, { w: 1.2, color: FAINT })
    // HBM：人體電容 100pF 經 1.5k 打進 DUT
    + T(130, 46, 'HBM: a person touches the pin', { size: 12, anchor: 'middle', weight: 'bold', fill: BAD })
    + Sym.capacitor(60, 110) + T(46, 106, '100pF', { anchor: 'end', fill: MUTED })
    + wire(60, 88, 60, 80) + wire(60, 80, 96, 80)
    + Sym.resistor(120, 80) + T(120, 62, '1.5k', { anchor: 'middle', fill: MUTED })
    + wire(144, 80, 162, 80) + wire(162, 80, 162, 110) + wire(162, 110, 180, 110)
    + Sym.ic(206, 110, { width: 52, height: 60 }) + T(206, 114, 'DUT', { anchor: 'middle', weight: 'bold' })
    + wire(60, 132, 60, 156) + Sym.ground(60, 170)
    + wire(206, 140, 206, 156) + Sym.ground(206, 170)
    // CDM：IC 自己帶電，經封裝電容瞬間洩掉
    + T(390, 46, 'CDM: the part itself is charged', { size: 12, anchor: 'middle', weight: 'bold', fill: WARN })
    + Sym.ic(330, 110, { width: 52, height: 60 }) + T(330, 114, 'DUT', { anchor: 'middle', weight: 'bold' })
    + wire(356, 110, 400, 110) + Sym.capacitor(400, 132) + T(412, 140, '1-30pF', { fill: MUTED })
    + wire(400, 154, 400, 156) + Sym.ground(400, 170)
    + wire(330, 140, 330, 156) + Sym.ground(330, 170)
    + T(420, 100, 'discharges', { fill: MUTED }) + T(420, 116, 'through ~1 ohm', { fill: MUTED })
    + table
    + T(10, 308, 'HBM is slow and resistive; CDM dumps the package charge in about a nanosecond.', { fill: INK })
    + T(10, 328, 'Guard at the connector: TVS to the rails, guard rings, short traces, no long stubs.', { fill: MUTED })
    + '</svg>';
}

/* ---------- q22：微帶線差分阻抗 ---------- */
{
  const MIL = 8;                                   // 比例尺：1mil = 8px
  const W = 5 * MIL, S = 5 * MIL, H = 4 * MIL, TH = 1.2 * MIL;
  const X = 60, TOPY = 140;                        // 走線頂面
  const er = 4.2;
  const Z0 = 87 / Math.sqrt(er + 1.41) * Math.log(5.98 * 4 / (0.8 * 5 + 1.2));
  const ZD = 2 * Z0 * (1 - 0.48 * Math.exp(-0.96 * 5 / 4));
  D.q22 = BG(520, 330)
    + title(520, 'Microstrip pair: from geometry to 96 ohm')
    // 剖面：兩條走線 / 介質 / 地平面
    + layer(X - 40, TOPY + TH, 300, H, DIEL, { stroke: '#cbd5e1' })
    + layer(X - 40, TOPY + TH + H, 300, 10, COPPER, { op: 0.85 })
    + layer(X, TOPY, W, TH, COPPER)
    + layer(X + W + S, TOPY, W, TH, COPPER)
    + T(X + W / 2, TOPY - 10, 'W 5mil', { anchor: 'middle' })
    + T(X + W + S / 2, TOPY - 28, 'S 5mil', { anchor: 'middle' })
    + T(X + W + S + W / 2, TOPY - 10, 'W 5mil', { anchor: 'middle' })
    + T(X + 20, TOPY + TH + H / 2 + 4, 'H 4mil', { anchor: 'middle', fill: MUTED })
    + T(X + 200, TOPY + TH + H / 2 + 4, 'er 4.2', { anchor: 'middle', fill: MUTED })
    + T(X + 130, TOPY + TH + H + 26, 'solid GND plane', { anchor: 'middle', fill: MUTED })
    + T(X + 270, TOPY + 6, 'T 1.2mil', {})
    + T(10, 238, `Z0 = 87/sqrt(er+1.41) x ln(5.98H / (0.8W+T)) = 36.7 x ln(4.6) = ${Z0.toFixed(0)} ohm`, { fill: INK })
    + T(10, 260, `Zdiff = 2 x Z0 x (1 - 0.48 x exp(-0.96 S/H)) = 112 x 0.855 = ${ZD.toFixed(0)} ohm`, { fill: INK })
    + T(10, 292, 'USB asks for 90 ohm +/-10% (81-99), so 96 passes - but it sits on the high side.', { fill: MUTED })
    + T(10, 312, 'Widen W or tighten S to pull it back to centre, then confirm in a field solver.', { fill: MUTED })
    + '</svg>';
}

/* ---------- q23 / q34：差分對走線 ---------- */
{
  const good = layer(20, 92, 230, 120, DIEL, { stroke: '#cbd5e1' })
    + T(135, 108, 'continuous reference plane', { anchor: 'middle', fill: MUTED })
    // 這兩條是真的等長（226.6px）且處處等距（垂直 16px = 斜段的垂距）：
    // 45 度轉角若照抄「y 加 16」，斜段的垂距會變成 19.8，圖就對不起自己的標題。
    // 第二條的轉折點，是把第一條的線往法線方向平移 16 之後再求交點算出來的。
    + Sym.poly('30,140 90,140 130,180 240,180', { w: 2, color: OK })
    + Sym.poly('30,156 83.4,156 123.4,196 240,196', { w: 2, color: OK })
    + T(135, 232, 'same layer, matched length, fixed gap', { anchor: 'middle', fill: OK });
  const bad = layer(270, 92, 105, 120, DIEL, { stroke: '#cbd5e1' })
    + layer(395, 92, 105, 120, DIEL, { stroke: '#cbd5e1' })
    + T(385, 84, 'crossing a split or changing layers', { anchor: 'middle', fill: BAD })
    + Sym.poly('280,140 490,140', { w: 2, color: BAD })
    + Sym.poly('280,156 490,156', { w: 2, color: BAD })
    + Sym.junction(430, 196) + Sym.junction(452, 196)
    + T(441, 228, 'vias to another layer', { anchor: 'middle', fill: BAD });
  D.q23 = BG(520, 340)
    + title(520, 'Differential pair: what actually keeps the impedance')
    + T(10, 46, 'answer: (C) matched length, fixed gap', { fill: OK, weight: 'bold' })
    + Sym.line(258, 60, 258, 250, { w: 1, color: '#cbd5e1' })
    + good + bad
    + T(10, 286, '(C) equal length kills skew and a fixed gap keeps the coupling, so Zdiff stays put.', { fill: INK })
    + T(10, 306, '(A) and (D) both break the reference: split layers or no plane means no controlled Z0.', { fill: MUTED })
    + T(10, 326, '(B) is a myth - what matters is the plane underneath, not the copper beside the pair.', { fill: MUTED })
    + '</svg>';
  D.q34 = D.q23;
}

/* ---------- q35：回流路徑 ---------- */
{
  D.q35 = BG(520, 340)
    + title(520, 'Return current takes the smallest loop, not the shortest path')
    + Sym.line(258, 60, 258, 250, { w: 1, color: '#cbd5e1' })
    + T(135, 46, 'solid plane', { size: 12, anchor: 'middle', weight: 'bold', fill: OK })
    + T(390, 46, 'plane with a slot', { size: 12, anchor: 'middle', weight: 'bold', fill: BAD })
    // 左：完整平面，回流就在走線正下方
    + hl('M 30 116 H 240 V 152 H 30 V 116', '#16a34a')
    + Sym.poly('30,116 240,116', { w: 2 })
    + layer(20, 146, 230, 12, COPPER, { op: 0.85 })
    + T(135, 104, 'signal', { anchor: 'middle', fill: MUTED })
    + T(135, 184, 'return sits right under it', { anchor: 'middle', fill: OK })
    + T(135, 204, 'small loop = low EMI', { anchor: 'middle', fill: MUTED })
    // 右：平面被挖開，回流必須繞
    + hl('M 280 116 H 490 V 152 H 430 V 230 H 340 V 152 H 280 V 116', '#b91c1c')
    + Sym.poly('280,116 490,116', { w: 2 })
    + layer(270, 146, 60, 12, COPPER, { op: 0.85 })
    + layer(440, 146, 60, 12, COPPER, { op: 0.85 })
    + T(385, 104, 'signal', { anchor: 'middle', fill: MUTED })
    + T(385, 140, 'slot', { anchor: 'middle', fill: BAD })
    + T(385, 246, 'return has to go around', { anchor: 'middle', fill: BAD })
    + T(10, 286, 'Above a few MHz the return hugs the trace, so the loop is trace-to-plane spacing.', { fill: INK })
    + T(10, 306, 'Slot the plane and the loop opens up: EMI, crosstalk and ringing all follow it.', { fill: MUTED })
    + T(10, 326, 'Changing layers? Put a stitching via next to the signal via or the loop opens again.', { fill: MUTED })
    + '</svg>';
}

/* ---------- q37：四層板疊層 ---------- */
{
  const X = 40, WD = 240, MIL = 8;
  // 厚度（mil）：銅 1.4、prepreg 4、core 40（畫圖時 core 壓縮，比例另外標）
  const L1 = 86, PRE1 = L1 + 12, L2 = PRE1 + 32, CORE = L2 + 12, L3 = CORE + 56, PRE2 = L3 + 12, L4 = PRE2 + 32;
  const cu = (y, name, note, color) => layer(X, y, WD, 12, COPPER, { op: 0.85 })
    + T(X + WD + 12, y + 9, name, { weight: 'bold', fill: color || INK })
    + (note ? T(X + WD + 12, y + 25, note, { fill: MUTED }) : '');
  D.q37 = BG(520, 340)
    + title(520, 'Four-layer stackup: every signal next to a plane')
    + layer(X, PRE1, WD, 32, DIEL, { stroke: '#cbd5e1' })
    + layer(X, CORE, WD, 56, DIEL, { stroke: '#cbd5e1' })
    + layer(X, PRE2, WD, 32, DIEL, { stroke: '#cbd5e1' })
    + cu(L1, 'L1  signal', 'high-speed lives here')
    + cu(L2, 'L2  GND', 'solid, no splits', OK)
    + cu(L3, 'L3  power', 'planes, not traces')
    + cu(L4, 'L4  signal', 'slow stuff, connectors')
    + T(X + WD / 2, PRE1 + 20, 'prepreg 4mil', { anchor: 'middle', fill: MUTED })
    + T(X + WD / 2, CORE + 32, 'core', { anchor: 'middle', fill: MUTED })
    + T(X + WD / 2, PRE2 + 20, 'prepreg 4mil', { anchor: 'middle', fill: MUTED })
    + T(10, 286, 'Signal-GND-PWR-Signal: both signal layers get a plane one prepreg away, so Z0 and', { fill: INK })
    + T(10, 306, 'the return path are defined. Thin prepreg sets the impedance you can actually hit.', { fill: INK })
    + T(10, 326, 'Keep the GND-PWR core thin if you want plane capacitance out of the stackup.', { fill: MUTED })
    + '</svg>';
}

/* ---------- q38：散熱 ---------- */
{
  const X = 60, WD = 250;
  const PADY = 120, BOARD = 150, BOTY = 210;
  let vias = '';
  for (let i = 0; i < 6; i++) {
    const vx = X + 30 + i * 24;
    vias += layer(vx - 4, BOARD, 8, BOTY - BOARD, COPPER, { op: 0.85 });
  }
  D.q38 = BG(520, 340)
    + title(520, 'Getting heat out of a PCB: vias into copper')
    // 元件本體與散熱焊盤
    + Sym.ic(X + 90, 96, { width: 130, height: 40 })
    + T(X + 90, 100, 'power part', { anchor: 'middle', weight: 'bold' })
    + layer(X + 25, PADY, 130, 10, COPPER)
    + T(X + 200, PADY + 9, 'thermal pad', { fill: MUTED })
    // 板材、過孔陣列、底層大銅面
    + layer(X - 20, BOARD, WD, BOTY - BOARD, DIEL, { stroke: '#cbd5e1' })
    + vias
    + layer(X - 20, BOTY, WD, 12, COPPER, { op: 0.85 })
    + T(X + 200, BOARD + 26, 'via array', { fill: MUTED })
    + T(X + 105, BOTY + 30, 'inner / bottom copper spreads it', { anchor: 'middle', fill: MUTED })
    // 氣流
    + Sym.line(X - 40, 262, X + 210, 262, { w: 2, color: WARN })
    + Sym.tri(`${X + 210},${262} ${X + 200},${257} ${X + 200},${267}`, { color: WARN, fill: WARN })
    + T(X + 220, 266, 'airflow', { fill: WARN })
    + T(10, 296, 'Vias under the pad are the low-resistance path into the planes: more vias, more copper,', { fill: INK })
    + T(10, 316, 'lower RthJA. Spread the hot parts out so none of them sits in another one is wake.', { fill: MUTED })
    + '</svg>';
}

module.exports = D;
