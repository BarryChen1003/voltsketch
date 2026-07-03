/**
 * sim-bench.js — 量測儀器（線路圖內建，獨立浮動視窗版）
 * 設計：
 *   - 9 種儀器 = type:'ic' 元件（app.placeLibraryIc 既有機制）；示波器 CH1..CH4 腳
 *     拉一般接線到節點 = 探棒指引（圖上明確標示 CH1 量哪裡）。
 *   - 每個儀器有「自己的浮動視窗」：標題列可拖曳移動、✕ 關閉、點擊置頂、
 *     位置記憶（localStorage）。預設位置錯開、不擋左側元件庫與右側屬性欄。
 *   - live：0.8s 週期重算更新所有開啟視窗（正在輸入時跳過該輪，不打斷打字）。
 * 模擬（教學級，非 SPICE）：直連 = 源波形；自動偵測「串聯 R + 對地 C」單極拓樸
 *   = RC 濾波波形；其他拓樸提示用 Falstad 匯出。
 */
(function () {
  'use strict';

  const INST = [
    { key: 'osc',  name: 'VS-示波器',    i18n: 'inst_scope',    pins: [{ number: 'CH1', name: 'CH1', side: 'L' }, { number: 'CH2', name: 'CH2', side: 'L' }, { number: 'CH3', name: 'CH3', side: 'L' }, { number: 'CH4', name: 'CH4', side: 'L' }, { number: 'GND', name: 'GND', side: 'B' }] },
    { key: 'fgen', name: 'VS-信號產生器', i18n: 'inst_siggen',   pins: [{ number: 'OUT', name: 'OUT', side: 'R' }, { number: 'GND', name: 'GND', side: 'B' }] },
    { key: 'psu',  name: 'VS-電源供應器', i18n: 'inst_psu',      pins: [{ number: 'V+', name: 'V+', side: 'R' }, { number: 'V-', name: 'V−', side: 'R' }] },
    { key: 'load', name: 'VS-電子負載',   i18n: 'inst_eload',    pins: [{ number: 'IN+', name: 'IN+', side: 'L' }, { number: 'IN-', name: 'IN−', side: 'L' }] },
    { key: 'dmm',  name: 'VS-萬用電表',   i18n: 'inst_dmm',      pins: [{ number: 'V+', name: 'V+', side: 'L' }, { number: 'V-', name: 'V−', side: 'L' }] },
    { key: 'spec', name: 'VS-頻譜分析儀', i18n: 'inst_spectrum', pins: [{ number: 'IN', name: 'IN', side: 'L' }, { number: 'GND', name: 'GND', side: 'B' }] },
    { key: 'vna',  name: 'VS-網路分析儀', i18n: 'inst_vna',      pins: [{ number: 'P1', name: 'PORT1', side: 'L' }, { number: 'P2', name: 'PORT2', side: 'R' }, { number: 'GND', name: 'GND', side: 'B' }] },
    { key: 'comm', name: 'VS-通訊測試儀', i18n: 'inst_comm',     pins: [{ number: 'TX', name: 'TX', side: 'R' }, { number: 'RX', name: 'RX', side: 'L' }, { number: 'GND', name: 'GND', side: 'B' }] },
    { key: 'lcr',  name: 'VS-LCR表',     i18n: 'inst_lcr',      pins: [{ number: 'H', name: 'HI', side: 'L' }, { number: 'L', name: 'LO', side: 'L' }] }
  ];
  const CHCOLORS = ['#eab308', '#22d3ee', '#e879f9', '#4ade80'];
  const t = (k, fb) => (window.I18N && I18N.dict[k]) ? I18N.t(k) : fb;
  const cfg = window._benchCfg = { wave: 'sine', freq: 1000, vpp: 4, offset: 0, duty: 0.5 };

  // ============ 浮動視窗管理 ============
  let zTop = 200;
  const winPos = (() => { try { return JSON.parse(localStorage.getItem('vs-win-pos')) || {}; } catch (e) { return {}; } })();
  const savePos = () => localStorage.setItem('vs-win-pos', JSON.stringify(winPos));

  function winFor(key, title) {
    let w = document.getElementById('vswin-' + key);
    if (w) { w.style.zIndex = ++zTop; return w.querySelector('.vswin-body'); }
    w = document.createElement('div');
    w.id = 'vswin-' + key;
    w.className = 'vswin';
    const idx = document.querySelectorAll('.vswin').length;
    const pos = winPos[key] || { x: 340 + (idx % 3) * 60, y: 90 + idx * 46 };  // 錯開、避開左側元件庫
    w.style.cssText = `position:fixed;left:${pos.x}px;top:${pos.y}px;min-width:280px;max-width:560px;background:#1d2430;color:#e2e8f0;border-radius:10px;box-shadow:0 10px 34px rgba(0,0,0,.5);z-index:${++zTop};font-size:12px;user-select:none`;
    w.innerHTML = `<div class="vswin-title" style="display:flex;justify-content:space-between;align-items:center;padding:7px 10px;background:#0f172a;border-radius:10px 10px 0 0;cursor:move">
        <b style="color:#93c5fd;pointer-events:none">${title}</b>
        <button class="vswin-x" style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:14px;padding:0 2px">✕</button></div>
      <div class="vswin-body" style="padding:10px"></div>`;
    document.body.appendChild(w);
    // 置頂
    w.addEventListener('mousedown', () => { w.style.zIndex = ++zTop; });
    // 拖曳（標題列）
    const bar = w.querySelector('.vswin-title');
    bar.addEventListener('mousedown', e => {
      if (e.target.classList.contains('vswin-x')) return;
      const sx = e.clientX - w.offsetLeft, sy = e.clientY - w.offsetTop;
      const mv = ev => {
        const x = Math.max(0, Math.min(window.innerWidth - 120, ev.clientX - sx));
        const y = Math.max(52, Math.min(window.innerHeight - 60, ev.clientY - sy));
        w.style.left = x + 'px'; w.style.top = y + 'px';
      };
      const up = () => {
        document.removeEventListener('mousemove', mv); document.removeEventListener('mouseup', up);
        winPos[key] = { x: w.offsetLeft, y: w.offsetTop }; savePos();
      };
      document.addEventListener('mousemove', mv); document.addEventListener('mouseup', up);
      e.preventDefault();
    });
    w.querySelector('.vswin-x').addEventListener('click', () => w.remove());
    return w.querySelector('.vswin-body');
  }
  const winBody = key => { const w = document.getElementById('vswin-' + key); return w ? w.querySelector('.vswin-body') : null; };
  const typingIn = key => { const w = document.getElementById('vswin-' + key); return w && w.contains(document.activeElement) && /INPUT|SELECT/.test(document.activeElement.tagName); };

  // ============ palette 注入 ============
  function mountPalette() {
    const list = document.querySelector('.component-list');
    if (!list || document.getElementById('benchPalette')) return;
    const sec = document.createElement('div');
    sec.id = 'benchPalette';
    sec.innerHTML = '<h2 style="font-size:13px;margin:14px 0 6px;color:#334155">' + t('lab_title', '量測儀器') + '</h2>' +
      INST.map(i => `<button class="component-button" type="button" data-inst="${i.key}"><span class="schematic-mini chip-mini">測</span><span>${t(i.i18n, i.name.replace('VS-', ''))}</span></button>`).join('');
    list.parentElement.insertBefore(sec, list.nextSibling);
    sec.addEventListener('click', e => {
      const b = e.target.closest('[data-inst]');
      if (!b) return;
      const d = INST.find(x => x.key === b.dataset.inst);
      // 已放過 → 只開/聚焦視窗；沒放過 → 放元件 + 開視窗
      if (!findInstComp(d.key)) app.placeLibraryIc({ name: d.name, pins: d.pins });
      winFor(d.key, t(d.i18n, d.name.replace('VS-', '')));
      refresh(); startLive();
    });
  }
  const findInstComp = key => app.state.components.find(c => c.type === 'ic' && c.name === INST.find(x => x.key === key).name);

  // ============ 電路解析 ============
  function analyze() {
    const comps = app.state.components, wires = app.state.wires;
    const { pinNet } = window.CircuitEngine.computeNets(comps, wires);
    const netOf = (c, i) => pinNet.get(c.id + ':' + i);
    const instPinNet = (c, pinNum) => { const i = (c.icPins || []).findIndex(p => String(p.num) === pinNum); return i >= 0 ? netOf(c, i) : undefined; };
    const gndNets = new Set(comps.filter(c => c.type === 'ground').map(c => netOf(c, 0)));
    return { comps, netOf, instPinNet, gndNets };
  }
  function resolveSignal(A, srcNet, net) {
    if (net === undefined || srcNet === undefined) return null;
    if (net === srcNet) return { kind: 'direct' };
    for (const r of A.comps.filter(c => c.type === 'resistor')) {
      const n0 = A.netOf(r, 0), n1 = A.netOf(r, 1);
      if (!((n0 === srcNet && n1 === net) || (n1 === srcNet && n0 === net))) continue;
      for (const c of A.comps.filter(c => c.type === 'capacitor')) {
        const c0 = A.netOf(c, 0), c1 = A.netOf(c, 1);
        if ((c0 === net && A.gndNets.has(c1)) || (c1 === net && A.gndNets.has(c0)))
          return { kind: 'rc', r: r.value || 1000, c: c.value || 1e-7 };
      }
    }
    return null;
  }
  const lcd = (v, lbl) => `<div style="font-family:ui-monospace,monospace;background:#052e16;color:#4ade80;border-radius:6px;padding:6px 10px;margin:4px 0;text-align:right">${v} <small style="color:#86efac">${lbl}</small></div>`;
  const sigStatus = sig => sig == null ? '<span style="color:#64748b">未接/拓樸不支援（可用 Falstad 匯出）</span>'
    : sig.kind === 'direct' ? '＝訊號源' : `RC 濾波 R=${Instruments.fmt(sig.r, 'Ω')} C=${Instruments.fmt(sig.c, 'F')}`;

  // ============ 各儀器視窗更新 ============
  function refresh() {
    const I = window.Instruments, A = analyze();
    const fgenC = findInstComp('fgen');
    const srcNet = fgenC ? A.instPinNet(fgenC, 'OUT') : undefined;
    const span = 4 / cfg.freq, N = 400;
    const sampleFor = sig => {
      if (!sig) return null;
      if (sig.kind === 'direct') return I.sample(cfg, { r: 1, c: 1e-12 }, 0, span, N).sig;
      return I.sample(cfg, { r: sig.r, c: sig.c }, 0, span, N).out;
    };

    // --- 信號產生器（控制視窗；只建一次，輸入綁 cfg）---
    const fg = winBody('fgen');
    if (fg && !fg.dataset.built) {
      fg.dataset.built = '1';
      fg.innerHTML = `<div style="display:grid;grid-template-columns:auto 1fr;gap:6px;align-items:center">
        <label style="color:#94a3b8">${t('t_waveform', '波形')}</label>
        <select id="fgWave" style="background:#0f172a;color:#e2e8f0;border:1px solid #334155;border-radius:4px;padding:3px">
          <option value="sine">${t('t_sine', '正弦波')}</option><option value="square">${t('t_square', '方波')}</option><option value="triangle">${t('t_triangle', '三角波')}</option></select>
        <label style="color:#94a3b8">${t('t_freq', '頻率')} (Hz)</label><input id="fgFreq" type="number" value="${cfg.freq}" style="background:#0f172a;color:#e2e8f0;border:1px solid #334155;border-radius:4px;padding:3px"/>
        <label style="color:#94a3b8">Vpp (V)</label><input id="fgVpp" type="number" value="${cfg.vpp}" step="0.5" style="background:#0f172a;color:#e2e8f0;border:1px solid #334155;border-radius:4px;padding:3px"/>
        <label style="color:#94a3b8">${t('t_offset', '直流偏移')} (V)</label><input id="fgOff" type="number" value="${cfg.offset}" step="0.5" style="background:#0f172a;color:#e2e8f0;border:1px solid #334155;border-radius:4px;padding:3px"/></div>
        <p id="fgStat" style="color:#64748b;margin:6px 0 0"></p>`;
      fg.querySelector('#fgWave').addEventListener('change', e => cfg.wave = e.target.value);
      fg.querySelector('#fgFreq').addEventListener('change', e => cfg.freq = Math.max(1, +e.target.value || 1000));
      fg.querySelector('#fgVpp').addEventListener('change', e => cfg.vpp = Math.max(0.1, +e.target.value || 4));
      fg.querySelector('#fgOff').addEventListener('change', e => cfg.offset = +e.target.value || 0);
    }
    if (fg) fg.querySelector('#fgStat').textContent = fgenC ? 'OUT 已就緒（接線到電路）' : '（畫布上還沒放這顆儀器）';

    // --- 示波器 ---
    const ob = winBody('osc');
    if (ob && !typingIn('osc')) {
      const oscC = findInstComp('osc');
      if (!oscC) ob.innerHTML = '<p style="color:#fbbf24">畫布上沒有示波器元件</p>';
      else {
        if (!ob.querySelector('canvas')) ob.innerHTML = `<canvas width="460" height="200" style="background:#0b1220;border-radius:6px;display:block"></canvas><div class="oscst" style="margin-top:6px;line-height:1.8"></div>`;
        const cv = ob.querySelector('canvas'), ctx = cv.getContext('2d'), W = cv.width, H = cv.height;
        ctx.fillStyle = '#0b1220'; ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = '#1e293b';
        for (let i = 1; i < 10; i++) { ctx.beginPath(); ctx.moveTo(W * i / 10, 0); ctx.lineTo(W * i / 10, H); ctx.stroke(); }
        ctx.strokeStyle = '#334155'; ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();
        const vdiv = Math.max(0.5, (cfg.vpp + Math.abs(cfg.offset) * 2) / 4);
        let st = '';
        ['CH1', 'CH2', 'CH3', 'CH4'].forEach((ch, i) => {
          const sig = resolveSignal(A, srcNet, A.instPinNet(oscC, ch));
          st += `<span style="color:${CHCOLORS[i]};margin-right:10px">●${ch} ${A.instPinNet(oscC, ch) === undefined ? '<span style="color:#475569">未接</span>' : sigStatus(sig)}</span>`;
          const arr = sampleFor(sig); if (!arr) return;
          ctx.strokeStyle = CHCOLORS[i]; ctx.lineWidth = 1.6; ctx.beginPath();
          for (let k = 0; k < arr.length; k++) { const y = H / 2 - (arr[k] / vdiv) * (H / 8); k ? ctx.lineTo(W * k / arr.length, y) : ctx.moveTo(0, y); }
          ctx.stroke();
        });
        ob.querySelector('.oscst').innerHTML = st;
      }
    }

    // --- 電源供應器 + 電子負載 ---
    const psuC = findInstComp('psu'), loadC = findInstComp('load');
    const pb = winBody('psu');
    if (pb) {
      const pv = (psuC && psuC.value) || 5, li = (loadC && loadC.value) || 0.5;
      const shared = psuC && loadC && A.instPinNet(psuC, 'V+') !== undefined && A.instPinNet(psuC, 'V+') === A.instPinNet(loadC, 'IN+');
      const r = I.psuSolve({ vset: pv, ilimit: 1, on: !!psuC }, { iset: li, on: !!shared });
      pb.innerHTML = lcd(`${r.v.toFixed(2)} V　${r.i.toFixed(2)} A　${r.mode}`, `${t('t_cv', '定電壓')}=元件value(${pv}V)・限流1A`) +
        `<p style="color:#64748b">${psuC ? (shared ? '已接電子負載' : '電子負載未接 V+（選元件改 value 設電壓）') : '畫布上沒有電源供應器'}</p>`;
    }
    const lb = winBody('load');
    if (lb) lb.innerHTML = lcd(`${(((psuC && psuC.value) || 5) * ((loadC && loadC.value) || 0.5)).toFixed(2)} W`, t('inst_eload', '電子負載') + '（value=電流A）') +
      `<p style="color:#64748b">${loadC ? 'IN+/IN− 接電源兩端；選元件改 value 設定電流' : '畫布上沒有電子負載'}</p>`;

    // --- DMM ---
    const db = winBody('dmm');
    if (db) {
      const dmmC = findInstComp('dmm');
      const sig = dmmC ? resolveSignal(A, srcNet, A.instPinNet(dmmC, 'V+')) : null;
      const arr = sampleFor(sig);
      db.innerHTML = arr
        ? (() => { const m = I.dmm(arr); return lcd(m.dc.toFixed(3) + ' V', t('t_dc_avg', '直流(平均)')) + lcd(m.acrms.toFixed(3) + ' V', t('t_ac_rms', '交流有效值')); })()
        : lcd('—', dmmC ? 'V+ 未接或拓樸不支援' : '畫布上沒有萬用電表');
    }

    // --- 頻譜 ---
    const sb = winBody('spec');
    if (sb) {
      const sc = findInstComp('spec');
      const sig = sc ? resolveSignal(A, srcNet, A.instPinNet(sc, 'IN')) : null;
      const arr = sampleFor(sig);
      if (!sb.querySelector('canvas')) sb.innerHTML = '<canvas width="440" height="130" style="background:#0b1220;border-radius:6px;display:block"></canvas><p class="spst" style="color:#64748b;margin-top:4px"></p>';
      const cv = sb.querySelector('canvas'), ctx = cv.getContext('2d');
      ctx.fillStyle = '#0b1220'; ctx.fillRect(0, 0, cv.width, cv.height);
      if (arr) {
        const sp = I.spectrum(arr, (4 / cfg.freq) / 400, 48);
        ctx.fillStyle = '#38bdf8';
        sp.forEach((b, i) => { const h = Math.max(0, Math.min(1, (b.db + 80) / 80)) * (cv.height - 10); ctx.fillRect(8 + i * (cv.width - 16) / sp.length, cv.height - 5 - h, 5, h); });
        sb.querySelector('.spst').textContent = 'dBV，0~-80dB';
      } else sb.querySelector('.spst').textContent = sc ? 'IN 未接' : '畫布上沒有頻譜分析儀';
    }

    // --- 網路分析儀 ---
    const vb = winBody('vna');
    if (vb) {
      const vc = findInstComp('vna');
      const p2 = vc ? resolveSignal(A, A.instPinNet(vc, 'P1'), A.instPinNet(vc, 'P2')) : null;
      if (!vb.querySelector('canvas')) vb.innerHTML = '<canvas width="440" height="130" style="background:#0b1220;border-radius:6px;display:block"></canvas><p class="vnst" style="color:#94a3b8;margin-top:4px"></p>';
      const cv = vb.querySelector('canvas'), ctx = cv.getContext('2d');
      ctx.fillStyle = '#0b1220'; ctx.fillRect(0, 0, cv.width, cv.height);
      if (p2 && p2.kind === 'rc') {
        const sw = I.vnaSweep({ r: p2.r, c: p2.c }, 10, 1e6, 100);
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1.6; ctx.beginPath();
        sw.pts.forEach((pt, i) => { const x = i / 99 * cv.width, y = Math.min(cv.height - 3, (0 - pt.db) / 60 * (cv.height - 12) + 6); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
        ctx.stroke();
        vb.querySelector('.vnst').textContent = `${t('t_cutoff', '截止頻率')} fc(-3dB) = ${I.fmt(sw.fc, 'Hz')}`;
      } else vb.querySelector('.vnst').textContent = vc ? 'PORT1 接訊號源、PORT2 接 RC 輸出' : '畫布上沒有網路分析儀';
    }

    // --- 通訊測試儀 ---
    const cb = winBody('comm');
    if (cb && !typingIn('comm')) {
      const cc = findInstComp('comm');
      const ch = cc ? resolveSignal(A, A.instPinNet(cc, 'TX'), A.instPinNet(cc, 'RX')) : null;
      if (!cb.querySelector('canvas')) cb.innerHTML = '<canvas width="260" height="120" style="background:#0b1220;border-radius:6px;display:block"></canvas><p class="cmst" style="margin-top:4px"></p>';
      const cv = cb.querySelector('canvas'), ctx = cv.getContext('2d');
      ctx.fillStyle = '#0b1220'; ctx.fillRect(0, 0, cv.width, cv.height);
      const rc = ch && ch.kind === 'rc' ? { r: ch.r, c: ch.c } : { r: 10, c: 1e-12 };
      const e = I.eye(rc, cfg.freq, 2);
      ctx.strokeStyle = 'rgba(74,222,128,0.3)';
      e.traces.forEach(tr => { ctx.beginPath(); for (let i = 0; i < tr.length; i++) { const x = i / (tr.length - 1) * cv.width, y = cv.height - 8 - tr[i] * (cv.height - 16); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); });
      const col = e.quality === 'good' ? '#4ade80' : e.quality === 'marginal' ? '#fbbf24' : '#ef4444';
      cb.querySelector('.cmst').innerHTML = `<span style="color:${col}">${t('t_eyeopen', '眼開度')} ${(e.open * 100).toFixed(0)}%</span> <span style="color:#64748b">（${t('t_bitrate', '位元率')}=訊號頻率；${cc ? 'TX→RX 過通道' : '畫布上沒有通訊測試儀'}）</span>`;
    }

    // --- LCR ---
    const qb = winBody('lcr');
    if (qb) {
      const qc = findInstComp('lcr');
      let inner = '';
      if (!qc) inner = '<p style="color:#fbbf24">畫布上沒有 LCR 表</p>';
      else {
        const h = A.instPinNet(qc, 'H'), l = A.instPinNet(qc, 'L');
        const dut = A.comps.find(c => ['resistor', 'capacitor', 'inductor'].includes(c.type) &&
          ((A.netOf(c, 0) === h && A.netOf(c, 1) === l) || (A.netOf(c, 1) === h && A.netOf(c, 0) === l)));
        if (dut) {
          const kind = dut.type === 'resistor' ? 'R' : dut.type === 'capacitor' ? 'C' : 'L';
          const val = dut.value || (kind === 'R' ? 1000 : kind === 'C' ? 1e-7 : 1e-3);
          const r = I.lcr(kind, val, 0.1, 1000);
          inner = lcd(I.fmt(r.z, 'Ω'), t('t_impedance', '阻抗') + ' @1kHz') +
            lcd(`${r.phase.toFixed(1)}°　Q=${isFinite(r.q) ? r.q.toFixed(1) : '∞'}`, t('t_phase', '相位') + ' / Q') +
            `<p style="color:#64748b">${kind} = ${I.fmt(val, kind === 'R' ? 'Ω' : kind === 'C' ? 'F' : 'H')}（${dut.label || dut.id}）</p>`;
        } else inner = '<p style="color:#64748b">HI/LO 夾在同一顆 R/L/C 兩端即可量測</p>';
      }
      qb.innerHTML = inner;
    }
  }

  // ============ live ============
  let liveTimer = null;
  function startLive() {
    if (liveTimer) return;
    liveTimer = setInterval(() => {
      if (!document.querySelector('.vswin')) { clearInterval(liveTimer); liveTimer = null; return; }
      refresh();
    }, 800);
  }

  function boot() {
    if (typeof app !== 'undefined' && document.querySelector('.component-list')) mountPalette();
    else setTimeout(boot, 300);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
