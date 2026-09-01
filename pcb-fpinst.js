/**
 * pcb-fpinst.js — 元件實例 ／ 封裝庫分離（window.FpInst）
 *
 * 問題：Sch2Pcb / PartsLib / RefFP 把封裝「展開」成 pads 塞進元件，展開完就跟庫斷了關係。
 *       之後庫改了（0603 的 pad 依 IPC-7351 加大、某顆 IC 補了 EP），
 *       既有板子完全不知道，而且**畫面上看不出來**——那才是真正麻煩的地方。
 *
 * 做法：**不搬 pads**。
 *   pads 留在元件身上當快取，渲染／DRC／匯出／undo 全部照舊，零遷移風險。
 *   另外記兩件事：
 *     fpRef  —— 這顆的封裝去哪個庫拿（{src, lib, variant, part, name}）
 *     fpHash —— 拿回來當時長什麼樣（pad 幾何的雜湊，不含 net）
 *   於是「同不同步」變成一次 hash 比對：
 *     庫的 hash ≠ fpHash 且 目前 pads 的 hash == fpHash  → stale（庫改了，可以安全更新）
 *     目前 pads 的 hash ≠ fpHash                          → edited（使用者手改過，更新會蓋掉他的東西）
 *     沒有 fpRef                                          → unknown（匯入的、手畫的，本來就不屬於任何庫）
 *     fpDetached === true                                 → detached（使用者明講不要跟庫）
 *
 * 界線（重要）：實例擁有的是 **net**（以及位置、旋轉、面別、refdes）；
 *   幾何一律歸庫。所以同步只搬幾何、按 pad 編號把 net 接回去。
 *   庫裡少掉的 pad 會讓那條 net 失去落點——**不靜靜丟掉**，回報成 lost 讓使用者看到。
 *
 * 舊板子沒有 fpRef/fpHash：refOf() 會從 footprintSource/part 推回來（推得出來才算），
 *   推不出來就是 unknown，永遠不會被自動動到。
 *
 * 純函式、不碰 DOM，庫可注入，node 測得到（fpinst.test.js）。
 */
