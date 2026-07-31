/**
 * batch6.js — PCB Layout 六題（只存在 interview-pcb.sql，bank.js 沒有這些題）
 *   q33 電源去耦電容怎麼放？      → 沿用 q21 的擺位圖（同一件事）
 *   q34 高速差分對走線要點？      → 沿用 q23 的對/錯對照圖
 *   q35 為什麼要完整的地平面？    → 新繪：回流走訊號正下方 vs 被分割迫使繞路
 *   q36 開關電源 SW 節點佈局？    → 新繪：高頻迴路面積、Cin 位置、FB 遠離 SW
 *   q37 四層板疊層怎麼選？        → 新繪：訊號-地-電源-訊號 剖面
 *   q38 PCB 散熱怎麼處理？        → 新繪：散熱過孔陣列剖面
 */
const B5 = require('./batch5.js');
const D = {};
const BG = (w, h) => `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">`
  + `<rect width="${w}" height="${h}" fill="#0a0a1a"/>`;

D.q33 = B5.q21;
D.q34 = B5.q23;

/* ---------- q35：回流路徑 ---------- */
D.q35 = BG(520, 244)
  + '<text x="260" y="18" fill="#00d4ff" font-size="13" font-weight="bold" text-anchor="middle">Return current follows the trace - unless the plane is cut</text>'
  + '<text x="126" y="40" fill="#00ff88" font-size="12" font-weight="bold" text-anchor="middle">continuous plane</text>'
  + '<text x="386" y="40" fill="#ff6b6b" font-size="12" font-weight="bold" text-anchor="middle">plane with a slot</text>'
  + '<line x1="256" y1="32" x2="256" y2="176" stroke="#334155" stroke-width="1"/>'
  // 左：完整平面
  + '<rect x="36" y="66" width="180" height="8" fill="#ffc107"/>'
  + '<rect x="36" y="120" width="180" height="10" fill="#4b5563"/>'
  + '<polyline points="46,80 206,80" fill="none" stroke="#ffc107" stroke-width="1.4"/>'
  + '<polygon points="206,76 206,84 214,80" fill="#ffc107"/>'
  + '<polyline points="206,112 46,112" fill="none" stroke="#00ff88" stroke-width="1.4"/>'
  + '<polygon points="46,108 46,116 38,112" fill="#00ff88"/>'
  + '<text x="126" y="102" fill="#00ff88" font-size="11" text-anchor="middle">return sits right below</text>'
  + '<text x="126" y="150" fill="#94a3b8" font-size="11" text-anchor="middle">small loop area</text>'
  // 右：平面被切開
  + '<rect x="296" y="66" width="180" height="8" fill="#ffc107"/>'
  + '<rect x="296" y="120" width="66" height="10" fill="#4b5563"/>'
  + '<rect x="410" y="120" width="66" height="10" fill="#4b5563"/>'
  + '<text x="386" y="140" fill="#ff6b6b" font-size="11" text-anchor="middle">slot</text>'
  + '<polyline points="306,80 466,80" fill="none" stroke="#ffc107" stroke-width="1.4"/>'
  + '<polygon points="466,76 466,84 474,80" fill="#ffc107"/>'
  + '<polyline points="466,112 420,112 420,160 340,160 340,112 306,112" fill="none" stroke="#ff6b6b" stroke-width="1.4"/>'
  + '<polygon points="306,108 306,116 298,112" fill="#ff6b6b"/>'
  + '<text x="386" y="102" fill="#ff6b6b" font-size="11" text-anchor="middle">return has to detour</text>'
  + '<text x="386" y="176" fill="#ff6b6b" font-size="11" text-anchor="middle">loop area explodes</text>'
  + '<text x="10" y="200" fill="#c8d4ee" font-size="11">High-frequency return flows in the plane directly under the trace, not by the shortest path home.</text>'
  + '<text x="10" y="220" fill="#c8d4ee" font-size="11">Loop area sets radiated EMI and crosstalk, so a cut plane costs both.</text>'
  + '<text x="10" y="240" fill="#888" font-size="11">Changing layers: drop a return via next to the signal via, or the return has nowhere to go.</text>'
  + '</svg>';

