/**
 * verify.js — 抽取結果的驗證器（跟抽取引擎無關）
 *
 * 為什麼要有這支：不管值是規則抽的、模型抽的、還是人填的，進資料庫之前都要能被機械覆核。
 * 引擎會換，這支不換 —— 它才是「錯的值進不了 ic-data.js」的保證。
 *
 * 一個「宣稱」(claim) 長這樣：
 *   { key: 'iq', value: '1.5 µA', n: 1.5e-6, quote: 'Low standby ... 1.5 µA', page: 3 }
 *   範圍類用 lo/hi 取代 n：{ key: 'temp', lo: -40, hi: 85, quote: '...', page: 1 }
 *
 * 四道覆核，全部通過才算 pass：
 *   1) quote 必須逐字出現在 datasheet 裡（正規化後比對）——模型編出來的句子在這裡就死
 *   2) 數值必須能從 quote 本身重新解析出來，而且跟宣稱的數字一致
 *      （不信任何引擎的算術與單位換算，一律用 ds-compare 的 scale()/num() 重算）
 *   3) 量級要落在 ds-compare 的 BOUNDS 裡（IQ 不可能 160 mA 那種）
 *   4) quote 不能落在 Absolute Maximum / Limiting values 段
 *      —— 除非宣稱自己標了 srcTag: 'fromAbsMax'，那是「知道自己在引用極限值」
 *
 * 沒過的不是「錯」，是「不可信」：一律降級成未擷取，或送人工看。
 */
'use strict';
const DS = require('../../ds-compare.js');

/** 比對用的正規化：空白全部壓成一個、再拿掉前後空白。
 *  （DS.norm 已經處理過私有區字元、破折號、單位間的空白。） */
const flat = s => DS.norm(String(s == null ? '' : s)).replace(/\s+/g, ' ').trim();

/** 破折號前面必須是一個「單獨的數字」才算範圍分隔。
 *  「1.65 -5.5 V」是範圍；「P07-P00 -10 mA」的 -10 是真的負值（前面是料號不是數字）。 */
