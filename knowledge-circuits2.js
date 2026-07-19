/**
 * knowledge-circuits2.js — 知識卡補圖庫（2026-07-19 補齊 73 張無圖卡）
 * 每個 entry：id → () => ({ d:'圖說', svg }) 。knowledge.js applyCircuitArt 在
 * 卡片 circuits 為空時套用。畫風沿用 schematic-symbols.js（window.Sym）。
 * 載入順序：schematic-symbols.js 之後、knowledge.js 之前。
 */
(function () {
  const MUT = '#64748b', ACC = '#1f4fd1', RED = '#dc2626', GRN = '#16a34a', ORG = '#d97706';
  const C = '#1d2943';
  const S = () => window.Sym;
  const W = (w, h, g) => `<svg viewBox="0 0 ${w} ${h}" width="100%" style="max-width:${w}px">${g}</svg>`;
  const T = (x, y, s, o) => S().txt(x, y, s, o || {});
  const L = (x1, y1, x2, y2, o) => S().line(x1, y1, x2, y2, o || {});

  // 方塊：置中標題＋小字副標（可陣列）
  function B(x, y, w, h, name, sub, o) {
    o = o || {};
    let g = `<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="4" fill="${o.fill || '#fff'}" stroke="${o.color || C}" stroke-width="${o.sw || 1.6}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}/>`;
    const lines = [].concat(sub || []);
    const cy = y - (lines.length ? (lines.length * 9) / 2 : 0);
    g += T(x, cy + 3, name, { size: o.ts || 9.5, weight: '600' });
    lines.forEach((s, i) => { g += T(x, cy + 14 + i * 9, s, { size: 7.5, fill: MUT }); });
    return g;
  }
  // 箭頭（含標籤）
  function A(x1, y1, x2, y2, lbl, o) {
    o = o || {};
    let g = L(x1, y1, x2, y2, { color: o.color || C, w: o.w || 1.3 });
    const ang = Math.atan2(y2 - y1, x2 - x1), a = 5.5;
    g += `<polygon points="${x2},${y2} ${x2 - a * Math.cos(ang - 0.42)},${y2 - a * Math.sin(ang - 0.42)} ${x2 - a * Math.cos(ang + 0.42)},${y2 - a * Math.sin(ang + 0.42)}" fill="${o.color || C}"/>`;
    if (lbl) g += T((x1 + x2) / 2 + (o.dx || 0), (y1 + y2) / 2 - 4 + (o.dy || 0), lbl, { size: 7.5, fill: o.lc || MUT });
    return g;
  }
  // 電源旗標
  function F(x, y, lbl) { return L(x, y, x, y - 8) + L(x - 7, y - 8, x + 7, y - 8) + T(x, y - 13, lbl, { size: 7.5, fill: MUT }); }
  // 紅叉（錯誤示意）
  function X(x, y, r) { r = r || 6; return L(x - r, y - r, x + r, y + r, { color: RED, w: 2 }) + L(x - r, y + r, x + r, y - r, { color: RED, w: 2 }); }
  // 勾（正確示意）
  function OK(x, y) { return `<polyline points="${x - 6},${y} ${x - 2},${y + 5} ${x + 7},${y - 6}" fill="none" stroke="${GRN}" stroke-width="2.2"/>`; }
  // 折線
  const PL = (pts, o) => `<polyline points="${pts}" fill="none" stroke="${(o && o.color) || C}" stroke-width="${(o && o.w) || 1.5}"${(o && o.dash) ? ` stroke-dasharray="${o.dash}"` : ''}/>`;

  const M = {};

  // ================= 電子紙 =================
  M['epd-driver-waveform'] = () => {
    let g = '';
    // 座標軸
    g += L(35, 20, 35, 130) + L(35, 130, 330, 130);
    g += T(20, 30, '+15V', { size: 8, fill: MUT }) + T(20, 75, '0V', { size: 8, fill: MUT }) + T(20, 120, '−15V', { size: 8, fill: MUT });
    g += T(180, 145, '時間（一次更新 = 跑完整條 waveform，數百 ms）', { size: 8, fill: MUT });
    // 波形：正脈衝群/負脈衝群/歸零
    g += PL('35,75 60,75 60,30 95,30 95,75 115,75 115,120 160,120 160,75 185,75 185,30 215,30 215,75 250,75 250,120 275,120 275,75 330,75', { color: ACC, w: 2 });
    g += T(78, 22, '推白', { size: 8, fill: MUT }) + T(137, 112, '推黑', { size: 8, fill: MUT }) + T(232, 22, '灰階微調', { size: 8, fill: MUT });
    g += T(180, 165, 'LUT：(起始灰階, 目標灰階, 溫度) → 這串電壓脈衝序列', { size: 8.5 });
    g += T(180, 180, 'DC-balance：正負面積積分 ≈ 0，否則長期殘影', { size: 8, fill: ORG });
    return { d: 'EPD waveform：像素電壓脈衝序列（LUT 查表）', svg: W(360, 190, g) };
  };

  M['epd-power-rails'] = () => {
    let g = '';
    g += B(60, 95, 84, 60, '單顆鋰電', ['3.0~4.2V']);
    g += A(102, 95, 140, 95);
    g += B(196, 95, 108, 110, 'EPD PMIC', ['TPS65185 類', '升壓+電荷泵', '內建上下電時序']);
    const rails = [['VGH +22V', 35], ['VPOS +15V', 60], ['VCOM −1~−3V(可調)', 95], ['VNEG −15V', 130], ['VGL −20V', 155]];
    rails.forEach(([lbl, y]) => { g += A(250, y === 95 ? 95 : (y < 95 ? 60 + (y - 35) * 0 + y - 20 : y - 20), 292, y - 20, null); });
    // 重畫成簡單扇出
    g = '';
    g += B(56, 100, 84, 56, '單顆鋰電', ['3.0~4.2V']);
    g += A(98, 100, 132, 100);
    g += B(190, 100, 110, 128, 'EPD PMIC', ['TPS65185 類', '升壓＋電荷泵', '內建時序/溫感']);
    const ys = [40, 70, 100, 130, 160];
    const names = ['VGH +22V（閘極開）', 'VPOS +15V（源極+）', 'VCOM（可調偏壓）', 'VNEG −15V（源極−）', 'VGL −20V（閘極關）'];
    ys.forEach((y, i) => { g += L(245, 100, 262, 100) + L(262, y, 262, 100) + A(262, y, 285, y) + T(290, y + 3, names[i], { size: 8, anchor: 'start' }); });
    g += T(190, 185, '上電順序：VNEG 先於 VPOS、VGL 先於 VGH（PMIC 狀態機控管）', { size: 8, fill: ORG });
    return { d: 'EPD 多軌電源：PMIC 一次生成 ±15V/VGH/VGL/VCOM', svg: W(400, 196, g) };
  };

  M['epd-tcon'] = () => {
    let g = '';
    g += B(48, 60, 72, 48, 'MCU', ['SPI 主機']);
    g += A(84, 50, 128, 50, 'SPI(CS/CLK/MOSI)');
    g += A(128, 70, 84, 70, 'BUSY（更新中）', { color: ORG });
    g += B(186, 60, 112, 64, 'Driver＋TCON', ['影像 RAM（新/舊）', 'waveform LUT']);
    g += A(242, 45, 274, 45, '源極驅動');
    g += A(242, 75, 274, 75, '閘極掃描');
    g += B(316, 60, 80, 64, 'EPD 面板', ['TFT 陣列']);
    g += T(200, 118, '流程：初始化 → 載影像 RAM → 觸發更新 → 等 BUSY 釋放', { size: 8.5 });
    g += T(200, 133, '雙 RAM 存新舊畫面 → driver 算差異做局部更新', { size: 8, fill: MUT });
    return { d: 'EPD TCON 資料鏈：MCU→SPI→driver→面板掃描', svg: W(390, 145, g) };
  };

  M['epd-partial-refresh'] = () => {
    let g = '';
    g += B(70, 62, 104, 76, '全刷新', ['整屏黑白翻轉', '閃爍、數百ms~1s', '畫質乾淨']);
    g += B(214, 62, 104, 76, '局部更新', ['只動變化區', '快、不閃', '殘影累積']);
    g += A(214 + 56, 62, 318, 62, null);
    g += T(338, 66, '殘影', { size: 8.5, fill: ORG });
    g += A(214, 104, 214, 128) + T(214, 140, '計數器達 N 次（5~20）', { size: 8, fill: MUT });
    g += A(214, 148, 100, 148) + L(100, 148, 100, 104) + `<polygon points="100,104 96,111 104,111" fill="${C}"/>`;
    g += T(160, 162, '插一次全刷清殘影', { size: 8.5 });
    return { d: '局部 vs 全刷策略：N 次局部後強制全刷', svg: W(370, 170, g) };
  };

  M['epd-temp-comp'] = () => {
    let g = '';
    g += B(52, 55, 80, 52, '溫度感測', ['PMIC 內建', '或外接 NTC']);
    g += A(92, 55, 126, 55, '面板溫度');
    g += B(178, 55, 96, 52, 'MCU / 主機', ['選溫區']);
    g += A(226, 55, 258, 55);
    g += B(310, 55, 96, 68, 'Waveform LUT', ['<5°C：長波形', '5~25°C：標準', '>25°C：短波形']);
    g += T(185, 110, '液體黏度 ∝ exp(1/T)：低溫粒子慢 → 波形拉長；高溫過驅 → 過衝', { size: 8.5 });
    g += T(185, 126, '超出工作溫域 → 拒絕更新或警示（粒子推不動）', { size: 8, fill: ORG });
    return { d: '溫度補償：讀面板溫 → 選對應溫區 waveform', svg: W(380, 136, g) };
  };

  M['epd-frontlight'] = () => {
    let g = '';
    // 導光板疊在 EPD 上，側面 LED
    g += `<rect x="90" y="40" width="220" height="14" rx="2" fill="#eef4ff" stroke="${C}" stroke-width="1.4"/>`;
    g += T(200, 50, '導光板（網點把光導向下方）', { size: 8, fill: MUT });
    g += `<rect x="90" y="60" width="220" height="16" rx="2" fill="#fff" stroke="${C}" stroke-width="1.6"/>`;
    g += T(200, 71, 'EPD 面板（反射式，不自發光）', { size: 8 });
    // 側入 LED 兩色溫
    g += B(52, 47, 56, 34, 'LED×2路', ['冷白/暖黃']);
    g += A(80, 47, 90, 47);
    // 光線向下反射
    [120, 170, 220, 270].forEach(x => { g += A(x, 54, x, 60, null, { color: ORG, w: 1 }); });
    // 驅動
    g += B(60, 120, 96, 50, 'LED Driver', ['升壓/線性', '12bit PWM×2']);
    g += L(60, 95, 60, 64);
    g += A(108, 120, 148, 120, 'I2C/PWM');
    g += B(190, 120, 72, 40, 'MCU', ['混光比=色溫']);
    g += T(255, 112, '暖佔比 = I_warm/(I_warm+I_cool)', { size: 8, anchor: 'start' });
    g += T(255, 126, 'PWM >2kHz 避頻閃', { size: 8, anchor: 'start', fill: ORG });
    return { d: '前光模組：側入 LED＋導光板，雙色溫獨立調光', svg: W(390, 155, g) };
  };

  // ================= 智慧手錶 =================
  M['wearable-pmu'] = () => {
    let g = '';
    g += B(48, 90, 72, 46, '鋰電池', ['~200mAh']);
    g += A(84, 90, 116, 90);
    g += B(178, 90, 120, 120, 'PMU', ['充電器＋電量計', 'buck×2（PFM）', 'LDO×2（低噪）', '負載開關×N', 'Iq：µA 級']);
    const outs = [[40, 'buck → SoC 核心'], [70, 'buck → 記憶體'], [100, 'LDO → 感測/AFE'], [130, 'LDO → RF/BLE'], [160, '負載開關 → 螢幕/GPS（不用就斷電）']];
    outs.forEach(([y, lbl]) => { g += L(238, 90, 254, 90) + L(254, y, 254, 90) + A(254, y, 276, y) + T(281, y + 3, lbl, { size: 8, anchor: 'start' }); });
    g += T(190, 172, '續航 = 容量 / 平均電流：睡眠佔絕大多數 → 輕載效率與 Iq 決定一切', { size: 8.5, fill: ORG });
    return { d: '穿戴 PMU 電源樹：多軌＋負載開關＋µA 級待機', svg: W(440, 184, g) };
  };

  M['ppg-afe'] = () => {
    let g = '';
    g += B(52, 46, 76, 40, 'LED 驅動', ['綠/紅/紅外']);
    g += A(90, 46, 122, 46, '脈衝點亮');
    g += `<circle cx="150" cy="46" r="9" fill="#dcfce7" stroke="${C}" stroke-width="1.4"/>` + T(150, 49, 'LED', { size: 6.5 });
    // 皮膚
    g += `<path d="M 120 78 Q 175 96 230 78" fill="none" stroke="${ORG}" stroke-width="2.2"/>` + T(175, 100, '皮膚/血流（AC 調變 << DC 背景）', { size: 8, fill: MUT });
    g += A(155, 55, 172, 74, null, { color: ORG, w: 1 }) + A(180, 74, 197, 56, null, { color: ORG, w: 1 });
    g += `<rect x="190" y="36" width="22" height="18" rx="2" fill="#fff" stroke="${C}" stroke-width="1.4"/>` + T(201, 48, 'PD', { size: 7.5 });
    g += A(212, 45, 240, 45, '光電流');
    g += B(280, 45, 76, 44, 'TIA＋PGA', ['環境光相消']);
    g += A(318, 45, 344, 45);
    g += B(372, 45, 52, 36, 'ADC', []);
    g += B(280, 118, 92, 36, '加速度計', ['動作假影補償']);
    g += A(280, 100, 280, 70, null, { color: MUT });
    g += T(140, 130, '同步取樣：LED 亮/滅各取樣相減 → 扣掉環境光', { size: 8.5 });
    return { d: 'PPG 光學鏈：LED→皮膚→PD→TIA→ADC＋動作補償', svg: W(410, 145, g) };
  };

  M['wearable-amoled'] = () => {
    let g = '';
    g += B(50, 70, 72, 44, '鋰電池', []);
    g += A(86, 70, 116, 70);
    g += B(172, 70, 104, 66, '面板電源 IC', ['升壓＋電荷泵']);
    g += L(224, 55, 248, 55) + A(248, 55, 272, 55) + T(300, 58, 'ELVDD +4~5V', { size: 8, anchor: 'start' });
    g += L(224, 85, 248, 85) + A(248, 85, 272, 85) + T(300, 88, 'ELVSS −1~−5V', { size: 8, anchor: 'start' });
    g += B(320, 130, 130, 52, 'AMOLED 面板', ['每像素自發光', '黑 = 不耗電']);
    g += L(310, 62, 310, 104) + L(330, 92, 330, 104);
    g += T(120, 130, 'AOD 手法：', { size: 8.5, anchor: 'start' });
    g += T(120, 144, '低更新率(1Hz)＋低亮度＋少亮像素', { size: 8, anchor: 'start', fill: MUT });
    g += T(120, 158, '內容位置輪替防烙印（藍衰最快）', { size: 8, anchor: 'start', fill: ORG });
    return { d: 'AMOLED 供電：ELVDD/ELVSS 正負軌＋AOD 策略', svg: W(400, 170, g) };
  };

  M['wearable-qi-rx'] = () => {
    let g = '';
    g += B(48, 70, 80, 56, '充電座 TX', ['高頻交流線圈']);
    // 線圈耦合
    g += `<path d="M 92 52 q 8 18 0 36 M 104 52 q 8 18 0 36" fill="none" stroke="${C}" stroke-width="1.6"/>`;
    g += `<path d="M 124 52 q -8 18 0 36 M 136 52 q -8 18 0 36" fill="none" stroke="${C}" stroke-width="1.6"/>`;
    g += T(114, 40, '磁耦合 k', { size: 8, fill: MUT });
    g += `<rect x="146" y="48" width="8" height="44" fill="#fde68a" stroke="${ORG}" stroke-width="1"/>` + T(150, 106, 'ferrite（隔渦流）', { size: 7.5, fill: ORG });
    g += A(158, 70, 186, 70);
    g += B(232, 70, 88, 56, '同步整流', ['＋穩壓', '負載調變通訊']);
    g += A(276, 70, 304, 70);
    g += B(342, 70, 72, 48, '充電 IC', ['CC-CV']);
    g += L(342, 94, 342, 112) + B(342, 128, 66, 32, '鋰電池', []);
    g += T(200, 150, 'FOD 異物偵測：功率損失超標 → 停充（金屬異物會被加熱）', { size: 8.5, fill: ORG });
    return { d: 'Qi RX 鏈：線圈→ferrite→同步整流→充電 IC', svg: W(400, 162, g) };
  };

  M['wearable-lowpower'] = () => {
    let g = '';
    // 電流-時間 duty cycle 圖
    g += L(35, 20, 35, 110) + L(35, 110, 360, 110);
    g += T(22, 28, 'mA', { size: 8, fill: MUT }) + T(22, 100, 'µA', { size: 8, fill: MUT }) + T(200, 124, '時間', { size: 8, fill: MUT });
    g += PL('35,105 90,105 90,32 100,32 100,105 190,105 190,40 197,40 197,105 290,105 290,28 302,28 302,105 360,105', { color: ACC, w: 1.8 });
    g += T(95, 24, 'BLE 連線窗', { size: 7.5, fill: MUT }) + T(193, 32, '感測 FIFO 批次讀取', { size: 7.5, fill: MUT }) + T(296, 20, '抬腕亮屏', { size: 7.5, fill: MUT });
    g += T(140, 98, '深睡（SoC sleep＋RTC）佔 >95% 時間', { size: 8, fill: GRN });
    g += T(198, 140, '平均電流 = Σ(狀態電流 × 佔時比) → 事件驅動、FIFO 批次、長連線間隔', { size: 8.5 });
    return { d: '低功耗 duty-cycle：深睡為主、短暫爆發', svg: W(400, 150, g) };
  };

  // ================= 手機 =================
  M['mobile-pmic'] = () => {
    let g = '';
    g += B(46, 96, 70, 44, '電池', ['3.0~4.5V']);
    g += A(81, 96, 112, 96);
    g += B(176, 96, 124, 128, '主 PMIC', ['buck×10+（DVS）', 'LDO×N', '充電＋電量計', '上電時序狀態機']);
    const outs = [[36, '多相 buck → CPU 大核（DVFS 調壓）'], [66, 'buck → GPU / NPU'], [96, 'buck → DDR'], [126, 'LDO → 類比/感測/RF'], [156, '副 PMIC → 相機/顯示']];
    outs.forEach(([y, lbl]) => { g += L(238, 96, 252, 96) + L(252, y, 252, 96) + A(252, y, 272, y) + T(277, y + 3, lbl, { size: 8, anchor: 'start' }); });
    g += A(176, 160, 176, 178) + T(176, 190, 'SPMI ← SoC 即時命令調壓（DVFS）', { size: 8.5, fill: ACC });
    return { d: '手機 PMIC：數十軌整合＋SPMI 動態調壓', svg: W(450, 200, g) };
  };

  M['usb-pd-fastcharge'] = () => {
    let g = '';
    g += B(52, 60, 84, 52, 'PD 充電器', ['PPS 可調', '20mV 步進']);
    g += A(94, 44, 150, 44, 'VBUS ~8V');
    g += A(150, 74, 94, 74, 'CC：PPS 請求', { color: ACC });
    g += B(206, 60, 108, 60, '電荷泵直充', ['2:1 分壓', '效率 >97%']);
    g += A(260, 60, 292, 60, '4V 大電流');
    g += B(330, 60, 68, 48, '電池', ['Kelvin 量測']);
    g += T(200, 110, 'Vbus ≈ 2×Vbat＋線損 → 手機端只做 2:1，壓差熱耗極小', { size: 8.5 });
    g += T(200, 126, 'VBUS 過壓保護必備：協商異常時 20V 灌入會炸 5V 元件', { size: 8.5, fill: RED });
    g += T(200, 142, '>3A 需 E-marker 線材；PPS 補線損才調得準', { size: 8, fill: MUT });
    return { d: 'PPS 直充：充電器調壓＋2:1 電荷泵', svg: W(400, 152, g) };
  };

  M['fuel-gauge'] = () => {
    const s = S();
    let g = '';
    g += B(50, 66, 70, 48, '電池', []);
    g += L(85, 52, 118, 52);
    g += s.resistor(140, 52, { label: 'Rsense', value: 'mΩ', horizontal: true });
    g += L(164, 52, 200, 52) + A(200, 52, 228, 52) + T(248, 56, '系統負載', { size: 8.5, anchor: 'start' });
    // Kelvin 抽頭
    g += L(122, 52, 122, 84) + L(158, 52, 158, 84, {});
    g += A(122, 84, 150, 100, null, { color: ACC, w: 1 }) + A(158, 84, 166, 100, null, { color: ACC, w: 1 });
    g += B(158, 128, 132, 52, '電量計 IC', ['庫倫計數 ∫I·dt', '＋OCV 電壓模型', '＋阻抗/溫度修正']);
    g += A(224, 128, 254, 128, 'I2C');
    g += B(290, 128, 60, 36, '主機', ['SOC %']);
    g += B(60, 128, 56, 32, 'NTC', ['溫度']);
    g += A(88, 128, 92, 128);
    g += T(180, 172, '滿/空校準點重置庫倫基準；容量隨老化學習更新（SOH）', { size: 8.5, fill: MUT });
    return { d: '電量計：Rsense Kelvin＋庫倫/電壓模型融合', svg: W(380, 184, g) };
  };

  M['haptics-driver'] = () => {
    let g = '';
    g += B(48, 60, 64, 40, 'MCU', ['波形觸發']);
    g += A(80, 60, 112, 60, 'I2C');
    g += B(178, 60, 116, 64, 'Haptic Driver', ['DRV2605 類', '共振追蹤(BEMF)', '主動煞車']);
    g += A(236, 60, 268, 60, '驅動波形');
    g += B(310, 60, 76, 52, 'LRA', ['質量塊＋彈簧', 'f0 150~235Hz']);
    g += A(310, 86, 310, 108) + L(310, 108, 236, 108) + `<polyline points="236,108 236,92" fill="none" stroke="${MUT}" stroke-width="1.2"/>` + T(272, 118, '反電動勢回授 → 鎖 f0', { size: 8, fill: MUT });
    // 煞車波形
    g += PL('60,150 80,150 84,138 92,162 100,142 108,158 112,150 122,150 126,156 132,146 136,150 180,150', { color: ACC, w: 1.5 });
    g += T(96, 174, '驅動', { size: 7.5, fill: MUT }) + T(130, 174, '反向煞車→快停', { size: 7.5, fill: ORG });
    g += T(268, 152, '偏離 f0 → 效率驟降、手感差；GPIO 直推 = 無追蹤無煞車', { size: 8, fill: RED });
    return { d: 'LRA 驅動：共振頻率追蹤＋主動煞車', svg: W(400, 184, g) };
  };

  M['rf-frontend'] = () => {
    let g = '';
    g += T(30, 22, '天線', { size: 8.5 });
    g += L(30, 28, 30, 44) + L(22, 28, 38, 28) + L(24, 24, 36, 24, { w: 1 });
    g += L(30, 44, 58, 44);
    g += B(84, 44, 52, 36, '調諧器', ['可調電容']);
    g += A(110, 44, 136, 44);
    g += B(168, 44, 64, 40, '開關/雙工', ['頻段切換']);
    // 收發兩鏈
    g += L(200, 36, 222, 36) + A(222, 36, 244, 36);
    g += B(272, 36, 56, 30, 'LNA', ['NF 主導']);
    g += A(300, 36, 330, 36) ;
    g += A(244, 58, 222, 58) + L(222, 58, 200, 58);
    g += B(272, 58, 56, 30, 'PA', ['ET 供電']);
    g += L(330, 58, 300, 58);
    g += B(358, 47, 52, 52, '收發器', []);
    g += T(120, 92, '接收 NF 由第一級決定（Friis）→ LNA 前損耗要最小', { size: 8.5 });
    g += T(120, 108, '手握失配 → VSWR↑ → 調諧器補匹配（近接感測觸發）', { size: 8.5, fill: MUT });
    g += T(120, 124, '控制走 MIPI RFFE；TDD 收發窗時序對齊', { size: 8, fill: MUT });
    return { d: 'RF 前端鏈：天線→調諧→開關→LNA/PA→收發器', svg: W(400, 134, g) };
  };

  M['mobile-camera-power'] = () => {
    let g = '';
    g += B(64, 70, 96, 72, '相機 PMIC', ['多路 LDO＋buck', 'I2C 設定', '內建時序器']);
    const rails = [[34, 'AVDD 2.8V（像素/ADC，最怕雜訊）', ACC], [58, 'DVDD 1.05/1.2V（數位核心，buck）', C], [82, 'IOVDD 1.8V（MIPI/I2C IO）', C], [106, 'AF/OIS 2.8V（VCM，獨立軌！）', ORG]];
    rails.forEach(([y, lbl, cc]) => { g += L(112, 70, 128, 70) + L(128, y, 128, 70) + A(128, y, 148, y, null, { color: cc }) + T(153, y + 3, lbl, { size: 8, anchor: 'start', fill: cc === C ? '#0f172a' : cc }); });
    g += B(330, 150, 120, 40, 'CIS 感光模組', ['去耦貼連接器 3mm 內']);
    g += L(330, 130, 330, 118) + T(330, 112, '↑ 各軌', { size: 7.5, fill: MUT });
    g += T(60, 140, '上電順序照 datasheet', { size: 8.5, anchor: 'start' });
    g += T(60, 154, '（常見 IOVDD→AVDD→DVDD，', { size: 8, anchor: 'start', fill: MUT });
    g += T(60, 166, '各家不同；反序下電）', { size: 8, anchor: 'start', fill: MUT });
    g += T(60, 184, '錯序 → 閂鎖或初始化偶發失敗', { size: 8.5, anchor: 'start', fill: RED });
    return { d: '相機模組電源：PMIC 多軌＋嚴格上電時序', svg: W(400, 196, g) };
  };

  M['usbc-cc-mux'] = () => {
    let g = '';
    g += B(46, 84, 64, 96, 'USB-C 座', ['CC1', 'CC2', 'SSTX/RX ×2組']);
    g += A(78, 52, 118, 52, 'CC1/CC2');
    g += B(196, 84, 132, 96, 'HD3SS3220', ['CC 邏輯：方向/角色', '(DFP/UFP/DRP)', 'SuperSpeed 2:1 Mux']);
    g += A(78, 106, 118, 106, 'SSTX/RX（正反兩組）');
    g += A(262, 84, 300, 84, '單組 USB3');
    g += B(342, 84, 72, 48, 'SoC/USB3', []);
    g += T(196, 148, '插入方向由 CC 判定 → mux 選對應那組差分對', { size: 8.5 });
    g += T(196, 163, 'CC 上拉/下拉值決定角色與供電能力廣告', { size: 8, fill: MUT });
    return { d: 'Type-C 正反插：CC 偵測＋SuperSpeed mux 切換', svg: W(400, 172, g) };
  };

  // ================= 筆電 =================
  M['laptop-battery-charger'] = () => {
    let g = '';
    g += B(52, 46, 84, 44, 'USB-C PD', ['5~20V']);
    g += B(52, 104, 84, 36, '變壓器 20V', []);
    g += A(94, 46, 124, 56) + A(94, 104, 124, 84);
    g += B(190, 70, 120, 68, 'Buck-Boost 充電器', ['BQ257xx 類', '輸入電流限制', 'NVDC 架構']);
    g += A(250, 70, 288, 70, 'VSYS');
    g += B(322, 70, 60, 40, '系統', ['下游 POL']);
    g += L(190, 104, 190, 128) + B(190, 148, 84, 40, '2~4S 電池', ['7~17V']);
    g += T(206, 122, '↕ 充電 / 重載補電流(turbo)', { size: 8, anchor: 'start', fill: MUT });
    g += T(200, 200, '輸入可能高/低於電池電壓 → 必須四開關 buck-boost；輸入限流 ≤ PD 協商值', { size: 8.5 });
    return { d: 'NVDC 充電架構：buck-boost 兼供系統＋充電', svg: W(400, 212, g) };
  };

  M['usbc-pd-laptop'] = () => {
    let g = '';
    g += B(44, 90, 60, 110, 'USB-C', ['VBUS', 'CC×2', 'SS lanes', 'SBU']);
    g += A(74, 48, 108, 48, 'VBUS');
    g += B(160, 48, 96, 40, 'Buck-Boost 充電', ['受電/供電']);
    g += A(74, 84, 108, 84, 'CC');
    g += B(160, 96, 96, 52, 'PD 控制器', ['DRP 角色協商', 'VCONN 供線纜']);
    g += A(74, 132, 108, 132, 'SS lanes');
    g += B(160, 152, 96, 40, 'Mux/Retimer', ['USB4 或 DP']);
    g += A(208, 152, 244, 140) + A(208, 160, 244, 168);
    g += T(268, 140, 'USB4 → SoC', { size: 8.5, anchor: 'start' });
    g += T(268, 172, 'DP → GPU（Alt Mode）', { size: 8.5, anchor: 'start' });
    g += A(208, 96, 244, 96) + T(268, 99, 'EC（選源/角色決策）', { size: 8.5, anchor: 'start' });
    g += T(180, 210, '正反插：CC 判方向 → mux 切 lane；協商結果決定 lane 配置', { size: 8.5 });
    return { d: '筆電 USB-C 全功能埠：PD＋資料＋DP Alt Mode', svg: W(400, 220, g) };
  };

  M['ec-controller'] = () => {
    let g = '';
    g += B(190, 92, 96, 84, 'EC', ['常駐 MCU', 'S5 也醒著']);
    const io = [
      [60, 34, 'PCH/SoC', 'sideband：PWROK/PLTRST#', true],
      [60, 92, '充電器/PD', 'I2C：選源/充電', true],
      [60, 150, '電源鍵/LID', '喚醒事件', false],
      [330, 34, '風扇', 'PWM＋TACH', true],
      [330, 92, '鍵盤矩陣', '掃描', false],
      [330, 150, '溫度感測', 'NTC/DTS→ADC', false]
    ];
    io.forEach(([x, y, name, sub, dbl]) => {
      g += B(x, y, 92, 38, name, [sub]);
      const sx = x < 190 ? x + 46 : x - 46, tx = x < 190 ? 142 : 238;
      g += A(sx, y, tx, y > 92 ? 116 : (y < 92 ? 68 : 92));
      if (dbl) g += A(tx, y > 92 ? 116 : (y < 92 ? 68 : 92), sx, y, null, { color: MUT, w: 1 });
    });
    g += T(190, 190, 'EC 管：上電時序、電池、熱、輸入、待機喚醒 —— 主 SoC 睡著它仍在崗', { size: 8.5 });
    return { d: 'EC 樞紐：sideband/充電/風扇/鍵盤/喚醒', svg: W(400, 200, g) };
  };

  M['laptop-backlight'] = () => {
    const s = S();
    let g = '';
    g += B(48, 60, 70, 40, '電池', ['7~17V']);
    g += A(83, 60, 112, 60);
    g += B(162, 60, 96, 52, 'Boost 恆流', ['升壓到 N×Vf', '調光輸入']);
    g += L(210, 60, 240, 60);
    // LED 串
    let y0 = 60;
    [0, 1, 2].forEach(i => { g += s.diode(258 + i * 34, y0, { horizontal: true }); });
    g += T(292, 40, 'LED 串（N 顆串聯）', { size: 8, fill: MUT });
    g += L(258 + 2 * 34 + 16, 60, 372, 60) + L(372, 60, 372, 92) + A(372, 92, 214, 92, '電流回授', { color: ACC });
    g += L(214, 92, 214, 86);
    g += A(120, 106, 150, 92, 'PWM 調光', { color: ORG });
    g += T(120, 122, 'PWM 頻率避開可聞頻帶與可見閃爍；低亮度混合類比調光', { size: 8.5, anchor: 'start' });
    g += T(120, 138, 'VLCD 與背光上電時序照面板規範（避免開機閃白）', { size: 8, anchor: 'start', fill: MUT });
    return { d: '背光驅動：boost 恆流推 LED 串＋混合調光', svg: W(400, 148, g) };
  };

  M['laptop-power-seq'] = () => {
    let g = '';
    // 階梯時序圖
    const rails = [['常態軌(EC)', 30], ['記憶體軌', 55], ['核心軌', 80], ['IO 軌', 105]];
    g += L(120, 20, 120, 120) + L(120, 120, 380, 120);
    rails.forEach(([lbl, y], i) => {
      g += T(112, y + 4, lbl, { size: 8, anchor: 'end' });
      const x0 = 140 + i * 50;
      g += PL(`120,${y + 12} ${x0},${y + 12} ${x0 + 8},${y} 380,${y}`, { color: ACC, w: 1.6 });
      if (i < 3) g += A(x0 + 14, y + 1, x0 + 40, rails[i + 1][1] + 10, null, { color: MUT, w: 1 });
    });
    g += T(180, 132, 'PGOOD 串鏈：前一軌穩了才開下一軌', { size: 8.5 });
    g += A(340, 100, 340, 130) + T(340, 142, '全就緒 → 釋放 PLTRST# → 平台跑', { size: 8.5, fill: GRN });
    g += T(250, 160, 'DDR 有專屬順序（VDD→VDDQ→VTT/VREF）；錯序 = 開不了機或閂鎖', { size: 8.5, fill: RED });
    return { d: '上電時序：階梯開軌＋PGOOD 交握', svg: W(400, 170, g) };
  };

  M['laptop-fan-control'] = () => {
    let g = '';
    g += B(60, 70, 76, 56, 'EC', ['查表/PI 迴路', '斜率限幅']);
    g += A(98, 56, 140, 56, 'PWM 25kHz');
    g += A(140, 84, 98, 84, 'TACH（2 脈衝/轉）', { color: ACC });
    g += B(190, 70, 100, 56, '4 線風扇', ['內建驅動換相', '電源不斬波']);
    g += B(60, 150, 90, 40, 'NTC×N＋DTS', ['溫度來源']);
    g += A(60, 130, 60, 98);
    g += T(280, 40, '起轉：先 100% 衝數百 ms', { size: 8.5, anchor: 'start' });
    g += T(280, 56, '失速：TACH 逾時→斷電重試', { size: 8.5, anchor: 'start', fill: ORG });
    g += T(280, 72, '靜音：±200RPM/s 斜率', { size: 8.5, anchor: 'start' });
    g += T(280, 88, '＋3~5°C 溫度遲滯', { size: 8.5, anchor: 'start' });
    g += T(280, 110, '噪音 ∝ RPM^5~6', { size: 8.5, anchor: 'start', fill: MUT });
    g += T(190, 170, 'TACH 開汲極 → 上拉接 EC IO 電壓域（跨域接錯讀不到）', { size: 8.5, fill: RED });
    return { d: '風扇閉環：PWM 調速＋TACH 回授＋失速偵測', svg: W(400, 182, g) };
  };

  // ================= 車用 =================
  M['auto-load-dump'] = () => {
    let g = '';
    // 電壓-時間：load dump 波形被箝位
    g += L(35, 20, 35, 110) + L(35, 110, 240, 110);
    g += T(22, 30, '87V', { size: 7.5, fill: MUT }) + T(22, 58, '35V', { size: 7.5, fill: MUT }) + T(22, 96, '12V', { size: 7.5, fill: MUT });
    g += PL('35,92 80,92 86,26 108,30 150,60 200,88 240,92', { color: RED, w: 1.4, dash: '4 3' });
    g += PL('35,92 80,92 86,54 150,54 170,80 200,90 240,92', { color: ACC, w: 1.8 });
    g += T(150, 44, '箝位後 ~35V', { size: 8, fill: ACC }) + T(120, 20, '未箝位 ~87V', { size: 8, fill: RED });
    g += T(138, 122, 'Load dump：發電機甩負載，數百 ms', { size: 8, fill: MUT });
    // 保護鏈
    g += B(60, 158, 66, 34, '電池 12V', []);
    g += A(93, 158, 116, 158);
    g += B(152, 158, 64, 34, 'TVS 箝位', ['load-dump 級']);
    g += A(184, 158, 208, 158);
    g += B(252, 158, 80, 34, 'Pre-Boost', ['冷啟動 6V 撐住']);
    g += A(292, 158, 316, 158);
    g += B(352, 158, 64, 34, '車規 Buck', ['→ MCU']);
    g += T(300, 120, 'ISO 7637-2：pulse 1/2a/3a/3b/4/5', { size: 8, anchor: 'start', fill: MUT });
    return { d: 'Load dump 箝位波形＋ECU 前級保護鏈', svg: W(420, 186, g) };
  };

  M['reverse-battery-auto'] = () => {
    const s = S();
    let g = '';
    g += T(60, 26, '① 二極體：簡單但 V_F×I 全變熱', { size: 8.5, anchor: 'start' });
    g += L(60, 46, 96, 46) + s.diode(114, 46, { horizontal: true }) + L(132, 46, 168, 46);
    g += T(178, 50, '大電流不可行', { size: 8, anchor: 'start', fill: RED });
    g += T(60, 78, '② 理想二極體控制器＋N-MOS：僅 I²×RDS(on) 損耗', { size: 8.5, anchor: 'start' });
    g += L(60, 108, 100, 108);
    g += s.nmos(130, 128, { showPins: false, bodyDiode: true });
    g += T(130, 108 + 66, 'N-MOS（低 RDS(on)）', { size: 8, fill: MUT });
    g += L(156, 108, 210, 108);
    g += B(130, 180, 110, 34, '理想二極體控制器', ['LM74700-Q1 類']);
    g += L(100, 128, 100, 172) + A(130, 163, 130, 152, '閘極驅動');
    g += T(216, 100, '正接：導通', { size: 8.5, anchor: 'start', fill: GRN });
    g += T(216, 116, '反接：快速關斷', { size: 8.5, anchor: 'start', fill: RED });
    g += T(60, 216, '③ 背靠背 FET（source 對接）→ 同時擋反接＋反向回灌；耐壓涵蓋 load dump ~40V', { size: 8.5, anchor: 'start' });
    return { d: '防反接三代：二極體→理想二極體→背靠背 FET', svg: W(420, 230, g) };
  };

  M['can-fd-automotive'] = () => {
    const s = S();
    let g = '';
    // 匯流排幹線
    g += L(60, 70, 360, 70, { w: 2 }) + L(60, 96, 360, 96, { w: 2 });
    g += T(40, 74, 'CANH', { size: 8.5, anchor: 'start' }) + T(40, 100, 'CANL', { size: 8.5, anchor: 'start' });
    // 兩端終端
    [64, 352].forEach(x => { g += s.resistor(x, 83, { horizontal: false, label: '120Ω', labelSide: x < 200 ? 'left' : 'right' }); });
    // 節點
    [120, 210, 300].forEach((x, i) => {
      g += L(x, 70, x, 48) + L(x + 14, 96, x + 14, 48);
      g += B(x + 7, 34, 88, 30, `ECU 節點 ${i + 1}`, ['收發器＋TVS＋共模扼流']);
    });
    g += T(210, 122, '差分匯流排：顯性0/隱性1，非破壞仲裁（ID 小者優先）', { size: 8.5 });
    g += T(210, 138, 'CAN-FD 資料段 5~8Mbps：stub 要短、兩端各 120Ω（不是每節點都放）', { size: 8.5, fill: ORG });
    return { d: 'CAN 匯流排：兩端 120Ω 終端＋節點 stub', svg: W(420, 148, g) };
  };

  M['auto-power-arch'] = () => {
    let g = '';
    const chain = [
      [52, '電池', ['6~40V 髒電']],
      [136, '反接保護', ['理想二極體']],
      [220, 'EMI 濾波', ['傳導車規']],
      [312, 'Pre-Regulator', ['buck-boost', '冷啟動撐住']],
    ];
    chain.forEach(([x, name, sub], i) => {
      g += B(x, 56, i === 3 ? 92 : 72, 46, name, sub);
      if (i < chain.length - 1) g += A(x + (i === 3 ? 46 : 36), 56, chain[i + 1][0] - (i + 1 === 3 ? 46 : 36), 56);
    });
    g += L(312, 79, 312, 100) + A(312, 100, 312, 112);
    g += T(330, 96, '中間軌 5V/3.3V', { size: 8, anchor: 'start', fill: MUT });
    [[92, 'POL→MCU'], [192, 'POL→SoC/DDR'], [292, 'POL→類比/感測']].forEach(([x, lbl]) => {
      g += L(92, 112, 312, 112) ;
      g += A(x, 112, x, 128) + B(x, 146, 84, 32, lbl, []);
    });
    g += T(210, 182, '常態(KL30)路徑靜態電流 µA 級 —— 車停幾週不能吸乾電瓶', { size: 8.5, fill: ORG });
    return { d: '車用電源鏈：反接→EMI→前級穩壓→POL', svg: W(420, 192, g) };
  };

  M['aec-q100'] = () => {
    let g = '';
    g += T(120, 22, 'AEC-Q100 溫度分級', { size: 9, weight: '600' });
    const rows = [['Grade 0', '−40 ~ +150°C', '引擎室'], ['Grade 1', '−40 ~ +125°C', '車身多數'], ['Grade 2', '−40 ~ +105°C', '客艙'], ['Grade 3', '−40 ~ +85°C', '客艙低階']];
    rows.forEach(([a, b, c], i) => {
      const y = 42 + i * 22;
      g += `<rect x="30" y="${y - 12}" width="200" height="20" fill="${i % 2 ? '#f8fafc' : '#fff'}" stroke="#e2e8f0"/>`;
      g += T(58, y + 2, a, { size: 8.5 }) + T(130, y + 2, b, { size: 8.5 }) + T(198, y + 2, c, { size: 8, fill: MUT });
    });
    g += T(320, 22, 'ISO 26262 功能安全', { size: 9, weight: '600' });
    g += B(320, 52, 140, 34, '危害分析 → ASIL A~D', ['D 最嚴：煞車/轉向']);
    g += A(320, 69, 320, 84);
    g += B(320, 102, 140, 34, '安全機制', ['診斷覆蓋率/冗餘/FMEDA']);
    g += A(320, 119, 320, 134);
    g += B(320, 150, 140, 30, '安全狀態＋FIT 目標', []);
    g += T(130, 140, 'Q100=IC / Q101=分立 / Q200=被動', { size: 8.5, fill: MUT });
    g += T(130, 158, '過認證=元件夠格；系統安全另走 26262', { size: 8.5, fill: ORG });
    return { d: 'AEC-Q100 溫度分級＋ISO 26262 流程', svg: W(420, 190, g) };
  };

  M['auto-lin-bus'] = () => {
    const s = S();
    let g = '';
    g += F(80, 40, 'VBAT 12V');
    g += s.diode(80, 52, { horizontal: false });
    g += s.resistor(80, 88, { horizontal: false, label: '1kΩ', labelSide: 'left' });
    g += T(56, 60, '防倒灌', { size: 7.5, anchor: 'start', fill: ORG });
    g += L(80, 112, 80, 128) + L(60, 128, 360, 128, { w: 2 }) + T(376, 132, 'LIN', { size: 9 });
    g += B(80, 170, 96, 40, '主節點', ['MCU＋收發器']);
    g += L(80, 128, 80, 150);
    // 從節點×2
    [200, 310].forEach((x, i) => {
      g += F(x, 76, 'VBAT');
      g += s.resistor(x, 100, { horizontal: false, label: '30kΩ', labelSide: i ? 'right' : 'left' });
      g += L(x, 124, x, 128);
      g += B(x, 170, 92, 40, `從節點 ${i + 1}`, ['RC 振盪即可', 'INH→LDO EN']);
      g += L(x, 128, x, 150);
    });
    g += T(210, 210, '單線＋地回流；20kbps 斜率限制壓 EMI；τ=R×C ≤ 5µs', { size: 8.5 });
    g += T(210, 226, '休眠：INH 切整站 LDO，暗電流 <100µA/站；顯性 >150µs 喚醒', { size: 8.5, fill: MUT });
    return { d: 'LIN 硬體：主 1kΩ＋二極體、從 30kΩ、INH 休眠鏈', svg: W(420, 238, g) };
  };

  M['automotive-led-matrix'] = () => {
    let g = '';
    g += B(52, 70, 72, 44, '車電 12V', ['前級後']);
    g += A(88, 70, 116, 70);
    g += B(162, 70, 92, 52, 'Boost 升壓', ['推整串 LED', 'TPS99002S-Q1 管理']);
    g += A(208, 70, 236, 70);
    // LED 矩陣＋旁路開關
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
      const x = 256 + c * 34, y = 40 + r * 34;
      g += `<circle cx="${x}" cy="${y}" r="8" fill="${(r === 1 && c === 2) ? '#f1f5f9' : '#fef9c3'}" stroke="${C}" stroke-width="1.2"/>`;
      if (r === 1 && c === 2) g += X(x, y, 4);
    }
    g += T(306, 132, '矩陣管理 IC：每顆 LED 可獨立旁路（關掉）', { size: 8, fill: MUT });
    g += T(306, 146, '→ ADB 遮蔽對向來車、其餘保持遠光', { size: 8, fill: ACC });
    g += B(120, 140, 110, 36, '相機/演算法', ['偵測對向車']);
    g += A(175, 140, 240, 120, '旁路命令');
    return { d: '矩陣大燈：升壓＋每顆 LED 獨立旁路（ADB）', svg: W(420, 160, g) };
  };

  // ================= AI 伺服器 =================
  M['vrm-multiphase'] = () => {
    const s = S();
    let g = '';
    g += B(56, 90, 84, 56, '多相控制器', ['DVID 調壓', '電流均衡', 'PMBus']);
    // 三相示意
    [40, 90, 140].forEach((y, i) => {
      g += A(98, 90, 128, y);
      g += B(162, y, 60, 28, `DrMOS ${i + 1}`, []);
      g += s.inductor(212, y, { horizontal: true, label: '' });
      g += L(236, y, 268, y);
    });
    g += T(162, 170, '相位交錯 360°/N → 漣波抵消', { size: 8, fill: MUT });
    g += L(268, 40, 268, 140) + A(268, 90, 296, 90);
    // 輸出電容陣列
    [306, 318].forEach(x => { g += s.capacitor(x, 108, { horizontal: false }); });
    g += L(306, 122, 306, 130) + s.ground(306, 130, {}) + L(318, 122, 318, 130) + s.ground(318, 130, {});
    g += T(316, 66, 'MLCC 陣列＋bulk', { size: 7.5, fill: MUT });
    g += B(368, 90, 64, 44, 'CPU/GPU', ['0.7~1.1V', '數百 A']);
    g += L(296, 90, 336, 90);
    g += T(210, 190, '負載線 AVP：Vout = Vset − I×R_LL；每相佈局對稱否則電流不均、單相先燒', { size: 8.5, fill: ORG });
    return { d: '多相 VRM：交錯 DrMOS＋電流均衡＋AVP', svg: W(430, 200, g) };
  };

  M['server-48v-power'] = () => {
    let g = '';
    g += B(48, 60, 68, 44, '48V 母線', ['I²R ÷16']);
    g += A(82, 60, 112, 60);
    g += B(162, 60, 96, 48, 'IBC 4:1', ['LLC 固定比', '高效率']);
    g += A(210, 60, 240, 60, '12V');
    g += B(286, 60, 88, 48, '多相 VRM', ['12V→0.8V']);
    g += A(330, 60, 358, 60);
    g += B(392, 60, 56, 40, 'GPU', ['~1000A']);
    // 單級路徑
    g += L(48, 82, 48, 116) + A(48, 116, 236, 116, null, { color: ACC });
    g += B(286, 116, 96, 40, '48V 直降轉換', ['混合式/開關電容']);
    g += A(334, 116, 372, 100, null, { color: ACC });
    g += T(150, 108, '單級直降：省一級損耗', { size: 8, fill: ACC });
    g += T(220, 160, '垂直供電 VPD：功率級放 GPU 正下方 → PDN 路徑最短', { size: 8.5, fill: MUT });
    g += T(220, 176, '同功率電壓×4 → 電流÷4 → I²R 損耗÷16（48V 母線的理由）', { size: 8.5 });
    return { d: '48V 供電鏈：IBC 兩級 vs 直降單級', svg: W(440, 186, g) };
  };

  M['pmbus-telemetry'] = () => {
    let g = '';
    g += B(60, 60, 76, 44, 'BMC', ['輪詢＋告警']);
    g += L(98, 52, 380, 52) + T(390, 56, 'SCL/SDA', { size: 8, anchor: 'end' });
    g += L(98, 68, 380, 68, { color: ORG }) + T(390, 80, 'ALERT#（開汲極，主動報障）', { size: 8, anchor: 'end', fill: ORG });
    [[150, 'VRM', '0x40'], [230, 'IBC', '0x41'], [310, 'Hot-swap', '0x42'], [372, 'PSU', '0x58']].forEach(([x, name, addr]) => {
      g += L(x, 52, x, 92) ;
      g += B(x, 112, 64, 38, name, [addr]);
    });
    g += T(220, 158, 'READ_VOUT/IOUT/TEMP/POUT 遙測；VOUT_COMMAND 調壓；STATUS 報 OV/OC/OT', { size: 8.5 });
    g += T(220, 174, '位址不可衝突；匯流排總電容與上拉照 I2C 規範', { size: 8, fill: MUT });
    return { d: 'PMBus 拓撲：BMC 輪詢多裝置＋ALERT# 告警線', svg: W(440, 184, g) };
  };

  M['retimer-redriver'] = () => {
    let g = '';
    g += B(46, 56, 56, 36, 'TX', ['GPU']);
    g += A(74, 56, 128, 56, '長通道（衰減）');
    // 閉眼圖
    g += `<ellipse cx="152" cy="56" rx="16" ry="9" fill="none" stroke="${RED}" stroke-width="1.4"/>`;
    g += `<ellipse cx="152" cy="56" rx="7" ry="2.5" fill="none" stroke="${RED}" stroke-width="1.2"/>`;
    g += T(152, 80, '眼圖閉合', { size: 7.5, fill: RED });
    g += A(172, 56, 200, 56);
    g += B(248, 56, 92, 48, 'Retimer', ['CDR 重生時脈', '上下游各自等化']);
    g += A(294, 56, 322, 56);
    g += `<ellipse cx="346" cy="56" rx="16" ry="9" fill="none" stroke="${GRN}" stroke-width="1.4"/>`;
    g += `<ellipse cx="346" cy="56" rx="10" ry="6" fill="none" stroke="${GRN}" stroke-width="1.2"/>`;
    g += T(346, 80, '眼圖重開', { size: 7.5, fill: GRN });
    g += A(366, 56, 388, 56) + B(408, 56, 44, 32, 'RX', []);
    g += T(120, 110, 'Redriver（類比 CTLE）：延遲低、便宜，但不消抖動、撐不了長通道', { size: 8.5, anchor: 'start' });
    g += T(120, 126, 'Retimer（數位 CDR）：消抖動、可斷開通道預算重算；PCIe 要協定感知', { size: 8.5, anchor: 'start', fill: MUT });
    g += T(120, 142, '放置點：通道插入損耗中點；先算 channel budget 再定數量', { size: 8.5, anchor: 'start', fill: ORG });
    return { d: 'Retimer vs Redriver：眼圖恢復原理', svg: W(460, 152, g) };
  };

  M['hbm-power-decoupling'] = () => {
    let g = '';
    // 2.5D 剖面
    g += `<rect x="120" y="34" width="80" height="26" rx="2" fill="#eef4ff" stroke="${C}" stroke-width="1.4"/>` + T(160, 50, 'GPU die', { size: 8.5 });
    g += `<rect x="210" y="30" width="56" height="30" rx="2" fill="#fef9c3" stroke="${C}" stroke-width="1.4"/>` + T(238, 48, 'HBM 堆疊', { size: 8 });
    g += `<rect x="104" y="64" width="176" height="14" fill="#f1f5f9" stroke="${C}" stroke-width="1.2"/>` + T(192, 74, '矽中介層（interposer，矽電容在此）', { size: 7.5 });
    g += `<rect x="88" y="82" width="208" height="16" fill="#fff" stroke="${C}" stroke-width="1.2"/>` + T(192, 93, '封裝基板（基板電容）', { size: 7.5 });
    g += `<rect x="60" y="102" width="264" height="16" fill="#fff" stroke="${C}" stroke-width="1.4"/>` + T(192, 113, 'PCB（MLCC＋bulk）', { size: 7.5 });
    // 頻段標註
    g += A(340, 70, 340, 40, null, { color: ACC }) + T(346, 44, '最高頻', { size: 7.5, anchor: 'start', fill: ACC });
    g += A(340, 100, 340, 84, null, { color: MUT }) + T(346, 90, '中頻', { size: 7.5, anchor: 'start', fill: MUT });
    g += A(340, 128, 340, 108, null, { color: ORG }) + T(346, 120, '低頻/bulk', { size: 7.5, anchor: 'start', fill: ORG });
    g += T(192, 138, '數千 I/O 同時切換 → SSN 巨大；PCB 電容寄生電感來不及供高頻', { size: 8.5 });
    g += T(192, 154, '各層電容阻抗頻段要銜接無縫：某頻段尖峰 = 該頻段供電不足 → 誤碼', { size: 8.5, fill: RED });
    return { d: 'HBM 分層去耦：矽電容→基板→PCB 頻段接力', svg: W(430, 164, g) };
  };

  M['server-hotswap-efuse'] = () => {
    const s = S();
    let g = '';
    g += B(44, 60, 60, 44, '背板', ['12V 帶電']);
    g += L(74, 52, 106, 52);
    g += s.resistor(128, 52, { horizontal: true, label: 'Rsense', value: 'Kelvin' });
    g += L(152, 52, 178, 52);
    g += s.nmos(200, 72, { showPins: false, bodyDiode: true });
    g += T(200, 118, 'SOA 強化 MOSFET', { size: 8, fill: MUT });
    g += L(226, 52, 268, 52) + A(268, 52, 292, 52);
    g += B(322, 52, 60, 36, '板內 VRM', []);
    g += s.capacitor(268, 74, { horizontal: false }) + L(268, 88, 268, 96) + s.ground(268, 96, {});
    g += T(288, 78, '數 mF bulk', { size: 7.5, anchor: 'start', fill: MUT });
    g += B(140, 130, 120, 40, '熱插拔控制器', ['dV/dt 限流啟動', 'UV/OV/OC＋PMBus']);
    g += L(128, 62, 128, 110) + A(200, 110, 200, 92, '閘極斜率');
    // inrush 曲線
    g += L(310, 120, 310, 180) + L(310, 180, 420, 180);
    g += PL('310,175 330,130 344,168 420,172', { color: RED, w: 1.4, dash: '4 3' });
    g += PL('310,175 340,158 380,150 420,148', { color: ACC, w: 1.8 });
    g += T(352, 128, '未控 inrush 數百A', { size: 7.5, fill: RED });
    g += T(386, 142, '受控 dV/dt', { size: 7.5, fill: ACC });
    g += T(210, 196, 'FET 選型看 SOA 不是 RDS(on)：啟動線性區同時扛高 VDS×大電流（經典炸點）', { size: 8.5, fill: ORG });
    return { d: '熱插拔：dV/dt 限流＋SOA 選型＋inrush 對比', svg: W(430, 206, g) };
  };

  // ================= 基礎 / 電源電路 =================
  M['acdc-flyback'] = () => {
    const s = S();
    let g = '';
    g += T(36, 40, 'AC', { size: 9 }) + `<circle cx="36" cy="56" r="10" fill="none" stroke="${C}" stroke-width="1.6"/>` + `<path d="M 30 56 q 3 -5 6 0 q 3 5 6 0" fill="none" stroke="${C}" stroke-width="1.2"/>`;
    g += L(46, 56, 66, 56);
    g += B(92, 56, 48, 36, '橋式', ['整流']);
    g += L(116, 56, 148, 56) + s.junction(132, 56);
    g += s.capacitor(132, 78, { horizontal: false }) + L(132, 92, 132, 100) + s.ground(132, 100, {}) + T(112, 80, 'bulk', { size: 7.5, fill: MUT });
    // 變壓器：一次側/二次側電感＋鐵芯
    g += s.inductor(160, 76, { horizontal: false }) + L(148, 56, 160, 56) + L(160, 56, 160, 64);
    g += L(172, 60, 172, 96, { w: 1.2 }) + L(176, 60, 176, 96, { w: 1.2 });
    g += s.inductor(188, 76, { horizontal: false });
    g += T(160, 46, 'Np', { size: 7.5, fill: MUT }) + T(190, 46, 'Ns', { size: 7.5, fill: MUT });
    g += `<circle cx="152" cy="64" r="2" fill="${C}"/>` + `<circle cx="196" cy="90" r="2" fill="${C}"/>`;
    // 一次側 MOSFET＋PWM
    g += L(160, 96, 160, 108);
    g += s.nmos(138, 128, { showPins: false }) + L(160, 108, 164, 108);
    g += L(164, 148, 164, 156) + s.ground(164, 156, {});
    g += B(84, 128, 56, 34, 'PWM', ['控制器']);
    g += L(112, 128, 108, 128);
    // 二次側：二極體＋輸出電容
    g += L(188, 64, 188, 56) + L(188, 56, 214, 56);
    g += s.diode(230, 56, { horizontal: true });
    g += L(246, 56, 300, 56) + s.junction(272, 56);
    g += s.capacitor(272, 78, { horizontal: false }) + L(272, 92, 272, 98) + s.ground(272, 98, {});
    g += A(300, 56, 316, 56) + T(322, 60, 'Vout', { size: 9, anchor: 'start' });
    // 光耦回授
    g += B(240, 130, 64, 30, '光耦＋TL431', ['隔離回授']);
    g += L(272, 100, 272, 100);
    g += A(272, 66, 272, 62); // no-op keep
    g += L(300, 56, 300, 130) + L(300, 130, 272, 130);
    g += A(208, 130, 112, 138, null, { color: ACC, w: 1 });
    g += T(196, 172, '開關閉合：能量存一次側；斷開：極性反轉、二極體導通放能到輸出', { size: 8.5 });
    g += T(196, 188, '一二次側「地」隔離（安規）；回授過光耦', { size: 8.5, fill: ORG });
    return { d: '返馳式：變壓器儲能＋光耦隔離回授', svg: W(400, 198, g) };
  };

  M['regulator-ldo-vs-buck'] = () => {
    const s = S();
    let g = '';
    g += T(60, 24, 'LDO（線性）', { size: 9, weight: '600', anchor: 'start' });
    g += L(40, 48, 70, 48) + T(36, 42, '5V', { size: 8 });
    g += B(104, 48, 60, 30, 'LDO', []);
    g += L(134, 48, 172, 48) + T(178, 52, '3.3V', { size: 8, anchor: 'start' });
    g += T(104, 82, '壓差×電流全變熱', { size: 8, fill: RED });
    g += T(104, 94, '效率 = Vout/Vin = 66%', { size: 8, fill: MUT });
    g += T(104, 108, '✚ 無漣波、便宜、快', { size: 8, fill: GRN });
    g += T(250, 24, 'Buck（開關）', { size: 9, weight: '600', anchor: 'start' });
    g += L(228, 48, 252, 48) + T(224, 42, '5V', { size: 8 });
    g += B(280, 48, 52, 30, 'SW', ['PWM']);
    g += s.inductor(330, 48, { horizontal: true });
    g += L(354, 48, 386, 48) + s.junction(366, 48) + T(392, 52, '3.3V', { size: 8, anchor: 'start' });
    g += s.capacitor(366, 70, { horizontal: false }) + L(366, 84, 366, 92) + s.ground(366, 92, {});
    g += T(310, 108, '效率 90%+，發熱小', { size: 8, fill: GRN });
    g += T(310, 120, '✚ 大壓差/大電流首選', { size: 8, fill: MUT });
    g += T(310, 134, '− 開關漣波、EMI、成本', { size: 8, fill: ORG });
    g += T(210, 160, '選型：壓差小/怕噪選 LDO；壓差大/電流大選 Buck；常見 Buck→LDO 兩級', { size: 8.5 });
    return { d: 'LDO vs Buck：效率與噪聲取捨', svg: W(430, 170, g) };
  };

  M['isolated-gate-driver'] = () => {
    const s = S();
    let g = '';
    g += B(56, 70, 72, 44, '控制器', ['PWM (低壓側)']);
    g += A(92, 70, 120, 70);
    // 隔離柵
    g += `<rect x="124" y="30" width="14" height="120" fill="#fef9c3" stroke="${ORG}" stroke-width="1.2" stroke-dasharray="4 3"/>`;
    g += T(131, 164, '隔離柵（CMTI kV/µs）', { size: 7.5, fill: ORG });
    g += B(196, 70, 100, 60, '隔離閘極驅動', ['DESAT 檢測', '米勒箝位', 'UVLO']);
    g += L(138, 70, 146, 70);
    g += A(246, 56, 282, 56, '開通(Rg_on)');
    g += A(246, 84, 282, 84, '關斷(Rg_off)');
    // SiC/IGBT
    g += s.nmos(312, 76, { showPins: false }) + T(312, 122, 'SiC/IGBT（高壓側）', { size: 8, fill: MUT });
    g += L(338, 56, 356, 56) + F(356, 56, 'HV+');
    g += L(338, 96, 356, 96) + T(362, 100, '→ 負載', { size: 8, anchor: 'start' });
    g += A(312, 96, 246, 108, 'DESAT 回檢', { color: RED });
    g += T(200, 176, 'CMTI：橋臂 dV/dt 打穿隔離會誤觸發；米勒箝位防寄生導通（直通炸橋）', { size: 8.5, fill: RED });
    return { d: '隔離閘驅：隔離柵＋DESAT＋米勒箝位', svg: W(420, 186, g) };
  };

  M['usbc-pd-sink-path'] = () => {
    const s = S();
    let g = '';
    g += B(44, 70, 56, 72, 'USB-C', ['VBUS', 'CC1/CC2']);
    g += L(72, 48, 108, 48) + T(88, 40, 'VBUS 5~20V', { size: 7.5, fill: MUT });
    // 背靠背 NFET
    g += s.nmos(130, 68, { showPins: false, bodyDiode: true });
    g += s.nmos(196, 68, { showPins: false, bodyDiode: true });
    g += L(156, 48, 170, 48);
    g += T(163, 108, '背靠背 NFET（雙向斷）', { size: 8, fill: MUT });
    g += L(222, 48, 268, 48) + A(268, 48, 292, 48) + T(298, 52, '系統/充電器', { size: 8.5, anchor: 'start' });
    g += B(150, 150, 110, 52, 'PD Sink 控制器', ['TPS25730 類', 'CC 協商', '閘極驅動＋OVP']);
    g += A(72, 88, 100, 140, 'CC');
    g += A(150, 124, 130, 92, '閘控') + A(178, 124, 196, 92, null);
    g += T(300, 100, 'Dead-battery：Rd 讓', { size: 8, anchor: 'start', fill: MUT });
    g += T(300, 112, '空電池也能被供電啟動', { size: 8, anchor: 'start', fill: MUT });
    g += T(300, 132, 'OVP：協商前只認 5V，', { size: 8, anchor: 'start', fill: ORG });
    g += T(300, 144, '異常高壓直接斷 FET', { size: 8, anchor: 'start', fill: ORG });
    return { d: 'PD Sink 電源路徑：CC 協商＋背靠背 FET 閘控', svg: W(420, 210, g) };
  };

  M['classd-output-filter'] = () => {
    const s = S();
    let g = '';
    g += B(52, 70, 72, 56, 'Class-D', ['H 橋輸出', 'PWM 數百kHz']);
    // BTL 兩路 LC
    [[48, 'OUT+'], [92, 'OUT−']].forEach(([y, lbl]) => {
      g += L(88, y, 112, y) + T(100, y - 6, lbl, { size: 7.5, fill: MUT });
      g += s.inductor(134, y, { horizontal: true });
      g += L(158, y, 210, y) + s.junction(184, y);
      g += s.capacitor(184, y + 16, { horizontal: false });
      g += L(184, y + 30, 184, y + 34) + s.ground(184, y + 34, {});
    });
    // 喇叭
    g += `<rect x="210" y="56" width="12" height="28" fill="#fff" stroke="${C}" stroke-width="1.4"/>`;
    g += `<polygon points="222,56 240,44 240,96 222,84" fill="#fff" stroke="${C}" stroke-width="1.4"/>`;
    g += T(230, 110, '喇叭', { size: 8 });
    g += T(320, 48, 'LC 截止 ≈ 30~60kHz：', { size: 8.5, anchor: 'start' });
    g += T(320, 62, '通音頻、擋開關載波', { size: 8, anchor: 'start', fill: MUT });
    g += T(320, 82, '近場短線可免濾波', { size: 8.5, anchor: 'start' });
    g += T(320, 96, '（靠喇叭電感），長線', { size: 8, anchor: 'start', fill: MUT });
    g += T(320, 108, '必上 LC 否則 EMI 超標', { size: 8, anchor: 'start', fill: ORG });
    g += T(210, 140, 'BTL 兩端都要濾；L 選飽和電流夠的功率電感，C 用低失真 C0G/薄膜', { size: 8.5 });
    return { d: 'Class-D BTL 輸出 LC 濾波', svg: W(430, 150, g) };
  };

  M['space-grade-power'] = () => {
    let g = '';
    g += B(50, 70, 68, 40, '衛星匯流排', ['28V/100V']);
    g += A(84, 60, 112, 48) + A(84, 80, 112, 92);
    g += B(168, 48, 104, 36, '主電源（QMLV）', ['降額 50% 用']);
    g += B(168, 92, 104, 36, '備援電源（冗餘）', ['冷/熱備']);
    g += A(220, 48, 248, 60) + A(220, 92, 248, 80);
    g += B(286, 70, 68, 40, 'ORing', ['故障隔離']);
    g += A(320, 70, 348, 70);
    g += B(384, 70, 60, 40, '酬載', []);
    g += T(120, 140, 'TID 總劑量：參數漂移 → 選 rad-hard 製程＋壽命末期參數設計', { size: 8.5, anchor: 'start' });
    g += T(120, 156, 'SEE 單粒子：閂鎖/翻轉 → 限流、看門狗、三模冗餘（TMR）', { size: 8.5, anchor: 'start', fill: ORG });
    g += T(120, 172, 'QMLV 全流程篩選 vs SEP 商規增強：成本差 10 倍級，依任務等級選', { size: 8.5, anchor: 'start', fill: MUT });
    return { d: '太空電源：冗餘＋ORing＋輻射降額', svg: W(440, 182, g) };
  };

  M['current-sense-kelvin'] = () => {
    const s = S();
    let g = '';
    g += T(120, 22, 'Kelvin 四線接法', { size: 9, weight: '600' });
    g += L(40, 48, 96, 48, { w: 3 }) + T(60, 40, '大電流', { size: 8, fill: MUT });
    g += `<rect x="96" y="40" width="48" height="16" fill="#fff" stroke="${C}" stroke-width="1.8"/>` + T(120, 51, 'Rs mΩ', { size: 8 });
    g += L(144, 48, 200, 48, { w: 3 });
    // sense 抽頭（從電阻焊盤內側）
    g += L(102, 56, 102, 84, { color: ACC, w: 1.2 }) + L(138, 56, 138, 84, { color: ACC, w: 1.2 });
    g += T(120, 76, '感測線（不走大電流）', { size: 7.5, fill: ACC });
    g += B(120, 106, 88, 36, '差動放大', ['→ ADC']);
    g += T(120, 140, '走線壓降不進量測 → mΩ 級才量得準', { size: 8, fill: GRN });
    // 低邊 vs 高邊
    g += T(320, 22, '低邊 vs 高邊', { size: 9, weight: '600' });
    g += T(258, 46, '低邊：Rs 在 GND 端', { size: 8.5, anchor: 'start' });
    g += T(258, 60, '簡單便宜；地被抬高、短路到地量不到', { size: 8, anchor: 'start', fill: MUT });
    g += T(258, 82, '高邊：Rs 在電源端', { size: 8.5, anchor: 'start' });
    g += T(258, 96, '抓得到對地短路；放大器要吃高共模', { size: 8, anchor: 'start', fill: MUT });
    g += T(258, 118, 'DCR：用電感電阻免 Rs', { size: 8.5, anchor: 'start' });
    g += T(258, 132, '零損耗但精度看 L 的 DCR 公差/溫漂', { size: 8, anchor: 'start', fill: MUT });
    return { d: 'Kelvin 感測＋低邊/高邊/DCR 比較', svg: W(430, 152, g) };
  };

  M['gan-gate-drive'] = () => {
    const s = S();
    let g = '';
    g += B(64, 70, 88, 52, 'GaN 驅動器', ['LMG1020 類', '開/關分離輸出']);
    g += A(108, 56, 148, 56, 'Rg_on 小');
    g += A(108, 84, 148, 84, 'Rg_off 更小');
    g += s.nmos(178, 76, { showPins: false });
    g += T(178, 122, 'GaN FET（ns 級邊沿）', { size: 8, fill: MUT });
    g += L(204, 56, 224, 56) + F(224, 56, 'VBUS');
    g += L(204, 96, 224, 96) + T(230, 100, '→ 功率迴路', { size: 8, anchor: 'start' });
    g += A(204, 96, 64, 104, 'Kelvin source 獨立回線', { color: ACC });
    g += T(230, 140, '驅動迴路面積 = 一切：', { size: 8.5, anchor: 'start' });
    g += T(230, 154, '幾 nH 寄生電感 × ns 邊沿 = 振鈴/誤開', { size: 8, anchor: 'start', fill: RED });
    g += T(230, 170, '閘極耐壓僅 ~6V，過衝就打壞', { size: 8, anchor: 'start', fill: ORG });
    g += T(64, 150, '佈局：驅動器貼著 FET', { size: 8, fill: MUT });
    g += T(64, 163, '（mm 級），迴路最小化', { size: 8, fill: MUT });
    return { d: 'GaN 閘驅：分離開關路徑＋Kelvin source', svg: W(420, 182, g) };
  };

  M['bldc-three-phase-drive'] = () => {
    const s = S();
    let g = '';
    g += F(200, 26, 'VBUS');
    // 三個半橋
    [148, 200, 252].forEach((x, i) => {
      g += L(x, 26, x, 26) + L(200, 26, x, 26);
      g += L(x, 26, x, 38);
      g += s.nmos(x - 26, 54, { showPins: false }); // 上管（畫左偏）
      g += L(x, 70, x, 84) + s.junction(x, 84);
      g += s.nmos(x - 26, 104, { showPins: false });
      g += L(x, 120, x, 132) + L(148, 132, 252, 132);
      g += L(x, 84, x + 22, 84) ;
      g += T(x + 30, 88, 'UVW'[i], { size: 8.5, anchor: 'start' });
    });
    g += L(200, 132, 200, 140) + s.resistor(200, 158, { horizontal: false, label: 'Rs', labelSide: 'right' }) + L(200, 176, 200, 182) + s.ground(200, 182, {});
    // 馬達
    g += `<circle cx="330" cy="84" r="26" fill="#fff" stroke="${C}" stroke-width="1.8"/>` + T(330, 88, 'M', { size: 12, weight: '600' });
    g += L(282, 84, 304, 84);
    g += B(72, 84, 96, 64, '智慧閘驅 IC', ['MCF8329 類', '6 路驅動＋保護', '死區/直通防護']);
    g += A(120, 84, 116, 84);
    g += T(200, 206, '換相依 Hall/BEMF 回授；Rs 電流回授做 FOC；死區不足＝上下管直通', { size: 8.5, fill: ORG });
    return { d: '三相 BLDC：三半橋＋電流感測＋智慧閘驅', svg: W(420, 216, g) };
  };

  M['hall-magnetic-sensing'] = () => {
    let g = '';
    g += `<rect x="40" y="40" width="26" height="40" rx="3" fill="#fecaca" stroke="${C}" stroke-width="1.4"/>` + T(53, 64, 'N', { size: 10, weight: '600' });
    g += `<rect x="66" y="40" width="26" height="40" rx="3" fill="#bfdbfe" stroke="${C}" stroke-width="1.4"/>` + T(79, 64, 'S', { size: 10, weight: '600' });
    g += T(66, 94, '磁鐵（移動/旋轉）', { size: 8, fill: MUT });
    g += A(100, 60, 128, 60, 'B 場');
    g += B(178, 60, 92, 52, 'Hall IC', ['TMAG 系', '開集極輸出加上拉']);
    const types = [[30, '開關型：門檻切換（翻蓋偵測）'], [52, '鎖存型：N/S 交替鎖存（馬達換相）'], [74, '線性型：輸出 ∝ B（電流/位置）'], [96, '角度型：XY 双軸 → atan2（旋鈕/轉角）']];
    types.forEach(([y, lbl]) => { g += L(224, 60, 240, 60) + L(240, y, 240, 60) + A(240, y, 256, y) + T(261, y + 3, lbl, { size: 8, anchor: 'start' }); });
    g += T(210, 130, '選型看：靈敏度(mT)、輸出型式、頻寬、溫漂；磁鐵-感測距離立方衰減', { size: 8.5 });
    return { d: '霍爾感測四型：開關/鎖存/線性/角度', svg: W(430, 140, g) };
  };

  M['isolated-current-sense'] = () => {
    const s = S();
    let g = '';
    g += T(80, 26, '高壓側（母線電位）', { size: 8.5, fill: ORG });
    g += L(36, 48, 80, 48, { w: 2.5 });
    g += `<rect x="80" y="41" width="44" height="14" fill="#fff" stroke="${C}" stroke-width="1.8"/>` + T(102, 51, 'shunt', { size: 8 });
    g += L(124, 48, 168, 48, { w: 2.5 }) + T(146, 40, '大電流', { size: 7.5, fill: MUT });
    g += L(86, 55, 86, 76, { color: ACC, w: 1.1 }) + L(118, 55, 118, 76, { color: ACC, w: 1.1 });
    g += B(102, 96, 96, 36, '隔離放大/ΔΣ', ['AMC1300 類']);
    // 隔離柵
    g += `<rect x="150" y="78" width="12" height="40" fill="#fef9c3" stroke="${ORG}" stroke-width="1.2" stroke-dasharray="4 3"/>`;
    g += T(156, 130, '隔離柵', { size: 7.5, fill: ORG });
    g += A(162, 96, 196, 96, '差動輸出');
    g += B(238, 96, 76, 36, 'MCU/ADC', ['低壓側']);
    g += T(102, 148, '浮動供電：高壓側要', { size: 8, fill: MUT });
    g += T(102, 160, '隔離電源（自舉/隔離 DC-DC）', { size: 8, fill: MUT });
    g += T(300, 52, '用途：馬達相電流、', { size: 8.5, anchor: 'start' });
    g += T(300, 66, '母線監控、太陽能', { size: 8.5, anchor: 'start' });
    g += T(300, 148, 'ΔΣ 位元流版本由 MCU 端 sinc 濾波重建，延遲可控', { size: 8, anchor: 'start', fill: MUT });
    return { d: '隔離電流量測：高壓 shunt＋隔離放大器', svg: W(430, 172, g) };
  };

  M['c2000-digital-power-control'] = () => {
    let g = '';
    g += B(80, 80, 110, 88, 'C2000 MCU', ['HRPWM 150ps 級', 'CMPSS 比較器', 'ADC 同步觸發']);
    g += A(135, 56, 176, 56, 'HRPWM');
    g += B(226, 56, 90, 40, '功率級', ['橋式/圖騰柱']);
    g += A(271, 56, 300, 56) + T(310, 60, 'Vout', { size: 8.5, anchor: 'start' });
    g += L(300, 56, 300, 108) + A(300, 108, 141, 108, '電壓/電流取樣（ADC 與 PWM 同步）', { color: ACC });
    g += A(226, 76, 226, 120) + L(226, 120, 150, 120);
    g += T(268, 132, 'CMPSS 硬體快保護：過流直接砍 PWM（不等軟體迴圈）', { size: 8.5, fill: RED });
    g += T(220, 160, '控制迴路全數位：2p2z/3p3z 補償器跑在 ISR；HRPWM 解析度決定極限佔空比精度', { size: 8.5 });
    return { d: '數位電源迴路：HRPWM→功率級→同步 ADC→CMPSS', svg: W(440, 170, g) };
  };

  M['multichannel-sar-afe'] = () => {
    let g = '';
    ['感測 1', '感測 2', '感測 N'].forEach((lbl, i) => {
      const y = 40 + i * 34;
      g += B(48, y, 60, 26, lbl, []);
      g += A(78, y, 108, y);
    });
    g += T(48, 128, '（高阻源）', { size: 8, fill: MUT });
    g += B(146, 74, 60, 92, 'MUX', ['通道掃描']);
    g += A(176, 74, 204, 74);
    g += B(238, 74, 56, 40, 'PGA', ['增益/檔']);
    g += A(266, 74, 292, 74);
    g += B(326, 74, 56, 40, 'SAR ADC', []);
    g += A(354, 74, 380, 74, 'SPI');
    g += T(238, 130, '單晶片 AFE（ADS 系）：省外部調理電路', { size: 8.5 });
    g += T(238, 146, '通道切換後要等建立時間（MUX 電荷注入＋PGA settle）再取樣，否則串道', { size: 8.5, fill: ORG });
    return { d: '多通道 SAR AFE：MUX→PGA→ADC 掃描鏈', svg: W(430, 156, g) };
  };

  M['space-grade-supervisor'] = () => {
    let g = '';
    ['3.3V', '1.8V', '0.9V'].forEach((r, i) => {
      const y = 40 + i * 30;
      g += F(40, y + 8, r);
      g += A(52, y, 96, y);
    });
    g += B(148, 70, 100, 88, '多路監控 IC', ['每軌 UV/OV 窗比較', 'SEE 加固', '序列/延遲可設']);
    g += A(198, 52, 232, 52, 'PGOOD 鏈');
    g += A(198, 88, 232, 88, 'RESET#');
    g += B(280, 70, 80, 56, '主 MCU/FPGA', []);
    g += A(280, 98, 280, 124) + L(280, 124, 148, 124) + `<polyline points="148,124 148,116" fill="none" stroke="${C}" stroke-width="1.3"/>`;
    g += T(214, 136, '看門狗回踢（漏踢 → 強制重啟）', { size: 8.5, fill: MUT });
    g += T(220, 162, 'SEE 環境：監控器自身要抗翻轉（冗餘表決），否則保護者變亂源', { size: 8.5, fill: ORG });
    return { d: '太空監控：多軌 UV/OV＋看門狗＋SEE 加固', svg: W(430, 172, g) };
  };

  M['measurement-basics'] = () => {
    let g = '';
    g += B(56, 60, 72, 44, '待測物 DUT', []);
    g += A(92, 48, 132, 48, '探棒');
    g += B(180, 48, 88, 40, '示波器', ['頻寬 ≥ 5×訊號']);
    g += A(92, 76, 132, 76);
    g += B(180, 90, 88, 36, 'DMM', ['精度/解析度']);
    g += T(300, 40, '探棒地夾迴路 = 天線：', { size: 8.5, anchor: 'start' });
    g += T(300, 54, '量高速用短地簧針', { size: 8, anchor: 'start', fill: ORG });
    g += T(300, 74, '10× 探棒：衰減換頻寬', { size: 8.5, anchor: 'start' });
    g += T(300, 94, '量前先想負載效應：', { size: 8.5, anchor: 'start' });
    g += T(300, 108, '探棒 C 會拖慢邊沿', { size: 8, anchor: 'start', fill: MUT });
    g += T(190, 140, '量測改變被量者 —— 先估探棒/儀器對電路的影響再信讀值', { size: 8.5 });
    return { d: '量測基礎：示波器/DMM 與探棒效應', svg: W(430, 150, g) };
  };

  M['pch-sideband'] = () => {
    let g = '';
    g += B(60, 50, 76, 40, 'CPU', []);
    g += B(60, 120, 76, 40, 'PCH', ['平台樞紐']);
    g += L(60, 70, 60, 100);
    g += B(230, 50, 76, 40, '電源鏈', ['各軌 VRM']);
    g += B(230, 120, 76, 40, 'EC', ['時序總管']);
    g += A(98, 120, 192, 120, 'SLP_S3#/S4#/S5#（睡眠狀態）');
    g += A(192, 128, 98, 128, null, { color: MUT });
    g += A(230, 100, 230, 70, 'PWROK（軌穩定）');
    g += A(98, 50, 192, 50, 'PLTRST#（平台重置釋放）');
    g += T(150, 170, '交握順序：EC 開軌 → 各 PWROK → PCH 確認 → 釋放 PLTRST# → 平台跑', { size: 8.5 });
    g += T(150, 186, '每根 sideband 都有時序窗（平台設計指南），錯序 = 不開機', { size: 8.5, fill: ORG });
    return { d: 'Sideband 交握：SLP#/PWROK/PLTRST#', svg: W(400, 196, g) };
  };

  M['tpm-circuit'] = () => {
    const s = S();
    let g = '';
    g += B(64, 76, 84, 56, 'PCH / SoC', ['SPI 主機']);
    const sigs = [['CS#', 44], ['CLK', 62], ['MOSI', 80], ['MISO', 98]];
    sigs.forEach(([lbl, y]) => { g += (y === 98 ? A(196, y, 106, y, lbl) : A(106, y, 196, y, lbl)); });
    g += B(240, 76, 84, 60, 'TPM 2.0', ['dTPM 晶片', '金鑰不出晶片']);
    g += F(240, 36, '3.3V');
    g += L(240, 36, 240, 46);
    g += s.resistor(286, 44, { horizontal: false, label: '上拉', labelSide: 'right' });
    g += L(286, 20, 286, 20);
    g += T(196, 148, 'CS# 要上拉（未選時不浮動）；SPI 走線短、遠離開關雜訊', { size: 8.5 });
    g += T(196, 164, '防拆/防探測：TPM 貼近 PCH、避免飛線可攔截匯流排', { size: 8.5, fill: ORG });
    return { d: 'TPM SPI 接線：CS/CLK/MOSI/MISO＋上拉', svg: W(400, 174, g) };
  };

  // ================= PCB / 佈局 / 高速 =================
  M['pcb走线规则'] = () => {
    let g = '';
    g += T(100, 22, '轉角', { size: 9, weight: '600' });
    g += PL('40,60 90,60 90,100', { w: 2.5, color: RED }) + X(90, 60, 5) + T(66, 112, '90° 直角', { size: 8, fill: RED });
    g += PL('130,60 170,60 190,80 190,110', { w: 2.5, color: GRN }) + OK(170, 46) + T(166, 122, '45°/圓弧', { size: 8, fill: GRN });
    g += T(320, 22, '間距與線寬', { size: 9, weight: '600' });
    g += L(260, 52, 400, 52, { w: 3 }) + L(260, 74, 400, 74, { w: 3 });
    g += A(330, 56, 330, 70, '3W 間距（防串擾）', { dx: 40 });
    g += L(260, 100, 400, 100, { w: 5 }) + T(330, 116, '大電流線加寬（載流量查 IPC-2152）', { size: 8, fill: MUT });
    g += T(220, 150, '差分對等長等距；高速線少過孔、不跨分割；訊號回流走正下方參考平面', { size: 8.5 });
    return { d: '走線規則：轉角/間距/線寬', svg: W(430, 160, g) };
  };

  M['em-fields-return-path'] = () => {
    let g = '';
    // 剖面：走線+平面+場線
    g += `<rect x="150" y="40" width="60" height="10" fill="#f59e0b" stroke="${C}" stroke-width="1.2"/>` + T(180, 32, '訊號走線', { size: 8 });
    g += `<rect x="60" y="86" width="300" height="10" fill="#cbd5e1" stroke="${C}" stroke-width="1.2"/>` + T(70, 110, '參考平面（GND）', { size: 8, fill: MUT, anchor: 'start' });
    // 場線
    [160, 175, 190, 205].forEach(x => { g += PL(`${x},50 ${x - 4},68 ${x},86`, { color: ACC, w: 1, dash: '3 2' }); });
    g += T(258, 66, '能量在介質中的電磁場', { size: 8, fill: ACC, anchor: 'start' });
    // 回流集中
    g += `<rect x="150" y="86" width="60" height="10" fill="#93c5fd" opacity="0.7"/>`;
    g += T(180, 128, '回流電流集中在走線正下方（高頻走最小迴路，不是最短路徑）', { size: 8.5 });
    g += T(180, 146, '平面被切斷 → 回流繞遠 → 迴路面積暴增 = EMI 天線', { size: 8.5, fill: RED });
    return { d: '場觀點：訊號走介質、回流貼走線正下方', svg: W(420, 156, g) };
  };

  M['minima-schematic-review-conventions'] = () => {
    let g = '';
    g += T(105, 22, '❌ 難讀', { size: 9, fill: RED });
    g += `<rect x="40" y="32" width="130" height="86" fill="#fff" stroke="${RED}" stroke-width="1.2" stroke-dasharray="4 3"/>`;
    g += PL('50,60 100,60 100,44 80,44 80,90 140,90 140,50 120,50 120,108 60,108', { w: 1.1, color: MUT });
    g += T(105, 130, '線滿天飛、四向交叉、無流向', { size: 7.5, fill: MUT });
    g += T(310, 22, '✅ 好讀', { size: 9, fill: GRN });
    g += `<rect x="240" y="32" width="150" height="86" fill="#fff" stroke="${GRN}" stroke-width="1.2"/>`;
    g += F(260, 48, 'V3V3') + T(370, 44, '電源上、地下', { size: 7, fill: MUT });
    g += B(280, 70, 44, 24, 'IN', []) + A(302, 70, 330, 70) + B(352, 70, 44, 24, 'OUT', []);
    g += T(315, 100, '訊號左→右；net label 取代長線', { size: 7.5, fill: MUT });
    g += T(215, 150, '慣例：一頁一功能塊、關鍵參數標在旁、去耦畫在 IC 邊、reviewer 十分鐘能講完', { size: 8.5 });
    return { d: '電路圖衛生：流向/標籤/分頁慣例', svg: W(430, 160, g) };
  };

  M['minima-connector-shielding-faraday-cage'] = () => {
    let g = '';
    g += T(110, 22, '❌ pigtail 接地', { size: 9, fill: RED });
    g += `<rect x="40" y="40" width="80" height="50" rx="4" fill="#fff" stroke="${C}" stroke-width="1.6"/>` + T(80, 68, '連接器殼', { size: 8 });
    g += PL('120,65 150,65 150,96 170,96', { w: 1.4, color: RED });
    g += T(150, 110, '細長單點線＝電感＝高頻開路', { size: 7.5, fill: RED });
    g += T(320, 22, '✅ 360° 殼接機殼', { size: 9, fill: GRN });
    g += `<rect x="260" y="40" width="80" height="50" rx="4" fill="#fff" stroke="${C}" stroke-width="1.6"/>` + T(300, 68, '連接器殼', { size: 8 });
    g += `<rect x="338" y="36" width="10" height="58" fill="#cbd5e1" stroke="${C}" stroke-width="1.2"/>` + T(370, 66, '機殼', { size: 8, fill: MUT });
    g += T(300, 110, '全周低阻抗搭接 → 屏蔽連續', { size: 7.5, fill: GRN });
    g += T(215, 142, '法拉第籠要「連續」：縫隙/pigtail 就是天線出口，濾波做再好也漏', { size: 8.5 });
    return { d: '屏蔽搭接：360° vs pigtail', svg: W(430, 152, g) };
  };

  M['minima-stackup-via-stitching-review'] = () => {
    let g = '';
    const layers = [['L1 訊號', '#f59e0b'], ['L2 GND', '#94a3b8'], ['L3 訊號', '#f59e0b'], ['L4 電源', '#fca5a5'], ['L5 GND', '#94a3b8'], ['L6 訊號', '#f59e0b']];
    layers.forEach(([lbl, col], i) => {
      const y = 36 + i * 18;
      g += `<rect x="60" y="${y}" width="200" height="7" fill="${col}"/>` + T(46, y + 6, lbl, { size: 7.5, anchor: 'end' });
    });
    // 訊號 via L1→L3 + 伴隨地 via L2→L5
    g += L(140, 36, 140, 76, { w: 2.5, color: C }) + `<circle cx="140" cy="36" r="3.5" fill="${C}"/>` + `<circle cx="140" cy="76" r="3.5" fill="${C}"/>`;
    g += T(140, 26, '訊號換層 via', { size: 7.5 });
    g += L(158, 54, 158, 126, { w: 2, color: ACC }) + `<circle cx="158" cy="54" r="3" fill="${ACC}"/>` + `<circle cx="158" cy="126" r="3" fill="${ACC}"/>`;
    g += T(196, 96, '≤1.5mm 內放 stitching via', { size: 7.5, fill: ACC, anchor: 'start' });
    g += T(196, 108, '（回流跟著換層）', { size: 7.5, fill: ACC, anchor: 'start' });
    g += T(165, 158, '換層＝回流也要換參考層：沒 stitching via 回流繞遠、跨層腔體被激勵共振', { size: 8.5, fill: ORG });
    return { d: '六層疊層：換層 via＋回流 stitching', svg: W(430, 168, g) };
  };

  M['minima-connector-placement-cavity-resonance'] = () => {
    let g = '';
    g += T(105, 22, '❌ 兩側對放', { size: 9, fill: RED });
    g += `<rect x="40" y="34" width="130" height="70" fill="#fff" stroke="${C}" stroke-width="1.4"/>`;
    g += `<rect x="34" y="52" width="12" height="30" fill="#cbd5e1" stroke="${C}"/>` + `<rect x="164" y="52" width="12" height="30" fill="#cbd5e1" stroke="${C}"/>`;
    g += PL('52,70 70,56 88,84 106,56 124,84 142,56 158,70', { color: RED, w: 1.2, dash: '3 2' });
    g += T(105, 118, '線纜-板-線纜構成腔體 → 駐波共振', { size: 7.5, fill: RED });
    g += T(320, 22, '✅ 單側集中', { size: 9, fill: GRN });
    g += `<rect x="250" y="34" width="130" height="70" fill="#fff" stroke="${C}" stroke-width="1.4"/>`;
    [46, 66, 86].forEach(y => { g += `<rect x="244" y="${y - 6}" width="12" height="14" fill="#cbd5e1" stroke="${C}"/>`; });
    g += T(315, 118, '共用一個乾淨接地邊、迴路小', { size: 7.5, fill: GRN });
    g += T(215, 146, 'I/O 全放同一板邊＋該邊完整地：線纜間共模電位差最小，EMC 過關率大增', { size: 8.5 });
    return { d: '連接器擺位：單側集中 vs 兩側腔體', svg: W(430, 156, g) };
  };

  M['imx8-som-stackup-power-plane-pitfall'] = () => {
    let g = '';
    g += T(110, 20, '❌ 訊號參考電源層', { size: 9, fill: RED });
    g += `<rect x="50" y="30" width="140" height="7" fill="#f59e0b"/>` + T(200, 37, '訊號', { size: 7.5, anchor: 'start' });
    g += `<rect x="50" y="48" width="140" height="7" fill="#fca5a5"/>` + T(200, 55, '電源(切割多)', { size: 7.5, anchor: 'start' });
    g += PL('70,37 70,48 90,48 90,37', { color: RED, w: 1.2 });
    g += X(120, 52, 5) + T(120, 72, '跨切割、回流斷', { size: 7.5, fill: RED });
    g += T(110, 96, '❌ 回流要靠縫合電容跳層', { size: 8, fill: ORG });
    g += T(330, 20, '✅ 訊號參考完整 GND', { size: 9, fill: GRN });
    g += `<rect x="270" y="30" width="140" height="7" fill="#f59e0b"/>`;
    g += `<rect x="270" y="48" width="140" height="7" fill="#94a3b8"/>` + T(418, 55, 'GND 完整', { size: 7.5, anchor: 'start' });
    g += PL('290,37 290,48 310,48 310,37', { color: GRN, w: 1.2 });
    g += T(340, 72, '回流連續、路徑受控', { size: 7.5, fill: GRN });
    g += T(230, 122, '電源層通常被切成多塊島 → 當回流平面必踩切割；高速訊號永遠優先參考 GND', { size: 8.5 });
    return { d: '疊層陷阱：電源層當參考 vs 完整 GND', svg: W(460, 132, g) };
  };

  M['imx8-antenna-patterns-and-crossing-splits'] = () => {
    let g = '';
    g += T(105, 22, '孤島銅泊 = 天線', { size: 9, fill: RED });
    g += `<rect x="40" y="34" width="130" height="66" fill="#e2e8f0" stroke="${C}"/>`;
    g += `<polygon points="70,50 120,44 130,70 84,84" fill="#94a3b8" stroke="${RED}" stroke-width="1.4"/>`;
    g += T(100, 68, '浮空銅', { size: 7.5 });
    g += T(105, 114, '沒接地的銅耦合噪聲再輻射 → 刪掉或多點接地', { size: 7.5, fill: MUT });
    g += T(320, 22, '跨切割走線', { size: 9, fill: RED });
    g += `<rect x="250" y="34" width="130" height="66" fill="#e2e8f0" stroke="${C}"/>`;
    g += `<rect x="310" y="34" width="8" height="66" fill="#fff" stroke="${MUT}" stroke-width="1"/>`;
    g += L(262, 66, 372, 66, { w: 2, color: RED });
    g += PL('262,66 262,96 310,96 310,66', { color: ORG, w: 1.1, dash: '3 2' });
    g += T(316, 114, '回流繞切割一大圈（虛線）＝大迴路天線', { size: 7.5, fill: ORG });
    g += T(215, 142, 'Layout review 兩大必抓：浮銅/細長銅指、任何高速線跨 moat/切割', { size: 8.5 });
    return { d: '佈局反例：浮銅天線＋跨切割回流繞路', svg: W(430, 152, g) };
  };

  M['beginner-pcb-mistakes-schematic-hygiene'] = () => {
    let g = '';
    const rows = [
      ['四向交叉接點', '看不出接沒接 → 全改 T 形＋點', RED],
      ['去耦畫遠遠的', '佈局照抄就放遠 → 畫在 IC 腳邊', ORG],
      ['net 命名亂', 'SDA1/I2C_SDA 混用 → 統一命名表', ORG],
      ['電源符號混用', 'VCC/3V3/+3.3V 同軌不同名 → 一種', MUT],
      ['沒標關鍵參數', '公差/耐壓/額定不標 → review 抓不到', MUT]
    ];
    g += T(210, 22, '新手電路圖五大壞習慣 → 修法', { size: 9.5, weight: '600' });
    rows.forEach(([a, b, cc], i) => {
      const y = 44 + i * 26;
      g += `<circle cx="46" cy="${y}" r="3" fill="${cc}"/>`;
      g += T(58, y + 3, a, { size: 8.5, anchor: 'start', weight: '600' });
      g += T(180, y + 3, b, { size: 8, anchor: 'start', fill: MUT });
    });
    g += T(210, 182, '電路圖是給人讀的文件：畫得亂 = review 漏 bug = 板子改版', { size: 8.5, fill: ORG });
    return { d: '五大壞習慣對照修法', svg: W(430, 192, g) };
  };

  M['clock-tree-fanout'] = () => {
    const s = S();
    let g = '';
    g += B(52, 80, 68, 40, 'OSC/PLL', ['低抖動源']);
    g += A(86, 80, 116, 80);
    g += B(158, 80, 76, 56, 'Fanout Buffer', ['LVPECL/LVDS', '低加性抖動']);
    [[40, 'FPGA'], [80, 'ADC'], [120, 'SerDes']].forEach(([y, lbl]) => {
      g += L(196, 80, 212, 80) + L(212, y, 212, 80) + L(212, y, 236, y);
      g += s.resistor(254, y, { horizontal: true, label: '', value: '' });
      g += A(272, y, 292, y) + B(322, y, 56, 26, lbl, []);
    });
    g += T(254, 148, '端接照邏輯族：LVPECL 拉到 VCC−2V（戴維寧/交流耦合＋偏壓）', { size: 8, fill: MUT });
    g += T(210, 170, '樹狀等長分配；不共享 stub；每支獨立驅動 → 抖動不互相污染', { size: 8.5 });
    return { d: '時脈樹：低抖動源→fanout→各支端接', svg: W(430, 180, g) };
  };

  M['qfn-ep-thermal'] = () => {
    let g = '';
    // QFN 俯視
    g += `<rect x="60" y="40" width="90" height="90" rx="4" fill="#fff" stroke="${C}" stroke-width="1.6"/>`;
    for (let i = 0; i < 7; i++) { g += `<rect x="${68 + i * 11}" y="32" width="6" height="8" fill="#cbd5e1"/>`; g += `<rect x="${68 + i * 11}" y="130" width="6" height="8" fill="#cbd5e1"/>`; g += `<rect x="52" y="${48 + i * 11}" width="8" height="6" fill="#cbd5e1"/>`; g += `<rect x="150" y="${48 + i * 11}" width="8" height="6" fill="#cbd5e1"/>`; }
    g += `<rect x="78" y="58" width="54" height="54" fill="#fde68a" stroke="${C}" stroke-width="1.2"/>` + T(105, 78, 'EP', { size: 9 });
    // via 陣列
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) g += `<circle cx="${88 + c * 17}" cy="${68 + r * 17}" r="2.6" fill="none" stroke="${ACC}" stroke-width="1.4"/>`;
    g += T(105, 148, 'EP 鋪滿＋via 陣列（0.3mm、1~1.2mm 間距）直下內層 GND', { size: 8, fill: ACC });
    g += T(300, 50, '鋼網開窗「田字」', { size: 8.5, anchor: 'start' });
    g += T(300, 64, '60~80% 覆蓋：滿開', { size: 8, anchor: 'start', fill: MUT });
    g += T(300, 76, '錫過多 → 浮件/空洞', { size: 8, anchor: 'start', fill: ORG });
    g += T(300, 96, 'via 塞孔或小徑防吸錫', { size: 8, anchor: 'start', fill: MUT });
    g += T(300, 118, 'θJA 主要走 EP：', { size: 8.5, anchor: 'start' });
    g += T(300, 130, 'via 數×銅面積決定散熱', { size: 8, anchor: 'start', fill: MUT });
    return { d: 'QFN EP：via 陣列＋鋼網田字開窗', svg: W(430, 160, g) };
  };

  M['wqfn-hotrod-layout'] = () => {
    const s = S();
    let g = '';
    g += T(210, 20, 'Hot-Rod™/翻晶 QFN：功率迴路最小化', { size: 9.5, weight: '600' });
    // 輸入電容-上管-SW-下管 迴路
    g += F(70, 48, 'VIN');
    g += s.capacitor(70, 66, { horizontal: false }) + L(70, 80, 70, 92) + s.ground(70, 92, {});
    g += T(50, 62, 'Cin', { size: 8 });
    g += L(70, 44, 110, 44);
    g += `<rect x="110" y="34" width="70" height="60" rx="4" fill="#fff" stroke="${C}" stroke-width="1.6"/>` + T(145, 50, '翻晶 QFN', { size: 8 }) + T(145, 62, '無引線框', { size: 7.5, fill: MUT });
    g += L(180, 54, 214, 54) + T(200, 46, 'SW', { size: 8 });
    g += s.inductor(232, 54, { horizontal: true });
    g += L(256, 54, 286, 54) + s.junction(272, 54);
    g += s.capacitor(272, 72, { horizontal: false }) + L(272, 86, 272, 92) + s.ground(272, 92, {});
    g += A(286, 54, 306, 54) + T(312, 58, 'VOUT', { size: 8.5, anchor: 'start' });
    // 迴路標示
    g += PL('70,44 110,44 110,94 70,92', { color: RED, w: 1.6, dash: '4 3' });
    g += T(90, 108, '高 di/dt 迴路：面積越小 EMI 越低', { size: 8, fill: RED });
    g += T(210, 130, '翻晶封裝寄生電感 ~1nH 級（傳統引線 3~5 倍降）：Cin 貼 pin、同層短迴路', { size: 8.5 });
    g += T(210, 146, '代價：裸晶朝下散熱路徑改走 PCB → 佈銅/via 承擔 θJA', { size: 8.5, fill: MUT });
    return { d: '翻晶功率佈局：最小 di/dt 迴路', svg: W(430, 156, g) };
  };

  M['fmcw-radar-frontend'] = () => {
    let g = '';
    g += B(54, 50, 72, 40, 'Chirp 產生', ['PLL 掃頻']);
    g += A(90, 50, 118, 50);
    g += B(146, 50, 48, 32, 'PA', []);
    g += A(170, 50, 196, 50);
    g += T(206, 42, 'TX 天線', { size: 8 });
    g += L(206, 48, 206, 60) + L(199, 48, 213, 48);
    g += T(258, 34, '目標', { size: 8, fill: MUT });
    g += `<rect x="248" y="40" width="20" height="26" fill="#e2e8f0" stroke="${C}"/>`;
    g += A(214, 52, 246, 52, null, { color: ACC, w: 1 }) + A(246, 60, 214, 60, null, { color: ORG, w: 1 });
    g += T(288, 56, 'RX 天線', { size: 8 });
    g += L(288, 62, 288, 74) + L(281, 62, 295, 62);
    g += L(288, 74, 288, 88);
    g += B(288, 104, 48, 30, 'LNA', []);
    g += A(288, 119, 288, 132);
    g += `<circle cx="288" cy="146" r="12" fill="#fff" stroke="${C}" stroke-width="1.4"/>` + T(288, 150, '×', { size: 12 });
    g += A(70, 70, 70, 132) + L(70, 146, 274, 146) + T(160, 140, 'TX 耦合（本振）', { size: 7.5, fill: MUT });
    g += A(302, 146, 330, 146, 'IF 差頻');
    g += B(362, 146, 56, 36, 'ADC', ['→ LVDS']);
    g += T(210, 186, '差頻 fb ∝ 距離；chirp 斜率線性度決定距離精度；TX-RX 隔離不足 = 近距致盲', { size: 8.5 });
    return { d: 'FMCW 鏈：chirp→TX/RX→混頻差拍→ADC', svg: W(430, 196, g) };
  };

  M['aop-radar-layout'] = () => {
    let g = '';
    // 俯視：AoP 晶片＋淨空
    g += `<rect x="150" y="40" width="80" height="80" rx="6" fill="#fff" stroke="${C}" stroke-width="1.8"/>` + T(190, 76, 'AoP 雷達', { size: 9 }) + T(190, 90, '天線在封裝上', { size: 7.5, fill: MUT });
    g += `<rect x="126" y="20" width="128" height="118" rx="10" fill="none" stroke="${ORG}" stroke-width="1.4" stroke-dasharray="6 4"/>`;
    g += T(190, 30, '淨空區：無銅、無件、無走線', { size: 7.5, fill: ORG });
    // 波束方向
    [170, 190, 210].forEach(x => { g += A(x, 40, x, 16, null, { color: ACC, w: 1.1 }); });
    g += T(258, 22, '波束朝外，蓋殼材質/距離', { size: 8, anchor: 'start' });
    g += T(258, 34, '影響 pattern（radome 效應）', { size: 8, anchor: 'start', fill: MUT });
    g += T(258, 68, '晶片正下方完整地＋', { size: 8.5, anchor: 'start' });
    g += T(258, 82, '熱 via 陣列（毫米波', { size: 8, anchor: 'start', fill: MUT });
    g += T(258, 94, '功耗密度高）', { size: 8, anchor: 'start', fill: MUT });
    g += T(258, 116, '電源去耦貼腳；LO/IF', { size: 8, anchor: 'start', fill: MUT });
    g += T(258, 128, '走線遠離天線緣', { size: 8, anchor: 'start', fill: MUT });
    g += T(200, 158, 'AoP 免天線佈線（最難的部分封裝內做完）→ 板上只剩淨空/地/熱三件事', { size: 8.5 });
    return { d: 'AoP 佈局三要素：淨空、參考地、熱 via', svg: W(430, 168, g) };
  };

  M['large-bga-power-integrity'] = () => {
    let g = '';
    // 球陣列棋盤
    g += T(105, 22, 'BGA 底面（局部）', { size: 8.5 });
    for (let r = 0; r < 6; r++) for (let c = 0; c < 8; c++) {
      const x = 56 + c * 15, y = 34 + r * 15;
      const t = (r + c) % 3;
      g += `<circle cx="${x}" cy="${y}" r="5" fill="${t === 0 ? '#fca5a5' : t === 1 ? '#94a3b8' : '#fde68a'}" stroke="${C}" stroke-width="0.8"/>`;
    }
    g += T(60, 132, '🔴 電源', { size: 7.5, anchor: 'start' }) + T(110, 132, '⚫ 地', { size: 7.5, anchor: 'start' }) + T(150, 132, '🟡 訊號', { size: 7.5, anchor: 'start' });
    g += T(105, 148, '電源/地成對相鄰 → 迴路電感最小', { size: 8, fill: MUT });
    // 頻段去耦
    g += T(320, 22, 'PDN 分頻段去耦', { size: 8.5 });
    g += L(240, 108, 420, 108) + L(240, 108, 240, 34);
    g += PL('240,50 268,46 292,58 316,44 344,60 372,50 404,88', { color: ACC, w: 1.6 });
    g += L(240, 70, 420, 70, { color: RED, w: 1, dash: '4 3' }) + T(426, 74, '目標阻抗', { size: 7, anchor: 'end', fill: RED });
    g += T(262, 120, 'VRM', { size: 7, fill: MUT }) + T(306, 120, 'bulk', { size: 7, fill: MUT }) + T(348, 120, 'MLCC', { size: 7, fill: MUT }) + T(394, 120, '封裝/die', { size: 7, fill: MUT });
    g += T(230, 162, 'via-in-pad 縮短去耦迴路；每對電源球就近 MLCC；阻抗曲線整段壓在目標下', { size: 8.5 });
    return { d: 'BGA PI：球陣配對＋PDN 目標阻抗', svg: W(440, 172, g) };
  };

  M['jesd204-converter-clocking'] = () => {
    let g = '';
    g += B(60, 80, 84, 56, '時脈 IC', ['LMK 系', 'DCLK＋SYSREF', '成對輸出']);
    g += A(102, 62, 150, 50, 'DCLK（差分）') + A(102, 92, 150, 104, 'SYSREF');
    g += B(196, 50, 72, 32, 'ADC/DAC', []);
    g += A(102, 70, 240, 128, null, { color: MUT }) + A(102, 98, 246, 140, null, { color: MUT });
    g += B(288, 134, 76, 36, 'FPGA', ['收發器']);
    g += A(232, 54, 262, 120, '高速 lane（8b/10b→64b/66b）');
    g += T(310, 50, 'SYSREF 對齊：', { size: 8.5, anchor: 'start' });
    g += T(310, 64, '兩端同拍取樣', { size: 8, anchor: 'start', fill: MUT });
    g += T(310, 76, '→ 確定性延遲', { size: 8, anchor: 'start', fill: MUT });
    g += T(212, 190, 'SYSREF 相對 DCLK 的 setup/hold 是整鏈成敗：走線等長、同源分配', { size: 8.5, fill: ORG });
    g += T(212, 206, '多器件同步（相控陣/MIMO）靠同一顆時脈 IC 樹狀分發', { size: 8.5, fill: MUT });
    return { d: 'JESD204C 時脈：DCLK＋SYSREF 確定性延遲', svg: W(430, 216, g) };
  };

  M['dlp-dmd-display-interface'] = () => {
    let g = '';
    g += B(70, 70, 96, 64, 'DLPC 控制器', ['影像格式化', '時序產生']);
    g += A(118, 52, 168, 52, 'sub-LVDS 資料匯流排×N 對');
    g += A(118, 88, 168, 88, 'DMD 控制（載入/復位）');
    g += B(238, 70, 108, 72, 'DMD', ['微鏡陣列', '每鏡 ±12° 翻轉']);
    g += B(238, 158, 108, 40, '微鏡復位驅動', ['偏壓序列產生']);
    g += A(238, 138, 238, 106);
    g += T(360, 56, '對數不夠 = 頻寬不夠', { size: 8, anchor: 'start', fill: MUT });
    g += T(360, 70, '（解析度×灰階×幀率）', { size: 8, anchor: 'start', fill: MUT });
    g += T(360, 96, '控制器-DMD 綁定配對', { size: 8, anchor: 'start', fill: ORG });
    g += T(360, 110, '（型號/波形匹配）', { size: 8, anchor: 'start', fill: ORG });
    g += T(210, 220, 'sub-LVDS 等長差分；復位偏壓軌（如 ±26V 級）時序照規範，錯序傷微鏡', { size: 8.5 });
    return { d: 'DMD 介面：sub-LVDS 資料＋微鏡復位驅動', svg: W(440, 230, g) };
  };

  M['ethernet-phy-layout'] = () => {
    let g = '';
    g += B(52, 70, 64, 40, 'MAC/SoC', []);
    g += A(84, 60, 120, 60, 'RGMII（等長組）');
    g += A(120, 82, 84, 82, 'MDIO/MDC', { color: MUT });
    g += B(158, 70, 72, 48, 'PHY', ['RGMII 延遲', '內建/外配']);
    g += A(194, 70, 226, 70, 'MDI 差分×4 對');
    g += B(262, 70, 68, 48, '磁隔離', ['變壓器', 'Bob Smith']);
    g += A(296, 70, 324, 70);
    g += B(356, 70, 60, 44, 'RJ45', ['或整合磁']);
    g += T(210, 122, 'MDI 對內等長嚴格、對間放寬；差分 100Ω；磁前後地分割照廠商指南', { size: 8.5 });
    g += T(210, 138, 'RGMII 時脈 skew：靠 PHY 內部延遲或走線補；25MHz 晶振精度 ±50ppm', { size: 8.5, fill: MUT });
    return { d: '乙太網鏈：MAC→PHY→磁→RJ45', svg: W(430, 148, g) };
  };

  M['qspi-nor-flash'] = () => {
    const s = S();
    let g = '';
    g += B(64, 84, 80, 68, 'MCU/SoC', ['QSPI 控制器']);
    const sigs = [['CS#', 46], ['CLK（串聯 R）', 64], ['IO0/IO1', 82], ['IO2(WP#)', 100], ['IO3(HOLD#)', 118]];
    sigs.forEach(([lbl, y]) => { g += A(104, y, 196, y, lbl); });
    g += B(238, 84, 84, 76, 'W25Q NOR', ['開機韌體']);
    g += F(238, 30, '3.3V');
    g += L(238, 30, 238, 44);
    g += s.resistor(292, 40, { horizontal: false, label: '上拉×3', labelSide: 'right' });
    g += T(348, 60, 'CS#/WP#/HOLD# 上拉：', { size: 8, anchor: 'start' });
    g += T(348, 74, '未初始化時不可浮動', { size: 8, anchor: 'start', fill: ORG });
    g += T(348, 96, 'Quad 模式後 WP/HOLD', { size: 8, anchor: 'start', fill: MUT });
    g += T(348, 108, '變 IO2/IO3（上拉仍在）', { size: 8, anchor: 'start', fill: MUT });
    g += T(220, 182, '開機最怕「有時起不來」：CLK 振鈴（串 22~33Ω）、CS 時序、上拉缺一顆', { size: 8.5, fill: RED });
    return { d: 'QSPI NOR 開機電路：四線＋上拉＋串阻', svg: W(440, 192, g) };
  };

  window.CIRCUITS2 = M;
})();
