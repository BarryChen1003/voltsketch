/**
 * batch1.js — 面試題庫電路圖 批次 1（6 張）
 * 規則：viewBox 寬 520、字級 ≥11、標籤用英文/符號（一張圖四語共用，與既有 q5/q6/q28 一致）
 * 配色沿用既有：bg #0a0a1a / cyan #00d4ff / amber #ffc107 / red #ff6b6b / green #00ff88 / gray #888
 * 幾何由本檔算出，重疊由瀏覽器 getBBox+getCTM 實測（見 scratchpad/check.js）
 */
const D = {};

/* ---------- q7 SPI 四模式時序 ---------- */
{
  const rows = [
    { m: 0, cpol: 0, cpha: 0 },
    { m: 1, cpol: 0, cpha: 1 },
    { m: 2, cpol: 1, cpha: 0 },
    { m: 3, cpol: 1, cpha: 1 },
  ];
  const X0 = 156, HALF = 42, N = 4;          // 4 個週期，每半週期 42px → 156..492
  const edges = [];                           // 0:leading 1:trailing 交替
  for (let i = 0; i < N * 2; i++) edges.push(X0 + HALF * (i + 1));
  let s = '<svg viewBox="0 0 520 262" xmlns="http://www.w3.org/2000/svg">'
    + '<rect width="520" height="262" fill="#0a0a1a"/>'
    + '<text x="260" y="22" fill="#00d4ff" font-size="13" font-weight="bold" text-anchor="middle">SPI Modes = CPOL x CPHA</text>'
    + '<text x="260" y="42" fill="#888" font-size="11" text-anchor="middle">CPOL sets idle level, CPHA sets sampling edge</text>';
  rows.forEach((r, i) => {
    const y = 84 + i * 46, hi = y - 18;
    let d = `M${X0},${r.cpol ? hi : y}`;
    for (let k = 0; k < N * 2; k++) {
      const lvl = (r.cpol ? (k % 2 === 0) : (k % 2 === 1)) ? y : hi; // 交替
      d += ` H${edges[k]} V${lvl}`;
    }
    s += `<text x="8" y="${y - 5}" fill="#ffc107" font-size="11">Mode ${r.m}  CPOL=${r.cpol} CPHA=${r.cpha}</text>`
      + `<path d="${d}" fill="none" stroke="#00d4ff" stroke-width="1.6"/>`;
    // 取樣點：CPHA=0 取前緣（第 1、3、5 個 edge）；CPHA=1 取後緣（第 2、4、6 個）
    for (let k = r.cpha; k < 6; k += 2) {
      const x = edges[k];
      s += `<polygon points="${x - 4},${y + 12} ${x + 4},${y + 12} ${x},${y + 4}" fill="#00ff88"/>`;
    }
  });
  s += '<text x="8" y="258" fill="#00ff88" font-size="11">▲ = sample point</text></svg>';
  D.q7 = s;
}

