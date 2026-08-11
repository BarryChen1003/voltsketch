/**
 * news.js — 硬體新技術頁的渲染與篩選
 *
 * 資料在 news-data.js（window.NEWS）。每則四語，UI 字串走 I18N。
 * 篩選是「領域 × 地區」兩軸，值存英文代碼、只有標籤翻譯——與知識卡同一個原則：
 * 拿來比對的值不要翻，否則換語言就篩不到東西。
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
  const CAT_FB = { power: '電源管理', semi: '半導體', pcb: 'PCB / 封裝', emc: 'EMC', circuit: '電子電路' };
  const REGION_FB = { US: '美國', TW: '台灣', CN: '大陸', KR: '韓國', JP: '日本' };

  let curCat = 'all', curRegion = 'all';

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
    all.sort((a, b) => String(b.date).localeCompare(String(a.date)));
    return all.filter(n =>
      (curCat === 'all' || n.cat === curCat) &&
      (curRegion === 'all' || n.region === curRegion));
  }

  function renderFilters() {
    const cw = document.querySelector('#newsCatFilter');
    const rw = document.querySelector('#newsRegionFilter');
    if (cw) cw.innerHTML = CATS.map(([v, k]) => btn(v, T(k, v === 'all' ? '全部' : CAT_FB[v]), v === curCat, 'cat')).join('');
    if (rw) rw.innerHTML = REGIONS.map(([v, k]) => btn(v, T(k, v === 'all' ? '全部' : REGION_FB[v]), v === curRegion, 'region')).join('');
    document.querySelectorAll('.news-filter-btn').forEach(b => b.addEventListener('click', () => {
      if (b.dataset.axis === 'cat') curCat = b.dataset.value; else curRegion = b.dataset.value;
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
    const list = items();
    if (!list.length) {
      host.innerHTML = `<p style="color:var(--muted);padding:24px 0">${esc(T('nw_empty', '這個條件下沒有項目'))}</p>`;
      return;
    }
    const lang = L();
    host.innerHTML = list.map(n => {
      const c = n[lang] || n.zh || {};
      const catLabel = T('nw_cat_' + n.cat, CAT_FB[n.cat] || n.cat);
      const rgLabel = T('nw_rg_' + n.region.toLowerCase(), REGION_FB[n.region] || n.region);
      const badge = n.verified
        ? `<span title="${esc(T('nw_verified_t', '已抓取原文並核對數字'))}" style="color:#16a34a;font-size:11px">✓ ${esc(T('nw_verified', '已核對原文'))}</span>`
        : `<span title="${esc(T('nw_unverified_t', '來自來源的列表頁或彙整文，數字未逐一核對'))}" style="color:#d97706;font-size:11px">△ ${esc(T('nw_unverified', '未逐條核對'))}</span>`;
      return `
      <article class="news-card" style="border:1px solid var(--line);border-radius:var(--radius);background:#fff;padding:16px;margin-bottom:12px">
        <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:12px;color:var(--muted);margin-bottom:6px">
          <span style="font-family:var(--mono)">${esc(fmtDate(n.date))}</span>
          <span style="padding:2px 8px;border-radius:999px;background:var(--accent-soft);color:var(--accent-strong)">${esc(catLabel)}</span>
          <span style="padding:2px 8px;border-radius:999px;border:1px solid var(--line)">${esc(rgLabel)}</span>
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