window.FpInst = (function () {
  'use strict';

  const r3 = v => Math.round((Number(v) || 0) * 1000) / 1000;
  const S = v => String(v == null ? '' : v);

  // ---------------- 庫存取（可注入）----------------
  function libsOf(inj) {
    const W = (typeof window !== 'undefined') ? window : {};
    return {
      PartsLib: (inj && inj.PartsLib) || W.PartsLib || null,
      FootprintGen: (inj && inj.FootprintGen) || W.FootprintGen || null,
      IC_DATA: (inj && inj.IC_DATA) || W.IC_DATA || [],
      RefFP: (inj && inj.RefFP) || W.RefFP || null,
      // 使用者自製封裝：FpLib 是 async 的，這裡收「已經取回來的陣列」
      userFps: (inj && inj.userFps) || W.__fpUserCache || []
    };
  }

  // ---------------- fpRef ----------------
  // 正規化 + 舊板推導。推不出來回 null（unknown），不硬猜：
  // 猜錯的後果是拿別顆封裝去蓋掉這顆的 pad，比「不知道」嚴重得多。
  function refOf(comp) {
    if (!comp) return null;
    const r = comp.fpRef;
    if (r && r.src) {
      return {
        src: S(r.src), lib: S(r.lib), variant: S(r.variant),
        part: S(r.part), name: S(r.name),
        spec: r.spec || null, side: S(comp.side || 'top')
      };
    }
    const side = S(comp.side || 'top');
    const src = S(comp.footprintSource);
    if (src === 'partslib') {
      // Sch2Pcb 把 part 寫成 "lib variant"；variant 本身含空白（"SMA (DO-214AC)"），
      // 所以只切第一個空白。
      const p = S(comp.part);
      const at = p.indexOf(' ');
      if (at > 0) return { src: 'partslib', lib: p.slice(0, at), variant: p.slice(at + 1), part: '', name: '', spec: null, side };
      return null;
    }
    if (src === 'ic') {
      if (!S(comp.part)) return null;
      return { src: 'ic', lib: '', variant: '', part: S(comp.part), name: '', spec: null, side };
    }
    // 公版（src 'reffp'）刻意不做舊板推導：RefFP.resolve 吃的是**公版規格表裡**那顆
    // （part + kind + ref + w/h），而放上板之後 comp.w/h 已經被封裝本體蓋掉，
    // 拿板上的值回推會得到不一樣的封裝。所以只有蓋過章（fpRef.spec 帶著原始規格）
    // 的才算數，沒蓋章的一律 unknown——寧可說不知道，也不要報一堆假的「庫裡找不到」。
    return null;
  }

  const refKey = r => !r ? '' : [r.src, r.lib, r.variant, r.part, r.name, r.spec ? JSON.stringify(r.spec) : ''].join('|');

  // 公版元件放底面時 refBoardParts 會把 pad 的 F 翻成 B。同步要照做，
  // 不然更新一次就把底面元件的 pad 翻回頂層——匯出直接錯層。
  function applySide(pads, side) {
    if (side !== 'bottom') return pads;
    return pads.map(p => (p.side === 'F') ? Object.assign({}, p, { side: 'B' }) : p);
  }

  // 回 {ok, pads, body} 或 {ok:false, reason}
  function resolve(ref, inj) {
    if (!ref || !ref.src) return { ok: false, reason: 'noRef' };
    const L = libsOf(inj);
    try {
      if (ref.src === 'partslib') {
        if (!L.PartsLib) return { ok: false, reason: 'noLib' };
        const b = L.PartsLib.build(ref.lib, ref.variant);
        if (!b || !b.ok) return { ok: false, reason: 'variantNotFound' };
        return { ok: true, pads: applySide(b.pads, ref.side), body: b.body };
      }
      if (ref.src === 'ic') {
        if (!L.FootprintGen) return { ok: false, reason: 'noGenerator' };
        const want = S(ref.part).toLowerCase();
        const ic = (L.IC_DATA || []).find(x => S(x.part) === S(ref.part))
          || (L.IC_DATA || []).find(x => S(x.part).toLowerCase() === want);
        if (!ic) return { ok: false, reason: 'icNotInLibrary' };
        const f = L.FootprintGen.fromIC(ic);
        if (!f || !f.ok) return { ok: false, reason: 'footprintGenFailed' };
        return { ok: true, pads: applySide(f.pads, ref.side), body: f.body };
      }
      if (ref.src === 'reffp') {
        if (!L.RefFP) return { ok: false, reason: 'noLib' };
        // spec 是蓋章時抄下來的公版規格表那一列；RefFP 靠 kind/ref/w/h 分流，少一個就配到別的封裝
        if (!ref.spec) return { ok: false, reason: 'noRefSpec' };
        const f = L.RefFP.resolve(ref.spec);
        if (!f || !f.ok) return { ok: false, reason: 'refFpFailed' };
        return { ok: true, pads: applySide(f.pads, ref.side), body: f.body };
      }
      if (ref.src === 'user') {
        const hit = (L.userFps || []).find(f => S(f.name) === S(ref.name));
        // 自製封裝庫是 async 的（雲端清單刻意不帶 data），快取沒載到就是「不知道」，
        // 不是「庫裡沒有」。這兩件事混在一起會讓每次開頁都跳一串假警告。
        if (!hit) return { ok: false, reason: (L.userFps || []).length ? 'userFpNotFound' : 'userLibNotLoaded' };
        const cy = hit.courtyard || {};
        return {
          ok: true,
          pads: applySide(hit.pads || [], ref.side),
          body: { w: cy.w > 0 ? cy.w : 2, h: cy.h > 0 ? cy.h : 2 }
        };
      }
    } catch (e) { return { ok: false, reason: 'resolveThrew' }; }
    return { ok: false, reason: 'unknownSrc' };
  }

  // ---------------- 幾何雜湊 ----------------
  // 不含 net（net 是實例的）、不含 x/y/rot 的元件層級擺放（pad 座標本來就相對元件中心）。
  // 含 name：庫補了腳名是有意義的變更，值得提示同步。
  // FNV-1a 32bit：夠分辨 pad 幾何差異，而且瀏覽器與 node 兩邊都不必引入 crypto。
  function padRow(p) {
    return [S(p.num), r3(p.x), r3(p.y), r3(p.w), r3(p.h), r3(p.rot),
      S(p.shape || 'rect'), r3(p.drill), S(p.side || 'F'), S(p.type || 'smd'),
      p.cu === false ? 0 : 1, r3(p.rr), S(p.name)].join(',');
  }
  function hash(pads) {
    const rows = (pads || []).map(padRow).sort();
    let h = 0x811c9dc5;
    const s = rows.join(';');
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return rows.length + '-' + h.toString(16);
  }

  // 逐 pad 差異（給使用者看「更新會動到什麼」，不是給機器判斷用的）
  const GEOM = ['x', 'y', 'w', 'h', 'rot', 'shape', 'drill', 'side', 'type', 'rr', 'name'];
  function diff(oldPads, newPads) {
    const A = new Map((oldPads || []).map(p => [S(p.num), p]));
    const B = new Map((newPads || []).map(p => [S(p.num), p]));
    const out = [];
    for (const [num, a] of A) {
      if (!B.has(num)) { out.push({ num, kind: 'removed' }); continue; }
      const b = B.get(num);
      const fields = GEOM.filter(f => {
        const x = a[f], y = b[f];
        if (typeof x === 'number' || typeof y === 'number') return r3(x) !== r3(y);
        return S(x) !== S(y);
      });
      if (fields.length) out.push({ num, kind: 'changed', fields });
    }
    for (const num of B.keys()) if (!A.has(num)) out.push({ num, kind: 'added' });
    return out.sort((p, q) => p.num.localeCompare(q.num, undefined, { numeric: true }));
  }

  // ---------------- 狀態 ----------------
  // 回 {id, ref, fp, status, reason, changes, lost, libHash, instHash}
  const STATUSES = ['synced', 'stale', 'edited', 'missing', 'detached', 'unknown'];
  function status(comp, inj) {
    const base = { id: S(comp && comp.id), ref: S(comp && (comp.ref || comp.label)), fp: null, status: 'unknown', reason: '', changes: [], lost: [], libHash: '', instHash: '' };
    if (!comp) return base;
    base.instHash = hash(comp.pads || []);
    if (comp.fpDetached === true) return Object.assign(base, { status: 'detached', fp: refOf(comp) });
    const ref = refOf(comp);
    if (!ref) return base;
    base.fp = ref;
    const r = resolve(ref, inj);
    if (!r.ok) return Object.assign(base, {
      status: r.reason === 'userLibNotLoaded' ? 'unknown' : 'missing',
      reason: r.reason
    });
    base.libHash = hash(r.pads);
    // 沒存過 fpHash 的舊板：拿目前 pads 當基準。這時分不出「使用者手改過」與「庫改了」，
    // 所以只要不一樣一律當 stale，並標 unverified——同步前會先問。
    const known = S(comp.fpHash);
    if (!known) {
      base.unverified = true;
      if (base.libHash === base.instHash) return Object.assign(base, { status: 'synced' });
      return Object.assign(base, { status: 'stale', changes: diff(comp.pads || [], r.pads), lost: lostNets(comp.pads || [], r.pads) });
    }
    if (base.instHash !== known) {
      // 手改過。庫有沒有變都一樣：更新會蓋掉他改的東西，所以不進自動同步名單。
      return Object.assign(base, {
        status: 'edited',
        changes: diff(comp.pads || [], r.pads),
        lost: lostNets(comp.pads || [], r.pads)
      });
    }
    if (base.libHash === known) return Object.assign(base, { status: 'synced' });
    return Object.assign(base, {
      status: 'stale',
      changes: diff(comp.pads || [], r.pads),
      lost: lostNets(comp.pads || [], r.pads)
    });
  }

  // 庫裡沒有的 pad 編號上掛著 net → 同步後那條線會失去落點
  function lostNets(oldPads, newPads) {
    const B = new Set((newPads || []).map(p => S(p.num)));
    return (oldPads || []).filter(p => p.net && !B.has(S(p.num))).map(p => ({ num: S(p.num), net: S(p.net) }));
  }

  // ---------------- 蓋章 / 同步 ----------------
  // 建立元件時呼叫：把「這顆從哪來、當時長怎樣」記下來。沒有這一步，
  // 之後永遠只能是 unverified。
  // spec：只有 reffp 用得到（RefFP 的輸入）。抄一份而不是留參照，
  // 免得公版資料被改到時板上的章跟著變。
  const SPEC_KEYS = ['part', 'kind', 'ref', 'w', 'h', 'side', 'package', 'pins', 'guess'];
  function copySpec(spec) {
    if (!spec || typeof spec !== 'object') return null;
    const o = {};
    for (const k of SPEC_KEYS) if (spec[k] !== undefined) o[k] = spec[k];
    return o;
  }
  function stamp(comp, ref, pads) {
    if (!comp || !ref || !ref.src) return false;
    comp.fpRef = { src: S(ref.src), lib: S(ref.lib), variant: S(ref.variant), part: S(ref.part), name: S(ref.name) };
    const spec = copySpec(ref.spec);
    if (spec) comp.fpRef.spec = spec;
    comp.fpHash = hash(pads || comp.pads || []);
    delete comp.fpDetached;
    return true;
  }

  const detach = comp => { if (!comp) return false; comp.fpDetached = true; return true; };
  const attach = (comp, ref) => stamp(comp, ref || refOf(comp), comp && comp.pads);

  // 幾何從庫來、net 按 pad 編號接回去。回 {changed, lost, added, from, to}
  function sync(comp, inj) {
    const st = status(comp, inj);
    if (st.status === 'missing' || st.status === 'unknown') return { changed: false, reason: st.status, lost: [], added: [] };
    const r = resolve(st.fp, inj);
    if (!r.ok) return { changed: false, reason: r.reason, lost: [], added: [] };
    const before = hash(comp.pads || []);
    const oldNet = {};
    for (const p of (comp.pads || [])) if (p.net) oldNet[S(p.num)] = p.net;
    const lost = lostNets(comp.pads || [], r.pads);
    const had = new Set((comp.pads || []).map(p => S(p.num)));
    const added = r.pads.filter(p => !had.has(S(p.num))).map(p => S(p.num));
    comp.pads = r.pads.map(p => Object.assign({}, p, { net: oldNet[S(p.num)] || '' }));
    if (r.body) { comp.w = Math.max(1, r.body.w); comp.h = Math.max(1, r.body.h); }
    comp.fpHash = hash(comp.pads);
    comp.fpRef = { src: st.fp.src, lib: st.fp.lib, variant: st.fp.variant, part: st.fp.part, name: st.fp.name };
    const spec = copySpec(st.fp.spec);
    if (spec) comp.fpRef.spec = spec;
    return { changed: before !== comp.fpHash, lost, added, from: before, to: comp.fpHash, reason: '' };
  }

  // ---------------- 全板 ----------------
  function audit(state, inj) {
    const rows = (((state || {}).components) || []).map(c => status(c, inj));
    const counts = {};
    for (const s of STATUSES) counts[s] = 0;
    for (const r of rows) counts[r.status] = (counts[r.status] || 0) + 1;
    return { rows, counts, total: rows.length };
  }

  // 預設只動 stale：edited 會蓋掉使用者的手改、unknown/detached 不屬於任何庫、
  // missing 沒東西可以拿。opts.includeEdited 讓 UI 在明確問過之後才打開。
  function syncAll(state, inj, opts) {
    opts = opts || {};
    const want = new Set(opts.includeEdited ? ['stale', 'edited'] : ['stale']);
    const only = opts.ids ? new Set(opts.ids) : null;
    const done = [];
    for (const c of (((state || {}).components) || [])) {
      if (only && !only.has(c.id)) continue;
      const st = status(c, inj);
      if (!want.has(st.status)) continue;
      const r = sync(c, inj);
      if (r.changed || r.lost.length) done.push({ id: c.id, ref: S(c.ref || c.label), was: st.status, lost: r.lost, added: r.added });
    }
    return { synced: done.length, rows: done, lost: done.reduce((n, d) => n + d.lost.length, 0) };
  }

  // ---------------- 稽核訊息（併入 runDrc）----------------
  const T = (k, vars) => (typeof window !== 'undefined' && window.I18N) ? window.I18N.t(k, vars) : k;
  function auditFindings(state, inj) {
    const a = audit(state, inj);
    const res = [];
    if (a.counts.stale) res.push({ type: 'warning', message: T('fi_drc_stale', { n: a.counts.stale }) });
    if (a.counts.edited) res.push({ type: 'info', message: T('fi_drc_edited', { n: a.counts.edited }) });
    if (a.counts.missing) {
      const who = a.rows.filter(r => r.status === 'missing').slice(0, 5).map(r => r.ref || r.id).join(', ');
      res.push({ type: 'warning', message: T('fi_drc_missing', { n: a.counts.missing, who }) });
    }
    return res;
  }

  // ---------------- 板 → 庫（回寫）----------------
  // 另一個方向（庫 → 板）的界線是「幾何歸庫、net 歸實例」。回寫用同一條界線：
  // 只送幾何，net 一律剝掉——不剝的話，別的板子套用這顆封裝會拿到這片板的網路名。
  //
  // **只有自製封裝（src 'user'）能回寫**。partslib 是依 IPC-7351 算出來的、
  // ic 來自 IC 資料、reffp 是公版參考——覆蓋它們等於改掉所有板子的共同基準。
  // 那條路是「另存成新的自製封裝」（面板上的「從選取的元件建立」）。
  //
  // 回寫成功之後**不需要**去標記其他實例：status() 每次都跟庫重算，
  // 庫一變，別的實例自然變成 stale（它們的 fpHash 還是舊的庫雜湊）。
  function pushPlan(comp, inj) {
    if (!comp) return { ok: false, reason: 'noComp' };
    if (!(comp.pads || []).length) return { ok: false, reason: 'noPads' };
    if (comp.fpDetached === true) return { ok: false, reason: 'detached' };
    const st = status(comp, inj);
    const ref = st.fp || refOf(comp);
    if (!ref || ref.src !== 'user') return { ok: false, reason: 'notUserFp', status: st.status };
    const name = S(ref.name) || S(ref.variant);
    if (!name) return { ok: false, reason: 'noName', status: st.status };
    // 已經跟庫一致就沒有東西可回寫。硬存一次不會壞，但會讓使用者以為剛才有改到什麼。
    if (st.status === 'synced') return { ok: false, reason: 'alreadySynced', status: st.status };
    return { ok: true, name: name, ref: ref, status: st.status, hash: hash(comp.pads) };
  }

  return {
    refOf, refKey, resolve, hash, diff, status, sync, syncAll, audit, auditFindings,
    stamp, detach, attach, lostNets, pushPlan, STATUSES
  };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = window.FpInst;
