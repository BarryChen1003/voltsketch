/** verify-batch3.js — 批次 3 的語意/幾何驗證（不是「有沒有 render」，是「畫的內容對不對」） */
const D = require('./batch3.js');
let fail = 0;
const ok = (n, c, d) => { console.log((c ? 'PASS ' : 'FAIL ') + n + (d ? '  ' + d : '')); if (!c) fail++; };
const texts = svg => [...svg.matchAll(/<text x="([\d.]+)" y="([\d.]+)"[^>]*>([^<]*)<\/text>/g)]
  .map(m => ({ x: +m[1], y: +m[2], s: m[3] }));

for (const [id, svg] of Object.entries(D)) {
  const vb = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
  const f = [...svg.matchAll(/font-size="([\d.]+)"/g)].map(m => +m[1]);
  ok(id + ' viewBox 寬 = 520', +vb[1] === 520, vb[1] + 'x' + vb[2]);
  ok(id + ' 字級 >= 11', Math.min(...f) >= 11, 'min=' + Math.min(...f));
  ok(id + ' 有 width 屬性', /<svg width="520"/.test(svg));
}

/* --- q1/q4：四個工作區必須落在正確象限（x=VBE 向右為正、y=VBC 向上為正） --- */
{
  ok('q1 與 q4 共用同一張圖', D.q1 === D.q4);
  const t = texts(D.q1);
  const ax = { x: 260, y: 140 };  // 原點
  const find = s => t.find(v => v.s.indexOf(s) === 0);
  const quad = v => (v.x > ax.x ? 'VBE+' : 'VBE-') + (v.y < ax.y ? ' VBC+' : ' VBC-');
  ok('q1 SATURATION 在 (VBE+, VBC+)', quad(find('SATURATION')) === 'VBE+ VBC+', quad(find('SATURATION')));
  ok('q1 ACTIVE 在 (VBE+, VBC-)', quad(find('ACTIVE')) === 'VBE+ VBC-', quad(find('ACTIVE')));
  ok('q1 CUTOFF 在 (VBE-, VBC-)', quad(find('CUTOFF')) === 'VBE- VBC-', quad(find('CUTOFF')));
  ok('q1 REVERSE ACTIVE 在 (VBE-, VBC+)', quad(find('REVERSE')) === 'VBE- VBC+', quad(find('REVERSE')));
  ok('q1 飽和標註兩接面順偏', /both junctions forward/.test(D.q1));
  ok('q1 截止標註兩接面反偏', /both junctions reverse/.test(D.q1));
  ok('q1 主動區標註 BE 順偏 / BC 反偏', /BE forward, BC reverse/.test(D.q1));
  ok('q1 飽和條件含過驅動 IB > IC/beta', /IB &gt; IC\/beta/.test(D.q1));
  ok('q1 VCE(sat) = 0.2V', /VCE\(sat\) = 0\.2V/.test(D.q1));
}

/* --- q2：曲線在 VTH 之前必須是 0，之後是平方律 --- */
{
  const pts = D.q2.match(/points="([^"]+)"/)[1].split(' ').map(p => p.split(',').map(Number));
  const XV = 200, Y0 = 180, XE = 440, YT = 60;
  const k = (Y0 - YT) / Math.pow(XE - XV, 2);
  const flat = pts.filter(p => p[0] <= XV);
  ok('q2 VTH 之前 ID = 0（曲線貼在軸上）', flat.every(p => p[1] === Y0), flat.length + ' 點');
  const bad = pts.filter(p => p[0] > XV).filter(p => Math.abs(p[1] - (Y0 - k * Math.pow(p[0] - XV, 2))) > 0.11);
  ok('q2 VTH 之後符合平方律 k(VGS-VTH)^2', bad.length === 0, bad.length + ' 個偏差點');
  const dash = D.q2.match(/<line x1="(\d+)" y1="60"[^>]*stroke-dasharray/);
  ok('q2 VTH 虛線落在曲線起翹點', dash && +dash[1] === XV, 'dash x=' + (dash && dash[1]));
  ok('q2 標明閘極電流極小', /gate draws ~pA/.test(D.q2));
}

