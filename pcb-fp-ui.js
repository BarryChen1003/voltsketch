/**
 * pcb-fp-ui.js — 「封裝編輯器」面板的綁定
 *
 * 幾何與檢查全在 footprint-editor.js（純函式、node 測得到）。
 * 這支負責：讀參數、產生預覽 SVG、跑檢查、存進自建庫、放到板子上。
 *
 * 自建庫存在哪：優先雲端（designs.js 那張表的兄弟表 footprints，要登入），
 * 沒登入就退回 localStorage。兩邊格式一樣，登入後可以一鍵上傳。
 * 這樣沒帳號的人也用得到，有帳號的人換機器不會掉。
 *
 * 預覽用 SVG 直接畫：pad 是矩形/圓形/長圓，courtyard 是虛線框，
 * 第 1 腳標紅。不用 canvas 的理由是 SVG 可以直接塞進面板、不必管 DPI 與尺寸同步。
 */
(function () {
  'use strict';

  const T = (k, v) => (window.I18N ? window.I18N.t(k, v) : k);
  const FE = () => window.FootprintEditor;
  const el = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const LS_KEY = 'vs-footprints-v1';

  let current = null;

  const num = (id, d) => { const e = el(id); const v = e ? parseFloat(e.value) : NaN; return isNaN(v) ? d : v; };
  const str = (id, d) => { const e = el(id); return (e && e.value) || d; };

  function build() {
    const F = FE();
    if (!F) return null;
    const kind = str('fpKind', 'dual');
    const p = {
      name: str('fpName', '').trim() || undefined,
      pins: num('fpPins', 8), pitch: num('fpPitch', 1.27), span: num('fpSpan', 5.4),
      padW: num('fpPadW', 1.5), padH: num('fpPadH', 0.6),
      rows: num('fpRows', 4), cols: num('fpCols', 4), ballD: num('fpPadW', 0.4),
      tht: !!(el('fpTht') || {}).checked, drill: num('fpDrill', 0.8),
    };
    try {
      if (kind === 'dual') return F.dual(p);
      if (kind === 'quad') return F.quad(p);
      if (kind === 'grid') return F.grid(p);
      return F.chip(p);
    } catch (e) {
      // 腳數不合法（dual 要偶數、quad 要 4 的倍數）走這裡。
      // 丟例外的是模組，訊息是英文代碼，這裡翻成四語再顯示。
      return { _err: String(e.message || e) };
    }
  }

  function svg(fp) {
    const pads = fp.pads || [];
    if (!pads.length) return '';
    const cw = (fp.courtyard && fp.courtyard.w) || 10, ch = (fp.courtyard && fp.courtyard.h) || 10;
    const pad = 1;
    const w = cw + pad * 2, h = ch + pad * 2;
    const S = 140 / Math.max(w, h);          // 縮到面板寬度
    const parts = [];
    parts.push('<rect x="' + (-cw / 2) + '" y="' + (-ch / 2) + '" width="' + cw + '" height="' + ch +
      '" fill="none" stroke="#888" stroke-dasharray="0.4 0.3" stroke-width="0.08"/>');
    for (const q of pads) {
      const first = String(q.num) === '1' || String(q.num) === 'A1';
      const fill = first ? '#e74c3c' : '#c0932e';
      const rot = q.rot ? ' transform="rotate(' + q.rot + ' ' + q.x + ' ' + q.y + ')"' : '';
      if (q.shape === 'circle') {
        parts.push('<circle cx="' + q.x + '" cy="' + q.y + '" r="' + (q.w / 2) + '" fill="' + fill + '"/>');
      } else {
        parts.push('<rect x="' + (q.x - q.w / 2) + '" y="' + (q.y - q.h / 2) + '" width="' + q.w +
          '" height="' + q.h + '" rx="' + (q.shape === 'oval' ? Math.min(q.w, q.h) / 2 : 0) +
          '" fill="' + fill + '"' + rot + '/>');
      }
      if (q.drill > 0) {
        parts.push('<circle cx="' + q.x + '" cy="' + q.y + '" r="' + (q.drill / 2) + '" fill="#1b1b1b"/>');
      }
    }
    return '<svg viewBox="' + (-w / 2) + ' ' + (-h / 2) + ' ' + w + ' ' + h +
      '" width="' + Math.round(w * S) + '" height="' + Math.round(h * S) +
      '" style="background:#12331f;border-radius:4px">' + parts.join('') + '</svg>';
  }

  function refresh() {
    const out = el('fpOut'), prev = el('fpPreview');
    const fp = build();
    if (!fp) return;
    if (fp._err) {
      current = null;
      if (prev) prev.innerHTML = '';
      if (out) out.innerHTML = '<div style="color:#c0392b">' + esc(T('pj_fp_err_' + fp._err, {})) + '</div>';
      // 參數不合法時一定要把兩顆按鈕關掉。不關的話按鈕看起來可按，
      // 按下去因為 current 是 null 而靜靜沒反應——那比灰掉更難懂。
      const place = el('fpPlace'), save = el('fpSave');
      if (place) place.disabled = true;
      if (save) save.disabled = true;
      return;
    }
    current = fp;
    if (prev) prev.innerHTML = svg(fp);
    const issues = FE().check(fp);
    const errs = issues.filter(i => i.level === 'error');
    const bits = [];
    bits.push('<div>' + esc(T('pj_fp_summary', {
      name: fp.name, n: fp.pads.length,
      w: fp.courtyard.w, h: fp.courtyard.h,
    })) + '</div>');
    for (const i of issues.slice(0, 8)) {
      const color = i.level === 'error' ? '#c0392b' : '#d35400';
      bits.push('<div style="color:' + color + '">' + esc(T('pj_fp_' + i.code, {
        msg: i.msg, pads: (i.pads || []).join(','),
      })) + '</div>');
    }
    if (!issues.length) bits.push('<div style="color:#27ae60">' + esc(T('pj_fp_clean')) + '</div>');
    if (out) out.innerHTML = bits.join('');
    const place = el('fpPlace'), save = el('fpSave');
    // 有 error 就不准放到板子上——那是「畫出來看起來對、焊不上」的封裝
    if (place) place.disabled = errs.length > 0;
    if (save) save.disabled = errs.length > 0;
  }

  // ---- 自建庫 ----
  // 存取全部走 FpLib：沒登入落 localStorage、登入落雲端，介面一樣，
  // 所以這裡完全不必知道自己在跟誰講話。
  const LIB = () => window.FpLib;
  let libRows = [];

  function libErr(e) {
    const code = String((e && e.message) || e || '');
    const known = ['footprint_limit_reached', 'footprint_too_large', 'fp_no_pads',
      'fp_dup_name', 'fp_denied', 'fp_storage_full', 'fp_bad',
      'fp_pad_no_num', 'fp_pad_no_xy', 'fp_pad_no_size'];
    return known.includes(code)
      ? T('pj_fp_e_' + code, { max: LIB().MAX_COUNT, kb: Math.round(LIB().MAX_BYTES / 1024) })
      : T('pj_fp_e_fp_failed', { err: code });
  }

  // FpInst 要能把板上的元件對回自製封裝，但 FpLib 是 async 的、雲端清單刻意不帶 data。
  // 所以這裡維護一份「手上已經有完整幾何的自製封裝」快取；沒進快取的，
  // FpInst 會回 unknown（不知道）而不是 missing（庫裡沒有）。
  function cacheFp(fp) {
    if (!fp || !fp.name || !(fp.pads || []).length) return;
    const c = (window.__fpUserCache = window.__fpUserCache || []);
    const i = c.findIndex(f => String(f.name) === String(fp.name));
    if (i >= 0) c[i] = fp; else c.push(fp);
  }

  async function renderLib() {
    const box = el('fpLib');
    if (!box || !LIB()) return;
    try { libRows = await LIB().list(); } catch (e) { box.textContent = libErr(e); return; }
    // 未登入時 list() 的每一列都帶完整 data，順手全部進快取
    for (const r of libRows) if (r && r.data) cacheFp(r.data);
    if (!libRows.length) { box.innerHTML = '<div style="color:var(--muted)">' + esc(T('pj_fp_lib_empty')) + '</div>'; return; }
    const where = libRows[0].local ? T('pj_fp_lib_local') : T('pj_fp_lib_cloud');
    box.innerHTML = '<div style="color:var(--muted);font-size:11px">' + esc(where) + '</div>' +
      libRows.map((f, i) =>
        '<div class="fp-row" data-i="' + i + '" style="display:flex;gap:6px;align-items:center;padding:3px 0">' +
        '<span style="flex:1">' + esc(f.name) + '（' + (f.pads || 0) + '）</span>' +
        '<button class="small-button" data-act="load">' + esc(T('pj_fp_load')) + '</button>' +
        '<button class="small-button" data-act="del">' + esc(T('pj_dz_del')) + '</button>' +
        '</div>').join('');
  }

  async function saveCurrent() {
    if (!current || !LIB()) return;
    try {
      const r = await LIB().save(current);
      await renderLib();
      window.pcbApp?.toast(T(r.local ? 'pj_fp_saved_local' : 'pj_fp_saved', { name: r.name }), 'info');
    } catch (e) { window.pcbApp?.toast(libErr(e), 'error'); }
  }

  function placeOnBoard() {
    const app = window.pcbApp;
    if (!app || !current) return;
    const ref = window.prompt(T('pj_fp_ask_ref'), 'U' + ((app.state.components || []).length + 1));
    if (ref === null) return;
    const c = FE().toComponent(current, String(ref).trim() || 'U1',
      app.state.boardWidth / 2, app.state.boardHeight / 2);
    // 綁回自製封裝庫：庫裡那顆之後改了，板上這顆才知道自己過期
    cacheFp(current);
    if (window.FpInst) window.FpInst.stamp(c, { src: 'user', name: current.name }, c.pads);
    app.hist();
    app.state.components.push(c);
    app.state.selected = c;
    app.render();
    app.renderPartsList && app.renderPartsList();
    app.syncSelPanel && app.syncSelPanel();
    app.toast(T('pj_fp_placed', { ref: c.ref, name: current.name }), 'info');
  }

  // 從板子上選取的元件反向建封裝——遇到「庫裡沒有但板上有」時最有用
  function fromSelection() {
    const app = window.pcbApp;
    const c = app && app.state.selected;
    if (!c || !(c.pads || []).length) { app?.toast(T('pj_fp_no_sel'), 'warn'); return; }
    current = FE().fromComponent(c, c.part || c.ref);
    const nameEl = el('fpName');
    if (nameEl) nameEl.value = current.name;
    const prev = el('fpPreview');
    if (prev) prev.innerHTML = svg(current);
    const out = el('fpOut');
    if (out) out.innerHTML = '<div>' + esc(T('pj_fp_from_sel', { ref: c.ref, n: current.pads.length })) + '</div>';
    const place = el('fpPlace'), save = el('fpSave');
    if (place) place.disabled = false;
    if (save) save.disabled = false;
  }

  function boot() {
    if (!el('fpKind') || !FE()) return;
    ['fpKind', 'fpName', 'fpPins', 'fpPitch', 'fpSpan', 'fpPadW', 'fpPadH', 'fpRows', 'fpCols', 'fpTht', 'fpDrill']
      .forEach(id => el(id)?.addEventListener('input', refresh));
    el('fpKind')?.addEventListener('change', refresh);
    el('fpSave')?.addEventListener('click', saveCurrent);
    el('fpPlace')?.addEventListener('click', placeOnBoard);
    el('fpFromSel')?.addEventListener('click', fromSelection);
    el('fpLib')?.addEventListener('click', async ev => {
      const btn = ev.target.closest('button[data-act]');
      if (!btn || !LIB()) return;
      const row = libRows[+btn.closest('.fp-row').dataset.i];
      if (!row) return;
      const ref = row.id || row.name;
      try {
        if (btn.dataset.act === 'del') {
          if (!window.confirm(T('pj_fp_ask_del', { name: row.name }))) return;
          await LIB().remove(ref);
          await renderLib();
        } else {
          const fp = await LIB().load(ref);
          if (!fp) { window.pcbApp?.toast(libErr('fp_failed'), 'error'); return; }
          current = fp;
          cacheFp(fp);
          const prev = el('fpPreview');
          if (prev) prev.innerHTML = svg(current);
          const nameEl = el('fpName');
          if (nameEl) nameEl.value = current.name;
          const place = el('fpPlace'), save = el('fpSave');
          if (place) place.disabled = false;
          if (save) save.disabled = false;
        }
      } catch (e) { window.pcbApp?.toast(libErr(e), 'error'); }
    });
    const paint = () => { const h = el('fpHint'); if (h) h.textContent = T('pj_fp_hint'); };
    paint();
    document.addEventListener('vs-lang-change', () => { paint(); refresh(); renderLib(); });
    refresh();
    renderLib();

    // 登入之後把本機那份搬上雲端。不刪本機——上傳到一半斷線的話，
    // 那是使用者唯一的備份。
    if (window.Auth && window.Auth.onChange) {
      window.Auth.onChange(async user => {
        if (!user || !LIB()) { renderLib(); return; }
        try {
          const m = await LIB().migrate();
          if (m.uploaded) window.pcbApp?.toast(T('pj_fp_migrated', { n: m.uploaded, skip: m.skipped }), 'info');
        } catch (e) { /* 搬不上去就繼續用雲端那份，本機的還在 */ }
        renderLib();
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
