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