/* --- q14：真值表每一格都要跟布林運算相符 --- */
{
  const rows = [...D.q14.matchAll(/<text x="(\d+)" y="(\d+)"[^>]*>([01])<\/text>/g)]
    .map(m => ({ x: +m[1], y: +m[2], v: +m[3] }));
  const cols = { A: 70, B: 120, AND: 195, OR: 258, NAND: 325, NOR: 395, XOR: 460 };
  const byRow = {};
  rows.forEach(r => { (byRow[r.y] = byRow[r.y] || {})[r.x] = r.v; });
  const ys = Object.keys(byRow).map(Number).sort((a, b) => a - b);
  ok('q14 四列資料', ys.length === 4, ys.join(','));
  let allOk = true, detail = [];
  ys.forEach(y => {
    const r = byRow[y], A = r[cols.A], B = r[cols.B];
    const want = { AND: A & B, OR: A | B, NAND: 1 - (A & B), NOR: 1 - (A | B), XOR: A ^ B };
    Object.entries(want).forEach(([g, v]) => {
      if (r[cols[g]] !== v) { allOk = false; detail.push(`A=${A} B=${B} ${g}: 圖上 ${r[cols[g]]} 應為 ${v}`); }
    });
  });
  ok('q14 全部 20 格與布林運算相符', allOk, detail.join(' | '));
  ok('q14 四列輸入涵蓋 00/01/10/11',
    JSON.stringify(ys.map(y => '' + byRow[y][cols.A] + byRow[y][cols.B])) === JSON.stringify(['00', '01', '10', '11']));
}

/* --- q15：反相器邏輯與靜態電流 --- */
{
  ok('q15 IN=0 -> OUT 高', /IN = 0.*N off.*OUT = 5V \(H\)/.test(D.q15));
  ok('q15 IN=1 -> OUT 低', /IN = 1.*N on.*OUT = ~0V \(L\)/.test(D.q15));
  ok('q15 靜態電流 5V/10k = 0.5mA', Math.abs(5 / 10000 - 0.0005) < 1e-9 && /Static current 5V\/10k = 0\.5mA/.test(D.q15));
  ok('q15 上拉是電阻、下拉是 FET（不對稱）', /Fall is FET-driven, rise is resistor-only/.test(D.q15));
  // 波形必須真的反相：把 IN / OUT 兩條 path 取樣比對
  const level = (d, x) => {           // 回傳該 x 位置的 y（只含 H/V/L 指令）
    let cx = 0, cy = 0, last = null;
    d.replace(/([MHVL])\s*([-\d.,]*)/g, (_, c, a) => {
      const n = a.split(',').filter(s => s !== '').map(Number);
      if (c === 'M') { cx = n[0]; cy = n[1]; }
      else if (c === 'H') { if (cx <= x) { cx = n[0]; if (cx >= x) last = cy; } else if (last === null) last = cy; }
      else if (c === 'V') { if (cx <= x) cy = n[0]; }
      else if (c === 'L') { if (cx <= x) { cx = n[0]; cy = n[1]; } }
      if (cx >= x && last === null) last = cy;
      return '';
    });
    return last === null ? cy : last;
  };
  const paths = [...D.q15.matchAll(/<path d="(M252,[^"]+)"/g)].map(m => m[1]);
  ok('q15 有 IN 與 OUT 兩條波形', paths.length === 2, paths.length + ' 條');
  const IN = paths[0], OUT = paths[1];
  const samples = [270, 330, 390, 460];
  const inHigh = samples.map(x => level(IN, x) === 70);
  const outHigh = samples.map(x => level(OUT, x) === 130);
  ok('q15 OUT 每一段都與 IN 相反',
    inHigh.every((v, i) => v !== outHigh[i]),
    'IN=' + inHigh.map(v => v ? 'H' : 'L').join('') + ' OUT=' + outHigh.map(v => v ? 'H' : 'L').join(''));
  ok('q15 OUT 上升緣帶斜率、下降緣瞬時', /H360 L380,130/.test(OUT) && /H300 V150/.test(OUT));
  // 幾何：上拉電阻在 OUT 節點之上，NMOS 在其下
  const r = [...D.q15.matchAll(/<rect x="132" y="(\d+)"/g)].map(m => +m[1]);
  ok('q15 電阻在上、NMOS 在下', r.length === 2 && r[0] < 114 && r[1] > 114, r.join(','));
}

