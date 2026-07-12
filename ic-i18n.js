/* ic-i18n.js — IC 條目內容層 i18n 架構（helper + UI 標籤四語）
 * 資料在 ic-i18n-data.js（IC_I18N[part] = { en:{...}, ja:{...}, ko:{...} }）。
 * 可覆蓋欄位：subcategory / whatIs / func / usedIn / desc / thermalPad / specs（全列覆蓋）/ dropIn（同序覆蓋 note）。
 * pins[].desc 不翻譯（訊號名/MUX 技術文字沿用原文）。
 * 用法：渲染前 ic = icLocalized(ic)；UI 標籤 icUI('whatIs')；語言事件 'vs-lang-change'（i18n.js 發）。
 */
(function () {
  window.IC_I18N = window.IC_I18N || {};

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
    if (!t) return ic;
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
    return c;
  };
})();
