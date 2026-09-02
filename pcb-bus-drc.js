/**
 * pcb-bus-drc.js — 匯流排層級 DRC（window.BusDrc）
 *
 * 板子上沒有「一束」這種東西，只有一條條 net。`sch-bus.js` 已經把成組關係帶過來
 * （`state.busGroups`），面板也會顯示每束的 skew——但那只是**顯示**：
 * 沒有任何檢查會因為「這一束彼此不一致」而報錯。這支補的就是那一層：
 * **一束要一起遵守的規則**。
 *
 * 規則分兩種，預設值刻意不同：
 *   - 「一致性」規則（成員主要層一致、via 數一致）**預設開**，報 warning。
 *     它們不需要使用者填任何數字就能抓到真的問題（D3 自己跑到底層、
 *     某一條多打了兩個 via），而且不會對既有板子噴 error。
 *   - 「數值上限」規則（skew 上限、束內間距、via 數上限、必須全繞完）**預設關**，
 *     填了才檢查。沒有規格就沒有「超標」可言，預設給一個數字只會製造假違規。
 *
 * 三個刻意的取捨：
 *   1. **層看的是「主要層」不是「有沒有跨層」**。任何一條有 via 的線都會跨層，
 *      用「跨層就報」的話整塊板子都是警告。主要層＝這條 net 走最長的那一層，
 *      抓的是「這一條跟同束的其他條不在同一面」。
 *   2. **skew 只算已繞的成員**，跟 `SchBus.report` 同一個定義（直接呼叫它，
 *      不自己再算一次）。把沒繞的當 0 會得到一個很大的假 skew。
 *   3. **束內間距只在「比全域淨空嚴」時才報**。比全域鬆的話 `PadDrc` 已經報過了，
 *      兩邊都報等於同一個問題出現兩次，使用者會以為有兩個錯。
 *
 * 純函式、不碰 DOM，node 測得到（pcb-logic.test.js 第 47 節）。
 */
