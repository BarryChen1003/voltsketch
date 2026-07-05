/**
 * knowledge-i18n.js — 知識卡內容層 i18n（批次 1：全 75 卡 title+description en/ja/ko）
 * 詳情欄位（principles/keyFormulas/designNotes/commonMistakes）後續批次補；
 * i18n merge 為欄位級 fallback（knowledge.js renderCards/showDetail），缺欄自動回中文。
 * 掛接方式：檔尾 IIFE 把 KNOWLEDGE_I18N 塞進 knowledgeApp.items[].i18n（舊 localStorage 快取卡也吃得到）。
 */
window.KNOWLEDGE_I18N = Object.assign(window.KNOWLEDGE_I18N || {}, {
 'level-shift': {
  en: { title: 'Level Shift Circuits', description: 'Signal translation between voltage domains, e.g. a 3.3V MCU talking to a 5V sensor.' },
  ja: { title: 'レベルシフト回路', description: '異なる電圧ドメイン間の信号変換。例：3.3V MCU と 5V センサの通信。' },
  ko: { title: '레벨 시프트 회로', description: '서로 다른 전압 도메인 간 신호 변환. 예: 3.3V MCU와 5V 센서 통신.' } },
 'ldo-regulator': {
  en: { title: 'LDO Regulator', description: 'Low Dropout Regulator: converts a higher voltage into a clean, stable lower-voltage output.' },
  ja: { title: 'LDO レギュレータ', description: 'Low Dropout Regulator。高い電圧を安定した低電圧出力に変換する。' },
  ko: { title: 'LDO 레귤레이터', description: 'Low Dropout Regulator: 높은 전압을 안정적인 저전압 출력으로 변환.' } },
 'buck-converter': {
  en: { title: 'Buck Converter', description: 'Switching step-down converter; higher efficiency than an LDO, suited to high-current rails.' },
  ja: { title: '降圧（Buck）コンバータ', description: 'スイッチング式降圧コンバータ。LDO より高効率で大電流向き。' },
  ko: { title: '벅(Buck) 컨버터', description: '스위칭 방식 강압 컨버터. LDO보다 효율이 높아 대전류에 적합.' } },
 'i2c-communication': {
  en: { title: 'I2C Protocol', description: 'Inter-Integrated Circuit: two-wire serial bus widely used for chip-to-chip communication.' },
  ja: { title: 'I2C 通信プロトコル', description: 'Inter-Integrated Circuit。2 線式シリアルバスで IC 間通信の定番。' },
  ko: { title: 'I2C 통신 프로토콜', description: 'Inter-Integrated Circuit: 2선식 직렬 버스, 칩 간 통신에 널리 사용.' } },
 'buck-converter-advanced': {
  en: { title: 'Advanced Buck Design', description: 'Advanced switching-regulator techniques: current sensing, hot-loop optimization, EMI filtering.' },
  ja: { title: 'Buck コンバータ応用設計', description: 'スイッチングレギュレータの応用設計：電流検出、ホットループ最適化、EMI フィルタ。' },
  ko: { title: 'Buck 컨버터 고급 설계', description: '스위칭 레귤레이터 고급 기법: 전류 감지, 핫루프 최적화, EMI 필터링.' } },
 'ldo-noise': {
  en: { title: 'Low-Noise LDO Design', description: 'Design principles of low-noise LDOs for analog, RF and precision-measurement rails.' },
  ja: { title: '低ノイズ LDO 設計', description: 'アナログ・RF・精密計測向け低ノイズ LDO の設計原理と応用。' },
  ko: { title: '저노이즈 LDO 설계', description: '아날로그, RF, 정밀 측정용 저노이즈 LDO 설계 원리와 응용.' } },
 'impedance-matching': {
  en: { title: 'Impedance Matching', description: 'Impedance-matching theory and practice for high-speed signals; fewer reflections, less distortion.' },
  ja: { title: 'インピーダンス整合設計', description: '高速信号のインピーダンス整合の原理と実装。反射と信号歪みを低減。' },
  ko: { title: '임피던스 매칭 설계', description: '고속 신호의 임피던스 매칭 원리와 구현. 반사와 신호 왜곡 감소.' } },
 'pdn-design': {
  en: { title: 'PDN Design', description: 'Power Distribution Network design rules that secure power integrity for high-speed circuits.' },
  ja: { title: 'PDN（電源分配網）設計', description: '高速回路の電源インテグリティを確保する電源分配ネットワークの設計原則。' },
  ko: { title: 'PDN 전원 분배망 설계', description: '고속 회로의 전원 무결성을 보장하는 전원 분배 네트워크 설계 원칙.' } },
 'pcb叠层设计': {
  en: { title: 'PCB Stackup Principles', description: 'Stackup design rules that preserve both signal integrity and power integrity.' },
  ja: { title: 'PCB スタックアップ設計', description: '信号インテグリティと電源インテグリティを両立する層構成の設計原則。' },
  ko: { title: 'PCB 적층 설계 원칙', description: '신호 무결성과 전원 무결성을 확보하는 적층 구조 설계 원칙.' } },
 'pcb走线规则': {
  en: { title: 'PCB Routing Rules', description: 'Trace-routing rules: spacing, length matching, corners and more.' },
  ja: { title: 'PCB 配線ルール', description: '配線設計ルール：間隔、等長、コーナー処理など。' },
  ko: { title: 'PCB 배선 규칙', description: '배선 설계 규칙: 간격, 길이 매칭, 코너 처리 등.' } },
 'emi-filtering': {
  en: { title: 'EMI Filter Design', description: 'Design principles and applications of electromagnetic-interference filters.' },
  ja: { title: 'EMI フィルタ設計', description: '電磁妨害（EMI）フィルタの設計原則と応用。' },
  ko: { title: 'EMI 필터 설계', description: '전자파 간섭(EMI) 필터의 설계 원칙과 응용.' } },
 'usb-design': {
  en: { title: 'USB Interface Design', description: 'USB hardware essentials: impedance control, ESD protection and more.' },
  ja: { title: 'USB インターフェース設計', description: 'USB ハードウェア設計の要点：インピーダンス整合、ESD 保護など。' },
  ko: { title: 'USB 인터페이스 설계', description: 'USB 하드웨어 설계 요점: 임피던스 매칭, ESD 보호 등.' } },
 'spi-design': {
  en: { title: 'SPI Interface Design', description: 'SPI hardware essentials: clock rates, signal integrity and more.' },
  ja: { title: 'SPI インターフェース設計', description: 'SPI ハードウェア設計の要点：クロック周波数、信号品質など。' },
  ko: { title: 'SPI 인터페이스 설계', description: 'SPI 하드웨어 설계 요점: 클럭 주파수, 신호 무결성 등.' } },
 'op-amp-basics': {
  en: { title: 'Op-Amp Fundamentals', description: 'Core op-amp concepts: virtual short/open, and the nine classic application circuits.' },
  ja: { title: 'オペアンプの基礎', description: 'バーチャルショート/オープンの原理と九大応用回路。' },
  ko: { title: '연산 증폭기 기초', description: '가상 단락/개방 원리와 9대 응용 회로.' } },
 'mosfet-switching': {
  en: { title: 'MOSFET Switching', description: 'Power-MOSFET switching behavior, gate-drive circuits and loss analysis.' },
  ja: { title: 'MOSFET スイッチング設計', description: 'パワー MOSFET のスイッチング特性、駆動回路、損失解析。' },
  ko: { title: 'MOSFET 스위칭 설계', description: '전력 MOSFET의 스위칭 특성, 구동 회로, 손실 분석.' } },
 'adc-dac-basics': {
  en: { title: 'ADC / DAC Basics', description: 'How analog-digital and digital-analog converters work, and how to choose one.' },
  ja: { title: 'ADC / DAC の基礎', description: 'A/D・D/A コンバータの動作原理と選定。' },
  ko: { title: 'ADC / DAC 기초', description: '아날로그-디지털 및 디지털-아날로그 컨버터의 동작 원리와 선정.' } },
 'esd-protection': {
  en: { title: 'ESD Protection', description: 'Electrostatic-discharge protection principles and implementation for sensitive parts.' },
  ja: { title: 'ESD 保護設計', description: '静電気放電保護の原理と実装。敏感な部品を守る。' },
  ko: { title: 'ESD 보호 설계', description: '정전기 방전 보호의 원리와 구현. 민감한 부품 보호.' } },
 'measurement-basics': {
  en: { title: 'Measurement Basics', description: 'Using the everyday instruments: oscilloscope, multimeter, signal generator and more.' },
  ja: { title: '電子計測の基礎', description: 'オシロスコープ、マルチメータ、信号発生器など計測器の使い方。' },
  ko: { title: '전자 계측 기초', description: '오실로스코프, 멀티미터, 신호 발생기 등 계측기 사용법.' } },
 'embedded-power-design': {
  en: { title: 'Embedded Power Architecture', description: 'Power-tree design for MCU/FPGA-class embedded systems.' },
  ja: { title: '組込みシステム電源設計', description: 'MCU/FPGA など組込みシステムの電源アーキテクチャ設計。' },
  ko: { title: '임베디드 시스템 전원 설계', description: 'MCU/FPGA 등 임베디드 시스템의 전원 아키텍처 설계.' } },
 'boost-converter': {
  en: { title: 'Boost Converter', description: 'Switching step-up converter: generates a higher output voltage from a lower input.' },
  ja: { title: '昇圧（Boost）コンバータ', description: 'スイッチング式昇圧コンバータ。低い入力から高い出力電圧を作る。' },
  ko: { title: '부스트(Boost) 컨버터', description: '스위칭 방식 승압 컨버터. 낮은 입력에서 높은 출력 전압 생성.' } },
 'buck-boost-converter': {
  en: { title: 'Buck-Boost Converter', description: 'Steps up or down; classic inverting topology can output negative voltage.' },
  ja: { title: '昇降圧（Buck-Boost）コンバータ', description: '昇圧も降圧も可能なコンバータ。反転型は負電圧出力。' },
  ko: { title: '벅-부스트 컨버터', description: '승압/강압 겸용 스위칭 컨버터. 반전형은 음전압 출력 가능.' } },
 'ldo-selection': {
  en: { title: 'LDO Selection Guide', description: 'Choosing the right LDO for the application: dropout, noise, PSRR, thermals.' },
  ja: { title: 'LDO 選定ガイド', description: '用途要求に合う LDO の選び方：ドロップアウト、ノイズ、PSRR、熱。' },
  ko: { title: 'LDO 선정 가이드', description: '용도 요구에 맞는 LDO 선택법: 드롭아웃, 노이즈, PSRR, 발열.' } },
 'power-sequencing': {
  en: { title: 'Power Sequencing', description: 'Controlling multi-rail power-up order so the system starts correctly.' },
  ja: { title: '電源シーケンス設計', description: '複数電源の投入順序制御。システムを正しく起動させる。' },
  ko: { title: '전원 시퀀싱 설계', description: '다중 전원의 인가 순서 제어. 시스템의 올바른 기동 보장.' } },
 'decoupling-capacitor': {
  en: { title: 'Decoupling Capacitors', description: 'Theory, selection and placement of decoupling caps for power integrity.' },
  ja: { title: 'デカップリングコンデンサ', description: '原理・選定・配置戦略。電源インテグリティを確保。' },
  ko: { title: '디커플링 커패시터 선택과 배치', description: '원리, 선정, 배치 전략. 전원 무결성 확보.' } },
 'common-mode-choke': {
  en: { title: 'Common-Mode Choke', description: 'Common-mode noise suppression principles and choke selection.' },
  ja: { title: 'コモンモードチョーク設計', description: 'コモンモードノイズ抑制の原理とチョーク選定。' },
  ko: { title: '공통 모드 초크 설계', description: '공통 모드 노이즈 억제 원리와 초크 선정.' } },
 'emi-layout': {
  en: { title: 'EMI-Aware PCB Layout', description: 'Layout techniques that reduce EMI at the board level.' },
  ja: { title: 'EMI 対策 PCB レイアウト', description: '基板レベルで EMI を減らすレイアウト技法。' },
  ko: { title: 'EMI 저감 PCB 레이아웃', description: 'PCB 차원에서 EMI를 줄이는 레이아웃 기법.' } },
 'tvd-selection': {
  en: { title: 'TVS Diode Selection', description: 'Selection rules and application circuits for TVS protection diodes.' },
  ja: { title: 'TVS ダイオード選定', description: 'TVS ダイオードの選定原則と応用回路。' },
  ko: { title: 'TVS 다이오드 선정', description: 'TVS 다이오드의 선정 원칙과 응용 회로.' } },
 'reverse-polarity': {
  en: { title: 'Reverse-Polarity Protection', description: 'Methods and circuits that protect against reversed supply connections.' },
  ja: { title: '逆接続保護回路', description: '電源逆接続保護の方式と回路設計。' },
  ko: { title: '역극성 보호 회로', description: '전원 역접속 보호 방법과 회로 설계.' } },
 'thermal-design': {
  en: { title: 'PCB Thermal Design', description: 'Thermal calculations for power parts and board-level heat spreading.' },
  ja: { title: 'PCB 放熱設計', description: 'パワー部品の熱計算と基板放熱設計。' },
  ko: { title: 'PCB 방열 설계', description: '전력 부품의 열 계산과 PCB 방열 설계.' } },
 'via-design': {
  en: { title: 'PCB Via Design', description: 'Via types, design rules and parasitic effects.' },
  ja: { title: 'PCB ビア設計', description: 'ビアの種類、設計ルール、寄生効果。' },
  ko: { title: 'PCB 비아 설계', description: '비아의 종류, 설계 규칙, 기생 효과.' } },
 'grounding-design': {
  en: { title: 'Grounding Strategies', description: 'PCB grounding: single-point, multi-point and hybrid schemes.' },
  ja: { title: '接地（グラウンド）設計原則', description: 'PCB 接地戦略：一点接地、多点接地、ハイブリッド。' },
  ko: { title: '접지 설계 원칙', description: 'PCB 접지 전략: 단일점, 다중점, 하이브리드 접지.' } },
 'differential-pair': {
  en: { title: 'Differential-Pair Routing', description: 'Routing rules and impedance control for differential signals.' },
  ja: { title: '差動ペア配線設計', description: '差動信号の配線ルールとインピーダンス制御。' },
  ko: { title: '차동 페어 배선 설계', description: '차동 신호의 배선 규칙과 임피던스 제어.' } },
 'automotive-transient': {
  en: { title: 'Automotive Transient Protection', description: 'Transient behavior of vehicle power lines and protection design (load dump etc.).' },
  ja: { title: '車載電源トランジェント保護', description: '車両電源ラインの過渡特性（ロードダンプ等）と保護設計。' },
  ko: { title: '차량용 전원 과도 보호', description: '자동차 전원 라인의 과도 특성(로드 덤프 등)과 보호 설계.' } },
 'led-driver': {
  en: { title: 'LED Driver Design', description: 'Constant-current / constant-voltage LED driving and efficiency optimization.' },
  ja: { title: 'LED ドライバ回路設計', description: '定電流/定電圧 LED 駆動と効率最適化。' },
  ko: { title: 'LED 드라이버 회로 설계', description: '정전류/정전압 LED 구동과 효율 최적화.' } },
 'battery-charger': {
  en: { title: 'Battery-Charger Design', description: 'Li-ion charge-management circuits and charger-IC selection.' },
  ja: { title: 'バッテリ充電回路設計', description: 'リチウムイオン充電管理回路と充電 IC 選定。' },
  ko: { title: '배터리 충전 회로 설계', description: '리튬 이온 충전 관리 회로와 충전 IC 선정.' } },
 'opamp-configurations': {
  en: { title: 'Nine Op-Amp Configurations', description: 'The nine fundamental op-amp circuit configurations and their uses.' },
  ja: { title: 'オペアンプ九大基本回路', description: 'オペアンプの九つの基本回路構成と応用。' },
  ko: { title: '연산 증폭기 9대 기본 구성', description: '연산 증폭기의 9가지 기본 회로 구성과 응용.' } },
 'current-sensing': {
  en: { title: 'Current Sensing', description: 'Current-measurement methods: shunt resistor, Hall sensor, current transformer.' },
  ja: { title: '電流検出回路', description: '電流検出の方式：シャント抵抗、ホールセンサ、変流器。' },
  ko: { title: '전류 감지 회로', description: '전류 감지 방법: 션트 저항, 홀 센서, 변류기.' } },
 'flyback-converter': {
  en: { title: 'Flyback Converter', description: 'Isolated switching supply; the workhorse of AC-DC and isolated DC-DC.' },
  ja: { title: 'フライバックコンバータ', description: '一次/二次絶縁のスイッチング電源。AC-DC・絶縁 DC-DC の定番。' },
  ko: { title: '플라이백 절연 컨버터', description: '1차/2차 절연 스위칭 전원. AC-DC와 절연 DC-DC의 대표 토폴로지.' } },
 'half-bridge': {
  en: { title: 'Half-Bridge Topology', description: 'High-side + low-side MOSFETs in series; the midpoint switch node drives DC-DC, motors, inverters.' },
  ja: { title: 'ハーフブリッジ構成', description: 'ハイサイド＋ローサイド MOSFET 直列、中点がスイッチノード。DC-DC・モータ・インバータに使用。' },
  ko: { title: '하프 브리지 토폴로지', description: '상단+하단 MOSFET 직렬, 중점이 스위칭 노드. DC-DC, 모터, 인버터에 사용.' } }
});
Object.assign(window.KNOWLEDGE_I18N, {
 'gate-driver': {
  en: { title: 'Gate Drivers & Bootstrap', description: 'Delivering enough current to switch power MOSFETs/IGBTs fast; bootstrap supply for the high side.' },
  ja: { title: 'ゲートドライバとブートストラップ', description: 'パワー MOSFET/IGBT を高速スイッチングする駆動電流を供給。ハイサイドはブートストラップ給電。' },
  ko: { title: '게이트 드라이버와 부트스트랩', description: '전력 MOSFET/IGBT를 빠르게 스위칭할 전류 공급. 하이사이드는 부트스트랩 전원.' } },
 'comparator-hysteresis': {
  en: { title: 'Hysteresis Comparator (Schmitt)', description: 'Positive feedback adds hysteresis: noise immunity, no output chatter.' },
  ja: { title: 'ヒステリシスコンパレータ（シュミット）', description: '正帰還でヒステリシスを形成。ノイズ耐性を高め出力のばたつきを防ぐ。' },
  ko: { title: '히스테리시스 비교기(슈미트)', description: '양귀환으로 히스테리시스 형성. 노이즈 내성 확보, 출력 채터링 방지.' } },
 'comparator-vs-opamp': {
  en: { title: 'Comparator vs Op-Amp', description: 'They look alike but differ: comparators are open-loop digital-out, op-amps are closed-loop linear. Misuse causes oscillation or sluggishness.' },
  ja: { title: 'コンパレータと OP アンプの違い', description: '外見は似て用途は別物：コンパレータは開ループのデジタル出力、OP アンプは閉ループのリニア動作。誤用は発振や速度低下を招く。' },
  ko: { title: '비교기 vs 연산 증폭기 차이', description: '겉모습은 비슷해도 용도가 다름: 비교기는 개루프 디지털 출력, OP는 폐루프 선형. 오용 시 발진하거나 느려짐.' } },
 'tl431-reference': {
  en: { title: 'TL431 Shunt Reference', description: 'Programmable shunt regulator/reference; a staple in power-supply feedback and monitoring.' },
  ja: { title: 'TL431 可変シャントレギュレータ', description: 'プログラマブルなシャント基準。電源フィードバックと監視の定番。' },
  ko: { title: 'TL431 가변 션트 기준', description: '프로그래머블 병렬 레귤레이터/기준. 전원 피드백과 모니터링의 단골.' } },
 'rc-lowpass-filter': {
  en: { title: 'RC Low-Pass Filter', description: 'The most basic first-order low-pass: denoising, anti-aliasing, soft start.' },
  ja: { title: 'RC ローパスフィルタ', description: '最も基本の一次ローパス。ノイズ除去、アンチエイリアス、ソフトスタート。' },
  ko: { title: 'RC 저역 통과 필터', description: '가장 기본적인 1차 저역 통과: 노이즈 제거, 안티앨리어싱, 소프트 스타트.' } },
 'crystal-oscillator': {
  en: { title: 'Crystal Oscillator (Pierce)', description: 'MCU/MPU clock source: crystal plus two load capacitors.' },
  ja: { title: '水晶発振回路（ピアース）', description: 'MCU/MPU のクロック源。水晶＋2 つの負荷コンデンサ。' },
  ko: { title: '수정 발진 회로(Pierce)', description: 'MCU/MPU의 클럭 소스. 수정 진동자 + 부하 커패시터 2개.' } },
 'ntc-thermistor': {
  en: { title: 'NTC Thermistor Sensing', description: 'Temperature measurement with an NTC divider into an ADC.' },
  ja: { title: 'NTC サーミスタ温度計測', description: 'NTC 分圧を ADC に入れて温度を測る。' },
  ko: { title: 'NTC 서미스터 온도 측정', description: 'NTC 분압을 ADC에 연결해 온도 측정.' } },
 'hot-swap': {
  en: { title: 'Hot-Swap / Inrush Limiting', description: 'Limiting inrush current during live insertion; protects connectors and supplies.' },
  ja: { title: 'ホットスワップ／突入電流制限', description: '活線挿抜時の突入電流を制限。コネクタと電源を保護。' },
  ko: { title: '핫스왑 / 돌입 전류 제한', description: '활선 삽입 시 돌입 전류 제한. 커넥터와 전원 보호.' } },
 'optocoupler-feedback': {
  en: { title: 'Optocoupler Feedback', description: 'Carrying feedback/signals across the isolation barrier while keeping primary and secondary isolated.' },
  ja: { title: 'フォトカプラ絶縁フィードバック', description: '絶縁バリアを越えて帰還/信号を伝達。一次二次の電気的絶縁を維持。' },
  ko: { title: '포토커플러 절연 피드백', description: '절연 장벽 너머로 피드백/신호 전달. 1차/2차 전기 절연 유지.' } },
 'oring-power': {
  en: { title: 'Power ORing / Ideal Diode', description: 'Two supplies in parallel, the higher one wins automatically; ideal diodes cut the drop.' },
  ja: { title: 'ORing 電源切替／理想ダイオード', description: '2 系統電源を並列にし高い方を自動選択。理想ダイオードで電圧降下を低減。' },
  ko: { title: 'ORing 이중 전원 전환 / 이상 다이오드', description: '두 전원을 병렬 연결해 높은 쪽 자동 선택. 이상 다이오드로 전압 강하 감소.' } },
 'charge-pump': {
  en: { title: 'Charge Pump', description: 'Capacitor-and-switch voltage boosting or inversion; inductorless small-power supply.' },
  ja: { title: 'チャージポンプ', description: 'コンデンサとスイッチで昇圧/反転。インダクタレスの小電力電源。' },
  ko: { title: '차지 펌프(Charge Pump)', description: '커패시터와 스위치로 승압/반전. 인덕터 없는 소전력 전원.' } },
 'bridge-rectifier': {
  en: { title: 'Bridge Rectifier + Filter', description: 'AC-to-DC basics: four-diode bridge plus smoothing capacitor.' },
  ja: { title: '全波整流＋平滑', description: 'AC→DC の基礎：4 ダイオードのブリッジ整流＋平滑コンデンサ。' },
  ko: { title: '브리지 정류 + 평활', description: 'AC를 DC로 바꾸는 기초: 4 다이오드 브리지 정류 + 평활 커패시터.' } },
 'h-bridge-motor': {
  en: { title: 'H-Bridge Motor Drive', description: 'Four MOSFETs control DC-motor direction and speed.' },
  ja: { title: 'H ブリッジモータ駆動', description: '4 つの MOSFET で DC モータの正逆転と速度を制御。' },
  ko: { title: 'H 브리지 모터 구동', description: 'MOSFET 4개로 DC 모터의 정/역회전과 속도 제어.' } },
 'load-switch': {
  en: { title: 'PMOS Load Switch', description: 'High-side PMOS switch gating power to a subsystem.' },
  ja: { title: 'PMOS ロードスイッチ', description: 'PMOS ハイサイドスイッチでサブシステム電源を ON/OFF。' },
  ko: { title: 'PMOS 로드 스위치', description: 'PMOS 하이사이드 스위치로 서브시스템 전원 개폐.' } },
 'rc-snubber': {
  en: { title: 'RC Snubber', description: 'Damps switch-node ringing and voltage spikes; reduces EMI.' },
  ja: { title: 'RC スナバ回路', description: 'スイッチノードのリンギングと電圧スパイクを抑制、EMI 低減。' },
  ko: { title: 'RC 스너버 회로', description: '스위칭 노드의 링잉과 전압 스파이크 억제, EMI 저감.' } },
 'forward-converter': {
  en: { title: 'Forward Converter', description: 'Isolated switcher that transfers energy through the transformer while the switch is on.' },
  ja: { title: 'フォワードコンバータ', description: '絶縁型スイッチング電源。スイッチ導通時に変圧器経由で直接エネルギー伝達。' },
  ko: { title: '포워드 절연 컨버터', description: '절연형 스위칭 전원. 스위치 도통 시 변압기를 통해 에너지 직접 전달.' } },
 'can-transceiver': {
  en: { title: 'CAN Transceiver & Termination', description: 'Differential CAN bus interface with a 120-ohm terminator at each end.' },
  ja: { title: 'CAN トランシーバと終端', description: '差動 CAN バスインターフェース。両端に 120Ω 終端抵抗。' },
  ko: { title: 'CAN 트랜시버와 종단', description: '차동 CAN 버스 인터페이스, 양 끝에 120Ω 종단 저항.' } },
 'rs485-transceiver': {
  en: { title: 'RS-485 Transceiver & Termination', description: 'Half-duplex differential bus on A/B lines, 120-ohm termination at both ends.' },
  ja: { title: 'RS-485 トランシーバと終端', description: '半二重差動バス。A/B 2 線、両端 120Ω 終端。' },
  ko: { title: 'RS-485 트랜시버와 종단', description: '반이중 차동 버스, A/B 2선, 양단 120Ω 종단.' } },
 'relay-driver': {
  en: { title: 'Relay Driver (Flyback Diode)', description: 'Low-side MOSFET/BJT drives the relay coil; a flyback diode clamps the back-EMF.' },
  ja: { title: 'リレー駆動（還流ダイオード）', description: 'MOSFET/BJT ローサイドでコイルを駆動。並列の還流ダイオードで逆起電力を吸収。' },
  ko: { title: '릴레이 구동(플라이휠 다이오드)', description: 'MOSFET/BJT 로우사이드로 코일 구동, 병렬 플라이휠 다이오드로 역기전력 방출.' } },
 'wheatstone-bridge': {
  en: { title: 'Wheatstone Bridge', description: 'Four-resistor bridge measuring tiny resistance changes: strain, pressure, temperature.' },
  ja: { title: 'ホイートストンブリッジ（センシング）', description: '4 抵抗ブリッジで微小な抵抗変化を計測（ひずみ・圧力・温度）。' },
  ko: { title: '휘트스톤 브리지(센싱)', description: '4저항 브리지로 미세한 저항 변화 측정(스트레인, 압력, 온도).' } },
 'current-mirror': {
  en: { title: 'Current Mirror', description: 'Copies a reference current at a set ratio; a fundamental analog-IC building block.' },
  ja: { title: 'カレントミラー', description: '基準電流を比例複製。アナログ IC の基本構成要素。' },
  ko: { title: '전류 미러(Current Mirror)', description: '기준 전류를 비례 복제. 아날로그 IC의 기본 빌딩 블록.' } },
 'bjt-switch': {
  en: { title: 'NPN Transistor Switch', description: 'Low-side NPN switch driving a load; base resistor sets saturation drive.' },
  ja: { title: 'NPN トランジスタスイッチ', description: 'NPN ローサイドスイッチで負荷を駆動。ベース抵抗で飽和導通させる。' },
  ko: { title: 'NPN 트랜지스터 스위치', description: 'NPN 로우사이드 스위치로 부하 구동. 베이스 저항으로 포화 도통.' } },
 'push-pull-converter': {
  en: { title: 'Push-Pull Converter', description: 'Center-tapped primary with two alternating switches; a medium-power isolated topology.' },
  ja: { title: 'プッシュプルコンバータ', description: 'センタータップ一次側＋2 スイッチ交互導通の絶縁コンバータ。中電力向け。' },
  ko: { title: '푸시풀 컨버터', description: '센터탭 1차측 + 두 스위치 교대 도통의 절연 컨버터. 중전력용.' } },
 'full-bridge-converter': {
  en: { title: 'Full-Bridge Converter', description: 'Four switches drive the transformer primary; the topology for high-power isolation.' },
  ja: { title: 'フルブリッジコンバータ', description: '4 スイッチのブリッジで変圧器一次側を駆動。大電力絶縁変換向け。' },
  ko: { title: '풀 브리지 컨버터', description: '스위치 4개로 변압기 1차측 구동. 대전력 절연 변환에 적합.' } },
 'pwm-control': {
  en: { title: 'PWM Control', description: 'Comparing a ramp with an error voltage yields PWM; the core of switchers and motor control.' },
  ja: { title: 'PWM 制御の原理', description: 'のこぎり波と誤差電圧の比較で PWM を生成。スイッチング電源/モータ制御の中核。' },
  ko: { title: 'PWM 제어 원리', description: '톱니파와 오차 전압 비교로 PWM 생성. 스위칭 전원/모터 속도 제어의 핵심.' } },
 'ddr-termination': {
  en: { title: 'DDR / VTT Termination', description: 'High-speed memory buses terminate to VTT (=Vdd/2) to suppress reflections.' },
  ja: { title: 'DDR / VTT 終端', description: '高速メモリバスは VTT(=Vdd/2) 終端で反射を抑え信号品質を確保。' },
  ko: { title: 'DDR / VTT 종단', description: '고속 메모리 버스는 VTT(=Vdd/2) 종단으로 반사 억제, 신호 무결성 확보.' } },
 'zener-regulator': {
  en: { title: 'Zener Shunt Regulator', description: 'Series resistor plus zener clamp: the simplest low-current regulator/clamp.' },
  ja: { title: 'ツェナーシャント安定化', description: '制限抵抗＋ツェナークランプ。最も簡単な小電流安定化/クランプ。' },
  ko: { title: '제너 병렬 정전압', description: '제한 저항 + 제너 다이오드 클램프. 가장 간단한 소전류 정전압/클램프.' } },
 'photodiode-tia': {
  en: { title: 'Photodiode TIA', description: 'Transimpedance amplifier turns tiny photodiode current into voltage; optical sensing/comms front end.' },
  ja: { title: 'フォトダイオード TIA（トランスインピーダンス）', description: 'フォトダイオードの微小電流を電圧に変換。光センシング/光通信のフロントエンド。' },
  ko: { title: '포토다이오드 TIA(트랜스임피던스)', description: '포토다이오드의 미세 전류를 전압으로 변환. 광 센싱/광통신 프런트엔드.' } },
 'instrumentation-amplifier': {
  en: { title: 'Instrumentation Amplifier (3-op-amp)', description: 'High input impedance and high CMRR for tiny differential sensor signals: bridges, thermocouples, shunts.' },
  ja: { title: '計装アンプ（3 オペアンプ INA）', description: '高入力インピーダンス・高 CMRR。ブリッジ、熱電対、シャントの微小差動信号を計測。' },
  ko: { title: '계측 증폭기(3-opamp INA)', description: '높은 입력 임피던스와 높은 CMRR. 브리지, 열전대, 션트의 미세 차동 신호 측정.' } },
 'prevent-leakage-fet': {
  en: { title: 'Dual-FET Leakage Blocking / Domain Isolation', description: 'Two-stage BSS138 open-drain buffer passes signals across voltage domains while blocking back-feed leakage (RTC/STBY domains).' },
  ja: { title: 'デュアル FET 逆流防止／ドメイン絶縁', description: '2 段 BSS138 オープンドレインバッファ。電圧ドメイン間で信号を伝えつつ逆流リークを防止（RTC/STBY 域で頻出）。' },
  ko: { title: '듀얼 FET 누설 방지 / 오픈드레인 도메인 분리', description: '2단 BSS138 NMOS 오픈드레인 버퍼. 전압 도메인 간 신호 전달과 역류 누설 방지(RTC/STBY 도메인에 흔함).' } },
 'bandgap-reference': {
  en: { title: 'Bandgap Reference', description: 'Adding CTAT VBE and PTAT delta-VBE yields a ~1.2V reference nearly independent of temperature.' },
  ja: { title: 'バンドギャップリファレンス', description: '負温度係数の VBE と正温度係数の ΔVBE を加算し、温度にほぼ依存しない約 1.2V の精密基準を生成。' },
  ko: { title: '밴드갭 기준 전압', description: '음의 온도계수 VBE와 양의 온도계수 ΔVBE를 더해 온도에 거의 무관한 약 1.2V 정밀 기준 생성.' } },
 'power-supervisor': {
  en: { title: 'Power Supervisor / Reset IC', description: 'Asserts /RESET when VCC drops below threshold and releases it after a delay, so the MCU starts only on a stable rail.' },
  ja: { title: '電源監視／リセット IC', description: 'VCC がしきい値を下回ると /RESET をアサートし、遅延後に解除。MCU を電源安定後にのみ起動させる。' },
  ko: { title: '전원 감시 / 리셋 IC', description: 'VCC가 문턱 아래로 떨어지면 /RESET을 어서트하고 지연 후 해제. MCU가 안정된 전원에서만 기동하도록 보장.' } },
 'rc-highpass': {
  en: { title: 'RC High-Pass Filter', description: 'First-order RC high-pass: blocks DC/low frequency, passes highs; AC coupling and DC blocking.' },
  ja: { title: 'RC ハイパスフィルタ', description: '一次 RC ハイパス：直流/低域を遮断し高域を通す。AC カップリング・直流カットに常用。' },
  ko: { title: 'RC 고역 통과 필터', description: '1차 RC 고역 통과: DC/저주파 차단, 고주파 통과. AC 커플링과 DC 차단에 상용.' } },
 'rc-delay': {
  en: { title: 'RC Time-Delay Circuit', description: 'Series R with C to ground: node rises exponentially with tau=RC; power-on delay, debounce, soft start.' },
  ja: { title: 'RC 遅延回路', description: '直列 R＋対地 C。ステップ入力後 τ=RC で指数上昇。パワーオン遅延/チャタリング除去/ソフトスタート。' },
  ko: { title: 'RC 시간 지연 회로', description: '직렬 R + 접지 C: 스텝 입력 후 τ=RC로 지수 상승. 전원 지연/디바운스/소프트 스타트.' } },
 'op-integrator': {
  en: { title: 'Op-Amp Integrator', description: 'Vin through R to inverting input, C in feedback: output integrates the input; waveform generation, control loops, delta-sigma.' },
  ja: { title: 'オペアンプ積分器', description: 'Vin→R→反転入力、C 帰還。出力は入力の時間積分。波形生成、制御ループ、ΔΣ に使用。' },
  ko: { title: '연산 증폭기 적분기', description: 'Vin→R→반전 입력, C 피드백: 출력은 입력의 시간 적분. 파형 생성, 제어 루프, ΔΣ에 사용.' } },
 'op-differentiator': {
  en: { title: 'Op-Amp Differentiator', description: 'Vin through C to inverting input, R in feedback: output differentiates the input; edge detection, PD control.' },
  ja: { title: 'オペアンプ微分器', description: 'Vin→C→反転入力、R 帰還。出力は入力の時間微分。エッジ検出、PD 制御に使用。' },
  ko: { title: '연산 증폭기 미분기', description: 'Vin→C→반전 입력, R 피드백: 출력은 입력의 시간 미분. 에지 검출, PD 제어에 사용.' } }
});

