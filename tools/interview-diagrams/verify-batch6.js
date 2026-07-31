/** verify-batch6.js — PCB 六題的語意/幾何驗證（q33/q34 沿用 batch5，已驗過，這裡只確認同源） */
const D = require('./batch6.js');
const B5 = require('./batch5.js');
let fail = 0;
const ok = (n, c, d) => { console.log((c ? 'PASS ' : 'FAIL ') + n + (d ? '  ' + d : '')); if (!c) fail++; };

for (const [id, svg] of Object.entries(D)) {
  const vb = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
  const f = [...svg.matchAll(/font-size="([\d.]+)"/g)].map(m => +m[1]);
  ok(id + ' viewBox 520 + width 屬性', +vb[1] === 520 && /<svg width="520"/.test(svg));
  ok(id + ' 字級 >= 11', Math.min(...f) >= 11, 'min=' + Math.min(...f));
}

ok('q33 沿用 q21 的擺位圖', D.q33 === B5.q21);
ok('q34 沿用 q23 的對照圖', D.q34 === B5.q23);

/* --- q35：回流路徑 --- */
{
  const planes = [...D.q35.matchAll(/<rect x="(\d+)" y="120" width="(\d+)" height="10"/g)].map(m => ({ x: +m[1], w: +m[2] }));
  ok('q35 左邊一整片平面、右邊被切成兩塊', planes.length === 3,
    planes.map(p => p.x + '+' + p.w).join(' '));
  const [L, R1, R2] = planes;
  ok('q35 左邊平面連續（寬 180）', L.w === 180);
  const slot = R2.x - (R1.x + R1.w);
  ok('q35 右邊有實際的縫（> 0）', slot > 0, 'slot=' + slot + 'px');
  // 左側回流：一條直線，正好在訊號線正下方（x 範圍相同、y 在走線與平面之間）
  const lret = D.q35.match(/<polyline points="206,112 46,112"/);
  ok('q35 左側回流走訊號正下方（同 x 範圍、單一直線）', !!lret);
  // 右側回流：多段折線，必須繞過縫（往下探到 y=160）
  const rret = D.q35.match(/<polyline points="(466,112[^"]+)"/);
  const rpts = rret[1].split(' ').map(p => p.split(',').map(Number));
  ok('q35 右側回流是多段繞路', rpts.length > 2, rpts.length + ' 點');
  const maxY = Math.max(...rpts.map(p => p[1]));
  ok('q35 右側回流被迫下探（迴路面積變大）', maxY > 112, 'maxY=' + maxY);
  // 粗略迴路高度：訊號在 y=80，回流最遠 y
  ok('q35 右側迴路高度大於左側', (maxY - 80) > (112 - 80), `${maxY - 80} vs ${112 - 80}`);
  ok('q35 說明換層要放回流過孔', /return via next to the signal via/.test(D.q35));
}

/* --- q36：SW 節點佈局 --- */
{
  const loop = D.q36.match(/<path d="(M120,60 H210 V150 H120 Z)"[^>]*stroke="#ff6b6b"/);
  ok('q36 高頻迴路是封閉區域', !!loop);
  const cin = D.q36.match(/<rect x="(\d+)" y="70" width="24" height="16"/);
  const ic = D.q36.match(/<rect x="(\d+)" y="60" width="60" height="90"/);
  ok('q36 Cin 落在熱迴路的邊界上（x=210 那條邊）', cin && +cin[1] + 24 >= 210 && +cin[1] <= 210,
    'Cin x=' + (cin && cin[1]));
  ok('q36 Cin 比電感更靠近 IC', cin && +cin[1] < 300, `Cin@${cin[1]} L@300 IC@${ic[1]}`);
  // SW 銅面要小：面積相對畫布很小
  const sw = D.q36.match(/<rect x="120" y="96" width="(\d+)" height="(\d+)" fill="#ffc107"/);
  const area = +sw[1] * +sw[2];
  ok('q36 SW 銅面積佔畫布 < 1%', area / (520 * 248) < 0.01, (area / (520 * 248) * 100).toFixed(2) + '%');
  // FB 走線不可穿過 SW 銅面或電感
  const fb = D.q36.match(/<polyline points="([^"]+)" fill="none" stroke="#00ff88"/)[1]
    .split(' ').map(p => p.split(',').map(Number));
  const segs = []; for (let i = 1; i < fb.length; i++) segs.push([fb[i - 1], fb[i]]);
  const crosses = r => segs.some(([[x1, y1], [x2, y2]]) =>
    Math.min(x1, x2) <= r.x + r.w && Math.max(x1, x2) >= r.x && Math.min(y1, y2) <= r.y + r.h && Math.max(y1, y2) >= r.y);
  ok('q36 FB 走線不穿過 SW 銅面', !crosses({ x: 120, y: 96, w: 46, h: 22 }));
  ok('q36 FB 走線不穿過電感 L', !crosses({ x: 300, y: 97, w: 46, h: 20 }));
  ok('q36 FB 從輸出端拉回 IC', fb[0][0] === 400 && fb[fb.length - 1][0] === 96);
  ok('q36 標明單點接地與 Cin 最靠 IC', /single-point ground/.test(D.q36) && /Cin closest to the IC/.test(D.q36));
  ok('q36 標明迴路面積就是天線', /Its area is the EMI antenna/.test(D.q36));
}

