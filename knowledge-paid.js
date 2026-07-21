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
    },

    // ================= 車用電子 Automotive =================
    {
      id: 'auto-load-dump', title: '車用 Load Dump 與 ISO 7637 瞬態', category: 'protection', products: ['車用電子'],
      description: '汽車電源環境惡劣：Load dump（發電機甩負載時電壓飆到 ~40V+）、冷啟動掉壓、各種脈衝。ISO 7637/ISO 16750 定義這些瞬態，車規元件必須扛得住。',
      principles: 'Load dump：電池充電中被斷開（如接觸不良），發電機（交流發電機）失去負載，磁場能量瞬間灌到匯流排，12V 系統電壓飆到 30~40V+ 持續數百 ms。現代發電機多內建中央箝位（clamped load dump ~35V），但外部仍需保護。ISO 7637-2 定義脈衝：1（感性斷開負脈衝）、2a/2b、3a/3b（快速瞬態叢波）、4（冷啟動掉壓到 ~6V）、5（load dump）。設計用 TVS+扼流/前級 pre-regulator（升壓或箝位）把亂七八糟的輸入整理成穩定軌再供下游。48V 系統另有規範。',
      circuits: [],
      keyFormulas: ['Load dump 峰值：非箝位 ~87V、箝位型 ~35V（12V 系統）', '冷啟動：電壓掉到 ~6V（pulse 4）→ 下游要能低壓運作或前級升壓', 'TVS 箝位電壓 < 下游耐壓、> 正常工作最高電壓', '能量 = ½ L I²（發電機電感儲能決定 load dump 能量）'],
      designNotes: ['輸入前級：TVS 吸收 load dump + pre-boost/buck 穩壓', '冷啟動用升壓 pre-regulator 維持下游供電（不然掉壓重啟）', 'TVS 選車規 load-dump 專用（大能量、對的箝位電壓）', '反向電池保護串前級（見 reverse-battery-auto）', '元件選車規 AEC-Q（溫域/可靠度），非商規', 'ISO 7637 脈衝要做測試驗證，不能只算'],
      commonMistakes: ['用商規元件扛車用瞬態 → load dump 一來就炸', 'TVS 箝位電壓選太高 → 下游還是超壓損壞', '沒管冷啟動掉壓 → 引擎啟動時系統重開機', '只做 load dump 忘了快速瞬態叢波（3a/3b）→ EMC 過不了'],
      examples: [{ title: '車用 ECU 前級', application: '電池 → 反接保護 → TVS → pre-boost（冷啟動撐住）→ buck 供 MCU', circuit: 'load-dump TVS + LM74700-Q1 理想二極體反接保護 + LM5122-Q1 pre-boost + 車規 buck' }],
      relatedTopics: ['reverse-battery-auto', 'auto-power-arch', 'tvd-selection'], sourcePdf: null, createdAt: T, updatedAt: T
    },
    {
      id: 'reverse-battery-auto', title: '車用防反接（理想二極體 / 背靠背 FET）', category: 'protection', products: ['車用電子'],
      description: '汽車接電池接反是常見人為錯誤。傳統串二極體壓降大又發熱，車用改用 MOSFET 理想二極體或背靠背 FET，低損耗又能擋反向。',
      principles: '防反接三代：①串聯二極體——最簡單，但正常導通時 V_F×I 全變熱、大電流不可行。②P-MOS 高側——閘極接地時反接自動關斷，正常時導通、僅 R_DS(on) 損耗，比二極體好。③理想二極體控制器 + N-MOS——控制器偵測方向、驅動 N-MOS（低 R_DS(on)），正接導通、反接快速關斷，損耗最低。要擋「反向電池」還要能扛前述 load dump，常與前級整合。背靠背 FET（兩顆 source 相對）可同時擋雙向（反接＋反向電流回灌）。',
      circuits: [],
      keyFormulas: ['二極體損耗 P = V_F × I（大電流不可行）', '理想二極體損耗 P = I² × R_DS(on)（低很多）', 'FET 耐壓 ≥ load dump 峰值 + 反向電池電壓', '背靠背 FET 擋雙向（反接 + 回灌）'],
      designNotes: ['大電流用理想二極體控制器 + 低 R_DS(on) N-MOS', 'FET V_DS 耐壓涵蓋 load dump（~40V）留裕度', '與 load dump/反向瞬態保護整合設計', '閘極驅動路徑防瞬態誤觸發', '需雙向阻斷（防回灌）用背靠背 FET', '車規 AEC-Q101（分立元件）認證'],
      commonMistakes: ['用二極體扛大電流反接保護 → 發熱、效率差', 'FET 耐壓不夠涵蓋 load dump → 反接+甩負載雙殺', '理想二極體控制器對瞬態響應慢 → 短暫反灌', '忘了雙向阻斷需求 → 反向電流回灌傷電池/系統'],
      examples: [{ title: '車用電源入口', application: '理想二極體控制器驅動 N-MOS，正接低損導通、反接關斷', circuit: 'LM74700-Q1 類理想二極體 + 車規 N-MOS' }],
      relatedTopics: ['auto-load-dump', 'oring-power', 'load-switch'], sourcePdf: null, createdAt: T, updatedAt: T
    },
    {
      id: 'can-fd-automotive', title: 'CAN-FD / LIN 車用網路', category: 'communication', products: ['車用電子'],
      description: '車內各 ECU 靠 CAN/CAN-FD（高速控制網）與 LIN（低成本子網）通訊。差分匯流排、兩端 120Ω 終端、對 EMC 與故障容錯要求高。',
      principles: 'CAN：差分雙線（CANH/CANL），差分顯性（0）/隱性（1），多主機、非破壞性仲裁（ID 越小優先）。CAN-FD 在資料段提高位元率（最高 ~5-8Mbps）並加大 payload（64 byte），仲裁段仍相容 CAN。物理層靠 CAN 收發器（transceiver），匯流排兩端各 120Ω 終端抑反射。LIN：單線、主從、低速（≤20kbps），成本低，用於車窗/座椅等非即時。車用要求：匯流排短路/斷線容錯、共模範圍寬、瞬態保護（TVS/共模扼流圈）、待機喚醒（partial networking 省電）。',
      circuits: [],
      keyFormulas: ['CAN 終端：兩端各 120Ω（並聯 60Ω 匹配線阻抗）', 'CAN-FD 資料段最高 ~5-8Mbps（仲裁段仍 ≤1Mbps）', 'LIN ≤20kbps 單線主從', '差分傳輸 → 高共模抗擾（車用雜訊環境必要）'],
      designNotes: ['匯流排兩端各 120Ω 終端（不是每個節點都放）', '收發器加共模扼流圈 + TVS（EMC + 瞬態保護）', 'CANH/CANL 走差分對、等長、控阻抗', 'CAN-FD 高速時 stub（分支）要短，減反射', '收發器選車規、支援待機喚醒（省電）', 'LIN 主機端上拉電阻+二極體，從機不放'],
      commonMistakes: ['終端放錯（每節點都放或漏放）→ 反射、通訊錯誤', 'CANH/CANL 不等長/不控阻抗 → CAN-FD 高速失敗', '沒共模扼流圈/TVS → EMC 過不了、瞬態損壞收發器', 'stub 太長 → CAN-FD 資料段位元錯'],
      examples: [{ title: '車身控制網', application: 'ECU 間 CAN-FD 主幹 + LIN 子網控車窗，兩端 120Ω', circuit: 'CAN-FD 收發器 + 共模扼流 + TVS，LIN 收發器' }],
      relatedTopics: ['can-transceiver', 'common-mode-choke', 'differential-pair'], sourcePdf: null, createdAt: T, updatedAt: T
    },
    {
      id: 'auto-power-arch', title: '車用電源架構（前級穩壓 / 冷啟動）', category: 'power-management', products: ['車用電子'],
      description: '車用 12V（或 48V）匯流排髒又晃：冷啟動掉到 6V、load dump 飆 40V。電源架構用前級 pre-regulator 整理後，再多級降壓供各域。',
      principles: '車用電源鏈典型：電池 → 反接保護 → EMI 濾波 → pre-regulator（前級）→ POL（point-of-load）降壓 → 各負載。前級任務是把 6~40V 的亂輸入整理成穩定中間軌（如 5V/3.3V）：冷啟動掉壓時用升壓（boost）或升降壓（buck-boost）撐住，load dump 高壓時靠箝位＋buck 降下來。整合型汽車 pre-regulator（如 LM5xxx-Q1）常含 boost+buck 或寬輸入 buck-boost。下游 POL 各自降到核心/IO/類比軌。全鏈要低靜態電流（車停時仍供部分電路，怕耗盡電瓶）。',
      circuits: [],
      keyFormulas: ['前級輸入範圍需涵蓋 6V(冷啟動)~40V(load dump)', '冷啟動 → boost/buck-boost 維持中間軌', 'load dump → 箝位 + buck 降壓', '待機靜態電流要極低（怕耗盡電瓶，µA 級）'],
      designNotes: ['前級用寬輸入 buck-boost 或 boost+buck 級聯', '冷啟動撐得住（引擎啟動時系統不能重開機）', '各 POL 靠近負載、去耦足', '常態供電（KL30）路徑靜態電流極低', 'EMI 濾波在最前（傳導 EMC 車規嚴格）', '全鏈車規 AEC-Q + functional safety（若安全相關）'],
      commonMistakes: ['前級輸入範圍不夠 → 冷啟動掉壓或 load dump 掛掉', '待機靜態電流大 → 車停幾天電瓶被吸乾', 'POL 離負載遠 → 壓降、瞬態差', 'EMI 濾波不足 → 傳導發射超標、認證失敗'],
      examples: [{ title: '車用資訊娛樂電源', application: '12V → 反接 → EMI → buck-boost 前級 5V → POL 供 SoC/DDR/類比', circuit: 'LM5177-Q1 類 buck-boost + 多顆 POL buck' }],
      relatedTopics: ['auto-load-dump', 'buck-boost-converter', 'power-sequencing'], sourcePdf: null, createdAt: T, updatedAt: T
    },
    {
      id: 'aec-q100', title: '車規認證 AEC-Q100 與功能安全', category: 'measurement', products: ['車用電子'],
      description: '車用元件要過 AEC-Q 系列可靠度認證（IC 是 Q100），溫域寬、壽命長、失效率低。安全相關系統另需 ISO 26262 功能安全（ASIL 等級）。',
      principles: 'AEC-Q100 是車用 IC 的壓力測試認證：溫度分級（Grade 0 −40~150°C、Grade 1 −40~125°C…）、一系列可靠度試驗（溫度循環、高溫工作壽命 HTOL、濕度、ESD、閂鎖…）。Q101=分立元件、Q200=被動元件。過認證只是「元件夠格」。系統若涉及安全（煞車、轉向、電池管理），要走 ISO 26262 功能安全：依危害風險定 ASIL 等級（A~D，D 最嚴），要求安全機制（診斷覆蓋率、故障偵測、安全狀態）、冗餘、可靠度計算（FIT/FMEDA）。車廠還有 PPAP/零缺陷等品質要求。',
      circuits: [],
      keyFormulas: ['AEC-Q100 溫度 Grade 0：−40~150°C；Grade 1：−40~125°C', 'ASIL 等級 A<B<C<D（D 最嚴，如煞車/轉向）', 'FIT = 每 10⁹ 小時失效數（可靠度指標）', '診斷覆蓋率 DC%：安全機制能偵測的故障比例'],
      designNotes: ['IC 選 AEC-Q100、被動選 Q200、分立選 Q101', '溫度 Grade 對應實際工作環境（引擎室要 Grade 0/1）', '安全相關功能依 ISO 26262 定 ASIL、設計安全機制', '關鍵訊號加診斷/冗餘（如雙通道量測比對）', '做 FMEDA 算失效率、驗證診斷覆蓋率', '供應商要能提供車規文件（PPAP、可靠度報告）'],
      commonMistakes: ['用商規/工規元件上車 → 高溫或壽命提早失效', '溫度 Grade 選不夠（引擎室用 Grade 2）→ 過熱失效', '安全系統沒做功能安全 → 認證/責任問題', '忽略診斷覆蓋率 → 潛在故障累積不被發現'],
      examples: [{ title: '電池管理 BMS', application: 'AEC-Q100 元件 + ISO 26262 ASIL-C/D + 雙通道電壓監控冗餘', circuit: '車規 AFE + 安全 MCU（含診斷）+ 冗餘量測' }],
      relatedTopics: ['auto-power-arch', 'current-sensing', 'power-supervisor'], sourcePdf: null, createdAt: T, updatedAt: T
    },

    // ================= AI 伺服器 AI Server =================
    {
      id: 'vrm-multiphase', title: '多相 VRM 核心供電', category: 'power-management', products: ['AI 伺服器'],
      description: 'CPU/GPU 核心要低電壓（~0.7-1V）大電流（數百安培）。單相 buck 扛不住，用多相 VRM：多個 buck 交錯並聯分攤電流，配 PMBus 遙測與 DVID 動態調壓。',
      principles: '核心供電（VRM/VRD）：SoC 要 0.7~1.1V、上百安培，且負載瞬態極大（運算負載一來電流瞬跳）。多相 buck：N 個功率級（每級一對 MOSFET + 電感）並聯，PWM 相位交錯（360/N 度），好處：①電流分攤（每相只扛總電流/N）②輸入/輸出漣波因交錯抵消而變小③熱分散。控制器（多相 PWM 控制器 + DrMOS 智慧功率級）做電流均衡（每相電流回授平衡）、DVID（依 CPU 命令動態調電壓）、負載線（load line/AVP 用等效電阻補償瞬態）、PMBus 遙測（電壓/電流/溫度）。GPU/AI 加速器核心供電同理但電流更大（相數更多）。',
      circuits: [],
      keyFormulas: ['每相電流 = 總電流 / 相數 N', '交錯相位 = 360°/N（漣波抵消）', '負載線 AVP：Vout = Vset − I × R_LL（瞬態容忍）', '瞬態去耦：低 ESR/ESL 電容陣列供瞬間電流'],
      designNotes: ['相數依總電流定（每相功率級電流上限）', '各相電感/功率級佈局對稱，電流才均衡', 'DrMOS 智慧功率級整合驅動+上下管+溫度回報', '輸出去耦電容陣列（MLCC 近核心 + 大容 bulk）', 'PMBus 接 BMC 做遙測與電源管理', '負載線補償設定對，瞬態壓降在規範內', 'GPU/加速器相數更多、佈局更講究（供電密度）'],
      commonMistakes: ['相數不足 → 每相過流、過熱、效率降', '各相佈局不對稱 → 電流不均、某相先燒', '輸出去耦不足 → 負載瞬態壓降超標、核心當機', '負載線設定錯 → 瞬態欠壓或穩態過壓'],
      examples: [{ title: 'GPU 核心 VRM', application: '多相（如 16+相）DrMOS，PMBus 遙測，DVID 動態調壓', circuit: '多相控制器 + DrMOS × N + 電感 + MLCC 陣列' }],
      relatedTopics: ['server-48v-power', 'pmbus-telemetry', 'buck-converter-advanced', 'decoupling-capacitor'], sourcePdf: null, createdAt: T, updatedAt: T
    },
    {
      id: 'server-48v-power', title: '48V 供電鏈（48V→12V→核心）', category: 'power-management', products: ['AI 伺服器'],
      description: 'AI 機櫃功率暴增，傳統 12V 母線 I²R 損耗太大。改 48V 母線（電流降 4 倍、損耗降 16 倍），再多級降到核心。GPU 高密度供電的主流路線。',
      principles: '同功率下電壓×4→電流÷4→I²R 損耗÷16，故高功率機櫃改 48V 母線配電（源自資料中心 OCP 標準）。降壓鏈：48V → 中間軌（如 12V 或直接到更低）→ 核心。手法：①兩級：48V→12V（用高效隔離/非隔離中間匯流排轉換器 IBC，常固定比例如 4:1 LLC）再 12V→核心多相 VRM。②單級直降：48V 直接到 ~0.8V 的專用轉換器（如混合式/開關電容+buck），省一級損耗，供電更靠近 GPU。垂直供電（VPD：功率級放 GPU 正下方/背面）進一步縮短 PDN 路徑降阻抗。',
      circuits: [],
      keyFormulas: ['同功率：電壓×4 → 電流÷4 → I²R 損耗÷16', 'IBC 常見固定比 4:1（48V→12V）', '單級 48V→核心省一級轉換損耗', 'VPD 垂直供電：PDN 阻抗大降（路徑短）'],
      designNotes: ['48V 母線配電降 I²R 損耗（高密度機櫃必要）', '中間匯流排轉換器（IBC）用 LLC/固定比高效率', '單級直降方案供電更近 GPU、少一級損耗', '垂直供電把功率級放核心正下方，縮 PDN', '48V 安規/絕緣考量（比 12V 高壓）', '熱管理：高功率密度需液冷配合（見機櫃散熱）'],
      commonMistakes: ['高功率還用 12V 母線 → I²R 損耗大、銅損發熱', 'IBC 效率不足 → 兩級損耗疊加', '核心供電路徑長 → PDN 阻抗高、瞬態差', '忽略 48V 絕緣/安規 → 認證問題'],
      examples: [{ title: 'AI 加速卡供電', application: '48V 母線 → IBC 4:1 → 12V → 多相 VRM → GPU 核心（或 48V 直降）', circuit: '48V IBC(LLC) + 多相 VRM，或 48V 直降混合轉換器' }],
      relatedTopics: ['vrm-multiphase', 'pdn-design', 'pmbus-telemetry'], sourcePdf: null, createdAt: T, updatedAt: T
    },
    {
      id: 'pmbus-telemetry', title: 'PMBus 電源遙測與管理', category: 'communication', products: ['AI 伺服器'],
      description: 'PMBus 是 I2C 為底的電源管理協定：BMC 透過它讀各電源軌的電壓/電流/溫度/功率、設限值、控開關與調壓。伺服器電源可觀測性的核心。',
      principles: 'PMBus（Power Management Bus）建在 SMBus/I2C 上，標準化命令集讓主機（BMC/CPLD）管理電源 IC：遙測（READ_VOUT/IOUT/TEMPERATURE/POUT）、設定（VOUT_COMMAND 調壓、限值告警閾值）、控制（OPERATION 開關軌、邊限測試）、狀態（STATUS 暫存器報 OV/OC/OT/fault）。伺服器每條重要軌（VRM、IBC、hot-swap、PSU）都掛 PMBus，BMC 輪詢建立全機功耗與健康圖，做功耗封頂（power capping）、故障預警、遠端管理。AVSBus 是更快的動態調壓變體。要注意匯流排位址規劃、多裝置掛載電容、上拉。',
      circuits: [],
      keyFormulas: ['PMBus 建在 I2C/SMBus（≤400kHz/1MHz）', 'READ_* 命令回遙測值（線性/直接格式）', 'VOUT_COMMAND 動態調壓', 'STATUS 暫存器：OV/OC/OT/PGOOD/fault 位元'],
      designNotes: ['每裝置 PMBus 位址規劃不衝突（位址腳/電阻編碼）', '匯流排總電容 ≤ I2C 上限、上拉電阻選對（見 I2C）', 'BMC 輪詢頻率權衡即時性與匯流排負載', 'ALERT# 線（開汲極）讓裝置主動報故障（免輪詢等）', '關鍵軌 STATUS/告警閾值設好，故障能預警', 'AVSBus 用於需要快速動態調壓的核心'],
      commonMistakes: ['PMBus 位址衝突 → 遙測讀錯裝置', '匯流排電容超標/上拉錯 → 通訊不穩', '只輪詢不用 ALERT# → 故障反應慢', '遙測格式（線性/直接）解碼錯 → 數值全錯'],
      examples: [{ title: '伺服器電源監控', application: 'BMC 輪詢各 VRM/PSU PMBus，建功耗圖、power capping、故障預警', circuit: 'BMC ↔ PMBus(I2C) ↔ VRM/IBC/hot-swap/PSU + ALERT#' }],
      relatedTopics: ['vrm-multiphase', 'i2c-communication', 'hot-swap'], sourcePdf: null, createdAt: T, updatedAt: T
    },
    {
      id: 'retimer-redriver', title: 'PCIe/高速 Retimer 與 Redriver', category: 'high-speed', products: ['AI 伺服器'],
      description: '高速訊號（PCIe Gen5/6、112G SerDes）走遠會衰減失真。Redriver 類比等化補償、Retimer 完整恢復時脈重生訊號。伺服器背板/GPU 互連的訊號完整性關鍵。',
      principles: '高速 SerDes 訊號經 PCB/連接器/纜線衰減（介質損耗 ∝ 頻率），眼圖閉合。兩種修復：①Redriver（類比）——用等化器（CTLE）補償通道損耗、重新驅動，不重生時脈，延遲低、成本低，但不消抖動累積、能延伸距離有限。②Retimer（數位）——內含 CDR（時脈資料恢復）完整恢復資料、重新產生乾淨時脈與訊號（重新計時），能斷開上下游通道各自等化、消抖動、延伸更遠，但延遲/成本較高、PCIe 要協定感知。AI 伺服器 GPU-to-GPU、GPU-to-switch、長背板普遍用 retimer。放置位置（通道中點）與數量依鏈路預算（channel budget）算。',
      circuits: [],
      keyFormulas: ['通道損耗 ∝ 頻率（Gen5 32GT/s、Gen6 64GT/s 更嚴）', 'Redriver：類比等化、不重生時脈（延遲低）', 'Retimer：CDR 重生時脈、消抖動（延伸遠）', '放置點依 channel insertion loss 預算算'],
      designNotes: ['先做通道損耗預算，決定要 redriver 還 retimer 及數量', 'retimer 放通道損耗中點（上下游各半）', 'PCIe retimer 要協定感知（LTSSM、等化交握）', 'retimer/redriver 自身供電與去耦要乾淨', '參考時脈架構（common/separate ref clock）對齊', '差分對走線嚴格控阻抗、等長、少過孔'],
      commonMistakes: ['損耗超預算不加 retimer → 鏈路訓練失敗/降速', 'redriver 硬撐長通道 → 抖動累積、誤碼', 'retimer 放錯位置 → 上下游損耗不均、補償不足', '差分對走線爛 → 再多 retimer 也救不回'],
      examples: [{ title: 'GPU 互連背板', application: 'GPU↔switch PCIe Gen5，長背板中點放 retimer 恢復訊號', circuit: 'PCIe Gen5 retimer + 受控阻抗差分背板' }],
      relatedTopics: ['differential-pair', 'impedance-matching', 'server-48v-power'], sourcePdf: null, createdAt: T, updatedAt: T
    },
    {
      id: 'hbm-power-decoupling', title: 'HBM 供電與去耦', category: 'high-speed', products: ['AI 伺服器'],
      description: 'HBM（高頻寬記憶體）用 2.5D 矽中介層堆在 GPU 旁，數千條 I/O 同時切換，瞬態電流巨大。供電與去耦必須做在封裝/中介層層級，PCB 級來不及。',
      principles: 'HBM 靠矽中介層（interposer）與 GPU 並排、用數千條微凸塊互連（極寬匯流排、低單腳速率）。同時切換數千 I/O → SSN（同時切換雜訊）與瞬態電流極大，且頻率高到 PCB 級去耦電容的寄生電感來不及供電。故去耦要分層：封裝內/中介層上的高頻電容（矽電容 / 深溝槽電容）供最高頻瞬態，封裝基板電容供中頻，PCB MLCC 供低頻與 bulk。供電軌（VDDQ 等）要低阻抗 PDN，各層電容 impedance vs frequency 要銜接不留空隙（否則該頻段阻抗尖峰→壓降）。熱也是問題（記憶體堆疊散熱差，需與 GPU 共散熱方案）。',
      circuits: [],
      keyFormulas: ['數千 I/O 同時切換 → SSN/瞬態電流巨大', '電容供電頻段：矽電容(最高頻)→基板→PCB MLCC→bulk', 'PDN 目標阻抗 = 允許壓降 / 瞬態電流', '各層電容 impedance 要銜接無空隙（防阻抗尖峰）'],
      designNotes: ['去耦分層：中介層/封裝矽電容供最高頻，PCB 供低頻', 'PDN 阻抗 vs 頻率整條壓低、無尖峰（各層電容銜接）', 'VDDQ 等供電軌走低阻抗平面', 'HBM 熱與 GPU 一起管（2.5D 散熱差）', '這層設計在封裝/中介層，PCB 工程師配合供電入口', 'SSN 控制靠寬匯流排低速率 + 就近去耦'],
      commonMistakes: ['只靠 PCB 電容去耦 → 高頻寄生電感來不及、瞬態壓降', 'PDN 阻抗某頻段有尖峰 → 該頻段供電不足、誤碼', 'VDDQ 平面阻抗高 → 大瞬態下欠壓', '忽略 HBM 散熱 → 記憶體過熱降速/報錯'],
      examples: [{ title: 'GPU + HBM 供電', application: '中介層矽電容供最高頻瞬態，封裝/PCB 電容分層銜接', circuit: 'HBM stack + 中介層電容 + 基板電容 + PCB MLCC/bulk' }],
      relatedTopics: ['decoupling-capacitor', 'pdn-design', 'vrm-multiphase'], sourcePdf: null, createdAt: T, updatedAt: T
    },

    // ================= 筆電 Laptop =================
    {
      id: 'laptop-battery-charger', title: '筆電電池充電（Buck-Boost / Narrow VDC）', category: 'power-management', products: ['筆電'],
      description: '筆電電池多節（2-4S，7-17V），輸入可能是 USB-C PD（5-20V）或變壓器。輸入可能高於或低於電池電壓，故充電器要 buck-boost；系統多用 Narrow VDC 架構讓充電器兼供系統。',
      principles: '筆電電池 2-4 串（Vbat 7~17V 動態），輸入源多變（USB-C PD 5-20V、變壓器 20V）。輸入可能 > 或 < 電池電壓 → 充電器必須 buck-boost（四開關）。Narrow VDC（NVDC）架構：充電器輸出接系統軌（VSYS），電池經一個 FET 掛在同節點——輕載時充電器供系統兼充電，重載超過輸入能力時電池補電流（battery boost/turbo），VSYS 被鉗在接近電池電壓的窄範圍讓下游 DC-DC 好設計。充電器 IC 含輸入電流限制（不超過 adapter/PD 能力）、充電曲線（CC/CV）、電池認證、與 EC/PD 協商。',
      circuits: [],
      keyFormulas: ['輸入可 >或< Vbat → 必須 buck-boost（四開關）', 'NVDC：VSYS 鉗在接近 Vbat 的窄範圍', '輸入電流限制 ≤ adapter/PD 協商能力', '重載超輸入 → 電池補電流（turbo boost）'],
      designNotes: ['充電器用 buck-boost（涵蓋輸入高於/低於電池）', 'NVDC 架構讓充電器兼供系統、VSYS 窄範圍', '輸入電流限制設對（不超 PD 協商值，否則拉垮或觸發保護）', '與 EC + PD 控制器協同（協商輸入、選源）', '電池路徑/感測 Kelvin 量測、電量計配合', '多輸入源（PD 埠 + 變壓器）ORing 選源'],
      commonMistakes: ['用純 buck 充電器 → 輸入低於電池時充不進', '輸入電流限制超過 adapter 能力 → 過載保護跳/掉電', 'VSYS 範圍沒鉗好 → 下游 DC-DC 設計困難', '重載沒 battery boost → 峰值負載時系統掉電'],
      examples: [{ title: '筆電 USB-C 充電', application: 'PD 協商 20V → buck-boost NVDC 充電器 → 兼供系統+充 3S 電池', circuit: 'buck-boost 充電器 IC(BQ257xx 類) + NVDC + EC/PD' }],
      relatedTopics: ['buck-boost-converter', 'usbc-pd-laptop', 'battery-charger', 'fuel-gauge'], sourcePdf: null, createdAt: T, updatedAt: T
    },
    {
      id: 'usbc-pd-laptop', title: 'USB-C PD 與 Alt Mode（筆電）', category: 'communication', products: ['筆電'],
      description: '筆電的 USB-C 埠要同時做：供電/受電（PD 雙角色）、資料（USB 3/4）、影像輸出（DP Alt Mode）、甚至 Thunderbolt。靠 PD 控制器 + CC 邏輯 + Mux 切換。',
      principles: 'USB-C 埠功能多工：①PD 供電——雙角色（DRP，可當電源也可受電），CC 線協商方向/電壓/電流（筆電受電充自己、或供電給周邊）。②資料——USB 3.x/USB4。③影像——DisplayPort Alt Mode 把部分高速差分對重配置成 DP 訊號。④Thunderbolt/USB4 更複雜。關鍵元件：PD 控制器（跑 CC 協商、Source/Sink 角色）、SBU/CC 邏輯、高速訊號 Mux/Retimer（依協商結果把 lane 導向 USB 或 DP）、VBUS 電源路徑（buck-boost 充電器或供電 FET）、VCONN 供 e-marker 線。正反插要靠 CC 偵測方向並切 Mux。',
      circuits: [],
      keyFormulas: ['CC 線協商：角色(DRP/Source/Sink)、電壓、電流、Alt Mode', 'DP Alt Mode：高速 lane 重配置為 DisplayPort', 'VCONN 供 e-marker/主動線纜', '正反插 → CC 偵測方向 → Mux 切 lane'],
      designNotes: ['PD 控制器管 CC 協商與角色切換', '高速訊號 Mux/retimer 依協商把 lane 導 USB/DP', '正反插方向偵測 → Mux 對應切換', 'VBUS 過壓保護（協商異常防灌）+ buck-boost 充電路徑', 'VCONN 供線纜 e-marker、SBU 給 DP AUX', '高速差分對控阻抗（USB4/TBT 對通道要求嚴）'],
      commonMistakes: ['Mux 沒依方向/協商切 → 正插或反插其一不通', '沒 VBUS 過壓保護 → 協商異常高壓灌入', 'e-marker/VCONN 沒供 → 主動線纜/大電流不認', '高速通道走線差 → USB4/DP 高解析失敗'],
      examples: [{ title: '筆電 USB-C 全功能埠', application: '受電充電 + USB4 資料 + DP 外接螢幕，正反插自動切', circuit: 'PD 控制器 + SS Mux/retimer + buck-boost 充電 + VCONN' }],
      relatedTopics: ['usb-pd-fastcharge', 'laptop-battery-charger', 'retimer-redriver', 'usb-design'], sourcePdf: null, createdAt: T, updatedAt: T
    },
    {
      id: 'ec-controller', title: '筆電嵌入式控制器（EC）', category: 'embedded', products: ['筆電'],
      description: 'EC 是筆電的「總管」小 MCU：管電源時序、電池充電、鍵盤、風扇/散熱、電源鍵、待機喚醒、與主機/PD 協同。系統關機它也醒著。',
      principles: 'EC（Embedded Controller）是常駐小 MCU，負責主 SoC 不方便或睡著時仍要做的事：①電源時序——控制各軌上電順序、PWROK/PLTRST# 交握（見 pch-sideband）②電池——與充電器/電量計/PD 協同管充放電、選源③熱管理——讀溫度、控風扇轉速（PWM）、必要時降頻/關機保護④輸入——鍵盤矩陣掃描、觸控板、電源鍵⑤系統狀態——S0/S3/S5 電源狀態機、待機喚醒（LID/RTC/USB）、與 BIOS 溝通（host interface）。EC 韌體是筆電客製重點。低功耗常在（待機也醒），自身要省電。',
      circuits: [],
      keyFormulas: ['EC 常駐（S5 關機也醒）→ 自身低功耗', '風扇 PWM 依溫度曲線調速（熱管理）', '電源狀態機：S0(開)/S3(睡)/S5(關)', 'PWROK/PLTRST# 交握控上電時序'],
      designNotes: ['EC 供電在常態域（待機也有電）', '電源時序交握照平台規範（sideband 訊號）', '熱：溫感佈點合理，風扇 PWM 曲線調校', '鍵盤矩陣/電源鍵去抖、ESD 保護', 'EC 韌體與 BIOS/PD 介面對齊', 'EC 自身低功耗（常駐耗電影響待機續航）'],
      commonMistakes: ['EC 供電接錯域（睡眠斷電）→ 待機喚醒失效', '電源時序交握錯 → 開不了機或偶發失敗', '風扇曲線沒調 → 過熱降頻或噪音大', 'EC 韌體與 PD/BIOS 不同步 → 充電/喚醒異常'],
      examples: [{ title: '筆電系統管理', application: 'EC 控上電時序、風扇、鍵盤、與 PD 協商充電、待機喚醒', circuit: 'EC MCU + sideband 到 PCH + 充電器/PD/風扇/鍵盤' }],
      relatedTopics: ['pch-sideband', 'laptop-power-seq', 'laptop-battery-charger'], sourcePdf: null, createdAt: T, updatedAt: T
    },
    {
      id: 'laptop-backlight', title: '筆電螢幕背光與面板電源（eDP）', category: 'power-management', products: ['筆電'],
      description: '筆電面板走 eDP：需面板電源（供 TCON/源極驅動）＋背光。LED 背光用升壓恆流驅動調亮度（PWM 或類比調光），OLED 則各像素自發光另有電源。',
      principles: 'LCD 筆電面板：eDP 傳影像到面板 TCON，面板需 VLCD（面板邏輯/源極驅動電源，常 3.3V）。背光是 LED 串（多顆串聯需高電壓），用升壓（boost）恆流驅動：把電池電壓升到足夠推整串 LED，恆流確保亮度均勻，調光用 PWM（開關 LED duty 調感知亮度，頻率要夠高避免閃爍/避開可聞噪聲）或類比（調電流，低亮度不閃但色偏）。OLED 筆電面板各像素自發光，需 ELVDD/ELVSS（同穿戴 AMOLED 原理但尺寸大電流大）。面板電源上電時序（VLCD 與背光先後）要照規範避免開機閃爍。',
      circuits: [],
      keyFormulas: ['LED 串聯 → 升壓到 N×Vf、恆流驅動', 'PWM 調光：duty 調感知亮度（頻率高避閃爍/噪聲）', '類比調光：調電流（低亮不閃但可能色偏）', 'OLED 面板需 ELVDD/ELVSS（電流大）'],
      designNotes: ['背光 boost 恆流驅動、LED 串電壓算對（升壓比足夠）', 'PWM 調光頻率避開可聞範圍（電感/電容嘯叫）與可見閃爍', '低亮度用混合調光（PWM+類比）兼顧不閃與色準', '面板 VLCD 與背光上電時序照規範（避免開機閃）', 'OLED 面板 ELVDD/ELVSS 去耦足（大電流瞬態）', '亮度自動調（環境光）省電護眼'],
      commonMistakes: ['PWM 調光頻率太低 → 可見閃爍（眼睛累）或電感嘯叫', '升壓比不夠 → 推不動整串 LED、背光暗', '面板/背光時序錯 → 開機閃白或殘影', 'OLED 大面板 ELVDD 去耦不足 → 亮度變化閃爍'],
      examples: [{ title: '筆電 LCD 背光', application: '電池 → boost 恆流驅動 LED 串，混合調光控亮度', circuit: 'LED backlight driver(boost 恆流) + eDP 面板 TCON' }],
      relatedTopics: ['boost-converter', 'led-driver', 'laptop-power-seq'], sourcePdf: null, createdAt: T, updatedAt: T
    },
    {
      id: 'laptop-power-seq', title: '筆電上電時序與電源域', category: 'embedded', products: ['筆電'],
      description: '筆電幾十條電源軌要按嚴格順序上電（電源域 S0/S3/S5）。EC + PCH 用 sideband 訊號逐步交握，錯序會開不了機或損壞。',
      principles: '筆電電源分域：S5（軟關機，僅常態電路 + EC 醒）、S3（睡眠，記憶體保持）、S0（全開）。開機從按電源鍵開始，EC/PCH 依序建立各軌並用 sideband 交握（見 pch-sideband）：常態軌 → EC 啟動 → 依序開 CPU/DDR/各 IO 軌，每軌 PWROK 回報穩定後才開下一軌，全部就緒才釋放 PLTRST# 讓平台跑。關機/睡眠反序關軌。時序由 EC + PCH + 電源監控/排序 IC（或 CPLD）控管。DDR 有自己的上電/掉電順序要求（VDD/VDDQ/VTT/VREF 先後）。錯序可能導致 IC 閂鎖或無法開機。',
      circuits: [],
      keyFormulas: ['電源域：S5(關/EC醒) → S3(睡/記憶體保持) → S0(全開)', '每軌 PWROK 穩定 → 才開下一軌', '全軌就緒 → 釋放 PLTRST# → 平台跑', 'DDR 有專屬 VDD/VDDQ/VTT/VREF 上電順序'],
      designNotes: ['上電順序照晶片組/CPU/DDR 規範（timing 圖）', 'EC + 電源排序 IC（或 CPLD）控管多軌順序', '每軌 PGOOD 串接成鏈，前一軌好才致能下一軌', 'DDR 電源順序嚴格（VTT/VREF 相對 VDDQ）', 'sideband（PWROK/PLTRST#）交握對表', '關鍵軌預留測試點 debug 上電流程'],
      commonMistakes: ['上電順序錯 → 開不了機或 IC 閂鎖損壞', 'DDR 電源順序沒照規範 → 記憶體訓練失敗', 'PGOOD 鏈沒串好 → 某軌沒穩就開下游', '無測試點 → 開機失敗無從 debug 卡在哪軌'],
      examples: [{ title: '筆電開機時序', application: '電源鍵 → EC → 依序開軌(各 PGOOD 交握) → PLTRST# 釋放 → 開機', circuit: 'EC + 電源排序 CPLD + sideband(PWROK/PLTRST#) + DDR 順序' }],
      relatedTopics: ['ec-controller', 'pch-sideband', 'power-sequencing', 'power-supervisor'], sourcePdf: null, createdAt: T, updatedAt: T
    }
  ];
  window.KNOWLEDGE_EXTRA = (window.KNOWLEDGE_EXTRA || []).concat(CARDS);
})();
