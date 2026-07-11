/**
 * knowledge-i18n-detail2.js — 知識卡詳情欄位 i18n（第 2 檔，續 knowledge-i18n-detail.js）
 * 深合併進 window.KNOWLEDGE_I18N[id][lang]（principles/keyFormulas/designNotes/commonMistakes）。
 * 載入序：knowledge-i18n.js → knowledge-i18n-detail.js → 本檔。批次填充通用 75 + 影片 8 + 特殊 4 = 87 卡詳情。
 * 批1（2026-07-11）：level-shift/ldo-regulator/buck-converter/i2c-communication/buck-converter-advanced/
 *                    ldo-noise/impedance-matching/pdn-design/pcb 疊層/pcb 走線（基礎 10 卡）。
 */
(function () {
  var DETAIL = {
    'level-shift': {
      en: {
        principles: 'When domain A is 3.3V and domain B is 5V, connecting them directly can let current flow from the high-voltage domain into the low-voltage one and cause damage. A level-shift circuit uses a MOSFET or a dedicated IC to translate the voltage bidirectionally.',
        keyFormulas: ['BSS138 bidirectional: each side is pulled up through Rp to its own voltage domain (VCC_L / VCC_H)', 'I_d = k(V_gs - V_th)^2 (saturation region, square law)'],
        designNotes: ['Pick a suitable MOSFET (low Vth, low Rds_on)', 'Watch propagation delay; high-speed signals need a fast MOSFET', 'Consider the maximum data rate and choose adequate drive strength', 'Add pull-up resistors to ensure signal integrity'],
        commonMistakes: ['Forgetting the pull-up resistors', 'Ignoring parasitic capacitance', 'Not accounting for temperature effects on MOSFET parameters', 'Choosing the wrong MOSFET type']
      },
      ja: {
        principles: 'A ドメインが 3.3V、B ドメインが 5V のとき、直結すると高電圧ドメインから低電圧ドメインへ電流が流れ込み破損する恐れがある。レベルシフト回路は MOSFET または専用 IC で双方向の電圧変換を行う。',
        keyFormulas: ['BSS138 双方向：両側をそれぞれ Rp で自ドメイン（VCC_L / VCC_H）へプルアップ', 'I_d = k(V_gs - V_th)^2（飽和領域、二乗則）'],
        designNotes: ['適切な MOSFET を選ぶ（低 Vth、低 Rds_on）', '伝搬遅延に注意、高速信号には高速 MOSFET を選ぶ', '最大データレートを考慮し適切な駆動能力を選ぶ', 'プルアップ抵抗を付け信号品質を確保'],
        commonMistakes: ['プルアップ抵抗を付け忘れる', '寄生容量の影響を無視', '温度が MOSFET パラメータに与える影響を考慮しない', '不適切な MOSFET タイプを選ぶ']
      },
      ko: {
        principles: 'A 도메인이 3.3V, B 도메인이 5V일 때 직결하면 고전압 도메인에서 저전압 도메인으로 전류가 흘러 들어가 손상될 수 있다. 레벨 시프트 회로는 MOSFET이나 전용 IC로 양방향 전압 변환을 수행한다.',
        keyFormulas: ['BSS138 양방향: 양측을 각각 Rp로 자기 전압 도메인(VCC_L / VCC_H)에 풀업', 'I_d = k(V_gs - V_th)^2 (포화 영역, 제곱 법칙)'],
        designNotes: ['적합한 MOSFET 선택(낮은 Vth, 낮은 Rds_on)', '전파 지연 주의, 고속 신호는 빠른 MOSFET 선택', '최대 데이터율 고려해 적절한 구동 능력 선택', '풀업 저항을 추가해 신호 무결성 확보'],
        commonMistakes: ['풀업 저항을 빠뜨림', '기생 커패시턴스 영향 무시', '온도가 MOSFET 파라미터에 주는 영향 미고려', '부적합한 MOSFET 타입 선택']
      }
    },
    'ldo-regulator': {
      en: {
        principles: 'An LDO uses a linear pass element (usually a MOSFET) to regulate the output voltage. As the input voltage or load current changes, the LDO automatically adjusts its internal resistance to keep the output steady.',
        keyFormulas: ['Vout = Vref * (1 + R1/R2)', 'Dropout Voltage = Vin - Vout', 'Power Efficiency = Vout/Vin * 100%'],
        designNotes: ['Choose a suitable output capacitor (ESR must meet the spec)', 'Mind thermals; at high current account for thermal resistance', 'Keep enough input-output headroom (greater than the dropout voltage)', 'Consider the load transient response'],
        commonMistakes: ['Output capacitor ESR out of spec', 'Insufficient heat sinking triggers thermal shutdown', 'Input voltage too low to regulate', 'Not accounting for load current variation']
      },
      ja: {
        principles: 'LDO は線形パス素子（通常 MOSFET）で出力電圧を安定化する。入力電圧や負荷電流が変わると、LDO は内部抵抗を自動調整して出力を一定に保つ。',
        keyFormulas: ['Vout = Vref * (1 + R1/R2)', 'ドロップアウト電圧 = Vin - Vout', '電力効率 = Vout/Vin * 100%'],
        designNotes: ['適切な出力コンデンサを選ぶ（ESR が規格内）', '放熱に注意、大電流時は熱抵抗を考慮', '入出力の余裕を確保（ドロップアウト電圧より大きく）', '負荷過渡応答を考慮'],
        commonMistakes: ['出力コンデンサの ESR が規格外', '放熱不足で熱シャットダウン', '入力電圧が低すぎて安定化できない', '負荷電流の変動を考慮しない']
      },
      ko: {
        principles: 'LDO는 선형 패스 소자(보통 MOSFET)로 출력 전압을 안정화한다. 입력 전압이나 부하 전류가 변하면 LDO가 내부 저항을 자동 조정해 출력을 일정하게 유지한다.',
        keyFormulas: ['Vout = Vref * (1 + R1/R2)', '드롭아웃 전압 = Vin - Vout', '전력 효율 = Vout/Vin * 100%'],
        designNotes: ['적합한 출력 커패시터 선택(ESR이 규격 충족)', '방열 주의, 대전류 시 열저항 고려', '입출력 헤드룸 확보(드롭아웃 전압보다 크게)', '부하 과도 응답 고려'],
        commonMistakes: ['출력 커패시터 ESR 규격 미달', '방열 부족으로 열 셧다운', '입력 전압이 너무 낮아 안정화 불가', '부하 전류 변동 미고려']
      }
    },
    'buck-converter': {
      en: {
        principles: 'A buck converter uses a switching element (MOSFET), an inductor and a capacitor for efficient voltage conversion, controlling the output by adjusting the switch duty cycle.',
        keyFormulas: ['Vout = Vin * D', 'D = Ton / (Ton + Toff)', 'ΔIL = (Vin - Vout) * D / (f * L) (inductor ripple current)', 'Efficiency = Pout / Pin * 100%'],
        designNotes: ['EN enable pin: tying it to VIN in the figure means always-on. EN must not float (false triggering); for always-on pull it to VIN (directly if EN rating allows, otherwise through a divider that also sets the UVLO threshold); for sequencing/power saving, drive it from the MCU.', 'FB feedback pin must be connected: the IC senses Vout via FB to regulate the duty cycle; floating loses control. A fixed-output IC ties FB to Vout; an adjustable IC connects FB to Vout through an R1/R2 divider.', 'Choose a suitable switching frequency (trade off efficiency vs component size)', 'Make the inductor large enough to stay in continuous conduction (CCM)', 'Use a low-ESR output capacitor', 'Mind PCB layout to reduce switching noise'],
        commonMistakes: ['Wrong inductor value causing excessive ripple', 'Poor PCB layout causing EMI problems', 'Not considering light-load efficiency', 'Output capacitor ESR too high']
      },
      ja: {
        principles: 'Buck コンバータはスイッチ素子（MOSFET）、インダクタ、コンデンサで効率的に電圧変換し、スイッチのデューティ比を調整して出力を制御する。',
        keyFormulas: ['Vout = Vin * D', 'D = Ton / (Ton + Toff)', 'ΔIL = (Vin - Vout) * D / (f * L)（インダクタリップル電流）', '効率 = Pout / Pin * 100%'],
        designNotes: ['EN 有効ピン：図で VIN 接続は「常時オン」。EN はフロート不可（誤トリガ）、常時オンなら VIN へ（EN 耐圧が十分なら直結、不足なら分圧で接続し UVLO しきい値も設定）、順序制御/省電力なら MCU で制御。', 'FB 帰還ピンは必ず接続：IC は FB で Vout を検出しデューティを調整、フロートは制御不能。固定出力 IC は FB を Vout に直結、可変 IC は R1/R2 分圧で Vout に接続。', '適切なスイッチング周波数を選ぶ（効率と部品サイズのトレードオフ）', 'インダクタ値を十分大きくし連続導通（CCM）を維持', '低 ESR の出力コンデンサを使う', 'PCB レイアウトに注意しスイッチング雑音を低減'],
        commonMistakes: ['インダクタ値が不適切でリップル過大', 'PCB レイアウト不良で EMI 問題', '軽負荷効率を考慮しない', '出力コンデンサの ESR が高すぎる']
      },
      ko: {
        principles: 'Buck 컨버터는 스위치 소자(MOSFET), 인덕터, 커패시터로 효율적으로 전압을 변환하며, 스위치 듀티비를 조정해 출력을 제어한다.',
        keyFormulas: ['Vout = Vin * D', 'D = Ton / (Ton + Toff)', 'ΔIL = (Vin - Vout) * D / (f * L) (인덕터 리플 전류)', '효율 = Pout / Pin * 100%'],
        designNotes: ['EN 인에이블 핀: 그림에서 VIN 연결은 "상시 온". EN은 플로팅 불가(오트리거), 상시 온이면 VIN으로(EN 내압이 충분하면 직결, 부족하면 분압으로 연결하며 UVLO 문턱도 설정), 시퀀싱/절전이면 MCU로 제어.', 'FB 피드백 핀은 반드시 연결: IC는 FB로 Vout을 감지해 듀티를 조정, 플로팅은 제어 불능. 고정 출력 IC는 FB를 Vout에 직결, 가변 IC는 R1/R2 분압으로 Vout에 연결.', '적절한 스위칭 주파수 선택(효율과 부품 크기 절충)', '인덕터 값을 충분히 크게 해 연속 도통(CCM) 유지', '저 ESR 출력 커패시터 사용', 'PCB 레이아웃에 유의해 스위칭 잡음 저감'],
        commonMistakes: ['인덕터 값 부적절로 리플 과다', 'PCB 레이아웃 불량으로 EMI 문제', '경부하 효율 미고려', '출력 커패시터 ESR 과다']
      }
    },
    'i2c-communication': {
      en: {
        principles: 'I2C communicates over two lines (SDA data, SCL clock). It supports a multi-master, multi-slave architecture where each slave has a unique 7-bit or 10-bit address.',
        keyFormulas: ['Clock frequency: 100kHz (Standard), 400kHz (Fast), 1MHz (Fast Plus)', 'Rp(min) = (VCC - Vol)/Iol (Vol=0.4V, Iol=3mA); Rp(max) ≈ tr/(0.847*Cbus)', 'Bus capacitance: max 400pF'],
        designNotes: ['SDA and SCL need pull-up resistors (typically 2.2kΩ to 10kΩ)', 'Mind the bus-capacitance limit; overly long buses degrade signal quality', 'Different voltage domains need a level shift', 'Handle address conflicts carefully'],
        commonMistakes: ['Forgetting the pull-up resistors', 'Wrong pull-up resistor value', 'Ignoring the bus-capacitance limit', 'Unresolved address conflicts']
      },
      ja: {
        principles: 'I2C は 2 本の線（SDA データ、SCL クロック）で通信する。マルチマスタ・マルチスレーブ構成に対応し、各スレーブは固有の 7-bit または 10-bit アドレスを持つ。',
        keyFormulas: ['クロック周波数：100kHz（標準）、400kHz（Fast）、1MHz（Fast Plus）', 'Rp(min) = (VCC - Vol)/Iol（Vol=0.4V, Iol=3mA）；Rp(max) ≈ tr/(0.847*Cbus)', 'バス容量：最大 400pF'],
        designNotes: ['SDA と SCL にプルアップ抵抗が必要（通常 2.2kΩ ～ 10kΩ）', 'バス容量の制限に注意、長すぎると信号品質が低下', '異なる電圧ドメインにはレベルシフトが必要', 'アドレス衝突を慎重に扱う'],
        commonMistakes: ['プルアップ抵抗を付け忘れる', 'プルアップ抵抗値が不適切', 'バス容量の制限を無視', 'アドレス衝突を未処理']
      },
      ko: {
        principles: 'I2C는 두 선(SDA 데이터, SCL 클록)으로 통신한다. 멀티 마스터·멀티 슬레이브 구조를 지원하며 각 슬레이브는 고유한 7-bit 또는 10-bit 주소를 가진다.',
        keyFormulas: ['클록 주파수: 100kHz(표준), 400kHz(Fast), 1MHz(Fast Plus)', 'Rp(min) = (VCC - Vol)/Iol (Vol=0.4V, Iol=3mA); Rp(max) ≈ tr/(0.847*Cbus)', '버스 커패시턴스: 최대 400pF'],
        designNotes: ['SDA와 SCL에 풀업 저항 필요(보통 2.2kΩ ~ 10kΩ)', '버스 커패시턴스 제한 주의, 너무 길면 신호 품질 저하', '다른 전압 도메인은 레벨 시프트 필요', '주소 충돌을 신중히 처리'],
        commonMistakes: ['풀업 저항을 빠뜨림', '풀업 저항 값 부적절', '버스 커패시턴스 제한 무시', '주소 충돌 미처리']
      }
    },
    'buck-converter-advanced': {
      en: {
        principles: 'A buck converter switches a MOSFET at high speed, working with an inductor and capacitor for efficient voltage conversion. Advanced design must consider current-mode control, minimizing the hot-loop area, and EMI filter design.',
        keyFormulas: ['D = Vout / Vin (CCM)', 'IL_peak = IL_avg + ΔIL/2', 'ΔIL = (Vin - Vout) * D / (f * L)', 'RMS_current = IL_avg * √(1 + (ΔIL/IL_avg)^2/12)'],
        designNotes: ['EN enable pin: tied to VIN in the figure = always-on. Must not float; for always-on tie to VIN (or through a divider that also sets UVLO); drive from the MCU when control is needed.', 'FB feedback pin must be connected: the IC closes the loop through FB; a fixed output ties FB to Vout, an adjustable output connects FB to Vout via an R1/R2 divider; floating cannot regulate.', 'Current-sense resistor choice: typically 10mΩ to 50mΩ', 'Minimize the hot-loop area: keep the high-frequency current loop small', 'Place the input capacitor close to the IC to reduce parasitic inductance', 'Keep the SW node trace short to reduce EMI radiation', 'The inductor saturation current must exceed the peak current by 1.3x or more'],
        commonMistakes: ['Current-sense resistor too large, lowering efficiency', 'Hot-loop area too large, exceeding EMI limits', 'Input capacitor far from the IC, making the input voltage unstable', 'Wrong inductor choice pushing the converter into DCM', 'Not optimizing light-load efficiency']
      },
      ja: {
        principles: 'Buck コンバータは MOSFET を高速スイッチングし、インダクタとコンデンサで効率的に電圧変換する。高度な設計では電流モード制御、ホットループ面積の最小化、EMI フィルタ設計を考慮する。',
        keyFormulas: ['D = Vout / Vin (CCM)', 'IL_peak = IL_avg + ΔIL/2', 'ΔIL = (Vin - Vout) * D / (f * L)', 'RMS_current = IL_avg * √(1 + (ΔIL/IL_avg)^2/12)'],
        designNotes: ['EN 有効ピン：図で VIN 接続＝常時オン。フロート不可、常時オンは VIN へ（または分圧で UVLO も設定）、制御が必要なら MCU で駆動。', 'FB 帰還ピンは必ず接続：IC は FB で閉ループ、固定出力は FB を Vout に、可変出力は R1/R2 分圧で Vout に接続、フロートは安定化不能。', '電流センス抵抗の選択：通常 10mΩ ～ 50mΩ', 'ホットループ面積を最小化：高周波電流ループを小さく', '入力コンデンサを IC の近くに置き寄生インダクタンスを低減', 'SW ノード配線を短くし EMI 放射を低減', 'インダクタの飽和電流はピーク電流の 1.3 倍以上'],
        commonMistakes: ['電流センス抵抗が大きすぎ効率低下', 'ホットループ面積が大きすぎ EMI 超過', '入力コンデンサが IC から遠く入力電圧が不安定', 'インダクタ選択が不適切で DCM に入る', '軽負荷効率を最適化しない']
      },
      ko: {
        principles: 'Buck 컨버터는 MOSFET을 고속으로 스위칭하고 인덕터·커패시터와 함께 효율적으로 전압을 변환한다. 고급 설계는 전류 모드 제어, 핫루프 면적 최소화, EMI 필터 설계를 고려해야 한다.',
        keyFormulas: ['D = Vout / Vin (CCM)', 'IL_peak = IL_avg + ΔIL/2', 'ΔIL = (Vin - Vout) * D / (f * L)', 'RMS_current = IL_avg * √(1 + (ΔIL/IL_avg)^2/12)'],
        designNotes: ['EN 인에이블 핀: 그림에서 VIN 연결=상시 온. 플로팅 불가, 상시 온은 VIN으로(또는 분압으로 UVLO도 설정), 제어가 필요하면 MCU로 구동.', 'FB 피드백 핀은 반드시 연결: IC는 FB로 폐루프, 고정 출력은 FB를 Vout에, 가변 출력은 R1/R2 분압으로 Vout에 연결, 플로팅은 안정화 불가.', '전류 센스 저항 선택: 보통 10mΩ ~ 50mΩ', '핫루프 면적 최소화: 고주파 전류 루프를 작게', '입력 커패시터를 IC 가까이 배치해 기생 인덕턴스 저감', 'SW 노드 배선을 짧게 해 EMI 방사 저감', '인덕터 포화 전류는 피크 전류의 1.3배 이상'],
        commonMistakes: ['전류 센스 저항이 너무 커 효율 저하', '핫루프 면적이 너무 커 EMI 초과', '입력 커패시터가 IC에서 멀어 입력 전압 불안정', '인덕터 선택 부적절로 DCM 진입', '경부하 효율 미최적화']
      }
    },
    'ldo-noise': {
      en: {
        principles: 'LDO noise comes mainly from the reference, the error amplifier and insufficient PSRR. A low-noise LDO reduces output noise with a low-noise reference, a high-gain error amplifier and good power-supply rejection.',
        keyFormulas: ['Output Noise = √(vn^2 + (dn * Vin)^2)', 'PSRR = 20*log(Vin_ripple/Vout_ripple)', 'Dropout Voltage = Vin - Vout', 'Thermal Resistance (θJA) = (Tj - Ta) / Pd'],
        designNotes: ['EN enable pin: switches the LDO output. For always-on tie it to VIN (as in the figure); do not float it (false triggering); for power saving/sequencing drive it from the MCU. The NR pin takes a bypass capacitor (Cnr) to filter reference noise.', 'Choose an ultra-low-noise LDO (e.g. TPS7A47)', 'Use low-ESR input and output capacitors', 'Avoid ceramic capacitors on some LDOs (they can be unstable)', 'Thermal design: mind thermal resistance at high current', 'PSRR drops at high frequency; add external filtering'],
        commonMistakes: ['Using high-ESR capacitors, increasing noise', "Not accounting for the LDO's stability compensation", 'Insufficient heat sinking causing thermal shutdown', 'Input voltage too low to regulate', 'Ignoring the load transient response']
      },
      ja: {
        principles: 'LDO の雑音は主に基準電圧源、誤差増幅器、PSRR 不足に由来する。低雑音 LDO は低雑音基準源、高利得誤差増幅器、良好な電源除去比で出力雑音を下げる。',
        keyFormulas: ['出力雑音 = √(vn^2 + (dn * Vin)^2)', 'PSRR = 20*log(Vin_ripple/Vout_ripple)', 'ドロップアウト電圧 = Vin - Vout', '熱抵抗 (θJA) = (Tj - Ta) / Pd'],
        designNotes: ['EN 有効ピン：LDO 出力を切り替える。常時オンは VIN へ（本図の通り）、フロート不可（誤トリガ）、省電力/順序制御は MCU で。NR ピンにはバイパスコンデンサ（Cnr）で基準雑音をろ波。', '超低雑音 LDO を選ぶ（TPS7A47 等）', '入出力コンデンサは低 ESR タイプ', '一部の LDO ではセラミックコンデンサを避ける（不安定になりうる）', '放熱設計：大電流時は熱抵抗に注意', 'PSRR は高周波で低下、外部ろ波が必要'],
        commonMistakes: ['高 ESR コンデンサ使用で雑音増加', 'LDO の安定性補償を考慮しない', '放熱不足で熱シャットダウン', '入力電圧が低すぎて安定化できない', '負荷過渡応答を無視']
      },
      ko: {
        principles: 'LDO 잡음은 주로 기준 전압원, 오차 증폭기, PSRR 부족에서 온다. 저잡음 LDO는 저잡음 기준원, 고이득 오차 증폭기, 우수한 전원 제거비로 출력 잡음을 낮춘다.',
        keyFormulas: ['출력 잡음 = √(vn^2 + (dn * Vin)^2)', 'PSRR = 20*log(Vin_ripple/Vout_ripple)', '드롭아웃 전압 = Vin - Vout', '열저항 (θJA) = (Tj - Ta) / Pd'],
        designNotes: ['EN 인에이블 핀: LDO 출력을 스위칭. 상시 온은 VIN으로(본 그림대로), 플로팅 불가(오트리거), 절전/시퀀싱은 MCU로. NR 핀에는 바이패스 커패시터(Cnr)로 기준 잡음 여파.', '초저잡음 LDO 선택(TPS7A47 등)', '입출력 커패시터는 저 ESR 타입', '일부 LDO에서 세라믹 커패시터 회피(불안정 가능)', '방열 설계: 대전류 시 열저항 주의', 'PSRR은 고주파에서 하락, 외부 여파 필요'],
        commonMistakes: ['고 ESR 커패시터 사용으로 잡음 증가', 'LDO의 안정성 보상 미고려', '방열 부족으로 열 셧다운', '입력 전압이 너무 낮아 안정화 불가', '부하 과도 응답 무시']
      }
    },
    'impedance-matching': {
      en: {
        principles: 'As a signal travels down a transmission line, an impedance discontinuity causes reflections. Impedance matching minimizes reflections by keeping the source, line and load impedances equal. Common schemes include series, parallel and AC matching.',
        keyFormulas: ['Z0 = √(L/C) (transmission-line characteristic impedance)', 'Reflection coefficient Γ = (ZL - Z0) / (ZL + Z0)', 'RS = Z0 - ZS (series matching resistor)', 'RP = Z0 (parallel matching resistor)'],
        designNotes: ['Microstrip impedance: Z0 = 87/√(Dk+1.41) * ln(5.98*h/(0.8*w+t))', 'Stripline impedance: Z0 = 60/√Dk * ln(4*b/(0.67*(0.8*w+t)))', 'Differential impedance: Zdiff = 2*Z0*(1 - 0.48*exp(-0.96*s/h))', 'Impedance tolerance is usually ±10%', 'The fiber-weave effect causes impedance variation and must be considered'],
        commonMistakes: ['Not matching impedance, causing reflections', 'Matching resistor in the wrong place', 'Ignoring transmission-line effects (electrical length > λ/6)', 'Ignoring return-path discontinuities', 'Not controlling differential-pair skew']
      },
      ja: {
        principles: '信号が伝送線を伝わるとき、インピーダンスの不連続があると反射が生じる。インピーダンス整合は、源・伝送線・負荷のインピーダンスを一致させて反射を最小化する。代表的な方式に直列整合、並列整合、AC 整合などがある。',
        keyFormulas: ['Z0 = √(L/C)（伝送線の特性インピーダンス）', '反射係数 Γ = (ZL - Z0) / (ZL + Z0)', 'RS = Z0 - ZS（直列整合抵抗）', 'RP = Z0（並列整合抵抗）'],
        designNotes: ['マイクロストリップインピーダンス：Z0 = 87/√(Dk+1.41) * ln(5.98*h/(0.8*w+t))', 'ストリップラインインピーダンス：Z0 = 60/√Dk * ln(4*b/(0.67*(0.8*w+t)))', '差動インピーダンス：Zdiff = 2*Z0*(1 - 0.48*exp(-0.96*s/h))', 'インピーダンス公差は通常 ±10%', 'グラスウィーブ（ガラス繊維）効果でインピーダンスが変動、要考慮'],
        commonMistakes: ['インピーダンス整合を考慮せず反射', '整合抵抗の位置が不正確', '伝送線効果を無視（電気長 > λ/6）', 'リターン経路の不連続を無視', '差動ペアのスキューを制御しない']
      },
      ko: {
        principles: '신호가 전송선을 따라 전파될 때 임피던스 불연속이 있으면 반사가 생긴다. 임피던스 정합은 소스·전송선·부하 임피던스를 일치시켜 반사를 최소화한다. 대표적 방식으로 직렬 정합, 병렬 정합, AC 정합 등이 있다.',
        keyFormulas: ['Z0 = √(L/C) (전송선 특성 임피던스)', '반사 계수 Γ = (ZL - Z0) / (ZL + Z0)', 'RS = Z0 - ZS (직렬 정합 저항)', 'RP = Z0 (병렬 정합 저항)'],
        designNotes: ['마이크로스트립 임피던스: Z0 = 87/√(Dk+1.41) * ln(5.98*h/(0.8*w+t))', '스트립라인 임피던스: Z0 = 60/√Dk * ln(4*b/(0.67*(0.8*w+t)))', '차동 임피던스: Zdiff = 2*Z0*(1 - 0.48*exp(-0.96*s/h))', '임피던스 공차는 보통 ±10%', '글래스 위브(유리섬유) 효과로 임피던스 변동, 고려 필요'],
        commonMistakes: ['임피던스 정합 미고려로 반사', '정합 저항 위치 부정확', '전송선 효과 무시(전기적 길이 > λ/6)', '리턴 경로 불연속 무시', '차동 쌍 스큐 미제어']
      }
    },
    'pdn-design': {
      en: {
        principles: 'The PDN (power distribution network) carries power from the regulator to every IC power pin. A good PDN keeps the supply impedance below the target impedance across all frequencies to hold the voltage steady.',
        keyFormulas: ['Z_target = ΔV / I_transient', 'C = I * Δt / ΔV', 'ESL_effective = ESL / N (parallel capacitors)', 'Resonant frequency = 1 / (2π√(L*C))'],
        designNotes: ['Target-impedance calc: Ztarget = Vripple_allowed / I_transient', 'Capacitor selection: large caps for low frequency, small caps for high frequency', 'Placement: close to the IC power pins', 'Via design: minimize parasitic inductance', 'Plane design: complete power/ground planes'],
        commonMistakes: ['Not calculating the target impedance', 'Wrong capacitor choice (ESR/ESL mismatch)', 'Capacitors placed too far from the IC', 'Too few vias, raising high-frequency impedance', 'Incomplete power plane causing impedance discontinuity']
      },
      ja: {
        principles: 'PDN（電源分配網）はレギュレータから各 IC の電源ピンへ電力を分配する。良い PDN は全周波数域で電源インピーダンスを目標インピーダンス以下に保ち電圧を安定させる。',
        keyFormulas: ['Z_target = ΔV / I_transient', 'C = I * Δt / ΔV', 'ESL_effective = ESL / N（並列コンデンサ）', '共振周波数 = 1 / (2π√(L*C))'],
        designNotes: ['目標インピーダンス計算：Ztarget = Vripple_allowed / I_transient', 'コンデンサ選択：大容量は低域、小容量は高域', '配置：IC 電源ピンの近くに', 'ビア設計：寄生インダクタンスを最小化', 'プレーン設計：完全な電源/グランドプレーン'],
        commonMistakes: ['目標インピーダンスを計算しない', 'コンデンサ選択が不適切（ESR/ESL 不整合）', 'コンデンサを IC から遠くに配置', 'ビア数不足で高周波インピーダンスが高い', '電源プレーン不完全でインピーダンス不連続']
      },
      ko: {
        principles: 'PDN(전원 분배망)은 레귤레이터에서 각 IC 전원 핀으로 전력을 분배한다. 좋은 PDN은 전 주파수 대역에서 전원 임피던스를 목표 임피던스 이하로 유지해 전압을 안정시킨다.',
        keyFormulas: ['Z_target = ΔV / I_transient', 'C = I * Δt / ΔV', 'ESL_effective = ESL / N (병렬 커패시터)', '공진 주파수 = 1 / (2π√(L*C))'],
        designNotes: ['목표 임피던스 계산: Ztarget = Vripple_allowed / I_transient', '커패시터 선택: 대용량은 저역, 소용량은 고역', '배치: IC 전원 핀 가까이', '비아 설계: 기생 인덕턴스 최소화', '플레인 설계: 완전한 전원/접지 플레인'],
        commonMistakes: ['목표 임피던스 미계산', '커패시터 선택 부적절(ESR/ESL 불일치)', '커패시터를 IC에서 너무 멀리 배치', '비아 수 부족으로 고주파 임피던스 과다', '전원 플레인 불완전으로 임피던스 불연속']
      }
    },
    'pcb叠层设计': {
      en: {
        principles: 'PCB stackup design is the foundation of high-speed design. A good stackup provides complete reference planes, controlled impedance and reduced EMI. Common stackups include 4-layer and 6-layer boards.',
        keyFormulas: ['Impedance control: Z0 = 87/√(Dk+1.41) * ln(5.98*h/(0.8*w+t))', 'Crosstalk reduction: spacing ≥ 3W (the 3W rule)', 'Transmission-line delay (microstrip): Tpd ≈ 85*√(0.475*Dk + 0.67) ps/inch (FR4 ~140-180 ps/inch)'],
        designNotes: ['Power and ground planes appear in pairs', 'High-speed signal layers are adjacent to a ground plane', 'Signal layers are isolated by a ground plane between them', 'Outer-layer traces shorter, inner-layer longer', 'Consider impedance-control requirements', 'Balance the stackup to reduce warpage'],
        commonMistakes: ['Not considering impedance control', 'Incomplete reference plane', 'Signal layer too far from its reference plane', 'Ignoring the return path', 'Unbalanced stackup causing warpage']
      },
      ja: {
        principles: 'PCB 積層（スタックアップ）設計は高速回路設計の基礎。良い積層構造は完全な基準面、制御インピーダンス、EMI 低減を提供する。代表的な構造に 4 層板と 6 層板がある。',
        keyFormulas: ['インピーダンス制御：Z0 = 87/√(Dk+1.41) * ln(5.98*h/(0.8*w+t))', 'クロストーク低減：間隔 ≥ 3W（3W 則）', '伝送線遅延（マイクロストリップ）：Tpd ≈ 85*√(0.475*Dk + 0.67) ps/inch（FR4 約 140～180 ps/inch）'],
        designNotes: ['電源層とグランド層はペアで配置', '高速信号層はグランド層に隣接', '信号層間はグランド層で分離', '外層配線は短く、内層は長め', 'インピーダンス制御の要件を考慮', '積層を対称にして反りを低減'],
        commonMistakes: ['インピーダンス制御を考慮しない', '基準面が不完全', '信号層と基準面の距離が大きすぎる', 'リターン経路を考慮しない', '積層が非対称で反りが生じる']
      },
      ko: {
        principles: 'PCB 적층(스택업) 설계는 고속 회로 설계의 기초다. 좋은 적층 구조는 완전한 기준면, 제어 임피던스, EMI 저감을 제공한다. 대표적 구조로 4층 보드와 6층 보드가 있다.',
        keyFormulas: ['임피던스 제어: Z0 = 87/√(Dk+1.41) * ln(5.98*h/(0.8*w+t))', '크로스토크 저감: 간격 ≥ 3W (3W 법칙)', '전송선 지연(마이크로스트립): Tpd ≈ 85*√(0.475*Dk + 0.67) ps/inch (FR4 약 140~180 ps/inch)'],
        designNotes: ['전원층과 접지층은 쌍으로 배치', '고속 신호층은 접지층에 인접', '신호층 사이는 접지층으로 분리', '외층 배선은 짧게, 내층은 길게', '임피던스 제어 요건 고려', '적층을 대칭으로 해 휨 저감'],
        commonMistakes: ['임피던스 제어 미고려', '기준면 불완전', '신호층과 기준면 거리 과다', '리턴 경로 미고려', '적층 비대칭으로 휨 발생']
      }
    },
    'pcb走线规则': {
      en: {
        principles: 'PCB routing must consider impedance control, crosstalk, length matching and EMI. Correct routing rules ensure signal quality and electromagnetic compatibility.',
        keyFormulas: ['3W rule: trace center-to-center spacing ≥ 3x trace width', '5W rule: trace center-to-center spacing ≥ 5x trace width', 'Differential-pair skew: ΔL < 5mil'],
        designNotes: ['Route high-speed signals over a complete plane', 'Avoid 90° corners; use 45° or arcs', 'Length-match differential pairs', 'Minimize stubs', 'Add a return capacitor when crossing a plane split', 'Length-match traces (DDR, USB, etc.)'],
        commonMistakes: ['Using 90° corners', 'Excessive differential-pair skew', 'Routing across a plane split', 'Ignoring the return path', 'Long stubs causing resonance']
      },
      ja: {
        principles: 'PCB 配線設計はインピーダンス制御、クロストーク、長さ整合、EMI などを考慮する必要がある。正しい配線規則が信号品質と電磁両立性を確保する。',
        keyFormulas: ['3W 則：配線の中心間隔 ≥ 線幅の 3 倍', '5W 則：配線の中心間隔 ≥ 線幅の 5 倍', '差動ペアのスキュー：ΔL < 5mil'],
        designNotes: ['高速信号は完全なプレーン上に配線', '90° 曲がりを避け、45° か円弧を使う', '差動ペアを等長整合', 'スタブ（残線）を減らす', '分割プレーンを跨ぐ際はリターンコンデンサを追加', '配線長を整合（DDR、USB 等）'],
        commonMistakes: ['90° 曲がりを使う', '差動ペアのスキューが過大', '分割プレーンを跨いで配線', 'リターン経路を考慮しない', 'スタブが長すぎて共振']
      },
      ko: {
        principles: 'PCB 배선 설계는 임피던스 제어, 크로스토크, 길이 정합, EMI 등을 고려해야 한다. 올바른 배선 규칙이 신호 품질과 전자기 적합성을 보장한다.',
        keyFormulas: ['3W 법칙: 배선 중심 간격 ≥ 선폭의 3배', '5W 법칙: 배선 중심 간격 ≥ 선폭의 5배', '차동 쌍 스큐: ΔL < 5mil'],
        designNotes: ['고속 신호는 완전한 플레인 위에 배선', '90° 코너 회피, 45° 또는 원호 사용', '차동 쌍 등장 정합', '스터브(잔선) 최소화', '분할 플레인을 가로지를 때 리턴 커패시터 추가', '배선 길이 정합(DDR, USB 등)'],
        commonMistakes: ['90° 코너 사용', '차동 쌍 스큐 과다', '분할 플레인을 가로질러 배선', '리턴 경로 미고려', '스터브가 너무 길어 공진']
      }
    },
    'emi-filtering': {
      en: {
        principles: 'EMI filters suppress electromagnetic interference to keep circuits working. Common EMI filters include ferrite beads, LC filters and pi filters.',
        keyFormulas: ['Impedance Z = R + jωL', 'Cutoff frequency fc = 1/(2π√(LC))', 'Insertion loss IL = 20*log(Vout/Vin)'],
        designNotes: ['Ferrite bead selection: mind the impedance-vs-frequency characteristic', 'LC filter: choose the right cutoff frequency', 'Pi filter: good for wideband filtering', 'Grounding: low-impedance ground path', 'Component placement: close to the noise source'],
        commonMistakes: ['Ignoring the impedance-vs-frequency characteristic', 'Wrong filter resonant frequency', 'Ground path too long', 'Poor component placement', 'Not accounting for temperature effects']
      },
      ja: {
        principles: 'EMI フィルタは電磁妨害を抑え回路を正常動作させる。代表的な EMI フィルタにフェライトビーズ、LC フィルタ、π 型フィルタなどがある。',
        keyFormulas: ['インピーダンス Z = R + jωL', 'カットオフ周波数 fc = 1/(2π√(LC))', '挿入損失 IL = 20*log(Vout/Vin)'],
        designNotes: ['フェライトビーズ選択：インピーダンスの周波数特性に注意', 'LC フィルタ：適切なカットオフ周波数を選ぶ', 'π 型フィルタ：広帯域ろ波に適する', '接地設計：低インピーダンスの接地経路', '部品配置：雑音源の近くに'],
        commonMistakes: ['インピーダンスの周波数特性を考慮しない', 'フィルタの共振周波数が不適切', '接地経路が長すぎる', '部品配置が不適切', '温度効果を考慮しない']
      },
      ko: {
        principles: 'EMI 필터는 전자기 간섭을 억제해 회로가 정상 동작하게 한다. 대표적 EMI 필터로 페라이트 비드, LC 필터, π형 필터 등이 있다.',
        keyFormulas: ['임피던스 Z = R + jωL', '차단 주파수 fc = 1/(2π√(LC))', '삽입 손실 IL = 20*log(Vout/Vin)'],
        designNotes: ['페라이트 비드 선택: 임피던스의 주파수 특성 주의', 'LC 필터: 적절한 차단 주파수 선택', 'π형 필터: 광대역 여파에 적합', '접지 설계: 저임피던스 접지 경로', '부품 배치: 잡음원 가까이'],
        commonMistakes: ['임피던스의 주파수 특성 미고려', '필터 공진 주파수 부적절', '접지 경로 과다', '부품 배치 부적절', '온도 효과 미고려']
      }
    },
    'usb-design': {
      en: {
        principles: 'USB design requires attention to differential-impedance matching, ESD protection, power design and signal integrity. USB 2.0 differential impedance is 90Ω; USB 3.0 SuperSpeed is also 90Ω.',
        keyFormulas: ['Differential impedance: Zdiff = 90Ω (USB 2.0)', 'Data rate: 12Mbps (Full Speed), 480Mbps (High Speed)', 'Common-mode voltage: 0-3.3V'],
        designNotes: ['Control differential impedance: 90Ω ±10%', 'Length-match D+ and D-', 'Add ESD protection components', 'Add filter capacitors on VBUS', 'Watch impedance discontinuity at the connector'],
        commonMistakes: ['Impedance mismatch', 'D+ and D- unequal length', 'No ESD protection', 'Insufficient VBUS filtering', 'Routing across a plane split']
      },
      ja: {
        principles: 'USB 設計は差動インピーダンス整合、ESD 保護、電源設計、信号品質を考慮する必要がある。USB 2.0 の差動インピーダンスは 90Ω、USB 3.0 SuperSpeed も 90Ω。',
        keyFormulas: ['差動インピーダンス：Zdiff = 90Ω（USB 2.0）', 'データレート：12Mbps（Full Speed）、480Mbps（High Speed）', '同相電圧：0-3.3V'],
        designNotes: ['差動インピーダンス制御：90Ω ±10%', 'D+ と D- を等長整合', 'ESD 保護部品を追加', 'VBUS にろ波コンデンサを追加', 'コネクタでのインピーダンス不連続に注意'],
        commonMistakes: ['インピーダンス不整合', 'D+ と D- の長さが不等', 'ESD 保護なし', 'VBUS ろ波不足', '分割プレーンを跨ぐ配線']
      },
      ko: {
        principles: 'USB 설계는 차동 임피던스 정합, ESD 보호, 전원 설계, 신호 무결성을 고려해야 한다. USB 2.0 차동 임피던스는 90Ω, USB 3.0 SuperSpeed도 90Ω.',
        keyFormulas: ['차동 임피던스: Zdiff = 90Ω (USB 2.0)', '데이터율: 12Mbps (Full Speed), 480Mbps (High Speed)', '공통 모드 전압: 0-3.3V'],
        designNotes: ['차동 임피던스 제어: 90Ω ±10%', 'D+와 D- 등장 정합', 'ESD 보호 부품 추가', 'VBUS에 여파 커패시터 추가', '커넥터에서 임피던스 불연속 주의'],
        commonMistakes: ['임피던스 불일치', 'D+와 D- 길이 불균등', 'ESD 보호 없음', 'VBUS 여파 부족', '분할 플레인을 가로지르는 배선']
      }
    },
    'spi-design': {
      en: {
        principles: 'SPI (Serial Peripheral Interface) is a high-speed, full-duplex serial protocol. It uses four lines: MOSI, MISO, SCK, CS.',
        keyFormulas: ['Clock frequency: up to 50MHz (standard SPI)', 'Data rate: equals the clock frequency', 'Transfer mode: CPOL and CPHA'],
        designNotes: ['Keep the SCK clock trace short', 'Add a pull-up resistor on the CS line', 'With multiple slaves, mind CS drive strength', 'For high-speed SPI, consider impedance matching', 'Length-match the signal lines'],
        commonMistakes: ['SCK trace too long causing timing problems', 'No pull-up resistor', 'Insufficient CS drive strength', 'Ignoring signal integrity', 'Miswiring (MOSI/MISO crossed)']
      },
      ja: {
        principles: 'SPI（Serial Peripheral Interface）は高速・全二重のシリアル通信プロトコル。MOSI、MISO、SCK、CS の 4 本の線を使う。',
        keyFormulas: ['クロック周波数：最大 50MHz（標準 SPI）', 'データレート：クロック周波数と同じ', '転送モード：CPOL と CPHA'],
        designNotes: ['クロック線 SCK の配線を短く', 'CS 線にプルアップ抵抗を追加', '複数スレーブ時は CS の駆動能力に注意', '高速 SPI ではインピーダンス整合を考慮', '信号線の長さを整合'],
        commonMistakes: ['SCK 配線が長すぎタイミング問題', 'プルアップ抵抗なし', 'CS 駆動能力不足', '信号品質を考慮しない', '誤配線（MOSI/MISO 交差）']
      },
      ko: {
        principles: 'SPI(Serial Peripheral Interface)는 고속·전이중 직렬 통신 프로토콜이다. MOSI, MISO, SCK, CS 네 선을 사용한다.',
        keyFormulas: ['클록 주파수: 최대 50MHz(표준 SPI)', '데이터율: 클록 주파수와 동일', '전송 모드: CPOL과 CPHA'],
        designNotes: ['클록 선 SCK 배선을 짧게', 'CS 선에 풀업 저항 추가', '다중 슬레이브 시 CS 구동 능력 주의', '고속 SPI는 임피던스 정합 고려', '신호선 길이 정합'],
        commonMistakes: ['SCK 배선이 너무 길어 타이밍 문제', '풀업 저항 없음', 'CS 구동 능력 부족', '신호 무결성 미고려', '오배선(MOSI/MISO 교차)']
      }
    },
    'op-amp-basics': {
      en: {
        principles: 'Two ideal op-amp rules: virtual short (the + and - inputs sit at the same potential) and virtual open (no current flows into either input). Every op-amp circuit analysis starts from these two rules.',
        keyFormulas: ['Inverting gain A_V = -Rf / Rin', 'Non-inverting gain A_V = 1 + Rf / Rin', 'Difference amp Vout = (Rf/R1)(V2-V1)', 'GBW = Gain x Bandwidth', 'SR ≥ 2π*f*Vp'],
        designNotes: ['Add a compensation resistor Rb = R1 ∥ Rf on the + input (balances bias current)', 'Usable bandwidth ≈ GBW / closed-loop gain', 'A single-supply op-amp needs a VCC/2 virtual ground', '0.1μF decoupling capacitor close to the supply pin'],
        commonMistakes: ['Using a general-purpose op-amp as a comparator (use a dedicated comparator IC)', 'Insufficient GBW giving inadequate bandwidth', 'Insufficient slew rate causing distortion', 'A differentiator without band-limiting oscillating']
      },
      ja: {
        principles: '理想オペアンプの二大原則：バーチャルショート（＋端子と－端子が同電位）とバーチャルオープン（両入力端子に流れ込む電流はゼロ）。すべてのオペアンプ回路解析はこの 2 原則から始まる。',
        keyFormulas: ['反転増幅 A_V = -Rf / Rin', '非反転増幅 A_V = 1 + Rf / Rin', '差動増幅 Vout = (Rf/R1)(V2-V1)', 'GBW = 利得 x 帯域幅', 'SR ≥ 2π*f*Vp'],
        designNotes: ['＋端子に補償抵抗 Rb = R1 ∥ Rf を接続（バイアス電流を平衡）', '実用帯域幅 ≈ GBW / 閉ループ利得', '単電源オペアンプは VCC/2 の仮想グランドが必要', '0.1μF デカップリングコンデンサを電源ピンの近くに'],
        commonMistakes: ['汎用オペアンプをコンパレータに使う（専用コンパレータ IC を使うべき）', 'GBW 不足で帯域幅が足りない', 'スルーレート不足で歪む', '微分器に帯域制限がなく発振']
      },
      ko: {
        principles: '이상적 op-amp의 두 원칙: 가상 단락(+단자와 -단자가 같은 전위)과 가상 개방(두 입력 단자로 흘러드는 전류가 0). 모든 op-amp 회로 해석은 이 두 원칙에서 출발한다.',
        keyFormulas: ['반전 증폭 A_V = -Rf / Rin', '비반전 증폭 A_V = 1 + Rf / Rin', '차동 증폭 Vout = (Rf/R1)(V2-V1)', 'GBW = 이득 x 대역폭', 'SR ≥ 2π*f*Vp'],
        designNotes: ['+단자에 보상 저항 Rb = R1 ∥ Rf 연결(바이어스 전류 평형)', '실용 대역폭 ≈ GBW / 폐루프 이득', '단일 전원 op-amp는 VCC/2 가상 접지 필요', '0.1μF 디커플링 커패시터를 전원 핀 가까이'],
        commonMistakes: ['범용 op-amp를 비교기로 사용(전용 비교기 IC를 써야 함)', 'GBW 부족으로 대역폭 미달', '슬루레이트 부족으로 왜곡', '미분기에 대역 제한이 없어 발진']
      }
    },
    'mosfet-switching': {
      en: {
        principles: 'When a MOSFET is used as a switch, ensure Vgs > Vth for full turn-on. Losses include conduction loss (I^2*Rds_on) and switching loss (½*V*I*(tr+tf)*f).',
        keyFormulas: ['P_cond = I^2_drain x Rds_on', 'P_switch = ½ x Vds x Id x (tr + tf) x f', 'Vgs_th = 2-4V (logic level)', 'Rds_on ∝ 1/(Vgs - Vth)'],
        designNotes: ['Choose a logic-level MOSFET (Vgs_th < 3V) to drive directly from an MCU', 'A gate resistor controls switching speed and EMI', 'Synchronous rectification instead of a Schottky diode improves efficiency', 'Mind the loss during the Miller plateau'],
        commonMistakes: ['Insufficient gate drive voltage making Rds_on too high', 'Ignoring body-diode reverse recovery', 'Paralleled MOSFETs not sharing current', 'Inadequate thermal design causing thermal runaway']
      },
      ja: {
        principles: 'MOSFET をスイッチとして使うとき、完全導通のため Vgs > Vth を確保する。損失には導通損失（I^2*Rds_on）とスイッチング損失（½*V*I*(tr+tf)*f）がある。',
        keyFormulas: ['P_cond = I^2_drain x Rds_on', 'P_switch = ½ x Vds x Id x (tr + tf) x f', 'Vgs_th = 2-4V（ロジックレベル）', 'Rds_on ∝ 1/(Vgs - Vth)'],
        designNotes: ['ロジックレベル MOSFET（Vgs_th < 3V）を選べば MCU で直接駆動可能', 'ゲート抵抗でスイッチング速度と EMI を制御', 'ショットキーダイオードの代わりに同期整流で効率向上', 'ミラープラトー期間の損失に注意'],
        commonMistakes: ['ゲート駆動電圧不足で Rds_on が高すぎる', 'ボディダイオードの逆回復を考慮しない', '並列 MOSFET が均流しない', '放熱設計不足で熱暴走']
      },
      ko: {
        principles: 'MOSFET을 스위치로 쓸 때 완전 도통을 위해 Vgs > Vth를 확보한다. 손실에는 도통 손실(I^2*Rds_on)과 스위칭 손실(½*V*I*(tr+tf)*f)이 있다.',
        keyFormulas: ['P_cond = I^2_drain x Rds_on', 'P_switch = ½ x Vds x Id x (tr + tf) x f', 'Vgs_th = 2-4V(로직 레벨)', 'Rds_on ∝ 1/(Vgs - Vth)'],
        designNotes: ['로직 레벨 MOSFET(Vgs_th < 3V)을 선택하면 MCU로 직접 구동 가능', '게이트 저항으로 스위칭 속도와 EMI 제어', '쇼트키 다이오드 대신 동기 정류로 효율 향상', '밀러 플래토 구간의 손실 주의'],
        commonMistakes: ['게이트 구동 전압 부족으로 Rds_on 과다', '보디 다이오드 역회복 미고려', '병렬 MOSFET 전류 불균형', '방열 설계 부족으로 열폭주']
      }
    },
    'adc-dac-basics': {
      en: {
        principles: 'An ADC converts an analog signal to digital; key parameters are resolution (bits), sample rate, SNR and ENOB. A DAC does the reverse. Common architectures are SAR, delta-sigma, pipeline and flash.',
        keyFormulas: ['SNR = 6.02N + 1.76 dB (ideal N-bit ADC)', 'ENOB = (SINAD - 1.76) / 6.02', 'Sample rate fs ≥ 2 x fmax (Nyquist)', 'LSB = Vref / 2^N'],
        designNotes: ['SAR ADC: medium speed (~1MSPS), medium resolution (12-18 bit)', 'Delta-sigma ADC: high resolution (16-24 bit), low speed', 'Reference quality directly affects ADC accuracy', 'Separate digital and analog supplies, single-point ground'],
        commonMistakes: ['Not accounting for sample rate causing aliasing', 'Reference noise degrading accuracy', 'Digital return path disturbing the analog signal', 'No anti-aliasing filter']
      },
      ja: {
        principles: 'ADC はアナログ信号をデジタルに変換する。主要パラメータは分解能（ビット数）、サンプリングレート、SNR、ENOB。DAC は逆変換を行う。代表的なアーキテクチャに SAR、デルタシグマ、パイプライン、フラッシュがある。',
        keyFormulas: ['SNR = 6.02N + 1.76 dB（理想 N ビット ADC）', 'ENOB = (SINAD - 1.76) / 6.02', 'サンプリングレート fs ≥ 2 x fmax（ナイキスト）', 'LSB = Vref / 2^N'],
        designNotes: ['SAR ADC：中速（~1MSPS）、中分解能（12-18 bit）', 'デルタシグマ ADC：高分解能（16-24 bit）、低速', '参照電源の品質が ADC 精度を直接左右', 'デジタルとアナログ電源を分離、一点接地'],
        commonMistakes: ['サンプリングレートを考慮せずエイリアシング', '参照電源雑音が精度を低下', 'デジタルリターン経路がアナログ信号を妨害', 'アンチエイリアシングフィルタなし']
      },
      ko: {
        principles: 'ADC는 아날로그 신호를 디지털로 변환한다. 주요 파라미터는 분해능(비트 수), 샘플링 레이트, SNR, ENOB. DAC는 역변환을 한다. 대표적 아키텍처로 SAR, 델타시그마, 파이프라인, 플래시가 있다.',
        keyFormulas: ['SNR = 6.02N + 1.76 dB(이상적 N비트 ADC)', 'ENOB = (SINAD - 1.76) / 6.02', '샘플링 레이트 fs ≥ 2 x fmax(나이퀴스트)', 'LSB = Vref / 2^N'],
        designNotes: ['SAR ADC: 중속(~1MSPS), 중분해능(12-18 bit)', '델타시그마 ADC: 고분해능(16-24 bit), 저속', '기준 전원 품질이 ADC 정확도를 직접 좌우', '디지털과 아날로그 전원 분리, 단일점 접지'],
        commonMistakes: ['샘플링 레이트 미고려로 에일리어싱', '기준 전원 잡음이 정확도 저하', '디지털 리턴 경로가 아날로그 신호 방해', '안티에일리어싱 필터 없음']
      }
    },
    'esd-protection': {
      en: {
        principles: 'An ESD event can produce a transient of thousands of volts. TVS diodes, ESD protection ICs and varistors shunt the energy to ground to protect the downstream circuit.',
        keyFormulas: ['V_clamp = V_breakdown + I_pp x R_dyn', 'ESD energy E = ½ x C x V^2 (HBM: C=100pF)', 'Response time < 1ns (TVS)', 'Capacitive load < 1pF (high-speed signal)'],
        designNotes: ['Place the TVS diode at the connector entry', 'Keep the protection trace short and wide to lower parasitic inductance', 'For USB/HDMI and other high-speed interfaces choose low-capacitance ESD', 'System-level ESD must consider IEC 61000-4-2'],
        commonMistakes: ['ESD protection component too far from the connector', 'Ground path too long, reducing protection', "Not accounting for the protection device's capacitance on high-speed signals", 'Doing only device-level, not system-level ESD']
      },
      ja: {
        principles: 'ESD 事象は数千ボルトの過渡電圧を生じうる。TVS ダイオード、ESD 保護 IC、バリスタなどでエネルギーを接地へ逃がし後段回路を保護する。',
        keyFormulas: ['V_clamp = V_breakdown + I_pp x R_dyn', 'ESD エネルギー E = ½ x C x V^2（HBM：C=100pF）', '応答時間 < 1ns（TVS）', '容量負荷 < 1pF（高速信号）'],
        designNotes: ['TVS ダイオードをコネクタ入口に配置', '保護配線を短く太くし寄生インダクタンスを低減', 'USB/HDMI 等の高速インタフェースには低容量 ESD を選ぶ', 'システムレベル ESD は IEC 61000-4-2 を考慮'],
        commonMistakes: ['ESD 保護部品がコネクタから遠すぎる', '接地経路が長く保護効果が低下', '保護素子の容量が高速信号に与える影響を考慮しない', 'デバイスレベルのみでシステムレベル ESD をしない']
      },
      ko: {
        principles: 'ESD 사건은 수천 볼트의 과도 전압을 일으킬 수 있다. TVS 다이오드, ESD 보호 IC, 배리스터 등으로 에너지를 접지로 흘려보내 후단 회로를 보호한다.',
        keyFormulas: ['V_clamp = V_breakdown + I_pp x R_dyn', 'ESD 에너지 E = ½ x C x V^2 (HBM: C=100pF)', '응답 시간 < 1ns (TVS)', '용량성 부하 < 1pF (고속 신호)'],
        designNotes: ['TVS 다이오드를 커넥터 입구에 배치', '보호 배선을 짧고 넓게 해 기생 인덕턴스 저감', 'USB/HDMI 등 고속 인터페이스는 저용량 ESD 선택', '시스템 레벨 ESD는 IEC 61000-4-2 고려'],
        commonMistakes: ['ESD 보호 부품이 커넥터에서 너무 멂', '접지 경로가 길어 보호 효과 저하', '보호 소자의 용량이 고속 신호에 주는 영향 미고려', '소자 레벨만 하고 시스템 레벨 ESD 미실시']
      }
    },
    'measurement-basics': {
      en: {
        principles: 'Measurement is the key step for verifying a design. An oscilloscope shows time-domain waveforms, a spectrum analyzer shows frequency-domain behavior, a multimeter measures DC parameters, and an LCR bridge measures passive components.',
        keyFormulas: ['Rise time tr(10%-90%) ≈ 0.35 / bandwidth', 'Sample rate ≥ 10 x highest signal frequency', 'Resolution = V_range / 2^bits', 'CMRR = 20log(Vcm/Vout)'],
        designNotes: ['Keep the scope probe ground lead short to reduce loop area', 'Use a differential probe for floating signals', 'For digital signals choose a probe with adequate bandwidth', "Mind the instrument input impedance's effect on the circuit"],
        commonMistakes: ['Long probe ground lead injecting noise', "Measurement changing the circuit's operating state", 'Wrong trigger setting making the waveform unstable', 'Uncalibrated instrument causing measurement error']
      },
      ja: {
        principles: '測定は設計検証の重要ステップ。オシロスコープは時間領域波形、スペクトラムアナライザは周波数領域特性、マルチメータは DC パラメータ、LCR ブリッジは受動部品を測定する。',
        keyFormulas: ['立ち上がり時間 tr(10%-90%) ≈ 0.35 / 帯域幅', 'サンプリングレート ≥ 10 x 信号最高周波数', '分解能 = V_range / 2^bits', '同相除去比 CMRR = 20log(Vcm/Vout)'],
        designNotes: ['オシロプローブの接地リードを短くしループ面積を低減', '浮遊信号には差動プローブを使う', 'デジタル信号には十分な帯域のプローブを選ぶ', '測定器の入力インピーダンスが回路に与える影響に注意'],
        commonMistakes: ['プローブ接地リードが長く雑音を導入', '測定が被測定回路の動作状態を変える', 'トリガ設定が不適切で波形が不安定', '校正していない測定器で測定誤差']
      },
      ko: {
        principles: '측정은 설계 검증의 핵심 단계다. 오실로스코프는 시간 영역 파형, 스펙트럼 분석기는 주파수 영역 특성, 멀티미터는 DC 파라미터, LCR 브리지는 수동 부품을 측정한다.',
        keyFormulas: ['상승 시간 tr(10%-90%) ≈ 0.35 / 대역폭', '샘플링 레이트 ≥ 10 x 신호 최고 주파수', '분해능 = V_range / 2^bits', '동상 제거비 CMRR = 20log(Vcm/Vout)'],
        designNotes: ['오실로 프로브 접지 리드를 짧게 해 루프 면적 저감', '플로팅 신호에는 차동 프로브 사용', '디지털 신호에는 충분한 대역의 프로브 선택', '측정기 입력 임피던스가 회로에 주는 영향 주의'],
        commonMistakes: ['프로브 접지 리드가 길어 잡음 유입', '측정이 피측정 회로의 동작 상태를 바꿈', '트리거 설정 부적절로 파형 불안정', '교정하지 않은 측정기로 측정 오차']
      }
    },
    'embedded-power-design': {
      en: {
        principles: 'Embedded systems usually need several supplies: core voltage (1.0-1.2V), I/O voltage (3.3V), analog voltage (2.5V), etc. Power sequencing, transient response and low-power design are key.',
        keyFormulas: ['P_total = Σ(P_core + P_io + P_static)', 'Power-up time difference Δt > 10ms (typical)', 'Bypass capacitor C ≥ ΔI x Δt / ΔV', 'Sleep current < 10μA (RTC mode)'],
        designNotes: ['Multiple supplies need sequencing (core before I/O)', 'Use a PMIC or multi-channel PMIC to simplify the design', 'The core supply PDN needs low-impedance design', 'Low-power design: turn off unused power domains'],
        commonMistakes: ['Wrong sequencing causing latch-up', 'Insufficient power transient response resetting the MCU', 'Not accounting for load current variation causing voltage droop', 'Analog and digital supplies not isolated']
      },
      ja: {
        principles: '組込みシステムは通常複数の電源が必要：コア電圧（1.0-1.2V）、I/O 電圧（3.3V）、アナログ電圧（2.5V）など。電源投入順序、過渡応答、低消費電力設計が鍵。',
        keyFormulas: ['P_total = Σ(P_core + P_io + P_static)', '投入時間差 Δt > 10ms（典型）', 'バイパスコンデンサ C ≥ ΔI x Δt / ΔV', 'スリープ電流 < 10μA（RTC モード）'],
        designNotes: ['複数電源は投入順序の制御が必要（コアの後に I/O）', 'PMIC や多チャネル PMIC で設計を簡素化', 'コア電源の PDN は低インピーダンス設計が必要', '低消費電力設計：未使用の電源ドメインを切る'],
        commonMistakes: ['投入順序誤りでラッチアップ', '電源過渡応答不足で MCU がリセット', '負荷電流変動を考慮せず電圧降下', 'アナログとデジタル電源が未分離']
      },
      ko: {
        principles: '임베디드 시스템은 보통 여러 전원이 필요하다: 코어 전압(1.0-1.2V), I/O 전압(3.3V), 아날로그 전압(2.5V) 등. 전원 시퀀싱, 과도 응답, 저전력 설계가 핵심.',
        keyFormulas: ['P_total = Σ(P_core + P_io + P_static)', '인가 시간차 Δt > 10ms(전형)', '바이패스 커패시터 C ≥ ΔI x Δt / ΔV', '슬립 전류 < 10μA(RTC 모드)'],
        designNotes: ['다중 전원은 시퀀싱 제어 필요(코어 다음 I/O)', 'PMIC나 다채널 PMIC로 설계 간소화', '코어 전원 PDN은 저임피던스 설계 필요', '저전력 설계: 미사용 전원 도메인 차단'],
        commonMistakes: ['시퀀싱 오류로 래치업', '전원 과도 응답 부족으로 MCU 리셋', '부하 전류 변동 미고려로 전압 강하', '아날로그와 디지털 전원 미분리']
      }
    },
    'boost-converter': {
      en: {
        principles: 'A boost converter steps up voltage by storing and releasing energy in an inductor. When the switch is on, the inductor stores energy; when it turns off, the inductor voltage adds to the input and feeds the load through a diode. The output is always higher than the input.',
        keyFormulas: ['Vout = Vin / (1 - D)', 'D = 1 - Vin/Vout', 'IL = Iout / (1 - D)', 'Duty cycle D = Ton / T'],
        designNotes: ['Choose a suitable inductor (saturation current > 1.3x peak current)', 'Keep the input capacitor close to the IC to reduce input ripple', 'Choose a low-Vf Schottky diode', "Ensure the output voltage does not exceed the IC's maximum rating", 'Minimize the switching loop area in PCB layout'],
        commonMistakes: ['Insufficient inductor saturation current lowering efficiency', 'Output capacitor ESR too high causing excessive ripple', 'Diode reverse-recovery time hurting efficiency', 'Poor PCB layout causing EMI problems', 'Not accounting for DCM at light load']
      },
      ja: {
        principles: 'Boost コンバータはインダクタにエネルギーを蓄放電して昇圧する。スイッチオンでインダクタが蓄積、オフでインダクタ電圧が入力に加算されダイオード経由で負荷へ供給。出力は常に入力より高い。',
        keyFormulas: ['Vout = Vin / (1 - D)', 'D = 1 - Vin/Vout', 'IL = Iout / (1 - D)', 'デューティ比 D = Ton / T'],
        designNotes: ['適切なインダクタを選ぶ（飽和電流 > ピーク電流の 1.3 倍）', '入力コンデンサを IC の近くに置き入力リップルを低減', '低 Vf のショットキーダイオードを選ぶ', '出力電圧が IC の最大定格を超えないようにする', 'PCB レイアウトでスイッチングループ面積を最小化'],
        commonMistakes: ['インダクタ飽和電流不足で効率低下', '出力コンデンサの ESR が高くリップル過大', 'ダイオードの逆回復時間が効率を損なう', 'PCB レイアウト不良で EMI 問題', '軽負荷時の DCM モードを考慮しない']
      },
      ko: {
        principles: 'Boost 컨버터는 인덕터에 에너지를 저장·방출해 승압한다. 스위치 온에서 인덕터가 저장, 오프에서 인덕터 전압이 입력에 더해져 다이오드를 통해 부하에 공급. 출력은 항상 입력보다 높다.',
        keyFormulas: ['Vout = Vin / (1 - D)', 'D = 1 - Vin/Vout', 'IL = Iout / (1 - D)', '듀티비 D = Ton / T'],
        designNotes: ['적합한 인덕터 선택(포화 전류 > 피크 전류의 1.3배)', '입력 커패시터를 IC 가까이 두어 입력 리플 저감', '저 Vf 쇼트키 다이오드 선택', '출력 전압이 IC 최대 정격을 넘지 않게 함', 'PCB 레이아웃에서 스위칭 루프 면적 최소화'],
        commonMistakes: ['인덕터 포화 전류 부족으로 효율 저하', '출력 커패시터 ESR 과다로 리플 과대', '다이오드 역회복 시간이 효율 저하', 'PCB 레이아웃 불량으로 EMI 문제', '경부하 시 DCM 모드 미고려']
      }
    }
  };
  var M = window.KNOWLEDGE_I18N = window.KNOWLEDGE_I18N || {};
  Object.keys(DETAIL).forEach(function (id) {
    M[id] = M[id] || {};
    ['en', 'ja', 'ko'].forEach(function (l) {
      if (DETAIL[id][l]) M[id][l] = Object.assign({}, M[id][l], DETAIL[id][l]);
    });
  });
  function apply() {
    if (typeof knowledgeApp === 'undefined' || !knowledgeApp.items || !knowledgeApp.items.length) return false;
    knowledgeApp.items.forEach(function (it) { var m = M[it.id]; if (m) it.i18n = Object.assign({}, it.i18n, m); });
    return true;
  }
  if (!apply()) {
    document.addEventListener('DOMContentLoaded', function () {
      if (!apply()) { var n = 0, t = setInterval(function () { if (apply() || ++n > 20) clearInterval(t); }, 250); }
    });
  }
})();
