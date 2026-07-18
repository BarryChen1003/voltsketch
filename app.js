// HardwareAI Circuit Lab Application
const app = {
  // i18n translations
  i18n: {
    zh: {
      appTitle: 'HardwareAI 硬體實驗室',
      appSubtitle: '繪製、分析並保存你的直流線路圖',
      drawTools: '繪圖工具',
      select: '選取',
      wire: '導線',
      parts: '元件庫',
      resistor: '電阻',
      source: '直流電源',
      ground: '接地',
      switch: '開關',
      lamp: '燈泡/負載',
      led: 'LED',
      diode: '二極體',
      capacitor: '電容',
      inductor: '電感',
      tvs: 'TVS/ESD 二極體',
      bead: '磁珠',
      cmchoke: '共模扼流圈',
      varistor: '壓敏電阻',
      gdt: '氣體放電管',
      fuse: '保險絲',
      xtal: '晶體振盪器',
      shield: '屏蔽罩',
      ammeter: '電流表',
      voltmeter: '電壓表',
      nmos: 'N-MOS',
      pmos: 'P-MOS',
      dualnmos: '雙 N-MOS',
      dualpmos: '雙 P-MOS',
      npn: 'NPN BJT',
      pnp: 'PNP BJT',
      opamp: 'OP 放大器',
      comparator: '比較器',
      dcdc: 'DC-DC',
      circuitLibrary: '電路範本庫',
      templateSearch: '搜尋範本...',
      quickKeys: '快捷操作',
      quickKeysBody: 'R 旋轉、H 水平翻轉、V 垂直翻轉、Delete 刪除、拖曳移動；框選多選(Ctrl+A)、中鍵平移、滾輪縮放；導線兩次點擊(吸附接腳)可點選後刪除。自動存檔(重載不丟)。注意 Ctrl+R 是瀏覽器重載非旋轉。',
      statusSelect: '選取或拖曳元件',
      statusWire: '點擊兩次以繪製導線',
      statusPlace: '點擊放置元件',
      labelsOn: '標籤開',
      labelsOff: '標籤關',
      readingsOn: '讀值開',
      readingsOff: '讀值關',
      fit: '重置視圖',
      simulation: '直流模擬',
      idle: '待機',
      running: '模擬中',
      run: '執行模擬',
      clear: '清除讀值',
      simHint: '加入電源、電阻與接地後即可分析節點電壓與支路電流。',
      circuitReview: '線路檢查',
      schematicFiles: '線路圖/工程檔',
      datasheetFiles: 'IC Datasheet',
      connectionNotes: '接線/net label 備註',
      connectionNotesPlaceholder: '輸入接線備註...',
      runReview: '執行檢查',
      clearReview: '清除檢查',
      inspector: '屬性',
      nothingSelected: '尚未選取元件',
      name: '名稱',
      closed: '閉合',
      rotate: '旋轉',
      delete: '刪除',
      readings: '元件讀值',
      component: '元件',
      noReadings: '尚無讀值',
      icDetail: 'IC 詳細資訊',
      addNewIc: '新增 IC',
      icName: 'IC 名稱',
      icManufacturer: '製造商',
      icCategory: '類別',
      icPackage: '封裝',
      icDescription: '描述',
      icDatasheetUrl: 'Datasheet 連結',
      icPins: 'Pin 定義',
      saveIc: '儲存 IC',
      cancel: '取消',
      demoShort: '範例',
      saveShort: '儲存',
      importShort: '匯入'
    },
    en: {
      appTitle: 'HardwareAI Hardware Lab',
      appSubtitle: 'Draw, analyze and save your DC circuits',
      drawTools: 'Drawing Tools',
      select: 'Select',
      wire: 'Wire',
      parts: 'Components',
      resistor: 'Resistor',
      source: 'DC Source',
      ground: 'Ground',
      switch: 'Switch',
      lamp: 'Lamp/Load',
      led: 'LED',
      diode: 'Diode',
      capacitor: 'Capacitor',
      inductor: 'Inductor',
      tvs: 'TVS/ESD Diode',
      bead: 'Ferrite Bead',
      cmchoke: 'Common-Mode Choke',
      varistor: 'Varistor (MOV)',
      gdt: 'Gas Discharge Tube',
      fuse: 'Fuse',
      xtal: 'Crystal',
      shield: 'Shield Can',
      ammeter: 'Ammeter',
      voltmeter: 'Voltmeter',
      nmos: 'N-MOS',
      pmos: 'P-MOS',
      dualnmos: 'Dual N-MOS',
      dualpmos: 'Dual P-MOS',
      npn: 'NPN BJT',
      pnp: 'PNP BJT',
      opamp: 'Op-Amp',
      comparator: 'Comparator',
      dcdc: 'DC-DC',
      circuitLibrary: 'Circuit Templates',
      templateSearch: 'Search templates...',
      quickKeys: 'Quick Keys',
      quickKeysBody: 'R rotate, Delete remove, drag to move; marquee multi-select (Ctrl+A all), middle-drag pan, wheel zoom; wire = two clicks (auto-snap to pins), click a wire to select & delete.',
      statusSelect: 'Select or drag components',
      statusWire: 'Click twice to draw wire',
      statusPlace: 'Click to place component',
      labelsOn: 'Labels On',
      labelsOff: 'Labels Off',
      readingsOn: 'Readings On',
      readingsOff: 'Readings Off',
      fit: 'Fit View',
      simulation: 'DC Simulation',
      idle: 'Idle',
      running: 'Running',
      run: 'Run Simulation',
      clear: 'Clear Readings',
      simHint: 'Add sources, resistors and ground to analyze node voltages and branch currents.',
      circuitReview: 'Circuit Review',
      schematicFiles: 'Schematic Files',
      datasheetFiles: 'IC Datasheet',
      connectionNotes: 'Wiring/net label notes',
      connectionNotesPlaceholder: 'Enter wiring notes...',
      runReview: 'Run Review',
      clearReview: 'Clear Review',
      inspector: 'Properties',
      nothingSelected: 'No component selected',
      name: 'Name',
      closed: 'Closed',
      rotate: 'Rotate',
      delete: 'Delete',
      readings: 'Component Readings',
      component: 'Component',
      noReadings: 'No readings',
      icDetail: 'IC Details',
      addNewIc: 'Add IC',
      icName: 'IC Name',
      icManufacturer: 'Manufacturer',
      icCategory: 'Category',
      icPackage: 'Package',
      icDescription: 'Description',
      icDatasheetUrl: 'Datasheet URL',
      icPins: 'Pin Definition',
      saveIc: 'Save IC',
      cancel: 'Cancel',
      demoShort: 'Demo',
      saveShort: 'Save',
      importShort: 'Import'
    },
    ja: {
      appTitle: 'HardwareAI ハードウェアラボ',
      appSubtitle: '直流回路図の作成・解析・保存',
      drawTools: '描画ツール',
      select: '選択',
      wire: '配線',
      parts: '部品ライブラリ',
      resistor: '抵抗',
      source: '直流電源',
      ground: 'グランド',
      switch: 'スイッチ',
      lamp: 'ランプ/負荷',
      led: 'LED',
      diode: 'ダイオード',
      capacitor: 'コンデンサ',
      inductor: 'インダクタ',
      tvs: 'TVS/ESDダイオード',
      bead: 'フェライトビーズ',
      cmchoke: 'コモンモードチョーク',
      varistor: 'バリスタ',
      gdt: 'ガス放電管',
      fuse: 'ヒューズ',
      xtal: '水晶振動子',
      shield: 'シールドケース',
      ammeter: '電流計',
      voltmeter: '電圧計',
      nmos: 'N-MOS',
      pmos: 'P-MOS',
      dualnmos: 'デュアル N-MOS',
      dualpmos: 'デュアル P-MOS',
      npn: 'NPN BJT',
      pnp: 'PNP BJT',
      opamp: 'オペアンプ',
      comparator: 'コンパレータ',
      dcdc: 'DC-DC',
      circuitLibrary: '回路テンプレート',
      templateSearch: 'テンプレート検索...',
      quickKeys: 'ショートカット',
      quickKeysBody: 'R 回転、H 左右反転、V 上下反転、Delete 削除、ドラッグ移動。範囲選択(Ctrl+A)、中ボタンでパン、ホイールでズーム。自動保存。',
      statusSelect: '部品を選択/ドラッグ',
      statusWire: '2回クリックで配線',
      statusPlace: 'クリックで配置',
      labelsOn: 'ラベル表示',
      labelsOff: 'ラベル非表示',
      readingsOn: '測定値表示',
      readingsOff: '測定値非表示',
      fit: 'ビューをリセット',
      simulation: 'DC シミュレーション',
      idle: '待機',
      running: '実行中',
      run: 'シミュレーション実行',
      clear: '測定値クリア',
      simHint: '電源・抵抗・グランドを配置するとノード電圧と分岐電流を解析できます。',
      circuitReview: '回路チェック',
      schematicFiles: '回路図/プロジェクト',
      datasheetFiles: 'IC データシート',
      connectionNotes: '配線/ネットラベル メモ',
      connectionNotesPlaceholder: 'メモを入力...',
      runReview: 'チェック実行',
      clearReview: 'チェッククリア',
      inspector: 'プロパティ',
      nothingSelected: '未選択',
      name: '名前',
      closed: 'クローズ',
      rotate: '回転',
      delete: '削除',
      readings: '部品測定値',
      component: '部品',
      noReadings: '測定値なし',
      icDetail: 'IC 詳細',
      addNewIc: 'IC 追加',
      icName: 'IC 名',
      icManufacturer: 'メーカー',
      icCategory: 'カテゴリ',
      icPackage: 'パッケージ',
      icDescription: '説明',
      icDatasheetUrl: 'データシートURL',
      icPins: 'ピン定義',
      saveIc: 'IC 保存',
      cancel: 'キャンセル',
      demoShort: 'サンプル',
      saveShort: '保存',
      importShort: 'インポート'
    },
    ko: {
      appTitle: 'HardwareAI 하드웨어 랩',
      appSubtitle: 'DC 회로도 작성·해석·저장',
      drawTools: '그리기 도구',
      select: '선택',
      wire: '배선',
      parts: '부품 라이브러리',
      resistor: '저항',
      source: 'DC 전원',
      ground: '접지',
      switch: '스위치',
      lamp: '램프/부하',
      led: 'LED',
      diode: '다이오드',
      capacitor: '커패시터',
      inductor: '인덕터',
      tvs: 'TVS/ESD 다이오드',
      bead: '페라이트 비드',
      cmchoke: '공통 모드 초크',
      varistor: '바리스터',
      gdt: '가스 방전관',
      fuse: '퓨즈',
      xtal: '수정 진동자',
      shield: '실드 캔',
      ammeter: '전류계',
      voltmeter: '전압계',
      nmos: 'N-MOS',
      pmos: 'P-MOS',
      dualnmos: '듀얼 N-MOS',
      dualpmos: '듀얼 P-MOS',
      npn: 'NPN BJT',
      pnp: 'PNP BJT',
      opamp: 'OP 앰프',
      comparator: '비교기',
      dcdc: 'DC-DC',
      circuitLibrary: '회로 템플릿',
      templateSearch: '템플릿 검색...',
      quickKeys: '단축키',
      quickKeysBody: 'R 회전, H 좌우 반전, V 상하 반전, Delete 삭제, 드래그 이동. 범위 선택(Ctrl+A), 휠 줌. 자동 저장.',
      statusSelect: '부품 선택/드래그',
      statusWire: '두 번 클릭으로 배선',
      statusPlace: '클릭하여 배치',
      labelsOn: '라벨 켬',
      labelsOff: '라벨 끔',
      readingsOn: '측정값 켬',
      readingsOff: '측정값 끔',
      fit: '뷰 재설정',
      simulation: 'DC 시뮬레이션',
      idle: '대기',
      running: '실행 중',
      run: '시뮬레이션 실행',
      clear: '측정값 지우기',
      simHint: '전원·저항·접지를 배치하면 노드 전압과 분기 전류를 해석할 수 있습니다.',
      circuitReview: '회로 검사',
      schematicFiles: '회로도/프로젝트 파일',
      datasheetFiles: 'IC 데이터시트',
      connectionNotes: '배선/넷 라벨 메모',
      connectionNotesPlaceholder: '메모 입력...',
      runReview: '검사 실행',
      clearReview: '검사 지우기',
      inspector: '속성',
      nothingSelected: '선택 없음',
      name: '이름',
      closed: '닫힘',
      rotate: '회전',
      delete: '삭제',
      readings: '부품 측정값',
      component: '부품',
      noReadings: '측정값 없음',
      icDetail: 'IC 상세 정보',
      addNewIc: 'IC 추가',
      icName: 'IC 이름',
      icManufacturer: '제조사',
      icCategory: '카테고리',
      icPackage: '패키지',
      icDescription: '설명',
      icDatasheetUrl: '데이터시트 링크',
      icPins: '핀 정의',
      saveIc: 'IC 저장',
      cancel: '취소',
      demoShort: '예제',
      saveShort: '저장',
      importShort: '가져오기'
    }
  },

  // State
  state: {
    lang: 'zh',
    tool: 'select',
    components: [],
    wires: [],
    selectedId: null,
    undoStack: [],
    redoStack: [],
    wireStart: null,
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
    showLabels: true,
    showReadings: true,
    componentIdCounter: 0,
    selectedIds: [],          // 多選
    marquee: null,            // {x0,y0,x1,y1} 橡皮框
    groupDrag: null,          // {start:{x,y}, items:[{id,ox,oy}], wires:[{i,end,ox,oy}]}
    snapHint: null,           // {x,y} 導線吸附提示
    mouseMoved: false,
    nets: null,               // computeNets 結果快取
    selectedWireIndices: [],  // 選取的導線索引（可多選，框選含線）
    pan: null,                // 中鍵平移狀態
    labelDrag: null,          // 拖曳標籤狀態
    wireDrag: null            // 拖曳導線(端點或整條)
  },

  // DOM elements cache
  els: {},

  init() {
    this.state.lang = localStorage.getItem('voltsketch-lang') || 'zh';
    this.cacheElements();
    this.applyI18n();
    this.bindEvents();
    this.loadFromStorage();
    this.render();
    // ?addIC= 自動放置：延後執行，讓 sheets.js（多頁）先 load 目前頁再放，
    // 否則 sheets.js boot() 會用存檔頁覆寫 state.components 把剛放的 IC 洗掉。
    // sheets.js boot() 會在 load() 後主動呼叫 handleAddICParam（決定性）；
    // 這個 setTimeout 只是「沒載入 sheets.js」時的後備。handleAddICParam 具冪等性
    // （放置後刪除網址參數），重複呼叫安全。
    setTimeout(() => this.handleAddICParam(), 500);
    this.initAuth();
  },

  // 帳號/雲端同步（需設定 Supabase；未設定則維持本機 demo）
  async initAuth() {
    if (typeof Auth === 'undefined' || !Auth.enabled()) return; // demo：保留「登入」連結(到 login.html 看說明)
    const update = async (user) => {
      const has = !!user;
      const el = id => document.getElementById(id);
      if (el('loginLink')) el('loginLink').hidden = has;
      if (el('logoutBtn')) el('logoutBtn').hidden = !has;
      if (el('cloudSync')) el('cloudSync').hidden = !has;
      if (el('authEmail')) el('authEmail').textContent = has ? (user.email || '') : '';
      if (has) {
        try {
          const cloud = await Auth.loadProject();
          if (cloud && cloud.components) {
            this.state.components = cloud.components;
            this.state.wires = cloud.wires || [];
            this.state.componentIdCounter = cloud.componentIdCounter || 0;
            this.render();
            this.showToast('已載入雲端專案');
          }
        } catch (e) { }
      }
    };
    update(await Auth.user());
    Auth.onChange(update);
    document.getElementById('logoutBtn')?.addEventListener('click', async () => { await Auth.signOut(); location.reload(); });
    document.getElementById('cloudSync')?.addEventListener('click', async () => {
      try {
        await Auth.saveProject({ components: this.state.components, wires: this.state.wires, componentIdCounter: this.state.componentIdCounter });
        this.showToast('已同步到雲端');
      } catch (e) { this.showToast('同步失敗：' + (e.message || e)); }
    });
  },

  getLibraryIcs() {
    let custom = [];
    try { custom = JSON.parse(localStorage.getItem('icLibrary') || '[]'); } catch (e) { custom = []; }
    // 內建 ic-data.js（前端 JSON）→ 轉成編輯器可放置格式
    const data = (window.IC_DATA || []).map(ic => ({
      id: 'data:' + ic.part, name: ic.part, manufacturer: ic.mfr || '', category: ic.category || '',
      pins: this.icDataToPins(ic)
    }));
    return [...data, ...custom];
  },

  // ic-data.js pin → 編輯器 pin（num→number、去 {} active-low 標記、EP→補腳、type 簡化）
  icDataToPins(ic) {
    const tShort = t => /Ground|EP/.test(t) ? 'ground' : /Power|Supply/.test(t) ? 'power'
      : /Out/.test(t) ? 'output' : /I\/O|IO/.test(t) ? 'io' : /In/.test(t) ? 'input' : 'io';
    const pins = (ic.pins || []).map(p => ({
      number: p.num,
      name: String(p.name || '').replace(/[{}]/g, '') + (p.ep ? ' (EP)' : ''),
      type: tShort(p.type || ''), side: p.side || ''
    }));
    // EP（外露焊墊）若有電氣功能，已列為 pins 中的一支（如 pin 17），此處不另補。
    return pins;
  },

  handleAddICParam() {
    const id = new URLSearchParams(location.search).get('addIC');
    if (!id) return;
    const ic = this.getLibraryIcs().find(i => i.id === id);
    if (ic) this.placeLibraryIc(ic);
    else this.showToast('找不到該 IC（' + id + '）');
    // 清掉網址參數，避免重整又放一次
    const u = new URL(location.href); u.searchParams.delete('addIC'); history.replaceState(null, '', u);
  },

  renderIcCatalog() {
    const c = this.els.templateCatalog;
    if (!c) return;
    const list = this.getLibraryIcs();
    if (!list.length) { c.innerHTML = '<p style="font-size:12px;color:#64748b;padding:8px;">IC 元件庫尚無資料（到「IC 元件庫」分頁新增）</p>'; return; }
    c.innerHTML = list.map(ic =>
      `<div class="component-button" data-ic-id="${ic.id}"><span class="schematic-mini chip-mini">IC</span><span>${ic.name}</span></div>`
    ).join('');
  },

  cacheElements() {
    this.els = {
      svg: document.getElementById('schematic'),
      wireLayer: document.getElementById('wireLayer'),
      componentLayer: document.getElementById('componentLayer'),
      terminalLayer: document.getElementById('terminalLayer'),
      selectionLayer: document.getElementById('selectionLayer'),
      overlayLayer: document.getElementById('overlayLayer'),
      modeStatus: document.getElementById('modeStatus'),
      toggleLabels: document.getElementById('toggleLabels'),
      toggleReadings: document.getElementById('toggleReadings'),
      fieldLabel: document.getElementById('fieldLabel'),
      fieldValue: document.getElementById('fieldValue'),
      fieldClosed: document.getElementById('fieldClosed'),
      switchField: document.getElementById('switchField'),
      inspectorForm: document.getElementById('inspectorForm'),
      inspectorEmpty: document.getElementById('inspectorEmpty'),
      simBadge: document.getElementById('simBadge'),
      summaryGrid: document.getElementById('summaryGrid'),
      simMessage: document.getElementById('simMessage'),
      resultsBody: document.getElementById('resultsBody'),
      reviewBadge: document.getElementById('reviewBadge'),
      reviewReport: document.getElementById('reviewReport'),
      reviewNotes: document.getElementById('reviewNotes'),
      reviewFiles: document.getElementById('reviewFiles'),
      templateCatalog: document.getElementById('templateCatalog')
    };
  },

  // i18n
  applyI18n() {
    const t = this.i18n[this.state.lang] || this.i18n.zh;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (t[key]) el.textContent = t[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      if (t[key]) el.placeholder = t[key];
    });
    document.querySelectorAll('.lang-option').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === this.state.lang);
    });
  },

  updateStatus(text) {
    const t = this.i18n[this.state.lang] || this.i18n.zh;
    this.els.modeStatus.textContent = text || t.statusSelect;
  },

  // Event binding
  bindEvents() {
    // Tool buttons
    document.querySelectorAll('.tool-button').forEach(btn => {
      btn.addEventListener('click', () => {
        this.state.tool = btn.dataset.tool;
        document.querySelectorAll('.tool-button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.updateStatus();
      });
    });

    // Component buttons
    document.querySelectorAll('.component-button').forEach(btn => {
      btn.addEventListener('click', () => {
        this.state.tool = btn.dataset.tool;
        document.querySelectorAll('.tool-button').forEach(b => b.classList.remove('active'));
        this.updateStatus();
      });
    });

    // Canvas events
    this.els.svg.addEventListener('click', (e) => this.onCanvasClick(e));
    this.els.svg.addEventListener('mousedown', (e) => this.onCanvasMouseDown(e));
    this.els.svg.addEventListener('mousemove', (e) => this.onCanvasMouseMove(e));
    this.els.svg.addEventListener('mouseup', (e) => this.onCanvasMouseUp(e));
    this.els.svg.addEventListener('mouseleave', (e) => this.onCanvasMouseUp(e));
    this.els.svg.addEventListener('dblclick', (e) => this.onCanvasDblClick(e));
    this.els.svg.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });
    this.els.svg.addEventListener('contextmenu', (e) => e.preventDefault()); // 右鍵不彈選單

    // Inspector
    this.els.fieldLabel.addEventListener('input', (e) => {
      const comp = this.state.components.find(c => c.id === this.state.selectedId);
      if (comp) { comp.label = e.target.value; this.render(); }
    });
    this.els.fieldValue.addEventListener('input', (e) => {
      const comp = this.state.components.find(c => c.id === this.state.selectedId);
      if (comp) comp.value = parseFloat(e.target.value) || 0;
    });
    this.els.fieldClosed.addEventListener('change', (e) => {
      const comp = this.state.components.find(c => c.id === this.state.selectedId);
      if (comp) comp.closed = e.target.checked;
    });
    // 動態屬性欄位：委派輸入 → 存到 comp.params
    const pf = document.getElementById('paramFields');
    if (pf) pf.addEventListener('input', (e) => {
      const comp = this.state.components.find(c => c.id === this.state.selectedId);
      if (!comp) return;
      // 顏色 / 大小 / 文字
      const prop = e.target.dataset.prop;
      if (prop) {
        if (prop === 'size') comp.scale = Math.max(0.3, Math.min(4, parseFloat(e.target.value) || 1));
        else comp[prop] = e.target.value;   // color / text
        this.render(); this.schedulePersist(); return;
      }
      const key = e.target.dataset.pkey; if (!key) return;
      comp.params = comp.params || {};
      comp.params[key] = e.target.value;
      this.schedulePersist();
    });

    // 左上樣式列：選元件/線後即時改顏色、大小（邊畫邊改）
    document.getElementById('activeColor')?.addEventListener('input', (e) => this.applyStyleToSelection('color', e.target.value));
    document.getElementById('activeSize')?.addEventListener('input', (e) => this.applyStyleToSelection('size', e.target.value));

    // 元件預設規格庫
    document.getElementById('savePreset')?.addEventListener('click', () => this.savePresetFromComp());
    document.getElementById('delPreset')?.addEventListener('click', () => this.deletePreset());
    document.getElementById('presetPick')?.addEventListener('change', (e) => this.applyPreset(e.target.value));

    document.getElementById('rotateSelected').addEventListener('click', () => this.rotateSelected());
    document.getElementById('flipHSelected').addEventListener('click', () => this.flipSelected('h'));
    document.getElementById('flipVSelected').addEventListener('click', () => this.flipSelected('v'));
    document.getElementById('deleteSelected').addEventListener('click', () => this.deleteSelected());

    // Simulation
    document.getElementById('runSim').addEventListener('click', () => this.runSimulation());
    document.getElementById('stopSim').addEventListener('click', () => this.clearSimulation());
    document.getElementById('fitView').addEventListener('click', () => this.fitView());
    document.getElementById('zoomOut').addEventListener('click', () => this.zoomBy(1.25));
    document.getElementById('zoomIn').addEventListener('click', () => this.zoomBy(0.8));
    document.getElementById('fitAll').addEventListener('click', () => this.fitAll());

    // 自訂 IC 建立
    document.getElementById('openIcBuilder').addEventListener('click', () => this.openIcBuilder());
    document.getElementById('closeIcBuilder').addEventListener('click', () => this.closeIcBuilder());
    document.getElementById('icbCancel').addEventListener('click', () => this.closeIcBuilder());
    document.getElementById('icbCreate').addEventListener('click', () => this.createIcFromForm());
    document.getElementById('icbPdf').addEventListener('change', (e) => this.prefillIcFromPdf(e));

    // Falstad 模擬
    document.getElementById('simFalstad').addEventListener('click', () => this.openSimulation());
    document.getElementById('simFft').addEventListener('click', () => this.openSimulation({ fft: true }));
    document.getElementById('closeSimModal').addEventListener('click', () => {
      document.getElementById('simModal').hidden = true;
      document.getElementById('simFrame').src = 'about:blank';
    });
    document.getElementById('simCopyNetlist').addEventListener('click', () => {
      const txt = this._lastNetlist || '';
      navigator.clipboard.writeText(txt).then(() => this.showToast('netlist 已複製'),
        () => this.showToast('複製失敗'));
    });

    // Labels/Readings toggles
    this.els.toggleLabels.addEventListener('click', () => {
      this.state.showLabels = !this.state.showLabels;
      this.els.toggleLabels.classList.toggle('active', this.state.showLabels);
      this.render();
    });
    this.els.toggleReadings.addEventListener('click', () => {
      this.state.showReadings = !this.state.showReadings;
      this.els.toggleReadings.classList.toggle('active', this.state.showReadings);
      this.render();
    });

    // Review
    document.getElementById('runReview').addEventListener('click', () => this.runReview());
    document.getElementById('clearReview').addEventListener('click', () => this.clearReview());
    document.getElementById('parsePdfBtn').addEventListener('click', () => this.parsePDF());

    // IC Modal
    document.getElementById('closeIcModal').addEventListener('click', () => ICManager.closeModal());
    document.getElementById('cancelIcEdit').addEventListener('click', () => ICManager.closeModal());
    document.getElementById('addPinBtn').addEventListener('click', () => ICManager.addPinRow());
    document.getElementById('icForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const data = ICManager.collectFormData();
      ICManager.save(data);
      ICManager.closeModal();
      this.renderIcCatalog();
      this.showToast('IC 已儲存（點庫中卡片即可放上畫布）');
    });
    document.getElementById('closeIcDetail').addEventListener('click', () => {
      document.getElementById('icDetailSection').hidden = true;
    });

    // Topbar
    document.getElementById('newProject').addEventListener('click', () => this.newProject());
    document.getElementById('loadDemo').addEventListener('click', () => this.loadDemo());
    document.getElementById('undoBtn').addEventListener('click', () => this.undo());
    document.getElementById('redoBtn').addEventListener('click', () => this.redo());
    document.getElementById('saveLocal').addEventListener('click', () => this.saveToStorage());
    document.getElementById('exportJson').addEventListener('click', () => this.exportJSON());
    document.getElementById('importJson').addEventListener('change', (e) => this.importJSON(e));
    document.getElementById('exportPng').addEventListener('click', () => this.exportPNG());
    document.getElementById('exportBom').addEventListener('click', () => this.openBom());
    document.getElementById('exportPdf').addEventListener('click', () => this.exportSchematicPdf());
    document.getElementById('closeBom').addEventListener('click', () => { document.getElementById('bomModal').hidden = true; });
    document.getElementById('bomCsv').addEventListener('click', () => this.exportBomCsv());
    document.getElementById('bomPdf').addEventListener('click', () => this.printBom());

    // Language switcher
    document.querySelectorAll('.lang-option').forEach(btn => {
      btn.addEventListener('click', () => {
        this.state.lang = btn.dataset.lang;
        localStorage.setItem('voltsketch-lang', this.state.lang);
        this.applyI18n();
        this.render();
      });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.onKeyDown(e));

    // Render IC catalog（讀共用的 icLibrary）+ 點卡片放上畫布
    this.renderIcCatalog();
    this.els.templateCatalog.addEventListener('click', (e) => {
      const card = e.target.closest('[data-ic-id]');
      if (!card) return;
      const ic = this.getLibraryIcs().find(i => i.id === card.dataset.icId);
      if (ic) this.placeLibraryIc(ic);
    });

    // 元件搜尋（內建元件清單）
    const partSearch = document.getElementById('partSearch');
    if (partSearch) partSearch.addEventListener('input', (e) => this.filterParts(e.target.value));
    // IC 庫搜尋
    const tmplSearch = document.getElementById('templateSearch');
    if (tmplSearch) tmplSearch.addEventListener('input', (e) => this.filterIcCatalog(e.target.value));

    // DRC 接線檢查 + 報告行點擊定位
    const drcBtn = document.getElementById('runDrc');
    if (drcBtn) drcBtn.addEventListener('click', () => this.runDrc());
    const drcRep = document.getElementById('drcReport');
    if (drcRep) drcRep.addEventListener('click', (e) => {
      const row = e.target.closest('[data-didx]'); if (!row) return;
      const it = (this._drcIssues || [])[+row.dataset.didx];
      if (it) this.focusDrcIssue(it);
    });
  },

  // 把 IC 庫的元件放到畫布（ICManager pins:{number,name,type} → icPins）
  placeLibraryIc(ic) {
    const pins = (ic.pins || []).filter(p => (p.type || '') !== 'nc' || true).map(p => ({
      num: p.number, name: p.name, type: p.type || '', side: p.side || ''
    }));
    if (!pins.length) { this.showToast('此 IC 無 pin 定義'); return; }
    this.saveUndo();
    const vb = this.getViewBox();
    const id = 'c' + (++this.state.componentIdCounter);
    this.state.components.push({
      id, type: 'ic', name: ic.name || 'IC',
      x: this.snapG(vb.x + vb.w / 2), y: this.snapG(vb.y + vb.h / 2),
      rotation: 0, label: 'U' + this.state.componentIdCounter, icPins: pins,
      color: this.state.activeColor, scale: this.state.activeSize
    });
    this.setSelection([id]);
    this.render();
    this.showToast(`已放置 ${ic.name}`);
  },

  filterParts(q) {
    q = (q || '').trim().toLowerCase();
    document.querySelectorAll('.component-list .component-button').forEach(btn => {
      const txt = btn.textContent.toLowerCase();
      const tool = (btn.dataset.tool || '').toLowerCase();
      btn.style.display = (!q || txt.includes(q) || tool.includes(q)) ? '' : 'none';
    });
  },

  filterIcCatalog(q) {
    q = (q || '').trim().toLowerCase();
    const all = this.getLibraryIcs();
    const list = q ? all.filter(ic => (ic.name || '').toLowerCase().includes(q) ||
      (ic.manufacturer || '').toLowerCase().includes(q) || (ic.category || '').toLowerCase().includes(q)) : all;
    const c = this.els.templateCatalog;
    if (!list.length) { c.innerHTML = '<p style="font-size:12px;color:#64748b;padding:8px;">無符合的 IC</p>'; return; }
    c.innerHTML = list.map(ic =>
      `<div class="component-button" data-ic-id="${ic.id}"><span class="schematic-mini chip-mini">IC</span><span>${ic.name}</span></div>`
    ).join('');
  },

  // Canvas helpers
  // 用 SVG getScreenCTM 精確換算螢幕→使用者座標（自動處理 preserveAspectRatio 留白與縮放，
  // 修正寬高比不符時的點擊偏移）。
  getSVGPoint(e) {
    const svg = this.els.svg;
    const ctm = svg.getScreenCTM();
    if (ctm) {
      const pt = svg.createSVGPoint();
      pt.x = e.clientX; pt.y = e.clientY;
      const p = pt.matrixTransform(ctm.inverse());
      return { x: p.x, y: p.y };
    }
    // 後備：線性比例
    const rect = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    return {
      x: (e.clientX - rect.left) / rect.width * vb.width,
      y: (e.clientY - rect.top) / rect.height * vb.height
    };
  },

  hitTest(x, y) {
    for (let i = this.state.components.length - 1; i >= 0; i--) {
      const c = this.state.components[i];
      if (Math.abs(c.x - x) < 25 && Math.abs(c.y - y) < 25) return c;
    }
    return null;
  },

  // 點到導線（距線段 ≤ tol）回傳索引，否則 -1
  hitTestWire(x, y, tol) {
    tol = tol || 6;
    const ws = this.state.wires;
    for (let i = ws.length - 1; i >= 0; i--) {
      const w = ws[i];
      const dx = w.x2 - w.x1, dy = w.y2 - w.y1, L2 = dx * dx + dy * dy;
      let t = L2 ? ((x - w.x1) * dx + (y - w.y1) * dy) / L2 : 0;
      t = Math.max(0, Math.min(1, t));
      const d = Math.hypot(x - (w.x1 + t * dx), y - (w.y1 + t * dy));
      if (d <= tol) return i;
    }
    return -1;
  },

  // ---- 視圖縮放/平移 ----
  getViewBox() { const v = this.els.svg.viewBox.baseVal; return { x: v.x, y: v.y, w: v.width, h: v.height }; },
  setViewBox(v) { this.els.svg.setAttribute('viewBox', `${v.x} ${v.y} ${v.w} ${v.h}`); },

  onWheel(e) {
    e.preventDefault();
    const v = this.getViewBox();
    const rect = this.els.svg.getBoundingClientRect();
    const mx = v.x + (e.clientX - rect.left) / rect.width * v.w;
    const my = v.y + (e.clientY - rect.top) / rect.height * v.h;
    let f = e.deltaY < 0 ? 0.9 : 1.1;
    const nw = v.w * f;
    if (nw < 200 || nw > 8000) return; // 縮放範圍限制
    this.setViewBox({ x: mx - (mx - v.x) * f, y: my - (my - v.y) * f, w: nw, h: v.h * f });
  },

  // 按鈕縮放（以畫面中心為錨）
  zoomBy(f) {
    const v = this.getViewBox();
    const nw = v.w * f;
    if (nw < 200 || nw > 8000) return;
    const cx = v.x + v.w / 2, cy = v.y + v.h / 2, nh = v.h * f;
    this.setViewBox({ x: cx - nw / 2, y: cy - nh / 2, w: nw, h: nh });
  },

  // 全覽：把所有元件/導線縮到畫布內（解決線路太大塞不進）
  fitAll() {
    const E = window.CircuitEngine;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const acc = (x, y) => { if (x < minX) minX = x; if (y < minY) minY = y; if (x > maxX) maxX = x; if (y > maxY) maxY = y; };
    this.state.components.forEach(c => {
      if (E) E.getPins(c).forEach(p => acc(p.x, p.y));
      acc(c.x - 20, c.y - 20); acc(c.x + 20, c.y + 20);
    });
    this.state.wires.forEach(w => { acc(w.x1, w.y1); acc(w.x2, w.y2); });
    if (!isFinite(minX)) { this.setViewBox({ x: 0, y: 0, w: 1000, h: 700 }); return; }
    const pad = 60;
    let w = (maxX - minX) + pad * 2, h = (maxY - minY) + pad * 2;
    // 維持畫布長寬比（1000:700）
    const ar = 1000 / 700;
    if (w / h < ar) w = h * ar; else h = w / ar;
    const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
    this.setViewBox({ x: cx - w / 2, y: cy - h / 2, w, h });
  },

  GRID: 20,                                   // 背景方格邊長；移動/接線一律貼齊
  snapG(v) { return Math.round(v / this.GRID) * this.GRID; },
  snapPoint(x, y) {
    const E = window.CircuitEngine;
    if (!E) return { x: this.snapG(x), y: this.snapG(y), type: 'grid' };
    return E.snapTarget(x, y, this.state.components, this.state.wires, 14, this.GRID);
  },

  // 兩點間導線：軸向→單段；斜向→L 型(先水平再垂直)，轉折點為自由端
  wireSegments(a, b, bindA, bindB) {
    if (a.x === b.x || a.y === b.y) {
      return [{ x1: a.x, y1: a.y, x2: b.x, y2: b.y, bind1: bindA || null, bind2: bindB || null }];
    }
    const ex = b.x, ey = a.y; // 轉折：水平先
    return [
      { x1: a.x, y1: a.y, x2: ex, y2: ey, bind1: bindA || null, bind2: null },
      { x1: ex, y1: ey, x2: b.x, y2: b.y, bind1: null, bind2: bindB || null }
    ];
  },

  onCanvasClick(e) {
    const pt = this.getSVGPoint(e);

    // 導線工具：兩次點擊，端點吸附到接腳/既有端點/網格；吸到接腳則綁定(pin-binding)
    if (this.state.tool === 'wire') {
      const snap = this.snapPoint(pt.x, pt.y);
      const bind = (snap.type === 'pin' && snap.pin) ? { comp: snap.pin.comp.id, pin: snap.pin.index } : null;
      if (!this.state.wireStart) {
        this.state.wireStart = { x: snap.x, y: snap.y, bind };
        this.updateStatus(this.i18n[this.state.lang].statusWire);
      } else {
        if (snap.x !== this.state.wireStart.x || snap.y !== this.state.wireStart.y) {
          this.saveUndo();
          const segs = this.wireSegments(this.state.wireStart, { x: snap.x, y: snap.y }, this.state.wireStart.bind, bind);
          segs.forEach(s => { s.color = this.state.activeColor; this.state.wires.push(s); });
        }
        this.state.wireStart = null;
        this.state.snapHint = null;
        this.updateStatus();
      }
      this.render();
      return;
    }

    // 自訂文字標註（net 命名等）
    if (this.state.tool === 'text') {
      const hit = this.hitTest(pt.x, pt.y);
      if (hit) { this.setSelection([hit.id]); return; }
      const g = this.snapPoint(pt.x, pt.y);
      this.saveUndo();
      const id = 'c' + (++this.state.componentIdCounter);
      this.state.components.push({ id, type: 'text', x: g.x, y: g.y, rotation: 0, text: 'NET', color: this.state.activeColor, scale: this.state.activeSize });
      this.setSelection([id]); this.render(); this.schedulePersist();
      return;
    }
    // 元件放置工具（select 由 mousedown/up 處理，這裡略過）
    const componentTypes = ['resistor','source','ground','switch','lamp','led','diode','capacitor','inductor','tvs','bead','cmchoke','varistor','gdt','fuse','xtal','shield','ammeter','voltmeter','nmos','pmos','dualnmos','dualpmos','npn','pnp','opamp','comparator','dcdc','and','or','nand','nor','xor','xnor','not','buffer'];
    if (componentTypes.includes(this.state.tool)) {
      const hit = this.hitTest(pt.x, pt.y);
      if (hit) { this.setSelection([hit.id]); return; }
      const g = this.snapPoint(pt.x, pt.y);
      this.saveUndo();
      const id = 'c' + (++this.state.componentIdCounter);
      this.state.components.push({
        id, type: this.state.tool, x: g.x, y: g.y, rotation: 0,
        label: this.getDefaultLabel(this.state.tool),
        value: this.getDefaultValue(this.state.tool),
        color: this.state.activeColor, scale: this.state.activeSize,
        closed: this.state.tool === 'switch' ? false : undefined
      });
      this.setSelection([id]);
      this.render();
    }
  },

  onCanvasMouseDown(e) {
    // 中鍵 → 平移畫布（任何工具皆可）
    if (e.button === 1) {
      e.preventDefault();
      const v = this.getViewBox();
      this.state.pan = { sx: e.clientX, sy: e.clientY, vx: v.x, vy: v.y };
      return;
    }
    if (this.state.tool !== 'select') return;
    const pt = this.getSVGPoint(e);
    this.state.mouseMoved = false;
    // 先試標籤拖曳（標籤是小目標，優先）
    const lab = this.hitTestLabel(pt.x, pt.y);
    if (lab) {
      this.saveUndo();
      this.state.labelDrag = { id: lab.id, sx: pt.x, sy: pt.y, dx0: lab.labelDx || 0, dy0: lab.labelDy || 0 };
      return;
    }
    // 單選導線時：點端點 handle → 拖該端點（可重接/吸附）
    if (this.state.selectedWireIndices.length === 1) {
      const wi = this.state.selectedWireIndices[0], w = this.state.wires[wi];
      if (w) {
        if (Math.hypot(pt.x - w.x1, pt.y - w.y1) <= 8) { this.saveUndo(); this.state.wireDrag = { index: wi, end: 1 }; return; }
        if (Math.hypot(pt.x - w.x2, pt.y - w.y2) <= 8) { this.saveUndo(); this.state.wireDrag = { index: wi, end: 2 }; return; }
      }
    }
    const hit = this.hitTest(pt.x, pt.y);
    if (hit) {
      this.state.selectedWireIndices = [];
      if (e.shiftKey) {
        this.toggleSelection(hit.id);
      } else if (!this.state.selectedIds.includes(hit.id)) {
        this.setSelection([hit.id]);
      }
      this.startGroupDrag(pt);
    } else {
      // 點到導線 → 選取，並可立即拖移整條
      const wi = this.hitTestWire(pt.x, pt.y);
      if (wi >= 0) {
        this.state.selectedWireIndices = [wi];
        this.setSelection([]); // 清元件選取（內含 render）
        const w = this.state.wires[wi];
        this.saveUndo();
        this.state.wireDrag = { index: wi, end: 'move', sx: pt.x, sy: pt.y, x1: w.x1, y1: w.y1, x2: w.x2, y2: w.y2 };
        return;
      }
      this.state.selectedWireIndices = [];
      if (!e.shiftKey) this.setSelection([]);
      this.state.marquee = { x0: pt.x, y0: pt.y, x1: pt.x, y1: pt.y };
    }
  },

  startGroupDrag(pt) {
    const E = window.CircuitEngine;
    const ids = this.state.selectedIds.slice();
    const selWires = this.state.selectedWireIndices.slice();
    if (ids.length === 0 && selWires.length === 0) return;
    this.saveUndo();
    const items = ids.map(id => {
      const c = this.state.components.find(k => k.id === id);
      return c ? { id, ox: pt.x - c.x, oy: pt.y - c.y } : null;
    }).filter(Boolean);
    const wireRefs = [];
    const tagged = new Set();
    // 框選的整條導線：兩端都拖
    selWires.forEach(i => {
      const w = this.state.wires[i]; if (!w) return;
      wireRefs.push({ i, end: 1, ox: pt.x - w.x1, oy: pt.y - w.y1 });
      wireRefs.push({ i, end: 2, ox: pt.x - w.x2, oy: pt.y - w.y2 });
      tagged.add(i + ':1'); tagged.add(i + ':2');
    });
    // 與被選元件接腳重合的「未綁定自由端點」一起拖（已綁定的由 reconcileWires 處理）
    if (E && ids.length) {
      const sel = ids.map(id => this.state.components.find(c => c.id === id)).filter(Boolean);
      const pins = [];
      sel.forEach(c => E.getPins(c).forEach(p => pins.push(p)));
      this.state.wires.forEach((w, i) => {
        if (!w.bind1 && !tagged.has(i + ':1') && pins.some(p => E.dist(p.x, p.y, w.x1, w.y1) <= 6)) wireRefs.push({ i, end: 1, ox: pt.x - w.x1, oy: pt.y - w.y1 });
        if (!w.bind2 && !tagged.has(i + ':2') && pins.some(p => E.dist(p.x, p.y, w.x2, w.y2) <= 6)) wireRefs.push({ i, end: 2, ox: pt.x - w.x2, oy: pt.y - w.y2 });
      });
    }
    this.state.groupDrag = { items, wires: wireRefs };
  },

  // 雙擊：文字上 → 原地直接改；空白處 → 新建文字並原地輸入（不彈窗）
  onCanvasDblClick(e) {
    const pt = this.getSVGPoint(e);
    const hit = this.hitTest(pt.x, pt.y);
    if (hit && hit.type === 'text') { this.setSelection([hit.id]); this.startTextEdit(hit); return; }
    if (hit) return;
    this.saveUndo();
    const g = this.snapPoint(pt.x, pt.y);
    const id = 'c' + (++this.state.componentIdCounter);
    const comp = { id, type: 'text', x: g.x, y: g.y, rotation: 0, text: '' };
    this.state.components.push(comp);
    this.setSelection([id]); this.render(); this.startTextEdit(comp);
  },

  // 原地內嵌輸入框（覆蓋在文字位置上）
  startTextEdit(comp) {
    const svg = this.els.svg, wrap = svg.parentElement;
    const sp = svg.createSVGPoint(); sp.x = comp.x; sp.y = comp.y;
    const scr = sp.matrixTransform(svg.getScreenCTM());
    const wr = wrap.getBoundingClientRect();
    document.getElementById('inlineTextEdit')?.remove();
    const inp = document.createElement('input');
    inp.id = 'inlineTextEdit'; inp.value = comp.text || '';
    inp.style.cssText = `position:absolute;left:${scr.x - wr.left}px;top:${scr.y - wr.top}px;transform:translate(-50%,-50%);z-index:20;font-size:15px;font-weight:600;text-align:center;border:1px solid #2563eb;border-radius:4px;padding:2px 6px;min-width:60px;color:${comp.color || '#0f172a'};background:#fff`;
    wrap.appendChild(inp); inp.focus(); inp.select();
    let done = false;
    const commit = () => {
      if (done) return; done = true;
      const v = inp.value; inp.remove();
      if (!v.trim()) {
        this.state.components = this.state.components.filter(c => c !== comp);
        this.state.selectedIds = this.state.selectedIds.filter(id => id !== comp.id);
      } else comp.text = v;
      this.render(); this.schedulePersist();
    };
    inp.addEventListener('blur', commit);
    inp.addEventListener('keydown', ev => {
      if (ev.key === 'Enter') { ev.preventDefault(); inp.blur(); }
      else if (ev.key === 'Escape') { done = true; inp.remove(); this.render(); }
    });
  },

  onCanvasMouseMove(e) {
    // 平移中
    if (this.state.pan) {
      const v = this.getViewBox();
      const rect = this.els.svg.getBoundingClientRect();
      const dx = (e.clientX - this.state.pan.sx) / rect.width * v.w;
      const dy = (e.clientY - this.state.pan.sy) / rect.height * v.h;
      this.setViewBox({ x: this.state.pan.vx - dx, y: this.state.pan.vy - dy, w: v.w, h: v.h });
      return;
    }
    const pt = this.getSVGPoint(e);
    if (this.state.labelDrag) {
      const ld = this.state.labelDrag;
      const c = this.state.components.find(k => k.id === ld.id);
      if (c) { c.labelDx = ld.dx0 + (pt.x - ld.sx); c.labelDy = ld.dy0 + (pt.y - ld.sy); this.render(); }
      return;
    }
    if (this.state.wireDrag) {
      const wd = this.state.wireDrag, w = this.state.wires[wd.index];
      if (w) {
        if (wd.end === 'move') {
          const dx = this.snapG(pt.x - wd.sx), dy = this.snapG(pt.y - wd.sy);  // 整條移動依格子位移
          w.x1 = wd.x1 + dx; w.y1 = wd.y1 + dy; w.x2 = wd.x2 + dx; w.y2 = wd.y2 + dy;
          w.bind1 = null; w.bind2 = null;     // 整條移動 → 脫離接腳綁定
        } else {
          // 端點：吸到接腳→允許(接線優先)；否則正交鎖在另一端的水平/垂直軸
          const snapRaw = this.snapPoint(pt.x, pt.y);
          let nx, ny, bind = null;
          if (snapRaw.type === 'pin' && snapRaw.pin) {
            nx = snapRaw.x; ny = snapRaw.y; bind = { comp: snapRaw.pin.comp.id, pin: snapRaw.pin.index };
          } else {
            const other = wd.end === 1 ? { x: w.x2, y: w.y2 } : { x: w.x1, y: w.y1 };
            if (Math.abs(pt.x - other.x) >= Math.abs(pt.y - other.y)) { nx = this.snapG(pt.x); ny = other.y; }
            else { nx = other.x; ny = this.snapG(pt.y); }
          }
          if (wd.end === 1) { w.x1 = nx; w.y1 = ny; w.bind1 = bind; }
          else { w.x2 = nx; w.y2 = ny; w.bind2 = bind; }
        }
        this.render();
      }
      return;
    }
    if (this.state.groupDrag) {
      this.state.mouseMoved = true;
      const gd = this.state.groupDrag;
      gd.items.forEach(it => {
        const c = this.state.components.find(k => k.id === it.id);
        if (c) { c.x = this.snapG(pt.x - it.ox); c.y = this.snapG(pt.y - it.oy); }
      });
      gd.wires.forEach(wr => {
        const w = this.state.wires[wr.i];
        if (!w) return;
        if (wr.end === 1) { w.x1 = this.snapG(pt.x - wr.ox); w.y1 = this.snapG(pt.y - wr.oy); }
        else { w.x2 = this.snapG(pt.x - wr.ox); w.y2 = this.snapG(pt.y - wr.oy); }
      });
      this.render();
      return;
    }
    if (this.state.marquee) {
      this.state.mouseMoved = true;
      this.state.marquee.x1 = pt.x; this.state.marquee.y1 = pt.y;
      this.renderSelection();
      return;
    }
    if (this.state.tool === 'wire') {
      const snap = this.snapPoint(pt.x, pt.y);
      this.state.snapHint = snap;
      this.renderSelection();
    }
  },

  onCanvasMouseUp(e) {
    if (this.state.pan) { this.state.pan = null; return; }
    if (this.state.labelDrag) { this.state.labelDrag = null; return; }
    if (this.state.wireDrag) { this.state.wireDrag = null; return; }
    if (this.state.marquee) {
      const m = this.state.marquee;
      const xMin = Math.min(m.x0, m.x1), xMax = Math.max(m.x0, m.x1);
      const yMin = Math.min(m.y0, m.y1), yMax = Math.max(m.y0, m.y1);
      if (Math.abs(xMax - xMin) > 3 || Math.abs(yMax - yMin) > 3) {
        const ids = this.state.components
          .filter(c => c.x >= xMin && c.x <= xMax && c.y >= yMin && c.y <= yMax)
          .map(c => c.id);
        // 框選也含導線（兩端都在框內）
        const wireIdx = [];
        this.state.wires.forEach((w, i) => {
          if (w.x1 >= xMin && w.x1 <= xMax && w.y1 >= yMin && w.y1 <= yMax &&
            w.x2 >= xMin && w.x2 <= xMax && w.y2 >= yMin && w.y2 <= yMax) wireIdx.push(i);
        });
        this.setSelection(ids);
        this.state.selectedWireIndices = wireIdx;
      }
      this.state.marquee = null;
      this.render();
    }
    this.state.groupDrag = null;
    this.state.isDragging = false;
  },

  // ---- 選取管理 ----
  setSelection(ids) {
    this.state.selectedIds = ids.slice();
    this.state.selectedId = ids.length === 1 ? ids[0] : null;
    this.syncInspector();
    this.render();
  },

  toggleSelection(id) {
    const s = this.state.selectedIds;
    const i = s.indexOf(id);
    if (i >= 0) s.splice(i, 1); else s.push(id);
    this.state.selectedId = s.length === 1 ? s[0] : null;
    this.syncInspector();
    this.render();
  },

  syncInspector() {
    const form = this.els.inspectorForm, empty = this.els.inspectorEmpty;
    const t = this.i18n[this.state.lang] || this.i18n.zh;
    this.updateStyleBar();
    if (this.state.selectedIds.length === 1) {
      const comp = this.state.components.find(c => c.id === this.state.selectedId);
      if (comp) {
        form.hidden = false; empty.hidden = true;
        this.els.fieldLabel.value = comp.label || '';
        this.els.fieldValue.value = comp.value || '';
        if (comp.type === 'switch') { this.els.switchField.hidden = false; this.els.fieldClosed.checked = comp.closed || false; }
        else this.els.switchField.hidden = true;
        this.renderParamFields(comp);
        this.renderPresetPicker(comp);
      }
    } else if (this.state.selectedWireIndices.length >= 1 && this.state.selectedIds.length === 0) {
      // 選導線 → 顯示導線顏色選擇（套用到所有選取的線）
      form.hidden = true; empty.hidden = false;
      const pf = document.getElementById('paramFields'); if (pf) pf.innerHTML = '';
      const idxs = this.state.selectedWireIndices.slice();
      const w0 = this.state.wires[idxs[0]];
      empty.innerHTML = `<div style="padding:10px">
        <div style="font-size:12px;color:#64748b;margin-bottom:6px">已選 ${idxs.length} 條導線</div>
        <label style="display:flex;align-items:center;gap:8px;font-size:13px;color:#0f172a">顏色
          <input type="color" id="wireColorInput" value="${(w0 && w0.color) || '#2563eb'}"/></label></div>`;
      const inp = document.getElementById('wireColorInput');
      if (inp) inp.oninput = (e) => {
        idxs.forEach(i => { if (this.state.wires[i]) this.state.wires[i].color = e.target.value; });
        this.render(); this.schedulePersist();
      };
    } else {
      form.hidden = true; empty.hidden = false;
      const pf = document.getElementById('paramFields'); if (pf) pf.innerHTML = '';
      empty.textContent = this.state.selectedIds.length > 1
        ? `已選取 ${this.state.selectedIds.length} 個元件` : t.nothingSelected;
    }
  },

  // 套用顏色/大小到目前選取的元件 + 導線（左上樣式列即時改）
  applyStyleToSelection(prop, val) {
    (this.state.selectedIds || []).forEach(id => {
      const c = this.state.components.find(k => k.id === id); if (!c) return;
      if (prop === 'size') c.scale = Math.max(0.3, Math.min(4, parseFloat(val) || 1));
      else c[prop] = val;
    });
    if (prop === 'color') (this.state.selectedWireIndices || []).forEach(i => { if (this.state.wires[i]) this.state.wires[i].color = val; });
    this.render(); this.schedulePersist();
  },
  // 左上樣式列同步顯示選取元件的顏色/大小
  updateStyleBar() {
    const ac = document.getElementById('activeColor'), az = document.getElementById('activeSize');
    if (!ac || !az) return;
    let c = null;
    if (this.state.selectedIds.length === 1) c = this.state.components.find(k => k.id === this.state.selectedId);
    if (c) { ac.value = c.color || '#1f4fd1'; az.value = c.scale || 1; ac.disabled = false; az.disabled = false; }
    else if (this.state.selectedWireIndices.length >= 1 && this.state.selectedIds.length === 0) {
      const w = this.state.wires[this.state.selectedWireIndices[0]];
      ac.value = (w && w.color) || '#2563eb'; ac.disabled = false; az.disabled = true;
    } else { ac.disabled = true; az.disabled = true; }
  },

  paramSchemaFor(type) {
    if (['or', 'nand', 'nor', 'xor', 'xnor', 'not', 'buffer'].includes(type)) return this.PARAM_SCHEMA.and;
    return this.PARAM_SCHEMA[type] || [];
  },

  // 依元件類型動態渲染屬性欄位（存到 comp.params）
  renderParamFields(comp) {
    const host = document.getElementById('paramFields');
    if (!host) return;
    const schema = this.paramSchemaFor(comp.type);
    const p = comp.params || {};
    const esc = s => String(s == null ? '' : s).replace(/"/g, '&quot;');
    // 顏色/大小移到左上樣式列。文字內容保留（亦可雙擊編輯）。
    let html = (comp.type === 'text' ? `<label><span>文字內容</span><input type="text" data-prop="text" value="${esc(comp.text || '')}"/></label>` : '');
    html += schema.map(f => {
      const val = p[f.k] != null ? p[f.k] : '';
      if (f.opt) {
        return `<label><span>${f.l}</span><select data-pkey="${f.k}"><option value="">--</option>` +
          f.opt.map(o => `<option value="${esc(o)}" ${val === o ? 'selected' : ''}>${o}</option>`).join('') + `</select></label>`;
      }
      return `<label><span>${f.l}${f.u ? ` (${f.u})` : ''}</span><input type="text" data-pkey="${f.k}" value="${esc(val)}" placeholder="${f.u || ''}"/></label>`;
    }).join('');
    html += `<label><span>其他參數/備註（自由填）</span><textarea data-pkey="__notes" rows="2" placeholder="任何會影響特性的條件...">${esc(p.__notes || '')}</textarea></label>`;
    host.innerHTML = html;
  },

  // ---- 線路圖 PDF 匯出（整張，自動框全部）----
  exportSchematicPdf() {
    const E = window.CircuitEngine;
    if (this.state.components.length === 0 && this.state.wires.length === 0) { this.showToast('畫布沒有內容'); return; }
    // 計算 bbox（含接腳、元件標籤區）
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const acc = (x, y) => { if (x < minX) minX = x; if (y < minY) minY = y; if (x > maxX) maxX = x; if (y > maxY) maxY = y; };
    this.state.components.forEach(c => {
      if (E) E.getPins(c).forEach(p => acc(p.x, p.y));
      acc(c.x - 40, c.y - 40); acc(c.x + 40, c.y + 40);
      acc(c.x, c.y + this.labelOffset(c) + 16);
    });
    this.state.wires.forEach(w => { acc(w.x1, w.y1); acc(w.x2, w.y2); });
    if (!isFinite(minX)) { minX = 0; minY = 0; maxX = 1000; maxY = 700; }
    const pad = 40;
    const vb = { x: minX - pad, y: minY - pad, w: (maxX - minX) + 2 * pad, h: (maxY - minY) + 2 * pad };

    // clone SVG，去掉選取層/背景格線，加白底
    const clone = this.els.svg.cloneNode(true);
    const sel = clone.querySelector('#selectionLayer'); if (sel) sel.innerHTML = '';
    clone.querySelectorAll(':scope > rect').forEach(r => r.remove()); // 移除原 1000x700 底+格線
    clone.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
    clone.setAttribute('width', '100%'); clone.removeAttribute('style'); clone.removeAttribute('height');
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('x', vb.x); bg.setAttribute('y', vb.y); bg.setAttribute('width', vb.w); bg.setAttribute('height', vb.h); bg.setAttribute('fill', '#ffffff');
    const firstLayer = clone.querySelector('#wireLayer');
    if (firstLayer) clone.insertBefore(bg, firstLayer); else clone.appendChild(bg);
    const xml = new XMLSerializer().serializeToString(clone);

    const w = window.open('', '_blank');
    if (!w) { this.showToast('瀏覽器擋了彈窗'); return; }
    const date = new Date().toLocaleString();
    const land = vb.w >= vb.h; // 依長寬決定紙張方向
    w.document.write(
      `<html><head><title>線路圖</title><style>@page{size:A4 ${land ? 'landscape' : 'portrait'};margin:8mm}` +
      `body{font-family:system-ui;margin:0}.hdr{display:flex;justify-content:space-between;align-items:center;padding:6px 10px;border-bottom:1px solid #888;font-size:12px}` +
      `.wrap{padding:8px 10px}svg{width:100%;height:auto}</style></head><body>` +
      `<div class="hdr"><b>HardwareAI 線路圖</b><span>${date}　元件 ${this.state.components.length}・導線 ${this.state.wires.length}</span></div>` +
      `<div class="wrap">${xml}</div><script>setTimeout(function(){window.print();},300);<\/script></body></html>`
    );
    w.document.close(); w.focus();
  },

  // ---- BOM 料表 ----
  bomCategory(type) {
    const t = this.i18n[this.state.lang] || this.i18n.zh;
    const map = { ic: 'IC', comparator: '比較器', and: '邏輯閘', or: '邏輯閘', nand: '邏輯閘', nor: '邏輯閘', xor: '邏輯閘', xnor: '邏輯閘', not: '邏輯閘', buffer: '邏輯閘' };
    return map[type] || (t && t[type]) || type;
  },
  bomValueText(g) {
    if (g.type === 'ic') return g.name || 'IC';
    const c = { type: g.type, value: g.value };
    const v = this.formatValue(c);
    return v || (g.value != null ? String(g.value) : '');
  },
  bomSpecText(g) {
    const p = g.params || {};
    const parts = [];
    Object.keys(p).forEach(k => { if (k === '__notes') return; if (p[k] !== '' && p[k] != null) parts.push(`${k}=${p[k]}`); });
    if (g.type === 'ic' && g.pinCount) parts.unshift(`${g.pinCount}pin`);
    return parts.join('; ');
  },
  generateBom() {
    const skip = new Set(['ground']);
    const map = {};
    this.state.components.forEach(c => {
      if (skip.has(c.type)) return;
      const params = c.params || {};
      const key = [c.type, c.value, JSON.stringify(params), c.name || ''].join('|');
      if (!map[key]) map[key] = { type: c.type, value: c.value, params, name: c.name, pinCount: (c.icPins || []).length, refs: [] };
      map[key].refs.push(c.label || c.type);
    });
    return Object.values(map).map((g, i) => ({
      item: i + 1,
      refs: g.refs.slice().sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).join(', '),
      qty: g.refs.length,
      category: this.bomCategory(g.type),
      value: this.bomValueText(g),
      spec: this.bomSpecText(g),
      notes: (g.params && g.params.__notes) || ''
    }));
  },
  openBom() {
    const rows = this.generateBom();
    this._bomRows = rows;
    const host = document.getElementById('bomTableHost');
    if (!rows.length) { host.innerHTML = '<p style="padding:16px;color:#64748b">畫布沒有可列入 BOM 的元件</p>'; }
    else {
      const total = rows.reduce((s, r) => s + r.qty, 0);
      host.innerHTML = `<div style="font-size:12px;color:#64748b;margin-bottom:6px">品項 ${rows.length} 種・總數 ${total} 顆</div>` +
        `<table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr>` +
        ['項次', '標號', '數量', '類別', '值', '規格', '備註'].map(h => `<th style="border:1px solid #e2e8f0;padding:4px 6px;background:#f8fafc;text-align:left">${h}</th>`).join('') +
        `</tr></thead><tbody>` +
        rows.map(r => `<tr>${[r.item, r.refs, r.qty, r.category, r.value, r.spec, r.notes].map(v => `<td style="border:1px solid #e2e8f0;padding:4px 6px">${(v == null ? '' : String(v)).replace(/</g, '&lt;')}</td>`).join('')}</tr>`).join('') +
        `</tbody></table>`;
    }
    document.getElementById('bomModal').hidden = false;
  },
  exportBomCsv() {
    const rows = this._bomRows || this.generateBom();
    if (!rows.length) { this.showToast('沒有元件'); return; }
    const esc = v => { const s = String(v == null ? '' : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    const head = ['項次', '標號', '數量', '類別', '值', '規格', '備註'];
    const csv = '﻿' + [head.join(',')].concat(rows.map(r => [r.item, r.refs, r.qty, r.category, r.value, r.spec, r.notes].map(esc).join(','))).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'bom.csv'; a.click();
  },
  printBom() {
    const host = document.getElementById('bomTableHost');
    if (!host) return;
    const w = window.open('', '_blank');
    if (!w) { this.showToast('瀏覽器擋了彈窗'); return; }
    w.document.write(`<html><head><title>BOM</title><style>body{font-family:system-ui;padding:20px}table{border-collapse:collapse;width:100%;font-size:12px}th,td{border:1px solid #888;padding:4px 6px;text-align:left}th{background:#eee}h1{font-size:18px}</style></head><body><h1>BOM 料表</h1>${host.innerHTML}</body></html>`);
    w.document.close(); w.focus(); setTimeout(() => w.print(), 200);
  },

  // ---- 元件預設規格庫（記錄功能，免每次重打）----
  getPresets() {
    try { return JSON.parse(localStorage.getItem('voltsketch-presets') || '{}'); } catch (e) { return {}; }
  },
  savePresets(p) { try { localStorage.setItem('voltsketch-presets', JSON.stringify(p)); } catch (e) {} },

  renderPresetPicker(comp) {
    const sel = document.getElementById('presetPick');
    if (!sel) return;
    const list = (this.getPresets()[comp.type]) || [];
    sel.innerHTML = '<option value="">套用預設規格...</option>' +
      list.map((pr, i) => `<option value="${i}">${pr.name}</option>`).join('');
  },

  savePresetFromComp() {
    const comp = this.state.components.find(c => c.id === this.state.selectedId);
    if (!comp) { this.showToast('先選一個元件'); return; }
    const name = window.prompt('預設名稱（例：10k 0402 1%）', comp.label || comp.type);
    if (!name) return;
    const p = this.getPresets();
    p[comp.type] = (p[comp.type] || []).filter(x => x.name !== name);
    p[comp.type].push({ name, value: comp.value, params: JSON.parse(JSON.stringify(comp.params || {})) });
    this.savePresets(p);
    this.renderPresetPicker(comp);
    this.showToast(`已存預設「${name}」`);
  },

  applyPreset(idx) {
    if (idx === '') return;
    const comp = this.state.components.find(c => c.id === this.state.selectedId);
    if (!comp) return;
    const pr = (this.getPresets()[comp.type] || [])[+idx];
    if (!pr) return;
    if (pr.value !== undefined) comp.value = pr.value;
    comp.params = JSON.parse(JSON.stringify(pr.params || {}));
    this.render();
    this.syncInspector();
    this.showToast(`套用預設「${pr.name}」`);
  },

  deletePreset() {
    const comp = this.state.components.find(c => c.id === this.state.selectedId);
    const sel = document.getElementById('presetPick');
    if (!comp || !sel || sel.value === '') { this.showToast('先選要刪的預設'); return; }
    const p = this.getPresets();
    (p[comp.type] || []).splice(+sel.value, 1);
    this.savePresets(p);
    this.renderPresetPicker(comp);
    this.showToast('已刪除預設');
  },

  onKeyDown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'r' || e.key === 'R') this.rotateSelected();
    if (e.key === 'h' || e.key === 'H') this.flipSelected('h');
    if (e.key === 'v' || e.key === 'V') this.flipSelected('v');
    if (e.key === 'Delete' || e.key === 'Backspace') this.deleteSelected();
    if (e.key === 'Escape') {
      this.state.wireStart = null;
      this.state.snapHint = null;
      this.state.marquee = null;
      this.state.selectedWireIndices = [];
      this.state.drcMarkers = null;
      this.selectComponent(null);
      this.updateStatus();
    }
    if (e.ctrlKey && (e.key === 'a' || e.key === 'A')) {
      this.setSelection(this.state.components.map(c => c.id));
      e.preventDefault();
    }
    if (e.ctrlKey && e.key === 'z') { this.undo(); e.preventDefault(); }
    if (e.ctrlKey && e.key === 'y') { this.redo(); e.preventDefault(); }
  },

  // Component helpers
  getDefaultLabel(type) {
    const labels = { resistor:'R', source:'V', ground:'GND', switch:'SW', lamp:'L', led:'D',
      diode:'D', capacitor:'C', inductor:'L', ammeter:'A', voltmeter:'V',
      nmos:'M1', pmos:'M2', dualnmos:'M3', dualpmos:'M4', npn:'Q1', pnp:'Q2',
      opamp:'U1', comparator:'U1', dcdc:'DC1', ic:'U',
      tvs:'D', bead:'FB', cmchoke:'L', varistor:'RV', gdt:'GDT', fuse:'F', xtal:'Y', shield:'SH',
      and:'U', or:'U', nand:'U', nor:'U', xor:'U', xnor:'U', not:'U', buffer:'U' };
    return (labels[type] || 'X') + this.state.componentIdCounter;
  },

  getDefaultValue(type) {
    const defaults = { resistor:1000, source:5, lamp:100, led:2, capacitor:0.1, inductor:10 };
    return defaults[type] || 0;
  },

  // 每種零件「會影響特性」的可填參數（key/標籤/單位；options=下拉）。所有欄位存到 comp.params。
  PARAM_SCHEMA: {
    resistor:  [{k:'tol',l:'容差',u:'%'},{k:'pwr',l:'額定功率',u:'W'},{k:'tempco',l:'溫度係數',u:'ppm/°C'}],
    capacitor: [{k:'esr',l:'ESR',u:'mΩ'},{k:'vrating',l:'耐壓',u:'V'},{k:'tol',l:'容差',u:'%'},{k:'diel',l:'介質',opt:['NP0/C0G','X7R','X5R','Y5V','電解','鉭']}],
    inductor:  [{k:'dcr',l:'DCR',u:'Ω'},{k:'isat',l:'飽和電流 Isat',u:'A'},{k:'irms',l:'額定電流 Irms',u:'A'}],
    led:       [{k:'vf',l:'順向壓降 Vf',u:'V'},{k:'if',l:'順向電流 If',u:'mA'},{k:'color',l:'顏色',u:''}],
    diode:     [{k:'subtype',l:'二極體類型',opt:['整流','蕭特基','齊納','LED','TVS','變容','光電']},{k:'vf',l:'順向壓降 Vf',u:'V'},{k:'imax',l:'最大電流',u:'A'},{k:'vr',l:'逆向耐壓 Vr',u:'V'},{k:'vz',l:'齊納電壓 Vz(齊納)',u:'V'},{k:'vbr',l:'崩潰電壓(TVS)',u:'V'},{k:'trr',l:'反向恢復 trr',u:'ns'}],
    nmos:      [{k:'state',l:'開關狀態',opt:['ON','OFF']},{k:'vth',l:'閾值 Vgs(th)',u:'V'},{k:'vgson',l:'導通 Vgs(on)',u:'V'},{k:'rdson',l:'Rds(on)',u:'mΩ'},{k:'idmax',l:'Id max',u:'A'},{k:'vdsmax',l:'Vds max',u:'V'},{k:'qg',l:'閘極電荷 Qg',u:'nC'}],
    pmos:      [{k:'state',l:'開關狀態',opt:['ON','OFF']},{k:'vth',l:'閾值 Vgs(th)',u:'V'},{k:'vgson',l:'導通 Vgs(on)',u:'V'},{k:'rdson',l:'Rds(on)',u:'mΩ'},{k:'idmax',l:'Id max',u:'A'},{k:'vdsmax',l:'Vds max',u:'V'},{k:'qg',l:'閘極電荷 Qg',u:'nC'}],
    dualnmos:  [{k:'state1',l:'M1 狀態',opt:['ON','OFF']},{k:'state2',l:'M2 狀態',opt:['ON','OFF']},{k:'vth',l:'閾值 Vgs(th)',u:'V'},{k:'rdson',l:'Rds(on)',u:'mΩ'},{k:'idmax',l:'Id max',u:'A'},{k:'vdsmax',l:'Vds max',u:'V'}],
    dualpmos:  [{k:'state1',l:'M1 狀態',opt:['ON','OFF']},{k:'state2',l:'M2 狀態',opt:['ON','OFF']},{k:'vth',l:'閾值 Vgs(th)',u:'V'},{k:'rdson',l:'Rds(on)',u:'mΩ'},{k:'idmax',l:'Id max',u:'A'},{k:'vdsmax',l:'Vds max',u:'V'}],
    npn:       [{k:'hfe',l:'增益 hFE/β',u:''},{k:'vbeon',l:'Vbe(on)',u:'V'},{k:'vcesat',l:'Vce(sat)',u:'V'},{k:'icmax',l:'Ic max',u:'A'},{k:'vcemax',l:'Vce max',u:'V'}],
    pnp:       [{k:'hfe',l:'增益 hFE/β',u:''},{k:'vbeon',l:'Vbe(on)',u:'V'},{k:'vcesat',l:'Vce(sat)',u:'V'},{k:'icmax',l:'Ic max',u:'A'},{k:'vcemax',l:'Vce max',u:'V'}],
    comparator:[{k:'vcc',l:'供電 Vcc',u:'V'},{k:'vhys',l:'遲滯 Vhys',u:'mV'},{k:'tpd',l:'傳播延遲',u:'ns'},{k:'out',l:'輸出型',opt:['開漏','推挽']},{k:'vref',l:'參考 Vref',u:'V'}],
    opamp:     [{k:'supply',l:'供電',u:'V'},{k:'gbw',l:'頻寬 GBW',u:'MHz'},{k:'sr',l:'轉換率 SR',u:'V/µs'},{k:'vos',l:'失調 Vos',u:'mV'},{k:'ib',l:'偏壓電流 Ib',u:'nA'}],
    source:    [{k:'ilimit',l:'限流',u:'A'},{k:'ac',l:'類型',opt:['DC','AC']},{k:'freq',l:'頻率(AC)',u:'Hz'}],
    dcdc:      [{k:'vin',l:'Vin',u:'V'},{k:'vout',l:'Vout',u:'V'},{k:'iout',l:'Iout',u:'A'},{k:'freq',l:'切換頻率',u:'kHz'},{k:'topo',l:'拓樸',opt:['Buck','Boost','Buck-Boost','LDO']}],
    switch:    [{k:'ron',l:'導通電阻 Ron',u:'Ω'},{k:'imax',l:'額定電流',u:'A'}],
    lamp:      [{k:'pwr',l:'功率',u:'W'},{k:'vrating',l:'額定電壓',u:'V'}],
    ammeter:   [{k:'rshunt',l:'分流電阻',u:'mΩ'},{k:'imax',l:'量程',u:'A'}],
    voltmeter: [{k:'rin',l:'輸入阻抗',u:'MΩ'},{k:'vmax',l:'量程',u:'V'}],
    tvs:      [{k:'dir',l:'方向',opt:['雙向','單向']},{k:'vrwm',l:'工作電壓 Vrwm',u:'V'},{k:'vbr',l:'崩潰 Vbr',u:'V'},{k:'vc',l:'箝位 Vc',u:'V'},{k:'ipp',l:'峰值電流 Ipp',u:'A'},{k:'cj',l:'結電容',u:'pF'}],
    bead:     [{k:'z100',l:'阻抗@100MHz',u:'Ω'},{k:'irate',l:'額定電流',u:'A'},{k:'rdc',l:'DCR',u:'mΩ'}],
    cmchoke:  [{k:'zcm',l:'共模阻抗',u:'Ω'},{k:'freq',l:'標稱頻率',u:'MHz'},{k:'irate',l:'額定電流',u:'A'},{k:'rdc',l:'DCR',u:'mΩ'}],
    varistor: [{k:'vac',l:'額定 AC',u:'V'},{k:'vdc',l:'額定 DC',u:'V'},{k:'vclamp',l:'箝位電壓',u:'V'},{k:'energy',l:'能量',u:'J'}],
    gdt:      [{k:'vspark',l:'直流放電電壓',u:'V'},{k:'isurge',l:'突波電流 8/20µs',u:'kA'},{k:'cap',l:'電容',u:'pF'}],
    fuse:     [{k:'irate',l:'額定電流',u:'A'},{k:'vrate',l:'額定電壓',u:'V'},{k:'speed',l:'熔斷特性',opt:['快熔 F','慢熔 T']}],
    xtal:     [{k:'freq',l:'頻率',u:'MHz'},{k:'cl',l:'負載電容 CL',u:'pF'},{k:'esr',l:'ESR',u:'Ω'},{k:'ppm',l:'頻率容差',u:'ppm'}],
    shield:   [{k:'note',l:'備註（罩內分區用）',u:''}],
    and:[{k:'vcc',l:'供電',u:'V'},{k:'vih',l:'Vih',u:'V'},{k:'vil',l:'Vil',u:'V'},{k:'tpd',l:'延遲',u:'ns'}],
    ic:        [{k:'vcc',l:'供電',u:'V'},{k:'part',l:'料號',u:''}]
  },

  formatValue(c) {
    if (c.type === 'source') return c.value + 'V';
    if (c.type === 'resistor') return c.value >= 1000 ? (c.value/1000) + 'k\u03A9' : c.value + '\u03A9';
    if (c.type === 'capacitor') return c.value >= 1 ? c.value + '\u03BCF' : (c.value * 1000).toFixed(0) + 'nF';
    if (c.type === 'inductor') return c.value + 'mH';
    if (c.type === 'led' || c.type === 'diode') return c.value + 'V';
    return c.value ? c.value.toString() : '';
  },

  // 相容舊呼叫：單選/清空 → 委派多選
  selectComponent(id) {
    this.setSelection(id ? [id] : []);
  },

  rotateSelected() {
    const ids = this.state.selectedIds;
    if (!ids.length) return;
    this.saveUndo();
    ids.forEach(id => {
      const c = this.state.components.find(k => k.id === id);
      if (c) c.rotation = (c.rotation + 90) % 360;
    });
    this.render();
  },

  // 翻轉選取元件：axis 'h' 水平、'v' 垂直
  flipSelected(axis) {
    const ids = this.state.selectedIds;
    if (!ids.length) return;
    this.saveUndo();
    ids.forEach(id => {
      const c = this.state.components.find(k => k.id === id);
      if (!c) return;
      if (axis === 'h') c.flipH = !c.flipH; else c.flipV = !c.flipV;
    });
    this.render();
  },

  deleteSelected() {
    const ids = this.state.selectedIds;
    const wIdx = this.state.selectedWireIndices;
    if (!ids.length && !wIdx.length) return;
    this.saveUndo();
    if (wIdx.length) {
      const set = new Set(wIdx);
      this.state.wires = this.state.wires.filter((_, i) => !set.has(i));
      this.state.selectedWireIndices = [];
    }
    if (ids.length) {
      const set = new Set(ids);
      this.state.components = this.state.components.filter(c => !set.has(c.id));
      this.state.selectedIds = [];
      this.state.selectedId = null;
      this.syncInspector();
    }
    this.render();
  },

  // Undo/Redo
  saveUndo() {
    this.state.undoStack.push({
      components: JSON.parse(JSON.stringify(this.state.components)),
      wires: JSON.parse(JSON.stringify(this.state.wires))
    });
    this.state.redoStack = [];
    if (this.state.undoStack.length > 50) this.state.undoStack.shift();
  },

  undo() {
    if (this.state.undoStack.length === 0) return;
    this.state.redoStack.push({
      components: JSON.parse(JSON.stringify(this.state.components)),
      wires: JSON.parse(JSON.stringify(this.state.wires))
    });
    const state = this.state.undoStack.pop();
    this.state.components = state.components;
    this.state.wires = state.wires;
    this.render();
  },

  redo() {
    if (this.state.redoStack.length === 0) return;
    this.state.undoStack.push({
      components: JSON.parse(JSON.stringify(this.state.components)),
      wires: JSON.parse(JSON.stringify(this.state.wires))
    });
    const state = this.state.redoStack.pop();
    this.state.components = state.components;
    this.state.wires = state.wires;
    this.render();
  },

  // Storage
  saveToStorage() {
    localStorage.setItem('voltsketch-project', JSON.stringify({
      components: this.state.components,
      wires: this.state.wires,
      componentIdCounter: this.state.componentIdCounter
    }));
    this.showToast('已儲存');
  },

  loadFromStorage() {
    const data = localStorage.getItem('voltsketch-project');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        this.state.components = parsed.components || [];
        this.state.wires = parsed.wires || [];
        this.state.componentIdCounter = parsed.componentIdCounter || 0;
      } catch(e) {}
    }
  },

  // Import/Export
  exportJSON() {
    const data = {
      components: this.state.components,
      wires: this.state.wires,
      componentIdCounter: this.state.componentIdCounter
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'circuit.json';
    a.click();
  },

  importJSON(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        this.saveUndo();
        const data = JSON.parse(ev.target.result);
        this.state.components = data.components || [];
        this.state.wires = data.wires || [];
        this.state.componentIdCounter = data.componentIdCounter || 0;
        this.render();
        this.showToast('匯入成功');
      } catch(err) {
        this.showToast('匯入失敗: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  },

  exportPNG() {
    const svgData = new XMLSerializer().serializeToString(this.els.svg);
    const canvas = document.createElement('canvas');
    canvas.width = 2000;
    canvas.height = 1400;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = 'circuit.png';
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  },

  // Project actions
  newProject() {
    if (this.state.components.length > 0 && !confirm('確定要新建專案？')) return;
    this.saveUndo();
    this.state.components = [];
    this.state.wires = [];
    this.state.selectedId = null;
    this.state.componentIdCounter = 0;
    this.render();
  },

  loadDemo() {
    this.saveUndo();
    this.state.components = [
      { id: 'd1', type: 'source', x: 150, y: 200, rotation: 0, label: 'V1', value: 5 },
      { id: 'd2', type: 'resistor', x: 300, y: 150, rotation: 0, label: 'R1', value: 1000 },
      { id: 'd3', type: 'led', x: 450, y: 200, rotation: 0, label: 'D1', value: 2 },
      { id: 'd4', type: 'ground', x: 300, y: 350, rotation: 0, label: 'GND', value: 0 }
    ];
    this.state.wires = [
      { x1: 175, y1: 200, x2: 275, y2: 150 },
      { x1: 325, y1: 150, x2: 425, y2: 200 },
      { x1: 475, y1: 200, x2: 300, y2: 350 },
      { x1: 300, y1: 350, x2: 150, y2: 225 }
    ];
    this.state.componentIdCounter = 10;
    this.render();
    this.showToast('已載入範例電路');
  },

  fitView() {
    this.els.svg.setAttribute('viewBox', '0 0 1000 700');
  },

  // Simulation
  runSimulation() {
    const t = this.i18n[this.state.lang] || this.i18n.zh;
    this.els.simBadge.textContent = t.running;
    this.els.simBadge.style.background = '#dbeafe';
    this.els.simBadge.style.color = '#2563eb';

    setTimeout(() => {
      const results = this.simulateDC();
      this.renderResults(results);
      this.els.simBadge.textContent = t.idle;
      this.els.simBadge.style.background = '';
      this.els.simBadge.style.color = '';
    }, 300);
  },

  simulateDC() {
    const sources = this.state.components.filter(c => c.type === 'source');
    const resistors = this.state.components.filter(c => c.type === 'resistor');
    const totalV = sources.reduce((sum, s) => sum + (s.value || 0), 0);
    const totalR = resistors.reduce((sum, r) => sum + (r.value || 1), 0);
    const current = totalR > 0 ? totalV / totalR : 0;
    return this.state.components.filter(c => c.type !== 'ground').map(c => ({
      id: c.id,
      label: c.label,
      type: c.type,
      voltage: c.type === 'source' ? c.value : current * (c.value || 0),
      current: current,
      power: current * current * (c.value || 0)
    }));
  },

  renderResults(results) {
    const t = this.i18n[this.state.lang] || this.i18n.zh;
    if (results.length === 0) {
      this.els.resultsBody.innerHTML = `<tr><td colspan="4">${t.noReadings}</td></tr>`;
      this.els.summaryGrid.innerHTML = '';
      return;
    }

    const totalV = results.filter(r => r.type === 'source').reduce((s, r) => s + r.voltage, 0);
    const totalI = results[0] ? results[0].current : 0;
    const totalP = results.reduce((s, r) => s + r.power, 0);

    this.els.summaryGrid.innerHTML = `
      <div class="summary-card"><div class="value">${totalV.toFixed(2)}V</div><div class="label">總電壓</div></div>
      <div class="summary-card"><div class="value">${(totalI * 1000).toFixed(2)}mA</div><div class="label">總電流</div></div>
      <div class="summary-card"><div class="value">${(totalP * 1000).toFixed(2)}mW</div><div class="label">總功率</div></div>
      <div class="summary-card"><div class="value">${results.length}</div><div class="label">活躍元件</div></div>
    `;
    this.els.simMessage.hidden = true;

    this.els.resultsBody.innerHTML = results.map(r => `
      <tr>
        <td>${r.label || r.id}</td>
        <td>${r.voltage.toFixed(2)}</td>
        <td>${(r.current * 1000).toFixed(2)}mA</td>
        <td>${(r.power * 1000).toFixed(2)}mW</td>
      </tr>
    `).join('');
  },

  clearSimulation() {
    const t = this.i18n[this.state.lang] || this.i18n.zh;
    this.els.resultsBody.innerHTML = `<tr><td colspan="4">${t.noReadings}</td></tr>`;
    this.els.summaryGrid.innerHTML = '';
    this.els.simMessage.hidden = false;
  },

  // Review
  runReview() {
    const t = this.i18n[this.state.lang] || this.i18n.zh;
    this.els.reviewBadge.textContent = t.running;
    AIChecker.analyzeCircuit(this.state.components, this.state.wires, this.els.reviewNotes.value).then(report => {
      this.els.reviewReport.innerHTML = AIChecker.generateReportHTML(report);
      this.els.reviewBadge.textContent = t.idle;
    });
  },

  clearReview() {
    this.els.reviewReport.innerHTML = '';
    this.els.reviewNotes.value = '';
    this.els.reviewFiles.innerHTML = '';
  },

  async parsePDF() {
    const input = document.getElementById('schematicUpload');
    const resultDiv = document.getElementById('pdfParseResult');
    const statusDiv = document.getElementById('parseStatus');
    const infoDiv = document.getElementById('parsedICInfo');
    const saveBtn = document.getElementById('saveParsedIC');

    if (!input.files.length) {
      this.showToast('請先選擇檔案');
      return;
    }

    statusDiv.textContent = '解析中...';
    resultDiv.hidden = false;

    const file = input.files[0];
    if (file.name.endsWith('.pdf')) {
      const result = await PDFParser.extractPinInfo(file);
      infoDiv.innerHTML = `<p><strong>${file.name}</strong></p><p>找到 ${result.pins.length} 個 Pin 定義</p><pre style="max-height:100px;overflow:auto;font-size:10px;">${result.text.substring(0, 500)}</pre>`;
      saveBtn.hidden = false;
      saveBtn.onclick = () => {
        const ic = {
          name: file.name.replace('.pdf', ''),
          package: 'DIP',
          pins: result.pins.map(p => ({ number: p.number, name: p.name, type: 'io' }))
        };
        ICManager.save(ic);
        this.showToast('IC 已儲存');
        resultDiv.hidden = true;
      };
    } else if (file.type.startsWith('image/')) {
      const result = await OCRParser.parseSchematic(file);
      infoDiv.innerHTML = `<p><strong>${file.name}</strong></p><p>${result.text}</p>`;
      saveBtn.hidden = true;
    }
  },

  // ---- DRC 接線檢查（規則式）----
  runDrc() {
    const E = window.CircuitEngine;
    if (!E) { this.showToast('引擎未載入'); return; }
    const comps = this.state.components, wires = this.state.wires;
    const nets = E.computeNets(comps, wires);
    const byId = {}; comps.forEach(c => { byId[c.id] = c; });
    const netPins = {}; // root -> [key]
    nets.pinNet.forEach((root, key) => { (netPins[root] = netPins[root] || []).push(key); });
    const issues = [];
    const pinTypeOf = (c, idx) => (c.icPins && c.icPins[idx] && c.icPins[idx].type) || '';

    // 1) 無接地 / 無電源
    if (comps.length && !comps.some(c => c.type === 'ground'))
      issues.push({ sev: 'err', msg: '電路無接地 (GND)，請加接地符號' });
    const hasPower = comps.some(c => c.type === 'source' || c.type === 'dcdc');
    if (comps.some(c => ['ic', 'nmos', 'pmos', 'opamp', 'comparator', 'npn', 'pnp'].includes(c.type)) && !hasPower)
      issues.push({ sev: 'warn', msg: '無電源（直流電源/DC-DC），主動元件無供電' });

    // 2) 浮接腳（含上拉/開漏提示）
    comps.forEach(c => {
      E.getPins(c).forEach(p => {
        const key = c.id + ':' + p.index;
        if (pinTypeOf(c, p.index) === 'nc') return;
        if (nets.connectedPins.has(key)) return;
        const nm = (c.type === 'ic' && c.icPins && c.icPins[p.index]) ? String(c.icPins[p.index].name || '') : String(p.name || '');
        let hint = '浮接（未接線）';
        if (/scl|sda|^od|_od|opendrain|_oc/i.test(nm)) hint = '浮接：開漏訊號需上拉電阻';
        else if (/rst|reset|^en$|^mr$|boot|^wp$|hold|^cs$|^ce$/i.test(nm)) hint = '浮接：reset/致能腳建議加上拉電阻';
        issues.push({ sev: 'warn', msg: `${c.label || c.type}.${nm || ('腳' + (p.index + 1))} ${hint}`, x: p.x, y: p.y, id: c.id });
      });
    });

    // 3) IC 電源腳無去耦電容
    comps.forEach(c => {
      if (c.type !== 'ic') return;
      E.getPins(c).forEach(p => {
        const nm = (c.icPins && c.icPins[p.index]) ? String(c.icPins[p.index].name || '') : String(p.name || '');
        const isPwr = pinTypeOf(c, p.index) === 'power' || /^(vcc|vdd|v\+|vbat|avdd|vddio|vin)$/i.test(nm);
        if (!isPwr) return;
        const root = nets.pinNet.get(c.id + ':' + p.index);
        if (root == null) return;
        const hasCap = (netPins[root] || []).some(k => byId[k.split(':')[0]].type === 'capacitor');
        if (!hasCap) issues.push({ sev: 'info', msg: `${c.label}.${nm} 電源腳建議加去耦電容（0.1µF 對地）`, x: p.x, y: p.y, id: c.id });
      });
    });

    // 4) 導線端點懸空
    wires.forEach((w, i) => {
      [[w.x1, w.y1], [w.x2, w.y2]].forEach(([ex, ey]) => {
        let conn = false;
        comps.forEach(c => { if (conn) return; E.getPins(c).forEach(p => { if (E.dist(ex, ey, p.x, p.y) <= 6) conn = true; }); });
        wires.forEach((w2, j) => {
          if (conn || j === i) return;
          if (E.dist(ex, ey, w2.x1, w2.y1) <= 6 || E.dist(ex, ey, w2.x2, w2.y2) <= 6) conn = true;
          else if (E.onSegInterior(ex, ey, [w2.x1, w2.y1, w2.x2, w2.y2], 6)) conn = true;
        });
        if (!conn) issues.push({ sev: 'warn', msg: `導線端點懸空 @(${Math.round(ex)},${Math.round(ey)})`, x: ex, y: ey });
      });
    });

    // 5) 參數驅動檢查（用 comp.params）
    const num = v => { const n = parseFloat(v); return isNaN(n) ? null : n; };
    const isConn = (id, idx) => nets.connectedPins.has(id + ':' + idx);
    const pinRoot = (id, idx) => nets.pinNet.get(id + ':' + idx);
    const netHasType = (root, type) => root != null && (netPins[root] || []).some(k => byId[k.split(':')[0]].type === type);
    comps.forEach(c => {
      const P = c.params || {};
      const pins = E.getPins(c);
      const add = o => issues.push(Object.assign({ id: c.id, x: c.x, y: c.y }, o)); // 預設定位到元件中心
      if (c.type === 'nmos' || c.type === 'pmos') {
        if (String(P.state || '').toUpperCase() === 'ON') {
          if (!isConn(c.id, 0)) add({ sev: 'err', msg: `${c.label} 標 ON 但閘極(G)未接電壓，無法導通`, x: pins[0].x, y: pins[0].y });
          if (!P.vth && !P.vgson) add({ sev: 'info', msg: `${c.label} 標 ON 但未填 Vgs(th)/Vgs(on)，無法確認導通` });
        }
        if (P.rdson && num(P.rdson) == null) add({ sev: 'info', msg: `${c.label} Rds(on) 非數值` });
      }
      if (c.type === 'dualnmos' || c.type === 'dualpmos') {
        if (String(P.state1 || '').toUpperCase() === 'ON' && !isConn(c.id, 0)) add({ sev: 'err', msg: `${c.label} M1 標 ON 但 G1 未接電壓`, x: pins[0].x, y: pins[0].y });
        if (String(P.state2 || '').toUpperCase() === 'ON' && !isConn(c.id, 3)) add({ sev: 'err', msg: `${c.label} M2 標 ON 但 G2 未接電壓`, x: pins[3].x, y: pins[3].y });
      }
      if (c.type === 'comparator') {
        if (P.out === '開漏') {
          const r = pinRoot(c.id, 2);
          if (r != null && !netHasType(r, 'resistor')) add({ sev: 'warn', msg: `${c.label} 開漏輸出需上拉電阻`, x: pins[2].x, y: pins[2].y });
        }
        if (!P.vcc) add({ sev: 'info', msg: `${c.label} 未填供電 Vcc` });
      }
      if (c.type === 'opamp' && !P.supply) add({ sev: 'info', msg: `${c.label} 未填供電電壓` });
      if (c.type === 'led') {
        const hasR = [pinRoot(c.id, 0), pinRoot(c.id, 1)].some(r => netHasType(r, 'resistor'));
        if (!hasR) add({ sev: 'warn', msg: `${c.label} LED 無串聯限流電阻，恐過流燒毀` });
      }
      if (c.type === 'dcdc') {
        const vin = num(P.vin), vout = num(P.vout), topo = P.topo;
        if (vin != null && vout != null) {
          if ((topo === 'Buck' || topo === 'LDO') && vout > vin) add({ sev: 'warn', msg: `${c.label} ${topo} 不能升壓 (Vout>Vin)` });
          if (topo === 'Boost' && vout < vin) add({ sev: 'warn', msg: `${c.label} Boost 不能降壓 (Vout<Vin)` });
        }
      }
      if (c.type === 'source' && String(P.ac).toUpperCase() === 'AC' && !P.freq)
        add({ sev: 'info', msg: `${c.label} AC 源未填頻率` });
      if (c.type === 'capacitor' && /電解|鉭/.test(P.diel || ''))
        add({ sev: 'info', msg: `${c.label} 為極性電容(${P.diel})，注意極性與耐壓` });
    });

    this.state.drcMarkers = issues.filter(i => i.x != null).map(i => ({ x: i.x, y: i.y, sev: i.sev }));
    this.renderDrcReport(issues);
    this.render();
  },

  renderDrcReport(issues) {
    const el = document.getElementById('drcReport');
    if (!el) return;
    if (!issues.length) { this._drcIssues = []; el.innerHTML = '<div style="color:#16a34a;font-size:12px;padding:6px">✓ 未發現接線問題</div>'; return; }
    const col = { err: '#dc2626', warn: '#d97706', info: '#2563eb' };
    const ico = { err: '✕', warn: '⚠', info: 'ℹ' };
    const ord = { err: 0, warn: 1, info: 2 };
    const sorted = issues.slice().sort((a, b) => ord[a.sev] - ord[b.sev]);
    this._drcIssues = sorted; // didx 對應排序後索引
    const n = { err: 0, warn: 0, info: 0 }; issues.forEach(i => n[i.sev]++);
    el.innerHTML = `<div style="font-size:11px;color:#64748b;margin:4px 0">✕${n.err} ⚠${n.warn} ℹ${n.info}　(點問題可定位)</div>` +
      sorted.map((i, idx) => {
        const clickable = (i.x != null || i.id);
        return `<div data-didx="${idx}" style="font-size:12px;padding:3px 6px;margin:2px 0;border-left:3px solid ${col[i.sev]};background:#f8fafc;cursor:${clickable ? 'pointer' : 'default'}">${ico[i.sev]} ${i.msg}</div>`;
      }).join('');
  },

  // 點報告行 → 畫布置中 + 高亮 + 選取對應元件
  focusDrcIssue(it) {
    let x = it.x, y = it.y;
    if ((x == null || y == null) && it.id) {
      const c = this.state.components.find(k => k.id === it.id);
      if (c) { x = c.x; y = c.y; }
    }
    if (it.id) this.setSelection([it.id]);
    if (x != null && y != null) {
      const v = this.getViewBox();
      this.setViewBox({ x: x - v.w / 2, y: y - v.h / 2, w: v.w, h: v.h });
      this.state.drcFocus = { x, y };
      this.render();
      clearTimeout(this._drcFocusT);
      this._drcFocusT = setTimeout(() => { this.state.drcFocus = null; this.render(); }, 2600);
    }
  },

  // 綁定的導線端點：座標由接腳推出，使元件移動/旋轉時導線自動跟（真正 pin-binding）
  reconcileWires() {
    const E = window.CircuitEngine;
    if (!E) return;
    const byId = {};
    this.state.components.forEach(c => { byId[c.id] = c; });
    this.state.wires.forEach(w => {
      if (w.bind1) {
        const c = byId[w.bind1.comp];
        if (c) { const p = E.getPins(c)[w.bind1.pin]; if (p) { w.x1 = p.x; w.y1 = p.y; } }
        else delete w.bind1; // 元件已刪 → 解除綁定，保留最後座標
      }
      if (w.bind2) {
        const c = byId[w.bind2.comp];
        if (c) { const p = E.getPins(c)[w.bind2.pin]; if (p) { w.x2 = p.x; w.y2 = p.y; } }
        else delete w.bind2;
      }
    });
  },

  // Render
  render() {
    this.reconcileWires();
    if (window.CircuitEngine) {
      this.state.nets = window.CircuitEngine.computeNets(this.state.components, this.state.wires);
    }
    this.renderWires();
    this.renderComponents();
    this.renderTerminals();
    this.renderOverlays();
    this.renderSelection();
    this.applyI18n();
    this.schedulePersist();   // 自動存檔，避免重載(含誤按 Ctrl+R)丟失
  },

  // 防丟失：變更後 400ms 靜默存到 localStorage
  schedulePersist() {
    clearTimeout(this._persistTimer);
    this._persistTimer = setTimeout(() => this.persist(), 400);
  },
  persist() {
    try {
      localStorage.setItem('voltsketch-project', JSON.stringify({
        components: this.state.components,
        wires: this.state.wires,
        componentIdCounter: this.state.componentIdCounter
      }));
    } catch (e) {}
  },

  // 接腳點：已連接=綠實心、未連=空心紅，給「連線感」
  renderTerminals() {
    const E = window.CircuitEngine;
    if (!E) { this.els.terminalLayer.innerHTML = ''; return; }
    const nets = this.state.nets;
    let html = '';
    this.state.components.forEach(c => {
      E.getPins(c).forEach(p => {
        const connected = nets && nets.connectedPins.has(c.id + ':' + p.index);
        html += connected
          ? `<circle cx="${p.x}" cy="${p.y}" r="3.2" fill="#16a34a"/>`
          : `<circle cx="${p.x}" cy="${p.y}" r="3.2" fill="#fff" stroke="#dc2626" stroke-width="1.4"/>`;
      });
    });
    this.els.terminalLayer.innerHTML = html;
  },

  // 橡皮框 + 多選外框 + 導線吸附提示
  renderSelection() {
    let html = '';
    const selSet = new Set(this.state.selectedIds);
    this.state.components.forEach(c => {
      if (selSet.has(c.id)) {
        html += `<rect x="${c.x - 30}" y="${c.y - 30}" width="60" height="60" fill="none" stroke="#2563eb" stroke-width="1" stroke-dasharray="4 3" opacity="0.7"/>`;
      }
    });
    // 單選導線：端點顯示可拖曳 handle
    if (this.state.selectedWireIndices.length === 1) {
      const w = this.state.wires[this.state.selectedWireIndices[0]];
      if (w) {
        [[w.x1, w.y1], [w.x2, w.y2]].forEach(([hx, hy]) => {
          html += `<rect x="${hx - 4}" y="${hy - 4}" width="8" height="8" fill="#fff" stroke="#f97316" stroke-width="1.5" style="cursor:move"/>`;
        });
      }
    }
    const m = this.state.marquee;
    if (m) {
      const x = Math.min(m.x0, m.x1), y = Math.min(m.y0, m.y1);
      const w = Math.abs(m.x1 - m.x0), h = Math.abs(m.y1 - m.y0);
      html += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#2563eb" fill-opacity="0.08" stroke="#2563eb" stroke-width="1" stroke-dasharray="5 3"/>`;
    }
    if (this.state.tool === 'wire' && this.state.snapHint && this.state.snapHint.type !== 'grid') {
      const s = this.state.snapHint;
      html += `<circle cx="${s.x}" cy="${s.y}" r="6" fill="none" stroke="#16a34a" stroke-width="2"/>`;
    }
    // DRC 點選定位高亮（大紅環）
    if (this.state.drcFocus) {
      const f = this.state.drcFocus;
      html += `<circle cx="${f.x}" cy="${f.y}" r="16" fill="none" stroke="#dc2626" stroke-width="2.5"/>`;
      html += `<circle cx="${f.x}" cy="${f.y}" r="26" fill="none" stroke="#dc2626" stroke-width="1" opacity="0.5"/>`;
    }
    // DRC 問題標記
    (this.state.drcMarkers || []).forEach(m => {
      const c = m.sev === 'err' ? '#dc2626' : m.sev === 'info' ? '#2563eb' : '#d97706';
      html += `<circle cx="${m.x}" cy="${m.y}" r="7" fill="none" stroke="${c}" stroke-width="2"/>`;
    });
    if (this.state.wireStart) {
      html += `<circle cx="${this.state.wireStart.x}" cy="${this.state.wireStart.y}" r="4" fill="#2563eb"/>`;
      // L 型導線預覽（先水平再垂直）
      if (this.state.snapHint) {
        const a = this.state.wireStart, b = this.state.snapHint;
        const pts = (a.x === b.x || a.y === b.y) ? `${a.x},${a.y} ${b.x},${b.y}` : `${a.x},${a.y} ${b.x},${a.y} ${b.x},${b.y}`;
        html += `<polyline points="${pts}" fill="none" stroke="#2563eb" stroke-width="1.5" stroke-dasharray="5 3" opacity="0.6"/>`;
      }
    }
    this.els.selectionLayer.innerHTML = html;
  },

  // 匯出 Falstad netlist 並在嵌入模擬器執行
  openSimulation(opts) {
    opts = opts || {};
    const E = window.CircuitEngine;
    if (!E) { this.showToast('引擎未載入'); return; }
    if (this.state.components.length === 0) { this.showToast('畫布沒有元件'); return; }
    const { text, unsupported, experimental } = E.toFalstad(this.state.components, this.state.wires);
    this._lastNetlist = text;
    const modal = document.getElementById('simModal');
    const frame = document.getElementById('simFrame');
    const warn = document.getElementById('simWarn');
    const openNew = document.getElementById('simOpenNew');
    const url = E.falstadURL(text, { running: false });
    // 注意：電路內容會以 URL 參數送到 falstad.com（外部站）執行模擬。
    frame.src = url;
    openNew.href = url;
    // 環路電流 / FFT 指引
    const guide = document.getElementById('simGuide');
    if (guide) {
      if (opts.fft) {
        guide.hidden = false;
        guide.innerHTML = '🔍 <b>看環路電流 / FFT(像範例第四張)</b>：' +
          '① 右鍵<b>電感</b>→「View in New Scope」=輸出環電流(三角波)；' +
          '② 右鍵<b>輸入電容 Cin</b>→看 Cin 電流(輸入環,開關切換有突變)；' +
          '③ scope 上右鍵→勾 <b>FFT</b>=看頻譜：輸入環高頻諧波較大→EMI 主因。';
      } else { guide.hidden = true; }
    }
    const msgs = [];
    if (experimental && experimental.length) {
      msgs.push(`⚗ 電晶體 ${experimental.length} 顆為實驗性匯出（閘/基極自動接，通道端可能需在 Falstad 內微調）：${experimental.join('、')}`);
    }
    if (unsupported.length) {
      const names = unsupported.map(u => `${u.label || u.type}`).join('、');
      msgs.push(`⚠ ${unsupported.length} 個元件未轉換（邏輯閘/雙MOS/OP/DC-DC），已略過：${names}`);
    }
    if (msgs.length) { warn.hidden = false; warn.innerHTML = msgs.join('<br>'); }
    else warn.hidden = true;
    modal.hidden = false;
  },

  renderWires() {
    const selW = new Set(this.state.selectedWireIndices);
    let html = this.state.wires.map((w, i) => {
      const sel = selW.has(i);
      return `<line x1="${w.x1}" y1="${w.y1}" x2="${w.x2}" y2="${w.y2}" stroke="${sel ? '#f97316' : (w.color || '#2563eb')}" stroke-width="${sel ? 3.5 : 2}" stroke-linecap="round"/>`;
    }).join('');
    // 導線接點實心點：讓「線與線相連」一眼可見
    if (window.CircuitEngine) {
      const js = window.CircuitEngine.junctions(this.state.components, this.state.wires);
      html += js.map(j => `<circle cx="${j.x}" cy="${j.y}" r="3.6" fill="#2563eb"/>`).join('');
    }
    this.els.wireLayer.innerHTML = html;
  },

  renderComponents() {
    this.els.componentLayer.innerHTML = this.state.components.map(c => {
      const fx = c.flipH ? -1 : 1, fy = c.flipV ? -1 : 1;
      const scl = c.scale || 1;               // 大小（輸入框調）
      const rot = `translate(${c.x},${c.y}) rotate(${c.rotation || 0}) scale(${fx * scl},${fy * scl})`;
      const sel = this.state.selectedIds.includes(c.id);
      const sw = sel ? 2 : 1;
      const sc = sel ? '#2563eb' : (c.color || '');   // 自訂顏色（未選時用）
      let inner = '';

      switch(c.type) {
        case 'ic': {
          // 自訂多腳 IC 方框（資料驅動，仿 datasheet pin 圖：號內名外、字級統一）
          const cc = sc || (window.Sym ? Sym.color : '#1f4fd1');
          const lay = window.CircuitEngine ? window.CircuitEngine.icLayout(c) : { w: 110, h: 86, pins: [] };
          const F = 11;  // 統一字級
          inner = `<rect x="${-lay.w / 2}" y="${-lay.h / 2}" width="${lay.w}" height="${lay.h}" rx="3" fill="#fff" stroke="${cc}" stroke-width="${sw}"/>`;
          // pin1 圓點記號（左上內側）
          inner += `<circle cx="${-lay.w / 2 + 10}" cy="${-lay.h / 2 + 10}" r="3" fill="none" stroke="${cc}" stroke-width="1.2"/>`;
          if (window.Sym) {
            lay.pins.forEach(p => {
              inner += Sym.line(p.bx, p.by, p.x, p.y, { color: sc || undefined });  // 等長細引線
              // 腳號：框內近邊
              let nx, ny, na;
              if (p.side === 'L') { nx = p.bx + 9; ny = p.by + F * 0.34; na = 'start'; }
              else if (p.side === 'R') { nx = p.bx - 9; ny = p.by + F * 0.34; na = 'end'; }
              else if (p.side === 'T') { nx = p.bx; ny = p.by + F + 3; na = 'middle'; }
              else { nx = p.bx; ny = p.by - 7; na = 'middle'; }
              inner += Sym.txt(nx, ny, p.num, { size: F, anchor: na, fill: '#64748b' });
              // 腳名：框外。L/R 在線上方(水平)；T/B 在線左邊(垂直，向外延伸)
              if (p.name) {
                if (p.side === 'L' || p.side === 'R') {
                  inner += Sym.txt((p.bx + p.x) / 2, p.by - 5, p.name, { size: F, anchor: 'middle' });
                } else {
                  const lx = p.bx - 6, anc = p.side === 'T' ? 'start' : 'end';  // T 向上、B 向下延伸
                  inner += `<g transform="rotate(-90 ${lx} ${p.by})">` + Sym.txt(lx, p.by, p.name, { size: F, anchor: anc }) + `</g>`;
                }
              }
            });
            // 元件名置框內中央（中央空白、不壓腳）。參考標號(U1)由編輯器統一繪製，這裡不重畫避免重複。
            inner += Sym.txt(0, F * 0.34, c.name || 'IC', { size: F + 1, weight: '600' });
          }
          break;
        }
        case 'text': {
          // 自訂文字標註（net 命名等）
          const tc = sc || c.color || '#0f172a';
          const s = String(c.text != null ? c.text : '文字').replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
          inner = `<text x="0" y="5" text-anchor="middle" font-size="15" fill="${tc}" font-weight="600" font-family="system-ui,sans-serif">${s}</text>`;
          if (sel) inner = `<rect x="-2" y="-12" width="4" height="4" fill="none"/>` + inner;
          break;
        }
        case 'resistor':
          inner = window.Sym ? Sym.resistor(0, 0, { horizontal: true, color: sc || undefined })
            : `<rect x="-20" y="-6" width="40" height="12" fill="#fef3c7" stroke="${sc||'#92400e'}" stroke-width="${sw}" rx="2"/>`;
          break;
        case 'source':
          // 電池符號(+ 上 − 下)，含上下引線對齊 pin(0,±22)
          inner = `<line x1="0" y1="-22" x2="0" y2="-10" stroke="${sc||'#1e40af'}" stroke-width="2"/>`
            + `<line x1="-12" y1="-10" x2="12" y2="-10" stroke="${sc||'#1e40af'}" stroke-width="3"/>`
            + `<line x1="-6" y1="-3" x2="6" y2="-3" stroke="${sc||'#1e40af'}" stroke-width="2"/>`
            + `<line x1="-12" y1="4" x2="12" y2="4" stroke="${sc||'#1e40af'}" stroke-width="3"/>`
            + `<line x1="-6" y1="11" x2="6" y2="11" stroke="${sc||'#1e40af'}" stroke-width="2"/>`
            + `<line x1="0" y1="11" x2="0" y2="22" stroke="${sc||'#1e40af'}" stroke-width="2"/>`
            + `<text x="14" y="-10" font-size="11" fill="#1e40af">+</text>`;
          break;
        case 'ground':
          inner = window.Sym ? Sym.ground(0, -4, { color: sc || undefined, label: false })
            : `<line x1="-10" y1="-8" x2="10" y2="-8" stroke="${sc||'#475569'}" stroke-width="2"/><line x1="-7" y1="-2" x2="7" y2="-2" stroke="#475569" stroke-width="1.5"/><line x1="-4" y1="4" x2="4" y2="4" stroke="#475569" stroke-width="1"/>`;
          break;
        case 'switch':
          inner = `<line x1="-14" y1="0" x2="14" y2="${c.closed?'0':'-10'}" stroke="${sc||'#d97706'}" stroke-width="2" stroke-linecap="round"/><circle cx="-14" cy="0" r="3" fill="${c.closed?'#16a34a':'#dc2626'}"/><circle cx="14" cy="0" r="3" fill="${c.closed?'#16a34a':'#dc2626'}"/>`;
          break;
        case 'lamp':
          inner = `<circle r="14" fill="#fef9c3" stroke="${sc||'#ca8a04'}" stroke-width="${sw}"/><line x1="-7" y1="-7" x2="7" y2="7" stroke="#ca8a04" stroke-width="1"/><line x1="7" y1="-7" x2="-7" y2="7" stroke="#ca8a04" stroke-width="1"/>`;
          break;
        case 'led':
          inner = `<polygon points="-10,-8 -10,8 10,0" fill="#fecaca" stroke="${sc||'#dc2626'}" stroke-width="${sw}"/><line x1="10" y1="-8" x2="10" y2="8" stroke="#dc2626" stroke-width="2"/>`;
          break;
        case 'diode':
          inner = `<polygon points="-10,-8 -10,8 10,0" fill="#e2e8f0" stroke="${sc||'#475569'}" stroke-width="${sw}"/><line x1="10" y1="-8" x2="10" y2="8" stroke="#475569" stroke-width="2"/>`;
          break;
        case 'capacitor':
          inner = window.Sym ? Sym.capacitor(0, 0, { color: sc || undefined })
            : `<line x1="-4" y1="-10" x2="-4" y2="10" stroke="${sc||'#2563eb'}" stroke-width="2.5"/><line x1="4" y1="-10" x2="4" y2="10" stroke="#2563eb" stroke-width="2.5"/>`;
          break;
        case 'inductor':
          inner = window.Sym ? Sym.inductor(0, 0, { color: sc || undefined })
            : `<path d="M -15 0 Q -15 -12 -5 -12 Q 5 -12 5 0 Q 5 -12 15 -12" fill="none" stroke="${sc||'#7c3aed'}" stroke-width="2"/>`;
          break;
        case 'tvs': {
          // 雙向 TVS/ESD：兩個齊納三角相對 + 中央雙桿帶 Z 勾
          const tc = sc || '#059669';
          inner = `<line x1="-14" y1="0" x2="-11" y2="0" stroke="${tc}" stroke-width="2"/>`
            + `<polygon points="-11,-8 -11,8 -2,0" fill="#d1fae5" stroke="${tc}" stroke-width="${sw}"/>`
            + `<polygon points="11,-8 11,8 2,0" fill="#d1fae5" stroke="${tc}" stroke-width="${sw}"/>`
            + `<line x1="-2" y1="-8" x2="-2" y2="8" stroke="${tc}" stroke-width="2"/>`
            + `<line x1="2" y1="-8" x2="2" y2="8" stroke="${tc}" stroke-width="2"/>`
            + `<line x1="-2" y1="-8" x2="-6" y2="-11" stroke="${tc}" stroke-width="1.5"/>`
            + `<line x1="2" y1="8" x2="6" y2="11" stroke="${tc}" stroke-width="1.5"/>`
            + `<line x1="11" y1="0" x2="14" y2="0" stroke="${tc}" stroke-width="2"/>`;
          break;
        }
        case 'bead': {
          // 磁珠：斜線填充方塊（EMI 抑制，區別於電阻/電感）
          const bc = sc || '#7c2d12';
          inner = `<line x1="-20" y1="0" x2="-11" y2="0" stroke="${bc}" stroke-width="2"/>`
            + `<rect x="-11" y="-7" width="22" height="14" fill="#fef3c7" stroke="${bc}" stroke-width="${sw}" rx="2"/>`
            + `<line x1="-7" y1="6" x2="0" y2="-6" stroke="${bc}" stroke-width="1.5"/>`
            + `<line x1="0" y1="6" x2="7" y2="-6" stroke="${bc}" stroke-width="1.5"/>`
            + `<line x1="11" y1="0" x2="20" y2="0" stroke="${bc}" stroke-width="2"/>`;
          break;
        }
        case 'cmchoke': {
          // 共模扼流圈：上下兩繞組 + 中央磁芯雙線 + 同名端點
          const kc = sc || '#7c3aed';
          inner = `<path d="M -15 -14 Q -15 -26 -7.5 -26 Q 0 -26 0 -14 Q 0 -26 7.5 -26 Q 15 -26 15 -14" fill="none" stroke="${kc}" stroke-width="2"/>`
            + `<path d="M -15 14 Q -15 26 -7.5 26 Q 0 26 0 14 Q 0 26 7.5 26 Q 15 26 15 14" fill="none" stroke="${kc}" stroke-width="2"/>`
            + `<line x1="-16" y1="-4" x2="16" y2="-4" stroke="${kc}" stroke-width="1.6"/>`
            + `<line x1="-16" y1="4" x2="16" y2="4" stroke="${kc}" stroke-width="1.6"/>`
            + `<circle cx="-18" cy="-20" r="2" fill="${kc}"/><circle cx="-18" cy="20" r="2" fill="${kc}"/>`
            + `<line x1="-30" y1="-14" x2="-15" y2="-14" stroke="${kc}" stroke-width="2"/><line x1="15" y1="-14" x2="30" y2="-14" stroke="${kc}" stroke-width="2"/>`
            + `<line x1="-30" y1="14" x2="-15" y2="14" stroke="${kc}" stroke-width="2"/><line x1="15" y1="14" x2="30" y2="14" stroke="${kc}" stroke-width="2"/>`;
          break;
        }
        case 'varistor': {
          // 壓敏電阻 MOV：方塊 + 斜貫箭頭 + U 標記
          const vc2 = sc || '#b45309';
          inner = `<line x1="-20" y1="0" x2="-12" y2="0" stroke="${vc2}" stroke-width="2"/>`
            + `<rect x="-12" y="-7" width="24" height="14" fill="#ffedd5" stroke="${vc2}" stroke-width="${sw}" rx="1"/>`
            + `<line x1="12" y1="0" x2="20" y2="0" stroke="${vc2}" stroke-width="2"/>`
            + `<line x1="-14" y1="12" x2="14" y2="-12" stroke="${vc2}" stroke-width="1.8"/>`
            + `<polygon points="14,-12 7,-10 11,-5" fill="${vc2}"/>`
            + `<text x="15" y="15" font-size="8" fill="${vc2}">U</text>`;
          break;
        }
        case 'gdt': {
          // 氣體放電管：圓殼 + 兩電極間隙 + 氣體點
          const gc = sc || '#0e7490';
          inner = `<circle r="12" fill="#ecfeff" stroke="${gc}" stroke-width="${sw}"/>`
            + `<line x1="-16" y1="0" x2="-3" y2="0" stroke="${gc}" stroke-width="2"/>`
            + `<line x1="3" y1="0" x2="16" y2="0" stroke="${gc}" stroke-width="2"/>`
            + `<line x1="-3" y1="-6" x2="-3" y2="6" stroke="${gc}" stroke-width="2"/>`
            + `<line x1="3" y1="-6" x2="3" y2="6" stroke="${gc}" stroke-width="2"/>`
            + `<circle cx="0" cy="-7" r="1.6" fill="${gc}"/>`;
          break;
        }
        case 'fuse': {
          // 保險絲：圓角膠囊 + 貫穿線（IEC 風格）
          const fc = sc || '#475569';
          inner = `<line x1="-20" y1="0" x2="-13" y2="0" stroke="${fc}" stroke-width="2"/>`
            + `<rect x="-13" y="-6" width="26" height="12" fill="#f8fafc" stroke="${fc}" stroke-width="${sw}" rx="5"/>`
            + `<line x1="-13" y1="0" x2="13" y2="0" stroke="${fc}" stroke-width="1.6"/>`
            + `<line x1="13" y1="0" x2="20" y2="0" stroke="${fc}" stroke-width="2"/>`;
          break;
        }
        case 'xtal': {
          // 晶體振盪器：兩電極板夾晶體方塊
          const xc = sc || '#334155';
          inner = `<line x1="-16" y1="0" x2="-7" y2="0" stroke="${xc}" stroke-width="2"/>`
            + `<line x1="-7" y1="-9" x2="-7" y2="9" stroke="${xc}" stroke-width="2"/>`
            + `<rect x="-4" y="-11" width="8" height="22" fill="#e2e8f0" stroke="${xc}" stroke-width="${sw}"/>`
            + `<line x1="7" y1="-9" x2="7" y2="9" stroke="${xc}" stroke-width="2"/>`
            + `<line x1="7" y1="0" x2="16" y2="0" stroke="${xc}" stroke-width="2"/>`;
          break;
        }
        case 'shield': {
          // 金屬屏蔽罩：虛線罩框 + 接地耳（視覺分區，罩住雜訊敏感/吵鬧區塊；不參與模擬）
          const hc = sc || '#64748b';
          inner = `<rect x="-42" y="-30" width="84" height="60" rx="4" fill="rgba(148,163,184,0.08)" stroke="${hc}" stroke-width="1.6" stroke-dasharray="6 4"/>`
            + `<text x="0" y="-18" text-anchor="middle" font-size="9" fill="${hc}">SHIELD</text>`
            + `<line x1="0" y1="30" x2="0" y2="34" stroke="${hc}" stroke-width="2"/>`;
          break;
        }
        case 'ammeter':
        case 'voltmeter':
          inner = `<circle r="14" fill="#dcfce7" stroke="${sc||'#16a34a'}" stroke-width="${sw}"/><text y="5" text-anchor="middle" font-size="11" font-weight="bold" fill="#16a34a">${c.type==='ammeter'?'A':'V'}</text>`;
          break;
        case 'nmos':
        case 'pmos':
          // 顯示 G/D/S 腳位標記
          inner = window.Sym ? Sym.nmos(0, 0, { color: sc || undefined, p: c.type === 'pmos', showPins: true })
            : `<rect x="-16" y="-16" width="32" height="32" fill="#dbeafe" stroke="${sc||'#1d4ed8'}" stroke-width="${sw}" rx="2"/><text y="5" text-anchor="middle" font-size="9" fill="#1e40af">${c.type==='nmos'?'NM':'PM'}</text>`;
          break;
        case 'dualnmos':
        case 'dualpmos':
          // 雙 MOS：外框包住上下兩顆單 MOS（照使用者圖：G 左出、S/D 右出）
          if (window.Sym) {
            const pf = c.type === 'dualpmos';
            const bx = sc || Sym.color;
            const L = (x1, y1, x2, y2) => Sym.line(x1, y1, x2, y2, { color: sc || undefined });
            const T = (x, y, s, a) => Sym.txt(x, y, s, { size: 9, anchor: a || 'start' });
            inner = `<rect x="-60" y="-78" width="120" height="156" rx="4" fill="none" stroke="${bx}" stroke-width="2"/>`;
            inner += `<g transform="translate(0,-32)">${Sym.nmos(0, 0, { color: sc || undefined, p: pf, showPins: false })}</g>`;
            // 下顆垂直鏡像：S2 在下、D2 在上，體二極體方向與上顆相反（符合實際雙MOS封裝）
            inner += `<g transform="translate(0,32) scale(1,-1)">${Sym.nmos(0, 0, { color: sc || undefined, p: pf, showPins: false })}</g>`;
            // 引線拉到外框邊：上顆 G/S/D、下顆 G/D/S（下顆上下對調標籤）
            inner += L(-60, -32, -30, -32) + L(26, -52, 60, -52) + L(26, -12, 60, -12);
            inner += L(-60, 32, -30, 32) + L(26, 12, 60, 12) + L(26, 52, 60, 52);
            // S/D 標籤一律放在各自引線「上方」，避免被水平引線穿過
            inner += T(-56, -40, 'G1') + T(40, -56, 'S1') + T(40, -16, 'D1');
            inner += T(-56, 28, 'G2') + T(40, 8, 'D2') + T(40, 48, 'S2');
          } else {
            inner = `<rect x="-16" y="-16" width="32" height="32" fill="#e0e7ff" stroke="${sc||'#4338ca'}" stroke-width="${sw}" rx="2"/><text y="5" text-anchor="middle" font-size="9" fill="#4338ca">${c.type==='dualnmos'?'2N':'2P'}</text>`;
          }
          break;
        case 'npn':
        case 'pnp':
          // 顯示 B/C/E 腳位標記
          inner = window.Sym ? Sym.npn(0, 0, { color: sc || undefined, pnp: c.type === 'pnp', showPins: true })
            : `<rect x="-16" y="-16" width="32" height="32" fill="#fee2e2" stroke="${sc||'#dc2626'}" stroke-width="${sw}" rx="2"/><text y="5" text-anchor="middle" font-size="9" fill="#dc2626">${c.type.toUpperCase()}</text>`;
          break;
        case 'opamp':
          inner = `<polygon points="-18,-18 -18,18 18,0" fill="#fef3c7" stroke="${sc||'#92400e'}" stroke-width="${sw}"/>`;
          if (window.Sym) {
            inner += Sym.txt(-12, -4, '+', { size: 11, raw: true }) + Sym.txt(-12, 11, '−', { size: 11, raw: true });
          }
          break;
        case 'comparator': {
          // 比較器(SC70-5)：三角 + 遲滯glyph，5腳 1/2 輸入、4 輸出、5 頂VCC、3 底GND
          const cc = sc || Sym.color || '#1f4fd1';
          inner = `<polygon points="-18,-18 -18,18 18,0" fill="#fff" stroke="${cc}" stroke-width="${sw}"/>`;
          // 遲滯(hysteresis)迴圈符號
          inner += `<path d="M -7 3 L 1 3 L 1 -3 L 7 -3 M 7 -3 L -1 -3 L -1 3 L -7 3" fill="none" stroke="${cc}" stroke-width="1.4"/>`;
          if (window.Sym) {
            const N = (x, y, s, a) => Sym.txt(x, y, s, { size: 8, anchor: a || 'middle', fill: '#64748b' });
            // 輸入/輸出/電源引線
            inner += Sym.line(-28, -7, -18, -7, { color: sc || undefined }) + Sym.line(-28, 7, -18, 7, { color: sc || undefined });
            inner += Sym.line(18, 0, 28, 0, { color: sc || undefined });
            inner += Sym.line(0, -9, 0, -30, { color: sc || undefined }) + Sym.line(0, 9, 0, 30, { color: sc || undefined });
            // 極性 + 腳位編號
            inner += Sym.txt(-14, -9, '+', { size: 9, raw: true }) + Sym.txt(-14, 13, '−', { size: 9, raw: true });
            inner += N(-31, -9, '1', 'end') + N(-31, 5, '2', 'end') + N(32, -3, '4', 'start') + N(0, -33, '5') + N(0, 40, '3');
          }
          break;
        }
        case 'dcdc':
          inner = `<rect x="-18" y="-12" width="36" height="24" fill="#fef3c7" stroke="${sc||'#d97706'}" stroke-width="${sw}" rx="3"/><text y="4" text-anchor="middle" font-size="9" fill="#d97706">DC</text>`;
          if (window.Sym) {
            const dt = (x, y, s, a) => Sym.txt(x, y, s, { size: 7, anchor: a, fill: '#64748b' });
            inner += dt(-20, -3, 'VIN', 'end') + dt(-20, 10, 'GND', 'end') + dt(20, -3, 'VOUT', 'start') + dt(20, 10, 'FB', 'start');
          }
          break;
        case 'and': case 'or': case 'nand': case 'nor':
        case 'xor': case 'xnor': case 'not': case 'buffer':
          if (window.Sym) {
            const oneIn = (c.type === 'not' || c.type === 'buffer');
            const lc = sc || undefined;
            const N = (x, y, s, a) => Sym.txt(x, y, s, { size: 8, anchor: a || 'middle', fill: '#64748b' });
            inner = Sym.gate(0, 0, { type: c.type, color: lc });
            // 5pin SC70：頂(5,VCC)/底(3,GND) 電源引線
            inner += Sym.line(0, -15, 0, -30, { color: lc }) + Sym.line(0, 15, 0, 30, { color: lc });
            // 腳位編號
            if (oneIn) { inner += N(-31, -2, '1', 'end'); }
            else { inner += N(-31, -9, '1', 'end') + N(-31, 5, '2', 'end'); }
            inner += N(32, -3, '4', 'start') + N(0, -33, '5') + N(0, 40, '3');
          } else {
            inner = `<rect x="-16" y="-14" width="32" height="28" fill="#fff" stroke="${sc||'#1f4fd1'}" stroke-width="${sw}"/>`;
          }
          break;
      }

      return `<g transform="${rot}" data-id="${c.id}">${inner}</g>`;
    }).join('');

    // 翻轉的元件：把符號內部文字(G/D/S、腳位編號等)反轉回正向，避免鏡像字
    this.state.components.forEach(c => {
      if (!c.flipH && !c.flipV) return;
      const g = this.els.componentLayer.querySelector(`[data-id="${c.id}"]`);
      if (!g) return;
      const fx = c.flipH ? -1 : 1, fy = c.flipV ? -1 : 1;
      g.querySelectorAll('text').forEach(t => {
        const tx = parseFloat(t.getAttribute('x')) || 0, ty = parseFloat(t.getAttribute('y')) || 0;
        t.setAttribute('transform', `translate(${tx},${ty}) scale(${fx},${fy}) translate(${-tx},${-ty})`);
      });
    });
  },

  renderOverlays() {
    if (!this.state.showLabels && !this.state.showReadings) {
      this.els.overlayLayer.innerHTML = '';
      return;
    }

    let html = '';
    this.state.components.forEach(c => {
      if (this.state.showLabels) {
        const lx = c.x + (c.labelDx || 0);              // 可拖曳微調
        const ly = c.y + this.labelOffset(c) + (c.labelDy || 0);
        html += `<text data-label="${c.id}" x="${lx}" y="${ly}" text-anchor="middle" font-size="10" fill="#475569" style="cursor:move">${c.label || ''}</text>`;
        if (c.value) {
          html += `<text data-label="${c.id}" x="${lx}" y="${ly + 12}" text-anchor="middle" font-size="9" fill="#94a3b8" style="cursor:move">${this.formatValue(c)}</text>`;
        }
      }
    });
    this.els.overlayLayer.innerHTML = html;
  },

  // 元件標籤(Q1/M1...)的垂直偏移：高元件要放更下面才不被符號蓋住
  labelOffset(c) {
    const type = (typeof c === 'string') ? c : c.type;
    if (type === 'ic') {
      const lay = window.CircuitEngine ? window.CircuitEngine.icLayout(c) : { h: 50 };
      // 底部腳名垂直向下延伸 → 標號要落在其下方，避免壓字
      const B = (c.icPins || []).filter(p => (p.side || '').toUpperCase() === 'B');
      const maxLen = B.reduce((m, p) => Math.max(m, String(p.name || '').length), 0);
      const ext = maxLen > 0 ? maxLen * 7 + 24 : 16;   // 粗估垂直名長 + 餘裕
      return lay.h / 2 + ext;
    }
    if (type === 'dualnmos' || type === 'dualpmos') return 92;
    if (type === 'npn' || type === 'pnp') return 50;
    if (type === 'nmos' || type === 'pmos') return 44;
    if (['and', 'or', 'nand', 'nor', 'xor', 'xnor', 'not', 'buffer', 'comparator'].includes(type)) return 50;
    if (type === 'capacitor' || type === 'source') return 36; // 垂直二端元件：避開底端點
    return 28;
  },

  // 點到標籤(label/value 文字)回傳元件，否則 null
  hitTestLabel(x, y) {
    if (!this.state.showLabels) return null;
    const comps = this.state.components;
    for (let i = comps.length - 1; i >= 0; i--) {
      const c = comps[i];
      const lx = c.x + (c.labelDx || 0);
      const ly = c.y + this.labelOffset(c) + (c.labelDy || 0);
      const label = c.label || '', val = c.value ? this.formatValue(c) : '';
      const w = Math.max(label.length, val.length) * 6.2 + 10;
      if (x >= lx - w / 2 && x <= lx + w / 2 && y >= ly - 11 && y <= ly + (val ? 15 : 3)) return c;
    }
    return null;
  },

  // ---- 自訂 IC 建立 ----
  openIcBuilder() {
    document.getElementById('icBuilderModal').hidden = false;
  },
  closeIcBuilder() {
    document.getElementById('icBuilderModal').hidden = true;
  },
  // 解析 pin 表：每行「num,name[,side[,type]]」；side=L/R/T/B；# 開頭為註解
  parseIcPins(text) {
    const pins = [];
    (text || '').split(/\r?\n/).forEach(line => {
      const s = line.trim();
      if (!s || s[0] === '#') return;
      const parts = s.split(/[,\t]/).map(x => x.trim());
      if (!parts[0]) return;
      pins.push({ num: parts[0], name: parts[1] || '', side: (parts[2] || '').toUpperCase(), type: parts[3] || '' });
    });
    return pins;
  },
  createIcFromForm() {
    const name = (document.getElementById('icbName').value || 'IC').trim();
    const pins = this.parseIcPins(document.getElementById('icbPins').value);
    if (!pins.length) { this.showToast('請輸入至少一支 pin'); return; }
    this.saveUndo();
    const vb = this.getViewBox();
    const id = 'c' + (++this.state.componentIdCounter);
    this.state.components.push({
      id, type: 'ic', name, x: this.snapG(vb.x + vb.w / 2), y: this.snapG(vb.y + vb.h / 2),
      rotation: 0, label: 'U' + this.state.componentIdCounter, icPins: pins,
      color: this.state.activeColor, scale: this.state.activeSize
    });
    this.setSelection([id]);
    this.render();
    this.closeIcBuilder();
    this.showToast(`已建立 ${name}（${pins.length} 腳）`);
  },
  async prefillIcFromPdf(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (typeof PDFParser === 'undefined') { this.showToast('PDF 解析器未載入'); return; }
    this.showToast('解析 PDF 中...');
    try {
      const res = await PDFParser.extractPinInfo(file);
      const lines = (res.pins || []).map(p => `${p.number},${p.name}`).join('\n');
      const ta = document.getElementById('icbPins');
      ta.value = lines || ta.value;
      if (!document.getElementById('icbName').value) document.getElementById('icbName').value = file.name.replace(/\.[^.]+$/, '');
      this.showToast(`預填 ${res.pins ? res.pins.length : 0} 腳，請校正後建立`);
    } catch (err) { this.showToast('PDF 解析失敗：' + err.message); }
    e.target.value = '';
  },

  showToast(message, duration = 3000) {
    const host = document.querySelector('#toastHost');
    const template = document.querySelector('#toastTemplate');
    if (!host || !template) return;

    const toast = template.content.cloneNode(true).querySelector('.toast');
    toast.textContent = message;
    host.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, duration);
  }
};

// Initialize
app.init();
