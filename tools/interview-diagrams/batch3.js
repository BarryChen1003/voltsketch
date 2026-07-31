/**
 * batch3.js — 面試題庫補圖 批次 3
 *   q1 + q4  BJT 四工作區（同一張圖掛兩題：q1 問飽和/截止條件，q4 問四區偏壓）
 *   q2       NMOS 轉移特性與 VTH
 *   q14      邏輯閘真值表
 *   q15      NMOS 反相器（電阻上拉）
 *   q16      I2C Fast mode 關鍵時序
 *   q22      差分對疊構剖面（W/S/H/er）
 * 規格：viewBox 寬 520、字級 >= 11、英文/符號標籤、幾何可程式驗證
 */
const D = {};
const BG = (w, h) => `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">`
  + `<rect width="${w}" height="${h}" fill="#0a0a1a"/>`;

/* ---------- q1 / q4：BJT 四工作區（V_BE 對 V_BC 象限圖） ---------- */
{
  const svg = BG(520, 252)
    + '<text x="260" y="20" fill="#00d4ff" font-size="13" font-weight="bold" text-anchor="middle">BJT (NPN) Operating Regions</text>'
    + '<line x1="60" y1="140" x2="470" y2="140" stroke="#888" stroke-width="1.4"/>'
    + '<line x1="260" y1="40" x2="260" y2="230" stroke="#888" stroke-width="1.4"/>'
    + '<text x="474" y="132" fill="#888" font-size="11">VBE</text>'
    + '<text x="270" y="50" fill="#888" font-size="11">VBC</text>'
    + '<text x="268" y="154" fill="#888" font-size="11">+</text>'
    + '<text x="252" y="154" fill="#888" font-size="11" text-anchor="end">-</text>'
    // 右上：BE 順偏 + BC 順偏 = 飽和
    + '<text x="365" y="86" fill="#00ff88" font-size="12" font-weight="bold" text-anchor="middle">SATURATION</text>'
    + '<text x="365" y="106" fill="#c8d4ee" font-size="11" text-anchor="middle">both junctions forward</text>'
    + '<text x="365" y="124" fill="#c8d4ee" font-size="11" text-anchor="middle">VCE(sat) = 0.2V, IB &gt; IC/beta</text>'
    // 左上：BE 反偏 + BC 順偏 = 反向主動
    + '<text x="160" y="86" fill="#ffc107" font-size="12" font-weight="bold" text-anchor="middle">REVERSE ACTIVE</text>'
    + '<text x="160" y="106" fill="#c8d4ee" font-size="11" text-anchor="middle">BE reverse, BC forward</text>'
    + '<text x="160" y="124" fill="#c8d4ee" font-size="11" text-anchor="middle">rarely used, low gain</text>'
    // 左下：兩接面反偏 = 截止
    + '<text x="160" y="178" fill="#ff6b6b" font-size="12" font-weight="bold" text-anchor="middle">CUTOFF</text>'
    + '<text x="160" y="198" fill="#c8d4ee" font-size="11" text-anchor="middle">both junctions reverse</text>'
    + '<text x="160" y="216" fill="#c8d4ee" font-size="11" text-anchor="middle">IC = 0 (only ICEO leak)</text>'
    // 右下：BE 順偏 + BC 反偏 = 主動/線性
    + '<text x="365" y="178" fill="#00d4ff" font-size="12" font-weight="bold" text-anchor="middle">ACTIVE (linear)</text>'
    + '<text x="365" y="198" fill="#c8d4ee" font-size="11" text-anchor="middle">BE forward, BC reverse</text>'
    + '<text x="365" y="216" fill="#c8d4ee" font-size="11" text-anchor="middle">IC = beta x IB</text>'
    + '<text x="10" y="244" fill="#888" font-size="11">forward = positive axis. Saturation needs IB &gt; IC/beta, not just VBE &gt; 0.7V</text>'
    + '</svg>';
  D.q1 = svg;
  D.q4 = svg;   // 同一張圖：q4 問的就是這四區的偏壓條件
}

