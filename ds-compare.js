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
        if (pkg.ambiguous) return { value: PINS_AMBIG.zh, i18nKey: 'pinsAmbig', ambiguous: true };
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

  root.DSCompare = { RULES, parse, diff, judge, reportHTML, extractText, sameDoc, LANGS: Object.keys(L) };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.DSCompare;
})(typeof window !== 'undefined' ? window : globalThis);
