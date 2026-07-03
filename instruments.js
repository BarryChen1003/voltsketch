/**
 * instruments.js — 儀器實驗台訊號引擎（教學級，非 SPICE）
 * 模型：
 *   SigGen  正弦/方波/三角（頻率/Vpp/偏移/佔空比）
 *   DUT     RC 一階低通：時域 IIR y += dt/RC·(x−y)（任意波形皆可過），fc = 1/(2πRC)
 *   PSU+E-Load  CV/CC 互動：負載電流 ≤ 限流 → CV(V=Vset)；超過 → PSU 進 CC、電壓塌陷
 *   Spectrum    DFT 幅度（dBV）
 *   VNA         RC 轉移函數 |H(f)| 掃頻（解析解）
 *   Comm        PRBS-7 過 RC 通道 → 眼圖疊圖 + 眼開度
 *   LCR         R/L/C 阻抗（含 ESR 串聯等效）：Z、相位、Q/D
 * 全部純函式掛 window.Instruments，lab.html 負責 UI。
 */
window.Instruments = (function () {

  // ---- 信號產生器 ----
  function sigVal(cfg, t) {
    const f = cfg.freq, T = 1 / f, ph = ((t % T) + T) % T / T;  // 0..1
    const A = cfg.vpp / 2, off = cfg.offset || 0;
    switch (cfg.wave) {
      case 'square':   return off + (ph < (cfg.duty ?? 0.5) ? A : -A);
      case 'triangle': return off + (ph < 0.5 ? (4 * ph - 1) : (3 - 4 * ph)) * A;
      default:         return off + A * Math.sin(2 * Math.PI * ph);
    }
  }

  // ---- 取樣：SIG 與 OUT(過 RC IIR)。先跑 5·RC 預熱讓濾波器穩態 ----
  function sample(cfg, rc, t0, span, N) {
    const dt = span / N, RC = rc.r * rc.c;
    const sig = new Float64Array(N), out = new Float64Array(N);
    let y = 0;
    const pre = Math.min(5 * RC, 0.5), preSteps = Math.max(1, Math.min(4000, Math.round(pre / dt)));
    for (let i = 0; i < preSteps; i++) {
      const x = sigVal(cfg, t0 - (preSteps - i) * dt);
      y += (dt / RC) * (x - y);
    }
    for (let i = 0; i < N; i++) {
      const t = t0 + i * dt, x = sigVal(cfg, t);
      y += (dt / RC) * (x - y);
      sig[i] = x; out[i] = y;
    }
    return { sig, out, dt };
  }

  // ---- PSU + 電子負載互動 ----
  function psuSolve(psu, load) {
    if (!psu.on) return { v: 0, i: 0, mode: 'OFF' };
    const iReq = load.on ? load.iset : 0;
    if (iReq <= psu.ilimit) return { v: psu.vset, i: iReq, mode: 'CV' };
    return { v: 0, i: psu.ilimit, mode: 'CC' };   // 理想 CC 負載要求超過限流 → 電壓塌陷
  }

  // ---- DMM ----
  function dmm(arr) {
    let s = 0; for (const v of arr) s += v;
    const avg = s / arr.length;
    let q = 0; for (const v of arr) q += (v - avg) * (v - avg);
    return { dc: avg, acrms: Math.sqrt(q / arr.length) };
  }

  // ---- 頻譜：DFT 幅度（前 bins 個 bin，dBV）----
  function spectrum(arr, dt, bins) {
    const N = arr.length, out = [];
    for (let k = 1; k <= bins; k++) {
      let re = 0, im = 0;
      for (let n = 0; n < N; n++) {
        const a = 2 * Math.PI * k * n / N;
        re += arr[n] * Math.cos(a); im -= arr[n] * Math.sin(a);
      }
      const mag = 2 * Math.hypot(re, im) / N;
      out.push({ f: k / (N * dt), db: 20 * Math.log10(Math.max(mag, 1e-6)) });
    }
    return out;
  }

  // ---- 網路分析儀：RC 低通 |H| 解析解掃頻（log）----
  function vnaSweep(rc, f0, f1, pts) {
    const out = [], RC = rc.r * rc.c, fc = 1 / (2 * Math.PI * RC);
    for (let i = 0; i < pts; i++) {
      const f = f0 * Math.pow(f1 / f0, i / (pts - 1));
      const mag = 1 / Math.sqrt(1 + Math.pow(f / fc, 2));
      out.push({ f, db: 20 * Math.log10(mag), ph: -Math.atan(f / fc) * 180 / Math.PI });
    }
    return { pts: out, fc };
  }

  // ---- 通訊測試：PRBS-7 過 RC → 眼圖 ----
  function prbs7(n) {
    let reg = 0x7f; const bits = [];
    for (let i = 0; i < n; i++) {
      const b = ((reg >> 6) ^ (reg >> 5)) & 1;
      reg = ((reg << 1) | b) & 0x7f;
      bits.push(b);
    }
    return bits;
  }
  function eye(rc, bitrate, ui) {
    const RC = rc.r * rc.c, Tb = 1 / bitrate, os = 32;      // 每 bit 32 取樣
    const bits = prbs7(160), dt = Tb / os;
    const wave = new Float64Array(bits.length * os);
    let y = 0;
    for (let i = 0; i < wave.length; i++) {
      const x = bits[Math.floor(i / os)] ? 1 : 0;
      y += (dt / RC) * (x - y);
      wave[i] = y;
    }
    // 疊 2UI 視窗
    const per = os * ui, traces = [];
    for (let s = os * 4; s + per < wave.length; s += os) traces.push(wave.slice(s, s + per));
    // 眼開度：取中央取樣點，1 位準最小值 − 0 位準最大值
    let hi = 1, lo = 0; const mid = Math.floor(os / 2);
    for (let s = os * 4; s + os < wave.length; s += os) {
      const b = bits[Math.floor((s + mid) / os)], v = wave[s + mid];
      if (b === 1) hi = Math.min(hi, v); else lo = Math.max(lo, v);
    }
    const open = Math.max(0, hi - lo);
    return { traces, per, open, quality: open > 0.6 ? 'good' : open > 0.25 ? 'marginal' : 'closed' };
  }

  // ---- LCR ----
  function lcr(kind, value, esr, f) {
    const w = 2 * Math.PI * f;
    let R = esr || 0, X = 0;
    if (kind === 'R') { R = value; X = 0; }
    else if (kind === 'L') X = w * value;
    else if (kind === 'C') X = -1 / (w * value);
    const Z = Math.hypot(R, X), ph = Math.atan2(X, R) * 180 / Math.PI;
    const Q = R > 0 ? Math.abs(X) / R : Infinity;
    return { z: Z, phase: ph, q: Q, d: Q > 0 ? 1 / Q : Infinity, r: R, x: X };
  }

  // ---- 單位格式 ----
  function fmt(v, unit) {
    const abs = Math.abs(v);
    const p = [[1e9, 'G'], [1e6, 'M'], [1e3, 'k'], [1, ''], [1e-3, 'm'], [1e-6, 'µ'], [1e-9, 'n'], [1e-12, 'p']];
    for (const [m, s] of p) if (abs >= m || m === 1e-12) return (v / m).toPrecision(4) + ' ' + s + unit;
    return v + ' ' + unit;
  }

  return { sigVal, sample, psuSolve, dmm, spectrum, vnaSweep, eye, lcr, fmt, prbs7 };
})();
