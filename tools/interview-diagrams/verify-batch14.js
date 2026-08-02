/** verify-batch14.js — 表格/剖面八題（q14 q20 q22 q23=q34 q35 q37 q38）
 *  重疊交給 interview-diagram-check.js；這裡驗表格的值、剖面的比例、路徑的面積。 */
const D = require('./batch14.js');
let fail = 0;
const ok = (n, c, d) => { console.log((c ? 'PASS ' : 'FAIL ') + n + (d ? '  ' + d : '')); if (!c) fail++; };
const count = (s, re) => (s.match(re) || []).length;
const rects = s => [...s.matchAll(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"[^>]*fill="([^"]+)"/g)]
  .map(m => ({ x: +m[1], y: +m[2], w: +m[3], h: +m[4], fill: m[5] }));
const polys = (s, color) => [...s.matchAll(/<polyline points="([^"]+)"[^>]*stroke="([^"]+)"/g)]
  .filter(m => !color || m[2] === color).map(m => m[1].trim().split(/\s+/).map(p => p.split(',').map(Number)));
/** 把 M/H/V 路徑轉成點串，並算封閉多邊形面積（鞋帶公式）。 */
const pathPts = d => {
  const out = []; let cx = 0, cy = 0;
  d.replace(/([MHV])\s*([-\d.\s]+)/g, (_, c, a) => {
    const n = a.trim().split(/\s+/).map(Number);
    if (c === 'M') { cx = n[0]; cy = n[1]; out.push([cx, cy]); }
    else if (c === 'H') n.forEach(v => { cx = v; out.push([cx, cy]); });
    else n.forEach(v => { cy = v; out.push([cx, cy]); });
    return '';
  });
  return out;
};
const area = pts => Math.abs(pts.reduce((a, p, i) => {
  const q = pts[(i + 1) % pts.length]; return a + p[0] * q[1] - q[0] * p[1];
}, 0)) / 2;
const len = pts => pts.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);

/* ---------- 共同規格 ---------- */
for (const [id, svg] of Object.entries(D)) {
  const f = [...svg.matchAll(/font-size="([\d.]+)"/g)].map(m => +m[1]);
  ok(id + ' 白底 + width 520 + 字級>=11',
    /<rect width="520" height="\d+" fill="#ffffff"\/>/.test(svg) && /<svg width="520"/.test(svg) && Math.min(...f) >= 11);
  ok(id + ' 沒有舊的深色手繪配色', !/#0a0a1a|#00d4ff|#c8d4ee|#ffc107/.test(svg));
}

/* ---------- q14：真值表 ---------- */
{
  const s = D.q14;
  ok('q14 五個閘都用符號庫畫', count(s, /data-sym="gate"/g) === 5);
  ok('q14 只有 NAND 與 NOR 帶反相泡泡', count(s, /<circle cx="[\d.]+" cy="[\d.]+" r="4"/g) === 2);
  const cols = [['AND', 190, (a, b) => a & b], ['OR', 260, (a, b) => a | b], ['NAND', 330, (a, b) => 1 - (a & b)],
  ['NOR', 400, (a, b) => 1 - (a | b)], ['XOR', 470, (a, b) => a ^ b]];
  cols.forEach(([name, x]) => ok('q14 欄標題 ' + name + ' 在 x=' + x,
    new RegExp(`<text x="${x}" y="52"[^>]*>${name}<`).test(s)));
  const cell = (x, y) => (s.match(new RegExp(`<text x="${x}" y="${y}"[^>]*>([01])<`)) || [])[1];
  const rowsY = [130, 158, 186, 214], inputs = [[0, 0], [0, 1], [1, 0], [1, 1]];
  let bad = [];
  inputs.forEach(([a, b], i) => {
    if (+cell(40, rowsY[i]) !== a || +cell(90, rowsY[i]) !== b) bad.push(`inputs row${i}`);
    cols.forEach(([name, x, f]) => { if (+cell(x, rowsY[i]) !== f(a, b)) bad.push(`${name} row${i}`); });
  });
  ok('q14 20 格輸出全部等於真值表算出來的值', bad.length === 0, bad.join(' '));
  ok('q14 點出 NAND 是萬用閘、XOR 是相異偵測', /universal gate/.test(s) && /disagreement detector/.test(s));
}

/* ---------- q20：ESD ---------- */
{
  const s = D.q20;
  ok('q20 HBM 是電容串電阻打進 DUT',
    /data-sym="capacitor"/.test(s) && /data-sym="resistor"/.test(s) && />100pF</.test(s) && />1\.5k</.test(s));
  // 圖上的「~150ns」不是隨手寫的：100pF x 1.5k = 150ns
  const tau = 100e-12 * 1.5e3 * 1e9;
  ok('q20 HBM 的 ~150ns 就是 100pF x 1.5k', Math.abs(tau - 150) < 1e-9 && /~150ns/.test(s), tau + 'ns');
  ok('q20 CDM 只有封裝電容、沒有 1.5k 串阻', />1-30pF</.test(s) && /through ~1 ohm/.test(s));
  ok('q20 CDM 比 HBM 快很多', /~1ns/.test(s) && /much faster/.test(s));
  ok('q20 兩種等級與損傷型態都列了',
    /2000V/.test(s) && /500V/.test(s) && /junction burn-out/.test(s) && /oxide punch-through/.test(s));
  ok('q20 兩顆 DUT 各自接地（兩邊都是完整迴路）', count(s, /data-sym="ground"/g) === 4);
}

/* ---------- q22：微帶線 ---------- */
{
  const s = D.q22, MIL = 8;
  const r = rects(s).filter(x => x.fill !== '#ffffff');
  const traces = r.filter(x => x.w === 5 * MIL && Math.abs(x.h - 1.2 * MIL) < 0.1);
  ok('q22 兩條走線寬度 = W 5mil（比例尺 8px/mil）', traces.length === 2, JSON.stringify(traces.map(t => t.w)));
  ok('q22 線距 = S 5mil', traces.length === 2 && Math.abs((traces[1].x - (traces[0].x + traces[0].w)) - 5 * MIL) < 0.1,
    traces.length === 2 ? String(traces[1].x - traces[0].x - traces[0].w) : '');
  const diel = r.find(x => x.fill === '#e2e8f0');
  ok('q22 介質厚度 = H 4mil', Math.abs(diel.h - 4 * MIL) < 0.1, String(diel.h));
  ok('q22 走線厚度 = T 1.2mil', Math.abs(traces[0].h - 1.2 * MIL) < 0.1);
  ok('q22 走線坐在介質上、介質坐在地平面上',
    Math.abs(traces[0].y + traces[0].h - diel.y) < 0.1 &&
    r.some(x => x.fill === '#1f4fd1' && Math.abs(x.y - (diel.y + diel.h)) < 0.1));
  // 兩條公式實算，與圖上的數字比對
  const er = 4.2;
  const Z0 = 87 / Math.sqrt(er + 1.41) * Math.log(5.98 * 4 / (0.8 * 5 + 1.2));
  const ZD = 2 * Z0 * (1 - 0.48 * Math.exp(-0.96 * 5 / 4));
  ok('q22 Z0 = 56 ohm（公式實算）', Math.abs(Z0 - 56) < 0.5 && new RegExp(`= ${Z0.toFixed(0)} ohm`).test(s), Z0.toFixed(2));
  ok('q22 Zdiff = 96 ohm（公式實算）', Math.abs(ZD - 96) < 0.5 && new RegExp(`= ${ZD.toFixed(0)} ohm`).test(s), ZD.toFixed(2));
  ok('q22 96 落在 USB 的 90 +/-10% 窗內，但偏高', ZD > 90 && ZD < 99 && /high side/.test(s));
}

/* ---------- q23 / q34：差分對 ---------- */
{
  const s = D.q23;
  ok('q23 與 q34 同一張', D.q34 === D.q23);
  const good = polys(s, '#15803d');
  ok('q23 好的那組是兩條走線', good.length === 2);
  const [a, b] = good;
  ok('q23 兩條真的等長（差 < 0.5px）', Math.abs(len(a) - len(b)) < 0.5,
    `${len(a).toFixed(1)} vs ${len(b).toFixed(1)}`);
  // 處處等距：每一段的法向距離都要是 16
  const gaps = a.slice(1).map((p, i) => {
    const dx = p[0] - a[i][0], dy = p[1] - a[i][1], L = Math.hypot(dx, dy);
    // b 的對應段起點到 a 這一段所在直線的距離
    const q = b[i];
    return Math.abs((q[0] - a[i][0]) * dy - (q[1] - a[i][1]) * dx) / L;
  });
  ok('q23 三段的間距都是 16px（等距）', gaps.every(g => Math.abs(g - 16) < 0.3), gaps.map(g => g.toFixed(2)).join(' '));
  const bad = polys(s, '#b91c1c');
  ok('q23 壞的那組跨過平面的裂縫', bad.length === 2 && bad.every(p => p[0][0] < 375 && p[1][0] > 395));
  const rr = rects(s).filter(x => x.fill === '#e2e8f0');
  ok('q23 左邊是完整平面、右邊被切成兩塊', rr.length === 3 && rr[0].w === 230 && rr[1].w === 105 && rr[2].w === 105);
  ok('q23 答案標成 (C)，並逐項說明 A/B/D', /answer: \(C\)/.test(s) && /\(A\) and \(D\)/.test(s) && /\(B\) is a myth/.test(s));
}

/* ---------- q35：回流路徑 ---------- */
{
  const s = D.q35;
  const hls = [...s.matchAll(/<path d="([^"]+)" fill="none" stroke="(#16a34a|#b91c1c)"/g)].map(m => ({ d: m[1], c: m[2] }));
  ok('q35 兩條回流路徑（完整平面 / 挖槽）', hls.length === 2);
  const g = pathPts(hls.find(h => h.c === '#16a34a').d), b = pathPts(hls.find(h => h.c === '#b91c1c').d);
  const ag = area(g), ab = area(b);
  ok('q35 挖槽那邊的迴路面積明顯更大（至少 1.5 倍）', ab > ag * 1.5, `${ag.toFixed(0)} -> ${ab.toFixed(0)}`);
  ok('q35 完整平面時回流就在走線正下方（迴路高度 = 走線到平面的距離）',
    Math.abs(Math.max(...g.map(p => p[1])) - Math.min(...g.map(p => p[1])) - 36) < 0.1);
  const planes = rects(s).filter(x => x.fill === '#1f4fd1');
  ok('q35 左邊一整片、右邊兩片（中間是槽）',
    planes.length === 3 && planes[0].w === 230 && planes[1].w === 60 && planes[2].w === 60);
  ok('q35 槽的位置就在訊號正下方', planes[1].x + planes[1].w < 385 && planes[2].x > 385);
  ok('q35 交代換層要補回流過孔', /stitching via/.test(s));
}

/* ---------- q37：四層板 ---------- */
{
  const s = D.q37;
  const cu = rects(s).filter(x => x.fill === '#1f4fd1').sort((a, b) => a.y - b.y);
  const di = rects(s).filter(x => x.fill === '#e2e8f0').sort((a, b) => a.y - b.y);
  ok('q37 四層銅、三層介質', cu.length === 4 && di.length === 3);
  ok('q37 由上到下是 L1 訊號 / L2 地 / L3 電源 / L4 訊號',
    /L1  signal/.test(s) && /L2  GND/.test(s) && /L3  power/.test(s) && /L4  signal/.test(s));
  const gapAbove = cu[1].y - (cu[0].y + cu[0].h), gapBelow = cu[3].y - (cu[2].y + cu[2].h);
  ok('q37 兩層訊號都只隔一層 prepreg 就碰到平面', gapAbove === 32 && gapBelow === 32, `${gapAbove} / ${gapBelow}`);
  const core = cu[2].y - (cu[1].y + cu[1].h);
  ok('q37 GND 與 PWR 之間是較厚的 core', core > gapAbove, `core ${core} > prepreg ${gapAbove}`);
  ok('q37 講到平面電容與阻抗都靠這個間距', /plane capacitance/.test(s) && /Thin prepreg sets the impedance/.test(s));
}

/* ---------- q38：散熱 ---------- */
{
  const s = D.q38;
  const vias = rects(s).filter(x => x.w === 8 && x.fill === '#1f4fd1');
  ok('q38 散熱過孔陣列（6 個）', vias.length === 6, vias.length + ' 個');
  const board = rects(s).find(x => x.fill === '#e2e8f0');
  const bottom = rects(s).filter(x => x.fill === '#1f4fd1' && x.w > 100).sort((a, b) => b.y - a.y)[0];
  ok('q38 過孔從板子上緣一路穿到底層銅面',
    vias.every(v => Math.abs(v.y - board.y) < 0.1 && Math.abs(v.y + v.h - bottom.y) < 0.1));
  const pad = rects(s).find(x => x.fill === '#1f4fd1' && x.w === 130);
  ok('q38 過孔都落在散熱焊盤下方', vias.every(v => v.x >= pad.x && v.x + v.w <= pad.x + pad.w));
  ok('q38 有氣流方向與分散擺放的提醒', /airflow/.test(s) && /Spread the hot parts out/.test(s));
  ok('q38 點名 RthJA 是被過孔與銅面決定的', /lower RthJA/.test(s) && /more vias, more copper/.test(s));
}

console.log('\n' + (fail ? 'FAILED ' + fail : 'ALL PASS'));
process.exit(fail ? 1 : 0);
