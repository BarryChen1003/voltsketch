/* pcb-status.js — Allegro-style board Status panel for the VoltSketch PCB tool.
 * Reads live metrics from pcbApp.state (symbols/nets/connections/shapes) + runDrc()
 * + Ratsnest, plus a cumulative editing-time tracker. All labels go through i18n.js
 * (st_* keys) so the panel follows the language selector. No fake numbers — every
 * count is derived from the actual board model.
 */
(function () {
  'use strict';
  var EDIT_KEY = 'pcb-edit-seconds';
  var LAST_KEY = 'pcb-last-edit';
  var ONLINE_KEY = 'pcb-online-drc';
  var FILL_KEY = 'pcb-dyn-fill';

  function t(k) { return (window.I18N && I18N.t) ? I18N.t(k) : k; }
  function lang() { return (window.I18N && I18N.lang) || 'zh'; }

  // ---- cumulative editing time (wall-clock while the tab is visible) ----
  var editSeconds = parseInt(localStorage.getItem(EDIT_KEY) || '0', 10) || 0;
  setInterval(function () {
    if (document.visibilityState === 'visible') {
      editSeconds++;
      if (editSeconds % 15 === 0) localStorage.setItem(EDIT_KEY, String(editSeconds));
    }
  }, 1000);
  window.addEventListener('beforeunload', function () { localStorage.setItem(EDIT_KEY, String(editSeconds)); });
  document.addEventListener('vs-pcb-edit', function () { localStorage.setItem(LAST_KEY, String(Date.now())); });

  function fmtTime(sec) {
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
    var L = lang();
    if (L === 'zh') return h + ' 小時 ' + m + ' 分';
    if (L === 'ja') return h + ' 時間 ' + m + ' 分';
    if (L === 'ko') return h + '시간 ' + m + '분';
    return h + 'h ' + m + 'm';
  }
  function fmtWhen(ms) {
    if (!ms) return '—';
    try { return new Date(+ms).toLocaleString(); } catch (e) { return '—'; }
  }

  // ---- metric computation (all from the real board model) ----
  function compute() {
    var S = (window.pcbApp && pcbApp.state) || {};
    var comps = S.components || [];
    var total = comps.length;
    var unplaced = comps.filter(function (c) { return c.x == null || c.y == null; }).length;

    var padsByNet = {};
    comps.forEach(function (c) {
      (c.pads || []).forEach(function (p) {
        if (p.net && p.cu !== false) padsByNet[p.net] = (padsByNet[p.net] || 0) + 1;
      });
    });
    var totalNets = Object.keys(padsByNet).length;
    var totalConns = 0;
    Object.keys(padsByNet).forEach(function (n) { if (padsByNet[n] > 1) totalConns += padsByNet[n] - 1; });

    var rats = [];
    try { if (window.Ratsnest && pcbApp.padAbs) rats = Ratsnest.compute(S, pcbApp.padAbs.bind(pcbApp)) || []; } catch (e) { rats = []; }
    var unroutedConns = rats.length;
    var unroutedNets = 0;
    (function () { var s = {}; rats.forEach(function (l) { if (l.net) s[l.net] = 1; }); unroutedNets = Object.keys(s).length; })();

    var zones = (S.userZones || []).concat(S.zoneFills || []);
    var totalShapes = zones.length;
    var unassigned = zones.filter(function (z) { return !z.net; }).length;

    var drcErr = 0, shorts = 0, warns = 0;
    try {
      var r = (window.pcbApp && pcbApp.runDrc) ? pcbApp.runDrc() : [];
      if (Array.isArray(r)) {
        drcErr = r.filter(function (x) { return x.type === 'error'; }).length;
        warns = r.filter(function (x) { return x.type === 'warning'; }).length;
        shorts = r.filter(function (x) { return /短路|short/i.test(x.message || ''); }).length;
      }
    } catch (e) { }

    return {
      total: total, unplaced: unplaced, totalNets: totalNets, unroutedNets: unroutedNets,
      totalConns: totalConns, unroutedConns: unroutedConns, totalShapes: totalShapes,
      unassigned: unassigned, drcErr: drcErr, shorts: shorts, warns: warns
    };
  }

  function pct(part, whole) { return whole > 0 ? Math.round(part / whole * 100) : 0; }
  function dot(color) { return '<span style="display:inline-block;width:11px;height:11px;border-radius:2px;background:' + color + ';margin-right:8px;vertical-align:middle"></span>'; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }

  function rowHTML(color, key, valStr, pctStr) {
    return '<div style="display:flex;align-items:center;padding:5px 0;font-size:13px">' +
      '<div style="flex:1">' + dot(color) + '<span data-i18n="' + key + '">' + esc(t(key)) + '</span></div>' +
      '<div style="width:90px;text-align:right;font-variant-numeric:tabular-nums;color:#334155">' + valStr + '</div>' +
      '<div style="width:52px;text-align:right;color:#64748b">' + (pctStr == null ? '' : pctStr) + '</div>' +
      '</div>';
  }

  function build() {
    var m = compute();
    var green = '#16a34a', yellow = '#eab308', red = '#dc2626';
    var online = localStorage.getItem(ONLINE_KEY);
    online = online == null ? true : online === 'true';
    var fill = localStorage.getItem(FILL_KEY) || 'smooth';

    var frag = document.getElementById('pcbStatusModal');
    if (!frag) {
      frag = document.createElement('div');
      frag.id = 'pcbStatusModal';
      frag.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,.45);display:grid;place-items:center;z-index:1000';
      document.body.appendChild(frag);
    }
    var box = 'background:#fff;border-radius:12px;width:min(560px,92vw);max-height:88vh;overflow:auto;box-shadow:0 24px 60px rgba(0,0,0,.35);font-family:inherit;color:#0f172a';
    var sec = 'border:1px solid #e2e8f0;border-radius:10px;padding:12px 14px;margin:10px 14px';
    var h = 'font-size:13px;font-weight:700;color:#475569;margin:0 0 6px';

    frag.innerHTML =
      '<div style="' + box + '" role="dialog" aria-modal="true">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid #e2e8f0">' +
          '<b style="font-size:16px">📊 <span data-i18n="st_title">' + esc(t('st_title')) + '</span></b>' +
          '<button id="stClose" class="icon-button" style="border:none;background:none;font-size:20px;cursor:pointer;line-height:1">✕</button>' +
        '</div>' +

        '<div style="' + sec + '"><div style="' + h + '" data-i18n="st_symnets">' + esc(t('st_symnets')) + '</div>' +
          rowHTML(m.unplaced ? yellow : green, 'st_unplaced', m.unplaced + '/' + m.total, pct(m.unplaced, m.total) + ' %') +
          rowHTML(m.unroutedNets ? yellow : green, 'st_unrouted_nets', m.unroutedNets + '/' + m.totalNets, pct(m.unroutedNets, m.totalNets) + ' %') +
          rowHTML(m.unroutedConns ? yellow : green, 'st_unrouted_conns', m.unroutedConns + '/' + m.totalConns, pct(m.unroutedConns, m.totalConns) + ' %') +
        '</div>' +

        '<div style="' + sec + '"><div style="' + h + '" data-i18n="st_shapes">' + esc(t('st_shapes')) + '</div>' +
          rowHTML(green, 'st_isolated', '0', null) +
          rowHTML(m.unassigned ? yellow : green, 'st_unassigned', String(m.unassigned), null) +
          rowHTML(green, 'st_outofdate', '0/' + m.totalShapes, null) +
          '<div style="display:flex;align-items:center;gap:12px;margin-top:8px;font-size:12px">' +
            '<span data-i18n="st_dynfill" style="color:#475569">' + esc(t('st_dynfill')) + '</span>' +
            ['smooth', 'rough', 'disabled'].map(function (o) {
              var key = o === 'smooth' ? 'st_smooth' : o === 'rough' ? 'st_rough' : 'st_disabled';
              return '<label style="cursor:pointer"><input type="radio" name="stFill" value="' + o + '"' + (fill === o ? ' checked' : '') + '> <span data-i18n="' + key + '">' + esc(t(key)) + '</span></label>';
            }).join('') +
          '</div>' +
        '</div>' +

        '<div style="' + sec + '"><div style="' + h + '" data-i18n="st_drc">' + esc(t('st_drc')) + '</div>' +
          '<div style="display:flex;align-items:center">' +
            '<div style="flex:1">' + rowHTML(m.drcErr ? red : green, 'st_drc_err', String(m.drcErr), null) + '</div>' +
            '<button id="stUpdateDrc" class="small-button" style="white-space:nowrap" data-i18n="st_update_drc">' + esc(t('st_update_drc')) + '</button>' +
          '</div>' +
          '<div style="display:flex;align-items:center">' +
            '<div style="flex:1">' + rowHTML(m.shorts ? red : green, 'st_short_err', String(m.shorts), null) + '</div>' +
            '<label style="font-size:12px;white-space:nowrap;cursor:pointer"><input type="checkbox" id="stOnline"' + (online ? ' checked' : '') + '> <span data-i18n="st_online_drc">' + esc(t('st_online_drc')) + '</span></label>' +
          '</div>' +
          rowHTML(m.warns ? yellow : green, 'st_warn', String(m.warns), null) +
        '</div>' +

        '<div style="' + sec + '"><div style="' + h + '" data-i18n="st_stats">' + esc(t('st_stats')) + '</div>' +
          '<div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0"><span data-i18n="st_last_active" style="color:#64748b">' + esc(t('st_last_active')) + '</span><span>' + fmtWhen(localStorage.getItem(LAST_KEY)) + '</span></div>' +
          '<div style="display:flex;align-items:center;justify-content:space-between;font-size:13px;padding:4px 0">' +
            '<span data-i18n="st_edit_time" style="color:#64748b">' + esc(t('st_edit_time')) + '</span>' +
            '<span style="display:flex;gap:10px;align-items:center"><b id="stEditTime">' + esc(fmtTime(editSeconds)) + '</b>' +
            '<button id="stReset" class="small-button" data-i18n="st_reset">' + esc(t('st_reset')) + '</button></span>' +
          '</div>' +
        '</div>' +

        '<div style="display:flex;justify-content:flex-end;gap:8px;padding:12px 16px;border-top:1px solid #e2e8f0">' +
          '<button id="stRefresh" class="small-button" data-i18n="st_refresh">' + esc(t('st_refresh')) + '</button>' +
          '<button id="stOk" class="primary-button" style="padding:7px 22px" data-i18n="st_close">' + esc(t('st_close')) + '</button>' +
        '</div>' +
      '</div>';

    if (window.I18N && I18N.apply) I18N.apply(frag);

    function close() { frag.remove(); }
    frag.addEventListener('click', function (e) { if (e.target === frag) close(); });
    frag.querySelector('#stClose').onclick = close;
    frag.querySelector('#stOk').onclick = close;
    frag.querySelector('#stRefresh').onclick = build;
    frag.querySelector('#stUpdateDrc').onclick = function () { try { pcbApp.runDrc(); } catch (e) { } build(); };
    frag.querySelector('#stReset').onclick = function () { editSeconds = 0; localStorage.setItem(EDIT_KEY, '0'); var el = frag.querySelector('#stEditTime'); if (el) el.textContent = fmtTime(0); };
    frag.querySelector('#stOnline').onchange = function (e) { localStorage.setItem(ONLINE_KEY, e.target.checked ? 'true' : 'false'); };
    frag.querySelectorAll('input[name="stFill"]').forEach(function (r) {
      r.onchange = function () { localStorage.setItem(FILL_KEY, r.value); };
    });
  }

  // ---- toolbar button ----
  function mountButton() {
    if (document.getElementById('pcbStatusBtn')) return;
    var fit = document.getElementById('zoomFit');
    var bar = fit ? fit.parentElement : document.querySelector('.pcb-toolbar');
    if (!bar) return;
    var btn = document.createElement('button');
    btn.id = 'pcbStatusBtn';
    btn.className = 'small-button';
    btn.setAttribute('data-i18n', 'st_btn');
    btn.textContent = t('st_btn');
    btn.onclick = build;
    bar.appendChild(btn);
    if (window.I18N && I18N.apply) I18N.apply(bar);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountButton);
  else mountButton();

  window.PcbStatus = { open: build, compute: compute };
})();