/* ---------- q2：NMOS 轉移特性 ---------- */
{
  const X0 = 70, XV = 200, XE = 440, Y0 = 180, YT = 60;
  const k = (Y0 - YT) / Math.pow(XE - XV, 2);
  const pts = [];
  for (let x = X0; x <= XV; x += 10) pts.push(x + ',' + Y0);
  for (let x = XV; x <= XE; x += 10) pts.push(x + ',' + (Y0 - k * Math.pow(x - XV, 2)).toFixed(1));
  D.q2 = BG(520, 232)
    + '<text x="260" y="20" fill="#00d4ff" font-size="13" font-weight="bold" text-anchor="middle">NMOS Transfer Curve (ID vs VGS)</text>'
    + `<line x1="${X0}" y1="40" x2="${X0}" y2="${Y0}" stroke="#888" stroke-width="1.4"/>`
    + `<line x1="${X0}" y1="${Y0}" x2="470" y2="${Y0}" stroke="#888" stroke-width="1.4"/>`
    + `<polyline points="${pts.join(' ')}" fill="none" stroke="#00d4ff" stroke-width="2"/>`
    + `<line x1="${XV}" y1="60" x2="${XV}" y2="${Y0}" stroke="#ff6b6b" stroke-width="1" stroke-dasharray="3"/>`
    + '<text x="66" y="36" fill="#888" font-size="11" text-anchor="end">ID</text>'
    + '<text x="474" y="170" fill="#888" font-size="11">VGS</text>'
    + `<text x="${XV + 4}" y="196" fill="#ff6b6b" font-size="11">VTH</text>`
    + '<text x="76" y="60" fill="#ff6b6b" font-size="11">OFF: VGS &lt; VTH, ID = 0</text>'
    + '<text x="230" y="80" fill="#00ff88" font-size="11">ON: VGS &gt; VTH, channel forms</text>'
    + '<text x="250" y="120" fill="#c8d4ee" font-size="11">ID = k (VGS - VTH)^2</text>'
    + '<text x="10" y="224" fill="#888" font-size="11">Voltage controlled: gate draws ~pA, while a BJT base draws real current.</text>'
    + '</svg>';
}

/* ---------- q14：邏輯閘真值表 ---------- */
{
  const cols = [['A', 70], ['B', 120], ['AND', 195], ['OR', 258], ['NAND', 325], ['NOR', 395], ['XOR', 460]];
  const rows = [
    ['0', '0', '0', '0', '1', '1', '0'],
    ['0', '1', '0', '1', '1', '0', '1'],
    ['1', '0', '0', '1', '1', '0', '1'],
    ['1', '1', '1', '1', '0', '0', '0'],
  ];
  let s = BG(520, 228)
    + '<text x="260" y="22" fill="#00d4ff" font-size="13" font-weight="bold" text-anchor="middle">Logic Gate Truth Table</text>'
    + '<line x1="45" y1="72" x2="495" y2="72" stroke="#888" stroke-width="1.4"/>'
    + '<line x1="152" y1="46" x2="152" y2="200" stroke="#334155" stroke-width="1.4"/>';
  cols.forEach(([name, x], i) => {
    s += `<text x="${x}" y="62" fill="${i < 2 ? '#ffc107' : '#00d4ff'}" font-size="12" font-weight="bold" text-anchor="middle">${name}</text>`;
  });
  rows.forEach((r, ri) => {
    const y = 100 + ri * 26;
    r.forEach((v, ci) => {
      s += `<text x="${cols[ci][1]}" y="${y}" fill="${ci < 2 ? '#ffc107' : '#c8d4ee'}" font-size="12" text-anchor="middle">${v}</text>`;
    });
  });
  s += '<text x="10" y="220" fill="#888" font-size="11">NAND and NOR are universal gates. XOR = 1 when the inputs differ.</text>'
    + '</svg>';
  D.q14 = s;
}

