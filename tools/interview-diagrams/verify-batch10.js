/** verify-batch10.js — q1/q4/q10/q13/q15 的語意驗證（符號庫版） */
const D = require('./batch10.js');
let fail = 0;
const ok = (n, c, d) => { console.log((c ? 'PASS ' : 'FAIL ') + n + (d ? '  ' + d : '')); if (!c) fail++; };

for (const [id, svg] of Object.entries(D)) {
  const vb = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
  const f = [...svg.matchAll(/font-size="([\d.]+)"/g)].map(m => +m[1]);
  ok(id + ' 白底 + width 屬性 + 字級>=11',
    /<rect width="\d+" height="\d+" fill="#ffffff"\/>/.test(svg) && /<svg width="520"/.test(svg) && Math.min(...f) >= 11);
  ok(id + ' 用的是符號庫（有 data-sym）', /data-sym="/.test(svg));
}

/* q1/q4：NPN 與量測 */
{
  ok('q1 = q4 同一張', D.q1 === D.q4);
  ok('q1 用 Sym.npn 畫電晶體', /data-sym="npn"/.test(D.q1));
  // 集極在上、射極在下（pins.bjt：c 在 y-30、e 在 y+30）
  const c = D.q1.match(/<line x1="158" y1="120" x2="158" y2="(\d+)"/);
  const e = D.q1.match(/<line x1="158" y1="180" x2="158" y2="(\d+)"/);
  ok('q1 集極往上、射極往下', c && e && +c[1] < 120 && +e[1] > 180, `C->${c && c[1]}, E->${e && e[1]}`);
  // VBC 跨集極電位(96)到基極電位(150)；VBE 跨基極(150)到射極(204)
  const vbc = D.q1.match(/<line x1="84" y1="96" x2="84" y2="(\d+)"/);
  const vbe = D.q1.match(/<line x1="68" y1="150" x2="68" y2="(\d+)"/);
  ok('q1 VBC 量在集極與基極之間', vbc && +vbc[1] === 150);
  ok('q1 VBE 量在基極與射極之間', vbe && +vbe[1] === 204);
  const regions = [...D.q1.matchAll(/<text x="282" y="(\d+)"[^>]*font-weight="bold">([A-Z ]+)<\/text>/g)].map(m => m[2]);
  ok('q1 四個工作區齊全', regions.length === 4, regions.join(' / '));
  const want = ['SATURATION', 'ACTIVE', 'CUTOFF', 'REVERSE ACTIVE'];
  ok('q1 四區順序與名稱正確', JSON.stringify(regions) === JSON.stringify(want));
  // 偏壓組合逐列比對
  const rowY = [106, 136, 166, 196];
  const cell = (y, x) => (D.q1.match(new RegExp(`<text x="${x}" y="${y}"[^>]*>(fwd|rev)<`)) || [])[1];
  const combos = rowY.map(y => [cell(y, 430), cell(y, 478)]);
  ok('q1 偏壓組合 = 順順 / 順反 / 反反 / 反順',
    JSON.stringify(combos) === JSON.stringify([['fwd', 'fwd'], ['fwd', 'rev'], ['rev', 'rev'], ['rev', 'fwd']]),
    JSON.stringify(combos));
}

/* q13：兩相高亮 */
{
  const hls = [...D.q13.matchAll(/<path d="([^"]+)" fill="none" stroke="#f59e0b"/g)].map(m => m[1]);
  ok('q13 兩條電流路徑', hls.length === 2);
  ok('q13 相 1 從 VIN 軌出發（y=78）', /^M \d+ 78 /.test(hls[0]), hls[0]);
  ok('q13 相 1 不封閉（電流回輸入源，不畫）', !/H \d+$/.test(hls[0]));
  ok('q13 相 2 是封閉續流迴路', /^M (\d+) 250 [\s\S]*H \1$/.test(hls[1]), hls[1]);
  ok('q13 兩相都經過電感節點 y=166', hls.every(d => d.includes('166')));
  ok('q13 di/dt 兩相方向相反', /di\/dt = \(VIN - VOUT\) \/ L/.test(D.q13) && /di\/dt = -VOUT \/ L/.test(D.q13));
}

/* q10：續流走體二極體 */
{
  const loop = D.q10.match(/<path d="([^"]+)" fill="none" stroke="#f59e0b"/)[1];
  ok('q10 續流迴路封閉', /^M (\d+) 250 [\s\S]*H \1$/.test(loop), loop);
  ok('q10 迴路不經過 VIN 軌（HS 已關）', !loop.includes(' 78 '), loop);
  ok('q10 HS 標成 OFF', />OFF</.test(D.q10));
  ok('q10 點名體二極體就在 FET 符號裡', /body diode \(drawn/.test(D.q10) && /inside the FET\)/.test(D.q10));
  ok('q10 區分同步 0.7V 與非同步 0.3V', /VF ~0\.7V/.test(D.q10) && /VF ~0\.3V/.test(D.q10));
}

/* q15：反相器與波形 */
{
  // 只挑波形：Sym.resistor 的鋸齒也是 polyline 而且同樣是符號藍，用起點 x=284 過濾
  const polys = [...D.q15.matchAll(/<polyline points="(284,[^"]+)"[^>]*stroke="(#b45309|#1f4fd1)"/g)]
    .map(m => ({ color: m[2], pts: m[1].split(' ').map(p => p.split(',').map(Number)) }));
  ok('q15 有 IN 與 OUT 兩條波形', polys.length === 2);
  const IN = polys.find(p => p.color === '#b45309'), OUT = polys.find(p => p.color === '#1f4fd1');
  const level = (pts, x) => { let y = pts[0][1];
    for (let i = 1; i < pts.length; i++) { if (pts[i - 1][0] <= x) y = pts[i - 1][1]; }
    return y; };
  const samples = [300, 345, 400, 460];
  const inHigh = samples.map(x => level(IN.pts, x) === 74);
  const outHigh = samples.map(x => level(OUT.pts, x) === 154);
  ok('q15 OUT 每段都與 IN 相反',
    inHigh.every((v, i) => v !== outHigh[i]),
    'IN=' + inHigh.map(v => v ? 'H' : 'L').join('') + ' OUT=' + outHigh.map(v => v ? 'H' : 'L').join(''));
  // 下降瞬時（x 不變）、上升帶斜率（x 有變）
  const seg = [];
  for (let i = 1; i < OUT.pts.length; i++) seg.push([OUT.pts[i - 1], OUT.pts[i]]);
  const falls = seg.filter(([a, b]) => b[1] > a[1]), rises = seg.filter(([a, b]) => b[1] < a[1]);
  ok('q15 OUT 下降緣瞬時（FET 主動拉低）', falls.every(([a, b]) => a[0] === b[0]), falls.length + ' 個下降緣');
  ok('q15 OUT 上升緣帶斜率（只有電阻拉高）', rises.every(([a, b]) => b[0] > a[0]), rises.length + ' 個上升緣');
  ok('q15 靜態電流 5V/10k = 0.5mA', Math.abs(5 / 10000 - 5e-4) < 1e-12 && /5V\/10k = 0\.5mA/.test(D.q15));
  ok('q15 上拉是電阻、下拉是 FET', /Fall is FET-driven, rise is resistor-only/.test(D.q15));
}

console.log('\n' + (fail ? 'FAILED ' + fail : 'ALL PASS'));
process.exit(fail ? 1 : 0);
