/**
 * designs-ui.js — 「雲端專案」面板的共用 UI（線路圖頁與 PCB 頁共用同一支）
 *
 * 邏輯在 designs.js（純函式＋Supabase 呼叫，node 測得到）；這支只負責畫與接事件。
 *
 * 為什麼做成共用而不是兩頁各一份：
 *   兩頁的清單長得一樣、上限一樣、錯誤訊息一樣，唯一不同的是「存到哪個欄位」
 *   （線路圖存 sch、PCB 存 pcb）與「怎麼取當前資料／怎麼套回去」。
 *   複製一份的話，之後改上限或錯誤處理一定會有一邊忘記改。
 *
 * 各頁呼叫 DesignsUI.mount({ field, snapshot, restore, toast })：
 *   field    'sch' | 'pcb' —— 只寫這個欄位。另一半一定要保持原樣，
 *            送 null 會把同一列裡的另一份靜靜清掉。
 *   snapshot () => 物件或 null，目前畫面的資料
 *   restore  物件 => boolean，把資料套回畫面
 *   toast    (訊息, 種類) => void
 *
 * 目前專案指標由 designs.js 保管（localStorage 的 vs-design-id），兩頁共用同一個，
 * 所以在 PCB 頁開哪個專案，線路圖頁存的就是同一列。
 */