/* ---------- q12 Buck duty cycle ---------- */
{
  const T = 96, DUTY = 0.3, HI = 80, LO = 120, X0 = 120, XE = 500;
  let d = `M${X0},${HI}`, x = X0;
  while (x < XE) {
    const on = Math.min(x + T * DUTY, XE), off = Math.min(x + T, XE);
    d += ` H${on.toFixed(1)} V${LO}`;
    if (off < XE) d += ` H${off} V${HI}`; else d += ` H${XE}`;
    x += T;
  }
  D.q12 = '<svg viewBox="0 0 520 200" xmlns="http://www.w3.org/2000/svg">'
    + '<rect width="520" height="200" fill="#0a0a1a"/>'
    + '<text x="260" y="22" fill="#00d4ff" font-size="13" font-weight="bold" text-anchor="middle">Buck: D = Vout / Vin</text>'
    + `<path d="${d}" fill="none" stroke="#00d4ff" stroke-width="1.8"/>`
    + '<text x="10" y="104" fill="#ffc107" font-size="11">V_SW</text>'
    + '<text x="112" y="84" fill="#ff6b6b" font-size="11" text-anchor="end">5V</text>'
    + '<text x="112" y="124" fill="#888" font-size="11" text-anchor="end">0V</text>'
    + '<text x="134" y="70" fill="#00ff88" font-size="11" text-anchor="middle">D*T</text>'
    + '<text x="168" y="170" fill="#888" font-size="11" text-anchor="middle">T</text>'
    // 尺標：D*T（120→148.8）與 T（120→216）
    + '<line x1="120" y1="130" x2="120" y2="152" stroke="#888" stroke-width="1"/>'
    + '<line x1="148.8" y1="130" x2="148.8" y2="152" stroke="#888" stroke-width="1"/>'
    + '<line x1="216" y1="130" x2="216" y2="152" stroke="#888" stroke-width="1"/>'
    + '<line x1="120" y1="140" x2="148.8" y2="140" stroke="#00ff88" stroke-width="1.4"/>'
    + '<line x1="120" y1="155" x2="216" y2="155" stroke="#888" stroke-width="1.4"/>'
    + '<text x="10" y="192" fill="#888" font-size="11">Vin=5V, Vout=1.5V  ->  D = 1.5/5 = 30%</text>'
    + '</svg>';
}

/* ---------- q17 I2C 上升時間 ---------- */
{
  const V0 = 170, VDD = 70, SPAN = V0 - VDD, TAU = 60, X0 = 200;
  const pts = [];
  for (let t = 0; t <= 290; t += 5) pts.push(`${(X0 + t).toFixed(1)},${(V0 - SPAN * (1 - Math.exp(-t / TAU))).toFixed(1)}`);
  const x30 = X0 + TAU * Math.log(1 / 0.7), x70 = X0 + TAU * Math.log(1 / 0.3);   // 30% / 70% 交點（解析解）
  const y30 = V0 - SPAN * 0.3, y70 = V0 - SPAN * 0.7;
  D.q17 = '<svg viewBox="0 0 520 220" xmlns="http://www.w3.org/2000/svg">'
    + '<rect width="520" height="220" fill="#0a0a1a"/>'
    + '<text x="260" y="22" fill="#00d4ff" font-size="13" font-weight="bold" text-anchor="middle">I2C Rise Time (Rp x Cb)</text>'
    + `<line x1="60" y1="${VDD}" x2="500" y2="${VDD}" stroke="#888" stroke-width="1" stroke-dasharray="4"/>`
    + `<line x1="60" y1="${y70}" x2="500" y2="${y70}" stroke="#888" stroke-width="1" stroke-dasharray="3"/>`
    + `<line x1="60" y1="${y30}" x2="500" y2="${y30}" stroke="#888" stroke-width="1" stroke-dasharray="3"/>`
    + `<path d="M60,${VDD} H110 V${V0} H${X0}" fill="none" stroke="#00d4ff" stroke-width="1.8"/>`
    + `<polyline points="${pts.join(' ')}" fill="none" stroke="#00d4ff" stroke-width="1.8"/>`
    + `<line x1="${x30.toFixed(1)}" y1="${y30}" x2="${x30.toFixed(1)}" y2="188" stroke="#ff6b6b" stroke-width="1" stroke-dasharray="3"/>`
    + `<line x1="${x70.toFixed(1)}" y1="${y70}" x2="${x70.toFixed(1)}" y2="188" stroke="#ff6b6b" stroke-width="1" stroke-dasharray="3"/>`
    + `<line x1="${x30.toFixed(1)}" y1="192" x2="${x70.toFixed(1)}" y2="192" stroke="#00ff88" stroke-width="1.6"/>`
    + '<text x="516" y="64" fill="#ff6b6b" font-size="11" text-anchor="end">VDD</text>'
    + `<text x="516" y="${y70 - 6}" fill="#888" font-size="11" text-anchor="end">70%</text>`
    + `<text x="516" y="${y30 - 6}" fill="#888" font-size="11" text-anchor="end">30%</text>`
    + '<text x="10" y="120" fill="#ffc107" font-size="11">SDA</text>'
    + `<text x="${((x30 + x70) / 2).toFixed(1)}" y="186" fill="#00ff88" font-size="11" text-anchor="middle">tr</text>`
    + '<text x="10" y="212" fill="#888" font-size="11">tr = 0.85 x Rp x Cb  ->  Rp(max) = 300ns / (0.85 x 200pF) = 1.77k</text>'
    + '</svg>';
}

