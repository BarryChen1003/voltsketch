/**
 * pcb-interact.js — PCB 編輯器的互動資料層（純函式、不碰 DOM）
 *
 * 為什麼要獨立一個檔：右鍵選單有哪些項目、快捷鍵表寫了什麼、圓弧走線該怎麼描邊，
 * 這三件事本來散在 pcb.js 的繪圖與事件處理裡，node 測不到。結果就是
 * 「選取圓弧走線時高亮畫成直線」這種錯只能靠肉眼發現——而且沒人會去點那條弧。
 * 這裡是唯一一份定義；pcb.js 只負責把它畫出來、把事件接上去。
 */
'use strict';
(function (root) {
  const Interact = {};
  const fin = v => typeof v === 'number' && isFinite(v);

  /**
   * 走線的幾何路徑。圓弧走線一律回 arc。
   * 走線本體早就會畫弧（pcb.js drawTraces），但選取高亮與網路高亮各自用兩端點
   * 畫直線——弧越大，高亮離被選的東西越遠。描邊只准從這裡拿路徑。
   */
  Interact.pathOf = function (t) {
    const a = t && t.arc;
    if (a && fin(a.cx) && fin(a.cy) && fin(a.a0) && fin(a.a1) && a.r > 0)
      return { kind: 'arc', cx: a.cx, cy: a.cy, r: a.r, a0: a.a0, a1: a.a1 };
    return { kind: 'line', x1: t.x1, y1: t.y1, x2: t.x2, y2: t.y2 };
  };

  /** 走線長度（弧走弧長）。屬性面板要顯示這個數字，直線公式套在弧上會短報。 */
  Interact.lengthOf = function (t) {
    const p = Interact.pathOf(t);
    if (p.kind === 'arc') return Math.abs(p.a1 - p.a0) * p.r;
    return Math.hypot(p.x2 - p.x1, p.y2 - p.y1);
  };

  /** 對面銅層。內層回原層：4 層板的 In1 該翻到哪一層沒有唯一答案，不猜。 */
  Interact.flipLayer = function (layer) {
    if (layer === 'F.Cu') return 'B.Cu';
    if (layer === 'B.Cu') return 'F.Cu';
    return layer;
  };

  /**
   * 右鍵選單項目。回純資料，畫面另外組，這樣「點到走線時有沒有刪除項」測得到。
   * 不能按的項目用 disabled 而不是整個拿掉：使用者要看得到功能存在。
   */
  Interact.menuFor = function (hit, state) {
    const st = state || {};
    const kind = hit && hit.kind;
    const items = [];
    const add = (id, i18n, opt) => items.push(Object.assign({ id: id, i18n: i18n }, opt || {}));
    if (kind === 'trace') {
      const t = hit.trace || {};
      const layer = t.layer || 'F.Cu';
      add('hlnet', 'pj_cm_hlnet', { disabled: !t.net });
      add('flip', 'pj_cm_flip', { disabled: Interact.flipLayer(layer) === layer });
      add('applyw', 'pj_cm_width');
      add('delete', 'pj_cm_delete', { danger: true });
    } else if (kind === 'comp') {
      add('rotate', 'pj_cm_rot');
      add('rename', 'pj_cm_rename');
      add('hlnet', 'pj_cm_hlnet', { disabled: !hit.net });
      add('delete', 'pj_cm_delete', { danger: true });
    } else {
      add('paste', 'pj_cm_paste', { disabled: !((st.clipboard || []).length) });
      add('fit', 'pj_cm_fit');
      add('rats', 'pj_cm_rats');
      add('clearhl', 'pj_cm_clearhl', { disabled: !st.highlightNet });
    }
    return items;
  };

  /**
   * 快捷鍵表。說明面板讀這份，測試也拿這份去比對 pcb.js 的 keydown，
   * 免得出現「說明寫了、其實沒綁」或「綁了、使用者永遠不知道」。
   */
  Interact.shortcuts = function () {
    return [
      { keys: 'Ctrl+Z',                act: 'undo',        i18n: 'pj_sc_undo' },
      { keys: 'Ctrl+Y / Ctrl+Shift+Z', act: 'redo',        i18n: 'pj_sc_redo' },
      { keys: 'Ctrl+C',                act: 'copy',        i18n: 'pj_sc_copy' },
      { keys: 'Ctrl+V',                act: 'paste',       i18n: 'pj_sc_paste' },
      { keys: 'Delete / Backspace',    act: 'delete',      i18n: 'pj_sc_del' },
      { keys: 'R',                     act: 'rotate',      i18n: 'pj_sc_rot' },
      { keys: 'Arrow',                 act: 'nudge',       i18n: 'pj_sc_nudge' },
      { keys: 'Ctrl + Arrow',          act: 'nudgeFine',   i18n: 'pj_sc_nudgefine' },
      { keys: 'Shift + Drag',          act: 'boxSelect',   i18n: 'pj_sc_box' },
      { keys: 'Shift',                 act: 'freeAngle',   i18n: 'pj_sc_free' },
      { keys: '1..9',                  act: 'layerSwitch', i18n: 'pj_sc_layer' },
      { keys: 'Esc',                   act: 'cancel',      i18n: 'pj_sc_esc' },
      { keys: 'Right click',           act: 'contextMenu', i18n: 'pj_sc_ctx' }
    ];
  };

  /**
   * hover 資訊卡的內容。回 [{label, value}]，畫面自己排版。
   *
   * 為什麼要純函式：滑鼠移過去顯示什麼，是「這條線屬於哪個網路、在哪一層、多寬」
   * 這種會被使用者拿來做判斷的資訊。顯示錯（例如弧線長度用弦長算）比不顯示更糟，
   * 所以內容算在這裡、node 測得到；DOM 那邊只負責貼上去。
   */
  Interact.hoverInfo = function (hit) {
    const rows = [];
    if (!hit || !hit.kind) return rows;
    const n = v => Math.round(v * 1000) / 1000;
    if (hit.kind === 'trace') {
      const t = hit.trace || {};
      rows.push({ label: 'pj_ts_net', value: t.net || '—' });
      rows.push({ label: 'pj_ts_layer', value: t.layer || 'F.Cu' });
      rows.push({ label: 'pj_ts_width', value: n(t.width || 0.3) + ' mm' });
      rows.push({ label: 'pj_ts_len', value: n(Interact.lengthOf(t)) + ' mm' });
    } else if (hit.kind === 'pad') {
      rows.push({ label: 'pj_hv_pad', value: (hit.ref || '?') + '.' + (hit.pin == null ? '?' : hit.pin) });
      rows.push({ label: 'pj_ts_net', value: hit.net || '—' });
      if (hit.drill > 0) rows.push({ label: 'pj_hv_drill', value: n(hit.drill) + ' mm' });
    } else if (hit.kind === 'via') {
      rows.push({ label: 'pj_hv_via', value: (hit.od == null ? '?' : n(hit.od)) + ' / ' + (hit.drill == null ? '?' : n(hit.drill)) + ' mm' });
      rows.push({ label: 'pj_ts_net', value: hit.net || '—' });
    } else if (hit.kind === 'comp') {
      rows.push({ label: 'pj_hv_comp', value: (hit.ref || '?') + (hit.part ? '  ' + hit.part : '') });
      if (hit.pins != null) rows.push({ label: 'pj_hv_pins', value: String(hit.pins) });
    }
    return rows;
  };

  /**
   * 走線中按數字鍵換層：1=第一個銅層、2=第二個…。回 null 表示這個鍵不對應任何層。
   * 用疊層順序而不是固定名稱，因為 4 層板的第 2 層是 In1.Cu、2 層板的第 2 層是 B.Cu。
   */
  Interact.layerForKey = function (key, cuIds) {
    const ids = cuIds || [];
    if (!/^[1-9]$/.test(String(key))) return null;
    const i = Number(key) - 1;
    return i < ids.length ? ids[i] : null;
  };

  /** 說明面板與選單用到的所有 i18n key（測試拿去對 i18n.js 的四語覆蓋）。 */
  Interact.i18nKeys = function () {
    const keys = Interact.shortcuts().map(s => s.i18n);
    const hits = [
      { kind: 'trace', trace: { net: 'N1', layer: 'F.Cu' } },
      { kind: 'comp', net: 'N1' },
      null
    ];
    hits.forEach(h => Interact.menuFor(h, {}).forEach(it => keys.push(it.i18n)));
    ['pj_sc_title', 'pj_ts_title', 'pj_ts_width', 'pj_ts_layer', 'pj_ts_net',
     'pj_hv_pad', 'pj_hv_drill', 'pj_hv_via', 'pj_hv_comp', 'pj_hv_pins', 'pj_sc_layer',
     'pj_ts_len', 'pj_ts_del', 'pj_ts_none', 'pj_ts_applied'].forEach(k => keys.push(k));
    return keys.filter((k, i) => keys.indexOf(k) === i);
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = Interact;
  root.PcbInteract = Interact;
})(typeof window !== 'undefined' ? window : globalThis);
