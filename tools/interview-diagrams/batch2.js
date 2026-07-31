/**
 * batch2.js — 重畫既有三張（q5 / q6 / q13）
 * 動機：
 *   q6 內容錯（「SCL 單向」忽略 clock stretching，且與自己標的 open-drain 矛盾）
 *   三張都是 560 寬 / 7–8px 字 → 桌機 6.5–7.4px、手機 3.3–3.8px，等於看不清
 *   q13 有兩段文字相疊（違反鐵律）
 * 規格同 batch1：viewBox 寬 520、字級 >= 11、英文/符號標籤（四語共用）
 */
const D = {};

/* ---------- q5 Push-Pull vs Open-Drain ---------- */
D.q5 = '<svg viewBox="0 0 520 224" xmlns="http://www.w3.org/2000/svg">'
  + '<rect width="520" height="224" fill="#0a0a1a"/>'
  + '<text x="260" y="20" fill="#00d4ff" font-size="13" font-weight="bold" text-anchor="middle">Push-Pull vs Open-Drain Output</text>'
  + '<line x1="260" y1="46" x2="260" y2="184" stroke="#334155" stroke-width="1"/>'
  // --- 左：Push-Pull ---
  + '<text x="130" y="38" fill="#ffc107" font-size="12" font-weight="bold" text-anchor="middle">Push-Pull</text>'
  + '<line x1="130" y1="52" x2="130" y2="64" stroke="#ff6b6b" stroke-width="1.6"/>'
  + '<text x="138" y="60" fill="#ff6b6b" font-size="11">VDD</text>'
  + '<rect x="112" y="64" width="36" height="26" rx="3" fill="none" stroke="#00ff88" stroke-width="1.6"/>'
  + '<text x="130" y="81" fill="#00ff88" font-size="11" text-anchor="middle">P</text>'
  + '<line x1="130" y1="90" x2="130" y2="130" stroke="#ffc107" stroke-width="2"/>'
  + '<circle cx="130" cy="110" r="3" fill="#ffc107"/>'
  + '<line x1="130" y1="110" x2="178" y2="110" stroke="#ffc107" stroke-width="2"/>'
  + '<text x="182" y="114" fill="#ffc107" font-size="11">OUT</text>'
  + '<rect x="112" y="130" width="36" height="26" rx="3" fill="none" stroke="#00d4ff" stroke-width="1.6"/>'
  + '<text x="130" y="147" fill="#00d4ff" font-size="11" text-anchor="middle">N</text>'
  + '<line x1="130" y1="156" x2="130" y2="172" stroke="#888" stroke-width="1.6"/>'
  + '<line x1="112" y1="172" x2="148" y2="172" stroke="#888" stroke-width="1.6"/>'
  + '<line x1="118" y1="177" x2="142" y2="177" stroke="#888" stroke-width="1.4"/>'
  + '<line x1="124" y1="182" x2="136" y2="182" stroke="#888" stroke-width="1.2"/>'
  + '<text x="152" y="180" fill="#888" font-size="11">GND</text>'
  + '<line x1="66" y1="110" x2="112" y2="77" stroke="#666" stroke-width="1" stroke-dasharray="3"/>'
  + '<line x1="66" y1="110" x2="112" y2="143" stroke="#666" stroke-width="1" stroke-dasharray="3"/>'
  + '<text x="60" y="114" fill="#888" font-size="11" text-anchor="end">IN</text>'
  + '<text x="10" y="196" fill="#00ff88" font-size="11">H: P on  -> drives VDD</text>'
  + '<text x="10" y="214" fill="#00d4ff" font-size="11">L: N on  -> drives GND</text>'
  // --- 右：Open-Drain ---
  + '<text x="390" y="38" fill="#00d4ff" font-size="12" font-weight="bold" text-anchor="middle">Open-Drain</text>'
  + '<line x1="390" y1="52" x2="390" y2="64" stroke="#ff6b6b" stroke-width="1.6"/>'
  + '<text x="398" y="60" fill="#ff6b6b" font-size="11">VDD</text>'
  + '<rect x="372" y="64" width="36" height="26" fill="none" stroke="#ffc107" stroke-width="1.6"/>'
  + '<text x="390" y="81" fill="#ffc107" font-size="11" text-anchor="middle">Rp</text>'
  + '<line x1="390" y1="90" x2="390" y2="130" stroke="#ffc107" stroke-width="2"/>'
  + '<circle cx="390" cy="110" r="3" fill="#ffc107"/>'
  + '<line x1="390" y1="110" x2="438" y2="110" stroke="#ffc107" stroke-width="2"/>'
  + '<text x="442" y="114" fill="#ffc107" font-size="11">OUT</text>'
  + '<rect x="372" y="130" width="36" height="26" rx="3" fill="none" stroke="#00d4ff" stroke-width="1.6"/>'
  + '<text x="390" y="147" fill="#00d4ff" font-size="11" text-anchor="middle">N</text>'
  + '<line x1="390" y1="156" x2="390" y2="172" stroke="#888" stroke-width="1.6"/>'
  + '<line x1="372" y1="172" x2="408" y2="172" stroke="#888" stroke-width="1.6"/>'
  + '<line x1="378" y1="177" x2="402" y2="177" stroke="#888" stroke-width="1.4"/>'
  + '<line x1="384" y1="182" x2="396" y2="182" stroke="#888" stroke-width="1.2"/>'
  + '<text x="412" y="180" fill="#888" font-size="11">GND</text>'
  + '<line x1="330" y1="143" x2="372" y2="143" stroke="#666" stroke-width="1" stroke-dasharray="3"/>'
  + '<text x="324" y="147" fill="#888" font-size="11" text-anchor="end">IN</text>'
  + '<text x="270" y="196" fill="#ffc107" font-size="11">H: N off -> Rp pulls up</text>'
  + '<text x="270" y="214" fill="#00d4ff" font-size="11">L: N on  -> sinks to GND</text>'
  + '</svg>';