const RANGE_DASH = /(?:^|[\s(])\d[\d,]*(?:\.\d+)?\s*$/;
/** 連字號直接黏在字母後面時（WDFN-10L、P07-P00），那是型號的一部分，不是負號 */
const WORD_DASH = /[A-Za-z]$/;
/** 這些參數本來就寫在 Absolute Maximum Ratings 裡（ESD 是耐受上限，不是工作值），
 *  在那一段找到它不算問題。其餘參數落在那一段就要擋。 */
const ABSMAX_OK = { esd: 1 };

/** 數字相等：用相對誤差，避免 0.1+0.2 那種浮點誤差誤判 */
function near(a, b) {
  if (a === b) return true;
  if (typeof a !== 'number' || typeof b !== 'number' || !isFinite(a) || !isFinite(b)) return false;
  const scale = Math.max(Math.abs(a), Math.abs(b), 1e-12);
  return Math.abs(a - b) / scale < 1e-6;
}

/** 從一段文字裡，把所有「數值＋單位」重新解析出來（單位換算一律重算） */
function valuesIn(text, kind) {
  const t = flat(text);
  const units = Object.keys((DS.RULES, kindUnits(kind)) || {});
  if (!units.length) return [];
  const alt = units.sort((a, b) => b.length - a.length)
    .map(u => u.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const re = new RegExp('(-?\\d[\\d,]*(?:\\.\\d+)?)\\s?(' + alt + ')(?![A-Za-z0-9µΩ])', 'gi');
  const out = [];
  let m;
  while ((m = re.exec(t))) {
    const sc = DS.scale(kind, m[2]);
    const n = DS.num(m[1]);
    if (sc === null || n === null) continue;
    out.push(n * sc);
    // 「1.65 - 5.5 V」的破折號是範圍分隔，不是負號（理由見 numbersIn）
    if (n < 0 && RANGE_DASH.test(t.slice(0, m.index))) out.push(-n * sc);
  }
  // MIN TYP MAX 三欄共用行尾的單位：三個值都要算進來
  const mtm = new RegExp('(-?[\\d.]+|--)\\s+(-?[\\d.]+|--)\\s+(-?[\\d.]+|--)\\s*(' + alt + ')(?![A-Za-z0-9µΩ])', 'i');
  const g = t.match(mtm);
  if (g) {
    const sc = DS.scale(kind, g[4]);
    if (sc !== null) [g[1], g[2], g[3]].forEach(x => { const n = DS.num(x); if (n !== null) out.push(n * sc); });
  }
  return out;
}

/** 各 kind 對應的單位表（跟 ds-compare 同一份 UNIT，透過 scale() 間接取用） */
function kindUnits(kind) {
  const table = {
    A: ['A', 'mA', 'uA', 'µA', 'nA'],
    V: ['V', 'mV', 'kV'],
    R: ['Ω', 'ohm', 'mΩ', 'mohm', 'kΩ', 'kohm'],
    Hz: ['Hz', 'kHz', 'MHz', 'GHz'],
    SPS: ['SPS', 'kSPS', 'MSPS'],
  }[kind] || [];
  const o = {};
  table.forEach(u => { if (DS.scale(kind, u) !== null) o[u] = 1; });
  return o;
}

/** 參數 → 數值 kind（跟 ds-compare 的規則對齊） */
const KIND = {
  vin: 'V', vout: 'V', esd: 'V',
  iout: 'A', iq: 'A',
  rdson: 'R', fsw: 'Hz', sps: 'SPS',
};
/** 範圍型參數：要驗 lo/hi 而不是單一 n */
const RANGE_KEYS = { vin: 1, vout: 1, temp: 1 };

/**
 * 驗一個宣稱。
 * @param claim { key, quote, page?, n?, lo?, hi?, value?, srcTag? }
 * @param pages string[]  每頁的文字（index 0 = 第 1 頁）
 * @returns { ok, reason, page, checks }
 */
function verifyClaim(claim, pages) {
  const checks = { quote: false, number: false, bounds: false, section: false };
  const key = claim && claim.key;
  if (!key) return { ok: false, reason: 'no-key', checks };
  // 一個判斷可以由好幾列共同支撐（多種封裝、介面清單、內建功能清單）→ quotes 陣列。
  // 每一列都要各自在文件裡找得到，缺一列就不算數。
  const list = (Array.isArray(claim.quotes) ? claim.quotes : [claim.quote]).map(flat).filter(Boolean);
  if (!list.length) return { ok: false, reason: 'no-quote', checks };
  if (list.some(q => q.length < 6)) return { ok: false, reason: 'quote-too-short', checks };
  const quote = list.join(' ');

  // 1) 每一段 quote 都要真的在文件裡。有給頁碼就先驗那一頁，對不上再全文找（回報頁碼不符）
  const flats = pages.map(flat);
  const found = list.map(q => flats.findIndex(p => p.indexOf(q) >= 0));
  if (found.some(i => i < 0)) return { ok: false, reason: 'quote-not-found', checks };
  const claimed = Number(claim.page) - 1;
  let page = found[0];
  if (Number.isInteger(claimed) && claimed >= 0 && claimed < flats.length && flats[claimed].indexOf(list[0]) >= 0) {
    page = claimed;
  } else if (claim.page !== undefined) {
    return { ok: false, reason: 'wrong-page', page: page + 1, checks };
  }
  checks.quote = true;

  // 2) 數字要能從 quote 自己重新解析出來
  if (RANGE_KEYS[key]) {
    const nums = key === 'temp' ? numbersIn(quote) : valuesIn(quote, KIND[key] || 'V').concat(numbersIn(quote));
    const okLo = nums.some(v => near(v, claim.lo));
    const okHi = nums.some(v => near(v, claim.hi));
    if (!(okLo && okHi)) return { ok: false, reason: 'number-mismatch', page: page + 1, checks };
    // lo === hi 是「單一值」（固定輸出電壓那種），不是範圍寫反
    if (!(claim.lo <= claim.hi)) return { ok: false, reason: 'range-inverted', page: page + 1, checks };
  } else if (claim.n !== undefined && claim.n !== null) {
    const kind = KIND[key];
    const nums = kind ? valuesIn(quote, kind) : numbersIn(quote);
    // absolute：宣稱方明說自己存的是絕對值（IOH 在 datasheet 寫成負的），才准忽略正負號。
    // 沒有這個旗標就一律連正負一起比 —— 不然「-10 mA」與「10 mA」會被當成同一件事。
    const hit = claim.absolute ? nums.some(v => near(Math.abs(v), Math.abs(claim.n))) : nums.some(v => near(v, claim.n));
    if (!hit) return { ok: false, reason: 'number-mismatch', page: page + 1, checks };
  } else if (claim.value === undefined || claim.value === null) {
    return { ok: false, reason: 'no-value', page: page + 1, checks };
  } else {
    // 文字／旗標型（內建上拉、散熱墊、上電預設…）：值是推導出來的標籤，
    // 用字面比對沒有意義（值是中文、原文是英文）。改成把規則重新跑在 quote 上：
    // 「光看這一行，是否就足以得到同樣的判斷」。模型引用了不相干的句子，這裡會擋下來。
    const rule = DS.RULES.find(r => r.key === key);
    if (rule && !claim.textFree) {
      let again = null;
      try { again = rule.run(list.join('\n')); } catch (e) { again = null; }
      if (!again) return { ok: false, reason: 'quote-does-not-support', page: page + 1, checks };
      // 清單型的值（「SOIC-24 / TSSOP-24」「I2C, SMBus」）比的是集合，不是字串：
      // 出處只有那幾列時，掃描順序可能跟全文不同，順序不該影響判定
      const asSet = v => String(v).split(/\s*[/,]\s*/).map(x => x.trim().toUpperCase()).filter(Boolean).sort().join('|');
      const same = String(again.value) === String(claim.value)
        || asSet(again.value) === asSet(claim.value)
        || (again.text !== undefined && again.text === claim.text)
        || (again.flag !== undefined && claim.flag !== undefined && again.flag === claim.flag);
      if (!same) return { ok: false, reason: 'quote-says-otherwise', page: page + 1, checks };
    }
  }
  checks.number = true;

  // 3) 量級
  const b = DS.BOUNDS[key];
  if (b) {
    const vals = RANGE_KEYS[key] ? [claim.lo, claim.hi] : [claim.n];
    for (const v of vals) {
      if (typeof v !== 'number') continue;
      const mag = RANGE_KEYS[key] ? v : Math.abs(v);
      if (b.min !== undefined && mag < b.min) return { ok: false, reason: 'out-of-bounds', page: page + 1, checks };
      if (b.max !== undefined && mag > b.max) return { ok: false, reason: 'out-of-bounds', page: page + 1, checks };
    }
    if (b.span !== undefined && RANGE_KEYS[key] && (claim.hi - claim.lo) < b.span) {
      return { ok: false, reason: 'range-too-narrow', page: page + 1, checks };
    }
  }
  checks.bounds = true;

  // 4) quote 不能來自「不可超過」的段落
  const row = DS.sectioned(pages[page]).find(r => flat(r.text).indexOf(list[0]) >= 0 || list[0].indexOf(flat(r.text)) >= 0);
  const sect = row ? row.sect : null;
  if (sect === 'absmax' && claim.srcTag !== 'fromAbsMax' && !ABSMAX_OK[key]) {
    return { ok: false, reason: 'from-absmax', page: page + 1, checks };
  }
  checks.section = true;

  return { ok: true, reason: 'pass', page: page + 1, sect, checks };
}

/** 純數字（給溫度這種單位寫在行尾、數字本身沒帶單位的情況）
 *  「1.65 - 5.5 V」裡的破折號是範圍分隔不是負號，會讓 5.5 被讀成 -5.5。
 *  分不出來的時候兩種讀法都收：驗證要的是「宣稱的數字有沒有出現在出處裡」，
 *  漏收會把對的值誤判成造假，比多收一個讀法傷害大。 */
function numbersIn(text) {
  const t = flat(text);
  const out = [];
  const re = /-?\d[\d,]*(?:\.\d+)?/g;
  let m;
  while ((m = re.exec(t))) {
    const n = DS.num(m[0]);
    if (n === null) continue;
    out.push(n);
    const before = t.slice(0, m.index);
    if (n < 0 && (RANGE_DASH.test(before) || WORD_DASH.test(before))) out.push(-n);
  }
  return out;
}

/**
 * 驗一整批宣稱，回傳可以直接寫成人工覆核清單的結果。
 * @returns { total, pass, fail, byReason, rows }
 */
function verifyAll(claims, pages) {
  const rows = (claims || []).map(c => {
    const r = verifyClaim(c, pages);
    const src = Array.isArray(c.quotes) ? c.quotes : [c.quote];
    return {
      key: c.key, value: c.value, page: r.page || c.page || null, ok: r.ok, reason: r.reason,
      quote: src.filter(Boolean).map(q => String(q).slice(0, 120)),
    };
  });
  const byReason = {};
  rows.forEach(r => { if (!r.ok) byReason[r.reason] = (byReason[r.reason] || 0) + 1; });
  return { total: rows.length, pass: rows.filter(r => r.ok).length, fail: rows.filter(r => !r.ok).length, byReason, rows };
}

module.exports = { verifyClaim, verifyAll, flat, near, valuesIn, numbersIn, KIND, RANGE_KEYS };