// ===== 付費分類卡（knowledge-paid.js）title+description en/ja/ko；詳情欄位為後續批次 =====
Object.assign(window.KNOWLEDGE_I18N, {
 // ---- 電子紙 E-Paper ----
 'epd-driver-waveform': {
  en: { title: 'E-Paper Driving & Waveforms', description: 'Electrophoretic displays move charged pigment under an electric field. An update is not a "write" but a train of voltage pulses that push particles into place - that train is the waveform.' },
  ja: { title: '電子ペーパー駆動と波形', description: '電気泳動ディスプレイは帯電粒子を電界で移動させる。更新は「書き込み」ではなく粒子を所定位置へ押す電圧パルス列＝ waveform。' },
  ko: { title: '전자종이 구동과 파형', description: '전기영동 디스플레이는 대전 입자를 전기장으로 이동시킨다. 화면 갱신은 "쓰기"가 아니라 입자를 밀어 넣는 전압 펄스열 = 파형.' } },
 'epd-power-rails': {
  en: { title: 'E-Paper Power Rails (VGH/VGL/VCOM)', description: 'EPD needs positive and negative high voltages to push particles: gate rails (VGH/VGL), source rails (VPOS/VNEG, ~+/-15V) and VCOM - usually generated by charge pumps from a single battery.' },
  ja: { title: '電子ペーパー多レール電源（VGH/VGL/VCOM）', description: 'EPD は粒子駆動に正負高電圧が必要：ゲート（VGH/VGL）、ソース（VPOS/VNEG ±15V 級）、VCOM。単一電池からチャージポンプで生成。' },
  ko: { title: '전자종이 다중 레일 전원(VGH/VGL/VCOM)', description: 'EPD는 입자 구동에 정/부 고전압 필요: 게이트(VGH/VGL), 소스(VPOS/VNEG ±15V급), VCOM. 단일 전지에서 차지 펌프로 생성.' } },
 'epd-tcon': {
  en: { title: 'E-Paper TCON & Interface Timing', description: 'The timing controller turns host image data into scan timing for source/gate drivers. Small panels use SPI; large ones use parallel or dedicated interfaces.' },
  ja: { title: '電子ペーパー TCON とインターフェースタイミング', description: 'TCON はホスト画像をソース/ゲート駆動の走査タイミングに変換。小型は SPI、大型は並列/専用インターフェース。' },
  ko: { title: '전자종이 TCON과 인터페이스 타이밍', description: 'TCON은 호스트 이미지를 소스/게이트 구동 스캔 타이밍으로 변환. 소형은 SPI, 대형은 병렬/전용 인터페이스.' } },
 'epd-partial-refresh': {
  en: { title: 'Partial vs Full Refresh & Ghosting', description: 'EPD updates come in full refresh (whole screen flashes to clear particles) and partial (only changed area, no flash). Partial is fast but accumulates ghosting, cleared by periodic full refresh.' },
  ja: { title: '部分更新 vs 全更新とゴースト', description: 'EPD 更新は全更新（全画面が点滅し粒子をクリア）と部分更新（変化部のみ・点滅なし）。部分は速いがゴースト蓄積、定期全更新で解消。' },
  ko: { title: '부분 갱신 vs 전체 갱신과 잔상', description: 'EPD 갱신은 전체 갱신(화면 전체가 깜빡여 입자 정리)과 부분 갱신(변화 영역만, 깜빡임 없음). 부분은 빠르나 잔상 누적, 주기적 전체 갱신으로 제거.' } },
 'epd-temp-comp': {
  en: { title: 'E-Paper Temperature Compensation', description: 'EPD colors depend on particle migration, and fluid viscosity changes with temperature - cold means slower particles. The same image needs different waveforms at 0C and 40C.' },
  ja: { title: '電子ペーパー温度補償', description: 'EPD は液中粒子移動で発色し、液の粘度は温度で変化——冷えると遅い。同じ画像でも 0℃ と 40℃ で異なる waveform が必要。' },
  ko: { title: '전자종이 온도 보상', description: 'EPD는 액 중 입자 이동으로 발색하고 액 점도는 온도에 따라 변함 - 추우면 느림. 같은 이미지도 0℃와 40℃에서 다른 파형 필요.' } },
 // ---- 智慧手錶 Smartwatch ----
 'wearable-pmu': {
  en: { title: 'Wearable PMU: Ultra-Low-Power Rails', description: 'A watch battery is tiny (tens to hundreds of mAh) but must last a day-plus. An integrated PMU uses efficient DC-DCs and LDOs per domain and drives standby current down to microamps.' },
  ja: { title: 'ウェアラブル PMU 超低消費電源', description: '時計の電池は小さい（数十〜数百 mAh）が一日以上持たせる。統合 PMU が各ドメインに高効率 DC-DC/LDO を配し待機電流を µA 級に。' },
  ko: { title: '웨어러블 PMU 초저전력 전원', description: '시계 배터리는 작지만(수십~수백 mAh) 하루 이상 버텨야 함. 통합 PMU가 도메인별 고효율 DC-DC/LDO로 대기 전류를 µA급으로.' } },
 'ppg-afe': {
  en: { title: 'Heart-Rate Optical Front-End (PPG AFE)', description: 'PPG shines a green LED into skin and reads reflected light with a photodiode; blood flow modulates reflection into heart rate. A dedicated AFE digs the faint signal out of ambient light and motion.' },
  ja: { title: '心拍光学フロントエンド PPG AFE', description: 'PPG は緑 LED を皮膚に照射しフォトダイオードで反射光を読む。血流が反射を変調し心拍に。専用 AFE が環境光と動きに埋もれた微弱信号を抽出。' },
  ko: { title: '심박 광학 프런트엔드 PPG AFE', description: 'PPG는 녹색 LED를 피부에 비추고 포토다이오드로 반사광을 읽음; 혈류가 반사를 변조해 심박으로. 전용 AFE가 주변광과 동작에 묻힌 미약 신호를 추출.' } },
 'wearable-amoled': {
  en: { title: 'Wearable AMOLED Power & Always-On', description: 'Small watch AMOLED is self-emissive per pixel - black draws no power. It needs positive/negative rails (ELVDD/ELVSS); Always-On Display keeps low brightness and low refresh to save power.' },
  ja: { title: 'ウェアラブル AMOLED 電源と常時表示', description: '小型 AMOLED は画素自発光で黒＝無電力。正負レール（ELVDD/ELVSS）が必要。Always-On は低輝度・低更新で省電力。' },
  ko: { title: '웨어러블 AMOLED 전원과 상시 표시', description: '소형 AMOLED는 픽셀 자발광, 검정=무전력. 정/부 레일(ELVDD/ELVSS) 필요. AOD는 저휘도·저갱신으로 절전.' } },
 'wearable-qi-rx': {
  en: { title: 'Wearable Wireless Charging (Qi RX)', description: 'Watches charge wirelessly (waterproof, contactless). A receive coil picks up the charger field, rectifies and charges. Coil coupling and heat are the hard parts in a tiny body.' },
  ja: { title: 'ウェアラブル無線充電（Qi RX）', description: '時計は無線充電が主流（防水・無接点）。受電コイルが充電器の磁界を拾い整流・充電。小型ゆえコイル結合と放熱が難所。' },
  ko: { title: '웨어러블 무선 충전(Qi RX)', description: '시계는 무선 충전 주류(방수·무접점). 수신 코일이 충전기 자기장을 받아 정류·충전. 작은 크기라 코일 결합과 발열이 난제.' } },
 'wearable-lowpower': {
  en: { title: 'Wearable Ultra-Low-Power System Design', description: 'Watch battery life is about minimizing average current: deep sleep most of the time (uA), very low duty cycle for sensors and radio, event-driven rather than polling.' },
  ja: { title: 'ウェアラブル超低消費システム設計', description: '時計の電池寿命は平均電流の最小化：大半は深いスリープ（µA）、センサ/無線は極低デューティ、ポーリングでなくイベント駆動。' },
  ko: { title: '웨어러블 초저전력 시스템 설계', description: '시계 배터리 수명은 평균 전류 최소화: 대부분 딥 슬립(µA), 센서/무선은 극저 듀티, 폴링 대신 이벤트 구동.' } },
 // ---- 手機 Mobile ----
 'mobile-pmic': {
  en: { title: 'Mobile PMIC: Many Rails Integrated', description: 'A phone SoC needs dozens of rails (big/little cores, GPU, DDR, RF, sensors). The PMIC turns battery voltage into all of them and lets the SoC change voltages live over I2C/SPMI.' },
  ja: { title: 'モバイル PMIC 多レール統合', description: 'スマホ SoC は数十のレール（大小コア、GPU、DDR、RF、センサ）が必要。PMIC が電池から全レールを生成し SoC が I2C/SPMI で動的に電圧変更。' },
  ko: { title: '모바일 PMIC 다중 레일 통합', description: '스마트폰 SoC는 수십 개 레일(대/소 코어, GPU, DDR, RF, 센서) 필요. PMIC가 배터리에서 전부 생성하고 SoC가 I2C/SPMI로 실시간 전압 조정.' } },
 'usb-pd-fastcharge': {
  en: { title: 'USB-PD / PPS Fast Charging', description: 'USB-PD lets charger and phone negotiate voltage/current (up to 240W). PPS trims voltage in 20mV steps so the charger outputs what the battery wants (direct charge), cutting in-phone step-down heat.' },
  ja: { title: 'USB-PD / PPS 急速充電', description: 'USB-PD は充電器とスマホで電圧/電流を交渉（最大 240W）。PPS は 20mV 刻みで電圧微調し、電池が欲しい電圧を直接出力（直充）、端末内降圧の発熱を削減。' },
  ko: { title: 'USB-PD / PPS 고속 충전', description: 'USB-PD는 충전기와 폰이 전압/전류 협상(최대 240W). PPS는 20mV 단위로 전압을 미세 조정해 배터리가 원하는 전압을 직접 출력(직충), 폰 내부 강압 발열 감소.' } },
 'fuel-gauge': {
  en: { title: 'Battery Fuel Gauge', description: 'Estimating remaining charge (SOC) is hard: voltage is nonlinear and shifts with load, temperature and aging. A fuel gauge fuses coulomb counting with a voltage model.' },
  ja: { title: '電池残量計（フューエルゲージ）', description: '残量（SOC）推定は難しい：電圧は非線形で負荷/温度/劣化で変わる。フューエルゲージはクーロン計数と電圧モデルを融合。' },
  ko: { title: '배터리 잔량계(연료 게이지)', description: '잔량(SOC) 추정은 어려움: 전압은 비선형이고 부하/온도/노화로 변함. 연료 게이지는 쿨롱 카운팅과 전압 모델을 융합.' } },
 'haptics-driver': {
  en: { title: 'Haptic Feedback Driver (LRA / ERM)', description: 'Phone haptics use an LRA (linear resonant actuator) or ERM (eccentric motor). LRAs feel crisp but must be driven at resonance and braked to start/stop fast.' },
  ja: { title: '触覚フィードバック駆動（LRA / ERM）', description: 'スマホの触覚は LRA（線形共振アクチュエータ）か ERM（偏心モータ）。LRA は繊細だが共振周波数駆動とブレーキで速い起停が必要。' },
  ko: { title: '햅틱 피드백 구동(LRA / ERM)', description: '폰 햅틱은 LRA(선형 공진 액추에이터)나 ERM(편심 모터). LRA는 섬세하나 공진 주파수 구동과 브레이크로 빠른 기동/정지 필요.' } },
 'rf-frontend': {
  en: { title: 'RF Front-End (PA / LNA / Switch / Antenna Tuning)', description: 'The very front of a phone radio: a PA drives the transmit signal, an LNA amplifies the tiny receive signal, switches select TX/RX and bands, and an antenna tuner compensates hand/detuning.' },
  ja: { title: 'RF フロントエンド（PA / LNA / スイッチ / アンテナ整合）', description: 'スマホ無線の最前段：PA が送信を増幅、LNA が微弱な受信を増幅、スイッチが送受/バンド切替、アンテナチューナが手持ち失整合を補償。' },
  ko: { title: 'RF 프런트엔드(PA / LNA / 스위치 / 안테나 튜닝)', description: '폰 무선의 최전단: PA가 송신 증폭, LNA가 미약한 수신 증폭, 스위치가 송수신/대역 전환, 안테나 튜너가 손 파지 실정합 보상.' } },
 // ---- 車用電子 Automotive ----
 'auto-load-dump': {
  en: { title: 'Automotive Load Dump & ISO 7637 Transients', description: 'The car power environment is harsh: load dump (alternator dumping load spikes to ~40V+), cold-crank sag, various pulses. ISO 7637/16750 define these; automotive parts must survive them.' },
  ja: { title: '車載ロードダンプと ISO 7637 過渡', description: '車の電源環境は過酷：ロードダンプ（オルタネータの負荷切離しで ~40V+ に急騰）、コールドクランク低下、各種パルス。ISO 7637/16750 が規定、車載部品は耐える必要。' },
  ko: { title: '차량용 로드 덤프와 ISO 7637 과도', description: '차량 전원 환경은 가혹: 로드 덤프(발전기 부하 차단 시 ~40V+ 급등), 콜드 크랭크 강하, 각종 펄스. ISO 7637/16750이 규정, 차량용 부품은 견뎌야 함.' } },
 'reverse-battery-auto': {
  en: { title: 'Automotive Reverse-Battery Protection', description: 'Connecting a car battery backwards is a common mistake. Instead of a lossy series diode, automotive uses MOSFET ideal diodes or back-to-back FETs - low loss and reverse blocking.' },
  ja: { title: '車載逆接続保護（理想ダイオード / 背中合わせ FET）', description: '車の電池逆接続はよくある人為ミス。損失の大きい直列ダイオードでなく MOSFET 理想ダイオードや背中合わせ FET を使い、低損失かつ逆阻止。' },
  ko: { title: '차량용 역접속 보호(이상 다이오드 / 백투백 FET)', description: '차 배터리 역접속은 흔한 실수. 손실 큰 직렬 다이오드 대신 MOSFET 이상 다이오드나 백투백 FET로 저손실+역차단.' } },
 'can-fd-automotive': {
  en: { title: 'CAN-FD / LIN Automotive Networks', description: 'In-car ECUs talk over CAN/CAN-FD (high-speed control net) and LIN (low-cost subnet): differential buses, 120-ohm termination at both ends, high demands on EMC and fault tolerance.' },
  ja: { title: 'CAN-FD / LIN 車載ネットワーク', description: '車内 ECU は CAN/CAN-FD（高速制御網）と LIN（低コスト副網）で通信：差動バス、両端 120Ω 終端、EMC と故障耐性の要求が高い。' },
  ko: { title: 'CAN-FD / LIN 차량용 네트워크', description: '차내 ECU는 CAN/CAN-FD(고속 제어망)와 LIN(저비용 서브넷)으로 통신: 차동 버스, 양단 120Ω 종단, EMC와 결함 허용 요구 높음.' } },
 'auto-power-arch': {
  en: { title: 'Automotive Power Architecture (Pre-Regulator / Cold Crank)', description: 'The 12V (or 48V) bus is dirty and swings: cold-crank down to 6V, load dump up to 40V. The architecture uses a pre-regulator to clean it, then multi-stage step-down per domain.' },
  ja: { title: '車載電源アーキテクチャ（前段レギュレータ / コールドクランク）', description: '12V（または 48V）バスは汚く変動：コールドクランクで 6V、ロードダンプで 40V。前段レギュレータで整えた後、各ドメインへ多段降圧。' },
  ko: { title: '차량용 전원 아키텍처(전단 레귤레이터 / 콜드 크랭크)', description: '12V(또는 48V) 버스는 지저분하고 요동: 콜드 크랭크 6V, 로드 덤프 40V. 전단 레귤레이터로 정리 후 도메인별 다단 강압.' } },
 'aec-q100': {
  en: { title: 'AEC-Q100 Automotive Qualification & Functional Safety', description: 'Automotive parts must pass AEC-Q reliability qualification (Q100 for ICs): wide temperature, long life, low failure rate. Safety-related systems also need ISO 26262 (ASIL levels).' },
  ja: { title: '車載認証 AEC-Q100 と機能安全', description: '車載部品は AEC-Q 信頼性認証（IC は Q100）に合格必須：広温度・長寿命・低故障率。安全関連は ISO 26262 機能安全（ASIL）も必要。' },
  ko: { title: '차량용 인증 AEC-Q100과 기능 안전', description: '차량용 부품은 AEC-Q 신뢰성 인증(IC는 Q100) 통과 필수: 넓은 온도, 긴 수명, 낮은 고장률. 안전 관련 시스템은 ISO 26262 기능 안전(ASIL)도 필요.' } },
 // ---- AI 伺服器 AI Server ----
 'vrm-multiphase': {
  en: { title: 'Multiphase VRM Core Power', description: 'CPU/GPU cores need low voltage (~0.7-1V) at hundreds of amps. One buck cannot do it: a multiphase VRM interleaves parallel bucks to share current, with PMBus telemetry and dynamic voltage.' },
  ja: { title: 'マルチフェーズ VRM コア電源', description: 'CPU/GPU コアは低電圧（~0.7-1V）で数百 A が必要。単相 Buck では無理：マルチフェーズ VRM が並列 Buck を交錯し電流分担、PMBus 遥測と動的電圧付き。' },
  ko: { title: '멀티페이즈 VRM 코어 전원', description: 'CPU/GPU 코어는 저전압(~0.7-1V)에 수백 A 필요. 단상 벅으로는 불가: 멀티페이즈 VRM이 병렬 벅을 교차해 전류 분담, PMBus 텔레메트리와 동적 전압.' } },
 'server-48v-power': {
  en: { title: '48V Power Delivery (48V->12V->Core)', description: 'AI rack power exploded, so 12V buses lose too much to I2R. Moving to a 48V bus cuts current 4x and loss 16x, then steps down to the core. The mainstream route for dense GPU power.' },
  ja: { title: '48V 給電（48V→12V→コア）', description: 'AI ラック電力の急増で 12V バスは I2R 損失が大きすぎる。48V バスに移行し電流 1/4・損失 1/16、その後コアへ降圧。高密度 GPU 給電の主流。' },
  ko: { title: '48V 급전(48V→12V→코어)', description: 'AI 랙 전력 급증으로 12V 버스는 I2R 손실 과다. 48V 버스로 전환해 전류 1/4·손실 1/16, 이후 코어로 강압. 고밀도 GPU 급전의 주류.' } },
 'pmbus-telemetry': {
  en: { title: 'PMBus Power Telemetry & Management', description: 'PMBus is an I2C-based power protocol: the BMC reads each rail voltage/current/temperature/power, sets limits, controls on/off and voltage. The core of server power observability.' },
  ja: { title: 'PMBus 電源遥測と管理', description: 'PMBus は I2C ベースの電源プロトコル：BMC が各レールの電圧/電流/温度/電力を読み、閾値設定、オンオフ・電圧制御。サーバ電源可観測性の中核。' },
  ko: { title: 'PMBus 전원 텔레메트리와 관리', description: 'PMBus는 I2C 기반 전원 프로토콜: BMC가 각 레일 전압/전류/온도/전력을 읽고 한계 설정, 온오프·전압 제어. 서버 전원 관측성의 핵심.' } },
 'retimer-redriver': {
  en: { title: 'PCIe / High-Speed Retimer & Redriver', description: 'High-speed signals (PCIe Gen5/6, 112G SerDes) degrade over distance. A redriver equalizes; a retimer fully recovers clock and regenerates the signal. Key to server signal integrity.' },
  ja: { title: 'PCIe / 高速リタイマとリドライバ', description: '高速信号（PCIe Gen5/6、112G SerDes）は距離で劣化。リドライバは等化、リタイマはクロックを完全回復し信号を再生。サーバの信号品質の要。' },
  ko: { title: 'PCIe / 고속 리타이머와 리드라이버', description: '고속 신호(PCIe Gen5/6, 112G SerDes)는 거리에서 열화. 리드라이버는 등화, 리타이머는 클럭을 완전 복원해 신호 재생. 서버 신호 무결성의 핵심.' } },
 'hbm-power-decoupling': {
  en: { title: 'HBM Power & Decoupling', description: 'HBM sits beside the GPU on a 2.5D interposer, thousands of I/Os switching at once with huge transient current. Power and decoupling must be done at package/interposer level - PCB is too slow.' },
  ja: { title: 'HBM 電源とデカップリング', description: 'HBM は 2.5D インターポーザで GPU 隣に配置、数千 I/O が同時遷移し過渡電流が巨大。電源とデカップリングはパッケージ/インターポーザ層で——PCB 級では間に合わない。' },
  ko: { title: 'HBM 전원과 디커플링', description: 'HBM은 2.5D 인터포저로 GPU 옆에 배치, 수천 I/O가 동시 전환해 과도 전류 막대. 전원과 디커플링은 패키지/인터포저 레벨에서 - PCB 급은 늦음.' } },
 // ---- 筆電 Laptop ----
 'laptop-battery-charger': {
  en: { title: 'Laptop Battery Charging (Buck-Boost / Narrow VDC)', description: 'Laptop batteries are multi-cell (2-4S, 7-17V); input may be USB-C PD (5-20V) or an adapter. Input can sit above or below the battery, so the charger is buck-boost; NVDC lets it also feed the system.' },
  ja: { title: 'ノート PC 電池充電（Buck-Boost / Narrow VDC）', description: 'ノート電池は多セル（2-4S、7-17V）、入力は USB-C PD（5-20V）やアダプタ。入力は電池より上にも下にもなり得るため充電器は Buck-Boost、NVDC でシステム給電も兼ねる。' },
  ko: { title: '노트북 배터리 충전(Buck-Boost / Narrow VDC)', description: '노트북 배터리는 다중 셀(2-4S, 7-17V), 입력은 USB-C PD(5-20V)나 어댑터. 입력이 배터리보다 높거나 낮을 수 있어 충전기는 벅-부스트, NVDC로 시스템 급전 겸용.' } },
 'usbc-pd-laptop': {
  en: { title: 'USB-C PD & Alt Mode (Laptop)', description: 'A laptop USB-C port does it all at once: power source/sink (dual-role PD), data (USB 3/4), video out (DP Alt Mode), even Thunderbolt - via a PD controller, CC logic and a mux.' },
  ja: { title: 'USB-C PD と Alt Mode（ノート PC）', description: 'ノートの USB-C は同時に多役：給電/受電（デュアルロール PD）、データ（USB 3/4）、映像出力（DP Alt Mode）、Thunderbolt まで——PD コントローラ、CC ロジック、Mux で実現。' },
  ko: { title: 'USB-C PD와 Alt Mode(노트북)', description: '노트북 USB-C 포트는 동시에 다역: 급전/수전(듀얼 롤 PD), 데이터(USB 3/4), 영상 출력(DP Alt Mode), 썬더볼트까지 - PD 컨트롤러, CC 로직, Mux로 구현.' } },
 'ec-controller': {
  en: { title: 'Laptop Embedded Controller (EC)', description: 'The EC is the laptop\'s "manager" MCU: power sequencing, battery charging, keyboard, fans/thermals, power button, wake, and coordinating with host and PD. It stays awake even when the system is off.' },
  ja: { title: 'ノート PC 組込みコントローラ（EC）', description: 'EC はノートの「総管理」小 MCU：電源シーケンス、電池充電、キーボード、ファン/熱、電源ボタン、ウェイク、ホスト/PD 連携。システム停止中も起きている。' },
  ko: { title: '노트북 임베디드 컨트롤러(EC)', description: 'EC는 노트북의 "총관리" 소형 MCU: 전원 시퀀스, 배터리 충전, 키보드, 팬/발열, 전원 버튼, 웨이크, 호스트/PD 협조. 시스템 꺼져도 깨어 있음.' } },
 'laptop-backlight': {
  en: { title: 'Laptop Backlight & Panel Power (eDP)', description: 'Laptop panels run eDP: they need panel power (TCON/source drivers) plus backlight. LED backlight uses a boost constant-current driver with PWM/analog dimming; OLED pixels self-emit with their own rails.' },
  ja: { title: 'ノート PC バックライトとパネル電源（eDP）', description: 'ノートパネルは eDP：パネル電源（TCON/ソース駆動）とバックライトが必要。LED バックライトは昇圧定電流駆動＋PWM/アナログ調光、OLED は画素自発光で専用レール。' },
  ko: { title: '노트북 백라이트와 패널 전원(eDP)', description: '노트북 패널은 eDP: 패널 전원(TCON/소스 구동)과 백라이트 필요. LED 백라이트는 승압 정전류 구동+PWM/아날로그 조광, OLED는 픽셀 자발광에 전용 레일.' } },
 'laptop-power-seq': {
  en: { title: 'Laptop Power Sequencing & Domains', description: 'A laptop\'s dozens of rails power up in strict order (S0/S3/S5 domains). The EC and PCH handshake step by step over sideband signals; wrong order fails to boot or damages parts.' },
  ja: { title: 'ノート PC 電源シーケンスと電源ドメイン', description: 'ノートの数十レールは厳密な順序で投入（S0/S3/S5 ドメイン）。EC と PCH がサイドバンド信号で段階的にハンドシェイク、順序を誤ると起動失敗や破損。' },
  ko: { title: '노트북 전원 시퀀싱과 전원 도메인', description: '노트북의 수십 레일은 엄격한 순서로 인가(S0/S3/S5 도메인). EC와 PCH가 사이드밴드 신호로 단계별 핸드셰이크, 순서 오류 시 부팅 실패나 손상.' } }
});

// ---- 掛接：把 i18n 塞回 knowledgeApp.items（含 localStorage 舊快取卡；免 bump BUILTIN_VERSION）----
(function () {
  function apply() {
    if (typeof knowledgeApp === 'undefined' || !knowledgeApp.items || !knowledgeApp.items.length) return false;
    knowledgeApp.items.forEach(function (it) {
      var m = window.KNOWLEDGE_I18N[it.id];
      if (m) it.i18n = Object.assign({}, it.i18n, m);
    });
    return true;
  }
  if (!apply()) {
    document.addEventListener('DOMContentLoaded', function () {
      if (!apply()) { var n = 0, t = setInterval(function () { if (apply() || ++n > 20) clearInterval(t); }, 250); }
    });
  }
})();
