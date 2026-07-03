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
      store = { cur: 0, pages: [{ name: '頁 1', data: grab() }] };
      save();
    } else {
      const i = Math.min(store.cur || 0, store.pages.length - 1);
      store.cur = i;
      put(store.pages[i].data);
    }
  }
  function save() { try { localStorage.setItem(LS, JSON.stringify(store)); } catch (e) { } }
  function saveCur() { if (store) { store.pages[store.cur].data = grab(); save(); } }

  function switchTo(i) {
    if (i === store.cur || !store.pages[i]) return;
    saveCur();
    store.cur = i;
    put(store.pages[i].data);
    save(); renderBar();
  }
  function addPage() {
    saveCur();
    store.pages.push({ name: '頁 ' + (store.pages.length + 1), data: { components: [], wires: [], componentIdCounter: 0 } });
    store.cur = store.pages.length - 1;
    put(store.pages[store.cur].data);
    save(); renderBar();
  }
  function delPage(i) {
    if (store.pages.length <= 1) return;
    if (!confirm('刪除「' + store.pages[i].name + '」？（此頁電路會消失）')) return;
    store.pages.splice(i, 1);
    if (store.cur >= store.pages.length) store.cur = store.pages.length - 1;
    else if (i <= store.cur && store.cur > 0) store.cur--;
    put(store.pages[store.cur].data);
    save(); renderBar();
  }
  function rename(i) {
    const n = prompt('頁名稱：', store.pages[i].name);
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
      `<button id="sheetAdd" style="padding:3px 10px;border:1px dashed #94a3b8;border-radius:6px;background:none;cursor:pointer;color:#475569">＋ 新頁</button>
       <span style="color:#94a3b8;margin-left:6px">雙擊頁籤改名；每頁獨立自動存檔</span>`;
    bar.querySelectorAll('[data-i]').forEach(el => {
      const i = +el.dataset.i;
      el.addEventListener('click', e => { if (e.target.classList.contains('sheet-x')) delPage(i); else switchTo(i); });
      el.addEventListener('dblclick', () => rename(i));
    });
    bar.querySelector('#sheetAdd').addEventListener('click', addPage);
  }

  function boot() {
    if (typeof app === 'undefined' || !document.querySelector('.topbar') || !app.state) { setTimeout(boot, 300); return; }
    load(); renderBar();
    setInterval(saveCur, 4000);
    window.addEventListener('beforeunload', saveCur);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 100)); else setTimeout(boot, 100);
})();
