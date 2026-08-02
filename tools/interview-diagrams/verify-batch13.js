/** verify-batch13.js — 波形/曲線八題（q7 q12 q16 q17 q18 q24 q26 q27）
 *  重疊交給 interview-diagram-check.js；這裡驗「畫的數字與波形對不對」。 */
const D = require('./batch13.js');
let fail = 0;
const ok = (n, c, d) => { console.log((c ? 'PASS ' : 'FAIL ') + n + (d ? '  ' + d : '')); if (!c) fail++; };
const polys = (s, color) => [...s.matchAll(/<polyline points="([^"]+)"[^>]*stroke="([^"]+)"/g)]
  .filter(m => !color || m[2] === color)
  .map(m => m[1].trim().split(/\s+/).map(p => p.split(',').map(Number)));
const tris = s => [...s.matchAll(/<polygon points="([^"]+)"/g)].map(m => m[1].split(' ').map(p => p.split(',').map(Number)));

/* ---------- 共同規格 ---------- */
for (const [id, svg] of Object.entries(D)) {
  const f = [...svg.matchAll(/font-size="([\d.]+)"/g)].map(m => +m[1]);
  ok(id + ' 白底 + width 520 + 字級>=11',
    /<rect width="520" height="\d+" fill="#ffffff"\/>/.test(svg) && /<svg width="520"/.test(svg) && Math.min(...f) >= 11);
  ok(id + ' 線條是符號庫的藍（不是舊的深色手繪配色）',
    !/#0a0a1a|#00d4ff|#c8d4ee/.test(svg), '無舊配色殘留');
}

/* ---------- q7：SPI 四模式 ---------- */
{
  const s = D.q7;
  const rows = [[90, 0, 0], [150, 0, 1], [210, 1, 0], [270, 1, 1]];
  const waves = polys(s, '#1f4fd1');
  ok('q7 四條 SCLK 波形', waves.length === 4, waves.length + ' 條');
  rows.forEach(([cy, cpol, cpha], i) => {
    const w = waves[i], hi = cy - 14, lo = cy + 14;
    ok(`q7 Mode ${i} 閒置準位符合 CPOL=${cpol}`, w[0][1] === (cpol ? hi : lo),
      `idle y=${w[0][1]}（hi=${hi} lo=${lo}）`);
    // 每個邊沿都要真的翻轉，且四個時脈 = 8 個邊沿
    const edges = [];
    for (let k = 1; k < w.length; k++) if (w[k][0] === w[k - 1][0] && w[k][1] !== w[k - 1][1]) edges.push(w[k][0]);
    ok(`q7 Mode ${i} 有 8 個邊沿（4 個時脈）`, edges.length === 8, edges.join(','));
    const want = [];
    for (let k = cpha; k < 8; k += 2) want.push(150 + k * 40);
    const marks = tris(s).filter(t => Math.abs(t[0][1] - (cy - 29)) < 1).map(t => t[2][0]).sort((a, b) => a - b);
    ok(`q7 Mode ${i} 取樣標記落在第 ${cpha ? '二' : '一'} 個邊沿`, JSON.stringify(marks) === JSON.stringify(want),
      marks.join(',') + ' vs ' + want.join(','));
  });
  ok('q7 標明 Mode 0 最常用', /most used/.test(s));
  ok('q7 說明 CPOL 管閒置準位、CPHA 管取樣邊沿',
    /CPOL sets the idle level/.test(s) && /CPHA picks which edge/.test(s));
}

/* ---------- q12：工作週期 ---------- */
{
  const s = D.q12;
  const w = polys(s, '#1f4fd1').find(p => p.length === 9 && p[0][0] === 300);
  ok('q12 有 SW 節點方波', !!w);
  // 由座標算工作週期：高電位總時間 / 一個週期
  const hi = Math.min(...w.map(p => p[1])), lo = Math.max(...w.map(p => p[1]));
  let high = 0;
  for (let i = 1; i < w.length; i++) if (w[i][1] === hi && w[i - 1][1] === hi) high += w[i][0] - w[i - 1][0];
  const period = 100, D_geom = high / (2 * period) * 2 / 2 * 2;   // 兩個週期，取平均
  const duty = (high / 2) / period;
  ok('q12 波形量出來的工作週期 = 30%', Math.abs(duty - 0.3) < 1e-9, (duty * 100).toFixed(1) + '%');
  ok('q12 與 VOUT/VIN 相符（1.5V / 5V = 0.30）', Math.abs(1.5 / 5 - duty) < 1e-9);
  ok('q12 buck 用真符號（MOSFET / 電感 / 電容 / 二極體）',
    /data-sym="nmos"/.test(s) && /data-sym="inductor"/.test(s) &&
    /data-sym="capacitor"/.test(s) && /data-sym="diode"/.test(s));
  ok('q12 標出實際值 0.31 的來源', /1\.5\+0\.05/.test(s) && /0\.31/.test(s));
  ok('q12 高電位 = 5V、低電位 = 0V 有標', />5V</.test(s) && />0V</.test(s) && hi < lo);
}

/* ---------- q16：I2C Fast Mode 時序 ---------- */
{
  const s = D.q16;
  const w = polys(s, '#1f4fd1')[0];
  ok('q16 SCL 是有斜率的梯形波（不是理想方波）',
    w.some((p, i) => i && p[0] !== w[i - 1][0] && p[1] !== w[i - 1][1]));
  // 30%/70% 參考線與量測區間端點
  const g = [...s.matchAll(/<line x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="\2"[^>]*stroke="#b91c1c"/g)]
    .map(m => ({ x1: +m[1], x2: +m[3], y: +m[2] }));
  const trSpan = g.find(l => l.y === 76 && l.x1 < 140), tfSpan = g.find(l => l.y === 76 && l.x1 > 200);
  ok('q16 tr 量在上升緣的 30%->70% 之間', trSpan && Math.abs(trSpan.x1 - 109) < 0.6 && Math.abs(trSpan.x2 - 121) < 0.6,
    trSpan && `${trSpan.x1.toFixed(1)}..${trSpan.x2.toFixed(1)}`);
  ok('q16 tf 量在下降緣的 70%->30% 之間', tfSpan && Math.abs(tfSpan.x1 - 219) < 0.6 && Math.abs(tfSpan.x2 - 231) < 0.6,
    tfSpan && `${tfSpan.x1.toFixed(1)}..${tfSpan.x2.toFixed(1)}`);
  const wspan = [...s.matchAll(/<line x1="([\d.]+)" y1="172" x2="([\d.]+)" y2="172"[^>]*stroke="#b45309"/g)]
    .map(m => ({ x1: +m[1], x2: +m[2] }));
  ok('q16 tHIGH 量在兩個 70% 交點之間', wspan[0] && Math.abs(wspan[0].x1 - 121) < 0.6 && Math.abs(wspan[0].x2 - 219) < 0.6);
  ok('q16 tLOW 量在兩個 30% 交點之間', wspan[1] && Math.abs(wspan[1].x1 - 231) < 0.6 && Math.abs(wspan[1].x2 - 329) < 0.6);
  ok('q16 五項規格值齊全',
    /fSCL <= 400 kHz/.test(s) && /tLOW >= 1\.3us, tHIGH >= 0\.6us/.test(s) &&
    /tr 20-300ns, tf <= 300ns/.test(s) && /tSU:DAT >= 100ns/.test(s) && /tBUF >= 1\.3us/.test(s));
  ok('q16 點名 tr/tf 是最常 FAIL 的一項', /usually fails/.test(s));
}

/* ---------- q17：由 tr 反推 Rp ---------- */
{
  const s = D.q17;
  const green = polys(s, '#15803d')[0], red = polys(s, '#b91c1c')[0];
  ok('q17 兩條 RC 充電曲線', !!green && !!red);
  ok('q17 兩條都從原點單調爬升', [green, red].every(c =>
    c[0][0] === 70 && c[0][1] === 250 && c.every((p, i) => i === 0 || p[1] <= c[i - 1][1] + 1e-9)));
  // 0.8473 這個常數就是 30%->70% 的 ln((1-0.3)/(1-0.7))
  const k = Math.log((1 - 0.3) / (1 - 0.7));
  ok('q17 圖上的 0.8473 = ln(0.7/0.3)（30%->70% 的倍數）', Math.abs(k - 0.8473) < 5e-5, k.toFixed(6));
  const trOf = tau => k * tau;
  ok('q17 綠線 Rp=1.77k 對應 tr = 300ns', Math.abs(trOf(1770 * 200e-12 * 1e9) - 300) < 1.5,
    trOf(1770 * 200e-12 * 1e9).toFixed(1) + 'ns');
  ok('q17 紅線 Rp=4.7k 對應 tr = 796ns', Math.abs(trOf(4700 * 200e-12 * 1e9) - 796) < 2,
    trOf(4700 * 200e-12 * 1e9).toFixed(1) + 'ns');
  // 幾何驗證：綠線比紅線先穿過 70% 線
  const cross70 = c => c.find(p => p[1] <= 250 - (250 - 90) * 0.7)[0];
  ok('q17 綠線比紅線更早到 70%', cross70(green) < cross70(red),
    `${cross70(green).toFixed(0)} < ${cross70(red).toFixed(0)}`);
  ok('q17 上下限都寫了', /1\.77k/.test(s) && /967 ohm/.test(s) && /1\.5k is the pick/.test(s));
}

/* ---------- q18：tr 對 Rp 正比 ---------- */
{
  const s = D.q18;
  const CB = 100, TR = kohm => 0.8473 * kohm * CB;
  const px = kohm => 70 + kohm * 34.17, py = ns => 250 - ns * 0.1545;
  ok('q18 標明假設的 Cb', /Cb = 100pF/.test(s));
  ok('q18 這組數字讓 (A) 真的跨過限制線',
    TR(4.7) > 300 && TR(2.2) < 300 && TR(10) > TR(4.7),
    `4.7k=${TR(4.7).toFixed(0)}ns 2.2k=${TR(2.2).toFixed(0)}ns 10k=${TR(10).toFixed(0)}ns`);
  const line = polys(s, '#1f4fd1')[0];
  ok('q18 tr-Rp 是通過原點的直線（正比）',
    Math.abs(line[0][0] - px(0)) < 0.6 && Math.abs(line[0][1] - py(0)) < 0.6 &&
    Math.abs(line[1][1] - py(TR(12))) < 0.6);
  const arrows = [...s.matchAll(/<line x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="([\d.]+)"[^>]*stroke="(#15803d|#b91c1c)"[^>]*\/>/g)]
    .map(m => ({ x1: +m[1], y1: +m[2], x2: +m[3], y2: +m[4], c: m[5] }));
  // 紅色有兩條：300ns 限制線是水平的，(C) 的箭頭是斜的 —— 用 y1!==y2 挑出箭頭
  const a = arrows.find(x => x.c === '#15803d'), c = arrows.find(x => x.c === '#b91c1c' && x.y1 !== x.y2);
  ok('q18 (A) 的箭頭往左下（Rp 變小、tr 變小）', a && a.x2 < a.x1 && a.y2 > a.y1);
  ok('q18 (C) 的箭頭往右上（Rp 變大、tr 變大）', c && c.x2 > c.x1 && c.y2 < c.y1);
  const limit = py(300);
  ok('q18 (A) 的終點落在 300ns 限制線之下（合格）', a.y2 > limit, `${a.y2.toFixed(1)} > ${limit.toFixed(1)}`);
  ok('q18 (C) 的終點衝到限制線之上（更慘）', c.y2 < limit, `${c.y2.toFixed(1)} < ${limit.toFixed(1)}`);
  ok('q18 答案標成 (C)', /answer: \(C\)/.test(s));
  ok('q18 說明 B/D 動的是 Cb', /\(B\) and \(D\) both shrink Cb/.test(s));
}

/* ---------- q24：六參數 + FOM ---------- */
{
  const s = D.q24;
  ['V\\(BR\\)DSS', 'RDS\\(on\\)', 'Qg', 'VGS\\(th\\)', 'ID\\(max\\)', 'SOA'].forEach(k =>
    ok('q24 有參數 ' + k.replace(/\\/g, ''), new RegExp('>' + k + '<').test(s)));
  const curve = polys(s, '#1f4fd1')[0];
  const qOf = x => (x - 300) / 5, rOf = y => (250 - y) / 4;
  const fom = curve.map(([x, y]) => qOf(x) * rOf(y));
  ok('q24 曲線是等 FOM 雙曲線（RDS(on) x Qg 為定值 200）',
    fom.every(v => Math.abs(v - 200) < 1.5), `min ${Math.min(...fom).toFixed(1)} max ${Math.max(...fom).toFixed(1)}`);
  const dots = [...s.matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)" r="2\.6"/g)].map(m => [qOf(+m[1]), rOf(+m[2])]);
  ok('q24 兩個標記點都落在同一條 FOM 線上（一個低 R、一個低 Qg）',
    dots.length === 2 && dots.every(([q, r]) => Math.abs(q * r - 200) < 1) && dots[0][1] > dots[1][1] && dots[0][0] < dots[1][0],
    JSON.stringify(dots));
  ok('q24 FOM 定義與取捨結論都在', /FOM = RDS\(on\) x Qg/.test(s) && /chase RDS\(on\)/.test(s) && /chase Qg/.test(s));
}

/* ---------- q26：RC 低通 ---------- */
{
  const s = D.q26;
  const FC = 1 / (2 * Math.PI * 10e3 * 10e-9);
  ok('q26 fc = 1591.5 Hz，標成 1.59 kHz', Math.abs(FC - 1591.5) < 0.6 && /fc = 1\.59 kHz/.test(s), FC.toFixed(1));
  const fx = f => 260 + 240 * Math.log10(f / 100) / 3, fy = db => 90 + (-db) * 4;
  const mag = polys(s, '#1f4fd1').find(p => p.length > 30);
  ok('q26 有幅頻曲線', !!mag && mag.length === 61);
  const at = f => mag.reduce((best, p) => Math.abs(p[0] - fx(f)) < Math.abs(best[0] - fx(f)) ? p : best)[1];
  ok('q26 曲線在 fc 是 -3dB', Math.abs(at(FC) - fy(-3.01)) < 1.5, `y=${at(FC).toFixed(1)} 期望 ${fy(-3.01).toFixed(1)}`);
  ok('q26 曲線在 10x fc 是 -20dB', Math.abs(at(10 * FC) - fy(-20.04)) < 2.5, `y=${at(10 * FC).toFixed(1)}`);
  // 漸近線斜率必須是每十倍頻 -20dB
  const asym = polys(s, '#94a3b8').find(p => p.length === 2 && Math.abs(p[0][0] - fx(FC)) < 1);
  const decades = (asym[1][0] - asym[0][0]) / (240 / 3), dbDrop = (asym[1][1] - asym[0][1]) / 4;
  ok('q26 漸近線斜率 = -20 dB/decade', Math.abs(dbDrop / decades - 20) < 0.2, (dbDrop / decades).toFixed(2));
  ok('q26 -3dB 點畫在曲線上', /<circle cx="[\d.]+" cy="[\d.]+" r="2\.6"/.test(s));
  ok('q26 電路是鋸齒電阻 + 電容 + 接地',
    /data-sym="resistor"/.test(s) && /data-sym="capacitor"/.test(s) && /data-sym="ground"/.test(s));
  ok('q26 相位與 0.707 都交代了', /-45 deg/.test(s) && /0\.707/.test(s));
}

/* ---------- q27：Setup / Hold ---------- */
{
  const s = D.q27;
  const clk = polys(s, '#1f4fd1')[0], data = polys(s, '#b45309')[0];
  ok('q27 有 CLK 與 DATA 兩條波形', !!clk && !!data);
  const edge = 260;
  ok('q27 CLK 在 x=260 有上升緣',
    clk.some((p, i) => i && p[0] === edge && p[0] === clk[i - 1][0] && p[1] < clk[i - 1][1]));
  const trans = data.filter((p, i) => i && p[0] === data[i - 1][0]).map(p => p[0]);
  ok('q27 資料在邊沿前就穩定、邊沿後才變', trans[0] < edge && trans[1] > edge, trans.join(','));
  const br = [...s.matchAll(/<line x1="([\d.]+)" y1="248" x2="([\d.]+)" y2="248"[^>]*stroke="#15803d"/g)]
    .map(m => ({ x1: +m[1], x2: +m[2] }));
  ok('q27 tsu 從資料穩定點量到時鐘邊沿', br[0] && br[0].x1 === trans[0] && br[0].x2 === edge, JSON.stringify(br[0]));
  ok('q27 th 從時鐘邊沿量到資料變化點', br[1] && br[1].x1 === edge && br[1].x2 === trans[1], JSON.stringify(br[1]));
  ok('q27 兩個窗在邊沿處相接、不重疊', br[0].x2 === br[1].x1);
  ok('q27 兩條 slack 公式與後果都寫了',
    /Setup slack = Tclk - Tco - Tcomb - tsu >= 0/.test(s) &&
    /Hold slack = Tco \+ Tcomb - th >= 0/.test(s) && /metastability/.test(s));
}

console.log('\n' + (fail ? 'FAILED ' + fail : 'ALL PASS'));
process.exit(fail ? 1 : 0);
