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
  /** 同一份文件同時給出多個不同值（例：一份 datasheet 涵蓋 16-bit 與 24-bit 兩顆）
   *  → 標成 ambiguous，judge 一律轉人工，不猜是哪一顆。 */
  const multi = (list, fmt) => {
    const uniq = [...new Set(list)];
    if (!uniq.length) return null;
    if (uniq.length === 1) return { one: uniq[0] };
    return { ambiguous: true, value: uniq.map(fmt).join(' / ') };
  };

  /* ---------------- 文字正規化 ----------------
   * PDF 抽出來的字有三類雜訊，會讓規則抓不到、或抓到隔壁欄的數字：
   *   1) 符號變體：μ(U+03BC) 與 µ(U+00B5)、℃(U+2103)、各種破折號、全形空白
   *   2) 字元之間被塞空白：「60 μ A」「− 40 ° C」
   *   3) 目錄與規格表的引導線：「Supply Input Voltage --------- 1.8V to 5.5V」
   * 正規化之後才能要求「數值與單位相鄰」——那是擋掉誤抽最有效的一道閘。
   * 注意：不動連續兩個的「--」，那在規格表裡是「此欄無值」的佔位符，
   * 收掉的話「-- 60 -- A」會被讀成「60 A」（真值是 60 µA，差六個數量級）。 */
  function norm(t0) {
    return String(t0 || '')
      .replace(/[ 　]/g, ' ')
      .replace(/℃/g, ' °C').replace(/℉/g, ' °F')
      .replace(/[µμ]/g, 'µ')
      .replace(/[‐-―−]/g, '-')
      .replace(/[.·•_]{4,}/g, ' ').replace(/-{4,}/g, ' ')
      .replace(/µ\s+(?=[AVFHSW])/g, 'µ')
      .replace(/(\d)\s*°\s*([CF])\b/g, '$1 °$2')
      .replace(/([\s(:=,[])-\s+(\d)/g, '$1-$2')
      .replace(/[ \t]{2,}/g, ' ');
  }

  /* ---------------- 章節 ----------------
   * Absolute Maximum Ratings 是「超過會壞」不是「可以這樣用」。
   * 實測 W25Q128JV：abs max 寫「VCC -0.6 to 4.6 V」，被當成工作電壓抽出來，
   * 真正的工作範圍是 2.7~3.6V。整段跳過比較安全。 */
  const SECTION = [
    [/^\s*(?:\d+(?:\.\d+)*\.?\s*)?absolute\s+maximum\s+ratings|絕對最大額定|絕對最大值/i, 'absmax'],
    [/^\s*(?:\d+(?:\.\d+)*\.?\s*)?(?:recommended\s+operating\s+conditions|operating\s+ranges?|operating\s+conditions)/i, 'roc'],
    [/^\s*(?:\d+(?:\.\d+)*\.?\s*)?(?:electrical\s+characteristics|electrical\s+specifications|[da]c\s+characteristics|電氣特性)/i, 'ec'],
    [/^\s*(?:\d+(?:\.\d+)*\.?\s*)?(?:ordering\s+information|package\s+(?:information|outline|dimension)|revision\s+history|typical\s+(?:operating\s+)?(?:characteristics|performance)|thermal\s+information|application\s+information)/i, 'other'],
  ];
  /** 逐列標上所屬章節；'head' = 標題／Features／General Description（規格常寫在敘述裡）。 */
  function sectioned(t) {
    let sect = 'head';
    return norm(t).split('\n').map(text => {
      for (const [re, s] of SECTION) if (re.test(text)) { sect = s; break; }
      return { text, sect };
    });
  }
  const RXESC = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  /** 單位字母表（長的排前面，否則 'A' 會先吃掉 'mA'） */
  function unitAlt(kind) {
    return Object.keys(UNIT[kind] || {}).sort((a, b) => b.length - a.length).map(RXESC).join('|');
  }
  const NUM = '(-?\\d[\\d,]*(?:\\.\\d+)?)';
  /** 數值＋單位，且兩者最多隔一個空白 */
  const numUnitRe = kind => new RegExp(NUM + '\\s?(' + unitAlt(kind) + ')(?![A-Za-z0-9µΩ])', 'gi');
  /** 規格表的 MIN TYP MAX 三欄（`--` 是空欄）：三個值排一列、單位在最後 */
  const mtmRe = kind => new RegExp('(-?[\\d.]+|--)\\s+(-?[\\d.]+|--)\\s+(-?[\\d.]+|--)\\s*(' + unitAlt(kind) + ')(?![A-Za-z0-9µΩ])', 'i');

  /** 在同一列裡找「標籤 → 數值(含單位)」的候選。
   *  四道閘，缺一就會出現使用者實測到的「IQ = 160 mA」那種誤抽：
   *   a) 數值與單位必須相鄰      擋掉「-- 60 -- A」被讀成 60 A
   *   b) 數值前面是「=」就跳過   擋掉測試條件「I OUT = 0mA」被當成 IQ 的值
   *   c) 數值要在合理量級內      擋掉 IQ = 160 mA 這種不可能的值
   *   d) 跳過 Absolute Maximum   那是不可超過值，不是工作值
   *  另外處理 MIN TYP MAX 三欄列：取 TYP（中間），不是掃到的第一個或最大的那個。
   *  @param opt { label, kind, win, back, min, max, reject, prefer } */
  function findNum(t, opt) {
    const out = [];
    const win = opt.win || 70, back = opt.back || 44;
    for (const ln of sectioned(t)) {
      if (ln.sect === 'absmax') continue;
      const lab = new RegExp(opt.label.source, 'gi');
      let m;
      while ((m = lab.exec(ln.text))) {
        const around = ln.text.slice(Math.max(0, m.index - back), m.index + m[0].length + win);
        if (opt.reject && opt.reject.test(around)) continue;
        const end = m.index + m[0].length;
        const fwd = ln.text.slice(end, end + win);
        const cand = pickNum(fwd, opt) || pickNum(ln.text.slice(Math.max(0, m.index - back), m.index), opt, true);
        if (cand) out.push({ n: cand.n, value: cand.value, sect: ln.sect });
        if (lab.lastIndex <= m.index) break;
      }
    }
    return out;
  }
  /** 從一段文字取一個值；backward=true 時取最靠近標籤的（也就是最後一個）。 */
  function pickNum(seg, opt, backward) {
    if (!seg) return null;
    const ok = raw => {
      const s = scale(opt.kind, raw[2] || raw[4]); if (s === null) return null;
      const n = num(raw[1]); if (n === null) return null;
      const v = n * s, a = Math.abs(v);
      if (opt.min !== undefined && a < opt.min) return null;
      if (opt.max !== undefined && a > opt.max) return null;
      return { n: v, value: raw[1] + ' ' + (raw[2] || raw[4]) };
    };
    const mtm = seg.match(mtmRe(opt.kind));
    if (mtm) {
      const typ = [mtm[2], mtm[1], mtm[3]].find(x => x && x !== '--');
      if (typ) { const r = ok([null, typ, mtm[4]]); if (r) return r; }
    }
    const re = numUnitRe(opt.kind);
    let v, last = null;
    while ((v = re.exec(seg))) {
      const before = seg.slice(0, v.index);
      if (/=\s*[-+]?$/.test(before)) continue;   // 測試條件，不是規格值
      const r = ok(v);
      if (!r) continue;
      if (!backward) return r;
      last = r;
    }
    return last;
  }
  /** 章節優先序：規格表 > 工作條件 > 敘述文字；同章節取第一個。 */
  function preferOne(list, order) {
    for (const s of (order || ['ec', 'roc', 'head', 'other'])) {
      const h = list.find(c => c.sect === s);
      if (h) return h;
    }
    return list[0] || null;
  }

  /** 範圍（電壓／溫度）。標籤可以在範圍前面也可以在後面
   *  （「2.7V to 3.6V power supply」這種寫法標籤在後）。 */
  function findRange(t, opt) {
    const U = opt.unit === 'C' ? '°\\s?[CF]' : 'V';
    const SEP = opt.loose ? '(?:to|~|至|-|—|and|\\s)' : '(?:to|~|至|-|—|and)';
    const src = NUM + '\\s*(?:' + U + ')?\\s*' + SEP + '\\s*\\+?' + NUM + '\\s*(?:' + U + ')';
    const out = [];
    for (const ln of sectioned(t)) {
      if (ln.sect === 'absmax') continue;
      const re = new RegExp(src, 'gi');
      let m;
      while ((m = re.exec(ln.text))) {
        const lo = num(m[1]), hi = num(m[2]);
        if (lo === null || hi === null || lo >= hi) continue;
        if (/=\s*[-+]?$/.test(ln.text.slice(0, m.index))) continue;   // 測試條件，不是規格範圍
        if (opt.span !== undefined && hi - lo < opt.span) continue;
        if (opt.min !== undefined && lo < opt.min) continue;
        if (opt.max !== undefined && hi > opt.max) continue;
        const around = ln.text.slice(Math.max(0, m.index - 80), m.index)
          + ' | ' + ln.text.slice(m.index + m[0].length, m.index + m[0].length + 40);
        if (!new RegExp(opt.label.source, 'i').test(around)) continue;
        if (opt.reject && opt.reject.test(around)) continue;
        out.push({ lo, hi, sect: ln.sect, value: lo + ' ~ ' + hi + (opt.unit === 'C' ? ' °C' : ' V') });
      }
    }
    return out;
  }

  /* ---------------- 參數抽取規則 ----------------
   * 每條規則：找到就回 { value（顯示用原文）, n / lo / hi（正規化數值）, kind }
   * 找不到回 null —— 呼叫端據此顯示「未擷取」。寧可未擷取，不可給錯的值。 */

  const RULES = [
    {
      key: 'package', label: '封裝', kind: 'text',
      run: t => {
        // TI 寫成「RTE (WQFN, 16)」、有的寫「WQFN-16」、有的寫「16-Pin WQFN」、
        // Richtek 寫「WDFN-10L」（腳數後面還有一個 L）——四種都要收
        const NAMES = 'WDFN|UDFN|VDFN|WQFN|VQFN|HVQFN|UQFN|QFN|WSON|USON|DFN|DSBGA|WLCSP|LQFP|TQFP|HTSSOP|TSSOP|VSSOP|MSOP|SOIC|SOP|SOT-?23|SOT-?223|TO-?220|TO-?252|DIP|BGA|LGA|CSP';
        const hits = [];
        // 腳數必須合理（4~256）：不設限的話「WQFN 0.5mm」會被讀成 WQFN-0
        const okPins = n => { const v = +n; return v >= 4 && v <= 256; };
        const push = (name, n) => { if (n && !okPins(n)) return; hits.push(String(name).toUpperCase().replace(/\s/g, '') + (n ? '-' + n : '')); };
        let m;
        // 分隔只認逗號或左括號（TI 寫「RTE (WQFN, 16)」）；允許空白會把後面的尺寸數字當腳數
        const re1 = new RegExp('\\b(' + NAMES + ')\\s*[,(]\\s*(\\d{1,3})\\b', 'gi');
        while ((m = re1.exec(t))) push(m[1], m[2]);
        // 尾綴 L / P / -PIN：WDFN-10L、TSSOP-20P
        const re2 = new RegExp('\\b(' + NAMES + ')\\s*-\\s*(\\d{1,3})\\s*(?:L|P|-?pins?|-?lead)?\\b', 'gi');
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
        if (pkg.ambiguous) return { value: PINS_AMBIG.zh, i18nKey: 'pinsAmbig', ambiguous: true };
        const m = String(pkg.value).match(/-(\d{1,3})$/);
        return m ? { value: m[1] + ' pin', n: num(m[1]) } : null;
      },
    },
    {
      key: 'vin', label: '輸入電壓範圍', kind: 'range',
      run: t => {
        const hit = preferOne(findRange(t, {
          label: /V\s?(?:IN|CC|DD|S|SUPPLY)|supply\s+voltage|input\s+voltage|power\s+supply|operating\s+voltage|工作電壓/i,
          unit: 'V', min: 0.5, max: 60,
          reject: /output\s+voltage|V\s?OUT|reference|storage|絕對/i,
        }), ['roc', 'ec', 'head', 'other']);
        return hit ? { value: hit.value, lo: hit.lo, hi: hit.hi } : null;
      },
    },
    {
      key: 'vout', label: '輸出電壓', kind: 'range',
      // 陷阱：ADC 的「INTERNAL VOLTAGE REFERENCE ... Output voltage 1.25V」不是輸出電壓。
      run: t => {
        const LBL = /V\s?OUT|output\s+voltage|輸出電壓/i;
        const REJ = /REFERENCE|V\s?REF|REF\s+buffer|input\s+voltage|V\s?IN\b/i;
        const rng = preferOne(findRange(t, { label: LBL, unit: 'V', min: 0.3, max: 60, reject: REJ }), ['roc', 'ec', 'head', 'other']);
        if (rng) return { value: rng.value, lo: rng.lo, hi: rng.hi };
        const one = preferOne(findNum(t, { label: LBL, kind: 'V', min: 0.3, max: 60, reject: REJ }), ['ec', 'roc', 'head', 'other']);
        return one ? { value: one.value, lo: one.n, hi: one.n } : null;
      },
    },
    {
      key: 'iout', label: '輸出電流', kind: 'num',
      run: t => {
        const hit = preferOne(findNum(t, {
          label: /I\s?OUT|output\s+current|continuous\s+current|load\s+current|輸出電流/i,
          kind: 'A', min: 1e-6, max: 100,
          reject: /leakage|quiescent|input\s+current/i,
        }), ['ec', 'head', 'roc', 'other']);
        return hit ? { value: hit.value, n: hit.n } : null;
      },
    },
    {
      key: 'iq', label: '靜態電流 IQ', kind: 'num',
      // 上限 50 mA：靜態電流大於這個量級的不是 IQ，是誤抽（使用者實測遇過 160 mA）
      run: t => {
        const hit = preferOne(findNum(t, {
          label: /quiescent\s+current|standby\s+current|static\s+current|supply\s+current|I\s?Q\b|I\s?DD\b|I\s?CC\b|I\s?AVDD\b|I\s?DVDD\b|靜態電流/i,
          kind: 'A', min: 1e-10, max: 0.05,
          reject: /output\s+current|load\s+current|leakage/i,
        }), ['ec', 'head', 'roc', 'other']);
        return hit ? { value: hit.value, n: hit.n } : null;
      },
    },
    {
      key: 'rdson', label: 'RDS(on)', kind: 'num',
      run: t => {
        const hit = preferOne(findNum(t, {
          label: /R\s?DS\s*\(?\s*on\s*\)?|導通電阻/i, kind: 'R', min: 1e-4, max: 100,
        }), ['ec', 'head', 'roc', 'other']);
        return hit ? { value: hit.value, n: hit.n } : null;
      },
    },
    {
      key: 'temp', label: '工作溫度', kind: 'range',
      // 實測 TI 排版是「Operating ambient temperature –40 125 °C」：中間沒有 to，
      // 破折號是 en-dash，°C 只出現在尾巴 → loose 允許用空白當分隔。
      // 但 storage / lead / soldering 溫度不是工作溫度，要擋掉。
      run: t => {
        const NOT = /storage|保存|lead\s+temperature|soldering|reflow|θ|thermal\s+resistance/i;
        const order = ['roc', 'ec', 'head', 'other'];
        // 先找環境溫度；找不到才退而用接面溫度（Tj 通常比 Ta 寬，直接拿去比會高估）
        const amb = preferOne(findRange(t, {
          label: /ambient|operating|free-?air|工作溫度|T\s?A\b/i, unit: 'C', loose: true,
          min: -100, max: 200, span: 40, reject: new RegExp(NOT.source + '|junction|T\\s?J\\b', 'i'),
        }), order);
        const hit = amb || preferOne(findRange(t, {
          label: /junction|temperature/i, unit: 'C', loose: true, min: -100, max: 200, span: 40, reject: NOT,
        }), order);
        return hit ? { value: hit.value, lo: hit.lo, hi: hit.hi } : null;
      },
    },
    {
      key: 'interface', label: '介面', kind: 'set',
      // 只掃文件前段（標題＋Features＋概述）：內文提到「EVM 用 USB 供電」不是這顆的介面
      run: t0 => {
        const t = norm(t0).slice(0, 6000);
        const hit = [];
        [['I2C', /\bI\s?2\s?C\b|\bIIC\b|\bTWSI\b|\bTWI\b/i], ['SPI', /\bSPI\b/i], ['UART', /\bUART\b/i], ['CAN', /\bCAN(?:\s?FD)?\b/],
        ['LIN', /\bLIN\b/], ['USB', /\bUSB\b/i], ['SMBus', /\bSMBus\b/i], ['PMBus', /\bPMBus\b/i], ['I3C', /\bI3C\b/i]]
          .forEach(([n, re]) => { if (re.test(t)) hit.push(n); });
        return hit.length ? { value: hit.join(', '), set: hit } : null;
      },
    },
    {
      key: 'bits', label: '解析度', kind: 'num',
      // 「Low-power, 16- and 24-Bit ADC」這種標題代表一份文件涵蓋兩顆 → 不猜是哪一顆
      // 只從標題附近抓：內文的「16-bit register」「8-bit mode」不是這顆的解析度
      run: t0 => {
        const t = norm(t0);
        const head = t.slice(0, 400);
        const both = head.match(/(\d{1,2})\s*-?\s*and\s*(\d{1,2})\s*-?\s*bit/i);
        if (both) return { value: both[1] + ' / ' + both[2] + '-bit', ambiguous: true };
        const m = head.match(/(\d{1,2})\s*-?\s*bit\b/i);
        if (!m) return null;
        const n = num(m[1]);
        return (n >= 4 && n <= 32) ? { value: m[1] + '-bit', n } : null;
      },
    },
    {
      key: 'sps', label: '取樣率', kind: 'num',
      run: t0 => {
        const t = norm(t0);
        const m = t.match(new RegExp(NUM + '\\s?(MSPS|kSPS|SPS)\\b', 'i'));
        if (!m) return null;
        const s = scale('SPS', m[2]); if (s === null) return null;
        return { value: m[1] + ' ' + m[2], n: num(m[1]) * s };
      },
    },
    {
      key: 'fsw', label: '切換頻率', kind: 'num',
      run: t => {
        const hit = preferOne(findNum(t, {
          label: /switching\s+frequency|f\s?SW\b|f\s?OSC\b|oscillator\s+frequency|切換頻率|開關頻率/i,
          kind: 'Hz', min: 1e3, max: 1e8,
        }), ['ec', 'head', 'roc', 'other']);
        return hit ? { value: hit.value, n: hit.n } : null;
      },
    },
    {
      key: 'esd', label: 'ESD (HBM)', kind: 'num',
      // ESD 寫在 Absolute Maximum Ratings 底下是正常的，所以這條不跳過該章節
      run: t0 => {
        const t = norm(t0);
        const m = t.match(new RegExp('HBM[^\\n]{0,40}?' + NUM + '\\s?(kV|V)\\b', 'i'))
          || t.match(new RegExp('Human\\s+Body\\s+Model[^\\n]{0,40}?' + NUM + '\\s?(kV|V)\\b', 'i'))
          || t.match(new RegExp(NUM + '\\s?(kV|V)[^\\n]{0,20}HBM', 'i'));
        if (!m) return null;
        const s = scale('V', m[2]); if (s === null) return null;
        const n = num(m[1]) * s;
        return (n >= 100 && n <= 30000) ? { value: m[1] + ' ' + m[2], n } : null;
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
    ['Vishay', /Vishay/i], ['MPS', /Monolithic Power/i], ['Richtek', /Richtek/i], ['Rohm', /ROHM/i],
    ['Winbond', /Winbond/i], ['Macronix', /Macronix/i], ['GigaDevice', /GigaDevice/i],
    ['X-Powers', /X-?Powers/i], ['Nexperia', /Nexperia/i], ['Toshiba', /Toshiba/i]]
      .find(([, re]) => re.test(text));
    // 料號：檔名優先（使用者自己命名的最準），否則抓全文最像料號的字串
    let part = null;
    const fromName = String(fileName || '').replace(/\.[a-z]+$/i, '').match(/[A-Z]{1,5}\d{2,}[A-Z0-9-]*/i);
    if (fromName) part = fromName[0].toUpperCase();
    if (!part) { const m = text.match(/\b([A-Z]{2,5}\d{2,5}[A-Z0-9-]{0,8})\b/); if (m) part = m[1]; }
    return { part, mfr: mfr ? mfr[0] : null, partFromName: !!fromName };
  }

  /** 解析一份 datasheet 全文 → { part, mfr, params:{key:{...}|null}, warn:[...] }
   *  warn 是「這份輸入本身有問題」的訊號，報告要直接講出來 ——
   *  滿頁「未擷取」看起來像功能壞掉，其實常常是檔案不對（掃描檔、或根本不是這顆料）。 */
  function parse(text, fileName) {
    const t = norm(text);
    const params = {};
    RULES.forEach(r => { try { params[r.key] = r.run(t) || null; } catch (e) { params[r.key] = null; } });
    const h = head(t, fileName);
    const got = RULES.filter(r => params[r.key]).length;
    const flat = t.replace(/[\s-]/g, '').toUpperCase();
    const warn = [];
    if (flat.length < 1200) warn.push({ w: 'noText' });
    else if (got <= 2) warn.push({ w: 'lowYield' });
    if (h.partFromName && h.part && flat.indexOf(h.part.replace(/-/g, '')) < 0) warn.push({ w: 'part', part: h.part });
    return Object.assign({ params, chars: t.length, raw: t, warn, got }, h);
  }

  /** 兩份 PDF 其實是同一份文件嗎？（TI/ADI 常用一份 datasheet 涵蓋整個系列）
   *  若是，「全部相同」這個結論會誤導人以為可以直接換料 —— 必須在報告最上方明講。 */
  function sameDoc(A, B) {
    if (!A.raw || !B.raw) return false;
    if (Math.abs(A.chars - B.chars) > 8) return false;
    return A.raw.slice(0, 3000) === B.raw.slice(0, 3000);
  }

  /** 兩份的參數逐條比對 → [{key,label,a,b,state}]；state: same | diff | partial | none */
  function diff(A, B, lang) {
    const lg = lang && L[lang] ? lang : 'zh';
    const tr = v => (v && v.i18nKey === 'pinsAmbig') ? (PINS_AMBIG[lg] || PINS_AMBIG.zh) : (v ? v.value : null);
    return RULES.map(r => {
      const a = A.params[r.key], b = B.params[r.key];
      let state = 'none';
      if (a && b) state = sameValue(r, a, b) ? 'same' : 'diff';
      else if (a || b) state = 'partial';
      return { key: r.key, label: plabel(r.key, lg), kind: r.kind, a: tr(a), b: tr(b), state };
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

  /* ---------------- 四語字典（報告與判定理由） ----------------
   * 判定理由是程式產生的句子，寫死中文的話英日韓使用者看到的報告會是半中半英。
   * 所以 judge()/reportHTML() 都吃 lang，句子用樣板產生。 */
  const L = {
    zh: {
      title: '2nd Source 比對報告', inUse: '現用料', cand: '候選料', at: '產出時間',
      critFrom: '準則來源：HardwareAI IC 元件庫',
      unknown: '(未辨識)', notExtracted: '未擷取', print: '列印 / 存成 PDF',
      disclaimer: '本報告由 datasheet 全文自動擷取而成，只能當<b>初篩</b>。抽不到的欄位標「未擷取」，不代表該規格不存在；判定為「符合」也只表示自動擷取到的數值通過該條準則。最終仍以 datasheet 原文、廠商確認與樣品實測為準。檔案全程只在你的瀏覽器內解析，未上傳。',
      sameDoc: '<b>這兩個檔案的內容相同</b>——很可能是同一份系列 datasheet（一份文件涵蓋多顆料號）。這種情況下「參數全部相同」不代表兩顆料可以互換，下面的判定沒有鑑別力。請改用各料號自己的 datasheet。',
      wNoText: '<b>這份 PDF 幾乎沒有可抽取的文字</b>——多半是掃描檔或圖片型 PDF。下面幾乎每一欄都會是「未擷取」，這份比對不能用。',
      wLowYield: '<b>這份 PDF 只抽到極少數參數</b>——可能排版特殊，或這不是完整的 datasheet。下面的欄位請以原文為準。',
      wPart: p => `<b>檔名寫的料號「${p}」沒有出現在這份 PDF 的內文</b>——請確認上傳的就是這顆料的 datasheet。`,
      summary: '結論摘要', nCrit: n => `準則 ${n} 條`, nDiff: n => `參數差異 <b>${n}</b> 項`,
      hasNg: n => `有 ${n} 條準則判定不符合 —— 這些必須先解決，否則不能當 2nd source。`,
      noNg: n => `自動判定沒有發現不符合項；剩下 ${n} 條要人工確認。`,
      paramTable: '參數差異表', param: '參數', verdict: '判定', basis: '依據',
      critTable: '替換準則逐條判定', crit: '準則', noCrit: '這顆 IC 在元件庫裡沒有替換準則，僅提供上方參數差異表。',
      docInfo: '兩份文件的基本資訊', fileName: '檔名', detPart: '辨識到的料號', detMfr: '辨識到的廠商',
      textAmt: '取出的文字量', chars: n => n.toLocaleString() + ' 字',
      foot: 'HardwareAI 硬體實驗室 — IC 元件庫 2nd Source 比對',
      st: { same: '相同', diff: '不同', partial: '僅一邊有', none: '兩邊都未擷取' },
      vd: { ok: '符合', ng: '不符合', manual: '需人工確認' },
      why: {
        nonTech: '供貨／流程類條件，datasheet 判不了',
        noMap: '這條準則沒有對應到可自動擷取的參數',
        missing: (side, label) => `${side}的 datasheet 未擷取到「${label}」`,
        sideA: '現用料', sideB: '候選料',
        ambiguous: '同一份 datasheet 給出多個值（常見於一份文件涵蓋整個系列），無法確定屬於哪一顆',
        sameDoc: '兩份檔案是同一份文件，這條判定沒有鑑別力',
        vague: '數值語意不明確，需人工確認',
        eqOk: v => `兩邊都是 ${v}`, eqNg: (a, b) => `${a} vs ${b} 不同`,
        coverOk: (a, b) => `候選 ${b} 涵蓋現用 ${a}`, coverNg: (a, b) => `候選 ${b} 未涵蓋現用 ${a}`,
        geOk: (a, b) => `候選 ${b} ≥ 現用 ${a}`, geNg: (a, b) => `候選 ${b} < 現用 ${a}`,
        leOk: (a, b) => `候選 ${b} ≤ 現用 ${a}`, leNg: (a, b) => `候選 ${b} > 現用 ${a}`,
        supOk: s => `候選涵蓋 ${s}`, supNg: s => `候選缺少 ${s}`,
        flagOk: '兩邊標示一致', flagNg: (a, b) => `現用 ${a ? '有' : '無'}、候選 ${b ? '有' : '無'}`,
        closeOk: (a, b) => `${a} 與 ${b} 相差在 20% 內`, closeManual: (a, b) => `${a} 與 ${b} 差異超過 20%，要看回路設計能否接受`,
      },
    },
    en: {
      title: '2nd-source comparison report', inUse: 'Part in use', cand: 'Candidate', at: 'Generated',
      critFrom: 'Criteria from the HardwareAI IC library:',
      unknown: '(not identified)', notExtracted: 'not extracted', print: 'Print / Save as PDF',
      disclaimer: 'This report is extracted automatically from the datasheet text and is a <b>first pass only</b>. A field marked "not extracted" does not mean the spec is absent, and a "pass" only means the extracted numbers satisfy that requirement. The datasheet itself, vendor confirmation and bench measurement remain the authority. Files were parsed entirely in your browser and never uploaded.',
      sameDoc: '<b>These two files have identical content</b> — almost certainly one family datasheet covering several part numbers. "Every parameter matches" then says nothing about whether the parts are interchangeable, and the verdicts below have no discriminating power. Use each part\'s own datasheet instead.',
      wNoText: '<b>Almost no extractable text in this PDF</b> — most likely a scan or an image-only file. Nearly every field below will read "not extracted"; this comparison is not usable.',
      wLowYield: '<b>Only a couple of parameters could be extracted from this PDF</b> — unusual layout, or not a full datasheet. Read the fields below against the original document.',
      wPart: p => `<b>The part number "${p}" taken from the file name appears nowhere in this PDF</b> — check that you uploaded the datasheet for this part.`,
      summary: 'Summary', nCrit: n => `${n} requirements`, nDiff: n => `<b>${n}</b> parameter differences`,
      hasNg: n => `${n} requirement(s) failed — these must be resolved before this part can be a 2nd source.`,
      noNg: n => `No automatic failures; ${n} requirement(s) still need human review.`,
      paramTable: 'Parameter differences', param: 'Parameter', verdict: 'Verdict', basis: 'Basis',
      critTable: 'Requirement-by-requirement verdict', crit: 'Requirement',
      noCrit: 'The library has no replacement requirements for this part, so only the parameter table above is available.',
      docInfo: 'About the two documents', fileName: 'File name', detPart: 'Detected part number', detMfr: 'Detected vendor',
      textAmt: 'Text extracted', chars: n => n.toLocaleString() + ' chars',
      foot: 'HardwareAI Hardware Lab — IC library 2nd-source comparison',
      st: { same: 'same', diff: 'different', partial: 'one side only', none: 'neither extracted' },
      vd: { ok: 'pass', ng: 'fail', manual: 'needs review' },
      why: {
        nonTech: 'Supply-chain or process condition; a datasheet cannot answer it',
        noMap: 'This requirement maps to no automatically extractable parameter',
        missing: (side, label) => `"${label}" was not extracted from the ${side} datasheet`,
        sideA: 'part-in-use', sideB: 'candidate',
        ambiguous: 'The datasheet gives several values (common when one document covers a whole family), so the part they belong to is unclear',
        sameDoc: 'Both files are the same document, so this verdict has no discriminating power',
        vague: 'The numbers are not unambiguous; needs human review',
        eqOk: v => `both are ${v}`, eqNg: (a, b) => `${a} vs ${b}`,
        coverOk: (a, b) => `candidate ${b} covers ${a}`, coverNg: (a, b) => `candidate ${b} does not cover ${a}`,
        geOk: (a, b) => `candidate ${b} >= ${a}`, geNg: (a, b) => `candidate ${b} < ${a}`,
        leOk: (a, b) => `candidate ${b} <= ${a}`, leNg: (a, b) => `candidate ${b} > ${a}`,
        supOk: s => `candidate covers ${s}`, supNg: s => `candidate is missing ${s}`,
        flagOk: 'both marked the same', flagNg: (a, b) => `in use ${a ? 'yes' : 'no'}, candidate ${b ? 'yes' : 'no'}`,
        closeOk: (a, b) => `${a} and ${b} are within 20%`, closeManual: (a, b) => `${a} vs ${b} differ by more than 20%; depends on the loop design`,
      },
    },
    ja: {
      title: 'セカンドソース比較レポート', inUse: '現行品', cand: '候補品', at: '作成日時',
      critFrom: '条件の出典：HardwareAI IC ライブラリ',
      unknown: '(判別できず)', notExtracted: '抽出できず', print: '印刷 / PDF に保存',
      disclaimer: '本レポートは datasheet の全文から自動抽出したもので、<b>一次スクリーニング</b>にのみ使えます。「抽出できず」はその仕様が存在しないという意味ではなく、「適合」も抽出できた数値がその条件を満たすという意味にすぎません。最終判断は datasheet 原文・メーカー確認・実測に従ってください。ファイルはブラウザ内だけで解析し、アップロードしていません。',
      sameDoc: '<b>この 2 ファイルは内容が同一です</b>——同じシリーズの datasheet（1 つの文書が複数品番を扱う）である可能性が高く、「全パラメータが同じ」は互換性の根拠になりません。以下の判定に識別力はありません。各品番の datasheet を使ってください。',
      wNoText: '<b>この PDF からはテキストがほとんど取り出せません</b>——スキャン（画像）PDF の可能性が高いです。以下はほぼ「未抽出」になり、この比較は使えません。',
      wLowYield: '<b>この PDF から抽出できたパラメータはごくわずかです</b>——特殊なレイアウト、または完全な datasheet ではない可能性があります。以下は原文と照合してください。',
      wPart: p => `<b>ファイル名の品番「${p}」が本文に見当たりません</b>——この品番の datasheet かどうか確認してください。`,
      summary: '結論サマリー', nCrit: n => `条件 ${n} 件`, nDiff: n => `パラメータ差異 <b>${n}</b> 件`,
      hasNg: n => `${n} 件が不適合 —— 解決しない限りセカンドソースにはできません。`,
      noNg: n => `自動判定での不適合はありません。残り ${n} 件は人手確認が必要です。`,
      paramTable: 'パラメータ差分表', param: 'パラメータ', verdict: '判定', basis: '根拠',
      critTable: '置換条件ごとの判定', crit: '条件',
      noCrit: 'この IC にはライブラリ上の置換条件がないため、上のパラメータ差分表のみです。',
      docInfo: '2 つの文書の基本情報', fileName: 'ファイル名', detPart: '判別した品番', detMfr: '判別したメーカー',
      textAmt: '抽出した文字量', chars: n => n.toLocaleString() + ' 文字',
      foot: 'HardwareAI ハードウェアラボ — IC ライブラリ セカンドソース比較',
      st: { same: '同じ', diff: '異なる', partial: '片方のみ', none: '両方とも抽出できず' },
      vd: { ok: '適合', ng: '不適合', manual: '人手確認' },
      why: {
        nonTech: '供給・工程に関する条件で、datasheet では判定できません',
        noMap: 'この条件に対応する自動抽出可能なパラメータがありません',
        missing: (side, label) => `${side}の datasheet から「${label}」を抽出できませんでした`,
        sideA: '現行品', sideB: '候補品',
        ambiguous: '同じ datasheet が複数の値を示しており（1 文書がシリーズ全体を扱う場合に多い）、どの品番の値か特定できません',
        sameDoc: '2 つのファイルが同一文書のため、この判定に識別力はありません',
        vague: '数値の意味が一義でないため人手確認が必要です',
        eqOk: v => `両方とも ${v}`, eqNg: (a, b) => `${a} と ${b} で異なる`,
        coverOk: (a, b) => `候補 ${b} が現行 ${a} をカバー`, coverNg: (a, b) => `候補 ${b} は現行 ${a} をカバーしない`,
        geOk: (a, b) => `候補 ${b} ≥ 現行 ${a}`, geNg: (a, b) => `候補 ${b} < 現行 ${a}`,
        leOk: (a, b) => `候補 ${b} ≤ 現行 ${a}`, leNg: (a, b) => `候補 ${b} > 現行 ${a}`,
        supOk: s => `候補は ${s} をカバー`, supNg: s => `候補に ${s} がない`,
        flagOk: '両方とも同じ表示', flagNg: (a, b) => `現行 ${a ? 'あり' : 'なし'}、候補 ${b ? 'あり' : 'なし'}`,
        closeOk: (a, b) => `${a} と ${b} の差は 20% 以内`, closeManual: (a, b) => `${a} と ${b} の差が 20% 超。回路設計側で許容できるか確認が必要`,
      },
    },
    ko: {
      title: '세컨드 소스 비교 보고서', inUse: '현재 부품', cand: '후보 부품', at: '생성 시각',
      critFrom: '조건 출처: HardwareAI IC 라이브러리',
      unknown: '(식별 불가)', notExtracted: '추출 안 됨', print: '인쇄 / PDF로 저장',
      disclaimer: '이 보고서는 datasheet 전문에서 자동 추출한 것으로 <b>1차 선별용</b>입니다. "추출 안 됨"은 해당 사양이 없다는 뜻이 아니며, "충족" 역시 추출된 수치가 그 조건을 통과했다는 의미일 뿐입니다. 최종 판단은 datasheet 원문, 제조사 확인, 실측을 따르십시오. 파일은 브라우저 안에서만 해석되었고 업로드되지 않았습니다.',
      sameDoc: '<b>두 파일의 내용이 동일합니다</b> — 한 문서가 여러 부품 번호를 다루는 시리즈 datasheet일 가능성이 큽니다. 이 경우 "모든 파라미터 동일"은 호환 근거가 되지 않으며 아래 판정에는 변별력이 없습니다. 각 부품의 datasheet를 사용하세요.',
      wNoText: '<b>이 PDF에서 추출할 수 있는 텍스트가 거의 없습니다</b> — 스캔(이미지) PDF일 가능성이 큽니다. 아래 항목 대부분이 "미추출"이 되며 이 비교는 사용할 수 없습니다.',
      wLowYield: '<b>이 PDF에서 추출된 파라미터가 매우 적습니다</b> — 특이한 레이아웃이거나 완전한 datasheet가 아닐 수 있습니다. 아래 항목은 원문과 대조하세요.',
      wPart: p => `<b>파일 이름의 부품번호 "${p}"가 본문에 없습니다</b> — 해당 부품의 datasheet가 맞는지 확인하세요.`,
      summary: '결론 요약', nCrit: n => `조건 ${n}개`, nDiff: n => `파라미터 차이 <b>${n}</b>개`,
      hasNg: n => `${n}개 조건이 불충족 — 해결하지 않으면 세컨드 소스로 쓸 수 없습니다.`,
      noNg: n => `자동 판정에서 불충족은 없습니다. 남은 ${n}개는 사람이 확인해야 합니다.`,
      paramTable: '파라미터 차이표', param: '파라미터', verdict: '판정', basis: '근거',
      critTable: '대체 조건별 판정', crit: '조건',
      noCrit: '이 IC에는 라이브러리에 등록된 대체 조건이 없어 위의 파라미터 차이표만 제공합니다.',
      docInfo: '두 문서의 기본 정보', fileName: '파일명', detPart: '식별된 부품 번호', detMfr: '식별된 제조사',
      textAmt: '추출된 텍스트 양', chars: n => n.toLocaleString() + '자',
      foot: 'HardwareAI 하드웨어 랩 — IC 라이브러리 세컨드 소스 비교',
      st: { same: '동일', diff: '다름', partial: '한쪽만 있음', none: '양쪽 모두 추출 안 됨' },
      vd: { ok: '충족', ng: '불충족', manual: '수동 확인 필요' },
      why: {
        nonTech: '공급·공정 관련 조건이라 datasheet로는 판정할 수 없습니다',
        noMap: '이 조건에 대응하는 자동 추출 파라미터가 없습니다',
        missing: (side, label) => `${side} datasheet에서 "${label}"을(를) 추출하지 못했습니다`,
        sideA: '현재 부품', sideB: '후보 부품',
        ambiguous: '같은 datasheet가 여러 값을 제시해(한 문서가 시리즈 전체를 다루는 경우) 어느 부품의 값인지 확정할 수 없습니다',
        sameDoc: '두 파일이 같은 문서라 이 판정에는 변별력이 없습니다',
        vague: '수치 의미가 명확하지 않아 수동 확인이 필요합니다',
        eqOk: v => `양쪽 모두 ${v}`, eqNg: (a, b) => `${a} vs ${b} 다름`,
        coverOk: (a, b) => `후보 ${b}가 현재 ${a}를 포함`, coverNg: (a, b) => `후보 ${b}가 현재 ${a}를 포함하지 않음`,
        geOk: (a, b) => `후보 ${b} ≥ 현재 ${a}`, geNg: (a, b) => `후보 ${b} < 현재 ${a}`,
        leOk: (a, b) => `후보 ${b} ≤ 현재 ${a}`, leNg: (a, b) => `후보 ${b} > 현재 ${a}`,
        supOk: s => `후보가 ${s} 포함`, supNg: s => `후보에 ${s} 없음`,
        flagOk: '양쪽 표기 동일', flagNg: (a, b) => `현재 ${a ? '있음' : '없음'}, 후보 ${b ? '있음' : '없음'}`,
        closeOk: (a, b) => `${a}와 ${b} 차이가 20% 이내`, closeManual: (a, b) => `${a}와 ${b} 차이가 20% 초과 — 회로 설계에서 허용되는지 확인 필요`,
      },
    },
  };
  const dict = lang => L[lang] || L.zh;

  // 參數名（RULES[].label 是中文；英日韓報告要用對應語言，否則表格會半中半英）
  const PLABEL = {
    package: { zh: '封裝', en: 'Package', ja: 'パッケージ', ko: '패키지' },
    pins: { zh: '腳數', en: 'Pin count', ja: 'ピン数', ko: '핀 수' },
    vin: { zh: '輸入電壓範圍', en: 'Supply voltage', ja: '電源電圧範囲', ko: '공급 전압 범위' },
    vout: { zh: '輸出電壓', en: 'Output voltage', ja: '出力電圧', ko: '출력 전압' },
    iout: { zh: '輸出電流', en: 'Output current', ja: '出力電流', ko: '출력 전류' },
    iq: { zh: '靜態電流 IQ', en: 'Quiescent current', ja: '静止電流 IQ', ko: '정지 전류 IQ' },
    rdson: { zh: 'RDS(on)', en: 'RDS(on)', ja: 'RDS(on)', ko: 'RDS(on)' },
    temp: { zh: '工作溫度', en: 'Operating temperature', ja: '動作温度', ko: '동작 온도' },
    interface: { zh: '介面', en: 'Interface', ja: 'インターフェース', ko: '인터페이스' },
    bits: { zh: '解析度', en: 'Resolution', ja: '分解能', ko: '분해능' },
    sps: { zh: '取樣率', en: 'Sample rate', ja: 'サンプリングレート', ko: '샘플링 속도' },
    fsw: { zh: '切換頻率', en: 'Switching frequency', ja: 'スイッチング周波数', ko: '스위칭 주파수' },
    esd: { zh: 'ESD (HBM)', en: 'ESD (HBM)', ja: 'ESD (HBM)', ko: 'ESD (HBM)' },
    aecq: { zh: '車規 AEC-Q100', en: 'AEC-Q100 automotive', ja: '車載 AEC-Q100', ko: '차량용 AEC-Q100' },
  };
  const plabel = (key, lang) => (PLABEL[key] && (PLABEL[key][lang] || PLABEL[key].zh))
    || (RULES.find(r => r.key === key) || {}).label || key;

  // 封裝多值時，腳數欄要顯示的說明（四語）
  const PINS_AMBIG = { zh: '封裝有多種，無法判定腳數', en: 'several packages listed; pin count undetermined',
    ja: 'パッケージが複数あり、ピン数を確定できません', ko: '패키지가 여러 개여서 핀 수를 확정할 수 없음' };

  /* ---------------- secondSource 準則判定 ----------------
   * 準則是自然語言（ic-data.js 每顆都有一串）。這裡只做「關鍵字對得到參數」的機械判定，
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

  /** 準則可以是字串，或 { match, show }：
   *  match = 用來對規則的**原文**（中文），show = 報告上顯示的文字（可能已翻成英日韓）。
   *  兩者分開是必要的：翻譯後的字串命中的關鍵字不同，會讓同樣兩份 PDF 在不同語言得到不同判定。
   *  @param crit 準則陣列；A=現用料、B=候選料；lang 決定理由用哪種語言 */
  function judge(crit, A, B, lang) {
    const D = dict(lang), W = D.why;
    return (crit || []).map(c => {
      const src = (c && typeof c === 'object') ? c : { match: c, show: c };
      const match = String(src.match == null ? '' : src.match);
      const text = String(src.show == null ? match : src.show);
      if (NON_TECH.test(match)) return { text, verdict: 'manual', why: W.nonTech };
      const hit = MAP.find(m => m.re.test(match));
      if (!hit) return { text, verdict: 'manual', why: W.noMap };
      const a = A.params[hit.key], b = B.params[hit.key];
      if (!a || !b) return { text, verdict: 'manual', why: W.missing(a ? W.sideB : W.sideA, plabel(hit.key, lang && L[lang] ? lang : 'zh')) };
      if (a.ambiguous || b.ambiguous) return { text, verdict: 'manual', a: a.value, b: b.value, why: W.ambiguous };
      const r = compare(hit, a, b, W);
      return { text, verdict: r.verdict, why: r.why, a: a.value, b: b.value };
    });
  }
  const labelOf = k => (RULES.find(r => r.key === k) || {}).label || k;

  function compare(hit, a, b, W) {
    const A = a.value, B = b.value;
    const manual = () => ({ verdict: 'manual', why: W.vague });
    switch (hit.mode) {
      case 'equal':
        return String(A).toUpperCase() === String(B).toUpperCase()
          ? { verdict: 'ok', why: W.eqOk(A) } : { verdict: 'ng', why: W.eqNg(A, B) };
      case 'cover':
        if (a.lo === undefined || b.lo === undefined) return manual();
        return (b.lo <= a.lo && b.hi >= a.hi)
          ? { verdict: 'ok', why: W.coverOk(A, B) } : { verdict: 'ng', why: W.coverNg(A, B) };
      case 'ge':
        if (a.n === undefined || b.n === undefined) return manual();
        return b.n >= a.n ? { verdict: 'ok', why: W.geOk(A, B) } : { verdict: 'ng', why: W.geNg(A, B) };
      case 'le':
        if (a.n === undefined || b.n === undefined) return manual();
        return b.n <= a.n ? { verdict: 'ok', why: W.leOk(A, B) } : { verdict: 'ng', why: W.leNg(A, B) };
      case 'superset': {
        if (!a.set || !b.set) return manual();
        const miss = a.set.filter(x => b.set.indexOf(x) < 0);
        return miss.length ? { verdict: 'ng', why: W.supNg(miss.join('/')) } : { verdict: 'ok', why: W.supOk(a.set.join('/')) };
      }
      case 'flag':
        return (!!a.flag === !!b.flag) ? { verdict: 'ok', why: W.flagOk } : { verdict: 'ng', why: W.flagNg(!!a.flag, !!b.flag) };
      case 'equalish':
        if (a.n === undefined || b.n === undefined) return manual();
        return Math.abs(a.n - b.n) / Math.max(a.n, b.n) <= 0.2
          ? { verdict: 'ok', why: W.closeOk(A, B) } : { verdict: 'manual', why: W.closeManual(A, B) };
      default: return manual();
    }
  }

  /* ---------------- 報告 ---------------- */
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const COLOR = { same: '#15803d', diff: '#b91c1c', partial: '#b45309', none: '#94a3b8', ok: '#15803d', ng: '#b91c1c', manual: '#b45309' };
  const HTMLLANG = { zh: 'zh-Hant', en: 'en', ja: 'ja', ko: 'ko' };

  /** 兩份 PDF 其實是同一份文件嗎？（TI/ADI 常用一份 datasheet 涵蓋整個系列）
   *  若是，「全部相同」這個結論會誤導人以為可以直接換料 —— 必須在報告最上方明講。 */
  function sameDoc(A, B) {
    if (!A.raw || !B.raw) return false;
    if (Math.abs(A.chars - B.chars) > 8) return false;
    return A.raw.slice(0, 3000) === B.raw.slice(0, 3000);
  }

  function reportHTML(o) {
    const { A, B, ic, fileA, fileB } = o;
    const lang = o.lang && L[o.lang] ? o.lang : 'zh';
    const rows = diff(A, B, lang);   // 依報告語言重算欄名，呼叫端傳什麼語言的 rows 都不影響
    const D = dict(lang);
    const same = sameDoc(A, B);
    // 兩份是同一份文件時，任何「符合」都只是在跟自己比 —— 摘要照算會讓人誤以為可以換料。
    // 全部轉人工，數字才不會說謊。
    const checks = same
      ? (o.checks || []).map(c => ({ text: c.text, verdict: 'manual', why: D.why.sameDoc }))
      : (o.checks || []);
    const when = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const tally = k => checks.filter(c => c.verdict === k).length;
    const diffRows = rows.filter(r => r.state === 'diff').length;
    const tag = (txt, color) => `<span class="tag" style="background:${color}">${esc(txt)}</span>`;
    const partyRow = (l, a, b) => `<tr><th>${esc(l)}</th><td>${esc(a || '—')}</td><td>${esc(b || '—')}</td></tr>`;
    // 檔案本身的問題（掃描檔、料號對不上）要在最上面講，否則滿頁「未擷取」會被當成功能壞掉
    const warnNote = (P, side) => (P.warn || []).map(w => {
      const body = w.w === 'noText' ? D.wNoText : w.w === 'lowYield' ? D.wLowYield : D.wPart(esc(w.part));
      return `<div class="note" style="background:#fef2f2;border-left-color:#b91c1c;color:#7f1d1d">${esc(side)}｜${body}</div>`;
    }).join('');
    return `<!doctype html><html lang="${HTMLLANG[lang]}"><head><meta charset="utf-8">
<title>${esc(D.title)} — ${esc(A.part || fileA)} vs ${esc(B.part || fileB)}</title>
<style>
 body{font:14px/1.6 system-ui,"Noto Sans TC","Noto Sans JP","Noto Sans KR",sans-serif;color:#1d2943;margin:0;padding:32px;background:#f8fafc}
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
<button class="btn" onclick="window.print()">${esc(D.print)}</button>
<div class="sheet">
 <h1>${esc(D.title)}</h1>
 <div class="meta">${esc(D.inUse)}：<b>${esc(A.part || D.unknown)}</b>${A.mfr ? '（' + esc(A.mfr) + '）' : ''} — ${esc(fileA)}<br>
 ${esc(D.cand)}：<b>${esc(B.part || D.unknown)}</b>${B.mfr ? '（' + esc(B.mfr) + '）' : ''} — ${esc(fileB)}<br>
 ${esc(D.at)} ${esc(when)}${ic ? ' · ' + esc(D.critFrom) + ' ' + esc(ic.part) : ''}</div>

 <div class="note">${D.disclaimer}</div>

 ${warnNote(A, D.inUse)}${warnNote(B, D.cand)}

 ${same ? `<div class="note" style="background:#fef2f2;border-left-color:#b91c1c;color:#7f1d1d">${D.sameDoc}</div>` : ''}

 <h2>${esc(D.summary)}</h2>
 <div class="sum">
  <div>${D.nCrit(checks.length)}</div>
  <div>${tag(D.vd.ok + ' ' + tally('ok'), COLOR.ok)}</div>
  <div>${tag(D.vd.ng + ' ' + tally('ng'), COLOR.ng)}</div>
  <div>${tag(D.vd.manual + ' ' + tally('manual'), COLOR.manual)}</div>
  <div>${D.nDiff(diffRows)}</div>
 </div>
 ${tally('ng') ? `<p style="color:#b91c1c;font-weight:600">${esc(D.hasNg(tally('ng')))}</p>`
        : `<p style="color:#15803d;font-weight:600">${esc(D.noNg(tally('manual')))}</p>`}

 <h2>${esc(D.paramTable)}</h2>
 <table><thead><tr><th>${esc(D.param)}</th><th>${esc(D.inUse)}</th><th>${esc(D.cand)}</th><th>${esc(D.verdict)}</th></tr></thead><tbody>
 ${rows.map(r => `<tr><th>${esc(r.label)}</th><td>${esc(r.a || D.notExtracted)}</td><td>${esc(r.b || D.notExtracted)}</td>
   <td>${tag(D.st[r.state], COLOR[r.state])}</td></tr>`).join('')}
 </tbody></table>

 <h2>${esc(D.critTable)}</h2>
 ${checks.length ? `<table><thead><tr><th style="width:46%">${esc(D.crit)}</th><th>${esc(D.verdict)}</th><th>${esc(D.basis)}</th></tr></thead><tbody>
 ${checks.map(c => `<tr><td>${esc(c.text)}</td><td>${tag(D.vd[c.verdict], COLOR[c.verdict])}</td><td>${esc(c.why)}</td></tr>`).join('')}
 </tbody></table>` : `<p style="color:#64748b">${esc(D.noCrit)}</p>`}

 <h2>${esc(D.docInfo)}</h2>
 <table><tbody>
 ${partyRow(D.fileName, fileA, fileB)}
 ${partyRow(D.detPart, A.part, B.part)}
 ${partyRow(D.detMfr, A.mfr, B.mfr)}
 ${partyRow(D.textAmt, D.chars(A.chars), D.chars(B.chars))}
 </tbody></table>
 <p class="meta" style="margin-top:18px">${esc(D.foot)}</p>
</div></body></html>`;
  }

  /* ---------------- pdf.js 取文字（瀏覽器端） ---------------- */

  /** 把一頁的 text items 依 y 座標併成「列」。
   *  原本是整頁 items 直接 join(' ')，一頁＝一行，於是規則裡的 `[^\n]{0,40}`
   *  視窗會跨欄跨列亂抓（實測：RT6150 的「Quiescent Current」抓到同列測試條件
   *  「I OUT = 0mA」的 0mA）。依 y 併列之後，一列＝表格的一列，鄰近視窗才有意義。
   *  @param items pdf.js getTextContent().items
   *  @returns string[] 由上而下、每列由左而右 */
  function linesFromItems(items) {
    const rows = [];
    for (const it of items || []) {
      const s = it && it.str;
      if (!s || !s.trim()) continue;
      const tr = it.transform || [1, 0, 0, 1, 0, 0];
      const x = tr[4], y = tr[5];
      // 容差取字高一半（下限 1.5pt）：同列的上下標、不同字級不會被拆成兩列
      const tol = Math.max(1.5, Math.abs(tr[3] || 6) / 2);
      let row = null;
      for (const r of rows) if (Math.abs(r.y - y) <= tol) { row = r; break; }
      if (!row) { row = { y, cells: [] }; rows.push(row); }
      row.cells.push({ x, s });
    }
    rows.sort((a, b) => b.y - a.y);
    return rows
      .map(r => r.cells.sort((a, b) => a.x - b.x).map(c => c.s).join(' ').replace(/[ \t]+/g, ' ').trim())
      .filter(Boolean);
  }

  async function extractText(file) {
    const lib = root.pdfjsLib || root['pdfjs-dist/build/pdf'];
    if (!lib) throw new Error('pdf.js 未載入');
    if (lib.GlobalWorkerOptions && !lib.GlobalWorkerOptions.workerSrc) {
      lib.GlobalWorkerOptions.workerSrc = './vendor/pdf-3.11.174.worker.min.js';
    }
    const buf = await file.arrayBuffer();
    const pdf = await lib.getDocument({ data: buf }).promise;
    const out = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const tc = await page.getTextContent();
      out.push(linesFromItems(tc.items).join('\n'));
    }
    return out.join('\n');
  }

  root.DSCompare = { RULES, parse, diff, judge, reportHTML, extractText, linesFromItems, sameDoc, LANGS: Object.keys(L) };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.DSCompare;
})(typeof window !== 'undefined' ? window : globalThis);
