/**
 * batch5.js — 面試題庫補圖 批次 5（bank 最後 6 題）
 *   q18  tr 與 Rp 的關係：為什麼「加大 Rp」是錯的修法
 *   q20  ESD 模型 HBM vs CDM 對照
 *   q21  去耦/旁路電容擺位（串接順序、via、迴路面積）
 *   q23  差分對走線 對 vs 錯
 *   q24  MOSFET 選型六參數 + FOM 權衡曲線
 *   q25  Latch-up 的寄生 SCR 等效電路
 * 規格：viewBox 寬 520、字級 >= 11、英文/符號標籤
 */
const D = {};
const BG = (w, h) => `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">`
  + `<rect width="${w}" height="${h}" fill="#0a0a1a"/>`;
const gnd = (x, y) => `<line x1="${x - 18}" y1="${y}" x2="${x + 18}" y2="${y}" stroke="#888" stroke-width="1.6"/>`
  + `<line x1="${x - 12}" y1="${y + 5}" x2="${x + 12}" y2="${y + 5}" stroke="#888" stroke-width="1.4"/>`
  + `<line x1="${x - 6}" y1="${y + 10}" x2="${x + 6}" y2="${y + 10}" stroke="#888" stroke-width="1.2"/>`;

/* ---------- q18：tr = 0.8473 x Rp x Cb ---------- */
{
  const K = 0.8473, X0 = 70, XR = 470, Y0 = 190, YT = 50;
  const RPMAX = 12, TRMAX = 900;                       // x: 0-12k, y: 0-900ns
  const sx = rp => X0 + rp / RPMAX * (XR - X0);
  const sy = tr => Y0 - tr / TRMAX * (Y0 - YT);
  const tr = (rpK, cbPF) => K * rpK * cbPF;            // ns：kohm x pF = 1e-9 s = ns（別再乘 1000）
  const line = cb => {                                  // 畫到觸頂為止
    const rpTop = TRMAX / (K * cb);
    const end = Math.min(rpTop, RPMAX);
    return `${sx(0)},${sy(0)} ${sx(end).toFixed(1)},${sy(tr(end, cb)).toFixed(1)}`;
  };
  const p22 = { x: sx(2.2), y: sy(tr(2.2, 100)) }, p10 = { x: sx(10), y: sy(tr(10, 100)) };
  D.q18 = BG(520, 252)
    + '<text x="260" y="18" fill="#00d4ff" font-size="13" font-weight="bold" text-anchor="middle">Why raising Rp is the wrong fix for a tr failure</text>'
    + `<line x1="${X0}" y1="${YT}" x2="${X0}" y2="${Y0}" stroke="#888" stroke-width="1.4"/>`
    + `<line x1="${X0}" y1="${Y0}" x2="${XR}" y2="${Y0}" stroke="#888" stroke-width="1.4"/>`
    + `<polyline points="${line(100)}" fill="none" stroke="#00d4ff" stroke-width="2"/>`
    + `<polyline points="${line(200)}" fill="none" stroke="#888" stroke-width="1.6" stroke-dasharray="4"/>`
    + `<line x1="${X0}" y1="${sy(300).toFixed(1)}" x2="${XR}" y2="${sy(300).toFixed(1)}" stroke="#ff6b6b" stroke-width="1.2" stroke-dasharray="3"/>`
    + `<text x="466" y="136" fill="#ff6b6b" font-size="11" text-anchor="end">300ns limit (Fast mode)</text>`
    + `<circle cx="${p22.x.toFixed(1)}" cy="${p22.y.toFixed(1)}" r="4" fill="#00ff88"/>`
    + `<text x="150" y="178" fill="#00ff88" font-size="11">Rp 2.2k -&gt; tr 186ns  PASS</text>`
    + `<circle cx="${p10.x.toFixed(1)}" cy="${p10.y.toFixed(1)}" r="4" fill="#ff6b6b"/>`
    + `<text x="398" y="48" fill="#ff6b6b" font-size="11" text-anchor="end">Rp 10k -&gt; tr 847ns  FAIL</text>`
    + '<text x="66" y="46" fill="#888" font-size="11" text-anchor="end">tr</text>'
    + '<text x="474" y="186" fill="#888" font-size="11">Rp</text>'
    + '<text x="10" y="208" fill="#00ff88" font-size="11">(A) lower Rp: OK    (B) shorter trace = lower Cb: OK    (D) fewer slaves: OK</text>'
    + '<text x="10" y="228" fill="#ff6b6b" font-size="11">(C) raise Rp 2.2k -&gt; 10k: WRONG - tr grows with Rp, the failure gets worse.</text>'
    + '<text x="10" y="246" fill="#888" font-size="11">Solid line Cb = 100pF, dashed Cb = 200pF. tr = 0.8473 x Rp x Cb.</text>'
    + '</svg>';
}

