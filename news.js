/**
 * news.js — 硬體新技術頁的渲染與篩選
 *
 * 資料在 news-data.js（window.NEWS）。每則四語，UI 字串走 I18N。
 * 篩選是「領域 × 地區 × 類型」三軸，值存英文代碼、只有標籤翻譯——與知識卡同一個原則：
 * 拿來比對的值不要翻，否則換語言就篩不到東西。
 *
 * 分頁：這頁是**累積的技術年表**，舊條目不刪。每頁 PER 則，最新的永遠在第 1 頁，
 * 舊的往後面的頁碼堆。換篩選條件時回到第 1 頁（不然會停在一個不存在的頁）。
 */
(function () {
  const T = (k, fb) => (window.I18N && I18N.dict && I18N.dict[k]) ? I18N.t(k) : (fb || k);
  const L = () => (window.I18N && I18N.lang) || 'zh';

  const CATS = [
    ['all', 'nw_cat_all'], ['power', 'nw_cat_power'], ['semi', 'nw_cat_semi'],
    ['pcb', 'nw_cat_pcb'], ['emc', 'nw_cat_emc'], ['circuit', 'nw_cat_circuit']
  ];
  const REGIONS = [
    ['all', 'nw_rg_all'], ['US', 'nw_rg_us'], ['TW', 'nw_rg_tw'],
    ['CN', 'nw_rg_cn'], ['KR', 'nw_rg_kr'], ['JP', 'nw_rg_jp']
  ];
  const KINDS = [['all', 'nw_kind_all'], ['news', 'nw_kind_news'], ['paper', 'nw_kind_paper']];
  const CAT_FB = { power: '電源管理', semi: '半導體', pcb: 'PCB / 封裝', emc: 'EMC', circuit: '電子電路' };
  const REGION_FB = { US: '美國', TW: '台灣', CN: '大陸', KR: '韓國', JP: '日本' };
  const KIND_FB = { news: '新聞', paper: '期刊 / 研討會' };

  const PER = 8;                              // 每頁則數
  let curCat = 'all', curRegion = 'all', curKind = 'all', page = 1;

  /** 冒號跟著語言走：中日文用全形，英韓用半形＋空格（標點規矩見 HANDOFF） */
  const sep = () => (L() === 'en' ? ': ' : L() === 'ko' ? ': ' : '：');

  const esc = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  /** 來源日期：資料是 'YYYY-MM-DD' 或 'YYYY-MM'（只知道月份的就不要編造日） */
  function fmtDate(d) {
    const p = String(d).split('-');
    if (p.length >= 3) return `${p[0]}-${p[1]}-${p[2]}`;
    return `${p[0]}-${p[1]}`;
  }

  function items() {
    const all = (window.NEWS || []).slice();
    // 日期新的在前。'YYYY-MM' 與 'YYYY-MM-DD' 混用時字串比較就夠：同月只知月份的排在有日的前面，
    // 這是刻意的——不知道是幾號就別假裝知道它比 08-03 早還晚。
    all.sort((a, b) => String(b.date).localeCompare(String(a.date)));
    return all.filter(n =>
      (curCat === 'all' || n.cat === curCat) &&
      (curRegion === 'all' || n.region === curRegion) &&
      (curKind === 'all' || (n.kind || 'news') === curKind));
  }

  function renderFilters() {
    const cw = document.querySelector('#newsCatFilter');
    const rw = document.querySelector('#newsRegionFilter');
    const kw = document.querySelector('#newsKindFilter');
    if (cw) cw.innerHTML = CATS.map(([v, k]) => btn(v, T(k, v === 'all' ? '全部' : CAT_FB[v]), v === curCat, 'cat')).join('');
    if (rw) rw.innerHTML = REGIONS.map(([v, k]) => btn(v, T(k, v === 'all' ? '全部' : REGION_FB[v]), v === curRegion, 'region')).join('');
    if (kw) kw.innerHTML = KINDS.map(([v, k]) => btn(v, T(k, v === 'all' ? '全部' : KIND_FB[v]), v === curKind, 'kind')).join('');
    document.querySelectorAll('.news-filter-btn').forEach(b => b.addEventListener('click', () => {
      const ax = b.dataset.axis;
      if (ax === 'cat') curCat = b.dataset.value;
      else if (ax === 'region') curRegion = b.dataset.value;
      else curKind = b.dataset.value;
      page = 1;                                  // 換條件一定回第 1 頁，否則會停在不存在的頁
      renderFilters(); renderList();
    }));
  }

  function btn(value, label, active, axis) {
    const on = active ? 'background:#1f4fd1;color:#fff;border-color:#1f4fd1;' : '';
    return `<button class="news-filter-btn" data-axis="${axis}" data-value="${esc(value)}"
      style="padding:4px 10px;border:1px solid #cbd5e1;border-radius:6px;background:#fff;font-size:12px;cursor:pointer;${on}">${esc(label)}</button>`;
  }

  function renderList() {
    const host = document.querySelector('#newsList');
    if (!host) return;
    const all = items();
    const pager = document.querySelector('#newsPager');
    if (!all.length) {
      host.innerHTML = `<p style="color:var(--muted);padding:24px 0">${esc(T('nw_empty', '這個條件下沒有項目'))}</p>`;
      if (pager) pager.innerHTML = '';
      return;
    }
    const pages = Math.max(1, Math.ceil(all.length / PER));
    if (page > pages) page = pages;
    const list = all.slice((page - 1) * PER, page * PER);
    const lang = L();
    host.innerHTML = list.map(n => {
      const c = n[lang] || n.zh || {};
      const catLabel = T('nw_cat_' + n.cat, CAT_FB[n.cat] || n.cat);
      const rgLabel = T('nw_rg_' + n.region.toLowerCase(), REGION_FB[n.region] || n.region);
      const kind = n.kind || 'news';
      const kindLabel = T('nw_kind_' + kind, KIND_FB[kind] || kind);
      const badge = n.verified
        ? `<span title="${esc(T('nw_verified_t', '已抓取原文並核對數字'))}" style="color:#16a34a;font-size:11px">✓ ${esc(T('nw_verified', '已核對原文'))}</span>`
        : `<span title="${esc(T('nw_unverified_t', '來自來源的列表頁或彙整文，數字未逐一核對'))}" style="color:#d97706;font-size:11px">△ ${esc(T('nw_unverified', '未逐條核對'))}</span>`;
      return `
      <article class="news-card" style="border:1px solid var(--line);border-radius:var(--radius);background:#fff;padding:16px;margin-bottom:12px">
        <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:12px;color:var(--muted);margin-bottom:6px">
          <span style="font-family:var(--mono)">${esc(fmtDate(n.date))}</span>
          <span style="padding:2px 8px;border-radius:999px;background:var(--accent-soft);color:var(--accent-strong)">${esc(catLabel)}</span>
          <span style="padding:2px 8px;border-radius:999px;border:1px solid var(--line)">${esc(rgLabel)}</span>
          <span style="padding:2px 8px;border-radius:999px;border:1px solid var(--line)">${esc(kindLabel)}</span>
          ${badge}
        </div>
        <h3 style="margin:0 0 8px;font-size:17px;color:var(--ink)">${esc(c.title || '')}</h3>
        <p style="margin:0 0 10px;line-height:1.7;color:var(--ink)">${esc(c.summary || '')}</p>
        <p style="margin:0 0 12px;line-height:1.7;color:var(--muted);border-left:3px solid var(--accent);padding-left:10px">
          <b>${esc(T('nw_why', '為什麼值得注意'))}${sep()}</b>${esc(c.why || '')}
        </p>
        <div style="font-size:12px;color:var(--muted)">
          ${esc(T('nw_source', '出處'))}：${esc(n.source)} ·
          <a href="${esc(n.url)}" target="_blank" rel="noopener noreferrer">${esc(T('nw_open', '看原文'))} ↗</a>
        </div>
      </article>`;
    }).join('');
    renderPager(pages, all.length);
  }

  /** 頁碼：頭尾一定顯示，中間只留目前頁前後各一頁，其餘用 … 收起來 */
  function pageWindow(cur, total) {
    const out = [];
    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || Math.abs(i - cur) <= 1) out.push(i);
      else if (out[out.length - 1] !== '…') out.push('…');
    }
    return out;
  }

  function renderPager(pages, count) {
    const host = document.querySelector('#newsPager');
    if (!host) return;
    if (pages <= 1) {
      host.innerHTML = '';
      return;
    }
    const nav = (label, target, disabled, active) => {
      const base = 'min-width:32px;padding:5px 9px;border:1px solid #cbd5e1;border-radius:6px;background:#fff;font-size:12px;';
      if (disabled) return `<span style="${base}color:#cbd5e1">${esc(label)}</span>`;
      if (target == null) return `<span style="${base}border:none;background:none;color:#94a3b8">${esc(label)}</span>`;
      const on = active ? 'background:#1f4fd1;color:#fff;border-color:#1f4fd1;' : 'cursor:pointer;';
      return `<button class="news-page-btn" data-page="${target}" style="${base}${on}">${esc(label)}</button>`;
    };
    const parts = [nav(T('nw_prev', '上一頁'), page - 1, page <= 1)];
    pageWindow(page, pages).forEach(p => parts.push(p === '…' ? nav('…', null) : nav(String(p), p, false, p === page)));
    parts.push(nav(T('nw_next', '下一頁'), page + 1, page >= pages));
    host.innerHTML =
      `<div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:center;margin:18px 0 4px">${parts.join('')}</div>` +
      `<p style="text-align:center;font-size:12px;color:var(--muted,#64748b);margin:0">` +
      `${esc(T('nw_page_of', '第 {p} / {t} 頁').replace('{p}', page).replace('{t}', pages))} · ` +
      `${esc(T('nw_total', '收錄'))} ${count} ${esc(T('nw_items', '則'))}</p>`;
    host.querySelectorAll('.news-page-btn').forEach(b => b.addEventListener('click', () => {
      page = +b.dataset.page;
      renderList();
      const top = document.querySelector('#newsList');
      if (top) top.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));
  }

  function updateMeta() {
    const el = document.querySelector('#newsCount');
    if (el) el.textContent = String((window.NEWS || []).length);
    const up = document.querySelector('#newsUpdated');
    if (up) {
      const latest = (window.NEWS || []).map(n => n.date).sort().pop() || '';
      up.textContent = fmtDate(latest);
    }
  }

  function init() {
    renderFilters(); renderList(); updateMeta();
    document.addEventListener('vs-lang-change', () => { renderFilters(); renderList(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
