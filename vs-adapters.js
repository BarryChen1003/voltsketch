/**
 * vs-adapters.js — 匯出 adapter 註冊表（統一介面）
 *  每個 adapter：{ id, label, ext, mime, kind, note, exportSymbol(model, ic) -> {filename,text,mime} }
 *    kind:
 *      'native'   = 本站自寫、檔案直接可用（JSON / KiCad —— 文字格式、公開規格）
 *      'via-tool' = 本站產「資料/腳本」，由目標工具生成最終檔
 *                   （.olb/.brd/.dra 為 Cadence 專有二進位，不自寫 —— 誠實原則）
 *  匯出流程：normalizeIC → validateSymbol → 閘門(ExportGate，未接時放行) → adapter → 下載。
 *  之後 Supabase export-gateway（額度/VIP）只要定義 window.ExportGate.consume 即接上，UI 不改。
 */
window.VSAdapters = (function () {
  const reg = new Map();
  function register(a) { reg.set(a.id, a); }
  function get(id) { return reg.get(id); }
  function list() { return Array.from(reg.values()); }

  // ---- 匯出閘門掛鉤（Task: Supabase 額度）----
  async function gate(exportType) {
    if (window.ExportGate && typeof window.ExportGate.consume === 'function') {
      try { return await window.ExportGate.consume(exportType); }
      catch (e) { return { allowed: false, remaining: 0, reason: 'gate_error: ' + e.message }; }
    }
    return { allowed: true, remaining: -1, reason: 'local' };  // 本機 demo：未接閘門直接放行
  }

  // ---- 統一匯出入口 ----
  async function exportIC(id, ic) {
    const a = get(id);
    if (!a) throw new Error('unknown adapter: ' + id);
    const model = window.VSModel.normalizeIC(ic);
    const v = window.VSModel.validateSymbol(model);
    if (!v.ok) return { ok: false, reason: '驗證失敗：' + v.errors.join('；') };
    const g = await gate(id);
    if (!g.allowed) return { ok: false, blocked: true, reason: g.reason, remaining: g.remaining };
    const out = a.exportSymbol(model, ic);
    window.ICExport.download(out.filename, out.text, out.mime || a.mime);
    return { ok: true, remaining: g.remaining };
  }

  // ============ Adapters ============

  // 1) VoltSketch JSON（native）—— 中繼基準格式，100% 無損
  register({
    id: 'json', label: 'VoltSketch JSON', ext: '.vs.json', mime: 'application/json',
    kind: 'native', note: '本站標準模型，100% 無損、可再匯入',
    exportSymbol(model) {
      return { filename: model.partNumber + '.vs.json', text: JSON.stringify(model, null, 2) };
    }
  });

  // 2) KiCad 符號（native）—— 文字格式、公開規格，唯一能完整自寫的 EDA 目標
  register({
    id: 'kicad', label: 'KiCad 符號 (.kicad_sym)', ext: '.kicad_sym', mime: 'text/plain',
    kind: 'native', note: '純自製、公開規格，拖進 KiCad 直接用',
    exportSymbol(model, ic) {
      return { filename: model.partNumber + '.kicad_sym', text: window.ICExport.kicadSym(ic) };
    }
  });

  // 3) OrCAD pin 清單 CSV（via-tool）—— 餵 Ultra Librarian / OrCAD X Part Developer 生 .olb
  register({
    id: 'csv', label: 'OLB 用 pin 清單 (CSV)', ext: '.csv', mime: 'text/csv',
    kind: 'via-tool', note: '.olb 是 Cadence 專有二進位、不自寫；把 CSV 餵 Ultra Librarian / Part Developer 生成',
    exportSymbol(model, ic) {
      return { filename: model.partNumber + '-pins.csv', text: window.ICExport.orcadCsv(ic) };
    }
  });

  // 4) OrCAD Capture Tcl（via-tool）—— Capture 內 source 執行建 .olb
  register({
    id: 'tcl', label: 'OrCAD Capture Tcl', ext: '.tcl', mime: 'text/plain',
    kind: 'via-tool', note: '在 Capture 的 Tcl console source 執行；建 pin API 依版本微調',
    exportSymbol(model, ic) {
      return { filename: model.partNumber + '.tcl', text: window.ICExport.orcadTcl(ic) };
    }
  });

  return { register, get, list, exportIC };
})();