/* ---------- q19 LDO 損耗 ---------- */
{
  D.q19 = '<svg viewBox="0 0 520 200" xmlns="http://www.w3.org/2000/svg">'
    + '<rect width="520" height="200" fill="#0a0a1a"/>'
    + '<text x="260" y="22" fill="#00d4ff" font-size="13" font-weight="bold" text-anchor="middle">LDO Dissipation (linear = heat)</text>'
    + '<rect x="200" y="60" width="120" height="56" rx="4" fill="none" stroke="#00d4ff" stroke-width="1.8"/>'
    + '<text x="260" y="93" fill="#00d4ff" font-size="12" text-anchor="middle" font-weight="bold">LDO</text>'
    + '<line x1="80" y1="88" x2="200" y2="88" stroke="#ff6b6b" stroke-width="2"/>'
    + '<line x1="320" y1="88" x2="450" y2="88" stroke="#00ff88" stroke-width="2"/>'
    + '<text x="80" y="78" fill="#ff6b6b" font-size="11">5V IN</text>'
    + '<text x="80" y="106" fill="#888" font-size="11">500mA</text>'
    + '<text x="330" y="78" fill="#00ff88" font-size="11">3.3V OUT</text>'
    + '<text x="330" y="106" fill="#888" font-size="11">500mA</text>'
    + '<line x1="260" y1="116" x2="260" y2="146" stroke="#ffc107" stroke-width="2"/>'
    + '<polygon points="256,146 264,146 260,154" fill="#ffc107"/>'
    + '<text x="272" y="142" fill="#ffc107" font-size="11">Pd = (5 - 3.3) x 0.5 = 0.85W</text>'
    + '<text x="80" y="178" fill="#888" font-size="11">Pin 2.5W</text>'
    + '<text x="200" y="178" fill="#888" font-size="11">Pout 1.65W</text>'
    + '<text x="330" y="178" fill="#00ff88" font-size="11">eff = 3.3/5 = 66%</text>'
    + '</svg>';
}

