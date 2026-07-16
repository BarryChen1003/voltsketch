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
    kb_c_emi:      { zh: '濾波、共模扼流、佈局', en: 'Filtering, Common-mode choke, Layout', ja: 'フィルタ, コモンモードチョーク, レイアウト', ko: '필터링, 공통 모드 초크, 레이아웃' },

    // ---- PCB Layout 頁（工具面板/分頁/按鈕/狀態）----
    pcb_gate_title: { zh: 'PCB Layout 邀請制', en: 'PCB Layout (invite only)', ja: 'PCB Layout（招待制）', ko: 'PCB Layout(초대제)' },
    pcb_gate_enter: { zh: '進入', en: 'Enter', ja: '入る', ko: '입장' },
    pcb_gate_ph:    { zh: '輸入邀請碼', en: 'Enter invite code', ja: '招待コードを入力', ko: '초대 코드 입력' },
    pcb_new:        { zh: '+ 新建', en: '+ New', ja: '+ 新規', ko: '+ 새로 만들기' },
    pcb_save:       { zh: '💾 儲存', en: '💾 Save', ja: '💾 保存', ko: '💾 저장' },
    pcb_top_export: { zh: '📤 匯出', en: '📤 Export', ja: '📤 エクスポート', ko: '📤 내보내기' },
    pcb_tab_layout: { zh: '🛠 Layout 編輯', en: '🛠 Layout editor', ja: '🛠 レイアウト編集', ko: '🛠 레이아웃 편집' },
    pcb_tab_viewer: { zh: '🔍 板面檢視', en: '🔍 Board viewer', ja: '🔍 基板ビュー', ko: '🔍 보드 뷰' },
    pcb_tab_refs:   { zh: '📐 開源公版', en: '📐 Open-source boards', ja: '📐 オープンソース基板', ko: '📐 오픈소스 보드' },
    pcb_tools:      { zh: 'PCB 工具', en: 'PCB tools', ja: 'PCBツール', ko: 'PCB 도구' },
    pcb_tool_select:{ zh: '選取', en: 'Select', ja: '選択', ko: '선택' },
    pcb_tool_trace: { zh: '走線', en: 'Trace', ja: '配線', ko: '배선' },
    pcb_tool_copper:{ zh: '銅箔', en: 'Copper pour', ja: '銅箔', ko: '카퍼' },
    pcb_tool_keepout:{ zh: '禁止區', en: 'Keepout', ja: 'キープアウト', ko: '금지 영역' },
    pcb_tool_text:  { zh: '文字', en: 'Text', ja: 'テキスト', ko: '텍스트' },
    pcb_tool_dim:   { zh: '尺寸', en: 'Dimension', ja: '寸法', ko: '치수' },
    pcb_autoroute:  { zh: '⚡ 自動佈線未連線（單層試驗）', en: '⚡ Auto-route unconnected (single-layer)', ja: '⚡ 未接続を自動配線（単層試験）', ko: '⚡ 미연결 자동 배선(단층 시험)' },
    pcb_syncnet:    { zh: '⇪ 從線路圖同步 netlist', en: '⇪ Sync netlist from schematic', ja: '⇪ 回路図から netlist 同期', ko: '⇪ 회로도에서 netlist 동기화' },
    pcb_3d:         { zh: '🧊 3D 檢視', en: '🧊 3D view', ja: '🧊 3Dビュー', ko: '🧊 3D 보기' },
    pcb_rules:      { zh: 'Layout 規則', en: 'Layout rules', ja: 'レイアウトルール', ko: '레이아웃 규칙' },
    pcb_addrule:    { zh: '＋規則', en: '+ Rule', ja: '＋ルール', ko: '＋규칙' },
    pcb_imp:        { zh: '阻抗計算（IPC-2141 近似）', en: 'Impedance calc (IPC-2141 approx.)', ja: 'インピーダンス計算（IPC-2141 近似）', ko: '임피던스 계산(IPC-2141 근사)' },
    pcb_calc:       { zh: '計算', en: 'Calculate', ja: '計算', ko: '계산' },
    pcb_iclib:      { zh: 'IC 元件庫放料', en: 'Place from IC library', ja: 'ICライブラリから配置', ko: 'IC 라이브러리에서 배치' },
    pcb_placeic:    { zh: '📦 放到板上（真 pad footprint）', en: '📦 Place on board (real pad footprint)', ja: '📦 基板に配置（実 pad footprint）', ko: '📦 보드에 배치(실제 pad footprint)' },
    pcb_kicad:      { zh: 'KiCad 匯入 / 匯出', en: 'KiCad import / export', ja: 'KiCad インポート / エクスポート', ko: 'KiCad 가져오기 / 내보내기' },
    pcb_exp_kicad:  { zh: '💾 匯出 .kicad_pcb', en: '💾 Export .kicad_pcb', ja: '💾 .kicad_pcb エクスポート', ko: '💾 .kicad_pcb 내보내기' },
    pcb_exp_gerber: { zh: '🏭 匯出製造包（Gerber+鑽孔+鋼網+CPL+IPC-356）', en: '🏭 Export fab package (Gerber+Drill+Paste+CPL+IPC-356)', ja: '🏭 製造パッケージ出力（Gerber+ドリル+メタルマスク+CPL+IPC-356）', ko: '🏭 제조 패키지 내보내기(Gerber+드릴+스텐실+CPL+IPC-356)' },
    pcb_board:      { zh: '板框設定', en: 'Board outline', ja: '基板外形設定', ko: '보드 외형 설정' },
    pcb_apply:      { zh: '套用設定', en: 'Apply', ja: '設定を適用', ko: '설정 적용' },
    pcb_zoomfit:    { zh: '適合', en: 'Fit', ja: 'フィット', ko: '맞춤' },
    pcb_ready:      { zh: '就緒', en: 'Ready', ja: '準備完了', ko: '준비됨' },
    pcb_layers:     { zh: '圖層管理', en: 'Layers', ja: 'レイヤー管理', ko: '레이어 관리' },
    pcb_parts:      { zh: '板上料件', en: 'Board parts', ja: '基板上の部品', ko: '보드 부품' },
    pcb_selcomp:    { zh: '選取元件', en: 'Selected component', ja: '選択部品', ko: '선택 부품' },
    pcb_rot90:      { zh: '旋轉 90°（R）', en: 'Rotate 90° (R)', ja: '90°回転（R）', ko: '90° 회전(R)' },
    pcb_drc:        { zh: 'DRC 檢查', en: 'DRC check', ja: 'DRC チェック', ko: 'DRC 검사' },
    pcb_rundrc:     { zh: '執行檢查', en: 'Run check', ja: 'チェック実行', ko: '검사 실행' },
    pcb_no_drc:     { zh: '尚未執行 DRC 檢查', en: 'DRC not run yet', ja: 'DRC 未実行', ko: 'DRC 미실행' },
    pcb_emi:        { zh: '⚡ EMI 環路檢查（心中有環）', en: '⚡ EMI loop check', ja: '⚡ EMI ループチェック', ko: '⚡ EMI 루프 검사' },
    pcb_runemi:     { zh: '檢查環路', en: 'Check loops', ja: 'ループをチェック', ko: '루프 검사' },
    pcb_thermal:    { zh: '🌡️ 熱 / 散熱估算', en: '🌡️ Thermal estimate', ja: '🌡️ 熱・放熱の見積り', ko: '🌡️ 열/방열 추정' },
    pcb_runthermal: { zh: '熱估算', en: 'Estimate', ja: '熱の見積り', ko: '열 추정' },
    pcb_no_netlist: { zh: '尚無 Netlist 資料', en: 'No netlist data yet', ja: 'netlist データなし', ko: 'netlist 데이터 없음' },
    pcb_tutorial:   { zh: '📚 教學模式', en: '📚 Tutorial mode', ja: '📚 チュートリアル', ko: '📚 튜토리얼 모드' },
    pcb_pick_tutorial: { zh: '選擇一個課程開始學習', en: 'Pick a lesson to start', ja: 'レッスンを選んで開始', ko: '강의를 선택해 시작' },
    pcb_practice:   { zh: '🎯 練習模式', en: '🎯 Practice mode', ja: '🎯 練習モード', ko: '🎯 연습 모드' },
    pcb_pick_practice: { zh: '選擇一個練習開始實作', en: 'Pick an exercise to start', ja: '練習を選んで開始', ko: '연습을 선택해 시작' },
    pcb_interview:  { zh: '📝 PCB Layout 面試題', en: '📝 PCB Layout interview Q&A', ja: '📝 PCB Layout 面接問題', ko: '📝 PCB Layout 면접 문제' },
    pcb_props:      { zh: '屬性', en: 'Properties', ja: 'プロパティ', ko: '속성' },
    pcb_no_sel:     { zh: '尚未選取元件', en: 'No component selected', ja: '部品が未選択', ko: '선택된 부품 없음' },
    pcb_icpick_ph:  { zh: '輸入料號（如 TAC5111-Q1）…', en: 'Enter part number (e.g. TAC5111-Q1)…', ja: '型番を入力（例 TAC5111-Q1）…', ko: '부품 번호 입력(예 TAC5111-Q1)…' },

    // ---- PCB 狀態面板（Allegro 風格）----
    st_btn:          { zh: '📊 狀態', en: '📊 Status', ja: '📊 ステータス', ko: '📊 상태' },
    st_title:        { zh: '板況狀態', en: 'Board status', ja: '基板ステータス', ko: '보드 상태' },
    st_symnets:      { zh: '符號與網路', en: 'Symbols and nets', ja: 'シンボルとネット', ko: '심볼 및 넷' },
    st_unplaced:     { zh: '未佈局符號', en: 'Unplaced symbols', ja: '未配置シンボル', ko: '미배치 심볼' },
    st_unrouted_nets:{ zh: '未繞線網路', en: 'Unrouted nets', ja: '未配線ネット', ko: '미배선 넷' },
    st_unrouted_conns:{ zh: '未繞線連接', en: 'Unrouted connections', ja: '未配線接続', ko: '미배선 연결' },
    st_shapes:       { zh: '形狀（鋪銅）', en: 'Shapes', ja: 'シェイプ（銅箔）', ko: '셰이프(카퍼)' },
    st_isolated:     { zh: '孤立形狀', en: 'Isolated shapes', ja: '孤立シェイプ', ko: '고립 셰이프' },
    st_unassigned:   { zh: '未指派形狀', en: 'Unassigned shapes', ja: '未割当シェイプ', ko: '미할당 셰이프' },
    st_outofdate:    { zh: '過期形狀', en: 'Out of date shapes', ja: '期限切れシェイプ', ko: '오래된 셰이프' },
    st_dynfill:      { zh: '動態填充', en: 'Dynamic fill', ja: 'ダイナミックフィル', ko: '동적 채움' },
    st_smooth:       { zh: '平滑', en: 'Smooth', ja: 'スムーズ', ko: '스무스' },
    st_rough:        { zh: '粗略', en: 'Rough', ja: 'ラフ', ko: '러프' },
    st_disabled:     { zh: '停用', en: 'Disabled', ja: '無効', ko: '비활성' },
    st_drc:          { zh: 'DRC 與檢查', en: 'DRC and checks', ja: 'DRC・チェック', ko: 'DRC 및 검사' },
    st_drc_err:      { zh: 'DRC 錯誤', en: 'DRC errors', ja: 'DRC エラー', ko: 'DRC 오류' },
    st_short_err:    { zh: '短路錯誤', en: 'Shorting errors', ja: 'ショートエラー', ko: '단락 오류' },
    st_warn:         { zh: '警告', en: 'Warnings', ja: '警告', ko: '경고' },
    st_online_drc:   { zh: '即時 DRC', en: 'On-line DRC', ja: 'オンライン DRC', ko: '온라인 DRC' },
    st_update_drc:   { zh: '更新 DRC', en: 'Update DRC', ja: 'DRC 更新', ko: 'DRC 업데이트' },
    st_stats:        { zh: '統計', en: 'Statistics', ja: '統計', ko: '통계' },
    st_edit_time:    { zh: '編輯時間', en: 'Editing time', ja: '編集時間', ko: '편집 시간' },
    st_last_active:  { zh: '最後編輯', en: 'Last edited', ja: '最終編集', ko: '마지막 편집' },
    st_reset:        { zh: '重設', en: 'Reset', ja: 'リセット', ko: '리셋' },
    st_refresh:      { zh: '重新整理', en: 'Refresh', ja: '更新', ko: '새로 고침' },
    st_close:        { zh: '關閉', en: 'Close', ja: '閉じる', ko: '닫기' },

    // ---- PCB Layout 表單欄位 / 選項 / 面試題 ----
    pcbf_tracew:    { zh: '線寬 (mm)', en: 'Trace width (mm)', ja: '線幅 (mm)', ko: '선폭 (mm)' },
    pcbf_layer:     { zh: '層', en: 'Layer', ja: 'レイヤー', ko: '레이어' },
    pcbf_ratsnest:  { zh: '顯示飛線（未連線）', en: 'Show ratsnest (unrouted)', ja: 'ラッツネスト表示（未配線）', ko: '랫츠네스트 표시(미배선)' },
    pcbf_impkind:   { zh: '結構', en: 'Structure', ja: '構造', ko: '구조' },
    pcbf_impw:      { zh: '線寬 w', en: 'Width w', ja: '線幅 w', ko: '선폭 w' },
    pcbf_imph:      { zh: '介電厚 h', en: 'Dielectric h', ja: '誘電体厚 h', ko: '유전체 두께 h' },
    pcbf_impt:      { zh: '銅厚 t', en: 'Copper t', ja: '銅厚 t', ko: '동박 두께 t' },
    pcbf_imps:      { zh: '間距 s（差分）', en: 'Spacing s (diff)', ja: '間隔 s（差動）', ko: '간격 s(차동)' },
    pcbf_boardw:    { zh: '寬度 (mm)', en: 'Width (mm)', ja: '幅 (mm)', ko: '너비 (mm)' },
    pcbf_boardh:    { zh: '高度 (mm)', en: 'Height (mm)', ja: '高さ (mm)', ko: '높이 (mm)' },
    pcbf_layers:    { zh: '層數 (1~40 自訂)', en: 'Layers (1-40 custom)', ja: '層数 (1~40 任意)', ko: '층수 (1~40 사용자 지정)' },
    pcbf_angle:     { zh: '角度 (°)', en: 'Angle (°)', ja: '角度 (°)', ko: '각도 (°)' },
    pcbf_grid:      { zh: '格點 (mm)', en: 'Grid (mm)', ja: 'グリッド (mm)', ko: '그리드 (mm)' },
    pcbf_clearance: { zh: '最小間距', en: 'Min clearance', ja: '最小クリアランス', ko: '최소 간격' },
    pcbf_mintrace:  { zh: '最小線寬', en: 'Min trace width', ja: '最小線幅', ko: '최소 선폭' },
    pcbf_minpower:  { zh: '電源線寬', en: 'Power trace width', ja: '電源線幅', ko: '전원 선폭' },
    pcbf_edge:      { zh: '板邊間距', en: 'Edge clearance', ja: '基板端クリアランス', ko: '보드 엣지 간격' },
    pcbf_compspace: { zh: '元件間距', en: 'Component spacing', ja: '部品間隔', ko: '부품 간격' },
    pcbf_masksliver:{ zh: '阻焊橋下限', en: 'Min solder-mask bridge', ja: 'ソルダーマスクブリッジ下限', ko: '솔더마스크 브리지 하한' },
    pcbf_cin:       { zh: '輸入電容 Cin', en: 'Input cap Cin', ja: '入力コンデンサ Cin', ko: '입력 커패시터 Cin' },
    pcbf_d:         { zh: '二極體/上管 D', en: 'Diode/high-side D', ja: 'ダイオード/上側 D', ko: '다이오드/상단 D' },
    pcbf_l:         { zh: '電感 L', en: 'Inductor L', ja: 'インダクタ L', ko: '인덕터 L' },
    pcbf_cout:      { zh: '輸出電容 Cout', en: 'Output cap Cout', ja: '出力コンデンサ Cout', ko: '출력 커패시터 Cout' },
    pcbf_thcu:      { zh: '銅厚', en: 'Copper wt', ja: '銅厚', ko: '동박 두께' },
    pcbf_thdt:      { zh: '溫升 ΔT(°C)', en: 'Temp rise ΔT(°C)', ja: '温度上昇 ΔT(°C)', ko: '온도 상승 ΔT(°C)' },
    pcbf_thta:      { zh: '環溫 Ta(°C)', en: 'Ambient Ta(°C)', ja: '周囲温度 Ta(°C)', ko: '주위 온도 Ta(°C)' },
    pcbf_thi:       { zh: '目標電流(A)', en: 'Target current(A)', ja: '目標電流(A)', ko: '목표 전류(A)' },
    pcbf_thp:       { zh: '功耗 P(W)', en: 'Power P(W)', ja: '消費電力 P(W)', ko: '소비 전력 P(W)' },
    pcbf_tharea:    { zh: '散熱銅(cm²)', en: 'Copper area(cm²)', ja: '放熱銅(cm²)', ko: '방열 동박(cm²)' },
    pcbf_thvias:    { zh: '散熱孔數', en: 'Thermal vias', ja: '放熱ビア数', ko: '방열 비아 수' },
    pcbf_o_micro:   { zh: '微帶線（外層）', en: 'Microstrip (outer)', ja: 'マイクロストリップ（外層）', ko: '마이크로스트립(외층)' },
    pcbf_o_strip:   { zh: '帶狀線（內層）', en: 'Stripline (inner)', ja: 'ストリップライン（内層）', ko: '스트립라인(내층)' },
    pcbf_o_dmicro:  { zh: '差分微帶線', en: 'Diff microstrip', ja: '差動マイクロストリップ', ko: '차동 마이크로스트립' },
    pcbf_o_dstrip:  { zh: '差分帶狀線', en: 'Diff stripline', ja: '差動ストリップライン', ko: '차동 스트립라인' },
    pcbf_rulecfg:   { zh: '規則設定（mm）', en: 'Rule settings (mm)', ja: 'ルール設定（mm）', ko: '규칙 설정(mm)' },
    pcbf_kicad_import: { zh: '📂 匯入 .kicad_pcb', en: '📂 Import .kicad_pcb', ja: '📂 .kicad_pcb インポート', ko: '📂 .kicad_pcb 가져오기' },
    pcbf_viewer_title: { zh: 'PCB 檢視器', en: 'PCB viewer', ja: 'PCBビューア', ko: 'PCB 뷰어' },
    pcbf_selinfo:   { zh: 'select 工具點擊元件選取；拖曳移動（格點吸附）、R 鍵旋轉 90°、Esc 取消。', en: 'Click a component with the Select tool; drag to move (grid snap), R to rotate 90°, Esc to cancel.', ja: 'Select ツールで部品をクリック選択；ドラッグで移動（グリッドスナップ）、R キーで 90°回転、Esc で取消。', ko: 'Select 도구로 부품을 클릭해 선택; 드래그로 이동(그리드 스냅), R 키로 90° 회전, Esc로 취소.' },
    pcbf_q1:        { zh: '電源去耦電容怎麼放？', en: 'How should decoupling caps be placed?', ja: 'デカップリングコンデンサの配置は？', ko: '디커플링 커패시터는 어떻게 배치하나?' },
    pcbf_q2:        { zh: '高速差分對走線要點？', en: 'High-speed diff-pair routing tips?', ja: '高速差動ペア配線のポイントは？', ko: '고속 차동 쌍 배선 요점은?' },
    pcbf_q3:        { zh: '為什麼要完整的地平面(return path)？', en: 'Why a solid ground plane (return path)?', ja: 'なぜ完全なグランド面(リターンパス)が必要？', ko: '왜 완전한 접지면(리턴 패스)이 필요한가?' },
    pcbf_q4:        { zh: '開關電源(SW 節點)佈局注意？', en: 'SMPS (SW node) layout notes?', ja: 'スイッチング電源(SWノード)レイアウトの注意点は？', ko: '스위칭 전원(SW 노드) 배치 주의점은?' },
    pcbf_q5:        { zh: '疊層怎麼選(4 層)？', en: 'How to choose a stackup (4-layer)?', ja: '積層構成の選び方(4層)は？', ko: '스택업 선택 방법(4층)은?' },
    pcbf_q6:        { zh: '散熱怎麼處理？', en: 'How to handle thermal dissipation?', ja: '放熱の処理方法は？', ko: '방열은 어떻게 처리하나?' },

    // ---- PCB Layout 說明段落 / 面試題解答 ----
    pcbf_h_trace:   { zh: '走線：拖曳畫線（0/45/90 吸角，Shift=自由角度，Esc 取消）；起點碰 pad/走線自動接該網路。銅箔工具：逐點點擊畫鋪銅、雙擊收尾（避讓 0.3mm 於 Gerber 生效）。', en: 'Trace: drag to draw (0/45/90° snap, Shift=free angle, Esc=cancel); starting on a pad/trace auto-joins that net. Copper tool: click point by point to draw a pour, double-click to finish (0.3mm clearance applied in Gerber).', ja: '配線：ドラッグで描画（0/45/90°スナップ、Shift=自由角度、Esc=取消）；始点が pad/配線に触れるとそのネットに自動接続。銅箔ツール：点を順にクリックしてベタを描き、ダブルクリックで終了（Gerber で 0.3mm クリアランス適用）。', ko: '배선: 드래그로 그리기(0/45/90° 스냅, Shift=자유 각도, Esc=취소); 시작점이 pad/배선에 닿으면 해당 넷에 자동 연결. 카퍼 도구: 점을 차례로 클릭해 카퍼를 그리고 더블클릭으로 종료(Gerber에서 0.3mm 클리어런스 적용).' },
    pcbf_h_rule:    { zh: 'net 名含關鍵字（或 /regex/）｜線寬下限｜線長上限｜差分對長度差（mm，0=不查）。畫線超標即時警示，DRC 全面稽核。', en: 'Net name keyword (or /regex/) | min trace width | max trace length | diff-pair length mismatch (mm, 0=skip). Warns live while drawing; DRC audits comprehensively.', ja: 'ネット名キーワード（または /regex/）｜線幅下限｜線長上限｜差動ペア長さ差（mm、0=チェックしない）。描画中に即時警告、DRC で全面監査。', ko: '넷 이름 키워드(또는 /regex/) | 선폭 하한 | 선 길이 상한 | 차동 쌍 길이 차(mm, 0=검사 안 함). 그리는 중 즉시 경고, DRC로 전면 감사.' },
    pcbf_h_imp:     { zh: '單位 mm。近似式誤差 ±10% 等級；量產阻抗控制以板廠疊構與場型解算為準。', en: 'Units mm. Approximation error on the order of ±10%; for production, impedance control follows the fab stackup and field solver.', ja: '単位 mm。近似式の誤差は ±10% 程度；量産のインピーダンス制御は基板メーカーの積層と電磁界ソルバーに準拠。', ko: '단위 mm. 근사식 오차 ±10% 수준; 양산 임피던스 제어는 제조사 적층과 필드 솔버 기준.' },
    pcbf_h_kicad:   { zh: '匯入檔會保留整棵原始資料樹；匯出時未編輯的幾何 100% 原樣回寫（零落差）。.brd 為 Cadence 專有二進位：匯入走「板面檢視」分頁的 SKILL 抽取，匯出走 SKILL 重建腳本。', en: 'Imported files keep the whole original data tree; on export, unedited geometry is written back 100% as-is (zero drift). .brd is a Cadence proprietary binary: import via the Board-viewer tab SKILL extraction, export via a SKILL rebuild script.', ja: 'インポートしたファイルは元のデータツリー全体を保持；エクスポート時、未編集のジオメトリは 100% そのまま書き戻し（ずれゼロ）。.brd は Cadence 専有バイナリ：インポートは「基板ビュー」タブの SKILL 抽出、エクスポートは SKILL 再構築スクリプト経由。', ko: '가져온 파일은 원본 데이터 트리 전체를 유지; 내보낼 때 편집하지 않은 지오메트리는 100% 그대로 기록(오차 없음). .brd는 Cadence 전용 바이너리: 가져오기는 「보드 뷰」 탭의 SKILL 추출, 내보내기는 SKILL 재구성 스크립트.' },
    pcbf_h_emi:     { zh: '指派關鍵元件 → 估算輸入熱環/輸出環面積（越小越好；輸入環優先）。', en: 'Assign the key components → estimates the input hot-loop / output-loop area (smaller is better; prioritize the input loop).', ja: '主要部品を割り当て → 入力ホットループ/出力ループ面積を推定（小さいほど良い；入力ループ優先）。', ko: '핵심 부품 지정 → 입력 핫 루프/출력 루프 면적 추정(작을수록 좋음; 입력 루프 우선).' },
    pcbf_a1:        { zh: '越靠近 IC 電源腳越好，小容值(0.1µF/1nF)最靠腳、大容值(10µF)稍遠；過孔直接打到電源/地平面，縮短迴路電感。每個電源腳至少一顆。', en: 'As close to the IC power pin as possible: small values (0.1µF/1nF) nearest the pin, large values (10µF) a bit farther; vias drop straight to the power/ground plane to shorten loop inductance. At least one cap per power pin.', ja: 'IC の電源ピンにできるだけ近づける：小容量(0.1µF/1nF)を最も近くに、大容量(10µF)は少し離す；ビアを電源/グランド面へ直接落としてループインダクタンスを短縮。各電源ピンに最低 1 個。', ko: 'IC 전원 핀에 최대한 가깝게: 소용량(0.1µF/1nF)을 핀에 가장 가깝게, 대용량(10µF)은 약간 멀리; 비아를 전원/접지면에 바로 연결해 루프 인덕턴스를 줄임. 전원 핀마다 최소 한 개.' },
    pcbf_a2:        { zh: '等長(長度匹配控制 skew)、等距(維持差分阻抗如 90Ω/100Ω)、同層走線、少過孔、避免急轉(用 45°或弧線)、遠離噪聲源、參考完整地平面。', en: 'Length-matched (control skew), equal spacing (hold diff impedance like 90Ω/100Ω), route on one layer, few vias, avoid sharp turns (use 45° or arcs), keep away from noise sources, reference a solid ground plane.', ja: '等長(スキュー制御)、等間隔(90Ω/100Ω など差動インピーダンス維持)、同一層配線、ビア最少、急な曲がりを避ける(45°または円弧)、ノイズ源から離す、完全なグランド面を参照。', ko: '등장(스큐 제어), 등간격(90Ω/100Ω 등 차동 임피던스 유지), 동일 층 배선, 비아 최소, 급격한 꺾임 회피(45° 또는 호), 노이즈원에서 멀리, 완전한 접지면 참조.' },
    pcbf_a3:        { zh: '高頻回流電流走訊號正下方的地，路徑斷裂(跨分割/挖空)會迫使繞路 → 增大迴路面積、EMI 與串擾。換層時鄰近放回流過孔。', en: 'High-frequency return current flows in the ground right under the signal; a broken path (crossing a split/cutout) forces a detour → larger loop area, EMI and crosstalk. Place a return via nearby when changing layers.', ja: '高周波のリターン電流は信号の真下のグランドを流れる；経路の断裂(分割/切り欠きの横断)は迂回を強い → ループ面積増大、EMI とクロストーク。層を替えるときは近くにリターンビアを配置。', ko: '고주파 리턴 전류는 신호 바로 아래 접지를 따라 흐름; 경로 단절(분할/컷아웃 횡단)은 우회를 강제 → 루프 면적 증가, EMI와 크로스토크. 층 변경 시 근처에 리턴 비아 배치.' },
    pcbf_a4:        { zh: 'SW 節點銅面要小(降 EMI 又要散熱權衡)、高頻迴路(Vin-開關-二極體-Cin)面積最小、輸入電容最靠 IC、回授走線遠離 SW、單點接地。', en: 'Keep the SW-node copper small (trade off EMI vs heat), minimize the high-frequency loop (Vin-switch-diode-Cin), input cap closest to the IC, keep feedback traces away from SW, single-point ground.', ja: 'SW ノードの銅面は小さく(EMI と放熱のトレードオフ)、高周波ループ(Vin-スイッチ-ダイオード-Cin)を最小に、入力コンデンサを IC に最も近く、フィードバック配線を SW から離す、一点接地。', ko: 'SW 노드 카퍼는 작게(EMI와 방열 트레이드오프), 고주파 루프(Vin-스위치-다이오드-Cin) 최소화, 입력 커패시터를 IC에 가장 가깝게, 피드백 배선을 SW에서 멀리, 단일점 접지.' },
    pcbf_a5:        { zh: '常見 訊號-地-電源-訊號：訊號層緊鄰完整地平面以控阻抗與回流；電源地相鄰形成平面電容；高速線走在靠地的外層或內層 stripline。', en: 'Common signal-ground-power-signal: signal layers sit next to a solid ground plane to control impedance and return; adjacent power and ground form plane capacitance; run high-speed lines on the ground-adjacent outer layer or an inner stripline.', ja: '一般的な 信号-グランド-電源-信号：信号層を完全なグランド面に隣接させインピーダンスとリターンを制御；電源とグランドを隣接させ平面容量を形成；高速線はグランドに近い外層または内層 stripline に配線。', ko: '일반적인 신호-접지-전원-신호: 신호층을 완전한 접지면에 인접시켜 임피던스와 리턴 제어; 인접한 전원과 접지가 평면 커패시턴스 형성; 고속 선은 접지에 가까운 외층 또는 내층 stripline에 배선.' },
    pcbf_a6:        { zh: '熱源下方加散熱過孔陣列接內層/底層大銅面、加大銅厚與銅面、必要時鋁基板或散熱片、考慮氣流方向、功率元件分散避免熱集中。', en: 'Add a thermal-via array under the heat source connecting to large inner/bottom copper, increase copper weight and area, use a metal-core board or heatsink if needed, consider airflow direction, spread power devices to avoid heat concentration.', ja: '熱源の下に放熱ビアアレイを追加して内層/底層の大きな銅面に接続、銅厚と銅面を増やす、必要ならアルミ基板やヒートシンク、気流方向を考慮、電力部品を分散して熱集中を回避。', ko: '열원 아래에 방열 비아 어레이를 추가해 내층/바닥층 큰 카퍼에 연결, 동박 두께와 면적 증가, 필요 시 메탈 코어 기판이나 히트싱크, 기류 방향 고려, 전력 소자를 분산해 열 집중 회피.' },
    pcbf_refs_title:{ zh: '開源硬體公版庫', en: 'Open-source reference boards', ja: 'オープンソース公板ライブラリ', ko: '오픈소스 레퍼런스 보드' },
    pcbf_refs_body: { zh: '——「載入到 Layout」把公版的板框、層數、主要料件（含實際尺寸與正反面）、代表性走線與 via 帶進編輯器當起手板，可直接改；「疊加比較」把公版料件以虛線疊在你目前的設計上對照。載入後用右側「圖層管理」逐層開關檢視、「板上料件」看清單並點選定位。', en: '—— "Load into Layout" brings the reference board outline, layer count, main parts (with real sizes and top/bottom side), representative traces and vias into the editor as a starting board you can edit directly; "Overlay compare" shows the reference parts as dashed ghosts over your current design. After loading, use "Layers" on the right to toggle each layer and "Board parts" to list and locate parts.', ja: '——「Layout に読み込み」は公板の基板外形、層数、主要部品（実寸法と表裏を含む）、代表的な配線とビアをエディタに取り込み、直接編集できる初期基板にします；「重ね比較」は公板部品を破線ゴーストとして現在の設計に重ねます。読み込み後は右側の「レイヤー管理」で層ごとに表示切替、「基板上の部品」で一覧と位置決めができます。', ko: '—— \'Layout에 불러오기\'는 공용 보드의 외형, 층수, 주요 부품(실제 치수와 앞뒤면 포함), 대표적인 배선과 비아를 에디터에 가져와 바로 편집할 수 있는 시작 보드로 만듭니다; \'겹쳐 비교\'는 공용 보드 부품을 점선 고스트로 현재 설계 위에 겹칩니다. 불러온 후 오른쪽 \'레이어 관리\'로 층별 표시 전환, \'보드 부품\'으로 목록 확인 및 위치 지정.' },
    pcbf_refs_warn: { zh: '⚠️ 為「教學重建版」佈局——依公板文件近似重建主要 BOM 與代表性走線，非原廠精確座標/完整 netlist；完整原理圖/PCB 源檔在各「原始碼」連結。授權多為 OSHW/CC-BY-SA。', en: '⚠️ These are "teaching-rebuild" layouts —— the main BOM and representative traces are approximately reconstructed from the reference-board docs, not the vendor exact coordinates / full netlist; the full schematic / PCB source is under each "Source" link. Licenses are mostly OSHW / CC-BY-SA.', ja: '⚠️ 「教育用再構築版」レイアウトです——公板ドキュメントから主要 BOM と代表的な配線を近似再構築したもので、メーカーの正確な座標/完全な netlist ではありません；完全な回路図/PCB ソースは各「ソース」リンクにあります。ライセンスは多くが OSHW/CC-BY-SA です。', ko: '⚠️ \'교육용 재구성판\' 레이아웃입니다 —— 공용 보드 문서로부터 주요 BOM과 대표적인 배선을 근사 재구성한 것이며, 제조사의 정확한 좌표/완전한 netlist가 아닙니다; 완전한 회로도/PCB 소스는 각 \'소스\' 링크에 있습니다. 라이선스는 대부분 OSHW/CC-BY-SA입니다.' },

    // --- PCB JS 執行期動態字串：pcb-rules.js（NetRules.audit＋AutoRoute reason）---
    rule_minw:      { zh: '規則線寬：{net} 有 {n} 段 < {minW}mm（最細 {minSeen}mm，規則「{pattern}」）', en: 'Width rule: {net} has {n} segment(s) < {minW}mm (thinnest {minSeen}mm, rule "{pattern}")', ja: '線幅ルール：{net} のセグメント {n} 本が {minW}mm 未満（最小 {minSeen}mm、ルール「{pattern}」）', ko: '선폭 규칙: {net}에 {minW}mm 미만 구간 {n}개(최소 {minSeen}mm, 규칙 "{pattern}")' },
    rule_maxlen:    { zh: '規則線長：{net} 總長 {len}mm > {maxLen}mm（規則「{pattern}」）', en: 'Length rule: {net} total {len}mm > {maxLen}mm (rule "{pattern}")', ja: '配線長ルール：{net} 総長 {len}mm > {maxLen}mm（ルール「{pattern}」）', ko: '배선 길이 규칙: {net} 총 길이 {len}mm > {maxLen}mm (규칙 "{pattern}")' },
    rule_pairlen:   { zh: '差分對長度差：{a}({la}mm) vs {b}({lb}mm) 差 {d}mm > {tol}mm', en: 'Diff-pair length mismatch: {a}({la}mm) vs {b}({lb}mm) differs by {d}mm > {tol}mm', ja: '差動ペア長差：{a}({la}mm) vs {b}({lb}mm) 差 {d}mm > {tol}mm', ko: '차동 쌍 길이 차: {a}({la}mm) vs {b}({lb}mm) 차이 {d}mm > {tol}mm' },
    rule_gap_close: { zh: '差分對間距過近：{a}/{b} 有 {len}mm 段間距 {worst}mm < 目標 {gap}±{tol}mm（過近會改變差動阻抗）', en: 'Diff-pair gap too small: {a}/{b} has {len}mm with gap {worst}mm < target {gap}±{tol}mm (too-close spacing shifts the differential impedance)', ja: '差動ペア間隔が狭すぎ：{a}/{b} の {len}mm 区間で間隔 {worst}mm < 目標 {gap}±{tol}mm（近すぎると差動インピーダンスが変化）', ko: '차동 쌍 간격이 너무 좁음: {a}/{b}의 {len}mm 구간 간격 {worst}mm < 목표 {gap}±{tol}mm(너무 가까우면 차동 임피던스가 변함)' },
    rule_gap_uncoupled: { zh: '差分對耦合不足：{a}/{b} 未耦合 {unc}mm／{total}mm（{pct}%）＞20%（目標 gap {gap}±{tol}mm，同層才計耦合）', en: 'Diff-pair under-coupled: {a}/{b} uncoupled {unc}mm / {total}mm ({pct}%) > 20% (target gap {gap}±{tol}mm; only same-layer counts as coupled)', ja: '差動ペア結合不足：{a}/{b} 非結合 {unc}mm／{total}mm（{pct}%）＞20%（目標 gap {gap}±{tol}mm、同層のみ結合と判定）', ko: '차동 쌍 결합 부족: {a}/{b} 비결합 {unc}mm/{total}mm({pct}%) > 20%(목표 gap {gap}±{tol}mm, 같은 층만 결합으로 판정)' },
    rule_grid_too_big: { zh: '網格過大（板太大或格太細）', en: 'Grid too large (board too big or grid too fine)', ja: 'グリッドが大きすぎます（基板が大きすぎるかグリッドが細かすぎ）', ko: '그리드 과대(보드가 너무 크거나 그리드가 너무 촘촘함)' },
    rule_ep_outside: { zh: '端點在板框外', en: 'Endpoint outside the board outline', ja: '端点が基板外形の外です', ko: '끝점이 보드 외곽선 밖에 있음' },
    rule_ep_blocked: { zh: '端點被異網障礙包住', en: 'Endpoint enclosed by other-net obstacles', ja: '端点が他ネットの障害物に囲まれています', ko: '끝점이 다른 네트 장애물에 둘러싸임' },
    rule_no_path:   { zh: '找不到路徑（單層擁擠或被隔斷）', en: 'No path found (single layer congested or blocked)', ja: '経路が見つかりません（単層が混雑または遮断）', ko: '경로를 찾을 수 없음(단층 혼잡 또는 차단)' },

    // --- PCB JS 執行期動態字串：pcb-drc.js（pad 級 DRC 訊息＋分類）---
    drc_nonet:      { zh: '無網路', en: 'no net', ja: 'ネットなし', ko: '네트 없음' },
    drc_padgap:     { zh: '焊盤間距：{a}({an}) ↔ {b}({bn}) {d}mm < {lim}mm {at}', en: 'Pad clearance: {a}({an}) ↔ {b}({bn}) {d}mm < {lim}mm {at}', ja: 'パッド間隔：{a}({an}) ↔ {b}({bn}) {d}mm < {lim}mm {at}', ko: '패드 간격: {a}({an}) ↔ {b}({bn}) {d}mm < {lim}mm {at}' },
    drc_sliver:     { zh: '阻焊橋過細：{a} ↔ {b} 開窗間 {d}mm < {lim}mm（標準綠油下限常見 0.2mm；細 pitch 量產可與板廠確認或改合併開窗）{at}', en: 'Solder-mask sliver too thin: {a} ↔ {b} between openings {d}mm < {lim}mm (standard mask limit is typically 0.2mm; for fine-pitch production confirm with the fab or merge the openings) {at}', ja: 'レジスト橋が細すぎ：{a} ↔ {b} 開口間 {d}mm < {lim}mm（標準レジスト下限は 0.2mm が一般的；ファインピッチ量産は基板メーカーに確認するか開口を統合）{at}', ko: '솔더마스크 슬리버가 너무 얇음: {a} ↔ {b} 개구 간 {d}mm < {lim}mm(표준 마스크 하한은 보통 0.2mm; 파인피치 양산은 보드 업체와 확인하거나 개구 병합) {at}' },
    drc_trace_pad:  { zh: '走線({tn}/{tl}) ↔ 焊盤 {p}({pn}) 淨距 {d}mm < {lim}mm {at}', en: 'Trace({tn}/{tl}) ↔ pad {p}({pn}) clearance {d}mm < {lim}mm {at}', ja: '配線({tn}/{tl}) ↔ パッド {p}({pn}) 間隔 {d}mm < {lim}mm {at}', ko: '배선({tn}/{tl}) ↔ 패드 {p}({pn}) 간격 {d}mm < {lim}mm {at}' },
    drc_tt_nonet:   { zh: '走線#{i} ↔ #{j} 淨距 {d}mm < {lim}mm（無網路資訊，若非同一網請調整）', en: 'Trace #{i} ↔ #{j} clearance {d}mm < {lim}mm (no net info; adjust if not the same net)', ja: '配線#{i} ↔ #{j} 間隔 {d}mm < {lim}mm（ネット情報なし。同一ネットでなければ調整してください）', ko: '배선 #{i} ↔ #{j} 간격 {d}mm < {lim}mm(네트 정보 없음, 같은 네트가 아니면 조정)' },
    drc_tt:         { zh: '走線間距：{a} ↔ {b}（{layer}）淨距 {d}mm < {lim}mm @({x},{y})', en: 'Trace clearance: {a} ↔ {b} ({layer}) {d}mm < {lim}mm @({x},{y})', ja: '配線間隔：{a} ↔ {b}（{layer}）{d}mm < {lim}mm @({x},{y})', ko: '배선 간격: {a} ↔ {b}({layer}) {d}mm < {lim}mm @({x},{y})' },
    drc_via_via:    { zh: 'via#{i}({an}) ↔ via#{j}({bn}) 淨距 {d}mm < {lim}mm @({x},{y})', en: 'Via #{i}({an}) ↔ via #{j}({bn}) clearance {d}mm < {lim}mm @({x},{y})', ja: 'ビア#{i}({an}) ↔ ビア#{j}({bn}) 間隔 {d}mm < {lim}mm @({x},{y})', ko: '비아#{i}({an}) ↔ 비아#{j}({bn}) 간격 {d}mm < {lim}mm @({x},{y})' },
    drc_via_trace:  { zh: 'via#{i}({an}) ↔ 走線({tn}/{tl}) 淨距 {d}mm < {lim}mm @({x},{y})', en: 'Via #{i}({an}) ↔ trace({tn}/{tl}) clearance {d}mm < {lim}mm @({x},{y})', ja: 'ビア#{i}({an}) ↔ 配線({tn}/{tl}) 間隔 {d}mm < {lim}mm @({x},{y})', ko: '비아#{i}({an}) ↔ 배선({tn}/{tl}) 간격 {d}mm < {lim}mm @({x},{y})' },
    drc_via_pad:    { zh: 'via#{i}({an}) ↔ 焊盤 {p}({pn}) 淨距 {d}mm < {lim}mm @({x},{y})', en: 'Via #{i}({an}) ↔ pad {p}({pn}) clearance {d}mm < {lim}mm @({x},{y})', ja: 'ビア#{i}({an}) ↔ パッド {p}({pn}) 間隔 {d}mm < {lim}mm @({x},{y})', ko: '비아#{i}({an}) ↔ 패드 {p}({pn}) 간격 {d}mm < {lim}mm @({x},{y})' },
    drc_ring_neg:   { zh: '焊盤 {p} 鑽孔大於焊盤（環寬 {ring}mm）{at}', en: 'Pad {p} drill larger than pad (annular ring {ring}mm) {at}', ja: 'パッド {p} のドリルがパッドより大きい（アニュラリング {ring}mm）{at}', ko: '패드 {p} 드릴이 패드보다 큼(애뉼러 링 {ring}mm) {at}' },
    drc_ring_small: { zh: '焊盤 {p} 環寬 {ring}mm < {lim}mm（斷環風險）{at}', en: 'Pad {p} annular ring {ring}mm < {lim}mm (ring breakout risk) {at}', ja: 'パッド {p} アニュラリング {ring}mm < {lim}mm（リング切れリスク）{at}', ko: '패드 {p} 애뉼러 링 {ring}mm < {lim}mm(링 파손 위험) {at}' },
    drc_via_ring:   { zh: 'via#{i} 環寬 {ring}mm < {lim}mm @({x},{y})', en: 'Via #{i} annular ring {ring}mm < {lim}mm @({x},{y})', ja: 'ビア#{i} アニュラリング {ring}mm < {lim}mm @({x},{y})', ko: '비아#{i} 애뉼러 링 {ring}mm < {lim}mm @({x},{y})' },
    drc_min_drill:  { zh: '{h} 鑽孔 {d}mm < {lim}mm', en: '{h} drill {d}mm < {lim}mm', ja: '{h} ドリル {d}mm < {lim}mm', ko: '{h} 드릴 {d}mm < {lim}mm' },
    drc_hole_hole:  { zh: '鑽孔過近：{a} ↔ {b} 孔壁距 {d}mm < {lim}mm（斷鑽風險）', en: 'Holes too close: {a} ↔ {b} wall-to-wall {d}mm < {lim}mm (drill breakout risk)', ja: 'ドリル孔が近すぎ：{a} ↔ {b} 孔壁間 {d}mm < {lim}mm（ドリル折れリスク）', ko: '드릴 홀이 너무 가까움: {a} ↔ {b} 홀 벽 간 {d}mm < {lim}mm(드릴 파손 위험)' },
    drc_courtyard:  { zh: 'courtyard 重疊：{a} ↔ {b} @({x},{y})', en: 'Courtyard overlap: {a} ↔ {b} @({x},{y})', ja: 'コートヤード重なり：{a} ↔ {b} @({x},{y})', ko: '코트야드 겹침: {a} ↔ {b} @({x},{y})' },
    drc_silk_pad:   { zh: '絲印線壓到焊盤銅面：{c} 絲印 ↔ {p}（重疊 {d}mm）{at}', en: 'Silkscreen line over pad copper: {c} silk ↔ {p} (overlap {d}mm) {at}', ja: 'シルク線がパッド銅面に掛かる：{c} シルク ↔ {p}（重なり {d}mm）{at}', ko: '실크 선이 패드 동박을 침범: {c} 실크 ↔ {p}(겹침 {d}mm) {at}' },
    drc_trace_edge: { zh: '走線#{i}({tn}) 距板框 {d}mm < {lim}mm {at}', en: 'Trace #{i}({tn}) to board outline {d}mm < {lim}mm {at}', ja: '配線#{i}({tn}) 基板外形まで {d}mm < {lim}mm {at}', ko: '배선 #{i}({tn}) 보드 외곽까지 {d}mm < {lim}mm {at}' },
    drc_trace_edge_end: { zh: '走線#{i}({tn}) 止於板框（城堡孔/邊緣鍍金屬刻意設計則可忽略）{at}', en: 'Trace #{i}({tn}) ends on the board outline (ignore if castellated holes / edge plating are intentional) {at}', ja: '配線#{i}({tn}) が基板外形で終端（キャステレーション/エッジめっきが意図的なら無視可）{at}', ko: '배선 #{i}({tn})이 보드 외곽에서 끝남(캐스텔레이션/에지 도금이 의도라면 무시 가능) {at}' },
    drc_trace_edge_cross: { zh: '走線#{i}({tn}) 跨越板框 {at}', en: 'Trace #{i}({tn}) crosses the board outline {at}', ja: '配線#{i}({tn}) が基板外形を横断 {at}', ko: '배선 #{i}({tn})이 보드 외곽을 가로지름 {at}' },
    drc_custom_approx: { zh: '{n} 個 custom 形狀焊盤以外框矩形近似檢查', en: '{n} custom-shaped pad(s) checked as bounding-box approximation', ja: 'custom 形状パッド {n} 個は外接矩形で近似チェック', ko: 'custom 형상 패드 {n}개는 외접 사각형으로 근사 검사' },
    drc_zone_skip:  { zh: '鋪銅避讓未檢查（沿用 KiCad 填充結果）', en: 'Copper-pour clearance not checked (KiCad fill result reused)', ja: 'カッパープアの逃げは未チェック（KiCad 塗りつぶし結果を流用）', ko: '카퍼 푸어 이격은 미검사(KiCad 채움 결과 사용)' },
    drc_capped:     { zh: '{cat}：僅列前 {cap} 筆，另有 {more} 筆（共 {total}）', en: '{cat}: showing first {cap} item(s), {more} more ({total} total)', ja: '{cat}：先頭 {cap} 件のみ表示、他 {more} 件（計 {total}）', ko: '{cat}: 처음 {cap}건만 표시, 추가 {more}건(총 {total})' },
    drc_cat_padgap:    { zh: '焊盤間距', en: 'Pad clearance', ja: 'パッド間隔', ko: '패드 간격' },
    drc_cat_sliver:    { zh: '阻焊橋', en: 'Mask sliver', ja: 'レジスト橋', ko: '마스크 슬리버' },
    drc_cat_trace_pad: { zh: '走線對焊盤', en: 'Trace-to-pad', ja: '配線-パッド', ko: '배선-패드' },
    drc_cat_tt_nonet:  { zh: '走線間距(無網路)', en: 'Trace clearance (no net)', ja: '配線間隔（ネットなし）', ko: '배선 간격(네트 없음)' },
    drc_cat_tt:        { zh: '走線間距', en: 'Trace clearance', ja: '配線間隔', ko: '배선 간격' },
    drc_cat_via_via:   { zh: 'via間距', en: 'Via clearance', ja: 'ビア間隔', ko: '비아 간격' },
    drc_cat_via_trace: { zh: 'via對走線', en: 'Via-to-trace', ja: 'ビア-配線', ko: '비아-배선' },
    drc_cat_via_pad:   { zh: 'via對焊盤', en: 'Via-to-pad', ja: 'ビア-パッド', ko: '비아-패드' },
    drc_cat_ring:      { zh: '環寬', en: 'Annular ring', ja: 'アニュラリング', ko: '애뉼러 링' },
    drc_cat_via_ring:  { zh: 'via環寬', en: 'Via annular ring', ja: 'ビアのアニュラリング', ko: '비아 애뉼러 링' },
    drc_cat_min_drill: { zh: '最小孔徑', en: 'Min drill', ja: '最小ドリル径', ko: '최소 드릴 직경' },
    drc_cat_hole_hole: { zh: '孔對孔', en: 'Hole-to-hole', ja: 'ドリル孔間隔', ko: '홀 간 간격' },
    drc_cat_courtyard: { zh: 'courtyard', en: 'Courtyard', ja: 'コートヤード', ko: '코트야드' },
    drc_cat_silk_pad:  { zh: '絲印壓pad', en: 'Silk over pad', ja: 'シルク-パッド重なり', ko: '실크-패드 겹침' },
    drc_cat_trace_edge: { zh: '走線對板框', en: 'Trace-to-edge', ja: '配線-基板外形', ko: '배선-외곽' },
    drc_cat_edge_end:  { zh: '走線止於板框', en: 'Trace ends on edge', ja: '配線が外形で終端', ko: '배선이 외곽에서 종단' },
    drc_cat_edge_cross: { zh: '走線跨越板框', en: 'Trace crosses edge', ja: '配線が外形を横断', ko: '배선 외곽 횡단' }
  };

  let lang = localStorage.getItem(LS) || 'zh';
  if (!LANGS.some(l => l[0] === lang)) lang = 'zh';

  function t(key, vars) {
    const e = D[key];
    let s = e ? (e[lang] || e.zh) : key;
    if (vars) s = s.replace(/\{(\w+)\}/g, (m, name) => (name in vars ? String(vars[name]) : m));
    return s;
  }

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
