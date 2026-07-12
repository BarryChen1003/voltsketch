/* ic-i18n-data.js — IC 條目內容翻譯資料（en/ja/ko 覆蓋層，分批 append）
 * 結構：IC_I18N[part][lang] = { subcategory?, whatIs, func, usedIn, desc?, thermalPad?, specs?[{k,v}全列], dropIn?[{note}同序] }
 * 純英文/技術符號欄位可省略（fallback zh 原值）。pins desc 不譯。
 */
(function () {
  var T = {
    'ADS112C14': {
      en: {
        whatIs: 'Precision analog-to-digital converter (ADC): converts analog voltage into 16- or 24-bit digital values, I2C interface, up to 8 inputs.',
        func: 'Digitizes tiny sensor signals at high resolution; integrates PGA, programmable reference, dual current sources and a temperature sensor to save external parts. Delta-Sigma architecture: oversamples far above the signal frequency, then noise-shapes quantization noise into the high band and filters it out, trading speed for very high resolution — ideal for slow-but-accurate measurements (temperature, bridges, pressure).',
        usedIn: 'Industrial sensor front ends (RTD/thermocouple, pressure/strain bridges, flow), PLC/DCS analog input modules, thermostats, patient monitoring (temperature/blood pressure).',
        desc: '16/24-bit, 8-channel, 64kSPS ΔΣ ADC with PGA, programmable reference, dual current sources, temperature sensor and I2C; low-part-count sensor measurement front end.',
        specs: [
          { k: 'Resolution', v: '16-bit (ADS112C14) / 24-bit (ADS122C14)' },
          { k: 'Architecture', v: 'Delta-Sigma (ΔΣ)' },
          { k: 'Channels', v: '8-input MUX; differential/single-ended' },
          { k: 'Max sample rate', v: '64 kSPS (programmable 20SPS–64kSPS)' },
          { k: 'PGA gain', v: '0.5 – 256' },
          { k: 'Analog supply AVDD', v: '1.74 – 3.6 V' },
          { k: 'Digital supply DVDD', v: '1.65 – 3.6 V' },
          { k: 'Power', v: 'down to ~57 µA' },
          { k: 'Internal reference', v: '1.25 / 2.5 V, 25 ppm/°C (max)' },
          { k: 'Interface', v: 'I2C (Sm/Fm/Fm+), 8 programmable addresses per pin' },
          { k: 'Integrated', v: 'Temp sensor, 1% oscillator, dual matched current sources, 4× GPIO, CRC' },
          { k: 'Line rejection', v: 'Simultaneous 50/60 Hz at 20/25 SPS, single-cycle settling' },
          { k: 'Temp range', v: 'Specified −40~+125°C (Operating −50~+125°C)' },
          { k: 'Package', v: 'WQFN-16 (RTE) 3.0×3.0mm / DSBGA-16 (YBH)' }
        ],
        dropIn: [{ note: 'Same RTE WQFN-16, identical pinout (24-bit version)' }]
      },
      ja: {
        subcategory: '高精度 ADC（Delta-Sigma、I2C）',
        whatIs: '高精度 A/D コンバータ（ADC）：アナログ電圧を 16/24 ビットのデジタル値へ変換。I2C インタフェース、最大 8 入力。',
        func: 'センサの微小アナログ信号を高分解能でデジタル化。PGA・プログラマブル基準・デュアル電流源・温度センサを内蔵し外付け部品を削減。アーキテクチャは Delta-Sigma（ΔΣ）：信号周波数よりはるかに高速でオーバーサンプリングし、ノイズシェーピングで量子化ノイズを高域へ押し出して除去、速度と引き換えに極めて高い分解能を得る——「低速だが高精度」の計測（温度・ブリッジ・圧力）に最適。',
        usedIn: '産業用センサフロントエンド（RTD/熱電対、圧力/ひずみブリッジ、流量）、PLC/DCS アナログ入力モジュール、温度調節器、患者モニタ（体温/血圧）。',
        desc: '16/24-bit・8ch・64kSPS ΔΣ ADC。PGA・プログラマブル基準・デュアル電流源・温度センサ・I2C 内蔵；少部品のセンサ計測フロントエンド。',
        specs: [
          { k: '分解能', v: '16-bit (ADS112C14) / 24-bit (ADS122C14)' },
          { k: 'アーキテクチャ', v: 'Delta-Sigma (ΔΣ)' },
          { k: 'チャネル', v: '8 入力 MUX；差動/シングルエンド' },
          { k: '最大サンプルレート', v: '64 kSPS（20SPS~64kSPS 可変）' },
          { k: 'PGA ゲイン', v: '0.5 ~ 256' },
          { k: 'アナログ電源 AVDD', v: '1.74 ~ 3.6 V' },
          { k: 'デジタル電源 DVDD', v: '1.65 ~ 3.6 V' },
          { k: '消費電力', v: '最小 ~57 µA' },
          { k: '内部基準', v: '1.25 / 2.5 V、25 ppm/°C (max)' },
          { k: 'インタフェース', v: 'I2C（Sm/Fm/Fm+）、ピンで 8 アドレス設定可' },
          { k: '内蔵機能', v: '温度センサ、1% 発振器、デュアル整合電流源、4× GPIO、CRC' },
          { k: '商用周波除去', v: '20/25 SPS で 50/60 Hz 同時除去、1 サイクル整定' },
          { k: '動作温度', v: 'Specified −40~+125°C（Operating −50~+125°C）' },
          { k: 'パッケージ', v: 'WQFN-16 (RTE) 3.0×3.0mm / DSBGA-16 (YBH)' }
        ],
        dropIn: [{ note: '同一 RTE WQFN-16・ピン配置完全互換（24-bit 版）' }]
      },
      ko: {
        subcategory: '정밀 ADC(Delta-Sigma, I2C)',
        whatIs: '정밀 아날로그-디지털 변환기(ADC): 아날로그 전압을 16/24비트 디지털 값으로 변환. I2C 인터페이스, 최대 8입력.',
        func: '센서의 미소 아날로그 신호를 고분해능으로 디지털화. PGA·프로그래머블 기준·듀얼 전류원·온도 센서를 내장해 외부 부품 절감. 아키텍처는 Delta-Sigma(ΔΣ): 신호 주파수보다 훨씬 빠르게 오버샘플링한 뒤 노이즈 셰이핑으로 양자화 잡음을 고역으로 밀어 제거, 속도와 맞바꿔 극히 높은 분해능 획득 - "느리지만 정확한" 계측(온도·브리지·압력)에 최적.',
        usedIn: '산업 센서 프론트엔드(RTD/열전대, 압력/스트레인 브리지, 유량), PLC/DCS 아날로그 입력 모듈, 온도조절기, 환자 모니터링(체온/혈압).',
        desc: '16/24-bit·8채널·64kSPS ΔΣ ADC. PGA·프로그래머블 기준·듀얼 전류원·온도 센서·I2C 내장; 부품 수 적은 센서 계측 프론트엔드.',
        specs: [
          { k: '분해능', v: '16-bit (ADS112C14) / 24-bit (ADS122C14)' },
          { k: '아키텍처', v: 'Delta-Sigma (ΔΣ)' },
          { k: '채널', v: '8입력 MUX; 차동/싱글엔드' },
          { k: '최대 샘플링', v: '64 kSPS(20SPS~64kSPS 가변)' },
          { k: 'PGA 이득', v: '0.5 ~ 256' },
          { k: '아날로그 전원 AVDD', v: '1.74 ~ 3.6 V' },
          { k: '디지털 전원 DVDD', v: '1.65 ~ 3.6 V' },
          { k: '소비 전력', v: '최소 ~57 µA' },
          { k: '내부 기준', v: '1.25 / 2.5 V, 25 ppm/°C (max)' },
          { k: '인터페이스', v: 'I2C(Sm/Fm/Fm+), 핀으로 8개 주소 설정' },
          { k: '내장 기능', v: '온도 센서, 1% 발진기, 듀얼 정합 전류원, 4× GPIO, CRC' },
          { k: '전원 주파수 제거', v: '20/25 SPS에서 50/60 Hz 동시 제거, 1사이클 정착' },
          { k: '동작 온도', v: 'Specified −40~+125°C(Operating −50~+125°C)' },
          { k: '패키지', v: 'WQFN-16 (RTE) 3.0×3.0mm / DSBGA-16 (YBH)' }
        ],
        dropIn: [{ note: '동일 RTE WQFN-16·핀 배치 완전 호환(24-bit 버전)' }]
      }
    },
    'ISO7741U': {
      en: {
        subcategory: 'Quad digital isolator (3 forward / 1 reverse)',
        whatIs: 'Quad-channel digital isolator: passes digital signals between two electrically independent power domains across an SiO2 insulation barrier (non-conductive yet signal-transparent).',
        func: 'Fully isolates the low-voltage control side (MCU) from the high-voltage/noisy side while passing digital signals (3 forward + 1 reverse channels). Blocks ground loops, surges and common-mode transients from damaging the MCU; fast (50Mbps) with strong CMTI. Not an ADC/DAC — an electrical firewall for digital signals.',
        usedIn: 'Isolated power-supply feedback, motor/gate-driver isolation, industrial comms (RS-485/CAN/SPI) isolation, medical equipment, battery management systems (BMS).',
        desc: 'Quad-channel (3F/1R) digital isolator, SiO2 barrier, 50Mbps, 1500VRMS isolation, CMTI ±100kV/µs.',
        specs: [
          { k: 'Function', v: 'Quad digital isolator (3 forward + 1 reverse)' },
          { k: 'Isolation barrier', v: 'SiO2; 1500 VRMS / 2121 VDC working voltage' },
          { k: 'Surge immunity', v: 'up to 12.8 kV' },
          { k: 'CMTI', v: '±100 kV/µs (min)' },
          { k: 'Data rate', v: 'up to 50 Mbps' },
          { k: 'Propagation delay', v: '13 ns (typ @5V)' },
          { k: 'Supply range', v: '2.25 – 5.5 V (independent per side)' },
          { k: 'Default output', v: 'ISO7741U default high; ISO7741UF default low' },
          { k: 'Temp range', v: '−40 – +125°C' },
          { k: 'Package', v: 'SOP (DUW-16) Ultra-Wide' }
        ]
      },
      ja: {
        subcategory: '4ch デジタルアイソレータ（順方向 3 / 逆方向 1）',
        whatIs: '4 チャネルデジタルアイソレータ：電気的に独立した 2 つの電源ドメイン間でデジタル信号を伝達。SiO2 絶縁層で遮断（非導電だが信号は通す）。',
        func: '低圧制御側（MCU）と高圧/高ノイズ側を電気的に完全分離しつつデジタル信号を相互伝達（順 3ch＋逆 1ch）。グランドループ・サージ・コモンモード過渡から MCU を保護；高速（50Mbps）・高 CMTI。ADC/DAC ではなく「デジタル信号の電気的ファイアウォール」。',
        usedIn: '絶縁電源フィードバック、モータ/ゲートドライバ絶縁、産業通信（RS-485/CAN/SPI）絶縁、医療機器、バッテリ管理システム（BMS）。',
        desc: '4ch（3F/1R）デジタルアイソレータ。SiO2 バリア、50Mbps、1500VRMS 絶縁、CMTI ±100kV/µs。',
        specs: [
          { k: '機能', v: '4ch デジタルアイソレータ（順 3＋逆 1）' },
          { k: '絶縁バリア', v: 'SiO2；1500 VRMS / 2121 VDC 動作電圧' },
          { k: 'サージ耐量', v: '最大 12.8 kV' },
          { k: 'CMTI', v: '±100 kV/µs (min)' },
          { k: 'データレート', v: '最大 50 Mbps' },
          { k: '伝搬遅延', v: '13 ns (typ @5V)' },
          { k: '電源範囲', v: '2.25 ~ 5.5 V（両側独立）' },
          { k: 'デフォルト出力', v: 'ISO7741U はハイ；ISO7741UF はロー' },
          { k: '動作温度', v: '−40 ~ +125°C' },
          { k: 'パッケージ', v: 'SOP (DUW-16) Ultra-Wide' }
        ]
      },
      ko: {
        subcategory: '4채널 디지털 아이솔레이터(순방향 3 / 역방향 1)',
        whatIs: '4채널 디지털 아이솔레이터: 전기적으로 독립한 두 전원 도메인 사이에서 디지털 신호를 전달. SiO2 절연층으로 차단(비도전이지만 신호는 통과).',
        func: '저압 제어 측(MCU)과 고압/고잡음 측을 전기적으로 완전 분리하면서 디지털 신호를 상호 전달(순방향 3ch+역방향 1ch). 접지 루프·서지·공통 모드 과도로부터 MCU 보호; 고속(50Mbps)·강한 CMTI. ADC/DAC가 아니라 "디지털 신호의 전기 방화벽".',
        usedIn: '절연 전원 피드백, 모터/게이트 드라이버 절연, 산업 통신(RS-485/CAN/SPI) 절연, 의료기기, 배터리 관리 시스템(BMS).',
        desc: '4채널(3F/1R) 디지털 아이솔레이터. SiO2 배리어, 50Mbps, 1500VRMS 절연, CMTI ±100kV/µs.',
        specs: [
          { k: '기능', v: '4채널 디지털 아이솔레이터(순 3+역 1)' },
          { k: '절연 배리어', v: 'SiO2; 1500 VRMS / 2121 VDC 동작 전압' },
          { k: '서지 내량', v: '최대 12.8 kV' },
          { k: 'CMTI', v: '±100 kV/µs (min)' },
          { k: '데이터 속도', v: '최대 50 Mbps' },
          { k: '전파 지연', v: '13 ns (typ @5V)' },
          { k: '전원 범위', v: '2.25 ~ 5.5 V(양측 독립)' },
          { k: '기본 출력', v: 'ISO7741U 기본 하이; ISO7741UF 기본 로우' },
          { k: '동작 온도', v: '−40 ~ +125°C' },
          { k: '패키지', v: 'SOP (DUW-16) Ultra-Wide' }
        ]
      }
    },
    'AMC0200D': {
      en: {
        subcategory: 'Isolated amplifier (fixed gain, differential output)',
        whatIs: 'Isolated amplifier: amplifies a small analog signal on the high-voltage side (±250mV, e.g. the drop across a current shunt) and carries it across an electrical isolation barrier to the low-voltage side, with fully separate supplies.',
        func: 'For measuring current/voltage on a high-voltage bus: a shunt develops ±250mV, which the AMC0200D amplifies at a fixed 8.2V/V gain into a differential output while providing basic isolation (AMC0300D is the reinforced version). Lets a low-voltage ADC/MCU read high-side signals safely. Low offset, low drift, high CMTI (150V/ns).',
        usedIn: 'Motor-drive phase-current sensing, inverters/VFDs, power-supply current/voltage sensing, isolated voltage measurement.',
        desc: '±250mV input, fixed 8.2V/V gain, differential-output basic/reinforced isolated amplifier (SOIC-8).',
        specs: [
          { k: 'Function', v: 'Fixed-gain isolated amplifier, differential output' },
          { k: 'Input range', v: '±250 mV (linear)' },
          { k: 'Fixed gain', v: '8.2 V/V' },
          { k: 'Isolation', v: 'AMC0200D basic / AMC0300D reinforced' },
          { k: 'Supply', v: 'VDD1 / VDD2 each 3.0 – 5.5 V' },
          { k: 'Offset error', v: '±0.2 mV (max), drift ±2 µV/°C' },
          { k: 'Gain error', v: '±0.25% (max), drift ±35 ppm/°C' },
          { k: 'Nonlinearity', v: '0.04% (max)' },
          { k: 'CMTI', v: '150 V/ns (min)' },
          { k: 'EMI', v: 'meets CISPR-11 / CISPR-25' },
          { k: 'Package', v: 'SOIC-8 (D)' }
        ],
        dropIn: [{ note: 'Same family, same SOIC-8 pinout; reinforced-isolation version (upgrade path, identical function/pinout)' }]
      },
      ja: {
        subcategory: '絶縁アンプ（固定ゲイン・差動出力）',
        whatIs: '絶縁アンプ：高圧側の微小アナログ信号（±250mV、例：シャント抵抗の電圧降下）を増幅し「電気的絶縁を跨いで」低圧側へ伝送。両側の電源は完全分離。',
        func: '高圧バスの電流/電圧計測：シャント抵抗で ±250mV を生成し、AMC0200D が固定 8.2V/V ゲインで差動出力へ増幅、同時に基本絶縁を提供（AMC0300D は強化絶縁）。低圧側の ADC/MCU が高圧側信号を安全に読める。低オフセット・低ドリフト・高 CMTI（150V/ns）。',
        usedIn: 'モータドライブ相電流検出、インバータ/VFD、電源の電流/電圧センシング、絶縁電圧計測。',
        desc: '±250mV 入力・固定ゲイン 8.2V/V・差動出力の基本/強化絶縁アンプ（SOIC-8）。',
        specs: [
          { k: '機能', v: '固定ゲイン絶縁アンプ・差動出力' },
          { k: '入力範囲', v: '±250 mV（線形）' },
          { k: '固定ゲイン', v: '8.2 V/V' },
          { k: '絶縁', v: 'AMC0200D 基本 / AMC0300D 強化' },
          { k: '電源', v: 'VDD1 / VDD2 各 3.0 ~ 5.5 V' },
          { k: 'オフセット誤差', v: '±0.2 mV (max)、ドリフト ±2 µV/°C' },
          { k: 'ゲイン誤差', v: '±0.25% (max)、ドリフト ±35 ppm/°C' },
          { k: '非直線性', v: '0.04% (max)' },
          { k: 'CMTI', v: '150 V/ns (min)' },
          { k: 'EMI', v: 'CISPR-11 / CISPR-25 適合' },
          { k: 'パッケージ', v: 'SOIC-8 (D)' }
        ],
        dropIn: [{ note: '同一シリーズ・同 SOIC-8 ピン配置；強化絶縁版（アップグレード用、機能/ピン配置同一）' }]
      },
      ko: {
        subcategory: '절연 앰프(고정 이득·차동 출력)',
        whatIs: '절연 앰프: 고압 측의 미소 아날로그 신호(±250mV, 예: 션트 저항의 전압 강하)를 증폭해 "전기 절연을 넘어" 저압 측으로 전송. 양측 전원 완전 분리.',
        func: '고압 버스의 전류/전압 계측: 션트 저항으로 ±250mV를 만들고 AMC0200D가 고정 8.2V/V 이득으로 차동 출력 증폭, 동시에 기본 절연 제공(AMC0300D는 강화 절연). 저압 ADC/MCU가 고압 측 신호를 안전하게 읽을 수 있음. 저 오프셋·저 드리프트·고 CMTI(150V/ns).',
        usedIn: '모터 드라이브 상전류 검출, 인버터/VFD, 전원 전류/전압 센싱, 절연 전압 계측.',
        desc: '±250mV 입력·고정 이득 8.2V/V·차동 출력의 기본/강화 절연 앰프(SOIC-8).',
        specs: [
          { k: '기능', v: '고정 이득 절연 앰프·차동 출력' },
          { k: '입력 범위', v: '±250 mV(선형)' },
          { k: '고정 이득', v: '8.2 V/V' },
          { k: '절연', v: 'AMC0200D 기본 / AMC0300D 강화' },
          { k: '전원', v: 'VDD1 / VDD2 각 3.0 ~ 5.5 V' },
          { k: '오프셋 오차', v: '±0.2 mV (max), 드리프트 ±2 µV/°C' },
          { k: '이득 오차', v: '±0.25% (max), 드리프트 ±35 ppm/°C' },
          { k: '비선형성', v: '0.04% (max)' },
          { k: 'CMTI', v: '150 V/ns (min)' },
          { k: 'EMI', v: 'CISPR-11 / CISPR-25 적합' },
          { k: '패키지', v: 'SOIC-8 (D)' }
        ],
        dropIn: [{ note: '동일 시리즈·동일 SOIC-8 핀 배치; 강화 절연판(업그레이드용, 기능/핀 배치 동일)' }]
      }
    },
    'AMC0200R': {
      en: {
        subcategory: 'Isolated amplifier (fixed gain, single-ended output + REFIN)',
        whatIs: 'Isolated amplifier (single-ended output version): amplifies a ±250mV analog signal on the high-voltage side and carries it across isolation; single-ended output whose reference level is set by REFIN.',
        func: 'Same use as AMC0200D (high-side current/voltage sensing) but with a single-ended output whose center level is set via REFIN — convenient for single-ended ADCs. Reinforced isolation.',
        usedIn: 'Motor phase-current sensing, supply current/voltage sensing, isolated measurements feeding single-ended ADCs.',
        desc: '±250mV input, fixed-gain, single-ended-output (with REFIN) reinforced isolated amplifier (SOIC-8).',
        specs: [
          { k: 'Function', v: 'Fixed-gain isolated amplifier, single-ended output + REFIN' },
          { k: 'Input range', v: '±250 mV' },
          { k: 'Fixed gain', v: 'see datasheet (exact value TBD)' },
          { k: 'Isolation', v: 'Reinforced' },
          { k: 'Supply', v: 'VDD1 / VDD2 each 3.0–5.5 V' },
          { k: 'Package', v: 'SOIC-8 (D)' }
        ]
      },
      ja: {
        subcategory: '絶縁アンプ（固定ゲイン・シングルエンド出力＋REFIN）',
        whatIs: '絶縁アンプ（シングルエンド出力版）：高圧側 ±250mV アナログ信号を増幅し絶縁を跨いで低圧側へ；出力はシングルエンドで、基準点は REFIN で設定。',
        func: 'AMC0200D と同用途（高圧側の電流/電圧計測）だが出力はシングルエンド。REFIN で出力センター電位を設定でき、シングルエンド ADC への接続が容易。強化絶縁。',
        usedIn: 'モータ相電流検出、電源電流/電圧センシング、シングルエンド ADC へ接続する絶縁計測。',
        desc: '±250mV 入力・固定ゲイン・シングルエンド出力（REFIN 付）の強化絶縁アンプ（SOIC-8）。',
        specs: [
          { k: '機能', v: '固定ゲイン絶縁アンプ・シングルエンド出力＋REFIN' },
          { k: '入力範囲', v: '±250 mV' },
          { k: '固定ゲイン', v: 'datasheet 参照（精値未確認）' },
          { k: '絶縁', v: '強化 (Reinforced)' },
          { k: '電源', v: 'VDD1 / VDD2 各 3.0~5.5 V' },
          { k: 'パッケージ', v: 'SOIC-8 (D)' }
        ]
      },
      ko: {
        subcategory: '절연 앰프(고정 이득·싱글엔드 출력+REFIN)',
        whatIs: '절연 앰프(싱글엔드 출력판): 고압 측 ±250mV 아날로그 신호를 증폭해 절연을 넘어 저압 측으로; 싱글엔드 출력이며 기준점은 REFIN으로 설정.',
        func: 'AMC0200D와 같은 용도(고압 측 전류/전압 계측)이나 출력이 싱글엔드. REFIN으로 출력 중심 전위를 설정할 수 있어 싱글엔드 ADC 연결이 편리. 강화 절연.',
        usedIn: '모터 상전류 검출, 전원 전류/전압 센싱, 싱글엔드 ADC에 연결하는 절연 계측.',
        desc: '±250mV 입력·고정 이득·싱글엔드 출력(REFIN 포함)의 강화 절연 앰프(SOIC-8).',
        specs: [
          { k: '기능', v: '고정 이득 절연 앰프·싱글엔드 출력+REFIN' },
          { k: '입력 범위', v: '±250 mV' },
          { k: '고정 이득', v: 'datasheet 참조(정확값 미확인)' },
          { k: '절연', v: '강화(Reinforced)' },
          { k: '전원', v: 'VDD1 / VDD2 각 3.0~5.5 V' },
          { k: '패키지', v: 'SOIC-8 (D)' }
        ]
      }
    },
    'AMC0202D': {
      en: {
        subcategory: 'Isolated amplifier (±50mV input, differential output)',
        whatIs: 'Isolated amplifier (±50mV input version): amplifies smaller shunt drops (suited to high currents with low-value shunts), differential output carried across isolation to the low-voltage side.',
        func: 'Pin-compatible with AMC0200D but with a ±50mV input range (pairs with smaller shunt resistors, cutting power dissipation and heat). Differential output, reinforced isolation.',
        usedIn: 'High-current motor-drive phase-current sensing, low-value-shunt current measurement, inverters.',
        desc: '±50mV input, fixed-gain, differential-output reinforced isolated amplifier (SOIC-8, same pinout as AMC0200D).',
        specs: [
          { k: 'Function', v: 'Fixed-gain isolated amplifier, differential output' },
          { k: 'Input range', v: '±50 mV' },
          { k: 'Fixed gain', v: 'see datasheet (exact value TBD)' },
          { k: 'Isolation', v: 'Reinforced' },
          { k: 'Supply', v: 'VDD1 / VDD2 each 3.0–5.5 V' },
          { k: 'Package', v: 'SOIC-8 (D)' }
        ]
      },
      ja: {
        subcategory: '絶縁アンプ（±50mV 入力・差動出力）',
        whatIs: '絶縁アンプ（±50mV 入力版）：より小さいシャント電圧降下を増幅（大電流・低抵抗シャント向き）。差動出力・絶縁を跨いで低圧側へ。',
        func: 'AMC0200D とピン互換だが入力範囲は ±50mV（より小さいシャント抵抗と組み合わせ、損失と発熱を低減）。差動出力・強化絶縁。',
        usedIn: '大電流モータドライブ相電流検出、低抵抗シャント電流計測、インバータ。',
        desc: '±50mV 入力・固定ゲイン・差動出力の強化絶縁アンプ（SOIC-8、AMC0200D とピン互換）。',
        specs: [
          { k: '機能', v: '固定ゲイン絶縁アンプ・差動出力' },
          { k: '入力範囲', v: '±50 mV' },
          { k: '固定ゲイン', v: 'datasheet 参照（精値未確認）' },
          { k: '絶縁', v: '強化 (Reinforced)' },
          { k: '電源', v: 'VDD1 / VDD2 各 3.0~5.5 V' },
          { k: 'パッケージ', v: 'SOIC-8 (D)' }
        ]
      },
      ko: {
        subcategory: '절연 앰프(±50mV 입력·차동 출력)',
        whatIs: '절연 앰프(±50mV 입력판): 더 작은 션트 전압 강하를 증폭(대전류·저저항 션트용). 차동 출력·절연을 넘어 저압 측으로.',
        func: 'AMC0200D와 핀 호환이나 입력 범위 ±50mV(더 작은 션트 저항과 조합해 손실·발열 저감). 차동 출력·강화 절연.',
        usedIn: '대전류 모터 드라이브 상전류 검출, 저저항 션트 전류 계측, 인버터.',
        desc: '±50mV 입력·고정 이득·차동 출력의 강화 절연 앰프(SOIC-8, AMC0200D와 핀 호환).',
        specs: [
          { k: '기능', v: '고정 이득 절연 앰프·차동 출력' },
          { k: '입력 범위', v: '±50 mV' },
          { k: '고정 이득', v: 'datasheet 참조(정확값 미확인)' },
          { k: '절연', v: '강화(Reinforced)' },
          { k: '전원', v: 'VDD1 / VDD2 각 3.0~5.5 V' },
          { k: '패키지', v: 'SOIC-8 (D)' }
        ]
      }
    },
    'AMC0306M05-Q1': {
      en: {
        subcategory: 'Isolated ΔΣ modulator (±50mV, automotive)',
        whatIs: "Isolated Delta-Sigma modulator: converts a ±50mV analog signal on the high-voltage side directly into a digital bitstream (DOUT) across the isolation barrier, synchronized by an external CLKIN clock; not an amplifier — it is 'isolation + ADC front end' in one.",
        func: 'High-side current/voltage measurement: shunt drop → internal ΔΣ modulation into a 1-bit stream sent across isolation, decoded by a sinc filter in the MCU/FPGA. Eliminates the analog isolated amplifier + external ADC. Automotive (Q1), reinforced isolation.',
        usedIn: 'Automotive/industrial motor-inverter phase-current sensing, isolated voltage measurement, isolated measurements needing digital output.',
        desc: '±50mV input, digital-bitstream-output (DOUT/CLKIN) automotive reinforced isolated ΔΣ modulator (SOIC-8).',
        specs: [
          { k: 'Function', v: 'Isolated ΔΣ modulator (digital bitstream output)' },
          { k: 'Input range', v: '±50 mV' },
          { k: 'Output', v: '1-bit ΔΣ bitstream DOUT (needs external CLKIN)' },
          { k: 'Isolation', v: 'Reinforced' },
          { k: 'Qualification', v: 'Automotive AEC-Q100 (Q1)' },
          { k: 'Supply', v: '3.0–5.5 V' },
          { k: 'Package', v: 'SOIC-8' }
        ]
      },
      ja: {
        subcategory: '絶縁 ΔΣ モジュレータ（±50mV・車載）',
        whatIs: '絶縁 Delta-Sigma モジュレータ：高圧側の ±50mV アナログ信号を直接「絶縁を跨ぐデジタルビットストリーム（DOUT）」へ変換、外部クロック CLKIN で同期。アンプではなく「絶縁＋ADC フロントエンド」の一体品。',
        func: '高圧側電流/電圧計測：シャント電圧降下→内部 ΔΣ 変調で 1-bit ストリーム化し絶縁を跨いで低圧側へ、MCU/FPGA の sinc フィルタで復調。アナログ絶縁アンプ＋外部 ADC を省略。車載（Q1）・強化絶縁。',
        usedIn: '車載/産業モータインバータ相電流検出、絶縁電圧計測、デジタル出力が必要な絶縁計測。',
        desc: '±50mV 入力・デジタルビットストリーム出力（DOUT/CLKIN）の車載強化絶縁 ΔΣ モジュレータ（SOIC-8）。',
        specs: [
          { k: '機能', v: '絶縁 ΔΣ モジュレータ（デジタルビットストリーム出力）' },
          { k: '入力範囲', v: '±50 mV' },
          { k: '出力', v: '1-bit ΔΣ ビットストリーム DOUT（外部 CLKIN 必須）' },
          { k: '絶縁', v: '強化 (Reinforced)' },
          { k: '認証', v: '車載 AEC-Q100 (Q1)' },
          { k: '電源', v: '3.0~5.5 V' },
          { k: 'パッケージ', v: 'SOIC-8' }
        ]
      },
      ko: {
        subcategory: '절연 ΔΣ 모듈레이터(±50mV·차량용)',
        whatIs: '절연 Delta-Sigma 모듈레이터: 고압 측 ±50mV 아날로그 신호를 직접 "절연을 넘는 디지털 비트스트림(DOUT)"으로 변환, 외부 클록 CLKIN 동기. 앰프가 아니라 "절연+ADC 프론트엔드" 일체형.',
        func: '고압 측 전류/전압 계측: 션트 전압 강하 → 내부 ΔΣ 변조로 1-bit 스트림화해 절연을 넘어 저압 측으로, MCU/FPGA의 sinc 필터로 복조. 아날로그 절연 앰프+외부 ADC 생략. 차량용(Q1)·강화 절연.',
        usedIn: '차량/산업 모터 인버터 상전류 검출, 절연 전압 계측, 디지털 출력이 필요한 절연 계측.',
        desc: '±50mV 입력·디지털 비트스트림 출력(DOUT/CLKIN)의 차량용 강화 절연 ΔΣ 모듈레이터(SOIC-8).',
        specs: [
          { k: '기능', v: '절연 ΔΣ 모듈레이터(디지털 비트스트림 출력)' },
          { k: '입력 범위', v: '±50 mV' },
          { k: '출력', v: '1-bit ΔΣ 비트스트림 DOUT(외부 CLKIN 필수)' },
          { k: '절연', v: '강화(Reinforced)' },
          { k: '인증', v: '차량용 AEC-Q100 (Q1)' },
          { k: '전원', v: '3.0~5.5 V' },
          { k: '패키지', v: 'SOIC-8' }
        ]
      }
    },
    'AMC1333M10-Q1': {
      en: {
        subcategory: 'Isolated ΔΣ modulator (±1V, internal clock, automotive)',
        whatIs: 'Isolated Delta-Sigma modulator (±1V input, internal-clock version): converts a ±1V high-side analog signal into a digital bitstream (DOUT) across isolation, and outputs its internal clock on CLKOUT for downstream synchronization.',
        func: 'Similar to the AMC0306 but with a larger ±1V input range (suited to voltage sensing or divided-down high voltage) and a built-in clock (CLKOUT actively drives; no external clock needed). Automotive, reinforced isolation.',
        usedIn: 'Automotive/industrial isolated voltage measurement, HV battery/inverter DC-link monitoring, self-clocked isolated ΔΣ measurement.',
        desc: '±1V input, internal-clock (CLKOUT), digital-bitstream-output automotive reinforced isolated ΔΣ modulator (SOIC-8).',
        specs: [
          { k: 'Function', v: 'Isolated ΔΣ modulator (internal clock, digital bitstream)' },
          { k: 'Input range', v: '±1 V' },
          { k: 'Output', v: 'DOUT bitstream + CLKOUT internal clock (no external clock)' },
          { k: 'Isolation', v: 'Reinforced' },
          { k: 'Qualification', v: 'Automotive AEC-Q100 (Q1)' },
          { k: 'Package', v: 'SOIC-8' }
        ]
      },
      ja: {
        subcategory: '絶縁 ΔΣ モジュレータ（±1V・内部クロック・車載）',
        whatIs: '絶縁 Delta-Sigma モジュレータ（±1V 入力・内部クロック版）：高圧側 ±1V アナログ信号を絶縁を跨ぐビットストリーム（DOUT）へ変換し、内部クロックを CLKOUT から後段へ出力。',
        func: 'AMC0306 類似だが入力範囲が大きい（±1V、電圧計測や高圧分圧後の入力向き）うえクロック内蔵（CLKOUT が能動出力、外部クロック不要）。車載・強化絶縁。',
        usedIn: '車載/産業の絶縁電圧計測、HV バッテリ/インバータ DC リンク電圧監視、クロック自給の絶縁 ΔΣ 計測。',
        desc: '±1V 入力・内部クロック（CLKOUT）・ビットストリーム出力の車載強化絶縁 ΔΣ モジュレータ（SOIC-8）。',
        specs: [
          { k: '機能', v: '絶縁 ΔΣ モジュレータ（内部クロック・ビットストリーム）' },
          { k: '入力範囲', v: '±1 V' },
          { k: '出力', v: 'DOUT ビットストリーム＋CLKOUT 内部クロック（外部クロック不要）' },
          { k: '絶縁', v: '強化 (Reinforced)' },
          { k: '認証', v: '車載 AEC-Q100 (Q1)' },
          { k: 'パッケージ', v: 'SOIC-8' }
        ]
      },
      ko: {
        subcategory: '절연 ΔΣ 모듈레이터(±1V·내부 클록·차량용)',
        whatIs: '절연 Delta-Sigma 모듈레이터(±1V 입력·내부 클록판): 고압 측 ±1V 아날로그 신호를 절연을 넘는 비트스트림(DOUT)으로 변환하고 내부 클록을 CLKOUT으로 후단에 출력.',
        func: 'AMC0306과 유사하나 입력 범위가 큼(±1V, 전압 계측이나 고압 분압 후 입력에 적합)이며 클록 내장(CLKOUT 능동 출력, 외부 클록 불필요). 차량용·강화 절연.',
        usedIn: '차량/산업 절연 전압 계측, HV 배터리/인버터 DC 링크 전압 감시, 클록 자급 절연 ΔΣ 계측.',
        desc: '±1V 입력·내부 클록(CLKOUT)·비트스트림 출력의 차량용 강화 절연 ΔΣ 모듈레이터(SOIC-8).',
        specs: [
          { k: '기능', v: '절연 ΔΣ 모듈레이터(내부 클록·비트스트림)' },
          { k: '입력 범위', v: '±1 V' },
          { k: '출력', v: 'DOUT 비트스트림+CLKOUT 내부 클록(외부 클록 불필요)' },
          { k: '절연', v: '강화(Reinforced)' },
          { k: '인증', v: '차량용 AEC-Q100 (Q1)' },
          { k: '패키지', v: 'SOIC-8' }
        ]
      }
    },
    'AMC0206M05-Q1': {
      en: {
        subcategory: 'Isolated ΔΣ modulator (±50mV, external clock, automotive)',
        whatIs: 'Isolated Delta-Sigma modulator: converts a ±50mV high-side analog signal directly into a digital bitstream (DOUT) across isolation, synchronized by external CLKIN. Basic/reinforced isolation options, automotive.',
        func: 'High-side current measurement (±50mV shunt drop) → internal ΔΣ modulation into a 1-bit stream across isolation to the low-voltage side, decoded by an MCU/FPGA sinc filter. Automotive (Q1).',
        usedIn: 'Automotive/industrial motor-inverter phase-current sensing, isolated current measurement.',
        desc: '±50mV input, external-clock (CLKIN), digital-bitstream-output automotive isolated ΔΣ modulator (SOIC-8).',
        specs: [
          { k: 'Function', v: 'Isolated ΔΣ modulator (external clock, digital bitstream)' },
          { k: 'Input range', v: '±50 mV' },
          { k: 'Output', v: '1-bit ΔΣ bitstream DOUT (needs CLKIN)' },
          { k: 'Isolation', v: 'Basic / reinforced options' },
          { k: 'Qualification', v: 'Automotive AEC-Q100 (Q1)' },
          { k: 'Supply', v: '3.0–5.5 V' },
          { k: 'Package', v: 'SOIC-8' }
        ]
      },
      ja: {
        subcategory: '絶縁 ΔΣ モジュレータ（±50mV・外部クロック・車載）',
        whatIs: '絶縁 Delta-Sigma モジュレータ：高圧側 ±50mV アナログ信号を直接絶縁を跨ぐビットストリーム（DOUT）へ変換、外部クロック CLKIN で同期。基本/強化絶縁の選択肢・車載。',
        func: '高圧側電流計測（シャント降下 ±50mV）→内部 ΔΣ 変調で 1-bit ストリーム化し絶縁経由で低圧側へ、MCU/FPGA の sinc フィルタで復調。車載（Q1）。',
        usedIn: '車載/産業モータインバータ相電流検出、絶縁電流計測。',
        desc: '±50mV 入力・外部クロック（CLKIN）・ビットストリーム出力の車載絶縁 ΔΣ モジュレータ（SOIC-8）。',
        specs: [
          { k: '機能', v: '絶縁 ΔΣ モジュレータ（外部クロック・ビットストリーム）' },
          { k: '入力範囲', v: '±50 mV' },
          { k: '出力', v: '1-bit ΔΣ ビットストリーム DOUT（CLKIN 必須）' },
          { k: '絶縁', v: '基本 / 強化の選択肢' },
          { k: '認証', v: '車載 AEC-Q100 (Q1)' },
          { k: '電源', v: '3.0~5.5 V' },
          { k: 'パッケージ', v: 'SOIC-8' }
        ]
      },
      ko: {
        subcategory: '절연 ΔΣ 모듈레이터(±50mV·외부 클록·차량용)',
        whatIs: '절연 Delta-Sigma 모듈레이터: 고압 측 ±50mV 아날로그 신호를 직접 절연을 넘는 비트스트림(DOUT)으로 변환, 외부 클록 CLKIN 동기. 기본/강화 절연 옵션·차량용.',
        func: '고압 측 전류 계측(션트 강하 ±50mV) → 내부 ΔΣ 변조로 1-bit 스트림화해 절연 경유 저압 측으로, MCU/FPGA sinc 필터로 복조. 차량용(Q1).',
        usedIn: '차량/산업 모터 인버터 상전류 검출, 절연 전류 계측.',
        desc: '±50mV 입력·외부 클록(CLKIN)·비트스트림 출력의 차량용 절연 ΔΣ 모듈레이터(SOIC-8).',
        specs: [
          { k: '기능', v: '절연 ΔΣ 모듈레이터(외부 클록·비트스트림)' },
          { k: '입력 범위', v: '±50 mV' },
          { k: '출력', v: '1-bit ΔΣ 비트스트림 DOUT(CLKIN 필수)' },
          { k: '절연', v: '기본/강화 옵션' },
          { k: '인증', v: '차량용 AEC-Q100 (Q1)' },
          { k: '전원', v: '3.0~5.5 V' },
          { k: '패키지', v: 'SOIC-8' }
        ]
      }
    },
    'AMC0236-Q1': {
      en: {
        subcategory: 'Isolated ΔΣ modulator (±1V, Kelvin sense, automotive)',
        whatIs: 'Isolated Delta-Sigma modulator (±1V input version): converts a ±1V high-side analog signal into a digital bitstream (DOUT) across isolation; INP/SNSN form a Kelvin (4-wire) sense input, external CLKIN. Automotive.',
        func: 'High-side voltage/current measurement: the larger ±1V input suits voltage sensing or high-impedance dividers; SNSN is the sense-negative terminal (Kelvin connection cancels trace-drop error). ΔΣ bitstream crosses isolation to the low-voltage side. Automotive (Q1).',
        usedIn: 'Automotive/industrial isolated voltage measurement, HV battery/DC-link monitoring, precision measurements needing Kelvin sensing.',
        desc: '±1V input, Kelvin-sense (INP/SNSN), external-clock, digital-bitstream-output automotive isolated ΔΣ modulator (SOIC-8).',
        specs: [
          { k: 'Function', v: 'Isolated ΔΣ modulator (Kelvin sense, digital bitstream)' },
          { k: 'Input range', v: '±1 V' },
          { k: 'Input', v: 'INP / SNSN (Kelvin 4-wire sense)' },
          { k: 'Output', v: 'DOUT bitstream (needs CLKIN)' },
          { k: 'Isolation', v: 'Basic / reinforced options' },
          { k: 'Qualification', v: 'Automotive AEC-Q100 (Q1)' },
          { k: 'Package', v: 'SOIC-8' }
        ]
      },
      ja: {
        subcategory: '絶縁 ΔΣ モジュレータ（±1V・ケルビン検出・車載）',
        whatIs: '絶縁 Delta-Sigma モジュレータ（±1V 入力版）：高圧側 ±1V アナログ信号を絶縁を跨ぐビットストリーム（DOUT）へ変換；INP/SNSN はケルビン（4 線）検出入力、外部クロック CLKIN。車載。',
        func: '高圧側電圧/電流計測：±1V の大きい入力は電圧計測や高抵抗分圧向き；SNSN は検出負端（ケルビン接続で配線降下誤差を低減）。ΔΣ ビットストリームが絶縁経由で低圧側へ。車載（Q1）。',
        usedIn: '車載/産業の絶縁電圧計測、HV バッテリ/DC リンク電圧監視、ケルビン検出が必要な高精度計測。',
        desc: '±1V 入力・ケルビン検出（INP/SNSN）・外部クロック・ビットストリーム出力の車載絶縁 ΔΣ モジュレータ（SOIC-8）。',
        specs: [
          { k: '機能', v: '絶縁 ΔΣ モジュレータ（ケルビン検出・ビットストリーム）' },
          { k: '入力範囲', v: '±1 V' },
          { k: '入力', v: 'INP / SNSN（ケルビン 4 線検出）' },
          { k: '出力', v: 'DOUT ビットストリーム（CLKIN 必須）' },
          { k: '絶縁', v: '基本 / 強化の選択肢' },
          { k: '認証', v: '車載 AEC-Q100 (Q1)' },
          { k: 'パッケージ', v: 'SOIC-8' }
        ]
      },
      ko: {
        subcategory: '절연 ΔΣ 모듈레이터(±1V·켈빈 감지·차량용)',
        whatIs: '절연 Delta-Sigma 모듈레이터(±1V 입력판): 고압 측 ±1V 아날로그 신호를 절연을 넘는 비트스트림(DOUT)으로 변환; INP/SNSN은 켈빈(4선) 감지 입력, 외부 클록 CLKIN. 차량용.',
        func: '고압 측 전압/전류 계측: ±1V의 큰 입력은 전압 계측이나 고저항 분압에 적합; SNSN은 감지 음극 단자(켈빈 연결로 배선 강하 오차 저감). ΔΣ 비트스트림이 절연 경유 저압 측으로. 차량용(Q1).',
        usedIn: '차량/산업 절연 전압 계측, HV 배터리/DC 링크 전압 감시, 켈빈 감지가 필요한 정밀 계측.',
        desc: '±1V 입력·켈빈 감지(INP/SNSN)·외부 클록·비트스트림 출력의 차량용 절연 ΔΣ 모듈레이터(SOIC-8).',
        specs: [
          { k: '기능', v: '절연 ΔΣ 모듈레이터(켈빈 감지·비트스트림)' },
          { k: '입력 범위', v: '±1 V' },
          { k: '입력', v: 'INP / SNSN(켈빈 4선 감지)' },
          { k: '출력', v: 'DOUT 비트스트림(CLKIN 필수)' },
          { k: '절연', v: '기본/강화 옵션' },
          { k: '인증', v: '차량용 AEC-Q100 (Q1)' },
          { k: '패키지', v: 'SOIC-8' }
        ]
      }
    },
    'AMC0303M0510': {
      en: {
        subcategory: 'Isolated ΔΣ modulator (±50mV, internal clock)',
        whatIs: 'Isolated Delta-Sigma modulator (±50mV, internal-clock version): converts a ±50mV high-side signal into a digital bitstream (DOUT) across isolation, and drives its internal clock out on CLKOUT for downstream sync (no external clock needed).',
        func: 'High-side current measurement (±50mV shunt) → ΔΣ bitstream across isolation to the low-voltage side; built-in clock actively output on CLKOUT. Supports 5/10MHz sampling.',
        usedIn: 'Industrial motor-inverter phase-current sensing, isolated current measurement, self-clocked isolated ΔΣ measurement.',
        desc: '±50mV input, internal-clock (CLKOUT), digital-bitstream-output isolated ΔΣ modulator (SOIC-8).',
        specs: [
          { k: 'Function', v: 'Isolated ΔΣ modulator (internal clock, digital bitstream)' },
          { k: 'Input range', v: '±50 mV' },
          { k: 'Output', v: 'DOUT bitstream + CLKOUT internal clock' },
          { k: 'Sampling', v: '5 / 10 MHz supported' },
          { k: 'Isolation', v: 'Reinforced' },
          { k: 'Package', v: 'SOIC-8' }
        ]
      },
      ja: {
        subcategory: '絶縁 ΔΣ モジュレータ（±50mV・内部クロック）',
        whatIs: '絶縁 Delta-Sigma モジュレータ（±50mV・内部クロック版）：高圧側 ±50mV 信号を絶縁を跨ぐビットストリーム（DOUT）へ変換し、内部クロックを CLKOUT から後段へ出力（外部クロック不要）。',
        func: '高圧側電流計測（シャント ±50mV）→ΔΣ ビットストリームが絶縁経由で低圧側へ；クロック内蔵・CLKOUT 能動出力。5/10MHz サンプリング対応。',
        usedIn: '産業モータインバータ相電流検出、絶縁電流計測、クロック自給の絶縁 ΔΣ 計測。',
        desc: '±50mV 入力・内部クロック（CLKOUT）・ビットストリーム出力の絶縁 ΔΣ モジュレータ（SOIC-8）。',
        specs: [
          { k: '機能', v: '絶縁 ΔΣ モジュレータ（内部クロック・ビットストリーム）' },
          { k: '入力範囲', v: '±50 mV' },
          { k: '出力', v: 'DOUT ビットストリーム＋CLKOUT 内部クロック' },
          { k: 'サンプリング', v: '5 / 10 MHz 対応' },
          { k: '絶縁', v: '強化 (Reinforced)' },
          { k: 'パッケージ', v: 'SOIC-8' }
        ]
      },
      ko: {
        subcategory: '절연 ΔΣ 모듈레이터(±50mV·내부 클록)',
        whatIs: '절연 Delta-Sigma 모듈레이터(±50mV·내부 클록판): 고압 측 ±50mV 신호를 절연을 넘는 비트스트림(DOUT)으로 변환하고 내부 클록을 CLKOUT으로 후단에 출력(외부 클록 불필요).',
        func: '고압 측 전류 계측(션트 ±50mV) → ΔΣ 비트스트림이 절연 경유 저압 측으로; 클록 내장·CLKOUT 능동 출력. 5/10MHz 샘플링 지원.',
        usedIn: '산업 모터 인버터 상전류 검출, 절연 전류 계측, 클록 자급 절연 ΔΣ 계측.',
        desc: '±50mV 입력·내부 클록(CLKOUT)·비트스트림 출력의 절연 ΔΣ 모듈레이터(SOIC-8).',
        specs: [
          { k: '기능', v: '절연 ΔΣ 모듈레이터(내부 클록·비트스트림)' },
          { k: '입력 범위', v: '±50 mV' },
          { k: '출력', v: 'DOUT 비트스트림+CLKOUT 내부 클록' },
          { k: '샘플링', v: '5 / 10 MHz 지원' },
          { k: '절연', v: '강화(Reinforced)' },
          { k: '패키지', v: 'SOIC-8' }
        ]
      }
    },
    'ISO7742U': {
      en: {
        subcategory: 'Quad digital isolator (2 forward / 2 reverse)',
        whatIs: 'Quad-channel digital isolator (2 forward + 2 reverse): passes digital signals between two electrically independent power domains across an SiO2 barrier; same pinout as ISO7741U, differing only in channel direction layout.',
        func: 'Same purpose as ISO7741U (electrical firewall for digital signals) but with 2 forward / 2 reverse channels — suited to bidirectional links (SPI MOSI/MISO, control/feedback splits). 50Mbps, CMTI ±100kV/µs, reinforced isolation.',
        usedIn: 'SPI/bidirectional comms isolation, motor/gate-driver isolation, industrial comms (RS-485/CAN), BMS, medical.',
        desc: 'Quad-channel (2F/2R) digital isolator, SiO2 barrier, 50Mbps, 1500VRMS isolation (same pinout as ISO7741U, different channel directions).',
        specs: [
          { k: 'Function', v: 'Quad digital isolator (2 forward + 2 reverse)' },
          { k: 'Isolation barrier', v: 'SiO2; 1500 VRMS / 2121 VDC' },
          { k: 'Surge immunity', v: 'up to 12.8 kV' },
          { k: 'CMTI', v: '±100 kV/µs (min)' },
          { k: 'Data rate', v: 'up to 50 Mbps' },
          { k: 'Supply range', v: '2.25 – 5.5 V (independent per side)' },
          { k: 'Temp range', v: '−40 – +125°C' },
          { k: 'Package', v: 'SOP (DUW-16)' }
        ]
      },
      ja: {
        subcategory: '4ch デジタルアイソレータ（順方向 2 / 逆方向 2）',
        whatIs: '4 チャネルデジタルアイソレータ（順 2＋逆 2）：電気的に独立した 2 電源ドメイン間でデジタル信号を伝達、SiO2 絶縁；ISO7741U とピン互換で、チャネル方向構成のみ異なる。',
        func: 'ISO7741U と同用途（デジタル信号の電気的ファイアウォール）だがチャネル方向は 2 順 2 逆——双方向信号（SPI MOSI/MISO、制御/フィードバック分離）に好適。50Mbps・CMTI ±100kV/µs・強化絶縁。',
        usedIn: 'SPI/双方向通信絶縁、モータ/ゲートドライバ絶縁、産業通信（RS-485/CAN）、BMS、医療。',
        desc: '4ch（2F/2R）デジタルアイソレータ。SiO2 バリア・50Mbps・1500VRMS 絶縁（ISO7741U とピン互換・チャネル方向違い）。',
        specs: [
          { k: '機能', v: '4ch デジタルアイソレータ（順 2＋逆 2）' },
          { k: '絶縁バリア', v: 'SiO2；1500 VRMS / 2121 VDC' },
          { k: 'サージ耐量', v: '最大 12.8 kV' },
          { k: 'CMTI', v: '±100 kV/µs (min)' },
          { k: 'データレート', v: '最大 50 Mbps' },
          { k: '電源範囲', v: '2.25 ~ 5.5 V（両側独立）' },
          { k: '動作温度', v: '−40 ~ +125°C' },
          { k: 'パッケージ', v: 'SOP (DUW-16)' }
        ]
      },
      ko: {
        subcategory: '4채널 디지털 아이솔레이터(순방향 2 / 역방향 2)',
        whatIs: '4채널 디지털 아이솔레이터(순 2+역 2): 전기적으로 독립한 두 전원 도메인 간 디지털 신호 전달, SiO2 절연; ISO7741U와 핀 호환이며 채널 방향 구성만 다름.',
        func: 'ISO7741U와 같은 용도(디지털 신호의 전기 방화벽)이나 채널 방향이 순 2·역 2 - 양방향 신호(SPI MOSI/MISO, 제어/피드백 분리)에 적합. 50Mbps·CMTI ±100kV/µs·강화 절연.',
        usedIn: 'SPI/양방향 통신 절연, 모터/게이트 드라이버 절연, 산업 통신(RS-485/CAN), BMS, 의료.',
        desc: '4채널(2F/2R) 디지털 아이솔레이터. SiO2 배리어·50Mbps·1500VRMS 절연(ISO7741U와 핀 호환·채널 방향 상이).',
        specs: [
          { k: '기능', v: '4채널 디지털 아이솔레이터(순 2+역 2)' },
          { k: '절연 배리어', v: 'SiO2; 1500 VRMS / 2121 VDC' },
          { k: '서지 내량', v: '최대 12.8 kV' },
          { k: 'CMTI', v: '±100 kV/µs (min)' },
          { k: '데이터 속도', v: '최대 50 Mbps' },
          { k: '전원 범위', v: '2.25 ~ 5.5 V(양측 독립)' },
          { k: '동작 온도', v: '−40 ~ +125°C' },
          { k: '패키지', v: 'SOP (DUW-16)' }
        ]
      }
    },
    'ISO6021': {
      en: {
        subcategory: 'Dual digital isolator (low power, high bandwidth)',
        whatIs: 'Dual-channel digital isolator: passes two digital signals between independent power domains across an SiO2 barrier; focused on low power + high bandwidth, reinforced isolation.',
        func: 'Isolates two digital signals (both same direction) between the low-voltage side and the high-voltage/noisy side, blocking ground loops, surges and common-mode interference. Low power and high bandwidth — suited to battery-powered gear and fast digital interfaces.',
        usedIn: 'Isolated SPI/UART, sensor-interface isolation, portable/battery devices, industrial digital I/O isolation.',
        desc: 'Dual-channel (2 forward) digital isolator, SiO2 barrier, reinforced isolation, low power, high bandwidth (SOIC-8).',
        specs: [
          { k: 'Function', v: 'Dual digital isolator (2 forward)' },
          { k: 'Isolation barrier', v: 'SiO2, reinforced' },
          { k: 'Highlights', v: 'low power + high bandwidth' },
          { k: 'Supply range', v: 'independent per side (see datasheet)' },
          { k: 'Package', v: 'SOIC-8' }
        ]
      },
      ja: {
        subcategory: '2ch デジタルアイソレータ（低消費電力・高帯域）',
        whatIs: '2 チャネルデジタルアイソレータ：独立した 2 電源ドメイン間で 2 系統のデジタル信号を伝達、SiO2 バリア；低消費電力＋高帯域が特長、強化絶縁。',
        func: '低圧側と高圧/ノイズ側の間で 2 系統のデジタル信号（同方向）を絶縁伝達し、グランドループ・サージ・コモンモード干渉を遮断。低消費電力・高帯域で、バッテリ機器や高速デジタルインタフェースの絶縁に好適。',
        usedIn: '絶縁 SPI/UART、センサインタフェース絶縁、ポータブル/バッテリ機器、産業デジタル I/O 絶縁。',
        desc: '2ch（順方向 2）デジタルアイソレータ。SiO2 バリア・強化絶縁・低消費電力・高帯域（SOIC-8）。',
        specs: [
          { k: '機能', v: '2ch デジタルアイソレータ（順方向 2）' },
          { k: '絶縁バリア', v: 'SiO2・強化 (Reinforced)' },
          { k: '特長', v: '低消費電力＋高帯域' },
          { k: '電源範囲', v: '両側独立（datasheet 参照）' },
          { k: 'パッケージ', v: 'SOIC-8' }
        ]
      },
      ko: {
        subcategory: '2채널 디지털 아이솔레이터(저전력·고대역)',
        whatIs: '2채널 디지털 아이솔레이터: 독립한 두 전원 도메인 간 두 계통 디지털 신호 전달, SiO2 배리어; 저전력+고대역이 특징, 강화 절연.',
        func: '저압 측과 고압/잡음 측 사이에서 두 계통 디지털 신호(동일 방향)를 절연 전달, 접지 루프·서지·공통 모드 간섭 차단. 저전력·고대역으로 배터리 기기나 고속 디지털 인터페이스 절연에 적합.',
        usedIn: '절연 SPI/UART, 센서 인터페이스 절연, 휴대/배터리 기기, 산업 디지털 I/O 절연.',
        desc: '2채널(순방향 2) 디지털 아이솔레이터. SiO2 배리어·강화 절연·저전력·고대역(SOIC-8).',
        specs: [
          { k: '기능', v: '2채널 디지털 아이솔레이터(순방향 2)' },
          { k: '절연 배리어', v: 'SiO2·강화(Reinforced)' },
          { k: '특징', v: '저전력+고대역' },
          { k: '전원 범위', v: '양측 독립(datasheet 참조)' },
          { k: '패키지', v: 'SOIC-8' }
        ]
      }
    },
    'ADS112S14': {
      en: {
        whatIs: 'Precision analog-to-digital converter (ADC): converts analog voltage into 16-bit digital values, SPI interface, up to 8 inputs. Same function as ADS112C14, differing only in interface (SPI instead of I2C).',
        func: 'Digitizes tiny sensor signals at high resolution; integrates PGA, programmable reference, dual current sources and a temperature sensor. Delta-Sigma architecture: fast oversampling + noise shaping trade speed for very high resolution — ideal for slow, precise measurements. 4-wire SPI (CS/SCLK/SDI/SDO).',
        usedIn: 'Industrial sensor front ends (RTD/thermocouple, pressure/strain bridges, flow), PLC/DCS analog inputs, SPI-based measurement systems.',
        desc: '16-bit, 8-channel, 64kSPS ΔΣ ADC with SPI (same function as ADS112C14, different interface).',
        specs: [
          { k: 'Resolution', v: '16-bit' },
          { k: 'Architecture', v: 'Delta-Sigma (ΔΣ)' },
          { k: 'Channels', v: '8-input MUX' },
          { k: 'Max sample rate', v: '64 kSPS' },
          { k: 'PGA gain', v: '0.5 – 256' },
          { k: 'Interface', v: 'SPI (4-wire: CS/SCLK/SDI/SDO)' },
          { k: 'Analog supply AVDD', v: '1.74 – 3.6 V' },
          { k: 'Digital supply DVDD', v: '1.65 – 3.6 V' },
          { k: 'Internal reference', v: '1.25 / 2.5 V, 25 ppm/°C' },
          { k: 'Integrated', v: 'temp sensor, dual current sources, 4× GPIO' },
          { k: 'Temp range', v: '−40 – +125°C' },
          { k: 'Package', v: 'WQFN-16 (RTE) / DSBGA-16' }
        ],
        dropIn: [{ note: 'Same RTE WQFN-16, identical pinout (24-bit version)' }]
      },
      ja: {
        subcategory: '高精度 ADC（Delta-Sigma、SPI）',
        whatIs: '高精度 A/D コンバータ（ADC）：アナログ電圧を 16 ビットへ変換、SPI インタフェース、最大 8 入力。ADS112C14 と同機能でインタフェースが SPI（I2C でなく）。',
        func: 'センサ微小信号を高分解能でデジタル化。PGA・プログラマブル基準・デュアル電流源・温度センサ内蔵。Delta-Sigma 構成：高速オーバーサンプリング＋ノイズシェーピングで高分解能、低速高精度計測向き。SPI 4 線（CS/SCLK/SDI/SDO）。',
        usedIn: '産業センサフロントエンド（RTD/熱電対、圧力/ひずみブリッジ、流量）、PLC/DCS アナログ入力、SPI ベースの計測系。',
        desc: '16-bit・8ch・64kSPS ΔΣ ADC。SPI インタフェース（ADS112C14 と同機能・インタフェース違い）。',
        specs: [
          { k: '分解能', v: '16-bit' },
          { k: 'アーキテクチャ', v: 'Delta-Sigma (ΔΣ)' },
          { k: 'チャネル', v: '8 入力 MUX' },
          { k: '最大サンプルレート', v: '64 kSPS' },
          { k: 'PGA ゲイン', v: '0.5 ~ 256' },
          { k: 'インタフェース', v: 'SPI（4 線：CS/SCLK/SDI/SDO）' },
          { k: 'アナログ電源 AVDD', v: '1.74 ~ 3.6 V' },
          { k: 'デジタル電源 DVDD', v: '1.65 ~ 3.6 V' },
          { k: '内部基準', v: '1.25 / 2.5 V、25 ppm/°C' },
          { k: '内蔵機能', v: '温度センサ、デュアル電流源、4× GPIO' },
          { k: '動作温度', v: '−40 ~ +125°C' },
          { k: 'パッケージ', v: 'WQFN-16 (RTE) / DSBGA-16' }
        ],
        dropIn: [{ note: '同一 RTE WQFN-16・ピン配置完全互換（24-bit 版）' }]
      },
      ko: {
        subcategory: '정밀 ADC(Delta-Sigma, SPI)',
        whatIs: '정밀 아날로그-디지털 변환기(ADC): 아날로그 전압을 16비트로 변환, SPI 인터페이스, 최대 8입력. ADS112C14와 동일 기능이며 인터페이스만 SPI(I2C 아님).',
        func: '센서 미소 신호를 고분해능으로 디지털화. PGA·프로그래머블 기준·듀얼 전류원·온도 센서 내장. Delta-Sigma 구조: 고속 오버샘플링+노이즈 셰이핑으로 고분해능, 저속 고정밀 계측용. SPI 4선(CS/SCLK/SDI/SDO).',
        usedIn: '산업 센서 프론트엔드(RTD/열전대, 압력/스트레인 브리지, 유량), PLC/DCS 아날로그 입력, SPI 기반 계측 시스템.',
        desc: '16-bit·8채널·64kSPS ΔΣ ADC. SPI 인터페이스(ADS112C14와 동일 기능·인터페이스 상이).',
        specs: [
          { k: '분해능', v: '16-bit' },
          { k: '아키텍처', v: 'Delta-Sigma (ΔΣ)' },
          { k: '채널', v: '8입력 MUX' },
          { k: '최대 샘플링', v: '64 kSPS' },
          { k: 'PGA 이득', v: '0.5 ~ 256' },
          { k: '인터페이스', v: 'SPI(4선: CS/SCLK/SDI/SDO)' },
          { k: '아날로그 전원 AVDD', v: '1.74 ~ 3.6 V' },
          { k: '디지털 전원 DVDD', v: '1.65 ~ 3.6 V' },
          { k: '내부 기준', v: '1.25 / 2.5 V, 25 ppm/°C' },
          { k: '내장 기능', v: '온도 센서, 듀얼 전류원, 4× GPIO' },
          { k: '동작 온도', v: '−40 ~ +125°C' },
          { k: '패키지', v: 'WQFN-16 (RTE) / DSBGA-16' }
        ],
        dropIn: [{ note: '동일 RTE WQFN-16·핀 배치 완전 호환(24-bit 버전)' }]
      }
    },
    'ADS122S14': {
      en: {
        whatIs: 'Precision analog-to-digital converter (ADC): converts analog voltage into 24-bit digital values, SPI interface, 8 inputs. Same pinout as ADS112S14 (16-bit vs 24-bit).',
        func: 'High-resolution digitization of tiny sensor signals; integrates PGA, programmable reference, dual current sources and temperature sensor. Delta-Sigma architecture, 4-wire SPI, 24-bit resolution.',
        usedIn: 'High-precision industrial sensor front ends, PLC/DCS, measurements needing SPI + 24-bit.',
        desc: '24-bit, 8-channel, 64kSPS ΔΣ ADC with SPI (same pinout as ADS112S14).',
        specs: [
          { k: 'Resolution', v: '24-bit' },
          { k: 'Architecture', v: 'Delta-Sigma (ΔΣ)' },
          { k: 'Channels', v: '8-input MUX' },
          { k: 'Max sample rate', v: '64 kSPS' },
          { k: 'PGA gain', v: '0.5 – 256' },
          { k: 'Interface', v: 'SPI (4-wire)' },
          { k: 'Analog supply AVDD', v: '1.74 – 3.6 V' },
          { k: 'Digital supply DVDD', v: '1.65 – 3.6 V' },
          { k: 'Internal reference', v: '1.25 / 2.5 V, 25 ppm/°C' },
          { k: 'Temp range', v: '−40 – +125°C' },
          { k: 'Package', v: 'WQFN-16 (RTE) / DSBGA-16' }
        ],
        dropIn: [{ note: 'Same RTE WQFN-16, identical pinout (16-bit version)' }]
      },
      ja: {
        subcategory: '高精度 ADC（Delta-Sigma、SPI）',
        whatIs: '高精度 A/D コンバータ（ADC）：アナログ電圧を 24 ビットへ変換、SPI インタフェース、8 入力。ADS112S14 とピン互換（16-bit/24-bit の違い）。',
        func: 'センサ微小信号の高分解能デジタル化。PGA・プログラマブル基準・デュアル電流源・温度センサ内蔵。Delta-Sigma 構成・SPI 4 線・24-bit 分解能。',
        usedIn: '高精度産業センサフロントエンド、PLC/DCS、SPI＋24-bit が必要な計測。',
        desc: '24-bit・8ch・64kSPS ΔΣ ADC。SPI インタフェース（ADS112S14 とピン互換）。',
        specs: [
          { k: '分解能', v: '24-bit' },
          { k: 'アーキテクチャ', v: 'Delta-Sigma (ΔΣ)' },
          { k: 'チャネル', v: '8 入力 MUX' },
          { k: '最大サンプルレート', v: '64 kSPS' },
          { k: 'PGA ゲイン', v: '0.5 ~ 256' },
          { k: 'インタフェース', v: 'SPI（4 線）' },
          { k: 'アナログ電源 AVDD', v: '1.74 ~ 3.6 V' },
          { k: 'デジタル電源 DVDD', v: '1.65 ~ 3.6 V' },
          { k: '内部基準', v: '1.25 / 2.5 V、25 ppm/°C' },
          { k: '動作温度', v: '−40 ~ +125°C' },
          { k: 'パッケージ', v: 'WQFN-16 (RTE) / DSBGA-16' }
        ],
        dropIn: [{ note: '同一 RTE WQFN-16・ピン配置完全互換（16-bit 版）' }]
      },
      ko: {
        subcategory: '정밀 ADC(Delta-Sigma, SPI)',
        whatIs: '정밀 아날로그-디지털 변환기(ADC): 아날로그 전압을 24비트로 변환, SPI 인터페이스, 8입력. ADS112S14와 핀 호환(16-bit/24-bit 차이).',
        func: '센서 미소 신호의 고분해능 디지털화. PGA·프로그래머블 기준·듀얼 전류원·온도 센서 내장. Delta-Sigma 구조·SPI 4선·24-bit 분해능.',
        usedIn: '고정밀 산업 센서 프론트엔드, PLC/DCS, SPI+24-bit가 필요한 계측.',
        desc: '24-bit·8채널·64kSPS ΔΣ ADC. SPI 인터페이스(ADS112S14와 핀 호환).',
        specs: [
          { k: '분해능', v: '24-bit' },
          { k: '아키텍처', v: 'Delta-Sigma (ΔΣ)' },
          { k: '채널', v: '8입력 MUX' },
          { k: '최대 샘플링', v: '64 kSPS' },
          { k: 'PGA 이득', v: '0.5 ~ 256' },
          { k: '인터페이스', v: 'SPI(4선)' },
          { k: '아날로그 전원 AVDD', v: '1.74 ~ 3.6 V' },
          { k: '디지털 전원 DVDD', v: '1.65 ~ 3.6 V' },
          { k: '내부 기준', v: '1.25 / 2.5 V, 25 ppm/°C' },
          { k: '동작 온도', v: '−40 ~ +125°C' },
          { k: '패키지', v: 'WQFN-16 (RTE) / DSBGA-16' }
        ],
        dropIn: [{ note: '동일 RTE WQFN-16·핀 배치 완전 호환(16-bit 버전)' }]
      }
    },
    'ADS9326': {
      en: {
        subcategory: 'Dual simultaneous-sampling SAR ADC (16-bit, 5MSPS)',
        whatIs: 'Dual-channel, simultaneous-sampling successive-approximation (SAR) ADC: two 16-bit ADCs sample two analog signals at the exact same instant (phase-aligned), up to 5MSPS.',
        func: 'Measures two signals simultaneously and time-aligned (e.g. current and voltage, or two phase currents); SAR architecture converts fast with no latency pipeline. Includes reference buffer, common-mode output (VCMOUT), multi-lane SPI data output (D0–D3) for faster reads. CONVST-triggered, CS-selected.',
        usedIn: 'Synchronized current/voltage sampling in motor/servo control, three-phase power measurement, power analyzers, grid measurement.',
        desc: 'Dual-channel, simultaneous-sampling, 16-bit, 5MSPS SAR ADC (VQFN-22), multi-lane SPI output.',
        specs: [
          { k: 'Function', v: 'Dual simultaneous-sampling SAR ADC' },
          { k: 'Resolution', v: '16-bit' },
          { k: 'Sample rate', v: 'up to 5 MSPS' },
          { k: 'Architecture', v: 'SAR (successive approximation)' },
          { k: 'Channels', v: '2 (A/B, simultaneous, phase-aligned)' },
          { k: 'Reference', v: 'internal reference + buffer (REFIO/REF_CAP)' },
          { k: 'Interface', v: 'SPI (multi-lane data D0–D3, CONVST/CS)' },
          { k: 'Analog supply', v: '5V or 3.3V' },
          { k: 'Package', v: 'VQFN-22 (with exposed pad EP)' }
        ]
      },
      ja: {
        subcategory: '2ch 同時サンプリング SAR ADC（16-bit・5MSPS）',
        whatIs: '2 チャネル同時サンプリングの逐次比較（SAR）A/D コンバータ：2 個の 16-bit ADC が 2 系統のアナログ信号を「同一瞬間」にサンプリング（位相整列）、最大 5MSPS。',
        func: '2 系統の信号を同時・時間整列で計測（例：電流と電圧、2 相電流）。SAR 構成で変換が速く遅延蓄積なし。基準バッファ・コモンモード出力（VCMOUT）内蔵、SPI マルチレーン出力（D0~D3）で読み出し高速化。CONVST トリガ・CS 選択。',
        usedIn: 'モータ/サーボ制御の電流電圧同期サンプリング、三相電力計測、パワーアナライザ、電力網計測。',
        desc: '2ch 同時サンプリング・16-bit・5MSPS SAR ADC（VQFN-22）。SPI マルチレーン出力。',
        specs: [
          { k: '機能', v: '2ch 同時サンプリング SAR ADC' },
          { k: '分解能', v: '16-bit' },
          { k: 'サンプルレート', v: '最大 5 MSPS' },
          { k: 'アーキテクチャ', v: 'SAR（逐次比較）' },
          { k: 'チャネル', v: '2（A/B、同時サンプリング・位相整列）' },
          { k: '基準', v: '内部基準＋バッファ（REFIO/REF_CAP）' },
          { k: 'インタフェース', v: 'SPI（マルチレーン D0~D3、CONVST/CS）' },
          { k: 'アナログ電源', v: '5V または 3.3V' },
          { k: 'パッケージ', v: 'VQFN-22（露出パッド EP 付）' }
        ]
      },
      ko: {
        subcategory: '2채널 동시 샘플링 SAR ADC(16-bit·5MSPS)',
        whatIs: '2채널 동시 샘플링 축차 비교(SAR) 아날로그-디지털 변환기: 두 개의 16-bit ADC가 두 아날로그 신호를 "같은 순간"에 샘플링(위상 정렬), 최대 5MSPS.',
        func: '두 신호를 동시·시간 정렬로 계측(예: 전류와 전압, 2상 전류). SAR 구조로 변환이 빠르고 지연 누적 없음. 기준 버퍼·공통 모드 출력(VCMOUT) 내장, SPI 멀티레인 출력(D0~D3)으로 읽기 고속화. CONVST 트리거·CS 선택.',
        usedIn: '모터/서보 제어의 전류·전압 동기 샘플링, 3상 전력 계측, 전력 분석기, 전력망 계측.',
        desc: '2채널 동시 샘플링·16-bit·5MSPS SAR ADC(VQFN-22). SPI 멀티레인 출력.',
        specs: [
          { k: '기능', v: '2채널 동시 샘플링 SAR ADC' },
          { k: '분해능', v: '16-bit' },
          { k: '샘플링', v: '최대 5 MSPS' },
          { k: '아키텍처', v: 'SAR(축차 비교)' },
          { k: '채널', v: '2(A/B, 동시 샘플링·위상 정렬)' },
          { k: '기준', v: '내부 기준+버퍼(REFIO/REF_CAP)' },
          { k: '인터페이스', v: 'SPI(멀티레인 D0~D3, CONVST/CS)' },
          { k: '아날로그 전원', v: '5V 또는 3.3V' },
          { k: '패키지', v: 'VQFN-22(노출 패드 EP 포함)' }
        ]
      }
    }
  };
  Object.assign(window.IC_I18N, T);
})();
/* batch 2: entries 15-29 */
(function () {
  var T = {
    'ADS9316': {
      en: {
        subcategory: 'Dual simultaneous-sampling SAR ADC (18-bit)',
        whatIs: 'Dual-channel simultaneous-sampling 18-bit SAR ADC: two ADCs sample two signals at the exact same instant (phase-aligned), 2 bits more resolution than the ADS9326. Same pinout as ADS9326/9317.',
        func: 'Measures two signals simultaneously and time-aligned (current/voltage, two phase currents) at 18-bit resolution; fast SAR conversion, multi-lane SPI output (D0–D3). CONVST-triggered, CS-selected, internal reference and common-mode output.',
        usedIn: 'High-resolution synchronized current/voltage sampling for motor/servo control, three-phase power measurement, power analyzers.',
        desc: 'Dual-channel, simultaneous-sampling, 18-bit SAR ADC (VQFN-22), multi-lane SPI (same pinout as ADS9326/9317).',
        specs: [
          { k: 'Function', v: 'Dual simultaneous-sampling SAR ADC' },
          { k: 'Resolution', v: '18-bit' },
          { k: 'Architecture', v: 'SAR (successive approximation)' },
          { k: 'Channels', v: '2 (A/B, simultaneous)' },
          { k: 'Interface', v: 'SPI (multi-lane D0–D3, CONVST/CS)' },
          { k: 'Reference', v: 'internal reference + buffer' },
          { k: 'Analog supply', v: '5V or 3.3V' },
          { k: 'Package', v: 'VQFN-22 (with EP)' }
        ],
        dropIn: [{ note: 'Same VQFN-22, identical pinout, both 18-bit (verify throughput/accuracy specs match)' }]
      },
      ja: {
        subcategory: '2ch 同時サンプリング SAR ADC（18-bit）',
        whatIs: '2 チャネル同時サンプリング 18-bit SAR ADC：2 個の ADC が 2 系統の信号を同一瞬間にサンプリング（位相整列）、ADS9326 より 2 ビット高分解能。ADS9326/9317 とピン互換。',
        func: '2 系統の信号を同時・時間整列で計測（電流/電圧、2 相電流）、18-bit 高分解能；SAR で高速変換、SPI マルチレーン出力（D0~D3）。CONVST トリガ・CS 選択・内部基準とコモンモード出力内蔵。',
        usedIn: '高分解能モータ/サーボの電流電圧同期サンプリング、三相電力計測、パワーアナライザ。',
        desc: '2ch 同時サンプリング・18-bit SAR ADC（VQFN-22）。SPI マルチレーン出力（ADS9326/9317 とピン互換）。',
        specs: [
          { k: '機能', v: '2ch 同時サンプリング SAR ADC' },
          { k: '分解能', v: '18-bit' },
          { k: 'アーキテクチャ', v: 'SAR（逐次比較）' },
          { k: 'チャネル', v: '2（A/B、同時サンプリング）' },
          { k: 'インタフェース', v: 'SPI（マルチレーン D0~D3、CONVST/CS）' },
          { k: '基準', v: '内部基準＋バッファ' },
          { k: 'アナログ電源', v: '5V または 3.3V' },
          { k: 'パッケージ', v: 'VQFN-22（EP 付）' }
        ],
        dropIn: [{ note: '同一 VQFN-22・ピン配置完全互換・共に 18-bit（throughput/精度仕様の適合を確認）' }]
      },
      ko: {
        subcategory: '2채널 동시 샘플링 SAR ADC(18-bit)',
        whatIs: '2채널 동시 샘플링 18-bit SAR ADC: 두 ADC가 두 신호를 같은 순간에 샘플링(위상 정렬), ADS9326보다 2비트 높은 분해능. ADS9326/9317과 핀 호환.',
        func: '두 신호를 동시·시간 정렬로 계측(전류/전압, 2상 전류), 18-bit 고분해능; SAR 고속 변환, SPI 멀티레인 출력(D0~D3). CONVST 트리거·CS 선택·내부 기준과 공통 모드 출력 내장.',
        usedIn: '고분해능 모터/서보 전류·전압 동기 샘플링, 3상 전력 계측, 전력 분석기.',
        desc: '2채널 동시 샘플링·18-bit SAR ADC(VQFN-22). SPI 멀티레인 출력(ADS9326/9317과 핀 호환).',
        specs: [
          { k: '기능', v: '2채널 동시 샘플링 SAR ADC' },
          { k: '분해능', v: '18-bit' },
          { k: '아키텍처', v: 'SAR(축차 비교)' },
          { k: '채널', v: '2(A/B, 동시 샘플링)' },
          { k: '인터페이스', v: 'SPI(멀티레인 D0~D3, CONVST/CS)' },
          { k: '기준', v: '내부 기준+버퍼' },
          { k: '아날로그 전원', v: '5V 또는 3.3V' },
          { k: '패키지', v: 'VQFN-22(EP 포함)' }
        ],
        dropIn: [{ note: '동일 VQFN-22·핀 배치 완전 호환·모두 18-bit(throughput/정확도 사양 적합 확인)' }]
      }
    },
    'ADS9317': {
      en: {
        subcategory: 'Dual simultaneous-sampling SAR ADC (18-bit)',
        whatIs: 'Dual-channel simultaneous-sampling 18-bit SAR ADC: two ADCs sample two signals at the same instant. Same pinout as ADS9316/9326 (ADS931x family).',
        func: 'Simultaneous, time-aligned measurement of two signals at 18-bit resolution; fast SAR, multi-lane SPI output. Same pinout as ADS9316 with slightly different specs (per datasheet).',
        usedIn: 'High-resolution motor/servo synchronized sampling, three-phase power measurement, power analysis.',
        desc: 'Dual-channel, simultaneous-sampling, 18-bit SAR ADC (VQFN-22, same pinout as ADS9316/9326).',
        specs: [
          { k: 'Function', v: 'Dual simultaneous-sampling SAR ADC' },
          { k: 'Resolution', v: '18-bit' },
          { k: 'Architecture', v: 'SAR' },
          { k: 'Channels', v: '2 (simultaneous)' },
          { k: 'Interface', v: 'SPI (multi-lane D0–D3, CONVST/CS)' },
          { k: 'Analog supply', v: '5V or 3.3V' },
          { k: 'Package', v: 'VQFN-22 (with EP)' }
        ],
        dropIn: [{ note: 'Same VQFN-22, identical pinout, both 18-bit (verify throughput/accuracy specs match)' }]
      },
      ja: {
        subcategory: '2ch 同時サンプリング SAR ADC（18-bit）',
        whatIs: '2 チャネル同時サンプリング 18-bit SAR ADC：2 個の ADC が 2 系統の信号を同一瞬間にサンプリング。ADS9316/9326 とピン互換（ADS931x シリーズ）。',
        func: '2 系統信号の同時・時間整列計測、18-bit 高分解能；SAR 高速・SPI マルチレーン出力。ADS9316 とピン互換・仕様が僅かに異なる（datasheet 参照）。',
        usedIn: '高分解能モータ/サーボ同期サンプリング、三相電力計測、電力分析。',
        desc: '2ch 同時サンプリング・18-bit SAR ADC（VQFN-22、ADS9316/9326 とピン互換）。',
        specs: [
          { k: '機能', v: '2ch 同時サンプリング SAR ADC' },
          { k: '分解能', v: '18-bit' },
          { k: 'アーキテクチャ', v: 'SAR' },
          { k: 'チャネル', v: '2（同時サンプリング）' },
          { k: 'インタフェース', v: 'SPI（マルチレーン D0~D3、CONVST/CS）' },
          { k: 'アナログ電源', v: '5V または 3.3V' },
          { k: 'パッケージ', v: 'VQFN-22（EP 付）' }
        ],
        dropIn: [{ note: '同一 VQFN-22・ピン配置完全互換・共に 18-bit（throughput/精度仕様の適合を確認）' }]
      },
      ko: {
        subcategory: '2채널 동시 샘플링 SAR ADC(18-bit)',
        whatIs: '2채널 동시 샘플링 18-bit SAR ADC: 두 ADC가 두 신호를 같은 순간에 샘플링. ADS9316/9326과 핀 호환(ADS931x 시리즈).',
        func: '두 신호의 동시·시간 정렬 계측, 18-bit 고분해능; SAR 고속·SPI 멀티레인 출력. ADS9316과 핀 호환·사양 약간 상이(datasheet 참조).',
        usedIn: '고분해능 모터/서보 동기 샘플링, 3상 전력 계측, 전력 분석.',
        desc: '2채널 동시 샘플링·18-bit SAR ADC(VQFN-22, ADS9316/9326과 핀 호환).',
        specs: [
          { k: '기능', v: '2채널 동시 샘플링 SAR ADC' },
          { k: '분해능', v: '18-bit' },
          { k: '아키텍처', v: 'SAR' },
          { k: '채널', v: '2(동시 샘플링)' },
          { k: '인터페이스', v: 'SPI(멀티레인 D0~D3, CONVST/CS)' },
          { k: '아날로그 전원', v: '5V 또는 3.3V' },
          { k: '패키지', v: 'VQFN-22(EP 포함)' }
        ],
        dropIn: [{ note: '동일 VQFN-22·핀 배치 완전 호환·모두 18-bit(throughput/정확도 사양 적합 확인)' }]
      }
    },
    'THS6222': {
      en: {
        subcategory: 'Dual differential line driver (8–32V, HPLC)',
        whatIs: 'Dual-channel differential line driver: amplifies a signal into a differential output to drive transmission lines (e.g. HPLC power-line communication); 8–32V supply with built-in common-mode buffer. A high-voltage, high-current output amplifier — not a small-signal op-amp.',
        func: 'Drives long transmission/power lines: two differential amplifiers (D1/D2) output large-swing differential signals into the line impedance; adjustable bias current (IADJ + BIAS-1/2 modes) trades performance for power; VCM sets the output common-mode level.',
        usedIn: 'Power-line communication (HPLC/PLC/G3-PLC) line driving, xDSL, long-distance differential signal driving.',
        desc: 'Dual-channel 8–32V differential line driver with common-mode buffer and adjustable bias (VQFN-16).',
        specs: [
          { k: 'Function', v: 'Dual differential line driver (with CM buffer)' },
          { k: 'Channels', v: '2 (D1 / D2)' },
          { k: 'Supply range', v: '8 – 32 V (VS+ / VS−)' },
          { k: 'Bias', v: 'adjustable (IADJ + BIAS-1/2 modes, power-save/shutdown)' },
          { k: 'Common mode', v: 'VCM buffered output' },
          { k: 'EP', v: 'exposed pad ties to VS− (not GND)' },
          { k: 'Applications', v: 'HPLC / power-line comm line driving, xDSL' },
          { k: 'Package', v: 'VQFN-16 (RGT)' }
        ]
      },
      ja: {
        subcategory: '2ch 差動ラインドライバ（8~32V・HPLC）',
        whatIs: '2 チャネル差動ラインドライバ：信号を差動出力へ増幅し「伝送線を駆動」（電力線通信 HPLC 等）。高電圧電源 8~32V、コモンモードバッファ内蔵。高圧・大電流出力のアンプで、一般の小信号オペアンプではない。',
        func: '長い伝送線/電力線の駆動：2 組の差動アンプ（D1/D2）が大振幅差動信号で線路インピーダンスを駆動；バイアス電流可変（IADJ＋BIAS-1/2 モード）で性能と消費電力をトレードオフ；VCM で出力コモンモード電位を設定。',
        usedIn: '電力線通信（HPLC/PLC/G3-PLC）ラインドライブ、xDSL、長距離差動信号駆動。',
        desc: '2ch・8~32V 電源の差動ラインドライバ。コモンモードバッファ・可変バイアス内蔵（VQFN-16）。',
        specs: [
          { k: '機能', v: '2ch 差動ラインドライバ（CM バッファ付）' },
          { k: 'チャネル', v: '2（D1 / D2）' },
          { k: '電源範囲', v: '8 ~ 32 V（VS+ / VS−）' },
          { k: 'バイアス', v: '可変（IADJ＋BIAS-1/2 モード、省電力/遮断可）' },
          { k: 'コモンモード', v: 'VCM バッファ出力' },
          { k: 'EP', v: '露出パッドは VS− 接続（GND ではない）' },
          { k: '用途', v: 'HPLC / 電力線通信ラインドライブ、xDSL' },
          { k: 'パッケージ', v: 'VQFN-16 (RGT)' }
        ]
      },
      ko: {
        subcategory: '2채널 차동 라인 드라이버(8~32V·HPLC)',
        whatIs: '2채널 차동 라인 드라이버: 신호를 차동 출력으로 증폭해 "전송선을 구동"(전력선 통신 HPLC 등). 고전압 전원 8~32V, 공통 모드 버퍼 내장. 고압·대전류 출력 앰프이며 일반 소신호 op-amp가 아님.',
        func: '긴 전송선/전력선 구동: 두 조의 차동 앰프(D1/D2)가 대진폭 차동 신호로 선로 임피던스를 구동; 바이어스 전류 가변(IADJ+BIAS-1/2 모드)으로 성능과 소비 전력 트레이드오프; VCM으로 출력 공통 모드 전위 설정.',
        usedIn: '전력선 통신(HPLC/PLC/G3-PLC) 라인 구동, xDSL, 장거리 차동 신호 구동.',
        desc: '2채널·8~32V 전원 차동 라인 드라이버. 공통 모드 버퍼·가변 바이어스 내장(VQFN-16).',
        specs: [
          { k: '기능', v: '2채널 차동 라인 드라이버(CM 버퍼 포함)' },
          { k: '채널', v: '2(D1 / D2)' },
          { k: '전원 범위', v: '8 ~ 32 V(VS+ / VS−)' },
          { k: '바이어스', v: '가변(IADJ+BIAS-1/2 모드, 절전/차단 가능)' },
          { k: '공통 모드', v: 'VCM 버퍼 출력' },
          { k: 'EP', v: '노출 패드는 VS− 접속(GND 아님)' },
          { k: '용도', v: 'HPLC / 전력선 통신 라인 구동, xDSL' },
          { k: '패키지', v: 'VQFN-16 (RGT)' }
        ]
      }
    },
    'TPS61290': {
      en: {
        subcategory: 'Synchronous boost converter (5.5V, 11A, I2C, with bypass)',
        whatIs: 'Synchronous boost converter: steps a lower input voltage up to a higher output; built-in high/low-side power MOSFETs (synchronous rectification, high efficiency), I2C-configurable, with a bypass mode. High current (11A switch current).',
        func: 'Battery/low-voltage source → boosted supply; synchronous rectification cuts losses; I2C dynamically sets output voltage and mode; bypass passes the input straight through when boosting is not needed. BGA 16 balls — VIN/VOUT/SW/GND use 3 balls each to share the high current.',
        usedIn: 'Boost for battery-powered devices (phones/wearables/IoT), RF power-amplifier supply, systems needing I2C dynamic voltage scaling.',
        desc: '5.5V, 11A synchronous boost converter, I2C control, bypass mode (BGA-16).',
        specs: [
          { k: 'Function', v: 'Synchronous boost converter with bypass mode' },
          { k: 'Input', v: 'up to 5.5 V' },
          { k: 'Switch current', v: '11 A' },
          { k: 'Rectification', v: 'synchronous (built-in high/low-side MOSFETs)' },
          { k: 'Control', v: 'I2C (output voltage/mode); EN enable' },
          { k: 'Bypass', v: 'straight-through when boost not needed' },
          { k: 'Package', v: 'BGA-16 (4×4; VIN/VOUT/SW/GND 3 balls each)' }
        ]
      },
      ja: {
        subcategory: '同期整流昇圧コンバータ（5.5V・11A・I2C・バイパス付）',
        whatIs: '同期整流昇圧（boost）コンバータ：低い入力電圧を高い出力電圧へ昇圧。ハイ/ローサイド パワー MOSFET 内蔵（同期整流・高効率）、I2C 設定可、バイパスモード付。大電流（スイッチ電流 11A）。',
        func: 'バッテリ/低圧源→昇圧供給；同期整流で損失低減；I2C で出力電圧とモードを動的設定；昇圧不要時はバイパス直通で省電力。BGA 16 ボール、VIN/VOUT/SW/GND 各 3 ボールで大電流を分担。',
        usedIn: 'バッテリ機器の昇圧（スマホ/ウェアラブル/IoT）、RF パワーアンプ電源、I2C 動的電圧調整が必要なシステム。',
        desc: '5.5V・11A 同期整流昇圧コンバータ。I2C 制御・バイパスモード付（BGA-16）。',
        specs: [
          { k: '機能', v: '同期整流昇圧コンバータ・バイパスモード付' },
          { k: '入力', v: '最大 5.5 V' },
          { k: 'スイッチ電流', v: '11 A' },
          { k: '整流', v: '同期（ハイ/ローサイド MOSFET 内蔵）' },
          { k: '制御', v: 'I2C（出力電圧/モード可変）；EN イネーブル' },
          { k: 'バイパス', v: '昇圧不要時は直通で省電力' },
          { k: 'パッケージ', v: 'BGA-16（4×4；VIN/VOUT/SW/GND 各 3 ボール）' }
        ]
      },
      ko: {
        subcategory: '동기 부스트 컨버터(5.5V·11A·I2C·바이패스 포함)',
        whatIs: '동기 부스트(boost) 컨버터: 낮은 입력 전압을 높은 출력으로 승압. 하이/로우사이드 파워 MOSFET 내장(동기 정류·고효율), I2C 설정 가능, 바이패스 모드 포함. 대전류(스위치 전류 11A).',
        func: '배터리/저압원 → 승압 공급; 동기 정류로 손실 저감; I2C로 출력 전압·모드 동적 설정; 승압 불필요 시 바이패스 직통으로 절전. BGA 16볼, VIN/VOUT/SW/GND 각 3볼로 대전류 분담.',
        usedIn: '배터리 기기 승압(휴대폰/웨어러블/IoT), RF 파워앰프 전원, I2C 동적 전압 조정이 필요한 시스템.',
        desc: '5.5V·11A 동기 부스트 컨버터. I2C 제어·바이패스 모드(BGA-16).',
        specs: [
          { k: '기능', v: '동기 부스트 컨버터·바이패스 모드 포함' },
          { k: '입력', v: '최대 5.5 V' },
          { k: '스위치 전류', v: '11 A' },
          { k: '정류', v: '동기(하이/로우사이드 MOSFET 내장)' },
          { k: '제어', v: 'I2C(출력 전압/모드 가변); EN 인에이블' },
          { k: '바이패스', v: '승압 불필요 시 직통으로 절전' },
          { k: '패키지', v: 'BGA-16(4×4; VIN/VOUT/SW/GND 각 3볼)' }
        ]
      }
    },
    'TPS61129-Q1': {
      en: {
        subcategory: 'Boost converter (5.5V, 3.5A Isw, automotive, spread-spectrum + clock sync)',
        whatIs: 'Boost converter: steps a lower input up to a higher output, automotive (Q1); includes spread-spectrum modulation (lower EMI) and external clock synchronization. FB feedback sets the output voltage (or fixed-5V version).',
        func: 'Low-voltage source → boosted supply; FB divider sets output voltage; SSEN enables spread spectrum to smear the switching spectrum and cut EMI peaks; SYNC/MODE selects forced PWM or auto PFM, or syncs to an external clock; PG signals power-good. Automotive.',
        usedIn: 'Automotive boost supplies, EMI-sensitive/clock-synced power, sensor/display/RF supplies.',
        desc: '5.5V, 3.5A-switch-current automotive boost converter with spread spectrum and clock sync, adjustable output (VQFN-11).',
        specs: [
          { k: 'Function', v: 'Boost converter (automotive)' },
          { k: 'Input', v: 'up to 5.5 V' },
          { k: 'Switch current', v: '3.5 A (Isw)' },
          { k: 'Output setting', v: 'FB divider adjustable (or fixed-5V version)' },
          { k: 'EMI', v: 'spread-spectrum modulation (SSEN)' },
          { k: 'Modes', v: 'forced PWM / auto PFM; external clock sync' },
          { k: 'Indicator', v: 'PG power good (open-drain)' },
          { k: 'Qualification', v: 'Automotive AEC-Q100 (Q1)' },
          { k: 'Package', v: 'VQFN-11' }
        ]
      },
      ja: {
        subcategory: '昇圧コンバータ（5.5V・3.5A Isw・車載・スペクトラム拡散＋クロック同期）',
        whatIs: '昇圧（boost）コンバータ：低い入力を高い出力へ昇圧、車載（Q1）；スペクトラム拡散変調（EMI 低減）と外部クロック同期機能付。FB 帰還で出力電圧可変（固定 5V 版もあり）。',
        func: '低圧源→昇圧供給；FB 分圧で出力電圧設定；SSEN でスペクトラム拡散を有効化しスイッチングスペクトルを分散、EMI ピークを低減；SYNC/MODE で強制 PWM か自動 PFM を選択、外部クロック同期も可；PG で電源準備完了を通知。車載。',
        usedIn: '車載電子の昇圧電源、EMI 敏感/クロック同期が必要な電源、センサ/ディスプレイ/RF 供給。',
        desc: '5.5V・スイッチ電流 3.5A の車載昇圧コンバータ。スペクトラム拡散・クロック同期・可変出力（VQFN-11）。',
        specs: [
          { k: '機能', v: '昇圧コンバータ（車載）' },
          { k: '入力', v: '最大 5.5 V' },
          { k: 'スイッチ電流', v: '3.5 A (Isw)' },
          { k: '出力設定', v: 'FB 分圧可変（固定 5V 版もあり）' },
          { k: 'EMI', v: 'スペクトラム拡散変調（SSEN）' },
          { k: 'モード', v: '強制 PWM / 自動 PFM；外部クロック同期可' },
          { k: '通知', v: 'PG 電源準備完了（オープンドレイン）' },
          { k: '認証', v: '車載 AEC-Q100 (Q1)' },
          { k: 'パッケージ', v: 'VQFN-11' }
        ]
      },
      ko: {
        subcategory: '부스트 컨버터(5.5V·3.5A Isw·차량용·확산 스펙트럼+클록 동기)',
        whatIs: '부스트(boost) 컨버터: 낮은 입력을 높은 출력으로 승압, 차량용(Q1); 확산 스펙트럼 변조(EMI 저감)와 외부 클록 동기 기능 포함. FB 피드백으로 출력 전압 가변(고정 5V판도 있음).',
        func: '저압원 → 승압 공급; FB 분압으로 출력 전압 설정; SSEN으로 확산 스펙트럼을 켜 스위칭 스펙트럼을 분산, EMI 피크 저감; SYNC/MODE로 강제 PWM 또는 자동 PFM 선택, 외부 클록 동기도 가능; PG로 전원 준비 표시. 차량용.',
        usedIn: '차량 전자 승압 전원, EMI 민감/클록 동기 필요 전원, 센서/디스플레이/RF 공급.',
        desc: '5.5V·스위치 전류 3.5A 차량용 부스트 컨버터. 확산 스펙트럼·클록 동기·가변 출력(VQFN-11).',
        specs: [
          { k: '기능', v: '부스트 컨버터(차량용)' },
          { k: '입력', v: '최대 5.5 V' },
          { k: '스위치 전류', v: '3.5 A (Isw)' },
          { k: '출력 설정', v: 'FB 분압 가변(고정 5V판도 있음)' },
          { k: 'EMI', v: '확산 스펙트럼 변조(SSEN)' },
          { k: '모드', v: '강제 PWM / 자동 PFM; 외부 클록 동기 가능' },
          { k: '표시', v: 'PG 전원 준비(오픈 드레인)' },
          { k: '인증', v: '차량용 AEC-Q100 (Q1)' },
          { k: '패키지', v: 'VQFN-11' }
        ]
      }
    },
    'UCC34141-Q1': {
      en: {
        subcategory: 'Integrated isolated bias supply (12Vin → 25Vout, automotive)',
        whatIs: 'Integrated isolated bias supply: from a 12V primary input it generates positive and negative bias rails (VDD and VEE, ~25V total) on the secondary side across electrical isolation, for gate drivers and similar loads; dual-loop regulation and an internal buck-boost. Automotive (Q1), high power density, 1.5W.',
        func: 'Provides the isolated positive/negative bias (e.g. +15V / −4V) that IGBT/SiC/GaN gate drivers need. 12V in on the primary (VIN/GNDP); on the secondary, VDD−COM and COM−VEE are each regulated via their own feedback (FBVDD/FBVEE); BSW connects an inductor for the buck-boost negative rail; ENA enables (UVLO-settable), PG signals power good. Primary and secondary are galvanically isolated.',
        usedIn: 'Isolated ± bias for IGBT/SiC/GaN gate drivers, gate supplies in motor drives/inverters/on-board chargers, isolated supplies needing ± rails.',
        desc: '1.5W, 12Vin→25Vout integrated isolated bias supply generating ± bias for gate drivers (16-SSOP (DHA), automotive). (Package per datasheet Figure 5-1 "DHA Package, 16-Pin SSOP"; its thermal table says DHA (SOIC) — figure taken as authoritative. Original library QFN-16 misprint fixed 2026-07-10.)',
        specs: [
          { k: 'Function', v: 'Integrated isolated bias supply (± rails)' },
          { k: 'Input', v: '12 V (VIN)' },
          { k: 'Output', v: '~25 V (VDD and VEE, each feedback-settable)' },
          { k: 'Power', v: '1.5 W' },
          { k: 'Isolation', v: 'primary-secondary galvanic isolation' },
          { k: 'Topology', v: 'internal buck-boost (BSW + inductor for the negative rail)' },
          { k: 'Feedback', v: 'FBVDD sets VDD−COM, FBVEE sets COM−VEE (2–8V)' },
          { k: 'Status/enable', v: 'PG power good, ENA (UVLO-settable)' },
          { k: 'Qualification', v: 'Automotive AEC-Q100 (Q1)' },
          { k: 'Package', v: 'QFN-16' }
        ]
      },
      ja: {
        subcategory: '統合絶縁バイアス電源（12Vin→25Vout・車載）',
        whatIs: '統合絶縁バイアス電源：一次側 12V 入力から、電気的絶縁を跨いで二次側に正負バイアス電圧（VDD と VEE、合計約 25V）を生成しゲートドライバ等へ供給；2 系統帰還レギュレーションと内部 buck-boost を内蔵。車載（Q1）・高電力密度・1.5W。',
        func: 'IGBT/SiC/GaN ゲートドライバに必要な絶縁「正負バイアス」（例：+15V / −4V）を供給。一次 12V 入力（VIN/GNDP）、二次は VDD−COM と COM−VEE の 2 系統を各々帰還（FBVDD/FBVEE）で設定；BSW にインダクタを接続し buck-boost で負レールを生成；ENA イネーブル（UVLO 設定可）・PG 準備完了通知。一次-二次は電気的絶縁。',
        usedIn: 'IGBT/SiC/GaN ゲートドライバの絶縁正負バイアス、モータドライブ/インバータ/車載充電器のゲート電源、± バイアスが必要な絶縁供給。',
        desc: '1.5W・12Vin→25Vout の統合絶縁バイアス電源。二次側に正負バイアスを生成しゲートドライバへ（16-SSOP(DHA)、車載）。（パッケージは datasheet Figure 5-1「DHA Package, 16-Pin SSOP」準拠；熱抵抗表は DHA (SOIC) 表記で矛盾、図を優先。旧登録の QFN-16 誤記は 2026-07-10 修正済）',
        specs: [
          { k: '機能', v: '統合絶縁バイアス電源（正負バイアス生成）' },
          { k: '入力', v: '12 V（VIN）' },
          { k: '出力', v: '約 25 V（VDD と VEE の 2 系統、各々帰還設定可）' },
          { k: '電力', v: '1.5 W' },
          { k: '絶縁', v: '一次-二次 電気的絶縁' },
          { k: 'トポロジ', v: '内部 buck-boost（BSW＋インダクタで負レール生成）' },
          { k: '帰還', v: 'FBVDD で VDD−COM、FBVEE で COM−VEE (2~8V)' },
          { k: '通知/イネーブル', v: 'PG 準備完了、ENA（UVLO 設定可）' },
          { k: '認証', v: '車載 AEC-Q100 (Q1)' },
          { k: 'パッケージ', v: 'QFN-16' }
        ]
      },
      ko: {
        subcategory: '통합 절연 바이어스 전원(12Vin→25Vout·차량용)',
        whatIs: '통합 절연 바이어스 전원: 1차 측 12V 입력에서 전기 절연을 넘어 2차 측에 양·음 바이어스 전압(VDD와 VEE, 합계 약 25V)을 생성해 게이트 드라이버 등에 공급; 2계통 피드백 안정화와 내부 buck-boost 내장. 차량용(Q1)·고전력밀도·1.5W.',
        func: 'IGBT/SiC/GaN 게이트 드라이버에 필요한 절연 "양·음 바이어스"(예: +15V / −4V) 공급. 1차 12V 입력(VIN/GNDP), 2차는 VDD−COM과 COM−VEE 두 계통을 각각 피드백(FBVDD/FBVEE)으로 설정; BSW에 인덕터를 연결해 buck-boost로 음 레일 생성; ENA 인에이블(UVLO 설정 가능)·PG 준비 표시. 1차-2차 전기 절연.',
        usedIn: 'IGBT/SiC/GaN 게이트 드라이버의 절연 양·음 바이어스, 모터 드라이브/인버터/차량 탑재 충전기 게이트 전원, ± 바이어스가 필요한 절연 공급.',
        desc: '1.5W·12Vin→25Vout 통합 절연 바이어스 전원. 2차 측에 양·음 바이어스 생성, 게이트 드라이버용(16-SSOP(DHA), 차량용). (패키지는 datasheet Figure 5-1 "DHA Package, 16-Pin SSOP" 기준; 열저항 표는 DHA (SOIC) 표기로 모순, 그림 우선. 구 등록 QFN-16 오기는 2026-07-10 수정됨)',
        specs: [
          { k: '기능', v: '통합 절연 바이어스 전원(양·음 바이어스 생성)' },
          { k: '입력', v: '12 V(VIN)' },
          { k: '출력', v: '약 25 V(VDD와 VEE 2계통, 각각 피드백 설정)' },
          { k: '전력', v: '1.5 W' },
          { k: '절연', v: '1차-2차 전기 절연' },
          { k: '토폴로지', v: '내부 buck-boost(BSW+인덕터로 음 레일 생성)' },
          { k: '피드백', v: 'FBVDD로 VDD−COM, FBVEE로 COM−VEE (2~8V)' },
          { k: '표시/인에이블', v: 'PG 준비, ENA(UVLO 설정 가능)' },
          { k: '인증', v: '차량용 AEC-Q100 (Q1)' },
          { k: '패키지', v: 'QFN-16' }
        ]
      }
    },
    'TMAG6184': {
      en: {
        subcategory: 'AMR 360° angle sensor (amplified analog SIN/COS output)',
        whatIs: 'High-precision 360° angle sensor: senses the angle of a rotating magnet via anisotropic magnetoresistance (AMR), outputting amplified differential SIN/COS analog signals plus digital quadrant bits (Q0/Q1); the absolute angle is computed externally with atan2.',
        func: 'Contactless absolute-angle measurement (0–360°) of a rotating magnet: differential SIN_P/N, COS_P/N feed an ADC for arctangent angle computation; open-drain Q0/Q1 give a fast coarse quadrant. Immune to dust/oil, reliable.',
        usedIn: 'BLDC rotor position/FOC commutation, steering-angle sensing, throttle/pedal position, rotary knobs.',
        desc: 'High-precision AMR 360° angle sensor, amplified differential SIN/COS analog + quadrant digital outputs (SOIC-8).',
        specs: [
          { k: 'Function', v: 'AMR 360° absolute angle sensor' },
          { k: 'Principle', v: 'anisotropic magnetoresistance (AMR)' },
          { k: 'Output', v: 'amplified differential SIN/COS analog + Q0/Q1 quadrant (open-drain)' },
          { k: 'Range', v: '0 – 360°' },
          { k: 'Supply', v: 'single VCC' },
          { k: 'Highlights', v: 'contactless, dust/oil immune' },
          { k: 'Package', v: 'SOIC-8' }
        ]
      },
      ja: {
        subcategory: 'AMR 360° 角度センサ（増幅アナログ SIN/COS 出力）',
        whatIs: '高精度 360° 角度センサ：異方性磁気抵抗（AMR）で回転磁石の角度を検出し、増幅済みの「差動 SIN/COS アナログ信号」とデジタル象限ビット（Q0/Q1）を出力、外部で atan2 により絶対角を算出。',
        func: '回転磁石の絶対角（0~360°）を非接触計測：差動 SIN_P/N、COS_P/N を ADC に入れ逆正接で角度算出；Q0/Q1 オープンドレインで高速に象限を粗判定。粉塵/油汚れに強く高信頼。',
        usedIn: 'ブラシレスモータ（BLDC）ロータ位置/FOC 転流、ステアリング角検出、スロットル/ペダル位置、ロータリノブ。',
        desc: '高精度 AMR 360° 角度センサ。増幅差動 SIN/COS アナログ＋象限デジタル出力（SOIC-8）。',
        specs: [
          { k: '機能', v: 'AMR 360° 絶対角度センサ' },
          { k: '検出原理', v: '異方性磁気抵抗 (AMR)' },
          { k: '出力', v: '増幅差動 SIN/COS アナログ＋Q0/Q1 象限デジタル（オープンドレイン）' },
          { k: '計測範囲', v: '0 ~ 360°' },
          { k: '電源', v: '単一 VCC' },
          { k: '特長', v: '非接触、粉塵/油汚れ耐性' },
          { k: 'パッケージ', v: 'SOIC-8' }
        ]
      },
      ko: {
        subcategory: 'AMR 360° 각도 센서(증폭 아날로그 SIN/COS 출력)',
        whatIs: '고정밀 360° 각도 센서: 이방성 자기저항(AMR)으로 회전 자석의 각도를 감지, 증폭된 "차동 SIN/COS 아날로그 신호"와 디지털 사분면 비트(Q0/Q1)를 출력, 외부에서 atan2로 절대각 계산.',
        func: '회전 자석의 절대각(0~360°)을 비접촉 계측: 차동 SIN_P/N, COS_P/N을 ADC에 넣어 아크탄젠트로 각도 산출; Q0/Q1 오픈 드레인으로 빠른 사분면 대략 판정. 먼지/유분에 강하고 신뢰성 높음.',
        usedIn: '브러시리스 모터(BLDC) 로터 위치/FOC 전환, 조향각 감지, 스로틀/페달 위치, 로터리 노브.',
        desc: '고정밀 AMR 360° 각도 센서. 증폭 차동 SIN/COS 아날로그+사분면 디지털 출력(SOIC-8).',
        specs: [
          { k: '기능', v: 'AMR 360° 절대 각도 센서' },
          { k: '감지 원리', v: '이방성 자기저항(AMR)' },
          { k: '출력', v: '증폭 차동 SIN/COS 아날로그+Q0/Q1 사분면 디지털(오픈 드레인)' },
          { k: '계측 범위', v: '0 ~ 360°' },
          { k: '전원', v: '단일 VCC' },
          { k: '특징', v: '비접촉, 먼지/유분 내성' },
          { k: '패키지', v: 'SOIC-8' }
        ]
      }
    },
    'TMP4719': {
      en: {
        subcategory: '3-channel temperature sensor (2 remote + 1 local, SMBus)',
        whatIs: "High-accuracy 3-channel temperature sensor: measures 'remote hot spots' (CPU/GPU/power-device junctions) via the temperature dependence of an external transistor/diode VBE — 2 remote channels plus 1 local, reported over SMBus. 1.2V-logic compatible.",
        func: 'Measures 3 temperatures (2 external diode/BJT remotes + on-chip local); on over-temperature, open-drain T_CRIT / ALERT outputs trigger interrupts or shutdown protection; SMBus (SCL/SDA) reads temperatures and sets thresholds. High accuracy.',
        usedIn: 'CPU/GPU/FPGA/SoC hot-spot sensing and thermal management, server/power-module monitoring, system over-temperature protection.',
        desc: 'High-accuracy 3-channel (2 remote + 1 local) temperature sensor, SMBus, T_CRIT/ALERT protection outputs (VSSOP/WSON-10).',
        specs: [
          { k: 'Function', v: '3-channel temperature sensing (2 remote + 1 local)' },
          { k: 'Remote method', v: 'VBE of external diode/BJT' },
          { k: 'Interface', v: 'SMBus (SCL/SDA), 1.2V-logic compatible' },
          { k: 'Protection outputs', v: 'ALERT + T_CRIT (open-drain, need pull-ups)' },
          { k: 'Supply', v: 'single VDD (0.1µF decoupling)' },
          { k: 'Package', v: 'VSSOP-10 / WSON-10' }
        ],
        dropIn: [{ note: 'Automotive version, same VSSOP/WSON-10 pinout' }]
      },
      ja: {
        subcategory: '3ch 温度センサ（リモート 2＋ローカル 1・SMBus）',
        whatIs: '高精度 3 チャネル温度センサ：外付けトランジスタ/ダイオードの VBE 温度依存性で「リモート熱点」（CPU/GPU/パワー素子の接合部）を計測——リモート 2＋ローカル 1、SMBus で報告。1.2V ロジック対応。',
        func: '3 点の温度を計測（外付け diode/BJT リモート 2＋チップローカル 1）；過熱時は T_CRIT / ALERT オープンドレイン出力で割り込みや遮断保護をトリガ；SMBus（SCL/SDA）で温度読み出しとしきい値設定。高精度。',
        usedIn: 'CPU/GPU/FPGA/SoC 熱点計測と熱管理、サーバ/パワーモジュール温度監視、システム過熱保護。',
        desc: '高精度 3ch（リモート 2＋ローカル 1）温度センサ。SMBus・T_CRIT/ALERT 保護出力（VSSOP/WSON-10）。',
        specs: [
          { k: '機能', v: '3ch 温度計測（リモート 2＋ローカル 1）' },
          { k: 'リモート計測', v: '外付け diode/BJT の VBE 法' },
          { k: 'インタフェース', v: 'SMBus（SCL/SDA）、1.2V ロジック対応' },
          { k: '保護出力', v: 'ALERT＋T_CRIT（オープンドレイン、プルアップ必須）' },
          { k: '電源', v: '単一 VDD（0.1µF デカップリング）' },
          { k: 'パッケージ', v: 'VSSOP-10 / WSON-10' }
        ],
        dropIn: [{ note: '車載版・同 VSSOP/WSON-10 ピン配置同一' }]
      },
      ko: {
        subcategory: '3채널 온도 센서(원격 2+로컬 1·SMBus)',
        whatIs: '고정밀 3채널 온도 센서: 외장 트랜지스터/다이오드의 VBE 온도 의존성으로 "원격 핫스팟"(CPU/GPU/전력 소자 접합부)을 계측 - 원격 2+로컬 1, SMBus로 보고. 1.2V 로직 호환.',
        func: '3점 온도 계측(외장 diode/BJT 원격 2+칩 로컬 1); 과열 시 T_CRIT / ALERT 오픈 드레인 출력으로 인터럽트나 차단 보호 트리거; SMBus(SCL/SDA)로 온도 읽기와 문턱 설정. 고정밀.',
        usedIn: 'CPU/GPU/FPGA/SoC 핫스팟 계측과 열 관리, 서버/전력 모듈 온도 감시, 시스템 과열 보호.',
        desc: '고정밀 3채널(원격 2+로컬 1) 온도 센서. SMBus·T_CRIT/ALERT 보호 출력(VSSOP/WSON-10).',
        specs: [
          { k: '기능', v: '3채널 온도 계측(원격 2+로컬 1)' },
          { k: '원격 계측', v: '외장 diode/BJT의 VBE 법' },
          { k: '인터페이스', v: 'SMBus(SCL/SDA), 1.2V 로직 호환' },
          { k: '보호 출력', v: 'ALERT + T_CRIT(오픈 드레인, 풀업 필수)' },
          { k: '전원', v: '단일 VDD(0.1µF 디커플링)' },
          { k: '패키지', v: 'VSSOP-10 / WSON-10' }
        ],
        dropIn: [{ note: '차량용 버전·동일 VSSOP/WSON-10 핀 배치' }]
      }
    },
    'TMP4719-Q1': {
      en: {
        subcategory: '3-channel temperature sensor (2 remote + 1 local, SMBus, automotive)',
        whatIs: 'High-accuracy 3-channel temperature sensor (automotive Q1): measures 2 remote (external diode/BJT) + 1 local temperature, reported over SMBus. Same pinout as TMP4719 plus automotive qualification.',
        func: 'Same as TMP4719: 3-point temperature sensing, T_CRIT/ALERT over-temp protection, SMBus reads and thresholds. AEC-Q100 qualified.',
        usedIn: 'Automotive SoC/power-module hot-spot sensing and thermal management, in-vehicle over-temperature protection.',
        desc: 'Automotive high-accuracy 3-channel temperature sensor, SMBus, T_CRIT/ALERT (same pinout as TMP4719, VSSOP/WSON-10).',
        specs: [
          { k: 'Function', v: '3-channel temperature sensing (2 remote + 1 local)' },
          { k: 'Interface', v: 'SMBus (SCL/SDA)' },
          { k: 'Protection outputs', v: 'ALERT + T_CRIT (open-drain)' },
          { k: 'Qualification', v: 'Automotive AEC-Q100 (Q1)' },
          { k: 'Supply', v: 'single VDD' },
          { k: 'Package', v: 'VSSOP-10 / WSON-10' }
        ],
        dropIn: [{ note: 'Same VSSOP/WSON-10 pinout (non-automotive version)' }]
      },
      ja: {
        subcategory: '3ch 温度センサ（リモート 2＋ローカル 1・SMBus・車載）',
        whatIs: '高精度 3 チャネル温度センサ（車載 Q1）：リモート 2（外付け diode/BJT）＋ローカル 1 の温度を計測し SMBus で報告。TMP4719 とピン互換＋車載認証。',
        func: 'TMP4719 と同じ：3 点計測、T_CRIT/ALERT 過熱保護、SMBus 読み出し/しきい値設定。車載 AEC-Q100。',
        usedIn: '車載 SoC/パワーモジュールの熱点計測と熱管理、車載過熱保護。',
        desc: '車載高精度 3ch 温度センサ。SMBus・T_CRIT/ALERT（TMP4719 とピン互換、VSSOP/WSON-10）。',
        specs: [
          { k: '機能', v: '3ch 温度計測（リモート 2＋ローカル 1）' },
          { k: 'インタフェース', v: 'SMBus（SCL/SDA）' },
          { k: '保護出力', v: 'ALERT＋T_CRIT（オープンドレイン）' },
          { k: '認証', v: '車載 AEC-Q100 (Q1)' },
          { k: '電源', v: '単一 VDD' },
          { k: 'パッケージ', v: 'VSSOP-10 / WSON-10' }
        ],
        dropIn: [{ note: '同 VSSOP/WSON-10 ピン配置同一（非車載版）' }]
      },
      ko: {
        subcategory: '3채널 온도 센서(원격 2+로컬 1·SMBus·차량용)',
        whatIs: '고정밀 3채널 온도 센서(차량용 Q1): 원격 2(외장 diode/BJT)+로컬 1 온도를 계측, SMBus로 보고. TMP4719와 핀 호환+차량 인증.',
        func: 'TMP4719와 동일: 3점 계측, T_CRIT/ALERT 과열 보호, SMBus 읽기/문턱 설정. 차량용 AEC-Q100.',
        usedIn: '차량 SoC/전력 모듈 핫스팟 계측과 열 관리, 차량 내 과열 보호.',
        desc: '차량용 고정밀 3채널 온도 센서. SMBus·T_CRIT/ALERT(TMP4719와 핀 호환, VSSOP/WSON-10).',
        specs: [
          { k: '기능', v: '3채널 온도 계측(원격 2+로컬 1)' },
          { k: '인터페이스', v: 'SMBus(SCL/SDA)' },
          { k: '보호 출력', v: 'ALERT + T_CRIT(오픈 드레인)' },
          { k: '인증', v: '차량용 AEC-Q100 (Q1)' },
          { k: '전원', v: '단일 VDD' },
          { k: '패키지', v: 'VSSOP-10 / WSON-10' }
        ],
        dropIn: [{ note: '동일 VSSOP/WSON-10 핀 배치(비차량용 버전)' }]
      }
    },
    'MUX808-Q1': {
      en: {
        subcategory: 'Single 8:1 analog multiplexer (100V, automotive)',
        whatIs: 'High-voltage analog multiplexer (8-to-1): routes one of 8 analog/digital signals to a single common terminal D (bidirectional — usable as mux or demux). Up to 100V supply, 1.8V logic control, automotive.',
        func: 'Address lines A0/A1/A2 select which of S1–S8 connects to D; EN high enables (low turns all off, high-impedance). Bidirectional signal path, break-before-make to avoid shorts; fail-safe logic (logic pins tolerate up to 48V above supply without damage), latch-up immune, low crosstalk −110dB. A solid-state replacement for mechanical switches/relays.',
        usedIn: 'Body control modules (BCM), LIDAR, zone control (ZCU), HEV/EV battery management (BMS), ADAS, EV charging, automotive telematics/infotainment.',
        desc: 'Automotive 100V single 8:1 analog mux, flat RON, latch-up immune, 1.8V logic, break-before-make (TSSOP/WQFN-16).',
        specs: [
          { k: 'Function', v: 'Single 8:1 analog multiplexer (bidirectional)' },
          { k: 'Address lines', v: 'A0/A1/A2 (3-bit select) + EN' },
          { k: 'Single supply', v: '10 – 100 V' },
          { k: 'Dual supply', v: '±10 – ±50 V (asymmetric allowed)' },
          { k: 'RON', v: 'flat RON (value per datasheet)' },
          { k: 'Crosstalk', v: '−110 dB' },
          { k: 'Logic level', v: '1.8V compatible; logic pins have built-in pull-downs' },
          { k: 'Fail-safe logic', v: 'logic pins tolerate up to 48V above supply' },
          { k: 'Switching', v: 'break-before-make, latch-up immune, bidirectional' },
          { k: 'Qualification', v: 'AEC-Q100 grade 1 (−40–125°C)' },
          { k: 'Package', v: 'TSSOP-16 (PW) / WQFN-16 (RUM, thermal pad to GND/VSS recommended)' }
        ],
        dropIn: [{ note: 'Same PW TSSOP-16 pinout (single 8:1); but the 708 is the 44V/±22V, RON 4Ω lower-voltage version — verify supply and specs' }]
      },
      ja: {
        subcategory: '1 回路 8:1 アナログマルチプレクサ（100V・車載）',
        whatIs: '高圧アナログマルチプレクサ（8 選 1）：8 系統のアナログ/デジタル信号のうち 1 系統を共通端子 D へ選択接続（双方向、mux/demux 両用）。最大 100V 電源・1.8V ロジック制御・車載。',
        func: 'アドレス線 A0/A1/A2 で S1~S8 のどれを D に接続するか選択；EN ハイで有効（ローで全オフ・ハイインピーダンス）。双方向信号経路・ブレークビフォアメーク（短絡防止）；フェイルセーフロジック（ロジックピンは電源より 48V 高くても破損しない）・ラッチアップ免疫・低クロストーク −110dB。機械スイッチ/リレーの固体置換。',
        usedIn: 'ボディ制御モジュール（BCM）、LIDAR、ゾーン制御（ZCU）、HEV/EV バッテリ管理（BMS）、ADAS、EV 充電、車載テレマティクス/インフォテインメント。',
        desc: '車載 100V 1 回路 8:1 アナログ mux。フラット RON・ラッチアップ免疫・1.8V ロジック・ブレークビフォアメーク（TSSOP/WQFN-16）。',
        specs: [
          { k: '機能', v: '1 回路 8:1 アナログマルチプレクサ（双方向）' },
          { k: 'アドレス線', v: 'A0/A1/A2（3 ビット選択）＋EN' },
          { k: '単電源範囲', v: '10 ~ 100 V' },
          { k: '両電源範囲', v: '±10 ~ ±50 V（非対称可）' },
          { k: 'RON', v: 'フラット RON（値は datasheet 参照）' },
          { k: 'クロストーク', v: '−110 dB' },
          { k: 'ロジックレベル', v: '1.8V 対応；ロジックピンに内蔵プルダウン' },
          { k: 'フェイルセーフロジック', v: 'ロジック電圧は電源＋48V まで許容' },
          { k: 'スイッチ動作', v: 'ブレークビフォアメーク・ラッチアップ免疫・双方向' },
          { k: '認証', v: '車載 AEC-Q100 grade 1（−40~125°C）' },
          { k: 'パッケージ', v: 'TSSOP-16 (PW) / WQFN-16 (RUM、サーマルパッドは GND/VSS 推奨)' }
        ],
        dropIn: [{ note: '同 PW TSSOP-16 ピン配置同一（1 回路 8:1）；ただし 708 は 44V/±22V・RON 4Ω の低圧版、電源と仕様の適合を確認' }]
      },
      ko: {
        subcategory: '단일 8:1 아날로그 멀티플렉서(100V·차량용)',
        whatIs: '고압 아날로그 멀티플렉서(8선 1): 8계통 아날로그/디지털 신호 중 1계통을 공용 단자 D로 선택 연결(양방향, mux/demux 겸용). 최대 100V 전원·1.8V 로직 제어·차량용.',
        func: '주소선 A0/A1/A2로 S1~S8 중 어느 것을 D에 연결할지 선택; EN 하이로 활성(로우면 전부 오프·고임피던스). 양방향 신호 경로·브레이크 비포 메이크(단락 방지); 페일세이프 로직(로직 핀은 전원보다 48V 높아도 손상 없음)·래치업 면역·저 누화 −110dB. 기계 스위치/릴레이의 고체 대체.',
        usedIn: '바디 제어 모듈(BCM), LIDAR, 존 제어(ZCU), HEV/EV 배터리 관리(BMS), ADAS, EV 충전, 차량 텔레매틱스/인포테인먼트.',
        desc: '차량용 100V 단일 8:1 아날로그 mux. 플랫 RON·래치업 면역·1.8V 로직·브레이크 비포 메이크(TSSOP/WQFN-16).',
        specs: [
          { k: '기능', v: '단일 8:1 아날로그 멀티플렉서(양방향)' },
          { k: '주소선', v: 'A0/A1/A2(3비트 선택) + EN' },
          { k: '단일 전원', v: '10 ~ 100 V' },
          { k: '이중 전원', v: '±10 ~ ±50 V(비대칭 가능)' },
          { k: 'RON', v: '플랫 RON(값은 datasheet 참조)' },
          { k: '누화', v: '−110 dB' },
          { k: '로직 레벨', v: '1.8V 호환; 로직 핀 내장 풀다운' },
          { k: '페일세이프 로직', v: '로직 전압은 전원+48V까지 허용' },
          { k: '스위칭', v: '브레이크 비포 메이크·래치업 면역·양방향' },
          { k: '인증', v: '차량용 AEC-Q100 grade 1(−40~125°C)' },
          { k: '패키지', v: 'TSSOP-16 (PW) / WQFN-16 (RUM, 서멀 패드 GND/VSS 권장)' }
        ],
        dropIn: [{ note: '동일 PW TSSOP-16 핀 배치(단일 8:1); 단 708은 44V/±22V·RON 4Ω 저압판, 전원과 사양 적합 확인' }]
      }
    },
    'MUX708-Q1': {
      en: {
        subcategory: 'Single 8:1 analog multiplexer (44V, low RON, automotive)',
        whatIs: 'Automotive analog multiplexer (8-to-1): routes one of 8 signals to the common terminal D (bidirectional). 44V supply, low 4Ω on-resistance, 1.8V logic control. Same pinout as MUX808-Q1 (lower-voltage version).',
        func: 'A0/A1/A2 select which of S1–S8 connects to D; EN high enables (low turns all off, Hi-Z). Low 4Ω RON, low 3pC charge injection, bidirectional, break-before-make, latch-up immune, fail-safe logic, rail-to-rail. High current: 400mA (WQFN) / 300mA (TSSOP).',
        usedIn: 'Body control modules (BCM), LIDAR, zone control (ZCU), HEV/EV BMS, ADAS, analog/digital mux-demux, EV charging, telematics/infotainment.',
        desc: 'Automotive 44V single 8:1 analog mux, low 4Ω RON, low 3pC charge injection, 1.8V logic, break-before-make (TSSOP/WQFN-16).',
        specs: [
          { k: 'Function', v: 'Single 8:1 analog multiplexer (bidirectional)' },
          { k: 'Address lines', v: 'A0/A1/A2 (3-bit select) + EN' },
          { k: 'Single supply', v: '4.5 – 44 V' },
          { k: 'Dual supply', v: '±4.5 – ±22 V' },
          { k: 'RON', v: '4 Ω (low)' },
          { k: 'Charge injection', v: '3 pC' },
          { k: 'High current', v: '400mA (WQFN max) / 300mA (TSSOP max)' },
          { k: 'Logic level', v: '1.8V compatible; logic pins have built-in pull-downs' },
          { k: 'Switching', v: 'break-before-make, latch-up immune, rail-to-rail, bidirectional, fail-safe logic' },
          { k: 'Qualification', v: 'AEC-Q100 grade 1 (−40–125°C)' },
          { k: 'Package', v: 'TSSOP-16 (PW) / WQFN-16 (RUM, thermal pad to GND/VSS recommended)' }
        ],
        dropIn: [{ note: 'Same PW TSSOP-16 pinout (single 8:1); the 808 is the 100V/±50V high-voltage version (upgrade path — verify RON/current specs)' }]
      },
      ja: {
        subcategory: '1 回路 8:1 アナログマルチプレクサ（44V・低 RON・車載）',
        whatIs: '車載アナログマルチプレクサ（8 選 1）：8 系統の信号から 1 系統を共通端子 D へ（双方向）。44V 電源・低オン抵抗 4Ω・1.8V ロジック制御。MUX808-Q1 とピン互換（低圧版）。',
        func: 'A0/A1/A2 で S1~S8 の 1 系統を D へ接続；EN ハイで有効（ローで全オフ・ハイインピーダンス）。低 RON 4Ω・低電荷注入 3pC・双方向・ブレークビフォアメーク・ラッチアップ免疫・フェイルセーフロジック・レールツーレール。大電流対応 400mA(WQFN)/300mA(TSSOP)。',
        usedIn: 'ボディ制御モジュール（BCM）、LIDAR、ゾーン制御（ZCU）、HEV/EV バッテリ管理（BMS）、ADAS、アナログ/デジタル mux-demux、EV 充電、車載テレマティクス/インフォテインメント。',
        desc: '車載 44V 1 回路 8:1 アナログ mux。低 RON 4Ω・低電荷注入 3pC・1.8V ロジック・ブレークビフォアメーク（TSSOP/WQFN-16）。',
        specs: [
          { k: '機能', v: '1 回路 8:1 アナログマルチプレクサ（双方向）' },
          { k: 'アドレス線', v: 'A0/A1/A2（3 ビット選択）＋EN' },
          { k: '単電源範囲', v: '4.5 ~ 44 V' },
          { k: '両電源範囲', v: '±4.5 ~ ±22 V' },
          { k: 'RON', v: '4 Ω（低）' },
          { k: '電荷注入', v: '3 pC' },
          { k: '大電流', v: '400mA(WQFN max) / 300mA(TSSOP max)' },
          { k: 'ロジックレベル', v: '1.8V 対応；ロジックピンに内蔵プルダウン' },
          { k: 'スイッチ動作', v: 'ブレークビフォアメーク・ラッチアップ免疫・レールツーレール・双方向・フェイルセーフロジック' },
          { k: '認証', v: '車載 AEC-Q100 grade 1（−40~125°C）' },
          { k: 'パッケージ', v: 'TSSOP-16 (PW) / WQFN-16 (RUM、サーマルパッドは GND/VSS 推奨)' }
        ],
        dropIn: [{ note: '同 PW TSSOP-16 ピン配置同一（1 回路 8:1）；808 は 100V/±50V 高圧版（アップグレード用、RON/電流仕様を確認）' }]
      },
      ko: {
        subcategory: '단일 8:1 아날로그 멀티플렉서(44V·저 RON·차량용)',
        whatIs: '차량용 아날로그 멀티플렉서(8선 1): 8계통 신호 중 1계통을 공용 단자 D로(양방향). 44V 전원·낮은 온저항 4Ω·1.8V 로직 제어. MUX808-Q1과 핀 호환(저압판).',
        func: 'A0/A1/A2로 S1~S8 중 1계통을 D에 연결; EN 하이로 활성(로우면 전부 오프·Hi-Z). 저 RON 4Ω·저 전하 주입 3pC·양방향·브레이크 비포 메이크·래치업 면역·페일세이프 로직·레일투레일. 대전류 400mA(WQFN)/300mA(TSSOP).',
        usedIn: '바디 제어 모듈(BCM), LIDAR, 존 제어(ZCU), HEV/EV BMS, ADAS, 아날로그/디지털 mux-demux, EV 충전, 텔레매틱스/인포테인먼트.',
        desc: '차량용 44V 단일 8:1 아날로그 mux. 저 RON 4Ω·저 전하 주입 3pC·1.8V 로직·브레이크 비포 메이크(TSSOP/WQFN-16).',
        specs: [
          { k: '기능', v: '단일 8:1 아날로그 멀티플렉서(양방향)' },
          { k: '주소선', v: 'A0/A1/A2(3비트 선택) + EN' },
          { k: '단일 전원', v: '4.5 ~ 44 V' },
          { k: '이중 전원', v: '±4.5 ~ ±22 V' },
          { k: 'RON', v: '4 Ω(낮음)' },
          { k: '전하 주입', v: '3 pC' },
          { k: '대전류', v: '400mA(WQFN max) / 300mA(TSSOP max)' },
          { k: '로직 레벨', v: '1.8V 호환; 로직 핀 내장 풀다운' },
          { k: '스위칭', v: '브레이크 비포 메이크·래치업 면역·레일투레일·양방향·페일세이프 로직' },
          { k: '인증', v: '차량용 AEC-Q100 grade 1(−40~125°C)' },
          { k: '패키지', v: 'TSSOP-16 (PW) / WQFN-16 (RUM, 서멀 패드 GND/VSS 권장)' }
        ],
        dropIn: [{ note: '동일 PW TSSOP-16 핀 배치(단일 8:1); 808은 100V/±50V 고압판(업그레이드용, RON/전류 사양 확인)' }]
      }
    },
    'MUX809-Q1': {
      en: {
        subcategory: 'Dual 4:1 differential analog multiplexer (100V, automotive)',
        whatIs: 'High-voltage differential analog multiplexer (dual 4-to-1): two banks of 4 signals each route one channel to DA / DB, both banks sharing the same address lines — suited to differential/two-wire signal selection. Up to 100V, 1.8V logic, automotive.',
        func: 'A0/A1 simultaneously select the same-numbered channel in bank A (S1A–S4A→DA) and bank B (S1B–S4B→DB); EN high enables (low = all off, Hi-Z). Bidirectional, break-before-make, latch-up immune, fail-safe logic, low crosstalk. Same family/package as MUX808-Q1 but configured as dual 4:1 (different pin names/assignments — not pin-to-pin).',
        usedIn: 'Differential signal muxing, BCM, LIDAR, ZCU, HEV/EV BMS, ADAS, EV charging, telematics/infotainment.',
        desc: 'Automotive 100V dual 4:1 differential analog mux, flat RON, latch-up immune, 1.8V logic, break-before-make (TSSOP/WQFN-16).',
        specs: [
          { k: 'Function', v: 'Dual 4:1 differential analog multiplexer (bidirectional)' },
          { k: 'Address lines', v: 'A0/A1 (2-bit select, shared by both banks) + EN' },
          { k: 'Single supply', v: '10 – 100 V' },
          { k: 'Dual supply', v: '±10 – ±50 V (asymmetric allowed)' },
          { k: 'RON', v: 'flat RON (value per datasheet)' },
          { k: 'Crosstalk', v: '−110 dB' },
          { k: 'Logic level', v: '1.8V compatible; logic pins have built-in pull-downs' },
          { k: 'Fail-safe logic', v: 'logic pins tolerate up to 48V above supply' },
          { k: 'Switching', v: 'break-before-make, latch-up immune, bidirectional' },
          { k: 'Qualification', v: 'AEC-Q100 grade 1 (−40–125°C)' },
          { k: 'Package', v: 'TSSOP-16 (PW) / WQFN-16 (RUM, thermal pad to GND/VSS recommended)' }
        ]
      },
      ja: {
        subcategory: '2 回路 4:1 差動アナログマルチプレクサ（100V・車載）',
        whatIs: '高圧差動アナログマルチプレクサ（デュアル 4 選 1）：各 4 系統の 2 バンクからそれぞれ 1 系統を DA / DB へ選択、両バンクは同一アドレス線を共有→差動/2 線信号の選択に好適。最大 100V・1.8V ロジック・車載。',
        func: 'A0/A1 で A バンク（S1A~S4A→DA）と B バンク（S1B~S4B→DB）の同番号チャネルを同時選択；EN ハイで有効（ローで全オフ・ハイインピーダンス）。双方向・ブレークビフォアメーク・ラッチアップ免疫・フェイルセーフロジック・低クロストーク。MUX808-Q1 と同シリーズ・同パッケージだが構成はデュアル 4:1（ピン名/割当が異なり pin-to-pin ではない）。',
        usedIn: '差動信号の多重化、BCM、LIDAR、ZCU、HEV/EV BMS、ADAS、EV 充電、車載テレマティクス/インフォテインメント。',
        desc: '車載 100V 2 回路 4:1 差動アナログ mux。フラット RON・ラッチアップ免疫・1.8V ロジック・ブレークビフォアメーク（TSSOP/WQFN-16）。',
        specs: [
          { k: '機能', v: '2 回路 4:1 差動アナログマルチプレクサ（双方向）' },
          { k: 'アドレス線', v: 'A0/A1（2 ビット選択、両バンク共有）＋EN' },
          { k: '単電源範囲', v: '10 ~ 100 V' },
          { k: '両電源範囲', v: '±10 ~ ±50 V（非対称可）' },
          { k: 'RON', v: 'フラット RON（値は datasheet 参照）' },
          { k: 'クロストーク', v: '−110 dB' },
          { k: 'ロジックレベル', v: '1.8V 対応；ロジックピンに内蔵プルダウン' },
          { k: 'フェイルセーフロジック', v: 'ロジック電圧は電源＋48V まで許容' },
          { k: 'スイッチ動作', v: 'ブレークビフォアメーク・ラッチアップ免疫・双方向' },
          { k: '認証', v: '車載 AEC-Q100 grade 1（−40~125°C）' },
          { k: 'パッケージ', v: 'TSSOP-16 (PW) / WQFN-16 (RUM、サーマルパッドは GND/VSS 推奨)' }
        ]
      },
      ko: {
        subcategory: '듀얼 4:1 차동 아날로그 멀티플렉서(100V·차량용)',
        whatIs: '고압 차동 아날로그 멀티플렉서(듀얼 4선 1): 각 4계통 2뱅크에서 각각 1계통을 DA / DB로 선택, 두 뱅크는 같은 주소선을 공유 → 차동/2선 신호 선택에 적합. 최대 100V·1.8V 로직·차량용.',
        func: 'A0/A1로 A뱅크(S1A~S4A→DA)와 B뱅크(S1B~S4B→DB)의 같은 번호 채널을 동시 선택; EN 하이로 활성(로우면 전부 오프·Hi-Z). 양방향·브레이크 비포 메이크·래치업 면역·페일세이프 로직·저 누화. MUX808-Q1과 같은 시리즈·패키지지만 구성이 듀얼 4:1(핀 이름/배치가 달라 pin-to-pin 아님).',
        usedIn: '차동 신호 다중화, BCM, LIDAR, ZCU, HEV/EV BMS, ADAS, EV 충전, 텔레매틱스/인포테인먼트.',
        desc: '차량용 100V 듀얼 4:1 차동 아날로그 mux. 플랫 RON·래치업 면역·1.8V 로직·브레이크 비포 메이크(TSSOP/WQFN-16).',
        specs: [
          { k: '기능', v: '듀얼 4:1 차동 아날로그 멀티플렉서(양방향)' },
          { k: '주소선', v: 'A0/A1(2비트 선택, 두 뱅크 공유) + EN' },
          { k: '단일 전원', v: '10 ~ 100 V' },
          { k: '이중 전원', v: '±10 ~ ±50 V(비대칭 가능)' },
          { k: 'RON', v: '플랫 RON(값은 datasheet 참조)' },
          { k: '누화', v: '−110 dB' },
          { k: '로직 레벨', v: '1.8V 호환; 로직 핀 내장 풀다운' },
          { k: '페일세이프 로직', v: '로직 전압은 전원+48V까지 허용' },
          { k: '스위칭', v: '브레이크 비포 메이크·래치업 면역·양방향' },
          { k: '인증', v: '차량용 AEC-Q100 grade 1(−40~125°C)' },
          { k: '패키지', v: 'TSSOP-16 (PW) / WQFN-16 (RUM, 서멀 패드 GND/VSS 권장)' }
        ]
      }
    },
    'SN74CBTLV3126-Q1': {
      en: {
        subcategory: 'Quad FET bus switch (low voltage, automotive)',
        whatIs: "Quad FET bus switch: 4 independent low-resistance FET channels, each with its own OE controlling whether A↔B conducts. When on, it is a near-zero-drop pass-through (not a logic gate — just an electronic switch), passing bus signals bidirectionally.",
        func: 'Each channel has 1A/1B terminals and an independent OE (active-high): OE high connects A↔B (low RON), OE low disconnects (Hi-Z). No logic, no amplification — purely connect/disconnect for buses or signal isolation. Low-voltage ≤5V, automotive.',
        usedIn: 'Bus isolation/sharing (memory, SPI/I2C multi-master switching), signal muxing, hot-plug isolation, low-voltage signal routing.',
        desc: 'Automotive quad FET bus switch, independent OE (active-high), low RON, bidirectional pass-through (TSSOP/SOT-14).',
        specs: [
          { k: 'Function', v: 'Quad FET bus switch (bidirectional pass-through, not a logic gate)' },
          { k: 'Enable', v: 'independent OE per channel, active-high' },
          { k: 'Channels', v: '4 (1A/1B – 4A/4B)' },
          { k: 'Conduction', v: 'low-RON FET pass-through, near-zero drop' },
          { k: 'Supply', v: 'low voltage (CBTLV family, ≤5V; range per datasheet)' },
          { k: 'Qualification', v: 'Automotive AEC-Q100' },
          { k: 'Package', v: 'TSSOP-14 (PW) / SOT-14 (DYY); thermal pad solder-optional — float or tie to GND' }
        ]
      },
      ja: {
        subcategory: '4 回路 FET バススイッチ（低電圧・車載）',
        whatIs: '4 回路 FET バススイッチ：4 個の独立した低抵抗 FET チャネル、各々 OE で A↔B の導通を制御。導通時はほぼゼロ電圧降下の直通（論理ゲートではなく「電子スイッチ」）、バス信号を双方向に伝達。',
        func: '各チャネルに 1A/1B 両端と独立 OE（ハイで導通）：OE ハイで A↔B 直通（低 RON）、ローで遮断（ハイインピーダンス）。論理演算も増幅もせず「接続/切断」だけを担い、バスや信号の絶縁に使う。低電圧 5V 以下・車載。',
        usedIn: 'バス絶縁/共有（メモリ、SPI/I2C マルチマスタ切替）、信号多重化、ホットプラグ絶縁、低電圧の信号ルーティング。',
        desc: '車載 4 回路 FET バススイッチ。独立 OE（ハイ有効）・低 RON・双方向直通（TSSOP/SOT-14）。',
        specs: [
          { k: '機能', v: '4 回路 FET バススイッチ（双方向直通、論理ゲートではない）' },
          { k: 'イネーブル', v: 'チャネル毎独立 OE、ハイで導通' },
          { k: 'チャネル数', v: '4（1A/1B ~ 4A/4B）' },
          { k: '導通方式', v: '低 RON FET 直通・ほぼゼロ電圧降下' },
          { k: '電源', v: '低電圧（CBTLV シリーズ、≤5V；実範囲は datasheet 参照）' },
          { k: '認証', v: '車載 AEC-Q100' },
          { k: 'パッケージ', v: 'TSSOP-14 (PW) / SOT-14 (DYY)；サーマルパッドは半田不要——浮きか GND 接続' }
        ]
      },
      ko: {
        subcategory: '4채널 FET 버스 스위치(저전압·차량용)',
        whatIs: '4채널 FET 버스 스위치: 4개의 독립 저저항 FET 채널, 각각 OE로 A↔B 도통을 제어. 도통 시 거의 제로 전압 강하 직통(논리 게이트가 아닌 "전자 스위치"), 버스 신호를 양방향 전달.',
        func: '각 채널에 1A/1B 양단과 독립 OE(하이로 도통): OE 하이면 A↔B 직통(저 RON), 로우면 차단(Hi-Z). 논리 연산도 증폭도 없이 "연결/차단"만 담당, 버스나 신호 절연에 사용. 저전압 5V 이하·차량용.',
        usedIn: '버스 절연/공유(메모리, SPI/I2C 멀티마스터 전환), 신호 다중화, 핫플러그 절연, 저전압 신호 라우팅.',
        desc: '차량용 4채널 FET 버스 스위치. 독립 OE(하이 유효)·저 RON·양방향 직통(TSSOP/SOT-14).',
        specs: [
          { k: '기능', v: '4채널 FET 버스 스위치(양방향 직통, 논리 게이트 아님)' },
          { k: '인에이블', v: '채널별 독립 OE, 하이로 도통' },
          { k: '채널 수', v: '4(1A/1B ~ 4A/4B)' },
          { k: '도통 방식', v: '저 RON FET 직통·거의 제로 전압 강하' },
          { k: '전원', v: '저전압(CBTLV 시리즈, ≤5V; 실제 범위는 datasheet 참조)' },
          { k: '인증', v: '차량용 AEC-Q100' },
          { k: '패키지', v: 'TSSOP-14 (PW) / SOT-14 (DYY); 서멀 패드 납땜 불필요 - 플로팅 또는 GND 접속' }
        ]
      }
    },
    'TXB0606': {
      en: {
        subcategory: '6-bit bidirectional level shifter (auto direction)',
        whatIs: 'Six-bit bidirectional level shifter: passes 6 digital signals bidirectionally between two voltage domains (port A / port B), auto-detecting direction with no direction-control pin. Level translation for fast interfaces (QSPI/OSPI/eSPI).',
        func: 'Each Ax↔Bx pair auto-detects signal direction and translates levels (port A 0.9–2V, port B 1.65–3.6V; VCCA may be <, =, or > VCCB). OE low puts all outputs in tri-state; if either VCC is grounded everything goes Hi-Z (VCC isolation). Schmitt-trigger inputs for noise immunity; no direction-control signal needed.',
        usedIn: 'SPI/QSPI/OSPI/eSPI level shifting between MCU and peripherals, 1.8V↔3.3V bridging, sensor/memory high-speed data-line translation.',
        desc: '6-bit auto-direction bidirectional level shifter, port A 0.9–2V / port B 1.65–3.6V, >130Mbps, Schmitt inputs, OE tri-state (WQFN/SOT-16).',
        specs: [
          { k: 'Function', v: '6-bit bidirectional level shift (auto direction, no direction pin)' },
          { k: 'Port A voltage', v: '0.9 – 2 V' },
          { k: 'Port B voltage', v: '1.65 – 3.6 V (VCCA may be <, =, > VCCB)' },
          { k: 'Data rate', v: '>130Mbps (15pF) / >100Mbps (100pF) @1.8V↔3.3V' },
          { k: 'Fast interfaces', v: 'QSPI / OSPI / eSPI' },
          { k: 'Inputs', v: 'Schmitt trigger (slow/noisy tolerant)' },
          { k: 'OE', v: 'low = all tri-state; referenced to VCCA' },
          { k: 'VCC isolation', v: 'either VCC grounded → all Hi-Z' },
          { k: 'Protection', v: 'I_OFF partial power-down; latch-up >100mA (JESD78 II); ESD HBM 2kV/CDM 1kV' },
          { k: 'Package', v: 'WQFN-16 (RGY/BQB) / SOT-16 (DYY/PW); exposed pad to secondary GND or open' }
        ]
      },
      ja: {
        subcategory: '6 ビット双方向レベルシフタ（自動方向）',
        whatIs: '6 ビット双方向レベルシフタ：2 つの電圧ドメイン（A ポート / B ポート）間で 6 本のデジタル信号を双方向伝達、方向を自動検出し方向制御ピン不要。高速インタフェース（QSPI/OSPI/eSPI）のレベル変換用。',
        func: '各 Ax↔Bx ペアが信号方向を自動判別してレベル変換（A ポート 0.9~2V、B ポート 1.65~3.6V、VCCA は VCCB より <、=、> いずれも可）。OE ローで全出力トライステート；どちらかの VCC が接地なら全ピン Hi-Z（VCC アイソレーション）。シュミットトリガ入力で耐ノイズ；方向制御信号不要。',
        usedIn: 'MCU と周辺間の SPI/QSPI/OSPI/eSPI レベル変換、1.8V↔3.3V ブリッジ、センサ/メモリ高速データ線の電圧変換。',
        desc: '6 ビット自動双方向レベルシフタ。A ポート 0.9~2V / B ポート 1.65~3.6V、>130Mbps、シュミット入力、OE トライステート（WQFN/SOT-16）。',
        specs: [
          { k: '機能', v: '6 ビット双方向レベル変換（自動方向、方向ピン不要）' },
          { k: 'A ポート電圧', v: '0.9 ~ 2 V' },
          { k: 'B ポート電圧', v: '1.65 ~ 3.6 V（VCCA は <、=、> VCCB いずれも可）' },
          { k: 'データレート', v: '>130Mbps(15pF) / >100Mbps(100pF) @1.8V↔3.3V' },
          { k: '高速インタフェース', v: 'QSPI / OSPI / eSPI' },
          { k: '入力', v: 'シュミットトリガ（低速/ノイズ耐性）' },
          { k: 'OE', v: 'ローで全トライステート；VCCA 基準' },
          { k: 'VCC アイソレーション', v: 'どちらかの VCC 接地→全 Hi-Z' },
          { k: '保護', v: 'I_OFF 部分パワーダウン；ラッチアップ >100mA(JESD78 II)；ESD HBM 2kV/CDM 1kV' },
          { k: 'パッケージ', v: 'WQFN-16 (RGY/BQB) / SOT-16 (DYY/PW)；露出パッドは二次接地か開放' }
        ]
      },
      ko: {
        subcategory: '6비트 양방향 레벨 시프터(자동 방향)',
        whatIs: '6비트 양방향 레벨 시프터: 두 전압 도메인(A 포트 / B 포트) 사이에서 6개 디지털 신호를 양방향 전달, 방향 자동 감지로 방향 제어 핀 불필요. 고속 인터페이스(QSPI/OSPI/eSPI) 레벨 변환용.',
        func: '각 Ax↔Bx 쌍이 신호 방향을 자동 판별해 레벨 변환(A 포트 0.9~2V, B 포트 1.65~3.6V, VCCA는 VCCB보다 <, =, > 모두 가능). OE 로우면 전체 출력 트라이스테이트; 어느 한 VCC가 접지되면 전부 Hi-Z(VCC 아이솔레이션). 슈미트 트리거 입력으로 잡음 내성; 방향 제어 신호 불필요.',
        usedIn: 'MCU와 주변 장치 간 SPI/QSPI/OSPI/eSPI 레벨 변환, 1.8V↔3.3V 브리징, 센서/메모리 고속 데이터선 전압 변환.',
        desc: '6비트 자동 양방향 레벨 시프터. A 포트 0.9~2V / B 포트 1.65~3.6V, >130Mbps, 슈미트 입력, OE 트라이스테이트(WQFN/SOT-16).',
        specs: [
          { k: '기능', v: '6비트 양방향 레벨 변환(자동 방향, 방향 핀 불필요)' },
          { k: 'A 포트 전압', v: '0.9 ~ 2 V' },
          { k: 'B 포트 전압', v: '1.65 ~ 3.6 V(VCCA는 <, =, > VCCB 모두 가능)' },
          { k: '데이터 속도', v: '>130Mbps(15pF) / >100Mbps(100pF) @1.8V↔3.3V' },
          { k: '고속 인터페이스', v: 'QSPI / OSPI / eSPI' },
          { k: '입력', v: '슈미트 트리거(저속/잡음 내성)' },
          { k: 'OE', v: '로우면 전체 트라이스테이트; VCCA 기준' },
          { k: 'VCC 아이솔레이션', v: '어느 한 VCC 접지 → 전부 Hi-Z' },
          { k: '보호', v: 'I_OFF 부분 전원 차단; 래치업 >100mA(JESD78 II); ESD HBM 2kV/CDM 1kV' },
          { k: '패키지', v: 'WQFN-16 (RGY/BQB) / SOT-16 (DYY/PW); 노출 패드는 2차 접지 또는 개방' }
        ]
      }
    },
    'TMUX2819': {
      en: {
        subcategory: '2:1 single-channel analog switch (±5.5V beyond-supply, power-off protection)',
        whatIs: '2-to-1 single-channel analog switch: routes SA or SB to the common terminal D; SEL selects, EN enables. Ultra-low 0.16Ω on-resistance, signals may exceed the supply rails (±5.5V beyond-supply), and power-off protection keeps pins Hi-Z with no leakage when VDD=0.',
        func: 'SEL decides whether SA or SB connects to D; EN high enables, low disconnects all (Hi-Z). Power-off protection: with VDD removed all switches stay OFF, signal pins neither conduct nor back-feed — protecting downstream circuits. 1.2V/1.8V logic compatible. Solid-state replacement for mechanical switches.',
        usedIn: 'Signal switching in battery-powered/hot-swap systems, sensor muxing, audio/video routing, signal isolation needing power-off protection.',
        desc: '±5.5V beyond-supply 2:1 single-channel analog switch, 0.16Ω Ron, power-off protection, 1.2V logic (WSON-8).',
        specs: [
          { k: 'Function', v: '2:1 single-channel analog switch (bidirectional)' },
          { k: 'Ron', v: '0.16 Ω (ultra-low)' },
          { k: 'Signal range', v: '±5.5V beyond-supply (may exceed rails)' },
          { k: 'Power-off protection', v: 'yes (Hi-Z at VDD=0, no back-feed)' },
          { k: 'Logic level', v: '1.2V / 1.8V compatible' },
          { k: 'Supply', v: 'single VDD (see datasheet)' },
          { k: 'Package', v: 'WSON-8 (DSG), EP to GND' }
        ],
        dropIn: [{ note: 'Same DSG WSON-8 pinout (2:1 1ch); TMUX4819 is the ±15V beyond-supply high-voltage version' }]
      },
      ja: {
        subcategory: '2:1 1ch アナログスイッチ（±5.5V Beyond-Supply・電源断保護）',
        whatIs: '2 選 1 の 1 チャネルアナログスイッチ：SA / SB のどちらかを共通端子 D へ接続、SEL で選択・EN でイネーブル。0.16Ω 超低オン抵抗・信号が電源レールを超えられる（±5.5V beyond-supply）・電源断保護（VDD=0 でピンは Hi-Z・無漏洩）。',
        func: 'SEL で SA か SB を D へ接続；EN ハイで有効、ローで全遮断（Hi-Z）。電源断保護：VDD 喪失時も全スイッチ OFF、信号ピンは導通も逆流もせず下流を保護。1.2V/1.8V ロジック対応。機械スイッチの固体置換。',
        usedIn: 'バッテリ駆動/ホットスワップ系の信号切替、センサ多重化、オーディオ/ビデオ選択、電源断保護が必要な信号絶縁。',
        desc: '±5.5V beyond-supply 2:1 1ch アナログスイッチ。0.16Ω Ron・電源断保護・1.2V ロジック（WSON-8）。',
        specs: [
          { k: '機能', v: '2:1 1ch アナログスイッチ（双方向）' },
          { k: 'Ron', v: '0.16 Ω（超低）' },
          { k: '信号範囲', v: '±5.5V beyond-supply（電源レール超え可）' },
          { k: '電源断保護', v: 'あり（VDD=0 で Hi-Z・逆流なし）' },
          { k: 'ロジックレベル', v: '1.2V / 1.8V 対応' },
          { k: '電源', v: '単一 VDD（datasheet 参照）' },
          { k: 'パッケージ', v: 'WSON-8 (DSG)、EP は GND 接続' }
        ],
        dropIn: [{ note: '同 DSG WSON-8 ピン配置同一（2:1 1ch）；TMUX4819 は ±15V beyond-supply の高圧版' }]
      },
      ko: {
        subcategory: '2:1 단일 채널 아날로그 스위치(±5.5V Beyond-Supply·전원 차단 보호)',
        whatIs: '2선 1 단일 채널 아날로그 스위치: SA / SB 중 하나를 공용 단자 D에 연결, SEL로 선택·EN으로 인에이블. 0.16Ω 초저 온저항·신호가 전원 레일을 초과 가능(±5.5V beyond-supply)·전원 차단 보호(VDD=0 시 핀 Hi-Z·무누설).',
        func: 'SEL로 SA 또는 SB를 D에 연결; EN 하이로 활성, 로우면 전부 차단(Hi-Z). 전원 차단 보호: VDD 상실 시에도 전체 스위치 OFF, 신호 핀은 도통도 역류도 없이 하류 보호. 1.2V/1.8V 로직 호환. 기계 스위치의 고체 대체.',
        usedIn: '배터리 구동/핫스왑 시스템의 신호 전환, 센서 다중화, 오디오/비디오 라우팅, 전원 차단 보호가 필요한 신호 절연.',
        desc: '±5.5V beyond-supply 2:1 단일 채널 아날로그 스위치. 0.16Ω Ron·전원 차단 보호·1.2V 로직(WSON-8).',
        specs: [
          { k: '기능', v: '2:1 단일 채널 아날로그 스위치(양방향)' },
          { k: 'Ron', v: '0.16 Ω(초저)' },
          { k: '신호 범위', v: '±5.5V beyond-supply(레일 초과 가능)' },
          { k: '전원 차단 보호', v: '있음(VDD=0 시 Hi-Z·역류 없음)' },
          { k: '로직 레벨', v: '1.2V / 1.8V 호환' },
          { k: '전원', v: '단일 VDD(datasheet 참조)' },
          { k: '패키지', v: 'WSON-8 (DSG), EP는 GND 접속' }
        ],
        dropIn: [{ note: '동일 DSG WSON-8 핀 배치(2:1 1ch); TMUX4819는 ±15V beyond-supply 고압판' }]
      }
    },
    'TMUX2821': {
      en: {
        subcategory: '1:1 Dual-Channel Analog Switch (±5.5V Beyond-Supply, Powered-Off Protection)',
        whatIs: 'Dual independent SPST analog switch: two separate S-D channels (S1-D1 controlled by SEL1, S2-D2 by SEL2) switch independently. 0.16Ω Ron, beyond-supply, powered-off protection.',
        func: 'SEL1 controls S1-D1, SEL2 controls S2-D2, the two channels fully independent. Powered-off protection: with VDD=0 all switches are OFF with no back-current. 1.2V/1.8V logic. Same package as TMUX2819 (different configuration, different pin names).',
        usedIn: 'Dual signal switching, sensor/power path switching, hot-swap isolation, signal routing needing independent on/off.',
        desc: '±5.5V beyond-supply 1:1 dual-channel analog switch, 0.16Ω Ron, powered-off protection, 1.2V logic (WSON-8).',
        specs: [
          { k: 'Function', v: '1:1 dual-channel analog switch (two independent SPST)' },
          { k: 'Ron', v: '0.16 Ω (ultra-low)' },
          { k: 'Signal range', v: '±5.5V beyond-supply' },
          { k: 'Powered-off protection', v: 'Yes' },
          { k: 'Logic level', v: '1.2V / 1.8V compatible' },
          { k: 'Package', v: 'WSON-8 (DSG), EP to GND' }
        ]
      },
      ja: {
        subcategory: '1:1 デュアルチャネルアナログスイッチ（±5.5V Beyond-Supply、電源オフ保護）',
        whatIs: '2 つの独立した SPST アナログスイッチ：それぞれの S-D チャネル（S1-D1 は SEL1、S2-D2 は SEL2 で制御）が独立にオンオフ。0.16Ω Ron、beyond-supply、電源オフ保護。',
        func: 'SEL1 が S1-D1、SEL2 が S2-D2 を制御し、2 チャネルは完全に独立。電源オフ保護：VDD=0 時に全 OFF で逆流なし。1.2V/1.8V ロジック。TMUX2819 と同一パッケージ（構成が異なりピン名も異なる）。',
        usedIn: '2 系統の信号切替、センサ/電源経路の切替、ホットスワップ絶縁、独立オンオフが必要な信号ルーティング。',
        desc: '±5.5V beyond-supply 1:1 デュアルチャネルアナログスイッチ、0.16Ω Ron、電源オフ保護、1.2V ロジック（WSON-8）。',
        specs: [
          { k: '機能', v: '1:1 デュアルチャネルアナログスイッチ（2 独立 SPST）' },
          { k: 'Ron', v: '0.16 Ω（超低）' },
          { k: '信号範囲', v: '±5.5V beyond-supply' },
          { k: '電源オフ保護', v: 'あり' },
          { k: 'ロジックレベル', v: '1.2V / 1.8V 互換' },
          { k: 'パッケージ', v: 'WSON-8 (DSG)、EP は GND 接続' }
        ]
      },
      ko: {
        subcategory: '1:1 듀얼 채널 아날로그 스위치(±5.5V Beyond-Supply, 전원 오프 보호)',
        whatIs: '2개의 독립 SPST 아날로그 스위치: 각각의 S-D 채널(S1-D1은 SEL1, S2-D2는 SEL2로 제어)이 독립적으로 온오프. 0.16Ω Ron, beyond-supply, 전원 오프 보호.',
        func: 'SEL1이 S1-D1, SEL2가 S2-D2를 제어하며 두 채널은 완전히 독립. 전원 오프 보호: VDD=0일 때 전부 OFF, 역류 없음. 1.2V/1.8V 로직. TMUX2819와 동일 패키지(구성이 다르고 핀 이름도 다름).',
        usedIn: '2계통 신호 스위칭, 센서/전원 경로 전환, 핫스왑 절연, 독립 온오프가 필요한 신호 라우팅.',
        desc: '±5.5V beyond-supply 1:1 듀얼 채널 아날로그 스위치, 0.16Ω Ron, 전원 오프 보호, 1.2V 로직(WSON-8).',
        specs: [
          { k: '기능', v: '1:1 듀얼 채널 아날로그 스위치(2 독립 SPST)' },
          { k: 'Ron', v: '0.16 Ω(초저)' },
          { k: '신호 범위', v: '±5.5V beyond-supply' },
          { k: '전원 오프 보호', v: '있음' },
          { k: '로직 레벨', v: '1.2V / 1.8V 호환' },
          { k: '패키지', v: 'WSON-8 (DSG), EP는 GND 접속' }
        ]
      }
    },
    'TMUX182-SEP': {
      en: {
        subcategory: 'Single 8:1 Analog Multiplexer (15V, Radiation-Tolerant SEP)',
        whatIs: 'Radiation-tolerant analog multiplexer (8-to-1): one of eight S0-S7 lines connects to the common D, selected by address A0/A1/A2, enabled by EN. 15V supply, 1.8V logic, aerospace-grade single-event protection (SEP).',
        func: 'A[2:0] selects one of S0-S7 to D; EN is active-low (high disconnects all, low conducts per address). Radiation-tolerant (SEP), bidirectional, suited to space/high-reliability environments.',
        usedIn: 'Satellite/space-payload analog multiplexing, radiation-tolerant measurement front ends, aerospace sensor signal routing.',
        desc: 'Radiation-tolerant 15V single 8:1 analog multiplexer, A[2:0] address, EN active-low, 1.8V logic (SOT-23-16).',
        specs: [
          { k: 'Function', v: 'Single 8:1 analog multiplexer (bidirectional)' },
          { k: 'Address lines', v: 'A0/A1/A2 (3-bit selects 8) + EN (active-low)' },
          { k: 'Supply', v: '15V (single) / dual supply (VSS see datasheet)' },
          { k: 'Logic level', v: '1.8V compatible' },
          { k: 'Radiation tolerance', v: 'SEP (single-event protection, aerospace-grade)' },
          { k: 'Package', v: 'SOT-23-THIN-16 (DYY)' }
        ]
      },
      ja: {
        subcategory: '1 系統 8:1 アナログマルチプレクサ（15V、耐放射線 SEP）',
        whatIs: '耐放射線アナログマルチプレクサ（8-to-1）：S0-S7 の 8 系統から 1 つを共通端 D に接続、A0/A1/A2 アドレスで選択、EN で有効化。15V 電源、1.8V ロジック、航空宇宙グレードの単一事象防護（SEP）。',
        func: 'A[2:0] が S0-S7 の 1 つを D に選択；EN は active-low（ハイで全遮断、ローでアドレスに従い導通）。耐放射線（SEP）、双方向信号、宇宙/高信頼性環境向け。',
        usedIn: '衛星/宇宙ペイロードのアナログ多重化、耐放射線計測フロントエンド、航空宇宙センサの信号選択。',
        desc: '耐放射線 15V 1 系統 8:1 アナログマルチプレクサ、A[2:0] アドレス、EN active-low、1.8V ロジック（SOT-23-16）。',
        specs: [
          { k: '機能', v: '1 系統 8:1 アナログマルチプレクサ（双方向）' },
          { k: 'アドレス線', v: 'A0/A1/A2（3 ビットで 8 選択）+ EN（active-low）' },
          { k: '電源', v: '15V（単）/ 両電源（VSS はデータシート参照）' },
          { k: 'ロジックレベル', v: '1.8V 互換' },
          { k: '耐放射線', v: 'SEP（単一事象防護、航空宇宙グレード）' },
          { k: 'パッケージ', v: 'SOT-23-THIN-16 (DYY)' }
        ]
      },
      ko: {
        subcategory: '1계통 8:1 아날로그 멀티플렉서(15V, 내방사선 SEP)',
        whatIs: '내방사선 아날로그 멀티플렉서(8-to-1): S0-S7 8계통 중 하나를 공통단 D에 연결, A0/A1/A2 주소로 선택, EN으로 활성화. 15V 전원, 1.8V 로직, 항공우주급 단일 사건 보호(SEP).',
        func: 'A[2:0]가 S0-S7 중 하나를 D에 선택; EN은 active-low(하이면 전부 차단, 로우면 주소에 따라 도통). 내방사선(SEP), 양방향 신호, 우주/고신뢰성 환경용.',
        usedIn: '위성/우주 페이로드 아날로그 멀티플렉싱, 내방사선 계측 프런트엔드, 항공우주 센서 신호 라우팅.',
        desc: '내방사선 15V 1계통 8:1 아날로그 멀티플렉서, A[2:0] 주소, EN active-low, 1.8V 로직(SOT-23-16).',
        specs: [
          { k: '기능', v: '1계통 8:1 아날로그 멀티플렉서(양방향)' },
          { k: '주소선', v: 'A0/A1/A2(3비트로 8 선택) + EN(active-low)' },
          { k: '전원', v: '15V(단일) / 양전원(VSS는 datasheet 참조)' },
          { k: '로직 레벨', v: '1.8V 호환' },
          { k: '내방사선', v: 'SEP(단일 사건 보호, 항공우주급)' },
          { k: '패키지', v: 'SOT-23-THIN-16 (DYY)' }
        ]
      }
    },
    'TMUX4819': {
      en: {
        subcategory: '2:1 Single-Channel Analog Switch (±15V Beyond-Supply, Powered-Off Protection)',
        whatIs: '2-to-1 single-channel analog switch (high-voltage version): SA/SB selected to D, SEL selects the path, EN enables. 0.16Ω Ron, ±15V beyond-supply, powered-off protection. Same pinout as TMUX2819 (high-voltage version).',
        func: 'SEL selects SA or SB to D; EN active-high. ±15V beyond-supply suits larger signal swings. Powered-off protection, 1.2V/1.8V logic.',
        usedIn: 'Larger-swing analog signal switching, industrial sensor multiplexing, audio path selection, signal routing needing powered-off protection and high-voltage headroom.',
        desc: '±15V beyond-supply 2:1 single-channel analog switch, 0.16Ω Ron, powered-off protection, 1.2V logic (WSON-8).',
        specs: [
          { k: 'Function', v: '2:1 single-channel analog switch (bidirectional)' },
          { k: 'Ron', v: '0.16 Ω' },
          { k: 'Signal range', v: '±15V beyond-supply' },
          { k: 'Powered-off protection', v: 'Yes' },
          { k: 'Logic level', v: '1.2V / 1.8V compatible' },
          { k: 'Package', v: 'WSON-8 (DSG), EP to GND' }
        ],
        dropIn: [{ note: 'Same DSG WSON-8 pinout (2:1 1ch); TMUX2819 is the ±5.5V low-voltage version' }]
      },
      ja: {
        subcategory: '2:1 シングルチャネルアナログスイッチ（±15V Beyond-Supply、電源オフ保護）',
        whatIs: '2-to-1 シングルチャネルアナログスイッチ（高電圧版）：SA/SB のいずれかを D に接続、SEL で経路選択、EN で有効化。0.16Ω Ron、±15V beyond-supply、電源オフ保護。TMUX2819 と同一ピン配置（高電圧版）。',
        func: 'SEL が SA または SB を D に選択；EN はハイ有効。±15V beyond-supply でより大きな信号振幅に対応。電源オフ保護、1.2V/1.8V ロジック。',
        usedIn: '大振幅アナログ信号の切替、産業用センサの多重化、オーディオ経路選択、電源オフ保護と高電圧マージンが必要な信号ルーティング。',
        desc: '±15V beyond-supply 2:1 シングルチャネルアナログスイッチ、0.16Ω Ron、電源オフ保護、1.2V ロジック（WSON-8）。',
        specs: [
          { k: '機能', v: '2:1 シングルチャネルアナログスイッチ（双方向）' },
          { k: 'Ron', v: '0.16 Ω' },
          { k: '信号範囲', v: '±15V beyond-supply' },
          { k: '電源オフ保護', v: 'あり' },
          { k: 'ロジックレベル', v: '1.2V / 1.8V 互換' },
          { k: 'パッケージ', v: 'WSON-8 (DSG)、EP は GND 接続' }
        ],
        dropIn: [{ note: '同一 DSG WSON-8 ピン配置（2:1 1ch）；TMUX2819 は ±5.5V 低電圧版' }]
      },
      ko: {
        subcategory: '2:1 싱글 채널 아날로그 스위치(±15V Beyond-Supply, 전원 오프 보호)',
        whatIs: '2-to-1 싱글 채널 아날로그 스위치(고전압판): SA/SB 중 하나를 D에 연결, SEL로 경로 선택, EN으로 활성화. 0.16Ω Ron, ±15V beyond-supply, 전원 오프 보호. TMUX2819와 동일 핀 배치(고전압판).',
        func: 'SEL이 SA 또는 SB를 D에 선택; EN은 하이 유효. ±15V beyond-supply로 더 큰 신호 스윙 대응. 전원 오프 보호, 1.2V/1.8V 로직.',
        usedIn: '대진폭 아날로그 신호 전환, 산업용 센서 멀티플렉싱, 오디오 경로 선택, 전원 오프 보호와 고전압 마진이 필요한 신호 라우팅.',
        desc: '±15V beyond-supply 2:1 싱글 채널 아날로그 스위치, 0.16Ω Ron, 전원 오프 보호, 1.2V 로직(WSON-8).',
        specs: [
          { k: '기능', v: '2:1 싱글 채널 아날로그 스위치(양방향)' },
          { k: 'Ron', v: '0.16 Ω' },
          { k: '신호 범위', v: '±15V beyond-supply' },
          { k: '전원 오프 보호', v: '있음' },
          { k: '로직 레벨', v: '1.2V / 1.8V 호환' },
          { k: '패키지', v: 'WSON-8 (DSG), EP는 GND 접속' }
        ],
        dropIn: [{ note: '동일 DSG WSON-8 핀 배치(2:1 1ch); TMUX2819는 ±5.5V 저전압판' }]
      }
    },
    'PCA9306H': {
      en: {
        subcategory: 'Bidirectional I2C/SMBus Voltage Level Translator (2-channel)',
        whatIs: 'Dual-channel bidirectional I2C/SMBus level translator: translates between the low-side (VREF1) SCL1/SDA1 and high-side (VREF2) SCL2/SDA2 with open-drain compatibility. Passive FET-switch based, bidirectional, no direction control needed.',
        func: 'A FET channel bridges each I2C line, with VREF1/VREF2 setting the two-side levels; EN enables. Open-drain/pull-up compatible, automatically bidirectional. Low side minimum 1.0V, high side up to 5.5V. No amplification or buffering - level bridging only.',
        usedIn: '1.8V-to-3.3V/5V I2C/SMBus bridging, sensor/EEPROM interface voltage translation, connecting an MCU to high-voltage I2C peripherals.',
        desc: 'Dual-channel bidirectional I2C/SMBus level translator, VREF sets both-side levels, EN enable, open-drain compatible (X2SON-8).',
        specs: [
          { k: 'Function', v: 'Dual-channel bidirectional I2C/SMBus level translation (passive FET)' },
          { k: 'Low side', v: 'VREF1 minimum 1.0V (see datasheet)' },
          { k: 'High side', v: 'VREF2 up to 5.5V' },
          { k: 'Direction', v: 'Auto-bidirectional, open-drain compatible, no direction pin' },
          { k: 'Enable', v: 'EN' },
          { k: 'Package', v: 'X2SON-8 (DQE)' }
        ]
      },
      ja: {
        subcategory: '双方向 I2C/SMBus 電圧レベル変換器（2 チャネル）',
        whatIs: '2 チャネル双方向 I2C/SMBus レベル変換器：低電圧側（VREF1）の SCL1/SDA1 と高電圧側（VREF2）の SCL2/SDA2 の間をオープンドレイン互換で電圧変換。パッシブ FET スイッチ方式、双方向、方向制御不要。',
        func: '各 I2C 線を 1 つの FET チャネルで橋渡しし、VREF1/VREF2 で両側のレベルを設定；EN で有効化。オープンドレイン/プルアップ互換、自動双方向。低電圧側は最小 1.0V、高電圧側は最大 5.5V。増幅もバッファもせず、レベル橋渡しのみ。',
        usedIn: '1.8V-3.3V/5V I2C/SMBus の橋渡し、センサ/EEPROM インタフェースの電圧変換、MCU と高電圧周辺の I2C 接続。',
        desc: '2 チャネル双方向 I2C/SMBus レベル変換器、VREF が両側レベルを設定、EN で有効化、オープンドレイン互換（X2SON-8）。',
        specs: [
          { k: '機能', v: '2 チャネル双方向 I2C/SMBus レベル変換（パッシブ FET）' },
          { k: '低電圧側', v: 'VREF1 最小 1.0V（データシート参照）' },
          { k: '高電圧側', v: 'VREF2 最大 5.5V' },
          { k: '方向', v: '自動双方向、オープンドレイン互換、方向ピン不要' },
          { k: '有効化', v: 'EN' },
          { k: 'パッケージ', v: 'X2SON-8 (DQE)' }
        ]
      },
      ko: {
        subcategory: '양방향 I2C/SMBus 전압 레벨 변환기(2채널)',
        whatIs: '2채널 양방향 I2C/SMBus 레벨 변환기: 저전압 측(VREF1)의 SCL1/SDA1과 고전압 측(VREF2)의 SCL2/SDA2 사이를 오픈드레인 호환으로 전압 변환. 패시브 FET 스위치 방식, 양방향, 방향 제어 불필요.',
        func: '각 I2C 선을 하나의 FET 채널로 브리징하고, VREF1/VREF2로 양측 레벨을 설정; EN으로 활성화. 오픈드레인/풀업 호환, 자동 양방향. 저전압 측 최소 1.0V, 고전압 측 최대 5.5V. 증폭도 버퍼도 없이 레벨 브리징만.',
        usedIn: '1.8V-3.3V/5V I2C/SMBus 브리징, 센서/EEPROM 인터페이스 전압 변환, MCU와 고전압 주변장치 I2C 연결.',
        desc: '2채널 양방향 I2C/SMBus 레벨 변환기, VREF가 양측 레벨 설정, EN 활성화, 오픈드레인 호환(X2SON-8).',
        specs: [
          { k: '기능', v: '2채널 양방향 I2C/SMBus 레벨 변환(패시브 FET)' },
          { k: '저전압 측', v: 'VREF1 최소 1.0V(datasheet 참조)' },
          { k: '고전압 측', v: 'VREF2 최대 5.5V' },
          { k: '방향', v: '자동 양방향, 오픈드레인 호환, 방향 핀 불필요' },
          { k: '활성화', v: 'EN' },
          { k: '패키지', v: 'X2SON-8 (DQE)' }
        ]
      }
    },
    'TCA9617B': {
      en: {
        subcategory: 'I2C/SMBus Buffer/Repeater (Level Translation, FM+)',
        whatIs: 'I2C bus buffer/repeater: A-side and B-side are separate I2C buses, buffered/isolated with level translation between them (A side 0.8-5.5V, B side 2.2-5.5V). Isolates capacitive loading, extends the bus, translates levels.',
        func: 'Actively buffers (not straight-through) between A-side SCLA/SDAA and B-side SCLB/SDAB: isolates each side capacitance, each pulls up to its own VCC for level translation; EN active-high. Supports FM+ (1MHz). Solves I2C capacitive overload and multi-board interconnect.',
        usedIn: 'Long-distance/multi-card I2C bus extension, backplane I2C, bridging different-voltage I2C domains, isolating large capacitive loads.',
        desc: 'I2C/SMBus buffer/repeater, A/B two-side buffer isolation + level translation, FM+ (1MHz), EN enable (VSSOP-8).',
        specs: [
          { k: 'Function', v: 'I2C/SMBus buffer/repeater (active buffer + level translation)' },
          { k: 'A-side supply', v: '0.8 ~ 5.5 V' },
          { k: 'B-side supply', v: '2.2 ~ 5.5 V (device main supply)' },
          { k: 'Speed', v: 'FM+ (up to 1MHz)' },
          { k: 'Enable', v: 'EN (active-high, internal weak pull-up to VCCB)' },
          { k: 'Package', v: 'VSSOP-8 (DGK)' }
        ]
      },
      ja: {
        subcategory: 'I2C/SMBus バッファ/リピータ（レベル変換、FM+）',
        whatIs: 'I2C バスバッファ/リピータ：A 側と B 側はそれぞれ独立した I2C バスで、その間をバッファ絶縁しレベル変換（A 側 0.8-5.5V、B 側 2.2-5.5V）。容量負荷を絶縁、バスを延長、レベルを変換。',
        func: 'A 側 SCLA/SDAA と B 側 SCLB/SDAB の間をアクティブにバッファ（直通ではない）：両側の容量を絶縁し、それぞれ自 VCC へプルアップしてレベル変換；EN はハイ有効。FM+（1MHz）対応。I2C の容量過負荷と複数基板の相互接続を解決。',
        usedIn: '長距離/複数カードの I2C バス延長、バックプレーン I2C、異なる電圧の I2C ドメイン橋渡し、大容量負荷の絶縁。',
        desc: 'I2C/SMBus バッファ/リピータ、A/B 両側バッファ絶縁＋レベル変換、FM+(1MHz)、EN で有効化（VSSOP-8）。',
        specs: [
          { k: '機能', v: 'I2C/SMBus バッファ/リピータ（アクティブバッファ＋レベル変換）' },
          { k: 'A 側電源', v: '0.8 ~ 5.5 V' },
          { k: 'B 側電源', v: '2.2 ~ 5.5 V（デバイス主電源）' },
          { k: '速度', v: 'FM+（最大 1MHz）' },
          { k: '有効化', v: 'EN（ハイ、内部弱プルアップ VCCB へ）' },
          { k: 'パッケージ', v: 'VSSOP-8 (DGK)' }
        ]
      },
      ko: {
        subcategory: 'I2C/SMBus 버퍼/리피터(레벨 변환, FM+)',
        whatIs: 'I2C 버스 버퍼/리피터: A 측과 B 측은 각각 독립 I2C 버스로, 그 사이를 버퍼 절연하고 레벨 변환(A 측 0.8-5.5V, B 측 2.2-5.5V). 용량 부하 절연, 버스 연장, 레벨 변환.',
        func: 'A 측 SCLA/SDAA와 B 측 SCLB/SDAB 사이를 능동 버퍼(직통 아님): 양측 용량을 절연하고 각각 자기 VCC로 풀업해 레벨 변환; EN 하이 유효. FM+(1MHz) 지원. I2C 용량 과부하와 다중 보드 상호 연결을 해결.',
        usedIn: '장거리/다중 카드 I2C 버스 연장, 백플레인 I2C, 다른 전압 I2C 도메인 브리징, 대용량 부하 절연.',
        desc: 'I2C/SMBus 버퍼/리피터, A/B 양측 버퍼 절연+레벨 변환, FM+(1MHz), EN 활성화(VSSOP-8).',
        specs: [
          { k: '기능', v: 'I2C/SMBus 버퍼/리피터(능동 버퍼+레벨 변환)' },
          { k: 'A 측 전원', v: '0.8 ~ 5.5 V' },
          { k: 'B 측 전원', v: '2.2 ~ 5.5 V(장치 주 전원)' },
          { k: '속도', v: 'FM+(최대 1MHz)' },
          { k: '활성화', v: 'EN(하이, 내부 약 풀업 VCCB로)' },
          { k: '패키지', v: 'VSSOP-8 (DGK)' }
        ]
      }
    },
    'ADG601_602': {
      en: {
        subcategory: 'Single SPST Analog Switch (Low Ron)',
        whatIs: 'Single-pole single-throw (SPST) analog switch: one S-D channel switched by the IN logic. ADG601 normally-open (NO), ADG602 normally-closed (NC). Low on-resistance, dual supply.',
        func: 'IN controls S-D (ADG601 conducts on IN high, ADG602 inverted). Bidirectional, low Ron, low charge injection. A single solid-state switch, replacing a relay or one channel of an analog-switch array.',
        usedIn: 'Signal sample/hold, gain switching, sensor path on/off, automatic test equipment, audio muting.',
        desc: 'Single SPST analog switch (ADG601 NO / ADG602 NC), low Ron, dual supply (SOT-23-6 / MSOP-8).',
        specs: [
          { k: 'Function', v: 'Single SPST analog switch (ADG601=NO / ADG602=NC)' },
          { k: 'Ron', v: 'Low (value see datasheet)' },
          { k: 'Control', v: 'IN single logic pin' },
          { k: 'Supply', v: 'Dual supply VDD/VSS (VSS=GND for single supply)' },
          { k: 'Pin count', v: '6 (SOT-23) / 8 (MSOP, with NC)' },
          { k: 'Package', v: 'SOT-23-6 (RJ) / MSOP-8 (RM)' }
        ],
        dropIn: [{ note: 'Same package; ADG602 is normally-closed (NC), ADG601 is normally-open (NO), opposite polarity - verify' }]
      },
      ja: {
        subcategory: 'シングル SPST アナログスイッチ（低 Ron）',
        whatIs: '単極単投（SPST）アナログスイッチ：1 系統の S-D チャネルを IN ロジックでオンオフ。ADG601 はノーマリオープン（NO）、ADG602 はノーマリクローズ（NC）。低オン抵抗、両電源。',
        func: 'IN が S-D を制御（ADG601 は IN ハイで導通、ADG602 は反転）。双方向信号、低 Ron、低電荷注入。単一の固体スイッチで、リレーやアナログスイッチアレイの 1 系統を置換。',
        usedIn: '信号サンプル/ホールド、ゲイン切替、センサ経路のオンオフ、自動試験装置、オーディオミュート。',
        desc: 'シングル SPST アナログスイッチ（ADG601 NO / ADG602 NC）、低 Ron、両電源（SOT-23-6 / MSOP-8）。',
        specs: [
          { k: '機能', v: 'シングル SPST アナログスイッチ（ADG601=NO / ADG602=NC）' },
          { k: 'Ron', v: '低（値はデータシート参照）' },
          { k: '制御', v: 'IN 単一ロジックピン' },
          { k: '電源', v: '両電源 VDD/VSS（単電源時は VSS=GND）' },
          { k: 'ピン数', v: '6 (SOT-23) / 8 (MSOP、NC 含む)' },
          { k: 'パッケージ', v: 'SOT-23-6 (RJ) / MSOP-8 (RM)' }
        ],
        dropIn: [{ note: '同一パッケージ；ADG602 はノーマリクローズ（NC）、ADG601 はノーマリオープン（NO）、極性が逆なので要確認' }]
      },
      ko: {
        subcategory: '싱글 SPST 아날로그 스위치(저 Ron)',
        whatIs: '단극 단투(SPST) 아날로그 스위치: 1계통 S-D 채널을 IN 로직으로 온오프. ADG601은 노멀리 오픈(NO), ADG602는 노멀리 클로즈(NC). 저 온저항, 양전원.',
        func: 'IN이 S-D를 제어(ADG601은 IN 하이에서 도통, ADG602는 반전). 양방향 신호, 저 Ron, 저 전하 주입. 단일 솔리드 스테이트 스위치로 릴레이나 아날로그 스위치 어레이의 1계통을 대체.',
        usedIn: '신호 샘플/홀드, 이득 전환, 센서 경로 온오프, 자동 시험 장비, 오디오 뮤트.',
        desc: '싱글 SPST 아날로그 스위치(ADG601 NO / ADG602 NC), 저 Ron, 양전원(SOT-23-6 / MSOP-8).',
        specs: [
          { k: '기능', v: '싱글 SPST 아날로그 스위치(ADG601=NO / ADG602=NC)' },
          { k: 'Ron', v: '낮음(값은 datasheet 참조)' },
          { k: '제어', v: 'IN 단일 로직 핀' },
          { k: '전원', v: '양전원 VDD/VSS(단일 전원 시 VSS=GND)' },
          { k: '핀 수', v: '6 (SOT-23) / 8 (MSOP, NC 포함)' },
          { k: '패키지', v: 'SOT-23-6 (RJ) / MSOP-8 (RM)' }
        ],
        dropIn: [{ note: '동일 패키지; ADG602는 노멀리 클로즈(NC), ADG601은 노멀리 오픈(NO), 극성 반대라 확인 필요' }]
      }
    },
    'TCA9847': {
      en: {
        subcategory: '8-Channel I2C Multiplexer (Ultra-Low-Voltage, 1MHz)',
        whatIs: '8-channel I2C multiplexer: one upstream I2C (SCL/SDA) switches to one of eight downstream channels (SC0/SD0-SC7/SD7). Resolves downstream I2C address conflicts, isolates each channel capacitance. Ultra-low-voltage, 1MHz.',
        func: 'The host writes the control register over the upstream SCL/SDA to select one downstream channel; only one connects at a time (multiplexer, not switch). Each downstream can use a different pull-up voltage - also does level translation. A0/A1 set the device address; RESET (active-low) resets. VDD1 logic, VDD2 core.',
        usedIn: 'Multiple same-address I2C devices sharing a bus (multiple identical sensors/EEPROMs), I2C channel isolation and level translation, I2C expansion in servers/modular systems.',
        desc: '8-channel ultra-low-voltage I2C multiplexer, 1 upstream to 8 downstream, each channel independent level, 1MHz, RESET (TSSOP/VQFN-24).',
        specs: [
          { k: 'Function', v: '8-channel I2C multiplexer (1 upstream to 1 of 8 downstream)' },
          { k: 'Channels', v: '8 (SC0/SD0 ~ SC7/SD7)' },
          { k: 'Level translation', v: 'Each downstream can have an independent pull-up voltage (VDPUx)' },
          { k: 'Address', v: 'A0/A1 (programmable)' },
          { k: 'Speed', v: 'Up to 1MHz (Fm+)' },
          { k: 'Reset', v: 'RESET (active-low)' },
          { k: 'Supply', v: 'VDD1 logic + VDD2 core (ultra-low-voltage)' },
          { k: 'Package', v: 'TSSOP-24 (PW) / VQFN-24 (RGE)' }
        ],
        dropIn: [{ note: 'Same 24-pin pinout; TCA9848 is a switch (can connect multiple channels at once), TCA9847 is a multiplexer (only one at a time) - different behavior, verify' }]
      },
      ja: {
        subcategory: '8 チャネル I2C マルチプレクサ（超低電圧、1MHz）',
        whatIs: '8 チャネル I2C マルチプレクサ：1 つの上流 I2C（SCL/SDA）を 8 つの下流チャネル（SC0/SD0-SC7/SD7）の 1 つに切替。下流デバイスの I2C アドレス衝突を解決し、各チャネルの容量を絶縁。超低電圧、1MHz。',
        func: 'ホストが上流 SCL/SDA 経由で制御レジスタに書き込み下流チャネルを 1 つ選択；同時に接続するのは 1 系統のみ（マルチプレクサ、スイッチではない）。各下流は異なるプルアップ電圧が可能→レベル変換も兼ねる。A0/A1 でデバイスアドレス設定；RESET（active-low）でリセット。VDD1 ロジック、VDD2 コア。',
        usedIn: '同一アドレスの I2C デバイスを複数バス共有（同一センサ/EEPROM を複数組）、I2C チャネル絶縁とレベル変換、サーバ/モジュール式システムの I2C 拡張。',
        desc: '8 チャネル超低電圧 I2C マルチプレクサ、上流 1 対下流 8、各チャネル独立レベル、1MHz、RESET（TSSOP/VQFN-24）。',
        specs: [
          { k: '機能', v: '8 チャネル I2C マルチプレクサ（上流 1 から下流 8 の 1 選択）' },
          { k: 'チャネル', v: '8（SC0/SD0 ~ SC7/SD7）' },
          { k: 'レベル変換', v: '各下流に独立プルアップ電圧が可能（VDPUx）' },
          { k: 'アドレス', v: 'A0/A1（プログラマブル）' },
          { k: '速度', v: '最大 1MHz（Fm+）' },
          { k: 'リセット', v: 'RESET（active-low）' },
          { k: '電源', v: 'VDD1 ロジック + VDD2 コア（超低電圧）' },
          { k: 'パッケージ', v: 'TSSOP-24 (PW) / VQFN-24 (RGE)' }
        ],
        dropIn: [{ note: '同一 24 ピン配置；TCA9848 はスイッチ（複数系統を同時接続可）、TCA9847 はマルチプレクサ（1 系統のみ）、動作が異なるので要確認' }]
      },
      ko: {
        subcategory: '8채널 I2C 멀티플렉서(초저전압, 1MHz)',
        whatIs: '8채널 I2C 멀티플렉서: 하나의 상류 I2C(SCL/SDA)를 8개 하류 채널(SC0/SD0-SC7/SD7) 중 하나로 전환. 하류 장치의 I2C 주소 충돌을 해결하고 각 채널의 용량을 절연. 초저전압, 1MHz.',
        func: '호스트가 상류 SCL/SDA를 통해 제어 레지스터에 기록해 하류 채널 하나를 선택; 동시에 연결되는 것은 1계통뿐(멀티플렉서, 스위치 아님). 각 하류는 다른 풀업 전압 가능→레벨 변환도 겸함. A0/A1로 장치 주소 설정; RESET(active-low)로 리셋. VDD1 로직, VDD2 코어.',
        usedIn: '동일 주소 I2C 장치 다수의 버스 공유(동일 센서/EEPROM 여러 조), I2C 채널 절연과 레벨 변환, 서버/모듈식 시스템 I2C 확장.',
        desc: '8채널 초저전압 I2C 멀티플렉서, 상류 1 대 하류 8, 각 채널 독립 레벨, 1MHz, RESET(TSSOP/VQFN-24).',
        specs: [
          { k: '기능', v: '8채널 I2C 멀티플렉서(상류 1에서 하류 8 중 1 선택)' },
          { k: '채널', v: '8(SC0/SD0 ~ SC7/SD7)' },
          { k: '레벨 변환', v: '각 하류에 독립 풀업 전압 가능(VDPUx)' },
          { k: '주소', v: 'A0/A1(프로그래머블)' },
          { k: '속도', v: '최대 1MHz(Fm+)' },
          { k: '리셋', v: 'RESET(active-low)' },
          { k: '전원', v: 'VDD1 로직 + VDD2 코어(초저전압)' },
          { k: '패키지', v: 'TSSOP-24 (PW) / VQFN-24 (RGE)' }
        ],
        dropIn: [{ note: '동일 24핀 배치; TCA9848은 스위치(여러 계통 동시 연결 가능), TCA9847은 멀티플렉서(1계통만), 동작이 달라 확인 필요' }]
      }
    },
    'TCA9848': {
      en: {
        subcategory: '8-Channel I2C Switch (Ultra-Low-Voltage, 1MHz)',
        whatIs: '8-channel I2C switch: the upstream I2C (SCL/SDA) can connect one or more downstream channels (SC0/SD0-SC7/SD7) at the same time. Same pinout as TCA9847, the difference being it can open multiple channels at once (switch vs multiplexer).',
        func: 'The host writes the register over I2C to select any combination of downstream channels (multiple at once, unlike the 9847 single). Each channel isolates capacitance and can have an independent pull-up voltage for level translation. A0/A1 address, RESET (active-low) reset.',
        usedIn: 'Simultaneously broadcasting/isolating multiple I2C device groups, expanding same-address devices, I2C channel level translation, modular-system bus switching.',
        desc: '8-channel ultra-low-voltage I2C switch (multiple channels at once), each channel independent level, 1MHz, RESET (TSSOP/VQFN-24).',
        specs: [
          { k: 'Function', v: '8-channel I2C switch (multiple channels at once)' },
          { k: 'Channels', v: '8 (SC0/SD0 ~ SC7/SD7)' },
          { k: 'Level translation', v: 'Each downstream can have an independent pull-up voltage (VDPUx)' },
          { k: 'Address', v: 'A0/A1 (programmable)' },
          { k: 'Speed', v: 'Up to 1MHz (Fm+)' },
          { k: 'Reset', v: 'RESET (active-low)' },
          { k: 'Supply', v: 'VDD1 logic + VDD2 core (ultra-low-voltage)' },
          { k: 'Package', v: 'TSSOP-24 (PW) / VQFN-24 (RGE)' }
        ],
        dropIn: [{ note: 'Same 24-pin pinout; TCA9847 is a multiplexer (only one at a time), TCA9848 is a switch (multiple at once) - different behavior, verify' }]
      },
      ja: {
        subcategory: '8 チャネル I2C スイッチ（超低電圧、1MHz）',
        whatIs: '8 チャネル I2C スイッチ：上流 I2C（SCL/SDA）が 1 つまたは複数の下流チャネル（SC0/SD0-SC7/SD7）を同時に接続可能。TCA9847 と同一ピン配置で、複数系統を同時に開ける点が異なる（スイッチ対マルチプレクサ）。',
        func: 'ホストが I2C でレジスタに書き込み任意の組み合わせの下流チャネルを選択（9847 の 1 系統と異なり複数同時可）。各チャネルは容量を絶縁し、独立プルアップ電圧でレベル変換可能。A0/A1 アドレス、RESET（active-low）リセット。',
        usedIn: '複数の I2C デバイス群を同時にブロードキャスト/絶縁、同一アドレスデバイスの拡張、I2C チャネルのレベル変換、モジュール式システムのバス切替。',
        desc: '8 チャネル超低電圧 I2C スイッチ（複数系統同時可）、各チャネル独立レベル、1MHz、RESET（TSSOP/VQFN-24）。',
        specs: [
          { k: '機能', v: '8 チャネル I2C スイッチ（複数系統同時可）' },
          { k: 'チャネル', v: '8（SC0/SD0 ~ SC7/SD7）' },
          { k: 'レベル変換', v: '各下流に独立プルアップ電圧が可能（VDPUx）' },
          { k: 'アドレス', v: 'A0/A1（プログラマブル）' },
          { k: '速度', v: '最大 1MHz（Fm+）' },
          { k: 'リセット', v: 'RESET（active-low）' },
          { k: '電源', v: 'VDD1 ロジック + VDD2 コア（超低電圧）' },
          { k: 'パッケージ', v: 'TSSOP-24 (PW) / VQFN-24 (RGE)' }
        ],
        dropIn: [{ note: '同一 24 ピン配置；TCA9847 はマルチプレクサ（1 系統のみ）、TCA9848 はスイッチ（複数同時可）、動作が異なるので要確認' }]
      },
      ko: {
        subcategory: '8채널 I2C 스위치(초저전압, 1MHz)',
        whatIs: '8채널 I2C 스위치: 상류 I2C(SCL/SDA)가 하나 또는 여러 하류 채널(SC0/SD0-SC7/SD7)을 동시에 연결 가능. TCA9847과 동일 핀 배치이며, 여러 계통을 동시에 열 수 있는 점이 다름(스위치 대 멀티플렉서).',
        func: '호스트가 I2C로 레지스터에 기록해 임의 조합의 하류 채널을 선택(9847의 1계통과 달리 여러 계통 동시 가능). 각 채널은 용량을 절연하고 독립 풀업 전압으로 레벨 변환 가능. A0/A1 주소, RESET(active-low) 리셋.',
        usedIn: '여러 I2C 장치 그룹을 동시에 브로드캐스트/절연, 동일 주소 장치 확장, I2C 채널 레벨 변환, 모듈식 시스템 버스 전환.',
        desc: '8채널 초저전압 I2C 스위치(여러 계통 동시 가능), 각 채널 독립 레벨, 1MHz, RESET(TSSOP/VQFN-24).',
        specs: [
          { k: '기능', v: '8채널 I2C 스위치(여러 계통 동시 가능)' },
          { k: '채널', v: '8(SC0/SD0 ~ SC7/SD7)' },
          { k: '레벨 변환', v: '각 하류에 독립 풀업 전압 가능(VDPUx)' },
          { k: '주소', v: 'A0/A1(프로그래머블)' },
          { k: '속도', v: '최대 1MHz(Fm+)' },
          { k: '리셋', v: 'RESET(active-low)' },
          { k: '전원', v: 'VDD1 로직 + VDD2 코어(초저전압)' },
          { k: '패키지', v: 'TSSOP-24 (PW) / VQFN-24 (RGE)' }
        ],
        dropIn: [{ note: '동일 24핀 배치; TCA9847은 멀티플렉서(1계통만), TCA9848은 스위치(여러 계통 동시), 동작이 달라 확인 필요' }]
      }
    },
    'HD3SS3220L': {
      en: {
        subcategory: 'USB Type-C DRP Port Controller + SuperSpeed Mux',
        whatIs: 'USB Type-C dual-role-port (DRP) controller with a SuperSpeed mux: auto-detects the CC lines to determine orientation and role (DFP/UFP/DRP), and switches the USB3 SuperSpeed signals to the correct differential pair per plug orientation. I2C or GPIO control selectable.',
        func: 'CC1/CC2 detect Type-C attach, current advertisement and orientation; the built-in SS mux switches TX/RX to TX1/RX1 or TX2/RX2 per orientation; DIR outputs the orientation; PORT/ADDR/CURRENT_MODE tri-state pins set mode and address; I2C (SCL/SDA) or GPIO control; ENn_CC/ENn_MUX enable. VBUS_DET detects UFP attach.',
        usedIn: 'USB Type-C host/device/dual-role ports, laptop/tablet/phone Type-C interfaces, Type-C docks and adapters, SuperSpeed signal routing.',
        desc: 'USB Type-C DRP port controller with SS mux, CC detection/orientation switching, I2C or GPIO control, DIR output (VQFN-30).',
        specs: [
          { k: 'Function', v: 'USB Type-C DRP port controller + SuperSpeed mux' },
          { k: 'Role', v: 'DFP / UFP / DRP (PORT pin selects)' },
          { k: 'CC detection', v: 'CC1/CC2 orientation, current advertisement, attach detection' },
          { k: 'SS mux', v: 'Switches TX1/RX1 or TX2/RX2 per orientation' },
          { k: 'Control', v: 'I2C (address 0x47/0x67) or GPIO mode (ADDR pin selects)' },
          { k: 'Supply', v: 'VCC33 (3.3V) + VDD5 (5V)' },
          { k: 'Orientation output', v: 'DIR (open-drain)' },
          { k: 'VBUS detection', v: 'VBUS_DET 5~28V' },
          { k: 'Package', v: 'VQFN-30 (RNH), thermal pad to GND' }
        ],
        dropIn: [{ note: 'Same RNH VQFN-30 pinout; HD3SS3220 INT_N/OUT3 (pin23) has OUT3 in GPIO mode, while on HD3SS3220L that pin is NC' }]
      },
      ja: {
        subcategory: 'USB Type-C DRP ポートコントローラ + SuperSpeed Mux',
        whatIs: 'USB Type-C デュアルロールポート（DRP）コントローラ、SuperSpeed マルチプレクサ内蔵：CC 線を自動検出して挿入方向と役割（DFP/UFP/DRP）を判定し、USB3 SuperSpeed 信号を挿入方向に応じて正しい差動ペアへ切替。I2C または GPIO 制御を選択可能。',
        func: 'CC1/CC2 が Type-C の接続・電流広告・挿入方向を検出；内蔵 SS mux が挿入方向に応じて TX/RX を TX1/RX1 または TX2/RX2 に切替；DIR で挿入方向を出力；PORT/ADDR/CURRENT_MODE の 3 ステートピンでモードとアドレスを設定；I2C（SCL/SDA）または GPIO 制御；ENn_CC/ENn_MUX で有効化。VBUS_DET が UFP 接続を検出。',
        usedIn: 'USB Type-C ホスト/デバイス/デュアルロールポート、ノート/タブレット/スマホの Type-C インタフェース、Type-C ドックやアダプタ、SuperSpeed 信号ルーティング。',
        desc: 'USB Type-C DRP ポートコントローラ（SS mux 内蔵）、CC 検出/挿入方向切替、I2C または GPIO 制御、DIR 出力（VQFN-30）。',
        specs: [
          { k: '機能', v: 'USB Type-C DRP ポートコントローラ + SuperSpeed mux' },
          { k: '役割', v: 'DFP / UFP / DRP（PORT ピンで選択）' },
          { k: 'CC 検出', v: 'CC1/CC2 挿入方向、電流広告、接続検出' },
          { k: 'SS mux', v: '挿入方向に応じ TX1/RX1 または TX2/RX2 に切替' },
          { k: '制御', v: 'I2C（アドレス 0x47/0x67）または GPIO モード（ADDR ピンで選択）' },
          { k: '電源', v: 'VCC33 (3.3V) + VDD5 (5V)' },
          { k: '挿入方向出力', v: 'DIR（オープンドレイン）' },
          { k: 'VBUS 検出', v: 'VBUS_DET 5~28V' },
          { k: 'パッケージ', v: 'VQFN-30 (RNH)、サーマルパッドは GND 接続' }
        ],
        dropIn: [{ note: '同一 RNH VQFN-30 ピン配置；HD3SS3220 の INT_N/OUT3（pin23）は GPIO モードで OUT3 を持つが、HD3SS3220L では NC' }]
      },
      ko: {
        subcategory: 'USB Type-C DRP 포트 컨트롤러 + SuperSpeed Mux',
        whatIs: 'USB Type-C 듀얼 롤 포트(DRP) 컨트롤러, SuperSpeed 멀티플렉서 내장: CC 선을 자동 감지해 삽입 방향과 역할(DFP/UFP/DRP)을 판정하고, USB3 SuperSpeed 신호를 삽입 방향에 따라 올바른 차동 쌍으로 전환. I2C 또는 GPIO 제어 선택 가능.',
        func: 'CC1/CC2가 Type-C 연결·전류 광고·삽입 방향을 감지; 내장 SS mux가 삽입 방향에 따라 TX/RX를 TX1/RX1 또는 TX2/RX2로 전환; DIR로 삽입 방향 출력; PORT/ADDR/CURRENT_MODE 3상태 핀으로 모드와 주소 설정; I2C(SCL/SDA) 또는 GPIO 제어; ENn_CC/ENn_MUX로 활성화. VBUS_DET가 UFP 연결 감지.',
        usedIn: 'USB Type-C 호스트/장치/듀얼 롤 포트, 노트북/태블릿/스마트폰 Type-C 인터페이스, Type-C 도크와 어댑터, SuperSpeed 신호 라우팅.',
        desc: 'USB Type-C DRP 포트 컨트롤러(SS mux 내장), CC 감지/삽입 방향 전환, I2C 또는 GPIO 제어, DIR 출력(VQFN-30).',
        specs: [
          { k: '기능', v: 'USB Type-C DRP 포트 컨트롤러 + SuperSpeed mux' },
          { k: '역할', v: 'DFP / UFP / DRP(PORT 핀으로 선택)' },
          { k: 'CC 감지', v: 'CC1/CC2 삽입 방향, 전류 광고, 연결 감지' },
          { k: 'SS mux', v: '삽입 방향에 따라 TX1/RX1 또는 TX2/RX2 전환' },
          { k: '제어', v: 'I2C(주소 0x47/0x67) 또는 GPIO 모드(ADDR 핀으로 선택)' },
          { k: '전원', v: 'VCC33 (3.3V) + VDD5 (5V)' },
          { k: '삽입 방향 출력', v: 'DIR(오픈드레인)' },
          { k: 'VBUS 감지', v: 'VBUS_DET 5~28V' },
          { k: '패키지', v: 'VQFN-30 (RNH), 서멀 패드는 GND 접속' }
        ],
        dropIn: [{ note: '동일 RNH VQFN-30 핀 배치; HD3SS3220의 INT_N/OUT3(pin23)은 GPIO 모드에서 OUT3을 가지나, HD3SS3220L에서는 NC' }]
      }
    },
    'SN74LVC1G00B-Q1': {
      en: {
        subcategory: 'Single-Gate 2-Input NAND (Automotive)',
        whatIs: 'A single 2-input NAND logic gate: Y = NOT(A AND B). LVC family, wide 1.65-5.5V supply, automotive AEC-Q100, for glue logic / signal inversion-combination.',
        func: 'Y goes low only when both A and B are high, otherwise high. LVC CMOS, 5V-tolerant inputs, rail-to-rail output. The single-gate small package fits right next to the signal to save PCB.',
        usedIn: 'Glue logic, enable/interrupt signal combination, clock gating, logic operations in level-compatible interfaces.',
        desc: 'Automotive single-gate 2-input NAND, LVC, 1.65-5.5V, 5V-tolerant inputs (SOT-23-5/SC70-5).',
        specs: [
          { k: 'Function', v: 'Single-gate 2-input NAND (Y=NOT(A·B))' },
          { k: 'Family', v: 'LVC (CMOS, 5V-tolerant inputs)' },
          { k: 'Supply', v: '1.65 ~ 5.5 V' },
          { k: 'Qualification', v: 'Automotive AEC-Q100' },
          { k: 'Package', v: 'SOT-23-5 / SC70-5 / X2SON-5' }
        ],
        dropIn: [{ note: 'Same SOT-23-5 pinout; but 1G02B is a NOR gate (different function, pinout-compatible only)' }]
      },
      ja: {
        subcategory: 'シングルゲート 2 入力 NAND（車載）',
        whatIs: '1 個の 2 入力 NAND 論理ゲート：Y = NOT(A AND B)。LVC ファミリ、1.65-5.5V の広い電源、車載 AEC-Q100、グルーロジック/信号反転の組み合わせ用。',
        func: 'A、B が共にハイのときだけ Y がロー、それ以外はハイ。LVC CMOS、入力は 5V 耐性、レール・ツー・レール出力。シングルゲートの小型パッケージは信号のすぐ近くに置けて基板を節約。',
        usedIn: 'グルーロジック、有効/割り込み信号の組み合わせ、クロックゲーティング、レベル互換インタフェースの論理演算。',
        desc: '車載シングルゲート 2 入力 NAND、LVC、1.65-5.5V、5V 入力耐性（SOT-23-5/SC70-5）。',
        specs: [
          { k: '機能', v: 'シングルゲート 2 入力 NAND（Y=NOT(A·B)）' },
          { k: 'ファミリ', v: 'LVC（CMOS、5V 入力耐性）' },
          { k: '電源', v: '1.65 ~ 5.5 V' },
          { k: '認証', v: '車載 AEC-Q100' },
          { k: 'パッケージ', v: 'SOT-23-5 / SC70-5 / X2SON-5' }
        ],
        dropIn: [{ note: '同一 SOT-23-5 ピン配置；ただし 1G02B は NOR ゲート（機能が異なり、ピン配置のみ互換）' }]
      },
      ko: {
        subcategory: '싱글 게이트 2입력 NAND(차량용)',
        whatIs: '1개의 2입력 NAND 논리 게이트: Y = NOT(A AND B). LVC 계열, 1.65-5.5V 넓은 전원, 차량용 AEC-Q100, 글루 로직/신호 반전 조합용.',
        func: 'A, B가 모두 하이일 때만 Y가 로우, 그 외에는 하이. LVC CMOS, 입력 5V 내성, 레일 투 레일 출력. 싱글 게이트 소형 패키지는 신호 바로 옆에 둘 수 있어 PCB 절약.',
        usedIn: '글루 로직, 인에이블/인터럽트 신호 조합, 클록 게이팅, 레벨 호환 인터페이스의 논리 연산.',
        desc: '차량용 싱글 게이트 2입력 NAND, LVC, 1.65-5.5V, 5V 입력 내성(SOT-23-5/SC70-5).',
        specs: [
          { k: '기능', v: '싱글 게이트 2입력 NAND(Y=NOT(A·B))' },
          { k: '계열', v: 'LVC(CMOS, 5V 입력 내성)' },
          { k: '전원', v: '1.65 ~ 5.5 V' },
          { k: '인증', v: '차량용 AEC-Q100' },
          { k: '패키지', v: 'SOT-23-5 / SC70-5 / X2SON-5' }
        ],
        dropIn: [{ note: '동일 SOT-23-5 핀 배치; 그러나 1G02B는 NOR 게이트(기능이 다르며 핀 배치만 호환)' }]
      }
    },
    'SN74LVC1G02B-Q1': {
      en: {
        subcategory: 'Single-Gate 2-Input NOR (Automotive)',
        whatIs: 'A single 2-input NOR logic gate: Y = NOT(A OR B). LVC, 1.65-5.5V, automotive. Same pinout as 1G00B (NOR vs NAND).',
        func: 'Y goes high only when both A and B are low, otherwise low. LVC CMOS, 5V-tolerant inputs, rail-to-rail output.',
        usedIn: 'Glue logic, signal merging/inversion, enable combination, clock gating.',
        desc: 'Automotive single-gate 2-input NOR, LVC, 1.65-5.5V, 5V-tolerant inputs (SOT-23-5/SC70-5).',
        specs: [
          { k: 'Function', v: 'Single-gate 2-input NOR (Y=NOT(A+B))' },
          { k: 'Family', v: 'LVC (5V-tolerant inputs)' },
          { k: 'Supply', v: '1.65 ~ 5.5 V' },
          { k: 'Qualification', v: 'Automotive AEC-Q100' },
          { k: 'Package', v: 'SOT-23-5 / SC70-5 / X2SON-5' }
        ],
        dropIn: [{ note: 'Same SOT-23-5 pinout; 1G00B is a NAND gate (different function)' }]
      },
      ja: {
        subcategory: 'シングルゲート 2 入力 NOR（車載）',
        whatIs: '1 個の 2 入力 NOR 論理ゲート：Y = NOT(A OR B)。LVC、1.65-5.5V、車載。1G00B と同一ピン配置（NOR 対 NAND）。',
        func: 'A、B が共にローのときだけ Y がハイ、それ以外はロー。LVC CMOS、5V 入力耐性、レール・ツー・レール出力。',
        usedIn: 'グルーロジック、信号の合成/反転、有効化の組み合わせ、クロックゲーティング。',
        desc: '車載シングルゲート 2 入力 NOR、LVC、1.65-5.5V、5V 入力耐性（SOT-23-5/SC70-5）。',
        specs: [
          { k: '機能', v: 'シングルゲート 2 入力 NOR（Y=NOT(A+B)）' },
          { k: 'ファミリ', v: 'LVC（5V 入力耐性）' },
          { k: '電源', v: '1.65 ~ 5.5 V' },
          { k: '認証', v: '車載 AEC-Q100' },
          { k: 'パッケージ', v: 'SOT-23-5 / SC70-5 / X2SON-5' }
        ],
        dropIn: [{ note: '同一 SOT-23-5 ピン配置；1G00B は NAND ゲート（機能が異なる）' }]
      },
      ko: {
        subcategory: '싱글 게이트 2입력 NOR(차량용)',
        whatIs: '1개의 2입력 NOR 논리 게이트: Y = NOT(A OR B). LVC, 1.65-5.5V, 차량용. 1G00B와 동일 핀 배치(NOR 대 NAND).',
        func: 'A, B가 모두 로우일 때만 Y가 하이, 그 외에는 로우. LVC CMOS, 5V 입력 내성, 레일 투 레일 출력.',
        usedIn: '글루 로직, 신호 병합/반전, 인에이블 조합, 클록 게이팅.',
        desc: '차량용 싱글 게이트 2입력 NOR, LVC, 1.65-5.5V, 5V 입력 내성(SOT-23-5/SC70-5).',
        specs: [
          { k: '기능', v: '싱글 게이트 2입력 NOR(Y=NOT(A+B))' },
          { k: '계열', v: 'LVC(5V 입력 내성)' },
          { k: '전원', v: '1.65 ~ 5.5 V' },
          { k: '인증', v: '차량용 AEC-Q100' },
          { k: '패키지', v: 'SOT-23-5 / SC70-5 / X2SON-5' }
        ],
        dropIn: [{ note: '동일 SOT-23-5 핀 배치; 1G00B는 NAND 게이트(기능이 다름)' }]
      }
    },
    'SN74LVC1G132B-Q1': {
      en: {
        subcategory: 'Single-Gate 2-Input NAND (Schmitt-Trigger, Automotive)',
        whatIs: 'A single 2-input NAND gate with Schmitt-trigger (hysteresis) inputs: Y = NOT(A AND B). The hysteresis shapes slow/noisy signals into a clean square wave. LVC, automotive.',
        func: 'Y goes low only when both A and B are high; Schmitt hysteresis on the inputs resists noise and accepts slow-rising signals. 1.65-5.5V, 5V-tolerant inputs.',
        usedIn: 'Noisy-signal shaping + logic, button debouncing, slow-clock shaping, RC oscillation.',
        desc: 'Automotive single-gate 2-input NAND (Schmitt inputs), LVC, 1.65-5.5V (SOT-23-5).',
        specs: [
          { k: 'Function', v: '2-input NAND + Schmitt inputs' },
          { k: 'Family', v: 'LVC (5V-tolerant inputs)' },
          { k: 'Supply', v: '1.65 ~ 5.5 V' },
          { k: 'Qualification', v: 'Automotive AEC-Q100' },
          { k: 'Package', v: 'SOT-23-5 / SC70-5 / X2SON-5' }
        ]
      },
      ja: {
        subcategory: 'シングルゲート 2 入力 NAND（シュミットトリガ、車載）',
        whatIs: '1 個の 2 入力 NAND ゲート、入力にシュミットトリガ（ヒステリシス）付き：Y = NOT(A AND B)。ヒステリシスが遅い/雑音信号をきれいな方形波に整形。LVC、車載。',
        func: 'A、B が共にハイのときだけ Y がロー；入力のシュミットヒステリシスが雑音に強く、緩やかに立ち上がる信号を受けられる。1.65-5.5V、5V 入力耐性。',
        usedIn: '雑音信号の整形＋論理、ボタンのデバウンス、遅いクロックの整形、RC 発振。',
        desc: '車載シングルゲート 2 入力 NAND（シュミット入力）、LVC、1.65-5.5V（SOT-23-5）。',
        specs: [
          { k: '機能', v: '2 入力 NAND + シュミット入力' },
          { k: 'ファミリ', v: 'LVC（5V 入力耐性）' },
          { k: '電源', v: '1.65 ~ 5.5 V' },
          { k: '認証', v: '車載 AEC-Q100' },
          { k: 'パッケージ', v: 'SOT-23-5 / SC70-5 / X2SON-5' }
        ]
      },
      ko: {
        subcategory: '싱글 게이트 2입력 NAND(슈미트 트리거, 차량용)',
        whatIs: '1개의 2입력 NAND 게이트, 입력에 슈미트 트리거(히스테리시스) 포함: Y = NOT(A AND B). 히스테리시스가 느린/잡음 신호를 깨끗한 구형파로 정형. LVC, 차량용.',
        func: 'A, B가 모두 하이일 때만 Y가 로우; 입력 슈미트 히스테리시스가 잡음에 강하고 천천히 상승하는 신호를 받을 수 있음. 1.65-5.5V, 5V 입력 내성.',
        usedIn: '잡음 신호 정형+논리, 버튼 디바운싱, 느린 클록 정형, RC 발진.',
        desc: '차량용 싱글 게이트 2입력 NAND(슈미트 입력), LVC, 1.65-5.5V(SOT-23-5).',
        specs: [
          { k: '기능', v: '2입력 NAND + 슈미트 입력' },
          { k: '계열', v: 'LVC(5V 입력 내성)' },
          { k: '전원', v: '1.65 ~ 5.5 V' },
          { k: '인증', v: '차량용 AEC-Q100' },
          { k: '패키지', v: 'SOT-23-5 / SC70-5 / X2SON-5' }
        ]
      }
    },
    'SN74LVC1G10B-Q1': {
      en: {
        subcategory: 'Single-Gate 3-Input NAND (Automotive)',
        whatIs: 'A single 3-input NAND gate: Y = NOT(A AND B AND C). LVC, 1.65-5.5V, automotive.',
        func: 'Y goes low only when A, B and C are all high. LVC CMOS, 5V-tolerant inputs, rail-to-rail output.',
        usedIn: 'Three-condition glue logic, enable combination, address decoding.',
        desc: 'Automotive single-gate 3-input NAND, LVC, 1.65-5.5V (SC70-6).',
        specs: [
          { k: 'Function', v: 'Single-gate 3-input NAND' },
          { k: 'Family', v: 'LVC (5V-tolerant inputs)' },
          { k: 'Supply', v: '1.65 ~ 5.5 V' },
          { k: 'Qualification', v: 'Automotive AEC-Q100' },
          { k: 'Package', v: 'SC70-6 / X2SON-6' }
        ],
        dropIn: [{ note: 'Same SC70-6 pinout; 1G11B is a 3-input AND (different function)' }]
      },
      ja: {
        subcategory: 'シングルゲート 3 入力 NAND（車載）',
        whatIs: '1 個の 3 入力 NAND ゲート：Y = NOT(A AND B AND C)。LVC、1.65-5.5V、車載。',
        func: 'A、B、C がすべてハイのときだけ Y がロー。LVC CMOS、5V 入力耐性、レール・ツー・レール出力。',
        usedIn: '3 条件のグルーロジック、有効化の組み合わせ、アドレスデコード。',
        desc: '車載シングルゲート 3 入力 NAND、LVC、1.65-5.5V（SC70-6）。',
        specs: [
          { k: '機能', v: 'シングルゲート 3 入力 NAND' },
          { k: 'ファミリ', v: 'LVC（5V 入力耐性）' },
          { k: '電源', v: '1.65 ~ 5.5 V' },
          { k: '認証', v: '車載 AEC-Q100' },
          { k: 'パッケージ', v: 'SC70-6 / X2SON-6' }
        ],
        dropIn: [{ note: '同一 SC70-6 ピン配置；1G11B は 3 入力 AND（機能が異なる）' }]
      },
      ko: {
        subcategory: '싱글 게이트 3입력 NAND(차량용)',
        whatIs: '1개의 3입력 NAND 게이트: Y = NOT(A AND B AND C). LVC, 1.65-5.5V, 차량용.',
        func: 'A, B, C가 모두 하이일 때만 Y가 로우. LVC CMOS, 5V 입력 내성, 레일 투 레일 출력.',
        usedIn: '3조건 글루 로직, 인에이블 조합, 주소 디코딩.',
        desc: '차량용 싱글 게이트 3입력 NAND, LVC, 1.65-5.5V(SC70-6).',
        specs: [
          { k: '기능', v: '싱글 게이트 3입력 NAND' },
          { k: '계열', v: 'LVC(5V 입력 내성)' },
          { k: '전원', v: '1.65 ~ 5.5 V' },
          { k: '인증', v: '차량용 AEC-Q100' },
          { k: '패키지', v: 'SC70-6 / X2SON-6' }
        ],
        dropIn: [{ note: '동일 SC70-6 핀 배치; 1G11B는 3입력 AND(기능이 다름)' }]
      }
    },
    'SN74LVC1G11B-Q1': {
      en: {
        subcategory: 'Single-Gate 3-Input AND (Automotive)',
        whatIs: 'A single 3-input AND gate: Y = A AND B AND C. LVC, 1.65-5.5V, automotive. Same pinout as 1G10B (AND vs NAND).',
        func: 'Y goes high only when A, B and C are all high. LVC CMOS, 5V-tolerant inputs, rail-to-rail output.',
        usedIn: 'Three-condition glue logic, enable combination, address decoding.',
        desc: 'Automotive single-gate 3-input AND, LVC, 1.65-5.5V (SC70-6).',
        specs: [
          { k: 'Function', v: 'Single-gate 3-input AND' },
          { k: 'Family', v: 'LVC (5V-tolerant inputs)' },
          { k: 'Supply', v: '1.65 ~ 5.5 V' },
          { k: 'Qualification', v: 'Automotive AEC-Q100' },
          { k: 'Package', v: 'SC70-6 / X2SON-6' }
        ],
        dropIn: [{ note: 'Same SC70-6 pinout; 1G10B is a 3-input NAND (different function)' }]
      },
      ja: {
        subcategory: 'シングルゲート 3 入力 AND（車載）',
        whatIs: '1 個の 3 入力 AND ゲート：Y = A AND B AND C。LVC、1.65-5.5V、車載。1G10B と同一ピン配置（AND 対 NAND）。',
        func: 'A、B、C がすべてハイのときだけ Y がハイ。LVC CMOS、5V 入力耐性、レール・ツー・レール出力。',
        usedIn: '3 条件のグルーロジック、有効化の組み合わせ、アドレスデコード。',
        desc: '車載シングルゲート 3 入力 AND、LVC、1.65-5.5V（SC70-6）。',
        specs: [
          { k: '機能', v: 'シングルゲート 3 入力 AND' },
          { k: 'ファミリ', v: 'LVC（5V 入力耐性）' },
          { k: '電源', v: '1.65 ~ 5.5 V' },
          { k: '認証', v: '車載 AEC-Q100' },
          { k: 'パッケージ', v: 'SC70-6 / X2SON-6' }
        ],
        dropIn: [{ note: '同一 SC70-6 ピン配置；1G10B は 3 入力 NAND（機能が異なる）' }]
      },
      ko: {
        subcategory: '싱글 게이트 3입력 AND(차량용)',
        whatIs: '1개의 3입력 AND 게이트: Y = A AND B AND C. LVC, 1.65-5.5V, 차량용. 1G10B와 동일 핀 배치(AND 대 NAND).',
        func: 'A, B, C가 모두 하이일 때만 Y가 하이. LVC CMOS, 5V 입력 내성, 레일 투 레일 출력.',
        usedIn: '3조건 글루 로직, 인에이블 조합, 주소 디코딩.',
        desc: '차량용 싱글 게이트 3입력 AND, LVC, 1.65-5.5V(SC70-6).',
        specs: [
          { k: '기능', v: '싱글 게이트 3입력 AND' },
          { k: '계열', v: 'LVC(5V 입력 내성)' },
          { k: '전원', v: '1.65 ~ 5.5 V' },
          { k: '인증', v: '차량용 AEC-Q100' },
          { k: '패키지', v: 'SC70-6 / X2SON-6' }
        ],
        dropIn: [{ note: '동일 SC70-6 핀 배치; 1G10B는 3입력 NAND(기능이 다름)' }]
      }
    },
    'SN74LVC1G14B-Q1': {
      en: {
        subcategory: 'Single-Gate Schmitt-Trigger Inverter (Automotive)',
        whatIs: 'A single Schmitt-trigger inverter: Y = NOT A, with hysteresis inputs to shape noisy/slow signals. LVC, 1.65-5.5V, automotive.',
        func: 'The Schmitt hysteresis shapes a slow-rising or noisy signal into a clean square wave, then inverts it. Common for RC delay/oscillation and signal shaping.',
        usedIn: 'Signal shaping/debounce, slow-clock shaping, RC oscillator, reset delay.',
        desc: 'Automotive single-gate Schmitt inverter, LVC, 1.65-5.5V (SOT-23-5).',
        specs: [
          { k: 'Function', v: 'Schmitt-trigger inverter (Y=NOT A)' },
          { k: 'Family', v: 'LVC (5V-tolerant inputs)' },
          { k: 'Supply', v: '1.65 ~ 5.5 V' },
          { k: 'Qualification', v: 'Automotive AEC-Q100' },
          { k: 'Package', v: 'SOT-23-5 / SC70-5 / X2SON-5' }
        ],
        dropIn: [{ note: 'Same SOT-23-5 pinout; 1G17B is a Schmitt buffer (non-inverting), different function' }]
      },
      ja: {
        subcategory: 'シングルゲート シュミットトリガインバータ（車載）',
        whatIs: '1 個のシュミットトリガインバータ：Y = NOT A、ヒステリシス入力で雑音/遅い信号を整形。LVC、1.65-5.5V、車載。',
        func: '入力のシュミットヒステリシスが緩やかに立ち上がる/雑音信号をきれいな方形波に整形してから反転出力。RC 遅延/発振、信号整形によく使う。',
        usedIn: '信号整形/デバウンス、遅いクロックの整形、RC 発振器、リセット遅延。',
        desc: '車載シングルゲート シュミットインバータ、LVC、1.65-5.5V（SOT-23-5）。',
        specs: [
          { k: '機能', v: 'シュミットトリガインバータ（Y=NOT A）' },
          { k: 'ファミリ', v: 'LVC（5V 入力耐性）' },
          { k: '電源', v: '1.65 ~ 5.5 V' },
          { k: '認証', v: '車載 AEC-Q100' },
          { k: 'パッケージ', v: 'SOT-23-5 / SC70-5 / X2SON-5' }
        ],
        dropIn: [{ note: '同一 SOT-23-5 ピン配置；1G17B はシュミットバッファ（非反転）、機能が異なる' }]
      },
      ko: {
        subcategory: '싱글 게이트 슈미트 트리거 인버터(차량용)',
        whatIs: '1개의 슈미트 트리거 인버터: Y = NOT A, 히스테리시스 입력으로 잡음/느린 신호 정형. LVC, 1.65-5.5V, 차량용.',
        func: '입력 슈미트 히스테리시스가 천천히 상승하거나 잡음이 섞인 신호를 깨끗한 구형파로 정형한 뒤 반전 출력. RC 지연/발진, 신호 정형에 자주 사용.',
        usedIn: '신호 정형/디바운스, 느린 클록 정형, RC 발진기, 리셋 지연.',
        desc: '차량용 싱글 게이트 슈미트 인버터, LVC, 1.65-5.5V(SOT-23-5).',
        specs: [
          { k: '기능', v: '슈미트 트리거 인버터(Y=NOT A)' },
          { k: '계열', v: 'LVC(5V 입력 내성)' },
          { k: '전원', v: '1.65 ~ 5.5 V' },
          { k: '인증', v: '차량용 AEC-Q100' },
          { k: '패키지', v: 'SOT-23-5 / SC70-5 / X2SON-5' }
        ],
        dropIn: [{ note: '동일 SOT-23-5 핀 배치; 1G17B는 슈미트 버퍼(비반전), 기능이 다름' }]
      }
    }
  };
  Object.assign(window.IC_I18N, T);
})();
/* batch 4: entries 45-59 */
(function () {
  var T = {
    'SN74LVC1G17B-Q1': {
      en: {
        subcategory: 'Single Schmitt-trigger buffer (automotive)',
        whatIs: 'Single Schmitt-trigger buffer: Y = A (non-inverting), with input hysteresis for signal conditioning. LVC, 1.65–5.5V, automotive. Same pinout as the 1G14B (buffer vs inverter).',
        func: 'Conditions the input via Schmitt hysteresis and outputs in phase — for signal shaping/buffer isolation and stronger drive.',
        usedIn: 'Signal conditioning/buffering, slow clock shaping, line driving, reset delay.',
        desc: 'Automotive single Schmitt buffer, LVC, 1.65–5.5V (SOT-23-5).',
        specs: [
          { k: 'Function', v: 'Schmitt-trigger buffer (Y=A)' },
          { k: 'Family', v: 'LVC (5V-tolerant inputs)' },
          { k: 'Supply', v: '1.65 – 5.5 V' },
          { k: 'Qualification', v: 'Automotive AEC-Q100' },
          { k: 'Package', v: 'SOT-23-5 / SC70-5 / X2SON-5' }
        ],
        dropIn: [{ note: 'Same SOT-23-5 pinout; the 1G14B is a Schmitt inverter — different function' }]
      },
      ja: {
        subcategory: '1 ゲート シュミットトリガバッファ（車載）',
        whatIs: '単体シュミットトリガバッファ：Y = A（非反転）、入力ヒステリシスで整形。LVC・1.65~5.5V・車載。1G14B とピン互換（バッファ vs 反転）。',
        func: '入力シュミットヒステリシスで整形後、同相出力。信号整形/バッファ絶縁・駆動力増強に。',
        usedIn: '信号整形/バッファ、低速クロック整形、ライン駆動、リセット遅延。',
        desc: '車載 1 ゲート シュミットバッファ。LVC・1.65~5.5V（SOT-23-5）。',
        specs: [
          { k: '機能', v: 'シュミットトリガバッファ（Y=A）' },
          { k: 'シリーズ', v: 'LVC（5V 入力耐圧）' },
          { k: '電源', v: '1.65 ~ 5.5 V' },
          { k: '認証', v: '車載 AEC-Q100' },
          { k: 'パッケージ', v: 'SOT-23-5 / SC70-5 / X2SON-5' }
        ],
        dropIn: [{ note: '同 SOT-23-5 ピン配置；1G14B はシュミット反転器で機能が異なる' }]
      },
      ko: {
        subcategory: '단일 게이트 슈미트 트리거 버퍼(차량용)',
        whatIs: '단일 슈미트 트리거 버퍼: Y = A(비반전), 입력 히스테리시스로 정형. LVC·1.65~5.5V·차량용. 1G14B와 핀 호환(버퍼 vs 반전).',
        func: '입력 슈미트 히스테리시스로 정형 후 동상 출력. 신호 정형/버퍼 절연·구동력 증강용.',
        usedIn: '신호 정형/버퍼, 저속 클록 정형, 라인 구동, 리셋 지연.',
        desc: '차량용 단일 게이트 슈미트 버퍼. LVC·1.65~5.5V(SOT-23-5).',
        specs: [
          { k: '기능', v: '슈미트 트리거 버퍼(Y=A)' },
          { k: '시리즈', v: 'LVC(5V 입력 내압)' },
          { k: '전원', v: '1.65 ~ 5.5 V' },
          { k: '인증', v: '차량용 AEC-Q100' },
          { k: '패키지', v: 'SOT-23-5 / SC70-5 / X2SON-5' }
        ],
        dropIn: [{ note: '동일 SOT-23-5 핀 배치; 1G14B는 슈미트 반전기로 기능 다름' }]
      }
    },
    'SN74LVC1G125B-Q1': {
      en: {
        subcategory: 'Single tri-state buffer (OE active-low, automotive)',
        whatIs: 'Single tri-state output buffer: Y=A when OE is low, Hi-Z when OE is high. For bus sharing/direction control. LVC, automotive.',
        func: 'When OE (active-low) enables, A is buffered to Y; when disabled, Y goes tri-state (Hi-Z) to release the bus. 1.65–5.5V, 5V-tolerant inputs.',
        usedIn: 'Bus sharing, tri-state signal driving, multi-device shared lines, direction control.',
        desc: 'Automotive single tri-state buffer (OE active-low), LVC, 1.65–5.5V (SOT-23-5).',
        specs: [
          { k: 'Function', v: 'Tri-state buffer (OE active-low)' },
          { k: 'Family', v: 'LVC (5V-tolerant inputs)' },
          { k: 'Supply', v: '1.65 – 5.5 V' },
          { k: 'Qualification', v: 'Automotive AEC-Q100' },
          { k: 'Package', v: 'SOT-23-5 / SC70-5 / X2SON-5' }
        ],
        dropIn: [{ note: 'Same SOT-23-5 pinout; the 1G126B has an active-high OE (opposite polarity)' }]
      },
      ja: {
        subcategory: '1 ゲート 3 ステートバッファ（OE active-low・車載）',
        whatIs: '単体 3 ステート出力バッファ：OE ローで Y=A、OE ハイで Y ハイインピーダンス。バス共用/方向制御用。LVC・車載。',
        func: 'OE（active-low）有効時 A を Y へバッファ；無効時 Y は 3 ステート（Hi-Z）でバスを解放。1.65~5.5V・5V 入力耐圧。',
        usedIn: 'バス共用、3 ステート信号駆動、複数デバイス共線、方向制御。',
        desc: '車載 1 ゲート 3 ステートバッファ（OE active-low）。LVC・1.65~5.5V（SOT-23-5）。',
        specs: [
          { k: '機能', v: '3 ステートバッファ（OE active-low）' },
          { k: 'シリーズ', v: 'LVC（5V 入力耐圧）' },
          { k: '電源', v: '1.65 ~ 5.5 V' },
          { k: '認証', v: '車載 AEC-Q100' },
          { k: 'パッケージ', v: 'SOT-23-5 / SC70-5 / X2SON-5' }
        ],
        dropIn: [{ note: '同 SOT-23-5 ピン配置；1G126B の OE は active-high（極性逆）' }]
      },
      ko: {
        subcategory: '단일 게이트 3상태 버퍼(OE active-low·차량용)',
        whatIs: '단일 3상태 출력 버퍼: OE 로우일 때 Y=A, OE 하이일 때 Y 고임피던스. 버스 공유/방향 제어용. LVC·차량용.',
        func: 'OE(active-low) 활성 시 A를 Y로 버퍼; 비활성 시 Y는 3상태(Hi-Z)로 버스 개방. 1.65~5.5V·5V 입력 내압.',
        usedIn: '버스 공유, 3상태 신호 구동, 다중 장치 공용선, 방향 제어.',
        desc: '차량용 단일 게이트 3상태 버퍼(OE active-low). LVC·1.65~5.5V(SOT-23-5).',
        specs: [
          { k: '기능', v: '3상태 버퍼(OE active-low)' },
          { k: '시리즈', v: 'LVC(5V 입력 내압)' },
          { k: '전원', v: '1.65 ~ 5.5 V' },
          { k: '인증', v: '차량용 AEC-Q100' },
          { k: '패키지', v: 'SOT-23-5 / SC70-5 / X2SON-5' }
        ],
        dropIn: [{ note: '동일 SOT-23-5 핀 배치; 1G126B의 OE는 active-high(극성 반대)' }]
      }
    },
    'SN74LVC1G126B-Q1': {
      en: {
        subcategory: 'Single tri-state buffer (OE active-high, automotive)',
        whatIs: 'Single tri-state output buffer: Y=A when OE is high, Hi-Z when OE is low. Same pinout as the 1G125B (opposite OE polarity). LVC, automotive.',
        func: 'When OE (active-high) enables, A is buffered to Y; when disabled, tri-state. 1.65–5.5V, 5V-tolerant inputs.',
        usedIn: 'Bus sharing, tri-state driving, multi-device shared lines, direction control.',
        desc: 'Automotive single tri-state buffer (OE active-high), LVC, 1.65–5.5V (SOT-23-5).',
        specs: [
          { k: 'Function', v: 'Tri-state buffer (OE active-high)' },
          { k: 'Family', v: 'LVC (5V-tolerant inputs)' },
          { k: 'Supply', v: '1.65 – 5.5 V' },
          { k: 'Qualification', v: 'Automotive AEC-Q100' },
          { k: 'Package', v: 'SOT-23-5 / SC70-5 / X2SON-5' }
        ],
        dropIn: [{ note: 'Same SOT-23-5 pinout; the 1G125B has an active-low OE (opposite polarity)' }]
      },
      ja: {
        subcategory: '1 ゲート 3 ステートバッファ（OE active-high・車載）',
        whatIs: '単体 3 ステート出力バッファ：OE ハイで Y=A、OE ローで Y ハイインピーダンス。1G125B とピン互換（OE 極性逆）。LVC・車載。',
        func: 'OE（active-high）有効時 A を Y へバッファ；無効時 3 ステート。1.65~5.5V・5V 入力耐圧。',
        usedIn: 'バス共用、3 ステート駆動、複数デバイス共線、方向制御。',
        desc: '車載 1 ゲート 3 ステートバッファ（OE active-high）。LVC・1.65~5.5V（SOT-23-5）。',
        specs: [
          { k: '機能', v: '3 ステートバッファ（OE active-high）' },
          { k: 'シリーズ', v: 'LVC（5V 入力耐圧）' },
          { k: '電源', v: '1.65 ~ 5.5 V' },
          { k: '認証', v: '車載 AEC-Q100' },
          { k: 'パッケージ', v: 'SOT-23-5 / SC70-5 / X2SON-5' }
        ],
        dropIn: [{ note: '同 SOT-23-5 ピン配置；1G125B の OE は active-low（極性逆）' }]
      },
      ko: {
        subcategory: '단일 게이트 3상태 버퍼(OE active-high·차량용)',
        whatIs: '단일 3상태 출력 버퍼: OE 하이일 때 Y=A, OE 로우일 때 Y 고임피던스. 1G125B와 핀 호환(OE 극성 반대). LVC·차량용.',
        func: 'OE(active-high) 활성 시 A를 Y로 버퍼; 비활성 시 3상태. 1.65~5.5V·5V 입력 내압.',
        usedIn: '버스 공유, 3상태 구동, 다중 장치 공용선, 방향 제어.',
        desc: '차량용 단일 게이트 3상태 버퍼(OE active-high). LVC·1.65~5.5V(SOT-23-5).',
        specs: [
          { k: '기능', v: '3상태 버퍼(OE active-high)' },
          { k: '시리즈', v: 'LVC(5V 입력 내압)' },
          { k: '전원', v: '1.65 ~ 5.5 V' },
          { k: '인증', v: '차량용 AEC-Q100' },
          { k: '패키지', v: 'SOT-23-5 / SC70-5 / X2SON-5' }
        ],
        dropIn: [{ note: '동일 SOT-23-5 핀 배치; 1G125B의 OE는 active-low(극성 반대)' }]
      }
    },
    'SN74LVC1G240B-Q1': {
      en: {
        subcategory: 'Single tri-state inverter (OE active-low, automotive)',
        whatIs: 'Single tri-state inverting buffer: Y=NOT A when OE is low, Hi-Z when OE is high. LVC, automotive. For inversion + bus driving.',
        func: 'When OE (active-low) enables, A is inverted and buffered to Y; when disabled, tri-state. 1.65–5.5V, 5V-tolerant inputs.',
        usedIn: 'Inversion + bus driving, tri-state inverted signals, inverted clock distribution.',
        desc: 'Automotive single tri-state inverter (OE active-low), LVC, 1.65–5.5V (SOT-23-5).',
        specs: [
          { k: 'Function', v: 'Tri-state inverter (OE active-low)' },
          { k: 'Family', v: 'LVC (5V-tolerant inputs)' },
          { k: 'Supply', v: '1.65 – 5.5 V' },
          { k: 'Qualification', v: 'Automotive AEC-Q100' },
          { k: 'Package', v: 'SOT-23-5 / SC70-5 / X2SON-5' }
        ]
      },
      ja: {
        subcategory: '1 ゲート 3 ステート反転器（OE active-low・車載）',
        whatIs: '単体 3 ステート反転バッファ：OE ローで Y=NOT A、OE ハイで 3 ステート。LVC・車載。反転＋バス駆動用。',
        func: 'OE（active-low）有効時 A を反転してバッファ；無効時 3 ステート。1.65~5.5V・5V 入力耐圧。',
        usedIn: '反転＋バス駆動、3 ステート反転信号、反転クロック分配。',
        desc: '車載 1 ゲート 3 ステート反転器（OE active-low）。LVC・1.65~5.5V（SOT-23-5）。',
        specs: [
          { k: '機能', v: '3 ステート反転器（OE active-low）' },
          { k: 'シリーズ', v: 'LVC（5V 入力耐圧）' },
          { k: '電源', v: '1.65 ~ 5.5 V' },
          { k: '認証', v: '車載 AEC-Q100' },
          { k: 'パッケージ', v: 'SOT-23-5 / SC70-5 / X2SON-5' }
        ]
      },
      ko: {
        subcategory: '단일 게이트 3상태 반전기(OE active-low·차량용)',
        whatIs: '단일 3상태 반전 버퍼: OE 로우일 때 Y=NOT A, OE 하이일 때 3상태. LVC·차량용. 반전+버스 구동용.',
        func: 'OE(active-low) 활성 시 A를 반전해 버퍼; 비활성 시 3상태. 1.65~5.5V·5V 입력 내압.',
        usedIn: '반전+버스 구동, 3상태 반전 신호, 반전 클록 분배.',
        desc: '차량용 단일 게이트 3상태 반전기(OE active-low). LVC·1.65~5.5V(SOT-23-5).',
        specs: [
          { k: '기능', v: '3상태 반전기(OE active-low)' },
          { k: '시리즈', v: 'LVC(5V 입력 내압)' },
          { k: '전원', v: '1.65 ~ 5.5 V' },
          { k: '인증', v: '차량용 AEC-Q100' },
          { k: '패키지', v: 'SOT-23-5 / SC70-5 / X2SON-5' }
        ]
      }
    },
    'SN74LVC1G175B-Q1': {
      en: {
        subcategory: 'Single D flip-flop (async clear, automotive)',
        whatIs: 'Single D flip-flop: the rising CLK edge latches D into Q; CLR asynchronously clears. LVC, automotive. For single-bit storage/division/synchronization.',
        func: 'CLK rising edge samples D → Q; pulling CLR (active-low) low immediately clears Q to 0 regardless of clock. 1.65–5.5V, 5V-tolerant inputs.',
        usedIn: 'Single-bit storage, divide-by-2, signal synchronization/metastability filtering, edge detection.',
        desc: 'Automotive single D flip-flop (async CLR), LVC, 1.65–5.5V (SOT-23-6).',
        specs: [
          { k: 'Function', v: 'D flip-flop (rising CLK, async CLR)' },
          { k: 'Family', v: 'LVC (5V-tolerant inputs)' },
          { k: 'Supply', v: '1.65 – 5.5 V' },
          { k: 'Qualification', v: 'Automotive AEC-Q100' },
          { k: 'Package', v: 'SOT-23-6 / SC70-6 / X2SON-6' }
        ]
      },
      ja: {
        subcategory: '1 個 D フリップフロップ（非同期クリア・車載）',
        whatIs: '単体 D フリップフロップ：CLK 立上りで D を Q にラッチ、CLR で非同期クリア。LVC・車載。1 ビットの記憶/分周/同期用。',
        func: 'CLK 正エッジで D をサンプル→Q；CLR（active-low）をローにするとクロックに関係なく即 Q を 0 クリア。1.65~5.5V・5V 入力耐圧。',
        usedIn: '1 ビット記憶、÷2 分周、信号同期/メタステーブル除去、エッジ検出。',
        desc: '車載 1 個 D フリップフロップ（非同期 CLR）。LVC・1.65~5.5V（SOT-23-6）。',
        specs: [
          { k: '機能', v: 'D フリップフロップ（CLK 正エッジ・非同期 CLR）' },
          { k: 'シリーズ', v: 'LVC（5V 入力耐圧）' },
          { k: '電源', v: '1.65 ~ 5.5 V' },
          { k: '認証', v: '車載 AEC-Q100' },
          { k: 'パッケージ', v: 'SOT-23-6 / SC70-6 / X2SON-6' }
        ]
      },
      ko: {
        subcategory: '단일 D 플립플롭(비동기 클리어·차량용)',
        whatIs: '단일 D 플립플롭: CLK 상승 에지에서 D를 Q에 래치, CLR로 비동기 클리어. LVC·차량용. 1비트 저장/분주/동기용.',
        func: 'CLK 상승 에지에서 D 샘플 → Q; CLR(active-low)을 로우로 하면 클록과 무관하게 즉시 Q를 0으로 클리어. 1.65~5.5V·5V 입력 내압.',
        usedIn: '1비트 저장, ÷2 분주, 신호 동기/준안정 제거, 에지 검출.',
        desc: '차량용 단일 D 플립플롭(비동기 CLR). LVC·1.65~5.5V(SOT-23-6).',
        specs: [
          { k: '기능', v: 'D 플립플롭(CLK 상승 에지·비동기 CLR)' },
          { k: '시리즈', v: 'LVC(5V 입력 내압)' },
          { k: '전원', v: '1.65 ~ 5.5 V' },
          { k: '인증', v: '차량용 AEC-Q100' },
          { k: '패키지', v: 'SOT-23-6 / SC70-6 / X2SON-6' }
        ]
      }
    },
    'SN74LVC14B': {
      en: {
        subcategory: 'Hex Schmitt-trigger inverter',
        whatIs: 'Hex Schmitt-trigger inverter: 6 independent inverters, each with input hysteresis to reshape noisy/slow signals. LVC, 1.65–5.5V.',
        func: 'Each channel nA→nY with Y=NOT A and Schmitt hysteresis on the input. Six independent channels — commonly used for multi-line signal conditioning/inversion and RC oscillators.',
        usedIn: 'Multi-line signal conditioning/debounce, slow clock shaping, RC oscillators, reset delay.',
        desc: 'Hex LVC Schmitt inverter, 1.65–5.5V, 5V-tolerant inputs (TSSOP/SOIC-14).',
        specs: [
          { k: 'Function', v: 'Hex Schmitt inverter' },
          { k: 'Family', v: 'LVC (5V-tolerant inputs)' },
          { k: 'Supply', v: '1.65 – 5.5 V' },
          { k: 'Package', v: 'TSSOP-14 / SOIC-14' }
        ]
      },
      ja: {
        subcategory: '6 回路 シュミットトリガ反転器',
        whatIs: '6 回路シュミットトリガ反転器：6 個の独立反転器、各入力にヒステリシスを持ちノイズ/低速信号を整形。LVC・1.65~5.5V。',
        func: '各回路 nA→nY で Y=NOT A、入力シュミットヒステリシス。6 回路独立——多回線の信号整形/反転や RC 発振の定番。',
        usedIn: '多回線の信号整形/デバウンス、低速クロック整形、RC 発振、リセット遅延。',
        desc: '6 回路 LVC シュミット反転器。1.65~5.5V・5V 入力耐圧（TSSOP/SOIC-14）。',
        specs: [
          { k: '機能', v: '6 回路シュミット反転器' },
          { k: 'シリーズ', v: 'LVC（5V 入力耐圧）' },
          { k: '電源', v: '1.65 ~ 5.5 V' },
          { k: 'パッケージ', v: 'TSSOP-14 / SOIC-14' }
        ]
      },
      ko: {
        subcategory: '6채널 슈미트 트리거 반전기',
        whatIs: '6채널 슈미트 트리거 반전기: 6개 독립 반전기, 각 입력에 히스테리시스로 잡음/느린 신호 정형. LVC·1.65~5.5V.',
        func: '각 채널 nA→nY로 Y=NOT A, 입력 슈미트 히스테리시스. 6채널 독립 - 다중 선 신호 정형/반전, RC 발진의 정석.',
        usedIn: '다중 선 신호 정형/디바운스, 저속 클록 정형, RC 발진, 리셋 지연.',
        desc: '6채널 LVC 슈미트 반전기. 1.65~5.5V·5V 입력 내압(TSSOP/SOIC-14).',
        specs: [
          { k: '기능', v: '6채널 슈미트 반전기' },
          { k: '시리즈', v: 'LVC(5V 입력 내압)' },
          { k: '전원', v: '1.65 ~ 5.5 V' },
          { k: '패키지', v: 'TSSOP-14 / SOIC-14' }
        ]
      }
    },
    'SN74AC157-Q1': {
      en: {
        subcategory: 'Quad 2:1 data selector/multiplexer (automotive)',
        whatIs: 'Quad 2:1 data selector (multiplexer): a single A/B select line simultaneously decides whether each of the 4 channels takes its A or B input onto Y. G (strobe) enables. AC family, automotive.',
        func: 'When A/B is low each nY=nA, when high nY=nB; G (active-low strobe) high forces all Y outputs low. Switches a 4-bit source with one line. 2–5.5V.',
        usedIn: 'Bus source switching, 4-bit data selection, address/data multiplexing, dual-source switching.',
        desc: 'Automotive quad 2:1 data selector/multiplexer, shared select line + strobe, AC family (TSSOP/SOIC-16).',
        specs: [
          { k: 'Function', v: 'Quad 2:1 data selector/multiplexer' },
          { k: 'Control', v: 'A/B select line + G strobe (active-low)' },
          { k: 'Family', v: 'AC (CMOS)' },
          { k: 'Supply', v: '2 – 5.5 V' },
          { k: 'Qualification', v: 'Automotive AEC-Q100' },
          { k: 'Package', v: 'TSSOP-16 / SOIC-16 (thermal pad to GND or floating)' }
        ]
      },
      ja: {
        subcategory: '4 回路 2:1 データセレクタ/マルチプレクサ（車載）',
        whatIs: '4 回路 2:1 データセレクタ（マルチプレクサ）：1 本の A/B 選択線が同時に、4 回路それぞれ A か B の入力を Y へ取るか決定。G（ストローブ）でイネーブル。AC シリーズ・車載。',
        func: 'A/B ローで各回路 nY=nA、ハイで nY=nB；G（active-low ストローブ）ハイで全 Y 出力ロー。1 本で 4 ビットのソースを切替。2~5.5V。',
        usedIn: 'バスソース切替、4 ビットデータ選択、アドレス/データ多重化、2 ソース切替。',
        desc: '車載 4 回路 2:1 データセレクタ/マルチプレクサ。共用選択線＋ストローブ・AC シリーズ（TSSOP/SOIC-16）。',
        specs: [
          { k: '機能', v: '4 回路 2:1 データセレクタ/マルチプレクサ' },
          { k: '制御', v: 'A/B 選択線＋G ストローブ（active-low）' },
          { k: 'シリーズ', v: 'AC（CMOS）' },
          { k: '電源', v: '2 ~ 5.5 V' },
          { k: '認証', v: '車載 AEC-Q100' },
          { k: 'パッケージ', v: 'TSSOP-16 / SOIC-16（サーマルパッドは GND か浮き）' }
        ]
      },
      ko: {
        subcategory: '4채널 2:1 데이터 선택기/멀티플렉서(차량용)',
        whatIs: '4채널 2:1 데이터 선택기(멀티플렉서): 하나의 A/B 선택선이 동시에 4채널 각각 A 또는 B 입력을 Y로 취할지 결정. G(스트로브)로 인에이블. AC 시리즈·차량용.',
        func: 'A/B 로우면 각 채널 nY=nA, 하이면 nY=nB; G(active-low 스트로브) 하이면 전체 Y 출력 로우. 한 선으로 4비트 소스 전환. 2~5.5V.',
        usedIn: '버스 소스 전환, 4비트 데이터 선택, 주소/데이터 다중화, 2소스 전환.',
        desc: '차량용 4채널 2:1 데이터 선택기/멀티플렉서. 공용 선택선+스트로브·AC 시리즈(TSSOP/SOIC-16).',
        specs: [
          { k: '기능', v: '4채널 2:1 데이터 선택기/멀티플렉서' },
          { k: '제어', v: 'A/B 선택선 + G 스트로브(active-low)' },
          { k: '시리즈', v: 'AC(CMOS)' },
          { k: '전원', v: '2 ~ 5.5 V' },
          { k: '인증', v: '차량용 AEC-Q100' },
          { k: '패키지', v: 'TSSOP-16 / SOIC-16(서멀 패드 GND 또는 플로팅)' }
        ]
      }
    },
    '74LVC4066-Q100': {
      en: {
        subcategory: 'Quad bilateral analog switch',
        whatIs: 'Quad bidirectional analog/digital switch: 4 independent SPST switches, each with a control pin nE deciding whether nY↔nZ conducts. Bidirectional, passes analog or digital. LVC, automotive.',
        func: 'Each channel: nE high conducts nY↔nZ, low disconnects; signals bidirectional, low Ron. For signal routing, sample-and-hold, signal gating. 1.2–3.6V (LVC).',
        usedIn: 'Analog/digital signal routing, sample-and-hold, signal gating, sensor muxing.',
        desc: 'Quad bilateral analog switch, independent E control per channel, bidirectional (SO14/TSSOP14).',
        specs: [
          { k: 'Function', v: 'Quad bilateral analog switch (4× SPST)' },
          { k: 'Control', v: 'nE per channel (high conducts)' },
          { k: 'Family', v: 'LVC (CMOS)' },
          { k: 'Supply', v: '1.2 – 3.6 V (per datasheet)' },
          { k: 'Qualification', v: 'Automotive AEC-Q100' },
          { k: 'Package', v: 'SO14 / TSSOP14 / DHVQFN14 (thermal pad not grounded, float or tie to GND)' }
        ]
      },
      ja: {
        subcategory: '4 回路双方向アナログスイッチ（Quad Bilateral Switch）',
        whatIs: '4 回路双方向アナログ/デジタルスイッチ：4 個の独立 SPST スイッチ、各々制御ピン nE で nY↔nZ の導通を決定。双方向・アナログもデジタルも伝送。LVC・車載。',
        func: '各回路 nE ハイで nY↔nZ 導通、ロー遮断；信号双方向・低 Ron。信号選路・サンプルホールド・信号ゲーティングに。1.2~3.6V（LVC）。',
        usedIn: 'アナログ/デジタル信号選路、サンプルホールド、信号ゲーティング、センサ多重化。',
        desc: '4 回路双方向アナログスイッチ。各回路独立 E 制御・双方向（SO14/TSSOP14）。',
        specs: [
          { k: '機能', v: '4 回路双方向アナログスイッチ（4× SPST）' },
          { k: '制御', v: '各回路 nE（ハイで導通）' },
          { k: 'シリーズ', v: 'LVC（CMOS）' },
          { k: '電源', v: '1.2 ~ 3.6 V（datasheet 参照）' },
          { k: '認証', v: '車載 AEC-Q100' },
          { k: 'パッケージ', v: 'SO14 / TSSOP14 / DHVQFN14（サーマルパッドは非接地、浮きか GND 接続）' }
        ]
      },
      ko: {
        subcategory: '4채널 양방향 아날로그 스위치(Quad Bilateral Switch)',
        whatIs: '4채널 양방향 아날로그/디지털 스위치: 4개 독립 SPST 스위치, 각각 제어 핀 nE로 nY↔nZ 도통 결정. 양방향·아날로그나 디지털 전송. LVC·차량용.',
        func: '각 채널 nE 하이면 nY↔nZ 도통, 로우면 차단; 신호 양방향·저 Ron. 신호 라우팅·샘플 홀드·신호 게이팅용. 1.2~3.6V(LVC).',
        usedIn: '아날로그/디지털 신호 라우팅, 샘플 홀드, 신호 게이팅, 센서 다중화.',
        desc: '4채널 양방향 아날로그 스위치. 각 채널 독립 E 제어·양방향(SO14/TSSOP14).',
        specs: [
          { k: '기능', v: '4채널 양방향 아날로그 스위치(4× SPST)' },
          { k: '제어', v: '각 채널 nE(하이로 도통)' },
          { k: '시리즈', v: 'LVC(CMOS)' },
          { k: '전원', v: '1.2 ~ 3.6 V(datasheet 참조)' },
          { k: '인증', v: '차량용 AEC-Q100' },
          { k: '패키지', v: 'SO14 / TSSOP14 / DHVQFN14(서멀 패드 비접지, 플로팅 또는 GND 접속)' }
        ]
      }
    },
    'TPUL1G113': {
      en: {
        subcategory: 'Single retriggerable pulse generator (monostable, RC timing)',
        whatIs: 'Single retriggerable pulse generator (monostable / one-shot): after a trigger it outputs one pulse whose width is set by an external RC. Supports rising- and falling-edge triggers and asynchronous clear.',
        func: 'After a trigger (rising or falling edge), Q outputs a fixed-width pulse whose width is set by external RC/C timing components; retriggerable (a new trigger extends the pulse); CLR (active-low) immediately ends the pulse. For delay, pulse shaping, watchdog.',
        usedIn: 'Delay/pulse shaping, generating a fixed pulse from an edge, watchdog timing, debounce delay.',
        desc: 'Single retriggerable pulse generator (monostable), RC timing, dual-edge trigger, async CLR (VSSOP-8).',
        specs: [
          { k: 'Function', v: 'Retriggerable monostable pulse generator' },
          { k: 'Trigger', v: 'rising + falling edge (dual-edge)' },
          { k: 'Timing', v: 'external RC (RC/C pins)' },
          { k: 'Clear', v: 'CLR (active-low, asynchronous)' },
          { k: 'Package', v: 'VSSOP-8 (DCU)' }
        ]
      },
      ja: {
        subcategory: '1 個 再トリガ可能パルス発生器（単安定・RC タイミング）',
        whatIs: '単体再トリガ可能パルス発生器（単安定 / ワンショット）：トリガ後、外付け RC で幅が決まるパルスを 1 発出力。立上り・立下りエッジトリガと非同期クリアに対応。',
        func: 'トリガ（立上り/立下り）後、Q が外付け RC/C タイミング素子で決まる固定幅パルスを出力；再トリガ可能（新トリガでパルス延長）；CLR（active-low）で即パルス終了。遅延・パルス整形・ウォッチドッグに。',
        usedIn: '遅延/パルス整形、エッジから固定パルス生成、ウォッチドッグ計時、デバウンス遅延。',
        desc: '単体再トリガ可能パルス発生器（単安定）。RC タイミング・両エッジトリガ・非同期 CLR（VSSOP-8）。',
        specs: [
          { k: '機能', v: '再トリガ可能単安定パルス発生器' },
          { k: 'トリガ', v: '立上り＋立下り（両エッジ）' },
          { k: 'タイミング', v: '外付け RC（RC/C ピン）' },
          { k: 'クリア', v: 'CLR（active-low・非同期）' },
          { k: 'パッケージ', v: 'VSSOP-8 (DCU)' }
        ]
      },
      ko: {
        subcategory: '단일 재트리거 가능 펄스 발생기(모노스테이블·RC 타이밍)',
        whatIs: '단일 재트리거 가능 펄스 발생기(모노스테이블 / 원샷): 트리거 후 외장 RC로 폭이 정해지는 펄스를 1발 출력. 상승·하강 에지 트리거와 비동기 클리어 지원.',
        func: '트리거(상승/하강 에지) 후 Q가 외장 RC/C 타이밍 소자로 정해지는 고정 폭 펄스 출력; 재트리거 가능(새 트리거로 펄스 연장); CLR(active-low)로 즉시 펄스 종료. 지연·펄스 정형·워치독용.',
        usedIn: '지연/펄스 정형, 에지에서 고정 펄스 생성, 워치독 계시, 디바운스 지연.',
        desc: '단일 재트리거 가능 펄스 발생기(모노스테이블). RC 타이밍·양 에지 트리거·비동기 CLR(VSSOP-8).',
        specs: [
          { k: '기능', v: '재트리거 가능 모노스테이블 펄스 발생기' },
          { k: '트리거', v: '상승+하강 에지(양 에지)' },
          { k: '타이밍', v: '외장 RC(RC/C 핀)' },
          { k: '클리어', v: 'CLR(active-low·비동기)' },
          { k: '패키지', v: 'VSSOP-8 (DCU)' }
        ]
      }
    },
    'TXG4122': {
      en: {
        subcategory: 'Bidirectional ground-level translator (±40V, I2C)',
        whatIs: '±40V bidirectional ground-level translator: passes SCL/SDA between two I2C domains whose grounds differ by up to ±40V. Beyond just voltage levels, it bridges domains with different grounds too.',
        func: 'Between side 1 (VCC1/GND1) and side 2 (VCC2/GND2) it bidirectionally translates I2C SCL/SDA, tolerating up to ±40V ground difference. Open-drain compatible, automatically bidirectional. Solves I2C communication between subsystems at different ground potentials.',
        usedIn: 'I2C bridging between subsystems at different ground potentials, battery-pack/power-domain communication, I2C inside motors/inverters, level shifting ahead of ground-loop isolation.',
        desc: '±40V bidirectional ground-level translator (I2C), independent VCC/GND per side, open-drain compatible (WSON/SOT-23/SOIC-8).',
        specs: [
          { k: 'Function', v: 'Bidirectional ground-level translator (I2C SCL/SDA)' },
          { k: 'Ground difference', v: '±40V (grounds may differ by ±40V)' },
          { k: 'Interface', v: 'I2C (open-drain compatible, auto bidirectional)' },
          { k: 'Supply', v: 'independent VCC1/VCC2 per side' },
          { k: 'Package', v: 'WSON-8 (DSG) / SOT-23-8 (DDF) / SOIC-8 (D)' }
        ]
      },
      ja: {
        subcategory: '双方向グランドレベルトランスレータ（±40V・I2C）',
        whatIs: '±40V 双方向グランドレベルトランスレータ：グランド電位差が ±40V に達する 2 つの I2C ドメイン間で SCL/SDA を伝達。電圧レベルだけでなく「グランド」が異なる場合もブリッジ可。',
        func: '側 1（VCC1/GND1）と側 2（VCC2/GND2）の間で I2C の SCL/SDA を双方向変換し、両側グランドの ±40V 差を許容。オープンドレイン互換・自動双方向。異なるグランド電位のサブシステム間の I2C 通信を解決。',
        usedIn: '異なるグランド電位のサブシステム間 I2C ブリッジ、バッテリパック/電源ドメイン間通信、モータ/インバータ内 I2C、グランドループ絶縁前のレベル変換。',
        desc: '±40V 双方向グランドレベルトランスレータ（I2C）。両側 VCC/GND 独立・オープンドレイン互換（WSON/SOT-23/SOIC-8）。',
        specs: [
          { k: '機能', v: '双方向グランドレベルトランスレータ（I2C SCL/SDA）' },
          { k: 'グランド電位差', v: '±40V（両側 GND が ±40V 差可）' },
          { k: 'インタフェース', v: 'I2C（オープンドレイン互換・自動双方向）' },
          { k: '電源', v: '両側独立 VCC1/VCC2' },
          { k: 'パッケージ', v: 'WSON-8 (DSG) / SOT-23-8 (DDF) / SOIC-8 (D)' }
        ]
      },
      ko: {
        subcategory: '양방향 접지 레벨 변환기(±40V·I2C)',
        whatIs: '±40V 양방향 접지 레벨 변환기: 접지 전위차가 ±40V에 이르는 두 I2C 도메인 사이에서 SCL/SDA 전달. 전압 레벨뿐 아니라 "접지"가 다른 경우도 브리지 가능.',
        func: '측 1(VCC1/GND1)과 측 2(VCC2/GND2) 사이에서 I2C의 SCL/SDA를 양방향 변환하고 양측 접지의 ±40V 차이를 허용. 오픈 드레인 호환·자동 양방향. 서로 다른 접지 전위 서브시스템 간 I2C 통신 해결.',
        usedIn: '서로 다른 접지 전위 서브시스템 간 I2C 브리징, 배터리 팩/전원 도메인 간 통신, 모터/인버터 내 I2C, 접지 루프 절연 전 레벨 변환.',
        desc: '±40V 양방향 접지 레벨 변환기(I2C). 양측 VCC/GND 독립·오픈 드레인 호환(WSON/SOT-23/SOIC-8).',
        specs: [
          { k: '기능', v: '양방향 접지 레벨 변환기(I2C SCL/SDA)' },
          { k: '접지 전위차', v: '±40V(양측 GND가 ±40V 차이 가능)' },
          { k: '인터페이스', v: 'I2C(오픈 드레인 호환·자동 양방향)' },
          { k: '전원', v: '양측 독립 VCC1/VCC2' },
          { k: '패키지', v: 'WSON-8 (DSG) / SOT-23-8 (DDF) / SOIC-8 (D)' }
        ]
      }
    },
    'SN74CBTLV3245A-Q1': {
      en: {
        subcategory: 'Octal FET bus switch (low voltage, automotive)',
        whatIs: 'Octal FET bus switch: 8 independent channels, A↔B all controlled on/off by a single OE, with low-resistance near-zero-drop pass-through when on. Bidirectional, automotive. For whole-bus isolation/sharing.',
        func: 'When OE (active-low) is low all 8 A↔B pass through (low Ron); when high all disconnect (Hi-Z). No logic, no amplification — on/off/isolation for the whole 8-bit bus. Low voltage ≤3.6V.',
        usedIn: '8-bit bus isolation/sharing, memory/address-bus switching, hot-plug isolation, signal routing.',
        desc: 'Automotive octal FET bus switch, single OE (active-low), low Ron, bidirectional pass-through (TSSOP/VQFN-20).',
        specs: [
          { k: 'Function', v: 'Octal FET bus switch (bidirectional pass-through)' },
          { k: 'Enable', v: 'single OE (active-low, controls all 8)' },
          { k: 'Channels', v: '8 (A1/B1 – A8/B8)' },
          { k: 'Conduction', v: 'low-Ron FET pass-through, near-zero drop' },
          { k: 'Supply', v: 'low voltage ≤3.6V (per datasheet)' },
          { k: 'Qualification', v: 'Automotive AEC-Q100' },
          { k: 'Package', v: 'TSSOP-20 (DGV) / VQFN-20 (RKS)' }
        ]
      },
      ja: {
        subcategory: '8 ビット FET バススイッチ（低電圧・車載）',
        whatIs: '8 ビット（オクタル）FET バススイッチ：8 本の独立チャネル、A↔B を単一 OE で同時に開閉、導通時は低抵抗ほぼゼロ電圧降下の直通。双方向・車載。バス一括の絶縁/共用に。',
        func: 'OE（active-low）ローで 8 回路 A↔B 全直通（低 Ron）、ハイで全遮断（ハイインピーダンス）。論理も増幅もせず、8 ビットバス一括の通断/絶縁。低電圧 ≤3.6V。',
        usedIn: '8 ビットバス絶縁/共用、メモリ/アドレスバス切替、ホットプラグ絶縁、信号ルーティング。',
        desc: '車載 8 ビット FET バススイッチ。単一 OE（active-low）・低 Ron・双方向直通（TSSOP/VQFN-20）。',
        specs: [
          { k: '機能', v: '8 ビット FET バススイッチ（双方向直通）' },
          { k: 'イネーブル', v: '単一 OE（active-low、8 回路一括制御）' },
          { k: 'チャネル', v: '8（A1/B1 ~ A8/B8）' },
          { k: '導通方式', v: '低 Ron FET 直通・ほぼゼロ電圧降下' },
          { k: '電源', v: '低電圧 ≤3.6V（datasheet 参照）' },
          { k: '認証', v: '車載 AEC-Q100' },
          { k: 'パッケージ', v: 'TSSOP-20 (DGV) / VQFN-20 (RKS)' }
        ]
      },
      ko: {
        subcategory: '8비트 FET 버스 스위치(저전압·차량용)',
        whatIs: '8비트(옥탈) FET 버스 스위치: 8개 독립 채널, A↔B를 단일 OE로 동시 개폐, 도통 시 저저항 거의 제로 전압 강하 직통. 양방향·차량용. 버스 일괄 절연/공유용.',
        func: 'OE(active-low) 로우면 8채널 A↔B 전부 직통(저 Ron), 하이면 전부 차단(Hi-Z). 논리도 증폭도 없이 8비트 버스 일괄 통차단/절연. 저전압 ≤3.6V.',
        usedIn: '8비트 버스 절연/공유, 메모리/주소 버스 전환, 핫플러그 절연, 신호 라우팅.',
        desc: '차량용 8비트 FET 버스 스위치. 단일 OE(active-low)·저 Ron·양방향 직통(TSSOP/VQFN-20).',
        specs: [
          { k: '기능', v: '8비트 FET 버스 스위치(양방향 직통)' },
          { k: '인에이블', v: '단일 OE(active-low, 8채널 일괄 제어)' },
          { k: '채널', v: '8(A1/B1 ~ A8/B8)' },
          { k: '도통 방식', v: '저 Ron FET 직통·거의 제로 전압 강하' },
          { k: '전원', v: '저전압 ≤3.6V(datasheet 참조)' },
          { k: '인증', v: '차량용 AEC-Q100' },
          { k: '패키지', v: 'TSSOP-20 (DGV) / VQFN-20 (RKS)' }
        ]
      }
    },
    'SN74CBTLV3257-Q1': {
      en: {
        subcategory: 'Quad 1-of-2 FET mux/demux (low voltage, automotive)',
        whatIs: 'Quad 1-of-2 FET mux/demux: each of 4 channels has one common terminal nA and two branches nB1/nB2, with a single S selecting whether nA connects to nB1 or nB2. Bidirectional, low Ron, automotive.',
        func: 'When S is low each nA↔nB1, when high nA↔nB2; OE (active-low) enables. Bidirectional pass-through (not logic) — usable as a mux (select 1) or demux (1-to-many). Low voltage ≤3.6V.',
        usedIn: '4-bit signal 1-of-2 routing, bus switching, dual-path selection, memory/interface switching.',
        desc: 'Automotive quad 1-of-2 FET mux/demux, single S select + OE (active-low), bidirectional (TSSOP/SOIC-16).',
        specs: [
          { k: 'Function', v: 'Quad 1-of-2 FET mux/demux (bidirectional)' },
          { k: 'Control', v: 'single S select + OE (active-low)' },
          { k: 'Channels', v: '4 (each 1 common A + 2 branches B1/B2)' },
          { k: 'Conduction', v: 'low-Ron FET pass-through' },
          { k: 'Supply', v: 'low voltage ≤3.6V (per datasheet)' },
          { k: 'Qualification', v: 'Automotive AEC-Q100' },
          { k: 'Package', v: 'TSSOP-16 / SOIC-16' }
        ]
      },
      ja: {
        subcategory: '4 ビット 1-of-2 FET マルチ/デマルチプレクサ（低電圧・車載）',
        whatIs: '4 ビット 1-of-2 FET マルチ/デマルチプレクサ：4 回路それぞれに共通端子 nA と 2 分岐 nB1/nB2 を持ち、単一 S で nA を nB1 か nB2 へ接続。双方向・低 Ron・車載。',
        func: 'S ロー時各回路 nA↔nB1、ハイ時 nA↔nB2；OE（active-low）イネーブル。双方向直通（論理でない）、mux（1 選択）か demux（1 対多）として使用可。低電圧 ≤3.6V。',
        usedIn: '4 ビット信号の 2 択ルーティング、バス切替、2 経路選択、メモリ/インタフェース切替。',
        desc: '車載 4 ビット 1-of-2 FET マルチ/デマルチプレクサ。単一 S 選択＋OE（active-low）・双方向（TSSOP/SOIC-16）。',
        specs: [
          { k: '機能', v: '4 ビット 1-of-2 FET マルチ/デマルチプレクサ（双方向）' },
          { k: '制御', v: '単一 S 選択＋OE（active-low）' },
          { k: 'チャネル', v: '4（各 共通 A 1＋分岐 B1/B2 2）' },
          { k: '導通方式', v: '低 Ron FET 直通' },
          { k: '電源', v: '低電圧 ≤3.6V（datasheet 参照）' },
          { k: '認証', v: '車載 AEC-Q100' },
          { k: 'パッケージ', v: 'TSSOP-16 / SOIC-16' }
        ]
      },
      ko: {
        subcategory: '4비트 1-of-2 FET 먹스/디먹스(저전압·차량용)',
        whatIs: '4비트 1-of-2 FET 먹스/디먹스: 4채널 각각에 공용 단자 nA와 2분기 nB1/nB2가 있고 단일 S로 nA를 nB1 또는 nB2에 연결. 양방향·저 Ron·차량용.',
        func: 'S 로우면 각 채널 nA↔nB1, 하이면 nA↔nB2; OE(active-low) 인에이블. 양방향 직통(논리 아님), 먹스(1선택)나 디먹스(1대다)로 사용 가능. 저전압 ≤3.6V.',
        usedIn: '4비트 신호 2택 라우팅, 버스 전환, 2경로 선택, 메모리/인터페이스 전환.',
        desc: '차량용 4비트 1-of-2 FET 먹스/디먹스. 단일 S 선택+OE(active-low)·양방향(TSSOP/SOIC-16).',
        specs: [
          { k: '기능', v: '4비트 1-of-2 FET 먹스/디먹스(양방향)' },
          { k: '제어', v: '단일 S 선택 + OE(active-low)' },
          { k: '채널', v: '4(각 공용 A 1 + 분기 B1/B2 2)' },
          { k: '도통 방식', v: '저 Ron FET 직통' },
          { k: '전원', v: '저전압 ≤3.6V(datasheet 참조)' },
          { k: '인증', v: '차량용 AEC-Q100' },
          { k: '패키지', v: 'TSSOP-16 / SOIC-16' }
        ]
      }
    },
    'SN54SC1G08-SEP': {
      en: {
        subcategory: 'Single 2-input AND gate (radiation-tolerant SEP)',
        whatIs: 'Single 2-input AND gate (radiation-tolerant SEP): Y = A AND B. SC family, single-event tolerant, space-grade.',
        func: 'Y goes high only when A and B are both high. Radiation-tolerant (SEP), wide supply — for space/high-reliability use.',
        usedIn: 'Space/aerospace glue logic, radiation-tolerant enable combining, high-reliability system logic.',
        desc: 'Radiation-tolerant single 2-input AND (SEP), SC family (SOT-23-5/SC70-5).',
        specs: [
          { k: 'Function', v: 'Single 2-input AND (Y=A·B)' },
          { k: 'Family', v: 'SC (radiation-tolerant)' },
          { k: 'Radiation', v: 'SEP (single-event protection, space-grade)' },
          { k: 'Package', v: 'SOT-23-5 / SC70-5' }
        ]
      },
      ja: {
        subcategory: '1 ゲート 2 入力 AND（耐放射線 SEP）',
        whatIs: '単体 2 入力 AND ゲート（耐放射線 SEP）：Y = A AND B。SC シリーズ・シングルイベント耐性・宇宙級。',
        func: 'A・B とも高のとき Y のみ高。耐放射線（SEP）・広電源、宇宙/高信頼向け。',
        usedIn: '宇宙/航空宇宙グルーロジック、耐放射線イネーブル合成、高信頼システム論理。',
        desc: '耐放射線 1 ゲート 2 入力 AND（SEP）。SC シリーズ（SOT-23-5/SC70-5）。',
        specs: [
          { k: '機能', v: '1 ゲート 2 入力 AND（Y=A·B）' },
          { k: 'シリーズ', v: 'SC（耐放射線）' },
          { k: '耐放射線', v: 'SEP（シングルイベント防護・宇宙級）' },
          { k: 'パッケージ', v: 'SOT-23-5 / SC70-5' }
        ]
      },
      ko: {
        subcategory: '단일 게이트 2입력 AND(내방사선 SEP)',
        whatIs: '단일 2입력 AND 게이트(내방사선 SEP): Y = A AND B. SC 시리즈·단일 이벤트 내성·우주급.',
        func: 'A·B 모두 하이일 때만 Y가 하이. 내방사선(SEP)·광전원, 우주/고신뢰용.',
        usedIn: '우주/항공우주 글루 로직, 내방사선 인에이블 조합, 고신뢰 시스템 논리.',
        desc: '내방사선 단일 게이트 2입력 AND(SEP). SC 시리즈(SOT-23-5/SC70-5).',
        specs: [
          { k: '기능', v: '단일 게이트 2입력 AND(Y=A·B)' },
          { k: '시리즈', v: 'SC(내방사선)' },
          { k: '내방사선', v: 'SEP(단일 이벤트 보호·우주급)' },
          { k: '패키지', v: 'SOT-23-5 / SC70-5' }
        ]
      }
    },
    'SN54SC1G125-SEP': {
      en: {
        subcategory: 'Single tri-state bus buffer (OE active-low, radiation-tolerant SEP)',
        whatIs: 'Single tri-state bus buffer (radiation-tolerant SEP): Y=A when OE is low, tri-state when high. SC family, single-event tolerant, space-grade.',
        func: 'OE (active-low) enables buffering A to Y; disabled goes tri-state to release the bus. Radiation-tolerant, wide supply.',
        usedIn: 'Space/aerospace bus sharing, tri-state driving, radiation-tolerant signal buffering.',
        desc: 'Radiation-tolerant single tri-state buffer (OE active-low, SEP), SC family (SOT-23-5/SC70-5).',
        specs: [
          { k: 'Function', v: 'Tri-state bus buffer (OE active-low)' },
          { k: 'Family', v: 'SC (radiation-tolerant)' },
          { k: 'Radiation', v: 'SEP (single-event protection, space-grade)' },
          { k: 'Package', v: 'SOT-23-5 / SC70-5' }
        ]
      },
      ja: {
        subcategory: '1 ゲート 3 ステートバスバッファ（OE active-low・耐放射線 SEP）',
        whatIs: '単体 3 ステートバスバッファ（耐放射線 SEP）：OE ローで Y=A、ハイで 3 ステート。SC シリーズ・シングルイベント耐性・宇宙級。',
        func: 'OE（active-low）有効で A を Y へバッファ、無効で 3 ステートしバスを解放。耐放射線・広電源。',
        usedIn: '宇宙/航空宇宙バス共用、3 ステート駆動、耐放射線信号バッファ。',
        desc: '耐放射線 1 ゲート 3 ステートバッファ（OE active-low・SEP）。SC シリーズ（SOT-23-5/SC70-5）。',
        specs: [
          { k: '機能', v: '3 ステートバスバッファ（OE active-low）' },
          { k: 'シリーズ', v: 'SC（耐放射線）' },
          { k: '耐放射線', v: 'SEP（シングルイベント防護・宇宙級）' },
          { k: 'パッケージ', v: 'SOT-23-5 / SC70-5' }
        ]
      },
      ko: {
        subcategory: '단일 게이트 3상태 버스 버퍼(OE active-low·내방사선 SEP)',
        whatIs: '단일 3상태 버스 버퍼(내방사선 SEP): OE 로우일 때 Y=A, 하이일 때 3상태. SC 시리즈·단일 이벤트 내성·우주급.',
        func: 'OE(active-low) 활성으로 A를 Y로 버퍼, 비활성으로 3상태화해 버스 개방. 내방사선·광전원.',
        usedIn: '우주/항공우주 버스 공유, 3상태 구동, 내방사선 신호 버퍼.',
        desc: '내방사선 단일 게이트 3상태 버퍼(OE active-low·SEP). SC 시리즈(SOT-23-5/SC70-5).',
        specs: [
          { k: '기능', v: '3상태 버스 버퍼(OE active-low)' },
          { k: '시리즈', v: 'SC(내방사선)' },
          { k: '내방사선', v: 'SEP(단일 이벤트 보호·우주급)' },
          { k: '패키지', v: 'SOT-23-5 / SC70-5' }
        ]
      }
    },
    'SN55LVRA4-SEP': {
      en: {
        subcategory: 'Quad high-speed differential (LVDS) receiver (radiation-tolerant SEP)',
        whatIs: 'Quad high-speed differential (LVDS) receiver: converts 4 pairs of LVDS differential inputs (nA/nB) into single-ended LVTTL outputs (nY). Two enable pins (one active-high, one active-low). Radiation-tolerant SEP, space-grade.',
        func: 'Each channel compares nA (non-inverting) and nB (inverting) differential voltages → nY LVTTL output; two enables, G (pin4, active-high) and G (pin12, active-low), jointly control output enable. Radiation-tolerant — for space high-speed data links.',
        usedIn: 'Space/aerospace LVDS high-speed data reception, backplane differential links, sensor differential-signal reception.',
        desc: 'Radiation-tolerant quad LVDS receiver (→LVTTL), dual enable, SEP (SOIC-16).',
        specs: [
          { k: 'Function', v: 'Quad LVDS receiver (→LVTTL)' },
          { k: 'Enable', v: 'dual enable G (active-high, pin4) + G (active-low, pin12)' },
          { k: 'Family', v: 'LVRA (radiation-tolerant)' },
          { k: 'Radiation', v: 'SEP (single-event protection, space-grade)' },
          { k: 'Package', v: 'SOIC-16 / CFP-16' }
        ]
      },
      ja: {
        subcategory: '4 チャネル高速差動（LVDS）レシーバ（耐放射線 SEP）',
        whatIs: '4 チャネル高速差動（LVDS）レシーバ：4 対の LVDS 差動入力（nA/nB）を LVTTL シングルエンド出力（nY）へ変換。2 つのイネーブルピン（1 つハイ有効、1 つロー有効）。耐放射線 SEP・宇宙級。',
        func: '各回路が nA（非反転）・nB（反転）の差動電圧を比較→nY に LVTTL 出力；2 つのイネーブル G（pin4 ハイ有効）と G（pin12 ロー有効）が共同で出力イネーブルを制御。耐放射線・宇宙の高速データリンク向け。',
        usedIn: '宇宙/航空宇宙 LVDS 高速データ受信、バックプレーン差動リンク、センサ差動信号受信。',
        desc: '耐放射線 4 チャネル LVDS レシーバ（→LVTTL）。デュアルイネーブル・SEP（SOIC-16）。',
        specs: [
          { k: '機能', v: '4 チャネル LVDS レシーバ（→LVTTL）' },
          { k: 'イネーブル', v: 'デュアルイネーブル G（ハイ有効,pin4）＋G（ロー有効,pin12）' },
          { k: 'シリーズ', v: 'LVRA（耐放射線）' },
          { k: '耐放射線', v: 'SEP（シングルイベント防護・宇宙級）' },
          { k: 'パッケージ', v: 'SOIC-16 / CFP-16' }
        ]
      },
      ko: {
        subcategory: '4채널 고속 차동(LVDS) 수신기(내방사선 SEP)',
        whatIs: '4채널 고속 차동(LVDS) 수신기: 4쌍의 LVDS 차동 입력(nA/nB)을 LVTTL 싱글엔드 출력(nY)으로 변환. 2개 인에이블 핀(하나는 하이 유효, 하나는 로우 유효). 내방사선 SEP·우주급.',
        func: '각 채널이 nA(비반전)·nB(반전) 차동 전압을 비교 → nY에 LVTTL 출력; 두 인에이블 G(pin4 하이 유효)와 G(pin12 로우 유효)가 공동으로 출력 인에이블 제어. 내방사선·우주 고속 데이터 링크용.',
        usedIn: '우주/항공우주 LVDS 고속 데이터 수신, 백플레인 차동 링크, 센서 차동 신호 수신.',
        desc: '내방사선 4채널 LVDS 수신기(→LVTTL). 듀얼 인에이블·SEP(SOIC-16).',
        specs: [
          { k: '기능', v: '4채널 LVDS 수신기(→LVTTL)' },
          { k: '인에이블', v: '듀얼 인에이블 G(하이 유효,pin4) + G(로우 유효,pin12)' },
          { k: '시리즈', v: 'LVRA(내방사선)' },
          { k: '내방사선', v: 'SEP(단일 이벤트 보호·우주급)' },
          { k: '패키지', v: 'SOIC-16 / CFP-16' }
        ]
      }
    }
  };
  Object.assign(window.IC_I18N, T);
})();
/* batch 5: entries 60-74 */
(function () {
  var T = {
    'ISOTMP35R': {
      en: {
        subcategory: 'Isolated analog temperature sensor (5kVRMS reinforced isolation)',
        whatIs: 'Isolated analog temperature sensor: measures temperature on the high-voltage side and carries it as an analog voltage (VOUT) to the low-voltage side across a 5kVRMS reinforced isolation barrier. ±2.0°C accuracy, no external isolator needed.',
        func: 'The high-side TSENSE pins (multiple tied together, placed close to the heat source) sense temperature; the value crosses the isolation barrier to the low side and becomes an analog VOUT (0.1–2.0V, ~10mV/°C). VDD powers the low side. For power-device/high-voltage-bus temperature sensing that also needs galvanic isolation.',
        usedIn: 'Power-module/IGBT/SiC junction temperature, motor/inverter high-side temperature, power-bus temperature, industrial sensing needing reinforced isolation.',
        desc: '5kVRMS reinforced-isolation analog temperature sensor, ±2.0°C, VOUT analog output, TSENSE against the heat source (Wide-body DFP-12).',
        specs: [
          { k: 'Function', v: 'Isolated analog temperature sensor' },
          { k: 'Isolation', v: '5kVRMS reinforced' },
          { k: 'Accuracy', v: '±2.0°C' },
          { k: 'Output', v: 'VOUT analog 0.1–2.0V (500mV offset at 0°C)' },
          { k: 'Sense pins', v: 'TSENSE ×6 tied together (against heat source)' },
          { k: 'Supply', v: 'single VDD (low side)' },
          { k: 'Package', v: 'Wide-body DFP-12' }
        ],
        dropIn: [{ note: 'Automotive version, same DFP-12 pinout (±2.5°C accuracy)' }]
      },
      ja: {
        subcategory: '絶縁アナログ温度センサ（5kVRMS 強化絶縁）',
        whatIs: '絶縁アナログ温度センサ：高圧側で温度を計測し、5kVRMS 強化絶縁バリアを跨いでアナログ電圧（VOUT）として低圧側へ伝送。±2.0°C 精度・外付け絶縁器不要。',
        func: '高圧側 TSENSE ピン（複数並列・熱源に近接）で温度を検出し、絶縁バリアを跨いで低圧側へ伝え VOUT アナログ電圧（0.1~2.0V、~10mV/°C）に変換。VDD は低圧側供給。パワー素子/高圧バスの温度計測で電気的絶縁も必要な場合に。',
        usedIn: 'パワーモジュール/IGBT/SiC 接合部温度、モータ/インバータ高圧側温度、電源バス温度、強化絶縁が必要な産業計測。',
        desc: '5kVRMS 強化絶縁アナログ温度センサ。±2.0°C・VOUT アナログ出力・TSENSE を熱源に接近（Wide-body DFP-12）。',
        specs: [
          { k: '機能', v: '絶縁アナログ温度センサ' },
          { k: '絶縁', v: '5kVRMS 強化（reinforced）' },
          { k: '精度', v: '±2.0°C' },
          { k: '出力', v: 'VOUT アナログ 0.1~2.0V（0°C オフセット 500mV）' },
          { k: '検出ピン', v: 'TSENSE ×6 並列（熱源に近接）' },
          { k: '電源', v: '単一 VDD（低圧側）' },
          { k: 'パッケージ', v: 'Wide-body DFP-12' }
        ],
        dropIn: [{ note: '車載版・同 DFP-12 ピン配置同一（精度 ±2.5°C）' }]
      },
      ko: {
        subcategory: '절연 아날로그 온도 센서(5kVRMS 강화 절연)',
        whatIs: '절연 아날로그 온도 센서: 고압 측에서 온도를 계측하고 5kVRMS 강화 절연 배리어를 넘어 아날로그 전압(VOUT)으로 저압 측에 전송. ±2.0°C 정확도·외장 절연기 불필요.',
        func: '고압 측 TSENSE 핀(여러 개 병렬·열원에 근접)으로 온도 감지, 절연 배리어를 넘어 저압 측에 전달해 VOUT 아날로그 전압(0.1~2.0V, ~10mV/°C)으로 변환. VDD는 저압 측 공급. 전력 소자/고압 버스 온도 계측에 전기 절연도 필요한 경우에.',
        usedIn: '전력 모듈/IGBT/SiC 접합부 온도, 모터/인버터 고압 측 온도, 전원 버스 온도, 강화 절연이 필요한 산업 계측.',
        desc: '5kVRMS 강화 절연 아날로그 온도 센서. ±2.0°C·VOUT 아날로그 출력·TSENSE를 열원에 근접(Wide-body DFP-12).',
        specs: [
          { k: '기능', v: '절연 아날로그 온도 센서' },
          { k: '절연', v: '5kVRMS 강화(reinforced)' },
          { k: '정확도', v: '±2.0°C' },
          { k: '출력', v: 'VOUT 아날로그 0.1~2.0V(0°C 오프셋 500mV)' },
          { k: '감지 핀', v: 'TSENSE ×6 병렬(열원에 근접)' },
          { k: '전원', v: '단일 VDD(저압 측)' },
          { k: '패키지', v: 'Wide-body DFP-12' }
        ],
        dropIn: [{ note: '차량용 버전·동일 DFP-12 핀 배치(정확도 ±2.5°C)' }]
      }
    },
    'ISOTMP35R-Q1': {
      en: {
        subcategory: 'Isolated analog temperature sensor (5kVRMS reinforced isolation, automotive)',
        whatIs: 'Isolated analog temperature sensor (automotive Q1): ±2.5°C, 5kVRMS reinforced isolation; senses temperature on the high side and sends analog VOUT across the barrier to the low side. Same pinout as ISOTMP35R plus automotive qualification.',
        func: 'Same as ISOTMP35R: TSENSE high-side sensing, VOUT analog output across isolation. AEC-Q100 automotive.',
        usedIn: 'Automotive power-module/SiC/IGBT junction temperature, EV inverter high-side temperature, in-vehicle high-voltage-bus temperature.',
        desc: 'Automotive 5kVRMS reinforced-isolation analog temperature sensor, ±2.5°C, VOUT analog (same pinout as ISOTMP35R, DFP-12).',
        specs: [
          { k: 'Function', v: 'Isolated analog temperature sensor (automotive)' },
          { k: 'Isolation', v: '5kVRMS reinforced' },
          { k: 'Accuracy', v: '±2.5°C' },
          { k: 'Output', v: 'VOUT analog' },
          { k: 'Qualification', v: 'Automotive AEC-Q100 (Q1)' },
          { k: 'Sense pins', v: 'TSENSE ×6 tied together' },
          { k: 'Package', v: 'Wide-body DFP-12' }
        ],
        dropIn: [{ note: 'Non-automotive version, same DFP-12 pinout (±2.0°C accuracy)' }]
      },
      ja: {
        subcategory: '絶縁アナログ温度センサ（5kVRMS 強化絶縁・車載）',
        whatIs: '絶縁アナログ温度センサ（車載 Q1）：±2.5°C・5kVRMS 強化絶縁、高圧側で計測し VOUT アナログをバリア越しに低圧側へ。ISOTMP35R とピン互換＋車載認証。',
        func: 'ISOTMP35R と同じ：TSENSE 高圧側検出、絶縁を跨ぐ VOUT アナログ出力。車載 AEC-Q100。',
        usedIn: '車載パワーモジュール/SiC/IGBT 接合部温度、EV インバータ高圧側温度、車載高圧バス温度。',
        desc: '車載 5kVRMS 強化絶縁アナログ温度センサ。±2.5°C・VOUT アナログ（ISOTMP35R とピン互換、DFP-12）。',
        specs: [
          { k: '機能', v: '絶縁アナログ温度センサ（車載）' },
          { k: '絶縁', v: '5kVRMS 強化' },
          { k: '精度', v: '±2.5°C' },
          { k: '出力', v: 'VOUT アナログ' },
          { k: '認証', v: '車載 AEC-Q100 (Q1)' },
          { k: '検出ピン', v: 'TSENSE ×6 並列' },
          { k: 'パッケージ', v: 'Wide-body DFP-12' }
        ],
        dropIn: [{ note: '非車載版・同 DFP-12 ピン配置同一（精度 ±2.0°C）' }]
      },
      ko: {
        subcategory: '절연 아날로그 온도 센서(5kVRMS 강화 절연·차량용)',
        whatIs: '절연 아날로그 온도 센서(차량용 Q1): ±2.5°C·5kVRMS 강화 절연, 고압 측에서 계측해 VOUT 아날로그를 배리어 너머 저압 측으로. ISOTMP35R과 핀 호환+차량 인증.',
        func: 'ISOTMP35R과 동일: TSENSE 고압 측 감지, 절연을 넘는 VOUT 아날로그 출력. 차량용 AEC-Q100.',
        usedIn: '차량 전력 모듈/SiC/IGBT 접합부 온도, EV 인버터 고압 측 온도, 차량 고압 버스 온도.',
        desc: '차량용 5kVRMS 강화 절연 아날로그 온도 센서. ±2.5°C·VOUT 아날로그(ISOTMP35R과 핀 호환, DFP-12).',
        specs: [
          { k: '기능', v: '절연 아날로그 온도 센서(차량용)' },
          { k: '절연', v: '5kVRMS 강화' },
          { k: '정확도', v: '±2.5°C' },
          { k: '출력', v: 'VOUT 아날로그' },
          { k: '인증', v: '차량용 AEC-Q100 (Q1)' },
          { k: '감지 핀', v: 'TSENSE ×6 병렬' },
          { k: '패키지', v: 'Wide-body DFP-12' }
        ],
        dropIn: [{ note: '비차량용 버전·동일 DFP-12 핀 배치(정확도 ±2.0°C)' }]
      }
    },
    'LM50HV': {
      en: {
        subcategory: 'Analog Celsius temperature sensor (10mV/°C)',
        whatIs: 'Industry-standard analog Celsius temperature sensor: output voltage is linearly proportional to Celsius temperature (10mV/°C) with a negative-temperature offset; a single 3-pin part measures −40 to 125°C with no calibration.',
        func: 'VO = 10mV/°C × T + 500mV offset (measures negative temperatures without a negative supply). Single-supply, low power, connects directly to an ADC. The HV version tolerates a higher supply.',
        usedIn: 'Electronics ambient/board temperature monitoring, battery temperature, appliance/HVAC sensing, over-temperature protection front end.',
        desc: 'Analog Celsius temperature sensor 10mV/°C, single-supply, offset for negative temperatures (SOT-23-3 / TO-92).',
        specs: [
          { k: 'Function', v: 'Analog Celsius temperature sensor' },
          { k: 'Slope', v: '10 mV/°C' },
          { k: 'Offset', v: '500mV @ 0°C (measures negative temps)' },
          { k: 'Supply', v: 'single supply (HV version higher)' },
          { k: 'Package', v: 'SOT-23-3 / TO-92' }
        ],
        dropIn: [{ note: 'Automotive version, same SOT-23-3 pinout' }]
      },
      ja: {
        subcategory: 'アナログ摂氏温度センサ（10mV/°C）',
        whatIs: '業界標準アナログ摂氏温度センサ：出力電圧が摂氏温度に線形比例（10mV/°C）、負温オフセット付き、3 ピン単体で校正不要に −40~125°C を計測。',
        func: 'VO = 10mV/°C × T + 500mV オフセット（負電源なしで負温計測可）。単電源・低消費電力で ADC に直結。HV 版はより高い電源に対応。',
        usedIn: '電子機器の環境/基板温度監視、電池温度、家電/HVAC 計測、過熱保護フロントエンド。',
        desc: 'アナログ摂氏温度センサ 10mV/°C。単電源・オフセット付で負温計測可（SOT-23-3 / TO-92）。',
        specs: [
          { k: '機能', v: 'アナログ摂氏温度センサ' },
          { k: '傾き', v: '10 mV/°C' },
          { k: 'オフセット', v: '500mV @ 0°C（負温計測可）' },
          { k: '電源', v: '単電源（HV 版はより高い）' },
          { k: 'パッケージ', v: 'SOT-23-3 / TO-92' }
        ],
        dropIn: [{ note: '車載版・同 SOT-23-3 ピン配置同一' }]
      },
      ko: {
        subcategory: '아날로그 섭씨 온도 센서(10mV/°C)',
        whatIs: '업계 표준 아날로그 섭씨 온도 센서: 출력 전압이 섭씨 온도에 선형 비례(10mV/°C), 음온 오프셋 포함, 3핀 단일로 교정 없이 −40~125°C 계측.',
        func: 'VO = 10mV/°C × T + 500mV 오프셋(음전원 없이 음온 계측 가능). 단일 전원·저전력으로 ADC에 직결. HV판은 더 높은 전원 대응.',
        usedIn: '전자기기 환경/보드 온도 감시, 배터리 온도, 가전/HVAC 계측, 과열 보호 프론트엔드.',
        desc: '아날로그 섭씨 온도 센서 10mV/°C. 단일 전원·오프셋 포함으로 음온 계측 가능(SOT-23-3 / TO-92).',
        specs: [
          { k: '기능', v: '아날로그 섭씨 온도 센서' },
          { k: '기울기', v: '10 mV/°C' },
          { k: '오프셋', v: '500mV @ 0°C(음온 계측 가능)' },
          { k: '전원', v: '단일 전원(HV판은 더 높음)' },
          { k: '패키지', v: 'SOT-23-3 / TO-92' }
        ],
        dropIn: [{ note: '차량용 버전·동일 SOT-23-3 핀 배치' }]
      }
    },
    'LM50HV-Q1': {
      en: {
        subcategory: 'Analog Celsius temperature sensor (10mV/°C, automotive)',
        whatIs: 'Industry-standard analog Celsius temperature sensor (automotive Grade 0/1): 10mV/°C linear output with offset for negative temperatures. Same pinout as LM50HV plus automotive qualification.',
        func: 'Same as LM50HV: VO = 10mV/°C × T + 500mV offset, single-supply, connects directly to an ADC. AEC-Q100 automotive.',
        usedIn: 'Automotive ambient/board temperature monitoring, battery/powertrain temperature, in-vehicle over-temperature protection.',
        desc: 'Automotive analog Celsius temperature sensor 10mV/°C, single-supply, with offset (same pinout as LM50HV, SOT-23-3).',
        specs: [
          { k: 'Function', v: 'Analog Celsius temperature sensor (automotive)' },
          { k: 'Slope', v: '10 mV/°C' },
          { k: 'Offset', v: '500mV @ 0°C' },
          { k: 'Qualification', v: 'Automotive AEC-Q100 (Grade 0/1)' },
          { k: 'Package', v: 'SOT-23-3' }
        ],
        dropIn: [{ note: 'Non-automotive version, same SOT-23-3 pinout' }]
      },
      ja: {
        subcategory: 'アナログ摂氏温度センサ（10mV/°C・車載）',
        whatIs: '業界標準アナログ摂氏温度センサ（車載 Grade 0/1）：10mV/°C 線形出力、負温オフセット付。LM50HV とピン互換＋車載認証。',
        func: 'LM50HV と同じ：VO = 10mV/°C × T + 500mV オフセット、単電源で ADC に直結。車載 AEC-Q100。',
        usedIn: '車載環境/基板温度監視、電池/パワートレイン温度、車載過熱保護。',
        desc: '車載アナログ摂氏温度センサ 10mV/°C。単電源・オフセット付（LM50HV とピン互換、SOT-23-3）。',
        specs: [
          { k: '機能', v: 'アナログ摂氏温度センサ（車載）' },
          { k: '傾き', v: '10 mV/°C' },
          { k: 'オフセット', v: '500mV @ 0°C' },
          { k: '認証', v: '車載 AEC-Q100（Grade 0/1）' },
          { k: 'パッケージ', v: 'SOT-23-3' }
        ],
        dropIn: [{ note: '非車載版・同 SOT-23-3 ピン配置同一' }]
      },
      ko: {
        subcategory: '아날로그 섭씨 온도 센서(10mV/°C·차량용)',
        whatIs: '업계 표준 아날로그 섭씨 온도 센서(차량용 Grade 0/1): 10mV/°C 선형 출력, 음온 오프셋 포함. LM50HV와 핀 호환+차량 인증.',
        func: 'LM50HV와 동일: VO = 10mV/°C × T + 500mV 오프셋, 단일 전원으로 ADC 직결. 차량용 AEC-Q100.',
        usedIn: '차량 환경/보드 온도 감시, 배터리/파워트레인 온도, 차량 과열 보호.',
        desc: '차량용 아날로그 섭씨 온도 센서 10mV/°C. 단일 전원·오프셋 포함(LM50HV와 핀 호환, SOT-23-3).',
        specs: [
          { k: '기능', v: '아날로그 섭씨 온도 센서(차량용)' },
          { k: '기울기', v: '10 mV/°C' },
          { k: '오프셋', v: '500mV @ 0°C' },
          { k: '인증', v: '차량용 AEC-Q100(Grade 0/1)' },
          { k: '패키지', v: 'SOT-23-3' }
        ],
        dropIn: [{ note: '비차량용 버전·동일 SOT-23-3 핀 배치' }]
      }
    },
    'TMAG5134': {
      en: {
        subcategory: 'High-sensitivity in-plane Hall switch (with flux concentrator)',
        whatIs: 'High-sensitivity in-plane Hall-effect magnetic switch: detects magnetic fields parallel to the package surface and toggles a digital output above threshold. A built-in flux concentrator boosts sensitivity. For position/proximity/switch detection.',
        func: 'Senses in-plane flux density: turns on above B_OP, off below B_RP (with hysteresis). The SOT-23 version is an omnipolar single output OUT (responds to both polarities); the X1LGA version has OUT1 (positive field) / OUT2 (negative field) dual-unipolar outputs. Low power.',
        usedIn: 'BLDC motor commutation/position, knob/gear-position detection, lid switch/proximity detection, flow meters, safety interlocks.',
        desc: 'High-sensitivity in-plane Hall switch (with flux concentrator), omnipolar or dual-unipolar output, low power (SOT-23-3 / X1LGA-4).',
        specs: [
          { k: 'Function', v: 'In-plane Hall magnetic switch (with flux concentrator)' },
          { k: 'Output', v: 'SOT-23: omnipolar OUT; X1LGA: OUT1(pos)/OUT2(neg) dual-unipolar' },
          { k: 'Sensitivity', v: 'high sensitivity (thresholds per datasheet)' },
          { k: 'Power', v: 'low power' },
          { k: 'Package', v: 'SOT-23-3 / X1LGA-4' }
        ]
      },
      ja: {
        subcategory: '高感度面内ホールスイッチ（磁束集中器付）',
        whatIs: '高感度「面内（in-plane）」ホール効果磁気スイッチ：パッケージ表面に平行な磁界を検出し、しきい値超えでデジタル出力を反転。磁束集中器内蔵で感度向上。位置/近接/スイッチ検出に。',
        func: '面内の磁束密度を検出、B_OP 超えでオン・B_RP 未満でオフ（ヒステリシス付）。SOT-23 版はオムニポーラ単出力 OUT（正負磁界とも反応）；X1LGA 版は OUT1（正磁界）/OUT2（負磁界）のデュアルユニポーラ出力。低消費電力。',
        usedIn: 'ブラシレスモータ転流/位置、ノブ/ギヤ位置検出、蓋スイッチ/近接検出、流量計、安全インターロック。',
        desc: '高感度面内ホールスイッチ（磁束集中器付）。オムニポーラまたはデュアルユニポーラ出力・低消費電力（SOT-23-3 / X1LGA-4）。',
        specs: [
          { k: '機能', v: '面内（in-plane）ホール磁気スイッチ（磁束集中器付）' },
          { k: '出力', v: 'SOT-23：オムニポーラ OUT；X1LGA：OUT1(正)/OUT2(負) デュアルユニポーラ' },
          { k: '感度', v: '高感度（しきい値は datasheet 参照）' },
          { k: '消費電力', v: '低消費電力' },
          { k: 'パッケージ', v: 'SOT-23-3 / X1LGA-4' }
        ]
      },
      ko: {
        subcategory: '고감도 평면 홀 스위치(자속 집중기 포함)',
        whatIs: '고감도 "평면(in-plane)" 홀 효과 자기 스위치: 패키지 표면에 평행한 자기장을 감지, 문턱 초과 시 디지털 출력 반전. 자속 집중기 내장으로 감도 향상. 위치/근접/스위치 감지용.',
        func: '평면 자속 밀도를 감지, B_OP 초과 시 온·B_RP 미만 시 오프(히스테리시스 포함). SOT-23판은 옴니폴라 단일 출력 OUT(양·음 자기장 모두 반응); X1LGA판은 OUT1(양 자기장)/OUT2(음 자기장) 듀얼 유니폴라 출력. 저전력.',
        usedIn: '브러시리스 모터 전환/위치, 노브/기어 위치 감지, 뚜껑 스위치/근접 감지, 유량계, 안전 인터록.',
        desc: '고감도 평면 홀 스위치(자속 집중기 포함). 옴니폴라 또는 듀얼 유니폴라 출력·저전력(SOT-23-3 / X1LGA-4).',
        specs: [
          { k: '기능', v: '평면(in-plane) 홀 자기 스위치(자속 집중기 포함)' },
          { k: '출력', v: 'SOT-23: 옴니폴라 OUT; X1LGA: OUT1(양)/OUT2(음) 듀얼 유니폴라' },
          { k: '감도', v: '고감도(문턱값은 datasheet 참조)' },
          { k: '전력', v: '저전력' },
          { k: '패키지', v: 'SOT-23-3 / X1LGA-4' }
        ]
      }
    },
    'TMAG5230': {
      en: {
        subcategory: 'Low-power Z-axis Hall switch (WCSP)',
        whatIs: 'Low-power Z-axis (perpendicular-to-package) Hall-effect magnetic switch: detects fields perpendicular to the package and toggles the output above threshold. Tiny WCSP package, low power, for proximity/switch detection.',
        func: 'Senses Z-axis flux density: on above B_OP, off below B_RP (hysteresis). Omnipolar version has single output OUT; dual-unipolar version has OUT1(positive)/OUT2(negative). Low power, suited to battery products.',
        usedIn: 'Portable/wearable lid switches, proximity detection, buttons/knobs, magnetic sensing in battery products.',
        desc: 'Low-power Z-axis Hall magnetic switch, omnipolar or dual-unipolar output, tiny WCSP (DSBGA-4).',
        specs: [
          { k: 'Function', v: 'Z-axis Hall magnetic switch (low power)' },
          { k: 'Output', v: 'Omnipolar OUT; or Dual-Unipolar OUT1(pos)/OUT2(neg)' },
          { k: 'Sense axis', v: 'Z-axis (perpendicular to package)' },
          { k: 'Power', v: 'low power (battery-friendly)' },
          { k: 'Package', v: 'DSBGA-4 (WCSP); balls A1/A2/B1/B2' }
        ]
      },
      ja: {
        subcategory: '低消費電力 Z 軸ホールスイッチ（WCSP）',
        whatIs: '低消費電力「Z 軸（パッケージ面に垂直）」ホール効果磁気スイッチ：パッケージに垂直な磁界を検出し、しきい値超えで出力を反転。極小 WCSP・低消費電力、近接/スイッチ検出に。',
        func: 'Z 軸磁束密度を検出、B_OP 超えでオン・B_RP 未満でオフ（ヒステリシス）。オムニポーラ版は単出力 OUT；デュアルユニポーラ版は OUT1(正)/OUT2(負)。低消費電力でバッテリ製品向け。',
        usedIn: 'ポータブル/ウェアラブルの蓋スイッチ、近接検出、ボタン/ノブ、バッテリ製品の磁気検出。',
        desc: '低消費電力 Z 軸ホール磁気スイッチ。オムニポーラまたはデュアルユニポーラ出力・極小 WCSP（DSBGA-4）。',
        specs: [
          { k: '機能', v: 'Z 軸ホール磁気スイッチ（低消費電力）' },
          { k: '出力', v: 'オムニポーラ OUT；またはデュアルユニポーラ OUT1(正)/OUT2(負)' },
          { k: '検出軸', v: 'Z 軸（パッケージ面に垂直）' },
          { k: '消費電力', v: '低消費電力（バッテリ向き）' },
          { k: 'パッケージ', v: 'DSBGA-4 (WCSP)；ボール A1/A2/B1/B2' }
        ]
      },
      ko: {
        subcategory: '저전력 Z축 홀 스위치(WCSP)',
        whatIs: '저전력 "Z축(패키지면에 수직)" 홀 효과 자기 스위치: 패키지에 수직인 자기장을 감지, 문턱 초과 시 출력 반전. 초소형 WCSP·저전력, 근접/스위치 감지용.',
        func: 'Z축 자속 밀도를 감지, B_OP 초과 시 온·B_RP 미만 시 오프(히스테리시스). 옴니폴라판은 단일 출력 OUT; 듀얼 유니폴라판은 OUT1(양)/OUT2(음). 저전력으로 배터리 제품용.',
        usedIn: '휴대/웨어러블 뚜껑 스위치, 근접 감지, 버튼/노브, 배터리 제품 자기 감지.',
        desc: '저전력 Z축 홀 자기 스위치. 옴니폴라 또는 듀얼 유니폴라 출력·초소형 WCSP(DSBGA-4).',
        specs: [
          { k: '기능', v: 'Z축 홀 자기 스위치(저전력)' },
          { k: '출력', v: '옴니폴라 OUT; 또는 듀얼 유니폴라 OUT1(양)/OUT2(음)' },
          { k: '감지 축', v: 'Z축(패키지면에 수직)' },
          { k: '전력', v: '저전력(배터리 친화)' },
          { k: '패키지', v: 'DSBGA-4 (WCSP); 볼 A1/A2/B1/B2' }
        ]
      }
    },
    'AMC0206M25': {
      en: {
        subcategory: 'Isolated ΔΣ modulator (±250mV input)',
        whatIs: 'Isolated Delta-Sigma modulator: measures a small ±250mV analog signal on the high-voltage side, converts it into a bitstream (DOUT) sent across the isolation barrier to the low-voltage side, decoded by a sinc filter in the MCU/FPGA. For isolated current/voltage measurement.',
        func: 'High-side INP/INN differential input (±250mV, for shunt-based current sensing) is ΔΣ-modulated into a 1-bit stream DOUT across the capacitive isolation barrier; CLKIN provides the modulation clock. AVDD/AGND on the high side, DVDD/DGND on the low side.',
        usedIn: 'Motor/inverter phase-current isolated measurement (shunt), isolated voltage measurement, solar/UPS current sensing, power feedback.',
        desc: 'Isolated ΔΣ modulator, ±250mV input, external CLKIN clock, bitstream DOUT (wide-body SOIC-8).',
        specs: [
          { k: 'Function', v: 'Isolated ΔΣ modulator' },
          { k: 'Input range', v: '±250mV (differential)' },
          { k: 'Clock', v: 'CLKIN external clock input' },
          { k: 'Output', v: 'DOUT bitstream (needs external sinc filter)' },
          { k: 'Supply', v: 'AVDD (high side) + DVDD (low side)' },
          { k: 'Package', v: 'wide-body SOIC-8 (isolated)' }
        ],
        dropIn: [
          { note: 'Automotive version, same SOIC-8 pinout' },
          { note: 'Same pinout; ±50mV input range (not ±250mV) — verify the range' }
        ]
      },
      ja: {
        subcategory: '絶縁 ΔΣ モジュレータ（±250mV 入力）',
        whatIs: '絶縁 Delta-Sigma モジュレータ：高圧側で ±250mV の小アナログ信号を計測し、ビットストリーム（DOUT）に変換して絶縁バリア越しに低圧側へ送り、MCU/FPGA の sinc フィルタで復元。絶縁式の電流/電圧計測に。',
        func: '高圧側 INP/INN 差動入力（±250mV、シャント抵抗で電流計測）を内部で ΔΣ 変調し 1-bit データストリーム DOUT にして容量性絶縁バリアを跨ぐ；CLKIN が変調クロックを供給。AVDD/AGND 高圧側、DVDD/DGND 低圧側。',
        usedIn: 'モータ/インバータ相電流絶縁計測（シャント）、絶縁電圧計測、太陽光/UPS 電流検出、電源帰還。',
        desc: '絶縁 ΔΣ モジュレータ。±250mV 入力・外部クロック CLKIN・ビットストリーム DOUT（SOIC-8 ワイドボディ）。',
        specs: [
          { k: '機能', v: '絶縁 ΔΣ モジュレータ' },
          { k: '入力範囲', v: '±250mV（差動）' },
          { k: 'クロック', v: 'CLKIN 外部クロック入力' },
          { k: '出力', v: 'DOUT ビットストリーム（外部 sinc フィルタ必要）' },
          { k: '電源', v: 'AVDD（高圧側）＋DVDD（低圧側）' },
          { k: 'パッケージ', v: 'SOIC-8 ワイドボディ（絶縁）' }
        ],
        dropIn: [
          { note: '車載版・同 SOIC-8 ピン配置同一' },
          { note: '同ピン配置；入力範囲 ±50mV（±250mV ではない）、量程を確認' }
        ]
      },
      ko: {
        subcategory: '절연 ΔΣ 모듈레이터(±250mV 입력)',
        whatIs: '절연 Delta-Sigma 모듈레이터: 고압 측에서 ±250mV 소 아날로그 신호를 계측해 비트스트림(DOUT)으로 변환, 절연 배리어 너머 저압 측으로 보내고 MCU/FPGA의 sinc 필터로 복원. 절연식 전류/전압 계측용.',
        func: '고압 측 INP/INN 차동 입력(±250mV, 션트 저항으로 전류 계측)을 내부에서 ΔΣ 변조해 1-bit 데이터 스트림 DOUT으로 만들어 용량성 절연 배리어를 넘음; CLKIN이 변조 클록 공급. AVDD/AGND 고압 측, DVDD/DGND 저압 측.',
        usedIn: '모터/인버터 상전류 절연 계측(션트), 절연 전압 계측, 태양광/UPS 전류 검출, 전원 피드백.',
        desc: '절연 ΔΣ 모듈레이터. ±250mV 입력·외부 클록 CLKIN·비트스트림 DOUT(SOIC-8 와이드바디).',
        specs: [
          { k: '기능', v: '절연 ΔΣ 모듈레이터' },
          { k: '입력 범위', v: '±250mV(차동)' },
          { k: '클록', v: 'CLKIN 외부 클록 입력' },
          { k: '출력', v: 'DOUT 비트스트림(외부 sinc 필터 필요)' },
          { k: '전원', v: 'AVDD(고압 측) + DVDD(저압 측)' },
          { k: '패키지', v: 'SOIC-8 와이드바디(절연)' }
        ],
        dropIn: [
          { note: '차량용 버전·동일 SOIC-8 핀 배치' },
          { note: '동일 핀 배치; 입력 범위 ±50mV(±250mV 아님), 측정 범위 확인' }
        ]
      }
    },
    'AMC0206M25-Q1': {
      en: {
        subcategory: 'Isolated ΔΣ modulator (±250mV input, automotive)',
        whatIs: 'Isolated ΔΣ modulator (automotive Q1): ±250mV input, external clock, bitstream output. Same pinout as AMC0206M25 plus automotive qualification.',
        func: 'Same as AMC0206M25: high-side ±250mV differential input ΔΣ-modulated into a DOUT bitstream across isolation, CLKIN external clock. AEC-Q100 automotive.',
        usedIn: 'Automotive motor/inverter phase-current isolated measurement, EV power feedback, in-vehicle isolated voltage/current sensing.',
        desc: 'Automotive isolated ΔΣ modulator, ±250mV, CLKIN, DOUT bitstream (same pinout as AMC0206M25, wide-body SOIC-8).',
        specs: [
          { k: 'Function', v: 'Isolated ΔΣ modulator (automotive)' },
          { k: 'Input range', v: '±250mV' },
          { k: 'Clock', v: 'CLKIN external' },
          { k: 'Output', v: 'DOUT bitstream' },
          { k: 'Qualification', v: 'Automotive AEC-Q100 (Q1)' },
          { k: 'Package', v: 'wide-body SOIC-8 (isolated)' }
        ],
        dropIn: [{ note: 'Non-automotive version, same SOIC-8 pinout' }]
      },
      ja: {
        subcategory: '絶縁 ΔΣ モジュレータ（±250mV 入力・車載）',
        whatIs: '絶縁 ΔΣ モジュレータ（車載 Q1）：±250mV 入力・外部クロック・ビットストリーム出力。AMC0206M25 とピン互換＋車載認証。',
        func: 'AMC0206M25 と同じ：高圧側 ±250mV 差動入力を ΔΣ 変調し DOUT ビットストリームで絶縁越しに出力、CLKIN 外部クロック。車載 AEC-Q100。',
        usedIn: '車載モータ/インバータ相電流絶縁計測、EV 電源帰還、車載絶縁電圧/電流検出。',
        desc: '車載絶縁 ΔΣ モジュレータ。±250mV・CLKIN・DOUT ビットストリーム（AMC0206M25 とピン互換、SOIC-8 ワイドボディ）。',
        specs: [
          { k: '機能', v: '絶縁 ΔΣ モジュレータ（車載）' },
          { k: '入力範囲', v: '±250mV' },
          { k: 'クロック', v: 'CLKIN 外部' },
          { k: '出力', v: 'DOUT ビットストリーム' },
          { k: '認証', v: '車載 AEC-Q100 (Q1)' },
          { k: 'パッケージ', v: 'SOIC-8 ワイドボディ（絶縁）' }
        ],
        dropIn: [{ note: '非車載版・同 SOIC-8 ピン配置同一' }]
      },
      ko: {
        subcategory: '절연 ΔΣ 모듈레이터(±250mV 입력·차량용)',
        whatIs: '절연 ΔΣ 모듈레이터(차량용 Q1): ±250mV 입력·외부 클록·비트스트림 출력. AMC0206M25와 핀 호환+차량 인증.',
        func: 'AMC0206M25와 동일: 고압 측 ±250mV 차동 입력을 ΔΣ 변조해 DOUT 비트스트림으로 절연 너머 출력, CLKIN 외부 클록. 차량용 AEC-Q100.',
        usedIn: '차량 모터/인버터 상전류 절연 계측, EV 전원 피드백, 차량 절연 전압/전류 검출.',
        desc: '차량용 절연 ΔΣ 모듈레이터. ±250mV·CLKIN·DOUT 비트스트림(AMC0206M25와 핀 호환, SOIC-8 와이드바디).',
        specs: [
          { k: '기능', v: '절연 ΔΣ 모듈레이터(차량용)' },
          { k: '입력 범위', v: '±250mV' },
          { k: '클록', v: 'CLKIN 외부' },
          { k: '출력', v: 'DOUT 비트스트림' },
          { k: '인증', v: '차량용 AEC-Q100 (Q1)' },
          { k: '패키지', v: 'SOIC-8 와이드바디(절연)' }
        ],
        dropIn: [{ note: '비차량용 버전·동일 SOIC-8 핀 배치' }]
      }
    },
    'AMC0303M2510': {
      en: {
        subcategory: 'Isolated ΔΣ modulator (±250mV, internal clock CLKOUT)',
        whatIs: 'Isolated Delta-Sigma modulator: ±250mV input, built-in oscillator that drives the clock out on CLKOUT (no external clock needed). Measures a small high-side signal and sends the bitstream across isolation.',
        func: 'High-side INP/INN ±250mV differential input is ΔΣ-modulated into DOUT; an internal clock is output on CLKOUT for downstream sync (unlike the M25’s external CLKIN). AVDD/AGND high side, DVDD/DGND low side.',
        usedIn: 'Motor/inverter phase-current isolated measurement, isolated voltage measurement, power feedback, isolated front ends needing an internal clock.',
        desc: 'Isolated ΔΣ modulator, ±250mV, internal-clock CLKOUT output, bitstream DOUT (wide-body SOIC-8).',
        specs: [
          { k: 'Function', v: 'Isolated ΔΣ modulator (internal clock)' },
          { k: 'Input range', v: '±250mV' },
          { k: 'Clock', v: 'CLKOUT internal clock output' },
          { k: 'Output', v: 'DOUT bitstream' },
          { k: 'Supply', v: 'AVDD (high side) + DVDD (low side)' },
          { k: 'Package', v: 'wide-body SOIC-8 (isolated)' }
        ],
        dropIn: [{ note: 'Same pinout; ±50mV input range (not ±250mV) — verify the range' }]
      },
      ja: {
        subcategory: '絶縁 ΔΣ モジュレータ（±250mV・内部クロック CLKOUT）',
        whatIs: '絶縁 Delta-Sigma モジュレータ：±250mV 入力、内蔵発振器を持ち CLKOUT からクロックを出力（外部クロック不要）。高圧側の小信号を計測しビットストリームで絶縁越しに送出。',
        func: '高圧側 INP/INN ±250mV 差動入力を ΔΣ 変調し DOUT に；内部でクロックを生成し CLKOUT から出力して下流同期に供給（M25 の CLKIN 外部クロックと異なる）。AVDD/AGND 高圧側、DVDD/DGND 低圧側。',
        usedIn: 'モータ/インバータ相電流絶縁計測、絶縁電圧計測、電源帰還、内部クロックが必要な絶縁フロントエンド。',
        desc: '絶縁 ΔΣ モジュレータ。±250mV・内部クロック CLKOUT 出力・ビットストリーム DOUT（SOIC-8 ワイドボディ）。',
        specs: [
          { k: '機能', v: '絶縁 ΔΣ モジュレータ（内部クロック）' },
          { k: '入力範囲', v: '±250mV' },
          { k: 'クロック', v: 'CLKOUT 内部クロック出力' },
          { k: '出力', v: 'DOUT ビットストリーム' },
          { k: '電源', v: 'AVDD（高圧側）＋DVDD（低圧側）' },
          { k: 'パッケージ', v: 'SOIC-8 ワイドボディ（絶縁）' }
        ],
        dropIn: [{ note: '同ピン配置；入力範囲 ±50mV（±250mV ではない）、量程を確認' }]
      },
      ko: {
        subcategory: '절연 ΔΣ 모듈레이터(±250mV·내부 클록 CLKOUT)',
        whatIs: '절연 Delta-Sigma 모듈레이터: ±250mV 입력, 내장 발진기를 갖고 CLKOUT으로 클록 출력(외부 클록 불필요). 고압 측 소신호를 계측해 비트스트림으로 절연 너머 송출.',
        func: '고압 측 INP/INN ±250mV 차동 입력을 ΔΣ 변조해 DOUT으로; 내부에서 클록을 생성해 CLKOUT으로 출력해 하류 동기에 공급(M25의 CLKIN 외부 클록과 다름). AVDD/AGND 고압 측, DVDD/DGND 저압 측.',
        usedIn: '모터/인버터 상전류 절연 계측, 절연 전압 계측, 전원 피드백, 내부 클록이 필요한 절연 프론트엔드.',
        desc: '절연 ΔΣ 모듈레이터. ±250mV·내부 클록 CLKOUT 출력·비트스트림 DOUT(SOIC-8 와이드바디).',
        specs: [
          { k: '기능', v: '절연 ΔΣ 모듈레이터(내부 클록)' },
          { k: '입력 범위', v: '±250mV' },
          { k: '클록', v: 'CLKOUT 내부 클록 출력' },
          { k: '출력', v: 'DOUT 비트스트림' },
          { k: '전원', v: 'AVDD(고압 측) + DVDD(저압 측)' },
          { k: '패키지', v: 'SOIC-8 와이드바디(절연)' }
        ],
        dropIn: [{ note: '동일 핀 배치; 입력 범위 ±50mV(±250mV 아님), 측정 범위 확인' }]
      }
    },
    'ISOS510-SP': {
      en: {
        subcategory: 'Current-driven analog isolator (optocoupler-style, radiation-hardened)',
        whatIs: 'Current-driven analog isolator (solid-state optocoupler replacement): current through the input diode (AN/CAT) controls the output transistor (COL/EM) across the isolation barrier, passing analog/digital signals. Radiation-hardened (SP), space-grade.',
        func: 'Current flows through the input diode AN→CAT, crosses the isolation, and controls conduction of the output transistor (collector COL / emitter EM); the current transfer ratio (CTR) sets the gain. Equivalent to an optocoupler but radiation-hardened with no LED aging.',
        usedIn: 'Space/aerospace signal isolation, isolated feedback, relay replacement, radiation-hardened digital/analog isolation.',
        desc: 'Radiation-hardened current-driven analog isolator (optocoupler-style), diode input / transistor output (4-pin).',
        specs: [
          { k: 'Function', v: 'Current-driven analog isolator (optocoupler-style)' },
          { k: 'Input', v: 'diode AN/CAT' },
          { k: 'Output', v: 'transistor COL/EM' },
          { k: 'Radiation', v: 'SP (rad-hard, space-grade)' },
          { k: 'CTR', v: 'current transfer ratio (value per datasheet)' },
          { k: 'Package', v: '4-pin' }
        ]
      },
      ja: {
        subcategory: '電流駆動アナログアイソレータ（フォトカプラ式・耐放射線）',
        whatIs: '電流駆動アナログアイソレータ（固体フォトカプラ代替）：入力ダイオード（AN/CAT）に電流を流すと、絶縁バリアを跨いで出力トランジスタ（COL/EM）の導通を制御し、アナログ/デジタル信号を伝達。耐放射線（SP）・宇宙級。',
        func: '入力ダイオード AN→CAT に電流を流すと絶縁を跨いで出力トランジスタ（コレクタ COL / エミッタ EM）へ伝わり導通を制御、電流伝達比（CTR）が利得を決める。フォトカプラ相当だが耐放射線・LED 劣化なし。',
        usedIn: '宇宙/航空宇宙の信号絶縁、絶縁帰還、リレー代替、耐放射線デジタル/アナログ絶縁。',
        desc: '耐放射線電流駆動アナログアイソレータ（フォトカプラ式）。ダイオード入力 / トランジスタ出力（4-pin）。',
        specs: [
          { k: '機能', v: '電流駆動アナログアイソレータ（フォトカプラ式）' },
          { k: '入力', v: 'ダイオード AN/CAT' },
          { k: '出力', v: 'トランジスタ COL/EM' },
          { k: '耐放射線', v: 'SP（rad-hard・宇宙級）' },
          { k: 'CTR', v: '電流伝達比（値は datasheet 参照）' },
          { k: 'パッケージ', v: '4-pin' }
        ]
      },
      ko: {
        subcategory: '전류 구동 아날로그 절연기(포토커플러식·내방사선)',
        whatIs: '전류 구동 아날로그 절연기(고체 포토커플러 대체): 입력 다이오드(AN/CAT)에 전류를 흘리면 절연 배리어를 넘어 출력 트랜지스터(COL/EM) 도통을 제어, 아날로그/디지털 신호 전달. 내방사선(SP)·우주급.',
        func: '입력 다이오드 AN→CAT에 전류를 흘리면 절연을 넘어 출력 트랜지스터(컬렉터 COL / 이미터 EM)에 전달돼 도통 제어, 전류 전달비(CTR)가 이득 결정. 포토커플러 상당이나 내방사선·LED 열화 없음.',
        usedIn: '우주/항공우주 신호 절연, 절연 피드백, 릴레이 대체, 내방사선 디지털/아날로그 절연.',
        desc: '내방사선 전류 구동 아날로그 절연기(포토커플러식). 다이오드 입력 / 트랜지스터 출력(4-pin).',
        specs: [
          { k: '기능', v: '전류 구동 아날로그 절연기(포토커플러식)' },
          { k: '입력', v: '다이오드 AN/CAT' },
          { k: '출력', v: '트랜지스터 COL/EM' },
          { k: '내방사선', v: 'SP(rad-hard·우주급)' },
          { k: 'CTR', v: '전류 전달비(값은 datasheet 참조)' },
          { k: '패키지', v: '4-pin' }
        ]
      }
    },
    'LMH32401': {
      en: {
        subcategory: '450MHz programmable-gain transimpedance amplifier (TIA, differential output)',
        whatIs: 'High-speed transimpedance amplifier (TIA): converts the tiny current from a photodiode (APD/PD) into a voltage, with programmable gain (2kΩ/20kΩ), differential output, and 450MHz bandwidth. Includes ambient-light cancellation (ALC). For LIDAR/optical-receiver front ends.',
        func: 'IN takes the photodiode current → internal transimpedance converts it to a differential voltage OUT+/OUT–; the GAIN pin selects 2kΩ or 20kΩ; IDC_EN enables the ambient-light (DC) cancellation loop; EN low is normal, high is shutdown. VDD1 powers the TIA stage, VDD2 the differential stage.',
        usedIn: 'LIDAR optical-receiver front end, laser ranging, optical-communication receivers, APD/PD signal amplification.',
        desc: '450MHz programmable-gain transimpedance amplifier (TIA), differential output, ambient-light cancellation, 2k/20kΩ gain (VQFN-16).',
        specs: [
          { k: 'Function', v: 'Programmable-gain transimpedance amplifier (TIA, differential output)' },
          { k: 'Bandwidth', v: '450 MHz' },
          { k: 'Gain', v: '2kΩ / 20kΩ (GAIN pin selects)' },
          { k: 'Ambient-light cancel', v: 'ALC loop (IDC_EN controlled)' },
          { k: 'Supply', v: 'VDD1 (TIA) + VDD2 (differential stage)' },
          { k: 'Package', v: 'VQFN-16 (RGT), EP to GND' }
        ],
        dropIn: [{ note: 'Same function (TIA) but the LMH32404 is a quad multiplexed version (28-pin, not pin-to-pin)' }]
      },
      ja: {
        subcategory: '450MHz プログラマブルゲイン トランスインピーダンスアンプ（TIA・差動出力）',
        whatIs: '高速トランスインピーダンスアンプ（TIA）：フォトダイオード（APD/PD）の微小電流を電圧に変換、プログラマブルゲイン（2kΩ/20kΩ）・差動出力・450MHz 帯域。環境光除去（ALC）内蔵。LIDAR/光受信フロントエンドに。',
        func: 'IN にフォトダイオード電流 → 内部トランスインピーダンスで差動電圧 OUT+/OUT– に変換；GAIN ピンで 2kΩ か 20kΩ を選択；IDC_EN で環境光（DC）除去ループを有効化；EN ローで通常・ハイでシャットダウン。VDD1 が TIA 段、VDD2 が差動段を供給。',
        usedIn: 'LIDAR 光受信フロントエンド、レーザ測距、光通信受信、APD/PD 信号増幅。',
        desc: '450MHz プログラマブルゲイン TIA。差動出力・環境光除去・2k/20kΩ ゲイン（VQFN-16）。',
        specs: [
          { k: '機能', v: 'プログラマブルゲイン TIA（差動出力）' },
          { k: '帯域', v: '450 MHz' },
          { k: 'ゲイン', v: '2kΩ / 20kΩ（GAIN ピン切替）' },
          { k: '環境光除去', v: 'ALC ループ（IDC_EN 制御）' },
          { k: '電源', v: 'VDD1（TIA）＋VDD2（差動段）' },
          { k: 'パッケージ', v: 'VQFN-16 (RGT)、EP は GND' }
        ],
        dropIn: [{ note: '機能同一（TIA）だが LMH32404 は 4 チャネル多重版（28-pin、pin-to-pin ではない）' }]
      },
      ko: {
        subcategory: '450MHz 프로그래머블 이득 트랜스임피던스 앰프(TIA·차동 출력)',
        whatIs: '고속 트랜스임피던스 앰프(TIA): 포토다이오드(APD/PD)의 미소 전류를 전압으로 변환, 프로그래머블 이득(2kΩ/20kΩ)·차동 출력·450MHz 대역. 주변광 제거(ALC) 내장. LIDAR/광수신 프론트엔드용.',
        func: 'IN에 포토다이오드 전류 → 내부 트랜스임피던스로 차동 전압 OUT+/OUT–로 변환; GAIN 핀으로 2kΩ 또는 20kΩ 선택; IDC_EN으로 주변광(DC) 제거 루프 활성화; EN 로우면 정상·하이면 셧다운. VDD1이 TIA단, VDD2가 차동단 공급.',
        usedIn: 'LIDAR 광수신 프론트엔드, 레이저 측거, 광통신 수신, APD/PD 신호 증폭.',
        desc: '450MHz 프로그래머블 이득 TIA. 차동 출력·주변광 제거·2k/20kΩ 이득(VQFN-16).',
        specs: [
          { k: '기능', v: '프로그래머블 이득 TIA(차동 출력)' },
          { k: '대역', v: '450 MHz' },
          { k: '이득', v: '2kΩ / 20kΩ(GAIN 핀 전환)' },
          { k: '주변광 제거', v: 'ALC 루프(IDC_EN 제어)' },
          { k: '전원', v: 'VDD1(TIA) + VDD2(차동단)' },
          { k: '패키지', v: 'VQFN-16 (RGT), EP는 GND' }
        ],
        dropIn: [{ note: '기능 동일(TIA)이나 LMH32404는 4채널 멀티플렉스판(28-pin, pin-to-pin 아님)' }]
      }
    },
    'LMH32404': {
      en: {
        subcategory: 'Quad multiplexed transimpedance amplifier (TIA, differential output)',
        whatIs: 'Quad transimpedance amplifier (TIA): 4 channels each convert a photodiode current to a differential voltage, with an integrated output switch to multiplex the selected channels (M1–M4). Each channel has 100mA clamping and ambient-light cancellation. For multi-channel LIDAR reception.',
        func: '4 inputs IN1–IN4 each transimpedance-amplify to OUT1±–OUT4±; M1–M4 select which channels are enabled (output switch closed); IDC_EN controls ambient-light cancellation; EN enables; VOCM sets output common mode. Each channel has 100mA clamping for fast overload recovery. VDD1 powers the TIA stage, VDD2 the differential stage.',
        usedIn: 'Multi-channel LIDAR receive arrays, laser ranging, multi-path optical detection, APD/PD array front ends.',
        desc: 'Quad multiplexed transimpedance amplifier (TIA), differential output, per-channel 100mA clamp + ambient-light cancellation (VQFN-28).',
        specs: [
          { k: 'Function', v: 'Quad multiplexed transimpedance amplifier (TIA)' },
          { k: 'Channels', v: '4 (IN1–IN4 / OUT1±–OUT4±)' },
          { k: 'Channel select', v: 'M1–M4 (high = enable output switch)' },
          { k: 'Protection', v: 'per-channel 100mA clamp (fast overload recovery)' },
          { k: 'Ambient-light cancel', v: 'ALC loop (IDC_EN controlled)' },
          { k: 'Supply', v: 'VDD1 (TIA) + VDD2 (differential stage)' },
          { k: 'Package', v: 'VQFN-28, EP to GND' }
        ]
      },
      ja: {
        subcategory: '4 チャネル多重トランスインピーダンスアンプ（TIA・差動出力）',
        whatIs: '4 チャネルトランスインピーダンスアンプ（TIA）：4 路それぞれフォトダイオード電流を差動電圧に変換、出力側に統合スイッチを持ちチャネルを多重選択（M1~M4）。各路 100mA クランプと環境光除去付。多チャネル LIDAR 受信に。',
        func: '4 入力 IN1~IN4 を各々トランスインピーダンス増幅し OUT1±~OUT4± へ；M1~M4 でどのチャネルを有効化（出力スイッチ閉）か選択；IDC_EN で環境光除去を制御；EN イネーブル；VOCM で出力コモンモード設定。各路 100mA クランプで高速過負荷回復。VDD1 が TIA 段、VDD2 が差動段。',
        usedIn: '多チャネル LIDAR 受信アレイ、レーザ測距、多経路光検出、APD/PD アレイフロントエンド。',
        desc: '4 チャネル多重トランスインピーダンスアンプ（TIA）。差動出力・各路 100mA クランプ＋環境光除去（VQFN-28）。',
        specs: [
          { k: '機能', v: '4 チャネル多重トランスインピーダンスアンプ（TIA）' },
          { k: 'チャネル', v: '4（IN1~IN4 / OUT1±~OUT4±）' },
          { k: 'チャネル選択', v: 'M1~M4（ハイ＝出力スイッチ有効）' },
          { k: '保護', v: '各路 100mA クランプ（高速過負荷回復）' },
          { k: '環境光除去', v: 'ALC ループ（IDC_EN 制御）' },
          { k: '電源', v: 'VDD1（TIA）＋VDD2（差動段）' },
          { k: 'パッケージ', v: 'VQFN-28、EP は GND' }
        ]
      },
      ko: {
        subcategory: '4채널 멀티플렉스 트랜스임피던스 앰프(TIA·차동 출력)',
        whatIs: '4채널 트랜스임피던스 앰프(TIA): 4채널 각각 포토다이오드 전류를 차동 전압으로 변환, 출력 측 통합 스위치로 채널 멀티플렉스 선택(M1~M4). 각 채널 100mA 클램프와 주변광 제거 포함. 다채널 LIDAR 수신용.',
        func: '4입력 IN1~IN4를 각각 트랜스임피던스 증폭해 OUT1±~OUT4±로; M1~M4로 어느 채널을 활성화(출력 스위치 닫힘)할지 선택; IDC_EN으로 주변광 제거 제어; EN 인에이블; VOCM으로 출력 공통 모드 설정. 각 채널 100mA 클램프로 고속 과부하 회복. VDD1이 TIA단, VDD2가 차동단.',
        usedIn: '다채널 LIDAR 수신 어레이, 레이저 측거, 다경로 광검출, APD/PD 어레이 프론트엔드.',
        desc: '4채널 멀티플렉스 트랜스임피던스 앰프(TIA). 차동 출력·각 채널 100mA 클램프+주변광 제거(VQFN-28).',
        specs: [
          { k: '기능', v: '4채널 멀티플렉스 트랜스임피던스 앰프(TIA)' },
          { k: '채널', v: '4(IN1~IN4 / OUT1±~OUT4±)' },
          { k: '채널 선택', v: 'M1~M4(하이=출력 스위치 활성)' },
          { k: '보호', v: '각 채널 100mA 클램프(고속 과부하 회복)' },
          { k: '주변광 제거', v: 'ALC 루프(IDC_EN 제어)' },
          { k: '전원', v: 'VDD1(TIA) + VDD2(차동단)' },
          { k: '패키지', v: 'VQFN-28, EP는 GND' }
        ]
      }
    },
    'THS4541-DIE': {
      en: {
        subcategory: 'Fully differential amplifier (FDA, negative-rail input/rail-to-rail output, bare die)',
        whatIs: 'Fully differential amplifier (FDA) bare die: converts single-ended or differential input to a differential output, with negative-rail input, rail-to-rail output, precision low noise. Commonly drives ADCs differentially. This is the bare-die version for hybrid circuits / multi-chip modules.',
        func: 'IN+/IN– differential input is amplified by the FDA to OUT+/OUT–; Vocm sets the output common mode (aligned to the ADC common mode); PD shuts down (low=off, high=normal); Vs+/Vs– dual supplies. Negative-rail input measures below ground; rail-to-rail output gives large swing.',
        usedIn: 'High-speed ADC differential driving, single-ended to differential, anti-alias filter driving, precision signal chains (bare die for MCM/SiP).',
        desc: 'Fully differential amplifier (FDA) bare die, negative-rail input / rail-to-rail output, Vocm common-mode set, PD shutdown.',
        specs: [
          { k: 'Function', v: 'Fully differential amplifier (FDA) bare die' },
          { k: 'Input', v: 'negative-rail input (measures below ground)' },
          { k: 'Output', v: 'rail-to-rail differential output' },
          { k: 'Common mode', v: 'Vocm sets output common mode' },
          { k: 'Shutdown', v: 'PD (high = normal)' },
          { k: 'Form', v: 'bare die (die/PAD), for MCM/SiP' }
        ]
      },
      ja: {
        subcategory: '全差動アンプ（FDA・負レール入力/レールツーレール出力・ベアダイ）',
        whatIs: '全差動アンプ（FDA）ベアダイ：シングルエンドまたは差動入力を差動出力に変換、負レール入力・レールツーレール出力・精密低ノイズ。ADC の差動駆動によく使う。これはハイブリッド回路/マルチチップモジュール向けのベアダイ版。',
        func: 'IN+/IN– 差動入力を FDA で OUT+/OUT– に増幅；Vocm で出力コモンモードを設定（ADC のコモンモードに合わせる）；PD でシャットダウン（ロー＝オフ・ハイ＝通常）；Vs+/Vs– 両電源。負レール入力でグランド以下も計測でき、レールツーレール出力で大振幅。',
        usedIn: '高速 ADC 差動駆動、シングルエンド→差動、アンチエイリアスフィルタ駆動、精密信号チェーン（ベアダイは MCM/SiP 用）。',
        desc: '全差動アンプ（FDA）ベアダイ。負レール入力 / レールツーレール出力・Vocm 共モード設定・PD シャットダウン。',
        specs: [
          { k: '機能', v: '全差動アンプ（FDA）ベアダイ' },
          { k: '入力', v: '負レール入力（グランド以下も計測可）' },
          { k: '出力', v: 'レールツーレール差動出力' },
          { k: 'コモンモード', v: 'Vocm で出力コモンモード設定' },
          { k: 'シャットダウン', v: 'PD（ハイ＝通常）' },
          { k: '形態', v: 'ベアダイ（die/PAD）、MCM/SiP 用' }
        ]
      },
      ko: {
        subcategory: '완전 차동 앰프(FDA·음레일 입력/레일투레일 출력·베어 다이)',
        whatIs: '완전 차동 앰프(FDA) 베어 다이: 싱글엔드 또는 차동 입력을 차동 출력으로 변환, 음레일 입력·레일투레일 출력·정밀 저잡음. ADC 차동 구동에 흔히 사용. 이것은 하이브리드 회로/멀티칩 모듈용 베어 다이판.',
        func: 'IN+/IN– 차동 입력을 FDA로 OUT+/OUT–로 증폭; Vocm으로 출력 공통 모드 설정(ADC 공통 모드에 맞춤); PD로 셧다운(로우=오프·하이=정상); Vs+/Vs– 이중 전원. 음레일 입력으로 접지 이하도 계측 가능, 레일투레일 출력으로 큰 진폭.',
        usedIn: '고속 ADC 차동 구동, 싱글엔드→차동, 안티에일리어스 필터 구동, 정밀 신호 체인(베어 다이는 MCM/SiP용).',
        desc: '완전 차동 앰프(FDA) 베어 다이. 음레일 입력 / 레일투레일 출력·Vocm 공통 모드 설정·PD 셧다운.',
        specs: [
          { k: '기능', v: '완전 차동 앰프(FDA) 베어 다이' },
          { k: '입력', v: '음레일 입력(접지 이하도 계측 가능)' },
          { k: '출력', v: '레일투레일 차동 출력' },
          { k: '공통 모드', v: 'Vocm으로 출력 공통 모드 설정' },
          { k: '셧다운', v: 'PD(하이=정상)' },
          { k: '형태', v: '베어 다이(die/PAD), MCM/SiP용' }
        ]
      }
    },
    'TCAN4572-Q1': {
      en: {
        subcategory: 'CAN FD transceiver + SPI system basis chip (automotive)',
        whatIs: 'A CAN FD (flexible data rate) transceiver integrated with an SPI interface as a system basis chip: converts the MCU’s digital signals to CAN bus differential signals (CANH/CANL), and provides configuration/diagnostics, wake-up and standby management over SPI. Automotive.',
        func: 'The MCU configures and reads status over SPI (SCLK/SDI/SDO/nCS); CANH/CANL transmit/receive CAN FD; nWKRQ (wake request) and nINT (interrupt) are open-drain; OSC1/OSC2 connect a crystal; VCC powers the CAN transceiver (5V), VIO the digital interface, VDD a wide range (can be battery); RST resets, FLTR filters the internal regulator.',
        usedIn: 'Automotive CAN FD nodes, zone control/gateways, CAN transceivers needing SPI management and wake, industrial CAN.',
        desc: 'Automotive CAN FD transceiver + SPI system basis chip, wake/interrupt (open-drain), crystal, multiple supply rails (SOT-16).',
        specs: [
          { k: 'Function', v: 'CAN FD transceiver + SPI system basis chip' },
          { k: 'Interface', v: 'SPI (SCLK/SDI/SDO/nCS) config/diagnostics' },
          { k: 'Bus', v: 'CANH/CANL (CAN FD flexible data rate)' },
          { k: 'Management', v: 'wake nWKRQ / interrupt nINT (open-drain)' },
          { k: 'Supply', v: 'VDD (wide battery range) + VCC (5V CAN) + VIO (digital)' },
          { k: 'Qualification', v: 'Automotive AEC-Q100' },
          { k: 'Package', v: 'SOT (DYY-16)' }
        ]
      },
      ja: {
        subcategory: 'CAN FD トランシーバ＋SPI システムベーシスチップ（車載）',
        whatIs: 'CAN FD（フレキシブルデータレート）トランシーバに SPI インタフェースを統合したシステムベーシスチップ：MCU のデジタル信号を CAN バス差動信号（CANH/CANL）に変換し、SPI で設定/診断・ウェイクアップ・スタンバイ管理を提供。車載。',
        func: 'MCU が SPI（SCLK/SDI/SDO/nCS）で設定と状態読み出し；CANH/CANL で CAN FD 送受信；nWKRQ（ウェイク要求）と nINT（割込み）はオープンドレイン；OSC1/OSC2 に水晶接続；VCC が CAN トランシーバ（5V）、VIO がデジタルインタフェース、VDD は広範囲（電池接続可）；RST リセット、FLTR 内部レギュレータ濾波。',
        usedIn: '車載 CAN FD ノード、ゾーン制御/ゲートウェイ、SPI 管理とウェイクが必要な CAN トランシーバ、産業 CAN。',
        desc: '車載 CAN FD トランシーバ＋SPI システムベーシスチップ。ウェイク/割込み（オープンドレイン）・水晶・複数電源レール（SOT-16）。',
        specs: [
          { k: '機能', v: 'CAN FD トランシーバ＋SPI システムベーシスチップ' },
          { k: 'インタフェース', v: 'SPI（SCLK/SDI/SDO/nCS）設定/診断' },
          { k: 'バス', v: 'CANH/CANL（CAN FD フレキシブルデータレート）' },
          { k: '管理', v: 'ウェイク nWKRQ / 割込み nINT（オープンドレイン）' },
          { k: '電源', v: 'VDD（電池広範囲）＋VCC（5V CAN）＋VIO（デジタル）' },
          { k: '認証', v: '車載 AEC-Q100' },
          { k: 'パッケージ', v: 'SOT (DYY-16)' }
        ]
      },
      ko: {
        subcategory: 'CAN FD 트랜시버 + SPI 시스템 베이시스 칩(차량용)',
        whatIs: 'CAN FD(유연 데이터율) 트랜시버에 SPI 인터페이스를 통합한 시스템 베이시스 칩: MCU의 디지털 신호를 CAN 버스 차동 신호(CANH/CANL)로 변환하고 SPI로 설정/진단·웨이크업·대기 관리 제공. 차량용.',
        func: 'MCU가 SPI(SCLK/SDI/SDO/nCS)로 설정과 상태 읽기; CANH/CANL로 CAN FD 송수신; nWKRQ(웨이크 요청)와 nINT(인터럽트)는 오픈 드레인; OSC1/OSC2에 수정 연결; VCC가 CAN 트랜시버(5V), VIO가 디지털 인터페이스, VDD는 광범위(배터리 연결 가능); RST 리셋, FLTR 내부 레귤레이터 필터링.',
        usedIn: '차량 CAN FD 노드, 존 제어/게이트웨이, SPI 관리와 웨이크가 필요한 CAN 트랜시버, 산업 CAN.',
        desc: '차량용 CAN FD 트랜시버 + SPI 시스템 베이시스 칩. 웨이크/인터럽트(오픈 드레인)·수정·다중 전원 레일(SOT-16).',
        specs: [
          { k: '기능', v: 'CAN FD 트랜시버 + SPI 시스템 베이시스 칩' },
          { k: '인터페이스', v: 'SPI(SCLK/SDI/SDO/nCS) 설정/진단' },
          { k: '버스', v: 'CANH/CANL(CAN FD 유연 데이터율)' },
          { k: '관리', v: '웨이크 nWKRQ / 인터럽트 nINT(오픈 드레인)' },
          { k: '전원', v: 'VDD(배터리 광범위) + VCC(5V CAN) + VIO(디지털)' },
          { k: '인증', v: '차량용 AEC-Q100' },
          { k: '패키지', v: 'SOT (DYY-16)' }
        ]
      }
    },
    'THVD9491-SP': {
      en: {
        subcategory: 'RS-485 transceiver (±40V fault protection, radiation-hardened)',
        whatIs: 'Radiation-hardened RS-485 transceiver: converts single-ended logic signals to an RS-485 differential bus (driver Y/Z, receiver A/B), with ±40V bus fault protection and selectable slew rate. 3–5.5V bus supply, independent VIO logic supply. Space-grade rad-hard.',
        func: 'D → driver differential output Y/Z; A/B differential → receiver R output; DE enables the driver, RE (active-low) enables the receiver; SLR selects slew rate (low=50Mbps, high=20Mbps); VIO sets the logic level, VCC powers the bus. ±40V fault protection resists bus shorts/miswiring.',
        usedIn: 'Space/aerospace RS-485/RS-422 communication, radiation-hardened industrial buses, long-distance differential data links.',
        desc: 'Radiation-hardened ±40V fault-protected RS-485 transceiver, selectable slew rate, independent VIO, 3–5.5V (SOIC-14).',
        specs: [
          { k: 'Function', v: 'RS-485 transceiver (full Y/Z/A/B)' },
          { k: 'Fault protection', v: '±40V bus fault protection' },
          { k: 'Slew rate', v: 'SLR selects 50Mbps / 20Mbps' },
          { k: 'Logic supply', v: 'VIO 1.65–5.5V (independent)' },
          { k: 'Bus supply', v: 'VCC 3–5.5V' },
          { k: 'Radiation', v: 'SP (rad-hard, space-grade)' },
          { k: 'Package', v: 'SOIC-14 (D)' }
        ]
      },
      ja: {
        subcategory: 'RS-485 トランシーバ（±40V 故障保護・耐放射線）',
        whatIs: '耐放射線 RS-485 トランシーバ：シングルエンドロジック信号を RS-485 差動バス（ドライバ Y/Z、レシーバ A/B）に変換、±40V バス故障保護・スルーレート選択可。3~5.5V バス電源、独立 VIO ロジック電源。宇宙級 rad-hard。',
        func: 'D→ドライバ差動出力 Y/Z；A/B 差動→レシーバ R 出力；DE でドライバ、RE（active-low）でレシーバをイネーブル；SLR でスルーレート選択（ロー=50Mbps、ハイ=20Mbps）；VIO でロジックレベル、VCC でバス供給。±40V 故障保護でバス短絡/誤配線に耐える。',
        usedIn: '宇宙/航空宇宙 RS-485/RS-422 通信、耐放射線産業バス、長距離差動データリンク。',
        desc: '耐放射線 ±40V 故障保護 RS-485 トランシーバ。スルーレート選択・独立 VIO・3~5.5V（SOIC-14）。',
        specs: [
          { k: '機能', v: 'RS-485 トランシーバ（フル Y/Z/A/B）' },
          { k: '故障保護', v: '±40V バス故障保護' },
          { k: 'スルーレート', v: 'SLR で 50Mbps / 20Mbps 選択' },
          { k: 'ロジック電源', v: 'VIO 1.65~5.5V（独立）' },
          { k: 'バス電源', v: 'VCC 3~5.5V' },
          { k: '耐放射線', v: 'SP（rad-hard・宇宙級）' },
          { k: 'パッケージ', v: 'SOIC-14 (D)' }
        ]
      },
      ko: {
        subcategory: 'RS-485 트랜시버(±40V 고장 보호·내방사선)',
        whatIs: '내방사선 RS-485 트랜시버: 싱글엔드 로직 신호를 RS-485 차동 버스(드라이버 Y/Z, 수신기 A/B)로 변환, ±40V 버스 고장 보호·슬루율 선택 가능. 3~5.5V 버스 전원, 독립 VIO 로직 전원. 우주급 rad-hard.',
        func: 'D→드라이버 차동 출력 Y/Z; A/B 차동→수신기 R 출력; DE로 드라이버, RE(active-low)로 수신기 인에이블; SLR로 슬루율 선택(로우=50Mbps, 하이=20Mbps); VIO로 로직 레벨, VCC로 버스 공급. ±40V 고장 보호로 버스 단락/오배선에 견딤.',
        usedIn: '우주/항공우주 RS-485/RS-422 통신, 내방사선 산업 버스, 장거리 차동 데이터 링크.',
        desc: '내방사선 ±40V 고장 보호 RS-485 트랜시버. 슬루율 선택·독립 VIO·3~5.5V(SOIC-14).',
        specs: [
          { k: '기능', v: 'RS-485 트랜시버(풀 Y/Z/A/B)' },
          { k: '고장 보호', v: '±40V 버스 고장 보호' },
          { k: '슬루율', v: 'SLR로 50Mbps / 20Mbps 선택' },
          { k: '로직 전원', v: 'VIO 1.65~5.5V(독립)' },
          { k: '버스 전원', v: 'VCC 3~5.5V' },
          { k: '내방사선', v: 'SP(rad-hard·우주급)' },
          { k: '패키지', v: 'SOIC-14 (D)' }
        ]
      }
    }
  };
  Object.assign(window.IC_I18N, T);
})();
/* batch 6: entries 75-89 */
(function () {
  var T = {
    'TDEL3G510': {
      en: {
        subcategory: 'Triple high-speed signal buffer (3Gbps class)',
        whatIs: 'Triple-channel high-speed single-ended signal buffer: 3 independent channels buffer nA input to nY output, for high-speed signal reconditioning/driving/isolation. Small DRL-8 package.',
        func: 'Each channel nA→nY reconditions the signal (isolates the load, boosts drive, resquares edges), 3 channels independent. Suited to high-speed clock/data distribution and shaping.',
        usedIn: 'High-speed clock/data buffered distribution, signal reconditioning, load isolation, on-board high-speed signal driving.',
        desc: 'Triple high-speed signal buffer (3Gbps class), 3 independent inputs/outputs (SOT DRL-8).',
        specs: [
          { k: 'Function', v: 'Triple high-speed signal buffer' },
          { k: 'Data rate', v: '3Gbps class (per datasheet)' },
          { k: 'Channels', v: '3 (each nA→nY independent)' },
          { k: 'Package', v: 'SOT (DRL-8)' }
        ]
      },
      ja: {
        subcategory: '3 チャネル高速信号バッファ（3Gbps 級）',
        whatIs: '3 チャネル高速シングルエンド信号バッファ：3 個の独立チャネルが nA 入力を nY 出力へバッファし、高速信号の再整形/駆動/絶縁に。小型 DRL-8 パッケージ。',
        func: '各チャネル nA→nY で信号を再整形（負荷絶縁・駆動増強・エッジ再整形）、3 チャネル独立。高速クロック/データの分配と整形に好適。',
        usedIn: '高速クロック/データのバッファ分配、信号再整形、負荷絶縁、基板内高速信号駆動。',
        desc: '3 チャネル高速信号バッファ（3Gbps 級）。3 チャネル独立入出力（SOT DRL-8）。',
        specs: [
          { k: '機能', v: '3 チャネル高速信号バッファ' },
          { k: 'データレート', v: '3Gbps 級（datasheet 参照）' },
          { k: 'チャネル', v: '3（各 nA→nY 独立）' },
          { k: 'パッケージ', v: 'SOT (DRL-8)' }
        ]
      },
      ko: {
        subcategory: '3채널 고속 신호 버퍼(3Gbps급)',
        whatIs: '3채널 고속 싱글엔드 신호 버퍼: 3개 독립 채널이 nA 입력을 nY 출력으로 버퍼, 고속 신호 재정형/구동/절연용. 소형 DRL-8 패키지.',
        func: '각 채널 nA→nY로 신호 재정형(부하 절연·구동 증강·에지 재정형), 3채널 독립. 고속 클록/데이터 분배와 정형에 적합.',
        usedIn: '고속 클록/데이터 버퍼 분배, 신호 재정형, 부하 절연, 보드 내 고속 신호 구동.',
        desc: '3채널 고속 신호 버퍼(3Gbps급). 3채널 독립 입출력(SOT DRL-8).',
        specs: [
          { k: '기능', v: '3채널 고속 신호 버퍼' },
          { k: '데이터 속도', v: '3Gbps급(datasheet 참조)' },
          { k: '채널', v: '3(각 nA→nY 독립)' },
          { k: '패키지', v: 'SOT (DRL-8)' }
        ]
      }
    },
    'DP83TD530-Q1': {
      en: {
        subcategory: '10BASE-T1S single-pair Ethernet PHY (automotive)',
        whatIs: '10BASE-T1S single-pair Ethernet (SPE) physical layer (PHY): carries single-ended data over a single twisted pair (TRD_P/TRD_M) at 10Mbps Ethernet. 3-pin interface (TX/RX/ED) + MDIO management. Tiny 8-pin, automotive.',
        func: 'TRD_P/TRD_M is the single-pair twisted bus (10BASE-T1S/T1L); TX sends data, RX receives data / doubles as MDC, ED does energy detect / doubles as MDIO; in config mode RX/ED become the MDC/MDIO management interface. AVDD3V3 main supply, VDDIO can be 1.8/2.5/3.3V.',
        usedIn: 'Automotive zonal networks, 10BASE-T1S multidrop bus, automotive sensor/actuator Ethernet, industrial SPE.',
        desc: 'Automotive 10BASE-T1S single-pair Ethernet PHY, single-pair TRD bus, 3-pin interface + MDIO, dual supply rails (8-pin).',
        specs: [
          { k: 'Function', v: '10BASE-T1S single-pair Ethernet PHY' },
          { k: 'Bus', v: 'TRD_P/TRD_M single twisted pair (10Mbps)' },
          { k: 'Interface', v: '3-pin (TX/RX/ED) + MDIO management (RX/ED multiplexed)' },
          { k: 'Supply', v: 'AVDD3V3 (3.3V) + VDDIO (1.8/2.5/3.3V)' },
          { k: 'Qualification', v: 'Automotive AEC-Q100' },
          { k: 'Package', v: '8-pin' }
        ]
      },
      ja: {
        subcategory: '10BASE-T1S シングルペアイーサネット PHY（車載）',
        whatIs: '10BASE-T1S シングルペアイーサネット（SPE）物理層（PHY）：シングルエンドデータを 1 対のツイストペア（TRD_P/TRD_M）で 10Mbps イーサ伝送。3 ピンインタフェース（TX/RX/ED）＋MDIO 管理。極小 8 ピン・車載。',
        func: 'TRD_P/TRD_M は 1 対ツイストバス（10BASE-T1S/T1L）；TX がデータ送信、RX がデータ受信/MDC 兼用、ED がエネルギー検出/MDIO 兼用；設定モードで RX/ED が MDC/MDIO 管理インタフェースに。AVDD3V3 主電源、VDDIO は 1.8/2.5/3.3V。',
        usedIn: '車載ゾーンネットワーク、10BASE-T1S マルチドロップバス、車載センサ/アクチュエータイーサ、産業 SPE。',
        desc: '車載 10BASE-T1S シングルペアイーサ PHY。シングルペアバス TRD・3 ピンインタフェース＋MDIO・両電源レール（8-pin）。',
        specs: [
          { k: '機能', v: '10BASE-T1S シングルペアイーサ PHY' },
          { k: 'バス', v: 'TRD_P/TRD_M 1 対ツイスト（10Mbps）' },
          { k: 'インタフェース', v: '3 ピン(TX/RX/ED) + MDIO 管理（RX/ED 兼用）' },
          { k: '電源', v: 'AVDD3V3 (3.3V) + VDDIO (1.8/2.5/3.3V)' },
          { k: '認証', v: '車載 AEC-Q100' },
          { k: 'パッケージ', v: '8-pin' }
        ]
      },
      ko: {
        subcategory: '10BASE-T1S 단일 쌍 이더넷 PHY(차량용)',
        whatIs: '10BASE-T1S 단일 쌍 이더넷(SPE) 물리 계층(PHY): 싱글엔드 데이터를 한 쌍의 트위스트 페어(TRD_P/TRD_M)로 10Mbps 이더 전송. 3핀 인터페이스(TX/RX/ED) + MDIO 관리. 초소형 8핀·차량용.',
        func: 'TRD_P/TRD_M는 한 쌍 트위스트 버스(10BASE-T1S/T1L); TX가 데이터 송신, RX가 데이터 수신/MDC 겸용, ED가 에너지 감지/MDIO 겸용; 설정 모드에서 RX/ED가 MDC/MDIO 관리 인터페이스로. AVDD3V3 주전원, VDDIO는 1.8/2.5/3.3V.',
        usedIn: '차량 존 네트워크, 10BASE-T1S 멀티드롭 버스, 차량 센서/액추에이터 이더, 산업 SPE.',
        desc: '차량용 10BASE-T1S 단일 쌍 이더 PHY. 단일 쌍 버스 TRD·3핀 인터페이스+MDIO·이중 전원 레일(8-pin).',
        specs: [
          { k: '기능', v: '10BASE-T1S 단일 쌍 이더 PHY' },
          { k: '버스', v: 'TRD_P/TRD_M 한 쌍 트위스트(10Mbps)' },
          { k: '인터페이스', v: '3핀(TX/RX/ED) + MDIO 관리(RX/ED 겸용)' },
          { k: '전원', v: 'AVDD3V3 (3.3V) + VDDIO (1.8/2.5/3.3V)' },
          { k: '인증', v: '차량용 AEC-Q100' },
          { k: '패키지', v: '8-pin' }
        ]
      }
    },
    'LMK1C1102A': {
      en: {
        subcategory: 'LVCMOS clock fanout buffer (1:2)',
        whatIs: 'LVCMOS clock fanout buffer (1 in, 2 out): replicates one clock into 2 low-skew outputs to synchronize multiple chips. Includes a global output enable (1G).',
        func: 'CLKIN single-ended clock input (internal 300kΩ pull-down) → buffered and replicated to Y0/Y1 LVCMOS outputs; 1G high enables, low disables outputs. Low skew, low jitter for clock distribution. 1.8/2.5/3.3V.',
        usedIn: 'Clock-tree distribution, multi-chip synchronous clocking, shared MCU/FPGA/ADC clock, on-board clock fanout.',
        desc: 'LVCMOS 1:2 clock fanout buffer, global output enable, low skew, 1.8–3.3V (WSON/TSSOP-8).',
        specs: [
          { k: 'Function', v: 'LVCMOS clock fanout buffer (1:2)' },
          { k: 'Outputs', v: '2 (Y0/Y1)' },
          { k: 'Enable', v: 'global 1G (active-high)' },
          { k: 'Supply', v: '1.8 / 2.5 / 3.3 V' },
          { k: 'Package', v: 'WSON-8 (DQF) / TSSOP-8 (PW)' }
        ],
        dropIn: [{ note: 'Automotive version, same 8-pin pinout' }]
      },
      ja: {
        subcategory: 'LVCMOS クロックファンアウトバッファ（1:2）',
        whatIs: 'LVCMOS クロックファンアウトバッファ（1 入力 2 出力）：1 系統のクロックを 2 系統の低スキュー出力に複製し複数チップを同期。グローバル出力イネーブル（1G）内蔵。',
        func: 'CLKIN シングルエンドクロック入力（内部 300kΩ プルダウン）→バッファし Y0/Y1 LVCMOS 出力に複製；1G ハイで有効、ローで出力オフ。低スキュー・低ジッタでクロック分配。1.8/2.5/3.3V。',
        usedIn: 'クロックツリー分配、複数チップ同期クロック、MCU/FPGA/ADC 共通クロック、基板内クロックファンアウト。',
        desc: 'LVCMOS 1:2 クロックファンアウトバッファ。グローバル出力イネーブル・低スキュー・1.8~3.3V（WSON/TSSOP-8）。',
        specs: [
          { k: '機能', v: 'LVCMOS クロックファンアウトバッファ（1:2）' },
          { k: '出力数', v: '2（Y0/Y1）' },
          { k: 'イネーブル', v: 'グローバル 1G（ハイ有効）' },
          { k: '電源', v: '1.8 / 2.5 / 3.3 V' },
          { k: 'パッケージ', v: 'WSON-8 (DQF) / TSSOP-8 (PW)' }
        ],
        dropIn: [{ note: '車載版・同 8-pin ピン配置同一' }]
      },
      ko: {
        subcategory: 'LVCMOS 클록 팬아웃 버퍼(1:2)',
        whatIs: 'LVCMOS 클록 팬아웃 버퍼(1입력 2출력): 한 계통의 클록을 2계통 저스큐 출력으로 복제해 여러 칩을 동기. 글로벌 출력 인에이블(1G) 내장.',
        func: 'CLKIN 싱글엔드 클록 입력(내부 300kΩ 풀다운) → 버퍼해 Y0/Y1 LVCMOS 출력으로 복제; 1G 하이로 활성, 로우로 출력 끔. 저스큐·저지터로 클록 분배. 1.8/2.5/3.3V.',
        usedIn: '클록 트리 분배, 다중 칩 동기 클록, MCU/FPGA/ADC 공통 클록, 보드 내 클록 팬아웃.',
        desc: 'LVCMOS 1:2 클록 팬아웃 버퍼. 글로벌 출력 인에이블·저스큐·1.8~3.3V(WSON/TSSOP-8).',
        specs: [
          { k: '기능', v: 'LVCMOS 클록 팬아웃 버퍼(1:2)' },
          { k: '출력 수', v: '2(Y0/Y1)' },
          { k: '인에이블', v: '글로벌 1G(하이 유효)' },
          { k: '전원', v: '1.8 / 2.5 / 3.3 V' },
          { k: '패키지', v: 'WSON-8 (DQF) / TSSOP-8 (PW)' }
        ],
        dropIn: [{ note: '차량용 버전·동일 8-pin 핀 배치' }]
      }
    },
    'LMK1C1102-Q1': {
      en: {
        subcategory: 'LVCMOS clock fanout buffer (1:2, automotive)',
        whatIs: 'LVCMOS 1:2 clock fanout buffer (automotive Q1): 1-in, 2-out low-skew clock. Same pinout as LMK1C1102A plus automotive qualification.',
        func: 'Same as the 1102A: CLKIN→Y0/Y1, 1G enable. AEC-Q100 automotive.',
        usedIn: 'Automotive clock distribution, multi-chip synchronization, ADAS/telematics clock fanout.',
        desc: 'Automotive LVCMOS 1:2 clock fanout buffer (same pinout as 1102A, WSON/TSSOP-8).',
        specs: [
          { k: 'Function', v: 'LVCMOS clock fanout (1:2, automotive)' },
          { k: 'Outputs', v: '2' },
          { k: 'Enable', v: 'global 1G' },
          { k: 'Qualification', v: 'Automotive AEC-Q100 (Q1)' },
          { k: 'Supply', v: '1.8 / 2.5 / 3.3 V' },
          { k: 'Package', v: 'WSON-8 / TSSOP-8' }
        ],
        dropIn: [{ note: 'Non-automotive version, same 8-pin pinout' }]
      },
      ja: {
        subcategory: 'LVCMOS クロックファンアウトバッファ（1:2・車載）',
        whatIs: 'LVCMOS 1:2 クロックファンアウトバッファ（車載 Q1）：1 入力 2 出力の低スキュークロック。LMK1C1102A とピン互換＋車載認証。',
        func: '1102A と同じ：CLKIN→Y0/Y1、1G イネーブル。車載 AEC-Q100。',
        usedIn: '車載クロック分配、複数チップ同期、ADAS/テレマティクスのクロックファンアウト。',
        desc: '車載 LVCMOS 1:2 クロックファンアウトバッファ（1102A とピン互換、WSON/TSSOP-8）。',
        specs: [
          { k: '機能', v: 'LVCMOS クロックファンアウト（1:2・車載）' },
          { k: '出力数', v: '2' },
          { k: 'イネーブル', v: 'グローバル 1G' },
          { k: '認証', v: '車載 AEC-Q100 (Q1)' },
          { k: '電源', v: '1.8 / 2.5 / 3.3 V' },
          { k: 'パッケージ', v: 'WSON-8 / TSSOP-8' }
        ],
        dropIn: [{ note: '非車載版・同 8-pin ピン配置同一' }]
      },
      ko: {
        subcategory: 'LVCMOS 클록 팬아웃 버퍼(1:2·차량용)',
        whatIs: 'LVCMOS 1:2 클록 팬아웃 버퍼(차량용 Q1): 1입력 2출력 저스큐 클록. LMK1C1102A와 핀 호환+차량 인증.',
        func: '1102A와 동일: CLKIN→Y0/Y1, 1G 인에이블. 차량용 AEC-Q100.',
        usedIn: '차량 클록 분배, 다중 칩 동기, ADAS/텔레매틱스 클록 팬아웃.',
        desc: '차량용 LVCMOS 1:2 클록 팬아웃 버퍼(1102A와 핀 호환, WSON/TSSOP-8).',
        specs: [
          { k: '기능', v: 'LVCMOS 클록 팬아웃(1:2·차량용)' },
          { k: '출력 수', v: '2' },
          { k: '인에이블', v: '글로벌 1G' },
          { k: '인증', v: '차량용 AEC-Q100 (Q1)' },
          { k: '전원', v: '1.8 / 2.5 / 3.3 V' },
          { k: '패키지', v: 'WSON-8 / TSSOP-8' }
        ],
        dropIn: [{ note: '비차량용 버전·동일 8-pin 핀 배치' }]
      }
    },
    'LMK1C1103A': {
      en: {
        subcategory: 'LVCMOS clock fanout buffer (1:3)',
        whatIs: 'LVCMOS clock fanout buffer (1 in, 3 out): replicates one clock into 3 low-skew outputs. Includes a global output enable.',
        func: 'CLKIN → Y0/Y1/Y2 three LVCMOS outputs; 1G enable. Low-skew, low-jitter clock distribution. 1.8/2.5/3.3V.',
        usedIn: 'Clock-tree distribution, multi-chip synchronization, on-board clock fanout.',
        desc: 'LVCMOS 1:3 clock fanout buffer, global enable, low skew, 1.8–3.3V (TSSOP/WSON-8).',
        specs: [
          { k: 'Function', v: 'LVCMOS clock fanout (1:3)' },
          { k: 'Outputs', v: '3 (Y0/Y1/Y2)' },
          { k: 'Enable', v: 'global 1G (active-high)' },
          { k: 'Supply', v: '1.8 / 2.5 / 3.3 V' },
          { k: 'Package', v: 'TSSOP-8 (PW) / WSON-8 (DQF)' }
        ]
      },
      ja: {
        subcategory: 'LVCMOS クロックファンアウトバッファ（1:3）',
        whatIs: 'LVCMOS クロックファンアウトバッファ（1 入力 3 出力）：1 系統のクロックを 3 系統の低スキュー出力に複製。グローバル出力イネーブル内蔵。',
        func: 'CLKIN → Y0/Y1/Y2 の 3 系統 LVCMOS 出力；1G イネーブル。低スキュー・低ジッタのクロック分配。1.8/2.5/3.3V。',
        usedIn: 'クロックツリー分配、複数チップ同期、基板内クロックファンアウト。',
        desc: 'LVCMOS 1:3 クロックファンアウトバッファ。グローバルイネーブル・低スキュー・1.8~3.3V（TSSOP/WSON-8）。',
        specs: [
          { k: '機能', v: 'LVCMOS クロックファンアウト（1:3）' },
          { k: '出力数', v: '3（Y0/Y1/Y2）' },
          { k: 'イネーブル', v: 'グローバル 1G（ハイ有効）' },
          { k: '電源', v: '1.8 / 2.5 / 3.3 V' },
          { k: 'パッケージ', v: 'TSSOP-8 (PW) / WSON-8 (DQF)' }
        ]
      },
      ko: {
        subcategory: 'LVCMOS 클록 팬아웃 버퍼(1:3)',
        whatIs: 'LVCMOS 클록 팬아웃 버퍼(1입력 3출력): 한 계통의 클록을 3계통 저스큐 출력으로 복제. 글로벌 출력 인에이블 내장.',
        func: 'CLKIN → Y0/Y1/Y2 3계통 LVCMOS 출력; 1G 인에이블. 저스큐·저지터 클록 분배. 1.8/2.5/3.3V.',
        usedIn: '클록 트리 분배, 다중 칩 동기, 보드 내 클록 팬아웃.',
        desc: 'LVCMOS 1:3 클록 팬아웃 버퍼. 글로벌 인에이블·저스큐·1.8~3.3V(TSSOP/WSON-8).',
        specs: [
          { k: '기능', v: 'LVCMOS 클록 팬아웃(1:3)' },
          { k: '출력 수', v: '3(Y0/Y1/Y2)' },
          { k: '인에이블', v: '글로벌 1G(하이 유효)' },
          { k: '전원', v: '1.8 / 2.5 / 3.3 V' },
          { k: '패키지', v: 'TSSOP-8 (PW) / WSON-8 (DQF)' }
        ]
      }
    },
    'LMK1C1104A': {
      en: {
        subcategory: 'LVCMOS clock fanout buffer (1:4)',
        whatIs: 'LVCMOS clock fanout buffer (1 in, 4 out): replicates one clock into 4 low-skew outputs. Includes a global output enable.',
        func: 'CLKIN → Y0/Y1/Y2/Y3 four LVCMOS outputs; 1G enable. Low-skew, low-jitter clock distribution. 1.8/2.5/3.3V.',
        usedIn: 'Clock-tree distribution, multi-chip synchronization, shared MCU/FPGA/ADC clock, on-board clock fanout.',
        desc: 'LVCMOS 1:4 clock fanout buffer, global enable, low skew, 1.8–3.3V (WSON/TSSOP-8).',
        specs: [
          { k: 'Function', v: 'LVCMOS clock fanout (1:4)' },
          { k: 'Outputs', v: '4 (Y0–Y3)' },
          { k: 'Enable', v: 'global 1G (active-high)' },
          { k: 'Supply', v: '1.8 / 2.5 / 3.3 V' },
          { k: 'Package', v: 'WSON-8 (DQF) / TSSOP-8 (PW)' }
        ],
        dropIn: [{ note: 'Automotive version, same 8-pin pinout' }]
      },
      ja: {
        subcategory: 'LVCMOS クロックファンアウトバッファ（1:4）',
        whatIs: 'LVCMOS クロックファンアウトバッファ（1 入力 4 出力）：1 系統のクロックを 4 系統の低スキュー出力に複製。グローバル出力イネーブル内蔵。',
        func: 'CLKIN → Y0/Y1/Y2/Y3 の 4 系統 LVCMOS 出力；1G イネーブル。低スキュー・低ジッタのクロック分配。1.8/2.5/3.3V。',
        usedIn: 'クロックツリー分配、複数チップ同期、MCU/FPGA/ADC 共通クロック、基板内クロックファンアウト。',
        desc: 'LVCMOS 1:4 クロックファンアウトバッファ。グローバルイネーブル・低スキュー・1.8~3.3V（WSON/TSSOP-8）。',
        specs: [
          { k: '機能', v: 'LVCMOS クロックファンアウト（1:4）' },
          { k: '出力数', v: '4（Y0~Y3）' },
          { k: 'イネーブル', v: 'グローバル 1G（ハイ有効）' },
          { k: '電源', v: '1.8 / 2.5 / 3.3 V' },
          { k: 'パッケージ', v: 'WSON-8 (DQF) / TSSOP-8 (PW)' }
        ],
        dropIn: [{ note: '車載版・同 8-pin ピン配置同一' }]
      },
      ko: {
        subcategory: 'LVCMOS 클록 팬아웃 버퍼(1:4)',
        whatIs: 'LVCMOS 클록 팬아웃 버퍼(1입력 4출력): 한 계통의 클록을 4계통 저스큐 출력으로 복제. 글로벌 출력 인에이블 내장.',
        func: 'CLKIN → Y0/Y1/Y2/Y3 4계통 LVCMOS 출력; 1G 인에이블. 저스큐·저지터 클록 분배. 1.8/2.5/3.3V.',
        usedIn: '클록 트리 분배, 다중 칩 동기, MCU/FPGA/ADC 공통 클록, 보드 내 클록 팬아웃.',
        desc: 'LVCMOS 1:4 클록 팬아웃 버퍼. 글로벌 인에이블·저스큐·1.8~3.3V(WSON/TSSOP-8).',
        specs: [
          { k: '기능', v: 'LVCMOS 클록 팬아웃(1:4)' },
          { k: '출력 수', v: '4(Y0~Y3)' },
          { k: '인에이블', v: '글로벌 1G(하이 유효)' },
          { k: '전원', v: '1.8 / 2.5 / 3.3 V' },
          { k: '패키지', v: 'WSON-8 (DQF) / TSSOP-8 (PW)' }
        ],
        dropIn: [{ note: '차량용 버전·동일 8-pin 핀 배치' }]
      }
    },
    'LMK1C1104-Q1': {
      en: {
        subcategory: 'LVCMOS clock fanout buffer (1:4, automotive)',
        whatIs: 'LVCMOS 1:4 clock fanout buffer (automotive Q1): 1-in, 4-out low-skew clock. Same pinout as LMK1C1104A plus automotive qualification.',
        func: 'Same as the 1104A: CLKIN→Y0–Y3, 1G enable. AEC-Q100 automotive.',
        usedIn: 'Automotive clock distribution, multi-chip synchronization, ADAS/telematics clock fanout.',
        desc: 'Automotive LVCMOS 1:4 clock fanout buffer (same pinout as 1104A, WSON/TSSOP-8).',
        specs: [
          { k: 'Function', v: 'LVCMOS clock fanout (1:4, automotive)' },
          { k: 'Outputs', v: '4' },
          { k: 'Enable', v: 'global 1G' },
          { k: 'Qualification', v: 'Automotive AEC-Q100 (Q1)' },
          { k: 'Supply', v: '1.8 / 2.5 / 3.3 V' },
          { k: 'Package', v: 'WSON-8 / TSSOP-8' }
        ],
        dropIn: [{ note: 'Non-automotive version, same 8-pin pinout' }]
      },
      ja: {
        subcategory: 'LVCMOS クロックファンアウトバッファ（1:4・車載）',
        whatIs: 'LVCMOS 1:4 クロックファンアウトバッファ（車載 Q1）：1 入力 4 出力の低スキュークロック。LMK1C1104A とピン互換＋車載認証。',
        func: '1104A と同じ：CLKIN→Y0~Y3、1G イネーブル。車載 AEC-Q100。',
        usedIn: '車載クロック分配、複数チップ同期、ADAS/テレマティクスのクロックファンアウト。',
        desc: '車載 LVCMOS 1:4 クロックファンアウトバッファ（1104A とピン互換、WSON/TSSOP-8）。',
        specs: [
          { k: '機能', v: 'LVCMOS クロックファンアウト（1:4・車載）' },
          { k: '出力数', v: '4' },
          { k: 'イネーブル', v: 'グローバル 1G' },
          { k: '認証', v: '車載 AEC-Q100 (Q1)' },
          { k: '電源', v: '1.8 / 2.5 / 3.3 V' },
          { k: 'パッケージ', v: 'WSON-8 / TSSOP-8' }
        ],
        dropIn: [{ note: '非車載版・同 8-pin ピン配置同一' }]
      },
      ko: {
        subcategory: 'LVCMOS 클록 팬아웃 버퍼(1:4·차량용)',
        whatIs: 'LVCMOS 1:4 클록 팬아웃 버퍼(차량용 Q1): 1입력 4출력 저스큐 클록. LMK1C1104A와 핀 호환+차량 인증.',
        func: '1104A와 동일: CLKIN→Y0~Y3, 1G 인에이블. 차량용 AEC-Q100.',
        usedIn: '차량 클록 분배, 다중 칩 동기, ADAS/텔레매틱스 클록 팬아웃.',
        desc: '차량용 LVCMOS 1:4 클록 팬아웃 버퍼(1104A와 핀 호환, WSON/TSSOP-8).',
        specs: [
          { k: '기능', v: 'LVCMOS 클록 팬아웃(1:4·차량용)' },
          { k: '출력 수', v: '4' },
          { k: '인에이블', v: '글로벌 1G' },
          { k: '인증', v: '차량용 AEC-Q100 (Q1)' },
          { k: '전원', v: '1.8 / 2.5 / 3.3 V' },
          { k: '패키지', v: 'WSON-8 / TSSOP-8' }
        ],
        dropIn: [{ note: '비차량용 버전·동일 8-pin 핀 배치' }]
      }
    },
    'LMK1C1106-Q1': {
      en: {
        subcategory: 'LVCMOS clock fanout buffer (1:6, automotive)',
        whatIs: 'LVCMOS clock fanout buffer (1 in, 6 out, automotive): replicates one clock into 6 low-skew outputs. Includes a global output enable.',
        func: 'CLKIN → Y0–Y5 six LVCMOS outputs; 1G enable. Low-skew, low-jitter clock distribution. 1.8/2.5/3.3V, AEC-Q100. (Pinout has dual VDD/GND; verify NC positions against the datasheet figure.)',
        usedIn: 'Automotive clock-tree distribution, multi-chip synchronization, ADAS/telematics/instrument-cluster clock fanout.',
        desc: 'Automotive LVCMOS 1:6 clock fanout buffer, global enable, low skew, 1.8–3.3V (TSSOP-14).',
        specs: [
          { k: 'Function', v: 'LVCMOS clock fanout (1:6, automotive)' },
          { k: 'Outputs', v: '6 (Y0–Y5)' },
          { k: 'Enable', v: 'global 1G' },
          { k: 'Qualification', v: 'Automotive AEC-Q100 (Q1)' },
          { k: 'Supply', v: '1.8 / 2.5 / 3.3 V' },
          { k: 'Package', v: 'TSSOP-14 (PW)' }
        ]
      },
      ja: {
        subcategory: 'LVCMOS クロックファンアウトバッファ（1:6・車載）',
        whatIs: 'LVCMOS クロックファンアウトバッファ（1 入力 6 出力・車載）：1 系統のクロックを 6 系統の低スキュー出力に複製。グローバル出力イネーブル内蔵。',
        func: 'CLKIN → Y0~Y5 の 6 系統 LVCMOS 出力；1G イネーブル。低スキュー・低ジッタのクロック分配。1.8/2.5/3.3V・車載 AEC-Q100。（ピンに VDD/GND 複数、NC 位置は datasheet 図で確認）',
        usedIn: '車載クロックツリー分配、複数チップ同期、ADAS/テレマティクス/メータのクロックファンアウト。',
        desc: '車載 LVCMOS 1:6 クロックファンアウトバッファ。グローバルイネーブル・低スキュー・1.8~3.3V（TSSOP-14）。',
        specs: [
          { k: '機能', v: 'LVCMOS クロックファンアウト（1:6・車載）' },
          { k: '出力数', v: '6（Y0~Y5）' },
          { k: 'イネーブル', v: 'グローバル 1G' },
          { k: '認証', v: '車載 AEC-Q100 (Q1)' },
          { k: '電源', v: '1.8 / 2.5 / 3.3 V' },
          { k: 'パッケージ', v: 'TSSOP-14 (PW)' }
        ]
      },
      ko: {
        subcategory: 'LVCMOS 클록 팬아웃 버퍼(1:6·차량용)',
        whatIs: 'LVCMOS 클록 팬아웃 버퍼(1입력 6출력·차량용): 한 계통의 클록을 6계통 저스큐 출력으로 복제. 글로벌 출력 인에이블 내장.',
        func: 'CLKIN → Y0~Y5 6계통 LVCMOS 출력; 1G 인에이블. 저스큐·저지터 클록 분배. 1.8/2.5/3.3V·차량용 AEC-Q100. (핀에 VDD/GND 다수, NC 위치는 datasheet 그림으로 확인)',
        usedIn: '차량 클록 트리 분배, 다중 칩 동기, ADAS/텔레매틱스/계기 클록 팬아웃.',
        desc: '차량용 LVCMOS 1:6 클록 팬아웃 버퍼. 글로벌 인에이블·저스큐·1.8~3.3V(TSSOP-14).',
        specs: [
          { k: '기능', v: 'LVCMOS 클록 팬아웃(1:6·차량용)' },
          { k: '출력 수', v: '6(Y0~Y5)' },
          { k: '인에이블', v: '글로벌 1G' },
          { k: '인증', v: '차량용 AEC-Q100 (Q1)' },
          { k: '전원', v: '1.8 / 2.5 / 3.3 V' },
          { k: '패키지', v: 'TSSOP-14 (PW)' }
        ]
      }
    },
    'LMK1C1108-Q1': {
      en: {
        subcategory: 'LVCMOS clock fanout buffer (1:8, automotive)',
        whatIs: 'LVCMOS clock fanout buffer (1 in, 8 out, automotive): replicates one clock into 8 low-skew outputs. Includes a global output enable.',
        func: 'CLKIN → Y0–Y7 eight LVCMOS outputs; 1G enable. Low-skew, low-jitter clock distribution. 1.8/2.5/3.3V, AEC-Q100. (Pinout has dual VDD/GND; verify NC positions against the datasheet figure.)',
        usedIn: 'Automotive large-fanout clock trees, multi-chip synchronization, ADAS/telematics/instrument-cluster clock distribution.',
        desc: 'Automotive LVCMOS 1:8 clock fanout buffer, global enable, low skew, 1.8–3.3V (TSSOP-16).',
        specs: [
          { k: 'Function', v: 'LVCMOS clock fanout (1:8, automotive)' },
          { k: 'Outputs', v: '8 (Y0–Y7)' },
          { k: 'Enable', v: 'global 1G' },
          { k: 'Qualification', v: 'Automotive AEC-Q100 (Q1)' },
          { k: 'Supply', v: '1.8 / 2.5 / 3.3 V' },
          { k: 'Package', v: 'TSSOP-16 (PW)' }
        ]
      },
      ja: {
        subcategory: 'LVCMOS クロックファンアウトバッファ（1:8・車載）',
        whatIs: 'LVCMOS クロックファンアウトバッファ（1 入力 8 出力・車載）：1 系統のクロックを 8 系統の低スキュー出力に複製。グローバル出力イネーブル内蔵。',
        func: 'CLKIN → Y0~Y7 の 8 系統 LVCMOS 出力；1G イネーブル。低スキュー・低ジッタのクロック分配。1.8/2.5/3.3V・車載 AEC-Q100。（ピンに VDD/GND 複数、NC 位置は datasheet 図で確認）',
        usedIn: '車載大ファンアウトクロックツリー、複数チップ同期、ADAS/テレマティクス/メータのクロック分配。',
        desc: '車載 LVCMOS 1:8 クロックファンアウトバッファ。グローバルイネーブル・低スキュー・1.8~3.3V（TSSOP-16）。',
        specs: [
          { k: '機能', v: 'LVCMOS クロックファンアウト（1:8・車載）' },
          { k: '出力数', v: '8（Y0~Y7）' },
          { k: 'イネーブル', v: 'グローバル 1G' },
          { k: '認証', v: '車載 AEC-Q100 (Q1)' },
          { k: '電源', v: '1.8 / 2.5 / 3.3 V' },
          { k: 'パッケージ', v: 'TSSOP-16 (PW)' }
        ]
      },
      ko: {
        subcategory: 'LVCMOS 클록 팬아웃 버퍼(1:8·차량용)',
        whatIs: 'LVCMOS 클록 팬아웃 버퍼(1입력 8출력·차량용): 한 계통의 클록을 8계통 저스큐 출력으로 복제. 글로벌 출력 인에이블 내장.',
        func: 'CLKIN → Y0~Y7 8계통 LVCMOS 출력; 1G 인에이블. 저스큐·저지터 클록 분배. 1.8/2.5/3.3V·차량용 AEC-Q100. (핀에 VDD/GND 다수, NC 위치는 datasheet 그림으로 확인)',
        usedIn: '차량 대형 팬아웃 클록 트리, 다중 칩 동기, ADAS/텔레매틱스/계기 클록 분배.',
        desc: '차량용 LVCMOS 1:8 클록 팬아웃 버퍼. 글로벌 인에이블·저스큐·1.8~3.3V(TSSOP-16).',
        specs: [
          { k: '기능', v: 'LVCMOS 클록 팬아웃(1:8·차량용)' },
          { k: '출력 수', v: '8(Y0~Y7)' },
          { k: '인에이블', v: '글로벌 1G' },
          { k: '인증', v: '차량용 AEC-Q100 (Q1)' },
          { k: '전원', v: '1.8 / 2.5 / 3.3 V' },
          { k: '패키지', v: 'TSSOP-16 (PW)' }
        ]
      }
    },
    'TLC3555': {
      en: {
        subcategory: 'High-speed CMOS timer (555-type)',
        whatIs: 'High-speed CMOS 555 timer: an external RC sets the delay/oscillation period, for monostable (one-shot) or astable (oscillator) operation. 1.5–18V wide supply, low-power CMOS.',
        func: 'TRIG (< 1/2 CONT) triggers OUT high and opens DISCH; THRES (> CONT) drives OUT low and pulls DISCH low to discharge; CONT sets the comparator threshold (default 2/3 VDD); RESET (active-low) forces OUT/DISCH low. For delay, PWM, oscillation, pulse generation.',
        usedIn: 'Delay/timing, PWM generation, oscillators, pulse generation, trigger/monostable.',
        desc: 'High-speed CMOS 555 timer, 1.5–18V, monostable/astable, low power (SOT-23-8 / VSSOP-8).',
        specs: [
          { k: 'Function', v: 'High-speed CMOS 555 timer' },
          { k: 'Modes', v: 'monostable / astable (RC timing)' },
          { k: 'Supply', v: '1.5 – 18 V' },
          { k: 'Reset', v: 'RESET (active-low)' },
          { k: 'Process', v: 'CMOS (low power)' },
          { k: 'Package', v: 'SOT-23-8 / VSSOP-8' }
        ]
      },
      ja: {
        subcategory: '高速 CMOS タイマ（555 型）',
        whatIs: '高速 CMOS 版 555 タイマ：外付け RC で遅延/発振周期を決め、単安定（ワンショット）または非安定（発振器）動作。1.5~18V 広電源・CMOS 低消費電力。',
        func: 'TRIG（< 1/2 CONT）で OUT ハイ・DISCH 開；THRES（> CONT）で OUT ロー・DISCH をローに引き放電；CONT で比較しきい値を設定（既定 2/3 VDD）；RESET（active-low）で OUT/DISCH を強制ロー。遅延・PWM・発振・パルス生成に。',
        usedIn: '遅延/計時、PWM 生成、発振器、パルス生成、トリガ/単安定。',
        desc: '高速 CMOS 555 タイマ。1.5~18V・単安定/非安定・低消費電力（SOT-23-8 / VSSOP-8）。',
        specs: [
          { k: '機能', v: '高速 CMOS 555 タイマ' },
          { k: 'モード', v: '単安定 / 非安定（RC 計時）' },
          { k: '電源', v: '1.5 ~ 18 V' },
          { k: 'リセット', v: 'RESET（active-low）' },
          { k: 'プロセス', v: 'CMOS（低消費電力）' },
          { k: 'パッケージ', v: 'SOT-23-8 / VSSOP-8' }
        ]
      },
      ko: {
        subcategory: '고속 CMOS 타이머(555형)',
        whatIs: '고속 CMOS판 555 타이머: 외장 RC로 지연/발진 주기를 정해 모노스테이블(원샷) 또는 비안정(발진기) 동작. 1.5~18V 광전원·CMOS 저전력.',
        func: 'TRIG(< 1/2 CONT)로 OUT 하이·DISCH 개방; THRES(> CONT)로 OUT 로우·DISCH를 로우로 당겨 방전; CONT로 비교기 문턱 설정(기본 2/3 VDD); RESET(active-low)으로 OUT/DISCH 강제 로우. 지연·PWM·발진·펄스 생성용.',
        usedIn: '지연/계시, PWM 생성, 발진기, 펄스 생성, 트리거/모노스테이블.',
        desc: '고속 CMOS 555 타이머. 1.5~18V·모노스테이블/비안정·저전력(SOT-23-8 / VSSOP-8).',
        specs: [
          { k: '기능', v: '고속 CMOS 555 타이머' },
          { k: '모드', v: '모노스테이블 / 비안정(RC 계시)' },
          { k: '전원', v: '1.5 ~ 18 V' },
          { k: '리셋', v: 'RESET(active-low)' },
          { k: '공정', v: 'CMOS(저전력)' },
          { k: '패키지', v: 'SOT-23-8 / VSSOP-8' }
        ]
      }
    },
    'LMK6B': {
      en: {
        subcategory: 'Programmable differential oscillator (BAW)',
        whatIs: 'Programmable differential clock oscillator: a built-in BAW resonator outputs a programmable-frequency differential clock (OUT_P/OUT_N); the frequency is set by the ordered part number (OPN), and the FSEL pin further selects FOUT / FOUT/2 / FOUT/4.',
        func: 'OE/ST controls output enable/standby; FSEL selects the output divider (low=/4, floating=×1, high=/2); OUT_P/OUT_N is the differential clock output. Replaces a quartz oscillator with low jitter and no external crystal.',
        usedIn: 'High-speed SerDes/Ethernet/PCIe reference clocks, communication/data-center clock sources, quartz-oscillator replacement.',
        desc: 'Programmable BAW differential oscillator, OPN-set frequency + FSEL divider, low jitter (6-pin).',
        specs: [
          { k: 'Function', v: 'Programmable differential oscillator (BAW)' },
          { k: 'Frequency', v: 'OPN-set + FSEL divider (×1 / /2 / /4)' },
          { k: 'Output', v: 'differential OUT_P/OUT_N (low jitter)' },
          { k: 'Control', v: 'OE/ST enable/standby' },
          { k: 'Package', v: '6-pin' }
        ]
      },
      ja: {
        subcategory: 'プログラマブル差動発振器（BAW）',
        whatIs: 'プログラマブル差動クロック発振器：BAW 共振器を内蔵し、プログラマブル周波数の差動クロック（OUT_P/OUT_N）を出力、周波数は注文型番（OPN）で設定、FSEL ピンで FOUT / FOUT/2 / FOUT/4 を選択可。',
        func: 'OE/ST で出力イネーブル/スタンバイ制御；FSEL で出力分周を選択（ロー=/4、浮き=×1、ハイ=/2）；OUT_P/OUT_N が差動クロック出力。水晶発振器を置き換え、低ジッタで外付け水晶不要。',
        usedIn: '高速 SerDes/イーサ/PCIe 参照クロック、通信/データセンタのクロック源、水晶発振器の置換。',
        desc: 'プログラマブル BAW 差動発振器。OPN で周波数設定＋FSEL 分周・低ジッタ（6-pin）。',
        specs: [
          { k: '機能', v: 'プログラマブル差動発振器（BAW）' },
          { k: '周波数', v: 'OPN 設定＋FSEL 分周（×1 / /2 / /4）' },
          { k: '出力', v: '差動 OUT_P/OUT_N（低ジッタ）' },
          { k: '制御', v: 'OE/ST イネーブル/スタンバイ' },
          { k: 'パッケージ', v: '6-pin' }
        ]
      },
      ko: {
        subcategory: '프로그래머블 차동 발진기(BAW)',
        whatIs: '프로그래머블 차동 클록 발진기: BAW 공진기를 내장해 프로그래머블 주파수의 차동 클록(OUT_P/OUT_N)을 출력, 주파수는 주문 부품 번호(OPN)로 설정하고 FSEL 핀으로 FOUT / FOUT/2 / FOUT/4 선택 가능.',
        func: 'OE/ST로 출력 인에이블/대기 제어; FSEL로 출력 분주 선택(로우=/4, 플로팅=×1, 하이=/2); OUT_P/OUT_N이 차동 클록 출력. 수정 발진기를 대체, 저지터·외장 수정 불필요.',
        usedIn: '고속 SerDes/이더/PCIe 참조 클록, 통신/데이터 센터 클록 소스, 수정 발진기 대체.',
        desc: '프로그래머블 BAW 차동 발진기. OPN으로 주파수 설정+FSEL 분주·저지터(6-pin).',
        specs: [
          { k: '기능', v: '프로그래머블 차동 발진기(BAW)' },
          { k: '주파수', v: 'OPN 설정+FSEL 분주(×1 / /2 / /4)' },
          { k: '출력', v: '차동 OUT_P/OUT_N(저지터)' },
          { k: '제어', v: 'OE/ST 인에이블/대기' },
          { k: '패키지', v: '6-pin' }
        ]
      }
    },
    'CDC6C-Q1': {
      en: {
        subcategory: 'Single LVCMOS clock oscillator (automotive)',
        whatIs: 'Single LVCMOS clock oscillator (automotive): outputs a fixed/ordered-frequency LVCMOS clock, with an output enable/standby pin. Tiny 4-pin, replaces a quartz oscillator.',
        func: 'OE/ST controls output enable or standby; CLK outputs the LVCMOS clock. Low jitter, AEC-Q100 automotive, as a reference clock source.',
        usedIn: 'Automotive MCU/SoC reference clock, communication clock source, quartz-oscillator replacement.',
        desc: 'Automotive single LVCMOS clock oscillator, with output enable/standby (4-pin).',
        specs: [
          { k: 'Function', v: 'Single LVCMOS clock oscillator (automotive)' },
          { k: 'Output', v: 'CLK (LVCMOS)' },
          { k: 'Control', v: 'OE/ST enable/standby' },
          { k: 'Qualification', v: 'Automotive AEC-Q100' },
          { k: 'Package', v: '4-pin' }
        ]
      },
      ja: {
        subcategory: '1 出力 LVCMOS クロック発振器（車載）',
        whatIs: '1 出力 LVCMOS クロック発振器（車載）：固定/注文周波数の LVCMOS クロックを出力、出力イネーブル/スタンバイピン付。極小 4 ピン・水晶発振器を置換。',
        func: 'OE/ST で出力イネーブルまたはスタンバイ制御；CLK が LVCMOS クロックを出力。低ジッタ・車載 AEC-Q100、参照クロック源として。',
        usedIn: '車載 MCU/SoC 参照クロック、通信クロック源、水晶発振器の置換。',
        desc: '車載 1 出力 LVCMOS クロック発振器。出力イネーブル/スタンバイ付（4-pin）。',
        specs: [
          { k: '機能', v: '1 出力 LVCMOS クロック発振器（車載）' },
          { k: '出力', v: 'CLK（LVCMOS）' },
          { k: '制御', v: 'OE/ST イネーブル/スタンバイ' },
          { k: '認証', v: '車載 AEC-Q100' },
          { k: 'パッケージ', v: '4-pin' }
        ]
      },
      ko: {
        subcategory: '단일 LVCMOS 클록 발진기(차량용)',
        whatIs: '단일 LVCMOS 클록 발진기(차량용): 고정/주문 주파수의 LVCMOS 클록을 출력, 출력 인에이블/대기 핀 포함. 초소형 4핀·수정 발진기 대체.',
        func: 'OE/ST로 출력 인에이블 또는 대기 제어; CLK가 LVCMOS 클록 출력. 저지터·차량용 AEC-Q100, 참조 클록 소스로.',
        usedIn: '차량 MCU/SoC 참조 클록, 통신 클록 소스, 수정 발진기 대체.',
        desc: '차량용 단일 LVCMOS 클록 발진기. 출력 인에이블/대기 포함(4-pin).',
        specs: [
          { k: '기능', v: '단일 LVCMOS 클록 발진기(차량용)' },
          { k: '출력', v: 'CLK(LVCMOS)' },
          { k: '제어', v: 'OE/ST 인에이블/대기' },
          { k: '인증', v: '차량용 AEC-Q100' },
          { k: '패키지', v: '4-pin' }
        ]
      }
    },
    'LMK3H2104': {
      en: {
        subcategory: 'Clock generator (4 differential outputs, HCSL/LVDS/LVCMOS)',
        whatIs: 'Clock generator: from a differential input or internal reference it produces 4 differential clock outputs (OUT0–3), each supporting LP-HCSL/LVDS/LVCMOS levels. Includes I2C/OTP configuration, GPIO, reference outputs. A clock source for multi-chip systems.',
        func: 'IN0_P/N differential input (or GPI) → internally generates 4 differential clocks OUT0–3; REF_1 LVCMOS reference output; OTP_SEL/SCL/SDA do OTP-page select or I2C configuration (determined by pin 23); GPIO/GPI general IO; each output has its own VDDO to set the level.',
        usedIn: 'Multi-chip system clock distribution, PCIe/Ethernet/SerDes reference clocks, FPGA/processor clock trees, data-center/communication.',
        desc: 'Clock generator, 4 differential outputs (HCSL/LVDS/LVCMOS), I2C/OTP config, multiple VDDO (VQFN-24).',
        specs: [
          { k: 'Function', v: 'Clock generator (4 differential outputs)' },
          { k: 'Output levels', v: 'LP-HCSL (85/100Ω) / LVDS / LVCMOS' },
          { k: 'Config', v: 'I2C or OTP (pin 23 at power-up decides)' },
          { k: 'Reference', v: 'REF_0/REF_1 outputs' },
          { k: 'Supply', v: 'VDDD/VDDA/VDD_REF + per-output VDDO_x (1.8–3.3V)' },
          { k: 'Package', v: 'VQFN-24 (RGE), EP to GND' }
        ],
        dropIn: [{ note: 'Same family; the LMK3H2108 is the 8-output version (different pin count/package, not pin-to-pin)' }]
      },
      ja: {
        subcategory: 'クロックジェネレータ（4 差動出力・HCSL/LVDS/LVCMOS）',
        whatIs: 'クロックジェネレータ：差動入力または内部基準から 4 系統の差動クロック出力（OUT0~3）を生成、各々 LP-HCSL/LVDS/LVCMOS レベルに対応。I2C/OTP 設定・GPIO・参照出力を含む。マルチチップシステムのクロック源。',
        func: 'IN0_P/N 差動入力（または GPI）→内部で 4 系統の差動クロック OUT0~3 を生成；REF_1 LVCMOS 参照出力；OTP_SEL/SCL/SDA で OTP ページ選択または I2C 設定（pin23 で決定）；GPIO/GPI 汎用 IO；各出力独立 VDDO でレベル設定。',
        usedIn: 'マルチチップシステムのクロック分配、PCIe/イーサ/SerDes 参照クロック、FPGA/プロセッサのクロックツリー、データセンタ/通信。',
        desc: 'クロックジェネレータ。4 差動出力（HCSL/LVDS/LVCMOS）・I2C/OTP 設定・複数 VDDO（VQFN-24）。',
        specs: [
          { k: '機能', v: 'クロックジェネレータ（4 差動出力）' },
          { k: '出力レベル', v: 'LP-HCSL(85/100Ω) / LVDS / LVCMOS' },
          { k: '設定', v: 'I2C または OTP（pin23 が起動時に決定）' },
          { k: '参照', v: 'REF_0/REF_1 出力' },
          { k: '電源', v: 'VDDD/VDDA/VDD_REF ＋各出力 VDDO_x（1.8~3.3V）' },
          { k: 'パッケージ', v: 'VQFN-24 (RGE)、EP は GND' }
        ],
        dropIn: [{ note: '同シリーズ；LMK3H2108 は 8 出力版（ピン数/パッケージ異なり pin-to-pin ではない）' }]
      },
      ko: {
        subcategory: '클록 발생기(4 차동 출력·HCSL/LVDS/LVCMOS)',
        whatIs: '클록 발생기: 차동 입력이나 내부 기준에서 4계통 차동 클록 출력(OUT0~3)을 생성, 각각 LP-HCSL/LVDS/LVCMOS 레벨 지원. I2C/OTP 설정·GPIO·참조 출력 포함. 다중 칩 시스템의 클록 소스.',
        func: 'IN0_P/N 차동 입력(또는 GPI) → 내부에서 4계통 차동 클록 OUT0~3 생성; REF_1 LVCMOS 참조 출력; OTP_SEL/SCL/SDA로 OTP 페이지 선택 또는 I2C 설정(pin23이 결정); GPIO/GPI 범용 IO; 각 출력 독립 VDDO로 레벨 설정.',
        usedIn: '다중 칩 시스템 클록 분배, PCIe/이더/SerDes 참조 클록, FPGA/프로세서 클록 트리, 데이터 센터/통신.',
        desc: '클록 발생기. 4 차동 출력(HCSL/LVDS/LVCMOS)·I2C/OTP 설정·다중 VDDO(VQFN-24).',
        specs: [
          { k: '기능', v: '클록 발생기(4 차동 출력)' },
          { k: '출력 레벨', v: 'LP-HCSL(85/100Ω) / LVDS / LVCMOS' },
          { k: '설정', v: 'I2C 또는 OTP(pin23이 전원 인가 시 결정)' },
          { k: '참조', v: 'REF_0/REF_1 출력' },
          { k: '전원', v: 'VDDD/VDDA/VDD_REF + 각 출력 VDDO_x(1.8~3.3V)' },
          { k: '패키지', v: 'VQFN-24 (RGE), EP는 GND' }
        ],
        dropIn: [{ note: '동일 시리즈; LMK3H2108은 8출력판(핀 수/패키지 다르며 pin-to-pin 아님)' }]
      }
    },
    'TPS7B7802-Q1': {
      en: {
        subcategory: 'Dual LDO regulator (I2C diagnostics, high-voltage automotive)',
        whatIs: 'Dual high-voltage LDO linear regulator (automotive): two independent LDOs (OUT1/OUT2) each regulate their output from a high-voltage input (IN1/IN2), with an I2C interface for configuration and diagnostics and a fault output (NERR). For automotive power rails that need monitoring.',
        func: 'Each INx→OUTx regulates linearly, output voltage preset or set by an FBx resistor divider; EN enables; I2C (SCL/SDA + ADRR0–2 address) reads diagnostics/sets config; NERR (open-drain, active-low) flags faults; RDY indicates I2C ready; VCC is the internal 1.8V control-circuit output.',
        usedIn: 'Automotive sensor/MCU power rails, dual supplies needing diagnostic monitoring, body electronics, instrument clusters.',
        desc: 'Automotive dual high-voltage LDO, I2C diagnostics/config, NERR fault output, settable output voltage (VQFN-20).',
        specs: [
          { k: 'Function', v: 'Dual high-voltage LDO (with I2C diagnostics)' },
          { k: 'Channels', v: '2 (OUT1/OUT2 independent)' },
          { k: 'Output setting', v: 'preset or FBx external divider' },
          { k: 'Interface', v: 'I2C (SCL/SDA + ADRR0–2 address)' },
          { k: 'Diagnostics', v: 'NERR fault (open-drain) + RDY ready' },
          { k: 'Qualification', v: 'Automotive AEC-Q100' },
          { k: 'Package', v: 'VQFN-20, EP to GND' }
        ]
      },
      ja: {
        subcategory: '2 出力 LDO レギュレータ（I2C 診断・高圧車載）',
        whatIs: '2 出力高圧 LDO リニアレギュレータ（車載）：2 個の独立 LDO（OUT1/OUT2）が各々高圧入力（IN1/IN2）から安定化出力、I2C インタフェースで設定と診断、故障出力（NERR）付。監視が必要な車載電源レールに好適。',
        func: '各 INx→OUTx をリニア安定化、出力電圧は既定または FBx 抵抗分圧で設定；EN イネーブル；I2C（SCL/SDA + ADRR0~2 アドレス）で診断読み出し/設定；NERR（オープンドレイン active-low）で故障通知；RDY で I2C 準備完了指示；VCC は内部 1.8V 制御回路出力。',
        usedIn: '車載センサ/MCU 電源レール、診断監視が必要な 2 電源、ボディ電子、メータ。',
        desc: '車載 2 出力高圧 LDO。I2C 診断/設定・NERR 故障出力・出力電圧設定可（VQFN-20）。',
        specs: [
          { k: '機能', v: '2 出力高圧 LDO（I2C 診断付）' },
          { k: 'チャネル', v: '2（OUT1/OUT2 独立）' },
          { k: '出力設定', v: '既定または FBx 外部分圧' },
          { k: 'インタフェース', v: 'I2C（SCL/SDA + ADRR0~2 アドレス）' },
          { k: '診断', v: 'NERR 故障（オープンドレイン）＋RDY 準備完了' },
          { k: '認証', v: '車載 AEC-Q100' },
          { k: 'パッケージ', v: 'VQFN-20、EP は GND' }
        ]
      },
      ko: {
        subcategory: '2출력 LDO 레귤레이터(I2C 진단·고압 차량용)',
        whatIs: '2출력 고압 LDO 선형 레귤레이터(차량용): 2개 독립 LDO(OUT1/OUT2)가 각각 고압 입력(IN1/IN2)에서 안정화 출력, I2C 인터페이스로 설정·진단, 고장 출력(NERR) 포함. 감시가 필요한 차량 전원 레일에 적합.',
        func: '각 INx→OUTx를 선형 안정화, 출력 전압은 기본값 또는 FBx 저항 분압으로 설정; EN 인에이블; I2C(SCL/SDA + ADRR0~2 주소)로 진단 읽기/설정; NERR(오픈 드레인 active-low)로 고장 통지; RDY로 I2C 준비 표시; VCC는 내부 1.8V 제어 회로 출력.',
        usedIn: '차량 센서/MCU 전원 레일, 진단 감시가 필요한 이중 전원, 바디 전자, 계기.',
        desc: '차량용 2출력 고압 LDO. I2C 진단/설정·NERR 고장 출력·출력 전압 설정 가능(VQFN-20).',
        specs: [
          { k: '기능', v: '2출력 고압 LDO(I2C 진단 포함)' },
          { k: '채널', v: '2(OUT1/OUT2 독립)' },
          { k: '출력 설정', v: '기본값 또는 FBx 외부 분압' },
          { k: '인터페이스', v: 'I2C(SCL/SDA + ADRR0~2 주소)' },
          { k: '진단', v: 'NERR 고장(오픈 드레인) + RDY 준비' },
          { k: '인증', v: '차량용 AEC-Q100' },
          { k: '패키지', v: 'VQFN-20, EP는 GND' }
        ]
      }
    },
    'ADS122C14': {
      en: {
        subcategory: 'Precision ADC (Delta-Sigma, I2C, 24-bit)',
        whatIs: 'Precision analog-to-digital converter (ADC): 24-bit, I2C, up to 8 inputs. Same package/pinout as the 16-bit ADS112C14, a higher-resolution version.',
        func: 'Digitizes tiny sensor signals at high resolution; integrates PGA, programmable reference, dual current sources and a temperature sensor. Delta-Sigma architecture (oversampling + noise shaping), ideal for slow-but-accurate measurements (temperature, bridges, pressure). 24-bit beats the ADS112C14’s 16-bit.',
        usedIn: 'Industrial sensor front ends (RTD/thermocouple, pressure/strain bridges, flow), PLC/DCS analog inputs, thermostats, patient monitoring.',
        desc: '24-bit, 8-channel ΔΣ ADC with PGA, programmable reference, dual current sources, temperature sensor and I2C; same pinout as ADS112C14 (WQFN-16 RTE).',
        specs: [
          { k: 'Resolution', v: '24-bit' },
          { k: 'Architecture', v: 'Delta-Sigma (ΔΣ)' },
          { k: 'Channels', v: '8-input MUX; differential/single-ended' },
          { k: 'Max sample rate', v: '64 kSPS' },
          { k: 'PGA gain', v: '0.5 – 256' },
          { k: 'Analog supply AVDD', v: '1.74 – 3.6 V' },
          { k: 'Digital supply DVDD', v: '1.65 – 3.6 V' },
          { k: 'Interface', v: 'I2C (Sm/Fm/Fm+), address pins A0/A1' },
          { k: 'Integrated', v: 'temp sensor, dual current sources, 4× GPIO, CRC' },
          { k: 'Package', v: 'WQFN-16 (RTE) 3.0×3.0mm' }
        ],
        dropIn: [{ note: 'Same RTE WQFN-16, identical pinout (16-bit version)' }]
      },
      ja: {
        subcategory: '高精度 ADC（Delta-Sigma、I2C、24-bit）',
        whatIs: '高精度 A/D コンバータ（ADC）：24 ビット・I2C・最大 8 入力。16-bit の ADS112C14 と同パッケージ・ピン配置の高分解能版。',
        func: 'センサの微小アナログ信号を高分解能でデジタル化。PGA・プログラマブル基準・デュアル電流源・温度センサ内蔵。Delta-Sigma 構成（オーバーサンプリング＋ノイズシェーピング）で「低速だが高精度」の計測（温度・ブリッジ・圧力）に最適。24-bit は ADS112C14 の 16-bit を上回る。',
        usedIn: '産業用センサフロントエンド（RTD/熱電対、圧力/ひずみブリッジ、流量）、PLC/DCS アナログ入力、温度調節器、患者モニタ。',
        desc: '24-bit・8ch ΔΣ ADC。PGA・プログラマブル基準・デュアル電流源・温度センサ・I2C 内蔵；ADS112C14 とピン互換（WQFN-16 RTE）。',
        specs: [
          { k: '分解能', v: '24-bit' },
          { k: 'アーキテクチャ', v: 'Delta-Sigma (ΔΣ)' },
          { k: 'チャネル', v: '8 入力 MUX；差動/シングルエンド' },
          { k: '最大サンプルレート', v: '64 kSPS' },
          { k: 'PGA ゲイン', v: '0.5 ~ 256' },
          { k: 'アナログ電源 AVDD', v: '1.74 ~ 3.6 V' },
          { k: 'デジタル電源 DVDD', v: '1.65 ~ 3.6 V' },
          { k: 'インタフェース', v: 'I2C（Sm/Fm/Fm+）、アドレスピン A0/A1' },
          { k: '内蔵機能', v: '温度センサ、デュアル電流源、4× GPIO、CRC' },
          { k: 'パッケージ', v: 'WQFN-16 (RTE) 3.0×3.0mm' }
        ],
        dropIn: [{ note: '同一 RTE WQFN-16・ピン配置完全互換（16-bit 版）' }]
      },
      ko: {
        subcategory: '정밀 ADC(Delta-Sigma, I2C, 24-bit)',
        whatIs: '정밀 아날로그-디지털 변환기(ADC): 24비트·I2C·최대 8입력. 16-bit ADS112C14와 같은 패키지·핀 배치의 고분해능판.',
        func: '센서의 미소 아날로그 신호를 고분해능으로 디지털화. PGA·프로그래머블 기준·듀얼 전류원·온도 센서 내장. Delta-Sigma 구조(오버샘플링+노이즈 셰이핑)로 "느리지만 정확한" 계측(온도·브리지·압력)에 최적. 24-bit는 ADS112C14의 16-bit를 능가.',
        usedIn: '산업 센서 프론트엔드(RTD/열전대, 압력/스트레인 브리지, 유량), PLC/DCS 아날로그 입력, 온도조절기, 환자 모니터링.',
        desc: '24-bit·8채널 ΔΣ ADC. PGA·프로그래머블 기준·듀얼 전류원·온도 센서·I2C 내장; ADS112C14와 핀 호환(WQFN-16 RTE).',
        specs: [
          { k: '분해능', v: '24-bit' },
          { k: '아키텍처', v: 'Delta-Sigma (ΔΣ)' },
          { k: '채널', v: '8입력 MUX; 차동/싱글엔드' },
          { k: '최대 샘플링', v: '64 kSPS' },
          { k: 'PGA 이득', v: '0.5 ~ 256' },
          { k: '아날로그 전원 AVDD', v: '1.74 ~ 3.6 V' },
          { k: '디지털 전원 DVDD', v: '1.65 ~ 3.6 V' },
          { k: '인터페이스', v: 'I2C(Sm/Fm/Fm+), 주소 핀 A0/A1' },
          { k: '내장 기능', v: '온도 센서, 듀얼 전류원, 4× GPIO, CRC' },
          { k: '패키지', v: 'WQFN-16 (RTE) 3.0×3.0mm' }
        ],
        dropIn: [{ note: '동일 RTE WQFN-16·핀 배치 완전 호환(16-bit 버전)' }]
      }
    }
  };
  Object.assign(window.IC_I18N, T);
})();
/* batch 7: entries 90-104 */
(function () {
  var T = {
    'AMC0206M05': {
      en: {
        subcategory: 'Isolated ΔΣ modulator (±50mV input)',
        whatIs: 'Isolated Delta-Sigma modulator: measures a small ±50mV analog signal on the high-voltage side (suited to low-drop shunt current sensing), converts it into a bitstream (DOUT) sent across the isolation barrier to the low-voltage side. Same pinout as AMC0206M25, ±50mV range.',
        func: 'High-side INP/INN differential input (±50mV) is ΔΣ-modulated into a DOUT bitstream across isolation; CLKIN external clock. AVDD/AGND high side, DVDD/DGND low side. The ±50mV range cuts shunt-resistor power loss.',
        usedIn: 'Motor/inverter phase-current isolated measurement (small shunt, low loss), isolated current sensing, power feedback.',
        desc: 'Isolated ΔΣ modulator, ±50mV input, external clock CLKIN, bitstream DOUT (wide-body SOIC-8).',
        specs: [
          { k: 'Function', v: 'Isolated ΔΣ modulator' },
          { k: 'Input range', v: '±50mV (differential)' },
          { k: 'Clock', v: 'CLKIN external clock input' },
          { k: 'Output', v: 'DOUT bitstream (needs external sinc filter)' },
          { k: 'Supply', v: 'AVDD (high side) + DVDD (low side)' },
          { k: 'Package', v: 'wide-body SOIC-8 (isolated)' }
        ],
        dropIn: [
          { note: 'Same pinout; AMC0306M05 is the reinforced-isolation version' },
          { note: 'Same pinout; ±250mV input range (not ±50mV)' }
        ]
      },
      ja: {
        subcategory: '絶縁 ΔΣ モジュレータ（±50mV 入力）',
        whatIs: '絶縁 Delta-Sigma モジュレータ：高圧側で ±50mV の小アナログ信号を計測（低ドロップシャント電流計測向き）し、ビットストリーム（DOUT）に変換して絶縁バリア越しに低圧側へ。AMC0206M25 とピン互換・±50mV レンジ。',
        func: '高圧側 INP/INN 差動入力（±50mV）を ΔΣ 変調し DOUT ビットストリームで絶縁越しに出力；CLKIN 外部クロック。AVDD/AGND 高圧側、DVDD/DGND 低圧側。±50mV レンジでシャント抵抗の損失を低減。',
        usedIn: 'モータ/インバータ相電流絶縁計測（小シャント・低損失）、絶縁電流検出、電源帰還。',
        desc: '絶縁 ΔΣ モジュレータ。±50mV 入力・外部クロック CLKIN・ビットストリーム DOUT（SOIC-8 ワイドボディ）。',
        specs: [
          { k: '機能', v: '絶縁 ΔΣ モジュレータ' },
          { k: '入力範囲', v: '±50mV（差動）' },
          { k: 'クロック', v: 'CLKIN 外部クロック入力' },
          { k: '出力', v: 'DOUT ビットストリーム（外部 sinc フィルタ必要）' },
          { k: '電源', v: 'AVDD（高圧側）＋DVDD（低圧側）' },
          { k: 'パッケージ', v: 'SOIC-8 ワイドボディ（絶縁）' }
        ],
        dropIn: [
          { note: '同ピン配置；AMC0306M05 は強化絶縁（reinforced）版' },
          { note: '同ピン配置；入力範囲 ±250mV（±50mV ではない）' }
        ]
      },
      ko: {
        subcategory: '절연 ΔΣ 모듈레이터(±50mV 입력)',
        whatIs: '절연 Delta-Sigma 모듈레이터: 고압 측에서 ±50mV 소 아날로그 신호를 계측(저강하 션트 전류 계측용)해 비트스트림(DOUT)으로 변환, 절연 배리어 너머 저압 측으로. AMC0206M25와 핀 호환·±50mV 범위.',
        func: '고압 측 INP/INN 차동 입력(±50mV)을 ΔΣ 변조해 DOUT 비트스트림으로 절연 너머 출력; CLKIN 외부 클록. AVDD/AGND 고압 측, DVDD/DGND 저압 측. ±50mV 범위로 션트 저항 손실 저감.',
        usedIn: '모터/인버터 상전류 절연 계측(소 션트·저손실), 절연 전류 검출, 전원 피드백.',
        desc: '절연 ΔΣ 모듈레이터. ±50mV 입력·외부 클록 CLKIN·비트스트림 DOUT(SOIC-8 와이드바디).',
        specs: [
          { k: '기능', v: '절연 ΔΣ 모듈레이터' },
          { k: '입력 범위', v: '±50mV(차동)' },
          { k: '클록', v: 'CLKIN 외부 클록 입력' },
          { k: '출력', v: 'DOUT 비트스트림(외부 sinc 필터 필요)' },
          { k: '전원', v: 'AVDD(고압 측) + DVDD(저압 측)' },
          { k: '패키지', v: 'SOIC-8 와이드바디(절연)' }
        ],
        dropIn: [
          { note: '동일 핀 배치; AMC0306M05는 강화 절연(reinforced)판' },
          { note: '동일 핀 배치; 입력 범위 ±250mV(±50mV 아님)' }
        ]
      }
    },
    'AMC0306M05': {
      en: {
        subcategory: 'Isolated ΔΣ modulator (±50mV, reinforced isolation)',
        whatIs: 'Isolated Delta-Sigma modulator (reinforced isolation): ±50mV input, external clock, bitstream output. Same pinout as AMC0206M05 with reinforced isolation grade (higher working voltage / stricter safety).',
        func: 'Same as AMC0206M05: high-side ±50mV differential input ΔΣ-modulated into DOUT across isolation, CLKIN external clock. Reinforced isolation suits higher-voltage/safety requirements.',
        usedIn: 'High-voltage motor/inverter phase-current isolated measurement, current sensing needing reinforced isolation, power feedback.',
        desc: 'Reinforced-isolation ΔΣ modulator, ±50mV, external clock CLKIN, bitstream DOUT (wide-body SOIC-8).',
        specs: [
          { k: 'Function', v: 'Isolated ΔΣ modulator (reinforced isolation)' },
          { k: 'Input range', v: '±50mV' },
          { k: 'Isolation', v: 'reinforced' },
          { k: 'Clock', v: 'CLKIN external' },
          { k: 'Output', v: 'DOUT bitstream' },
          { k: 'Supply', v: 'AVDD (high side) + DVDD (low side)' },
          { k: 'Package', v: 'wide-body SOIC-8 (isolated)' }
        ],
        dropIn: [{ note: 'Same pinout; AMC0206M05 is the basic-isolation version' }]
      },
      ja: {
        subcategory: '絶縁 ΔΣ モジュレータ（±50mV・強化絶縁）',
        whatIs: '絶縁 Delta-Sigma モジュレータ（強化絶縁 reinforced）：±50mV 入力・外部クロック・ビットストリーム出力。AMC0206M05 とピン互換、絶縁等級が強化型（より高い動作電圧/厳しい安規）。',
        func: 'AMC0206M05 と同じ：高圧側 ±50mV 差動入力を ΔΣ 変調し DOUT を絶縁越しに出力、CLKIN 外部クロック。強化絶縁で高圧/安規要求に対応。',
        usedIn: '高圧モータ/インバータ相電流絶縁計測、強化絶縁が必要な電流検出、電源帰還。',
        desc: '強化絶縁 ΔΣ モジュレータ。±50mV・外部クロック CLKIN・ビットストリーム DOUT（SOIC-8 ワイドボディ）。',
        specs: [
          { k: '機能', v: '絶縁 ΔΣ モジュレータ（強化絶縁）' },
          { k: '入力範囲', v: '±50mV' },
          { k: '絶縁', v: 'reinforced（強化型）' },
          { k: 'クロック', v: 'CLKIN 外部' },
          { k: '出力', v: 'DOUT ビットストリーム' },
          { k: '電源', v: 'AVDD（高圧側）＋DVDD（低圧側）' },
          { k: 'パッケージ', v: 'SOIC-8 ワイドボディ（絶縁）' }
        ],
        dropIn: [{ note: '同ピン配置；AMC0206M05 は基本絶縁（basic）版' }]
      },
      ko: {
        subcategory: '절연 ΔΣ 모듈레이터(±50mV·강화 절연)',
        whatIs: '절연 Delta-Sigma 모듈레이터(강화 절연 reinforced): ±50mV 입력·외부 클록·비트스트림 출력. AMC0206M05와 핀 호환, 절연 등급이 강화형(더 높은 동작 전압/엄격한 안전 규격).',
        func: 'AMC0206M05와 동일: 고압 측 ±50mV 차동 입력을 ΔΣ 변조해 DOUT을 절연 너머 출력, CLKIN 외부 클록. 강화 절연으로 고압/안전 규격 요구 대응.',
        usedIn: '고압 모터/인버터 상전류 절연 계측, 강화 절연이 필요한 전류 검출, 전원 피드백.',
        desc: '강화 절연 ΔΣ 모듈레이터. ±50mV·외부 클록 CLKIN·비트스트림 DOUT(SOIC-8 와이드바디).',
        specs: [
          { k: '기능', v: '절연 ΔΣ 모듈레이터(강화 절연)' },
          { k: '입력 범위', v: '±50mV' },
          { k: '절연', v: 'reinforced(강화형)' },
          { k: '클록', v: 'CLKIN 외부' },
          { k: '출력', v: 'DOUT 비트스트림' },
          { k: '전원', v: 'AVDD(고압 측) + DVDD(저압 측)' },
          { k: '패키지', v: 'SOIC-8 와이드바디(절연)' }
        ],
        dropIn: [{ note: '동일 핀 배치; AMC0206M05는 기본 절연(basic)판' }]
      }
    },
    'TPS562246B': {
      en: {
        subcategory: 'Synchronous buck converter (integrated MOSFETs)',
        whatIs: 'Synchronous buck (step-down) DC-DC converter: integrates high- and low-side NFETs to step a higher input voltage down to a stable lower output. Few external parts, fixed frequency, with enable and feedback.',
        func: 'VIN in → internal high/low-side FETs switch the SW node → external inductor/caps filter to a stable output; FB feedback divider sets the output voltage; EN high enables; BST powers the high-side gate-drive bootstrap. For on-board point-of-load power.',
        usedIn: 'On-board point-of-load (POL) power, SoC/FPGA/DDR rails, consumer/industrial step-down supplies.',
        desc: 'Synchronous buck converter (integrated MOSFETs), fixed frequency, EN enable, FB-adjustable output (SOT-23-6).',
        specs: [
          { k: 'Function', v: 'Synchronous buck converter (integrated MOSFETs)' },
          { k: 'Feedback', v: 'FB external divider, adjustable output' },
          { k: 'Enable', v: 'EN (active-high)' },
          { k: 'Bootstrap', v: 'BST (0.1µF to SW)' },
          { k: 'Package', v: 'SOT-23-6' }
        ],
        dropIn: [
          { note: 'Same family, same pinout (verify frequency/compensation differences)' },
          { note: 'Same family, same pinout (different current/frequency specs)' }
        ]
      },
      ja: {
        subcategory: '同期整流降圧コンバータ（MOSFET 統合）',
        whatIs: '同期整流降圧（buck）DC-DC コンバータ：ハイ/ローサイド NFET を統合し、高い入力電圧を安定した低出力へ降圧。外付け部品が少なく、固定周波数、イネーブルと帰還付。',
        func: 'VIN 入力→内部ハイ/ローサイド FET が SW ノードをスイッチ→外付けインダクタ/コンデンサで安定出力に濾波；FB 帰還分圧で出力電圧設定；EN ハイで有効；BST がハイサイドゲート駆動のブートストラップに供給。基板上のポイントオブロード電源に。',
        usedIn: '基板上ポイントオブロード（POL）電源、SoC/FPGA/DDR レール、民生/産業の降圧電源。',
        desc: '同期整流降圧コンバータ（MOSFET 統合）。固定周波数・EN イネーブル・FB 可変出力（SOT-23-6）。',
        specs: [
          { k: '機能', v: '同期整流降圧コンバータ（MOSFET 統合）' },
          { k: '帰還', v: 'FB 外部分圧で出力可変' },
          { k: 'イネーブル', v: 'EN（ハイ有効）' },
          { k: 'ブートストラップ', v: 'BST（0.1µF を SW へ）' },
          { k: 'パッケージ', v: 'SOT-23-6' }
        ],
        dropIn: [
          { note: '同シリーズ同ピン配置（周波数/補償の差異を確認）' },
          { note: '同シリーズ同ピン配置（電流/周波数仕様が異なる）' }
        ]
      },
      ko: {
        subcategory: '동기 벅 컨버터(MOSFET 통합)',
        whatIs: '동기 벅(강압) DC-DC 컨버터: 하이/로우사이드 NFET을 통합해 높은 입력 전압을 안정된 낮은 출력으로 강압. 외부 부품이 적고 고정 주파수, 인에이블과 피드백 포함.',
        func: 'VIN 입력 → 내부 하이/로우사이드 FET이 SW 노드를 스위칭 → 외부 인덕터/커패시터로 안정 출력 필터링; FB 피드백 분압으로 출력 전압 설정; EN 하이로 활성; BST가 하이사이드 게이트 구동 부트스트랩에 공급. 보드 상 포인트 오브 로드 전원용.',
        usedIn: '보드 상 포인트 오브 로드(POL) 전원, SoC/FPGA/DDR 레일, 소비자/산업 강압 전원.',
        desc: '동기 벅 컨버터(MOSFET 통합). 고정 주파수·EN 인에이블·FB 가변 출력(SOT-23-6).',
        specs: [
          { k: '기능', v: '동기 벅 컨버터(MOSFET 통합)' },
          { k: '피드백', v: 'FB 외부 분압으로 출력 가변' },
          { k: '인에이블', v: 'EN(하이 유효)' },
          { k: '부트스트랩', v: 'BST(0.1µF를 SW로)' },
          { k: '패키지', v: 'SOT-23-6' }
        ],
        dropIn: [
          { note: '동일 시리즈 동일 핀 배치(주파수/보상 차이 확인)' },
          { note: '동일 시리즈 동일 핀 배치(전류/주파수 사양 다름)' }
        ]
      }
    },
    'LMG1020-Q1': {
      en: {
        subcategory: 'Low-side GaN/MOSFET gate driver (ultra-fast)',
        whatIs: 'Ultra-fast low-side gate driver: amplifies a logic-level input (IN+/IN–) into a high-current gate-drive output (OUTH/OUTL) to switch a GaN FET or MOSFET quickly. Separate pull-up/pull-down outputs allow independent switching-speed tuning. Tiny WCSP.',
        func: 'IN+/IN– differential logic input → separate OUTH (pull-up) / OUTL (pull-down) outputs drive the FET gate; separate outputs allow individual series resistors to set rise/fall speed. Ultra-short propagation delay, suited to high-frequency (MHz) GaN applications.',
        usedIn: 'GaN FET high-frequency driving, LiDAR laser driving, high-frequency DC-DC, wireless charging, class-E amplifiers.',
        desc: 'Ultra-fast low-side GaN/MOSFET gate driver, separate pull-up/pull-down outputs, tiny WCSP (DSBGA-6).',
        specs: [
          { k: 'Function', v: 'Low-side ultra-fast gate driver (GaN/MOSFET)' },
          { k: 'Input', v: 'IN+/IN– logic level' },
          { k: 'Output', v: 'separate OUTH/OUTL (independent speed setting)' },
          { k: 'Speed', v: 'ultra-short propagation delay (MHz-class GaN)' },
          { k: 'Qualification', v: 'Automotive AEC-Q100' },
          { k: 'Package', v: 'DSBGA-6 (WCSP); balls A1/A2/B1/B2/C1/C2' }
        ]
      },
      ja: {
        subcategory: 'ローサイド GaN/MOSFET ゲートドライバ（超高速）',
        whatIs: '超高速ローサイドゲートドライバ：ロジックレベル入力（IN+/IN–）を大電流ゲート駆動出力（OUTH/OUTL）に増幅し、GaN FET や MOSFET を高速スイッチ。プル/プルダウン出力が分離され、スイッチ速度を個別調整可。極小 WCSP。',
        func: 'IN+/IN– 差動ロジック入力→分離した OUTH（プルアップ）/OUTL（プルダウン）出力が FET ゲートを駆動；分離出力で各々直列抵抗を入れ立上り/立下り速度を個別設定。超短伝搬遅延で高周波（MHz）GaN 用途に好適。',
        usedIn: 'GaN FET 高周波駆動、LiDAR レーザ駆動、高周波 DC-DC、ワイヤレス充電、E 級増幅。',
        desc: '超高速ローサイド GaN/MOSFET ゲートドライバ。分離プル/プルダウン出力・極小 WCSP（DSBGA-6）。',
        specs: [
          { k: '機能', v: 'ローサイド超高速ゲートドライバ（GaN/MOSFET）' },
          { k: '入力', v: 'IN+/IN– ロジックレベル' },
          { k: '出力', v: '分離 OUTH/OUTL（スイッチ速度を個別設定）' },
          { k: '速度', v: '超短伝搬遅延（MHz 級 GaN）' },
          { k: '認証', v: '車載 AEC-Q100' },
          { k: 'パッケージ', v: 'DSBGA-6 (WCSP)；ボール A1/A2/B1/B2/C1/C2' }
        ]
      },
      ko: {
        subcategory: '로우사이드 GaN/MOSFET 게이트 드라이버(초고속)',
        whatIs: '초고속 로우사이드 게이트 드라이버: 로직 레벨 입력(IN+/IN–)을 대전류 게이트 구동 출력(OUTH/OUTL)으로 증폭해 GaN FET나 MOSFET을 빠르게 스위칭. 분리된 풀업/풀다운 출력으로 스위칭 속도 개별 조정 가능. 초소형 WCSP.',
        func: 'IN+/IN– 차동 로직 입력 → 분리된 OUTH(풀업)/OUTL(풀다운) 출력이 FET 게이트 구동; 분리 출력으로 각각 직렬 저항을 넣어 상승/하강 속도 개별 설정. 초단 전파 지연으로 고주파(MHz) GaN 용도에 적합.',
        usedIn: 'GaN FET 고주파 구동, LiDAR 레이저 구동, 고주파 DC-DC, 무선 충전, E급 증폭.',
        desc: '초고속 로우사이드 GaN/MOSFET 게이트 드라이버. 분리 풀업/풀다운 출력·초소형 WCSP(DSBGA-6).',
        specs: [
          { k: '기능', v: '로우사이드 초고속 게이트 드라이버(GaN/MOSFET)' },
          { k: '입력', v: 'IN+/IN– 로직 레벨' },
          { k: '출력', v: '분리 OUTH/OUTL(스위칭 속도 개별 설정)' },
          { k: '속도', v: '초단 전파 지연(MHz급 GaN)' },
          { k: '인증', v: '차량용 AEC-Q100' },
          { k: '패키지', v: 'DSBGA-6 (WCSP); 볼 A1/A2/B1/B2/C1/C2' }
        ]
      }
    },
    'UCC57142-Q1': {
      en: {
        subcategory: 'Single-channel gate driver (with enable/fault + overcurrent protection)',
        whatIs: 'Single-channel gate driver: amplifies a control signal (IN) into a high-current gate-drive output (OUT) to drive a power FET/IGBT, with enable/fault reporting (EN/FLT) and current-sense (OCP) overcurrent protection.',
        func: 'IN→OUT gate drive; EN/FLT dual-function pin (enable + fault report); OCP current-sense input for overcurrent protection; VDD bias, COM ground. For half-bridge/single-switch power drive.',
        usedIn: 'Power MOSFET/IGBT driving, power conversion, motor-drive stages, power protection.',
        desc: 'Single-channel gate driver, with EN/FLT + OCP overcurrent protection (SOT-23-6).',
        specs: [
          { k: 'Function', v: 'Single-channel gate driver (with overcurrent protection)' },
          { k: 'Protection', v: 'OCP current sense' },
          { k: 'Control', v: 'IN input + EN/FLT enable/fault' },
          { k: 'Supply', v: 'VDD bias' },
          { k: 'Qualification', v: 'Automotive AEC-Q100' },
          { k: 'Package', v: 'SOT-23-6' }
        ],
        dropIn: [{ note: 'Same family, same pinout (higher drive-current version)' }]
      },
      ja: {
        subcategory: '1 チャネルゲートドライバ（イネーブル/故障＋過電流保護付）',
        whatIs: '1 チャネルゲートドライバ：制御信号（IN）を大電流ゲート駆動出力（OUT）に増幅しパワー FET/IGBT を駆動、イネーブル/故障報告（EN/FLT）と電流検出（OCP）過電流保護を含む。',
        func: 'IN→OUT ゲート駆動；EN/FLT 兼用ピン（イネーブル＋故障報告）；OCP 電流検出入力で過電流保護；VDD バイアス、COM 接地。ハーフブリッジ/シングルスイッチのパワー駆動に。',
        usedIn: 'パワー MOSFET/IGBT 駆動、電源変換、モータ駆動段、電源保護。',
        desc: '1 チャネルゲートドライバ。EN/FLT＋OCP 過電流保護付（SOT-23-6）。',
        specs: [
          { k: '機能', v: '1 チャネルゲートドライバ（過電流保護付）' },
          { k: '保護', v: 'OCP 電流検出' },
          { k: '制御', v: 'IN 入力＋EN/FLT イネーブル/故障' },
          { k: '電源', v: 'VDD バイアス' },
          { k: '認証', v: '車載 AEC-Q100' },
          { k: 'パッケージ', v: 'SOT-23-6' }
        ],
        dropIn: [{ note: '同シリーズ同ピン配置（駆動電流が大きい版）' }]
      },
      ko: {
        subcategory: '단일 채널 게이트 드라이버(인에이블/고장+과전류 보호)',
        whatIs: '단일 채널 게이트 드라이버: 제어 신호(IN)를 대전류 게이트 구동 출력(OUT)으로 증폭해 전력 FET/IGBT를 구동, 인에이블/고장 보고(EN/FLT)와 전류 감지(OCP) 과전류 보호 포함.',
        func: 'IN→OUT 게이트 구동; EN/FLT 겸용 핀(인에이블+고장 보고); OCP 전류 감지 입력으로 과전류 보호; VDD 바이어스, COM 접지. 하프 브리지/단일 스위치 전력 구동용.',
        usedIn: '전력 MOSFET/IGBT 구동, 전력 변환, 모터 구동단, 전원 보호.',
        desc: '단일 채널 게이트 드라이버. EN/FLT+OCP 과전류 보호(SOT-23-6).',
        specs: [
          { k: '기능', v: '단일 채널 게이트 드라이버(과전류 보호 포함)' },
          { k: '보호', v: 'OCP 전류 감지' },
          { k: '제어', v: 'IN 입력 + EN/FLT 인에이블/고장' },
          { k: '전원', v: 'VDD 바이어스' },
          { k: '인증', v: '차량용 AEC-Q100' },
          { k: '패키지', v: 'SOT-23-6' }
        ],
        dropIn: [{ note: '동일 시리즈 동일 핀 배치(구동 전류가 큰 버전)' }]
      }
    },
    'TRF1218': {
      en: {
        subcategory: 'Single-ended-to-differential RF amplifier (near DC – 25GHz)',
        whatIs: 'Wideband single-ended-to-differential RF amplifier: amplifies a single-ended RF signal (INP) and converts it to a differential output (OUTP/OUTM), with bandwidth from near DC to 25GHz. For differential driving of high-speed ADC/DAC or signal-chain amplification.',
        func: 'INP single-ended input (INM AC-coupled) is amplified and converted to a differential OUTP/OUTM output; PD powers down (0=enabled, 1=off, supports 1.8/3.3V logic); VDD 5V. Very wide bandwidth suits high-speed data-converter front ends.',
        usedIn: 'High-speed ADC/DAC differential driving, wideband RF/microwave signal chains, test & measurement, optical communication.',
        desc: 'Near-DC to 25GHz single-ended-to-differential RF amplifier, differential output, PD shutdown, 5V (12-pin with thermal pad).',
        specs: [
          { k: 'Function', v: 'Single-ended-to-differential RF amplifier' },
          { k: 'Bandwidth', v: 'near DC – 25 GHz' },
          { k: 'Output', v: 'differential OUTP/OUTM' },
          { k: 'Shutdown', v: 'PD (0=enabled, 1=off)' },
          { k: 'Supply', v: '5V' },
          { k: 'Package', v: '12-pin, EP to GND' }
        ]
      },
      ja: {
        subcategory: 'シングルエンド→差動 RF アンプ（ほぼ DC ~ 25GHz）',
        whatIs: '広帯域シングルエンド→差動 RF アンプ：シングルエンド RF 信号（INP）を増幅し差動出力（OUTP/OUTM）に変換、帯域はほぼ DC から 25GHz。高速 ADC/DAC の差動駆動や信号チェーン増幅に。',
        func: 'INP シングルエンド入力（INM は AC 結合コンデンサ）を増幅し差動 OUTP/OUTM 出力に変換；PD 電源遮断（0=有効、1=遮断、1.8/3.3V ロジック対応）；VDD 5V。超広帯域で高速データコンバータのフロントエンドに好適。',
        usedIn: '高速 ADC/DAC 差動駆動、広帯域 RF/マイクロ波信号チェーン、テスト&計測、光通信。',
        desc: 'ほぼ DC~25GHz シングルエンド→差動 RF アンプ。差動出力・PD 遮断・5V（12-pin サーマルパッド付）。',
        specs: [
          { k: '機能', v: 'シングルエンド→差動 RF アンプ' },
          { k: '帯域', v: 'ほぼ DC ~ 25 GHz' },
          { k: '出力', v: '差動 OUTP/OUTM' },
          { k: '遮断', v: 'PD（0=有効、1=遮断）' },
          { k: '電源', v: '5V' },
          { k: 'パッケージ', v: '12-pin、EP は GND' }
        ]
      },
      ko: {
        subcategory: '싱글엔드→차동 RF 앰프(거의 DC ~ 25GHz)',
        whatIs: '광대역 싱글엔드→차동 RF 앰프: 싱글엔드 RF 신호(INP)를 증폭해 차동 출력(OUTP/OUTM)으로 변환, 대역은 거의 DC부터 25GHz. 고속 ADC/DAC 차동 구동이나 신호 체인 증폭용.',
        func: 'INP 싱글엔드 입력(INM은 AC 결합 커패시터)을 증폭해 차동 OUTP/OUTM 출력으로 변환; PD 전원 차단(0=활성, 1=차단, 1.8/3.3V 로직 지원); VDD 5V. 초광대역으로 고속 데이터 컨버터 프론트엔드에 적합.',
        usedIn: '고속 ADC/DAC 차동 구동, 광대역 RF/마이크로파 신호 체인, 테스트&계측, 광통신.',
        desc: '거의 DC~25GHz 싱글엔드→차동 RF 앰프. 차동 출력·PD 차단·5V(12-pin 서멀 패드 포함).',
        specs: [
          { k: '기능', v: '싱글엔드→차동 RF 앰프' },
          { k: '대역', v: '거의 DC ~ 25 GHz' },
          { k: '출력', v: '차동 OUTP/OUTM' },
          { k: '차단', v: 'PD(0=활성, 1=차단)' },
          { k: '전원', v: '5V' },
          { k: '패키지', v: '12-pin, EP는 GND' }
        ]
      }
    },
    'DAC60516W': {
      en: {
        subcategory: '16-channel 12-bit DAC (SPI/I2C, buffered voltage output)',
        whatIs: '16-channel 12-bit digital-to-analog converter (DAC): one chip simultaneously outputs 16 independent buffered voltages (OUT0–OUT15), written over SPI or I2C. LDAC for synchronous update, external/internal reference. Tiny WCSP ball-grid package.',
        func: 'The host writes each channel’s code over SPI (SDI/SDO/SCLK) or I2C (SDA/SCL + A0/A1 address) → 16 buffered voltage outputs; LDAC (active-low) synchronously updates all channels; VREF sets full scale; VIO is the digital-interface voltage; RESET resets. For multi-channel analog control/bias.',
        usedIn: 'Multi-channel analog bias/control, optical-module/laser bias, programmable voltage sources, sensor calibration, multi-channel actuation.',
        desc: '16-channel 12-bit buffered-voltage-output DAC, SPI/I2C, LDAC sync, external/internal reference (WCSP ball grid).',
        specs: [
          { k: 'Function', v: '16-channel 12-bit voltage-output DAC' },
          { k: 'Channels', v: '16 (OUT0–OUT15, buffered output)' },
          { k: 'Interface', v: 'SPI or I2C (A0/A1 address)' },
          { k: 'Sync', v: 'LDAC (active-low synchronous update)' },
          { k: 'Reference', v: 'VREF (external/internal)' },
          { k: 'Supply', v: 'AVDD + VIO (digital interface)' },
          { k: 'Package', v: 'DSBGA (WCSP) ball grid' }
        ]
      },
      ja: {
        subcategory: '16 チャネル 12-bit DAC（SPI/I2C・バッファ電圧出力）',
        whatIs: '16 チャネル 12 ビット D/A コンバータ（DAC）：1 チップで 16 系統の独立バッファ電圧（OUT0~OUT15）を同時出力、SPI か I2C で書き込み。LDAC で同期更新、外部/内部基準。極小 WCSP ボールグリッドパッケージ。',
        func: 'ホストが SPI（SDI/SDO/SCLK）または I2C（SDA/SCL + A0/A1 アドレス）で各チャネルのコード値を書込み→16 系統のバッファ電圧出力；LDAC（active-low）で全チャネル同期更新；VREF でフルスケール設定；VIO デジタルインタフェース電圧；RESET リセット。多系統アナログ制御/バイアスに。',
        usedIn: '多系統アナログバイアス/制御、光モジュール/レーザバイアス、プログラマブル電圧源、センサ校正、多チャネル駆動。',
        desc: '16 チャネル 12-bit バッファ電圧出力 DAC。SPI/I2C・LDAC 同期・外/内部基準（WCSP ボールグリッド）。',
        specs: [
          { k: '機能', v: '16 チャネル 12-bit 電圧出力 DAC' },
          { k: 'チャネル', v: '16（OUT0~OUT15、バッファ出力）' },
          { k: 'インタフェース', v: 'SPI または I2C（A0/A1 アドレス）' },
          { k: '同期', v: 'LDAC（active-low 同期更新）' },
          { k: '基準', v: 'VREF（外部/内部）' },
          { k: '電源', v: 'AVDD + VIO（デジタルインタフェース）' },
          { k: 'パッケージ', v: 'DSBGA (WCSP) ボールグリッド' }
        ]
      },
      ko: {
        subcategory: '16채널 12-bit DAC(SPI/I2C·버퍼 전압 출력)',
        whatIs: '16채널 12비트 D/A 변환기(DAC): 한 칩으로 16계통 독립 버퍼 전압(OUT0~OUT15)을 동시 출력, SPI나 I2C로 기록. LDAC로 동기 업데이트, 외부/내부 기준. 초소형 WCSP 볼 그리드 패키지.',
        func: '호스트가 SPI(SDI/SDO/SCLK) 또는 I2C(SDA/SCL + A0/A1 주소)로 각 채널 코드값을 기록 → 16계통 버퍼 전압 출력; LDAC(active-low)로 전 채널 동기 업데이트; VREF로 풀스케일 설정; VIO 디지털 인터페이스 전압; RESET 리셋. 다계통 아날로그 제어/바이어스용.',
        usedIn: '다계통 아날로그 바이어스/제어, 광모듈/레이저 바이어스, 프로그래머블 전압원, 센서 교정, 다채널 구동.',
        desc: '16채널 12-bit 버퍼 전압 출력 DAC. SPI/I2C·LDAC 동기·외/내부 기준(WCSP 볼 그리드).',
        specs: [
          { k: '기능', v: '16채널 12-bit 전압 출력 DAC' },
          { k: '채널', v: '16(OUT0~OUT15, 버퍼 출력)' },
          { k: '인터페이스', v: 'SPI 또는 I2C(A0/A1 주소)' },
          { k: '동기', v: 'LDAC(active-low 동기 업데이트)' },
          { k: '기준', v: 'VREF(외부/내부)' },
          { k: '전원', v: 'AVDD + VIO(디지털 인터페이스)' },
          { k: '패키지', v: 'DSBGA (WCSP) 볼 그리드' }
        ]
      }
    },
    'TRF2001': {
      en: {
        subcategory: 'ISM/Wi-SUN RF front-end module (PA+LNA+T/R switch)',
        whatIs: '860–930MHz ISM-band RF front-end module (FEM): integrates a power amplifier (PA), low-noise amplifier (LNA) and transmit/receive switch. On transmit it amplifies the PA signal to the antenna; on receive it low-noise-amplifies the antenna signal. For Sub-GHz/Wi-SUN radio.',
        func: 'Transmit: PA_IN → internal PA → TX_FLT → (external TX filter) → ANT; receive: ANT → RX_FLT → (external RX filter) → LNA_IN → LNA; TR switches TX/RX, CEN chip enable, CTR selects the TX/RX path, CIB internal bias control; VDET power-detect output. VCC/VCC_PA supplies.',
        usedIn: 'Wi-SUN/Sub-GHz smart meters, IoT radio, 868/915MHz ISM transceiver front ends, multi-protocol radio.',
        desc: '860–930MHz ISM/Wi-SUN RF front-end module, integrated PA+LNA+T/R switch, power detect (QFN-28).',
        specs: [
          { k: 'Function', v: 'ISM/Wi-SUN RF front-end module (PA+LNA+T/R)' },
          { k: 'Band', v: '860 – 930 MHz' },
          { k: 'Integration', v: 'PA + LNA + T/R switch + power detect (VDET)' },
          { k: 'Control', v: 'CEN/TR/CTR/CIB digital control' },
          { k: 'Supply', v: 'VCC + VCC_PA' },
          { k: 'Package', v: 'QFN-28, EP to GND' }
        ],
        dropIn: [{ note: 'Same QFN-28 family; the TRF2001P exposes LNA_OUT (pin3) and has no TX_FLT/TR — different topology, verify' }]
      },
      ja: {
        subcategory: 'ISM/Wi-SUN RF フロントエンドモジュール（PA+LNA+T/R スイッチ）',
        whatIs: '860~930MHz ISM 帯 RF フロントエンドモジュール（FEM）：パワーアンプ（PA）、低雑音アンプ（LNA）、送受切替（T/R スイッチ）を統合。送信時は PA 信号をアンテナへ増幅、受信時はアンテナ信号を低雑音増幅。Sub-GHz/Wi-SUN 無線に。',
        func: '送信：PA_IN→内部 PA→TX_FLT→（外部 TX フィルタ）→ANT；受信：ANT→RX_FLT→（外部 RX フィルタ）→LNA_IN→LNA；TR で送受切替、CEN チップイネーブル、CTR で送受経路選択、CIB 内部バイアス制御；VDET 電力検出出力。VCC/VCC_PA 供給。',
        usedIn: 'Wi-SUN/Sub-GHz スマートメータ、IoT 無線、868/915MHz ISM 送受信フロントエンド、マルチプロトコル無線。',
        desc: '860~930MHz ISM/Wi-SUN RF フロントエンドモジュール。PA+LNA+T/R スイッチ統合・電力検出（QFN-28）。',
        specs: [
          { k: '機能', v: 'ISM/Wi-SUN RF フロントエンドモジュール（PA+LNA+T/R）' },
          { k: '帯域', v: '860 ~ 930 MHz' },
          { k: '統合', v: 'PA + LNA + 送受スイッチ + 電力検出(VDET)' },
          { k: '制御', v: 'CEN/TR/CTR/CIB デジタル制御' },
          { k: '電源', v: 'VCC + VCC_PA' },
          { k: 'パッケージ', v: 'QFN-28、EP は GND' }
        ],
        dropIn: [{ note: '同 QFN-28 シリーズ；TRF2001P は LNA_OUT(pin3) を引出し、TX_FLT/TR なし、トポロジが異なる、要確認' }]
      },
      ko: {
        subcategory: 'ISM/Wi-SUN RF 프론트엔드 모듈(PA+LNA+T/R 스위치)',
        whatIs: '860~930MHz ISM 대역 RF 프론트엔드 모듈(FEM): 전력 증폭기(PA), 저잡음 증폭기(LNA), 송수신 전환(T/R 스위치)을 통합. 송신 시 PA 신호를 안테나로 증폭, 수신 시 안테나 신호를 저잡음 증폭. Sub-GHz/Wi-SUN 무선용.',
        func: '송신: PA_IN → 내부 PA → TX_FLT → (외부 TX 필터) → ANT; 수신: ANT → RX_FLT → (외부 RX 필터) → LNA_IN → LNA; TR로 송수신 전환, CEN 칩 인에이블, CTR로 송수신 경로 선택, CIB 내부 바이어스 제어; VDET 전력 검출 출력. VCC/VCC_PA 공급.',
        usedIn: 'Wi-SUN/Sub-GHz 스마트 미터, IoT 무선, 868/915MHz ISM 송수신 프론트엔드, 다중 프로토콜 무선.',
        desc: '860~930MHz ISM/Wi-SUN RF 프론트엔드 모듈. PA+LNA+T/R 스위치 통합·전력 검출(QFN-28).',
        specs: [
          { k: '기능', v: 'ISM/Wi-SUN RF 프론트엔드 모듈(PA+LNA+T/R)' },
          { k: '대역', v: '860 ~ 930 MHz' },
          { k: '통합', v: 'PA + LNA + 송수신 스위치 + 전력 검출(VDET)' },
          { k: '제어', v: 'CEN/TR/CTR/CIB 디지털 제어' },
          { k: '전원', v: 'VCC + VCC_PA' },
          { k: '패키지', v: 'QFN-28, EP는 GND' }
        ],
        dropIn: [{ note: '동일 QFN-28 시리즈; TRF2001P는 LNA_OUT(pin3)을 인출, TX_FLT/TR 없음, 토폴로지 다름, 확인 필요' }]
      }
    },
    'TRF2001P': {
      en: {
        subcategory: 'ISM/Wi-SUN RF front-end module (PA+LNA, LNA output exposed)',
        whatIs: '820–1054MHz ISM-band RF front-end module (FEM) variant: integrates a PA and LNA, and exposes the LNA output (LNA_OUT) for external processing (unlike the TRF2001’s integrated T/R path). For Sub-GHz/Wi-SUN radio.',
        func: 'Transmit: PA_IN → internal PA → ANT; receive: ANT → LNA_IN → LNA → LNA_OUT (exposed); CEN enable, CTR selects the path, CIB bias; VDET power detect; RX_FLT receive-filter node. VCC/VCC_PA supplies. Same package as the TRF2001 but different topology.',
        usedIn: 'Wi-SUN/Sub-GHz smart meters, IoT radio, transceiver front ends needing an external LNA-output processing path.',
        desc: '820–1054MHz ISM/Wi-SUN RF front-end module, PA+LNA, LNA_OUT exposed, power detect (QFN-28).',
        specs: [
          { k: 'Function', v: 'ISM/Wi-SUN RF front-end module (PA+LNA, LNA output exposed)' },
          { k: 'Band', v: '820 – 1054 MHz' },
          { k: 'Integration', v: 'PA + LNA + power detect (VDET); LNA_OUT exposed' },
          { k: 'Control', v: 'CEN/CTR/CIB digital control' },
          { k: 'Supply', v: 'VCC + VCC_PA' },
          { k: 'Package', v: 'QFN-28, EP to GND' }
        ],
        dropIn: [{ note: 'Same QFN-28 family; the TRF2001 is the integrated-T/R-path (TX_FLT/TR) version, different topology, verify' }]
      },
      ja: {
        subcategory: 'ISM/Wi-SUN RF フロントエンドモジュール（PA+LNA、LNA 出力引出し）',
        whatIs: '820~1054MHz ISM 帯 RF フロントエンドモジュール（FEM）変種：PA と LNA を統合し、LNA 出力（LNA_OUT）を引出して外部処理に供する（TRF2001 の統合 T/R 経路と異なる）。Sub-GHz/Wi-SUN 無線に。',
        func: '送信：PA_IN→内部 PA→ANT；受信：ANT→LNA_IN→LNA→LNA_OUT（引出し）；CEN イネーブル、CTR 経路選択、CIB バイアス；VDET 電力検出；RX_FLT 受信フィルタノード。VCC/VCC_PA 供給。TRF2001 と同パッケージ・トポロジ違い。',
        usedIn: 'Wi-SUN/Sub-GHz スマートメータ、IoT 無線、外部 LNA 出力処理が必要な送受信フロントエンド。',
        desc: '820~1054MHz ISM/Wi-SUN RF フロントエンドモジュール。PA+LNA・LNA_OUT 引出し・電力検出（QFN-28）。',
        specs: [
          { k: '機能', v: 'ISM/Wi-SUN RF フロントエンドモジュール（PA+LNA、LNA 出力引出し）' },
          { k: '帯域', v: '820 ~ 1054 MHz' },
          { k: '統合', v: 'PA + LNA + 電力検出(VDET)；LNA_OUT 引出し' },
          { k: '制御', v: 'CEN/CTR/CIB デジタル制御' },
          { k: '電源', v: 'VCC + VCC_PA' },
          { k: 'パッケージ', v: 'QFN-28、EP は GND' }
        ],
        dropIn: [{ note: '同 QFN-28 シリーズ；TRF2001 は統合 T/R 経路(TX_FLT/TR)版、トポロジが異なる、要確認' }]
      },
      ko: {
        subcategory: 'ISM/Wi-SUN RF 프론트엔드 모듈(PA+LNA, LNA 출력 인출)',
        whatIs: '820~1054MHz ISM 대역 RF 프론트엔드 모듈(FEM) 변형: PA와 LNA를 통합하고 LNA 출력(LNA_OUT)을 인출해 외부 처리에 공급(TRF2001의 통합 T/R 경로와 다름). Sub-GHz/Wi-SUN 무선용.',
        func: '송신: PA_IN → 내부 PA → ANT; 수신: ANT → LNA_IN → LNA → LNA_OUT(인출); CEN 인에이블, CTR 경로 선택, CIB 바이어스; VDET 전력 검출; RX_FLT 수신 필터 노드. VCC/VCC_PA 공급. TRF2001과 같은 패키지·토폴로지 다름.',
        usedIn: 'Wi-SUN/Sub-GHz 스마트 미터, IoT 무선, 외부 LNA 출력 처리가 필요한 송수신 프론트엔드.',
        desc: '820~1054MHz ISM/Wi-SUN RF 프론트엔드 모듈. PA+LNA·LNA_OUT 인출·전력 검출(QFN-28).',
        specs: [
          { k: '기능', v: 'ISM/Wi-SUN RF 프론트엔드 모듈(PA+LNA, LNA 출력 인출)' },
          { k: '대역', v: '820 ~ 1054 MHz' },
          { k: '통합', v: 'PA + LNA + 전력 검출(VDET); LNA_OUT 인출' },
          { k: '제어', v: 'CEN/CTR/CIB 디지털 제어' },
          { k: '전원', v: 'VCC + VCC_PA' },
          { k: '패키지', v: 'QFN-28, EP는 GND' }
        ],
        dropIn: [{ note: '동일 QFN-28 시리즈; TRF2001은 통합 T/R 경로(TX_FLT/TR)판, 토폴로지 다름, 확인 필요' }]
      }
    },
    'DRV7167': {
      en: {
        subcategory: 'GaN half-bridge gate driver + power stage (programmable slew rate)',
        whatIs: 'Integrated GaN half-bridge power stage: contains high/low-side GaN FETs + gate drivers, converting PWM control signals into a half-bridge switching output (OUT). Programmable slew rate controls EMI; supports PWM or independent-input (IIM) control modes. For motor/power switching.',
        func: 'PWM mode: ENIN/HI enables, PWM/LI sends the PWM; RDLR/RDLF/RDHR/RDHF resistors set the high/low-side FET switching slew rate; OUT is the half-bridge switch node (to HS); VM high-side drain input, PGND low-side source; GVDD 5V supply; EN/FLT enable+fault; BOOT high-side bootstrap. Can report zero-voltage switching (ZVD).',
        usedIn: 'Motor-drive half-bridges, synchronous rectification, DC-DC power stages, supplies needing efficient GaN switching.',
        desc: 'GaN half-bridge gate driver + power stage, programmable slew rate, PWM/IIM dual mode, ZVD detect (QFN).',
        specs: [
          { k: 'Function', v: 'GaN half-bridge gate driver + power stage' },
          { k: 'Control modes', v: 'PWM or IIM (independent high/low-side inputs)' },
          { k: 'Programmable slew', v: 'RDLR/RDLF/RDHR/RDHF resistors set slew rate (EMI control)' },
          { k: 'Reporting', v: 'ZVD zero-voltage-switching detect, EN/FLT fault' },
          { k: 'Supply', v: 'VM power + GVDD 5V drive + BOOT bootstrap' },
          { k: 'Package', v: 'QFN with thermal pad (PGND/OUT high-current pads)' }
        ]
      },
      ja: {
        subcategory: 'GaN ハーフブリッジゲート駆動＋パワーステージ（プログラマブルスルーレート）',
        whatIs: '統合 GaN ハーフブリッジパワーステージ：ハイ/ローサイド GaN FET＋ゲート駆動を内蔵し、PWM 制御信号をハーフブリッジスイッチ出力（OUT）に変換。プログラマブルスルーレートで EMI 制御、PWM / 独立入力（IIM）2 モードに対応。モータ/電源スイッチに。',
        func: 'PWM モード：ENIN/HI イネーブル、PWM/LI で PWM 送出；RDLR/RDLF/RDHR/RDHF 抵抗でハイ/ローサイド FET のスイッチスルーレート設定；OUT はハーフブリッジスイッチノード（HS 接続）；VM ハイサイドドレイン入力、PGND ローサイドソース；GVDD 5V 供給；EN/FLT イネーブル＋故障；BOOT ハイサイドブートストラップ。ゼロ電圧スイッチング（ZVD）報告可。',
        usedIn: 'モータ駆動ハーフブリッジ、同期整流、DC-DC パワーステージ、高効率 GaN スイッチが必要な電源。',
        desc: 'GaN ハーフブリッジゲート駆動＋パワーステージ。プログラマブルスルーレート・PWM/IIM 両モード・ZVD 検出（QFN）。',
        specs: [
          { k: '機能', v: 'GaN ハーフブリッジゲート駆動＋パワーステージ' },
          { k: '制御モード', v: 'PWM または IIM（独立ハイ/ローサイド入力）' },
          { k: 'プログラマブルスルー', v: 'RDLR/RDLF/RDHR/RDHF 抵抗でスルーレート設定（EMI 制御）' },
          { k: '報告', v: 'ZVD ゼロ電圧スイッチング検出、EN/FLT 故障' },
          { k: '電源', v: 'VM パワー＋GVDD 5V 駆動＋BOOT ブートストラップ' },
          { k: 'パッケージ', v: 'QFN サーマルパッド付（PGND/OUT 大電流パッド）' }
        ]
      },
      ko: {
        subcategory: 'GaN 하프 브리지 게이트 구동+전력단(프로그래머블 슬루율)',
        whatIs: '통합 GaN 하프 브리지 전력단: 하이/로우사이드 GaN FET+게이트 구동을 내장해 PWM 제어 신호를 하프 브리지 스위칭 출력(OUT)으로 변환. 프로그래머블 슬루율로 EMI 제어, PWM / 독립 입력(IIM) 2모드 지원. 모터/전원 스위칭용.',
        func: 'PWM 모드: ENIN/HI 인에이블, PWM/LI로 PWM 송출; RDLR/RDLF/RDHR/RDHF 저항으로 하이/로우사이드 FET 스위칭 슬루율 설정; OUT은 하프 브리지 스위치 노드(HS 연결); VM 하이사이드 드레인 입력, PGND 로우사이드 소스; GVDD 5V 공급; EN/FLT 인에이블+고장; BOOT 하이사이드 부트스트랩. 영전압 스위칭(ZVD) 보고 가능.',
        usedIn: '모터 구동 하프 브리지, 동기 정류, DC-DC 전력단, 고효율 GaN 스위칭이 필요한 전원.',
        desc: 'GaN 하프 브리지 게이트 구동+전력단. 프로그래머블 슬루율·PWM/IIM 양 모드·ZVD 감지(QFN).',
        specs: [
          { k: '기능', v: 'GaN 하프 브리지 게이트 구동+전력단' },
          { k: '제어 모드', v: 'PWM 또는 IIM(독립 하이/로우사이드 입력)' },
          { k: '프로그래머블 슬루', v: 'RDLR/RDLF/RDHR/RDHF 저항으로 슬루율 설정(EMI 제어)' },
          { k: '보고', v: 'ZVD 영전압 스위칭 감지, EN/FLT 고장' },
          { k: '전원', v: 'VM 전력 + GVDD 5V 구동 + BOOT 부트스트랩' },
          { k: '패키지', v: 'QFN 서멀 패드 포함(PGND/OUT 대전류 패드)' }
        ]
      }
    },
    'LMG2652H': {
      en: {
        subcategory: '650V GaN power half-bridge (integrated driver + current sense)',
        whatIs: '650V / 140mΩ GaN power half-bridge module: integrates high/low-side GaN FETs, gate drivers, bootstrap FET and high-side level shift. Few parts, saves board area. Includes a low-side current-sense emulation (CS) that replaces an external sense resistor.',
        func: 'INH/INL (referenced to AGND) or GDH (referenced to SW) drive the high/low-side gates; DH high-side drain (to VIN), SW half-bridge switch node, SL low-side source (to power ground); RDRVH/RDRVL resistors set switching slew rate for EMI; CS outputs a scaled replica of the low-side current (for the controller); BST bootstrap, AUX internal driver supply, EN enable.',
        usedIn: 'High-voltage DC-DC, totem-pole PFC, motor inverters, server/industrial power half-bridges, GaN high-efficiency power.',
        desc: '650V 140mΩ GaN power half-bridge, integrated driver/bootstrap/level-shift + current-sense emulation, programmable slew rate (QFN 6×8mm).',
        specs: [
          { k: 'Function', v: '650V GaN power half-bridge (integrated driver)' },
          { k: 'Voltage/RDS', v: '650V / 140mΩ' },
          { k: 'Integration', v: 'high/low-side GaN FET + gate driver + bootstrap FET + level shift' },
          { k: 'Current sense', v: 'CS emulation output (replaces external sense resistor)' },
          { k: 'Programmable slew', v: 'RDRVH/RDRVL set slew rate (EMI/ringing control)' },
          { k: 'Control', v: 'INH/INL (AGND-referenced) or GDH (SW-referenced)' },
          { k: 'Package', v: 'QFN 6×8mm (SL/SW are thermal pads)' }
        ]
      },
      ja: {
        subcategory: '650V GaN パワーハーフブリッジ（統合ドライバ＋電流検出）',
        whatIs: '650V / 140mΩ GaN パワーハーフブリッジモジュール：ハイ/ローサイド GaN FET、ゲート駆動、ブートストラップ FET、ハイサイドレベルシフトを統合。部品が少なく基板面積を節約。外部センス抵抗を置き換えるローサイド電流検出エミュレーション（CS）を内蔵。',
        func: 'INH/INL（AGND 基準）または GDH（SW 基準）でハイ/ローサイドゲートを駆動；DH ハイサイドドレイン（VIN 接続）、SW ハーフブリッジスイッチノード、SL ローサイドソース（パワー接地）；RDRVH/RDRVL 抵抗でスイッチスルーレートを設定し EMI 制御；CS がローサイド電流のスケール複製を出力（コントローラ用）；BST ブートストラップ、AUX 内部ドライバ供給、EN イネーブル。',
        usedIn: '高圧 DC-DC、トーテムポール PFC、モータインバータ、サーバ/産業電源ハーフブリッジ、GaN 高効率電源。',
        desc: '650V 140mΩ GaN パワーハーフブリッジ。統合ドライバ/ブートストラップ/レベルシフト＋電流検出エミュレーション・プログラマブルスルーレート（QFN 6×8mm）。',
        specs: [
          { k: '機能', v: '650V GaN パワーハーフブリッジ（統合ドライバ）' },
          { k: '耐圧/導通', v: '650V / 140mΩ' },
          { k: '統合', v: 'ハイ/ローサイド GaN FET + ゲート駆動 + ブートストラップ FET + レベルシフト' },
          { k: '電流検出', v: 'CS エミュレーション出力（外部センス抵抗を置換）' },
          { k: 'プログラマブルスルー', v: 'RDRVH/RDRVL でスルーレート設定（EMI/リンギング制御）' },
          { k: '制御', v: 'INH/INL（AGND 基準）または GDH（SW 基準）' },
          { k: 'パッケージ', v: 'QFN 6×8mm（SL/SW がサーマルパッド）' }
        ]
      },
      ko: {
        subcategory: '650V GaN 전력 하프 브리지(통합 드라이버+전류 감지)',
        whatIs: '650V / 140mΩ GaN 전력 하프 브리지 모듈: 하이/로우사이드 GaN FET, 게이트 구동, 부트스트랩 FET, 하이사이드 레벨 시프트를 통합. 부품이 적고 보드 면적 절약. 외부 감지 저항을 대체하는 로우사이드 전류 감지 에뮬레이션(CS) 내장.',
        func: 'INH/INL(AGND 기준) 또는 GDH(SW 기준)로 하이/로우사이드 게이트 구동; DH 하이사이드 드레인(VIN 연결), SW 하프 브리지 스위치 노드, SL 로우사이드 소스(전력 접지); RDRVH/RDRVL 저항으로 스위칭 슬루율 설정해 EMI 제어; CS가 로우사이드 전류의 스케일 복제를 출력(컨트롤러용); BST 부트스트랩, AUX 내부 드라이버 공급, EN 인에이블.',
        usedIn: '고압 DC-DC, 토템폴 PFC, 모터 인버터, 서버/산업 전원 하프 브리지, GaN 고효율 전원.',
        desc: '650V 140mΩ GaN 전력 하프 브리지. 통합 드라이버/부트스트랩/레벨 시프트+전류 감지 에뮬레이션·프로그래머블 슬루율(QFN 6×8mm).',
        specs: [
          { k: '기능', v: '650V GaN 전력 하프 브리지(통합 드라이버)' },
          { k: '내압/도통', v: '650V / 140mΩ' },
          { k: '통합', v: '하이/로우사이드 GaN FET + 게이트 구동 + 부트스트랩 FET + 레벨 시프트' },
          { k: '전류 감지', v: 'CS 에뮬레이션 출력(외부 감지 저항 대체)' },
          { k: '프로그래머블 슬루', v: 'RDRVH/RDRVL로 슬루율 설정(EMI/링잉 제어)' },
          { k: '제어', v: 'INH/INL(AGND 기준) 또는 GDH(SW 기준)' },
          { k: '패키지', v: 'QFN 6×8mm(SL/SW가 서멀 패드)' }
        ]
      }
    },
    'UC1825B-SP': {
      en: {
        subcategory: 'High-speed PWM controller (radiation-hardened, dual output)',
        whatIs: 'High-speed pulse-width-modulation (PWM) controller (radiation-hardened Class-V): generates PWM drive signals to control a switching supply’s switch, with an error amplifier, oscillator, current limit, soft-start and dual totem-pole outputs. For isolated/non-isolated DC-DC power control.',
        func: 'The error amplifier (INV/NI/EAOUT) compares feedback with the reference → compensation; the oscillator (RT/CT set frequency, CLK output); RAMP feeds the PWM comparator (voltage-mode feedforward or peak-current-mode slope compensation); SS soft-start doubles as max-duty clamp; ILIM/SD current limit + shutdown; dual outputs OUTA/OUTB totem-pole drive FETs; VREF reference output, VC output-stage supply, VCC supply.',
        usedIn: 'Space/satellite power, isolated DC-DC, push-pull/half-bridge/full-bridge/forward converter PWM control, radiation-hardened power.',
        desc: 'Radiation-hardened high-speed PWM controller, error amp/oscillator/current limit/soft-start + dual totem-pole outputs (CFP-16).',
        specs: [
          { k: 'Function', v: 'High-speed PWM controller (dual output)' },
          { k: 'Control modes', v: 'voltage mode / peak-current mode' },
          { k: 'Integration', v: 'error amplifier + oscillator + current limit + soft-start' },
          { k: 'Output', v: 'dual totem-pole OUTA/OUTB (high current)' },
          { k: 'Radiation', v: 'Class-V (rad-hard, space-grade)' },
          { k: 'Package', v: 'CFP-16' }
        ]
      },
      ja: {
        subcategory: '高速 PWM コントローラ（耐放射線・デュアル出力）',
        whatIs: '高速パルス幅変調（PWM）コントローラ（耐放射線 Class-V）：PWM 駆動信号を生成しスイッチング電源のスイッチを制御、誤差アンプ・発振器・電流制限・ソフトスタート・デュアルトーテムポール出力を含む。絶縁/非絶縁 DC-DC 電源制御に。',
        func: '誤差アンプ（INV/NI/EAOUT）が帰還と基準を比較→補償；発振器（RT/CT で周波数設定、CLK 出力）；RAMP が PWM コンパレータへ（電圧モードフィードフォワードまたはピーク電流モードのスロープ補償）；SS ソフトスタート兼最大デューティクランプ；ILIM/SD 電流制限＋遮断；デュアル出力 OUTA/OUTB トーテムポールで FET 駆動；VREF 基準出力、VC 出力段供給、VCC 供給。',
        usedIn: '宇宙/衛星電源、絶縁 DC-DC、プッシュプル/ハーフブリッジ/フルブリッジ/フォワードコンバータの PWM 制御、耐放射線電源。',
        desc: '耐放射線高速 PWM コントローラ。誤差アンプ/発振器/電流制限/ソフトスタート＋デュアルトーテムポール出力（CFP-16）。',
        specs: [
          { k: '機能', v: '高速 PWM コントローラ（デュアル出力）' },
          { k: '制御モード', v: '電圧モード / ピーク電流モード' },
          { k: '統合', v: '誤差アンプ + 発振器 + 電流制限 + ソフトスタート' },
          { k: '出力', v: 'デュアルトーテムポール OUTA/OUTB（大電流）' },
          { k: '耐放射線', v: 'Class-V（rad-hard・宇宙級）' },
          { k: 'パッケージ', v: 'CFP-16' }
        ]
      },
      ko: {
        subcategory: '고속 PWM 컨트롤러(내방사선·듀얼 출력)',
        whatIs: '고속 펄스 폭 변조(PWM) 컨트롤러(내방사선 Class-V): PWM 구동 신호를 생성해 스위칭 전원의 스위치를 제어, 오차 증폭기·발진기·전류 제한·소프트 스타트·듀얼 토템폴 출력 포함. 절연/비절연 DC-DC 전원 제어용.',
        func: '오차 증폭기(INV/NI/EAOUT)가 피드백과 기준을 비교 → 보상; 발진기(RT/CT로 주파수 설정, CLK 출력); RAMP가 PWM 비교기로(전압 모드 피드포워드 또는 피크 전류 모드 슬로프 보상); SS 소프트 스타트 겸 최대 듀티 클램프; ILIM/SD 전류 제한+차단; 듀얼 출력 OUTA/OUTB 토템폴로 FET 구동; VREF 기준 출력, VC 출력단 공급, VCC 공급.',
        usedIn: '우주/위성 전원, 절연 DC-DC, 푸시풀/하프 브리지/풀 브리지/포워드 컨버터 PWM 제어, 내방사선 전원.',
        desc: '내방사선 고속 PWM 컨트롤러. 오차 증폭기/발진기/전류 제한/소프트 스타트+듀얼 토템폴 출력(CFP-16).',
        specs: [
          { k: '기능', v: '고속 PWM 컨트롤러(듀얼 출력)' },
          { k: '제어 모드', v: '전압 모드 / 피크 전류 모드' },
          { k: '통합', v: '오차 증폭기 + 발진기 + 전류 제한 + 소프트 스타트' },
          { k: '출력', v: '듀얼 토템폴 OUTA/OUTB(대전류)' },
          { k: '내방사선', v: 'Class-V(rad-hard·우주급)' },
          { k: '패키지', v: 'CFP-16' }
        ]
      }
    },
    'UCG28846': {
      en: {
        subcategory: 'Self-biased high-frequency quasi-resonant GaN flyback converter',
        whatIs: 'GaN-integrated high-frequency quasi-resonant (QR) flyback controller: built-in high-voltage GaN power switch (HEMT) + controller + HV startup, self-biased (no auxiliary winding/VCC needed). For compact high-efficiency AC/DC power (chargers/adapters).',
        func: 'The HV pin does high-voltage startup, AC-line sensing and X-capacitor discharge; SW is the built-in GaN HEMT drain, doubling as valley-switching/protection sense; FB takes optocoupler feedback for regulation; TR resistor sets the transformer turns ratio, IPS sets peak current and SW slew rate, FCL sets frequency clamp/fault behavior, CFX compensation; FLT connects an NTC for external over-temperature protection. Quasi-resonant valley switching lowers switching loss.',
        usedIn: 'USB-PD chargers/adapters, compact AC/DC power, appliance standby power, auxiliary supplies.',
        desc: 'Self-biased high-frequency quasi-resonant GaN flyback converter (integrated GaN switch), HV startup, optocoupler feedback, settable turns ratio/peak current (QFN-10).',
        specs: [
          { k: 'Function', v: 'Self-biased quasi-resonant GaN flyback converter' },
          { k: 'Integration', v: 'high-voltage GaN HEMT power switch + controller + HV startup' },
          { k: 'Bias', v: 'self-biased (no auxiliary winding/external VCC)' },
          { k: 'Switching', v: 'quasi-resonant valley switching (low loss)' },
          { k: 'Settings', v: 'TR turns ratio / IPS peak current / FCL frequency / CFX compensation' },
          { k: 'Protection', v: 'FLT external over-temperature (NTC)' },
          { k: 'Package', v: 'QFN-10 / SOIC' }
        ],
        dropIn: [{ note: 'Same family, same pinout (different power/current tier)' }]
      },
      ja: {
        subcategory: '自己バイアス高周波準共振 GaN フライバックコンバータ',
        whatIs: 'GaN 統合の高周波準共振（QR）フライバックコントローラ：高圧 GaN パワースイッチ（HEMT）＋コントローラ＋HV 起動を内蔵、自己バイアス（補助巻線/VCC 不要）。小型高効率 AC/DC 電源（充電器/アダプタ）に。',
        func: 'HV ピンで高圧起動・AC ライン検出・X コンデンサ放電；SW は内蔵 GaN HEMT のドレイン兼谷底スイッチング/保護検出；FB でフォトカプラ帰還により安定化；TR 抵抗でトランス巻数比、IPS でピーク電流と SW スルーレート、FCL で周波数クランプ/故障動作、CFX 補償を設定；FLT に NTC 接続で外部過温保護。準共振谷底スイッチングでスイッチ損失を低減。',
        usedIn: 'USB-PD 充電器/アダプタ、小型 AC/DC 電源、家電待機電源、補助電源。',
        desc: '自己バイアス高周波準共振 GaN フライバックコンバータ（GaN スイッチ統合）。HV 起動・フォトカプラ帰還・巻数比/ピーク電流設定可（QFN-10）。',
        specs: [
          { k: '機能', v: '自己バイアス準共振 GaN フライバックコンバータ' },
          { k: '統合', v: '高圧 GaN HEMT パワースイッチ + コントローラ + HV 起動' },
          { k: 'バイアス', v: '自己バイアス（補助巻線/外部 VCC 不要）' },
          { k: 'スイッチング', v: '準共振谷底スイッチング（低損失）' },
          { k: '設定', v: 'TR 巻数比 / IPS ピーク電流 / FCL 周波数 / CFX 補償' },
          { k: '保護', v: 'FLT 外部過温（NTC）' },
          { k: 'パッケージ', v: 'QFN-10 / SOIC' }
        ],
        dropIn: [{ note: '同シリーズ同ピン配置（電力/電流ティアが異なる）' }]
      },
      ko: {
        subcategory: '자기 바이어스 고주파 준공진 GaN 플라이백 컨버터',
        whatIs: 'GaN 통합 고주파 준공진(QR) 플라이백 컨트롤러: 고압 GaN 전력 스위치(HEMT)+컨트롤러+HV 시동을 내장, 자기 바이어스(보조 권선/VCC 불필요). 소형 고효율 AC/DC 전원(충전기/어댑터)용.',
        func: 'HV 핀으로 고압 시동·AC 라인 감지·X 커패시터 방전; SW는 내장 GaN HEMT 드레인 겸 밸리 스위칭/보호 감지; FB로 포토커플러 피드백으로 안정화; TR 저항으로 트랜스 권선비, IPS로 피크 전류와 SW 슬루율, FCL로 주파수 클램프/고장 동작, CFX 보상 설정; FLT에 NTC 연결로 외부 과열 보호. 준공진 밸리 스위칭으로 스위칭 손실 저감.',
        usedIn: 'USB-PD 충전기/어댑터, 소형 AC/DC 전원, 가전 대기 전원, 보조 전원.',
        desc: '자기 바이어스 고주파 준공진 GaN 플라이백 컨버터(GaN 스위치 통합). HV 시동·포토커플러 피드백·권선비/피크 전류 설정 가능(QFN-10).',
        specs: [
          { k: '기능', v: '자기 바이어스 준공진 GaN 플라이백 컨버터' },
          { k: '통합', v: '고압 GaN HEMT 전력 스위치 + 컨트롤러 + HV 시동' },
          { k: '바이어스', v: '자기 바이어스(보조 권선/외부 VCC 불필요)' },
          { k: '스위칭', v: '준공진 밸리 스위칭(저손실)' },
          { k: '설정', v: 'TR 권선비 / IPS 피크 전류 / FCL 주파수 / CFX 보상' },
          { k: '보호', v: 'FLT 외부 과열(NTC)' },
          { k: '패키지', v: 'QFN-10 / SOIC' }
        ],
        dropIn: [{ note: '동일 시리즈 동일 핀 배치(전력/전류 등급 다름)' }]
      }
    },
    'CDCLVP111-SEP': {
      en: {
        subcategory: 'LVPECL 1:10 differential clock fanout (2:1 input mux, radiation-tolerant)',
        whatIs: 'LVECL/LVPECL differential clock fanout buffer: selects one of 2 differential clock inputs (CLK0/CLK1) and replicates it into 10 low-skew differential clock outputs (Q0–Q9, each with a complement). Radiation-tolerant (SEP), space-grade.',
        func: 'CLK_SEL selects the CLK0 or CLK1 differential input → internally buffered and replicated into 10 pairs of differential LVPECL outputs (Qn/nQn), low skew, low jitter; VBB is the reference-voltage output for single-ended-input operation; VCC multi-pin supply, VEE ground/negative supply (ECL mode). For high-speed differential clock-tree distribution.',
        usedIn: 'Space/aerospace high-speed clock distribution, SerDes/ADC/DAC differential reference clocks, communication-backplane clock trees.',
        desc: 'Radiation-tolerant LVPECL 1:10 differential clock fanout (2:1 input mux), low skew, complementary outputs (QFN-32).',
        specs: [
          { k: 'Function', v: 'LVPECL 1:10 differential clock fanout (2:1 input mux)' },
          { k: 'Inputs', v: '2 differential CLK0/CLK1 (CLK_SEL selects)' },
          { k: 'Outputs', v: '10 pairs differential LVECL/LVPECL (Qn/nQn, low skew)' },
          { k: 'Reference', v: 'VBB (for single-ended input)' },
          { k: 'Radiation', v: 'SEP (space-grade)' },
          { k: 'Supply', v: 'VCC ×5 + VEE' },
          { k: 'Package', v: 'QFN-32 (DAP floating)' }
        ]
      },
      ja: {
        subcategory: 'LVPECL 1:10 差動クロックファンアウト（2:1 入力 mux・耐放射線）',
        whatIs: 'LVECL/LVPECL 差動クロックファンアウトバッファ：2 組の差動クロック入力（CLK0/CLK1）から 1 系統を選び、10 系統の低スキュー差動クロック出力（Q0~Q9、各々相補付）に複製。耐放射線（SEP）・宇宙級。',
        func: 'CLK_SEL で CLK0 か CLK1 差動入力を選択→内部バッファし 10 対の差動 LVPECL 出力（Qn/nQn）に複製、低スキュー・低ジッタ；VBB はシングルエンド入力動作用の参照電圧出力；VCC 複数ピン供給、VEE 接地/負供給（ECL モード）。高速差動クロックツリー分配に。',
        usedIn: '宇宙/航空宇宙の高速クロック分配、SerDes/ADC/DAC 差動参照クロック、通信バックプレーンのクロックツリー。',
        desc: '耐放射線 LVPECL 1:10 差動クロックファンアウト（2:1 入力 mux）。低スキュー・相補出力（QFN-32）。',
        specs: [
          { k: '機能', v: 'LVPECL 1:10 差動クロックファンアウト（2:1 入力 mux）' },
          { k: '入力', v: '2 組差動 CLK0/CLK1（CLK_SEL 選択）' },
          { k: '出力', v: '10 対差動 LVECL/LVPECL（Qn/nQn、低スキュー）' },
          { k: '参照', v: 'VBB（シングルエンド入力用）' },
          { k: '耐放射線', v: 'SEP（宇宙級）' },
          { k: '電源', v: 'VCC ×5 + VEE' },
          { k: 'パッケージ', v: 'QFN-32（DAP 浮き）' }
        ]
      },
      ko: {
        subcategory: 'LVPECL 1:10 차동 클록 팬아웃(2:1 입력 mux·내방사선)',
        whatIs: 'LVECL/LVPECL 차동 클록 팬아웃 버퍼: 2조의 차동 클록 입력(CLK0/CLK1)에서 1계통을 선택해 10계통 저스큐 차동 클록 출력(Q0~Q9, 각각 상보 포함)으로 복제. 내방사선(SEP)·우주급.',
        func: 'CLK_SEL로 CLK0 또는 CLK1 차동 입력 선택 → 내부 버퍼해 10쌍 차동 LVPECL 출력(Qn/nQn)으로 복제, 저스큐·저지터; VBB는 싱글엔드 입력 동작용 참조 전압 출력; VCC 다중 핀 공급, VEE 접지/음 공급(ECL 모드). 고속 차동 클록 트리 분배용.',
        usedIn: '우주/항공우주 고속 클록 분배, SerDes/ADC/DAC 차동 참조 클록, 통신 백플레인 클록 트리.',
        desc: '내방사선 LVPECL 1:10 차동 클록 팬아웃(2:1 입력 mux). 저스큐·상보 출력(QFN-32).',
        specs: [
          { k: '기능', v: 'LVPECL 1:10 차동 클록 팬아웃(2:1 입력 mux)' },
          { k: '입력', v: '2조 차동 CLK0/CLK1(CLK_SEL 선택)' },
          { k: '출력', v: '10쌍 차동 LVECL/LVPECL(Qn/nQn, 저스큐)' },
          { k: '참조', v: 'VBB(싱글엔드 입력용)' },
          { k: '내방사선', v: 'SEP(우주급)' },
          { k: '전원', v: 'VCC ×5 + VEE' },
          { k: '패키지', v: 'QFN-32(DAP 플로팅)' }
        ]
      }
    },
    'TAS2320': {
      en: {
        subcategory: 'Class-D smart speaker amplifier (digital audio I2S/TDM)',
        whatIs: 'Class-D smart speaker power amplifier: receives digital audio (I2S/TDM) and drives a speaker (OUT_P/OUT_N) with an efficient Class-D power stage. Includes I2C control, multiple configurable SEL pins (address/interface) and internal regulators. Suited to portable/automotive speakers.',
        func: 'Digital audio comes in via FSYNC/SBCLK/SDIN, SDOUT returns (I/V sense data); the Class-D bridged output OUT_P/OUT_N drives the speaker; I2C (SEL pins multiplex SDA/SCL/address) controls it; SDZ shutdown, IRQZ interrupt (open-drain); PVDD/VBAT power supply, IOVDD digital, DREG/GREG internal regulator outputs.',
        usedIn: 'Phone/tablet/laptop speakers, portable Bluetooth audio, automotive speakers, smart speakers.',
        desc: 'Class-D smart speaker amplifier, I2S/TDM digital audio, I2C control, I/V sense, internal regulators (QFN-26).',
        specs: [
          { k: 'Function', v: 'Class-D smart speaker amplifier (with I/V sense)' },
          { k: 'Digital audio', v: 'I2S / TDM (FSYNC/SBCLK/SDIN/SDOUT)' },
          { k: 'Control', v: 'I2C (SEL pins multiplex SDA/SCL/address)' },
          { k: 'Output', v: 'Class-D bridged OUT_P/OUT_N' },
          { k: 'Supply', v: 'PVDD/VBAT power + IOVDD digital + internal DREG/GREG' },
          { k: 'Protection/interrupt', v: 'SDZ shutdown, IRQZ interrupt (open-drain)' },
          { k: 'Package', v: 'QFN-26' }
        ],
        dropIn: [{ note: 'Same smart-speaker-amplifier family; verify package/pinout and functional differences' }]
      },
      ja: {
        subcategory: 'Class-D スマートスピーカアンプ（デジタルオーディオ I2S/TDM）',
        whatIs: 'Class-D スマートスピーカパワーアンプ：デジタルオーディオ（I2S/TDM）を受け、高効率 Class-D パワーステージでスピーカ（OUT_P/OUT_N）を駆動。I2C 制御・複数の設定可能な SEL ピン（アドレス/インタフェース）・内部レギュレータを含む。ポータブル/車載スピーカ向け。',
        func: 'デジタルオーディオが FSYNC/SBCLK/SDIN で入り、SDOUT が返す（I/V センスデータ）；Class-D ブリッジ出力 OUT_P/OUT_N がスピーカを駆動；I2C（SEL ピンが SDA/SCL/アドレスを兼用）で制御；SDZ 遮断、IRQZ 割込み（オープンドレイン）；PVDD/VBAT パワー供給、IOVDD デジタル、DREG/GREG 内部レギュレータ出力。',
        usedIn: 'スマホ/タブレット/ノート PC スピーカ、ポータブル Bluetooth オーディオ、車載スピーカ、スマートスピーカ。',
        desc: 'Class-D スマートスピーカアンプ。I2S/TDM デジタルオーディオ・I2C 制御・I/V センス・内部レギュレータ（QFN-26）。',
        specs: [
          { k: '機能', v: 'Class-D スマートスピーカアンプ（I/V センス付）' },
          { k: 'デジタルオーディオ', v: 'I2S / TDM（FSYNC/SBCLK/SDIN/SDOUT）' },
          { k: '制御', v: 'I2C（SEL ピンが SDA/SCL/アドレス兼用）' },
          { k: '出力', v: 'Class-D ブリッジ OUT_P/OUT_N' },
          { k: '電源', v: 'PVDD/VBAT パワー + IOVDD デジタル + 内部 DREG/GREG' },
          { k: '保護/割込み', v: 'SDZ 遮断、IRQZ 割込み(オープンドレイン)' },
          { k: 'パッケージ', v: 'QFN-26' }
        ],
        dropIn: [{ note: '同スマートスピーカアンプシリーズ；パッケージ/ピン配置と機能差を確認' }]
      },
      ko: {
        subcategory: 'Class-D 스마트 스피커 앰프(디지털 오디오 I2S/TDM)',
        whatIs: 'Class-D 스마트 스피커 전력 증폭기: 디지털 오디오(I2S/TDM)를 받아 고효율 Class-D 전력단으로 스피커(OUT_P/OUT_N)를 구동. I2C 제어·복수의 설정 가능한 SEL 핀(주소/인터페이스)·내부 레귤레이터 포함. 휴대/차량 스피커용.',
        func: '디지털 오디오가 FSYNC/SBCLK/SDIN으로 들어오고 SDOUT이 반환(I/V 감지 데이터); Class-D 브리지 출력 OUT_P/OUT_N이 스피커 구동; I2C(SEL 핀이 SDA/SCL/주소 겸용)로 제어; SDZ 차단, IRQZ 인터럽트(오픈 드레인); PVDD/VBAT 전력 공급, IOVDD 디지털, DREG/GREG 내부 레귤레이터 출력.',
        usedIn: '폰/태블릿/노트북 스피커, 휴대 블루투스 오디오, 차량 스피커, 스마트 스피커.',
        desc: 'Class-D 스마트 스피커 앰프. I2S/TDM 디지털 오디오·I2C 제어·I/V 감지·내부 레귤레이터(QFN-26).',
        specs: [
          { k: '기능', v: 'Class-D 스마트 스피커 앰프(I/V 감지 포함)' },
          { k: '디지털 오디오', v: 'I2S / TDM(FSYNC/SBCLK/SDIN/SDOUT)' },
          { k: '제어', v: 'I2C(SEL 핀이 SDA/SCL/주소 겸용)' },
          { k: '출력', v: 'Class-D 브리지 OUT_P/OUT_N' },
          { k: '전원', v: 'PVDD/VBAT 전력 + IOVDD 디지털 + 내부 DREG/GREG' },
          { k: '보호/인터럽트', v: 'SDZ 차단, IRQZ 인터럽트(오픈 드레인)' },
          { k: '패키지', v: 'QFN-26' }
        ],
        dropIn: [{ note: '동일 스마트 스피커 앰프 시리즈; 패키지/핀 배치와 기능 차이 확인' }]
      }
    }
  };
  Object.assign(window.IC_I18N, T);
})();
