/**
 * sch-swap.js — pin / gate swap（window.SchSwap）
 *
 * 佈線時最常見的兩個小動作：
 *   **pin swap**  同一顆元件上兩隻「電氣等價」的腳互換，省掉一個交叉。
 *   **gate swap** 兩顆同型元件整組對調（例如四合一 NAND 裡的兩個閘）。
 *
 * 為什麼記錄要寫回線路圖：`Sch2Pcb.merge()` 合併時是
 * `Object.assign({}, nc, { x, y, rot })`——**net 以線路圖為準**。
 * 只改板子上的 pad，下一次 ECO 同步就被原封不動蓋回去，
 * 而且中間沒有任何訊息，使用者只會覺得「我明明換過」。
 * 所以交換記在線路圖元件的 `pinSwap` 上，由 `Sch2Pcb.bindNets` 在綁 net 時套用。
 *
 * ── 哪些腳可以換（這張表寧可保守）──
 * 換錯腳是真正的電性錯誤，而且板子做出來才會發現。所以內建表只收
 * **本質對稱**的東西：無極性兩腳被動件、邏輯閘的輸入腳。
 * 電容**不在**預設表裡（電解電容有極性，而這個 codebase 的 capacitor
 * 型別沒有「有沒有極性」這個欄位，分不出來就不要猜）；
 * 二極體、LED、TVS、電晶體一律不可換。
 * 使用者可以在元件上寫 `swapGroups` 明確開放，那是他自己的決定。
 *
 * 純函式、不碰 DOM，node 測得到（sch-swap.test.js）。
 */