/* ---------- q20：HBM vs CDM ---------- */
{
  const rows = [
    ['models', 'a human touching the IC', 'the IC itself is charged'],
    ['circuit', '100pF + 1.5k', 'package C 1-30pF, ~1 ohm'],
    ['duration', '~150ns', '~1ns (very fast)'],
    ['typ level', '2kV (Class 2)', '500V (Class C4)'],
    ['damage', 'junction burn-out', 'oxide breakdown'],
  ];
  let s = BG(520, 240)
    + '<text x="260" y="18" fill="#00d4ff" font-size="13" font-weight="bold" text-anchor="middle">ESD models: HBM vs CDM</text>'
    + '<text x="250" y="52" fill="#ffc107" font-size="12" font-weight="bold" text-anchor="middle">HBM</text>'
    + '<text x="410" y="52" fill="#ff6b6b" font-size="12" font-weight="bold" text-anchor="middle">CDM</text>'
    + '<line x1="20" y1="60" x2="500" y2="60" stroke="#888" stroke-width="1.4"/>'
    + '<line x1="176" y1="38" x2="176" y2="182" stroke="#334155" stroke-width="1.2"/>'
    + '<line x1="330" y1="38" x2="330" y2="182" stroke="#334155" stroke-width="1.2"/>';
  rows.forEach(([label, hbm, cdm], i) => {
    const y = 82 + i * 22;
    s += `<text x="24" y="${y}" fill="#c8d4ee" font-size="11">${label}</text>`
      + `<text x="253" y="${y}" fill="#ffc107" font-size="11" text-anchor="middle">${hbm}</text>`
      + `<text x="415" y="${y}" fill="#ff6b6b" font-size="11" text-anchor="middle">${cdm}</text>`;
  });
  s += '<text x="10" y="206" fill="#c8d4ee" font-size="11">Peak: HBM = 2kV / 1.5k = 1.33A over ~150ns. CDM dumps several A within ~1ns.</text>'
    + '<text x="10" y="226" fill="#888" font-size="11">Protect: TVS at the connector, guard ring, clamp to VDD/GND rails, keep traces short.</text>'
    + '</svg>';
  D.q20 = s;
}

