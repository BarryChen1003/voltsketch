/**
 * sch-spice-ui.js — 線路圖頁的「內建模擬」面板
 *
 * 三層都在別的地方：數值在 spice.js、轉換在 sch-spice.js、這支只有 DOM。
 *
 * 跟既有的兩條模擬路線的關係：
 *   「模擬」按鈕（app.runSimulation）—— 單迴路估算，不看拓樸，留著不動。
 *   Falstad 外連 —— 把電路丟到外部網站跑，留著不動。
 *   這個面板 —— 內建 MNA，並聯／多迴路／橋式都算得出來，DC/瞬態/AC 三種。
 * 三條並存，因為前兩條各有各的用處（快、以及有完整元件庫）。
 *
 * 波形用 SVG 畫。理由跟封裝預覽一樣：不必管 canvas 的 DPI 與尺寸同步，
 * 而且滑鼠移上去要顯示數值時 SVG 直接算得出座標。
 */
(function () {
  'use strict';

  const T = (k, v) => (window.I18N ? window.I18N.t(k, v) : k);
  const A = () => (typeof app !== 'undefined' ? app : null);
  const el = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const COLORS = ['#eab308', '#22d3ee', '#e879f9', '#4ade80', '#f87171', '#a78bfa'];

  function msg(html) { const o = el('spOut'); if (o) o.innerHTML = html; }
  function warn(txt) { return '<div style="color:#d35400">' + esc(txt) + '</div>'; }
  function err(txt) { return '<div style="color:#c0392b">' + esc(txt) + '</div>'; }

  // 網表的問題一律顯示，**成功的時候也要顯示**。
  // 沒接地時 dcOp 會靠 Gmin 撐住而「收斂」成全 0V，r.ok 是 true——
  // 只在失敗時才報警告的話，使用者會看到一整排 0.0µV 而沒有任何線索。
  function netWarnings(r) {
    const nl = r.netlist || {};
    const bits = [];
    for (const w of (nl.warnings || [])) {
      if (w === 'no_ground') bits.push(err(T('pj_sp_no_ground')));
      else if (w === 'no_source') bits.push(warn(T('pj_sp_no_source')));
    }
    return bits.join('');
  }

  // 網表沒轉成功的共同處理：把「為什麼不能跑」講清楚，而不是丟一句失敗
  function explain(r) {
    const nl = r.netlist || {};
    const bits = [];
    if (r.reason === 'unsupported') {
      bits.push(err(T('pj_sp_unsupported', {
        list: nl.unsupported.map(u => (u.label || u.type)).slice(0, 6).join(', '),
      })));
      bits.push(warn(T('pj_sp_unsupported_why')));
    } else if (r.reason === 'empty') {
      bits.push(warn(T('pj_sp_empty')));
    }
    return bits.join('') + netWarnings(r);
  }

  // 收斂失敗也要講清楚。回傳一組數字然後裝作沒事，是這類工具最糟的行為。
  function convergeNote(res) {
    if (!res || res.converged) return '';
    const w = (res.warnings || []).join(', ');
    return err(T('pj_sp_no_converge', { why: w || '?' }));
  }

  const fmtV = v => (Math.abs(v) >= 1 ? v.toFixed(3) + 'V'
    : Math.abs(v) >= 1e-3 ? (v * 1e3).toFixed(2) + 'mV' : (v * 1e6).toFixed(1) + 'µV');

  function runDc() {
    const a = A();
    if (!a || !window.SchSpice) return;
    const r = window.SchSpice.dc(a.state.components, a.state.wires, window.CircuitEngine);
    if (!r.ok && r.reason) { msg(explain(r)); return; }
    const bits = [netWarnings(r), convergeNote(r.result)];
    if (r.result.converged) {
      const rows = Object.entries(r.result.nodes)
        .filter(([n]) => n !== '0')
        .sort((x, y) => x[0].localeCompare(y[0]));
      bits.push('<div style="font-weight:600">' + esc(T('pj_sp_dc_title', { n: rows.length })) + '</div>');
      bits.push('<div style="display:grid;grid-template-columns:auto 1fr;gap:2px 8px;font-family:monospace">' +
        rows.map(([n, v]) => '<span>' + esc(n) + '</span><span>' + esc(fmtV(v)) + '</span>').join('') +
        '</div>');
      // 電源電流也很有用（看功耗），有幾支就列幾支
      const br = Object.entries(r.result.branches || {});
      if (br.length) {
        bits.push('<div style="color:var(--muted);margin-top:4px">' + esc(T('pj_sp_branch')) + '</div>');
        bits.push('<div style="font-family:monospace">' + br.map(([k, v]) =>
          esc(k + ': ' + (Math.abs(v) >= 1e-3 ? (v * 1e3).toFixed(3) + 'mA' : (v * 1e6).toFixed(1) + 'µA'))).join('<br>') + '</div>');
      }
    }
    msg(bits.join(''));
  }

  // t/f 軸與 y 軸都自動縮放。固定範圍會讓小訊號變成一條平線。
  function plot(xs, series, opts) {
    const o = opts || {};
    const W = 300, H = 140, ml = 44, mr = 6, mt = 8, mb = 20;
    if (!xs.length) return '';
    const names = Object.keys(series);
    let ymin = Infinity, ymax = -Infinity;
    for (const n of names) for (const v of series[n]) { if (v < ymin) ymin = v; if (v > ymax) ymax = v; }
    if (!isFinite(ymin) || !isFinite(ymax)) return '';
    if (ymax - ymin < 1e-12) { ymax += 1; ymin -= 1; }
    const pad = (ymax - ymin) * 0.08;
    ymin -= pad; ymax += pad;

    const xlog = !!o.logX;
    const x0 = xlog ? Math.log10(Math.max(xs[0], 1e-12)) : xs[0];
    const x1 = xlog ? Math.log10(Math.max(xs[xs.length - 1], 1e-12)) : xs[xs.length - 1];
    const px = i => {
      const v = xlog ? Math.log10(Math.max(xs[i], 1e-12)) : xs[i];
      return ml + ((v - x0) / ((x1 - x0) || 1)) * (W - ml - mr);
    };
    const py = v => mt + (1 - (v - ymin) / (ymax - ymin)) * (H - mt - mb);

    const parts = [];
    parts.push('<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="#0f1720"/>');
    // 零線畫出來，看正負很重要
    if (ymin < 0 && ymax > 0) {
      parts.push('<line x1="' + ml + '" y1="' + py(0) + '" x2="' + (W - mr) + '" y2="' + py(0) +
        '" stroke="#3a4a5a" stroke-width="1"/>');
    }
    parts.push('<line x1="' + ml + '" y1="' + mt + '" x2="' + ml + '" y2="' + (H - mb) + '" stroke="#3a4a5a"/>');
    parts.push('<line x1="' + ml + '" y1="' + (H - mb) + '" x2="' + (W - mr) + '" y2="' + (H - mb) + '" stroke="#3a4a5a"/>');
    parts.push('<text x="2" y="' + (mt + 8) + '" fill="#8aa" font-size="9">' + (o.fmtY || (v => v.toFixed(2)))(ymax) + '</text>');
    parts.push('<text x="2" y="' + (H - mb) + '" fill="#8aa" font-size="9">' + (o.fmtY || (v => v.toFixed(2)))(ymin) + '</text>');
    parts.push('<text x="' + ml + '" y="' + (H - 6) + '" fill="#8aa" font-size="9">' + (o.fmtX || (v => String(v)))(xs[0]) + '</text>');
    parts.push('<text x="' + (W - mr - 40) + '" y="' + (H - 6) + '" fill="#8aa" font-size="9">' + (o.fmtX || (v => String(v)))(xs[xs.length - 1]) + '</text>');

    names.forEach((n, k) => {
      const d = series[n].map((v, i) => (i ? 'L' : 'M') + px(i).toFixed(1) + ' ' + py(v).toFixed(1)).join(' ');
      parts.push('<path d="' + d + '" fill="none" stroke="' + COLORS[k % COLORS.length] + '" stroke-width="1.2"/>');
    });
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" style="max-width:320px">' + parts.join('') + '</svg>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;font-size:11px;margin-top:2px">' +
      names.map((n, k) => '<span style="color:' + COLORS[k % COLORS.length] + '">■ ' + esc(n) + '</span>').join('') +
      '</div>';
  }

  // 節點多的時候全畫會變成一團。只取前幾條，並說明取了哪幾條。
  function pick(nodes, limit) {
    const names = Object.keys(nodes).filter(n => n !== '0').sort();
    return names.slice(0, limit || 4);
  }

  function runTran() {
    const a = A();
    if (!a || !window.SchSpice) return;
    const stop = parseFloat((el('spStop') || {}).value) || 1e-3;

    // 激勵訊號。沒有這個的話，DC 電壓源在瞬態下就是一個常數，
    // 電容早在工作點就充飽了——畫出來是一條完全水平的線，
    // 使用者會以為功能壞了。SPICE 的 .tran 一定要搭配 PULSE/SIN 就是這個道理。
    const nl = window.SchSpice.toNetlist(a.state.components, a.state.wires, window.CircuitEngine);
    if (nl.unsupported.length) { msg(explain({ reason: 'unsupported', netlist: nl })); return; }
    if (!nl.elements.length) { msg(explain({ reason: 'empty', netlist: nl })); return; }

    const kind = (el('spWave') || {}).value || 'step';
    const freq = parseFloat((el('spFreq') || {}).value) || (1 / Math.max(stop, 1e-9)) * 3;
    const src = nl.elements.find(e => e.type === 'V');
    if (src && kind !== 'dc') {
      const amp = src.value || 1;
      src.tran = kind === 'sine'
        ? { kind: 'sine', amp, freq, offset: 0 }
        : kind === 'pulse'
          ? { kind: 'pulse', v1: 0, v2: amp, td: stop / 20, tr: stop / 200, pw: 1 / (2 * freq), tf: stop / 200, per: 1 / freq }
          : { kind: 'step', v1: 0, v2: amp, td: stop / 20 };
      src.value = 0;   // 工作點從 0 起算，才看得到上升過程
    }

    const res = window.Spice.tran(nl.elements, { stop, step: stop / 400 });
    const r = { ok: res.converged, result: res, netlist: nl };
    const names = pick(res.nodes, 4);
    const series = {};
    names.forEach(n => { series[n] = res.nodes[n]; });
    const bits = [netWarnings(r), convergeNote(res)];
    bits.push('<div style="font-weight:600">' + esc(T('pj_sp_tran_title', { t: stop })) + '</div>');
    bits.push(plot(res.t, series, {
      fmtY: v => fmtV(v),
      fmtX: v => (v >= 1e-3 ? (v * 1e3).toFixed(2) + 'ms' : (v * 1e6).toFixed(0) + 'µs'),
    }));
    const total = Object.keys(res.nodes).filter(n => n !== '0').length;
    if (total > names.length) bits.push('<div style="color:var(--muted)">' + esc(T('pj_sp_only', { n: names.length, total })) + '</div>');
    msg(bits.join(''));
  }

  function runAc() {
    const a = A();
    if (!a || !window.SchSpice) return;
    const f0 = parseFloat((el('spF0') || {}).value) || 1;
    const f1 = parseFloat((el('spF1') || {}).value) || 1e6;
    const r = window.SchSpice.ac(a.state.components, a.state.wires, window.CircuitEngine,
      { start: f0, stop: f1, points: 20, sweep: 'dec' });
    if (!r.ok && r.reason) { msg(explain(r)); return; }
    const res = r.result;
    const names = pick(res.nodes, 4);
    const series = {};
    // 用 dB 顯示：線性刻度會讓 -40dB 以下的東西全部貼在零線上看不見
    names.forEach(n => { series[n] = res.nodes[n].mag.map(v => 20 * Math.log10(Math.max(v, 1e-12))); });
    const bits = [netWarnings(r), convergeNote(res)];
    bits.push('<div style="font-weight:600">' + esc(T('pj_sp_ac_title', { f0, f1 })) + '</div>');
    bits.push(plot(res.f, series, {
      logX: true,
      fmtY: v => v.toFixed(1) + 'dB',
      fmtX: v => (v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1e3 ? (v / 1e3).toFixed(1) + 'k' : v.toFixed(0)) + 'Hz',
    }));
    if ((res.warnings || []).some(w => /ac_model_simplified/.test(w))) {
      bits.push(warn(T('pj_sp_ac_simplified')));
    }
    msg(bits.join(''));
  }

  function boot() {
    if (!el('spDc')) return;
    el('spDc').addEventListener('click', runDc);
    el('spTran')?.addEventListener('click', runTran);
    el('spAc')?.addEventListener('click', runAc);
    const paint = () => { const h = el('spHint'); if (h) h.textContent = T('pj_sp_hint'); };
    paint();
    document.addEventListener('vs-lang-change', paint);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
