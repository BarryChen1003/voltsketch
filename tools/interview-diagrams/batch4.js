/**
 * batch4.js — 面試題庫補圖 批次 4
 *   q3   兩級 NMOS 反相器串接（BSS138），標出 A/B/C 三點位準
 *   q8   SPI 串聯端接電阻的位置（源端 = Master）
 *   q9   同步 vs 非同步 Buck（下管 FET vs 蕭特基）
 *   q10  上管 OFF 時的續流路徑（body diode）
 *   q11  RC Snubber 與振鈴抑制
 * 規格：viewBox 寬 520、字級 >= 11、英文/符號標籤、幾何可程式驗證
 */
const D = {};
const BG = (w, h) => `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">`
  + `<rect width="${w}" height="${h}" fill="#0a0a1a"/>`;
const gnd = (x, y) => `<line x1="${x - 18}" y1="${y}" x2="${x + 18}" y2="${y}" stroke="#888" stroke-width="1.6"/>`
  + `<line x1="${x - 12}" y1="${y + 5}" x2="${x + 12}" y2="${y + 5}" stroke="#888" stroke-width="1.4"/>`
  + `<line x1="${x - 6}" y1="${y + 10}" x2="${x + 6}" y2="${y + 10}" stroke="#888" stroke-width="1.2"/>`;

/* ---------- q3：兩級 NMOS 反相器（BSS138） ---------- */
{
  const stage = (X, rail, rlabel, fet, node, nodeVal, nodeColor) =>
    `<line x1="${X}" y1="44" x2="${X}" y2="58" stroke="#ff6b6b" stroke-width="1.6"/>`
    + `<text x="${X + 8}" y="54" fill="#ff6b6b" font-size="11">${rail}</text>`
    + `<rect x="${X - 18}" y="58" width="36" height="24" fill="none" stroke="#ffc107" stroke-width="1.6"/>`
    + `<text x="${X}" y="74" fill="#ffc107" font-size="11" text-anchor="middle">10k</text>`
    + `<text x="${X - 24}" y="74" fill="#ffc107" font-size="11" text-anchor="end">${rlabel}</text>`
    + `<line x1="${X}" y1="82" x2="${X}" y2="120" stroke="#c8d4ee" stroke-width="1.6"/>`
    + `<circle cx="${X}" cy="100" r="3" fill="#c8d4ee"/>`
    + `<line x1="${X}" y1="100" x2="${X + 46}" y2="100" stroke="#c8d4ee" stroke-width="1.6"/>`
    + `<text x="${X + 50}" y="92" fill="${nodeColor}" font-size="11">${node} = ${nodeVal}</text>`
    + `<rect x="${X - 18}" y="120" width="36" height="26" rx="3" fill="none" stroke="#00d4ff" stroke-width="1.6"/>`
    + `<text x="${X}" y="137" fill="#00d4ff" font-size="11" text-anchor="middle">${fet}</text>`
    + `<line x1="${X}" y1="146" x2="${X}" y2="164" stroke="#888" stroke-width="1.6"/>`
    + gnd(X, 164);
  D.q3 = BG(520, 238)
    + '<text x="260" y="18" fill="#00d4ff" font-size="13" font-weight="bold" text-anchor="middle">Two-stage NMOS inverter (BSS138)</text>'
    // 第一級：A 經 R1 進 Q27 閘極
    + '<text x="14" y="137" fill="#00ff88" font-size="11">A = 5V</text>'
    + '<line x1="62" y1="133" x2="96" y2="133" stroke="#00ff88" stroke-width="1.6"/>'
    + '<rect x="96" y="123" width="32" height="20" fill="none" stroke="#ffc107" stroke-width="1.6"/>'
    + '<text x="112" y="137" fill="#ffc107" font-size="11" text-anchor="middle">10k</text>'
    + '<text x="112" y="117" fill="#ffc107" font-size="11" text-anchor="middle">R1</text>'
    + '<line x1="128" y1="133" x2="132" y2="133" stroke="#00ff88" stroke-width="1.6"/>'
    + stage(150, '12V', 'R452', 'Q27', 'B', '0V', '#ff6b6b')
    // B 點驅動第二級閘極
    + '<polyline points="196,100 240,100 240,133 352,133" fill="none" stroke="#c8d4ee" stroke-width="1.6"/>'
    + stage(370, '5V', 'R453', 'Q28', 'C', '5V', '#00ff88')
    + '<text x="10" y="208" fill="#c8d4ee" font-size="11">A = HIGH -&gt; Q27 ON -&gt; B = LOW -&gt; Q28 OFF -&gt; C = HIGH</text>'
    + '<text x="10" y="228" fill="#888" font-size="11">ID(R452) = 12V / 10k = 1.2mA. BSS138 VTH = 1.5V typ, so VGS = 5V turns it on hard.</text>'
    + '</svg>';
}

