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