/* ---------- q26 RC 低通 + 波德 ---------- */
{
  D.q26 = '<svg viewBox="0 0 520 224" xmlns="http://www.w3.org/2000/svg">'
    + '<rect width="520" height="224" fill="#0a0a1a"/>'
    + '<text x="260" y="22" fill="#00d4ff" font-size="13" font-weight="bold" text-anchor="middle">RC Low-Pass: fc = 1/(2*pi*R*C)</text>'
    // --- 電路 ---
    + '<line x1="40" y1="90" x2="70" y2="90" stroke="#888" stroke-width="1.6"/>'
    + '<rect x="70" y="80" width="50" height="20" fill="none" stroke="#00d4ff" stroke-width="1.6"/>'
    + '<text x="95" y="72" fill="#00d4ff" font-size="11" text-anchor="middle">R 10k</text>'
    + '<line x1="120" y1="90" x2="230" y2="90" stroke="#888" stroke-width="1.6"/>'
    + '<circle cx="170" cy="90" r="3" fill="#888"/>'
    + '<line x1="170" y1="90" x2="170" y2="116" stroke="#888" stroke-width="1.6"/>'
    + '<line x1="152" y1="116" x2="188" y2="116" stroke="#ffc107" stroke-width="2"/>'
    + '<line x1="152" y1="124" x2="188" y2="124" stroke="#ffc107" stroke-width="2"/>'
    + '<line x1="170" y1="124" x2="170" y2="150" stroke="#888" stroke-width="1.6"/>'
    + '<line x1="156" y1="150" x2="184" y2="150" stroke="#888" stroke-width="1.6"/>'
    + '<line x1="161" y1="156" x2="179" y2="156" stroke="#888" stroke-width="1.4"/>'
    + '<line x1="166" y1="162" x2="174" y2="162" stroke="#888" stroke-width="1.2"/>'
    + '<text x="196" y="124" fill="#ffc107" font-size="11">C 10n</text>'
    + '<text x="10" y="94" fill="#888" font-size="11">Vin</text>'
    + '<text x="234" y="86" fill="#00ff88" font-size="11">Vout</text>'
    // --- 波德（幅頻）---
    + '<line x1="300" y1="60" x2="300" y2="180" stroke="#888" stroke-width="1.2"/>'
    + '<line x1="300" y1="180" x2="500" y2="180" stroke="#888" stroke-width="1.2"/>'
    + '<polyline points="308,80 380,80 500,150" fill="none" stroke="#00d4ff" stroke-width="1.8"/>'
    + '<line x1="380" y1="80" x2="380" y2="180" stroke="#ff6b6b" stroke-width="1" stroke-dasharray="3"/>'
    + '<circle cx="380" cy="86" r="3.5" fill="#ff6b6b"/>'
    + '<text x="344" y="72" fill="#ff6b6b" font-size="11">-3dB</text>'
    // x 往右挪：原本 (418,98) 的字框左下角會被 -20dB/dec 斜線擦到 0.15px（實測）
    + '<text x="430" y="96" fill="#888" font-size="11">-20dB/dec</text>'
    + '<text x="384" y="196" fill="#ff6b6b" font-size="11">fc 1.59kHz</text>'
    + '<text x="296" y="58" fill="#888" font-size="11" text-anchor="end">dB</text>'
    // 相移不畫在圖區：原本放 (310,170) 會壓到 fc 虛線（x=380），改併入下方文字
    + '<text x="10" y="214" fill="#888" font-size="11">fc = 1/(2*pi*10k*10n) = 1.59kHz ; at fc: -3dB, phase -45deg</text>'
    + '</svg>';
}

/* ---------- q27 Setup / Hold ---------- */
{
  D.q27 = '<svg viewBox="0 0 520 220" xmlns="http://www.w3.org/2000/svg">'
    + '<rect width="520" height="220" fill="#0a0a1a"/>'
    + '<text x="260" y="22" fill="#00d4ff" font-size="13" font-weight="bold" text-anchor="middle">Setup / Hold Window</text>'
    + '<path d="M120,80 H300 V62 H420 V80 H500" fill="none" stroke="#00d4ff" stroke-width="1.8"/>'
    + '<path d="M120,150 H230 V132 H350 V150 H500" fill="none" stroke="#ffc107" stroke-width="1.8"/>'
    + '<text x="10" y="74" fill="#00d4ff" font-size="11">CLK</text>'
    + '<text x="10" y="144" fill="#ffc107" font-size="11">DATA</text>'
    + '<line x1="300" y1="50" x2="300" y2="178" stroke="#ff6b6b" stroke-width="1.2" stroke-dasharray="4"/>'
    + '<text x="304" y="46" fill="#ff6b6b" font-size="11">active edge</text>'
    + '<line x1="230" y1="176" x2="230" y2="196" stroke="#888" stroke-width="1"/>'
    + '<line x1="350" y1="176" x2="350" y2="196" stroke="#888" stroke-width="1"/>'
    + '<line x1="230" y1="190" x2="300" y2="190" stroke="#00ff88" stroke-width="1.6"/>'
    + '<line x1="300" y1="190" x2="350" y2="190" stroke="#ff6b6b" stroke-width="1.6"/>'
    + '<text x="265" y="186" fill="#00ff88" font-size="11" text-anchor="middle">t_su</text>'
    + '<text x="325" y="186" fill="#ff6b6b" font-size="11" text-anchor="middle">t_h</text>'
    + '<text x="10" y="214" fill="#888" font-size="11">data must stay stable across t_su + t_h, else metastability</text>'
    + '</svg>';
}

module.exports = D;