/* ---------- q8：SPI 串聯端接 ---------- */
{
  const sig = [['SCLK', 88, 'out'], ['MOSI', 112, 'out'], ['MISO', 136, 'in'], ['CS#', 160, 'out']];
  let s = BG(520, 226)
    + '<text x="260" y="18" fill="#00d4ff" font-size="13" font-weight="bold" text-anchor="middle">SPI series termination: resistor at the source end</text>'
    + '<rect x="30" y="70" width="110" height="100" rx="4" fill="none" stroke="#00ff88" stroke-width="1.6"/>'
    + '<text x="85" y="126" fill="#00ff88" font-size="12" text-anchor="middle" font-weight="bold">Master</text>'
    + '<rect x="350" y="70" width="110" height="100" rx="4" fill="none" stroke="#888" stroke-width="1.6"/>'
    + '<text x="405" y="126" fill="#888" font-size="12" text-anchor="middle" font-weight="bold">Slave</text>';
  sig.forEach(([name, y, dir]) => {
    const col = dir === 'out' ? '#ffc107' : '#00d4ff';
    s += `<line x1="140" y1="${y}" x2="350" y2="${y}" stroke="${col}" stroke-width="1.8"/>`;
    // Master 輸出的三條線：電阻串在靠 Master 那一側
    if (dir === 'out') {
      s += `<rect x="155" y="${y - 8}" width="28" height="16" fill="#0a0a1a" stroke="${col}" stroke-width="1.4"/>`
        + `<polygon points="196,${y - 4} 196,${y + 4} 206,${y}" fill="${col}"/>`;
    } else {
      // MISO 的源端是 Slave，所以電阻要放 Slave 那一側
      s += `<rect x="307" y="${y - 8}" width="28" height="16" fill="#0a0a1a" stroke="${col}" stroke-width="1.4"/>`
        // 箭頭朝左：MISO 是 Slave -> Master
        + `<polygon points="294,${y - 4} 294,${y + 4} 284,${y}" fill="${col}"/>`;
    }
    s += `<text x="245" y="${y - 4}" fill="${col}" font-size="11" text-anchor="middle">${name}</text>`;
  });
  s += '<text x="169" y="60" fill="#ffc107" font-size="11" text-anchor="middle">22-33R here</text>'
    + '<text x="321" y="192" fill="#00d4ff" font-size="11" text-anchor="middle">MISO: source is the Slave</text>'
    + '<text x="10" y="212" fill="#888" font-size="11">R = Z0 - Rout. Series termination damps reflections and slows the edge: less overshoot, less EMI.</text>'
    + '</svg>';
  D.q8 = s;
}

