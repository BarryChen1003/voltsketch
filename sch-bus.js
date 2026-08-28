/**
 * sch-bus.js — 線路圖匯流排（window.SchBus）
 *
 * 匯流排在這個 codebase 只是**記號**，不是新的電氣概念：
 *   幹線（w.bus）畫給人看，宣告「這束線裡有哪些成員」；
 *   分支（w.busTap）接到某一個成員，展開成一個 net 名字。
 * 節點計算那邊本來就會把**同名 net 標籤 union**，所以分支一旦有名字，
 * 相隔十萬八千里的兩處 D3 自動就是同一條 net——不必為匯流排另寫節點演算法。
 *
 * 幹線不導電這條規則放在 `circuit-engine.js` 的 normalizeBuses，不在這裡：
 * computeNets 有六個呼叫端，規則放外面等於六個地方都要記得先呼叫，
 * 少一個就會讓整條匯流排的訊號短在一起，而且畫面上完全正常。
 * 這支只負責「看得懂寫了什麼」與「講出哪裡不對」。
 *
 * 支援的寫法：
 *   D[0..7]      範圍（LSB→MSB）
 *   D[7..0]      反向（MSB→LSB，成員順序跟著反）
 *   ADDR[0:15]   冒號也認（Verilog 習慣）
 *   {CLK,RST,EN} 明列，名字自己取
 *
 * 純函式、不碰 DOM，node 測得到（sch-bus.test.js）。
 */