/* ---------- q15：NMOS 反相器（電阻上拉） ---------- */
D.q15 = BG(520, 226)
  + '<text x="260" y="20" fill="#00d4ff" font-size="13" font-weight="bold" text-anchor="middle">NMOS Inverter (resistive pull-up)</text>'
  + '<line x1="150" y1="46" x2="150" y2="62" stroke="#ff6b6b" stroke-width="1.6"/>'
  + '<text x="158" y="58" fill="#ff6b6b" font-size="11">5V</text>'
  + '<rect x="132" y="62" width="36" height="26" fill="none" stroke="#ffc107" stroke-width="1.6"/>'
  + '<text x="150" y="79" fill="#ffc107" font-size="11" text-anchor="middle">10k</text>'
  + '<line x1="150" y1="88" x2="150" y2="140" stroke="#ffc107" stroke-width="2"/>'
  + '<circle cx="150" cy="114" r="3" fill="#ffc107"/>'
  + '<line x1="150" y1="114" x2="204" y2="114" stroke="#ffc107" stroke-width="2"/>'
  + '<text x="208" y="118" fill="#ffc107" font-size="11">OUT</text>'
  + '<rect x="132" y="140" width="36" height="26" rx="3" fill="none" stroke="#00d4ff" stroke-width="1.6"/>'
  + '<text x="150" y="157" fill="#00d4ff" font-size="11" text-anchor="middle">N</text>'
  + '<line x1="150" y1="166" x2="150" y2="182" stroke="#888" stroke-width="1.6"/>'
  + '<line x1="132" y1="182" x2="168" y2="182" stroke="#888" stroke-width="1.6"/>'
  + '<line x1="138" y1="187" x2="162" y2="187" stroke="#888" stroke-width="1.4"/>'
  + '<line x1="144" y1="192" x2="156" y2="192" stroke="#888" stroke-width="1.2"/>'
  + '<text x="172" y="190" fill="#888" font-size="11">GND</text>'
  + '<line x1="96" y1="153" x2="132" y2="153" stroke="#666" stroke-width="1" stroke-dasharray="3"/>'
  + '<text x="90" y="157" fill="#888" font-size="11" text-anchor="end">IN</text>'
  // 題目要的是 OUTPUT 波形：IN 方波、OUT 反相。
  // OUT 的下降緣是瞬時（FET 主動拉低），上升緣帶斜率（只靠 10k 對負載電容充電）。
  + '<text x="246" y="84" fill="#ffc107" font-size="11" text-anchor="end">IN</text>'
  + '<path d="M252,90 H300 V70 H360 V90 H420 V70 H500" fill="none" stroke="#ffc107" stroke-width="2"/>'
  + '<text x="246" y="144" fill="#00d4ff" font-size="11" text-anchor="end">OUT</text>'
  + '<path d="M252,130 H300 V150 H360 L380,130 H420 V150 H500" fill="none" stroke="#00d4ff" stroke-width="2"/>'
  + '<text x="384" y="122" fill="#ff6b6b" font-size="11">slow rise: 10k x Cload</text>'
  + '<text x="252" y="180" fill="#00ff88" font-size="11">IN = 0  -&gt;  N off  -&gt;  OUT = 5V (H)</text>'
  + '<text x="252" y="198" fill="#ff6b6b" font-size="11">IN = 1  -&gt;  N on   -&gt;  OUT = ~0V (L)</text>'
  + '<text x="10" y="220" fill="#888" font-size="11">Static current 5V/10k = 0.5mA while N is on. Fall is FET-driven, rise is resistor-only.</text>'
  + '</svg>';