/* ---------- q6 I2C 匯流排（修正 clock stretching） ---------- */
D.q6 = '<svg viewBox="0 0 520 254" xmlns="http://www.w3.org/2000/svg">'
  + '<rect width="520" height="254" fill="#0a0a1a"/>'
  + '<text x="260" y="20" fill="#00d4ff" font-size="13" font-weight="bold" text-anchor="middle">I2C Bus: open-drain + pull-ups</text>'
  + '<line x1="180" y1="46" x2="250" y2="46" stroke="#ff6b6b" stroke-width="1.6"/>'
  + '<text x="215" y="40" fill="#ff6b6b" font-size="11" text-anchor="middle">VDD</text>'
  + '<line x1="180" y1="46" x2="180" y2="58" stroke="#ff6b6b" stroke-width="1.6"/>'
  + '<line x1="250" y1="46" x2="250" y2="58" stroke="#ff6b6b" stroke-width="1.6"/>'
  + '<rect x="162" y="58" width="36" height="24" fill="none" stroke="#ffc107" stroke-width="1.6"/>'
  + '<text x="180" y="74" fill="#ffc107" font-size="11" text-anchor="middle">Rp</text>'
  + '<rect x="232" y="58" width="36" height="24" fill="none" stroke="#ffc107" stroke-width="1.6"/>'
  + '<text x="250" y="74" fill="#ffc107" font-size="11" text-anchor="middle">Rp</text>'
  + '<line x1="180" y1="82" x2="180" y2="104" stroke="#888" stroke-width="1.4"/>'
  + '<line x1="250" y1="82" x2="250" y2="132" stroke="#888" stroke-width="1.4"/>'
  + '<line x1="70" y1="104" x2="460" y2="104" stroke="#00d4ff" stroke-width="2"/>'
  + '<line x1="70" y1="132" x2="460" y2="132" stroke="#ffc107" stroke-width="2"/>'
  + '<text x="64" y="100" fill="#00d4ff" font-size="11" text-anchor="end">SCL</text>'
  + '<text x="64" y="128" fill="#ffc107" font-size="11" text-anchor="end">SDA</text>'
  + '<circle cx="180" cy="104" r="3" fill="#00d4ff"/><circle cx="250" cy="132" r="3" fill="#ffc107"/>'
  // 三個裝置
  + '<rect x="80" y="168" width="90" height="40" rx="4" fill="none" stroke="#00ff88" stroke-width="1.6"/>'
  + '<text x="125" y="192" fill="#00ff88" font-size="11" text-anchor="middle">Master</text>'
  + '<rect x="210" y="168" width="90" height="40" rx="4" fill="none" stroke="#888" stroke-width="1.6"/>'
  + '<text x="255" y="192" fill="#888" font-size="11" text-anchor="middle">Slave 1</text>'
  + '<rect x="340" y="168" width="90" height="40" rx="4" fill="none" stroke="#888" stroke-width="1.6"/>'
  + '<text x="385" y="192" fill="#888" font-size="11" text-anchor="middle">Slave 2</text>'
  + '<line x1="100" y1="168" x2="100" y2="104" stroke="#888" stroke-width="1.4"/>'
  + '<line x1="140" y1="168" x2="140" y2="132" stroke="#888" stroke-width="1.4"/>'
  + '<line x1="230" y1="168" x2="230" y2="104" stroke="#888" stroke-width="1.4"/>'
  + '<line x1="270" y1="168" x2="270" y2="132" stroke="#888" stroke-width="1.4"/>'
  + '<line x1="360" y1="168" x2="360" y2="104" stroke="#888" stroke-width="1.4"/>'
  + '<line x1="400" y1="168" x2="400" y2="132" stroke="#888" stroke-width="1.4"/>'
  + '<circle cx="100" cy="104" r="2.5" fill="#00d4ff"/><circle cx="230" cy="104" r="2.5" fill="#00d4ff"/><circle cx="360" cy="104" r="2.5" fill="#00d4ff"/>'
  + '<circle cx="140" cy="132" r="2.5" fill="#ffc107"/><circle cx="270" cy="132" r="2.5" fill="#ffc107"/><circle cx="400" cy="132" r="2.5" fill="#ffc107"/>'
  + '<text x="10" y="224" fill="#888" font-size="11">SCL: master clocks it, but any slave may hold it LOW = clock stretching</text>'
  + '<text x="10" y="244" fill="#888" font-size="11">SDA: bidirectional, wire-AND arbitration. Cb(total) &lt;= 400pF</text>'
  + '</svg>';

