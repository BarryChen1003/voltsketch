/* ic-i18n.js — IC 條目內容層 i18n 架構（helper + UI 標籤四語）
 * 資料在 ic-i18n-data.js（IC_I18N[part] = { en:{...}, ja:{...}, ko:{...} }）。
 * 條目可覆蓋欄位：subcategory / whatIs / func / usedIn / desc / thermalPad / specs（全列覆蓋）/ dropIn（同序覆蓋 note）。
 * 陣列字串欄位（pins[].desc、secondSource[]）用**共享去重字串字典**翻譯：
 *   IC_STR_I18N[zh 原文.trim()] = { en, ja, ko }（＝IC_PIN_I18N 同一物件，向下相容）。
 *   同一 zh 短語全庫共用一條翻譯；未收錄者沿用 zh（合法 fallback）。訊號名/type/package 不動。
 *   pins 字典在 ic-pin-i18n-data.js；secondSource（替換條件）字典在 ic-crit-i18n-data.js，皆 Object.assign 進同一物件。
 * 用法：渲染前 ic = icLocalized(ic)；UI 標籤 icUI('whatIs')；語言事件 'vs-lang-change'（i18n.js 發）。
 */
(function () {
  window.IC_I18N = window.IC_I18N || {};
  window.IC_PIN_I18N = window.IC_PIN_I18N || {};
  window.IC_STR_I18N = window.IC_PIN_I18N; // 對外新名，同一共享字串字典物件

  window.IC_UI = {
    zh: {
      whatIs: '是什麼', func: '功用', usedIn: '用在哪', specs: '重點規格',
      pinDef: '接腳定義（Pin Functions）', pin: '腳', name: '名稱', type: '類型', fn: '功能',
      dropIn: '可直接替換（pin-to-pin 相容）', none: '尚無', critTitle: '替換必須符合的條件',
      filled: '已建檔', empty: '待補', pickCat: '選一個分類', noMatch: '無符合'
    },
    en: {
      whatIs: 'What is it', func: 'Function', usedIn: 'Used in', specs: 'Key specs',
      pinDef: 'Pin Functions', pin: 'Pin', name: 'Name', type: 'Type', fn: 'Description',
      dropIn: 'Drop-in replacements (pin-to-pin)', none: 'None yet', critTitle: 'Replacement requirements',
      filled: 'In library', empty: 'Pending', pickCat: 'Pick a category', noMatch: 'No match'
    },
    ja: {
      whatIs: '概要', func: '機能', usedIn: '用途', specs: '主要スペック',
      pinDef: 'ピン機能（Pin Functions）', pin: 'ピン', name: '名称', type: '種別', fn: '機能説明',
      dropIn: '直接置換可（pin-to-pin 互換）', none: 'なし', critTitle: '置換の必須条件',
      filled: '登録済', empty: '未登録', pickCat: 'カテゴリを選択', noMatch: '該当なし'
    },
    ko: {
      whatIs: '개요', func: '기능', usedIn: '용도', specs: '주요 사양',
      pinDef: '핀 기능(Pin Functions)', pin: '핀', name: '이름', type: '유형', fn: '기능 설명',
      dropIn: '직접 대체 가능(pin-to-pin 호환)', none: '없음', critTitle: '대체 필수 조건',
      filled: '등록됨', empty: '미등록', pickCat: '카테고리 선택', noMatch: '일치 없음'
    }
  };

  window.icLang = function () { try { return localStorage.getItem('vs-lang') || 'zh'; } catch (e) { return 'zh'; } };

  window.icUI = function (k) {
    var d = window.IC_UI[window.icLang()] || window.IC_UI.zh;
    return d[k] || window.IC_UI.zh[k] || k;
  };

  window.icLocalized = function (ic) {
    if (!ic) return ic;
    var lang = window.icLang();
    if (lang === 'zh') return ic;
    var t = window.IC_I18N[ic.part] && window.IC_I18N[ic.part][lang];
    // 陣列字串字典獨立於條目翻譯：條目未譯（!t）仍須覆蓋 pins.desc 與 secondSource
    if (!t) return window.icLocalizeArrays(ic, lang);
    var c = Object.assign({}, ic);
    ['subcategory', 'whatIs', 'func', 'usedIn', 'desc', 'thermalPad'].forEach(function (f) {
      if (t[f]) c[f] = t[f];
    });
    if (t.specs && t.specs.length) c.specs = t.specs;
    if (t.dropIn && t.dropIn.length && ic.dropIn && ic.dropIn.length) {
      c.dropIn = ic.dropIn.map(function (d, i) {
        return t.dropIn[i] && t.dropIn[i].note ? Object.assign({}, d, { note: t.dropIn[i].note }) : d;
      });
    }
    c = window.icLocalizeArrays(c, lang);
    return c;
  };

  // 單一字串經共享去重字典翻譯；未收錄回傳原文。
  window.icTrStr = function (s, lang) {
    var d = window.IC_STR_I18N;
    var k = s == null ? '' : String(s).trim();
    return (k && d && d[k] && d[k][lang]) ? d[k][lang] : s;
  };

  // 覆蓋 ic 的陣列字串欄位（pins[].desc、secondSource[]）——共享字典，不改 name/type/num/package。
  // 未收錄沿用 zh（合法 fallback）。只在有變動時淺拷貝。
  window.icLocalizeArrays = function (ic, lang) {
    if (!ic) return ic;
    if (!lang) lang = window.icLang();
    if (lang === 'zh') return ic;
    var out = ic, copied = false;
    if (ic.pins && ic.pins.length) {
      var chp = false;
      var pins = ic.pins.map(function (p) {
        var tr = window.icTrStr(p.desc, lang);
        if (tr !== p.desc) { chp = true; return Object.assign({}, p, { desc: tr }); }
        return p;
      });
      if (chp) { out = Object.assign({}, out); out.pins = pins; copied = true; }
    }
    if (ic.secondSource && ic.secondSource.length) {
      var chs = false;
      var ss = ic.secondSource.map(function (s) { var tr = window.icTrStr(s, lang); if (tr !== s) chs = true; return tr; });
      if (chs) { if (!copied) { out = Object.assign({}, out); copied = true; } out.secondSource = ss; }
    }
    return out;
  };

  // 向下相容別名（本 session 早期用名）
  window.icLocalizePins = window.icLocalizeArrays;
})();