/* ---------- q21：去耦電容擺位 ---------- */
D.q21 = BG(520, 244)
  + '<text x="260" y="18" fill="#00d4ff" font-size="13" font-weight="bold" text-anchor="middle">Decoupling placement: rail -&gt; cap -&gt; pin</text>'
  + '<line x1="40" y1="90" x2="340" y2="90" stroke="#ff6b6b" stroke-width="2"/>'
  + '<text x="14" y="86" fill="#ff6b6b" font-size="11">VDD</text>'
  // 10uF（bulk，稍遠）
  + '<line x1="140" y1="90" x2="140" y2="104" stroke="#888" stroke-width="1.4"/>'
  + '<line x1="130" y1="104" x2="150" y2="104" stroke="#ffc107" stroke-width="2"/>'
  + '<line x1="130" y1="112" x2="150" y2="112" stroke="#ffc107" stroke-width="2"/>'
  + '<line x1="140" y1="112" x2="140" y2="150" stroke="#888" stroke-width="1.4"/>'
  + '<circle cx="140" cy="150" r="3.5" fill="#00ff88"/>'
  + '<text x="140" y="72" fill="#ffc107" font-size="11" text-anchor="middle">10uF</text>'
  // 100nF（最靠 pin）
  + '<line x1="270" y1="90" x2="270" y2="104" stroke="#888" stroke-width="1.4"/>'
  + '<line x1="260" y1="104" x2="280" y2="104" stroke="#ffc107" stroke-width="2"/>'
  + '<line x1="260" y1="112" x2="280" y2="112" stroke="#ffc107" stroke-width="2"/>'
  + '<line x1="270" y1="112" x2="270" y2="150" stroke="#888" stroke-width="1.4"/>'
  + '<circle cx="270" cy="150" r="3.5" fill="#00ff88"/>'
  + '<text x="270" y="72" fill="#ffc107" font-size="11" text-anchor="middle">100nF</text>'
  // IC
  + '<rect x="340" y="54" width="120" height="80" rx="4" fill="none" stroke="#00d4ff" stroke-width="1.8"/>'
  + '<text x="400" y="98" fill="#00d4ff" font-size="12" text-anchor="middle" font-weight="bold">IC</text>'
  + '<line x1="400" y1="134" x2="400" y2="150" stroke="#888" stroke-width="1.4"/>'
  + '<circle cx="400" cy="150" r="3.5" fill="#00ff88"/>'
  // GND 平面
  + '<line x1="40" y1="150" x2="470" y2="150" stroke="#4b5563" stroke-width="4"/>'
  + '<text x="40" y="170" fill="#888" font-size="11">GND plane (vias short and fat = low ESL)</text>'
  + '<text x="10" y="196" fill="#c8d4ee" font-size="11">Order matters: rail -&gt; 10uF -&gt; 100nF -&gt; IC pin. No T-stub hanging off the rail.</text>'
  + '<text x="10" y="216" fill="#c8d4ee" font-size="11">100nF nearest the pin, 10uF further out. One cap per supply pin.</text>'
  + '<text x="10" y="236" fill="#888" font-size="11">Bypass = shunt HF noise to GND. Decoupling = local charge for transients. Same part, two jobs.</text>'
  + '</svg>';

/* ---------- q23：差分對走線 對 vs 錯 ---------- */
D.q23 = BG(520, 244)
  + '<text x="260" y="18" fill="#00d4ff" font-size="13" font-weight="bold" text-anchor="middle">Differential pair routing</text>'
  + '<text x="130" y="40" fill="#00ff88" font-size="12" font-weight="bold" text-anchor="middle">(C) correct</text>'
  + '<text x="390" y="40" fill="#ff6b6b" font-size="12" font-weight="bold" text-anchor="middle">(A)(B)(D) wrong</text>'
  + '<line x1="260" y1="32" x2="260" y2="176" stroke="#334155" stroke-width="1"/>'
  // 正確：同層、等長、等距、連續參考平面
  + '<rect x="20" y="140" width="220" height="16" fill="#1f2937"/>'
  + '<text x="130" y="152" fill="#94a3b8" font-size="11" text-anchor="middle">solid reference plane</text>'
  + '<polyline points="24,68 96,68 128,96 236,96" fill="none" stroke="#00d4ff" stroke-width="2"/>'
  + '<polyline points="24,82 96,82 128,110 236,110" fill="none" stroke="#00d4ff" stroke-width="2"/>'
  + '<text x="24" y="60" fill="#00ff88" font-size="11">equal length, constant gap, one layer</text>'
  // 錯誤：跨層、90 度轉角、跨越平面分割
  + '<rect x="280" y="140" width="86" height="16" fill="#1f2937"/>'
  + '<rect x="394" y="140" width="86" height="16" fill="#1f2937"/>'
  + '<text x="380" y="170" fill="#ff6b6b" font-size="11" text-anchor="middle">plane split breaks the return</text>'
  + '<polyline points="284,68 344,68" fill="none" stroke="#00d4ff" stroke-width="2"/>'
  + '<circle cx="344" cy="68" r="4" fill="none" stroke="#ff6b6b" stroke-width="1.6"/>'
  + '<polyline points="344,68 380,68 380,96 496,96" fill="none" stroke="#00d4ff" stroke-width="2" stroke-dasharray="5"/>'
  + '<polyline points="284,82 430,82 430,120 496,120" fill="none" stroke="#00d4ff" stroke-width="2"/>'
  + '<text x="284" y="60" fill="#ff6b6b" font-size="11">via to another layer, 90 deg turns</text>'
  + '<text x="10" y="198" fill="#c8d4ee" font-size="11">Equal length keeps skew under 5mil. Constant gap keeps Zdiff constant.</text>'
  + '<text x="10" y="218" fill="#888" font-size="11">Splitting layers changes impedance and coupling; a 90 deg corner and a plane split both hurt.</text>'
  + '<text x="10" y="238" fill="#888" font-size="11">Dashed = the half that jumped layers, so the two halves no longer match.</text>'
  + '</svg>';

