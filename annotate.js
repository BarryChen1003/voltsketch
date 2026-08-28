/**
 * annotate.js — 線路圖 refdes 自動編號
 *
 * 為什麼做在線路圖端而不是 PCB 端：
 *   Sch2Pcb.merge() 配對用的是 `c.id`（sch-r1），而合併時寫的是
 *   Object.assign({}, nc, { x, y, rot }) —— ref 以線路圖為準。
 *   所以在 PCB 頁改 refdes，下一次 ECO 同步就會被線路圖的值蓋回去，
 *   使用者會看到「我明明改過，同步一次又變回來」。編號的唯一正確位置在線路圖。
 *
 * 為什麼不沿用 app.js 的 getDefaultLabel：
 *   那張表的前綴本身帶數字（nmos:'M1'、npn:'Q1'、opamp:'U1'），
 *   接上 componentIdCounter 會產出 M15、Q17 這種看起來像型號的名字。
 *   這裡用乾淨前綴，數字只由編號器決定。
 *
 * 排序：先上後下、再左至右（KiCad / EasyEDA 的預設方向）。
 *   y 先量化成帶（BAND），同一帶內才比 x——不量化的話，兩顆肉眼同高、
 *   y 差 3px 的電阻會被排成上下兩帶，編號跳來跳去。
 *
 * 純函式：不碰 DOM、不改傳進來的物件，回傳「要改什麼」讓呼叫端自己套用。
 * 測試：annotate.test.js
 */
(function (root) {
  'use strict';

  // IEEE 315 / ASME Y14.44 的常用字首。查不到的型別不編號（回 null），
  // 不要用 'X' 之類的萬用字首硬編——編出來的名字沒有意義，還會佔掉號碼。
  const PREFIX = {
    resistor: 'R', varistor: 'RV',
    capacitor: 'C',
    inductor: 'L', cmchoke: 'L', bead: 'FB',
    diode: 'D', led: 'D', tvs: 'D',
    npn: 'Q', pnp: 'Q', nmos: 'Q', pmos: 'Q', dualnmos: 'Q', dualpmos: 'Q',
    ic: 'U', opamp: 'U', comparator: 'U', dcdc: 'U',
    and: 'U', or: 'U', nand: 'U', nor: 'U', xor: 'U', xnor: 'U', not: 'U', buffer: 'U',
    source: 'V',
    switch: 'SW', fuse: 'F', gdt: 'GDT', xtal: 'Y', shield: 'SH', lamp: 'DS',
    ammeter: 'M', voltmeter: 'M',
  };

  // 不編號：接地與電源軌是「網路符號」不是零件，編了反而會被誤認成料件；
  // 一張圖上通常有十幾個 GND，編成 GND1..GND14 只會讓 BOM 變髒。
  const SKIP = new Set(['ground', 'vrail', 'text', 'label', 'netlabel']);

  const BAND = 40;                    // y 量化帶寬（px），跟線路圖網格同一個量級

  const prefixOf = type => PREFIX[type] || null;

  // 'R12' → { p:'R', n:12 }；'R' → { p:'R', n:null }；'' → null
  function splitRef(label) {
    const s = String(label == null ? '' : label).trim();
    if (!s) return null;
    const m = /^([A-Za-z_][A-Za-z_]*)(\d*)$/.exec(s);
    if (!m) return { p: s, n: null };            // 使用者自訂的怪名字，原樣視為「已命名」
    return { p: m[1], n: m[2] === '' ? null : parseInt(m[2], 10) };
  }

  // 先上後下、再左至右。同格時用 id 決勝，讓結果可重現（測試才穩）。
  function orderOf(comps) {
    return comps.slice().sort((a, b) => {
      const ba = Math.round((a.y || 0) / BAND), bb = Math.round((b.y || 0) / BAND);
      if (ba !== bb) return ba - bb;
      if ((a.x || 0) !== (b.x || 0)) return (a.x || 0) - (b.x || 0);
      return String(a.id).localeCompare(String(b.id));
    });
  }

  /**
   * 規劃編號。
   * @param comps 線路圖元件陣列（{ id, type, x, y, label }）
   * @param opts  { mode: 'fill' | 'renumber', field: 'label' }
   *   fill     ：只編還沒有號碼的（含前綴不符的），既有號碼一律保留
   *   renumber ：整張圖重編，每個前綴從 1 開始
   * @returns { changes:[{id, from, to}], skipped:[id], dupes:[label], counts:{R:3,...} }
   */
  function plan(comps, opts) {
    const o = opts || {};
    const mode = o.mode === 'renumber' ? 'renumber' : 'fill';
    const field = o.field || 'label';
    const all = (comps || []).filter(Boolean);
    const list = orderOf(all.filter(c => !SKIP.has(c.type)));

    const changes = [], counts = {};
    // 沒編到的一律回報。SKIP 的型別要先在這裡收進來——它們被 filter 掉之後
    // 就走不到下面的迴圈了，不收的話使用者會看到「GND 怎麼沒被編號也沒被提到」。
    const skipped = all.filter(c => SKIP.has(c.type)).map(c => c.id);
    const taken = {};                 // prefix → Set(已用號碼)
    const seen = new Map();           // 現有 label → 出現次數（抓重複）

    for (const c of (comps || [])) {
      const cur = String(c && c[field] || '').trim();
      if (cur) seen.set(cur, (seen.get(cur) || 0) + 1);
    }
    const dupes = [...seen.entries()].filter(([, n]) => n > 1).map(([k]) => k).sort();

    // fill 模式要先把「已經佔用的號碼」收集起來，補號才不會撞到
    if (mode === 'fill') {
      for (const c of list) {
        const p = prefixOf(c.type);
        if (!p) continue;
        const cur = splitRef(c[field]);
        if (cur && cur.p === p && cur.n != null) {
          (taken[p] || (taken[p] = new Set())).add(cur.n);
        }
      }
    }

    const nextFree = p => {
      const used = taken[p] || (taken[p] = new Set());
      let n = 1;
      while (used.has(n)) n++;
      used.add(n);
      return n;
    };

    for (const c of list) {
      const p = prefixOf(c.type);
      if (!p) { skipped.push(c.id); continue; }
      const cur = splitRef(c[field]);

      if (mode === 'fill' && cur && cur.p === p && cur.n != null) {
        counts[p] = (counts[p] || 0) + 1;
        continue;                     // 已經有合格編號，不動
      }
      const to = p + nextFree(p);
      counts[p] = (counts[p] || 0) + 1;
      if (to !== String(c[field] || '')) changes.push({ id: c.id, from: String(c[field] || ''), to });
    }

    return { changes, skipped, dupes, counts };
  }

  // 把 plan() 的結果套用到元件上（會就地改，呼叫端自己負責先推 undo）
  function apply(comps, changes, field) {
    const f = field || 'label';
    const byId = new Map((comps || []).map(c => [c.id, c]));
    let n = 0;
    for (const ch of (changes || [])) {
      const c = byId.get(ch.id);
      if (!c) continue;
      c[f] = ch.to;
      n++;
    }
    return n;
  }

  const Annotate = { PREFIX, SKIP, BAND, prefixOf, splitRef, orderOf, plan, apply };

  if (typeof module !== 'undefined' && module.exports) module.exports = Annotate;
  root.Annotate = Annotate;
})(typeof window !== 'undefined' ? window : globalThis);
