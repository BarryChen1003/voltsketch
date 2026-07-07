/**
 * ic-data.js — IC 元件庫資料（前端 JSON，版本控制、改檔即更新）
 * 每顆 IC schema：
 *   part, mfr, category, subcategory, package, desc, datasheet
 *   pins: [{ num, name, side:'L'|'R'|'T'|'B' }]  // 每邊依陣列順序：L/R 上→下、T/B 左→右
 *                                                 // name 中 {…} = 上劃線(active-low)
 *   thermalPad: { name } | null                  // 底部外露焊墊 → 自動補一支 GND 腳
 *   specs: [{ k, v }]                            // 重點規格（抓 datasheet 重點）
 *   secondSource: [ '替換需一致的條件…' ]          // 2nd-source 比較準則
 *   altParts: [ '同系列/可參考替代' ]
 */

// TI 產品大類（建檔分類用）
window.IC_CATEGORIES = [
  { id: 'amplifiers', label: 'Amplifiers 放大器' },
  { id: 'audio', label: 'Audio, haptics & piezo 音訊/觸覺/壓電' },
  { id: 'clocks', label: 'Clocks & timing 時脈/計時' },
  { id: 'dlp', label: 'DLP products' },
  { id: 'data-converters', label: 'Data converters 資料轉換器 (ADC/DAC/AFE)' },
  { id: 'die-wafer', label: 'Die & wafer services' },
  { id: 'interface', label: 'Interface 介面 (USB/Ethernet/CAN/RS-485)' },
  { id: 'isolation', label: 'Isolation 隔離' },
  { id: 'logic', label: 'Logic & voltage translation 邏輯/電平轉換' },
  { id: 'mcu', label: 'MCUs & processors 微控制器/處理器' },
  { id: 'memory', label: 'Memory 記憶體 (Flash/EEPROM/DRAM)' },
  { id: 'motor', label: 'Motor drivers 馬達驅動' },
  { id: 'power', label: 'Power management 電源管理' },
  { id: 'rf', label: 'RF & microwave 射頻/微波 (含 mmWave 雷達)' },
  { id: 'sensors', label: 'Sensors 感測器' },
  { id: 'switch-mux', label: 'Switch & multiplexers 開關/多工器' },
  { id: 'wireless', label: 'Wireless connectivity 無線連線' },
  { id: 'cpu', label: 'CPU / Processors / FPGA' }
];

window.IC_DATA = [
  {
    part: 'ADS112C14',
    mfr: 'Texas Instruments',
    category: 'data-converters',
    subcategory: 'Precision ADC (Delta-Sigma, I2C)',
    package: 'WQFN-16 (RTE) 3.0×3.0mm',
    // 頂端簡述：是什麼 / 功用 / 用在哪
    whatIs: '精密類比數位轉換器（ADC）：把類比電壓轉成 16 或 24 位元數位值，I2C 介面、可接 8 路輸入。',
    func: '把感測器微小類比訊號高解析度數位化，整合 PGA、可程式基準、雙電流源、溫度感測器，省外部元件。架構為 Delta-Sigma（Δ-Σ，又稱 Sigma-Delta）：以遠高於訊號頻率的速度過取樣，再用噪聲整形把量化噪聲推到高頻濾掉，換取極高解析度；適合「慢速但要很準」的量測（溫度、電橋、壓力）。',
    usedIn: '工業感測前端（RTD/熱電偶測溫、壓力/應變電橋、流量）、PLC/DCS 類比輸入模組、溫控器、患者監測（體溫/血壓）。',
    desc: '16/24-bit、8 通道、64kSPS Δ-Σ ADC，含 PGA、可程式基準、雙電流源、溫度感測器與 I2C 介面；少元件數的感測量測前端。',
    datasheet: 'IC-spec/ads112c14.pdf',
    pins: [
      // 左（上→下）
      { num: 1, name: 'AIN0', side: 'L', type: 'Analog In', desc: '類比輸入 0' },
      { num: 2, name: 'AIN1', side: 'L', type: 'Analog In', desc: '類比輸入 1' },
      { num: 3, name: 'AIN2', side: 'L', type: 'Analog In', desc: '類比輸入 2' },
      { num: 4, name: 'AIN3', side: 'L', type: 'Analog In', desc: '類比輸入 3' },
      // 下（左→右）
      { num: 5, name: 'AIN4/REFP/GPIO0', side: 'B', type: 'Analog In / Digital I/O', desc: '類比輸入 4；外部基準正端 REFP；GPIO0（推挽/開汲）' },
      { num: 6, name: 'AIN5/REFN/GPIO1', side: 'B', type: 'Analog In / Digital I/O', desc: '類比輸入 5；外部基準負端 REFN；GPIO1' },
      { num: 7, name: 'AIN6/GPIO2/{FAULT}', side: 'B', type: 'Analog In / Digital I/O', desc: '類比輸入 6；GPIO2；可設為 FAULT 輸出（active-low）' },
      { num: 8, name: 'AIN7/GPIO3/{DRDY}/CLK', side: 'B', type: 'Analog In / Digital I/O', desc: '類比輸入 7；GPIO3；DRDY 資料就緒/外部 CLK 輸入' },
      // 右（上→下）
      { num: 12, name: 'SCL', side: 'R', type: 'Digital In', desc: 'I2C 串列時脈；上拉至 DVDD（準位以 DVDD 為基準）' },
      { num: 11, name: 'SDA', side: 'R', type: 'Digital I/O（開汲）', desc: 'I2C 串列資料（開汲輸出）；上拉至 DVDD' },
      { num: 10, name: 'A1', side: 'R', type: 'Digital In', desc: 'I2C 位址選擇腳 1' },
      { num: 9, name: 'A0', side: 'R', type: 'Digital In', desc: 'I2C 位址選擇腳 0' },
      // 上（左→右）；EP/GND 第 17 腳當正常邊腳，放在 pin16 旁（可接線、不放中央）
      { num: 17, name: 'GND', side: 'T', type: 'Ground（EP）', desc: '外露焊墊 (EP)；datasheet 指定接 GND', ep: true },
      { num: 16, name: 'REFOUT', side: 'T', type: 'Analog Out', desc: '內部基準輸出；接 100nF 到 GND' },
      { num: 15, name: 'AVDD', side: 'T', type: 'Power（類比）', desc: '類比供電；接 100nF 到 GND' },
      { num: 14, name: 'GND', side: 'T', type: 'Ground', desc: '接地' },
      { num: 13, name: 'DVDD', side: 'T', type: 'Power（數位）', desc: '數位供電；接 100nF 到 GND' }
    ],
    // EP 已列為 pin 17（無中央散熱墊圖示）。無電氣功能的料則設 null、不產生 17 腳。
    thermalPad: null,
    specs: [
      { k: '解析度', v: '16-bit (ADS112C14) / 24-bit (ADS122C14)' },
      { k: '架構', v: 'Delta-Sigma (ΔΣ)' },
      { k: '通道', v: '8 輸入多工 (MUX)；可差動/單端' },
      { k: '最高取樣率', v: '64 kSPS（20SPS~64kSPS 可程式）' },
      { k: 'PGA 增益', v: '0.5 ~ 256' },
      { k: '類比供電 AVDD', v: '1.74 ~ 3.6 V' },
      { k: '數位供電 DVDD', v: '1.65 ~ 3.6 V' },
      { k: '功耗', v: '最低 ~57 µA' },
      { k: '內部基準', v: '1.25 / 2.5 V，25 ppm/°C (max)' },
      { k: '介面', v: 'I2C（Sm/Fm/Fm+），8 個腳位可程式位址' },
      { k: '整合功能', v: '溫度感測器、1% 振盪器、雙匹配電流源、4× GPIO、CRC' },
      { k: '線頻抑制', v: '20/25 SPS 同時 50/60 Hz、單週期穩定' },
      { k: '工作溫度', v: 'Specified −40~+125°C（Operating −50~+125°C）' },
      { k: '封裝', v: 'WQFN-16 (RTE) 3.0×3.0mm / DSBGA-16 (YBH)' }
    ],
    secondSource: [
      '封裝 + pinout 相容（WQFN-16 RTE、pin-to-pin）',
      '解析度 ≥ 16-bit（或符合需求）',
      '輸入通道數 ≥ 8、MUX 配置相容',
      '介面同為 I2C（Sm/Fm/Fm+）、位址腳 A0/A1 相容',
      'AVDD/DVDD 範圍涵蓋（1.74~3.6 / 1.65~3.6 V）',
      'PGA 增益範圍涵蓋（0.5~256）',
      '取樣率 ≥ 需求（≤64kSPS）',
      '噪聲 / ENOB 同等或更佳（同增益與資料率下）',
      '內部基準電壓與溫漂同等（或改用外部基準）',
      '工作溫度範圍涵蓋（−40~+125°C）',
      '50/60Hz 同時抑制能力（若量測需要）',
      '電流源 / 溫度感測器 / GPIO（若有用到）',
      '靜態 / 啟動電流、CRC、認證（車規 AEC-Q100，若需）'
    ],
    // pin-to-pin 相容、可直接替換（同封裝同腳位）
    dropIn: [
      { part: 'ADS122C14', note: '同 RTE WQFN-16、腳位完全相同（24-bit 版）' }
    ]
  },
  {
    part: 'ISO7741U',
    mfr: 'Texas Instruments',
    category: 'isolation',
    subcategory: '四通道數位隔離器 (3 順向 / 1 反向)',
    package: 'SOP (DUW-16) Ultra-Wide',
    whatIs: '四通道數位隔離器：在兩個電氣獨立的電源域之間傳遞數位訊號，中間用 SiO2 絕緣層阻隔（不導電但能傳訊號）。',
    func: '讓低壓控制側（MCU）與高壓/高雜訊側電氣完全隔離，又能互傳數位訊號（3 通道順向 + 1 通道反向）。防止接地迴路、突波、共模暫態損壞 MCU；速度快（50Mbps）、抗共模暫態強（CMTI）。不是 ADC/DAC，是「數位訊號的電氣防火牆」。',
    usedIn: '隔離式電源回授、馬達/閘極驅動的隔離、工業通訊（RS-485/CAN/SPI）隔離、醫療設備、電池管理系統(BMS)。',
    desc: '四通道(3F/1R)數位隔離器，SiO2 阻障，50Mbps、1500VRMS 隔離、CMTI ±100kV/μs。',
    datasheet: 'IC-spec/iso7741u.pdf',
    pins: [
      { num: 1, name: 'INC', side: 'L', type: 'Digital In', desc: '通道 C 輸入（側 1）' },
      { num: 2, name: 'OUTD', side: 'L', type: 'Digital Out', desc: '通道 D 輸出（側 1；反向通道）' },
      { num: 3, name: 'EN1', side: 'L', type: 'Digital In', desc: '側 1 輸出致能；高或開路致能，低則高阻抗' },
      { num: 4, name: 'GND1', side: 'L', type: 'Ground', desc: '側 1 接地（VCC1 參考）' },
      { num: 5, name: 'GND2', side: 'L', type: 'Ground', desc: '側 2 接地（VCC2 參考）' },
      { num: 6, name: 'EN2', side: 'L', type: 'Digital In', desc: '側 2 輸出致能' },
      { num: 7, name: 'IND', side: 'L', type: 'Digital In', desc: '通道 D 輸入（側 2；反向通道）' },
      { num: 8, name: 'OUTC', side: 'L', type: 'Digital Out', desc: '通道 C 輸出（側 2）' },
      { num: 16, name: 'INB', side: 'R', type: 'Digital In', desc: '通道 B 輸入（側 1）' },
      { num: 15, name: 'INA', side: 'R', type: 'Digital In', desc: '通道 A 輸入（側 1）' },
      { num: 14, name: 'GND1', side: 'R', type: 'Ground', desc: '側 1 接地' },
      { num: 13, name: 'VCC1', side: 'R', type: 'Power', desc: '側 1 電源（2.25~5.5V）；接 100nF 到 GND1' },
      { num: 12, name: 'VCC2', side: 'R', type: 'Power', desc: '側 2 電源（2.25~5.5V）；接 100nF 到 GND2' },
      { num: 11, name: 'GND2', side: 'R', type: 'Ground', desc: '側 2 接地' },
      { num: 10, name: 'OUTA', side: 'R', type: 'Digital Out', desc: '通道 A 輸出（側 2）' },
      { num: 9, name: 'OUTB', side: 'R', type: 'Digital Out', desc: '通道 B 輸出（側 2）' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '四通道數位隔離器（3 順向 + 1 反向）' },
      { k: '隔離阻障', v: 'SiO2；1500 VRMS / 2121 VDC 工作電壓' },
      { k: '突波耐受', v: '最高 12.8 kV' },
      { k: 'CMTI', v: '±100 kV/µs (min)' },
      { k: '資料速率', v: '最高 50 Mbps' },
      { k: '傳播延遲', v: '13 ns (typ @5V)' },
      { k: '供電範圍', v: '2.25 ~ 5.5 V（兩側獨立）' },
      { k: '預設輸出', v: 'ISO7741U 預設高；ISO7741UF 預設低' },
      { k: '工作溫度', v: '−40 ~ +125°C' },
      { k: '封裝', v: 'SOP (DUW-16) Ultra-Wide' }
    ],
    secondSource: [
      '封裝 + pinout 相容（DUW-16、pin-to-pin）',
      '通道數與方向相同（4 通道、3 順向/1 反向）',
      '隔離等級涵蓋（VRMS/VDC 工作電壓、突波 kV）',
      'CMTI ≥ 需求',
      '資料速率 ≥ 需求（≤50Mbps）',
      '兩側供電範圍涵蓋（2.25~5.5V）',
      '傳播延遲 / 脈寬失真 同等或更佳',
      '預設輸出狀態相同（高/低，default 與 fail-safe）',
      '工作溫度範圍涵蓋（−40~+125°C）',
      '認證等級（UL/VDE/CSA、功能安全，若需）'
    ],
    dropIn: []
  },
  {
    part: 'AMC0200D',
    mfr: 'Texas Instruments',
    category: 'isolation',
    subcategory: '隔離放大器 (固定增益、差動輸出)',
    package: 'SOIC-8 (D)',
    whatIs: '隔離放大器：把高壓側的微小類比訊號（±250mV，例如電流分流電阻上的壓降）放大並「跨過電氣隔離」送到低壓側，兩側電源完全分開。',
    func: '量測高壓母線上的電流/電壓時，用分流電阻產生 ±250mV，AMC0200D 以固定 8.2V/V 增益放大成差動輸出，同時提供基本隔離（AMC0300D 為加強隔離）。讓低壓 ADC/MCU 安全讀取高壓側訊號，不被高壓打壞。低失調、低漂移、高 CMTI(150V/ns)。',
    usedIn: '馬達驅動相電流偵測、變頻器/逆變器、電源供應器電流/電壓感測、隔離式電壓量測。',
    desc: '±250mV 輸入、固定增益 8.2V/V、差動輸出的基本/加強隔離放大器（SOIC-8）。',
    datasheet: 'IC-spec/amc0200d.pdf',
    pins: [
      { num: 1, name: 'VDD1', side: 'L', type: 'Power', desc: '高壓側電源（3.0~5.5V）' },
      { num: 2, name: 'INP', side: 'L', type: 'Analog In', desc: '非反相類比輸入（+，接分流電阻一端）' },
      { num: 3, name: 'INN', side: 'L', type: 'Analog In', desc: '反相類比輸入（−，接分流電阻另一端）' },
      { num: 4, name: 'GND1', side: 'L', type: 'Ground', desc: '高壓側類比地' },
      { num: 8, name: 'VDD2', side: 'R', type: 'Power', desc: '低壓側電源（3.0~5.5V）' },
      { num: 7, name: 'OUTP', side: 'R', type: 'Analog Out', desc: '非反相類比輸出（+）' },
      { num: 6, name: 'OUTN', side: 'R', type: 'Analog Out', desc: '反相類比輸出（−）' },
      { num: 5, name: 'GND2', side: 'R', type: 'Ground', desc: '低壓側類比地' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '固定增益隔離放大器、差動輸出' },
      { k: '輸入範圍', v: '±250 mV（線性）' },
      { k: '固定增益', v: '8.2 V/V' },
      { k: '隔離', v: 'AMC0200D 基本 / AMC0300D 加強' },
      { k: '供電', v: 'VDD1 / VDD2 各 3.0 ~ 5.5 V' },
      { k: '失調誤差', v: '±0.2 mV (max)、漂移 ±2 µV/°C' },
      { k: '增益誤差', v: '±0.25% (max)、漂移 ±35 ppm/°C' },
      { k: '非線性', v: '0.04% (max)' },
      { k: 'CMTI', v: '150 V/ns (min)' },
      { k: 'EMI', v: '符合 CISPR-11 / CISPR-25' },
      { k: '封裝', v: 'SOIC-8 (D)' }
    ],
    secondSource: [
      '封裝 + pinout 相容（SOIC-8、pin-to-pin）',
      '輸入範圍涵蓋（±250mV）、固定增益相同（8.2V/V）',
      '隔離等級涵蓋（基本/加強、工作電壓、CMTI）',
      '兩側供電範圍涵蓋（3.0~5.5V）',
      '失調 / 增益誤差 / 漂移 / 非線性 同等或更佳',
      '差動輸出共模與擺幅相容（對應後級 ADC）',
      '工作溫度範圍涵蓋',
      '認證（UL/VDE/CSA、汽車 AEC-Q100，若需）'
    ],
    dropIn: [
      { part: 'AMC0300D', note: '同一系列、同 SOIC-8 腳位；加強隔離版（升級用，功能/腳位相同）' }
    ]
  },
  {
    part: 'AMC0200R', mfr: 'Texas Instruments', category: 'isolation',
    subcategory: '隔離放大器 (固定增益、單端輸出 + REFIN)', package: 'SOIC-8 (D)',
    whatIs: '隔離放大器（單端輸出版）：把高壓側 ±250mV 類比訊號放大、跨隔離送到低壓側；單端輸出、輸出參考點由 REFIN 設定。',
    func: '同 AMC0200D 用途（量高壓側電流/電壓），但輸出為單端，可用 REFIN 設定輸出中心電位，方便接單端 ADC。加強隔離。',
    usedIn: '馬達相電流偵測、電源電流/電壓感測、需單端輸出對接 ADC 的隔離量測。',
    desc: '±250mV 輸入、固定增益、單端輸出（含 REFIN）的加強隔離放大器（SOIC-8）。',
    datasheet: 'IC-spec/amc0200r.pdf',
    pins: [
      { num: 1, name: 'VDD1', side: 'L', type: 'Power', desc: '高壓側電源（3.0~5.5V）' },
      { num: 2, name: 'INP', side: 'L', type: 'Analog In', desc: '非反相類比輸入（+）' },
      { num: 3, name: 'INN', side: 'L', type: 'Analog In', desc: '反相類比輸入（−）' },
      { num: 4, name: 'GND1', side: 'L', type: 'Ground', desc: '高壓側類比地' },
      { num: 8, name: 'VDD2', side: 'R', type: 'Power', desc: '低壓側電源（3.0~5.5V）' },
      { num: 7, name: 'OUT', side: 'R', type: 'Analog Out', desc: '單端類比輸出' },
      { num: 6, name: 'REFIN', side: 'R', type: 'Analog In', desc: '輸出參考電位輸入（設定輸出中心）' },
      { num: 5, name: 'GND2', side: 'R', type: 'Ground', desc: '低壓側類比地' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '固定增益隔離放大器、單端輸出 + REFIN' },
      { k: '輸入範圍', v: '±250 mV' }, { k: '固定增益', v: '見 datasheet（精值待補）' },
      { k: '隔離', v: '加強 (Reinforced)' }, { k: '供電', v: 'VDD1 / VDD2 各 3.0~5.5 V' },
      { k: '封裝', v: 'SOIC-8 (D)' }
    ],
    secondSource: ['封裝 + pinout 相容（SOIC-8、含 REFIN 腳）', '輸入範圍涵蓋（±250mV）、固定增益相同', '隔離等級涵蓋', '供電範圍涵蓋（3.0~5.5V）', '失調/增益誤差/漂移 同等或更佳', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'AMC0202D', mfr: 'Texas Instruments', category: 'isolation',
    subcategory: '隔離放大器 (±50mV 輸入、差動輸出)', package: 'SOIC-8 (D)',
    whatIs: '隔離放大器（±50mV 輸入版）：放大更小的分流壓降（適合大電流、低阻值分流電阻），差動輸出、跨隔離送到低壓側。',
    func: '與 AMC0200D 同腳位，但輸入範圍 ±50mV（搭配更小的分流電阻、降低功耗發熱）。差動輸出、加強隔離。',
    usedIn: '大電流馬達驅動相電流偵測、低阻值分流電阻電流量測、逆變器。',
    desc: '±50mV 輸入、固定增益、差動輸出的加強隔離放大器（SOIC-8，與 AMC0200D 同腳位）。',
    datasheet: 'IC-spec/amc0202d.pdf',
    pins: [
      { num: 1, name: 'VDD1', side: 'L', type: 'Power', desc: '高壓側電源（3.0~5.5V）' },
      { num: 2, name: 'INP', side: 'L', type: 'Analog In', desc: '非反相類比輸入（+）' },
      { num: 3, name: 'INN', side: 'L', type: 'Analog In', desc: '反相類比輸入（−）' },
      { num: 4, name: 'GND1', side: 'L', type: 'Ground', desc: '高壓側類比地' },
      { num: 8, name: 'VDD2', side: 'R', type: 'Power', desc: '低壓側電源（3.0~5.5V）' },
      { num: 7, name: 'OUTP', side: 'R', type: 'Analog Out', desc: '非反相類比輸出（+）' },
      { num: 6, name: 'OUTN', side: 'R', type: 'Analog Out', desc: '反相類比輸出（−）' },
      { num: 5, name: 'GND2', side: 'R', type: 'Ground', desc: '低壓側類比地' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '固定增益隔離放大器、差動輸出' }, { k: '輸入範圍', v: '±50 mV' },
      { k: '固定增益', v: '見 datasheet（精值待補）' }, { k: '隔離', v: '加強 (Reinforced)' },
      { k: '供電', v: 'VDD1 / VDD2 各 3.0~5.5 V' }, { k: '封裝', v: 'SOIC-8 (D)' }
    ],
    secondSource: ['封裝 + pinout 相容（SOIC-8、差動輸出）', '輸入範圍相同（±50mV）、固定增益相同', '隔離等級涵蓋', '供電範圍涵蓋', '失調/增益誤差/漂移/非線性 同等或更佳', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'AMC0306M05-Q1', mfr: 'Texas Instruments', category: 'isolation',
    subcategory: '隔離 Δ-Σ 調變器 (±50mV、車規)', package: 'SOIC-8',
    whatIs: '隔離式 Delta-Sigma 調變器：把高壓側 ±50mV 類比訊號直接轉成「跨隔離的數位位元流(DOUT)」，外部時脈 CLKIN 同步；不是放大器，是「隔離 + ADC 前端」二合一。',
    func: '高壓側電流/電壓量測：分流壓降 → 內部 ΔΣ 調變成 1-bit 位元流，經隔離送到低壓側，由 MCU/FPGA 的 sinc 濾波器解出數值。省去類比隔離放大器 + 外部 ADC。車規 (Q1)、加強隔離。',
    usedIn: '車用/工業馬達逆變器相電流偵測、隔離電壓量測、需數位輸出的隔離量測。',
    desc: '±50mV 輸入、數位位元流輸出(DOUT/CLKIN) 的車規加強隔離 ΔΣ 調變器（SOIC-8）。',
    datasheet: 'IC-spec/amc0306m05-q1.pdf',
    pins: [
      { num: 1, name: 'AVDD', side: 'L', type: 'Power', desc: '高壓側類比電源（3.0~5.5V）' },
      { num: 2, name: 'INP', side: 'L', type: 'Analog In', desc: '非反相類比輸入（+）' },
      { num: 3, name: 'INN', side: 'L', type: 'Analog In', desc: '反相類比輸入（−）' },
      { num: 4, name: 'AGND', side: 'L', type: 'Ground', desc: '高壓側類比地' },
      { num: 8, name: 'DVDD', side: 'R', type: 'Power', desc: '低壓側數位電源' },
      { num: 7, name: 'CLKIN', side: 'R', type: 'Digital In', desc: '外部時脈輸入（ΔΣ 取樣同步）' },
      { num: 6, name: 'DOUT', side: 'R', type: 'Digital Out', desc: 'ΔΣ 數位位元流輸出' },
      { num: 5, name: 'DGND', side: 'R', type: 'Ground', desc: '低壓側數位地' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '隔離 Δ-Σ 調變器（數位位元流輸出）' }, { k: '輸入範圍', v: '±50 mV' },
      { k: '輸出', v: '1-bit ΔΣ 位元流 DOUT（需 CLKIN，外部時脈）' }, { k: '隔離', v: '加強 (Reinforced)' },
      { k: '認證', v: '車規 AEC-Q100 (Q1)' }, { k: '供電', v: '3.0~5.5 V' }, { k: '封裝', v: 'SOIC-8' }
    ],
    secondSource: ['封裝 + pinout 相容（SOIC-8、CLKIN 外部時脈型）', '輸入範圍相同（±50mV）', '輸出協定相同（ΔΣ 位元流、外部 CLKIN）', '隔離等級涵蓋', '時脈頻率範圍涵蓋', '車規認證等級涵蓋（Q1）', '供電/溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'AMC1333M10-Q1', mfr: 'Texas Instruments', category: 'isolation',
    subcategory: '隔離 Δ-Σ 調變器 (±1V、內部時脈、車規)', package: 'SOIC-8',
    whatIs: '隔離式 Delta-Sigma 調變器（±1V 輸入、內部時脈版）：把高壓側 ±1V 類比訊號轉成跨隔離的數位位元流(DOUT)，並由 CLKOUT 輸出內部時脈給後級同步。',
    func: '與 AMC0306 類似但輸入範圍大（±1V，適合電壓量測或高壓分壓後輸入），且內建時脈（CLKOUT 主動輸出，不需外部餵時脈）。車規、加強隔離。',
    usedIn: '車用/工業隔離電壓量測、HV 電池/逆變器 DC-link 電壓監測、需自帶時脈的隔離 ΔΣ 量測。',
    desc: '±1V 輸入、內部時脈(CLKOUT)、數位位元流輸出的車規加強隔離 ΔΣ 調變器（SOIC-8）。',
    datasheet: 'IC-spec/amc1333m10-q1.pdf',
    pins: [
      { num: 1, name: 'AVDD', side: 'L', type: 'Power', desc: '高壓側類比電源' },
      { num: 2, name: 'INP', side: 'L', type: 'Analog In', desc: '非反相類比輸入（+）' },
      { num: 3, name: 'INN', side: 'L', type: 'Analog In', desc: '反相類比輸入（−）' },
      { num: 4, name: 'AGND', side: 'L', type: 'Ground', desc: '高壓側類比地' },
      { num: 8, name: 'DVDD', side: 'R', type: 'Power', desc: '低壓側數位電源' },
      { num: 7, name: 'CLKOUT', side: 'R', type: 'Digital Out', desc: '內部時脈輸出（給後級同步）' },
      { num: 6, name: 'DOUT', side: 'R', type: 'Digital Out', desc: 'ΔΣ 數位位元流輸出' },
      { num: 5, name: 'DGND', side: 'R', type: 'Ground', desc: '低壓側數位地' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '隔離 Δ-Σ 調變器（內部時脈、數位位元流輸出）' }, { k: '輸入範圍', v: '±1 V' },
      { k: '輸出', v: 'DOUT 位元流 + CLKOUT 內部時脈（不需外部餵時脈）' }, { k: '隔離', v: '加強 (Reinforced)' },
      { k: '認證', v: '車規 AEC-Q100 (Q1)' }, { k: '封裝', v: 'SOIC-8' }
    ],
    secondSource: ['封裝 + pinout 相容（SOIC-8、CLKOUT 內部時脈型）', '輸入範圍相同（±1V）', '輸出協定相同（ΔΣ 位元流 + 內部時脈 CLKOUT）', '隔離等級涵蓋', '車規認證等級涵蓋（Q1）', '供電/溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'AMC0206M05-Q1', mfr: 'Texas Instruments', category: 'isolation',
    subcategory: '隔離 Δ-Σ 調變器 (±50mV、外部時脈、車規)', package: 'SOIC-8',
    whatIs: '隔離式 Delta-Sigma 調變器：把高壓側 ±50mV 類比訊號直接轉成跨隔離的數位位元流(DOUT)，外部時脈 CLKIN 同步。基本/加強隔離選項、車規。',
    func: '高壓側電流量測（分流壓降 ±50mV）→ 內部 ΔΣ 調變成 1-bit 位元流經隔離送低壓側，由 MCU/FPGA sinc 濾波解值。車規 (Q1)。',
    usedIn: '車用/工業馬達逆變器相電流偵測、隔離電流量測。',
    desc: '±50mV 輸入、外部時脈(CLKIN)、數位位元流輸出的車規隔離 ΔΣ 調變器（SOIC-8）。',
    datasheet: 'IC-spec/amc0206m05.pdf',
    pins: [
      { num: 1, name: 'AVDD', side: 'L', type: 'Power', desc: '高壓側類比電源（3.0~5.5V）' },
      { num: 2, name: 'INP', side: 'L', type: 'Analog In', desc: '非反相類比輸入（+）' },
      { num: 3, name: 'INN', side: 'L', type: 'Analog In', desc: '反相類比輸入（−）' },
      { num: 4, name: 'AGND', side: 'L', type: 'Ground', desc: '高壓側類比地' },
      { num: 8, name: 'DVDD', side: 'R', type: 'Power', desc: '低壓側數位電源' },
      { num: 7, name: 'CLKIN', side: 'R', type: 'Digital In', desc: '外部時脈輸入' },
      { num: 6, name: 'DOUT', side: 'R', type: 'Digital Out', desc: 'ΔΣ 數位位元流輸出' },
      { num: 5, name: 'DGND', side: 'R', type: 'Ground', desc: '低壓側數位地' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '隔離 Δ-Σ 調變器（外部時脈、數位位元流）' }, { k: '輸入範圍', v: '±50 mV' },
      { k: '輸出', v: '1-bit ΔΣ 位元流 DOUT（需 CLKIN）' }, { k: '隔離', v: '基本 / 加強選項' },
      { k: '認證', v: '車規 AEC-Q100 (Q1)' }, { k: '供電', v: '3.0~5.5 V' }, { k: '封裝', v: 'SOIC-8' }
    ],
    secondSource: ['封裝 + pinout 相容（SOIC-8、CLKIN 外部時脈型）', '輸入範圍相同（±50mV）', '輸出協定相同（ΔΣ 位元流 + 外部 CLKIN）', '隔離等級涵蓋', '車規認證涵蓋（Q1）', '供電/溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'AMC0236-Q1', mfr: 'Texas Instruments', category: 'isolation',
    subcategory: '隔離 Δ-Σ 調變器 (±1V、Kelvin 感測、車規)', package: 'SOIC-8',
    whatIs: '隔離式 Delta-Sigma 調變器（±1V 輸入版）：把高壓側 ±1V 類比訊號轉成跨隔離的數位位元流(DOUT)；INP/SNSN 為 Kelvin（四線）感測輸入，外部時脈 CLKIN。車規。',
    func: '高壓側電壓/電流量測：±1V 較大輸入適合電壓量測或高阻分壓；SNSN 為感測負端(Kelvin 接法降低走線壓降誤差)。ΔΣ 位元流經隔離送低壓側。車規 (Q1)。',
    usedIn: '車用/工業隔離電壓量測、HV 電池/DC-link 電壓監測、需 Kelvin 感測的精密量測。',
    desc: '±1V 輸入、Kelvin 感測(INP/SNSN)、外部時脈、數位位元流輸出的車規隔離 ΔΣ 調變器（SOIC-8）。',
    datasheet: 'IC-spec/amc0236-q1.pdf',
    pins: [
      { num: 1, name: 'AVDD', side: 'L', type: 'Power', desc: '高壓側類比電源' },
      { num: 2, name: 'INP', side: 'L', type: 'Analog In', desc: '感測正端輸入（+）' },
      { num: 3, name: 'SNSN', side: 'L', type: 'Analog In', desc: '感測負端（Kelvin 感測接法）' },
      { num: 4, name: 'AGND', side: 'L', type: 'Ground', desc: '高壓側類比地' },
      { num: 8, name: 'DVDD', side: 'R', type: 'Power', desc: '低壓側數位電源' },
      { num: 7, name: 'CLKIN', side: 'R', type: 'Digital In', desc: '外部時脈輸入' },
      { num: 6, name: 'DOUT', side: 'R', type: 'Digital Out', desc: 'ΔΣ 數位位元流輸出' },
      { num: 5, name: 'DGND', side: 'R', type: 'Ground', desc: '低壓側數位地' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '隔離 Δ-Σ 調變器（Kelvin 感測、數位位元流）' }, { k: '輸入範圍', v: '±1 V' },
      { k: '輸入', v: 'INP / SNSN（Kelvin 四線感測）' }, { k: '輸出', v: 'DOUT 位元流（需 CLKIN）' },
      { k: '隔離', v: '基本 / 加強選項' }, { k: '認證', v: '車規 AEC-Q100 (Q1)' }, { k: '封裝', v: 'SOIC-8' }
    ],
    secondSource: ['封裝 + pinout 相容（SOIC-8、INP/SNSN Kelvin 型）', '輸入範圍相同（±1V）', '輸出協定相同（ΔΣ 位元流 + CLKIN）', '隔離等級涵蓋', '車規認證涵蓋（Q1）', '供電/溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'AMC0303M0510', mfr: 'Texas Instruments', category: 'isolation',
    subcategory: '隔離 Δ-Σ 調變器 (±50mV、內部時脈)', package: 'SOIC-8',
    whatIs: '隔離式 Delta-Sigma 調變器（±50mV、內部時脈版）：把高壓側 ±50mV 訊號轉成跨隔離數位位元流(DOUT)，並由 CLKOUT 輸出內部時脈給後級同步（不需外部餵時脈）。',
    func: '高壓側電流量測（分流 ±50mV）→ ΔΣ 位元流經隔離送低壓側；內建時脈、CLKOUT 主動輸出。支援 5/10MHz 取樣。',
    usedIn: '工業馬達逆變器相電流偵測、隔離電流量測、需自帶時脈的隔離 ΔΣ 量測。',
    desc: '±50mV 輸入、內部時脈(CLKOUT)、數位位元流輸出的隔離 ΔΣ 調變器（SOIC-8）。',
    datasheet: 'IC-spec/amc0303m0510.pdf',
    pins: [
      { num: 1, name: 'AVDD', side: 'L', type: 'Power', desc: '高壓側類比電源' },
      { num: 2, name: 'INP', side: 'L', type: 'Analog In', desc: '非反相類比輸入（+）' },
      { num: 3, name: 'INN', side: 'L', type: 'Analog In', desc: '反相類比輸入（−）' },
      { num: 4, name: 'AGND', side: 'L', type: 'Ground', desc: '高壓側類比地' },
      { num: 8, name: 'DVDD', side: 'R', type: 'Power', desc: '低壓側數位電源' },
      { num: 7, name: 'CLKOUT', side: 'R', type: 'Digital Out', desc: '內部時脈輸出（給後級同步）' },
      { num: 6, name: 'DOUT', side: 'R', type: 'Digital Out', desc: 'ΔΣ 數位位元流輸出' },
      { num: 5, name: 'DGND', side: 'R', type: 'Ground', desc: '低壓側數位地' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '隔離 Δ-Σ 調變器（內部時脈、數位位元流）' }, { k: '輸入範圍', v: '±50 mV' },
      { k: '輸出', v: 'DOUT 位元流 + CLKOUT 內部時脈' }, { k: '取樣', v: '支援 5 / 10 MHz' },
      { k: '隔離', v: '加強 (Reinforced)' }, { k: '封裝', v: 'SOIC-8' }
    ],
    secondSource: ['封裝 + pinout 相容（SOIC-8、CLKOUT 內部時脈型）', '輸入範圍相同（±50mV）', '輸出協定相同（ΔΣ 位元流 + 內部 CLKOUT）', '隔離等級涵蓋', '取樣時脈頻率涵蓋（5/10MHz）', '供電/溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'ISO7742U', mfr: 'Texas Instruments', category: 'isolation',
    subcategory: '四通道數位隔離器 (2 順向 / 2 反向)', package: 'SOP (DUW-16) Ultra-Wide',
    whatIs: '四通道數位隔離器（2 順向 + 2 反向）：在兩個電氣獨立電源域間傳數位訊號，SiO2 絕緣阻隔；與 ISO7741U 同腳位、差在通道方向配置。',
    func: '與 ISO7741U 相同用途（數位訊號電氣防火牆），但通道方向為 2 順 2 反，適合雙向訊號（如 SPI MOSI/MISO 同向、控制/回授分流）。50Mbps、CMTI ±100kV/µs、加強隔離。',
    usedIn: 'SPI/雙向通訊隔離、馬達/閘極驅動隔離、工業通訊(RS-485/CAN)、BMS、醫療。',
    desc: '四通道(2F/2R)數位隔離器，SiO2 阻障、50Mbps、1500VRMS 隔離（與 ISO7741U 同腳位、通道方向不同）。',
    datasheet: 'IC-spec/iso7742u.pdf',
    pins: [
      { num: 1, name: 'INC', side: 'L', type: 'Digital In', desc: '通道 C 輸入' },
      { num: 2, name: 'OUTD', side: 'L', type: 'Digital Out', desc: '通道 D 輸出' },
      { num: 3, name: 'EN1', side: 'L', type: 'Digital In', desc: '側 1 輸出致能（高/開路致能）' },
      { num: 4, name: 'GND1', side: 'L', type: 'Ground', desc: '側 1 接地' },
      { num: 5, name: 'GND2', side: 'L', type: 'Ground', desc: '側 2 接地' },
      { num: 6, name: 'EN2', side: 'L', type: 'Digital In', desc: '側 2 輸出致能' },
      { num: 7, name: 'IND', side: 'L', type: 'Digital In', desc: '通道 D 輸入' },
      { num: 8, name: 'OUTC', side: 'L', type: 'Digital Out', desc: '通道 C 輸出' },
      { num: 16, name: 'INB', side: 'R', type: 'Digital In', desc: '通道 B 輸入' },
      { num: 15, name: 'INA', side: 'R', type: 'Digital In', desc: '通道 A 輸入' },
      { num: 14, name: 'GND1', side: 'R', type: 'Ground', desc: '側 1 接地' },
      { num: 13, name: 'VCC1', side: 'R', type: 'Power', desc: '側 1 電源（2.25~5.5V）' },
      { num: 12, name: 'VCC2', side: 'R', type: 'Power', desc: '側 2 電源（2.25~5.5V）' },
      { num: 11, name: 'GND2', side: 'R', type: 'Ground', desc: '側 2 接地' },
      { num: 10, name: 'OUTA', side: 'R', type: 'Digital Out', desc: '通道 A 輸出' },
      { num: 9, name: 'OUTB', side: 'R', type: 'Digital Out', desc: '通道 B 輸出' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '四通道數位隔離器（2 順向 + 2 反向）' }, { k: '隔離阻障', v: 'SiO2；1500 VRMS / 2121 VDC' },
      { k: '突波耐受', v: '最高 12.8 kV' }, { k: 'CMTI', v: '±100 kV/µs (min)' },
      { k: '資料速率', v: '最高 50 Mbps' }, { k: '供電範圍', v: '2.25 ~ 5.5 V（兩側獨立）' },
      { k: '工作溫度', v: '−40 ~ +125°C' }, { k: '封裝', v: 'SOP (DUW-16)' }
    ],
    secondSource: ['封裝 + pinout 相容（DUW-16）', '通道數與方向相同（2 順向/2 反向）', '隔離等級涵蓋（VRMS/VDC、突波）', 'CMTI ≥ 需求', '資料速率 ≥ 需求', '供電範圍涵蓋（2.25~5.5V）', '預設輸出狀態相同', '工作溫度涵蓋', '認證等級（若需）'],
    dropIn: []
  },
  {
    part: 'ISO6021', mfr: 'Texas Instruments', category: 'isolation',
    subcategory: '雙通道數位隔離器 (低功耗、高頻寬)', package: 'SOIC-8',
    whatIs: '雙通道數位隔離器：兩個獨立電源域間傳兩路數位訊號，SiO2 阻障；主打低功耗 + 高頻寬、加強隔離。',
    func: '在低壓側與高壓/雜訊側間隔離傳兩路數位訊號（皆同向），防接地迴路/突波/共模干擾。低功耗、頻寬高，適合電池供電或高速數位介面隔離。',
    usedIn: '隔離 SPI/UART、感測器介面隔離、可攜/電池設備、工業數位 I/O 隔離。',
    desc: '雙通道(2 順向)數位隔離器，SiO2 阻障、加強隔離、低功耗高頻寬（SOIC-8）。',
    datasheet: 'IC-spec/iso6021.pdf',
    pins: [
      { num: 1, name: 'VCC1', side: 'L', type: 'Power', desc: '側 1 電源' },
      { num: 2, name: 'INA', side: 'L', type: 'Digital In', desc: '通道 A 輸入（側 1）' },
      { num: 3, name: 'INB', side: 'L', type: 'Digital In', desc: '通道 B 輸入（側 1）' },
      { num: 4, name: 'GND1', side: 'L', type: 'Ground', desc: '側 1 接地' },
      { num: 8, name: 'VCC2', side: 'R', type: 'Power', desc: '側 2 電源' },
      { num: 7, name: 'OUTA', side: 'R', type: 'Digital Out', desc: '通道 A 輸出（側 2）' },
      { num: 6, name: 'OUTB', side: 'R', type: 'Digital Out', desc: '通道 B 輸出（側 2）' },
      { num: 5, name: 'GND2', side: 'R', type: 'Ground', desc: '側 2 接地' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '雙通道數位隔離器（2 順向）' }, { k: '隔離阻障', v: 'SiO2、加強 (Reinforced)' },
      { k: '特點', v: '低功耗 + 高頻寬' }, { k: '供電範圍', v: '兩側獨立（見 datasheet）' },
      { k: '封裝', v: 'SOIC-8' }
    ],
    secondSource: ['封裝 + pinout 相容（SOIC-8、雙通道同向）', '通道數與方向相同（2 順向）', '隔離等級涵蓋', '資料速率/頻寬 ≥ 需求', '供電範圍涵蓋', '靜態電流（低功耗需求）同等或更佳', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'ADS112S14', mfr: 'Texas Instruments', category: 'data-converters',
    subcategory: 'Precision ADC (Delta-Sigma, SPI)', package: 'WQFN-16 (RTE) 3.0×3.0mm',
    whatIs: '精密類比數位轉換器（ADC）：把類比電壓轉成 16 位元數位值，SPI 介面、可接 8 路輸入。與 ADS112C14 同功能，差在介面是 SPI（非 I2C）。',
    func: '把感測器微小類比訊號高解析度數位化，整合 PGA、可程式基準、雙電流源、溫度感測器。架構為 Delta-Sigma（Δ-Σ）：高速過取樣 + 噪聲整形換取極高解析度，適合慢速高精度量測。SPI 4 線介面（CS/SCLK/SDI/SDO）。',
    usedIn: '工業感測前端（RTD/熱電偶、壓力/應變電橋、流量）、PLC/DCS 類比輸入、需 SPI 的量測系統。',
    desc: '16-bit、8 通道、64kSPS Δ-Σ ADC，SPI 介面（與 ADS112C14 同功能、介面不同）。',
    datasheet: 'IC-spec/ads112s14.pdf',
    pins: [
      { num: 1, name: 'AIN0', side: 'L', type: 'Analog In', desc: '類比輸入 0' },
      { num: 2, name: 'AIN1', side: 'L', type: 'Analog In', desc: '類比輸入 1' },
      { num: 3, name: 'AIN2', side: 'L', type: 'Analog In', desc: '類比輸入 2' },
      { num: 4, name: 'AIN3', side: 'L', type: 'Analog In', desc: '類比輸入 3' },
      { num: 5, name: 'AIN4/REFP/GPIO0', side: 'B', type: 'Analog In / Digital I/O', desc: '類比輸入 4；外部基準正端 REFP；GPIO0' },
      { num: 6, name: 'AIN5/REFN/GPIO1', side: 'B', type: 'Analog In / Digital I/O', desc: '類比輸入 5；外部基準負端 REFN；GPIO1' },
      { num: 7, name: 'AIN6/GPIO2/{FAULT}', side: 'B', type: 'Analog In / Digital I/O', desc: '類比輸入 6；GPIO2；可設 FAULT 輸出' },
      { num: 8, name: 'AIN7/GPIO3/{DRDY}/CLK', side: 'B', type: 'Analog In / Digital I/O', desc: '類比輸入 7；GPIO3；DRDY/外部 CLK' },
      { num: 12, name: 'SCLK', side: 'R', type: 'Digital In', desc: 'SPI 串列時脈' },
      { num: 11, name: 'SDI', side: 'R', type: 'Digital In', desc: 'SPI 資料輸入（MOSI）' },
      { num: 10, name: 'SDO/{DRDY}', side: 'R', type: 'Digital Out', desc: 'SPI 資料輸出（MISO）/ 資料就緒' },
      { num: 9, name: '{CS}', side: 'R', type: 'Digital In', desc: 'SPI 晶片選擇（active-low）' },
      { num: 17, name: 'GND', side: 'T', type: 'Ground（EP）', desc: '外露焊墊 (EP)；接 GND', ep: true },
      { num: 16, name: 'REFOUT', side: 'T', type: 'Analog Out', desc: '內部基準輸出；接 100nF 到 GND' },
      { num: 15, name: 'AVDD', side: 'T', type: 'Power（類比）', desc: '類比供電；接 100nF 到 GND' },
      { num: 14, name: 'GND', side: 'T', type: 'Ground', desc: '接地' },
      { num: 13, name: 'DVDD', side: 'T', type: 'Power（數位）', desc: '數位供電；接 100nF 到 GND' }
    ],
    thermalPad: null,
    specs: [
      { k: '解析度', v: '16-bit' }, { k: '架構', v: 'Delta-Sigma (ΔΣ)' },
      { k: '通道', v: '8 輸入多工 (MUX)' }, { k: '最高取樣率', v: '64 kSPS' },
      { k: 'PGA 增益', v: '0.5 ~ 256' }, { k: '介面', v: 'SPI（4 線：CS/SCLK/SDI/SDO）' },
      { k: '類比供電 AVDD', v: '1.74 ~ 3.6 V' }, { k: '數位供電 DVDD', v: '1.65 ~ 3.6 V' },
      { k: '內部基準', v: '1.25 / 2.5 V，25 ppm/°C' }, { k: '整合功能', v: '溫度感測器、雙電流源、4× GPIO' },
      { k: '工作溫度', v: '−40 ~ +125°C' }, { k: '封裝', v: 'WQFN-16 (RTE) / DSBGA-16' }
    ],
    secondSource: ['封裝 + pinout 相容（WQFN-16 RTE、pin-to-pin）', '解析度 ≥ 16-bit', '通道數 ≥ 8、MUX 相容', '介面同為 SPI（CS/SCLK/SDI/SDO 相容）', 'AVDD/DVDD 範圍涵蓋', 'PGA 增益範圍涵蓋', '取樣率 ≥ 需求', '噪聲/ENOB 同等或更佳', '內部基準與溫漂同等', '工作溫度涵蓋'],
    dropIn: [{ part: 'ADS122S14', note: '同 RTE WQFN-16、腳位完全相同（24-bit 版）' }]
  },
  {
    part: 'ADS122S14', mfr: 'Texas Instruments', category: 'data-converters',
    subcategory: 'Precision ADC (Delta-Sigma, SPI)', package: 'WQFN-16 (RTE) 3.0×3.0mm',
    whatIs: '精密類比數位轉換器（ADC）：把類比電壓轉成 24 位元數位值，SPI 介面、8 路輸入。與 ADS112S14 同腳位（16-bit/24-bit 之差）。',
    func: '感測器微小類比訊號高解析度數位化，整合 PGA、可程式基準、雙電流源、溫度感測器。Delta-Sigma 架構、SPI 4 線介面。24-bit 解析度。',
    usedIn: '高精度工業感測前端、PLC/DCS、需 SPI + 24-bit 的量測。',
    desc: '24-bit、8 通道、64kSPS Δ-Σ ADC，SPI 介面（與 ADS112S14 同腳位）。',
    datasheet: 'IC-spec/ads122s14.pdf',
    pins: [
      { num: 1, name: 'AIN0', side: 'L', type: 'Analog In', desc: '類比輸入 0' },
      { num: 2, name: 'AIN1', side: 'L', type: 'Analog In', desc: '類比輸入 1' },
      { num: 3, name: 'AIN2', side: 'L', type: 'Analog In', desc: '類比輸入 2' },
      { num: 4, name: 'AIN3', side: 'L', type: 'Analog In', desc: '類比輸入 3' },
      { num: 5, name: 'AIN4/REFP/GPIO0', side: 'B', type: 'Analog In / Digital I/O', desc: '類比輸入 4；REFP；GPIO0' },
      { num: 6, name: 'AIN5/REFN/GPIO1', side: 'B', type: 'Analog In / Digital I/O', desc: '類比輸入 5；REFN；GPIO1' },
      { num: 7, name: 'AIN6/GPIO2/{FAULT}', side: 'B', type: 'Analog In / Digital I/O', desc: '類比輸入 6；GPIO2；FAULT' },
      { num: 8, name: 'AIN7/GPIO3/{DRDY}/CLK', side: 'B', type: 'Analog In / Digital I/O', desc: '類比輸入 7；GPIO3；DRDY/CLK' },
      { num: 12, name: 'SCLK', side: 'R', type: 'Digital In', desc: 'SPI 串列時脈' },
      { num: 11, name: 'SDI', side: 'R', type: 'Digital In', desc: 'SPI 資料輸入（MOSI）' },
      { num: 10, name: 'SDO/{DRDY}', side: 'R', type: 'Digital Out', desc: 'SPI 資料輸出（MISO）/ 資料就緒' },
      { num: 9, name: '{CS}', side: 'R', type: 'Digital In', desc: 'SPI 晶片選擇（active-low）' },
      { num: 17, name: 'GND', side: 'T', type: 'Ground（EP）', desc: '外露焊墊 (EP)；接 GND', ep: true },
      { num: 16, name: 'REFOUT', side: 'T', type: 'Analog Out', desc: '內部基準輸出；接 100nF 到 GND' },
      { num: 15, name: 'AVDD', side: 'T', type: 'Power（類比）', desc: '類比供電' },
      { num: 14, name: 'GND', side: 'T', type: 'Ground', desc: '接地' },
      { num: 13, name: 'DVDD', side: 'T', type: 'Power（數位）', desc: '數位供電' }
    ],
    thermalPad: null,
    specs: [
      { k: '解析度', v: '24-bit' }, { k: '架構', v: 'Delta-Sigma (ΔΣ)' },
      { k: '通道', v: '8 輸入多工 (MUX)' }, { k: '最高取樣率', v: '64 kSPS' },
      { k: 'PGA 增益', v: '0.5 ~ 256' }, { k: '介面', v: 'SPI（4 線）' },
      { k: '類比供電 AVDD', v: '1.74 ~ 3.6 V' }, { k: '數位供電 DVDD', v: '1.65 ~ 3.6 V' },
      { k: '內部基準', v: '1.25 / 2.5 V，25 ppm/°C' }, { k: '工作溫度', v: '−40 ~ +125°C' },
      { k: '封裝', v: 'WQFN-16 (RTE) / DSBGA-16' }
    ],
    secondSource: ['封裝 + pinout 相容（WQFN-16 RTE、pin-to-pin）', '解析度 ≥ 24-bit', '通道數 ≥ 8、MUX 相容', '介面同為 SPI', 'AVDD/DVDD 範圍涵蓋', 'PGA 增益範圍涵蓋', '取樣率 ≥ 需求', '噪聲/ENOB 同等或更佳', '內部基準與溫漂同等', '工作溫度涵蓋'],
    dropIn: [{ part: 'ADS112S14', note: '同 RTE WQFN-16、腳位完全相同（16-bit 版）' }]
  },
  {
    part: 'ADS9326', mfr: 'Texas Instruments', category: 'data-converters',
    subcategory: '雙通道同時取樣 SAR ADC (16-bit, 5MSPS)', package: 'VQFN-22',
    whatIs: '雙通道、同時取樣的逐次逼近(SAR)類比數位轉換器：兩個 16-bit ADC「同一瞬間」對兩路類比訊號取樣（相位對齊），最高 5MSPS。',
    func: '同時量測兩路訊號且時間對齊（例如電流與電壓、或兩相電流），SAR 架構轉換快、無延遲累積。內含基準緩衝、共模輸出(VCMOUT)，SPI 多線資料輸出(D0~D3)加速讀取。CONVST 觸發、CS 選擇。',
    usedIn: '馬達/伺服控制的電流電壓同步取樣、三相功率量測、功率分析儀、電網量測。',
    desc: '雙通道、同時取樣、16-bit、5MSPS SAR ADC（VQFN-22），SPI 多線輸出。',
    datasheet: 'IC-spec/ads9326.pdf',
    pins: [
      { num: 6, name: 'AINP_A', side: 'L', type: 'Analog In', desc: 'ADC A 正輸入' },
      { num: 5, name: 'AINM_A', side: 'L', type: 'Analog In', desc: 'ADC A 負輸入' },
      { num: 2, name: 'AINP_B', side: 'L', type: 'Analog In', desc: 'ADC B 正輸入' },
      { num: 1, name: 'AINM_B', side: 'L', type: 'Analog In', desc: 'ADC B 負輸入' },
      { num: 9, name: 'REFIO', side: 'L', type: 'Analog Out', desc: '內部基準輸出/外部基準輸入；接 1µF 到 GND' },
      { num: 3, name: 'REF_CAP', side: 'L', type: 'Analog In', desc: '基準緩衝去耦電容腳' },
      { num: 4, name: 'REFM', side: 'L', type: 'Analog In', desc: '基準負端' },
      { num: 20, name: 'VCMOUT', side: 'L', type: 'Analog Out', desc: '共模電壓輸出' },
      { num: 10, name: 'CONVST', side: 'R', type: 'Digital In', desc: '轉換啟動（下降緣同時觸發 A/B）' },
      { num: 11, name: '{CS}', side: 'R', type: 'Digital In', desc: '晶片選擇（active-low）' },
      { num: 17, name: 'SCLK', side: 'R', type: 'Digital In', desc: 'SPI 串列時脈' },
      { num: 12, name: 'SDI', side: 'R', type: 'Digital In', desc: 'SPI 資料輸入' },
      { num: 16, name: 'D0', side: 'R', type: 'Digital Out', desc: '資料輸出 0' },
      { num: 15, name: 'D1', side: 'R', type: 'Digital Out', desc: '資料輸出 1' },
      { num: 14, name: 'D2', side: 'R', type: 'Digital Out', desc: '資料輸出 2' },
      { num: 13, name: 'D3', side: 'R', type: 'Digital Out', desc: '資料輸出 3' },
      { num: 7, name: 'AVDD', side: 'T', type: 'Power', desc: '類比電源 5V 或 3.3V；接 1µF（腳7-8）' },
      { num: 19, name: 'IOVDD', side: 'T', type: 'Power', desc: '介面電源；接 0.1µF（腳18-19）' },
      { num: 22, name: 'VDD_1V8', side: 'T', type: 'Power', desc: '內部 1.8V（去耦）' },
      { num: 8, name: 'GND', side: 'B', type: 'Ground', desc: '接地' },
      { num: 21, name: 'GND', side: 'B', type: 'Ground', desc: '接地' },
      { num: 18, name: 'IOGND', side: 'B', type: 'Ground', desc: 'IOVDD 接地（外部接 GND）' },
      { num: 23, name: 'GND', side: 'B', type: 'Ground（EP）', desc: '外露焊墊 (EP)；接 GND', ep: true }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '雙通道同時取樣 SAR ADC' }, { k: '解析度', v: '16-bit' },
      { k: '取樣率', v: '最高 5 MSPS' }, { k: '架構', v: 'SAR（逐次逼近）' },
      { k: '通道', v: '2（A/B，同時取樣、相位對齊）' }, { k: '基準', v: '內部基準 + 緩衝（REFIO/REF_CAP）' },
      { k: '介面', v: 'SPI（多線資料 D0~D3、CONVST/CS）' }, { k: '類比供電', v: '5V 或 3.3V' },
      { k: '封裝', v: 'VQFN-22（含外露焊墊 EP）' }
    ],
    secondSource: ['封裝 + pinout 相容（VQFN-22、含 EP）', '解析度 ≥ 16-bit', '通道數=2、同時取樣相容', '取樣率 ≥ 需求（≤5MSPS）', '介面相同（SPI 多線、CONVST/CS）', 'SNR/THD 同等或更佳', '基準架構相容（內部/外部）', '供電（AVDD/IOVDD）涵蓋', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'ADS9316', mfr: 'Texas Instruments', category: 'data-converters',
    subcategory: '雙通道同時取樣 SAR ADC (18-bit)', package: 'VQFN-22',
    whatIs: '雙通道、同時取樣的 18-bit SAR 類比數位轉換器：兩個 ADC 同一瞬間取樣兩路訊號（相位對齊），比 ADS9326 高 2 位元解析度。與 ADS9326/9317 同腳位。',
    func: '同時量測兩路訊號且時間對齊（電流/電壓、兩相電流），18-bit 高解析；SAR 架構快、SPI 多線輸出(D0~D3)。CONVST 觸發、CS 選擇、內含基準與共模輸出。',
    usedIn: '高解析馬達/伺服電流電壓同步取樣、三相功率量測、功率分析儀。',
    desc: '雙通道、同時取樣、18-bit SAR ADC（VQFN-22），SPI 多線輸出（與 ADS9326/9317 同腳位）。',
    datasheet: 'IC-spec/ads9316.pdf',
    pins: [
      { num: 6, name: 'AINP_A', side: 'L', type: 'Analog In', desc: 'ADC A 正輸入' },
      { num: 5, name: 'AINM_A', side: 'L', type: 'Analog In', desc: 'ADC A 負輸入' },
      { num: 2, name: 'AINP_B', side: 'L', type: 'Analog In', desc: 'ADC B 正輸入' },
      { num: 1, name: 'AINM_B', side: 'L', type: 'Analog In', desc: 'ADC B 負輸入' },
      { num: 9, name: 'REFIO', side: 'L', type: 'Analog Out', desc: '內部基準輸出/外部基準輸入；接 1µF 到 GND' },
      { num: 3, name: 'REF_CAP', side: 'L', type: 'Analog In', desc: '基準緩衝去耦電容腳' },
      { num: 4, name: 'REFM', side: 'L', type: 'Analog In', desc: '基準負端' },
      { num: 20, name: 'VCMOUT', side: 'L', type: 'Analog Out', desc: '共模電壓輸出' },
      { num: 10, name: 'CONVST', side: 'R', type: 'Digital In', desc: '轉換啟動（下降緣同時觸發 A/B）' },
      { num: 11, name: '{CS}', side: 'R', type: 'Digital In', desc: '晶片選擇（active-low）' },
      { num: 17, name: 'SCLK', side: 'R', type: 'Digital In', desc: 'SPI 串列時脈' },
      { num: 12, name: 'SDI', side: 'R', type: 'Digital In', desc: 'SPI 資料輸入' },
      { num: 16, name: 'D0', side: 'R', type: 'Digital Out', desc: '資料輸出 0' },
      { num: 15, name: 'D1', side: 'R', type: 'Digital Out', desc: '資料輸出 1' },
      { num: 14, name: 'D2', side: 'R', type: 'Digital Out', desc: '資料輸出 2' },
      { num: 13, name: 'D3', side: 'R', type: 'Digital Out', desc: '資料輸出 3' },
      { num: 7, name: 'AVDD', side: 'T', type: 'Power', desc: '類比電源 5V 或 3.3V' },
      { num: 19, name: 'IOVDD', side: 'T', type: 'Power', desc: '介面電源' },
      { num: 22, name: 'VDD_1V8', side: 'T', type: 'Power', desc: '內部 1.8V（去耦）' },
      { num: 8, name: 'GND', side: 'B', type: 'Ground', desc: '接地' },
      { num: 21, name: 'GND', side: 'B', type: 'Ground', desc: '接地' },
      { num: 18, name: 'IOGND', side: 'B', type: 'Ground', desc: 'IOVDD 接地（外部接 GND）' },
      { num: 23, name: 'GND', side: 'B', type: 'Ground（EP）', desc: '外露焊墊 (EP)；接 GND', ep: true }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '雙通道同時取樣 SAR ADC' }, { k: '解析度', v: '18-bit' },
      { k: '架構', v: 'SAR（逐次逼近）' }, { k: '通道', v: '2（A/B，同時取樣）' },
      { k: '介面', v: 'SPI（多線資料 D0~D3、CONVST/CS）' }, { k: '基準', v: '內部基準 + 緩衝' },
      { k: '類比供電', v: '5V 或 3.3V' }, { k: '封裝', v: 'VQFN-22（含 EP）' }
    ],
    secondSource: ['封裝 + pinout 相容（VQFN-22、含 EP）', '解析度 ≥ 18-bit', '通道數=2、同時取樣相容', '取樣率 ≥ 需求', '介面相同（SPI 多線、CONVST/CS）', 'SNR/THD 同等或更佳', '基準架構相容', '供電涵蓋', '工作溫度涵蓋'],
    dropIn: [{ part: 'ADS9317', note: '同 VQFN-22、腳位完全相同、皆 18-bit（確認 throughput/精度規格符合）' }]
  },
  {
    part: 'ADS9317', mfr: 'Texas Instruments', category: 'data-converters',
    subcategory: '雙通道同時取樣 SAR ADC (18-bit)', package: 'VQFN-22',
    whatIs: '雙通道、同時取樣的 18-bit SAR ADC：兩個 ADC 同一瞬間取樣兩路訊號。與 ADS9316/9326 同腳位（ADS931x 系列）。',
    func: '同時量測兩路訊號、時間對齊，18-bit 高解析；SAR 快、SPI 多線輸出。與 ADS9316 同腳位、規格略異（依 datasheet）。',
    usedIn: '高解析馬達/伺服同步取樣、三相功率量測、功率分析。',
    desc: '雙通道、同時取樣、18-bit SAR ADC（VQFN-22，與 ADS9316/9326 同腳位）。',
    datasheet: 'IC-spec/ads9317.pdf',
    pins: [
      { num: 6, name: 'AINP_A', side: 'L', type: 'Analog In', desc: 'ADC A 正輸入' },
      { num: 5, name: 'AINM_A', side: 'L', type: 'Analog In', desc: 'ADC A 負輸入' },
      { num: 2, name: 'AINP_B', side: 'L', type: 'Analog In', desc: 'ADC B 正輸入' },
      { num: 1, name: 'AINM_B', side: 'L', type: 'Analog In', desc: 'ADC B 負輸入' },
      { num: 9, name: 'REFIO', side: 'L', type: 'Analog Out', desc: '內部基準輸出/外部基準輸入' },
      { num: 3, name: 'REF_CAP', side: 'L', type: 'Analog In', desc: '基準緩衝去耦電容腳' },
      { num: 4, name: 'REFM', side: 'L', type: 'Analog In', desc: '基準負端' },
      { num: 20, name: 'VCMOUT', side: 'L', type: 'Analog Out', desc: '共模電壓輸出' },
      { num: 10, name: 'CONVST', side: 'R', type: 'Digital In', desc: '轉換啟動' },
      { num: 11, name: '{CS}', side: 'R', type: 'Digital In', desc: '晶片選擇（active-low）' },
      { num: 17, name: 'SCLK', side: 'R', type: 'Digital In', desc: 'SPI 串列時脈' },
      { num: 12, name: 'SDI', side: 'R', type: 'Digital In', desc: 'SPI 資料輸入' },
      { num: 16, name: 'D0', side: 'R', type: 'Digital Out', desc: '資料輸出 0' },
      { num: 15, name: 'D1', side: 'R', type: 'Digital Out', desc: '資料輸出 1' },
      { num: 14, name: 'D2', side: 'R', type: 'Digital Out', desc: '資料輸出 2' },
      { num: 13, name: 'D3', side: 'R', type: 'Digital Out', desc: '資料輸出 3' },
      { num: 7, name: 'AVDD', side: 'T', type: 'Power', desc: '類比電源 5V 或 3.3V' },
      { num: 19, name: 'IOVDD', side: 'T', type: 'Power', desc: '介面電源' },
      { num: 22, name: 'VDD_1V8', side: 'T', type: 'Power', desc: '內部 1.8V' },
      { num: 8, name: 'GND', side: 'B', type: 'Ground', desc: '接地' },
      { num: 21, name: 'GND', side: 'B', type: 'Ground', desc: '接地' },
      { num: 18, name: 'IOGND', side: 'B', type: 'Ground', desc: 'IOVDD 接地' },
      { num: 23, name: 'GND', side: 'B', type: 'Ground（EP）', desc: '外露焊墊 (EP)；接 GND', ep: true }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '雙通道同時取樣 SAR ADC' }, { k: '解析度', v: '18-bit' },
      { k: '架構', v: 'SAR' }, { k: '通道', v: '2（同時取樣）' },
      { k: '介面', v: 'SPI（多線 D0~D3、CONVST/CS）' }, { k: '類比供電', v: '5V 或 3.3V' },
      { k: '封裝', v: 'VQFN-22（含 EP）' }
    ],
    secondSource: ['封裝 + pinout 相容（VQFN-22、含 EP）', '解析度 ≥ 18-bit', '通道數=2、同時取樣相容', '取樣率 ≥ 需求', '介面相同（SPI 多線、CONVST/CS）', 'SNR/THD 同等或更佳', '供電涵蓋', '工作溫度涵蓋'],
    dropIn: [{ part: 'ADS9316', note: '同 VQFN-22、腳位完全相同、皆 18-bit（確認 throughput/精度規格符合）' }]
  },
  {
    part: 'THS6222', mfr: 'Texas Instruments', category: 'amplifiers',
    subcategory: '雙通道差動線驅動器 (8~32V, HPLC)', package: 'VQFN-16 (RGT)',
    whatIs: '雙通道差動線驅動器：把訊號放大成差動輸出去「驅動傳輸線」（如電力線通訊 HPLC），高電壓供電 8~32V，內含共模緩衝。是高壓、大電流輸出的放大器，不是一般小訊號運放。',
    func: '驅動長傳輸線/電力線：兩組差動放大器(D1/D2) 輸出大擺幅差動訊號推動線路阻抗；可調偏置電流(IADJ + BIAS-1/2 模式)在效能與功耗間取捨，省電；VCM 設定輸出共模準位。',
    usedIn: '電力線通訊(HPLC/PLC/G3-PLC)線驅動、xDSL、長距離差動訊號驅動。',
    desc: '雙通道、8~32V 供電的差動線驅動器，含共模緩衝、可調偏置（VQFN-16）。',
    datasheet: 'IC-spec/ths6222.pdf',
    pins: [
      { num: 1, name: 'D1_IN+', side: 'L', type: 'Analog In', desc: '放大器 D1 非反相輸入' },
      { num: 11, name: 'D1_IN-', side: 'L', type: 'Analog In', desc: '放大器 D1 反相輸入' },
      { num: 2, name: 'D2_IN+', side: 'L', type: 'Analog In', desc: '放大器 D2 非反相輸入' },
      { num: 10, name: 'D2_IN-', side: 'L', type: 'Analog In', desc: '放大器 D2 反相輸入' },
      { num: 4, name: 'IADJ', side: 'L', type: 'Analog In', desc: '偏置電流調整腳' },
      { num: 15, name: 'BIAS-1', side: 'L', type: 'Digital In', desc: '偏置模式控制 LSB（無訊號則進關斷）' },
      { num: 16, name: 'BIAS-2', side: 'L', type: 'Digital In', desc: '偏置模式控制 MSB' },
      { num: 12, name: 'D1_OUT', side: 'R', type: 'Analog Out', desc: '放大器 D1 輸出' },
      { num: 9, name: 'D2_OUT', side: 'R', type: 'Analog Out', desc: '放大器 D2 輸出' },
      { num: 5, name: 'VCM', side: 'R', type: 'Analog Out', desc: '共模緩衝輸出（設定輸出共模準位）' },
      { num: 8, name: 'VS+', side: 'T', type: 'Power', desc: '正電源' },
      { num: 13, name: 'VS+', side: 'T', type: 'Power', desc: '正電源' },
      { num: 7, name: 'VS-', side: 'B', type: 'Power', desc: '負電源' },
      { num: 14, name: 'VS-', side: 'B', type: 'Power', desc: '負電源' },
      { num: 3, name: 'DGND', side: 'B', type: 'Ground', desc: '偏置控制腳的接地參考（範圍 VS− ~ VS+−5V）' },
      { num: 6, name: 'NC', side: 'B', type: 'NC', desc: '無內部連接' },
      { num: 17, name: 'VS-', side: 'B', type: 'Power（EP）', desc: '外露焊墊 (EP)；接 VS−（非 GND）以獲最佳效能', ep: true }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '雙通道差動線驅動器（含共模緩衝）' }, { k: '通道', v: '2（D1 / D2）' },
      { k: '供電範圍', v: '8 ~ 32 V（VS+ / VS−）' }, { k: '偏置', v: '可調（IADJ + BIAS-1/2 模式，省電/可關斷）' },
      { k: '共模', v: 'VCM 緩衝輸出' }, { k: 'EP', v: '外露焊墊接 VS−（非 GND）' },
      { k: '應用', v: 'HPLC / 電力線通訊線驅動、xDSL' }, { k: '封裝', v: 'VQFN-16 (RGT)' }
    ],
    secondSource: ['封裝 + pinout 相容（VQFN-16 RGT、EP 接 VS−）', '通道數=2、差動線驅動相容', '供電範圍涵蓋（8~32V）', '輸出電流/擺幅 ≥ 需求（驅動線路阻抗）', '偏置控制方式相容（IADJ/BIAS）', '共模緩衝(VCM) 相容', '頻寬/失真 同等或更佳', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'TPS61290', mfr: 'Texas Instruments', category: 'power',
    subcategory: '同步升壓轉換器 (5.5V, 11A, I2C, 含旁路)', package: 'BGA-16 (4×4)',
    whatIs: '同步升壓(boost)轉換器：把較低的輸入電壓升到較高的輸出電壓，內建高/低側功率 MOSFET（同步整流、效率高），可由 I2C 設定，並有旁路(bypass)模式。大電流（開關電流 11A）。',
    func: '電池/低壓源 → 升壓供電；同步整流省損耗；I2C 動態設定輸出電壓與模式；不需升壓時切 bypass 直通省電。BGA 16 球，VIN/VOUT/SW/GND 各 3 球分擔大電流。',
    usedIn: '電池供電裝置升壓（手機/穿戴/IoT）、RF 功率放大器供電、需 I2C 動態調壓的系統。',
    desc: '5.5V、11A 同步升壓轉換器，I2C 控制、含旁路模式（BGA-16）。',
    datasheet: 'IC-spec/tps61290.pdf',
    pins: [
      { num: 'A1', name: 'EN', side: 'L', type: 'Digital In', desc: '致能；高=啟用、低=關斷' },
      { num: 'B1', name: 'SCL', side: 'L', type: 'Digital In', desc: 'I2C 時脈（勿浮接，需終端）' },
      { num: 'C1', name: 'SDA', side: 'L', type: 'Digital I/O', desc: 'I2C 位址/資料（勿浮接）' },
      { num: 'D1', name: 'GPIO', side: 'L', type: 'Digital I/O', desc: 'ADDR（I2C 位址選擇）或 VSEL（升壓/旁路門檻選擇）' },
      { num: 'A2-A4', name: 'VIN', side: 'T', type: 'Power', desc: '電源輸入（球 A2/A3/A4）' },
      { num: 'B2-B4', name: 'VOUT', side: 'R', type: 'Power', desc: '升壓輸出（球 B2/B3/B4）' },
      { num: 'C2-C4', name: 'SW', side: 'R', type: 'Power', desc: '開關節點（內部高低側 MOSFET 連接點；接電感，球 C2/C3/C4）' },
      { num: 'D2-D4', name: 'GND', side: 'B', type: 'Ground', desc: '接地（球 D2/D3/D4；輸出電容地要靠近）' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '同步升壓(boost)轉換器、含旁路模式' }, { k: '輸入', v: '最高 5.5 V' },
      { k: '開關電流', v: '11 A' }, { k: '整流', v: '同步（內建高/低側 MOSFET）' },
      { k: '控制', v: 'I2C（可調輸出電壓/模式）；EN 致能' }, { k: '旁路', v: '不需升壓時 bypass 直通省電' },
      { k: '封裝', v: 'BGA-16（4×4；VIN/VOUT/SW/GND 各 3 球）' }
    ],
    secondSource: ['封裝 + ball-out 相容（BGA-16 4×4、同球位）', '輸入電壓範圍涵蓋（≤5.5V）', '開關/輸出電流 ≥ 需求（11A）', '同步整流、效率相容', '控制介面相同（I2C、位址相容）', '旁路模式支援（若需）', '輸出電壓設定範圍涵蓋', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'TPS61129-Q1', mfr: 'Texas Instruments', category: 'power',
    subcategory: '升壓轉換器 (5.5V, 3.5A Isw, 車規, 展頻+時脈同步)', package: 'VQFN-11',
    whatIs: '升壓(boost)轉換器：把較低輸入電壓升到較高輸出，車規(Q1)；含展頻調變(降 EMI)與外部時脈同步功能。FB 回授可調輸出電壓（或固定 5V 版）。',
    func: '低壓源→升壓供電；FB 接分壓設定輸出電壓；SSEN 開展頻把開關頻譜分散、壓低 EMI 峰值；SYNC/MODE 選強制 PWM 或自動 PFM、亦可外部時脈同步；PG 輸出電源就緒指示。車規。',
    usedIn: '車用電子升壓供電、對 EMI 敏感/需時脈同步的電源、感測器/顯示/RF 供電。',
    desc: '5.5V、3.5A 開關電流的車規升壓轉換器，含展頻與時脈同步、可調輸出（VQFN-11）。',
    datasheet: 'IC-spec/tps61129-q1.pdf',
    pins: [
      { num: 1, name: 'EN', side: 'L', type: 'Digital In', desc: '致能（高=啟用、低=關斷；勿浮接）' },
      { num: 3, name: 'FB', side: 'L', type: 'Analog In', desc: '輸出電壓回授（接分壓中點設定 Vout；固定 5V 版接 VOUT）' },
      { num: 4, name: 'PG', side: 'L', type: 'Digital Out', desc: '電源就緒指示（開汲極輸出）' },
      { num: 7, name: 'SSEN', side: 'L', type: 'Digital In', desc: '展頻調變致能（高=開、低=關；勿浮接）' },
      { num: 8, name: 'SYNC/MODE', side: 'L', type: 'Digital In', desc: '模式選擇：高=強制 PWM、低/浮接=自動 PFM；亦可外部時脈同步' },
      { num: 6, name: 'VIN', side: 'R', type: 'Power', desc: '電源輸入' },
      { num: 9, name: 'SW', side: 'R', type: 'Power', desc: '開關節點（接電感）' },
      { num: 2, name: 'VOUT', side: 'R', type: 'Power', desc: '升壓輸出' },
      { num: 5, name: 'AGND', side: 'B', type: 'Ground', desc: '類比地' },
      { num: 10, name: 'PGND', side: 'B', type: 'Ground', desc: '功率地' },
      { num: 11, name: 'PGND', side: 'B', type: 'Ground', desc: '功率地' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '升壓(boost)轉換器（車規）' }, { k: '輸入', v: '最高 5.5 V' },
      { k: '開關電流', v: '3.5 A (Isw)' }, { k: '輸出設定', v: 'FB 分壓可調（或固定 5V 版）' },
      { k: 'EMI', v: '展頻調變(SSEN) 降 EMI' }, { k: '模式', v: '強制 PWM / 自動 PFM；可外部時脈同步' },
      { k: '指示', v: 'PG 電源就緒（開汲極）' }, { k: '認證', v: '車規 AEC-Q100 (Q1)' }, { k: '封裝', v: 'VQFN-11' }
    ],
    secondSource: ['封裝 + pinout 相容（VQFN-11、pin-to-pin）', '輸入電壓範圍涵蓋（≤5.5V）', '開關電流 ≥ 需求（3.5A）', '輸出電壓設定方式相容（FB 可調/固定）', '展頻/時脈同步功能（若需）', 'PG 指示（若用）', '車規認證涵蓋（Q1）', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'UCC34141-Q1', mfr: 'Texas Instruments', category: 'power',
    subcategory: '整合式隔離偏置電源 (12Vin → 25Vout, 車規)', package: 'QFN-16',
    whatIs: '整合式隔離偏置電源：一次側 12V 輸入，跨電氣隔離在二次側產生正負偏置電壓（VDD 與 VEE，合計約 25V）給閘極驅動等用；含雙路回授穩壓與內部 buck-boost。車規(Q1)、高功率密度、1.5W。',
    func: '提供 IGBT/SiC/GaN 閘極驅動所需的隔離「正負偏壓」（如 +15V / −4V）。一次 12V 進(VIN/GNDP)，二次 VDD−COM 與 COM−VEE 兩路可各自回授(FBVDD/FBVEE)設定；BSW 接電感做 buck-boost 產生負軌；ENA 致能(可設 UVLO)、PG 指示電源就緒。一二次電氣隔離。',
    usedIn: 'IGBT/SiC/GaN 閘極驅動的隔離正負偏壓、馬達驅動/逆變器/車載充電閘極電源、需 ± 偏壓的隔離供電。',
    desc: '1.5W、12Vin→25Vout 的整合式隔離偏置電源，二次產生正負偏壓供閘極驅動（QFN-16，車規）。',
    datasheet: 'IC-spec/ucc34141-q1.pdf',
    pins: [
      { num: 1, name: 'ENA', side: 'L', type: 'Digital In', desc: '致能（低=關斷、高=啟用；可用分壓設 VIN UVLO）' },
      { num: 2, name: 'PG', side: 'L', type: 'Digital Out', desc: '電源就緒指示（開汲極輸出）' },
      { num: '3,4', name: 'VIN', side: 'L', type: 'Power', desc: '一次側電源輸入（約 12V；腳 3/4）' },
      { num: '5-8', name: 'GNDP', side: 'L', type: 'Ground', desc: '一次側功率地（腳 5/6/7/8；接功率開關源極）' },
      { num: 12, name: 'VDD', side: 'R', type: 'Power', desc: '二次側正輸出（VDD−COM 受 FBVDD 穩壓）' },
      { num: 13, name: 'BSW', side: 'R', type: 'Power', desc: '內部 buck-boost 開關腳（接 3.3~10µH 電感到 COM；單輸出模式浮接）' },
      { num: 14, name: 'VEE', side: 'R', type: 'Power', desc: '二次側負輸出（COM−VEE 受 FBVEE 設定，2~8V）' },
      { num: 15, name: 'FBVDD', side: 'R', type: 'Analog In', desc: '正輸出(VDD−COM)回授；分壓中點，調節點 2.5V' },
      { num: 16, name: 'FBVEE', side: 'R', type: 'Analog In', desc: '負輸出(COM−VEE)回授；設定 2~8V' },
      { num: 9, name: 'COMA', side: 'B', type: 'Ground', desc: '二次側類比感測參考地（FBVDD/FBVEE 去耦就近接此）' },
      { num: '10,11', name: 'COM', side: 'B', type: 'Ground', desc: '二次側地（腳 10/11；接二次閘極驅動電壓參考）' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '整合式隔離偏置電源（產正負偏壓）' }, { k: '輸入', v: '12 V（VIN）' },
      { k: '輸出', v: '約 25 V（VDD 與 VEE 雙路，可各自回授設定）' }, { k: '功率', v: '1.5 W' },
      { k: '隔離', v: '一二次電氣隔離' }, { k: '拓樸', v: '內部 buck-boost（BSW 接電感產生負軌）' },
      { k: '回授', v: 'FBVDD 調 VDD−COM、FBVEE 調 COM−VEE (2~8V)' }, { k: '指示/致能', v: 'PG 就緒、ENA（可設 UVLO）' },
      { k: '認證', v: '車規 AEC-Q100 (Q1)' }, { k: '封裝', v: 'QFN-16' }
    ],
    secondSource: ['封裝 + pinout 相容（QFN-16、pin-to-pin）', '輸入電壓涵蓋（12V）', '輸出電壓/功率 ≥ 需求（~25V / 1.5W）', '正負雙輸出與回授方式相容（FBVDD/FBVEE）', '隔離等級涵蓋', 'buck-boost/電感需求相容（BSW）', 'PG/ENA 行為相容', '車規認證涵蓋（Q1）', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'TMAG6184', mfr: 'Texas Instruments', category: 'sensors',
    subcategory: 'AMR 360° 角度感測器 (放大類比 SIN/COS 輸出)', package: 'SOIC-8',
    whatIs: '高精度 360° 角度感測器：用各向異性磁阻(AMR)感測旋轉磁鐵的角度，輸出已放大的「差動 SIN/COS 類比訊號」加數位象限(Q0/Q1)，外部由 atan2 算出絕對角度。',
    func: '無接觸量測旋轉磁鐵的絕對角(0~360°)：差動 SIN_P/N、COS_P/N 給 ADC 算反正切得角度；Q0/Q1 開汲極數位象限快速粗判方位。抗灰塵/油污、可靠。',
    usedIn: '無刷馬達(BLDC)轉子位置/FOC 換相、轉向角感測、節氣門/踏板位置、旋鈕編碼。',
    desc: '高精度 AMR 360° 角度感測器，放大差動 SIN/COS 類比輸出 + 象限數位輸出（SOIC-8）。',
    datasheet: 'IC-spec/tmag6184.pdf',
    pins: [
      { num: 1, name: 'COS_P', side: 'L', type: 'Analog Out', desc: '差動餘弦輸出（正）' },
      { num: 2, name: 'GND', side: 'L', type: 'Ground', desc: '接地參考' },
      { num: 3, name: 'COS_N', side: 'L', type: 'Analog Out', desc: '差動餘弦輸出（負）' },
      { num: 4, name: 'Q0', side: 'L', type: 'Digital Out', desc: '象限 0 數位輸出（開汲極）' },
      { num: 8, name: 'SIN_P', side: 'R', type: 'Analog Out', desc: '差動正弦輸出（正）' },
      { num: 7, name: 'VCC', side: 'R', type: 'Power', desc: '電源' },
      { num: 6, name: 'SIN_N', side: 'R', type: 'Analog Out', desc: '差動正弦輸出（負）' },
      { num: 5, name: 'Q1', side: 'R', type: 'Digital Out', desc: '象限 1 數位輸出（開汲極）' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: 'AMR 360° 絕對角度感測器' }, { k: '感測原理', v: '各向異性磁阻 (AMR)' },
      { k: '輸出', v: '放大差動 SIN/COS 類比 + Q0/Q1 象限數位(開汲極)' }, { k: '量測範圍', v: '0 ~ 360°' },
      { k: '電源', v: '單一 VCC' }, { k: '特點', v: '無接觸、抗灰塵/油污' }, { k: '封裝', v: 'SOIC-8' }
    ],
    secondSource: ['封裝 + pinout 相容（SOIC-8、pin-to-pin）', '輸出型態相同（差動 SIN/COS 類比 + 象限數位）', '角度精度 / 解析度 同等或更佳', '輸出擺幅 / 共模相容（對接 ADC）', '感測原理相容（AMR）', '電源電壓涵蓋', '象限輸出(開汲極) 行為相容', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'TMP4719', mfr: 'Texas Instruments', category: 'sensors',
    subcategory: '3 通道溫度感測器 (2 遠端 + 1 本地, SMBus)', package: 'VSSOP-10 / WSON-10',
    whatIs: '高精度 3 通道溫度感測器：用外接電晶體/二極體的 VBE 隨溫變化來量「遠端熱點」溫度（如 CPU/GPU/功率元件接面），共 2 個遠端 + 1 個本地，SMBus 介面回報。1.2V 邏輯相容。',
    func: '量測 3 點溫度（2 路外接 diode/BJT 遠端 + 晶片本地）；超溫時 T_CRIT / ALERT 開汲極輸出觸發中斷或關機保護；SMBus(SCL/SDA) 讀溫度值與設定門檻。高準確度。',
    usedIn: 'CPU/GPU/FPGA/SoC 熱點測溫與熱管理、伺服器/功率模組溫度監控、系統過溫保護。',
    desc: '高精度 3 通道(2 遠端+1 本地)溫度感測器，SMBus 介面、T_CRIT/ALERT 保護輸出（VSSOP/WSON-10）。',
    datasheet: 'IC-spec/tmp4719.pdf',
    pins: [
      { num: 1, name: 'VDD', side: 'L', type: 'Power', desc: '電源；接 0.1µF 到 GND' },
      { num: 2, name: 'DP1', side: 'L', type: 'Analog In', desc: '通道1 遠端二極體正端(陽極)；不用則開路' },
      { num: 3, name: 'DN1', side: 'L', type: 'Analog In', desc: '通道1 遠端二極體負端(陰極)' },
      { num: 4, name: 'DP2', side: 'L', type: 'Analog In', desc: '通道2 遠端二極體正端(陽極)' },
      { num: 5, name: 'DN2', side: 'L', type: 'Analog In', desc: '通道2 遠端二極體負端(陰極)' },
      { num: 10, name: 'SCL', side: 'R', type: 'Digital In', desc: 'SMBus 時脈' },
      { num: 9, name: 'SDA', side: 'R', type: 'Digital I/O', desc: 'SMBus 資料' },
      { num: 8, name: 'ALERT', side: 'R', type: 'Digital Out', desc: '溫度警示（開汲極，需上拉）' },
      { num: 7, name: 'T_CRIT', side: 'R', type: 'Digital Out', desc: '臨界溫度警示（開汲極，需上拉）' },
      { num: 6, name: 'GND', side: 'R', type: 'Ground', desc: '接地' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '3 通道溫度感測（2 遠端 + 1 本地）' }, { k: '遠端量測', v: '外接 diode/BJT 的 VBE 法' },
      { k: '介面', v: 'SMBus（SCL/SDA），1.2V 邏輯相容' }, { k: '保護輸出', v: 'ALERT + T_CRIT（開汲極，需上拉）' },
      { k: '電源', v: '單一 VDD（0.1µF 去耦）' }, { k: '封裝', v: 'VSSOP-10 / WSON-10' }
    ],
    secondSource: ['封裝 + pinout 相容（VSSOP/WSON-10、pin-to-pin）', '通道數相同（2 遠端 + 1 本地）', '介面同為 SMBus（SCL/SDA、位址相容）', '量測精度 / 解析度 同等或更佳', '保護輸出相容（ALERT/T_CRIT 開汲極）', '邏輯準位相容（1.2V）', '電源電壓涵蓋', '工作溫度涵蓋'],
    dropIn: [{ part: 'TMP4719-Q1', note: '車規版、同 VSSOP/WSON-10 腳位相同' }]
  },
  {
    part: 'TMP4719-Q1', mfr: 'Texas Instruments', category: 'sensors',
    subcategory: '3 通道溫度感測器 (2 遠端 + 1 本地, SMBus, 車規)', package: 'VSSOP-10 / WSON-10',
    whatIs: '高精度 3 通道溫度感測器（車規 Q1）：量 2 個遠端(外接 diode/BJT)+1 本地溫度，SMBus 回報。與 TMP4719 同腳位、加汽車認證。',
    func: '同 TMP4719：3 點測溫、超溫 T_CRIT/ALERT 保護、SMBus 讀值設門檻。車規 AEC-Q100。',
    usedIn: '車用 SoC/功率模組熱點測溫與熱管理、車載過溫保護。',
    desc: '車規高精度 3 通道溫度感測器，SMBus、T_CRIT/ALERT（與 TMP4719 同腳位，VSSOP/WSON-10）。',
    datasheet: 'IC-spec/tmp4719-q1.pdf',
    pins: [
      { num: 1, name: 'VDD', side: 'L', type: 'Power', desc: '電源；接 0.1µF 到 GND' },
      { num: 2, name: 'DP1', side: 'L', type: 'Analog In', desc: '通道1 遠端二極體正端' },
      { num: 3, name: 'DN1', side: 'L', type: 'Analog In', desc: '通道1 遠端二極體負端' },
      { num: 4, name: 'DP2', side: 'L', type: 'Analog In', desc: '通道2 遠端二極體正端' },
      { num: 5, name: 'DN2', side: 'L', type: 'Analog In', desc: '通道2 遠端二極體負端' },
      { num: 10, name: 'SCL', side: 'R', type: 'Digital In', desc: 'SMBus 時脈' },
      { num: 9, name: 'SDA', side: 'R', type: 'Digital I/O', desc: 'SMBus 資料' },
      { num: 8, name: 'ALERT', side: 'R', type: 'Digital Out', desc: '溫度警示（開汲極，需上拉）' },
      { num: 7, name: 'T_CRIT', side: 'R', type: 'Digital Out', desc: '臨界溫度警示（開汲極，需上拉）' },
      { num: 6, name: 'GND', side: 'R', type: 'Ground', desc: '接地' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '3 通道溫度感測（2 遠端 + 1 本地）' }, { k: '介面', v: 'SMBus（SCL/SDA）' },
      { k: '保護輸出', v: 'ALERT + T_CRIT（開汲極）' }, { k: '認證', v: '車規 AEC-Q100 (Q1)' },
      { k: '電源', v: '單一 VDD' }, { k: '封裝', v: 'VSSOP-10 / WSON-10' }
    ],
    secondSource: ['封裝 + pinout 相容（VSSOP/WSON-10、pin-to-pin）', '通道數相同（2 遠端 + 1 本地）', '介面同為 SMBus', '量測精度同等或更佳', '保護輸出相容（ALERT/T_CRIT）', '車規認證涵蓋（Q1）', '電源電壓涵蓋', '工作溫度涵蓋'],
    dropIn: [{ part: 'TMP4719', note: '同 VSSOP/WSON-10 腳位相同（非車規版）' }]
  },
  {
    part: 'MUX808-Q1', mfr: 'Texas Instruments', category: 'switch-mux',
    subcategory: '單路 8:1 類比多工器 (100V, 車規)', package: 'TSSOP-16 (PW) / WQFN-16 (RUM)',
    whatIs: '高壓類比多工器（8 選 1）：把 8 路類比/數位訊號其中一路選通到單一共用端 D（雙向，可當 mux 或 demux）。最高 100V 供電、1.8V 邏輯控制、車規。',
    func: '用 3 條位址線 A0/A1/A2 選 S1~S8 其中一路接到 D；EN 高才致能（低則全關，高阻抗）。雙向訊號路徑、先斷後通(break-before-make)避免短路；fail-safe 邏輯（邏輯腳電壓可高於供電 48V 不損壞）、閂鎖免疫、低串擾 −110dB。屬機械開關的固態替代，省外部繼電器。',
    usedIn: '車身控制模組(BCM)、LIDAR、區域控制(ZCU)、HEV/EV 電池管理(BMS)、ADAS、EV 充電系統、車載資通訊/影音。',
    desc: '車規 100V 單路 8:1 類比多工器，平坦 RON、閂鎖免疫、1.8V 邏輯、先斷後通（TSSOP/WQFN-16）。',
    datasheet: 'IC-spec/mux808-q1.pdf',
    pins: [
      { num: 1, name: 'A0', side: 'L', type: 'Digital In', desc: '位址選擇 0；內建 4MΩ 下拉' },
      { num: 2, name: 'EN', side: 'L', type: 'Digital In', desc: '高態致能；低則全開關關閉(高阻抗)；內建 4MΩ 下拉' },
      { num: 3, name: 'VSS', side: 'L', type: 'Power（負）', desc: '負電源（最負電位）；單電源時接 GND；0.1~10µF 去耦至 GND' },
      { num: 4, name: 'S1', side: 'L', type: 'Analog I/O', desc: '來源腳 1（可輸入或輸出）' },
      { num: 5, name: 'S2', side: 'L', type: 'Analog I/O', desc: '來源腳 2' },
      { num: 6, name: 'S3', side: 'L', type: 'Analog I/O', desc: '來源腳 3' },
      { num: 7, name: 'S4', side: 'L', type: 'Analog I/O', desc: '來源腳 4' },
      { num: 8, name: 'D', side: 'L', type: 'Analog I/O', desc: '汲極共用端（可輸入或輸出）' },
      { num: 16, name: 'A1', side: 'R', type: 'Digital In', desc: '位址選擇 1；內建 4MΩ 下拉' },
      { num: 15, name: 'A2', side: 'R', type: 'Digital In', desc: '位址選擇 2；內建 4MΩ 下拉' },
      { num: 14, name: 'GND', side: 'R', type: 'Ground', desc: '接地 (0V) 參考' },
      { num: 13, name: 'VDD', side: 'R', type: 'Power（正）', desc: '正電源（最正電位）；0.1~10µF 去耦至 GND' },
      { num: 12, name: 'S5', side: 'R', type: 'Analog I/O', desc: '來源腳 5' },
      { num: 11, name: 'S6', side: 'R', type: 'Analog I/O', desc: '來源腳 6' },
      { num: 10, name: 'S7', side: 'R', type: 'Analog I/O', desc: '來源腳 7' },
      { num: 9, name: 'S8', side: 'R', type: 'Analog I/O', desc: '來源腳 8' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '單路 8:1 類比多工器（雙向）' }, { k: '位址線', v: 'A0/A1/A2（3 位元選 8）+ EN' },
      { k: '單電源範圍', v: '10 ~ 100 V' }, { k: '雙電源範圍', v: '±10 ~ ±50 V（可不對稱）' },
      { k: 'RON', v: '平坦 RON（值見 datasheet）' }, { k: '串擾', v: '−110 dB' },
      { k: '邏輯準位', v: '1.8V 相容；邏輯腳內建下拉' }, { k: 'Fail-safe 邏輯', v: '邏輯電壓可高於供電 48V' },
      { k: '開關行為', v: '先斷後通 (break-before-make)、閂鎖免疫、雙向' }, { k: '認證', v: '車規 AEC-Q100 grade 1（−40~125°C）' },
      { k: '封裝', v: 'TSSOP-16 (PW) / WQFN-16 (RUM，散熱墊建議接 GND/VSS)' }
    ],
    secondSource: ['封裝 + pinout 相容（TSSOP-16 PW、pin-to-pin）', '配置相同（單路 8:1）', '位址線數相同（A0/A1/A2 + EN，致能極性相同）', '供電範圍涵蓋（單 100V / 雙 ±50V）', 'RON / 串擾 同等或更佳', '邏輯準位相容（1.8V、下拉）', 'fail-safe / 閂鎖免疫 同等', '先斷後通行為相容', '車規認證涵蓋', '工作溫度涵蓋（−40~125°C）'],
    dropIn: [{ part: 'MUX708-Q1', note: '同 PW TSSOP-16 腳位相同（單路 8:1）；但 708 為 44V/±22V、RON 4Ω 版，較低壓，確認供電與規格符合' }]
  },
  {
    part: 'MUX708-Q1', mfr: 'Texas Instruments', category: 'switch-mux',
    subcategory: '單路 8:1 類比多工器 (44V, 低 RON, 車規)', package: 'TSSOP-16 (PW) / WQFN-16 (RUM)',
    whatIs: '車規類比多工器（8 選 1）：8 路訊號選 1 路通到共用端 D（雙向）。44V 供電、低導通電阻 4Ω、1.8V 邏輯控制。與 MUX808-Q1 同腳位（低壓版）。',
    func: '用 A0/A1/A2 選 S1~S8 一路接到 D；EN 高致能（低則全關高阻抗）。低 RON 4Ω、低電荷注入 3pC、雙向、先斷後通、閂鎖免疫、fail-safe 邏輯、軌對軌。高電流支援 400mA(WQFN)/300mA(TSSOP)。',
    usedIn: '車身控制模組(BCM)、LIDAR、區域控制(ZCU)、HEV/EV 電池管理(BMS)、ADAS、類比/數位多工解多工、EV 充電、車載資通訊/影音。',
    desc: '車規 44V 單路 8:1 類比多工器，低 RON 4Ω、低電荷注入 3pC、1.8V 邏輯、先斷後通（TSSOP/WQFN-16）。',
    datasheet: 'IC-spec/mux708-q1.pdf',
    pins: [
      { num: 1, name: 'A0', side: 'L', type: 'Digital In', desc: '位址選擇 0；內建 4MΩ 下拉' },
      { num: 2, name: 'EN', side: 'L', type: 'Digital In', desc: '高態致能；低則全開關關閉(高阻抗)；內建 4MΩ 下拉' },
      { num: 3, name: 'VSS', side: 'L', type: 'Power（負）', desc: '負電源（最負電位）；單電源時接 GND；0.1~10µF 去耦至 GND' },
      { num: 4, name: 'S1', side: 'L', type: 'Analog I/O', desc: '來源腳 1（可輸入或輸出）' },
      { num: 5, name: 'S2', side: 'L', type: 'Analog I/O', desc: '來源腳 2' },
      { num: 6, name: 'S3', side: 'L', type: 'Analog I/O', desc: '來源腳 3' },
      { num: 7, name: 'S4', side: 'L', type: 'Analog I/O', desc: '來源腳 4' },
      { num: 8, name: 'D', side: 'L', type: 'Analog I/O', desc: '汲極共用端（可輸入或輸出）' },
      { num: 16, name: 'A1', side: 'R', type: 'Digital In', desc: '位址選擇 1；內建 4MΩ 下拉' },
      { num: 15, name: 'A2', side: 'R', type: 'Digital In', desc: '位址選擇 2；內建 4MΩ 下拉' },
      { num: 14, name: 'GND', side: 'R', type: 'Ground', desc: '接地 (0V) 參考' },
      { num: 13, name: 'VDD', side: 'R', type: 'Power（正）', desc: '正電源（最正電位）；0.1~10µF 去耦至 GND' },
      { num: 12, name: 'S5', side: 'R', type: 'Analog I/O', desc: '來源腳 5' },
      { num: 11, name: 'S6', side: 'R', type: 'Analog I/O', desc: '來源腳 6' },
      { num: 10, name: 'S7', side: 'R', type: 'Analog I/O', desc: '來源腳 7' },
      { num: 9, name: 'S8', side: 'R', type: 'Analog I/O', desc: '來源腳 8' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '單路 8:1 類比多工器（雙向）' }, { k: '位址線', v: 'A0/A1/A2（3 位元選 8）+ EN' },
      { k: '單電源範圍', v: '4.5 ~ 44 V' }, { k: '雙電源範圍', v: '±4.5 ~ ±22 V' },
      { k: 'RON', v: '4 Ω（低）' }, { k: '電荷注入', v: '3 pC' },
      { k: '高電流', v: '400mA(WQFN max) / 300mA(TSSOP max)' }, { k: '邏輯準位', v: '1.8V 相容；邏輯腳內建下拉' },
      { k: '開關行為', v: '先斷後通、閂鎖免疫、軌對軌、雙向、fail-safe 邏輯' }, { k: '認證', v: '車規 AEC-Q100 grade 1（−40~125°C）' },
      { k: '封裝', v: 'TSSOP-16 (PW) / WQFN-16 (RUM，散熱墊建議接 GND/VSS)' }
    ],
    secondSource: ['封裝 + pinout 相容（TSSOP-16 PW、pin-to-pin）', '配置相同（單路 8:1）', '位址線數相同（A0/A1/A2 + EN）', '供電範圍涵蓋（單 44V / 雙 ±22V）', 'RON ≤ 需求（4Ω）、電荷注入同等', '高電流支援涵蓋', '邏輯準位相容（1.8V）', '先斷後通 / 閂鎖免疫 / fail-safe 相容', '車規認證涵蓋', '工作溫度涵蓋'],
    dropIn: [{ part: 'MUX808-Q1', note: '同 PW TSSOP-16 腳位相同（單路 8:1）；808 為 100V/±50V 高壓版（升級用，確認 RON/電流規格符合）' }]
  },
  {
    part: 'MUX809-Q1', mfr: 'Texas Instruments', category: 'switch-mux',
    subcategory: '雙路 4:1 差動類比多工器 (100V, 車規)', package: 'TSSOP-16 (PW) / WQFN-16 (RUM)',
    whatIs: '高壓差動類比多工器（雙 4 選 1）：兩組各 4 路訊號各選一路通到 DA / DB，兩組共用同一組位址線 → 適合差動/雙線訊號選通。最高 100V、1.8V 邏輯、車規。',
    func: '用 A0/A1 同時選 A 組(S1A~S4A→DA)與 B 組(S1B~S4B→DB)的同號通道；EN 高致能（低則全關高阻抗）。雙向、先斷後通、閂鎖免疫、fail-safe 邏輯、低串擾。與 MUX808-Q1 同系列、同封裝但配置為雙 4:1（腳名/接腳不同，非 pin-to-pin）。',
    usedIn: '差動訊號多工、車身控制模組(BCM)、LIDAR、區域控制(ZCU)、HEV/EV 電池管理(BMS)、ADAS、EV 充電、車載資通訊/影音。',
    desc: '車規 100V 雙路 4:1 差動類比多工器，平坦 RON、閂鎖免疫、1.8V 邏輯、先斷後通（TSSOP/WQFN-16）。',
    datasheet: 'IC-spec/mux809-q1.pdf',
    pins: [
      { num: 1, name: 'A0', side: 'L', type: 'Digital In', desc: '位址選擇 0；內建 4MΩ 下拉' },
      { num: 2, name: 'EN', side: 'L', type: 'Digital In', desc: '高態致能；低則全開關關閉(高阻抗)；內建 4MΩ 下拉' },
      { num: 3, name: 'VSS', side: 'L', type: 'Power（負）', desc: '負電源（最負電位）；單電源時接 GND；0.1~10µF 去耦至 GND' },
      { num: 4, name: 'S1A', side: 'L', type: 'Analog I/O', desc: 'A 組來源腳 1（可輸入或輸出）' },
      { num: 5, name: 'S2A', side: 'L', type: 'Analog I/O', desc: 'A 組來源腳 2' },
      { num: 6, name: 'S3A', side: 'L', type: 'Analog I/O', desc: 'A 組來源腳 3' },
      { num: 7, name: 'S4A', side: 'L', type: 'Analog I/O', desc: 'A 組來源腳 4' },
      { num: 8, name: 'DA', side: 'L', type: 'Analog I/O', desc: 'A 組汲極共用端' },
      { num: 16, name: 'A1', side: 'R', type: 'Digital In', desc: '位址選擇 1；內建 4MΩ 下拉' },
      { num: 15, name: 'GND', side: 'R', type: 'Ground', desc: '接地 (0V) 參考' },
      { num: 14, name: 'VDD', side: 'R', type: 'Power（正）', desc: '正電源（最正電位）；0.1~10µF 去耦至 GND' },
      { num: 13, name: 'S1B', side: 'R', type: 'Analog I/O', desc: 'B 組來源腳 1' },
      { num: 12, name: 'S2B', side: 'R', type: 'Analog I/O', desc: 'B 組來源腳 2' },
      { num: 11, name: 'S3B', side: 'R', type: 'Analog I/O', desc: 'B 組來源腳 3' },
      { num: 10, name: 'S4B', side: 'R', type: 'Analog I/O', desc: 'B 組來源腳 4' },
      { num: 9, name: 'DB', side: 'R', type: 'Analog I/O', desc: 'B 組汲極共用端' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '雙路 4:1 差動類比多工器（雙向）' }, { k: '位址線', v: 'A0/A1（2 位元選 4，兩組共用）+ EN' },
      { k: '單電源範圍', v: '10 ~ 100 V' }, { k: '雙電源範圍', v: '±10 ~ ±50 V（可不對稱）' },
      { k: 'RON', v: '平坦 RON（值見 datasheet）' }, { k: '串擾', v: '−110 dB' },
      { k: '邏輯準位', v: '1.8V 相容；邏輯腳內建下拉' }, { k: 'Fail-safe 邏輯', v: '邏輯電壓可高於供電 48V' },
      { k: '開關行為', v: '先斷後通、閂鎖免疫、雙向' }, { k: '認證', v: '車規 AEC-Q100 grade 1（−40~125°C）' },
      { k: '封裝', v: 'TSSOP-16 (PW) / WQFN-16 (RUM，散熱墊建議接 GND/VSS)' }
    ],
    secondSource: ['封裝 + pinout 相容（TSSOP-16 PW、pin-to-pin）', '配置相同（雙路 4:1 差動）', '位址線相同（A0/A1 + EN）', '供電範圍涵蓋（單 100V / 雙 ±50V）', 'RON / 串擾 同等或更佳', '邏輯準位相容（1.8V）', 'fail-safe / 閂鎖免疫 同等', '先斷後通行為相容', '車規認證涵蓋', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'SN74CBTLV3126-Q1', mfr: 'Texas Instruments', category: 'logic',
    subcategory: '四路 FET 匯流排開關 (低壓, 車規)', package: 'TSSOP-14 (PW) / SOT (DYY-14)',
    whatIs: '四路 FET 匯流排開關：4 個獨立的低電阻 FET 通道，各用一支 OE 控制 A↔B 是否導通。導通時近乎零壓降直通（非邏輯閘，只是「電子開關」），可雙向傳遞匯流排訊號。',
    func: '每路有 1A/1B 兩端與獨立 OE（高態導通）；OE 高時 A↔B 直通（低 RON），OE 低時斷開高阻抗。不做邏輯運算、不放大，只負責「接通/斷開」匯流排或隔離訊號。低壓 5V 以下、車規。',
    usedIn: '匯流排隔離/共用（記憶體、SPI/I2C 多主機切換）、訊號多工、熱插拔隔離、電壓位準下的訊號路由。',
    desc: '車規四路 FET 匯流排開關，獨立 OE（高態導通）、低 RON、雙向直通（TSSOP/SOT-14）。',
    datasheet: 'IC-spec/sn74cbtlv3126-q1.pdf',
    pins: [
      { num: 1, name: '1OE', side: 'L', type: 'Digital In', desc: '通道 1 輸出致能（高態導通）' },
      { num: 2, name: '1A', side: 'L', type: 'Digital I/O', desc: '通道 1 端 A（雙向）' },
      { num: 3, name: '1B', side: 'L', type: 'Digital I/O', desc: '通道 1 端 B（雙向）' },
      { num: 4, name: '2OE', side: 'L', type: 'Digital In', desc: '通道 2 輸出致能（高態導通）' },
      { num: 5, name: '2A', side: 'L', type: 'Digital I/O', desc: '通道 2 端 A' },
      { num: 6, name: '2B', side: 'L', type: 'Digital I/O', desc: '通道 2 端 B' },
      { num: 7, name: 'GND', side: 'L', type: 'Ground', desc: '接地' },
      { num: 14, name: 'VCC', side: 'R', type: 'Power', desc: '電源；接 0.1µF 去耦至 GND' },
      { num: 13, name: '4OE', side: 'R', type: 'Digital In', desc: '通道 4 輸出致能（高態導通）' },
      { num: 12, name: '4A', side: 'R', type: 'Digital I/O', desc: '通道 4 端 A' },
      { num: 11, name: '4B', side: 'R', type: 'Digital I/O', desc: '通道 4 端 B' },
      { num: 10, name: '3OE', side: 'R', type: 'Digital In', desc: '通道 3 輸出致能（高態導通）' },
      { num: 9, name: '3A', side: 'R', type: 'Digital I/O', desc: '通道 3 端 A' },
      { num: 8, name: '3B', side: 'R', type: 'Digital I/O', desc: '通道 3 端 B' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '四路 FET 匯流排開關（雙向直通，非邏輯閘）' }, { k: '致能', v: '每通道獨立 OE，高態導通' },
      { k: '通道數', v: '4（1A/1B ~ 4A/4B）' }, { k: '導通方式', v: '低 RON FET 直通、近零壓降' },
      { k: '電源', v: '低壓（CBTLV 系列，≤5V；實際範圍見 datasheet）' }, { k: '認證', v: '車規 AEC-Q100' },
      { k: '封裝', v: 'TSSOP-14 (PW) / SOT-14 (DYY)；散熱墊免焊，接則浮接或接 GND' }
    ],
    secondSource: ['封裝 + pinout 相容（TSSOP/SOT-14、pin-to-pin）', '通道數相同（4 路、各獨立 OE）', '致能極性相同（OE 高態導通）', 'RON 同等或更低', '電源電壓範圍涵蓋', '匯流排電容 / 頻寬同等或更佳', '車規認證涵蓋（若需）', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'TXB0606', mfr: 'Texas Instruments', category: 'logic',
    subcategory: '6 位元雙向電平轉換器 (自動方向)', package: 'WQFN-16 (RGY/BQB) / SOT-16 (DYY/PW)',
    whatIs: '6 位元雙向電平轉換器：在兩個不同電壓域（A 埠 / B 埠）之間雙向傳遞 6 條數位訊號，自動偵測方向、不需方向控制腳。給高速介面（QSPI/OSPI/eSPI）做準位轉換。',
    func: '每對 Ax↔Bx 自動判斷訊號方向並轉換準位（A 埠 0.9~2V、B 埠 1.65~3.6V，VCCA 可 <、=、> VCCB）。OE 低則所有輸出三態；任一 VCC 接地則全部高阻抗（VCC isolation）。Schmitt 觸發輸入抗雜訊；無需方向控制訊號。',
    usedIn: 'MCU 與週邊間 SPI/QSPI/OSPI/eSPI 準位轉換、1.8V↔3.3V 介面橋接、感測器/記憶體高速資料線轉壓。',
    desc: '6 位元自動雙向電平轉換器，A 埠 0.9~2V / B 埠 1.65~3.6V，>130Mbps、Schmitt 輸入、OE 三態（WQFN/SOT-16）。',
    datasheet: 'IC-spec/txb0606.pdf',
    pins: [
      { num: 1, name: 'A1', side: 'L', type: 'Digital I/O', desc: 'A 埠 I/O 1（參考 VCCA）' },
      { num: 2, name: 'VCCA', side: 'L', type: 'Power', desc: 'A 埠電源（低壓側）；接 0.1µF 去耦' },
      { num: 3, name: 'A2', side: 'L', type: 'Digital I/O', desc: 'A 埠 I/O 2（參考 VCCA）' },
      { num: 4, name: 'A3', side: 'L', type: 'Digital I/O', desc: 'A 埠 I/O 3' },
      { num: 5, name: 'A4', side: 'L', type: 'Digital I/O', desc: 'A 埠 I/O 4' },
      { num: 6, name: 'A5', side: 'L', type: 'Digital I/O', desc: 'A 埠 I/O 5' },
      { num: 7, name: 'A6', side: 'L', type: 'Digital I/O', desc: 'A 埠 I/O 6' },
      { num: 8, name: 'OE', side: 'L', type: 'Digital In', desc: '輸出致能（高態致能；低則全部三態）；參考 VCCA' },
      { num: 16, name: 'B1', side: 'R', type: 'Digital I/O', desc: 'B 埠 I/O 1（參考 VCCB）' },
      { num: 15, name: 'VCCB', side: 'R', type: 'Power', desc: 'B 埠電源（高壓側）；接 0.1µF 去耦' },
      { num: 14, name: 'B2', side: 'R', type: 'Digital I/O', desc: 'B 埠 I/O 2（參考 VCCB）' },
      { num: 13, name: 'B3', side: 'R', type: 'Digital I/O', desc: 'B 埠 I/O 3' },
      { num: 12, name: 'B4', side: 'R', type: 'Digital I/O', desc: 'B 埠 I/O 4' },
      { num: 11, name: 'B5', side: 'R', type: 'Digital I/O', desc: 'B 埠 I/O 5' },
      { num: 10, name: 'B6', side: 'R', type: 'Digital I/O', desc: 'B 埠 I/O 6' },
      { num: 9, name: 'GND', side: 'R', type: 'Ground', desc: '接地' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '6 位元雙向電平轉換（自動方向，無方向控制腳）' }, { k: 'A 埠電壓', v: '0.9 ~ 2 V' },
      { k: 'B 埠電壓', v: '1.65 ~ 3.6 V（VCCA 可 <、=、> VCCB）' }, { k: '資料率', v: '>130Mbps(15pF) / >100Mbps(100pF) @1.8V↔3.3V' },
      { k: '高速介面', v: 'QSPI / OSPI / eSPI' }, { k: '輸入', v: 'Schmitt 觸發（抗慢/雜訊）' },
      { k: 'OE', v: '低則全部三態；參考 VCCA' }, { k: 'VCC 隔離', v: '任一 VCC 接地 → 全部高阻抗' },
      { k: '保護', v: 'I_OFF 部分掉電；閂鎖 >100mA(JESD78 II)；ESD HBM 2kV/CDM 1kV' }, { k: '封裝', v: 'WQFN-16 (RGY/BQB) / SOT-16 (DYY/PW)；露出墊接次接地或開路' }
    ],
    secondSource: ['封裝 + pinout 相容（SOT/WQFN-16、pin-to-pin）', '通道數相同（6 位元雙向）', '自動方向、無方向控制腳', 'A/B 埠電壓範圍涵蓋（0.9~2V / 1.65~3.6V）', '資料率同等或更高', 'OE 三態 / VCC 隔離行為相容', 'Schmitt 輸入相容', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'TMUX2819', mfr: 'Texas Instruments', category: 'switch-mux',
    subcategory: '2:1 單通道類比開關 (±5.5V Beyond-Supply, 掉電保護)', package: 'WSON-8 (DSG) 2.0×2.0mm',
    whatIs: '2 選 1 單通道類比開關：把 SA / SB 兩路其中一路接到共用端 D，SEL 選路、EN 致能。0.16Ω 超低導通電阻、訊號可超出供電軌(±5.5V beyond-supply)、具掉電保護（VDD=0 時腳位高阻不漏電）。',
    func: 'SEL 決定 SA 或 SB 接到 D；EN 高致能、低則全斷高阻抗。掉電保護：VDD 移除時所有開關 OFF、訊號腳不導通不背流，保護下游。1.2V/1.8V 邏輯相容。屬機械開關固態替代。',
    usedIn: '電池供電/熱插拔系統的訊號切換、感測器多工、音訊/視訊選路、需掉電保護的訊號隔離。',
    desc: '±5.5V beyond-supply 2:1 單通道類比開關，0.16Ω Ron、掉電保護、1.2V 邏輯（WSON-8）。',
    datasheet: 'IC-spec/tmux2819.pdf',
    pins: [
      { num: 1, name: 'SA', side: 'L', type: 'Analog I/O', desc: '來源 A（可輸入或輸出）' },
      { num: 2, name: 'NC', side: 'L', type: 'No Connect', desc: '未內接；建議接 GND 保持已知狀態' },
      { num: 3, name: 'EN', side: 'L', type: 'Digital In', desc: '致能（高致能、低則全斷高阻抗）' },
      { num: 4, name: 'GND', side: 'L', type: 'Ground', desc: '接地 (0V) 參考' },
      { num: 8, name: 'VDD', side: 'R', type: 'Power', desc: '正電源；0.1~10µF 去耦至 GND' },
      { num: 7, name: 'SEL', side: 'R', type: 'Digital In', desc: '選路控制（決定 SA 或 SB 接 D）' },
      { num: 6, name: 'D', side: 'R', type: 'Analog I/O', desc: '汲極共用端（可輸入或輸出）' },
      { num: 5, name: 'SB', side: 'R', type: 'Analog I/O', desc: '來源 B（可輸入或輸出）' },
      { num: 9, name: 'GND', side: 'T', type: 'Ground（EP）', desc: '外露散熱墊；接 GND', ep: true }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '2:1 單通道類比開關（雙向）' }, { k: 'Ron', v: '0.16 Ω（超低）' },
      { k: '訊號範圍', v: '±5.5V beyond-supply（可超出供電軌）' }, { k: '掉電保護', v: '有（VDD=0 時高阻、不背流）' },
      { k: '邏輯準位', v: '1.2V / 1.8V 相容' }, { k: '電源', v: '單一 VDD（見 datasheet）' },
      { k: '封裝', v: 'WSON-8 (DSG)，EP 接 GND' }
    ],
    secondSource: ['封裝 + pinout 相容（DSG WSON-8、pin-to-pin）', '配置相同（2:1 單通道）', 'Ron ≤ 需求（0.16Ω）', '掉電保護相容', '訊號範圍涵蓋（beyond-supply）', '邏輯準位相容（1.2/1.8V）', '電源電壓涵蓋', '工作溫度涵蓋'],
    dropIn: [{ part: 'TMUX4819', note: '同 DSG WSON-8 腳位相同（2:1 1ch）；TMUX4819 為 ±15V beyond-supply 高壓版' }]
  },
  {
    part: 'TMUX2821', mfr: 'Texas Instruments', category: 'switch-mux',
    subcategory: '1:1 雙通道類比開關 (±5.5V Beyond-Supply, 掉電保護)', package: 'WSON-8 (DSG) 2.0×2.0mm',
    whatIs: '雙獨立 SPST 類比開關：兩組各自的 S–D 通道（S1-D1 由 SEL1 控、S2-D2 由 SEL2 控）獨立開關。0.16Ω Ron、beyond-supply、掉電保護。',
    func: 'SEL1 控 S1↔D1 通斷、SEL2 控 S2↔D2 通斷，兩通道完全獨立。掉電保護：VDD=0 時全 OFF 不背流。1.2V/1.8V 邏輯。與 TMUX2819 同封裝（不同配置，腳名不同）。',
    usedIn: '雙路訊號開關、感測器/電源路徑切換、熱插拔隔離、需獨立通斷的訊號路由。',
    desc: '±5.5V beyond-supply 1:1 雙通道類比開關，0.16Ω Ron、掉電保護、1.2V 邏輯（WSON-8）。',
    datasheet: 'IC-spec/tmux2821.pdf',
    pins: [
      { num: 1, name: 'S1', side: 'L', type: 'Analog I/O', desc: '通道 1 來源（可輸入或輸出）' },
      { num: 2, name: 'D1', side: 'L', type: 'Analog I/O', desc: '通道 1 汲極' },
      { num: 3, name: 'SEL2', side: 'L', type: 'Digital In', desc: '通道 2 選路控制' },
      { num: 4, name: 'GND', side: 'L', type: 'Ground', desc: '接地 (0V) 參考' },
      { num: 8, name: 'VDD', side: 'R', type: 'Power', desc: '正電源；0.1~10µF 去耦至 GND' },
      { num: 7, name: 'SEL1', side: 'R', type: 'Digital In', desc: '通道 1 選路控制' },
      { num: 6, name: 'D2', side: 'R', type: 'Analog I/O', desc: '通道 2 汲極' },
      { num: 5, name: 'S2', side: 'R', type: 'Analog I/O', desc: '通道 2 來源' },
      { num: 9, name: 'GND', side: 'T', type: 'Ground（EP）', desc: '外露散熱墊；接 GND', ep: true }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '1:1 雙通道類比開關（兩獨立 SPST）' }, { k: 'Ron', v: '0.16 Ω（超低）' },
      { k: '訊號範圍', v: '±5.5V beyond-supply' }, { k: '掉電保護', v: '有' },
      { k: '邏輯準位', v: '1.2V / 1.8V 相容' }, { k: '封裝', v: 'WSON-8 (DSG)，EP 接 GND' }
    ],
    secondSource: ['封裝 + pinout 相容（DSG WSON-8、pin-to-pin）', '配置相同（1:1 雙通道、各自 SEL）', 'Ron ≤ 需求（0.16Ω）', '掉電保護相容', '訊號範圍涵蓋', '邏輯準位相容', '電源電壓涵蓋', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'TMUX4819', mfr: 'Texas Instruments', category: 'switch-mux',
    subcategory: '2:1 單通道類比開關 (±15V Beyond-Supply, 掉電保護)', package: 'WSON-8 (DSG) 2.0×2.0mm',
    whatIs: '2 選 1 單通道類比開關（高壓版）：SA/SB 選一接 D，SEL 選路、EN 致能。0.16Ω Ron、±15V beyond-supply、掉電保護。與 TMUX2819 同腳位（高壓版）。',
    func: 'SEL 選 SA 或 SB 接 D；EN 高致能。±15V beyond-supply 適合更大訊號擺幅。掉電保護、1.2V/1.8V 邏輯。',
    usedIn: '較大擺幅類比訊號切換、工業感測多工、音訊選路、需掉電保護與高壓裕度的訊號路由。',
    desc: '±15V beyond-supply 2:1 單通道類比開關，0.16Ω Ron、掉電保護、1.2V 邏輯（WSON-8）。',
    datasheet: 'IC-spec/tmux4819.pdf',
    pins: [
      { num: 1, name: 'SA', side: 'L', type: 'Analog I/O', desc: '來源 A（可輸入或輸出）' },
      { num: 2, name: 'NC', side: 'L', type: 'No Connect', desc: '未內接；建議接 GND' },
      { num: 3, name: 'EN', side: 'L', type: 'Digital In', desc: '致能（高致能、低則全斷高阻抗）' },
      { num: 4, name: 'GND', side: 'L', type: 'Ground', desc: '接地 (0V) 參考' },
      { num: 8, name: 'VDD', side: 'R', type: 'Power', desc: '正電源；0.1~10µF 去耦至 GND' },
      { num: 7, name: 'SEL', side: 'R', type: 'Digital In', desc: '選路控制（SA 或 SB 接 D）' },
      { num: 6, name: 'D', side: 'R', type: 'Analog I/O', desc: '汲極共用端' },
      { num: 5, name: 'SB', side: 'R', type: 'Analog I/O', desc: '來源 B' },
      { num: 9, name: 'GND', side: 'T', type: 'Ground（EP）', desc: '外露散熱墊；接 GND', ep: true }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '2:1 單通道類比開關（雙向）' }, { k: 'Ron', v: '0.16 Ω' },
      { k: '訊號範圍', v: '±15V beyond-supply' }, { k: '掉電保護', v: '有' },
      { k: '邏輯準位', v: '1.2V / 1.8V 相容' }, { k: '封裝', v: 'WSON-8 (DSG)，EP 接 GND' }
    ],
    secondSource: ['封裝 + pinout 相容（DSG WSON-8、pin-to-pin）', '配置相同（2:1 單通道）', 'Ron ≤ 需求（0.16Ω）', '掉電保護相容', '訊號範圍涵蓋（±15V beyond-supply）', '邏輯準位相容', '電源電壓涵蓋', '工作溫度涵蓋'],
    dropIn: [{ part: 'TMUX2819', note: '同 DSG WSON-8 腳位相同（2:1 1ch）；TMUX2819 為 ±5.5V 低壓版' }]
  },
  {
    part: 'TMUX182-SEP', mfr: 'Texas Instruments', category: 'switch-mux',
    subcategory: '單路 8:1 類比多工器 (15V, 耐輻射 SEP)', package: 'SOT-23-THIN-16 (DYY)',
    whatIs: '耐輻射類比多工器（8 選 1）：S0~S7 八路選一接到共用端 D，用 A0/A1/A2 位址選路、EN 致能。15V 供電、1.8V 邏輯、航太級單事件防護(SEP)。',
    func: 'A[2:0] 選 S0~S7 一路接到 D；EN 為 active-low（高則全斷，低才依位址導通）。耐輻射(SEP)、雙向訊號、適合太空/高可靠環境。',
    usedIn: '衛星/太空酬載類比多工、耐輻射量測前端、航太感測訊號選路。',
    desc: '耐輻射 15V 單路 8:1 類比多工器，A[2:0] 位址、EN active-low、1.8V 邏輯（SOT-23-16）。',
    datasheet: 'IC-spec/tmux182-sep.pdf',
    pins: [
      { num: 1, name: 'S4', side: 'L', type: 'Analog I/O', desc: '來源 4（可輸入或輸出）' },
      { num: 2, name: 'S6', side: 'L', type: 'Analog I/O', desc: '來源 6' },
      { num: 3, name: 'D', side: 'L', type: 'Analog I/O', desc: '汲極共用端' },
      { num: 4, name: 'S7', side: 'L', type: 'Analog I/O', desc: '來源 7' },
      { num: 5, name: 'S5', side: 'L', type: 'Analog I/O', desc: '來源 5' },
      { num: 6, name: '{EN}', side: 'L', type: 'Digital In', desc: '致能（active-low；高則全斷，低才依位址導通）' },
      { num: 7, name: 'VSS', side: 'L', type: 'Power（負）', desc: '負電源；單電源時接 GND；0.1~10µF 去耦' },
      { num: 8, name: 'GND', side: 'L', type: 'Ground', desc: '接地 (0V) 參考' },
      { num: 16, name: 'VDD', side: 'R', type: 'Power', desc: '正電源；0.1~10µF 去耦至 GND' },
      { num: 15, name: 'S2', side: 'R', type: 'Analog I/O', desc: '來源 2' },
      { num: 14, name: 'S1', side: 'R', type: 'Analog I/O', desc: '來源 1' },
      { num: 13, name: 'S0', side: 'R', type: 'Analog I/O', desc: '來源 0' },
      { num: 12, name: 'S3', side: 'R', type: 'Analog I/O', desc: '來源 3' },
      { num: 11, name: 'A0', side: 'R', type: 'Digital In', desc: '位址線 0' },
      { num: 10, name: 'A1', side: 'R', type: 'Digital In', desc: '位址線 1' },
      { num: 9, name: 'A2', side: 'R', type: 'Digital In', desc: '位址線 2' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '單路 8:1 類比多工器（雙向）' }, { k: '位址線', v: 'A0/A1/A2（3 位元選 8）+ EN(active-low)' },
      { k: '供電', v: '15V（單）/ 雙電源（VSS 見 datasheet）' }, { k: '邏輯準位', v: '1.8V 相容' },
      { k: '耐輻射', v: 'SEP（單事件防護，航太級）' }, { k: '封裝', v: 'SOT-23-THIN-16 (DYY)' }
    ],
    secondSource: ['封裝 + pinout 相容（DYY SOT-23-16、pin-to-pin）', '配置相同（單路 8:1）', '位址線 + EN 極性相同（EN active-low）', '供電範圍涵蓋（15V）', '邏輯準位相容（1.8V）', '耐輻射等級涵蓋（SEP，若需）', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'PCA9306H', mfr: 'Texas Instruments', category: 'switch-mux',
    subcategory: '雙向 I2C/SMBus 電壓電平轉換器 (2 路)', package: 'X2SON-8 (DQE)',
    whatIs: '雙路雙向 I2C/SMBus 電平轉換器：把低壓側(VREF1)的 SCL1/SDA1 與高壓側(VREF2)的 SCL2/SDA2 之間做開汲極相容的電壓轉換。被動 FET 開關式，支援雙向、不需方向控制。',
    func: '用一顆 FET 通道橋接每條 I2C 線，藉 VREF1/VREF2 設定兩側準位；EN 致能。開汲極/上拉相容，雙向自動。低壓側 ≥1.0V，高壓側可達 5.5V。不放大、不緩衝，僅準位橋接。',
    usedIn: '1.8V↔3.3V/5V I2C/SMBus 橋接、感測器/EEPROM 介面轉壓、MCU 與高壓週邊 I2C 連接。',
    desc: '雙路雙向 I2C/SMBus 電平轉換器，VREF 設兩側準位、EN 致能、開汲極相容（X2SON-8）。',
    datasheet: 'IC-spec/pca9306h.pdf',
    pins: [
      { num: 1, name: 'GND', side: 'L', type: 'Ground', desc: '接地' },
      { num: 2, name: 'VREF1', side: 'L', type: 'Power', desc: '低壓側參考電源（設 SCL1/SDA1 準位）' },
      { num: 3, name: 'SCL1', side: 'L', type: 'Digital I/O', desc: '低壓側 I2C 時脈' },
      { num: 4, name: 'SDA1', side: 'L', type: 'Digital I/O', desc: '低壓側 I2C 資料' },
      { num: 8, name: 'EN', side: 'R', type: 'Digital In', desc: '開關致能輸入' },
      { num: 7, name: 'VREF2', side: 'R', type: 'Power', desc: '高壓側參考電源（設 SCL2/SDA2 準位）' },
      { num: 6, name: 'SCL2', side: 'R', type: 'Digital I/O', desc: '高壓側 I2C 時脈' },
      { num: 5, name: 'SDA2', side: 'R', type: 'Digital I/O', desc: '高壓側 I2C 資料' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '雙路雙向 I2C/SMBus 電平轉換（被動 FET）' }, { k: '低壓側', v: 'VREF1 ≥ 1.0V（見 datasheet）' },
      { k: '高壓側', v: 'VREF2 最高 5.5V' }, { k: '方向', v: '雙向自動、開汲極相容、不需方向腳' },
      { k: '致能', v: 'EN' }, { k: '封裝', v: 'X2SON-8 (DQE)' }
    ],
    secondSource: ['封裝 + pinout 相容（DQE X2SON-8、pin-to-pin）', '通道數相同（2 路 I2C）', 'VREF1/VREF2 範圍涵蓋', '雙向開汲極相容', 'EN 行為相容', '速度（FM+/1MHz，若需）涵蓋', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'TCA9617B', mfr: 'Texas Instruments', category: 'switch-mux',
    subcategory: 'I2C/SMBus 緩衝中繼器 (電平轉換, FM+)', package: 'VSSOP-8 (DGK)',
    whatIs: 'I2C 匯流排緩衝中繼器：A 側與 B 側各為獨立 I2C 匯流排，中間做緩衝隔離與電平轉換（A 側 0.8~5.5V、B 側 2.2~5.5V）。隔離電容負載、延長匯流排、轉換準位。',
    func: '把 A 側 SCLA/SDAA 與 B 側 SCLB/SDAB 之間做主動緩衝（非直通）：隔離兩側電容、各自上拉到各自 VCC 達成電平轉換；EN 高致能。支援 FM+（1MHz）。解決 I2C 電容超載與多板互連。',
    usedIn: '長距離/多卡 I2C 匯流排延伸、背板 I2C、不同電壓 I2C 域橋接、隔離大電容負載。',
    desc: 'I2C/SMBus 緩衝中繼器，A/B 雙側緩衝隔離 + 電平轉換、FM+(1MHz)、EN 致能（VSSOP-8）。',
    datasheet: 'IC-spec/tca9617b.pdf',
    pins: [
      { num: 1, name: 'VCCA', side: 'L', type: 'Power', desc: 'A 側電源（0.8~5.5V）' },
      { num: 2, name: 'SCLA', side: 'L', type: 'Digital I/O', desc: 'A 側 I2C 時脈；上拉至 VCCA' },
      { num: 3, name: 'SDAA', side: 'L', type: 'Digital I/O', desc: 'A 側 I2C 資料；上拉至 VCCA' },
      { num: 4, name: 'GND', side: 'L', type: 'Ground', desc: '接地' },
      { num: 8, name: 'VCCB', side: 'R', type: 'Power', desc: 'B 側兼裝置主電源（2.2~5.5V）' },
      { num: 7, name: 'SCLB', side: 'R', type: 'Digital I/O', desc: 'B 側 I2C 時脈；上拉至 VCCB' },
      { num: 6, name: 'SDAB', side: 'R', type: 'Digital I/O', desc: 'B 側 I2C 資料；上拉至 VCCB' },
      { num: 5, name: 'EN', side: 'R', type: 'Digital In', desc: '中繼器致能（高態致能；內部弱上拉至 VCCB）' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: 'I2C/SMBus 緩衝中繼器（主動緩衝 + 電平轉換）' }, { k: 'A 側電源', v: '0.8 ~ 5.5 V' },
      { k: 'B 側電源', v: '2.2 ~ 5.5 V（裝置主電源）' }, { k: '速度', v: 'FM+（最高 1MHz）' },
      { k: '致能', v: 'EN（高態，內部弱上拉至 VCCB）' }, { k: '封裝', v: 'VSSOP-8 (DGK)' }
    ],
    secondSource: ['封裝 + pinout 相容（DGK VSSOP-8、pin-to-pin）', '功能相同（I2C 緩衝中繼）', 'A/B 側電壓範圍涵蓋（0.8~5.5 / 2.2~5.5V）', '速度涵蓋（FM+ 1MHz）', 'EN 行為相容', '電容負載驅動同等或更佳', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'ADG601_602', mfr: 'Analog Devices', category: 'switch-mux',
    subcategory: '單路 SPST 類比開關 (低 Ron)', package: 'SOT-23-6 (RJ) / MSOP-8 (RM)',
    whatIs: '單刀單擲(SPST)類比開關：一路 S–D 通道由 IN 邏輯控制通斷。ADG601 常開(NO)、ADG602 常閉(NC)。低導通電阻、雙電源。',
    func: 'IN 控制 S↔D 通斷（ADG601 IN 高導通、ADG602 反相）。雙向訊號、低 Ron、低電荷注入。單顆固態開關，取代繼電器/類比開關陣列中的單路。',
    usedIn: '訊號取樣/保持、增益切換、感測器路徑通斷、自動測試設備、音訊靜音。',
    desc: '單路 SPST 類比開關（ADG601 NO / ADG602 NC），低 Ron、雙電源（SOT-23-6 / MSOP-8）。',
    datasheet: 'IC-spec/ADG601_602.pdf',
    pins: [
      { num: 1, name: 'VDD', side: 'L', type: 'Power', desc: '正電源（最正電位）' },
      { num: 2, name: 'S', side: 'L', type: 'Analog I/O', desc: '來源端（可輸入或輸出）' },
      { num: 3, name: 'VSS', side: 'L', type: 'Power（負）', desc: '負電源（最負電位）；單電源時接 GND' },
      { num: 6, name: 'IN', side: 'R', type: 'Digital In', desc: '邏輯控制輸入（控制 S↔D 通斷）' },
      { num: 5, name: 'D', side: 'R', type: 'Analog I/O', desc: '汲極端（可輸入或輸出）' },
      { num: 4, name: 'GND', side: 'R', type: 'Ground', desc: '接地 (0V) 參考' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '單路 SPST 類比開關（ADG601=NO / ADG602=NC）' }, { k: 'Ron', v: '低（值見 datasheet）' },
      { k: '控制', v: 'IN 單邏輯腳' }, { k: '電源', v: '雙電源 VDD/VSS（單電源時 VSS=GND）' },
      { k: '腳數', v: '6 (SOT-23) / 8 (MSOP，含 NC)' }, { k: '封裝', v: 'SOT-23-6 (RJ) / MSOP-8 (RM)' }
    ],
    secondSource: ['封裝 + pinout 相容（SOT-23-6 RJ、pin-to-pin）', '型態相同（SPST、NO/NC 一致）', 'Ron ≤ 需求', '電荷注入 / 漏電同等或更佳', '電源型態相容（雙/單電源）', '控制邏輯極性相容', '頻寬同等或更佳', '工作溫度涵蓋'],
    dropIn: [{ part: 'ADG602', note: '同封裝；ADG602 為常閉(NC)、ADG601 為常開(NO)，極性相反需確認' }]
  },
  {
    part: 'TCA9847', mfr: 'Texas Instruments', category: 'switch-mux',
    subcategory: '8 通道 I2C 多工器 (超低壓, 1MHz)', package: 'TSSOP-24 (PW) / VQFN-24 (RGE)',
    whatIs: '8 通道 I2C 多工器：一個上游 I2C(SCL/SDA) 切換到 8 個下游通道(SC0/SD0~SC7/SD7) 其中之一。解決下游裝置 I2C 位址衝突、隔離各通道電容。超低壓、1MHz。',
    func: '主機由上游 SCL/SDA 經 I2C 寫控制暫存器選通一個下游通道；同一時間只接一路（多工器，非開關）。各下游可不同上拉電壓→兼具電平轉換。A0/A1 設裝置位址；RESET(active-low) 復位。VDD1 邏輯、VDD2 核心。',
    usedIn: '多顆相同位址 I2C 裝置共匯流排（多組相同感測器/EEPROM）、I2C 通道隔離與電平轉換、伺服器/模組化系統 I2C 擴展。',
    desc: '8 通道超低壓 I2C 多工器，上游 1 對下游 8、各通道可獨立電平、1MHz、RESET（TSSOP/VQFN-24）。',
    datasheet: 'IC-spec/tca9847.pdf',
    pins: [
      { num: 1, name: 'VDD1', side: 'L', type: 'Power', desc: '邏輯準位電源' },
      { num: 2, name: 'A0', side: 'L', type: 'Digital In', desc: '位址輸入 0；接 VDD2 或 GND' },
      { num: 3, name: '{RESET}', side: 'L', type: 'Digital In', desc: '復位（active-low）；不用則上拉至 VDD2/VDPUM' },
      { num: 4, name: 'SD0', side: 'L', type: 'Digital I/O', desc: '下游通道 0 資料；上拉至 VDPU0' },
      { num: 5, name: 'SC0', side: 'L', type: 'Digital I/O', desc: '下游通道 0 時脈' },
      { num: 6, name: 'SD1', side: 'L', type: 'Digital I/O', desc: '下游通道 1 資料' },
      { num: 7, name: 'SC1', side: 'L', type: 'Digital I/O', desc: '下游通道 1 時脈' },
      { num: 8, name: 'SD2', side: 'L', type: 'Digital I/O', desc: '下游通道 2 資料' },
      { num: 9, name: 'SC2', side: 'L', type: 'Digital I/O', desc: '下游通道 2 時脈' },
      { num: 10, name: 'SD3', side: 'L', type: 'Digital I/O', desc: '下游通道 3 資料' },
      { num: 11, name: 'SC3', side: 'L', type: 'Digital I/O', desc: '下游通道 3 時脈' },
      { num: 12, name: 'GND', side: 'L', type: 'Ground', desc: '接地' },
      { num: 24, name: 'VDD2', side: 'R', type: 'Power', desc: '核心邏輯電源' },
      { num: 23, name: 'SDA', side: 'R', type: 'Digital I/O', desc: '上游 I2C 資料；上拉至 VDPUM' },
      { num: 22, name: 'SCL', side: 'R', type: 'Digital I/O', desc: '上游 I2C 時脈；上拉至 VDPUM' },
      { num: 21, name: 'A1', side: 'R', type: 'Digital In', desc: '位址輸入 1；接 VDD2 或 GND' },
      { num: 20, name: 'SC7', side: 'R', type: 'Digital I/O', desc: '下游通道 7 時脈' },
      { num: 19, name: 'SD7', side: 'R', type: 'Digital I/O', desc: '下游通道 7 資料' },
      { num: 18, name: 'SC6', side: 'R', type: 'Digital I/O', desc: '下游通道 6 時脈' },
      { num: 17, name: 'SD6', side: 'R', type: 'Digital I/O', desc: '下游通道 6 資料' },
      { num: 16, name: 'SC5', side: 'R', type: 'Digital I/O', desc: '下游通道 5 時脈' },
      { num: 15, name: 'SD5', side: 'R', type: 'Digital I/O', desc: '下游通道 5 資料' },
      { num: 14, name: 'SC4', side: 'R', type: 'Digital I/O', desc: '下游通道 4 時脈' },
      { num: 13, name: 'SD4', side: 'R', type: 'Digital I/O', desc: '下游通道 4 資料' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '8 通道 I2C 多工器（上游 1 → 下游 8 選 1）' }, { k: '通道', v: '8（SC0/SD0 ~ SC7/SD7）' },
      { k: '電平轉換', v: '各下游可獨立上拉電壓（VDPUx）' }, { k: '位址', v: 'A0/A1（可程式）' },
      { k: '速度', v: '最高 1MHz（Fm+）' }, { k: '復位', v: 'RESET（active-low）' },
      { k: '電源', v: 'VDD1 邏輯 + VDD2 核心（超低壓）' }, { k: '封裝', v: 'TSSOP-24 (PW) / VQFN-24 (RGE)' }
    ],
    secondSource: ['封裝 + pinout 相容（PW TSSOP-24、pin-to-pin）', '通道數相同（8 通道）', '功能相同（多工器：同時只通一路）', '位址腳 A0/A1 相容', '各通道電平轉換能力相容', '速度涵蓋（≥1MHz）', 'RESET 行為相容', '電源範圍涵蓋', '工作溫度涵蓋'],
    dropIn: [{ part: 'TCA9848', note: '同 24-pin 腳位相同；TCA9848 為「開關」(可同時通多路)，TCA9847 為「多工器」(僅通一路)，行為不同需確認' }]
  },
  {
    part: 'TCA9848', mfr: 'Texas Instruments', category: 'switch-mux',
    subcategory: '8 通道 I2C 開關 (超低壓, 1MHz)', package: 'TSSOP-24 (PW) / VQFN-24 (RGE)',
    whatIs: '8 通道 I2C 開關：上游 I2C(SCL/SDA) 可同時連通一個或多個下游通道(SC0/SD0~SC7/SD7)。與 TCA9847 同腳位，差別在可同時開多路（開關 vs 多工器）。',
    func: '主機經 I2C 寫暫存器選通任意組合下游通道（可多路同時，異於 9847 僅一路）。各通道隔離電容、可獨立上拉電壓做電平轉換。A0/A1 位址、RESET(active-low) 復位。',
    usedIn: '需同時廣播/隔離多組 I2C 裝置、相同位址裝置擴展、I2C 通道電平轉換、模組化系統匯流排切換。',
    desc: '8 通道超低壓 I2C 開關（可同時通多路），各通道獨立電平、1MHz、RESET（TSSOP/VQFN-24）。',
    datasheet: 'IC-spec/tca9848.pdf',
    pins: [
      { num: 1, name: 'VDD1', side: 'L', type: 'Power', desc: '邏輯準位電源' },
      { num: 2, name: 'A0', side: 'L', type: 'Digital In', desc: '位址輸入 0；接 VDD2 或 GND' },
      { num: 3, name: '{RESET}', side: 'L', type: 'Digital In', desc: '復位（active-low）；不用則上拉至 VDD2/VDPUM' },
      { num: 4, name: 'SD0', side: 'L', type: 'Digital I/O', desc: '下游通道 0 資料；上拉至 VDPU0' },
      { num: 5, name: 'SC0', side: 'L', type: 'Digital I/O', desc: '下游通道 0 時脈' },
      { num: 6, name: 'SD1', side: 'L', type: 'Digital I/O', desc: '下游通道 1 資料' },
      { num: 7, name: 'SC1', side: 'L', type: 'Digital I/O', desc: '下游通道 1 時脈' },
      { num: 8, name: 'SD2', side: 'L', type: 'Digital I/O', desc: '下游通道 2 資料' },
      { num: 9, name: 'SC2', side: 'L', type: 'Digital I/O', desc: '下游通道 2 時脈' },
      { num: 10, name: 'SD3', side: 'L', type: 'Digital I/O', desc: '下游通道 3 資料' },
      { num: 11, name: 'SC3', side: 'L', type: 'Digital I/O', desc: '下游通道 3 時脈' },
      { num: 12, name: 'GND', side: 'L', type: 'Ground', desc: '接地' },
      { num: 24, name: 'VDD2', side: 'R', type: 'Power', desc: '核心邏輯電源' },
      { num: 23, name: 'SDA', side: 'R', type: 'Digital I/O', desc: '上游 I2C 資料；上拉至 VDPUM' },
      { num: 22, name: 'SCL', side: 'R', type: 'Digital I/O', desc: '上游 I2C 時脈；上拉至 VDPUM' },
      { num: 21, name: 'A1', side: 'R', type: 'Digital In', desc: '位址輸入 1；接 VDD2 或 GND' },
      { num: 20, name: 'SC7', side: 'R', type: 'Digital I/O', desc: '下游通道 7 時脈' },
      { num: 19, name: 'SD7', side: 'R', type: 'Digital I/O', desc: '下游通道 7 資料' },
      { num: 18, name: 'SC6', side: 'R', type: 'Digital I/O', desc: '下游通道 6 時脈' },
      { num: 17, name: 'SD6', side: 'R', type: 'Digital I/O', desc: '下游通道 6 資料' },
      { num: 16, name: 'SC5', side: 'R', type: 'Digital I/O', desc: '下游通道 5 時脈' },
      { num: 15, name: 'SD5', side: 'R', type: 'Digital I/O', desc: '下游通道 5 資料' },
      { num: 14, name: 'SC4', side: 'R', type: 'Digital I/O', desc: '下游通道 4 時脈' },
      { num: 13, name: 'SD4', side: 'R', type: 'Digital I/O', desc: '下游通道 4 資料' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '8 通道 I2C 開關（可同時通多路）' }, { k: '通道', v: '8（SC0/SD0 ~ SC7/SD7）' },
      { k: '電平轉換', v: '各下游可獨立上拉電壓（VDPUx）' }, { k: '位址', v: 'A0/A1（可程式）' },
      { k: '速度', v: '最高 1MHz（Fm+）' }, { k: '復位', v: 'RESET（active-low）' },
      { k: '電源', v: 'VDD1 邏輯 + VDD2 核心（超低壓）' }, { k: '封裝', v: 'TSSOP-24 (PW) / VQFN-24 (RGE)' }
    ],
    secondSource: ['封裝 + pinout 相容（PW TSSOP-24、pin-to-pin）', '通道數相同（8 通道）', '功能相同（開關：可同時通多路）', '位址腳 A0/A1 相容', '各通道電平轉換能力相容', '速度涵蓋（≥1MHz）', 'RESET 行為相容', '電源範圍涵蓋', '工作溫度涵蓋'],
    dropIn: [{ part: 'TCA9847', note: '同 24-pin 腳位相同；TCA9847 為「多工器」(僅通一路)，TCA9848 為「開關」(可同時通多路)，行為不同需確認' }]
  },
  {
    part: 'HD3SS3220L', mfr: 'Texas Instruments', category: 'switch-mux',
    subcategory: 'USB Type-C DRP 埠控制器 + SuperSpeed Mux', package: 'VQFN-30 (RNH) 含散熱墊',
    whatIs: 'USB Type-C 雙角色埠(DRP)控制器，內含 SuperSpeed 多工開關：自動偵測 CC 線判斷正反插與角色(DFP/UFP/DRP)，並把 USB3 SuperSpeed 訊號依插向切換到正確差動對。可選 I2C 或 GPIO 控制。',
    func: 'CC1/CC2 偵測 Type-C 連接、電流廣播與正反插；依方向用內建 SS mux 把 TX/RX 切到 TX1/RX1 或 TX2/RX2；DIR 輸出插向；PORT/ADDR/CURRENT_MODE 三態腳設模式與位址；I2C(SCL/SDA) 或 GPIO 控制；ENn_CC/ENn_MUX 致能。VBUS_DET 偵測 UFP 連接。',
    usedIn: 'USB Type-C 主機/裝置/雙角色埠、筆電/平板/手機 Type-C 介面、Type-C 擴充塢與轉接、SuperSpeed 訊號路由。',
    desc: 'USB Type-C DRP 埠控制器含 SS mux，CC 偵測/正反插切換、I2C 或 GPIO 控制、DIR 輸出（VQFN-30）。',
    datasheet: 'IC-spec/hd3ss3220l.pdf',
    pins: [
      { num: 1, name: 'CC2', side: 'L', type: 'Analog I/O', desc: 'Type-C 配置通道訊號 2' },
      { num: 2, name: 'CC1', side: 'L', type: 'Analog I/O', desc: 'Type-C 配置通道訊號 1' },
      { num: 3, name: 'CURRENT_MODE', side: 'L', type: 'Digital In', desc: '三態：DFP 電流廣播設定（內部 250K 下拉）' },
      { num: 4, name: 'PORT', side: 'L', type: 'Digital In', desc: '三態：埠模式（H=DFP / NC=DRP / L=UFP）' },
      { num: 5, name: 'VBUS_DET', side: 'L', type: 'Analog In', desc: 'VBUS 偵測輸入(5~28V)；串 900K 至系統 VBUS' },
      { num: 6, name: 'TXp', side: 'L', type: 'I/O', desc: '主機/裝置側 USB SS TX 正' },
      { num: 7, name: 'TXn', side: 'L', type: 'I/O', desc: '主機/裝置側 USB SS TX 負' },
      { num: 8, name: 'VCC33', side: 'L', type: 'Power', desc: '3.3V 電源' },
      { num: 9, name: 'RXp', side: 'L', type: 'I/O', desc: '主機/裝置側 USB SS RX 正' },
      { num: 10, name: 'RXn', side: 'L', type: 'I/O', desc: '主機/裝置側 USB SS RX 負' },
      { num: 11, name: 'DIR', side: 'L', type: 'Digital Out', desc: 'Type-C 插向輸出（開汲極，需 200K 上拉）' },
      { num: 12, name: 'ENn_MUX', side: 'L', type: 'Digital In', desc: 'MUX 致能（active-low；L=正常、H=關閉）' },
      { num: 13, name: 'GND', side: 'L', type: 'Ground', desc: '接地' },
      { num: 14, name: 'RX1n', side: 'L', type: 'I/O', desc: 'Type-C 埠 SS RX1 負' },
      { num: 15, name: 'RX1p', side: 'L', type: 'I/O', desc: 'Type-C 埠 SS RX1 正' },
      { num: 30, name: 'VDD5', side: 'R', type: 'Power', desc: '5V 電源' },
      { num: 29, name: 'ENn_CC', side: 'R', type: 'Digital In', desc: 'CC 控制器致能（active-low）' },
      { num: 28, name: 'GND', side: 'R', type: 'Ground', desc: '接地' },
      { num: 27, name: 'ID', side: 'R', type: 'Digital Out', desc: '開汲極；source(DFP/DRP-as-DFP) 偵測連接時拉低' },
      { num: 26, name: 'SCL/OUT2', side: 'R', type: 'Digital I/O', desc: 'I2C 時脈 / GPIO 模式 OUT2（雙功能）' },
      { num: 25, name: 'SDA/OUT1', side: 'R', type: 'Digital I/O', desc: 'I2C 資料 / GPIO 模式 OUT1（雙功能）' },
      { num: 24, name: 'VCONN_FAULT_N', side: 'R', type: 'Digital Out', desc: '開汲極；VCONN 過流時拉低' },
      { num: 23, name: 'INT_N/OUT3', side: 'R', type: 'Digital Out', desc: 'I2C 中斷(開汲極) / GPIO OUT3（L 版為 NC）' },
      { num: 22, name: 'ADDR', side: 'R', type: 'Digital In', desc: '三態：I2C 位址/GPIO 模式選擇（H=0x67 / NC=GPIO / L=0x47）' },
      { num: 21, name: 'TX2p', side: 'R', type: 'I/O', desc: 'Type-C 埠 SS TX2 正' },
      { num: 20, name: 'TX2n', side: 'R', type: 'I/O', desc: 'Type-C 埠 SS TX2 負' },
      { num: 19, name: 'RX2p', side: 'R', type: 'I/O', desc: 'Type-C 埠 SS RX2 正' },
      { num: 18, name: 'RX2n', side: 'R', type: 'I/O', desc: 'Type-C 埠 SS RX2 負' },
      { num: 17, name: 'TX1p', side: 'R', type: 'I/O', desc: 'Type-C 埠 SS TX1 正' },
      { num: 16, name: 'TX1n', side: 'R', type: 'I/O', desc: 'Type-C 埠 SS TX1 負' },
      { num: 31, name: 'GND', side: 'T', type: 'Ground（EP）', desc: '散熱墊；必須接 GND', ep: true }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: 'USB Type-C DRP 埠控制器 + SuperSpeed mux' }, { k: '角色', v: 'DFP / UFP / DRP（PORT 腳選）' },
      { k: 'CC 偵測', v: 'CC1/CC2 正反插、電流廣播、連接偵測' }, { k: 'SS mux', v: '依插向切 TX1/RX1 或 TX2/RX2' },
      { k: '控制', v: 'I2C（位址 0x47/0x67）或 GPIO 模式（ADDR 腳選）' }, { k: '電源', v: 'VCC33 (3.3V) + VDD5 (5V)' },
      { k: '插向輸出', v: 'DIR（開汲極）' }, { k: 'VBUS 偵測', v: 'VBUS_DET 5~28V' },
      { k: '封裝', v: 'VQFN-30 (RNH)，散熱墊接 GND' }
    ],
    secondSource: ['封裝 + pinout 相容（RNH VQFN-30、pin-to-pin）', '功能相同（Type-C DRP + SS mux）', '角色支援涵蓋（DFP/UFP/DRP）', '控制介面相容（I2C 位址/GPIO）', 'SuperSpeed 速率涵蓋（USB3.x）', 'CC 邏輯/電流廣播相容', '電源軌相容（3.3V/5V）', 'GPIO 雙功能腳行為相容（注意 L 版 OUT3=NC）', '工作溫度涵蓋'],
    dropIn: [{ part: 'HD3SS3220', note: '同 RNH VQFN-30 腳位；HD3SS3220 的 INT_N/OUT3(pin23) 在 GPIO 模式有 OUT3，HD3SS3220L 該腳為 NC' }]
  },
  {
    part: 'SN74LVC1G00B-Q1', mfr: 'Texas Instruments', category: 'logic',
    subcategory: '單閘 2 輸入 NAND 閘 (車規)', package: 'SOT-23-5 / SC70-5 / X2SON-5',
    whatIs: '單顆 2 輸入 NAND 邏輯閘：Y = NOT(A AND B)。LVC 系列、1.65~5.5V 寬電源、車規 AEC-Q100，做膠合邏輯/訊號反相組合。',
    func: 'A、B 皆高時 Y 才低，其餘 Y 高。LVC CMOS、輸入可耐 5V、軌對軌輸出。單閘小封裝適合就近放在訊號旁省 PCB。',
    usedIn: '膠合邏輯、致能/中斷訊號組合、時脈閘控、電平相容介面的邏輯運算。',
    desc: '車規單閘 2 輸入 NAND，LVC、1.65~5.5V、5V 輸入耐受（SOT-23-5/SC70-5）。',
    datasheet: 'IC-spec/sn74lvc1g00b-q1.pdf',
    pins: [
      { num: 1, name: 'A', side: 'L', type: 'Digital In', desc: '輸入 A' },
      { num: 2, name: 'B', side: 'L', type: 'Digital In', desc: '輸入 B' },
      { num: 3, name: 'GND', side: 'L', type: 'Ground', desc: '接地' },
      { num: 5, name: 'VCC', side: 'R', type: 'Power', desc: '電源；接 0.1µF 去耦' },
      { num: 4, name: 'Y', side: 'R', type: 'Digital Out', desc: '輸出 Y = NOT(A·B)' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '單閘 2 輸入 NAND（Y=NOT(A·B)）' }, { k: '系列', v: 'LVC（CMOS、5V 輸入耐受）' },
      { k: '電源', v: '1.65 ~ 5.5 V' }, { k: '認證', v: '車規 AEC-Q100' }, { k: '封裝', v: 'SOT-23-5 / SC70-5 / X2SON-5' }
    ],
    secondSource: ['封裝 + pinout 相容（SOT-23-5、pin-to-pin）', '功能相同（2 輸入 NAND）', '電源範圍涵蓋（1.65~5.5V）', '5V 輸入耐受相容', '速度/驅動同等或更佳', '車規認證涵蓋', '工作溫度涵蓋'],
    dropIn: [{ part: 'SN74LVC1G02B-Q1', note: '同 SOT-23-5 腳位；但 1G02B 為 NOR 閘（功能不同，僅腳位相容）' }]
  },
  {
    part: 'SN74LVC1G02B-Q1', mfr: 'Texas Instruments', category: 'logic',
    subcategory: '單閘 2 輸入 NOR 閘 (車規)', package: 'SOT-23-5 / SC70-5 / X2SON-5',
    whatIs: '單顆 2 輸入 NOR 邏輯閘：Y = NOT(A OR B)。LVC、1.65~5.5V、車規。與 1G00B 同腳位（NOR vs NAND）。',
    func: 'A、B 皆低時 Y 才高，其餘 Y 低。LVC CMOS、5V 輸入耐受、軌對軌輸出。',
    usedIn: '膠合邏輯、訊號合併/反相、致能組合、時脈閘控。',
    desc: '車規單閘 2 輸入 NOR，LVC、1.65~5.5V、5V 輸入耐受（SOT-23-5/SC70-5）。',
    datasheet: 'IC-spec/sn74lvc1g02b-q1.pdf',
    pins: [
      { num: 1, name: 'A', side: 'L', type: 'Digital In', desc: '輸入 A' },
      { num: 2, name: 'B', side: 'L', type: 'Digital In', desc: '輸入 B' },
      { num: 3, name: 'GND', side: 'L', type: 'Ground', desc: '接地' },
      { num: 5, name: 'VCC', side: 'R', type: 'Power', desc: '電源；接 0.1µF 去耦' },
      { num: 4, name: 'Y', side: 'R', type: 'Digital Out', desc: '輸出 Y = NOT(A+B)' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '單閘 2 輸入 NOR（Y=NOT(A+B)）' }, { k: '系列', v: 'LVC（5V 輸入耐受）' },
      { k: '電源', v: '1.65 ~ 5.5 V' }, { k: '認證', v: '車規 AEC-Q100' }, { k: '封裝', v: 'SOT-23-5 / SC70-5 / X2SON-5' }
    ],
    secondSource: ['封裝 + pinout 相容（SOT-23-5、pin-to-pin）', '功能相同（2 輸入 NOR）', '電源範圍涵蓋', '5V 輸入耐受相容', '速度/驅動同等或更佳', '車規認證涵蓋', '工作溫度涵蓋'],
    dropIn: [{ part: 'SN74LVC1G00B-Q1', note: '同 SOT-23-5 腳位；1G00B 為 NAND 閘（功能不同）' }]
  },
  {
    part: 'SN74LVC1G132B-Q1', mfr: 'Texas Instruments', category: 'logic',
    subcategory: '單閘 2 輸入 NAND (Schmitt 觸發, 車規)', package: 'SOT-23-5 / SC70-5 / X2SON-5',
    whatIs: '單顆 2 輸入 NAND 閘，輸入帶 Schmitt 觸發（遲滯）：Y = NOT(A AND B)。遲滯讓慢速/雜訊訊號整形成乾淨方波。LVC、車規。',
    func: 'A、B 皆高 Y 才低；輸入 Schmitt 遲滯抗雜訊、可接慢上升訊號。1.65~5.5V、5V 輸入耐受。',
    usedIn: '雜訊訊號整形 + 邏輯、按鍵去抖動、慢速時脈整形、RC 振盪。',
    desc: '車規單閘 2 輸入 NAND（Schmitt 輸入），LVC、1.65~5.5V（SOT-23-5）。',
    datasheet: 'IC-spec/sn74lvc1g132b-q1.pdf',
    pins: [
      { num: 1, name: 'A', side: 'L', type: 'Digital In', desc: '輸入 A（Schmitt）' },
      { num: 2, name: 'B', side: 'L', type: 'Digital In', desc: '輸入 B（Schmitt）' },
      { num: 3, name: 'GND', side: 'L', type: 'Ground', desc: '接地' },
      { num: 5, name: 'VCC', side: 'R', type: 'Power', desc: '電源；接 0.1µF 去耦' },
      { num: 4, name: 'Y', side: 'R', type: 'Digital Out', desc: '輸出 Y = NOT(A·B)' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '2 輸入 NAND + Schmitt 輸入' }, { k: '系列', v: 'LVC（5V 輸入耐受）' },
      { k: '電源', v: '1.65 ~ 5.5 V' }, { k: '認證', v: '車規 AEC-Q100' }, { k: '封裝', v: 'SOT-23-5 / SC70-5 / X2SON-5' }
    ],
    secondSource: ['封裝 + pinout 相容（SOT-23-5、pin-to-pin）', '功能相同（2 輸入 NAND + Schmitt）', '遲滯量同等', '電源範圍涵蓋', '5V 輸入耐受相容', '車規認證涵蓋', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'SN74LVC1G10B-Q1', mfr: 'Texas Instruments', category: 'logic',
    subcategory: '單閘 3 輸入 NAND 閘 (車規)', package: 'SC70-6 / X2SON-6',
    whatIs: '單顆 3 輸入 NAND 閘：Y = NOT(A AND B AND C)。LVC、1.65~5.5V、車規。',
    func: 'A、B、C 皆高 Y 才低。LVC CMOS、5V 輸入耐受、軌對軌輸出。',
    usedIn: '三條件膠合邏輯、致能組合、位址解碼。',
    desc: '車規單閘 3 輸入 NAND，LVC、1.65~5.5V（SC70-6）。',
    datasheet: 'IC-spec/sn74lvc1g10b-q1.pdf',
    pins: [
      { num: 1, name: 'A', side: 'L', type: 'Digital In', desc: '輸入 A' },
      { num: 2, name: 'GND', side: 'L', type: 'Ground', desc: '接地' },
      { num: 3, name: 'B', side: 'L', type: 'Digital In', desc: '輸入 B' },
      { num: 6, name: 'C', side: 'R', type: 'Digital In', desc: '輸入 C' },
      { num: 5, name: 'VCC', side: 'R', type: 'Power', desc: '電源；接 0.1µF 去耦' },
      { num: 4, name: 'Y', side: 'R', type: 'Digital Out', desc: '輸出 Y = NOT(A·B·C)' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '單閘 3 輸入 NAND' }, { k: '系列', v: 'LVC（5V 輸入耐受）' },
      { k: '電源', v: '1.65 ~ 5.5 V' }, { k: '認證', v: '車規 AEC-Q100' }, { k: '封裝', v: 'SC70-6 / X2SON-6' }
    ],
    secondSource: ['封裝 + pinout 相容（SC70-6、pin-to-pin）', '功能相同（3 輸入 NAND）', '電源範圍涵蓋', '5V 輸入耐受相容', '車規認證涵蓋', '工作溫度涵蓋'],
    dropIn: [{ part: 'SN74LVC1G11B-Q1', note: '同 SC70-6 腳位；1G11B 為 3 輸入 AND（功能不同）' }]
  },
  {
    part: 'SN74LVC1G11B-Q1', mfr: 'Texas Instruments', category: 'logic',
    subcategory: '單閘 3 輸入 AND 閘 (車規)', package: 'SC70-6 / X2SON-6',
    whatIs: '單顆 3 輸入 AND 閘：Y = A AND B AND C。LVC、1.65~5.5V、車規。與 1G10B 同腳位（AND vs NAND）。',
    func: 'A、B、C 皆高 Y 才高。LVC CMOS、5V 輸入耐受、軌對軌輸出。',
    usedIn: '三條件膠合邏輯、致能組合、位址解碼。',
    desc: '車規單閘 3 輸入 AND，LVC、1.65~5.5V（SC70-6）。',
    datasheet: 'IC-spec/sn74lvc1g11b-q1.pdf',
    pins: [
      { num: 1, name: 'A', side: 'L', type: 'Digital In', desc: '輸入 A' },
      { num: 2, name: 'GND', side: 'L', type: 'Ground', desc: '接地' },
      { num: 3, name: 'B', side: 'L', type: 'Digital In', desc: '輸入 B' },
      { num: 6, name: 'C', side: 'R', type: 'Digital In', desc: '輸入 C' },
      { num: 5, name: 'VCC', side: 'R', type: 'Power', desc: '電源；接 0.1µF 去耦' },
      { num: 4, name: 'Y', side: 'R', type: 'Digital Out', desc: '輸出 Y = A·B·C' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '單閘 3 輸入 AND' }, { k: '系列', v: 'LVC（5V 輸入耐受）' },
      { k: '電源', v: '1.65 ~ 5.5 V' }, { k: '認證', v: '車規 AEC-Q100' }, { k: '封裝', v: 'SC70-6 / X2SON-6' }
    ],
    secondSource: ['封裝 + pinout 相容（SC70-6、pin-to-pin）', '功能相同（3 輸入 AND）', '電源範圍涵蓋', '5V 輸入耐受相容', '車規認證涵蓋', '工作溫度涵蓋'],
    dropIn: [{ part: 'SN74LVC1G10B-Q1', note: '同 SC70-6 腳位；1G10B 為 3 輸入 NAND（功能不同）' }]
  },
  {
    part: 'SN74LVC1G14B-Q1', mfr: 'Texas Instruments', category: 'logic',
    subcategory: '單閘 Schmitt 觸發反相器 (車規)', package: 'SOT-23-5 / SC70-5 / X2SON-5',
    whatIs: '單顆 Schmitt 觸發反相器：Y = NOT A，輸入帶遲滯整形雜訊/慢訊號。LVC、1.65~5.5V、車規。',
    func: '輸入 Schmitt 遲滯把慢上升或含雜訊訊號整成乾淨方波後反相輸出。常用於 RC 延遲/振盪、訊號整形。',
    usedIn: '訊號整形/去抖、慢速時脈整形、RC 振盪器、復位延遲。',
    desc: '車規單閘 Schmitt 反相器，LVC、1.65~5.5V（SOT-23-5）。',
    datasheet: 'IC-spec/sn74lvc1g14b-q1.pdf',
    pins: [
      { num: 1, name: 'NC', side: 'L', type: 'No Connect', desc: '未內接' },
      { num: 2, name: 'A', side: 'L', type: 'Digital In', desc: '輸入（Schmitt）' },
      { num: 3, name: 'GND', side: 'L', type: 'Ground', desc: '接地' },
      { num: 5, name: 'VCC', side: 'R', type: 'Power', desc: '電源；接 0.1µF 去耦' },
      { num: 4, name: 'Y', side: 'R', type: 'Digital Out', desc: '輸出 Y = NOT A' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: 'Schmitt 觸發反相器（Y=NOT A）' }, { k: '系列', v: 'LVC（5V 輸入耐受）' },
      { k: '電源', v: '1.65 ~ 5.5 V' }, { k: '認證', v: '車規 AEC-Q100' }, { k: '封裝', v: 'SOT-23-5 / SC70-5 / X2SON-5' }
    ],
    secondSource: ['封裝 + pinout 相容（SOT-23-5、pin-to-pin）', '功能相同（Schmitt 反相器）', '遲滯量同等', '電源範圍涵蓋', '5V 輸入耐受相容', '車規認證涵蓋', '工作溫度涵蓋'],
    dropIn: [{ part: 'SN74LVC1G17B-Q1', note: '同 SOT-23-5 腳位；1G17B 為 Schmitt 緩衝（非反相），功能不同' }]
  },
  {
    part: 'SN74LVC1G17B-Q1', mfr: 'Texas Instruments', category: 'logic',
    subcategory: '單閘 Schmitt 觸發緩衝器 (車規)', package: 'SOT-23-5 / SC70-5 / X2SON-5',
    whatIs: '單顆 Schmitt 觸發緩衝器：Y = A（非反相），輸入帶遲滯整形。LVC、1.65~5.5V、車規。與 1G14B 同腳位（緩衝 vs 反相）。',
    func: '輸入 Schmitt 遲滯整形後同相輸出，做訊號整形/緩衝隔離、加大驅動。',
    usedIn: '訊號整形/緩衝、慢速時脈整形、線路驅動、復位延遲。',
    desc: '車規單閘 Schmitt 緩衝器，LVC、1.65~5.5V（SOT-23-5）。',
    datasheet: 'IC-spec/sn74lvc1g17b-q1.pdf',
    pins: [
      { num: 1, name: 'NC', side: 'L', type: 'No Connect', desc: '未內接' },
      { num: 2, name: 'A', side: 'L', type: 'Digital In', desc: '輸入（Schmitt）' },
      { num: 3, name: 'GND', side: 'L', type: 'Ground', desc: '接地' },
      { num: 5, name: 'VCC', side: 'R', type: 'Power', desc: '電源；接 0.1µF 去耦' },
      { num: 4, name: 'Y', side: 'R', type: 'Digital Out', desc: '輸出 Y = A' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: 'Schmitt 觸發緩衝器（Y=A）' }, { k: '系列', v: 'LVC（5V 輸入耐受）' },
      { k: '電源', v: '1.65 ~ 5.5 V' }, { k: '認證', v: '車規 AEC-Q100' }, { k: '封裝', v: 'SOT-23-5 / SC70-5 / X2SON-5' }
    ],
    secondSource: ['封裝 + pinout 相容（SOT-23-5、pin-to-pin）', '功能相同（Schmitt 緩衝）', '遲滯量同等', '電源範圍涵蓋', '5V 輸入耐受相容', '車規認證涵蓋', '工作溫度涵蓋'],
    dropIn: [{ part: 'SN74LVC1G14B-Q1', note: '同 SOT-23-5 腳位；1G14B 為 Schmitt 反相器，功能不同' }]
  },
  {
    part: 'SN74LVC1G125B-Q1', mfr: 'Texas Instruments', category: 'logic',
    subcategory: '單閘三態緩衝器 (OE active-low, 車規)', package: 'SOT-23-5 / SC70-5 / X2SON-5',
    whatIs: '單顆三態輸出緩衝器：OE 低時 Y=A，OE 高時 Y 高阻抗。用於匯流排共用/方向控制。LVC、車規。',
    func: 'OE（active-low）致能時把 A 緩衝到 Y；除能時 Y 三態(高阻)讓出匯流排。1.65~5.5V、5V 輸入耐受。',
    usedIn: '匯流排共用、三態訊號驅動、多裝置共線、方向控制。',
    desc: '車規單閘三態緩衝器（OE active-low），LVC、1.65~5.5V（SOT-23-5）。',
    datasheet: 'IC-spec/sn74lvc1g125b-q1.pdf',
    pins: [
      { num: 1, name: '{OE}', side: 'L', type: 'Digital In', desc: '輸出致能（active-low；低致能、高則三態）' },
      { num: 2, name: 'A', side: 'L', type: 'Digital In', desc: '輸入 A' },
      { num: 3, name: 'GND', side: 'L', type: 'Ground', desc: '接地' },
      { num: 5, name: 'VCC', side: 'R', type: 'Power', desc: '電源；接 0.1µF 去耦' },
      { num: 4, name: 'Y', side: 'R', type: 'Digital Out', desc: '三態輸出 Y' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '三態緩衝器（OE active-low）' }, { k: '系列', v: 'LVC（5V 輸入耐受）' },
      { k: '電源', v: '1.65 ~ 5.5 V' }, { k: '認證', v: '車規 AEC-Q100' }, { k: '封裝', v: 'SOT-23-5 / SC70-5 / X2SON-5' }
    ],
    secondSource: ['封裝 + pinout 相容（SOT-23-5、pin-to-pin）', '功能相同（三態緩衝）', 'OE 極性相同（active-low）', '電源範圍涵蓋', '5V 輸入耐受相容', '車規認證涵蓋', '工作溫度涵蓋'],
    dropIn: [{ part: 'SN74LVC1G126B-Q1', note: '同 SOT-23-5 腳位；1G126B 的 OE 為 active-high（極性相反）' }]
  },
  {
    part: 'SN74LVC1G126B-Q1', mfr: 'Texas Instruments', category: 'logic',
    subcategory: '單閘三態緩衝器 (OE active-high, 車規)', package: 'SOT-23-5 / SC70-5 / X2SON-5',
    whatIs: '單顆三態輸出緩衝器：OE 高時 Y=A，OE 低時 Y 高阻抗。與 1G125B 同腳位（OE 極性相反）。LVC、車規。',
    func: 'OE（active-high）致能時 A 緩衝到 Y；除能時三態。1.65~5.5V、5V 輸入耐受。',
    usedIn: '匯流排共用、三態驅動、多裝置共線、方向控制。',
    desc: '車規單閘三態緩衝器（OE active-high），LVC、1.65~5.5V（SOT-23-5）。',
    datasheet: 'IC-spec/sn74lvc1g126b-q1.pdf',
    pins: [
      { num: 1, name: 'OE', side: 'L', type: 'Digital In', desc: '輸出致能（active-high；高致能、低則三態）' },
      { num: 2, name: 'A', side: 'L', type: 'Digital In', desc: '輸入 A' },
      { num: 3, name: 'GND', side: 'L', type: 'Ground', desc: '接地' },
      { num: 5, name: 'VCC', side: 'R', type: 'Power', desc: '電源；接 0.1µF 去耦' },
      { num: 4, name: 'Y', side: 'R', type: 'Digital Out', desc: '三態輸出 Y' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '三態緩衝器（OE active-high）' }, { k: '系列', v: 'LVC（5V 輸入耐受）' },
      { k: '電源', v: '1.65 ~ 5.5 V' }, { k: '認證', v: '車規 AEC-Q100' }, { k: '封裝', v: 'SOT-23-5 / SC70-5 / X2SON-5' }
    ],
    secondSource: ['封裝 + pinout 相容（SOT-23-5、pin-to-pin）', '功能相同（三態緩衝）', 'OE 極性相同（active-high）', '電源範圍涵蓋', '5V 輸入耐受相容', '車規認證涵蓋', '工作溫度涵蓋'],
    dropIn: [{ part: 'SN74LVC1G125B-Q1', note: '同 SOT-23-5 腳位；1G125B 的 OE 為 active-low（極性相反）' }]
  },
  {
    part: 'SN74LVC1G240B-Q1', mfr: 'Texas Instruments', category: 'logic',
    subcategory: '單閘三態反相器 (OE active-low, 車規)', package: 'SOT-23-5 / SC70-5 / X2SON-5',
    whatIs: '單顆三態輸出反相緩衝器：OE 低時 Y=NOT A，OE 高時三態。LVC、車規。做反相 + 匯流排驅動。',
    func: 'OE（active-low）致能時把 A 反相緩衝到 Y；除能時三態。1.65~5.5V、5V 輸入耐受。',
    usedIn: '反相 + 匯流排驅動、三態反相訊號、時脈反相分送。',
    desc: '車規單閘三態反相器（OE active-low），LVC、1.65~5.5V（SOT-23-5）。',
    datasheet: 'IC-spec/sn74lvc1g240b-q1.pdf',
    pins: [
      { num: 1, name: '{OE}', side: 'L', type: 'Digital In', desc: '輸出致能（active-low；低致能、高則三態）' },
      { num: 2, name: 'A', side: 'L', type: 'Digital In', desc: '輸入 A' },
      { num: 3, name: 'GND', side: 'L', type: 'Ground', desc: '接地' },
      { num: 5, name: 'VCC', side: 'R', type: 'Power', desc: '電源；接 0.1µF 去耦' },
      { num: 4, name: 'Y', side: 'R', type: 'Digital Out', desc: '三態反相輸出 Y = NOT A' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '三態反相器（OE active-low）' }, { k: '系列', v: 'LVC（5V 輸入耐受）' },
      { k: '電源', v: '1.65 ~ 5.5 V' }, { k: '認證', v: '車規 AEC-Q100' }, { k: '封裝', v: 'SOT-23-5 / SC70-5 / X2SON-5' }
    ],
    secondSource: ['封裝 + pinout 相容（SOT-23-5、pin-to-pin）', '功能相同（三態反相）', 'OE 極性相同（active-low）', '電源範圍涵蓋', '5V 輸入耐受相容', '車規認證涵蓋', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'SN74LVC1G175B-Q1', mfr: 'Texas Instruments', category: 'logic',
    subcategory: '單顆 D 型正反器 (非同步清除, 車規)', package: 'SOT-23-6 / SC70-6 / X2SON-6',
    whatIs: '單顆 D 型正反器（D Flip-Flop）：CLK 上升緣把 D 鎖存到 Q，CLR 非同步清除。LVC、車規。做單位元暫存/分頻/同步。',
    func: 'CLK 正緣取樣 D → Q；CLR（active-low）拉低時不論時脈立即把 Q 清 0。1.65~5.5V、5V 輸入耐受。',
    usedIn: '單位元暫存、除頻(÷2)、訊號同步/去亞穩態、邊緣偵測。',
    desc: '車規單顆 D 正反器（非同步 CLR），LVC、1.65~5.5V（SOT-23-6）。',
    datasheet: 'IC-spec/sn74lvc1g175b-q1.pdf',
    pins: [
      { num: 1, name: 'CLK', side: 'L', type: 'Digital In', desc: '時脈輸入（上升緣取樣）' },
      { num: 2, name: 'GND', side: 'L', type: 'Ground', desc: '接地' },
      { num: 3, name: 'D', side: 'L', type: 'Digital In', desc: '資料輸入' },
      { num: 6, name: '{CLR}', side: 'R', type: 'Digital In', desc: '非同步清除（active-low；低則 Q 清 0）' },
      { num: 5, name: 'VCC', side: 'R', type: 'Power', desc: '電源；接 0.1µF 去耦' },
      { num: 4, name: 'Q', side: 'R', type: 'Digital Out', desc: '輸出 Q' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: 'D 型正反器（CLK 正緣、非同步 CLR）' }, { k: '系列', v: 'LVC（5V 輸入耐受）' },
      { k: '電源', v: '1.65 ~ 5.5 V' }, { k: '認證', v: '車規 AEC-Q100' }, { k: '封裝', v: 'SOT-23-6 / SC70-6 / X2SON-6' }
    ],
    secondSource: ['封裝 + pinout 相容（SOT-23-6、pin-to-pin）', '功能相同（D-FF + 非同步 CLR）', 'CLR 極性相同（active-low）', '電源範圍涵蓋', '5V 輸入耐受相容', '車規認證涵蓋', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'SN74LVC14B', mfr: 'Texas Instruments', category: 'logic',
    subcategory: '六路 Schmitt 觸發反相器', package: 'TSSOP-14 / SOIC-14 等',
    whatIs: '六路 Schmitt 觸發反相器：6 個獨立的反相器，每個輸入帶遲滯整形雜訊/慢訊號。LVC、1.65~5.5V。',
    func: '每路 nA→nY，Y=NOT A，輸入 Schmitt 遲滯。6 路獨立，常做多路訊號整形/反相、RC 振盪。',
    usedIn: '多路訊號整形/去抖、慢速時脈整形、RC 振盪、復位延遲。',
    desc: '六路 LVC Schmitt 反相器，1.65~5.5V、5V 輸入耐受（TSSOP/SOIC-14）。',
    datasheet: 'IC-spec/sn74lvc14b.pdf',
    pins: [
      { num: 1, name: '1A', side: 'L', type: 'Digital In', desc: '通道 1 輸入（Schmitt）' },
      { num: 2, name: '1Y', side: 'L', type: 'Digital Out', desc: '通道 1 輸出 = NOT 1A' },
      { num: 3, name: '2A', side: 'L', type: 'Digital In', desc: '通道 2 輸入' },
      { num: 4, name: '2Y', side: 'L', type: 'Digital Out', desc: '通道 2 輸出' },
      { num: 5, name: '3A', side: 'L', type: 'Digital In', desc: '通道 3 輸入' },
      { num: 6, name: '3Y', side: 'L', type: 'Digital Out', desc: '通道 3 輸出' },
      { num: 7, name: 'GND', side: 'L', type: 'Ground', desc: '接地' },
      { num: 14, name: 'VCC', side: 'R', type: 'Power', desc: '電源；接 0.1µF 去耦' },
      { num: 13, name: '6A', side: 'R', type: 'Digital In', desc: '通道 6 輸入' },
      { num: 12, name: '6Y', side: 'R', type: 'Digital Out', desc: '通道 6 輸出' },
      { num: 11, name: '5A', side: 'R', type: 'Digital In', desc: '通道 5 輸入' },
      { num: 10, name: '5Y', side: 'R', type: 'Digital Out', desc: '通道 5 輸出' },
      { num: 9, name: '4A', side: 'R', type: 'Digital In', desc: '通道 4 輸入' },
      { num: 8, name: '4Y', side: 'R', type: 'Digital Out', desc: '通道 4 輸出' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '六路 Schmitt 反相器' }, { k: '系列', v: 'LVC（5V 輸入耐受）' },
      { k: '電源', v: '1.65 ~ 5.5 V' }, { k: '封裝', v: 'TSSOP-14 / SOIC-14' }
    ],
    secondSource: ['封裝 + pinout 相容（14-pin、pin-to-pin）', '功能相同（六路 Schmitt 反相）', '遲滯量同等', '電源範圍涵蓋', '5V 輸入耐受相容', '速度/驅動同等或更佳', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'SN74AC157-Q1', mfr: 'Texas Instruments', category: 'logic',
    subcategory: '四路 2:1 資料選擇器/多工器 (車規)', package: 'TSSOP-16 / SOIC-16',
    whatIs: '四路 2:1 資料選擇器（多工器）：一條 A/B 選擇線同時決定 4 路各自從 A 或 B 輸入取值送到 Y。G(strobe) 致能。AC 系列、車規。',
    func: 'A/B=低時各路 nY=nA、高時 nY=nB；G(active-low strobe)高則全部 Y 輸出低。一鍵切換 4 位元來源。2~5.5V。',
    usedIn: '匯流排來源切換、4 位元資料選擇、位址/資料多工、雙來源切換。',
    desc: '車規四路 2:1 資料選擇器/多工器，共用選擇線 + strobe，AC 系列（TSSOP/SOIC-16）。',
    datasheet: 'IC-spec/sn74ac157-q1.pdf',
    pins: [
      { num: 1, name: 'A/B', side: 'L', type: 'Digital In', desc: '來源選擇（低=選 A、高=選 B）' },
      { num: 2, name: '1A', side: 'L', type: 'Digital In', desc: '通道 1 資料 A' },
      { num: 3, name: '1B', side: 'L', type: 'Digital In', desc: '通道 1 資料 B' },
      { num: 4, name: '1Y', side: 'L', type: 'Digital Out', desc: '通道 1 輸出' },
      { num: 5, name: '2A', side: 'L', type: 'Digital In', desc: '通道 2 資料 A' },
      { num: 6, name: '2B', side: 'L', type: 'Digital In', desc: '通道 2 資料 B' },
      { num: 7, name: '2Y', side: 'L', type: 'Digital Out', desc: '通道 2 輸出' },
      { num: 8, name: 'GND', side: 'L', type: 'Ground', desc: '接地' },
      { num: 16, name: 'VCC', side: 'R', type: 'Power', desc: '電源；接 0.1µF 去耦' },
      { num: 15, name: '{G}', side: 'R', type: 'Digital In', desc: '輸出 strobe（active-low；高則 Y 全低）' },
      { num: 14, name: '4A', side: 'R', type: 'Digital In', desc: '通道 4 資料 A' },
      { num: 13, name: '4B', side: 'R', type: 'Digital In', desc: '通道 4 資料 B' },
      { num: 12, name: '4Y', side: 'R', type: 'Digital Out', desc: '通道 4 輸出' },
      { num: 11, name: '3A', side: 'R', type: 'Digital In', desc: '通道 3 資料 A' },
      { num: 10, name: '3B', side: 'R', type: 'Digital In', desc: '通道 3 資料 B' },
      { num: 9, name: '3Y', side: 'R', type: 'Digital Out', desc: '通道 3 輸出' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '四路 2:1 資料選擇器/多工器' }, { k: '控制', v: 'A/B 選擇線 + G strobe(active-low)' },
      { k: '系列', v: 'AC（CMOS）' }, { k: '電源', v: '2 ~ 5.5 V' }, { k: '認證', v: '車規 AEC-Q100' },
      { k: '封裝', v: 'TSSOP-16 / SOIC-16（散熱墊接 GND 或浮接）' }
    ],
    secondSource: ['封裝 + pinout 相容（16-pin、pin-to-pin）', '功能相同（四路 2:1 mux）', '選擇/strobe 極性相同', '電源範圍涵蓋', '速度/驅動同等或更佳', '車規認證涵蓋', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: '74LVC4066-Q100', mfr: 'Nexperia', category: 'logic',
    subcategory: '四路雙向類比開關 (Quad Bilateral Switch)', package: 'SO14 / TSSOP14 / DHVQFN14',
    whatIs: '四路雙向類比/數位開關：4 個獨立 SPST 開關，每個由控制腳 nE 決定 nY↔nZ 是否導通。雙向、可傳類比或數位。LVC、車規。',
    func: '每路 nE 高導通 nY↔nZ、低斷開；訊號雙向、低 Ron。可做訊號選路、取樣保持、訊號閘控。1.2~3.6V（LVC）。',
    usedIn: '類比/數位訊號選路、取樣保持、訊號閘控、感測器多工。',
    desc: '四路雙向類比開關（quad bilateral switch），各路獨立 E 控制、雙向（SO14/TSSOP14）。',
    datasheet: 'IC-spec/74LVC4066_Q100.pdf',
    pins: [
      { num: 1, name: '1Y', side: 'L', type: 'Analog I/O', desc: '開關 1 端 Y（雙向）' },
      { num: 2, name: '1Z', side: 'L', type: 'Analog I/O', desc: '開關 1 端 Z（雙向）' },
      { num: 3, name: '2Z', side: 'L', type: 'Analog I/O', desc: '開關 2 端 Z' },
      { num: 4, name: '2Y', side: 'L', type: 'Analog I/O', desc: '開關 2 端 Y' },
      { num: 5, name: '2E', side: 'L', type: 'Digital In', desc: '開關 2 控制（高導通）' },
      { num: 6, name: '3E', side: 'L', type: 'Digital In', desc: '開關 3 控制（高導通）' },
      { num: 7, name: 'GND', side: 'L', type: 'Ground', desc: '接地' },
      { num: 14, name: 'VCC', side: 'R', type: 'Power', desc: '電源；接 0.1µF 去耦' },
      { num: 13, name: '1E', side: 'R', type: 'Digital In', desc: '開關 1 控制（高導通）' },
      { num: 12, name: '4E', side: 'R', type: 'Digital In', desc: '開關 4 控制（高導通）' },
      { num: 11, name: '4Y', side: 'R', type: 'Analog I/O', desc: '開關 4 端 Y' },
      { num: 10, name: '4Z', side: 'R', type: 'Analog I/O', desc: '開關 4 端 Z' },
      { num: 9, name: '3Z', side: 'R', type: 'Analog I/O', desc: '開關 3 端 Z' },
      { num: 8, name: '3Y', side: 'R', type: 'Analog I/O', desc: '開關 3 端 Y' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '四路雙向類比開關（4× SPST）' }, { k: '控制', v: '每路 nE（高導通）' },
      { k: '系列', v: 'LVC（CMOS）' }, { k: '電源', v: '1.2 ~ 3.6 V（見 datasheet）' }, { k: '認證', v: '車規 AEC-Q100' },
      { k: '封裝', v: 'SO14 / TSSOP14 / DHVQFN14（散熱墊非接地、浮接或接 GND）' }
    ],
    secondSource: ['封裝 + pinout 相容（14-pin、pin-to-pin）', '功能相同（4 路雙向開關）', '控制極性相同（E 高導通）', 'Ron 同等或更低', '電源範圍涵蓋', '車規認證涵蓋', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'TPUL1G113', mfr: 'Texas Instruments', category: 'logic',
    subcategory: '單顆可重觸發脈衝產生器 (單穩態, RC 計時)', package: 'VSSOP-8 (DCU)',
    whatIs: '單顆可重觸發脈衝產生器（單穩態 / one-shot）：觸發後輸出一個由外接 RC 決定寬度的脈衝。支援上升緣與下降緣觸發、非同步清除。',
    func: '觸發(上升或下降緣)後 Q 輸出固定寬度脈衝，寬度由 RC/C 外接時序元件設定；可重觸發(觸發延長脈衝)；CLR(active-low)立即結束脈衝。做延時、脈衝整形、看門狗。',
    usedIn: '延時/脈衝整形、邊緣偵測產生固定脈衝、看門狗計時、去抖延時。',
    desc: '單顆可重觸發脈衝產生器（單穩態），RC 計時、雙緣觸發、非同步 CLR（VSSOP-8）。',
    datasheet: 'IC-spec/tpul1g113.pdf',
    pins: [
      { num: 1, name: '{T}', side: 'L', type: 'Digital In', desc: '下降緣觸發輸入（需 T 與 CLR 維持高）' },
      { num: 2, name: 'T', side: 'L', type: 'Digital In', desc: '上升緣觸發輸入（需 T̄ 低、CLR 高）' },
      { num: 3, name: '{CLR}', side: 'L', type: 'Digital In', desc: '非同步清除（active-low）；亦可作上升緣觸發' },
      { num: 4, name: 'GND', side: 'L', type: 'Ground', desc: '接地' },
      { num: 8, name: 'VCC', side: 'R', type: 'Power', desc: '電源；接 0.1µF 去耦' },
      { num: 7, name: 'RC', side: 'R', type: 'Analog I/O', desc: '外接 RC 時序節點' },
      { num: 6, name: 'C', side: 'R', type: 'Ground', desc: '外接時序電容負端（內部接地、放電回路）' },
      { num: 5, name: 'Q', side: 'R', type: 'Digital Out', desc: '脈衝輸出' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '可重觸發單穩態脈衝產生器' }, { k: '觸發', v: '上升緣 + 下降緣（雙緣）' },
      { k: '計時', v: '外接 RC（RC/C 腳）' }, { k: '清除', v: 'CLR（active-low，非同步）' },
      { k: '封裝', v: 'VSSOP-8 (DCU)' }
    ],
    secondSource: ['封裝 + pinout 相容（DCU VSSOP-8、pin-to-pin）', '功能相同（可重觸發單穩態）', '觸發緣相容（雙緣）', 'RC 計時範圍涵蓋', 'CLR 極性相同（active-low）', '電源範圍涵蓋', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'TXG4122', mfr: 'Texas Instruments', category: 'logic',
    subcategory: '雙向接地電位轉換器 (±40V, I2C)', package: 'WSON-8 (DSG) / SOT-23-8 (DDF) / SOIC-8 (D)',
    whatIs: '±40V 雙向接地電位（ground-level）轉換器：在兩個接地電位差達 ±40V 的 I2C 域之間傳遞 SCL/SDA。不只是電壓準位，連「地」都不同也能橋接。',
    func: '側 1(VCC1/GND1) 與側 2(VCC2/GND2) 之間，把 I2C 的 SCL/SDA 雙向轉換，容許兩側接地相差 ±40V。開汲極相容、雙向自動。解決不同地電位子系統間的 I2C 通訊。',
    usedIn: '不同接地電位的子系統 I2C 橋接、電池組/電源域間通訊、馬達/逆變器內 I2C、地迴路隔離前的電位轉換。',
    desc: '±40V 雙向接地電位轉換器（I2C），兩側 VCC/GND 獨立、開汲極相容（WSON/SOT-23/SOIC-8）。',
    datasheet: 'IC-spec/txg4122.pdf',
    pins: [
      { num: 1, name: 'VCC1', side: 'L', type: 'Power', desc: '側 1 電源' },
      { num: 2, name: 'SDA1', side: 'L', type: 'Digital I/O', desc: '側 1 I2C 資料' },
      { num: 3, name: 'SCL1', side: 'L', type: 'Digital I/O', desc: '側 1 I2C 時脈' },
      { num: 4, name: 'GND1', side: 'L', type: 'Ground', desc: '側 1 接地（參考 VCC1）' },
      { num: 8, name: 'VCC2', side: 'R', type: 'Power', desc: '側 2 電源' },
      { num: 7, name: 'SDA2', side: 'R', type: 'Digital I/O', desc: '側 2 I2C 資料' },
      { num: 6, name: 'SCL2', side: 'R', type: 'Digital I/O', desc: '側 2 I2C 時脈' },
      { num: 5, name: 'GND2', side: 'R', type: 'Ground', desc: '側 2 接地（參考 VCC2，可與 GND1 差 ±40V）' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '雙向接地電位轉換器（I2C SCL/SDA）' }, { k: '接地電位差', v: '±40V（兩側 GND 可差 ±40V）' },
      { k: '介面', v: 'I2C（開汲極相容、雙向自動）' }, { k: '電源', v: '兩側獨立 VCC1/VCC2' },
      { k: '封裝', v: 'WSON-8 (DSG) / SOT-23-8 (DDF) / SOIC-8 (D)' }
    ],
    secondSource: ['封裝 + pinout 相容（pin-to-pin）', '功能相同（雙向接地電位 I2C 轉換）', '接地電位差涵蓋（±40V）', 'I2C 開汲極/速度相容', '兩側電源範圍涵蓋', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'SN74CBTLV3245A-Q1', mfr: 'Texas Instruments', category: 'logic',
    subcategory: '八位元 FET 匯流排開關 (低壓, 車規)', package: 'TSSOP-20 (DGV) / VQFN-20 (RKS)',
    whatIs: '八位元(octal) FET 匯流排開關：8 條獨立通道，A↔B 由單一 OE 同時控制通斷，導通時低電阻近零壓降直通。雙向、車規。做整組匯流排隔離/共用。',
    func: 'OE（active-low）低時 8 路 A↔B 全部直通(低 Ron)，高時全部斷開高阻抗。不做邏輯、不放大，整組 8 位元匯流排通斷/隔離。低壓 ≤3.6V。',
    usedIn: '8 位元匯流排隔離/共用、記憶體/位址匯流排切換、熱插拔隔離、訊號路由。',
    desc: '車規八位元 FET 匯流排開關，單 OE(active-low)、低 Ron、雙向直通（TSSOP/VQFN-20）。',
    datasheet: 'IC-spec/sn74cbtlv3245a-q1.pdf',
    pins: [
      { num: 1, name: 'NC', side: 'L', type: 'No Connect', desc: '未內接；可接 GND 或浮接' },
      { num: 2, name: 'A1', side: 'L', type: 'Digital I/O', desc: '通道 1 端 A（雙向）' },
      { num: 3, name: 'A2', side: 'L', type: 'Digital I/O', desc: '通道 2 端 A' },
      { num: 4, name: 'A3', side: 'L', type: 'Digital I/O', desc: '通道 3 端 A' },
      { num: 5, name: 'A4', side: 'L', type: 'Digital I/O', desc: '通道 4 端 A' },
      { num: 6, name: 'A5', side: 'L', type: 'Digital I/O', desc: '通道 5 端 A' },
      { num: 7, name: 'A6', side: 'L', type: 'Digital I/O', desc: '通道 6 端 A' },
      { num: 8, name: 'A7', side: 'L', type: 'Digital I/O', desc: '通道 7 端 A' },
      { num: 9, name: 'A8', side: 'L', type: 'Digital I/O', desc: '通道 8 端 A' },
      { num: 10, name: 'GND', side: 'L', type: 'Ground', desc: '接地' },
      { num: 20, name: 'VCC', side: 'R', type: 'Power', desc: '電源；接 0.1µF 去耦' },
      { num: 19, name: '{OE}', side: 'R', type: 'Digital In', desc: '輸出致能（active-low；低則全通、高則全斷）' },
      { num: 18, name: 'B1', side: 'R', type: 'Digital I/O', desc: '通道 1 端 B' },
      { num: 17, name: 'B2', side: 'R', type: 'Digital I/O', desc: '通道 2 端 B' },
      { num: 16, name: 'B3', side: 'R', type: 'Digital I/O', desc: '通道 3 端 B' },
      { num: 15, name: 'B4', side: 'R', type: 'Digital I/O', desc: '通道 4 端 B' },
      { num: 14, name: 'B5', side: 'R', type: 'Digital I/O', desc: '通道 5 端 B' },
      { num: 13, name: 'B6', side: 'R', type: 'Digital I/O', desc: '通道 6 端 B' },
      { num: 12, name: 'B7', side: 'R', type: 'Digital I/O', desc: '通道 7 端 B' },
      { num: 11, name: 'B8', side: 'R', type: 'Digital I/O', desc: '通道 8 端 B' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '八位元 FET 匯流排開關（雙向直通）' }, { k: '致能', v: '單一 OE（active-low，同時控 8 路）' },
      { k: '通道', v: '8（A1/B1 ~ A8/B8）' }, { k: '導通方式', v: '低 Ron FET 直通、近零壓降' },
      { k: '電源', v: '低壓 ≤3.6V（見 datasheet）' }, { k: '認證', v: '車規 AEC-Q100' },
      { k: '封裝', v: 'TSSOP-20 (DGV) / VQFN-20 (RKS)' }
    ],
    secondSource: ['封裝 + pinout 相容（20-pin、pin-to-pin）', '通道數相同（8 位元）', '致能極性相同（OE active-low）', 'Ron 同等或更低', '電源範圍涵蓋', '匯流排電容/頻寬同等', '車規認證涵蓋', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'SN74CBTLV3257-Q1', mfr: 'Texas Instruments', category: 'logic',
    subcategory: '四位元 1-of-2 FET 多工器/解多工器 (低壓, 車規)', package: 'TSSOP-16 / SOIC-16',
    whatIs: '四位元 1-of-2 FET 多工/解多工器：4 路各有一個共用端 nA 與兩個分支 nB1/nB2，用單一 S 選擇 nA 接 nB1 或 nB2。雙向、低 Ron、車規。',
    func: 'S=低時各路 nA↔nB1、高時 nA↔nB2；OE(active-low)致能。雙向直通(非邏輯)，可當 mux(多選一)或 demux(一分多)。低壓 ≤3.6V。',
    usedIn: '4 位元訊號二選一路由、匯流排切換、雙路徑選擇、記憶體/介面切換。',
    desc: '車規四位元 1-of-2 FET 多工/解多工器，單 S 選擇 + OE(active-low)、雙向（TSSOP/SOIC-16）。',
    datasheet: 'IC-spec/sn74cbtlv3257-q1.pdf',
    pins: [
      { num: 1, name: 'S', side: 'L', type: 'Digital In', desc: '選擇（低=接 B1、高=接 B2）' },
      { num: 2, name: '1B1', side: 'L', type: 'Digital I/O', desc: '通道 1 分支 1（雙向）' },
      { num: 3, name: '1B2', side: 'L', type: 'Digital I/O', desc: '通道 1 分支 2' },
      { num: 4, name: '1A', side: 'L', type: 'Digital I/O', desc: '通道 1 共用端' },
      { num: 5, name: '2B1', side: 'L', type: 'Digital I/O', desc: '通道 2 分支 1' },
      { num: 6, name: '2B2', side: 'L', type: 'Digital I/O', desc: '通道 2 分支 2' },
      { num: 7, name: '2A', side: 'L', type: 'Digital I/O', desc: '通道 2 共用端' },
      { num: 8, name: 'GND', side: 'L', type: 'Ground', desc: '接地' },
      { num: 16, name: 'VCC', side: 'R', type: 'Power', desc: '電源；接 0.1µF 去耦' },
      { num: 15, name: '{OE}', side: 'R', type: 'Digital In', desc: '輸出致能（active-low；高則全斷）' },
      { num: 14, name: '4B1', side: 'R', type: 'Digital I/O', desc: '通道 4 分支 1' },
      { num: 13, name: '4B2', side: 'R', type: 'Digital I/O', desc: '通道 4 分支 2' },
      { num: 12, name: '4A', side: 'R', type: 'Digital I/O', desc: '通道 4 共用端' },
      { num: 11, name: '3B1', side: 'R', type: 'Digital I/O', desc: '通道 3 分支 1' },
      { num: 10, name: '3B2', side: 'R', type: 'Digital I/O', desc: '通道 3 分支 2' },
      { num: 9, name: '3A', side: 'R', type: 'Digital I/O', desc: '通道 3 共用端' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '四位元 1-of-2 FET 多工/解多工器（雙向）' }, { k: '控制', v: '單 S 選擇 + OE(active-low)' },
      { k: '通道', v: '4（各 1 共用 A + 2 分支 B1/B2）' }, { k: '導通方式', v: '低 Ron FET 直通' },
      { k: '電源', v: '低壓 ≤3.6V（見 datasheet）' }, { k: '認證', v: '車規 AEC-Q100' },
      { k: '封裝', v: 'TSSOP-16 / SOIC-16' }
    ],
    secondSource: ['封裝 + pinout 相容（16-pin、pin-to-pin）', '功能相同（4 位元 1-of-2 mux/demux）', '選擇/OE 極性相同', 'Ron 同等或更低', '電源範圍涵蓋', '車規認證涵蓋', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'SN54SC1G08-SEP', mfr: 'Texas Instruments', category: 'logic',
    subcategory: '單閘 2 輸入 AND 閘 (耐輻射 SEP)', package: 'SOT-23-5 / SC70-5',
    whatIs: '單顆 2 輸入 AND 閘（耐輻射 SEP）：Y = A AND B。SC 系列耐單事件、航太級。',
    func: 'A、B 皆高 Y 才高。耐輻射(SEP)、寬電源、適合太空/高可靠。',
    usedIn: '太空/航太膠合邏輯、耐輻射致能組合、高可靠系統邏輯。',
    desc: '耐輻射單閘 2 輸入 AND（SEP），SC 系列（SOT-23-5/SC70-5）。',
    datasheet: 'IC-spec/sn54sc1g08-sep.pdf',
    pins: [
      { num: 1, name: 'A', side: 'L', type: 'Digital In', desc: '輸入 A' },
      { num: 2, name: 'B', side: 'L', type: 'Digital In', desc: '輸入 B' },
      { num: 3, name: 'GND', side: 'L', type: 'Ground', desc: '接地' },
      { num: 5, name: 'VCC', side: 'R', type: 'Power', desc: '電源；接 0.1µF 去耦' },
      { num: 4, name: 'Y', side: 'R', type: 'Digital Out', desc: '輸出 Y = A·B' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '單閘 2 輸入 AND（Y=A·B）' }, { k: '系列', v: 'SC（耐輻射）' },
      { k: '耐輻射', v: 'SEP（單事件防護，航太級）' }, { k: '封裝', v: 'SOT-23-5 / SC70-5' }
    ],
    secondSource: ['封裝 + pinout 相容（SOT-23-5、pin-to-pin）', '功能相同（2 輸入 AND）', '耐輻射等級涵蓋（SEP）', '電源範圍涵蓋', '速度/驅動同等或更佳', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'SN54SC1G125-SEP', mfr: 'Texas Instruments', category: 'logic',
    subcategory: '單閘三態匯流排緩衝器 (OE active-low, 耐輻射 SEP)', package: 'SOT-23-5 / SC70-5',
    whatIs: '單顆三態匯流排緩衝器（耐輻射 SEP）：OE 低時 Y=A、高時三態。SC 系列耐單事件、航太級。',
    func: 'OE(active-low)致能把 A 緩衝到 Y、除能三態讓出匯流排。耐輻射、寬電源。',
    usedIn: '太空/航太匯流排共用、三態驅動、耐輻射訊號緩衝。',
    desc: '耐輻射單閘三態緩衝器（OE active-low、SEP），SC 系列（SOT-23-5/SC70-5）。',
    datasheet: 'IC-spec/sn54sc1g125-sep.pdf',
    pins: [
      { num: 1, name: '{OE}', side: 'L', type: 'Digital In', desc: '輸出致能（active-low；低致能、高則三態）' },
      { num: 2, name: 'A', side: 'L', type: 'Digital In', desc: '輸入 A' },
      { num: 3, name: 'GND', side: 'L', type: 'Ground', desc: '接地' },
      { num: 5, name: 'VCC', side: 'R', type: 'Power', desc: '電源；接 0.1µF 去耦' },
      { num: 4, name: 'Y', side: 'R', type: 'Digital Out', desc: '三態輸出 Y' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '三態匯流排緩衝器（OE active-low）' }, { k: '系列', v: 'SC（耐輻射）' },
      { k: '耐輻射', v: 'SEP（單事件防護，航太級）' }, { k: '封裝', v: 'SOT-23-5 / SC70-5' }
    ],
    secondSource: ['封裝 + pinout 相容（SOT-23-5、pin-to-pin）', '功能相同（三態緩衝）', 'OE 極性相同（active-low）', '耐輻射等級涵蓋（SEP）', '電源範圍涵蓋', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'SN55LVRA4-SEP', mfr: 'Texas Instruments', category: 'logic',
    subcategory: '四通道高速差動(LVDS)接收器 (耐輻射 SEP)', package: 'SOIC-16 / CFP-16 等',
    whatIs: '四通道高速差動(LVDS)接收器：把 4 對 LVDS 差動輸入(nA/nB)轉成 LVTTL 單端輸出(nY)。兩組致能腳(一高態、一低態)。耐輻射 SEP、航太級。',
    func: '每路比較 nA(非反相)、nB(反相) 差動電壓 → nY 輸出 LVTTL；兩個致能 G(pin4 高態) 與 G(pin12 低態) 共同控制輸出致能。耐輻射、適合太空高速資料鏈。',
    usedIn: '太空/航太 LVDS 高速資料接收、背板差動鏈、感測器差動訊號接收。',
    desc: '耐輻射四通道 LVDS 接收器（→LVTTL），雙致能、SEP（SOIC-16）。',
    datasheet: 'IC-spec/sn55lvra4-sep.pdf',
    pins: [
      { num: 1, name: '1B', side: 'L', type: 'Analog In', desc: '通道 1 LVDS 反相輸入' },
      { num: 2, name: '1A', side: 'L', type: 'Analog In', desc: '通道 1 LVDS 非反相輸入' },
      { num: 3, name: '1Y', side: 'L', type: 'Digital Out', desc: '通道 1 LVTTL 輸出' },
      { num: 4, name: 'G', side: 'L', type: 'Digital In', desc: '致能（高態致能）' },
      { num: 5, name: '2Y', side: 'L', type: 'Digital Out', desc: '通道 2 LVTTL 輸出' },
      { num: 6, name: '2A', side: 'L', type: 'Analog In', desc: '通道 2 LVDS 非反相輸入' },
      { num: 7, name: '2B', side: 'L', type: 'Analog In', desc: '通道 2 LVDS 反相輸入' },
      { num: 8, name: 'GND', side: 'L', type: 'Ground', desc: '接地' },
      { num: 16, name: 'VCC', side: 'R', type: 'Power', desc: '電源；接 0.1µF 去耦' },
      { num: 15, name: '4B', side: 'R', type: 'Analog In', desc: '通道 4 LVDS 反相輸入' },
      { num: 14, name: '4A', side: 'R', type: 'Analog In', desc: '通道 4 LVDS 非反相輸入' },
      { num: 13, name: '4Y', side: 'R', type: 'Digital Out', desc: '通道 4 LVTTL 輸出' },
      { num: 12, name: '{G}', side: 'R', type: 'Digital In', desc: '致能（低態致能，active-low）' },
      { num: 11, name: '3Y', side: 'R', type: 'Digital Out', desc: '通道 3 LVTTL 輸出' },
      { num: 10, name: '3A', side: 'R', type: 'Analog In', desc: '通道 3 LVDS 非反相輸入' },
      { num: 9, name: '3B', side: 'R', type: 'Analog In', desc: '通道 3 LVDS 反相輸入' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '四通道 LVDS 接收器（→LVTTL）' }, { k: '致能', v: '雙致能 G(高態,pin4) + G(低態,pin12)' },
      { k: '系列', v: 'LVRA（耐輻射）' }, { k: '耐輻射', v: 'SEP（單事件防護，航太級）' },
      { k: '封裝', v: 'SOIC-16 / CFP-16' }
    ],
    secondSource: ['封裝 + pinout 相容（16-pin、pin-to-pin）', '通道數相同（4 路 LVDS 接收）', '輸入型態相同（LVDS）/輸出 LVTTL', '致能腳極性相容（雙致能）', '耐輻射等級涵蓋（SEP）', '速率同等或更高', '電源範圍涵蓋', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'ISOTMP35R', mfr: 'Texas Instruments', category: 'sensors',
    subcategory: '隔離式類比溫度感測器 (5kVRMS 強化隔離)', package: 'Wide-body DFP-12',
    whatIs: '隔離式類比溫度感測器：在高壓側量溫度，經 5kVRMS 強化隔離障壁把溫度以類比電壓(VOUT)送到低壓側。±2.0°C 精度，免外部隔離器。',
    func: '高壓側 TSENSE 腳(多腳並接、貼近熱源)感測溫度，內部跨隔離障壁傳到低壓側轉成 VOUT 類比電壓(0.1~2.0V，10mV/°C 類)。VDD 供電低壓側。做功率元件/高壓母線測溫又要電氣隔離。',
    usedIn: '功率模組/IGBT/SiC 接面測溫、馬達/逆變器高壓側溫度、電源母線測溫、需強化隔離的工業測溫。',
    desc: '5kVRMS 強化隔離類比溫度感測器，±2.0°C、VOUT 類比輸出、TSENSE 貼熱源（Wide-body DFP-12）。',
    datasheet: 'IC-spec/isotmp35r.pdf',
    pins: [
      { num: 1, name: 'VDD', side: 'L', type: 'Power', desc: '電源輸入（低壓側）；0.1µF 去耦近 VDD/GND' },
      { num: 2, name: 'NC', side: 'L', type: 'No Connect', desc: '未內接；可浮接或接 GND（接 GND 改善 EMI）' },
      { num: 3, name: 'VOUT', side: 'L', type: 'Analog Out', desc: '類比輸出電壓，正比於溫度（0.1~2.0V）' },
      { num: 4, name: 'NC', side: 'L', type: 'No Connect', desc: '未內接；可浮接或接 GND' },
      { num: 5, name: 'GND', side: 'L', type: 'Ground', desc: '接地參考（低壓側）' },
      { num: 6, name: 'NC', side: 'L', type: 'No Connect', desc: '未內接；可浮接或接 GND' },
      { num: 7, name: 'TSENSE', side: 'R', type: 'Thermal Sense', desc: '隔離側溫度感測節點（貼近熱源；多腳並接）' },
      { num: 8, name: 'TSENSE', side: 'R', type: 'Thermal Sense', desc: '隔離側溫度感測節點（並接）' },
      { num: 9, name: 'TSENSE', side: 'R', type: 'Thermal Sense', desc: '隔離側溫度感測節點（並接）' },
      { num: 10, name: 'TSENSE', side: 'R', type: 'Thermal Sense', desc: '隔離側溫度感測節點（並接）' },
      { num: 11, name: 'TSENSE', side: 'R', type: 'Thermal Sense', desc: '隔離側溫度感測節點（並接）' },
      { num: 12, name: 'TSENSE', side: 'R', type: 'Thermal Sense', desc: '隔離側溫度感測節點（並接）' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '隔離式類比溫度感測器' }, { k: '隔離', v: '5kVRMS 強化隔離（reinforced）' },
      { k: '精度', v: '±2.0°C' }, { k: '輸出', v: 'VOUT 類比 0.1~2.0V（0°C 偏移 500mV）' },
      { k: '感測腳', v: 'TSENSE ×6 並接（貼近熱源）' }, { k: '電源', v: '單一 VDD（低壓側）' },
      { k: '封裝', v: 'Wide-body DFP-12' }
    ],
    secondSource: ['封裝 + pinout 相容（DFP-12、pin-to-pin）', '隔離等級涵蓋（≥5kVRMS 強化）', '精度同等或更佳（±2.0°C）', '輸出型態相容（類比 VOUT、偏移/斜率）', 'TSENSE 配置相容', '電源範圍涵蓋', '工作溫度涵蓋'],
    dropIn: [{ part: 'ISOTMP35R-Q1', note: '車規版、同 DFP-12 腳位相同（精度 ±2.5°C）' }]
  },
  {
    part: 'ISOTMP35R-Q1', mfr: 'Texas Instruments', category: 'sensors',
    subcategory: '隔離式類比溫度感測器 (5kVRMS 強化隔離, 車規)', package: 'Wide-body DFP-12',
    whatIs: '隔離式類比溫度感測器（車規 Q1）：±2.5°C、5kVRMS 強化隔離，高壓側測溫經障壁送類比 VOUT 到低壓側。與 ISOTMP35R 同腳位、加車規認證。',
    func: '同 ISOTMP35R：TSENSE 高壓側感溫、跨隔離傳 VOUT 類比輸出。車規 AEC-Q100。',
    usedIn: '車用功率模組/SiC/IGBT 接面測溫、EV 逆變器高壓側溫度、車載高壓母線測溫。',
    desc: '車規 5kVRMS 強化隔離類比溫度感測器，±2.5°C、VOUT 類比（與 ISOTMP35R 同腳位，DFP-12）。',
    datasheet: 'IC-spec/isotmp35r-q1.pdf',
    pins: [
      { num: 1, name: 'VDD', side: 'L', type: 'Power', desc: '電源輸入（低壓側）；需低噪供電與去耦' },
      { num: 2, name: 'NC', side: 'L', type: 'No Connect', desc: '未內接；高 EMI 環境建議接 GND' },
      { num: 3, name: 'VOUT', side: 'L', type: 'Analog Out', desc: '類比輸出電壓，正比於溫度' },
      { num: 4, name: 'NC', side: 'L', type: 'No Connect', desc: '未內接；建議接 GND' },
      { num: 5, name: 'GND', side: 'L', type: 'Ground', desc: '接地參考（低壓側）' },
      { num: 6, name: 'NC', side: 'L', type: 'No Connect', desc: '未內接；建議接 GND' },
      { num: 7, name: 'TSENSE', side: 'R', type: 'Thermal Sense', desc: '隔離側溫度感測節點（貼近熱源；多腳並接）' },
      { num: 8, name: 'TSENSE', side: 'R', type: 'Thermal Sense', desc: '隔離側溫度感測節點（並接）' },
      { num: 9, name: 'TSENSE', side: 'R', type: 'Thermal Sense', desc: '隔離側溫度感測節點（並接）' },
      { num: 10, name: 'TSENSE', side: 'R', type: 'Thermal Sense', desc: '隔離側溫度感測節點（並接）' },
      { num: 11, name: 'TSENSE', side: 'R', type: 'Thermal Sense', desc: '隔離側溫度感測節點（並接）' },
      { num: 12, name: 'TSENSE', side: 'R', type: 'Thermal Sense', desc: '隔離側溫度感測節點（並接）' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '隔離式類比溫度感測器（車規）' }, { k: '隔離', v: '5kVRMS 強化隔離' },
      { k: '精度', v: '±2.5°C' }, { k: '輸出', v: 'VOUT 類比' }, { k: '認證', v: '車規 AEC-Q100 (Q1)' },
      { k: '感測腳', v: 'TSENSE ×6 並接' }, { k: '封裝', v: 'Wide-body DFP-12' }
    ],
    secondSource: ['封裝 + pinout 相容（DFP-12、pin-to-pin）', '隔離等級涵蓋（≥5kVRMS）', '精度同等或更佳', '輸出型態相容（類比 VOUT）', '車規認證涵蓋（Q1）', '電源範圍涵蓋', '工作溫度涵蓋'],
    dropIn: [{ part: 'ISOTMP35R', note: '非車規版、同 DFP-12 腳位相同（精度 ±2.0°C）' }]
  },
  {
    part: 'LM50HV', mfr: 'Texas Instruments', category: 'sensors',
    subcategory: '類比攝氏溫度感測器 (10mV/°C)', package: 'SOT-23-3 / TO-92',
    whatIs: '業界標準類比攝氏溫度感測器：輸出電壓線性正比於攝氏溫度(10mV/°C)，含負溫偏移，單顆 3 腳免校正即可量 −40~125°C。',
    func: 'VO = 10mV/°C × T + 500mV 偏移（可量負溫不需負電源）。單電源、低功耗，直接接 ADC 讀溫。HV 版耐更高供電。',
    usedIn: '電子產品環境/板溫監測、電池溫度、家電/HVAC 測溫、過溫保護前端。',
    desc: '類比攝氏溫度感測器 10mV/°C，單電源、含偏移可量負溫（SOT-23-3 / TO-92）。',
    datasheet: 'IC-spec/lm50hv.pdf',
    pins: [
      { num: 1, name: '+VS', side: 'L', type: 'Power', desc: '正電源' },
      { num: 2, name: 'VO', side: 'L', type: 'Analog Out', desc: '溫度感測類比輸出（10mV/°C + 500mV 偏移）' },
      { num: 3, name: 'GND', side: 'R', type: 'Ground', desc: '接地（接電源負端）' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '類比攝氏溫度感測器' }, { k: '斜率', v: '10 mV/°C' },
      { k: '偏移', v: '500mV @ 0°C（可量負溫）' }, { k: '供電', v: '單電源（HV 版較高）' },
      { k: '封裝', v: 'SOT-23-3 / TO-92' }
    ],
    secondSource: ['封裝 + pinout 相容（SOT-23-3、pin-to-pin）', '輸出斜率/偏移相同（10mV/°C、500mV）', '精度同等或更佳', '供電範圍涵蓋（HV）', '輸出負載驅動相容', '工作溫度涵蓋'],
    dropIn: [{ part: 'LM50HV-Q1', note: '車規版、同 SOT-23-3 腳位相同' }]
  },
  {
    part: 'LM50HV-Q1', mfr: 'Texas Instruments', category: 'sensors',
    subcategory: '類比攝氏溫度感測器 (10mV/°C, 車規)', package: 'SOT-23-3',
    whatIs: '業界標準類比攝氏溫度感測器（車規 Grade 0/1）：10mV/°C 線性輸出、含偏移可量負溫。與 LM50HV 同腳位、加車規認證。',
    func: '同 LM50HV：VO = 10mV/°C × T + 500mV 偏移，單電源直接接 ADC。車規 AEC-Q100。',
    usedIn: '車用環境/板溫監測、電池/動力系統測溫、車載過溫保護。',
    desc: '車規類比攝氏溫度感測器 10mV/°C，單電源、含偏移（與 LM50HV 同腳位，SOT-23-3）。',
    datasheet: 'IC-spec/lm50hv-q1.pdf',
    pins: [
      { num: 1, name: '+VS', side: 'L', type: 'Power', desc: '正電源' },
      { num: 2, name: 'VO', side: 'L', type: 'Analog Out', desc: '溫度感測類比輸出（10mV/°C + 500mV 偏移）' },
      { num: 3, name: 'GND', side: 'R', type: 'Ground', desc: '接地（接電源負端）' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '類比攝氏溫度感測器（車規）' }, { k: '斜率', v: '10 mV/°C' },
      { k: '偏移', v: '500mV @ 0°C' }, { k: '認證', v: '車規 AEC-Q100（Grade 0/1）' },
      { k: '封裝', v: 'SOT-23-3' }
    ],
    secondSource: ['封裝 + pinout 相容（SOT-23-3、pin-to-pin）', '輸出斜率/偏移相同', '精度同等或更佳', '車規認證涵蓋（Grade 0/1）', '供電範圍涵蓋', '工作溫度涵蓋'],
    dropIn: [{ part: 'LM50HV', note: '非車規版、同 SOT-23-3 腳位相同' }]
  },
  {
    part: 'TMAG5134', mfr: 'Texas Instruments', category: 'sensors',
    subcategory: '高靈敏度平面霍爾開關 (含磁集中器)', package: 'SOT-23-3 / X1LGA-4',
    whatIs: '高靈敏度「平面(in-plane)」霍爾效應磁開關：偵測平行於封裝表面的磁場，超過門檻就翻轉數位輸出。內建磁集中器提高靈敏度。做位置/接近/開關偵測。',
    func: '感測平面磁通密度，超過 B_OP 開、低於 B_RP 關（含遲滯）。SOT-23 版為 omnipolar 單輸出 OUT(正負磁場皆反應)；X1LGA 版有 OUT1(正磁場)/OUT2(負磁場) 雙單極輸出。低功耗。',
    usedIn: '無刷馬達換相/位置、旋鈕/檔位偵測、蓋開關/接近偵測、流量計、安全聯鎖。',
    desc: '高靈敏平面霍爾開關（含磁集中器），omnipolar 或雙單極輸出、低功耗（SOT-23-3 / X1LGA-4）。',
    datasheet: 'IC-spec/tmag5134.pdf',
    pins: [
      { num: 1, name: 'VCC', side: 'L', type: 'Power', desc: '電源' },
      { num: 2, name: 'OUT', side: 'L', type: 'Digital Out', desc: 'Omnipolar 輸出（正負磁通皆反應）' },
      { num: 3, name: 'GND', side: 'R', type: 'Ground', desc: '接地' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '平面(in-plane)霍爾磁開關（含磁集中器）' }, { k: '輸出', v: 'SOT-23：omnipolar OUT；X1LGA：OUT1(正)/OUT2(負) 雙單極' },
      { k: '靈敏度', v: '高靈敏度（門檻值見 datasheet）' }, { k: '功耗', v: '低功耗' },
      { k: '封裝', v: 'SOT-23-3 / X1LGA-4' }
    ],
    secondSource: ['封裝 + pinout 相容（SOT-23-3、pin-to-pin）', '感測方向相同（平面 in-plane）', '輸出型態相容（omnipolar / 單極）', '磁門檻 B_OP/B_RP 與遲滯同等', '靈敏度同等或更佳', '功耗同等或更低', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'TMAG5230', mfr: 'Texas Instruments', category: 'sensors',
    subcategory: '低功耗 Z 軸霍爾開關 (WCSP)', package: 'DSBGA-4 (WCSP)',
    whatIs: '低功耗「Z 軸(垂直封裝面)」霍爾效應磁開關：偵測垂直於封裝的磁場，超門檻翻轉輸出。極小 WCSP 封裝、低功耗，做接近/開關偵測。',
    func: '感測 Z 軸磁通密度，超 B_OP 開、低 B_RP 關（遲滯）。Omnipolar 版單輸出 OUT；Dual-Unipolar 版 OUT1(正)/OUT2(負)。低功耗適合電池產品。',
    usedIn: '可攜式/穿戴蓋開關、接近偵測、按鍵/旋鈕、電池產品磁感測。',
    desc: '低功耗 Z 軸霍爾磁開關，omnipolar 或雙單極輸出、極小 WCSP（DSBGA-4）。',
    datasheet: 'IC-spec/tmag5230.pdf',
    pins: [
      { num: 'A1', name: 'GND', side: 'L', type: 'Ground', desc: '接地' },
      { num: 'A2', name: 'NC', side: 'L', type: 'No Connect', desc: 'Omnipolar 版高阻抗無接腳（可浮接）；Dual 版為 OUT2(負磁場)' },
      { num: 'B1', name: 'VCC', side: 'R', type: 'Power', desc: '電源' },
      { num: 'B2', name: 'OUT', side: 'R', type: 'Digital Out', desc: 'Omnipolar 輸出（正負磁通皆反應）；Dual 版為 OUT1(正磁場)' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: 'Z 軸霍爾磁開關（低功耗）' }, { k: '輸出', v: 'Omnipolar OUT；或 Dual-Unipolar OUT1(正)/OUT2(負)' },
      { k: '感測軸', v: 'Z 軸（垂直封裝面）' }, { k: '功耗', v: '低功耗（電池友善）' },
      { k: '封裝', v: 'DSBGA-4 (WCSP)；球號 A1/A2/B1/B2' }
    ],
    secondSource: ['封裝 + 球位相容（DSBGA-4、ball-to-ball）', '感測軸相同（Z 軸）', '輸出型態相容（omnipolar / 雙單極）', '磁門檻 B_OP/B_RP 與遲滯同等', '功耗同等或更低', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'AMC0206M25', mfr: 'Texas Instruments', category: 'isolation',
    subcategory: '隔離式 ΔΣ 調變器 (±250mV 輸入)', package: 'SOIC-8 (Wide-body)',
    whatIs: '隔離式 Delta-Sigma 調變器：高壓側量 ±250mV 小類比訊號，轉成位元流(DOUT)經隔離障壁送到低壓側，由 MCU/FPGA 的 sinc 濾波器還原。做隔離式電流/電壓量測。',
    func: '高壓側 INP/INN 差動輸入(±250mV，分流電阻量電流用)，內部 ΔΣ 調變成 1-bit 資料流 DOUT，跨容性隔離障壁；CLKIN 提供調變時脈。AVDD/AGND 高壓側、DVDD/DGND 低壓側。',
    usedIn: '馬達/逆變器相電流隔離量測（分流）、隔離式電壓量測、太陽能/UPS 電流感測、電源回授。',
    desc: '隔離式 ΔΣ 調變器，±250mV 輸入、外部時脈 CLKIN、位元流 DOUT（SOIC-8 寬體）。',
    datasheet: 'IC-spec/amc0206m25.pdf',
    pins: [
      { num: 1, name: 'AVDD', side: 'L', type: 'Power', desc: '類比（高壓側）電源' },
      { num: 2, name: 'INP', side: 'L', type: 'Analog In', desc: '非反相類比輸入' },
      { num: 3, name: 'INN', side: 'L', type: 'Analog In', desc: '反相類比輸入' },
      { num: 4, name: 'AGND', side: 'L', type: 'Ground', desc: '類比（高壓側）接地' },
      { num: 8, name: 'DVDD', side: 'R', type: 'Power', desc: '數位（低壓側）電源' },
      { num: 7, name: 'CLKIN', side: 'R', type: 'Digital In', desc: '調變器時脈輸入（內部 1.5MΩ 下拉）' },
      { num: 6, name: 'DOUT', side: 'R', type: 'Digital Out', desc: '調變器位元流資料輸出' },
      { num: 5, name: 'DGND', side: 'R', type: 'Ground', desc: '數位（低壓側）接地' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '隔離式 ΔΣ 調變器' }, { k: '輸入範圍', v: '±250mV（差動）' },
      { k: '時脈', v: 'CLKIN 外部時脈輸入' }, { k: '輸出', v: 'DOUT 位元流（需外部 sinc 濾波）' },
      { k: '電源', v: 'AVDD(高壓側) + DVDD(低壓側)' }, { k: '封裝', v: 'SOIC-8 寬體（隔離）' }
    ],
    secondSource: ['封裝 + pinout 相容（SOIC-8 寬體、pin-to-pin）', '輸入範圍相容（±250mV）', '時脈型態相同（CLKIN 外部）', '隔離等級涵蓋（見 datasheet）', '輸出位元流相容（sinc 濾波）', '電源範圍涵蓋', '工作溫度涵蓋'],
    dropIn: [{ part: 'AMC0206M25-Q1', note: '車規版、同 SOIC-8 腳位相同' }, { part: 'AMC0206M05', note: '同腳位；輸入範圍 ±50mV（非 ±250mV），需確認量程' }]
  },
  {
    part: 'AMC0206M25-Q1', mfr: 'Texas Instruments', category: 'isolation',
    subcategory: '隔離式 ΔΣ 調變器 (±250mV 輸入, 車規)', package: 'SOIC-8 (Wide-body)',
    whatIs: '隔離式 ΔΣ 調變器（車規 Q1）：±250mV 輸入、外部時脈、位元流輸出。與 AMC0206M25 同腳位、加車規認證。',
    func: '同 AMC0206M25：高壓側 ±250mV 差動輸入 ΔΣ 調變成 DOUT 位元流跨隔離傳出，CLKIN 外部時脈。車規 AEC-Q100。',
    usedIn: '車用馬達/逆變器相電流隔離量測、EV 電源回授、車載隔離電壓/電流感測。',
    desc: '車規隔離式 ΔΣ 調變器，±250mV、CLKIN、DOUT 位元流（與 AMC0206M25 同腳位，SOIC-8 寬體）。',
    datasheet: 'IC-spec/amc0206m25-q1.pdf',
    pins: [
      { num: 1, name: 'AVDD', side: 'L', type: 'Power', desc: '類比（高壓側）電源' },
      { num: 2, name: 'INP', side: 'L', type: 'Analog In', desc: '非反相類比輸入' },
      { num: 3, name: 'INN', side: 'L', type: 'Analog In', desc: '反相類比輸入' },
      { num: 4, name: 'AGND', side: 'L', type: 'Ground', desc: '類比（高壓側）接地' },
      { num: 8, name: 'DVDD', side: 'R', type: 'Power', desc: '數位（低壓側）電源' },
      { num: 7, name: 'CLKIN', side: 'R', type: 'Digital In', desc: '調變器時脈輸入（內部下拉）' },
      { num: 6, name: 'DOUT', side: 'R', type: 'Digital Out', desc: '調變器位元流資料輸出' },
      { num: 5, name: 'DGND', side: 'R', type: 'Ground', desc: '數位（低壓側）接地' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '隔離式 ΔΣ 調變器（車規）' }, { k: '輸入範圍', v: '±250mV' },
      { k: '時脈', v: 'CLKIN 外部' }, { k: '輸出', v: 'DOUT 位元流' }, { k: '認證', v: '車規 AEC-Q100 (Q1)' },
      { k: '封裝', v: 'SOIC-8 寬體（隔離）' }
    ],
    secondSource: ['封裝 + pinout 相容（SOIC-8 寬體、pin-to-pin）', '輸入範圍相容（±250mV）', '時脈型態相同（CLKIN）', '隔離等級涵蓋', '車規認證涵蓋（Q1）', '電源範圍涵蓋', '工作溫度涵蓋'],
    dropIn: [{ part: 'AMC0206M25', note: '非車規版、同 SOIC-8 腳位相同' }]
  },
  {
    part: 'AMC0303M2510', mfr: 'Texas Instruments', category: 'isolation',
    subcategory: '隔離式 ΔΣ 調變器 (±250mV, 內部時脈 CLKOUT)', package: 'SOIC-8 (Wide-body)',
    whatIs: '隔離式 Delta-Sigma 調變器：±250mV 輸入、內建振盪器並由 CLKOUT 輸出時脈（不需外部時脈）。高壓側量小訊號轉位元流跨隔離傳出。',
    func: '高壓側 INP/INN ±250mV 差動輸入 ΔΣ 調變成 DOUT；內部產生時脈由 CLKOUT 輸出供下游同步（異於 M25 的 CLKIN 外部時脈）。AVDD/AGND 高壓側、DVDD/DGND 低壓側。',
    usedIn: '馬達/逆變器相電流隔離量測、隔離電壓量測、電源回授、需內部時脈的隔離前端。',
    desc: '隔離式 ΔΣ 調變器，±250mV、內部時脈 CLKOUT 輸出、位元流 DOUT（SOIC-8 寬體）。',
    datasheet: 'IC-spec/amc0303m2510.pdf',
    pins: [
      { num: 1, name: 'AVDD', side: 'L', type: 'Power', desc: '類比（高壓側）電源' },
      { num: 2, name: 'INP', side: 'L', type: 'Analog In', desc: '非反相類比輸入' },
      { num: 3, name: 'INN', side: 'L', type: 'Analog In', desc: '反相類比輸入' },
      { num: 4, name: 'AGND', side: 'L', type: 'Ground', desc: '類比（高壓側）接地' },
      { num: 8, name: 'DVDD', side: 'R', type: 'Power', desc: '數位（低壓側）電源' },
      { num: 7, name: 'CLKOUT', side: 'R', type: 'Digital Out', desc: '調變器時脈輸出（內部振盪）' },
      { num: 6, name: 'DOUT', side: 'R', type: 'Digital Out', desc: '調變器位元流資料輸出' },
      { num: 5, name: 'DGND', side: 'R', type: 'Ground', desc: '數位（低壓側）接地' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '隔離式 ΔΣ 調變器（內部時脈）' }, { k: '輸入範圍', v: '±250mV' },
      { k: '時脈', v: 'CLKOUT 內部時脈輸出' }, { k: '輸出', v: 'DOUT 位元流' },
      { k: '電源', v: 'AVDD(高壓側) + DVDD(低壓側)' }, { k: '封裝', v: 'SOIC-8 寬體（隔離）' }
    ],
    secondSource: ['封裝 + pinout 相容（SOIC-8 寬體、pin-to-pin）', '輸入範圍相容（±250mV）', '時脈型態相同（CLKOUT 內部）', '隔離等級涵蓋', '輸出位元流相容', '電源範圍涵蓋', '工作溫度涵蓋'],
    dropIn: [{ part: 'AMC0303M0510', note: '同腳位；輸入範圍 ±50mV（非 ±250mV），需確認量程' }]
  },
  {
    part: 'ISOS510-SP', mfr: 'Texas Instruments', category: 'isolation',
    subcategory: '電流驅動類比隔離器 (光耦式, 耐輻射)', package: '4-pin',
    whatIs: '電流驅動類比隔離器（固態光耦替代）：輸入端二極體(AN/CAT)通電流，跨隔離障壁控制輸出端電晶體(COL/EM)導通，傳遞類比/數位訊號。耐輻射(SP)、航太級。',
    func: '輸入二極體 AN→CAT 流過電流，經隔離傳到輸出電晶體（集極 COL / 射極 EM）控制其導通，電流傳輸比(CTR)決定增益。等同光耦合器但耐輻射、無 LED 老化。',
    usedIn: '太空/航太訊號隔離、隔離回授、繼電器替代、耐輻射數位/類比隔離。',
    desc: '耐輻射電流驅動類比隔離器（光耦式），二極體輸入 / 電晶體輸出（4-pin）。',
    datasheet: 'IC-spec/isos510-sp.pdf',
    pins: [
      { num: 1, name: 'AN', side: 'L', type: 'Analog In', desc: '輸入二極體陽極' },
      { num: 2, name: 'CAT', side: 'L', type: 'Analog In', desc: '輸入二極體陰極' },
      { num: 4, name: 'COL', side: 'R', type: 'Analog Out', desc: '輸出電晶體集極' },
      { num: 3, name: 'EM', side: 'R', type: 'Analog Out', desc: '輸出電晶體射極' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '電流驅動類比隔離器（光耦式）' }, { k: '輸入', v: '二極體 AN/CAT' },
      { k: '輸出', v: '電晶體 COL/EM' }, { k: '耐輻射', v: 'SP（rad-hard，航太級）' },
      { k: 'CTR', v: '電流傳輸比（值見 datasheet）' }, { k: '封裝', v: '4-pin' }
    ],
    secondSource: ['封裝 + pinout 相容（4-pin、pin-to-pin）', '型態相同（二極體輸入 / 電晶體輸出）', 'CTR 同等或更佳', '隔離耐壓涵蓋', '耐輻射等級涵蓋（SP）', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'LMH32401', mfr: 'Texas Instruments', category: 'amplifiers',
    subcategory: '450MHz 可程式增益跨阻放大器 (TIA, 差動輸出)', package: 'VQFN-16 (RGT) 含散熱墊',
    whatIs: '高速跨阻放大器(TIA)：把光電二極體(APD/PD)的微小電流轉成電壓，可程式增益(2kΩ/20kΩ)、差動輸出、450MHz 頻寬。含環境光消除(ALC)。做 LIDAR/光接收前端。',
    func: 'IN 接光電二極體電流 → 內部跨阻轉成差動電壓 OUT+/OUT–；GAIN 腳切 2kΩ 或 20kΩ；IDC_EN 致能環境光(DC)消除迴路；EN 低為正常、高為關機。VDD1 給 TIA 級、VDD2 給差動級。',
    usedIn: 'LIDAR 光接收前端、雷射測距、光通訊接收、APD/PD 訊號放大。',
    desc: '450MHz 可程式增益跨阻放大器（TIA），差動輸出、含環境光消除、2k/20kΩ 增益（VQFN-16）。',
    datasheet: 'IC-spec/lmh32401.pdf',
    pins: [
      { num: 1, name: 'GND', side: 'L', type: 'Ground', desc: '放大器接地' },
      { num: 2, name: 'VDD1', side: 'L', type: 'Power', desc: 'TIA 級正電源' },
      { num: 3, name: 'IN', side: 'L', type: 'Analog In', desc: '跨阻放大器輸入（接光電二極體）' },
      { num: 4, name: 'NC', side: 'L', type: 'No Connect', desc: '未內接' },
      { num: 5, name: 'IDC_EN', side: 'L', type: 'Digital In', desc: '環境光消除(ALC)迴路致能（低=啟用 DC 消除）' },
      { num: 6, name: 'EN', side: 'L', type: 'Digital In', desc: '致能（低=正常、高=關機）' },
      { num: 7, name: 'GND', side: 'L', type: 'Ground', desc: '放大器接地' },
      { num: 8, name: 'NC', side: 'L', type: 'No Connect', desc: '未內接' },
      { num: 16, name: 'GAIN', side: 'R', type: 'Digital In', desc: '增益設定（低=2kΩ、高=20kΩ）' },
      { num: 15, name: 'NC', side: 'R', type: 'No Connect', desc: '未內接' },
      { num: 14, name: 'VDD2', side: 'R', type: 'Power', desc: '差動級正電源' },
      { num: 13, name: 'NC', side: 'R', type: 'No Connect', desc: '未內接' },
      { num: 12, name: 'VOCM', side: 'R', type: 'Analog In', desc: '輸出共模電壓設定輸入' },
      { num: 11, name: 'OUT–', side: 'R', type: 'Analog Out', desc: '反相放大器輸出' },
      { num: 10, name: 'OUT+', side: 'R', type: 'Analog Out', desc: '非反相放大器輸出' },
      { num: 9, name: 'VOD', side: 'R', type: 'Analog Out', desc: '輸出共模/偏移監測' },
      { num: 17, name: 'GND', side: 'T', type: 'Ground（EP）', desc: '散熱墊；接 GND（見 datasheet）', ep: true }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '可程式增益跨阻放大器（TIA，差動輸出）' }, { k: '頻寬', v: '450 MHz' },
      { k: '增益', v: '2kΩ / 20kΩ（GAIN 腳切）' }, { k: '環境光消除', v: 'ALC 迴路（IDC_EN 控）' },
      { k: '電源', v: 'VDD1(TIA) + VDD2(差動級)' }, { k: '封裝', v: 'VQFN-16 (RGT)，EP 接 GND' }
    ],
    secondSource: ['封裝 + pinout 相容（RGT VQFN-16、pin-to-pin）', '頻寬同等或更高（≥450MHz）', '增益選項相容（2k/20kΩ）', '差動輸出/共模相容（對接 ADC）', 'ALC 環境光消除相容', '輸入電容/噪聲同等或更佳', '電源範圍涵蓋', '工作溫度涵蓋'],
    dropIn: [{ part: 'LMH32404', note: '功能相同(TIA)但 LMH32404 為四通道多工版（28-pin，非 pin-to-pin）' }]
  },
  {
    part: 'LMH32404', mfr: 'Texas Instruments', category: 'amplifiers',
    subcategory: '四通道多工跨阻放大器 (TIA, 差動輸出)', package: 'VQFN-28 含散熱墊',
    whatIs: '四通道跨阻放大器(TIA)：4 路各自把光電二極體電流轉差動電壓，輸出端整合開關可多工選通通道(M1~M4)。每路含 100mA 箝位與環境光消除。做多通道 LIDAR 接收。',
    func: '4 路 IN1~IN4 各自跨阻放大為 OUT1±~OUT4±；M1~M4 選哪些通道致能(輸出開關閉合)；IDC_EN 控環境光消除；EN 致能；VOCM 設輸出共模。每路 100mA 箝位快速過載恢復。VDD1 給 TIA 級、VDD2 給差動級。',
    usedIn: '多通道 LIDAR 接收陣列、雷射測距、多路光偵測、APD/PD 陣列前端。',
    desc: '四通道多工跨阻放大器（TIA），差動輸出、每路 100mA 箝位 + 環境光消除（VQFN-28）。',
    datasheet: 'IC-spec/lmh32404.pdf',
    pins: [
      { num: 1, name: 'IN1', side: 'L', type: 'Analog In', desc: '通道 1 TIA 輸入' },
      { num: 2, name: 'VDD1', side: 'L', type: 'Power', desc: 'TIA 級正電源' },
      { num: 3, name: 'IN2', side: 'L', type: 'Analog In', desc: '通道 2 TIA 輸入' },
      { num: 4, name: 'VDD1', side: 'L', type: 'Power', desc: 'TIA 級正電源' },
      { num: 5, name: 'VDD1', side: 'L', type: 'Power', desc: 'TIA 級正電源' },
      { num: 6, name: 'IN3', side: 'L', type: 'Analog In', desc: '通道 3 TIA 輸入' },
      { num: 7, name: 'VDD1', side: 'L', type: 'Power', desc: 'TIA 級正電源' },
      { num: 8, name: 'IN4', side: 'L', type: 'Analog In', desc: '通道 4 TIA 輸入' },
      { num: 9, name: 'EN', side: 'L', type: 'Digital In', desc: '致能（低=正常、高=低功耗）' },
      { num: 10, name: 'VOD', side: 'L', type: 'Analog Out', desc: '輸出共模/偏移監測' },
      { num: 11, name: 'GND', side: 'L', type: 'Ground', desc: '放大器接地' },
      { num: 12, name: 'M4', side: 'L', type: 'Digital In', desc: '通道 4 選通（高=致能輸出）' },
      { num: 13, name: 'M3', side: 'L', type: 'Digital In', desc: '通道 3 選通（高=致能輸出）' },
      { num: 14, name: 'VDD2', side: 'L', type: 'Power', desc: '差動級正電源' },
      { num: 28, name: 'IDC_EN', side: 'R', type: 'Digital In', desc: '環境光消除迴路致能（低=啟用）' },
      { num: 27, name: 'VOCM', side: 'R', type: 'Analog In', desc: '輸出共模電壓設定輸入' },
      { num: 26, name: 'GND', side: 'R', type: 'Ground', desc: '放大器接地' },
      { num: 25, name: 'M1', side: 'R', type: 'Digital In', desc: '通道 1 選通（高=致能輸出）' },
      { num: 24, name: 'M2', side: 'R', type: 'Digital In', desc: '通道 2 選通（高=致能輸出）' },
      { num: 23, name: 'VDD2', side: 'R', type: 'Power', desc: '差動級正電源' },
      { num: 22, name: 'OUT1–', side: 'R', type: 'Analog Out', desc: '通道 1 反相輸出' },
      { num: 21, name: 'OUT1+', side: 'R', type: 'Analog Out', desc: '通道 1 非反相輸出' },
      { num: 20, name: 'OUT2–', side: 'R', type: 'Analog Out', desc: '通道 2 反相輸出' },
      { num: 19, name: 'OUT2+', side: 'R', type: 'Analog Out', desc: '通道 2 非反相輸出' },
      { num: 18, name: 'OUT3–', side: 'R', type: 'Analog Out', desc: '通道 3 反相輸出' },
      { num: 17, name: 'OUT3+', side: 'R', type: 'Analog Out', desc: '通道 3 非反相輸出' },
      { num: 16, name: 'OUT4–', side: 'R', type: 'Analog Out', desc: '通道 4 反相輸出' },
      { num: 15, name: 'OUT4+', side: 'R', type: 'Analog Out', desc: '通道 4 非反相輸出' },
      { num: 29, name: 'GND', side: 'T', type: 'Ground（EP）', desc: '散熱墊；接 GND', ep: true }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '四通道多工跨阻放大器（TIA）' }, { k: '通道', v: '4（IN1~IN4 / OUT1±~OUT4±）' },
      { k: '通道選通', v: 'M1~M4（高=致能輸出開關）' }, { k: '保護', v: '每路 100mA 箝位（快速過載恢復）' },
      { k: '環境光消除', v: 'ALC 迴路（IDC_EN 控）' }, { k: '電源', v: 'VDD1(TIA) + VDD2(差動級)' },
      { k: '封裝', v: 'VQFN-28，EP 接 GND' }
    ],
    secondSource: ['封裝 + pinout 相容（VQFN-28、pin-to-pin）', '通道數相同（4 路多工 TIA）', '通道選通 M1~M4 相容', '差動輸出/共模相容', '100mA 箝位 / ALC 相容', '頻寬/噪聲同等或更佳', '電源範圍涵蓋', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'THS4541-DIE', mfr: 'Texas Instruments', category: 'amplifiers',
    subcategory: '全差動放大器 (FDA, 負軌輸入/軌對軌輸出, 裸晶)', package: 'Die (裸晶/PAD)',
    whatIs: '全差動放大器(FDA)裸晶：單端或差動輸入轉差動輸出，輸入含負軌、輸出軌對軌、精密低噪。常做 ADC 差動驅動。此為裸晶(die)版供混合電路/多晶片模組。',
    func: 'IN+/IN– 差動輸入經 FDA 放大為 OUT+/OUT–；Vocm 設輸出共模(對齊 ADC 共模)；PD 關機(低=關、高=正常)；Vs+/Vs– 雙電源。負軌輸入可量到地以下、軌對軌輸出擺幅大。',
    usedIn: '高速 ADC 差動驅動、單端轉差動、抗混疊濾波驅動、精密訊號鏈（裸晶用於 MCM/SiP）。',
    desc: '全差動放大器(FDA)裸晶，負軌輸入 / 軌對軌輸出、Vocm 設共模、PD 關機。',
    datasheet: 'IC-spec/ths4541-die.pdf',
    pins: [
      { num: 2, name: 'IN+', side: 'L', type: 'Analog In', desc: '非反相輸入' },
      { num: 5, name: 'IN–', side: 'L', type: 'Analog In', desc: '反相輸入' },
      { num: 7, name: 'Vocm', side: 'L', type: 'Analog In', desc: '輸出共模電壓設定輸入' },
      { num: 9, name: 'Vs+', side: 'L', type: 'Power', desc: '正電源輸入（pad 9/11）' },
      { num: 14, name: 'OUT+', side: 'R', type: 'Analog Out', desc: '非反相輸出' },
      { num: 17, name: 'OUT–', side: 'R', type: 'Analog Out', desc: '反相輸出' },
      { num: 20, name: 'Vs–', side: 'R', type: 'Power（負）', desc: '負電源輸入（pad 20/22）' },
      { num: 24, name: 'PD', side: 'R', type: 'Digital In', desc: '關機（低=關機、高=正常）' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '全差動放大器（FDA）裸晶' }, { k: '輸入', v: '負軌輸入（可量到地以下）' },
      { k: '輸出', v: '軌對軌差動輸出' }, { k: '共模', v: 'Vocm 設輸出共模' },
      { k: '關機', v: 'PD（高=正常）' }, { k: '形式', v: '裸晶（die/PAD），用於 MCM/SiP' }
    ],
    secondSource: ['形式/尺寸相容（裸晶 pad 排列）', '功能相同（FDA、負軌輸入/軌對軌輸出）', '頻寬/噪聲/失真同等或更佳', '共模設定相容（Vocm）', '關機極性相容（PD）', '電源範圍涵蓋', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'TCAN4572-Q1', mfr: 'Texas Instruments', category: 'interface',
    subcategory: 'CAN FD 收發器 + SPI 系統基礎晶片 (車規)', package: 'SOT (DYY-16)',
    whatIs: 'CAN FD（彈性資料率）收發器整合 SPI 介面的系統基礎晶片：把 MCU 的數位訊號轉成 CAN 匯流排差動訊號(CANH/CANL)，並經 SPI 提供組態/診斷、喚醒、待機管理。車規。',
    func: 'MCU 經 SPI(SCLK/SDI/SDO/nCS) 組態與讀狀態；CANH/CANL 收發 CAN FD；nWKRQ 喚醒請求、nINT 中斷(皆開汲極)；OSC1/OSC2 接晶振；VCC 給 CAN 收發(5V)、VIO 給數位介面、VDD 寬範圍(可接電池)；RST 復位、FLTR 內部穩壓濾波。',
    usedIn: '車用 CAN FD 節點、區域控制/閘道、需 SPI 管理與喚醒的 CAN 收發、工業 CAN。',
    desc: '車規 CAN FD 收發器 + SPI 系統基礎晶片，喚醒/中斷(開汲極)、晶振、多電源軌（SOT-16）。',
    datasheet: 'IC-spec/tcan4572-q1.pdf',
    pins: [
      { num: 1, name: 'OSC1', side: 'L', type: 'Digital In', desc: '外部晶振/時脈輸入' },
      { num: 2, name: 'OSC2', side: 'L', type: 'Digital Out', desc: '晶振輸出（單時脈時接 GND）' },
      { num: 3, name: 'nWKRQ', side: 'L', type: 'Digital Out', desc: '喚醒請求（active-low，開汲極需上拉）' },
      { num: 4, name: 'SCLK', side: 'L', type: 'Digital In', desc: 'SPI 時脈輸入' },
      { num: 5, name: 'SDI', side: 'L', type: 'Digital In', desc: 'SPI 資料輸入（自控制器）' },
      { num: 6, name: 'SDO', side: 'L', type: 'Digital Out', desc: 'SPI 資料輸出（至控制器）' },
      { num: 7, name: 'nCS', side: 'L', type: 'Digital In', desc: 'SPI 晶片選擇（active-low）' },
      { num: 8, name: 'nINT', side: 'L', type: 'Digital Out', desc: '中斷至 MCU（active-low，開汲極需上拉）' },
      { num: 16, name: 'RST', side: 'R', type: 'Digital In', desc: '裝置復位輸入' },
      { num: 15, name: 'FLTR', side: 'R', type: 'Analog', desc: '內部穩壓器濾波；接外部電容到 GND' },
      { num: 14, name: 'VIO', side: 'R', type: 'Power', desc: '數位 I/O 電源' },
      { num: 13, name: 'VCC', side: 'R', type: 'Power', desc: 'CAN 收發電源（5V）' },
      { num: 12, name: 'GND', side: 'R', type: 'Ground', desc: '接地' },
      { num: 11, name: 'VDD', side: 'R', type: 'Power', desc: '寬範圍供電（可接電池）' },
      { num: 10, name: 'CANH', side: 'R', type: 'Bus I/O', desc: 'CAN 匯流排高端' },
      { num: 9, name: 'CANL', side: 'R', type: 'Bus I/O', desc: 'CAN 匯流排低端' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: 'CAN FD 收發器 + SPI 系統基礎晶片' }, { k: '介面', v: 'SPI（SCLK/SDI/SDO/nCS）組態/診斷' },
      { k: '匯流排', v: 'CANH/CANL（CAN FD 彈性資料率）' }, { k: '管理', v: '喚醒 nWKRQ / 中斷 nINT（開汲極）' },
      { k: '電源', v: 'VDD(電池寬範圍) + VCC(5V CAN) + VIO(數位)' }, { k: '認證', v: '車規 AEC-Q100' },
      { k: '封裝', v: 'SOT (DYY-16)' }
    ],
    secondSource: ['封裝 + pinout 相容（DYY-16、pin-to-pin）', '功能相同（CAN FD + SPI SBC）', 'SPI 介面相容', 'CAN FD 速率涵蓋', '喚醒/中斷行為相容（開汲極）', '多電源軌相容（VDD/VCC/VIO）', '車規認證涵蓋', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'THVD9491-SP', mfr: 'Texas Instruments', category: 'interface',
    subcategory: 'RS-485 收發器 (±40V 故障保護, 耐輻射)', package: 'SOIC-14 (D)',
    whatIs: '耐輻射 RS-485 收發器：把單端邏輯訊號轉成 RS-485 差動匯流排（驅動 Y/Z、接收 A/B），±40V 匯流排故障保護、可選轉速。3~5.5V 匯流排電源、獨立 VIO 邏輯電源。航太級 rad-hard。',
    func: 'D→驅動器輸出 Y/Z 差動；A/B 差動→接收器 R 輸出；DE 致能驅動、RE(active-low) 致能接收；SLR 選轉速(低=50Mbps、高=20Mbps)；VIO 設邏輯準位、VCC 給匯流排。±40V 故障保護抗匯流排短路/誤接。',
    usedIn: '太空/航太 RS-485/RS-422 通訊、耐輻射工業匯流排、長距離差動資料鏈。',
    desc: '耐輻射 ±40V 故障保護 RS-485 收發器，可選轉速、獨立 VIO、3~5.5V（SOIC-14）。',
    datasheet: 'IC-spec/thvd9491-sp.pdf',
    pins: [
      { num: 1, name: 'VIO', side: 'L', type: 'Power', desc: '邏輯 I/O 電源（1.65~5.5V）' },
      { num: 2, name: 'R', side: 'L', type: 'Digital Out', desc: '接收資料輸出' },
      { num: 3, name: '{RE}', side: 'L', type: 'Digital In', desc: '接收器致能（active-low）' },
      { num: 4, name: 'DE', side: 'L', type: 'Digital In', desc: '驅動器致能（active-high）' },
      { num: 5, name: 'D', side: 'L', type: 'Digital In', desc: '傳送資料輸入' },
      { num: 6, name: 'GND', side: 'L', type: 'Ground', desc: '接地' },
      { num: 7, name: 'NC', side: 'L', type: 'No Connect', desc: '未內接' },
      { num: 14, name: 'VCC', side: 'R', type: 'Power', desc: '匯流排電源（3~5.5V，供 A/B）' },
      { num: 13, name: 'NC', side: 'R', type: 'No Connect', desc: '未內接' },
      { num: 12, name: 'A', side: 'R', type: 'Analog In', desc: 'RS-485 匯流排接收輸入 A' },
      { num: 11, name: 'B', side: 'R', type: 'Analog In', desc: 'RS-485 匯流排接收輸入 B' },
      { num: 10, name: 'Z', side: 'R', type: 'Analog Out', desc: 'RS-485 匯流排驅動輸出 Z' },
      { num: 9, name: 'Y', side: 'R', type: 'Analog Out', desc: 'RS-485 匯流排驅動輸出 Y' },
      { num: 8, name: 'SLR', side: 'R', type: 'Digital In', desc: '轉速選擇（低=50Mbps、高=20Mbps；浮接預設 50Mbps）' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: 'RS-485 收發器（全 Y/Z/A/B）' }, { k: '故障保護', v: '±40V 匯流排故障保護' },
      { k: '轉速', v: 'SLR 選 50Mbps / 20Mbps' }, { k: '邏輯電源', v: 'VIO 1.65~5.5V（獨立）' },
      { k: '匯流排電源', v: 'VCC 3~5.5V' }, { k: '耐輻射', v: 'SP（rad-hard，航太級）' },
      { k: '封裝', v: 'SOIC-14 (D)' }
    ],
    secondSource: ['封裝 + pinout 相容（SOIC-14、pin-to-pin）', '功能相同（RS-485 收發）', '故障保護涵蓋（±40V）', '致能極性相同（RE active-low / DE active-high）', '轉速選項相容', '邏輯/匯流排電源相容', '耐輻射等級涵蓋（SP）', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'TDEL3G510', mfr: 'Texas Instruments', category: 'interface',
    subcategory: '三通道高速訊號緩衝器 (3Gbps 級)', package: 'SOT (DRL-8)',
    whatIs: '三通道高速單端訊號緩衝器：3 個獨立通道 nA 輸入緩衝到 nY 輸出，做高速訊號重整/驅動/隔離。小 DRL-8 封裝。',
    func: '每通道 nA→nY 緩衝重整訊號（隔離負載、加大驅動、重整邊緣），3 路獨立。適合高速時脈/資料線分送與整形。',
    usedIn: '高速時脈/資料緩衝分送、訊號重整、負載隔離、板內高速訊號驅動。',
    desc: '三通道高速訊號緩衝器（3Gbps 級），3 路獨立輸入/輸出（SOT DRL-8）。',
    datasheet: 'IC-spec/tdel3g510.pdf',
    pins: [
      { num: 1, name: '1Y', side: 'L', type: 'Digital Out', desc: '通道 1 輸出' },
      { num: 2, name: '2Y', side: 'L', type: 'Digital Out', desc: '通道 2 輸出' },
      { num: 3, name: '3Y', side: 'L', type: 'Digital Out', desc: '通道 3 輸出' },
      { num: 4, name: 'GND', side: 'L', type: 'Ground', desc: '接地' },
      { num: 8, name: 'VCC', side: 'R', type: 'Power', desc: '正電源；接 0.1µF 去耦' },
      { num: 7, name: '1A', side: 'R', type: 'Digital In', desc: '通道 1 輸入' },
      { num: 6, name: '2A', side: 'R', type: 'Digital In', desc: '通道 2 輸入' },
      { num: 5, name: '3A', side: 'R', type: 'Digital In', desc: '通道 3 輸入' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '三通道高速訊號緩衝器' }, { k: '速率', v: '3Gbps 級（見 datasheet）' },
      { k: '通道', v: '3（各 nA→nY 獨立）' }, { k: '封裝', v: 'SOT (DRL-8)' }
    ],
    secondSource: ['封裝 + pinout 相容（DRL-8、pin-to-pin）', '通道數相同（3 路緩衝）', '速率同等或更高', '訊號型態/準位相容', '電源範圍涵蓋', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'DP83TD530-Q1', mfr: 'Texas Instruments', category: 'interface',
    subcategory: '10BASE-T1S 單對乙太網路 PHY (車規)', package: '8-pin',
    whatIs: '10BASE-T1S 單對乙太網路(SPE)實體層(PHY)：把單端資料經單對雙絞線(TRD_P/TRD_M)做 10Mbps 乙太傳輸。3 腳介面(TX/RX/ED)+MDIO 管理。極小 8 腳、車規。',
    func: 'TRD_P/TRD_M 為單對雙絞匯流排(10BASE-T1S/T1L)；TX 送資料、RX 收資料/兼 MDC、ED 能量偵測/兼 MDIO；組態模式下 RX/ED 變 MDC/MDIO 管理介面。AVDD3V3 主電源、VDDIO 可 1.8/2.5/3.3V。',
    usedIn: '車用區域網路(zonal)、10BASE-T1S 多點匯流排、汽車感測器/致動器乙太、工業 SPE。',
    desc: '車規 10BASE-T1S 單對乙太 PHY，單對匯流排 TRD、3 腳介面 + MDIO、雙電源軌（8-pin）。',
    datasheet: 'IC-spec/dp83td530-q1.pdf',
    pins: [
      { num: 1, name: 'TX', side: 'L', type: 'Digital In', desc: '乙太傳送資料輸入' },
      { num: 2, name: 'VDDIO', side: 'L', type: 'Power', desc: 'I/O 電源（1.8/2.5/3.3V）' },
      { num: 3, name: 'ED', side: 'L', type: 'Digital I/O', desc: '能量偵測（碰撞/線路活動）；組態模式為 MDIO' },
      { num: 4, name: 'RX', side: 'L', type: 'Digital I/O', desc: '乙太接收資料輸出；組態模式為 MDC' },
      { num: 8, name: 'AVDD3V3', side: 'R', type: 'Power', desc: '3.3V 裝置電源' },
      { num: 7, name: 'TRD_P', side: 'R', type: 'Analog I/O', desc: '單對差動收發正端（10BASE-T1S）' },
      { num: 6, name: 'TRD_M', side: 'R', type: 'Analog I/O', desc: '單對差動收發負端' },
      { num: 5, name: 'GND', side: 'R', type: 'Ground', desc: '接地' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '10BASE-T1S 單對乙太 PHY' }, { k: '匯流排', v: 'TRD_P/TRD_M 單對雙絞（10Mbps）' },
      { k: '介面', v: '3 腳(TX/RX/ED) + MDIO 管理（RX/ED 複用）' }, { k: '電源', v: 'AVDD3V3 (3.3V) + VDDIO (1.8/2.5/3.3V)' },
      { k: '認證', v: '車規 AEC-Q100' }, { k: '封裝', v: '8-pin' }
    ],
    secondSource: ['封裝 + pinout 相容（8-pin、pin-to-pin）', '功能相同（10BASE-T1S PHY）', '介面相容（3 腳 + MDIO）', '匯流排型態相容（單對 SPE）', '電源軌相容（3.3V + VDDIO）', '車規認證涵蓋', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'LMK1C1102A', mfr: 'Texas Instruments', category: 'clocks',
    subcategory: 'LVCMOS 時脈扇出緩衝器 (1:2)', package: 'WSON-8 (DQF) / TSSOP-8 (PW)',
    whatIs: 'LVCMOS 時脈扇出緩衝器（1 進 2 出）：把一路時脈複製成 2 路低歪斜輸出，供多顆晶片同步。含全域輸出致能(1G)。',
    func: 'CLKIN 單端時脈輸入(內部 300kΩ 下拉)→ 緩衝複製為 Y0/Y1 兩路 LVCMOS 輸出；1G 高致能、低則輸出關閉。低歪斜、低抖動，做時脈分送。1.8/2.5/3.3V。',
    usedIn: '時脈樹分送、多晶片同步時脈、MCU/FPGA/ADC 共時脈、板內時脈扇出。',
    desc: 'LVCMOS 1:2 時脈扇出緩衝器，全域輸出致能、低歪斜、1.8~3.3V（WSON/TSSOP-8）。',
    datasheet: 'IC-spec/lmk1c1102a.pdf',
    pins: [
      { num: 1, name: 'CLKIN', side: 'L', type: 'Digital In', desc: '單端時脈輸入（內部 300kΩ 下拉）' },
      { num: 2, name: '1G', side: 'L', type: 'Digital In', desc: '全域輸出致能（高=致能、低=關閉；內部下拉）' },
      { num: 3, name: 'Y0', side: 'L', type: 'Digital Out', desc: 'LVCMOS 時脈輸出 0' },
      { num: 4, name: 'GND', side: 'L', type: 'Ground', desc: '接地' },
      { num: 8, name: 'Y1', side: 'R', type: 'Digital Out', desc: 'LVCMOS 時脈輸出 1' },
      { num: 7, name: 'NC', side: 'R', type: 'No Connect', desc: '未內接' },
      { num: 6, name: 'VDD', side: 'R', type: 'Power', desc: '電源（1.8/2.5/3.3V）；0.1µF 去耦' },
      { num: 5, name: 'NC', side: 'R', type: 'No Connect', desc: '未內接' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: 'LVCMOS 時脈扇出緩衝器（1:2）' }, { k: '輸出數', v: '2（Y0/Y1）' },
      { k: '致能', v: '全域 1G（高致能）' }, { k: '電源', v: '1.8 / 2.5 / 3.3 V' },
      { k: '封裝', v: 'WSON-8 (DQF) / TSSOP-8 (PW)' }
    ],
    secondSource: ['封裝 + pinout 相容（8-pin、pin-to-pin）', '扇出數相同（1:2）', '輸出型態相容（LVCMOS）', '歪斜/抖動同等或更佳', '致能行為相容（1G 高致能）', '電源範圍涵蓋', '工作溫度涵蓋'],
    dropIn: [{ part: 'LMK1C1102-Q1', note: '車規版、同 8-pin 腳位相同' }]
  },
  {
    part: 'LMK1C1102-Q1', mfr: 'Texas Instruments', category: 'clocks',
    subcategory: 'LVCMOS 時脈扇出緩衝器 (1:2, 車規)', package: 'WSON-8 (DQF) / TSSOP-8 (PW)',
    whatIs: 'LVCMOS 1:2 時脈扇出緩衝器（車規 Q1）：一進兩出低歪斜時脈。與 LMK1C1102A 同腳位、加車規認證。',
    func: '同 1102A：CLKIN→Y0/Y1，1G 致能。車規 AEC-Q100。',
    usedIn: '車用時脈分送、多晶片同步、ADAS/資通訊時脈扇出。',
    desc: '車規 LVCMOS 1:2 時脈扇出緩衝器（與 1102A 同腳位，WSON/TSSOP-8）。',
    datasheet: 'IC-spec/lmk1c1102-q1.pdf',
    pins: [
      { num: 1, name: 'CLKIN', side: 'L', type: 'Digital In', desc: '單端時脈輸入（內部下拉）' },
      { num: 2, name: '1G', side: 'L', type: 'Digital In', desc: '全域輸出致能（高致能）' },
      { num: 3, name: 'Y0', side: 'L', type: 'Digital Out', desc: 'LVCMOS 時脈輸出 0' },
      { num: 4, name: 'GND', side: 'L', type: 'Ground', desc: '接地' },
      { num: 8, name: 'Y1', side: 'R', type: 'Digital Out', desc: 'LVCMOS 時脈輸出 1' },
      { num: 7, name: 'NC', side: 'R', type: 'No Connect', desc: '未內接' },
      { num: 6, name: 'VDD', side: 'R', type: 'Power', desc: '電源（1.8/2.5/3.3V）' },
      { num: 5, name: 'NC', side: 'R', type: 'No Connect', desc: '未內接' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: 'LVCMOS 時脈扇出（1:2，車規）' }, { k: '輸出數', v: '2' },
      { k: '致能', v: '全域 1G' }, { k: '認證', v: '車規 AEC-Q100 (Q1)' }, { k: '電源', v: '1.8 / 2.5 / 3.3 V' },
      { k: '封裝', v: 'WSON-8 / TSSOP-8' }
    ],
    secondSource: ['封裝 + pinout 相容（8-pin、pin-to-pin）', '扇出數相同（1:2）', '輸出型態相容（LVCMOS）', '車規認證涵蓋（Q1）', '歪斜/抖動同等', '電源範圍涵蓋', '工作溫度涵蓋'],
    dropIn: [{ part: 'LMK1C1102A', note: '非車規版、同 8-pin 腳位相同' }]
  },
  {
    part: 'LMK1C1103A', mfr: 'Texas Instruments', category: 'clocks',
    subcategory: 'LVCMOS 時脈扇出緩衝器 (1:3)', package: 'TSSOP-8 (PW) / WSON-8 (DQF)',
    whatIs: 'LVCMOS 時脈扇出緩衝器（1 進 3 出）：一路時脈複製成 3 路低歪斜輸出。含全域輸出致能。',
    func: 'CLKIN → Y0/Y1/Y2 三路 LVCMOS 輸出；1G 致能。低歪斜低抖動時脈分送。1.8/2.5/3.3V。',
    usedIn: '時脈樹分送、多晶片同步、板內時脈扇出。',
    desc: 'LVCMOS 1:3 時脈扇出緩衝器，全域致能、低歪斜、1.8~3.3V（TSSOP/WSON-8）。',
    datasheet: 'IC-spec/lmk1c1103a.pdf',
    pins: [
      { num: 1, name: 'CLKIN', side: 'L', type: 'Digital In', desc: '單端時脈輸入（內部下拉）' },
      { num: 2, name: '1G', side: 'L', type: 'Digital In', desc: '全域輸出致能（高致能）' },
      { num: 3, name: 'Y0', side: 'L', type: 'Digital Out', desc: 'LVCMOS 時脈輸出 0' },
      { num: 4, name: 'GND', side: 'L', type: 'Ground', desc: '接地' },
      { num: 8, name: 'Y1', side: 'R', type: 'Digital Out', desc: 'LVCMOS 時脈輸出 1' },
      { num: 7, name: 'NC', side: 'R', type: 'No Connect', desc: '未內接' },
      { num: 6, name: 'VDD', side: 'R', type: 'Power', desc: '電源（1.8/2.5/3.3V）' },
      { num: 5, name: 'Y2', side: 'R', type: 'Digital Out', desc: 'LVCMOS 時脈輸出 2' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: 'LVCMOS 時脈扇出（1:3）' }, { k: '輸出數', v: '3（Y0/Y1/Y2）' },
      { k: '致能', v: '全域 1G（高致能）' }, { k: '電源', v: '1.8 / 2.5 / 3.3 V' },
      { k: '封裝', v: 'TSSOP-8 (PW) / WSON-8 (DQF)' }
    ],
    secondSource: ['封裝 + pinout 相容（8-pin、pin-to-pin）', '扇出數相同（1:3）', '輸出型態相容（LVCMOS）', '歪斜/抖動同等或更佳', '致能行為相容', '電源範圍涵蓋', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'LMK1C1104A', mfr: 'Texas Instruments', category: 'clocks',
    subcategory: 'LVCMOS 時脈扇出緩衝器 (1:4)', package: 'WSON-8 (DQF) / TSSOP-8 (PW)',
    whatIs: 'LVCMOS 時脈扇出緩衝器（1 進 4 出）：一路時脈複製成 4 路低歪斜輸出。含全域輸出致能。',
    func: 'CLKIN → Y0/Y1/Y2/Y3 四路 LVCMOS 輸出；1G 致能。低歪斜低抖動時脈分送。1.8/2.5/3.3V。',
    usedIn: '時脈樹分送、多晶片同步、MCU/FPGA/ADC 共時脈、板內時脈扇出。',
    desc: 'LVCMOS 1:4 時脈扇出緩衝器，全域致能、低歪斜、1.8~3.3V（WSON/TSSOP-8）。',
    datasheet: 'IC-spec/lmk1c1104a.pdf',
    pins: [
      { num: 1, name: 'CLKIN', side: 'L', type: 'Digital In', desc: '單端時脈輸入（內部下拉）' },
      { num: 2, name: '1G', side: 'L', type: 'Digital In', desc: '全域輸出致能（高致能）' },
      { num: 3, name: 'Y0', side: 'L', type: 'Digital Out', desc: 'LVCMOS 時脈輸出 0' },
      { num: 4, name: 'GND', side: 'L', type: 'Ground', desc: '接地' },
      { num: 8, name: 'Y1', side: 'R', type: 'Digital Out', desc: 'LVCMOS 時脈輸出 1' },
      { num: 7, name: 'Y3', side: 'R', type: 'Digital Out', desc: 'LVCMOS 時脈輸出 3' },
      { num: 6, name: 'VDD', side: 'R', type: 'Power', desc: '電源（1.8/2.5/3.3V）' },
      { num: 5, name: 'Y2', side: 'R', type: 'Digital Out', desc: 'LVCMOS 時脈輸出 2' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: 'LVCMOS 時脈扇出（1:4）' }, { k: '輸出數', v: '4（Y0~Y3）' },
      { k: '致能', v: '全域 1G（高致能）' }, { k: '電源', v: '1.8 / 2.5 / 3.3 V' },
      { k: '封裝', v: 'WSON-8 (DQF) / TSSOP-8 (PW)' }
    ],
    secondSource: ['封裝 + pinout 相容（8-pin、pin-to-pin）', '扇出數相同（1:4）', '輸出型態相容（LVCMOS）', '歪斜/抖動同等或更佳', '致能行為相容', '電源範圍涵蓋', '工作溫度涵蓋'],
    dropIn: [{ part: 'LMK1C1104-Q1', note: '車規版、同 8-pin 腳位相同' }]
  },
  {
    part: 'LMK1C1104-Q1', mfr: 'Texas Instruments', category: 'clocks',
    subcategory: 'LVCMOS 時脈扇出緩衝器 (1:4, 車規)', package: 'WSON-8 (DQF) / TSSOP-8 (PW)',
    whatIs: 'LVCMOS 1:4 時脈扇出緩衝器（車規 Q1）：一進四出低歪斜時脈。與 LMK1C1104A 同腳位、加車規認證。',
    func: '同 1104A：CLKIN→Y0~Y3，1G 致能。車規 AEC-Q100。',
    usedIn: '車用時脈分送、多晶片同步、ADAS/資通訊時脈扇出。',
    desc: '車規 LVCMOS 1:4 時脈扇出緩衝器（與 1104A 同腳位，WSON/TSSOP-8）。',
    datasheet: 'IC-spec/lmk1c1104-q1.pdf',
    pins: [
      { num: 1, name: 'CLKIN', side: 'L', type: 'Digital In', desc: '單端時脈輸入（內部下拉）' },
      { num: 2, name: '1G', side: 'L', type: 'Digital In', desc: '全域輸出致能（高致能）' },
      { num: 3, name: 'Y0', side: 'L', type: 'Digital Out', desc: 'LVCMOS 時脈輸出 0' },
      { num: 4, name: 'GND', side: 'L', type: 'Ground', desc: '接地' },
      { num: 8, name: 'Y1', side: 'R', type: 'Digital Out', desc: 'LVCMOS 時脈輸出 1' },
      { num: 7, name: 'Y3', side: 'R', type: 'Digital Out', desc: 'LVCMOS 時脈輸出 3' },
      { num: 6, name: 'VDD', side: 'R', type: 'Power', desc: '電源（1.8/2.5/3.3V）' },
      { num: 5, name: 'Y2', side: 'R', type: 'Digital Out', desc: 'LVCMOS 時脈輸出 2' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: 'LVCMOS 時脈扇出（1:4，車規）' }, { k: '輸出數', v: '4' },
      { k: '致能', v: '全域 1G' }, { k: '認證', v: '車規 AEC-Q100 (Q1)' }, { k: '電源', v: '1.8 / 2.5 / 3.3 V' },
      { k: '封裝', v: 'WSON-8 / TSSOP-8' }
    ],
    secondSource: ['封裝 + pinout 相容（8-pin、pin-to-pin）', '扇出數相同（1:4）', '輸出型態相容（LVCMOS）', '車規認證涵蓋（Q1）', '歪斜/抖動同等', '電源範圍涵蓋', '工作溫度涵蓋'],
    dropIn: [{ part: 'LMK1C1104A', note: '非車規版、同 8-pin 腳位相同' }]
  },
  {
    part: 'LMK1C1106-Q1', mfr: 'Texas Instruments', category: 'clocks',
    subcategory: 'LVCMOS 時脈扇出緩衝器 (1:6, 車規)', package: 'TSSOP-14 (PW)',
    whatIs: 'LVCMOS 時脈扇出緩衝器（1 進 6 出，車規）：一路時脈複製成 6 路低歪斜輸出。含全域輸出致能。',
    func: 'CLKIN → Y0~Y5 六路 LVCMOS 輸出；1G 致能。低歪斜低抖動時脈分送。1.8/2.5/3.3V、車規 AEC-Q100。（腳位含雙 VDD/GND；NC 位建議對照 datasheet 圖確認）',
    usedIn: '車用時脈樹分送、多晶片同步、ADAS/資通訊/儀表時脈扇出。',
    desc: '車規 LVCMOS 1:6 時脈扇出緩衝器，全域致能、低歪斜、1.8~3.3V（TSSOP-14）。',
    datasheet: 'IC-spec/lmk1c1106-q1.pdf',
    pins: [
      { num: 1, name: 'CLKIN', side: 'L', type: 'Digital In', desc: '單端時脈輸入（內部下拉）' },
      { num: 2, name: '1G', side: 'L', type: 'Digital In', desc: '全域輸出致能（高致能）' },
      { num: 3, name: 'Y0', side: 'L', type: 'Digital Out', desc: 'LVCMOS 時脈輸出 0' },
      { num: 4, name: 'GND', side: 'L', type: 'Ground', desc: '接地' },
      { num: 5, name: 'VDD', side: 'L', type: 'Power', desc: '電源（1.8/2.5/3.3V）' },
      { num: 6, name: 'Y4', side: 'L', type: 'Digital Out', desc: 'LVCMOS 時脈輸出 4' },
      { num: 7, name: 'NC', side: 'L', type: 'No Connect', desc: '未內接' },
      { num: 14, name: 'Y1', side: 'R', type: 'Digital Out', desc: 'LVCMOS 時脈輸出 1' },
      { num: 13, name: 'Y3', side: 'R', type: 'Digital Out', desc: 'LVCMOS 時脈輸出 3' },
      { num: 12, name: 'VDD', side: 'R', type: 'Power', desc: '電源（1.8/2.5/3.3V）' },
      { num: 11, name: 'Y2', side: 'R', type: 'Digital Out', desc: 'LVCMOS 時脈輸出 2' },
      { num: 10, name: 'GND', side: 'R', type: 'Ground', desc: '接地' },
      { num: 9, name: 'Y5', side: 'R', type: 'Digital Out', desc: 'LVCMOS 時脈輸出 5' },
      { num: 8, name: 'NC', side: 'R', type: 'No Connect', desc: '未內接' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: 'LVCMOS 時脈扇出（1:6，車規）' }, { k: '輸出數', v: '6（Y0~Y5）' },
      { k: '致能', v: '全域 1G' }, { k: '認證', v: '車規 AEC-Q100 (Q1)' }, { k: '電源', v: '1.8 / 2.5 / 3.3 V' },
      { k: '封裝', v: 'TSSOP-14 (PW)' }
    ],
    secondSource: ['封裝 + pinout 相容（TSSOP-14、pin-to-pin）', '扇出數相同（1:6）', '輸出型態相容（LVCMOS）', '車規認證涵蓋（Q1）', '歪斜/抖動同等', '電源範圍涵蓋', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'LMK1C1108-Q1', mfr: 'Texas Instruments', category: 'clocks',
    subcategory: 'LVCMOS 時脈扇出緩衝器 (1:8, 車規)', package: 'TSSOP-16 (PW)',
    whatIs: 'LVCMOS 時脈扇出緩衝器（1 進 8 出，車規）：一路時脈複製成 8 路低歪斜輸出。含全域輸出致能。',
    func: 'CLKIN → Y0~Y7 八路 LVCMOS 輸出；1G 致能。低歪斜低抖動時脈分送。1.8/2.5/3.3V、車規 AEC-Q100。（腳位含雙 VDD/GND；NC 位建議對照 datasheet 圖確認）',
    usedIn: '車用大扇出時脈樹、多晶片同步、ADAS/資通訊/儀表時脈分送。',
    desc: '車規 LVCMOS 1:8 時脈扇出緩衝器，全域致能、低歪斜、1.8~3.3V（TSSOP-16）。',
    datasheet: 'IC-spec/lmk1c1108-q1.pdf',
    pins: [
      { num: 1, name: 'CLKIN', side: 'L', type: 'Digital In', desc: '單端時脈輸入（內部下拉）' },
      { num: 2, name: '1G', side: 'L', type: 'Digital In', desc: '全域輸出致能（高致能）' },
      { num: 3, name: 'Y0', side: 'L', type: 'Digital Out', desc: 'LVCMOS 時脈輸出 0' },
      { num: 4, name: 'GND', side: 'L', type: 'Ground', desc: '接地' },
      { num: 5, name: 'VDD', side: 'L', type: 'Power', desc: '電源（1.8/2.5/3.3V）' },
      { num: 6, name: 'Y4', side: 'L', type: 'Digital Out', desc: 'LVCMOS 時脈輸出 4' },
      { num: 7, name: 'NC', side: 'L', type: 'No Connect', desc: '未內接' },
      { num: 8, name: 'Y6', side: 'L', type: 'Digital Out', desc: 'LVCMOS 時脈輸出 6' },
      { num: 16, name: 'Y1', side: 'R', type: 'Digital Out', desc: 'LVCMOS 時脈輸出 1' },
      { num: 15, name: 'Y3', side: 'R', type: 'Digital Out', desc: 'LVCMOS 時脈輸出 3' },
      { num: 14, name: 'VDD', side: 'R', type: 'Power', desc: '電源（1.8/2.5/3.3V）' },
      { num: 13, name: 'Y2', side: 'R', type: 'Digital Out', desc: 'LVCMOS 時脈輸出 2' },
      { num: 12, name: 'GND', side: 'R', type: 'Ground', desc: '接地' },
      { num: 11, name: 'Y5', side: 'R', type: 'Digital Out', desc: 'LVCMOS 時脈輸出 5' },
      { num: 10, name: 'NC', side: 'R', type: 'No Connect', desc: '未內接' },
      { num: 9, name: 'Y7', side: 'R', type: 'Digital Out', desc: 'LVCMOS 時脈輸出 7' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: 'LVCMOS 時脈扇出（1:8，車規）' }, { k: '輸出數', v: '8（Y0~Y7）' },
      { k: '致能', v: '全域 1G' }, { k: '認證', v: '車規 AEC-Q100 (Q1)' }, { k: '電源', v: '1.8 / 2.5 / 3.3 V' },
      { k: '封裝', v: 'TSSOP-16 (PW)' }
    ],
    secondSource: ['封裝 + pinout 相容（TSSOP-16、pin-to-pin）', '扇出數相同（1:8）', '輸出型態相容（LVCMOS）', '車規認證涵蓋（Q1）', '歪斜/抖動同等', '電源範圍涵蓋', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'TLC3555', mfr: 'Texas Instruments', category: 'clocks',
    subcategory: '高速 CMOS 計時器 (555 型)', package: 'SOT-23-8 / VSSOP-8',
    whatIs: '高速 CMOS 版 555 計時器：用外接 RC 決定延時/振盪週期，做單穩態(one-shot)或非穩態(振盪器)。1.5~18V 寬供電、CMOS 低功耗。',
    func: 'TRIG(<1/2 CONT) 觸發使 OUT 高、DISCH 開；THRES(>CONT) 使 OUT 低、DISCH 拉低放電；CONT 設比較門檻(預設 2/3 VDD)；RESET(active-low) 強制 OUT/DISCH 低。做延時、PWM、振盪、脈衝產生。',
    usedIn: '延時/計時、PWM 產生、振盪器、脈衝產生、觸發/單穩態。',
    desc: '高速 CMOS 555 計時器，1.5~18V、單穩態/非穩態、低功耗（SOT-23-8 / VSSOP-8）。',
    datasheet: 'IC-spec/tlc3555.pdf',
    pins: [
      { num: 1, name: 'GND', side: 'L', type: 'Ground', desc: '接地參考' },
      { num: 2, name: 'TRIG', side: 'L', type: 'Digital In', desc: '觸發輸入（<1/2 CONT 使 OUT 高、DISCH 開）' },
      { num: 3, name: 'OUT', side: 'L', type: 'Digital Out', desc: '計時器輸出' },
      { num: 4, name: '{RESET}', side: 'L', type: 'Digital In', desc: '復位（active-low；強制 OUT/DISCH 低）' },
      { num: 8, name: 'VDD', side: 'R', type: 'Power', desc: '電源（1.5~18V）' },
      { num: 7, name: 'DISCH', side: 'R', type: 'Digital Out', desc: '放電（開集極，放電計時電容）' },
      { num: 6, name: 'THRES', side: 'R', type: 'Digital In', desc: '門檻輸入（>CONT 使 OUT 低、DISCH 低）' },
      { num: 5, name: 'CONT', side: 'R', type: 'Analog I/O', desc: '控制電壓（設比較門檻，預設 2/3 VDD）' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '高速 CMOS 555 計時器' }, { k: '模式', v: '單穩態 / 非穩態（RC 計時）' },
      { k: '電源', v: '1.5 ~ 18 V' }, { k: '復位', v: 'RESET（active-low）' },
      { k: '製程', v: 'CMOS（低功耗）' }, { k: '封裝', v: 'SOT-23-8 / VSSOP-8' }
    ],
    secondSource: ['封裝 + pinout 相容（8-pin、pin-to-pin）', '功能相同（555 計時器）', '電源範圍涵蓋（1.5~18V）', '速度/頻率同等或更佳', 'RESET 極性相同（active-low）', '功耗同等或更低', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'LMK6B', mfr: 'Texas Instruments', category: 'clocks',
    subcategory: '可程式差動振盪器 (BAW)', package: '6-pin',
    whatIs: '可程式差動時脈振盪器：內建 BAW 諧振器，輸出可程式頻率的差動時脈(OUT_P/OUT_N)，頻率由訂購型號(OPN)設定，FSEL 腳可再選 FOUT / FOUT/2 / FOUT/4。',
    func: 'OE/ST 控制輸出致能/待機；FSEL 選輸出分頻(低=/4、浮接=×1、高=/2)；OUT_P/OUT_N 差動時脈輸出。取代石英振盪器，低抖動、免外接晶體。',
    usedIn: '高速 SerDes/乙太/PCIe 參考時脈、通訊/資料中心時脈源、取代石英振盪器。',
    desc: '可程式 BAW 差動振盪器，OPN 設頻率 + FSEL 分頻、低抖動（6-pin）。',
    datasheet: 'IC-spec/lmk6b.pdf',
    pins: [
      { num: 1, name: 'OE/ST', side: 'L', type: 'Digital In', desc: '輸出致能/待機（低=停用、高/浮接=啟用；內部 150kΩ 上拉）' },
      { num: 2, name: 'FSEL', side: 'L', type: 'Digital In', desc: '頻率選擇（低=FOUT/4、浮接=FOUT、高=FOUT/2）' },
      { num: 3, name: 'GND', side: 'L', type: 'Ground', desc: '接地' },
      { num: 6, name: 'VDD', side: 'R', type: 'Power', desc: '電源' },
      { num: 5, name: 'OUT_N', side: 'R', type: 'Digital Out', desc: '差動時脈輸出（負）' },
      { num: 4, name: 'OUT_P', side: 'R', type: 'Digital Out', desc: '差動時脈輸出（正）' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '可程式差動振盪器（BAW）' }, { k: '頻率', v: 'OPN 設定 + FSEL 分頻(×1 / /2 / /4)' },
      { k: '輸出', v: '差動 OUT_P/OUT_N（低抖動）' }, { k: '控制', v: 'OE/ST 致能/待機' },
      { k: '封裝', v: '6-pin' }
    ],
    secondSource: ['封裝 + pinout 相容（6-pin、pin-to-pin）', '輸出型態相容（差動、電平）', '頻率/分頻選項相容', '抖動同等或更佳', '致能/待機行為相容', '電源範圍涵蓋', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'CDC6C-Q1', mfr: 'Texas Instruments', category: 'clocks',
    subcategory: '單路 LVCMOS 時脈振盪器 (車規)', package: '4-pin',
    whatIs: '單路 LVCMOS 時脈振盪器（車規）：輸出固定/訂購頻率的 LVCMOS 時脈，含輸出致能/待機腳。4 腳極小、取代石英振盪器。',
    func: 'OE/ST 控制輸出致能或待機；CLK 輸出 LVCMOS 時脈。低抖動、車規 AEC-Q100，做參考時脈源。',
    usedIn: '車用 MCU/SoC 參考時脈、通訊時脈源、取代石英振盪器。',
    desc: '車規單路 LVCMOS 時脈振盪器，含輸出致能/待機（4-pin）。',
    datasheet: 'IC-spec/cdc6c-q1.pdf',
    pins: [
      { num: 1, name: 'OE/ST', side: 'L', type: 'Digital In', desc: '輸出致能/待機（NC 可浮接）' },
      { num: 2, name: 'GND', side: 'L', type: 'Ground', desc: '接地' },
      { num: 3, name: 'CLK', side: 'R', type: 'Digital Out', desc: 'LVCMOS 時脈輸出' },
      { num: 4, name: 'VDD', side: 'R', type: 'Power', desc: '電源' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '單路 LVCMOS 時脈振盪器（車規）' }, { k: '輸出', v: 'CLK（LVCMOS）' },
      { k: '控制', v: 'OE/ST 致能/待機' }, { k: '認證', v: '車規 AEC-Q100' }, { k: '封裝', v: '4-pin' }
    ],
    secondSource: ['封裝 + pinout 相容（4-pin、pin-to-pin）', '輸出型態相容（LVCMOS）', '頻率相容', '抖動同等或更佳', '致能行為相容', '車規認證涵蓋', '電源範圍涵蓋', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'LMK3H2104', mfr: 'Texas Instruments', category: 'clocks',
    subcategory: '時脈產生器 (4 差動輸出, HCSL/LVDS/LVCMOS)', package: 'VQFN-24 (RGE)',
    whatIs: '時脈產生器：由差動輸入或內部參考產生 4 路差動時脈輸出(OUT0~3)，各支援 LP-HCSL/LVDS/LVCMOS 多種電平。含 I2C/OTP 組態、GPIO、參考輸出。做多晶片系統時脈源。',
    func: 'IN0_P/N 差動輸入(或 GPI)→ 內部產生 4 路差動時脈 OUT0~3；REF_1 LVCMOS 參考輸出；OTP_SEL/SCL/SDA 做 OTP 頁選或 I2C 組態(由 pin23 決定)；GPIO/GPI 通用 IO；各輸出獨立 VDDO 供電設電平。',
    usedIn: '多晶片系統時脈分送、PCIe/乙太/SerDes 參考時脈、FPGA/處理器時脈樹、資料中心/通訊。',
    desc: '時脈產生器，4 路差動輸出(HCSL/LVDS/LVCMOS)、I2C/OTP 組態、多 VDDO（VQFN-24）。',
    datasheet: 'IC-spec/lmk3h2104.pdf',
    pins: [
      { num: 1, name: 'IN0_P/GPI_0', side: 'L', type: 'Digital In', desc: '差動時脈輸入正 / 通用輸入 0（fail-safe）' },
      { num: 2, name: 'IN0_N/GPI_1', side: 'L', type: 'Digital In', desc: '差動時脈輸入負 / 通用輸入 1' },
      { num: 3, name: 'REF_1', side: 'L', type: 'Digital Out', desc: 'LVCMOS 參考時脈輸出（可停用/三態）' },
      { num: 4, name: 'OTP_SEL_0/SCL', side: 'L', type: 'Digital I/O', desc: 'OTP 頁選 0 / I2C SCL（由 pin23 決定；內部下拉）' },
      { num: 5, name: 'OTP_SEL_1/SDA', side: 'L', type: 'Digital I/O', desc: 'OTP 頁選 1 / I2C SDA' },
      { num: 6, name: 'GPI_2', side: 'L', type: 'Digital In', desc: '通用輸入 2（fail-safe）' },
      { num: 7, name: 'VDDD', side: 'L', type: 'Power', desc: '數位電源（1.8/2.5/3.3V）' },
      { num: 8, name: 'GPIO_0', side: 'L', type: 'Digital I/O', desc: '通用 I/O 0' },
      { num: 9, name: 'GPIO_1', side: 'L', type: 'Digital I/O', desc: '通用 I/O 1' },
      { num: 10, name: 'OUT0_N', side: 'L', type: 'Digital Out', desc: '差動時脈輸出 0 負' },
      { num: 11, name: 'OUT0_P', side: 'L', type: 'Digital Out', desc: '差動時脈輸出 0 正' },
      { num: 12, name: 'VDDO_0', side: 'L', type: 'Power', desc: '輸出 0 電源（設電平）' },
      { num: 24, name: 'VDD_REF', side: 'R', type: 'Power', desc: '參考電源' },
      { num: 23, name: 'REF_0/CTRL', side: 'R', type: 'Digital I/O', desc: '參考輸出 / 控制（上電決定 OTP vs I2C 模式）' },
      { num: 22, name: 'VDDA', side: 'R', type: 'Power', desc: '類比電源' },
      { num: 21, name: 'VDDO_3', side: 'R', type: 'Power', desc: '輸出 3 電源' },
      { num: 20, name: 'OUT3_N', side: 'R', type: 'Digital Out', desc: '差動時脈輸出 3 負' },
      { num: 19, name: 'OUT3_P', side: 'R', type: 'Digital Out', desc: '差動時脈輸出 3 正' },
      { num: 18, name: 'VDDO_2', side: 'R', type: 'Power', desc: '輸出 2 電源' },
      { num: 17, name: 'OUT2_P', side: 'R', type: 'Digital Out', desc: '差動時脈輸出 2 正' },
      { num: 16, name: 'OUT2_N', side: 'R', type: 'Digital Out', desc: '差動時脈輸出 2 負' },
      { num: 15, name: 'VDDO_1', side: 'R', type: 'Power', desc: '輸出 1 電源' },
      { num: 14, name: 'OUT1_P', side: 'R', type: 'Digital Out', desc: '差動時脈輸出 1 正' },
      { num: 13, name: 'OUT1_N', side: 'R', type: 'Digital Out', desc: '差動時脈輸出 1 負' },
      { num: 25, name: 'GND', side: 'T', type: 'Ground（EP）', desc: '散熱墊；接 GND', ep: true }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '時脈產生器（4 路差動輸出）' }, { k: '輸出電平', v: 'LP-HCSL(85/100Ω) / LVDS / LVCMOS' },
      { k: '組態', v: 'I2C 或 OTP（pin23 上電決定）' }, { k: '參考', v: 'REF_0/REF_1 輸出' },
      { k: '電源', v: 'VDDD/VDDA/VDD_REF + 各輸出 VDDO_x（1.8~3.3V）' }, { k: '封裝', v: 'VQFN-24 (RGE)，EP 接 GND' }
    ],
    secondSource: ['封裝 + pinout 相容（RGE VQFN-24、pin-to-pin）', '輸出數/型態相容（4 路差動、HCSL/LVDS/LVCMOS）', '組態介面相容（I2C/OTP）', '抖動同等或更佳', '各輸出 VDDO 電平設定相容', '電源範圍涵蓋', '工作溫度涵蓋'],
    dropIn: [{ part: 'LMK3H2108', note: '同系列；LMK3H2108 為 8 輸出版（腳數/封裝不同，非 pin-to-pin）' }]
  },
  {
    part: 'TPS7B7802-Q1', mfr: 'Texas Instruments', category: 'power',
    subcategory: '雙路 LDO 穩壓器 (I2C 診斷, 高壓車規)', package: 'VQFN-20 含散熱墊',
    whatIs: '雙路高壓 LDO 線性穩壓器（車規）：兩個獨立 LDO(OUT1/OUT2)各自從高壓輸入(IN1/IN2)穩壓輸出，含 I2C 介面做組態與診斷、故障輸出(NERR)。適合車用需監控的電源軌。',
    func: '每路 INx→OUTx 線性穩壓，輸出電壓可內定或用 FBx 電阻分壓設定；EN 致能；I2C(SCL/SDA + ADRR0~2 位址) 讀診斷/設定；NERR(開汲極 active-low) 報故障；RDY 指示 I2C 就緒；VCC 為內部 1.8V 控制電路輸出。',
    usedIn: '車用感測器/MCU 電源軌、需診斷監控的雙電源、車身電子、儀表。',
    desc: '車規雙路高壓 LDO，I2C 診斷/組態、NERR 故障輸出、可設輸出電壓（VQFN-20）。',
    datasheet: 'IC-spec/tps7b7802-q1.pdf',
    pins: [
      { num: 1, name: 'OUT1', side: 'L', type: 'Analog Out', desc: 'LDO1 輸出；≥4.7µF 陶瓷電容旁路至 GND' },
      { num: 2, name: 'FB1', side: 'L', type: 'Analog In', desc: 'LDO1 回授（外部分壓設輸出；內定則視為 NC）' },
      { num: 3, name: 'GND', side: 'L', type: 'Ground', desc: '接地；EP 接 GND' },
      { num: 4, name: 'NERR', side: 'L', type: 'Digital Out', desc: '故障輸出（開汲極 active-low，需上拉）' },
      { num: 5, name: 'DNC', side: 'L', type: 'No Connect', desc: '不接訊號源、不浮接；接 GND' },
      { num: 6, name: 'DNC', side: 'L', type: 'No Connect', desc: '不接訊號源、不浮接；接 GND' },
      { num: 7, name: 'RDY', side: 'L', type: 'Digital Out', desc: 'I2C 就緒指示（開汲極 active-high，需上拉）' },
      { num: 8, name: 'SDA', side: 'L', type: 'Digital I/O', desc: 'I2C 資料（需上拉）' },
      { num: 9, name: 'SCL', side: 'L', type: 'Digital In', desc: 'I2C 時脈（需上拉）' },
      { num: 10, name: 'VCC', side: 'L', type: 'Power', desc: '內部 1.8V 穩壓輸出（供內部控制）；1µF 到 GND' },
      { num: 20, name: 'NC', side: 'R', type: 'No Connect', desc: '未內接' },
      { num: 19, name: 'IN1', side: 'R', type: 'Power', desc: 'LDO1 高壓輸入' },
      { num: 18, name: 'IN2', side: 'R', type: 'Power', desc: 'LDO2 高壓輸入' },
      { num: 17, name: 'NC', side: 'R', type: 'No Connect', desc: '未內接' },
      { num: 16, name: 'EN', side: 'R', type: 'Digital In', desc: '致能' },
      { num: 15, name: 'OUT2', side: 'R', type: 'Analog Out', desc: 'LDO2 輸出；≥4.7µF 旁路至 GND' },
      { num: 14, name: 'FB2', side: 'R', type: 'Analog In', desc: 'LDO2 回授' },
      { num: 13, name: 'ADRR0', side: 'R', type: 'Digital In', desc: 'I2C 位址選擇 0' },
      { num: 12, name: 'ADRR1', side: 'R', type: 'Digital In', desc: 'I2C 位址選擇 1' },
      { num: 11, name: 'ADRR2', side: 'R', type: 'Digital In', desc: 'I2C 位址選擇 2' },
      { num: 21, name: 'GND', side: 'T', type: 'Ground（EP）', desc: '散熱墊；接 GND', ep: true }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '雙路高壓 LDO（含 I2C 診斷）' }, { k: '通道', v: '2（OUT1/OUT2 獨立）' },
      { k: '輸出設定', v: '內定或 FBx 外部分壓' }, { k: '介面', v: 'I2C（SCL/SDA + ADRR0~2 位址）' },
      { k: '診斷', v: 'NERR 故障(開汲極) + RDY 就緒' }, { k: '認證', v: '車規 AEC-Q100' },
      { k: '封裝', v: 'VQFN-20，EP 接 GND' }
    ],
    secondSource: ['封裝 + pinout 相容（VQFN-20、pin-to-pin）', '通道數相同（雙 LDO）', '輸入電壓範圍涵蓋（高壓）', '輸出電流/壓差同等或更佳', 'I2C 介面/位址相容', '診斷輸出相容（NERR/RDY）', '車規認證涵蓋', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'ADS122C14', mfr: 'Texas Instruments', category: 'data-converters',
    subcategory: 'Precision ADC (Delta-Sigma, I2C, 24-bit)', package: 'WQFN-16 (RTE) 3.0×3.0mm',
    whatIs: '精密類比數位轉換器（ADC）：24 位元、I2C、可接 8 路輸入。與 16-bit 的 ADS112C14 同封裝腳位、解析度升級版。',
    func: '把感測器微小類比訊號高解析度數位化，整合 PGA、可程式基準、雙電流源、溫度感測器。架構 Delta-Sigma（過取樣 + 噪聲整形），適合「慢速但要很準」的量測（溫度、電橋、壓力）。24-bit 解析度優於 ADS112C14 的 16-bit。',
    usedIn: '工業感測前端（RTD/熱電偶測溫、壓力/應變電橋、流量）、PLC/DCS 類比輸入模組、溫控器、患者監測。',
    desc: '24-bit、8 通道、Δ-Σ ADC，含 PGA、可程式基準、雙電流源、溫度感測器與 I2C；與 ADS112C14 同腳位（WQFN-16 RTE）。',
    datasheet: 'IC-spec/ads122c14.pdf',
    pins: [
      { num: 1, name: 'AIN0', side: 'L', type: 'Analog In', desc: '類比輸入 0' },
      { num: 2, name: 'AIN1', side: 'L', type: 'Analog In', desc: '類比輸入 1' },
      { num: 3, name: 'AIN2', side: 'L', type: 'Analog In', desc: '類比輸入 2' },
      { num: 4, name: 'AIN3', side: 'L', type: 'Analog In', desc: '類比輸入 3' },
      { num: 5, name: 'AIN4/REFP/GPIO0', side: 'B', type: 'Analog In / Digital I/O', desc: '類比輸入 4；外部基準正端 REFP；GPIO0' },
      { num: 6, name: 'AIN5/REFN/GPIO1', side: 'B', type: 'Analog In / Digital I/O', desc: '類比輸入 5；外部基準負端 REFN；GPIO1' },
      { num: 7, name: 'AIN6/GPIO2/{FAULT}', side: 'B', type: 'Analog In / Digital I/O', desc: '類比輸入 6；GPIO2；可設 FAULT 輸出（active-low）' },
      { num: 8, name: 'AIN7/GPIO3/{DRDY}/CLK', side: 'B', type: 'Analog In / Digital I/O', desc: '類比輸入 7；GPIO3；DRDY 資料就緒/外部 CLK' },
      { num: 12, name: 'SCL', side: 'R', type: 'Digital In', desc: 'I2C 串列時脈；上拉至 DVDD' },
      { num: 11, name: 'SDA', side: 'R', type: 'Digital I/O（開汲）', desc: 'I2C 串列資料（開汲）；上拉至 DVDD' },
      { num: 10, name: 'A1', side: 'R', type: 'Digital In', desc: 'I2C 位址選擇腳 1' },
      { num: 9, name: 'A0', side: 'R', type: 'Digital In', desc: 'I2C 位址選擇腳 0' },
      { num: 17, name: 'GND', side: 'T', type: 'Ground（EP）', desc: '外露焊墊 (EP)；接 GND', ep: true },
      { num: 16, name: 'REFOUT', side: 'T', type: 'Analog Out', desc: '內部基準輸出；接 100nF 到 GND' },
      { num: 15, name: 'AVDD', side: 'T', type: 'Power（類比）', desc: '類比供電；接 100nF 到 GND' },
      { num: 14, name: 'GND', side: 'T', type: 'Ground', desc: '接地' },
      { num: 13, name: 'DVDD', side: 'T', type: 'Power（數位）', desc: '數位供電；接 100nF 到 GND' }
    ],
    thermalPad: null,
    specs: [
      { k: '解析度', v: '24-bit' }, { k: '架構', v: 'Delta-Sigma (ΔΣ)' },
      { k: '通道', v: '8 輸入多工 (MUX)；可差動/單端' }, { k: '最高取樣率', v: '64 kSPS' },
      { k: 'PGA 增益', v: '0.5 ~ 256' }, { k: '類比供電 AVDD', v: '1.74 ~ 3.6 V' }, { k: '數位供電 DVDD', v: '1.65 ~ 3.6 V' },
      { k: '介面', v: 'I2C（Sm/Fm/Fm+），位址腳 A0/A1' }, { k: '整合功能', v: '溫度感測器、雙電流源、4× GPIO、CRC' },
      { k: '封裝', v: 'WQFN-16 (RTE) 3.0×3.0mm' }
    ],
    secondSource: ['封裝 + pinout 相容（RTE WQFN-16、pin-to-pin）', '解析度 ≥ 24-bit（或符需求）', '輸入通道數 ≥ 8、MUX 相容', '介面同 I2C、位址腳相容', 'AVDD/DVDD 範圍涵蓋', 'PGA 增益範圍涵蓋', '噪聲/ENOB 同等或更佳', '工作溫度涵蓋'],
    dropIn: [{ part: 'ADS112C14', note: '同 RTE WQFN-16 腳位完全相同（16-bit 版）' }]
  },
  {
    part: 'AMC0206M05', mfr: 'Texas Instruments', category: 'isolation',
    subcategory: '隔離式 ΔΣ 調變器 (±50mV 輸入)', package: 'SOIC-8 (Wide-body)',
    whatIs: '隔離式 Delta-Sigma 調變器：高壓側量 ±50mV 小類比訊號（適合低壓降分流電阻量電流），轉位元流(DOUT)經隔離障壁送到低壓側。與 AMC0206M25 同腳位、量程 ±50mV。',
    func: '高壓側 INP/INN 差動輸入(±50mV) ΔΣ 調變成 DOUT 位元流跨隔離傳出；CLKIN 外部時脈。AVDD/AGND 高壓側、DVDD/DGND 低壓側。±50mV 量程降低分流電阻功耗。',
    usedIn: '馬達/逆變器相電流隔離量測（小分流、低功耗）、隔離電流感測、電源回授。',
    desc: '隔離式 ΔΣ 調變器，±50mV 輸入、外部時脈 CLKIN、位元流 DOUT（SOIC-8 寬體）。',
    datasheet: 'IC-spec/amc0206m05.pdf',
    pins: [
      { num: 1, name: 'AVDD', side: 'L', type: 'Power', desc: '類比（高壓側）電源' },
      { num: 2, name: 'INP', side: 'L', type: 'Analog In', desc: '非反相類比輸入' },
      { num: 3, name: 'INN', side: 'L', type: 'Analog In', desc: '反相類比輸入' },
      { num: 4, name: 'AGND', side: 'L', type: 'Ground', desc: '類比（高壓側）接地' },
      { num: 8, name: 'DVDD', side: 'R', type: 'Power', desc: '數位（低壓側）電源' },
      { num: 7, name: 'CLKIN', side: 'R', type: 'Digital In', desc: '調變器時脈輸入（內部 1.5MΩ 下拉）' },
      { num: 6, name: 'DOUT', side: 'R', type: 'Digital Out', desc: '調變器位元流資料輸出' },
      { num: 5, name: 'DGND', side: 'R', type: 'Ground', desc: '數位（低壓側）接地' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '隔離式 ΔΣ 調變器' }, { k: '輸入範圍', v: '±50mV（差動）' },
      { k: '時脈', v: 'CLKIN 外部時脈輸入' }, { k: '輸出', v: 'DOUT 位元流（需外部 sinc 濾波）' },
      { k: '電源', v: 'AVDD(高壓側) + DVDD(低壓側)' }, { k: '封裝', v: 'SOIC-8 寬體（隔離）' }
    ],
    secondSource: ['封裝 + pinout 相容（SOIC-8 寬體、pin-to-pin）', '輸入範圍相容（±50mV）', '時脈型態相同（CLKIN 外部）', '隔離等級涵蓋', '輸出位元流相容', '電源範圍涵蓋', '工作溫度涵蓋'],
    dropIn: [{ part: 'AMC0306M05', note: '同腳位；AMC0306M05 為加強隔離(reinforced)版' }, { part: 'AMC0206M25', note: '同腳位；輸入範圍 ±250mV（非 ±50mV）' }]
  },
  {
    part: 'AMC0306M05', mfr: 'Texas Instruments', category: 'isolation',
    subcategory: '隔離式 ΔΣ 調變器 (±50mV, 加強隔離)', package: 'SOIC-8 (Wide-body)',
    whatIs: '隔離式 Delta-Sigma 調變器（加強隔離 reinforced）：±50mV 輸入、外部時脈、位元流輸出。與 AMC0206M05 同腳位，隔離等級為加強型（更高工作電壓/更嚴安規）。',
    func: '同 AMC0206M05：高壓側 ±50mV 差動輸入 ΔΣ 調變成 DOUT 跨隔離傳出，CLKIN 外部時脈。加強隔離適合更高壓/安規要求。',
    usedIn: '高壓馬達/逆變器相電流隔離量測、需加強隔離的電流感測、電源回授。',
    desc: '加強隔離式 ΔΣ 調變器，±50mV、外部時脈 CLKIN、位元流 DOUT（SOIC-8 寬體）。',
    datasheet: 'IC-spec/amc0306m05.pdf',
    pins: [
      { num: 1, name: 'AVDD', side: 'L', type: 'Power', desc: '類比（高壓側）電源' },
      { num: 2, name: 'INP', side: 'L', type: 'Analog In', desc: '非反相類比輸入' },
      { num: 3, name: 'INN', side: 'L', type: 'Analog In', desc: '反相類比輸入' },
      { num: 4, name: 'AGND', side: 'L', type: 'Ground', desc: '類比（高壓側）接地' },
      { num: 8, name: 'DVDD', side: 'R', type: 'Power', desc: '數位（低壓側）電源' },
      { num: 7, name: 'CLKIN', side: 'R', type: 'Digital In', desc: '調變器時脈輸入（內部下拉）' },
      { num: 6, name: 'DOUT', side: 'R', type: 'Digital Out', desc: '調變器位元流資料輸出' },
      { num: 5, name: 'DGND', side: 'R', type: 'Ground', desc: '數位（低壓側）接地' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '隔離式 ΔΣ 調變器（加強隔離）' }, { k: '輸入範圍', v: '±50mV' },
      { k: '隔離', v: 'reinforced（加強型）' }, { k: '時脈', v: 'CLKIN 外部' }, { k: '輸出', v: 'DOUT 位元流' },
      { k: '電源', v: 'AVDD(高壓側) + DVDD(低壓側)' }, { k: '封裝', v: 'SOIC-8 寬體（隔離）' }
    ],
    secondSource: ['封裝 + pinout 相容（SOIC-8 寬體、pin-to-pin）', '輸入範圍相容（±50mV）', '隔離等級涵蓋（≥加強型）', '時脈型態相同（CLKIN）', '輸出位元流相容', '電源範圍涵蓋', '工作溫度涵蓋'],
    dropIn: [{ part: 'AMC0206M05', note: '同腳位；AMC0206M05 為基本隔離(basic)版' }]
  },
  {
    part: 'TPS562246B', mfr: 'Texas Instruments', category: 'power',
    subcategory: '同步降壓轉換器 (整合 MOSFET)', package: 'SOT-23-6 等',
    whatIs: '同步降壓(buck)直流轉換器：整合高低側 NFET，把較高輸入電壓降壓成穩定較低輸出。少外接元件、固定頻率、含致能與回授。',
    func: 'VIN 輸入 → 內部高低側 FET 切換 SW 節點 → 外接電感/電容濾成穩定輸出；FB 回授分壓設定輸出電壓；EN 高致能；BST 為高側閘驅動自舉電容供電。做板上點負載電源。',
    usedIn: '板上點負載(POL)電源、SoC/FPGA/DDR 電源、消費/工業降壓供電。',
    desc: '同步降壓轉換器（整合 MOSFET），固定頻率、EN 致能、FB 可調輸出（SOT-23-6）。',
    datasheet: 'IC-spec/tps562246b.pdf',
    pins: [
      { num: 1, name: 'VIN', side: 'L', type: 'Power', desc: '輸入電壓' },
      { num: 2, name: 'SW', side: 'L', type: 'Analog Out', desc: '開關節點（高低側 FET 之間；接電感）' },
      { num: 3, name: 'GND', side: 'L', type: 'Ground', desc: '接地（低側 FET 源極 + 控制地；FB 單點接此）' },
      { num: 6, name: 'FB', side: 'R', type: 'Analog In', desc: '回授輸入（接輸出電阻分壓）' },
      { num: 5, name: 'EN', side: 'R', type: 'Digital In', desc: '致能（高致能，需上拉）' },
      { num: 4, name: 'BST', side: 'R', type: 'Power', desc: '高側閘驅動自舉；BST-SW 間接 0.1µF' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '同步降壓轉換器（整合 MOSFET）' }, { k: '回授', v: 'FB 外部分壓可調輸出' },
      { k: '致能', v: 'EN（高致能）' }, { k: '自舉', v: 'BST（0.1µF 到 SW）' },
      { k: '封裝', v: 'SOT-23-6' }
    ],
    secondSource: ['封裝 + pinout 相容（SOT-23-6、pin-to-pin）', '功能相同（同步 buck）', '輸入/輸出電壓範圍涵蓋', '輸出電流同等或更高', '開關頻率相容', 'EN/FB/BST 行為相容', '工作溫度涵蓋'],
    dropIn: [{ part: 'TPS562246', note: '同系列同腳位（確認頻率/補償差異）' }, { part: 'TPS562243', note: '同系列同腳位（電流/頻率規格不同）' }]
  },
  {
    part: 'LMG1020-Q1', mfr: 'Texas Instruments', category: 'power',
    subcategory: '低側 GaN/MOSFET 閘驅動器 (超高速)', package: 'DSBGA-6 (WCSP)',
    whatIs: '超高速低側閘驅動器：把邏輯準位輸入(IN+/IN–)放大成大電流閘驅動輸出(OUTH/OUTL)，快速開關 GaN FET 或 MOSFET。分開的上拉/下拉輸出便於獨立調整開關速度。極小 WCSP。',
    func: 'IN+/IN– 差動邏輯輸入 → OUTH(上拉)/OUTL(下拉)分開輸出驅動 FET 閘極；分開輸出可各串電阻獨立設上升/下降速度。超快傳播延遲，適合高頻(MHz) GaN 應用。',
    usedIn: 'GaN FET 高頻驅動、LiDAR 雷射驅動、高頻 DC-DC、無線充電、E 類放大。',
    desc: '超高速低側 GaN/MOSFET 閘驅動器，分開上拉/下拉輸出、極小 WCSP（DSBGA-6）。',
    datasheet: 'IC-spec/lmg1020-q1.pdf',
    pins: [
      { num: 'A1', name: 'VDD', side: 'L', type: 'Power', desc: '電源；低電感電容去耦到 GND' },
      { num: 'C1', name: 'IN+', side: 'L', type: 'Digital In', desc: '正邏輯輸入' },
      { num: 'C2', name: 'IN–', side: 'L', type: 'Digital In', desc: '負邏輯輸入' },
      { num: 'A2', name: 'OUTH', side: 'R', type: 'Analog Out', desc: '上拉閘驅動輸出（串電阻到 FET 閘）' },
      { num: 'B2', name: 'OUTL', side: 'R', type: 'Analog Out', desc: '下拉閘驅動輸出（選配電阻到 FET 閘）' },
      { num: 'B1', name: 'GND', side: 'R', type: 'Ground', desc: '接地' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '低側超高速閘驅動器（GaN/MOSFET）' }, { k: '輸入', v: 'IN+/IN– 邏輯準位' },
      { k: '輸出', v: '分開 OUTH/OUTL（獨立設開關速度）' }, { k: '速度', v: '超快傳播延遲（MHz 級 GaN）' },
      { k: '認證', v: '車規 AEC-Q100' }, { k: '封裝', v: 'DSBGA-6 (WCSP)；球號 A1/A2/B1/B2/C1/C2' }
    ],
    secondSource: ['封裝 + 球位相容（DSBGA-6、ball-to-ball）', '功能相同（低側閘驅動）', '峰值電流同等或更高', '傳播延遲同等或更短', '分開上拉/下拉輸出相容', '電源範圍涵蓋', '車規認證涵蓋', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'UCC57142-Q1', mfr: 'Texas Instruments', category: 'power',
    subcategory: '單通道閘驅動器 (含致能/故障 + 過流保護)', package: 'SOT-23-6 等',
    whatIs: '單通道閘驅動器：把控制訊號(IN)放大成大電流閘驅動輸出(OUT)驅動功率 FET/IGBT，含致能/故障回報(EN/FLT)與電流感測(OCP)過流保護。',
    func: 'IN→OUT 閘驅動；EN/FLT 雙功能腳(致能 + 故障報告)；OCP 電流感測輸入做過流保護；VDD 偏壓、COM 接地。做半橋/單管功率開關驅動。',
    usedIn: '功率 MOSFET/IGBT 驅動、電源轉換、馬達驅動級、電源保護。',
    desc: '單通道閘驅動器，含 EN/FLT + OCP 過流保護（SOT-23-6）。',
    datasheet: 'IC-spec/ucc57142-q1.pdf',
    pins: [
      { num: 1, name: 'OCP', side: 'L', type: 'Analog In', desc: '電流感測輸入（過流保護）' },
      { num: 2, name: 'COM', side: 'L', type: 'Ground', desc: '裝置接地' },
      { num: 3, name: 'OUT', side: 'L', type: 'Analog Out', desc: '閘驅動輸出' },
      { num: 6, name: 'IN', side: 'R', type: 'Digital In', desc: '驅動器輸入' },
      { num: 5, name: 'EN/FLT', side: 'R', type: 'Digital I/O', desc: '致能 + 故障回報（雙功能）' },
      { num: 4, name: 'VDD', side: 'R', type: 'Power', desc: '驅動器偏壓電源' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '單通道閘驅動器（含過流保護）' }, { k: '保護', v: 'OCP 電流感測' },
      { k: '控制', v: 'IN 輸入 + EN/FLT 致能/故障' }, { k: '電源', v: 'VDD 偏壓' },
      { k: '認證', v: '車規 AEC-Q100' }, { k: '封裝', v: 'SOT-23-6' }
    ],
    secondSource: ['封裝 + pinout 相容（SOT-23-6、pin-to-pin）', '功能相同（單通道閘驅動）', '峰值電流同等或更高', 'OCP 過流保護相容', 'EN/FLT 行為相容', '電源範圍涵蓋', '車規認證涵蓋', '工作溫度涵蓋'],
    dropIn: [{ part: 'UCC57148-Q1', note: '同系列同腳位（驅動電流較大版）' }]
  },
  {
    part: 'TRF1218', mfr: 'Texas Instruments', category: 'rf',
    subcategory: '單端轉差動 RF 放大器 (近 DC ~ 25GHz)', package: '12-pin 含散熱墊',
    whatIs: '寬頻單端轉差動 RF 放大器：把單端 RF 訊號(INP)放大並轉成差動輸出(OUTP/OUTM)，頻寬近 DC 到 25GHz。做高速 ADC/DAC 的差動驅動或訊號鏈放大。',
    func: 'INP 單端輸入(INM 接交流耦合電容)經放大轉成差動 OUTP/OUTM 輸出；PD 電源關斷(0=啟用、1=關斷，支援 1.8/3.3V 邏輯)；VDD 5V。極寬頻適合高速資料轉換器前端。',
    usedIn: '高速 ADC/DAC 差動驅動、寬頻 RF/微波訊號鏈、測試量測、光通訊。',
    desc: '近 DC~25GHz 單端轉差動 RF 放大器，差動輸出、PD 關斷、5V（12-pin 含散熱墊）。',
    datasheet: 'IC-spec/trf1218.pdf',
    pins: [
      { num: 1, name: 'GND', side: 'L', type: 'Ground', desc: '接地' },
      { num: 2, name: 'PD', side: 'L', type: 'Digital In', desc: '電源關斷（0=啟用、1=關斷；1.8/3.3V 邏輯）' },
      { num: 3, name: 'GND', side: 'L', type: 'Ground', desc: '接地' },
      { num: 4, name: 'GND', side: 'L', type: 'Ground', desc: '接地' },
      { num: 5, name: 'INM', side: 'L', type: 'Analog In', desc: '負輸入（接 100nF 交流耦合電容）' },
      { num: 6, name: 'INP', side: 'L', type: 'Analog In', desc: '單端輸入' },
      { num: 12, name: 'OUTM', side: 'R', type: 'Analog Out', desc: '差動輸出（負）' },
      { num: 11, name: 'OUTP', side: 'R', type: 'Analog Out', desc: '差動輸出（正）' },
      { num: 10, name: 'GND', side: 'R', type: 'Ground', desc: '接地' },
      { num: 9, name: 'VDD', side: 'R', type: 'Power', desc: '5V 電源' },
      { num: 8, name: 'GND', side: 'R', type: 'Ground', desc: '接地' },
      { num: 7, name: 'GND', side: 'R', type: 'Ground', desc: '接地' },
      { num: 13, name: 'GND', side: 'T', type: 'Ground（EP）', desc: '散熱墊；接 GND', ep: true }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '單端轉差動 RF 放大器' }, { k: '頻寬', v: '近 DC ~ 25 GHz' },
      { k: '輸出', v: '差動 OUTP/OUTM' }, { k: '關斷', v: 'PD（0=啟用、1=關斷）' },
      { k: '電源', v: '5V' }, { k: '封裝', v: '12-pin，EP 接 GND' }
    ],
    secondSource: ['封裝 + pinout 相容（12-pin、pin-to-pin）', '功能相同（單端轉差動 RF 放大）', '頻寬涵蓋（≥25GHz）', '增益/平坦度同等或更佳', '差動輸出擺幅相容', 'PD 邏輯相容', '電源相容（5V）', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'DAC60516W', mfr: 'Texas Instruments', category: 'data-converters',
    subcategory: '16 通道 12-bit DAC (SPI/I2C, 緩衝電壓輸出)', package: 'DSBGA (WCSP) 球陣',
    whatIs: '16 通道 12 位元數位類比轉換器(DAC)：一顆同時輸出 16 路獨立緩衝電壓(OUT0~OUT15)，SPI 或 I2C 介面寫入。LDAC 可同步更新、外部/內部基準。極小 WCSP 球陣封裝。',
    func: '主機經 SPI(SDI/SDO/SCLK) 或 I2C(SDA/SCL + A0/A1 位址) 寫各通道碼值 → 16 路緩衝電壓輸出；LDAC(active-low)同步更新所有通道；VREF 設滿刻度；VIO 數位介面電壓；RESET 復位。做多路類比控制/偏壓。',
    usedIn: '多路類比偏壓/控制、光模組/雷射偏壓、可程式電壓源、感測器校正、多通道致動。',
    desc: '16 通道 12-bit 緩衝電壓輸出 DAC，SPI/I2C、LDAC 同步、外/內部基準（WCSP 球陣）。',
    datasheet: 'IC-spec/dac60516w.pdf',
    pins: [
      { num: 'F1', name: 'OUT0', side: 'L', type: 'Analog Out', desc: 'DAC 輸出 0' },
      { num: 'E1', name: 'OUT1', side: 'L', type: 'Analog Out', desc: 'DAC 輸出 1' },
      { num: 'F2', name: 'OUT2', side: 'L', type: 'Analog Out', desc: 'DAC 輸出 2' },
      { num: 'E2', name: 'OUT3', side: 'L', type: 'Analog Out', desc: 'DAC 輸出 3' },
      { num: 'E5', name: 'OUT4', side: 'L', type: 'Analog Out', desc: 'DAC 輸出 4' },
      { num: 'F5', name: 'OUT5', side: 'L', type: 'Analog Out', desc: 'DAC 輸出 5' },
      { num: 'E6', name: 'OUT6', side: 'L', type: 'Analog Out', desc: 'DAC 輸出 6' },
      { num: 'F6', name: 'OUT7', side: 'L', type: 'Analog Out', desc: 'DAC 輸出 7' },
      { num: 'A1', name: 'OUT8', side: 'L', type: 'Analog Out', desc: 'DAC 輸出 8' },
      { num: 'B1', name: 'OUT9', side: 'L', type: 'Analog Out', desc: 'DAC 輸出 9' },
      { num: 'A2', name: 'OUT10', side: 'L', type: 'Analog Out', desc: 'DAC 輸出 10' },
      { num: 'B2', name: 'OUT11', side: 'L', type: 'Analog Out', desc: 'DAC 輸出 11' },
      { num: 'B5', name: 'OUT12', side: 'L', type: 'Analog Out', desc: 'DAC 輸出 12' },
      { num: 'A5', name: 'OUT13', side: 'L', type: 'Analog Out', desc: 'DAC 輸出 13' },
      { num: 'B6', name: 'OUT14', side: 'L', type: 'Analog Out', desc: 'DAC 輸出 14' },
      { num: 'A6', name: 'OUT15', side: 'L', type: 'Analog Out', desc: 'DAC 輸出 15' },
      { num: 'B3', name: 'A0/SDI', side: 'R', type: 'Digital I/O', desc: 'I2C 位址選擇 / SPI 資料輸入' },
      { num: 'C3', name: 'SDA/SCLK', side: 'R', type: 'Digital I/O', desc: 'I2C 資料 / SPI 時脈' },
      { num: 'C4', name: 'A1/SDO', side: 'R', type: 'Digital I/O', desc: 'I2C 位址選擇 / SPI 資料輸出' },
      { num: 'B4', name: '{LDAC}', side: 'R', type: 'Digital In', desc: 'DAC 同步更新（active-low）' },
      { num: 'E4', name: '{RESET}', side: 'R', type: 'Digital In', desc: '復位（active-low）' },
      { num: 'D3', name: 'FLEXIO', side: 'R', type: 'Digital I/O', desc: '多功能 GPIO' },
      { num: 'F3', name: 'VREF', side: 'R', type: 'Analog In', desc: '基準電壓（外部/內部）' },
      { num: 'F4', name: 'VIO', side: 'R', type: 'Power', desc: '數位介面電源' },
      { num: 'C1', name: 'AVDD', side: 'R', type: 'Power', desc: '類比電源' },
      { num: 'C6', name: 'AVDD', side: 'R', type: 'Power', desc: '類比電源' },
      { num: 'C2', name: 'GND', side: 'R', type: 'Ground', desc: '接地' },
      { num: 'C5', name: 'GND', side: 'R', type: 'Ground', desc: '接地' },
      { num: 'D1', name: 'GND', side: 'R', type: 'Ground', desc: '接地' },
      { num: 'D2', name: 'GND', side: 'R', type: 'Ground', desc: '接地' },
      { num: 'D4', name: 'GND', side: 'R', type: 'Ground', desc: '接地' },
      { num: 'D5', name: 'GND', side: 'R', type: 'Ground', desc: '接地' },
      { num: 'D6', name: 'GND', side: 'R', type: 'Ground', desc: '接地' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '16 通道 12-bit 電壓輸出 DAC' }, { k: '通道', v: '16（OUT0~OUT15，緩衝輸出）' },
      { k: '介面', v: 'SPI 或 I2C（A0/A1 位址）' }, { k: '同步', v: 'LDAC（active-low 同步更新）' },
      { k: '基準', v: 'VREF（外部/內部）' }, { k: '電源', v: 'AVDD + VIO（數位介面）' },
      { k: '封裝', v: 'DSBGA (WCSP) 球陣' }
    ],
    secondSource: ['封裝 + 球位相容（DSBGA、ball-to-ball）', '通道數/解析度相容（16ch / ≥12-bit）', '介面相容（SPI/I2C、位址）', '輸出型態相容（緩衝電壓）', 'LDAC 同步相容', '基準/量程相容', '電源範圍涵蓋', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'TRF2001', mfr: 'Texas Instruments', category: 'rf',
    subcategory: 'ISM/Wi-SUN RF 前端模組 (PA+LNA+T/R 開關)', package: 'QFN-28 含散熱墊',
    whatIs: '860~930MHz ISM 頻段 RF 前端模組(FEM)：整合功率放大器(PA)、低雜訊放大器(LNA)、收發切換(T/R switch)。發射時放大 PA 訊號到天線，接收時低雜訊放大天線訊號。給 Sub-GHz/Wi-SUN 無線。',
    func: '發射：PA_IN→內部 PA→TX_FLT→(外部 TX 濾波)→ANT；接收：ANT→RX_FLT→(外部 RX 濾波)→LNA_IN→LNA；TR 切收發、CEN 晶片致能、CTR 選收發路徑、CIB 內部偏壓控制；VDET 功率偵測輸出。VCC/VCC_PA 供電。',
    usedIn: 'Wi-SUN/Sub-GHz 智慧電表、IoT 無線、868/915MHz ISM 收發前端、多協定無線。',
    desc: '860~930MHz ISM/Wi-SUN RF 前端模組，整合 PA+LNA+T/R 開關、功率偵測（QFN-28）。',
    datasheet: 'IC-spec/trf2001.pdf',
    pins: [
      { num: 1, name: 'CEN', side: 'L', type: 'Digital In', desc: '晶片致能數位控制' },
      { num: 2, name: 'PA_IN', side: 'L', type: 'Analog In', desc: 'PA 輸入' },
      { num: 3, name: 'TX_FLT', side: 'L', type: 'Analog Out', desc: '發射訊號（接外部 TX 濾波到 PA_IN）' },
      { num: 4, name: 'GND', side: 'L', type: 'Ground', desc: 'RF 接地' },
      { num: 5, name: 'TR', side: 'L', type: 'Digital In', desc: '收發切換控制' },
      { num: 6, name: 'GND', side: 'L', type: 'Ground', desc: 'RF 接地' },
      { num: 7, name: 'CIB', side: 'L', type: 'Digital In', desc: '內部偏壓數位控制' },
      { num: 8, name: 'CTR', side: 'L', type: 'Digital In', desc: '收發路徑選擇數位控制' },
      { num: 9, name: 'GND', side: 'L', type: 'Ground', desc: 'RF 接地' },
      { num: 10, name: 'LNA_IN', side: 'L', type: 'Analog In', desc: 'LNA 輸入（不用 RX 濾波可短接 RX_FLT）' },
      { num: 11, name: 'GND', side: 'L', type: 'Ground', desc: 'RF 接地' },
      { num: 12, name: 'RX_FLT', side: 'L', type: 'Analog Out', desc: '接收訊號（來自 ANT；接外部 RX 濾波到 LNA_IN）' },
      { num: 13, name: 'VDET', side: 'L', type: 'Analog Out', desc: '功率偵測電壓輸出' },
      { num: 14, name: 'GND', side: 'L', type: 'Ground', desc: 'RF 接地' },
      { num: 28, name: 'VCC', side: 'R', type: 'Power', desc: 'LNA 與數位控制電源' },
      { num: 27, name: 'GND', side: 'R', type: 'Ground', desc: 'RF 接地' },
      { num: 26, name: 'VCC_PA', side: 'R', type: 'Power', desc: 'PA 電源' },
      { num: 25, name: 'VCC_PA', side: 'R', type: 'Power', desc: 'PA 電源' },
      { num: 24, name: 'GND', side: 'R', type: 'Ground', desc: 'RF 接地' },
      { num: 23, name: 'GND', side: 'R', type: 'Ground', desc: 'RF 接地' },
      { num: 22, name: 'GND', side: 'R', type: 'Ground', desc: 'RF 接地' },
      { num: 21, name: 'GND', side: 'R', type: 'Ground', desc: 'RF 接地' },
      { num: 20, name: 'GND', side: 'R', type: 'Ground', desc: 'RF 接地' },
      { num: 19, name: 'GND', side: 'R', type: 'Ground', desc: 'RF 接地' },
      { num: 18, name: 'GND', side: 'R', type: 'Ground', desc: 'RF 接地' },
      { num: 17, name: 'ANT', side: 'R', type: 'Analog I/O', desc: '天線埠' },
      { num: 16, name: 'GND', side: 'R', type: 'Ground', desc: 'RF 接地' },
      { num: 15, name: 'GND', side: 'R', type: 'Ground', desc: 'RF 接地' },
      { num: 29, name: 'GND', side: 'T', type: 'Ground（EP）', desc: '散熱墊；接 GND', ep: true }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: 'ISM/Wi-SUN RF 前端模組（PA+LNA+T/R）' }, { k: '頻段', v: '860 ~ 930 MHz' },
      { k: '整合', v: 'PA + LNA + 收發開關 + 功率偵測(VDET)' }, { k: '控制', v: 'CEN/TR/CTR/CIB 數位控制' },
      { k: '電源', v: 'VCC + VCC_PA' }, { k: '封裝', v: 'QFN-28，EP 接 GND' }
    ],
    secondSource: ['封裝 + pinout 相容（QFN-28、pin-to-pin）', '頻段涵蓋（860~930MHz）', '功能相同（PA+LNA+T/R FEM）', 'PA 輸出功率 / LNA 雜訊同等或更佳', '控制腳相容', '電源相容（VCC/VCC_PA）', '工作溫度涵蓋'],
    dropIn: [{ part: 'TRF2001P', note: '同 QFN-28 系列；TRF2001P 引出 LNA_OUT(pin3)、無 TX_FLT/TR，拓樸不同需確認' }]
  },
  {
    part: 'TRF2001P', mfr: 'Texas Instruments', category: 'rf',
    subcategory: 'ISM/Wi-SUN RF 前端模組 (PA+LNA, LNA 輸出引出)', package: 'QFN-28 含散熱墊',
    whatIs: '820~1054MHz ISM 頻段 RF 前端模組(FEM) 變體：整合 PA 與 LNA，且把 LNA 輸出(LNA_OUT)引出供外部處理（異於 TRF2001 的整合 T/R 路徑）。給 Sub-GHz/Wi-SUN 無線。',
    func: '發射：PA_IN→內部 PA→ANT；接收：ANT→LNA_IN→LNA→LNA_OUT（引出）；CEN 致能、CTR 選路徑、CIB 偏壓；VDET 功率偵測；RX_FLT 接收濾波節點。VCC/VCC_PA 供電。與 TRF2001 同封裝、拓樸不同。',
    usedIn: 'Wi-SUN/Sub-GHz 智慧電表、IoT 無線、需外接 LNA 輸出處理的收發前端。',
    desc: '820~1054MHz ISM/Wi-SUN RF 前端模組，PA+LNA、LNA_OUT 引出、功率偵測（QFN-28）。',
    datasheet: 'IC-spec/trf2001p.pdf',
    pins: [
      { num: 1, name: 'CEN', side: 'L', type: 'Digital In', desc: '晶片致能數位控制' },
      { num: 2, name: 'GND', side: 'L', type: 'Ground', desc: 'RF 接地' },
      { num: 3, name: 'LNA_OUT', side: 'L', type: 'Analog Out', desc: 'LNA 輸出（引出）' },
      { num: 4, name: 'GND', side: 'L', type: 'Ground', desc: 'RF 接地' },
      { num: 5, name: 'PA_IN', side: 'L', type: 'Analog In', desc: 'PA 輸入' },
      { num: 6, name: 'GND', side: 'L', type: 'Ground', desc: 'RF 接地' },
      { num: 7, name: 'CIB', side: 'L', type: 'Digital In', desc: '內部偏壓數位控制' },
      { num: 8, name: 'CTR', side: 'L', type: 'Digital In', desc: '收發路徑選擇數位控制' },
      { num: 9, name: 'GND', side: 'L', type: 'Ground', desc: 'RF 接地' },
      { num: 10, name: 'LNA_IN', side: 'L', type: 'Analog In', desc: 'LNA 輸入（不用 RX 濾波可短接 RX_FLT）' },
      { num: 11, name: 'GND', side: 'L', type: 'Ground', desc: 'RF 接地' },
      { num: 12, name: 'RX_FLT', side: 'L', type: 'Analog Out', desc: '接收訊號（來自 ANT）' },
      { num: 13, name: 'VDET', side: 'L', type: 'Analog Out', desc: '功率偵測電壓輸出' },
      { num: 14, name: 'GND', side: 'L', type: 'Ground', desc: 'RF 接地' },
      { num: 28, name: 'VCC', side: 'R', type: 'Power', desc: 'LNA 與數位控制電源' },
      { num: 27, name: 'GND', side: 'R', type: 'Ground', desc: 'RF 接地' },
      { num: 26, name: 'VCC_PA', side: 'R', type: 'Power', desc: 'PA 電源' },
      { num: 25, name: 'VCC_PA', side: 'R', type: 'Power', desc: 'PA 電源' },
      { num: 24, name: 'GND', side: 'R', type: 'Ground', desc: 'RF 接地' },
      { num: 23, name: 'GND', side: 'R', type: 'Ground', desc: 'RF 接地' },
      { num: 22, name: 'GND', side: 'R', type: 'Ground', desc: 'RF 接地' },
      { num: 21, name: 'GND', side: 'R', type: 'Ground', desc: 'RF 接地' },
      { num: 20, name: 'GND', side: 'R', type: 'Ground', desc: 'RF 接地' },
      { num: 19, name: 'GND', side: 'R', type: 'Ground', desc: 'RF 接地' },
      { num: 18, name: 'GND', side: 'R', type: 'Ground', desc: 'RF 接地' },
      { num: 17, name: 'ANT', side: 'R', type: 'Analog I/O', desc: '天線埠' },
      { num: 16, name: 'GND', side: 'R', type: 'Ground', desc: 'RF 接地' },
      { num: 15, name: 'GND', side: 'R', type: 'Ground', desc: 'RF 接地' },
      { num: 29, name: 'GND', side: 'T', type: 'Ground（EP）', desc: '散熱墊；接 GND', ep: true }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: 'ISM/Wi-SUN RF 前端模組（PA+LNA，LNA 輸出引出）' }, { k: '頻段', v: '820 ~ 1054 MHz' },
      { k: '整合', v: 'PA + LNA + 功率偵測(VDET)；LNA_OUT 引出' }, { k: '控制', v: 'CEN/CTR/CIB 數位控制' },
      { k: '電源', v: 'VCC + VCC_PA' }, { k: '封裝', v: 'QFN-28，EP 接 GND' }
    ],
    secondSource: ['封裝 + pinout 相容（QFN-28、pin-to-pin）', '頻段涵蓋（820~1054MHz）', '功能相同（PA+LNA FEM，LNA_OUT 引出）', 'PA 功率 / LNA 雜訊同等或更佳', '控制腳相容', '電源相容', '工作溫度涵蓋'],
    dropIn: [{ part: 'TRF2001', note: '同 QFN-28 系列；TRF2001 為整合 T/R 路徑(TX_FLT/TR)版，拓樸不同需確認' }]
  },
  {
    part: 'DRV7167', mfr: 'Texas Instruments', category: 'motor',
    subcategory: 'GaN 半橋閘驅動 + 功率級 (可程式轉速)', package: 'QFN 含散熱墊',
    whatIs: '整合式 GaN 半橋功率級：內含高低側 GaN FET + 閘驅動，把 PWM 控制訊號轉成半橋開關輸出(OUT)。可程式轉速(slew rate)控 EMI，支援 PWM / 獨立輸入(IIM) 兩種控制模式。做馬達/電源開關。',
    func: 'PWM 模式：ENIN/HI 致能、PWM/LI 送 PWM；RDLR/RDLF/RDHR/RDHF 電阻設高低側 FET 開關轉速；OUT 為半橋開關節點(接 HS)；VM 高側汲極輸入、PGND 低側源極；GVDD 5V 供電；EN/FLT 致能+故障；BOOT 高側自舉。可回報零電壓切換(ZVD)。',
    usedIn: '馬達驅動半橋、同步整流、DC-DC 功率級、需高效率 GaN 開關的電源。',
    desc: 'GaN 半橋閘驅動 + 功率級，可程式轉速、PWM/IIM 雙模式、ZVD 偵測（QFN）。',
    datasheet: 'IC-spec/drv7167.pdf',
    pins: [
      { num: 1, name: 'DHL/ZVDL', side: 'L', type: 'Digital I/O', desc: 'PWM 模式：設高→低死區時間(電阻到 AGND)；IIM 模式：低側 ZVD 輸出' },
      { num: 2, name: 'DLH/ZVDH', side: 'L', type: 'Digital I/O', desc: 'PWM 模式：設低→高死區時間；IIM 模式：高側 ZVD 輸出' },
      { num: 3, name: 'RDLR', side: 'L', type: 'Analog In', desc: '低側 FET 開啟轉速設定(電阻到 AGND)' },
      { num: 4, name: 'RDLF', side: 'L', type: 'Analog In', desc: '低側 FET 關閉轉速設定；浮接=啟用 PWM 模式' },
      { num: 5, name: 'OUT', side: 'L', type: 'Power', desc: '半橋開關節點（內接 HS）' },
      { num: 6, name: 'PGND', side: 'L', type: 'Ground', desc: '功率接地（低側 GaN FET 源極）' },
      { num: 7, name: 'VM', side: 'L', type: 'Power', desc: '輸入電壓（高側 GaN FET 汲極）' },
      { num: 8, name: 'RDHF', side: 'L', type: 'Analog In', desc: '高側 FET 關閉轉速設定(電阻到 HS)' },
      { num: 9, name: 'RDHR', side: 'L', type: 'Analog In', desc: '高側 FET 開啟轉速設定(勿浮接)' },
      { num: 18, name: 'PGND', side: 'R', type: 'Ground', desc: '功率接地（低側源極）' },
      { num: 17, name: 'PGND', side: 'R', type: 'Ground', desc: '功率接地（低側源極）' },
      { num: 16, name: 'EN/FLT', side: 'R', type: 'Digital I/O', desc: '晶片致能 + 故障輸出' },
      { num: 15, name: 'AGND', side: 'R', type: 'Ground', desc: '類比接地（內接低側源極）' },
      { num: 14, name: 'GVDD', side: 'R', type: 'Power', desc: '5V 裝置電源' },
      { num: 13, name: 'PWM/LI', side: 'R', type: 'Digital In', desc: 'PWM 模式：PWM 輸入；IIM 模式：低側控制輸入' },
      { num: 12, name: 'ENIN/HI', side: 'R', type: 'Digital In', desc: 'PWM 模式：致能高低側；IIM 模式：高側控制輸入' },
      { num: 11, name: 'HS', side: 'R', type: 'Power', desc: '高側 GaN FET 源極' },
      { num: 10, name: 'BOOT', side: 'R', type: 'Power', desc: '高側閘驅動自舉軌（接旁路電容到 HS）' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: 'GaN 半橋閘驅動 + 功率級' }, { k: '控制模式', v: 'PWM 或 IIM（獨立高低側輸入）' },
      { k: '可程式轉速', v: 'RDLR/RDLF/RDHR/RDHF 電阻設 slew rate（控 EMI）' }, { k: '回報', v: 'ZVD 零電壓切換偵測、EN/FLT 故障' },
      { k: '電源', v: 'VM 功率 + GVDD 5V 驅動 + BOOT 自舉' }, { k: '封裝', v: 'QFN 含散熱墊（PGND/OUT 大電流墊）' }
    ],
    secondSource: ['封裝 + pinout 相容（QFN、pin-to-pin）', '功能相同（GaN 半橋功率級）', '耐壓/電流同等或更佳', '控制模式相容（PWM/IIM）', '可程式轉速相容', 'ZVD/故障回報相容', '電源軌相容（VM/GVDD/BOOT）', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'LMG2652H', mfr: 'Texas Instruments', category: 'power',
    subcategory: '650V GaN 功率半橋 (整合驅動 + 電流感測)', package: 'QFN 6×8mm 含散熱墊',
    whatIs: '650V / 140mΩ GaN 功率半橋模組：整合高低側 GaN FET、閘驅動、自舉 FET、高側電平移位。少元件、省板面。含低側電流感測模擬(CS)取代外部感測電阻。',
    func: 'INH/INL(參考 AGND) 或 GDH(參考 SW) 控高低側閘驅動；DH 高側汲極(接 VIN)、SW 半橋開關節點、SL 低側源極(接功率地)；RDRVH/RDRVL 電阻設開關轉速控 EMI；CS 輸出低側電流縮放複製(供控制器)；BST 自舉、AUX 內部驅動供電、EN 致能。',
    usedIn: '高壓 DC-DC、圖騰柱 PFC、馬達逆變器、伺服器/工業電源半橋、GaN 高效電源。',
    desc: '650V 140mΩ GaN 功率半橋，整合驅動/自舉/電平移位 + 電流感測模擬、可程式轉速（QFN 6×8mm）。',
    datasheet: 'IC-spec/lmg2652h.pdf',
    pins: [
      { num: 1, name: 'NC', side: 'L', type: 'No Connect', desc: '錨定腳（焊到 PCB 焊盤、不接其他金屬）' },
      { num: 2, name: 'INH', side: 'L', type: 'Digital In', desc: '高側閘驅動控制輸入（參考 AGND，內部電平移位）' },
      { num: 3, name: 'INL', side: 'L', type: 'Digital In', desc: '低側閘驅動控制輸入（參考 AGND）' },
      { num: 4, name: 'CS', side: 'L', type: 'Analog Out', desc: '電流感測模擬輸出（低側 FET 電流縮放複製）' },
      { num: 5, name: 'SL', side: 'L', type: 'Power', desc: '低側 GaN FET 源極（低側散熱墊，內接 AGND）' },
      { num: 6, name: 'NC', side: 'L', type: 'No Connect', desc: '錨定腳' },
      { num: 7, name: 'SL', side: 'L', type: 'Power', desc: '低側 GaN FET 源極' },
      { num: 8, name: 'DH', side: 'L', type: 'Power', desc: '高側 GaN FET 汲極（接 VIN）' },
      { num: 9, name: 'NC', side: 'L', type: 'No Connect', desc: '錨定腳' },
      { num: 10, name: 'SW', side: 'L', type: 'Power', desc: '半橋開關節點（高側源極/低側汲極，高側散熱墊）' },
      { num: 19, name: 'EN', side: 'R', type: 'Digital In', desc: '致能' },
      { num: 18, name: 'AUX', side: 'R', type: 'Power', desc: '內部驅動供電/旁路（勿使 INH/GDH 高於 AUX/BST）' },
      { num: 17, name: 'AGND', side: 'R', type: 'Ground', desc: '類比接地' },
      { num: 16, name: 'RDRVL', side: 'R', type: 'Analog In', desc: '低側驅動強度/轉速設定電阻' },
      { num: 15, name: 'SW', side: 'R', type: 'Power', desc: '半橋開關節點' },
      { num: 14, name: 'BST', side: 'R', type: 'Power', desc: '高側閘驅動自舉軌' },
      { num: 13, name: 'RDRVH', side: 'R', type: 'Analog In', desc: '高側驅動強度/轉速設定電阻（RDRVH 到 SW）' },
      { num: 12, name: 'GDH', side: 'R', type: 'Digital In', desc: '高側閘驅動控制輸入（參考 SW，直接驅動；用 INH 則短接 SW）' },
      { num: 11, name: 'NC', side: 'R', type: 'No Connect', desc: '錨定腳' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '650V GaN 功率半橋（整合驅動）' }, { k: '耐壓/導通', v: '650V / 140mΩ' },
      { k: '整合', v: '高低側 GaN FET + 閘驅動 + 自舉 FET + 電平移位' }, { k: '電流感測', v: 'CS 模擬輸出（取代外部感測電阻）' },
      { k: '可程式轉速', v: 'RDRVH/RDRVL 設 slew rate（控 EMI/振鈴）' }, { k: '控制', v: 'INH/INL(參考 AGND) 或 GDH(參考 SW)' },
      { k: '封裝', v: 'QFN 6×8mm（SL/SW 為散熱墊）' }
    ],
    secondSource: ['封裝 + pinout 相容（QFN 6×8mm、pin-to-pin）', '耐壓/導通阻抗同等或更佳（≤650V/140mΩ）', '整合功能相容（驅動/自舉/電平移位）', '電流感測模擬相容', '可程式轉速相容', '控制輸入相容（INH/INL/GDH）', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'UC1825B-SP', mfr: 'Texas Instruments', category: 'power',
    subcategory: '高速 PWM 控制器 (耐輻射, 雙輸出)', package: 'CFP-16 等',
    whatIs: '高速脈寬調變(PWM)控制器（耐輻射 Class-V）：產生 PWM 驅動訊號控制切換式電源的開關，含誤差放大器、振盪器、電流限制、軟啟動與雙圖騰柱輸出。做隔離/非隔離 DC-DC 電源控制。',
    func: '誤差放大器(INV/NI/EAOUT)比較回授與基準→補償；振盪器(RT/CT 設頻率、CLK 輸出)；RAMP 進 PWM 比較器(電壓模式前饋或峰值電流模式斜率補償)；SS 軟啟動兼最大工作週期箝位；ILIM/SD 電流限制+關斷；雙輸出 OUTA/OUTB 圖騰柱驅動 FET；VREF 基準輸出、VC 輸出級供電、VCC 供電。',
    usedIn: '航太/衛星電源、隔離 DC-DC、推挽/半橋/全橋/順向轉換器 PWM 控制、耐輻射電源。',
    desc: '耐輻射高速 PWM 控制器，誤差放大/振盪/電流限制/軟啟動 + 雙圖騰柱輸出（CFP-16）。',
    datasheet: 'IC-spec/uc1825b-sp.pdf',
    pins: [
      { num: 1, name: 'INV', side: 'L', type: 'Analog In', desc: '誤差放大器反相輸入' },
      { num: 2, name: 'NI', side: 'L', type: 'Analog In', desc: '誤差放大器非反相輸入' },
      { num: 3, name: 'EAOUT', side: 'L', type: 'Analog Out', desc: '誤差放大器輸出（補償）' },
      { num: 4, name: 'CLK', side: 'L', type: 'Digital Out', desc: '內部振盪器輸出' },
      { num: 5, name: 'RT', side: 'L', type: 'Analog In', desc: '振盪頻率設定電阻' },
      { num: 6, name: 'CT', side: 'L', type: 'Analog In', desc: '振盪頻率設定電容' },
      { num: 7, name: 'RAMP', side: 'L', type: 'Analog In', desc: 'PWM 比較器非反相輸入（電壓前饋/斜率補償）' },
      { num: 8, name: 'SS', side: 'L', type: 'Analog In', desc: '軟啟動（兼最大工作週期箝位）' },
      { num: 16, name: 'VREF', side: 'R', type: 'Analog Out', desc: '基準電壓輸出' },
      { num: 15, name: 'VCC', side: 'R', type: 'Power', desc: '電源' },
      { num: 14, name: 'OUTB', side: 'R', type: 'Digital Out', desc: '高電流圖騰柱輸出 B' },
      { num: 13, name: 'VC', side: 'R', type: 'Power', desc: '輸出驅動級電源' },
      { num: 12, name: 'PGND', side: 'R', type: 'Ground', desc: '輸出驅動級接地' },
      { num: 11, name: 'OUTA', side: 'R', type: 'Digital Out', desc: '高電流圖騰柱輸出 A' },
      { num: 10, name: 'GND', side: 'R', type: 'Ground', desc: '類比接地' },
      { num: 9, name: 'ILIM/SD', side: 'R', type: 'Analog In', desc: '電流限制比較器 + 關斷輸入' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '高速 PWM 控制器（雙輸出）' }, { k: '控制模式', v: '電壓模式 / 峰值電流模式' },
      { k: '整合', v: '誤差放大器 + 振盪器 + 電流限制 + 軟啟動' }, { k: '輸出', v: '雙圖騰柱 OUTA/OUTB（高電流）' },
      { k: '耐輻射', v: 'Class-V（rad-hard，航太級）' }, { k: '封裝', v: 'CFP-16' }
    ],
    secondSource: ['封裝 + pinout 相容（16-pin、pin-to-pin）', '功能相同（高速 PWM 控制器）', '控制模式相容（電壓/峰值電流）', '頻率範圍涵蓋', '輸出驅動電流同等或更佳', '耐輻射等級涵蓋（Class-V）', '電源範圍涵蓋', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'UCG28846', mfr: 'Texas Instruments', category: 'power',
    subcategory: '自偏壓高頻準諧振 GaN Flyback 轉換器', package: 'QFN-10 / SOIC',
    whatIs: '整合 GaN 的高頻準諧振(QR) Flyback 反激轉換器控制器：內建高壓 GaN 功率開關(HEMT) + 控制器 + HV 啟動，自我偏壓(不需輔助繞組/VCC)。做小型高效 AC/DC 電源(充電器/轉接器)。',
    func: 'HV 腳做高壓啟動、AC 線偵測與 X 電容洩放；SW 為內建 GaN HEMT 汲極兼谷底切換/保護感測；FB 接光耦回授穩壓；TR 電阻設變壓器匝比、IPS 設峰值電流與 SW 轉速、FCL 設頻率箝位/故障行為、CFX 補償；FLT 接 NTC 做外部過溫保護。準諧振谷底切換降低開關損耗。',
    usedIn: 'USB-PD 充電器/轉接器、小型 AC/DC 電源、家電待機電源、輔助電源。',
    desc: '自偏壓高頻準諧振 GaN Flyback 轉換器（整合 GaN 開關），HV 啟動、光耦回授、可設匝比/峰值電流（QFN-10）。',
    datasheet: 'IC-spec/ucg28846.pdf',
    pins: [
      { num: 1, name: 'HV', side: 'L', type: 'Power', desc: 'HV 啟動、AC 線偵測、X 電容洩放' },
      { num: 2, name: 'SW', side: 'L', type: 'Power', desc: '內建 GaN HEMT 汲極（谷底切換/保護感測）' },
      { num: 3, name: 'GND', side: 'L', type: 'Ground', desc: '訊號地（內接功率地）' },
      { num: 4, name: 'FLT', side: 'L', type: 'Digital Out', desc: '外部過溫保護（接 NTC 到 GND）' },
      { num: 5, name: 'FB', side: 'L', type: 'Analog In', desc: '回授訊號（接光耦集極）' },
      { num: 10, name: 'GND', side: 'R', type: 'Ground', desc: '訊號地' },
      { num: 9, name: 'CFX', side: 'R', type: 'Analog In', desc: '補償設定' },
      { num: 8, name: 'FCL', side: 'R', type: 'Analog In', desc: '切換頻率箝位/故障行為設定' },
      { num: 7, name: 'IPS', side: 'R', type: 'Analog In', desc: '峰值電流 + SW 轉速設定（電阻到 GND）' },
      { num: 6, name: 'TR', side: 'R', type: 'Analog In', desc: '變壓器匝比設定 Np/Ns（電阻到 GND）' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: '自偏壓準諧振 GaN Flyback 轉換器' }, { k: '整合', v: '高壓 GaN HEMT 功率開關 + 控制器 + HV 啟動' },
      { k: '偏壓', v: '自偏壓（不需輔助繞組/外部 VCC）' }, { k: '切換', v: '準諧振谷底切換（低損耗）' },
      { k: '設定', v: 'TR 匝比 / IPS 峰值電流 / FCL 頻率 / CFX 補償' }, { k: '保護', v: 'FLT 外部過溫(NTC)' },
      { k: '封裝', v: 'QFN-10 / SOIC' }
    ],
    secondSource: ['封裝 + pinout 相容（QFN-10、pin-to-pin）', '功能相同（GaN QR flyback）', 'GaN 開關耐壓/導通同等或更佳', '自偏壓/HV 啟動相容', '回授型態相容（光耦）', '匝比/峰值電流設定相容', '保護行為相容', '工作溫度涵蓋'],
    dropIn: [{ part: 'UCG28836', note: '同系列同腳位（不同功率/電流檔）' }]
  },
  {
    part: 'CDCLVP111-SEP', mfr: 'Texas Instruments', category: 'clocks',
    subcategory: 'LVPECL 1:10 差動時脈扇出 (2:1 輸入 mux, 耐輻射)', package: 'QFN-32',
    whatIs: 'LVECL/LVPECL 差動時脈扇出緩衝器：從 2 組差動時脈輸入(CLK0/CLK1)選 1 路，複製成 10 路低歪斜差動時脈輸出(Q0~Q9 各含互補)。耐輻射(SEP)、航太級。',
    func: 'CLK_SEL 選 CLK0 或 CLK1 差動輸入 → 內部緩衝複製為 10 對差動 LVPECL 輸出(Qn/nQn)，低歪斜低抖動；VBB 為單端輸入操作的參考電壓輸出；VCC 多腳供電、VEE 接地/負供電(ECL 模式)。做高速差動時脈樹分送。',
    usedIn: '太空/航太高速時脈分送、SerDes/ADC/DAC 差動參考時脈、通訊背板時脈樹。',
    desc: '耐輻射 LVPECL 1:10 差動時脈扇出（2:1 輸入 mux），低歪斜、互補輸出（QFN-32）。',
    datasheet: 'IC-spec/cdclvp111-sep.pdf',
    pins: [
      { num: 1, name: 'VCC', side: 'L', type: 'Power', desc: '電源' },
      { num: 2, name: 'CLK_SEL', side: 'L', type: 'Digital In', desc: '輸入選擇（CLK0/CLK1；LVTTL/LVCMOS 相容）' },
      { num: 3, name: 'CLK0', side: 'L', type: 'Digital In', desc: '差動時脈輸入 0（正）' },
      { num: 4, name: 'nCLK0', side: 'L', type: 'Digital In', desc: '差動時脈輸入 0（負）' },
      { num: 5, name: 'VBB', side: 'L', type: 'Analog Out', desc: '單端輸入操作參考電壓輸出' },
      { num: 6, name: 'CLK1', side: 'L', type: 'Digital In', desc: '差動時脈輸入 1（正）' },
      { num: 7, name: 'nCLK1', side: 'L', type: 'Digital In', desc: '差動時脈輸入 1（負）' },
      { num: 8, name: 'VEE', side: 'L', type: 'Ground', desc: '接地/負供電（ECL 模式）' },
      { num: 9, name: 'VCC', side: 'L', type: 'Power', desc: '電源' },
      { num: 10, name: 'nQ9', side: 'L', type: 'Digital Out', desc: '差動輸出 9（互補）' },
      { num: 11, name: 'Q9', side: 'L', type: 'Digital Out', desc: '差動輸出 9（正）' },
      { num: 12, name: 'nQ8', side: 'L', type: 'Digital Out', desc: '差動輸出 8（互補）' },
      { num: 13, name: 'Q8', side: 'L', type: 'Digital Out', desc: '差動輸出 8（正）' },
      { num: 14, name: 'nQ7', side: 'L', type: 'Digital Out', desc: '差動輸出 7（互補）' },
      { num: 15, name: 'Q7', side: 'L', type: 'Digital Out', desc: '差動輸出 7（正）' },
      { num: 16, name: 'VCC', side: 'L', type: 'Power', desc: '電源' },
      { num: 32, name: 'VCC', side: 'R', type: 'Power', desc: '電源' },
      { num: 31, name: 'Q0', side: 'R', type: 'Digital Out', desc: '差動輸出 0（正）' },
      { num: 30, name: 'nQ0', side: 'R', type: 'Digital Out', desc: '差動輸出 0（互補）' },
      { num: 29, name: 'Q1', side: 'R', type: 'Digital Out', desc: '差動輸出 1（正）' },
      { num: 28, name: 'nQ1', side: 'R', type: 'Digital Out', desc: '差動輸出 1（互補）' },
      { num: 27, name: 'Q2', side: 'R', type: 'Digital Out', desc: '差動輸出 2（正）' },
      { num: 26, name: 'nQ2', side: 'R', type: 'Digital Out', desc: '差動輸出 2（互補）' },
      { num: 25, name: 'VCC', side: 'R', type: 'Power', desc: '電源' },
      { num: 24, name: 'Q3', side: 'R', type: 'Digital Out', desc: '差動輸出 3（正）' },
      { num: 23, name: 'nQ3', side: 'R', type: 'Digital Out', desc: '差動輸出 3（互補）' },
      { num: 22, name: 'Q4', side: 'R', type: 'Digital Out', desc: '差動輸出 4（正）' },
      { num: 21, name: 'nQ4', side: 'R', type: 'Digital Out', desc: '差動輸出 4（互補）' },
      { num: 20, name: 'Q5', side: 'R', type: 'Digital Out', desc: '差動輸出 5（正）' },
      { num: 19, name: 'nQ5', side: 'R', type: 'Digital Out', desc: '差動輸出 5（互補）' },
      { num: 18, name: 'Q6', side: 'R', type: 'Digital Out', desc: '差動輸出 6（正）' },
      { num: 17, name: 'nQ6', side: 'R', type: 'Digital Out', desc: '差動輸出 6（互補）' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: 'LVPECL 1:10 差動時脈扇出（2:1 輸入 mux）' }, { k: '輸入', v: '2 組差動 CLK0/CLK1（CLK_SEL 選）' },
      { k: '輸出', v: '10 對差動 LVECL/LVPECL（Qn/nQn，低歪斜）' }, { k: '參考', v: 'VBB（單端輸入用）' },
      { k: '耐輻射', v: 'SEP（航太級）' }, { k: '電源', v: 'VCC ×5 + VEE' }, { k: '封裝', v: 'QFN-32（DAP 浮接）' }
    ],
    secondSource: ['封裝 + pinout 相容（QFN-32、pin-to-pin）', '扇出/輸入相容（1:10 差動 + 2:1 mux）', '輸出型態相容（LVPECL 差動 + 互補）', '歪斜/抖動同等或更佳', '耐輻射等級涵蓋（SEP）', '電源/VEE 相容', '工作溫度涵蓋'],
    dropIn: []
  },
  {
    part: 'TAS2320', mfr: 'Texas Instruments', category: 'audio',
    subcategory: 'Class-D 智慧喇叭放大器 (數位音訊 I2S/TDM)', package: 'QFN-26',
    whatIs: 'Class-D 智慧喇叭功率放大器：接收數位音訊(I2S/TDM)，用高效 Class-D 功率級驅動喇叭(OUT_P/OUT_N)。含 I2C 控制、多組可設定 SEL 腳(位址/介面)、內部穩壓。適合可攜/車載喇叭。',
    func: '數位音訊經 FSYNC/SBCLK/SDIN 進、SDOUT 回傳(I/V 感測資料)；Class-D 橋接輸出 OUT_P/OUT_N 驅動喇叭；I2C(SEL 腳複用 SDA/SCL/位址)控制；SDZ 關斷、IRQZ 中斷(開汲極)；PVDD/VBAT 功率供電、IOVDD 數位、DREG/GREG 內部穩壓輸出。',
    usedIn: '手機/平板/筆電喇叭、可攜藍牙音響、車載喇叭、智慧音箱。',
    desc: 'Class-D 智慧喇叭放大器，I2S/TDM 數位音訊、I2C 控制、I/V 感測、內部穩壓（QFN-26）。',
    datasheet: 'IC-spec/tas2320.pdf',
    pins: [
      { num: 1, name: 'SEL5_CLH', side: 'L', type: 'Digital I/O', desc: '多功能設定腳 5' },
      { num: 2, name: 'SEL4_ADR', side: 'L', type: 'Digital I/O', desc: '多功能設定腳 4 / I2C 位址' },
      { num: 3, name: 'SEL3_SDA', side: 'L', type: 'Digital I/O', desc: '多功能設定腳 3 / I2C 資料 SDA' },
      { num: 4, name: 'SEL2_SCL', side: 'L', type: 'Digital I/O', desc: '多功能設定腳 2 / I2C 時脈 SCL' },
      { num: 5, name: 'IOVDD', side: 'L', type: 'Power', desc: '數位 I/O 電源（1.8/3.3V）' },
      { num: 6, name: 'IRQZ', side: 'L', type: 'Digital Out', desc: '中斷（開汲極 active-low，需上拉）' },
      { num: 7, name: 'SDZ', side: 'L', type: 'Digital In', desc: '關斷（active-low）' },
      { num: 8, name: 'FSYNC', side: 'L', type: 'Digital In', desc: 'I2S 字時脈 / TDM 訊框同步' },
      { num: 9, name: 'SBCLK', side: 'L', type: 'Digital In', desc: 'I2S/TDM 位元時脈' },
      { num: 10, name: 'SDIN', side: 'L', type: 'Digital In', desc: '數位音訊資料輸入' },
      { num: 11, name: 'SDOUT', side: 'L', type: 'Digital Out', desc: '數位資料輸出（I/V 感測回傳）' },
      { num: 12, name: 'GND', side: 'L', type: 'Ground', desc: '接地' },
      { num: 13, name: 'NC', side: 'L', type: 'No Connect', desc: '未內接（浮接）' },
      { num: 26, name: 'DREG', side: 'R', type: 'Power', desc: '數位核心穩壓輸出（旁路電容，勿外接負載）' },
      { num: 25, name: 'GND', side: 'R', type: 'Ground', desc: '接地' },
      { num: 24, name: 'VDD', side: 'R', type: 'Power', desc: '電源' },
      { num: 23, name: 'GND', side: 'R', type: 'Ground', desc: '接地' },
      { num: 22, name: 'GND', side: 'R', type: 'Ground', desc: '接地' },
      { num: 21, name: 'PGND', side: 'R', type: 'Ground', desc: 'Class-D 功率級接地' },
      { num: 20, name: 'OUT_P', side: 'R', type: 'Analog Out', desc: 'Class-D 正輸出' },
      { num: 19, name: 'OUT_N', side: 'R', type: 'Analog Out', desc: 'Class-D 負輸出' },
      { num: 18, name: 'PVDD', side: 'R', type: 'Power', desc: 'Class-D 功率級供電' },
      { num: 17, name: 'GREG', side: 'R', type: 'Power', desc: '高側閘 CP 穩壓輸出（勿外接負載）' },
      { num: 16, name: 'SEL1_I2C', side: 'R', type: 'Digital I/O', desc: '多功能設定腳 1 / I2C 介面選擇' },
      { num: 15, name: 'VBAT', side: 'R', type: 'Power', desc: '電池供電' },
      { num: 14, name: 'PGND', side: 'R', type: 'Ground', desc: 'Class-D 功率級接地' }
    ],
    thermalPad: null,
    specs: [
      { k: '功能', v: 'Class-D 智慧喇叭放大器（含 I/V 感測）' }, { k: '數位音訊', v: 'I2S / TDM（FSYNC/SBCLK/SDIN/SDOUT）' },
      { k: '控制', v: 'I2C（SEL 腳複用 SDA/SCL/位址）' }, { k: '輸出', v: 'Class-D 橋接 OUT_P/OUT_N' },
      { k: '電源', v: 'PVDD/VBAT 功率 + IOVDD 數位 + 內部 DREG/GREG' }, { k: '保護/中斷', v: 'SDZ 關斷、IRQZ 中斷(開汲極)' },
      { k: '封裝', v: 'QFN-26' }
    ],
    secondSource: ['封裝 + pinout 相容（QFN-26、pin-to-pin）', '功能相同（Class-D 智慧喇叭放大）', '數位音訊介面相容（I2S/TDM）', 'I2C 控制/位址相容', '輸出功率/效率同等或更佳', 'I/V 感測相容', '電源軌相容（PVDD/VBAT/IOVDD）', '工作溫度涵蓋'],
    dropIn: [{ part: 'TAS2120', note: '同系列智慧喇叭放大；確認封裝/腳位與功能差異' }]
  },
  {
    "part": "KSZ9031RNX",
    "mfr": "Microchip Technology",
    "category": "interface",
    "subcategory": "Ethernet PHY",
    "package": "48-QFN 7×7mm",
    "whatIs": "Gigabit 乙太網實體層收發器（PHY）：把 MAC 的數位資料轉成雙絞線上的類比訊號（10/100/1000BASE-T），內建 Auto-MDIX、支援 RGMII 介面接 MAC。",
    "func": "整合類比收發前端（DSP、ADC/DAC、線路均衡）與數位 MAC 介面（RGMII），提供 10/100/1000BASE-T 全雙工/半雙工、Auto-Negotiation、Auto-MDIX、多組 LED 狀態輸出，並以 SMI(MDC/MDIO) 供 MAC 端讀寫暫存器做狀態監控與參數調校（如 RGMII 時序延遲）。上電/重置時以電阻上拉/下拉在特定腳位鎖存設定（PHY 位址、模式），簡化系統設計免用額外 EEPROM。",
    "usedIn": "工業/嵌入式 Gigabit 乙太網路埠、SoC 板外接 PHY（RGMII 介面的 i.MX6/8、STM32MP1 等）、開源公版 OpenRex（i.MX6 SOM）即採用本顆做板載 GbE。",
    "desc": "48-QFN 封裝的 Gigabit 乙太網 PHY，RGMII 介面對 MAC，支援 10/100/1000BASE-T、Auto-MDIX、可程式 LED，PHY 位址與工作模式由上電 strap 腳決定。",
    "datasheet": "Microchip DS00002117",
    "pins": [
      {
        "num": "1",
        "name": "AVDDH",
        "side": "L",
        "type": "power",
        "desc": "類比電源，3.3V 或 2.5V（2.5V 僅商規溫度）"
      },
      {
        "num": "2",
        "name": "TXRXP_A",
        "side": "L",
        "type": "io",
        "desc": "MDI 通道 0 差動對正端；1000BASE-T 對應 BI_DA+/BI_DB+，10/100 模式為 TX+/RX+（依 MDI/MDI-X）"
      },
      {
        "num": "3",
        "name": "TXRXM_A",
        "side": "L",
        "type": "io",
        "desc": "MDI 通道 0 差動對負端；1000BASE-T 對應 BI_DA-/BI_DB-，10/100 模式為 TX-/RX-（依 MDI/MDI-X）"
      },
      {
        "num": "4",
        "name": "AVDDL",
        "side": "L",
        "type": "power",
        "desc": "類比電源 1.2V"
      },
      {
        "num": "5",
        "name": "TXRXP_B",
        "side": "L",
        "type": "io",
        "desc": "MDI 通道 1 差動對正端；1000BASE-T 對應 BI_DB+/BI_DA+，10/100 模式為 RX+/TX+（依 MDI/MDI-X）"
      },
      {
        "num": "6",
        "name": "TXRXM_B",
        "side": "L",
        "type": "io",
        "desc": "MDI 通道 1 差動對負端；1000BASE-T 對應 BI_DB-/BI_DA-，10/100 模式為 RX-/TX-（依 MDI/MDI-X）"
      },
      {
        "num": "7",
        "name": "TXRXP_C",
        "side": "L",
        "type": "io",
        "desc": "MDI 通道 2 差動對正端；僅 1000BASE-T 使用（對應 BI_DC+/BI_DD+），10/100 模式不使用"
      },
      {
        "num": "8",
        "name": "TXRXM_C",
        "side": "L",
        "type": "io",
        "desc": "MDI 通道 2 差動對負端；僅 1000BASE-T 使用（對應 BI_DC-/BI_DD-），10/100 模式不使用"
      },
      {
        "num": "9",
        "name": "AVDDL",
        "side": "L",
        "type": "power",
        "desc": "類比電源 1.2V"
      },
      {
        "num": "10",
        "name": "TXRXP_D",
        "side": "L",
        "type": "io",
        "desc": "MDI 通道 3 差動對正端；僅 1000BASE-T 使用（對應 BI_DD+/BI_DC+），10/100 模式不使用"
      },
      {
        "num": "11",
        "name": "TXRXM_D",
        "side": "L",
        "type": "io",
        "desc": "MDI 通道 3 差動對負端；僅 1000BASE-T 使用（對應 BI_DD-/BI_DC-），10/100 模式不使用"
      },
      {
        "num": "12",
        "name": "AVDDH",
        "side": "L",
        "type": "power",
        "desc": "類比電源，3.3V 或 2.5V（2.5V 僅商規溫度）"
      },
      {
        "num": "13",
        "name": "NC",
        "side": "B",
        "type": "no connect",
        "desc": "未接合腳位；可接數位地以相容 KSZ9021RN 腳位配置"
      },
      {
        "num": "14",
        "name": "DVDDL",
        "side": "B",
        "type": "power",
        "desc": "數位電源 1.2V"
      },
      {
        "num": "15",
        "name": "LED2/PHYAD1",
        "side": "B",
        "type": "io",
        "desc": "可程式 LED2 輸出（依 LED_MODE 設定顯示 link/速度/活動）；上電 strap：鎖存為 PHYAD[1]，上拉=1／下拉=0"
      },
      {
        "num": "16",
        "name": "DVDDH",
        "side": "B",
        "type": "power",
        "desc": "數位 I/O 電源，3.3V/2.5V/1.8V"
      },
      {
        "num": "17",
        "name": "LED1/PHYAD0/PME_N1",
        "side": "B",
        "type": "io",
        "desc": "可程式 LED1 輸出，或 PME_N 喚醒事件輸出（需外接 1.0~4.7kΩ 上拉至 DVDDH）；上電 strap：鎖存為 PHYAD[0]，上拉=1／下拉=0"
      },
      {
        "num": "18",
        "name": "DVDDL",
        "side": "B",
        "type": "power",
        "desc": "數位電源 1.2V"
      },
      {
        "num": "19",
        "name": "TXD0",
        "side": "B",
        "type": "input",
        "desc": "RGMII 模式：傳送資料位元 0（TD0）輸入"
      },
      {
        "num": "20",
        "name": "TXD1",
        "side": "B",
        "type": "input",
        "desc": "RGMII 模式：傳送資料位元 1（TD1）輸入"
      },
      {
        "num": "21",
        "name": "TXD2",
        "side": "B",
        "type": "input",
        "desc": "RGMII 模式：傳送資料位元 2（TD2）輸入"
      },
      {
        "num": "22",
        "name": "TXD3",
        "side": "B",
        "type": "input",
        "desc": "RGMII 模式：傳送資料位元 3（TD3）輸入"
      },
      {
        "num": "23",
        "name": "DVDDL",
        "side": "B",
        "type": "power",
        "desc": "數位電源 1.2V"
      },
      {
        "num": "24",
        "name": "GTX_CLK",
        "side": "B",
        "type": "clock",
        "desc": "RGMII 模式：傳送參考時脈（TXC）輸入"
      },
      {
        "num": "25",
        "name": "TX_EN",
        "side": "R",
        "type": "input",
        "desc": "RGMII 模式：傳送控制（TX_CTL）輸入"
      },
      {
        "num": "26",
        "name": "DVDDL",
        "side": "R",
        "type": "power",
        "desc": "數位電源 1.2V"
      },
      {
        "num": "27",
        "name": "RXD3/MODE3",
        "side": "R",
        "type": "io",
        "desc": "RGMII 模式：接收資料位元 3（RD3）輸出；上電 strap：鎖存為 MODE[3]，上拉=1／下拉=0"
      },
      {
        "num": "28",
        "name": "RXD2/MODE2",
        "side": "R",
        "type": "io",
        "desc": "RGMII 模式：接收資料位元 2（RD2）輸出；上電 strap：鎖存為 MODE[2]，上拉=1／下拉=0"
      },
      {
        "num": "29",
        "name": "VSS",
        "side": "R",
        "type": "ground",
        "desc": "數位地"
      },
      {
        "num": "30",
        "name": "DVDDL",
        "side": "R",
        "type": "power",
        "desc": "數位電源 1.2V"
      },
      {
        "num": "31",
        "name": "RXD1/MODE1",
        "side": "R",
        "type": "io",
        "desc": "RGMII 模式：接收資料位元 1（RD1）輸出；上電 strap：鎖存為 MODE[1]，上拉=1／下拉=0"
      },
      {
        "num": "32",
        "name": "RXD0/MODE0",
        "side": "R",
        "type": "io",
        "desc": "RGMII 模式：接收資料位元 0（RD0）輸出；上電 strap：鎖存為 MODE[0]，上拉=1／下拉=0"
      },
      {
        "num": "33",
        "name": "RX_DV/CLK125_EN",
        "side": "R",
        "type": "io",
        "desc": "RGMII 模式：接收控制（RX_CTL）輸出；上電 strap：鎖存為 CLK125_NDO 輸出致能，上拉=1 致能 125MHz 輸出／下拉=0 停用"
      },
      {
        "num": "34",
        "name": "DVDDH",
        "side": "R",
        "type": "power",
        "desc": "數位 I/O 電源，3.3V/2.5V/1.8V"
      },
      {
        "num": "35",
        "name": "RX_CLK/PHYAD2",
        "side": "R",
        "type": "io",
        "desc": "RGMII 模式：接收參考時脈（RXC）輸出；上電 strap：鎖存為 PHYAD[2]，上拉=1／下拉=0"
      },
      {
        "num": "36",
        "name": "MDC",
        "side": "R",
        "type": "input",
        "desc": "管理介面（SMI）時脈輸入，內建上拉；供 MDIO（腳37）同步參考"
      },
      {
        "num": "37",
        "name": "MDIO",
        "side": "T",
        "type": "io",
        "desc": "管理介面（SMI）資料輸入/輸出，內建上拉，需與 MDC 同步；建議外接 1.0~4.7kΩ 上拉至 DVDDH"
      },
      {
        "num": "38",
        "name": "INT_N/PME_N2",
        "side": "T",
        "type": "output",
        "desc": "可程式中斷輸出（暫存器 1Bh/1Fh 設定觸發條件與極性），或 PME_N 喚醒事件輸出（選項2）；需外接 1.0~4.7kΩ 上拉至 DVDDH"
      },
      {
        "num": "39",
        "name": "DVDDL",
        "side": "T",
        "type": "power",
        "desc": "數位電源 1.2V"
      },
      {
        "num": "40",
        "name": "DVDDH",
        "side": "T",
        "type": "power",
        "desc": "數位 I/O 電源，3.3V/2.5V/1.8V"
      },
      {
        "num": "41",
        "name": "CLK125_NDO/LED_MODE",
        "side": "T",
        "type": "io",
        "desc": "125MHz 參考時脈輸出，供 MAC 使用；上電 strap：鎖存為 LED_MODE，上拉=1 單 LED 模式／下拉=0 雙 LED 三色模式"
      },
      {
        "num": "42",
        "name": "RESET_N",
        "side": "T",
        "type": "input",
        "desc": "晶片重置（低態動作），內建上拉；所有 strap 腳在 RESET_N 上升緣（解除重置）時鎖存"
      },
      {
        "num": "43",
        "name": "LDO_O",
        "side": "T",
        "type": "output",
        "desc": "內建 1.2V LDO 控制器輸出，驅動外部 P 通道 MOSFET 產生核心 1.2V；若系統自供 1.2V 且不用此腳，可懸空；不可外部驅動"
      },
      {
        "num": "44",
        "name": "AVDDL_PLL",
        "side": "T",
        "type": "power",
        "desc": "PLL 用類比電源 1.2V"
      },
      {
        "num": "45",
        "name": "XO",
        "side": "T",
        "type": "output",
        "desc": "25MHz 石英振盪回授輸出；若使用外部振盪器/時脈源則此腳不接"
      },
      {
        "num": "46",
        "name": "XI",
        "side": "T",
        "type": "input",
        "desc": "石英/振盪器/外部時脈輸入，25MHz ±50ppm"
      },
      {
        "num": "47",
        "name": "NC",
        "side": "T",
        "type": "no connect",
        "desc": "未接合腳位；可接 AVDDH 電源以相容 KSZ9021RN 腳位配置"
      },
      {
        "num": "48",
        "name": "ISET",
        "side": "T",
        "type": "io",
        "desc": "傳送輸出電平設定；接 12.1kΩ 1% 電阻到地"
      }
    ],
    "thermalPad": "PADDLE GROUND（晶片底部外露焊墊），須接地（P_GND to ground）",
    "specs": [
      {
        "k": "介面",
        "v": "RGMII（對 MAC）"
      },
      {
        "k": "速度",
        "v": "10/100/1000BASE-T，Auto-Negotiation、Auto-MDIX"
      },
      {
        "k": "封裝",
        "v": "48-QFN 7×7mm"
      },
      {
        "k": "類比電源 AVDDH",
        "v": "3.3V 或 2.5V（2.5V 僅商規溫度）"
      },
      {
        "k": "類比電源 AVDDL",
        "v": "1.2V"
      },
      {
        "k": "數位 I/O 電源 DVDDH",
        "v": "3.3V / 2.5V / 1.8V 可選"
      },
      {
        "k": "數位核心電源 DVDDL",
        "v": "1.2V"
      },
      {
        "k": "管理介面",
        "v": "SMI（MDC/MDIO）"
      }
    ],
    "secondSource": [],
    "dropIn": []
  },
  {
    "part": "LAN8710A",
    "mfr": "Microchip Technology",
    "category": "interface",
    "subcategory": "Ethernet PHY",
    "package": "32-QFN/SQFN",
    "whatIs": "10/100 乙太網實體層收發器（PHY）：把 MAC 的數位資料轉成雙絞線上的類比訊號（10BASE-T/100BASE-TX），支援 MII 或 RMII 介面接 MAC，內建 HP Auto-MDIX。",
    "func": "整合類比收發前端（DSP、時脈回復、均衡、4B/5B 編解碼、MLT-3/NRZI 轉換）與數位 MAC 介面（MII 或 RMII，由 RMIISEL strap 選擇），提供 Auto-Negotiation、HP Auto-MDIX、可程式 LED、中斷輸出，並以 SMI(MDC/MDIO) 供 MAC 端讀寫暫存器。上電/重置時以電阻上拉/下拉在特定腳位鎖存設定（PHY 位址、工作模式、MII/RMII 選擇、內建穩壓器開關）。",
    "usedIn": "小型嵌入式 10/100 乙太網路埠、MCU/SoC 板外接 PHY（RMII 介面常見於 STM32、ESP32 等），開源公版 Olimex ESP32-POE2 即採用本顆做 RMII 供電乙太網路埠。",
    "desc": "32-QFN 封裝的 10/100 乙太網 PHY，MII/RMII 介面對 MAC（由 strap 選擇），支援 Auto-Negotiation、HP Auto-MDIX、可程式 LED，PHY 位址與模式由上電 strap 腳決定。",
    "datasheet": "Microchip DS00002164",
    "pins": [
      {
        "num": "1",
        "name": "VDD2A",
        "side": "L",
        "type": "power",
        "desc": "+3.3V 通道2類比埠電源，亦供內建穩壓器使用"
      },
      {
        "num": "2",
        "name": "LED2/nINTSEL",
        "side": "L",
        "type": "io",
        "desc": "LED2：速度指示（100Mbps 時致能）；上電 strap：nINTSEL 決定腳18功能，浮接/上拉至 VDD2A=nINT（預設）／下拉至 VSS=TXER/TXD4"
      },
      {
        "num": "3",
        "name": "LED1/REGOFF",
        "side": "L",
        "type": "io",
        "desc": "LED1：link/活動指示；上電 strap：REGOFF 決定內建 1.2V 穩壓器，上拉至 VDD2A=停用穩壓器（需外部供 1.2V 給 VDDCR）／浮接或下拉=啟用穩壓器（預設）"
      },
      {
        "num": "4",
        "name": "XTAL2",
        "side": "L",
        "type": "clock",
        "desc": "外部石英振盪輸出；若用單端時脈振盪器輸入 CLKIN，此腳需懸空"
      },
      {
        "num": "5",
        "name": "XTAL1/CLKIN",
        "side": "L",
        "type": "clock",
        "desc": "外部石英輸入，或單端時脈振盪器輸入"
      },
      {
        "num": "6",
        "name": "VDDCR",
        "side": "L",
        "type": "power",
        "desc": "+1.2V 數位核心電源；由內建穩壓器供應，除非 REGOFF strap 設為停用；需並接 1uF 與 470pF 去耦電容到地"
      },
      {
        "num": "7",
        "name": "RXCLK/PHYAD1",
        "side": "L",
        "type": "io",
        "desc": "MII 模式：接收時脈輸出（100BASE-TX 25MHz／10BASE-T 2.5MHz）；上電 strap：鎖存為 PHYAD[1]，內建下拉"
      },
      {
        "num": "8",
        "name": "RXD3/PHYAD2",
        "side": "L",
        "type": "io",
        "desc": "MII 模式：接收資料位元 3輸出（RMII 模式不使用）；上電 strap：鎖存為 PHYAD[2]，內建下拉"
      },
      {
        "num": "9",
        "name": "RXD2/RMIISEL",
        "side": "B",
        "type": "io",
        "desc": "MII 模式：接收資料位元 2輸出（RMII 模式不使用）；上電 strap：RMIISEL 選擇 MII/RMII 模式，下拉至 VSS=MII 模式／上拉至 VDDIO=RMII 模式，內建下拉"
      },
      {
        "num": "10",
        "name": "RXD1/MODE1",
        "side": "B",
        "type": "io",
        "desc": "接收資料位元 1輸出（MII 4 bit／RMII 2 bit 皆用）；上電 strap：與 MODE0、MODE2 共同鎖存預設 PHY 工作模式，內建上拉"
      },
      {
        "num": "11",
        "name": "RXD0/MODE0",
        "side": "B",
        "type": "io",
        "desc": "接收資料位元 0輸出（MII 4 bit／RMII 2 bit 皆用）；上電 strap：與 MODE1、MODE2 共同鎖存預設 PHY 工作模式，內建上拉"
      },
      {
        "num": "12",
        "name": "VDDIO",
        "side": "B",
        "type": "power",
        "desc": "+1.6V ~ +3.6V 可變 I/O 電源"
      },
      {
        "num": "13",
        "name": "RXER/RXD4/PHYAD0",
        "side": "B",
        "type": "io",
        "desc": "接收錯誤指示（RMII 模式可選）；Symbol Interface 模式下為 RXD4；上電 strap：鎖存為 PHYAD[0]，內建下拉"
      },
      {
        "num": "14",
        "name": "CRS",
        "side": "B",
        "type": "output",
        "desc": "MII 模式：載波偵測輸出，內建下拉"
      },
      {
        "num": "15",
        "name": "COL/CRS_DV/MODE2",
        "side": "B",
        "type": "io",
        "desc": "MII 模式：碰撞偵測輸出（COL）；RMII 模式：載波偵測/接收資料有效（CRS_DV）；上電 strap：鎖存為 MODE[2]，內建上拉"
      },
      {
        "num": "16",
        "name": "MDIO",
        "side": "B",
        "type": "io",
        "desc": "管理介面（SMI）資料輸入/輸出"
      },
      {
        "num": "17",
        "name": "MDC",
        "side": "R",
        "type": "input",
        "desc": "管理介面（SMI）時脈輸入"
      },
      {
        "num": "18",
        "name": "nINT/TXER/TXD4",
        "side": "R",
        "type": "output",
        "desc": "中斷輸出（低態動作，需外部上拉至 VDDIO），或 MII 模式下依 nINTSEL strap 切換為 TXER/TXD4（Symbol Interface 模式）"
      },
      {
        "num": "19",
        "name": "nRST",
        "side": "R",
        "type": "input",
        "desc": "系統重置，低態動作，內建上拉"
      },
      {
        "num": "20",
        "name": "TXCLK",
        "side": "R",
        "type": "clock",
        "desc": "MII 模式：傳送時脈輸出，供 MAC 鎖存傳送資料用（100BASE-TX 25MHz／10BASE-T 2.5MHz）；RMII 模式不使用"
      },
      {
        "num": "21",
        "name": "TXEN",
        "side": "R",
        "type": "input",
        "desc": "傳送致能，指示 TXD 匯流排上有效資料；內建下拉；RMII 模式僅 TXD[1:0] 有效"
      },
      {
        "num": "22",
        "name": "TXD0",
        "side": "R",
        "type": "input",
        "desc": "MAC 傳送資料位元 0，MII/RMII 皆用"
      },
      {
        "num": "23",
        "name": "TXD1",
        "side": "R",
        "type": "input",
        "desc": "MAC 傳送資料位元 1，MII/RMII 皆用"
      },
      {
        "num": "24",
        "name": "TXD2",
        "side": "R",
        "type": "input",
        "desc": "MII 模式：MAC 傳送資料位元 2；RMII 模式須接地"
      },
      {
        "num": "25",
        "name": "TXD3",
        "side": "T",
        "type": "input",
        "desc": "MII 模式：MAC 傳送資料位元 3；RMII 模式須接地"
      },
      {
        "num": "26",
        "name": "RXDV",
        "side": "T",
        "type": "output",
        "desc": "接收資料有效，指示 RXD 上有可用的解碼資料"
      },
      {
        "num": "27",
        "name": "VDD1A",
        "side": "T",
        "type": "power",
        "desc": "+3.3V 通道1類比埠電源"
      },
      {
        "num": "28",
        "name": "TXN",
        "side": "T",
        "type": "analog",
        "desc": "乙太網傳送/接收通道1負端（差動）"
      },
      {
        "num": "29",
        "name": "TXP",
        "side": "T",
        "type": "analog",
        "desc": "乙太網傳送/接收通道1正端（差動）"
      },
      {
        "num": "30",
        "name": "RXN",
        "side": "T",
        "type": "analog",
        "desc": "乙太網傳送/接收通道2負端（差動）"
      },
      {
        "num": "31",
        "name": "RXP",
        "side": "T",
        "type": "analog",
        "desc": "乙太網傳送/接收通道2正端（差動）"
      },
      {
        "num": "32",
        "name": "RBIAS",
        "side": "T",
        "type": "analog",
        "desc": "外部 1% 偏壓電阻輸入；接 12.1kΩ 1% 電阻到地，標稱電壓 1.2V"
      }
    ],
    "thermalPad": "Exposed pad（VSS，晶片底部），須以過孔陣列接地平面",
    "specs": [
      {
        "k": "介面",
        "v": "MII 或 RMII（由 RMIISEL strap 選擇）"
      },
      {
        "k": "速度",
        "v": "10BASE-T / 100BASE-TX，Auto-Negotiation、HP Auto-MDIX"
      },
      {
        "k": "封裝",
        "v": "32-QFN/SQFN"
      },
      {
        "k": "I/O 電源 VDDIO",
        "v": "+1.6V ~ +3.6V 可變"
      },
      {
        "k": "數位核心電源 VDDCR",
        "v": "+1.2V（內建穩壓器供應，或 REGOFF strap 切外部供電）"
      },
      {
        "k": "類比埠電源 VDD1A/VDD2A",
        "v": "+3.3V"
      },
      {
        "k": "管理介面",
        "v": "SMI（MDC/MDIO）"
      }
    ],
    "secondSource": [],
    "dropIn": []
  },
  {
    "part": "W25Q128JV",
    "mfr": "Winbond",
    "category": "memory",
    "subcategory": "序列 Flash 記憶體（SPI / Dual SPI / Quad SPI NOR Flash）",
    "package": "SOIC-8 208-mil（Package Code S）",
    "whatIs": "序列 NOR Flash 記憶體：以 SPI、Dual SPI 或 Quad SPI 介面提供 128M-bit（16MB）非揮發性儲存空間，供 MCU/SoC 存放開機碼、韌體或資料，斷電後內容不遺失。",
    "func": "內部為 NOR Flash 記憶體陣列，經 {CS}、CLK、DI/DO（Quad 模式下為 IO0~IO3）與主控端溝通；支援標準/雙/四線 SPI 讀寫指令、256B 分頁寫入、扇區／區塊／全片抹除。以 Status Register 的 Block Protect 位元搭配 {WP} 腳提供硬體寫入保護；Status Register-2 的 QE bit 致能 Quad SPI 後，{WP} 腳轉為 IO2、{HOLD}/{RESET} 腳轉為 IO3。",
    "usedIn": "Raspberry Pi Pico、多款 ESP32 開發板等開源公版設計常用的 SPI flash（存放開機映像／韌體），也廣泛用於路由器、工控板、攝影機等需外接大容量非揮發儲存的嵌入式系統。",
    "desc": "128M-bit（16MB）3V 系列 SPI NOR Flash，支援標準/雙/四線 SPI，SOIC-8 208-mil 封裝，工業／工業 Plus 等級。",
    "datasheet": "Winbond W25Q128JV, Revision F（2018-03-27）",
    "pins": [
      {
        "num": "1",
        "name": "{CS}",
        "side": "L",
        "type": "Input",
        "desc": "SPI 晶片選擇輸入（active-low）；選中晶片並啟動 SPI 通訊，未選中時 DO/IO 腳呈高阻抗"
      },
      {
        "num": "2",
        "name": "DO (IO1)",
        "side": "L",
        "type": "I/O",
        "desc": "標準/雙 SPI 模式下為資料輸出（DO）；Quad SPI 模式下為資料輸出入 1（IO1）"
      },
      {
        "num": "3",
        "name": "{WP} (IO2)",
        "side": "L",
        "type": "I/O",
        "desc": "標準/雙 SPI 模式下為寫入保護輸入（active-low）；Quad SPI 模式下為資料輸出入 2（IO2）"
      },
      {
        "num": "4",
        "name": "GND",
        "side": "L",
        "type": "Ground",
        "desc": "電源地"
      },
      {
        "num": "8",
        "name": "VCC",
        "side": "R",
        "type": "Power",
        "desc": "電源供應（3V 系列，確切電壓範圍見 datasheet）"
      },
      {
        "num": "7",
        "name": "{HOLD}/{RESET} (IO3)",
        "side": "R",
        "type": "I/O",
        "desc": "標準/雙 SPI 模式下為保持或重置輸入（active-low）；Quad SPI 模式下為資料輸出入 3（IO3），此時 HOLD/RESET 功能不可用"
      },
      {
        "num": "6",
        "name": "CLK",
        "side": "R",
        "type": "Input",
        "desc": "SPI 序列時脈輸入"
      },
      {
        "num": "5",
        "name": "DI (IO0)",
        "side": "R",
        "type": "I/O",
        "desc": "標準/雙 SPI 模式下為資料輸入（DI）；Quad SPI 模式下為資料輸出入 0（IO0）"
      }
    ],
    "thermalPad": null,
    "specs": [
      {
        "k": "容量",
        "v": "128M-bit（16MB）"
      },
      {
        "k": "介面",
        "v": "標準 SPI／Dual SPI／Quad SPI"
      },
      {
        "k": "供電電壓",
        "v": "見 datasheet（封面標示為 3V 系列，本次擷取頁未含完整電壓範圍表）"
      },
      {
        "k": "封裝",
        "v": "SOIC-8 208-mil（Package Code S）；原廠另有 WSON、SOIC-16、TFBGA、WLCSP 等封裝選項"
      },
      {
        "k": "等級",
        "v": "Industrial ／ Industrial Plus Grade"
      },
      {
        "k": "Quad Enable",
        "v": "由 Status Register-2 的 QE bit 控制；QE=1 時 {WP} 轉為 IO2、{HOLD}/{RESET} 轉為 IO3"
      },
      {
        "k": "文件版本",
        "v": "Revision F，發布日期 2018-03-27"
      }
    ],
    "secondSource": [],
    "dropIn": []
  },
  {
    "part": "RT6150",
    "mfr": "Richtek",
    "category": "power",
    "subcategory": "DC/DC 轉換器（電流模式 Buck-Boost）",
    "package": "WDFN-10L 3×3mm（RT6150A）／WDFN-10L 2.5×2.5mm（RT6150B）",
    "whatIs": "電流模式 Buck-Boost 降升壓 DC/DC 轉換器：輸入電壓高於、低於或等於輸出電壓時皆能維持穩壓輸出，適合單顆鋰電池或多顆鹼性/鎳氫電池供電的可攜式產品。",
    "func": "內建兩顆 N-MOSFET 與兩顆 P-MOSFET 開關，固定 1MHz 切換頻率；依 VIN 與 VOUT 關係自動於 Buck、Boost、Buck-Boost 模式間平順切換。PS 腳拉低進入省電模式（PSM，靜態電流約 60µA），拉高則為固定頻率切換模式；EN 腳控制開關機，關機時 VOUT 與 VIN 斷開；FB 腳可外接電阻分壓調整輸出電壓（1.8V~5.5V），固定輸出版本 FB 須接回 VOUT。",
    "usedIn": "Raspberry Pi Pico 官方板上採用的 buck-boost 電源轉換器，將 USB 5V 或電池輸入轉為板上穩定供電；也用於單顆鋰電池可攜式裝置、手持儀器等需寬輸入範圍穩壓的場合。",
    "desc": "1MHz 電流模式 Buck-Boost 轉換器，輸入電壓 1.8~5.5V，WDFN-10L 封裝（3×3mm 或 2.5×2.5mm，依型號而異）。",
    "datasheet": "Richtek DS6150A/B-05（2015-07）",
    "pins": [
      {
        "num": "1",
        "name": "VOUT",
        "side": "L",
        "type": "Power",
        "desc": "Buck-Boost 轉換器輸出；VOUT 與 GND 間須接輸出電容"
      },
      {
        "num": "2",
        "name": "LX2",
        "side": "L",
        "type": "Power",
        "desc": "第二開關節點，接電感"
      },
      {
        "num": "3",
        "name": "GND",
        "side": "L",
        "type": "Ground",
        "desc": "功率地"
      },
      {
        "num": "4",
        "name": "LX1",
        "side": "L",
        "type": "Power",
        "desc": "第一開關節點，接電感"
      },
      {
        "num": "5",
        "name": "VIN",
        "side": "L",
        "type": "Power",
        "desc": "電源輸入；VIN 與 GND 間建議接去耦電容（原文標示容值 10，單位判讀為 µF，詳見 datasheet）"
      },
      {
        "num": "10",
        "name": "FB",
        "side": "R",
        "type": "Analog In",
        "desc": "回授輸入；可調版本外接電阻分壓設定輸出電壓（1.8V~5.5V），固定輸出版本須接回 VOUT"
      },
      {
        "num": "9",
        "name": "GND",
        "side": "R",
        "type": "Ground",
        "desc": "功率地"
      },
      {
        "num": "8",
        "name": "VINA",
        "side": "R",
        "type": "Power",
        "desc": "控制電路供電輸入"
      },
      {
        "num": "7",
        "name": "PS",
        "side": "R",
        "type": "Input",
        "desc": "PSM 模式控制輸入；拉低進入省電模式（PSM），拉高為固定切換頻率模式"
      },
      {
        "num": "6",
        "name": "EN",
        "side": "R",
        "type": "Input",
        "desc": "Buck-Boost 轉換器致能控制輸入"
      },
      {
        "num": "11",
        "name": "GND (Exposed Pad)",
        "side": "B",
        "type": "Ground",
        "desc": "外露焊墊，屬功率地，須焊接至大面積 PCB 銅箔並接地以達最大散熱",
        "ep": true
      }
    ],
    "thermalPad": "Exposed Pad（datasheet 標示腳號 11）為功率地，須焊接至大面積 PCB 並接地以利散熱",
    "specs": [
      {
        "k": "拓樸",
        "v": "Buck-Boost（同步整流，效率最高約 90%）"
      },
      {
        "k": "輸入電壓範圍",
        "v": "1.8V ~ 5.5V"
      },
      {
        "k": "輸出電壓",
        "v": "固定 3.3V（RT6150B-33）或可調 1.8V~5.5V（FB 外接分壓電阻）"
      },
      {
        "k": "切換頻率",
        "v": "固定 1MHz"
      },
      {
        "k": "最大連續輸出電流",
        "v": "見 datasheet（規格標示可達約 800mA，實際依 VIN/VOUT 條件而定）"
      },
      {
        "k": "PSM 靜態電流",
        "v": "約 60µA"
      },
      {
        "k": "關機電流",
        "v": "< 1µA"
      },
      {
        "k": "封裝",
        "v": "WDFN-10L 3×3mm（RT6150A）／WDFN-10L 2.5×2.5mm（RT6150B）"
      }
    ],
    "secondSource": [],
    "dropIn": []
  },
  {
    "part": "AXP209",
    "mfr": "X-Powers",
    "category": "power",
    "subcategory": "電源管理 IC（PMIC，鋰電池充電 + 多路 DCDC/LDO）",
    "package": "QFN-48 6×6mm",
    "whatIs": "單顆鋰電池電源系統管理 IC（PMIC）：整合 USB/AC 相容 PWM 充電器、2 路 Buck DC-DC、5 路 LDO、多通道 12-bit ADC 與 4 個可組態 GPIO，透過 TWSI（類 I2C）介面供應用處理器控制與監控整個電源系統。",
    "func": "以 Intelligent Power Select（IPS）電路在外部 AC 電源、鋰電池與系統負載間安全分配電力，無電池時仍可由外部電源獨立運作；內建 OVP/UVP、OTP（過溫）、OCP（過流）等保護電路；透過多通道 12-bit ADC 量測電池電壓/電流、外部輸入電壓/電流與晶片溫度，並內建庫侖計供燃料計（Fuel Gauge）估算剩餘電量；主控端經 TWSI 讀寫暫存器致能/停用各電源軌、設定輸出電壓並讀取量測資料。",
    "usedIn": "Olimex A20-OLinuXino-Lime、Cubieboard 等以全志（Allwinner）A10/A20 系列 SoC 為核心的開源公版單板電腦，作為配套 PMIC 供應核心、記憶體、周邊等多路電源並管理鋰電池充放電。",
    "desc": "整合鋰電池充電、2 路 Buck、5 路 LDO、多通道 12-bit ADC 與 4 個 GPIO 的單電芯電源管理 IC，48-pin QFN 封裝（6×6mm），TWSI 控制介面。",
    "datasheet": "X-Powers AXP209 Datasheet（© 2010 X-Powers Limited）",
    "pins": [
      {
        "num": "1",
        "name": "SDA",
        "side": "L",
        "type": "I/O",
        "desc": "TWSI（序列介面）資料腳，通常外接 2.2kΩ 電阻上拉至 3.3V I/O 電源"
      },
      {
        "num": "2",
        "name": "SCK",
        "side": "L",
        "type": "Input",
        "desc": "TWSI（序列介面）時脈腳，通常外接 2.2kΩ 電阻上拉至 3.3V I/O 電源"
      },
      {
        "num": "3",
        "name": "GPIO3",
        "side": "L",
        "type": "I/O",
        "desc": "通用輸出入腳 3，功能由暫存器 REG9EH[7] 設定"
      },
      {
        "num": "4",
        "name": "{OE}",
        "side": "L",
        "type": "Input",
        "desc": "電源輸出開關控制（active-low）；接 GND 為開啟（on），接 IPSOUT 為關閉（off）"
      },
      {
        "num": "5",
        "name": "GPIO2",
        "side": "L",
        "type": "I/O",
        "desc": "通用輸出入腳 2，功能由暫存器 REG92H[2:0] 設定"
      },
      {
        "num": "6",
        "name": "{VBUSEN}",
        "side": "L",
        "type": "Input",
        "desc": "VBUS 是否納入 IPSOUT 的選擇腳（active-low 命名）；接 GND 時 IPSOUT 選用 VBUS，接高電位時 IPSOUT 不選用 VBUS"
      },
      {
        "num": "7",
        "name": "VIN2",
        "side": "L",
        "type": "Power",
        "desc": "DCDC2 輸入電源"
      },
      {
        "num": "8",
        "name": "LX2",
        "side": "L",
        "type": "Power",
        "desc": "DCDC2 電感接腳（開關節點）"
      },
      {
        "num": "9",
        "name": "PGND2",
        "side": "L",
        "type": "Ground",
        "desc": "DCDC2 的 NMOS 功率地"
      },
      {
        "num": "10",
        "name": "DCDC2",
        "side": "L",
        "type": "Analog In",
        "desc": "DCDC2 回授（feedback）輸入腳"
      },
      {
        "num": "11",
        "name": "LDO4",
        "side": "L",
        "type": "Power",
        "desc": "LDO4 輸出腳"
      },
      {
        "num": "12",
        "name": "LDO2",
        "side": "L",
        "type": "Power",
        "desc": "LDO2 輸出腳"
      },
      {
        "num": "13",
        "name": "LDO24IN",
        "side": "B",
        "type": "Power",
        "desc": "LDO2 與 LDO4 的共用輸入電源"
      },
      {
        "num": "14",
        "name": "VIN3",
        "side": "B",
        "type": "Power",
        "desc": "DCDC3 輸入電源"
      },
      {
        "num": "15",
        "name": "LX3",
        "side": "B",
        "type": "Power",
        "desc": "DCDC3 電感接腳（開關節點）"
      },
      {
        "num": "16",
        "name": "PGND3",
        "side": "B",
        "type": "Ground",
        "desc": "DCDC3 的 NMOS 功率地"
      },
      {
        "num": "17",
        "name": "DCDC3",
        "side": "B",
        "type": "Analog In",
        "desc": "DCDC3 回授（feedback）輸入腳"
      },
      {
        "num": "18",
        "name": "GPIO1",
        "side": "B",
        "type": "I/O",
        "desc": "通用輸出入腳 1，功能由暫存器 REG93H[2:0] 設定；可作 ADC 輸入"
      },
      {
        "num": "19",
        "name": "GPIO0",
        "side": "B",
        "type": "I/O",
        "desc": "通用輸出入腳 0，功能由暫存器 REG90H[2:0] 設定；可作低噪聲 LDO／開關或 ADC 輸入"
      },
      {
        "num": "20",
        "name": "EXTEN",
        "side": "B",
        "type": "Output",
        "desc": "外部電源致能輸出（External Power Enable）"
      },
      {
        "num": "21",
        "name": "APS",
        "side": "B",
        "type": "Power",
        "desc": "內部電源輸入（Internal Power Input）；PWRON 腳內部 100kΩ 上拉至此腳"
      },
      {
        "num": "22",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比地"
      },
      {
        "num": "23",
        "name": "BIAS",
        "side": "B",
        "type": "Passive",
        "desc": "偏置電阻腳：外接 200kΩ 1% 精度電阻（接法詳見 datasheet）；註：datasheet 腳位表此列腳號印為 34，依表格排序（介於 22 與 24 之間）判定為第 23 腳"
      },
      {
        "num": "24",
        "name": "VREF",
        "side": "B",
        "type": "Analog Out",
        "desc": "內部參考電壓輸出"
      },
      {
        "num": "25",
        "name": "PWROK",
        "side": "R",
        "type": "Output",
        "desc": "Power Good 指示輸出：開機過程輸出低電位，所有輸出電壓達穩壓值後拉高；過載或欠壓時立即拉低，可作系統重置訊號"
      },
      {
        "num": "26",
        "name": "VINT",
        "side": "R",
        "type": "Power",
        "desc": "內部邏輯電源輸出，2.5V"
      },
      {
        "num": "27",
        "name": "LDO1SET",
        "side": "R",
        "type": "Input",
        "desc": "設定 LDO1 預設輸出電壓"
      },
      {
        "num": "28",
        "name": "LDO1",
        "side": "R",
        "type": "Power",
        "desc": "LDO1 輸出，供 Host RTC 區塊；關機時唯一不被切斷的電源軌"
      },
      {
        "num": "29",
        "name": "DC3SET",
        "side": "R",
        "type": "Input",
        "desc": "設定 DCDC3 預設輸出電壓"
      },
      {
        "num": "30",
        "name": "BACKUP",
        "side": "R",
        "type": "Power",
        "desc": "備份電池（backup battery）接腳"
      },
      {
        "num": "31",
        "name": "VBUS",
        "side": "R",
        "type": "Power",
        "desc": "USB VBUS 電源輸入"
      },
      {
        "num": "32",
        "name": "ACIN",
        "side": "R",
        "type": "Power",
        "desc": "AC 變壓器（adapter）電源輸入（與腳 33 並聯）"
      },
      {
        "num": "33",
        "name": "ACIN",
        "side": "R",
        "type": "Power",
        "desc": "AC 變壓器（adapter）電源輸入（與腳 32 並聯）"
      },
      {
        "num": "34",
        "name": "IPSOUT",
        "side": "R",
        "type": "Power",
        "desc": "IPS 電源路徑輸出，供應主系統負載（與腳 35 並聯；腳位表原文標示 Main Battery）"
      },
      {
        "num": "35",
        "name": "IPSOUT",
        "side": "R",
        "type": "Power",
        "desc": "IPS 電源路徑輸出，供應主系統負載（與腳 34 並聯；腳位表原文標示 Main Battery）"
      },
      {
        "num": "36",
        "name": "CHGLED",
        "side": "R",
        "type": "Output",
        "desc": "充電狀態指示輸出（驅動 LED）；亦可設定為過溫／過壓警示或 GPO，詳見 REG32H"
      },
      {
        "num": "37",
        "name": "TS",
        "side": "T",
        "type": "Analog In",
        "desc": "電池溫度感測器輸入，或作外部 ADC 輸入"
      },
      {
        "num": "38",
        "name": "BAT",
        "side": "T",
        "type": "Power",
        "desc": "鋰電池接腳，系統電源來源（與腳 39 並聯）"
      },
      {
        "num": "39",
        "name": "BAT",
        "side": "T",
        "type": "Power",
        "desc": "鋰電池接腳，系統電源來源（與腳 38 並聯）"
      },
      {
        "num": "40",
        "name": "LDO3IN",
        "side": "T",
        "type": "Power",
        "desc": "LDO3 輸入電源"
      },
      {
        "num": "41",
        "name": "LDO3",
        "side": "T",
        "type": "Power",
        "desc": "LDO3 輸出腳"
      },
      {
        "num": "42",
        "name": "BATSENSE",
        "side": "T",
        "type": "Analog In",
        "desc": "電池電流感測端 1（Current sense port1）"
      },
      {
        "num": "43",
        "name": "CHSENSE",
        "side": "T",
        "type": "Analog Out",
        "desc": "電池電流感測端 2（Current sense port2）"
      },
      {
        "num": "44",
        "name": "VIN1",
        "side": "T",
        "type": "Power",
        "desc": "DCDC1 輸入電源（照 datasheet 腳位表原文；功能總覽標示為 2 路 Buck，詳見 datasheet）"
      },
      {
        "num": "45",
        "name": "LX1",
        "side": "T",
        "type": "Power",
        "desc": "DCDC1 電感接腳（開關節點）"
      },
      {
        "num": "46",
        "name": "PGND1",
        "side": "T",
        "type": "Ground",
        "desc": "DCDC1 的 NMOS 功率地"
      },
      {
        "num": "47",
        "name": "PWRON",
        "side": "T",
        "type": "Input",
        "desc": "開／關機按鍵（PEK）輸入，內部 100kΩ 上拉至 APS；可自動辨識長按與短按並對應動作"
      },
      {
        "num": "48",
        "name": "IRQ/WAKEUP",
        "side": "T",
        "type": "I/O",
        "desc": "中斷（IRQ）輸出或喚醒（wakeup）輸入"
      },
      {
        "num": "49",
        "name": "EP",
        "side": "B",
        "type": "Ground",
        "desc": "外露焊墊（Exposed Pad），須連接系統地",
        "ep": true
      }
    ],
    "thermalPad": "Exposed Pad（datasheet 腳位表標示為第 49 腳）須連接系統地",
    "specs": [
      {
        "k": "電源軌",
        "v": "2 路 Buck DC-DC + 5 路 LDO（各路電壓/電流上限見 datasheet 完整表）"
      },
      {
        "k": "ADC",
        "v": "多通道 12-bit ADC，量測電池電壓/電流、ACIN、VBUS、晶片溫度、GPIO 等"
      },
      {
        "k": "控制介面",
        "v": "TWSI（Two Wire Serial Interface，類 I2C）"
      },
      {
        "k": "GPIO",
        "v": "4 個可組態 GPIO"
      },
      {
        "k": "保護",
        "v": "OVP/UVP、OTP（過溫）、OCP（過流）"
      },
      {
        "k": "封裝",
        "v": "48-pin QFN，6mm × 6mm（含接地 Exposed Pad）"
      }
    ],
    "secondSource": [],
    "dropIn": []
  }
];