/* ---------- q24：MOSFET 選型六參數 + FOM ---------- */
{
  const params = [
    ['V(BR)DSS', 'pick &gt;= 1.2 x Vmax'],
    ['RDS(on)', 'conduction loss I^2 R'],
    ['Qg', 'gate charge -> switching'],
    ['VGS(th)', 'turn-on threshold'],
    ['ID(max)', 'continuous drain current'],
    ['SOA', 'safe operating area'],
  ];
  const AX = 330, AY = 190, AT = 66, AR = 500;
  const sx = qg => AX + qg * 1.7, sy = rds => AY - rds * 1.3;
  const curve = fom => {
    const pts = [];
    for (let qg = 18; qg <= 100; qg += 2) {
      const rds = fom / qg;
      if (rds * 1.3 <= AY - AT) pts.push(`${sx(qg).toFixed(1)},${sy(rds).toFixed(1)}`);
    }
    return pts.join(' ');
  };
  let s = BG(520, 244)
    + '<text x="260" y="18" fill="#00d4ff" font-size="13" font-weight="bold" text-anchor="middle">MOSFET selection: six parameters and FOM</text>';
  params.forEach(([sym, mean], i) => {
    const y = 52 + i * 24;
    s += `<text x="16" y="${y}" fill="#00d4ff" font-size="11">${sym}</text>`
      + `<text x="104" y="${y}" fill="#c8d4ee" font-size="11">${mean}</text>`;
  });
  s += `<line x1="${AX}" y1="${AT}" x2="${AX}" y2="${AY}" stroke="#888" stroke-width="1.4"/>`
    + `<line x1="${AX}" y1="${AY}" x2="${AR}" y2="${AY}" stroke="#888" stroke-width="1.4"/>`
    + `<polyline points="${curve(1500)}" fill="none" stroke="#ff6b6b" stroke-width="1.8"/>`
    + `<polyline points="${curve(600)}" fill="none" stroke="#00ff88" stroke-width="1.8"/>`
    + `<text x="${AX}" y="52" fill="#888" font-size="11" text-anchor="middle">RDS(on)</text>`
    + `<text x="504" y="${AY + 4}" fill="#888" font-size="11">Qg</text>`
    + '<text x="404" y="88" fill="#ff6b6b" font-size="11">worse FOM</text>'
    + '<text x="336" y="182" fill="#00ff88" font-size="11">better FOM</text>'
    + '<text x="10" y="212" fill="#c8d4ee" font-size="11">FOM = RDS(on) x Qg, lower is better - it balances conduction against switching loss.</text>'
    + '<text x="10" y="234" fill="#888" font-size="11">Low frequency, high current: chase RDS(on). High frequency: chase Qg.</text>'
    + '</svg>';
  D.q24 = s;
}

