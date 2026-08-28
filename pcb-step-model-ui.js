/**
 * pcb-step-model-ui.js — 把自己的 STEP 綁到選取元件的封裝上
 *
 * 綁定的鍵是**封裝身分**（FpInst.refKey），不是某一顆元件：
 * 綁一次 0603 電阻，板上所有 0603 電阻都用得到，換一片板也還在。
 * 綁在單顆上的話，一片板有 40 顆電阻就要拉 40 次。
 *
 * 模型存 localStorage：那是使用者自己的檔案，沒有理由上傳；
 * 而且 STEP 動輒幾 MB，塞進雲端那 500MB 的額度裡不划算。
 */
(function () {
  'use strict';

  const T = (k, v) => (window.I18N ? window.I18N.t(k, v) : k);
  const el = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const SM = () => window.StepModel;
  const app = () => window.pcbApp;
  const toast = (m, k) => { const a = app(); if (a && a.toast) a.toast(m, k); };

  const kb = n => (n >= 1048576 ? (n / 1048576).toFixed(1) + 'MB' : Math.round(n / 1024) + 'KB');

  function render() {
    const box = el('smList');
    if (!box || !SM()) return;
    const models = SM().store.all();
    const keys = Object.keys(models);
    const a = app();
    const sel = a && a.state && a.state.selected;
    const selKey = sel ? SM().keyOf(sel) : '';

    const cur = el('smCur');
    if (cur) {
      cur.textContent = !sel ? T('sm_nosel')
        : (selKey ? T('sm_cur', { ref: sel.ref || sel.id, key: selKey })
          : T('sm_nokey', { ref: sel.ref || sel.id }));
    }
    const btn = el('smBind');
    if (btn) btn.disabled = !selKey;

    if (!keys.length) { box.innerHTML = '<div style="color:var(--muted)">' + esc(T('sm_empty')) + '</div>'; return; }
    box.innerHTML = keys.sort().map(k => {
      const m = models[k];
      const used = k === selKey;
      return '<div class="sm-row" data-key="' + esc(k) + '" style="display:grid;grid-template-columns:1fr auto auto;gap:6px;align-items:center;padding:3px 0;border-bottom:1px solid var(--line)">' +
        '<div><div style="font-size:12px' + (used ? ';color:var(--accent-strong)' : '') + '">' + esc(m.name || '(step)') + '</div>' +
        '<div style="color:var(--muted);font-size:11px">' + esc(k) + ' │ ' + esc(kb(m.bytes || 0)) +
        (m.solids ? ' │ ' + esc(T('sm_solids', { n: m.solids })) : '') + '</div></div>' +
        '<button class="small-button" data-act="scale" style="padding:0 6px">×' + (m.scale > 0 ? m.scale : 1) + '</button>' +
        '<button class="small-button" data-act="del" style="padding:0 6px">✕</button>' +
        '</div>';
    }).join('');
  }

  function onFile(ev) {
    const f = ev.target.files && ev.target.files[0];
    ev.target.value = '';                       // 選同一個檔還要能再觸發一次
    if (!f) return;
    const a = app();
    const sel = a && a.state && a.state.selected;
    const key = sel ? SM().keyOf(sel) : '';
    if (!key) { toast(T('sm_nokey_pick'), 'warn'); return; }
    if (f.size > SM().MAX_BYTES) { toast(T('sm_too_large', { size: kb(f.size), max: kb(SM().MAX_BYTES) }), 'error'); return; }
    const rd = new FileReader();
    rd.onload = () => {
      const text = String(rd.result || '');
      const pr = SM().parse(text);
      // 解析不了就當場擋下來。存進去再等匯出時才發現，中間使用者已經
      // 以為綁好了——而 STEP 匯出不是每天做的事，那個誤會會活很久。
      if (!pr.ok) { toast(T('sm_bad', { name: f.name, why: T('sm_why_' + pr.reason) }), 'error'); return; }
      const solids = SM().solidsOf(pr.entities).length;
      if (!solids) { toast(T('sm_nosolid', { name: f.name }), 'error'); return; }
      const okk = SM().store.set(key, { name: f.name, text, bytes: f.size, solids, scale: 1 });
      if (!okk) { toast(T('sm_quota'), 'error'); return; }
      render();
      toast(T('sm_bound', { name: f.name, key, n: solids }), 'info');
    };
    rd.onerror = () => toast(T('sm_read_failed', { name: f.name }), 'error');
    rd.readAsText(f);
  }

  function onList(ev) {
    const btn = ev.target.closest && ev.target.closest('button[data-act]');
    if (!btn) return;
    const row = btn.closest('.sm-row');
    if (!row) return;
    const key = row.getAttribute('data-key');
    const m = SM().store.get(key);
    if (!m) return;
    if (btn.dataset.act === 'del') {
      if (!window.confirm(T('sm_ask_del', { name: m.name || key }))) return;
      SM().store.remove(key);
      render();
      toast(T('sm_removed', { name: m.name || key }));
      return;
    }
    // 單位不對是匯入 STEP 最常見的問題（公制/英制、或別人用 cm 畫的）
    const s = window.prompt(T('sm_ask_scale', { name: m.name || key }), String(m.scale > 0 ? m.scale : 1));
    if (s === null) return;
    const v = parseFloat(s);
    if (!(v > 0)) { toast(T('sm_bad_scale'), 'warn'); return; }
    SM().store.set(key, Object.assign({}, m, { scale: v }));
    render();
    toast(T('sm_scaled', { name: m.name || key, k: v }));
  }

  function boot() {
    if (!el('smList')) return;
    el('smFile')?.addEventListener('change', onFile);
    el('smBind')?.addEventListener('click', () => el('smFile')?.click());
    el('smRefresh')?.addEventListener('click', render);
    el('smList')?.addEventListener('click', onList);
    document.addEventListener('vs-lang-change', render);
    // 選取變了要重畫（哪一顆的封裝、能不能綁）
    setInterval(() => { if (el('smList') && el('smList').offsetParent) render(); }, 1200);
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.StepModelUI = { render };
})();
