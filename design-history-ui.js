/**
 * design-history-ui.js — 變更歷史面板（線路圖頁與 PCB 頁共用）
 *
 * 清單本體與快照/還原走 designs-ui.js 已經接好的那一套（`DesignsUI.mount` 的
 * snapshot / restore）——歷史面板只多做三件事：建檢查點、列出版本、還原某一版。
 *
 * **還原不是覆蓋**：還原之後會建一個新版本，parent 指向被還原的那一版。
 * 直接覆蓋的話，中間那幾版看起來像憑空消失；記了來源，歷史就是一棵樹。
 *
 * 還原前一定先建一個「還原前」的檢查點：使用者按下去才發現不是想要的那一版時，
 * 手上要有路可以回來。
 */
(function () {
  'use strict';

  const T = (k, v) => (window.I18N ? window.I18N.t(k, v) : k);
  const el = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const H = () => window.DesignHistory;
  const D = () => window.Designs;

  let cfg = null;          // { field:'sch'|'pcb', snapshot, restore, toast }
  let rows = [];
  let busy = false;
  let lastRestored = null; // 上一次還原的是哪一版 → 下一次存檔的 parent

  const toast = (m, k) => { if (cfg && cfg.toast) cfg.toast(m, k); };
  const errMsg = e => T('vh_' + H().mapErr(e), { err: String((e && e.message) || e) });

  function when(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return String(iso || '');
    const p = n => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  function render() {
    const box = el('vhList');
    if (!box) return;
    if (!D() || !D().currentId()) {
      box.innerHTML = '<div style="color:var(--muted)">' + esc(T('vh_no_project')) + '</div>';
      return;
    }
    if (!rows.length) {
      box.innerHTML = '<div style="color:var(--muted)">' + esc(T('vh_empty')) + '</div>';
      return;
    }
    // 樹狀縮排：現在只是視覺上的，但資料本來就是樹，日後畫線也不必改資料
    const nodes = H().tree(rows).slice().reverse();   // 新的在上面
    box.innerHTML = nodes.map(n => {
      const m = n.meta || {};
      const bits = [];
      if (m.sc || m.sw) bits.push(T('vh_meta_sch', { c: m.sc || 0, w: m.sw || 0 }));
      if (m.pc || m.pt) bits.push(T('vh_meta_pcb', { c: m.pc || 0, t: m.pt || 0 }));
      return '<div class="vh-row" data-id="' + esc(n.id) + '" style="display:grid;grid-template-columns:1fr auto auto;gap:6px;align-items:center;padding:4px 0;border-bottom:1px solid var(--line);margin-left:' + (n.depth * 10) + 'px">' +
        '<div><div style="font-size:12px">' + (n.label ? '<b>' + esc(n.label) + '</b>' : '<span style="color:var(--muted)">' + esc(T('vh_unnamed')) + '</span>') + '</div>' +
        '<div style="color:var(--muted);font-size:11px">' + esc(when(n.created_at)) + (bits.length ? ' │ ' + esc(bits.join(' ')) : '') + '</div></div>' +
        '<button class="small-button" data-act="restore" style="padding:0 6px">' + esc(T('vh_restore')) + '</button>' +
        '<button class="small-button" data-act="del" style="padding:0 6px">✕</button>' +
        '</div>';
    }).join('');
  }

  async function refresh() {
    const box = el('vhList');
    if (!box || !H() || !D()) return;
    const id = D().currentId();
    if (!id) { rows = []; render(); return; }
    try { rows = await H().list(id); } catch (e) { toast(errMsg(e), 'error'); return; }
    render();
  }

  async function checkpoint(label, parentId) {
    const id = D().currentId();
    if (!id) { toast(T('vh_no_project'), 'warn'); return null; }
    const data = cfg && cfg.snapshot ? cfg.snapshot() : null;
    if (!data) { toast(T('vh_no_data'), 'warn'); return null; }
    // 這一頁只拿得到自己那一半（線路圖頁只有 sch、PCB 頁只有 pcb）。
    // 另一半從雲端那一列補回來——不補的話存一次檢查點就把另一半清成 null，
    // 而且是靜默的：使用者要等到還原才發現線路圖不見了。
    let other = null;
    try { other = await D().load(id); } catch (e) { /* 撈不到就只存這一半，下面會講 */ }
    const snap = {
      sch: cfg.field === 'sch' ? data : (other ? other.sch : null),
      pcb: cfg.field === 'pcb' ? data : (other ? other.pcb : null),
      meta: (other && other.meta) || {}
    };
    if (!other) toast(T('vh_half_only'), 'warn');
    return await H().save(id, snap, label, parentId || null);
  }

  async function onSave() {
    if (busy) return; busy = true;
    try {
      const label = window.prompt(T('vh_ask_label'), '');
      if (label === null) return;
      const r = await checkpoint(label, lastRestored);
      if (!r) return;
      lastRestored = null;                 // 這條線已經接上了
      await refresh();
      toast(T(r.pruned ? 'vh_saved_pruned' : 'vh_saved', { n: r.pruned }));
    } catch (e) { toast(errMsg(e), 'error'); }
    finally { busy = false; }
  }

  async function onRestore(vid) {
    if (busy) return; busy = true;
    try {
      const v = await H().load(vid);
      if (!v) { toast(T('vh_gone'), 'error'); return; }
      const mine = cfg.field === 'sch' ? v.sch : v.pcb;
      if (!mine) { toast(T('vh_no_half', { half: cfg.field }), 'warn'); return; }
      if (!window.confirm(T('vh_ask_restore', { when: when(v.created_at), label: v.label || T('vh_unnamed') }))) return;
      // 還原之前先留一個檢查點：按下去才發現不是想要的那一版時，手上要有路回來
      try { await checkpoint(T('vh_before_restore'), null); } catch (e) { /* 留不成也要讓還原能做 */ }
      const okk = cfg.restore(mine);
      if (!okk) { toast(T('vh_restore_failed'), 'error'); return; }
      lastRestored = vid;                  // 下一次存檔的來源就是這一版
      await refresh();
      toast(T('vh_restored', { when: when(v.created_at) }));
    } catch (e) { toast(errMsg(e), 'error'); }
    finally { busy = false; }
  }

  async function onDelete(vid) {
    if (busy) return; busy = true;
    try {
      const v = rows.find(r => r.id === vid);
      if (!window.confirm(T('vh_ask_del', { when: when(v && v.created_at), label: (v && v.label) || T('vh_unnamed') }))) return;
      await H().remove(vid);
      if (lastRestored === vid) lastRestored = null;
      await refresh();
      toast(T('vh_deleted'));
    } catch (e) { toast(errMsg(e), 'error'); }
    finally { busy = false; }
  }

  function mount(c) {
    cfg = c;
    if (!el('vhList')) return;
    el('vhSave')?.addEventListener('click', onSave);
    el('vhRefresh')?.addEventListener('click', refresh);
    el('vhList')?.addEventListener('click', ev => {
      const btn = ev.target.closest && ev.target.closest('button[data-act]');
      if (!btn) return;
      const row = btn.closest('.vh-row');
      if (!row) return;
      const id = row.getAttribute('data-id');
      if (btn.dataset.act === 'restore') onRestore(id); else onDelete(id);
    });
    document.addEventListener('vs-lang-change', render);
    refresh();
  }

  window.DesignHistoryUI = { mount, refresh, _checkpoint: checkpoint };
})();