/* ---------- q36：SW 節點佈局 ---------- */
D.q36 = BG(520, 248)
  + '<text x="260" y="18" fill="#00d4ff" font-size="13" font-weight="bold" text-anchor="middle">Switcher layout: keep the high di/dt loop tiny</text>'
  // 高頻熱迴路高亮：Vin -> IC(switch) -> D -> Cin -> 回 Vin
  + '<path d="M120,60 H210 V150 H120 Z" fill="none" stroke="#ff6b6b" stroke-width="8" stroke-opacity="0.28" stroke-linejoin="round"/>'
  + '<text x="165" y="105" fill="#ff6b6b" font-size="11" text-anchor="middle">hot loop</text>'
  + '<rect x="60" y="60" width="60" height="90" rx="4" fill="none" stroke="#00d4ff" stroke-width="1.8"/>'
  + '<text x="90" y="110" fill="#00d4ff" font-size="12" text-anchor="middle" font-weight="bold">IC</text>'
  + '<line x1="120" y1="60" x2="210" y2="60" stroke="#ff6b6b" stroke-width="1.8"/>'
  + '<rect x="198" y="70" width="24" height="16" fill="none" stroke="#ffc107" stroke-width="1.6"/>'
  + '<text x="234" y="82" fill="#ffc107" font-size="11">Cin closest to the IC</text>'
  + '<line x1="210" y1="60" x2="210" y2="70" stroke="#ffc107" stroke-width="1.6"/>'
  + '<line x1="210" y1="86" x2="210" y2="150" stroke="#888" stroke-width="1.6"/>'
  + '<line x1="120" y1="150" x2="210" y2="150" stroke="#888" stroke-width="1.8"/>'
  + '<text x="120" y="172" fill="#888" font-size="11">single-point ground</text>'
  // SW 銅面（要小）
  + '<rect x="120" y="96" width="46" height="22" fill="#ffc107" fill-opacity="0.35" stroke="#ffc107" stroke-width="1.4"/>'
  + '<text x="143" y="112" fill="#0a0a1a" font-size="11" text-anchor="middle" font-weight="bold">SW</text>'
  // 原本 (176,130) 會被 Cin 那條垂直走線 (x=210) 穿過 → 整段移到 210 右側
  + '<text x="230" y="140" fill="#ffc107" font-size="11">keep SW copper small</text>'
  // 輸出側
  + '<line x1="166" y1="107" x2="300" y2="107" stroke="#ffc107" stroke-width="1.8"/>'
  + '<rect x="300" y="97" width="46" height="20" fill="none" stroke="#00d4ff" stroke-width="1.6"/>'
  + '<text x="323" y="112" fill="#00d4ff" font-size="11" text-anchor="middle">L</text>'
  + '<line x1="346" y1="107" x2="400" y2="107" stroke="#888" stroke-width="1.6"/>'
  + '<text x="404" y="111" fill="#888" font-size="11">VOUT</text>'
  // FB 走線遠離 SW
  + '<polyline points="400,120 400,196 96,196 96,152" fill="none" stroke="#00ff88" stroke-width="1.6" stroke-dasharray="5"/>'
  + '<text x="248" y="190" fill="#00ff88" font-size="11" text-anchor="middle">FB routed away from SW and L</text>'
  + '<text x="10" y="220" fill="#c8d4ee" font-size="11">The Vin - switch - diode - Cin loop carries the di/dt. Its area is the EMI antenna.</text>'
  + '<text x="10" y="240" fill="#888" font-size="11">SW copper trades EMI against heatsinking: small enough to be quiet, big enough to cool.</text>'
  + '</svg>';

/* ---------- q37：四層板疊層 ---------- */
{
  const layer = (y, h, fill, name, note) =>
    `<rect x="60" y="${y}" width="300" height="${h}" fill="${fill}"/>`
    + `<text x="210" y="${y + h / 2 + 4}" fill="#0a0a1a" font-size="11" text-anchor="middle" font-weight="bold">${name}</text>`
    + `<text x="372" y="${y + h / 2 + 4}" fill="#c8d4ee" font-size="11">${note}</text>`;
  D.q37 = BG(520, 232)
    + '<text x="260" y="18" fill="#00d4ff" font-size="13" font-weight="bold" text-anchor="middle">4-layer stackup: signal - GND - PWR - signal</text>'
    // L1-L2 介電層畫得比 L2-L3 薄，圖才對得上「要薄」這句話
    + layer(44, 20, '#ffc107', 'L1 signal', 'controlled Z, clean return')
    + layer(76, 20, '#94a3b8', 'L2 GND (solid)', 'reference for L1')
    + layer(124, 20, '#f97316', 'L3 PWR', 'plane pair = capacitance')
    + layer(164, 20, '#ffc107', 'L4 signal', 'references L3')
    + '<line x1="46" y1="64" x2="46" y2="76" stroke="#00ff88" stroke-width="1.6"/>'
    + '<text x="40" y="74" fill="#00ff88" font-size="11" text-anchor="end">thin</text>'
    + '<text x="10" y="206" fill="#c8d4ee" font-size="11">Keep the L1-L2 dielectric thin: it sets impedance and keeps the return loop tight.</text>'
    + '<text x="10" y="226" fill="#888" font-size="11">L2 and L3 adjacent gives plane capacitance. Fast nets go on the layer next to solid GND.</text>'
    + '</svg>';
}

/* ---------- q38：散熱過孔 ---------- */
{
  let vias = '';
  for (let i = 0; i < 7; i++) {
    const x = 194 + i * 22;
    vias += `<rect x="${x}" y="96" width="6" height="54" fill="#4b5563"/>`;
  }
  D.q38 = BG(520, 236)
    + '<text x="260" y="18" fill="#00d4ff" font-size="13" font-weight="bold" text-anchor="middle">Thermal vias tie the hot pad to a copper pour</text>'
    + '<rect x="180" y="48" width="160" height="30" rx="3" fill="none" stroke="#ff6b6b" stroke-width="1.8"/>'
    + '<text x="260" y="68" fill="#ff6b6b" font-size="11" text-anchor="middle">power part (hot)</text>'
    + '<rect x="180" y="86" width="160" height="10" fill="#ffc107"/>'
    + '<text x="348" y="95" fill="#ffc107" font-size="11">top pad</text>'
    + vias
    + '<text x="348" y="128" fill="#94a3b8" font-size="11">thermal via array</text>'
    + '<rect x="60" y="150" width="400" height="14" fill="#94a3b8"/>'
    + '<text x="260" y="161" fill="#0a0a1a" font-size="11" text-anchor="middle" font-weight="bold">inner / bottom copper pour</text>'
    + '<polyline points="120,180 120,196 400,196 400,180" fill="none" stroke="#ff6b6b" stroke-width="1.4" stroke-dasharray="4"/>'
    + '<text x="260" y="192" fill="#ff6b6b" font-size="11" text-anchor="middle">heat spreads sideways through the copper</text>'
    + '<text x="10" y="216" fill="#c8d4ee" font-size="11">More copper weight and area beats more vias once the pour is the bottleneck.</text>'
    + '<text x="10" y="232" fill="#888" font-size="11">Spread power parts out, mind airflow; add a metal-core board or heatsink when copper runs out.</text>'
    + '</svg>';
}

module.exports = D;
