/**
 * i18n.js — VoltSketch 四語系（繁中 zh / 英 en / 日 ja / 韓 ko）
 * 電子電機專業術語版：譯名採業界標準用語（非逐字直譯），例：
 *   示波器→oscilloscope/オシロスコープ/오실로스코프、電子負載→electronic load/電子負荷/전자 부하。
 * 用法：
 *   1. 頁面載入本檔 → 自動翻譯 nav（依 href 對應鍵）+ 在 topbar 掛語言切換器。
 *   2. 頁內元素加 data-i18n="key"（翻 textContent）、data-i18n-title="key"（翻 title）。
 *   3. JS 取字串：I18N.t('key')。切換語言存 localStorage('vs-lang')，事件 'vs-lang-change'。
 * 涵蓋：全站 nav/共用鈕 + 儀器實驗台全部術語。內容層（知識卡/IC 資料）為 phase 2。
 */
window.I18N = (function () {
  const LS = 'vs-lang';
  const LANGS = [['zh', '中文'], ['en', 'English'], ['ja', '日本語'], ['ko', '한국어']];

  const D = {
    // ---- 站名/導覽（nav 依 href 自動套）----
    brand_title:    { zh: 'VoltSketch 硬體實驗室', en: 'VoltSketch Hardware Lab', ja: 'VoltSketch ハードウェアラボ', ko: 'VoltSketch 하드웨어 랩' },
    nav_schematic:  { zh: '線路圖', en: 'Schematic', ja: '回路図', ko: '회로도' },
    nav_arch:       { zh: '架構圖', en: 'Block Diagram', ja: 'ブロック図', ko: '블록 다이어그램' },
    nav_iclib:      { zh: 'IC 元件庫', en: 'IC Library', ja: 'ICライブラリ', ko: 'IC 라이브러리' },
    nav_knowledge:  { zh: '硬體知識庫', en: 'Knowledge Base', ja: '知識ベース', ko: '지식 베이스' },
    nav_pcb:        { zh: 'PCB Layout', en: 'PCB Layout', ja: 'PCBレイアウト', ko: 'PCB 레이아웃' },
    nav_interview:  { zh: '面試考題', en: 'Interview Q&A', ja: '面接問題', ko: '면접 문제' },
    nav_lab:        { zh: '儀器實驗台', en: 'Instrument Bench', ja: '計測器ベンチ', ko: '계측기 벤치' },
    nav_upgrade:    { zh: '升級 VIP', en: 'Upgrade', ja: 'アップグレード', ko: '업그레이드' },
    nav_pcbviewer:  { zh: 'PCB 檢視器', en: 'PCB Viewer', ja: 'PCBビューア', ko: 'PCB 뷰어' },
    nav_contact:    { zh: '聯絡資訊', en: 'Contact', ja: 'お問い合わせ', ko: '문의' },

    // ---- 聯絡頁 ----
    contact_sub:     { zh: '合作邀約・BUG 回報', en: 'Partnership & Bug Reports', ja: '提携・バグ報告', ko: '협력 및 버그 제보' },
    contact_coop_h:  { zh: '🤝 合作邀約', en: '🤝 Partnership & Collaboration', ja: '🤝 提携・コラボレーション', ko: '🤝 협력 제안' },
    contact_coop_p:  { zh: '學術界、業界、廠商合作皆歡迎：課程與教學合作、企業內訓、元件庫共建、內容授權、贊助與行銷合作。歡迎世界各地的朋友來信洽談。', en: 'Academia, industry, and vendors are all welcome: course/teaching collaboration, corporate training, component-library co-building, content licensing, sponsorship and marketing partnerships. Inquiries from anywhere in the world are welcome.', ja: '学術界・産業界・メーカーとの提携を歓迎します：講座・教育協力、企業研修、部品ライブラリ共同構築、コンテンツライセンス、スポンサーシップなど。世界中からのお問い合わせをお待ちしています。', ko: '학계, 업계, 제조사와의 협력을 환영합니다: 강의·교육 협력, 기업 교육, 부품 라이브러리 공동 구축, 콘텐츠 라이선스, 스폰서십 등. 전 세계 어디서든 문의를 환영합니다.' },
    contact_bug_h:   { zh: '🐞 回報 BUG 送會員', en: '🐞 Report a Bug, Get VIP', ja: '🐞 バグ報告で会員特典', ko: '🐞 버그 제보 시 멤버십 증정' },
    contact_bug_p:   { zh: '找到網站錯誤（功能、內容、翻譯都算）請來信描述問題與重現步驟，經確認後贈送會員資格。', en: 'Found a bug (feature, content, or translation)? Email us with a description and reproduction steps — confirmed reports earn a free VIP membership.', ja: '不具合（機能・内容・翻訳を含む）を見つけたら、内容と再現手順をメールでお知らせください。確認後、会員資格を進呈します。', ko: '버그(기능, 콘텐츠, 번역 포함)를 발견하면 내용과 재현 단계를 이메일로 보내주세요. 확인 후 멤버십을 드립니다.' },
    contact_mail_h:  { zh: '✉️ Email', en: '✉️ Email', ja: '✉️ メール', ko: '✉️ 이메일' },
    contact_reply_p: { zh: '來信請註明主題（合作／BUG 回報／其他），會盡快回覆。', en: 'Please note the subject (partnership / bug report / other) in your email. We reply as soon as possible.', ja: '件名（提携／バグ報告／その他）を明記してください。できるだけ早く返信します。', ko: '제목(협력/버그 제보/기타)을 명시해 주세요. 빠르게 회신드리겠습니다.' },

    // ---- 共用 ----
    export:   { zh: '匯出', en: 'Export', ja: 'エクスポート', ko: '내보내기' },
    import:   { zh: '匯入', en: 'Import', ja: 'インポート', ko: '가져오기' },
    login:    { zh: '登入', en: 'Sign in', ja: 'ログイン', ko: '로그인' },
    delete:   { zh: '刪除', en: 'Delete', ja: '削除', ko: '삭제' },
    settings: { zh: '設定', en: 'Settings', ja: '設定', ko: '설정' },
    run:      { zh: '執行', en: 'Run', ja: '実行', ko: '실행' },
    stop:     { zh: '停止', en: 'Stop', ja: '停止', ko: '정지' },
    on:       { zh: '開', en: 'ON', ja: 'ON', ko: 'ON' },
    off:      { zh: '關', en: 'OFF', ja: 'OFF', ko: 'OFF' },

    // ---- 儀器名（業界標準譯名）----
    inst_psu:      { zh: '電源供應器', en: 'DC Power Supply', ja: '直流安定化電源', ko: 'DC 전원 공급기' },
    inst_eload:    { zh: '電子負載', en: 'Electronic Load', ja: '電子負荷', ko: '전자 부하' },
    inst_scope:    { zh: '示波器', en: 'Oscilloscope', ja: 'オシロスコープ', ko: '오실로스코프' },
    inst_siggen:   { zh: '信號產生器', en: 'Function Generator', ja: 'ファンクションジェネレータ', ko: '함수 발생기' },
    inst_dmm:      { zh: '數位萬用電表', en: 'Digital Multimeter', ja: 'デジタルマルチメータ', ko: '디지털 멀티미터' },
    inst_spectrum: { zh: '頻譜分析儀', en: 'Spectrum Analyzer', ja: 'スペクトラムアナライザ', ko: '스펙트럼 분석기' },
    inst_vna:      { zh: '網路分析儀', en: 'Network Analyzer', ja: 'ネットワークアナライザ', ko: '네트워크 분석기' },
    inst_comm:     { zh: '通訊測試儀', en: 'Communications Tester', ja: '通信テスタ', ko: '통신 테스터' },
    inst_lcr:      { zh: 'LCR 表', en: 'LCR Meter', ja: 'LCRメータ', ko: 'LCR 미터' },

    // ---- 儀器術語 ----
    t_waveform:   { zh: '波形', en: 'Waveform', ja: '波形', ko: '파형' },
    t_sine:       { zh: '正弦波', en: 'Sine', ja: '正弦波', ko: '정현파' },
    t_square:     { zh: '方波', en: 'Square', ja: '方形波', ko: '구형파' },
    t_triangle:   { zh: '三角波', en: 'Triangle', ja: '三角波', ko: '삼각파' },
    t_freq:       { zh: '頻率', en: 'Frequency', ja: '周波数', ko: '주파수' },
    t_amplitude:  { zh: '振幅', en: 'Amplitude', ja: '振幅', ko: '진폭' },
    t_offset:     { zh: '直流偏移', en: 'DC Offset', ja: 'DCオフセット', ko: 'DC 오프셋' },
    t_duty:       { zh: '佔空比', en: 'Duty Cycle', ja: 'デューティ比', ko: '듀티비' },
    t_timebase:   { zh: '時基', en: 'Time/div', ja: 'タイムベース', ko: '타임베이스' },
    t_vdiv:       { zh: '垂直刻度', en: 'Volts/div', ja: '電圧軸感度', ko: '수직 감도' },
    t_trigger:    { zh: '觸發', en: 'Trigger', ja: 'トリガ', ko: '트리거' },
    t_channel:    { zh: '通道', en: 'Channel', ja: 'チャンネル', ko: '채널' },
    t_probe:      { zh: '探棒', en: 'Probe', ja: 'プローブ', ko: '프로브' },
    t_voltage:    { zh: '電壓', en: 'Voltage', ja: '電圧', ko: '전압' },
    t_current:    { zh: '電流', en: 'Current', ja: '電流', ko: '전류' },
    t_cv:         { zh: '定電壓', en: 'CV (Constant Voltage)', ja: '定電圧', ko: '정전압' },
    t_cc:         { zh: '定電流', en: 'CC (Constant Current)', ja: '定電流', ko: '정전류' },
    t_ilimit:     { zh: '限流', en: 'Current Limit', ja: '電流制限', ko: '전류 제한' },
    t_dc_avg:     { zh: '直流(平均)', en: 'DC (Avg)', ja: 'DC(平均)', ko: 'DC(평균)' },
    t_ac_rms:     { zh: '交流有效值', en: 'AC RMS', ja: 'AC実効値', ko: 'AC 실효값' },
    t_impedance:  { zh: '阻抗', en: 'Impedance', ja: 'インピーダンス', ko: '임피던스' },
    t_phase:      { zh: '相位', en: 'Phase', ja: '位相', ko: '위상' },
    t_qfactor:    { zh: '品質因數 Q', en: 'Q Factor', ja: 'Q値', ko: 'Q 값' },
    t_dfactor:    { zh: '損耗因數 D', en: 'Dissipation Factor D', ja: '損失係数D', ko: '손실 계수 D' },
    t_cutoff:     { zh: '截止頻率', en: 'Cutoff Frequency', ja: '遮断周波数', ko: '차단 주파수' },
    t_gain:       { zh: '增益', en: 'Gain', ja: '利得', ko: '이득' },
    t_bode:       { zh: '頻率響應', en: 'Frequency Response', ja: '周波数特性', ko: '주파수 응답' },
    t_eye:        { zh: '眼圖', en: 'Eye Diagram', ja: 'アイダイアグラム', ko: '아이 다이어그램' },
    t_bitrate:    { zh: '位元率', en: 'Bit Rate', ja: 'ビットレート', ko: '비트 전송률' },
    t_eyeopen:    { zh: '眼開度', en: 'Eye Opening', ja: 'アイ開口', ko: '아이 개구도' },
    t_testfreq:   { zh: '測試頻率', en: 'Test Frequency', ja: '測定周波数', ko: '측정 주파수' },
    t_node:       { zh: '節點', en: 'Node', ja: 'ノード', ko: '노드' },
    t_dut:        { zh: '待測物 (RC 濾波器)', en: 'DUT (RC Filter)', ja: '被測定物 (RCフィルタ)', ko: 'DUT (RC 필터)' },
    t_series:     { zh: '串聯等效', en: 'Series Model', ja: '直列等価', ko: '직렬 등가' },
    t_marker:     { zh: '標記', en: 'Marker', ja: 'マーカ', ko: '마커' },

    // ---- 實驗台 UI ----
    lab_title:    { zh: '儀器實驗台', en: 'Instrument Bench', ja: '計測器ベンチ', ko: '계측기 벤치' },
    lab_hint:     { zh: '教學級模擬（RC 一階解析解 + DFT），非 SPICE。點節點指定示波器通道；連線看訊號。', en: 'Teaching-grade simulation (first-order RC analytic + DFT), not SPICE. Click a node to assign scope channels.', ja: '教育用シミュレーション（RC一次解析解＋DFT）。SPICEではありません。ノードをクリックしてチャンネルへ割当。', ko: '교육용 시뮬레이션(RC 1차 해석해 + DFT), SPICE 아님. 노드를 클릭해 채널에 할당.' },
    lab_signal_path: { zh: '訊號路徑', en: 'Signal Path', ja: '信号経路', ko: '신호 경로' },
    lab_3d_note:  { zh: '3D 面板為後續版本（Three.js）', en: '3D panels planned (Three.js)', ja: '3Dパネルは今後対応（Three.js）', ko: '3D 패널은 추후 지원(Three.js)' },

    // ---- 硬體知識庫（左側欄位）----
    kb_subtitle:   { zh: '繪製、分析並保存你的直流線路圖', en: 'Draw, analyze and save your DC schematics', ja: '直流回路図を描き、分析・保存', ko: 'DC 회로도를 그리고 분석·저장' },
    kb_upload:     { zh: '上傳 PDF', en: 'Upload PDF', ja: 'PDF アップロード', ko: 'PDF 업로드' },
    kb_upload_btn: { zh: '📄 上傳', en: '📄 Upload', ja: '📄 アップロード', ko: '📄 업로드' },
    kb_prodcat:    { zh: '產品大分類', en: 'Product categories', ja: '製品カテゴリ', ko: '제품 카테고리' },
    kb_topo:       { zh: '常用線路拓樸', en: 'Common topologies', ja: 'よく使う回路トポロジ', ko: '자주 쓰는 회로 토폴로지' },
    kb_subcat:     { zh: '小分類（電路）', en: 'Subcategories (circuits)', ja: 'サブカテゴリ（回路）', ko: '세부 분류(회로)' },
    kb_pdfmgr:     { zh: 'PDF 管理', en: 'PDF management', ja: 'PDF 管理', ko: 'PDF 관리' },
    kb_nopdf:      { zh: '尚未上傳 PDF', en: 'No PDF uploaded yet', ja: 'まだ PDF がありません', ko: '업로드된 PDF 없음' },
    kb_search:     { zh: '搜尋硬體知識...', en: 'Search hardware knowledge...', ja: 'ハードウェア知識を検索...', ko: '하드웨어 지식 검색...' },
    kb_modaltitle: { zh: '知識標題', en: 'Knowledge title', ja: 'ナレッジタイトル', ko: '지식 제목' },
    kb_all:        { zh: '全部主題', en: 'All topics', ja: 'すべてのトピック', ko: '전체 주제' },
    kb_power:      { zh: '電源管理', en: 'Power management', ja: '電源管理', ko: '전원 관리' },
    kb_signal:     { zh: '訊號處理', en: 'Signal processing', ja: '信号処理', ko: '신호 처리' },
    kb_comm:       { zh: '通訊介面', en: 'Communication interfaces', ja: '通信インターフェース', ko: '통신 인터페이스' },
    kb_transistor: { zh: '電晶體應用', en: 'Transistor applications', ja: 'トランジスタ応用', ko: '트랜지스터 응용' },
    kb_protection: { zh: '保護電路', en: 'Protection circuits', ja: '保護回路', ko: '보호 회로' },
    kb_highspeed:  { zh: '高速設計', en: 'High-speed design', ja: '高速設計', ko: '고속 설계' },
    kb_analog:     { zh: '類比電路', en: 'Analog circuits', ja: 'アナログ回路', ko: '아날로그 회로' },
    kb_dataconv:   { zh: '資料轉換', en: 'Data conversion', ja: 'データ変換', ko: '데이터 변환' },
    kb_pcbdesign:  { zh: 'PCB 設計', en: 'PCB design', ja: 'PCB設計', ko: 'PCB 설계' },
    kb_measure:    { zh: '量測技術', en: 'Measurement', ja: '計測技術', ko: '계측 기술' },
    kb_embedded:   { zh: '嵌入式系統', en: 'Embedded systems', ja: '組み込みシステム', ko: '임베디드 시스템' },
    kb_auto:       { zh: '車用電子', en: 'Automotive', ja: '車載エレクトロニクス', ko: '차량용 전자' },
    kb_emc:        { zh: 'EMC 設計', en: 'EMC design', ja: 'EMC設計', ko: 'EMC 설계' },
    kb_emi:        { zh: 'EMI 對策', en: 'EMI countermeasures', ja: 'EMI対策', ko: 'EMI 대책' },
    kb_interview:  { zh: '面試題目', en: 'Interview questions', ja: '面接問題', ko: '면접 문제' },
    kb_c_pcb:      { zh: '走線, 叠層, Via', en: 'Routing, Stackup, Via', ja: '配線, 積層, ビア', ko: '배선, 적층, Via' },
    kb_c_emc:      { zh: '抗擾、接地、遮蔽', en: 'Immunity, Grounding, Shielding', ja: 'イミュニティ, 接地, シールド', ko: '내성, 접지, 차폐' },
    kb_c_emi:      { zh: '濾波、共模扼流、佈局', en: 'Filtering, Common-mode choke, Layout', ja: 'フィルタ, コモンモードチョーク, レイアウト', ko: '필터링, 공통 모드 초크, 레이아웃' }
  };

  let lang = localStorage.getItem(LS) || 'zh';
  if (!LANGS.some(l => l[0] === lang)) lang = 'zh';

  function t(key) { const e = D[key]; return e ? (e[lang] || e.zh) : key; }

  // nav 依 href 自動翻譯（不用每頁加 data-i18n）
  const NAV_MAP = {
    'index.html': 'nav_schematic', 'architecture.html': 'nav_arch', 'ic-library.html': 'nav_iclib',
    'knowledge.html': 'nav_knowledge', 'pcb.html': 'nav_pcb', 'interview.html': 'nav_interview',
    'lab.html': 'nav_lab', 'upgrade.html': 'nav_upgrade', 'pcb-viewer.html': 'nav_pcbviewer',
    'contact.html': 'nav_contact'
  };

  function apply(root) {
    root = root || document;
    root.querySelectorAll('.main-nav a.nav-link').forEach(a => {
      const key = NAV_MAP[(a.getAttribute('href') || '').split('?')[0]];
      if (key) a.textContent = t(key);
    });
    // brand：若元素本身有 data-i18n（app.js 自有系統管），不動它
    const brand = root.querySelector('.brand h1');
    if (brand && !brand.dataset.i18n) brand.textContent = t('brand_title');
    // 重要：key 不在本字典就「不動元素」——避免蓋掉 app.js 自有 i18n 的內容（appTitle bug）
    root.querySelectorAll('[data-i18n]').forEach(el => { if (D[el.dataset.i18n]) el.textContent = t(el.dataset.i18n); });
    root.querySelectorAll('[data-i18n-title]').forEach(el => { if (D[el.dataset.i18nTitle]) el.title = t(el.dataset.i18nTitle); });
    root.querySelectorAll('[data-i18n-placeholder]').forEach(el => { if (D[el.dataset.i18nPlaceholder]) el.placeholder = t(el.dataset.i18nPlaceholder); });
  }

  // 與 app.js 自有 i18n（線路圖左元件/右模擬 74 詞條，zh/en/ja/ko）同步
  function syncApp() {
    try {
      if (typeof app !== 'undefined' && app.i18n && app.state) {
        app.state.lang = app.i18n[lang] ? lang : 'en';
        localStorage.setItem('voltsketch-lang', app.state.lang);
        if (app.applyI18n) app.applyI18n();
        if (app.render) app.render();
      }
    } catch (e) { }
  }

  function setLang(l) {
    if (!LANGS.some(x => x[0] === l)) return;
    lang = l; localStorage.setItem(LS, l);
    apply(); syncApp();
    document.dispatchEvent(new CustomEvent('vs-lang-change', { detail: { lang: l } }));
  }

  // 自動在 topbar 掛語言切換器
  function mountSwitcher() {
    const nav = document.querySelector('.main-nav');
    if (!nav || nav.querySelector('.lang-sel')) return;
    const sel = document.createElement('select');
    sel.className = 'lang-sel';
    sel.style.cssText = 'margin-left:10px;padding:3px 6px;border:1px solid #cbd5e1;border-radius:6px;font-size:12px;background:#fff;cursor:pointer';
    sel.innerHTML = LANGS.map(([v, n]) => `<option value="${v}"${v === lang ? ' selected' : ''}>${n}</option>`).join('');
    sel.addEventListener('change', () => setLang(sel.value));
    nav.appendChild(sel);
  }

  function init() { mountSwitcher(); apply(); setTimeout(syncApp, 60); }  // 延遲等 app.init 完成
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  return { t, apply, setLang, get lang() { return lang; }, LANGS, dict: D };
})();
