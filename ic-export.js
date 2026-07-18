/**
 * ic-export.js — 從 IC 符號模型(ic-data.js 的一顆 ic)匯出符號檔。
 *  A) kicadSym(ic)  → KiCad .kicad_sym 文字（純自製、有公開規格、可直接用）
 *  B) orcadCsv(ic)  → pin 清單 CSV（餵 OrCAD/Ultra Librarian 等工具生 .olb）
 *     orcadTcl(ic)  → OrCAD Capture Tcl 樣板（含 pin 資料；進階、依版本微調）
 * 電氣型別由中文 type 推導成標準 enum。
 */
window.ICExport = (function () {
  const PITCH = 2.54, LEAD = 2.54;  // mm，100mil 格

  // 中文 type → 標準電氣型別
  function etype(p) {
    const t = String(p.type || ''), n = String(p.name || '');
    if (p.ep || /Ground|GND/.test(t) || n === 'GND') return 'power_in';
    if (/Power|Supply|VDD|VCC|AVDD|DVDD/.test(t + ' ' + n)) return 'power_in';
    if (/I\/O|IO|GPIO|SDA/.test(t)) return 'bidirectional';
    if (/Out/.test(t)) return 'output';
    if (/In/.test(t)) return 'input';
    return 'passive';
  }
  // KiCad 名稱 overline：{FAULT} → ~{FAULT}
  const kName = s => String(s).replace(/\{([^}]*)\}/g, '~{$1}');
  const plain = s => String(s).replace(/[{}]/g, '');

  function group(ic) {
    const g = { L: [], R: [], T: [], B: [] };
    (ic.pins || []).forEach(p => (g[p.side] || g.L).push(p));
    return g;
  }

  // ---------- A) KiCad .kicad_sym ----------
  function kicadSym(ic) {
    const g = group(ic);
    const nL = g.L.length, nR = g.R.length, nT = g.T.length, nB = g.B.length;
    const halfH = (Math.max(nL, nR, 1) + 1) * PITCH / 2;
    const halfW = (Math.max(nT, nB, 1) + 1) * PITCH / 2;
    const r2 = v => (Math.round(v / 0.0127) * 0.0127).toFixed(4);  // 對齊細格
    let pins = '';
    const pinS = (p, x, y, ang) =>
      `      (pin ${etype(p)} line (at ${r2(x)} ${r2(y)} ${ang}) (length ${LEAD})\n` +
      `        (name "${kName(p.name)}" (effects (font (size 1.27 1.27))))\n` +
      `        (number "${p.num}" (effects (font (size 1.27 1.27)))))\n`;
    g.L.forEach((p, i) => { const y = (nL - 1) / 2 * PITCH - i * PITCH; pins += pinS(p, -(halfW + LEAD), y, 0); });
    g.R.forEach((p, i) => { const y = (nR - 1) / 2 * PITCH - i * PITCH; pins += pinS(p, +(halfW + LEAD), y, 180); });
    g.T.forEach((p, i) => { const x = -(nT - 1) / 2 * PITCH + i * PITCH; pins += pinS(p, x, +(halfH + LEAD), 270); });
    g.B.forEach((p, i) => { const x = -(nB - 1) / 2 * PITCH + i * PITCH; pins += pinS(p, x, -(halfH + LEAD), 90); });
    const nm = ic.part;
    return `(kicad_symbol_lib (version 20211014) (generator hardwareai)
  (symbol "${nm}" (in_bom yes) (on_board yes)
    (property "Reference" "U" (at 0 ${r2(halfH + LEAD + 1.27)} 0) (effects (font (size 1.27 1.27))))
    (property "Value" "${nm}" (at 0 ${r2(-halfH - LEAD - 1.27)} 0) (effects (font (size 1.27 1.27))))
    (property "Footprint" "${ic.package || ''}" (at 0 0 0) (effects (font (size 1.27 1.27)) hide))
    (property "Datasheet" "${ic.datasheet || ''}" (at 0 0 0) (effects (font (size 1.27 1.27)) hide))
    (property "Manufacturer" "${ic.mfr || ''}" (at 0 0 0) (effects (font (size 1.27 1.27)) hide))
    (symbol "${nm}_0_1"
      (rectangle (start ${r2(-halfW)} ${r2(halfH)}) (end ${r2(halfW)} ${r2(-halfH)})
        (stroke (width 0.254) (type default)) (fill (type background))))
    (symbol "${nm}_1_1"
${pins}    )
  )
)
`;
  }

  // ---------- B) OrCAD pin CSV ----------
  function orcadCsv(ic) {
    const sideMap = { L: 'Left', R: 'Right', T: 'Top', B: 'Bottom' };
    let out = 'PartNumber,PinNumber,PinName,ElectricalType,Side,Function\n';
    (ic.pins || []).slice().sort((a, b) => (a.num || 0) - (b.num || 0)).forEach(p => {
      const f = String(p.desc || '').replace(/"/g, '""');
      out += `${ic.part},${p.num},${plain(p.name)},${etype(p)},${sideMap[p.side] || p.side},"${f}"\n`;
    });
    return out;
  }

  // ---------- B) OrCAD Capture Tcl 樣板 ----------
  function orcadTcl(ic) {
    const rows = (ic.pins || []).slice().sort((a, b) => (a.num || 0) - (b.num || 0))
      .map(p => `  {${p.num} "${plain(p.name)}" ${etype(p)} ${p.side}}`).join('\n');
    return `# OrCAD Capture Tcl 樣板 — 由 HardwareAI 產生
# 用法：Capture → 開啟/新建 .olb → 主選單 scripting/Tcl console → source 本檔
# 注意：實際建 pin 的 API 依 OrCAD 版本(17.x / OrCAD X)不同，下方 pinData 為資料，
#       create_part 內請改成你版本的符號建立 API（或把 pinData 交給 lib 產生工具）。
set partName "${ic.part}"
set package  "${ic.package || ''}"
# {pinNumber pinName electricalType side(L/R/T/B)}
set pinData {
${rows}
}
puts "Part: $partName  Pins: [llength $pinData]"
# foreach p $pinData { lassign $p num name etype side; <在此呼叫你版本的 add-pin API> }
`;
  }

  function download(filename, text, mime) {
    const blob = new Blob([text], { type: mime || 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 100);
  }

  return { kicadSym, orcadCsv, orcadTcl, download, etype };
})();
