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
