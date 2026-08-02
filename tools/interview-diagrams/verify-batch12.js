/** verify-batch12.js — flyback 五題（q28–q32）的語意/幾何驗證
 *  重疊交給 interview-diagram-check.js；這裡問的是「拓樸與極性對不對」。 */
const D = require('./batch12.js');
let fail = 0;
const ok = (n, c, d) => { console.log((c ? 'PASS ' : 'FAIL ') + n + (d ? '  ' + d : '')); if (!c) fail++; };
const count = (s, re) => (s.match(re) || []).length;
const has = (s, ...ws) => ws.every(w => s.includes(w));
const wire = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"`;
const dot = (x, y) => `<circle cx="${x}" cy="${y}" r="2.6"`;
const B = D.q28;                      // 底圖五題共用，拓樸只驗一次

/* ---------- 共同規格 ---------- */
for (const [id, svg] of Object.entries(D)) {
  const f = [...svg.matchAll(/font-size="([\d.]+)"/g)].map(m => +m[1]);
  ok(id + ' 白底 + width 720 + 字級>=11',
    /<rect width="720" height="480" fill="#ffffff"\/>/.test(svg) && /<svg width="720"/.test(svg) && Math.min(...f) >= 11,
    'min font ' + Math.min(...f));
  ok(id + ' 用符號庫', /data-sym="nmos"/.test(svg) && /data-sym="resistor"/.test(svg) && /data-sym="capacitor"/.test(svg));
  ok(id + ' 五題共用同一張底圖', svg.includes('data-sym="coil"') && svg.includes('TL431') && svg.includes('BD1'));
}

/* ---------- 變壓器：三個繞組、繞向、極性點 ---------- */
{
  const coils = [...B.matchAll(/<g data-sym="coil"><path d="M (\d+) (\d+)((?: A 4\.5 4\.5 0 1 [01] \d+ \d+)+)"/g)]
    .map(m => ({ x: +m[1], y0: +m[2], n: (m[3].match(/A /g) || []).length, sweep: +m[3].match(/0 1 ([01])/)[1] }));
  ok('T1 有三個繞組（P / AUX / S）', coils.length === 3, JSON.stringify(coils));
  const [P, AUX, S] = coils;
  ok('P 與 AUX 在鐵芯左（凸左）、S 在右（凸右）',
    P.sweep === 0 && AUX.sweep === 0 && S.sweep === 1 && P.x === 472 && AUX.x === 472 && S.x === 508);
  ok('鐵芯是兩條平行線，涵蓋三個繞組',
    has(B, '<line x1="484" y1="92" x2="484" y2="320"', '<line x1="490" y1="92" x2="490" y2="320"') &&
    92 < P.y0 && AUX.y0 + AUX.n * 9 < 320);
  // 極性點：一次在上（接 HV+ 那端），二次與 AUX 在下（接各自的地那端）→ 整流器只在關斷期間導通
  const dots = { P: [478, 104], AUX: [478, 236], S: [502, 186] };
  ok('三個極性點都畫了', Object.values(dots).every(([x, y]) => B.includes(dot(x, y))));
  const near = (dotY, a, b) => Math.abs(dotY - a) < Math.abs(dotY - b);
  ok('一次側的點在 HV+ 那端（上）', near(dots.P[1], P.y0, P.y0 + P.n * 9));
  ok('二次側的點在接地那端（下）', near(dots.S[1], S.y0 + S.n * 9, S.y0));
  ok('AUX 的點在接地那端（下）', near(dots.AUX[1], AUX.y0 + AUX.n * 9, AUX.y0));
  ok('點在接地端 = 整流器在 Q1 關斷時才導通（flyback，不是順向式）',
    near(dots.S[1], S.y0 + S.n * 9, S.y0) && near(dots.P[1], P.y0, P.y0 + P.n * 9));
}

/* ---------- 一次側主迴路 ---------- */
{
  ok('HV+ 母線從整流橋拉到一次繞組', B.includes(wire(218, 80, 472, 80)));
  ok('C1 掛在 HV+ 與 PGND 之間',
    has(B, wire(240, 80, 240, 128), wire(240, 172, 240, 352)) && B.includes(dot(240, 80)) && B.includes(dot(240, 352)));
  ok('一次繞組下端經汲極引線接到 Q1',
    has(B, wire(472, 172, 472, 178), wire(472, 178, 450, 178), wire(450, 178, 450, 244)));
  ok('Q1 是有體二極體的 MOSFET，閘極由 U1 驅動',
    /data-sym="nmos"/.test(B) && B.includes(wire(380, 264, 394, 264)));
  ok('源極 -> Rs -> PGND，CS 從 Rs 上端取樣',
    has(B, wire(450, 284, 450, 300), wire(450, 348, 450, 352), wire(380, 300, 450, 300)) && B.includes(dot(450, 300)));
}

