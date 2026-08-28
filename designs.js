/**
 * designs.js — 雲端多專案存檔（線路圖 ＋ Layout 放同一列）
 *
 * 為什麼一列同時放 sch 與 pcb：
 *   Sch2Pcb 的 ECO 同步要兩邊配對。分兩張表存，馬上會出現「這片板配哪張圖」的
 *   對應問題，而且刪掉其中一邊會留下孤兒。一個專案＝一列，同步的兩份資料一起搬。
 *
 * 為什麼清單不查 data：
 *   一片板的 JSON 實測 6–12KB，最大的（openrex，1436 pad）220KB。清單如果 select('*')，
 *   20 個專案就是一次拉 4MB——這正是「多開清單會不會很卡」的那個卡。
 *   list() 只取 id/name/meta/updated_at（每筆約 100 bytes），板子資料只在 load() 才抓。
 *
 * 上限（伺服器端也有同樣的 trigger 擋，這裡是為了少一次來回就能給訊息）：
 *   每人 20 個專案、單一專案 2MB。理由是 Supabase 免費層 500MB，
 *   20 × 50KB ≈ 1MB/人 → 約 500 人。超過要嘛加錢、要嘛降上限，先擋住比事後清理容易。
 *
 * 測試：designs.test.js（注入假 client，不連網）。
 */
