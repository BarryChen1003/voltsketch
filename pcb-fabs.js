// 板廠能力檔 + 中立 DFM 檢查（window.FabProfiles）
//
// 為什麼要這支：
//   EasyEDA 屬於嘉立創，它的 DRC 只會照 JLCPCB 的規則走，也不會告訴你別家怎麼樣——
//   利益衝突擺在那裡，它結構上不可能做中立比較。我們沒有那個包袱，所以這是能贏的地方。
//
// 資料誠實原則（照 CLAUDE.md：不憑印象寫規格）：
//   * 每個 profile 都標 source（官方能力頁）與 fetched（擷取日期）。
//   * 官方沒公開的欄位一律 null，檢查時**跳過並回報「未公開」**，不編數字、不拿別家的值頂替。
//   * 數字會改版。過期就重抓官方頁更新 fetched，不要照記憶改。
//
// 檢查器 check() 是純函式（不碰 DOM），回結構化結果讓 UI 層自己做 i18n。

(() => {
  'use strict';

  const MIL = 0.0254;

  // 每家的 tiers 依板層數挑：第一個 maxLayers >= 板層數的就是適用檔位。
  const PROFILES = [
    {
      id: 'jlcpcb',
      name: 'JLCPCB',
      source: 'https://jlcpcb.com/capabilities/pcb-capabilities',
      fetched: '2026-08-24',
      layers: { min: 1, max: 32 },
      tiers: [
        {
          maxLayers: 2,
          board: { minW: 3, minH: 3, maxW: 670, maxH: 600 },
          rules: {
            minTrace: 0.10, minSpace: 0.10,          // 1 oz
            minDrill: 0.15, minViaPad: 0.25,
            minAnnular: 0.18, recAnnular: 0.25,      // 絕對下限 / 建議值
            minEdgeClearance: 0.20,                  // 銑邊；V-cut 為 0.40
            minSilkWidth: 0.15, minSilkHeight: 1.0
          }
        },
        {
          maxLayers: 32,
          board: { minW: 3, minH: 3, maxW: 656, maxH: 586 },
          rules: {
            minTrace: 0.10, minSpace: 0.10,
            minDrill: 0.15, minViaPad: 0.25,
            minAnnular: 0.15, recAnnular: 0.20,
            minEdgeClearance: 0.20,
            minSilkWidth: 0.15, minSilkHeight: 1.0
          }
        }
      ]
    },
    {
      id: 'pcbway',
      name: 'PCBWay',
      source: 'https://www.pcbway.com/capabilities.html',
      fetched: '2026-08-24',
      layers: { min: 1, max: 14 },                   // standard 檔；advanced 到 24L
      tiers: [
        {
          maxLayers: 2,
          board: { minW: 3, minH: 3, maxW: 600, maxH: 1200 },
          rules: {
            minTrace: 0.10, minSpace: 0.10,
            minDrill: 0.15, minViaPad: null,         // 官方頁未列
            minAnnular: 0.15, recAnnular: null,
            minEdgeClearance: 0.25,                  // CNC 銑邊
            minSilkWidth: 0.15, minSilkHeight: 0.8
          }
        },
        {
          maxLayers: 14,
          board: { minW: 3, minH: 3, maxW: 560, maxH: 1150 },
          rules: {
            minTrace: 0.10, minSpace: 0.10,
            minDrill: 0.15, minViaPad: null,
            minAnnular: 0.15, recAnnular: null,
            minEdgeClearance: 0.25,
            minSilkWidth: 0.15, minSilkHeight: 0.8
          }
        }
      ]
    },
    {
      id: 'oshpark',
      name: 'OSH Park',
      source: 'https://docs.oshpark.com/services/two-layer/',
      fetched: '2026-08-24',
      layers: { min: 2, max: 4 },
      tiers: [
        {
          maxLayers: 2,
          board: { minW: 6.35, minH: 6.35, maxW: 406.4, maxH: 558.8 },
          rules: {
            minTrace: 6 * MIL, minSpace: 6 * MIL,    // 6 mil = 0.1524mm
            minDrill: 10 * MIL, minViaPad: null,     // 0.254mm
            minAnnular: 5 * MIL, recAnnular: null,   // 0.127mm
            minEdgeClearance: 15 * MIL,              // 0.381mm
            minSilkWidth: null, minSilkHeight: null  // 官方頁未列
          }
        },
        {
          maxLayers: 4,
          source: 'https://docs.oshpark.com/services/four-layer/',
          board: { minW: 6.35, minH: 6.35, maxW: 406.4, maxH: 558.8 },
          rules: {
            minTrace: 5 * MIL, minSpace: 5 * MIL,    // 0.127mm
            minDrill: 10 * MIL, minViaPad: null,
            minAnnular: 4 * MIL, recAnnular: null,   // 0.1016mm
            minEdgeClearance: 15 * MIL,
            minSilkWidth: null, minSilkHeight: null
          }
        }
      ]
    },
    {
      id: 'seeed',
      name: 'Seeed Fusion',
      source: 'https://www.seeedstudio.com/fusion_pcb.html',
      fetched: '2026-08-24',
      layers: { min: 1, max: null },                 // 頁面未列層數上限
      tiers: [
        {
          maxLayers: Infinity,
          board: { minW: null, minH: null, maxW: null, maxH: null },
          rules: {
            minTrace: 4 * MIL, minSpace: 4 * MIL,    // 0.1016mm
            minDrill: 0.2, minViaPad: null,
            minAnnular: null, recAnnular: null,
            minEdgeClearance: null,
            minSilkWidth: null, minSilkHeight: null
          }
        }
      ]
    }
  ];

  const num = v => typeof v === 'number' && isFinite(v);

  // 盲埋孔支援。四家的**一般線上下單流程**都不接（要走客製報價），所以填 false。
  // 沒查到的一律留 null 走 skipped，當「未公開」而不是「不支援」——
  // 這份檔的規矩是不憑印象填數字，這一條也一樣。
  const BLIND_SUPPORT = {
    jlcpcb: { blindBuried: false, note: 'standard online order' },
    pcbway: { blindBuried: false, note: 'standard online order' },
    seeed: { blindBuried: false, note: 'standard online order' },
    oshpark: { blindBuried: false, note: 'standard service' }
  };

  // 線段對線段最短距離。線距檢查要用，不能只比端點——兩條線可能在中段最近。
  function segSegDist(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2) {
    const ptSeg = (px, py, x1, y1, x2, y2) => {
      const dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy;
      if (l2 === 0) return Math.hypot(px - x1, py - y1);
      let t = ((px - x1) * dx + (py - y1) * dy) / l2;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
    };
    // 相交就是 0
    const d1 = (bx2 - bx1) * (ay1 - by1) - (by2 - by1) * (ax1 - bx1);
    const d2 = (bx2 - bx1) * (ay2 - by1) - (by2 - by1) * (ax2 - bx1);
    const d3 = (ax2 - ax1) * (by1 - ay1) - (ay2 - ay1) * (bx1 - ax1);
    const d4 = (ax2 - ax1) * (by2 - ay1) - (ay2 - ay1) * (bx2 - ax1);
    if (((d1 > 0) !== (d2 > 0)) && ((d3 > 0) !== (d4 > 0))) return 0;
    return Math.min(
      ptSeg(ax1, ay1, bx1, by1, bx2, by2), ptSeg(ax2, ay2, bx1, by1, bx2, by2),
      ptSeg(bx1, by1, ax1, ay1, ax2, ay2), ptSeg(bx2, by2, ax1, ay1, ax2, ay2)
    );
  }

  // 線距檢查是 O(n²)。板子大到一定程度就不硬算，誠實回報「沒算」而不是靜靜跳過。
  const SPACE_PAIR_CAP = 4000000;

  const FabProfiles = {
    list: PROFILES,
    byId(id) { return PROFILES.find(p => p.id === id) || null; },

    // 依板層數挑適用檔位；超出該廠能力回 null（呼叫端要當成「這家做不了」）
    tierFor(profile, layers) {
      const n = layers > 0 ? layers : 2;
      if (num(profile.layers.max) && n > profile.layers.max) return null;
      if (num(profile.layers.min) && n < profile.layers.min) return null;
      return profile.tiers.find(t => n <= t.maxLayers) || null;
    },

    // 純函式 DFM 檢查。回 { profile, tier, ok, findings[], skipped[] }
    //   findings: { code, severity:'error'|'warn', limit, actual, n?, ref? }
    //   skipped : 該廠未公開的規則代碼（誠實揭露覆蓋率，不是靜靜跳過）
    // padAbs 用來把 pad 換算成絕對座標；沒給就跳過 pad 相關檢查。
    check(state, profileId, padAbs) {
      const profile = this.byId(profileId);
      if (!profile) return null;
      const layers = (state.layerStack || []).filter(l => l.kind === 'copper').length
        || state.layers || 2;
      const tier = this.tierFor(profile, layers);
      if (!tier) {
        return {
          profile, tier: null, ok: false, skipped: [],
          findings: [{ code: 'layerCount', severity: 'error', limit: profile.layers.max, actual: layers }]
        };
      }
      const R = tier.rules, B = tier.board;
      const findings = [], skipped = [];
      const vias = state.vias || [];
      const need = (key, val) => { if (!num(val)) { skipped.push(key); return false; } return true; };

      // 板框尺寸
      const W = state.boardWidth || 0, H = state.boardHeight || 0;
      if (need('boardMax', B.maxW) && need('boardMaxH', B.maxH)) {
        if (W > B.maxW || H > B.maxH) {
          findings.push({ code: 'boardTooBig', severity: 'error', limit: `${B.maxW}×${B.maxH}`, actual: `${W}×${H}` });
        }
      }
      if (num(B.minW) && num(B.minH) && (W < B.minW || H < B.minH)) {
        findings.push({ code: 'boardTooSmall', severity: 'error', limit: `${B.minW}×${B.minH}`, actual: `${W}×${H}` });
      }

      // 線寬
      if (need('minTrace', R.minTrace)) {
        let worst = Infinity, n = 0, ref = null;
        for (const t of (state.traces || [])) {
          const w = t.width || 0;
          if (w > 0 && w < R.minTrace - 1e-9) { n++; if (w < worst) { worst = w; ref = t.net || ''; } }
        }
        if (n) findings.push({ code: 'traceTooThin', severity: 'error', limit: R.minTrace, actual: worst, n, ref });
      }

      // 鑽孔與環寬
      if (need('minDrill', R.minDrill)) {
        let worst = Infinity, n = 0;
        for (const v of vias) { const d = v.id || v.drill || 0; if (d > 0 && d < R.minDrill - 1e-9) { n++; worst = Math.min(worst, d); } }
        if (n) findings.push({ code: 'drillTooSmall', severity: 'error', limit: R.minDrill, actual: worst, n });
      }
      if (need('minAnnular', R.minAnnular)) {
        let worst = Infinity, nErr = 0, nWarn = 0;
        for (const v of vias) {
          const od = v.od || 0, id = v.id || v.drill || 0;
          if (!(od > 0 && id > 0)) continue;
          const ring = (od - id) / 2;
          if (ring < R.minAnnular - 1e-9) { nErr++; worst = Math.min(worst, ring); }
          else if (num(R.recAnnular) && ring < R.recAnnular - 1e-9) { nWarn++; worst = Math.min(worst, ring); }
        }
        if (nErr) findings.push({ code: 'annularTooThin', severity: 'error', limit: R.minAnnular, actual: worst, n: nErr });
        else if (nWarn) findings.push({ code: 'annularBelowRec', severity: 'warn', limit: R.recAnnular, actual: worst, n: nWarn });
      }

      // 線距（同層、異 net）
      if (need('minSpace', R.minSpace)) {
        const tr = (state.traces || []).filter(t => (t.width || 0) > 0);
        if (tr.length * tr.length > SPACE_PAIR_CAP) {
          skipped.push('minSpace:tooManyTraces');
        } else {
          let worst = Infinity, n = 0;
          for (let i = 0; i < tr.length; i++) {
            const a = tr[i], la = a.layer || 'F.Cu', ha = (a.width || 0) / 2;
            for (let j = i + 1; j < tr.length; j++) {
              const b = tr[j];
              if ((b.layer || 'F.Cu') !== la) continue;
              if (a.net && b.net && a.net === b.net) continue;
              const hb = (b.width || 0) / 2;
              // 包圍盒先擋掉絕大多數配對，省掉精算
              const room = R.minSpace + ha + hb;
              if (Math.min(a.x1, a.x2) - Math.max(b.x1, b.x2) > room) continue;
              if (Math.min(b.x1, b.x2) - Math.max(a.x1, a.x2) > room) continue;
              if (Math.min(a.y1, a.y2) - Math.max(b.y1, b.y2) > room) continue;
              if (Math.min(b.y1, b.y2) - Math.max(a.y1, a.y2) > room) continue;
              const gap = segSegDist(a.x1, a.y1, a.x2, a.y2, b.x1, b.y1, b.x2, b.y2) - ha - hb;
              if (gap < R.minSpace - 1e-9) { n++; worst = Math.min(worst, gap); }
            }
          }
          if (n) findings.push({ code: 'spaceTooTight', severity: 'error', limit: R.minSpace, actual: Math.max(0, worst), n });
        }
      }

      // via 焊環外徑（有些廠只給這項、不給環寬）
      if (need('minViaPad', R.minViaPad)) {
        let worst = Infinity, n = 0;
        for (const v of vias) { const od = v.od || 0; if (od > 0 && od < R.minViaPad - 1e-9) { n++; worst = Math.min(worst, od); } }
        if (n) findings.push({ code: 'viaPadTooSmall', severity: 'error', limit: R.minViaPad, actual: worst, n });
      }

      // 盲埋孔：板廠做不做得了
      {
        const spans = new Set();
        const cuIds = (state.layerStack || []).filter(l => l.kind === 'copper').map(l => l.id);
        (state.vias || []).forEach(v => {
          if (!v.from || !v.to) return;
          const a = cuIds.indexOf(v.from), b = cuIds.indexOf(v.to);
          if (a < 0 || b < 0) return;
          if (a === 0 && b === cuIds.length - 1) return;      // 這其實是穿孔
          spans.add(v.from + '-' + v.to);
        });
        if (spans.size) {
          const sup = BLIND_SUPPORT[profile.id];
          if (sup && sup.blindBuried === false)
            findings.push({ code: 'blindBuriedUnsupported', severity: 'error', n: spans.size, actual: [...spans].join(', ') });
          else if (!sup) skipped.push('blindBuried');
        }
      }

      // 銅到板邊
      if (need('minEdgeClearance', R.minEdgeClearance) && W > 0 && H > 0) {
        const hw = W / 2, hh = H / 2;
        const gap = (x, y) => Math.min(hw - Math.abs(x), hh - Math.abs(y));
        let worst = Infinity, n = 0;
        const hit = g => { if (g < R.minEdgeClearance - 1e-9) { n++; worst = Math.min(worst, g); } };
        for (const t of (state.traces || [])) {
          const half = (t.width || 0) / 2;
          hit(gap(t.x1, t.y1) - half); hit(gap(t.x2, t.y2) - half);
        }
        if (typeof padAbs === 'function') {
          for (const c of (state.components || [])) for (const p of (c.pads || [])) {
            if (p.cu === false) continue;
            const a = padAbs(c, p);
            hit(gap(a.x, a.y) - Math.max(p.w || 0, p.h || 0) / 2);
          }
        }
        for (const v of vias) hit(gap(v.x, v.y) - (v.od || 0) / 2);
        if (n) findings.push({ code: 'edgeClearance', severity: 'error', limit: R.minEdgeClearance, actual: worst, n });
      }

      // 絲印
      if (need('minSilkHeight', R.minSilkHeight)) {
        let worst = Infinity, n = 0;
        for (const t of (state.texts || [])) { const s = t.size || 0; if (s > 0 && s < R.minSilkHeight - 1e-9) { n++; worst = Math.min(worst, s); } }
        if (n) findings.push({ code: 'silkTooSmall', severity: 'error', limit: R.minSilkHeight, actual: worst, n });
      }

      return {
        profile, tier, findings, skipped,
        ok: findings.every(f => f.severity !== 'error')
      };
    },

    /**
     * 縫合壞接點用的 padstack 梯子：從 start 一階一階往小試。
     *
     * 為什麼要有梯子：密腳區（BGA／QFN／B2B）放不下預設的 0.7/0.3，不代表沒救——
     * 真實 layout 在那裡就是換更小的孔。但「更小」有底線：板廠做不出來的孔
     * 只是把「繞不過」換成「打樣退件」，所以下限一律取這一家的能力檔
     * （minDrill / minAnnular / minViaPad），不自己編一個數字。
     *
     * 回 [{od, drill}]，大的排前面——先試撐得住的，撐不住才縮。
     * 板層數超出這家能力（tierFor 回 null）時只回 start：那種情況該報「這家做不了」，
     * 不是偷偷用一組不知道哪來的下限。
     */
    viaLadder(profileId, layers, start) {
      const s = (start && start.drill > 0 && start.od > 0) ? { od: start.od, drill: start.drill } : { od: 0.7, drill: 0.3 };
      const profile = this.byId(profileId);
      const tier = profile ? this.tierFor(profile, layers) : null;
      if (!tier) return [s];
      const R = tier.rules || {};
      const minDrill = num(R.minDrill) ? R.minDrill : s.drill;
      const minAnn = num(R.minAnnular) ? R.minAnnular : (s.od - s.drill) / 2;
      const minPad = num(R.minViaPad) ? R.minViaPad : 0;
      const out = [];
      const push = (od, drill) => {
        od = +od.toFixed(3); drill = +drill.toFixed(3);
        if (drill < minDrill - 1e-9) return;
        if ((od - drill) / 2 < minAnn - 1e-9) return;
        if (minPad && od < minPad - 1e-9) return;
        if (out.some(v => v.od === od && v.drill === drill)) return;
        out.push({ od, drill });
      };
      push(s.od, s.drill);
      // 兩條路徑：先只縮孔、環寬照舊（機械強度不變），再連環寬一起降到板廠下限。
      const ann0 = Math.max(minAnn, (s.od - s.drill) / 2);
      for (let d = s.drill - 0.05; d >= minDrill - 1e-9; d -= 0.05) push(d + 2 * ann0, d);
      for (let d = s.drill; d >= minDrill - 1e-9; d -= 0.05) push(d + 2 * minAnn, d);
      return out.sort((a, b) => (b.od - a.od) || (b.drill - a.drill));
    },

    // ---- 選定板廠（單一真相來源：DRC 面板與匯出閘門都讀這裡）----
    SEL_KEY: 'vs-fab-sel-v1',
    selectedId() {
      try {
        const v = (typeof localStorage !== 'undefined') && localStorage.getItem(this.SEL_KEY);
        if (v && this.byId(v)) return v;
      } catch (e) { }
      return PROFILES[0].id;
    },
    select(id) {
      if (!this.byId(id)) return false;
      try { if (typeof localStorage !== 'undefined') localStorage.setItem(this.SEL_KEY, id); } catch (e) { }
      return true;
    },

    // 能力數字會改版。超過 months 個月沒重抓就標過期，提醒回官方頁對照，
    // 不要讓使用者拿著一份不知道多舊的規格去下單。
    isStale(profile, months, now) {
      const m = num(months) ? months : 12;
      const t = Date.parse((profile.fetched || '') + 'T00:00:00Z');
      if (isNaN(t)) return true;
      const ref = now ? +now : Date.now();
      return (ref - t) > m * 30.44 * 24 * 3600 * 1000;
    },

    // 板廠規則 → DRC 面板欄位。未公開的回 null，呼叫端要保留原值而不是填 0。
    drcRulesFor(profileId, layers) {
      const profile = this.byId(profileId);
      if (!profile) return null;
      const tier = this.tierFor(profile, layers);
      if (!tier) return null;
      const R = tier.rules;
      // mil 換算出來的值會有浮點尾巴（6mil → 0.15239999999999998），
      // 直接塞進 DRC 欄位會讓使用者看到一串沒有意義的位數。板廠規格本來就只到 4 位。
      const r4 = v => num(v) ? Math.round(v * 10000) / 10000 : null;
      return {
        clearance: r4(R.minSpace),
        minTrace: r4(R.minTrace),
        edge: r4(R.minEdgeClearance)
      };
    },

    // 一次比所有廠：回陣列，能做的排前面、error 少的排前面
    compare(state, padAbs) {
      return PROFILES
        .map(p => this.check(state, p.id, padAbs))
        .filter(Boolean)
        .sort((a, b) => {
          // 排序刻意「不」以 error 數為第一鍵：公開規格越少的廠，可檢查的點就越少，
          // 錯誤數自然低，排上去會讓人誤以為它最寬鬆（Seeed 沒公開環寬/板邊就是這種情形）。
          // 所以先分可否製造，再看揭露完整度（skipped 少＝這個判定比較可信），最後才比 error 數。
          if (a.ok !== b.ok) return a.ok ? -1 : 1;
          if (a.skipped.length !== b.skipped.length) return a.skipped.length - b.skipped.length;
          const ea = a.findings.filter(f => f.severity === 'error').length;
          const eb = b.findings.filter(f => f.severity === 'error').length;
          return ea - eb;
        });
    }
  };

  // ---------------- UI ----------------
  const T = (k, v) => (typeof window !== 'undefined' && window.I18N) ? window.I18N.t(k, v) : k;
  const esc = t => String(t == null ? '' : t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const mm = v => (typeof v === 'number' && isFinite(v)) ? (Math.round(v * 1000) / 1000) : v;

  function describe(f) {
    return T('fab_' + f.code, { limit: mm(f.limit), actual: mm(f.actual), n: f.n || 1 });
  }

  function renderResults() {
    const out = document.getElementById('fabOut');
    if (!out || typeof window.pcbApp === 'undefined') return;
    const st = pcbApp.state;
    const nothing = !(st.traces || []).length && !(st.vias || []).length && !(st.boardWidth > 0);
    if (nothing) { out.innerHTML = '<div style="font-size:12px;opacity:.75">' + esc(T('fab_none')) + '</div>'; return; }

    const rows = FabProfiles.compare(st, pcbApp.padAbs ? pcbApp.padAbs.bind(pcbApp) : null);
    out.innerHTML = rows.map(r => {
      const errs = r.findings.filter(f => f.severity === 'error');
      const badge = errs.length
        ? '<span style="color:var(--danger,#e74c3c);font-weight:700">\u2716 ' + esc(T('fab_blocked', { n: errs.length })) + '</span>'
        : '<span style="color:var(--accent-strong);font-weight:700">\u2714 ' + esc(T('fab_ok')) + '</span>';
      const skip = r.skipped.length
        ? '<span style="opacity:.7;font-size:11px;margin-left:8px">' + esc(T('fab_skipped', { n: r.skipped.length })) + '</span>' : '';
      const items = r.findings.map(f =>
        '<li style="margin:2px 0;color:' + (f.severity === 'error' ? 'var(--danger,#e74c3c)' : 'var(--warn,#e67e22)') + '">'
        + esc(describe(f)) + '</li>').join('');
      const src = (r.tier && r.tier.source) || r.profile.source;
      return '<div style="border:1px solid var(--line);border-radius:8px;padding:8px;margin-bottom:6px">'
        + '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">'
        + '<strong style="font-size:13px">' + esc(r.profile.name) + (r.profile.id === FabProfiles.selectedId() ? ' ★' : '') + '</strong>' + badge + skip + '</div>'
        + (items ? '<ul style="margin:6px 0 0 16px;padding:0;font-size:12px">' + items + '</ul>' : '')
        + '<div style="margin-top:6px;font-size:11px;opacity:.65">'
        + esc(T('fab_src', { url: src, date: r.profile.fetched })) + '</div></div>';
    }).join('');
  }

  function layersOf(st) {
    return (st.layerStack || []).filter(l => l.kind === 'copper').length || st.layers || 2;
  }

  function renderSelector() {
    const sel = document.getElementById('fabSel');
    if (!sel) return;
    const cur = FabProfiles.selectedId();
    sel.innerHTML = FabProfiles.list
      .map(p => '<option value="' + esc(p.id) + '"' + (p.id === cur ? ' selected' : '') + '>' + esc(p.name) + '</option>')
      .join('');
    renderStale();
  }

  function renderStale() {
    const el = document.getElementById('fabStale');
    if (!el) return;
    const p = FabProfiles.byId(FabProfiles.selectedId());
    el.textContent = (p && FabProfiles.isStale(p)) ? T('fab_stale', { date: p.fetched }) : '';
  }

  // 板廠規則 → DRC 面板。未公開的欄位保留原值，並把「有幾項沒填」講出來，
  // 不然使用者會以為 DRC 已經完全照該廠設定，其實有幾條還是舊的。
  function applyToDrc() {
    const st = window.pcbApp ? pcbApp.state : null;
    if (!st) return;
    const id = FabProfiles.selectedId();
    const prof = FabProfiles.byId(id);
    const layers = layersOf(st);
    const r = FabProfiles.drcRulesFor(id, layers);
    const toast = (m, k) => { if (window.pcbApp && pcbApp.toast) pcbApp.toast(m, k || 'info'); };
    if (!r) { toast(T('fab_apply_fail', { layers, name: prof.name }), 'warn'); return; }
    const set = (elId, v) => {
      if (v == null) return false;
      const el = document.getElementById(elId);
      if (!el) return false;
      el.value = v;
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    };
    const missing = ['clearance', 'minTrace', 'edge'].filter(k => r[k] == null).length;
    set('ruleClearance', r.clearance);
    set('ruleMinTrace', r.minTrace);
    set('ruleEdge', r.edge);
    const u = v => (v == null ? '\u2014' : v + 'mm');   // 未公開就只給破折號，不要變成「\u2014mm」
    toast(T('fab_applied', {
      name: prof.name, space: u(r.clearance), trace: u(r.minTrace), edge: u(r.edge)
    }) + (missing ? ' ' + T('fab_apply_partial', { n: missing }) : ''), missing ? 'warn' : 'info');
  }

  if (typeof window !== 'undefined') {
    const bind = () => {
      const sel = document.getElementById('fabSel');
      if (sel && !sel._fabBound) {
        sel._fabBound = true;
        sel.addEventListener('change', () => {
          FabProfiles.select(sel.value);
          renderStale();
          if (document.getElementById('fabOut').innerHTML.trim()) renderResults();
        });
      }
      renderSelector();
      const ap = document.getElementById('fabApplyDrc');
      if (ap && !ap._fabBound) { ap._fabBound = true; ap.addEventListener('click', applyToDrc); }
      const btn = document.getElementById('fabRun');
      if (btn && !btn._fabBound) { btn._fabBound = true; btn.addEventListener('click', renderResults); }
      const hint = document.getElementById('fabHint');
      if (hint) hint.textContent = T('fab_hint');
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind); else bind();
    // \u5207\u8a9e\u8a00\uff1a\u63d0\u793a\u53e5\u8207\u5df2\u7522\u51fa\u7684\u7d50\u679c\u90fd\u8981\u91cd\u8cbc
    document.addEventListener('vs-lang-change', () => {
      bind();
      if (document.getElementById('fabOut') && document.getElementById('fabOut').innerHTML.trim()) renderResults();
    });
    window.FabProfilesUI = { render: renderResults, applyToDrc, renderSelector };
  }

  if (typeof window !== 'undefined') window.FabProfiles = FabProfiles;
  if (typeof module !== 'undefined' && module.exports) module.exports = { FabProfiles };
})();