/* ---------- q13 Buck 電流路徑 ---------- */
{
  const side = (X, title, hl, titleFill) =>
    `<path d="${hl}" fill="none" stroke="#eab308" stroke-width="7" stroke-opacity="0.35" stroke-linecap="round" stroke-linejoin="round"/>`
    + `<text x="${X + 88}" y="34" fill="${titleFill}" font-size="11" font-weight="bold" text-anchor="middle">${title}</text>`
    + `<text x="${X + 2}" y="44" fill="#ff6b6b" font-size="11">VIN</text>`
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
    + `<rect x="${X + 48}" y="104" width="36" height="24" rx="3" fill="none" stroke="#00d4ff" stroke-width="1.6"/>`
    + `<text x="${X + 66}" y="120" fill="#00d4ff" font-size="11" text-anchor="middle">LS</text>`
    + `<line x1="${X + 66}" y1="128" x2="${X + 66}" y2="158" stroke="#888" stroke-width="1.6"/>`
    + `<line x1="${X + 48}" y1="158" x2="${X + 178}" y2="158" stroke="#888" stroke-width="1.6"/>`
    + `<text x="${X + 182}" y="162" fill="#888" font-size="11">GND</text>`;
  D.q13 = '<svg viewBox="0 0 520 224" xmlns="http://www.w3.org/2000/svg">'
    + '<rect width="520" height="224" fill="#0a0a1a"/>'
    + '<text x="260" y="18" fill="#00d4ff" font-size="13" font-weight="bold" text-anchor="middle">Buck Current Path (yellow = conducting loop)</text>'
    // Phase 1：VIN -> HS -> SW -> L -> Load -> GND（回輸入源）
    + side(10, 'Phase 1: HS ON, LS OFF', 'M44,50 H76 V92 H170 V158 H58', '#00ff88')
    // Phase 2：GND -> LS -> SW -> L -> Load -> GND（電感續流，封閉迴路）
    + side(270, 'Phase 2: HS OFF, LS ON', 'M336,158 V92 H430 V158 H336', '#00d4ff')
    + '<line x1="260" y1="30" x2="260" y2="180" stroke="#334155" stroke-width="1"/>'
    + '<text x="10" y="214" fill="#888" font-size="11">Phase 1: iL rises, di/dt = (VIN - VOUT)/L    Phase 2: iL falls, di/dt = -VOUT/L</text>'
    + '</svg>';
}

module.exports = D;
