/**
 * snp.js — Touchstone（.s1p/.s2p/.s4p…）S 參數檔解析（純函式、不碰 DOM）
 *
 * 為什麼要自己解析：這是量測儀器與 IC 廠給的標準格式，使用者手上有連接器、纜線、
 * 板材的 S 參數檔，想看插入損耗與回波損耗長什麼樣子。沒有匯入的話這些檔在這裡是死的。
 *
 * 這個格式有幾個真的會咬人的地方，都在下面守著：
 *   - **2 埠的行順序是 S11 S21 S12 S22**，不是 S11 S12 S21 S22。照直覺讀會把
 *     插入損耗與反射損耗對調，畫出來的圖看起來還很合理——這是最惡的一種錯。
 *   - 3 埠以上一列會折成多行（每行最多 4 組數），要接續讀。
 *   - 格式有 MA（幅值/角度）、DB（分貝/角度）、RI（實部/虛部）三種。
 *   - 註解是 `!`，可以出現在行尾；選項行是 `#`，大小寫不拘。
 *   - 頻率單位 HZ/KHZ/MHZ/GHZ，內部一律換算成 Hz 再算。
 *
 * 誠實界定：只做 Touchstone v1（v2 的 [Version]/[Number of Ports] 關鍵字未支援，
 * 遇到會明確報錯，不會半套讀進來）。參數型別只認 S；Y/Z/H/G 直接報錯不硬轉。
 */