/* ---------- q9：同步 vs 非同步 Buck ---------- */
{
  const buck = (X, lowSide) => {
    let s = `<text x="${X + 2}" y="44" fill="#ff6b6b" font-size="11">VIN</text>`
      + `<line x1="${X + 32}" y1="50" x2="${X + 48}" y2="50" stroke="#ff6b6b" stroke-width="1.6"/>`
      + `<rect x="${X + 48}" y="38" width="36" height="24" rx="3" fill="none" stroke="#00ff88" stroke-width="1.6"/>`
      + `<text x="${X + 66}" y="54" fill="#00ff88" font-size="11" text-anchor="middle">HS</text>`
      + `<line x1="${X + 66}" y1="62" x2="${X + 66}" y2="104" stroke="#ffc107" stroke-width="2"/>`
      + `<text x="${X + 40}" y="88" fill="#ffc107" font-size="11" text-anchor="end">SW</text>`
      + `<line x1="${X + 66}" y1="92" x2="${X + 82}" y2="92" stroke="#ffc107" stroke-width="2"/>`
      + `<rect x="${X + 82}" y="82" width="46" height="20" fill="none" stroke="#00d4ff" stroke-width="1.6"/>`
      + `<text x="${X + 105}" y="97" fill="#00d4ff" font-size="11" text-anchor="middle">L</text>`
      + `<line x1="${X + 128}" y1="92" x2="${X + 160}" y2="92" stroke="#888" stroke-width="1.6"/>`
      + `<circle cx="${X + 160}" cy="92" r="3" fill="#888"/>`
      + `<line x1="${X + 160}" y1="92" x2="${X + 160}" y2="112" stroke="#888" stroke-width="1.6"/>`
      + `<rect x="${X + 142}" y="112" width="36" height="28" rx="3" fill="none" stroke="#888" stroke-width="1.6"/>`
      + `<text x="${X + 160}" y="131" fill="#888" font-size="11" text-anchor="middle">Load</text>`
      + `<line x1="${X + 160}" y1="140" x2="${X + 160}" y2="158" stroke="#888" stroke-width="1.6"/>`
      + `<line x1="${X + 48}" y1="158" x2="${X + 178}" y2="158" stroke="#888" stroke-width="1.6"/>`;
    if (lowSide === 'fet') {
      s += `<rect x="${X + 48}" y="104" width="36" height="24" rx="3" fill="none" stroke="#00d4ff" stroke-width="1.6"/>`
        + `<text x="${X + 66}" y="120" fill="#00d4ff" font-size="11" text-anchor="middle">LS</text>`
        + `<line x1="${X + 66}" y1="128" x2="${X + 66}" y2="158" stroke="#888" stroke-width="1.6"/>`;
    } else {
      // 蕭特基：陽極接 GND、陰極接 SW（續流方向由下往上）
      s += `<line x1="${X + 58}" y1="112" x2="${X + 74}" y2="112" stroke="#ffc107" stroke-width="1.8"/>`
        + `<polygon points="${X + 58},126 ${X + 74},126 ${X + 66},112" fill="none" stroke="#ffc107" stroke-width="1.6"/>`
        + `<line x1="${X + 66}" y1="104" x2="${X + 66}" y2="112" stroke="#888" stroke-width="1.6"/>`
        + `<line x1="${X + 66}" y1="126" x2="${X + 66}" y2="158" stroke="#888" stroke-width="1.6"/>`
        + `<text x="${X + 82}" y="122" fill="#ffc107" font-size="11">D</text>`;
    }
    return s;
  };
  D.q9 = BG(520, 252)
    + '<text x="260" y="18" fill="#00d4ff" font-size="13" font-weight="bold" text-anchor="middle">Synchronous vs Non-synchronous Buck</text>'
    + '<text x="110" y="34" fill="#00ff88" font-size="12" font-weight="bold" text-anchor="middle">Synchronous  (the answer)</text>'
    + '<text x="370" y="34" fill="#888" font-size="12" font-weight="bold" text-anchor="middle">Non-synchronous</text>'
    + buck(10, 'fet')
    + buck(270, 'diode')
    + '<line x1="252" y1="30" x2="252" y2="180" stroke="#334155" stroke-width="1"/>'
    + '<text x="10" y="196" fill="#00ff88" font-size="11">low side is a MOSFET</text>'
    + '<text x="10" y="214" fill="#c8d4ee" font-size="11">drop = ID x RDS(on), better efficiency</text>'
    + '<text x="10" y="232" fill="#ff6b6b" font-size="11">needs dead time (no shoot-through)</text>'
    + '<text x="270" y="196" fill="#888" font-size="11">low side is a Schottky diode</text>'
    + '<text x="270" y="214" fill="#c8d4ee" font-size="11">drop = VF 0.3-0.5V, fixed loss</text>'
    + '<text x="270" y="232" fill="#ff6b6b" font-size="11">cheaper, worse at low VOUT</text>'
    + '</svg>';
}

