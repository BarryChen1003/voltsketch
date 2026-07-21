/**
 * pcb-history.js — PCB Layout 復原/重做＋自動存檔＋版面匯出/匯入
 * 快照式：每個變更動作前 push 一份 state 序列化（上限 50 步），Ctrl+Z/Ctrl+Y 走兩疊。
 * 自動存檔：render 後 debounce 800ms 存 localStorage；重開頁自動還原上次版面。
 * 誠實界定：KiCad 匯入樹（state.kicad，可能數 MB）不進快照——undo 跨過 KiCad 匯入時，
 * 元件/走線會回復但零落差匯出樹維持最後一次匯入的內容。
 */
window.PcbHistory = (function () {
  'use strict';

  const LS_KEY = 'hardwareai-pcb-autosave';
  const CAP = 50;
  // 執行期/檢視用欄位不進快照（selected 等物件參照在還原後會失效，一律清掉重建）
  const SKIP = new Set(['tool', 'selected', 'selectedTrace', 'dragComp', 'dragOff', 'isDragging', 'isPanning',
    'lastMouse', 'ratsnest', 'traceDraw', 'zoneDraw', 'dimDraw', 'keepoutDraw',
    'refBoard', 'refOverlayId', 'kicad', 'palette', 'showRatsnest', 'zoom', 'panX', 'panY']);

  let undoStack = [];
  let redoStack = [];
  let saveTimer = null;

  function serialize(state) {
    const o = {};
    for (const k of Object.keys(state)) {
      if (SKIP.has(k)) continue;
      const v = state[k];
      if (typeof v === 'function') continue;
      o[k] = v;
    }
    return JSON.stringify(o);
  }

  function applySnap(app, json) {
    const o = JSON.parse(json);
    Object.assign(app.state, o);
    // 參照型執行期欄位全清（舊參照指向被換掉的物件）
    app.state.selected = null;
    app.state.selectedTrace = null;
    app.state.dragComp = null;
    app.state.ratsnest = null;
    app.state.traceDraw = null;
    app.state.zoneDraw = null;
    app.state.dimDraw = null;
    app.state.keepoutDraw = null;
    // 版面設定輸入框與清單同步
    const wI = document.querySelector('#boardWidth'), hI = document.querySelector('#boardHeight'), lI = document.querySelector('#boardLayers');
    if (wI) wI.value = app.state.boardWidth;
    if (hI) hI.value = app.state.boardHeight;
    if (lI) lI.value = app.state.layers;
    app.renderLayerList();
    app.renderPartsList();
    app.populateEmiSelects();
    app.syncSelPanel();
    app.render();
  }

  // 變更動作「之前」呼叫：把當下狀態推進復原疊
  function push(state) {
    const snap = serialize(state);
    if (undoStack.length && undoStack[undoStack.length - 1] === snap) return; // 無變化不重複
    undoStack.push(snap);
    if (undoStack.length > CAP) undoStack.shift();
    redoStack = [];
  }

  function undo(app) {
    if (!undoStack.length) return false;
    redoStack.push(serialize(app.state));
    applySnap(app, undoStack.pop());
    saveSoon(app);
    return true;
  }

  function redo(app) {
    if (!redoStack.length) return false;
    undoStack.push(serialize(app.state));
    applySnap(app, redoStack.pop());
    saveSoon(app);
    return true;
  }

  // ---- 自動存檔 ----
  function saveSoon(app) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(LS_KEY, JSON.stringify({ v: 1, t: Date.now(), data: serialize(app.state) }));
      } catch (e) { /* 超出配額（超大 KiCad 板）就放棄自動存檔，不擋操作 */ }
    }, 800);
  }

  function boot(app) {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return false;
      const o = JSON.parse(raw);
      if (!o || o.v !== 1 || !o.data) return false;
      const parsed = JSON.parse(o.data);
      // 空版面（沒料沒線）不還原，避免蓋掉「重新開始」的意圖
      if (!(parsed.components || []).length && !(parsed.traces || []).length) return false;
      applySnap(app, o.data);
      return true;
    } catch (e) { return false; }
  }

  // ---- 版面檔匯出/匯入 ----
  function exportBoard(app) {
    const blob = new Blob([JSON.stringify({ app: 'hardwareai-pcb', v: 1, t: Date.now(), data: JSON.parse(serialize(app.state)) }, null, 1)],
      { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'hardwareai-board.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function importBoard(app, text) {
    let o;
    try { o = JSON.parse(text); } catch (e) { return false; }
    if (!o || o.app !== 'hardwareai-pcb' || !o.data) return false;
    push(app.state);
    applySnap(app, JSON.stringify(o.data));
    saveSoon(app);
    return true;
  }

  const depth = () => ({ undo: undoStack.length, redo: redoStack.length });

  return { push, undo, redo, boot, saveSoon, exportBoard, importBoard, depth };
})();
