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
    // 游標：垂直線 + 頂端標號。畫在最後才不會被波形蓋掉。
    for (const c of (o.cursors || [])) {
      if (c.x == null) continue;
      const cv = xlog ? Math.log10(Math.max(c.x, 1e-12)) : c.x;
      const cx = ml + ((cv - x0) / ((x1 - x0) || 1)) * (W - ml - mr);
      if (!isFinite(cx) || cx < ml - 1 || cx > W - mr + 1) continue;
      parts.push('<line x1="' + cx.toFixed(1) + '" y1="' + mt + '" x2="' + cx.toFixed(1) + '" y2="' + (H - mb) +
        '" stroke="' + (c.color || '#f59e0b') + '" stroke-width="1" stroke-dasharray="3 3"/>');
      parts.push('<text x="' + (cx + 2).toFixed(1) + '" y="' + (mt + 9) + '" fill="' + (c.color || '#f59e0b') +
        '" font-size="9">' + esc(c.label || '') + '</text>');
    }
    // 點圖上要能換算回資料座標，把這次的映射記著（每次重畫覆蓋）
    plotMap = { ml, mr, W, x0, x1, xlog, xs };

    return '<svg id="spPlot" viewBox="0 0 ' + W + ' ' + H + '" width="100%" style="max-width:320px;cursor:crosshair">' + parts.join('') + '</svg>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;font-size:11px;margin-top:2px">' +
      names.map((n, k) => '<span style="color:' + COLORS[k % COLORS.length] + '">■ ' + esc(n) + '</span>').join('') +
      '</div>';
  }

  // 最近一次模擬的結果與繪圖映射。游標與量測都靠它——
  // 每次點游標都重跑一次模擬的話，一條線拖過去會卡到動不了。
  let lastRun = null;      // { kind:'tran'|'ac', res, names }
  let plotMap = null;      // { ml, mr, W, x0, x1, xlog, xs }
  let cursors = [null, null];
  let cursorNext = 0;

  // 螢幕 x（SVG 座標）→ 資料座標。plot() 的 px() 的反函式。
  function invX(sx) {
    if (!plotMap) return null;
    const { ml, mr, W, x0, x1, xlog } = plotMap;
    const u = (sx - ml) / ((W - ml - mr) || 1);
    const v = x0 + u * (x1 - x0);
    return xlog ? Math.pow(10, v) : v;
  }

  const fmtT = v => (v == null) ? '—' : (Math.abs(v) >= 1e-3 ? (v * 1e3).toFixed(3) + 'ms' : (v * 1e6).toFixed(1) + 'µs');
  const fmtHz = v => (v == null) ? '—' : (v >= 1e6 ? (v / 1e6).toFixed(3) + 'MHz' : v >= 1e3 ? (v / 1e3).toFixed(3) + 'kHz' : v.toFixed(2) + 'Hz');
  const fmtNum = (v, unit) => (v == null) ? '—' : (Math.abs(v) >= 1000 ? v.toFixed(0) : Math.abs(v) >= 1 ? v.toFixed(3) : v.toExponential(2)) + (unit || '');

  // 自動量測表。量不出來的欄位顯示「—」，不顯示 0——
  // 「找不到交越點」跟「上升時間是 0」是兩件完全不同的事。
  function measureTable() {
    const M = window.SpiceMeasure;
    if (!M || !lastRun) return '';
    const rows = [];
    if (lastRun.kind === 'tran') {
      for (const n of lastRun.names) {
        const s = M.summary(lastRun.res.t, lastRun.res.nodes[n]);
        if (!s) continue;
        rows.push('<tr><td>' + esc(n) + '</td><td>' + fmtNum(s.pp, 'V') + '</td><td>' + fmtNum(s.rms, 'V') +
          '</td><td>' + fmtNum(s.avg, 'V') + '</td><td>' + fmtT(s.rise) + '</td><td>' + fmtHz(s.freq) + '</td></tr>');
      }
      if (!rows.length) return '';
      return '<table style="width:100%;font-size:11px;border-collapse:collapse"><tr style="color:var(--muted)">' +
        '<th align="left">' + esc(T('pj_sp_m_sig')) + '</th><th align="left">Vpp</th><th align="left">RMS</th>' +
        '<th align="left">' + esc(T('pj_sp_m_avg')) + '</th><th align="left">' + esc(T('pj_sp_m_rise')) + '</th>' +
        '<th align="left">' + esc(T('pj_sp_m_freq')) + '</th></tr>' + rows.join('') + '</table>';
    }
    for (const n of lastRun.names) {
      const c = M.cutoff(lastRun.res, n);
      const g = M.gainAt(lastRun.res, n, lastRun.res.f[0]);
      rows.push('<tr><td>' + esc(n) + '</td><td>' + (c ? fmtHz(c.f) : '—') + '</td><td>' +
        (c ? c.refdB.toFixed(1) + 'dB' : '—') + '</td><td>' + (g ? g.dB.toFixed(1) + 'dB' : '—') + '</td></tr>');
    }
    if (!rows.length) return '';
    return '<table style="width:100%;font-size:11px;border-collapse:collapse"><tr style="color:var(--muted)">' +
      '<th align="left">' + esc(T('pj_sp_m_sig')) + '</th><th align="left">−3dB</th>' +
      '<th align="left">' + esc(T('pj_sp_m_peak')) + '</th><th align="left">' + esc(T('pj_sp_m_atf0')) + '</th></tr>' +
      rows.join('') + '</table>';
  }

  // 游標讀數。兩個游標都放好才給 Δ；只放一個就只報那一點的值。
  function cursorTable() {
    const M = window.SpiceMeasure;
    if (!M || !lastRun || cursors[0] == null) return '';
    const isTran = lastRun.kind === 'tran';
    const xs = isTran ? lastRun.res.t : lastRun.res.f;
    const series = {};
    for (const n of lastRun.names) series[n] = isTran ? lastRun.res.nodes[n] : lastRun.res.nodes[n].mag;
    const fx = isTran ? fmtT : fmtHz;
    const at = x => { const o = {}; for (const n of lastRun.names) o[n] = M.interp(xs, series[n], x); return o; };
    const a = at(cursors[0]);
    const bits = ['<div style="font-size:11px;line-height:1.6">'];
    bits.push('<span style="color:#f59e0b">A</span> ' + esc(fx(cursors[0])) + '：' +
      lastRun.names.map(n => esc(n) + '=' + fmtNum(a[n], isTran ? 'V' : '')).join('，'));
    if (cursors[1] != null) {
      const b = at(cursors[1]);
      const dx = cursors[1] - cursors[0];
      bits.push('<br><span style="color:#38bdf8">B</span> ' + esc(fx(cursors[1])) + '：' +
        lastRun.names.map(n => esc(n) + '=' + fmtNum(b[n], isTran ? 'V' : '')).join('，'));
      const dv = lastRun.names.map(n => (a[n] == null || b[n] == null) ? esc(n) + '=—' : esc(n) + '=' + fmtNum(b[n] - a[n], isTran ? 'V' : ''));
      bits.push('<br><b>Δ</b> ' + esc(fx(Math.abs(dx))) + '（' + (isTran && dx !== 0 ? esc(fmtHz(1 / Math.abs(dx))) : '—') + '）：' + dv.join('，'));
    }
    bits.push('</div>');
    return bits.join('');
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
    const names = pick(res.nodes, 4);
    lastRun = { kind: 'tran', res, names, netlist: nl };
    cursors = [null, null]; cursorNext = 0;      // 換一次模擬，舊游標的座標就沒有意義了
    paintRun();
  }

  // 把「最近一次結果」畫出來。抽出來是因為放游標之後要重畫，
  // 而重畫**不可以**重跑模擬——每點一下就重解一次 MNA，拖游標會卡到動不了。
  function paintRun() {
    if (!lastRun) return;
    const res = lastRun.res, names = lastRun.names;
    const cur = [
      { x: cursors[0], color: '#f59e0b', label: 'A' },
      { x: cursors[1], color: '#38bdf8', label: 'B' }
    ];
    const bits = [];
    if (lastRun.kind === 'tran') {
      const series = {};
      names.forEach(n => { series[n] = res.nodes[n]; });
      bits.push(netWarnings({ netlist: lastRun.netlist }), convergeNote(res));
      bits.push('<div style="font-weight:600">' + esc(T('pj_sp_tran_title', { t: res.t[res.t.length - 1] })) + '</div>');
      bits.push(plot(res.t, series, {
        cursors: cur,
        fmtY: v => fmtV(v),
        fmtX: v => (v >= 1e-3 ? (v * 1e3).toFixed(2) + 'ms' : (v * 1e6).toFixed(0) + 'µs'),
      }));
    } else {
      const series = {};
      names.forEach(n => { series[n] = res.nodes[n].mag.map(v => 20 * Math.log10(Math.max(v, 1e-12))); });
      bits.push(netWarnings({ netlist: lastRun.netlist }), convergeNote(res));
      bits.push('<div style="font-weight:600">' + esc(T('pj_sp_ac_title', { f0: res.f[0], f1: res.f[res.f.length - 1] })) + '</div>');
      bits.push(plot(res.f, series, {
        cursors: cur, logX: true,
        fmtY: v => v.toFixed(1) + 'dB',
        fmtX: v => (v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1e3 ? (v / 1e3).toFixed(1) + 'k' : v.toFixed(0)) + 'Hz',
      }));
      if ((res.warnings || []).some(w => /ac_model_simplified/.test(w))) bits.push(warn(T('pj_sp_ac_simplified')));
    }
    bits.push('<div style="color:var(--muted);font-size:11px">' + esc(T('pj_sp_cursor_hint')) + '</div>');
    bits.push(cursorTable());
    bits.push(measureTable());
    const total = Object.keys(res.nodes).filter(n => n !== '0').length;
    if (total > names.length) bits.push('<div style="color:var(--muted)">' + esc(T('pj_sp_only', { n: names.length, total })) + '</div>');
    msg(bits.join(''));
    bindPlotClicks();
  }

  // 點波形放游標。CSP 不准 inline handler，所以每次重畫都要重新掛。
  function bindPlotClicks() {
    const svg = el('spPlot');
    if (!svg) return;
    svg.addEventListener('click', ev => {
      const r = svg.getBoundingClientRect();
      if (!r.width) return;
      const sx = (ev.clientX - r.left) / r.width * 300;   // viewBox 寬度固定 300
      const x = invX(sx);
      if (x == null) return;
      cursors[cursorNext] = x;
      cursorNext = cursorNext ? 0 : 1;                   // A、B 輪流
      paintRun();
    });
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
    // 用 dB 顯示：線性刻度會讓 -40dB 以下的東西全部貼在零線上看不見（在 paintRun 裡換算）
    lastRun = { kind: 'ac', res, names: pick(res.nodes, 4), netlist: r.netlist };
    cursors = [null, null]; cursorNext = 0;
    paintRun();
  }

  // ---- 參數掃描 / 蒙地卡羅（SpiceSweep）----
  // 量的是「AC 的 −3dB 轉角」：那是這個工具算得最準、也最常被公差影響的一個數字。
  // 換別的指標要動這裡一行；刻意不做成通用表達式輸入——
  // 那會變成一個沒有人驗得了的小語言。
  function sweepSetup() {
    const a = A();
    if (!a || !window.SchSpice || !window.SpiceSweep || !window.SpiceMeasure) return null;
    const nl = window.SchSpice.toNetlist(a.state.components, a.state.wires, window.CircuitEngine);
    if (nl.unsupported.length) { msg(explain({ reason: 'unsupported', netlist: nl })); return null; }
    if (!nl.elements.length) { msg(explain({ reason: 'empty', netlist: nl })); return null; }
    const parts = nl.elements.filter(e => e.type === 'R' || e.type === 'C' || e.type === 'L');
    if (!parts.length) { msg(warn(T('pj_sp_sw_nopart'))); return null; }
    const f0 = parseFloat((el('spF0') || {}).value) || 1;
    const f1 = parseFloat((el('spF1') || {}).value) || 1e6;
    // AC 需要電壓源帶 ac 振幅，而且選項名是 start/stop/points/sweep。
    // 兩件事任一個弄錯，出來的是一整條 0——圖是平的、−3dB 一律量不到，
    // 而且不會有任何錯誤訊息。所以這裡跟 SchSpice.ac 走完全一樣的準備。
    const acOpts = { start: f0, stop: f1, points: 20, sweep: 'dec' };
    const runAcOn = function (els) {
      const src = els.find(function (e) { return e.type === 'V'; });
      if (src && !src.ac) src.ac = 1;
      return window.Spice.ac(els, acOpts);
    };
    const probeRes = runAcOn(nl.elements.map(function (e) { return Object.assign({}, e); }));
    const out = pick(probeRes.nodes, 1)[0];
    if (!out) { msg(warn(T('pj_sp_sw_nonode'))); return null; }
    // 探測那一輪要真的有訊號，不然掃描每一點都會回 null 而看不出原因
    const peak = Math.max.apply(null, (probeRes.nodes[out] || { mag: [0] }).mag);
    if (!(peak > 0)) { msg(warn(T('pj_sp_sw_noac'))); return null; }
    return {
      nl: nl, parts: parts, out: out,
      run: runAcOn,
      metric: function (res) { const c = window.SpiceMeasure.cutoff(res, out); return c ? c.f : null; }
    };
  }

  // 結果分布畫成直方圖。散佈的形狀比「平均值 ± 標準差」好懂太多。
  function histogram(values, lo, hi) {
    const xs = (values || []).filter(function (v) { return typeof v === 'number' && isFinite(v); });
    if (xs.length < 2) return '';
    const mn = Math.min.apply(null, xs), mx = Math.max.apply(null, xs);
    if (!(mx > mn)) return '';
    const B = 20, bins = new Array(B).fill(0);
    for (const v of xs) bins[Math.min(B - 1, Math.floor((v - mn) / (mx - mn) * B))]++;
    const peak = Math.max.apply(null, bins) || 1;
    const W = 300, H = 90, mb = 16;
    const parts = ['<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="#0f1720"/>'];
    bins.forEach(function (c, i) {
      const h = (c / peak) * (H - mb - 6);
      const x = 4 + i * ((W - 8) / B);
      parts.push('<rect x="' + x.toFixed(1) + '" y="' + (H - mb - h).toFixed(1) + '" width="' +
        ((W - 8) / B - 1).toFixed(1) + '" height="' + h.toFixed(1) + '" fill="#38bdf8"/>');
    });
    // 規格界線畫出來，一眼看得出落在外面的那一截
    for (const L of [lo, hi]) {
      if (typeof L !== 'number' || !isFinite(L) || L < mn || L > mx) continue;
      const x = 4 + ((L - mn) / (mx - mn)) * (W - 8);
      parts.push('<line x1="' + x.toFixed(1) + '" y1="0" x2="' + x.toFixed(1) + '" y2="' + (H - mb) +
        '" stroke="#f43f5e" stroke-width="1" stroke-dasharray="3 3"/>');
    }
    parts.push('<text x="4" y="' + (H - 4) + '" fill="#8aa" font-size="9">' + esc(fmtHz(mn)) + '</text>');
    parts.push('<text x="' + (W - 62) + '" y="' + (H - 4) + '" fill="#8aa" font-size="9">' + esc(fmtHz(mx)) + '</text>');
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" style="max-width:320px">' + parts.join('') + '</svg>';
  }

  function runSweep() {
    const S = sweepSetup();
    if (!S) return;
    const id = (el('spSwPart') || {}).value || S.parts[0].id;
    const target = S.parts.find(function (e) { return String(e.id) === String(id); }) || S.parts[0];
    const span = Math.max(1.01, parseFloat((el('spSwSpan') || {}).value) || 4);
    const steps = Math.max(2, Math.min(200, parseInt((el('spSwSteps') || {}).value, 10) || 9));
    const r = window.SpiceSweep.sweep(S.nl.elements,
      { id: target.id, from: target.value / span, to: target.value * span, steps: steps, scale: 'log' },
      S.run, S.metric);
    if (!r.ok) { msg(err(T('pj_sp_sw_fail', { why: r.reason }))); return; }
    const rows = r.points.map(function (pt) {
      return '<tr><td>' + esc(fmtNum(pt.value)) + '</td><td>' + esc(fmtHz(pt.metric)) + '</td></tr>';
    }).join('');
    const bits = ['<div style="font-weight:600">' + esc(T('pj_sp_sw_title', { id: target.id, node: S.out })) + '</div>'];
    bits.push('<table style="width:100%;font-size:11px;border-collapse:collapse"><tr style="color:var(--muted)">' +
      '<th align="left">' + esc(String(target.id)) + '</th><th align="left">-3dB</th></tr>' + rows + '</table>');
    if (r.failed.length) bits.push(warn(T('pj_sp_sw_skipped', { n: r.failed.length })));
    msg(bits.join(''));
  }

  function runMonteCarlo() {
    const S = sweepSetup();
    if (!S) return;
    const tol = Math.max(0.0001, (parseFloat((el('spMcTol') || {}).value) || 5) / 100);
    const runs = Math.max(10, Math.min(2000, parseInt((el('spMcRuns') || {}).value, 10) || 200));
    const seed = parseInt((el('spMcSeed') || {}).value, 10) || 1;
    const dist = (el('spMcDist') || {}).value || 'gauss';
    const parts = S.parts.map(function (e) { return { id: e.id, nominal: e.value, tol: tol, dist: dist }; });
    const r = window.SpiceSweep.monteCarlo(S.nl.elements, parts, S.run, S.metric, { runs: runs, seed: seed });
    if (!r.ok) { msg(err(T('pj_sp_mc_fail', { why: r.reason }))); return; }
    const vals = r.samples.map(function (x) { return x.metric; }).filter(function (v) { return typeof v === 'number'; });
    const st = r.stats;
    if (!st) { msg(warn(T('pj_sp_mc_nometric'))); return; }
    // 規格界線＝中位數 ±10%（沒有更好依據時的預設；最終由使用者判斷）
    const nom = st.p50, lo = nom * 0.9, hi = nom * 1.1;
    const y = window.SpiceSweep.yieldWithin(vals, lo, hi);
    const bits = ['<div style="font-weight:600">' +
      esc(T('pj_sp_mc_title', { n: r.samples.length, tol: (tol * 100).toFixed(1), node: S.out })) + '</div>'];
    bits.push(histogram(vals, lo, hi));
    bits.push('<div style="font-size:11px;line-height:1.6">' +
      esc(T('pj_sp_mc_stats', { p50: fmtHz(st.p50), p1: fmtHz(st.p1), p99: fmtHz(st.p99), sd: fmtHz(st.sd) })) +
      '<br>' + esc(T('pj_sp_mc_yield', { pct: (y.ratio * 100).toFixed(1), lo: fmtHz(lo), hi: fmtHz(hi) })) +
      '<br><span style="color:var(--muted)">' + esc(T('pj_sp_mc_seed', { seed: seed })) + '</span></div>');
    if (r.failed.length) bits.push(warn(T('pj_sp_sw_skipped', { n: r.failed.length })));
    bits.push('<div style="color:var(--muted);font-size:11px">' + esc(T('pj_sp_mc_honest')) + '</div>');
    msg(bits.join(''));
  }

  // 掃描對象下拉：只列 R/C/L（掃電壓源不會動到轉角，列出來只會誤導）
  function fillSweepParts() {
    const sel = el('spSwPart');
    const a = A();
    if (!sel || !a || !window.SchSpice) return;
    let list = [];
    try {
      const nl = window.SchSpice.toNetlist(a.state.components, a.state.wires, window.CircuitEngine);
      list = (nl.elements || []).filter(function (e) { return e.type === 'R' || e.type === 'C' || e.type === 'L'; });
    } catch (e) { list = []; }
    const cur = sel.value;
    sel.innerHTML = list.map(function (e) {
      return '<option value="' + esc(String(e.id)) + '">' + esc(String(e.id)) + '</option>';
    }).join('');
    if (cur && list.some(function (e) { return String(e.id) === cur; })) sel.value = cur;
  }

  function boot() {
    if (!el('spDc')) return;
    el('spDc').addEventListener('click', runDc);
    el('spTran')?.addEventListener('click', runTran);
    el('spAc')?.addEventListener('click', runAc);
    el('spSweep')?.addEventListener('click', runSweep);
    el('spMc')?.addEventListener('click', runMonteCarlo);
    el('spSwPart')?.addEventListener('focus', fillSweepParts);
    fillSweepParts();
    const paint = () => { const h = el('spHint'); if (h) h.textContent = T('pj_sp_hint'); };
    paint();
    document.addEventListener('vs-lang-change', paint);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
