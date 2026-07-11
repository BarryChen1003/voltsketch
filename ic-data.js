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
    "part": "TPS61290",
    "mfr": "Texas Instruments",
    "category": "power",
    "subcategory": "同步升壓轉換器 (5.5V, 11A, I2C, 含旁路)",
    "package": "16-DSBGA (YBG) 4×4",
    "whatIs": "同步升壓(boost)轉換器：把較低的輸入電壓升到較高的輸出電壓，內建高/低側功率 MOSFET（同步整流、效率高），可由 I2C 設定，並有旁路(bypass)模式。大電流（開關電流 11A）。",
    "func": "電池/低壓源 → 升壓供電；同步整流省損耗；I2C 動態設定輸出電壓與模式；不需升壓時切 bypass 直通省電。BGA 16 球，VIN/VOUT/SW/GND 各 3 球分擔大電流。",
    "usedIn": "電池供電裝置升壓（手機/穿戴/IoT）、RF 功率放大器供電、需 I2C 動態調壓的系統。",
    "desc": "5.5V、11A 同步升壓轉換器，I2C 控制、含旁路模式（BGA-16）。",
    "datasheet": "IC-spec/tps61290.pdf",
    "pins": [
      {
        "num": "A1",
        "name": "EN",
        "side": "L",
        "type": "Digital In",
        "desc": "致能；高=啟用、低=關斷"
      },
      {
        "num": "B1",
        "name": "SCL",
        "side": "L",
        "type": "Digital In",
        "desc": "I2C 時脈（勿浮接，需終端）"
      },
      {
        "num": "C1",
        "name": "SDA",
        "side": "L",
        "type": "Digital I/O",
        "desc": "I2C 位址/資料（勿浮接）"
      },
      {
        "num": "D1",
        "name": "GPIO",
        "side": "L",
        "type": "Digital I/O",
        "desc": "ADDR（I2C 位址選擇）或 VSEL（升壓/旁路門檻選擇）"
      },
      {
        "num": "A2",
        "name": "VIN",
        "side": "T",
        "type": "Power",
        "desc": "電源輸入"
      },
      {
        "num": "A3",
        "name": "VIN",
        "side": "T",
        "type": "Power",
        "desc": "電源輸入"
      },
      {
        "num": "A4",
        "name": "VIN",
        "side": "T",
        "type": "Power",
        "desc": "電源輸入"
      },
      {
        "num": "B2",
        "name": "VOUT",
        "side": "R",
        "type": "Power",
        "desc": "升壓輸出"
      },
      {
        "num": "B3",
        "name": "VOUT",
        "side": "R",
        "type": "Power",
        "desc": "升壓輸出"
      },
      {
        "num": "B4",
        "name": "VOUT",
        "side": "R",
        "type": "Power",
        "desc": "升壓輸出"
      },
      {
        "num": "C2",
        "name": "SW",
        "side": "R",
        "type": "Power",
        "desc": "開關節點（內部高低側 MOSFET 連接點；接電感，球 C2/C3/C4）"
      },
      {
        "num": "C3",
        "name": "SW",
        "side": "R",
        "type": "Power",
        "desc": "開關節點（內部高低側 MOSFET 連接點；接電感，球 C2/C3/C4）"
      },
      {
        "num": "C4",
        "name": "SW",
        "side": "R",
        "type": "Power",
        "desc": "開關節點（內部高低側 MOSFET 連接點；接電感，球 C2/C3/C4）"
      },
      {
        "num": "D2",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "接地（球 D2/D3/D4；輸出電容地要靠近）"
      },
      {
        "num": "D3",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "接地（球 D2/D3/D4；輸出電容地要靠近）"
      },
      {
        "num": "D4",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "接地（球 D2/D3/D4；輸出電容地要靠近）"
      }
    ],
    "thermalPad": null,
    "specs": [
      {
        "k": "功能",
        "v": "同步升壓(boost)轉換器、含旁路模式"
      },
      {
        "k": "輸入",
        "v": "最高 5.5 V"
      },
      {
        "k": "開關電流",
        "v": "11 A"
      },
      {
        "k": "整流",
        "v": "同步（內建高/低側 MOSFET）"
      },
      {
        "k": "控制",
        "v": "I2C（可調輸出電壓/模式）；EN 致能"
      },
      {
        "k": "旁路",
        "v": "不需升壓時 bypass 直通省電"
      },
      {
        "k": "封裝",
        "v": "BGA-16（4×4；VIN/VOUT/SW/GND 各 3 球）"
      }
    ],
    "secondSource": [
      "封裝 + ball-out 相容（BGA-16 4×4、同球位）",
      "輸入電壓範圍涵蓋（≤5.5V）",
      "開關/輸出電流 ≥ 需求（11A）",
      "同步整流、效率相容",
      "控制介面相同（I2C、位址相容）",
      "旁路模式支援（若需）",
      "輸出電壓設定範圍涵蓋",
      "工作溫度涵蓋"
    ],
    "dropIn": []
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
    "part": "UCC34141-Q1",
    "mfr": "Texas Instruments",
    "category": "power",
    "subcategory": "整合式隔離偏置電源 (12Vin → 25Vout, 車規)",
    "package": "16-SSOP (DHA)",
    "whatIs": "整合式隔離偏置電源：一次側 12V 輸入，跨電氣隔離在二次側產生正負偏置電壓（VDD 與 VEE，合計約 25V）給閘極驅動等用；含雙路回授穩壓與內部 buck-boost。車規(Q1)、高功率密度、1.5W。",
    "func": "提供 IGBT/SiC/GaN 閘極驅動所需的隔離「正負偏壓」（如 +15V / −4V）。一次 12V 進(VIN/GNDP)，二次 VDD−COM 與 COM−VEE 兩路可各自回授(FBVDD/FBVEE)設定；BSW 接電感做 buck-boost 產生負軌；ENA 致能(可設 UVLO)、PG 指示電源就緒。一二次電氣隔離。",
    "usedIn": "IGBT/SiC/GaN 閘極驅動的隔離正負偏壓、馬達驅動/逆變器/車載充電閘極電源、需 ± 偏壓的隔離供電。",
    "desc": "1.5W、12Vin→25Vout 的整合式隔離偏置電源，二次產生正負偏壓供閘極驅動（16-SSOP(DHA)，車規）。（封裝依 datasheet Figure 5-1「DHA Package, 16-Pin SSOP」；其熱阻表另標 DHA (SOIC)，以圖為準。原庫誤植 QFN-16 已於 2026-07-10 修正）",
    "datasheet": "IC-spec/ucc34141-q1.pdf",
    "pins": [
      {
        "num": "1",
        "name": "ENA",
        "side": "L",
        "type": "input",
        "desc": "致能腳。拉低停用、拉高正常；可用 VIN 分壓電阻設定輸入 UVLO"
      },
      {
        "num": "2",
        "name": "{PG}",
        "side": "L",
        "type": "output",
        "desc": "Power-Good 開汲極輸出（本型號 active-low）。上拉 4.99kΩ 到 3.3V/5V；腳旁放 1µF 0402 去耦"
      },
      {
        "num": "3",
        "name": "VIN",
        "side": "L",
        "type": "power",
        "desc": "一次側輸入電壓。VIN-GNDP 接 10µF＋0.1µF（0402 靠腳）"
      },
      {
        "num": "4",
        "name": "VIN",
        "side": "L",
        "type": "power",
        "desc": "一次側輸入電壓。VIN-GNDP 接 10µF＋0.1µF（0402 靠腳）"
      },
      {
        "num": "5",
        "name": "GNDP",
        "side": "L",
        "type": "ground",
        "desc": "一次側接地。多打 via 到銅面散熱"
      },
      {
        "num": "6",
        "name": "GNDP",
        "side": "L",
        "type": "ground",
        "desc": "一次側接地。多打 via 到銅面散熱"
      },
      {
        "num": "7",
        "name": "GNDP",
        "side": "L",
        "type": "ground",
        "desc": "一次側接地。多打 via 到銅面散熱"
      },
      {
        "num": "8",
        "name": "GNDP",
        "side": "L",
        "type": "ground",
        "desc": "一次側接地。多打 via 到銅面散熱"
      },
      {
        "num": "16",
        "name": "FBVEE",
        "side": "R",
        "type": "input",
        "desc": "COM-VEE 回授。單顆電阻到 VEE 設定 2V~8V；10pF 到 COMA 濾高頻；單輸出模式接 180kΩ 到 VEE"
      },
      {
        "num": "15",
        "name": "FBVDD",
        "side": "R",
        "type": "input",
        "desc": "VDD-COM 回授。VDD→COMA 分壓中點接此腳，內部調節 2.5V；並 470pF 高頻去耦"
      },
      {
        "num": "14",
        "name": "VEE",
        "side": "R",
        "type": "power",
        "desc": "二次側隔離負軌輸出。VEE-COM 接 2.2µF；單輸出模式 VEE 直接接 COM"
      },
      {
        "num": "13",
        "name": "BSW",
        "side": "R",
        "type": "power",
        "desc": "內建 buck-boost 開關腳。經 3.3µH~10µH 電感接 COM；單輸出模式懸空"
      },
      {
        "num": "12",
        "name": "VDD",
        "side": "R",
        "type": "power",
        "desc": "二次側隔離正輸出。VDD-COM 接 10µF＋0.1µF（0402 靠腳）"
      },
      {
        "num": "11",
        "name": "COM",
        "side": "R",
        "type": "ground",
        "desc": "二次側接地。接功率開關 Source"
      },
      {
        "num": "10",
        "name": "COM",
        "side": "R",
        "type": "ground",
        "desc": "二次側接地。接功率開關 Source"
      },
      {
        "num": "9",
        "name": "COMA",
        "side": "R",
        "type": "ground",
        "desc": "二次側類比感測參考。FBVDD/FBVEE 低側回授電阻與高頻去耦靠此腳，單點接 COM"
      }
    ],
    "thermalPad": null,
    "specs": [
      {
        "k": "功能",
        "v": "整合式隔離偏置電源（產正負偏壓）"
      },
      {
        "k": "輸入",
        "v": "12 V（VIN）"
      },
      {
        "k": "輸出",
        "v": "約 25 V（VDD 與 VEE 雙路，可各自回授設定）"
      },
      {
        "k": "功率",
        "v": "1.5 W"
      },
      {
        "k": "隔離",
        "v": "一二次電氣隔離"
      },
      {
        "k": "拓樸",
        "v": "內部 buck-boost（BSW 接電感產生負軌）"
      },
      {
        "k": "回授",
        "v": "FBVDD 調 VDD−COM、FBVEE 調 COM−VEE (2~8V)"
      },
      {
        "k": "指示/致能",
        "v": "PG 就緒、ENA（可設 UVLO）"
      },
      {
        "k": "認證",
        "v": "車規 AEC-Q100 (Q1)"
      },
      {
        "k": "封裝",
        "v": "QFN-16"
      }
    ],
    "secondSource": [
      "封裝 + pinout 相容（QFN-16、pin-to-pin）",
      "輸入電壓涵蓋（12V）",
      "輸出電壓/功率 ≥ 需求（~25V / 1.5W）",
      "正負雙輸出與回授方式相容（FBVDD/FBVEE）",
      "隔離等級涵蓋",
      "buck-boost/電感需求相容（BSW）",
      "PG/ENA 行為相容",
      "車規認證涵蓋（Q1）",
      "工作溫度涵蓋"
    ],
    "dropIn": []
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
      },
      { "num": "49", "name": "P_GND", "side": "B", "type": "ground", "desc": "外露散熱焊墊（PADDLE），必須接地（datasheet：P_GND to ground）", "ep": true }
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
  },
  {
    "part": "UCC21711-Q1",
    "mfr": "Texas Instruments",
    "category": "power",
    "subcategory": "隔離閘極驅動器 (單通道，SiC/IGBT，含隔離類比感測)",
    "package": "SOIC-16 (DW) 10.3mm × 7.5mm",
    "whatIs": "隔離單通道閘極驅動器：將控制器側的低壓 PWM 邏輯訊號跨越電氣隔離傳送到高壓側，驅動 SiC MOSFET 或 IGBT 的閘極，並將過電流、短路等故障狀態回報給控制器。",
    "func": "以 SiO2 電容隔離技術分隔輸入與輸出側，支援 1.5kVRMS 工作電壓、5.7kVRMS(單通道)加強隔離耐壓、12.8kVPK 突波免疫，隔離壽命 >40 年，CMTI ≥150V/ns。輸出級提供 ±10A source/sink 驅動能力，OUTH/OUTL 分離輸出可外接電阻分別調整開關速度。內建 OC(過電流)偵測輸入，支援 SenseFET、DESAT 或分流電阻等多種感測方式；偵測到故障時透過 {FLT}(開集，低態動作)回報，並以 400mA 電流做軟關斷(soft turn-off)保護功率元件。另整合 4A 主動米勒箝位(CLMPI)防止 dv/dt 誤導通，以及隔離類比對 PWM 訊號轉換器(AIN→APWM)，可用於溫度(NTC/PTC/熱二極體)或高壓 DC-Link/相電壓的隔離量測，免加額外隔離放大器。RST/EN 腳同時做輸出致能/關斷與 DESAT 故障重置。VDD-COM 側 UVLO 保護在 RDY 腳輸出電源良好旗標。",
    "usedIn": "電動車牽引逆變器(traction inverter)、車載充電機(OBC)與充電樁、HEV/EV 用 DC/DC 轉換器等 SiC/IGBT 高壓開關驅動應用。",
    "desc": "SOIC-16(DW)封裝，車規(AEC-Q100)5.7kVRMS 單通道加強隔離閘極驅動器，±10A source/sink，OC 過電流偵測(pin2)+隔離類比 PWM 感測輸出(APWM)+4A 主動米勒箝位。與同系列 UCC21751-Q1 腳位位置相同，但 pin2 為 DESAT(非 OC)、觸發基準隨 VDD 浮動，功能不同，兩者不可直接互換。",
    "datasheet": "TI SLUSFY4",
    "pins": [
      {
        "num": "1",
        "name": "AIN",
        "side": "L",
        "type": "Analog In",
        "desc": "隔離類比感測輸入，建議並聯一顆小電容至 COM 以提升雜訊免疫力；未使用時接 COM。"
      },
      {
        "num": "2",
        "name": "OC",
        "side": "L",
        "type": "Analog In",
        "desc": "過電流偵測輸入，支援 SenseFET、DESAT 或分流電阻等較低閾值感測方式；未使用時接 COM。"
      },
      {
        "num": "3",
        "name": "COM",
        "side": "L",
        "type": "Ground",
        "desc": "輸出側共同地參考；IGBT 接射極(emitter)、SiC MOSFET 接源極(source)。"
      },
      {
        "num": "4",
        "name": "OUTH",
        "side": "L",
        "type": "Output",
        "desc": "閘極驅動輸出，上拉(source)電流路徑。"
      },
      {
        "num": "5",
        "name": "VDD",
        "side": "L",
        "type": "Power",
        "desc": "閘極驅動正電源軌；旁路 >10µF 電容至 COM 以支援額定 source 峰值電流，電容須靠近腳位放置。"
      },
      {
        "num": "6",
        "name": "OUTL",
        "side": "L",
        "type": "Output",
        "desc": "閘極驅動輸出，下拉(sink)電流路徑。"
      },
      {
        "num": "7",
        "name": "CLMPI",
        "side": "L",
        "type": "Input",
        "desc": "內部主動米勒箝位(Active Miller Clamp)輸入，直接接至功率電晶體閘極；未使用時懸空或接 VEE。"
      },
      {
        "num": "8",
        "name": "VEE",
        "side": "L",
        "type": "Power",
        "desc": "閘極驅動負電源軌；旁路 >10µF 電容至 COM 以支援額定 sink 峰值電流，電容須靠近腳位放置。"
      },
      {
        "num": "16",
        "name": "APWM",
        "side": "R",
        "type": "Output",
        "desc": "隔離類比感測 PWM 輸出；未使用時可懸空。"
      },
      {
        "num": "15",
        "name": "VCC",
        "side": "R",
        "type": "Power",
        "desc": "輸入側電源供應，3V~5.5V；旁路 >1µF 電容至 GND，電容須靠近腳位放置。"
      },
      {
        "num": "14",
        "name": "RST/EN",
        "side": "R",
        "type": "Input",
        "desc": "雙功能腳：1) 輸出側致能/關斷，拉低使功率開關以一般關斷方式關閉；2) 拉低超過 1000ns 可重置 {FLT} 上的 DESAT 故障狀態，重置訊號於 RST/EN 上升緣觸發；若為自動重置版本，此腳僅作 EN 用。"
      },
      {
        "num": "13",
        "name": "{FLT}",
        "side": "R",
        "type": "Output",
        "desc": "低態動作故障警報輸出，過電流或短路時拉低；開集(open drain)配置，可與其他故障訊號並接。"
      },
      {
        "num": "12",
        "name": "RDY",
        "side": "R",
        "type": "Output",
        "desc": "VCC-GND 與 VDD-COM 電源良好指示；開集(open drain)輸出，可與其他 RDY 訊號並接。"
      },
      {
        "num": "11",
        "name": "IN-",
        "side": "R",
        "type": "Input",
        "desc": "反相閘極驅動控制輸入；未使用時接 GND。"
      },
      {
        "num": "10",
        "name": "IN+",
        "side": "R",
        "type": "Input",
        "desc": "非反相閘極驅動控制輸入；未使用時接 VCC。"
      },
      {
        "num": "9",
        "name": "GND",
        "side": "R",
        "type": "Ground",
        "desc": "輸入側電源供應與邏輯地參考。"
      }
    ],
    "thermalPad": "見 datasheet（dump 未記載外露散熱墊/EP 資訊）",
    "specs": [
      {
        "k": "隔離耐壓",
        "v": "5.7kVRMS(單通道加強隔離)，12.8kVPK 突波，工作電壓 1.5kVRMS"
      },
      {
        "k": "適用開關元件",
        "v": "SiC MOSFET / IGBT，最高 2121Vpk"
      },
      {
        "k": "輸出驅動電壓(VDD-VEE)",
        "v": "最大 33V(建議操作範圍 VDD-COM 13~33V)"
      },
      {
        "k": "驅動電流",
        "v": "±10A(source/sink)，分離 OUTH/OUTL 輸出"
      },
      {
        "k": "CMTI",
        "v": "≥150V/ns(min)"
      },
      {
        "k": "過電流保護響應",
        "v": "270ns(OC，典型)"
      },
      {
        "k": "主動米勒箝位",
        "v": "4A(CLMPI)"
      },
      {
        "k": "軟關斷電流",
        "v": "400mA"
      },
      {
        "k": "VCC 供電",
        "v": "3.0~5.5V"
      },
      {
        "k": "RST/EN 重置最短脈寬",
        "v": "1000ns(建議操作條件，min)"
      },
      {
        "k": "傳播延遲/part skew",
        "v": "130ns(max) / 30ns(max)"
      },
      {
        "k": "工作接面溫度",
        "v": "-40°C~150°C(環境溫度 -40°C~125°C)"
      },
      {
        "k": "封裝",
        "v": "SOIC-16(DW)，爬電/電氣間隙 >8mm"
      },
      {
        "k": "認證",
        "v": "AEC-Q100 溫度等級1；UL1577 元件認證(規劃中)"
      }
    ],
    "secondSource": [
      "封裝+pinout 完全相容(SOIC-16 DW，pin-to-pin)",
      "隔離耐壓與工作電壓等級涵蓋(≥5.7kVRMS 加強隔離)",
      "驅動電流 ±10A 同等或更佳，CMTI ≥150V/ns",
      "過電流/DESAT 保護腳(pin2)名稱與觸發基準需一致，OC 與 DESAT 不可混用",
      "VDD-COM、VCC 供電範圍涵蓋",
      "傳播延遲、part skew 同等或更佳",
      "車規認證(AEC-Q100)、封裝爬電/間隙規格相同"
    ],
    "dropIn": []
  },
  {
    "part": "UCC21751-Q1",
    "mfr": "Texas Instruments",
    "category": "power",
    "subcategory": "隔離閘極驅動器 (單通道，SiC/IGBT，含隔離類比感測)",
    "package": "SOIC-16 (DW) 10.3mm × 7.5mm",
    "whatIs": "隔離單通道閘極驅動器：將控制器側的低壓 PWM 邏輯訊號跨越電氣隔離傳送到高壓側，驅動 SiC MOSFET 或 IGBT 的閘極，並以 DESAT(去飽和)偵測回報短路/過電流故障。",
    "func": "以 SiO2 電容隔離技術分隔輸入與輸出側，支援 1.5kVRMS 工作電壓、5.7kVRMS(單通道)加強隔離耐壓、12.8kVPK 突波免疫，隔離壽命 >40 年，CMTI ≥150V/ns。輸出級提供 ±10A source/sink 驅動能力，OUTH/OUTL 分離輸出可外接電阻分別調整開關速度。內建 DESAT(去飽和電流保護)偵測輸入，偵測基準隨 VDD 浮動(COM-0.3V~VDD+0.3V)，可支援最高 2121V DC 工作電壓的 SiC/IGBT 短路保護；偵測到故障時透過 {FLT}(開集，低態動作)回報，並以 400mA 電流做軟關斷保護功率元件。另整合 4A 主動米勒箝位(CLMPI)防止 dv/dt 誤導通，以及隔離類比對 PWM 訊號轉換器(AIN→APWM)，可用於溫度或高壓 DC-Link/相電壓的隔離量測。RST/EN 腳同時做輸出致能/關斷與 DESAT 故障重置，依 datasheet 建議操作條件，重置最短脈寬為 800ns。VDD-COM 側 UVLO 保護在 RDY 腳輸出電源良好旗標。",
    "usedIn": "電動車牽引逆變器(traction inverter)、車載充電機(OBC)與充電樁、HEV/EV 用 DC/DC 轉換器等 SiC/IGBT 高壓開關驅動應用。",
    "desc": "SOIC-16(DW)封裝，車規(AEC-Q100)5.7kVRMS 單通道加強隔離閘極驅動器，±10A source/sink，DESAT 去飽和保護(pin2，基準隨 VDD 浮動)+隔離類比 PWM 感測輸出(APWM)+4A 主動米勒箝位。與同系列 UCC21711-Q1 腳位位置相同，但 pin2 為 OC(非 DESAT)、觸發基準固定為 COM 參考 -0.3~6V，功能不同，兩者不可直接互換。",
    "datasheet": "TI SLUSFY3",
    "pins": [
      {
        "num": "1",
        "name": "AIN",
        "side": "L",
        "type": "Analog In",
        "desc": "隔離類比感測輸入，建議並聯一顆小電容至 COM 以提升雜訊免疫力；未使用時接 COM。"
      },
      {
        "num": "2",
        "name": "DESAT",
        "side": "L",
        "type": "Analog In",
        "desc": "去飽和(desaturation)電流保護輸入，偵測基準隨 VDD 浮動(COM-0.3V~VDD+0.3V)；未使用時接 COM。"
      },
      {
        "num": "3",
        "name": "COM",
        "side": "L",
        "type": "Ground",
        "desc": "輸出側共同地參考；IGBT 接射極(emitter)、SiC MOSFET 接源極(source)。"
      },
      {
        "num": "4",
        "name": "OUTH",
        "side": "L",
        "type": "Output",
        "desc": "閘極驅動輸出，上拉(source)電流路徑。"
      },
      {
        "num": "5",
        "name": "VDD",
        "side": "L",
        "type": "Power",
        "desc": "閘極驅動正電源軌；旁路 >10µF 電容至 COM 以支援額定 source 峰值電流，電容須靠近腳位放置。"
      },
      {
        "num": "6",
        "name": "OUTL",
        "side": "L",
        "type": "Output",
        "desc": "閘極驅動輸出，下拉(sink)電流路徑。"
      },
      {
        "num": "7",
        "name": "CLMPI",
        "side": "L",
        "type": "Input",
        "desc": "內部主動米勒箝位(Active Miller Clamp)輸入，直接接至功率電晶體閘極；未使用時懸空或接 VEE。"
      },
      {
        "num": "8",
        "name": "VEE",
        "side": "L",
        "type": "Power",
        "desc": "閘極驅動負電源軌；旁路 >10µF 電容至 COM 以支援額定 sink 峰值電流，電容須靠近腳位放置。"
      },
      {
        "num": "16",
        "name": "APWM",
        "side": "R",
        "type": "Output",
        "desc": "隔離類比感測 PWM 輸出；未使用時可懸空。"
      },
      {
        "num": "15",
        "name": "VCC",
        "side": "R",
        "type": "Power",
        "desc": "輸入側電源供應，3V~5.5V；旁路 >1µF 電容至 GND，電容須靠近腳位放置。"
      },
      {
        "num": "14",
        "name": "RST/EN",
        "side": "R",
        "type": "Input",
        "desc": "雙功能腳：1) 輸出側致能/關斷，拉低使功率開關以一般關斷方式關閉；2) 拉低超過 1000ns 可重置 {FLT} 上的 DESAT 故障狀態，重置訊號於 RST/EN 上升緣觸發；若為自動重置版本，此腳僅作 EN 用。"
      },
      {
        "num": "13",
        "name": "{FLT}",
        "side": "R",
        "type": "Output",
        "desc": "低態動作故障警報輸出，過電流或短路時拉低；開集(open drain)配置，可與其他故障訊號並接。"
      },
      {
        "num": "12",
        "name": "RDY",
        "side": "R",
        "type": "Output",
        "desc": "VCC-GND 與 VDD-COM 電源良好指示；開集(open drain)輸出，可與其他 RDY 訊號並接。"
      },
      {
        "num": "11",
        "name": "IN-",
        "side": "R",
        "type": "Input",
        "desc": "反相閘極驅動控制輸入；未使用時接 GND。"
      },
      {
        "num": "10",
        "name": "IN+",
        "side": "R",
        "type": "Input",
        "desc": "非反相閘極驅動控制輸入；未使用時接 VCC。"
      },
      {
        "num": "9",
        "name": "GND",
        "side": "R",
        "type": "Ground",
        "desc": "輸入側電源供應與邏輯地參考。"
      }
    ],
    "thermalPad": "見 datasheet（dump 未記載外露散熱墊/EP 資訊）",
    "specs": [
      {
        "k": "隔離耐壓",
        "v": "5.7kVRMS(單通道加強隔離)，12.8kVPK 突波，工作電壓 1.5kVRMS"
      },
      {
        "k": "適用開關元件",
        "v": "SiC MOSFET / IGBT，最高 2121V DC 工作電壓"
      },
      {
        "k": "輸出驅動電壓(VDD-VEE)",
        "v": "最大 33V(建議操作範圍 VDD-COM 13~33V)"
      },
      {
        "k": "驅動電流",
        "v": "±10A(source/sink)，分離 OUTH/OUTL 輸出"
      },
      {
        "k": "CMTI",
        "v": "≥150V/ns(min)"
      },
      {
        "k": "DESAT 保護響應",
        "v": "200ns(典型)"
      },
      {
        "k": "主動米勒箝位",
        "v": "4A(CLMPI)"
      },
      {
        "k": "軟關斷電流",
        "v": "400mA"
      },
      {
        "k": "VCC 供電",
        "v": "3.0~5.5V"
      },
      {
        "k": "RST/EN 重置最短脈寬",
        "v": "800ns(建議操作條件，min)"
      },
      {
        "k": "傳播延遲/part skew",
        "v": "130ns(max) / 30ns(max)"
      },
      {
        "k": "工作接面溫度",
        "v": "-40°C~150°C(環境溫度 -40°C~125°C)"
      },
      {
        "k": "封裝",
        "v": "SOIC-16(DW)，爬電/電氣間隙 >8mm"
      },
      {
        "k": "認證",
        "v": "AEC-Q100 溫度等級1；UL1577 元件認證(規劃中)"
      }
    ],
    "secondSource": [
      "封裝+pinout 完全相容(SOIC-16 DW，pin-to-pin)",
      "隔離耐壓與工作電壓等級涵蓋(≥5.7kVRMS 加強隔離)",
      "驅動電流 ±10A 同等或更佳，CMTI ≥150V/ns",
      "DESAT/過電流保護腳(pin2)名稱與觸發基準需一致，DESAT 與 OC 不可混用",
      "VDD-COM、VCC 供電範圍涵蓋",
      "傳播延遲、part skew 同等或更佳",
      "車規認證(AEC-Q100)、封裝爬電/間隙規格相同"
    ],
    "dropIn": []
  },
  {
    "part": "TPS7H4010-SEP",
    "mfr": "Texas Instruments",
    "category": "power",
    "subcategory": "太空級同步降壓轉換器 (Rad-Hard)",
    "package": "30-WQFN (RNP) 6.00mm × 4.00mm × 0.8mm",
    "whatIs": "抗輻射太空級同步降壓(step-down)直流轉換器：把 3.5V~32V 輸入電源轉換成可調輸出電壓，最高輸出電流 6A，供衛星/太空酬載板上電源使用。",
    "func": "採用峰值電流模式控制(peak current-mode control)的同步降壓轉換器，內建高側/低側功率 MOSFET(RDS(on) 分別 53mΩ/31mΩ 典型值)，開關頻率 350kHz~2.2MHz 可調(RT 腳一顆電阻設定，懸空時預設 500kHz)，並可同步至外部時脈(SYNC/MODE)。內部補償簡化外部零件數；SS/TRK 可設定軟啟動時間或做電源軌追蹤(tracking)；FB 腳接電阻分壓回授設定輸出電壓；PGOOD 開集輸出電源良好旗標；EN 為精準致能輸入，可用電阻分壓程式化系統 UVLO 關斷點；具逐周期電流限制與打嗝模式(hiccup mode)短路保護、過熱關機保護。BIAS 腳可選接 VOUT 或外部 3.3V/5V 軌以提升效率。抗輻射規格：SEL/SEB/SEGR 免疫至 LET=43MeV-cm²/mg，SET/SEFI 特性化至同 LET，TID 每批晶圓保證 20krad(Si)、特性化至 30krad(Si)；太空增強型塑封(Space Enhanced Plastic)採金線與 NiPdAu 接腳處理、低逸氣模封材料、單一生產/組裝/測試廠。",
    "usedIn": "衛星負載點電源(FPGA、微控制器、資料轉換器、ASIC)、通訊酬載、指揮與資料處理、光學/雷達成像酬載、雷射通訊酬載、導航與科學探測酬載等太空應用。",
    "desc": "30-pin WQFN(RNP)封裝，抗輻射(20krad(Si))太空級 3.5~32V 輸入、6A 同步降壓轉換器，峰值電流模式控制，開關頻率 350kHz~2.2MHz 可調並可外部同步，內建軟啟動/追蹤、精準致能 UVLO 程式化、逐周期限流與打嗝式短路保護。SW(1-5)、PVIN(20-22)、PGND(23-26)、NC(12-15,27-30)為多腳合併。",
    "datasheet": "TI SNVSBL0A",
    "pins": [
      {
        "num": "1",
        "name": "SW",
        "side": "L",
        "type": "Power",
        "desc": "穩壓器切換輸出，內部接高側 FET 源極與低側 FET 汲極；連接至功率電感與 bootstrap 電容。"
      },
      {
        "num": "2",
        "name": "SW",
        "side": "L",
        "type": "Power",
        "desc": "穩壓器切換輸出，內部接高側 FET 源極與低側 FET 汲極；連接至功率電感與 bootstrap 電容。"
      },
      {
        "num": "3",
        "name": "SW",
        "side": "L",
        "type": "Power",
        "desc": "穩壓器切換輸出，內部接高側 FET 源極與低側 FET 汲極；連接至功率電感與 bootstrap 電容。"
      },
      {
        "num": "4",
        "name": "SW",
        "side": "L",
        "type": "Power",
        "desc": "穩壓器切換輸出，內部接高側 FET 源極與低側 FET 汲極；連接至功率電感與 bootstrap 電容。"
      },
      {
        "num": "5",
        "name": "SW",
        "side": "L",
        "type": "Power",
        "desc": "穩壓器切換輸出，內部接高側 FET 源極與低側 FET 汲極；連接至功率電感與 bootstrap 電容。"
      },
      {
        "num": "6",
        "name": "CBOOT",
        "side": "L",
        "type": "Power",
        "desc": "高側 FET 驅動器之 bootstrap 電容連接腳；此腳到 SW 腳間須接一顆高品質 470nF 電容。"
      },
      {
        "num": "7",
        "name": "VCC",
        "side": "L",
        "type": "Power",
        "desc": "內部偏壓穩壓器輸出，供內部控制電路與驅動器使用；此腳到 GND 接一顆高品質 2.2µF 電容，TI 不建議外部電路對此腳加載。"
      },
      {
        "num": "8",
        "name": "BIAS",
        "side": "L",
        "type": "Power",
        "desc": "選用的 BIAS LDO 供電輸入；當 3.3V≤VOUT≤18V 建議接至 VOUT，或接外部 3.3V/5V 軌以提升效率；BIAS 電壓不可高於 VIN；未使用時接地。"
      },
      {
        "num": "9",
        "name": "RT",
        "side": "B",
        "type": "Analog In",
        "desc": "開關頻率設定腳；接一顆電阻至地設定開關頻率，懸空時預設頻率為 500kHz；不可短接至地。"
      },
      {
        "num": "10",
        "name": "SS/TRK",
        "side": "B",
        "type": "Analog In",
        "desc": "軟啟動控制腳；懸空為內部固定軟啟動斜率，外接電容至地可延長軟啟動時間(2µA 電流對電容充電)；亦可外接斜坡訊號做追蹤(tracking)；不可短接至地。"
      },
      {
        "num": "11",
        "name": "FB",
        "side": "B",
        "type": "Analog In",
        "desc": "輸出電壓回授輸入；接電阻分壓器設定輸出電壓；運作中不可將此腳短接至地。"
      },
      {
        "num": "12",
        "name": "NC",
        "side": "B",
        "type": "NC",
        "desc": "無內部連接；建議接地網並鋪銅以提升散熱與板級可靠度。"
      },
      {
        "num": "13",
        "name": "NC",
        "side": "B",
        "type": "NC",
        "desc": "無內部連接；建議接地網並鋪銅以提升散熱與板級可靠度。"
      },
      {
        "num": "14",
        "name": "NC",
        "side": "B",
        "type": "NC",
        "desc": "無內部連接；建議接地網並鋪銅以提升散熱與板級可靠度。"
      },
      {
        "num": "15",
        "name": "NC",
        "side": "B",
        "type": "NC",
        "desc": "無內部連接；建議接地網並鋪銅以提升散熱與板級可靠度。"
      },
      {
        "num": "16",
        "name": "PGOOD",
        "side": "B",
        "type": "Output",
        "desc": "開集(open drain)電源良好旗標輸出；接電流限制電阻至合適電源；High=VOUT在調節範圍內、Low=VOUT調節故障；當 EN=low 且 VIN>2V 時 PGOOD=Low。"
      },
      {
        "num": "17",
        "name": "SYNC/MODE",
        "side": "R",
        "type": "Input",
        "desc": "同步輸入與模式設定腳；不可懸空，未使用時接地。接地=自動模式(輕載效率較佳)；接高邏輯位準=強制 PWM(定頻，跨負載範圍)；接外部時脈=強制 PWM 並同步至外部時脈上升緣。"
      },
      {
        "num": "18",
        "name": "EN",
        "side": "R",
        "type": "Input",
        "desc": "穩壓器致能輸入；不可懸空。High=開啟、Low=關閉；可接至 PVIN。精準致能輸入可用外部電阻分壓器程式化輸入電壓 UVLO。"
      },
      {
        "num": "19",
        "name": "AGND",
        "side": "R",
        "type": "Ground",
        "desc": "類比地；內部電路的接地參考，所有電氣參數皆以此腳為基準；須連接至 PCB 系統地。"
      },
      {
        "num": "20",
        "name": "PVIN",
        "side": "R",
        "type": "Power",
        "desc": "內部偏壓 LDO 與高側 FET 之供電輸入；連接輸入電源與輸入旁路電容 CIN；CIN 須緊鄰此腳與 PGND 腳並以短而寬的走線連接。"
      },
      {
        "num": "21",
        "name": "PVIN",
        "side": "R",
        "type": "Power",
        "desc": "內部偏壓 LDO 與高側 FET 之供電輸入；連接輸入電源與輸入旁路電容 CIN；CIN 須緊鄰此腳與 PGND 腳並以短而寬的走線連接。"
      },
      {
        "num": "22",
        "name": "PVIN",
        "side": "R",
        "type": "Power",
        "desc": "內部偏壓 LDO 與高側 FET 之供電輸入；連接輸入電源與輸入旁路電容 CIN；CIN 須緊鄰此腳與 PGND 腳並以短而寬的走線連接。"
      },
      {
        "num": "23",
        "name": "PGND",
        "side": "R",
        "type": "Ground",
        "desc": "功率地，內部連接至低側 FET 源極；須連接至系統地、DAP/EP、AGND，以及 CIN、COUT 的接地端；到 CIN 的路徑須盡量短。"
      },
      {
        "num": "24",
        "name": "PGND",
        "side": "T",
        "type": "Ground",
        "desc": "功率地，內部連接至低側 FET 源極；須連接至系統地、DAP/EP、AGND，以及 CIN、COUT 的接地端；到 CIN 的路徑須盡量短。"
      },
      {
        "num": "25",
        "name": "PGND",
        "side": "T",
        "type": "Ground",
        "desc": "功率地，內部連接至低側 FET 源極；須連接至系統地、DAP/EP、AGND，以及 CIN、COUT 的接地端；到 CIN 的路徑須盡量短。"
      },
      {
        "num": "26",
        "name": "PGND",
        "side": "T",
        "type": "Ground",
        "desc": "功率地，內部連接至低側 FET 源極；須連接至系統地、DAP/EP、AGND，以及 CIN、COUT 的接地端；到 CIN 的路徑須盡量短。"
      },
      {
        "num": "27",
        "name": "NC",
        "side": "T",
        "type": "NC",
        "desc": "無內部連接；建議接地網並鋪銅以提升散熱與板級可靠度。"
      },
      {
        "num": "28",
        "name": "NC",
        "side": "T",
        "type": "NC",
        "desc": "無內部連接；建議接地網並鋪銅以提升散熱與板級可靠度。"
      },
      {
        "num": "29",
        "name": "NC",
        "side": "T",
        "type": "NC",
        "desc": "無內部連接；建議接地網並鋪銅以提升散熱與板級可靠度。"
      },
      {
        "num": "30",
        "name": "NC",
        "side": "T",
        "type": "NC",
        "desc": "無內部連接；建議接地網並鋪銅以提升散熱與板級可靠度。"
      },
      {
        "num": "31",
        "name": "DAP",
        "side": "B",
        "type": "Ground",
        "desc": "外露焊墊(EP/DAP)，低阻抗連接至 AGND；須連接至 PCB 系統地，為主要散熱路徑，須焊接到接地銅箔，建議加散熱過孔以利散熱到其他層。",
        "ep": true
      }
    ],
    "thermalPad": "DAP(Die Attach Pad)低阻抗連接至 AGND，是主要散熱路徑；須焊接至 PCB 接地銅箔並搭配散熱過孔(thermal vias)以提升散熱到其他層。",
    "specs": [
      {
        "k": "輸入電壓",
        "v": "3.5V ~ 32V"
      },
      {
        "k": "最大輸出電流",
        "v": "6A"
      },
      {
        "k": "控制方式",
        "v": "峰值電流模式(peak current-mode)，內部補償"
      },
      {
        "k": "開關頻率",
        "v": "350kHz ~ 2.2MHz 可調(RT 設定)，懸空預設 500kHz，可同步外部時脈"
      },
      {
        "k": "高側 MOSFET RDS(on)",
        "v": "53mΩ(典型)"
      },
      {
        "k": "低側 MOSFET RDS(on)",
        "v": "31mΩ(典型)"
      },
      {
        "k": "最小導通/關斷時間",
        "v": "tON-MIN 60ns(典型) / tOFF-MIN 70ns(典型)"
      },
      {
        "k": "保護功能",
        "v": "逐周期限流、打嗝模式短路保護、過熱關機、精準 EN 程式化 UVLO"
      },
      {
        "k": "軟啟動",
        "v": "內部固定斜率，或 SS/TRK 外接電容延長，2µA 充電電流"
      },
      {
        "k": "抗輻射(SEL/SEB/SEGR)",
        "v": "免疫至 LET=43MeV-cm²/mg"
      },
      {
        "k": "抗輻射(TID)",
        "v": "每批晶圓保證 20krad(Si)，特性化至 30krad(Si)"
      },
      {
        "k": "封裝",
        "v": "30-WQFN(RNP) 6×4×0.8mm，質量約 57.2mg(±10%)"
      }
    ],
    "secondSource": [
      "封裝+pinout 相容(30-WQFN RNP 6×4mm，pin-to-pin)",
      "輸入電壓範圍涵蓋(3.5~32V)、輸出電流能力 ≥6A",
      "開關頻率可調範圍涵蓋(350kHz~2.2MHz)且支援外部同步",
      "控制架構相容(峰值電流模式)，內部/外部補償方式須確認一致",
      "太空抗輻射等級(SEL/SEB/SEGR、TID)同等或更佳；若替代非太空級零件須另行評估",
      "保護功能(逐周期限流、打嗝短路、EN 程式化 UVLO)同等",
      "封裝散熱路徑(DAP 接 AGND)相同"
    ],
    "dropIn": []
  },
  {
    "part": "TPS25730A",
    "mfr": "Texas Instruments",
    "category": "power",
    "subcategory": "USB Type-C / USB PD 控制器 (Sink-Only，含外部電源路徑閘極驅動)",
    "package": "32-VQFN (RSM) 4.00mm × 4.00mm",
    "whatIs": "USB Type-C 與 USB Power Delivery(PD)控制器：整合 PD 協議引擎與電源路徑保護，讓系統可用 USB-C PD 取代傳統圓形電源插座(barrel jack)，作為僅受電(sink-only)應用的獨立 PD 受電控制器。",
    "func": "TPS25730A 是高整合度、獨立運作的 USB Type-C/PD 控制器，針對僅受電(sink only)應用最佳化，取代傳統 barrel jack 供電介面。內建 Type-C Rd 偵測與 sink 狀態機、USB PD 策略引擎(policy engine)與實體層(physical layer)，相容 PD3.2 規範。透過電阻分壓在 ADCIN1~ADCIN4 等腳位做 pin strapping 即可完整設定 PD 參數，免用外部 EEPROM、外部微控制器或韌體開發。整合電源路徑管理，含過電壓保護與逆電流保護(RCP，經 VSYS/GATE_VSYS 實作)；並提供 6 組可設定 GPIO 功能(SINK_EN、DBG_ACC、CAP_MIS、PLUG_EVENT、PLUG_FLIP、FAULT_IN)。內建 3.3V LDO(LDO_3V3)供死電池(dead battery)情境使用，可由 VIN_3V3 或 VBUS 供電，另有 1.5V 核心 LDO(LDO_1V5)。透過 I2C target(I2Ct_SCL/I2Ct_SDA)可讓外部 MCU 讀取狀態或覆寫設定。本條目為 32-VQFN(RSM) 的 TPS25730AS 版本，以 GATE_VBUS/GATE_VSYS 腳驅動外部 N 型 MOSFET 構成電源路徑(需外接 FET)；同系列另有 38-WQFN(REF) 的 TPS25730AD 版本，內建 PPHV/VBUS_IN/DRAIN 等整合式電源開關腳，免外接 FET，兩版本腳位數與腳位名稱皆不同，不可互換。",
    "usedIn": "電動工具、行動電源(power bank)、零售自動化與支付設備、無線喇叭/耳機等消費性電子的 USB-C PD 受電埠，取代傳統 barrel jack 供電。",
    "desc": "32-VQFN(RSM) 4×4mm 封裝，TPS25730A 的 sink-only USB-C PD 控制器變體(S 版)，以 GATE_VBUS/GATE_VSYS 驅動外部 N 型 MOSFET 構成電源路徑。同系列 38-WQFN(D 版，TPS25730AD)腳位數(38)與名稱皆不同(內建整合式 FET，含 PPHV/VBUS_IN/DRAIN 腳)，兩封裝 pinout 不相容，不可直接互換。",
    "datasheet": "TI SLVSJG8",
    "pins": [
      {
        "num": "1",
        "name": "LDO_3V3",
        "side": "L",
        "type": "Output",
        "desc": "由 VIN_3V3 或 VBUS LDO 切換而來的供電輸出；旁路電容 CLDO_3V3 至 GND。"
      },
      {
        "num": "2",
        "name": "ADCIN1",
        "side": "L",
        "type": "Input",
        "desc": "設定輸入；接電阻分壓器至 LDO_3V3。"
      },
      {
        "num": "3",
        "name": "ADCIN2",
        "side": "L",
        "type": "Input",
        "desc": "設定輸入；接電阻分壓器至 LDO_3V3。"
      },
      {
        "num": "4",
        "name": "LDO_1V5",
        "side": "L",
        "type": "Output",
        "desc": "核心(CORE)LDO 輸出；旁路電容 CLDO_1V5 至 GND；此腳無法對外部電路提供電流。"
      },
      {
        "num": "5",
        "name": "ADCIN3",
        "side": "L",
        "type": "Input",
        "desc": "設定輸入；接電阻分壓器至 LDO_3V3。"
      },
      {
        "num": "6",
        "name": "CAP_MIS",
        "side": "L",
        "type": "Output",
        "desc": "開集(open drain)輸出，能力不匹配(Capability Mismatch)指示；已協商 PD 合約發生能力不匹配時翻轉輸出，否則不翻轉。"
      },
      {
        "num": "7",
        "name": "ADCIN4",
        "side": "L",
        "type": "Input",
        "desc": "設定輸入；接電阻分壓器至 LDO_3V3。"
      },
      {
        "num": "8",
        "name": "I2Ct_SDA",
        "side": "L",
        "type": "I/O",
        "desc": "I2C target 序列資料，開集(open drain)雙向；經電阻接上拉電源，未使用時接地。"
      },
      {
        "num": "9",
        "name": "I2Ct_SCL",
        "side": "B",
        "type": "Input",
        "desc": "I2C target 序列時脈輸入；經電阻接上拉電源，未使用時接地。"
      },
      {
        "num": "10",
        "name": "DBG_ACC",
        "side": "B",
        "type": "Output",
        "desc": "開集(open drain)輸出，Debug Accessory(Rp/Rp 或 Rd/Rd)偵測指示；1=偵測到 Debug Accessory，0=未偵測到。"
      },
      {
        "num": "11",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "接地，連接至接地平面。"
      },
      {
        "num": "12",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "接地，連接至接地平面。"
      },
      {
        "num": "13",
        "name": "PLUG_FLIP",
        "side": "B",
        "type": "Output",
        "desc": "開集(open drain)輸出，纜線插頭方向指示；1=CC2 連接(反插)，0=CC1 連接(正插)。"
      },
      {
        "num": "14",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "接地，連接至接地平面。"
      },
      {
        "num": "15",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "接地，連接至接地平面。"
      },
      {
        "num": "16",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "接地，連接至接地平面。"
      },
      {
        "num": "17",
        "name": "FAULT_IN",
        "side": "R",
        "type": "Input",
        "desc": "故障輸入，觸發 Type-C 錯誤復原並中斷連接埠；0=中斷連接，1=維持連接(無故障)；接周邊 MCU 或保護元件的故障訊號，並以上拉電阻接至 LDO3V3。"
      },
      {
        "num": "18",
        "name": "SINK_EN",
        "side": "R",
        "type": "Output",
        "desc": "開集(open drain)輸出，受電路徑致能指示，用於控制外部負載開關；0=受電路徑致能，1=受電路徑關閉。"
      },
      {
        "num": "19",
        "name": "VSYS",
        "side": "R",
        "type": "Input",
        "desc": "系統側高壓感測節點；用於對 GATE_VSYS 所控制的外部受電路徑實作逆電流保護(RCP)。"
      },
      {
        "num": "20",
        "name": "GATE_VSYS",
        "side": "R",
        "type": "Output",
        "desc": "接至源極(source)接 VSYS 的 N 型 MOSFET 閘極。"
      },
      {
        "num": "21",
        "name": "GATE_VBUS",
        "side": "R",
        "type": "Output",
        "desc": "接至源極(source)接 VBUS 的 N 型 MOSFET 閘極。"
      },
      {
        "num": "22",
        "name": "RESERVED",
        "side": "R",
        "type": "Input",
        "desc": "保留腳；接地。"
      },
      {
        "num": "23",
        "name": "PD5VMAX",
        "side": "R",
        "type": "Input",
        "desc": "設定輸入；接地或 LDO_3V3。"
      },
      {
        "num": "24",
        "name": "CC1",
        "side": "R",
        "type": "I/O",
        "desc": "USB Type-C 的 CC I/O；接建議電容(CCCy)至 GND 濾除雜訊。"
      },
      {
        "num": "25",
        "name": "CC2",
        "side": "T",
        "type": "I/O",
        "desc": "USB Type-C 的 CC I/O；接建議電容(CCCy)至 GND 濾除雜訊。"
      },
      {
        "num": "26",
        "name": "VBUS",
        "side": "T",
        "type": "I/O",
        "desc": "5V~20V 輸入；旁路電容 CVBUS 至 GND。"
      },
      {
        "num": "27",
        "name": "VBUS",
        "side": "T",
        "type": "I/O",
        "desc": "5V~20V 輸入；旁路電容 CVBUS 至 GND。"
      },
      {
        "num": "28",
        "name": "GND",
        "side": "T",
        "type": "Ground",
        "desc": "接地，連接至接地平面。"
      },
      {
        "num": "29",
        "name": "GND",
        "side": "T",
        "type": "Ground",
        "desc": "接地，連接至接地平面。"
      },
      {
        "num": "30",
        "name": "RESERVED",
        "side": "T",
        "type": "Input",
        "desc": "保留腳；接地。"
      },
      {
        "num": "31",
        "name": "PLUG_EVENT",
        "side": "T",
        "type": "Output",
        "desc": "開集(open drain)輸出，1=偵測到連接，0=未偵測到連接。"
      },
      {
        "num": "32",
        "name": "VIN_3V3",
        "side": "T",
        "type": "Input",
        "desc": "核心電路與 I/O 供電；旁路電容 CVIN_3V3 至 GND；若裝置僅由 VBUS 供電則此腳接地。"
      },
      {
        "num": "33",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "外露散熱墊(Thermal Pad)，datasheet 標示接 GND；為主要散熱路徑，建議焊接至 PCB 接地銅箔並搭配散熱過孔。",
        "ep": true
      }
    ],
    "thermalPad": "外露散熱墊(Thermal Pad)標示接 GND；建議焊接至 PCB 接地銅箔並搭配散熱過孔以利散熱。",
    "specs": [
      {
        "k": "PD 相容性",
        "v": "USB PD3.2(sink-only 應用)"
      },
      {
        "k": "整合功能",
        "v": "Type-C Rd/sink 狀態機、PD policy engine、實體層、6 組可設定 GPIO、I2C target"
      },
      {
        "k": "設定方式",
        "v": "電阻分壓 pin strapping(ADCIN1~4)，免 EEPROM/外部 MCU/韌體"
      },
      {
        "k": "電源路徑",
        "v": "S 版(32-VQFN，本條目)以 GATE_VBUS/GATE_VSYS 驅動外部 N 型 MOSFET；D 版(38-WQFN)內建整合式電源開關(PPHV/VBUS_IN/DRAIN)"
      },
      {
        "k": "保護功能",
        "v": "整合過電壓保護、逆電流保護(RCP，經 VSYS/GATE_VSYS)"
      },
      {
        "k": "內建 LDO",
        "v": "3.3V(LDO_3V3，死電池支援) / 1.5V 核心(LDO_1V5)"
      },
      {
        "k": "供電來源",
        "v": "VIN_3V3 或 VBUS"
      },
      {
        "k": "VBUS 輸入範圍",
        "v": "5V~20V"
      },
      {
        "k": "通訊介面",
        "v": "I2C target(I2Ct_SCL/I2Ct_SDA)供外部 MCU 讀取/設定"
      },
      {
        "k": "溫度範圍",
        "v": "支援工業溫度範圍"
      },
      {
        "k": "封裝",
        "v": "32-VQFN(RSM) 4×4mm(S 版，本條目)；另有 38-WQFN(REF) 4×6mm(D 版)"
      }
    ],
    "secondSource": [
      "封裝+pinout 完全相容(32-VQFN RSM 4×4mm，pin-to-pin)；D 版(38-WQFN)與 S 版腳位不相容不可混用",
      "PD 規範版本涵蓋(PD3.2)，sink-only 功能相容",
      "pin strapping 設定邏輯與電阻對照表須一致(ADCIN1~4、PD5VMAX 等)",
      "GPIO 功能腳(SINK_EN、DBG_ACC、CAP_MIS、PLUG_EVENT、PLUG_FLIP、FAULT_IN)極性與開集特性相同",
      "I2C 位址與暫存器映射相容(若系統有外部 MCU 存取)",
      "VBUS 輸入範圍、內建 LDO 電壓與電流能力同等",
      "外部 MOSFET 閘極驅動能力(GATE_VBUS/GATE_VSYS)同等或更佳"
    ],
    "dropIn": []
  },
  {
    "part": "TPS7H5001-SP",
    "mfr": "Texas Instruments",
    "category": "power",
    "subcategory": "太空級返馳/推挽 PWM 控制器 (Rad-Hard, QMLV)",
    "package": "24-TSSOP(PW)；另有 22-pin CFP 陶瓷扁平封裝版本(腳位編號與 TSSOP 不同，見 datasheet Table 6-1)",
    "whatIs": "TI 太空級(QMLV)返馳/推挽式(flyback/push-pull)脈寬調變(PWM)控制器，採峰值電流模式(peak current-mode)控制並具斜率補償，輸入電壓 4V~14V，可由 RT 電阻設定開關頻率並支援 SYNC 外部時脈同步；TPS7H5001-SP/5002-SP/5003-SP/5004-SP 為同系列不同輸出型態變體，共用同一份 datasheet(SLVSF07F)。",
    "func": "內部誤差放大器(VSENSE 反相輸入、COMP 輸出)搭配峰值電流模式 PWM 比較器(CS_ILIM 電流感測，相對 COMP/2 電壓含 150mV 偏移，RSC 設定斜率補償)；HICC 腳設定逐周期限流延遲與打嗝式短路保護時間(接 AVSS 可停用打嗝模式)；FAULT 腳提供獨立故障保護輸入(接 AVSS 停用)；SS 腳外接電容設定軟啟動時間，亦可用於電源軌追蹤(tracking)/時序排序(sequencing)；REFCAP 為 1.2V 內部參考(需 470nF 電容)；VLDO 為內部穩壓器輸出(需至少 1µF 電容)；EN 腳可用電阻分壓程式化輸入 UVLO；DCL 設定最大工作週期限制，各變體行為不同(見 DCL 腳說明)。",
    "usedIn": "衛星/太空酬載板上隔離或非隔離之返馳(flyback)、順向(forward)、推挽(push-pull)型 DC-DC 電源轉換器，供指揮與資料處理、通訊、光學/雷達成像、導航與科學探測酬載等太空應用之二次電源使用。",
    "desc": "24-TSSOP(PW)封裝，太空級(QMLV)峰值電流模式返馳/推挽 PWM 控制器。雙主開關輸出(OUTA/OUTB) + 雙同步整流驅動(SRA/SRB)，DCL=AVSS 時 OUTA/OUTB 以推挽方式切換。TSSOP NC 腳位：12, 13；CFP(22-pin)封裝腳位編號與 TSSOP 不同(緊密編號、無對應 TSSOP 之 NC 腳)，詳見 datasheet Table 6-1。與同系列 TPS7H5001-SP/5002-SP/5003-SP/5004-SP 差異僅在輸出型態與 PS/SP/LEB 腳位是否存在，不互為 pin-to-pin 相容，選型須依電路拓樸(是否需雙輸出、是否需同步整流)確認。",
    "datasheet": "https://www.ti.com/lit/ds/symlink/tps7h5001-sp.pdf",
    "pins": [
      {
        "num": "1",
        "name": "RT",
        "type": "io",
        "desc": "振盪頻率設定腳。使用內部振盪模式時，RT 腳須接一顆電阻至 AVSS 以設定開關頻率；RT 懸空時，SYNC 腳須輸入 200kHz~4MHz 外部時脈，且外部時脈頻率須為目標開關頻率的 2 倍。 （CFP 22-pin 封裝同為腳位 1，四顆變體皆同。）",
        "side": "L"
      },
      {
        "num": "2",
        "name": "PS",
        "type": "io",
        "desc": "Primary off 到 SR on 死區時間(dead-time)設定腳，透過外接電阻至 AVSS 程式化。 （CFP 22-pin 封裝同為腳位 2，四顆變體皆同。）",
        "side": "L"
      },
      {
        "num": "3",
        "name": "SP",
        "type": "io",
        "desc": "SR off 到 Primary on 死區時間(dead-time)設定腳，透過外接電阻至 AVSS 程式化。 （CFP 22-pin 封裝同為腳位 3，四顆變體皆同。）",
        "side": "L"
      },
      {
        "num": "4",
        "name": "LEB",
        "type": "io",
        "desc": "前緣消隱(leading edge blank)時間設定腳，透過外接電阻至 AVSS 程式化。 （CFP 22-pin 封裝同為腳位 4，四顆變體皆同。）",
        "side": "L"
      },
      {
        "num": "5",
        "name": "HICC",
        "type": "io",
        "desc": "逐周期電流限制之延遲時間與打嗝(hiccup)時間設定腳；延遲時間與打嗝時間由 HICC 到 AVSS 的外接電容決定。此腳接 AVSS 可停用打嗝模式。 （CFP 22-pin 封裝同為腳位 5，四顆變體皆同。）",
        "side": "L"
      },
      {
        "num": "6",
        "name": "SYNC",
        "type": "io",
        "desc": "同步時脈腳。當 RT 懸空時，SYNC 作為 200kHz~4MHz 外部時脈輸入，外部時脈訊號會被反相，系統時脈以外部時脈的 1/2 頻率運作；當 RT 接電阻至 AVSS 時，SYNC 輸出與元件切換同相之 200kHz~4MHz 時脈，頻率為元件開關頻率的 2 倍。 （CFP 22-pin 封裝同為腳位 6，四顆變體皆同。）",
        "side": "L"
      },
      {
        "num": "7",
        "name": "DCL",
        "type": "io",
        "desc": "工作週期限制(duty cycle limit)設定腳。TPS7H5001-SP：接 AVSS 得 50% 工作週期限制、懸空得 75%、接 VLDO 得 100%。 （CFP 22-pin 封裝同為腳位 7，四顆變體皆同。）",
        "side": "L"
      },
      {
        "num": "8",
        "name": "EN",
        "type": "input",
        "desc": "致能輸入。將 EN 接至 VLDO 或外部電壓源(大於 0.6V)可致能元件；另可用兩顆電阻程式化輸入欠壓鎖定(UVLO)。 （CFP 22-pin 封裝同為腳位 8，四顆變體皆同。）",
        "side": "L"
      },
      {
        "num": "9",
        "name": "VIN",
        "type": "power",
        "desc": "元件輸入電源，輸入電壓範圍 4V ~ 14V。 （CFP 22-pin 封裝同為腳位 9，四顆變體皆同。）",
        "side": "L"
      },
      {
        "num": "10",
        "name": "OUTA",
        "type": "output",
        "desc": "主開關輸出 A(Primary switching output A)。 （CFP 22-pin 封裝同為腳位 10，四顆變體皆同。）",
        "side": "L"
      },
      {
        "num": "11",
        "name": "OUTB",
        "type": "output",
        "desc": "主開關輸出 B(Primary switching output B)，僅當 DCL = AVSS 時動作。 （CFP 22-pin 封裝同為腳位 11，四顆變體皆同。）",
        "side": "L"
      },
      {
        "num": "12",
        "name": "NC",
        "type": "nc",
        "desc": "未連接(No connect)。若需避免懸浮金屬，可選擇接至 AVSS。 CFP(22-pin)封裝在此系列變體無對應 NC 腳位(N/A)，CFP 總腳數 22。",
        "side": "L"
      },
      {
        "num": "24",
        "name": "COMP",
        "type": "io",
        "desc": "誤差放大器輸出端，於此腳連接頻率補償網路。 （CFP 22-pin 封裝腳位為 22；CFP 封裝總腳數 22，與 TSSOP 24 腳編號不同，見 datasheet Table 6-1。）",
        "side": "R"
      },
      {
        "num": "23",
        "name": "VSENSE",
        "type": "input",
        "desc": "誤差放大器反相輸入端。 （CFP 22-pin 封裝腳位為 21；CFP 封裝總腳數 22，與 TSSOP 24 腳編號不同，見 datasheet Table 6-1。）",
        "side": "R"
      },
      {
        "num": "22",
        "name": "SS",
        "type": "io",
        "desc": "軟啟動腳。外接電容至此腳可設定內部參考電壓的上升時間；此腳電壓會覆蓋內部參考電壓，可用於電源軌追蹤(tracking)與時序排序(sequencing)。 （CFP 22-pin 封裝腳位為 20；CFP 封裝總腳數 22，與 TSSOP 24 腳編號不同，見 datasheet Table 6-1。）",
        "side": "R"
      },
      {
        "num": "21",
        "name": "RSC",
        "type": "io",
        "desc": "由 RSC 到 AVSS 的電阻設定所需的斜率補償(slope compensation)。 （CFP 22-pin 封裝腳位為 19；CFP 封裝總腳數 22，與 TSSOP 24 腳編號不同，見 datasheet Table 6-1。）",
        "side": "R"
      },
      {
        "num": "20",
        "name": "REFCAP",
        "type": "output",
        "desc": "1.2V 內部參考電壓，須外接 470nF 電容至 AVSS。 （CFP 22-pin 封裝腳位為 18；CFP 封裝總腳數 22，與 TSSOP 24 腳編號不同，見 datasheet Table 6-1。）",
        "side": "R"
      },
      {
        "num": "19",
        "name": "FAULT",
        "type": "input",
        "desc": "故障保護腳。當 FAULT 腳電壓超過上升門檻時，輸出停止切換；外部電壓降至下降門檻以下後，元件會延遲一段設定時間後重新啟動。此腳接 AVSS 可停用 FAULT 功能。 （CFP 22-pin 封裝腳位為 17；CFP 封裝總腳數 22，與 TSSOP 24 腳編號不同，見 datasheet Table 6-1。）",
        "side": "R"
      },
      {
        "num": "18",
        "name": "CS_ILIM",
        "type": "io",
        "desc": "PWM 控制與逐周期過電流保護用電流感測輸入。CS_ILIM 輸入電壓超過 1.05V 會觸發 PWM 控制器過電流保護；CS_ILIM 上感測到的波形相對於 PWM 比較器輸入端的 COMP/2 電壓含 150mV 偏移。 （CFP 22-pin 封裝腳位為 16；CFP 封裝總腳數 22，與 TSSOP 24 腳編號不同，見 datasheet Table 6-1。）",
        "side": "R"
      },
      {
        "num": "17",
        "name": "VLDO",
        "type": "power",
        "desc": "內部穩壓器輸出，須外接至少 1µF 電容至 AVSS。 （CFP 22-pin 封裝腳位為 15；CFP 封裝總腳數 22，與 TSSOP 24 腳編號不同，見 datasheet Table 6-1。）",
        "side": "R"
      },
      {
        "num": "16",
        "name": "AVSS",
        "type": "ground",
        "desc": "元件接地。陶瓷封裝(CFP)版本的散熱片、蓋板與封環(seal ring)於內部連接至此接地。 （CFP 22-pin 封裝腳位為 14；CFP 封裝總腳數 22，與 TSSOP 24 腳編號不同，見 datasheet Table 6-1。）",
        "side": "R"
      },
      {
        "num": "15",
        "name": "SRA",
        "type": "output",
        "desc": "同步整流輸出 A(Synchronous rectifier output A)。 （CFP 22-pin 封裝腳位為 13；CFP 封裝總腳數 22，與 TSSOP 24 腳編號不同，見 datasheet Table 6-1。）",
        "side": "R"
      },
      {
        "num": "14",
        "name": "SRB",
        "type": "output",
        "desc": "同步整流輸出 B(Synchronous rectifier output B)，僅當 DCL = AVSS 時動作。 （CFP 22-pin 封裝腳位為 12；CFP 封裝總腳數 22，與 TSSOP 24 腳編號不同，見 datasheet Table 6-1。）",
        "side": "R"
      },
      {
        "num": "13",
        "name": "NC",
        "type": "nc",
        "desc": "未連接(No connect)。若需避免懸浮金屬，可選擇接至 AVSS。 CFP(22-pin)封裝在此系列變體無對應 NC 腳位(N/A)，CFP 總腳數 22。",
        "side": "R"
      }
    ],
    "specs": [
      {
        "k": "輸出型態",
        "v": "雙主開關輸出(OUTA/OUTB) + 雙同步整流驅動(SRA/SRB)，DCL=AVSS 時 OUTA/OUTB 以推挽方式切換"
      },
      {
        "k": "輸入電壓",
        "v": "4V ~ 14V (VIN)"
      },
      {
        "k": "控制方式",
        "v": "峰值電流模式(peak current-mode)，RSC 外接電阻設定斜率補償"
      },
      {
        "k": "開關頻率設定",
        "v": "RT 電阻設定；RT 懸空時可由 SYNC 輸入 200kHz~4MHz 外部時脈(為開關頻率 2 倍)"
      },
      {
        "k": "工作週期限制(DCL)",
        "v": "接 AVSS 得 50% 工作週期限制、懸空得 75%、接 VLDO 得 100%。"
      },
      {
        "k": "過電流保護",
        "v": "CS_ILIM > 1.05V 觸發逐周期過流保護，感測波形相對 COMP/2 含 150mV 偏移"
      },
      {
        "k": "短路保護",
        "v": "HICC 腳電容設定延遲/打嗝時間，接 AVSS 停用打嗝模式"
      },
      {
        "k": "故障保護",
        "v": "FAULT 腳獨立故障輸入，超過上升門檻停止切換，接 AVSS 停用"
      },
      {
        "k": "內部參考",
        "v": "REFCAP 1.2V，需 470nF 電容"
      },
      {
        "k": "內部穩壓器",
        "v": "VLDO 輸出，需至少 1µF 電容"
      },
      {
        "k": "軟啟動/追蹤",
        "v": "SS 外接電容設定軟啟動時間，可用於 tracking/sequencing"
      },
      {
        "k": "封裝",
        "v": "24-TSSOP(PW)；另有 22-pin CFP 陶瓷扁平封裝版本(腳位編號與 TSSOP 不同，見 datasheet Table 6-1)"
      },
      {
        "k": "抗輻射等級(TID/SEL/SEB/SEGR)",
        "v": "見 datasheet"
      }
    ],
    "secondSource": [],
    "dropIn": []
  },
  {
    "part": "TPS7H5002-SP",
    "mfr": "Texas Instruments",
    "category": "power",
    "subcategory": "太空級返馳/推挽 PWM 控制器 (Rad-Hard, QMLV)",
    "package": "24-TSSOP(PW)；另有 22-pin CFP 陶瓷扁平封裝版本(腳位編號與 TSSOP 不同，見 datasheet Table 6-1)",
    "whatIs": "TI 太空級(QMLV)返馳/推挽式(flyback/push-pull)脈寬調變(PWM)控制器，採峰值電流模式(peak current-mode)控制並具斜率補償，輸入電壓 4V~14V，可由 RT 電阻設定開關頻率並支援 SYNC 外部時脈同步；TPS7H5001-SP/5002-SP/5003-SP/5004-SP 為同系列不同輸出型態變體，共用同一份 datasheet(SLVSF07F)。",
    "func": "內部誤差放大器(VSENSE 反相輸入、COMP 輸出)搭配峰值電流模式 PWM 比較器(CS_ILIM 電流感測，相對 COMP/2 電壓含 150mV 偏移，RSC 設定斜率補償)；HICC 腳設定逐周期限流延遲與打嗝式短路保護時間(接 AVSS 可停用打嗝模式)；FAULT 腳提供獨立故障保護輸入(接 AVSS 停用)；SS 腳外接電容設定軟啟動時間，亦可用於電源軌追蹤(tracking)/時序排序(sequencing)；REFCAP 為 1.2V 內部參考(需 470nF 電容)；VLDO 為內部穩壓器輸出(需至少 1µF 電容)；EN 腳可用電阻分壓程式化輸入 UVLO；DCL 設定最大工作週期限制，各變體行為不同(見 DCL 腳說明)。",
    "usedIn": "衛星/太空酬載板上隔離或非隔離之返馳(flyback)、順向(forward)、推挽(push-pull)型 DC-DC 電源轉換器，供指揮與資料處理、通訊、光學/雷達成像、導航與科學探測酬載等太空應用之二次電源使用。",
    "desc": "24-TSSOP(PW)封裝，太空級(QMLV)峰值電流模式返馳/推挽 PWM 控制器。單主開關輸出(OUTA) + 單同步整流驅動(SRA)，適合單端(返馳/順向)拓樸搭配同步整流。TSSOP NC 腳位：11, 12, 13, 14；CFP(22-pin)封裝腳位編號與 TSSOP 不同(緊密編號、無對應 TSSOP 之 NC 腳)，詳見 datasheet Table 6-1。與同系列 TPS7H5001-SP/5002-SP/5003-SP/5004-SP 差異僅在輸出型態與 PS/SP/LEB 腳位是否存在，不互為 pin-to-pin 相容，選型須依電路拓樸(是否需雙輸出、是否需同步整流)確認。",
    "datasheet": "https://www.ti.com/lit/ds/symlink/tps7h5001-sp.pdf",
    "pins": [
      {
        "num": "1",
        "name": "RT",
        "type": "io",
        "desc": "振盪頻率設定腳。使用內部振盪模式時，RT 腳須接一顆電阻至 AVSS 以設定開關頻率；RT 懸空時，SYNC 腳須輸入 200kHz~4MHz 外部時脈，且外部時脈頻率須為目標開關頻率的 2 倍。 （CFP 22-pin 封裝同為腳位 1，四顆變體皆同。）",
        "side": "L"
      },
      {
        "num": "2",
        "name": "PS",
        "type": "io",
        "desc": "Primary off 到 SR on 死區時間(dead-time)設定腳，透過外接電阻至 AVSS 程式化。 （CFP 22-pin 封裝同為腳位 2，四顆變體皆同。）",
        "side": "L"
      },
      {
        "num": "3",
        "name": "SP",
        "type": "io",
        "desc": "SR off 到 Primary on 死區時間(dead-time)設定腳，透過外接電阻至 AVSS 程式化。 （CFP 22-pin 封裝同為腳位 3，四顆變體皆同。）",
        "side": "L"
      },
      {
        "num": "4",
        "name": "LEB",
        "type": "io",
        "desc": "前緣消隱(leading edge blank)時間設定腳，透過外接電阻至 AVSS 程式化。 （CFP 22-pin 封裝同為腳位 4，四顆變體皆同。）",
        "side": "L"
      },
      {
        "num": "5",
        "name": "HICC",
        "type": "io",
        "desc": "逐周期電流限制之延遲時間與打嗝(hiccup)時間設定腳；延遲時間與打嗝時間由 HICC 到 AVSS 的外接電容決定。此腳接 AVSS 可停用打嗝模式。 （CFP 22-pin 封裝同為腳位 5，四顆變體皆同。）",
        "side": "L"
      },
      {
        "num": "6",
        "name": "SYNC",
        "type": "io",
        "desc": "同步時脈腳。當 RT 懸空時，SYNC 作為 200kHz~4MHz 外部時脈輸入，外部時脈訊號會被反相，系統時脈以外部時脈的 1/2 頻率運作；當 RT 接電阻至 AVSS 時，SYNC 輸出與元件切換同相之 200kHz~4MHz 時脈，頻率為元件開關頻率的 2 倍。 （CFP 22-pin 封裝同為腳位 6，四顆變體皆同。）",
        "side": "L"
      },
      {
        "num": "7",
        "name": "DCL",
        "type": "io",
        "desc": "工作週期限制(duty cycle limit)設定腳。TPS7H5002-SP：可懸空或接 VLDO，分別設定最大工作週期為 75% 或 100%。 （CFP 22-pin 封裝同為腳位 7，四顆變體皆同。）",
        "side": "L"
      },
      {
        "num": "8",
        "name": "EN",
        "type": "input",
        "desc": "致能輸入。將 EN 接至 VLDO 或外部電壓源(大於 0.6V)可致能元件；另可用兩顆電阻程式化輸入欠壓鎖定(UVLO)。 （CFP 22-pin 封裝同為腳位 8，四顆變體皆同。）",
        "side": "L"
      },
      {
        "num": "9",
        "name": "VIN",
        "type": "power",
        "desc": "元件輸入電源，輸入電壓範圍 4V ~ 14V。 （CFP 22-pin 封裝同為腳位 9，四顆變體皆同。）",
        "side": "L"
      },
      {
        "num": "10",
        "name": "OUTA",
        "type": "output",
        "desc": "主開關輸出 A(Primary switching output A)。 （CFP 22-pin 封裝同為腳位 10，四顆變體皆同。）",
        "side": "L"
      },
      {
        "num": "11",
        "name": "NC",
        "type": "nc",
        "desc": "未連接(No connect)。若需避免懸浮金屬，可選擇接至 AVSS。 CFP(22-pin)封裝對應之未連接腳位集合為 11, 12（非逐一對應，見 datasheet Table 6-1）。",
        "side": "L"
      },
      {
        "num": "12",
        "name": "NC",
        "type": "nc",
        "desc": "未連接(No connect)。若需避免懸浮金屬，可選擇接至 AVSS。 CFP(22-pin)封裝對應之未連接腳位集合為 11, 12（非逐一對應，見 datasheet Table 6-1）。",
        "side": "L"
      },
      {
        "num": "24",
        "name": "COMP",
        "type": "io",
        "desc": "誤差放大器輸出端，於此腳連接頻率補償網路。 （CFP 22-pin 封裝腳位為 22；CFP 封裝總腳數 22，與 TSSOP 24 腳編號不同，見 datasheet Table 6-1。）",
        "side": "R"
      },
      {
        "num": "23",
        "name": "VSENSE",
        "type": "input",
        "desc": "誤差放大器反相輸入端。 （CFP 22-pin 封裝腳位為 21；CFP 封裝總腳數 22，與 TSSOP 24 腳編號不同，見 datasheet Table 6-1。）",
        "side": "R"
      },
      {
        "num": "22",
        "name": "SS",
        "type": "io",
        "desc": "軟啟動腳。外接電容至此腳可設定內部參考電壓的上升時間；此腳電壓會覆蓋內部參考電壓，可用於電源軌追蹤(tracking)與時序排序(sequencing)。 （CFP 22-pin 封裝腳位為 20；CFP 封裝總腳數 22，與 TSSOP 24 腳編號不同，見 datasheet Table 6-1。）",
        "side": "R"
      },
      {
        "num": "21",
        "name": "RSC",
        "type": "io",
        "desc": "由 RSC 到 AVSS 的電阻設定所需的斜率補償(slope compensation)。 （CFP 22-pin 封裝腳位為 19；CFP 封裝總腳數 22，與 TSSOP 24 腳編號不同，見 datasheet Table 6-1。）",
        "side": "R"
      },
      {
        "num": "20",
        "name": "REFCAP",
        "type": "output",
        "desc": "1.2V 內部參考電壓，須外接 470nF 電容至 AVSS。 （CFP 22-pin 封裝腳位為 18；CFP 封裝總腳數 22，與 TSSOP 24 腳編號不同，見 datasheet Table 6-1。）",
        "side": "R"
      },
      {
        "num": "19",
        "name": "FAULT",
        "type": "input",
        "desc": "故障保護腳。當 FAULT 腳電壓超過上升門檻時，輸出停止切換；外部電壓降至下降門檻以下後，元件會延遲一段設定時間後重新啟動。此腳接 AVSS 可停用 FAULT 功能。 （CFP 22-pin 封裝腳位為 17；CFP 封裝總腳數 22，與 TSSOP 24 腳編號不同，見 datasheet Table 6-1。）",
        "side": "R"
      },
      {
        "num": "18",
        "name": "CS_ILIM",
        "type": "io",
        "desc": "PWM 控制與逐周期過電流保護用電流感測輸入。CS_ILIM 輸入電壓超過 1.05V 會觸發 PWM 控制器過電流保護；CS_ILIM 上感測到的波形相對於 PWM 比較器輸入端的 COMP/2 電壓含 150mV 偏移。 （CFP 22-pin 封裝腳位為 16；CFP 封裝總腳數 22，與 TSSOP 24 腳編號不同，見 datasheet Table 6-1。）",
        "side": "R"
      },
      {
        "num": "17",
        "name": "VLDO",
        "type": "power",
        "desc": "內部穩壓器輸出，須外接至少 1µF 電容至 AVSS。 （CFP 22-pin 封裝腳位為 15；CFP 封裝總腳數 22，與 TSSOP 24 腳編號不同，見 datasheet Table 6-1。）",
        "side": "R"
      },
      {
        "num": "16",
        "name": "AVSS",
        "type": "ground",
        "desc": "元件接地。陶瓷封裝(CFP)版本的散熱片、蓋板與封環(seal ring)於內部連接至此接地。 （CFP 22-pin 封裝腳位為 14；CFP 封裝總腳數 22，與 TSSOP 24 腳編號不同，見 datasheet Table 6-1。）",
        "side": "R"
      },
      {
        "num": "15",
        "name": "SRA",
        "type": "output",
        "desc": "同步整流輸出 A(Synchronous rectifier output A)。 （CFP 22-pin 封裝腳位為 13；CFP 封裝總腳數 22，與 TSSOP 24 腳編號不同，見 datasheet Table 6-1。）",
        "side": "R"
      },
      {
        "num": "14",
        "name": "NC",
        "type": "nc",
        "desc": "未連接(No connect)。若需避免懸浮金屬，可選擇接至 AVSS。 CFP(22-pin)封裝對應之未連接腳位集合為 11, 12（非逐一對應，見 datasheet Table 6-1）。",
        "side": "R"
      },
      {
        "num": "13",
        "name": "NC",
        "type": "nc",
        "desc": "未連接(No connect)。若需避免懸浮金屬，可選擇接至 AVSS。 CFP(22-pin)封裝對應之未連接腳位集合為 11, 12（非逐一對應，見 datasheet Table 6-1）。",
        "side": "R"
      }
    ],
    "specs": [
      {
        "k": "輸出型態",
        "v": "單主開關輸出(OUTA) + 單同步整流驅動(SRA)，適合單端(返馳/順向)拓樸搭配同步整流"
      },
      {
        "k": "輸入電壓",
        "v": "4V ~ 14V (VIN)"
      },
      {
        "k": "控制方式",
        "v": "峰值電流模式(peak current-mode)，RSC 外接電阻設定斜率補償"
      },
      {
        "k": "開關頻率設定",
        "v": "RT 電阻設定；RT 懸空時可由 SYNC 輸入 200kHz~4MHz 外部時脈(為開關頻率 2 倍)"
      },
      {
        "k": "工作週期限制(DCL)",
        "v": "可懸空或接 VLDO，分別設定最大工作週期為 75% 或 100%。"
      },
      {
        "k": "過電流保護",
        "v": "CS_ILIM > 1.05V 觸發逐周期過流保護，感測波形相對 COMP/2 含 150mV 偏移"
      },
      {
        "k": "短路保護",
        "v": "HICC 腳電容設定延遲/打嗝時間，接 AVSS 停用打嗝模式"
      },
      {
        "k": "故障保護",
        "v": "FAULT 腳獨立故障輸入，超過上升門檻停止切換，接 AVSS 停用"
      },
      {
        "k": "內部參考",
        "v": "REFCAP 1.2V，需 470nF 電容"
      },
      {
        "k": "內部穩壓器",
        "v": "VLDO 輸出，需至少 1µF 電容"
      },
      {
        "k": "軟啟動/追蹤",
        "v": "SS 外接電容設定軟啟動時間，可用於 tracking/sequencing"
      },
      {
        "k": "封裝",
        "v": "24-TSSOP(PW)；另有 22-pin CFP 陶瓷扁平封裝版本(腳位編號與 TSSOP 不同，見 datasheet Table 6-1)"
      },
      {
        "k": "抗輻射等級(TID/SEL/SEB/SEGR)",
        "v": "見 datasheet"
      }
    ],
    "secondSource": [],
    "dropIn": []
  },
  {
    "part": "TPS7H5003-SP",
    "mfr": "Texas Instruments",
    "category": "power",
    "subcategory": "太空級返馳/推挽 PWM 控制器 (Rad-Hard, QMLV)",
    "package": "24-TSSOP(PW)；另有 22-pin CFP 陶瓷扁平封裝版本(腳位編號與 TSSOP 不同，見 datasheet Table 6-1)",
    "whatIs": "TI 太空級(QMLV)返馳/推挽式(flyback/push-pull)脈寬調變(PWM)控制器，採峰值電流模式(peak current-mode)控制並具斜率補償，輸入電壓 4V~14V，可由 RT 電阻設定開關頻率並支援 SYNC 外部時脈同步；TPS7H5001-SP/5002-SP/5003-SP/5004-SP 為同系列不同輸出型態變體，共用同一份 datasheet(SLVSF07F)。",
    "func": "內部誤差放大器(VSENSE 反相輸入、COMP 輸出)搭配峰值電流模式 PWM 比較器(CS_ILIM 電流感測，相對 COMP/2 電壓含 150mV 偏移，RSC 設定斜率補償)；HICC 腳設定逐周期限流延遲與打嗝式短路保護時間(接 AVSS 可停用打嗝模式)；FAULT 腳提供獨立故障保護輸入(接 AVSS 停用)；SS 腳外接電容設定軟啟動時間，亦可用於電源軌追蹤(tracking)/時序排序(sequencing)；REFCAP 為 1.2V 內部參考(需 470nF 電容)；VLDO 為內部穩壓器輸出(需至少 1µF 電容)；EN 腳可用電阻分壓程式化輸入 UVLO；DCL 設定最大工作週期限制，各變體行為不同(見 DCL 腳說明)。",
    "usedIn": "衛星/太空酬載板上隔離或非隔離之返馳(flyback)、順向(forward)、推挽(push-pull)型 DC-DC 電源轉換器，供指揮與資料處理、通訊、光學/雷達成像、導航與科學探測酬載等太空應用之二次電源使用。",
    "desc": "24-TSSOP(PW)封裝，太空級(QMLV)峰值電流模式返馳/推挽 PWM 控制器。單主開關輸出(OUTA)，無同步整流驅動、無 PS/SP 死區設定、無 LEB，為系列中功能最精簡版本。TSSOP NC 腳位：2, 3, 4, 11, 12, 13, 14；CFP(22-pin)封裝腳位編號與 TSSOP 不同(緊密編號、無對應 TSSOP 之 NC 腳)，詳見 datasheet Table 6-1。與同系列 TPS7H5001-SP/5002-SP/5003-SP/5004-SP 差異僅在輸出型態與 PS/SP/LEB 腳位是否存在，不互為 pin-to-pin 相容，選型須依電路拓樸(是否需雙輸出、是否需同步整流)確認。",
    "datasheet": "https://www.ti.com/lit/ds/symlink/tps7h5001-sp.pdf",
    "pins": [
      {
        "num": "1",
        "name": "RT",
        "type": "io",
        "desc": "振盪頻率設定腳。使用內部振盪模式時，RT 腳須接一顆電阻至 AVSS 以設定開關頻率；RT 懸空時，SYNC 腳須輸入 200kHz~4MHz 外部時脈，且外部時脈頻率須為目標開關頻率的 2 倍。 （CFP 22-pin 封裝同為腳位 1，四顆變體皆同。）",
        "side": "L"
      },
      {
        "num": "2",
        "name": "NC",
        "type": "nc",
        "desc": "未連接(No connect)。若需避免懸浮金屬，可選擇接至 AVSS。 CFP(22-pin)封裝對應之未連接腳位集合為 2, 3, 4, 11, 12（非逐一對應，見 datasheet Table 6-1）。",
        "side": "L"
      },
      {
        "num": "3",
        "name": "NC",
        "type": "nc",
        "desc": "未連接(No connect)。若需避免懸浮金屬，可選擇接至 AVSS。 CFP(22-pin)封裝對應之未連接腳位集合為 2, 3, 4, 11, 12（非逐一對應，見 datasheet Table 6-1）。",
        "side": "L"
      },
      {
        "num": "4",
        "name": "NC",
        "type": "nc",
        "desc": "未連接(No connect)。若需避免懸浮金屬，可選擇接至 AVSS。 CFP(22-pin)封裝對應之未連接腳位集合為 2, 3, 4, 11, 12（非逐一對應，見 datasheet Table 6-1）。",
        "side": "L"
      },
      {
        "num": "5",
        "name": "HICC",
        "type": "io",
        "desc": "逐周期電流限制之延遲時間與打嗝(hiccup)時間設定腳；延遲時間與打嗝時間由 HICC 到 AVSS 的外接電容決定。此腳接 AVSS 可停用打嗝模式。 （CFP 22-pin 封裝同為腳位 5，四顆變體皆同。）",
        "side": "L"
      },
      {
        "num": "6",
        "name": "SYNC",
        "type": "io",
        "desc": "同步時脈腳。當 RT 懸空時，SYNC 作為 200kHz~4MHz 外部時脈輸入，外部時脈訊號會被反相，系統時脈以外部時脈的 1/2 頻率運作；當 RT 接電阻至 AVSS 時，SYNC 輸出與元件切換同相之 200kHz~4MHz 時脈，頻率為元件開關頻率的 2 倍。 （CFP 22-pin 封裝同為腳位 6，四顆變體皆同。）",
        "side": "L"
      },
      {
        "num": "7",
        "name": "DCL",
        "type": "io",
        "desc": "工作週期限制(duty cycle limit)設定腳。TPS7H5003-SP：可懸空或接 VLDO，分別設定最大工作週期為 75% 或 100%。 （CFP 22-pin 封裝同為腳位 7，四顆變體皆同。）",
        "side": "L"
      },
      {
        "num": "8",
        "name": "EN",
        "type": "input",
        "desc": "致能輸入。將 EN 接至 VLDO 或外部電壓源(大於 0.6V)可致能元件；另可用兩顆電阻程式化輸入欠壓鎖定(UVLO)。 （CFP 22-pin 封裝同為腳位 8，四顆變體皆同。）",
        "side": "L"
      },
      {
        "num": "9",
        "name": "VIN",
        "type": "power",
        "desc": "元件輸入電源，輸入電壓範圍 4V ~ 14V。 （CFP 22-pin 封裝同為腳位 9，四顆變體皆同。）",
        "side": "L"
      },
      {
        "num": "10",
        "name": "OUTA",
        "type": "output",
        "desc": "主開關輸出 A(Primary switching output A)。 （CFP 22-pin 封裝同為腳位 10，四顆變體皆同。）",
        "side": "L"
      },
      {
        "num": "11",
        "name": "NC",
        "type": "nc",
        "desc": "未連接(No connect)。若需避免懸浮金屬，可選擇接至 AVSS。 CFP(22-pin)封裝對應之未連接腳位集合為 2, 3, 4, 11, 12（非逐一對應，見 datasheet Table 6-1）。",
        "side": "L"
      },
      {
        "num": "12",
        "name": "NC",
        "type": "nc",
        "desc": "未連接(No connect)。若需避免懸浮金屬，可選擇接至 AVSS。 CFP(22-pin)封裝對應之未連接腳位集合為 2, 3, 4, 11, 12（非逐一對應，見 datasheet Table 6-1）。",
        "side": "L"
      },
      {
        "num": "24",
        "name": "COMP",
        "type": "io",
        "desc": "誤差放大器輸出端，於此腳連接頻率補償網路。 （CFP 22-pin 封裝腳位為 22；CFP 封裝總腳數 22，與 TSSOP 24 腳編號不同，見 datasheet Table 6-1。）",
        "side": "R"
      },
      {
        "num": "23",
        "name": "VSENSE",
        "type": "input",
        "desc": "誤差放大器反相輸入端。 （CFP 22-pin 封裝腳位為 21；CFP 封裝總腳數 22，與 TSSOP 24 腳編號不同，見 datasheet Table 6-1。）",
        "side": "R"
      },
      {
        "num": "22",
        "name": "SS",
        "type": "io",
        "desc": "軟啟動腳。外接電容至此腳可設定內部參考電壓的上升時間；此腳電壓會覆蓋內部參考電壓，可用於電源軌追蹤(tracking)與時序排序(sequencing)。 （CFP 22-pin 封裝腳位為 20；CFP 封裝總腳數 22，與 TSSOP 24 腳編號不同，見 datasheet Table 6-1。）",
        "side": "R"
      },
      {
        "num": "21",
        "name": "RSC",
        "type": "io",
        "desc": "由 RSC 到 AVSS 的電阻設定所需的斜率補償(slope compensation)。 （CFP 22-pin 封裝腳位為 19；CFP 封裝總腳數 22，與 TSSOP 24 腳編號不同，見 datasheet Table 6-1。）",
        "side": "R"
      },
      {
        "num": "20",
        "name": "REFCAP",
        "type": "output",
        "desc": "1.2V 內部參考電壓，須外接 470nF 電容至 AVSS。 （CFP 22-pin 封裝腳位為 18；CFP 封裝總腳數 22，與 TSSOP 24 腳編號不同，見 datasheet Table 6-1。）",
        "side": "R"
      },
      {
        "num": "19",
        "name": "FAULT",
        "type": "input",
        "desc": "故障保護腳。當 FAULT 腳電壓超過上升門檻時，輸出停止切換；外部電壓降至下降門檻以下後，元件會延遲一段設定時間後重新啟動。此腳接 AVSS 可停用 FAULT 功能。 （CFP 22-pin 封裝腳位為 17；CFP 封裝總腳數 22，與 TSSOP 24 腳編號不同，見 datasheet Table 6-1。）",
        "side": "R"
      },
      {
        "num": "18",
        "name": "CS_ILIM",
        "type": "io",
        "desc": "PWM 控制與逐周期過電流保護用電流感測輸入。CS_ILIM 輸入電壓超過 1.05V 會觸發 PWM 控制器過電流保護；CS_ILIM 上感測到的波形相對於 PWM 比較器輸入端的 COMP/2 電壓含 150mV 偏移。 （CFP 22-pin 封裝腳位為 16；CFP 封裝總腳數 22，與 TSSOP 24 腳編號不同，見 datasheet Table 6-1。）",
        "side": "R"
      },
      {
        "num": "17",
        "name": "VLDO",
        "type": "power",
        "desc": "內部穩壓器輸出，須外接至少 1µF 電容至 AVSS。 （CFP 22-pin 封裝腳位為 15；CFP 封裝總腳數 22，與 TSSOP 24 腳編號不同，見 datasheet Table 6-1。）",
        "side": "R"
      },
      {
        "num": "16",
        "name": "AVSS",
        "type": "ground",
        "desc": "元件接地。陶瓷封裝(CFP)版本的散熱片、蓋板與封環(seal ring)於內部連接至此接地。 （CFP 22-pin 封裝腳位為 14；CFP 封裝總腳數 22，與 TSSOP 24 腳編號不同，見 datasheet Table 6-1。）",
        "side": "R"
      },
      {
        "num": "15",
        "name": "SRA",
        "type": "output",
        "desc": "同步整流輸出 A(Synchronous rectifier output A)。 （CFP 22-pin 封裝腳位為 13；CFP 封裝總腳數 22，與 TSSOP 24 腳編號不同，見 datasheet Table 6-1。）",
        "side": "R"
      },
      {
        "num": "14",
        "name": "NC",
        "type": "nc",
        "desc": "未連接(No connect)。若需避免懸浮金屬，可選擇接至 AVSS。 CFP(22-pin)封裝對應之未連接腳位集合為 2, 3, 4, 11, 12（非逐一對應，見 datasheet Table 6-1）。",
        "side": "R"
      },
      {
        "num": "13",
        "name": "NC",
        "type": "nc",
        "desc": "未連接(No connect)。若需避免懸浮金屬，可選擇接至 AVSS。 CFP(22-pin)封裝對應之未連接腳位集合為 2, 3, 4, 11, 12（非逐一對應，見 datasheet Table 6-1）。",
        "side": "R"
      }
    ],
    "specs": [
      {
        "k": "輸出型態",
        "v": "單主開關輸出(OUTA)，無同步整流驅動、無 PS/SP 死區設定、無 LEB，為系列中功能最精簡版本"
      },
      {
        "k": "輸入電壓",
        "v": "4V ~ 14V (VIN)"
      },
      {
        "k": "控制方式",
        "v": "峰值電流模式(peak current-mode)，RSC 外接電阻設定斜率補償"
      },
      {
        "k": "開關頻率設定",
        "v": "RT 電阻設定；RT 懸空時可由 SYNC 輸入 200kHz~4MHz 外部時脈(為開關頻率 2 倍)"
      },
      {
        "k": "工作週期限制(DCL)",
        "v": "可懸空或接 VLDO，分別設定最大工作週期為 75% 或 100%。"
      },
      {
        "k": "過電流保護",
        "v": "CS_ILIM > 1.05V 觸發逐周期過流保護，感測波形相對 COMP/2 含 150mV 偏移"
      },
      {
        "k": "短路保護",
        "v": "HICC 腳電容設定延遲/打嗝時間，接 AVSS 停用打嗝模式"
      },
      {
        "k": "故障保護",
        "v": "FAULT 腳獨立故障輸入，超過上升門檻停止切換，接 AVSS 停用"
      },
      {
        "k": "內部參考",
        "v": "REFCAP 1.2V，需 470nF 電容"
      },
      {
        "k": "內部穩壓器",
        "v": "VLDO 輸出，需至少 1µF 電容"
      },
      {
        "k": "軟啟動/追蹤",
        "v": "SS 外接電容設定軟啟動時間，可用於 tracking/sequencing"
      },
      {
        "k": "封裝",
        "v": "24-TSSOP(PW)；另有 22-pin CFP 陶瓷扁平封裝版本(腳位編號與 TSSOP 不同，見 datasheet Table 6-1)"
      },
      {
        "k": "抗輻射等級(TID/SEL/SEB/SEGR)",
        "v": "見 datasheet"
      }
    ],
    "secondSource": [],
    "dropIn": []
  },
  {
    "part": "TPS7H5004-SP",
    "mfr": "Texas Instruments",
    "category": "power",
    "subcategory": "太空級返馳/推挽 PWM 控制器 (Rad-Hard, QMLV)",
    "package": "24-TSSOP(PW)；另有 22-pin CFP 陶瓷扁平封裝版本(腳位編號與 TSSOP 不同，見 datasheet Table 6-1)",
    "whatIs": "TI 太空級(QMLV)返馳/推挽式(flyback/push-pull)脈寬調變(PWM)控制器，採峰值電流模式(peak current-mode)控制並具斜率補償，輸入電壓 4V~14V，可由 RT 電阻設定開關頻率並支援 SYNC 外部時脈同步；TPS7H5001-SP/5002-SP/5003-SP/5004-SP 為同系列不同輸出型態變體，共用同一份 datasheet(SLVSF07F)。",
    "func": "內部誤差放大器(VSENSE 反相輸入、COMP 輸出)搭配峰值電流模式 PWM 比較器(CS_ILIM 電流感測，相對 COMP/2 電壓含 150mV 偏移，RSC 設定斜率補償)；HICC 腳設定逐周期限流延遲與打嗝式短路保護時間(接 AVSS 可停用打嗝模式)；FAULT 腳提供獨立故障保護輸入(接 AVSS 停用)；SS 腳外接電容設定軟啟動時間，亦可用於電源軌追蹤(tracking)/時序排序(sequencing)；REFCAP 為 1.2V 內部參考(需 470nF 電容)；VLDO 為內部穩壓器輸出(需至少 1µF 電容)；EN 腳可用電阻分壓程式化輸入 UVLO；DCL 設定最大工作週期限制，各變體行為不同(見 DCL 腳說明)。",
    "usedIn": "衛星/太空酬載板上隔離或非隔離之返馳(flyback)、順向(forward)、推挽(push-pull)型 DC-DC 電源轉換器，供指揮與資料處理、通訊、光學/雷達成像、導航與科學探測酬載等太空應用之二次電源使用。",
    "desc": "24-TSSOP(PW)封裝，太空級(QMLV)峰值電流模式返馳/推挽 PWM 控制器。雙主開關輸出(OUTA/OUTB)，無同步整流驅動，DCL 須接 AVSS 固定為 50% 工作週期限制。TSSOP NC 腳位：2, 3, 12, 13, 14, 15；CFP(22-pin)封裝腳位編號與 TSSOP 不同(緊密編號、無對應 TSSOP 之 NC 腳)，詳見 datasheet Table 6-1。與同系列 TPS7H5001-SP/5002-SP/5003-SP/5004-SP 差異僅在輸出型態與 PS/SP/LEB 腳位是否存在，不互為 pin-to-pin 相容，選型須依電路拓樸(是否需雙輸出、是否需同步整流)確認。",
    "datasheet": "https://www.ti.com/lit/ds/symlink/tps7h5001-sp.pdf",
    "pins": [
      {
        "num": "1",
        "name": "RT",
        "type": "io",
        "desc": "振盪頻率設定腳。使用內部振盪模式時，RT 腳須接一顆電阻至 AVSS 以設定開關頻率；RT 懸空時，SYNC 腳須輸入 200kHz~4MHz 外部時脈，且外部時脈頻率須為目標開關頻率的 2 倍。 （CFP 22-pin 封裝同為腳位 1，四顆變體皆同。）",
        "side": "L"
      },
      {
        "num": "2",
        "name": "NC",
        "type": "nc",
        "desc": "未連接(No connect)。若需避免懸浮金屬，可選擇接至 AVSS。 CFP(22-pin)封裝對應之未連接腳位集合為 2, 3, 12, 13（非逐一對應，見 datasheet Table 6-1）。",
        "side": "L"
      },
      {
        "num": "3",
        "name": "NC",
        "type": "nc",
        "desc": "未連接(No connect)。若需避免懸浮金屬，可選擇接至 AVSS。 CFP(22-pin)封裝對應之未連接腳位集合為 2, 3, 12, 13（非逐一對應，見 datasheet Table 6-1）。",
        "side": "L"
      },
      {
        "num": "4",
        "name": "LEB",
        "type": "io",
        "desc": "前緣消隱(leading edge blank)時間設定腳，透過外接電阻至 AVSS 程式化。 （CFP 22-pin 封裝同為腳位 4，四顆變體皆同。）",
        "side": "L"
      },
      {
        "num": "5",
        "name": "HICC",
        "type": "io",
        "desc": "逐周期電流限制之延遲時間與打嗝(hiccup)時間設定腳；延遲時間與打嗝時間由 HICC 到 AVSS 的外接電容決定。此腳接 AVSS 可停用打嗝模式。 （CFP 22-pin 封裝同為腳位 5，四顆變體皆同。）",
        "side": "L"
      },
      {
        "num": "6",
        "name": "SYNC",
        "type": "io",
        "desc": "同步時脈腳。當 RT 懸空時，SYNC 作為 200kHz~4MHz 外部時脈輸入，外部時脈訊號會被反相，系統時脈以外部時脈的 1/2 頻率運作；當 RT 接電阻至 AVSS 時，SYNC 輸出與元件切換同相之 200kHz~4MHz 時脈，頻率為元件開關頻率的 2 倍。 （CFP 22-pin 封裝同為腳位 6，四顆變體皆同。）",
        "side": "L"
      },
      {
        "num": "7",
        "name": "DCL",
        "type": "io",
        "desc": "工作週期限制(duty cycle limit)設定腳。TPS7H5004-SP：此腳須接 AVSS 以獲得 50% 最大工作週期限制。 （CFP 22-pin 封裝同為腳位 7，四顆變體皆同。）",
        "side": "L"
      },
      {
        "num": "8",
        "name": "EN",
        "type": "input",
        "desc": "致能輸入。將 EN 接至 VLDO 或外部電壓源(大於 0.6V)可致能元件；另可用兩顆電阻程式化輸入欠壓鎖定(UVLO)。 （CFP 22-pin 封裝同為腳位 8，四顆變體皆同。）",
        "side": "L"
      },
      {
        "num": "9",
        "name": "VIN",
        "type": "power",
        "desc": "元件輸入電源，輸入電壓範圍 4V ~ 14V。 （CFP 22-pin 封裝同為腳位 9，四顆變體皆同。）",
        "side": "L"
      },
      {
        "num": "10",
        "name": "OUTA",
        "type": "output",
        "desc": "主開關輸出 A(Primary switching output A)。 （CFP 22-pin 封裝同為腳位 10，四顆變體皆同。）",
        "side": "L"
      },
      {
        "num": "11",
        "name": "OUTB",
        "type": "output",
        "desc": "主開關輸出 B(Primary switching output B)，僅當 DCL = AVSS 時動作。 （CFP 22-pin 封裝同為腳位 11，四顆變體皆同。）",
        "side": "L"
      },
      {
        "num": "12",
        "name": "NC",
        "type": "nc",
        "desc": "未連接(No connect)。若需避免懸浮金屬，可選擇接至 AVSS。 CFP(22-pin)封裝對應之未連接腳位集合為 2, 3, 12, 13（非逐一對應，見 datasheet Table 6-1）。",
        "side": "L"
      },
      {
        "num": "24",
        "name": "COMP",
        "type": "io",
        "desc": "誤差放大器輸出端，於此腳連接頻率補償網路。 （CFP 22-pin 封裝腳位為 22；CFP 封裝總腳數 22，與 TSSOP 24 腳編號不同，見 datasheet Table 6-1。）",
        "side": "R"
      },
      {
        "num": "23",
        "name": "VSENSE",
        "type": "input",
        "desc": "誤差放大器反相輸入端。 （CFP 22-pin 封裝腳位為 21；CFP 封裝總腳數 22，與 TSSOP 24 腳編號不同，見 datasheet Table 6-1。）",
        "side": "R"
      },
      {
        "num": "22",
        "name": "SS",
        "type": "io",
        "desc": "軟啟動腳。外接電容至此腳可設定內部參考電壓的上升時間；此腳電壓會覆蓋內部參考電壓，可用於電源軌追蹤(tracking)與時序排序(sequencing)。 （CFP 22-pin 封裝腳位為 20；CFP 封裝總腳數 22，與 TSSOP 24 腳編號不同，見 datasheet Table 6-1。）",
        "side": "R"
      },
      {
        "num": "21",
        "name": "RSC",
        "type": "io",
        "desc": "由 RSC 到 AVSS 的電阻設定所需的斜率補償(slope compensation)。 （CFP 22-pin 封裝腳位為 19；CFP 封裝總腳數 22，與 TSSOP 24 腳編號不同，見 datasheet Table 6-1。）",
        "side": "R"
      },
      {
        "num": "20",
        "name": "REFCAP",
        "type": "output",
        "desc": "1.2V 內部參考電壓，須外接 470nF 電容至 AVSS。 （CFP 22-pin 封裝腳位為 18；CFP 封裝總腳數 22，與 TSSOP 24 腳編號不同，見 datasheet Table 6-1。）",
        "side": "R"
      },
      {
        "num": "19",
        "name": "FAULT",
        "type": "input",
        "desc": "故障保護腳。當 FAULT 腳電壓超過上升門檻時，輸出停止切換；外部電壓降至下降門檻以下後，元件會延遲一段設定時間後重新啟動。此腳接 AVSS 可停用 FAULT 功能。 （CFP 22-pin 封裝腳位為 17；CFP 封裝總腳數 22，與 TSSOP 24 腳編號不同，見 datasheet Table 6-1。）",
        "side": "R"
      },
      {
        "num": "18",
        "name": "CS_ILIM",
        "type": "io",
        "desc": "PWM 控制與逐周期過電流保護用電流感測輸入。CS_ILIM 輸入電壓超過 1.05V 會觸發 PWM 控制器過電流保護；CS_ILIM 上感測到的波形相對於 PWM 比較器輸入端的 COMP/2 電壓含 150mV 偏移。 （CFP 22-pin 封裝腳位為 16；CFP 封裝總腳數 22，與 TSSOP 24 腳編號不同，見 datasheet Table 6-1。）",
        "side": "R"
      },
      {
        "num": "17",
        "name": "VLDO",
        "type": "power",
        "desc": "內部穩壓器輸出，須外接至少 1µF 電容至 AVSS。 （CFP 22-pin 封裝腳位為 15；CFP 封裝總腳數 22，與 TSSOP 24 腳編號不同，見 datasheet Table 6-1。）",
        "side": "R"
      },
      {
        "num": "16",
        "name": "AVSS",
        "type": "ground",
        "desc": "元件接地。陶瓷封裝(CFP)版本的散熱片、蓋板與封環(seal ring)於內部連接至此接地。 （CFP 22-pin 封裝腳位為 14；CFP 封裝總腳數 22，與 TSSOP 24 腳編號不同，見 datasheet Table 6-1。）",
        "side": "R"
      },
      {
        "num": "15",
        "name": "NC",
        "type": "nc",
        "desc": "未連接(No connect)。若需避免懸浮金屬，可選擇接至 AVSS。 CFP(22-pin)封裝對應之未連接腳位集合為 2, 3, 12, 13（非逐一對應，見 datasheet Table 6-1）。",
        "side": "R"
      },
      {
        "num": "14",
        "name": "NC",
        "type": "nc",
        "desc": "未連接(No connect)。若需避免懸浮金屬，可選擇接至 AVSS。 CFP(22-pin)封裝對應之未連接腳位集合為 2, 3, 12, 13（非逐一對應，見 datasheet Table 6-1）。",
        "side": "R"
      },
      {
        "num": "13",
        "name": "NC",
        "type": "nc",
        "desc": "未連接(No connect)。若需避免懸浮金屬，可選擇接至 AVSS。 CFP(22-pin)封裝對應之未連接腳位集合為 2, 3, 12, 13（非逐一對應，見 datasheet Table 6-1）。",
        "side": "R"
      }
    ],
    "specs": [
      {
        "k": "輸出型態",
        "v": "雙主開關輸出(OUTA/OUTB)，無同步整流驅動，DCL 須接 AVSS 固定為 50% 工作週期限制"
      },
      {
        "k": "輸入電壓",
        "v": "4V ~ 14V (VIN)"
      },
      {
        "k": "控制方式",
        "v": "峰值電流模式(peak current-mode)，RSC 外接電阻設定斜率補償"
      },
      {
        "k": "開關頻率設定",
        "v": "RT 電阻設定；RT 懸空時可由 SYNC 輸入 200kHz~4MHz 外部時脈(為開關頻率 2 倍)"
      },
      {
        "k": "工作週期限制(DCL)",
        "v": "此腳須接 AVSS 以獲得 50% 最大工作週期限制。"
      },
      {
        "k": "過電流保護",
        "v": "CS_ILIM > 1.05V 觸發逐周期過流保護，感測波形相對 COMP/2 含 150mV 偏移"
      },
      {
        "k": "短路保護",
        "v": "HICC 腳電容設定延遲/打嗝時間，接 AVSS 停用打嗝模式"
      },
      {
        "k": "故障保護",
        "v": "FAULT 腳獨立故障輸入，超過上升門檻停止切換，接 AVSS 停用"
      },
      {
        "k": "內部參考",
        "v": "REFCAP 1.2V，需 470nF 電容"
      },
      {
        "k": "內部穩壓器",
        "v": "VLDO 輸出，需至少 1µF 電容"
      },
      {
        "k": "軟啟動/追蹤",
        "v": "SS 外接電容設定軟啟動時間，可用於 tracking/sequencing"
      },
      {
        "k": "封裝",
        "v": "24-TSSOP(PW)；另有 22-pin CFP 陶瓷扁平封裝版本(腳位編號與 TSSOP 不同，見 datasheet Table 6-1)"
      },
      {
        "k": "抗輻射等級(TID/SEL/SEB/SEGR)",
        "v": "見 datasheet"
      }
    ],
    "secondSource": [],
    "dropIn": []
  },
  {
    "part": "TPS25751A",
    "mfr": "Texas Instruments",
    "category": "power",
    "subcategory": "USB Type-C / USB PD 控制器(外接電源路徑 MOSFET 閘極驅動，32-QFN S 版)",
    "package": "32-QFN(S 版，本條目)；封裝代碼與確切尺寸見 datasheet(TI SLVSJG7)；另有 38-QFN(D 版，TPS25751AD)",
    "whatIs": "USB Type-C 與 USB Power Delivery(PD)控制器：整合 PD 協議引擎與電源路徑保護，並提供豐富的 GPIO 與雙 I2C(target/controller)介面，用於系統對 PD 埠狀態的監控與擴充。",
    "func": "TPS25751A 是高整合度 USB Type-C/PD 控制器，透過電阻分壓在 ADCIN1/ADCIN2 等腳位做 pin strapping 設定 PD 參數。提供多組通用 GPIO(GPIO0~GPIO7、GPIO11，部分與 LD1/LD2 液體偵測、USB_P/USB_N BC1.2 共用)。具備雙 I2C 介面：I2Ct_SCL/I2Ct_SDA/I2Ct_IRQ 為 I2C target，供外部 MCU 讀取/覆寫設定；I2Cc_SCL/I2Cc_SDA/I2Cc_IRQ 為 I2C controller，可由本裝置作為主機存取其他 I2C 周邊。內建 3.3V LDO(LDO_3V3)與 1.5V 核心 LDO(LDO_1V5)。本條目為 32-QFN 的 TPS25751AS 版本，以 GATE_VBUS/GATE_VSYS 驅動外部 N 型 MOSFET 構成電源路徑(需外接 FET)，並以 VSYS/GATE_VSYS 實作逆電流保護(RCP)；同系列另有 38-QFN 的 TPS25751AD 版本，內建 PPHV/VBUS_IN/DRAIN 等整合式電源開關腳(免外接 FET)，兩版本腳位數(32 對 38)與腳位名稱皆不同，不可互換。確切 PD 規範版本、sink-only 或 dual-role 支援等功能細節見 datasheet(TI SLVSJG7)。",
    "usedIn": "需要豐富 GPIO 與雙 I2C 擴充能力的 USB-C PD 受電應用，如筆電、顯示器等系統的 PD 埠控制器；實際應用範圍見 datasheet。",
    "desc": "32-QFN 封裝，TPS25751A 的 S 版本，以 GATE_VBUS/GATE_VSYS 驅動外部 N 型 MOSFET 構成電源路徑。同系列 38-QFN(D 版，TPS25751AD)腳位數(38)與名稱皆不同(內建整合式 FET，含 PPHV/VBUS_IN/DRAIN 腳)，兩封裝 pinout 不相容，不可直接互換。與同封裝家族的 TPS25752A(32-QFN)腳位編號與名稱經逐一核對完全相同，惟兩者實際 PD 功能規格(如 EPR/PPS 支援版本)可能不同，選型仍須依 datasheet 功能表確認。",
    "datasheet": "https://www.ti.com/lit/ds/symlink/tps25751a.pdf",
    "pins": [
      {
        "num": "1",
        "name": "LDO_3V3",
        "side": "L",
        "type": "Output",
        "desc": "由 VIN_3V3 或 VBUS LDO 切換而來的供電輸出；旁路電容 CLDO_3V3 至 GND。"
      },
      {
        "num": "2",
        "name": "ADCIN1",
        "side": "L",
        "type": "Input",
        "desc": "設定輸入(pin strap)；接電阻分壓器至 LDO_3V3。"
      },
      {
        "num": "3",
        "name": "ADCIN2",
        "side": "L",
        "type": "Input",
        "desc": "設定輸入(pin strap)；接電阻分壓器至 LDO_3V3。"
      },
      {
        "num": "4",
        "name": "LDO_1V5",
        "side": "L",
        "type": "Output",
        "desc": "核心(CORE)LDO 輸出；旁路電容 CLDO_1V5 至 GND；此腳無法對外部電路提供電流。"
      },
      {
        "num": "5",
        "name": "GPIO0/LD1",
        "side": "L",
        "type": "I/O",
        "desc": "通用數位 I/O；可設定為 Type-C 連接器液體偵測(liquid detection)功能。未使用時接地。"
      },
      {
        "num": "6",
        "name": "GPIO1",
        "side": "L",
        "type": "I/O",
        "desc": "通用數位 I/O。未使用時接地。"
      },
      {
        "num": "7",
        "name": "GPIO2/LD2",
        "side": "L",
        "type": "I/O",
        "desc": "通用數位 I/O；可設定為 Type-C 連接器液體偵測(liquid detection)功能。未使用時接地。"
      },
      {
        "num": "8",
        "name": "I2Ct_SDA",
        "side": "L",
        "type": "I/O",
        "desc": "I2C target 序列資料，開集(open-drain)雙向；經電阻接上拉電源，未使用時接地。"
      },
      {
        "num": "9",
        "name": "I2Ct_SCL",
        "side": "B",
        "type": "Input",
        "desc": "I2C target 序列時脈輸入；經電阻接上拉電源，未使用時接地。"
      },
      {
        "num": "10",
        "name": "I2Ct_IRQ",
        "side": "B",
        "type": "Output",
        "desc": "I2C target 中斷輸出，開集、低態動作(active low)；經上拉電阻接外部電源；可重設為 GPIO10；未使用時接地。"
      },
      {
        "num": "11",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "接地，連接至接地平面。"
      },
      {
        "num": "12",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "接地，連接至接地平面。"
      },
      {
        "num": "13",
        "name": "GPIO11",
        "side": "B",
        "type": "I/O",
        "desc": "通用數位 I/O。未使用時接地。"
      },
      {
        "num": "14",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "接地，連接至接地平面。"
      },
      {
        "num": "15",
        "name": "I2Cc_SDA",
        "side": "B",
        "type": "I/O",
        "desc": "I2C controller 序列資料，開集雙向；經電阻接上拉電源。"
      },
      {
        "num": "16",
        "name": "I2Cc_SCL",
        "side": "B",
        "type": "Output",
        "desc": "I2C controller 序列時脈，開集輸出；經電阻接上拉電源。"
      },
      {
        "num": "17",
        "name": "I2Cc_IRQ",
        "side": "R",
        "type": "Input",
        "desc": "I2C controller 中斷輸入，低態動作；經上拉電阻接外部電源；未使用時不可接地；可重設為 GPIO12。"
      },
      {
        "num": "18",
        "name": "GPIO3",
        "side": "R",
        "type": "I/O",
        "desc": "通用數位 I/O。未使用時接地。"
      },
      {
        "num": "19",
        "name": "VSYS",
        "side": "R",
        "type": "Input",
        "desc": "系統側高壓感測節點；為系統中的高壓 sinking 節點；用於對 GATE_VSYS 所控制的外部受電路徑實作逆電流保護(RCP)。"
      },
      {
        "num": "20",
        "name": "GATE_VSYS",
        "side": "R",
        "type": "Output",
        "desc": "接至源極(source)接 VSYS 的 N 型 MOSFET 閘極。"
      },
      {
        "num": "21",
        "name": "GATE_VBUS",
        "side": "R",
        "type": "Output",
        "desc": "接至源極(source)接 VBUS 的 N 型 MOSFET 閘極。"
      },
      {
        "num": "22",
        "name": "GPIO4/USB_P",
        "side": "R",
        "type": "I/O",
        "desc": "通用數位 I/O；可接至 D+ 供 BC1.2 偵測使用。未使用時接地。"
      },
      {
        "num": "23",
        "name": "GPIO5/USB_N",
        "side": "R",
        "type": "I/O",
        "desc": "通用數位 I/O；可接至 D- 供 BC1.2 偵測使用。未使用時接地。"
      },
      {
        "num": "24",
        "name": "CC1",
        "side": "R",
        "type": "I/O",
        "desc": "USB Type-C 的 CC I/O；接建議電容(CCC)至 GND 濾除雜訊。"
      },
      {
        "num": "25",
        "name": "CC2",
        "side": "T",
        "type": "I/O",
        "desc": "USB Type-C 的 CC I/O；接建議電容(CCC)至 GND 濾除雜訊。"
      },
      {
        "num": "26",
        "name": "VBUS",
        "side": "T",
        "type": "I/O",
        "desc": "5V~20V 輸入；旁路電容 CVBUS 至 GND。"
      },
      {
        "num": "27",
        "name": "VBUS",
        "side": "T",
        "type": "I/O",
        "desc": "5V~20V 輸入；旁路電容 CVBUS 至 GND。"
      },
      {
        "num": "28",
        "name": "PP5V",
        "side": "T",
        "type": "Input",
        "desc": "5V 系統供電至 VBUS，並作為 CCy 腳位的 VCONN 供電來源。"
      },
      {
        "num": "29",
        "name": "PP5V",
        "side": "T",
        "type": "Input",
        "desc": "5V 系統供電至 VBUS，並作為 CCy 腳位的 VCONN 供電來源。"
      },
      {
        "num": "30",
        "name": "GPIO7",
        "side": "T",
        "type": "I/O",
        "desc": "通用數位 I/O。未使用時接地。"
      },
      {
        "num": "31",
        "name": "GPIO6",
        "side": "T",
        "type": "I/O",
        "desc": "通用數位 I/O。未使用時接地。"
      },
      {
        "num": "32",
        "name": "VIN_3V3",
        "side": "T",
        "type": "Input",
        "desc": "核心電路與 I/O 供電；旁路電容 CVIN_3V3 至 GND；若裝置僅由 VBUS 供電則此腳接地。"
      },
      {
        "num": "33",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "外露散熱墊(Thermal Pad)，Figure 5-2(S 封裝)標示接 GND；建議焊接至 PCB 接地銅箔並搭配散熱過孔以利散熱。",
        "ep": true
      }
    ],
    "thermalPad": "外露散熱墊(Thermal Pad)，Figure 5-2(S 封裝，32-QFN)標示接 GND；建議焊接至 PCB 接地銅箔並搭配散熱過孔以利散熱。",
    "specs": [
      {
        "k": "封裝版本",
        "v": "S 版(32-QFN，本條目)以 GATE_VBUS/GATE_VSYS 驅動外部 N 型 MOSFET；D 版(38-QFN)內建整合式電源開關(PPHV/VBUS_IN/DRAIN)"
      },
      {
        "k": "設定方式",
        "v": "電阻分壓 pin strapping(ADCIN1/ADCIN2)"
      },
      {
        "k": "GPIO 數量",
        "v": "12 組(GPIO0~GPIO7、GPIO11，部分與 LD1/LD2、USB_P/USB_N 共用)"
      },
      {
        "k": "通訊介面",
        "v": "I2C target(I2Ct_SCL/I2Ct_SDA/I2Ct_IRQ) + I2C controller(I2Cc_SCL/I2Cc_SDA/I2Cc_IRQ)"
      },
      {
        "k": "內建 LDO",
        "v": "3.3V(LDO_3V3) / 1.5V 核心(LDO_1V5)"
      },
      {
        "k": "VBUS 輸入範圍(絕對最大)",
        "v": "-0.3V~28V"
      },
      {
        "k": "CC1/CC2 輸入範圍(絕對最大)",
        "v": "-0.5V~26V"
      },
      {
        "k": "工作接面溫度",
        "v": "-40°C~175°C"
      },
      {
        "k": "封裝",
        "v": "S 版 32-QFN(本條目)；D 版 38-QFN；確切封裝代碼與尺寸見 datasheet"
      }
    ],
    "secondSource": [
      "封裝+pinout 須為 32-QFN S 版且逐腳相同(pin-to-pin)；D 版(38-QFN)不可混用",
      "pin strapping 設定邏輯與電阻對照表須一致(ADCIN1/ADCIN2)",
      "GPIO 功能與極性(GPIO0~GPIO7、GPIO11)須相容，含 LD1/LD2、BC1.2 USB_P/USB_N 共用功能",
      "I2C target 與 I2C controller 之位址、暫存器映射須相容",
      "外部 MOSFET 閘極驅動能力(GATE_VBUS/GATE_VSYS)同等或更佳",
      "PD 規範版本與 EPR/PPS 等功能支援需另行核對 datasheet"
    ],
    "dropIn": [
      {
        "part": "TPS25752A",
        "note": "32-QFN 腳位編號與名稱逐腳核對完全相同(pin-to-pin)；惟 PD 功能規格版本可能不同，system-level 相容性須另行確認 datasheet。"
      }
    ]
  },
  {
    "part": "TPS25752A",
    "mfr": "Texas Instruments",
    "category": "power",
    "subcategory": "USB Type-C / USB PD 控制器(外接電源路徑 MOSFET 閘極驅動，32-QFN RSM)",
    "package": "32-QFN(RSM) 4.00mm × 4.00mm",
    "whatIs": "USB Type-C 與 USB PD 控制器：整合 PD 協議引擎與電源路徑保護，並提供豐富 GPIO 與雙 I2C(target/controller)介面。",
    "func": "TPS25752A 為 32-QFN(RSM)單封裝版本的 USB Type-C/PD 控制器，pin strapping(ADCIN1/ADCIN2)、GPIO(GPIO0~GPIO7、GPIO11)、雙 I2C 介面與電源路徑架構(GATE_VBUS/GATE_VSYS 驅動外部 N 型 MOSFET)與同封裝家族的 TPS25751A(S 版)逐腳核對相同。VSYS(腳19)datasheet 僅標示為系統側高壓感測節點，未如 TPS25751A 詳述逆電流保護(RCP)機制的說明文字，功能細節以 datasheet 為準。確切支援的 PD 規範版本、電流/功率能力等見 datasheet(TI SLVSJH0)。",
    "usedIn": "USB-C PD 受電應用，需要外接 N 型 MOSFET 構成電源路徑並具備豐富 GPIO/I2C 擴充能力的系統，如筆電、顯示器、行動電源等；實際應用範圍見 datasheet。",
    "desc": "32-QFN(RSM)封裝。經逐腳核對，pin 編號與名稱與同封裝家族的 TPS25751A(S 版)完全相同；惟兩者實際 PD 功能規格(EPR/PPS 支援版本等)可能不同，選型仍須依各自 datasheet 功能表確認。",
    "datasheet": "https://www.ti.com/lit/ds/symlink/tps25752a.pdf",
    "pins": [
      {
        "num": "1",
        "name": "LDO_3V3",
        "side": "L",
        "type": "Output",
        "desc": "由 VIN_3V3 或 VBUS LDO 切換而來的供電輸出；旁路電容 CLDO_3V3 至 GND。"
      },
      {
        "num": "2",
        "name": "ADCIN1",
        "side": "L",
        "type": "Input",
        "desc": "設定輸入(pin strap)；接電阻分壓器至 LDO_3V3。"
      },
      {
        "num": "3",
        "name": "ADCIN2",
        "side": "L",
        "type": "Input",
        "desc": "設定輸入(pin strap)；接電阻分壓器至 LDO_3V3。"
      },
      {
        "num": "4",
        "name": "LDO_1V5",
        "side": "L",
        "type": "Output",
        "desc": "核心(CORE)LDO 輸出；旁路電容 CLDO_1V5 至 GND；此腳無法對外部電路提供電流。"
      },
      {
        "num": "5",
        "name": "GPIO0/LD1",
        "side": "L",
        "type": "I/O",
        "desc": "通用數位 I/O；可設定為 Type-C 連接器液體偵測(liquid detection)功能。未使用時接地。"
      },
      {
        "num": "6",
        "name": "GPIO1",
        "side": "L",
        "type": "I/O",
        "desc": "通用數位 I/O。未使用時接地。"
      },
      {
        "num": "7",
        "name": "GPIO2/LD2",
        "side": "L",
        "type": "I/O",
        "desc": "通用數位 I/O；可設定為 Type-C 連接器液體偵測(liquid detection)功能。未使用時接地。"
      },
      {
        "num": "8",
        "name": "I2Ct_SDA",
        "side": "L",
        "type": "I/O",
        "desc": "I2C target 序列資料，開集(open-drain)雙向；經電阻接上拉電源，未使用時接地。"
      },
      {
        "num": "9",
        "name": "I2Ct_SCL",
        "side": "B",
        "type": "Input",
        "desc": "I2C target 序列時脈輸入；經電阻接上拉電源，未使用時接地。"
      },
      {
        "num": "10",
        "name": "I2Ct_IRQ",
        "side": "B",
        "type": "Output",
        "desc": "I2C target 中斷輸出，開集、低態動作(active low)；經上拉電阻接外部電源；可重設為 GPIO10；未使用時接地。"
      },
      {
        "num": "11",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "接地，連接至接地平面。"
      },
      {
        "num": "12",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "接地，連接至接地平面。"
      },
      {
        "num": "13",
        "name": "GPIO11",
        "side": "B",
        "type": "I/O",
        "desc": "通用數位 I/O。未使用時接地。"
      },
      {
        "num": "14",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "接地，連接至接地平面。"
      },
      {
        "num": "15",
        "name": "I2Cc_SDA",
        "side": "B",
        "type": "I/O",
        "desc": "I2C controller 序列資料，開集雙向；經電阻接上拉電源。"
      },
      {
        "num": "16",
        "name": "I2Cc_SCL",
        "side": "B",
        "type": "Output",
        "desc": "I2C controller 序列時脈，開集輸出；經電阻接上拉電源。"
      },
      {
        "num": "17",
        "name": "I2Cc_IRQ",
        "side": "R",
        "type": "Input",
        "desc": "I2C controller 中斷輸入，低態動作；經上拉電阻接外部電源；未使用時不可接地；可重設為 GPIO12。"
      },
      {
        "num": "18",
        "name": "GPIO3",
        "side": "R",
        "type": "I/O",
        "desc": "通用數位 I/O。未使用時接地。"
      },
      {
        "num": "19",
        "name": "VSYS",
        "side": "R",
        "type": "Input",
        "desc": "系統側高壓感測節點。"
      },
      {
        "num": "20",
        "name": "GATE_VSYS",
        "side": "R",
        "type": "Output",
        "desc": "接至源極(source)接 VSYS 的 N 型 MOSFET 閘極。"
      },
      {
        "num": "21",
        "name": "GATE_VBUS",
        "side": "R",
        "type": "Output",
        "desc": "接至源極(source)接 VBUS 的 N 型 MOSFET 閘極。"
      },
      {
        "num": "22",
        "name": "GPIO4/USB_P",
        "side": "R",
        "type": "I/O",
        "desc": "通用數位 I/O；可接至 D+ 供 BC1.2 偵測使用。未使用時接地。"
      },
      {
        "num": "23",
        "name": "GPIO5/USB_N",
        "side": "R",
        "type": "I/O",
        "desc": "通用數位 I/O；可接至 D- 供 BC1.2 偵測使用。未使用時接地。"
      },
      {
        "num": "24",
        "name": "CC1",
        "side": "R",
        "type": "I/O",
        "desc": "USB Type-C 的 CC I/O；接建議電容(CCC)至 GND 濾除雜訊。"
      },
      {
        "num": "25",
        "name": "CC2",
        "side": "T",
        "type": "I/O",
        "desc": "USB Type-C 的 CC I/O；接建議電容(CCC)至 GND 濾除雜訊。"
      },
      {
        "num": "26",
        "name": "VBUS",
        "side": "T",
        "type": "I/O",
        "desc": "5V~20V 輸入；旁路電容 CVBUS 至 GND。"
      },
      {
        "num": "27",
        "name": "VBUS",
        "side": "T",
        "type": "I/O",
        "desc": "5V~20V 輸入；旁路電容 CVBUS 至 GND。"
      },
      {
        "num": "28",
        "name": "PP5V",
        "side": "T",
        "type": "Input",
        "desc": "5V 系統供電至 VBUS，並作為 CCy 腳位的 VCONN 供電來源。"
      },
      {
        "num": "29",
        "name": "PP5V",
        "side": "T",
        "type": "Input",
        "desc": "5V 系統供電至 VBUS，並作為 CCy 腳位的 VCONN 供電來源。"
      },
      {
        "num": "30",
        "name": "GPIO7",
        "side": "T",
        "type": "I/O",
        "desc": "通用數位 I/O。未使用時接地。"
      },
      {
        "num": "31",
        "name": "GPIO6",
        "side": "T",
        "type": "I/O",
        "desc": "通用數位 I/O。未使用時接地。"
      },
      {
        "num": "32",
        "name": "VIN_3V3",
        "side": "T",
        "type": "Input",
        "desc": "核心電路與 I/O 供電；旁路電容 CVIN_3V3 至 GND；若裝置僅由 VBUS 供電則此腳接地。"
      },
      {
        "num": "33",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "外露散熱墊(Thermal Pad)，比照同封裝家族(RSM)之 TPS25730A/TPS25751AS 慣例標示接 GND；本次擷取頁面(Table 4-1、Thermal Information)未含 Pin Configuration 圖，正式接地方式請以 datasheet Figure 為準。",
        "ep": true
      }
    ],
    "thermalPad": "外露散熱墊(Thermal Pad)，比照同封裝家族(RSM)之 TPS25730A/TPS25751AS 慣例標示接 GND；本次擷取頁面未含 Pin Configuration 圖，正式設計請以 datasheet Figure 為準。",
    "specs": [
      {
        "k": "封裝",
        "v": "32-QFN(RSM) 4.00mm × 4.00mm"
      },
      {
        "k": "設定方式",
        "v": "電阻分壓 pin strapping(ADCIN1/ADCIN2)"
      },
      {
        "k": "GPIO 數量",
        "v": "12 組(GPIO0~GPIO7、GPIO11，部分與 LD1/LD2、USB_P/USB_N 共用)"
      },
      {
        "k": "通訊介面",
        "v": "I2C target(I2Ct_SCL/I2Ct_SDA/I2Ct_IRQ) + I2C controller(I2Cc_SCL/I2Cc_SDA/I2Cc_IRQ)"
      },
      {
        "k": "內建 LDO",
        "v": "3.3V(LDO_3V3) / 1.5V 核心(LDO_1V5)"
      },
      {
        "k": "VIN_3V3 建議輸入範圍",
        "v": "3.0V~3.6V"
      },
      {
        "k": "PP5V 建議輸入範圍",
        "v": "4.9V~5.5V"
      },
      {
        "k": "VBUS 建議輸入範圍",
        "v": "4V~22V(需短接所有 VBUS 腳)"
      },
      {
        "k": "VBUS 輸出電流",
        "v": "最大 3A(自 PP5V)"
      },
      {
        "k": "工作接面溫度(建議)",
        "v": "-40°C~125°C"
      },
      {
        "k": "熱阻(32-QFN RSM)",
        "v": "RθJA 30.5°C/W；RθJC(top) 24.5°C/W；RθJB 9.8°C/W(見 datasheet 5.5節)"
      }
    ],
    "secondSource": [
      "封裝+pinout 完全相容(32-QFN RSM，pin-to-pin)",
      "pin strapping 設定邏輯與電阻對照表須一致(ADCIN1/ADCIN2)",
      "GPIO 功能與極性須相容，含 LD1/LD2、BC1.2 USB_P/USB_N 共用功能",
      "I2C target 與 I2C controller 之位址、暫存器映射須相容",
      "VBUS/PP5V 電流能力(3A/315mA CC)與外部 MOSFET 閘極驅動能力同等或更佳",
      "PD 規範版本與功能支援需另行核對 datasheet"
    ],
    "dropIn": [
      {
        "part": "TPS25751A",
        "note": "32-QFN 腳位編號與名稱逐腳核對完全相同(pin-to-pin，S 版)；惟 PD 功能規格版本可能不同，system-level 相容性須另行確認 datasheet。"
      }
    ]
  },
  {
    "part": "TPS26750A",
    "mfr": "Texas Instruments",
    "category": "power",
    "subcategory": "USB Type-C / USB PD 控制器(外部負載開關電源路徑控制，32-QFN)",
    "package": "32-QFN，封裝代碼與確切尺寸見 datasheet(TI SLVSJE4)",
    "whatIs": "USB Type-C 與 USB PD 控制器：整合 PD 協議引擎與電源路徑保護，以 POWER_PATH_EN 訊號控制外部負載開關(load switch)構成電源路徑，並提供豐富 GPIO 與雙 I2C(target/controller)介面。",
    "func": "TPS26750A 為 32-QFN 封裝的 USB Type-C/PD 控制器，pin strapping(ADCIN1/ADCIN2)、GPIO(GPIO0~GPIO7、GPIO11)與雙 I2C 介面架構與同家族 TPS2575x 系列相近，惟電源路徑控制方式不同：本顆以單一 POWER_PATH_EN 輸出驅動外部負載開關(非邏輯電壓準位輸出)，取代 TPS2575x 系列的 GATE_VBUS/GATE_VSYS 雙 MOSFET 閘極驅動架構；對應腳位(19/20/21)分別為 GND/POWER_PATH_EN/NC，與 TPS25751A(S)/TPS25752A 同位置的 VSYS/GATE_VSYS/GATE_VBUS 不同，其餘腳位(1~18、22~32)名稱相同。確切 PD 規範版本與功能支援見 datasheet(TI SLVSJE4)。",
    "usedIn": "以外部負載開關(load switch)構成電源路徑的 USB-C PD 受電應用，適合需簡化電源路徑設計(無需雙 MOSFET 閘極驅動)的系統；實際應用範圍見 datasheet。",
    "desc": "32-QFN 封裝。腳位 1~18、22~32 之名稱與同封裝家族的 TPS25751A(S 版)/TPS25752A 相同，惟腳位 19/20/21 為 GND/POWER_PATH_EN/NC(TPS2575x 系列對應為 VSYS/GATE_VSYS/GATE_VBUS)，屬不同電源路徑架構(單一 load-switch 致能 vs. 雙 MOSFET 閘極驅動)，故整體 pinout 不完全相容，不可直接互換，選型須依電源路徑架構確認。",
    "datasheet": "https://www.ti.com/lit/ds/symlink/tps26750a.pdf",
    "pins": [
      {
        "num": "1",
        "name": "LDO_3V3",
        "side": "L",
        "type": "Output",
        "desc": "由 VIN_3V3 或 VBUS LDO 切換而來的供電輸出；旁路電容 CLDO_3V3 至 GND。"
      },
      {
        "num": "2",
        "name": "ADCIN1",
        "side": "L",
        "type": "Input",
        "desc": "設定輸入(pin strap)；接電阻分壓器至 LDO_3V3。"
      },
      {
        "num": "3",
        "name": "ADCIN2",
        "side": "L",
        "type": "Input",
        "desc": "設定輸入(pin strap)；接電阻分壓器至 LDO_3V3。"
      },
      {
        "num": "4",
        "name": "LDO_1V5",
        "side": "L",
        "type": "Output",
        "desc": "核心(CORE)LDO 輸出；旁路電容 CLDO_1V5 至 GND；此腳無法對外部電路提供電流。"
      },
      {
        "num": "5",
        "name": "GPIO0/LD1",
        "side": "L",
        "type": "I/O",
        "desc": "通用數位 I/O；可設定為 Type-C 連接器液體偵測(liquid detection)功能。未使用時接地。"
      },
      {
        "num": "6",
        "name": "GPIO1",
        "side": "L",
        "type": "I/O",
        "desc": "通用數位 I/O。未使用時接地。"
      },
      {
        "num": "7",
        "name": "GPIO2/LD2",
        "side": "L",
        "type": "I/O",
        "desc": "通用數位 I/O；可設定為 Type-C 連接器液體偵測(liquid detection)功能。未使用時接地。"
      },
      {
        "num": "8",
        "name": "I2Ct_SDA",
        "side": "L",
        "type": "I/O",
        "desc": "I2C target 序列資料，開集(open-drain)雙向；經電阻接上拉電源，未使用時接地。"
      },
      {
        "num": "9",
        "name": "I2Ct_SCL",
        "side": "B",
        "type": "Input",
        "desc": "I2C target 序列時脈輸入；經電阻接上拉電源，未使用時接地。"
      },
      {
        "num": "10",
        "name": "I2Ct_IRQ",
        "side": "B",
        "type": "Output",
        "desc": "I2C target 中斷輸出，開集、低態動作(active low)；經上拉電阻接外部電源；可重設為 GPIO10；未使用時接地。"
      },
      {
        "num": "11",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "接地，連接至接地平面。"
      },
      {
        "num": "12",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "接地，連接至接地平面。"
      },
      {
        "num": "13",
        "name": "GPIO11",
        "side": "B",
        "type": "I/O",
        "desc": "通用數位 I/O。未使用時接地。"
      },
      {
        "num": "14",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "接地，連接至接地平面。"
      },
      {
        "num": "15",
        "name": "I2Cc_SDA",
        "side": "B",
        "type": "I/O",
        "desc": "I2C controller 序列資料，開集雙向；經電阻接上拉電源。"
      },
      {
        "num": "16",
        "name": "I2Cc_SCL",
        "side": "B",
        "type": "Output",
        "desc": "I2C controller 序列時脈，開集輸出；經電阻接上拉電源。"
      },
      {
        "num": "17",
        "name": "I2Cc_IRQ",
        "side": "R",
        "type": "Input",
        "desc": "I2C controller 中斷輸入，低態動作；經上拉電阻接外部電源；可重設為 GPIO12。"
      },
      {
        "num": "18",
        "name": "GPIO3",
        "side": "R",
        "type": "I/O",
        "desc": "通用數位 I/O。未使用時接地。"
      },
      {
        "num": "19",
        "name": "GND",
        "side": "R",
        "type": "Ground",
        "desc": "接地，連接至接地平面。(對應同封裝家族 TPS2575x 系列之 VSYS 腳，本顆架構不同不可互換)"
      },
      {
        "num": "20",
        "name": "POWER_PATH_EN",
        "side": "R",
        "type": "Output",
        "desc": "外部負載開關(load switch)之電源路徑致能訊號；未使用時懸空(floating)；本輸出非邏輯電壓準位輸出。(對應同封裝家族 TPS2575x 系列之 GATE_VSYS 腳，架構不同)"
      },
      {
        "num": "21",
        "name": "NC",
        "side": "R",
        "type": "NC",
        "desc": "未連接(No Connect)，Figure 4-1 標示為 NC；建議懸空。(對應同封裝家族 TPS2575x 系列之 GATE_VBUS 腳，架構不同)"
      },
      {
        "num": "22",
        "name": "GPIO4/USB_P",
        "side": "R",
        "type": "I/O",
        "desc": "通用數位 I/O；可接至 D+ 供 BC1.2 偵測使用。未使用時接地。"
      },
      {
        "num": "23",
        "name": "GPIO5/USB_N",
        "side": "R",
        "type": "I/O",
        "desc": "通用數位 I/O；可接至 D- 供 BC1.2 偵測使用。未使用時接地。"
      },
      {
        "num": "24",
        "name": "CC1",
        "side": "R",
        "type": "I/O",
        "desc": "USB Type-C 的 CC I/O；接建議電容(CCCy)至 GND 濾除雜訊。"
      },
      {
        "num": "25",
        "name": "CC2",
        "side": "T",
        "type": "I/O",
        "desc": "USB Type-C 的 CC I/O；接建議電容(CCCy)至 GND 濾除雜訊。"
      },
      {
        "num": "26",
        "name": "VBUS",
        "side": "T",
        "type": "I/O",
        "desc": "5V~20V 輸入；旁路電容 CVBUS 至 GND。"
      },
      {
        "num": "27",
        "name": "VBUS",
        "side": "T",
        "type": "I/O",
        "desc": "5V~20V 輸入；旁路電容 CVBUS 至 GND。"
      },
      {
        "num": "28",
        "name": "PP5V",
        "side": "T",
        "type": "Input",
        "desc": "5V 系統供電至 VBUS，並作為 CCy 腳位的 VCONN 供電來源。"
      },
      {
        "num": "29",
        "name": "PP5V",
        "side": "T",
        "type": "Input",
        "desc": "5V 系統供電至 VBUS，並作為 CCy 腳位的 VCONN 供電來源。"
      },
      {
        "num": "30",
        "name": "GPIO7",
        "side": "T",
        "type": "I/O",
        "desc": "通用數位 I/O。未使用時接地。"
      },
      {
        "num": "31",
        "name": "GPIO6",
        "side": "T",
        "type": "I/O",
        "desc": "通用數位 I/O。未使用時接地。"
      },
      {
        "num": "32",
        "name": "VIN_3V3",
        "side": "T",
        "type": "Input",
        "desc": "核心電路與 I/O 供電；旁路電容 CVIN_3V3 至 GND；若裝置僅由 VBUS 供電則此腳接地。"
      },
      {
        "num": "33",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "外露散熱墊(Thermal Pad)，Figure 4-1 標示接 GND；建議焊接至 PCB 接地銅箔並搭配散熱過孔以利散熱。",
        "ep": true
      }
    ],
    "thermalPad": "外露散熱墊(Thermal Pad)，Figure 4-1 標示接 GND；建議焊接至 PCB 接地銅箔並搭配散熱過孔以利散熱。",
    "specs": [
      {
        "k": "封裝",
        "v": "32-QFN，封裝代碼與確切尺寸見 datasheet(TI SLVSJE4)"
      },
      {
        "k": "設定方式",
        "v": "電阻分壓 pin strapping(ADCIN1/ADCIN2)"
      },
      {
        "k": "電源路徑控制",
        "v": "單一 POWER_PATH_EN 輸出驅動外部負載開關(非邏輯電壓準位)，與 TPS2575x 系列 GATE_VBUS/GATE_VSYS 雙 MOSFET 架構不同"
      },
      {
        "k": "GPIO 數量",
        "v": "12 組(GPIO0~GPIO7、GPIO11，部分與 LD1/LD2、USB_P/USB_N 共用)"
      },
      {
        "k": "通訊介面",
        "v": "I2C target(I2Ct_SCL/I2Ct_SDA/I2Ct_IRQ) + I2C controller(I2Cc_SCL/I2Cc_SDA/I2Cc_IRQ)"
      },
      {
        "k": "內建 LDO",
        "v": "3.3V(LDO_3V3) / 1.5V 核心(LDO_1V5)"
      },
      {
        "k": "VBUS 輸入範圍(絕對最大)",
        "v": "-0.3V~28V"
      },
      {
        "k": "CC1/CC2 輸入範圍(絕對最大)",
        "v": "-0.5V~26V"
      },
      {
        "k": "POWER_PATH_EN 輸出範圍(絕對最大)",
        "v": "-0.5V~12V(VVSYS=GND)"
      },
      {
        "k": "工作接面溫度",
        "v": "-40°C~175°C"
      }
    ],
    "secondSource": [
      "封裝+pinout 須逐腳相同(pin-to-pin，含 GND/POWER_PATH_EN/NC 於腳19/20/21)",
      "pin strapping 設定邏輯與電阻對照表須一致(ADCIN1/ADCIN2)",
      "GPIO 功能與極性須相容，含 LD1/LD2、BC1.2 USB_P/USB_N 共用功能",
      "POWER_PATH_EN 驅動特性(非邏輯準位輸出)須相容於所接外部負載開關",
      "I2C target 與 I2C controller 之位址、暫存器映射須相容",
      "PD 規範版本與功能支援需另行核對 datasheet"
    ],
    "dropIn": []
  },
  {
    "part": "TPS544B28",
    "mfr": "Texas Instruments",
    "category": "power",
    "subcategory": "同步降壓 DC/DC 轉換器(D-CAP+，PMBus 數位介面，19-WQFN-HR Hot-Rod)",
    "package": "19-WQFN-HR(VAN) 3.00mm × 3.00mm，0.4mm pitch(另有 RBH 封裝 3mm×3.5mm/0.5mm pitch 版本)",
    "whatIs": "同步降壓(buck)DC/DC 轉換器：整合高側/低側功率 MOSFET，支援 PMBus 數位通訊介面與電阻分壓(pin-strap)類比設定，適用於中大電流點負載(POL)電源應用。",
    "func": "TPS544B28 為 D-CAP+ 控制架構的同步降壓轉換器，輸出開關電流能力最高 20A(峰值 31A)。MS1/MS2 兩腳以電阻分壓至 AGND 進行類比 pin-strap 設定：MS1 設定切換頻率、谷值電流限制門檻與軟啟動時間；MS2 設定輸出電壓、VOUT_SCALE_LOOP 與內部/外部回授模式。VOS/FB、GOS 構成差動遠端電壓感測(remote sense)迴路，外部回授模式下由 VOUT 到 GOS 的電阻分壓器在 FB 腳分接以設定輸出電壓。PG 為開集電源良好(power-good)狀態輸出。ADR 腳以電阻分壓至 AGND 設定 PMBus 裝置位址與故障復原(打嗝或鎖存關閉)模式，並透過 SDA/SCL 提供 PMBus 通訊。BST 為高側 MOSFET 閘極驅動之自舉(bootstrap)供電腳，接自舉電容至 SW 節點。內部 3V LDO(VCC)供電內部電路與閘極驅動器，亦可外接 3.1V~4.5V 偏壓源以節省損耗。詳細保護功能(過電流、過熱等)、效率與切換架構細節見 datasheet(TI SLVSHP8A)。",
    "usedIn": "伺服器、網通設備、工業電源等需要中大電流(最高 20A)點負載(POL)降壓轉換，並支援 PMBus 監控/設定的應用；實際應用範圍見 datasheet。",
    "desc": "19-WQFN-HR(VAN)封裝，3mm×3mm、0.4mm pitch 的hot-rod 特殊腳位排列(非標準四邊均勻分布 QFN)。本條目腳位編號依 datasheet Table 5-1 Pin Functions 表逐腳核對，準確可靠。side(L/B/R/T 象限)因 Figure 5-1 圖形文字擷取順序打亂，僅能依腳位分組規律(單腳與連號群組交錯出現)盡力還原、屬概略估計，各腳 desc 已個別標註；正式佈局請以 datasheet Figure 5-1 為準。另有 RBH 封裝(3mm×3.5mm、0.5mm pitch)版本，腳位名稱與編號依 Figure 5-3/5-4 相同，但實際排列以各自封裝圖為準，兩封裝不可混用。",
    "datasheet": "https://www.ti.com/lit/ds/symlink/tps544b28.pdf",
    "pins": [
      {
        "num": "1",
        "name": "PG",
        "side": "L",
        "type": "Output",
        "desc": "開集(open-drain)電源良好(Power Good)狀態訊號；接上拉電阻至電壓源。FB 電壓超出設定範圍時，延遲後 PG 拉低"
      },
      {
        "num": "2",
        "name": "MS2",
        "side": "L",
        "type": "Input",
        "desc": "多功能選擇腳；接電阻至 AGND 以設定輸出電壓、VOUT_SCALE_LOOP，以及內部/外部回授模式"
      },
      {
        "num": "3",
        "name": "MS1",
        "side": "L",
        "type": "Input",
        "desc": "多功能選擇腳；接電阻至 AGND 以設定切換頻率、谷值電流限制門檻與軟啟動時間"
      },
      {
        "num": "4",
        "name": "VIN",
        "side": "L",
        "type": "Power",
        "desc": "功率級 MOSFET 與內部 LDO 之電源輸入腳(其一，另一為腳12)；輸入去耦電容須從 VIN 接至 PGND，並盡量靠近 IC"
      },
      {
        "num": "5",
        "name": "PGND",
        "side": "L",
        "type": "Ground",
        "desc": "功率級接地回路(其一，另一為腳11)；內部接至低側 MOSFET 源極。腳位下方應布多量過孔以降低寄生阻抗與熱阻"
      },
      {
        "num": "6",
        "name": "VCC",
        "side": "B",
        "type": "Power",
        "desc": "內部 3V LDO 輸出；可外接 3.1V~4.5V 偏壓源以節省內部 LDO 損耗，供內部電路與閘極驅動器使用。旁路 1µF(≥6.3V 額定)陶瓷電容至 PGND，並盡量靠近 VCC/PGND 腳"
      },
      {
        "num": "7",
        "name": "SW",
        "side": "B",
        "type": "Output",
        "desc": "電源轉換器切換輸出端(其一，共 3 腳：7/8/9)；接至輸出電感"
      },
      {
        "num": "8",
        "name": "SW",
        "side": "B",
        "type": "Output",
        "desc": "電源轉換器切換輸出端(其一，共 3 腳：7/8/9)；接至輸出電感"
      },
      {
        "num": "9",
        "name": "SW",
        "side": "B",
        "type": "Output",
        "desc": "電源轉換器切換輸出端(其一，共 3 腳：7/8/9)；接至輸出電感"
      },
      {
        "num": "10",
        "name": "BST",
        "side": "R",
        "type": "I/O",
        "desc": "內部高側 MOSFET 閘極驅動器(boost)供電腳；接自舉電容至 SW 節點"
      },
      {
        "num": "11",
        "name": "PGND",
        "side": "R",
        "type": "Ground",
        "desc": "功率級接地回路(其一，另一為腳5)；內部接至低側 MOSFET 源極。腳位下方應布多量過孔以降低寄生阻抗與熱阻"
      },
      {
        "num": "12",
        "name": "VIN",
        "side": "R",
        "type": "Power",
        "desc": "功率級 MOSFET 與內部 LDO 之電源輸入腳(其一，另一為腳4)；輸入去耦電容須從 VIN 接至 PGND，並盡量靠近 IC"
      },
      {
        "num": "13",
        "name": "ADR",
        "side": "R",
        "type": "Input",
        "desc": "PMBus 位址選擇腳；接電阻至 AGND 以設定 PMBus 裝置位址與故障復原模式(打嗝或鎖存關閉)"
      },
      {
        "num": "14",
        "name": "SDA",
        "side": "R",
        "type": "Input",
        "desc": "PMBus 雙向序列資料腳(datasheet TYPE 欄標示為 I)"
      },
      {
        "num": "15",
        "name": "SCL",
        "side": "T",
        "type": "Input",
        "desc": "PMBus 序列時脈腳"
      },
      {
        "num": "16",
        "name": "EN",
        "side": "T",
        "type": "Input",
        "desc": "致能腳，控制 DC/DC 切換轉換器開關；啟動前 EN 懸空則轉換器關閉。建議最大施加電壓 5.5V；TI 不建議將 EN 直接接至 VIN"
      },
      {
        "num": "17",
        "name": "VOS/FB",
        "side": "T",
        "type": "Input",
        "desc": "輸出電壓回授輸入，差動遠端感測電路正輸入端，接至負載側的 Vout 感測點。設定外部回授時，由 VOUT 到 GOS 的電阻分壓器在 FB 腳分接以設定輸出電壓"
      },
      {
        "num": "18",
        "name": "GOS",
        "side": "T",
        "type": "Input",
        "desc": "差動遠端感測電路負輸入端；接至負載附近的接地感測點"
      },
      {
        "num": "19",
        "name": "AGND",
        "side": "T",
        "type": "Ground",
        "desc": "類比接地回路，為內部控制電路的接地基準"
      }
    ],
    "specs": [
      {
        "k": "控制架構",
        "v": "D-CAP+ 同步降壓(buck)，見 datasheet"
      },
      {
        "k": "輸出電流能力",
        "v": "連續 20A，峰值電感電流 31A(SW)"
      },
      {
        "k": "輸入電壓範圍(建議)",
        "v": "內部 LDO 供電：4V~16V；外接偏壓(3.1V≤VVCC≤4.5V)：2.7V~16V"
      },
      {
        "k": "輸出電壓範圍",
        "v": "0.4V~5.5V"
      },
      {
        "k": "設定方式",
        "v": "電阻分壓 pin-strap(MS1：頻率/電流限制/軟啟動；MS2：輸出電壓/VOUT_SCALE_LOOP/回授模式；ADR：PMBus 位址/故障復原模式)"
      },
      {
        "k": "通訊介面",
        "v": "PMBus(SDA/SCL)"
      },
      {
        "k": "回授方式",
        "v": "差動遠端感測(VOS/FB + GOS)，可設定內部或外部回授"
      },
      {
        "k": "封裝",
        "v": "19-WQFN-HR(VAN)3mm×3mm/0.4mm pitch(本條目)；另有 RBH 3mm×3.5mm/0.5mm pitch"
      },
      {
        "k": "工作接面溫度",
        "v": "-40°C~150°C"
      },
      {
        "k": "ESD",
        "v": "HBM ±2000V、CDM ±500V(見 datasheet 6.2節)"
      }
    ],
    "secondSource": [
      "封裝須為 19-WQFN-HR(VAN)3mm×3mm/0.4mm pitch，pin-to-pin 相容；RBH 版本(3mm×3.5mm/0.5mm pitch)封裝外型不同，需另行確認腳位排列",
      "輸出電流能力(20A 連續/31A 峰值)與輸入電壓範圍(4V~16V 或 2.7V~16V 外接偏壓)須涵蓋",
      "控制架構(D-CAP+)與回授模式(內部/外部、VOUT_SCALE_LOOP)須相容",
      "PMBus 位址設定與故障復原模式(打嗝/鎖存)邏輯須一致",
      "MS1/MS2/ADR 電阻分壓對照表須確認一致"
    ],
    "dropIn": []
  },
  {
    "part": "TPS7H4012-SP",
    "mfr": "Texas Instruments",
    "category": "power",
    "subcategory": "太空級同步降壓轉換器 (Rad-Hard)",
    "package": "20-Pin CFP(HLC)；同系列另有 44-Pin HTSSOP(DDW)封裝版本(pinout 名稱相同、腳號對應不同，尺寸見 datasheet)",
    "whatIs": "抗輻射太空級同步降壓(step-down)直流轉換器：將輸入電源轉換為可調輸出電壓，最高輸出電流 6A(TPS7H4012 家族)，供衛星/太空酬載板上電源使用。TPS7H4012 與 TPS7H4013 為同一份 datasheet 內的姊妹型號，pinout 完全相同，僅最高輸出電流不同(4012=6A、4013=3A)。",
    "func": "採用外部可調頻率、外部補償架構的同步降壓轉換器。EN 腳致能元件(可用 VIN 至 GND 電阻分壓程式化開啟位準)；RT 腳外接電阻至 GND 設定切換頻率(100kHz~1MHz)，若使用外部時脈可懸空或加電阻作為時脈遺失時的備援頻率；SYNC1 腳可接受外部時脈輸入，並與另一相位差 180° 同步(不使用時建議接地以防雜訊耦合)。VIN 供控制電路，PVIN 供輸出級功率，兩者須外部短接同電壓；LDOCAP 為內部線性穩壓器(標稱 AVDD=5V)輸出電容腳，需 1µF 電容。SW 為切換節點，可選接蕭特基二極體至 PGND 以改善雜訊與效率。PWRGD 為開集極電源良好旗標(輸出電壓在標稱值 ±5% 內 asserted，超出 8% 或故障時 deasserted)。RSC 腳外接電阻至 GND 設定斜率補償；SS_TR 腳外接電容可延緩軟啟動並可用於電源追蹤(tracking)/時序控制；VSNS+ 為回授腳(標稱 0.6V)；COMP 為 OTA 誤差放大器輸出，須外接 RC 補償網路；REFCAP 為能隙參考電容腳(標稱 VBG=1.2V，需 470nF 電容)，不可外接其他電路。抗輻射規格(SP 等級)：TID 100krad(Si) RLAT，DSEE(破壞性單事件效應)免疫至 75MeV-cm²/mg；提供 QMLV-RHA(20-pin CFP HLC)與 QMLP-RHA(44-pin HTSSOP DDW)兩種封裝等級。",
    "usedIn": "衛星/太空酬載板上點負載電源、通訊/導航/科學酬載等需抗輻射降壓轉換器的太空應用。",
    "desc": "20-Pin CFP(HLC)封裝，抗輻射(TID 100krad(Si))太空級同步降壓轉換器，最高輸出電流 6A，外部可調開關頻率(100kHz~1MHz)並可外部時脈同步，外部補償架構(COMP/REFCAP)。與 TPS7H4013-SP 共用同一份 datasheet 與相同 pinout(僅最高輸出電流不同：4012=6A、4013=3A)，兩者電氣規格不同、不互為 dropIn。同系列另有 44-Pin HTSSOP(DDW)封裝版本；本條目每一腳的 desc 已註記對應之 HTSSOP-44(DDW) 腳號。",
    "datasheet": "https://www.ti.com/lit/ds/symlink/tps7h4012-sp.pdf",
    "pins": [
      {
        "num": "1",
        "name": "GND",
        "side": "L",
        "type": "Ground",
        "desc": "控制電路接地(Ground)，為內部電路回接參考點。對應 HTSSOP-44(DDW) pin 1,2。"
      },
      {
        "num": "2",
        "name": "EN",
        "side": "L",
        "type": "Input",
        "desc": "致能輸入；驅動高電位致能元件、低電位關閉。可用 VIN 至 GND 電阻分壓設定開啟電壓位準。對應 HTSSOP-44(DDW) pin 3。"
      },
      {
        "num": "3",
        "name": "RT",
        "side": "L",
        "type": "Analog In",
        "desc": "開關頻率設定腳；接電阻至 GND 設定切換頻率(100kHz~1MHz)。若使用外部時脈，此腳可懸空或接電阻作為外部時脈遺失時的備援頻率。對應 HTSSOP-44(DDW) pin 4。"
      },
      {
        "num": "4",
        "name": "VIN",
        "side": "L",
        "type": "Power",
        "desc": "輸入電壓，供控制電路使用；VIN 須與 PVIN 同電壓，建議外部短接 VIN 與 PVIN。對應 HTSSOP-44(DDW) pin 5。"
      },
      {
        "num": "5",
        "name": "LDOCAP",
        "side": "L",
        "type": "Analog Out",
        "desc": "線性穩壓器輸出電容腳；須外接 1µF 電容供內部線性穩壓器使用，輸出電壓 AVDD 標稱 5V。不可額外以外部電路負載此腳。對應 HTSSOP-44(DDW) pin 6。"
      },
      {
        "num": "6",
        "name": "SYNC1",
        "side": "L",
        "type": "Input",
        "desc": "同步腳1；作為外部時脈輸入，與另一相位差 180° 同步切換頻率。若不使用外部時脈，建議接地以防止雜訊耦合。對應 HTSSOP-44(DDW) pin 8。"
      },
      {
        "num": "7",
        "name": "PVIN",
        "side": "L",
        "type": "Power",
        "desc": "功率級輸入電壓，供切換穩壓器輸出級使用。對應 HTSSOP-44(DDW) pin 11-15(共5腳)。"
      },
      {
        "num": "8",
        "name": "PVIN",
        "side": "L",
        "type": "Power",
        "desc": "功率級輸入電壓，供切換穩壓器輸出級使用。對應 HTSSOP-44(DDW) pin 11-15(共5腳)。"
      },
      {
        "num": "9",
        "name": "PGND",
        "side": "L",
        "type": "Ground",
        "desc": "功率級接地，為低側功率 MOSFET 回接，須連接至 GND。對應 HTSSOP-44(DDW) pin 16-22(共7腳)。"
      },
      {
        "num": "10",
        "name": "PGND",
        "side": "L",
        "type": "Ground",
        "desc": "功率級接地，為低側功率 MOSFET 回接，須連接至 GND。對應 HTSSOP-44(DDW) pin 16-22(共7腳)。"
      },
      {
        "num": "20",
        "name": "REFCAP",
        "side": "R",
        "type": "Analog Out",
        "desc": "參考電容腳；內部能隙(bandgap)參考需外接 470nF 電容，標稱電壓 VBG=1.2V。不可外接其他電路至此腳。對應 HTSSOP-44(DDW) pin 44。"
      },
      {
        "num": "19",
        "name": "COMP",
        "side": "R",
        "type": "I/O",
        "desc": "補償腳；為 OTA(跨導)誤差放大器輸出，亦為切換電流比較器輸入，須於此腳接頻率補償網路。對應 HTSSOP-44(DDW) pin 43。"
      },
      {
        "num": "18",
        "name": "VSNS+",
        "side": "R",
        "type": "Analog In",
        "desc": "正電壓感測腳(回授腳)；標稱 0.6V，透過適當電阻分壓網路設定回授電壓。對應 HTSSOP-44(DDW) pin 42。"
      },
      {
        "num": "17",
        "name": "SS_TR",
        "side": "R",
        "type": "Analog In",
        "desc": "軟啟動與追蹤(tracking)腳；datasheet 原文為「於此腳與 VSNS− 間外接電容可延緩內部參考電壓上升時間，亦可用於電源軌追蹤與時序控制」，惟本封裝/型號 Pin Functions 表未列出獨立 VSNS− 腳，實際接法請以原廠 datasheet 為準。對應 HTSSOP-44(DDW) pin 40。"
      },
      {
        "num": "16",
        "name": "RSC",
        "side": "R",
        "type": "Analog In",
        "desc": "斜率補償腳；接電阻至 GND 設定所需的斜率補償。對應 HTSSOP-44(DDW) pin 39。"
      },
      {
        "num": "15",
        "name": "PWRGD",
        "side": "R",
        "type": "Output",
        "desc": "電源良好旗標腳，開集極(open-drain)輸出；須接提升電阻至 VOUT(需低於7V)或所需邏輯位準。輸出電壓在標稱值 ±5%(典型)內時為 asserted，超出 8%(典型)或發生故障(如過熱關機)時 deasserted。對應 HTSSOP-44(DDW) pin 36。"
      },
      {
        "num": "14",
        "name": "SW",
        "side": "R",
        "type": "Power",
        "desc": "切換節點腳；開關輸出。可於 SW 與 PGND 間接蕭特基二極體以改善內部雜訊與效率。對應 HTSSOP-44(DDW) pin 23-34(共12腳)。"
      },
      {
        "num": "13",
        "name": "SW",
        "side": "R",
        "type": "Power",
        "desc": "切換節點腳；開關輸出。可於 SW 與 PGND 間接蕭特基二極體以改善內部雜訊與效率。對應 HTSSOP-44(DDW) pin 23-34(共12腳)。"
      },
      {
        "num": "12",
        "name": "SW",
        "side": "R",
        "type": "Power",
        "desc": "切換節點腳；開關輸出。可於 SW 與 PGND 間接蕭特基二極體以改善內部雜訊與效率。對應 HTSSOP-44(DDW) pin 23-34(共12腳)。"
      },
      {
        "num": "11",
        "name": "SW",
        "side": "R",
        "type": "Power",
        "desc": "切換節點腳；開關輸出。可於 SW 與 PGND 間接蕭特基二極體以改善內部雜訊與效率。對應 HTSSOP-44(DDW) pin 23-34(共12腳)。"
      },
      {
        "num": "21",
        "name": "THERMAL PAD",
        "side": "B",
        "type": "Ground",
        "desc": "散熱墊(Thermal Pad)，內部連接至 GND。建議連接大面積接地銅箔以利散熱；TI 建議以電氣方式連接至 GND 或 PGND，惟該散熱墊亦可依需求採電氣浮接。對應 HTSSOP-44(DDW) pin 45(封裝金屬外殼 Metal lid 亦內部接 GND，但無對應腳號)。",
        "ep": true
      }
    ],
    "specs": [
      {
        "k": "最高輸出電流(本型號)",
        "v": "6A（TPS7H4012 家族；姊妹型號 TPS7H4013 家族為 3A）"
      },
      {
        "k": "輸入電壓(絕對最大額定 VIN/PVIN)",
        "v": "−0.3V ~ 16V"
      },
      {
        "k": "開關頻率",
        "v": "100kHz ~ 1MHz(RT 電阻設定，可外部同步)"
      },
      {
        "k": "回授電壓(VSNS+)",
        "v": "標稱 0.6V"
      },
      {
        "k": "內部線性穩壓器輸出(AVDD)",
        "v": "標稱 5V(LDOCAP 腳，需 1µF 電容)"
      },
      {
        "k": "參考電壓(REFCAP/VBG)",
        "v": "標稱 1.2V(需 470nF 電容)"
      },
      {
        "k": "PWRGD 門檻",
        "v": "輸出電壓 ±5%(典型)內 asserted，超出 8%(典型)或故障時 deasserted"
      },
      {
        "k": "ESD",
        "v": "HBM ±1000V、CDM ±500V"
      },
      {
        "k": "抗輻射(SP 等級)",
        "v": "TID 100krad(Si) RLAT；DSEE 免疫至 75MeV-cm²/mg；QMLV-RHA(20-pin CFP HLC)或 QMLP-RHA(44-pin HTSSOP DDW)"
      },
      {
        "k": "工作接面溫度",
        "v": "−55°C ~ 150°C"
      },
      {
        "k": "封裝",
        "v": "20-Pin CFP(HLC)；同系列另有 44-Pin HTSSOP(DDW)"
      }
    ],
    "secondSource": [
      "封裝+pinout 相容(20-Pin CFP HLC，pin-to-pin)",
      "最高輸出電流同等或更佳(≥6A)",
      "開關頻率可調範圍涵蓋(100kHz~1MHz)且支援外部同步(SYNC1，180° 相位)",
      "外部補償架構相容(COMP/REFCAP 腳位與外部 RC/電容需求一致)",
      "太空抗輻射等級(TID、DSEE)同等或更佳；若替代非太空級零件須另行評估",
      "PWRGD 開集極旗標邏輯與門檻一致",
      "VIN/PVIN 分離供電腳位架構相同"
    ],
    "dropIn": []
  },
  {
    "part": "TPS7H4013-SP",
    "mfr": "Texas Instruments",
    "category": "power",
    "subcategory": "太空級同步降壓轉換器 (Rad-Hard)",
    "package": "20-Pin CFP(HLC)；同系列另有 44-Pin HTSSOP(DDW)封裝版本(pinout 名稱相同、腳號對應不同，尺寸見 datasheet)",
    "whatIs": "抗輻射太空級同步降壓(step-down)直流轉換器：將輸入電源轉換為可調輸出電壓，最高輸出電流 3A(TPS7H4013 家族)，供衛星/太空酬載板上電源使用。TPS7H4013 與 TPS7H4012 為同一份 datasheet 內的姊妹型號，pinout 完全相同，僅最高輸出電流不同(4013=3A、4012=6A)。",
    "func": "採用外部可調頻率、外部補償架構的同步降壓轉換器。EN 腳致能元件(可用 VIN 至 GND 電阻分壓程式化開啟位準)；RT 腳外接電阻至 GND 設定切換頻率(100kHz~1MHz)，若使用外部時脈可懸空或加電阻作為時脈遺失時的備援頻率；SYNC1 腳可接受外部時脈輸入，並與另一相位差 180° 同步(不使用時建議接地以防雜訊耦合)。VIN 供控制電路，PVIN 供輸出級功率，兩者須外部短接同電壓；LDOCAP 為內部線性穩壓器(標稱 AVDD=5V)輸出電容腳，需 1µF 電容。SW 為切換節點，可選接蕭特基二極體至 PGND 以改善雜訊與效率。PWRGD 為開集極電源良好旗標(輸出電壓在標稱值 ±5% 內 asserted，超出 8% 或故障時 deasserted)。RSC 腳外接電阻至 GND 設定斜率補償；SS_TR 腳外接電容可延緩軟啟動並可用於電源追蹤(tracking)/時序控制；VSNS+ 為回授腳(標稱 0.6V)；COMP 為 OTA 誤差放大器輸出，須外接 RC 補償網路；REFCAP 為能隙參考電容腳(標稱 VBG=1.2V，需 470nF 電容)，不可外接其他電路。抗輻射規格(SP 等級)：TID 100krad(Si) RLAT，DSEE(破壞性單事件效應)免疫至 75MeV-cm²/mg；提供 QMLV-RHA(20-pin CFP HLC)與 QMLP-RHA(44-pin HTSSOP DDW)兩種封裝等級。",
    "usedIn": "衛星/太空酬載板上點負載電源、通訊/導航/科學酬載等需抗輻射降壓轉換器的太空應用。",
    "desc": "20-Pin CFP(HLC)封裝，抗輻射(TID 100krad(Si))太空級同步降壓轉換器，最高輸出電流 3A，外部可調開關頻率(100kHz~1MHz)並可外部時脈同步，外部補償架構(COMP/REFCAP)。與 TPS7H4012-SP 共用同一份 datasheet 與相同 pinout(僅最高輸出電流不同：4013=3A、4012=6A)，兩者電氣規格不同、不互為 dropIn。同系列另有 44-Pin HTSSOP(DDW)封裝版本；本條目每一腳的 desc 已註記對應之 HTSSOP-44(DDW) 腳號。",
    "datasheet": "https://www.ti.com/lit/ds/symlink/tps7h4013-sp.pdf",
    "pins": [
      {
        "num": "1",
        "name": "GND",
        "side": "L",
        "type": "Ground",
        "desc": "控制電路接地(Ground)，為內部電路回接參考點。對應 HTSSOP-44(DDW) pin 1,2。"
      },
      {
        "num": "2",
        "name": "EN",
        "side": "L",
        "type": "Input",
        "desc": "致能輸入；驅動高電位致能元件、低電位關閉。可用 VIN 至 GND 電阻分壓設定開啟電壓位準。對應 HTSSOP-44(DDW) pin 3。"
      },
      {
        "num": "3",
        "name": "RT",
        "side": "L",
        "type": "Analog In",
        "desc": "開關頻率設定腳；接電阻至 GND 設定切換頻率(100kHz~1MHz)。若使用外部時脈，此腳可懸空或接電阻作為外部時脈遺失時的備援頻率。對應 HTSSOP-44(DDW) pin 4。"
      },
      {
        "num": "4",
        "name": "VIN",
        "side": "L",
        "type": "Power",
        "desc": "輸入電壓，供控制電路使用；VIN 須與 PVIN 同電壓，建議外部短接 VIN 與 PVIN。對應 HTSSOP-44(DDW) pin 5。"
      },
      {
        "num": "5",
        "name": "LDOCAP",
        "side": "L",
        "type": "Analog Out",
        "desc": "線性穩壓器輸出電容腳；須外接 1µF 電容供內部線性穩壓器使用，輸出電壓 AVDD 標稱 5V。不可額外以外部電路負載此腳。對應 HTSSOP-44(DDW) pin 6。"
      },
      {
        "num": "6",
        "name": "SYNC1",
        "side": "L",
        "type": "Input",
        "desc": "同步腳1；作為外部時脈輸入，與另一相位差 180° 同步切換頻率。若不使用外部時脈，建議接地以防止雜訊耦合。對應 HTSSOP-44(DDW) pin 8。"
      },
      {
        "num": "7",
        "name": "PVIN",
        "side": "L",
        "type": "Power",
        "desc": "功率級輸入電壓，供切換穩壓器輸出級使用。對應 HTSSOP-44(DDW) pin 11-15(共5腳)。"
      },
      {
        "num": "8",
        "name": "PVIN",
        "side": "L",
        "type": "Power",
        "desc": "功率級輸入電壓，供切換穩壓器輸出級使用。對應 HTSSOP-44(DDW) pin 11-15(共5腳)。"
      },
      {
        "num": "9",
        "name": "PGND",
        "side": "L",
        "type": "Ground",
        "desc": "功率級接地，為低側功率 MOSFET 回接，須連接至 GND。對應 HTSSOP-44(DDW) pin 16-22(共7腳)。"
      },
      {
        "num": "10",
        "name": "PGND",
        "side": "L",
        "type": "Ground",
        "desc": "功率級接地，為低側功率 MOSFET 回接，須連接至 GND。對應 HTSSOP-44(DDW) pin 16-22(共7腳)。"
      },
      {
        "num": "20",
        "name": "REFCAP",
        "side": "R",
        "type": "Analog Out",
        "desc": "參考電容腳；內部能隙(bandgap)參考需外接 470nF 電容，標稱電壓 VBG=1.2V。不可外接其他電路至此腳。對應 HTSSOP-44(DDW) pin 44。"
      },
      {
        "num": "19",
        "name": "COMP",
        "side": "R",
        "type": "I/O",
        "desc": "補償腳；為 OTA(跨導)誤差放大器輸出，亦為切換電流比較器輸入，須於此腳接頻率補償網路。對應 HTSSOP-44(DDW) pin 43。"
      },
      {
        "num": "18",
        "name": "VSNS+",
        "side": "R",
        "type": "Analog In",
        "desc": "正電壓感測腳(回授腳)；標稱 0.6V，透過適當電阻分壓網路設定回授電壓。對應 HTSSOP-44(DDW) pin 42。"
      },
      {
        "num": "17",
        "name": "SS_TR",
        "side": "R",
        "type": "Analog In",
        "desc": "軟啟動與追蹤(tracking)腳；datasheet 原文為「於此腳與 VSNS− 間外接電容可延緩內部參考電壓上升時間，亦可用於電源軌追蹤與時序控制」，惟本封裝/型號 Pin Functions 表未列出獨立 VSNS− 腳，實際接法請以原廠 datasheet 為準。對應 HTSSOP-44(DDW) pin 40。"
      },
      {
        "num": "16",
        "name": "RSC",
        "side": "R",
        "type": "Analog In",
        "desc": "斜率補償腳；接電阻至 GND 設定所需的斜率補償。對應 HTSSOP-44(DDW) pin 39。"
      },
      {
        "num": "15",
        "name": "PWRGD",
        "side": "R",
        "type": "Output",
        "desc": "電源良好旗標腳，開集極(open-drain)輸出；須接提升電阻至 VOUT(需低於7V)或所需邏輯位準。輸出電壓在標稱值 ±5%(典型)內時為 asserted，超出 8%(典型)或發生故障(如過熱關機)時 deasserted。對應 HTSSOP-44(DDW) pin 36。"
      },
      {
        "num": "14",
        "name": "SW",
        "side": "R",
        "type": "Power",
        "desc": "切換節點腳；開關輸出。可於 SW 與 PGND 間接蕭特基二極體以改善內部雜訊與效率。對應 HTSSOP-44(DDW) pin 23-34(共12腳)。"
      },
      {
        "num": "13",
        "name": "SW",
        "side": "R",
        "type": "Power",
        "desc": "切換節點腳；開關輸出。可於 SW 與 PGND 間接蕭特基二極體以改善內部雜訊與效率。對應 HTSSOP-44(DDW) pin 23-34(共12腳)。"
      },
      {
        "num": "12",
        "name": "SW",
        "side": "R",
        "type": "Power",
        "desc": "切換節點腳；開關輸出。可於 SW 與 PGND 間接蕭特基二極體以改善內部雜訊與效率。對應 HTSSOP-44(DDW) pin 23-34(共12腳)。"
      },
      {
        "num": "11",
        "name": "SW",
        "side": "R",
        "type": "Power",
        "desc": "切換節點腳；開關輸出。可於 SW 與 PGND 間接蕭特基二極體以改善內部雜訊與效率。對應 HTSSOP-44(DDW) pin 23-34(共12腳)。"
      },
      {
        "num": "21",
        "name": "THERMAL PAD",
        "side": "B",
        "type": "Ground",
        "desc": "散熱墊(Thermal Pad)，內部連接至 GND。建議連接大面積接地銅箔以利散熱；TI 建議以電氣方式連接至 GND 或 PGND，惟該散熱墊亦可依需求採電氣浮接。對應 HTSSOP-44(DDW) pin 45(封裝金屬外殼 Metal lid 亦內部接 GND，但無對應腳號)。",
        "ep": true
      }
    ],
    "specs": [
      {
        "k": "最高輸出電流(本型號)",
        "v": "3A（TPS7H4013 家族；姊妹型號 TPS7H4012 家族為 6A）"
      },
      {
        "k": "輸入電壓(絕對最大額定 VIN/PVIN)",
        "v": "−0.3V ~ 16V"
      },
      {
        "k": "開關頻率",
        "v": "100kHz ~ 1MHz(RT 電阻設定，可外部同步)"
      },
      {
        "k": "回授電壓(VSNS+)",
        "v": "標稱 0.6V"
      },
      {
        "k": "內部線性穩壓器輸出(AVDD)",
        "v": "標稱 5V(LDOCAP 腳，需 1µF 電容)"
      },
      {
        "k": "參考電壓(REFCAP/VBG)",
        "v": "標稱 1.2V(需 470nF 電容)"
      },
      {
        "k": "PWRGD 門檻",
        "v": "輸出電壓 ±5%(典型)內 asserted，超出 8%(典型)或故障時 deasserted"
      },
      {
        "k": "ESD",
        "v": "HBM ±1000V、CDM ±500V"
      },
      {
        "k": "抗輻射(SP 等級)",
        "v": "TID 100krad(Si) RLAT；DSEE 免疫至 75MeV-cm²/mg；QMLV-RHA(20-pin CFP HLC)或 QMLP-RHA(44-pin HTSSOP DDW)"
      },
      {
        "k": "工作接面溫度",
        "v": "−55°C ~ 150°C"
      },
      {
        "k": "封裝",
        "v": "20-Pin CFP(HLC)；同系列另有 44-Pin HTSSOP(DDW)"
      }
    ],
    "secondSource": [
      "封裝+pinout 相容(20-Pin CFP HLC，pin-to-pin)",
      "最高輸出電流同等或更佳(≥6A)",
      "開關頻率可調範圍涵蓋(100kHz~1MHz)且支援外部同步(SYNC1，180° 相位)",
      "外部補償架構相容(COMP/REFCAP 腳位與外部 RC/電容需求一致)",
      "太空抗輻射等級(TID、DSEE)同等或更佳；若替代非太空級零件須另行評估",
      "PWRGD 開集極旗標邏輯與門檻一致",
      "VIN/PVIN 分離供電腳位架構相同"
    ],
    "dropIn": []
  },
  {
    "part": "TPS99002S-Q1",
    "mfr": "Texas Instruments",
    "category": "power",
    "subcategory": "車用 DLP 頭燈系統電源管理暨照明控制 IC",
    "package": "100-Pin HTQFP(PZP)",
    "whatIs": "車用 DLP(Digital Light Processing)投影頭燈系統電源管理與控制 IC：整合多路降壓致能/監控、DMD(數位微鏡元件)專用電源軌產生、LED/雷射照明通道驅動與電流回授、光電二極體(TIA)類比前端，供車用 DLP 智慧頭燈模組使用。",
    "func": "主要功能區塊如下。1) 電源監控/致能：ENB_1P1V/ENB_1P8V/ENB_3P3V 致能外部 buck，V1P1V/V1P8V/V3P3V 監控其電壓。2) DMD 專用電源：DMD_VOFFSET/DMD_VBIAS/DMD_VRESET 三組電源軌(各需外接電容)，DRST_HS_IND/DRST_LS_IND 為內部電感切換節點，VIN_DRST/VSS_DRST/DRST_PGND 為 6V 輸入與接地。3) LED/雷射照明驅動：D_EN/S_EN/LED_SEL_0-3 控制 LED 致能與通道選擇，R_EN/G_EN/B_EN 驅動紅/綠/藍通道低側 NFET，S_EN1/S_EN2 驅動分流 NFET，IADJ/R_IADJ 設定外部 LED 控制器電流，SYNC 提供外部 LED buck 同步觸發，DRV_EN/CMODE 為 LM3409 相關驅動訊號。4) 光電回授(TIA)：TIA_PD1/TIA_PD2 為光電二極體陰極驅動，TIA_PD1_FILT/TIA_PD2_FILT 為低頻寬取樣濾波，並有專屬 VLDOT_3P3V/VLDOT_5V/VLDOT_M8 三組 LDO 供電。5) 外部 ADC 介面：ADC_IN1-7 類比輸入通道、ADC_VREF 參考輸出、ADC_MISO/ADC_MOSI 為其專用 SPI 介面。6) 數位主機介面：SPI1/SPI2 兩組數位介面(CLK/DIN/DOUT/SS_Z)、COMPOUT 高速比較器輸出。7) 系統握手：WD1/WD2 看門狗中斷通道、PARK_Z 鏡面停泊訊號、RESET_Z/INT_Z 對 DLPC23xS-Q1 的重置/中斷訊號、PROJ_ON 投影機致能、nRST 對應腳位於本次擷取範圍未列出(見下方資料限制說明)。8) 測試/除錯：DMUX0/DMUX1 數位測試點、AMUX0/AMUX1 類比測試多工輸出。資料限制：ADC_MISO/ADC_MOSI(pin4,5)、SPI1_CLK/SS_Z/DOUT/DIN(pin27-30)、SPI2_DIN/DOUT/SS_Z/CLK(pin31-34)、LS_SENSE_N/P(pin82,83)、ADC_IN1-7(pin85,86,88,90,92,93,94)共19腳，其名稱係依封裝圖(Figure 4-1)判讀並與其餘81腳的 Pin Functions 表(Table 4-1~4-4)交叉核對編號一致性(所有可核對腳位100%吻合)，惟這19腳的官方功能敘述文字未收錄於本次擷取範圍，詳細規格請查閱原廠 datasheet 完整 Pin Functions 表。",
    "usedIn": "車用 DLP 智慧投影頭燈(adaptive driving beam)模組，搭配 DLPC23xS-Q1 數位控制器與 DMD 元件，驅動 R/G/B 或白光 LED/雷射光源並回授光電二極體訊號進行閉迴路控制。",
    "desc": "100-Pin HTQFP(PZP)封裝，車用 DLP 頭燈系統電源管理暨照明控制 IC，整合多路 buck 致能/監控、DMD 專用電源軌(VOFFSET/VBIAS/VRESET)、RGB LED/雷射驅動與電流回授、雙通道 TIA 光電前端、7 通道外部 ADC 介面與雙組 SPI 數位介面。PBKG(25,60,75,99)、AVSS(78,100)、VSSL_ADC(81,84,87,89,91)、VSS_IO(13,35)、VDD_IO(14,36)為多腳合併同名腳位。19 個腳位(pin 4,5,27-34,82,83,85,86,88,90,92-94)之名稱依封裝圖判讀，官方 Pin Functions 表描述文字未收錄於本次擷取範圍，功能細節請查原廠 datasheet(此為判斷取捨，可翻案)。本次擷取的 Pin Functions 表未見獨立散熱墊(exposed pad)列，故本條目不含 EP 腳。",
    "datasheet": "https://www.ti.com/lit/ds/symlink/tps99002s-q1.pdf",
    "pins": [
      {
        "num": "1",
        "name": "ENB_1P1V",
        "side": "L",
        "type": "Output",
        "desc": "外部 1.1V buck 致能訊號(3.3V 輸出位準)。"
      },
      {
        "num": "2",
        "name": "ENB_1P8V",
        "side": "L",
        "type": "Output",
        "desc": "外部 1.8V buck 致能訊號(3.3V 輸出位準)。"
      },
      {
        "num": "3",
        "name": "ENB_3P3V",
        "side": "L",
        "type": "Output",
        "desc": "外部 3.3V buck 致能訊號(3.3V 輸出位準)。"
      },
      {
        "num": "4",
        "name": "ADC_MISO",
        "side": "L",
        "type": "Input",
        "desc": "外部 ADC 專用 SPI 介面資料輸入(Master In Slave Out)。"
      },
      {
        "num": "5",
        "name": "ADC_MOSI",
        "side": "L",
        "type": "Output",
        "desc": "外部 ADC 專用 SPI 介面資料輸出(Master Out Slave In)。"
      },
      {
        "num": "6",
        "name": "WD1",
        "side": "L",
        "type": "Input",
        "desc": "看門狗中斷通道1。"
      },
      {
        "num": "7",
        "name": "WD2",
        "side": "L",
        "type": "Input",
        "desc": "看門狗中斷通道2。"
      },
      {
        "num": "8",
        "name": "PARK_Z",
        "side": "L",
        "type": "Output",
        "desc": "DMD 反射鏡停泊(park)訊號，低電位有效。"
      },
      {
        "num": "9",
        "name": "RESET_Z",
        "side": "L",
        "type": "Output",
        "desc": "輸出至 DLPC23xS-Q1 的重置訊號，由 TPS99002S-Q1 控制。"
      },
      {
        "num": "10",
        "name": "INT_Z",
        "side": "L",
        "type": "Output",
        "desc": "輸出至 DLPC23xS-Q1 的中斷訊號(開集極輸出)；建議提升電阻拉至由 TPS99002S-Q1 的 ENB_3P3V 訊號控制的 DLPC23xS-Q1 3.3V 電源軌。"
      },
      {
        "num": "11",
        "name": "PROJ_ON",
        "side": "L",
        "type": "Input",
        "desc": "致能/關閉本 IC 與 DLP 投影機的輸入訊號。"
      },
      {
        "num": "12",
        "name": "COMPOUT",
        "side": "L",
        "type": "Output",
        "desc": "光電二極體(PD)介面高速比較器輸出。"
      },
      {
        "num": "13",
        "name": "VSS_IO",
        "side": "L",
        "type": "Ground",
        "desc": "數位 IO 介面接地。"
      },
      {
        "num": "14",
        "name": "VDD_IO",
        "side": "L",
        "type": "Power",
        "desc": "IO 電源軌 3.3V 供電輸入。"
      },
      {
        "num": "15",
        "name": "SYNC",
        "side": "L",
        "type": "Output",
        "desc": "外部 LED buck 驅動器同步觸發輸出。"
      },
      {
        "num": "16",
        "name": "SEQ_START",
        "side": "L",
        "type": "Input",
        "desc": "PWM shadow latch 控制訊號；表示序列(sequence)開始。"
      },
      {
        "num": "17",
        "name": "SEQ_CLK",
        "side": "L",
        "type": "Input",
        "desc": "定序器(sequencer)時脈輸入。"
      },
      {
        "num": "18",
        "name": "D_EN",
        "side": "L",
        "type": "Input",
        "desc": "LED 介面：buck 高側 FET 驅動致能。"
      },
      {
        "num": "19",
        "name": "S_EN",
        "side": "L",
        "type": "Input",
        "desc": "LED 旁路分流(bypass shunt)觸發輸入。"
      },
      {
        "num": "20",
        "name": "LED_SEL_0",
        "side": "L",
        "type": "Input",
        "desc": "LED 致能觸發輸入0。"
      },
      {
        "num": "21",
        "name": "LED_SEL_1",
        "side": "L",
        "type": "Input",
        "desc": "LED 致能觸發輸入1。"
      },
      {
        "num": "22",
        "name": "LED_SEL_2",
        "side": "L",
        "type": "Input",
        "desc": "LED 致能觸發輸入2。"
      },
      {
        "num": "23",
        "name": "LED_SEL_3",
        "side": "L",
        "type": "Input",
        "desc": "LED 致能觸發輸入3。"
      },
      {
        "num": "24",
        "name": "DVSS",
        "side": "L",
        "type": "Ground",
        "desc": "數位核心接地回路。"
      },
      {
        "num": "25",
        "name": "PBKG",
        "side": "L",
        "type": "Ground",
        "desc": "基板(substrate)接地與 ESD 接地回路。"
      },
      {
        "num": "26",
        "name": "DVDD",
        "side": "B",
        "type": "Power",
        "desc": "數位核心 3.3V 電源輸入。"
      },
      {
        "num": "27",
        "name": "SPI1_CLK",
        "side": "B",
        "type": "Input",
        "desc": "SPI1 介面序列時脈輸入。"
      },
      {
        "num": "28",
        "name": "SPI1_SS_Z",
        "side": "B",
        "type": "Input",
        "desc": "SPI1 介面晶片選擇輸入(低電位有效)。"
      },
      {
        "num": "29",
        "name": "SPI1_DOUT",
        "side": "B",
        "type": "Output",
        "desc": "SPI1 介面資料輸出。"
      },
      {
        "num": "30",
        "name": "SPI1_DIN",
        "side": "B",
        "type": "Input",
        "desc": "SPI1 介面資料輸入。"
      },
      {
        "num": "31",
        "name": "SPI2_DIN",
        "side": "B",
        "type": "Input",
        "desc": "SPI2 介面資料輸入。"
      },
      {
        "num": "32",
        "name": "SPI2_DOUT",
        "side": "B",
        "type": "Output",
        "desc": "SPI2 介面資料輸出。"
      },
      {
        "num": "33",
        "name": "SPI2_SS_Z",
        "side": "B",
        "type": "Input",
        "desc": "SPI2 介面晶片選擇輸入(低電位有效)。"
      },
      {
        "num": "34",
        "name": "SPI2_CLK",
        "side": "B",
        "type": "Input",
        "desc": "SPI2 介面序列時脈輸入。"
      },
      {
        "num": "35",
        "name": "VSS_IO",
        "side": "B",
        "type": "Ground",
        "desc": "數位 IO 介面接地。"
      },
      {
        "num": "36",
        "name": "VDD_IO",
        "side": "B",
        "type": "Power",
        "desc": "IO 電源軌 3.3V 供電輸入。"
      },
      {
        "num": "37",
        "name": "EXT_SMPL",
        "side": "B",
        "type": "Input",
        "desc": "保留腳，須接地。"
      },
      {
        "num": "38",
        "name": "DRV_EN",
        "side": "B",
        "type": "Output",
        "desc": "LM3409 驅動致能輸出。"
      },
      {
        "num": "39",
        "name": "CMODE",
        "side": "B",
        "type": "Output",
        "desc": "電容選擇輸出(CM 模式下可用較小電容以降低過衝/欠衝)，開集極輸出。"
      },
      {
        "num": "40",
        "name": "DMUX0",
        "side": "B",
        "type": "Output",
        "desc": "數位測試點輸出。"
      },
      {
        "num": "41",
        "name": "DMUX1",
        "side": "B",
        "type": "Output",
        "desc": "數位測試點輸出。"
      },
      {
        "num": "42",
        "name": "DRVR_PWR",
        "side": "B",
        "type": "Power",
        "desc": "FET 驅動器電源輸入(6V 或 3.3V)；供 S_EN1、S_EN2、R_EN、G_EN、B_EN 輸出使用。"
      },
      {
        "num": "43",
        "name": "S_EN1",
        "side": "B",
        "type": "Output",
        "desc": "低阻抗分流 NFET 驅動致能(高電位=分流動作)。"
      },
      {
        "num": "44",
        "name": "S_EN2",
        "side": "B",
        "type": "Output",
        "desc": "高阻抗分流 NFET 驅動致能(高電位=分流動作)。"
      },
      {
        "num": "45",
        "name": "R_EN",
        "side": "B",
        "type": "Output",
        "desc": "紅色通道選擇，驅動低側 NFET。"
      },
      {
        "num": "46",
        "name": "G_EN",
        "side": "B",
        "type": "Output",
        "desc": "綠色通道選擇，驅動低側 NFET。"
      },
      {
        "num": "47",
        "name": "B_EN",
        "side": "B",
        "type": "Output",
        "desc": "藍色通道選擇，驅動低側 NFET。"
      },
      {
        "num": "48",
        "name": "VSS_DRVR",
        "side": "B",
        "type": "Ground",
        "desc": "FET 驅動器電源接地。"
      },
      {
        "num": "49",
        "name": "DMD_VOFFSET",
        "side": "B",
        "type": "Power",
        "desc": "VOFFSET 輸出軌；須於此腳接 1µF 陶瓷電容至地。"
      },
      {
        "num": "50",
        "name": "DMD_VBIAS",
        "side": "B",
        "type": "Power",
        "desc": "VBIAS 輸出軌；須於此腳接 0.47µF 陶瓷電容至地。"
      },
      {
        "num": "75",
        "name": "PBKG",
        "side": "R",
        "type": "Ground",
        "desc": "基板(substrate)接地與 ESD 接地回路。"
      },
      {
        "num": "74",
        "name": "TIA_PD1_FILT",
        "side": "R",
        "type": "Output",
        "desc": "TIA1 外接濾波電容—低頻寬取樣。"
      },
      {
        "num": "73",
        "name": "TIA_PD1",
        "side": "R",
        "type": "Input",
        "desc": "TIA1 光電二極體陰極驅動。"
      },
      {
        "num": "72",
        "name": "VSS_TIA1",
        "side": "R",
        "type": "Ground",
        "desc": "TIA1 專用接地。"
      },
      {
        "num": "71",
        "name": "VSS_TIA2",
        "side": "R",
        "type": "Ground",
        "desc": "TIA2 專用接地。"
      },
      {
        "num": "70",
        "name": "TIA_PD2",
        "side": "R",
        "type": "Input",
        "desc": "TIA2 光電二極體陰極驅動。"
      },
      {
        "num": "69",
        "name": "TIA_PD2_FILT",
        "side": "R",
        "type": "Output",
        "desc": "TIA2 外接濾波電容—低頻寬取樣。"
      },
      {
        "num": "68",
        "name": "VLDOT_3P3V",
        "side": "R",
        "type": "Power",
        "desc": "3.3V TIA LDO 濾波電容介面。"
      },
      {
        "num": "67",
        "name": "VIN_LDOT_3P3V",
        "side": "R",
        "type": "Power",
        "desc": "3.3V TIA LDO 之 6V 電源輸入。"
      },
      {
        "num": "66",
        "name": "GND_LDO",
        "side": "R",
        "type": "Ground",
        "desc": "LDO 電源接地回路。"
      },
      {
        "num": "65",
        "name": "VIN_LDOT_5V",
        "side": "R",
        "type": "Power",
        "desc": "5V TIA LDO 之 6V 電源輸入。"
      },
      {
        "num": "64",
        "name": "VLDOT_5V",
        "side": "R",
        "type": "Power",
        "desc": "5V TIA LDO 濾波電容介面。"
      },
      {
        "num": "63",
        "name": "VLDOT_M8",
        "side": "R",
        "type": "Power",
        "desc": "TIA 介面專用 −8V LDO 輸出。"
      },
      {
        "num": "62",
        "name": "VIN_LDOT_M8",
        "side": "R",
        "type": "Output",
        "desc": "TIA 介面專用 −8V LDO 外部調整用 FET 驅動訊號。"
      },
      {
        "num": "61",
        "name": "AMUX0",
        "side": "R",
        "type": "Output",
        "desc": "類比測試多工器輸出0。"
      },
      {
        "num": "60",
        "name": "PBKG",
        "side": "R",
        "type": "Ground",
        "desc": "基板(substrate)接地與 ESD 接地回路。"
      },
      {
        "num": "59",
        "name": "AVDD",
        "side": "R",
        "type": "Power",
        "desc": "類比電路 3.3V 電源供電輸入。"
      },
      {
        "num": "58",
        "name": "VMAIN",
        "side": "R",
        "type": "Input",
        "desc": "主要中間電壓監控輸入；以外部電阻分壓器設定電壓輸入以進行欠壓(brownout)監控。"
      },
      {
        "num": "57",
        "name": "AMUX1",
        "side": "R",
        "type": "Output",
        "desc": "類比測試多工器輸出1。"
      },
      {
        "num": "56",
        "name": "VSS_DRST",
        "side": "R",
        "type": "Ground",
        "desc": "DMD 電源供應接地。"
      },
      {
        "num": "55",
        "name": "VIN_DRST",
        "side": "R",
        "type": "Power",
        "desc": "DMD 電源供應 6V 輸入。"
      },
      {
        "num": "54",
        "name": "DRST_HS_IND",
        "side": "R",
        "type": "Power",
        "desc": "DMD 電源供應用電感(10µH)接點。"
      },
      {
        "num": "53",
        "name": "DRST_PGND",
        "side": "R",
        "type": "Ground",
        "desc": "DMD 電源供應之功率接地；須接至接地平面。"
      },
      {
        "num": "52",
        "name": "DRST_LS_IND",
        "side": "R",
        "type": "Power",
        "desc": "DMD 電源供應用電感(10µH)接點；須接 330pF/50V 電容至地(建議 X7R)。"
      },
      {
        "num": "51",
        "name": "DMD_VRESET",
        "side": "R",
        "type": "Power",
        "desc": "VRESET 輸出軌；須接 1µF 陶瓷電容至地，並經外部二極體接至 DRST_HS_IND(二極體陽極接 DMD_VRESET)。"
      },
      {
        "num": "100",
        "name": "AVSS",
        "side": "T",
        "type": "Ground",
        "desc": "類比接地。"
      },
      {
        "num": "99",
        "name": "PBKG",
        "side": "T",
        "type": "Ground",
        "desc": "基板(substrate)接地與 ESD 接地回路。"
      },
      {
        "num": "98",
        "name": "V1P1V",
        "side": "T",
        "type": "Input",
        "desc": "外部 1.1V buck 電壓監控輸入。"
      },
      {
        "num": "97",
        "name": "V1P8V",
        "side": "T",
        "type": "Input",
        "desc": "外部 1.8V buck 電壓監控輸入。"
      },
      {
        "num": "96",
        "name": "V3P3V",
        "side": "T",
        "type": "Input",
        "desc": "外部 3.3V buck 電壓監控輸入。"
      },
      {
        "num": "95",
        "name": "ADC_VREF",
        "side": "T",
        "type": "Power",
        "desc": "ADC 參考電壓輸出。"
      },
      {
        "num": "94",
        "name": "ADC_IN7",
        "side": "T",
        "type": "Analog In",
        "desc": "外部類比訊號輸入通道7，經專用 ADC 介面取樣。"
      },
      {
        "num": "93",
        "name": "ADC_IN6",
        "side": "T",
        "type": "Analog In",
        "desc": "外部類比訊號輸入通道6，經專用 ADC 介面取樣。"
      },
      {
        "num": "92",
        "name": "ADC_IN5",
        "side": "T",
        "type": "Analog In",
        "desc": "外部類比訊號輸入通道5，經專用 ADC 介面取樣。"
      },
      {
        "num": "91",
        "name": "VSSL_ADC",
        "side": "T",
        "type": "Ground",
        "desc": "外部 ADC 通道 bondwire 與導線架隔離接地。"
      },
      {
        "num": "90",
        "name": "ADC_IN4",
        "side": "T",
        "type": "Analog In",
        "desc": "外部類比訊號輸入通道4，經專用 ADC 介面取樣。"
      },
      {
        "num": "89",
        "name": "VSSL_ADC",
        "side": "T",
        "type": "Ground",
        "desc": "外部 ADC 通道 bondwire 與導線架隔離接地。"
      },
      {
        "num": "88",
        "name": "ADC_IN3",
        "side": "T",
        "type": "Analog In",
        "desc": "外部類比訊號輸入通道3，經專用 ADC 介面取樣。"
      },
      {
        "num": "87",
        "name": "VSSL_ADC",
        "side": "T",
        "type": "Ground",
        "desc": "外部 ADC 通道 bondwire 與導線架隔離接地。"
      },
      {
        "num": "86",
        "name": "ADC_IN2",
        "side": "T",
        "type": "Analog In",
        "desc": "外部類比訊號輸入通道2，經專用 ADC 介面取樣。"
      },
      {
        "num": "85",
        "name": "ADC_IN1",
        "side": "T",
        "type": "Analog In",
        "desc": "外部類比訊號輸入通道1，經專用 ADC 介面(VSSL_ADC 隔離接地)取樣。"
      },
      {
        "num": "84",
        "name": "VSSL_ADC",
        "side": "T",
        "type": "Ground",
        "desc": "外部 ADC 通道 bondwire 與導線架隔離接地。"
      },
      {
        "num": "83",
        "name": "LS_SENSE_P",
        "side": "T",
        "type": "Analog In",
        "desc": "低側電流/電壓感測正端輸入。"
      },
      {
        "num": "82",
        "name": "LS_SENSE_N",
        "side": "T",
        "type": "Analog In",
        "desc": "低側電流/電壓感測負端輸入。"
      },
      {
        "num": "81",
        "name": "VSSL_ADC",
        "side": "T",
        "type": "Ground",
        "desc": "外部 ADC 通道 bondwire 與導線架隔離接地。"
      },
      {
        "num": "80",
        "name": "VLDOA_3P3",
        "side": "T",
        "type": "Power",
        "desc": "外部 ADC 介面專用 3.3V LDO 濾波電容輸出。"
      },
      {
        "num": "79",
        "name": "VIN_LDOA_3P3",
        "side": "T",
        "type": "Power",
        "desc": "外部 ADC 介面專用 3.3V LDO 供電之 6V 電源輸入。"
      },
      {
        "num": "78",
        "name": "AVSS",
        "side": "T",
        "type": "Ground",
        "desc": "類比接地。"
      },
      {
        "num": "77",
        "name": "IADJ",
        "side": "T",
        "type": "Analog Out",
        "desc": "電流輸出，用於調整外部 LED 控制器的驅動電流設定點。"
      },
      {
        "num": "76",
        "name": "R_IADJ",
        "side": "T",
        "type": "Analog In",
        "desc": "外部電阻接點，將 IADJ 電壓轉換為電流設定用途。"
      }
    ],
    "specs": [
      {
        "k": "封裝",
        "v": "100-Pin HTQFP(PZP)"
      },
      {
        "k": "電源監控/致能通道",
        "v": "1.1V/1.8V/3.3V 三組外部 buck 致能(ENB_1P1V/1P8V/3P3V)與電壓監控(V1P1V/1P8V/3P3V)"
      },
      {
        "k": "DMD 電源軌",
        "v": "VOFFSET(1µF)、VBIAS(0.47µF)、VRESET(1µF，經二極體接 DRST_HS_IND)，DRST 級 6V 輸入"
      },
      {
        "k": "TIA 通道數",
        "v": "2 通道(PD1/PD2)，各具專屬濾波與 LDO(3.3V/5V/−8V)"
      },
      {
        "k": "外部 ADC 介面",
        "v": "7 類比輸入通道(ADC_IN1-7)＋ADC_VREF 參考輸出＋專用 SPI(ADC_MISO/MOSI，詳細功能見 datasheet)"
      },
      {
        "k": "數位介面",
        "v": "SPI1、SPI2 各一組(CLK/DIN/DOUT/SS_Z)，詳細功能見 datasheet"
      },
      {
        "k": "LED/雷射驅動通道",
        "v": "R_EN/G_EN/B_EN 三色低側驅動＋S_EN1/S_EN2 分流驅動，IADJ/R_IADJ 設定外部電流"
      },
      {
        "k": "看門狗/系統握手",
        "v": "WD1、WD2 中斷通道；PARK_Z、RESET_Z、INT_Z 與 DLPC23xS-Q1 握手；PROJ_ON 投影機致能"
      },
      {
        "k": "文件版本",
        "v": "DLPS298 – DECEMBER 2025"
      }
    ],
    "secondSource": [
      "封裝+pinout 完全相容(100-Pin HTQFP PZP，pin-to-pin)",
      "電源監控/致能腳數與電壓等級一致(1.1V/1.8V/3.3V 三組)",
      "DMD 專用電源軌(VOFFSET/VBIAS/VRESET)電壓與外接電容需求一致",
      "TIA 光電前端通道數(2)與專屬 LDO 電壓(3.3V/5V/−8V)一致",
      "LED/雷射驅動通道數與邏輯(R/G/B、分流 S_EN1/S_EN2)一致",
      "外部 ADC 介面通道數(7)與參考輸出一致",
      "車規認證(AEC-Q100)等級同等或更佳",
      "本條目 19 腳功能敘述未完整核實(見 desc 說明)，選用替代料前務必以原廠完整 datasheet 覆核這些腳位"
    ],
    "dropIn": []
  },
  {
    "part": "LM851772-Q1",
    "mfr": "Texas Instruments",
    "category": "power",
    "subcategory": "車用同步 Buck-Boost 雙半橋閘極驅動控制器",
    "package": "40-Pin QFN(RHA)",
    "whatIs": "車用同步 buck-boost/雙半橋閘極驅動控制器 IC：整合類比前端(電流/電壓感測)、I2C 數位介面與 buck+boost 雙半橋閘極驅動，可組成四開關 buck-boost 或雙路獨立降壓/升壓轉換器，供車用電源系統使用。",
    "func": "VCC1 為輔助5V穩壓器輸出；SS/ATRK 兼具軟啟動程式化(外接電容至AGND)與類比輸出電壓追蹤(可接可變電壓參考如DAC，內部電路取此腳電壓與內部參考電壓中較低者)兩種功能；SYNC 為同步時脈輸入/輸出(可設定0°或180°相位供雙裝置並聯運作)；DTRK 為動態輸出電壓追蹤用數位PWM輸入；SDA/SCL 構成I2C介面(須外接提升電阻)；MODE 選擇省電模式(PSM)或強制PWM/CCM運作，可動態切換；CFG2 透過外接電阻至GND選擇裝置運作設定；ADDR(CFG1) 設定I2C位址LSB；CDC 為纜線壓降補償或電流監控輸出(可經電阻至AGND設定增益)；nFLT/nINT 為開集極故障/電源良好或中斷輸出(STATUS暫存器變動時拉低256µs)；RT 外接電阻至AGND設定切換頻率；COMP 為誤差放大器輸出，須外接RC補償網路；FB/SEL_intFB 為輸出電壓回授腳，接VCC2可選用裝置預設固定輸出電壓，或啟動前接VCC2選擇內部回授；ILIMCOMP 為平均電流限制迴路補償/設定腳(可用內部DAC或外接電阻設定門檻，接VCC2可停用此區塊降低靜態電流)；VOUT為輸出電壓感測輸入；ISNSN/ISNSP為(選用)平均電流感測放大器差動輸入，可置於輸入側或輸出側，停用時可分別接地或短接至AGND；CSB/CSA為電感峰值電流感測差動輸入，須以Kelvin接法連接外部感測電阻；SW1/HO1/HB1/LO1與PGND構成buck半橋(HB1須外接bootstrap電容至SW1)；VCC2為內部線性偏壓穩壓器輸出，供內部邏輯與閘極驅動器；SW2/HO2/HB2/LO2構成boost半橋(HB2須外接bootstrap電容至SW2)；DRV1為可設定的外部FET驅動腳(推挽/開集極/電荷幫浦三種型態擇一)；BIAS為VCC2偏壓穩壓器的選用外部輸入，可降低高VIN下內部LDO功耗；EN/UVLO為致能輸入，具精準類比比較器與遲滯，搭配電阻分壓器可程式化UVLO；nRST為裝置內部邏輯/介面/VCC1穩壓器致能輸入；VIN為功率級供電與感測輸入；散熱墊內部接地。",
    "usedIn": "車用電源轉換模組，如車載充電、LED/馬達驅動前級等需要 buck-boost 雙半橋閘極驅動、精準電流/電壓感測與 I2C 數位控制的應用（本文件標註 ADVANCE INFORMATION，規格可能異動）。",
    "desc": "40-Pin QFN(RHA)封裝，車用同步 buck+boost 雙半橋閘極驅動控制器，整合 I2C 數位介面、可程式化軟啟動/追蹤、峰值與平均電流感測，含 3 顆 NC 腳(26,34,39)與 1 個散熱墊(內部接地)。本文件為 ADVANCE INFORMATION(2026-06)，規格可能異動。",
    "datasheet": "https://www.ti.com/lit/ds/symlink/lm851772-q1.pdf",
    "pins": [
      {
        "num": "1",
        "name": "VCC1",
        "type": "Power",
        "desc": "輔助 5V 穩壓器輸出；靠近此腳放置去耦電容。若依邏輯設定停用此輸出，須以電阻將此腳接地或提升至 VCC2；不可懸空。",
        "side": "L"
      },
      {
        "num": "2",
        "name": "SS/ATRK",
        "type": "Analog In",
        "desc": "軟啟動程式化腳：於 SS 腳與 AGND 間接電容可設定軟啟動時間。亦為類比輸出電壓追蹤(analog output voltage tracking)腳：可接至可變電壓參考(例如 DAC)以程式化 VOUT 調節目標；內部電路會在此腳電壓與內部參考電壓間選擇較低者。",
        "side": "L"
      },
      {
        "num": "3",
        "name": "SYNC",
        "type": "Input",
        "desc": "同步時脈輸入/輸出腳：運作中若偵測到有效外部時脈訊號，內部振盪器會同步至該時脈；不可懸空，若不使用此功能請接至 VCC2 或 GND。此腳亦可依裝置邏輯設定輸出同步時脈訊號，相位可選 0° 或 180°，供兩顆裝置並聯(雙相)運作。",
        "side": "L"
      },
      {
        "num": "4",
        "name": "DTRK",
        "type": "Input",
        "desc": "動態輸出電壓追蹤用數位 PWM 輸入腳；不可懸空，若不使用此功能請接至 VCC 或 GND。",
        "side": "L"
      },
      {
        "num": "5",
        "name": "SDA",
        "type": "I/O",
        "desc": "I2C 介面序列資料線；須外接提升電阻。",
        "side": "L"
      },
      {
        "num": "6",
        "name": "SCL",
        "type": "Input",
        "desc": "I2C 介面序列時脈線；須外接提升電阻。",
        "side": "L"
      },
      {
        "num": "7",
        "name": "MODE",
        "type": "Input",
        "desc": "裝置運作模式選擇數位輸入：低電位=省電模式(PSM)、高電位=強制 PWM/CCM 運作；運作中可動態切換模式；不可懸空。",
        "side": "L"
      },
      {
        "num": "8",
        "name": "CFG2",
        "type": "I/O",
        "desc": "裝置設定腳；於 CFG2 與 GND 間接電阻以選擇裝置運作方式(詳見原廠 datasheet)。",
        "side": "L"
      },
      {
        "num": "9",
        "name": "ADDR(CFG1)",
        "type": "Input",
        "desc": "位址選擇腳；接地=I2C 目標位址 LSB=0，接 VCC2=I2C 目標位址 LSB=1。",
        "side": "L"
      },
      {
        "num": "10",
        "name": "CDC",
        "type": "Analog Out",
        "desc": "纜線壓降補償(cable drop compensation)或電流監控輸出腳；於 CDC 與 AGND 間接電阻以選擇補償增益。預設此腳輸出 ISNSP 與 ISNSN 間感測電壓的電流監控訊號；若停用電流監控功能，將 CDC 接地。",
        "side": "L"
      },
      {
        "num": "11",
        "name": "nFLT/nINT",
        "type": "Output",
        "desc": "開集極輸出腳，用於故障指示或電源良好指示；若設定為中斷腳，STATUS 暫存器變動時此腳會拉低 256µs。",
        "side": "B"
      },
      {
        "num": "12",
        "name": "RT",
        "type": "Analog In",
        "desc": "切換頻率程式化腳；於 RT 與 AGND 間接外部電阻以設定切換頻率。",
        "side": "B"
      },
      {
        "num": "13",
        "name": "COMP",
        "type": "Output",
        "desc": "誤差放大器輸出；須於 COMP 與 AGND 間接外部 RC 網路以穩定/補償穩壓迴路。",
        "side": "B"
      },
      {
        "num": "14",
        "name": "FB/SEL_intFB",
        "type": "Analog In",
        "desc": "輸出電壓調節回授腳；由轉換器輸出端接電阻分壓網路至 FB 腳。將 FB 接至 VCC2 可運作於裝置預設的固定輸出電壓；欲選擇內部回授，須在裝置啟動前將此腳接至 VCC2。",
        "side": "B"
      },
      {
        "num": "15",
        "name": "AGND",
        "type": "Ground",
        "desc": "接至 AGND(類比地)。",
        "side": "B"
      },
      {
        "num": "16",
        "name": "ILIMCOMP",
        "type": "Analog In",
        "desc": "平均電流限制迴路補償腳；若電流限制由內部 DAC 設定，須接電容或 2R-C 型網路。若停用內部 DAC，此腳可設定平均電流限制門檻，須接電阻至 AGND，並依應用需求並接濾波電容。將 ILIMCOMP 接至 VCC2 可停用此功能並降低靜態電流。",
        "side": "B"
      },
      {
        "num": "17",
        "name": "AGND",
        "type": "Ground",
        "desc": "類比地。",
        "side": "B"
      },
      {
        "num": "18",
        "name": "VOUT",
        "type": "Analog In",
        "desc": "輸出電壓感測輸入；連接至功率級輸出軌。",
        "side": "B"
      },
      {
        "num": "19",
        "name": "ISNSN",
        "type": "Analog In",
        "desc": "輸出或輸入平均電流感測放大器負端感測輸入；若使用內部平均電流感測器，須於 ISNSN 與 ISNSP 間接選用的電流感測電阻(可置於功率級輸入側或輸出側)。若停用選用電流感測器，將 ISNSN 與 ISNSP 一併接至 AGND。",
        "side": "B"
      },
      {
        "num": "20",
        "name": "ISNSP",
        "type": "Analog In",
        "desc": "輸出或輸入電流感測放大器正端感測輸入；若使用內部平均電流感測器，須於 ISNSN 與 ISNSP 間接選用的電流感測電阻(可置於功率級輸入側或輸出側)。若停用選用電流感測器，將 ISNSP 接地。",
        "side": "B"
      },
      {
        "num": "30",
        "name": "LO2",
        "type": "Output",
        "desc": "boost 半橋低側閘極驅動輸出。",
        "side": "R"
      },
      {
        "num": "29",
        "name": "VCC2",
        "type": "Power",
        "desc": "內部線性偏壓穩壓器輸出；須於 VCC 與 PGND 間接陶瓷去耦電容，此電源軌供內部邏輯與閘極驅動器使用。電容須靠近此腳放置，腳與電容間不可有電阻，以利良好去耦。",
        "side": "R"
      },
      {
        "num": "28",
        "name": "PGND",
        "type": "Ground",
        "desc": "功率地。",
        "side": "R"
      },
      {
        "num": "27",
        "name": "LO1",
        "type": "Output",
        "desc": "buck 半橋低側閘極驅動輸出。",
        "side": "R"
      },
      {
        "num": "26",
        "name": "NC",
        "type": "NC",
        "desc": "無內部連接(Not Connected)。",
        "side": "R"
      },
      {
        "num": "25",
        "name": "HB1",
        "type": "Power",
        "desc": "buck 半橋 bootstrap 供電腳；須於 HB1 與 SW1 間接外部電容，為高側 MOSFET 閘極驅動器提供偏壓。電容須靠近此腳放置，腳與電容間不可有電阻，以利良好去耦。",
        "side": "R"
      },
      {
        "num": "24",
        "name": "HO1",
        "type": "Output",
        "desc": "buck 半橋高側閘極驅動輸出。",
        "side": "R"
      },
      {
        "num": "23",
        "name": "SW1",
        "type": "Power",
        "desc": "buck 半橋電感切換節點。",
        "side": "R"
      },
      {
        "num": "22",
        "name": "CSA",
        "type": "Analog In",
        "desc": "電感峰值電流感測正端輸入；以 Kelvin 接法連接至外部電流感測電阻的正端。",
        "side": "R"
      },
      {
        "num": "21",
        "name": "CSB",
        "type": "Analog In",
        "desc": "電感峰值電流感測負端輸入；以 Kelvin 接法連接至外部電流感測電阻的負端。",
        "side": "R"
      },
      {
        "num": "40",
        "name": "VIN",
        "type": "Power",
        "desc": "輸入電源與感測輸入；連接至功率級供電電源。",
        "side": "T"
      },
      {
        "num": "39",
        "name": "NC",
        "type": "NC",
        "desc": "無內部連接(Not Connected)。",
        "side": "T"
      },
      {
        "num": "38",
        "name": "nRST",
        "type": "Input",
        "desc": "數位輸入腳，用於致能裝置內部邏輯、介面運作，以及(若已選用)VCC1 穩壓器。",
        "side": "T"
      },
      {
        "num": "37",
        "name": "EN/UVLO",
        "type": "Input",
        "desc": "致能腳，數位輸入以致能轉換器切換動作。此輸入具備精準類比比較器與遲滯特性以監控輸入電壓；須接電阻分壓器(由輸入電壓分壓)以維持 UVLO(欠壓鎖定)功能。",
        "side": "T"
      },
      {
        "num": "36",
        "name": "BIAS",
        "type": "Power",
        "desc": "VCC2 偏壓穩壓器選用輸入；以外部電源對 VCC2 供電(取代由 VIN 供電)，可在高 VIN 時降低內部 LDO 的功率損耗。",
        "side": "T"
      },
      {
        "num": "35",
        "name": "DRV1",
        "type": "Output",
        "desc": "外部 FET 驅動腳；依所選設定可作為高壓推挽(push-pull)級、開集極輸出、或電荷幫浦(charge pump)驅動級。若不使用此選用 DRV 腳功能，保持懸空。",
        "side": "T"
      },
      {
        "num": "34",
        "name": "NC",
        "type": "NC",
        "desc": "無內部連接(Not Connected)。",
        "side": "T"
      },
      {
        "num": "33",
        "name": "SW2",
        "type": "Power",
        "desc": "boost 半橋電感切換節點。",
        "side": "T"
      },
      {
        "num": "32",
        "name": "HO2",
        "type": "Output",
        "desc": "boost 半橋高側閘極驅動輸出。",
        "side": "T"
      },
      {
        "num": "31",
        "name": "HB2",
        "type": "Power",
        "desc": "boost 半橋 bootstrap 供電腳；須於 HB2 與 SW2 間接外部電容，為高側 MOSFET 閘極驅動器提供偏壓。電容須靠近此腳放置，腳與電容間不可有電阻，以利良好去耦。",
        "side": "T"
      },
      {
        "num": "PAD",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "散熱墊(Thermal Pad)，內部接地。",
        "ep": true
      }
    ],
    "specs": [
      {
        "k": "輸入電壓(建議操作)",
        "v": "0V ~ 80V(VIN)，啟動電壓 3.5V"
      },
      {
        "k": "BIAS 輸入電壓範圍",
        "v": "0V ~ 55V"
      },
      {
        "k": "輸出電壓感測範圍",
        "v": "1V ~ 55V"
      },
      {
        "k": "開關頻率",
        "v": "100kHz ~ 2.2MHz(典型)，可外部同步"
      },
      {
        "k": "電流限制感測電阻",
        "v": "典型 10mΩ，容差 ±1%"
      },
      {
        "k": "VCC1/VCC2 輸出電容需求",
        "v": "VCC1 ≥2µF、VCC2 ≥6µF"
      },
      {
        "k": "ESD",
        "v": "HBM ±2000V；CDM 角腳 ±750V、其他腳 ±500V"
      },
      {
        "k": "工作接面溫度",
        "v": "−40°C ~ 150°C"
      },
      {
        "k": "熱阻(RθJA)",
        "v": "33.9°C/W(40-Pin QFN)"
      },
      {
        "k": "封裝",
        "v": "40-Pin QFN(RHA)"
      },
      {
        "k": "文件狀態",
        "v": "ADVANCE INFORMATION，SLVSJL6 – JUNE 2026"
      }
    ],
    "secondSource": [
      "封裝+pinout 相容(40-Pin QFN RHA，pin-to-pin)",
      "輸入電壓範圍涵蓋(0~80V)，BIAS 輸入範圍涵蓋(0~55V)",
      "開關頻率可調範圍涵蓋(100kHz~2.2MHz)且支援外部同步(0°/180°相位)",
      "buck+boost 雙半橋閘極驅動架構與 bootstrap 電容需求一致(HB1/SW1、HB2/SW2)",
      "電流感測架構一致(峰值 CSA/CSB Kelvin 接法 + 選用平均電流感測 ISNSP/ISNSN)",
      "I2C 位址選擇與介面邏輯(ADDR/CFG1、CFG2 設定電阻)相容",
      "車規認證(AEC-Q100)等級同等或更佳",
      "本文件為 ADVANCE INFORMATION，正式量產版規格請以原廠最終 datasheet 為準"
    ],
    "dropIn": []
  },
  {
    "part": "TAC5111-Q1",
    "mfr": "Texas Instruments",
    "category": "audio",
    "subcategory": "車用音訊 Codec（mono ADC＋DAC）",
    "package": "32-WQFN (RTV) 5×5mm 0.5mm pitch",
    "whatIs": "車規低功耗單聲道音訊 Codec：105dB 動態範圍 ADC＋114dB 動態範圍 DAC，支援差動/單端輸入輸出，AEC-Q100 Grade 1（−40~+125°C），供 eCall、車用主機等音訊擷取與播放。",
    "func": "ADC 支援線路/麥克風差動輸入（2VRMS 滿刻度）與 AC/DC 耦合，內建可程式麥克風偏壓（最高 3V）；DAC 可組態線路輸出或耳機負載（16Ω 驅動至 62.5mW），支援差動 2VRMS／單端 1VRMS。整合可程式通道增益、數位音量、低抖動 PLL、HPF/雙二階 EQ、低延遲濾波模式；取樣率 4kHz~768kHz、自動時脈/取樣率偵測；音訊介面 TDM/I2S/LJ（16/20/24/32-bit），控制介面 I2C 或 SPI；語音/超音波活動偵測、電池與熱回退保護。",
    "usedIn": "車用緊急呼叫（eCall）、車載資通訊（Telematics）控制單元、主動降噪（ANC）、車用主機等空間受限的車規音訊系統。",
    "desc": "車規單聲道音訊 Codec：105dB ADC＋114dB DAC、4k~768kHz 取樣、TDM/I2S/LJ、I2C/SPI 控制、AEC-Q100 Grade 1，32-WQFN 5×5mm。",
    "datasheet": "TI SLASFC3A",
    "pins": [
      {
        "num": "1",
        "name": "VSS",
        "side": "L",
        "type": "Ground",
        "desc": "接地腳，直接短接板上接地平面"
      },
      {
        "num": "2",
        "name": "DREG",
        "side": "L",
        "type": "Power",
        "desc": "數位側片上穩壓器輸出（標稱 1.5V），供內部數位電源；外接去耦電容"
      },
      {
        "num": "3",
        "name": "BCLK",
        "side": "L",
        "type": "I/O",
        "desc": "音訊序列介面位元時脈（bus controller/target 模式皆可）"
      },
      {
        "num": "4",
        "name": "FSYNC",
        "side": "L",
        "type": "I/O",
        "desc": "音訊序列介面框同步訊號"
      },
      {
        "num": "5",
        "name": "DOUT",
        "side": "L",
        "type": "I/O",
        "desc": "音訊序列介面資料輸出"
      },
      {
        "num": "6",
        "name": "DIN",
        "side": "L",
        "type": "Input",
        "desc": "音訊序列介面資料輸入"
      },
      {
        "num": "7",
        "name": "IOVDD",
        "side": "L",
        "type": "Power",
        "desc": "數位 I/O 電源（標稱 1.2V／1.8V／3.3V）"
      },
      {
        "num": "8",
        "name": "VSS",
        "side": "L",
        "type": "Ground",
        "desc": "接地腳，直接短接板上接地平面"
      },
      {
        "num": "9",
        "name": "SCL",
        "side": "B",
        "type": "Input",
        "desc": "I2C 控制介面時脈（SPI 模式時功能見 datasheet）"
      },
      {
        "num": "10",
        "name": "SDA",
        "side": "B",
        "type": "I/O",
        "desc": "I2C 控制介面資料（表列 Digital Input，I2C 資料線實務為雙向開汲極）"
      },
      {
        "num": "11",
        "name": "GPIO1",
        "side": "B",
        "type": "I/O",
        "desc": "通用數位輸出入 1（菊鏈輸入、音訊資料輸出、PLL 時脈源、中斷等多工功能）"
      },
      {
        "num": "12",
        "name": "GPIO2",
        "side": "B",
        "type": "I/O",
        "desc": "通用數位輸出入 2（菊鏈輸入、音訊資料輸出、PLL 時脈源、中斷等多工功能）"
      },
      {
        "num": "13",
        "name": "GPO1",
        "side": "B",
        "type": "Output",
        "desc": "通用數位輸出 1（音訊資料輸出、中斷等多工功能）"
      },
      {
        "num": "14",
        "name": "GPI1",
        "side": "B",
        "type": "Input",
        "desc": "通用數位輸入 1（菊鏈輸入、PLL 時脈源等多工功能）"
      },
      {
        "num": "15",
        "name": "VSS",
        "side": "B",
        "type": "Ground",
        "desc": "接地腳，直接短接板上接地平面"
      },
      {
        "num": "16",
        "name": "ADDR",
        "side": "B",
        "type": "Analog In",
        "desc": "I2C 位址設定腳（類比位準偵測）"
      },
      {
        "num": "17",
        "name": "MICBIAS",
        "side": "R",
        "type": "Analog Out",
        "desc": "麥克風偏壓輸出（可程式，最高 3V）"
      },
      {
        "num": "18",
        "name": "IN1P",
        "side": "R",
        "type": "Analog In",
        "desc": "類比輸入 1P（差動正端；亦支援單端組態）"
      },
      {
        "num": "19",
        "name": "IN1M",
        "side": "R",
        "type": "Analog In",
        "desc": "類比輸入 1M（差動負端）"
      },
      {
        "num": "20",
        "name": "IN2P",
        "side": "R",
        "type": "Analog In",
        "desc": "類比輸入 2P（使用 ADC 通道交換選項時）"
      },
      {
        "num": "21",
        "name": "IN2M",
        "side": "R",
        "type": "Analog In",
        "desc": "類比輸入 2M（使用 ADC 通道交換選項時）"
      },
      {
        "num": "22",
        "name": "VSSI",
        "side": "R",
        "type": "Ground",
        "desc": "接地，直接短接板上接地平面"
      },
      {
        "num": "23",
        "name": "VSSI",
        "side": "R",
        "type": "Ground",
        "desc": "接地，直接短接板上接地平面"
      },
      {
        "num": "24",
        "name": "VSSI",
        "side": "R",
        "type": "Ground",
        "desc": "接地，直接短接板上接地平面"
      },
      {
        "num": "25",
        "name": "VSSI",
        "side": "T",
        "type": "Ground",
        "desc": "接地，直接短接板上接地平面"
      },
      {
        "num": "26",
        "name": "VSS",
        "side": "T",
        "type": "Ground",
        "desc": "接地腳，直接短接板上接地平面"
      },
      {
        "num": "27",
        "name": "OUT1M",
        "side": "T",
        "type": "Analog Out",
        "desc": "類比輸出 1M（差動負端；線路輸出或耳機負載）"
      },
      {
        "num": "28",
        "name": "OUT1P",
        "side": "T",
        "type": "Analog Out",
        "desc": "類比輸出 1P（差動正端）"
      },
      {
        "num": "29",
        "name": "OUT2P",
        "side": "T",
        "type": "Analog Out",
        "desc": "類比輸出 2P（使用 DAC 通道交換選項時）"
      },
      {
        "num": "30",
        "name": "OUT2M",
        "side": "T",
        "type": "Analog Out",
        "desc": "類比輸出 2M（使用 DAC 通道交換選項時）"
      },
      {
        "num": "31",
        "name": "AVDD",
        "side": "T",
        "type": "Power",
        "desc": "類比電源（標稱 1.8V 或 3.3V，單電源操作）"
      },
      {
        "num": "32",
        "name": "VREF",
        "side": "T",
        "type": "Analog Out",
        "desc": "類比參考電壓濾波輸出；外接去耦電容至地"
      },
      {
        "num": "33",
        "name": "VSS (EP)",
        "side": "B",
        "type": "Ground",
        "desc": "外露散熱焊盤，內部接元件地；直接短接板上接地平面",
        "ep": true
      }
    ],
    "thermalPad": "外露焊盤=VSS（圖 4-1 中央標示 (VSS) Thermal Pad、表列 Thermal Pad 列），須短接板上接地平面",
    "specs": [
      {
        "k": "ADC 動態範圍",
        "v": "105dB（線路/麥克風差動輸入）；THD+N −97dB"
      },
      {
        "k": "DAC 動態範圍",
        "v": "114dB（差動線路/耳機輸出）；THD+N −96dB"
      },
      {
        "k": "取樣率",
        "v": "ADC/DAC 皆 4kHz ~ 768kHz"
      },
      {
        "k": "輸入/輸出",
        "v": "差動 2VRMS／單端 1VRMS；耳機 16Ω 驅動至 62.5mW"
      },
      {
        "k": "麥克風偏壓",
        "v": "可程式，最高 3V"
      },
      {
        "k": "音訊介面",
        "v": "TDM / I2S / 左對齊（16/20/24/32-bit），controller/target 模式"
      },
      {
        "k": "控制介面",
        "v": "I2C 或 SPI"
      },
      {
        "k": "電源",
        "v": "AVDD 1.8V/3.3V 單電源；IOVDD 1.2V/1.8V/3.3V"
      },
      {
        "k": "低功耗",
        "v": "1 通道錄音 5mW／播放 7mW（1.8V 供電）"
      },
      {
        "k": "車規",
        "v": "AEC-Q100 Grade 1（−40°C ~ +125°C）"
      },
      {
        "k": "封裝",
        "v": "32-WQFN (RTV) 5×5mm，0.5mm pitch，EP=VSS"
      }
    ],
    "secondSource": [
      "封裝＋pinout 相容（32-WQFN 5×5mm、EP=VSS）",
      "功能相同（車規 mono codec，ADC 105dB/DAC 114dB 同級）",
      "音訊介面相容（TDM/I2S/LJ）",
      "控制介面相容（I2C/SPI、位址設定方式）",
      "電源軌相容（AVDD 1.8/3.3V、IOVDD 1.2~3.3V）",
      "AEC-Q100 Grade 1 車規",
      "取樣率範圍涵蓋"
    ],
    "dropIn": [
      {
        "part": "TAC5112-Q1",
        "note": "同封裝同腳位（32-WQFN 逐腳同名同號）；5112 為立體聲 ADC 版，規格分級不同，確認通道需求"
      }
    ]
  },
  {
    "part": "LMKDB1112",
    "mfr": "Texas Instruments",
    "category": "clocks",
    "subcategory": "PCIe LP-HCSL 時脈緩衝器（1:12）",
    "package": "64-pin LGA (ZSF) 5×5mm",
    "whatIs": "超低附加抖動 LP-HCSL 時脈緩衝器：1 路差動輸入扇出 12 路 LP-HCSL 差動輸出，支援 PCIe Gen 1~Gen 7（CC 與 IR 架構、含 SSC 輸入），與 Intel DB1206 腳位相容。",
    "func": "12 路 LP-HCSL 輸出各有獨立 OE# 致能（內建上拉）；SBI（Side-Band Interface）可高速批次開關輸出（SBI_EN 決定 OE2/4/7/10 腳的雙重功能）；SMBus 介面（SADR0/1 三階位址）供暫存器控制；LOS# 開汲極輸出指示輸入時脈遺失；fail-safe 輸入、彈性上電順序、自動輸出停用；輸出阻抗 85Ω/100Ω 可選、斜率兩檔（SLEWRATE_SEL）。",
    "usedIn": "高效能運算、伺服器主機板、NIC/SmartNIC、硬體加速卡等 PCIe 時脈樹扇出（AI 伺服器 PCIe retimer/switch 前端常見）。",
    "desc": "PCIe Gen1~7 LP-HCSL 1:12 時脈緩衝器，附加抖動 5fs（Gen5）/2.1fs（Gen7）max，SMBus＋SBI 控制，1.8V/3.3V 供電，64-LGA 5×5mm（DB1206 腳位相容）。",
    "datasheet": "TI SNAS855G（LMKDB11xx family）",
    "pins": [
      {
        "num": "E1",
        "name": "CLKIN_P",
        "side": "L",
        "type": "Input",
        "desc": "差動時脈輸入正端"
      },
      {
        "num": "F1",
        "name": "CLKIN_N",
        "side": "L",
        "type": "Input",
        "desc": "差動時脈輸入負端"
      },
      {
        "num": "D1",
        "name": "SMB_CLK",
        "side": "L",
        "type": "Input",
        "desc": "SMBus 時脈；需外部上拉電阻，未用可 NC"
      },
      {
        "num": "D2",
        "name": "SMB_DATA",
        "side": "L",
        "type": "I/O",
        "desc": "SMBus 資料；需外部上拉電阻，未用可 NC"
      },
      {
        "num": "B1",
        "name": "SADR1",
        "side": "L",
        "type": "Input",
        "desc": "SMBus 位址三階輸入 1（內建上拉+下拉，_tri）"
      },
      {
        "num": "C1",
        "name": "SADR0",
        "side": "L",
        "type": "Input",
        "desc": "SMBus 位址三階輸入 0（內建上拉+下拉，_tri）"
      },
      {
        "num": "C2",
        "name": "SLEWRATE_SEL",
        "side": "L",
        "type": "Input",
        "desc": "LP-HCSL 輸出斜率選擇（內建上拉）：低=慢斜率、高=快斜率"
      },
      {
        "num": "K1",
        "name": "SBI_EN",
        "side": "L",
        "type": "Input",
        "desc": "SBI 介面致能（內建下拉）；上電後不可改變狀態：上電時低=SBI 停用（該三腳作 OE），高=SBI 啟用"
      },
      {
        "num": "K2",
        "name": "PWRGD/{PWRDN}",
        "side": "L",
        "type": "Input",
        "desc": "Power Good/Power Down 多功能腳（內建上拉）：首次低→高=啟動元件；之後低=省電模式、高=正常"
      },
      {
        "num": "A1",
        "name": "{LOS}",
        "side": "L",
        "type": "Output",
        "desc": "輸入時脈遺失指示（active-low，開汲極需外部上拉）：低=輸入時脈無效"
      },
      {
        "num": "B3",
        "name": "{OE0}",
        "side": "L",
        "type": "Input",
        "desc": "CLK0 輸出致能（active-low，內建上拉）：0=輸出作用、1=輸出停用"
      },
      {
        "num": "B4",
        "name": "{OE1}",
        "side": "L",
        "type": "Input",
        "desc": "CLK1 輸出致能（active-low，內建上拉）：0=輸出作用、1=輸出停用"
      },
      {
        "num": "B7",
        "name": "{OE2}/SBI_OUT",
        "side": "L",
        "type": "I/O",
        "desc": "CLK2 輸出致能（active-low，內建上拉）：0=輸出作用、1=輸出停用；或 SBI 資料輸出（SBI_EN 選擇功能）"
      },
      {
        "num": "B8",
        "name": "{OE3}",
        "side": "L",
        "type": "Input",
        "desc": "CLK3 輸出致能（active-low，內建上拉）：0=輸出作用、1=輸出停用"
      },
      {
        "num": "A10",
        "name": "{OE4}/SBI_CLK",
        "side": "L",
        "type": "I/O",
        "desc": "CLK4 輸出致能（active-low，內建上拉）：0=輸出作用、1=輸出停用；或 SBI 時脈輸入（SBI_EN 選擇功能；SBI 模式內建下拉）"
      },
      {
        "num": "E9",
        "name": "{OE5}",
        "side": "L",
        "type": "Input",
        "desc": "CLK5 輸出致能（active-low，內建上拉）：0=輸出作用、1=輸出停用"
      },
      {
        "num": "G9",
        "name": "{OE6}",
        "side": "L",
        "type": "Input",
        "desc": "CLK6 輸出致能（active-low，內建上拉）：0=輸出作用、1=輸出停用"
      },
      {
        "num": "K10",
        "name": "{OE7}/SBI_IN",
        "side": "L",
        "type": "I/O",
        "desc": "CLK7 輸出致能（active-low，內建上拉）：0=輸出作用、1=輸出停用；或 SBI 資料輸入（SBI_EN 選擇功能；SBI 模式內建下拉）"
      },
      {
        "num": "J8",
        "name": "{OE8}",
        "side": "L",
        "type": "Input",
        "desc": "CLK8 輸出致能（active-low，內建上拉）：0=輸出作用、1=輸出停用"
      },
      {
        "num": "J6",
        "name": "{OE9}",
        "side": "L",
        "type": "Input",
        "desc": "CLK9 輸出致能（active-low，內建上拉）：0=輸出作用、1=輸出停用"
      },
      {
        "num": "J4",
        "name": "{OE10}/{SHFT_LD}",
        "side": "L",
        "type": "Input",
        "desc": "CLK10 輸出致能（active-low，內建上拉）：0=輸出作用、1=輸出停用；或 SBI 移位暫存器載入（SBI_EN 選擇功能；SBI 模式內建下拉）"
      },
      {
        "num": "G1",
        "name": "{OE11}",
        "side": "L",
        "type": "Input",
        "desc": "CLK11 輸出致能（active-low，內建上拉）：0=輸出作用、1=輸出停用"
      },
      {
        "num": "A3",
        "name": "CLK0_P",
        "side": "R",
        "type": "Output",
        "desc": "LP-HCSL 差動時脈輸出 0 正端；未用可 NC"
      },
      {
        "num": "A2",
        "name": "CLK0_N",
        "side": "R",
        "type": "Output",
        "desc": "LP-HCSL 差動時脈輸出 0 負端；未用可 NC"
      },
      {
        "num": "A5",
        "name": "CLK1_P",
        "side": "R",
        "type": "Output",
        "desc": "LP-HCSL 差動時脈輸出 1 正端；未用可 NC"
      },
      {
        "num": "A4",
        "name": "CLK1_N",
        "side": "R",
        "type": "Output",
        "desc": "LP-HCSL 差動時脈輸出 1 負端；未用可 NC"
      },
      {
        "num": "A7",
        "name": "CLK2_P",
        "side": "R",
        "type": "Output",
        "desc": "LP-HCSL 差動時脈輸出 2 正端；未用可 NC"
      },
      {
        "num": "A6",
        "name": "CLK2_N",
        "side": "R",
        "type": "Output",
        "desc": "LP-HCSL 差動時脈輸出 2 負端；未用可 NC"
      },
      {
        "num": "A9",
        "name": "CLK3_P",
        "side": "R",
        "type": "Output",
        "desc": "LP-HCSL 差動時脈輸出 3 正端；未用可 NC"
      },
      {
        "num": "A8",
        "name": "CLK3_N",
        "side": "R",
        "type": "Output",
        "desc": "LP-HCSL 差動時脈輸出 3 負端；未用可 NC"
      },
      {
        "num": "C10",
        "name": "CLK4_P",
        "side": "R",
        "type": "Output",
        "desc": "LP-HCSL 差動時脈輸出 4 正端；未用可 NC"
      },
      {
        "num": "B10",
        "name": "CLK4_N",
        "side": "R",
        "type": "Output",
        "desc": "LP-HCSL 差動時脈輸出 4 負端；未用可 NC"
      },
      {
        "num": "E10",
        "name": "CLK5_P",
        "side": "R",
        "type": "Output",
        "desc": "LP-HCSL 差動時脈輸出 5 正端；未用可 NC"
      },
      {
        "num": "D10",
        "name": "CLK5_N",
        "side": "R",
        "type": "Output",
        "desc": "LP-HCSL 差動時脈輸出 5 負端；未用可 NC"
      },
      {
        "num": "G10",
        "name": "CLK6_P",
        "side": "R",
        "type": "Output",
        "desc": "LP-HCSL 差動時脈輸出 6 正端；未用可 NC"
      },
      {
        "num": "F10",
        "name": "CLK6_N",
        "side": "R",
        "type": "Output",
        "desc": "LP-HCSL 差動時脈輸出 6 負端；未用可 NC"
      },
      {
        "num": "J10",
        "name": "CLK7_P",
        "side": "R",
        "type": "Output",
        "desc": "LP-HCSL 差動時脈輸出 7 正端；未用可 NC"
      },
      {
        "num": "H10",
        "name": "CLK7_N",
        "side": "R",
        "type": "Output",
        "desc": "LP-HCSL 差動時脈輸出 7 負端；未用可 NC"
      },
      {
        "num": "K8",
        "name": "CLK8_P",
        "side": "R",
        "type": "Output",
        "desc": "LP-HCSL 差動時脈輸出 8 正端；未用可 NC"
      },
      {
        "num": "K9",
        "name": "CLK8N",
        "side": "R",
        "type": "Output",
        "desc": "LP-HCSL 差動時脈輸出 8 負端；未用可 NC（datasheet 表與圖均印作 CLK8N，即 CLK8_N）"
      },
      {
        "num": "K6",
        "name": "CLK9_P",
        "side": "R",
        "type": "Output",
        "desc": "LP-HCSL 差動時脈輸出 9 正端；未用可 NC"
      },
      {
        "num": "K7",
        "name": "CLK9_N",
        "side": "R",
        "type": "Output",
        "desc": "LP-HCSL 差動時脈輸出 9 負端；未用可 NC"
      },
      {
        "num": "K4",
        "name": "CLK10_P",
        "side": "R",
        "type": "Output",
        "desc": "LP-HCSL 差動時脈輸出 10 正端；未用可 NC"
      },
      {
        "num": "K5",
        "name": "CLK10_N",
        "side": "R",
        "type": "Output",
        "desc": "LP-HCSL 差動時脈輸出 10 負端；未用可 NC"
      },
      {
        "num": "H1",
        "name": "CLK11_P",
        "side": "R",
        "type": "Output",
        "desc": "LP-HCSL 差動時脈輸出 11 正端；未用可 NC"
      },
      {
        "num": "J1",
        "name": "CLK11_N",
        "side": "R",
        "type": "Output",
        "desc": "LP-HCSL 差動時脈輸出 11 負端；未用可 NC"
      },
      {
        "num": "F2",
        "name": "VDDA",
        "side": "T",
        "type": "Power",
        "desc": "類比電源；建議額外電源濾波（見 datasheet §10.3）"
      },
      {
        "num": "B5",
        "name": "VDDCLK",
        "side": "T",
        "type": "Power",
        "desc": "輸出級電源"
      },
      {
        "num": "C9",
        "name": "VDDCLK",
        "side": "T",
        "type": "Power",
        "desc": "輸出級電源"
      },
      {
        "num": "H2",
        "name": "VDDCLK",
        "side": "T",
        "type": "Power",
        "desc": "輸出級電源"
      },
      {
        "num": "H9",
        "name": "VDDCLK",
        "side": "T",
        "type": "Power",
        "desc": "輸出級電源"
      },
      {
        "num": "J3",
        "name": "VDDCLK",
        "side": "T",
        "type": "Power",
        "desc": "輸出級電源"
      },
      {
        "num": "D4",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "元件接地（中央 4×4 接地陣列）"
      },
      {
        "num": "D5",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "元件接地（中央 4×4 接地陣列）"
      },
      {
        "num": "D6",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "元件接地（中央 4×4 接地陣列）"
      },
      {
        "num": "D7",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "元件接地（中央 4×4 接地陣列）"
      },
      {
        "num": "E4",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "元件接地（中央 4×4 接地陣列）"
      },
      {
        "num": "E5",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "元件接地（中央 4×4 接地陣列）"
      },
      {
        "num": "E6",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "元件接地（中央 4×4 接地陣列）"
      },
      {
        "num": "E7",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "元件接地（中央 4×4 接地陣列）"
      },
      {
        "num": "F4",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "元件接地（中央 4×4 接地陣列）"
      },
      {
        "num": "F5",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "元件接地（中央 4×4 接地陣列）"
      },
      {
        "num": "F6",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "元件接地（中央 4×4 接地陣列）"
      },
      {
        "num": "F7",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "元件接地（中央 4×4 接地陣列）"
      },
      {
        "num": "G4",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "元件接地（中央 4×4 接地陣列）"
      },
      {
        "num": "G5",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "元件接地（中央 4×4 接地陣列）"
      },
      {
        "num": "G6",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "元件接地（中央 4×4 接地陣列）"
      },
      {
        "num": "G7",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "元件接地（中央 4×4 接地陣列）"
      },
      {
        "num": "B2",
        "name": "NC",
        "side": "B",
        "type": "NC",
        "desc": "未連接"
      },
      {
        "num": "B6",
        "name": "NC",
        "side": "B",
        "type": "NC",
        "desc": "未連接"
      },
      {
        "num": "B9",
        "name": "NC",
        "side": "B",
        "type": "NC",
        "desc": "未連接"
      },
      {
        "num": "D9",
        "name": "NC",
        "side": "B",
        "type": "NC",
        "desc": "未連接"
      },
      {
        "num": "E2",
        "name": "NC",
        "side": "B",
        "type": "NC",
        "desc": "未連接"
      },
      {
        "num": "F9",
        "name": "NC",
        "side": "B",
        "type": "NC",
        "desc": "未連接"
      },
      {
        "num": "G2",
        "name": "NC",
        "side": "B",
        "type": "NC",
        "desc": "未連接"
      },
      {
        "num": "J2",
        "name": "NC",
        "side": "B",
        "type": "NC",
        "desc": "未連接"
      },
      {
        "num": "J5",
        "name": "NC",
        "side": "B",
        "type": "NC",
        "desc": "未連接"
      },
      {
        "num": "J7",
        "name": "NC",
        "side": "B",
        "type": "NC",
        "desc": "未連接"
      },
      {
        "num": "J9",
        "name": "NC",
        "side": "B",
        "type": "NC",
        "desc": "未連接"
      },
      {
        "num": "K3",
        "name": "NC",
        "side": "B",
        "type": "NC",
        "desc": "未連接"
      }
    ],
    "thermalPad": "中央 4×4 GND land 陣列（D4~G7 共 16 點，兼散熱與接地；封裝計數 64 pin 不含此陣列），須接板上接地平面",
    "specs": [
      {
        "k": "拓樸",
        "v": "1 路差動輸入 → 12 路 LP-HCSL 差動輸出"
      },
      {
        "k": "PCIe 支援",
        "v": "Gen 1 ~ Gen 7（CC/IR 架構、SSC 輸入皆可）；DB2000QL 規格、DB1206 腳位相容"
      },
      {
        "k": "附加抖動",
        "v": "31fs max（12kHz-20MHz RMS @156.25MHz）；PCIe Gen4 13fs／Gen5 5fs／Gen6 3fs／Gen7 2.1fs max"
      },
      {
        "k": "控制",
        "v": "逐路 OE#＋SBI 高速開關＋SMBus（三階位址×2）"
      },
      {
        "k": "輸出阻抗",
        "v": "85Ω 或 100Ω"
      },
      {
        "k": "供電",
        "v": "1.8V／3.3V ±10%（VDDA＋VDDCLK×5）"
      },
      {
        "k": "溫度",
        "v": "−40°C ~ +105°C"
      },
      {
        "k": "封裝",
        "v": "64-pin LGA (ZSF) 5×5mm＋中央 16 點 GND 陣列"
      }
    ],
    "secondSource": [
      "封裝＋pinout 相容（64-LGA 5×5mm 或 Intel DB1206 腳位）",
      "功能相同（PCIe 1:12 LP-HCSL 緩衝）",
      "附加抖動同級或更佳（Gen5 ≤5fs）",
      "OE/SMBus/SBI 控制相容",
      "供電相容（1.8V/3.3V）",
      "溫度範圍涵蓋"
    ],
    "dropIn": []
  },
  {
    "part": "TAC5112-Q1",
    "mfr": "Texas Instruments",
    "category": "audio",
    "subcategory": "車用音訊 Codec（stereo ADC＋DAC）",
    "package": "32-WQFN (RTV) 5×5mm 0.5mm pitch",
    "whatIs": "車規低功耗立體聲音訊 Codec：105dB 動態範圍立體聲 ADC＋114dB 動態範圍立體聲 DAC（單端四通道模式 107dB），支援差動/單端輸入輸出，AEC-Q100 Grade 1（−40~+125°C），供 eCall、車用主機等音訊擷取與播放。",
    "func": "ADC 支援線路/麥克風差動輸入（2VRMS 滿刻度）與 AC/DC 耦合，最高可組態 4 個錄音通道（2 類比+2 數位／1 類比+3 數位／4 數位）；內建可程式麥克風偏壓（最高 3V）。DAC 可組態立體聲差動或四通道單端輸出，線路輸出或耳機負載（16Ω 驅動至 62.5mW），支援差動 2VRMS／偽差動與單端 1VRMS。整合可程式通道增益、數位音量、低抖動 PLL、HPF/雙二階 EQ、低延遲濾波模式；取樣率 4kHz~768kHz、自動時脈/取樣率偵測；音訊介面 TDM/I2S/LJ（16/20/24/32-bit），controller/target 模式，控制介面 I2C 或 SPI；語音/超音波活動偵測、電池與熱回退保護、訊號失真限制器。",
    "usedIn": "車用緊急呼叫（eCall）、車載資通訊（Telematics）控制單元、主動降噪（ANC）、車用主機等空間受限的車規音訊系統。",
    "desc": "車規立體聲音訊 Codec：105dB 立體聲 ADC＋114dB DAC（單端四通道 107dB）、4k~768kHz 取樣、TDM/I2S/LJ、I2C/SPI 控制，AEC-Q100 Grade 1，32-WQFN 5×5mm；pinout 與 TAC5111-Q1（mono 款）逐腳同名同位，僅通道模式與規格說明不同，與 TAC5301/5312/5412-Q1 不相容。",
    "datasheet": "TI SLASFC2A",
    "pins": [
      {
        "num": "1",
        "name": "VSS",
        "side": "L",
        "type": "Ground",
        "desc": "接地腳，直接短接板上接地平面"
      },
      {
        "num": "2",
        "name": "DREG",
        "side": "L",
        "type": "Power",
        "desc": "數位側片上穩壓器輸出（標稱 1.5V），供內部數位電源；外接去耦電容"
      },
      {
        "num": "3",
        "name": "BCLK",
        "side": "L",
        "type": "I/O",
        "desc": "音訊序列介面位元時脈（bus controller/target 模式皆可）"
      },
      {
        "num": "4",
        "name": "FSYNC",
        "side": "L",
        "type": "I/O",
        "desc": "音訊序列介面框同步訊號"
      },
      {
        "num": "5",
        "name": "DOUT",
        "side": "L",
        "type": "I/O",
        "desc": "音訊序列介面資料輸出"
      },
      {
        "num": "6",
        "name": "DIN",
        "side": "L",
        "type": "Input",
        "desc": "音訊序列介面資料輸入"
      },
      {
        "num": "7",
        "name": "IOVDD",
        "side": "L",
        "type": "Power",
        "desc": "數位 I/O 電源（標稱 1.2V／1.8V／3.3V）"
      },
      {
        "num": "8",
        "name": "VSS",
        "side": "L",
        "type": "Ground",
        "desc": "接地腳，直接短接板上接地平面"
      },
      {
        "num": "9",
        "name": "SCL",
        "side": "B",
        "type": "Input",
        "desc": "I2C 控制介面時脈"
      },
      {
        "num": "10",
        "name": "SDA",
        "side": "B",
        "type": "I/O",
        "desc": "I2C 控制介面資料（表列 Digital Input，I2C 資料線實務為雙向開汲極）"
      },
      {
        "num": "11",
        "name": "GPIO1",
        "side": "B",
        "type": "I/O",
        "desc": "通用數位輸出入 1（菊鏈輸入、音訊資料輸出、PLL 時脈源、中斷等多工功能）"
      },
      {
        "num": "12",
        "name": "GPIO2",
        "side": "B",
        "type": "I/O",
        "desc": "通用數位輸出入 2（菊鏈輸入、音訊資料輸出、PLL 時脈源、中斷等多工功能）"
      },
      {
        "num": "13",
        "name": "GPO1",
        "side": "B",
        "type": "Output",
        "desc": "通用數位輸出 1（音訊資料輸出、中斷等多工功能）"
      },
      {
        "num": "14",
        "name": "GPI1",
        "side": "B",
        "type": "Input",
        "desc": "通用數位輸入 1（菊鏈輸入、PLL 時脈源等多工功能）"
      },
      {
        "num": "15",
        "name": "VSS",
        "side": "B",
        "type": "Ground",
        "desc": "接地腳，直接短接板上接地平面"
      },
      {
        "num": "16",
        "name": "ADDR",
        "side": "B",
        "type": "Analog In",
        "desc": "I2C 位址設定腳（類比位準偵測）"
      },
      {
        "num": "17",
        "name": "MICBIAS",
        "side": "R",
        "type": "Analog Out",
        "desc": "麥克風偏壓輸出（可程式，最高 3V）"
      },
      {
        "num": "18",
        "name": "IN1P",
        "side": "R",
        "type": "Analog In",
        "desc": "類比輸入 1P（立體聲第 1 聲道差動正端；亦支援單端組態）"
      },
      {
        "num": "19",
        "name": "IN1M",
        "side": "R",
        "type": "Analog In",
        "desc": "類比輸入 1M（立體聲第 1 聲道差動負端）"
      },
      {
        "num": "20",
        "name": "IN2P",
        "side": "R",
        "type": "Analog In",
        "desc": "類比輸入 2P（立體聲第 2 聲道差動正端）"
      },
      {
        "num": "21",
        "name": "IN2M",
        "side": "R",
        "type": "Analog In",
        "desc": "類比輸入 2M（立體聲第 2 聲道差動負端）"
      },
      {
        "num": "22",
        "name": "VSSI",
        "side": "R",
        "type": "Ground",
        "desc": "接地，直接短接板上接地平面"
      },
      {
        "num": "23",
        "name": "VSSI",
        "side": "R",
        "type": "Ground",
        "desc": "接地，直接短接板上接地平面"
      },
      {
        "num": "24",
        "name": "VSSI",
        "side": "R",
        "type": "Ground",
        "desc": "接地，直接短接板上接地平面"
      },
      {
        "num": "25",
        "name": "VSSI",
        "side": "T",
        "type": "Ground",
        "desc": "接地，直接短接板上接地平面"
      },
      {
        "num": "26",
        "name": "VSS",
        "side": "T",
        "type": "Ground",
        "desc": "接地腳，直接短接板上接地平面"
      },
      {
        "num": "27",
        "name": "OUT1M",
        "side": "T",
        "type": "Analog Out",
        "desc": "類比輸出 1M（立體聲第 1 聲道差動負端；線路輸出或耳機負載）"
      },
      {
        "num": "28",
        "name": "OUT1P",
        "side": "T",
        "type": "Analog Out",
        "desc": "類比輸出 1P（立體聲第 1 聲道差動正端）"
      },
      {
        "num": "29",
        "name": "OUT2P",
        "side": "T",
        "type": "Analog Out",
        "desc": "類比輸出 2P（立體聲第 2 聲道差動正端）"
      },
      {
        "num": "30",
        "name": "OUT2M",
        "side": "T",
        "type": "Analog Out",
        "desc": "類比輸出 2M（立體聲第 2 聲道差動負端）"
      },
      {
        "num": "31",
        "name": "AVDD",
        "side": "T",
        "type": "Power",
        "desc": "類比電源（標稱 1.8V 或 3.3V，單電源操作）"
      },
      {
        "num": "32",
        "name": "VREF",
        "side": "T",
        "type": "Analog Out",
        "desc": "類比參考電壓濾波輸出；外接去耦電容至地"
      },
      {
        "num": "33",
        "name": "VSS (EP)",
        "side": "B",
        "type": "Ground",
        "desc": "外露散熱焊盤，內部接元件地；直接短接板上接地平面",
        "ep": true
      }
    ],
    "thermalPad": "外露焊盤=VSS（圖 4-1 標示 Thermal Pad (VSS)、表 4-1 Thermal Pad 列），須短接板上接地平面",
    "specs": [
      {
        "k": "ADC 動態範圍",
        "v": "105dB（線路/麥克風差動輸入，立體聲）；THD+N −97dB；通道加總模式 SNR 108dB"
      },
      {
        "k": "DAC 動態範圍",
        "v": "114dB（差動線路/耳機輸出，立體聲）；單端四通道 107dB；THD+N −96dB"
      },
      {
        "k": "取樣率",
        "v": "ADC/DAC 皆 4kHz ~ 768kHz"
      },
      {
        "k": "輸入/輸出",
        "v": "差動 2VRMS／單端 1VRMS；耳機 16Ω 驅動至 62.5mW"
      },
      {
        "k": "錄音通道組態",
        "v": "最高 4 通道（2 類比+2 數位／1 類比+3 數位／4 數位）"
      },
      {
        "k": "麥克風偏壓",
        "v": "可程式，最高 3V"
      },
      {
        "k": "音訊介面",
        "v": "TDM / I2S / 左對齊（16/20/24/32-bit），controller/target 模式"
      },
      {
        "k": "控制介面",
        "v": "I2C 或 SPI"
      },
      {
        "k": "電源",
        "v": "AVDD 1.8V/3.3V 單電源；IOVDD 1.2V/1.8V/3.3V"
      },
      {
        "k": "低功耗",
        "v": "2 通道錄音 8mW／播放 10.5mW（1.8V 供電）"
      },
      {
        "k": "車規",
        "v": "AEC-Q100 Grade 1（−40°C ~ +125°C）"
      },
      {
        "k": "封裝",
        "v": "32-WQFN (RTV) 5×5mm，0.5mm pitch，EP=VSS"
      }
    ],
    "secondSource": [
      "封裝＋pinout 與 TAC5111-Q1 完全相同（32-WQFN 5×5mm、EP=VSS，逐腳同名同位）",
      "功能相同（車規 codec，ADC 105dB/DAC 114dB 同級，惟 TAC5111 為 mono、TAC5112 為 stereo）",
      "音訊介面相容（TDM/I2S/LJ）",
      "控制介面相容（I2C/SPI）",
      "電源軌相容（AVDD 1.8/3.3V、IOVDD 1.2~3.3V）",
      "AEC-Q100 Grade 1 車規",
      "取樣率範圍涵蓋（4k~768kHz）"
    ],
    "dropIn": [
      {
        "part": "TAC5111-Q1",
        "note": "同封裝同腳位（逐腳同名同號）；規格分級不同，確認動態範圍需求"
      }
    ]
  },
  {
    "part": "TAC5301-Q1",
    "mfr": "Texas Instruments",
    "category": "audio",
    "subcategory": "車用音訊 Codec（mono ADC＋DAC，高壓 micbias）",
    "package": "24-QFN (RGE) 4×4mm with Corner Pins",
    "whatIs": "車規單聲道音訊 Codec：ADC 動態範圍約 100~101dB（差動輸入；datasheet 標題標示 101dB、Features 內文標示 100dB，兩者略有差異見 datasheet）＋DAC 110dB，支援可程式高壓麥克風偏壓（3V~10V，需外部 HVDD 供電），AEC-Q100 Grade 1（−40~+125°C），24-Pin QFN 特殊轉角腳封裝。",
    "func": "ADC 支援線路/麥克風差動輸入（2VRMS 滿刻度）與 AC/DC 耦合；麥克風偏壓可程式 3V~10V，須外接高壓 HVDD 電源（無內建升壓轉換器，與同家族 TAC5312-Q1/TAC5412-Q1 不同）。DAC 可組態單聲道差動或立體聲單端輸出，線路輸出或耳機負載（16Ω 驅動至 62.5mW），支援差動 2VRMS／偽差動與單端 1VRMS。整合可程式通道增益、數位音量、低抖動 PLL、HPF/雙二階 EQ、低延遲濾波模式；取樣率 8kHz~192kHz（窄於同家族其他型號的 4k~768kHz）；音訊介面 TDM/I2S/LJ（16/20/24/32-bit），僅支援 I2C 控制介面（不支援 SPI）；語音/超音波活動偵測、電池與熱回退保護、訊號失真限制器。",
    "usedIn": "車載資通訊（Telematics）控制單元、車用主機、車用儀表（Cluster）、後座娛樂系統等空間受限的車規音訊系統。",
    "desc": "車規單聲道音訊 Codec：ADC 約 100~101dB／DAC 110dB、8k~192kHz 取樣、僅 I2C 控制（無 SPI）、高壓麥克風偏壓 3~10V（需外部 HVDD）、AVDD 僅 3.3V，24-Pin QFN 4×4mm 特殊轉角腳封裝＋EP；腳位配置與家族其他 32-WQFN 型號（TAC5112/5312/5412-Q1）完全不相容。",
    "datasheet": "TI SLASFD9A",
    "pins": [
      {
        "num": "A1",
        "name": "VSS",
        "side": "L",
        "type": "Ground",
        "desc": "接地腳（轉角腳 Corner Pin，封裝四角特殊接地墊），直接短接板上接地平面"
      },
      {
        "num": "1",
        "name": "DREG",
        "side": "L",
        "type": "Power",
        "desc": "數位側片上穩壓器輸出（標稱 1.5V），供內部數位電源；外接去耦電容"
      },
      {
        "num": "2",
        "name": "BCLK",
        "side": "L",
        "type": "I/O",
        "desc": "音訊序列介面位元時脈（bus controller/target 模式皆可）"
      },
      {
        "num": "3",
        "name": "FSYNC",
        "side": "L",
        "type": "I/O",
        "desc": "音訊序列介面框同步訊號"
      },
      {
        "num": "4",
        "name": "DOUT",
        "side": "L",
        "type": "Output",
        "desc": "音訊序列介面資料輸出"
      },
      {
        "num": "5",
        "name": "DIN",
        "side": "L",
        "type": "Input",
        "desc": "音訊序列介面資料輸入"
      },
      {
        "num": "6",
        "name": "IOVDD",
        "side": "L",
        "type": "Power",
        "desc": "數位 I/O 電源（標稱 1.2V／1.8V／3.3V）"
      },
      {
        "num": "A2",
        "name": "IOVSS",
        "side": "B",
        "type": "Ground",
        "desc": "數位 I/O 電源接地腳（轉角腳 Corner Pin），直接短接板上接地平面"
      },
      {
        "num": "7",
        "name": "SCL",
        "side": "B",
        "type": "Input",
        "desc": "I2C 控制介面時脈"
      },
      {
        "num": "8",
        "name": "SDA",
        "side": "B",
        "type": "I/O",
        "desc": "I2C 控制介面資料"
      },
      {
        "num": "9",
        "name": "GPIO1",
        "side": "B",
        "type": "I/O",
        "desc": "通用數位輸出入 1（菊鏈輸入、音訊資料輸出、PLL 時脈源、中斷等多工功能）"
      },
      {
        "num": "10",
        "name": "VSSA",
        "side": "B",
        "type": "Ground",
        "desc": "類比電源接地腳，直接短接板上接地平面"
      },
      {
        "num": "11",
        "name": "AVDD",
        "side": "B",
        "type": "Power",
        "desc": "類比電源（標稱 3.3V）"
      },
      {
        "num": "12",
        "name": "VSSA",
        "side": "B",
        "type": "Ground",
        "desc": "類比電源接地腳，直接短接板上接地平面"
      },
      {
        "num": "A3",
        "name": "AVSS",
        "side": "R",
        "type": "Ground",
        "desc": "類比電源接地腳（轉角腳 Corner Pin），直接短接板上接地平面"
      },
      {
        "num": "13",
        "name": "HVDD",
        "side": "R",
        "type": "Power",
        "desc": "高壓類比電源（最高 12V），用於產生麥克風偏壓"
      },
      {
        "num": "14",
        "name": "MICBIAS",
        "side": "R",
        "type": "Analog Out",
        "desc": "麥克風偏壓輸出（可程式，最高 10V）"
      },
      {
        "num": "15",
        "name": "IN1P",
        "side": "R",
        "type": "Analog In",
        "desc": "類比輸入 1P（差動正端；亦支援單端組態）"
      },
      {
        "num": "16",
        "name": "IN1M",
        "side": "R",
        "type": "Analog In",
        "desc": "類比輸入 1M（差動負端）"
      },
      {
        "num": "17",
        "name": "IN2P",
        "side": "R",
        "type": "Analog In",
        "desc": "類比輸入 2P（Table 4-1 僅標示 Analog Input，ADC 標稱為 mono 規格，實際使用組態見 datasheet）"
      },
      {
        "num": "18",
        "name": "IN2M",
        "side": "R",
        "type": "Analog In",
        "desc": "類比輸入 2M（同 IN2P，實際使用組態見 datasheet）"
      },
      {
        "num": "A4",
        "name": "AVSS",
        "side": "T",
        "type": "Ground",
        "desc": "類比電源接地腳（轉角腳 Corner Pin），直接短接板上接地平面"
      },
      {
        "num": "19",
        "name": "OUT1M",
        "side": "T",
        "type": "Analog Out",
        "desc": "類比輸出 1M（差動負端；線路輸出或耳機負載）"
      },
      {
        "num": "20",
        "name": "OUT1P",
        "side": "T",
        "type": "Analog Out",
        "desc": "類比輸出 1P（差動正端）"
      },
      {
        "num": "21",
        "name": "OUT2P",
        "side": "T",
        "type": "Analog Out",
        "desc": "類比輸出 2P（單端立體聲第 2 聲道；DAC 為 mono 差動或 stereo 單端二擇一模式）"
      },
      {
        "num": "22",
        "name": "OUT2M",
        "side": "T",
        "type": "Analog Out",
        "desc": "類比輸出 2M（同 OUT2P，單端立體聲第 2 聲道）"
      },
      {
        "num": "23",
        "name": "AVDD",
        "side": "T",
        "type": "Power",
        "desc": "類比電源（標稱 3.3V）"
      },
      {
        "num": "24",
        "name": "VREF",
        "side": "T",
        "type": "Analog Out",
        "desc": "類比參考電壓濾波輸出；外接去耦電容至地"
      },
      {
        "num": "EP",
        "name": "VSS (EP)",
        "side": "B",
        "type": "Ground",
        "desc": "外露散熱焊盤，內部接元件地；直接短接板上接地平面",
        "ep": true
      }
    ],
    "thermalPad": "外露焊盤=VSS（圖 4-1 標示 Thermal Pad (VSS)、表 4-1 Thermal Pad 列），須短接板上接地平面；封裝另含 4 顆轉角腳（A1~A4，皆為 Ground），為此 24-Pin QFN with Exposed Thermal Pad and Corner Pins 特殊封裝所獨有，非標準 24-QFN，見 datasheet 圖 4-1",
    "specs": [
      {
        "k": "ADC 動態範圍",
        "v": "差動輸入 100dB（Features 內文）／datasheet 標題標示 101dB，見 datasheet 確認；THD+N −87dB"
      },
      {
        "k": "DAC 動態範圍",
        "v": "差動線路輸出 110dB／差動耳機輸出 109dB；THD+N −101dB"
      },
      {
        "k": "取樣率",
        "v": "ADC/DAC 皆 8kHz ~ 192kHz"
      },
      {
        "k": "輸入/輸出",
        "v": "差動 2VRMS／單端 1VRMS；耳機 16Ω 驅動至 62.5mW"
      },
      {
        "k": "麥克風偏壓",
        "v": "可程式 3V~10V，須外部 HVDD 供電（無內建升壓電路）"
      },
      {
        "k": "音訊介面",
        "v": "TDM / I2S / 左對齊（16/20/24/32-bit），controller/target 模式"
      },
      {
        "k": "控制介面",
        "v": "僅 I2C（不支援 SPI）"
      },
      {
        "k": "電源",
        "v": "AVDD 僅 3.3V 單電源；IOVDD 1.2V/1.8V/3.3V；HVDD 最高 12V"
      },
      {
        "k": "車規",
        "v": "AEC-Q100 Grade 1（−40°C ~ +125°C）"
      },
      {
        "k": "封裝",
        "v": "24-Pin QFN (RGE) 4×4mm，含 4 顆轉角腳（Corner Pin）＋EP=VSS，非標準均分佈局"
      }
    ],
    "secondSource": [
      "封裝＋pinout 需逐腳核對（24-Pin QFN with Exposed Thermal Pad and Corner Pins 特殊封裝，非通用 24-QFN，不可用一般 24-QFN 料件替代）",
      "控制介面須為 I2C-only（不可用需 SPI 才能運作的替代 codec）",
      "電源軌相容（AVDD 3.3V、IOVDD 1.2~3.3V、HVDD 高壓偏壓電源）",
      "AEC-Q100 Grade 1 車規",
      "取樣率範圍需涵蓋 8k~192kHz"
    ],
    "dropIn": []
  },
  {
    "part": "TAC5312-Q1",
    "mfr": "Texas Instruments",
    "category": "audio",
    "subcategory": "車用音訊 Codec（stereo ADC＋DAC，高壓輸入/micbias＋診斷）",
    "package": "32-WQFN (RTV) 5×5mm 0.5mm pitch",
    "whatIs": "車規立體聲音訊 Codec：10VRMS 高壓差動輸入、104dB 動態範圍 ADC＋2VRMS 差動輸出、114dB 動態範圍 DAC，內建升壓轉換器產生高壓可程式麥克風偏壓（3V~10V）並支援麥克風輸入故障診斷，AEC-Q100 Grade 1（−40~+125°C）。",
    "func": "ADC 支援線路/麥克風差動輸入，差動 10VRMS／單端 5VRMS 高壓滿刻度輸入，AC/DC 耦合皆可；內建升壓轉換器（僅需 3.3V 供電）或外部 HVDD 供電產生可程式麥克風偏壓（3V~10V）；提供麥克風輸入開路/短路、短接至地/MICBIAS/VBAT、偏壓過電流等故障診斷。DAC 可組態立體聲差動或單端輸出，線路輸出或耳機負載（16Ω 驅動至 62.5mW），差動 2VRMS／單端 1VRMS。整合可程式通道增益、數位音量、低抖動 PLL、HPF/雙二階 EQ、低延遲/超低延遲濾波模式；取樣率 4kHz~768kHz；音訊介面 TDM/I2S/LJ（16/20/24/32-bit），控制介面 I2C 或 SPI。",
    "usedIn": "車用緊急呼叫（eCall）、車載資通訊（Telematics）控制單元、主動降噪（ANC）、車用主機等需高壓麥克風直接連接與故障診斷的車規音訊系統。",
    "desc": "車規立體聲音訊 Codec：10VRMS 高壓差動輸入 104dB ADC＋114dB DAC、內建升壓轉換器高壓麥克風偏壓（3~10V）＋輸入故障診斷、4k~768kHz 取樣、TDM/I2S/LJ、I2C/SPI 控制，AEC-Q100 Grade 1，32-WQFN 5×5mm；pinout 與 TAC5412-Q1 逐腳完全相同（僅 ADC/DAC 動態範圍規格不同），與 TAC5112-Q1/TAC5301-Q1 不相容。",
    "datasheet": "TI SLASF35A",
    "pins": [
      {
        "num": "1",
        "name": "VSS",
        "side": "L",
        "type": "Ground",
        "desc": "接地腳，直接短接板上接地平面"
      },
      {
        "num": "2",
        "name": "DREG",
        "side": "L",
        "type": "Power",
        "desc": "數位側片上穩壓器輸出（標稱 1.5V），供內部數位電源；外接去耦電容"
      },
      {
        "num": "3",
        "name": "BCLK",
        "side": "L",
        "type": "I/O",
        "desc": "音訊序列介面位元時脈（bus controller/target 模式皆可）"
      },
      {
        "num": "4",
        "name": "FSYNC",
        "side": "L",
        "type": "I/O",
        "desc": "音訊序列介面框同步訊號"
      },
      {
        "num": "5",
        "name": "DOUT",
        "side": "L",
        "type": "Output",
        "desc": "音訊序列介面資料輸出"
      },
      {
        "num": "6",
        "name": "DIN",
        "side": "L",
        "type": "Input",
        "desc": "音訊序列介面資料輸入"
      },
      {
        "num": "7",
        "name": "IOVDD",
        "side": "L",
        "type": "Power",
        "desc": "數位 I/O 電源（標稱 1.2V、1.8V 或 3.3V）"
      },
      {
        "num": "8",
        "name": "IOVSS",
        "side": "L",
        "type": "Ground",
        "desc": "數位 I/O 電源接地腳，直接短接板上接地平面"
      },
      {
        "num": "9",
        "name": "SCL",
        "side": "B",
        "type": "Input",
        "desc": "I2C 控制介面時脈"
      },
      {
        "num": "10",
        "name": "SDA",
        "side": "B",
        "type": "I/O",
        "desc": "I2C 控制介面資料"
      },
      {
        "num": "11",
        "name": "GPIO1",
        "side": "B",
        "type": "I/O",
        "desc": "通用數位輸出入 1（菊鏈輸入、音訊資料輸出、PLL 時脈源、中斷等多工功能）"
      },
      {
        "num": "12",
        "name": "VBATIN",
        "side": "B",
        "type": "Analog In",
        "desc": "類比 VBAT 輸入監測腳（供輸入故障診斷使用）"
      },
      {
        "num": "13",
        "name": "BSTVDD",
        "side": "B",
        "type": "Power",
        "desc": "升壓轉換器供電電源（標稱 3.3V）"
      },
      {
        "num": "14",
        "name": "BSTSW",
        "side": "B",
        "type": "Power",
        "desc": "升壓轉換器切換腳（Switching pin）"
      },
      {
        "num": "15",
        "name": "BSTVSS",
        "side": "B",
        "type": "Ground",
        "desc": "升壓轉換器供電接地腳，直接短接板上接地平面"
      },
      {
        "num": "16",
        "name": "BSTOUT",
        "side": "B",
        "type": "Power",
        "desc": "升壓轉換器輸出電壓"
      },
      {
        "num": "17",
        "name": "MICBIAS",
        "side": "R",
        "type": "Analog Out",
        "desc": "麥克風偏壓輸出（可程式，最高 10V）"
      },
      {
        "num": "18",
        "name": "IN1P",
        "side": "R",
        "type": "Analog In",
        "desc": "類比輸入 1P（差動正端）"
      },
      {
        "num": "19",
        "name": "IN1M",
        "side": "R",
        "type": "Analog In",
        "desc": "類比輸入 1M（差動負端）"
      },
      {
        "num": "20",
        "name": "IN2P",
        "side": "R",
        "type": "Analog In",
        "desc": "類比輸入 2P（差動正端）"
      },
      {
        "num": "21",
        "name": "IN2M",
        "side": "R",
        "type": "Analog In",
        "desc": "類比輸入 2M（差動負端）"
      },
      {
        "num": "22",
        "name": "ADDRA",
        "side": "R",
        "type": "Input",
        "desc": "I2C 位址選擇腳"
      },
      {
        "num": "23",
        "name": "GPO1A",
        "side": "R",
        "type": "Output",
        "desc": "通用數位輸出 1A（音訊資料輸出、中斷等多工功能）"
      },
      {
        "num": "24",
        "name": "GPI2A",
        "side": "R",
        "type": "Input",
        "desc": "通用數位輸入 2A（菊鏈輸入、音訊資料輸入、PLL 時脈源等多工功能）"
      },
      {
        "num": "25",
        "name": "GPI1A",
        "side": "T",
        "type": "Input",
        "desc": "通用數位輸入 1A（菊鏈輸入、音訊資料輸入、PLL 時脈源等多工功能）"
      },
      {
        "num": "26",
        "name": "AVSS",
        "side": "T",
        "type": "Ground",
        "desc": "類比電源接地腳，直接短接板上接地平面"
      },
      {
        "num": "27",
        "name": "OUT1M",
        "side": "T",
        "type": "Analog Out",
        "desc": "類比輸出 1M（差動負端）"
      },
      {
        "num": "28",
        "name": "OUT1P",
        "side": "T",
        "type": "Analog Out",
        "desc": "類比輸出 1P（差動正端）"
      },
      {
        "num": "29",
        "name": "OUT2P",
        "side": "T",
        "type": "Analog Out",
        "desc": "類比輸出 2P（差動正端）"
      },
      {
        "num": "30",
        "name": "OUT2M",
        "side": "T",
        "type": "Analog Out",
        "desc": "類比輸出 2M（差動負端）"
      },
      {
        "num": "31",
        "name": "AVDD",
        "side": "T",
        "type": "Power",
        "desc": "類比電源（標稱 3.3V）"
      },
      {
        "num": "32",
        "name": "VREF",
        "side": "T",
        "type": "Analog Out",
        "desc": "類比參考電壓濾波輸出；外接去耦電容至地"
      },
      {
        "num": "33",
        "name": "VSS (EP)",
        "side": "B",
        "type": "Ground",
        "desc": "外露散熱焊盤，內部接元件地；直接短接板上接地平面",
        "ep": true
      }
    ],
    "thermalPad": "外露焊盤=VSS（圖 4-1 標示 Thermal Pad (VSS)、表 4-1 Thermal Pad 列），須短接板上接地平面",
    "specs": [
      {
        "k": "ADC 動態範圍",
        "v": "104dB（線路/麥克風差動輸入）；THD+N −97dB；通道加總模式 SNR 107dB"
      },
      {
        "k": "DAC 動態範圍",
        "v": "114dB（差動線路輸出）；107dB（單端耳機輸出）；THD+N −96dB"
      },
      {
        "k": "取樣率",
        "v": "ADC/DAC 皆 4kHz ~ 768kHz"
      },
      {
        "k": "輸入/輸出",
        "v": "差動 10VRMS／單端 5VRMS 輸入；差動 2VRMS／單端 1VRMS 輸出；耳機 16Ω 驅動至 62.5mW"
      },
      {
        "k": "麥克風偏壓",
        "v": "可程式 3V~10V，內建升壓轉換器（3.3V 供電）或外部 HVDD"
      },
      {
        "k": "故障診斷",
        "v": "麥克風輸入開路/短路、短接地/MICBIAS/VBAT、偏壓過電流保護"
      },
      {
        "k": "音訊介面",
        "v": "TDM / I2S / 左對齊（16/20/24/32-bit）"
      },
      {
        "k": "控制介面",
        "v": "I2C 或 SPI"
      },
      {
        "k": "電源",
        "v": "AVDD 僅 3.3V 單電源；IOVDD 1.2V/1.8V/3.3V；BSTVDD 3.3V"
      },
      {
        "k": "車規",
        "v": "AEC-Q100 Grade 1（−40°C ~ +125°C）"
      },
      {
        "k": "封裝",
        "v": "32-WQFN (RTV) 5×5mm，0.5mm pitch，EP=VSS"
      }
    ],
    "secondSource": [
      "封裝＋pinout 與 TAC5412-Q1 完全相同（32-WQFN 5×5mm、EP=VSS，逐腳同名同位）",
      "功能相同（車規立體聲高壓輸入 codec＋升壓麥克風偏壓＋故障診斷）",
      "音訊介面相容（TDM/I2S/LJ）",
      "控制介面相容（I2C/SPI）",
      "電源軌相容（AVDD 3.3V、IOVDD 1.2~3.3V、BSTVDD 3.3V）",
      "AEC-Q100 Grade 1 車規",
      "取樣率範圍涵蓋（4k~768kHz）"
    ],
    "dropIn": [
      {
        "part": "TAC5412-Q1",
        "note": "同封裝同腳位（逐腳同名同號）；規格分級不同，確認動態範圍需求"
      }
    ]
  },
  {
    "part": "TAC5412-Q1",
    "mfr": "Texas Instruments",
    "category": "audio",
    "subcategory": "車用音訊 Codec（stereo ADC＋DAC，高壓輸入/micbias＋診斷，高階款）",
    "package": "32-WQFN (RTV) 5×5mm 0.5mm pitch",
    "whatIs": "車規立體聲音訊 Codec（家族最高性能款）：10VRMS 高壓差動輸入、112dB 動態範圍 ADC＋2VRMS 差動輸出、120dB 動態範圍 DAC，內建升壓轉換器產生高壓可程式麥克風偏壓（3V~10V）並支援麥克風輸入故障診斷，AEC-Q100 Grade 1（−40~+125°C）。",
    "func": "ADC 支援線路/麥克風差動輸入，差動 10VRMS／單端 5VRMS 高壓滿刻度輸入，AC/DC 耦合皆可；內建升壓轉換器（僅需 3.3V 供電）或外部 HVDD 供電產生可程式麥克風偏壓（3V~10V）；提供麥克風輸入開路/短路、短接至地/MICBIAS/VBAT、偏壓過電流等故障診斷。DAC 可組態立體聲差動或單端輸出，線路輸出或耳機負載（16Ω 驅動至 62.5mW），差動 2VRMS／單端 1VRMS。整合可程式通道增益、數位音量、低抖動 PLL、HPF/雙二階 EQ、低延遲/超低延遲濾波模式；取樣率 4kHz~768kHz；音訊介面 TDM/I2S/LJ（16/20/24/32-bit），控制介面 I2C 或 SPI。",
    "usedIn": "車用緊急呼叫（eCall）、車載資通訊（Telematics）控制單元、主動降噪（ANC）、車用主機等需高壓麥克風直接連接與故障診斷、且要求更高訊噪比的車規音訊系統。",
    "desc": "車規立體聲音訊 Codec（家族最高性能）：10VRMS 高壓差動輸入 112dB ADC＋120dB DAC、內建升壓轉換器高壓麥克風偏壓（3~10V）＋輸入故障診斷、4k~768kHz 取樣、TDM/I2S/LJ、I2C/SPI 控制，AEC-Q100 Grade 1，32-WQFN 5×5mm；pinout 與 TAC5312-Q1 逐腳完全相同（僅 ADC/DAC 動態範圍規格不同，5412 較高階），與 TAC5112-Q1/TAC5301-Q1 不相容。",
    "datasheet": "TI SLASF33A",
    "pins": [
      {
        "num": "1",
        "name": "VSS",
        "side": "L",
        "type": "Ground",
        "desc": "接地腳，直接短接板上接地平面"
      },
      {
        "num": "2",
        "name": "DREG",
        "side": "L",
        "type": "Power",
        "desc": "數位側片上穩壓器輸出（標稱 1.5V），供內部數位電源；外接去耦電容"
      },
      {
        "num": "3",
        "name": "BCLK",
        "side": "L",
        "type": "I/O",
        "desc": "音訊序列介面位元時脈（bus controller/target 模式皆可）"
      },
      {
        "num": "4",
        "name": "FSYNC",
        "side": "L",
        "type": "I/O",
        "desc": "音訊序列介面框同步訊號"
      },
      {
        "num": "5",
        "name": "DOUT",
        "side": "L",
        "type": "Output",
        "desc": "音訊序列介面資料輸出"
      },
      {
        "num": "6",
        "name": "DIN",
        "side": "L",
        "type": "Input",
        "desc": "音訊序列介面資料輸入"
      },
      {
        "num": "7",
        "name": "IOVDD",
        "side": "L",
        "type": "Power",
        "desc": "數位 I/O 電源（標稱 1.2V、1.8V 或 3.3V）"
      },
      {
        "num": "8",
        "name": "IOVSS",
        "side": "L",
        "type": "Ground",
        "desc": "數位 I/O 電源接地腳，直接短接板上接地平面"
      },
      {
        "num": "9",
        "name": "SCL",
        "side": "B",
        "type": "Input",
        "desc": "I2C 控制介面時脈"
      },
      {
        "num": "10",
        "name": "SDA",
        "side": "B",
        "type": "I/O",
        "desc": "I2C 控制介面資料"
      },
      {
        "num": "11",
        "name": "GPIO1",
        "side": "B",
        "type": "I/O",
        "desc": "通用數位輸出入 1（菊鏈輸入、音訊資料輸出、PLL 時脈源、中斷等多工功能）"
      },
      {
        "num": "12",
        "name": "VBATIN",
        "side": "B",
        "type": "Analog In",
        "desc": "類比 VBAT 輸入監測腳（供輸入故障診斷使用）"
      },
      {
        "num": "13",
        "name": "BSTVDD",
        "side": "B",
        "type": "Power",
        "desc": "升壓轉換器供電電源（標稱 3.3V）"
      },
      {
        "num": "14",
        "name": "BSTSW",
        "side": "B",
        "type": "Power",
        "desc": "升壓轉換器切換腳（Switching pin）"
      },
      {
        "num": "15",
        "name": "BSTVSS",
        "side": "B",
        "type": "Ground",
        "desc": "升壓轉換器供電接地腳，直接短接板上接地平面"
      },
      {
        "num": "16",
        "name": "BSTOUT",
        "side": "B",
        "type": "Power",
        "desc": "升壓轉換器輸出電壓"
      },
      {
        "num": "17",
        "name": "MICBIAS",
        "side": "R",
        "type": "Analog Out",
        "desc": "麥克風偏壓輸出（可程式，最高 10V）"
      },
      {
        "num": "18",
        "name": "IN1P",
        "side": "R",
        "type": "Analog In",
        "desc": "類比輸入 1P（差動正端）"
      },
      {
        "num": "19",
        "name": "IN1M",
        "side": "R",
        "type": "Analog In",
        "desc": "類比輸入 1M（差動負端）"
      },
      {
        "num": "20",
        "name": "IN2P",
        "side": "R",
        "type": "Analog In",
        "desc": "類比輸入 2P（差動正端）"
      },
      {
        "num": "21",
        "name": "IN2M",
        "side": "R",
        "type": "Analog In",
        "desc": "類比輸入 2M（差動負端）"
      },
      {
        "num": "22",
        "name": "ADDRA",
        "side": "R",
        "type": "Input",
        "desc": "I2C 位址選擇腳"
      },
      {
        "num": "23",
        "name": "GPO1A",
        "side": "R",
        "type": "Output",
        "desc": "通用數位輸出 1A（音訊資料輸出、中斷等多工功能）"
      },
      {
        "num": "24",
        "name": "GPI2A",
        "side": "R",
        "type": "Input",
        "desc": "通用數位輸入 2A（菊鏈輸入、音訊資料輸入、PLL 時脈源等多工功能）"
      },
      {
        "num": "25",
        "name": "GPI1A",
        "side": "T",
        "type": "Input",
        "desc": "通用數位輸入 1A（菊鏈輸入、音訊資料輸入、PLL 時脈源等多工功能）"
      },
      {
        "num": "26",
        "name": "AVSS",
        "side": "T",
        "type": "Ground",
        "desc": "類比電源接地腳，直接短接板上接地平面"
      },
      {
        "num": "27",
        "name": "OUT1M",
        "side": "T",
        "type": "Analog Out",
        "desc": "類比輸出 1M（差動負端）"
      },
      {
        "num": "28",
        "name": "OUT1P",
        "side": "T",
        "type": "Analog Out",
        "desc": "類比輸出 1P（差動正端）"
      },
      {
        "num": "29",
        "name": "OUT2P",
        "side": "T",
        "type": "Analog Out",
        "desc": "類比輸出 2P（差動正端）"
      },
      {
        "num": "30",
        "name": "OUT2M",
        "side": "T",
        "type": "Analog Out",
        "desc": "類比輸出 2M（差動負端）"
      },
      {
        "num": "31",
        "name": "AVDD",
        "side": "T",
        "type": "Power",
        "desc": "類比電源（標稱 3.3V）"
      },
      {
        "num": "32",
        "name": "VREF",
        "side": "T",
        "type": "Analog Out",
        "desc": "類比參考電壓濾波輸出；外接去耦電容至地"
      },
      {
        "num": "33",
        "name": "VSS (EP)",
        "side": "B",
        "type": "Ground",
        "desc": "外露散熱焊盤，內部接元件地；直接短接板上接地平面",
        "ep": true
      }
    ],
    "thermalPad": "外露焊盤=VSS（圖 4-1 標示 Thermal Pad (VSS)、表 4-1 Thermal Pad 列），須短接板上接地平面",
    "specs": [
      {
        "k": "ADC 動態範圍",
        "v": "112dB（線路/麥克風差動輸入）；THD+N −99dB；通道加總模式 SNR 114dB"
      },
      {
        "k": "DAC 動態範圍",
        "v": "120dB（差動線路輸出）；111dB（單端耳機輸出）；THD+N −102dB"
      },
      {
        "k": "取樣率",
        "v": "ADC/DAC 皆 4kHz ~ 768kHz"
      },
      {
        "k": "輸入/輸出",
        "v": "差動 10VRMS／單端 5VRMS 輸入；差動 2VRMS／單端 1VRMS 輸出；耳機 16Ω 驅動至 62.5mW"
      },
      {
        "k": "麥克風偏壓",
        "v": "可程式 3V~10V，內建升壓轉換器（3.3V 供電）或外部 HVDD"
      },
      {
        "k": "故障診斷",
        "v": "麥克風輸入開路/短路、短接地/MICBIAS/VBAT、偏壓過電流保護"
      },
      {
        "k": "音訊介面",
        "v": "TDM / I2S / 左對齊（16/20/24/32-bit）"
      },
      {
        "k": "控制介面",
        "v": "I2C 或 SPI"
      },
      {
        "k": "電源",
        "v": "AVDD 僅 3.3V 單電源；IOVDD 1.2V/1.8V/3.3V；BSTVDD 3.3V"
      },
      {
        "k": "車規",
        "v": "AEC-Q100 Grade 1（−40°C ~ +125°C）"
      },
      {
        "k": "封裝",
        "v": "32-WQFN (RTV) 5×5mm，0.5mm pitch，EP=VSS"
      }
    ],
    "secondSource": [
      "封裝＋pinout 與 TAC5312-Q1 完全相同（32-WQFN 5×5mm、EP=VSS，逐腳同名同位）",
      "功能相同（車規立體聲高壓輸入 codec＋升壓麥克風偏壓＋故障診斷，5412 為家族最高階款）",
      "音訊介面相容（TDM/I2S/LJ）",
      "控制介面相容（I2C/SPI）",
      "電源軌相容（AVDD 3.3V、IOVDD 1.2~3.3V、BSTVDD 3.3V）",
      "AEC-Q100 Grade 1 車規",
      "取樣率範圍涵蓋（4k~768kHz）"
    ],
    "dropIn": [
      {
        "part": "TAC5312-Q1",
        "note": "同封裝同腳位（逐腳同名同號）；規格分級不同，確認動態範圍需求"
      }
    ]
  },
  {
    "part": "TAS2120",
    "mfr": "Texas Instruments",
    "category": "audio",
    "subcategory": "單聲道 Class-D 喇叭放大器（整合 Class-H boost）",
    "package": "26-pin QFN (HR-QFN) 4×3.5mm，0.4mm pitch",
    "whatIs": "8.2W 單聲道數位輸入 Class-D 音訊放大器，內建 14.75V Class-H boost（最大電流限制 5.1A），針對電池供電系統最佳化效率，最高可達 91% 效率（@1W, 8Ω 負載）。",
    "func": "I2S/TDM 序列音訊介面（8 channels），HW pin 或 I2C 控制；MCLK-free 操作，自動時脈/取樣率偵測 16~192kHz；可程式電池電流限制（39mA 步階）、兩顆元件間 boost 共享、外部 Class-H boost 控制演算法；內建 Y-bridge 提升效率；高精度供電電壓監控與溫度感測；過熱與過電流保護。",
    "usedIn": "具語音助理智慧喇叭、藍牙/無線喇叭、建築自動化系統、平板/穿戴裝置、筆電/桌上型電腦等電池供電音訊系統。",
    "desc": "8.2W 單聲道 Class-D 放大器，整合 14.75V Class-H boost，114.4dB 動態範圍，I2S/TDM 8ch，HW/I2C 控制，26-QFN 0.4mm pitch 4×3.5mm。",
    "datasheet": "TI SLASFC6A",
    "pins": [
      {
        "num": "1",
        "name": "SEL5_CLH",
        "side": "L",
        "type": "I/O",
        "desc": "HW Mode：Select5，Boost 1S/2S/外部 PVDD 模式選擇；I2C Mode：Class-H boost 控制（共享 boost 輸入或外部 boost PWM 產生），未用共享/外部 boost 功能時短接至 GND"
      },
      {
        "num": "2",
        "name": "SEL4_ADR",
        "side": "L",
        "type": "Input",
        "desc": "HW Mode：Select4，Y-bridge 門檻設定；I2C Mode：I2C 位址腳"
      },
      {
        "num": "3",
        "name": "SEL3_SDA",
        "side": "L",
        "type": "I/O",
        "desc": "HW Mode：Select3，資料有效上升/下降緣選擇；I2C Mode：資料腳，須以電阻上拉至 IOVDD"
      },
      {
        "num": "4",
        "name": "SEL2_SCL",
        "side": "L",
        "type": "Input",
        "desc": "HW Mode：Select2，I2S/TDM/左對齊選擇；I2C Mode：時脈腳，須以電阻上拉至 IOVDD"
      },
      {
        "num": "5",
        "name": "IOVDD",
        "side": "L",
        "type": "Power",
        "desc": "1.8V 或 3.3V 數位 IO 供電，須以電容去耦至 GND"
      },
      {
        "num": "6",
        "name": "{IRQZ}",
        "side": "L",
        "type": "Output",
        "desc": "開汲極、active-low 中斷腳；未用時保持浮接或短接至 GND"
      },
      {
        "num": "7",
        "name": "{SDZ}",
        "side": "L",
        "type": "Input",
        "desc": "Active-low 硬體關機腳"
      },
      {
        "num": "8",
        "name": "FSYNC",
        "side": "B",
        "type": "Input",
        "desc": "I2S 字元時脈或 TDM 訊框同步訊號"
      },
      {
        "num": "9",
        "name": "SBCLK",
        "side": "B",
        "type": "Input",
        "desc": "I2S 或 TDM 序列位元時脈"
      },
      {
        "num": "10",
        "name": "SDIN",
        "side": "B",
        "type": "Input",
        "desc": "I2S 或 TDM 序列資料輸入"
      },
      {
        "num": "11",
        "name": "SDOUT",
        "side": "B",
        "type": "I/O",
        "desc": "I2S 或 TDM 序列資料輸出（datasheet Type 欄列為 I/O）"
      },
      {
        "num": "12",
        "name": "BGND",
        "side": "B",
        "type": "Ground",
        "desc": "Boost 接地，須以多個過孔強力連接至 PCB 接地平面"
      },
      {
        "num": "13",
        "name": "SW",
        "side": "B",
        "type": "Passive",
        "desc": "內部 boost 轉換器切換節點（接外部電感）；未使用內部 boost 時保持浮接"
      },
      {
        "num": "14",
        "name": "VBAT_SNS",
        "side": "B",
        "type": "Analog In",
        "desc": "電池感測端，連接電池供電以進行遠端電池電壓感測；未用電池感測功能時短接至 GND"
      },
      {
        "num": "15",
        "name": "VBAT",
        "side": "R",
        "type": "Power",
        "desc": "電池電源輸入，連接 2.5~5.5V 供電並以電容去耦"
      },
      {
        "num": "16",
        "name": "SEL1_I2C",
        "side": "R",
        "type": "Input",
        "desc": "HW Mode：Select1，放大器增益等級選擇（含音量斜升啟停選項）；I2C Mode：短接至 GND 以選擇 I2C 模式"
      },
      {
        "num": "17",
        "name": "GREG",
        "side": "R",
        "type": "Power",
        "desc": "高側閘極電荷幫浦穩壓輸出，不可外接負載"
      },
      {
        "num": "18",
        "name": "PVDD",
        "side": "R",
        "type": "Power",
        "desc": "整合 boost 輸出與 Class-D 功率級供電，須以電容去耦至 GND"
      },
      {
        "num": "19",
        "name": "OUT_N",
        "side": "R",
        "type": "Output",
        "desc": "Class-D 負輸出"
      },
      {
        "num": "20",
        "name": "OUT_P",
        "side": "R",
        "type": "Output",
        "desc": "Class-D 正輸出"
      },
      {
        "num": "21",
        "name": "PGND",
        "side": "T",
        "type": "Ground",
        "desc": "Class-D 功率級接地，須以多個過孔強力連接至 PCB 接地平面"
      },
      {
        "num": "22",
        "name": "GND",
        "side": "T",
        "type": "Ground",
        "desc": "連接至 PCB 接地平面，須以多個過孔強力連接"
      },
      {
        "num": "23",
        "name": "GND",
        "side": "T",
        "type": "Ground",
        "desc": "連接至 PCB 接地平面，須以多個過孔強力連接"
      },
      {
        "num": "24",
        "name": "VDD",
        "side": "T",
        "type": "Power",
        "desc": "連接 1.8V 供電並以電容去耦至 GND"
      },
      {
        "num": "25",
        "name": "GND",
        "side": "T",
        "type": "Ground",
        "desc": "連接至 PCB 接地平面，須以多個過孔強力連接"
      },
      {
        "num": "26",
        "name": "DREG",
        "side": "T",
        "type": "Power",
        "desc": "數位核心穩壓器輸出，以電容旁路至 GND，不可外接負載"
      }
    ],
    "thermalPad": "見 datasheet（4 Pin Configuration and Functions 之 Pin Functions 表僅列 26 個編號腳位，未見獨立 EP/Thermal Pad 列；5.4 Thermal Information 表雖標示封裝為 HR-QFN 26 PINS，但表中無對應腳號可佐證）",
    "specs": [
      {
        "k": "輸出功率",
        "v": "8.2W（rms）@1% THD+N（RL=4Ω+33µH, VBAT=4.4V）"
      },
      {
        "k": "Class-H boost",
        "v": "14.75V boost，最大電流限制 5.1A；33mV 步階可調"
      },
      {
        "k": "效率",
        "v": "最高 91%（@1W, 8Ω 負載）；整合 1.8V VDD Y-bridge"
      },
      {
        "k": "待機功耗",
        "v": "14.7mW（noise gate off）／5.3mW（noise gate on）"
      },
      {
        "k": "音訊性能",
        "v": "114.4dB 動態範圍；THD+N −90dB；閒置通道雜訊 4.2µV A-wt"
      },
      {
        "k": "時脈",
        "v": "MCLK-free 操作；自動時脈/取樣率偵測 16~192kHz"
      },
      {
        "k": "音訊介面",
        "v": "I2S/TDM，最多 8 channels"
      },
      {
        "k": "控制介面",
        "v": "HW pin 控制或 I2C"
      },
      {
        "k": "電源",
        "v": "VBAT 2.5~5.5V；VBAT_SNS 2.5~10.0V；VDD 1.65~1.95V；IOVDD 1.8V 或 3.3V"
      },
      {
        "k": "封裝",
        "v": "26-pin QFN，0.4mm pitch，4mm×3.5mm"
      }
    ],
    "secondSource": [
      "封裝相容（26-pin QFN 4×3.5mm、0.4mm pitch）",
      "功能相同（8.2W 單聲道 Class-D + 14.75V Class-H boost）",
      "音訊介面相容（I2S/TDM 8ch）",
      "控制介面相容（HW pin 或 I2C）",
      "電源軌相容（VBAT 2.5~5.5V、VDD 1.65~1.95V、IOVDD 1.8/3.3V）",
      "動態範圍/THD+N 同級（114.4dB／−90dB）"
    ],
    "dropIn": []
  },
  {
    "part": "TAS5830",
    "mfr": "Texas Instruments",
    "category": "audio",
    "subcategory": "立體聲閉迴路 Class-D 喇叭放大器（整合音訊處理器＋Class-H 追蹤）",
    "package": "32-TSSOP (DAD, PowerPAD) 11.00mm×6.20mm",
    "whatIs": "65W 立體聲數位輸入高效率閉迴路 Class-D 放大器，整合音訊 DSP 處理器與最高 192kHz 音訊支援，具備 Class-H 音訊包絡追蹤演算法，透過 GPIO 輸出 PWM 訊號控制外部 DC-DC 轉換器以提升系統效率。",
    "func": "支援多種輸出組態：BTL 模式 2×80W(4Ω,26V,10%THD+N)／2×65W(4Ω,26V,1%THD+N)／2×74W(6Ω,30V,10%)／2×63W(6Ω,30V,1%)；PBTL 單聲道 1×151W(3Ω,30V,10%)／1×131W(3Ω,30V,1%)。音訊 I/O：I2S/LJ/RJ/TDM(4~16ch)輸入，32/44.1/48/88.2/96/192kHz 取樣率，SDOUT 供監聽/子聲道/回音消除，支援 3-wire 數位音訊介面（免 MCLK）。DSP：3-Band 進階 DRC + 2EQ + AGL + 2EQ、15 個 BQ/聲道、電平表、Mixer/音量/動態EQ/輸出 crossbar、Rattle suppression、頻率限制器。保護：OCE、逐週期電流限制（4 段可選）、OTW/OTE、UVLO/OVLO、PVDD 電壓驟降偵測。控制：I2C（支援 Fast 與 Fast Plus 模式）或硬體腳位模式。",
    "usedIn": "電池供電喇叭、藍牙無線喇叭、Soundbar 與 subwoofer、智慧喇叭等中大功率立體聲音訊系統。",
    "desc": "65W 立體聲閉迴路 Class-D 放大器，Class-H 追蹤演算法，SNR≥110dB，I2S/LJ/RJ/TDM 192kHz，I2C(Fast+)/HW 模式控制，32-TSSOP(DAD) 11×6.2mm PowerPAD。",
    "datasheet": "TI SLASFD8（Software Mode 腳位表 Table 4-1；Hardware Mode 為同顆晶片另一組腳位命名，本條目未採用）",
    "pins": [
      {
        "num": "1",
        "name": "AGND",
        "side": "L",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "2",
        "name": "AVDD",
        "side": "L",
        "type": "Power",
        "desc": "內部調節 5V 類比供電，不可用於驅動外部負載"
      },
      {
        "num": "3",
        "name": "GVDD",
        "side": "L",
        "type": "Power",
        "desc": "閘極驅動內部穩壓輸出，不可用於驅動外部負載"
      },
      {
        "num": "4",
        "name": "{PDN}",
        "side": "L",
        "type": "Input",
        "desc": "Active-low 電源關閉腳，拉低使放大器進入 Shutdown 並關閉所有內部穩壓器"
      },
      {
        "num": "5",
        "name": "SCL",
        "side": "L",
        "type": "Input",
        "desc": "I2C 序列控制時脈輸入"
      },
      {
        "num": "6",
        "name": "SDA",
        "side": "L",
        "type": "I/O",
        "desc": "I2C 序列控制資料輸出入"
      },
      {
        "num": "7",
        "name": "SDIN",
        "side": "L",
        "type": "Input",
        "desc": "序列音訊資料埠資料輸入線"
      },
      {
        "num": "8",
        "name": "BCLK",
        "side": "L",
        "type": "Input",
        "desc": "序列音訊資料埠位元時脈"
      },
      {
        "num": "9",
        "name": "LRCLK",
        "side": "L",
        "type": "Input",
        "desc": "序列音訊資料埠字元選擇時脈；I2S/LJ/RJ 對應左右聲道邊界，TDM 對應訊框同步邊界"
      },
      {
        "num": "10",
        "name": "GPIO2",
        "side": "L",
        "type": "I/O",
        "desc": "通用輸出入，功能可由暫存器（位址 0x60h、0x62h）程式設定；可設為開汲極或推挽輸出"
      },
      {
        "num": "11",
        "name": "GPIO1",
        "side": "L",
        "type": "I/O",
        "desc": "通用輸出入，功能可由暫存器（位址 0x60h、0x61h）程式設定；可設為開汲極或推挽輸出"
      },
      {
        "num": "12",
        "name": "GPIO0",
        "side": "L",
        "type": "I/O",
        "desc": "通用輸出入，功能可由暫存器（位址 0x60h、0x63h）程式設定；可設為開汲極或推挽輸出"
      },
      {
        "num": "13",
        "name": "ADR",
        "side": "L",
        "type": "Analog In",
        "desc": "以下拉至 GND 的電阻值表決定元件 I2C 位址（見 6.4.7.3 節）"
      },
      {
        "num": "14",
        "name": "VR_DIG",
        "side": "L",
        "type": "Power",
        "desc": "內部調節 1.5V 數位供電，不可用於驅動外部負載"
      },
      {
        "num": "15",
        "name": "DVDD",
        "side": "L",
        "type": "Power",
        "desc": "3.3V 或 1.8V 數位電源"
      },
      {
        "num": "16",
        "name": "DGND",
        "side": "L",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "17",
        "name": "PVDD",
        "side": "R",
        "type": "Power",
        "desc": "PVDD 電源輸入"
      },
      {
        "num": "18",
        "name": "PVDD",
        "side": "R",
        "type": "Power",
        "desc": "PVDD 電源輸入"
      },
      {
        "num": "19",
        "name": "OUT_A+",
        "side": "R",
        "type": "Output",
        "desc": "A 聲道差動喇叭放大器輸出正端"
      },
      {
        "num": "20",
        "name": "BST_A+",
        "side": "R",
        "type": "Passive",
        "desc": "OUT_A+ 高側閘極驅動 bootstrap 電容連接點"
      },
      {
        "num": "21",
        "name": "PGND",
        "side": "R",
        "type": "Ground",
        "desc": "功率元件電路接地參考，須連接系統接地"
      },
      {
        "num": "22",
        "name": "PGND",
        "side": "R",
        "type": "Ground",
        "desc": "功率元件電路接地參考，須連接系統接地"
      },
      {
        "num": "23",
        "name": "OUT_A-",
        "side": "R",
        "type": "Output",
        "desc": "A 聲道差動喇叭放大器輸出負端"
      },
      {
        "num": "24",
        "name": "BST_A-",
        "side": "R",
        "type": "Passive",
        "desc": "OUT_A- 高側閘極驅動 bootstrap 電容連接點"
      },
      {
        "num": "25",
        "name": "BST_B-",
        "side": "R",
        "type": "Passive",
        "desc": "OUT_B- 高側閘極驅動 bootstrap 電容連接點"
      },
      {
        "num": "26",
        "name": "OUT_B-",
        "side": "R",
        "type": "Output",
        "desc": "B 聲道差動喇叭放大器輸出負端"
      },
      {
        "num": "27",
        "name": "PGND",
        "side": "R",
        "type": "Ground",
        "desc": "功率元件電路接地參考，須連接系統接地"
      },
      {
        "num": "28",
        "name": "PGND",
        "side": "R",
        "type": "Ground",
        "desc": "功率元件電路接地參考，須連接系統接地"
      },
      {
        "num": "29",
        "name": "BST_B+",
        "side": "R",
        "type": "Passive",
        "desc": "OUT_B+ 高側閘極驅動 bootstrap 電容連接點"
      },
      {
        "num": "30",
        "name": "OUT_B+",
        "side": "R",
        "type": "Output",
        "desc": "B 聲道差動喇叭放大器輸出正端"
      },
      {
        "num": "31",
        "name": "PVDD",
        "side": "R",
        "type": "Power",
        "desc": "PVDD 電源輸入"
      },
      {
        "num": "32",
        "name": "PVDD",
        "side": "R",
        "type": "Power",
        "desc": "PVDD 電源輸入"
      },
      {
        "num": "EP",
        "name": "PowerPAD (EP)",
        "side": "B",
        "type": "Ground",
        "desc": "外露散熱焊盤，須接至已接地之散熱片以獲最佳系統散熱效果（表 4-1 末列：PowerPAD™／P／Ground, connect to grounded heat sink for best system performance）",
        "ep": true
      }
    ],
    "thermalPad": "PowerPAD™（表 4-1 末列：PowerPAD™／P／Ground, connect to grounded heat sink for best system performance），須接散熱片並接地",
    "specs": [
      {
        "k": "輸出組態",
        "v": "BTL 2×80W(4Ω,26V,10%THD+N)／2×65W(4Ω,26V,1%)／2×74W(6Ω,30V,10%)／2×63W(6Ω,30V,1%)；PBTL 1×151W(3Ω,30V,10%)／1×131W(3Ω,30V,1%)"
      },
      {
        "k": "效率",
        "v": ">90% power efficiency，70mΩ RDSon"
      },
      {
        "k": "音訊性能",
        "v": "THD+N ≤0.03%（@1W,1kHz,PVDD=12V）；SNR ≥110dB（A-weighted）；ICN ≤40µVrms"
      },
      {
        "k": "音訊介面",
        "v": "I2S/LJ/RJ，4~16 channel TDM；32/44.1/48/88.2/96/192kHz；3-wire 免 MCLK"
      },
      {
        "k": "DSP",
        "v": "3-Band DRC + 2EQ + AGL + 2EQ；15 BQ/channel；level meter；96/192kHz processing"
      },
      {
        "k": "保護",
        "v": "OCE；逐週期電流限制 4 段可選；OTW/OTE；UVLO/OVLO；PVDD 電壓驟降偵測"
      },
      {
        "k": "控制介面",
        "v": "I2C（Fast 與 Fast Plus 模式）或硬體腳位模式"
      },
      {
        "k": "電源",
        "v": "PVDD 4.5V~30V；DVDD 與 IO 1.8V 或 3.3V"
      },
      {
        "k": "封裝",
        "v": "32-TSSOP (DAD) 11.00mm×6.20mm，PowerPAD 散熱"
      }
    ],
    "secondSource": [
      "封裝相容（32-TSSOP DAD 11×6.2mm，PowerPAD 散熱）",
      "功能相同（65W 立體聲閉迴路 Class-D + Class-H 追蹤）",
      "音訊介面相容（I2S/LJ/RJ/TDM 4~16ch，192kHz）",
      "控制介面相容（I2C Fast/Fast Plus 或 HW 模式）",
      "電源軌相容（PVDD 4.5~30V、DVDD 1.8/3.3V）",
      "SNR/THD+N 同級（≥110dB／≤0.03%）"
    ],
    "dropIn": []
  },
  {
    "part": "LMK3H2108",
    "mfr": "Texas Instruments",
    "category": "clocks",
    "subcategory": "PCIe BAW 通用時脈產生器（8 輸出，內建 BAW 免外部 XTAL）",
    "package": "40-pin QFN (RKP0040A) 5.0mm×5.0mm",
    "whatIs": "整合 BAW 諧振器的低抖動通用時脈產生器，免外部 XTAL/XO；最多 8 路差動輸出（或最多 16 路 LVCMOS），3 路時脈輸入皆可 bypass 至任一輸出組，支援 PCIe Gen1~Gen7。",
    "func": "2 組 FOD（Fractional Output Divider）提供頻率彈性、低功耗與低抖動；輸出格式可選 1.2/1.8/2.5/3.3V LVCMOS、DC/AC 耦合 LVDS、可調擺幅 LP-HCSL（可衍生 LVPECL/CML 等格式）；可程式 SSC，下擴 −0.05%~−3%、中心擴 ±0.025%~±1.5%，或 4 組預設下擴值（−0.1/−0.25/−0.3/−0.5%）；GPI/GPIO 腳可設定為個別 OE、群組 OE、I2C 位址選擇、OTP 分頁選擇、PWRGD/PWRDN#、狀態輸出等功能；支援 OTP 一次性可程式非揮發記憶體並可出廠預燒錄；5ms 最大啟動時間；fail-safe 輸入腳於元件斷電時可拉高。",
    "usedIn": "高效能運算伺服器主機板、NIC/SmartNIC、硬體加速卡等 PCIe Gen1~7 時脈產生，以及一般用途時脈產生與 XO/XTAL 替代。",
    "desc": "8 輸出 PCIe Gen1~7 BAW 時脈產生器，免外部 XTAL，Gen5 CC+SSC 抖動 61fs max，3 輸入可 bypass 至任一輸出，40-QFN 5×5mm。",
    "datasheet": "TI SNAS944A（LMK3H2104/LMK3H2108 family，本條目採用 LMK3H2108 專屬 Table 4-2；LMK3H2104 為 4 輸出、24-QFN 封裝，腳位不同，未採用）",
    "pins": [
      {
        "num": "1",
        "name": "IN0_P/GPI_0",
        "side": "L",
        "type": "Input",
        "desc": "差動時脈輸入或通用輸入，fail-safe 輸入腳，未用時保持浮接"
      },
      {
        "num": "2",
        "name": "IN0_N/GPI_1",
        "side": "L",
        "type": "Input",
        "desc": "差動時脈輸入或通用輸入，fail-safe 輸入腳，未用時保持浮接"
      },
      {
        "num": "3",
        "name": "VDDX",
        "side": "L",
        "type": "Power",
        "desc": "1.8/2.5/3.3V 電源，見 Power Supply Pin Mapping"
      },
      {
        "num": "4",
        "name": "IN1_P/GPI_2",
        "side": "L",
        "type": "Input",
        "desc": "差動時脈輸入或通用輸入，fail-safe 輸入腳，未用時保持浮接"
      },
      {
        "num": "5",
        "name": "IN1_N/GPI_3",
        "side": "L",
        "type": "Input",
        "desc": "差動時脈輸入或通用輸入，fail-safe 輸入腳，未用時保持浮接"
      },
      {
        "num": "6",
        "name": "VDDR",
        "side": "L",
        "type": "Power",
        "desc": "1.8/2.5/3.3V 電源，見 Power Supply Pin Mapping"
      },
      {
        "num": "7",
        "name": "IN2_P/GPI_4",
        "side": "L",
        "type": "Input",
        "desc": "差動時脈輸入或通用輸入，fail-safe 輸入腳，未用時保持浮接"
      },
      {
        "num": "8",
        "name": "IN2_N/GPI_5",
        "side": "L",
        "type": "Input",
        "desc": "差動時脈輸入或通用輸入，fail-safe 輸入腳，未用時保持浮接"
      },
      {
        "num": "9",
        "name": "SCL",
        "side": "L",
        "type": "Input",
        "desc": "I2C 時脈"
      },
      {
        "num": "10",
        "name": "SDA",
        "side": "L",
        "type": "I/O",
        "desc": "I2C 資料"
      },
      {
        "num": "11",
        "name": "VDDD",
        "side": "B",
        "type": "Power",
        "desc": "1.8/2.5/3.3V 電源，見 Power Supply Pin Mapping"
      },
      {
        "num": "12",
        "name": "GPIO_0",
        "side": "B",
        "type": "I/O",
        "desc": "通用輸出入，未用時保持浮接"
      },
      {
        "num": "13",
        "name": "GPIO_1",
        "side": "B",
        "type": "I/O",
        "desc": "通用輸出入，未用時保持浮接"
      },
      {
        "num": "14",
        "name": "GPIO_2",
        "side": "B",
        "type": "I/O",
        "desc": "通用輸出入，未用時保持浮接"
      },
      {
        "num": "15",
        "name": "GPIO_3",
        "side": "B",
        "type": "I/O",
        "desc": "通用輸出入，未用時保持浮接"
      },
      {
        "num": "16",
        "name": "GPIO_4",
        "side": "B",
        "type": "I/O",
        "desc": "通用輸出入，未用時保持浮接"
      },
      {
        "num": "17",
        "name": "NC",
        "side": "B",
        "type": "NC",
        "desc": "未連接，保持浮接或接 GND"
      },
      {
        "num": "18",
        "name": "VDDO_0",
        "side": "B",
        "type": "Power",
        "desc": "1.8/2.5/3.3V 電源，見 Power Supply Pin Mapping"
      },
      {
        "num": "19",
        "name": "OUT0_N",
        "side": "B",
        "type": "Output",
        "desc": "差動時脈輸出 0，支援 LP-HCSL(85Ω/100Ω)、LVDS、1.2/1.8/2.5/3.3V LVCMOS，未用時保持浮接"
      },
      {
        "num": "20",
        "name": "OUT0_P",
        "side": "B",
        "type": "Output",
        "desc": "差動時脈輸出 0，支援 LP-HCSL(85Ω/100Ω)、LVDS、1.2/1.8/2.5/3.3V LVCMOS，未用時保持浮接"
      },
      {
        "num": "21",
        "name": "VDDO_1_2",
        "side": "R",
        "type": "Power",
        "desc": "1.8/2.5/3.3V 電源，見 Power Supply Pin Mapping"
      },
      {
        "num": "22",
        "name": "OUT1_N",
        "side": "R",
        "type": "Output",
        "desc": "差動時脈輸出 1，支援 LP-HCSL(85Ω/100Ω)、LVDS、1.2/1.8/2.5/3.3V LVCMOS，未用時保持浮接"
      },
      {
        "num": "23",
        "name": "OUT1_P",
        "side": "R",
        "type": "Output",
        "desc": "差動時脈輸出 1，支援 LP-HCSL(85Ω/100Ω)、LVDS、1.2/1.8/2.5/3.3V LVCMOS，未用時保持浮接"
      },
      {
        "num": "24",
        "name": "OUT2_N",
        "side": "R",
        "type": "Output",
        "desc": "差動時脈輸出 2，支援 LP-HCSL(85Ω/100Ω)、LVDS、1.2/1.8/2.5/3.3V LVCMOS，未用時保持浮接"
      },
      {
        "num": "25",
        "name": "OUT2_P",
        "side": "R",
        "type": "Output",
        "desc": "差動時脈輸出 2，支援 LP-HCSL(85Ω/100Ω)、LVDS、1.2/1.8/2.5/3.3V LVCMOS，未用時保持浮接"
      },
      {
        "num": "26",
        "name": "OUT3_N",
        "side": "R",
        "type": "Output",
        "desc": "差動時脈輸出 3，支援 LP-HCSL(85Ω/100Ω)、LVDS、1.2/1.8/2.5/3.3V LVCMOS，未用時保持浮接"
      },
      {
        "num": "27",
        "name": "OUT3_P",
        "side": "R",
        "type": "Output",
        "desc": "差動時脈輸出 3，支援 LP-HCSL(85Ω/100Ω)、LVDS、1.2/1.8/2.5/3.3V LVCMOS，未用時保持浮接"
      },
      {
        "num": "28",
        "name": "OUT4_N",
        "side": "R",
        "type": "Output",
        "desc": "差動時脈輸出 4，支援 LP-HCSL(85Ω/100Ω)、LVDS、1.2/1.8/2.5/3.3V LVCMOS，未用時保持浮接"
      },
      {
        "num": "29",
        "name": "OUT4_P",
        "side": "R",
        "type": "Output",
        "desc": "差動時脈輸出 4，支援 LP-HCSL(85Ω/100Ω)、LVDS、1.2/1.8/2.5/3.3V LVCMOS，未用時保持浮接"
      },
      {
        "num": "30",
        "name": "VDDO_3_4",
        "side": "R",
        "type": "Power",
        "desc": "1.8/2.5/3.3V 電源，見 Power Supply Pin Mapping"
      },
      {
        "num": "31",
        "name": "OUT5_N",
        "side": "T",
        "type": "Output",
        "desc": "差動時脈輸出 5，支援 LP-HCSL(85Ω/100Ω)、LVDS、1.2/1.8/2.5/3.3V LVCMOS，未用時保持浮接"
      },
      {
        "num": "32",
        "name": "OUT5_P",
        "side": "T",
        "type": "Output",
        "desc": "差動時脈輸出 5，支援 LP-HCSL(85Ω/100Ω)、LVDS、1.2/1.8/2.5/3.3V LVCMOS，未用時保持浮接"
      },
      {
        "num": "33",
        "name": "VDDO_5",
        "side": "T",
        "type": "Power",
        "desc": "1.8/2.5/3.3V 電源，見 Power Supply Pin Mapping"
      },
      {
        "num": "34",
        "name": "VDDO_6",
        "side": "T",
        "type": "Power",
        "desc": "1.8/2.5/3.3V 電源，見 Power Supply Pin Mapping"
      },
      {
        "num": "35",
        "name": "OUT6_N",
        "side": "T",
        "type": "Output",
        "desc": "差動時脈輸出 6，支援 LP-HCSL(85Ω/100Ω)、LVDS、1.2/1.8/2.5/3.3V LVCMOS，未用時保持浮接"
      },
      {
        "num": "36",
        "name": "OUT6_P",
        "side": "T",
        "type": "Output",
        "desc": "差動時脈輸出 6，支援 LP-HCSL(85Ω/100Ω)、LVDS、1.2/1.8/2.5/3.3V LVCMOS，未用時保持浮接"
      },
      {
        "num": "37",
        "name": "OUT7_N",
        "side": "T",
        "type": "Output",
        "desc": "差動時脈輸出 7，支援 LP-HCSL(85Ω/100Ω)、LVDS、1.2/1.8/2.5/3.3V LVCMOS，未用時保持浮接"
      },
      {
        "num": "38",
        "name": "OUT7_P",
        "side": "T",
        "type": "Output",
        "desc": "差動時脈輸出 7，支援 LP-HCSL(85Ω/100Ω)、LVDS、1.2/1.8/2.5/3.3V LVCMOS，未用時保持浮接"
      },
      {
        "num": "39",
        "name": "VDDO_7",
        "side": "T",
        "type": "Power",
        "desc": "1.8/2.5/3.3V 電源，見 Power Supply Pin Mapping"
      },
      {
        "num": "40",
        "name": "VDDA",
        "side": "T",
        "type": "Power",
        "desc": "1.8/2.5/3.3V 電源，見 Power Supply Pin Mapping"
      },
      {
        "num": "41",
        "name": "DAP (EP)",
        "side": "B",
        "type": "Ground",
        "desc": "散熱接地墊（Die Attach Pad），須接地（Table 4-2：DAP／41／G／Connect to ground）",
        "ep": true
      }
    ],
    "thermalPad": "DAP（Die Attach Pad，Table 4-2 pin 41：DAP／G／Connect to ground），須接地",
    "specs": [
      {
        "k": "拓樸",
        "v": "3 路輸入（可 bypass 至任一輸出）→ 最多 8 路差動輸出或 16 路 LVCMOS"
      },
      {
        "k": "輸出頻率",
        "v": "最高 400MHz"
      },
      {
        "k": "輸出格式",
        "v": "1.2/1.8/2.5/3.3V LVCMOS；DC/AC 耦合 LVDS；可調擺幅 LP-HCSL（可衍生 LVPECL/CML）"
      },
      {
        "k": "PCIe 支援",
        "v": "Gen 1 ~ Gen 7"
      },
      {
        "k": "抖動（CC+SSC）",
        "v": "PCIe Gen5 61fs max／Gen6 36.4fs max／Gen7 25.5fs max"
      },
      {
        "k": "SSC",
        "v": "可程式下擴 −0.05%~−3%、中心擴 ±0.025%~±1.5%，或預設 −0.1/−0.25/−0.3/−0.5% 下擴"
      },
      {
        "k": "啟動時間",
        "v": "5ms max"
      },
      {
        "k": "供電",
        "v": "各 VDD/VDDO 腳可獨立設為 1.8V／2.5V／3.3V"
      },
      {
        "k": "溫度",
        "v": "−40°C ~ 105°C"
      },
      {
        "k": "封裝",
        "v": "40-pin QFN (RKP0040A) 5.0mm×5.0mm（LMK3H2108；4 輸出版 LMK3H2104 為 24-QFN 4×4mm，非同一腳位）"
      }
    ],
    "secondSource": [
      "封裝相容（40-QFN RKP0040A 5×5mm）",
      "功能相同（BAW 免外部 XTAL，3 輸入可 bypass 至 8 輸出）",
      "PCIe Gen1~7 相容",
      "輸出格式相容（LVCMOS/LVDS/LP-HCSL）",
      "抖動同級或更佳（Gen5 CC+SSC ≤61fs）",
      "供電相容（VDD/VDDO 各自 1.8/2.5/3.3V）"
    ],
    "dropIn": []
  },
  {
    "part": "LMKDB1208",
    "mfr": "Texas Instruments",
    "category": "clocks",
    "subcategory": "PCIe LP-HCSL 時脈多工器（2 輸入 8 輸出）",
    "package": "48-pin VQFN (RSL) 6mm×6mm",
    "whatIs": "極低附加抖動 LP-HCSL 時脈多工器：2 路差動輸入切換至 8 路 LP-HCSL 差動輸出，支援 PCIe Gen1~Gen7（CC 與 IR 架構皆可），DB2000QL 規範相容，用於雙時脈來源備援切換。",
    "func": "逐路 {OE}# 致能（內建上拉電阻）；SBI（Side-Band Interface）可高速切換 4 組輸出致能腳（{OE3}/SBI_CLK、{OE4}/SBI_IN、{OE6}/{SHFT_LD}、{OE7}/SBI_OUT，由 SBI_EN 決定功能）；SMBus 介面（SADR0/SADR1 三階位址）供暫存器控制；{LOS} 開汲極輸出指示輸入時脈遺失；輸出阻抗 85Ω/100Ω 可由 ZOUT_SEL 選擇；彈性上電順序、自動輸出停用、fail-safe 輸入。",
    "usedIn": "高效能運算、伺服器主機板、NIC/SmartNIC、硬體加速卡等 PCIe 時脈樹雙來源切換與扇出。",
    "desc": "PCIe Gen1~7 LP-HCSL 2:8 時脈多工器，附加抖動 5fs（Gen5）/2.1fs（Gen7）max，SBI+SMBus 控制，1.8V/3.3V 供電，48-VQFN 6×6mm。",
    "datasheet": "TI SNAS927A（LMKDB1202/1204/1208 family，本條目採用 LMKDB1208 專屬 Table 5-1；Device Comparison 表另列 LMKDB11xx buffer 家族僅為對照，非本腳位表來源）",
    "pins": [
      {
        "num": "1",
        "name": "ZOUT_SEL",
        "side": "L",
        "type": "Input",
        "desc": "LP-HCSL 差動時脈輸出阻抗選擇（內建下拉）：低=85Ω，高=100Ω"
      },
      {
        "num": "2",
        "name": "VDD_DIG",
        "side": "L",
        "type": "Power",
        "desc": "數位電源供電"
      },
      {
        "num": "3",
        "name": "PWRGD/{PWRDN}",
        "side": "L",
        "type": "Input",
        "desc": "Power Good/Power Down 多功能輸入（內建上拉）：首次低→高轉態＝Power Good 啟動元件；之後低/高轉態＝控制進入或退出省電模式（低=省電，高=正常）"
      },
      {
        "num": "4",
        "name": "CLKIN0_P",
        "side": "L",
        "type": "Input",
        "desc": "差動時脈輸入 0"
      },
      {
        "num": "5",
        "name": "CLKIN0_N",
        "side": "L",
        "type": "Input",
        "desc": "差動時脈輸入 0"
      },
      {
        "num": "6",
        "name": "VDD_IN0",
        "side": "L",
        "type": "Power",
        "desc": "CLKIN0 電源供電"
      },
      {
        "num": "7",
        "name": "SADR0",
        "side": "L",
        "type": "Input",
        "desc": "SMBus 位址三階輸入（內建上拉+下拉）"
      },
      {
        "num": "8",
        "name": "CLKIN1_P",
        "side": "L",
        "type": "Input",
        "desc": "差動時脈輸入 1"
      },
      {
        "num": "9",
        "name": "CLKIN1_N",
        "side": "L",
        "type": "Input",
        "desc": "差動時脈輸入 1"
      },
      {
        "num": "10",
        "name": "SMB_DATA",
        "side": "L",
        "type": "I/O",
        "desc": "SMBus 資料，需外部上拉電阻，未用可 NC"
      },
      {
        "num": "11",
        "name": "SMB_CLK",
        "side": "L",
        "type": "Input",
        "desc": "SMBus 時脈，需外部上拉電阻，未用可 NC"
      },
      {
        "num": "12",
        "name": "VDD_IN1",
        "side": "L",
        "type": "Power",
        "desc": "CLKIN1 電源供電"
      },
      {
        "num": "13",
        "name": "VDDO_BANK1",
        "side": "B",
        "type": "Power",
        "desc": "輸出 Bank1（OUT4~OUT7）電源供電"
      },
      {
        "num": "14",
        "name": "CLK7_P",
        "side": "B",
        "type": "Output",
        "desc": "LP-HCSL 差動時脈輸出 7，未用可 NC"
      },
      {
        "num": "15",
        "name": "CLK7_N",
        "side": "B",
        "type": "Output",
        "desc": "LP-HCSL 差動時脈輸出 7，未用可 NC"
      },
      {
        "num": "16",
        "name": "{OE7}/SBI_OUT",
        "side": "B",
        "type": "I/O",
        "desc": "CLK7 輸出致能（active-low，內建上拉）：0=輸出作用、1=輸出停用；SBI 模式時作 SBI 移位暫存器資料輸出（依 SBI_EN 選擇功能）"
      },
      {
        "num": "17",
        "name": "CLKIN_SEL",
        "side": "B",
        "type": "Input",
        "desc": "3 階時脈輸入選擇（內建上拉+下拉）：低=CLKIN0 送至全部輸出；中=CLKIN0 送至 Bank0、CLKIN1 送至 Bank1；高=CLKIN1 送至全部輸出"
      },
      {
        "num": "18",
        "name": "{OE6}/{SHFT_LD}",
        "side": "B",
        "type": "Input",
        "desc": "CLK6 輸出致能（active-low，內建上拉）：0=輸出作用、1=輸出停用；SBI 模式時作 SBI 移位暫存器載入輸入（依 SBI_EN 選擇功能）"
      },
      {
        "num": "19",
        "name": "CLK6_P",
        "side": "B",
        "type": "Output",
        "desc": "LP-HCSL 差動時脈輸出 6，未用可 NC"
      },
      {
        "num": "20",
        "name": "CLK6_N",
        "side": "B",
        "type": "Output",
        "desc": "LP-HCSL 差動時脈輸出 6，未用可 NC"
      },
      {
        "num": "21",
        "name": "VDDO_BANK1",
        "side": "B",
        "type": "Power",
        "desc": "輸出 Bank1（OUT4~OUT7）電源供電"
      },
      {
        "num": "22",
        "name": "CLK5_P",
        "side": "B",
        "type": "Output",
        "desc": "LP-HCSL 差動時脈輸出 5，未用可 NC"
      },
      {
        "num": "23",
        "name": "CLK5_N",
        "side": "B",
        "type": "Output",
        "desc": "LP-HCSL 差動時脈輸出 5，未用可 NC"
      },
      {
        "num": "24",
        "name": "{OE5}",
        "side": "B",
        "type": "Input",
        "desc": "CLK5 輸出致能（active-low，內建上拉）：0=輸出作用、1=輸出停用"
      },
      {
        "num": "25",
        "name": "{OE4}/SBI_IN",
        "side": "R",
        "type": "Input",
        "desc": "CLK4 輸出致能（active-low，內建上拉）：0=輸出作用、1=輸出停用；SBI 模式時作 SBI 資料輸入（依 SBI_EN 選擇功能）"
      },
      {
        "num": "26",
        "name": "CLK4_P",
        "side": "R",
        "type": "Output",
        "desc": "LP-HCSL 差動時脈輸出 4，未用可 NC"
      },
      {
        "num": "27",
        "name": "CLK4_N",
        "side": "R",
        "type": "Output",
        "desc": "LP-HCSL 差動時脈輸出 4，未用可 NC"
      },
      {
        "num": "28",
        "name": "VDDO_BANK1",
        "side": "R",
        "type": "Power",
        "desc": "輸出 Bank1（OUT4~OUT7）電源供電"
      },
      {
        "num": "29",
        "name": "{LOS}",
        "side": "R",
        "type": "Output",
        "desc": "輸入時脈遺失指示（active-low，開汲極需外部上拉電阻）：低=輸入時脈無效，高=輸入時脈有效"
      },
      {
        "num": "30",
        "name": "VDDO_BANK0",
        "side": "R",
        "type": "Power",
        "desc": "輸出 Bank0（OUT0~OUT3）電源供電"
      },
      {
        "num": "31",
        "name": "VDDA",
        "side": "R",
        "type": "Power",
        "desc": "類比電源，建議額外電源濾波（見 10.3 節）"
      },
      {
        "num": "32",
        "name": "CLK3_P",
        "side": "R",
        "type": "Output",
        "desc": "LP-HCSL 差動時脈輸出 3，未用可 NC"
      },
      {
        "num": "33",
        "name": "CLK3_N",
        "side": "R",
        "type": "Output",
        "desc": "LP-HCSL 差動時脈輸出 3，未用可 NC"
      },
      {
        "num": "34",
        "name": "{OE3}/SBI_CLK",
        "side": "R",
        "type": "Input",
        "desc": "CLK3 輸出致能（active-low，內建上拉）：0=輸出作用、1=輸出停用；SBI 模式時作 SBI 時脈輸入（依 SBI_EN 選擇功能）"
      },
      {
        "num": "35",
        "name": "{OE2}",
        "side": "R",
        "type": "Input",
        "desc": "CLK2 輸出致能（active-low，內建上拉）：0=輸出作用、1=輸出停用"
      },
      {
        "num": "36",
        "name": "SADR1",
        "side": "R",
        "type": "Input",
        "desc": "SMBus 位址三階輸入（內建上拉+下拉）"
      },
      {
        "num": "37",
        "name": "CLK2_P",
        "side": "T",
        "type": "Output",
        "desc": "LP-HCSL 差動時脈輸出 2，未用可 NC"
      },
      {
        "num": "38",
        "name": "CLK2_N",
        "side": "T",
        "type": "Output",
        "desc": "LP-HCSL 差動時脈輸出 2，未用可 NC"
      },
      {
        "num": "39",
        "name": "VDDO_BANK0",
        "side": "T",
        "type": "Power",
        "desc": "輸出 Bank0（OUT0~OUT3）電源供電"
      },
      {
        "num": "40",
        "name": "CLK1_P",
        "side": "T",
        "type": "Output",
        "desc": "LP-HCSL 差動時脈輸出 1，未用可 NC"
      },
      {
        "num": "41",
        "name": "CLK1_N",
        "side": "T",
        "type": "Output",
        "desc": "LP-HCSL 差動時脈輸出 1，未用可 NC"
      },
      {
        "num": "42",
        "name": "SBI_EN",
        "side": "T",
        "type": "Input",
        "desc": "SBI 介面致能（內建下拉），上電後不可改變狀態：上電時低=SBI 停用（腳 16/18/25/34 作 OE 功能），高=SBI 啟用（該四腳作 SBI 介面，SMBus 與其餘 OE 腳仍作用）"
      },
      {
        "num": "43",
        "name": "{OE1}",
        "side": "T",
        "type": "Input",
        "desc": "CLK1 輸出致能（active-low，內建上拉）：0=輸出作用、1=輸出停用"
      },
      {
        "num": "44",
        "name": "{OE0}",
        "side": "T",
        "type": "Input",
        "desc": "CLK0 輸出致能（active-low，內建上拉）：0=輸出作用、1=輸出停用"
      },
      {
        "num": "45",
        "name": "CLK0_P",
        "side": "T",
        "type": "Output",
        "desc": "LP-HCSL 差動時脈輸出 0，未用可 NC"
      },
      {
        "num": "46",
        "name": "CLK0_N",
        "side": "T",
        "type": "Output",
        "desc": "LP-HCSL 差動時脈輸出 0，未用可 NC"
      },
      {
        "num": "47",
        "name": "VDDO_BANK0",
        "side": "T",
        "type": "Power",
        "desc": "輸出 Bank0（OUT0~OUT3）電源供電"
      },
      {
        "num": "48",
        "name": "GND",
        "side": "T",
        "type": "Ground",
        "desc": "元件接地"
      },
      {
        "num": "EP",
        "name": "GND (Thermal Pad)",
        "side": "B",
        "type": "Ground",
        "desc": "散熱焊盤，元件接地（表列：Thermal Pad (GND)／Pad／G／Device Ground, Thermal pad.）",
        "ep": true
      }
    ],
    "thermalPad": "Thermal Pad (GND)（Table 5-1 末列：Thermal Pad (GND)／Pad／G／Device Ground, Thermal pad.），須接板上接地平面",
    "specs": [
      {
        "k": "拓樸",
        "v": "2 路差動輸入 → 8 路 LP-HCSL 差動輸出（依 Table 4-1 Device Comparison：LMKDB1208＝Mux，2 input，8 output，85Ω 或 100Ω 可選）"
      },
      {
        "k": "PCIe 支援",
        "v": "Gen 1 ~ Gen 7（CC/IR 架構、含/不含 SSC 輸入皆可）；DB2000QL 相容"
      },
      {
        "k": "附加抖動",
        "v": "31fs max（12kHz-20MHz RMS @156.25MHz）；PCIe Gen4 13fs／Gen5 5fs／Gen6 3fs／Gen7 2.1fs max"
      },
      {
        "k": "控制",
        "v": "逐路 {OE}# + SBI 高速切換 + SMBus（三階位址×2）"
      },
      {
        "k": "輸出阻抗",
        "v": "85Ω 或 100Ω（ZOUT_SEL 選擇）"
      },
      {
        "k": "供電",
        "v": "1.8V／3.3V ±10%"
      },
      {
        "k": "溫度",
        "v": "−40°C ~ 105°C"
      },
      {
        "k": "封裝",
        "v": "48-pin VQFN (RSL) 6mm×6mm"
      }
    ],
    "secondSource": [
      "封裝相容（48-VQFN RSL 6×6mm）",
      "功能相同（PCIe 2:8 LP-HCSL 時脈多工）",
      "附加抖動同級或更佳（Gen5 ≤5fs）",
      "OE/SMBus/SBI 控制相容",
      "供電相容（1.8V/3.3V）",
      "溫度範圍涵蓋（−40~105°C）"
    ],
    "dropIn": []
  },
  {
    "part": "LMX1205-EP",
    "mfr": "Texas Instruments",
    "category": "clocks",
    "subcategory": "JESD204B/C 高頻低雜訊時脈 Buffer/倍頻/分頻器（4 輸出+SYSREF，高可靠等級）",
    "package": "40-pin VQFN (RHA) 6mm×6mm",
    "whatIs": "低雜訊高頻 JESD204B/C 時脈 buffer/倍頻/分頻器，輸出頻率 300MHz~12.8GHz，4 組高頻時脈輸出各配對 SYSREF 輸出，具 noiseless 輸入/輸出延遲調整，適合高精度資料轉換器時脈與測試量測、航太國防等高可靠應用。",
    "func": "共用除頻 1(bypass)/2/3/4/5/6/7/8，共用可程式倍頻 x2/x3/x4/x5/x6/x7/x8；LOGICLKOUT 獨立除頻庫（前除 1/2/4，後除 1(bypass)~1023），並提供第二組邏輯時脈選項（可再加 1/2/4/8 除頻）；輸入延遲 noiseless 可調最高 60ps（解析度 1.1ps）、各輸出延遲可調最高 55ps（解析度 0.9ps）；SYSREF 支援 generator/repeater/repeater-retime 模式與窗口（windowing）功能，508 級延遲步階、每步 <2.5ps @12.8GHz；6 組可程式輸出功率位準；SPI 控制（SCK/SDI/{CS}/MUXOUT）；SYNC 功能可同步所有除頻器及多顆元件。",
    "usedIn": "示波器、無線設備測試儀、寬頻數位化儀等測試量測；雷達、電子戰、尋標器前端、彈藥、相位陣列天線/波束成形等航太國防應用；資料轉換器時脈與時脈 buffer 分配。",
    "desc": "300MHz~12.8GHz JESD204B/C 低雜訊時脈 buffer/倍頻/分頻器，4 輸出+SYSREF，噪聲底 −159dBc/Hz@6GHz，SPI 控制，2.5V，−55~85°C 高可靠等級，40-VQFN 6×6mm。",
    "datasheet": "TI SNAS938",
    "pins": [
      {
        "num": "1",
        "name": "MUXOUT",
        "side": "L",
        "type": "Output",
        "desc": "多工輸出腳，供序列資料回讀與倍頻器鎖定狀態輸出"
      },
      {
        "num": "2",
        "name": "SYSREFREQ_P",
        "side": "L",
        "type": "Input",
        "desc": "差動 SYSREF 請求輸入（JESD204B/C 支援），內建 50Ω 端接，支援 AC/DC 耦合，可直接接受 1V~2V 共模電壓"
      },
      {
        "num": "3",
        "name": "SYSREFREQ_N",
        "side": "L",
        "type": "Input",
        "desc": "差動 SYSREF 請求輸入（JESD204B/C 支援），內建 50Ω 端接，支援 AC/DC 耦合，可直接接受 1V~2V 共模電壓"
      },
      {
        "num": "4",
        "name": "VCC_CLKIN",
        "side": "L",
        "type": "Power",
        "desc": "連接 2.5V 供電，建議在腳位旁並聯高頻電容（典型 0.1µF 或更小）與較大電容（典型 1µF、10µF）"
      },
      {
        "num": "5",
        "name": "GND",
        "side": "L",
        "type": "Ground",
        "desc": "接地"
      },
      {
        "num": "6",
        "name": "CLKIN_P",
        "side": "L",
        "type": "Input",
        "desc": "差動時脈輸入對，各腳內建 50Ω 端接；以適當電容 AC 耦合（典型 0.1µF 或更小）；若用單端訊號，於 CLKIN_N 腳輸入並以串聯 AC 耦合電容+50Ω 電阻端接未用的 CLKIN_P"
      },
      {
        "num": "7",
        "name": "CLKIN_N",
        "side": "L",
        "type": "Input",
        "desc": "差動時脈輸入對，各腳內建 50Ω 端接；以適當電容 AC 耦合（典型 0.1µF 或更小）"
      },
      {
        "num": "8",
        "name": "SCK",
        "side": "L",
        "type": "Input",
        "desc": "SPI 時脈，高阻抗 CMOS 輸入，可接受最高 3.3V，需串聯 200Ω 電阻"
      },
      {
        "num": "9",
        "name": "SDI",
        "side": "L",
        "type": "Input",
        "desc": "SPI 資料輸入，高阻抗 CMOS 輸入，可接受最高 3.3V，需串聯 200Ω 電阻"
      },
      {
        "num": "10",
        "name": "{CS}",
        "side": "L",
        "type": "Input",
        "desc": "SPI 晶片選擇（active-low），高阻抗 CMOS 輸入，可接受最高 3.3V，需串聯 200Ω 電阻"
      },
      {
        "num": "11",
        "name": "SYSREFOUT0_N",
        "side": "B",
        "type": "Output",
        "desc": "差動 SYSREF CML 輸出對（JESD204B/C 支援），支援 AC/DC 耦合，共模電壓可程式 0.5V~1.5V，預期 100Ω 差動負載"
      },
      {
        "num": "12",
        "name": "SYSREFOUT0_P",
        "side": "B",
        "type": "Output",
        "desc": "差動 SYSREF CML 輸出對（JESD204B/C 支援），支援 AC/DC 耦合，共模電壓可程式 0.5V~1.5V，預期 100Ω 差動負載"
      },
      {
        "num": "13",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "接地"
      },
      {
        "num": "14",
        "name": "CLKOUT0_N",
        "side": "B",
        "type": "Output",
        "desc": "差動時脈輸出對，各腳為內建 50Ω 電阻之開集極輸出，輸出擺幅可程式，需 AC 耦合，預期 100Ω 差動負載或各腳 50Ω 負載"
      },
      {
        "num": "15",
        "name": "CLKOUT0_P",
        "side": "B",
        "type": "Output",
        "desc": "差動時脈輸出對，各腳為內建 50Ω 電阻之開集極輸出，輸出擺幅可程式，需 AC 耦合，預期 100Ω 差動負載或各腳 50Ω 負載"
      },
      {
        "num": "16",
        "name": "VCC01",
        "side": "B",
        "type": "Power",
        "desc": "CLKOUT0/CLKOUT1 相關類比電源"
      },
      {
        "num": "17",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "接地"
      },
      {
        "num": "18",
        "name": "CLKOUT1_N",
        "side": "B",
        "type": "Output",
        "desc": "差動時脈輸出對，各腳為內建 50Ω 電阻之開集極輸出，輸出擺幅可程式，需 AC 耦合"
      },
      {
        "num": "19",
        "name": "CLKOUT1_P",
        "side": "B",
        "type": "Output",
        "desc": "差動時脈輸出對，各腳為內建 50Ω 電阻之開集極輸出，輸出擺幅可程式，需 AC 耦合"
      },
      {
        "num": "20",
        "name": "BIAS01",
        "side": "B",
        "type": "Passive",
        "desc": "未使用倍頻器時可保持開路；使用倍頻器時，以 10nF 電容旁路至 GND 以獲最佳雜訊性能"
      },
      {
        "num": "21",
        "name": "SYSREFOUT1_N",
        "side": "R",
        "type": "Output",
        "desc": "差動 SYSREF CML 輸出對（JESD204B/C 支援），支援 AC/DC 耦合，共模電壓可程式 0.5V~1.5V"
      },
      {
        "num": "22",
        "name": "SYSREFOUT1_P",
        "side": "R",
        "type": "Output",
        "desc": "差動 SYSREF CML 輸出對（JESD204B/C 支援），支援 AC/DC 耦合，共模電壓可程式 0.5V~1.5V"
      },
      {
        "num": "23",
        "name": "LOGISYSREFOUT_N/LOGICLKOUT1_N",
        "side": "R",
        "type": "Output",
        "desc": "差動邏輯時脈輸出對，可選 CML 或 LVDS 格式；LVDS 格式共模電壓可程式，CML 格式需外部提拉電阻"
      },
      {
        "num": "24",
        "name": "LOGISYSREFOUT_P/LOGICLKOUT1_P",
        "side": "R",
        "type": "Output",
        "desc": "差動邏輯時脈輸出對，可選 CML 或 LVDS 格式；LVDS 格式共模電壓可程式，CML 格式需外部提拉電阻"
      },
      {
        "num": "25",
        "name": "VCC_LOGICLK",
        "side": "R",
        "type": "Power",
        "desc": "邏輯時脈相關電源"
      },
      {
        "num": "26",
        "name": "GND",
        "side": "R",
        "type": "Ground",
        "desc": "接地"
      },
      {
        "num": "27",
        "name": "LOGICLKOUT0_N",
        "side": "R",
        "type": "Output",
        "desc": "差動邏輯時脈輸出對，可選 CML 或 LVDS 格式；LVDS 格式共模電壓可程式，CML 格式需外部提拉電阻"
      },
      {
        "num": "28",
        "name": "LOGICLKOUT0_P",
        "side": "R",
        "type": "Output",
        "desc": "差動邏輯時脈輸出對，可選 CML 或 LVDS 格式；LVDS 格式共模電壓可程式，CML 格式需外部提拉電阻"
      },
      {
        "num": "29",
        "name": "SYSREFOUT2_N",
        "side": "R",
        "type": "Output",
        "desc": "差動 SYSREF CML 輸出對（JESD204B/C 支援），支援 AC/DC 耦合，共模電壓可程式 0.5V~1.5V"
      },
      {
        "num": "30",
        "name": "SYSREFOUT2_P",
        "side": "R",
        "type": "Output",
        "desc": "差動 SYSREF CML 輸出對（JESD204B/C 支援），支援 AC/DC 耦合，共模電壓可程式 0.5V~1.5V"
      },
      {
        "num": "31",
        "name": "BIAS23",
        "side": "T",
        "type": "Passive",
        "desc": "未使用倍頻器時可保持開路；使用倍頻器時，以 10µF 與 0.1µF 電容旁路至 GND 以獲最佳雜訊性能"
      },
      {
        "num": "32",
        "name": "CLKOUT2_N",
        "side": "T",
        "type": "Output",
        "desc": "差動時脈輸出對，各腳為內建 50Ω 電阻之開集極輸出，輸出擺幅可程式，需 AC 耦合"
      },
      {
        "num": "33",
        "name": "CLKOUT2_P",
        "side": "T",
        "type": "Output",
        "desc": "差動時脈輸出對，各腳為內建 50Ω 電阻之開集極輸出，輸出擺幅可程式，需 AC 耦合"
      },
      {
        "num": "34",
        "name": "GND",
        "side": "T",
        "type": "Ground",
        "desc": "接地"
      },
      {
        "num": "35",
        "name": "VCC23",
        "side": "T",
        "type": "Power",
        "desc": "CLKOUT2/CLKOUT3 相關類比電源"
      },
      {
        "num": "36",
        "name": "CLKOUT3_N",
        "side": "T",
        "type": "Output",
        "desc": "差動時脈輸出對，各腳為內建 50Ω 電阻之開集極輸出，輸出擺幅可程式，需 AC 耦合"
      },
      {
        "num": "37",
        "name": "CLKOUT3_P",
        "side": "T",
        "type": "Output",
        "desc": "差動時脈輸出對，各腳為內建 50Ω 電阻之開集極輸出，輸出擺幅可程式，需 AC 耦合"
      },
      {
        "num": "38",
        "name": "GND",
        "side": "T",
        "type": "Ground",
        "desc": "接地"
      },
      {
        "num": "39",
        "name": "SYSREFOUT3_N",
        "side": "T",
        "type": "Output",
        "desc": "差動 SYSREF CML 輸出對（JESD204B/C 支援），支援 AC/DC 耦合，共模電壓可程式 0.5V~1.5V"
      },
      {
        "num": "40",
        "name": "SYSREFOUT3_P",
        "side": "T",
        "type": "Output",
        "desc": "差動 SYSREF CML 輸出對（JESD204B/C 支援），支援 AC/DC 耦合，共模電壓可程式 0.5V~1.5V"
      },
      {
        "num": "EP",
        "name": "DAP",
        "side": "B",
        "type": "Ground",
        "desc": "散熱接地墊（Table 4-1：DAP／DAP／GND／Ground these pins.）",
        "ep": true
      }
    ],
    "thermalPad": "DAP（Table 4-1：DAP／DAP／GND／Ground these pins.），須接地",
    "specs": [
      {
        "k": "輸出頻率",
        "v": "300MHz ~ 12.8GHz"
      },
      {
        "k": "雜訊性能",
        "v": "噪聲底 −159dBc/Hz @6GHz 輸出；附加抖動 36fs（DC~fCLK）／10fs（100Hz~100MHz）"
      },
      {
        "k": "除頻/倍頻",
        "v": "共用除頻 1(bypass)/2~8；共用可程式倍頻 x2~x8；LOGICLK 獨立除頻庫"
      },
      {
        "k": "延遲調整",
        "v": "輸入延遲最高 60ps（1.1ps 解析度）；各輸出延遲最高 55ps（0.9ps 解析度），皆為 noiseless 調整"
      },
      {
        "k": "SYSREF",
        "v": "4 組高頻輸出各配對 SYSREF；508 級延遲步階 <2.5ps@12.8GHz；generator/repeater/repeater-retime 模式"
      },
      {
        "k": "控制介面",
        "v": "SPI（SCK/SDI/{CS}/MUXOUT）"
      },
      {
        "k": "電源",
        "v": "2.5V"
      },
      {
        "k": "溫度/可靠性",
        "v": "−55°C ~ 85°C；VID #V62/25648，Controlled Baseline、單一組裝/測試場地、單一晶圓廠、Extended Product Life Cycle、Product Traceability"
      },
      {
        "k": "封裝",
        "v": "40-pin VQFN (RHA) 6mm×6mm"
      }
    ],
    "secondSource": [
      "封裝相容（40-VQFN RHA 6×6mm）",
      "功能相同（4 輸出+SYSREF JESD204B/C buffer/倍頻/分頻）",
      "頻率範圍涵蓋（300MHz~12.8GHz）",
      "雜訊性能同級（噪聲底 −159dBc/Hz@6GHz）",
      "控制介面相容（SPI）",
      "可靠性等級相容（Controlled Baseline 高可靠系列）"
    ],
    "dropIn": []
  },
  {
    "part": "LMX1404-EP",
    "mfr": "Texas Instruments",
    "category": "clocks",
    "subcategory": "JESD204B/C 高頻低雜訊時脈 Buffer/倍頻/分頻器（4 輸出+SYSREF，支援 pin mode，高可靠等級）",
    "package": "64-pin HTQFP (PAP0064E) 10.00mm×10.00mm",
    "whatIs": "低雜訊高頻 JESD204B/C 時脈 buffer/倍頻/分頻器，輸出頻率 300MHz~15GHz，支援免 SPI 的腳位模式（pin mode）組態，4 組高頻時脈輸出各配對 SYSREF 輸出，−55°C~125°C 高可靠等級，適合資料轉換器時脈與航太國防酬載。",
    "func": "共用除頻 1(buffer)/2/3/4/5/6/7/8，共用可程式倍頻 x2/x3/x4；LOGICLKOUT 獨立除頻庫（前除 1/2/4，後除 1(bypass)~1023）；PWRSEL[2:0]/DIVSEL[2:0]/MUXSEL[1:0]/CLK0_EN~CLK3_EN/LOGIC_EN/SYSREF_EN 等腳位可在 pin mode 下免 SPI 直接組態輸出功率位準、除頻/倍頻值、操作模式與各通道啟閉；亦支援 SPI 控制（SCK/SDI/{CS}/MUXOUT）；8 組可程式輸出功率位準；SYSREF 支援 generator 與 repeater 模式，並具窗口（windowing）功能優化時序，508 級延遲步階、每步 <2.5ps @12.8GHz；SYNC 功能可同步所有除頻器及多顆元件；可藉停用 SYSREF 輸出以分配多聲道、低偏斜、超低雜訊本地振盪訊號至多個混頻器。",
    "usedIn": "雷達影像酬載、通訊酬載、指揮與資料處理（command and data handling）、資料轉換器時脈、時脈分配/倍頻/分頻等航太國防與高精度量測應用。",
    "desc": "300MHz~15GHz JESD204B/C 低雜訊時脈 buffer/倍頻/分頻器，支援免 SPI pin mode，4 輸出+SYSREF，噪聲底 −159dBc/Hz@6GHz，2.5V，−55~125°C，64-HTQFP 10×10mm。",
    "datasheet": "TI SNAS882A",
    "pins": [
      {
        "num": "1",
        "name": "MUXOUT",
        "side": "L",
        "type": "Output",
        "desc": "多工輸出腳，供序列資料回讀（SDO）與倍頻器鎖定狀態輸出"
      },
      {
        "num": "2",
        "name": "CE",
        "side": "L",
        "type": "Input",
        "desc": "晶片致能（Chip Enable）"
      },
      {
        "num": "3",
        "name": "SYSREFREQ_P",
        "side": "L",
        "type": "Input",
        "desc": "差動 SYSREF 請求輸入（JESD204B/C 支援），內建 50Ω AC 耦合至內部共模電壓或以電容耦合至 GND，支援 AC/DC 耦合，可直接接受 1.2V~2V 共模電壓"
      },
      {
        "num": "4",
        "name": "SYSREFREQ_N",
        "side": "L",
        "type": "Input",
        "desc": "差動 SYSREF 請求輸入（JESD204B/C 支援），內建 50Ω AC 耦合至內部共模電壓或以電容耦合至 GND，支援 AC/DC 耦合，可直接接受 1.2V~2V 共模電壓"
      },
      {
        "num": "5",
        "name": "VCC_CLKIN",
        "side": "L",
        "type": "Power",
        "desc": "連接 2.5V 供電，建議在腳位旁並聯寬頻 RF 電容（典型 0.1µF 或更小）與較大電容（典型 1µF、10µF），較大電容可置於稍遠處"
      },
      {
        "num": "6",
        "name": "GND",
        "side": "L",
        "type": "Ground",
        "desc": "接地"
      },
      {
        "num": "7",
        "name": "CLKIN_P",
        "side": "L",
        "type": "Input",
        "desc": "差動參考輸入時脈，內建 50Ω 端接；以適當電容 AC 耦合（典型 0.1µF 或更小）；若用單端訊號，未用腳以 50Ω 電阻 AC 耦合至地"
      },
      {
        "num": "8",
        "name": "CLKIN_N",
        "side": "L",
        "type": "Input",
        "desc": "差動參考輸入時脈，內建 50Ω 端接；以適當電容 AC 耦合（典型 0.1µF 或更小）"
      },
      {
        "num": "9",
        "name": "GND",
        "side": "L",
        "type": "Ground",
        "desc": "接地"
      },
      {
        "num": "10",
        "name": "PWRSEL0",
        "side": "L",
        "type": "Input",
        "desc": "Pin mode 下選擇輸出功率位準"
      },
      {
        "num": "11",
        "name": "PWRSEL1",
        "side": "L",
        "type": "Input",
        "desc": "Pin mode 下選擇輸出功率位準"
      },
      {
        "num": "12",
        "name": "PWRSEL2",
        "side": "L",
        "type": "Input",
        "desc": "Pin mode 下選擇輸出功率位準"
      },
      {
        "num": "13",
        "name": "NC",
        "side": "L",
        "type": "NC",
        "desc": "未連接腳，須以 1kΩ 電阻接地"
      },
      {
        "num": "14",
        "name": "SCK",
        "side": "L",
        "type": "Input",
        "desc": "SPI 時脈，高阻抗 CMOS 輸入，可接受最高 3.3V"
      },
      {
        "num": "15",
        "name": "SDI",
        "side": "L",
        "type": "Input",
        "desc": "SPI 資料輸入，高阻抗 CMOS 輸入，可接受最高 3.3V"
      },
      {
        "num": "16",
        "name": "{CS}",
        "side": "L",
        "type": "Input",
        "desc": "SPI 晶片選擇（active-low），高阻抗 CMOS 輸入，可接受最高 3.3V"
      },
      {
        "num": "17",
        "name": "CAL",
        "side": "B",
        "type": "Input",
        "desc": "倍頻器模式下使用的校準腳"
      },
      {
        "num": "18",
        "name": "SYSREFOUT0_N",
        "side": "B",
        "type": "Output",
        "desc": "差動 SYSREF CML 輸出對（JESD204B/C 支援），支援 AC/DC 耦合，共模電壓可程式 0.6V~2V"
      },
      {
        "num": "19",
        "name": "SYSREFOUT0_P",
        "side": "B",
        "type": "Output",
        "desc": "差動 SYSREF CML 輸出對（JESD204B/C 支援），支援 AC/DC 耦合，共模電壓可程式 0.6V~2V"
      },
      {
        "num": "20",
        "name": "VCC01",
        "side": "B",
        "type": "Power",
        "desc": "連接 2.5V 供電，建議在腳位旁並聯寬頻 RF 電容與較大電容"
      },
      {
        "num": "21",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "接地"
      },
      {
        "num": "22",
        "name": "CLKOUT0_N",
        "side": "B",
        "type": "Output",
        "desc": "差動時脈輸出對，各腳為內建 50Ω 電阻之開集極輸出，輸出擺幅可程式，需 AC 耦合"
      },
      {
        "num": "23",
        "name": "CLKOUT0_P",
        "side": "B",
        "type": "Output",
        "desc": "差動時脈輸出對，各腳為內建 50Ω 電阻之開集極輸出，輸出擺幅可程式，需 AC 耦合"
      },
      {
        "num": "24",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "接地"
      },
      {
        "num": "25",
        "name": "CLK0_EN",
        "side": "B",
        "type": "Input",
        "desc": "個別輸出通道啟用/停用"
      },
      {
        "num": "26",
        "name": "CLK1_EN",
        "side": "B",
        "type": "Input",
        "desc": "個別輸出通道啟用/停用"
      },
      {
        "num": "27",
        "name": "VCC01",
        "side": "B",
        "type": "Power",
        "desc": "連接 2.5V 供電，建議在腳位旁並聯寬頻 RF 電容與較大電容"
      },
      {
        "num": "28",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "接地"
      },
      {
        "num": "29",
        "name": "CLKOUT1_N",
        "side": "B",
        "type": "Output",
        "desc": "差動時脈輸出對，各腳為內建 50Ω 電阻之開集極輸出，輸出擺幅可程式，需 AC 耦合"
      },
      {
        "num": "30",
        "name": "CLKOUT1_P",
        "side": "B",
        "type": "Output",
        "desc": "差動時脈輸出對，各腳為內建 50Ω 電阻之開集極輸出，輸出擺幅可程式，需 AC 耦合"
      },
      {
        "num": "31",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "接地"
      },
      {
        "num": "32",
        "name": "VBIAS01",
        "side": "B",
        "type": "Passive",
        "desc": "倍頻器模式下以 10nF 電容旁路至 GND 以獲最佳雜訊性能"
      },
      {
        "num": "33",
        "name": "SYSREFOUT1_N",
        "side": "R",
        "type": "Output",
        "desc": "差動 SYSREF CML 輸出對（JESD204B/C 支援），支援 AC/DC 耦合，共模電壓可程式 0.6V~2V"
      },
      {
        "num": "34",
        "name": "SYSREFOUT1_P",
        "side": "R",
        "type": "Output",
        "desc": "差動 SYSREF CML 輸出對（JESD204B/C 支援），支援 AC/DC 耦合，共模電壓可程式 0.6V~2V"
      },
      {
        "num": "35",
        "name": "DIVSEL2",
        "side": "R",
        "type": "Input",
        "desc": "Pin mode 下選擇除頻器或倍頻器數值"
      },
      {
        "num": "36",
        "name": "DIVSEL1",
        "side": "R",
        "type": "Input",
        "desc": "Pin mode 下選擇除頻器或倍頻器數值"
      },
      {
        "num": "37",
        "name": "DIVSEL0",
        "side": "R",
        "type": "Input",
        "desc": "Pin mode 下選擇除頻器或倍頻器數值"
      },
      {
        "num": "38",
        "name": "LOGISYSREFOUT_N",
        "side": "R",
        "type": "Output",
        "desc": "差動時脈輸出對，可選 CML 或 LVDS 格式，共模電壓可程式"
      },
      {
        "num": "39",
        "name": "LOGISYSREFOUT_P",
        "side": "R",
        "type": "Output",
        "desc": "差動時脈輸出對，可選 CML 或 LVDS 格式，共模電壓可程式"
      },
      {
        "num": "40",
        "name": "VCC_LOGICLK",
        "side": "R",
        "type": "Power",
        "desc": "連接 2.5V 供電，建議在腳位旁並聯寬頻 RF 電容與較大電容"
      },
      {
        "num": "41",
        "name": "GND",
        "side": "R",
        "type": "Ground",
        "desc": "接地"
      },
      {
        "num": "42",
        "name": "LOGICLKOUT_N",
        "side": "R",
        "type": "Output",
        "desc": "差動時脈輸出對，可選 CML 或 LVDS 格式，共模電壓可程式"
      },
      {
        "num": "43",
        "name": "LOGICLKOUT_P",
        "side": "R",
        "type": "Output",
        "desc": "差動時脈輸出對，可選 CML 或 LVDS 格式，共模電壓可程式"
      },
      {
        "num": "44",
        "name": "LOGIC_EN",
        "side": "R",
        "type": "Input",
        "desc": "Pin mode 下啟用/停用邏輯時脈通道"
      },
      {
        "num": "45",
        "name": "MUXSEL1",
        "side": "R",
        "type": "Input",
        "desc": "Pin mode 下選擇操作模式（buffer、divider 或 multiplier）"
      },
      {
        "num": "46",
        "name": "MUXSEL0",
        "side": "R",
        "type": "Input",
        "desc": "Pin mode 下選擇操作模式（buffer、divider 或 multiplier）"
      },
      {
        "num": "47",
        "name": "SYSREFOUT2_N",
        "side": "R",
        "type": "Output",
        "desc": "差動 SYSREF CML 輸出對（JESD204B/C 支援），支援 AC/DC 耦合，共模電壓可程式 0.6V~2V"
      },
      {
        "num": "48",
        "name": "SYSREFOUT2_P",
        "side": "R",
        "type": "Output",
        "desc": "差動 SYSREF CML 輸出對（JESD204B/C 支援），支援 AC/DC 耦合，共模電壓可程式 0.6V~2V"
      },
      {
        "num": "49",
        "name": "VBIAS23",
        "side": "T",
        "type": "Passive",
        "desc": "倍頻器模式下以 10µF 與 0.1µF 電容旁路至 GND 以獲最佳雜訊性能"
      },
      {
        "num": "50",
        "name": "GND",
        "side": "T",
        "type": "Ground",
        "desc": "接地"
      },
      {
        "num": "51",
        "name": "CLKOUT2_N",
        "side": "T",
        "type": "Output",
        "desc": "差動時脈輸出對，各腳為內建 50Ω 電阻之開集極輸出，輸出擺幅可程式，需 AC 耦合"
      },
      {
        "num": "52",
        "name": "CLKOUT2_P",
        "side": "T",
        "type": "Output",
        "desc": "差動時脈輸出對，各腳為內建 50Ω 電阻之開集極輸出，輸出擺幅可程式，需 AC 耦合"
      },
      {
        "num": "53",
        "name": "GND",
        "side": "T",
        "type": "Ground",
        "desc": "接地"
      },
      {
        "num": "54",
        "name": "VCC23",
        "side": "T",
        "type": "Power",
        "desc": "連接 2.5V 供電，建議在腳位旁並聯寬頻 RF 電容與較大電容"
      },
      {
        "num": "55",
        "name": "CLK2_EN",
        "side": "T",
        "type": "Input",
        "desc": "個別輸出通道啟用/停用"
      },
      {
        "num": "56",
        "name": "CLK3_EN",
        "side": "T",
        "type": "Input",
        "desc": "個別輸出通道啟用/停用"
      },
      {
        "num": "57",
        "name": "GND",
        "side": "T",
        "type": "Ground",
        "desc": "接地"
      },
      {
        "num": "58",
        "name": "CLKOUT3_N",
        "side": "T",
        "type": "Output",
        "desc": "差動時脈輸出對，各腳為內建 50Ω 電阻之開集極輸出，輸出擺幅可程式，需 AC 耦合"
      },
      {
        "num": "59",
        "name": "CLKOUT3_P",
        "side": "T",
        "type": "Output",
        "desc": "差動時脈輸出對，各腳為內建 50Ω 電阻之開集極輸出，輸出擺幅可程式，需 AC 耦合"
      },
      {
        "num": "60",
        "name": "GND",
        "side": "T",
        "type": "Ground",
        "desc": "接地"
      },
      {
        "num": "61",
        "name": "VCC23",
        "side": "T",
        "type": "Power",
        "desc": "連接 2.5V 供電，建議在腳位旁並聯寬頻 RF 電容與較大電容"
      },
      {
        "num": "62",
        "name": "SYSREFOUT3_N",
        "side": "T",
        "type": "Output",
        "desc": "差動 SYSREF CML 輸出對（JESD204B/C 支援），支援 AC/DC 耦合，共模電壓可程式 0.6V~2V"
      },
      {
        "num": "63",
        "name": "SYSREFOUT3_P",
        "side": "T",
        "type": "Output",
        "desc": "差動 SYSREF CML 輸出對（JESD204B/C 支援），支援 AC/DC 耦合，共模電壓可程式 0.6V~2V"
      },
      {
        "num": "64",
        "name": "SYSREF_EN",
        "side": "T",
        "type": "Input",
        "desc": "Pin mode 下啟用/停用 SYSREF 區塊"
      },
      {
        "num": "EP",
        "name": "DAP",
        "side": "B",
        "type": "Ground",
        "desc": "散熱接地墊（Table 4-1：DAP／DAP／GND／Ground the pad.）",
        "ep": true
      }
    ],
    "thermalPad": "DAP（Table 4-1：DAP／DAP／GND／Ground the pad.），須接地",
    "specs": [
      {
        "k": "輸出頻率",
        "v": "300MHz ~ 15GHz"
      },
      {
        "k": "雜訊性能",
        "v": "噪聲底 −159dBc/Hz @6GHz 輸出；附加抖動 36fs（100Hz~fCLK，@6GHz 輸出）／5fs（100Hz~100MHz）"
      },
      {
        "k": "除頻/倍頻",
        "v": "共用除頻 1(buffer)/2~8；共用可程式倍頻 x2/x3/x4；LOGICLK 獨立除頻庫"
      },
      {
        "k": "組態模式",
        "v": "Pin mode（免 SPI，以 PWRSEL/DIVSEL/MUXSEL/CLKx_EN 等腳位設定）或 SPI（SCK/SDI/{CS}/MUXOUT）"
      },
      {
        "k": "SYSREF",
        "v": "4 組高頻輸出各配對 SYSREF；508 級延遲步階 <2.5ps@12.8GHz；generator/repeater 模式"
      },
      {
        "k": "輸出功率位準",
        "v": "8 組可程式"
      },
      {
        "k": "電源",
        "v": "2.5V"
      },
      {
        "k": "溫度/可靠性",
        "v": "−55°C ~ 125°C；VID #V62/24627，Controlled Baseline、單一組裝/測試場地、單一晶圓廠、Extended Product Life Cycle、Product Traceability"
      },
      {
        "k": "封裝",
        "v": "64-pin HTQFP (PAP0064E) 10mm×10mm"
      }
    ],
    "secondSource": [
      "封裝相容（64-HTQFP PAP0064E 10×10mm）",
      "功能相同（4 輸出+SYSREF JESD204B/C buffer/倍頻/分頻，支援 pin mode）",
      "頻率範圍涵蓋（300MHz~15GHz）",
      "雜訊性能同級（噪聲底 −159dBc/Hz@6GHz）",
      "組態模式相容（Pin mode 或 SPI）",
      "可靠性等級相容（Controlled Baseline 高可靠系列，−55~125°C）"
    ],
    "dropIn": []
  },
  {
    "part": "TPS7H3034-SP",
    "mfr": "Texas Instruments",
    "category": "power",
    "subcategory": "太空級四路電壓監控／定序器（Quad Voltage Supervisor, push-pull 輸出, Rad-Hard）",
    "package": "22-Pin CFP (HFT)；同一份 datasheet 內另有 open-drain 輸出版本 TPS7H3124-SP/TPS7H3134-SP（同為 22-Pin CFP，pin14/15/17/18 定義不同，見各腳 desc）；另有可選 2UV+2OV 或 2-window 模式版 TPS7H3024-SP（push-pull，pinout 與本型號相同）",
    "whatIs": "太空級四路電源電壓監控／定序器：同時監控四路電源軌(SENSE1-4)的欠壓(UV)／過壓(OV)狀態，經對應 RESET 輸出通知系統，並內建看門狗(Watchdog)計時器。",
    "func": "SENSE1~SENSE4 各自接外部電阻分壓監控一路電源軌，比較器門檻電壓典型 599.7mV(VTH_SENSEx)。MODE 腳選擇輸出行為：MODE=0 為 2UV+2OV，MODE=1 為 2-window；本 TPS7H3034-SP 為 push-pull 輸出、4 UV 或 4 OV 功能版本(依 MODE 設定，此腳不可動態切換)。RESET1~RESET4 為對應 SENSE 通道故障時的重置輸出(push-pull，VOH 由 PULL_UP1 決定；開集極版由外部提升電阻決定)。WDI 為看門狗輸入，須定期由低翻高清除計時器，逾時未清除則 WDO 拉低(push-pull，VOH 由 PULL_UP2 決定)；WD_TMR/DLY_TMR 各以一顆電阻至 GND 設定看門狗逾時時間(0.52s~1.5s)與故障後延遲時間(0.25ms~25ms)，懸空則分別停用看門狗／無延遲。PWRGD 於全部電源軌(SENSE1-4)都在正常範圍內時輸出高。SR_UVLO 為系統重置與 UVLO 輸入，拉低會強制所有輸出低態，可用電阻分壓對 VIN 程式化開啟位準(datasheet Type 欄標示 O，惟功能描述為輸入訊號，以功能描述為準)。VLDO 為內部穩壓器輸出(需外接至少 1µF 電容至 GND，最大負載 5mA、無過電流保護，可用於監測負電壓時產生正偏移)。REFCAP 為 1.2V 內部參考電容腳(需 470nF 電容，禁止外接其他電路)。抗輻射太空級(QMLV-RHA)：TID 100krad(Si) RLAT，DSEE 免疫至 75MeV-cm²/mg。",
    "usedIn": "衛星、太空酬載板上多路電源電壓監控與定序、看門狗保護、電源良好旗標產生等太空應用。",
    "desc": "22-Pin CFP(HFT)封裝，抗輻射(TID 100krad(Si))太空級四路電壓監控器(push-pull 輸出版，依 MODE 設定 4UV 或 4OV)，含看門狗計時器(WDI/WDO/WD_TMR)與故障延遲計時器(DLY_TMR)。同一份 datasheet 內另有：可選 2UV+2OV 或 2-window 模式版 TPS7H3024-SP(同 pinout)；open-drain 輸出版 TPS7H3124-SP/TPS7H3134-SP(TPS7H31x4)——後者 pin17/18 改為 VLDO(與 pin15 並接)/GND(與 pin14 並接)，本條目 pin14/15/17/18 的 desc 已註記 open-drain 版對應差異。訂購型號 5962R2420603VXC 於原文標註「Advanced information」(尚未定案之預先發布資訊)，實際規格請覆核最新版 datasheet。Thermal Pad 內部接地(GND)，金屬上蓋(Metal lid)透過封環內部連接至 Thermal Pad 與 GND。",
    "datasheet": "https://www.ti.com/lit/ds/symlink/tps7h3034-sp.pdf",
    "pins": [
      {
        "num": "1",
        "name": "SENSE1",
        "side": "L",
        "type": "Analog In",
        "desc": "比較器非反相輸入，監控電源軌 1；於受監控電源軌與 GND 間接外部電阻分壓器，分壓中點接此腳，設定 VON1/VOFF1。門檻電壓典型 599.7mV(VTH_SENSEx)。"
      },
      {
        "num": "2",
        "name": "SENSE2",
        "side": "L",
        "type": "Analog In",
        "desc": "比較器非反相輸入，監控電源軌 2；接法同 SENSE1，設定 VON2/VOFF2。"
      },
      {
        "num": "3",
        "name": "SENSE3",
        "side": "L",
        "type": "Analog In",
        "desc": "比較器非反相輸入，監控電源軌 3；接法同 SENSE1，設定 VON3/VOFF3。"
      },
      {
        "num": "4",
        "name": "SENSE4",
        "side": "L",
        "type": "Analog In",
        "desc": "比較器非反相輸入，監控電源軌 4；接法同 SENSE1，設定 VON4/VOFF4。"
      },
      {
        "num": "5",
        "name": "REFCAP",
        "side": "L",
        "type": "Analog Out",
        "desc": "1.2V 內部參考電容腳；需外接 470nF 電容至 GND，不可額外以外部電路負載此腳。"
      },
      {
        "num": "6",
        "name": "HYS",
        "side": "L",
        "type": "Analog Out",
        "desc": "遲滯電流設定腳；接 49.9kΩ 電阻(建議 0.1% 或更佳誤差)至 GND，設定 SENSE1~SENSE4 的遲滯電流(典型 24µA)。"
      },
      {
        "num": "7",
        "name": "SR_UVLO",
        "side": "L",
        "type": "Input",
        "desc": "系統重置與 UVLO 輸入；拉低此腳強制所有輸出為低態，可用 VIN 至 GND 電阻分壓器設定開啟電壓位準。datasheet Type 欄標示為 O，惟功能描述為輸入訊號，以功能描述為準。"
      },
      {
        "num": "8",
        "name": "WDI",
        "side": "L",
        "type": "Digital In",
        "desc": "看門狗輸入；須由低翻高切換以清除看門狗計時器，逾時未翻轉則 WDO 輸出低態。"
      },
      {
        "num": "9",
        "name": "IN",
        "side": "L",
        "type": "Power",
        "desc": "元件輸入供電；輸入電壓範圍 3V~14V，建議靠近此腳放置至少 0.1µF 陶瓷電容。"
      },
      {
        "num": "10",
        "name": "WD_TMR",
        "side": "L",
        "type": "Analog In",
        "desc": "看門狗計時器設定腳；接 56.2kΩ~174kΩ 電阻至 GND，可設定逾時時間 0.52s~1.5s，懸空則停用看門狗。"
      },
      {
        "num": "11",
        "name": "DLY_TMR",
        "side": "L",
        "type": "Analog In",
        "desc": "延遲計時器設定腳；接 10.5kΩ~1.18MΩ 電阻至 GND，可設定故障後延遲時間 0.25ms~25ms，懸空則無延遲。"
      },
      {
        "num": "22",
        "name": "RESET1",
        "side": "R",
        "type": "Output",
        "desc": "重置輸出 1；SENSE1 故障時輸出低態。Push-pull 或開集極輸出，push-pull 的 VOH 由 PULL_UP1 決定，開集極版建議外接 10kΩ 提升電阻。"
      },
      {
        "num": "21",
        "name": "RESET2",
        "side": "R",
        "type": "Output",
        "desc": "重置輸出 2；SENSE2 故障時輸出低態。接法同 RESET1。"
      },
      {
        "num": "20",
        "name": "RESET3",
        "side": "R",
        "type": "Output",
        "desc": "重置輸出 3；SENSE3 故障時輸出低態。接法同 RESET1。"
      },
      {
        "num": "19",
        "name": "RESET4",
        "side": "R",
        "type": "Output",
        "desc": "重置輸出 4；SENSE4 故障時輸出低態。接法同 RESET1。"
      },
      {
        "num": "18",
        "name": "PULL_UP1",
        "side": "R",
        "type": "Power",
        "desc": "RESET1~RESET4 推挽輸出的全域上拉電源電壓輸入；靠近此腳放置至少 1µF 陶瓷電容。開集極輸出版(TPS7H31x4)本腳改為 GND。"
      },
      {
        "num": "17",
        "name": "PULL_UP2",
        "side": "R",
        "type": "Power",
        "desc": "PWRGD 與 WDO 推挽輸出的上拉電源電壓輸入；靠近此腳放置至少 1µF 陶瓷電容。開集極輸出版(TPS7H31x4)本腳改為 VLDO，並建議與腳15(VLDO)以 10kΩ 電阻外部相接。"
      },
      {
        "num": "16",
        "name": "MODE",
        "side": "R",
        "type": "Digital In",
        "desc": "輸出行為選擇腳(2UV+2OV 或 2-window)；不可動態切換。MODE=0 對應 2UV+2OV，MODE=1 對應 2-window。"
      },
      {
        "num": "15",
        "name": "VLDO",
        "side": "R",
        "type": "Analog Out",
        "desc": "內部穩壓器輸出；需外接至少 1µF 陶瓷電容至 GND，可用於監測負電壓時產生正偏移，最大負載電流 5mA、無過電流保護。開集極輸出版(TPS7H31x4)另有腳17並接為 VLDO，建議腳15與腳17間以 10kΩ 電阻外部相接。"
      },
      {
        "num": "14",
        "name": "GND",
        "side": "R",
        "type": "Ground",
        "desc": "接地。開集極輸出版(TPS7H31x4)另有腳18並接為 GND。"
      },
      {
        "num": "13",
        "name": "PWRGD",
        "side": "R",
        "type": "Output",
        "desc": "電源良好指示；當 SENSE1~SENSE4 全部在正常範圍內時輸出高態。Push-pull 或開集極輸出，push-pull 的 VOH 由 PULL_UP2 決定，開集極版建議外接 10kΩ 提升電阻。"
      },
      {
        "num": "12",
        "name": "WDO",
        "side": "R",
        "type": "Output",
        "desc": "看門狗輸出。Push-pull 或開集極輸出，push-pull 的 VOH 由 PULL_UP2 決定，開集極版建議外接 10kΩ 提升電阻。"
      },
      {
        "num": "23",
        "name": "Thermal Pad",
        "side": "B",
        "type": "Ground",
        "desc": "散熱墊，內部接地(GND)；建議連接大面積接地銅箔以利散熱。金屬上蓋(Metal lid)透過封環內部連接至此 Thermal Pad 與 GND。原文佐證：「Thermal pad — — — Internally grounded...」、「Metal lid Lid Lid — The lid is internally connected to the thermal pad and GND through the seal ring.」",
        "ep": true
      }
    ],
    "specs": [
      {
        "k": "功能",
        "v": "太空級四路電壓監控／定序器(push-pull 輸出)"
      },
      {
        "k": "感測門檻(SENSE1-4，典型)",
        "v": "599.7mV"
      },
      {
        "k": "遲滯電流(典型)",
        "v": "24µA（HYS 電阻 49.9kΩ 設定）"
      },
      {
        "k": "看門狗逾時範圍",
        "v": "0.52s ~ 1.5s（WD_TMR 電阻 56.2k~174kΩ）"
      },
      {
        "k": "故障延遲範圍",
        "v": "0.25ms ~ 25ms（DLY_TMR 電阻 10.5k~1.18MΩ）"
      },
      {
        "k": "主電源輸入(IN)",
        "v": "3V ~ 14V"
      },
      {
        "k": "抗輻射",
        "v": "TID 100krad(Si) RLAT；DSEE 免疫至 75MeV-cm²/mg"
      },
      {
        "k": "認證等級",
        "v": "QMLV-RHA"
      },
      {
        "k": "封裝",
        "v": "22-Pin CFP (HFT)"
      },
      {
        "k": "訂購型號",
        "v": "5962R2420603VXC（原文標註 Advanced information，預先發布）"
      }
    ],
    "secondSource": [
      "封裝＋pinout 相容(22-Pin CFP HFT、push-pull 輸出型腳位)",
      "感測門檻／遲滯電流同等或更佳",
      "看門狗與延遲計時器可程式化範圍涵蓋",
      "抗輻射規格同等或更佳(TID/DSEE)",
      "認證等級涵蓋(QMLV-RHA)",
      "供電／工作溫度涵蓋"
    ],
    "dropIn": []
  },
  {
    "part": "ADS9324",
    "mfr": "Texas Instruments",
    "category": "data-converters",
    "subcategory": "16通道 16-bit 同步採樣 SAR ADC（整合類比前端）",
    "package": "64-VQFN (RSK) 8.00mm × 8.00mm",
    "whatIs": "16通道、16-bit 逐次逼近（SAR）同步採樣資料擷取系統：每通道最高 1MSPS，每通道皆內建完整類比前端，含 1MΩ 輸入阻抗可程式增益放大器（PGA）、輸入箝位、低通濾波器與 ADC 輸入驅動器；並內建低漂移精密參考電壓與緩衝器驅動 ADC。高輸入阻抗可直接連接感測器與變壓器，免除外部驅動電路，支援差動與單端輸入。",
    "func": "序列介面可組態為 1-lane、2-lane、4-lane、8-lane 讀出 ADC 輸出；ADC 亦可彈性組態為 2-CH、4-CH、8-CH、16-CH 同步採樣模式；輸入範圍：差動 ±12.5V/±10V/±6.25V/±5V/±2.5V，共模電壓 ±12.5V；類比頻寬選項 25kHz 與 325kHz；開路安全輸入（浮接輸入時 ADC 輸出碼趨近零）；典型性能 INL ±0.5LSB、DNL ±0.5LSB、SNR 88dB、THD −103dB、DC CMRR 100dB；低漂移片上參考電壓 4.096V（緩衝，15ppm/°C 典型溫度飄移）；數位功能含片上數位濾波器（過採樣）、系統偏移/增益/相位校正、數位窗口比較器、ADC 輸出資料隨機化器。",
    "usedIn": "變電站自動化、馬達保護電驛與接觸器、馬達控制電流感測、工業自動化、測試與量測等需高精度多通道同步採樣的場合。",
    "desc": "16通道 16-bit 同步採樣 SAR ADC，整合 PGA/箝位/濾波前端與 4.096V 低漂移參考，1MSPS/通道，1/2/4/8-lane 可組態序列介面，−40°C~125°C，64-VQFN 8×8mm。",
    "datasheet": "TI SBASB22",
    "pins": [
      {
        "num": "1",
        "name": "AIN5P",
        "side": "L",
        "type": "Analog In",
        "desc": "類比輸入通道 5，正端"
      },
      {
        "num": "2",
        "name": "AIN5M",
        "side": "L",
        "type": "Analog In",
        "desc": "類比輸入通道 5，負端"
      },
      {
        "num": "3",
        "name": "AIN6P",
        "side": "L",
        "type": "Analog In",
        "desc": "類比輸入通道 6，正端"
      },
      {
        "num": "4",
        "name": "AIN6M",
        "side": "L",
        "type": "Analog In",
        "desc": "類比輸入通道 6，負端"
      },
      {
        "num": "5",
        "name": "AIN7P",
        "side": "L",
        "type": "Analog In",
        "desc": "類比輸入通道 7，正端"
      },
      {
        "num": "6",
        "name": "AIN7M",
        "side": "L",
        "type": "Analog In",
        "desc": "類比輸入通道 7，負端"
      },
      {
        "num": "7",
        "name": "AIN8P",
        "side": "L",
        "type": "Analog In",
        "desc": "類比輸入通道 8，正端"
      },
      {
        "num": "8",
        "name": "AIN8M",
        "side": "L",
        "type": "Analog In",
        "desc": "類比輸入通道 8，負端"
      },
      {
        "num": "9",
        "name": "AIN9P",
        "side": "L",
        "type": "Analog In",
        "desc": "類比輸入通道 9，正端"
      },
      {
        "num": "10",
        "name": "AIN9M",
        "side": "L",
        "type": "Analog In",
        "desc": "類比輸入通道 9，負端"
      },
      {
        "num": "11",
        "name": "AIN10P",
        "side": "L",
        "type": "Analog In",
        "desc": "類比輸入通道 10，正端"
      },
      {
        "num": "12",
        "name": "AIN10M",
        "side": "L",
        "type": "Analog In",
        "desc": "類比輸入通道 10，負端"
      },
      {
        "num": "13",
        "name": "AIN11P",
        "side": "L",
        "type": "Analog In",
        "desc": "類比輸入通道 11，正端"
      },
      {
        "num": "14",
        "name": "AIN11M",
        "side": "L",
        "type": "Analog In",
        "desc": "類比輸入通道 11，負端"
      },
      {
        "num": "15",
        "name": "AIN12P",
        "side": "L",
        "type": "Analog In",
        "desc": "類比輸入通道 12，正端"
      },
      {
        "num": "16",
        "name": "AIN12M",
        "side": "L",
        "type": "Analog In",
        "desc": "類比輸入通道 12，負端"
      },
      {
        "num": "17",
        "name": "AIN13P",
        "side": "B",
        "type": "Analog In",
        "desc": "類比輸入通道 13，正端"
      },
      {
        "num": "18",
        "name": "AIN13M",
        "side": "B",
        "type": "Analog In",
        "desc": "類比輸入通道 13，負端"
      },
      {
        "num": "19",
        "name": "AIN14P",
        "side": "B",
        "type": "Analog In",
        "desc": "類比輸入通道 14，正端"
      },
      {
        "num": "20",
        "name": "AIN14M",
        "side": "B",
        "type": "Analog In",
        "desc": "類比輸入通道 14，負端"
      },
      {
        "num": "21",
        "name": "AIN15P",
        "side": "B",
        "type": "Analog In",
        "desc": "類比輸入通道 15，正端"
      },
      {
        "num": "22",
        "name": "AIN15M",
        "side": "B",
        "type": "Analog In",
        "desc": "類比輸入通道 15，負端"
      },
      {
        "num": "23",
        "name": "AIN16P",
        "side": "B",
        "type": "Analog In",
        "desc": "類比輸入通道 16，正端"
      },
      {
        "num": "24",
        "name": "AIN16M",
        "side": "B",
        "type": "Analog In",
        "desc": "類比輸入通道 16，負端"
      },
      {
        "num": "25",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "接地"
      },
      {
        "num": "26",
        "name": "AVDD_5V",
        "side": "B",
        "type": "Power",
        "desc": "5V 類比電源；建議並接 1µF 與 0.1µF 去耦電容至 GND"
      },
      {
        "num": "27",
        "name": "AVDD_5V",
        "side": "B",
        "type": "Power",
        "desc": "5V 類比電源；建議並接 1µF 與 0.1µF 去耦電容至 GND"
      },
      {
        "num": "28",
        "name": "REFM",
        "side": "B",
        "type": "Ground",
        "desc": "參考接地腳；於 PCB 上短接至 GND 平面（外部）"
      },
      {
        "num": "29",
        "name": "REFCAPB",
        "side": "B",
        "type": "Analog Out",
        "desc": "參考放大器輸出腳；於腳 29、28 間並接低 ESR 1µF、X7R 去耦電容"
      },
      {
        "num": "30",
        "name": "AVDD_1V8",
        "side": "B",
        "type": "Power",
        "desc": "1.8V 類比電源；建議並接 1µF 與 0.1µF 去耦電容至 GND"
      },
      {
        "num": "31",
        "name": "REFSEL",
        "side": "B",
        "type": "Input",
        "desc": "邏輯輸入，選擇 ADC 參考電壓來源"
      },
      {
        "num": "32",
        "name": "{RESET}",
        "side": "B",
        "type": "Input",
        "desc": "元件重置輸入；active low"
      },
      {
        "num": "33",
        "name": "GND",
        "side": "R",
        "type": "Ground",
        "desc": "接地"
      },
      {
        "num": "34",
        "name": "IOVDD",
        "side": "R",
        "type": "Power",
        "desc": "數位 I/O 介面供電；建議並接 1µF 與 0.1µF 去耦電容至 GND"
      },
      {
        "num": "35",
        "name": "{CS}",
        "side": "R",
        "type": "Input",
        "desc": "SPI 組態晶片選擇輸入；active low"
      },
      {
        "num": "36",
        "name": "SDI",
        "side": "R",
        "type": "Input",
        "desc": "數位介面序列資料輸入"
      },
      {
        "num": "37",
        "name": "SCLK",
        "side": "R",
        "type": "Input",
        "desc": "數位介面序列時脈輸入"
      },
      {
        "num": "38",
        "name": "SDOUT",
        "side": "R",
        "type": "Output",
        "desc": "使用者暫存器讀取或單通道模式的序列資料輸出"
      },
      {
        "num": "39",
        "name": "D7",
        "side": "R",
        "type": "Output",
        "desc": "序列輸出資料通道 7"
      },
      {
        "num": "40",
        "name": "D6",
        "side": "R",
        "type": "Output",
        "desc": "序列輸出資料通道 6"
      },
      {
        "num": "41",
        "name": "D5",
        "side": "R",
        "type": "Output",
        "desc": "序列輸出資料通道 5"
      },
      {
        "num": "42",
        "name": "D4",
        "side": "R",
        "type": "Output",
        "desc": "序列輸出資料通道 4"
      },
      {
        "num": "43",
        "name": "D3",
        "side": "R",
        "type": "I/O",
        "desc": "序列輸出資料通道 3，或菊鏈輸入 3"
      },
      {
        "num": "44",
        "name": "D2",
        "side": "R",
        "type": "I/O",
        "desc": "序列輸出資料通道 2，或菊鏈輸入 2"
      },
      {
        "num": "45",
        "name": "D1",
        "side": "R",
        "type": "I/O",
        "desc": "序列輸出資料通道 1，或菊鏈輸入 1"
      },
      {
        "num": "46",
        "name": "D0",
        "side": "R",
        "type": "I/O",
        "desc": "序列輸出資料通道 0，或菊鏈輸入 0"
      },
      {
        "num": "47",
        "name": "IOVDD",
        "side": "R",
        "type": "Power",
        "desc": "數位 I/O 介面供電；建議並接 1µF 與 0.1µF 去耦電容至 GND"
      },
      {
        "num": "48",
        "name": "GND",
        "side": "R",
        "type": "Ground",
        "desc": "接地"
      },
      {
        "num": "49",
        "name": "DRDY/ALARM",
        "side": "T",
        "type": "I/O",
        "desc": "資料就緒或告警旗標輸出；active high"
      },
      {
        "num": "50",
        "name": "CONVST",
        "side": "T",
        "type": "Input",
        "desc": "邏輯輸入，控制轉換啟動"
      },
      {
        "num": "51",
        "name": "AVDD_1V8",
        "side": "T",
        "type": "Power",
        "desc": "1.8V 類比電源；建議並接 1µF 與 0.1µF 去耦電容至 GND"
      },
      {
        "num": "52",
        "name": "REFCAPA",
        "side": "T",
        "type": "Analog Out",
        "desc": "參考放大器輸出腳；於腳 52、53 間並接低 ESR 1µF、X7R 去耦電容"
      },
      {
        "num": "53",
        "name": "REFM",
        "side": "T",
        "type": "Ground",
        "desc": "參考接地腳；於 PCB 上短接至 GND 平面（外部）"
      },
      {
        "num": "54",
        "name": "REFIO",
        "side": "T",
        "type": "Analog Out",
        "desc": "REFSEL 為高時作內部參考電壓輸出；REFSEL 為低時作外部參考輸入腳；與腳 53（REFM）以 4.7µF 電容去耦"
      },
      {
        "num": "55",
        "name": "GND",
        "side": "T",
        "type": "Ground",
        "desc": "接地"
      },
      {
        "num": "56",
        "name": "AVDD_5V",
        "side": "T",
        "type": "Power",
        "desc": "5V 類比電源；建議並接 1µF 與 0.1µF 去耦電容至 GND"
      },
      {
        "num": "57",
        "name": "AIN1P",
        "side": "T",
        "type": "Analog In",
        "desc": "類比輸入通道 1，正端"
      },
      {
        "num": "58",
        "name": "AIN1M",
        "side": "T",
        "type": "Analog In",
        "desc": "類比輸入通道 1，負端"
      },
      {
        "num": "59",
        "name": "AIN2P",
        "side": "T",
        "type": "Analog In",
        "desc": "類比輸入通道 2，正端"
      },
      {
        "num": "60",
        "name": "AIN2M",
        "side": "T",
        "type": "Analog In",
        "desc": "類比輸入通道 2，負端"
      },
      {
        "num": "61",
        "name": "AIN3P",
        "side": "T",
        "type": "Analog In",
        "desc": "類比輸入通道 3，正端"
      },
      {
        "num": "62",
        "name": "AIN3M",
        "side": "T",
        "type": "Analog In",
        "desc": "類比輸入通道 3，負端"
      },
      {
        "num": "63",
        "name": "AIN4P",
        "side": "T",
        "type": "Analog In",
        "desc": "類比輸入通道 4，正端"
      },
      {
        "num": "64",
        "name": "AIN4M",
        "side": "T",
        "type": "Analog In",
        "desc": "類比輸入通道 4，負端"
      },
      {
        "num": "65",
        "name": "GND (EP)",
        "side": "B",
        "type": "Ground",
        "desc": "外露散熱焊盤；datasheet 表列 Thermal Pad，須接 GND",
        "ep": true
      }
    ],
    "thermalPad": "外露焊盤，datasheet 表列 Thermal Pad，須接 GND（Figure 4-1 圖示位於封裝中央）",
    "specs": [
      {
        "k": "解析度/通道數",
        "v": "16-bit、16 通道同步採樣"
      },
      {
        "k": "吞吐率",
        "v": "每通道最高 1MSPS"
      },
      {
        "k": "輸入前端",
        "v": "整合 PGA，1MΩ 輸入阻抗，支援單端與差動輸入"
      },
      {
        "k": "輸入範圍",
        "v": "差動 ±12.5V/±10V/±6.25V/±5V/±2.5V；共模電壓 ±12.5V"
      },
      {
        "k": "類比頻寬",
        "v": "25kHz 或 325kHz（可選）"
      },
      {
        "k": "典型性能",
        "v": "INL ±0.5LSB；DNL ±0.5LSB；SNR 88dB；THD −103dB；DC CMRR 100dB"
      },
      {
        "k": "參考電壓",
        "v": "片上低漂移 4.096V＋緩衝器，15ppm/°C typical"
      },
      {
        "k": "數位介面",
        "v": "1/2/4/8-lane 可組態序列輸出；2/4/8/16-CH 同步採樣模式可組態"
      },
      {
        "k": "電源",
        "v": "類比供電 5V 及 1.8V；數位 I/O 供電 1.8V~3.3V"
      },
      {
        "k": "溫度範圍",
        "v": "−40°C ~ +125°C"
      },
      {
        "k": "封裝",
        "v": "64-VQFN (RSK) 8.00mm × 8.00mm，EP=GND"
      }
    ],
    "secondSource": [
      "封裝＋pinout 相容（64-VQFN 8×8mm、EP=GND）",
      "功能相同（16通道 16-bit 同步採樣 SAR ADC，整合 PGA 前端）",
      "吞吐率相容（1MSPS/通道）",
      "輸入範圍涵蓋（差動 ±12.5V~±2.5V 多檔）",
      "數位介面相容（1/2/4/8-lane 序列輸出）",
      "電源軌相容（5V/1.8V 類比、1.8~3.3V 數位 I/O）",
      "溫度範圍涵蓋（−40°C~125°C）"
    ],
    "dropIn": []
  },
  {
    "part": "ADC3664-EP",
    "mfr": "Texas Instruments",
    "category": "data-converters",
    "subcategory": "雙通道 14-bit 125MSPS 低雜訊低功耗 ADC（Enhanced Product）",
    "package": "40-QFN (RSB) 5mm × 5mm",
    "whatIs": "低雜訊、超低功耗雙通道 14-bit、125MSPS 高速 ADC。設計以達最佳雜訊表現，雜訊頻譜密度 −156.9dBFS/Hz，兼具線性度與動態範圍；支援 IF 取樣，短至 2 個時脈週期延遲。part number 的 -EP 為 TI「Enhanced Product」強化產品等級（非本表 exposed pad 之 EP 縮寫），符合 ASTM E595 除氣規範、有 VID（Vendor Item Drawing）、−55°C~105°C 延伸溫度範圍、單一晶圓/封裝/測試廠、金線鍵合＋NiPdAu 接腳鍍層、晶圓批次可追溯、延長產品生命週期；-EP 不具耐輻射特性（耐輻射僅 -SEP 版本）。",
    "func": "電壓參考可選外部（1~125MSPS）或內部（100~125MSPS）；輸入頻寬 200MHz（3dB）；INL ±2.6LSB、DNL ±0.9LSB（typical）；內建可選/可略過的片上 DSP，支援 2/4/8/16/32 倍抽取與 32-bit NCO；序列 LVDS 數位介面支援 2-wire、1-wire、1/2-wire 模式；頻譜性能（fIN=5MHz）：SNR 77.5dBFS、SFDR 84dBc（HD2/HD3）、SFDR 92dBFS（worst spur）；功耗 100mW/通道（125MSPS）。",
    "usedIn": "高速資料擷取、衛星光通訊酬載、衛星成像酬載、衛星通訊酬載、衛星雷達與光達（RADAR/LIDAR）酬載等太空與高可靠度應用。",
    "desc": "雙通道 14-bit 125MSPS 低雜訊 ADC，雜訊本底 −156.9dBFS/Hz，100mW/通道，序列 LVDS 介面，40-QFN 5×5mm；-EP 為強化產品等級（−55°C~105°C，非耐輻射，耐輻射見 -SEP）。",
    "datasheet": "TI SBASAP4",
    "pins": [
      {
        "num": "1",
        "name": "{PDN}/SYNC",
        "side": "L",
        "type": "Input",
        "desc": "省電/同步輸入，經 SPI 介面組態；active high；內建 21kΩ 下拉電阻"
      },
      {
        "num": "2",
        "name": "VREF",
        "side": "L",
        "type": "Analog In",
        "desc": "外部電壓參考輸入"
      },
      {
        "num": "3",
        "name": "REFGND",
        "side": "L",
        "type": "Ground",
        "desc": "參考接地輸入，0V"
      },
      {
        "num": "4",
        "name": "REFBUF/CTRL",
        "side": "L",
        "type": "Input",
        "desc": "用於設定上電時預設取樣時脈類型與電壓參考來源；內建 100kΩ 上拉電阻至 AVDD"
      },
      {
        "num": "5",
        "name": "AVDD",
        "side": "L",
        "type": "Power",
        "desc": "1.8V 類比電源"
      },
      {
        "num": "6",
        "name": "CLKP",
        "side": "L",
        "type": "Input",
        "desc": "ADC 取樣時脈差動輸入，正端"
      },
      {
        "num": "7",
        "name": "CLKM",
        "side": "L",
        "type": "Input",
        "desc": "ADC 取樣時脈差動輸入，負端"
      },
      {
        "num": "8",
        "name": "VCM",
        "side": "L",
        "type": "Analog Out",
        "desc": "類比輸入共模電壓輸出，0.95V"
      },
      {
        "num": "9",
        "name": "{RESET}",
        "side": "L",
        "type": "Input",
        "desc": "硬體重置；active high；內建 21kΩ 下拉電阻"
      },
      {
        "num": "10",
        "name": "SDIO",
        "side": "L",
        "type": "I/O",
        "desc": "序列介面資料輸入與輸出；內建 21kΩ 下拉電阻"
      },
      {
        "num": "11",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "接地，0V（與 PowerPAD 同列於表中）"
      },
      {
        "num": "12",
        "name": "AINP",
        "side": "B",
        "type": "Analog In",
        "desc": "正極性類比輸入，通道 A"
      },
      {
        "num": "13",
        "name": "AINM",
        "side": "B",
        "type": "Analog In",
        "desc": "負極性類比輸入，通道 A"
      },
      {
        "num": "14",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "接地，0V（與 PowerPAD 同列於表中）"
      },
      {
        "num": "15",
        "name": "AVDD",
        "side": "B",
        "type": "Power",
        "desc": "1.8V 類比電源"
      },
      {
        "num": "16",
        "name": "{SEN}",
        "side": "B",
        "type": "Input",
        "desc": "序列介面致能；active low；內建 21kΩ 上拉電阻至 AVDD"
      },
      {
        "num": "17",
        "name": "DA1M",
        "side": "B",
        "type": "Output",
        "desc": "A 通道 lane 1 序列 LVDS 輸出，負端"
      },
      {
        "num": "18",
        "name": "DA1P",
        "side": "B",
        "type": "Output",
        "desc": "A 通道 lane 1 序列 LVDS 輸出，正端"
      },
      {
        "num": "19",
        "name": "DA0M",
        "side": "B",
        "type": "Output",
        "desc": "A 通道 lane 0 序列 LVDS 輸出，負端"
      },
      {
        "num": "20",
        "name": "DA0P",
        "side": "B",
        "type": "Output",
        "desc": "A 通道 lane 0 序列 LVDS 輸出，正端"
      },
      {
        "num": "21",
        "name": "IOVDD",
        "side": "R",
        "type": "Power",
        "desc": "數位介面 1.8V 電源"
      },
      {
        "num": "22",
        "name": "DCLKM",
        "side": "R",
        "type": "Output",
        "desc": "序列 LVDS 位元時脈輸出，負端"
      },
      {
        "num": "23",
        "name": "DCLKP",
        "side": "R",
        "type": "Output",
        "desc": "序列 LVDS 位元時脈輸出，正端"
      },
      {
        "num": "24",
        "name": "DCLKINM",
        "side": "R",
        "type": "Input",
        "desc": "序列 LVDS 位元時脈輸入，負端；內建 100Ω 差動終端電阻"
      },
      {
        "num": "25",
        "name": "DCLKINP",
        "side": "R",
        "type": "Input",
        "desc": "序列 LVDS 位元時脈輸入，正端；內建 100Ω 差動終端電阻"
      },
      {
        "num": "26",
        "name": "IOGND",
        "side": "R",
        "type": "Ground",
        "desc": "數位介面接地，0V"
      },
      {
        "num": "27",
        "name": "NC",
        "side": "R",
        "type": "NC",
        "desc": "未連接"
      },
      {
        "num": "28",
        "name": "FCLKP",
        "side": "R",
        "type": "Output",
        "desc": "序列 LVDS 框時脈輸出，正端"
      },
      {
        "num": "29",
        "name": "FCLKM",
        "side": "R",
        "type": "Output",
        "desc": "序列 LVDS 框時脈輸出，負端"
      },
      {
        "num": "30",
        "name": "IOVDD",
        "side": "R",
        "type": "Power",
        "desc": "數位介面 1.8V 電源"
      },
      {
        "num": "31",
        "name": "DB0P",
        "side": "T",
        "type": "Output",
        "desc": "B 通道 lane 0 序列 LVDS 輸出，正端"
      },
      {
        "num": "32",
        "name": "DB0M",
        "side": "T",
        "type": "Output",
        "desc": "B 通道 lane 0 序列 LVDS 輸出，負端"
      },
      {
        "num": "33",
        "name": "DB1P",
        "side": "T",
        "type": "Output",
        "desc": "B 通道 lane 1 序列 LVDS 輸出，正端"
      },
      {
        "num": "34",
        "name": "DB1M",
        "side": "T",
        "type": "Output",
        "desc": "B 通道 lane 1 序列 LVDS 輸出，負端"
      },
      {
        "num": "35",
        "name": "SCLK",
        "side": "T",
        "type": "Input",
        "desc": "序列介面時脈輸入；內建 21kΩ 下拉電阻"
      },
      {
        "num": "36",
        "name": "AVDD",
        "side": "T",
        "type": "Power",
        "desc": "1.8V 類比電源"
      },
      {
        "num": "37",
        "name": "GND",
        "side": "T",
        "type": "Ground",
        "desc": "接地，0V（與 PowerPAD 同列於表中）"
      },
      {
        "num": "38",
        "name": "BINM",
        "side": "T",
        "type": "Analog In",
        "desc": "負極性類比輸入，通道 B"
      },
      {
        "num": "39",
        "name": "BINP",
        "side": "T",
        "type": "Analog In",
        "desc": "正極性類比輸入，通道 B"
      },
      {
        "num": "40",
        "name": "GND",
        "side": "T",
        "type": "Ground",
        "desc": "接地，0V（與 PowerPAD 同列於表中）"
      },
      {
        "num": "41",
        "name": "GND (EP/PowerPAD)",
        "side": "B",
        "type": "Ground",
        "desc": "PowerPAD 外露散熱焊盤；datasheet Pin Functions 表 GND 列與 Figure 4-1 均列 PowerPAD/Thermal Pad，須接 GND",
        "ep": true
      }
    ],
    "thermalPad": "PowerPAD 外露散熱焊盤=GND（與腳 11,14,37,40 同列於 Pin Functions 表 GND 列），須接 GND",
    "specs": [
      {
        "k": "通道/解析度/速率",
        "v": "雙通道、14-bit（no missing codes）、125MSPS"
      },
      {
        "k": "雜訊本底",
        "v": "−156.9dBFS/Hz"
      },
      {
        "k": "功耗",
        "v": "100mW/通道（125MSPS）"
      },
      {
        "k": "延遲",
        "v": "2 個時脈週期"
      },
      {
        "k": "電壓參考",
        "v": "外部：1~125MSPS；內部：100~125MSPS"
      },
      {
        "k": "輸入頻寬",
        "v": "200MHz（3dB）"
      },
      {
        "k": "線性度",
        "v": "INL ±2.6LSB；DNL ±0.9LSB（typical）"
      },
      {
        "k": "片上 DSP",
        "v": "可選/可略過；抽取 2/4/8/16/32 倍；32-bit NCO"
      },
      {
        "k": "數位介面",
        "v": "序列 LVDS（2-wire、1-wire、1/2-wire 可選）"
      },
      {
        "k": "頻譜性能（fIN=5MHz）",
        "v": "SNR 77.5dBFS；SFDR 84dBc（HD2/HD3）；SFDR 92dBFS（worst spur）"
      },
      {
        "k": "溫度範圍",
        "v": "−55°C ~ +105°C（Enhanced Product）"
      },
      {
        "k": "封裝",
        "v": "40-QFN (RSB) 5mm × 5mm，EP(PowerPAD)=GND"
      }
    ],
    "secondSource": [
      "封裝＋pinout 相容（40-QFN 5×5mm、PowerPAD=GND）",
      "功能相同（雙通道 14-bit 125MSPS 低雜訊 ADC）",
      "雜訊/功耗同級（噪聲本底 ≤−156dBFS/Hz、≤100mW/通道 @125MSPS）",
      "數位介面相容（序列 LVDS，lane 數可組態）",
      "電源軌相容（AVDD/IOVDD 1.8V）",
      "溫度範圍涵蓋（−55°C~105°C）",
      "Enhanced Product 等級相容（如需同等級認證）"
    ],
    "dropIn": []
  },
  {
    "part": "MSPM0C1105-Q1",
    "mfr": "Texas Instruments",
    "category": "mcu",
    "subcategory": "車規 Arm Cortex-M0+ 混合訊號 MCU（32KB flash／8KB RAM）",
    "package": "48-VQFN (RGZ)",
    "whatIs": "車規混合訊號 MCU：Arm 32-bit Cortex-M0+ 核心（含記憶體保護單元，最高 32MHz），AEC-Q100 Grade 1（−40°C~125°C），最高 64KB flash＋8KB SRAM，內建 12-bit 1.6Msps ADC（最多 27 個外部通道）、含 8-bit 參考 DAC 的比較器（COMP）、整合溫度感測器；封裝選項含 48-pin LQFP (PT)／VQFN (RGZ)、32-pin VQFN (RHB)、28-pin VSSOP (DGS28)、24-pin VQFN (RGE)、20-pin WQFN (RUK)／VSSOP (DGS20)。MSPM0C1105-Q1＝32KB flash／8KB RAM；同系列 MSPM0C1106-Q1＝64KB flash／8KB RAM。",
    "func": "低功耗模式：RUN 91µA/MHz（CoreMark）、STANDBY 2µA（SRAM 與暫存器全保留）、SHUTDOWN 68nA（支援 I/O 喚醒）；數位周邊：3 通道 DMA 控制器、7 通道事件矩陣（event fabric）、5 顆計時器最多支援 18 路 PWM 輸出且皆可於 STANDBY 模式下運作（1 顆 16-bit 進階計時器含 deadband，計時器頻率最高 64MHz；1 顆 16-bit 通用計時器含 4 組 capture/compare；3 顆 16-bit 通用計時器各含 2 組 capture/compare）、視窗看門狗（WWDT）、獨立看門狗（IWDT）、含鬧鈴與行事曆模式的 RTC、BEEPER（可產生 1/2/4/8kHz 方波驅動外部蜂鳴器）；通訊介面：3 組 UART（其中 1 組支援 LIN、IrDA、DALI、smart card、Manchester）、2 組 I2C（支援 SMBus/PMBus 與 STOP 模式喚醒，最高支援 FM+ 1Mbps）、1 組 SPI（最高支援 16Mbps）；時脈系統：內建 32MHz 振盪器 SYSOSC（精度 −2.1%~1.6%）、內建 32kHz 振盪器 LFOSC（精度 ±3%）、外部 4MHz~32MHz 石英振盪器 HFXT、外部 32kHz 石英振盪器 LFXT、外部低頻/高頻數位時脈輸入、數位時脈輸出；資料完整性：CRC-16 循環冗餘檢查；I/O：最多 45 個 GPIO，其中 2 個為 5V 耐受開汲極 IO；開發支援：2-pin 序列線除錯（SWD）。",
    "usedIn": "車用車身電子與照明、車用閘道器（Gateway）、方向盤系統、車用馬達控制、DC-AC 逆變器、車用室內照明、車門把手模組、Kick-to-open 模組、車輛乘客偵測、座椅舒適模組等車用場合。",
    "desc": "車規 Arm Cortex-M0+ MCU，最高 32MHz／32KB flash／8KB SRAM，12-bit 1.6Msps ADC（最多 27 通道），AEC-Q100 Grade 1，48-VQFN (RGZ) 等多種封裝可選。",
    "datasheet": "TI SLASFJ7A",
    "pins": [
      {
        "num": "1",
        "name": "PA0",
        "side": "L",
        "type": "I/O",
        "desc": "GPIO PA0（緩衝類型：ODIO 5V耐受開汲極，支援喚醒）；IOMUX 多工：PA0, UART0_TX, I2C0_SDA, TIMA0_C0, TIMA_FAL1, FCC_IN, TIMG8_C1, BEEP, TIMG14_C0, SPI0_CS1_MISO1, RTC_OUT"
      },
      {
        "num": "2",
        "name": "PA1",
        "side": "L",
        "type": "I/O",
        "desc": "GPIO PA1（緩衝類型：ODIO 5V耐受開汲極，支援喚醒）；IOMUX 多工：PA1, UART0_RX, I2C0_SCL, TIMA0_C1, TIMA_FAL2, TIMG8_IDX, TIMG8_C0, TIMG14_C1, SPI0_CS3_CD_MISO3, HFCLKIN, UART0_TX, UART1_RTS, I2C0_SDA"
      },
      {
        "num": "3",
        "name": "PA28",
        "side": "L",
        "type": "I/O",
        "desc": "GPIO PA28（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA28, UART0_TX, I2C0_SDA, TIMA0_C3, TIMA_FAL0, TIMG2_C0, TIMA0_C1"
      },
      {
        "num": "4",
        "name": "{NRST}",
        "side": "L",
        "type": "Input",
        "desc": "外部硬體重置輸入；依腳名 N 前綴慣例判定為 active-low（本摘錄頁未附明文敘述，如需精確確認見 datasheet §6.3）；Non-IOMUX 專用腳，無 GPIO 替代功能"
      },
      {
        "num": "5",
        "name": "PA31",
        "side": "L",
        "type": "I/O",
        "desc": "GPIO PA31（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA31, UART0_RX, I2C0_SCL, TIMA0_C3N, CLK_OUT"
      },
      {
        "num": "6",
        "name": "VDD",
        "side": "L",
        "type": "Power",
        "desc": "電源腳（表列 SIGNAL TYPE：PWR；供電範圍 1.62V~3.6V 見頁 1）"
      },
      {
        "num": "7",
        "name": "VSS",
        "side": "L",
        "type": "Ground",
        "desc": "接地腳（表列 SIGNAL TYPE：PWR，為元件接地）"
      },
      {
        "num": "8",
        "name": "PA2",
        "side": "L",
        "type": "I/O",
        "desc": "GPIO PA2（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA2, TIMG8_C1, SPI0_CS0, TIMG2_C1, TIMG8_IDX, TIMA0_C3N, TIMA0_C2N, TIMA_FAL0, TIMA_FAL1, TIMA0_C0, I2C0_SCL"
      },
      {
        "num": "9",
        "name": "PA3",
        "side": "L",
        "type": "I/O",
        "desc": "GPIO PA3（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA3, TIMG8_C0, SPI0_CS1_MISO1, I2C1_SDA, TIMA0_C1, TIMG2_C0, TIMA0_C2, UART2_CTS, UART1_TX, SPI0_CS3_CD_MISO3, I2C0_SDA, COMP0_OUT；另有非 IOMUX 類比功能 LFXIN（32kHz 石英振盪器輸入）"
      },
      {
        "num": "10",
        "name": "PA4",
        "side": "L",
        "type": "I/O",
        "desc": "GPIO PA4（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA4, TIMG8_C1, SPI0_POCI, I2C1_SCL, TIMA0_C1N, LFCLKIN, TIMG2_C1, TIMA0_C3, UART2_RTS, UART1_RX, SPI0_CS0, TIMA0_C0N, HFCLKIN；另有非 IOMUX 類比功能 LFXOUT（32kHz 石英振盪器輸出）"
      },
      {
        "num": "11",
        "name": "PA5",
        "side": "L",
        "type": "I/O",
        "desc": "GPIO PA5（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA5, TIMG8_C0, SPI0_PICO, I2C1_SDA, TIMG14_C0, FCC_IN, TIMG1_C0, TIMA_FAL1, UART0_CTS, UART1_TX, TIMA0_C1；另有非 IOMUX 類比功能 HFXIN（4~32MHz 石英振盪器輸入）"
      },
      {
        "num": "12",
        "name": "PA6",
        "side": "L",
        "type": "I/O",
        "desc": "GPIO PA6（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA6, TIMG8_C1, SPI0_SCLK, I2C1_SCL, TIMG14_C1, HFCLKIN, TIMG1_C1, TIMA_FAL0, UART0_RTS, TIMA0_C2N, UART1_RX, TIMA0_C2, I2C0_SDA, BEEP；另有非 IOMUX 類比功能 HFXOUT（4~32MHz 石英振盪器輸出）"
      },
      {
        "num": "13",
        "name": "PA7",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PA7（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA7, CLK_OUT, TIMG8_C0, TIMA0_C2, TIMG8_IDX, TIMG2_C1, TIMA0_C1, SPI0_CS2_MISO2, FCC_IN, SPI0_POCI, SPI0_PICO, UART1_TX, TIMG1_C0, COMP0_OUT"
      },
      {
        "num": "14",
        "name": "PB2",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PB2（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PB2, UART2_CTS, I2C1_SCL, TIMA0_C3, UART1_CTS, TIMG1_C0, UART2_TX, HFCLKIN, SPI0_PICO, UART1_RX, TIMA0_C1N"
      },
      {
        "num": "15",
        "name": "PB3",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PB3（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PB3, TIMA_FAL0, UART2_RTS, I2C1_SDA, TIMA0_C3N, UART1_RTS, TIMG1_C1, UART2_RX, TIMG2_C1, TIMA0_C0, SPI0_SCLK, SPI0_CS0, UART1_TX, RTC_OUT"
      },
      {
        "num": "16",
        "name": "PA8",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PA8（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA8, UART1_TX, SPI0_CS0, I2C0_SDA, TIMA0_C0, TIMA_FAL2, TIMA_FAL0, SPI0_CS3_CD_MISO3, TIMG2_C1, HFCLKIN, UART0_RTS, SPI0_SCLK, UART1_RX, TIMA0_C3N"
      },
      {
        "num": "17",
        "name": "PA9",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PA9（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA9, UART1_RX, SPI0_PICO, I2C0_SCL, TIMA0_C0N, CLK_OUT, TIMA0_C1, RTC_OUT, TIMG2_C0, SPI0_POCI, UART0_CTS, TIMA_FAL1, TIMG1_C1"
      },
      {
        "num": "18",
        "name": "PA10",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PA10（緩衝類型：SDIO 標準驅動，支援喚醒）；IOMUX 多工：PA10, UART0_TX, SPI0_POCI, I2C0_SDA, TIMA0_C2, CLK_OUT, TIMG14_C0, I2C1_SDA, TIMA_FAL1, TIMG2_C1, TIMA0_C1N, TIMG8_C1, SPI0_PICO"
      },
      {
        "num": "19",
        "name": "PA11",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PA11（緩衝類型：SDIO 標準驅動，支援喚醒）；IOMUX 多工：PA11, UART0_RX, SPI0_SCLK, I2C0_SCL, TIMA0_C2N, UART1_RX, TIMG14_C1, I2C1_SCL, TIMA_FAL0, SPI0_CS0, COMP0_OUT；另有非 IOMUX 類比功能 ADC0_25（ADC 通道）、COMP0_DAC_OUT（比較器內建 DAC 輸出）"
      },
      {
        "num": "20",
        "name": "PB6",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PB6（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PB6, UART1_TX, TIMG8_C0, UART2_CTS, TIMG1_C0, TIMA_FAL2, SPI0_CS1_MISO1, TIMA0_C3N, TIMG8_C1, TIMA0_C2N, UART0_TX；另有非 IOMUX 類比功能 ADC0_24（ADC 通道）"
      },
      {
        "num": "21",
        "name": "PB7",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PB7（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PB7, UART1_RX, TIMG8_C1, UART2_RTS, TIMG1_C1, SPI0_CS2_MISO2, BEEP, SPI0_SCLK, UART0_RX；另有非 IOMUX 類比功能 ADC0_23（ADC 通道）"
      },
      {
        "num": "22",
        "name": "PB8",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PB8（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PB8, UART1_CTS, TIMA0_C0, TIMG1_C0, SPI0_SCLK, BEEP, TIMG8_C0, UART0_RX, SPI0_POCI, I2C0_SCL, COMP0_OUT"
      },
      {
        "num": "23",
        "name": "PB9",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PB9（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PB9, UART1_RTS, TIMA0_C0N, TIMA0_C1, TIMG1_C1, TIMG2_C0, SPI0_POCI, UART0_RX, I2C0_SCL, UART0_TX, I2C0_SDA"
      },
      {
        "num": "24",
        "name": "PB14",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PB14（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PB14, TIMA0_C0, TIMG8_IDX, SPI0_CS3_CD_MISO3, TIMG2_C1, I2C0_SDA, SPI0_PICO, UART0_TX, TIMA_FAL2, TIMA_FAL0, TIMG14_C2；另有非 IOMUX 類比功能 ADC0_21（ADC 通道）"
      },
      {
        "num": "25",
        "name": "PB15",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PB15（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PB15, UART2_TX, TIMG8_C0, TIMG2_C0, TIMA0_C1N, UART1_TX, TIMG2_C1；另有非 IOMUX 類比功能 ADC0_20（ADC 通道）"
      },
      {
        "num": "26",
        "name": "PB16",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PB16（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PB16, UART2_RX, TIMG8_C1, TIMG2_C1, TIMA0_C2N, UART1_RX, I2C1_SDA；另有非 IOMUX 類比功能 ADC0_19（ADC 通道）"
      },
      {
        "num": "27",
        "name": "PA12",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PA12（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA12, SPI0_SCLK, TIMA0_C3, FCC_IN, TIMG14_C0, SPI0_CS1_MISO1, UART2_CTS, UART1_CTS, TIMA0_C3N, I2C1_SCL, TIMG2_C1, COMP0_OUT；另有非 IOMUX 類比功能 ADC0_18（ADC 通道）"
      },
      {
        "num": "28",
        "name": "PA13",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PA13（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA13, UART0_RX, SPI0_POCI, TIMA0_C2N, TIMA0_C3N, RTC_OUT, TIMG14_C1, TIMG14_C3, SPI0_CS3_CD_MISO3, UART2_TX, UART1_RTS, SPI0_CS0, TIMG8_C1, TIMA0_C1；另有非 IOMUX 類比功能 ADC0_17（ADC 通道）、COMP0_IN2-（比較器負輸入2）"
      },
      {
        "num": "29",
        "name": "PA14",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PA14（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA14, UART0_CTS, SPI0_PICO, TIMG1_C0, CLK_OUT, SPI0_CS2_MISO2, UART2_RX, I2C0_SCL, UART0_TX, TIMA0_C2；另有非 IOMUX 類比功能 ADC0_16（ADC 通道）、COMP0_IN2+（比較器正輸入2）"
      },
      {
        "num": "30",
        "name": "PA15",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PA15（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA15, UART0_RTS, SPI0_CS2_MISO2, I2C1_SCL, TIMA0_C2, TIMG8_IDX, UART2_RTS, TIMG14_C1；另有非 IOMUX 類比功能 ADC0_15（ADC 通道）、COMP0_IN3+（比較器正輸入3）"
      },
      {
        "num": "31",
        "name": "PA16",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PA16（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA16, SPI0_POCI, I2C1_SDA, TIMA0_C2N, FCC_IN, UART2_CTS, TIMG14_C2, COMP0_OUT；另有非 IOMUX 類比功能 ADC0_14（ADC 通道）"
      },
      {
        "num": "32",
        "name": "PA17",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PA17（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA17, UART1_TX, TIMA0_C2, I2C1_SCL, TIMA0_C3, TIMG2_C0, TIMG8_C0, TIMA0_C0N, SPI0_CS1_MISO1, SPI0_SCLK, I2C0_SDA, UART0_RX；另有非 IOMUX 類比功能 ADC0_13（ADC 通道）、COMP0_IN1-（比較器負輸入1）"
      },
      {
        "num": "33",
        "name": "PA18",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PA18（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA18, UART1_RX, UART1_RTS, I2C1_SDA, TIMA0_C3N, TIMG2_C1, TIMG8_C1, SPI0_PICO, SPI0_CS0, TIMA0_C1N, TIMA0_C0, SPI0_POCI, TIMA_FAL2, CLK_OUT；另有非 IOMUX 功能 ADC0_12（ADC 通道）、COMP0_IN1+（比較器正輸入1）、BSL_invoke (Flash)（開機載入程式喚起）"
      },
      {
        "num": "34",
        "name": "PA19",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PA19（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA19, SWDIO, SPI0_SCLK, I2C1_SDA, TIMA0_C2, TIMG14_C0, SPI0_POCI, UART0_CTS, UART1_RX, SPI0_PICO；另有非 IOMUX 類比功能 ADC0_22（ADC 通道）；SWDIO 為 SWD 除錯資料腳"
      },
      {
        "num": "35",
        "name": "PA20",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PA20（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA20, SWCLK, TIMA_FAL1, I2C1_SCL, TIMA0_C2N, TIMG14_C1, SPI0_PICO, TIMA0_C0, UART0_RTS, UART1_TX, SPI0_CS0, UART1_RX；另有非 IOMUX 類比功能 ADC0_4（ADC 通道）；SWCLK 為 SWD 除錯時脈腳"
      },
      {
        "num": "36",
        "name": "PB17",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PB17（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PB17, UART2_TX, SPI0_PICO, I2C0_SCL, TIMA0_C2, TIMG14_C0, TIMG1_C0, SPI0_CS0；另有非 IOMUX 類比功能 ADC0_11（ADC 通道）"
      },
      {
        "num": "37",
        "name": "PB18",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PB18（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PB18, UART2_RX, SPI0_SCLK, I2C0_SDA, TIMA0_C2N, TIMG14_C1, SPI0_CS0, TIMG1_C1, TIMA0_C1, UART0_RTS；另有非 IOMUX 類比功能 ADC0_10（ADC 通道）"
      },
      {
        "num": "38",
        "name": "PB19",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PB19（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PB19, SPI0_POCI, TIMG8_C1, UART0_CTS, TIMG2_C1, TIMG8_IDX, UART2_CTS, TIMA0_C1N, UART2_RX, COMP0_OUT；另有非 IOMUX 類比功能 ADC0_9（ADC 通道）"
      },
      {
        "num": "39",
        "name": "PA21",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PA21（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA21, UART2_TX, SPI0_CS3_CD_MISO3, UART1_CTS, TIMA0_C0, TIMG1_C0, UART2_CTS, TIMG8_C0, TIMA0_C0N, UART2_RX；另有非 IOMUX 類比功能 ADC0_8（ADC 通道）、ADC0_VREF-（ADC 參考電壓負端）"
      },
      {
        "num": "40",
        "name": "PA22",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PA22（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA22, UART2_RX, SPI0_CS2_MISO2, UART1_RTS, TIMA0_C0N, TIMG1_C1, TIMA0_C1, CLK_OUT, I2C0_SCL, TIMG8_C1, UART1_RX, SPI0_POCI, UART2_TX；另有非 IOMUX 類比功能 ADC0_7（ADC 通道）"
      },
      {
        "num": "41",
        "name": "PB20",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PB20（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PB20, SPI0_CS2_MISO2, TIMA0_C2, TIMA_FAL1, TIMA0_C1, UART2_RTS, I2C0_SDA, UART1_CTS, TIMA0_C2N, TIMG8_C1；另有非 IOMUX 類比功能 ADC0_6（ADC 通道）"
      },
      {
        "num": "42",
        "name": "PB24",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PB24（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PB24, SPI0_CS3_CD_MISO3, SPI0_CS1_MISO1, TIMA0_C3, TIMA0_C1N, UART2_RTS, SPI0_SCLK, TIMG14_C2, UART0_RTS；另有非 IOMUX 類比功能 ADC0_5（ADC 通道）"
      },
      {
        "num": "43",
        "name": "PA23",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PA23（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA23, UART2_TX, SPI0_CS3_CD_MISO3, TIMA0_C3, TIMG8_C0, TIMG2_C0, UART0_TX, TIMG14_C0, SPI0_POCI, UART0_CTS；另有非 IOMUX 類比功能 ADC0_26（ADC 通道）、ADC0_VREF+（ADC 參考電壓正端）"
      },
      {
        "num": "44",
        "name": "PA24",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PA24（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA24, UART2_RX, SPI0_CS2_MISO2, UART0_RTS, TIMA0_C3N, TIMG8_C1, TIMG2_C1, UART1_RX, TIMG14_C1, SPI0_PICO, I2C0_SDA；另有非 IOMUX 類比功能 ADC0_3（ADC 通道）"
      },
      {
        "num": "45",
        "name": "PA25",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PA25（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA25, SPI0_PICO, SPI0_POCI, SPI0_SCLK, TIMA0_C3, TIMA0_C1N, TIMA0_C2, UART2_CTS, TIMG14_C0, TIMG1_C0, I2C0_SDA, UART0_TX, TIMA_FAL2, I2C0_SCL；另有非 IOMUX 類比功能 ADC0_2（ADC 通道）"
      },
      {
        "num": "46",
        "name": "PA26",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PA26（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA26, BEEP, SPI0_POCI, TIMG8_C0, TIMA_FAL0, TIMA0_C3N, TIMG2_C0, UART2_RTS, I2C0_SCL, TIMG1_C1, UART0_RX, TIMA0_C0, I2C0_SDA, UART1_CTS；另有非 IOMUX 類比功能 ADC0_1（ADC 通道）、COMP0_IN0+（比較器正輸入0）"
      },
      {
        "num": "47",
        "name": "PA27",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PA27（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA27, SPI0_CS3_CD_MISO3, TIMA0_C0N, TIMG8_C1, TIMA_FAL2, CLK_OUT, TIMG2_C1, RTC_OUT, UART1_CTS, I2C0_SCL, UART0_TX, SPI0_POCI, COMP0_OUT；另有非 IOMUX 類比功能 ADC0_0（ADC 通道）、COMP0_IN0-（比較器負輸入0）"
      },
      {
        "num": "48",
        "name": "PA30",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PA30（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA30, UART0_RX, TIMG8_IDX, TIMA0_C0, UART1_RTS, TIMG2_C1, TIMG14_C2, I2C0_SDA"
      },
      {
        "num": "49",
        "name": "VSS (EP)",
        "side": "B",
        "type": "Ground",
        "desc": "外露散熱焊盤（圖 6-1 中央 Thermal Pad）；接 VSS/接地平面",
        "ep": true
      }
    ],
    "specs": [
      {
        "k": "核心",
        "v": "Arm 32-bit Cortex-M0+，含記憶體保護單元，最高 32MHz"
      },
      {
        "k": "車規",
        "v": "AEC-Q100 Grade 1（−40°C ~ 125°C）"
      },
      {
        "k": "供電範圍",
        "v": "1.62V ~ 3.6V"
      },
      {
        "k": "記憶體",
        "v": "MSPM0C1105-Q1：32KB flash／8KB SRAM（同系列 MSPM0C1106-Q1：64KB flash／8KB SRAM）"
      },
      {
        "k": "ADC",
        "v": "12-bit、1.6Msps，最多 27 個外部通道"
      },
      {
        "k": "參考電壓",
        "v": "可組態 1.4V 或 2.5V 內部共用 VREF"
      },
      {
        "k": "比較器",
        "v": "COMP，含 8-bit 參考 DAC；整合溫度感測器"
      },
      {
        "k": "低功耗",
        "v": "RUN 91µA/MHz（CoreMark）；STANDBY 2µA；SHUTDOWN 68nA（支援 I/O 喚醒）"
      },
      {
        "k": "通訊介面",
        "v": "3×UART（1 組支援 LIN/IrDA/DALI/smart card/Manchester）；2×I2C（SMBus/PMBus，最高 FM+ 1Mbps）；1×SPI（最高 16Mbps）"
      },
      {
        "k": "時脈",
        "v": "內建 32MHz SYSOSC（−2.1%~1.6%）；內建 32kHz LFOSC（±3%）；外部 4~32MHz HFXT；外部 32kHz LFXT"
      },
      {
        "k": "I/O",
        "v": "最多 45 個 GPIO，其中 2 個 5V 耐受開汲極"
      },
      {
        "k": "封裝選項",
        "v": "48-pin LQFP (PT)／VQFN (RGZ)；32-pin VQFN (RHB)；28-pin VSSOP (DGS28)；24-pin VQFN (RGE)；20-pin WQFN (RUK)／VSSOP (DGS20)"
      },
      {
        "k": "除錯",
        "v": "2-pin SWD"
      }
    ],
    "secondSource": [
      "封裝＋pinout 相容（48-VQFN (RGZ) 或 48-LQFP (PT)，二者 pin 編號相容）",
      "功能相同（Arm Cortex-M0+ 車規混合訊號 MCU）",
      "ADC/比較器規格相容（12-bit 1.6Msps ADC、含 DAC 比較器）",
      "通訊介面相容（UART/I2C/SPI 數量與速率）",
      "電源範圍涵蓋（1.62V~3.6V）",
      "車規等級相容（AEC-Q100 Grade 1，−40°C~125°C）"
    ],
    "dropIn": [],
    "thermalPad": "外露焊盤=VSS（datasheet 圖 6-1 48-pin RGZ 中央標示 Thermal Pad），須接板上接地平面"
  },
  {
    "part": "MSPM0C1106-Q1",
    "mfr": "Texas Instruments",
    "category": "mcu",
    "subcategory": "車規 Arm Cortex-M0+ 混合訊號 MCU（64KB flash／8KB RAM）",
    "package": "48-VQFN (RGZ)",
    "whatIs": "車規混合訊號 MCU：Arm 32-bit Cortex-M0+ 核心（含記憶體保護單元，最高 32MHz），AEC-Q100 Grade 1（−40°C~125°C），最高 64KB flash＋8KB SRAM，內建 12-bit 1.6Msps ADC（最多 27 個外部通道）、含 8-bit 參考 DAC 的比較器（COMP）、整合溫度感測器；封裝選項含 48-pin LQFP (PT)／VQFN (RGZ)、32-pin VQFN (RHB)、28-pin VSSOP (DGS28)、24-pin VQFN (RGE)、20-pin WQFN (RUK)／VSSOP (DGS20)。MSPM0C1106-Q1＝64KB flash／8KB RAM；同系列 MSPM0C1105-Q1＝32KB flash／8KB RAM。",
    "func": "低功耗模式：RUN 91µA/MHz（CoreMark）、STANDBY 2µA（SRAM 與暫存器全保留）、SHUTDOWN 68nA（支援 I/O 喚醒）；數位周邊：3 通道 DMA 控制器、7 通道事件矩陣（event fabric）、5 顆計時器最多支援 18 路 PWM 輸出且皆可於 STANDBY 模式下運作（1 顆 16-bit 進階計時器含 deadband，計時器頻率最高 64MHz；1 顆 16-bit 通用計時器含 4 組 capture/compare；3 顆 16-bit 通用計時器各含 2 組 capture/compare）、視窗看門狗（WWDT）、獨立看門狗（IWDT）、含鬧鈴與行事曆模式的 RTC、BEEPER（可產生 1/2/4/8kHz 方波驅動外部蜂鳴器）；通訊介面：3 組 UART（其中 1 組支援 LIN、IrDA、DALI、smart card、Manchester）、2 組 I2C（支援 SMBus/PMBus 與 STOP 模式喚醒，最高支援 FM+ 1Mbps）、1 組 SPI（最高支援 16Mbps）；時脈系統：內建 32MHz 振盪器 SYSOSC（精度 −2.1%~1.6%）、內建 32kHz 振盪器 LFOSC（精度 ±3%）、外部 4MHz~32MHz 石英振盪器 HFXT、外部 32kHz 石英振盪器 LFXT、外部低頻/高頻數位時脈輸入、數位時脈輸出；資料完整性：CRC-16 循環冗餘檢查；I/O：最多 45 個 GPIO，其中 2 個為 5V 耐受開汲極 IO；開發支援：2-pin 序列線除錯（SWD）。",
    "usedIn": "車用車身電子與照明、車用閘道器（Gateway）、方向盤系統、車用馬達控制、DC-AC 逆變器、車用室內照明、車門把手模組、Kick-to-open 模組、車輛乘客偵測、座椅舒適模組等車用場合。",
    "desc": "車規 Arm Cortex-M0+ MCU，最高 32MHz／64KB flash／8KB SRAM，12-bit 1.6Msps ADC（最多 27 通道），AEC-Q100 Grade 1，48-VQFN (RGZ) 等多種封裝可選。",
    "datasheet": "TI SLASFJ7A",
    "pins": [
      {
        "num": "1",
        "name": "PA0",
        "side": "L",
        "type": "I/O",
        "desc": "GPIO PA0（緩衝類型：ODIO 5V耐受開汲極，支援喚醒）；IOMUX 多工：PA0, UART0_TX, I2C0_SDA, TIMA0_C0, TIMA_FAL1, FCC_IN, TIMG8_C1, BEEP, TIMG14_C0, SPI0_CS1_MISO1, RTC_OUT"
      },
      {
        "num": "2",
        "name": "PA1",
        "side": "L",
        "type": "I/O",
        "desc": "GPIO PA1（緩衝類型：ODIO 5V耐受開汲極，支援喚醒）；IOMUX 多工：PA1, UART0_RX, I2C0_SCL, TIMA0_C1, TIMA_FAL2, TIMG8_IDX, TIMG8_C0, TIMG14_C1, SPI0_CS3_CD_MISO3, HFCLKIN, UART0_TX, UART1_RTS, I2C0_SDA"
      },
      {
        "num": "3",
        "name": "PA28",
        "side": "L",
        "type": "I/O",
        "desc": "GPIO PA28（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA28, UART0_TX, I2C0_SDA, TIMA0_C3, TIMA_FAL0, TIMG2_C0, TIMA0_C1"
      },
      {
        "num": "4",
        "name": "{NRST}",
        "side": "L",
        "type": "Input",
        "desc": "外部硬體重置輸入；依腳名 N 前綴慣例判定為 active-low（本摘錄頁未附明文敘述，如需精確確認見 datasheet §6.3）；Non-IOMUX 專用腳，無 GPIO 替代功能"
      },
      {
        "num": "5",
        "name": "PA31",
        "side": "L",
        "type": "I/O",
        "desc": "GPIO PA31（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA31, UART0_RX, I2C0_SCL, TIMA0_C3N, CLK_OUT"
      },
      {
        "num": "6",
        "name": "VDD",
        "side": "L",
        "type": "Power",
        "desc": "電源腳（表列 SIGNAL TYPE：PWR；供電範圍 1.62V~3.6V 見頁 1）"
      },
      {
        "num": "7",
        "name": "VSS",
        "side": "L",
        "type": "Ground",
        "desc": "接地腳（表列 SIGNAL TYPE：PWR，為元件接地）"
      },
      {
        "num": "8",
        "name": "PA2",
        "side": "L",
        "type": "I/O",
        "desc": "GPIO PA2（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA2, TIMG8_C1, SPI0_CS0, TIMG2_C1, TIMG8_IDX, TIMA0_C3N, TIMA0_C2N, TIMA_FAL0, TIMA_FAL1, TIMA0_C0, I2C0_SCL"
      },
      {
        "num": "9",
        "name": "PA3",
        "side": "L",
        "type": "I/O",
        "desc": "GPIO PA3（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA3, TIMG8_C0, SPI0_CS1_MISO1, I2C1_SDA, TIMA0_C1, TIMG2_C0, TIMA0_C2, UART2_CTS, UART1_TX, SPI0_CS3_CD_MISO3, I2C0_SDA, COMP0_OUT；另有非 IOMUX 類比功能 LFXIN（32kHz 石英振盪器輸入）"
      },
      {
        "num": "10",
        "name": "PA4",
        "side": "L",
        "type": "I/O",
        "desc": "GPIO PA4（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA4, TIMG8_C1, SPI0_POCI, I2C1_SCL, TIMA0_C1N, LFCLKIN, TIMG2_C1, TIMA0_C3, UART2_RTS, UART1_RX, SPI0_CS0, TIMA0_C0N, HFCLKIN；另有非 IOMUX 類比功能 LFXOUT（32kHz 石英振盪器輸出）"
      },
      {
        "num": "11",
        "name": "PA5",
        "side": "L",
        "type": "I/O",
        "desc": "GPIO PA5（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA5, TIMG8_C0, SPI0_PICO, I2C1_SDA, TIMG14_C0, FCC_IN, TIMG1_C0, TIMA_FAL1, UART0_CTS, UART1_TX, TIMA0_C1；另有非 IOMUX 類比功能 HFXIN（4~32MHz 石英振盪器輸入）"
      },
      {
        "num": "12",
        "name": "PA6",
        "side": "L",
        "type": "I/O",
        "desc": "GPIO PA6（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA6, TIMG8_C1, SPI0_SCLK, I2C1_SCL, TIMG14_C1, HFCLKIN, TIMG1_C1, TIMA_FAL0, UART0_RTS, TIMA0_C2N, UART1_RX, TIMA0_C2, I2C0_SDA, BEEP；另有非 IOMUX 類比功能 HFXOUT（4~32MHz 石英振盪器輸出）"
      },
      {
        "num": "13",
        "name": "PA7",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PA7（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA7, CLK_OUT, TIMG8_C0, TIMA0_C2, TIMG8_IDX, TIMG2_C1, TIMA0_C1, SPI0_CS2_MISO2, FCC_IN, SPI0_POCI, SPI0_PICO, UART1_TX, TIMG1_C0, COMP0_OUT"
      },
      {
        "num": "14",
        "name": "PB2",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PB2（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PB2, UART2_CTS, I2C1_SCL, TIMA0_C3, UART1_CTS, TIMG1_C0, UART2_TX, HFCLKIN, SPI0_PICO, UART1_RX, TIMA0_C1N"
      },
      {
        "num": "15",
        "name": "PB3",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PB3（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PB3, TIMA_FAL0, UART2_RTS, I2C1_SDA, TIMA0_C3N, UART1_RTS, TIMG1_C1, UART2_RX, TIMG2_C1, TIMA0_C0, SPI0_SCLK, SPI0_CS0, UART1_TX, RTC_OUT"
      },
      {
        "num": "16",
        "name": "PA8",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PA8（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA8, UART1_TX, SPI0_CS0, I2C0_SDA, TIMA0_C0, TIMA_FAL2, TIMA_FAL0, SPI0_CS3_CD_MISO3, TIMG2_C1, HFCLKIN, UART0_RTS, SPI0_SCLK, UART1_RX, TIMA0_C3N"
      },
      {
        "num": "17",
        "name": "PA9",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PA9（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA9, UART1_RX, SPI0_PICO, I2C0_SCL, TIMA0_C0N, CLK_OUT, TIMA0_C1, RTC_OUT, TIMG2_C0, SPI0_POCI, UART0_CTS, TIMA_FAL1, TIMG1_C1"
      },
      {
        "num": "18",
        "name": "PA10",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PA10（緩衝類型：SDIO 標準驅動，支援喚醒）；IOMUX 多工：PA10, UART0_TX, SPI0_POCI, I2C0_SDA, TIMA0_C2, CLK_OUT, TIMG14_C0, I2C1_SDA, TIMA_FAL1, TIMG2_C1, TIMA0_C1N, TIMG8_C1, SPI0_PICO"
      },
      {
        "num": "19",
        "name": "PA11",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PA11（緩衝類型：SDIO 標準驅動，支援喚醒）；IOMUX 多工：PA11, UART0_RX, SPI0_SCLK, I2C0_SCL, TIMA0_C2N, UART1_RX, TIMG14_C1, I2C1_SCL, TIMA_FAL0, SPI0_CS0, COMP0_OUT；另有非 IOMUX 類比功能 ADC0_25（ADC 通道）、COMP0_DAC_OUT（比較器內建 DAC 輸出）"
      },
      {
        "num": "20",
        "name": "PB6",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PB6（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PB6, UART1_TX, TIMG8_C0, UART2_CTS, TIMG1_C0, TIMA_FAL2, SPI0_CS1_MISO1, TIMA0_C3N, TIMG8_C1, TIMA0_C2N, UART0_TX；另有非 IOMUX 類比功能 ADC0_24（ADC 通道）"
      },
      {
        "num": "21",
        "name": "PB7",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PB7（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PB7, UART1_RX, TIMG8_C1, UART2_RTS, TIMG1_C1, SPI0_CS2_MISO2, BEEP, SPI0_SCLK, UART0_RX；另有非 IOMUX 類比功能 ADC0_23（ADC 通道）"
      },
      {
        "num": "22",
        "name": "PB8",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PB8（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PB8, UART1_CTS, TIMA0_C0, TIMG1_C0, SPI0_SCLK, BEEP, TIMG8_C0, UART0_RX, SPI0_POCI, I2C0_SCL, COMP0_OUT"
      },
      {
        "num": "23",
        "name": "PB9",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PB9（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PB9, UART1_RTS, TIMA0_C0N, TIMA0_C1, TIMG1_C1, TIMG2_C0, SPI0_POCI, UART0_RX, I2C0_SCL, UART0_TX, I2C0_SDA"
      },
      {
        "num": "24",
        "name": "PB14",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PB14（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PB14, TIMA0_C0, TIMG8_IDX, SPI0_CS3_CD_MISO3, TIMG2_C1, I2C0_SDA, SPI0_PICO, UART0_TX, TIMA_FAL2, TIMA_FAL0, TIMG14_C2；另有非 IOMUX 類比功能 ADC0_21（ADC 通道）"
      },
      {
        "num": "25",
        "name": "PB15",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PB15（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PB15, UART2_TX, TIMG8_C0, TIMG2_C0, TIMA0_C1N, UART1_TX, TIMG2_C1；另有非 IOMUX 類比功能 ADC0_20（ADC 通道）"
      },
      {
        "num": "26",
        "name": "PB16",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PB16（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PB16, UART2_RX, TIMG8_C1, TIMG2_C1, TIMA0_C2N, UART1_RX, I2C1_SDA；另有非 IOMUX 類比功能 ADC0_19（ADC 通道）"
      },
      {
        "num": "27",
        "name": "PA12",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PA12（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA12, SPI0_SCLK, TIMA0_C3, FCC_IN, TIMG14_C0, SPI0_CS1_MISO1, UART2_CTS, UART1_CTS, TIMA0_C3N, I2C1_SCL, TIMG2_C1, COMP0_OUT；另有非 IOMUX 類比功能 ADC0_18（ADC 通道）"
      },
      {
        "num": "28",
        "name": "PA13",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PA13（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA13, UART0_RX, SPI0_POCI, TIMA0_C2N, TIMA0_C3N, RTC_OUT, TIMG14_C1, TIMG14_C3, SPI0_CS3_CD_MISO3, UART2_TX, UART1_RTS, SPI0_CS0, TIMG8_C1, TIMA0_C1；另有非 IOMUX 類比功能 ADC0_17（ADC 通道）、COMP0_IN2-（比較器負輸入2）"
      },
      {
        "num": "29",
        "name": "PA14",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PA14（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA14, UART0_CTS, SPI0_PICO, TIMG1_C0, CLK_OUT, SPI0_CS2_MISO2, UART2_RX, I2C0_SCL, UART0_TX, TIMA0_C2；另有非 IOMUX 類比功能 ADC0_16（ADC 通道）、COMP0_IN2+（比較器正輸入2）"
      },
      {
        "num": "30",
        "name": "PA15",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PA15（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA15, UART0_RTS, SPI0_CS2_MISO2, I2C1_SCL, TIMA0_C2, TIMG8_IDX, UART2_RTS, TIMG14_C1；另有非 IOMUX 類比功能 ADC0_15（ADC 通道）、COMP0_IN3+（比較器正輸入3）"
      },
      {
        "num": "31",
        "name": "PA16",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PA16（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA16, SPI0_POCI, I2C1_SDA, TIMA0_C2N, FCC_IN, UART2_CTS, TIMG14_C2, COMP0_OUT；另有非 IOMUX 類比功能 ADC0_14（ADC 通道）"
      },
      {
        "num": "32",
        "name": "PA17",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PA17（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA17, UART1_TX, TIMA0_C2, I2C1_SCL, TIMA0_C3, TIMG2_C0, TIMG8_C0, TIMA0_C0N, SPI0_CS1_MISO1, SPI0_SCLK, I2C0_SDA, UART0_RX；另有非 IOMUX 類比功能 ADC0_13（ADC 通道）、COMP0_IN1-（比較器負輸入1）"
      },
      {
        "num": "33",
        "name": "PA18",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PA18（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA18, UART1_RX, UART1_RTS, I2C1_SDA, TIMA0_C3N, TIMG2_C1, TIMG8_C1, SPI0_PICO, SPI0_CS0, TIMA0_C1N, TIMA0_C0, SPI0_POCI, TIMA_FAL2, CLK_OUT；另有非 IOMUX 功能 ADC0_12（ADC 通道）、COMP0_IN1+（比較器正輸入1）、BSL_invoke (Flash)（開機載入程式喚起）"
      },
      {
        "num": "34",
        "name": "PA19",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PA19（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA19, SWDIO, SPI0_SCLK, I2C1_SDA, TIMA0_C2, TIMG14_C0, SPI0_POCI, UART0_CTS, UART1_RX, SPI0_PICO；另有非 IOMUX 類比功能 ADC0_22（ADC 通道）；SWDIO 為 SWD 除錯資料腳"
      },
      {
        "num": "35",
        "name": "PA20",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PA20（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA20, SWCLK, TIMA_FAL1, I2C1_SCL, TIMA0_C2N, TIMG14_C1, SPI0_PICO, TIMA0_C0, UART0_RTS, UART1_TX, SPI0_CS0, UART1_RX；另有非 IOMUX 類比功能 ADC0_4（ADC 通道）；SWCLK 為 SWD 除錯時脈腳"
      },
      {
        "num": "36",
        "name": "PB17",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PB17（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PB17, UART2_TX, SPI0_PICO, I2C0_SCL, TIMA0_C2, TIMG14_C0, TIMG1_C0, SPI0_CS0；另有非 IOMUX 類比功能 ADC0_11（ADC 通道）"
      },
      {
        "num": "37",
        "name": "PB18",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PB18（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PB18, UART2_RX, SPI0_SCLK, I2C0_SDA, TIMA0_C2N, TIMG14_C1, SPI0_CS0, TIMG1_C1, TIMA0_C1, UART0_RTS；另有非 IOMUX 類比功能 ADC0_10（ADC 通道）"
      },
      {
        "num": "38",
        "name": "PB19",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PB19（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PB19, SPI0_POCI, TIMG8_C1, UART0_CTS, TIMG2_C1, TIMG8_IDX, UART2_CTS, TIMA0_C1N, UART2_RX, COMP0_OUT；另有非 IOMUX 類比功能 ADC0_9（ADC 通道）"
      },
      {
        "num": "39",
        "name": "PA21",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PA21（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA21, UART2_TX, SPI0_CS3_CD_MISO3, UART1_CTS, TIMA0_C0, TIMG1_C0, UART2_CTS, TIMG8_C0, TIMA0_C0N, UART2_RX；另有非 IOMUX 類比功能 ADC0_8（ADC 通道）、ADC0_VREF-（ADC 參考電壓負端）"
      },
      {
        "num": "40",
        "name": "PA22",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PA22（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA22, UART2_RX, SPI0_CS2_MISO2, UART1_RTS, TIMA0_C0N, TIMG1_C1, TIMA0_C1, CLK_OUT, I2C0_SCL, TIMG8_C1, UART1_RX, SPI0_POCI, UART2_TX；另有非 IOMUX 類比功能 ADC0_7（ADC 通道）"
      },
      {
        "num": "41",
        "name": "PB20",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PB20（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PB20, SPI0_CS2_MISO2, TIMA0_C2, TIMA_FAL1, TIMA0_C1, UART2_RTS, I2C0_SDA, UART1_CTS, TIMA0_C2N, TIMG8_C1；另有非 IOMUX 類比功能 ADC0_6（ADC 通道）"
      },
      {
        "num": "42",
        "name": "PB24",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PB24（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PB24, SPI0_CS3_CD_MISO3, SPI0_CS1_MISO1, TIMA0_C3, TIMA0_C1N, UART2_RTS, SPI0_SCLK, TIMG14_C2, UART0_RTS；另有非 IOMUX 類比功能 ADC0_5（ADC 通道）"
      },
      {
        "num": "43",
        "name": "PA23",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PA23（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA23, UART2_TX, SPI0_CS3_CD_MISO3, TIMA0_C3, TIMG8_C0, TIMG2_C0, UART0_TX, TIMG14_C0, SPI0_POCI, UART0_CTS；另有非 IOMUX 類比功能 ADC0_26（ADC 通道）、ADC0_VREF+（ADC 參考電壓正端）"
      },
      {
        "num": "44",
        "name": "PA24",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PA24（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA24, UART2_RX, SPI0_CS2_MISO2, UART0_RTS, TIMA0_C3N, TIMG8_C1, TIMG2_C1, UART1_RX, TIMG14_C1, SPI0_PICO, I2C0_SDA；另有非 IOMUX 類比功能 ADC0_3（ADC 通道）"
      },
      {
        "num": "45",
        "name": "PA25",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PA25（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA25, SPI0_PICO, SPI0_POCI, SPI0_SCLK, TIMA0_C3, TIMA0_C1N, TIMA0_C2, UART2_CTS, TIMG14_C0, TIMG1_C0, I2C0_SDA, UART0_TX, TIMA_FAL2, I2C0_SCL；另有非 IOMUX 類比功能 ADC0_2（ADC 通道）"
      },
      {
        "num": "46",
        "name": "PA26",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PA26（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA26, BEEP, SPI0_POCI, TIMG8_C0, TIMA_FAL0, TIMA0_C3N, TIMG2_C0, UART2_RTS, I2C0_SCL, TIMG1_C1, UART0_RX, TIMA0_C0, I2C0_SDA, UART1_CTS；另有非 IOMUX 類比功能 ADC0_1（ADC 通道）、COMP0_IN0+（比較器正輸入0）"
      },
      {
        "num": "47",
        "name": "PA27",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PA27（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA27, SPI0_CS3_CD_MISO3, TIMA0_C0N, TIMG8_C1, TIMA_FAL2, CLK_OUT, TIMG2_C1, RTC_OUT, UART1_CTS, I2C0_SCL, UART0_TX, SPI0_POCI, COMP0_OUT；另有非 IOMUX 類比功能 ADC0_0（ADC 通道）、COMP0_IN0-（比較器負輸入0）"
      },
      {
        "num": "48",
        "name": "PA30",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PA30（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA30, UART0_RX, TIMG8_IDX, TIMA0_C0, UART1_RTS, TIMG2_C1, TIMG14_C2, I2C0_SDA"
      },
      {
        "num": "49",
        "name": "VSS (EP)",
        "side": "B",
        "type": "Ground",
        "desc": "外露散熱焊盤（圖 6-1 中央 Thermal Pad）；接 VSS/接地平面",
        "ep": true
      }
    ],
    "specs": [
      {
        "k": "核心",
        "v": "Arm 32-bit Cortex-M0+，含記憶體保護單元，最高 32MHz"
      },
      {
        "k": "車規",
        "v": "AEC-Q100 Grade 1（−40°C ~ 125°C）"
      },
      {
        "k": "供電範圍",
        "v": "1.62V ~ 3.6V"
      },
      {
        "k": "記憶體",
        "v": "MSPM0C1106-Q1：64KB flash／8KB SRAM（同系列 MSPM0C1105-Q1：32KB flash／8KB SRAM）"
      },
      {
        "k": "ADC",
        "v": "12-bit、1.6Msps，最多 27 個外部通道"
      },
      {
        "k": "參考電壓",
        "v": "可組態 1.4V 或 2.5V 內部共用 VREF"
      },
      {
        "k": "比較器",
        "v": "COMP，含 8-bit 參考 DAC；整合溫度感測器"
      },
      {
        "k": "低功耗",
        "v": "RUN 91µA/MHz（CoreMark）；STANDBY 2µA；SHUTDOWN 68nA（支援 I/O 喚醒）"
      },
      {
        "k": "通訊介面",
        "v": "3×UART（1 組支援 LIN/IrDA/DALI/smart card/Manchester）；2×I2C（SMBus/PMBus，最高 FM+ 1Mbps）；1×SPI（最高 16Mbps）"
      },
      {
        "k": "時脈",
        "v": "內建 32MHz SYSOSC（−2.1%~1.6%）；內建 32kHz LFOSC（±3%）；外部 4~32MHz HFXT；外部 32kHz LFXT"
      },
      {
        "k": "I/O",
        "v": "最多 45 個 GPIO，其中 2 個 5V 耐受開汲極"
      },
      {
        "k": "封裝選項",
        "v": "48-pin LQFP (PT)／VQFN (RGZ)；32-pin VQFN (RHB)；28-pin VSSOP (DGS28)；24-pin VQFN (RGE)；20-pin WQFN (RUK)／VSSOP (DGS20)"
      },
      {
        "k": "除錯",
        "v": "2-pin SWD"
      }
    ],
    "secondSource": [
      "封裝＋pinout 相容（48-VQFN (RGZ) 或 48-LQFP (PT)，二者 pin 編號相容）",
      "功能相同（Arm Cortex-M0+ 車規混合訊號 MCU）",
      "ADC/比較器規格相容（12-bit 1.6Msps ADC、含 DAC 比較器）",
      "通訊介面相容（UART/I2C/SPI 數量與速率）",
      "電源範圍涵蓋（1.62V~3.6V）",
      "車規等級相容（AEC-Q100 Grade 1，−40°C~125°C）"
    ],
    "dropIn": [
      {
        "part": "MSPM0C1105-Q1",
        "note": "同一份 datasheet（TI SLASFJ7A，md5 相同）、48-VQFN (RGZ) pinout 完全相同，僅記憶體不同：C1105=32KB flash／8KB RAM、C1106=64KB flash／8KB RAM"
      }
    ],
    "thermalPad": "外露焊盤=VSS（datasheet 圖 6-1 48-pin RGZ 中央標示 Thermal Pad），須接板上接地平面"
  },
  {
    "part": "MSPM0L1126",
    "mfr": "Texas Instruments",
    "category": "mcu",
    "subcategory": "Arm Cortex-M0+ 混合訊號 MCU（64KB flash／12KB RAM，無 LCD）",
    "package": "48-VQFN (RGZ)",
    "whatIs": "混合訊號 MCU：Arm 32-bit Cortex-M0+ 核心（含記憶體保護單元，最高 32MHz），操作溫度 −40°C~125°C，供電範圍 1.62V~3.6V，最高 128KB flash（含 ECC）＋12KB SRAM（含 ECC 或 parity），內建 12-bit 1.6Msps ADC（最多 26 個外部通道）、含 8-bit 參考 DAC 的比較器（COMP）、整合溫度感測器、AES 加速器（支援 GCM/GMAC、CCM/CBC-MAC、CBC、CTR）＋安全金鑰儲存；封裝選項含 64-pin LQFP (PM)、48-pin LQFP (PT)／VQFN (RGZ)、32-pin VQFN (RHB)、28-pin VSSOP (DGS28)／WQFN-28 (RUY)、24-pin VQFN (RGE)。MSPM0L1126＝64KB flash／12KB RAM；同系列 MSPM0L1127＝128KB flash／12KB RAM。（同一份 family datasheet 另涵蓋含 LCD 控制器的姊妹款 MSPM0L2116／L2117，非本條目對象，本條目 L1126/L1127 不含 LCD）",
    "func": "低功耗模式：RUN 98µA/MHz（CoreMark）、SLEEP 1.3mA@32MHz、STOP 403µA@4MHz、STANDBY 1.6µA（SRAM 與暫存器全保留）、SHUTDOWN 81nA（支援 I/O 喚醒）；數位周邊：3 通道 DMA 控制器、15 通道事件矩陣（event fabric）、最多 8 顆計時器支援最多 16 路 PWM 輸出（其中 7 顆可於 STANDBY 模式下運作）：1 顆 16-bit 進階計時器含 deadband（頻率最高 64MHz）、1 顆 16-bit 通用計時器含 4 組 capture/compare、2 顆 16-bit 通用計時器各含 2 組 capture/compare、4 顆 16-bit 基本計時器；視窗看門狗（WWDT）、獨立看門狗（IWDT）；通訊介面：最多 3 組 UART（其中 1 組支援 LIN、IrDA、DALI、smart card、Manchester）、最多 2 組 I2C（支援 SMBus/PMBus 與 STOP 模式喚醒，最高支援 FM+ 1Mbps）、最多 2 組 SPI（最高支援 16Mbps）；時脈系統：內建 32MHz 振盪器 SYSOSC（精度 −2.1%~1.6%）、內建 32kHz 振盪器 LFOSC（精度 ±3%）、外部 4MHz~32MHz 石英振盪器 HFXT、外部 32kHz 石英振盪器 LFXT、外部低頻/高頻數位時脈輸入、數位時脈輸出；資料完整性與加密：CRC-16 循環冗餘檢查、AES 加速器、安全金鑰儲存（1 組 256-bit 或 2 組 128-bit AES 金鑰）；I/O：最多 60 個 GPIO，其中 2 個為 5V 耐受開汲極 IO（48-VQFN RGZ 封裝下實際可用 44 個 GPIO＋NRST/VDD/VSS/VCORE，共 48 腳）；開發支援：2-pin 序列線除錯（SWD）。",
    "usedIn": "電池充放電管理、電源供應與功率傳輸、個人電子產品、建築安防與防火、連網周邊與印表機、電網基礎設施、智慧電表、通訊模組、醫療與健康照護等應用。",
    "desc": "Arm Cortex-M0+ MCU，最高 32MHz／64KB flash／12KB SRAM，12-bit 1.6Msps ADC（最多 26 通道），AES 加速器＋安全金鑰儲存，操作溫度 −40°C~125°C，48-VQFN (RGZ) 等多種封裝可選（無 LCD；同系列 L2116/L2117 有 LCD）。",
    "datasheet": "TI SLASFN5（MSPM0L2116/L2117/L1127/L1126 family）",
    "pins": [
      {
        "num": "1",
        "name": "PA0",
        "side": "L",
        "type": "I/O",
        "desc": "GPIO PA0（緩衝類型：ODIO 5V耐受開汲極，支援喚醒）；IOMUX 多工：PA0, UC4_PICO_TX, UC6_SDA, TIMA0_C0, TIMA_FAL1, FCC_IN, BEEP, TIMG14_C0, UC7_SDA, BSLSDA"
      },
      {
        "num": "2",
        "name": "PA1",
        "side": "L",
        "type": "I/O",
        "desc": "GPIO PA1（緩衝類型：ODIO 5V耐受開汲極，支援喚醒）；IOMUX 多工：PA1, UC4_SCLK_RX, UC6_SCL, TIMA0_C1, TIMA_FAL2, TIMG14_C3, TIMG14_C2, TIMG14_C1, UC7_SCL, BSLSCL"
      },
      {
        "num": "3",
        "name": "PA28",
        "side": "L",
        "type": "I/O",
        "desc": "GPIO PA28（緩衝類型：HDIO 高驅動，支援喚醒）；IOMUX 多工：PA28, UC4_PICO_TX, UC6_SDA, TIMA0_C3, TIMA_FAL0, TIMG2_C0, TIMA0_C1"
      },
      {
        "num": "4",
        "name": "{NRST}",
        "side": "L",
        "type": "Input",
        "desc": "外部硬體重置輸入；依腳名 N 前綴慣例判定為 active-low（本摘錄頁未附明文極性敘述，如需精確確認見 datasheet §6.3）；Non-IOMUX 專用腳，無 GPIO 替代功能"
      },
      {
        "num": "5",
        "name": "PA31",
        "side": "L",
        "type": "I/O",
        "desc": "GPIO PA31（緩衝類型：LDIO 低驅動）；IOMUX 多工：PA31, UC4_SCLK_RX, UC6_SCL, TIMA0_C3N, CLK_OUT, TIMG2_C1"
      },
      {
        "num": "6",
        "name": "VDD",
        "side": "L",
        "type": "Power",
        "desc": "電源腳（表列 SIGNAL TYPE：PWR；供電範圍 1.62V~3.6V 見頁 1）"
      },
      {
        "num": "7",
        "name": "VSS",
        "side": "L",
        "type": "Ground",
        "desc": "接地腳（表列 SIGNAL TYPE：PWR，為元件接地）"
      },
      {
        "num": "8",
        "name": "PA2",
        "side": "L",
        "type": "I/O",
        "desc": "GPIO PA2（緩衝類型：LDIO 低驅動）；IOMUX 多工：PA2, TIMG14_C3, UC4_CS0_CTS, TIMG2_C1, UC8_CS0, TIMA0_C3N, TIMA0_C2N, TIMA_FAL0, TIMA_FAL1, TIMA0_C0"
      },
      {
        "num": "9",
        "name": "PA3",
        "side": "L",
        "type": "I/O",
        "desc": "GPIO PA3（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA3, TIMG14_C2, UC7_SDA, TIMA0_C1, COMP0_OUT, TIMG2_C0, TIMA0_C2, UC8_PICO_TX, LFXIN"
      },
      {
        "num": "10",
        "name": "PA4",
        "side": "L",
        "type": "I/O",
        "desc": "GPIO PA4（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA4, TIMG14_C3, UC4_POCI_RTS, UC7_SCL, TIMA0_C1N, LFCLKIN, TIMG2_C1, TIMA0_C3, UC8_SCLK_RX, UC4_CS0_CTS, LFXOUT"
      },
      {
        "num": "11",
        "name": "PA5",
        "side": "L",
        "type": "I/O",
        "desc": "GPIO PA5（緩衝類型：LDIO 低驅動）；IOMUX 多工：PA5, TIMG14_C2, UC4_PICO_TX, UC7_SDA, TIMG14_C0, FCC_IN, TIMG1_C0, TIMA_FAL1, UC4_CS0_CTS, UC8_PICO_TX, HFXIN"
      },
      {
        "num": "12",
        "name": "PA6",
        "side": "L",
        "type": "I/O",
        "desc": "GPIO PA6（緩衝類型：LDIO 低驅動）；IOMUX 多工：PA6, TIMG14_C3, UC4_SCLK_RX, UC7_SCL, TIMG14_C1, HFCLKIN, TIMG1_C1, TIMA_FAL0, UC4_POCI_RTS, TIMA0_C2N, UC8_SCLK_RX, HFXOUT"
      },
      {
        "num": "13",
        "name": "PA7",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PA7（緩衝類型：LDIO 低驅動）；IOMUX 多工：PA7, COMP0_OUT, CLK_OUT, TIMG14_C2, TIMA0_C2, TIMG14_C3, TIMG2_C1, TIMA0_C1, FCC_IN, UC4_POCI_RTS"
      },
      {
        "num": "14",
        "name": "PB2",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PB2（緩衝類型：LDIO 低驅動）；IOMUX 多工：PB2, UC7_SCL, TIMA0_C3, TIMG1_C0, UC11_TX, HFCLKIN, UC4_PICO_TX"
      },
      {
        "num": "15",
        "name": "PB3",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PB3（緩衝類型：LDIO 低驅動）；IOMUX 多工：PB3, UC7_SDA, TIMA0_C3N, TIMG1_C1, UC11_RX, TIMA0_C0, UC4_SCLK_RX"
      },
      {
        "num": "16",
        "name": "PA8",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PA8（緩衝類型：LDIO 低驅動）；IOMUX 多工：PA8, UC8_PICO_TX, UC4_CS0_CTS, UC6_SDA, TIMA0_C0, TIMA_FAL2, TIMA_FAL0, TIMG2_C1, HFCLKIN, UC4_POCI_RTS"
      },
      {
        "num": "17",
        "name": "PA9",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PA9（緩衝類型：LDIO 低驅動）；IOMUX 多工：PA9, UC8_SCLK_RX, UC4_PICO_TX, UC6_SCL, TIMA0_C0N, CLK_OUT, TIMA0_C1, RTC_OUT, TIMG2_C0, UC4_CS0_CTS"
      },
      {
        "num": "18",
        "name": "PA10",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PA10（緩衝類型：HDIO 高驅動，支援喚醒）；IOMUX 多工：PA10, UC4_PICO_TX, UC4_POCI_RTS, UC6_SDA, TIMA0_C2, CLK_OUT, TIMG14_C0, UC7_SDA, TIMA_FAL1, BSLTX"
      },
      {
        "num": "19",
        "name": "PA11",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PA11（緩衝類型：HDIO 高驅動，支援喚醒）；IOMUX 多工：PA11, UC4_SCLK_RX, UC6_SCL, TIMA0_C2N, COMP0_OUT, TIMG14_C1, UC7_SCL, TIMA_FAL0, BSLRX, COMP0_DAC_OUT"
      },
      {
        "num": "20",
        "name": "PB6",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PB6（緩衝類型：LDIO 低驅動）；IOMUX 多工：PB6, UC8_PICO_TX, UC8_CS0, TIMG14_C2, TIMG1_C0, TIMA_FAL2"
      },
      {
        "num": "21",
        "name": "PB7",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PB7（緩衝類型：LDIO 低驅動）；IOMUX 多工：PB7, UC8_SCLK_RX, UC8_POCI, TIMG14_C3, TIMG1_C1"
      },
      {
        "num": "22",
        "name": "PB8",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PB8（緩衝類型：LDIO 低驅動）；IOMUX 多工：PB8, UC8_PICO_TX, TIMA0_C0, COMP0_OUT, TIMG1_C0"
      },
      {
        "num": "23",
        "name": "PB9",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PB9（緩衝類型：LDIO 低驅動）；IOMUX 多工：PB9, UC8_SCLK_RX, TIMA0_C0N, TIMA0_C1, TIMG1_C1"
      },
      {
        "num": "24",
        "name": "PB14",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PB14（緩衝類型：LDIO 低驅動）；IOMUX 多工：PB14, UC8_SCLK_RX, UC8_POCI, FCC_IN, TIMA0_C0, TIMG14_C2, TIMG14_C0, COMP0_OUT, ADC0_21"
      },
      {
        "num": "25",
        "name": "PB15",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PB15（緩衝類型：LDIO 低驅動）；IOMUX 多工：PB15, UC11_TX, UC8_PICO_TX, UC4_POCI_RTS, TIMG14_C2, TIMG2_C0, TIMA0_C3N, RTC_OUT, TIMG14_C1, UC8_CS0, ADC0_20"
      },
      {
        "num": "26",
        "name": "PB16",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PB16（緩衝類型：LDIO 低驅動）；IOMUX 多工：PB16, UC11_RX, UC8_SCLK_RX, UC4_CS0_CTS, TIMG14_C3, TIMG2_C1, UC4_PICO_TX, CLK_OUT, ADC0_19"
      },
      {
        "num": "27",
        "name": "PA12",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PA12（緩衝類型：LDIO 低驅動）；IOMUX 多工：PA12, UC4_POCI_RTS, UC4_SCLK_RX, COMP0_OUT, TIMA0_C3, FCC_IN, TIMG14_C0, UC7_SCL, TIMA0_C2, ADC0_18"
      },
      {
        "num": "28",
        "name": "PA13",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PA13（緩衝類型：LDIO 低驅動）；IOMUX 多工：PA13, TIMA0_C2N, UC4_POCI_RTS, UC7_SDA, TIMA0_C3N, RTC_OUT, TIMG14_C1, UC8_CS0, UC8_POCI, UC11_TX, COMP0_OUT, ADC0_17, COMP0_IN2-"
      },
      {
        "num": "29",
        "name": "PA14",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PA14（緩衝類型：LDIO 低驅動）；IOMUX 多工：PA14, UC4_CS0_CTS, UC4_PICO_TX, CLK_OUT, UC11_RX, ADC0_16, COMP0_IN2+"
      },
      {
        "num": "30",
        "name": "PA15",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PA15（緩衝類型：LDIO 低驅動）；IOMUX 多工：PA15, UC4_POCI_RTS, UC7_SCL, TIMA0_C2, TIMG14_C2, ADC0_15, COMP0_IN3+"
      },
      {
        "num": "31",
        "name": "PA16",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PA16（緩衝類型：LDIO 低驅動）；IOMUX 多工：PA16, COMP0_OUT, UC8_POCI, UC7_SDA, TIMA0_C2N, FCC_IN, ADC0_14"
      },
      {
        "num": "32",
        "name": "PA17",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PA17（緩衝類型：LDIO 低驅動，支援喚醒）；IOMUX 多工：PA17, UC8_PICO_TX, UC8_SCLK_RX, UC7_SCL, TIMA0_C3, TIMG2_C0, TIMG14_C2, ADC0_13, COMP0_IN1-"
      },
      {
        "num": "33",
        "name": "PA18",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PA18（緩衝類型：LDIO 低驅動，支援喚醒）；IOMUX 多工：PA18, UC8_SCLK_RX, UC8_PICO_TX, UC7_SDA, TIMA0_C3N, TIMG2_C1, TIMG14_C3, UC4_CS0_CTS, BSL_invoke, ADC0_12, COMP0_IN1+"
      },
      {
        "num": "34",
        "name": "PA19",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PA19（緩衝類型：LDIO 低驅動）；IOMUX 多工：PA19, SWDIO, UC8_POCI, UC7_SDA, TIMA0_C2, TIMG14_C0"
      },
      {
        "num": "35",
        "name": "PA20",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PA20（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA20, SWCLK, UC8_SCLK_RX, UC7_SCL, TIMA0_C2N, TIMG14_C1"
      },
      {
        "num": "36",
        "name": "PB17",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PB17（緩衝類型：LDIO 低驅動）；IOMUX 多工：PB17, UC11_TX, UC4_PICO_TX, UC6_SCL, TIMA0_C2, TIMG14_C0, TIMG1_C0, ADC0_11"
      },
      {
        "num": "37",
        "name": "PB18",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PB18（緩衝類型：LDIO 低驅動）；IOMUX 多工：PB18, UC11_RX, UC4_SCLK_RX, UC6_SDA, TIMA0_C2N, TIMG14_C1, TIMG1_C1, ADC0_10"
      },
      {
        "num": "38",
        "name": "PB19",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PB19（緩衝類型：LDIO 低驅動）；IOMUX 多工：PB19, COMP0_OUT, UC4_POCI_RTS, UC4_CS0_CTS, TIMG2_C1, TIMG14_C2, ADC0_9"
      },
      {
        "num": "39",
        "name": "PA21",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PA21（緩衝類型：LDIO 低驅動）；IOMUX 多工：PA21, UC11_TX, TIMA0_C0, TIMG1_C0, TIMG14_C2, ADC0_8, ADC0_VREF-"
      },
      {
        "num": "40",
        "name": "PA22",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PA22（緩衝類型：LDIO 低驅動）；IOMUX 多工：PA22, UC11_RX, TIMA0_C0N, TIMG1_C1, TIMA0_C1, CLK_OUT, UC6_SCL, TIMG14_C3, ADC0_7"
      },
      {
        "num": "41",
        "name": "PB20",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PB20（緩衝類型：LDIO 低驅動）；IOMUX 多工：PB20, UC8_CS0, TIMA0_C2, TIMA_FAL1, TIMA0_C1, UC6_SDA, ADC0_6"
      },
      {
        "num": "42",
        "name": "PB24",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PB24（緩衝類型：LDIO 低驅動）；IOMUX 多工：PB24, TIMA0_C3, TIMA0_C1N, ADC0_5"
      },
      {
        "num": "43",
        "name": "PA23",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PA23（緩衝類型：LDIO 低驅動）；IOMUX 多工：PA23, UC11_TX, TIMA0_C3, TIMG14_C2, TIMG2_C0, TIMG14_C0, ADC0_VREF+"
      },
      {
        "num": "44",
        "name": "PA24",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PA24（緩衝類型：LDIO 低驅動）；IOMUX 多工：PA24, UC11_RX, TIMA0_C3N, TIMG14_C3, TIMG2_C1, TIMG14_C1, ADC0_3"
      },
      {
        "num": "45",
        "name": "PA25",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PA25（緩衝類型：LDIO 低驅動）；IOMUX 多工：PA25, TIMA0_C3, TIMA0_C1N, COMP0_OUT, TIMG1_C0, ADC0_2"
      },
      {
        "num": "46",
        "name": "PA26",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PA26（緩衝類型：LDIO 低驅動）；IOMUX 多工：PA26, UC8_CS0, TIMG14_C2, TIMA_FAL0, TIMA0_C3N, TIMG2_C0, TIMG1_C1, ADC0_1, COMP0_IN0+"
      },
      {
        "num": "47",
        "name": "PA27",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PA27（緩衝類型：LDIO 低驅動）；IOMUX 多工：PA27, TIMG14_C3, TIMA_FAL2, CLK_OUT, TIMG2_C1, RTC_OUT, COMP0_OUT, ADC0_0, COMP0_IN0-"
      },
      {
        "num": "48",
        "name": "VCORE",
        "side": "T",
        "type": "Power",
        "desc": "核心相關電源腳（表列 SIGNAL TYPE：PWR）；確切功能（如內部數位核心穩壓輸出，須外接去耦電容）見 datasheet §7.6 Power Supply Sequencing／§8.3 PMU"
      },
      {
        "num": "49",
        "name": "VSS (EP)",
        "side": "B",
        "type": "Ground",
        "desc": "外露散熱焊盤（圖 6-2 中央 Thermal Pad）；接 VSS/接地平面（接法詳見 datasheet layout 章節）",
        "ep": true
      }
    ],
    "specs": [
      {
        "k": "核心",
        "v": "Arm 32-bit Cortex-M0+，含記憶體保護單元，最高 32MHz"
      },
      {
        "k": "操作溫度",
        "v": "−40°C ~ 125°C（datasheet 未標示 AEC-Q100 車規認證字樣，非 -Q1 車規版）"
      },
      {
        "k": "供電範圍",
        "v": "1.62V ~ 3.6V"
      },
      {
        "k": "記憶體",
        "v": "MSPM0L1126：64KB flash（ECC）／12KB SRAM（ECC 或 parity）（同系列 MSPM0L1127：128KB flash／12KB SRAM）"
      },
      {
        "k": "ADC",
        "v": "12-bit、1.6Msps，最多 26 個外部通道（家族最大值；48-VQFN RGZ 封裝實際可用通道數見腳位表）"
      },
      {
        "k": "參考電壓",
        "v": "可組態 1.4V 或 2.5V 內部共用 VREF"
      },
      {
        "k": "比較器",
        "v": "COMP，含 8-bit 參考 DAC；整合溫度感測器"
      },
      {
        "k": "加密/安全",
        "v": "AES 加速器（GCM/GMAC、CCM/CBC-MAC、CBC、CTR）；安全金鑰儲存 1×256-bit 或 2×128-bit AES 金鑰；CRC-16"
      },
      {
        "k": "低功耗",
        "v": "RUN 98µA/MHz（CoreMark）；SLEEP 1.3mA@32MHz；STOP 403µA@4MHz；STANDBY 1.6µA；SHUTDOWN 81nA（支援 I/O 喚醒）"
      },
      {
        "k": "通訊介面",
        "v": "最多 3×UART（1 組支援 LIN/IrDA/DALI/smart card/Manchester）；最多 2×I2C（SMBus/PMBus，最高 FM+ 1Mbps）；最多 2×SPI（最高 16Mbps）"
      },
      {
        "k": "時脈",
        "v": "內建 32MHz SYSOSC（−2.1%~1.6%）；內建 32kHz LFOSC（±3%）；外部 4~32MHz HFXT；外部 32kHz LFXT"
      },
      {
        "k": "I/O",
        "v": "最多 60 個 GPIO，其中 2 個 5V 耐受開汲極；48-VQFN (RGZ) 封裝下為 44 個 GPIO＋NRST/VDD/VSS/VCORE"
      },
      {
        "k": "封裝選項",
        "v": "64-pin LQFP (PM)；48-pin LQFP (PT)／VQFN (RGZ)；32-pin VQFN (RHB)；28-pin VSSOP (DGS28)／WQFN-28 (RUY)；24-pin VQFN (RGE)"
      },
      {
        "k": "除錯",
        "v": "2-pin SWD"
      },
      {
        "k": "同系列差異",
        "v": "MSPM0L2116/L2117 另含 LCD 控制器（最高支援 4x48／8x44 LCD），本條目 L1126/L1127 無 LCD"
      }
    ],
    "secondSource": [
      "封裝＋pinout 相容（48-VQFN (RGZ) 或 48-LQFP (PT)，二者 pin 編號相容）",
      "功能相同（Arm Cortex-M0+ 混合訊號 MCU，無 LCD）",
      "ADC/比較器規格相容（12-bit 1.6Msps ADC、含 DAC 比較器）",
      "通訊介面相容（UART/I2C/SPI 數量與速率）",
      "電源範圍涵蓋（1.62V~3.6V）",
      "加密/安全功能相容（AES 加速器＋安全金鑰儲存）",
      "操作溫度範圍涵蓋（−40°C~125°C）"
    ],
    "dropIn": [
      {
        "part": "MSPM0L1127",
        "note": "同一份 family datasheet（TI SLASFN5，md5 相同）、Table 6-2 RGZ 48-VQFN pinout 完全相同，僅記憶體不同：L1126=64KB flash／12KB RAM、L1127=128KB flash／12KB RAM"
      }
    ],
    "thermalPad": "外露焊盤（datasheet 圖 6-2 48-pin RGZ 中央標示 Thermal Pad），須接板上接地平面"
  },
  {
    "part": "MSPM0L1127",
    "mfr": "Texas Instruments",
    "category": "mcu",
    "subcategory": "Arm Cortex-M0+ 混合訊號 MCU（128KB flash／12KB RAM，無 LCD）",
    "package": "48-VQFN (RGZ)",
    "whatIs": "混合訊號 MCU：Arm 32-bit Cortex-M0+ 核心（含記憶體保護單元，最高 32MHz），操作溫度 −40°C~125°C，供電範圍 1.62V~3.6V，最高 128KB flash（含 ECC）＋12KB SRAM（含 ECC 或 parity），內建 12-bit 1.6Msps ADC（最多 26 個外部通道）、含 8-bit 參考 DAC 的比較器（COMP）、整合溫度感測器、AES 加速器（支援 GCM/GMAC、CCM/CBC-MAC、CBC、CTR）＋安全金鑰儲存；封裝選項含 64-pin LQFP (PM)、48-pin LQFP (PT)／VQFN (RGZ)、32-pin VQFN (RHB)、28-pin VSSOP (DGS28)／WQFN-28 (RUY)、24-pin VQFN (RGE)。MSPM0L1127＝128KB flash／12KB RAM；同系列 MSPM0L1126＝64KB flash／12KB RAM。（同一份 family datasheet 另涵蓋含 LCD 控制器的姊妹款 MSPM0L2116／L2117，非本條目對象，本條目 L1126/L1127 不含 LCD）",
    "func": "低功耗模式：RUN 98µA/MHz（CoreMark）、SLEEP 1.3mA@32MHz、STOP 403µA@4MHz、STANDBY 1.6µA（SRAM 與暫存器全保留）、SHUTDOWN 81nA（支援 I/O 喚醒）；數位周邊：3 通道 DMA 控制器、15 通道事件矩陣（event fabric）、最多 8 顆計時器支援最多 16 路 PWM 輸出（其中 7 顆可於 STANDBY 模式下運作）：1 顆 16-bit 進階計時器含 deadband（頻率最高 64MHz）、1 顆 16-bit 通用計時器含 4 組 capture/compare、2 顆 16-bit 通用計時器各含 2 組 capture/compare、4 顆 16-bit 基本計時器；視窗看門狗（WWDT）、獨立看門狗（IWDT）；通訊介面：最多 3 組 UART（其中 1 組支援 LIN、IrDA、DALI、smart card、Manchester）、最多 2 組 I2C（支援 SMBus/PMBus 與 STOP 模式喚醒，最高支援 FM+ 1Mbps）、最多 2 組 SPI（最高支援 16Mbps）；時脈系統：內建 32MHz 振盪器 SYSOSC（精度 −2.1%~1.6%）、內建 32kHz 振盪器 LFOSC（精度 ±3%）、外部 4MHz~32MHz 石英振盪器 HFXT、外部 32kHz 石英振盪器 LFXT、外部低頻/高頻數位時脈輸入、數位時脈輸出；資料完整性與加密：CRC-16 循環冗餘檢查、AES 加速器、安全金鑰儲存（1 組 256-bit 或 2 組 128-bit AES 金鑰）；I/O：最多 60 個 GPIO，其中 2 個為 5V 耐受開汲極 IO（48-VQFN RGZ 封裝下實際可用 44 個 GPIO＋NRST/VDD/VSS/VCORE，共 48 腳）；開發支援：2-pin 序列線除錯（SWD）。",
    "usedIn": "電池充放電管理、電源供應與功率傳輸、個人電子產品、建築安防與防火、連網周邊與印表機、電網基礎設施、智慧電表、通訊模組、醫療與健康照護等應用。",
    "desc": "Arm Cortex-M0+ MCU，最高 32MHz／128KB flash／12KB SRAM，12-bit 1.6Msps ADC（最多 26 通道），AES 加速器＋安全金鑰儲存，操作溫度 −40°C~125°C，48-VQFN (RGZ) 等多種封裝可選（無 LCD；同系列 L2116/L2117 有 LCD）。",
    "datasheet": "TI SLASFN5（MSPM0L2116/L2117/L1127/L1126 family）",
    "pins": [
      {
        "num": "1",
        "name": "PA0",
        "side": "L",
        "type": "I/O",
        "desc": "GPIO PA0（緩衝類型：ODIO 5V耐受開汲極，支援喚醒）；IOMUX 多工：PA0, UC4_PICO_TX, UC6_SDA, TIMA0_C0, TIMA_FAL1, FCC_IN, BEEP, TIMG14_C0, UC7_SDA, BSLSDA"
      },
      {
        "num": "2",
        "name": "PA1",
        "side": "L",
        "type": "I/O",
        "desc": "GPIO PA1（緩衝類型：ODIO 5V耐受開汲極，支援喚醒）；IOMUX 多工：PA1, UC4_SCLK_RX, UC6_SCL, TIMA0_C1, TIMA_FAL2, TIMG14_C3, TIMG14_C2, TIMG14_C1, UC7_SCL, BSLSCL"
      },
      {
        "num": "3",
        "name": "PA28",
        "side": "L",
        "type": "I/O",
        "desc": "GPIO PA28（緩衝類型：HDIO 高驅動，支援喚醒）；IOMUX 多工：PA28, UC4_PICO_TX, UC6_SDA, TIMA0_C3, TIMA_FAL0, TIMG2_C0, TIMA0_C1"
      },
      {
        "num": "4",
        "name": "{NRST}",
        "side": "L",
        "type": "Input",
        "desc": "外部硬體重置輸入；依腳名 N 前綴慣例判定為 active-low（本摘錄頁未附明文極性敘述，如需精確確認見 datasheet §6.3）；Non-IOMUX 專用腳，無 GPIO 替代功能"
      },
      {
        "num": "5",
        "name": "PA31",
        "side": "L",
        "type": "I/O",
        "desc": "GPIO PA31（緩衝類型：LDIO 低驅動）；IOMUX 多工：PA31, UC4_SCLK_RX, UC6_SCL, TIMA0_C3N, CLK_OUT, TIMG2_C1"
      },
      {
        "num": "6",
        "name": "VDD",
        "side": "L",
        "type": "Power",
        "desc": "電源腳（表列 SIGNAL TYPE：PWR；供電範圍 1.62V~3.6V 見頁 1）"
      },
      {
        "num": "7",
        "name": "VSS",
        "side": "L",
        "type": "Ground",
        "desc": "接地腳（表列 SIGNAL TYPE：PWR，為元件接地）"
      },
      {
        "num": "8",
        "name": "PA2",
        "side": "L",
        "type": "I/O",
        "desc": "GPIO PA2（緩衝類型：LDIO 低驅動）；IOMUX 多工：PA2, TIMG14_C3, UC4_CS0_CTS, TIMG2_C1, UC8_CS0, TIMA0_C3N, TIMA0_C2N, TIMA_FAL0, TIMA_FAL1, TIMA0_C0"
      },
      {
        "num": "9",
        "name": "PA3",
        "side": "L",
        "type": "I/O",
        "desc": "GPIO PA3（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA3, TIMG14_C2, UC7_SDA, TIMA0_C1, COMP0_OUT, TIMG2_C0, TIMA0_C2, UC8_PICO_TX, LFXIN"
      },
      {
        "num": "10",
        "name": "PA4",
        "side": "L",
        "type": "I/O",
        "desc": "GPIO PA4（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA4, TIMG14_C3, UC4_POCI_RTS, UC7_SCL, TIMA0_C1N, LFCLKIN, TIMG2_C1, TIMA0_C3, UC8_SCLK_RX, UC4_CS0_CTS, LFXOUT"
      },
      {
        "num": "11",
        "name": "PA5",
        "side": "L",
        "type": "I/O",
        "desc": "GPIO PA5（緩衝類型：LDIO 低驅動）；IOMUX 多工：PA5, TIMG14_C2, UC4_PICO_TX, UC7_SDA, TIMG14_C0, FCC_IN, TIMG1_C0, TIMA_FAL1, UC4_CS0_CTS, UC8_PICO_TX, HFXIN"
      },
      {
        "num": "12",
        "name": "PA6",
        "side": "L",
        "type": "I/O",
        "desc": "GPIO PA6（緩衝類型：LDIO 低驅動）；IOMUX 多工：PA6, TIMG14_C3, UC4_SCLK_RX, UC7_SCL, TIMG14_C1, HFCLKIN, TIMG1_C1, TIMA_FAL0, UC4_POCI_RTS, TIMA0_C2N, UC8_SCLK_RX, HFXOUT"
      },
      {
        "num": "13",
        "name": "PA7",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PA7（緩衝類型：LDIO 低驅動）；IOMUX 多工：PA7, COMP0_OUT, CLK_OUT, TIMG14_C2, TIMA0_C2, TIMG14_C3, TIMG2_C1, TIMA0_C1, FCC_IN, UC4_POCI_RTS"
      },
      {
        "num": "14",
        "name": "PB2",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PB2（緩衝類型：LDIO 低驅動）；IOMUX 多工：PB2, UC7_SCL, TIMA0_C3, TIMG1_C0, UC11_TX, HFCLKIN, UC4_PICO_TX"
      },
      {
        "num": "15",
        "name": "PB3",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PB3（緩衝類型：LDIO 低驅動）；IOMUX 多工：PB3, UC7_SDA, TIMA0_C3N, TIMG1_C1, UC11_RX, TIMA0_C0, UC4_SCLK_RX"
      },
      {
        "num": "16",
        "name": "PA8",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PA8（緩衝類型：LDIO 低驅動）；IOMUX 多工：PA8, UC8_PICO_TX, UC4_CS0_CTS, UC6_SDA, TIMA0_C0, TIMA_FAL2, TIMA_FAL0, TIMG2_C1, HFCLKIN, UC4_POCI_RTS"
      },
      {
        "num": "17",
        "name": "PA9",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PA9（緩衝類型：LDIO 低驅動）；IOMUX 多工：PA9, UC8_SCLK_RX, UC4_PICO_TX, UC6_SCL, TIMA0_C0N, CLK_OUT, TIMA0_C1, RTC_OUT, TIMG2_C0, UC4_CS0_CTS"
      },
      {
        "num": "18",
        "name": "PA10",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PA10（緩衝類型：HDIO 高驅動，支援喚醒）；IOMUX 多工：PA10, UC4_PICO_TX, UC4_POCI_RTS, UC6_SDA, TIMA0_C2, CLK_OUT, TIMG14_C0, UC7_SDA, TIMA_FAL1, BSLTX"
      },
      {
        "num": "19",
        "name": "PA11",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PA11（緩衝類型：HDIO 高驅動，支援喚醒）；IOMUX 多工：PA11, UC4_SCLK_RX, UC6_SCL, TIMA0_C2N, COMP0_OUT, TIMG14_C1, UC7_SCL, TIMA_FAL0, BSLRX, COMP0_DAC_OUT"
      },
      {
        "num": "20",
        "name": "PB6",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PB6（緩衝類型：LDIO 低驅動）；IOMUX 多工：PB6, UC8_PICO_TX, UC8_CS0, TIMG14_C2, TIMG1_C0, TIMA_FAL2"
      },
      {
        "num": "21",
        "name": "PB7",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PB7（緩衝類型：LDIO 低驅動）；IOMUX 多工：PB7, UC8_SCLK_RX, UC8_POCI, TIMG14_C3, TIMG1_C1"
      },
      {
        "num": "22",
        "name": "PB8",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PB8（緩衝類型：LDIO 低驅動）；IOMUX 多工：PB8, UC8_PICO_TX, TIMA0_C0, COMP0_OUT, TIMG1_C0"
      },
      {
        "num": "23",
        "name": "PB9",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PB9（緩衝類型：LDIO 低驅動）；IOMUX 多工：PB9, UC8_SCLK_RX, TIMA0_C0N, TIMA0_C1, TIMG1_C1"
      },
      {
        "num": "24",
        "name": "PB14",
        "side": "B",
        "type": "I/O",
        "desc": "GPIO PB14（緩衝類型：LDIO 低驅動）；IOMUX 多工：PB14, UC8_SCLK_RX, UC8_POCI, FCC_IN, TIMA0_C0, TIMG14_C2, TIMG14_C0, COMP0_OUT, ADC0_21"
      },
      {
        "num": "25",
        "name": "PB15",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PB15（緩衝類型：LDIO 低驅動）；IOMUX 多工：PB15, UC11_TX, UC8_PICO_TX, UC4_POCI_RTS, TIMG14_C2, TIMG2_C0, TIMA0_C3N, RTC_OUT, TIMG14_C1, UC8_CS0, ADC0_20"
      },
      {
        "num": "26",
        "name": "PB16",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PB16（緩衝類型：LDIO 低驅動）；IOMUX 多工：PB16, UC11_RX, UC8_SCLK_RX, UC4_CS0_CTS, TIMG14_C3, TIMG2_C1, UC4_PICO_TX, CLK_OUT, ADC0_19"
      },
      {
        "num": "27",
        "name": "PA12",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PA12（緩衝類型：LDIO 低驅動）；IOMUX 多工：PA12, UC4_POCI_RTS, UC4_SCLK_RX, COMP0_OUT, TIMA0_C3, FCC_IN, TIMG14_C0, UC7_SCL, TIMA0_C2, ADC0_18"
      },
      {
        "num": "28",
        "name": "PA13",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PA13（緩衝類型：LDIO 低驅動）；IOMUX 多工：PA13, TIMA0_C2N, UC4_POCI_RTS, UC7_SDA, TIMA0_C3N, RTC_OUT, TIMG14_C1, UC8_CS0, UC8_POCI, UC11_TX, COMP0_OUT, ADC0_17, COMP0_IN2-"
      },
      {
        "num": "29",
        "name": "PA14",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PA14（緩衝類型：LDIO 低驅動）；IOMUX 多工：PA14, UC4_CS0_CTS, UC4_PICO_TX, CLK_OUT, UC11_RX, ADC0_16, COMP0_IN2+"
      },
      {
        "num": "30",
        "name": "PA15",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PA15（緩衝類型：LDIO 低驅動）；IOMUX 多工：PA15, UC4_POCI_RTS, UC7_SCL, TIMA0_C2, TIMG14_C2, ADC0_15, COMP0_IN3+"
      },
      {
        "num": "31",
        "name": "PA16",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PA16（緩衝類型：LDIO 低驅動）；IOMUX 多工：PA16, COMP0_OUT, UC8_POCI, UC7_SDA, TIMA0_C2N, FCC_IN, ADC0_14"
      },
      {
        "num": "32",
        "name": "PA17",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PA17（緩衝類型：LDIO 低驅動，支援喚醒）；IOMUX 多工：PA17, UC8_PICO_TX, UC8_SCLK_RX, UC7_SCL, TIMA0_C3, TIMG2_C0, TIMG14_C2, ADC0_13, COMP0_IN1-"
      },
      {
        "num": "33",
        "name": "PA18",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PA18（緩衝類型：LDIO 低驅動，支援喚醒）；IOMUX 多工：PA18, UC8_SCLK_RX, UC8_PICO_TX, UC7_SDA, TIMA0_C3N, TIMG2_C1, TIMG14_C3, UC4_CS0_CTS, BSL_invoke, ADC0_12, COMP0_IN1+"
      },
      {
        "num": "34",
        "name": "PA19",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PA19（緩衝類型：LDIO 低驅動）；IOMUX 多工：PA19, SWDIO, UC8_POCI, UC7_SDA, TIMA0_C2, TIMG14_C0"
      },
      {
        "num": "35",
        "name": "PA20",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PA20（緩衝類型：SDIO 標準驅動）；IOMUX 多工：PA20, SWCLK, UC8_SCLK_RX, UC7_SCL, TIMA0_C2N, TIMG14_C1"
      },
      {
        "num": "36",
        "name": "PB17",
        "side": "R",
        "type": "I/O",
        "desc": "GPIO PB17（緩衝類型：LDIO 低驅動）；IOMUX 多工：PB17, UC11_TX, UC4_PICO_TX, UC6_SCL, TIMA0_C2, TIMG14_C0, TIMG1_C0, ADC0_11"
      },
      {
        "num": "37",
        "name": "PB18",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PB18（緩衝類型：LDIO 低驅動）；IOMUX 多工：PB18, UC11_RX, UC4_SCLK_RX, UC6_SDA, TIMA0_C2N, TIMG14_C1, TIMG1_C1, ADC0_10"
      },
      {
        "num": "38",
        "name": "PB19",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PB19（緩衝類型：LDIO 低驅動）；IOMUX 多工：PB19, COMP0_OUT, UC4_POCI_RTS, UC4_CS0_CTS, TIMG2_C1, TIMG14_C2, ADC0_9"
      },
      {
        "num": "39",
        "name": "PA21",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PA21（緩衝類型：LDIO 低驅動）；IOMUX 多工：PA21, UC11_TX, TIMA0_C0, TIMG1_C0, TIMG14_C2, ADC0_8, ADC0_VREF-"
      },
      {
        "num": "40",
        "name": "PA22",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PA22（緩衝類型：LDIO 低驅動）；IOMUX 多工：PA22, UC11_RX, TIMA0_C0N, TIMG1_C1, TIMA0_C1, CLK_OUT, UC6_SCL, TIMG14_C3, ADC0_7"
      },
      {
        "num": "41",
        "name": "PB20",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PB20（緩衝類型：LDIO 低驅動）；IOMUX 多工：PB20, UC8_CS0, TIMA0_C2, TIMA_FAL1, TIMA0_C1, UC6_SDA, ADC0_6"
      },
      {
        "num": "42",
        "name": "PB24",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PB24（緩衝類型：LDIO 低驅動）；IOMUX 多工：PB24, TIMA0_C3, TIMA0_C1N, ADC0_5"
      },
      {
        "num": "43",
        "name": "PA23",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PA23（緩衝類型：LDIO 低驅動）；IOMUX 多工：PA23, UC11_TX, TIMA0_C3, TIMG14_C2, TIMG2_C0, TIMG14_C0, ADC0_VREF+"
      },
      {
        "num": "44",
        "name": "PA24",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PA24（緩衝類型：LDIO 低驅動）；IOMUX 多工：PA24, UC11_RX, TIMA0_C3N, TIMG14_C3, TIMG2_C1, TIMG14_C1, ADC0_3"
      },
      {
        "num": "45",
        "name": "PA25",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PA25（緩衝類型：LDIO 低驅動）；IOMUX 多工：PA25, TIMA0_C3, TIMA0_C1N, COMP0_OUT, TIMG1_C0, ADC0_2"
      },
      {
        "num": "46",
        "name": "PA26",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PA26（緩衝類型：LDIO 低驅動）；IOMUX 多工：PA26, UC8_CS0, TIMG14_C2, TIMA_FAL0, TIMA0_C3N, TIMG2_C0, TIMG1_C1, ADC0_1, COMP0_IN0+"
      },
      {
        "num": "47",
        "name": "PA27",
        "side": "T",
        "type": "I/O",
        "desc": "GPIO PA27（緩衝類型：LDIO 低驅動）；IOMUX 多工：PA27, TIMG14_C3, TIMA_FAL2, CLK_OUT, TIMG2_C1, RTC_OUT, COMP0_OUT, ADC0_0, COMP0_IN0-"
      },
      {
        "num": "48",
        "name": "VCORE",
        "side": "T",
        "type": "Power",
        "desc": "核心相關電源腳（表列 SIGNAL TYPE：PWR）；確切功能（如內部數位核心穩壓輸出，須外接去耦電容）見 datasheet §7.6 Power Supply Sequencing／§8.3 PMU"
      },
      {
        "num": "49",
        "name": "VSS (EP)",
        "side": "B",
        "type": "Ground",
        "desc": "外露散熱焊盤（圖 6-2 中央 Thermal Pad）；接 VSS/接地平面（接法詳見 datasheet layout 章節）",
        "ep": true
      }
    ],
    "specs": [
      {
        "k": "核心",
        "v": "Arm 32-bit Cortex-M0+，含記憶體保護單元，最高 32MHz"
      },
      {
        "k": "操作溫度",
        "v": "−40°C ~ 125°C（datasheet 未標示 AEC-Q100 車規認證字樣，非 -Q1 車規版）"
      },
      {
        "k": "供電範圍",
        "v": "1.62V ~ 3.6V"
      },
      {
        "k": "記憶體",
        "v": "MSPM0L1127：128KB flash（ECC）／12KB SRAM（ECC 或 parity）（同系列 MSPM0L1126：64KB flash／12KB RAM）"
      },
      {
        "k": "ADC",
        "v": "12-bit、1.6Msps，最多 26 個外部通道（家族最大值；48-VQFN RGZ 封裝實際可用通道數見腳位表）"
      },
      {
        "k": "參考電壓",
        "v": "可組態 1.4V 或 2.5V 內部共用 VREF"
      },
      {
        "k": "比較器",
        "v": "COMP，含 8-bit 參考 DAC；整合溫度感測器"
      },
      {
        "k": "加密/安全",
        "v": "AES 加速器（GCM/GMAC、CCM/CBC-MAC、CBC、CTR）；安全金鑰儲存 1×256-bit 或 2×128-bit AES 金鑰；CRC-16"
      },
      {
        "k": "低功耗",
        "v": "RUN 98µA/MHz（CoreMark）；SLEEP 1.3mA@32MHz；STOP 403µA@4MHz；STANDBY 1.6µA；SHUTDOWN 81nA（支援 I/O 喚醒）"
      },
      {
        "k": "通訊介面",
        "v": "最多 3×UART（1 組支援 LIN/IrDA/DALI/smart card/Manchester）；最多 2×I2C（SMBus/PMBus，最高 FM+ 1Mbps）；最多 2×SPI（最高 16Mbps）"
      },
      {
        "k": "時脈",
        "v": "內建 32MHz SYSOSC（−2.1%~1.6%）；內建 32kHz LFOSC（±3%）；外部 4~32MHz HFXT；外部 32kHz LFXT"
      },
      {
        "k": "I/O",
        "v": "最多 60 個 GPIO，其中 2 個 5V 耐受開汲極；48-VQFN (RGZ) 封裝下為 44 個 GPIO＋NRST/VDD/VSS/VCORE"
      },
      {
        "k": "封裝選項",
        "v": "64-pin LQFP (PM)；48-pin LQFP (PT)／VQFN (RGZ)；32-pin VQFN (RHB)；28-pin VSSOP (DGS28)／WQFN-28 (RUY)；24-pin VQFN (RGE)"
      },
      {
        "k": "除錯",
        "v": "2-pin SWD"
      },
      {
        "k": "同系列差異",
        "v": "MSPM0L2116/L2117 另含 LCD 控制器（最高支援 4x48／8x44 LCD），本條目 L1126/L1127 無 LCD"
      }
    ],
    "secondSource": [
      "封裝＋pinout 相容（48-VQFN (RGZ) 或 48-LQFP (PT)，二者 pin 編號相容）",
      "功能相同（Arm Cortex-M0+ 混合訊號 MCU，無 LCD）",
      "ADC/比較器規格相容（12-bit 1.6Msps ADC、含 DAC 比較器）",
      "通訊介面相容（UART/I2C/SPI 數量與速率）",
      "電源範圍涵蓋（1.62V~3.6V）",
      "加密/安全功能相容（AES 加速器＋安全金鑰儲存）",
      "操作溫度範圍涵蓋（−40°C~125°C）"
    ],
    "dropIn": [
      {
        "part": "MSPM0L1126",
        "note": "同一份 family datasheet（TI SLASFN5，md5 相同）、Table 6-2 RGZ 48-VQFN pinout 完全相同，僅記憶體不同：L1127=128KB flash／12KB RAM、L1126=64KB flash／12KB RAM"
      }
    ],
    "thermalPad": "外露焊盤（datasheet 圖 6-2 48-pin RGZ 中央標示 Thermal Pad），須接板上接地平面"
  },
  {
    "part": "ADC3683-EP",
    "mfr": "Texas Instruments",
    "category": "data-converters",
    "subcategory": "低雜訊低功耗雙通道 18-bit ADC（65MSPS）",
    "package": "40-VQFN (RSB) 5×5mm",
    "whatIs": "低雜訊低功耗 18-bit 雙通道類比數位轉換器（ADC），65MSPS 取樣率，序列 LVDS 數位介面，鎖定太空/國防等高可靠度應用；料號字尾 -EP 為 TI Enhanced Product（增強型產品，強化製程與品保管控），與封裝外露焊盤（exposed pad）無關。與同系列 -SEP 抗輻射版共用同一 Pin Functions 表，本條目僅收錄 -EP 一般增強型版本。",
    "func": "雙通道差動類比輸入（AINP/AINM、BINP/BINM），VCM 提供 0.95V 共模電壓輸出，VREF 可接外部 1.6V 參考、REFGND 為參考地；CLKP/CLKM 為差動取樣時脈輸入。序列 LVDS 數位輸出支援 2 線／1 線／1/2 線可設定模式，含每通道 2 個資料 lane（DA0/DA1、DB0/DB1）、資料位元時脈輸出（DCLKP/M）與框時脈輸出（FCLKP/M），另有 LVDS 位元時脈輸入（DCLKINP/M，內建 100Ω 端接）供外部時脈同步。內建可選式 DSP（2/4/8/16/32 倍抽取、32-bit NCO，可略過）。SPI 相容序列介面（SCLK/SDIO/{SEN}）供暫存器設定；PDN/SYNC 供電源關斷或多晶片同步（高態動作）；RESET 為硬體重置（高態動作）；REFBUF/CTRL 於上電時設定預設時脈型態與參考來源。",
    "usedIn": "衛星光通訊酬載、衛星成像酬載、衛星通訊酬載、衛星雷達/光達（RADAR/LIDAR）酬載等高速控制迴路與訊號擷取系統。",
    "desc": "低雜訊低功耗雙通道 18-bit ADC，65MSPS，雜訊底床 -160dBFS/Hz，功耗 94mW/ch，延遲 1-2 個時脈週期，序列 LVDS 介面，40-VQFN 5×5mm，溫度範圍 -55°C~105°C（Enhanced Product）。",
    "datasheet": "TI SBASAP6",
    "pins": [
      {
        "num": "1",
        "name": "PDN/SYNC",
        "side": "L",
        "type": "Input",
        "desc": "電源關斷／同步輸入；經 SPI 介面設定，高態動作；內建 21kΩ 下拉電阻"
      },
      {
        "num": "2",
        "name": "VREF",
        "side": "L",
        "type": "Analog In",
        "desc": "外部電壓參考輸入，1.6V"
      },
      {
        "num": "3",
        "name": "REFGND",
        "side": "L",
        "type": "Ground",
        "desc": "參考地輸入，0V"
      },
      {
        "num": "4",
        "name": "REFBUF/CTRL",
        "side": "L",
        "type": "Input",
        "desc": "設定上電時預設取樣時脈型態與參考電壓來源；內建 100kΩ 上拉電阻至 AVDD"
      },
      {
        "num": "5",
        "name": "AVDD",
        "side": "L",
        "type": "Power",
        "desc": "類比 1.8V 電源"
      },
      {
        "num": "6",
        "name": "CLKP",
        "side": "L",
        "type": "Input",
        "desc": "ADC 取樣時脈差動輸入正端"
      },
      {
        "num": "7",
        "name": "CLKM",
        "side": "L",
        "type": "Input",
        "desc": "ADC 取樣時脈差動輸入負端"
      },
      {
        "num": "8",
        "name": "VCM",
        "side": "L",
        "type": "Analog Out",
        "desc": "類比輸入共模電壓輸出，0.95V"
      },
      {
        "num": "9",
        "name": "RESET",
        "side": "L",
        "type": "Input",
        "desc": "硬體重置，高態動作；內建 21kΩ 下拉電阻"
      },
      {
        "num": "10",
        "name": "SDIO",
        "side": "L",
        "type": "I/O",
        "desc": "序列介面資料輸入輸出；內建 21kΩ 下拉電阻"
      },
      {
        "num": "11",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "接地，0V；Table 4-1 於 GND 列附註 PowerPAD™（EP 是否獨立列見自查回報，未建為獨立腳位）"
      },
      {
        "num": "12",
        "name": "AINP",
        "side": "B",
        "type": "Analog In",
        "desc": "類比輸入正端，A 通道"
      },
      {
        "num": "13",
        "name": "AINM",
        "side": "B",
        "type": "Analog In",
        "desc": "類比輸入負端，A 通道"
      },
      {
        "num": "14",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "接地，0V；PowerPAD™（同上）"
      },
      {
        "num": "15",
        "name": "AVDD",
        "side": "B",
        "type": "Power",
        "desc": "類比 1.8V 電源"
      },
      {
        "num": "16",
        "name": "{SEN}",
        "side": "B",
        "type": "Input",
        "desc": "序列介面致能，低態動作；內建 21kΩ 上拉電阻至 AVDD"
      },
      {
        "num": "17",
        "name": "DA1M",
        "side": "B",
        "type": "Output",
        "desc": "A 通道 lane 1 序列 LVDS 輸出負端"
      },
      {
        "num": "18",
        "name": "DA1P",
        "side": "B",
        "type": "Output",
        "desc": "A 通道 lane 1 序列 LVDS 輸出正端"
      },
      {
        "num": "19",
        "name": "DA0M",
        "side": "B",
        "type": "Output",
        "desc": "A 通道 lane 0 序列 LVDS 輸出負端"
      },
      {
        "num": "20",
        "name": "DA0P",
        "side": "B",
        "type": "Output",
        "desc": "A 通道 lane 0 序列 LVDS 輸出正端"
      },
      {
        "num": "21",
        "name": "IOVDD",
        "side": "R",
        "type": "Power",
        "desc": "數位介面 1.8V 電源"
      },
      {
        "num": "22",
        "name": "DCLKM",
        "side": "R",
        "type": "Output",
        "desc": "序列 LVDS 位元時脈輸出負端"
      },
      {
        "num": "23",
        "name": "DCLKP",
        "side": "R",
        "type": "Output",
        "desc": "序列 LVDS 位元時脈輸出正端"
      },
      {
        "num": "24",
        "name": "DCLKINM",
        "side": "R",
        "type": "Input",
        "desc": "序列 LVDS 位元時脈輸入負端；內建 100Ω 差動端接"
      },
      {
        "num": "25",
        "name": "DCLKINP",
        "side": "R",
        "type": "Input",
        "desc": "序列 LVDS 位元時脈輸入正端；內建 100Ω 差動端接"
      },
      {
        "num": "26",
        "name": "IOGND",
        "side": "R",
        "type": "Ground",
        "desc": "數位介面接地，0V"
      },
      {
        "num": "27",
        "name": "NC",
        "side": "R",
        "type": "NC",
        "desc": "未連接"
      },
      {
        "num": "28",
        "name": "FCLKP",
        "side": "R",
        "type": "Output",
        "desc": "序列 LVDS 框時脈輸出正端"
      },
      {
        "num": "29",
        "name": "FCLKM",
        "side": "R",
        "type": "Output",
        "desc": "序列 LVDS 框時脈輸出負端"
      },
      {
        "num": "30",
        "name": "IOVDD",
        "side": "R",
        "type": "Power",
        "desc": "數位介面 1.8V 電源"
      },
      {
        "num": "31",
        "name": "DB0P",
        "side": "T",
        "type": "Output",
        "desc": "B 通道 lane 0 序列 LVDS 輸出正端"
      },
      {
        "num": "32",
        "name": "DB0M",
        "side": "T",
        "type": "Output",
        "desc": "B 通道 lane 0 序列 LVDS 輸出負端"
      },
      {
        "num": "33",
        "name": "DB1P",
        "side": "T",
        "type": "Output",
        "desc": "B 通道 lane 1 序列 LVDS 輸出正端"
      },
      {
        "num": "34",
        "name": "DB1M",
        "side": "T",
        "type": "Output",
        "desc": "B 通道 lane 1 序列 LVDS 輸出負端"
      },
      {
        "num": "35",
        "name": "SCLK",
        "side": "T",
        "type": "Input",
        "desc": "序列介面時脈輸入；內建 21kΩ 下拉電阻"
      },
      {
        "num": "36",
        "name": "AVDD",
        "side": "T",
        "type": "Power",
        "desc": "類比 1.8V 電源"
      },
      {
        "num": "37",
        "name": "GND",
        "side": "T",
        "type": "Ground",
        "desc": "接地，0V；PowerPAD™（同上）"
      },
      {
        "num": "38",
        "name": "BINM",
        "side": "T",
        "type": "Analog In",
        "desc": "類比輸入負端，B 通道"
      },
      {
        "num": "39",
        "name": "BINP",
        "side": "T",
        "type": "Analog In",
        "desc": "類比輸入正端，B 通道"
      },
      {
        "num": "40",
        "name": "GND",
        "side": "T",
        "type": "Ground",
        "desc": "接地，0V；PowerPAD™（同上）"
      },
      {
        "num": "41",
        "name": "GND (EP)",
        "side": "B",
        "type": "Ground",
        "desc": "外露焊盤 PowerPAD（圖 4-1 中央 Thermal Pad；表 GND 列含 PowerPAD 字樣）；接地平面",
        "ep": true
      }
    ],
    "specs": [
      {
        "k": "解析度",
        "v": "18-bit（no missing codes）"
      },
      {
        "k": "取樣率",
        "v": "雙通道 65 MSPS"
      },
      {
        "k": "雜訊底床",
        "v": "-160 dBFS/Hz"
      },
      {
        "k": "功耗",
        "v": "94 mW/ch（65MSPS 時）"
      },
      {
        "k": "延遲",
        "v": "1-2 個時脈週期"
      },
      {
        "k": "INL/DNL",
        "v": "INL: ±7 LSB，DNL: ±0.7 LSB（typical）"
      },
      {
        "k": "參考電壓",
        "v": "外部或內部可選"
      },
      {
        "k": "數位介面",
        "v": "序列 LVDS（2-wire／1-wire／1/2-wire 可選）"
      },
      {
        "k": "頻譜性能（fIN=5MHz）",
        "v": "SNR 83.8dBFS；SFDR 89dBc（HD2/HD3）；SFDR 101dBFS（最差雜散）"
      },
      {
        "k": "封裝",
        "v": "40-QFN 5×5mm"
      },
      {
        "k": "溫度範圍",
        "v": "-55°C ~ 105°C（Enhanced Product）"
      }
    ],
    "secondSource": [],
    "dropIn": [],
    "thermalPad": "外露焊盤 PowerPAD=GND（datasheet 圖 4-1 中央標示 Thermal Pad、Table 4-1 GND 列註 PowerPAD），須接板上接地平面"
  },
  {
    "part": "ADS125H18",
    "mfr": "Texas Instruments",
    "category": "data-converters",
    "subcategory": "高壓輸入多工 8/16 通道 24-bit Delta-Sigma ADC",
    "package": "36-VQFN (RHB) 5.00×5.00mm",
    "whatIs": "高壓輸入多工型 8/16 通道、24-bit Delta-Sigma ADC，資料速率最高 1.067MSPS；每路輸入前端含高阻抗精密電阻分壓網路，可將高電壓輸入直接降壓至 ADC 輸入範圍，免外加降壓電路，適合工業高壓類比訊號量測。",
    "func": "類比多工器支援 17 路獨立可選輸入（最多 8 全差動或 16 單端，AIN0~AIN15），輸入緩衝與參考緩衝皆為 rail-to-rail；RESP/RESN 為前端電阻分壓網路正負端連接。內建電壓參考可選輸出 2.5V 或 4.096V（REFOUT），REFP/TDACOUT 可作正參考輸入或測試 DAC 輸出，REFN 為負參考輸入。具通道自動定序器與 FIFO 緩衝、故障偵測與系統監控電路；4 組可調速度模式在資料速率、解析度與功耗間取捨；於 ≤25SPS 時可同時抑制 50Hz/60Hz 干擾。SPI 序列介面（SCLK/SDI/SDO-{DRDY}/{CS}）供控制與資料讀取，{RESET} 為硬體重置；GPIO0~3 可多工作為 START（轉換啟動）、CLKIN（外部時脈）、FAULT（故障輸出）等專用功能。",
    "usedIn": "工廠自動化與控制（狀態監測、類比輸入模組）、測試量測（資料擷取 DAQ、半導體測試設備）等需直接接受高壓類比訊號的工業量測系統。",
    "desc": "高壓輸入多工 8/16 通道 24-bit Delta-Sigma ADC，1.067MSPS，內建精密電阻分壓網路，17 路可選輸入，內部 25.6MHz 1% 振盪器，36-VQFN 5×5mm，溫度範圍 -40°C~125°C。",
    "datasheet": "TI SBASAE3",
    "pins": [
      {
        "num": "1",
        "name": "AIN0",
        "side": "L",
        "type": "Analog In",
        "desc": "類比輸入 0"
      },
      {
        "num": "2",
        "name": "AIN1",
        "side": "L",
        "type": "Analog In",
        "desc": "類比輸入 1"
      },
      {
        "num": "3",
        "name": "AIN2",
        "side": "L",
        "type": "Analog In",
        "desc": "類比輸入 2"
      },
      {
        "num": "4",
        "name": "AIN3",
        "side": "L",
        "type": "Analog In",
        "desc": "類比輸入 3"
      },
      {
        "num": "5",
        "name": "AIN4",
        "side": "L",
        "type": "Analog In",
        "desc": "類比輸入 4"
      },
      {
        "num": "6",
        "name": "AIN5",
        "side": "L",
        "type": "Analog In",
        "desc": "類比輸入 5"
      },
      {
        "num": "7",
        "name": "AIN6",
        "side": "L",
        "type": "Analog In",
        "desc": "類比輸入 6"
      },
      {
        "num": "8",
        "name": "AIN7",
        "side": "L",
        "type": "Analog In",
        "desc": "類比輸入 7"
      },
      {
        "num": "9",
        "name": "AIN8",
        "side": "L",
        "type": "Analog In",
        "desc": "類比輸入 8"
      },
      {
        "num": "10",
        "name": "AIN9",
        "side": "B",
        "type": "Analog In",
        "desc": "類比輸入 9"
      },
      {
        "num": "11",
        "name": "AIN10",
        "side": "B",
        "type": "Analog In",
        "desc": "類比輸入 10"
      },
      {
        "num": "12",
        "name": "AIN11",
        "side": "B",
        "type": "Analog In",
        "desc": "類比輸入 11"
      },
      {
        "num": "13",
        "name": "REFOUT",
        "side": "B",
        "type": "Analog Out",
        "desc": "電壓參考輸出"
      },
      {
        "num": "14",
        "name": "REFP/TDACOUT",
        "side": "B",
        "type": "I/O",
        "desc": "正參考電壓輸入／測試 DAC 輸出"
      },
      {
        "num": "15",
        "name": "REFN",
        "side": "B",
        "type": "Analog In",
        "desc": "負參考電壓輸入"
      },
      {
        "num": "16",
        "name": "{RESET}",
        "side": "B",
        "type": "Input",
        "desc": "重置，低態動作"
      },
      {
        "num": "17",
        "name": "GPIO0/START",
        "side": "B",
        "type": "Input",
        "desc": "通用輸出入 0；可設為專用轉換啟動 START 輸入"
      },
      {
        "num": "18",
        "name": "{CS}",
        "side": "B",
        "type": "Input",
        "desc": "晶片選擇，低態動作"
      },
      {
        "num": "19",
        "name": "SCLK",
        "side": "R",
        "type": "Input",
        "desc": "序列資料時脈"
      },
      {
        "num": "20",
        "name": "SDI",
        "side": "R",
        "type": "Input",
        "desc": "序列資料輸入"
      },
      {
        "num": "21",
        "name": "SDO/{DRDY}",
        "side": "R",
        "type": "I/O",
        "desc": "序列資料輸出／資料就緒（低態動作，可選）"
      },
      {
        "num": "22",
        "name": "{DRDY}/GPIO1",
        "side": "R",
        "type": "I/O",
        "desc": "資料就緒（低態動作）／通用輸出入 1"
      },
      {
        "num": "23",
        "name": "GPIO2/CLKIN",
        "side": "R",
        "type": "I/O",
        "desc": "通用輸出入 2；可設為外部時脈輸入"
      },
      {
        "num": "24",
        "name": "IOVDD",
        "side": "R",
        "type": "Power",
        "desc": "I/O 供電電源"
      },
      {
        "num": "25",
        "name": "DGND",
        "side": "R",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "26",
        "name": "CAPD",
        "side": "R",
        "type": "Power",
        "desc": "數位電壓穩壓器輸出，外接旁路電容"
      },
      {
        "num": "27",
        "name": "GPIO3/FAULT",
        "side": "R",
        "type": "I/O",
        "desc": "通用輸出入 3；可設為專用 FAULT 輸出"
      },
      {
        "num": "28",
        "name": "AVSS",
        "side": "T",
        "type": "Power",
        "desc": "負類比電源"
      },
      {
        "num": "29",
        "name": "CAPA",
        "side": "T",
        "type": "Power",
        "desc": "類比電壓穩壓器輸出，外接旁路電容"
      },
      {
        "num": "30",
        "name": "AVDD",
        "side": "T",
        "type": "Power",
        "desc": "正類比電源"
      },
      {
        "num": "31",
        "name": "RESP",
        "side": "T",
        "type": "Power",
        "desc": "電阻分壓網路正端連接"
      },
      {
        "num": "32",
        "name": "RESN",
        "side": "T",
        "type": "Power",
        "desc": "電阻分壓網路負端連接"
      },
      {
        "num": "33",
        "name": "AIN12",
        "side": "T",
        "type": "Analog In",
        "desc": "類比輸入 12"
      },
      {
        "num": "34",
        "name": "AIN13",
        "side": "T",
        "type": "Analog In",
        "desc": "類比輸入 13"
      },
      {
        "num": "35",
        "name": "AIN14",
        "side": "T",
        "type": "Analog In",
        "desc": "類比輸入 14"
      },
      {
        "num": "36",
        "name": "AIN15",
        "side": "T",
        "type": "Analog In",
        "desc": "類比輸入 15"
      },
      {
        "num": "37",
        "name": "AVSS (EP)",
        "side": "B",
        "type": "Ground",
        "desc": "外露散熱焊盤（Table 4-1 Thermal Pad 列）；接 AVSS",
        "ep": true
      }
    ],
    "thermalPad": "外露散熱焊盤（Table 4-1 明列 Thermal Pad 列）；接 AVSS",
    "specs": [
      {
        "k": "資料速率",
        "v": "可程式，最高 1.067MSPS"
      },
      {
        "k": "輸入多工",
        "v": "17 路獨立可選輸入，最多 8 全差動或 16 單端"
      },
      {
        "k": "輸入前端",
        "v": "高阻抗電壓分壓網路，內建精密匹配電阻"
      },
      {
        "k": "緩衝",
        "v": "類比輸入緩衝與參考緩衝皆為 rail-to-rail"
      },
      {
        "k": "內部參考",
        "v": "可選輸出 2.5V 或 4.096V"
      },
      {
        "k": "振盪器",
        "v": "內部 25.6MHz，準確度 1%"
      },
      {
        "k": "定序與緩衝",
        "v": "通道自動定序器＋FIFO 緩衝"
      },
      {
        "k": "雜訊抑制",
        "v": "≤25SPS 時同時抑制 50Hz 與 60Hz"
      },
      {
        "k": "速度模式",
        "v": "四組可調速度模式"
      },
      {
        "k": "封裝",
        "v": "36-VQFN 5.00×5.00mm，EP=AVSS"
      },
      {
        "k": "溫度範圍",
        "v": "-40°C ~ 125°C"
      }
    ],
    "secondSource": [],
    "dropIn": []
  },
  {
    "part": "ADS125P08",
    "mfr": "Texas Instruments",
    "category": "data-converters",
    "subcategory": "多工 8/16 通道 24-bit Delta-Sigma ADC（CRC 資料校驗）",
    "package": "36-VQFN (RHB) 5.00×5.00mm",
    "whatIs": "多工型 8/16 通道、24-bit Delta-Sigma ADC，資料速率最高 1.067MSPS，內建高阻抗輸入緩衝與參考緩衝降低訊號負載；輸出入資料與暫存器設定具循環冗餘校驗（CRC）以提升操作可靠度，適合工廠自動化、病患監測等應用。與 ADS125H18 同封裝同接腳基礎，但省去高壓電阻分壓前端，AIN8~15 改可複用為類比通用輸出入（AGPIO）。",
    "func": "類比多工器支援 17 路獨立可選輸入（最多 8 全差動或 16 單端，AIN0~AIN15），其中 AIN8~AIN15 可另設為類比通用輸出入 AGPIO0~7；AINCOM 為單端輸入之共用參考點，接類比地。內建電壓參考可選輸出 2.5V 或 4.096V（REFOUT），REFP/TDACOUT 可作正參考輸入或測試 DAC 輸出，REFN 為負參考輸入。具通道自動定序器與 FIFO 緩衝、故障偵測與系統監控電路；4 組可調速度模式；於 ≤25SPS 時可同時抑制 50Hz/60Hz 干擾。SPI 序列介面（SCLK/SDI/SDO-{DRDY}/{CS}）供控制與資料讀取，{RESET} 為硬體重置；GPIO0~3 可多工作為 START、CLKIN、FAULT 等專用功能。",
    "usedIn": "工廠自動化與控制（狀態監測、類比輸入模組、流量計等現場變送器）、病患監測（ECG、輸液幫浦）、測試量測（資料擷取 DAQ、半導體測試設備）。",
    "desc": "多工 8/16 通道 24-bit Delta-Sigma ADC，1.067MSPS，內建 CRC 資料/暫存器校驗，17 路可選輸入含類比 GPIO 複用，內部 25.6MHz 1% 振盪器，36-VQFN 5×5mm，溫度範圍 -40°C~125°C。",
    "datasheet": "TI SBASAE4",
    "pins": [
      {
        "num": "1",
        "name": "AIN0",
        "side": "L",
        "type": "Analog In",
        "desc": "類比輸入 0"
      },
      {
        "num": "2",
        "name": "AIN1",
        "side": "L",
        "type": "Analog In",
        "desc": "類比輸入 1"
      },
      {
        "num": "3",
        "name": "AIN2",
        "side": "L",
        "type": "Analog In",
        "desc": "類比輸入 2"
      },
      {
        "num": "4",
        "name": "AIN3",
        "side": "L",
        "type": "Analog In",
        "desc": "類比輸入 3"
      },
      {
        "num": "5",
        "name": "AIN4",
        "side": "L",
        "type": "Analog In",
        "desc": "類比輸入 4"
      },
      {
        "num": "6",
        "name": "AIN5",
        "side": "L",
        "type": "Analog In",
        "desc": "類比輸入 5"
      },
      {
        "num": "7",
        "name": "AIN6",
        "side": "L",
        "type": "Analog In",
        "desc": "類比輸入 6"
      },
      {
        "num": "8",
        "name": "AIN7",
        "side": "L",
        "type": "Analog In",
        "desc": "類比輸入 7"
      },
      {
        "num": "9",
        "name": "AIN8/AGPIO0",
        "side": "L",
        "type": "Analog In",
        "desc": "類比輸入 8／類比通用輸出入 0"
      },
      {
        "num": "10",
        "name": "AIN9/AGPIO1",
        "side": "B",
        "type": "Analog In",
        "desc": "類比輸入 9／類比通用輸出入 1"
      },
      {
        "num": "11",
        "name": "AIN10/AGPIO2",
        "side": "B",
        "type": "Analog In",
        "desc": "類比輸入 10／類比通用輸出入 2"
      },
      {
        "num": "12",
        "name": "AIN11/AGPIO3",
        "side": "B",
        "type": "Analog In",
        "desc": "類比輸入 11／類比通用輸出入 3"
      },
      {
        "num": "13",
        "name": "REFOUT",
        "side": "B",
        "type": "Analog Out",
        "desc": "電壓參考輸出"
      },
      {
        "num": "14",
        "name": "REFP/TDACOUT",
        "side": "B",
        "type": "I/O",
        "desc": "正參考電壓輸入／測試 DAC 輸出"
      },
      {
        "num": "15",
        "name": "REFN",
        "side": "B",
        "type": "Analog In",
        "desc": "負參考電壓輸入"
      },
      {
        "num": "16",
        "name": "{RESET}",
        "side": "B",
        "type": "Input",
        "desc": "重置，低態動作"
      },
      {
        "num": "17",
        "name": "GPIO0/START",
        "side": "B",
        "type": "Input",
        "desc": "通用輸出入 0；可設為專用轉換啟動 START 輸入"
      },
      {
        "num": "18",
        "name": "{CS}",
        "side": "B",
        "type": "Input",
        "desc": "晶片選擇，低態動作"
      },
      {
        "num": "19",
        "name": "SCLK",
        "side": "R",
        "type": "Input",
        "desc": "序列資料時脈"
      },
      {
        "num": "20",
        "name": "SDI",
        "side": "R",
        "type": "Input",
        "desc": "序列資料輸入"
      },
      {
        "num": "21",
        "name": "SDO/{DRDY}",
        "side": "R",
        "type": "I/O",
        "desc": "序列資料輸出／資料就緒（低態動作，可選）"
      },
      {
        "num": "22",
        "name": "{DRDY}/GPIO1",
        "side": "R",
        "type": "I/O",
        "desc": "資料就緒（低態動作）／通用輸出入 1"
      },
      {
        "num": "23",
        "name": "GPIO2/CLKIN",
        "side": "R",
        "type": "I/O",
        "desc": "通用輸出入 2；可設為外部時脈輸入"
      },
      {
        "num": "24",
        "name": "IOVDD",
        "side": "R",
        "type": "Power",
        "desc": "I/O 供電電源"
      },
      {
        "num": "25",
        "name": "DGND",
        "side": "R",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "26",
        "name": "CAPD",
        "side": "R",
        "type": "Power",
        "desc": "數位電壓穩壓器輸出，外接旁路電容"
      },
      {
        "num": "27",
        "name": "GPIO3/FAULT",
        "side": "R",
        "type": "I/O",
        "desc": "通用輸出入 3；可設為專用 FAULT 輸出"
      },
      {
        "num": "28",
        "name": "AVSS",
        "side": "T",
        "type": "Power",
        "desc": "負類比電源"
      },
      {
        "num": "29",
        "name": "CAPA",
        "side": "T",
        "type": "Power",
        "desc": "類比電壓穩壓器輸出，外接旁路電容"
      },
      {
        "num": "30",
        "name": "AVDD",
        "side": "T",
        "type": "Power",
        "desc": "正類比電源"
      },
      {
        "num": "31",
        "name": "NC",
        "side": "T",
        "type": "NC",
        "desc": "未接腳，需懸空；未使用腳位處理見 datasheet 8.1.3 節"
      },
      {
        "num": "32",
        "name": "AINCOM",
        "side": "T",
        "type": "Analog In",
        "desc": "類比輸入共用點；單端輸入組態時各輸入以此為參考，接類比地"
      },
      {
        "num": "33",
        "name": "AIN12/AGPIO4",
        "side": "T",
        "type": "Analog In",
        "desc": "類比輸入 12／類比通用輸出入 4"
      },
      {
        "num": "34",
        "name": "AIN13/AGPIO5",
        "side": "T",
        "type": "Analog In",
        "desc": "類比輸入 13／類比通用輸出入 5"
      },
      {
        "num": "35",
        "name": "AIN14/AGPIO6",
        "side": "T",
        "type": "Analog In",
        "desc": "類比輸入 14／類比通用輸出入 6"
      },
      {
        "num": "36",
        "name": "AIN15/AGPIO7",
        "side": "T",
        "type": "Analog In",
        "desc": "類比輸入 15／類比通用輸出入 7"
      },
      {
        "num": "37",
        "name": "AVSS (EP)",
        "side": "B",
        "type": "Ground",
        "desc": "外露散熱焊盤（Table 4-1 Thermal Pad 列）；接 AVSS",
        "ep": true
      }
    ],
    "thermalPad": "外露散熱焊盤（Table 4-1 明列 Thermal Pad 列）；接 AVSS",
    "specs": [
      {
        "k": "資料速率",
        "v": "可程式，最高 1.067MSPS"
      },
      {
        "k": "輸入多工",
        "v": "17 路獨立可選輸入，最多 8 全差動或 16 單端"
      },
      {
        "k": "緩衝",
        "v": "rail-to-rail 類比輸入緩衝與參考緩衝"
      },
      {
        "k": "內部參考",
        "v": "可選輸出 2.5V 或 4.096V"
      },
      {
        "k": "資料完整性",
        "v": "輸出入資料與暫存器設定具 CRC 循環冗餘校驗"
      },
      {
        "k": "振盪器",
        "v": "內部 25.6MHz，準確度 1%"
      },
      {
        "k": "定序與緩衝",
        "v": "通道自動定序器＋FIFO 緩衝"
      },
      {
        "k": "雜訊抑制",
        "v": "≤25SPS 時同時抑制 50Hz 與 60Hz"
      },
      {
        "k": "速度模式",
        "v": "四組可調速度模式"
      },
      {
        "k": "封裝",
        "v": "36-VQFN 5.00×5.00mm，EP=AVSS"
      },
      {
        "k": "溫度範圍",
        "v": "-40°C ~ 125°C"
      }
    ],
    "secondSource": [],
    "dropIn": []
  },
  {
    "part": "AFE10004-EP",
    "mfr": "Texas Instruments",
    "category": "data-converters",
    "subcategory": "四通道功率放大器偏壓控制精密類比前端（含 EEPROM 與閘極偏壓開關）",
    "package": "24-VQFN (RGE) 4×4mm",
    "whatIs": "高整合度自主式功率放大器（PA）精密偏壓類比前端（AFE），內建四組溫度補償 DAC、EEPROM 與閘極偏壓開關；開機後可依內部 EEPROM 儲存之溫度-電壓轉換函數自動修正偏壓，無需系統控制器持續介入即可完成 PA 偏壓設定與溫度補償，適合國防/太空 RF 系統。料號字尾 -EP 為 TI Enhanced Product（增強型產品，強化製程與品保管控），與封裝外露焊盤（exposed pad）無關——本裝置恰好兩者皆具備（見 Table 4-1 Thermal Pad 列）。",
    "func": "四組 13-bit 單調 DAC（DAC0~3）緩衝輸出，開機時自動配置輸出範圍（正輸出最高 5.5V、負輸出最低 -10V），高電流驅動（source 最高 100mA、sink 最高 20mA），可承受高達 15µF 電容負載；OUT1/OUT2 為 DAC1/DAC2 經閘極偏壓開關後之切換輸出，DRVEN1/DRVEN2 為對應非同步開關控制訊號，具兩組可程式關斷電壓與快速響應，用於保護 GaAs/GaN 等空乏型電晶體並配合 PA_ON 完成功放序時控制。CLAMP1/CLAMP2 為輔助 DAC 緩衝輸出，切換時間典型 50ns、導通電阻最高 3Ω。內建本地與遠端（D+/D–）二極體溫度感測器，誤差 ±2.5°C（max）、解析度 0.0625°C。內建 2.5V 參考。SPI（4 線，SCL/{CS}、A2/SCLK、A1/SDI、A0/SDO）與 I2C（SDA、SCL、8 組可選位址）雙介面可選，操作電壓 1.7V~3.6V；{RESET}/{ALMIN} 為重置輸入，亦可設為低態動作警報輸入。",
    "usedIn": "雷達、電子戰、通訊酬載、國防無線電等 RF 系統中 LDMOS/GaAs/GaN 功率放大器之自主偏壓控制電路。",
    "desc": "四通道功放偏壓精密 AFE，內建 EEPROM 儲存 4 組溫度-電壓轉換函數與閘極偏壓開關，DAC 解析度 13-bit/1.22mV，SPI/I2C 雙介面，24-VQFN 4×4mm，溫度範圍 -55°C~125°C（Enhanced Product）。",
    "datasheet": "TI SLASFM1A",
    "pins": [
      {
        "num": "1",
        "name": "DRVEN2",
        "side": "L",
        "type": "Input",
        "desc": "非同步開關控制訊號（對應 OUT2/DAC2 路徑）"
      },
      {
        "num": "2",
        "name": "DRVEN1",
        "side": "L",
        "type": "Input",
        "desc": "非同步開關控制訊號（對應 OUT1/DAC1 路徑）"
      },
      {
        "num": "3",
        "name": "SDA",
        "side": "L",
        "type": "I/O",
        "desc": "I2C 雙向資料線；以 SPI 通訊時此腳須接 GND"
      },
      {
        "num": "4",
        "name": "SCL/{CS}",
        "side": "L",
        "type": "Input",
        "desc": "I2C：時脈輸入。SPI：低態動作序列資料致能（訊框同步訊號，低態時致能輸入移位暫存器）"
      },
      {
        "num": "5",
        "name": "A2/SCLK",
        "side": "L",
        "type": "Input",
        "desc": "I2C：目標位址選擇。SPI：時脈輸入"
      },
      {
        "num": "6",
        "name": "A1/SDI",
        "side": "L",
        "type": "Input",
        "desc": "I2C：目標位址選擇。SPI：資料輸入，於 SCLK 下降緣鎖入"
      },
      {
        "num": "7",
        "name": "A0/SDO",
        "side": "B",
        "type": "I/O",
        "desc": "I2C：目標位址選擇。SPI：資料輸出（須先設定 SDOEN 位元致能），於 SCLK 上升緣輸出"
      },
      {
        "num": "8",
        "name": "VIO",
        "side": "B",
        "type": "Power",
        "desc": "I/O 供電電源（1.65V~3.6V），設定數位 I/O 操作電壓"
      },
      {
        "num": "9",
        "name": "PA_ON",
        "side": "B",
        "type": "Output",
        "desc": "序時同步訊號，CMOS 輸出；元件未就緒或偵測到警報狀態時拉低"
      },
      {
        "num": "10",
        "name": "GND",
        "side": "B",
        "type": "Ground",
        "desc": "所有電路的接地參考點"
      },
      {
        "num": "11",
        "name": "OUT1",
        "side": "B",
        "type": "Output",
        "desc": "DAC1 開關輸出"
      },
      {
        "num": "12",
        "name": "DAC1",
        "side": "B",
        "type": "Output",
        "desc": "DAC1 緩衝輸出"
      },
      {
        "num": "13",
        "name": "CLAMP1",
        "side": "R",
        "type": "Output",
        "desc": "CLAMP1 緩衝輸出"
      },
      {
        "num": "14",
        "name": "DAC0",
        "side": "R",
        "type": "Output",
        "desc": "DAC0 緩衝輸出"
      },
      {
        "num": "15",
        "name": "VSS",
        "side": "R",
        "type": "Power",
        "desc": "輸出緩衝器負類比電源（–11V ~ 0V）"
      },
      {
        "num": "16",
        "name": "VCC",
        "side": "R",
        "type": "Power",
        "desc": "輸出緩衝器正類比電源（0V ~ 5.5V）"
      },
      {
        "num": "17",
        "name": "DAC3",
        "side": "R",
        "type": "Output",
        "desc": "DAC3 緩衝輸出"
      },
      {
        "num": "18",
        "name": "CLAMP2",
        "side": "R",
        "type": "Output",
        "desc": "CLAMP2 緩衝輸出"
      },
      {
        "num": "19",
        "name": "DAC2",
        "side": "T",
        "type": "Output",
        "desc": "DAC2 緩衝輸出"
      },
      {
        "num": "20",
        "name": "OUT2",
        "side": "T",
        "type": "Output",
        "desc": "DAC2 開關輸出"
      },
      {
        "num": "21",
        "name": "VDD",
        "side": "T",
        "type": "Power",
        "desc": "類比供電電源（4.5V~5.5V）"
      },
      {
        "num": "22",
        "name": "D+",
        "side": "T",
        "type": "Input",
        "desc": "遠端溫度感測器連接；未使用時需與 D– 短接在一起"
      },
      {
        "num": "23",
        "name": "D–",
        "side": "T",
        "type": "Input",
        "desc": "遠端溫度感測器連接（另一端）；未使用時需與 D+ 短接在一起"
      },
      {
        "num": "24",
        "name": "{RESET}/{ALMIN}",
        "side": "T",
        "type": "Input",
        "desc": "低態動作重置輸入；邏輯低態使元件執行重置，亦可設為低態動作警報輸入以觸發警報事件"
      },
      {
        "num": "25",
        "name": "Thermal Pad",
        "side": "B",
        "type": "Ground",
        "desc": "封裝底部散熱焊盤（Table 4-1 Thermal Pad 列）；建議以多顆過孔接至內部 PCB 接地層",
        "ep": true
      }
    ],
    "thermalPad": "封裝底部散熱焊盤（Table 4-1 明列 Thermal Pad 列）；以多顆過孔接至內部 PCB 接地層",
    "specs": [
      {
        "k": "DAC 解析度",
        "v": "13-bit，四組單調 DAC，解析度 1.22mV"
      },
      {
        "k": "輸出範圍",
        "v": "自動配置：正輸出最高 5.5V／負輸出最低 -10V"
      },
      {
        "k": "驅動能力",
        "v": "source 最高 100mA／sink 最高 20mA；可承受電容負載達 15µF"
      },
      {
        "k": "閘極偏壓開關",
        "v": "兩組可程式關斷電壓，快速響應"
      },
      {
        "k": "輔助 DAC",
        "v": "兩組（CLAMP1/2），解析度 1.22mV，切換時間典型 50ns，導通電阻最高 3Ω"
      },
      {
        "k": "溫度感測",
        "v": "本地與遠端二極體溫度感測，誤差 ±2.5°C（max），解析度 0.0625°C"
      },
      {
        "k": "EEPROM",
        "v": "內建，儲存四組獨立溫度-電壓轉換函數與元件設定，另留使用者儲存空間，額定 15 年資料保存"
      },
      {
        "k": "參考電壓",
        "v": "內建 2.5V"
      },
      {
        "k": "介面",
        "v": "SPI（4 線）與 I2C（8 組可選位址），操作電壓 1.7V~3.6V"
      },
      {
        "k": "溫度範圍",
        "v": "-55°C ~ 125°C"
      },
      {
        "k": "封裝",
        "v": "24-VQFN 4×4mm，含底部散熱焊盤"
      },
      {
        "k": "特殊規格",
        "v": "國防/太空應用規格：controlled baseline、單一組裝測試廠、單一晶圓廠、產品可追溯性、延長產品生命週期"
      }
    ],
    "secondSource": [],
    "dropIn": []
  },
  {
    "part": "ADS1278QML-SP",
    "mfr": "Texas Instruments",
    "category": "data-converters",
    "subcategory": "太空級 8 通道同步取樣 Δ-Σ ADC",
    "package": "84-Pin CFP (HFQ)",
    "whatIs": "抗輻射太空級 8 通道、24-bit Δ-Σ 類比數位轉換器：八通道同步取樣，資料率最高 128kSPS，TID RLAT 50krad(Si)、SEL 免疫至 LET 51MeV-cm²/mg（125°C），符合太空飛行等級篩選（QMLV），供衛星與太空平台的精密量測與感測應用。",
    "func": "八組 Δ-Σ 調變器同步取樣，內建線性相位數位濾波器（可旁路直接輸出調變器資料）；四種可選操作模式：High-Speed（128kSPS、106dB SNR）、High-Resolution（52kSPS、111dB SNR）、Low-Power（52kSPS、31mW/ch）、Low-Speed（10kSPS、7mW/ch）；SPI 或 Frame-Sync 序列介面輸出，各通道獨立 PWDN 電源關閉控制；類比供電 5V、數位核心 1.8V、I/O 供電 1.8~3.3V；低取樣孔徑誤差，chopper 穩定高階調變器架構。",
    "usedIn": "衛星/太空梭/太空站溫度與姿態感測、軌道觀測系統、太空精密與科學量測、高精度儀器儀表等輻射環境下的多通道同步取樣系統。",
    "desc": "太空級 8 通道 24-bit 同步取樣 Δ-Σ ADC，128kSPS、111dB SNR（High-Resolution 模式）、TID RLAT 50krad(Si)、SEL 免疫 51MeV-cm²/mg，SPI/Frame-Sync 介面，84-Pin CFP (HFQ)。",
    "datasheet": "TI SLVSKW2",
    "thermalPad": "無外露焊盤（84-pin CFP 陶瓷四邊扁平封裝）；散熱與安裝設計見 datasheet 機構章節",
    "pins": [
      {
        "num": "1",
        "name": "AINP2",
        "side": "L",
        "type": "Analog In",
        "desc": "AINP[8:1] 正端類比輸入，通道 2"
      },
      {
        "num": "2",
        "name": "AINN2",
        "side": "L",
        "type": "Analog In",
        "desc": "AINN[8:1] 負端類比輸入，通道 2"
      },
      {
        "num": "3",
        "name": "AGND",
        "side": "L",
        "type": "Ground",
        "desc": "類比接地；與 DGND 以單一接地平面相連"
      },
      {
        "num": "4",
        "name": "AINP1",
        "side": "L",
        "type": "Analog In",
        "desc": "AINP[8:1] 正端類比輸入，通道 1"
      },
      {
        "num": "5",
        "name": "AINN1",
        "side": "L",
        "type": "Analog In",
        "desc": "AINN[8:1] 負端類比輸入，通道 1"
      },
      {
        "num": "6",
        "name": "AGND",
        "side": "L",
        "type": "Ground",
        "desc": "類比接地；與 DGND 以單一接地平面相連"
      },
      {
        "num": "7",
        "name": "AVDD",
        "side": "L",
        "type": "Power",
        "desc": "類比電源供應（4.75V ~ 5V）"
      },
      {
        "num": "8",
        "name": "AVDD",
        "side": "L",
        "type": "Power",
        "desc": "類比電源供應（4.75V ~ 5V）"
      },
      {
        "num": "9",
        "name": "AGND",
        "side": "L",
        "type": "Ground",
        "desc": "類比接地；與 DGND 以單一接地平面相連"
      },
      {
        "num": "10",
        "name": "AGND",
        "side": "L",
        "type": "Ground",
        "desc": "類比接地；與 DGND 以單一接地平面相連"
      },
      {
        "num": "11",
        "name": "AGND",
        "side": "L",
        "type": "Ground",
        "desc": "類比接地；與 DGND 以單一接地平面相連"
      },
      {
        "num": "12",
        "name": "DGND",
        "side": "L",
        "type": "Ground",
        "desc": "數位接地電源"
      },
      {
        "num": "13",
        "name": "TEST0",
        "side": "L",
        "type": "Input",
        "desc": "TEST[1:0] 測試模式選擇：00=正常操作，11=測試模式，01/10=請勿使用"
      },
      {
        "num": "14",
        "name": "TEST1",
        "side": "L",
        "type": "Input",
        "desc": "TEST[1:0]，同 TEST0 說明"
      },
      {
        "num": "15",
        "name": "CLKDIV",
        "side": "L",
        "type": "Input",
        "desc": "CLK 輸入除頻控制：1=32.768MHz（僅 High-Speed 模式）/27MHz；0=13.5MHz（Low-Power）/5.4MHz（Low-Speed）"
      },
      {
        "num": "16",
        "name": "SYNC",
        "side": "L",
        "type": "Input",
        "desc": "同步輸入（所有通道）"
      },
      {
        "num": "17",
        "name": "DIN",
        "side": "L",
        "type": "Input",
        "desc": "菊鏈（daisy-chain）資料輸入"
      },
      {
        "num": "18",
        "name": "DOUT8",
        "side": "L",
        "type": "Output",
        "desc": "DOUT[8:1] 通道 8~1 資料輸出，通道 8"
      },
      {
        "num": "19",
        "name": "DOUT7",
        "side": "L",
        "type": "Output",
        "desc": "DOUT[8:1] 通道 8~1 資料輸出，通道 7"
      },
      {
        "num": "20",
        "name": "DOUT6",
        "side": "L",
        "type": "Output",
        "desc": "DOUT[8:1] 通道 8~1 資料輸出，通道 6"
      },
      {
        "num": "21",
        "name": "DOUT5",
        "side": "L",
        "type": "Output",
        "desc": "DOUT[8:1] 通道 8~1 資料輸出，通道 5"
      },
      {
        "num": "22",
        "name": "DOUT4",
        "side": "B",
        "type": "Output",
        "desc": "DOUT[8:1] 通道 8~1 資料輸出，通道 4"
      },
      {
        "num": "23",
        "name": "DOUT3",
        "side": "B",
        "type": "Output",
        "desc": "DOUT[8:1] 通道 8~1 資料輸出，通道 3"
      },
      {
        "num": "24",
        "name": "DOUT2",
        "side": "B",
        "type": "Output",
        "desc": "DOUT[8:1] 通道 8~1 資料輸出，通道 2"
      },
      {
        "num": "25",
        "name": "DOUT1",
        "side": "B",
        "type": "Output",
        "desc": "DOUT1 於 TDM 模式為 TDM 資料輸出；DOUT[8:1] 為通道 8~1 資料輸出"
      },
      {
        "num": "26",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地電源"
      },
      {
        "num": "27",
        "name": "IOVDD",
        "side": "B",
        "type": "Power",
        "desc": "I/O 電源（+1.65V ~ +3.6V）"
      },
      {
        "num": "28",
        "name": "IOVDD",
        "side": "B",
        "type": "Power",
        "desc": "I/O 電源（+1.65V ~ +3.6V）"
      },
      {
        "num": "29",
        "name": "IOVDD",
        "side": "B",
        "type": "Power",
        "desc": "I/O 電源（+1.65V ~ +3.6V）"
      },
      {
        "num": "30",
        "name": "IOVDD",
        "side": "B",
        "type": "Power",
        "desc": "I/O 電源（+1.65V ~ +3.6V）"
      },
      {
        "num": "31",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地電源"
      },
      {
        "num": "32",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地電源"
      },
      {
        "num": "33",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地電源"
      },
      {
        "num": "34",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地電源"
      },
      {
        "num": "35",
        "name": "DVDD",
        "side": "B",
        "type": "Power",
        "desc": "數位核心電源（+1.65V ~ +1.95V）"
      },
      {
        "num": "36",
        "name": "DVDD",
        "side": "B",
        "type": "Power",
        "desc": "數位核心電源（+1.65V ~ +1.95V）"
      },
      {
        "num": "37",
        "name": "CLK",
        "side": "B",
        "type": "Input",
        "desc": "時脈輸入"
      },
      {
        "num": "38",
        "name": "SCLK",
        "side": "B",
        "type": "I/O",
        "desc": "序列時脈輸入／調變器輸出模式時脈輸出"
      },
      {
        "num": "39",
        "name": "DRDY/FSYNC",
        "side": "B",
        "type": "I/O",
        "desc": "Frame-Sync 協定：框同步時脈輸入；SPI 協定：資料備妥（DRDY）輸出"
      },
      {
        "num": "40",
        "name": "FORMAT2",
        "side": "B",
        "type": "Input",
        "desc": "FORMAT[2:0]，同 FORMAT0 說明"
      },
      {
        "num": "41",
        "name": "FORMAT1",
        "side": "B",
        "type": "Input",
        "desc": "FORMAT[2:0]，同 FORMAT0 說明"
      },
      {
        "num": "42",
        "name": "FORMAT0",
        "side": "B",
        "type": "Input",
        "desc": "FORMAT[2:0] 選擇 Frame-Sync/SPI 協定、TDM/離散資料輸出、TDM 位置固定/動態、調變器輸出/正常操作模式"
      },
      {
        "num": "43",
        "name": "MODE1",
        "side": "R",
        "type": "Input",
        "desc": "MODE[1:0]，同 MODE0 說明"
      },
      {
        "num": "44",
        "name": "MODE0",
        "side": "R",
        "type": "Input",
        "desc": "MODE[1:0] 選擇 High-Speed／High-Resolution／Low-Power／Low-Speed 操作模式"
      },
      {
        "num": "45",
        "name": "PWDN8",
        "side": "R",
        "type": "Input",
        "desc": "PWDN[8:1] 通道 8~1 電源關閉控制，通道 8"
      },
      {
        "num": "46",
        "name": "PWDN7",
        "side": "R",
        "type": "Input",
        "desc": "PWDN[8:1] 通道 8~1 電源關閉控制，通道 7"
      },
      {
        "num": "47",
        "name": "PWDN6",
        "side": "R",
        "type": "Input",
        "desc": "PWDN[8:1] 通道 8~1 電源關閉控制，通道 6"
      },
      {
        "num": "48",
        "name": "PWDN5",
        "side": "R",
        "type": "Input",
        "desc": "PWDN[8:1] 通道 8~1 電源關閉控制，通道 5"
      },
      {
        "num": "49",
        "name": "PWDN4",
        "side": "R",
        "type": "Input",
        "desc": "PWDN[8:1] 通道 8~1 電源關閉控制，通道 4"
      },
      {
        "num": "50",
        "name": "PWDN3",
        "side": "R",
        "type": "Input",
        "desc": "PWDN[8:1] 通道 8~1 電源關閉控制，通道 3"
      },
      {
        "num": "51",
        "name": "PWDN2",
        "side": "R",
        "type": "Input",
        "desc": "PWDN[8:1] 通道 8~1 電源關閉控制，通道 2"
      },
      {
        "num": "52",
        "name": "PWDN1",
        "side": "R",
        "type": "Input",
        "desc": "PWDN[8:1] 通道 8~1 電源關閉控制，通道 1"
      },
      {
        "num": "53",
        "name": "AGND",
        "side": "R",
        "type": "Ground",
        "desc": "類比接地；與 DGND 以單一接地平面相連"
      },
      {
        "num": "54",
        "name": "AGND",
        "side": "R",
        "type": "Ground",
        "desc": "類比接地；與 DGND 以單一接地平面相連"
      },
      {
        "num": "55",
        "name": "AVDD",
        "side": "R",
        "type": "Power",
        "desc": "類比電源供應（4.75V ~ 5V）"
      },
      {
        "num": "56",
        "name": "AVDD",
        "side": "R",
        "type": "Power",
        "desc": "類比電源供應（4.75V ~ 5V）"
      },
      {
        "num": "57",
        "name": "AGND",
        "side": "R",
        "type": "Ground",
        "desc": "類比接地；與 DGND 以單一接地平面相連"
      },
      {
        "num": "58",
        "name": "AINP8",
        "side": "R",
        "type": "Analog In",
        "desc": "AINP[8:1] 正端類比輸入，通道 8"
      },
      {
        "num": "59",
        "name": "AINN8",
        "side": "R",
        "type": "Analog In",
        "desc": "AINN[8:1] 負端類比輸入，通道 8"
      },
      {
        "num": "60",
        "name": "AGND",
        "side": "R",
        "type": "Ground",
        "desc": "類比接地；與 DGND 以單一接地平面相連"
      },
      {
        "num": "61",
        "name": "AINP7",
        "side": "R",
        "type": "Analog In",
        "desc": "AINP[8:1] 正端類比輸入，通道 7"
      },
      {
        "num": "62",
        "name": "AINN7",
        "side": "R",
        "type": "Analog In",
        "desc": "AINN[8:1] 負端類比輸入，通道 7"
      },
      {
        "num": "63",
        "name": "AGND",
        "side": "R",
        "type": "Ground",
        "desc": "類比接地；與 DGND 以單一接地平面相連"
      },
      {
        "num": "64",
        "name": "AINP6",
        "side": "T",
        "type": "Analog In",
        "desc": "AINP[8:1] 正端類比輸入，通道 6"
      },
      {
        "num": "65",
        "name": "AINN6",
        "side": "T",
        "type": "Analog In",
        "desc": "AINN[8:1] 負端類比輸入，通道 6"
      },
      {
        "num": "66",
        "name": "AGND",
        "side": "T",
        "type": "Ground",
        "desc": "類比接地；與 DGND 以單一接地平面相連"
      },
      {
        "num": "67",
        "name": "AINP5",
        "side": "T",
        "type": "Analog In",
        "desc": "AINP[8:1] 正端類比輸入，通道 5"
      },
      {
        "num": "68",
        "name": "AINN5",
        "side": "T",
        "type": "Analog In",
        "desc": "AINN[8:1] 負端類比輸入，通道 5"
      },
      {
        "num": "69",
        "name": "AGND",
        "side": "T",
        "type": "Ground",
        "desc": "類比接地；與 DGND 以單一接地平面相連"
      },
      {
        "num": "70",
        "name": "AVDD",
        "side": "T",
        "type": "Power",
        "desc": "類比電源供應（4.75V ~ 5V）"
      },
      {
        "num": "71",
        "name": "AVDD",
        "side": "T",
        "type": "Power",
        "desc": "類比電源供應（4.75V ~ 5V）"
      },
      {
        "num": "72",
        "name": "AGND",
        "side": "T",
        "type": "Ground",
        "desc": "類比接地；與 DGND 以單一接地平面相連"
      },
      {
        "num": "73",
        "name": "VCOM",
        "side": "T",
        "type": "Analog Out",
        "desc": "AVDD/2 無緩衝電壓輸出"
      },
      {
        "num": "74",
        "name": "VREFP",
        "side": "T",
        "type": "Analog In",
        "desc": "正端參考電壓輸入"
      },
      {
        "num": "75",
        "name": "VREFN",
        "side": "T",
        "type": "Analog In",
        "desc": "負端參考電壓輸入"
      },
      {
        "num": "76",
        "name": "AGND",
        "side": "T",
        "type": "Ground",
        "desc": "類比接地；與 DGND 以單一接地平面相連"
      },
      {
        "num": "77",
        "name": "AGND",
        "side": "T",
        "type": "Ground",
        "desc": "類比接地；與 DGND 以單一接地平面相連"
      },
      {
        "num": "78",
        "name": "AVDD",
        "side": "T",
        "type": "Power",
        "desc": "類比電源供應（4.75V ~ 5V）"
      },
      {
        "num": "79",
        "name": "AVDD",
        "side": "T",
        "type": "Power",
        "desc": "類比電源供應（4.75V ~ 5V）"
      },
      {
        "num": "80",
        "name": "AINP4",
        "side": "T",
        "type": "Analog In",
        "desc": "AINP[8:1] 正端類比輸入，通道 4"
      },
      {
        "num": "81",
        "name": "AINN4",
        "side": "T",
        "type": "Analog In",
        "desc": "AINN[8:1] 負端類比輸入，通道 4"
      },
      {
        "num": "82",
        "name": "AGND",
        "side": "T",
        "type": "Ground",
        "desc": "類比接地；與 DGND 以單一接地平面相連"
      },
      {
        "num": "83",
        "name": "AINP3",
        "side": "T",
        "type": "Analog In",
        "desc": "AINP[8:1] 正端類比輸入，通道 3"
      },
      {
        "num": "84",
        "name": "AINN3",
        "side": "T",
        "type": "Analog In",
        "desc": "AINN[8:1] 負端類比輸入，通道 3"
      }
    ],
    "specs": [
      {
        "k": "輻射耐受",
        "v": "TID RLAT 50krad(Si)；SEL 免疫至 LET 51MeV-cm²/mg @125°C"
      },
      {
        "k": "元件等級",
        "v": "5962L2521001VXC：Flight Grade 50krad(Si)，−55°C~125°C；5962L2521002VXC：Flight Grade 50krad(Si)，−55°C~115°C"
      },
      {
        "k": "解析度/通道",
        "v": "24-bit、8 通道同步取樣"
      },
      {
        "k": "資料率",
        "v": "最高 128kSPS（High-Speed 模式）"
      },
      {
        "k": "AC 效能",
        "v": "63kHz 頻寬、111dB SNR（High-Resolution 模式）、THD −108dB"
      },
      {
        "k": "DC 效能",
        "v": "Offset drift 0.8μV/°C；Gain drift 1.3ppm/°C"
      },
      {
        "k": "操作模式",
        "v": "High-Speed 128kSPS/106dB SNR；High-Resolution 52kSPS/111dB SNR；Low-Power 52kSPS/31mW/ch；Low-Speed 10kSPS/7mW/ch"
      },
      {
        "k": "介面",
        "v": "SPI 或 Frame-Sync 序列介面；線性相位數位濾波器，可旁路直接輸出調變器資料"
      },
      {
        "k": "電源",
        "v": "AVDD 5V；DVDD 1.8V；IOVDD 1.8V~3.3V"
      },
      {
        "k": "封裝",
        "v": "84-Pin CFP (HFQ)，重量 4.46g（±10%）"
      }
    ],
    "secondSource": [],
    "dropIn": []
  },
  {
    "part": "DAC39RF10-SP",
    "mfr": "Texas Instruments",
    "category": "data-converters",
    "subcategory": "太空級雙通道 16-bit RF DAC（JESD204C）",
    "package": "256-Ball FCBGA (ACL) 17×17mm, 1mm pitch",
    "whatIs": "抗輻射太空級雙通道 16-bit 多奈奎斯特（multi-Nyquist）數位類比轉換器：最高 10.4GSPS/通道（雙通道）或 20.8GSPS（單通道 DES 模式），JESD204C 高速序列介面，供衛星通訊、寬頻高速訊號產生與相位陣列天線等太空平台應用。",
    "func": "雙通道 16-bit DAC 核心，可作非內插或內插 DAC 用於直接 RF 取樣或複數基頻訊號產生；內建 4 組數位上變頻器（DUC），內插倍率 1x~256x，支援複數基頻 I/Q 輸出與雙通道直接 RF 取樣之複數轉實數上變頻；64-bit NCO 頻率解析度，支援相位連續跳頻；JESD204C 介面最高 16 組通道對、單通道最高 12.8Gbps，Class C-S subclass-1 相容，內建交流耦合電容；SYSREF windowing 自動校正 SYSREF 時序。",
    "usedIn": "衛星通訊（SATCOM）、寬頻高速資料傳輸、時脈/本地振盪器（LO）RF 合成、相位陣列天線系統、合成孔徑雷達（SAR）激勵源、頻譜量測等太空平台高速訊號產生應用。",
    "desc": "太空級雙通道 16-bit multi-Nyquist DAC，10.4GSPS/ch（雙通道）或 20.8GSPS（單通道 DES），JESD204C 最高 16 lane @12.8Gbps，SEL 120MeV-cm²/mg、TID RLAT 300krad(Si)，256-Ball FCBGA 17×17mm 1mm pitch。",
    "datasheet": "TI SBAS932A",
    "thermalPad": "無外露焊盤（256-ball FCBGA，散熱經球陣列與基板）；熱設計見 datasheet",
    "pins": [
      {
        "num": "A13",
        "name": "DACOUTA-",
        "side": "R",
        "type": "Analog Out",
        "desc": "DAC 通道 A 類比輸出負端；輸出電壓須符合 DAC 相容電壓範圍以維持指標效能"
      },
      {
        "num": "A12",
        "name": "DACOUTA+",
        "side": "R",
        "type": "Analog Out",
        "desc": "DAC 通道 A 類比輸出正端；輸出電壓須符合 DAC 相容電壓範圍以維持指標效能"
      },
      {
        "num": "T13",
        "name": "DACOUTB-",
        "side": "R",
        "type": "Analog Out",
        "desc": "DAC 通道 B 類比輸出負端；輸出電壓須符合 DAC 相容電壓範圍以維持指標效能。單通道版本（RFS10）不可用"
      },
      {
        "num": "T12",
        "name": "DACOUTB+",
        "side": "R",
        "type": "Analog Out",
        "desc": "DAC 通道 B 類比輸出正端；輸出電壓須符合 DAC 相容電壓範圍以維持指標效能。單通道版本（RFS10）不可用"
      },
      {
        "num": "E16",
        "name": "CLK-",
        "side": "L",
        "type": "Input",
        "desc": "元件時脈輸入負端；CLK+/CLK− 間內建 100Ω 差動端接，自偏壓，須交流耦合至時脈源"
      },
      {
        "num": "D16",
        "name": "CLK+",
        "side": "L",
        "type": "Input",
        "desc": "元件時脈輸入正端；CLK+/CLK− 間內建 100Ω 差動端接，自偏壓，須交流耦合至時脈源"
      },
      {
        "num": "N16",
        "name": "SYSREF-",
        "side": "L",
        "type": "Input",
        "desc": "差動 JESD204C SYSREF 輸入負端；SYSREF+/SYSREF− 間內建 100Ω 差動端接"
      },
      {
        "num": "M16",
        "name": "SYSREF+",
        "side": "L",
        "type": "Input",
        "desc": "差動 JESD204C SYSREF 輸入正端；SYSREF+/SYSREF− 間內建 100Ω 差動端接"
      },
      {
        "num": "A7",
        "name": "0SRX-",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 0 負端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 0SRX+"
      },
      {
        "num": "A8",
        "name": "0SRX+",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 0 正端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 0SRX-"
      },
      {
        "num": "B7",
        "name": "1SRX-",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 1 負端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 1SRX+"
      },
      {
        "num": "B8",
        "name": "1SRX+",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 1 正端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 1SRX-"
      },
      {
        "num": "A4",
        "name": "2SRX-",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 2 負端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 2SRX+"
      },
      {
        "num": "A5",
        "name": "2SRX+",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 2 正端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 2SRX-"
      },
      {
        "num": "B4",
        "name": "3SRX-",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 3 負端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 3SRX+"
      },
      {
        "num": "B5",
        "name": "3SRX+",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 3 正端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 3SRX-"
      },
      {
        "num": "D1",
        "name": "4SRX-",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 4 負端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 4SRX+"
      },
      {
        "num": "C1",
        "name": "4SRX+",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 4 正端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 4SRX-"
      },
      {
        "num": "D2",
        "name": "5SRX-",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 5 負端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 5SRX+"
      },
      {
        "num": "C2",
        "name": "5SRX+",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 5 正端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 5SRX-"
      },
      {
        "num": "G1",
        "name": "6SRX-",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 6 負端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 6SRX+"
      },
      {
        "num": "F1",
        "name": "6SRX+",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 6 正端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 6SRX-"
      },
      {
        "num": "G2",
        "name": "7SRX-",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 7 負端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 7SRX+"
      },
      {
        "num": "F2",
        "name": "7SRX+",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 7 正端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 7SRX-"
      },
      {
        "num": "T8",
        "name": "8SRX-",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 8 負端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 8SRX+"
      },
      {
        "num": "T7",
        "name": "8SRX+",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 8 正端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 8SRX-"
      },
      {
        "num": "R8",
        "name": "9SRX-",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 9 負端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 9SRX+"
      },
      {
        "num": "R7",
        "name": "9SRX+",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 9 正端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 9SRX-"
      },
      {
        "num": "T5",
        "name": "10SRX-",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 10 負端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 10SRX+"
      },
      {
        "num": "T4",
        "name": "10SRX+",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 10 正端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 10SRX-"
      },
      {
        "num": "R5",
        "name": "11SRX-",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 11 負端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 11SRX+"
      },
      {
        "num": "R4",
        "name": "11SRX+",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 11 正端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 11SRX-"
      },
      {
        "num": "P1",
        "name": "12SRX-",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 12 負端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 12SRX+"
      },
      {
        "num": "N1",
        "name": "12SRX+",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 12 正端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 12SRX-"
      },
      {
        "num": "P2",
        "name": "13SRX-",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 13 負端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 13SRX+"
      },
      {
        "num": "N2",
        "name": "13SRX+",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 13 正端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 13SRX-"
      },
      {
        "num": "L1",
        "name": "14SRX-",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 14 負端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 14SRX+"
      },
      {
        "num": "K1",
        "name": "14SRX+",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 14 正端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 14SRX-"
      },
      {
        "num": "L2",
        "name": "15SRX-",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 15 負端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 15SRX+"
      },
      {
        "num": "K2",
        "name": "15SRX+",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 15 正端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 15SRX-"
      },
      {
        "num": "H4",
        "name": "ALARM",
        "side": "R",
        "type": "Output",
        "desc": "警示輸出：偵測到內部未遮罩告警時動作，告警遮罩由 ALM_MASK 暫存器設定"
      },
      {
        "num": "F4",
        "name": "FRCLK",
        "side": "L",
        "type": "Input",
        "desc": "快速重組態（Fast Reconfiguration）介面時脈"
      },
      {
        "num": "G4",
        "name": "FRCS",
        "side": "L",
        "type": "Input",
        "desc": "快速重組態介面晶片選擇；內建上拉"
      },
      {
        "num": "E4",
        "name": "FRDI0",
        "side": "L",
        "type": "Input",
        "desc": "快速重組態介面資料位元 0"
      },
      {
        "num": "E5",
        "name": "FRDI1",
        "side": "L",
        "type": "Input",
        "desc": "快速重組態介面資料位元 1"
      },
      {
        "num": "F5",
        "name": "FRDI2",
        "side": "L",
        "type": "Input",
        "desc": "快速重組態介面資料位元 2"
      },
      {
        "num": "G5",
        "name": "FRDI3",
        "side": "L",
        "type": "Input",
        "desc": "快速重組態介面資料位元 3"
      },
      {
        "num": "D6",
        "name": "{RESET}",
        "side": "L",
        "type": "Input",
        "desc": "元件重置輸入，active-low；上電後須切換一次；內建上拉"
      },
      {
        "num": "E6",
        "name": "SCANEN",
        "side": "L",
        "type": "Input",
        "desc": "TI 內部測試用腳，可懸空不接；內建下拉"
      },
      {
        "num": "E8",
        "name": "SCLK",
        "side": "L",
        "type": "Input",
        "desc": "序列程式介面（SPI）時脈輸入"
      },
      {
        "num": "E7",
        "name": "{SCS}",
        "side": "L",
        "type": "Input",
        "desc": "序列程式介面（SPI）晶片選擇輸入，active-low；內建上拉"
      },
      {
        "num": "D8",
        "name": "SDI",
        "side": "L",
        "type": "Input",
        "desc": "序列程式介面（SPI）資料輸入"
      },
      {
        "num": "D7",
        "name": "SDO",
        "side": "R",
        "type": "Output",
        "desc": "序列程式介面（SPI）資料輸出；未讀取 SPI 資料時為高阻抗"
      },
      {
        "num": "J4",
        "name": "{SYNC}",
        "side": "R",
        "type": "Output",
        "desc": "JESD204C SYNC 輸出，active-low"
      },
      {
        "num": "D5",
        "name": "TXEN0",
        "side": "L",
        "type": "Input",
        "desc": "通道 A 傳輸致能，高電位動作；須由 USE_TX_EN0 暫存器致能，停用時 DAC 輸出強制為中碼 0x0000（2補數）；內建上拉"
      },
      {
        "num": "D4",
        "name": "TXEN1",
        "side": "L",
        "type": "Input",
        "desc": "通道 B 傳輸致能，高電位動作；須由 USE_TX_EN1 暫存器致能，停用時 DAC 輸出強制為中碼 0x0000（2補數）；內建上拉"
      },
      {
        "num": "N6",
        "name": "ATEST",
        "side": "R",
        "type": "Output",
        "desc": "TI 用類比測試腳，須保持不連接"
      },
      {
        "num": "J15",
        "name": "EXTREF",
        "side": "L",
        "type": "I/O",
        "desc": "參考電壓輸出或輸入，由 EXTREF_EN 暫存器欄位決定；若使用內部參考，須經 0.1μF 電容接至 AGND"
      },
      {
        "num": "H16",
        "name": "RBIAS-",
        "side": "R",
        "type": "Output",
        "desc": "滿刻度輸出電流偏壓：由本腳至 RBIAS+ 間所接電阻設定"
      },
      {
        "num": "J16",
        "name": "RBIAS+",
        "side": "R",
        "type": "Output",
        "desc": "滿刻度輸出電流偏壓：由本腳至 RBIAS− 間所接電阻設定"
      },
      {
        "num": "M5",
        "name": "RTEST",
        "side": "R",
        "type": "Output",
        "desc": "TI 專用腳，須接至 AGND"
      },
      {
        "num": "G14",
        "name": "VDDA18A",
        "side": "T",
        "type": "Power",
        "desc": "DAC 通道 A 類比 1.8V 電源；可與 VDDA18B 併接，但會劣化通道間串擾（XTALK）"
      },
      {
        "num": "H14",
        "name": "VDDA18A",
        "side": "T",
        "type": "Power",
        "desc": "DAC 通道 A 類比 1.8V 電源；可與 VDDA18B 併接，但會劣化通道間串擾（XTALK）"
      },
      {
        "num": "J14",
        "name": "VDDA18B",
        "side": "T",
        "type": "Power",
        "desc": "DAC 通道 B 類比 1.8V 電源；可與 VDDA18A 併接，但會劣化通道間串擾（XTALK）"
      },
      {
        "num": "K14",
        "name": "VDDA18B",
        "side": "T",
        "type": "Power",
        "desc": "DAC 通道 B 類比 1.8V 電源；可與 VDDA18A 併接，但會劣化通道間串擾（XTALK）"
      },
      {
        "num": "F11",
        "name": "VDDCLK10",
        "side": "T",
        "type": "Power",
        "desc": "內部取樣時脈分佈路徑 1V 電源；雜訊或突波會劣化相位雜訊效能，建議與 VDDDIG、VDDA 分離"
      },
      {
        "num": "H11",
        "name": "VDDCLK10",
        "side": "T",
        "type": "Power",
        "desc": "內部取樣時脈分佈路徑 1V 電源；雜訊或突波會劣化相位雜訊效能，建議與 VDDDIG、VDDA 分離"
      },
      {
        "num": "J11",
        "name": "VDDCLK10",
        "side": "T",
        "type": "Power",
        "desc": "內部取樣時脈分佈路徑 1V 電源；雜訊或突波會劣化相位雜訊效能，建議與 VDDDIG、VDDA 分離"
      },
      {
        "num": "L11",
        "name": "VDDCLK10",
        "side": "T",
        "type": "Power",
        "desc": "內部取樣時脈分佈路徑 1V 電源；雜訊或突波會劣化相位雜訊效能，建議與 VDDDIG、VDDA 分離"
      },
      {
        "num": "E12",
        "name": "VDDCLK10",
        "side": "T",
        "type": "Power",
        "desc": "內部取樣時脈分佈路徑 1V 電源；雜訊或突波會劣化相位雜訊效能，建議與 VDDDIG、VDDA 分離"
      },
      {
        "num": "M12",
        "name": "VDDCLK10",
        "side": "T",
        "type": "Power",
        "desc": "內部取樣時脈分佈路徑 1V 電源；雜訊或突波會劣化相位雜訊效能，建議與 VDDDIG、VDDA 分離"
      },
      {
        "num": "H12",
        "name": "VDDCLK18",
        "side": "T",
        "type": "Power",
        "desc": "時脈（CLK+/CLK−）輸入緩衝器 1.8V 電源；雜訊或突波會劣化相位雜訊效能"
      },
      {
        "num": "H13",
        "name": "VDDCLK18",
        "side": "T",
        "type": "Power",
        "desc": "時脈（CLK+/CLK−）輸入緩衝器 1.8V 電源；雜訊或突波會劣化相位雜訊效能"
      },
      {
        "num": "F7",
        "name": "VDDDIG",
        "side": "T",
        "type": "Power",
        "desc": "數位區塊 1V 電源；建議與 VDDA、VDDCLK 分離以取得最佳效能"
      },
      {
        "num": "H7",
        "name": "VDDDIG",
        "side": "T",
        "type": "Power",
        "desc": "數位區塊 1V 電源；建議與 VDDA、VDDCLK 分離以取得最佳效能"
      },
      {
        "num": "J7",
        "name": "VDDDIG",
        "side": "T",
        "type": "Power",
        "desc": "數位區塊 1V 電源；建議與 VDDA、VDDCLK 分離以取得最佳效能"
      },
      {
        "num": "L7",
        "name": "VDDDIG",
        "side": "T",
        "type": "Power",
        "desc": "數位區塊 1V 電源；建議與 VDDA、VDDCLK 分離以取得最佳效能"
      },
      {
        "num": "N7",
        "name": "VDDDIG",
        "side": "T",
        "type": "Power",
        "desc": "數位區塊 1V 電源；建議與 VDDA、VDDCLK 分離以取得最佳效能"
      },
      {
        "num": "G8",
        "name": "VDDDIG",
        "side": "T",
        "type": "Power",
        "desc": "數位區塊 1V 電源；建議與 VDDA、VDDCLK 分離以取得最佳效能"
      },
      {
        "num": "K8",
        "name": "VDDDIG",
        "side": "T",
        "type": "Power",
        "desc": "數位區塊 1V 電源；建議與 VDDA、VDDCLK 分離以取得最佳效能"
      },
      {
        "num": "M8",
        "name": "VDDDIG",
        "side": "T",
        "type": "Power",
        "desc": "數位區塊 1V 電源；建議與 VDDA、VDDCLK 分離以取得最佳效能"
      },
      {
        "num": "F8",
        "name": "VDDEA",
        "side": "T",
        "type": "Power",
        "desc": "通道 A DAC 編碼器 1V 電源；建議與 VDDDIG 分離，可與 VDDEB 併接"
      },
      {
        "num": "F9",
        "name": "VDDEA",
        "side": "T",
        "type": "Power",
        "desc": "通道 A DAC 編碼器 1V 電源；建議與 VDDDIG 分離，可與 VDDEB 併接"
      },
      {
        "num": "L8",
        "name": "VDDEB",
        "side": "T",
        "type": "Power",
        "desc": "通道 B DAC 編碼器 1V 電源；建議與 VDDDIG 分離，可與 VDDEA 併接"
      },
      {
        "num": "L9",
        "name": "VDDEB",
        "side": "T",
        "type": "Power",
        "desc": "通道 B DAC 編碼器 1V 電源；建議與 VDDDIG 分離，可與 VDDEA 併接"
      },
      {
        "num": "D9",
        "name": "VDDIO",
        "side": "T",
        "type": "Power",
        "desc": "CMOS 輸出入端子 1.8V 電源"
      },
      {
        "num": "E9",
        "name": "VDDIO",
        "side": "T",
        "type": "Power",
        "desc": "CMOS 輸出入端子 1.8V 電源"
      },
      {
        "num": "F10",
        "name": "VDDLA",
        "side": "T",
        "type": "Power",
        "desc": "通道 A DAC 類比閂鎖 1V 電源；與 VDDLB、VDDDIG 分離以取得最佳通道間串擾與整體效能"
      },
      {
        "num": "H10",
        "name": "VDDLA",
        "side": "T",
        "type": "Power",
        "desc": "通道 A DAC 類比閂鎖 1V 電源；與 VDDLB、VDDDIG 分離以取得最佳通道間串擾與整體效能"
      },
      {
        "num": "J10",
        "name": "VDDLB",
        "side": "T",
        "type": "Power",
        "desc": "通道 B DAC 類比閂鎖 1V 電源；與 VDDLA、VDDDIG 分離以取得最佳通道間串擾與整體效能"
      },
      {
        "num": "L10",
        "name": "VDDLB",
        "side": "T",
        "type": "Power",
        "desc": "通道 B DAC 類比閂鎖 1V 電源；與 VDDLA、VDDDIG 分離以取得最佳通道間串擾與整體效能"
      },
      {
        "num": "K4",
        "name": "VDDR18",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 接收器 1.8V 電源"
      },
      {
        "num": "L4",
        "name": "VDDR18",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 接收器 1.8V 電源"
      },
      {
        "num": "M4",
        "name": "VDDR18",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 接收器 1.8V 電源"
      },
      {
        "num": "N4",
        "name": "VDDR18",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 接收器 1.8V 電源"
      },
      {
        "num": "J12",
        "name": "VDDSYS18",
        "side": "T",
        "type": "Power",
        "desc": "SYSREF（SYSREF+/SYSREF−）輸入緩衝器 1.8V 電源；SYSREF 停用時可與 VDDCLK18 併接，持續運作時須分離以避免雜訊耦合並降低相位雜訊劣化"
      },
      {
        "num": "J13",
        "name": "VDDSYS18",
        "side": "T",
        "type": "Power",
        "desc": "SYSREF（SYSREF+/SYSREF−）輸入緩衝器 1.8V 電源；SYSREF 停用時可與 VDDCLK18 併接，持續運作時須分離以避免雜訊耦合並降低相位雜訊劣化"
      },
      {
        "num": "C3",
        "name": "VDDT",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 端接 1V 電源"
      },
      {
        "num": "D3",
        "name": "VDDT",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 端接 1V 電源"
      },
      {
        "num": "F3",
        "name": "VDDT",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 端接 1V 電源"
      },
      {
        "num": "G3",
        "name": "VDDT",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 端接 1V 電源"
      },
      {
        "num": "K3",
        "name": "VDDT",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 端接 1V 電源"
      },
      {
        "num": "L3",
        "name": "VDDT",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 端接 1V 電源"
      },
      {
        "num": "N3",
        "name": "VDDT",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 端接 1V 電源"
      },
      {
        "num": "P3",
        "name": "VDDT",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 端接 1V 電源"
      },
      {
        "num": "C4",
        "name": "VDDT",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 端接 1V 電源"
      },
      {
        "num": "P4",
        "name": "VDDT",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 端接 1V 電源"
      },
      {
        "num": "C5",
        "name": "VDDT",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 端接 1V 電源"
      },
      {
        "num": "H5",
        "name": "VDDT",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 端接 1V 電源"
      },
      {
        "num": "J5",
        "name": "VDDT",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 端接 1V 電源"
      },
      {
        "num": "P5",
        "name": "VDDT",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 端接 1V 電源"
      },
      {
        "num": "G6",
        "name": "VDDT",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 端接 1V 電源"
      },
      {
        "num": "K6",
        "name": "VDDT",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 端接 1V 電源"
      },
      {
        "num": "M6",
        "name": "VDDT",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 端接 1V 電源"
      },
      {
        "num": "C7",
        "name": "VDDT",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 端接 1V 電源"
      },
      {
        "num": "P7",
        "name": "VDDT",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 端接 1V 電源"
      },
      {
        "num": "C8",
        "name": "VDDT",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 端接 1V 電源"
      },
      {
        "num": "P8",
        "name": "VDDT",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 端接 1V 電源"
      },
      {
        "num": "C11",
        "name": "VEEAM18",
        "side": "T",
        "type": "Power",
        "desc": "通道 A DAC 電流源偏壓 −1.8V 電源；可與 VEEBM18 併接，但會劣化通道間串擾（XTALK）"
      },
      {
        "num": "D11",
        "name": "VEEAM18",
        "side": "T",
        "type": "Power",
        "desc": "通道 A DAC 電流源偏壓 −1.8V 電源；可與 VEEBM18 併接，但會劣化通道間串擾（XTALK）"
      },
      {
        "num": "C12",
        "name": "VEEAM18",
        "side": "T",
        "type": "Power",
        "desc": "通道 A DAC 電流源偏壓 −1.8V 電源；可與 VEEBM18 併接，但會劣化通道間串擾（XTALK）"
      },
      {
        "num": "D12",
        "name": "VEEAM18",
        "side": "T",
        "type": "Power",
        "desc": "通道 A DAC 電流源偏壓 −1.8V 電源；可與 VEEBM18 併接，但會劣化通道間串擾（XTALK）"
      },
      {
        "num": "C13",
        "name": "VEEAM18",
        "side": "T",
        "type": "Power",
        "desc": "通道 A DAC 電流源偏壓 −1.8V 電源；可與 VEEBM18 併接，但會劣化通道間串擾（XTALK）"
      },
      {
        "num": "D13",
        "name": "VEEAM18",
        "side": "T",
        "type": "Power",
        "desc": "通道 A DAC 電流源偏壓 −1.8V 電源；可與 VEEBM18 併接，但會劣化通道間串擾（XTALK）"
      },
      {
        "num": "N11",
        "name": "VEEBM18",
        "side": "T",
        "type": "Power",
        "desc": "通道 B DAC 電流源偏壓 −1.8V 電源；可與 VEEAM18 併接，但會劣化通道間串擾（XTALK）"
      },
      {
        "num": "P11",
        "name": "VEEBM18",
        "side": "T",
        "type": "Power",
        "desc": "通道 B DAC 電流源偏壓 −1.8V 電源；可與 VEEAM18 併接，但會劣化通道間串擾（XTALK）"
      },
      {
        "num": "N12",
        "name": "VEEBM18",
        "side": "T",
        "type": "Power",
        "desc": "通道 B DAC 電流源偏壓 −1.8V 電源；可與 VEEAM18 併接，但會劣化通道間串擾（XTALK）"
      },
      {
        "num": "P12",
        "name": "VEEBM18",
        "side": "T",
        "type": "Power",
        "desc": "通道 B DAC 電流源偏壓 −1.8V 電源；可與 VEEAM18 併接，但會劣化通道間串擾（XTALK）"
      },
      {
        "num": "N13",
        "name": "VEEBM18",
        "side": "T",
        "type": "Power",
        "desc": "通道 B DAC 電流源偏壓 −1.8V 電源；可與 VEEAM18 併接，但會劣化通道間串擾（XTALK）"
      },
      {
        "num": "P13",
        "name": "VEEBM18",
        "side": "T",
        "type": "Power",
        "desc": "通道 B DAC 電流源偏壓 −1.8V 電源；可與 VEEAM18 併接，但會劣化通道間串擾（XTALK）"
      },
      {
        "num": "N9",
        "name": "VQPS",
        "side": "T",
        "type": "Power",
        "desc": "TI 專用腳，正常操作時可接至 DGND"
      },
      {
        "num": "P9",
        "name": "VQPS",
        "side": "T",
        "type": "Power",
        "desc": "TI 專用腳，正常操作時可接至 DGND"
      },
      {
        "num": "A10",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "B10",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "C10",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "D10",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "N10",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "P10",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "R10",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "T10",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "A11",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "B11",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "R11",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "T11",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "B12",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "R12",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "B13",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "G13",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "K13",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "R13",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "A14",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "B14",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "C14",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "D14",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "N14",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "P14",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "R14",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "T14",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "G15",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "H15",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "K15",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "G16",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "K16",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "A1",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "B1",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "E1",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "H1",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "J1",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "M1",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "R1",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "T1",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "A2",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "B2",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "E2",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "H2",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "J2",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "M2",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "R2",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "T2",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "A3",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "B3",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "E3",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "H3",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "J3",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "M3",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "R3",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "T3",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "K5",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "L5",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "N5",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "A6",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "B6",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "C6",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "F6",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "H6",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "J6",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "L6",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "P6",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "R6",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "T6",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "G7",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "K7",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "M7",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "H8",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "J8",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "N8",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "A9",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "B9",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "C9",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "G9",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "H9",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "J9",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "K9",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "M9",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "R9",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "T9",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "E10",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "G10",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "K10",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "M10",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "E11",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "G11",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "K11",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "M11",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "F12",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "G12",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "K12",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "L12",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "E13",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "F13",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "L13",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "M13",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "E14",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "F14",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "L14",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "M14",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "A15",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "B15",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "C15",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "D15",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "E15",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "F15",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "L15",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "M15",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "N15",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "P15",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "R15",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "T15",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "A16",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "B16",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "C16",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "F16",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "L16",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "P16",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "R16",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "T16",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      }
    ],
    "specs": [
      {
        "k": "輻射耐受（-SP）",
        "v": "SEU 免疫暫存器；SEL 120MeV-cm²/mg；TID RLAT 300krad(Si)"
      },
      {
        "k": "輻射耐受（-SEP，未建檔，僅供對照）",
        "v": "見 datasheet：SEU 免疫暫存器；SEL 43MeV-cm²/mg；TID RLAT 30krad(Si)"
      },
      {
        "k": "解析度/取樣率",
        "v": "16-bit，10.4 或 20.8GSPS multi-Nyquist DAC 核心"
      },
      {
        "k": "最大輸入資料率",
        "v": "單通道 DES：8-bit 20.8GSPS／12-bit 15.5GSPS／16-bit 10.4GSPS；雙通道：8-bit 10.4GSPS／12-bit 7.75GSPS/ch／16-bit 6.2GSPS/ch"
      },
      {
        "k": "輸出頻寬",
        "v": "−3dB 12GHz"
      },
      {
        "k": "AC 效能（fOUT=2.997GHz，DES2XL，DEM/Dither off）",
        "v": "雜訊底床 −155dBFS/Hz；SFDR(−0.1dBFS) 60dBc；IMD3(−7dBFS/tone) −62dBc；附加相位雜訊 −138dBc/Hz@10kHz offset"
      },
      {
        "k": "數位上變頻",
        "v": "4 組 DUC，內插 1x/2x/3x/4x/6x/8x/12x...256x；64-bit NCO 頻率解析度"
      },
      {
        "k": "JESD204C 介面",
        "v": "最高 16 lane，單 lane 最高 12.8Gbps；Class C-S subclass-1；內建 AC 耦合電容"
      },
      {
        "k": "太空篩選",
        "v": "符合 ASTM E595 除氣規範；單一晶圓製造/組裝/測試廠；晶圓批次可追溯；延長產品生命週期；RLAT；-SP 版另含 production burn-in"
      },
      {
        "k": "料號/等級",
        "v": "DAC39RF10ACL-MLS：Flight grade Space-MLS(-SP)，300krad(Si)；DAC39RF10ACLNSP：Space Enhanced(-SEP)，30krad(Si)（見 datasheet）"
      },
      {
        "k": "封裝",
        "v": "256-Ball FCBGA (ACL)，17mm×17mm，1mm pitch"
      }
    ],
    "secondSource": [],
    "dropIn": [
      {
        "part": "DAC39RFS10-SP",
        "note": "同一份 datasheet（TI SBAS932A）、Table 5-1 共用同一份 256-ball FCBGA pinout（球號、球名逐一相同）；RFS10 為單通道版本，DACOUTB+/DACOUTB−（球 T12/T13）依 datasheet 明載 \"Not available in single channel devices\"。通道 B 相關電源腳（VDDA18B/VDDLB/VDDEB/VEEBM18/TXEN1 等）datasheet 未明文排除，是否於單通道版停用/懸空須查閱完整 datasheet 或洽 TI 確認。"
      }
    ]
  },
  {
    "part": "DAC39RFS10-SP",
    "mfr": "Texas Instruments",
    "category": "data-converters",
    "subcategory": "太空級單通道 16-bit RF DAC（JESD204C）",
    "package": "256-Ball FCBGA (ACL) 17×17mm, 1mm pitch",
    "whatIs": "抗輻射太空級單通道 16-bit 多奈奎斯特（multi-Nyquist）數位類比轉換器：單通道最高 20.8GSPS（DES 模式），JESD204C 高速序列介面，與雙通道版 DAC39RF10-SP 共用同一顆晶片/封裝與 datasheet，供衛星通訊、寬頻高速訊號產生與相位陣列天線等太空平台應用（通道 B 相關輸出不可用）。",
    "func": "單通道 16-bit DAC 核心，可作非內插或內插 DAC 用於直接 RF 取樣或複數基頻訊號產生；內建數位上變頻器（DUC），內插倍率 1x~256x，支援複數基頻 I/Q 輸出；64-bit NCO 頻率解析度，支援相位連續跳頻；JESD204C 介面最高 16 組通道對、單通道最高 12.8Gbps，Class C-S subclass-1 相容，內建交流耦合電容；SYSREF windowing 自動校正 SYSREF 時序；DACOUTB+/DACOUTB− 於本單通道版本不可用。",
    "usedIn": "衛星通訊（SATCOM）、寬頻高速資料傳輸、時脈/本地振盪器（LO）RF 合成、相位陣列天線系統、合成孔徑雷達（SAR）激勵源、頻譜量測等太空平台單通道高速訊號產生應用。",
    "desc": "太空級單通道 16-bit multi-Nyquist DAC，最高 20.8GSPS（單通道 DES 模式），JESD204C 最高 16 lane @12.8Gbps，SEL 120MeV-cm²/mg、TID RLAT 300krad(Si)，與 DAC39RF10-SP 共用 256-Ball FCBGA 17×17mm 1mm pitch pinout（DACOUTB 不可用）。",
    "datasheet": "TI SBAS932A",
    "thermalPad": "無外露焊盤（256-ball FCBGA，散熱經球陣列與基板）；熱設計見 datasheet",
    "pins": [
      {
        "num": "A13",
        "name": "DACOUTA-",
        "side": "R",
        "type": "Analog Out",
        "desc": "DAC 通道 A 類比輸出負端；輸出電壓須符合 DAC 相容電壓範圍以維持指標效能"
      },
      {
        "num": "A12",
        "name": "DACOUTA+",
        "side": "R",
        "type": "Analog Out",
        "desc": "DAC 通道 A 類比輸出正端；輸出電壓須符合 DAC 相容電壓範圍以維持指標效能"
      },
      {
        "num": "T13",
        "name": "DACOUTB-",
        "side": "R",
        "type": "NC",
        "desc": "DAC 通道 B 類比輸出負端；單通道版本（RFS10）不可用（datasheet：not available in single channel devices），球位保留"
      },
      {
        "num": "T12",
        "name": "DACOUTB+",
        "side": "R",
        "type": "NC",
        "desc": "DAC 通道 B 類比輸出正端；單通道版本（RFS10）不可用（datasheet：not available in single channel devices），球位保留"
      },
      {
        "num": "E16",
        "name": "CLK-",
        "side": "L",
        "type": "Input",
        "desc": "元件時脈輸入負端；CLK+/CLK− 間內建 100Ω 差動端接，自偏壓，須交流耦合至時脈源"
      },
      {
        "num": "D16",
        "name": "CLK+",
        "side": "L",
        "type": "Input",
        "desc": "元件時脈輸入正端；CLK+/CLK− 間內建 100Ω 差動端接，自偏壓，須交流耦合至時脈源"
      },
      {
        "num": "N16",
        "name": "SYSREF-",
        "side": "L",
        "type": "Input",
        "desc": "差動 JESD204C SYSREF 輸入負端；SYSREF+/SYSREF− 間內建 100Ω 差動端接"
      },
      {
        "num": "M16",
        "name": "SYSREF+",
        "side": "L",
        "type": "Input",
        "desc": "差動 JESD204C SYSREF 輸入正端；SYSREF+/SYSREF− 間內建 100Ω 差動端接"
      },
      {
        "num": "A7",
        "name": "0SRX-",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 0 負端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 0SRX+"
      },
      {
        "num": "A8",
        "name": "0SRX+",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 0 正端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 0SRX-"
      },
      {
        "num": "B7",
        "name": "1SRX-",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 1 負端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 1SRX+"
      },
      {
        "num": "B8",
        "name": "1SRX+",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 1 正端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 1SRX-"
      },
      {
        "num": "A4",
        "name": "2SRX-",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 2 負端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 2SRX+"
      },
      {
        "num": "A5",
        "name": "2SRX+",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 2 正端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 2SRX-"
      },
      {
        "num": "B4",
        "name": "3SRX-",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 3 負端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 3SRX+"
      },
      {
        "num": "B5",
        "name": "3SRX+",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 3 正端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 3SRX-"
      },
      {
        "num": "D1",
        "name": "4SRX-",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 4 負端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 4SRX+"
      },
      {
        "num": "C1",
        "name": "4SRX+",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 4 正端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 4SRX-"
      },
      {
        "num": "D2",
        "name": "5SRX-",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 5 負端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 5SRX+"
      },
      {
        "num": "C2",
        "name": "5SRX+",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 5 正端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 5SRX-"
      },
      {
        "num": "G1",
        "name": "6SRX-",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 6 負端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 6SRX+"
      },
      {
        "num": "F1",
        "name": "6SRX+",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 6 正端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 6SRX-"
      },
      {
        "num": "G2",
        "name": "7SRX-",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 7 負端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 7SRX+"
      },
      {
        "num": "F2",
        "name": "7SRX+",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 7 正端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 7SRX-"
      },
      {
        "num": "T8",
        "name": "8SRX-",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 8 負端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 8SRX+"
      },
      {
        "num": "T7",
        "name": "8SRX+",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 8 正端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 8SRX-"
      },
      {
        "num": "R8",
        "name": "9SRX-",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 9 負端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 9SRX+"
      },
      {
        "num": "R7",
        "name": "9SRX+",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 9 正端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 9SRX-"
      },
      {
        "num": "T5",
        "name": "10SRX-",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 10 負端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 10SRX+"
      },
      {
        "num": "T4",
        "name": "10SRX+",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 10 正端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 10SRX-"
      },
      {
        "num": "R5",
        "name": "11SRX-",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 11 負端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 11SRX+"
      },
      {
        "num": "R4",
        "name": "11SRX+",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 11 正端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 11SRX-"
      },
      {
        "num": "P1",
        "name": "12SRX-",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 12 負端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 12SRX+"
      },
      {
        "num": "N1",
        "name": "12SRX+",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 12 正端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 12SRX-"
      },
      {
        "num": "P2",
        "name": "13SRX-",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 13 負端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 13SRX+"
      },
      {
        "num": "N2",
        "name": "13SRX+",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 13 正端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 13SRX-"
      },
      {
        "num": "L1",
        "name": "14SRX-",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 14 負端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 14SRX+"
      },
      {
        "num": "K1",
        "name": "14SRX+",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 14 正端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 14SRX-"
      },
      {
        "num": "L2",
        "name": "15SRX-",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 15 負端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 15SRX+"
      },
      {
        "num": "K2",
        "name": "15SRX+",
        "side": "L",
        "type": "Input",
        "desc": "SerDes 通道 15 正端輸入；封裝內含交流耦合串接電容與 100Ω 內部端接至 15SRX-"
      },
      {
        "num": "H4",
        "name": "ALARM",
        "side": "R",
        "type": "Output",
        "desc": "警示輸出：偵測到內部未遮罩告警時動作，告警遮罩由 ALM_MASK 暫存器設定"
      },
      {
        "num": "F4",
        "name": "FRCLK",
        "side": "L",
        "type": "Input",
        "desc": "快速重組態（Fast Reconfiguration）介面時脈"
      },
      {
        "num": "G4",
        "name": "FRCS",
        "side": "L",
        "type": "Input",
        "desc": "快速重組態介面晶片選擇；內建上拉"
      },
      {
        "num": "E4",
        "name": "FRDI0",
        "side": "L",
        "type": "Input",
        "desc": "快速重組態介面資料位元 0"
      },
      {
        "num": "E5",
        "name": "FRDI1",
        "side": "L",
        "type": "Input",
        "desc": "快速重組態介面資料位元 1"
      },
      {
        "num": "F5",
        "name": "FRDI2",
        "side": "L",
        "type": "Input",
        "desc": "快速重組態介面資料位元 2"
      },
      {
        "num": "G5",
        "name": "FRDI3",
        "side": "L",
        "type": "Input",
        "desc": "快速重組態介面資料位元 3"
      },
      {
        "num": "D6",
        "name": "{RESET}",
        "side": "L",
        "type": "Input",
        "desc": "元件重置輸入，active-low；上電後須切換一次；內建上拉"
      },
      {
        "num": "E6",
        "name": "SCANEN",
        "side": "L",
        "type": "Input",
        "desc": "TI 內部測試用腳，可懸空不接；內建下拉"
      },
      {
        "num": "E8",
        "name": "SCLK",
        "side": "L",
        "type": "Input",
        "desc": "序列程式介面（SPI）時脈輸入"
      },
      {
        "num": "E7",
        "name": "{SCS}",
        "side": "L",
        "type": "Input",
        "desc": "序列程式介面（SPI）晶片選擇輸入，active-low；內建上拉"
      },
      {
        "num": "D8",
        "name": "SDI",
        "side": "L",
        "type": "Input",
        "desc": "序列程式介面（SPI）資料輸入"
      },
      {
        "num": "D7",
        "name": "SDO",
        "side": "R",
        "type": "Output",
        "desc": "序列程式介面（SPI）資料輸出；未讀取 SPI 資料時為高阻抗"
      },
      {
        "num": "J4",
        "name": "{SYNC}",
        "side": "R",
        "type": "Output",
        "desc": "JESD204C SYNC 輸出，active-low"
      },
      {
        "num": "D5",
        "name": "TXEN0",
        "side": "L",
        "type": "Input",
        "desc": "通道 A 傳輸致能，高電位動作；須由 USE_TX_EN0 暫存器致能，停用時 DAC 輸出強制為中碼 0x0000（2補數）；內建上拉"
      },
      {
        "num": "D4",
        "name": "TXEN1",
        "side": "L",
        "type": "Input",
        "desc": "通道 B 傳輸致能，高電位動作；須由 USE_TX_EN1 暫存器致能，停用時 DAC 輸出強制為中碼 0x0000（2補數）；內建上拉"
      },
      {
        "num": "N6",
        "name": "ATEST",
        "side": "R",
        "type": "Output",
        "desc": "TI 用類比測試腳，須保持不連接"
      },
      {
        "num": "J15",
        "name": "EXTREF",
        "side": "L",
        "type": "I/O",
        "desc": "參考電壓輸出或輸入，由 EXTREF_EN 暫存器欄位決定；若使用內部參考，須經 0.1μF 電容接至 AGND"
      },
      {
        "num": "H16",
        "name": "RBIAS-",
        "side": "R",
        "type": "Output",
        "desc": "滿刻度輸出電流偏壓：由本腳至 RBIAS+ 間所接電阻設定"
      },
      {
        "num": "J16",
        "name": "RBIAS+",
        "side": "R",
        "type": "Output",
        "desc": "滿刻度輸出電流偏壓：由本腳至 RBIAS− 間所接電阻設定"
      },
      {
        "num": "M5",
        "name": "RTEST",
        "side": "R",
        "type": "Output",
        "desc": "TI 專用腳，須接至 AGND"
      },
      {
        "num": "G14",
        "name": "VDDA18A",
        "side": "T",
        "type": "Power",
        "desc": "DAC 通道 A 類比 1.8V 電源；可與 VDDA18B 併接，但會劣化通道間串擾（XTALK）"
      },
      {
        "num": "H14",
        "name": "VDDA18A",
        "side": "T",
        "type": "Power",
        "desc": "DAC 通道 A 類比 1.8V 電源；可與 VDDA18B 併接，但會劣化通道間串擾（XTALK）"
      },
      {
        "num": "J14",
        "name": "VDDA18B",
        "side": "T",
        "type": "Power",
        "desc": "DAC 通道 B 類比 1.8V 電源；可與 VDDA18A 併接，但會劣化通道間串擾（XTALK）"
      },
      {
        "num": "K14",
        "name": "VDDA18B",
        "side": "T",
        "type": "Power",
        "desc": "DAC 通道 B 類比 1.8V 電源；可與 VDDA18A 併接，但會劣化通道間串擾（XTALK）"
      },
      {
        "num": "F11",
        "name": "VDDCLK10",
        "side": "T",
        "type": "Power",
        "desc": "內部取樣時脈分佈路徑 1V 電源；雜訊或突波會劣化相位雜訊效能，建議與 VDDDIG、VDDA 分離"
      },
      {
        "num": "H11",
        "name": "VDDCLK10",
        "side": "T",
        "type": "Power",
        "desc": "內部取樣時脈分佈路徑 1V 電源；雜訊或突波會劣化相位雜訊效能，建議與 VDDDIG、VDDA 分離"
      },
      {
        "num": "J11",
        "name": "VDDCLK10",
        "side": "T",
        "type": "Power",
        "desc": "內部取樣時脈分佈路徑 1V 電源；雜訊或突波會劣化相位雜訊效能，建議與 VDDDIG、VDDA 分離"
      },
      {
        "num": "L11",
        "name": "VDDCLK10",
        "side": "T",
        "type": "Power",
        "desc": "內部取樣時脈分佈路徑 1V 電源；雜訊或突波會劣化相位雜訊效能，建議與 VDDDIG、VDDA 分離"
      },
      {
        "num": "E12",
        "name": "VDDCLK10",
        "side": "T",
        "type": "Power",
        "desc": "內部取樣時脈分佈路徑 1V 電源；雜訊或突波會劣化相位雜訊效能，建議與 VDDDIG、VDDA 分離"
      },
      {
        "num": "M12",
        "name": "VDDCLK10",
        "side": "T",
        "type": "Power",
        "desc": "內部取樣時脈分佈路徑 1V 電源；雜訊或突波會劣化相位雜訊效能，建議與 VDDDIG、VDDA 分離"
      },
      {
        "num": "H12",
        "name": "VDDCLK18",
        "side": "T",
        "type": "Power",
        "desc": "時脈（CLK+/CLK−）輸入緩衝器 1.8V 電源；雜訊或突波會劣化相位雜訊效能"
      },
      {
        "num": "H13",
        "name": "VDDCLK18",
        "side": "T",
        "type": "Power",
        "desc": "時脈（CLK+/CLK−）輸入緩衝器 1.8V 電源；雜訊或突波會劣化相位雜訊效能"
      },
      {
        "num": "F7",
        "name": "VDDDIG",
        "side": "T",
        "type": "Power",
        "desc": "數位區塊 1V 電源；建議與 VDDA、VDDCLK 分離以取得最佳效能"
      },
      {
        "num": "H7",
        "name": "VDDDIG",
        "side": "T",
        "type": "Power",
        "desc": "數位區塊 1V 電源；建議與 VDDA、VDDCLK 分離以取得最佳效能"
      },
      {
        "num": "J7",
        "name": "VDDDIG",
        "side": "T",
        "type": "Power",
        "desc": "數位區塊 1V 電源；建議與 VDDA、VDDCLK 分離以取得最佳效能"
      },
      {
        "num": "L7",
        "name": "VDDDIG",
        "side": "T",
        "type": "Power",
        "desc": "數位區塊 1V 電源；建議與 VDDA、VDDCLK 分離以取得最佳效能"
      },
      {
        "num": "N7",
        "name": "VDDDIG",
        "side": "T",
        "type": "Power",
        "desc": "數位區塊 1V 電源；建議與 VDDA、VDDCLK 分離以取得最佳效能"
      },
      {
        "num": "G8",
        "name": "VDDDIG",
        "side": "T",
        "type": "Power",
        "desc": "數位區塊 1V 電源；建議與 VDDA、VDDCLK 分離以取得最佳效能"
      },
      {
        "num": "K8",
        "name": "VDDDIG",
        "side": "T",
        "type": "Power",
        "desc": "數位區塊 1V 電源；建議與 VDDA、VDDCLK 分離以取得最佳效能"
      },
      {
        "num": "M8",
        "name": "VDDDIG",
        "side": "T",
        "type": "Power",
        "desc": "數位區塊 1V 電源；建議與 VDDA、VDDCLK 分離以取得最佳效能"
      },
      {
        "num": "F8",
        "name": "VDDEA",
        "side": "T",
        "type": "Power",
        "desc": "通道 A DAC 編碼器 1V 電源；建議與 VDDDIG 分離，可與 VDDEB 併接"
      },
      {
        "num": "F9",
        "name": "VDDEA",
        "side": "T",
        "type": "Power",
        "desc": "通道 A DAC 編碼器 1V 電源；建議與 VDDDIG 分離，可與 VDDEB 併接"
      },
      {
        "num": "L8",
        "name": "VDDEB",
        "side": "T",
        "type": "Power",
        "desc": "通道 B DAC 編碼器 1V 電源；建議與 VDDDIG 分離，可與 VDDEA 併接"
      },
      {
        "num": "L9",
        "name": "VDDEB",
        "side": "T",
        "type": "Power",
        "desc": "通道 B DAC 編碼器 1V 電源；建議與 VDDDIG 分離，可與 VDDEA 併接"
      },
      {
        "num": "D9",
        "name": "VDDIO",
        "side": "T",
        "type": "Power",
        "desc": "CMOS 輸出入端子 1.8V 電源"
      },
      {
        "num": "E9",
        "name": "VDDIO",
        "side": "T",
        "type": "Power",
        "desc": "CMOS 輸出入端子 1.8V 電源"
      },
      {
        "num": "F10",
        "name": "VDDLA",
        "side": "T",
        "type": "Power",
        "desc": "通道 A DAC 類比閂鎖 1V 電源；與 VDDLB、VDDDIG 分離以取得最佳通道間串擾與整體效能"
      },
      {
        "num": "H10",
        "name": "VDDLA",
        "side": "T",
        "type": "Power",
        "desc": "通道 A DAC 類比閂鎖 1V 電源；與 VDDLB、VDDDIG 分離以取得最佳通道間串擾與整體效能"
      },
      {
        "num": "J10",
        "name": "VDDLB",
        "side": "T",
        "type": "Power",
        "desc": "通道 B DAC 類比閂鎖 1V 電源；與 VDDLA、VDDDIG 分離以取得最佳通道間串擾與整體效能"
      },
      {
        "num": "L10",
        "name": "VDDLB",
        "side": "T",
        "type": "Power",
        "desc": "通道 B DAC 類比閂鎖 1V 電源；與 VDDLA、VDDDIG 分離以取得最佳通道間串擾與整體效能"
      },
      {
        "num": "K4",
        "name": "VDDR18",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 接收器 1.8V 電源"
      },
      {
        "num": "L4",
        "name": "VDDR18",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 接收器 1.8V 電源"
      },
      {
        "num": "M4",
        "name": "VDDR18",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 接收器 1.8V 電源"
      },
      {
        "num": "N4",
        "name": "VDDR18",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 接收器 1.8V 電源"
      },
      {
        "num": "J12",
        "name": "VDDSYS18",
        "side": "T",
        "type": "Power",
        "desc": "SYSREF（SYSREF+/SYSREF−）輸入緩衝器 1.8V 電源；SYSREF 停用時可與 VDDCLK18 併接，持續運作時須分離以避免雜訊耦合並降低相位雜訊劣化"
      },
      {
        "num": "J13",
        "name": "VDDSYS18",
        "side": "T",
        "type": "Power",
        "desc": "SYSREF（SYSREF+/SYSREF−）輸入緩衝器 1.8V 電源；SYSREF 停用時可與 VDDCLK18 併接，持續運作時須分離以避免雜訊耦合並降低相位雜訊劣化"
      },
      {
        "num": "C3",
        "name": "VDDT",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 端接 1V 電源"
      },
      {
        "num": "D3",
        "name": "VDDT",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 端接 1V 電源"
      },
      {
        "num": "F3",
        "name": "VDDT",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 端接 1V 電源"
      },
      {
        "num": "G3",
        "name": "VDDT",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 端接 1V 電源"
      },
      {
        "num": "K3",
        "name": "VDDT",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 端接 1V 電源"
      },
      {
        "num": "L3",
        "name": "VDDT",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 端接 1V 電源"
      },
      {
        "num": "N3",
        "name": "VDDT",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 端接 1V 電源"
      },
      {
        "num": "P3",
        "name": "VDDT",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 端接 1V 電源"
      },
      {
        "num": "C4",
        "name": "VDDT",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 端接 1V 電源"
      },
      {
        "num": "P4",
        "name": "VDDT",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 端接 1V 電源"
      },
      {
        "num": "C5",
        "name": "VDDT",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 端接 1V 電源"
      },
      {
        "num": "H5",
        "name": "VDDT",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 端接 1V 電源"
      },
      {
        "num": "J5",
        "name": "VDDT",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 端接 1V 電源"
      },
      {
        "num": "P5",
        "name": "VDDT",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 端接 1V 電源"
      },
      {
        "num": "G6",
        "name": "VDDT",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 端接 1V 電源"
      },
      {
        "num": "K6",
        "name": "VDDT",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 端接 1V 電源"
      },
      {
        "num": "M6",
        "name": "VDDT",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 端接 1V 電源"
      },
      {
        "num": "C7",
        "name": "VDDT",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 端接 1V 電源"
      },
      {
        "num": "P7",
        "name": "VDDT",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 端接 1V 電源"
      },
      {
        "num": "C8",
        "name": "VDDT",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 端接 1V 電源"
      },
      {
        "num": "P8",
        "name": "VDDT",
        "side": "T",
        "type": "Power",
        "desc": "SerDes 端接 1V 電源"
      },
      {
        "num": "C11",
        "name": "VEEAM18",
        "side": "T",
        "type": "Power",
        "desc": "通道 A DAC 電流源偏壓 −1.8V 電源；可與 VEEBM18 併接，但會劣化通道間串擾（XTALK）"
      },
      {
        "num": "D11",
        "name": "VEEAM18",
        "side": "T",
        "type": "Power",
        "desc": "通道 A DAC 電流源偏壓 −1.8V 電源；可與 VEEBM18 併接，但會劣化通道間串擾（XTALK）"
      },
      {
        "num": "C12",
        "name": "VEEAM18",
        "side": "T",
        "type": "Power",
        "desc": "通道 A DAC 電流源偏壓 −1.8V 電源；可與 VEEBM18 併接，但會劣化通道間串擾（XTALK）"
      },
      {
        "num": "D12",
        "name": "VEEAM18",
        "side": "T",
        "type": "Power",
        "desc": "通道 A DAC 電流源偏壓 −1.8V 電源；可與 VEEBM18 併接，但會劣化通道間串擾（XTALK）"
      },
      {
        "num": "C13",
        "name": "VEEAM18",
        "side": "T",
        "type": "Power",
        "desc": "通道 A DAC 電流源偏壓 −1.8V 電源；可與 VEEBM18 併接，但會劣化通道間串擾（XTALK）"
      },
      {
        "num": "D13",
        "name": "VEEAM18",
        "side": "T",
        "type": "Power",
        "desc": "通道 A DAC 電流源偏壓 −1.8V 電源；可與 VEEBM18 併接，但會劣化通道間串擾（XTALK）"
      },
      {
        "num": "N11",
        "name": "VEEBM18",
        "side": "T",
        "type": "Power",
        "desc": "通道 B DAC 電流源偏壓 −1.8V 電源；可與 VEEAM18 併接，但會劣化通道間串擾（XTALK）"
      },
      {
        "num": "P11",
        "name": "VEEBM18",
        "side": "T",
        "type": "Power",
        "desc": "通道 B DAC 電流源偏壓 −1.8V 電源；可與 VEEAM18 併接，但會劣化通道間串擾（XTALK）"
      },
      {
        "num": "N12",
        "name": "VEEBM18",
        "side": "T",
        "type": "Power",
        "desc": "通道 B DAC 電流源偏壓 −1.8V 電源；可與 VEEAM18 併接，但會劣化通道間串擾（XTALK）"
      },
      {
        "num": "P12",
        "name": "VEEBM18",
        "side": "T",
        "type": "Power",
        "desc": "通道 B DAC 電流源偏壓 −1.8V 電源；可與 VEEAM18 併接，但會劣化通道間串擾（XTALK）"
      },
      {
        "num": "N13",
        "name": "VEEBM18",
        "side": "T",
        "type": "Power",
        "desc": "通道 B DAC 電流源偏壓 −1.8V 電源；可與 VEEAM18 併接，但會劣化通道間串擾（XTALK）"
      },
      {
        "num": "P13",
        "name": "VEEBM18",
        "side": "T",
        "type": "Power",
        "desc": "通道 B DAC 電流源偏壓 −1.8V 電源；可與 VEEAM18 併接，但會劣化通道間串擾（XTALK）"
      },
      {
        "num": "N9",
        "name": "VQPS",
        "side": "T",
        "type": "Power",
        "desc": "TI 專用腳，正常操作時可接至 DGND"
      },
      {
        "num": "P9",
        "name": "VQPS",
        "side": "T",
        "type": "Power",
        "desc": "TI 專用腳，正常操作時可接至 DGND"
      },
      {
        "num": "A10",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "B10",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "C10",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "D10",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "N10",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "P10",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "R10",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "T10",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "A11",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "B11",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "R11",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "T11",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "B12",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "R12",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "B13",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "G13",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "K13",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "R13",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "A14",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "B14",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "C14",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "D14",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "N14",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "P14",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "R14",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "T14",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "G15",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "H15",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "K15",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "G16",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "K16",
        "name": "AGND",
        "side": "B",
        "type": "Ground",
        "desc": "類比接地"
      },
      {
        "num": "A1",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "B1",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "E1",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "H1",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "J1",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "M1",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "R1",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "T1",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "A2",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "B2",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "E2",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "H2",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "J2",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "M2",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "R2",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "T2",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "A3",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "B3",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "E3",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "H3",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "J3",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "M3",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "R3",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "T3",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "K5",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "L5",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "N5",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "A6",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "B6",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "C6",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "F6",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "H6",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "J6",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "L6",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "P6",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "R6",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "T6",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "G7",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "K7",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "M7",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "H8",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "J8",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "N8",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "A9",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "B9",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "C9",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "G9",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "H9",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "J9",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "K9",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "M9",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "R9",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "T9",
        "name": "DGND",
        "side": "B",
        "type": "Ground",
        "desc": "數位接地"
      },
      {
        "num": "E10",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "G10",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "K10",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "M10",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "E11",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "G11",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "K11",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "M11",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "F12",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "G12",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "K12",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "L12",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "E13",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "F13",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "L13",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "M13",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "E14",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "F14",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "L14",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "M14",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "A15",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "B15",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "C15",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "D15",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "E15",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "F15",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "L15",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "M15",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "N15",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "P15",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "R15",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "T15",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "A16",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "B16",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "C16",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "F16",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "L16",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "P16",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "R16",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      },
      {
        "num": "T16",
        "name": "VSSCLK",
        "side": "B",
        "type": "Ground",
        "desc": "時脈接地"
      }
    ],
    "specs": [
      {
        "k": "輻射耐受（-SP）",
        "v": "SEU 免疫暫存器；SEL 120MeV-cm²/mg；TID RLAT 300krad(Si)"
      },
      {
        "k": "輻射耐受（-SEP，未建檔，僅供對照）",
        "v": "見 datasheet：SEU 免疫暫存器；SEL 43MeV-cm²/mg；TID RLAT 30krad(Si)"
      },
      {
        "k": "解析度/取樣率",
        "v": "16-bit，單通道最高 20.8GSPS（DES 模式）multi-Nyquist DAC 核心"
      },
      {
        "k": "最大輸入資料率",
        "v": "單通道 DES：8-bit 20.8GSPS／12-bit 15.5GSPS／16-bit 10.4GSPS"
      },
      {
        "k": "輸出頻寬",
        "v": "−3dB 12GHz"
      },
      {
        "k": "AC 效能（fOUT=2.997GHz，DES2XL，DEM/Dither off）",
        "v": "雜訊底床 −155dBFS/Hz；SFDR(−0.1dBFS) 60dBc；IMD3(−7dBFS/tone) −62dBc；附加相位雜訊 −138dBc/Hz@10kHz offset"
      },
      {
        "k": "數位上變頻",
        "v": "內插 1x/2x/3x/4x/6x/8x/12x...256x；64-bit NCO 頻率解析度"
      },
      {
        "k": "JESD204C 介面",
        "v": "最高 16 lane，單 lane 最高 12.8Gbps；Class C-S subclass-1；內建 AC 耦合電容"
      },
      {
        "k": "太空篩選",
        "v": "符合 ASTM E595 除氣規範；單一晶圓製造/組裝/測試廠；晶圓批次可追溯；延長產品生命週期；RLAT；-SP 版另含 production burn-in"
      },
      {
        "k": "料號/等級",
        "v": "DAC39RFS10ACL-MLS：Flight grade Space-MLS(-SP)，300krad(Si)；DAC39RFS10ACLNSP：Space Enhanced(-SEP)，30krad(Si)（見 datasheet）"
      },
      {
        "k": "封裝",
        "v": "256-Ball FCBGA (ACL)，17mm×17mm，1mm pitch（與 DAC39RF10-SP 共用 pinout）"
      }
    ],
    "secondSource": [],
    "dropIn": [
      {
        "part": "DAC39RF10-SP",
        "note": "同一份 datasheet（TI SBAS932A）、Table 5-1 共用同一份 256-ball FCBGA pinout（球號、球名逐一相同）；RF10 為雙通道版本，本部品（RFS10）之 DACOUTB+/DACOUTB−（球 T12/T13）依 datasheet 明載 \"Not available in single channel devices\"，本檔已將該二球 type 標為 NC。通道 B 相關電源腳（VDDA18B/VDDLB/VDDEB/VEEBM18/TXEN1 等）datasheet 未明文排除，是否於單通道版停用/懸空須查閱完整 datasheet 或洽 TI 確認。"
      }
    ]
  },
  {
    "part": "DRV8218",
    "mfr": "Texas Instruments",
    "category": "motor",
    "subcategory": "有刷直流馬達驅動（單通道 H-Bridge）",
    "package": "8-WSON (DSG) 2.0×2.0mm",
    "whatIs": "11V/8A 單通道 H-bridge 有刷直流馬達驅動器：四顆 N 通道功率 FET＋三倍壓電荷泵＋保護電路整合單晶片，電容全內建，1.8V 即可工作。",
    "func": "接收 PWM／PH-EN／獨立半橋三種控制介面（MODE 三態腳選擇），驅動一顆雙向有刷馬達、兩顆單向馬達、繼電器或螺線管；睡眠模式靜態電流 <120nA。",
    "usedIn": "電動牙刷、智慧門鎖、水電瓦斯表、玩具機器人、網路攝影機 IR-cut、視訊門鈴、血壓計、輸液幫浦等電池供電小馬達應用。",
    "desc": "8-WSON 的 H-bridge 馬達驅動器，VM 1.8–11V、VCC 1.8–5.5V，80mΩ RDS(ON)（HS+LS）、8A 峰值，支援並聯半橋（20mΩ）。內建 UVLO/OCP/TSD 保護。DRV8210/8212/8220 為同腳位家族（不同電壓/阻值，庫內未建）。ADVANCE INFORMATION（2026-05 預產文件），量產前照最新版 datasheet 覆核。",
    "datasheet": "TI SLVSI75",
    "pins": [
      {
        "num": "1",
        "name": "VM",
        "side": "L",
        "type": "power",
        "desc": "馬達電源 1.8–11V；0.1µF 陶瓷旁路至 GND＋足量 bulk 電容"
      },
      {
        "num": "2",
        "name": "OUT1",
        "side": "L",
        "type": "output",
        "desc": "H-bridge 輸出，接馬達或其他負載"
      },
      {
        "num": "3",
        "name": "OUT2",
        "side": "L",
        "type": "output",
        "desc": "H-bridge 輸出，接馬達或其他負載"
      },
      {
        "num": "4",
        "name": "GND",
        "side": "L",
        "type": "ground",
        "desc": "裝置接地，接系統地"
      },
      {
        "num": "5",
        "name": "IN2/EN",
        "side": "R",
        "type": "input",
        "desc": "IN2 控制輸入（PH/EN 模式時為 EN）；內建下拉電阻"
      },
      {
        "num": "6",
        "name": "IN1/PH",
        "side": "R",
        "type": "input",
        "desc": "IN1 控制輸入（PH/EN 模式時為 PH）；內建下拉電阻"
      },
      {
        "num": "7",
        "name": "MODE",
        "side": "R",
        "type": "input",
        "desc": "控制介面模式三態輸入（參考 VCC 電壓）：低=PWM、高=PH/EN、Hi-Z=獨立半橋；非閂鎖可運轉中切換"
      },
      {
        "num": "8",
        "name": "VCC",
        "side": "R",
        "type": "power",
        "desc": "邏輯電源 1.8–5.5V；0.1µF 陶瓷旁路至 GND"
      },
      {
        "num": "9",
        "name": "EP",
        "side": "B",
        "type": "ground",
        "desc": "散熱焊墊（Thermal Pad），接系統地",
        "ep": true
      }
    ],
    "thermalPad": "Thermal Pad 接系統地（表列＋pin 圖中央雙佐證）",
    "specs": [
      {
        "k": "馬達電源",
        "v": "1.8V–11V（VM）"
      },
      {
        "k": "邏輯電源",
        "v": "1.8V–5.5V（VCC），支援 1.8/3.3/5V 邏輯"
      },
      {
        "k": "輸出",
        "v": "8A 峰值，RDS(ON) 80mΩ（HS+LS 合計）；並聯半橋 20mΩ"
      },
      {
        "k": "睡眠電流",
        "v": "<120nA（VM=5V, VCC=3.3V, 25°C）"
      },
      {
        "k": "控制介面",
        "v": "PWM (IN1/IN2)、PH/EN、獨立半橋、並聯半橋"
      },
      {
        "k": "保護",
        "v": "UVLO、OCP、TSD"
      }
    ],
    "secondSource": [],
    "dropIn": []
  },
  {
    "part": "DRV81646-Q1",
    "mfr": "Texas Instruments",
    "category": "motor",
    "subcategory": "車用四通道低邊驅動器（Hardware/SPI）",
    "package": "24-HVSSOP (DGQ) 6.10×4.90mm",
    "whatIs": "車規 65V 四通道整合低邊開關：每通道 140mΩ RDS(ON)，內建續流二極體接 VCLAMP，電流限制與斜率可設定。",
    "func": "以硬體 GPIO（每通道獨立 PWM 輸入）或 4 線 SPI 控制四路低邊開關，驅動繼電器/電磁閥/LED/單向馬達；ILIM 單電阻全域設 0.5–4A 電流限制、RSLEW/CNTL 設斜率（100–1500ns），nFAULT 回報故障。",
    "usedIn": "車身電子與照明、引擎管理、BMS、區域控制器（Zone Control Unit）的繼電器/閥/LED 驅動。",
    "desc": "24-HVSSOP 車規（AEC-Q100 系）四通道低邊驅動器，4.5–65V（70V abs max），PWM 最高 500kHz，每通道獨立過溫/過流保護、可設定過流切斷延遲（COD 0.5–2ms）與 INRUSH 模式。SRC1–4 獨立引出可外接感測電阻。ADVANCE INFORMATION（2026-05 預產文件），量產前照最新版 datasheet 覆核。",
    "datasheet": "TI SLVSIJ3",
    "pins": [
      {
        "num": "1",
        "name": "SRC3",
        "side": "L",
        "type": "ground",
        "desc": "通道 3 低邊 FET 源極：接系統地，或經感測電阻接地做外部電流感測"
      },
      {
        "num": "2",
        "name": "SRC4",
        "side": "L",
        "type": "ground",
        "desc": "通道 4 低邊 FET 源極：接系統地，或經感測電阻接地做外部電流感測"
      },
      {
        "num": "3",
        "name": "NC",
        "side": "L",
        "type": "nc",
        "desc": "無連接"
      },
      {
        "num": "4",
        "name": "VCLAMP",
        "side": "L",
        "type": "power",
        "desc": "箝位/續流路徑：接 VM 電源，或經 Zener/TVS 二極體至 VM 或 GND；不可懸空（表列 4, 21 兩腳）"
      },
      {
        "num": "5",
        "name": "NC",
        "side": "L",
        "type": "nc",
        "desc": "無連接"
      },
      {
        "num": "6",
        "name": "IN1/SDI",
        "side": "L",
        "type": "input",
        "desc": "硬體模式=通道 1 控制輸入（未用通道接 GND 或經 10kΩ 接地）；SPI 模式=串列資料輸入。內建下拉電阻"
      },
      {
        "num": "7",
        "name": "IN2/SCLK",
        "side": "L",
        "type": "input",
        "desc": "硬體模式=通道 2 控制輸入；SPI 模式=串列時脈（上升緣移出資料、下降緣取樣）。內建下拉電阻"
      },
      {
        "num": "8",
        "name": "IN3/NSCS",
        "side": "L",
        "type": "input",
        "desc": "硬體模式=通道 3 控制輸入；SPI 模式=晶片選擇（低有效致能通訊）。內建下拉電阻"
      },
      {
        "num": "9",
        "name": "IN4/SDO",
        "side": "L",
        "type": "io",
        "desc": "硬體模式=通道 4 控制輸入（內建下拉）；SPI 模式=串列資料輸出（開汲極，需外部上拉，SCLK 上升緣移出）"
      },
      {
        "num": "10",
        "name": "GND",
        "side": "L",
        "type": "ground",
        "desc": "裝置接地，接系統地"
      },
      {
        "num": "11",
        "name": "RSLEW/CNTL",
        "side": "L",
        "type": "input",
        "desc": "斜率與控制介面選擇：接電阻至 GND 設定斜率＋介面（Hardware/SPI）組合"
      },
      {
        "num": "12",
        "name": "nFAULT",
        "side": "L",
        "type": "output",
        "desc": "故障輸出（開汲極，低=故障）；上拉電阻接外部邏輯電源"
      },
      {
        "num": "13",
        "name": "COD/INRUSH",
        "side": "R",
        "type": "input",
        "desc": "過流切斷延遲（COD）/湧浪模式設定：電阻至 GND 設延遲、接 GND 停用、懸空（Hi-Z）=INRUSH 模式"
      },
      {
        "num": "14",
        "name": "ILIM",
        "side": "R",
        "type": "input",
        "desc": "電流限制設定：電阻接 GND 設全域門檻（0.5–4A）；不可懸空，直接接 GND=最大電流限制"
      },
      {
        "num": "15",
        "name": "NC",
        "side": "R",
        "type": "nc",
        "desc": "無連接"
      },
      {
        "num": "16",
        "name": "VM",
        "side": "R",
        "type": "power",
        "desc": "電源 4.5–65V；0.1µF 陶瓷旁路至 GND＋足量 bulk 電容"
      },
      {
        "num": "17",
        "name": "OUT4",
        "side": "R",
        "type": "output",
        "desc": "通道 4 輸出，接負載 4"
      },
      {
        "num": "18",
        "name": "OUT3",
        "side": "R",
        "type": "output",
        "desc": "通道 3 輸出，接負載 3"
      },
      {
        "num": "19",
        "name": "OUT2",
        "side": "R",
        "type": "output",
        "desc": "通道 2 輸出，接負載 2"
      },
      {
        "num": "20",
        "name": "OUT1",
        "side": "R",
        "type": "output",
        "desc": "通道 1 輸出，接負載 1"
      },
      {
        "num": "21",
        "name": "VCLAMP",
        "side": "R",
        "type": "power",
        "desc": "箝位/續流路徑，同 pin 4（表列 4, 21 合併展開）；接 VM 或經 Zener/TVS；不可懸空"
      },
      {
        "num": "22",
        "name": "NC",
        "side": "R",
        "type": "nc",
        "desc": "無連接"
      },
      {
        "num": "23",
        "name": "SRC1",
        "side": "R",
        "type": "ground",
        "desc": "通道 1 低邊 FET 源極：接系統地，或經感測電阻接地做外部電流感測"
      },
      {
        "num": "24",
        "name": "SRC2",
        "side": "R",
        "type": "ground",
        "desc": "通道 2 低邊 FET 源極：接系統地，或經感測電阻接地做外部電流感測"
      },
      {
        "num": "25",
        "name": "EP",
        "side": "B",
        "type": "ground",
        "desc": "散熱焊墊（THERMAL PAD），接系統地；接連續地銅面並直連 via 散熱",
        "ep": true
      }
    ],
    "thermalPad": "THERMAL PAD 接系統地（表列＋pin 圖中央雙佐證）；連續地銅面＋direct-connect via",
    "specs": [
      {
        "k": "電源",
        "v": "4.5V–65V（70V 絕對最大）"
      },
      {
        "k": "通道",
        "v": "4 通道低邊，RDS(ON) 140mΩ/通道（25°C）"
      },
      {
        "k": "電流限制",
        "v": "0.5A–4A 可選（ILIM 電阻全域設定）"
      },
      {
        "k": "PWM",
        "v": "最高 500kHz"
      },
      {
        "k": "斜率",
        "v": "100–1500ns 可設定（RSLEW）"
      },
      {
        "k": "介面",
        "v": "Hardware（每通道 PWM）或 4 線 SPI；nFAULT 中斷"
      },
      {
        "k": "保護",
        "v": "每通道獨立過溫/過流、COD 0.5–2ms、INRUSH 模式"
      }
    ],
    "secondSource": [],
    "dropIn": []
  },
  {
    "part": "FAN31790",
    "mfr": "Texas Instruments",
    "category": "motor",
    "subcategory": "風扇控制器（6 通道 PWM/RPM，I2C）",
    "package": "28-LGA (ZFP) 4.0×4.0mm",
    "whatIs": "6 通道智慧風扇控制器：獨立 9-bit PWM 輸出＋專用 TACH 輸入閉迴路轉速控制，I2C 介面，與常見風扇控制器 pin-to-pin/BOM-to-BOM 相容。",
    "func": "以 6 路 PWM（25Hz–25kHz）驅動 4 線風扇（3 線/2 線經外部電晶體），最多 12 路 11-bit 轉速計輸入監測；自動調佔空比維持目標轉速，故障偵測進安全狀態；上電預設值由外部接腳硬體設定。",
    "usedIn": "桌機/伺服器主機板、GPU 卡與硬體加速器、車用座椅風扇、空氣清淨機的風扇調速與監控。",
    "desc": "28-LGA（4×4mm，腳位同 WQFN 4×4）6 通道風扇控制器，供電 1.62–3.6V、–40~125°C。內建 ±5% 32kHz 振盪器、可外接 32.768kHz 石英（XTAL1/2）並由 CLKOUT 輸出；I2C fast-mode 400kbps、16 種位址（ADD0/1 四態）；整合看門狗。暫存器映射相容既有驅動軟體。注意：本封裝編號為逆時針（pin 1 左下、1–7 底邊）。",
    "datasheet": "TI SLVSIZ2",
    "pins": [
      {
        "num": "1",
        "name": "FREQ_START",
        "side": "B",
        "type": "input",
        "desc": "上電取樣：設定 PWM 輸出頻率的 power-up 預設值"
      },
      {
        "num": "2",
        "name": "SPIN_START",
        "side": "B",
        "type": "input",
        "desc": "上電取樣：設定初始 spin-up 行為"
      },
      {
        "num": "3",
        "name": "ADD1",
        "side": "B",
        "type": "input",
        "desc": "I2C 位址選擇：可接 VCC/GND/SCL/SDA 組合出 16 種位址；每次 I2C 傳輸開始時取樣"
      },
      {
        "num": "4",
        "name": "ADD0",
        "side": "B",
        "type": "input",
        "desc": "I2C 位址選擇（與 ADD1 同表格合併描述）"
      },
      {
        "num": "5",
        "name": "WD_START",
        "side": "B",
        "type": "input",
        "desc": "上電取樣：設定看門狗初始行為"
      },
      {
        "num": "6",
        "name": "XTAL2",
        "side": "B",
        "type": "input",
        "desc": "可選 32.768kHz 石英振盪器接腳；未接晶體時使用內建 32kHz 振盪器"
      },
      {
        "num": "7",
        "name": "XTAL1",
        "side": "B",
        "type": "input",
        "desc": "可選 32.768kHz 石英振盪器接腳（與 XTAL2 成對）"
      },
      {
        "num": "8",
        "name": "GND/VSS",
        "side": "R",
        "type": "ground",
        "desc": "接地"
      },
      {
        "num": "9",
        "name": "TACH6",
        "side": "R",
        "type": "input",
        "desc": "轉速計輸入 6（數位或類比訊號可設定）；數位 TACH 可做 RPM 閉迴路，類比可偵測 2 線風扇失效"
      },
      {
        "num": "10",
        "name": "PWMOUT6",
        "side": "R",
        "type": "io",
        "desc": "開汲極 PWM 輸出 6（4 線風扇 PWM 或經電晶體調變 2/3 線風扇）；可再配置為 TACH12 輸入；可上拉至 3.3V"
      },
      {
        "num": "11",
        "name": "TACH5",
        "side": "R",
        "type": "input",
        "desc": "轉速計輸入 5（數位或類比訊號可設定）"
      },
      {
        "num": "12",
        "name": "PWMOUT5",
        "side": "R",
        "type": "io",
        "desc": "開汲極 PWM 輸出 5；可再配置為 TACH11 輸入"
      },
      {
        "num": "13",
        "name": "TACH4",
        "side": "R",
        "type": "input",
        "desc": "轉速計輸入 4（數位或類比訊號可設定）"
      },
      {
        "num": "14",
        "name": "PWMOUT4",
        "side": "R",
        "type": "io",
        "desc": "開汲極 PWM 輸出 4；可再配置為 TACH10 輸入"
      },
      {
        "num": "15",
        "name": "TACH3",
        "side": "T",
        "type": "input",
        "desc": "轉速計輸入 3（數位或類比訊號可設定）"
      },
      {
        "num": "16",
        "name": "PWMOUT3",
        "side": "T",
        "type": "io",
        "desc": "開汲極 PWM 輸出 3；可再配置為 TACH9 輸入"
      },
      {
        "num": "17",
        "name": "TACH2",
        "side": "T",
        "type": "input",
        "desc": "轉速計輸入 2（數位或類比訊號可設定）"
      },
      {
        "num": "18",
        "name": "PWMOUT2",
        "side": "T",
        "type": "io",
        "desc": "開汲極 PWM 輸出 2；可再配置為 TACH8 輸入"
      },
      {
        "num": "19",
        "name": "TACH1",
        "side": "T",
        "type": "input",
        "desc": "轉速計輸入 1（數位或類比訊號可設定）"
      },
      {
        "num": "20",
        "name": "PWMOUT1",
        "side": "T",
        "type": "io",
        "desc": "開汲極 PWM 輸出 1；可再配置為 TACH7 輸入"
      },
      {
        "num": "21",
        "name": "VCC",
        "side": "T",
        "type": "power",
        "desc": "電源 1.62–3.6V；至少 0.1µF 旁路電容至 GND"
      },
      {
        "num": "22",
        "name": "SDA",
        "side": "L",
        "type": "io",
        "desc": "I2C 串列資料（開汲極）"
      },
      {
        "num": "23",
        "name": "SCL",
        "side": "L",
        "type": "input",
        "desc": "I2C 串列時脈（開汲極）"
      },
      {
        "num": "24",
        "name": "{FAN_FAIL}",
        "side": "L",
        "type": "output",
        "desc": "風扇故障輸出（低有效、開汲極）：偵測到故障條件時拉低"
      },
      {
        "num": "25",
        "name": "PWM_START0",
        "side": "L",
        "type": "input",
        "desc": "上電取樣：設定所有 PWMOUT 佔空比預設值"
      },
      {
        "num": "26",
        "name": "PWM_START1",
        "side": "L",
        "type": "input",
        "desc": "上電取樣：設定所有 PWMOUT 佔空比預設值（與 PWM_START0 成對）"
      },
      {
        "num": "27",
        "name": "{FULL_SPEED}",
        "side": "L",
        "type": "input",
        "desc": "拉低時強制所有 PWM 100% 佔空比（唯一例外：已失效風扇且選了失效佔空比歸零模式）"
      },
      {
        "num": "28",
        "name": "CLKOUT",
        "side": "L",
        "type": "output",
        "desc": "32.768kHz 時脈輸出（源自外部晶體或內建振盪器），恆常有效"
      },
      {
        "num": "29",
        "name": "EP",
        "side": "B",
        "type": "ground",
        "desc": "散熱焊墊 Thermal Pad（GND/VSS），接 GND",
        "ep": true
      }
    ],
    "thermalPad": "Thermal Pad（GND/VSS）接 GND（表列＋pin 圖中央雙佐證）",
    "specs": [
      {
        "k": "電源",
        "v": "1.62V–3.6V；–40°C~125°C"
      },
      {
        "k": "PWM",
        "v": "6 路 9-bit，25Hz–25kHz，佔空比變化率可設"
      },
      {
        "k": "TACH",
        "v": "6 專用＋PWMOUT 可再配置，最多 12 路 11-bit"
      },
      {
        "k": "介面",
        "v": "I2C fast-mode 400kbps，16 種硬體位址"
      },
      {
        "k": "時脈",
        "v": "內建 32kHz ±5%；可外接 32.768kHz 晶體；CLKOUT 輸出"
      },
      {
        "k": "相容",
        "v": "與常見風扇控制器 pin-to-pin / BOM-to-BOM / 暫存器相容"
      }
    ],
    "secondSource": [],
    "dropIn": []
  },
  {
    "part": "X4003",
    "mfr": "Intersil (Renesas)",
    "category": "power",
    "subcategory": "CPU 監控器（POR＋看門狗＋低電壓監測）",
    "package": "8-SOIC / 8-MSOP / 8-TSSOP（本條目取 SOIC 腳位）",
    "whatIs": "CPU 監控器三合一：上電復位（POR）、可選看門狗計時器、供電電壓監測，單晶片取代三顆功能降低成本。",
    "func": "上電時維持 RESET 有效 250ms 讓電源與振盪器穩定；運轉中 VCC 跌破 VTRIP 門檻即斷言 RESET；看門狗監看 SDA/SCL 活動（I2C start＋stop 樣式餵狗），逾時未餵即復位。",
    "usedIn": "微控制器/微處理器系統的電源監督與當機自復（工控板、嵌入式系統的 supervisor 位置）。",
    "desc": "8 腳 CPU supervisor（2005 年 Intersil 文件 FN8113.0，現屬 Renesas）。看門狗 200ms/600ms/1.4s/關閉四檔可選；五檔標準 VTRIP（4.62/4.38/2.92/2.68/1.75V）且可用特殊程序微調；RESET 有效至 VCC=1V。X4003=RESET 低有效、X4005=RESET 高有效（同檔姊妹料）。TSSOP 腳位映射：WP=1,VCC=2,NC=3,4,RESET=5,VSS=6,SDA=7,SCL=8；MSOP：VCC=1,RESET=2,VSS=3,SDA=4,SCL=5,WP=6。",
    "datasheet": "Intersil FN8113.0",
    "pins": [
      {
        "num": "1",
        "name": "NC",
        "side": "L",
        "type": "nc",
        "desc": "無內部連接"
      },
      {
        "num": "2",
        "name": "NC",
        "side": "L",
        "type": "nc",
        "desc": "無內部連接"
      },
      {
        "num": "3",
        "name": "{RESET}",
        "side": "L",
        "type": "output",
        "desc": "復位輸出（X4003 低有效，開汲極）：VCC 低於 VTRIP、看門狗逾時、或上電時有效；上電後維持 250ms。X4005 版本為高有效 RESET"
      },
      {
        "num": "4",
        "name": "VSS",
        "side": "L",
        "type": "ground",
        "desc": "接地"
      },
      {
        "num": "5",
        "name": "SDA",
        "side": "R",
        "type": "io",
        "desc": "I2C 串列資料（開汲極、需上拉、可 wire-OR；輸入緩衝恆有效）；兼看門狗餵狗輸入（SDA 高→低＋SCL 高→低＋stop 條件=餵狗）"
      },
      {
        "num": "6",
        "name": "SCL",
        "side": "R",
        "type": "input",
        "desc": "I2C 串列時脈，控制資料輸出入時序"
      },
      {
        "num": "7",
        "name": "WP",
        "side": "R",
        "type": "input",
        "desc": "寫入保護：拉高鎖定看門狗計時器設定"
      },
      {
        "num": "8",
        "name": "VCC",
        "side": "R",
        "type": "power",
        "desc": "電源 1.8–5.5V"
      }
    ],
    "thermalPad": "無（SOIC/MSOP/TSSOP 皆無外露焊墊）",
    "specs": [
      {
        "k": "電源",
        "v": "1.8V–5.5V"
      },
      {
        "k": "看門狗",
        "v": "200ms / 600ms / 1.4s / 關閉，四檔可選（非揮發設定，WP 可鎖）"
      },
      {
        "k": "VTRIP",
        "v": "標準五檔 4.62/4.38/2.92/2.68/1.75V，可程式微調"
      },
      {
        "k": "待機電流",
        "v": "12µA typ（看門狗開）／800nA typ（看門狗關）；工作 3mA"
      },
      {
        "k": "介面",
        "v": "I2C 400kHz"
      },
      {
        "k": "變體",
        "v": "X4003=RESET 低有效；X4005=RESET 高有效（同 datasheet）"
      }
    ],
    "secondSource": [],
    "dropIn": []
  },
  {
    "part": "NX48P0407",
    "mfr": "NXP Semiconductors",
    "category": "power",
    "subcategory": "USB Type-C CC/SBU 保護 IC（48V，USB PD EPR）",
    "package": "HVQFN16",
    "whatIs": "48V Type-C CC 與 SBU 線路保護 IC：以超快 OVP 響應保護 CC/SBU 腳免於 short-to-VBUS 損壞，支援 USB PD EPR（最高 48V VBUS）系統。",
    "func": "串接在 USB PD 控制器（HOST 側）與 Type-C 連接器（CON 側）之間，CC1/CC2 與 SBU1/SBU2 各走一對開關；偵測過壓即切斷並以 FLAG 回報；內建 dead-battery Rd（DBRD 腳）讓無電池狀態仍能被供電端識別。",
    "usedIn": "USB PD EPR（28V/36V/48V）筆電/行動電源/顯示器的 Type-C 埠保護，PD 控制器前端。",
    "desc": "HVQFN16 的 Type-C CC/SBU 保護 IC（NXP short datasheet Rev 1.0, 2024-08）。含 IEC ESD/突波保護、post clamp、OVP（OVPSEL 選檔）、POR/OTP/UVLO、電荷泵與 dead-battery 電路。注意：datasheet 表中 CON_SBU1 描述誤印為「Connect SBU2」、CON_CC1 誤印為「Connect CC2」，照名稱對應即可。",
    "datasheet": "NXP NX48P0407_SDS Rev 1.0",
    "pins": [
      {
        "num": "1",
        "name": "HOST_CC1",
        "side": "L",
        "type": "io",
        "desc": "系統側 CC1（P/AIO）：接 USB CC/PD 控制器的 CC1"
      },
      {
        "num": "2",
        "name": "HOST_CC2",
        "side": "L",
        "type": "io",
        "desc": "系統側 CC2（P/AIO）：接 USB CC/PD 控制器的 CC2"
      },
      {
        "num": "3",
        "name": "HOST_SBU1",
        "side": "L",
        "type": "io",
        "desc": "系統側 SBU1（A/DIO）"
      },
      {
        "num": "4",
        "name": "HOST_SBU2",
        "side": "L",
        "type": "io",
        "desc": "系統側 SBU2（A/DIO）"
      },
      {
        "num": "5",
        "name": "SBUEN",
        "side": "B",
        "type": "input",
        "desc": "SBU 開關致能（DI）：拉高開啟 SBU 開關；內建 1.8MΩ 下拉電阻"
      },
      {
        "num": "6",
        "name": "FLAG",
        "side": "B",
        "type": "output",
        "desc": "故障指示輸出（DO，開汲極低有效）：故障時拉低；需外部上拉電阻"
      },
      {
        "num": "7",
        "name": "OVPSEL",
        "side": "B",
        "type": "input",
        "desc": "SBU 過壓保護（OVP）檔位選擇（DI）"
      },
      {
        "num": "8",
        "name": "GND",
        "side": "B",
        "type": "ground",
        "desc": "接地（AG）"
      },
      {
        "num": "9",
        "name": "CON_SBU2",
        "side": "R",
        "type": "io",
        "desc": "連接器側 SBU2（A/DIO）：接 Type-C 連接器 SBU2"
      },
      {
        "num": "10",
        "name": "CON_SBU1",
        "side": "R",
        "type": "io",
        "desc": "連接器側 SBU1（A/DIO）：接 Type-C 連接器 SBU1（datasheet 描述欄誤印 SBU2，照名稱對應）"
      },
      {
        "num": "11",
        "name": "CON_CC2",
        "side": "R",
        "type": "io",
        "desc": "連接器側 CC2（P/AIO）：接 Type-C 連接器 CC2"
      },
      {
        "num": "12",
        "name": "CON_CC1",
        "side": "R",
        "type": "io",
        "desc": "連接器側 CC1（P/AIO）：接 Type-C 連接器 CC1（datasheet 描述欄誤印 CC2，照名稱對應）"
      },
      {
        "num": "13",
        "name": "DBRD_CC1",
        "side": "T",
        "type": "analog",
        "desc": "Dead-Battery 模式 CC1 的 Rd 端（AG）"
      },
      {
        "num": "14",
        "name": "DBRD_CC2",
        "side": "T",
        "type": "analog",
        "desc": "Dead-Battery 模式 CC2 的 Rd 端（AG）"
      },
      {
        "num": "15",
        "name": "VDD",
        "side": "T",
        "type": "power",
        "desc": "電源輸入（PI）：接系統電壓，1µF 旁路電容至 GND"
      },
      {
        "num": "16",
        "name": "GND",
        "side": "T",
        "type": "ground",
        "desc": "接地（AG）"
      }
    ],
    "thermalPad": "short datasheet 的 pin 表與 pin 圖均未標示 EP 接法——HVQFN 封裝物理上有中央裸露焊墊，接法照 NXP 完整版 datasheet 確認（誠實界定，不編造）",
    "specs": [
      {
        "k": "保護對象",
        "v": "Type-C CC1/CC2 與 SBU1/SBU2 的 short-to-VBUS（最高 48V PD EPR）"
      },
      {
        "k": "保護機制",
        "v": "超快 OVP 切斷、IEC ESD/突波保護、post clamp、OTP"
      },
      {
        "k": "Dead battery",
        "v": "內建 Rd（DBRD_CC1/CC2），無電池仍可被識別供電"
      },
      {
        "k": "指示",
        "v": "FLAG 開汲極低有效故障輸出"
      },
      {
        "k": "文件",
        "v": "Product short data sheet Rev 1.0（2024-08）；完整規格見 NXP 完整版"
      }
    ],
    "secondSource": [],
    "dropIn": []
  }
];
