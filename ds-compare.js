/**
 * ds-compare.js — 兩份 datasheet 的 2nd-source 比對（全在瀏覽器本地跑，檔案不上傳）
 *
 * 用途：手上有現用料與候選替代料的 datasheet，想知道「差在哪、能不能換」。
 * 三步：
 *   1) extractText()  用 pdf.js 把 PDF 轉純文字（檔案只進記憶體，不送任何伺服器）
 *   2) parse()        規則式抽關鍵參數（封裝、腳數、電壓、電流、溫度、介面…）
 *   3) diff()+judge() 逐參數比對，再拿 ic-data.js 那顆 IC 的 secondSource 準則逐條判定
 *
 * 誠實原則（比功能重要）：
 *   - 抽不到就是 null，報告寫「未擷取」，絕不用猜的值填。
 *   - 準則對不到參數、或數值語意不明確 → 判 'manual'（需人工確認），不硬給結論。
 *   - 報告開頭就寫明這是初篩，最終仍以 datasheet 與樣品實測為準。
 *
 * 這個檔不碰 DOM 也不需要 pdf.js 就能跑 parse/diff/judge（ds-compare.test.js 用得到）。
 */
(function (root) {
  'use strict';

  /* ---------------- 單位正規化 ---------------- */
  const UNIT = {
    V: { V: 1, mV: 1e-3, kV: 1e3 },
    A: { A: 1, mA: 1e-3, uA: 1e-6, 'µA': 1e-6, nA: 1e-9 },
    R: { 'Ω': 1, ohm: 1, R: 1, 'mΩ': 1e-3, mohm: 1e-3, 'kΩ': 1e3, kohm: 1e3 },
    Hz: { Hz: 1, kHz: 1e3, MHz: 1e6, GHz: 1e9 },
    SPS: { SPS: 1, kSPS: 1e3, MSPS: 1e6 },
  };
  const scale = (kind, unit) => {
    const t = UNIT[kind] || {};
    const u = String(unit || '').replace(/\s/g, '');
    for (const k of Object.keys(t)) if (k.toLowerCase() === u.toLowerCase()) return t[k];
    return null;
  };
  const num = s => { const v = parseFloat(String(s).replace(/[,\s]/g, '')); return isFinite(v) ? v : null; };
  // datasheet 的負號常是 en-dash（–, U+2013）或 minus（−, U+2212），不是 ASCII 減號
  const dash = s => String(s).replace(/[\u2010-\u2015\u2212]/g, '-');
  /** 同一份文件同時給出多個不同值（例：一份 datasheet 涵蓋 16-bit 與 24-bit 兩顆）
   *  → 標成 ambiguous，judge 一律轉人工，不猜是哪一顆。 */
  const multi = (list, fmt) => {
    const uniq = [...new Set(list)];
    if (!uniq.length) return null;
    if (uniq.length === 1) return { one: uniq[0] };
    return { ambiguous: true, value: uniq.map(fmt).join(' / ') };
  };

  /* ---------------- 參數抽取規則 ----------------
   * 每條規則：找到就回 { value（顯示用原文）, n / lo / hi（正規化數值）, kind }
   * 找不到回 null —— 呼叫端據此顯示「未擷取」。 */
  const RANGE = '(-?\\d+(?:\\.\\d+)?)\\s*(?:V)?\\s*(?:to|~|–|-|—|至)\\s*\\+?(-?\\d+(?:\\.\\d+)?)';

  const RULES = [
    {
      key: 'package', label: '封裝', kind: 'text',
      run: t => {
        // TI 寫成「RTE (WQFN, 16)」、有的寫「WQFN-16」、有的寫「16-Pin WQFN」——三種都要收
        const NAMES = 'WQFN|VQFN|HVQFN|QFN|WSON|DFN|DSBGA|LQFP|TQFP|HTSSOP|TSSOP|VSSOP|MSOP|SOIC|SOP|SOT-?23|SOT-?223|TO-?220|TO-?252|DIP|BGA|LGA|CSP';
        const hits = [];
        // 腳數必須合理（4~256）：不設限的話「WQFN 0.5mm」會被讀成 WQFN-0
        const okPins = n => { const v = +n; return v >= 4 && v <= 256; };
        const push = (name, n) => { if (n && !okPins(n)) return; hits.push(String(name).toUpperCase().replace(/\s/g, '') + (n ? '-' + n : '')); };
        let m;
        // 分隔只認逗號或左括號（TI 寫「RTE (WQFN, 16)」）；允許空白會把後面的尺寸數字當腳數
        const re1 = new RegExp('\\b(' + NAMES + ')\\s*[,(]\\s*(\\d{1,3})\\b', 'gi');
        while ((m = re1.exec(t))) push(m[1], m[2]);
        const re2 = new RegExp('\\b(' + NAMES + ')\\s*-\\s*(\\d{1,3})\\b', 'gi');
        while ((m = re2.exec(t))) push(m[1], m[2]);
        const re3 = new RegExp('(\\d{1,3})\\s*-?\\s*(?:pin|lead|ball)s?\\s+(' + NAMES + ')\\b', 'gi');
        while ((m = re3.exec(t))) push(m[2], m[1]);
        if (!hits.length) {
          const bare = t.match(new RegExp('\\b(' + NAMES + ')\\b', 'i'));
          return bare ? { value: bare[1].toUpperCase(), text: bare[1].toUpperCase(), noPins: true } : null;
        }
        const r = multi(hits, x => x);
        return r.ambiguous ? r : { value: r.one, text: r.one };
      },
    },
    {
      key: 'pins', label: '腳數', kind: 'num',
      // 腳數只從封裝字串推導。內文的「4 Pin Configuration」是目錄標題，抓它會得到 4 腳這種鬼答案。
      run: t => {
        const pkg = RULES[0].run(t);
        if (!pkg) return null;
        if (pkg.ambiguous) return { value: '封裝有多種，無法判定腳數', ambiguous: true };
        const m = String(pkg.value).match(/-(\d{1,3})$/);
        return m ? { value: m[1] + ' pin', n: num(m[1]) } : null;
      },
    },
    {
      key: 'vin', label: '輸入電壓範圍', kind: 'range',
      run: t => {
        const m = t.match(new RegExp('(?:V\\s?(?:IN|CC|DD|S|SUPPLY)|supply\\s+voltage|input\\s+voltage)[^\\n]{0,40}?' + RANGE + '\\s*V', 'i'));
        if (!m) return null;
        const lo = num(m[1]), hi = num(m[2]);
        return lo === null || hi === null ? null : { value: `${lo} ~ ${hi} V`, lo, hi };
      },
    },
    {
      key: 'vout', label: '輸出電壓', kind: 'range',
      // 陷阱：ADC 的「INTERNAL VOLTAGE REFERENCE ... Output voltage 1.25V」不是輸出電壓。
      // 前文 60 字內出現 REFERENCE/VREF 就跳過這個匹配。
      run: t => {
        const REF = /REFERENCE|V\s?REF|REF\s+buffer/i;
        const clean = (re, take) => {
          let m; const r = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
          while ((m = r.exec(t))) {
            const before = t.slice(Math.max(0, m.index - 60), m.index);
            if (REF.test(before)) continue;
            return take(m);
          }
          return null;
        };
        const rng = clean(new RegExp('(?:V\\s?OUT|output\\s+voltage)[^\\n]{0,40}?' + RANGE + '\\s*V', 'i'),
          m => { const lo = num(m[1]), hi = num(m[2]); return (lo === null || hi === null) ? null : { value: `${lo} ~ ${hi} V`, lo, hi }; });
        if (rng) return rng;
        return clean(/(?:V\s?OUT|output\s+voltage)[^\n]{0,30}?(\d+(?:\.\d+)?)\s*V/i,
          m => ({ value: m[1] + ' V', lo: num(m[1]), hi: num(m[1]) }));
      },
    },
    {
      key: 'iout', label: '輸出電流', kind: 'num',
      run: t => {
        const m = t.match(/(?:I\s?OUT|output\s+current|continuous\s+current)[^\n]{0,40}?(\d+(?:\.\d+)?)\s*(mA|A)\b/i)
          || t.match(/(\d+(?:\.\d+)?)\s*(mA|A)\b[^\n]{0,24}(?:output\s+current)/i);
        if (!m) return null;
        const s = scale('A', m[2]); if (s === null) return null;
        return { value: m[1] + ' ' + m[2], n: num(m[1]) * s };
      },
    },
    {
      key: 'iq', label: '靜態電流 IQ', kind: 'num',
      run: t => {
        const m = t.match(/(?:quiescent\s+current|I\s?Q|standby\s+current|static\s+current|I\s?DD|I\s?AVDD|I\s?DVDD|supply\s+current)[^\n]{0,40}?(\d+(?:\.\d+)?)\s*(nA|µA|uA|mA)\b/i);
        if (!m) return null;
        const s = scale('A', m[2]); if (s === null) return null;
        return { value: m[1] + ' ' + m[2], n: num(m[1]) * s };
      },
    },
    {
      key: 'rdson', label: 'RDS(on)', kind: 'num',
      run: t => {
        const m = t.match(/R\s?DS\s*\(?\s*on\s*\)?[^\n]{0,40}?(\d+(?:\.\d+)?)\s*(mΩ|mohm|m ohm|Ω|ohm)\b/i);
        if (!m) return null;
        const s = scale('R', m[2]); if (s === null) return null;
        return { value: m[1] + ' ' + m[2], n: num(m[1]) * s };
      },
    },
    {
      key: 'temp', label: '工作溫度', kind: 'range',
      run: t0 => {
        // 實測 TI 的排版是「Operating ambient temperature –40 125 °C」：破折號是 en-dash、
        // 中間沒有 to、°C 只出現在尾巴。所以先正規化破折號，再允許「數字 空白 數字 °C」。
        const t = dash(t0);
        const near = t.match(/(?:operating|specified|ambient|junction|storage)?[^\n]{0,30}temperature[^\n]{0,40}?(-\d{2,3})\s*(?:°|º)?\s*C?\s*(?:to|~|-|—|至)?\s*\+?(\d{2,3})\s*(?:°|º)\s*C/i);
        const plain = t.match(/(-\d{2,3})\s*(?:°|º)\s*C\s*(?:to|~|-|—|至)\s*\+?(\d{2,3})\s*(?:°|º)\s*C/);
        const m = near || plain;
        if (!m) return null;
        const lo = num(m[1]), hi = num(m[2]);
        if (lo === null || hi === null || lo >= hi || lo < -100 || hi > 200) return null;
        return { value: `${lo} ~ ${hi} °C`, lo, hi };
      },
    },
    {
      key: 'interface', label: '介面', kind: 'set',
      // 只掃文件開頭（標題＋Features）：內文提到「EVM 用 USB 供電」之類的不是這顆的介面
      run: t0 => {
        const t = t0.slice(0, 3000);
        const hit = [];
        [['I2C', /\bI\s?2\s?C\b|\bIIC\b/i], ['SPI', /\bSPI\b/i], ['UART', /\bUART\b/i], ['CAN', /\bCAN(?:\s?FD)?\b/],
        ['LIN', /\bLIN\b/], ['USB', /\bUSB\b/i], ['SMBus', /\bSMBus\b/i], ['PMBus', /\bPMBus\b/i], ['I3C', /\bI3C\b/i]]
          .forEach(([n, re]) => { if (re.test(t)) hit.push(n); });
        return hit.length ? { value: hit.join(', '), set: hit } : null;
      },
    },
    {
      key: 'bits', label: '解析度', kind: 'num',
      // 「Low-power, 16- and 24-Bit ADC」這種標題代表一份文件涵蓋兩顆 → 不猜是哪一顆
      run: t => {
        const head = t.slice(0, 400);
        const both = head.match(/(\d{1,2})\s*-?\s*and\s*(\d{1,2})\s*-?\s*bit/i);
        if (both) return { value: both[1] + ' / ' + both[2] + '-bit', ambiguous: true };
        const m = t.match(/(\d{1,2})\s*-?\s*bit\b/i);
        return m ? { value: m[1] + '-bit', n: num(m[1]) } : null;
      },
    },
    {
      key: 'sps', label: '取樣率', kind: 'num',
      run: t => {
        const m = t.match(/(\d+(?:\.\d+)?)\s*(MSPS|kSPS|SPS)\b/i);
        if (!m) return null;
        const s = scale('SPS', m[2]); if (s === null) return null;
        return { value: m[1] + ' ' + m[2], n: num(m[1]) * s };
      },
    },
    {
      key: 'fsw', label: '切換頻率', kind: 'num',
      run: t => {
        const m = t.match(/(?:switching\s+frequency|f\s?SW|oscillator\s+frequency)[^\n]{0,40}?(\d+(?:\.\d+)?)\s*(kHz|MHz)\b/i);
        if (!m) return null;
        const s = scale('Hz', m[2]); if (s === null) return null;
        return { value: m[1] + ' ' + m[2], n: num(m[1]) * s };
      },
    },
    {
      key: 'esd', label: 'ESD (HBM)', kind: 'num',
      run: t => {
        const m = t.match(/HBM[^\n]{0,40}?(\d+(?:\.\d+)?)\s*(kV|V)\b/i) || t.match(/(\d+(?:\.\d+)?)\s*(kV|V)[^\n]{0,20}HBM/i);
        if (!m) return null;
        const s = scale('V', m[2]); if (s === null) return null;
        return { value: m[1] + ' ' + m[2], n: num(m[1]) * s };
      },
    },
    {
      key: 'aecq', label: '車規 AEC-Q100', kind: 'flag',
      run: t => (/AEC\s*-?\s*Q100/i.test(t) ? { value: '有標示', flag: true } : null),
    },
  ];

  /** 從全文抓料號與廠商（抓不到就回 null，讓使用者自己填/看檔名）。 */
  function head(text, fileName) {
    const mfr = [['Texas Instruments', /Texas Instruments|\bTI\b/], ['Analog Devices', /Analog Devices|\bADI\b/],
    ['onsemi', /onsemi|ON Semiconductor/i], ['Infineon', /Infineon/i], ['STMicroelectronics', /STMicroelectronics|\bSTMicro/i],
    ['NXP', /\bNXP\b/], ['Microchip', /Microchip/i], ['Renesas', /Renesas/i], ['Diodes Inc', /Diodes Incorporated/i],
    ['Vishay', /Vishay/i], ['MPS', /Monolithic Power/i], ['Richtek', /Richtek/i], ['Rohm', /ROHM/i]]
      .find(([, re]) => re.test(text));
    // 料號：檔名優先（使用者自己命名的最準），否則抓全文最像料號的字串
    let part = null;
    const fromName = String(fileName || '').replace(/\.[a-z]+$/i, '').match(/[A-Z]{2,}[0-9][A-Z0-9-]{1,}/i);
    if (fromName) part = fromName[0].toUpperCase();
    if (!part) { const m = text.match(/\b([A-Z]{2,5}\d{2,5}[A-Z0-9-]{0,8})\b/); if (m) part = m[1]; }
    return { part, mfr: mfr ? mfr[0] : null };
  }

  /** 解析一份 datasheet 全文 → { part, mfr, params:{key:{...}|null} } */
  function parse(text, fileName) {
    const t = String(text || '').replace(/ /g, ' ');
    const params = {};
    RULES.forEach(r => { try { params[r.key] = r.run(t) || null; } catch (e) { params[r.key] = null; } });
    return Object.assign({ params, chars: t.length, raw: t }, head(t, fileName));
  }

  /** 兩份 PDF 其實是同一份文件嗎？（TI/ADI 常用一份 datasheet 涵蓋整個系列）
   *  若是，「全部相同」這個結論會誤導人以為可以直接換料 —— 必須在報告最上方明講。 */
  function sameDoc(A, B) {
    if (!A.raw || !B.raw) return false;
    if (Math.abs(A.chars - B.chars) > 8) return false;
    return A.raw.slice(0, 3000) === B.raw.slice(0, 3000);
  }

  /** 兩份的參數逐條比對 → [{key,label,a,b,state}]；state: same | diff | partial | none */
  function diff(A, B) {
    return RULES.map(r => {
      const a = A.params[r.key], b = B.params[r.key];
      let state = 'none';
      if (a && b) state = sameValue(r, a, b) ? 'same' : 'diff';
      else if (a || b) state = 'partial';
      return { key: r.key, label: r.label, kind: r.kind, a: a ? a.value : null, b: b ? b.value : null, state };
    });
  }

  function sameValue(rule, a, b) {
    if (a.ambiguous || b.ambiguous) return false;
    switch (rule.kind) {
      case 'num': return a.n !== undefined && b.n !== undefined && a.n === b.n;
      case 'range': return a.lo === b.lo && a.hi === b.hi;
      case 'set': return a.set.slice().sort().join(',') === b.set.slice().sort().join(',');
      case 'flag': return !!a.flag === !!b.flag;
      default: return String(a.value).toUpperCase() === String(b.value).toUpperCase();
    }
  }

  /* ---------------- secondSource 準則判定 ----------------
   * 準則是中文自然語言（ic-data.js 每顆都有一串）。這裡只做「關鍵字對得到參數」的機械判定，
   * 對不到、或語意不是單純數值比較的，一律 manual —— 寧可少判，不要判錯。 */
  const MAP = [
    { key: 'package', re: /封裝|package|pinout|pin-to-pin|pin to pin|腳位相容|footprint/i, mode: 'equal' },
    { key: 'pins', re: /腳數|pin\s*count|接腳數/i, mode: 'equal' },
    { key: 'vin', re: /輸入電壓|供電|VIN|VDD|VCC|AVDD|DVDD|電壓範圍|涵蓋/i, mode: 'cover' },
    { key: 'vout', re: /輸出電壓|VOUT/i, mode: 'cover' },
    { key: 'iout', re: /輸出電流|負載電流|IOUT|電流能力/i, mode: 'ge' },
    { key: 'iq', re: /靜態|待機|IQ|靜態電流/i, mode: 'le' },
    { key: 'rdson', re: /RDS|導通電阻/i, mode: 'le' },
    { key: 'temp', re: /溫度|temperature|工作溫度/i, mode: 'cover' },
    { key: 'interface', re: /介面|I2C|SPI|UART|CAN|LIN|USB|SMBus|PMBus/i, mode: 'superset' },
    { key: 'bits', re: /解析度|bit\b/i, mode: 'ge' },
    { key: 'sps', re: /取樣率|SPS|sample rate/i, mode: 'ge' },
    { key: 'fsw', re: /切換頻率|開關頻率|fSW/i, mode: 'equalish' },
    { key: 'esd', re: /ESD|HBM/i, mode: 'ge' },
    { key: 'aecq', re: /AEC|車規/i, mode: 'flag' },
  ];

  // 商務／流程類準則：datasheet 上沒有這些資訊，自動判定一律不碰。
  // （沒有這道閘，「供貨與封裝標示…」會被 package 的關鍵字「封裝」誤命中而判成相容。）
  const NON_TECH = /供貨|交期|價格|成本|庫存|停產|生命週期|Tape\s*&?\s*Reel|日期碼|包裝標示|產線|認證文件|樣品|廠商聲明/i;

  /** @param crit 準則字串陣列（ic.secondSource）；A=現用料、B=候選料 */
  function judge(crit, A, B) {
    return (crit || []).map(text => {
      if (NON_TECH.test(text)) return { text, verdict: 'manual', why: '供貨／流程類條件，datasheet 判不了' };
      const hit = MAP.find(m => m.re.test(text));
      if (!hit) return { text, verdict: 'manual', why: '這條準則沒有對應到可自動擷取的參數' };
      const a = A.params[hit.key], b = B.params[hit.key];
      if (!a || !b) return { text, verdict: 'manual', why: `${a ? '候選料' : '現用料'}的 datasheet 未擷取到「${labelOf(hit.key)}」` };
      if (a.ambiguous || b.ambiguous) {
        return { text, verdict: 'manual', a: a.value, b: b.value,
          why: '同一份 datasheet 給出多個值（常見於一份文件涵蓋整個系列），無法確定屬於哪一顆' };
      }
      const r = compare(hit, a, b);
      return { text, verdict: r.verdict, why: r.why, a: a.value, b: b.value };
    });
  }
  const labelOf = k => (RULES.find(r => r.key === k) || {}).label || k;

  function compare(hit, a, b) {
    const A = a.value, B = b.value;
    switch (hit.mode) {
      case 'equal':
        return String(A).toUpperCase() === String(B).toUpperCase()
          ? { verdict: 'ok', why: `兩邊都是 ${A}` }
          : { verdict: 'ng', why: `${A} vs ${B} 不同` };
      case 'cover':
        if (a.lo === undefined || b.lo === undefined) return manual();
        return (b.lo <= a.lo && b.hi >= a.hi)
          ? { verdict: 'ok', why: `候選 ${B} 涵蓋現用 ${A}` }
          : { verdict: 'ng', why: `候選 ${B} 未涵蓋現用 ${A}` };
      case 'ge':
        if (a.n === undefined || b.n === undefined) return manual();
        return b.n >= a.n ? { verdict: 'ok', why: `候選 ${B} ≥ 現用 ${A}` } : { verdict: 'ng', why: `候選 ${B} < 現用 ${A}` };
      case 'le':
        if (a.n === undefined || b.n === undefined) return manual();
        return b.n <= a.n ? { verdict: 'ok', why: `候選 ${B} ≤ 現用 ${A}` } : { verdict: 'ng', why: `候選 ${B} > 現用 ${A}` };
      case 'superset':
        if (!a.set || !b.set) return manual();
        { const miss = a.set.filter(x => b.set.indexOf(x) < 0);
          return miss.length ? { verdict: 'ng', why: `候選缺少 ${miss.join('/')}` } : { verdict: 'ok', why: `候選涵蓋 ${a.set.join('/')}` }; }
      case 'flag':
        return (!!a.flag === !!b.flag) ? { verdict: 'ok', why: '兩邊標示一致' } : { verdict: 'ng', why: `現用 ${a.flag ? '有' : '無'}、候選 ${b.flag ? '有' : '無'}` };
      case 'equalish':
        if (a.n === undefined || b.n === undefined) return manual();
        return Math.abs(a.n - b.n) / Math.max(a.n, b.n) <= 0.2
          ? { verdict: 'ok', why: `${A} 與 ${B} 相差在 20% 內` }
          : { verdict: 'manual', why: `${A} 與 ${B} 差異超過 20%，要看回路設計能否接受` };
      default: return manual();
    }
    function manual() { return { verdict: 'manual', why: '數值語意不明確，需人工確認' }; }
  }

  /* ---------------- 報告 ---------------- */
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const STATE = { same: ['相同', '#15803d'], diff: ['不同', '#b91c1c'], partial: ['僅一邊有', '#b45309'], none: ['兩邊都未擷取', '#94a3b8'] };
  const VERD = { ok: ['符合', '#15803d'], ng: ['不符合', '#b91c1c'], manual: ['需人工確認', '#b45309'] };

  function reportHTML(o) {
    const { A, B, rows, ic, fileA, fileB } = o;
    const same = sameDoc(A, B);
    // 兩份是同一份文件時，任何「符合」都只是在跟自己比 —— 摘要照算會讓人誤以為可以換料。
    // 全部轉人工，數字才不會說謊。
    const checks = same
      ? (o.checks || []).map(c => ({ text: c.text, verdict: 'manual', why: '兩份檔案是同一份文件，這條判定沒有鑑別力' }))
      : (o.checks || []);
    const when = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const tally = k => checks.filter(c => c.verdict === k).length;
    const diffRows = rows.filter(r => r.state === 'diff').length;
    const partyRow = (l, a, b) => `<tr><th>${esc(l)}</th><td>${esc(a || '—')}</td><td>${esc(b || '—')}</td></tr>`;
    return `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8">
<title>2nd Source 比對報告 — ${esc(A.part || fileA)} vs ${esc(B.part || fileB)}</title>
<style>
 body{font:14px/1.6 system-ui,"Noto Sans TC",sans-serif;color:#1d2943;margin:0;padding:32px;background:#f8fafc}
 .sheet{max-width:880px;margin:0 auto;background:#fff;padding:32px 36px;border:1px solid #e2e8f0;border-radius:10px}
 h1{font-size:20px;margin:0 0 4px} h2{font-size:15px;margin:26px 0 8px;padding-bottom:4px;border-bottom:2px solid #e2e8f0}
 .meta{color:#64748b;font-size:12px}
 table{width:100%;border-collapse:collapse;font-size:13px;margin:8px 0}
 th,td{border:1px solid #e2e8f0;padding:6px 9px;text-align:left;vertical-align:top}
 th{background:#f8fafc;font-weight:600;white-space:nowrap}
 .tag{display:inline-block;padding:1px 7px;border-radius:99px;font-size:11px;font-weight:600;color:#fff;white-space:nowrap}
 .sum{display:flex;gap:10px;flex-wrap:wrap;margin:10px 0}
 .sum div{border:1px solid #e2e8f0;border-radius:8px;padding:8px 14px;font-size:13px}
 .note{background:#fffbeb;border-left:3px solid #b45309;padding:9px 12px;font-size:12px;color:#7c4a03;margin:14px 0}
 .btn{position:fixed;right:24px;top:24px;padding:9px 16px;border:0;border-radius:8px;background:#1f4fd1;color:#fff;font-size:14px;cursor:pointer}
 @media print{body{background:#fff;padding:0}.sheet{border:0;max-width:none;padding:0}.btn{display:none}
   table{page-break-inside:auto} tr{page-break-inside:avoid}}
</style></head><body>
<button class="btn" onclick="window.print()">列印 / 存成 PDF</button>
<div class="sheet">
 <h1>2nd Source 比對報告</h1>
 <div class="meta">現用料：<b>${esc(A.part || '(未辨識)')}</b>${A.mfr ? '（' + esc(A.mfr) + '）' : ''} — ${esc(fileA)}<br>
 候選料：<b>${esc(B.part || '(未辨識)')}</b>${B.mfr ? '（' + esc(B.mfr) + '）' : ''} — ${esc(fileB)}<br>
 產出時間 ${esc(when)}${ic ? ' · 準則來源：HardwareAI IC 元件庫 ' + esc(ic.part) : ''}</div>

 <div class="note">本報告由 datasheet 全文自動擷取而成，只能當<b>初篩</b>。抽不到的欄位標「未擷取」，
 不代表該規格不存在；判定為「符合」也只表示自動擷取到的數值通過該條準則。
 最終仍以 datasheet 原文、廠商確認與樣品實測為準。檔案全程只在你的瀏覽器內解析，未上傳。</div>

 ${same ? `<div class="note" style="background:#fef2f2;border-left-color:#b91c1c;color:#7f1d1d">
 <b>這兩個檔案的內容相同</b>——很可能是同一份系列 datasheet（一份文件涵蓋多顆料號）。
 這種情況下「參數全部相同」不代表兩顆料可以互換，下面的判定沒有鑑別力。
 請改用各料號自己的 datasheet，或直接看文件內的型號對照表。</div>` : ''}

 <h2>結論摘要</h2>
 <div class="sum">
  <div>準則 <b>${checks.length}</b> 條</div>
  <div><span class="tag" style="background:${VERD.ok[1]}">符合 ${tally('ok')}</span></div>
  <div><span class="tag" style="background:${VERD.ng[1]}">不符合 ${tally('ng')}</span></div>
  <div><span class="tag" style="background:${VERD.manual[1]}">需人工確認 ${tally('manual')}</span></div>
  <div>參數差異 <b>${diffRows}</b> 項</div>
 </div>
 ${tally('ng') ? `<p style="color:#b91c1c;font-weight:600">有 ${tally('ng')} 條準則判定不符合 —— 這些必須先解決，否則不能當 2nd source。</p>`
        : `<p style="color:#15803d;font-weight:600">自動判定沒有發現不符合項；剩下 ${tally('manual')} 條要人工確認。</p>`}

 <h2>參數差異表</h2>
 <table><thead><tr><th>參數</th><th>現用料</th><th>候選料</th><th>判定</th></tr></thead><tbody>
 ${rows.map(r => `<tr><th>${esc(r.label)}</th><td>${esc(r.a || '未擷取')}</td><td>${esc(r.b || '未擷取')}</td>
   <td><span class="tag" style="background:${STATE[r.state][1]}">${STATE[r.state][0]}</span></td></tr>`).join('')}
 </tbody></table>

 <h2>替換準則逐條判定</h2>
 ${checks.length ? `<table><thead><tr><th style="width:46%">準則</th><th>判定</th><th>依據</th></tr></thead><tbody>
 ${checks.map(c => `<tr><td>${esc(c.text)}</td>
   <td><span class="tag" style="background:${VERD[c.verdict][1]}">${VERD[c.verdict][0]}</span></td>
   <td>${esc(c.why)}</td></tr>`).join('')}
 </tbody></table>` : '<p style="color:#64748b">這顆 IC 在元件庫裡沒有替換準則，僅提供上方參數差異表。</p>'}

 <h2>兩份文件的基本資訊</h2>
 <table><tbody>
 ${partyRow('檔名', fileA, fileB)}
 ${partyRow('辨識到的料號', A.part, B.part)}
 ${partyRow('辨識到的廠商', A.mfr, B.mfr)}
 ${partyRow('取出的文字量', A.chars.toLocaleString() + ' 字', B.chars.toLocaleString() + ' 字')}
 </tbody></table>
 <p class="meta" style="margin-top:18px">HardwareAI 硬體實驗室 — IC 元件庫 2nd Source 比對</p>
</div></body></html>`;
  }

  /* ---------------- pdf.js 取文字（瀏覽器端） ---------------- */
  async function extractText(file) {
    const lib = root.pdfjsLib || root['pdfjs-dist/build/pdf'];
    if (!lib) throw new Error('pdf.js 未載入');
    if (lib.GlobalWorkerOptions && !lib.GlobalWorkerOptions.workerSrc) {
      lib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
    const buf = await file.arrayBuffer();
    const pdf = await lib.getDocument({ data: buf }).promise;
    let out = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const tc = await page.getTextContent();
      out += tc.items.map(it => it.str).join(' ') + '\n';
    }
    return out;
  }

  root.DSCompare = { RULES, parse, diff, judge, reportHTML, extractText, sameDoc };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.DSCompare;
})(typeof window !== 'undefined' ? window : globalThis);