window.SchSwap = (function () {
  'use strict';

  const T = (k, vars) => (typeof window !== 'undefined' && window.I18N) ? window.I18N.t(k, vars) : k;
  const S = v => String(v == null ? '' : v).trim();

  // 型別 → 可互換的腳名分組。名字對應 circuit-engine 的 PinDefs。
  // 每一組裡的腳彼此等價；不在任何一組裡的腳不可換。
  const BUILTIN = {
    resistor: [['a', 'b']],
    inductor: [['a', 'b']],
    bead: [['a', 'b']],
    fuse: [['a', 'b']],
    varistor: [['a', 'b']],
    gdt: [['a', 'b']],
    xtal: [['a', 'b']],
    lamp: [['a', 'b']],
    // 邏輯閘：只有兩隻輸入可換（4=輸出、5=VCC、3=GND 不可動）
    and: [['1', '2']], or: [['1', '2']], nand: [['1', '2']],
    nor: [['1', '2']], xor: [['1', '2']], xnor: [['1', '2']]
    // 刻意不收：capacitor（可能有極性，型別上分不出來）、diode/led/tvs、
    // npn/pnp/nmos/pmos、switch、source、ground、opamp（IN+/IN− 不等價）
  };

  /**
   * 這顆元件有哪些可互換的腳組。
   * 元件自己的 `swapGroups` 覆寫內建表——使用者明講的優先，
   * 包括「明講成空陣列」＝這顆一隻都不准換。
   */
  function groupsFor(comp) {
    if (!comp) return [];
    if (Array.isArray(comp.swapGroups)) {
      return comp.swapGroups.filter(Array.isArray).map(g => g.map(S).filter(Boolean)).filter(g => g.length >= 2);
    }
    return (BUILTIN[S(comp.type)] || []).map(g => g.slice());
  }

  /** a 與 b 是不是同一組（＝可以互換） */
  function canSwapPins(comp, a, b) {
    const A = S(a), B = S(b);
    if (!A || !B || A === B) return false;
    return groupsFor(comp).some(g => g.indexOf(A) >= 0 && g.indexOf(B) >= 0);
  }

  // ---------------- 排列 ----------------
  /**
   * 元件目前生效的腳位排列：`{ 板上的腳: 要取哪一隻線路圖腳的 net }`。
   * 恆等（沒換過）的項目不留，存檔才不會長一堆 `{"a":"a"}`。
   */
  function permutationOf(comp) {
    const raw = (comp && comp.pinSwap) || {};
    const out = {};
    for (const k of Object.keys(raw)) {
      const from = S(k), to = S(raw[k]);
      if (from && to && from !== to) out[from] = to;
    }
    return out;
  }

  /**
   * 把「再換一次 a↔b」疊到既有排列上。
   * 一定要用合成而不是直接寫 `{a:b, b:a}`：換過一次再換回來應該回到乾淨狀態，
   * 直接覆寫的話會留下一組看起來有換、其實是恆等的資料，
   * 之後每次同步都在搬同一件事，也讓稽核報一條不存在的交換。
   * 回新的 pinSwap 物件（不改原件），恆等時回 null 代表「這個欄位可以刪掉」。
   */
  function composeSwap(comp, a, b) {
    const A = S(a), B = S(b);
    if (!A || !B || A === B) return { ok: false, reason: 'same' };
    if (!canSwapPins(comp, A, B)) return { ok: false, reason: 'notSwappable' };
    const cur = permutationOf(comp);
    const at = k => cur[k] || k;              // 目前這隻腳取的是哪隻線路圖腳
    const next = Object.assign({}, cur);
    next[A] = at(B);
    next[B] = at(A);
    for (const k of Object.keys(next)) if (next[k] === k) delete next[k];
    return { ok: true, pinSwap: Object.keys(next).length ? next : null };
  }

  /** 交換兩顆同型元件的整組接線（gate swap）。回兩邊的新 pinSwap 之外的做法見下。 */
  function canSwapGates(c1, c2) {
    if (!c1 || !c2 || c1 === c2) return false;
    if (S(c1.type) !== S(c2.type)) return false;
    if (S(c1.type) === '') return false;
    // 型別相同還不夠：封裝不同就是兩顆不一樣的料，換過去腳位對不上
    const fp = c => S(c.footprint) || S(c.part) || '';
    if (fp(c1) !== fp(c2)) return false;
    // IC 要同一顆料號才算同型（74HC00 的閘不能跟 74HC08 的閘互換）
    if (S(c1.name) !== S(c2.name)) return false;
    return true;
  }

  /**
   * 同 canSwapGates，但回「為什麼不行」。
   * 只回 true/false 的話，畫面只能說「不能換」，使用者不知道是型別不同、料號不同
   * 還是封裝不同——三種的處置完全不一樣。
   */
  function canSwapGatesWhy(c1, c2) {
    if (!c1 || !c2) return { ok: false, why: 'need_two' };
    if (c1 === c2) return { ok: false, why: 'same' };
    if (S(c1.type) === '' || S(c2.type) === '') return { ok: false, why: 'no_type' };
    if (S(c1.type) !== S(c2.type)) return { ok: false, why: 'type', a: S(c1.type), b: S(c2.type) };
    if (S(c1.name) !== S(c2.name)) return { ok: false, why: 'part', a: S(c1.name), b: S(c2.name) };
    const fp = c => S(c.footprint) || S(c.part) || '';
    if (fp(c1) !== fp(c2)) return { ok: false, why: 'footprint', a: fp(c1), b: fp(c2) };
    return { ok: true, why: '' };
  }

  /**
   * 對調兩顆的擺放（位置與角度）。回新值，不動原物件——
   * 呼叫端要先問過 canSwapGates 再套用，順序寫死在這裡的話測試就驗不到那道守門。
   *
   * 為什麼是「對調擺放」而不是「對調封裝內的單元」：這個資料模型裡沒有
   * 「一顆包裝裡有 A/B/C/D 四個閘」這件事，每顆元件就是一顆封裝。
   * 兩顆同型元件互換位置＝各自的 net 跟著自己走到對方的位置，
   * 效果就是佈線變短，那正是 gate swap 要的東西。**不假裝我們有單元的概念。**
   */
  function swapPlacement(a, b) {
    if (!a || !b || a === b) return null;
    return {
      a: { x: b.x, y: b.y, rot: b.rot || 0 },
      b: { x: a.x, y: a.y, rot: a.rot || 0 }
    };
  }

  // ---------------- 稽核 ----------------
  /**
   * 目前有哪些交換生效中。交換是「畫面上看不出來」的東西——
   * 線路圖長得一模一樣，只有 net 綁到哪隻 pad 變了。
   * 所以一定要列出來，不然它就是一個隱形的差異。
   */
  function audit(schComps) {
    const res = [];
    for (const c of (schComps || [])) {
      const p = permutationOf(c);
      const keys = Object.keys(p);
      if (!keys.length) continue;
      const label = S(c.label) || S(c.id);
      // 排列指到不存在的組＝資料被手改壞了，或元件型別換過
      const bad = keys.filter(k => !canSwapPins(c, k, p[k]));
      if (bad.length) {
        res.push({ type: 'error', message: T('swap_drc_invalid', { ref: label, pins: bad.join(', ') }) });
        continue;
      }
      res.push({ type: 'info', message: T('swap_drc_active', { ref: label, list: keys.sort().map(k => k + '↔' + p[k]).join(', ') }) });
    }
    return res;
  }

  /**
   * 綁 net 時用：這隻板上的腳應該取線路圖哪一隻腳的 net。
   * 沒換過就是它自己。`Sch2Pcb.bindNets` 只呼叫這一個函式，
   * 交換的規則因此只有這一份。
   */
  function mapPin(comp, padNum) {
    const p = permutationOf(comp);
    const k = S(padNum);
    return p[k] || k;
  }

  const hasSwaps = schComps => (schComps || []).some(c => Object.keys(permutationOf(c)).length > 0);

  return { BUILTIN, groupsFor, canSwapPins, permutationOf, composeSwap, canSwapGates, canSwapGatesWhy, swapPlacement, audit, mapPin, hasSwaps };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = window.SchSwap;
