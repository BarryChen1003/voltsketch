/**
 * knowledge-paid.js — 付費分類知識卡（電子紙 / 智慧手錶 / 手機 / 車用電子 / AI 伺服器 / 筆電）
 * 掛法：append 進 window.KNOWLEDGE_EXTRA（knowledge.js getSampleKnowledge 併入）；products 決定付費鎖+分類歸屬。
 * 載入順序：knowledge-extra.js → 本檔 → knowledge.js。加卡務必 bump knowledge.js BUILTIN_VERSION + knowledge.html ?v=。
 * i18n（en/ja/ko）為後續批次；circuits SVG 視需要再補。
 */
(function () {
  var T = '2026-07-04T10:00:00Z';
  var CARDS = [
    // ================= 電子紙 E-Paper =================
    {
      id: 'epd-driver-waveform', title: '電子紙驅動與波形（EPD Waveform）', category: 'signal-processing', products: ['電子紙'],
      description: '電泳顯示（EPD）靠帶電微膠囊在電場下遷移顯色。畫面更新不是「寫入」而是「用一連串電壓脈衝把粒子推到位」——這串脈衝就是 waveform。',
      principles: '每顆微膠囊含黑（帶負電）白（帶正電）粒子，懸浮在透明液中。像素電極施正電壓→白粒子上浮顯白，負電壓→黑粒子上浮顯黑。灰階靠脈衝時間/次數調中間位置。Waveform＝(起始灰階, 目標灰階, 溫度)→電壓序列的查找表（LUT），存在 driver IC 或主機。更新時 TCON 逐幀送 2-bit（往正/往負/保持/接地）給源極驅動，跑完整條 waveform（數百 ms）粒子才穩定。',
      circuits: [],
      keyFormulas: ['更新時間 ∝ waveform 幀數 × 幀週期（典型 ~50Hz 幀率）', '灰階數 = LUT 支援階數（黑白 2 階 / 16 灰階 / 彩色更多）', '粒子遷移 ∝ 電場 × 時間（故灰階靠脈衝寬度）', '殘影 = 前一畫面粒子未完全歸位'],
      designNotes: ['Waveform LUT 必須配對面板型號與批次，用錯會殘影或顯色不準', 'DC-balance：一個更新週期正負電壓積分要≈0，否則長期殘留（image sticking）', '溫度直接影響液體黏度→waveform 隨溫切換（見 epd-temp-comp）', '更新中不可斷電，粒子會停在半途', '局部更新省時但累積殘影，定期插一次全刷新清除'],
      commonMistakes: ['用錯溫區的 waveform → 顯色淡或鬼影', '沒做 DC-balance → 面板長期殘留、壽命降', '更新途中掉電源軌 → 畫面花掉', '一直局部刷新不全刷 → 殘影越積越重'],
      examples: [{ title: '電子貨架標籤 ESL', application: '更新價格：主機送新畫面 → driver 查 waveform LUT → 跑完粒子定位', circuit: 'EPD 面板 + 驅動 IC（如 UC8xxx/SSD16xx）+ MCU SPI' }],
      relatedTopics: ['epd-power-rails', 'epd-temp-comp', 'epd-tcon'], sourcePdf: null, createdAt: T, updatedAt: T
    },
    {
      id: 'epd-power-rails', title: '電子紙多軌電源（VGH/VGL/VCOM）', category: 'power-management', products: ['電子紙'],
      description: 'EPD 要正負高壓推粒子：閘極正負（VGH/VGL）、源極正負（VPOS/VNEG，±15V 級）、共通電極 VCOM。多從單一電池用電荷泵升出來。',
      principles: 'EPD 面板需要一組對稱正負高壓：VPOS/VNEG（源極驅動，典型 ±15V）、VGH/VGL（TFT 閘極開關，如 +22V/−20V）、VCOM（共通電極偏壓，通常小負值−1~−3V 且需可微調）。主流用整合 PMIC（如 TPS65185/SY7636）：內建升壓＋電荷泵一次生成全部軌，並提供上電/下電時序控制（powergood/pwrup 腳）。VCOM 值影響顯色對比，通常出廠校準存在面板或 PMIC EEPROM。',
      circuits: [],
      keyFormulas: ['VPOS/VNEG 對稱 ±15V 級（面板規格決定）', 'VGH−VGL ≈ 40V 級（TFT 開關擺幅）', 'VCOM 需可調且穩定（漂移→對比變化）', '上電時序：VN 先於 VP，VGL 先於 VGH（PMIC 內建）'],
      designNotes: ['用專用 EPD PMIC，別自己拼分立升壓（時序難搞）', 'VCOM 走線遠離高速數位，雜訊會直接變成顯示雜點', '各軌去耦電容依 PMIC datasheet 選（電荷泵飛渡電容容值/耐壓要對）', 'PMIC 的 powergood 接 MCU，更新前確認電源就緒', '面板不更新時可關高壓軌省電（EPD 保持畫面不耗電）'],
      commonMistakes: ['自拼升壓時序錯 → TFT 閂鎖或面板損傷', 'VCOM 用固定值不校準 → 對比差、灰階偏', '飛渡電容耐壓不足 → 電荷泵輸出崩', '待機不關高壓軌 → 白白耗電，失去 EPD 省電優勢'],
      examples: [{ title: '電子書電源', application: '單顆鋰電 → EPD PMIC → 全套 ±15V/VGH/VGL/VCOM', circuit: 'TPS65185 類 EPD PMIC + 飛渡/儲能電容' }],
      relatedTopics: ['epd-driver-waveform', 'charge-pump', 'power-sequencing'], sourcePdf: null, createdAt: T, updatedAt: T
    },
    {
      id: 'epd-tcon', title: '電子紙 TCON 與介面時序', category: 'communication', products: ['電子紙'],
      description: 'TCON（時序控制器）把主機送來的畫面資料轉成源極/閘極驅動的掃描時序。小屏走 SPI，大屏走並列或專用介面。',
      principles: 'TCON 負責：接收主機影像（SPI/並列/或整合在 driver IC 內）→ 逐行掃描 → 對每像素依 waveform 送對應電壓命令給源極驅動 → 閘極驅動逐行開通 TFT。小尺寸 EPD（ESL/穿戴）driver+TCON 常整合成單晶片，MCU 透過 SPI 送指令（初始化、載入影像 RAM、觸發更新）。大尺寸（電子紙看板）用獨立 TCON + 多顆源極驅動級聯，介面資料率高改走並列或 LVDS 級。',
      circuits: [],
      keyFormulas: ['更新幀率典型 ~50Hz（EPD 慢，非視頻）', 'SPI 時脈依 driver 上限（常見 ≤ 20MHz）', '影像 RAM 大小 = 解析度 × 每像素位元（1bpp 黑白 / 2bpp 4灰階）', '級聯源極驅動：資料 shift 過整條鏈'],
      designNotes: ['SPI 走線短、CS/DC/BUSY 腳齊全（BUSY 指示更新中，MCU 要等）', '雙 RAM（舊/新畫面）供 driver 算差異做局部更新', 'reset 腳時序照 datasheet，上電先 reset 再初始化', '大屏級聯要注意各驅動 timing skew 與電源分配', '介面電壓域對齊（1.8V/3.3V），跨域加 level shift'],
      commonMistakes: ['沒等 BUSY 就送下一命令 → 更新中斷、畫面錯', '初始化序列漏步驟 → 面板無反應或亂顯', 'SPI 超速 → 間歇通訊失敗', '局部更新沒維護舊 RAM → 差異算錯出鬼影'],
      examples: [{ title: '小尺寸模組', application: 'MCU SPI 送指令+影像 → 觸發 → 讀 BUSY 等完成', circuit: 'MCU ↔ SPI ↔ EPD driver（含 TCON）' }],
      relatedTopics: ['epd-driver-waveform', 'spi-design'], sourcePdf: null, createdAt: T, updatedAt: T
    },
    {
      id: 'epd-partial-refresh', title: '局部更新 vs 全刷新與殘影', category: 'signal-processing', products: ['電子紙'],
      description: 'EPD 更新分全刷（整屏閃黑白清粒子）與局部刷（只動變化區、不閃）。局部快但累積殘影，要靠週期性全刷清除。',
      principles: '全刷新（full update）：整屏跑完整 waveform，含反覆黑白翻轉把所有粒子推到極端再定位，畫質乾淨但會閃、耗時（數百 ms~1s）。局部更新（partial update）：只對變化像素送短 waveform、不整屏閃，適合時鐘/翻頁，但每次都留一點粒子未歸位的殘影（ghosting），連續數十次後可見。策略：平時局部更新求速度與無閃，累積 N 次或畫面大改時插一次全刷清屏。DC-balance 在局部更新更難維持，需 driver 支援。',
      circuits: [],
      keyFormulas: ['全刷時間 > 局部刷時間（全刷含清屏翻轉）', '殘影累積 ∝ 連續局部更新次數', '建議每 5~20 次局部更新插 1 次全刷（面板而定）', '局部更新功耗 < 全刷（脈衝少）'],
      designNotes: ['UI 設計避免整屏頻繁大改，善用局部區塊', '設「局部次數計數器」，到閾值自動全刷', '快速局部更新模式（如 A2）畫質差但最快，僅適合純黑白', '低溫下局部更新殘影更明顯，低溫強制全刷', '長期顯示同一畫面前先全刷，避免烙印'],
      commonMistakes: ['只用局部更新不全刷 → 鬼影堆到看不清', '快速模式拿來顯示灰階 → 灰階失真', '低溫還硬做局部 → 殘影嚴重', 'UI 整屏抖動 → 每次都近似全刷，失去局部優勢'],
      examples: [{ title: '電子紙時鐘', application: '每分鐘局部更新秒/分，每小時全刷一次清殘影', circuit: 'MCU 維護更新計數 + 全刷觸發' }],
      relatedTopics: ['epd-driver-waveform', 'epd-temp-comp'], sourcePdf: null, createdAt: T, updatedAt: T
    },
    {
      id: 'epd-temp-comp', title: '電子紙溫度補償', category: 'measurement', products: ['電子紙'],
      description: 'EPD 靠液中粒子遷移顯色，液體黏度隨溫度變——冷了粒子跑得慢。同一畫面在 0°C 與 40°C 要用不同 waveform，否則顯色不準或殘影。',
      principles: '電泳液黏度隨溫度指數變化：低溫黏、粒子遷移慢，需更長/更強的 waveform；高溫稀、遷移快，過驅動會過衝。故 driver/主機依溫度分區（如 <5°C、5-15°C、15-25°C…）各存一套 waveform LUT。系統靠面板內建溫感或外接 NTC/數位溫度 IC 讀溫，選對應 LUT。整合型 EPD PMIC（如 TPS65185）內建溫度感測直接回報。溫區邊界更新畫質會跳，設計要涵蓋工作溫域。',
      circuits: [],
      keyFormulas: ['低溫 → 更新時間拉長（waveform 幀數增加）', '液體黏度 ∝ exp(1/T)（近似 Arrhenius）', '溫區數 = LUT 提供的分段數', '超出工作溫域 → 顯色不保證（拒絕更新或警示）'],
      designNotes: ['溫感放在靠近面板處，量到的才是面板溫度', '整合 PMIC 有溫感就用它，少一顆料', '極低溫（<0°C）可能需加熱或禁止更新（依面板規格）', 'waveform LUT 檔跟面板走，換面板供應商要換 LUT', '溫度讀取失敗要有 fallback（用室溫 LUT + 警示）'],
      commonMistakes: ['固定用室溫 waveform → 冬天顯色淡、殘影', '溫感放遠處量到板溫非面板溫 → 補償偏差', '超低溫硬更新 → 粒子推不動、畫面殘缺', '換面板批次沒換 LUT → 顯色跑掉'],
      examples: [{ title: '戶外電子看板', application: '讀面板溫 → 選對應溫區 waveform → 更新', circuit: 'EPD PMIC 內建溫感 or 外接 NTC → MCU 選 LUT' }],
      relatedTopics: ['epd-driver-waveform', 'ntc-thermistor'], sourcePdf: null, createdAt: T, updatedAt: T
    },

    // ================= 智慧手錶 Smartwatch =================
    {
      id: 'wearable-pmu', title: '穿戴 PMU 超低功耗電源', category: 'power-management', products: ['智慧手錶'],
      description: '手錶電池小（幾十~幾百 mAh），要撐一天以上。整合 PMU 用多個高效 DC-DC + LDO 供各域，並把待機電流壓到 µA 級。',
      principles: '穿戴 PMU（如 nPM/MAX 系列）整合：電池充電、多路 buck（供 SoC 核心、記憶體）、多路 LDO（供類比/感測/RF）、負載開關（切非用中的子系統）、電量計。關鍵在「輕載效率」與「待機電流」：多數時間手錶在睡眠，SoC 幾乎不耗電，此時 buck 要進 PFM/burst 模式維持高輕載效率，PMU 自身靜態電流（Iq）要 µA 級。用負載開關把螢幕/GPS/感測完全斷電（不是待機而是切掉漏電）。',
      circuits: [],
      keyFormulas: ['續航 ≈ 電池容量(mAh) / 平均電流(mA)', '待機電流目標 µA 級（PMU Iq + SoC sleep + 漏電）', '輕載效率靠 PFM/burst 模式維持', '負載開關切斷 = 漏電歸零（非待機）'],
      designNotes: ['選 Iq 低的 PMU，待機電流決定續航', '不用的子系統用負載開關「切掉」而非留待機', 'buck 支援 PFM 自動輕載切換', '感測/RF 用 LDO 淨化電源（開關雜訊影響 PPG/BLE）', 'always-on 顯示與感測是耗電大戶，優化它們的 duty cycle'],
      commonMistakes: ['用高 Iq 的通用 PMU → 待機就把電池吃光', '子系統只待機不切電 → 漏電累積續航差', 'buck 固定 PWM 不進 PFM → 輕載效率崩', '感測前端直接吃 buck 輸出 → 開關雜訊污染訊號'],
      examples: [{ title: '智慧手錶電源樹', application: '單鋰電 → PMU → SoC buck / 感測 LDO / 螢幕負載開關', circuit: '穿戴 PMIC（nPM1300 類）+ 負載開關 + 電量計' }],
      relatedTopics: ['wearable-lowpower', 'ppg-afe', 'load-switch', 'fuel-gauge'], sourcePdf: null, createdAt: T, updatedAt: T
    },
    {
      id: 'ppg-afe', title: '心率光學前端 PPG AFE', category: 'analog', products: ['智慧手錶'],
      description: 'PPG（光體積變化描記）用綠光 LED 照皮膚、光電二極體收反射光，血流變化調變反射強度→心率。微弱訊號淹在環境光與動作雜訊裡，靠專用 AFE 挖出來。',
      principles: 'LED 驅動器脈衝點亮綠/紅/紅外 LED，光穿入皮膚被血液吸收，光電二極體收反射。心跳時微血管血量變化→反射光微弱調變（AC 成分 << DC 背景）。AFE（如 MAX86/AFE44xx）做：環境光相消（LED 關時取樣扣背景）、跨阻放大（TIA 把光電流轉電壓）、高增益、ADC。難點是動作假影（手動＝光路變）與環境光——用同步取樣（只在 LED 亮時測）＋加速度計資料做動作補償。SpO2 用紅光/紅外比值算血氧。',
      circuits: [],
      keyFormulas: ['AC/DC 比 = 脈動訊號 / 背景（很小，需高增益+高解析 ADC）', 'SpO2 ∝ 紅光/紅外 吸收比', 'LED 脈衝 duty 低（省電＋同步取樣）', 'SNR 靠環境光相消 + 動作補償'],
      designNotes: ['LED 與光電二極體間加光屏障，防直接漏光', '感測器貼皮膚，機構要遮環境光', '同步取樣：LED 亮/滅各取樣，相減去背景', '接加速度計做動作假影消除（演算法融合）', 'AFE 電源用乾淨 LDO，開關雜訊會進訊號', 'LED 電流別過大（省電＋防過熱燙皮膚）'],
      commonMistakes: ['LED 漏光直接進光電二極體 → 訊號飽和', '沒做環境光相消 → 陽光下量不到', '忽略動作假影 → 運動時心率亂跳', 'AFE 吃髒電源 → 基線雜訊蓋過脈動'],
      examples: [{ title: '手錶心率/血氧', application: '綠光量心率、紅/紅外量 SpO2，融合 accel 去動作雜訊', circuit: 'MAX86 類 PPG AFE + LED 驅動 + 光電二極體 + I2C 到 SoC' }],
      relatedTopics: ['photodiode-tia', 'wearable-pmu', 'adc-dac-basics'], sourcePdf: null, createdAt: T, updatedAt: T
    },
    {
      id: 'wearable-amoled', title: '穿戴 AMOLED 電源與 Always-On', category: 'power-management', products: ['智慧手錶'],
      description: '手錶小 AMOLED 自發光、每像素獨立，黑=不耗電。需 ELVDD/ELVSS 正負軌，always-on 顯示（AOD）靠低亮度+低更新率壓功耗。',
      principles: 'AMOLED 每像素是自發光二極體，亮度靠電流驅動：需正軌 ELVDD（+4~5V）與負軌 ELVSS（−1~−5V），面板電源 IC（含升壓+電荷泵）從電池生成。功耗 ∝ 亮度 × 亮像素數，故深色 UI 省電、純黑不耗電（像素關）。Always-on Display：低更新率（1Hz）、低亮度、少亮像素（時鐘輪廓）維持顯示。像素會老化（尤其藍），AOD 需輪替像素位置防烙印。觸控與顯示常整合（TDDI）。',
      circuits: [],
      keyFormulas: ['功耗 ∝ 亮度 × 亮像素數（黑像素≈0）', 'ELVDD/ELVSS 正負軌供 OLED 電流', 'AOD：低更新率(≤1Hz) + 低亮度 + 少亮像素', '像素老化 ∝ 累積發光量（藍最快）'],
      designNotes: ['UI 用深色/純黑底大幅省電（穿戴續航關鍵）', 'AOD 內容位置輪替防烙印', '面板電源 IC 的 ELVDD/ELVSS 去耦要足，暗→亮瞬態大', '亮度自動調（環境光感測）省電＋護眼', '顯示不更新時降更新率或關面板電源'],
      commonMistakes: ['用白底 UI → OLED 功耗爆、續航差', 'AOD 固定畫面不輪替 → 藍像素烙印', 'ELVDD/ELVSS 去耦不足 → 亮度變化時閃爍', '亮度固定最大 → 室內刺眼又耗電'],
      examples: [{ title: '手錶 AOD 錶面', application: '純黑底 + 時鐘輪廓 + 1Hz 更新 + 位置輪替', circuit: 'AMOLED 面板 + 電源 IC（ELVDD/ELVSS）+ 環境光感測' }],
      relatedTopics: ['wearable-pmu', 'charge-pump'], sourcePdf: null, createdAt: T, updatedAt: T
    },
    {
      id: 'wearable-qi-rx', title: '穿戴無線充電接收（Qi RX）', category: 'power-management', products: ['智慧手錶'],
      description: '手錶多用無線充電（防水、無接點）。接收線圈感應充電座磁場→整流→充電。小體積下線圈耦合與散熱是難點。',
      principles: 'Qi 無線充電：發射端（充電座）線圈通高頻交流生磁場，接收端（手錶）線圈感應出交流，經整流（同步整流器）+穩壓給充電 IC。通訊靠負載調變（RX 改變負載，TX 偵測到→調功率）做握手與功率協商。手錶專用方案（非標準 Qi 或私有協定）常見，因體積小、功率低（<5W）、要防異物加熱。線圈與電池/主板間需磁性屏蔽（ferrite）防渦流發熱與干擾。整流+充電常整合單晶片。',
      circuits: [],
      keyFormulas: ['耦合係數 k ∝ 線圈對準度與距離', '接收功率 ∝ 磁通變化率 × 匝數', '效率受線圈 Q、對準、屏蔽影響', 'FOD（異物偵測）：功率損失超標→停充'],
      designNotes: ['接收線圈與主板間放 ferrite 片，屏蔽渦流＋導磁', '整流用同步整流降損耗發熱（手錶散熱差）', '充電時面板/感測可關，減發熱', '對準機構（磁吸）確保 k 足夠', 'FOD 防金屬異物被加熱（安全）', '防水設計：無外露接點是無線充電主因'],
      commonMistakes: ['沒放 ferrite → 渦流在主板發熱、效率差、干擾', '用二極體整流 → 壓降發熱嚴重（小空間散不掉）', '對準差 k 低 → 充不進或效率極低', '無 FOD → 異物加熱安全風險'],
      examples: [{ title: '手錶磁吸充電', application: '磁吸對準 → 感應 → 同步整流 → 充電 IC', circuit: 'RX 線圈 + ferrite + 整流/充電 IC + 鋰電' }],
      relatedTopics: ['wearable-pmu', 'battery-charger'], sourcePdf: null, createdAt: T, updatedAt: T
    },
    {
      id: 'wearable-lowpower', title: '穿戴超低功耗系統設計', category: 'embedded', products: ['智慧手錶'],
      description: '手錶續航＝把「平均電流」壓到最低。核心手法：多數時間深睡（µA）、感測與無線用極低 duty cycle、事件驅動而非輪詢。',
      principles: '穿戴功耗預算以「平均電流」算：續航 = 電池 mAh / 平均 mA。系統絕大多數時間在深睡（SoC sleep + RTC 醒來），僅事件（觸控、抬腕、BLE 連線窗）才短暫全速。手法：①感測器用內建 FIFO 累積資料、批次喚醒 SoC（不是每筆都醒）②BLE 用長連線間隔、少廣播③螢幕/GPS 這種耗電大戶嚴格 duty cycle 或按需④用硬體周邊（感測 hub / 低功耗協處理器）做常態工作、主 SoC 睡。量測用電流計 profile 各狀態電流，抓漏電源。',
      circuits: [],
      keyFormulas: ['續航 = 電池容量(mAh) / 平均電流(mA)', '平均電流 = Σ(各狀態電流 × 佔時比)', '深睡佔比越高越省（睡眠電流 µA 級）', 'BLE 平均功耗 ∝ 1/連線間隔'],
      designNotes: ['感測器開 FIFO 批次喚醒，減少 SoC 醒來次數', 'BLE 連線間隔/廣播間隔調長（權衡延遲）', '用感測 hub 協處理器分擔常態，主 SoC 深睡', '事件驅動（中斷）取代輪詢', '量產前用電流探棒 profile 每個狀態、抓漏電', '關掉不用周邊的時脈與電源（clock/power gating）'],
      commonMistakes: ['輪詢感測器不用中斷/FIFO → SoC 一直醒、耗電', 'BLE 間隔太短 → 待機電流高、續航差', '子系統只待機不斷電 → 漏電累積', '沒做電流 profiling → 不知道電花在哪、瞎優化'],
      examples: [{ title: '一天以上續航', application: '深睡為主 + FIFO 批次 + 長 BLE 間隔 + AOD 深色', circuit: 'SoC + 感測 hub + 低 Iq PMU（見 wearable-pmu）' }],
      relatedTopics: ['wearable-pmu', 'ppg-afe', 'measurement-basics'], sourcePdf: null, createdAt: T, updatedAt: T
    },

    // ================= 手機 Mobile =================
    {
      id: 'mobile-pmic', title: '手機 PMIC 多軌整合', category: 'power-management', products: ['手機'],
      description: '手機 SoC 要幾十條電源軌（CPU 大小核、GPU、DDR、RF、感測…）。PMIC 把電池電壓整合成全部軌，並受 SoC 用 I2C/SPMI 動態調壓。',
      principles: '手機 PMIC 是巨型整合電源 IC：十幾路 buck（供 CPU 各簇/GPU/DDR，支援 DVS 動態調壓）＋多路 LDO（供類比/感測）＋負載開關＋電池充電＋電量計＋各種監控。SoC 透過 SPMI（MIPI 電源介面）或 I2C 即時命令 PMIC 調各軌電壓（DVFS：頻率高就升壓、閒置就降壓省電）。多相 buck 供大電流核心。上電時序由 PMIC 內部狀態機控管（幾十軌的順序）。旗艦機常用主 PMIC + 副 PMIC 分擔。',
      circuits: [],
      keyFormulas: ['DVS：核心電壓隨 DVFS 動態變（省電關鍵）', '軌數多達數十（每功能域獨立）', '大電流核心用多相 buck', '上電時序由 PMIC 狀態機控'],
      designNotes: ['PMIC 擺位靠近 SoC，大電流軌走線短寬', 'DVS 軌的去耦要應付快速電壓轉換', 'SPMI/I2C 控制匯流排訊號完整性', '各軌去耦嚴格照 SoC power delivery 規範', '熱：PMIC 是發熱源，佈局考慮散熱', '電池路徑（充電/供電）走大電流，Kelvin 量測'],
      commonMistakes: ['大電流軌走線細長 → 壓降、SoC 供電不足當機', 'DVS 軌去耦不足 → 調壓瞬態出錯', 'PMIC 上電時序沒照規範 → SoC 開不了機', '忽略 PMIC 散熱 → 高負載過熱降頻'],
      examples: [{ title: '旗艦手機供電', application: 'SoC DVFS 命令 PMIC 即時調 CPU/GPU 軌壓', circuit: '主 PMIC（多 buck/LDO）+ SPMI 到 SoC + 副 PMIC' }],
      relatedTopics: ['buck-converter', 'usb-pd-fastcharge', 'power-sequencing'], sourcePdf: null, createdAt: T, updatedAt: T
    },
    {
      id: 'usb-pd-fastcharge', title: 'USB-PD / PPS 快充', category: 'power-management', products: ['手機'],
      description: 'USB-PD 讓充電器與手機協商電壓/電流（最高 240W）。PPS 可 20mV 微調電壓，讓充電器直接輸出電池要的電壓（直充），省掉手機內降壓的發熱。',
      principles: 'USB-PD 走 CC 線用 BMC 編碼通訊：手機（Sink）與充電器（Source）協商供電合約（5V/9V/15V/20V… 或 PPS 可調範圍）。傳統充電：充電器固定輸出，手機內 charger IC 降壓給電池，壓差全變熱。PPS（可程式電源）：手機即時命令充電器調電壓（20mV 步進），讓輸出≈電池電壓+線損，手機端用電荷泵直充（2:1 分壓、效率 >97%），發熱大減、充電更快。要 CC 邏輯、E-marker 線（>3A/5A）、VBUS 過壓保護。',
      circuits: [],
      keyFormulas: ['PD 功率 = 協商電壓 × 電流（最高 48V×5A=240W）', 'PPS 步進 20mV（電壓）/ 50mA（電流）', '直充電荷泵 2:1：Vbat ≈ Vbus/2、效率 >97%', '線損補償：Vbus = Vbat×2 + I×R_line'],
      designNotes: ['CC 腳接 PD 控制器，VBUS 加過壓保護（協商失敗防高壓灌入）', '>3A 需 E-marker 線材，設計要驗線材能力', '直充電荷泵發熱低但需大電流路徑（走線/連接器夠粗）', '電池端量測補線損（Kelvin），PPS 才調得準', 'VBUS 大電容放電路徑（拔線後洩放）', '過壓/過流/過溫保護齊全（快充能量大）'],
      commonMistakes: ['沒 VBUS 過壓保護 → 協商異常時 20V 灌爆 5V 元件', '線材不支援大電流硬拉 → 發熱、電壓掉、充不快', '直充路徑走線細 → 大電流壓降、效率降', 'PPS 沒補線損 → 電壓調不準、充電慢'],
      examples: [{ title: '手機超級快充', application: 'PD 協商 PPS → 充電器輸出 ~8V → 手機電荷泵 2:1 直充 4V 電池', circuit: 'PD 控制器 + 電荷泵直充 IC + E-marker 線' }],
      relatedTopics: ['mobile-pmic', 'charge-pump', 'battery-charger', 'usbc-pd-laptop'], sourcePdf: null, createdAt: T, updatedAt: T
    },
    {
      id: 'fuel-gauge', title: '電量計（Fuel Gauge）', category: 'measurement', products: ['手機'],
      description: '準確估電池剩餘電量（SOC）比想像難：電壓非線性、隨負載/溫度/老化變。電量計用庫倫計數+電壓模型融合估算。',
      principles: '電量計要估 SOC（剩餘電量%）與 SOH（健康度）。方法：①庫倫計數——串電流感測電阻積分進出電荷，準但會累積誤差、需校準基準②電壓法（OCV）——開路電壓對 SOC 有對應曲線，但負載下電壓被內阻拉低、要補償③融合（如 TI Impedance Track / MAX ModelGauge）——結合電流積分＋電壓模型＋電池阻抗模型＋溫度，動態修正。老化使容量衰減，電量計要學習更新滿電容量。充放電到特定點（滿/空）時重新校準庫倫基準。',
      circuits: [],
      keyFormulas: ['庫倫計數：ΔSOC = ∫I dt / 容量', 'OCV-SOC：開路電壓查表得 SOC（需靜置去負載）', '負載補償：V_terminal = OCV − I×R_internal', 'SOH = 目前滿電容量 / 出廠容量'],
      designNotes: ['電流感測電阻用 Kelvin 四線量測（消除走線壓降）', '感測電阻值權衡解析度與功耗發熱', '溫度感測接電量計（容量/阻抗隨溫變）', '用電池廠提供的模型參數（或做特性化）', '關機也要維持庫倫計數（低功耗常在計數）', '滿/空校準點讓演算法重置基準'],
      commonMistakes: ['純電壓法沒補內阻 → 高負載時 SOC 亂跳', '純庫倫計數不校準 → 誤差累積、跑掉', '感測電阻沒 Kelvin → 走線壓降污染小訊號', '沒帶溫度/老化 → 低溫或舊電池估不準'],
      examples: [{ title: '手機電量%', application: '融合庫倫+電壓模型+阻抗+溫度，滿空點校準', circuit: '電量計 IC（BQ27/MAX17）+ 感測電阻 + 溫感' }],
      relatedTopics: ['battery-charger', 'current-sensing', 'mobile-pmic'], sourcePdf: null, createdAt: T, updatedAt: T
    },
    {
      id: 'haptics-driver', title: '觸覺回饋驅動（LRA / ERM）', category: 'transistor', products: ['手機'],
      description: '手機震動回饋用 LRA（線性共振致動器）或 ERM（偏心馬達）。LRA 手感細膩但要在共振頻率驅動、且靠煞車讓震動快起快停。',
      principles: 'ERM（偏心轉子馬達）：轉子偏心產生震動，簡單便宜但起停慢（慣性）、手感粗。LRA（線性共振致動器）：質量塊在彈簧上共振，須在其共振頻率（~150-235Hz）驅動效率才高，手感細膩可做細微觸感。專用 haptic driver IC：產生驅動波形、自動追蹤 LRA 共振頻率（用反電動勢偵測）、主動煞車（反向脈衝快速停止殘震，做出「清脆」點按感）。高階用寬頻 LRA + 波形庫做豐富觸感（如 taptic）。',
      circuits: [],
      keyFormulas: ['LRA 須驅動在共振頻率 f0（~150-235Hz）', '偏離 f0 → 效率驟降、手感差', 'ERM 起停時間長（慣性），LRA 可主動煞車快停', '反電動勢偵測 → 自動追蹤共振頻率'],
      designNotes: ['用專用 haptic driver（自動共振追蹤+煞車），別直接 GPIO 推', 'LRA 驅動頻率對準其 f0（不同致動器 f0 不同）', '主動煞車讓震動快停，做出清脆點按', '驅動電流路徑夠（致動器瞬間電流不小）', '機構固定致動器讓震動有效傳到外殼', 'ERM 反向電壓需飛輪二極體/驅動 IC 保護'],
      commonMistakes: ['LRA 沒對準 f0 → 震得弱、耗電、手感爛', '不做煞車 → 殘震拖尾，手感糊', '用 GPIO 硬推馬達 → 無煞車無追蹤、手感差且傷 IO', 'ERM 沒續流保護 → 反電動勢傷驅動'],
      examples: [{ title: '手機點按回饋', application: 'LRA 共振頻率驅動 + 反電動勢追蹤 + 主動煞車', circuit: 'Haptic driver IC（DRV2605 類）+ LRA' }],
      relatedTopics: ['h-bridge-motor', 'relay-driver', 'mobile-pmic'], sourcePdf: null, createdAt: T, updatedAt: T
    },
    {
      id: 'rf-frontend', title: 'RF 前端（PA / LNA / 開關 / 天線調諧）', category: 'high-speed', products: ['手機'],
      description: '手機收發訊號的最前段：發射用功率放大器（PA）推大訊號、接收用低雜訊放大器（LNA）放小訊號、開關切收發與頻段、天線調諧補償手握失配。',
      principles: 'RF 前端（RFFE）接在收發器（transceiver）與天線之間。發射鏈：PA 把小訊號放大到足夠功率（線性度與效率權衡，用包絡追蹤供電省電）。接收鏈：LNA 在最前段放大微弱訊號並決定整體雜訊指數（NF）。開關（SP多T）切換多頻段/收發/天線。濾波器（SAW/BAW/雙工器）分頻段、隔收發。天線調諧器（可調電容）補償手握/環境造成的天線阻抗失配（維持匹配才有效率）。控制走 MIPI RFFE 匯流排。5G 毫米波另有 beamforming 陣列。',
      circuits: [],
      keyFormulas: ['接收 NF 由第一級 LNA 主導（Friis 公式）', 'PA 效率 vs 線性度權衡（用包絡追蹤/DPD 改善）', '天線失配 → 反射（VSWR↑）→ 效率降、發射受限', '匹配網路把天線阻抗拉回 50Ω'],
      designNotes: ['LNA 放最靠近天線（先放大再處理，保 NF）', 'PA 供電用包絡追蹤/APT 隨訊號調壓省電降熱', 'RF 走線 50Ω 控阻抗、短、少過孔', '天線調諧補手握失配（近接感測觸發）', 'MIPI RFFE 控制匯流排，時序對齊 TDD 收發窗', '屏蔽罩＋接地隔離各級防串擾'],
      commonMistakes: ['LNA 前損耗大（長走線/爛開關）→ NF 惡化、收訊差', 'PA 固定供電不用 ET → 效率低、發熱、耗電', 'RF 走線阻抗失控 → 反射損耗、發射效率降', '沒天線調諧 → 手握時失配、掉訊'],
      examples: [{ title: '手機多頻收發', application: '天線 → 調諧 → 開關/雙工 → LNA(收)/PA(發) → 收發器', circuit: 'RFFE 模組（PA/LNA/開關/濾波）+ 天線調諧 + MIPI 控制' }],
      relatedTopics: ['impedance-matching', 'mobile-pmic', 'differential-pair'], sourcePdf: null, createdAt: T, updatedAt: T
    }
  ];
  window.KNOWLEDGE_EXTRA = (window.KNOWLEDGE_EXTRA || []).concat(CARDS);
})();
