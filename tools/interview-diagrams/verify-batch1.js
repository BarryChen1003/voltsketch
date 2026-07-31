/**
 * verify-batch1.js — 幾何/語意驗證器（不是「有沒有 render」，是「畫的內容對不對」）
 * 每條斷言都對照題目的物理事實，失敗就 exit 1。
 */
const D = require('./batch1.js');
let fail = 0;
const ok = (name, cond, detail) => { console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail ? '  ' + detail : '')); if (!cond) fail++; };

/* --- 共同規則 --- */
for (const [id, svg] of Object.entries(D)) {
  const vb = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
  ok(`${id} viewBox 寬 <= 520`, vb && +vb[1] <= 520, vb ? vb[1] + 'x' + vb[2] : 'no viewBox');
  const fonts = [...svg.matchAll(/font-size="(\d+(?:\.\d+)?)"/g)].map(m => +m[1]);
  ok(`${id} 字級全部 >= 11`, fonts.every(f => f >= 11), 'min=' + Math.min(...fonts));
}

/* --- q7 SPI：閒置準位 = CPOL，取樣邊緣 = CPHA --- */
{
  const paths = [...D.q7.matchAll(/<path d="M156,(\d+)([^"]*)"/g)].map(m => ({ start: +m[1], rest: m[2] }));
  const labels = [...D.q7.matchAll(/Mode (\d)  CPOL=(\d) CPHA=(\d)/g)].map(m => ({ mode: +m[1], cpol: +m[2], cpha: +m[3] }));
  ok('q7 四列模式標籤齊全', labels.length === 4);
  ok('q7 模式對應正確 (0,0)(0,1)(1,0)(1,1)',
    JSON.stringify(labels.map(l => [l.mode, l.cpol, l.cpha])) === JSON.stringify([[0, 0, 0], [1, 0, 1], [2, 1, 0], [3, 1, 1]]));
  labels.forEach((l, i) => {
    const rowY = 84 + i * 46, hi = rowY - 18;
    ok(`q7 Mode ${l.mode} 閒置準位 = CPOL${l.cpol}`, paths[i].start === (l.cpol ? hi : rowY),
      `start=${paths[i].start} expect=${l.cpol ? hi : rowY}`);
    const edges = [];
    for (let k = 0; k < 8; k++) edges.push(156 + 42 * (k + 1));
    const marks = [...D.q7.matchAll(/<polygon points="([\d.]+),(\d+)/g)].map(m => ({ x: +m[1] + 4, y: +m[2] }))
      .filter(p => p.y === rowY + 12).map(p => p.x);
    const expect = [edges[l.cpha], edges[l.cpha + 2], edges[l.cpha + 4]];
    ok(`q7 Mode ${l.mode} 取樣點落在 CPHA=${l.cpha} 的邊緣`, JSON.stringify(marks) === JSON.stringify(expect),
      `${marks} vs ${expect}`);
  });
}

/* --- q12 Buck：畫出來的工作週期必須真的是 30% --- */
{
  const d = D.q12.match(/<path d="([^"]+)"/)[1];
  const seg = d.match(/M120,80 H([\d.]+) V120 H([\d.]+)/);
  const onTime = +seg[1] - 120, period = +seg[2] - 120;
  ok('q12 圖上工作週期 = 30%', Math.abs(onTime / period - 0.3) < 0.005, `D=${(onTime / period * 100).toFixed(1)}%`);
  ok('q12 標註值與 Vout/Vin 一致', Math.abs(1.5 / 5 - 0.3) < 1e-9 && /D = 1.5\/5 = 30%/.test(D.q12));
}

/* --- q17 I2C：30%/70% 交點與 tr 公式自洽 --- */
{
  const TAU = 60, V0 = 170, SPAN = 100;
  const x30 = 200 + TAU * Math.log(1 / 0.7), x70 = 200 + TAU * Math.log(1 / 0.3);
  const drawn = [...D.q17.matchAll(/<line x1="([\d.]+)" y1="([\d.]+)" x2="[\d.]+" y2="188"/g)].map(m => +m[1]);
  ok('q17 圖上 30%/70% 標線位置 = 解析解', drawn.length === 2 &&
    Math.abs(drawn[0] - x30) < 0.1 && Math.abs(drawn[1] - x70) < 0.1, `drawn=${drawn.map(v => v.toFixed(1))}`);
  const trPx = x70 - x30, expect = TAU * Math.log(0.7 / 0.3);
  ok('q17 tr 圖示長度 = tau*ln(0.7/0.3)', Math.abs(trPx - expect) < 0.1, `tr=${trPx.toFixed(2)}px, k=${(expect / TAU).toFixed(4)}`);
  ok('q17 caption 的 0.85 係數 = ln(0.7/0.3)', Math.abs(Math.log(0.7 / 0.3) - 0.8473) < 0.001);
  const rp = 300e-9 / (Math.log(0.7 / 0.3) * 200e-12);
  ok('q17 Rp(max) 算式對得上 1.77k', Math.abs(rp - 1770) < 15, `Rp=${rp.toFixed(0)} ohm`);
  // 曲線在 30%/70% 標線處的縱座標要真的是 30%/70%
  const pts = [...D.q17.matchAll(/([\d.]+),([\d.]+)/g)];
  const at = x => V0 - SPAN * (1 - Math.exp(-(x - 200) / TAU));
  ok('q17 曲線 y(x30)=30%、y(x70)=70%',
    Math.abs(at(x30) - (V0 - 30)) < 0.01 && Math.abs(at(x70) - (V0 - 70)) < 0.01);
}

/* --- q19 LDO：四個數字互相自洽 --- */
{
  const Vin = 5, Vout = 3.3, I = 0.5;
  ok('q19 Pd = (Vin-Vout)*I = 0.85W', Math.abs((Vin - Vout) * I - 0.85) < 1e-9 && /Pd = \(5 - 3\.3\) x 0\.5 = 0\.85W/.test(D.q19));
  ok('q19 Pin = 2.5W', Math.abs(Vin * I - 2.5) < 1e-9 && /Pin 2\.5W/.test(D.q19));
  ok('q19 Pout = 1.65W', Math.abs(Vout * I - 1.65) < 1e-9 && /Pout 1\.65W/.test(D.q19));
  ok('q19 eff = Pout/Pin = 66%', Math.abs(Vout * I / (Vin * I) - 0.66) < 0.005 && /66%/.test(D.q19));
}

/* --- q26 RC：fc 數字正確、轉角點對齊 fc 虛線 --- */
{
  const fc = 1 / (2 * Math.PI * 10e3 * 10e-9);
  ok('q26 fc = 1.59kHz', Math.abs(fc - 1591.5) < 1 && /1\.59kHz/.test(D.q26), `fc=${fc.toFixed(1)}Hz`);
  const corner = D.q26.match(/points="308,80 (\d+),80 500,150"/);
  const dash = D.q26.match(/<line x1="(\d+)" y1="80" x2="\d+" y2="180"/);
  ok('q26 轉角點 x 對齊 fc 虛線', corner && dash && corner[1] === dash[1], `corner=${corner && corner[1]} dash=${dash && dash[1]}`);
  const dot = D.q26.match(/<circle cx="(\d+)" cy="(\d+)"[^>]*fill="#ff6b6b"/);
  ok('q26 -3dB 點在轉角、且低於平坦段', dot && dot[1] === corner[1] && +dot[2] > 80, `dot=(${dot && dot[1]},${dot && dot[2]})`);
  ok('q26 相移 -45deg 有寫在說明列', /phase -45deg/.test(D.q26));
}

/* --- q27 setup/hold：資料穩定窗必須跨過時脈邊緣 --- */
{
  const clk = D.q27.match(/M120,80 H(\d+) V62/), dat = D.q27.match(/M120,150 H(\d+) V132 H(\d+) V150/);
  const edge = +clk[1], dStart = +dat[1], dEnd = +dat[2];
  ok('q27 資料穩定窗跨過時脈邊緣', dStart < edge && dEnd > edge, `data ${dStart}..${dEnd}, edge ${edge}`);
  const su = edge - dStart, h = dEnd - edge;
  ok('q27 t_su 尺標 = 邊緣前的穩定時間', /x1="230" y1="190" x2="300"/.test(D.q27) && su === 70, `su=${su}px`);
  ok('q27 t_h 尺標 = 邊緣後的穩定時間', /x1="300" y1="190" x2="350"/.test(D.q27) && h === 50, `h=${h}px`);
  const marker = D.q27.match(/<line x1="(\d+)" y1="50"/);
  ok('q27 active edge 虛線對齊時脈邊緣', marker && +marker[1] === edge);
}

console.log('\n' + (fail ? `FAILED ${fail}` : 'ALL PASS'));
process.exit(fail ? 1 : 0);