/* ---------- q16：I2C Fast mode 關鍵時序 ---------- */
D.q16 = BG(520, 252)
  + '<text x="260" y="20" fill="#00d4ff" font-size="13" font-weight="bold" text-anchor="middle">I2C Fast Mode (400kHz) Key Timings</text>'
  + '<path d="M70,120 L100,80 H220 L250,120 H320 L350,80 H450" fill="none" stroke="#00d4ff" stroke-width="2"/>'
  + '<text x="64" y="104" fill="#00d4ff" font-size="11" text-anchor="end">SCL</text>'
  + '<line x1="70" y1="140" x2="100" y2="140" stroke="#00ff88" stroke-width="1.4"/>'
  + '<text x="85" y="136" fill="#00ff88" font-size="11" text-anchor="middle">tr</text>'
  + '<line x1="220" y1="140" x2="250" y2="140" stroke="#00ff88" stroke-width="1.4"/>'
  + '<text x="235" y="136" fill="#00ff88" font-size="11" text-anchor="middle">tf</text>'
  + '<line x1="100" y1="152" x2="220" y2="152" stroke="#ffc107" stroke-width="1.4"/>'
  + '<text x="160" y="146" fill="#ffc107" font-size="11" text-anchor="middle">tHIGH &gt;= 0.6us</text>'
  + '<line x1="250" y1="170" x2="320" y2="170" stroke="#ffc107" stroke-width="1.4"/>'
  + '<text x="285" y="164" fill="#ffc107" font-size="11" text-anchor="middle">tLOW &gt;= 1.3us</text>'
  + '<text x="360" y="140" fill="#00ff88" font-size="11">tr, tf &lt;= 300ns</text>'
  + '<path d="M70,210 H280 V180 H450" fill="none" stroke="#ffc107" stroke-width="2"/>'
  + '<text x="64" y="196" fill="#ffc107" font-size="11" text-anchor="end">SDA</text>'
  + '<line x1="320" y1="176" x2="320" y2="216" stroke="#ff6b6b" stroke-width="1" stroke-dasharray="3"/>'
  + '<line x1="280" y1="224" x2="320" y2="224" stroke="#ff6b6b" stroke-width="1.4"/>'
  + '<text x="300" y="240" fill="#ff6b6b" font-size="11" text-anchor="middle">tSU;DAT &gt;= 100ns</text>'
  + '<text x="360" y="212" fill="#888" font-size="11">tHD;DAT &gt;= 0</text>'
  + '</svg>';

/* ---------- q22：差分對疊構剖面（8 unit = 1 mil） ---------- */
D.q22 = BG(520, 224)
  + '<text x="260" y="20" fill="#00d4ff" font-size="13" font-weight="bold" text-anchor="middle">Differential Pair Cross-Section (to scale, 8px = 1mil)</text>'
  + '<rect x="80" y="100" width="360" height="32" fill="none" stroke="#334155" stroke-width="1.6"/>'
  + '<text x="330" y="120" fill="#c8d4ee" font-size="11" text-anchor="middle">FR-4  er = 4.2</text>'
  + '<rect x="180" y="90" width="40" height="10" fill="#ffc107"/>'
  + '<rect x="260" y="90" width="40" height="10" fill="#ffc107"/>'
  + '<rect x="80" y="132" width="360" height="10" fill="#4b5563"/>'
  + '<text x="200" y="82" fill="#ffc107" font-size="11" text-anchor="middle">W=5</text>'
  + '<text x="240" y="66" fill="#00ff88" font-size="11" text-anchor="middle">S=5</text>'
  + '<text x="280" y="82" fill="#ffc107" font-size="11" text-anchor="middle">W=5</text>'
  + '<line x1="240" y1="72" x2="240" y2="88" stroke="#00ff88" stroke-width="1.2"/>'
  + '<line x1="150" y1="100" x2="150" y2="132" stroke="#00d4ff" stroke-width="1.4"/>'
  + '<text x="144" y="120" fill="#00d4ff" font-size="11" text-anchor="end">H=4</text>'
  + '<text x="86" y="158" fill="#888" font-size="11">solid GND plane (return path)</text>'
  + '<text x="10" y="186" fill="#c8d4ee" font-size="11">Zdiff = 2 x Zo x (1 - 0.48 x exp(-0.96 x S/H))   [mils]</text>'
  + '<text x="10" y="206" fill="#888" font-size="11">Coupling rises as S/H falls. Keep the pair on one layer over solid GND.</text>'
  + '</svg>';

module.exports = D;