/* ---------- 整流器方向 ---------- */
{
  // Sym.diode：陰極在右（x+8 的直棒）。D3 在 y=86，電流由繞組往輸出 = 往右
  ok('D3 陰極朝輸出側（電流往 Cout / VOUT+）',
    B.includes('<line x1="572" y1="78" x2="572" y2="94"') && B.includes(wire(586, 86, 690, 86)));
  // diodeHL：陰極在左。D2 在 y=195，電流由 AUX 往 VDD = 往左
  ok('D2 陰極朝 VDD（電流由 AUX 往 VDD）',
    B.includes('<line x1="340" y1="187" x2="340" y2="203"') && B.includes(wire(326, 195, 310, 195)));
  ok('D3 的陽極接的是二次側非點端（上）', B.includes(wire(508, 100, 508, 86)));
  ok('D2 的陽極接的是 AUX 非點端（上）', B.includes(wire(472, 195, 370, 195)));
}

/* ---------- 隔離：除了 Cps、CY、光耦，沒有東西跨過隔離帶 ---------- */
{
  const X = 499;
  const lines = [...B.matchAll(/<line [^>]*\/>/g)].map(t => ({
    x1: +t[0].match(/x1="([\d.]+)"/)[1], x2: +t[0].match(/x2="([\d.]+)"/)[1],
    dashed: /stroke-dasharray/.test(t[0]),
  }));
  const crossing = lines.filter(l => Math.min(l.x1, l.x2) < X && Math.max(l.x1, l.x2) > X);
  ok('跨過隔離帶的只有虛線（寄生 Cps）', crossing.every(l => l.dashed), JSON.stringify(crossing));
  ok('CY 的兩片極板剛好跨在隔離帶上（一次地 <-> 二次地）',
    has(B, wire(472, 352, 472, 380), wire(516, 380, 516, 300)) && B.includes(dot(516, 300)) &&
    B.includes('<line x1="489" y1="369" x2="489" y2="391"') && B.includes('<line x1="499" y1="369" x2="499" y2="391"'));
  ok('光耦的框橫跨隔離帶，一次側接 FB、二次側接 TL431',
    /<rect x="445" y="375" width="90" height="50"/.test(B) &&
    has(B, wire(340, 412, 445, 412), wire(535, 412, 572, 412)));
  ok('Cps 是虛線（寄生電容，不是真的零件）', /stroke-dasharray="4 3"/.test(B));
}

/* ---------- 兩個刻意的無點交叉 ---------- */
{
  ok('AUX 引線跨過汲極引線，沒有接點', !B.includes(dot(450, 195)));
  ok('FB 訊號跨過一次側地匯流排，沒有接點', !B.includes(dot(340, 352)));
  ok('真正該有接點的地方有點',
    [[240, 80], [310, 80], [450, 300], [630, 86], [670, 410], [420, 352], [472, 352]].every(([x, y]) => B.includes(dot(x, y))));
}

/* ---------- 供電與回授鏈 ---------- */
{
  ok('Rst 從 HV+ 下來接到 VDD 節點', B.includes(dot(310, 80)) && B.includes(wire(310, 140, 310, 225)));
  ok('Cvdd 掛在 VDD 與 PGND 之間', has(B, wire(310, 170, 278, 170), wire(278, 218, 278, 352)));
  ok('回授鏈完整：VOUT -> 分壓 -> TL431 -> 光耦 LED',
    has(B, wire(670, 86, 706, 86), wire(706, 340, 552, 340), wire(628, 368, 670, 368), wire(552, 340, 552, 388)) &&
    count(B, /data-sym="resistor"/g) >= 4);
  ok('分壓下半回到二次地（不是接一次地）', has(B, wire(670, 458, 545, 458), wire(545, 458, 545, 300)) && B.includes(dot(545, 300)));
}

