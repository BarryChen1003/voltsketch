/**
 * verify-batch2.js — q5 / q6 / q13 重畫版的語意驗證。
 * 重點是「畫的拓樸對不對」與「q6 的內容錯有沒有真的修掉」。
 */
const D = require('./batch2.js');
let fail = 0;
const ok = (n, c, d) => { console.log((c ? 'PASS ' : 'FAIL ') + n + (d ? '  ' + d : '')); if (!c) fail++; };
const rects = svg => [...svg.matchAll(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"[^>]*stroke="(#[0-9a-f]{6})"/g)]
  .map(m => ({ x: +m[1], y: +m[2], w: +m[3], h: +m[4], stroke: m[5] }));
const segs = d => { const pts = []; let cx = 0, cy = 0;
  d.replace(/([MHVL])\s*([-\d.,\s]*)/g, (_, c, a) => { const n = a.trim().split(/[\s,]+/).filter(s => s !== '').map(Number);
    if (c === 'M') { cx = n[0]; cy = n[1]; pts.push([cx, cy]); }
    else if (c === 'H') n.forEach(v => { cx = v; pts.push([cx, cy]); });
    else if (c === 'V') n.forEach(v => { cy = v; pts.push([cx, cy]); });
    return ''; });
  const out = []; for (let i = 1; i < pts.length; i++) out.push([pts[i - 1], pts[i]]); return out; };
const hitsRect = (d, r) => segs(d).some(([[x1, y1], [x2, y2]]) =>
  Math.min(x1, x2) <= r.x + r.w && Math.max(x1, x2) >= r.x && Math.min(y1, y2) <= r.y + r.h && Math.max(y1, y2) >= r.y);

for (const [id, svg] of Object.entries(D)) {
  const vb = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
  const fonts = [...svg.matchAll(/font-size="([\d.]+)"/g)].map(m => +m[1]);
  ok(`${id} viewBox 寬 = 520`, +vb[1] === 520, vb[1] + 'x' + vb[2]);
  ok(`${id} 字級 >= 11`, Math.min(...fonts) >= 11, 'min=' + Math.min(...fonts));
  ok(`${id} 桌機有效字級 >= 11px`, Math.min(...fonts) * 520 / +vb[1] >= 11);
}

/* --- q5：Push-Pull 有 PMOS，Open-Drain 沒有、改用 Rp --- */
{
  const r = rects(D.q5);
  const left = r.filter(x => x.x < 260), right = r.filter(x => x.x >= 260);
  ok('q5 左側 Push-Pull = 上 P + 下 N 兩顆電晶體', left.length === 2 && left[0].y < left[1].y, `left=${left.length}`);
  ok('q5 右側 Open-Drain = 上 Rp + 下 N', right.length === 2);
  ok('q5 上臂標示：左 P、右 Rp', /<text x="130" y="81"[^>]*>P</.test(D.q5) && /<text x="390" y="81"[^>]*>Rp</.test(D.q5));
  ok('q5 Open-Drain 側沒有 PMOS 標記', !/<text x="390"[^>]*>P<\/text>/.test(D.q5));
  ok('q5 高準位敘述：左主動推、右靠上拉',
    /H: P on\s+-> drives VDD/.test(D.q5) && /H: N off -> Rp pulls up/.test(D.q5));
}

/* --- q6：clock stretching 必須寫進去，且不得再出現「單向」 --- */
{
  ok('q6 明確寫出 clock stretching', /clock stretching/.test(D.q6));
  ok('q6 說明 slave 可以把 SCL 拉低', /slave may hold it LOW/.test(D.q6));
  ok('q6 不再宣稱 SCL 單向', !/單向/.test(D.q6) && !/unidirectional/i.test(D.q6));
  ok('q6 SDA 標為雙向', /SDA: bidirectional/.test(D.q6));
  ok('q6 Cb 上限 400pF（I2C 規格）', /Cb\(total\) &lt;= 400pF/.test(D.q6));
  const dev = (D.q6.match(/rx="4"/g) || []).length;
  ok('q6 三個裝置（Master + 2 Slave）', dev === 3, `boxes=${dev}`);
  const pull = (D.q6.match(/>Rp</g) || []).length;
  ok('q6 兩顆上拉電阻（SCL/SDA 各一）', pull === 2, `Rp=${pull}`);
  // 接線是從裝置頂邊 (y1=168) 往上接匯流排
  const stubs = (D.q6.match(/y1="168"/g) || []).length;
  const toSCL = (D.q6.match(/y1="168" x2="\d+" y2="104"/g) || []).length;
  const toSDA = (D.q6.match(/y1="168" x2="\d+" y2="132"/g) || []).length;
  ok('q6 每個裝置都接兩條匯流排（6 條接線）', stubs === 6, `stubs=${stubs}`);
  ok('q6 三條接 SCL、三條接 SDA', toSCL === 3 && toSDA === 3, `SCL=${toSCL} SDA=${toSDA}`);
}

/* --- q13：兩相的導通路徑必須各自穿過正確的開關 --- */
{
  const hl = [...D.q13.matchAll(/<path d="([^"]+)"[^>]*stroke="#eab308"/g)].map(m => m[1]);
  ok('q13 兩相各有一條高亮路徑', hl.length === 2);
  const HS1 = { x: 58, y: 38, w: 36, h: 24 }, LS1 = { x: 58, y: 104, w: 36, h: 24 };
  const HS2 = { x: 318, y: 38, w: 36, h: 24 }, LS2 = { x: 318, y: 104, w: 36, h: 24 };
  ok('q13 Phase 1 走上管 HS', hitsRect(hl[0], HS1));
  ok('q13 Phase 1 不走下管 LS', !hitsRect(hl[0], LS1));
  ok('q13 Phase 2 走下管 LS（電感續流）', hitsRect(hl[1], LS2));
  ok('q13 Phase 2 不走上管 HS', !hitsRect(hl[1], HS2));
  const closed = segs(hl[1]);
  const first = closed[0][0], last = closed[closed.length - 1][1];
  ok('q13 Phase 2 是封閉迴路（續流不經輸入源）', first[0] === last[0] && first[1] === last[1], `${first} -> ${last}`);
  ok('q13 di/dt 標註方向正確', /iL rises, di\/dt = \(VIN - VOUT\)\/L/.test(D.q13) && /iL falls, di\/dt = -VOUT\/L/.test(D.q13));
}

console.log('\n' + (fail ? `FAILED ${fail}` : 'ALL PASS'));
process.exit(fail ? 1 : 0);
