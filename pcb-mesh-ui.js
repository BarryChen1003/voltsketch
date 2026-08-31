/**
 * pcb-mesh-ui.js — 把 .wrl / .obj 綁到選取元件的封裝上（3D 畫面用）
 *
 * 跟 pcb-step-model-ui.js 是一對：那支管**匯出**（STEP 併進機構檔），
 * 這支管**畫面**（3D 檢視顯示真模型）。兩邊用同一把鑰匙（FpInst 封裝身分），
 * 所以綁一次 0603，板上所有 0603 都吃得到。
 *
 * 為什麼不是同一個檔案就好：STEP 是 B-rep，瀏覽器畫不出來（要 CAD kernel）；
 * .wrl/.obj 是已經鑲嵌好的三角形，直接畫得動。使用者手上常常兩種都有。
 */
(function () {
  'use strict';

  const T = (k, v) => (window.I18N ? window.I18N.t(k, v) : k);
  const el = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const app = () => window.pcbApp;
  const toast = (m, k) => { const a = app(); if (a && a.toast) a.toast(m, k); };
  const kb = n => (n >= 1048576 ? (n / 1048576).toFixed(1) + 'MB' : Math.round(n / 1024) + 'KB');

  function keyOfSelected() {
    const a = app();
    const c = a && a.state && a.state.selected;
    if (!c) return { key: '', comp: null };
    // 鑰匙跟 STEP 模型同一把。沒有 FpInst 身分（沒蓋章的元件）就綁不了，要說清楚。
    const key = (window.StepModel && window.StepModel.keyOf) ? window.StepModel.keyOf(c) : '';
    return { key: key, comp: c };
  }

  function render() {
    const box = el('meshList');
    if (!box || !window.PcbMesh) return;
    const store = window.PcbMesh.meshStore;
    const keys = store.keys();
    const sel = keyOfSelected();

    const status = el('meshStatus');
    if (status) {
      if (!sel.comp) status.textContent = T('mesh_pick_comp');
      else if (!sel.key) status.textContent = T('mesh_no_identity');
      else {
        const rec = store.get(sel.key);
        status.textContent = rec
          ? T('mesh_bound', { name: rec.name, tris: rec.tris })
          : T('mesh_unbound', { key: sel.key });
      }
    }

    if (!keys.length) { box.innerHTML = '<div style="color:var(--muted)">' + esc(T('mesh_empty')) + '</div>'; return; }
    box.innerHTML = keys.map(k => {
      const r = store.get(k) || {};
      return '<div class="mesh-row"><span class="mesh-k" title="' + esc(k) + '">' + esc(k) + '</span>' +
        '<span class="mesh-v">' + esc(r.name || '') + '　' + (r.tris || 0) + ' △</span>' +
        '<button class="small-button" type="button" data-mesh-del="' + esc(k) + '">✕</button></div>';
    }).join('');
  }

  function bind(file) {
    const sel = keyOfSelected();
    if (!sel.comp) { toast(T('mesh_pick_comp'), 'warn'); return; }
    if (!sel.key) { toast(T('mesh_no_identity'), 'warn'); return; }
    const fr = new FileReader();
    fr.onload = () => {
      let parsed;
      try { parsed = window.PcbMesh.parse(String(fr.result), file.name); }
      catch (e) {
        const code = String(e && e.message || '').split(':')[0];
        toast(T(code), 'error');
        return;
      }
      const fit = !!(el('meshFit') && el('meshFit').checked);
      const rec = window.PcbMesh.compact(parsed, file.name, { fit: fit });
      const res = window.PcbMesh.meshStore.set(sel.key, rec);
      if (!res.ok) { toast(T(res.why, { max: kb(window.PcbMesh.MAX_BYTES) }), 'error'); return; }
      toast(T('mesh_saved', { name: file.name, tris: rec.tris, key: sel.key }), 'info');
      render();
    };
    fr.onerror = () => toast(T('mesh_err_read'), 'error');
    fr.readAsText(file);
  }

  function init() {
    const input = el('meshFile');
    if (!input) return;
    input.addEventListener('change', () => {
      const f = input.files && input.files[0];
      if (f) bind(f);
      input.value = '';           // 同一個檔可以再選一次（不清的話 change 不會再觸發）
    });
    el('meshList')?.addEventListener('click', (e) => {
      const btn = e.target.closest ? e.target.closest('[data-mesh-del]') : null;
      if (!btn) return;
      const k = btn.getAttribute('data-mesh-del');
      if (window.PcbMesh.meshStore.remove(k)) { toast(T('mesh_removed', { key: k }), 'info'); render(); }
    });
    window.addEventListener('vs-lang-change', render);
    // 選到不同元件時，狀態列要跟著換（不然使用者不知道現在會綁到誰身上）
    document.addEventListener('click', () => setTimeout(render, 0));
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.PcbMeshUI = { render: render };
})();
