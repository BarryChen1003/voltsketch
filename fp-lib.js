/**
 * fp-lib.js — 自製封裝庫的存取層（雲端 ＋ 本機，同一套介面）
 *
 * 為什麼要有兩層：
 *   沒登入的人也該用得到封裝編輯器——畫一顆 SOIC-8 就要先註冊，那是趕人走。
 *   但只有 localStorage 的話，換一台機器或清一次快取就全沒了。
 *   所以：沒登入走 localStorage，登入走雲端，介面一模一樣，
 *   UI 不必知道自己在跟誰講話。
 *
 * 登入之後本機那份會被「上傳」而不是「丟掉」（migrate()）：
 *   使用者在沒登入時畫的東西是他的，不能因為他後來註冊就消失。
 *   同名的以雲端為準（雲端那份是他在別台機器存的，比較新的機會大）。
 *
 * 純邏輯：不碰 DOM，可注入假 client 做 node 測試。測試：fp-lib.test.js
 */
(function (root) {
  'use strict';

  const TABLE = 'footprints';
  const LS_KEY = 'vs-footprints-v1';
  const MAX_BYTES = 256 * 1024;
  const MAX_COUNT = 200;
  const NAME_MAX = 60;

  let _client = null, _uid = null, _ls = null;
  const client = () => _client || (root.Auth && root.Auth.raw && root.Auth.raw()) || null;
  const store = () => _ls || (typeof localStorage !== 'undefined' ? localStorage : null);
  async function uid() {
    if (_uid) return typeof _uid === 'function' ? await _uid() : _uid;
    const u = root.Auth && root.Auth.enabled && root.Auth.enabled() && await root.Auth.user();
    return u ? u.id : null;
  }

  // ---- 純函式 ----
  function normName(s) {
    const t = String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f]/g, ' ').trim();
    return (t ? t : 'FP').slice(0, NAME_MAX);
  }

  function byteLen(v) {
    const s = typeof v === 'string' ? v : JSON.stringify(v);
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(s).length;
    return Buffer.byteLength(s, 'utf8');
  }

  // 存進來的東西一定要能被 footprint-editor 用。壞的資料存進去，
  // 是等到使用者按「放到板子上」才炸——那時他已經忘了是哪一步弄壞的。
  function validate(fp) {
    if (!fp || typeof fp !== 'object') return 'fp_bad';
    const pads = fp.pads;
    if (!Array.isArray(pads) || !pads.length) return 'fp_no_pads';
    for (const p of pads) {
      if (!p || p.num == null) return 'fp_pad_no_num';
      if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) return 'fp_pad_no_xy';
      if (!(p.w > 0) || !(p.h > 0)) return 'fp_pad_no_size';
    }
    if (byteLen(fp) > MAX_BYTES) return 'footprint_too_large';
    return null;
  }

  function mapErr(e) {
    const s = String((e && (e.message || e.details)) || e || '');
    if (/footprint_limit_reached/.test(s)) return 'footprint_limit_reached';
    if (/footprint_too_large/.test(s)) return 'footprint_too_large';
    if (/footprint_no_pads/.test(s)) return 'fp_no_pads';
    if (/duplicate key|footprints_user_name_uniq/i.test(s)) return 'fp_dup_name';
    if (/row-level security|permission denied/i.test(s)) return 'fp_denied';
    return s || 'fp_failed';
  }

  // ---- 本機 ----
  function localList() {
    try { return JSON.parse(store().getItem(LS_KEY) || '[]') || []; } catch (e) { return []; }
  }
  function localWrite(list) {
    try { store().setItem(LS_KEY, JSON.stringify(list)); return true; } catch (e) { return false; }
  }

  // ---- 對外：一律 async，呼叫端不必知道走哪一層 ----

  async function list() {
    const u = await uid(), c = client();
    if (!u || !c) {
      return localList().map(f => ({ name: f.name, kind: f.kind || 'custom', pads: (f.pads || []).length, local: true, data: f }));
    }
    const { data, error } = await c.from(TABLE)
      .select('id,name,kind,pad_count,updated_at').eq('user_id', u).order('updated_at', { ascending: false });
    if (error) throw new Error(mapErr(error));
    return (data || []).map(r => ({ id: r.id, name: r.name, kind: r.kind, pads: r.pad_count, updated_at: r.updated_at, local: false }));
  }

  // 清單刻意不帶 data（跟 designs 同一個理由：200 個封裝一次拉回來沒有意義）
  async function load(ref) {
    const u = await uid(), c = client();
    if (!u || !c) {
      const hit = localList().find(f => f.name === (ref && ref.name ? ref.name : ref));
      return hit || null;
    }
    const id = ref && ref.id ? ref.id : ref;
    const { data, error } = await c.from(TABLE).select('data').eq('user_id', u).eq('id', id).maybeSingle();
    if (error) throw new Error(mapErr(error));
    return data ? data.data : null;
  }

  async function save(fp) {
    const bad = validate(fp);
    if (bad) throw new Error(bad);
    const rec = Object.assign({}, fp, { name: normName(fp.name) });
    const u = await uid(), c = client();
    if (!u || !c) {
      const list = localList();
      const i = list.findIndex(f => f.name === rec.name);
      if (i >= 0) list[i] = rec; else list.push(rec);
      if (list.length > MAX_COUNT) throw new Error('footprint_limit_reached');
      if (!localWrite(list)) throw new Error('fp_storage_full');
      return { name: rec.name, local: true };
    }
    // 雲端：同名就更新（unique index 保證只有一列）
    const row = { user_id: u, name: rec.name, kind: rec.kind || 'custom', data: rec };
    const { data, error } = await c.from(TABLE)
      .upsert(row, { onConflict: 'user_id,name' }).select('id,name').single();
    if (error) throw new Error(mapErr(error));
    return { id: data.id, name: data.name, local: false };
  }

  async function remove(ref) {
    const u = await uid(), c = client();
    if (!u || !c) {
      const name = ref && ref.name ? ref.name : ref;
      const list = localList().filter(f => f.name !== name);
      if (!localWrite(list)) throw new Error('fp_storage_full');
      return true;
    }
    const id = ref && ref.id ? ref.id : ref;
    const { error } = await c.from(TABLE).delete().eq('user_id', u).eq('id', id);
    if (error) throw new Error(mapErr(error));
    return true;
  }

  /**
   * 登入之後把本機那份搬上雲端。
   * 同名的以雲端為準（雲端那份很可能是在別台機器存的），本機獨有的才上傳。
   * 成功之後**不刪本機**：萬一上傳到一半斷線，使用者的東西不能因此不見。
   */
  async function migrate() {
    const u = await uid(), c = client();
    if (!u || !c) return { uploaded: 0, skipped: 0, reason: 'not_signed_in' };
    const local = localList();
    if (!local.length) return { uploaded: 0, skipped: 0 };
    const cloud = await list();
    const have = new Set(cloud.map(f => String(f.name).toLowerCase()));
    let uploaded = 0, skipped = 0, failed = 0;
    for (const fp of local) {
      if (have.has(String(fp.name).toLowerCase())) { skipped++; continue; }
      try { await save(fp); uploaded++; } catch (e) { failed++; }
    }
    return { uploaded, skipped, failed };
  }

  const FpLib = {
    MAX_BYTES, MAX_COUNT, NAME_MAX, LS_KEY,
    normName, byteLen, validate, mapErr,
    list, load, save, remove, migrate,
    _inject(o) { _client = (o && o.client) || null; _uid = (o && o.uid) || null; _ls = (o && o.ls) || null; },
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = FpLib;
  root.FpLib = FpLib;
})(typeof window !== 'undefined' ? window : globalThis);
