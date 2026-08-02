/** verify-batch11.js — q6/q8/q11/q19/q21/q33/q25/q36 的語意驗證（符號庫版）
 *  重疊由 interview-diagram-check.js 管；這裡只問「畫的東西對不對」。 */
const D = require('./batch11.js');
let fail = 0;
const ok = (n, c, d) => { console.log((c ? 'PASS ' : 'FAIL ') + n + (d ? '  ' + d : '')); if (!c) fail++; };
const count = (s, re) => (s.match(re) || []).length;

/* ---------- 共同規格 ---------- */
for (const [id, svg] of Object.entries(D)) {
  const f = [...svg.matchAll(/font-size="([\d.]+)"/g)].map(m => +m[1]);
  ok(id + ' 白底 + width 520 + 字級>=11',
    /<rect width="\d+" height="\d+" fill="#ffffff"\/>/.test(svg) && /<svg width="520"/.test(svg) && Math.min(...f) >= 11,
    'min font ' + Math.min(...f));
  ok(id + ' 用符號庫（有 data-sym）', /data-sym="/.test(svg));
  // 除了白底與 Sym.ic / 長條圖的 rect，不准有自己刻的方框元件
  const rects = [...svg.matchAll(/<rect[^>]*>/g)].map(m => m[0]);
  const boxes = rects.filter(r => !/fill="#ffffff"\/>$/.test(r));
  const legit = boxes.filter(r => /fill="#fff"/.test(r) || /opacity="0\.18"/.test(r));
  ok(id + ' 沒有手刻方框元件', boxes.length === legit.length, boxes.length + ' 個框，合法 ' + legit.length);
}

/* ---------- q6：I2C ---------- */
{
  const s = D.q6;
  ok('q6 上拉電阻是鋸齒 x2', count(s, /data-sym="resistor"/g) === 2);
  ok('q6 兩顆 Rp 都掛在同一條 VDD 支線 (y=80)',
    /x1="60" y1="80" x2="60" y2="86"/.test(s) && /x1="110" y1="80" x2="110" y2="86"/.test(s));
  ok('q6 Rp 下端分別落在 SCL(150) 與 SDA(190)',
    /x1="60" y1="134" x2="60" y2="150"/.test(s) && /x1="110" y1="134" x2="110" y2="190"/.test(s));
  ok('q6 一主二從（3 個 IC 框）', count(s, /data-sym="ic"/g) === 3);
  // 每個裝置兩個接點：SCL 一個、SDA 一個
  const jSCL = [...s.matchAll(/<circle cx="(\d+)" cy="150" r="2\.6"/g)].map(m => +m[1]);
  const jSDA = [...s.matchAll(/<circle cx="(\d+)" cy="190" r="2\.6"/g)].map(m => +m[1]);
  ok('q6 三個裝置各接一次 SCL', JSON.stringify(jSCL) === JSON.stringify([70, 250, 410]), jSCL.join(','));
  ok('q6 三個裝置各接一次 SDA + 上拉', JSON.stringify(jSDA) === JSON.stringify([110, 290, 450]), jSDA.join(','));
  ok('q6 標出開汲極只能拉低', /can only pull LOW/.test(s));
  ok('q6 SCL 由 master 驅動、slave 只能 stretch', /master drives, slave may stretch/.test(s));
  ok('q6 SDA 是雙向', /SDA is bidirectional/.test(s));
  // Rp 上下限：4.7k 落在 min/max 之間才是合理的建議值
  const rpMin = (3.3 - 0.4) / 3e-3;                 // ~967 ohm
  const rpMax = 1e-6 / (0.8473 * 400e-12);          // tr=1us, Cb=400pF -> ~2.95k
  ok('q6 建議的 4.7k 與式子一致（1k < Rp，且註明上限由 tr/Cb 決定）',
    /4\.7k/.test(s) && /\(VDD-VOL\)\/IOL ~ 1k/.test(s) && /0\.847 x Cb/.test(s) && Math.round(rpMin) === 967 && rpMax > 2000,
    `Rp(min)=${rpMin.toFixed(0)} Rp(max@1us)=${rpMax.toFixed(0)}`);
}

/* ---------- q8：SPI 串聯電阻 ---------- */
{
  const s = D.q8;
  ok('q8 四條線各一顆鋸齒電阻', count(s, /data-sym="resistor"/g) === 4);
  // Sym.resistor 水平版第一段是 ln(x-24,y,x-12,y)，用它取電阻中心
  const rs = [...s.matchAll(/data-sym="resistor"><line x1="(\d+)" y1="(\d+)"/g)].map(m => ({ x: +m[1] + 24, y: +m[2] }));
  const master = rs.filter(r => r.y !== 196), miso = rs.filter(r => r.y === 196);
  ok('q8 master 驅動的三條（SCLK/MOSI/CS#）電阻在 master 側',
    master.length === 3 && master.every(r => r.x === 170), JSON.stringify(master));
  ok('q8 MISO 的電阻改放 slave 側', miso.length === 1 && miso[0].x === 355, JSON.stringify(miso));
  ok('q8 電阻都比中線(262)更靠自己的驅動端',
    master.every(r => r.x < 262) && miso[0].x > 262);
  // 箭頭方向：三角形的頂點決定指向
  const tri = [...s.matchAll(/<polygon points="(\d+),(\d+) \d+,\d+ (\d+),(\d+)"/g)].map(m => ({ from: +m[1], to: +m[3], y: +m[2] }));
  const right = tri.filter(t => t.to > t.from), left = tri.filter(t => t.to < t.from);
  ok('q8 三條 master->slave 箭頭朝右、MISO 朝左',
    right.length === 3 && left.length === 1 && left[0].y === 192, JSON.stringify({ right: right.length, left: left.length }));
  ok('q8 阻值 22-33 ohm', /22-33 ohm/.test(s));
  ok('q8 說明串聯端接的道理', /R \+ Rout ~ Z0/.test(s) && /at the driver/.test(s));
}

/* ---------- q11：RC Snubber ---------- */
{
  const s = D.q11;
  ok('q11 snubber 是一顆電阻 + 一顆電容', count(s, /data-sym="resistor"/g) === 1 && count(s, /data-sym="capacitor"/g) === 1);
  ok('q11 R 與 C 串聯（同一條 x=215）',
    /x1="215" y1="156" x2="215" y2="162"/.test(s), 'R 底 156 -> C 頂 162');
  ok('q11 上端接汲極節點(150,104)、下端接源極節點(150,206)',
    /x1="150" y1="104" x2="215" y2="104"/.test(s) && /x1="215" y1="206" x2="150" y2="206"/.test(s));
  ok('q11 主開關是真的 MOSFET（有體二極體）', /data-sym="nmos"/.test(s));
  ok('q11 有寄生電感 Lstray', /data-sym="inductor"/.test(s) && /Lstray/.test(s));
  // 波形：紅（無 snubber）必須衝破 VBR 線 y=92；綠（有 snubber）不能破線；兩者都收斂回 140
  const wave = c => {
    const m = s.match(new RegExp(`<polyline points="(302,190[^"]+)"[^>]*stroke="${c}"`));
    return m ? m[1].split(' ').map(p => p.split(',').map(Number)) : null;
  };
  const red = wave('#b91c1c'), green = wave('#15803d');
  ok('q11 兩條 VDS 波形都在', !!red && !!green);
  const peak = pts => Math.min(...pts.map(p => p[1]));
  const settle = pts => pts[pts.length - 1][1];
  ok('q11 無 snubber 的尖峰越過 VBR(DSS) 線 y=92', peak(red) < 92, 'peak y=' + peak(red).toFixed(1));
  ok('q11 有 snubber 的尖峰壓在 VBR 線之下', peak(green) > 92, 'peak y=' + peak(green).toFixed(1));
  ok('q11 兩條都收斂到 VIN 準位 140',
    Math.abs(settle(red) - 140) < 6 && Math.abs(settle(green) - 140) < 6,
    `red ${settle(red)}, green ${settle(green)}`);
  // 綠色振鈴要比紅色衰減快（snubber 的重點）
  const swing = pts => pts.filter(p => p[0] > 380).reduce((a, p) => Math.max(a, Math.abs(p[1] - 140)), 0);
  ok('q11 加了 snubber 之後殘餘振鈴明顯較小', swing(green) < swing(red) / 2,
    `red ${swing(red).toFixed(1)} vs green ${swing(green).toFixed(1)}`);
  ok('q11 給出設計式 R=sqrt(Lstray/Coss), C>2Coss', /sqrt\(Lstray\/Coss\)/.test(s) && /C > 2 x Coss/.test(s));
  ok('q11 交代要放在 FET 腳邊', /at the FET pins/.test(s));
}

/* ---------- q19：LDO 損耗 ---------- */
{
  const s = D.q19;
  const VIN = 5, VOUT = 3.3, IL = 0.5, RTH = 50, TA = 25;
  const ploss = (VIN - VOUT) * IL, pout = VOUT * IL, eff = VOUT / VIN, tj = TA + ploss * RTH;
  ok('q19 算式自洽：Ploss 0.85W / Pout 1.65W / eff 66% / TJ 67.5C',
    Math.abs(ploss - 0.85) < 1e-9 && Math.abs(pout - 1.65) < 1e-9 &&
    Math.round(eff * 100) === 66 && Math.abs(tj - 67.5) < 1e-9);
  ok('q19 圖上數字與算式一致',
    /0\.85W heat/.test(s) && /1\.65W out/.test(s) && /2\.5W in/.test(s) &&
    /66% efficient/.test(s) && /67\.5 C/.test(s));
  // 長條比例要等於功率比例
  const bars = [...s.matchAll(/<rect x="360" y="(\d+)" width="40" height="(\d+)"[^>]*stroke="(#[0-9a-f]{6})"/g)]
    .map(m => ({ y: +m[1], h: +m[2], c: m[3] }));
  const heat = bars.find(b => b.c === '#b91c1c'), out = bars.find(b => b.c === '#15803d');
  ok('q19 長條分成熱與輸出兩段', !!heat && !!out);
  ok('q19 兩段長度比 = 功率比（±3%）',
    Math.abs((heat.h / out.h) / (ploss / pout) - 1) < 0.03,
    `bar ${(heat.h / out.h).toFixed(3)} vs power ${(ploss / pout).toFixed(3)}`);
  ok('q19 熱在上、輸出在下且首尾相接', heat.y + heat.h === out.y);
  ok('q19 LDO 是線性通過元件、負載是鋸齒電阻',
    /linear pass FET/.test(s) && /data-sym="resistor"/.test(s));
  ok('q19 點出壓差大就該換 buck', /use a buck/.test(s));
}

/* ---------- q21 / q33：去耦電容 ---------- */
{
  const s = D.q21;
  ok('q21 與 q33 同一張', D.q33 === D.q21);
  ok('q21 三顆電容都是符號庫電容（左 2 顆 + 右 1 顆）', count(s, /data-sym="capacitor"/g) === 3);
  // 左：100n(x=170) 比 10u(x=100) 更靠近 IC(x=220 的框，左緣 195)
  ok('q21 左邊 100n 比 10u 更靠 IC 腳',
    /<line x1="170" y1="100" x2="170" y2="118"/.test(s) && /<line x1="100" y1="100" x2="100" y2="118"/.test(s) &&
    (195 - 170) < (195 - 100));
  // 右：同一顆電容掛在長 stub 上
  const stub = s.match(/<line x1="350" y1="100" x2="350" y2="(\d+)"/);
  ok('q21 右邊是長 stub（68px，遠大於左邊的 18px）', stub && +stub[1] - 100 === 68, stub && stub[1]);
  ok('q21 兩邊各一顆 IC，右邊的電容離腳更遠',
    count(s, /data-sym="ic"/g) === 2 && /too far to help/.test(s) && /adds ESL/.test(s));
  ok('q21 講清楚順序與不准 T 型分叉', /plane -> bulk -> ceramic -> pin, never a T-stub/.test(s));
  ok('q21 每個電源腳一顆 + 短粗接地過孔', /One cap per power pin/.test(s) && /short fat via/.test(s));
}

/* ---------- q25：Latch-up ---------- */
{
  const s = D.q25;
  ok('q25 一顆 PNP + 一顆 NPN', count(s, /data-sym="pnp"/g) === 1 && count(s, /data-sym="npn"/g) === 1);
  ok('q25 PNP 射極接 VDD 匯流(y=86)',
    /x1="128" y1="124" x2="128" y2="86"/.test(s) && /<circle cx="128" cy="86"/.test(s));
  ok('q25 PNP 集極接到 NPN 基極(174,222)',
    /x1="128" y1="184" x2="128" y2="222"/.test(s) && /x1="128" y1="222" x2="174" y2="222"/.test(s));
  ok('q25 NPN 集極繞回 PNP 基極節點(74,154) — 這就是交叉耦合',
    /x1="208" y1="196" x2="74" y2="196"/.test(s) && /x1="74" y1="196" x2="74" y2="154"/.test(s) &&
    /<circle cx="74" cy="154"/.test(s));
  ok('q25 NPN 射極接地(y=286)', /x1="208" y1="252" x2="208" y2="286"/.test(s) && /data-sym="ground"/.test(s));
  ok('q25 Rwell 接在 VDD 與 n-well 之間、Rsub 接在基極與地之間',
    /x1="60" y1="86" x2="60" y2="92"/.test(s) && /x1="60" y1="140" x2="60" y2="154"/.test(s) &&
    /x1="150" y1="222" x2="150" y2="226"/.test(s) && /x1="150" y1="274" x2="150" y2="286"/.test(s) &&
    count(s, /data-sym="resistor"/g) === 2);
  ok('q25 觸發來源畫成往基板注入', /IO pin below GND/.test(s) && /injects into substrate/.test(s));
  const steps = [...s.matchAll(/<text x="288" y="\d+"[^>]*>(\d\. [^<]+)</g)].map(m => m[1]);
  ok('q25 五項預防措施齊全', steps.length === 5, steps.length + ' 項');
  ok('q25 預防措施涵蓋 guard ring / 上電順序 / 限流 / ESD / taps',
    /Guard rings/.test(steps[0]) && /Power up VDD before/.test(steps[1]) &&
    /Series resistor/.test(steps[2]) && /ESD diodes/.test(steps[3]) && /taps/.test(steps[4]));
  ok('q25 講明只有斷電才能解除', /only a power cycle/.test(s));
}

/* ---------- q36：SW 節點佈局 ---------- */
{
  const s = D.q36;
  const loop = (s.match(/<path d="([^"]+)" fill="none" stroke="#f59e0b"/) || [])[1];
  ok('q36 有高頻迴路高亮', !!loop, loop);
  ok('q36 迴路封閉（回到起點）', /^M (\d+) (\d+) [\s\S]*V \2$/.test(loop) && /H 40 V 120$/.test(loop), loop);
  ok('q36 迴路走 Cin(40) -> IC(75) -> SW/D(200) -> GND(240)',
    loop === 'M 40 120 H 75 V 150 H 200 V 240 H 40 V 120');
  ok('q36 迴路不含回授走線(y=74)', !loop.includes('74'));
  // 回授從 VOUT 繞到最上緣才回 IC，與 SW 節點(y=150) 拉開距離
  ok('q36 回授走 y=74，離 SW 節點 76px',
    /x1="340" y1="74" x2="110" y2="74"/.test(s) && (150 - 74) === 76);
  ok('q36 單點接地（只有一個接地符號）', count(s, /data-sym="ground"/g) === 1);
  ok('q36 Cin 直接掛在 IC 的 VIN 腳與地之間',
    /x1="40" y1="120" x2="40" y2="146"/.test(s) && /x1="40" y1="190" x2="40" y2="240"/.test(s) &&
    /x1="40" y1="120" x2="75" y2="120"/.test(s));
  ok('q36 元件齊全：L、續流二極體、Cin/Cout',
    /data-sym="inductor"/.test(s) && /data-sym="diode"/.test(s) && count(s, /data-sym="capacitor"/g) === 2);
  ok('q36 二極體陰極朝上（續流方向由地往 SW）',
    /<polygon points="192,204 208,204 200,188"/.test(s));
  ok('q36 點名 SW 銅面要小、回授要遠、單點接地',
    /small SW copper/.test(s) && /feedback routed away from SW/.test(s) && /single-point GND/.test(s));
}

console.log('\n' + (fail ? 'FAILED ' + fail : 'ALL PASS'));
process.exit(fail ? 1 : 0);