/* ---------- q10：續流路徑（body diode） ---------- */
D.q10 = BG(520, 244)
  + '<text x="260" y="18" fill="#00d4ff" font-size="13" font-weight="bold" text-anchor="middle">Freewheeling path when HS turns OFF</text>'
  + '<path d="M118,158 V100 H86 V92 H218 V158 H118" fill="none" stroke="#eab308" stroke-width="7" stroke-opacity="0.35" stroke-linecap="round" stroke-linejoin="round"/>'
  + '<text x="22" y="44" fill="#ff6b6b" font-size="11">VIN</text>'
  + '<line x1="52" y1="50" x2="68" y2="50" stroke="#ff6b6b" stroke-width="1.6"/>'
  + '<rect x="68" y="38" width="36" height="24" rx="3" fill="none" stroke="#666" stroke-width="1.6"/>'
  + '<text x="86" y="54" fill="#666" font-size="11" text-anchor="middle">HS</text>'
  + '<text x="110" y="46" fill="#ff6b6b" font-size="11">OFF</text>'
  + '<line x1="86" y1="62" x2="86" y2="104" stroke="#ffc107" stroke-width="2"/>'
  + '<text x="60" y="80" fill="#ffc107" font-size="11" text-anchor="end">SW</text>'
  + '<line x1="86" y1="92" x2="102" y2="92" stroke="#ffc107" stroke-width="2"/>'
  + '<rect x="102" y="82" width="46" height="20" fill="none" stroke="#00d4ff" stroke-width="1.6"/>'
  + '<text x="125" y="97" fill="#00d4ff" font-size="11" text-anchor="middle">L</text>'
  + '<line x1="148" y1="92" x2="218" y2="92" stroke="#888" stroke-width="1.6"/>'
  + '<circle cx="218" cy="92" r="3" fill="#888"/>'
  + '<line x1="218" y1="92" x2="218" y2="112" stroke="#888" stroke-width="1.6"/>'
  + '<rect x="200" y="112" width="36" height="28" rx="3" fill="none" stroke="#888" stroke-width="1.6"/>'
  + '<text x="218" y="131" fill="#888" font-size="11" text-anchor="middle">Load</text>'
  + '<line x1="218" y1="140" x2="218" y2="158" stroke="#888" stroke-width="1.6"/>'
  + '<rect x="68" y="104" width="36" height="24" rx="3" fill="none" stroke="#00d4ff" stroke-width="1.6"/>'
  + '<text x="86" y="120" fill="#00d4ff" font-size="11" text-anchor="middle">LS</text>'
  + '<line x1="86" y1="128" x2="86" y2="158" stroke="#888" stroke-width="1.6"/>'
  + '<line x1="68" y1="158" x2="236" y2="158" stroke="#888" stroke-width="1.6"/>'
  + '<text x="240" y="162" fill="#888" font-size="11">GND</text>'
  // body diode：陽極接 GND、陰極接 SW，與 LS 並聯
  + '<circle cx="86" cy="100" r="3" fill="#ffc107"/>'
  + '<line x1="86" y1="100" x2="118" y2="100" stroke="#888" stroke-width="1.4"/>'
  + '<line x1="118" y1="100" x2="118" y2="112" stroke="#888" stroke-width="1.4"/>'
  + '<line x1="110" y1="112" x2="126" y2="112" stroke="#ffc107" stroke-width="1.8"/>'
  + '<polygon points="110,126 126,126 118,112" fill="none" stroke="#ffc107" stroke-width="1.6"/>'
  + '<line x1="118" y1="126" x2="118" y2="158" stroke="#888" stroke-width="1.4"/>'
  + '<text x="132" y="146" fill="#ffc107" font-size="11">body diode</text>'
  + '<text x="270" y="60" fill="#c8d4ee" font-size="11">HS opens, but iL cannot stop:</text>'
  + '<text x="270" y="78" fill="#c8d4ee" font-size="11">V = L x di/dt would spike.</text>'
  + '<text x="270" y="102" fill="#00ff88" font-size="11">The diode hands iL a path</text>'
  + '<text x="270" y="120" fill="#00ff88" font-size="11">(yellow loop, GND -&gt; SW -&gt; L).</text>'
  + '<text x="270" y="144" fill="#ffc107" font-size="11">Sync buck: it is the LS FET</text>'
  + '<text x="270" y="162" fill="#ffc107" font-size="11">body diode, VF ~0.7V, lossy.</text>'
  + '<text x="270" y="186" fill="#888" font-size="11">Non-sync: a real Schottky,</text>'
  + '<text x="270" y="204" fill="#888" font-size="11">VF ~0.3V.</text>'
  + '<text x="10" y="232" fill="#888" font-size="11">Keep dead time short: it is the interval where the lossy diode, not the FET channel, carries iL.</text>'
  + '</svg>';

