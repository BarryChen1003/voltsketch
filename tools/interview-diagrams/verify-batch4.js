/** verify-batch4.js — 批次 4 的語意/幾何驗證 */
const D = require('./batch4.js');
let fail = 0;
const ok = (n, c, d) => { console.log((c ? 'PASS ' : 'FAIL ') + n + (d ? '  ' + d : '')); if (!c) fail++; };

for (const [id, svg] of Object.entries(D)) {
  const vb = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
  const f = [...svg.matchAll(/font-size="([\d.]+)"/g)].map(m => +m[1]);
  ok(id + ' viewBox 寬 = 520 且有 width', +vb[1] === 520 && /<svg width="520"/.test(svg), vb[1] + 'x' + vb[2]);
  ok(id + ' 字級 >= 11', Math.min(...f) >= 11, 'min=' + Math.min(...f));
}

/* --- q3：兩級反相器的位準與電流 --- */
{
  ok('q3 第一級軌 12V / R452', /12V<\/text>/.test(D.q3) && /R452<\/text>/.test(D.q3));
  ok('q3 第二級軌 5V / R453', /5V<\/text>/.test(D.q3) && /R453<\/text>/.test(D.q3));
  ok('q3 B = 0V（Q27 ON 把 B 拉低）', /B = 0V/.test(D.q3));
  ok('q3 C = 5V（Q28 OFF 由 R453 上拉）', /C = 5V/.test(D.q3));
  ok('q3 ID = 12V/10k = 1.2mA', Math.abs(12 / 10000 - 0.0012) < 1e-9 && /12V \/ 10k = 1\.2mA/.test(D.q3));
  ok('q3 R1 在閘極路徑上（y=133），不在汲極', /<rect x="96" y="123" width="32" height="20"/.test(D.q3));
  // B 節點必須接到第二級閘極（x=352 是 Q28 方塊左緣）
  const link = D.q3.match(/<polyline points="196,100 240,100 240,133 352,133"/);
  ok('q3 B 點接到 Q28 閘極', !!link);
  ok('q3 兩級各自接地', (D.q3.match(/y1="164" x2="\d+" y2="164"/g) || []).length === 2);
}

/* --- q8：電阻要在源端；箭頭方向要對 --- */
{
  const outR = [...D.q8.matchAll(/<rect x="155" y="(\d+)" width="28"/g)].map(m => +m[1]);
  const inR = [...D.q8.matchAll(/<rect x="307" y="(\d+)" width="28"/g)].map(m => +m[1]);
  ok('q8 Master 輸出的三條線在 Master 側串電阻（x=155）', outR.length === 3, 'rows=' + outR.join(','));
  ok('q8 MISO 在 Slave 側串電阻（x=307）', inR.length === 1, 'rows=' + inR.join(','));
  ok('q8 電阻確實靠源端（Master 右緣 140 < 155；Slave 左緣 350 > 307+28）', 140 < 155 && 350 > 335);
  // 箭頭方向：out 往右（apex.x > base.x）、MISO 往左
  const arrows = [...D.q8.matchAll(/<polygon points="(\d+),\d+ \d+,\d+ (\d+),\d+"/g)].map(m => ({ base: +m[1], apex: +m[2] }));
  const right = arrows.filter(a => a.apex > a.base).length, left = arrows.filter(a => a.apex < a.base).length;
  ok('q8 三條 Master 輸出箭頭朝右、MISO 朝左', right === 3 && left === 1, `right=${right} left=${left}`);
  ok('q8 電阻值 22-33 ohm', /22-33R here/.test(D.q8));
  ok('q8 說明串聯端接的作用', /damps reflections and slows the edge/.test(D.q8));
}

/* --- q9：下管型式決定答案 --- */
{
  const left = D.q9.slice(0, D.q9.indexOf('Non-synchronous'));
  ok('q9 標明答案是 Synchronous', /Synchronous  \(the answer\)/.test(D.q9));
  // 左：LS 方塊；右：二極體多邊形且沒有 LS 方塊
  const lsRects = [...D.q9.matchAll(/<rect x="(\d+)" y="104" width="36" height="24"/g)].map(m => +m[1]);
  ok('q9 只有左圖有 LS MOSFET 方塊', lsRects.length === 1 && lsRects[0] < 252, 'x=' + lsRects.join(','));
  const dio = D.q9.match(/<polygon points="(\d+),126 (\d+),126 (\d+),112"/);
  ok('q9 右圖用二極體符號', !!dio && +dio[1] > 252, 'x=' + (dio && dio[1]));
  // 二極體方向：陰極橫線在上（y=112，接 SW），三角形頂點朝上 → 續流由 GND 往 SW
  ok('q9 二極體陰極朝 SW（續流方向正確）', /<line x1="\d+" y1="112" x2="\d+" y2="112" stroke="#ffc107"/.test(D.q9) && !!dio);
  ok('q9 同步的優勢寫 RDS(on)', /drop = ID x RDS\(on\)/.test(D.q9));
  ok('q9 非同步的代價寫 VF 0.3-0.5V', /VF 0\.3-0\.5V/.test(D.q9));
  ok('q9 提到 dead time / shoot-through', /dead time \(no shoot-through\)/.test(D.q9));
}