'use strict';
(function (root) {
  const Snp = {};

  const UNIT = { HZ: 1, KHZ: 1e3, MHZ: 1e6, GHZ: 1e9 };

  /** 檔名推埠數：.s2p → 2。推不出來回 0（用資料欄位數反推）。 */
  Snp.portsFromName = function (name) {
    const m = /\.s(\d+)p$/i.exec(String(name || ''));
    return m ? parseInt(m[1], 10) : 0;
  };

  function toComplex(a, b, format) {
    if (format === 'RI') return { re: a, im: b };
    const mag = format === 'DB' ? Math.pow(10, a / 20) : a;
    const th = b * Math.PI / 180;
    return { re: mag * Math.cos(th), im: mag * Math.sin(th) };
  }

  /**
   * 解析。回 { ports, z0, freqs(Hz), s[k][i][j] }；失敗 throw Error，
   * 錯誤訊息帶行號——「檔案格式不對」這種訊息使用者無法處理。
   */
  Snp.parse = function (text, fileName) {
    const src = String(text || '');
    if (/^\s*\[\s*version/im.test(src)) throw new Error('snp_err_v2');

    const rows = [];
    let opt = null;
    const lines = src.split(/\r?\n/);
    for (let ln = 0; ln < lines.length; ln++) {
      let line = lines[ln];
      const bang = line.indexOf('!');
      if (bang >= 0) line = line.slice(0, bang);     // 行尾註解
      line = line.trim();
      if (!line) continue;
      if (line[0] === '#') {
        if (opt) continue;                            // 只認第一個選項行
        const tk = line.slice(1).trim().toUpperCase().split(/\s+/);
        opt = { unit: 'GHZ', param: 'S', format: 'MA', z0: 50 };
        for (let i = 0; i < tk.length; i++) {
          const t = tk[i];
          if (UNIT[t]) opt.unit = t;
          else if (t === 'S' || t === 'Y' || t === 'Z' || t === 'H' || t === 'G') opt.param = t;
          else if (t === 'MA' || t === 'DB' || t === 'RI') opt.format = t;
          else if (t === 'R') { const v = parseFloat(tk[i + 1]); if (isFinite(v)) opt.z0 = v; i++; }
        }
        if (opt.param !== 'S') throw new Error('snp_err_param:' + opt.param);
        continue;
      }
      const nums = line.split(/[\s,]+/).map(Number);
      if (nums.some(v => !isFinite(v))) throw new Error('snp_err_num:' + (ln + 1));
      rows.push(nums);
    }
    if (!rows.length) throw new Error('snp_err_empty');
    if (!opt) opt = { unit: 'GHZ', param: 'S', format: 'MA', z0: 50 };   // 沒有選項行＝用標準預設

    // 埠數：檔名優先（最可靠），否則用第一筆的欄位數反推 1 + 2n²
    let ports = Snp.portsFromName(fileName);
    if (!ports) {
      const n = rows[0].length;
      const guess = Math.sqrt((n - 1) / 2);
      ports = Math.round(guess);
      if (!(ports >= 1) || Math.abs(guess - ports) > 1e-9) throw new Error('snp_err_ports');
    }

    const perFreq = 1 + 2 * ports * ports;
    const flat = [];
    for (const r of rows) flat.push.apply(flat, r);
    if (flat.length % perFreq !== 0) throw new Error('snp_err_ragged');

    const freqs = [], s = [];
    for (let k = 0; k * perFreq < flat.length; k++) {
      const base = k * perFreq;
      freqs.push(flat[base] * UNIT[opt.unit]);
      const m = [];
      for (let i = 0; i < ports; i++) { m.push(new Array(ports)); }
      let p = base + 1;
      for (let i = 0; i < ports; i++) {
        for (let j = 0; j < ports; j++) {
          m[i][j] = toComplex(flat[p], flat[p + 1], opt.format);
          p += 2;
        }
      }
      // 2 埠的檔案排序是 S11 S21 S12 S22（Touchstone 的歷史包袱）。
      // 不換回來的話插入損耗與反射損耗會對調，而圖看起來仍然「很合理」。
      if (ports === 2) { const t = m[0][1]; m[0][1] = m[1][0]; m[1][0] = t; }
      s.push(m);
    }

    return { ports: ports, z0: opt.z0, unit: opt.unit, format: opt.format, freqs: freqs, s: s };
  };

  /** 複數 → dB（20log10|c|）。0 回 -Infinity 交給呼叫端處理，不假裝是 -999。 */
  Snp.db = function (c) {
    if (!c) return NaN;
    const m = Math.hypot(c.re, c.im);
    return m === 0 ? -Infinity : 20 * Math.log10(m);
  };

  /** 取某一組 Sij 的 dB 序列（i、j 從 1 起算，跟工程習慣一致）。 */
  Snp.series = function (res, i, j) {
    if (!res || i < 1 || j < 1 || i > res.ports || j > res.ports) return [];
    return res.s.map(m => Snp.db(m[i - 1][j - 1]));
  };

  /**
   * 摘要：使用者真正要看的三個數字。
   * 2 埠以上才有插入損耗；1 埠（天線/單埠量測）只有回波損耗。
   */
  Snp.summary = function (res) {
    if (!res || !res.freqs.length) return null;
    const out = {
      ports: res.ports, z0: res.z0,
      fMin: res.freqs[0], fMax: res.freqs[res.freqs.length - 1], points: res.freqs.length
    };
    const s11 = Snp.series(res, 1, 1);
    // 回波損耗最差的那一點＝阻抗最不匹配的地方，那才是要看的
    let worst = -Infinity, wf = null;
    s11.forEach((v, k) => { if (isFinite(v) && v > worst) { worst = v; wf = res.freqs[k]; } });
    out.worstS11 = isFinite(worst) ? worst : null;
    out.worstS11Freq = wf;
    if (res.ports >= 2) {
      const s21 = Snp.series(res, 2, 1);
      out.s21At = { f: res.freqs[0], db: s21[0] };
      // -3dB 頻寬：從第一點開始，跌破 (起點-3dB) 的第一個頻率
      const ref = s21[0], lim = ref - 3;
      let f3 = null;
      for (let k = 1; k < s21.length; k++) {
        if (s21[k] <= lim) {
          // 線性內插，不要只回「跌破的那一點」——量測點很疏時誤差很大
          const t = (lim - s21[k - 1]) / (s21[k] - s21[k - 1]);
          f3 = res.freqs[k - 1] + t * (res.freqs[k] - res.freqs[k - 1]);
          break;
        }
      }
      out.f3dB = f3;
    }
    return out;
  };

  /** 頻率標示：自動選單位，免得畫面上出現 12000000000 Hz。 */
  Snp.fmtFreq = function (hz) {
    if (!isFinite(hz)) return '—';
    if (hz >= 1e9) return (hz / 1e9).toFixed(hz >= 1e10 ? 1 : 3) + ' GHz';
    if (hz >= 1e6) return (hz / 1e6).toFixed(hz >= 1e7 ? 1 : 3) + ' MHz';
    if (hz >= 1e3) return (hz / 1e3).toFixed(1) + ' kHz';
    return hz.toFixed(1) + ' Hz';
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = Snp;
  root.Snp = Snp;
})(typeof window !== 'undefined' ? window : globalThis);
