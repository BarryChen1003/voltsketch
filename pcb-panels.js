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
  let zTop = Z_BASE;
  const panels = new Map();      // key → { key, title, win, section, btn }

  const load = () => { try { return JSON.parse(localStorage.getItem(LS)) || {}; } catch (e) { return {}; } };
  const save = s => { try { localStorage.setItem(LS, JSON.stringify(s)); } catch (e) {} };
  function patch(key, obj) { const s = load(); s[key] = Object.assign({}, s[key], obj); save(s); }

  function injectCss() {
    if (document.getElementById('pcbPanelCss')) return;
    const css = `
    .pcb-float{position:fixed;z-index:${Z_BASE};width:300px;max-width:calc(100vw - 24px);
      background:#fff;border:1px solid var(--line);border-radius:10px;
      box-shadow:0 10px 30px rgba(15,23,42,.18);display:flex;flex-direction:column;overflow:hidden}
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
    .pcb-float-rs{position:absolute;right:2px;bottom:2px;width:14px;height:14px;cursor:nwse-resize;
      background:linear-gradient(135deg,transparent 50%,var(--line) 50%,var(--line) 70%,transparent 70%)}
    .pcb-menu-wrap{position:relative;display:inline-block}
    .pcb-menu-pop{position:absolute;top:calc(100% + 6px);left:0;z-index:${Z_BASE + 60};min-width:210px;
      background:#fff;border:1px solid var(--line);border-radius:10px;padding:6px;
      box-shadow:0 10px 30px rgba(15,23,42,.18);display:grid;gap:2px}
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
      const r = win.getBoundingClientRect(); ox = r.left; oy = r.top;
      head.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    head.addEventListener('pointermove', e => {
      if (!moving) return;
      const maxX = window.innerWidth - 60, maxY = window.innerHeight - 40;
      const x = Math.max(4, Math.min(maxX, ox + e.clientX - sx));
      const y = Math.max(4, Math.min(maxY, oy + e.clientY - sy));
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

    const grip = win.querySelector('.pcb-float-rs');
    let rz = false, rw = 0, rh = 0;
    grip.addEventListener('pointerdown', e => {
      rz = true; sx = e.clientX; sy = e.clientY;
      rw = win.offsetWidth; rh = win.querySelector('.pcb-float-body').offsetHeight;
      grip.setPointerCapture(e.pointerId); e.preventDefault(); e.stopPropagation();
    });
    grip.addEventListener('pointermove', e => {
      if (!rz) return;
      const w = Math.max(220, rw + e.clientX - sx);
      const h = Math.max(120, rh + e.clientY - sy);
      win.style.width = w + 'px';
      win.querySelector('.pcb-float-body').style.maxHeight = h + 'px';
    });
    const rend = e => {
      if (!rz) return; rz = false;
      try { grip.releasePointerCapture(e.pointerId); } catch (_) {}
      patch(key, { w: win.offsetWidth, h: win.querySelector('.pcb-float-body').offsetHeight });
    };
    grip.addEventListener('pointerup', rend);
    grip.addEventListener('pointercancel', rend);
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
        p.win.style.left = Math.max(8, r.right - 320) + 'px';
        p.win.style.top = Math.max(8, r.top + 12 + panels.size % 5 * 22) + 'px';
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
      const title = section.dataset.panelTitle || key;
      const win = document.createElement('div');
      win.className = 'pcb-float';
      win.id = 'float-' + key;
      win.hidden = true;
      win.innerHTML =
        '<div class="pcb-float-head"><span class="pcb-float-title"></span>' +
        '<button class="pcb-float-x" type="button" aria-label="關閉">✕</button></div>' +
        '<div class="pcb-float-body"></div><div class="pcb-float-rs"></div>';
      win.querySelector('.pcb-float-title').textContent = title;
      // 搬移原節點（保留所有既有事件與 id）
      win.querySelector('.pcb-float-body').appendChild(section);
      host.appendChild(win);

      const p = { key, title, win, section, btn: null };
      panels.set(key, p);
      makeDraggable(p);
      win.addEventListener('pointerdown', () => bringFront(win));
      win.querySelector('.pcb-float-x').addEventListener('click', () => setOpen(key, false));

      const s = st[key] || {};
      if (typeof s.x === 'number') { win.style.left = s.x + 'px'; win.style.top = (s.y || 80) + 'px'; }
      if (s.w) win.style.width = s.w + 'px';
      if (s.h) win.querySelector('.pcb-float-body').style.maxHeight = s.h + 'px';
    });

    buildMenu(st);
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
    btn.textContent = '▤ 面板';
    btn.title = '開關工具面板（可拖曳的浮動視窗）';
    const pop = document.createElement('div');
    pop.className = 'pcb-menu-pop';
    pop.hidden = true;

    panels.forEach(p => {
      const item = document.createElement('button');
      item.className = 'pcb-menu-item';
      item.type = 'button';
      item.innerHTML = '<span class="tick"></span><span></span>';
      item.lastChild.textContent = p.title;
      item.addEventListener('click', () => setOpen(p.key, p.win.hidden));
      pop.appendChild(item);
      p.btn = item;
    });
    const sep = document.createElement('div'); sep.className = 'pcb-menu-sep'; pop.appendChild(sep);
    const closeAll = document.createElement('button');
    closeAll.className = 'pcb-menu-item'; closeAll.type = 'button';
    closeAll.innerHTML = '<span class="tick"></span><span>全部關閉</span>';
    closeAll.addEventListener('click', () => panels.forEach(p => setOpen(p.key, false)));
    pop.appendChild(closeAll);

    btn.addEventListener('click', e => { e.stopPropagation(); pop.hidden = !pop.hidden; });
    document.addEventListener('click', e => { if (!wrap.contains(e.target)) pop.hidden = true; });

    wrap.appendChild(btn); wrap.appendChild(pop);
    // 放在狀態列右側那組按鈕的最前面
    const right = bar.lastElementChild;
    if (right && right !== bar.firstElementChild) right.insertBefore(wrap, right.firstChild);
    else bar.appendChild(wrap);

    // 還原上次開著的面板
    panels.forEach(p => { if ((st[p.key] || {}).open) setOpen(p.key, true, false); else setOpen(p.key, false, false); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