/* ---------- q11：RC Snubber ---------- */
{
  // 無 snubber：欠阻尼振鈴；有 snubber：接近臨界阻尼
  const ring = [], damp = [];
  for (let t = 0; t <= 170; t += 2) {
    const x = 320 + t;
    ring.push(`${x},${(150 - 60 * (1 - Math.exp(-t / 55) * Math.cos(t / 9))).toFixed(1)}`);
    damp.push(`${x},${(150 - 60 * (1 - Math.exp(-t / 16))).toFixed(1)}`);
  }
  D.q11 = BG(520, 252)
    + '<text x="260" y="18" fill="#00d4ff" font-size="13" font-weight="bold" text-anchor="middle">RC Snubber across the switch</text>'
    // 電路
    + '<text x="14" y="54" fill="#ff6b6b" font-size="11">VIN</text>'
    + '<line x1="48" y1="50" x2="96" y2="50" stroke="#ff6b6b" stroke-width="1.6"/>'
    + '<rect x="96" y="40" width="42" height="20" fill="none" stroke="#c8d4ee" stroke-width="1.6"/>'
    + '<text x="117" y="54" fill="#c8d4ee" font-size="11" text-anchor="middle">Lstry</text>'
    + '<line x1="138" y1="50" x2="180" y2="50" stroke="#ff6b6b" stroke-width="1.6"/>'
    + '<line x1="180" y1="50" x2="180" y2="80" stroke="#ffc107" stroke-width="2"/>'
    + '<circle cx="180" cy="66" r="3" fill="#ffc107"/>'
    + '<rect x="162" y="80" width="36" height="26" rx="3" fill="none" stroke="#00d4ff" stroke-width="1.6"/>'
    + '<text x="180" y="97" fill="#00d4ff" font-size="11" text-anchor="middle">Q1</text>'
    + '<line x1="180" y1="106" x2="180" y2="140" stroke="#888" stroke-width="1.6"/>'
    + '<line x1="120" y1="140" x2="266" y2="140" stroke="#888" stroke-width="1.6"/>'
    + gnd(150, 140)
    // snubber 支路：drain -> R -> C -> GND
    + '<line x1="180" y1="66" x2="212" y2="66" stroke="#00ff88" stroke-width="1.6"/>'
    + '<rect x="212" y="56" width="36" height="20" fill="none" stroke="#00ff88" stroke-width="1.6"/>'
    + '<text x="230" y="70" fill="#00ff88" font-size="11" text-anchor="middle">R</text>'
    + '<line x1="248" y1="66" x2="266" y2="66" stroke="#00ff88" stroke-width="1.6"/>'
    + '<line x1="266" y1="66" x2="266" y2="96" stroke="#00ff88" stroke-width="1.6"/>'
    + '<line x1="254" y1="96" x2="278" y2="96" stroke="#00ff88" stroke-width="2"/>'
    + '<line x1="254" y1="104" x2="278" y2="104" stroke="#00ff88" stroke-width="2"/>'
    + '<text x="284" y="104" fill="#00ff88" font-size="11">C</text>'
    + '<line x1="266" y1="104" x2="266" y2="140" stroke="#00ff88" stroke-width="1.6"/>'
    + '<text x="10" y="166" fill="#00ff88" font-size="11">snubber sits across D-S, as close to Q1 as possible</text>'
    // 波形
    + '<line x1="316" y1="150" x2="316" y2="40" stroke="#888" stroke-width="1.2"/>'
    + '<line x1="316" y1="150" x2="500" y2="150" stroke="#888" stroke-width="1.2"/>'
    + `<polyline points="${ring.join(' ')}" fill="none" stroke="#ff6b6b" stroke-width="1.8"/>`
    + `<polyline points="${damp.join(' ')}" fill="none" stroke="#00ff88" stroke-width="1.8"/>`
    + '<text x="312" y="36" fill="#888" font-size="11" text-anchor="end">VDS</text>'
    + '<text x="330" y="34" fill="#ff6b6b" font-size="11">no snubber: ringing + overshoot</text>'
    + '<text x="400" y="140" fill="#00ff88" font-size="11">with snubber: damped</text>'
    + '<text x="10" y="212" fill="#c8d4ee" font-size="11">R = sqrt(Lstry / Coss),  C &gt; 2 x Coss.  Typical R = 1-10 ohm, C = 100pF-1nF.</text>'
    + '<text x="10" y="234" fill="#888" font-size="11">Trades EMI and VDS overshoot against snubber loss: P = C x VDS^2 x fsw.</text>'
    + '</svg>';
}

module.exports = D;
