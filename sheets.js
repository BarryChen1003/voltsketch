/**
 * sheets.js — 線路圖多頁（頁籤）
 * 使用者需求：線路圖分頁內可「新增頁面」畫不同部分（如整個產品各區塊電路）。
 * 作法（不動 app.js 核心）：
 *   - 頁資料 = {components, wires, componentIdCounter}（與 app 自動存檔 voltsketch-project 同形狀）
 *   - 切頁 = 存目前頁 → 換入目標頁 → app.render() + app.persist()（app 的自動存檔永遠鏡射目前頁）
 *   - 儲存 localStorage 'vs-sheets-v1'；每 4 秒自動存 + 離頁前存
 * UI：topbar 下方細頁籤條：頁籤（點=切換、雙擊=改名、✕=刪）＋「＋新頁」。
 */
(function () {
  'use strict';
  const LS = 'vs-sheets-v1';
  let store = null;
  // 硬規矩 6：畫面上的字一律四語。I18N 還沒載入就退回 key（不要讓頁籤列爆掉）。
  const T = (k, v) => (window.I18N ? window.I18N.t(k, v) : k);

  const deep = o => JSON.parse(JSON.stringify(o));
  const grab = () => deep({
    components: app.state.components,
    wires: app.state.wires,
    componentIdCounter: app.state.componentIdCounter
  });
  const put = d => {
    app.state.components = deep(d.components || []);
    app.state.wires = deep(d.wires || []);
    app.state.componentIdCounter = d.componentIdCounter || 0;
    try { app.setSelection([]); } catch (e) { }
    app.render();
    try { app.persist(); } catch (e) { }
  };

  function load() {
    try { store = JSON.parse(localStorage.getItem(LS)); } catch (e) { store = null; }
    if (!store || !store.pages || !store.pages.length) {
      // 首次：把目前畫布（app 已載 voltsketch-project）收編為「頁 1」
      store = { cur: 0, pages: [{ name: T('sh_page', { n: 1 }), data: grab() }] };
      save();
    } else {
      const i = Math.min(store.cur || 0, store.pages.length - 1);
      store.cur = i;
      put(store.pages[i].data);
    }
  }
  function save() { try { localStorage.setItem(LS, JSON.stringify(store)); } catch (e) { } }
  function saveCur() { if (store) { store.pages[store.cur].data = grab(); save(); } }

  function switchTo(i, keepNav) {
    // 使用者自己點分頁列＝離開了原本那條階層路徑。不清的話「上一層」會亂跳，
    // 而且麵包屑顯示的層級跟實際看到的圖對不起來。
    if (!keepNav) navStack = [];
    setTimeout(renderPath, 0);
    if (i === store.cur || !store.pages[i]) return;
    saveCur();
    store.cur = i;
    put(store.pages[i].data);
    save(); renderBar();
  }
  function addPage() {
    saveCur();
    store.pages.push({ name: T('sh_page', { n: store.pages.length + 1 }), data: { components: [], wires: [], componentIdCounter: 0 } });
    store.cur = store.pages.length - 1;
    put(store.pages[store.cur].data);
    save(); renderBar();
  }
  function delPage(i) {
    if (store.pages.length <= 1) return;
    if (!confirm(T('sh_del', { name: store.pages[i].name }))) return;
    store.pages.splice(i, 1);
    if (store.cur >= store.pages.length) store.cur = store.pages.length - 1;
    else if (i <= store.cur && store.cur > 0) store.cur--;
    put(store.pages[store.cur].data);
    save(); renderBar();
  }
  function rename(i) {
    const n = prompt(T('sh_rename'), store.pages[i].name);
    if (n && n.trim()) { store.pages[i].name = n.trim(); save(); renderBar(); }
  }

  function renderBar() {
    let bar = document.getElementById('sheetBar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'sheetBar';
      bar.style.cssText = 'display:flex;gap:4px;align-items:center;padding:4px 12px;background:#eef2f7;border-bottom:1px solid #e2e8f0;font-size:12px;flex-wrap:wrap';
      const top = document.querySelector('.topbar');
      top.parentElement.insertBefore(bar, top.nextSibling);
    }
    bar.innerHTML = store.pages.map((p, i) =>
      `<span data-i="${i}" style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:6px;cursor:pointer;${i === store.cur ? 'background:#1d2943;color:#fff' : 'background:#fff;border:1px solid #cbd5e1;color:#334155'}">
        <span class="sheet-name">${p.name.replace(/[<>&]/g, '')}</span>
        ${store.pages.length > 1 ? `<b class="sheet-x" style="cursor:pointer;opacity:.6">✕</b>` : ''}</span>`).join('') +
      `<button id="sheetAdd" style="padding:3px 10px;border:1px dashed #94a3b8;border-radius:6px;background:none;cursor:pointer;color:#475569">${T('sh_add')}</button>
       <span style="color:#94a3b8;margin-left:6px">${T('sh_hint')}</span>`;
    bar.querySelectorAll('[data-i]').forEach(el => {
      const i = +el.dataset.i;
      el.addEventListener('click', e => { if (e.target.classList.contains('sheet-x')) delPage(i); else switchTo(i); });
      el.addEventListener('dblclick', () => rename(i));
    });
    bar.querySelector('#sheetAdd').addEventListener('click', addPage);
    // 麵包屑就掛在分頁列尾巴：使用者的眼睛本來就在這一排找「我在哪一頁」
    const crumb = document.createElement('span');
    crumb.id = 'hierPath';
    crumb.style.cssText = 'display:none;align-items:center;gap:8px;margin-left:auto;color:#475569';
    bar.appendChild(crumb);
  }

  // ---- 階層導覽 ----
  // 進子圖以前要自己去分頁列找那一頁，多層之後根本記不住現在在哪一層。
  // 路徑本身的邏輯在 SchHier（純函式、測得到），這裡只管切頁與畫麵包屑。
  let navStack = [];

  function curEntry() {
    const i = store ? store.cur : 0;
    return { page: i, name: (store && store.pages[i] && store.pages[i].name) || '', label: '' };
  }

  function renderPath() {
    const box = document.getElementById('hierPath');
    if (!box) return;
    const H = window.SchHier;
    if (!H || navStack.length < 2) { box.style.display = 'none'; box.innerHTML = ''; return; }
    box.style.display = '';
    const names = H.navPath(navStack);
    const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    box.innerHTML = '<button type="button" id="hierUp" class="sheet-btn" title="' + esc(T('sh_up_d')) + '">⬆ ' + esc(T('sh_up')) + '</button>' +
      '<span class="hier-crumbs">' + names.map(esc).join(' ▸ ') + '</span>';
    document.getElementById('hierUp')?.addEventListener('click', up);
  }

  /** 從母圖的 sheetref 進到子圖。找不到那一頁要講出來，不可以靜靜跳到第 0 頁。 */
  function enterSheet(comp) {
    const H = window.SchHier;
    if (!H || !store || !comp) return false;
    const idx = H.pageByName(store.pages, comp.sheet);
    if (idx < 0) {
      if (window.app && app.toast) app.toast(T('sh_no_sheet', { name: comp.sheet || '?' }), 'warn');
      return false;
    }
    if (!navStack.length) navStack = [curEntry()];
    navStack = H.navPush(navStack, { page: idx, name: store.pages[idx].name, label: comp.label || comp.sheet });
    switchTo(idx, true);
    return true;
  }

  function up() {
    const H = window.SchHier;
    if (!H || navStack.length < 2) return false;
    const r = H.navUp(navStack);
    navStack = r.stack;
    if (typeof r.page === 'number') switchTo(r.page, true);
    return true;
  }

  function boot() {
    if (typeof app === 'undefined' || !document.querySelector('.topbar') || !app.state) { setTimeout(boot, 300); return; }
    load(); renderBar(); renderPath();
    // load() 已用存檔頁覆寫 state.components；此時才處理 ?addIC=，
    // 讓從 IC 元件庫「+ 放到線路圖」帶來的 IC 疊在目前頁上（否則會被 load() 洗掉）。
    try { if (typeof app.handleAddICParam === 'function') app.handleAddICParam(); } catch (e) { }
    setInterval(saveCur, 4000);
    window.addEventListener('beforeunload', saveCur);
  }
  // 畫布那邊要叫得到（原本整支是私有 IIFE）
  window.Sheets = {
    enterSheet: enterSheet, up: up, switchTo: switchTo,
    pages: () => (store ? store.pages.map(p => ({ name: p.name })) : []),
    current: () => (store ? store.cur : 0),
    navStack: () => navStack.slice()
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 100)); else setTimeout(boot, 100);
})();