/* --- q10：續流迴路必須走二極體、不走 HS --- */
{
  const hl = D.q10.match(/<path d="([^"]+)"[^>]*stroke="#eab308"/)[1];
  const segs = (() => { const pts = []; let cx = 0, cy = 0;
    hl.replace(/([MHVL])\s*([-\d.,]*)/g, (_, c, a) => { const n = a.split(',').filter(s => s !== '').map(Number);
      if (c === 'M') { cx = n[0]; cy = n[1]; pts.push([cx, cy]); }
      else if (c === 'H') { cx = n[0]; pts.push([cx, cy]); }
      else if (c === 'V') { cy = n[0]; pts.push([cx, cy]); }
      return ''; });
    const out = []; for (let i = 1; i < pts.length; i++) out.push([pts[i - 1], pts[i]]); return out; })();
  const hits = r => segs.some(([[x1, y1], [x2, y2]]) =>
    Math.min(x1, x2) <= r.x + r.w && Math.max(x1, x2) >= r.x && Math.min(y1, y2) <= r.y + r.h && Math.max(y1, y2) >= r.y);
  ok('q10 續流迴路經過 body diode 支路（x=118）', hits({ x: 110, y: 112, w: 16, h: 14 }));
  ok('q10 續流迴路不經過 HS（HS 已 OFF）', !hits({ x: 68, y: 38, w: 36, h: 24 }));
  ok('q10 續流迴路經過電感 L', hits({ x: 102, y: 82, w: 46, h: 20 }));
  const first = segs[0][0], last = segs[segs.length - 1][1];
  ok('q10 迴路封閉', first[0] === last[0] && first[1] === last[1], `${first} -> ${last}`);
  ok('q10 HS 標成 OFF 且畫灰', /stroke="#666"/.test(D.q10) && />OFF</.test(D.q10));
  ok('q10 body diode 陰極朝 SW', /<line x1="110" y1="112" x2="126" y2="112" stroke="#ffc107"/.test(D.q10)
    && /<polygon points="110,126 126,126 118,112"/.test(D.q10));
  ok('q10 說明 V = L di/dt', /V = L x di\/dt would spike/.test(D.q10));
  ok('q10 區分同步(body diode 0.7V) 與非同步(蕭特基 0.3V)', /VF ~0\.7V/.test(D.q10) && /VF ~0\.3V/.test(D.q10));
}

/* --- q11：Snubber 是串聯 RC，且波形要真的一個振鈴一個阻尼 --- */
{
  ok('q11 R 與 C 串聯後跨接 D-S', /<line x1="180" y1="66" x2="212" y2="66"/.test(D.q11)
    && /<rect x="212" y="56" width="36" height="20"/.test(D.q11)
    && /<line x1="266" y1="104" x2="266" y2="140"/.test(D.q11));
  ok('q11 標明要靠近 Q1', /as close to Q1 as possible/.test(D.q11));
  ok('q11 設計式 R = sqrt(Lstry/Coss), C > 2 Coss',
    /R = sqrt\(Lstry \/ Coss\)/.test(D.q11) && /C &gt; 2 x Coss/.test(D.q11));
  ok('q11 典型值 1-10 ohm / 100pF-1nF', /Typical R = 1-10 ohm, C = 100pF-1nF/.test(D.q11));
  ok('q11 標出 snubber 自身損耗', /P = C x VDS\^2 x fsw/.test(D.q11));
  const curves = [...D.q11.matchAll(/<polyline points="([^"]+)" fill="none" stroke="(#ff6b6b|#00ff88)"/g)]
    .map(m => ({ color: m[2], ys: m[1].split(' ').map(p => +p.split(',')[1]) }));
  ok('q11 兩條波形都在', curves.length === 2);
  const ring = curves.find(c => c.color === '#ff6b6b'), damp = curves.find(c => c.color === '#00ff88');
  const FINAL = 90;  // 150 - 60
  ok('q11 無 snubber 的曲線有過衝（越過穩態值）', Math.min(...ring.ys) < FINAL - 5, 'min y=' + Math.min(...ring.ys));
  ok('q11 有 snubber 的曲線無過衝', Math.min(...damp.ys) >= FINAL - 0.5, 'min y=' + Math.min(...damp.ys));
  ok('q11 兩條曲線最終都收到同一準位', Math.abs(ring.ys[ring.ys.length - 1] - FINAL) < 3 && Math.abs(damp.ys[damp.ys.length - 1] - FINAL) < 3);
  const zeroCross = ring.ys.filter((y, i) => i > 0 && ((ring.ys[i - 1] - FINAL) * (y - FINAL) < 0)).length;
  ok('q11 振鈴確實來回穿越穩態值（>= 2 次）', zeroCross >= 2, 'crossings=' + zeroCross);
}

console.log('\n' + (fail ? 'FAILED ' + fail : 'ALL PASS'));
process.exit(fail ? 1 : 0);