window.Designs = (function () {
  'use strict';

  const TABLE = 'designs';
  const MAX_BYTES = 2 * 1024 * 1024;
  const MAX_COUNT = 20;
  const NAME_MAX = 60;
  // 「目前這個瀏覽器正在編哪個專案」。放在 designs.js 而不是各頁自己記，
  // 是為了讓線路圖頁與 PCB 頁指向同一列——不然同一個專案會被兩頁各存各的。
  const CUR_KEY = 'vs-design-id';

  // 測試注入；平時走 Auth
  let _client = null, _uid = null;
  const client = () => _client || (window.Auth && window.Auth.raw && window.Auth.raw()) || null;
  async function uid() {
    if (_uid) return typeof _uid === 'function' ? await _uid() : _uid;
    const u = window.Auth && await window.Auth.user();
    return u ? u.id : null;
  }

  // ---- 純函式（node 測得到，不碰網路）----

  // 名稱正規化：控制字元會讓清單排版爛掉；空字串一律給預設名，不讓使用者存出無名專案
  function normName(s) {
    const t = String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f]/g, ' ').trim();
    return (t ? t : 'Untitled').slice(0, NAME_MAX);
  }

  // 位元組長度用 UTF-8 算。中文名稱與中文網名在 JSON 裡是 3 bytes，
  // 用 .length 會低估到剩三分之一，伺服器擋下來時前端卻說「還沒滿」。
  function byteLen(v) {
    if (v == null) return 0;
    const s = typeof v === 'string' ? v : JSON.stringify(v);
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(s).length;
    return Buffer.byteLength(s, 'utf8');
  }

  function checkSize(rec) {
    const bytes = byteLen(rec && rec.sch) + byteLen(rec && rec.pcb);
    return bytes > MAX_BYTES ? { ok: false, bytes, err: 'design_too_large' } : { ok: true, bytes };
  }

  // 清單上要顯示「這個專案有什麼」，但不能為此把 data 撈回來。
  // 所以存檔時順手把數量寫進 meta（幾十 bytes），清單直接讀。
  function metaOf(sch, pcb) {
    const n = (o, k) => (o && Array.isArray(o[k])) ? o[k].length : 0;
    return {
      sc: n(sch, 'components'), sw: n(sch, 'wires'),
      pc: n(pcb, 'components'), pt: n(pcb, 'traces'),
    };
  }

  const hasSch = m => !!(m && (m.sc || m.sw));
  const hasPcb = m => !!(m && (m.pc || m.pt));

  // 伺服器 trigger 丟的是 raise exception 字串，前端要能對應到四語訊息
  function mapErr(e) {
    const s = String((e && (e.message || e.error_description || e.details)) || e || '');
    if (/design_limit_reached/.test(s)) return 'design_limit_reached';
    if (/design_too_large/.test(s)) return 'design_too_large';
    if (/row-level security|permission denied/i.test(s)) return 'design_denied';
    return s || 'design_failed';
  }

  const sortList = rows => (rows || []).slice().sort(
    (a, b) => String(b.updated_at || '').localeCompare(String(a.updated_at || ''))
  );

  // 目前專案指標。localStorage 被停用（無痕、企業原則）時整站照常運作，
  // 只是每次重整都會退回「未連結」——所以這裡吞掉例外，不讓它擋住編輯器。
  function currentId() {
    try { return localStorage.getItem(CUR_KEY) || null; } catch (e) { return null; }
  }
  function setCurrent(id) {
    try { id ? localStorage.setItem(CUR_KEY, id) : localStorage.removeItem(CUR_KEY); } catch (e) { }
    return id || null;
  }

  // ---- 雲端（要登入）----

  async function list() {
    const c = client(); if (!c) return [];
    const u = await uid(); if (!u) return [];
    const { data, error } = await c.from(TABLE)
      .select('id,name,meta,updated_at').eq('user_id', u).order('updated_at', { ascending: false });
    if (error) throw new Error(mapErr(error));
    return sortList(data).map(r => ({
      id: r.id, name: r.name, updated_at: r.updated_at,
      meta: r.meta || {}, hasSch: hasSch(r.meta), hasPcb: hasPcb(r.meta),
    }));
  }

  async function load(id) {
    const c = client(); if (!c || !id) return null;
    const u = await uid(); if (!u) return null;
    const { data, error } = await c.from(TABLE)
      .select('id,name,sch,pcb,meta,updated_at').eq('user_id', u).eq('id', id).maybeSingle();
    if (error) throw new Error(mapErr(error));
    return data || null;
  }

  async function create(name, sch, pcb) {
    const c = client(); if (!c) throw new Error('design_offline');
    const u = await uid(); if (!u) throw new Error('design_signin');
    const sz = checkSize({ sch, pcb });
    if (!sz.ok) throw new Error(sz.err);
    // 上限在伺服器 trigger 也擋。這裡先問一次數量，是為了在按下去的當下就給訊息，
    // 而不是等資料整包傳完才被拒絕（大板子那一趟要好幾秒）。
    const { count, error: cErr } = await c.from(TABLE)
      .select('id', { count: 'exact', head: true }).eq('user_id', u);
    if (cErr) throw new Error(mapErr(cErr));
    if ((count || 0) >= MAX_COUNT) throw new Error('design_limit_reached');
    const row = { user_id: u, name: normName(name), sch: sch || null, pcb: pcb || null, meta: metaOf(sch, pcb) };
    const { data, error } = await c.from(TABLE).insert(row).select('id,name,updated_at').single();
    if (error) throw new Error(mapErr(error));
    return data;
  }

  // 只更新有傳進來的欄位：只存板子時不該把線路圖清成 null
  async function save(id, patch) {
    const c = client(); if (!c) throw new Error('design_offline');
    const u = await uid(); if (!u) throw new Error('design_signin');
    if (!id) throw new Error('design_no_id');
    const p = patch || {};
    const cur = ('sch' in p && 'pcb' in p) ? null : await load(id);
    const sch = ('sch' in p) ? p.sch : (cur ? cur.sch : null);
    const pcb = ('pcb' in p) ? p.pcb : (cur ? cur.pcb : null);
    const sz = checkSize({ sch, pcb });
    if (!sz.ok) throw new Error(sz.err);
    const row = { sch: sch || null, pcb: pcb || null, meta: metaOf(sch, pcb) };
    if ('name' in p) row.name = normName(p.name);
    const { error } = await c.from(TABLE).update(row).eq('user_id', u).eq('id', id);
    if (error) throw new Error(mapErr(error));
    return true;
  }

  async function rename(id, name) {
    const c = client(); if (!c) throw new Error('design_offline');
    const u = await uid(); if (!u) throw new Error('design_signin');
    const { error } = await c.from(TABLE).update({ name: normName(name) }).eq('user_id', u).eq('id', id);
    if (error) throw new Error(mapErr(error));
    return true;
  }

  async function remove(id) {
    const c = client(); if (!c) throw new Error('design_offline');
    const u = await uid(); if (!u) throw new Error('design_signin');
    const { error } = await c.from(TABLE).delete().eq('user_id', u).eq('id', id);
    if (error) throw new Error(mapErr(error));
    return true;
  }

  return {
    MAX_BYTES, MAX_COUNT, NAME_MAX,
    normName, byteLen, checkSize, metaOf, hasSch, hasPcb, mapErr, sortList,
    currentId, setCurrent,
    list, load, create, save, rename, remove,
    _inject(o) { _client = (o && o.client) || null; _uid = (o && o.uid) || null; },
  };
})();
