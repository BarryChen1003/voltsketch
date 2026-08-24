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
      const vias = state.vias || [];
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
        + '<strong style="font-size:13px">' + esc(r.profile.name) + '</strong>' + badge + skip + '</div>'
        + (items ? '<ul style="margin:6px 0 0 16px;padding:0;font-size:12px">' + items + '</ul>' : '')
        + '<div style="margin-top:6px;font-size:11px;opacity:.65">'
        + esc(T('fab_src', { url: src, date: r.profile.fetched })) + '</div></div>';
    }).join('');
  }

  if (typeof window !== 'undefined') {
    const bind = () => {
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
    window.FabProfilesUI = { render: renderResults };
  }

  if (typeof window !== 'undefined') window.FabProfiles = FabProfiles;
  if (typeof module !== 'undefined' && module.exports) module.exports = { FabProfiles };
})();