/* ---------- q25：Latch-up 的寄生 SCR ---------- */
D.q25 = BG(520, 252)
  + '<text x="260" y="18" fill="#00d4ff" font-size="13" font-weight="bold" text-anchor="middle">Latch-up: the parasitic PNPN (SCR) in CMOS</text>'
  + '<path d="M120,58 V196" fill="none" stroke="#ff6b6b" stroke-width="8" stroke-opacity="0.25" stroke-linecap="round"/>'
  + '<line x1="120" y1="44" x2="120" y2="58" stroke="#ff6b6b" stroke-width="1.6"/>'
  + '<text x="128" y="54" fill="#ff6b6b" font-size="11">VDD</text>'
  + '<rect x="102" y="58" width="36" height="20" fill="none" stroke="#ffc107" stroke-width="1.6"/>'
  + '<text x="96" y="72" fill="#ffc107" font-size="11" text-anchor="end">Rwell</text>'
  + '<rect x="102" y="86" width="36" height="26" rx="3" fill="none" stroke="#00d4ff" stroke-width="1.6"/>'
  + '<text x="120" y="103" fill="#00d4ff" font-size="11" text-anchor="middle">PNP</text>'
  + '<rect x="102" y="130" width="36" height="26" rx="3" fill="none" stroke="#00d4ff" stroke-width="1.6"/>'
  + '<text x="120" y="147" fill="#00d4ff" font-size="11" text-anchor="middle">NPN</text>'
  + '<rect x="102" y="164" width="36" height="20" fill="none" stroke="#ffc107" stroke-width="1.6"/>'
  + '<text x="96" y="178" fill="#ffc107" font-size="11" text-anchor="end">Rsub</text>'
  + '<line x1="120" y1="184" x2="120" y2="196" stroke="#888" stroke-width="1.6"/>'
  + gnd(120, 196)
  // 交叉耦合：PNP 集極 -> NPN 基極、NPN 集極 -> PNP 基極
  + '<polyline points="138,106 160,106 160,136 138,136" fill="none" stroke="#00ff88" stroke-width="1.4"/>'
  + '<polyline points="102,136 84,136 84,92 102,92" fill="none" stroke="#00ff88" stroke-width="1.4"/>'
  + '<text x="166" y="100" fill="#00ff88" font-size="11">regenerative</text>'
  // 觸發
  + '<line x1="230" y1="121" x2="176" y2="121" stroke="#ff6b6b" stroke-width="1.6"/>'
  + '<polygon points="176,117 176,125 166,121" fill="#ff6b6b"/>'
  + '<text x="234" y="125" fill="#ff6b6b" font-size="11">IO above VDD or below GND</text>'
  + '<text x="270" y="60" fill="#ff6b6b" font-size="11">Triggers</text>'
  + '<text x="270" y="78" fill="#c8d4ee" font-size="11">IO overshoot beyond a diode drop</text>'
  + '<text x="270" y="96" fill="#c8d4ee" font-size="11">large injected current (ESD)</text>'
  + '<text x="270" y="150" fill="#00ff88" font-size="11">Prevention</text>'
  + '<text x="270" y="168" fill="#c8d4ee" font-size="11">guard rings: P+ to VDD, N+ to GND</text>'
  + '<text x="270" y="186" fill="#c8d4ee" font-size="11">VDD before IO, series R on IO</text>'
  + '<text x="270" y="204" fill="#c8d4ee" font-size="11">clamp diodes, dense well taps</text>'
  + '<text x="10" y="228" fill="#ff6b6b" font-size="11">Once latched, VDD-to-GND stays low impedance (red path) - only a power cycle clears it.</text>'
  + '<text x="10" y="246" fill="#888" font-size="11">Bad power sequencing and high temperature both lower the trigger threshold.</text>'
  + '</svg>';

module.exports = D;
