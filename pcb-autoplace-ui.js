/**
 * pcb-autoplace-ui.js — PCB 頁「自動擺件（粗排）」面板的綁定
 *
 * 邏輯在 pcb-autoplace.js（純函式，node 測得到）。這支只負責接按鈕、問確認、報結果。
 *
 * 鎖定＝目前選取的元件。理由：板子上沒有獨立的「鎖定」旗標，
 * 而使用者想保住的通常就是他剛擺好、還選著的那幾顆（連接器、按鍵、螺絲孔）。
 * 這比多做一個鎖定欄位（要進 board JSON、undo、匯出）便宜得多，而且直覺。
 */
(function () {
  'use strict';

  const T = (k, v) => (window.I18N ? window.I18N.t(k, v) : k);
  const el = id => document.getElementById(id);

  function lockedRefs(app) {
    const s = app.state || {};
    const set = new Set();
    const add = c => { if (c) set.add(String(c.ref || c.id)); };
    if (Array.isArray(s.selectedSet)) s.selectedSet.forEach(add);
    add(s.selected);
    return [...set];
  }

  function run() {
    const app = window.pcbApp, out = el('apOut');
    if (!app || !app.state || !window.AutoPlace || !out) return;
    const comps = app.state.components || [];
    const locked = lockedRefs(app);

    const res = window.AutoPlace.plan(comps, {
      boardWidth: app.state.boardWidth,
      boardHeight: app.state.boardHeight,
      locked,
    });

    if (!res.moves.length) { out.textContent = T('pj_ap_none'); return; }
    if (!window.confirm(T('pj_ap_ask', { n: res.moves.length }))) return;

    app.hist();                                   // 走跟其它編輯動作同一條 undo
    window.AutoPlace.apply(comps, res.moves);
    app.render();
    if (app.renderPartsList) app.renderPartsList();

    const bits = [T('pj_ap_done', { n: res.moves.length, lk: res.linked })];
    if (locked.length) bits.push(T('pj_ap_locked', { n: locked.length }));
    if (res.skipped.length) bits.push(T('pj_ap_toobig', { n: res.skipped.length, list: res.skipped.slice(0, 4).join(', ') }));
    // 重疊要講出來。板框塞不下時排完仍會疊，靜靜排完會讓使用者以為已經好了。
    if (res.overlaps) bits.push(T('pj_ap_overlap', { ov: res.overlaps }));
    out.textContent = bits.join(' ');
    if (app.toast) app.toast(T('pj_ap_done', { n: res.moves.length, lk: res.linked }), res.overlaps ? 'warn' : 'info');
  }

  function boot() {
    if (!el('apRun')) return;
    el('apRun').addEventListener('click', run);
    const paint = () => { const h = el('apHint'); if (h) h.textContent = T('pj_ap_hint'); };
    paint();
    document.addEventListener('vs-lang-change', paint);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