/* --- q37：四層板疊層 --- */
{
  const layers = [...D.q37.matchAll(/<rect x="60" y="(\d+)" width="300" height="(\d+)"/g)].map(m => ({ y: +m[1], h: +m[2] }));
  const names = [...D.q37.matchAll(/<text x="210" y="\d+"[^>]*>([^<]+)</g)].map(m => m[1]);
  ok('q37 四層', layers.length === 4 && names.length === 4, names.join(' / '));
  ok('q37 由上而下 = 訊號-地-電源-訊號',
    JSON.stringify(names) === JSON.stringify(['L1 signal', 'L2 GND (solid)', 'L3 PWR', 'L4 signal']));
  const gap = i => layers[i + 1].y - (layers[i].y + layers[i].h);
  ok('q37 L1-L2 介電層比 L2-L3 薄（圖要對得上「要薄」）', gap(0) < gap(1), `L1-L2=${gap(0)}px  L2-L3=${gap(1)}px`);
  ok('q37 thin 標線正好標在 L1-L2 之間',
    /<line x1="46" y1="64" x2="46" y2="76"/.test(D.q37) && layers[0].y + layers[0].h === 64 && layers[1].y === 76);
  ok('q37 說明電源地相鄰形成平面電容', /plane pair = capacitance/.test(D.q37) || /plane capacitance/.test(D.q37));
  ok('q37 說明高速線走在靠實心地那層', /Fast nets go on the layer next to solid GND/.test(D.q37));
}

/* --- q38：散熱過孔 --- */
{
  const vias = [...D.q38.matchAll(/<rect x="(\d+)" y="96" width="6" height="54"/g)].map(m => +m[1]);
  const pad = D.q38.match(/<rect x="(\d+)" y="86" width="(\d+)" height="10" fill="#ffc107"/);
  // 注意 capture 順序：[1]=x [2]=y [3]=width（之前把 x 當成 y，斷言誤報）
  const pour = D.q38.match(/<rect x="(\d+)" y="(\d+)" width="(\d+)" height="14"/);
  ok('q38 有過孔陣列（>= 5 個）', vias.length >= 5, vias.length + ' 個');
  const padL = +pad[1], padR = padL + +pad[2];
  ok('q38 過孔全部落在焊墊底下', vias.every(x => x >= padL && x + 6 <= padR), `pad ${padL}-${padR}`);
  ok('q38 過孔上接焊墊、下接銅面', /y="96" width="6" height="54"/.test(D.q38) && 96 + 54 === +pour[2],
    `via 96+54=${96 + 54}, pour y=${pour[2]}`);
  ok('q38 內層銅面比焊墊大很多', +pour[3] > +pad[2] * 2, `pour ${pour[3]} vs pad ${pad[2]}`);
  ok('q38 說明銅厚/銅面比增加過孔更關鍵', /More copper weight and area beats more vias/.test(D.q38));
  ok('q38 提到氣流與功率元件分散', /Spread power parts out, mind airflow/.test(D.q38));
}

console.log('\n' + (fail ? 'FAILED ' + fail : 'ALL PASS'));
process.exit(fail ? 1 : 0);
