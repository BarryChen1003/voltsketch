/**
 * sch-annotate-ui.js — 線路圖頁「自動編號 refdes」面板的綁定
 *
 * 邏輯在 annotate.js（純函式，node 測得到）。這支只負責接按鈕、問確認、報結果。
 *
 * 兩個模式的風險差很多，所以處理方式不同：
 *   補編未命名的 —— 不動既有編號，直接做，不問。
 *   全部重新編號 —— 會改掉使用者已經寫進筆記與 BOM 的名字，先問，並說明可以 Ctrl+Z。
 */
(function () {
  'use strict';

  const T = (k, v) => (window.I18N ? window.I18N.t(k, v) : k);
  const A = () => (typeof app !== 'undefined' ? app : null);
  const el = id => document.getElementById(id);

  function report(res, out) {
    const bits = [];
    if (res.changes.length) {
      // 只列前幾個，全部列出來會把面板撐爆
      const list = res.changes.slice(0, 6).map(c => c.to).join(', ') + (res.changes.length > 6 ? '…' : '');
      bits.push(T('pj_an_done', { n: res.changes.length, list }));
    } else {
      bits.push(T('pj_an_none'));
    }
    if (res.dupes.length) bits.push(T('pj_an_dupes', { list: res.dupes.join(', ') }));
    if (res.skipped.length) bits.push(T('pj_an_skipped', { n: res.skipped.length }));
    out.textContent = bits.join(' ');
  }

  function run(mode) {
    const a = A(), out = el('anOut');
    if (!a || !a.state || !window.Annotate || !out) return;
    const comps = a.state.components || [];
    const res = window.Annotate.plan(comps, { mode });

    if (!res.changes.length) { report(res, out); return; }
    if (mode === 'renumber' && !window.confirm(T('pj_an_ask_all', { n: res.changes.length }))) return;

    a.saveUndo();
    window.Annotate.apply(comps, res.changes);
    a.render();
    report(res, out);
  }

  function boot() {
    if (!el('anFill')) return;
    el('anFill').addEventListener('click', () => run('fill'));
    el('anAll')?.addEventListener('click', () => run('renumber'));
    const paint = () => { const h = el('anHint'); if (h) h.textContent = T('pj_an_hint'); };
    paint();
    document.addEventListener('vs-lang-change', paint);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
