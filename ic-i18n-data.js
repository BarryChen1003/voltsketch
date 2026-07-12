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