/* --- q16：I2C Fast mode 規格值與時序關係 --- */
{
  ok('q16 tHIGH >= 0.6us', /tHIGH &gt;= 0\.6us/.test(D.q16));
  ok('q16 tLOW >= 1.3us', /tLOW &gt;= 1\.3us/.test(D.q16));
  ok('q16 tr, tf <= 300ns', /tr, tf &lt;= 300ns/.test(D.q16));
  ok('q16 tSU;DAT >= 100ns', /tSU;DAT &gt;= 100ns/.test(D.q16));
  ok('q16 tHD;DAT >= 0', /tHD;DAT &gt;= 0/.test(D.q16));
  // 幾何：SDA 換值必須早於 SCL 上升緣，且 setup 尺標剛好連這兩點
  const sda = D.q16.match(/M70,210 H(\d+) V180/);
  // 路徑 "L250,120 H320 L350,80"：低準位 250→320，上升緣起點 320、結束 350。
  // t_SU;DAT 與 t_LOW 都以「上升緣起點」為參考，不是上升結束。
  const scl = D.q16.match(/L(\d+),120 H(\d+) L(\d+),80/);
  const lowStart = +scl[1], riseStart = +scl[2], riseEnd = +scl[3];
  const arrow = D.q16.match(/<line x1="(\d+)" y1="224" x2="(\d+)" y2="224"/);
  const sdaChange = +sda[1];
  ok('q16 SDA 先穩定、SCL 後上升', sdaChange < riseStart, `SDA@${sdaChange} < rise start@${riseStart}`);
  ok('q16 tSU;DAT 尺標 = SDA 換值到 SCL 上升緣',
    arrow && +arrow[1] === sdaChange && +arrow[2] === riseStart, arrow && arrow[1] + '->' + arrow[2]);
  const low = D.q16.match(/<line x1="(\d+)" y1="170" x2="(\d+)" y2="170"/);
  ok('q16 tLOW 尺標對齊低準位區間', low && +low[1] === lowStart && +low[2] === riseStart, low && low[1] + '->' + low[2]);
  ok('q16 上升緣有斜率（tr 不是瞬間）', riseEnd > riseStart, `${riseStart}->${riseEnd}`);
}

/* --- q22：剖面必須按比例（8px = 1mil） --- */
{
  const tr = [...D.q22.matchAll(/<rect x="(\d+)" y="90" width="(\d+)" height="10" fill="#ffc107"/g)].map(m => ({ x: +m[1], w: +m[2] }));
  const die = D.q22.match(/<rect x="80" y="(\d+)" width="360" height="(\d+)" fill="none"/);
  const plane = D.q22.match(/<rect x="80" y="(\d+)" width="360" height="10" fill="#4b5563"/);
  const SCALE = 8;
  ok('q22 兩條走線', tr.length === 2);
  ok('q22 W = 5mil（40px）', tr.every(t => t.w === 5 * SCALE), tr.map(t => t.w).join(','));
  const S = tr[1].x - (tr[0].x + tr[0].w);
  ok('q22 S = 5mil（40px）', S === 5 * SCALE, 'S=' + S + 'px');
  const H = +plane[1] - (+die[1]);
  ok('q22 H = 4mil（32px，走線底到平面頂）', H === 4 * SCALE, 'H=' + H + 'px');
  ok('q22 er = 4.2 標在介電層', /er = 4\.2/.test(D.q22));
  ok('q22 Zdiff 公式含 0.48 與 0.96 係數', /1 - 0\.48 x exp\(-0\.96 x S\/H\)/.test(D.q22));
  // 公式自洽性：S/H = 5/4 = 1.25 -> 耦合因子
  const factor = 1 - 0.48 * Math.exp(-0.96 * (5 / 4));
  ok('q22 該幾何的耦合因子 = 0.855（Zdiff = 1.71 x Zo）', Math.abs(factor - 0.8554) < 0.001, 'factor=' + factor.toFixed(4));
}

console.log('\n' + (fail ? 'FAILED ' + fail : 'ALL PASS'));
process.exit(fail ? 1 : 0);
