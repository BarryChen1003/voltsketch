/**
 * snp-ui.js — Touchstone S 參數面板（讀檔、摘要、曲線圖）
 *
 * 解析一律走 snp.js（Snp.parse）。這裡只做三件事：把檔案讀進來、把摘要寫成人看得懂的
 * 句子、把 S11/S21 畫成 dB–頻率曲線。**不在這裡再寫一份解析**——兩份解析遲早不一致，
 * 而且畫面上的圖會跟摘要的數字對不起來。
 *
 * 畫圖的規矩（照專案硬規矩：圖字不可壓到圖形或別的字）：
 *   - 座標軸文字一律畫在繪圖區之外的邊界內，繪圖區本身只有曲線與格線。
 *   - 圖例畫在右上角，先鋪一塊底色再寫字，字不會壓在曲線上。
 *   - X 軸標籤先量文字寬度再決定畫幾個（5→3→2），面板變窄時自己減，不會擠成一團。
 */
'use strict';
(function () {
  const T = (k, v) => (window.I18N ? window.I18N.t(k, v) : k);
  let current = null;

  function errText(msg) {
    const m = String(msg || '');
    const code = m.split(':')[0];
    const arg = m.split(':')[1];
    const known = ['snp_err_v2', 'snp_err_empty', 'snp_err_ports', 'snp_err_ragged', 'snp_err_num', 'snp_err_param'];
    if (known.indexOf(code) >= 0) return T(code, { v: arg || '' });
    return m;
  }

  function summaryHtml(res) {
    const s = window.Snp.summary(res);
    if (!s) return '';
    const esc = v => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const rows = [
      [T('snp_ports'), s.ports + (s.z0 ? '　/　' + s.z0 + ' Ω' : '')],
      [T('snp_range'), window.Snp.fmtFreq(s.fMin) + ' – ' + window.Snp.fmtFreq(s.fMax) + '　(' + s.points + ')'],
      [T('snp_worst'), s.worstS11 == null ? '—' : s.worstS11.toFixed(2) + ' dB @ ' + window.Snp.fmtFreq(s.worstS11Freq)]
    ];
    // -3dB 只有 2 埠以上才有意義；單埠硬給一個數字是編的
    if (s.ports >= 2) rows.push([T('snp_f3db'), s.f3dB == null ? T('snp_f3db_none') : window.Snp.fmtFreq(s.f3dB)]);
    return rows.map(r => '<div class="snp-row"><span class="snp-k">' + esc(r[0]) +
      '</span><span class="snp-v">' + esc(r[1]) + '</span></div>').join('');
  }

  // ---- 曲線圖 ----
  function draw(res) {
    const cv = document.getElementById('snpChart');
    if (!cv || !res) return;
    const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    // 邊界留給座標文字。文字只畫在這塊之外，繪圖區裡只有格線與曲線。
    const L = 44, R = 12, TOP = 14, B = 26;
    const pw = W - L - R, ph = H - TOP - B;
    const css = getComputedStyle(document.body);
    const ink = (css.getPropertyValue('--ink') || '#1f2937').trim();
    const muted = (css.getPropertyValue('--muted') || '#64748b').trim();
    const line = (css.getPropertyValue('--line') || '#d5dbe3').trim();

    ctx.clearRect(0, 0, W, H);

    const series = [];
    series.push({ key: 'S11', color: '#e11d48', data: window.Snp.series(res, 1, 1) });
    if (res.ports >= 2) series.push({ key: 'S21', color: '#2563eb', data: window.Snp.series(res, 2, 1) });

    let lo = Infinity, hi = -Infinity;
    series.forEach(s => s.data.forEach(v => { if (isFinite(v)) { lo = Math.min(lo, v); hi = Math.max(hi, v); } }));
    if (!isFinite(lo)) { lo = -60; hi = 0; }
    if (hi - lo < 6) { hi += 3; lo -= 3; }         // 全平的曲線也要有高度，不然變一條貼邊的線
    const pad = (hi - lo) * 0.08; lo -= pad; hi += pad;

    const f = res.freqs;
    const fx = v => L + (f.length < 2 ? pw / 2 : (v - f[0]) / (f[f.length - 1] - f[0]) * pw);
    const fy = v => TOP + (hi - v) / (hi - lo) * ph;

    // 格線 + Y 軸標籤（畫在繪圖區左邊的邊界內）
    ctx.strokeStyle = line; ctx.lineWidth = 1;
    ctx.fillStyle = muted; ctx.font = '10px ui-monospace,Menlo,monospace';
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    for (let i = 0; i <= 4; i++) {
      const v = lo + (hi - lo) * i / 4, y = Math.round(fy(v)) + 0.5;
      ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(L + pw, y); ctx.stroke();
      ctx.fillText(v.toFixed(0) + ' dB', L - 6, y);
    }
    // X 軸標籤（畫在底部邊界內），兩端對齊避免被切掉。
    // 標籤數量不是固定 5 個：面板窄的時候 5 個「1.975 GHz」會擠成一團互相壓字，
    // 那違反專案硬規矩 1（圖字不可重疊）。所以先量寬度，擠不下就退成 3 個、再退成 2 個。
    ctx.textBaseline = 'top';
    const pickTicks = () => {
      for (const n of [4, 2, 1]) {
        const labels = [];
        for (let i = 0; i <= n; i++) {
          const v = f[0] + (f[f.length - 1] - f[0]) * i / n;
          labels.push({ v: v, text: window.Snp.fmtFreq(v), w: ctx.measureText(window.Snp.fmtFreq(v)).width });
        }
        // 每個標籤佔的區間：頭尾靠邊、中間置中。相鄰之間至少留 8px 才算不擠。
        let okAll = true;
        for (let i = 0; i < labels.length - 1; i++) {
          const xa = L + pw * (i / n), xb = L + pw * ((i + 1) / n);
          const ra = xa + (i === 0 ? labels[i].w : labels[i].w / 2);
          const lb = xb - (i + 1 === n ? labels[i + 1].w : labels[i + 1].w / 2);
          if (lb - ra < 8) { okAll = false; break; }
        }
        if (okAll) return { n: n, labels: labels };
      }
      return { n: 1, labels: [] };
    };
    const ticks = pickTicks();
    ticks.labels.forEach((lab, i) => {
      const x = fx(lab.v);
      ctx.textAlign = i === 0 ? 'left' : (i === ticks.n ? 'right' : 'center');
      ctx.fillText(lab.text, Math.min(Math.max(x, L), L + pw), TOP + ph + 6);
    });

    // 曲線
    series.forEach(s => {
      ctx.strokeStyle = s.color; ctx.lineWidth = 1.6;
      ctx.beginPath();
      let started = false;
      s.data.forEach((v, k) => {
        if (!isFinite(v)) return;
        const x = fx(f[k]), y = fy(v);
        if (started) ctx.lineTo(x, y); else { ctx.moveTo(x, y); started = true; }
      });
      ctx.stroke();
    });

    // 圖例：先鋪底色再寫字，字不會壓在曲線上
    const items = series.map(s => s.key);
    ctx.font = '11px ui-sans-serif,system-ui,sans-serif';
    const wItem = 46, boxW = items.length * wItem + 8, boxH = 18;
    const bx = L + pw - boxW - 4, by = TOP + 4;
    ctx.fillStyle = (css.getPropertyValue('--card') || '#ffffff').trim();
    ctx.globalAlpha = 0.88;
    ctx.fillRect(bx, by, boxW, boxH);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = line; ctx.strokeRect(bx + 0.5, by + 0.5, boxW, boxH);
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    series.forEach((s, i) => {
      const x = bx + 6 + i * wItem, y = by + boxH / 2;
      ctx.strokeStyle = s.color; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 14, y); ctx.stroke();
      ctx.fillStyle = ink;
      ctx.fillText(s.key, x + 18, y);
    });
  }

  function show(res, name) {
    current = res;
    const box = document.getElementById('snpSummary');
    if (box) box.innerHTML = summaryHtml(res);
    const nameEl = document.getElementById('snpName');
    if (nameEl) nameEl.textContent = name || '';
    const cv = document.getElementById('snpChart');
    if (cv) cv.style.display = '';
    draw(res);
  }

  function fail(msg) {
    current = null;
    const box = document.getElementById('snpSummary');
    if (box) box.innerHTML = '<div class="snp-err"></div>';
    const err = box && box.querySelector('.snp-err');
    if (err) err.textContent = errText(msg);
    const cv = document.getElementById('snpChart');
    if (cv) cv.style.display = 'none';
  }

  function init() {
    const input = document.getElementById('snpFile');
    if (!input) return;
    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      if (!file) return;
      const fr = new FileReader();
      fr.onload = () => {
        try { show(window.Snp.parse(String(fr.result), file.name), file.name); }
        catch (e) { fail(e && e.message); }
      };
      // 讀檔失敗也要說話：靜靜什麼都沒發生，使用者會以為是檔案有問題
      fr.onerror = () => fail('snp_err_read');
      fr.readAsText(file);
    });
    // 換語言要重畫：摘要與圖例都是翻譯過的字
    window.addEventListener('vs-lang-change', () => { if (current) show(current, (document.getElementById('snpName') || {}).textContent); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.SnpUI = { show: show, draw: draw, _errText: errText };
})();