(function () {
  'use strict';

  const W = (typeof window !== 'undefined') ? window : globalThis;
  const T = (k, vars) => (W && W.I18N) ? W.I18N.t(k, vars) : k;

  // 每束的規則。0／false＝不檢查。
  const DEFAULTS = () => ({
    maxSkew: 0,        // mm，束內最長最短差的上限
    intraGap: 0,       // mm，束內成員彼此的最小間距（串擾用；要比全域淨空嚴才有意義）
    maxVias: 0,        // 每個成員的 via 數上限
    sameLayer: true,   // 成員的主要層必須一致
    viaMatch: true,    // 成員的 via 數必須一致
    requireAll: false  // 成員必須全部繞完
  });

  const NUM = new Set(['maxSkew', 'intraGap', 'maxVias']);
  const BOOL = new Set(['sameLayer', 'viaMatch', 'requireAll']);

  /**
   * 某一束目前生效的規則＝預設 ← 這束的覆寫（`state.busRules[spec]`）。
   * 規則跟著板子存檔走（`pcb-history.js` 的 serialize 是「除了 SKIP 全存」），
   * 所以不必另開一個 localStorage 鍵——那會讓「同一片板換台電腦就沒規則」。
   */
  function rulesFor(state, spec) {
    const out = DEFAULTS();
    const per = (state && state.busRules && state.busRules[spec]) || null;
    if (!per) return out;
    for (const k of Object.keys(out)) {
      if (per[k] === undefined || per[k] === null) continue;
      if (NUM.has(k)) { const v = Number(per[k]); if (isFinite(v) && v >= 0) out[k] = v; }
      else if (BOOL.has(k)) out[k] = !!per[k];
    }
    return out;
  }

  // 寫回一束的規則。只收認得的欄位，避免把整包 UI 狀態塞進存檔。
  function setRule(state, spec, key, value) {
    if (!state || !spec) return null;
    if (!NUM.has(key) && !BOOL.has(key)) return null;
    state.busRules = state.busRules || {};
    const cur = Object.assign({}, state.busRules[spec] || {});
    if (NUM.has(key)) { const v = Number(value); cur[key] = (isFinite(v) && v > 0) ? v : 0; }
    else cur[key] = !!value;
    state.busRules[spec] = cur;
    return cur;
  }

  /**
   * 一個成員（net）在板上的樣子：總長、主要層、via 數、要標紅的位置。
   * `at` 取最長那一段的中點——違規標記要落在看得到的線上，
   * 落在零長度殘段上等於沒標。
   */
  function statsOf(state, net) {
    const byLayer = new Map();
    let len = 0, best = 0, at = null;
    for (const t of ((state && state.traces) || [])) {
      if ((t.net || '') !== net) continue;
      const L = Math.hypot(t.x2 - t.x1, t.y2 - t.y1);
      if (!(L > 0)) continue;
      len += L;
      const ly = t.layer || 'F.Cu';
      byLayer.set(ly, (byLayer.get(ly) || 0) + L);
      if (L > best) { best = L; at = { x: (t.x1 + t.x2) / 2, y: (t.y1 + t.y2) / 2 }; }
    }
    let layer = '', domLen = -1;
    for (const [ly, L] of byLayer) if (L > domLen) { domLen = L; layer = ly; }
    let vias = 0, viaAt = null;
    for (const v of ((state && state.vias) || [])) {
      if ((v.net || '') !== net) continue;
      vias++;
      if (!viaAt) viaAt = { x: v.x, y: v.y };
    }
    return { net: net, len: len, layer: layer, vias: vias, at: at || viaAt };
  }

  // 線段對線段最短距離：優先用 PadDrc 那一份（DRC 全站同一套幾何），沒載入才退回本地版。
  function segGap(a, b) {
    const G = W.PadDrc && W.PadDrc._geom;
    const wa = (a.width || 0.3) / 2, wb = (b.width || 0.3) / 2;
    if (G && G.segSegDist) return G.segSegDist(a.x1, a.y1, a.x2, a.y2, b.x1, b.y1, b.x2, b.y2) - wa - wb;
    const p2s = (px, py, x1, y1, x2, y2) => {
      const dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy;
      if (l2 === 0) return Math.hypot(px - x1, py - y1);
      const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / l2));
      return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
    };
    const d = Math.min(
      p2s(a.x1, a.y1, b.x1, b.y1, b.x2, b.y2), p2s(a.x2, a.y2, b.x1, b.y1, b.x2, b.y2),
      p2s(b.x1, b.y1, a.x1, a.y1, a.x2, a.y2), p2s(b.x2, b.y2, a.x1, a.y1, a.x2, a.y2));
    return d - wa - wb;
  }

  const MAX_GAP_ROWS = 5;   // 束內間距最多列 5 對，其餘併成一句（跟銳角檢查同一個做法）

  /**
   * 全束稽核。回 [{type, message, x, y}]——**帶座標**，`pcb.js` 的 drawDrcMarks
   * 才標得出來；只有清單的話使用者拿到「D3 慢了 1.2mm」還得自己在板上找。
   *
   * globalClearance＝全域走線間距，用來判斷束內間距值得不值得另外報。
   */
  function audit(state, globalClearance) {
    const res = [];
    const groups = (state && state.busGroups) || [];
    if (!groups.length) return res;
    const SB = W.SchBus;

    for (const g of groups) {
      const members = (g && g.members) || [];
      if (members.length < 2) continue;
      const r = rulesFor(state, g.spec);
      const st = members.map(n => statsOf(state, n));
      const byNet = new Map(st.map(s => [s.net, s]));
      const routed = st.filter(s => s.len > 0);

      // 0) 還沒繞完。預設不報——設計到一半是常態，面板上的 routed/width 已經講了。
      if (r.requireAll && routed.length < st.length) {
        const miss = st.filter(s => s.len <= 0).map(s => s.net);
        const anchor = routed[0] && routed[0].at;
        res.push({
          type: 'error',
          message: T('bdrc_unrouted', { spec: g.spec, n: miss.length, list: miss.slice(0, 8).join(', ') }),
          x: anchor && anchor.x, y: anchor && anchor.y
        });
      }
      if (routed.length < 2) continue;   // 只有一條繞好時，「一束的規則」無從比起

      // 1) skew 上限。skew 的定義只有一個：SchBus.report（只算已繞的成員）。
      //    在這裡自己再算一次的話，遲早會出現「面板說 0.3、DRC 說 1.1」。
      if (r.maxSkew > 0) {
        const rep = SB && SB.report
          ? SB.report(g, n => (byNet.get(n) || { len: 0 }).len)
          : (() => { const L = routed.map(s => s.len); return { skew: Math.max.apply(null, L) - Math.min.apply(null, L) }; })();
        if (rep.skew > r.maxSkew + 1e-9) {
          // 標在最短的那一條上：那條才是要補長度的
          let worst = routed[0];
          for (const s of routed) if (s.len < worst.len) worst = s;
          res.push({
            type: 'error',
            message: T('bdrc_skew', { spec: g.spec, skew: rep.skew.toFixed(3), max: r.maxSkew, net: worst.net }),
            x: worst.at && worst.at.x, y: worst.at && worst.at.y
          });
        }
      }

      // 2) 主要層一致。少數派才是要報的那幾條——多數派沒有比較對。
      if (r.sameLayer) {
        const tally = new Map();
        for (const s of routed) tally.set(s.layer, (tally.get(s.layer) || 0) + 1);
        if (tally.size > 1) {
          let main = '', mainN = -1;
          for (const [ly, n] of tally) if (n > mainN) { mainN = n; main = ly; }
          const odd = routed.filter(s => s.layer !== main);
          const a = odd[0] && odd[0].at;
          res.push({
            type: 'warning',
            message: T('bdrc_layer', { spec: g.spec, main: main, n: odd.length, list: odd.slice(0, 6).map(s => s.net + '@' + s.layer).join(', ') }),
            x: a && a.x, y: a && a.y
          });
        }
      }

      // 3) via 數一致（延遲不一致的常見來源：一條走頂層直達、另一條打兩個 via 繞到底層）
      if (r.viaMatch) {
        const vs = routed.map(s => s.vias);
        const mx = Math.max.apply(null, vs), mn = Math.min.apply(null, vs);
        if (mx !== mn) {
          let worst = routed[0];
          for (const s of routed) if (s.vias > worst.vias) worst = s;
          res.push({
            type: 'warning',
            message: T('bdrc_via_mismatch', { spec: g.spec, min: mn, max: mx, net: worst.net }),
            x: worst.at && worst.at.x, y: worst.at && worst.at.y
          });
        }
      }

      // 4) via 數上限
      if (r.maxVias > 0) {
        const over = routed.filter(s => s.vias > r.maxVias);
        if (over.length) {
          const a = over[0].at;
          res.push({
            type: 'error',
            message: T('bdrc_via_max', { spec: g.spec, max: r.maxVias, n: over.length, net: over[0].net, seen: over[0].vias }),
            x: a && a.x, y: a && a.y
          });
        }
      }

      // 5) 束內間距。比全域淨空鬆的話 PadDrc 已經報過，不重複報。
      const fb = globalClearance || 0;
      if (r.intraGap > fb) {
        const segsOf = new Map();
        for (const t of ((state && state.traces) || [])) {
          const n = t.net || '';
          if (!byNet.has(n)) continue;
          if (!(Math.hypot(t.x2 - t.x1, t.y2 - t.y1) > 0)) continue;
          if (!segsOf.has(n)) segsOf.set(n, []);
          segsOf.get(n).push(t);
        }
        const names = routed.map(s => s.net).filter(n => segsOf.has(n));
        let shown = 0, more = 0;
        for (let i = 0; i < names.length; i++) {
          for (let j = i + 1; j < names.length; j++) {
            let bad = null;
            const A = segsOf.get(names[i]), B = segsOf.get(names[j]);
            for (const a of A) {
              for (const b of B) {
                if ((a.layer || 'F.Cu') !== (b.layer || 'F.Cu')) continue;
                const d = segGap(a, b);
                if (d < r.intraGap - 1e-9 && (!bad || d < bad.d)) {
                  bad = { d: d, x: (a.x1 + a.x2 + b.x1 + b.x2) / 4, y: (a.y1 + a.y2 + b.y1 + b.y2) / 4 };
                }
              }
            }
            if (!bad) continue;
            if (shown < MAX_GAP_ROWS) {
              shown++;
              res.push({
                type: 'error',
                message: T('bdrc_gap', { spec: g.spec, a: names[i], b: names[j], d: Math.max(0, bad.d).toFixed(3), req: r.intraGap }),
                x: bad.x, y: bad.y
              });
            } else more++;
          }
        }
        if (more) res.push({ type: 'error', message: T('bdrc_gap_more', { spec: g.spec, n: more }) });
      }
    }
    return res;
  }

  const BusDrc = { DEFAULTS, rulesFor, setRule, statsOf, audit, MAX_GAP_ROWS };
  if (typeof window !== 'undefined') window.BusDrc = BusDrc;
  if (typeof module !== 'undefined' && module.exports) module.exports = BusDrc;
})();
