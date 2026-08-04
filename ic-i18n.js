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
      filled: '已建檔', empty: '待補', pickCat: '選一個分類', noMatch: '無符合',
      searchPh: '搜尋料號…', listHint: '← 左邊選分類，中間點料號看詳細頁',
      addToSchem: '放到線路圖', optNative: '直接可用（本站自寫）', optViaTool: '經工具生成（.olb 為專有二進位，不自寫）', exportBtn: '匯出',
      skillTitle: 'PCB 換料腳本（Allegro SKILL）', swapPre: '把', swapPost: '換成', skillGen: '產生 SKILL (.il)',
      skillNote: '只允許 pin 相容（同 footprint）的料當目標；產出腳本在 Allegro 跑、保留接線，執行前先備份 .brd。',
      notBuilt: '尚未建檔（無 pinout/規格資料）。', notBuiltHint: '建檔後此處會顯示：白話簡述 + 符號 + 重點規格 + pin 相容替換 + 接腳定義，並可放到線路圖。',
      msgLogin: '請先登入才能匯出', msgQuota: '已達本月匯出上限（升級 VIP 可增加）', exported: '已匯出', exportedLeft: '已匯出，本月剩 ', exportedRight: ' 次',
      unitSig: '訊號', unitPwr: '電源／接地（同名多腳合併，完整球號見接腳定義）', previewTitle: 'IC 元件庫 — 符號預覽（驗外觀）', previewNote: '引擎 ic-symbol.js + 資料 ic-data.js。仿 datasheet Pin Configuration：腳號在框內、腳名在框外、上下腳名垂直、Thermal Pad 補 GND 腳。',
      cmpTitle: '2nd Source 比對（上傳兩份 datasheet）', cmpIntro: '上傳「現用料」與「候選料」的 datasheet PDF，產出差異報告：參數差異表 + 上方替換準則逐條判定。', cmpFileA: '現用料 PDF', cmpFileB: '候選料 PDF', cmpRun: '比對並產出報告', cmpNote: '檔案只在你的瀏覽器內解析，不會上傳。報告頁按「列印 / 存成 PDF」即可存檔。自動擷取僅供初篩，仍以 datasheet 原文為準。', cmpNeedTwo: '請先選兩份 PDF', cmpNoLib: '比對模組未載入（請重新整理頁面）', cmpBusy: '解析中…（大檔可能要幾秒）', cmpNoText: '這兩份 PDF 取不到文字，可能是掃描圖檔版；請改用原生文字版 datasheet', cmpPopup: '瀏覽器擋掉了新分頁，請允許此站開啟彈出視窗', cmpDone: '報告已在新分頁開啟', cmpFail: '比對失敗', cmpTitleShort: '2nd Source 比對', cmpOpenWith: '用這顆的準則開比對', cmpPickIC: '套用替換準則', cmpNoIC: '不套用（只比參數）'
    },
    en: {
      whatIs: 'What is it', func: 'Function', usedIn: 'Used in', specs: 'Key specs',
      pinDef: 'Pin Functions', pin: 'Pin', name: 'Name', type: 'Type', fn: 'Description',
      dropIn: 'Drop-in replacements (pin-to-pin)', none: 'None yet', critTitle: 'Replacement requirements',
      filled: 'In library', empty: 'Pending', pickCat: 'Pick a category', noMatch: 'No match',
      searchPh: 'Search part number…', listHint: '← Pick a category on the left, then click a part number to see its detail page',
      addToSchem: 'Add to schematic', optNative: 'Ready to use (native)', optViaTool: 'Generated via tool (.olb is proprietary binary, not native)', exportBtn: 'Export',
      skillTitle: 'PCB part-swap script (Allegro SKILL)', swapPre: 'Replace', swapPost: 'with', skillGen: 'Generate SKILL (.il)',
      skillNote: 'Only pin-compatible parts (same footprint) are allowed as targets; the generated script runs in Allegro and preserves routing — back up the .brd before running.',
      notBuilt: 'Not in the library yet (no pinout/spec data).', notBuiltHint: 'Once added, this shows: a plain-language summary + symbol + key specs + pin-compatible replacements + pin functions, and can be placed on the schematic.',
      msgLogin: 'Please sign in to export', msgQuota: 'Monthly export limit reached (upgrade to VIP for more)', exported: 'Exported', exportedLeft: 'Exported, ', exportedRight: ' left this month',
      unitSig: 'Signals', unitPwr: 'Power / Ground (same-name pins merged; full ball list in Pin Definition)', previewTitle: 'IC Library — Symbol Preview (visual check)', previewNote: 'Engine ic-symbol.js + data ic-data.js. Mimics the datasheet Pin Configuration: pin numbers inside the box, pin names outside, top/bottom pin names vertical, Thermal Pad adds a GND pin.',
      cmpTitle: '2nd-source comparison (upload two datasheets)', cmpIntro: 'Upload the datasheet of the part in use and of the candidate. You get a difference table plus a verdict on every replacement requirement listed above.', cmpFileA: 'Part in use (PDF)', cmpFileB: 'Candidate (PDF)', cmpRun: 'Compare and build report', cmpNote: 'Files are parsed in your browser and never uploaded. Use Print / Save as PDF on the report page. Automatic extraction is a first pass only - the datasheet itself is the authority.', cmpNeedTwo: 'Pick two PDFs first', cmpNoLib: 'Compare module not loaded (reload the page)', cmpBusy: 'Parsing... (a few seconds for large files)', cmpNoText: 'No text could be extracted - these look like scanned images. Use a text-based datasheet.', cmpPopup: 'The browser blocked the new tab; allow pop-ups for this site', cmpDone: 'Report opened in a new tab', cmpFail: 'Comparison failed', cmpTitleShort: '2nd-source compare', cmpOpenWith: 'Compare using this part criteria', cmpPickIC: 'Apply criteria from', cmpNoIC: 'None (parameters only)'
    },
    ja: {
      whatIs: '概要', func: '機能', usedIn: '用途', specs: '主要スペック',
      pinDef: 'ピン機能（Pin Functions）', pin: 'ピン', name: '名称', type: '種別', fn: '機能説明',
      dropIn: '直接置換可（pin-to-pin 互換）', none: 'なし', critTitle: '置換の必須条件',
      filled: '登録済', empty: '未登録', pickCat: 'カテゴリを選択', noMatch: '該当なし',
      searchPh: '品番を検索…', listHint: '← 左でカテゴリを選び、中央の品番をクリックで詳細ページ',
      addToSchem: '回路図に追加', optNative: 'そのまま使用可（自作）', optViaTool: 'ツールで生成（.olb は専有バイナリのため非自作）', exportBtn: 'エクスポート',
      skillTitle: 'PCB 部品置換スクリプト（Allegro SKILL）', swapPre: '', swapPost: 'を次に置換', skillGen: 'SKILL を生成 (.il)',
      skillNote: 'ピン互換（同一フットプリント）の部品のみターゲットに指定可能。生成スクリプトは Allegro で実行し配線を保持します。実行前に .brd をバックアップしてください。',
      notBuilt: '未登録（pinout/仕様データなし）。', notBuiltHint: '登録後、ここに表示されます：わかりやすい概要＋シンボル＋主要スペック＋ピン互換の置換＋ピン機能。回路図にも配置できます。',
      msgLogin: 'エクスポートするにはログインしてください', msgQuota: '今月のエクスポート上限に達しました（VIP にアップグレードで増加）', exported: 'エクスポート完了', exportedLeft: 'エクスポート完了、今月残り ', exportedRight: ' 回',
      unitSig: '信号', unitPwr: '電源／グラウンド（同名ピンは統合、全ボール番号はピン定義参照）', previewTitle: 'ICライブラリ — シンボルプレビュー（外観確認）', previewNote: 'エンジン ic-symbol.js ＋ データ ic-data.js。datasheet の Pin Configuration を模倣：ピン番号は枠内、ピン名は枠外、上下のピン名は垂直、Thermal Pad は GND ピンを補う。',
      cmpTitle: 'セカンドソース比較（datasheet を 2 つアップロード）', cmpIntro: '現行品と候補品の datasheet PDF を選ぶと、パラメータ差分表と、上記の置換条件ごとの判定を出します。', cmpFileA: '現行品 PDF', cmpFileB: '候補品 PDF', cmpRun: '比較してレポート作成', cmpNote: 'ファイルはブラウザ内だけで解析し、アップロードしません。レポート画面の「印刷 / PDF に保存」で保存できます。自動抽出は一次スクリーニングであり、最終判断は datasheet 原文に従ってください。', cmpNeedTwo: 'まず PDF を 2 つ選択してください', cmpNoLib: '比較モジュール未読み込み（ページを再読み込み）', cmpBusy: '解析中…（大きいファイルは数秒かかります）', cmpNoText: 'テキストを取得できません。スキャン画像版の可能性があります。テキスト版の datasheet を使用してください。', cmpPopup: 'ブラウザが新しいタブをブロックしました。ポップアップを許可してください', cmpDone: 'レポートを新しいタブで開きました', cmpFail: '比較に失敗しました', cmpTitleShort: 'セカンドソース比較', cmpOpenWith: 'この品番の条件で比較', cmpPickIC: '置換条件を適用', cmpNoIC: '適用しない（パラメータのみ）'
    },
    ko: {
      whatIs: '개요', func: '기능', usedIn: '용도', specs: '주요 사양',
      pinDef: '핀 기능(Pin Functions)', pin: '핀', name: '이름', type: '유형', fn: '기능 설명',
      dropIn: '직접 대체 가능(pin-to-pin 호환)', none: '없음', critTitle: '대체 필수 조건',
      filled: '등록됨', empty: '미등록', pickCat: '카테고리 선택', noMatch: '일치 없음',
      searchPh: '부품 번호 검색…', listHint: '← 왼쪽에서 분류를 선택하고, 가운데 부품 번호를 클릭하면 상세 페이지',
      addToSchem: '회로도에 추가', optNative: '바로 사용 가능(자체 제작)', optViaTool: '도구로 생성(.olb는 독점 바이너리, 비자체)', exportBtn: '내보내기',
      skillTitle: 'PCB 부품 교체 스크립트(Allegro SKILL)', swapPre: '', swapPost: '를 다음으로 교체', skillGen: 'SKILL 생성 (.il)',
      skillNote: '핀 호환(동일 풋프린트) 부품만 대상으로 허용; 생성된 스크립트는 Allegro에서 실행되며 배선을 유지합니다. 실행 전에 .brd를 백업하세요.',
      notBuilt: '아직 미등록(pinout/사양 데이터 없음).', notBuiltHint: '등록 후 여기에 표시됩니다: 쉬운 요약 + 심볼 + 주요 사양 + 핀 호환 대체 + 핀 기능. 회로도에도 배치할 수 있습니다.',
      msgLogin: '내보내려면 로그인하세요', msgQuota: '이번 달 내보내기 한도 도달(VIP 업그레이드 시 증가)', exported: '내보내기 완료', exportedLeft: '내보내기 완료, 이번 달 남은 ', exportedRight: ' 회',
      unitSig: '신호', unitPwr: '전원/접지(동명 핀 병합, 전체 볼 번호는 핀 정의 참조)', previewTitle: 'IC 라이브러리 — 심볼 미리보기(외관 확인)', previewNote: '엔진 ic-symbol.js + 데이터 ic-data.js. datasheet의 Pin Configuration을 모방: 핀 번호는 프레임 내부, 핀 이름은 프레임 외부, 위/아래 핀 이름은 수직, Thermal Pad는 GND 핀을 보충.',
      cmpTitle: '세컨드 소스 비교(datasheet 2개 업로드)', cmpIntro: '현재 사용 부품과 후보 부품의 datasheet PDF를 올리면 파라미터 차이표와 위의 대체 조건별 판정을 생성합니다.', cmpFileA: '현재 부품 PDF', cmpFileB: '후보 부품 PDF', cmpRun: '비교하고 보고서 생성', cmpNote: '파일은 브라우저 안에서만 해석되며 업로드되지 않습니다. 보고서 화면의 "인쇄 / PDF로 저장"으로 저장하세요. 자동 추출은 1차 선별용이며 최종 판단은 datasheet 원문을 따릅니다.', cmpNeedTwo: '먼저 PDF 2개를 선택하세요', cmpNoLib: '비교 모듈이 로드되지 않았습니다(페이지 새로고침)', cmpBusy: '해석 중…(큰 파일은 몇 초 걸립니다)', cmpNoText: '텍스트를 추출할 수 없습니다. 스캔 이미지 버전일 수 있으니 텍스트 기반 datasheet를 사용하세요.', cmpPopup: '브라우저가 새 탭을 차단했습니다. 팝업을 허용하세요', cmpDone: '보고서를 새 탭에서 열었습니다', cmpFail: '비교 실패', cmpTitleShort: '세컨드 소스 비교', cmpOpenWith: '이 부품 조건으로 비교', cmpPickIC: '대체 조건 적용', cmpNoIC: '적용 안 함(파라미터만)'
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
      // dropIn 有兩種形狀：{ part, note } 物件，或純字串（舊條目）。兩種都要能覆蓋。
      c.dropIn = ic.dropIn.map(function (d, i) {
        var td = t.dropIn[i];
        if (!td) return d;
        if (typeof d === 'string') return typeof td === 'string' ? td : (td.note || d);
        return td.note ? Object.assign({}, d, { note: td.note }) : d;
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
