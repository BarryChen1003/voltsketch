/**
 * pcb-panels.js — PCB 面板停靠系統
 *
 * 目的：左右側欄原本塞了十幾個 section，滿版又雜亂。把「設定完就收起來」的面板
 * 從側欄搬進可拖曳的浮動視窗，由上方「▤ 面板」選單開關；常用的（工具、線寬/層、
 * 板框、圖層、料件、選取、DRC、屬性）留在側欄常駐。
 *
 * 關鍵：**搬移既有 DOM 節點**（appendChild），不重建 HTML。
 * 所以 pcb.js / pcb-constraints.js / pcb-stackup.js 等既有的 id 查詢與事件監聽
 * 全部原樣存活，不需要改動它們。
 *
 * 標記方式：pcb.html 的 <section class="panel-section" data-panel="key" data-panel-title="標題">
 * 狀態（開關、位置、尺寸）存 localStorage（vs-pcb-panels）。
 */
(function () {
  const LS = 'vs-pcb-panels';
  const Z_BASE = 40;
  // 硬規矩 6：畫面上的字一律四語。I18N 沒載入就退回 key。
  const T = (k, v) => (window.I18N ? window.I18N.t(k, v) : k);
  // 這些面板太常用，除了選單再給工具列一顆直達鈕（否則使用者找不到）
  // [key, 標題 i18n key, 說明 i18n key]
  const QUICK = [['colors', 'pp_colors', 'pp_colors_d']];
  let zTop = Z_BASE;
  const panels = new Map();      // key → { key, title, win, section, btn }

  const load = () => { try { return JSON.parse(localStorage.getItem(LS)) || {}; } catch (e) { return {}; } };
  const save = s => { try { localStorage.setItem(LS, JSON.stringify(s)); } catch (e) {} };
  function patch(key, obj) { const s = load(); s[key] = Object.assign({}, s[key], obj); save(s); }

  function injectCss() {
    if (document.getElementById('pcbPanelCss')) return;
    const css = `
    .pcb-float{position:absolute;z-index:${Z_BASE};width:300px;max-width:calc(100vw - 24px);
      background:#fff;border:1px solid var(--line);border-radius:10px;
      box-shadow:0 10px 30px rgba(15,23,42,.18);display:flex;flex-direction:column}
    .pcb-float[hidden]{display:none}
    .pcb-float-head{display:flex;align-items:center;gap:8px;padding:7px 10px;cursor:move;
      background:var(--panel-soft);border-bottom:1px solid var(--line);user-select:none;touch-action:none}
    .pcb-float-title{font-size:12.5px;font-weight:600;color:var(--ink);flex:1;white-space:nowrap;
      overflow:hidden;text-overflow:ellipsis}
    .pcb-float-x{border:none;background:none;cursor:pointer;font-size:14px;line-height:1;
      color:var(--muted);padding:2px 4px;border-radius:4px}
    .pcb-float-x:hover{background:#e2e8f0;color:var(--ink)}
    .pcb-float-body{padding:10px 12px;overflow:auto;max-height:min(62vh,560px)}
    .pcb-float-body .panel-section{border:none;background:none;padding:0;margin:0;box-shadow:none}
    .pcb-float-body .panel-section > h2{margin-top:0}
    .pcb-float-rs{position:absolute;right:2px;bottom:2px;width:14px;height:14px;cursor:nwse-resize;pointer-events:none;
      background:linear-gradient(135deg,transparent 50%,var(--line) 50%,var(--line) 70%,transparent 70%)}
    /* 四邊與四角的抓取區。邊 7px、角 14px：太細抓不到，太粗會擋到內容的捲軸。
       touch-action:none 是必要的——不設的話觸控／手寫筆會被瀏覽器當成捲動。 */
    .pcb-rs{position:absolute;z-index:3;touch-action:none}
    .pcb-rs-n{top:-3px;left:10px;right:10px;height:7px;cursor:ns-resize}
    .pcb-rs-s{bottom:-3px;left:10px;right:10px;height:7px;cursor:ns-resize}
    .pcb-rs-w{left:-3px;top:10px;bottom:10px;width:7px;cursor:ew-resize}
    .pcb-rs-e{right:-3px;top:10px;bottom:10px;width:7px;cursor:ew-resize}
    .pcb-rs-nw{left:-3px;top:-3px;width:14px;height:14px;cursor:nwse-resize}
    .pcb-rs-ne{right:-3px;top:-3px;width:14px;height:14px;cursor:nesw-resize}
    .pcb-rs-sw{left:-3px;bottom:-3px;width:14px;height:14px;cursor:nesw-resize}
    .pcb-rs-se{right:-3px;bottom:-3px;width:16px;height:16px;cursor:nwse-resize}
    .pcb-menu-wrap{position:relative;display:inline-block}
    .pcb-menu-pop{position:absolute;top:calc(100% + 6px);left:0;z-index:${Z_BASE + 60};min-width:210px;
      background:#fff;border:1px solid var(--line);border-radius:10px;padding:6px;
      box-shadow:0 10px 30px rgba(15,23,42,.18);display:grid;gap:2px;
      /* 項目有十幾個，沒有高度上限就直接超出畫面底部，下面幾項永遠選不到。
         overscroll-behavior:contain 是避免捲到底之後把整頁一起帶著捲。 */
      max-height:min(70vh,560px);overflow-y:auto;overscroll-behavior:contain}
    .pcb-menu-pop[hidden]{display:none}
    .pcb-menu-item{display:flex;align-items:center;gap:8px;padding:6px 8px;border:none;background:none;
      border-radius:6px;cursor:pointer;font-size:12.5px;color:var(--ink);text-align:left;width:100%}
    .pcb-menu-item:hover{background:var(--accent-soft)}
    .pcb-menu-item .tick{width:14px;color:var(--accent-strong);font-weight:700}
    .pcb-menu-sep{height:1px;background:var(--line);margin:4px 2px}
    `;
    const el = document.createElement('style');
    el.id = 'pcbPanelCss'; el.textContent = css;
    document.head.appendChild(el);
  }

  function bringFront(win) { zTop += 1; win.style.zIndex = zTop; }

  // 以 head 拖曳整個視窗；右下角把手改尺寸。位置/尺寸即時落盤。
  function makeDraggable(p) {
    const { win, key } = p;
    const head = win.querySelector('.pcb-float-head');
    let sx = 0, sy = 0, ox = 0, oy = 0, moving = false;
    head.addEventListener('pointerdown', e => {
      if (e.target.closest('.pcb-float-x')) return;
      moving = true; bringFront(win);
      sx = e.clientX; sy = e.clientY;
      // 視窗是 position:absolute（文件座標），所以要把捲動量加回去
      const r = win.getBoundingClientRect();
      ox = r.left + window.scrollX; oy = r.top + window.scrollY;
      head.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    head.addEventListener('pointermove', e => {
      if (!moving) return;
      const maxX = Math.max(4, document.documentElement.scrollWidth - 60);
      const x = Math.max(4, Math.min(maxX, ox + e.clientX - sx));
      const y = Math.max(4, oy + e.clientY - sy);   // 可往下拖進留白停放區
      win.style.left = x + 'px'; win.style.top = y + 'px'; win.style.right = 'auto';
    });
    const end = e => {
      if (!moving) return;
      moving = false;
      try { head.releasePointerCapture(e.pointerId); } catch (_) {}
      patch(key, { x: parseInt(win.style.left, 10), y: parseInt(win.style.top, 10) });
    };
    head.addEventListener('pointerup', end);
    head.addEventListener('pointercancel', end);

    // ---- 縮放：四邊 + 四角 ----
    // 高度控制的是 body 的 max-height（不是視窗高）：標題列固定高度，
    // 只有內容區伸縮，往上拉時標題才不會被壓扁。
    const body = win.querySelector('.pcb-float-body');
    const MIN_W = 220, MIN_H = 100;
    let rz = null, rw = 0, rh = 0, rx = 0, ry = 0;
    win.querySelectorAll('.pcb-rs').forEach(h => {
      h.addEventListener('pointerdown', e => {
        rz = h.getAttribute('data-dir');
        sx = e.clientX; sy = e.clientY;
        rw = win.offsetWidth; rh = body.offsetHeight;
        const r = win.getBoundingClientRect();
        rx = r.left + window.scrollX; ry = r.top + window.scrollY;
        bringFront(win);
        h.setPointerCapture(e.pointerId); e.preventDefault(); e.stopPropagation();
      });
      h.addEventListener('pointermove', e => {
        if (!rz) return;
        const dx = e.clientX - sx, dy = e.clientY - sy;
        let w = rw, hh = rh, x = rx, y = ry;
        if (rz.indexOf('e') >= 0) w = rw + dx;
        if (rz.indexOf('w') >= 0) w = rw - dx;
        if (rz.indexOf('s') >= 0) hh = rh + dy;
        if (rz.indexOf('n') >= 0) hh = rh - dy;
        // 先夾到下限再回推位置：夾完才算位移，往左／往上拉到底時視窗才不會繼續飄走
        w = Math.max(MIN_W, Math.min(w, document.documentElement.clientWidth - 16));
        hh = Math.max(MIN_H, hh);
        if (rz.indexOf('w') >= 0) x = rx + (rw - w);
        if (rz.indexOf('n') >= 0) y = ry + (rh - hh);
        win.style.width = w + 'px';
        // 只設 max-height 的話，內容比拉出來的高度矮時完全沒反應（上限不是高度）。
        // 設實際 height 並解掉預設上限，拉多大就是多大。
        body.style.height = hh + 'px';
        body.style.maxHeight = 'none';
        if (rz.indexOf('w') >= 0) { win.style.left = Math.max(4, x) + 'px'; win.style.right = 'auto'; }
        if (rz.indexOf('n') >= 0) win.style.top = Math.max(4, y) + 'px';
      });
      const rend = e => {
        if (!rz) return; rz = null;
        try { h.releasePointerCapture(e.pointerId); } catch (_) {}
        const st2 = { w: win.offsetWidth, h: body.offsetHeight };
        const lx = parseInt(win.style.left, 10), ly = parseInt(win.style.top, 10);
        if (isFinite(lx)) st2.x = lx;
        if (isFinite(ly)) st2.y = ly;
        patch(key, st2);
      };
      h.addEventListener('pointerup', rend);
      h.addEventListener('pointercancel', rend);
    });
  }

  function setOpen(key, open, remember) {
    const p = panels.get(key); if (!p) return;
    p.win.hidden = !open;
    if (open) {
      bringFront(p.win);
      // 首次開啟：擺在畫布右上，避免疊在側欄上
      if (!p.win.style.left) {
        const c = document.querySelector('.pcb-canvas-container');
        const r = c ? c.getBoundingClientRect() : { right: window.innerWidth - 300, top: 90 };
        const open = [...panels.values()].filter(q => !q.win.hidden).length;
        p.win.style.left = Math.max(8, r.right - 320 + window.scrollX) + 'px';
        p.win.style.top = Math.max(8, r.top + window.scrollY + 12 + (open % 5) * 26) + 'px';
      }
    }
    if (p.btn) p.btn.querySelector('.tick').textContent = open ? '✓' : '';
    if (remember !== false) patch(key, { open: !!open });
  }

  function build() {
    injectCss();
    const host = document.createElement('div');
    host.id = 'pcbFloatHost';
    document.body.appendChild(host);

    const st = load();
    document.querySelectorAll('.panel-section[data-panel]').forEach(section => {
      const key = section.dataset.panel;
      // 面板標題的 i18n key 寫在 data-panel-data-i18n-title（→ dataset.panelDataI18nTitle），
      // 舊程式讀的卻是 dataset.panelTitle，從來沒有人設，所以一律 fallback 到
      // 原始 key——選單上四種語言都只看得到 rules / stackup / emi 這種字。
      const titleKey = section.dataset.panelDataI18nTitle || null;
      const rawTitle = section.dataset.panelTitle || section.getAttribute('title') || key;
      const title = titleKey ? T(titleKey) : rawTitle;
      const win = document.createElement('div');
      win.className = 'pcb-float';
      win.id = 'float-' + key;
      win.hidden = true;
      win.innerHTML =
        '<div class="pcb-float-head"><span class="pcb-float-title"></span>' +
        '<button class="pcb-float-x" type="button" aria-label="' + T('pp_close') + '">✕</button></div>' +
        '<div class="pcb-float-body"></div>' +
        ['n', 's', 'w', 'e', 'nw', 'ne', 'sw', 'se']
          .map(d => '<div class="pcb-rs pcb-rs-' + d + '" data-dir="' + d + '"></div>').join('') +
        '<div class="pcb-float-rs"></div>';
      win.querySelector('.pcb-float-title').textContent = title;
      win.querySelector('.pcb-float-title').dataset.titleKey = titleKey || '';
      // 搬移原節點（保留所有既有事件與 id）
      win.querySelector('.pcb-float-body').appendChild(section);
      host.appendChild(win);

      const p = { key, title, titleKey, rawTitle, win, section, btn: null };
      panels.set(key, p);
      makeDraggable(p);
      win.addEventListener('pointerdown', () => bringFront(win));
      win.querySelector('.pcb-float-x').addEventListener('click', () => setOpen(key, false));

      const s = st[key] || {};
      if (typeof s.x === 'number') { win.style.left = s.x + 'px'; win.style.top = (s.y || 80) + 'px'; }
      if (s.w) win.style.width = s.w + 'px';
      if (s.h) {
        const b0 = win.querySelector('.pcb-float-body');
        b0.style.height = s.h + 'px';
        b0.style.maxHeight = 'none';
      }
    });

    buildMenu(st);
    document.addEventListener('vs-lang-change', relabelPanels);
  }

  const titleOf = p => (p.titleKey ? T(p.titleKey) : (p.rawTitle || p.key));

  // 切語言時重貼標籤：這些字是 JS 產的，data-i18n 那套掃不到。
  function relabelPanels() {
    panels.forEach(p => {
      const t = titleOf(p);
      p.title = t;
      const el = p.win.querySelector('.pcb-float-title');
      if (el) el.textContent = t;
      if (p.btn && p.btn.lastChild) p.btn.lastChild.textContent = t;
    });
    const mb = document.getElementById('pcbPanelMenuBtn');
    if (mb) { mb.textContent = T('pp_panels'); mb.title = T('pp_panels_d'); }
  }

  function buildMenu(st) {
    const bar = document.querySelector('.pcb-toolbar');
    if (!bar || !panels.size) return;
    const wrap = document.createElement('div');
    wrap.className = 'pcb-menu-wrap';
    const btn = document.createElement('button');
    btn.className = 'small-button';
    btn.type = 'button';
    btn.id = 'pcbPanelMenuBtn';
    btn.textContent = T('pp_panels');
    btn.title = T('pp_panels_d');
    const pop = document.createElement('div');
    pop.className = 'pcb-menu-pop';
    pop.hidden = true;

    panels.forEach(p => {
      const item = document.createElement('button');
      item.className = 'pcb-menu-item';
      item.type = 'button';
      item.innerHTML = '<span class="tick"></span><span></span>';
      item.lastChild.textContent = titleOf(p);
      item.addEventListener('click', () => setOpen(p.key, p.win.hidden));
      pop.appendChild(item);
      p.btn = item;
    });
    const sep = document.createElement('div'); sep.className = 'pcb-menu-sep'; pop.appendChild(sep);
    const closeAll = document.createElement('button');
    closeAll.className = 'pcb-menu-item'; closeAll.type = 'button';
    closeAll.innerHTML = '<span class="tick"></span><span></span>';
    closeAll.lastChild.textContent = T('pp_closeall');
    closeAll.addEventListener('click', () => panels.forEach(p => setOpen(p.key, false)));
    pop.appendChild(closeAll);

    btn.addEventListener('click', e => { e.stopPropagation(); pop.hidden = !pop.hidden; });
    document.addEventListener('click', e => { if (!wrap.contains(e.target)) pop.hidden = true; });

    wrap.appendChild(btn); wrap.appendChild(pop);
    // 放在狀態列右側那組按鈕的最前面
    const right = bar.lastElementChild;
    if (right && right !== bar.firstElementChild) right.insertBefore(wrap, right.firstChild);
    else bar.appendChild(wrap);

    // 常用面板另外給工具列直達按鈕（埋在選單裡等於看不到）
    QUICK.forEach(([key, labelKey, titleKey]) => {
      const p = panels.get(key);
      if (!p) return;
      const q = document.createElement('button');
      q.className = 'small-button';
      q.type = 'button';
      q.id = 'pcbQuick-' + key;
      q.textContent = T(labelKey);
      q.title = titleKey ? T(titleKey) : T(labelKey);
      q.addEventListener('click', () => setOpen(key, p.win.hidden));
      if (right && right !== bar.firstElementChild) right.insertBefore(q, wrap);
      else bar.appendChild(q);
    });

    // 還原上次開著的面板
    panels.forEach(p => { if ((st[p.key] || {}).open) setOpen(p.key, true, false); else setOpen(p.key, false, false); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