window.DesignsUI = (function () {
  'use strict';

  const T = (k, v) => (window.I18N ? window.I18N.t(k, v) : k);
  const D = () => window.Designs;
  const el = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  let cfg = null;
  let rows = [];
  let curId = null;
  let busy = false;

  const setCur = id => { curId = D() ? D().setCurrent(id) : (id || null); };
  const toast = (m, k) => { if (cfg && cfg.toast) cfg.toast(m, k); };
  const vars = () => ({ max: D().MAX_COUNT, mb: Math.round(D().MAX_BYTES / 1024 / 1024) });

  // designs.js 丟出來的是錯誤碼；四語訊息在 i18n。
  // 認不得的（網路錯、PostgREST 原文）包進 design_failed，至少使用者看得到原因。
  function errMsg(e) {
    const code = String((e && e.message) || e || '');
    const known = ['design_limit_reached', 'design_too_large', 'design_signin',
      'design_offline', 'design_denied', 'design_no_id'];
    return known.includes(code) ? T(code, vars()) : T('design_failed', { err: code });
  }

  function renderCur() {
    const box = el('dzCur');
    if (!box) return;
    const hit = rows.find(r => r.id === curId);
    box.textContent = hit ? T('pj_dz_cur', { name: hit.name }) : T('pj_dz_nocur');
  }

  function renderList() {
    const box = el('dzList');
    if (!box) return;
    if (!rows.length) {
      box.innerHTML = '<div style="color:var(--muted)">' + esc(T('pj_dz_empty')) + '</div>';
      renderCur();
      return;
    }
    box.innerHTML = rows.map(r => {
      const when = String(r.updated_at || '').slice(0, 16).replace('T', ' ');
      // 兩邊的內容都列出來，使用者才知道這個專案裡有沒有另一半
      const bits = [];
      if (r.hasSch) bits.push(T('pj_dz_rowsch2', { sc: r.meta.sc || 0 }));
      if (r.hasPcb) bits.push(T('pj_dz_row', { pc: r.meta.pc || 0, pt: r.meta.pt || 0 }));
      const mark = r.id === curId ? ' style="outline:1px solid var(--accent,#3498db);padding:6px;border-radius:6px;background:rgba(127,127,127,.08)"'
        : ' style="padding:6px;border-radius:6px;background:rgba(127,127,127,.08)"';
      return '<div class="dz-row"' + mark + ' data-id="' + esc(r.id) + '">' +
        '<div style="font-weight:600">' + esc(r.name) + '</div>' +
        '<div style="color:var(--muted);font-size:11px">' + esc(bits.join(' · ') || '—') + ' · ' + esc(when) + '</div>' +
        '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px">' +
        '<button class="small-button" data-act="open">' + esc(T('pj_dz_open')) + '</button>' +
        '<button class="small-button" data-act="rename">' + esc(T('pj_dz_rename')) + '</button>' +
        '<button class="small-button" data-act="del">' + esc(T('pj_dz_del')) + '</button>' +
        '</div></div>';
    }).join('');
    const c = el('dzCount');
    if (c) c.textContent = T('pj_dz_count', { n: rows.length, max: D().MAX_COUNT });
    renderCur();
  }

  async function refresh() {
    const box = el('dzList');
    if (!box || !D()) return;
    const signedIn = window.Auth && window.Auth.enabled() && await window.Auth.user();
    if (!signedIn) {
      rows = [];
      box.innerHTML = '<div style="color:var(--muted)">' + esc(T('pj_dz_signin')) + '</div>';
      const c = el('dzCount'); if (c) c.textContent = '';
      renderCur();
      return;
    }
    try { rows = await D().list(); } catch (e) { toast(errMsg(e), 'error'); return; }
    renderList();
  }

  const dataNow = () => (cfg && cfg.snapshot ? cfg.snapshot() : null);

  async function saveNew() {
    if (busy) return; busy = true;
    try {
      const data = dataNow();
      if (!data) { toast(T('design_failed', { err: 'no data' }), 'error'); return; }
      const name = window.prompt(T('pj_dz_ask_name'), (rows.find(r => r.id === curId) || {}).name || T('pj_dz_defname'));
      if (name === null) return;
      const made = await D().create(name, cfg.field === 'sch' ? data : undefined, cfg.field === 'pcb' ? data : undefined);
      setCur(made.id);
      await refresh();
      toast(T('pj_dz_created', { name: D().normName(name) }));
    } catch (e) { toast(errMsg(e), 'error'); }
    finally { busy = false; }
  }

  async function saveCur() {
    if (busy) return; busy = true;
    try {
      if (!curId) { toast(T('design_no_id'), 'warn'); return; }
      const data = dataNow();
      if (!data) { toast(T('design_failed', { err: 'no data' }), 'error'); return; }
      // 只送自己這一半。designs.save() 沒收到的欄位會沿用資料庫裡的舊值，
      // 所以線路圖頁存檔不會清掉板子，反之亦然。
      const patch = {}; patch[cfg.field] = data;
      await D().save(curId, patch);
      const kb = Math.round(D().byteLen(data) / 1024);
      await refresh();
      const hit = rows.find(r => r.id === curId);
      toast(T('pj_dz_saved', { name: hit ? hit.name : '', kb }));
    } catch (e) { toast(errMsg(e), 'error'); }
    finally { busy = false; }
  }

  async function openRow(id) {
    const hit = rows.find(r => r.id === id);
    if (!hit) return;
    // 蓋掉畫面上的東西會弄丟未存的工作，一律先問
    if (!window.confirm(T('pj_dz_ask_open', { name: hit.name }))) return;
    if (busy) return; busy = true;
    try {
      const full = await D().load(id);
      if (!full) { toast(errMsg('not found'), 'error'); return; }
      const data = full[cfg.field];
      if (!data) { toast(T(cfg.field === 'pcb' ? 'pj_dz_nopcb' : 'pj_dz_nosch', { name: hit.name }), 'warn'); setCur(id); renderList(); return; }
      if (!cfg.restore(data)) { toast(errMsg('restore failed'), 'error'); return; }
      setCur(id);
      renderList();
      toast(T('pj_dz_loaded', { name: hit.name }));
    } catch (e) { toast(errMsg(e), 'error'); }
    finally { busy = false; }
  }

  async function renameRow(id) {
    const hit = rows.find(r => r.id === id);
    if (!hit) return;
    const name = window.prompt(T('pj_dz_ask_name'), hit.name);
    if (name === null) return;
    try {
      await D().rename(id, name);
      await refresh();
      toast(T('pj_dz_renamed', { name: D().normName(name) }));
    } catch (e) { toast(errMsg(e), 'error'); }
  }

  async function delRow(id) {
    const hit = rows.find(r => r.id === id);
    if (!hit) return;
    if (!window.confirm(T('pj_dz_ask_del', { name: hit.name }))) return;
    try {
      await D().remove(id);
      if (curId === id) setCur(null);
      await refresh();
      toast(T('pj_dz_deleted', { name: hit.name }));
    } catch (e) { toast(errMsg(e), 'error'); }
  }

  function paintHint() {
    const h = el('dzHint');
    if (h) h.textContent = T('pj_dz_hint', vars());
  }

  function mount(config) {
    if (!el('dzList') || !D()) return false;      // 這一頁沒有面板就不做事
    cfg = config || {};
    cfg.field = cfg.field === 'sch' ? 'sch' : 'pcb';
    curId = D().currentId();

    el('dzNew')?.addEventListener('click', saveNew);
    el('dzSave')?.addEventListener('click', saveCur);
    el('dzRefresh')?.addEventListener('click', refresh);
    // 清單是動態產生的，用事件委派，重畫之後不必重新綁
    el('dzList').addEventListener('click', ev => {
      const btn = ev.target.closest('button[data-act]');
      if (!btn) return;
      const id = btn.closest('.dz-row')?.dataset.id;
      if (!id) return;
      if (btn.dataset.act === 'open') openRow(id);
      else if (btn.dataset.act === 'rename') renameRow(id);
      else if (btn.dataset.act === 'del') delRow(id);
    });

    paintHint();
    refresh();
    if (window.Auth && window.Auth.onChange) window.Auth.onChange(() => refresh());
    // 清單是動態產生的，I18N.apply() 只換得掉 data-i18n 屬性，換不掉這裡的文字。
    // i18n.js 的 setLang 會發 vs-lang-change，接住它自己重畫。
    document.addEventListener('vs-lang-change', () => { paintHint(); renderList(); });
    return true;
  }

  return { mount, refresh, currentId: () => curId };
})();