window.SchBus = (function () {
  'use strict';

  const T = (k, vars) => (typeof window !== 'undefined' && window.I18N) ? window.I18N.t(k, vars) : k;
  const S = v => String(v == null ? '' : v).trim();

  // 成員數上限。沒有上限的話，手滑打成 D[0..999999] 會當場把瀏覽器鎖死，
  // 而使用者只會覺得「按下去就沒反應了」。
  const MAX_WIDTH = 256;
  const NAME_RE = /^[A-Za-z_][A-Za-z0-9_$]*$/;

  /**
   * 解析匯流排寫法。回 {ok:true, kind, base, from, to, members[], width}
   * 或 {ok:false, reason}——reason 是 i18n key 的字尾，讓呼叫端能翻成四語。
   */
  function parse(spec) {
    const s = S(spec);
    if (!s) return { ok: false, reason: 'empty' };

    // 明列：{CLK,RST,EN}
    if (s[0] === '{') {
      if (s[s.length - 1] !== '}') return { ok: false, reason: 'brace' };
      const items = s.slice(1, -1).split(',').map(x => x.trim()).filter(Boolean);
      if (!items.length) return { ok: false, reason: 'empty_list' };
      if (items.length > MAX_WIDTH) return { ok: false, reason: 'too_wide' };
      for (const it of items) if (!NAME_RE.test(it)) return { ok: false, reason: 'bad_member', at: it };
      // 明列裡自己重複＝使用者打錯了，不要靜靜去重
      const seen = new Set();
      for (const it of items) { if (seen.has(it)) return { ok: false, reason: 'dup_member', at: it }; seen.add(it); }
      return { ok: true, kind: 'list', base: '', from: null, to: null, members: items, width: items.length };
    }

    // 範圍：D[0..7] / D[0:7] / D[7..0]
    const m = /^([A-Za-z_][A-Za-z0-9_$]*)\[\s*(-?\d+)\s*(?:\.\.|:)\s*(-?\d+)\s*\]$/.exec(s);
    if (!m) return { ok: false, reason: 'syntax' };
    const base = m[1], from = parseInt(m[2], 10), to = parseInt(m[3], 10);
    if (from < 0 || to < 0) return { ok: false, reason: 'negative' };
    const width = Math.abs(to - from) + 1;
    if (width > MAX_WIDTH) return { ok: false, reason: 'too_wide' };
    const step = to >= from ? 1 : -1;
    const members = [];
    for (let i = from; ; i += step) { members.push(base + i); if (i === to) break; }
    return { ok: true, kind: 'range', base, from, to, members, width };
  }

  // 反過來：把 base 與範圍寫回字串（UI 產生預設名字用）
  const format = (base, from, to) => S(base) + '[' + from + '..' + to + ']';

  const members = spec => { const p = parse(spec); return p.ok ? p.members : []; };

  // ---------------- 圖元分類 ----------------
  const isBus = w => !!(w && S(w.bus));
  const isTap = w => !!(w && S(w.busTap));
  const buses = wires => (wires || []).map((w, i) => ({ i, w, spec: S(w.bus) })).filter(x => x.spec);
  const taps = wires => (wires || []).map((w, i) => ({ i, w, member: S(w.busTap) })).filter(x => x.member);

  // ---------------- 幾何：分支接到哪一條幹線 ----------------
  // 判準是「分支的**任一端點**落在幹線上」，含幹線的兩個端點。
  // 只認內部（onSegInterior）的話，接在匯流排最末端的分支會被判成沒接上——
  // 那是完全正常的畫法。端點用距離判、中段用引擎的 onSegInterior，
  // 兩者合起來剛好覆蓋整條線段，不必再寫第三份線段幾何。
  function onSeg(px, py, w, eps) {
    const E = (typeof window !== 'undefined') && window.CircuitEngine;
    const d = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
    if (d(px, py, w.x1, w.y1) <= eps || d(px, py, w.x2, w.y2) <= eps) return true;
    if (E && E.onSegInterior) return E.onSegInterior(px, py, [w.x1, w.y1, w.x2, w.y2], eps);
    return false;
  }

  /**
   * 每個分支貼到哪條幹線。回 [{tapIndex, member, busIndex|null, spec}]
   * busIndex 為 null＝這條分支根本沒碰到任何幹線。
   */
  function attach(wires, eps) {
    eps = eps || 6;
    const bs = buses(wires);
    return taps(wires).map(t => {
      let hit = null;
      for (const b of bs) {
        if (onSeg(t.w.x1, t.w.y1, b.w, eps) || onSeg(t.w.x2, t.w.y2, b.w, eps)) { hit = b; break; }
      }
      return { tapIndex: t.i, member: t.member, busIndex: hit ? hit.i : null, spec: hit ? hit.spec : '' };
    });
  }

  // ---------------- 稽核 ----------------
  /**
   * 回 [{type:'error'|'warning'|'info', message}]，與 schematic 的 DRC 同一種形狀。
   * 只報「看得出來是錯的」，不報風格。
   */
  function audit(components, wires, eps) {
    const res = [];
    const bs = buses(wires);
    if (!bs.length && !taps(wires).length) return res;

    // 1) 幹線寫法本身
    const parsed = new Map();      // busIndex → parse 結果
    for (const b of bs) {
      const p = parse(b.spec);
      parsed.set(b.i, p);
      if (!p.ok) res.push({ type: 'error', message: T('bus_drc_spec', { spec: b.spec, why: T('bus_why_' + p.reason, { at: p.at || '' }) }) });
    }

    // 2) 同名匯流排的範圍必須一致。畫兩段 D[0..7] 是常態（轉角），
    //    但一段 D[0..7] 一段 D[0..15] 就是兩件事被當成同一件。
    const byBase = new Map();
    for (const b of bs) {
      const p = parsed.get(b.i);
      if (!p.ok || p.kind !== 'range') continue;
      const prev = byBase.get(p.base);
      if (!prev) { byBase.set(p.base, b.spec); continue; }
      if (prev !== b.spec) res.push({ type: 'error', message: T('bus_drc_conflict', { base: p.base, a: prev, b: b.spec }) });
    }

    // 3) 分支：有沒有接上、名字在不在那條匯流排裡
    const links = attach(wires, eps);
    const usedByBus = new Map();   // busIndex → Set(成員)
    for (const l of links) {
      if (l.busIndex == null) { res.push({ type: 'error', message: T('bus_drc_detached', { member: l.member }) }); continue; }
      const p = parsed.get(l.busIndex);
      if (!p || !p.ok) continue;   // 幹線寫法已經報過，不重複罵
      if (p.members.indexOf(l.member) < 0) {
        res.push({ type: 'error', message: T('bus_drc_not_member', { member: l.member, spec: l.spec, first: p.members[0], last: p.members[p.members.length - 1] }) });
        continue;
      }
      if (!usedByBus.has(l.busIndex)) usedByBus.set(l.busIndex, new Set());
      usedByBus.get(l.busIndex).add(l.member);
    }

    // 4) 畫了匯流排卻一條分支都沒有＝那束線目前不接任何東西
    for (const b of bs) {
      const p = parsed.get(b.i);
      if (!p.ok) continue;
      if (!usedByBus.has(b.i)) res.push({ type: 'warning', message: T('bus_drc_no_tap', { spec: b.spec }) });
    }

    // 5) 有成員從沒被接出來。這是提示不是錯：設計到一半很正常。
    //    依 base 聚合，不然轉角切成三段的同一條匯流排會報三次。
    const usedByBase = new Map();
    const specOfBase = new Map();
    for (const b of bs) {
      const p = parsed.get(b.i);
      if (!p.ok) continue;
      const key = p.kind === 'range' ? p.base : b.spec;
      specOfBase.set(key, b.spec);
      if (!usedByBase.has(key)) usedByBase.set(key, { all: p.members, used: new Set() });
      const u = usedByBus.get(b.i);
      if (u) for (const m of u) usedByBase.get(key).used.add(m);
    }
    for (const [key, v] of usedByBase) {
      if (!v.used.size) continue;                       // 完全沒接的由 (4) 講
      const idle = v.all.filter(m => !v.used.has(m));
      if (idle.length) res.push({ type: 'info', message: T('bus_drc_idle', { spec: specOfBase.get(key), n: idle.length, list: idle.slice(0, 8).join(', ') }) });
    }

    // 6) 同一條線同時寫了 net 與 busTap：引擎以 net 為準，但使用者多半沒發現
    for (const t of taps(wires)) {
      const n = S(t.w.net);
      if (n && n !== t.member) res.push({ type: 'warning', message: T('bus_drc_double', { member: t.member, net: n }) });
    }

    return res;
  }

  // ---------------- UI 小幫手 ----------------
  // 下一個還沒用掉的成員（畫新分支時當預設值，省得使用者自己數到第幾條）
  function nextFree(wires, spec, eps) {
    const p = parse(spec);
    if (!p.ok) return '';
    const used = new Set();
    for (const l of attach(wires, eps)) if (l.spec === spec) used.add(l.member);
    for (const m of p.members) if (!used.has(m)) return m;
    return '';
  }

  return { parse, format, members, isBus, isTap, buses, taps, attach, audit, nextFree, MAX_WIDTH };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = window.SchBus;