/* ---------- 各題的高亮路徑 ---------- */
const paths = id => [...D[id].matchAll(/<path d="([^"]+)" fill="none" stroke="(#[0-9a-f]{6})" stroke-width="9"/g)]
  .map(m => ({ d: m[1], c: m[2] }));
const xs = d => (d.match(/[MH] (\d+)/g) || []).map(s => +s.split(' ')[1]);

{
  const p = paths('q28');
  const yellow = p.filter(x => x.c === '#f59e0b'), red = p.filter(x => x.c === '#ef4444');
  ok('q28 有黃（主迴路）與紅（高壓）兩種高亮', yellow.length === 1 && red.length === 2);
  ok('q28 主迴路是封閉的', /^M (\d+) (\d+) [\s\S]*V \2$/.test(yellow[0].d), yellow[0].d);
  ok('q28 主迴路走 C1 -> HV+ -> 一次繞組 -> Q1 -> Rs -> PGND',
    yellow[0].d === 'M 240 80 H 472 V 178 H 450 V 352 H 240 V 80');
  ok('q28 主迴路完全在一次側（x <= 472）', Math.max(...xs(yellow[0].d)) <= 472);
  ok('q28 高壓段從保險絲之後開始，不含 L/N 進線', red[0].d.startsWith('M 84 80') && !red[0].d.includes('M 16'));
  ok('q28 高壓段一路到 Q1 汲極', red[1].d.endsWith('V 244') && red[1].d.includes('H 472'));
}
{
  const p = paths('q29');
  ok('q29 只有一條高亮', p.length === 1);
  ok('q29 二次迴路封閉且只在二次側（x >= 508）',
    p[0].d === 'M 508 86 H 630 V 300 H 508 V 86' && Math.min(...xs(p[0].d)) >= 508);
  ok('q29 迴路經過 D3(y=86) 與二次地(y=300)', p[0].d.includes('86') && p[0].d.includes('300'));
}
{
  const p = paths('q30');
  ok('q30 一條綠色共模路徑', p.length === 1 && p[0].c === '#16a34a');
  ok('q30 從 Q1 汲極(SW 節點)出發', p[0].d.startsWith('M 450 244'));
  ok('q30 經 Cps 跨到二次側（y=130 那段 472 -> 508）', p[0].d.includes('V 130 H 508'));
  ok('q30 再經 CY(y=380) 回到一次地(y=352)', p[0].d.includes('V 380 H 472 V 352'));
  // 逐段判定跨越 x=499 的次數：去程走 Cps、回程走 CY，剛好兩次
  const pts = (() => {
    const out = []; let cx = 0, cy = 0;
    p[0].d.replace(/([MHV])\s*([-\d.\s]+)/g, (_, c, a) => {
      const n = a.trim().split(/\s+/).map(Number);
      if (c === 'M') { cx = n[0]; cy = n[1]; out.push([cx, cy]); }
      else if (c === 'H') n.forEach(v => { cx = v; out.push([cx, cy]); });
      else n.forEach(v => { cy = v; out.push([cx, cy]); });
      return '';
    });
    return out;
  })();
  const cross = pts.slice(1).filter((q, i) => (pts[i][0] - 499) * (q[0] - 499) < 0);
  ok('q30 路徑跨隔離帶兩次：Cps 去、CY 回', cross.length === 2,
    cross.map(q => 'y=' + q[1]).join(' '));
}
{
  const p = paths('q31');
  const all = p.map(x => x.d).join(' ');
  ok('q31 兩段綠色回授路徑', p.length === 2 && p.every(x => x.c === '#16a34a'));
  ok('q31 從 VOUT 出發、經分壓到 TL431 REF', all.includes('M 630 86 H 706') && all.includes('M 670 368 H 628'));
  ok('q31 經光耦跨隔離帶後進 U1 的 FB 腳', all.includes('M 445 412 H 340 V 345'));
  ok('q31 不碰 SW 節點與一次繞組（回授要遠離它們）',
    !all.includes('450') && !all.includes('V 178'));
}
{
  const p = paths('q32');
  ok('q32 兩條橘色供電路徑（啟動 / AUX 接手）', p.length === 2 && p.every(x => x.c === '#f97316'));
  const start = p.find(x => x.d.startsWith('M 310 80')), aux = p.find(x => x.d.startsWith('M 472 195'));
  ok('q32 啟動路徑：HV+ -> Rst -> VDD 腳', !!start && start.d === 'M 310 80 V 225');
  ok('q32 AUX 路徑：輔助繞組 -> D2 -> 同一個 VDD 腳', !!aux && aux.d === 'M 472 195 H 310 V 225');
  ok('q32 兩條路徑收在同一點（AUX 接手的就是啟動供的那個 VDD）',
    start.d.endsWith('V 225') && aux.d.endsWith('V 225'));
  // 待機功耗：1M 掛在 365V 母線上的常時損耗
  const p_rst = 365 * 365 / 1e6;
  ok('q32 標的 Rst=1M 與待機損耗自洽（365V 下 0.13W）', /1M/.test(D.q32) && Math.abs(p_rst - 0.133) < 0.002,
    p_rst.toFixed(3) + 'W');
}

console.log('\n' + (fail ? 'FAILED ' + fail : 'ALL PASS'));
process.exit(fail ? 1 : 0);
