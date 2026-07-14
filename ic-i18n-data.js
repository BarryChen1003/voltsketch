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
/* batch 8: entries 105-119 */
(function () {
  var T = {
    'KSZ9031RNX': {
      en: {
        whatIs: 'Gigabit Ethernet physical-layer transceiver (PHY): converts the MAC’s digital data into analog signals on twisted pair (10/100/1000BASE-T), with built-in Auto-MDIX and an RGMII interface to the MAC.',
        func: 'Integrates the analog transceiver front end (DSP, ADC/DAC, line equalization) and the digital MAC interface (RGMII), providing 10/100/1000BASE-T full/half duplex, Auto-Negotiation, Auto-MDIX and multiple LED status outputs, and lets the MAC read/write registers over SMI (MDC/MDIO) for status monitoring and tuning (e.g. RGMII timing skew). At power-up/reset, resistor pull-up/down on specific pins latches configuration (PHY address, mode), simplifying the design with no extra EEPROM.',
        usedIn: 'Industrial/embedded Gigabit Ethernet ports, external PHY for SoCs with an RGMII interface (i.MX6/8, STM32MP1, etc.); the open-source OpenRex board (i.MX6 SOM) uses this part for its on-board GbE.',
        desc: '48-QFN Gigabit Ethernet PHY, RGMII interface to the MAC, supporting 10/100/1000BASE-T, Auto-MDIX and programmable LEDs; PHY address and mode set by power-up strap pins.',
        thermalPad: 'PADDLE GROUND (exposed pad on the die bottom), must be grounded (P_GND to ground).',
        specs: [
          { k: 'Interface', v: 'RGMII (to MAC)' },
          { k: 'Speed', v: '10/100/1000BASE-T, Auto-Negotiation, Auto-MDIX' },
          { k: 'Package', v: '48-QFN 7×7mm' },
          { k: 'Analog supply AVDDH', v: '3.3V or 2.5V (2.5V commercial-temp only)' },
          { k: 'Analog supply AVDDL', v: '1.2V' },
          { k: 'Digital I/O supply DVDDH', v: '3.3V / 2.5V / 1.8V selectable' },
          { k: 'Digital core supply DVDDL', v: '1.2V' },
          { k: 'Management interface', v: 'SMI (MDC/MDIO)' }
        ]
      },
      ja: {
        subcategory: 'イーサネット PHY',
        whatIs: 'Gigabit イーサネット物理層トランシーバ（PHY）：MAC のデジタルデータをツイストペア上のアナログ信号（10/100/1000BASE-T）に変換、Auto-MDIX 内蔵、RGMII インタフェースで MAC に接続。',
        func: 'アナログ送受信フロントエンド（DSP、ADC/DAC、線路等化）とデジタル MAC インタフェース（RGMII）を統合し、10/100/1000BASE-T の全/半二重、Auto-Negotiation、Auto-MDIX、複数 LED 状態出力を提供、SMI（MDC/MDIO）で MAC がレジスタを読み書きし状態監視やパラメータ調整（RGMII タイミングスキュー等）を行う。電源投入/リセット時に特定ピンの抵抗プル/プルダウンで設定（PHY アドレス、モード）をラッチし、追加 EEPROM 不要でシステム設計を簡素化。',
        usedIn: '産業/組込み Gigabit イーサポート、RGMII インタフェースの SoC 用外付け PHY（i.MX6/8、STM32MP1 等）；オープンソースの OpenRex ボード（i.MX6 SOM）は本品をオンボード GbE に採用。',
        desc: '48-QFN Gigabit イーサネット PHY。RGMII で MAC 接続、10/100/1000BASE-T・Auto-MDIX・プログラマブル LED 対応；PHY アドレスとモードは電源投入時の strap ピンで決定。',
        thermalPad: 'PADDLE GROUND（ダイ底面の露出パッド）、接地必須（P_GND を接地へ）。',
        specs: [
          { k: 'インタフェース', v: 'RGMII（MAC 側）' },
          { k: '速度', v: '10/100/1000BASE-T、Auto-Negotiation、Auto-MDIX' },
          { k: 'パッケージ', v: '48-QFN 7×7mm' },
          { k: 'アナログ電源 AVDDH', v: '3.3V または 2.5V（2.5V は商用温度のみ）' },
          { k: 'アナログ電源 AVDDL', v: '1.2V' },
          { k: 'デジタル I/O 電源 DVDDH', v: '3.3V / 2.5V / 1.8V 選択可' },
          { k: 'デジタルコア電源 DVDDL', v: '1.2V' },
          { k: '管理インタフェース', v: 'SMI（MDC/MDIO）' }
        ]
      },
      ko: {
        subcategory: '이더넷 PHY',
        whatIs: 'Gigabit 이더넷 물리 계층 트랜시버(PHY): MAC의 디지털 데이터를 트위스트 페어상의 아날로그 신호(10/100/1000BASE-T)로 변환, Auto-MDIX 내장, RGMII 인터페이스로 MAC 연결.',
        func: '아날로그 송수신 프론트엔드(DSP, ADC/DAC, 라인 등화)와 디지털 MAC 인터페이스(RGMII)를 통합해 10/100/1000BASE-T 전/반이중, Auto-Negotiation, Auto-MDIX, 다중 LED 상태 출력을 제공하고, SMI(MDC/MDIO)로 MAC이 레지스터를 읽고 써 상태 감시와 파라미터 조정(RGMII 타이밍 스큐 등)을 함. 전원 인가/리셋 시 특정 핀의 저항 풀업/다운으로 설정(PHY 주소, 모드)을 래치해 추가 EEPROM 없이 시스템 설계 간소화.',
        usedIn: '산업/임베디드 Gigabit 이더넷 포트, RGMII 인터페이스 SoC용 외장 PHY(i.MX6/8, STM32MP1 등); 오픈소스 OpenRex 보드(i.MX6 SOM)가 본 부품을 온보드 GbE에 채용.',
        desc: '48-QFN Gigabit 이더넷 PHY. RGMII로 MAC 연결, 10/100/1000BASE-T·Auto-MDIX·프로그래머블 LED 지원; PHY 주소와 모드는 전원 인가 시 strap 핀으로 결정.',
        thermalPad: 'PADDLE GROUND(다이 바닥의 노출 패드), 접지 필수(P_GND를 접지로).',
        specs: [
          { k: '인터페이스', v: 'RGMII(MAC 측)' },
          { k: '속도', v: '10/100/1000BASE-T, Auto-Negotiation, Auto-MDIX' },
          { k: '패키지', v: '48-QFN 7×7mm' },
          { k: '아날로그 전원 AVDDH', v: '3.3V 또는 2.5V(2.5V는 상용 온도만)' },
          { k: '아날로그 전원 AVDDL', v: '1.2V' },
          { k: '디지털 I/O 전원 DVDDH', v: '3.3V / 2.5V / 1.8V 선택 가능' },
          { k: '디지털 코어 전원 DVDDL', v: '1.2V' },
          { k: '관리 인터페이스', v: 'SMI(MDC/MDIO)' }
        ]
      }
    },
    'LAN8710A': {
      en: {
        whatIs: '10/100 Ethernet physical-layer transceiver (PHY): converts the MAC’s digital data into analog signals on twisted pair (10BASE-T/100BASE-TX), with an MII or RMII interface to the MAC and built-in HP Auto-MDIX.',
        func: 'Integrates the analog transceiver front end (DSP, clock recovery, equalization, 4B/5B coding, MLT-3/NRZI) and the digital MAC interface (MII or RMII, selected by the RMIISEL strap), providing Auto-Negotiation, HP Auto-MDIX, programmable LEDs and an interrupt output, with SMI (MDC/MDIO) register access for the MAC. At power-up/reset, resistor pull-up/down on specific pins latches configuration (PHY address, mode, MII/RMII select, internal-regulator on/off).',
        usedIn: 'Small embedded 10/100 Ethernet ports, external PHY for MCUs/SoCs (RMII is common on STM32, ESP32, etc.); the open-source Olimex ESP32-POE2 board uses this part for its RMII PoE Ethernet port.',
        desc: '32-QFN 10/100 Ethernet PHY, MII/RMII interface to the MAC (strap-selected), with Auto-Negotiation, HP Auto-MDIX and programmable LEDs; PHY address and mode set by power-up strap pins.',
        thermalPad: 'Exposed pad (VSS, die bottom), must connect to the ground plane through a via array.',
        specs: [
          { k: 'Interface', v: 'MII or RMII (selected by RMIISEL strap)' },
          { k: 'Speed', v: '10BASE-T / 100BASE-TX, Auto-Negotiation, HP Auto-MDIX' },
          { k: 'Package', v: '32-QFN/SQFN' },
          { k: 'I/O supply VDDIO', v: '+1.6V ~ +3.6V variable' },
          { k: 'Digital core supply VDDCR', v: '+1.2V (from internal regulator, or REGOFF strap for external supply)' },
          { k: 'Analog port supply VDD1A/VDD2A', v: '+3.3V' },
          { k: 'Management interface', v: 'SMI (MDC/MDIO)' }
        ]
      },
      ja: {
        subcategory: 'イーサネット PHY',
        whatIs: '10/100 イーサネット物理層トランシーバ（PHY）：MAC のデジタルデータをツイストペア上のアナログ信号（10BASE-T/100BASE-TX）に変換、MII または RMII インタフェースで MAC 接続、HP Auto-MDIX 内蔵。',
        func: 'アナログ送受信フロントエンド（DSP、クロック回復、等化、4B/5B 符号化、MLT-3/NRZI 変換）とデジタル MAC インタフェース（MII か RMII、RMIISEL strap で選択）を統合し、Auto-Negotiation、HP Auto-MDIX、プログラマブル LED、割込み出力を提供、SMI（MDC/MDIO）で MAC がレジスタを読み書き。電源投入/リセット時に特定ピンの抵抗プル/プルダウンで設定（PHY アドレス、動作モード、MII/RMII 選択、内蔵レギュレータ ON/OFF）をラッチ。',
        usedIn: '小型組込み 10/100 イーサポート、MCU/SoC 用外付け PHY（RMII は STM32、ESP32 等で一般的）；オープンソースの Olimex ESP32-POE2 ボードは本品を RMII PoE イーサポートに採用。',
        desc: '32-QFN 10/100 イーサネット PHY。MII/RMII で MAC 接続（strap 選択）、Auto-Negotiation・HP Auto-MDIX・プログラマブル LED 対応；PHY アドレスとモードは電源投入時 strap ピンで決定。',
        thermalPad: '露出パッド（VSS、ダイ底面）、ビアアレイで接地プレーンに接続必須。',
        specs: [
          { k: 'インタフェース', v: 'MII または RMII（RMIISEL strap で選択）' },
          { k: '速度', v: '10BASE-T / 100BASE-TX、Auto-Negotiation、HP Auto-MDIX' },
          { k: 'パッケージ', v: '32-QFN/SQFN' },
          { k: 'I/O 電源 VDDIO', v: '+1.6V ~ +3.6V 可変' },
          { k: 'デジタルコア電源 VDDCR', v: '+1.2V（内蔵レギュレータ供給、または REGOFF strap で外部供給）' },
          { k: 'アナログポート電源 VDD1A/VDD2A', v: '+3.3V' },
          { k: '管理インタフェース', v: 'SMI（MDC/MDIO）' }
        ]
      },
      ko: {
        subcategory: '이더넷 PHY',
        whatIs: '10/100 이더넷 물리 계층 트랜시버(PHY): MAC의 디지털 데이터를 트위스트 페어상의 아날로그 신호(10BASE-T/100BASE-TX)로 변환, MII 또는 RMII 인터페이스로 MAC 연결, HP Auto-MDIX 내장.',
        func: '아날로그 송수신 프론트엔드(DSP, 클록 복원, 등화, 4B/5B 코딩, MLT-3/NRZI 변환)와 디지털 MAC 인터페이스(MII 또는 RMII, RMIISEL strap로 선택)를 통합해 Auto-Negotiation, HP Auto-MDIX, 프로그래머블 LED, 인터럽트 출력을 제공하고, SMI(MDC/MDIO)로 MAC이 레지스터를 읽고 씀. 전원 인가/리셋 시 특정 핀의 저항 풀업/다운으로 설정(PHY 주소, 동작 모드, MII/RMII 선택, 내장 레귤레이터 ON/OFF)을 래치.',
        usedIn: '소형 임베디드 10/100 이더넷 포트, MCU/SoC용 외장 PHY(RMII는 STM32, ESP32 등에서 일반적); 오픈소스 Olimex ESP32-POE2 보드가 본 부품을 RMII PoE 이더넷 포트에 채용.',
        desc: '32-QFN 10/100 이더넷 PHY. MII/RMII로 MAC 연결(strap 선택), Auto-Negotiation·HP Auto-MDIX·프로그래머블 LED 지원; PHY 주소와 모드는 전원 인가 시 strap 핀으로 결정.',
        thermalPad: '노출 패드(VSS, 다이 바닥), 비아 어레이로 접지 플레인에 연결 필수.',
        specs: [
          { k: '인터페이스', v: 'MII 또는 RMII(RMIISEL strap로 선택)' },
          { k: '속도', v: '10BASE-T / 100BASE-TX, Auto-Negotiation, HP Auto-MDIX' },
          { k: '패키지', v: '32-QFN/SQFN' },
          { k: 'I/O 전원 VDDIO', v: '+1.6V ~ +3.6V 가변' },
          { k: '디지털 코어 전원 VDDCR', v: '+1.2V(내장 레귤레이터 공급, 또는 REGOFF strap로 외부 공급)' },
          { k: '아날로그 포트 전원 VDD1A/VDD2A', v: '+3.3V' },
          { k: '관리 인터페이스', v: 'SMI(MDC/MDIO)' }
        ]
      }
    },
    'W25Q128JV': {
      en: {
        subcategory: 'Serial Flash memory (SPI / Dual SPI / Quad SPI NOR Flash)',
        whatIs: 'Serial NOR Flash memory: provides 128M-bit (16MB) of non-volatile storage over an SPI, Dual SPI or Quad SPI interface, for an MCU/SoC to hold boot code, firmware or data that survives power loss.',
        func: 'Internally a NOR Flash memory array, communicating with the host via {CS}, CLK and DI/DO (IO0–IO3 in Quad mode); supports standard/dual/quad SPI read-write commands, 256-byte page programming and sector/block/chip erase. The Status Register block-protect bits plus the {WP} pin provide hardware write protection; once the Status Register-2 QE bit enables Quad SPI, {WP} becomes IO2 and {HOLD}/{RESET} becomes IO3.',
        usedIn: 'The SPI flash commonly used on open-source designs like the Raspberry Pi Pico and many ESP32 dev boards (holding the boot image/firmware); also widely used in routers, industrial boards, cameras and other embedded systems needing external high-capacity non-volatile storage.',
        desc: '128M-bit (16MB) 3V-series SPI NOR Flash supporting standard/dual/quad SPI, SOIC-8 208-mil package, Industrial/Industrial-Plus grade.',
        specs: [
          { k: 'Capacity', v: '128M-bit (16MB)' },
          { k: 'Interface', v: 'Standard SPI / Dual SPI / Quad SPI' },
          { k: 'Supply voltage', v: 'see datasheet (cover marks it a 3V series; the captured page lacks the full voltage-range table)' },
          { k: 'Package', v: 'SOIC-8 208-mil (Package Code S); also available in WSON, SOIC-16, TFBGA, WLCSP' },
          { k: 'Grade', v: 'Industrial / Industrial Plus Grade' },
          { k: 'Quad Enable', v: 'Controlled by the Status Register-2 QE bit; when QE=1, {WP} becomes IO2 and {HOLD}/{RESET} becomes IO3' },
          { k: 'Document revision', v: 'Revision F, released 2018-03-27' }
        ]
      },
      ja: {
        subcategory: 'シリアル Flash メモリ（SPI / Dual SPI / Quad SPI NOR Flash）',
        whatIs: 'シリアル NOR Flash メモリ：SPI、Dual SPI または Quad SPI インタフェースで 128M-bit（16MB）の不揮発性ストレージを提供、MCU/SoC の起動コード・ファームウェア・データを電源断後も保持。',
        func: '内部は NOR Flash メモリアレイで、{CS}、CLK、DI/DO（Quad モードでは IO0–IO3）でホストと通信；標準/デュアル/クアッド SPI 読み書き命令、256B ページ書込み、セクタ/ブロック/全体消去に対応。Status Register のブロックプロテクトビットと {WP} ピンでハードウェア書込み保護；Status Register-2 の QE ビットで Quad SPI を有効にすると {WP} は IO2、{HOLD}/{RESET} は IO3 に変わる。',
        usedIn: 'Raspberry Pi Pico や多くの ESP32 開発ボードなどオープンソース設計で一般的な SPI flash（起動イメージ/ファームウェア格納）；ルータ、産業ボード、カメラ等、外付け大容量不揮発ストレージが必要な組込みシステムでも広く使用。',
        desc: '128M-bit（16MB）3V シリーズ SPI NOR Flash、標準/デュアル/クアッド SPI 対応、SOIC-8 208-mil パッケージ、Industrial/Industrial Plus グレード。',
        specs: [
          { k: '容量', v: '128M-bit（16MB）' },
          { k: 'インタフェース', v: '標準 SPI / Dual SPI / Quad SPI' },
          { k: '電源電圧', v: 'datasheet 参照（表紙は 3V シリーズ表記、抽出ページに完全な電圧範囲表なし）' },
          { k: 'パッケージ', v: 'SOIC-8 208-mil（Package Code S）；WSON、SOIC-16、TFBGA、WLCSP 等の選択肢もあり' },
          { k: 'グレード', v: 'Industrial / Industrial Plus Grade' },
          { k: 'Quad Enable', v: 'Status Register-2 の QE ビットで制御；QE=1 で {WP} は IO2、{HOLD}/{RESET} は IO3 に' },
          { k: 'ドキュメント版', v: 'Revision F、発行日 2018-03-27' }
        ]
      },
      ko: {
        subcategory: '시리얼 Flash 메모리(SPI / Dual SPI / Quad SPI NOR Flash)',
        whatIs: '시리얼 NOR Flash 메모리: SPI, Dual SPI 또는 Quad SPI 인터페이스로 128M-bit(16MB) 비휘발성 저장 공간을 제공, MCU/SoC의 부팅 코드·펌웨어·데이터를 전원 차단 후에도 보존.',
        func: '내부는 NOR Flash 메모리 어레이로 {CS}, CLK, DI/DO(Quad 모드에서 IO0–IO3)로 호스트와 통신; 표준/듀얼/쿼드 SPI 읽기·쓰기 명령, 256B 페이지 쓰기, 섹터/블록/전체 소거 지원. Status Register 블록 보호 비트와 {WP} 핀으로 하드웨어 쓰기 보호; Status Register-2의 QE 비트로 Quad SPI를 활성화하면 {WP}는 IO2, {HOLD}/{RESET}은 IO3으로 바뀜.',
        usedIn: 'Raspberry Pi Pico와 여러 ESP32 개발 보드 등 오픈소스 설계에서 흔히 쓰는 SPI flash(부팅 이미지/펌웨어 저장); 라우터, 산업 보드, 카메라 등 외장 대용량 비휘발성 저장이 필요한 임베디드 시스템에서도 널리 사용.',
        desc: '128M-bit(16MB) 3V 시리즈 SPI NOR Flash, 표준/듀얼/쿼드 SPI 지원, SOIC-8 208-mil 패키지, Industrial/Industrial Plus 등급.',
        specs: [
          { k: '용량', v: '128M-bit(16MB)' },
          { k: '인터페이스', v: '표준 SPI / Dual SPI / Quad SPI' },
          { k: '공급 전압', v: 'datasheet 참조(표지는 3V 시리즈 표기, 추출 페이지에 완전한 전압 범위 표 없음)' },
          { k: '패키지', v: 'SOIC-8 208-mil(Package Code S); WSON, SOIC-16, TFBGA, WLCSP 등 선택지도 있음' },
          { k: '등급', v: 'Industrial / Industrial Plus Grade' },
          { k: 'Quad Enable', v: 'Status Register-2의 QE 비트로 제어; QE=1이면 {WP}는 IO2, {HOLD}/{RESET}은 IO3으로' },
          { k: '문서 버전', v: 'Revision F, 발행일 2018-03-27' }
        ]
      }
    },
    'RT6150': {
      en: {
        subcategory: 'DC/DC converter (current-mode Buck-Boost)',
        whatIs: 'Current-mode Buck-Boost step-down/step-up DC/DC converter: holds a regulated output whether the input is above, below or equal to the output, ideal for portable products powered by one Li-ion cell or several alkaline/NiMH cells.',
        func: 'Built-in two N-MOSFET and two P-MOSFET switches, fixed 1MHz switching frequency; automatically and smoothly transitions between Buck, Boost and Buck-Boost modes per the VIN/VOUT relationship. Pulling PS low enters power-save mode (PSM, ~60µA quiescent), high gives fixed-frequency switching; EN controls on/off (VOUT disconnects from VIN when off); FB can set the output voltage (1.8V–5.5V) via an external divider (fixed-output versions tie FB to VOUT).',
        usedIn: 'The buck-boost converter used on the official Raspberry Pi Pico board, converting USB 5V or battery input to a stable on-board rail; also used in single-Li-ion portable devices and handheld instruments needing wide-input regulation.',
        desc: '1MHz current-mode Buck-Boost converter, 1.8–5.5V input, WDFN-10L package (3×3mm or 2.5×2.5mm depending on part).',
        thermalPad: 'Exposed Pad (datasheet pin 11) is power ground; solder to a large PCB copper area and ground it for heat dissipation.',
        specs: [
          { k: 'Topology', v: 'Buck-Boost (synchronous rectification, up to ~90% efficiency)' },
          { k: 'Input voltage range', v: '1.8V ~ 5.5V' },
          { k: 'Output voltage', v: 'fixed 3.3V (RT6150B-33) or adjustable 1.8V~5.5V (FB divider)' },
          { k: 'Switching frequency', v: 'fixed 1MHz' },
          { k: 'Max continuous output current', v: 'see datasheet (rated ~800mA; actual depends on VIN/VOUT)' },
          { k: 'PSM quiescent current', v: '~60µA' },
          { k: 'Shutdown current', v: '< 1µA' },
          { k: 'Package', v: 'WDFN-10L 3×3mm (RT6150A) / WDFN-10L 2.5×2.5mm (RT6150B)' }
        ]
      },
      ja: {
        subcategory: 'DC/DC コンバータ（電流モード Buck-Boost）',
        whatIs: '電流モード Buck-Boost 降昇圧 DC/DC コンバータ：入力が出力より高い/低い/等しいいずれでも安定化出力を維持、単一リチウム電池や複数のアルカリ/ニッケル水素電池駆動のポータブル製品に好適。',
        func: '2 個の N-MOSFET と 2 個の P-MOSFET スイッチを内蔵、固定 1MHz スイッチング；VIN と VOUT の関係に応じ Buck、Boost、Buck-Boost モード間を自動でスムーズに切替。PS をローで省電力モード（PSM、静止電流約 60µA）、ハイで固定周波数スイッチング；EN で ON/OFF 制御（OFF 時 VOUT は VIN から切離）；FB は外付け分圧で出力電圧（1.8V–5.5V）を調整（固定出力版は FB を VOUT に接続）。',
        usedIn: 'Raspberry Pi Pico 公式ボード採用の buck-boost 電源コンバータで、USB 5V やバッテリ入力を安定したオンボード電源に変換；単一リチウム電池ポータブル機器や携帯計測器等、広入力レンジの安定化が必要な用途にも。',
        desc: '1MHz 電流モード Buck-Boost コンバータ、入力 1.8–5.5V、WDFN-10L パッケージ（3×3mm または 2.5×2.5mm、型番による）。',
        thermalPad: 'Exposed Pad（datasheet ピン 11）はパワーグランド、放熱のため大面積 PCB 銅箔に半田付けし接地。',
        specs: [
          { k: 'トポロジ', v: 'Buck-Boost（同期整流、効率最高約 90%）' },
          { k: '入力電圧範囲', v: '1.8V ~ 5.5V' },
          { k: '出力電圧', v: '固定 3.3V（RT6150B-33）または可変 1.8V~5.5V（FB 分圧）' },
          { k: 'スイッチング周波数', v: '固定 1MHz' },
          { k: '最大連続出力電流', v: 'datasheet 参照（定格約 800mA、実際は VIN/VOUT 条件次第）' },
          { k: 'PSM 静止電流', v: '約 60µA' },
          { k: 'シャットダウン電流', v: '< 1µA' },
          { k: 'パッケージ', v: 'WDFN-10L 3×3mm（RT6150A）／WDFN-10L 2.5×2.5mm（RT6150B）' }
        ]
      },
      ko: {
        subcategory: 'DC/DC 컨버터(전류 모드 Buck-Boost)',
        whatIs: '전류 모드 Buck-Boost 강압/승압 DC/DC 컨버터: 입력이 출력보다 높거나 낮거나 같아도 안정화 출력을 유지, 단일 리튬 전지나 다수 알칼리/니켈수소 전지 구동 휴대 제품에 적합.',
        func: '2개 N-MOSFET와 2개 P-MOSFET 스위치 내장, 고정 1MHz 스위칭; VIN과 VOUT 관계에 따라 Buck, Boost, Buck-Boost 모드 간을 자동으로 매끄럽게 전환. PS를 로우로 절전 모드(PSM, 정지 전류 약 60µA), 하이로 고정 주파수 스위칭; EN으로 ON/OFF 제어(OFF 시 VOUT은 VIN에서 분리); FB는 외부 분압으로 출력 전압(1.8V–5.5V) 조정(고정 출력판은 FB를 VOUT에 연결).',
        usedIn: 'Raspberry Pi Pico 공식 보드에 채용된 buck-boost 전원 컨버터로 USB 5V나 배터리 입력을 안정된 온보드 전원으로 변환; 단일 리튬 전지 휴대 기기나 휴대 계측기 등 넓은 입력 범위 안정화가 필요한 용도에도.',
        desc: '1MHz 전류 모드 Buck-Boost 컨버터, 입력 1.8–5.5V, WDFN-10L 패키지(3×3mm 또는 2.5×2.5mm, 부품에 따라).',
        thermalPad: 'Exposed Pad(datasheet 핀 11)는 파워 그라운드, 방열을 위해 대면적 PCB 동박에 납땜하고 접지.',
        specs: [
          { k: '토폴로지', v: 'Buck-Boost(동기 정류, 효율 최대 약 90%)' },
          { k: '입력 전압 범위', v: '1.8V ~ 5.5V' },
          { k: '출력 전압', v: '고정 3.3V(RT6150B-33) 또는 가변 1.8V~5.5V(FB 분압)' },
          { k: '스위칭 주파수', v: '고정 1MHz' },
          { k: '최대 연속 출력 전류', v: 'datasheet 참조(정격 약 800mA, 실제는 VIN/VOUT 조건에 따라)' },
          { k: 'PSM 정지 전류', v: '약 60µA' },
          { k: '셧다운 전류', v: '< 1µA' },
          { k: '패키지', v: 'WDFN-10L 3×3mm(RT6150A) / WDFN-10L 2.5×2.5mm(RT6150B)' }
        ]
      }
    },
    'AXP209': {
      en: {
        subcategory: 'Power management IC (PMIC, Li-ion charging + multi-rail DCDC/LDO)',
        whatIs: 'Single Li-ion-cell power-system management IC (PMIC): integrates a USB/AC-compatible PWM charger, two Buck DC-DCs, five LDOs, a multi-channel 12-bit ADC and four configurable GPIOs, letting the application processor control and monitor the whole power system over a TWSI (I2C-like) interface.',
        func: 'An Intelligent Power Select (IPS) circuit safely distributes power among the external AC source, Li-ion battery and system load, still running from the external source when no battery is present; built-in OVP/UVP, OTP (over-temperature) and OCP (over-current) protection; a multi-channel 12-bit ADC measures battery voltage/current, external input voltage/current and die temperature, with a built-in coulomb counter for the fuel gauge to estimate remaining charge; the host enables/disables each rail, sets output voltages and reads measurements via TWSI register access.',
        usedIn: 'Open-source single-board computers built around Allwinner A10/A20 SoCs such as the Olimex A20-OLinuXino-Lime and Cubieboard, serving as the companion PMIC that supplies the core/memory/peripheral rails and manages Li-ion charge/discharge.',
        desc: 'Single-cell power-management IC integrating Li-ion charging, two Bucks, five LDOs, a multi-channel 12-bit ADC and four GPIOs, 48-pin QFN (6×6mm), TWSI control interface.',
        thermalPad: 'Exposed Pad (datasheet pin-table pin 49) must connect to system ground.',
        specs: [
          { k: 'Power rails', v: '2 Buck DC-DC + 5 LDO (per-rail voltage/current limits in the full datasheet table)' },
          { k: 'ADC', v: 'multi-channel 12-bit ADC, measuring battery V/I, ACIN, VBUS, die temperature, GPIO, etc.' },
          { k: 'Control interface', v: 'TWSI (Two Wire Serial Interface, I2C-like)' },
          { k: 'GPIO', v: '4 configurable GPIOs' },
          { k: 'Protection', v: 'OVP/UVP, OTP (over-temp), OCP (over-current)' },
          { k: 'Package', v: '48-pin QFN, 6mm × 6mm (with ground Exposed Pad)' }
        ]
      },
      ja: {
        subcategory: '電源管理 IC（PMIC、リチウム電池充電 + 多レール DCDC/LDO）',
        whatIs: '単一リチウム電池電源システム管理 IC（PMIC）：USB/AC 対応 PWM 充電器、2 系統 Buck DC-DC、5 系統 LDO、多チャネル 12-bit ADC、4 個の設定可能 GPIO を統合し、TWSI（I2C 類似）インタフェースでアプリケーションプロセッサが電源システム全体を制御・監視。',
        func: 'Intelligent Power Select（IPS）回路が外部 AC 電源・リチウム電池・システム負荷間で電力を安全配分、電池がなくても外部電源で単独動作可；OVP/UVP、OTP（過温）、OCP（過電流）保護内蔵；多チャネル 12-bit ADC で電池電圧/電流、外部入力電圧/電流、チップ温度を測定し、内蔵クーロンカウンタで燃料計（Fuel Gauge）が残量を推定；ホストが TWSI レジスタ経由で各電源レールの有効/無効、出力電圧設定、測定データ読み出しを行う。',
        usedIn: 'Olimex A20-OLinuXino-Lime、Cubieboard 等の全志（Allwinner）A10/A20 系 SoC を核とするオープンソース単板コンピュータで、コア/メモリ/周辺の各電源を供給しリチウム電池の充放電を管理する付属 PMIC として。',
        desc: 'リチウム電池充電、2 系統 Buck、5 系統 LDO、多チャネル 12-bit ADC、4 個 GPIO を統合した単セル電源管理 IC、48-pin QFN（6×6mm）、TWSI 制御インタフェース。',
        thermalPad: 'Exposed Pad（datasheet ピン表の 49 ピン）はシステムグランドに接続必須。',
        specs: [
          { k: '電源レール', v: '2 系統 Buck DC-DC + 5 系統 LDO（各レール電圧/電流上限は datasheet 完全表参照）' },
          { k: 'ADC', v: '多チャネル 12-bit ADC、電池 V/I、ACIN、VBUS、チップ温度、GPIO 等を測定' },
          { k: '制御インタフェース', v: 'TWSI（Two Wire Serial Interface、I2C 類似）' },
          { k: 'GPIO', v: '4 個の設定可能 GPIO' },
          { k: '保護', v: 'OVP/UVP、OTP（過温）、OCP（過電流）' },
          { k: 'パッケージ', v: '48-pin QFN、6mm × 6mm（接地 Exposed Pad 付）' }
        ]
      },
      ko: {
        subcategory: '전원 관리 IC(PMIC, 리튬 전지 충전 + 다중 레일 DCDC/LDO)',
        whatIs: '단일 리튬 전지 전원 시스템 관리 IC(PMIC): USB/AC 호환 PWM 충전기, 2계통 Buck DC-DC, 5계통 LDO, 다채널 12-bit ADC, 4개의 설정 가능 GPIO를 통합하고 TWSI(I2C 유사) 인터페이스로 애플리케이션 프로세서가 전원 시스템 전체를 제어·감시.',
        func: 'Intelligent Power Select(IPS) 회로가 외부 AC 전원·리튬 전지·시스템 부하 간에 전력을 안전 분배, 전지가 없어도 외부 전원으로 단독 동작 가능; OVP/UVP, OTP(과열), OCP(과전류) 보호 내장; 다채널 12-bit ADC로 전지 전압/전류, 외부 입력 전압/전류, 칩 온도를 측정하고 내장 쿨롱 카운터로 연료 게이지(Fuel Gauge)가 잔량 추정; 호스트가 TWSI 레지스터로 각 전원 레일 활성/비활성, 출력 전압 설정, 측정 데이터 읽기를 수행.',
        usedIn: 'Olimex A20-OLinuXino-Lime, Cubieboard 등 Allwinner A10/A20 계열 SoC를 핵심으로 하는 오픈소스 단일 보드 컴퓨터에서 코어/메모리/주변 각 전원을 공급하고 리튬 전지 충방전을 관리하는 부속 PMIC로.',
        desc: '리튬 전지 충전, 2계통 Buck, 5계통 LDO, 다채널 12-bit ADC, 4개 GPIO를 통합한 단일 셀 전원 관리 IC, 48-pin QFN(6×6mm), TWSI 제어 인터페이스.',
        thermalPad: 'Exposed Pad(datasheet 핀 표의 49번 핀)는 시스템 접지에 연결 필수.',
        specs: [
          { k: '전원 레일', v: '2계통 Buck DC-DC + 5계통 LDO(각 레일 전압/전류 상한은 datasheet 전체 표 참조)' },
          { k: 'ADC', v: '다채널 12-bit ADC, 전지 V/I, ACIN, VBUS, 칩 온도, GPIO 등 측정' },
          { k: '제어 인터페이스', v: 'TWSI(Two Wire Serial Interface, I2C 유사)' },
          { k: 'GPIO', v: '4개의 설정 가능 GPIO' },
          { k: '보호', v: 'OVP/UVP, OTP(과열), OCP(과전류)' },
          { k: '패키지', v: '48-pin QFN, 6mm × 6mm(접지 Exposed Pad 포함)' }
        ]
      }
    },
    'UCC21711-Q1': {
      en: {
        subcategory: 'Isolated gate driver (single-channel, SiC/IGBT, with isolated analog sensing)',
        whatIs: 'Isolated single-channel gate driver: passes the controller-side low-voltage PWM logic signal across galvanic isolation to the high-voltage side to drive a SiC MOSFET or IGBT gate, and reports faults such as overcurrent or short-circuit back to the controller.',
        func: 'Uses SiO2 capacitive isolation to separate input and output sides, supporting 1.5kVRMS working voltage, 5.7kVRMS (single-channel) reinforced isolation, 12.8kVPK surge immunity, isolation lifetime >40 years and CMTI ≥150V/ns. The output stage provides ±10A source/sink drive; the separate OUTH/OUTL outputs allow individual switching-speed tuning via external resistors. A built-in OC (overcurrent) detection input supports SenseFET, DESAT or shunt-resistor sensing; on fault it reports via {FLT} (open-collector, active-low) and performs a 400mA soft turn-off to protect the power device. It also integrates a 4A active Miller clamp (CLMPI) against dv/dt false turn-on, and an isolated analog-to-PWM converter (AIN→APWM) for isolated measurement of temperature (NTC/PTC/thermal diode) or high-voltage DC-Link/phase voltage without an extra isolation amplifier. RST/EN serves as both output enable/disable and DESAT fault reset. VDD-COM UVLO drives a power-good flag on RDY.',
        usedIn: 'EV traction inverters, on-board chargers (OBC) and charging piles, HEV/EV DC/DC converters and other SiC/IGBT high-voltage switching drive applications.',
        desc: 'SOIC-16 (DW), automotive (AEC-Q100) 5.7kVRMS single-channel reinforced isolated gate driver, ±10A source/sink, OC overcurrent detection (pin2) + isolated analog PWM sensing output (APWM) + 4A active Miller clamp. Same pin positions as the sibling UCC21751-Q1, but its pin2 is DESAT (not OC) with a VDD-floating trigger reference — different function, so the two are not directly interchangeable.',
        thermalPad: 'see datasheet (the dump did not record exposed-pad/EP information).',
        specs: [
          { k: 'Isolation rating', v: '5.7kVRMS (single-channel reinforced), 12.8kVPK surge, 1.5kVRMS working voltage' },
          { k: 'Switch device', v: 'SiC MOSFET / IGBT, up to 2121Vpk' },
          { k: 'Drive voltage (VDD-VEE)', v: 'max 33V (recommended VDD-COM 13~33V)' },
          { k: 'Drive current', v: '±10A (source/sink), separate OUTH/OUTL outputs' },
          { k: 'CMTI', v: '≥150V/ns (min)' },
          { k: 'Overcurrent response', v: '270ns (OC, typ)' },
          { k: 'Active Miller clamp', v: '4A (CLMPI)' },
          { k: 'Soft turn-off current', v: '400mA' },
          { k: 'VCC supply', v: '3.0~5.5V' },
          { k: 'RST/EN min reset pulse', v: '1000ns (recommended operating, min)' },
          { k: 'Propagation delay / part skew', v: '130ns (max) / 30ns (max)' },
          { k: 'Junction temperature', v: '-40°C~150°C (ambient -40°C~125°C)' },
          { k: 'Package', v: 'SOIC-16 (DW), creepage/clearance >8mm' },
          { k: 'Qualification', v: 'AEC-Q100 grade 1; UL1577 component recognition (planned)' }
        ]
      },
      ja: {
        subcategory: '絶縁ゲートドライバ（1 チャネル、SiC/IGBT、絶縁アナログセンシング付）',
        whatIs: '絶縁 1 チャネルゲートドライバ：コントローラ側の低圧 PWM 論理信号を電気的絶縁を跨いで高圧側へ伝送し、SiC MOSFET または IGBT のゲートを駆動、過電流・短絡等の故障状態をコントローラに報告。',
        func: 'SiO2 容量絶縁技術で入力/出力側を分離、1.5kVRMS 動作電圧、5.7kVRMS（1 チャネル）強化絶縁耐圧、12.8kVPK サージ免疫、絶縁寿命 >40 年、CMTI ≥150V/ns に対応。出力段は ±10A source/sink 駆動能力、OUTH/OUTL 分離出力で外付け抵抗により開閉速度を個別調整可。OC（過電流）検出入力を内蔵し SenseFET、DESAT、シャント抵抗など複数の検出方式に対応；故障検出時は {FLT}（オープンコレクタ、ロー動作）で報告し、400mA でソフトターンオフ保護。さらに 4A アクティブミラークランプ（CLMPI）で dv/dt 誤導通を防止、絶縁アナログ-PWM 変換器（AIN→APWM）で温度（NTC/PTC/熱ダイオード）や高圧 DC-Link/相電圧の絶縁測定を追加絶縁アンプなしで実現。RST/EN は出力イネーブル/遮断と DESAT 故障リセットを兼用。VDD-COM 側 UVLO 保護が RDY ピンに電源良好フラグを出力。',
        usedIn: '電気自動車の牽引インバータ、車載充電器（OBC）と充電スタンド、HEV/EV 用 DC/DC コンバータ等の SiC/IGBT 高圧スイッチ駆動用途。',
        desc: 'SOIC-16（DW）、車載（AEC-Q100）5.7kVRMS 1 チャネル強化絶縁ゲートドライバ、±10A source/sink、OC 過電流検出（pin2）+絶縁アナログ PWM センシング出力（APWM）+4A アクティブミラークランプ。同シリーズ UCC21751-Q1 とピン位置は同じだが pin2 が DESAT（OC でない）・トリガ基準が VDD 追従で機能が異なり、直接互換不可。',
        thermalPad: 'datasheet 参照（dump に露出パッド/EP 情報の記載なし）。',
        specs: [
          { k: '絶縁耐圧', v: '5.7kVRMS（1 チャネル強化絶縁）、12.8kVPK サージ、動作電圧 1.5kVRMS' },
          { k: '対応スイッチ素子', v: 'SiC MOSFET / IGBT、最高 2121Vpk' },
          { k: '駆動電圧（VDD-VEE）', v: '最大 33V（推奨 VDD-COM 13~33V）' },
          { k: '駆動電流', v: '±10A（source/sink）、分離 OUTH/OUTL 出力' },
          { k: 'CMTI', v: '≥150V/ns（min）' },
          { k: '過電流保護応答', v: '270ns（OC、典型）' },
          { k: 'アクティブミラークランプ', v: '4A（CLMPI）' },
          { k: 'ソフトターンオフ電流', v: '400mA' },
          { k: 'VCC 供給', v: '3.0~5.5V' },
          { k: 'RST/EN リセット最短パルス', v: '1000ns（推奨動作条件、min）' },
          { k: '伝搬遅延/part skew', v: '130ns（max）/ 30ns（max）' },
          { k: '動作接合温度', v: '-40°C~150°C（周囲温度 -40°C~125°C）' },
          { k: 'パッケージ', v: 'SOIC-16（DW）、沿面/空間距離 >8mm' },
          { k: '認証', v: 'AEC-Q100 温度グレード1；UL1577 素子認証（計画中）' }
        ]
      },
      ko: {
        subcategory: '절연 게이트 드라이버(단일 채널, SiC/IGBT, 절연 아날로그 센싱 포함)',
        whatIs: '절연 단일 채널 게이트 드라이버: 컨트롤러 측 저압 PWM 논리 신호를 전기 절연을 넘어 고압 측으로 전송해 SiC MOSFET 또는 IGBT 게이트를 구동하고, 과전류·단락 등 고장 상태를 컨트롤러에 보고.',
        func: 'SiO2 용량 절연 기술로 입력/출력 측을 분리, 1.5kVRMS 동작 전압, 5.7kVRMS(단일 채널) 강화 절연 내압, 12.8kVPK 서지 면역, 절연 수명 >40년, CMTI ≥150V/ns 지원. 출력단은 ±10A source/sink 구동 능력, OUTH/OUTL 분리 출력으로 외부 저항을 통해 개폐 속도 개별 조정 가능. OC(과전류) 감지 입력을 내장해 SenseFET, DESAT, 션트 저항 등 여러 감지 방식 지원; 고장 감지 시 {FLT}(오픈 컬렉터, 로우 동작)로 보고하고 400mA로 소프트 턴오프 보호. 또한 4A 액티브 밀러 클램프(CLMPI)로 dv/dt 오도통 방지, 절연 아날로그-PWM 변환기(AIN→APWM)로 온도(NTC/PTC/열 다이오드)나 고압 DC-Link/상전압의 절연 측정을 추가 절연 앰프 없이 구현. RST/EN은 출력 인에이블/차단과 DESAT 고장 리셋을 겸용. VDD-COM 측 UVLO 보호가 RDY 핀에 전원 양호 플래그 출력.',
        usedIn: '전기차 견인 인버터, 차량 탑재 충전기(OBC)와 충전 스탠드, HEV/EV용 DC/DC 컨버터 등 SiC/IGBT 고압 스위치 구동 용도.',
        desc: 'SOIC-16(DW), 차량용(AEC-Q100) 5.7kVRMS 단일 채널 강화 절연 게이트 드라이버, ±10A source/sink, OC 과전류 감지(pin2)+절연 아날로그 PWM 센싱 출력(APWM)+4A 액티브 밀러 클램프. 동일 시리즈 UCC21751-Q1과 핀 위치는 같으나 pin2가 DESAT(OC 아님)·트리거 기준이 VDD 추종으로 기능이 달라 직접 호환 불가.',
        thermalPad: 'datasheet 참조(dump에 노출 패드/EP 정보 기재 없음).',
        specs: [
          { k: '절연 내압', v: '5.7kVRMS(단일 채널 강화 절연), 12.8kVPK 서지, 동작 전압 1.5kVRMS' },
          { k: '적용 스위치 소자', v: 'SiC MOSFET / IGBT, 최고 2121Vpk' },
          { k: '구동 전압(VDD-VEE)', v: '최대 33V(권장 VDD-COM 13~33V)' },
          { k: '구동 전류', v: '±10A(source/sink), 분리 OUTH/OUTL 출력' },
          { k: 'CMTI', v: '≥150V/ns(min)' },
          { k: '과전류 보호 응답', v: '270ns(OC, 전형)' },
          { k: '액티브 밀러 클램프', v: '4A(CLMPI)' },
          { k: '소프트 턴오프 전류', v: '400mA' },
          { k: 'VCC 공급', v: '3.0~5.5V' },
          { k: 'RST/EN 리셋 최소 펄스', v: '1000ns(권장 동작 조건, min)' },
          { k: '전파 지연/part skew', v: '130ns(max) / 30ns(max)' },
          { k: '동작 접합 온도', v: '-40°C~150°C(주위 온도 -40°C~125°C)' },
          { k: '패키지', v: 'SOIC-16(DW), 연면/공간 거리 >8mm' },
          { k: '인증', v: 'AEC-Q100 온도 등급1; UL1577 소자 인증(계획 중)' }
        ]
      }
    },
    'UCC21751-Q1': {
      en: {
        subcategory: 'Isolated gate driver (single-channel, SiC/IGBT, with isolated analog sensing)',
        whatIs: 'Isolated single-channel gate driver: passes the controller-side low-voltage PWM logic signal across galvanic isolation to the high-voltage side to drive a SiC MOSFET or IGBT gate, reporting short-circuit/overcurrent faults via DESAT (desaturation) detection.',
        func: 'Uses SiO2 capacitive isolation to separate input and output sides, supporting 1.5kVRMS working voltage, 5.7kVRMS (single-channel) reinforced isolation, 12.8kVPK surge immunity, isolation lifetime >40 years and CMTI ≥150V/ns. The output stage provides ±10A source/sink drive; separate OUTH/OUTL outputs allow individual switching-speed tuning. A built-in DESAT (desaturation current protection) input has a VDD-floating reference (COM-0.3V~VDD+0.3V), supporting short-circuit protection for SiC/IGBT up to 2121V DC working voltage; on fault it reports via {FLT} (open-collector, active-low) and performs a 400mA soft turn-off. It also integrates a 4A active Miller clamp (CLMPI) against dv/dt false turn-on, and an isolated analog-to-PWM converter (AIN→APWM) for isolated temperature or high-voltage DC-Link/phase-voltage measurement. RST/EN serves as both output enable/disable and DESAT fault reset; per the datasheet recommended operating conditions the minimum reset pulse is 800ns. VDD-COM UVLO drives a power-good flag on RDY.',
        usedIn: 'EV traction inverters, on-board chargers (OBC) and charging piles, HEV/EV DC/DC converters and other SiC/IGBT high-voltage switching drive applications.',
        desc: 'SOIC-16 (DW), automotive (AEC-Q100) 5.7kVRMS single-channel reinforced isolated gate driver, ±10A source/sink, DESAT desaturation protection (pin2, VDD-floating reference) + isolated analog PWM sensing output (APWM) + 4A active Miller clamp. Same pin positions as the sibling UCC21711-Q1, but its pin2 is OC (not DESAT) with a fixed COM-referenced -0.3~6V trigger — different function, so the two are not directly interchangeable.',
        thermalPad: 'see datasheet (the dump did not record exposed-pad/EP information).',
        specs: [
          { k: 'Isolation rating', v: '5.7kVRMS (single-channel reinforced), 12.8kVPK surge, 1.5kVRMS working voltage' },
          { k: 'Switch device', v: 'SiC MOSFET / IGBT, up to 2121V DC working voltage' },
          { k: 'Drive voltage (VDD-VEE)', v: 'max 33V (recommended VDD-COM 13~33V)' },
          { k: 'Drive current', v: '±10A (source/sink), separate OUTH/OUTL outputs' },
          { k: 'CMTI', v: '≥150V/ns (min)' },
          { k: 'DESAT response', v: '200ns (typ)' },
          { k: 'Active Miller clamp', v: '4A (CLMPI)' },
          { k: 'Soft turn-off current', v: '400mA' },
          { k: 'VCC supply', v: '3.0~5.5V' },
          { k: 'RST/EN min reset pulse', v: '800ns (recommended operating, min)' },
          { k: 'Propagation delay / part skew', v: '130ns (max) / 30ns (max)' },
          { k: 'Junction temperature', v: '-40°C~150°C (ambient -40°C~125°C)' },
          { k: 'Package', v: 'SOIC-16 (DW), creepage/clearance >8mm' },
          { k: 'Qualification', v: 'AEC-Q100 grade 1; UL1577 component recognition (planned)' }
        ]
      },
      ja: {
        subcategory: '絶縁ゲートドライバ（1 チャネル、SiC/IGBT、絶縁アナログセンシング付）',
        whatIs: '絶縁 1 チャネルゲートドライバ：コントローラ側の低圧 PWM 論理信号を電気的絶縁を跨いで高圧側へ伝送し、SiC MOSFET または IGBT のゲートを駆動、DESAT（脱飽和）検出で短絡/過電流故障を報告。',
        func: 'SiO2 容量絶縁技術で入力/出力側を分離、1.5kVRMS 動作電圧、5.7kVRMS（1 チャネル）強化絶縁耐圧、12.8kVPK サージ免疫、絶縁寿命 >40 年、CMTI ≥150V/ns。出力段は ±10A source/sink、OUTH/OUTL 分離出力で開閉速度を個別調整可。DESAT（脱飽和電流保護）検出入力は基準が VDD 追従（COM-0.3V~VDD+0.3V）で、最高 2121V DC 動作電圧の SiC/IGBT 短絡保護に対応；故障時は {FLT}（オープンコレクタ、ロー動作）で報告し 400mA ソフトターンオフ。さらに 4A アクティブミラークランプ（CLMPI）、絶縁アナログ-PWM 変換器（AIN→APWM）で温度や高圧 DC-Link/相電圧の絶縁測定。RST/EN は出力イネーブル/遮断と DESAT 故障リセットを兼用、datasheet 推奨動作条件でリセット最短パルスは 800ns。VDD-COM 側 UVLO が RDY に電源良好フラグを出力。',
        usedIn: '電気自動車の牽引インバータ、車載充電器（OBC）と充電スタンド、HEV/EV 用 DC/DC コンバータ等の SiC/IGBT 高圧スイッチ駆動用途。',
        desc: 'SOIC-16（DW）、車載（AEC-Q100）5.7kVRMS 1 チャネル強化絶縁ゲートドライバ、±10A source/sink、DESAT 脱飽和保護（pin2、基準 VDD 追従）+絶縁アナログ PWM センシング出力（APWM）+4A アクティブミラークランプ。同シリーズ UCC21711-Q1 とピン位置は同じだが pin2 が OC（DESAT でない）・トリガ基準が COM 参照固定 -0.3~6V で機能が異なり、直接互換不可。',
        thermalPad: 'datasheet 参照（dump に露出パッド/EP 情報の記載なし）。',
        specs: [
          { k: '絶縁耐圧', v: '5.7kVRMS（1 チャネル強化絶縁）、12.8kVPK サージ、動作電圧 1.5kVRMS' },
          { k: '対応スイッチ素子', v: 'SiC MOSFET / IGBT、最高 2121V DC 動作電圧' },
          { k: '駆動電圧（VDD-VEE）', v: '最大 33V（推奨 VDD-COM 13~33V）' },
          { k: '駆動電流', v: '±10A（source/sink）、分離 OUTH/OUTL 出力' },
          { k: 'CMTI', v: '≥150V/ns（min）' },
          { k: 'DESAT 保護応答', v: '200ns（典型）' },
          { k: 'アクティブミラークランプ', v: '4A（CLMPI）' },
          { k: 'ソフトターンオフ電流', v: '400mA' },
          { k: 'VCC 供給', v: '3.0~5.5V' },
          { k: 'RST/EN リセット最短パルス', v: '800ns（推奨動作条件、min）' },
          { k: '伝搬遅延/part skew', v: '130ns（max）/ 30ns（max）' },
          { k: '動作接合温度', v: '-40°C~150°C（周囲温度 -40°C~125°C）' },
          { k: 'パッケージ', v: 'SOIC-16（DW）、沿面/空間距離 >8mm' },
          { k: '認証', v: 'AEC-Q100 温度グレード1；UL1577 素子認証（計画中）' }
        ]
      },
      ko: {
        subcategory: '절연 게이트 드라이버(단일 채널, SiC/IGBT, 절연 아날로그 센싱 포함)',
        whatIs: '절연 단일 채널 게이트 드라이버: 컨트롤러 측 저압 PWM 논리 신호를 전기 절연을 넘어 고압 측으로 전송해 SiC MOSFET 또는 IGBT 게이트를 구동, DESAT(탈포화) 감지로 단락/과전류 고장을 보고.',
        func: 'SiO2 용량 절연 기술로 입력/출력 측을 분리, 1.5kVRMS 동작 전압, 5.7kVRMS(단일 채널) 강화 절연 내압, 12.8kVPK 서지 면역, 절연 수명 >40년, CMTI ≥150V/ns. 출력단은 ±10A source/sink, OUTH/OUTL 분리 출력으로 개폐 속도 개별 조정 가능. DESAT(탈포화 전류 보호) 감지 입력은 기준이 VDD 추종(COM-0.3V~VDD+0.3V)으로 최고 2121V DC 동작 전압의 SiC/IGBT 단락 보호 지원; 고장 시 {FLT}(오픈 컬렉터, 로우 동작)로 보고하고 400mA 소프트 턴오프. 또한 4A 액티브 밀러 클램프(CLMPI), 절연 아날로그-PWM 변환기(AIN→APWM)로 온도나 고압 DC-Link/상전압의 절연 측정. RST/EN은 출력 인에이블/차단과 DESAT 고장 리셋 겸용, datasheet 권장 동작 조건에서 리셋 최소 펄스는 800ns. VDD-COM 측 UVLO가 RDY에 전원 양호 플래그 출력.',
        usedIn: '전기차 견인 인버터, 차량 탑재 충전기(OBC)와 충전 스탠드, HEV/EV용 DC/DC 컨버터 등 SiC/IGBT 고압 스위치 구동 용도.',
        desc: 'SOIC-16(DW), 차량용(AEC-Q100) 5.7kVRMS 단일 채널 강화 절연 게이트 드라이버, ±10A source/sink, DESAT 탈포화 보호(pin2, 기준 VDD 추종)+절연 아날로그 PWM 센싱 출력(APWM)+4A 액티브 밀러 클램프. 동일 시리즈 UCC21711-Q1과 핀 위치는 같으나 pin2가 OC(DESAT 아님)·트리거 기준이 COM 참조 고정 -0.3~6V로 기능이 달라 직접 호환 불가.',
        thermalPad: 'datasheet 참조(dump에 노출 패드/EP 정보 기재 없음).',
        specs: [
          { k: '절연 내압', v: '5.7kVRMS(단일 채널 강화 절연), 12.8kVPK 서지, 동작 전압 1.5kVRMS' },
          { k: '적용 스위치 소자', v: 'SiC MOSFET / IGBT, 최고 2121V DC 동작 전압' },
          { k: '구동 전압(VDD-VEE)', v: '최대 33V(권장 VDD-COM 13~33V)' },
          { k: '구동 전류', v: '±10A(source/sink), 분리 OUTH/OUTL 출력' },
          { k: 'CMTI', v: '≥150V/ns(min)' },
          { k: 'DESAT 보호 응답', v: '200ns(전형)' },
          { k: '액티브 밀러 클램프', v: '4A(CLMPI)' },
          { k: '소프트 턴오프 전류', v: '400mA' },
          { k: 'VCC 공급', v: '3.0~5.5V' },
          { k: 'RST/EN 리셋 최소 펄스', v: '800ns(권장 동작 조건, min)' },
          { k: '전파 지연/part skew', v: '130ns(max) / 30ns(max)' },
          { k: '동작 접합 온도', v: '-40°C~150°C(주위 온도 -40°C~125°C)' },
          { k: '패키지', v: 'SOIC-16(DW), 연면/공간 거리 >8mm' },
          { k: '인증', v: 'AEC-Q100 온도 등급1; UL1577 소자 인증(계획 중)' }
        ]
      }
    },
    'TPS7H4010-SEP': {
      en: {
        subcategory: 'Space-grade synchronous buck converter (Rad-Hard)',
        whatIs: 'Radiation-tolerant space-grade synchronous step-down DC converter: converts a 3.5V–32V input into an adjustable output at up to 6A output current, for satellite/space-payload board power.',
        func: 'A peak current-mode-controlled synchronous buck with built-in high-/low-side power MOSFETs (RDS(on) 53mΩ/31mΩ typ), switching frequency 350kHz–2.2MHz (set by one RT resistor, 500kHz default when floating) and external clock sync (SYNC/MODE). Internal compensation cuts external part count; SS/TRK sets soft-start time or rail tracking; FB sets output voltage via a divider; PGOOD is an open-collector power-good flag; EN is a precision enable for resistor-divider-programmable system UVLO; cycle-by-cycle current limit plus hiccup-mode short-circuit protection and thermal shutdown. BIAS can tie to VOUT or an external 3.3V/5V rail for higher efficiency. Radiation: SEL/SEB/SEGR immune to LET=43MeV-cm²/mg, SET/SEFI characterized to the same LET, TID 20krad(Si) per wafer lot (characterized to 30krad(Si)); Space Enhanced Plastic with gold wire and NiPdAu lead finish, low-outgassing mold compound, single fab/assembly/test site.',
        usedIn: 'Satellite point-of-load power (FPGAs, MCUs, data converters, ASICs), communication payloads, command & data handling, optical/radar imaging payloads, laser-communication payloads, navigation and science-instrument payloads.',
        desc: '30-pin WQFN (RNP), radiation-tolerant (20krad(Si)) space-grade 3.5–32V input, 6A synchronous buck, peak current-mode control, switching 350kHz–2.2MHz adjustable and externally syncable, with soft-start/tracking, precision-enable UVLO programming, cycle-by-cycle limit and hiccup short-circuit protection. SW(1-5), PVIN(20-22), PGND(23-26), NC(12-15,27-30) are merged pins.',
        thermalPad: 'DAP (Die Attach Pad) low-impedance connection to AGND is the main heat path; solder to PCB ground copper with thermal vias to spread heat to other layers.',
        specs: [
          { k: 'Input voltage', v: '3.5V ~ 32V' },
          { k: 'Max output current', v: '6A' },
          { k: 'Control', v: 'peak current-mode, internal compensation' },
          { k: 'Switching frequency', v: '350kHz ~ 2.2MHz adjustable (RT), 500kHz default when floating, external clock syncable' },
          { k: 'High-side MOSFET RDS(on)', v: '53mΩ (typ)' },
          { k: 'Low-side MOSFET RDS(on)', v: '31mΩ (typ)' },
          { k: 'Min on/off time', v: 'tON-MIN 60ns (typ) / tOFF-MIN 70ns (typ)' },
          { k: 'Protection', v: 'cycle-by-cycle limit, hiccup short-circuit, thermal shutdown, precision-EN UVLO programming' },
          { k: 'Soft-start', v: 'internal fixed slope, or SS/TRK external cap extension, 2µA charge current' },
          { k: 'Radiation (SEL/SEB/SEGR)', v: 'immune to LET=43MeV-cm²/mg' },
          { k: 'Radiation (TID)', v: '20krad(Si) per wafer lot, characterized to 30krad(Si)' },
          { k: 'Package', v: '30-WQFN (RNP) 6×4×0.8mm, mass ~57.2mg (±10%)' }
        ]
      },
      ja: {
        subcategory: '宇宙級同期整流降圧コンバータ（Rad-Hard）',
        whatIs: '耐放射線宇宙級同期整流降圧 DC コンバータ：3.5V–32V 入力を可変出力に変換、最大出力電流 6A、衛星/宇宙ペイロード基板電源用。',
        func: 'ピーク電流モード制御の同期整流降圧で、ハイ/ローサイドパワー MOSFET（RDS(on) 53mΩ/31mΩ 典型）内蔵、スイッチング周波数 350kHz–2.2MHz（RT 抵抗 1 個で設定、浮き時 500kHz）、外部クロック同期（SYNC/MODE）対応。内部補償で外付け部品削減；SS/TRK でソフトスタート時間や電源レール追従を設定；FB は分圧で出力電圧設定；PGOOD はオープンコレクタ電源良好フラグ；EN は精密イネーブルで抵抗分圧によるシステム UVLO プログラム可；サイクル毎電流制限＋ヒカップモード短絡保護、過熱シャットダウン。BIAS は VOUT か外部 3.3V/5V レールに接続し効率向上。放射線：SEL/SEB/SEGR は LET=43MeV-cm²/mg まで免疫、SET/SEFI 同 LET 特性化、TID ウェハロット毎 20krad(Si) 保証（30krad(Si) 特性化）；Space Enhanced Plastic（金線・NiPdAu 端子処理、低アウトガスモールド材、単一の製造/組立/試験拠点）。',
        usedIn: '衛星の負荷点電源（FPGA、マイコン、データコンバータ、ASIC）、通信ペイロード、指令・データ処理、光学/レーダ撮像ペイロード、レーザ通信ペイロード、航法・科学探査ペイロード等の宇宙用途。',
        desc: '30-pin WQFN（RNP）、耐放射線（20krad(Si)）宇宙級 3.5–32V 入力・6A 同期整流降圧コンバータ、ピーク電流モード制御、スイッチング 350kHz–2.2MHz 可変で外部同期可、ソフトスタート/追従・精密イネーブル UVLO プログラム・サイクル毎制限とヒカップ式短絡保護内蔵。SW(1-5)、PVIN(20-22)、PGND(23-26)、NC(12-15,27-30) は多ピン合併。',
        thermalPad: 'DAP（Die Attach Pad）を AGND へ低インピーダンス接続、主要な放熱経路；PCB 接地銅箔に半田付けし放熱ビア併用で他層へ放熱。',
        specs: [
          { k: '入力電圧', v: '3.5V ~ 32V' },
          { k: '最大出力電流', v: '6A' },
          { k: '制御方式', v: 'ピーク電流モード、内部補償' },
          { k: 'スイッチング周波数', v: '350kHz ~ 2.2MHz 可変（RT 設定）、浮き時 500kHz、外部クロック同期可' },
          { k: 'ハイサイド MOSFET RDS(on)', v: '53mΩ（典型）' },
          { k: 'ローサイド MOSFET RDS(on)', v: '31mΩ（典型）' },
          { k: '最小オン/オフ時間', v: 'tON-MIN 60ns（典型）/ tOFF-MIN 70ns（典型）' },
          { k: '保護機能', v: 'サイクル毎制限、ヒカップ短絡保護、過熱シャットダウン、精密 EN UVLO プログラム' },
          { k: 'ソフトスタート', v: '内部固定スロープ、または SS/TRK 外付けコンデンサで延長、2µA 充電電流' },
          { k: '耐放射線（SEL/SEB/SEGR）', v: 'LET=43MeV-cm²/mg まで免疫' },
          { k: '耐放射線（TID）', v: 'ウェハロット毎 20krad(Si) 保証、30krad(Si) 特性化' },
          { k: 'パッケージ', v: '30-WQFN（RNP）6×4×0.8mm、質量約 57.2mg（±10%）' }
        ]
      },
      ko: {
        subcategory: '우주급 동기 벅 컨버터(Rad-Hard)',
        whatIs: '내방사선 우주급 동기 강압 DC 컨버터: 3.5V–32V 입력을 가변 출력으로 변환, 최대 출력 전류 6A, 위성/우주 페이로드 보드 전원용.',
        func: '피크 전류 모드 제어 동기 벅으로 하이/로우사이드 파워 MOSFET(RDS(on) 53mΩ/31mΩ 전형) 내장, 스위칭 주파수 350kHz–2.2MHz(RT 저항 1개로 설정, 플로팅 시 500kHz), 외부 클록 동기(SYNC/MODE) 지원. 내부 보상으로 외부 부품 절감; SS/TRK로 소프트 스타트 시간이나 전원 레일 추종 설정; FB는 분압으로 출력 전압 설정; PGOOD는 오픈 컬렉터 전원 양호 플래그; EN은 정밀 인에이블로 저항 분압에 의한 시스템 UVLO 프로그램 가능; 사이클별 전류 제한+히컵 모드 단락 보호, 과열 셧다운. BIAS는 VOUT나 외부 3.3V/5V 레일에 연결해 효율 향상. 방사선: SEL/SEB/SEGR은 LET=43MeV-cm²/mg까지 면역, SET/SEFI 동일 LET 특성화, TID 웨이퍼 로트별 20krad(Si) 보증(30krad(Si) 특성화); Space Enhanced Plastic(금선·NiPdAu 단자 처리, 저 아웃가스 몰드재, 단일 제조/조립/시험 거점).',
        usedIn: '위성 부하점 전원(FPGA, MCU, 데이터 컨버터, ASIC), 통신 페이로드, 지령·데이터 처리, 광학/레이더 이미징 페이로드, 레이저 통신 페이로드, 항법·과학 탐사 페이로드 등 우주 용도.',
        desc: '30-pin WQFN(RNP), 내방사선(20krad(Si)) 우주급 3.5–32V 입력·6A 동기 벅 컨버터, 피크 전류 모드 제어, 스위칭 350kHz–2.2MHz 가변에 외부 동기 가능, 소프트 스타트/추종·정밀 인에이블 UVLO 프로그램·사이클별 제한과 히컵식 단락 보호 내장. SW(1-5), PVIN(20-22), PGND(23-26), NC(12-15,27-30)는 다중 핀 병합.',
        thermalPad: 'DAP(Die Attach Pad)를 AGND에 저임피던스 연결, 주요 방열 경로; PCB 접지 동박에 납땜하고 방열 비아를 병용해 다른 층으로 방열.',
        specs: [
          { k: '입력 전압', v: '3.5V ~ 32V' },
          { k: '최대 출력 전류', v: '6A' },
          { k: '제어 방식', v: '피크 전류 모드, 내부 보상' },
          { k: '스위칭 주파수', v: '350kHz ~ 2.2MHz 가변(RT 설정), 플로팅 시 500kHz, 외부 클록 동기 가능' },
          { k: '하이사이드 MOSFET RDS(on)', v: '53mΩ(전형)' },
          { k: '로우사이드 MOSFET RDS(on)', v: '31mΩ(전형)' },
          { k: '최소 온/오프 시간', v: 'tON-MIN 60ns(전형) / tOFF-MIN 70ns(전형)' },
          { k: '보호 기능', v: '사이클별 제한, 히컵 단락 보호, 과열 셧다운, 정밀 EN UVLO 프로그램' },
          { k: '소프트 스타트', v: '내부 고정 슬로프, 또는 SS/TRK 외부 커패시터로 연장, 2µA 충전 전류' },
          { k: '내방사선(SEL/SEB/SEGR)', v: 'LET=43MeV-cm²/mg까지 면역' },
          { k: '내방사선(TID)', v: '웨이퍼 로트별 20krad(Si) 보증, 30krad(Si) 특성화' },
          { k: '패키지', v: '30-WQFN(RNP) 6×4×0.8mm, 질량 약 57.2mg(±10%)' }
        ]
      }
    },
    'TPS25730A': {
      en: {
        subcategory: 'USB Type-C / USB PD controller (Sink-Only, with external power-path gate drive)',
        whatIs: 'USB Type-C and USB Power Delivery (PD) controller: integrates the PD protocol engine and power-path protection, letting a system use USB-C PD to replace a traditional barrel jack, as a standalone sink-only PD receiver controller.',
        func: 'The TPS25730A is a highly integrated, standalone USB Type-C/PD controller optimized for sink-only applications, replacing a barrel-jack power interface. It has a built-in Type-C Rd detect and sink state machine, PD policy engine and physical layer, compliant with PD3.2. All PD parameters are fully configured via resistor-divider pin strapping on ADCIN1–ADCIN4, needing no external EEPROM, MCU or firmware. It integrates power-path management with over-voltage and reverse-current protection (RCP, via VSYS/GATE_VSYS), and 6 configurable GPIO functions (SINK_EN, DBG_ACC, CAP_MIS, PLUG_EVENT, PLUG_FLIP, FAULT_IN). A built-in 3.3V LDO (LDO_3V3) for dead-battery cases can be powered from VIN_3V3 or VBUS, plus a 1.5V core LDO (LDO_1V5). An I2C target (I2Ct_SCL/I2Ct_SDA) lets an external MCU read status or override settings. This entry is the 32-VQFN (RSM) TPS25730AS version, driving external N-channel MOSFETs via GATE_VBUS/GATE_VSYS for the power path (external FETs required); a 38-WQFN (REF) TPS25730AD version has integrated switch pins (PPHV/VBUS_IN/DRAIN, no external FET), and the two versions differ in pin count and names — not interchangeable.',
        usedIn: 'The USB-C PD receiving port of consumer electronics such as power tools, power banks, retail-automation and payment devices, and wireless speakers/headsets, replacing a traditional barrel-jack supply.',
        desc: '32-VQFN (RSM) 4×4mm, the sink-only USB-C PD controller variant (S version) of the TPS25730A, driving external N-channel MOSFETs via GATE_VBUS/GATE_VSYS for the power path. The 38-WQFN (D version, TPS25730AD) differs in pin count (38) and names (integrated FET, with PPHV/VBUS_IN/DRAIN); the two package pinouts are incompatible and not directly interchangeable.',
        thermalPad: 'Exposed Thermal Pad marked to GND; solder to PCB ground copper with thermal vias for heat dissipation.',
        specs: [
          { k: 'PD compliance', v: 'USB PD3.2 (sink-only application)' },
          { k: 'Integration', v: 'Type-C Rd/sink state machine, PD policy engine, physical layer, 6 configurable GPIO, I2C target' },
          { k: 'Configuration', v: 'resistor-divider pin strapping (ADCIN1–4), no EEPROM/external MCU/firmware' },
          { k: 'Power path', v: 'S version (32-VQFN, this entry) drives external N-channel MOSFETs via GATE_VBUS/GATE_VSYS; D version (38-WQFN) has an integrated switch (PPHV/VBUS_IN/DRAIN)' },
          { k: 'Protection', v: 'integrated over-voltage protection, reverse-current protection (RCP, via VSYS/GATE_VSYS)' },
          { k: 'Built-in LDO', v: '3.3V (LDO_3V3, dead-battery support) / 1.5V core (LDO_1V5)' },
          { k: 'Supply source', v: 'VIN_3V3 or VBUS' },
          { k: 'VBUS input range', v: '5V~20V' },
          { k: 'Comms interface', v: 'I2C target (I2Ct_SCL/I2Ct_SDA) for external MCU read/config' },
          { k: 'Temperature range', v: 'industrial temperature range supported' },
          { k: 'Package', v: '32-VQFN (RSM) 4×4mm (S version, this entry); also 38-WQFN (REF) 4×6mm (D version)' }
        ]
      },
      ja: {
        subcategory: 'USB Type-C / USB PD コントローラ（Sink-Only、外部電源経路ゲート駆動付）',
        whatIs: 'USB Type-C と USB Power Delivery（PD）コントローラ：PD プロトコルエンジンと電源経路保護を統合し、USB-C PD で従来のバレルジャック電源を置き換え可能な、受電（sink-only）専用の独立 PD 受電コントローラ。',
        func: 'TPS25730A は高集積・独立動作の USB Type-C/PD コントローラで、受電（sink only）用途に最適化されバレルジャック供給インタフェースを置換。Type-C Rd 検出と sink ステートマシン、USB PD ポリシーエンジン、物理層を内蔵し PD3.2 規格に準拠。ADCIN1–ADCIN4 等の抵抗分圧ピンストラップで PD パラメータを完全設定でき、外部 EEPROM・外部マイコン・ファームウェア開発が不要。電源経路管理を統合し、過電圧保護と逆電流保護（RCP、VSYS/GATE_VSYS で実装）、6 組の設定可能 GPIO 機能（SINK_EN、DBG_ACC、CAP_MIS、PLUG_EVENT、PLUG_FLIP、FAULT_IN）を提供。デッドバッテリ用の 3.3V LDO（LDO_3V3）は VIN_3V3 か VBUS から供給可、1.5V コア LDO（LDO_1V5）も内蔵。I2C target（I2Ct_SCL/I2Ct_SDA）で外部マイコンが状態読み出しや設定上書き可。本条目は 32-VQFN（RSM）の TPS25730AS 版で、GATE_VBUS/GATE_VSYS で外部 N 型 MOSFET を駆動し電源経路を構成（外付け FET 必要）；同シリーズの 38-WQFN（REF）TPS25730AD 版は統合スイッチピン（PPHV/VBUS_IN/DRAIN、外付け FET 不要）を内蔵、両版はピン数・名称とも異なり互換不可。',
        usedIn: '電動工具、モバイルバッテリ、リテールオートメーション・決済機器、ワイヤレススピーカ/ヘッドセット等の消費電子の USB-C PD 受電ポートで、従来のバレルジャック供給を置換。',
        desc: '32-VQFN（RSM）4×4mm、TPS25730A の sink-only USB-C PD コントローラ変種（S 版）で、GATE_VBUS/GATE_VSYS で外部 N 型 MOSFET を駆動し電源経路を構成。同シリーズ 38-WQFN（D 版、TPS25730AD）はピン数（38）・名称とも異なり（統合 FET、PPHV/VBUS_IN/DRAIN 付）、両パッケージの pinout は非互換で直接互換不可。',
        thermalPad: '露出サーマルパッド（Thermal Pad）は GND 接続表記；PCB 接地銅箔に半田付けし放熱ビア併用で放熱。',
        specs: [
          { k: 'PD 互換性', v: 'USB PD3.2（sink-only 用途）' },
          { k: '統合機能', v: 'Type-C Rd/sink ステートマシン、PD ポリシーエンジン、物理層、6 組の設定可能 GPIO、I2C target' },
          { k: '設定方式', v: '抵抗分圧ピンストラップ（ADCIN1–4）、EEPROM/外部マイコン/ファームウェア不要' },
          { k: '電源経路', v: 'S 版（32-VQFN、本条目）は GATE_VBUS/GATE_VSYS で外部 N 型 MOSFET 駆動；D 版（38-WQFN）は統合スイッチ（PPHV/VBUS_IN/DRAIN）内蔵' },
          { k: '保護機能', v: '統合過電圧保護、逆電流保護（RCP、VSYS/GATE_VSYS 経由）' },
          { k: '内蔵 LDO', v: '3.3V（LDO_3V3、デッドバッテリ対応）/ 1.5V コア（LDO_1V5）' },
          { k: '供給源', v: 'VIN_3V3 または VBUS' },
          { k: 'VBUS 入力範囲', v: '5V~20V' },
          { k: '通信インタフェース', v: 'I2C target（I2Ct_SCL/I2Ct_SDA）で外部マイコン読み出し/設定' },
          { k: '温度範囲', v: '産業温度範囲対応' },
          { k: 'パッケージ', v: '32-VQFN（RSM）4×4mm（S 版、本条目）；別に 38-WQFN（REF）4×6mm（D 版）' }
        ]
      },
      ko: {
        subcategory: 'USB Type-C / USB PD 컨트롤러(Sink-Only, 외부 전원 경로 게이트 구동 포함)',
        whatIs: 'USB Type-C와 USB Power Delivery(PD) 컨트롤러: PD 프로토콜 엔진과 전원 경로 보호를 통합해 USB-C PD로 기존 배럴 잭 전원을 대체할 수 있는, 수전(sink-only) 전용 독립 PD 수전 컨트롤러.',
        func: 'TPS25730A는 고집적·독립 동작 USB Type-C/PD 컨트롤러로 수전(sink only) 용도에 최적화되어 배럴 잭 공급 인터페이스를 대체. Type-C Rd 감지와 sink 상태 기계, USB PD 정책 엔진, 물리 계층을 내장해 PD3.2 규격 준수. ADCIN1–ADCIN4 등의 저항 분압 핀 스트랩으로 PD 파라미터를 완전 설정할 수 있어 외부 EEPROM·외부 마이컴·펌웨어 개발이 불필요. 전원 경로 관리를 통합해 과전압 보호와 역전류 보호(RCP, VSYS/GATE_VSYS로 구현), 6조의 설정 가능 GPIO 기능(SINK_EN, DBG_ACC, CAP_MIS, PLUG_EVENT, PLUG_FLIP, FAULT_IN)을 제공. 데드 배터리용 3.3V LDO(LDO_3V3)는 VIN_3V3나 VBUS에서 공급 가능, 1.5V 코어 LDO(LDO_1V5)도 내장. I2C target(I2Ct_SCL/I2Ct_SDA)으로 외부 마이컴이 상태 읽기나 설정 덮어쓰기 가능. 본 항목은 32-VQFN(RSM) TPS25730AS 판으로 GATE_VBUS/GATE_VSYS로 외부 N형 MOSFET을 구동해 전원 경로 구성(외장 FET 필요); 동일 시리즈 38-WQFN(REF) TPS25730AD 판은 통합 스위치 핀(PPHV/VBUS_IN/DRAIN, 외장 FET 불필요) 내장, 두 판은 핀 수·이름 모두 달라 호환 불가.',
        usedIn: '전동 공구, 보조 배터리, 리테일 자동화·결제 기기, 무선 스피커/헤드셋 등 소비 전자의 USB-C PD 수전 포트에서 기존 배럴 잭 공급을 대체.',
        desc: '32-VQFN(RSM) 4×4mm, TPS25730A의 sink-only USB-C PD 컨트롤러 변형(S 판)으로 GATE_VBUS/GATE_VSYS로 외부 N형 MOSFET을 구동해 전원 경로 구성. 동일 시리즈 38-WQFN(D 판, TPS25730AD)은 핀 수(38)·이름 모두 다름(통합 FET, PPHV/VBUS_IN/DRAIN 포함), 두 패키지 pinout은 비호환으로 직접 호환 불가.',
        thermalPad: '노출 서멀 패드(Thermal Pad)는 GND 연결 표기; PCB 접지 동박에 납땜하고 방열 비아를 병용해 방열.',
        specs: [
          { k: 'PD 호환성', v: 'USB PD3.2(sink-only 용도)' },
          { k: '통합 기능', v: 'Type-C Rd/sink 상태 기계, PD 정책 엔진, 물리 계층, 6조 설정 가능 GPIO, I2C target' },
          { k: '설정 방식', v: '저항 분압 핀 스트랩(ADCIN1–4), EEPROM/외부 마이컴/펌웨어 불필요' },
          { k: '전원 경로', v: 'S 판(32-VQFN, 본 항목)은 GATE_VBUS/GATE_VSYS로 외부 N형 MOSFET 구동; D 판(38-WQFN)은 통합 스위치(PPHV/VBUS_IN/DRAIN) 내장' },
          { k: '보호 기능', v: '통합 과전압 보호, 역전류 보호(RCP, VSYS/GATE_VSYS 경유)' },
          { k: '내장 LDO', v: '3.3V(LDO_3V3, 데드 배터리 지원) / 1.5V 코어(LDO_1V5)' },
          { k: '공급원', v: 'VIN_3V3 또는 VBUS' },
          { k: 'VBUS 입력 범위', v: '5V~20V' },
          { k: '통신 인터페이스', v: 'I2C target(I2Ct_SCL/I2Ct_SDA)으로 외부 마이컴 읽기/설정' },
          { k: '온도 범위', v: '산업 온도 범위 지원' },
          { k: '패키지', v: '32-VQFN(RSM) 4×4mm(S 판, 본 항목); 별도 38-WQFN(REF) 4×6mm(D 판)' }
        ]
      }
    }
  };
  Object.assign(window.IC_I18N, T);
})();
/* batch 9 (part A): entries 114-119 (TPS7H5001~5004-SP, TPS25751A, TPS25752A) */
(function () {
  // ---- shared text for TPS7H5001~5004-SP family ----
  var pwmSub = { en: 'Space-grade flyback/push-pull PWM controller (Rad-Hard, QMLV)', ja: '宇宙級フライバック/プッシュプル PWM コントローラ（Rad-Hard, QMLV）', ko: '우주급 플라이백/푸시풀 PWM 컨트롤러(Rad-Hard, QMLV)' };
  var pwmWhat = {
    en: 'TI space-grade (QMLV) flyback/push-pull pulse-width-modulation (PWM) controller, using peak current-mode control with slope compensation, 4V–14V input; switching frequency is set by an RT resistor with SYNC external-clock sync. The TPS7H5001-SP/5002-SP/5003-SP/5004-SP are same-family output-topology variants sharing one datasheet (SLVSF07F).',
    ja: 'TI 宇宙級（QMLV）フライバック/プッシュプル パルス幅変調（PWM）コントローラで、ピーク電流モード制御＋スロープ補償、入力 4V~14V；スイッチング周波数は RT 抵抗で設定し SYNC 外部クロック同期に対応。TPS7H5001-SP/5002-SP/5003-SP/5004-SP は同シリーズの出力形態違い変種で、同一 datasheet（SLVSF07F）を共有。',
    ko: 'TI 우주급(QMLV) 플라이백/푸시풀 펄스 폭 변조(PWM) 컨트롤러로, 피크 전류 모드 제어+슬로프 보상, 입력 4V~14V; 스위칭 주파수는 RT 저항으로 설정하고 SYNC 외부 클록 동기 지원. TPS7H5001-SP/5002-SP/5003-SP/5004-SP는 동일 시리즈의 출력 형태 변종으로 동일 datasheet(SLVSF07F)를 공유.'
  };
  var pwmFunc = {
    en: 'An internal error amplifier (VSENSE inverting input, COMP output) drives a peak current-mode PWM comparator (CS_ILIM current sense, with a 150mV offset relative to COMP/2, RSC sets slope compensation); HICC sets the cycle-by-cycle current-limit delay and hiccup short-circuit protection time (tie to AVSS to disable hiccup); FAULT is an independent fault-protection input (tie to AVSS to disable); SS sets soft-start time via an external cap and can also do rail tracking/sequencing; REFCAP is a 1.2V internal reference (needs 470nF); VLDO is the internal-regulator output (needs at least 1µF); EN can program input UVLO via a resistor divider; DCL sets the maximum duty-cycle limit, with per-variant behavior (see the DCL pin note).',
    ja: '内部誤差アンプ（VSENSE 反転入力、COMP 出力）がピーク電流モード PWM コンパレータ（CS_ILIM 電流検出、COMP/2 に対し 150mV オフセット、RSC でスロープ補償設定）を駆動；HICC はサイクル毎電流制限遅延とヒカップ式短絡保護時間を設定（AVSS 接続でヒカップ無効）；FAULT は独立故障保護入力（AVSS 接続で無効）；SS は外付けコンデンサでソフトスタート時間を設定し、電源レール追従/シーケンスにも使用可；REFCAP は 1.2V 内部基準（470nF 必要）；VLDO は内部レギュレータ出力（最低 1µF 必要）；EN は抵抗分圧で入力 UVLO をプログラム可；DCL は最大デューティ制限を設定し変種毎に動作が異なる（DCL ピン説明参照）。',
    ko: '내부 오차 앰프(VSENSE 반전 입력, COMP 출력)가 피크 전류 모드 PWM 비교기(CS_ILIM 전류 감지, COMP/2 대비 150mV 오프셋, RSC로 슬로프 보상 설정)를 구동; HICC는 사이클별 전류 제한 지연과 히컵식 단락 보호 시간을 설정(AVSS 연결 시 히컵 비활성); FAULT는 독립 고장 보호 입력(AVSS 연결 시 비활성); SS는 외장 커패시터로 소프트 스타트 시간을 설정하며 전원 레일 추종/시퀀싱에도 사용 가능; REFCAP는 1.2V 내부 기준(470nF 필요); VLDO는 내부 레귤레이터 출력(최소 1µF 필요); EN은 저항 분압으로 입력 UVLO 프로그램 가능; DCL은 최대 듀티 제한을 설정하며 변종마다 동작이 다름(DCL 핀 설명 참조).'
  };
  var pwmUsed = {
    en: 'Isolated or non-isolated flyback/forward/push-pull DC-DC converters on satellite/space-payload boards, providing secondary power for command & data handling, communication, optical/radar imaging, navigation and science-instrument payloads.',
    ja: '衛星/宇宙ペイロード基板上の絶縁または非絶縁のフライバック/フォワード/プッシュプル型 DC-DC コンバータで、指令・データ処理、通信、光学/レーダ撮像、航法・科学探査ペイロード等の宇宙用途の二次電源に使用。',
    ko: '위성/우주 페이로드 보드상의 절연 또는 비절연 플라이백/포워드/푸시풀 DC-DC 컨버터로, 지령·데이터 처리, 통신, 광학/레이더 이미징, 항법·과학 탐사 페이로드 등 우주 용도의 2차 전원에 사용.'
  };
  // shared spec rows (differ only in 輸出型態 / 工作週期限制)
  function pwmSpecs(lang, outType, dcl) {
    var S = {
      en: [
        { k: 'Output topology', v: outType },
        { k: 'Input voltage', v: '4V ~ 14V (VIN)' },
        { k: 'Control', v: 'peak current-mode, RSC external resistor sets slope compensation' },
        { k: 'Switching frequency setting', v: 'RT resistor; when RT floats, SYNC can input a 200kHz~4MHz external clock (2× the switching frequency)' },
        { k: 'Duty-cycle limit (DCL)', v: dcl },
        { k: 'Overcurrent protection', v: 'CS_ILIM > 1.05V triggers cycle-by-cycle protection; sense waveform has a 150mV offset relative to COMP/2' },
        { k: 'Short-circuit protection', v: 'HICC pin cap sets delay/hiccup time; tie to AVSS to disable hiccup' },
        { k: 'Fault protection', v: 'FAULT independent input; stops switching above the rising threshold; tie to AVSS to disable' },
        { k: 'Internal reference', v: 'REFCAP 1.2V, needs 470nF' },
        { k: 'Internal regulator', v: 'VLDO output, needs at least 1µF' },
        { k: 'Soft-start/tracking', v: 'SS external cap sets soft-start time, usable for tracking/sequencing' },
        { k: 'Package', v: '24-TSSOP (PW); also a 22-pin CFP ceramic flat-pack version (pin numbering differs from TSSOP, see datasheet Table 6-1)' },
        { k: 'Radiation (TID/SEL/SEB/SEGR)', v: 'see datasheet' }
      ],
      ja: [
        { k: '出力形態', v: outType },
        { k: '入力電圧', v: '4V ~ 14V (VIN)' },
        { k: '制御方式', v: 'ピーク電流モード、RSC 外付け抵抗でスロープ補償設定' },
        { k: 'スイッチング周波数設定', v: 'RT 抵抗設定；RT 浮き時は SYNC で 200kHz~4MHz 外部クロック入力可（スイッチング周波数の 2 倍）' },
        { k: 'デューティ制限(DCL)', v: dcl },
        { k: '過電流保護', v: 'CS_ILIM > 1.05V でサイクル毎過電流保護、検出波形は COMP/2 に対し 150mV オフセット' },
        { k: '短絡保護', v: 'HICC ピンのコンデンサで遅延/ヒカップ時間を設定、AVSS 接続でヒカップ無効' },
        { k: '故障保護', v: 'FAULT 独立故障入力、立上りしきい値超過で切替停止、AVSS 接続で無効' },
        { k: '内部基準', v: 'REFCAP 1.2V、470nF 必要' },
        { k: '内部レギュレータ', v: 'VLDO 出力、最低 1µF 必要' },
        { k: 'ソフトスタート/追従', v: 'SS 外付けコンデンサでソフトスタート時間を設定、tracking/sequencing に使用可' },
        { k: 'パッケージ', v: '24-TSSOP(PW)；別に 22-pin CFP セラミック扁平パッケージ版（ピン番号は TSSOP と異なる、datasheet Table 6-1 参照）' },
        { k: '耐放射線等級(TID/SEL/SEB/SEGR)', v: 'datasheet 参照' }
      ],
      ko: [
        { k: '출력 형태', v: outType },
        { k: '입력 전압', v: '4V ~ 14V (VIN)' },
        { k: '제어 방식', v: '피크 전류 모드, RSC 외장 저항으로 슬로프 보상 설정' },
        { k: '스위칭 주파수 설정', v: 'RT 저항 설정; RT 플로팅 시 SYNC로 200kHz~4MHz 외부 클록 입력 가능(스위칭 주파수의 2배)' },
        { k: '듀티 제한(DCL)', v: dcl },
        { k: '과전류 보호', v: 'CS_ILIM > 1.05V로 사이클별 과전류 보호, 감지 파형은 COMP/2 대비 150mV 오프셋' },
        { k: '단락 보호', v: 'HICC 핀 커패시터로 지연/히컵 시간 설정, AVSS 연결 시 히컵 비활성' },
        { k: '고장 보호', v: 'FAULT 독립 고장 입력, 상승 문턱 초과 시 스위칭 정지, AVSS 연결 시 비활성' },
        { k: '내부 기준', v: 'REFCAP 1.2V, 470nF 필요' },
        { k: '내부 레귤레이터', v: 'VLDO 출력, 최소 1µF 필요' },
        { k: '소프트 스타트/추종', v: 'SS 외장 커패시터로 소프트 스타트 시간 설정, tracking/sequencing에 사용 가능' },
        { k: '패키지', v: '24-TSSOP(PW); 별도 22-pin CFP 세라믹 편평 패키지판(핀 번호는 TSSOP와 다름, datasheet Table 6-1 참조)' },
        { k: '내방사선 등급(TID/SEL/SEB/SEGR)', v: 'datasheet 참조' }
      ]
    };
    return S[lang];
  }
  function pwmEntry(descEn, descJa, descKo, outEn, outJa, outKo, dclEn, dclJa, dclKo) {
    return {
      en: { subcategory: pwmSub.en, whatIs: pwmWhat.en, func: pwmFunc.en, usedIn: pwmUsed.en, desc: descEn, specs: pwmSpecs('en', outEn, dclEn) },
      ja: { subcategory: pwmSub.ja, whatIs: pwmWhat.ja, func: pwmFunc.ja, usedIn: pwmUsed.ja, desc: descJa, specs: pwmSpecs('ja', outJa, dclJa) },
      ko: { subcategory: pwmSub.ko, whatIs: pwmWhat.ko, func: pwmFunc.ko, usedIn: pwmUsed.ko, desc: descKo, specs: pwmSpecs('ko', outKo, dclKo) }
    };
  }

  var T = {
    'TPS7H5001-SP': pwmEntry(
      '24-TSSOP (PW), space-grade (QMLV) peak current-mode flyback/push-pull PWM controller. Dual main-switch outputs (OUTA/OUTB) + dual synchronous-rectifier drives (SRA/SRB); with DCL=AVSS, OUTA/OUTB switch in push-pull. TSSOP NC pins: 12, 13; the 22-pin CFP pin numbering differs from TSSOP (tightly numbered, no TSSOP NC pins), see datasheet Table 6-1. Within the family, variants differ only in output topology and whether PS/SP/LEB pins exist; they are not pin-to-pin compatible — select per your topology (dual output? synchronous rectification?).',
      '24-TSSOP(PW)、宇宙級(QMLV)ピーク電流モード フライバック/プッシュプル PWM コントローラ。デュアル主スイッチ出力(OUTA/OUTB)+デュアル同期整流駆動(SRA/SRB)、DCL=AVSS で OUTA/OUTB はプッシュプル動作。TSSOP NC ピン：12, 13；22-pin CFP はピン番号が TSSOP と異なる(緊密番号、TSSOP の NC ピンなし)、datasheet Table 6-1 参照。同シリーズは出力形態と PS/SP/LEB ピンの有無のみ異なり pin-to-pin 非互換、回路トポロジ(デュアル出力/同期整流の要否)で選定。',
      '24-TSSOP(PW), 우주급(QMLV) 피크 전류 모드 플라이백/푸시풀 PWM 컨트롤러. 듀얼 주 스위치 출력(OUTA/OUTB)+듀얼 동기 정류 구동(SRA/SRB), DCL=AVSS 시 OUTA/OUTB는 푸시풀 동작. TSSOP NC 핀: 12, 13; 22-pin CFP는 핀 번호가 TSSOP와 다름(긴밀 번호, TSSOP의 NC 핀 없음), datasheet Table 6-1 참조. 동일 시리즈는 출력 형태와 PS/SP/LEB 핀 유무만 다르며 pin-to-pin 비호환, 회로 토폴로지(듀얼 출력/동기 정류 필요 여부)로 선정.',
      'Dual main-switch outputs (OUTA/OUTB) + dual synchronous-rectifier drives (SRA/SRB); with DCL=AVSS, OUTA/OUTB switch in push-pull',
      'デュアル主スイッチ出力(OUTA/OUTB)+デュアル同期整流駆動(SRA/SRB)、DCL=AVSS で OUTA/OUTB はプッシュプル動作',
      '듀얼 주 스위치 출력(OUTA/OUTB)+듀얼 동기 정류 구동(SRA/SRB), DCL=AVSS 시 OUTA/OUTB는 푸시풀 동작',
      'AVSS = 50% duty limit, floating = 75%, VLDO = 100%.',
      'AVSS 接続で 50%、浮き時 75%、VLDO 接続で 100% のデューティ制限。',
      'AVSS 연결 시 50%, 플로팅 시 75%, VLDO 연결 시 100% 듀티 제한.'
    ),
    'TPS7H5002-SP': pwmEntry(
      '24-TSSOP (PW), space-grade (QMLV) peak current-mode flyback/push-pull PWM controller. Single main-switch output (OUTA) + single synchronous-rectifier drive (SRA), suited to single-ended (flyback/forward) topologies with synchronous rectification. TSSOP NC pins: 11, 12, 13, 14; the 22-pin CFP pin numbering differs from TSSOP, see datasheet Table 6-1. Family variants differ only in output topology and PS/SP/LEB pins; not pin-to-pin compatible — select per topology.',
      '24-TSSOP(PW)、宇宙級(QMLV)ピーク電流モード フライバック/プッシュプル PWM コントローラ。単主スイッチ出力(OUTA)+単同期整流駆動(SRA)、シングルエンド(フライバック/フォワード)トポロジ＋同期整流に好適。TSSOP NC ピン：11, 12, 13, 14；22-pin CFP はピン番号が TSSOP と異なる、datasheet Table 6-1 参照。同シリーズは出力形態と PS/SP/LEB ピンの有無のみ異なり pin-to-pin 非互換、トポロジで選定。',
      '24-TSSOP(PW), 우주급(QMLV) 피크 전류 모드 플라이백/푸시풀 PWM 컨트롤러. 단일 주 스위치 출력(OUTA)+단일 동기 정류 구동(SRA), 싱글엔드(플라이백/포워드) 토폴로지+동기 정류에 적합. TSSOP NC 핀: 11, 12, 13, 14; 22-pin CFP는 핀 번호가 TSSOP와 다름, datasheet Table 6-1 참조. 동일 시리즈는 출력 형태와 PS/SP/LEB 핀 유무만 다르며 pin-to-pin 비호환, 토폴로지로 선정.',
      'Single main-switch output (OUTA) + single synchronous-rectifier drive (SRA), suited to single-ended (flyback/forward) with synchronous rectification',
      '単主スイッチ出力(OUTA)+単同期整流駆動(SRA)、シングルエンド(フライバック/フォワード)＋同期整流に好適',
      '단일 주 스위치 출력(OUTA)+단일 동기 정류 구동(SRA), 싱글엔드(플라이백/포워드)+동기 정류에 적합',
      'Floating or tied to VLDO for a max duty of 75% or 100% respectively.',
      '浮きまたは VLDO 接続で、最大デューティ 75% または 100%。',
      '플로팅 또는 VLDO 연결로 최대 듀티 75% 또는 100%.'
    ),
    'TPS7H5003-SP': pwmEntry(
      '24-TSSOP (PW), space-grade (QMLV) peak current-mode flyback/push-pull PWM controller. Single main-switch output (OUTA), no synchronous-rectifier drive, no PS/SP dead-time setting, no LEB — the most stripped-down version of the family. TSSOP NC pins: 2, 3, 4, 11, 12, 13, 14; the 22-pin CFP pin numbering differs from TSSOP, see datasheet Table 6-1. Family variants differ only in output topology and PS/SP/LEB pins; not pin-to-pin compatible — select per topology.',
      '24-TSSOP(PW)、宇宙級(QMLV)ピーク電流モード フライバック/プッシュプル PWM コントローラ。単主スイッチ出力(OUTA)、同期整流駆動なし・PS/SP デッドタイム設定なし・LEB なしで、シリーズ中最も機能を絞った版。TSSOP NC ピン：2, 3, 4, 11, 12, 13, 14；22-pin CFP はピン番号が TSSOP と異なる、datasheet Table 6-1 参照。同シリーズは出力形態と PS/SP/LEB ピンの有無のみ異なり pin-to-pin 非互換、トポロジで選定。',
      '24-TSSOP(PW), 우주급(QMLV) 피크 전류 모드 플라이백/푸시풀 PWM 컨트롤러. 단일 주 스위치 출력(OUTA), 동기 정류 구동 없음·PS/SP 데드타임 설정 없음·LEB 없음으로 시리즈 중 가장 기능을 줄인 판. TSSOP NC 핀: 2, 3, 4, 11, 12, 13, 14; 22-pin CFP는 핀 번호가 TSSOP와 다름, datasheet Table 6-1 참조. 동일 시리즈는 출력 형태와 PS/SP/LEB 핀 유무만 다르며 pin-to-pin 비호환, 토폴로지로 선정.',
      'Single main-switch output (OUTA), no synchronous-rectifier drive, no PS/SP dead-time setting, no LEB — the most stripped-down version of the family',
      '単主スイッチ出力(OUTA)、同期整流駆動なし・PS/SP デッドタイム設定なし・LEB なしで、シリーズ中最も機能を絞った版',
      '단일 주 스위치 출력(OUTA), 동기 정류 구동 없음·PS/SP 데드타임 설정 없음·LEB 없음으로 시리즈 중 가장 기능을 줄인 판',
      'Floating or tied to VLDO for a max duty of 75% or 100% respectively.',
      '浮きまたは VLDO 接続で、最大デューティ 75% または 100%。',
      '플로팅 또는 VLDO 연결로 최대 듀티 75% 또는 100%.'
    ),
    'TPS7H5004-SP': pwmEntry(
      '24-TSSOP (PW), space-grade (QMLV) peak current-mode flyback/push-pull PWM controller. Dual main-switch outputs (OUTA/OUTB), no synchronous-rectifier drive; DCL must tie to AVSS, fixed at a 50% duty limit. TSSOP NC pins: 2, 3, 12, 13, 14, 15; the 22-pin CFP pin numbering differs from TSSOP, see datasheet Table 6-1. Family variants differ only in output topology and PS/SP/LEB pins; not pin-to-pin compatible — select per topology.',
      '24-TSSOP(PW)、宇宙級(QMLV)ピーク電流モード フライバック/プッシュプル PWM コントローラ。デュアル主スイッチ出力(OUTA/OUTB)、同期整流駆動なし、DCL は AVSS 接続で 50% デューティ制限固定。TSSOP NC ピン：2, 3, 12, 13, 14, 15；22-pin CFP はピン番号が TSSOP と異なる、datasheet Table 6-1 参照。同シリーズは出力形態と PS/SP/LEB ピンの有無のみ異なり pin-to-pin 非互換、トポロジで選定。',
      '24-TSSOP(PW), 우주급(QMLV) 피크 전류 모드 플라이백/푸시풀 PWM 컨트롤러. 듀얼 주 스위치 출력(OUTA/OUTB), 동기 정류 구동 없음, DCL은 AVSS 연결로 50% 듀티 제한 고정. TSSOP NC 핀: 2, 3, 12, 13, 14, 15; 22-pin CFP는 핀 번호가 TSSOP와 다름, datasheet Table 6-1 참조. 동일 시리즈는 출력 형태와 PS/SP/LEB 핀 유무만 다르며 pin-to-pin 비호환, 토폴로지로 선정.',
      'Dual main-switch outputs (OUTA/OUTB), no synchronous-rectifier drive; DCL must tie to AVSS, fixed at a 50% duty limit',
      'デュアル主スイッチ出力(OUTA/OUTB)、同期整流駆動なし、DCL は AVSS 接続で 50% デューティ制限固定',
      '듀얼 주 스위치 출력(OUTA/OUTB), 동기 정류 구동 없음, DCL은 AVSS 연결로 50% 듀티 제한 고정',
      'This pin must tie to AVSS for a 50% max duty limit.',
      'このピンは AVSS 接続で 50% 最大デューティ制限。',
      '이 핀은 AVSS 연결로 50% 최대 듀티 제한.'
    ),
    'TPS25751A': {
      en: {
        subcategory: 'USB Type-C / USB PD controller (external power-path MOSFET gate drive, 32-QFN S version)',
        whatIs: 'USB Type-C and USB Power Delivery (PD) controller: integrates the PD protocol engine and power-path protection, with rich GPIO and dual I2C (target/controller) interfaces for system monitoring and expansion of the PD port.',
        func: 'The TPS25751A is a highly integrated USB Type-C/PD controller configured via resistor-divider pin strapping on ADCIN1/ADCIN2. It offers multiple general-purpose GPIOs (GPIO0–GPIO7, GPIO11, some shared with LD1/LD2 liquid detect and USB_P/USB_N BC1.2). It has dual I2C: I2Ct_SCL/I2Ct_SDA/I2Ct_IRQ as I2C target for an external MCU to read/override settings, and I2Cc_SCL/I2Cc_SDA/I2Cc_IRQ as I2C controller for this device to master other I2C peripherals. Built-in 3.3V LDO (LDO_3V3) and 1.5V core LDO (LDO_1V5). This entry is the 32-QFN TPS25751AS version, driving external N-channel MOSFETs via GATE_VBUS/GATE_VSYS for the power path (external FETs required) with reverse-current protection (RCP) via VSYS/GATE_VSYS; a 38-QFN TPS25751AD version has integrated switch pins (PPHV/VBUS_IN/DRAIN, no external FET), and the two differ in pin count (32 vs 38) and names — not interchangeable. Exact PD spec version and sink-only/dual-role support are in the datasheet (TI SLVSJG7).',
        usedIn: 'USB-C PD receiving applications needing rich GPIO and dual-I2C expansion, e.g. PD port controllers for laptops and monitors; actual application range in the datasheet.',
        desc: '32-QFN, the S version of the TPS25751A, driving external N-channel MOSFETs via GATE_VBUS/GATE_VSYS for the power path. The 38-QFN (D version, TPS25751AD) differs in pin count (38) and names (integrated FET, with PPHV/VBUS_IN/DRAIN); the two package pinouts are incompatible, not directly interchangeable. Its pin numbering and names are, pin by pin, identical to the same-family TPS25752A (32-QFN), but their actual PD spec (e.g. EPR/PPS support version) may differ — still confirm via each datasheet feature table.',
        thermalPad: 'Exposed Thermal Pad; Figure 5-2 (S package, 32-QFN) marks it to GND; solder to PCB ground copper with thermal vias for dissipation.',
        specs: [
          { k: 'Package version', v: 'S version (32-QFN, this entry) drives external N-channel MOSFETs via GATE_VBUS/GATE_VSYS; D version (38-QFN) has an integrated switch (PPHV/VBUS_IN/DRAIN)' },
          { k: 'Configuration', v: 'resistor-divider pin strapping (ADCIN1/ADCIN2)' },
          { k: 'GPIO count', v: '12 (GPIO0–GPIO7, GPIO11, some shared with LD1/LD2, USB_P/USB_N)' },
          { k: 'Comms interface', v: 'I2C target (I2Ct_SCL/I2Ct_SDA/I2Ct_IRQ) + I2C controller (I2Cc_SCL/I2Cc_SDA/I2Cc_IRQ)' },
          { k: 'Built-in LDO', v: '3.3V (LDO_3V3) / 1.5V core (LDO_1V5)' },
          { k: 'VBUS input range (abs max)', v: '-0.3V~28V' },
          { k: 'CC1/CC2 input range (abs max)', v: '-0.5V~26V' },
          { k: 'Junction temperature', v: '-40°C~175°C' },
          { k: 'Package', v: 'S version 32-QFN (this entry); D version 38-QFN; exact package code/size in datasheet' }
        ],
        dropIn: [{ note: '32-QFN pin numbers and names are identical pin-by-pin (pin-to-pin); but the PD spec version may differ — confirm system-level compatibility via datasheet.' }]
      },
      ja: {
        subcategory: 'USB Type-C / USB PD コントローラ（外部電源経路 MOSFET ゲート駆動、32-QFN S 版）',
        whatIs: 'USB Type-C と USB Power Delivery（PD）コントローラ：PD プロトコルエンジンと電源経路保護を統合し、豊富な GPIO と デュアル I2C（target/controller）インタフェースを提供、システムによる PD ポート状態の監視・拡張に使用。',
        func: 'TPS25751A は高集積 USB Type-C/PD コントローラで、ADCIN1/ADCIN2 の抵抗分圧ピンストラップで PD パラメータを設定。汎用 GPIO（GPIO0~GPIO7、GPIO11、一部は LD1/LD2 液体検出、USB_P/USB_N BC1.2 と共用）を複数提供。デュアル I2C：I2Ct_SCL/I2Ct_SDA/I2Ct_IRQ は I2C target で外部マイコンが読み出し/設定上書き、I2Cc_SCL/I2Cc_SDA/I2Cc_IRQ は I2C controller で本装置がマスタとして他の I2C 周辺にアクセス可。3.3V LDO（LDO_3V3）と 1.5V コア LDO（LDO_1V5）内蔵。本条目は 32-QFN の TPS25751AS 版で、GATE_VBUS/GATE_VSYS で外部 N 型 MOSFET を駆動し電源経路を構成（外付け FET 必要）、VSYS/GATE_VSYS で逆電流保護（RCP）を実装；38-QFN の TPS25751AD 版は統合スイッチピン（PPHV/VBUS_IN/DRAIN、外付け FET 不要）内蔵、両版はピン数（32 対 38）・名称とも異なり互換不可。正確な PD 規格版、sink-only/dual-role 対応は datasheet（TI SLVSJG7）参照。',
        usedIn: '豊富な GPIO とデュアル I2C 拡張が必要な USB-C PD 受電用途、例えばノート PC やモニタの PD ポートコントローラ；実際の適用範囲は datasheet 参照。',
        desc: '32-QFN、TPS25751A の S 版で、GATE_VBUS/GATE_VSYS で外部 N 型 MOSFET を駆動し電源経路を構成。38-QFN（D 版、TPS25751AD）はピン数（38）・名称とも異なり（統合 FET、PPHV/VBUS_IN/DRAIN 付）、両パッケージの pinout は非互換で直接互換不可。同封裝ファミリの TPS25752A（32-QFN）とピン番号・名称が 1 ピンずつ完全一致だが、実際の PD 規格（EPR/PPS 対応版等）は異なる可能性があり、各 datasheet 機能表で確認。',
        thermalPad: '露出サーマルパッド、Figure 5-2（S パッケージ、32-QFN）は GND 接続表記；PCB 接地銅箔に半田付けし放熱ビア併用で放熱。',
        specs: [
          { k: 'パッケージ版', v: 'S 版（32-QFN、本条目）は GATE_VBUS/GATE_VSYS で外部 N 型 MOSFET 駆動；D 版（38-QFN）は統合スイッチ（PPHV/VBUS_IN/DRAIN）内蔵' },
          { k: '設定方式', v: '抵抗分圧ピンストラップ（ADCIN1/ADCIN2）' },
          { k: 'GPIO 数', v: '12 組（GPIO0~GPIO7、GPIO11、一部は LD1/LD2、USB_P/USB_N と共用）' },
          { k: '通信インタフェース', v: 'I2C target（I2Ct_SCL/I2Ct_SDA/I2Ct_IRQ）+ I2C controller（I2Cc_SCL/I2Cc_SDA/I2Cc_IRQ）' },
          { k: '内蔵 LDO', v: '3.3V（LDO_3V3）/ 1.5V コア（LDO_1V5）' },
          { k: 'VBUS 入力範囲（絶対最大）', v: '-0.3V~28V' },
          { k: 'CC1/CC2 入力範囲（絶対最大）', v: '-0.5V~26V' },
          { k: '動作接合温度', v: '-40°C~175°C' },
          { k: 'パッケージ', v: 'S 版 32-QFN（本条目）；D 版 38-QFN；正確なパッケージコード/寸法は datasheet 参照' }
        ],
        dropIn: [{ note: '32-QFN のピン番号・名称は 1 ピンずつ完全一致（pin-to-pin）；ただし PD 規格版が異なる可能性、システムレベル互換性は datasheet で別途確認。' }]
      },
      ko: {
        subcategory: 'USB Type-C / USB PD 컨트롤러(외부 전원 경로 MOSFET 게이트 구동, 32-QFN S 판)',
        whatIs: 'USB Type-C와 USB Power Delivery(PD) 컨트롤러: PD 프로토콜 엔진과 전원 경로 보호를 통합하고 풍부한 GPIO와 듀얼 I2C(target/controller) 인터페이스를 제공, 시스템의 PD 포트 상태 감시·확장에 사용.',
        func: 'TPS25751A는 고집적 USB Type-C/PD 컨트롤러로 ADCIN1/ADCIN2의 저항 분압 핀 스트랩으로 PD 파라미터를 설정. 범용 GPIO(GPIO0~GPIO7, GPIO11, 일부는 LD1/LD2 액체 감지, USB_P/USB_N BC1.2와 공용)를 여러 개 제공. 듀얼 I2C: I2Ct_SCL/I2Ct_SDA/I2Ct_IRQ는 I2C target으로 외부 마이컴이 읽기/설정 덮어쓰기, I2Cc_SCL/I2Cc_SDA/I2Cc_IRQ는 I2C controller로 본 장치가 마스터로서 다른 I2C 주변에 접근 가능. 3.3V LDO(LDO_3V3)와 1.5V 코어 LDO(LDO_1V5) 내장. 본 항목은 32-QFN TPS25751AS 판으로 GATE_VBUS/GATE_VSYS로 외부 N형 MOSFET을 구동해 전원 경로 구성(외장 FET 필요), VSYS/GATE_VSYS로 역전류 보호(RCP) 구현; 38-QFN TPS25751AD 판은 통합 스위치 핀(PPHV/VBUS_IN/DRAIN, 외장 FET 불필요) 내장, 두 판은 핀 수(32 대 38)·이름 모두 달라 호환 불가. 정확한 PD 규격 버전, sink-only/dual-role 지원은 datasheet(TI SLVSJG7) 참조.',
        usedIn: '풍부한 GPIO와 듀얼 I2C 확장이 필요한 USB-C PD 수전 용도, 예를 들어 노트북·모니터의 PD 포트 컨트롤러; 실제 적용 범위는 datasheet 참조.',
        desc: '32-QFN, TPS25751A의 S 판으로 GATE_VBUS/GATE_VSYS로 외부 N형 MOSFET을 구동해 전원 경로 구성. 38-QFN(D 판, TPS25751AD)은 핀 수(38)·이름 모두 다름(통합 FET, PPHV/VBUS_IN/DRAIN 포함), 두 패키지 pinout은 비호환으로 직접 호환 불가. 동일 패키지 패밀리 TPS25752A(32-QFN)와 핀 번호·이름이 핀 단위로 완전 일치하나, 실제 PD 규격(EPR/PPS 지원 버전 등)은 다를 수 있어 각 datasheet 기능 표로 확인.',
        thermalPad: '노출 서멀 패드, Figure 5-2(S 패키지, 32-QFN)는 GND 연결 표기; PCB 접지 동박에 납땜하고 방열 비아를 병용해 방열.',
        specs: [
          { k: '패키지 버전', v: 'S 판(32-QFN, 본 항목)은 GATE_VBUS/GATE_VSYS로 외부 N형 MOSFET 구동; D 판(38-QFN)은 통합 스위치(PPHV/VBUS_IN/DRAIN) 내장' },
          { k: '설정 방식', v: '저항 분압 핀 스트랩(ADCIN1/ADCIN2)' },
          { k: 'GPIO 수', v: '12조(GPIO0~GPIO7, GPIO11, 일부는 LD1/LD2, USB_P/USB_N과 공용)' },
          { k: '통신 인터페이스', v: 'I2C target(I2Ct_SCL/I2Ct_SDA/I2Ct_IRQ) + I2C controller(I2Cc_SCL/I2Cc_SDA/I2Cc_IRQ)' },
          { k: '내장 LDO', v: '3.3V(LDO_3V3) / 1.5V 코어(LDO_1V5)' },
          { k: 'VBUS 입력 범위(절대 최대)', v: '-0.3V~28V' },
          { k: 'CC1/CC2 입력 범위(절대 최대)', v: '-0.5V~26V' },
          { k: '동작 접합 온도', v: '-40°C~175°C' },
          { k: '패키지', v: 'S 판 32-QFN(본 항목); D 판 38-QFN; 정확한 패키지 코드/치수는 datasheet 참조' }
        ],
        dropIn: [{ note: '32-QFN 핀 번호·이름은 핀 단위로 완전 일치(pin-to-pin); 단 PD 규격 버전이 다를 수 있어 시스템 레벨 호환성은 datasheet로 별도 확인.' }]
      }
    },
    'TPS25752A': {
      en: {
        subcategory: 'USB Type-C / USB PD controller (external power-path MOSFET gate drive, 32-QFN RSM)',
        whatIs: 'USB Type-C and USB PD controller: integrates the PD protocol engine and power-path protection, with rich GPIO and dual I2C (target/controller) interfaces.',
        func: 'The TPS25752A is a 32-QFN (RSM) single-package USB Type-C/PD controller; its pin strapping (ADCIN1/ADCIN2), GPIO (GPIO0–GPIO7, GPIO11), dual I2C interfaces and power-path architecture (GATE_VBUS/GATE_VSYS driving external N-channel MOSFETs) are, pin by pin, identical to the same-package-family TPS25751A (S version). VSYS (pin 19) is marked in the datasheet only as the system-side high-voltage sense node, without the explicit reverse-current-protection (RCP) text of the TPS25751A — refer to the datasheet for functional details. Exact supported PD spec version, current/power capability, etc. are in the datasheet (TI SLVSJH0).',
        usedIn: 'USB-C PD receiving applications needing external N-channel MOSFETs for the power path with rich GPIO/I2C expansion, e.g. laptops, monitors, power banks; actual application range in the datasheet.',
        desc: '32-QFN (RSM). Pin by pin, its pin numbers and names are identical to the same-package-family TPS25751A (S version); but their actual PD spec (EPR/PPS support version, etc.) may differ — still confirm via each datasheet feature table.',
        thermalPad: 'Exposed Thermal Pad; per the same-package-family (RSM) TPS25730A/TPS25751AS convention, marked to GND; the captured page lacks a Pin Configuration figure — use the datasheet Figure for the final design.',
        specs: [
          { k: 'Package', v: '32-QFN (RSM) 4.00mm × 4.00mm' },
          { k: 'Configuration', v: 'resistor-divider pin strapping (ADCIN1/ADCIN2)' },
          { k: 'GPIO count', v: '12 (GPIO0–GPIO7, GPIO11, some shared with LD1/LD2, USB_P/USB_N)' },
          { k: 'Comms interface', v: 'I2C target (I2Ct_SCL/I2Ct_SDA/I2Ct_IRQ) + I2C controller (I2Cc_SCL/I2Cc_SDA/I2Cc_IRQ)' },
          { k: 'Built-in LDO', v: '3.3V (LDO_3V3) / 1.5V core (LDO_1V5)' },
          { k: 'VIN_3V3 recommended input', v: '3.0V~3.6V' },
          { k: 'PP5V recommended input', v: '4.9V~5.5V' },
          { k: 'VBUS recommended input', v: '4V~22V (short all VBUS pins together)' },
          { k: 'VBUS output current', v: 'max 3A (from PP5V)' },
          { k: 'Junction temperature (recommended)', v: '-40°C~125°C' },
          { k: 'Thermal resistance (32-QFN RSM)', v: 'RθJA 30.5°C/W; RθJC(top) 24.5°C/W; RθJB 9.8°C/W (see datasheet §5.5)' }
        ],
        dropIn: [{ note: '32-QFN pin numbers and names are identical pin-by-pin (pin-to-pin, S version); but the PD spec version may differ — confirm system-level compatibility via datasheet.' }]
      },
      ja: {
        subcategory: 'USB Type-C / USB PD コントローラ（外部電源経路 MOSFET ゲート駆動、32-QFN RSM）',
        whatIs: 'USB Type-C と USB PD コントローラ：PD プロトコルエンジンと電源経路保護を統合し、豊富な GPIO と デュアル I2C（target/controller）インタフェースを提供。',
        func: 'TPS25752A は 32-QFN（RSM）単一パッケージ版の USB Type-C/PD コントローラで、ピンストラップ（ADCIN1/ADCIN2）、GPIO（GPIO0~GPIO7、GPIO11）、デュアル I2C インタフェース、電源経路アーキテクチャ（GATE_VBUS/GATE_VSYS で外部 N 型 MOSFET を駆動）が同封裝ファミリの TPS25751A（S 版）と 1 ピンずつ一致。VSYS（ピン19）は datasheet ではシステム側高圧センスノードとのみ表記され、TPS25751A のような逆電流保護（RCP）機構の説明文はなく、機能詳細は datasheet に従う。正確な対応 PD 規格版、電流/電力能力等は datasheet（TI SLVSJH0）参照。',
        usedIn: '外部 N 型 MOSFET で電源経路を構成し豊富な GPIO/I2C 拡張が必要な USB-C PD 受電用途、例えばノート PC、モニタ、モバイルバッテリ；実際の適用範囲は datasheet 参照。',
        desc: '32-QFN（RSM）。1 ピンずつ照合し、ピン番号・名称が同封裝ファミリの TPS25751A（S 版）と完全一致；ただし実際の PD 規格（EPR/PPS 対応版等）は異なる可能性があり、各 datasheet 機能表で確認。',
        thermalPad: '露出サーマルパッド、同封裝ファミリ（RSM）の TPS25730A/TPS25751AS 慣例に倣い GND 接続表記；抽出ページに Pin Configuration 図なし、正式設計は datasheet Figure に従う。',
        specs: [
          { k: 'パッケージ', v: '32-QFN（RSM）4.00mm × 4.00mm' },
          { k: '設定方式', v: '抵抗分圧ピンストラップ（ADCIN1/ADCIN2）' },
          { k: 'GPIO 数', v: '12 組（GPIO0~GPIO7、GPIO11、一部は LD1/LD2、USB_P/USB_N と共用）' },
          { k: '通信インタフェース', v: 'I2C target（I2Ct_SCL/I2Ct_SDA/I2Ct_IRQ）+ I2C controller（I2Cc_SCL/I2Cc_SDA/I2Cc_IRQ）' },
          { k: '内蔵 LDO', v: '3.3V（LDO_3V3）/ 1.5V コア（LDO_1V5）' },
          { k: 'VIN_3V3 推奨入力範囲', v: '3.0V~3.6V' },
          { k: 'PP5V 推奨入力範囲', v: '4.9V~5.5V' },
          { k: 'VBUS 推奨入力範囲', v: '4V~22V（全 VBUS ピン短絡必要）' },
          { k: 'VBUS 出力電流', v: '最大 3A（PP5V から）' },
          { k: '動作接合温度（推奨）', v: '-40°C~125°C' },
          { k: '熱抵抗（32-QFN RSM）', v: 'RθJA 30.5°C/W；RθJC(top) 24.5°C/W；RθJB 9.8°C/W（datasheet 5.5 節参照）' }
        ],
        dropIn: [{ note: '32-QFN のピン番号・名称は 1 ピンずつ完全一致（pin-to-pin、S 版）；ただし PD 規格版が異なる可能性、システムレベル互換性は datasheet で別途確認。' }]
      },
      ko: {
        subcategory: 'USB Type-C / USB PD 컨트롤러(외부 전원 경로 MOSFET 게이트 구동, 32-QFN RSM)',
        whatIs: 'USB Type-C와 USB PD 컨트롤러: PD 프로토콜 엔진과 전원 경로 보호를 통합하고 풍부한 GPIO와 듀얼 I2C(target/controller) 인터페이스를 제공.',
        func: 'TPS25752A는 32-QFN(RSM) 단일 패키지판 USB Type-C/PD 컨트롤러로, 핀 스트랩(ADCIN1/ADCIN2), GPIO(GPIO0~GPIO7, GPIO11), 듀얼 I2C 인터페이스, 전원 경로 아키텍처(GATE_VBUS/GATE_VSYS로 외부 N형 MOSFET 구동)가 동일 패키지 패밀리 TPS25751A(S 판)와 핀 단위로 일치. VSYS(핀19)는 datasheet에서 시스템 측 고압 센스 노드로만 표기되고 TPS25751A 같은 역전류 보호(RCP) 기구 설명문은 없으며 기능 세부는 datasheet에 따름. 정확한 지원 PD 규격 버전, 전류/전력 능력 등은 datasheet(TI SLVSJH0) 참조.',
        usedIn: '외부 N형 MOSFET으로 전원 경로를 구성하고 풍부한 GPIO/I2C 확장이 필요한 USB-C PD 수전 용도, 예를 들어 노트북, 모니터, 보조 배터리; 실제 적용 범위는 datasheet 참조.',
        desc: '32-QFN(RSM). 핀 단위로 대조해 핀 번호·이름이 동일 패키지 패밀리 TPS25751A(S 판)와 완전 일치; 단 실제 PD 규격(EPR/PPS 지원 버전 등)은 다를 수 있어 각 datasheet 기능 표로 확인.',
        thermalPad: '노출 서멀 패드, 동일 패키지 패밀리(RSM) TPS25730A/TPS25751AS 관례에 따라 GND 연결 표기; 추출 페이지에 Pin Configuration 그림 없음, 정식 설계는 datasheet Figure에 따름.',
        specs: [
          { k: '패키지', v: '32-QFN(RSM) 4.00mm × 4.00mm' },
          { k: '설정 방식', v: '저항 분압 핀 스트랩(ADCIN1/ADCIN2)' },
          { k: 'GPIO 수', v: '12조(GPIO0~GPIO7, GPIO11, 일부는 LD1/LD2, USB_P/USB_N과 공용)' },
          { k: '통신 인터페이스', v: 'I2C target(I2Ct_SCL/I2Ct_SDA/I2Ct_IRQ) + I2C controller(I2Cc_SCL/I2Cc_SDA/I2Cc_IRQ)' },
          { k: '내장 LDO', v: '3.3V(LDO_3V3) / 1.5V 코어(LDO_1V5)' },
          { k: 'VIN_3V3 권장 입력 범위', v: '3.0V~3.6V' },
          { k: 'PP5V 권장 입력 범위', v: '4.9V~5.5V' },
          { k: 'VBUS 권장 입력 범위', v: '4V~22V(모든 VBUS 핀 단락 필요)' },
          { k: 'VBUS 출력 전류', v: '최대 3A(PP5V에서)' },
          { k: '동작 접합 온도(권장)', v: '-40°C~125°C' },
          { k: '열저항(32-QFN RSM)', v: 'RθJA 30.5°C/W; RθJC(top) 24.5°C/W; RθJB 9.8°C/W(datasheet 5.5절 참조)' }
        ],
        dropIn: [{ note: '32-QFN 핀 번호·이름은 핀 단위로 완전 일치(pin-to-pin, S 판); 단 PD 규격 버전이 다를 수 있어 시스템 레벨 호환성은 datasheet로 별도 확인.' }]
      }
    }
  };
  Object.assign(window.IC_I18N, T);
})();
/* batch 10: entries 120-128 */
(function () {
  // shared text for TPS7H4012-SP / TPS7H4013-SP (only max output current differs)
  var h4sub = { en: 'Space-grade synchronous buck converter (Rad-Hard)', ja: '宇宙級同期整流降圧コンバータ（Rad-Hard）', ko: '우주급 동기 벅 컨버터(Rad-Hard)' };
  function h4func(lang) {
    return {
      en: 'An external-frequency, external-compensation synchronous buck. EN enables the device (its turn-on level is programmable via a VIN-to-GND divider); RT sets the switching frequency (100kHz~1MHz) with an external resistor to GND, and may float or use a resistor as the fallback frequency on clock loss when an external clock is used; SYNC1 accepts an external clock input, 180° out of phase with another device (tie to ground when unused to avoid noise coupling). VIN powers the control circuit and PVIN the output stage — both must be externally shorted to the same voltage; LDOCAP is the internal linear-regulator (nominal AVDD=5V) output-cap pin, needing 1µF. SW is the switch node, optionally with a Schottky diode to PGND to improve noise/efficiency. PWRGD is an open-collector power-good flag (asserted within ±5% of nominal, deasserted above 8% or on fault). RSC sets slope compensation with a resistor to GND; SS_TR with an external cap slows soft-start and enables rail tracking/sequencing; VSNS+ is the feedback pin (nominal 0.6V); COMP is the OTA error-amp output needing an external RC compensation network; REFCAP is the bandgap-reference cap pin (nominal VBG=1.2V, needs 470nF) and must not connect to other circuitry. Radiation (SP grade): TID 100krad(Si) RLAT, DSEE (destructive single-event effects) immune to 75MeV-cm²/mg; offered in QMLV-RHA (20-pin CFP HLC) and QMLP-RHA (44-pin HTSSOP DDW) grades.',
      ja: '外部周波数・外部補償方式の同期整流降圧コンバータ。EN で素子をイネーブル（VIN-GND 分圧でオン電圧をプログラム可）；RT は GND への外付け抵抗でスイッチング周波数（100kHz~1MHz）を設定、外部クロック使用時は浮きまたは抵抗でクロック喪失時のフォールバック周波数に；SYNC1 は外部クロック入力を受け付け、他素子と 180° 位相同期（未使用時は雑音結合防止のため接地推奨）。VIN が制御回路、PVIN が出力段電力を供給し、両者を外部で同電圧に短絡必須；LDOCAP は内部リニアレギュレータ（公称 AVDD=5V）の出力コンデンサピンで 1µF 必要。SW はスイッチノード、任意で PGND へショットキーダイオードを接続し雑音/効率改善可。PWRGD はオープンコレクタ電源良好フラグ（公称 ±5% 内で asserted、8% 超過や故障で deasserted）。RSC は GND への抵抗でスロープ補償設定；SS_TR は外付けコンデンサでソフトスタートを遅延し、電源追従/シーケンスに使用可；VSNS+ は帰還ピン（公称 0.6V）；COMP は OTA 誤差アンプ出力で外付け RC 補償網が必要；REFCAP はバンドギャップ基準コンデンサピン（公称 VBG=1.2V、470nF 必要）で他回路接続不可。耐放射線（SP グレード）：TID 100krad(Si) RLAT、DSEE（破壊的単一事象効果）は 75MeV-cm²/mg まで免疫；QMLV-RHA（20-pin CFP HLC）と QMLP-RHA（44-pin HTSSOP DDW）の 2 グレードを提供。',
      ko: '외부 주파수·외부 보상 방식의 동기 벅 컨버터. EN으로 소자를 인에이블(VIN-GND 분압으로 온 전압 프로그램 가능); RT는 GND로의 외장 저항으로 스위칭 주파수(100kHz~1MHz)를 설정, 외부 클록 사용 시 플로팅 또는 저항으로 클록 상실 시 폴백 주파수로; SYNC1은 외부 클록 입력을 받아 다른 소자와 180° 위상 동기(미사용 시 잡음 결합 방지 위해 접지 권장). VIN이 제어 회로, PVIN이 출력단 전력을 공급하고 둘을 외부에서 동일 전압으로 단락 필수; LDOCAP은 내부 선형 레귤레이터(공칭 AVDD=5V) 출력 커패시터 핀으로 1µF 필요. SW는 스위치 노드, 선택적으로 PGND로 쇼트키 다이오드를 연결해 잡음/효율 개선 가능. PWRGD는 오픈 컬렉터 전원 양호 플래그(공칭 ±5% 이내에서 asserted, 8% 초과나 고장 시 deasserted). RSC는 GND로의 저항으로 슬로프 보상 설정; SS_TR은 외장 커패시터로 소프트 스타트를 지연하고 전원 추종/시퀀싱에 사용 가능; VSNS+는 피드백 핀(공칭 0.6V); COMP는 OTA 오차 앰프 출력으로 외장 RC 보상망 필요; REFCAP는 밴드갭 기준 커패시터 핀(공칭 VBG=1.2V, 470nF 필요)으로 다른 회로 연결 불가. 내방사선(SP 등급): TID 100krad(Si) RLAT, DSEE(파괴적 단일 이벤트 효과)는 75MeV-cm²/mg까지 면역; QMLV-RHA(20-pin CFP HLC)와 QMLP-RHA(44-pin HTSSOP DDW) 두 등급 제공.'
    }[lang];
  }
  var h4used = {
    en: 'Point-of-load power on satellite/space-payload boards, and space applications needing a radiation-tolerant buck converter for communication/navigation/science payloads.',
    ja: '衛星/宇宙ペイロード基板上の負荷点電源、通信/航法/科学ペイロード等の耐放射線降圧コンバータを要する宇宙用途。',
    ko: '위성/우주 페이로드 보드상의 부하점 전원, 통신/항법/과학 페이로드 등 내방사선 벅 컨버터가 필요한 우주 용도.'
  };
  function h4specs(lang, cur) {
    var c = { en: cur.en, ja: cur.ja, ko: cur.ko };
    return {
      en: [
        { k: 'Max output current (this part)', v: c.en },
        { k: 'Input voltage (abs max VIN/PVIN)', v: '−0.3V ~ 16V' },
        { k: 'Switching frequency', v: '100kHz ~ 1MHz (RT resistor, externally syncable)' },
        { k: 'Feedback voltage (VSNS+)', v: 'nominal 0.6V' },
        { k: 'Internal LDO output (AVDD)', v: 'nominal 5V (LDOCAP pin, needs 1µF)' },
        { k: 'Reference voltage (REFCAP/VBG)', v: 'nominal 1.2V (needs 470nF)' },
        { k: 'PWRGD threshold', v: 'asserted within ±5% (typ), deasserted above 8% (typ) or on fault' },
        { k: 'ESD', v: 'HBM ±1000V, CDM ±500V' },
        { k: 'Radiation (SP grade)', v: 'TID 100krad(Si) RLAT; DSEE immune to 75MeV-cm²/mg; QMLV-RHA (20-pin CFP HLC) or QMLP-RHA (44-pin HTSSOP DDW)' },
        { k: 'Junction temperature', v: '−55°C ~ 150°C' },
        { k: 'Package', v: '20-Pin CFP (HLC); also 44-Pin HTSSOP (DDW)' }
      ],
      ja: [
        { k: '最大出力電流（本型番）', v: c.ja },
        { k: '入力電圧（絶対最大定格 VIN/PVIN）', v: '−0.3V ~ 16V' },
        { k: 'スイッチング周波数', v: '100kHz ~ 1MHz（RT 抵抗設定、外部同期可）' },
        { k: '帰還電圧（VSNS+）', v: '公称 0.6V' },
        { k: '内部 LDO 出力（AVDD）', v: '公称 5V（LDOCAP ピン、470nF ではなく 1µF 必要）' },
        { k: '基準電圧（REFCAP/VBG）', v: '公称 1.2V（470nF 必要）' },
        { k: 'PWRGD しきい値', v: '公称 ±5%（typ）内で asserted、8%（typ）超過や故障で deasserted' },
        { k: 'ESD', v: 'HBM ±1000V、CDM ±500V' },
        { k: '耐放射線（SP グレード）', v: 'TID 100krad(Si) RLAT；DSEE は 75MeV-cm²/mg まで免疫；QMLV-RHA（20-pin CFP HLC）または QMLP-RHA（44-pin HTSSOP DDW）' },
        { k: '動作接合温度', v: '−55°C ~ 150°C' },
        { k: 'パッケージ', v: '20-Pin CFP（HLC）；別に 44-Pin HTSSOP（DDW）' }
      ],
      ko: [
        { k: '최대 출력 전류(본 부품)', v: c.ko },
        { k: '입력 전압(절대 최대 정격 VIN/PVIN)', v: '−0.3V ~ 16V' },
        { k: '스위칭 주파수', v: '100kHz ~ 1MHz(RT 저항 설정, 외부 동기 가능)' },
        { k: '피드백 전압(VSNS+)', v: '공칭 0.6V' },
        { k: '내부 LDO 출력(AVDD)', v: '공칭 5V(LDOCAP 핀, 1µF 필요)' },
        { k: '기준 전압(REFCAP/VBG)', v: '공칭 1.2V(470nF 필요)' },
        { k: 'PWRGD 문턱', v: '공칭 ±5%(typ) 이내에서 asserted, 8%(typ) 초과나 고장 시 deasserted' },
        { k: 'ESD', v: 'HBM ±1000V, CDM ±500V' },
        { k: '내방사선(SP 등급)', v: 'TID 100krad(Si) RLAT; DSEE는 75MeV-cm²/mg까지 면역; QMLV-RHA(20-pin CFP HLC) 또는 QMLP-RHA(44-pin HTSSOP DDW)' },
        { k: '동작 접합 온도', v: '−55°C ~ 150°C' },
        { k: '패키지', v: '20-Pin CFP(HLC); 별도 44-Pin HTSSOP(DDW)' }
      ]
    }[lang];
  }
  function tacCodec(mono) {
    // TAC5111 mono / TAC5112 stereo share most, differ in channel description
    return mono;
  }

  var T = {
    'TPS26750A': {
      en: {
        subcategory: 'USB Type-C / USB PD controller (external load-switch power-path control, 32-QFN)',
        whatIs: 'USB Type-C and USB PD controller: integrates the PD protocol engine and power-path protection, controls an external load switch for the power path via a POWER_PATH_EN signal, and offers rich GPIO and dual I2C (target/controller) interfaces.',
        func: 'The TPS26750A is a 32-QFN USB Type-C/PD controller whose pin strapping (ADCIN1/ADCIN2), GPIO (GPIO0–GPIO7, GPIO11) and dual-I2C architecture are similar to the same-family TPS2575x series, but with a different power-path control method: this part drives an external load switch via a single POWER_PATH_EN output (not a logic-voltage-level output), replacing the TPS2575x GATE_VBUS/GATE_VSYS dual-MOSFET gate-drive architecture; the corresponding pins (19/20/21) are GND/POWER_PATH_EN/NC, differing from the VSYS/GATE_VSYS/GATE_VBUS at the same positions on the TPS25751A(S)/TPS25752A, while the other pins (1–18, 22–32) share names. Exact PD spec version and feature support are in the datasheet (TI SLVSJE4).',
        usedIn: 'USB-C PD receiving applications building the power path from an external load switch, suited to systems needing a simplified power path (no dual-MOSFET gate drive); actual application range in the datasheet.',
        desc: '32-QFN. Pins 1–18 and 22–32 share names with the same-package-family TPS25751A(S)/TPS25752A, but pins 19/20/21 are GND/POWER_PATH_EN/NC (the TPS2575x series has VSYS/GATE_VSYS/GATE_VBUS there) — a different power-path architecture (single load-switch enable vs. dual-MOSFET gate drive), so the overall pinout is not fully compatible and not directly interchangeable; select per power-path architecture.',
        thermalPad: 'Exposed Thermal Pad, Figure 4-1 marks it to GND; solder to PCB ground copper with thermal vias for dissipation.',
        specs: [
          { k: 'Package', v: '32-QFN; package code and exact size in the datasheet (TI SLVSJE4)' },
          { k: 'Configuration', v: 'resistor-divider pin strapping (ADCIN1/ADCIN2)' },
          { k: 'Power-path control', v: 'single POWER_PATH_EN output driving an external load switch (not a logic voltage level), differing from the TPS2575x GATE_VBUS/GATE_VSYS dual-MOSFET architecture' },
          { k: 'GPIO count', v: '12 (GPIO0–GPIO7, GPIO11, some shared with LD1/LD2, USB_P/USB_N)' },
          { k: 'Comms interface', v: 'I2C target (I2Ct_SCL/I2Ct_SDA/I2Ct_IRQ) + I2C controller (I2Cc_SCL/I2Cc_SDA/I2Cc_IRQ)' },
          { k: 'Built-in LDO', v: '3.3V (LDO_3V3) / 1.5V core (LDO_1V5)' },
          { k: 'VBUS input range (abs max)', v: '-0.3V~28V' },
          { k: 'CC1/CC2 input range (abs max)', v: '-0.5V~26V' },
          { k: 'POWER_PATH_EN output range (abs max)', v: '-0.5V~12V (VVSYS=GND)' },
          { k: 'Junction temperature', v: '-40°C~175°C' }
        ]
      },
      ja: {
        subcategory: 'USB Type-C / USB PD コントローラ（外部ロードスイッチ電源経路制御、32-QFN）',
        whatIs: 'USB Type-C と USB PD コントローラ：PD プロトコルエンジンと電源経路保護を統合し、POWER_PATH_EN 信号で外部ロードスイッチを制御し電源経路を構成、豊富な GPIO と デュアル I2C（target/controller）インタフェースを提供。',
        func: 'TPS26750A は 32-QFN の USB Type-C/PD コントローラで、ピンストラップ（ADCIN1/ADCIN2）、GPIO（GPIO0~GPIO7、GPIO11）、デュアル I2C 構成は同ファミリの TPS2575x シリーズと類似だが、電源経路制御方式が異なる：本品は単一 POWER_PATH_EN 出力で外部ロードスイッチを駆動（論理電圧レベル出力ではない）し、TPS2575x の GATE_VBUS/GATE_VSYS デュアル MOSFET ゲート駆動を置換；対応ピン（19/20/21）は GND/POWER_PATH_EN/NC で、TPS25751A(S)/TPS25752A の同位置 VSYS/GATE_VSYS/GATE_VBUS と異なり、他ピン（1~18、22~32）は名称同一。正確な PD 規格版・機能対応は datasheet（TI SLVSJE4）参照。',
        usedIn: '外部ロードスイッチで電源経路を構成する USB-C PD 受電用途、電源経路設計の簡素化（デュアル MOSFET ゲート駆動不要）が必要なシステムに好適；実際の適用範囲は datasheet 参照。',
        desc: '32-QFN。ピン 1~18、22~32 の名称は同封裝ファミリの TPS25751A(S)/TPS25752A と同じだが、ピン 19/20/21 は GND/POWER_PATH_EN/NC（TPS2575x は同位置に VSYS/GATE_VSYS/GATE_VBUS）で電源経路アーキテクチャが異なり（単一ロードスイッチイネーブル vs. デュアル MOSFET ゲート駆動）、全体 pinout は完全互換でなく直接互換不可、電源経路アーキテクチャで選定。',
        thermalPad: '露出サーマルパッド、Figure 4-1 は GND 接続表記；PCB 接地銅箔に半田付けし放熱ビア併用で放熱。',
        specs: [
          { k: 'パッケージ', v: '32-QFN、パッケージコードと正確な寸法は datasheet（TI SLVSJE4）参照' },
          { k: '設定方式', v: '抵抗分圧ピンストラップ（ADCIN1/ADCIN2）' },
          { k: '電源経路制御', v: '単一 POWER_PATH_EN 出力で外部ロードスイッチを駆動（論理電圧レベルでない）、TPS2575x の GATE_VBUS/GATE_VSYS デュアル MOSFET と異なる' },
          { k: 'GPIO 数', v: '12 組（GPIO0~GPIO7、GPIO11、一部は LD1/LD2、USB_P/USB_N と共用）' },
          { k: '通信インタフェース', v: 'I2C target（I2Ct_SCL/I2Ct_SDA/I2Ct_IRQ）+ I2C controller（I2Cc_SCL/I2Cc_SDA/I2Cc_IRQ）' },
          { k: '内蔵 LDO', v: '3.3V（LDO_3V3）/ 1.5V コア（LDO_1V5）' },
          { k: 'VBUS 入力範囲（絶対最大）', v: '-0.3V~28V' },
          { k: 'CC1/CC2 入力範囲（絶対最大）', v: '-0.5V~26V' },
          { k: 'POWER_PATH_EN 出力範囲（絶対最大）', v: '-0.5V~12V（VVSYS=GND）' },
          { k: '動作接合温度', v: '-40°C~175°C' }
        ]
      },
      ko: {
        subcategory: 'USB Type-C / USB PD 컨트롤러(외부 로드 스위치 전원 경로 제어, 32-QFN)',
        whatIs: 'USB Type-C와 USB PD 컨트롤러: PD 프로토콜 엔진과 전원 경로 보호를 통합하고 POWER_PATH_EN 신호로 외부 로드 스위치를 제어해 전원 경로를 구성, 풍부한 GPIO와 듀얼 I2C(target/controller) 인터페이스 제공.',
        func: 'TPS26750A는 32-QFN USB Type-C/PD 컨트롤러로 핀 스트랩(ADCIN1/ADCIN2), GPIO(GPIO0~GPIO7, GPIO11), 듀얼 I2C 구성이 동일 패밀리 TPS2575x 시리즈와 유사하나 전원 경로 제어 방식이 다름: 본 부품은 단일 POWER_PATH_EN 출력으로 외부 로드 스위치를 구동(논리 전압 레벨 출력 아님)해 TPS2575x의 GATE_VBUS/GATE_VSYS 듀얼 MOSFET 게이트 구동을 대체; 해당 핀(19/20/21)은 GND/POWER_PATH_EN/NC로 TPS25751A(S)/TPS25752A의 동일 위치 VSYS/GATE_VSYS/GATE_VBUS와 다르고 다른 핀(1~18, 22~32)은 이름 동일. 정확한 PD 규격 버전·기능 지원은 datasheet(TI SLVSJE4) 참조.',
        usedIn: '외부 로드 스위치로 전원 경로를 구성하는 USB-C PD 수전 용도, 전원 경로 설계 간소화(듀얼 MOSFET 게이트 구동 불필요)가 필요한 시스템에 적합; 실제 적용 범위는 datasheet 참조.',
        desc: '32-QFN. 핀 1~18, 22~32의 이름은 동일 패키지 패밀리 TPS25751A(S)/TPS25752A와 같으나 핀 19/20/21은 GND/POWER_PATH_EN/NC(TPS2575x는 동일 위치에 VSYS/GATE_VSYS/GATE_VBUS)로 전원 경로 아키텍처가 다르며(단일 로드 스위치 인에이블 vs. 듀얼 MOSFET 게이트 구동), 전체 pinout이 완전 호환은 아니어서 직접 호환 불가, 전원 경로 아키텍처로 선정.',
        thermalPad: '노출 서멀 패드, Figure 4-1은 GND 연결 표기; PCB 접지 동박에 납땜하고 방열 비아를 병용해 방열.',
        specs: [
          { k: '패키지', v: '32-QFN, 패키지 코드와 정확한 치수는 datasheet(TI SLVSJE4) 참조' },
          { k: '설정 방식', v: '저항 분압 핀 스트랩(ADCIN1/ADCIN2)' },
          { k: '전원 경로 제어', v: '단일 POWER_PATH_EN 출력으로 외부 로드 스위치 구동(논리 전압 레벨 아님), TPS2575x의 GATE_VBUS/GATE_VSYS 듀얼 MOSFET과 다름' },
          { k: 'GPIO 수', v: '12조(GPIO0~GPIO7, GPIO11, 일부는 LD1/LD2, USB_P/USB_N과 공용)' },
          { k: '통신 인터페이스', v: 'I2C target(I2Ct_SCL/I2Ct_SDA/I2Ct_IRQ) + I2C controller(I2Cc_SCL/I2Cc_SDA/I2Cc_IRQ)' },
          { k: '내장 LDO', v: '3.3V(LDO_3V3) / 1.5V 코어(LDO_1V5)' },
          { k: 'VBUS 입력 범위(절대 최대)', v: '-0.3V~28V' },
          { k: 'CC1/CC2 입력 범위(절대 최대)', v: '-0.5V~26V' },
          { k: 'POWER_PATH_EN 출력 범위(절대 최대)', v: '-0.5V~12V(VVSYS=GND)' },
          { k: '동작 접합 온도', v: '-40°C~175°C' }
        ]
      }
    },
    'TPS544B28': {
      en: {
        subcategory: 'Synchronous buck DC/DC converter (D-CAP+, PMBus digital interface, 19-WQFN-HR Hot-Rod)',
        whatIs: 'Synchronous buck DC/DC converter: integrates high-/low-side power MOSFETs, supporting a PMBus digital interface and resistor-divider (pin-strap) analog configuration, for medium-to-high-current point-of-load (POL) power.',
        func: 'The TPS544B28 is a D-CAP+ synchronous buck with up to 20A switch current (31A peak). MS1/MS2 do analog pin-strap via a resistor divider to AGND: MS1 sets switching frequency, valley current-limit threshold and soft-start time; MS2 sets output voltage, VOUT_SCALE_LOOP and internal/external feedback mode. VOS/FB and GOS form a differential remote-sense loop; in external-feedback mode a VOUT-to-GOS divider taps at FB to set the output voltage. PG is an open-collector power-good output. ADR sets the PMBus device address and fault-recovery (hiccup or latch-off) mode via a resistor divider to AGND, with PMBus over SDA/SCL. BST is the high-side gate-drive bootstrap supply pin, with a bootstrap cap to SW. An internal 3V LDO (VCC) powers internal circuits and gate drivers; an external 3.1V~4.5V bias can also be applied to cut losses. Detailed protection (overcurrent, thermal, etc.), efficiency and switching-architecture details are in the datasheet (TI SLVSHP8A).',
        usedIn: 'Servers, networking gear, industrial power and other applications needing medium-to-high-current (up to 20A) POL step-down conversion with PMBus monitoring/config; actual application range in the datasheet.',
        desc: '19-WQFN-HR (VAN) package, 3×3mm, 0.4mm pitch hot-rod pin layout (not a standard four-sided uniform QFN). This entry’s pin numbers were verified pin by pin against the datasheet Table 5-1 Pin Functions and are accurate. The side (L/B/R/T quadrant) is a best-effort approximation because the Figure 5-1 graphic text extraction order was scrambled — restored per pin-grouping regularity (single pins alternating with consecutive groups) and marked in each pin desc; use datasheet Figure 5-1 for the actual layout. An RBH package version also exists (3×3.5mm, 0.5mm pitch) with the same pin names/numbers per Figures 5-3/5-4, but the actual layout follows each package figure; the two packages must not be mixed.',
        specs: [
          { k: 'Control architecture', v: 'D-CAP+ synchronous buck, see datasheet' },
          { k: 'Output current capability', v: '20A continuous, 31A peak inductor current (SW)' },
          { k: 'Input voltage range (recommended)', v: 'internal LDO: 4V~16V; external bias (3.1V≤VVCC≤4.5V): 2.7V~16V' },
          { k: 'Output voltage range', v: '0.4V~5.5V' },
          { k: 'Configuration', v: 'resistor-divider pin-strap (MS1: frequency/current-limit/soft-start; MS2: output voltage/VOUT_SCALE_LOOP/feedback mode; ADR: PMBus address/fault-recovery mode)' },
          { k: 'Comms interface', v: 'PMBus (SDA/SCL)' },
          { k: 'Feedback', v: 'differential remote sense (VOS/FB + GOS), internal or external feedback selectable' },
          { k: 'Package', v: '19-WQFN-HR (VAN) 3×3mm/0.4mm pitch (this entry); also RBH 3×3.5mm/0.5mm pitch' },
          { k: 'Junction temperature', v: '-40°C~150°C' },
          { k: 'ESD', v: 'HBM ±2000V, CDM ±500V (see datasheet §6.2)' }
        ]
      },
      ja: {
        subcategory: '同期整流降圧 DC/DC コンバータ（D-CAP+、PMBus デジタルインタフェース、19-WQFN-HR Hot-Rod）',
        whatIs: '同期整流降圧（buck）DC/DC コンバータ：ハイ/ローサイドパワー MOSFET を統合し、PMBus デジタル通信インタフェースと抵抗分圧（ピンストラップ）アナログ設定に対応、中～大電流のポイントオブロード（POL）電源用途に好適。',
        func: 'TPS544B28 は D-CAP+ 制御の同期整流降圧で、出力スイッチ電流能力は最大 20A（ピーク 31A）。MS1/MS2 は AGND への抵抗分圧でアナログピンストラップ設定：MS1 はスイッチング周波数・谷値電流制限しきい値・ソフトスタート時間；MS2 は出力電圧・VOUT_SCALE_LOOP・内部/外部帰還モードを設定。VOS/FB、GOS が差動リモートセンス（remote sense）ループを構成、外部帰還モードでは VOUT から GOS への分圧器を FB で分岐し出力電圧を設定。PG はオープンコレクタ電源良好出力。ADR は AGND への抵抗分圧で PMBus デバイスアドレスと故障回復（ヒカップまたはラッチオフ）モードを設定、SDA/SCL で PMBus 通信。BST はハイサイドゲート駆動のブートストラップ供給ピンで、ブートストラップコンデンサを SW ノードへ。内部 3V LDO（VCC）が内部回路とゲートドライバに供給、外部 3.1V~4.5V バイアス源で損失削減も可。詳細保護（過電流、過熱等）、効率、スイッチングアーキテクチャは datasheet（TI SLVSHP8A）参照。',
        usedIn: 'サーバ、ネットワーク機器、産業電源等、中～大電流（最大 20A）POL 降圧変換と PMBus 監視/設定が必要な用途；実際の適用範囲は datasheet 参照。',
        desc: '19-WQFN-HR（VAN）パッケージ、3mm×3mm、0.4mm pitch の hot-rod 特殊ピン配列（標準四辺均等 QFN でない）。本条目のピン番号は datasheet Table 5-1 Pin Functions 表と 1 ピンずつ核対し正確。side（L/B/R/T 象限）は Figure 5-1 図形文字の抽出順が乱れたため、ピングループの規則性（単ピンと連番グループの交錯）で可能な限り復元した概略推定で、各ピン desc に個別注記；正式レイアウトは datasheet Figure 5-1 に従う。別に RBH パッケージ版（3mm×3.5mm、0.5mm pitch）があり、ピン名/番号は Figure 5-3/5-4 と同じだが実際の配列は各封裝図に従い、両パッケージは混用不可。',
        specs: [
          { k: '制御アーキテクチャ', v: 'D-CAP+ 同期整流降圧（buck）、datasheet 参照' },
          { k: '出力電流能力', v: '連続 20A、ピークインダクタ電流 31A（SW）' },
          { k: '入力電圧範囲（推奨）', v: '内部 LDO 供給：4V~16V；外部バイアス（3.1V≤VVCC≤4.5V）：2.7V~16V' },
          { k: '出力電圧範囲', v: '0.4V~5.5V' },
          { k: '設定方式', v: '抵抗分圧ピンストラップ（MS1：周波数/電流制限/ソフトスタート；MS2：出力電圧/VOUT_SCALE_LOOP/帰還モード；ADR：PMBus アドレス/故障回復モード）' },
          { k: '通信インタフェース', v: 'PMBus（SDA/SCL）' },
          { k: '帰還方式', v: '差動リモートセンス（VOS/FB + GOS）、内部または外部帰還を設定可' },
          { k: 'パッケージ', v: '19-WQFN-HR（VAN）3mm×3mm/0.4mm pitch（本条目）；別に RBH 3mm×3.5mm/0.5mm pitch' },
          { k: '動作接合温度', v: '-40°C~150°C' },
          { k: 'ESD', v: 'HBM ±2000V、CDM ±500V（datasheet 6.2 節参照）' }
        ]
      },
      ko: {
        subcategory: '동기 벅 DC/DC 컨버터(D-CAP+, PMBus 디지털 인터페이스, 19-WQFN-HR Hot-Rod)',
        whatIs: '동기 벅 DC/DC 컨버터: 하이/로우사이드 파워 MOSFET을 통합하고 PMBus 디지털 통신 인터페이스와 저항 분압(핀 스트랩) 아날로그 설정을 지원, 중~대전류 포인트 오브 로드(POL) 전원 용도에 적합.',
        func: 'TPS544B28은 D-CAP+ 제어 동기 벅으로 출력 스위치 전류 능력 최대 20A(피크 31A). MS1/MS2는 AGND로의 저항 분압으로 아날로그 핀 스트랩 설정: MS1은 스위칭 주파수·밸리 전류 제한 문턱·소프트 스타트 시간; MS2는 출력 전압·VOUT_SCALE_LOOP·내부/외부 피드백 모드 설정. VOS/FB, GOS가 차동 원격 감지(remote sense) 루프를 구성, 외부 피드백 모드에서는 VOUT에서 GOS로의 분압기를 FB에서 분기해 출력 전압 설정. PG는 오픈 컬렉터 전원 양호 출력. ADR은 AGND로의 저항 분압으로 PMBus 장치 주소와 고장 복구(히컵 또는 래치 오프) 모드를 설정, SDA/SCL로 PMBus 통신. BST는 하이사이드 게이트 구동의 부트스트랩 공급 핀으로 부트스트랩 커패시터를 SW 노드로. 내부 3V LDO(VCC)가 내부 회로와 게이트 드라이버에 공급, 외부 3.1V~4.5V 바이어스원으로 손실 저감도 가능. 상세 보호(과전류, 과열 등), 효율, 스위칭 아키텍처는 datasheet(TI SLVSHP8A) 참조.',
        usedIn: '서버, 네트워크 장비, 산업 전원 등 중~대전류(최대 20A) POL 강압 변환과 PMBus 감시/설정이 필요한 용도; 실제 적용 범위는 datasheet 참조.',
        desc: '19-WQFN-HR(VAN) 패키지, 3mm×3mm, 0.4mm pitch의 hot-rod 특수 핀 배열(표준 사변 균등 QFN 아님). 본 항목의 핀 번호는 datasheet Table 5-1 Pin Functions 표와 핀 단위로 대조해 정확. side(L/B/R/T 사분면)는 Figure 5-1 도형 문자 추출 순서가 흐트러져 핀 그룹 규칙성(단일 핀과 연번 그룹 교차)으로 최대한 복원한 대략 추정으로 각 핀 desc에 개별 주석; 정식 레이아웃은 datasheet Figure 5-1에 따름. 별도 RBH 패키지판(3mm×3.5mm, 0.5mm pitch)이 있고 핀 이름/번호는 Figure 5-3/5-4와 같으나 실제 배열은 각 패키지 그림에 따르며 두 패키지는 혼용 불가.',
        specs: [
          { k: '제어 아키텍처', v: 'D-CAP+ 동기 벅, datasheet 참조' },
          { k: '출력 전류 능력', v: '연속 20A, 피크 인덕터 전류 31A(SW)' },
          { k: '입력 전압 범위(권장)', v: '내부 LDO 공급: 4V~16V; 외부 바이어스(3.1V≤VVCC≤4.5V): 2.7V~16V' },
          { k: '출력 전압 범위', v: '0.4V~5.5V' },
          { k: '설정 방식', v: '저항 분압 핀 스트랩(MS1: 주파수/전류 제한/소프트 스타트; MS2: 출력 전압/VOUT_SCALE_LOOP/피드백 모드; ADR: PMBus 주소/고장 복구 모드)' },
          { k: '통신 인터페이스', v: 'PMBus(SDA/SCL)' },
          { k: '피드백 방식', v: '차동 원격 감지(VOS/FB + GOS), 내부 또는 외부 피드백 설정 가능' },
          { k: '패키지', v: '19-WQFN-HR(VAN) 3mm×3mm/0.4mm pitch(본 항목); 별도 RBH 3mm×3.5mm/0.5mm pitch' },
          { k: '동작 접합 온도', v: '-40°C~150°C' },
          { k: 'ESD', v: 'HBM ±2000V, CDM ±500V(datasheet 6.2절 참조)' }
        ]
      }
    },
    'TPS7H4012-SP': {
      en: { subcategory: h4sub.en, whatIs: 'Radiation-tolerant space-grade synchronous step-down DC converter: converts the input into an adjustable output at up to 6A output current (TPS7H4012 family), for satellite/space-payload board power. TPS7H4012 and TPS7H4013 are sibling parts within one datasheet with identical pinouts, differing only in maximum output current (4012=6A, 4013=3A).', func: h4func('en'), usedIn: h4used.en, desc: '20-Pin CFP (HLC), radiation-tolerant (TID 100krad(Si)) space-grade synchronous buck, up to 6A output current, externally adjustable switching frequency (100kHz~1MHz) with external clock sync, external compensation (COMP/REFCAP). Shares one datasheet and the same pinout with TPS7H4013-SP (only max output current differs: 4012=6A, 4013=3A); their electrical specs differ and they are not drop-in for each other. A 44-Pin HTSSOP (DDW) version also exists; each pin desc notes its HTSSOP-44 (DDW) pin number.', specs: h4specs('en', { en: '6A (TPS7H4012 family; sibling TPS7H4013 family is 3A)' }) },
      ja: { subcategory: h4sub.ja, whatIs: '耐放射線宇宙級同期整流降圧 DC コンバータ：入力を可変出力に変換、最大出力電流 6A（TPS7H4012 ファミリ）、衛星/宇宙ペイロード基板電源用。TPS7H4012 と TPS7H4013 は同一 datasheet 内の姉妹型番で pinout 完全同一、最大出力電流のみ異なる（4012=6A、4013=3A）。', func: h4func('ja'), usedIn: h4used.ja, desc: '20-Pin CFP（HLC）、耐放射線（TID 100krad(Si)）宇宙級同期整流降圧、最大出力電流 6A、外部可変スイッチング周波数（100kHz~1MHz）で外部クロック同期可、外部補償（COMP/REFCAP）。TPS7H4013-SP と同一 datasheet・同 pinout を共有（最大出力電流のみ異なる：4012=6A、4013=3A）、両者は電気仕様が異なり相互 dropIn 不可。同シリーズに 44-Pin HTSSOP（DDW）版もあり；各ピン desc に対応 HTSSOP-44（DDW）ピン番号を注記。', specs: h4specs('ja', { ja: '6A（TPS7H4012 ファミリ；姉妹型番 TPS7H4013 ファミリは 3A）' }) },
      ko: { subcategory: h4sub.ko, whatIs: '내방사선 우주급 동기 강압 DC 컨버터: 입력을 가변 출력으로 변환, 최대 출력 전류 6A(TPS7H4012 패밀리), 위성/우주 페이로드 보드 전원용. TPS7H4012와 TPS7H4013은 동일 datasheet 내 자매 부품으로 pinout 완전 동일, 최대 출력 전류만 다름(4012=6A, 4013=3A).', func: h4func('ko'), usedIn: h4used.ko, desc: '20-Pin CFP(HLC), 내방사선(TID 100krad(Si)) 우주급 동기 벅, 최대 출력 전류 6A, 외부 가변 스위칭 주파수(100kHz~1MHz)에 외부 클록 동기 가능, 외부 보상(COMP/REFCAP). TPS7H4013-SP와 동일 datasheet·동일 pinout 공유(최대 출력 전류만 다름: 4012=6A, 4013=3A), 둘은 전기 사양이 달라 상호 dropIn 불가. 동일 시리즈에 44-Pin HTSSOP(DDW) 판도 있음; 각 핀 desc에 대응 HTSSOP-44(DDW) 핀 번호 주석.', specs: h4specs('ko', { ko: '6A(TPS7H4012 패밀리; 자매 부품 TPS7H4013 패밀리는 3A)' }) }
    },
    'TPS7H4013-SP': {
      en: { subcategory: h4sub.en, whatIs: 'Radiation-tolerant space-grade synchronous step-down DC converter: converts the input into an adjustable output at up to 3A output current (TPS7H4013 family), for satellite/space-payload board power. TPS7H4013 and TPS7H4012 are sibling parts within one datasheet with identical pinouts, differing only in maximum output current (4013=3A, 4012=6A).', func: h4func('en'), usedIn: h4used.en, desc: '20-Pin CFP (HLC), radiation-tolerant (TID 100krad(Si)) space-grade synchronous buck, up to 3A output current, externally adjustable switching frequency (100kHz~1MHz) with external clock sync, external compensation (COMP/REFCAP). Shares one datasheet and the same pinout with TPS7H4012-SP (only max output current differs: 4013=3A, 4012=6A); their electrical specs differ and they are not drop-in for each other. A 44-Pin HTSSOP (DDW) version also exists; each pin desc notes its HTSSOP-44 (DDW) pin number.', specs: h4specs('en', { en: '3A (TPS7H4013 family; sibling TPS7H4012 family is 6A)' }) },
      ja: { subcategory: h4sub.ja, whatIs: '耐放射線宇宙級同期整流降圧 DC コンバータ：入力を可変出力に変換、最大出力電流 3A（TPS7H4013 ファミリ）、衛星/宇宙ペイロード基板電源用。TPS7H4013 と TPS7H4012 は同一 datasheet 内の姉妹型番で pinout 完全同一、最大出力電流のみ異なる（4013=3A、4012=6A）。', func: h4func('ja'), usedIn: h4used.ja, desc: '20-Pin CFP（HLC）、耐放射線（TID 100krad(Si)）宇宙級同期整流降圧、最大出力電流 3A、外部可変スイッチング周波数（100kHz~1MHz）で外部クロック同期可、外部補償（COMP/REFCAP）。TPS7H4012-SP と同一 datasheet・同 pinout を共有（最大出力電流のみ異なる：4013=3A、4012=6A）、両者は電気仕様が異なり相互 dropIn 不可。同シリーズに 44-Pin HTSSOP（DDW）版もあり；各ピン desc に対応 HTSSOP-44（DDW）ピン番号を注記。', specs: h4specs('ja', { ja: '3A（TPS7H4013 ファミリ；姉妹型番 TPS7H4012 ファミリは 6A）' }) },
      ko: { subcategory: h4sub.ko, whatIs: '내방사선 우주급 동기 강압 DC 컨버터: 입력을 가변 출력으로 변환, 최대 출력 전류 3A(TPS7H4013 패밀리), 위성/우주 페이로드 보드 전원용. TPS7H4013과 TPS7H4012는 동일 datasheet 내 자매 부품으로 pinout 완전 동일, 최대 출력 전류만 다름(4013=3A, 4012=6A).', func: h4func('ko'), usedIn: h4used.ko, desc: '20-Pin CFP(HLC), 내방사선(TID 100krad(Si)) 우주급 동기 벅, 최대 출력 전류 3A, 외부 가변 스위칭 주파수(100kHz~1MHz)에 외부 클록 동기 가능, 외부 보상(COMP/REFCAP). TPS7H4012-SP와 동일 datasheet·동일 pinout 공유(최대 출력 전류만 다름: 4013=3A, 4012=6A), 둘은 전기 사양이 달라 상호 dropIn 불가. 동일 시리즈에 44-Pin HTSSOP(DDW) 판도 있음; 각 핀 desc에 대응 HTSSOP-44(DDW) 핀 번호 주석.', specs: h4specs('ko', { ko: '3A(TPS7H4013 패밀리; 자매 부품 TPS7H4012 패밀리는 6A)' }) }
    },
    'TAC5111-Q1': {
      en: {
        subcategory: 'Automotive audio codec (mono ADC + DAC)',
        whatIs: 'Automotive-grade low-power mono audio codec: 105dB-dynamic-range ADC + 114dB-dynamic-range DAC, supporting differential/single-ended I/O, AEC-Q100 Grade 1 (−40~+125°C), for audio capture and playback in eCall, car head units, etc.',
        func: 'The ADC supports line/microphone differential input (2VRMS full-scale) with AC/DC coupling and a built-in programmable mic bias (up to 3V); the DAC can be configured for line output or a headphone load (drives 16Ω to 62.5mW), supporting differential 2VRMS / single-ended 1VRMS. It integrates programmable channel gain, digital volume, a low-jitter PLL, HPF/biquad EQ and low-latency filter modes; sample rate 4kHz~768kHz with automatic clock/rate detection; audio interface TDM/I2S/LJ (16/20/24/32-bit) and I2C or SPI control; voice/ultrasonic activity detection, battery and thermal foldback protection.',
        usedIn: 'Space-constrained automotive audio systems: emergency call (eCall), telematics control units, active noise cancellation (ANC), car head units.',
        desc: 'Automotive mono audio codec: 105dB ADC + 114dB DAC, 4k~768kHz sampling, TDM/I2S/LJ, I2C/SPI control, AEC-Q100 Grade 1, 32-WQFN 5×5mm.',
        thermalPad: 'Exposed pad = VSS (Figure 4-1 marks the center (VSS) Thermal Pad, table lists a Thermal Pad row), must be shorted to the board ground plane.',
        specs: [
          { k: 'ADC dynamic range', v: '105dB (line/mic differential input); THD+N −97dB' },
          { k: 'DAC dynamic range', v: '114dB (differential line/headphone output); THD+N −96dB' },
          { k: 'Sample rate', v: 'ADC/DAC both 4kHz ~ 768kHz' },
          { k: 'Input/output', v: 'differential 2VRMS / single-ended 1VRMS; headphone drives 16Ω to 62.5mW' },
          { k: 'Mic bias', v: 'programmable, up to 3V' },
          { k: 'Audio interface', v: 'TDM / I2S / left-justified (16/20/24/32-bit), controller/target mode' },
          { k: 'Control interface', v: 'I2C or SPI' },
          { k: 'Supply', v: 'AVDD 1.8V/3.3V single supply; IOVDD 1.2V/1.8V/3.3V' },
          { k: 'Low power', v: '1-channel record 5mW / playback 7mW (1.8V supply)' },
          { k: 'Automotive', v: 'AEC-Q100 Grade 1 (−40°C ~ +125°C)' },
          { k: 'Package', v: '32-WQFN (RTV) 5×5mm, 0.5mm pitch, EP=VSS' }
        ],
        dropIn: [{ note: 'Same package/pinout (32-WQFN, pin-by-pin same names/numbers); the 5112 is the stereo-ADC version with a different spec grade — confirm your channel requirements.' }]
      },
      ja: {
        subcategory: '車載オーディオコーデック（モノ ADC + DAC）',
        whatIs: '車載グレード低消費電力モノオーディオコーデック：105dB ダイナミックレンジ ADC + 114dB ダイナミックレンジ DAC、差動/シングルエンド入出力対応、AEC-Q100 Grade 1（−40~+125°C）、eCall や車載ヘッドユニット等のオーディオ収録・再生用。',
        func: 'ADC はライン/マイク差動入力（2VRMS フルスケール）と AC/DC 結合に対応、プログラマブルマイクバイアス（最大 3V）内蔵；DAC はライン出力またはヘッドホン負荷（16Ω を 62.5mW まで駆動）に設定可、差動 2VRMS／シングルエンド 1VRMS 対応。プログラマブルチャネルゲイン、デジタルボリューム、低ジッタ PLL、HPF/バイクアッド EQ、低遅延フィルタモードを統合；サンプルレート 4kHz~768kHz、自動クロック/レート検出；オーディオインタフェース TDM/I2S/LJ（16/20/24/32-bit）、I2C または SPI 制御；音声/超音波アクティビティ検出、バッテリと熱フォールバック保護。',
        usedIn: 'スペース制約のある車載オーディオシステム：緊急通報（eCall）、テレマティクス制御ユニット、アクティブノイズキャンセル（ANC）、車載ヘッドユニット。',
        desc: '車載モノオーディオコーデック：105dB ADC + 114dB DAC、4k~768kHz サンプリング、TDM/I2S/LJ、I2C/SPI 制御、AEC-Q100 Grade 1、32-WQFN 5×5mm。',
        thermalPad: '露出パッド=VSS（Figure 4-1 中央に (VSS) Thermal Pad 表記、表に Thermal Pad 列）、基板接地プレーンに短絡必須。',
        specs: [
          { k: 'ADC ダイナミックレンジ', v: '105dB（ライン/マイク差動入力）；THD+N −97dB' },
          { k: 'DAC ダイナミックレンジ', v: '114dB（差動ライン/ヘッドホン出力）；THD+N −96dB' },
          { k: 'サンプルレート', v: 'ADC/DAC とも 4kHz ~ 768kHz' },
          { k: '入力/出力', v: '差動 2VRMS／シングルエンド 1VRMS；ヘッドホン 16Ω を 62.5mW まで駆動' },
          { k: 'マイクバイアス', v: 'プログラマブル、最大 3V' },
          { k: 'オーディオインタフェース', v: 'TDM / I2S / 左詰め（16/20/24/32-bit）、controller/target モード' },
          { k: '制御インタフェース', v: 'I2C または SPI' },
          { k: '電源', v: 'AVDD 1.8V/3.3V 単一電源；IOVDD 1.2V/1.8V/3.3V' },
          { k: '低消費電力', v: '1 チャネル録音 5mW／再生 7mW（1.8V 供給）' },
          { k: '車載', v: 'AEC-Q100 Grade 1（−40°C ~ +125°C）' },
          { k: 'パッケージ', v: '32-WQFN (RTV) 5×5mm、0.5mm pitch、EP=VSS' }
        ],
        dropIn: [{ note: '同パッケージ同ピン配置（32-WQFN、1 ピンずつ同名同番）；5112 はステレオ ADC 版で仕様グレードが異なる、チャネル要件を確認。' }]
      },
      ko: {
        subcategory: '차량용 오디오 코덱(모노 ADC + DAC)',
        whatIs: '차량 등급 저전력 모노 오디오 코덱: 105dB 다이내믹 레인지 ADC + 114dB 다이내믹 레인지 DAC, 차동/싱글엔드 입출력 지원, AEC-Q100 Grade 1(−40~+125°C), eCall이나 차량 헤드유닛 등의 오디오 수록·재생용.',
        func: 'ADC는 라인/마이크 차동 입력(2VRMS 풀스케일)과 AC/DC 결합을 지원, 프로그래머블 마이크 바이어스(최대 3V) 내장; DAC는 라인 출력이나 헤드폰 부하(16Ω를 62.5mW까지 구동)로 설정 가능, 차동 2VRMS/싱글엔드 1VRMS 지원. 프로그래머블 채널 이득, 디지털 볼륨, 저지터 PLL, HPF/바이쿼드 EQ, 저지연 필터 모드를 통합; 샘플링 4kHz~768kHz, 자동 클록/레이트 감지; 오디오 인터페이스 TDM/I2S/LJ(16/20/24/32-bit), I2C 또는 SPI 제어; 음성/초음파 활동 감지, 배터리와 열 폴백 보호.',
        usedIn: '공간 제약이 있는 차량 오디오 시스템: 긴급 호출(eCall), 텔레매틱스 제어 유닛, 능동 소음 제거(ANC), 차량 헤드유닛.',
        desc: '차량용 모노 오디오 코덱: 105dB ADC + 114dB DAC, 4k~768kHz 샘플링, TDM/I2S/LJ, I2C/SPI 제어, AEC-Q100 Grade 1, 32-WQFN 5×5mm.',
        thermalPad: '노출 패드=VSS(Figure 4-1 중앙에 (VSS) Thermal Pad 표기, 표에 Thermal Pad 행), 보드 접지 플레인에 단락 필수.',
        specs: [
          { k: 'ADC 다이내믹 레인지', v: '105dB(라인/마이크 차동 입력); THD+N −97dB' },
          { k: 'DAC 다이내믹 레인지', v: '114dB(차동 라인/헤드폰 출력); THD+N −96dB' },
          { k: '샘플링', v: 'ADC/DAC 모두 4kHz ~ 768kHz' },
          { k: '입력/출력', v: '차동 2VRMS / 싱글엔드 1VRMS; 헤드폰 16Ω를 62.5mW까지 구동' },
          { k: '마이크 바이어스', v: '프로그래머블, 최대 3V' },
          { k: '오디오 인터페이스', v: 'TDM / I2S / 좌측 정렬(16/20/24/32-bit), controller/target 모드' },
          { k: '제어 인터페이스', v: 'I2C 또는 SPI' },
          { k: '전원', v: 'AVDD 1.8V/3.3V 단일 전원; IOVDD 1.2V/1.8V/3.3V' },
          { k: '저전력', v: '1채널 녹음 5mW / 재생 7mW(1.8V 공급)' },
          { k: '차량', v: 'AEC-Q100 Grade 1(−40°C ~ +125°C)' },
          { k: '패키지', v: '32-WQFN (RTV) 5×5mm, 0.5mm pitch, EP=VSS' }
        ],
        dropIn: [{ note: '동일 패키지 동일 핀 배치(32-WQFN, 핀 단위로 동일 이름·번호); 5112는 스테레오 ADC 판으로 사양 등급이 다름, 채널 요구사항 확인.' }]
      }
    },
    'LMKDB1112': {
      en: {
        subcategory: 'PCIe LP-HCSL clock buffer (1:12)',
        whatIs: 'Ultra-low-additive-jitter LP-HCSL clock buffer: fans one differential input out to 12 LP-HCSL differential outputs, supporting PCIe Gen 1~Gen 7 (CC and IR architectures, with SSC input), pin-compatible with the Intel DB1206.',
        func: 'Each of the 12 LP-HCSL outputs has an independent OE# enable (with internal pull-up); an SBI (Side-Band Interface) allows high-speed batch output switching (SBI_EN sets the dual function of the OE2/4/7/10 pins); an SMBus interface (SADR0/1 three-level addressing) provides register control; LOS# is an open-drain output indicating loss of the input clock; fail-safe inputs, flexible power-up sequencing and automatic output disable; output impedance 85Ω/100Ω selectable, two slew-rate options (SLEWRATE_SEL).',
        usedIn: 'PCIe clock-tree fanout in high-performance computing, server motherboards, NIC/SmartNICs and hardware accelerator cards (common at the front of AI-server PCIe retimers/switches).',
        desc: 'PCIe Gen1~7 LP-HCSL 1:12 clock buffer, additive jitter 5fs (Gen5) / 2.1fs (Gen7) max, SMBus + SBI control, 1.8V/3.3V supply, 64-LGA 5×5mm (DB1206 pin-compatible).',
        thermalPad: 'Central 4×4 GND land array (D4~G7, 16 points, both thermal and ground; the 64-pin count excludes this array), must connect to the board ground plane.',
        specs: [
          { k: 'Topology', v: '1 differential input → 12 LP-HCSL differential outputs' },
          { k: 'PCIe support', v: 'Gen 1 ~ Gen 7 (CC/IR architectures, SSC input both OK); DB2000QL spec, DB1206 pin-compatible' },
          { k: 'Additive jitter', v: '31fs max (12kHz-20MHz RMS @156.25MHz); PCIe Gen4 13fs / Gen5 5fs / Gen6 3fs / Gen7 2.1fs max' },
          { k: 'Control', v: 'per-output OE# + SBI high-speed switching + SMBus (three-level address ×2)' },
          { k: 'Output impedance', v: '85Ω or 100Ω' },
          { k: 'Supply', v: '1.8V / 3.3V ±10% (VDDA + VDDCLK×5)' },
          { k: 'Temperature', v: '−40°C ~ +105°C' },
          { k: 'Package', v: '64-pin LGA (ZSF) 5×5mm + central 16-point GND array' }
        ]
      },
      ja: {
        subcategory: 'PCIe LP-HCSL クロックバッファ（1:12）',
        whatIs: '超低付加ジッタ LP-HCSL クロックバッファ：1 系統の差動入力を 12 系統の LP-HCSL 差動出力にファンアウト、PCIe Gen 1~Gen 7（CC と IR アーキテクチャ、SSC 入力対応）に対応、Intel DB1206 とピン互換。',
        func: '12 系統の LP-HCSL 出力は各々独立 OE# イネーブル（内蔵プルアップ）；SBI（Side-Band Interface）で高速一括出力切替（SBI_EN が OE2/4/7/10 ピンの二重機能を決定）；SMBus インタフェース（SADR0/1 三値アドレス）でレジスタ制御；LOS# はオープンドレイン出力で入力クロック喪失を指示；フェイルセーフ入力、柔軟な電源投入順序、自動出力停止；出力インピーダンス 85Ω/100Ω 選択可、スルーレート 2 段（SLEWRATE_SEL）。',
        usedIn: '高性能計算、サーバマザーボード、NIC/SmartNIC、ハードウェアアクセラレータカード等の PCIe クロックツリーファンアウト（AI サーバの PCIe リタイマ/スイッチ前段で一般的）。',
        desc: 'PCIe Gen1~7 LP-HCSL 1:12 クロックバッファ、付加ジッタ 5fs（Gen5）/2.1fs（Gen7）max、SMBus + SBI 制御、1.8V/3.3V 供給、64-LGA 5×5mm（DB1206 ピン互換）。',
        thermalPad: '中央 4×4 GND land アレイ（D4~G7 の 16 点、放熱と接地兼用；64 ピン計数にこのアレイは含まず）、基板接地プレーンに接続必須。',
        specs: [
          { k: 'トポロジ', v: '1 系統差動入力 → 12 系統 LP-HCSL 差動出力' },
          { k: 'PCIe 対応', v: 'Gen 1 ~ Gen 7（CC/IR アーキテクチャ、SSC 入力とも可）；DB2000QL 仕様、DB1206 ピン互換' },
          { k: '付加ジッタ', v: '31fs max（12kHz-20MHz RMS @156.25MHz）；PCIe Gen4 13fs／Gen5 5fs／Gen6 3fs／Gen7 2.1fs max' },
          { k: '制御', v: '系統毎 OE# ＋ SBI 高速切替 ＋ SMBus（三値アドレス×2）' },
          { k: '出力インピーダンス', v: '85Ω または 100Ω' },
          { k: '電源', v: '1.8V／3.3V ±10%（VDDA ＋ VDDCLK×5）' },
          { k: '温度', v: '−40°C ~ +105°C' },
          { k: 'パッケージ', v: '64-pin LGA (ZSF) 5×5mm ＋ 中央 16 点 GND アレイ' }
        ]
      },
      ko: {
        subcategory: 'PCIe LP-HCSL 클록 버퍼(1:12)',
        whatIs: '초저 부가 지터 LP-HCSL 클록 버퍼: 1계통 차동 입력을 12계통 LP-HCSL 차동 출력으로 팬아웃, PCIe Gen 1~Gen 7(CC와 IR 아키텍처, SSC 입력 지원) 지원, Intel DB1206과 핀 호환.',
        func: '12계통 LP-HCSL 출력은 각각 독립 OE# 인에이블(내장 풀업); SBI(Side-Band Interface)로 고속 일괄 출력 전환(SBI_EN이 OE2/4/7/10 핀의 이중 기능 결정); SMBus 인터페이스(SADR0/1 3값 주소)로 레지스터 제어; LOS#은 오픈 드레인 출력으로 입력 클록 상실 지시; 페일세이프 입력, 유연한 전원 인가 순서, 자동 출력 정지; 출력 임피던스 85Ω/100Ω 선택 가능, 슬루율 2단(SLEWRATE_SEL).',
        usedIn: '고성능 컴퓨팅, 서버 메인보드, NIC/SmartNIC, 하드웨어 가속 카드 등의 PCIe 클록 트리 팬아웃(AI 서버 PCIe 리타이머/스위치 전단에서 일반적).',
        desc: 'PCIe Gen1~7 LP-HCSL 1:12 클록 버퍼, 부가 지터 5fs(Gen5)/2.1fs(Gen7) max, SMBus + SBI 제어, 1.8V/3.3V 공급, 64-LGA 5×5mm(DB1206 핀 호환).',
        thermalPad: '중앙 4×4 GND land 어레이(D4~G7의 16점, 방열과 접지 겸용; 64핀 계수에 이 어레이는 미포함), 보드 접지 플레인에 연결 필수.',
        specs: [
          { k: '토폴로지', v: '1계통 차동 입력 → 12계통 LP-HCSL 차동 출력' },
          { k: 'PCIe 지원', v: 'Gen 1 ~ Gen 7(CC/IR 아키텍처, SSC 입력 모두 가능); DB2000QL 규격, DB1206 핀 호환' },
          { k: '부가 지터', v: '31fs max(12kHz-20MHz RMS @156.25MHz); PCIe Gen4 13fs / Gen5 5fs / Gen6 3fs / Gen7 2.1fs max' },
          { k: '제어', v: '계통별 OE# + SBI 고속 전환 + SMBus(3값 주소×2)' },
          { k: '출력 임피던스', v: '85Ω 또는 100Ω' },
          { k: '전원', v: '1.8V / 3.3V ±10%(VDDA + VDDCLK×5)' },
          { k: '온도', v: '−40°C ~ +105°C' },
          { k: '패키지', v: '64-pin LGA (ZSF) 5×5mm + 중앙 16점 GND 어레이' }
        ]
      }
    },
    'TAC5112-Q1': {
      en: {
        subcategory: 'Automotive audio codec (stereo ADC + DAC)',
        whatIs: 'Automotive-grade low-power stereo audio codec: 105dB-dynamic-range stereo ADC + 114dB-dynamic-range stereo DAC (107dB in single-ended 4-channel mode), supporting differential/single-ended I/O, AEC-Q100 Grade 1 (−40~+125°C), for audio capture and playback in eCall, car head units, etc.',
        func: 'The ADC supports line/mic differential input (2VRMS full-scale) with AC/DC coupling, configurable up to 4 record channels (2 analog+2 digital / 1 analog+3 digital / 4 digital), with a programmable mic bias (up to 3V); the DAC can be configured for stereo differential or 4-channel single-ended output, line output or a headphone load (16Ω to 62.5mW), supporting differential 2VRMS / pseudo-differential and single-ended 1VRMS. It integrates programmable channel gain, digital volume, a low-jitter PLL, HPF/biquad EQ and low-latency filter modes; sample rate 4kHz~768kHz with automatic clock/rate detection; audio interface TDM/I2S/LJ (16/20/24/32-bit), controller/target mode, I2C or SPI control; voice/ultrasonic activity detection, battery and thermal foldback protection, signal-distortion limiter.',
        usedIn: 'Space-constrained automotive audio systems: emergency call (eCall), telematics control units, active noise cancellation (ANC), car head units.',
        desc: 'Automotive stereo audio codec: 105dB stereo ADC + 114dB DAC (107dB single-ended 4-channel), 4k~768kHz sampling, TDM/I2S/LJ, I2C/SPI control, AEC-Q100 Grade 1, 32-WQFN 5×5mm; its pinout matches the TAC5111-Q1 (mono) pin-by-pin in name and position, differing only in channel modes and spec notes; not compatible with TAC5301/5312/5412-Q1.',
        thermalPad: 'Exposed pad = VSS (Figure 4-1 marks Thermal Pad (VSS), Table 4-1 has a Thermal Pad row), must be shorted to the board ground plane.',
        specs: [
          { k: 'ADC dynamic range', v: '105dB (line/mic differential, stereo); THD+N −97dB; channel-sum mode SNR 108dB' },
          { k: 'DAC dynamic range', v: '114dB (differential line/headphone, stereo); single-ended 4-channel 107dB; THD+N −96dB' },
          { k: 'Sample rate', v: 'ADC/DAC both 4kHz ~ 768kHz' },
          { k: 'Input/output', v: 'differential 2VRMS / single-ended 1VRMS; headphone drives 16Ω to 62.5mW' },
          { k: 'Record channel config', v: 'up to 4 channels (2 analog+2 digital / 1 analog+3 digital / 4 digital)' },
          { k: 'Mic bias', v: 'programmable, up to 3V' },
          { k: 'Audio interface', v: 'TDM / I2S / left-justified (16/20/24/32-bit), controller/target mode' },
          { k: 'Control interface', v: 'I2C or SPI' },
          { k: 'Supply', v: 'AVDD 1.8V/3.3V single supply; IOVDD 1.2V/1.8V/3.3V' },
          { k: 'Low power', v: '2-channel record 8mW / playback 10.5mW (1.8V supply)' },
          { k: 'Automotive', v: 'AEC-Q100 Grade 1 (−40°C ~ +125°C)' },
          { k: 'Package', v: '32-WQFN (RTV) 5×5mm, 0.5mm pitch, EP=VSS' }
        ],
        dropIn: [{ note: 'Same package/pinout (pin-by-pin same names/numbers); different spec grade — confirm your dynamic-range requirements.' }]
      },
      ja: {
        subcategory: '車載オーディオコーデック（ステレオ ADC + DAC）',
        whatIs: '車載グレード低消費電力ステレオオーディオコーデック：105dB ダイナミックレンジステレオ ADC + 114dB ダイナミックレンジステレオ DAC（シングルエンド 4 チャネルモードで 107dB）、差動/シングルエンド入出力対応、AEC-Q100 Grade 1（−40~+125°C）、eCall や車載ヘッドユニット等のオーディオ収録・再生用。',
        func: 'ADC はライン/マイク差動入力（2VRMS フルスケール）と AC/DC 結合に対応、最大 4 録音チャネル（2 アナログ+2 デジタル／1 アナログ+3 デジタル／4 デジタル）に設定可、プログラマブルマイクバイアス（最大 3V）内蔵；DAC はステレオ差動または 4 チャネルシングルエンド出力、ライン出力またはヘッドホン負荷（16Ω を 62.5mW まで）に設定可、差動 2VRMS／擬似差動とシングルエンド 1VRMS 対応。プログラマブルチャネルゲイン、デジタルボリューム、低ジッタ PLL、HPF/バイクアッド EQ、低遅延フィルタモードを統合；サンプルレート 4kHz~768kHz、自動クロック/レート検出；オーディオインタフェース TDM/I2S/LJ（16/20/24/32-bit）、controller/target モード、I2C または SPI 制御；音声/超音波アクティビティ検出、バッテリと熱フォールバック保護、信号歪みリミッタ。',
        usedIn: 'スペース制約のある車載オーディオシステム：緊急通報（eCall）、テレマティクス制御ユニット、アクティブノイズキャンセル（ANC）、車載ヘッドユニット。',
        desc: '車載ステレオオーディオコーデック：105dB ステレオ ADC + 114dB DAC（シングルエンド 4 チャネル 107dB）、4k~768kHz サンプリング、TDM/I2S/LJ、I2C/SPI 制御、AEC-Q100 Grade 1、32-WQFN 5×5mm；pinout は TAC5111-Q1（モノ版）と 1 ピンずつ同名同位で、チャネルモードと仕様説明のみ異なる、TAC5301/5312/5412-Q1 とは非互換。',
        thermalPad: '露出パッド=VSS（Figure 4-1 に Thermal Pad (VSS) 表記、Table 4-1 に Thermal Pad 列）、基板接地プレーンに短絡必須。',
        specs: [
          { k: 'ADC ダイナミックレンジ', v: '105dB（ライン/マイク差動、ステレオ）；THD+N −97dB；チャネル加算モード SNR 108dB' },
          { k: 'DAC ダイナミックレンジ', v: '114dB（差動ライン/ヘッドホン、ステレオ）；シングルエンド 4 チャネル 107dB；THD+N −96dB' },
          { k: 'サンプルレート', v: 'ADC/DAC とも 4kHz ~ 768kHz' },
          { k: '入力/出力', v: '差動 2VRMS／シングルエンド 1VRMS；ヘッドホン 16Ω を 62.5mW まで駆動' },
          { k: '録音チャネル構成', v: '最大 4 チャネル（2 アナログ+2 デジタル／1 アナログ+3 デジタル／4 デジタル）' },
          { k: 'マイクバイアス', v: 'プログラマブル、最大 3V' },
          { k: 'オーディオインタフェース', v: 'TDM / I2S / 左詰め（16/20/24/32-bit）、controller/target モード' },
          { k: '制御インタフェース', v: 'I2C または SPI' },
          { k: '電源', v: 'AVDD 1.8V/3.3V 単一電源；IOVDD 1.2V/1.8V/3.3V' },
          { k: '低消費電力', v: '2 チャネル録音 8mW／再生 10.5mW（1.8V 供給）' },
          { k: '車載', v: 'AEC-Q100 Grade 1（−40°C ~ +125°C）' },
          { k: 'パッケージ', v: '32-WQFN (RTV) 5×5mm、0.5mm pitch、EP=VSS' }
        ],
        dropIn: [{ note: '同パッケージ同ピン配置（1 ピンずつ同名同番）；仕様グレードが異なる、ダイナミックレンジ要件を確認。' }]
      },
      ko: {
        subcategory: '차량용 오디오 코덱(스테레오 ADC + DAC)',
        whatIs: '차량 등급 저전력 스테레오 오디오 코덱: 105dB 다이내믹 레인지 스테레오 ADC + 114dB 다이내믹 레인지 스테레오 DAC(싱글엔드 4채널 모드에서 107dB), 차동/싱글엔드 입출력 지원, AEC-Q100 Grade 1(−40~+125°C), eCall이나 차량 헤드유닛 등의 오디오 수록·재생용.',
        func: 'ADC는 라인/마이크 차동 입력(2VRMS 풀스케일)과 AC/DC 결합을 지원, 최대 4 녹음 채널(2 아날로그+2 디지털 / 1 아날로그+3 디지털 / 4 디지털)로 설정 가능, 프로그래머블 마이크 바이어스(최대 3V) 내장; DAC는 스테레오 차동 또는 4채널 싱글엔드 출력, 라인 출력이나 헤드폰 부하(16Ω를 62.5mW까지)로 설정 가능, 차동 2VRMS/의사 차동과 싱글엔드 1VRMS 지원. 프로그래머블 채널 이득, 디지털 볼륨, 저지터 PLL, HPF/바이쿼드 EQ, 저지연 필터 모드를 통합; 샘플링 4kHz~768kHz, 자동 클록/레이트 감지; 오디오 인터페이스 TDM/I2S/LJ(16/20/24/32-bit), controller/target 모드, I2C 또는 SPI 제어; 음성/초음파 활동 감지, 배터리와 열 폴백 보호, 신호 왜곡 리미터.',
        usedIn: '공간 제약이 있는 차량 오디오 시스템: 긴급 호출(eCall), 텔레매틱스 제어 유닛, 능동 소음 제거(ANC), 차량 헤드유닛.',
        desc: '차량용 스테레오 오디오 코덱: 105dB 스테레오 ADC + 114dB DAC(싱글엔드 4채널 107dB), 4k~768kHz 샘플링, TDM/I2S/LJ, I2C/SPI 제어, AEC-Q100 Grade 1, 32-WQFN 5×5mm; pinout은 TAC5111-Q1(모노 판)과 핀 단위로 동일 이름·위치이며 채널 모드와 사양 설명만 다름, TAC5301/5312/5412-Q1과는 비호환.',
        thermalPad: '노출 패드=VSS(Figure 4-1에 Thermal Pad (VSS) 표기, Table 4-1에 Thermal Pad 행), 보드 접지 플레인에 단락 필수.',
        specs: [
          { k: 'ADC 다이내믹 레인지', v: '105dB(라인/마이크 차동, 스테레오); THD+N −97dB; 채널 합산 모드 SNR 108dB' },
          { k: 'DAC 다이내믹 레인지', v: '114dB(차동 라인/헤드폰, 스테레오); 싱글엔드 4채널 107dB; THD+N −96dB' },
          { k: '샘플링', v: 'ADC/DAC 모두 4kHz ~ 768kHz' },
          { k: '입력/출력', v: '차동 2VRMS / 싱글엔드 1VRMS; 헤드폰 16Ω를 62.5mW까지 구동' },
          { k: '녹음 채널 구성', v: '최대 4채널(2 아날로그+2 디지털 / 1 아날로그+3 디지털 / 4 디지털)' },
          { k: '마이크 바이어스', v: '프로그래머블, 최대 3V' },
          { k: '오디오 인터페이스', v: 'TDM / I2S / 좌측 정렬(16/20/24/32-bit), controller/target 모드' },
          { k: '제어 인터페이스', v: 'I2C 또는 SPI' },
          { k: '전원', v: 'AVDD 1.8V/3.3V 단일 전원; IOVDD 1.2V/1.8V/3.3V' },
          { k: '저전력', v: '2채널 녹음 8mW / 재생 10.5mW(1.8V 공급)' },
          { k: '차량', v: 'AEC-Q100 Grade 1(−40°C ~ +125°C)' },
          { k: '패키지', v: '32-WQFN (RTV) 5×5mm, 0.5mm pitch, EP=VSS' }
        ],
        dropIn: [{ note: '동일 패키지 동일 핀 배치(핀 단위로 동일 이름·번호); 사양 등급이 다름, 다이내믹 레인지 요구사항 확인.' }]
      }
    }
  };
  Object.assign(window.IC_I18N, T);
})();
/* batch 11A: entries 129-136 */
(function () {
  // TAC5312-Q1 / TAC5412-Q1 share func/usedIn (only dynamic-range grade differs)
  var t53func = {
    en: 'The ADC supports line/mic differential input with high-voltage full-scale (differential 10VRMS / single-ended 5VRMS), AC/DC coupling; a built-in boost converter (needing only 3.3V) or external HVDD generates the programmable mic bias (3V~10V); it provides mic-input diagnostics: open/short, short-to-ground/MICBIAS/VBAT, bias overcurrent. The DAC can be configured for stereo differential or single-ended output, line output or a headphone load (16Ω to 62.5mW), differential 2VRMS / single-ended 1VRMS. It integrates programmable channel gain, digital volume, a low-jitter PLL, HPF/biquad EQ, low-/ultra-low-latency filter modes; sample rate 4kHz~768kHz; audio interface TDM/I2S/LJ (16/20/24/32-bit), control via I2C or SPI.',
    ja: 'ADC はライン/マイク差動入力に対応し高圧フルスケール（差動 10VRMS／シングルエンド 5VRMS）、AC/DC 結合可；内蔵ブーストコンバータ（3.3V 供給のみ）または外部 HVDD でプログラマブルマイクバイアス（3V~10V）を生成；マイク入力の開放/短絡、対地/MICBIAS/VBAT 短絡、バイアス過電流等の故障診断を提供。DAC はステレオ差動またはシングルエンド出力、ライン出力またはヘッドホン負荷（16Ω を 62.5mW まで）に設定可、差動 2VRMS／シングルエンド 1VRMS。プログラマブルチャネルゲイン、デジタルボリューム、低ジッタ PLL、HPF/バイクアッド EQ、低遅延/超低遅延フィルタモードを統合；サンプルレート 4kHz~768kHz；オーディオインタフェース TDM/I2S/LJ（16/20/24/32-bit）、制御は I2C または SPI。',
    ko: 'ADC는 라인/마이크 차동 입력을 지원하며 고압 풀스케일(차동 10VRMS / 싱글엔드 5VRMS), AC/DC 결합 가능; 내장 부스트 컨버터(3.3V 공급만 필요) 또는 외부 HVDD로 프로그래머블 마이크 바이어스(3V~10V) 생성; 마이크 입력 개방/단락, 대지/MICBIAS/VBAT 단락, 바이어스 과전류 등 고장 진단 제공. DAC는 스테레오 차동 또는 싱글엔드 출력, 라인 출력이나 헤드폰 부하(16Ω를 62.5mW까지)로 설정 가능, 차동 2VRMS / 싱글엔드 1VRMS. 프로그래머블 채널 이득, 디지털 볼륨, 저지터 PLL, HPF/바이쿼드 EQ, 저지연/초저지연 필터 모드를 통합; 샘플링 4kHz~768kHz; 오디오 인터페이스 TDM/I2S/LJ(16/20/24/32-bit), 제어는 I2C 또는 SPI.'
  };
  var t53used = {
    en: 'Automotive audio systems needing direct high-voltage mic connection and fault diagnostics: emergency call (eCall), telematics control units, active noise cancellation (ANC), car head units.',
    ja: '高圧マイクの直接接続と故障診断が必要な車載オーディオシステム：緊急通報（eCall）、テレマティクス制御ユニット、アクティブノイズキャンセル（ANC）、車載ヘッドユニット。',
    ko: '고압 마이크 직접 연결과 고장 진단이 필요한 차량 오디오 시스템: 긴급 호출(eCall), 텔레매틱스 제어 유닛, 능동 소음 제거(ANC), 차량 헤드유닛.'
  };
  var t53pad = {
    en: 'Exposed pad = VSS (Figure 4-1 marks Thermal Pad (VSS), Table 4-1 has a Thermal Pad row), must be shorted to the board ground plane.',
    ja: '露出パッド=VSS（Figure 4-1 に Thermal Pad (VSS) 表記、Table 4-1 に Thermal Pad 列）、基板接地プレーンに短絡必須。',
    ko: '노출 패드=VSS(Figure 4-1에 Thermal Pad (VSS) 표기, Table 4-1에 Thermal Pad 행), 보드 접지 플레인에 단락 필수.'
  };
  function t53specs(lang, adc, dac) {
    return {
      en: [
        { k: 'ADC dynamic range', v: adc },
        { k: 'DAC dynamic range', v: dac },
        { k: 'Sample rate', v: 'ADC/DAC both 4kHz ~ 768kHz' },
        { k: 'Input/output', v: 'differential 10VRMS / single-ended 5VRMS input; differential 2VRMS / single-ended 1VRMS output; headphone 16Ω to 62.5mW' },
        { k: 'Mic bias', v: 'programmable 3V~10V, built-in boost (3.3V supply) or external HVDD' },
        { k: 'Diagnostics', v: 'mic-input open/short, short-to-ground/MICBIAS/VBAT, bias overcurrent protection' },
        { k: 'Audio interface', v: 'TDM / I2S / left-justified (16/20/24/32-bit)' },
        { k: 'Control interface', v: 'I2C or SPI' },
        { k: 'Supply', v: 'AVDD 3.3V-only single supply; IOVDD 1.2V/1.8V/3.3V; BSTVDD 3.3V' },
        { k: 'Automotive', v: 'AEC-Q100 Grade 1 (−40°C ~ +125°C)' },
        { k: 'Package', v: '32-WQFN (RTV) 5×5mm, 0.5mm pitch, EP=VSS' }
      ],
      ja: [
        { k: 'ADC ダイナミックレンジ', v: adc },
        { k: 'DAC ダイナミックレンジ', v: dac },
        { k: 'サンプルレート', v: 'ADC/DAC とも 4kHz ~ 768kHz' },
        { k: '入力/出力', v: '差動 10VRMS／シングルエンド 5VRMS 入力；差動 2VRMS／シングルエンド 1VRMS 出力；ヘッドホン 16Ω を 62.5mW まで' },
        { k: 'マイクバイアス', v: 'プログラマブル 3V~10V、内蔵ブースト（3.3V 供給）または外部 HVDD' },
        { k: '故障診断', v: 'マイク入力の開放/短絡、対地/MICBIAS/VBAT 短絡、バイアス過電流保護' },
        { k: 'オーディオインタフェース', v: 'TDM / I2S / 左詰め（16/20/24/32-bit）' },
        { k: '制御インタフェース', v: 'I2C または SPI' },
        { k: '電源', v: 'AVDD 3.3V のみ単一電源；IOVDD 1.2V/1.8V/3.3V；BSTVDD 3.3V' },
        { k: '車載', v: 'AEC-Q100 Grade 1（−40°C ~ +125°C）' },
        { k: 'パッケージ', v: '32-WQFN (RTV) 5×5mm、0.5mm pitch、EP=VSS' }
      ],
      ko: [
        { k: 'ADC 다이내믹 레인지', v: adc },
        { k: 'DAC 다이내믹 레인지', v: dac },
        { k: '샘플링', v: 'ADC/DAC 모두 4kHz ~ 768kHz' },
        { k: '입력/출력', v: '차동 10VRMS / 싱글엔드 5VRMS 입력; 차동 2VRMS / 싱글엔드 1VRMS 출력; 헤드폰 16Ω를 62.5mW까지' },
        { k: '마이크 바이어스', v: '프로그래머블 3V~10V, 내장 부스트(3.3V 공급) 또는 외부 HVDD' },
        { k: '고장 진단', v: '마이크 입력 개방/단락, 대지/MICBIAS/VBAT 단락, 바이어스 과전류 보호' },
        { k: '오디오 인터페이스', v: 'TDM / I2S / 좌측 정렬(16/20/24/32-bit)' },
        { k: '제어 인터페이스', v: 'I2C 또는 SPI' },
        { k: '전원', v: 'AVDD 3.3V 전용 단일 전원; IOVDD 1.2V/1.8V/3.3V; BSTVDD 3.3V' },
        { k: '차량', v: 'AEC-Q100 Grade 1(−40°C ~ +125°C)' },
        { k: '패키지', v: '32-WQFN (RTV) 5×5mm, 0.5mm pitch, EP=VSS' }
      ]
    }[lang];
  }
  var t53drop = {
    en: [{ note: 'Same package/pinout (pin-by-pin same names/numbers); different spec grade — confirm your dynamic-range requirements.' }],
    ja: [{ note: '同パッケージ同ピン配置（1 ピンずつ同名同番）；仕様グレードが異なる、ダイナミックレンジ要件を確認。' }],
    ko: [{ note: '동일 패키지 동일 핀 배치(핀 단위로 동일 이름·번호); 사양 등급이 다름, 다이내믹 레인지 요구사항 확인.' }]
  };

  var T = {
    'TAC5301-Q1': {
      en: {
        subcategory: 'Automotive audio codec (mono ADC + DAC, high-voltage micbias)',
        whatIs: 'Automotive mono audio codec: ADC dynamic range about 100~101dB (differential input; the datasheet title says 101dB while the Features text says 100dB — see the datasheet) + 110dB DAC, with programmable high-voltage mic bias (3V~10V, needs external HVDD), AEC-Q100 Grade 1 (−40~+125°C), 24-Pin QFN with special corner pins.',
        func: 'The ADC supports line/mic differential input (2VRMS full-scale) with AC/DC coupling; mic bias is programmable 3V~10V and needs an external high-voltage HVDD supply (no built-in boost converter, unlike the family TAC5312-Q1/TAC5412-Q1). The DAC can be configured for mono differential or stereo single-ended output, line output or a headphone load (16Ω to 62.5mW), differential 2VRMS / pseudo-differential and single-ended 1VRMS. It integrates programmable channel gain, digital volume, a low-jitter PLL, HPF/biquad EQ, low-latency filter modes; sample rate 8kHz~192kHz (narrower than the family’s 4k~768kHz); audio interface TDM/I2S/LJ (16/20/24/32-bit), I2C control only (no SPI); voice/ultrasonic activity detection, battery/thermal foldback protection, signal-distortion limiter.',
        usedIn: 'Space-constrained automotive audio systems: telematics control units, car head units, instrument clusters, rear-seat entertainment.',
        desc: 'Automotive mono audio codec: ADC ~100~101dB / DAC 110dB, 8k~192kHz sampling, I2C-only control (no SPI), high-voltage mic bias 3~10V (needs external HVDD), AVDD 3.3V-only, 24-Pin QFN 4×4mm with special corner pins + EP; the pinout is completely incompatible with the family’s other 32-WQFN parts (TAC5112/5312/5412-Q1).',
        thermalPad: 'Exposed pad = VSS (Figure 4-1 marks Thermal Pad (VSS), Table 4-1 has a Thermal Pad row), must be shorted to the board ground plane; the package also has 4 corner pins (A1~A4, all Ground), unique to this 24-Pin QFN with Exposed Thermal Pad and Corner Pins — not a standard 24-QFN, see datasheet Figure 4-1.',
        specs: [
          { k: 'ADC dynamic range', v: 'differential input 100dB (Features text) / datasheet title says 101dB, confirm in datasheet; THD+N −87dB' },
          { k: 'DAC dynamic range', v: 'differential line output 110dB / differential headphone 109dB; THD+N −101dB' },
          { k: 'Sample rate', v: 'ADC/DAC both 8kHz ~ 192kHz' },
          { k: 'Input/output', v: 'differential 2VRMS / single-ended 1VRMS; headphone 16Ω to 62.5mW' },
          { k: 'Mic bias', v: 'programmable 3V~10V, needs external HVDD (no built-in boost)' },
          { k: 'Audio interface', v: 'TDM / I2S / left-justified (16/20/24/32-bit), controller/target mode' },
          { k: 'Control interface', v: 'I2C only (no SPI)' },
          { k: 'Supply', v: 'AVDD 3.3V-only single supply; IOVDD 1.2V/1.8V/3.3V; HVDD up to 12V' },
          { k: 'Automotive', v: 'AEC-Q100 Grade 1 (−40°C ~ +125°C)' },
          { k: 'Package', v: '24-Pin QFN (RGE) 4×4mm, with 4 corner pins + EP=VSS, non-standard layout' }
        ]
      },
      ja: {
        subcategory: '車載オーディオコーデック（モノ ADC + DAC・高圧 micbias）',
        whatIs: '車載モノオーディオコーデック：ADC ダイナミックレンジ約 100~101dB（差動入力；datasheet タイトルは 101dB、Features 本文は 100dB と僅かに差異、datasheet 参照）+ DAC 110dB、プログラマブル高圧マイクバイアス（3V~10V、外部 HVDD 必要）対応、AEC-Q100 Grade 1（−40~+125°C）、特殊コーナーピン付 24-Pin QFN。',
        func: 'ADC はライン/マイク差動入力（2VRMS フルスケール）と AC/DC 結合に対応；マイクバイアスは 3V~10V プログラマブルで外部高圧 HVDD 電源が必要（内蔵ブーストなし、同ファミリの TAC5312-Q1/TAC5412-Q1 と異なる）。DAC はモノ差動またはステレオシングルエンド出力、ライン出力またはヘッドホン負荷（16Ω を 62.5mW まで）に設定可、差動 2VRMS／擬似差動とシングルエンド 1VRMS。プログラマブルチャネルゲイン、デジタルボリューム、低ジッタ PLL、HPF/バイクアッド EQ、低遅延フィルタモードを統合；サンプルレート 8kHz~192kHz（ファミリ他型番の 4k~768kHz より狭い）；オーディオインタフェース TDM/I2S/LJ（16/20/24/32-bit）、制御は I2C のみ（SPI 非対応）；音声/超音波アクティビティ検出、バッテリ/熱フォールバック保護、信号歪みリミッタ。',
        usedIn: 'スペース制約のある車載オーディオシステム：テレマティクス制御ユニット、車載ヘッドユニット、メータクラスタ、後席エンタテインメント。',
        desc: '車載モノオーディオコーデック：ADC 約 100~101dB／DAC 110dB、8k~192kHz サンプリング、I2C のみ制御（SPI なし）、高圧マイクバイアス 3~10V（外部 HVDD 必要）、AVDD 3.3V のみ、24-Pin QFN 4×4mm 特殊コーナーピン＋EP；ピン配置はファミリ他の 32-WQFN 型番（TAC5112/5312/5412-Q1）と完全非互換。',
        thermalPad: '露出パッド=VSS（Figure 4-1 に Thermal Pad (VSS) 表記、Table 4-1 に Thermal Pad 列）、基板接地プレーンに短絡必須；パッケージは 4 個のコーナーピン（A1~A4、すべて Ground）も持ち、この 24-Pin QFN with Exposed Thermal Pad and Corner Pins 特殊パッケージ独自のもの、標準 24-QFN でない、datasheet Figure 4-1 参照。',
        specs: [
          { k: 'ADC ダイナミックレンジ', v: '差動入力 100dB（Features 本文）／datasheet タイトルは 101dB、datasheet で確認；THD+N −87dB' },
          { k: 'DAC ダイナミックレンジ', v: '差動ライン出力 110dB／差動ヘッドホン 109dB；THD+N −101dB' },
          { k: 'サンプルレート', v: 'ADC/DAC とも 8kHz ~ 192kHz' },
          { k: '入力/出力', v: '差動 2VRMS／シングルエンド 1VRMS；ヘッドホン 16Ω を 62.5mW まで' },
          { k: 'マイクバイアス', v: 'プログラマブル 3V~10V、外部 HVDD 必要（内蔵ブーストなし）' },
          { k: 'オーディオインタフェース', v: 'TDM / I2S / 左詰め（16/20/24/32-bit）、controller/target モード' },
          { k: '制御インタフェース', v: 'I2C のみ（SPI 非対応）' },
          { k: '電源', v: 'AVDD 3.3V のみ単一電源；IOVDD 1.2V/1.8V/3.3V；HVDD 最大 12V' },
          { k: '車載', v: 'AEC-Q100 Grade 1（−40°C ~ +125°C）' },
          { k: 'パッケージ', v: '24-Pin QFN (RGE) 4×4mm、コーナーピン 4 個＋EP=VSS、非標準レイアウト' }
        ]
      },
      ko: {
        subcategory: '차량용 오디오 코덱(모노 ADC + DAC·고압 micbias)',
        whatIs: '차량용 모노 오디오 코덱: ADC 다이내믹 레인지 약 100~101dB(차동 입력; datasheet 제목은 101dB, Features 본문은 100dB로 약간 차이, datasheet 참조) + DAC 110dB, 프로그래머블 고압 마이크 바이어스(3V~10V, 외부 HVDD 필요) 지원, AEC-Q100 Grade 1(−40~+125°C), 특수 코너 핀 포함 24-Pin QFN.',
        func: 'ADC는 라인/마이크 차동 입력(2VRMS 풀스케일)과 AC/DC 결합을 지원; 마이크 바이어스는 3V~10V 프로그래머블로 외부 고압 HVDD 전원 필요(내장 부스트 없음, 동일 패밀리 TAC5312-Q1/TAC5412-Q1과 다름). DAC는 모노 차동 또는 스테레오 싱글엔드 출력, 라인 출력이나 헤드폰 부하(16Ω를 62.5mW까지)로 설정 가능, 차동 2VRMS/의사 차동과 싱글엔드 1VRMS. 프로그래머블 채널 이득, 디지털 볼륨, 저지터 PLL, HPF/바이쿼드 EQ, 저지연 필터 모드를 통합; 샘플링 8kHz~192kHz(패밀리 다른 부품의 4k~768kHz보다 좁음); 오디오 인터페이스 TDM/I2S/LJ(16/20/24/32-bit), 제어는 I2C만(SPI 미지원); 음성/초음파 활동 감지, 배터리/열 폴백 보호, 신호 왜곡 리미터.',
        usedIn: '공간 제약이 있는 차량 오디오 시스템: 텔레매틱스 제어 유닛, 차량 헤드유닛, 계기판(Cluster), 뒷좌석 엔터테인먼트.',
        desc: '차량용 모노 오디오 코덱: ADC 약 100~101dB / DAC 110dB, 8k~192kHz 샘플링, I2C 전용 제어(SPI 없음), 고압 마이크 바이어스 3~10V(외부 HVDD 필요), AVDD 3.3V 전용, 24-Pin QFN 4×4mm 특수 코너 핀+EP; 핀 배치는 패밀리 다른 32-WQFN 부품(TAC5112/5312/5412-Q1)과 완전 비호환.',
        thermalPad: '노출 패드=VSS(Figure 4-1에 Thermal Pad (VSS) 표기, Table 4-1에 Thermal Pad 행), 보드 접지 플레인에 단락 필수; 패키지는 4개의 코너 핀(A1~A4, 모두 Ground)도 있으며, 이 24-Pin QFN with Exposed Thermal Pad and Corner Pins 특수 패키지 고유의 것으로 표준 24-QFN이 아님, datasheet Figure 4-1 참조.',
        specs: [
          { k: 'ADC 다이내믹 레인지', v: '차동 입력 100dB(Features 본문) / datasheet 제목은 101dB, datasheet에서 확인; THD+N −87dB' },
          { k: 'DAC 다이내믹 레인지', v: '차동 라인 출력 110dB / 차동 헤드폰 109dB; THD+N −101dB' },
          { k: '샘플링', v: 'ADC/DAC 모두 8kHz ~ 192kHz' },
          { k: '입력/출력', v: '차동 2VRMS / 싱글엔드 1VRMS; 헤드폰 16Ω를 62.5mW까지' },
          { k: '마이크 바이어스', v: '프로그래머블 3V~10V, 외부 HVDD 필요(내장 부스트 없음)' },
          { k: '오디오 인터페이스', v: 'TDM / I2S / 좌측 정렬(16/20/24/32-bit), controller/target 모드' },
          { k: '제어 인터페이스', v: 'I2C만(SPI 미지원)' },
          { k: '전원', v: 'AVDD 3.3V 전용 단일 전원; IOVDD 1.2V/1.8V/3.3V; HVDD 최대 12V' },
          { k: '차량', v: 'AEC-Q100 Grade 1(−40°C ~ +125°C)' },
          { k: '패키지', v: '24-Pin QFN (RGE) 4×4mm, 코너 핀 4개+EP=VSS, 비표준 레이아웃' }
        ]
      }
    },
    'TAC5312-Q1': {
      en: {
        subcategory: 'Automotive audio codec (stereo ADC + DAC, HV input/micbias + diagnostics)',
        whatIs: 'Automotive stereo audio codec: 10VRMS high-voltage differential input, 104dB-dynamic-range ADC + 2VRMS differential output, 114dB-dynamic-range DAC; a built-in boost converter generates the programmable high-voltage mic bias (3V~10V) with mic-input fault diagnostics, AEC-Q100 Grade 1 (−40~+125°C).',
        func: t53func.en, usedIn: t53used.en,
        desc: 'Automotive stereo audio codec: 10VRMS HV differential input 104dB ADC + 114dB DAC, built-in boost HV mic bias (3~10V) + input fault diagnostics, 4k~768kHz sampling, TDM/I2S/LJ, I2C/SPI control, AEC-Q100 Grade 1, 32-WQFN 5×5mm; its pinout matches the TAC5412-Q1 pin by pin (only the ADC/DAC dynamic-range grade differs), incompatible with TAC5112-Q1/TAC5301-Q1.',
        thermalPad: t53pad.en,
        specs: t53specs('en', '104dB (line/mic differential input); THD+N −97dB; channel-sum mode SNR 107dB', '114dB (differential line output); 107dB (single-ended headphone); THD+N −96dB'),
        dropIn: t53drop.en
      },
      ja: {
        subcategory: '車載オーディオコーデック（ステレオ ADC + DAC・高圧入力/micbias＋診断）',
        whatIs: '車載ステレオオーディオコーデック：10VRMS 高圧差動入力・104dB ダイナミックレンジ ADC + 2VRMS 差動出力・114dB ダイナミックレンジ DAC、内蔵ブーストコンバータで高圧プログラマブルマイクバイアス（3V~10V）を生成しマイク入力故障診断に対応、AEC-Q100 Grade 1（−40~+125°C）。',
        func: t53func.ja, usedIn: t53used.ja,
        desc: '車載ステレオオーディオコーデック：10VRMS 高圧差動入力 104dB ADC + 114dB DAC、内蔵ブースト高圧マイクバイアス（3~10V）＋入力故障診断、4k~768kHz サンプリング、TDM/I2S/LJ、I2C/SPI 制御、AEC-Q100 Grade 1、32-WQFN 5×5mm；pinout は TAC5412-Q1 と 1 ピンずつ完全一致（ADC/DAC ダイナミックレンジグレードのみ異なる）、TAC5112-Q1/TAC5301-Q1 とは非互換。',
        thermalPad: t53pad.ja,
        specs: t53specs('ja', '104dB（ライン/マイク差動入力）；THD+N −97dB；チャネル加算モード SNR 107dB', '114dB（差動ライン出力）；107dB（シングルエンドヘッドホン）；THD+N −96dB'),
        dropIn: t53drop.ja
      },
      ko: {
        subcategory: '차량용 오디오 코덱(스테레오 ADC + DAC·고압 입력/micbias+진단)',
        whatIs: '차량용 스테레오 오디오 코덱: 10VRMS 고압 차동 입력·104dB 다이내믹 레인지 ADC + 2VRMS 차동 출력·114dB 다이내믹 레인지 DAC, 내장 부스트 컨버터로 고압 프로그래머블 마이크 바이어스(3V~10V)를 생성하고 마이크 입력 고장 진단 지원, AEC-Q100 Grade 1(−40~+125°C).',
        func: t53func.ko, usedIn: t53used.ko,
        desc: '차량용 스테레오 오디오 코덱: 10VRMS 고압 차동 입력 104dB ADC + 114dB DAC, 내장 부스트 고압 마이크 바이어스(3~10V)+입력 고장 진단, 4k~768kHz 샘플링, TDM/I2S/LJ, I2C/SPI 제어, AEC-Q100 Grade 1, 32-WQFN 5×5mm; pinout은 TAC5412-Q1과 핀 단위로 완전 일치(ADC/DAC 다이내믹 레인지 등급만 다름), TAC5112-Q1/TAC5301-Q1과는 비호환.',
        thermalPad: t53pad.ko,
        specs: t53specs('ko', '104dB(라인/마이크 차동 입력); THD+N −97dB; 채널 합산 모드 SNR 107dB', '114dB(차동 라인 출력); 107dB(싱글엔드 헤드폰); THD+N −96dB'),
        dropIn: t53drop.ko
      }
    },
    'TAC5412-Q1': {
      en: {
        subcategory: 'Automotive audio codec (stereo ADC + DAC, HV input/micbias + diagnostics, premium grade)',
        whatIs: 'Automotive stereo audio codec (highest-performance grade of the family): 10VRMS high-voltage differential input, 112dB-dynamic-range ADC + 2VRMS differential output, 120dB-dynamic-range DAC; a built-in boost converter generates the programmable high-voltage mic bias (3V~10V) with mic-input fault diagnostics, AEC-Q100 Grade 1 (−40~+125°C).',
        func: t53func.en, usedIn: t53used.en,
        desc: 'Automotive stereo audio codec (family top grade): 10VRMS HV differential input 112dB ADC + 120dB DAC, built-in boost HV mic bias (3~10V) + input fault diagnostics, 4k~768kHz sampling, TDM/I2S/LJ, I2C/SPI control, AEC-Q100 Grade 1, 32-WQFN 5×5mm; its pinout matches the TAC5312-Q1 pin by pin (only the ADC/DAC dynamic-range grade differs, 5412 is higher), incompatible with TAC5112-Q1/TAC5301-Q1.',
        thermalPad: t53pad.en,
        specs: t53specs('en', '112dB (line/mic differential input); THD+N −99dB; channel-sum mode SNR 114dB', '120dB (differential line output); 111dB (single-ended headphone); THD+N −102dB'),
        dropIn: t53drop.en
      },
      ja: {
        subcategory: '車載オーディオコーデック（ステレオ ADC + DAC・高圧入力/micbias＋診断・上位グレード）',
        whatIs: '車載ステレオオーディオコーデック（ファミリ最高性能グレード）：10VRMS 高圧差動入力・112dB ダイナミックレンジ ADC + 2VRMS 差動出力・120dB ダイナミックレンジ DAC、内蔵ブーストコンバータで高圧プログラマブルマイクバイアス（3V~10V）を生成しマイク入力故障診断に対応、AEC-Q100 Grade 1（−40~+125°C）。',
        func: t53func.ja, usedIn: t53used.ja,
        desc: '車載ステレオオーディオコーデック（ファミリ最高性能）：10VRMS 高圧差動入力 112dB ADC + 120dB DAC、内蔵ブースト高圧マイクバイアス（3~10V）＋入力故障診断、4k~768kHz サンプリング、TDM/I2S/LJ、I2C/SPI 制御、AEC-Q100 Grade 1、32-WQFN 5×5mm；pinout は TAC5312-Q1 と 1 ピンずつ完全一致（ADC/DAC ダイナミックレンジグレードのみ異なり 5412 が上位）、TAC5112-Q1/TAC5301-Q1 とは非互換。',
        thermalPad: t53pad.ja,
        specs: t53specs('ja', '112dB（ライン/マイク差動入力）；THD+N −99dB；チャネル加算モード SNR 114dB', '120dB（差動ライン出力）；111dB（シングルエンドヘッドホン）；THD+N −102dB'),
        dropIn: t53drop.ja
      },
      ko: {
        subcategory: '차량용 오디오 코덱(스테레오 ADC + DAC·고압 입력/micbias+진단·프리미엄 등급)',
        whatIs: '차량용 스테레오 오디오 코덱(패밀리 최고 성능 등급): 10VRMS 고압 차동 입력·112dB 다이내믹 레인지 ADC + 2VRMS 차동 출력·120dB 다이내믹 레인지 DAC, 내장 부스트 컨버터로 고압 프로그래머블 마이크 바이어스(3V~10V)를 생성하고 마이크 입력 고장 진단 지원, AEC-Q100 Grade 1(−40~+125°C).',
        func: t53func.ko, usedIn: t53used.ko,
        desc: '차량용 스테레오 오디오 코덱(패밀리 최고 성능): 10VRMS 고압 차동 입력 112dB ADC + 120dB DAC, 내장 부스트 고압 마이크 바이어스(3~10V)+입력 고장 진단, 4k~768kHz 샘플링, TDM/I2S/LJ, I2C/SPI 제어, AEC-Q100 Grade 1, 32-WQFN 5×5mm; pinout은 TAC5312-Q1과 핀 단위로 완전 일치(ADC/DAC 다이내믹 레인지 등급만 다르며 5412가 상위), TAC5112-Q1/TAC5301-Q1과는 비호환.',
        thermalPad: t53pad.ko,
        specs: t53specs('ko', '112dB(라인/마이크 차동 입력); THD+N −99dB; 채널 합산 모드 SNR 114dB', '120dB(차동 라인 출력); 111dB(싱글엔드 헤드폰); THD+N −102dB'),
        dropIn: t53drop.ko
      }
    },
    'TAS2120': {
      en: {
        subcategory: 'Mono Class-D speaker amplifier (integrated Class-H boost)',
        whatIs: '8.2W mono digital-input Class-D audio amplifier with a built-in 14.75V Class-H boost (5.1A max current limit), efficiency-optimized for battery-powered systems, up to 91% efficiency (@1W, 8Ω load).',
        func: 'I2S/TDM serial audio interface (8 channels), HW-pin or I2C control; MCLK-free operation with automatic clock/sample-rate detection 16~192kHz; programmable battery current limit (39mA steps), boost sharing between two devices, external Class-H boost control algorithm; built-in Y-bridge for efficiency; precision supply-voltage monitoring and temperature sensing; over-temperature and over-current protection.',
        usedIn: 'Voice-assistant smart speakers, Bluetooth/wireless speakers, building automation, tablets/wearables, laptops/desktops and other battery-powered audio systems.',
        desc: '8.2W mono Class-D amplifier with integrated 14.75V Class-H boost, 114.4dB dynamic range, I2S/TDM 8ch, HW/I2C control, 26-QFN 0.4mm pitch 4×3.5mm.',
        thermalPad: 'see datasheet (the Pin Functions table under §4 lists only 26 numbered pins with no separate EP/Thermal Pad row; §5.4 Thermal Information marks the package HR-QFN 26 PINS but the table has no corresponding pin number as evidence).',
        specs: [
          { k: 'Output power', v: '8.2W (rms) @1% THD+N (RL=4Ω+33µH, VBAT=4.4V)' },
          { k: 'Class-H boost', v: '14.75V boost, 5.1A max current limit; 33mV adjustable steps' },
          { k: 'Efficiency', v: 'up to 91% (@1W, 8Ω load); integrated 1.8V VDD Y-bridge' },
          { k: 'Standby power', v: '14.7mW (noise gate off) / 5.3mW (noise gate on)' },
          { k: 'Audio performance', v: '114.4dB dynamic range; THD+N −90dB; idle-channel noise 4.2µV A-wt' },
          { k: 'Clocking', v: 'MCLK-free; automatic clock/sample-rate detection 16~192kHz' },
          { k: 'Audio interface', v: 'I2S/TDM, up to 8 channels' },
          { k: 'Control interface', v: 'HW-pin control or I2C' },
          { k: 'Supply', v: 'VBAT 2.5~5.5V; VBAT_SNS 2.5~10.0V; VDD 1.65~1.95V; IOVDD 1.8V or 3.3V' },
          { k: 'Package', v: '26-pin QFN, 0.4mm pitch, 4mm×3.5mm' }
        ]
      },
      ja: {
        subcategory: 'モノ Class-D スピーカアンプ（Class-H ブースト統合）',
        whatIs: '8.2W モノデジタル入力 Class-D オーディオアンプ、14.75V Class-H ブースト内蔵（最大電流制限 5.1A）、バッテリ駆動システム向けに効率最適化、最高 91% 効率（@1W、8Ω 負荷）。',
        func: 'I2S/TDM シリアルオーディオインタフェース（8 チャネル）、HW ピンまたは I2C 制御；MCLK フリー動作、自動クロック/サンプルレート検出 16~192kHz；プログラマブルバッテリ電流制限（39mA ステップ）、2 素子間ブースト共有、外部 Class-H ブースト制御アルゴリズム；Y ブリッジ内蔵で効率向上；高精度電源電圧監視と温度検出；過熱・過電流保護。',
        usedIn: '音声アシスタント搭載スマートスピーカ、Bluetooth/ワイヤレススピーカ、ビル自動化システム、タブレット/ウェアラブル、ノート/デスクトップ PC 等のバッテリ駆動オーディオシステム。',
        desc: '8.2W モノ Class-D アンプ、14.75V Class-H ブースト統合、114.4dB ダイナミックレンジ、I2S/TDM 8ch、HW/I2C 制御、26-QFN 0.4mm pitch 4×3.5mm。',
        thermalPad: 'datasheet 参照（§4 Pin Functions 表は 26 個の番号付きピンのみで独立 EP/Thermal Pad 列なし；§5.4 Thermal Information はパッケージを HR-QFN 26 PINS と表記するが表に対応ピン番号の裏付けなし）。',
        specs: [
          { k: '出力電力', v: '8.2W（rms）@1% THD+N（RL=4Ω+33µH、VBAT=4.4V）' },
          { k: 'Class-H ブースト', v: '14.75V ブースト、最大電流制限 5.1A；33mV ステップ可変' },
          { k: '効率', v: '最高 91%（@1W、8Ω 負荷）；1.8V VDD Y ブリッジ統合' },
          { k: '待機電力', v: '14.7mW（noise gate off）／5.3mW（noise gate on）' },
          { k: 'オーディオ性能', v: '114.4dB ダイナミックレンジ；THD+N −90dB；アイドルチャネル雑音 4.2µV A-wt' },
          { k: 'クロック', v: 'MCLK フリー動作；自動クロック/サンプルレート検出 16~192kHz' },
          { k: 'オーディオインタフェース', v: 'I2S/TDM、最大 8 チャネル' },
          { k: '制御インタフェース', v: 'HW ピン制御または I2C' },
          { k: '電源', v: 'VBAT 2.5~5.5V；VBAT_SNS 2.5~10.0V；VDD 1.65~1.95V；IOVDD 1.8V または 3.3V' },
          { k: 'パッケージ', v: '26-pin QFN、0.4mm pitch、4mm×3.5mm' }
        ]
      },
      ko: {
        subcategory: '모노 Class-D 스피커 앰프(Class-H 부스트 통합)',
        whatIs: '8.2W 모노 디지털 입력 Class-D 오디오 앰프, 14.75V Class-H 부스트 내장(최대 전류 제한 5.1A), 배터리 구동 시스템용 효율 최적화, 최고 91% 효율(@1W, 8Ω 부하).',
        func: 'I2S/TDM 시리얼 오디오 인터페이스(8채널), HW 핀 또는 I2C 제어; MCLK 프리 동작, 자동 클록/샘플레이트 감지 16~192kHz; 프로그래머블 배터리 전류 제한(39mA 스텝), 2소자 간 부스트 공유, 외부 Class-H 부스트 제어 알고리즘; Y 브리지 내장으로 효율 향상; 고정밀 전원 전압 감시와 온도 감지; 과열·과전류 보호.',
        usedIn: '음성 비서 스마트 스피커, 블루투스/무선 스피커, 빌딩 자동화 시스템, 태블릿/웨어러블, 노트북/데스크톱 등 배터리 구동 오디오 시스템.',
        desc: '8.2W 모노 Class-D 앰프, 14.75V Class-H 부스트 통합, 114.4dB 다이내믹 레인지, I2S/TDM 8ch, HW/I2C 제어, 26-QFN 0.4mm pitch 4×3.5mm.',
        thermalPad: 'datasheet 참조(§4 Pin Functions 표는 26개 번호 핀만 있고 독립 EP/Thermal Pad 행 없음; §5.4 Thermal Information은 패키지를 HR-QFN 26 PINS로 표기하나 표에 대응 핀 번호 근거 없음).',
        specs: [
          { k: '출력 전력', v: '8.2W(rms) @1% THD+N(RL=4Ω+33µH, VBAT=4.4V)' },
          { k: 'Class-H 부스트', v: '14.75V 부스트, 최대 전류 제한 5.1A; 33mV 스텝 가변' },
          { k: '효율', v: '최고 91%(@1W, 8Ω 부하); 1.8V VDD Y 브리지 통합' },
          { k: '대기 전력', v: '14.7mW(noise gate off) / 5.3mW(noise gate on)' },
          { k: '오디오 성능', v: '114.4dB 다이내믹 레인지; THD+N −90dB; 아이들 채널 잡음 4.2µV A-wt' },
          { k: '클록', v: 'MCLK 프리 동작; 자동 클록/샘플레이트 감지 16~192kHz' },
          { k: '오디오 인터페이스', v: 'I2S/TDM, 최대 8채널' },
          { k: '제어 인터페이스', v: 'HW 핀 제어 또는 I2C' },
          { k: '전원', v: 'VBAT 2.5~5.5V; VBAT_SNS 2.5~10.0V; VDD 1.65~1.95V; IOVDD 1.8V 또는 3.3V' },
          { k: '패키지', v: '26-pin QFN, 0.4mm pitch, 4mm×3.5mm' }
        ]
      }
    },
    'TAS5830': {
      en: {
        subcategory: 'Stereo closed-loop Class-D speaker amplifier (integrated audio processor + Class-H tracking)',
        whatIs: '65W stereo digital-input high-efficiency closed-loop Class-D amplifier, integrating an audio DSP with up to 192kHz audio support and a Class-H audio-envelope-tracking algorithm that outputs a PWM signal via GPIO to control an external DC-DC converter for system efficiency.',
        func: 'Supports multiple output configurations: BTL 2×80W (4Ω,26V,10%THD+N) / 2×65W (4Ω,26V,1%) / 2×74W (6Ω,30V,10%) / 2×63W (6Ω,30V,1%); PBTL mono 1×151W (3Ω,30V,10%) / 1×131W (3Ω,30V,1%). Audio I/O: I2S/LJ/RJ/TDM (4~16ch) input, 32/44.1/48/88.2/96/192kHz sample rates, SDOUT for monitoring/sub-channel/echo cancellation, 3-wire digital audio interface (MCLK-free). DSP: 3-band advanced DRC + 2EQ + AGL + 2EQ, 15 BQs/channel, level meter, mixer/volume/dynamic EQ/output crossbar, rattle suppression, frequency limiter. Protection: OCE, cycle-by-cycle current limit (4 selectable levels), OTW/OTE, UVLO/OVLO, PVDD droop detection. Control: I2C (Fast and Fast Plus) or hardware-pin mode.',
        usedIn: 'Battery-powered speakers, Bluetooth wireless speakers, soundbars and subwoofers, smart speakers and other mid-to-high-power stereo audio systems.',
        desc: '65W stereo closed-loop Class-D amplifier, Class-H tracking algorithm, SNR≥110dB, I2S/LJ/RJ/TDM 192kHz, I2C(Fast+)/HW-mode control, 32-TSSOP (DAD) 11×6.2mm PowerPAD.',
        thermalPad: 'PowerPAD™ (last row of Table 4-1: PowerPAD™ / P / Ground, connect to grounded heat sink for best system performance), must connect to a grounded heat sink.',
        specs: [
          { k: 'Output configurations', v: 'BTL 2×80W(4Ω,26V,10%THD+N) / 2×65W(4Ω,26V,1%) / 2×74W(6Ω,30V,10%) / 2×63W(6Ω,30V,1%); PBTL 1×151W(3Ω,30V,10%) / 1×131W(3Ω,30V,1%)' },
          { k: 'Efficiency', v: '>90% power efficiency, 70mΩ RDSon' },
          { k: 'Audio performance', v: 'THD+N ≤0.03% (@1W,1kHz,PVDD=12V); SNR ≥110dB (A-weighted); ICN ≤40µVrms' },
          { k: 'Audio interface', v: 'I2S/LJ/RJ, 4~16 channel TDM; 32/44.1/48/88.2/96/192kHz; 3-wire MCLK-free' },
          { k: 'DSP', v: '3-Band DRC + 2EQ + AGL + 2EQ; 15 BQ/channel; level meter; 96/192kHz processing' },
          { k: 'Protection', v: 'OCE; cycle-by-cycle current limit 4 levels; OTW/OTE; UVLO/OVLO; PVDD droop detection' },
          { k: 'Control interface', v: 'I2C (Fast and Fast Plus) or hardware-pin mode' },
          { k: 'Supply', v: 'PVDD 4.5V~30V; DVDD and IO 1.8V or 3.3V' },
          { k: 'Package', v: '32-TSSOP (DAD) 11.00mm×6.20mm, PowerPAD thermal' }
        ]
      },
      ja: {
        subcategory: 'ステレオ閉ループ Class-D スピーカアンプ（オーディオプロセッサ＋Class-H トラッキング統合）',
        whatIs: '65W ステレオデジタル入力高効率閉ループ Class-D アンプ、最高 192kHz オーディオ対応のオーディオ DSP を統合、Class-H オーディオ包絡トラッキングアルゴリズムで GPIO から PWM 信号を出力し外部 DC-DC コンバータを制御しシステム効率を向上。',
        func: '多様な出力構成に対応：BTL 2×80W(4Ω,26V,10%THD+N)／2×65W(4Ω,26V,1%)／2×74W(6Ω,30V,10%)／2×63W(6Ω,30V,1%)；PBTL モノ 1×151W(3Ω,30V,10%)／1×131W(3Ω,30V,1%)。オーディオ I/O：I2S/LJ/RJ/TDM（4~16ch）入力、32/44.1/48/88.2/96/192kHz サンプルレート、SDOUT はモニタ/サブチャネル/エコーキャンセル用、3 線デジタルオーディオインタフェース（MCLK フリー）。DSP：3 バンド先進 DRC + 2EQ + AGL + 2EQ、15 BQ/チャネル、レベルメータ、Mixer/ボリューム/ダイナミック EQ/出力クロスバー、Rattle suppression、周波数リミッタ。保護：OCE、サイクル毎電流制限（4 段選択）、OTW/OTE、UVLO/OVLO、PVDD 電圧ドループ検出。制御：I2C（Fast と Fast Plus 対応）またはハードウェアピンモード。',
        usedIn: 'バッテリ駆動スピーカ、Bluetooth ワイヤレススピーカ、サウンドバーとサブウーファ、スマートスピーカ等の中大電力ステレオオーディオシステム。',
        desc: '65W ステレオ閉ループ Class-D アンプ、Class-H トラッキングアルゴリズム、SNR≥110dB、I2S/LJ/RJ/TDM 192kHz、I2C(Fast+)/HW モード制御、32-TSSOP(DAD) 11×6.2mm PowerPAD。',
        thermalPad: 'PowerPAD™（Table 4-1 末行：PowerPAD™／P／Ground, connect to grounded heat sink for best system performance）、接地ヒートシンクに接続必須。',
        specs: [
          { k: '出力構成', v: 'BTL 2×80W(4Ω,26V,10%THD+N)／2×65W(4Ω,26V,1%)／2×74W(6Ω,30V,10%)／2×63W(6Ω,30V,1%)；PBTL 1×151W(3Ω,30V,10%)／1×131W(3Ω,30V,1%)' },
          { k: '効率', v: '>90% power efficiency、70mΩ RDSon' },
          { k: 'オーディオ性能', v: 'THD+N ≤0.03%（@1W,1kHz,PVDD=12V）；SNR ≥110dB（A-weighted）；ICN ≤40µVrms' },
          { k: 'オーディオインタフェース', v: 'I2S/LJ/RJ、4~16 チャネル TDM；32/44.1/48/88.2/96/192kHz；3 線 MCLK フリー' },
          { k: 'DSP', v: '3-Band DRC + 2EQ + AGL + 2EQ；15 BQ/channel；レベルメータ；96/192kHz 処理' },
          { k: '保護', v: 'OCE；サイクル毎電流制限 4 段選択；OTW/OTE；UVLO/OVLO；PVDD 電圧ドループ検出' },
          { k: '制御インタフェース', v: 'I2C（Fast と Fast Plus）またはハードウェアピンモード' },
          { k: '電源', v: 'PVDD 4.5V~30V；DVDD と IO 1.8V または 3.3V' },
          { k: 'パッケージ', v: '32-TSSOP (DAD) 11.00mm×6.20mm、PowerPAD 放熱' }
        ]
      },
      ko: {
        subcategory: '스테레오 폐루프 Class-D 스피커 앰프(오디오 프로세서+Class-H 추적 통합)',
        whatIs: '65W 스테레오 디지털 입력 고효율 폐루프 Class-D 앰프, 최고 192kHz 오디오 지원 오디오 DSP를 통합, Class-H 오디오 포락선 추적 알고리즘으로 GPIO에서 PWM 신호를 출력해 외부 DC-DC 컨버터를 제어하고 시스템 효율 향상.',
        func: '다양한 출력 구성 지원: BTL 2×80W(4Ω,26V,10%THD+N) / 2×65W(4Ω,26V,1%) / 2×74W(6Ω,30V,10%) / 2×63W(6Ω,30V,1%); PBTL 모노 1×151W(3Ω,30V,10%) / 1×131W(3Ω,30V,1%). 오디오 I/O: I2S/LJ/RJ/TDM(4~16ch) 입력, 32/44.1/48/88.2/96/192kHz 샘플레이트, SDOUT은 모니터/서브채널/에코 제거용, 3선 디지털 오디오 인터페이스(MCLK 프리). DSP: 3밴드 고급 DRC + 2EQ + AGL + 2EQ, 15 BQ/채널, 레벨 미터, 믹서/볼륨/다이내믹 EQ/출력 크로스바, Rattle suppression, 주파수 리미터. 보호: OCE, 사이클별 전류 제한(4단 선택), OTW/OTE, UVLO/OVLO, PVDD 전압 드룹 감지. 제어: I2C(Fast와 Fast Plus) 또는 하드웨어 핀 모드.',
        usedIn: '배터리 구동 스피커, 블루투스 무선 스피커, 사운드바와 서브우퍼, 스마트 스피커 등 중대 전력 스테레오 오디오 시스템.',
        desc: '65W 스테레오 폐루프 Class-D 앰프, Class-H 추적 알고리즘, SNR≥110dB, I2S/LJ/RJ/TDM 192kHz, I2C(Fast+)/HW 모드 제어, 32-TSSOP(DAD) 11×6.2mm PowerPAD.',
        thermalPad: 'PowerPAD™(Table 4-1 마지막 행: PowerPAD™ / P / Ground, connect to grounded heat sink for best system performance), 접지 히트싱크에 연결 필수.',
        specs: [
          { k: '출력 구성', v: 'BTL 2×80W(4Ω,26V,10%THD+N) / 2×65W(4Ω,26V,1%) / 2×74W(6Ω,30V,10%) / 2×63W(6Ω,30V,1%); PBTL 1×151W(3Ω,30V,10%) / 1×131W(3Ω,30V,1%)' },
          { k: '효율', v: '>90% power efficiency, 70mΩ RDSon' },
          { k: '오디오 성능', v: 'THD+N ≤0.03%(@1W,1kHz,PVDD=12V); SNR ≥110dB(A-weighted); ICN ≤40µVrms' },
          { k: '오디오 인터페이스', v: 'I2S/LJ/RJ, 4~16채널 TDM; 32/44.1/48/88.2/96/192kHz; 3선 MCLK 프리' },
          { k: 'DSP', v: '3-Band DRC + 2EQ + AGL + 2EQ; 15 BQ/채널; 레벨 미터; 96/192kHz 처리' },
          { k: '보호', v: 'OCE; 사이클별 전류 제한 4단 선택; OTW/OTE; UVLO/OVLO; PVDD 전압 드룹 감지' },
          { k: '제어 인터페이스', v: 'I2C(Fast와 Fast Plus) 또는 하드웨어 핀 모드' },
          { k: '전원', v: 'PVDD 4.5V~30V; DVDD와 IO 1.8V 또는 3.3V' },
          { k: '패키지', v: '32-TSSOP (DAD) 11.00mm×6.20mm, PowerPAD 방열' }
        ]
      }
    },
    'LMK3H2108': {
      en: {
        subcategory: 'PCIe BAW universal clock generator (8 outputs, built-in BAW, no external XTAL)',
        whatIs: 'Low-jitter universal clock generator with an integrated BAW resonator — no external XTAL/XO needed; up to 8 differential outputs (or up to 16 LVCMOS), 3 clock inputs all bypassable to any output group, supporting PCIe Gen1~Gen7.',
        func: 'Two FODs (Fractional Output Dividers) give frequency flexibility, low power and low jitter; output formats selectable among 1.2/1.8/2.5/3.3V LVCMOS, DC/AC-coupled LVDS, adjustable-swing LP-HCSL (derivable to LVPECL/CML, etc.); programmable SSC — down-spread −0.05%~−3%, center-spread ±0.025%~±1.5%, or 4 preset down-spread values (−0.1/−0.25/−0.3/−0.5%); GPI/GPIO pins configurable as per-output OE, group OE, I2C address select, OTP page select, PWRGD/PWRDN#, status output, etc.; OTP one-time-programmable non-volatile memory with factory pre-programming; 5ms max startup; fail-safe input pins may be pulled high while the device is unpowered.',
        usedIn: 'PCIe Gen1~7 clock generation for HPC server motherboards, NIC/SmartNICs, hardware accelerator cards, plus general-purpose clock generation and XO/XTAL replacement.',
        desc: '8-output PCIe Gen1~7 BAW clock generator, no external XTAL, Gen5 CC+SSC jitter 61fs max, 3 inputs bypassable to any output, 40-QFN 5×5mm.',
        thermalPad: 'DAP (Die Attach Pad, Table 4-2 pin 41: DAP / G / Connect to ground), must be grounded.',
        specs: [
          { k: 'Topology', v: '3 inputs (bypassable to any output) → up to 8 differential outputs or 16 LVCMOS' },
          { k: 'Output frequency', v: 'up to 400MHz' },
          { k: 'Output formats', v: '1.2/1.8/2.5/3.3V LVCMOS; DC/AC-coupled LVDS; adjustable-swing LP-HCSL (derivable to LVPECL/CML)' },
          { k: 'PCIe support', v: 'Gen 1 ~ Gen 7' },
          { k: 'Jitter (CC+SSC)', v: 'PCIe Gen5 61fs max / Gen6 36.4fs max / Gen7 25.5fs max' },
          { k: 'SSC', v: 'programmable down-spread −0.05%~−3%, center-spread ±0.025%~±1.5%, or preset −0.1/−0.25/−0.3/−0.5% down-spread' },
          { k: 'Startup time', v: '5ms max' },
          { k: 'Supply', v: 'each VDD/VDDO pin independently 1.8V / 2.5V / 3.3V' },
          { k: 'Temperature', v: '−40°C ~ 105°C' },
          { k: 'Package', v: '40-pin QFN (RKP0040A) 5.0mm×5.0mm (LMK3H2108; the 4-output LMK3H2104 is 24-QFN 4×4mm, different pinout)' }
        ]
      },
      ja: {
        subcategory: 'PCIe BAW 汎用クロックジェネレータ（8 出力・BAW 内蔵・外部 XTAL 不要）',
        whatIs: 'BAW 共振器統合の低ジッタ汎用クロックジェネレータで外部 XTAL/XO 不要；最大 8 系統差動出力（または最大 16 系統 LVCMOS）、3 系統クロック入力はいずれも任意の出力グループへバイパス可、PCIe Gen1~Gen7 対応。',
        func: '2 組の FOD（Fractional Output Divider）が周波数柔軟性・低消費電力・低ジッタを提供；出力形式は 1.2/1.8/2.5/3.3V LVCMOS、DC/AC 結合 LVDS、可変振幅 LP-HCSL（LVPECL/CML 等に派生可）から選択；プログラマブル SSC——ダウンスプレッド −0.05%~−3%、センタースプレッド ±0.025%~±1.5%、または 4 組プリセットダウンスプレッド値（−0.1/−0.25/−0.3/−0.5%）；GPI/GPIO ピンは個別 OE、グループ OE、I2C アドレス選択、OTP ページ選択、PWRGD/PWRDN#、状態出力等に設定可；OTP 一次性プログラマブル不揮発メモリで工場プリプログラム可；起動時間 5ms max；fail-safe 入力ピンは素子非通電時もプルアップ可。',
        usedIn: 'HPC サーバマザーボード、NIC/SmartNIC、ハードウェアアクセラレータカード等の PCIe Gen1~7 クロック生成、汎用クロック生成と XO/XTAL 置換。',
        desc: '8 出力 PCIe Gen1~7 BAW クロックジェネレータ、外部 XTAL 不要、Gen5 CC+SSC ジッタ 61fs max、3 入力を任意出力へバイパス可、40-QFN 5×5mm。',
        thermalPad: 'DAP（Die Attach Pad、Table 4-2 pin 41：DAP／G／Connect to ground）、接地必須。',
        specs: [
          { k: 'トポロジ', v: '3 系統入力（任意出力へバイパス可）→最大 8 系統差動出力または 16 系統 LVCMOS' },
          { k: '出力周波数', v: '最高 400MHz' },
          { k: '出力形式', v: '1.2/1.8/2.5/3.3V LVCMOS；DC/AC 結合 LVDS；可変振幅 LP-HCSL（LVPECL/CML 派生可）' },
          { k: 'PCIe 対応', v: 'Gen 1 ~ Gen 7' },
          { k: 'ジッタ（CC+SSC）', v: 'PCIe Gen5 61fs max／Gen6 36.4fs max／Gen7 25.5fs max' },
          { k: 'SSC', v: 'プログラマブルダウンスプレッド −0.05%~−3%、センタースプレッド ±0.025%~±1.5%、またはプリセット −0.1/−0.25/−0.3/−0.5%' },
          { k: '起動時間', v: '5ms max' },
          { k: '電源', v: '各 VDD/VDDO ピンを独立に 1.8V／2.5V／3.3V 設定可' },
          { k: '温度', v: '−40°C ~ 105°C' },
          { k: 'パッケージ', v: '40-pin QFN (RKP0040A) 5.0mm×5.0mm（LMK3H2108；4 出力版 LMK3H2104 は 24-QFN 4×4mm、非同一ピン配置）' }
        ]
      },
      ko: {
        subcategory: 'PCIe BAW 범용 클록 발생기(8출력·BAW 내장·외부 XTAL 불필요)',
        whatIs: 'BAW 공진기 통합 저지터 범용 클록 발생기로 외부 XTAL/XO 불필요; 최대 8계통 차동 출력(또는 최대 16계통 LVCMOS), 3계통 클록 입력 모두 임의 출력 그룹으로 바이패스 가능, PCIe Gen1~Gen7 지원.',
        func: '2조의 FOD(Fractional Output Divider)가 주파수 유연성·저전력·저지터 제공; 출력 형식은 1.2/1.8/2.5/3.3V LVCMOS, DC/AC 결합 LVDS, 가변 진폭 LP-HCSL(LVPECL/CML 등 파생 가능)에서 선택; 프로그래머블 SSC - 다운 스프레드 −0.05%~−3%, 센터 스프레드 ±0.025%~±1.5%, 또는 4조 프리셋 다운 스프레드 값(−0.1/−0.25/−0.3/−0.5%); GPI/GPIO 핀은 개별 OE, 그룹 OE, I2C 주소 선택, OTP 페이지 선택, PWRGD/PWRDN#, 상태 출력 등으로 설정 가능; OTP 일회성 프로그래머블 비휘발성 메모리로 공장 사전 프로그램 가능; 시동 시간 5ms max; fail-safe 입력 핀은 소자 비통전 시에도 풀업 가능.',
        usedIn: 'HPC 서버 메인보드, NIC/SmartNIC, 하드웨어 가속 카드 등의 PCIe Gen1~7 클록 생성, 범용 클록 생성과 XO/XTAL 대체.',
        desc: '8출력 PCIe Gen1~7 BAW 클록 발생기, 외부 XTAL 불필요, Gen5 CC+SSC 지터 61fs max, 3입력을 임의 출력으로 바이패스 가능, 40-QFN 5×5mm.',
        thermalPad: 'DAP(Die Attach Pad, Table 4-2 pin 41: DAP / G / Connect to ground), 접지 필수.',
        specs: [
          { k: '토폴로지', v: '3계통 입력(임의 출력으로 바이패스 가능) → 최대 8계통 차동 출력 또는 16계통 LVCMOS' },
          { k: '출력 주파수', v: '최고 400MHz' },
          { k: '출력 형식', v: '1.2/1.8/2.5/3.3V LVCMOS; DC/AC 결합 LVDS; 가변 진폭 LP-HCSL(LVPECL/CML 파생 가능)' },
          { k: 'PCIe 지원', v: 'Gen 1 ~ Gen 7' },
          { k: '지터(CC+SSC)', v: 'PCIe Gen5 61fs max / Gen6 36.4fs max / Gen7 25.5fs max' },
          { k: 'SSC', v: '프로그래머블 다운 스프레드 −0.05%~−3%, 센터 스프레드 ±0.025%~±1.5%, 또는 프리셋 −0.1/−0.25/−0.3/−0.5%' },
          { k: '시동 시간', v: '5ms max' },
          { k: '전원', v: '각 VDD/VDDO 핀을 독립적으로 1.8V / 2.5V / 3.3V 설정 가능' },
          { k: '온도', v: '−40°C ~ 105°C' },
          { k: '패키지', v: '40-pin QFN (RKP0040A) 5.0mm×5.0mm(LMK3H2108; 4출력판 LMK3H2104는 24-QFN 4×4mm, 다른 핀 배치)' }
        ]
      }
    },
    'LMKDB1208': {
      en: {
        subcategory: 'PCIe LP-HCSL clock multiplexer (2 inputs, 8 outputs)',
        whatIs: 'Ultra-low-additive-jitter LP-HCSL clock multiplexer: switches 2 differential inputs onto 8 LP-HCSL differential outputs, supporting PCIe Gen1~Gen7 (both CC and IR architectures), DB2000QL-compliant, for dual-clock-source redundancy switching.',
        func: 'Per-output {OE}# enables (with internal pull-ups); an SBI (Side-Band Interface) can rapidly switch 4 output-enable pins ({OE3}/SBI_CLK, {OE4}/SBI_IN, {OE6}/{SHFT_LD}, {OE7}/SBI_OUT — function set by SBI_EN); an SMBus interface (SADR0/SADR1 three-level addressing) provides register control; {LOS} open-drain output indicates input-clock loss; output impedance 85Ω/100Ω selectable via ZOUT_SEL; flexible power-up sequencing, automatic output disable, fail-safe inputs.',
        usedIn: 'Dual-source switching and fanout of PCIe clock trees in high-performance computing, server motherboards, NIC/SmartNICs and hardware accelerator cards.',
        desc: 'PCIe Gen1~7 LP-HCSL 2:8 clock multiplexer, additive jitter 5fs (Gen5) / 2.1fs (Gen7) max, SBI + SMBus control, 1.8V/3.3V supply, 48-VQFN 6×6mm.',
        thermalPad: 'Thermal Pad (GND) (last row of Table 5-1: Thermal Pad (GND) / Pad / G / Device Ground, Thermal pad.), must connect to the board ground plane.',
        specs: [
          { k: 'Topology', v: '2 differential inputs → 8 LP-HCSL differential outputs (per Table 4-1 Device Comparison: LMKDB1208 = Mux, 2 input, 8 output, 85Ω or 100Ω selectable)' },
          { k: 'PCIe support', v: 'Gen 1 ~ Gen 7 (CC/IR architectures, with/without SSC input); DB2000QL-compliant' },
          { k: 'Additive jitter', v: '31fs max (12kHz-20MHz RMS @156.25MHz); PCIe Gen4 13fs / Gen5 5fs / Gen6 3fs / Gen7 2.1fs max' },
          { k: 'Control', v: 'per-output {OE}# + SBI fast switching + SMBus (three-level address ×2)' },
          { k: 'Output impedance', v: '85Ω or 100Ω (ZOUT_SEL)' },
          { k: 'Supply', v: '1.8V / 3.3V ±10%' },
          { k: 'Temperature', v: '−40°C ~ 105°C' },
          { k: 'Package', v: '48-pin VQFN (RSL) 6mm×6mm' }
        ]
      },
      ja: {
        subcategory: 'PCIe LP-HCSL クロックマルチプレクサ（2 入力 8 出力）',
        whatIs: '極低付加ジッタ LP-HCSL クロックマルチプレクサ：2 系統差動入力を 8 系統 LP-HCSL 差動出力へ切替、PCIe Gen1~Gen7（CC と IR アーキテクチャとも）対応、DB2000QL 規格準拠、デュアルクロック源の冗長切替に。',
        func: '系統毎 {OE}# イネーブル（内蔵プルアップ）；SBI（Side-Band Interface）で 4 組の出力イネーブルピンを高速切替（{OE3}/SBI_CLK、{OE4}/SBI_IN、{OE6}/{SHFT_LD}、{OE7}/SBI_OUT、機能は SBI_EN が決定）；SMBus インタフェース（SADR0/SADR1 三値アドレス）でレジスタ制御；{LOS} オープンドレイン出力で入力クロック喪失を指示；出力インピーダンス 85Ω/100Ω を ZOUT_SEL で選択；柔軟な電源投入順序、自動出力停止、fail-safe 入力。',
        usedIn: '高性能計算、サーバマザーボード、NIC/SmartNIC、ハードウェアアクセラレータカード等の PCIe クロックツリーのデュアルソース切替とファンアウト。',
        desc: 'PCIe Gen1~7 LP-HCSL 2:8 クロックマルチプレクサ、付加ジッタ 5fs（Gen5）/2.1fs（Gen7）max、SBI+SMBus 制御、1.8V/3.3V 供給、48-VQFN 6×6mm。',
        thermalPad: 'Thermal Pad (GND)（Table 5-1 末行：Thermal Pad (GND)／Pad／G／Device Ground, Thermal pad.）、基板接地プレーンに接続必須。',
        specs: [
          { k: 'トポロジ', v: '2 系統差動入力 → 8 系統 LP-HCSL 差動出力（Table 4-1 Device Comparison：LMKDB1208＝Mux、2 input、8 output、85Ω または 100Ω 選択可）' },
          { k: 'PCIe 対応', v: 'Gen 1 ~ Gen 7（CC/IR アーキテクチャ、SSC 入力有無とも可）；DB2000QL 準拠' },
          { k: '付加ジッタ', v: '31fs max（12kHz-20MHz RMS @156.25MHz）；PCIe Gen4 13fs／Gen5 5fs／Gen6 3fs／Gen7 2.1fs max' },
          { k: '制御', v: '系統毎 {OE}# ＋ SBI 高速切替 ＋ SMBus（三値アドレス×2）' },
          { k: '出力インピーダンス', v: '85Ω または 100Ω（ZOUT_SEL 選択）' },
          { k: '電源', v: '1.8V／3.3V ±10%' },
          { k: '温度', v: '−40°C ~ 105°C' },
          { k: 'パッケージ', v: '48-pin VQFN (RSL) 6mm×6mm' }
        ]
      },
      ko: {
        subcategory: 'PCIe LP-HCSL 클록 멀티플렉서(2입력 8출력)',
        whatIs: '극저 부가 지터 LP-HCSL 클록 멀티플렉서: 2계통 차동 입력을 8계통 LP-HCSL 차동 출력으로 전환, PCIe Gen1~Gen7(CC와 IR 아키텍처 모두) 지원, DB2000QL 규격 준거, 듀얼 클록 소스 이중화 전환용.',
        func: '계통별 {OE}# 인에이블(내장 풀업); SBI(Side-Band Interface)로 4조의 출력 인에이블 핀을 고속 전환({OE3}/SBI_CLK, {OE4}/SBI_IN, {OE6}/{SHFT_LD}, {OE7}/SBI_OUT, 기능은 SBI_EN이 결정); SMBus 인터페이스(SADR0/SADR1 3값 주소)로 레지스터 제어; {LOS} 오픈 드레인 출력으로 입력 클록 상실 지시; 출력 임피던스 85Ω/100Ω을 ZOUT_SEL로 선택; 유연한 전원 인가 순서, 자동 출력 정지, fail-safe 입력.',
        usedIn: '고성능 컴퓨팅, 서버 메인보드, NIC/SmartNIC, 하드웨어 가속 카드 등의 PCIe 클록 트리 듀얼 소스 전환과 팬아웃.',
        desc: 'PCIe Gen1~7 LP-HCSL 2:8 클록 멀티플렉서, 부가 지터 5fs(Gen5)/2.1fs(Gen7) max, SBI+SMBus 제어, 1.8V/3.3V 공급, 48-VQFN 6×6mm.',
        thermalPad: 'Thermal Pad (GND)(Table 5-1 마지막 행: Thermal Pad (GND) / Pad / G / Device Ground, Thermal pad.), 보드 접지 플레인에 연결 필수.',
        specs: [
          { k: '토폴로지', v: '2계통 차동 입력 → 8계통 LP-HCSL 차동 출력(Table 4-1 Device Comparison: LMKDB1208=Mux, 2 input, 8 output, 85Ω 또는 100Ω 선택 가능)' },
          { k: 'PCIe 지원', v: 'Gen 1 ~ Gen 7(CC/IR 아키텍처, SSC 입력 유무 모두 가능); DB2000QL 준거' },
          { k: '부가 지터', v: '31fs max(12kHz-20MHz RMS @156.25MHz); PCIe Gen4 13fs / Gen5 5fs / Gen6 3fs / Gen7 2.1fs max' },
          { k: '제어', v: '계통별 {OE}# + SBI 고속 전환 + SMBus(3값 주소×2)' },
          { k: '출력 임피던스', v: '85Ω 또는 100Ω(ZOUT_SEL 선택)' },
          { k: '전원', v: '1.8V / 3.3V ±10%' },
          { k: '온도', v: '−40°C ~ 105°C' },
          { k: '패키지', v: '48-pin VQFN (RSL) 6mm×6mm' }
        ]
      }
    },
    'LMX1205-EP': {
      en: {
        subcategory: 'JESD204B/C high-frequency low-noise clock buffer/multiplier/divider (4 outputs + SYSREF, enhanced reliability)',
        whatIs: 'Low-noise high-frequency JESD204B/C clock buffer/multiplier/divider, output 300MHz~12.8GHz, 4 high-frequency clock outputs each paired with a SYSREF output, with noiseless input/output delay adjustment — for precision data-converter clocking, test & measurement, and aerospace/defense high-reliability applications.',
        func: 'Shared divider 1(bypass)/2/3/4/5/6/7/8 and shared programmable multiplier ×2~×8; LOGICLKOUT has an independent divider bank (pre-div 1/2/4, post-div 1(bypass)~1023) plus a second logic-clock option (further 1/2/4/8 division); noiseless input delay up to 60ps (1.1ps resolution) and per-output delay up to 55ps (0.9ps resolution); SYSREF supports generator/repeater/repeater-retime modes with windowing, 508 delay steps at <2.5ps each @12.8GHz; 6 programmable output power levels; SPI control (SCK/SDI/{CS}/MUXOUT); SYNC synchronizes all dividers and multiple devices.',
        usedIn: 'Test & measurement (oscilloscopes, wireless testers, wideband digitizers); aerospace/defense (radar, EW, seeker front ends, munitions, phased-array/beamforming); data-converter clocking and clock-buffer distribution.',
        desc: '300MHz~12.8GHz JESD204B/C low-noise clock buffer/multiplier/divider, 4 outputs + SYSREF, noise floor −159dBc/Hz@6GHz, SPI control, 2.5V, −55~85°C enhanced-reliability grade, 40-VQFN 6×6mm.',
        thermalPad: 'DAP (Table 4-1: DAP / DAP / GND / Ground these pins.), must be grounded.',
        specs: [
          { k: 'Output frequency', v: '300MHz ~ 12.8GHz' },
          { k: 'Noise performance', v: 'noise floor −159dBc/Hz @6GHz output; additive jitter 36fs (DC~fCLK) / 10fs (100Hz~100MHz)' },
          { k: 'Divide/multiply', v: 'shared divide 1(bypass)/2~8; shared programmable multiply ×2~×8; independent LOGICLK divider bank' },
          { k: 'Delay adjust', v: 'input delay up to 60ps (1.1ps resolution); per-output delay up to 55ps (0.9ps resolution), all noiseless' },
          { k: 'SYSREF', v: '4 HF outputs each paired with SYSREF; 508 delay steps <2.5ps@12.8GHz; generator/repeater/repeater-retime modes' },
          { k: 'Control interface', v: 'SPI (SCK/SDI/{CS}/MUXOUT)' },
          { k: 'Supply', v: '2.5V' },
          { k: 'Temperature/reliability', v: '−55°C ~ 85°C; VID #V62/25648, Controlled Baseline, single assembly/test site, single fab, Extended Product Life Cycle, Product Traceability' },
          { k: 'Package', v: '40-pin VQFN (RHA) 6mm×6mm' }
        ]
      },
      ja: {
        subcategory: 'JESD204B/C 高周波低雑音クロック Buffer/逓倍/分周器（4 出力+SYSREF・高信頼グレード）',
        whatIs: '低雑音高周波 JESD204B/C クロック buffer/逓倍/分周器、出力周波数 300MHz~12.8GHz、4 組の高周波クロック出力に各々 SYSREF 出力をペア、noiseless 入力/出力遅延調整付——高精度データコンバータのクロック、テスト計測、航空宇宙防衛等の高信頼用途に好適。',
        func: '共用分周 1(bypass)/2/3/4/5/6/7/8、共用プログラマブル逓倍 ×2~×8；LOGICLKOUT は独立分周バンク（前置 1/2/4、後置 1(bypass)~1023）＋第 2 論理クロックオプション（さらに 1/2/4/8 分周可）；入力遅延 noiseless 可変最大 60ps（分解能 1.1ps）、各出力遅延最大 55ps（分解能 0.9ps）；SYSREF は generator/repeater/repeater-retime モードとウィンドウ機能に対応、508 段遅延ステップ・各 <2.5ps @12.8GHz；6 組プログラマブル出力パワーレベル；SPI 制御（SCK/SDI/{CS}/MUXOUT）；SYNC で全分周器と複数素子を同期可。',
        usedIn: 'オシロスコープ、無線機器テスタ、広帯域デジタイザ等のテスト計測；レーダ、電子戦、シーカ前端、弾薬、フェーズドアレイ/ビームフォーミング等の航空宇宙防衛用途；データコンバータのクロックとクロック buffer 分配。',
        desc: '300MHz~12.8GHz JESD204B/C 低雑音クロック buffer/逓倍/分周器、4 出力+SYSREF、雑音フロア −159dBc/Hz@6GHz、SPI 制御、2.5V、−55~85°C 高信頼グレード、40-VQFN 6×6mm。',
        thermalPad: 'DAP（Table 4-1：DAP／DAP／GND／Ground these pins.）、接地必須。',
        specs: [
          { k: '出力周波数', v: '300MHz ~ 12.8GHz' },
          { k: '雑音性能', v: '雑音フロア −159dBc/Hz @6GHz 出力；付加ジッタ 36fs（DC~fCLK）／10fs（100Hz~100MHz）' },
          { k: '分周/逓倍', v: '共用分周 1(bypass)/2~8；共用プログラマブル逓倍 ×2~×8；LOGICLK 独立分周バンク' },
          { k: '遅延調整', v: '入力遅延最大 60ps（1.1ps 分解能）；各出力遅延最大 55ps（0.9ps 分解能）、いずれも noiseless' },
          { k: 'SYSREF', v: '4 組高周波出力に各々 SYSREF ペア；508 段遅延ステップ <2.5ps@12.8GHz；generator/repeater/repeater-retime モード' },
          { k: '制御インタフェース', v: 'SPI（SCK/SDI/{CS}/MUXOUT）' },
          { k: '電源', v: '2.5V' },
          { k: '温度/信頼性', v: '−55°C ~ 85°C；VID #V62/25648、Controlled Baseline、単一組立/試験拠点、単一ファブ、Extended Product Life Cycle、Product Traceability' },
          { k: 'パッケージ', v: '40-pin VQFN (RHA) 6mm×6mm' }
        ]
      },
      ko: {
        subcategory: 'JESD204B/C 고주파 저잡음 클록 Buffer/체배/분주기(4출력+SYSREF·고신뢰 등급)',
        whatIs: '저잡음 고주파 JESD204B/C 클록 buffer/체배/분주기, 출력 주파수 300MHz~12.8GHz, 4조 고주파 클록 출력에 각각 SYSREF 출력을 페어, noiseless 입력/출력 지연 조정 포함 - 고정밀 데이터 컨버터 클록, 테스트 계측, 항공우주 방위 등 고신뢰 용도에 적합.',
        func: '공용 분주 1(bypass)/2/3/4/5/6/7/8, 공용 프로그래머블 체배 ×2~×8; LOGICLKOUT은 독립 분주 뱅크(전치 1/2/4, 후치 1(bypass)~1023)+제2 논리 클록 옵션(추가 1/2/4/8 분주 가능); 입력 지연 noiseless 가변 최대 60ps(분해능 1.1ps), 각 출력 지연 최대 55ps(분해능 0.9ps); SYSREF는 generator/repeater/repeater-retime 모드와 윈도우 기능 지원, 508단 지연 스텝·각 <2.5ps @12.8GHz; 6조 프로그래머블 출력 파워 레벨; SPI 제어(SCK/SDI/{CS}/MUXOUT); SYNC로 전체 분주기와 복수 소자 동기 가능.',
        usedIn: '오실로스코프, 무선 기기 테스터, 광대역 디지타이저 등 테스트 계측; 레이더, 전자전, 시커 전단, 탄약, 위상 배열/빔포밍 등 항공우주 방위 용도; 데이터 컨버터 클록과 클록 buffer 분배.',
        desc: '300MHz~12.8GHz JESD204B/C 저잡음 클록 buffer/체배/분주기, 4출력+SYSREF, 잡음 바닥 −159dBc/Hz@6GHz, SPI 제어, 2.5V, −55~85°C 고신뢰 등급, 40-VQFN 6×6mm.',
        thermalPad: 'DAP(Table 4-1: DAP / DAP / GND / Ground these pins.), 접지 필수.',
        specs: [
          { k: '출력 주파수', v: '300MHz ~ 12.8GHz' },
          { k: '잡음 성능', v: '잡음 바닥 −159dBc/Hz @6GHz 출력; 부가 지터 36fs(DC~fCLK) / 10fs(100Hz~100MHz)' },
          { k: '분주/체배', v: '공용 분주 1(bypass)/2~8; 공용 프로그래머블 체배 ×2~×8; LOGICLK 독립 분주 뱅크' },
          { k: '지연 조정', v: '입력 지연 최대 60ps(1.1ps 분해능); 각 출력 지연 최대 55ps(0.9ps 분해능), 모두 noiseless' },
          { k: 'SYSREF', v: '4조 고주파 출력에 각각 SYSREF 페어; 508단 지연 스텝 <2.5ps@12.8GHz; generator/repeater/repeater-retime 모드' },
          { k: '제어 인터페이스', v: 'SPI(SCK/SDI/{CS}/MUXOUT)' },
          { k: '전원', v: '2.5V' },
          { k: '온도/신뢰성', v: '−55°C ~ 85°C; VID #V62/25648, Controlled Baseline, 단일 조립/시험 거점, 단일 팹, Extended Product Life Cycle, Product Traceability' },
          { k: '패키지', v: '40-pin VQFN (RHA) 6mm×6mm' }
        ]
      }
    }
  };
  Object.assign(window.IC_I18N, T);
})();
/* batch 11B: entries 137-143 */
(function () {
  // MSPM0C1105-Q1 / MSPM0C1106-Q1 share everything except memory size
  var mcFunc = {
    en: 'Low-power modes: RUN 91µA/MHz (CoreMark), STANDBY 2µA (full SRAM/register retention), SHUTDOWN 68nA (I/O wake). Digital peripherals: 3-channel DMA, 7-channel event fabric, 5 timers with up to 18 PWM outputs all operable in STANDBY (one 16-bit advanced timer with deadband, up to 64MHz; one 16-bit general timer with 4 capture/compares; three 16-bit general timers with 2 capture/compares each), windowed watchdog (WWDT), independent watchdog (IWDT), RTC with alarm/calendar, BEEPER (1/2/4/8kHz square wave for an external buzzer). Comms: 3× UART (one supporting LIN, IrDA, DALI, smart card, Manchester), 2× I2C (SMBus/PMBus, STOP-mode wake, up to FM+ 1Mbps), 1× SPI (up to 16Mbps). Clocking: built-in 32MHz SYSOSC (−2.1%~1.6%), built-in 32kHz LFOSC (±3%), external 4MHz~32MHz HFXT, external 32kHz LFXT, external LF/HF digital clock inputs, digital clock output. Data integrity: CRC-16. I/O: up to 45 GPIOs, 2 of them 5V-tolerant open-drain. Development: 2-pin SWD.',
    ja: '低消費電力モード：RUN 91µA/MHz（CoreMark）、STANDBY 2µA（SRAM とレジスタ全保持）、SHUTDOWN 68nA（I/O ウェイク対応）。デジタル周辺：3 チャネル DMA、7 チャネルイベントファブリック、5 個のタイマで最大 18 系統 PWM 出力（すべて STANDBY 動作可；deadband 付 16-bit 先進タイマ 1 個・最高 64MHz、capture/compare 4 組付 16-bit 汎用タイマ 1 個、capture/compare 各 2 組の 16-bit 汎用タイマ 3 個）、ウィンドウウォッチドッグ（WWDT）、独立ウォッチドッグ（IWDT）、アラーム/カレンダー付 RTC、BEEPER（1/2/4/8kHz 方形波で外部ブザー駆動）。通信：3 組 UART（1 組は LIN・IrDA・DALI・smart card・Manchester 対応）、2 組 I2C（SMBus/PMBus、STOP モードウェイク、最高 FM+ 1Mbps）、1 組 SPI（最高 16Mbps）。クロック：内蔵 32MHz SYSOSC（−2.1%~1.6%）、内蔵 32kHz LFOSC（±3%）、外部 4MHz~32MHz HFXT、外部 32kHz LFXT、外部低/高周波デジタルクロック入力、デジタルクロック出力。データ完全性：CRC-16。I/O：最大 45 GPIO、うち 2 個は 5V 耐圧オープンドレイン。開発：2-pin SWD。',
    ko: '저전력 모드: RUN 91µA/MHz(CoreMark), STANDBY 2µA(SRAM·레지스터 전체 유지), SHUTDOWN 68nA(I/O 웨이크 지원). 디지털 주변: 3채널 DMA, 7채널 이벤트 패브릭, 5개 타이머로 최대 18계통 PWM 출력(모두 STANDBY 동작 가능; deadband 포함 16-bit 고급 타이머 1개·최고 64MHz, capture/compare 4조 포함 16-bit 범용 타이머 1개, capture/compare 각 2조의 16-bit 범용 타이머 3개), 윈도우 워치독(WWDT), 독립 워치독(IWDT), 알람/캘린더 포함 RTC, BEEPER(1/2/4/8kHz 구형파로 외부 부저 구동). 통신: 3조 UART(1조는 LIN·IrDA·DALI·smart card·Manchester 지원), 2조 I2C(SMBus/PMBus, STOP 모드 웨이크, 최고 FM+ 1Mbps), 1조 SPI(최고 16Mbps). 클록: 내장 32MHz SYSOSC(−2.1%~1.6%), 내장 32kHz LFOSC(±3%), 외부 4MHz~32MHz HFXT, 외부 32kHz LFXT, 외부 저/고주파 디지털 클록 입력, 디지털 클록 출력. 데이터 무결성: CRC-16. I/O: 최대 45 GPIO, 그중 2개는 5V 내압 오픈 드레인. 개발: 2-pin SWD.'
  };
  var mcUsed = {
    en: 'Automotive body electronics and lighting, gateways, steering-wheel systems, motor control, DC-AC inverters, interior lighting, door-handle modules, kick-to-open modules, occupant detection, seat-comfort modules.',
    ja: '車載ボディ電子と照明、車載ゲートウェイ、ステアリングホイールシステム、車載モータ制御、DC-AC インバータ、車内照明、ドアハンドルモジュール、Kick-to-open モジュール、乗員検知、シート快適モジュール等の車載用途。',
    ko: '차량 바디 전자와 조명, 차량 게이트웨이, 스티어링 휠 시스템, 차량 모터 제어, DC-AC 인버터, 실내 조명, 도어 핸들 모듈, Kick-to-open 모듈, 승객 감지, 시트 편의 모듈 등 차량 용도.'
  };
  var mcPad = {
    en: 'Exposed pad = VSS (datasheet Figure 6-1 48-pin RGZ marks the center Thermal Pad), must connect to the board ground plane.',
    ja: '露出パッド=VSS（datasheet 図 6-1 48-pin RGZ 中央に Thermal Pad 表記）、基板接地プレーンに接続必須。',
    ko: '노출 패드=VSS(datasheet 그림 6-1 48-pin RGZ 중앙에 Thermal Pad 표기), 보드 접지 플레인에 연결 필수.'
  };
  function mcSpecs(lang, mem) {
    return {
      en: [
        { k: 'Core', v: 'Arm 32-bit Cortex-M0+ with MPU, up to 32MHz' },
        { k: 'Automotive', v: 'AEC-Q100 Grade 1 (−40°C ~ 125°C)' },
        { k: 'Supply range', v: '1.62V ~ 3.6V' },
        { k: 'Memory', v: mem },
        { k: 'ADC', v: '12-bit, 1.6Msps, up to 27 external channels' },
        { k: 'Reference', v: 'configurable 1.4V or 2.5V internal shared VREF' },
        { k: 'Comparator', v: 'COMP with 8-bit reference DAC; integrated temperature sensor' },
        { k: 'Low power', v: 'RUN 91µA/MHz (CoreMark); STANDBY 2µA; SHUTDOWN 68nA (I/O wake)' },
        { k: 'Comms', v: '3×UART (one with LIN/IrDA/DALI/smart card/Manchester); 2×I2C (SMBus/PMBus, up to FM+ 1Mbps); 1×SPI (up to 16Mbps)' },
        { k: 'Clocking', v: 'built-in 32MHz SYSOSC (−2.1%~1.6%); built-in 32kHz LFOSC (±3%); external 4~32MHz HFXT; external 32kHz LFXT' },
        { k: 'I/O', v: 'up to 45 GPIOs, 2 of them 5V-tolerant open-drain' },
        { k: 'Package options', v: '48-pin LQFP (PT)/VQFN (RGZ); 32-pin VQFN (RHB); 28-pin VSSOP (DGS28); 24-pin VQFN (RGE); 20-pin WQFN (RUK)/VSSOP (DGS20)' },
        { k: 'Debug', v: '2-pin SWD' }
      ],
      ja: [
        { k: 'コア', v: 'Arm 32-bit Cortex-M0+、MPU 付、最高 32MHz' },
        { k: '車載', v: 'AEC-Q100 Grade 1（−40°C ~ 125°C）' },
        { k: '電源範囲', v: '1.62V ~ 3.6V' },
        { k: 'メモリ', v: mem },
        { k: 'ADC', v: '12-bit、1.6Msps、最大 27 外部チャネル' },
        { k: '基準電圧', v: '設定可能 1.4V または 2.5V 内部共用 VREF' },
        { k: 'コンパレータ', v: 'COMP、8-bit 基準 DAC 付；温度センサ統合' },
        { k: '低消費電力', v: 'RUN 91µA/MHz（CoreMark）；STANDBY 2µA；SHUTDOWN 68nA（I/O ウェイク）' },
        { k: '通信', v: '3×UART（1 組 LIN/IrDA/DALI/smart card/Manchester 対応）；2×I2C（SMBus/PMBus、最高 FM+ 1Mbps）；1×SPI（最高 16Mbps）' },
        { k: 'クロック', v: '内蔵 32MHz SYSOSC（−2.1%~1.6%）；内蔵 32kHz LFOSC（±3%）；外部 4~32MHz HFXT；外部 32kHz LFXT' },
        { k: 'I/O', v: '最大 45 GPIO、うち 2 個 5V 耐圧オープンドレイン' },
        { k: 'パッケージ選択肢', v: '48-pin LQFP (PT)／VQFN (RGZ)；32-pin VQFN (RHB)；28-pin VSSOP (DGS28)；24-pin VQFN (RGE)；20-pin WQFN (RUK)／VSSOP (DGS20)' },
        { k: 'デバッグ', v: '2-pin SWD' }
      ],
      ko: [
        { k: '코어', v: 'Arm 32-bit Cortex-M0+, MPU 포함, 최고 32MHz' },
        { k: '차량', v: 'AEC-Q100 Grade 1(−40°C ~ 125°C)' },
        { k: '전원 범위', v: '1.62V ~ 3.6V' },
        { k: '메모리', v: mem },
        { k: 'ADC', v: '12-bit, 1.6Msps, 최대 27 외부 채널' },
        { k: '기준 전압', v: '설정 가능 1.4V 또는 2.5V 내부 공용 VREF' },
        { k: '비교기', v: 'COMP, 8-bit 기준 DAC 포함; 온도 센서 통합' },
        { k: '저전력', v: 'RUN 91µA/MHz(CoreMark); STANDBY 2µA; SHUTDOWN 68nA(I/O 웨이크)' },
        { k: '통신', v: '3×UART(1조 LIN/IrDA/DALI/smart card/Manchester 지원); 2×I2C(SMBus/PMBus, 최고 FM+ 1Mbps); 1×SPI(최고 16Mbps)' },
        { k: '클록', v: '내장 32MHz SYSOSC(−2.1%~1.6%); 내장 32kHz LFOSC(±3%); 외부 4~32MHz HFXT; 외부 32kHz LFXT' },
        { k: 'I/O', v: '최대 45 GPIO, 그중 2개 5V 내압 오픈 드레인' },
        { k: '패키지 선택지', v: '48-pin LQFP (PT)/VQFN (RGZ); 32-pin VQFN (RHB); 28-pin VSSOP (DGS28); 24-pin VQFN (RGE); 20-pin WQFN (RUK)/VSSOP (DGS20)' },
        { k: '디버그', v: '2-pin SWD' }
      ]
    }[lang];
  }
  function mcWhat(lang, self, sib) {
    return {
      en: 'Automotive mixed-signal MCU: Arm 32-bit Cortex-M0+ core (with MPU, up to 32MHz), AEC-Q100 Grade 1 (−40°C~125°C), up to 64KB flash + 8KB SRAM, built-in 12-bit 1.6Msps ADC (up to 27 external channels), a comparator (COMP) with 8-bit reference DAC, integrated temperature sensor; package options include 48-pin LQFP (PT)/VQFN (RGZ), 32-pin VQFN (RHB), 28-pin VSSOP (DGS28), 24-pin VQFN (RGE), 20-pin WQFN (RUK)/VSSOP (DGS20). ' + self + ' = ' + sib + '.',
      ja: '車載混合信号 MCU：Arm 32-bit Cortex-M0+ コア（MPU 付、最高 32MHz）、AEC-Q100 Grade 1（−40°C~125°C）、最大 64KB flash＋8KB SRAM、12-bit 1.6Msps ADC（最大 27 外部チャネル）、8-bit 基準 DAC 付コンパレータ（COMP）、温度センサ統合；パッケージ選択肢は 48-pin LQFP (PT)／VQFN (RGZ)、32-pin VQFN (RHB)、28-pin VSSOP (DGS28)、24-pin VQFN (RGE)、20-pin WQFN (RUK)／VSSOP (DGS20)。' + self + '＝' + sib + '。',
      ko: '차량용 혼합 신호 MCU: Arm 32-bit Cortex-M0+ 코어(MPU 포함, 최고 32MHz), AEC-Q100 Grade 1(−40°C~125°C), 최대 64KB flash+8KB SRAM, 12-bit 1.6Msps ADC(최대 27 외부 채널), 8-bit 기준 DAC 포함 비교기(COMP), 온도 센서 통합; 패키지 선택지는 48-pin LQFP (PT)/VQFN (RGZ), 32-pin VQFN (RHB), 28-pin VSSOP (DGS28), 24-pin VQFN (RGE), 20-pin WQFN (RUK)/VSSOP (DGS20). ' + self + ' = ' + sib + '.'
    }[lang];
  }

  var T = {
    'LMX1404-EP': {
      en: {
        subcategory: 'JESD204B/C high-frequency low-noise clock buffer/multiplier/divider (4 outputs + SYSREF, pin-mode support, enhanced reliability)',
        whatIs: 'Low-noise high-frequency JESD204B/C clock buffer/multiplier/divider, output 300MHz~15GHz, supporting SPI-free pin-mode configuration, 4 high-frequency clock outputs each paired with a SYSREF output, −55°C~125°C enhanced-reliability grade — for data-converter clocking and aerospace/defense payloads.',
        func: 'Shared divider 1(buffer)/2/3/4/5/6/7/8 and shared programmable multiplier ×2/×3/×4; LOGICLKOUT has an independent divider bank (pre-div 1/2/4, post-div 1(bypass)~1023); in pin mode, pins like PWRSEL[2:0]/DIVSEL[2:0]/MUXSEL[1:0]/CLK0_EN~CLK3_EN/LOGIC_EN/SYSREF_EN configure output power levels, divide/multiply values, operating modes and per-channel enables without SPI; SPI control (SCK/SDI/{CS}/MUXOUT) is also supported; 8 programmable output power levels; SYSREF supports generator and repeater modes with windowing, 508 delay steps at <2.5ps each @12.8GHz; SYNC synchronizes all dividers and multiple devices; disabling SYSREF outputs lets it distribute multi-channel, low-skew, ultra-low-noise LO signals to multiple mixers.',
        usedIn: 'Radar imaging payloads, communication payloads, command and data handling, data-converter clocking, clock distribution/multiplication/division for aerospace/defense and precision measurement.',
        desc: '300MHz~15GHz JESD204B/C low-noise clock buffer/multiplier/divider with SPI-free pin mode, 4 outputs + SYSREF, noise floor −159dBc/Hz@6GHz, 2.5V, −55~125°C, 64-HTQFP 10×10mm.',
        thermalPad: 'DAP (Table 4-1: DAP / DAP / GND / Ground the pad.), must be grounded.',
        specs: [
          { k: 'Output frequency', v: '300MHz ~ 15GHz' },
          { k: 'Noise performance', v: 'noise floor −159dBc/Hz @6GHz output; additive jitter 36fs (100Hz~fCLK, @6GHz output) / 5fs (100Hz~100MHz)' },
          { k: 'Divide/multiply', v: 'shared divide 1(buffer)/2~8; shared programmable multiply ×2/×3/×4; independent LOGICLK divider bank' },
          { k: 'Config modes', v: 'pin mode (SPI-free, via PWRSEL/DIVSEL/MUXSEL/CLKx_EN pins) or SPI (SCK/SDI/{CS}/MUXOUT)' },
          { k: 'SYSREF', v: '4 HF outputs each paired with SYSREF; 508 delay steps <2.5ps@12.8GHz; generator/repeater modes' },
          { k: 'Output power levels', v: '8 programmable' },
          { k: 'Supply', v: '2.5V' },
          { k: 'Temperature/reliability', v: '−55°C ~ 125°C; VID #V62/24627, Controlled Baseline, single assembly/test site, single fab, Extended Product Life Cycle, Product Traceability' },
          { k: 'Package', v: '64-pin HTQFP (PAP0064E) 10mm×10mm' }
        ]
      },
      ja: {
        subcategory: 'JESD204B/C 高周波低雑音クロック Buffer/逓倍/分周器（4 出力+SYSREF・pin mode 対応・高信頼グレード）',
        whatIs: '低雑音高周波 JESD204B/C クロック buffer/逓倍/分周器、出力周波数 300MHz~15GHz、SPI 不要のピンモード（pin mode）設定対応、4 組の高周波クロック出力に各々 SYSREF 出力をペア、−55°C~125°C 高信頼グレード——データコンバータのクロックと航空宇宙防衛ペイロードに好適。',
        func: '共用分周 1(buffer)/2/3/4/5/6/7/8、共用プログラマブル逓倍 ×2/×3/×4；LOGICLKOUT は独立分周バンク（前置 1/2/4、後置 1(bypass)~1023）；pin mode では PWRSEL[2:0]/DIVSEL[2:0]/MUXSEL[1:0]/CLK0_EN~CLK3_EN/LOGIC_EN/SYSREF_EN 等のピンで出力パワーレベル・分周/逓倍値・動作モード・各チャネル ON/OFF を SPI なしで直接設定；SPI 制御（SCK/SDI/{CS}/MUXOUT）にも対応；8 組プログラマブル出力パワーレベル；SYSREF は generator と repeater モードとウィンドウ機能に対応、508 段遅延ステップ・各 <2.5ps @12.8GHz；SYNC で全分周器と複数素子を同期可；SYSREF 出力を停止すればマルチチャネル・低スキュー・超低雑音のローカル発振信号を複数ミキサへ分配可。',
        usedIn: 'レーダ撮像ペイロード、通信ペイロード、指令・データ処理（command and data handling）、データコンバータのクロック、クロック分配/逓倍/分周等の航空宇宙防衛と高精度計測用途。',
        desc: '300MHz~15GHz JESD204B/C 低雑音クロック buffer/逓倍/分周器、SPI 不要 pin mode 対応、4 出力+SYSREF、雑音フロア −159dBc/Hz@6GHz、2.5V、−55~125°C、64-HTQFP 10×10mm。',
        thermalPad: 'DAP（Table 4-1：DAP／DAP／GND／Ground the pad.）、接地必須。',
        specs: [
          { k: '出力周波数', v: '300MHz ~ 15GHz' },
          { k: '雑音性能', v: '雑音フロア −159dBc/Hz @6GHz 出力；付加ジッタ 36fs（100Hz~fCLK、@6GHz 出力）／5fs（100Hz~100MHz）' },
          { k: '分周/逓倍', v: '共用分周 1(buffer)/2~8；共用プログラマブル逓倍 ×2/×3/×4；LOGICLK 独立分周バンク' },
          { k: '設定モード', v: 'Pin mode（SPI 不要、PWRSEL/DIVSEL/MUXSEL/CLKx_EN 等のピンで設定）または SPI（SCK/SDI/{CS}/MUXOUT）' },
          { k: 'SYSREF', v: '4 組高周波出力に各々 SYSREF ペア；508 段遅延ステップ <2.5ps@12.8GHz；generator/repeater モード' },
          { k: '出力パワーレベル', v: '8 組プログラマブル' },
          { k: '電源', v: '2.5V' },
          { k: '温度/信頼性', v: '−55°C ~ 125°C；VID #V62/24627、Controlled Baseline、単一組立/試験拠点、単一ファブ、Extended Product Life Cycle、Product Traceability' },
          { k: 'パッケージ', v: '64-pin HTQFP (PAP0064E) 10mm×10mm' }
        ]
      },
      ko: {
        subcategory: 'JESD204B/C 고주파 저잡음 클록 Buffer/체배/분주기(4출력+SYSREF·pin mode 지원·고신뢰 등급)',
        whatIs: '저잡음 고주파 JESD204B/C 클록 buffer/체배/분주기, 출력 주파수 300MHz~15GHz, SPI 불필요 핀 모드(pin mode) 설정 지원, 4조 고주파 클록 출력에 각각 SYSREF 출력을 페어, −55°C~125°C 고신뢰 등급 - 데이터 컨버터 클록과 항공우주 방위 페이로드에 적합.',
        func: '공용 분주 1(buffer)/2/3/4/5/6/7/8, 공용 프로그래머블 체배 ×2/×3/×4; LOGICLKOUT은 독립 분주 뱅크(전치 1/2/4, 후치 1(bypass)~1023); pin mode에서는 PWRSEL[2:0]/DIVSEL[2:0]/MUXSEL[1:0]/CLK0_EN~CLK3_EN/LOGIC_EN/SYSREF_EN 등의 핀으로 출력 파워 레벨·분주/체배 값·동작 모드·각 채널 ON/OFF를 SPI 없이 직접 설정; SPI 제어(SCK/SDI/{CS}/MUXOUT)도 지원; 8조 프로그래머블 출력 파워 레벨; SYSREF는 generator와 repeater 모드와 윈도우 기능 지원, 508단 지연 스텝·각 <2.5ps @12.8GHz; SYNC로 전체 분주기와 복수 소자 동기 가능; SYSREF 출력을 정지하면 멀티채널·저스큐·초저잡음 로컬 발진 신호를 복수 믹서에 분배 가능.',
        usedIn: '레이더 이미징 페이로드, 통신 페이로드, 지령·데이터 처리(command and data handling), 데이터 컨버터 클록, 클록 분배/체배/분주 등 항공우주 방위와 고정밀 계측 용도.',
        desc: '300MHz~15GHz JESD204B/C 저잡음 클록 buffer/체배/분주기, SPI 불필요 pin mode 지원, 4출력+SYSREF, 잡음 바닥 −159dBc/Hz@6GHz, 2.5V, −55~125°C, 64-HTQFP 10×10mm.',
        thermalPad: 'DAP(Table 4-1: DAP / DAP / GND / Ground the pad.), 접지 필수.',
        specs: [
          { k: '출력 주파수', v: '300MHz ~ 15GHz' },
          { k: '잡음 성능', v: '잡음 바닥 −159dBc/Hz @6GHz 출력; 부가 지터 36fs(100Hz~fCLK, @6GHz 출력) / 5fs(100Hz~100MHz)' },
          { k: '분주/체배', v: '공용 분주 1(buffer)/2~8; 공용 프로그래머블 체배 ×2/×3/×4; LOGICLK 독립 분주 뱅크' },
          { k: '설정 모드', v: 'Pin mode(SPI 불필요, PWRSEL/DIVSEL/MUXSEL/CLKx_EN 등의 핀으로 설정) 또는 SPI(SCK/SDI/{CS}/MUXOUT)' },
          { k: 'SYSREF', v: '4조 고주파 출력에 각각 SYSREF 페어; 508단 지연 스텝 <2.5ps@12.8GHz; generator/repeater 모드' },
          { k: '출력 파워 레벨', v: '8조 프로그래머블' },
          { k: '전원', v: '2.5V' },
          { k: '온도/신뢰성', v: '−55°C ~ 125°C; VID #V62/24627, Controlled Baseline, 단일 조립/시험 거점, 단일 팹, Extended Product Life Cycle, Product Traceability' },
          { k: '패키지', v: '64-pin HTQFP (PAP0064E) 10mm×10mm' }
        ]
      }
    },
    'TPS7H3034-SP': {
      en: {
        subcategory: 'Space-grade quad voltage supervisor/sequencer (push-pull outputs, Rad-Hard)',
        whatIs: 'Space-grade quad power-rail voltage supervisor/sequencer: simultaneously monitors four rails (SENSE1-4) for undervoltage (UV) / overvoltage (OV), notifies the system via the corresponding RESET outputs, and includes a watchdog timer.',
        func: 'SENSE1~SENSE4 each monitor a rail via an external resistor divider, comparator threshold typically 599.7mV (VTH_SENSEx). MODE selects output behavior: MODE=0 gives 2UV+2OV, MODE=1 gives 2-window; this TPS7H3034-SP is the push-pull-output, 4-UV-or-4-OV version (per MODE, which must not be switched dynamically). RESET1~RESET4 are the per-SENSE fault reset outputs (push-pull, VOH set by PULL_UP1; the open-drain versions use external pull-ups). WDI is the watchdog input which must be toggled low-to-high periodically to clear the timer; on timeout WDO goes low (push-pull, VOH set by PULL_UP2); WD_TMR/DLY_TMR each use one resistor to GND to set the watchdog timeout (0.52s~1.5s) and the post-fault delay (0.25ms~25ms) — floating disables the watchdog / gives no delay respectively. PWRGD outputs high when all rails (SENSE1-4) are within range. SR_UVLO is the system reset & UVLO input; pulling it low forces all outputs low, and a resistor divider from VIN programs the turn-on level (the datasheet Type column says O, but the functional description says input — the functional description prevails). VLDO is the internal-regulator output (needs ≥1µF to GND, 5mA max load, no overcurrent protection; usable to create a positive offset when monitoring negative rails). REFCAP is the 1.2V reference cap pin (needs 470nF, no other circuitry allowed). Radiation-tolerant space grade (QMLV-RHA): TID 100krad(Si) RLAT, DSEE immune to 75MeV-cm²/mg.',
        usedIn: 'Multi-rail voltage supervision and sequencing, watchdog protection and power-good flag generation on satellite/space-payload boards.',
        desc: '22-Pin CFP (HFT), radiation-tolerant (TID 100krad(Si)) space-grade quad voltage supervisor (push-pull-output version, 4UV or 4OV per MODE), with watchdog timer (WDI/WDO/WD_TMR) and fault-delay timer (DLY_TMR). The same datasheet also covers: the 2UV+2OV or 2-window selectable TPS7H3024-SP (same pinout); the open-drain-output TPS7H3124-SP/TPS7H3134-SP (TPS7H31x4) — on the latter, pins 17/18 become VLDO (paralleled with pin 15) / GND (paralleled with pin 14); this entry’s pin 14/15/17/18 descs note the open-drain-version differences. Orderable 5962R2420603VXC is marked “Advanced information” (pre-release) in the source — verify against the latest datasheet. The Thermal Pad is internally grounded (GND); the metal lid connects internally through the seal ring to the Thermal Pad and GND.',
        specs: [
          { k: 'Function', v: 'space-grade quad voltage supervisor/sequencer (push-pull outputs)' },
          { k: 'Sense threshold (SENSE1-4, typ)', v: '599.7mV' },
          { k: 'Hysteresis current (typ)', v: '24µA (set by 49.9kΩ HYS resistor)' },
          { k: 'Watchdog timeout range', v: '0.52s ~ 1.5s (WD_TMR resistor 56.2k~174kΩ)' },
          { k: 'Fault delay range', v: '0.25ms ~ 25ms (DLY_TMR resistor 10.5k~1.18MΩ)' },
          { k: 'Main supply (IN)', v: '3V ~ 14V' },
          { k: 'Radiation', v: 'TID 100krad(Si) RLAT; DSEE immune to 75MeV-cm²/mg' },
          { k: 'Qualification', v: 'QMLV-RHA' },
          { k: 'Package', v: '22-Pin CFP (HFT)' },
          { k: 'Orderable', v: '5962R2420603VXC (marked Advanced information, pre-release)' }
        ]
      },
      ja: {
        subcategory: '宇宙級 4 チャネル電圧監視／シーケンサ（Quad Voltage Supervisor・push-pull 出力・Rad-Hard）',
        whatIs: '宇宙級 4 チャネル電源電圧監視／シーケンサ：4 系統の電源レール（SENSE1-4）の低電圧（UV）／過電圧（OV）状態を同時監視し、対応する RESET 出力でシステムに通知、ウォッチドッグ（Watchdog）タイマ内蔵。',
        func: 'SENSE1~SENSE4 は各々外部抵抗分圧で 1 系統の電源レールを監視、コンパレータしきい値は典型 599.7mV（VTH_SENSEx）。MODE ピンで出力動作を選択：MODE=0 は 2UV+2OV、MODE=1 は 2-window；本 TPS7H3034-SP は push-pull 出力・4 UV または 4 OV 機能版（MODE 設定による、動的切替不可）。RESET1~RESET4 は対応 SENSE チャネル故障時のリセット出力（push-pull、VOH は PULL_UP1 が決定；オープンドレイン版は外部プルアップが決定）。WDI はウォッチドッグ入力で定期的にローからハイへ反転しタイマをクリアする必要があり、タイムアウトで WDO がロー（push-pull、VOH は PULL_UP2 が決定）；WD_TMR/DLY_TMR は各々 GND への抵抗 1 本でウォッチドッグタイムアウト時間（0.52s~1.5s）と故障後遅延時間（0.25ms~25ms）を設定、浮きで各々ウォッチドッグ無効／遅延なし。PWRGD は全電源レール（SENSE1-4）が正常範囲内のとき高出力。SR_UVLO はシステムリセットと UVLO 入力、ローで全出力を強制ロー、VIN への抵抗分圧でオン電圧をプログラム可（datasheet の Type 欄は O 表記だが機能説明は入力信号、機能説明を優先）。VLDO は内部レギュレータ出力（GND へ最低 1µF 必要、最大負荷 5mA・過電流保護なし、負電圧監視時の正オフセット生成に使用可）。REFCAP は 1.2V 内部参照コンデンサピン（470nF 必要、他回路接続禁止）。耐放射線宇宙級（QMLV-RHA）：TID 100krad(Si) RLAT、DSEE は 75MeV-cm²/mg まで免疫。',
        usedIn: '衛星・宇宙ペイロード基板上の多系統電源電圧監視とシーケンス、ウォッチドッグ保護、電源良好フラグ生成等の宇宙用途。',
        desc: '22-Pin CFP（HFT）、耐放射線（TID 100krad(Si)）宇宙級 4 チャネル電圧監視器（push-pull 出力版、MODE で 4UV または 4OV）、ウォッチドッグタイマ（WDI/WDO/WD_TMR）と故障遅延タイマ（DLY_TMR）付。同一 datasheet 内に：2UV+2OV または 2-window 選択版 TPS7H3024-SP（同 pinout）；オープンドレイン出力版 TPS7H3124-SP/TPS7H3134-SP（TPS7H31x4）——後者は pin17/18 が VLDO（pin15 と並接）/GND（pin14 と並接）に変更、本条目の pin14/15/17/18 の desc にオープンドレイン版の差異を注記。注文型番 5962R2420603VXC は原文で「Advanced information」（未確定の事前公開情報）と注記、実際の仕様は最新 datasheet を確認。Thermal Pad は内部接地（GND）、金属リッド（Metal lid）はシールリング経由で Thermal Pad と GND に内部接続。',
        specs: [
          { k: '機能', v: '宇宙級 4 チャネル電圧監視／シーケンサ（push-pull 出力）' },
          { k: '検出しきい値（SENSE1-4・典型）', v: '599.7mV' },
          { k: 'ヒステリシス電流（典型）', v: '24µA（HYS 抵抗 49.9kΩ 設定）' },
          { k: 'ウォッチドッグタイムアウト範囲', v: '0.52s ~ 1.5s（WD_TMR 抵抗 56.2k~174kΩ）' },
          { k: '故障遅延範囲', v: '0.25ms ~ 25ms（DLY_TMR 抵抗 10.5k~1.18MΩ）' },
          { k: '主電源入力（IN）', v: '3V ~ 14V' },
          { k: '耐放射線', v: 'TID 100krad(Si) RLAT；DSEE は 75MeV-cm²/mg まで免疫' },
          { k: '認証グレード', v: 'QMLV-RHA' },
          { k: 'パッケージ', v: '22-Pin CFP (HFT)' },
          { k: '注文型番', v: '5962R2420603VXC（原文 Advanced information 注記・事前公開）' }
        ]
      },
      ko: {
        subcategory: '우주급 4채널 전압 감시/시퀀서(Quad Voltage Supervisor·push-pull 출력·Rad-Hard)',
        whatIs: '우주급 4채널 전원 전압 감시/시퀀서: 4계통 전원 레일(SENSE1-4)의 저전압(UV)/과전압(OV) 상태를 동시 감시하고 대응하는 RESET 출력으로 시스템에 통지, 워치독(Watchdog) 타이머 내장.',
        func: 'SENSE1~SENSE4는 각각 외부 저항 분압으로 한 계통 전원 레일을 감시, 비교기 문턱은 전형 599.7mV(VTH_SENSEx). MODE 핀으로 출력 동작 선택: MODE=0은 2UV+2OV, MODE=1은 2-window; 본 TPS7H3034-SP는 push-pull 출력·4 UV 또는 4 OV 기능판(MODE 설정에 따름, 동적 전환 불가). RESET1~RESET4는 대응 SENSE 채널 고장 시 리셋 출력(push-pull, VOH는 PULL_UP1이 결정; 오픈 드레인판은 외부 풀업이 결정). WDI는 워치독 입력으로 정기적으로 로우에서 하이로 반전해 타이머를 클리어해야 하며, 타임아웃 시 WDO가 로우(push-pull, VOH는 PULL_UP2가 결정); WD_TMR/DLY_TMR은 각각 GND로의 저항 1개로 워치독 타임아웃 시간(0.52s~1.5s)과 고장 후 지연 시간(0.25ms~25ms)을 설정, 플로팅이면 각각 워치독 비활성/지연 없음. PWRGD는 전체 전원 레일(SENSE1-4)이 정상 범위 내일 때 하이 출력. SR_UVLO는 시스템 리셋과 UVLO 입력, 로우로 당기면 전체 출력 강제 로우, VIN으로의 저항 분압으로 온 전압 프로그램 가능(datasheet Type 열은 O 표기이나 기능 설명은 입력 신호, 기능 설명 우선). VLDO는 내부 레귤레이터 출력(GND로 최소 1µF 필요, 최대 부하 5mA·과전류 보호 없음, 음전압 감시 시 양 오프셋 생성에 사용 가능). REFCAP는 1.2V 내부 참조 커패시터 핀(470nF 필요, 다른 회로 연결 금지). 내방사선 우주급(QMLV-RHA): TID 100krad(Si) RLAT, DSEE는 75MeV-cm²/mg까지 면역.',
        usedIn: '위성·우주 페이로드 보드상의 다계통 전원 전압 감시와 시퀀싱, 워치독 보호, 전원 양호 플래그 생성 등 우주 용도.',
        desc: '22-Pin CFP(HFT), 내방사선(TID 100krad(Si)) 우주급 4채널 전압 감시기(push-pull 출력판, MODE로 4UV 또는 4OV), 워치독 타이머(WDI/WDO/WD_TMR)와 고장 지연 타이머(DLY_TMR) 포함. 동일 datasheet 내에: 2UV+2OV 또는 2-window 선택판 TPS7H3024-SP(동일 pinout); 오픈 드레인 출력판 TPS7H3124-SP/TPS7H3134-SP(TPS7H31x4) - 후자는 pin17/18이 VLDO(pin15와 병렬)/GND(pin14와 병렬)로 변경, 본 항목의 pin14/15/17/18 desc에 오픈 드레인판 차이 주석. 주문 부품 5962R2420603VXC는 원문에 「Advanced information」(미확정 사전 공개 정보) 표기, 실제 사양은 최신 datasheet 확인. Thermal Pad는 내부 접지(GND), 금속 리드(Metal lid)는 실 링 경유로 Thermal Pad와 GND에 내부 연결.',
        specs: [
          { k: '기능', v: '우주급 4채널 전압 감시/시퀀서(push-pull 출력)' },
          { k: '감지 문턱(SENSE1-4·전형)', v: '599.7mV' },
          { k: '히스테리시스 전류(전형)', v: '24µA(HYS 저항 49.9kΩ 설정)' },
          { k: '워치독 타임아웃 범위', v: '0.52s ~ 1.5s(WD_TMR 저항 56.2k~174kΩ)' },
          { k: '고장 지연 범위', v: '0.25ms ~ 25ms(DLY_TMR 저항 10.5k~1.18MΩ)' },
          { k: '주전원 입력(IN)', v: '3V ~ 14V' },
          { k: '내방사선', v: 'TID 100krad(Si) RLAT; DSEE는 75MeV-cm²/mg까지 면역' },
          { k: '인증 등급', v: 'QMLV-RHA' },
          { k: '패키지', v: '22-Pin CFP (HFT)' },
          { k: '주문 부품', v: '5962R2420603VXC(원문 Advanced information 표기·사전 공개)' }
        ]
      }
    },
    'ADS9324': {
      en: {
        subcategory: '16-channel 16-bit simultaneous-sampling SAR ADC (integrated analog front end)',
        whatIs: '16-channel, 16-bit successive-approximation (SAR) simultaneous-sampling data-acquisition system: up to 1MSPS per channel, each channel with a complete built-in analog front end — 1MΩ-input-impedance programmable-gain amplifier (PGA), input clamp, low-pass filter and ADC input driver — plus a built-in low-drift precision reference with buffer driving the ADC. The high input impedance connects directly to sensors and transformers with no external drivers, supporting differential and single-ended inputs.',
        func: 'The serial interface is configurable as 1-lane, 2-lane, 4-lane or 8-lane readout; the ADC is also flexibly configurable into 2-CH, 4-CH, 8-CH or 16-CH simultaneous-sampling modes; input ranges: differential ±12.5V/±10V/±6.25V/±5V/±2.5V, common-mode ±12.5V; analog bandwidth options 25kHz and 325kHz; fail-safe open inputs (a floating input reads near zero); typical performance INL ±0.5LSB, DNL ±0.5LSB, SNR 88dB, THD −103dB, DC CMRR 100dB; low-drift on-chip 4.096V reference (buffered, 15ppm/°C typ); digital features include an on-chip digital filter (oversampling), system offset/gain/phase correction, a digital window comparator and an ADC output-data randomizer.',
        usedIn: 'Substation automation, motor protection relays and contactors, motor-control current sensing, industrial automation, test & measurement — anywhere needing precise multi-channel simultaneous sampling.',
        desc: '16-channel 16-bit simultaneous-sampling SAR ADC with integrated PGA/clamp/filter front end and 4.096V low-drift reference, 1MSPS/channel, 1/2/4/8-lane configurable serial interface, −40°C~125°C, 64-VQFN 8×8mm.',
        thermalPad: 'Exposed pad, listed as Thermal Pad in the datasheet, must connect to GND (Figure 4-1 shows it at the package center).',
        specs: [
          { k: 'Resolution/channels', v: '16-bit, 16-channel simultaneous sampling' },
          { k: 'Throughput', v: 'up to 1MSPS per channel' },
          { k: 'Input front end', v: 'integrated PGA, 1MΩ input impedance, single-ended and differential inputs' },
          { k: 'Input ranges', v: 'differential ±12.5V/±10V/±6.25V/±5V/±2.5V; common-mode ±12.5V' },
          { k: 'Analog bandwidth', v: '25kHz or 325kHz (selectable)' },
          { k: 'Typical performance', v: 'INL ±0.5LSB; DNL ±0.5LSB; SNR 88dB; THD −103dB; DC CMRR 100dB' },
          { k: 'Reference', v: 'on-chip low-drift 4.096V + buffer, 15ppm/°C typical' },
          { k: 'Digital interface', v: '1/2/4/8-lane configurable serial output; 2/4/8/16-CH simultaneous-sampling modes' },
          { k: 'Supply', v: 'analog 5V and 1.8V; digital I/O 1.8V~3.3V' },
          { k: 'Temperature range', v: '−40°C ~ +125°C' },
          { k: 'Package', v: '64-VQFN (RSK) 8.00mm × 8.00mm, EP=GND' }
        ]
      },
      ja: {
        subcategory: '16 チャネル 16-bit 同時サンプリング SAR ADC（アナログフロントエンド統合）',
        whatIs: '16 チャネル・16-bit 逐次比較（SAR）同時サンプリングデータ収集システム：各チャネル最高 1MSPS、各チャネルに完全なアナログフロントエンドを内蔵——1MΩ 入力インピーダンスのプログラマブルゲインアンプ（PGA）、入力クランプ、ローパスフィルタ、ADC 入力ドライバ——さらに低ドリフト精密参照電圧とバッファを内蔵し ADC を駆動。高入力インピーダンスでセンサやトランスに直結でき外部駆動回路不要、差動とシングルエンド入力に対応。',
        func: 'シリアルインタフェースは 1-lane、2-lane、4-lane、8-lane 読み出しに設定可；ADC は 2-CH、4-CH、8-CH、16-CH 同時サンプリングモードに柔軟に設定可；入力範囲：差動 ±12.5V/±10V/±6.25V/±5V/±2.5V、コモンモード電圧 ±12.5V；アナログ帯域は 25kHz と 325kHz の選択肢；オープンセーフ入力（浮き入力時 ADC 出力コードはゼロ付近）；典型性能 INL ±0.5LSB、DNL ±0.5LSB、SNR 88dB、THD −103dB、DC CMRR 100dB；低ドリフトオンチップ参照電圧 4.096V（バッファ付、15ppm/°C 典型温度ドリフト）；デジタル機能はオンチップデジタルフィルタ（オーバーサンプリング）、システムオフセット/ゲイン/位相補正、デジタルウィンドウコンパレータ、ADC 出力データランダマイザを含む。',
        usedIn: '変電所自動化、モータ保護リレーとコンタクタ、モータ制御電流検出、産業自動化、テスト計測等、高精度多チャネル同時サンプリングが必要な場面。',
        desc: '16 チャネル 16-bit 同時サンプリング SAR ADC。PGA/クランプ/フィルタ前端と 4.096V 低ドリフト参照を統合、1MSPS/チャネル、1/2/4/8-lane 設定可シリアルインタフェース、−40°C~125°C、64-VQFN 8×8mm。',
        thermalPad: '露出パッド、datasheet 表に Thermal Pad と記載、GND 接続必須（Figure 4-1 図示はパッケージ中央）。',
        specs: [
          { k: '分解能/チャネル数', v: '16-bit、16 チャネル同時サンプリング' },
          { k: 'スループット', v: '各チャネル最高 1MSPS' },
          { k: '入力フロントエンド', v: 'PGA 統合、1MΩ 入力インピーダンス、シングルエンドと差動入力対応' },
          { k: '入力範囲', v: '差動 ±12.5V/±10V/±6.25V/±5V/±2.5V；コモンモード電圧 ±12.5V' },
          { k: 'アナログ帯域', v: '25kHz または 325kHz（選択可）' },
          { k: '典型性能', v: 'INL ±0.5LSB；DNL ±0.5LSB；SNR 88dB；THD −103dB；DC CMRR 100dB' },
          { k: '参照電圧', v: 'オンチップ低ドリフト 4.096V＋バッファ、15ppm/°C typical' },
          { k: 'デジタルインタフェース', v: '1/2/4/8-lane 設定可シリアル出力；2/4/8/16-CH 同時サンプリングモード設定可' },
          { k: '電源', v: 'アナログ 5V と 1.8V；デジタル I/O 1.8V~3.3V' },
          { k: '温度範囲', v: '−40°C ~ +125°C' },
          { k: 'パッケージ', v: '64-VQFN (RSK) 8.00mm × 8.00mm、EP=GND' }
        ]
      },
      ko: {
        subcategory: '16채널 16-bit 동시 샘플링 SAR ADC(아날로그 프론트엔드 통합)',
        whatIs: '16채널·16-bit 축차 비교(SAR) 동시 샘플링 데이터 수집 시스템: 각 채널 최고 1MSPS, 각 채널에 완전한 아날로그 프론트엔드 내장 - 1MΩ 입력 임피던스 프로그래머블 이득 증폭기(PGA), 입력 클램프, 저역 필터, ADC 입력 드라이버 - 또한 저드리프트 정밀 참조 전압과 버퍼를 내장해 ADC 구동. 고입력 임피던스로 센서와 트랜스에 직결 가능해 외부 구동 회로 불필요, 차동과 싱글엔드 입력 지원.',
        func: '시리얼 인터페이스는 1-lane, 2-lane, 4-lane, 8-lane 읽기로 설정 가능; ADC는 2-CH, 4-CH, 8-CH, 16-CH 동시 샘플링 모드로 유연하게 설정 가능; 입력 범위: 차동 ±12.5V/±10V/±6.25V/±5V/±2.5V, 공통 모드 전압 ±12.5V; 아날로그 대역 25kHz와 325kHz 선택; 개방 안전 입력(플로팅 입력 시 ADC 출력 코드는 0 부근); 전형 성능 INL ±0.5LSB, DNL ±0.5LSB, SNR 88dB, THD −103dB, DC CMRR 100dB; 저드리프트 온칩 참조 전압 4.096V(버퍼 포함, 15ppm/°C 전형 온도 드리프트); 디지털 기능은 온칩 디지털 필터(오버샘플링), 시스템 오프셋/이득/위상 보정, 디지털 윈도우 비교기, ADC 출력 데이터 랜덤화기 포함.',
        usedIn: '변전소 자동화, 모터 보호 릴레이와 접촉기, 모터 제어 전류 감지, 산업 자동화, 테스트 계측 등 고정밀 다채널 동시 샘플링이 필요한 곳.',
        desc: '16채널 16-bit 동시 샘플링 SAR ADC. PGA/클램프/필터 전단과 4.096V 저드리프트 참조를 통합, 1MSPS/채널, 1/2/4/8-lane 설정 가능 시리얼 인터페이스, −40°C~125°C, 64-VQFN 8×8mm.',
        thermalPad: '노출 패드, datasheet 표에 Thermal Pad로 기재, GND 연결 필수(Figure 4-1 도시는 패키지 중앙).',
        specs: [
          { k: '분해능/채널 수', v: '16-bit, 16채널 동시 샘플링' },
          { k: '처리율', v: '각 채널 최고 1MSPS' },
          { k: '입력 프론트엔드', v: 'PGA 통합, 1MΩ 입력 임피던스, 싱글엔드와 차동 입력 지원' },
          { k: '입력 범위', v: '차동 ±12.5V/±10V/±6.25V/±5V/±2.5V; 공통 모드 전압 ±12.5V' },
          { k: '아날로그 대역', v: '25kHz 또는 325kHz(선택 가능)' },
          { k: '전형 성능', v: 'INL ±0.5LSB; DNL ±0.5LSB; SNR 88dB; THD −103dB; DC CMRR 100dB' },
          { k: '참조 전압', v: '온칩 저드리프트 4.096V+버퍼, 15ppm/°C typical' },
          { k: '디지털 인터페이스', v: '1/2/4/8-lane 설정 가능 시리얼 출력; 2/4/8/16-CH 동시 샘플링 모드 설정 가능' },
          { k: '전원', v: '아날로그 5V와 1.8V; 디지털 I/O 1.8V~3.3V' },
          { k: '온도 범위', v: '−40°C ~ +125°C' },
          { k: '패키지', v: '64-VQFN (RSK) 8.00mm × 8.00mm, EP=GND' }
        ]
      }
    },
    'ADC3664-EP': {
      en: {
        subcategory: 'Dual-channel 14-bit 125MSPS low-noise low-power ADC (Enhanced Product)',
        whatIs: 'Low-noise, ultra-low-power dual-channel 14-bit 125MSPS high-speed ADC, designed for best-in-class noise with a noise spectral density of −156.9dBFS/Hz plus linearity and dynamic range; supports IF sampling with latency as short as 2 clock cycles. The -EP suffix means TI “Enhanced Product” grade (not the exposed-pad EP in this table): ASTM E595 outgassing compliance, a VID (Vendor Item Drawing), −55°C~105°C extended temperature range, single fab/assembly/test site, gold-wire bonding with NiPdAu lead finish, wafer-lot traceability and extended product life cycle; -EP is NOT radiation-tolerant (radiation tolerance only in the -SEP version).',
        func: 'Voltage reference selectable external (1~125MSPS) or internal (100~125MSPS); input bandwidth 200MHz (3dB); INL ±2.6LSB, DNL ±0.9LSB (typical); a built-in optional/bypassable on-chip DSP supports 2/4/8/16/32× decimation and a 32-bit NCO; the serial LVDS digital interface supports 2-wire, 1-wire and 1/2-wire modes; spectral performance (fIN=5MHz): SNR 77.5dBFS, SFDR 84dBc (HD2/HD3), SFDR 92dBFS (worst spur); power 100mW/channel (125MSPS).',
        usedIn: 'High-speed data acquisition, satellite optical-communication payloads, satellite imaging payloads, satellite communication payloads, satellite RADAR/LIDAR payloads and other space/high-reliability applications.',
        desc: 'Dual-channel 14-bit 125MSPS low-noise ADC, noise floor −156.9dBFS/Hz, 100mW/channel, serial LVDS interface, 40-QFN 5×5mm; -EP is the Enhanced Product grade (−55°C~105°C, not radiation-tolerant — see -SEP for that).',
        thermalPad: 'PowerPAD exposed thermal pad = GND (listed on the Pin Functions GND row together with pins 11, 14, 37, 40), must connect to GND.',
        specs: [
          { k: 'Channels/resolution/rate', v: 'dual-channel, 14-bit (no missing codes), 125MSPS' },
          { k: 'Noise floor', v: '−156.9dBFS/Hz' },
          { k: 'Power', v: '100mW/channel (125MSPS)' },
          { k: 'Latency', v: '2 clock cycles' },
          { k: 'Voltage reference', v: 'external: 1~125MSPS; internal: 100~125MSPS' },
          { k: 'Input bandwidth', v: '200MHz (3dB)' },
          { k: 'Linearity', v: 'INL ±2.6LSB; DNL ±0.9LSB (typical)' },
          { k: 'On-chip DSP', v: 'optional/bypassable; 2/4/8/16/32× decimation; 32-bit NCO' },
          { k: 'Digital interface', v: 'serial LVDS (2-wire, 1-wire, 1/2-wire selectable)' },
          { k: 'Spectral performance (fIN=5MHz)', v: 'SNR 77.5dBFS; SFDR 84dBc (HD2/HD3); SFDR 92dBFS (worst spur)' },
          { k: 'Temperature range', v: '−55°C ~ +105°C (Enhanced Product)' },
          { k: 'Package', v: '40-QFN (RSB) 5mm × 5mm, EP (PowerPAD)=GND' }
        ]
      },
      ja: {
        subcategory: '2 チャネル 14-bit 125MSPS 低雑音低消費電力 ADC（Enhanced Product）',
        whatIs: '低雑音・超低消費電力の 2 チャネル 14-bit・125MSPS 高速 ADC。最良の雑音性能を目指した設計で雑音スペクトル密度 −156.9dBFS/Hz、線形性とダイナミックレンジを両立；IF サンプリング対応、最短 2 クロックサイクルの遅延。型番の -EP は TI「Enhanced Product」強化製品グレード（本表 exposed pad の EP 略称ではない）：ASTM E595 アウトガス規格適合、VID（Vendor Item Drawing）あり、−55°C~105°C 拡張温度範囲、単一ウェハ/封裝/試験工場、金線ボンディング＋NiPdAu 端子めっき、ウェハロット追跡可能、延長製品ライフサイクル；-EP は耐放射線特性なし（耐放射線は -SEP 版のみ）。',
        func: '電圧参照は外部（1~125MSPS）または内部（100~125MSPS）を選択可；入力帯域 200MHz（3dB）；INL ±2.6LSB、DNL ±0.9LSB（typical）；内蔵の選択/バイパス可オンチップ DSP は 2/4/8/16/32 倍デシメーションと 32-bit NCO に対応；シリアル LVDS デジタルインタフェースは 2-wire、1-wire、1/2-wire モード対応；スペクトル性能（fIN=5MHz）：SNR 77.5dBFS、SFDR 84dBc（HD2/HD3）、SFDR 92dBFS（worst spur）；消費電力 100mW/チャネル（125MSPS）。',
        usedIn: '高速データ収集、衛星光通信ペイロード、衛星撮像ペイロード、衛星通信ペイロード、衛星レーダ・ライダ（RADAR/LIDAR）ペイロード等の宇宙・高信頼用途。',
        desc: '2 チャネル 14-bit 125MSPS 低雑音 ADC、雑音フロア −156.9dBFS/Hz、100mW/チャネル、シリアル LVDS インタフェース、40-QFN 5×5mm；-EP は強化製品グレード（−55°C~105°C、耐放射線なし、耐放射線は -SEP 参照）。',
        thermalPad: 'PowerPAD 露出放熱パッド=GND（Pin Functions 表の GND 行にピン 11,14,37,40 と併記）、GND 接続必須。',
        specs: [
          { k: 'チャネル/分解能/速度', v: '2 チャネル、14-bit（no missing codes）、125MSPS' },
          { k: '雑音フロア', v: '−156.9dBFS/Hz' },
          { k: '消費電力', v: '100mW/チャネル（125MSPS）' },
          { k: '遅延', v: '2 クロックサイクル' },
          { k: '電圧参照', v: '外部：1~125MSPS；内部：100~125MSPS' },
          { k: '入力帯域', v: '200MHz（3dB）' },
          { k: '線形性', v: 'INL ±2.6LSB；DNL ±0.9LSB（typical）' },
          { k: 'オンチップ DSP', v: '選択/バイパス可；デシメーション 2/4/8/16/32 倍；32-bit NCO' },
          { k: 'デジタルインタフェース', v: 'シリアル LVDS（2-wire、1-wire、1/2-wire 選択可）' },
          { k: 'スペクトル性能（fIN=5MHz）', v: 'SNR 77.5dBFS；SFDR 84dBc（HD2/HD3）；SFDR 92dBFS（worst spur）' },
          { k: '温度範囲', v: '−55°C ~ +105°C（Enhanced Product）' },
          { k: 'パッケージ', v: '40-QFN (RSB) 5mm × 5mm、EP(PowerPAD)=GND' }
        ]
      },
      ko: {
        subcategory: '2채널 14-bit 125MSPS 저잡음 저전력 ADC(Enhanced Product)',
        whatIs: '저잡음·초저전력 2채널 14-bit·125MSPS 고속 ADC. 최상의 잡음 성능을 목표로 설계되어 잡음 스펙트럼 밀도 −156.9dBFS/Hz, 선형성과 다이내믹 레인지를 겸비; IF 샘플링 지원, 최단 2 클록 사이클 지연. 부품 번호의 -EP는 TI 「Enhanced Product」 강화 제품 등급(본 표 exposed pad의 EP 약칭이 아님): ASTM E595 아웃가스 규격 적합, VID(Vendor Item Drawing) 있음, −55°C~105°C 확장 온도 범위, 단일 웨이퍼/패키지/시험 공장, 금선 본딩+NiPdAu 단자 도금, 웨이퍼 로트 추적 가능, 연장 제품 수명 주기; -EP는 내방사선 특성 없음(내방사선은 -SEP판만).',
        func: '전압 참조는 외부(1~125MSPS) 또는 내부(100~125MSPS) 선택 가능; 입력 대역 200MHz(3dB); INL ±2.6LSB, DNL ±0.9LSB(typical); 내장 선택/바이패스 가능 온칩 DSP는 2/4/8/16/32배 데시메이션과 32-bit NCO 지원; 시리얼 LVDS 디지털 인터페이스는 2-wire, 1-wire, 1/2-wire 모드 지원; 스펙트럼 성능(fIN=5MHz): SNR 77.5dBFS, SFDR 84dBc(HD2/HD3), SFDR 92dBFS(worst spur); 소비 전력 100mW/채널(125MSPS).',
        usedIn: '고속 데이터 수집, 위성 광통신 페이로드, 위성 이미징 페이로드, 위성 통신 페이로드, 위성 레이더·라이다(RADAR/LIDAR) 페이로드 등 우주·고신뢰 용도.',
        desc: '2채널 14-bit 125MSPS 저잡음 ADC, 잡음 바닥 −156.9dBFS/Hz, 100mW/채널, 시리얼 LVDS 인터페이스, 40-QFN 5×5mm; -EP는 강화 제품 등급(−55°C~105°C, 내방사선 아님, 내방사선은 -SEP 참조).',
        thermalPad: 'PowerPAD 노출 방열 패드=GND(Pin Functions 표의 GND 행에 핀 11,14,37,40과 병기), GND 연결 필수.',
        specs: [
          { k: '채널/분해능/속도', v: '2채널, 14-bit(no missing codes), 125MSPS' },
          { k: '잡음 바닥', v: '−156.9dBFS/Hz' },
          { k: '소비 전력', v: '100mW/채널(125MSPS)' },
          { k: '지연', v: '2 클록 사이클' },
          { k: '전압 참조', v: '외부: 1~125MSPS; 내부: 100~125MSPS' },
          { k: '입력 대역', v: '200MHz(3dB)' },
          { k: '선형성', v: 'INL ±2.6LSB; DNL ±0.9LSB(typical)' },
          { k: '온칩 DSP', v: '선택/바이패스 가능; 데시메이션 2/4/8/16/32배; 32-bit NCO' },
          { k: '디지털 인터페이스', v: '시리얼 LVDS(2-wire, 1-wire, 1/2-wire 선택 가능)' },
          { k: '스펙트럼 성능(fIN=5MHz)', v: 'SNR 77.5dBFS; SFDR 84dBc(HD2/HD3); SFDR 92dBFS(worst spur)' },
          { k: '온도 범위', v: '−55°C ~ +105°C(Enhanced Product)' },
          { k: '패키지', v: '40-QFN (RSB) 5mm × 5mm, EP(PowerPAD)=GND' }
        ]
      }
    },
    'MSPM0C1105-Q1': {
      en: {
        subcategory: 'Automotive Arm Cortex-M0+ mixed-signal MCU (32KB flash / 8KB RAM)',
        whatIs: mcWhat('en', 'MSPM0C1105-Q1 = 32KB flash / 8KB RAM; the sibling MSPM0C1106-Q1', '64KB flash / 8KB RAM'),
        func: mcFunc.en, usedIn: mcUsed.en,
        desc: 'Automotive Arm Cortex-M0+ MCU, up to 32MHz / 32KB flash / 8KB SRAM, 12-bit 1.6Msps ADC (up to 27 channels), AEC-Q100 Grade 1, multiple packages incl. 48-VQFN (RGZ).',
        thermalPad: mcPad.en,
        specs: mcSpecs('en', 'MSPM0C1105-Q1: 32KB flash / 8KB SRAM (sibling MSPM0C1106-Q1: 64KB flash / 8KB SRAM)')
      },
      ja: {
        subcategory: '車載 Arm Cortex-M0+ 混合信号 MCU（32KB flash／8KB RAM）',
        whatIs: mcWhat('ja', 'MSPM0C1105-Q1＝32KB flash／8KB RAM；同シリーズ MSPM0C1106-Q1', '64KB flash／8KB RAM'),
        func: mcFunc.ja, usedIn: mcUsed.ja,
        desc: '車載 Arm Cortex-M0+ MCU、最高 32MHz／32KB flash／8KB SRAM、12-bit 1.6Msps ADC（最大 27 チャネル）、AEC-Q100 Grade 1、48-VQFN (RGZ) 等の複数パッケージ選択可。',
        thermalPad: mcPad.ja,
        specs: mcSpecs('ja', 'MSPM0C1105-Q1：32KB flash／8KB SRAM（同シリーズ MSPM0C1106-Q1：64KB flash／8KB SRAM）')
      },
      ko: {
        subcategory: '차량용 Arm Cortex-M0+ 혼합 신호 MCU(32KB flash / 8KB RAM)',
        whatIs: mcWhat('ko', 'MSPM0C1105-Q1 = 32KB flash / 8KB RAM; 동일 시리즈 MSPM0C1106-Q1', '64KB flash / 8KB RAM'),
        func: mcFunc.ko, usedIn: mcUsed.ko,
        desc: '차량용 Arm Cortex-M0+ MCU, 최고 32MHz / 32KB flash / 8KB SRAM, 12-bit 1.6Msps ADC(최대 27채널), AEC-Q100 Grade 1, 48-VQFN (RGZ) 등 복수 패키지 선택 가능.',
        thermalPad: mcPad.ko,
        specs: mcSpecs('ko', 'MSPM0C1105-Q1: 32KB flash / 8KB SRAM(동일 시리즈 MSPM0C1106-Q1: 64KB flash / 8KB SRAM)')
      }
    },
    'MSPM0C1106-Q1': {
      en: {
        subcategory: 'Automotive Arm Cortex-M0+ mixed-signal MCU (64KB flash / 8KB RAM)',
        whatIs: mcWhat('en', 'MSPM0C1106-Q1 = 64KB flash / 8KB RAM; the sibling MSPM0C1105-Q1', '32KB flash / 8KB RAM'),
        func: mcFunc.en, usedIn: mcUsed.en,
        desc: 'Automotive Arm Cortex-M0+ MCU, up to 32MHz / 64KB flash / 8KB SRAM, 12-bit 1.6Msps ADC (up to 27 channels), AEC-Q100 Grade 1, multiple packages incl. 48-VQFN (RGZ).',
        thermalPad: mcPad.en,
        specs: mcSpecs('en', 'MSPM0C1106-Q1: 64KB flash / 8KB SRAM (sibling MSPM0C1105-Q1: 32KB flash / 8KB SRAM)'),
        dropIn: [{ note: 'Same datasheet (TI SLASFJ7A, same md5), identical 48-VQFN (RGZ) pinout; only memory differs: C1105=32KB flash/8KB RAM, C1106=64KB flash/8KB RAM' }]
      },
      ja: {
        subcategory: '車載 Arm Cortex-M0+ 混合信号 MCU（64KB flash／8KB RAM）',
        whatIs: mcWhat('ja', 'MSPM0C1106-Q1＝64KB flash／8KB RAM；同シリーズ MSPM0C1105-Q1', '32KB flash／8KB RAM'),
        func: mcFunc.ja, usedIn: mcUsed.ja,
        desc: '車載 Arm Cortex-M0+ MCU、最高 32MHz／64KB flash／8KB SRAM、12-bit 1.6Msps ADC（最大 27 チャネル）、AEC-Q100 Grade 1、48-VQFN (RGZ) 等の複数パッケージ選択可。',
        thermalPad: mcPad.ja,
        specs: mcSpecs('ja', 'MSPM0C1106-Q1：64KB flash／8KB SRAM（同シリーズ MSPM0C1105-Q1：32KB flash／8KB SRAM）'),
        dropIn: [{ note: '同一 datasheet（TI SLASFJ7A、md5 同一）、48-VQFN (RGZ) pinout 完全同一、メモリのみ異なる：C1105=32KB flash／8KB RAM、C1106=64KB flash／8KB RAM' }]
      },
      ko: {
        subcategory: '차량용 Arm Cortex-M0+ 혼합 신호 MCU(64KB flash / 8KB RAM)',
        whatIs: mcWhat('ko', 'MSPM0C1106-Q1 = 64KB flash / 8KB RAM; 동일 시리즈 MSPM0C1105-Q1', '32KB flash / 8KB RAM'),
        func: mcFunc.ko, usedIn: mcUsed.ko,
        desc: '차량용 Arm Cortex-M0+ MCU, 최고 32MHz / 64KB flash / 8KB SRAM, 12-bit 1.6Msps ADC(최대 27채널), AEC-Q100 Grade 1, 48-VQFN (RGZ) 등 복수 패키지 선택 가능.',
        thermalPad: mcPad.ko,
        specs: mcSpecs('ko', 'MSPM0C1106-Q1: 64KB flash / 8KB SRAM(동일 시리즈 MSPM0C1105-Q1: 32KB flash / 8KB SRAM)'),
        dropIn: [{ note: '동일 datasheet(TI SLASFJ7A, md5 동일), 48-VQFN (RGZ) pinout 완전 동일, 메모리만 다름: C1105=32KB flash/8KB RAM, C1106=64KB flash/8KB RAM' }]
      }
    },
    'MSPM0L1126': {
      en: {
        subcategory: 'Arm Cortex-M0+ mixed-signal MCU (64KB flash / 12KB RAM, no LCD)',
        whatIs: 'Mixed-signal MCU: Arm 32-bit Cortex-M0+ core (with MPU, up to 32MHz), −40°C~125°C operation, 1.62V~3.6V supply, up to 128KB flash (with ECC) + 12KB SRAM (ECC or parity), built-in 12-bit 1.6Msps ADC (up to 26 external channels), a comparator (COMP) with 8-bit reference DAC, an integrated temperature sensor, an AES accelerator (GCM/GMAC, CCM/CBC-MAC, CBC, CTR) + secure key storage; packages include 64-pin LQFP (PM), 48-pin LQFP (PT)/VQFN (RGZ), 32-pin VQFN (RHB), 28-pin VSSOP (DGS28)/WQFN-28 (RUY), 24-pin VQFN (RGE). MSPM0L1126 = 64KB flash / 12KB RAM; the sibling MSPM0L1127 = 128KB flash / 12KB RAM. (The same family datasheet also covers the LCD-controller siblings MSPM0L2116/L2117 — not this entry; L1126/L1127 have no LCD.)',
        func: 'Low-power modes: RUN 98µA/MHz (CoreMark), SLEEP 1.3mA@32MHz, STOP 403µA@4MHz, STANDBY 1.6µA (full SRAM/register retention), SHUTDOWN 81nA (I/O wake). Digital peripherals: 3-channel DMA, 15-channel event fabric, up to 8 timers with up to 16 PWM outputs (7 of them operable in STANDBY): one 16-bit advanced timer with deadband (up to 64MHz), one 16-bit general timer with 4 capture/compares, two 16-bit general timers with 2 capture/compares each, four 16-bit basic timers; WWDT and IWDT watchdogs. Comms: up to 3× UART (one with LIN, IrDA, DALI, smart card, Manchester), up to 2× I2C (SMBus/PMBus, STOP-mode wake, up to FM+ 1Mbps), up to 2× SPI (up to 16Mbps). Clocking: built-in 32MHz SYSOSC (−2.1%~1.6%), built-in 32kHz LFOSC (±3%), external 4MHz~32MHz HFXT, external 32kHz LFXT, external LF/HF digital clock inputs, digital clock output. Data integrity & crypto: CRC-16, AES accelerator, secure key storage (one 256-bit or two 128-bit AES keys). I/O: up to 60 GPIOs, 2 of them 5V-tolerant open-drain (on the 48-VQFN RGZ: 44 usable GPIOs + NRST/VDD/VSS/VCORE = 48 pins). Development: 2-pin SWD.',
        usedIn: 'Battery charge/discharge management, power supplies and power delivery, personal electronics, building security and fire safety, connected peripherals and printers, grid infrastructure, smart meters, communication modules, medical and healthcare.',
        desc: 'Arm Cortex-M0+ MCU, up to 32MHz / 64KB flash / 12KB SRAM, 12-bit 1.6Msps ADC (up to 26 channels), AES accelerator + secure key storage, −40°C~125°C, multiple packages incl. 48-VQFN (RGZ) (no LCD; the L2116/L2117 siblings have LCD).',
        thermalPad: 'Exposed pad (datasheet Figure 6-2 48-pin RGZ marks the center Thermal Pad), must connect to the board ground plane.',
        specs: [
          { k: 'Core', v: 'Arm 32-bit Cortex-M0+ with MPU, up to 32MHz' },
          { k: 'Operating temperature', v: '−40°C ~ 125°C (the datasheet does not mark AEC-Q100 — not the -Q1 automotive version)' },
          { k: 'Supply range', v: '1.62V ~ 3.6V' },
          { k: 'Memory', v: 'MSPM0L1126: 64KB flash (ECC) / 12KB SRAM (ECC or parity) (sibling MSPM0L1127: 128KB flash / 12KB SRAM)' },
          { k: 'ADC', v: '12-bit, 1.6Msps, up to 26 external channels (family max; actual channels on 48-VQFN RGZ per the pin table)' },
          { k: 'Reference', v: 'configurable 1.4V or 2.5V internal shared VREF' },
          { k: 'Comparator', v: 'COMP with 8-bit reference DAC; integrated temperature sensor' },
          { k: 'Crypto/security', v: 'AES accelerator (GCM/GMAC, CCM/CBC-MAC, CBC, CTR); secure key storage 1×256-bit or 2×128-bit AES keys; CRC-16' },
          { k: 'Low power', v: 'RUN 98µA/MHz (CoreMark); SLEEP 1.3mA@32MHz; STOP 403µA@4MHz; STANDBY 1.6µA; SHUTDOWN 81nA (I/O wake)' },
          { k: 'Comms', v: 'up to 3×UART (one with LIN/IrDA/DALI/smart card/Manchester); up to 2×I2C (SMBus/PMBus, up to FM+ 1Mbps); up to 2×SPI (up to 16Mbps)' },
          { k: 'Clocking', v: 'built-in 32MHz SYSOSC (−2.1%~1.6%); built-in 32kHz LFOSC (±3%); external 4~32MHz HFXT; external 32kHz LFXT' },
          { k: 'I/O', v: 'up to 60 GPIOs, 2 of them 5V-tolerant open-drain; on 48-VQFN (RGZ): 44 GPIOs + NRST/VDD/VSS/VCORE' },
          { k: 'Package options', v: '64-pin LQFP (PM); 48-pin LQFP (PT)/VQFN (RGZ); 32-pin VQFN (RHB); 28-pin VSSOP (DGS28)/WQFN-28 (RUY); 24-pin VQFN (RGE)' },
          { k: 'Debug', v: '2-pin SWD' },
          { k: 'Family differences', v: 'MSPM0L2116/L2117 add an LCD controller (up to 4x48/8x44 LCD); this entry’s L1126/L1127 have no LCD' }
        ],
        dropIn: [{ note: 'Same family datasheet (TI SLASFN5, same md5), identical Table 6-2 RGZ 48-VQFN pinout; only memory differs: L1126=64KB flash/12KB RAM, L1127=128KB flash/12KB RAM' }]
      },
      ja: {
        subcategory: 'Arm Cortex-M0+ 混合信号 MCU（64KB flash／12KB RAM・LCD なし）',
        whatIs: '混合信号 MCU：Arm 32-bit Cortex-M0+ コア（MPU 付、最高 32MHz）、動作温度 −40°C~125°C、電源範囲 1.62V~3.6V、最大 128KB flash（ECC 付）＋12KB SRAM（ECC または parity）、12-bit 1.6Msps ADC（最大 26 外部チャネル）、8-bit 基準 DAC 付コンパレータ（COMP）、温度センサ統合、AES アクセラレータ（GCM/GMAC、CCM/CBC-MAC、CBC、CTR）＋セキュア鍵ストレージ内蔵；パッケージは 64-pin LQFP (PM)、48-pin LQFP (PT)／VQFN (RGZ)、32-pin VQFN (RHB)、28-pin VSSOP (DGS28)／WQFN-28 (RUY)、24-pin VQFN (RGE)。MSPM0L1126＝64KB flash／12KB RAM；同シリーズ MSPM0L1127＝128KB flash／12KB RAM。（同一 family datasheet は LCD コントローラ付の姉妹品 MSPM0L2116／L2117 も収録、本条目対象外；L1126/L1127 は LCD なし）',
        func: '低消費電力モード：RUN 98µA/MHz（CoreMark）、SLEEP 1.3mA@32MHz、STOP 403µA@4MHz、STANDBY 1.6µA（SRAM とレジスタ全保持）、SHUTDOWN 81nA（I/O ウェイク対応）。デジタル周辺：3 チャネル DMA、15 チャネルイベントファブリック、最大 8 個のタイマで最大 16 系統 PWM 出力（うち 7 個は STANDBY 動作可）：deadband 付 16-bit 先進タイマ 1 個（最高 64MHz）、capture/compare 4 組付 16-bit 汎用タイマ 1 個、capture/compare 各 2 組の 16-bit 汎用タイマ 2 個、16-bit 基本タイマ 4 個；WWDT と IWDT。通信：最大 3 組 UART（1 組は LIN・IrDA・DALI・smart card・Manchester 対応）、最大 2 組 I2C（SMBus/PMBus、STOP モードウェイク、最高 FM+ 1Mbps）、最大 2 組 SPI（最高 16Mbps）。クロック：内蔵 32MHz SYSOSC（−2.1%~1.6%）、内蔵 32kHz LFOSC（±3%）、外部 4MHz~32MHz HFXT、外部 32kHz LFXT、外部低/高周波デジタルクロック入力、デジタルクロック出力。データ完全性と暗号：CRC-16、AES アクセラレータ、セキュア鍵ストレージ（256-bit×1 または 128-bit×2 AES 鍵）。I/O：最大 60 GPIO、うち 2 個 5V 耐圧オープンドレイン（48-VQFN RGZ では実際 44 GPIO＋NRST/VDD/VSS/VCORE の計 48 ピン）。開発：2-pin SWD。',
        usedIn: '電池充放電管理、電源供給と電力伝送、パーソナル電子機器、ビルセキュリティ・防火、コネクテッド周辺機器とプリンタ、電力網インフラ、スマートメータ、通信モジュール、医療・ヘルスケア等の用途。',
        desc: 'Arm Cortex-M0+ MCU、最高 32MHz／64KB flash／12KB SRAM、12-bit 1.6Msps ADC（最大 26 チャネル）、AES アクセラレータ＋セキュア鍵ストレージ、動作温度 −40°C~125°C、48-VQFN (RGZ) 等の複数パッケージ選択可（LCD なし；同シリーズ L2116/L2117 は LCD 付）。',
        thermalPad: '露出パッド（datasheet 図 6-2 48-pin RGZ 中央に Thermal Pad 表記）、基板接地プレーンに接続必須。',
        specs: [
          { k: 'コア', v: 'Arm 32-bit Cortex-M0+、MPU 付、最高 32MHz' },
          { k: '動作温度', v: '−40°C ~ 125°C（datasheet に AEC-Q100 車載認証表記なし、-Q1 車載版でない）' },
          { k: '電源範囲', v: '1.62V ~ 3.6V' },
          { k: 'メモリ', v: 'MSPM0L1126：64KB flash（ECC）／12KB SRAM（ECC または parity）（同シリーズ MSPM0L1127：128KB flash／12KB SRAM）' },
          { k: 'ADC', v: '12-bit、1.6Msps、最大 26 外部チャネル（ファミリ最大値；48-VQFN RGZ の実際の使用可能チャネル数はピン表参照）' },
          { k: '基準電圧', v: '設定可能 1.4V または 2.5V 内部共用 VREF' },
          { k: 'コンパレータ', v: 'COMP、8-bit 基準 DAC 付；温度センサ統合' },
          { k: '暗号/セキュリティ', v: 'AES アクセラレータ（GCM/GMAC、CCM/CBC-MAC、CBC、CTR）；セキュア鍵ストレージ 1×256-bit または 2×128-bit AES 鍵；CRC-16' },
          { k: '低消費電力', v: 'RUN 98µA/MHz（CoreMark）；SLEEP 1.3mA@32MHz；STOP 403µA@4MHz；STANDBY 1.6µA；SHUTDOWN 81nA（I/O ウェイク）' },
          { k: '通信', v: '最大 3×UART（1 組 LIN/IrDA/DALI/smart card/Manchester 対応）；最大 2×I2C（SMBus/PMBus、最高 FM+ 1Mbps）；最大 2×SPI（最高 16Mbps）' },
          { k: 'クロック', v: '内蔵 32MHz SYSOSC（−2.1%~1.6%）；内蔵 32kHz LFOSC（±3%）；外部 4~32MHz HFXT；外部 32kHz LFXT' },
          { k: 'I/O', v: '最大 60 GPIO、うち 2 個 5V 耐圧オープンドレイン；48-VQFN (RGZ) では 44 GPIO＋NRST/VDD/VSS/VCORE' },
          { k: 'パッケージ選択肢', v: '64-pin LQFP (PM)；48-pin LQFP (PT)／VQFN (RGZ)；32-pin VQFN (RHB)；28-pin VSSOP (DGS28)／WQFN-28 (RUY)；24-pin VQFN (RGE)' },
          { k: 'デバッグ', v: '2-pin SWD' },
          { k: '同シリーズ差異', v: 'MSPM0L2116/L2117 は LCD コントローラ付（最大 4x48／8x44 LCD）、本条目の L1126/L1127 は LCD なし' }
        ],
        dropIn: [{ note: '同一 family datasheet（TI SLASFN5、md5 同一）、Table 6-2 RGZ 48-VQFN pinout 完全同一、メモリのみ異なる：L1126=64KB flash／12KB RAM、L1127=128KB flash／12KB RAM' }]
      },
      ko: {
        subcategory: 'Arm Cortex-M0+ 혼합 신호 MCU(64KB flash / 12KB RAM·LCD 없음)',
        whatIs: '혼합 신호 MCU: Arm 32-bit Cortex-M0+ 코어(MPU 포함, 최고 32MHz), 동작 온도 −40°C~125°C, 전원 범위 1.62V~3.6V, 최대 128KB flash(ECC 포함)+12KB SRAM(ECC 또는 parity), 12-bit 1.6Msps ADC(최대 26 외부 채널), 8-bit 기준 DAC 포함 비교기(COMP), 온도 센서 통합, AES 가속기(GCM/GMAC, CCM/CBC-MAC, CBC, CTR)+보안 키 저장 내장; 패키지는 64-pin LQFP (PM), 48-pin LQFP (PT)/VQFN (RGZ), 32-pin VQFN (RHB), 28-pin VSSOP (DGS28)/WQFN-28 (RUY), 24-pin VQFN (RGE). MSPM0L1126 = 64KB flash / 12KB RAM; 동일 시리즈 MSPM0L1127 = 128KB flash / 12KB RAM. (동일 family datasheet는 LCD 컨트롤러 포함 자매품 MSPM0L2116/L2117도 수록, 본 항목 대상 외; L1126/L1127은 LCD 없음)',
        func: '저전력 모드: RUN 98µA/MHz(CoreMark), SLEEP 1.3mA@32MHz, STOP 403µA@4MHz, STANDBY 1.6µA(SRAM·레지스터 전체 유지), SHUTDOWN 81nA(I/O 웨이크 지원). 디지털 주변: 3채널 DMA, 15채널 이벤트 패브릭, 최대 8개 타이머로 최대 16계통 PWM 출력(그중 7개는 STANDBY 동작 가능): deadband 포함 16-bit 고급 타이머 1개(최고 64MHz), capture/compare 4조 포함 16-bit 범용 타이머 1개, capture/compare 각 2조의 16-bit 범용 타이머 2개, 16-bit 기본 타이머 4개; WWDT와 IWDT. 통신: 최대 3조 UART(1조는 LIN·IrDA·DALI·smart card·Manchester 지원), 최대 2조 I2C(SMBus/PMBus, STOP 모드 웨이크, 최고 FM+ 1Mbps), 최대 2조 SPI(최고 16Mbps). 클록: 내장 32MHz SYSOSC(−2.1%~1.6%), 내장 32kHz LFOSC(±3%), 외부 4MHz~32MHz HFXT, 외부 32kHz LFXT, 외부 저/고주파 디지털 클록 입력, 디지털 클록 출력. 데이터 무결성과 암호: CRC-16, AES 가속기, 보안 키 저장(256-bit×1 또는 128-bit×2 AES 키). I/O: 최대 60 GPIO, 그중 2개 5V 내압 오픈 드레인(48-VQFN RGZ에서는 실제 44 GPIO+NRST/VDD/VSS/VCORE 총 48핀). 개발: 2-pin SWD.',
        usedIn: '배터리 충방전 관리, 전원 공급과 전력 전송, 개인 전자제품, 빌딩 보안·방화, 커넥티드 주변기기와 프린터, 전력망 인프라, 스마트 미터, 통신 모듈, 의료·헬스케어 등 용도.',
        desc: 'Arm Cortex-M0+ MCU, 최고 32MHz / 64KB flash / 12KB SRAM, 12-bit 1.6Msps ADC(최대 26채널), AES 가속기+보안 키 저장, 동작 온도 −40°C~125°C, 48-VQFN (RGZ) 등 복수 패키지 선택 가능(LCD 없음; 동일 시리즈 L2116/L2117은 LCD 포함).',
        thermalPad: '노출 패드(datasheet 그림 6-2 48-pin RGZ 중앙에 Thermal Pad 표기), 보드 접지 플레인에 연결 필수.',
        specs: [
          { k: '코어', v: 'Arm 32-bit Cortex-M0+, MPU 포함, 최고 32MHz' },
          { k: '동작 온도', v: '−40°C ~ 125°C(datasheet에 AEC-Q100 차량 인증 표기 없음, -Q1 차량판 아님)' },
          { k: '전원 범위', v: '1.62V ~ 3.6V' },
          { k: '메모리', v: 'MSPM0L1126: 64KB flash(ECC) / 12KB SRAM(ECC 또는 parity)(동일 시리즈 MSPM0L1127: 128KB flash / 12KB SRAM)' },
          { k: 'ADC', v: '12-bit, 1.6Msps, 최대 26 외부 채널(패밀리 최대값; 48-VQFN RGZ의 실제 사용 가능 채널 수는 핀 표 참조)' },
          { k: '기준 전압', v: '설정 가능 1.4V 또는 2.5V 내부 공용 VREF' },
          { k: '비교기', v: 'COMP, 8-bit 기준 DAC 포함; 온도 센서 통합' },
          { k: '암호/보안', v: 'AES 가속기(GCM/GMAC, CCM/CBC-MAC, CBC, CTR); 보안 키 저장 1×256-bit 또는 2×128-bit AES 키; CRC-16' },
          { k: '저전력', v: 'RUN 98µA/MHz(CoreMark); SLEEP 1.3mA@32MHz; STOP 403µA@4MHz; STANDBY 1.6µA; SHUTDOWN 81nA(I/O 웨이크)' },
          { k: '통신', v: '최대 3×UART(1조 LIN/IrDA/DALI/smart card/Manchester 지원); 최대 2×I2C(SMBus/PMBus, 최고 FM+ 1Mbps); 최대 2×SPI(최고 16Mbps)' },
          { k: '클록', v: '내장 32MHz SYSOSC(−2.1%~1.6%); 내장 32kHz LFOSC(±3%); 외부 4~32MHz HFXT; 외부 32kHz LFXT' },
          { k: 'I/O', v: '최대 60 GPIO, 그중 2개 5V 내압 오픈 드레인; 48-VQFN (RGZ)에서는 44 GPIO+NRST/VDD/VSS/VCORE' },
          { k: '패키지 선택지', v: '64-pin LQFP (PM); 48-pin LQFP (PT)/VQFN (RGZ); 32-pin VQFN (RHB); 28-pin VSSOP (DGS28)/WQFN-28 (RUY); 24-pin VQFN (RGE)' },
          { k: '디버그', v: '2-pin SWD' },
          { k: '동일 시리즈 차이', v: 'MSPM0L2116/L2117은 LCD 컨트롤러 포함(최대 4x48/8x44 LCD), 본 항목의 L1126/L1127은 LCD 없음' }
        ],
        dropIn: [{ note: '동일 family datasheet(TI SLASFN5, md5 동일), Table 6-2 RGZ 48-VQFN pinout 완전 동일, 메모리만 다름: L1126=64KB flash/12KB RAM, L1127=128KB flash/12KB RAM' }]
      }
    }
  };
  Object.assign(window.IC_I18N, T);
})();
/* batch 12A: entries 144-149 */
(function () {
  var T = {
    'MSPM0L1127': {
      en: {
        subcategory: 'Arm Cortex-M0+ mixed-signal MCU (128KB flash / 12KB RAM, no LCD)',
        whatIs: 'Mixed-signal MCU: Arm 32-bit Cortex-M0+ core (with MPU, up to 32MHz), −40°C~125°C operation, 1.62V~3.6V supply, up to 128KB flash (with ECC) + 12KB SRAM (ECC or parity), built-in 12-bit 1.6Msps ADC (up to 26 external channels), a comparator (COMP) with 8-bit reference DAC, an integrated temperature sensor, an AES accelerator (GCM/GMAC, CCM/CBC-MAC, CBC, CTR) + secure key storage; packages include 64-pin LQFP (PM), 48-pin LQFP (PT)/VQFN (RGZ), 32-pin VQFN (RHB), 28-pin VSSOP (DGS28)/WQFN-28 (RUY), 24-pin VQFN (RGE). MSPM0L1127 = 128KB flash / 12KB RAM; the sibling MSPM0L1126 = 64KB flash / 12KB RAM. (The same family datasheet also covers the LCD-controller siblings MSPM0L2116/L2117 — not this entry; L1126/L1127 have no LCD.)',
        func: 'Low-power modes: RUN 98µA/MHz (CoreMark), SLEEP 1.3mA@32MHz, STOP 403µA@4MHz, STANDBY 1.6µA (full SRAM/register retention), SHUTDOWN 81nA (I/O wake). Digital peripherals: 3-channel DMA, 15-channel event fabric, up to 8 timers with up to 16 PWM outputs (7 of them operable in STANDBY): one 16-bit advanced timer with deadband (up to 64MHz), one 16-bit general timer with 4 capture/compares, two 16-bit general timers with 2 capture/compares each, four 16-bit basic timers; WWDT and IWDT watchdogs. Comms: up to 3× UART (one with LIN, IrDA, DALI, smart card, Manchester), up to 2× I2C (SMBus/PMBus, STOP-mode wake, up to FM+ 1Mbps), up to 2× SPI (up to 16Mbps). Clocking: built-in 32MHz SYSOSC (−2.1%~1.6%), built-in 32kHz LFOSC (±3%), external 4MHz~32MHz HFXT, external 32kHz LFXT, external LF/HF digital clock inputs, digital clock output. Data integrity & crypto: CRC-16, AES accelerator, secure key storage (one 256-bit or two 128-bit AES keys). I/O: up to 60 GPIOs, 2 of them 5V-tolerant open-drain (on the 48-VQFN RGZ: 44 usable GPIOs + NRST/VDD/VSS/VCORE = 48 pins). Development: 2-pin SWD.',
        usedIn: 'Battery charge/discharge management, power supplies and power delivery, personal electronics, building security and fire safety, connected peripherals and printers, grid infrastructure, smart meters, communication modules, medical and healthcare.',
        desc: 'Arm Cortex-M0+ MCU, up to 32MHz / 128KB flash / 12KB SRAM, 12-bit 1.6Msps ADC (up to 26 channels), AES accelerator + secure key storage, −40°C~125°C, multiple packages incl. 48-VQFN (RGZ) (no LCD; the L2116/L2117 siblings have LCD).',
        thermalPad: 'Exposed pad (datasheet Figure 6-2 48-pin RGZ marks the center Thermal Pad), must connect to the board ground plane.',
        specs: [
          { k: 'Core', v: 'Arm 32-bit Cortex-M0+ with MPU, up to 32MHz' },
          { k: 'Operating temperature', v: '−40°C ~ 125°C (the datasheet does not mark AEC-Q100 — not the -Q1 automotive version)' },
          { k: 'Supply range', v: '1.62V ~ 3.6V' },
          { k: 'Memory', v: 'MSPM0L1127: 128KB flash (ECC) / 12KB SRAM (ECC or parity) (sibling MSPM0L1126: 64KB flash / 12KB RAM)' },
          { k: 'ADC', v: '12-bit, 1.6Msps, up to 26 external channels (family max; actual channels on 48-VQFN RGZ per the pin table)' },
          { k: 'Reference', v: 'configurable 1.4V or 2.5V internal shared VREF' },
          { k: 'Comparator', v: 'COMP with 8-bit reference DAC; integrated temperature sensor' },
          { k: 'Crypto/security', v: 'AES accelerator (GCM/GMAC, CCM/CBC-MAC, CBC, CTR); secure key storage 1×256-bit or 2×128-bit AES keys; CRC-16' },
          { k: 'Low power', v: 'RUN 98µA/MHz (CoreMark); SLEEP 1.3mA@32MHz; STOP 403µA@4MHz; STANDBY 1.6µA; SHUTDOWN 81nA (I/O wake)' },
          { k: 'Comms', v: 'up to 3×UART (one with LIN/IrDA/DALI/smart card/Manchester); up to 2×I2C (SMBus/PMBus, up to FM+ 1Mbps); up to 2×SPI (up to 16Mbps)' },
          { k: 'Clocking', v: 'built-in 32MHz SYSOSC (−2.1%~1.6%); built-in 32kHz LFOSC (±3%); external 4~32MHz HFXT; external 32kHz LFXT' },
          { k: 'I/O', v: 'up to 60 GPIOs, 2 of them 5V-tolerant open-drain; on 48-VQFN (RGZ): 44 GPIOs + NRST/VDD/VSS/VCORE' },
          { k: 'Package options', v: '64-pin LQFP (PM); 48-pin LQFP (PT)/VQFN (RGZ); 32-pin VQFN (RHB); 28-pin VSSOP (DGS28)/WQFN-28 (RUY); 24-pin VQFN (RGE)' },
          { k: 'Debug', v: '2-pin SWD' },
          { k: 'Family differences', v: 'MSPM0L2116/L2117 add an LCD controller (up to 4x48/8x44 LCD); this entry’s L1126/L1127 have no LCD' }
        ],
        dropIn: [{ note: 'Same family datasheet (TI SLASFN5, same md5), identical Table 6-2 RGZ 48-VQFN pinout; only memory differs: L1127=128KB flash/12KB RAM, L1126=64KB flash/12KB RAM' }]
      },
      ja: {
        subcategory: 'Arm Cortex-M0+ 混合信号 MCU（128KB flash／12KB RAM・LCD なし）',
        whatIs: '混合信号 MCU：Arm 32-bit Cortex-M0+ コア（MPU 付、最高 32MHz）、動作温度 −40°C~125°C、電源範囲 1.62V~3.6V、最大 128KB flash（ECC 付）＋12KB SRAM（ECC または parity）、12-bit 1.6Msps ADC（最大 26 外部チャネル）、8-bit 基準 DAC 付コンパレータ（COMP）、温度センサ統合、AES アクセラレータ（GCM/GMAC、CCM/CBC-MAC、CBC、CTR）＋セキュア鍵ストレージ内蔵；パッケージは 64-pin LQFP (PM)、48-pin LQFP (PT)／VQFN (RGZ)、32-pin VQFN (RHB)、28-pin VSSOP (DGS28)／WQFN-28 (RUY)、24-pin VQFN (RGE)。MSPM0L1127＝128KB flash／12KB RAM；同シリーズ MSPM0L1126＝64KB flash／12KB RAM。（同一 family datasheet は LCD コントローラ付の姉妹品 MSPM0L2116／L2117 も収録、本条目対象外；L1126/L1127 は LCD なし）',
        func: '低消費電力モード：RUN 98µA/MHz（CoreMark）、SLEEP 1.3mA@32MHz、STOP 403µA@4MHz、STANDBY 1.6µA（SRAM とレジスタ全保持）、SHUTDOWN 81nA（I/O ウェイク対応）。デジタル周辺：3 チャネル DMA、15 チャネルイベントファブリック、最大 8 個のタイマで最大 16 系統 PWM 出力（うち 7 個は STANDBY 動作可）：deadband 付 16-bit 先進タイマ 1 個（最高 64MHz）、capture/compare 4 組付 16-bit 汎用タイマ 1 個、capture/compare 各 2 組の 16-bit 汎用タイマ 2 個、16-bit 基本タイマ 4 個；WWDT と IWDT。通信：最大 3 組 UART（1 組は LIN・IrDA・DALI・smart card・Manchester 対応）、最大 2 組 I2C（SMBus/PMBus、STOP モードウェイク、最高 FM+ 1Mbps）、最大 2 組 SPI（最高 16Mbps）。クロック：内蔵 32MHz SYSOSC（−2.1%~1.6%）、内蔵 32kHz LFOSC（±3%）、外部 4MHz~32MHz HFXT、外部 32kHz LFXT、外部低/高周波デジタルクロック入力、デジタルクロック出力。データ完全性と暗号：CRC-16、AES アクセラレータ、セキュア鍵ストレージ（256-bit×1 または 128-bit×2 AES 鍵）。I/O：最大 60 GPIO、うち 2 個 5V 耐圧オープンドレイン（48-VQFN RGZ では実際 44 GPIO＋NRST/VDD/VSS/VCORE の計 48 ピン）。開発：2-pin SWD。',
        usedIn: '電池充放電管理、電源供給と電力伝送、パーソナル電子機器、ビルセキュリティ・防火、コネクテッド周辺機器とプリンタ、電力網インフラ、スマートメータ、通信モジュール、医療・ヘルスケア等の用途。',
        desc: 'Arm Cortex-M0+ MCU、最高 32MHz／128KB flash／12KB SRAM、12-bit 1.6Msps ADC（最大 26 チャネル）、AES アクセラレータ＋セキュア鍵ストレージ、動作温度 −40°C~125°C、48-VQFN (RGZ) 等の複数パッケージ選択可（LCD なし；同シリーズ L2116/L2117 は LCD 付）。',
        thermalPad: '露出パッド（datasheet 図 6-2 48-pin RGZ 中央に Thermal Pad 表記）、基板接地プレーンに接続必須。',
        specs: [
          { k: 'コア', v: 'Arm 32-bit Cortex-M0+、MPU 付、最高 32MHz' },
          { k: '動作温度', v: '−40°C ~ 125°C（datasheet に AEC-Q100 車載認証表記なし、-Q1 車載版でない）' },
          { k: '電源範囲', v: '1.62V ~ 3.6V' },
          { k: 'メモリ', v: 'MSPM0L1127：128KB flash（ECC）／12KB SRAM（ECC または parity）（同シリーズ MSPM0L1126：64KB flash／12KB RAM）' },
          { k: 'ADC', v: '12-bit、1.6Msps、最大 26 外部チャネル（ファミリ最大値；48-VQFN RGZ の実際の使用可能チャネル数はピン表参照）' },
          { k: '基準電圧', v: '設定可能 1.4V または 2.5V 内部共用 VREF' },
          { k: 'コンパレータ', v: 'COMP、8-bit 基準 DAC 付；温度センサ統合' },
          { k: '暗号/セキュリティ', v: 'AES アクセラレータ（GCM/GMAC、CCM/CBC-MAC、CBC、CTR）；セキュア鍵ストレージ 1×256-bit または 2×128-bit AES 鍵；CRC-16' },
          { k: '低消費電力', v: 'RUN 98µA/MHz（CoreMark）；SLEEP 1.3mA@32MHz；STOP 403µA@4MHz；STANDBY 1.6µA；SHUTDOWN 81nA（I/O ウェイク）' },
          { k: '通信', v: '最大 3×UART（1 組 LIN/IrDA/DALI/smart card/Manchester 対応）；最大 2×I2C（SMBus/PMBus、最高 FM+ 1Mbps）；最大 2×SPI（最高 16Mbps）' },
          { k: 'クロック', v: '内蔵 32MHz SYSOSC（−2.1%~1.6%）；内蔵 32kHz LFOSC（±3%）；外部 4~32MHz HFXT；外部 32kHz LFXT' },
          { k: 'I/O', v: '最大 60 GPIO、うち 2 個 5V 耐圧オープンドレイン；48-VQFN (RGZ) では 44 GPIO＋NRST/VDD/VSS/VCORE' },
          { k: 'パッケージ選択肢', v: '64-pin LQFP (PM)；48-pin LQFP (PT)／VQFN (RGZ)；32-pin VQFN (RHB)；28-pin VSSOP (DGS28)／WQFN-28 (RUY)；24-pin VQFN (RGE)' },
          { k: 'デバッグ', v: '2-pin SWD' },
          { k: '同シリーズ差異', v: 'MSPM0L2116/L2117 は LCD コントローラ付（最大 4x48／8x44 LCD）、本条目の L1126/L1127 は LCD なし' }
        ],
        dropIn: [{ note: '同一 family datasheet（TI SLASFN5、md5 同一）、Table 6-2 RGZ 48-VQFN pinout 完全同一、メモリのみ異なる：L1127=128KB flash／12KB RAM、L1126=64KB flash／12KB RAM' }]
      },
      ko: {
        subcategory: 'Arm Cortex-M0+ 혼합 신호 MCU(128KB flash / 12KB RAM·LCD 없음)',
        whatIs: '혼합 신호 MCU: Arm 32-bit Cortex-M0+ 코어(MPU 포함, 최고 32MHz), 동작 온도 −40°C~125°C, 전원 범위 1.62V~3.6V, 최대 128KB flash(ECC 포함)+12KB SRAM(ECC 또는 parity), 12-bit 1.6Msps ADC(최대 26 외부 채널), 8-bit 기준 DAC 포함 비교기(COMP), 온도 센서 통합, AES 가속기(GCM/GMAC, CCM/CBC-MAC, CBC, CTR)+보안 키 저장 내장; 패키지는 64-pin LQFP (PM), 48-pin LQFP (PT)/VQFN (RGZ), 32-pin VQFN (RHB), 28-pin VSSOP (DGS28)/WQFN-28 (RUY), 24-pin VQFN (RGE). MSPM0L1127 = 128KB flash / 12KB RAM; 동일 시리즈 MSPM0L1126 = 64KB flash / 12KB RAM. (동일 family datasheet는 LCD 컨트롤러 포함 자매품 MSPM0L2116/L2117도 수록, 본 항목 대상 외; L1126/L1127은 LCD 없음)',
        func: '저전력 모드: RUN 98µA/MHz(CoreMark), SLEEP 1.3mA@32MHz, STOP 403µA@4MHz, STANDBY 1.6µA(SRAM·레지스터 전체 유지), SHUTDOWN 81nA(I/O 웨이크 지원). 디지털 주변: 3채널 DMA, 15채널 이벤트 패브릭, 최대 8개 타이머로 최대 16계통 PWM 출력(그중 7개는 STANDBY 동작 가능): deadband 포함 16-bit 고급 타이머 1개(최고 64MHz), capture/compare 4조 포함 16-bit 범용 타이머 1개, capture/compare 각 2조의 16-bit 범용 타이머 2개, 16-bit 기본 타이머 4개; WWDT와 IWDT. 통신: 최대 3조 UART(1조는 LIN·IrDA·DALI·smart card·Manchester 지원), 최대 2조 I2C(SMBus/PMBus, STOP 모드 웨이크, 최고 FM+ 1Mbps), 최대 2조 SPI(최고 16Mbps). 클록: 내장 32MHz SYSOSC(−2.1%~1.6%), 내장 32kHz LFOSC(±3%), 외부 4MHz~32MHz HFXT, 외부 32kHz LFXT, 외부 저/고주파 디지털 클록 입력, 디지털 클록 출력. 데이터 무결성과 암호: CRC-16, AES 가속기, 보안 키 저장(256-bit×1 또는 128-bit×2 AES 키). I/O: 최대 60 GPIO, 그중 2개 5V 내압 오픈 드레인(48-VQFN RGZ에서는 실제 44 GPIO+NRST/VDD/VSS/VCORE 총 48핀). 개발: 2-pin SWD.',
        usedIn: '배터리 충방전 관리, 전원 공급과 전력 전송, 개인 전자제품, 빌딩 보안·방화, 커넥티드 주변기기와 프린터, 전력망 인프라, 스마트 미터, 통신 모듈, 의료·헬스케어 등 용도.',
        desc: 'Arm Cortex-M0+ MCU, 최고 32MHz / 128KB flash / 12KB SRAM, 12-bit 1.6Msps ADC(최대 26채널), AES 가속기+보안 키 저장, 동작 온도 −40°C~125°C, 48-VQFN (RGZ) 등 복수 패키지 선택 가능(LCD 없음; 동일 시리즈 L2116/L2117은 LCD 포함).',
        thermalPad: '노출 패드(datasheet 그림 6-2 48-pin RGZ 중앙에 Thermal Pad 표기), 보드 접지 플레인에 연결 필수.',
        specs: [
          { k: '코어', v: 'Arm 32-bit Cortex-M0+, MPU 포함, 최고 32MHz' },
          { k: '동작 온도', v: '−40°C ~ 125°C(datasheet에 AEC-Q100 차량 인증 표기 없음, -Q1 차량판 아님)' },
          { k: '전원 범위', v: '1.62V ~ 3.6V' },
          { k: '메모리', v: 'MSPM0L1127: 128KB flash(ECC) / 12KB SRAM(ECC 또는 parity)(동일 시리즈 MSPM0L1126: 64KB flash / 12KB RAM)' },
          { k: 'ADC', v: '12-bit, 1.6Msps, 최대 26 외부 채널(패밀리 최대값; 48-VQFN RGZ의 실제 사용 가능 채널 수는 핀 표 참조)' },
          { k: '기준 전압', v: '설정 가능 1.4V 또는 2.5V 내부 공용 VREF' },
          { k: '비교기', v: 'COMP, 8-bit 기준 DAC 포함; 온도 센서 통합' },
          { k: '암호/보안', v: 'AES 가속기(GCM/GMAC, CCM/CBC-MAC, CBC, CTR); 보안 키 저장 1×256-bit 또는 2×128-bit AES 키; CRC-16' },
          { k: '저전력', v: 'RUN 98µA/MHz(CoreMark); SLEEP 1.3mA@32MHz; STOP 403µA@4MHz; STANDBY 1.6µA; SHUTDOWN 81nA(I/O 웨이크)' },
          { k: '통신', v: '최대 3×UART(1조 LIN/IrDA/DALI/smart card/Manchester 지원); 최대 2×I2C(SMBus/PMBus, 최고 FM+ 1Mbps); 최대 2×SPI(최고 16Mbps)' },
          { k: '클록', v: '내장 32MHz SYSOSC(−2.1%~1.6%); 내장 32kHz LFOSC(±3%); 외부 4~32MHz HFXT; 외부 32kHz LFXT' },
          { k: 'I/O', v: '최대 60 GPIO, 그중 2개 5V 내압 오픈 드레인; 48-VQFN (RGZ)에서는 44 GPIO+NRST/VDD/VSS/VCORE' },
          { k: '패키지 선택지', v: '64-pin LQFP (PM); 48-pin LQFP (PT)/VQFN (RGZ); 32-pin VQFN (RHB); 28-pin VSSOP (DGS28)/WQFN-28 (RUY); 24-pin VQFN (RGE)' },
          { k: '디버그', v: '2-pin SWD' },
          { k: '동일 시리즈 차이', v: 'MSPM0L2116/L2117은 LCD 컨트롤러 포함(최대 4x48/8x44 LCD), 본 항목의 L1126/L1127은 LCD 없음' }
        ],
        dropIn: [{ note: '동일 family datasheet(TI SLASFN5, md5 동일), Table 6-2 RGZ 48-VQFN pinout 완전 동일, 메모리만 다름: L1127=128KB flash/12KB RAM, L1126=64KB flash/12KB RAM' }]
      }
    },
    'ADC3683-EP': {
      en: {
        subcategory: 'Low-noise low-power dual-channel 18-bit ADC (65MSPS)',
        whatIs: 'Low-noise, low-power 18-bit dual-channel analog-to-digital converter (ADC), 65MSPS sample rate, serial LVDS digital interface, targeting space/defense high-reliability applications; the -EP suffix means TI Enhanced Product (hardened process and quality controls) and is unrelated to the package exposed pad. It shares one Pin Functions table with the radiation-tolerant -SEP sibling; this entry covers only the -EP general enhanced version.',
        func: 'Dual differential analog inputs (AINP/AINM, BINP/BINM); VCM provides a 0.95V common-mode output; VREF accepts an external 1.6V reference with REFGND as reference ground; CLKP/CLKM are the differential sampling-clock inputs. The serial LVDS output supports configurable 2-wire / 1-wire / 1/2-wire modes, with 2 data lanes per channel (DA0/DA1, DB0/DB1), a data bit clock output (DCLKP/M) and a frame clock output (FCLKP/M), plus an LVDS bit-clock input (DCLKINP/M, built-in 100Ω termination) for external clock sync. A built-in optional DSP (2/4/8/16/32× decimation, 32-bit NCO, bypassable). SPI-compatible serial interface (SCLK/SDIO/{SEN}) for register config; PDN/SYNC for power-down or multi-chip sync (active-high); RESET is a hardware reset (active-high); REFBUF/CTRL sets the default clock type and reference source at power-up.',
        usedIn: 'Satellite optical-communication payloads, satellite imaging payloads, satellite communication payloads, satellite RADAR/LIDAR payloads and other high-speed control loops and signal-acquisition systems.',
        desc: 'Low-noise low-power dual-channel 18-bit ADC, 65MSPS, noise floor -160dBFS/Hz, 94mW/ch, 1-2 clock-cycle latency, serial LVDS interface, 40-VQFN 5×5mm, -55°C~105°C (Enhanced Product).',
        thermalPad: 'Exposed PowerPAD = GND (datasheet Figure 4-1 marks the center Thermal Pad; Table 4-1 GND row notes PowerPAD), must connect to the board ground plane.',
        specs: [
          { k: 'Resolution', v: '18-bit (no missing codes)' },
          { k: 'Sample rate', v: 'dual-channel 65 MSPS' },
          { k: 'Noise floor', v: '-160 dBFS/Hz' },
          { k: 'Power', v: '94 mW/ch (at 65MSPS)' },
          { k: 'Latency', v: '1-2 clock cycles' },
          { k: 'INL/DNL', v: 'INL: ±7 LSB, DNL: ±0.7 LSB (typical)' },
          { k: 'Reference', v: 'external or internal selectable' },
          { k: 'Digital interface', v: 'serial LVDS (2-wire / 1-wire / 1/2-wire selectable)' },
          { k: 'Spectral performance (fIN=5MHz)', v: 'SNR 83.8dBFS; SFDR 89dBc (HD2/HD3); SFDR 101dBFS (worst spur)' },
          { k: 'Package', v: '40-QFN 5×5mm' },
          { k: 'Temperature range', v: '-55°C ~ 105°C (Enhanced Product)' }
        ]
      },
      ja: {
        subcategory: '低雑音低消費電力 2 チャネル 18-bit ADC（65MSPS）',
        whatIs: '低雑音・低消費電力の 18-bit 2 チャネル A/D コンバータ（ADC）、65MSPS サンプルレート、シリアル LVDS デジタルインタフェース、宇宙/防衛等の高信頼用途向け；型番末尾の -EP は TI Enhanced Product（強化プロセスと品質管理）でパッケージの露出パッド（exposed pad）とは無関係。耐放射線版 -SEP と同一の Pin Functions 表を共有、本条目は -EP 一般強化版のみ収録。',
        func: '2 チャネル差動アナログ入力（AINP/AINM、BINP/BINM）、VCM が 0.95V コモンモード電圧出力、VREF は外部 1.6V 参照接続可・REFGND は参照グランド；CLKP/CLKM は差動サンプリングクロック入力。シリアル LVDS デジタル出力は 2 線／1 線／1/2 線設定可モード対応、各チャネル 2 データ lane（DA0/DA1、DB0/DB1）、データビットクロック出力（DCLKP/M）とフレームクロック出力（FCLKP/M）、LVDS ビットクロック入力（DCLKINP/M、内蔵 100Ω 終端）で外部クロック同期可。内蔵の選択式 DSP（2/4/8/16/32 倍デシメーション、32-bit NCO、バイパス可）。SPI 互換シリアルインタフェース（SCLK/SDIO/{SEN}）でレジスタ設定；PDN/SYNC で電源遮断または複数チップ同期（ハイ動作）；RESET はハードウェアリセット（ハイ動作）；REFBUF/CTRL が起動時にデフォルトクロック形態と参照源を設定。',
        usedIn: '衛星光通信ペイロード、衛星撮像ペイロード、衛星通信ペイロード、衛星レーダ/ライダ（RADAR/LIDAR）ペイロード等の高速制御ループと信号収集システム。',
        desc: '低雑音低消費電力 2 チャネル 18-bit ADC、65MSPS、雑音フロア -160dBFS/Hz、94mW/ch、遅延 1-2 クロックサイクル、シリアル LVDS インタフェース、40-VQFN 5×5mm、-55°C~105°C（Enhanced Product）。',
        thermalPad: '露出 PowerPAD=GND（datasheet 図 4-1 中央に Thermal Pad 表記、Table 4-1 GND 行に PowerPAD 注記）、基板接地プレーンに接続必須。',
        specs: [
          { k: '分解能', v: '18-bit（no missing codes）' },
          { k: 'サンプルレート', v: '2 チャネル 65 MSPS' },
          { k: '雑音フロア', v: '-160 dBFS/Hz' },
          { k: '消費電力', v: '94 mW/ch（65MSPS 時）' },
          { k: '遅延', v: '1-2 クロックサイクル' },
          { k: 'INL/DNL', v: 'INL: ±7 LSB、DNL: ±0.7 LSB（typical）' },
          { k: '参照電圧', v: '外部または内部選択可' },
          { k: 'デジタルインタフェース', v: 'シリアル LVDS（2-wire／1-wire／1/2-wire 選択可）' },
          { k: 'スペクトル性能（fIN=5MHz）', v: 'SNR 83.8dBFS；SFDR 89dBc（HD2/HD3）；SFDR 101dBFS（最悪スプリアス）' },
          { k: 'パッケージ', v: '40-QFN 5×5mm' },
          { k: '温度範囲', v: '-55°C ~ 105°C（Enhanced Product）' }
        ]
      },
      ko: {
        subcategory: '저잡음 저전력 2채널 18-bit ADC(65MSPS)',
        whatIs: '저잡음·저전력 18-bit 2채널 아날로그-디지털 변환기(ADC), 65MSPS 샘플레이트, 시리얼 LVDS 디지털 인터페이스, 우주/방위 등 고신뢰 용도 대상; 부품 번호 끝 -EP는 TI Enhanced Product(강화 공정과 품질 관리)로 패키지 노출 패드(exposed pad)와 무관. 내방사선판 -SEP와 동일한 Pin Functions 표를 공유, 본 항목은 -EP 일반 강화판만 수록.',
        func: '2채널 차동 아날로그 입력(AINP/AINM, BINP/BINM), VCM이 0.95V 공통 모드 전압 출력, VREF는 외부 1.6V 참조 연결 가능·REFGND는 참조 접지; CLKP/CLKM은 차동 샘플링 클록 입력. 시리얼 LVDS 디지털 출력은 2선/1선/1/2선 설정 가능 모드 지원, 각 채널 2 데이터 lane(DA0/DA1, DB0/DB1), 데이터 비트 클록 출력(DCLKP/M)과 프레임 클록 출력(FCLKP/M), LVDS 비트 클록 입력(DCLKINP/M, 내장 100Ω 종단)으로 외부 클록 동기 가능. 내장 선택식 DSP(2/4/8/16/32배 데시메이션, 32-bit NCO, 바이패스 가능). SPI 호환 시리얼 인터페이스(SCLK/SDIO/{SEN})로 레지스터 설정; PDN/SYNC로 전원 차단 또는 복수 칩 동기(하이 동작); RESET은 하드웨어 리셋(하이 동작); REFBUF/CTRL이 전원 인가 시 기본 클록 형태와 참조원 설정.',
        usedIn: '위성 광통신 페이로드, 위성 이미징 페이로드, 위성 통신 페이로드, 위성 레이더/라이다(RADAR/LIDAR) 페이로드 등 고속 제어 루프와 신호 수집 시스템.',
        desc: '저잡음 저전력 2채널 18-bit ADC, 65MSPS, 잡음 바닥 -160dBFS/Hz, 94mW/ch, 지연 1-2 클록 사이클, 시리얼 LVDS 인터페이스, 40-VQFN 5×5mm, -55°C~105°C(Enhanced Product).',
        thermalPad: '노출 PowerPAD=GND(datasheet 그림 4-1 중앙에 Thermal Pad 표기, Table 4-1 GND 행에 PowerPAD 주석), 보드 접지 플레인에 연결 필수.',
        specs: [
          { k: '분해능', v: '18-bit(no missing codes)' },
          { k: '샘플레이트', v: '2채널 65 MSPS' },
          { k: '잡음 바닥', v: '-160 dBFS/Hz' },
          { k: '소비 전력', v: '94 mW/ch(65MSPS 시)' },
          { k: '지연', v: '1-2 클록 사이클' },
          { k: 'INL/DNL', v: 'INL: ±7 LSB, DNL: ±0.7 LSB(typical)' },
          { k: '참조 전압', v: '외부 또는 내부 선택 가능' },
          { k: '디지털 인터페이스', v: '시리얼 LVDS(2-wire/1-wire/1/2-wire 선택 가능)' },
          { k: '스펙트럼 성능(fIN=5MHz)', v: 'SNR 83.8dBFS; SFDR 89dBc(HD2/HD3); SFDR 101dBFS(최악 스퓨리어스)' },
          { k: '패키지', v: '40-QFN 5×5mm' },
          { k: '온도 범위', v: '-55°C ~ 105°C(Enhanced Product)' }
        ]
      }
    },
    'ADS125H18': {
      en: {
        subcategory: 'High-voltage-input multiplexed 8/16-channel 24-bit Delta-Sigma ADC',
        whatIs: 'High-voltage-input multiplexed 8/16-channel, 24-bit Delta-Sigma ADC with data rates up to 1.067MSPS; each input front end contains a high-impedance precision resistor-divider network that steps high-voltage inputs directly down to the ADC input range with no external attenuation circuitry — suited to industrial high-voltage analog measurement.',
        func: 'The analog multiplexer supports 17 independently selectable inputs (up to 8 fully differential or 16 single-ended, AIN0~AIN15); both the input buffer and reference buffer are rail-to-rail; RESP/RESN connect the front-end resistor-divider network’s positive/negative ends. The built-in reference outputs a selectable 2.5V or 4.096V (REFOUT); REFP/TDACOUT serves as the positive reference input or test-DAC output, REFN is the negative reference input. It has a channel auto-sequencer with FIFO buffering, fault detection and system-monitoring circuits; 4 adjustable speed modes trade data rate, resolution and power; at ≤25SPS it rejects 50Hz/60Hz simultaneously. SPI serial interface (SCLK/SDI/SDO-{DRDY}/{CS}) for control and readout, {RESET} for hardware reset; GPIO0~3 multiplex as START (conversion start), CLKIN (external clock), FAULT (fault output), etc.',
        usedIn: 'Factory automation and control (condition monitoring, analog input modules), test & measurement (DAQ, semiconductor test equipment) — industrial measurement systems that accept high-voltage analog signals directly.',
        desc: 'High-voltage-input multiplexed 8/16-channel 24-bit Delta-Sigma ADC, 1.067MSPS, built-in precision resistor-divider network, 17 selectable inputs, internal 25.6MHz 1% oscillator, 36-VQFN 5×5mm, -40°C~125°C.',
        thermalPad: 'Exposed thermal pad (explicitly listed in Table 4-1); connect to AVSS.',
        specs: [
          { k: 'Data rate', v: 'programmable, up to 1.067MSPS' },
          { k: 'Input mux', v: '17 independently selectable inputs, up to 8 fully differential or 16 single-ended' },
          { k: 'Input front end', v: 'high-impedance voltage-divider network with built-in precision matched resistors' },
          { k: 'Buffers', v: 'rail-to-rail analog-input and reference buffers' },
          { k: 'Internal reference', v: 'selectable 2.5V or 4.096V output' },
          { k: 'Oscillator', v: 'internal 25.6MHz, 1% accuracy' },
          { k: 'Sequencing/buffering', v: 'channel auto-sequencer + FIFO buffer' },
          { k: 'Noise rejection', v: 'simultaneous 50Hz and 60Hz rejection at ≤25SPS' },
          { k: 'Speed modes', v: 'four adjustable speed modes' },
          { k: 'Package', v: '36-VQFN 5.00×5.00mm, EP=AVSS' },
          { k: 'Temperature range', v: '-40°C ~ 125°C' }
        ]
      },
      ja: {
        subcategory: '高圧入力マルチプレクス 8/16 チャネル 24-bit Delta-Sigma ADC',
        whatIs: '高圧入力マルチプレクス型 8/16 チャネル・24-bit Delta-Sigma ADC、データレート最高 1.067MSPS；各入力フロントエンドに高インピーダンス精密抵抗分圧ネットワークを内蔵し、高電圧入力を ADC 入力範囲へ直接降圧、外部降圧回路不要——産業用高圧アナログ信号計測に好適。',
        func: 'アナログマルチプレクサは 17 系統の独立選択可能入力（最大 8 全差動または 16 シングルエンド、AIN0~AIN15）対応、入力バッファと参照バッファはともにレールツーレール；RESP/RESN はフロントエンド抵抗分圧ネットワークの正負端接続。内蔵電圧参照は 2.5V または 4.096V 出力選択可（REFOUT）、REFP/TDACOUT は正参照入力またはテスト DAC 出力、REFN は負参照入力。チャネル自動シーケンサと FIFO バッファ、故障検出とシステム監視回路を内蔵；4 組の可変速度モードでデータレート・分解能・消費電力をトレードオフ；≤25SPS で 50Hz/60Hz を同時除去。SPI シリアルインタフェース（SCLK/SDI/SDO-{DRDY}/{CS}）で制御とデータ読出し、{RESET} はハードウェアリセット；GPIO0~3 は START（変換開始）、CLKIN（外部クロック）、FAULT（故障出力）等の専用機能に多重化可。',
        usedIn: '工場自動化と制御（状態監視、アナログ入力モジュール）、テスト計測（DAQ、半導体試験装置）等、高圧アナログ信号を直接受ける産業計測システム。',
        desc: '高圧入力マルチプレクス 8/16 チャネル 24-bit Delta-Sigma ADC、1.067MSPS、精密抵抗分圧ネットワーク内蔵、17 系統選択可能入力、内部 25.6MHz 1% 発振器、36-VQFN 5×5mm、-40°C~125°C。',
        thermalPad: '露出放熱パッド（Table 4-1 に Thermal Pad 列明記）；AVSS 接続。',
        specs: [
          { k: 'データレート', v: 'プログラマブル、最高 1.067MSPS' },
          { k: '入力マルチプレクス', v: '17 系統独立選択可能入力、最大 8 全差動または 16 シングルエンド' },
          { k: '入力フロントエンド', v: '高インピーダンス電圧分圧ネットワーク、精密整合抵抗内蔵' },
          { k: 'バッファ', v: 'アナログ入力バッファと参照バッファはレールツーレール' },
          { k: '内部参照', v: '2.5V または 4.096V 出力選択可' },
          { k: '発振器', v: '内部 25.6MHz、精度 1%' },
          { k: 'シーケンスとバッファ', v: 'チャネル自動シーケンサ＋FIFO バッファ' },
          { k: '雑音除去', v: '≤25SPS で 50Hz と 60Hz を同時除去' },
          { k: '速度モード', v: '4 組の可変速度モード' },
          { k: 'パッケージ', v: '36-VQFN 5.00×5.00mm、EP=AVSS' },
          { k: '温度範囲', v: '-40°C ~ 125°C' }
        ]
      },
      ko: {
        subcategory: '고압 입력 멀티플렉스 8/16채널 24-bit Delta-Sigma ADC',
        whatIs: '고압 입력 멀티플렉스형 8/16채널·24-bit Delta-Sigma ADC, 데이터 속도 최고 1.067MSPS; 각 입력 프론트엔드에 고임피던스 정밀 저항 분압 네트워크를 내장해 고전압 입력을 ADC 입력 범위로 직접 강압, 외부 강압 회로 불필요 - 산업용 고압 아날로그 신호 계측에 적합.',
        func: '아날로그 멀티플렉서는 17계통 독립 선택 가능 입력(최대 8 전차동 또는 16 싱글엔드, AIN0~AIN15) 지원, 입력 버퍼와 참조 버퍼 모두 레일투레일; RESP/RESN은 프론트엔드 저항 분압 네트워크의 정·부 단 연결. 내장 전압 참조는 2.5V 또는 4.096V 출력 선택 가능(REFOUT), REFP/TDACOUT은 정참조 입력 또는 테스트 DAC 출력, REFN은 부참조 입력. 채널 자동 시퀀서와 FIFO 버퍼, 고장 감지와 시스템 감시 회로 내장; 4조 가변 속도 모드로 데이터 속도·분해능·소비 전력 트레이드오프; ≤25SPS에서 50Hz/60Hz 동시 제거. SPI 시리얼 인터페이스(SCLK/SDI/SDO-{DRDY}/{CS})로 제어와 데이터 읽기, {RESET}은 하드웨어 리셋; GPIO0~3은 START(변환 시작), CLKIN(외부 클록), FAULT(고장 출력) 등 전용 기능으로 다중화 가능.',
        usedIn: '공장 자동화와 제어(상태 감시, 아날로그 입력 모듈), 테스트 계측(DAQ, 반도체 시험 장비) 등 고압 아날로그 신호를 직접 받는 산업 계측 시스템.',
        desc: '고압 입력 멀티플렉스 8/16채널 24-bit Delta-Sigma ADC, 1.067MSPS, 정밀 저항 분압 네트워크 내장, 17계통 선택 가능 입력, 내부 25.6MHz 1% 발진기, 36-VQFN 5×5mm, -40°C~125°C.',
        thermalPad: '노출 방열 패드(Table 4-1에 Thermal Pad 행 명기); AVSS 연결.',
        specs: [
          { k: '데이터 속도', v: '프로그래머블, 최고 1.067MSPS' },
          { k: '입력 멀티플렉스', v: '17계통 독립 선택 가능 입력, 최대 8 전차동 또는 16 싱글엔드' },
          { k: '입력 프론트엔드', v: '고임피던스 전압 분압 네트워크, 정밀 정합 저항 내장' },
          { k: '버퍼', v: '아날로그 입력 버퍼와 참조 버퍼 모두 레일투레일' },
          { k: '내부 참조', v: '2.5V 또는 4.096V 출력 선택 가능' },
          { k: '발진기', v: '내부 25.6MHz, 정확도 1%' },
          { k: '시퀀싱과 버퍼', v: '채널 자동 시퀀서+FIFO 버퍼' },
          { k: '잡음 제거', v: '≤25SPS에서 50Hz와 60Hz 동시 제거' },
          { k: '속도 모드', v: '4조 가변 속도 모드' },
          { k: '패키지', v: '36-VQFN 5.00×5.00mm, EP=AVSS' },
          { k: '온도 범위', v: '-40°C ~ 125°C' }
        ]
      }
    },
    'ADS125P08': {
      en: {
        subcategory: 'Multiplexed 8/16-channel 24-bit Delta-Sigma ADC (CRC data validation)',
        whatIs: 'Multiplexed 8/16-channel, 24-bit Delta-Sigma ADC with data rates up to 1.067MSPS; built-in high-impedance input and reference buffers reduce signal loading; I/O data and register settings carry cyclic-redundancy-check (CRC) validation for operational reliability — suited to factory automation, patient monitoring, etc. Same package and pin base as the ADS125H18 but without the high-voltage resistor-divider front end; AIN8~15 can instead be repurposed as analog general-purpose I/O (AGPIO).',
        func: 'The analog multiplexer supports 17 independently selectable inputs (up to 8 fully differential or 16 single-ended, AIN0~AIN15), with AIN8~AIN15 optionally configured as analog GPIO AGPIO0~7; AINCOM is the shared reference point for single-ended inputs, tied to analog ground. The built-in reference outputs a selectable 2.5V or 4.096V (REFOUT); REFP/TDACOUT serves as the positive reference input or test-DAC output, REFN is the negative reference input. It has a channel auto-sequencer with FIFO buffering, fault detection and system monitoring; 4 adjustable speed modes; simultaneous 50Hz/60Hz rejection at ≤25SPS. SPI serial interface (SCLK/SDI/SDO-{DRDY}/{CS}) for control and readout, {RESET} for hardware reset; GPIO0~3 multiplex as START, CLKIN, FAULT, etc.',
        usedIn: 'Factory automation and control (condition monitoring, analog input modules, field transmitters such as flow meters), patient monitoring (ECG, infusion pumps), test & measurement (DAQ, semiconductor test equipment).',
        desc: 'Multiplexed 8/16-channel 24-bit Delta-Sigma ADC, 1.067MSPS, built-in CRC data/register validation, 17 selectable inputs with analog GPIO reuse, internal 25.6MHz 1% oscillator, 36-VQFN 5×5mm, -40°C~125°C.',
        thermalPad: 'Exposed thermal pad (explicitly listed in Table 4-1); connect to AVSS.',
        specs: [
          { k: 'Data rate', v: 'programmable, up to 1.067MSPS' },
          { k: 'Input mux', v: '17 independently selectable inputs, up to 8 fully differential or 16 single-ended' },
          { k: 'Buffers', v: 'rail-to-rail analog-input and reference buffers' },
          { k: 'Internal reference', v: 'selectable 2.5V or 4.096V output' },
          { k: 'Data integrity', v: 'CRC validation on I/O data and register settings' },
          { k: 'Oscillator', v: 'internal 25.6MHz, 1% accuracy' },
          { k: 'Sequencing/buffering', v: 'channel auto-sequencer + FIFO buffer' },
          { k: 'Noise rejection', v: 'simultaneous 50Hz and 60Hz rejection at ≤25SPS' },
          { k: 'Speed modes', v: 'four adjustable speed modes' },
          { k: 'Package', v: '36-VQFN 5.00×5.00mm, EP=AVSS' },
          { k: 'Temperature range', v: '-40°C ~ 125°C' }
        ]
      },
      ja: {
        subcategory: 'マルチプレクス 8/16 チャネル 24-bit Delta-Sigma ADC（CRC データ検証）',
        whatIs: 'マルチプレクス型 8/16 チャネル・24-bit Delta-Sigma ADC、データレート最高 1.067MSPS、高インピーダンス入力バッファと参照バッファ内蔵で信号負荷を低減；入出力データとレジスタ設定に巡回冗長検査（CRC）を備え動作信頼性を向上、工場自動化・患者モニタ等に好適。ADS125H18 と同パッケージ同ピン基礎だが高圧抵抗分圧フロントエンドを省略、AIN8~15 はアナログ汎用入出力（AGPIO）に転用可。',
        func: 'アナログマルチプレクサは 17 系統の独立選択可能入力（最大 8 全差動または 16 シングルエンド、AIN0~AIN15）対応、うち AIN8~AIN15 はアナログ GPIO AGPIO0~7 に設定可；AINCOM はシングルエンド入力の共用参照点でアナロググランド接続。内蔵電圧参照は 2.5V または 4.096V 出力選択可（REFOUT）、REFP/TDACOUT は正参照入力またはテスト DAC 出力、REFN は負参照入力。チャネル自動シーケンサと FIFO バッファ、故障検出とシステム監視回路を内蔵；4 組の可変速度モード；≤25SPS で 50Hz/60Hz を同時除去。SPI シリアルインタフェース（SCLK/SDI/SDO-{DRDY}/{CS}）で制御とデータ読出し、{RESET} はハードウェアリセット；GPIO0~3 は START、CLKIN、FAULT 等の専用機能に多重化可。',
        usedIn: '工場自動化と制御（状態監視、アナログ入力モジュール、流量計等のフィールド変送器）、患者モニタ（ECG、輸液ポンプ）、テスト計測（DAQ、半導体試験装置）。',
        desc: 'マルチプレクス 8/16 チャネル 24-bit Delta-Sigma ADC、1.067MSPS、CRC データ/レジスタ検証内蔵、17 系統選択可能入力（アナログ GPIO 転用可）、内部 25.6MHz 1% 発振器、36-VQFN 5×5mm、-40°C~125°C。',
        thermalPad: '露出放熱パッド（Table 4-1 に Thermal Pad 列明記）；AVSS 接続。',
        specs: [
          { k: 'データレート', v: 'プログラマブル、最高 1.067MSPS' },
          { k: '入力マルチプレクス', v: '17 系統独立選択可能入力、最大 8 全差動または 16 シングルエンド' },
          { k: 'バッファ', v: 'レールツーレールのアナログ入力バッファと参照バッファ' },
          { k: '内部参照', v: '2.5V または 4.096V 出力選択可' },
          { k: 'データ完全性', v: '入出力データとレジスタ設定に CRC 巡回冗長検査' },
          { k: '発振器', v: '内部 25.6MHz、精度 1%' },
          { k: 'シーケンスとバッファ', v: 'チャネル自動シーケンサ＋FIFO バッファ' },
          { k: '雑音除去', v: '≤25SPS で 50Hz と 60Hz を同時除去' },
          { k: '速度モード', v: '4 組の可変速度モード' },
          { k: 'パッケージ', v: '36-VQFN 5.00×5.00mm、EP=AVSS' },
          { k: '温度範囲', v: '-40°C ~ 125°C' }
        ]
      },
      ko: {
        subcategory: '멀티플렉스 8/16채널 24-bit Delta-Sigma ADC(CRC 데이터 검증)',
        whatIs: '멀티플렉스형 8/16채널·24-bit Delta-Sigma ADC, 데이터 속도 최고 1.067MSPS, 고임피던스 입력 버퍼와 참조 버퍼 내장으로 신호 부하 저감; 입출력 데이터와 레지스터 설정에 순환 중복 검사(CRC)를 갖춰 동작 신뢰성 향상, 공장 자동화·환자 모니터링 등에 적합. ADS125H18과 동일 패키지 동일 핀 기초이나 고압 저항 분압 프론트엔드를 생략, AIN8~15는 아날로그 범용 입출력(AGPIO)으로 전용 가능.',
        func: '아날로그 멀티플렉서는 17계통 독립 선택 가능 입력(최대 8 전차동 또는 16 싱글엔드, AIN0~AIN15) 지원, 그중 AIN8~AIN15는 아날로그 GPIO AGPIO0~7로 설정 가능; AINCOM은 싱글엔드 입력의 공용 참조점으로 아날로그 접지 연결. 내장 전압 참조는 2.5V 또는 4.096V 출력 선택 가능(REFOUT), REFP/TDACOUT은 정참조 입력 또는 테스트 DAC 출력, REFN은 부참조 입력. 채널 자동 시퀀서와 FIFO 버퍼, 고장 감지와 시스템 감시 회로 내장; 4조 가변 속도 모드; ≤25SPS에서 50Hz/60Hz 동시 제거. SPI 시리얼 인터페이스(SCLK/SDI/SDO-{DRDY}/{CS})로 제어와 데이터 읽기, {RESET}은 하드웨어 리셋; GPIO0~3은 START, CLKIN, FAULT 등 전용 기능으로 다중화 가능.',
        usedIn: '공장 자동화와 제어(상태 감시, 아날로그 입력 모듈, 유량계 등 필드 변송기), 환자 모니터링(ECG, 수액 펌프), 테스트 계측(DAQ, 반도체 시험 장비).',
        desc: '멀티플렉스 8/16채널 24-bit Delta-Sigma ADC, 1.067MSPS, CRC 데이터/레지스터 검증 내장, 17계통 선택 가능 입력(아날로그 GPIO 전용 가능), 내부 25.6MHz 1% 발진기, 36-VQFN 5×5mm, -40°C~125°C.',
        thermalPad: '노출 방열 패드(Table 4-1에 Thermal Pad 행 명기); AVSS 연결.',
        specs: [
          { k: '데이터 속도', v: '프로그래머블, 최고 1.067MSPS' },
          { k: '입력 멀티플렉스', v: '17계통 독립 선택 가능 입력, 최대 8 전차동 또는 16 싱글엔드' },
          { k: '버퍼', v: '레일투레일 아날로그 입력 버퍼와 참조 버퍼' },
          { k: '내부 참조', v: '2.5V 또는 4.096V 출력 선택 가능' },
          { k: '데이터 무결성', v: '입출력 데이터와 레지스터 설정에 CRC 순환 중복 검사' },
          { k: '발진기', v: '내부 25.6MHz, 정확도 1%' },
          { k: '시퀀싱과 버퍼', v: '채널 자동 시퀀서+FIFO 버퍼' },
          { k: '잡음 제거', v: '≤25SPS에서 50Hz와 60Hz 동시 제거' },
          { k: '속도 모드', v: '4조 가변 속도 모드' },
          { k: '패키지', v: '36-VQFN 5.00×5.00mm, EP=AVSS' },
          { k: '온도 범위', v: '-40°C ~ 125°C' }
        ]
      }
    },
    'AFE10004-EP': {
      en: {
        subcategory: 'Quad PA-bias-control precision analog front end (with EEPROM and gate-bias switches)',
        whatIs: 'Highly integrated autonomous power-amplifier (PA) precision bias analog front end (AFE) with four temperature-compensated DACs, EEPROM and gate-bias switches; after power-up it automatically corrects the bias per temperature-to-voltage transfer functions stored in EEPROM, completing PA biasing and temperature compensation without continuous host intervention — for defense/space RF systems. The -EP suffix means TI Enhanced Product (hardened process and quality controls), unrelated to the package exposed pad — this device happens to have both (see the Table 4-1 Thermal Pad row).',
        func: 'Four 13-bit monotonic DACs (DAC0~3) with buffered outputs, auto-configured output ranges at power-up (positive up to 5.5V, negative down to -10V), high-current drive (source up to 100mA, sink up to 20mA), tolerating capacitive loads up to 15µF; OUT1/OUT2 are DAC1/DAC2 outputs routed through gate-bias switches, with DRVEN1/DRVEN2 as the corresponding asynchronous switch controls, two programmable turn-off voltages and fast response — protecting depletion-mode GaAs/GaN transistors and coordinating PA sequencing with PA_ON. CLAMP1/CLAMP2 are auxiliary DAC buffered outputs, 50ns typical switching, 3Ω max on-resistance. Built-in local and remote (D+/D–) diode temperature sensing, ±2.5°C (max) error, 0.0625°C resolution. Built-in 2.5V reference. Selectable SPI (4-wire, SCL/{CS}, A2/SCLK, A1/SDI, A0/SDO) or I2C (SDA, SCL, 8 selectable addresses), 1.7V~3.6V operation; {RESET}/{ALMIN} is the reset input, also configurable as an active-low alarm input.',
        usedIn: 'Autonomous bias-control circuits for LDMOS/GaAs/GaN power amplifiers in radar, electronic warfare, communication payloads and defense radios.',
        desc: 'Quad PA-bias precision AFE with EEPROM storing 4 temperature-to-voltage transfer functions and gate-bias switches, 13-bit/1.22mV DAC resolution, SPI/I2C dual interface, 24-VQFN 4×4mm, -55°C~125°C (Enhanced Product).',
        thermalPad: 'Package-bottom thermal pad (explicitly listed in Table 4-1); connect to the internal PCB ground plane through multiple vias.',
        specs: [
          { k: 'DAC resolution', v: '13-bit, four monotonic DACs, 1.22mV resolution' },
          { k: 'Output ranges', v: 'auto-configured: positive up to 5.5V / negative down to -10V' },
          { k: 'Drive capability', v: 'source up to 100mA / sink up to 20mA; tolerates capacitive loads up to 15µF' },
          { k: 'Gate-bias switches', v: 'two programmable turn-off voltages, fast response' },
          { k: 'Auxiliary DACs', v: 'two (CLAMP1/2), 1.22mV resolution, 50ns typical switching, 3Ω max on-resistance' },
          { k: 'Temperature sensing', v: 'local and remote diode sensing, ±2.5°C (max) error, 0.0625°C resolution' },
          { k: 'EEPROM', v: 'built-in, stores four independent temperature-to-voltage transfer functions and device config, plus user space, rated 15-year retention' },
          { k: 'Reference', v: 'built-in 2.5V' },
          { k: 'Interface', v: 'SPI (4-wire) and I2C (8 selectable addresses), 1.7V~3.6V operation' },
          { k: 'Temperature range', v: '-55°C ~ 125°C' },
          { k: 'Package', v: '24-VQFN 4×4mm, with bottom thermal pad' },
          { k: 'Special grade', v: 'defense/space grade: controlled baseline, single assembly/test site, single fab, product traceability, extended product life cycle' }
        ]
      },
      ja: {
        subcategory: '4 チャネル PA バイアス制御精密アナログフロントエンド（EEPROM とゲートバイアススイッチ付）',
        whatIs: '高集積自律型パワーアンプ（PA）精密バイアスアナログフロントエンド（AFE）、温度補償 DAC 4 組・EEPROM・ゲートバイアススイッチ内蔵；起動後は内部 EEPROM 格納の温度-電圧変換関数に従い自動でバイアスを補正、システムコントローラの継続介入なしで PA バイアス設定と温度補償を完了、国防/宇宙 RF システムに好適。型番末尾の -EP は TI Enhanced Product（強化プロセスと品質管理）でパッケージ露出パッドとは無関係——本装置は偶々両方を備える（Table 4-1 Thermal Pad 列参照）。',
        func: '4 組の 13-bit 単調 DAC（DAC0~3）バッファ出力、起動時に出力範囲を自動設定（正出力最高 5.5V、負出力最低 -10V）、高電流駆動（source 最高 100mA、sink 最高 20mA）、最大 15µF の容量負荷に耐える；OUT1/OUT2 は DAC1/DAC2 のゲートバイアススイッチ経由の切替出力、DRVEN1/DRVEN2 は対応する非同期スイッチ制御信号で、2 組のプログラマブル遮断電圧と高速応答を持ち、GaAs/GaN 等のデプレッション型トランジスタを保護し PA_ON と連携して PA シーケンス制御を実現。CLAMP1/CLAMP2 は補助 DAC バッファ出力、切替時間典型 50ns、オン抵抗最大 3Ω。ローカルとリモート（D+/D–）ダイオード温度センサ内蔵、誤差 ±2.5°C（max）、分解能 0.0625°C。2.5V 参照内蔵。SPI（4 線、SCL/{CS}、A2/SCLK、A1/SDI、A0/SDO）と I2C（SDA、SCL、8 組選択可能アドレス）の両インタフェース選択可、動作電圧 1.7V~3.6V；{RESET}/{ALMIN} はリセット入力で、ロー動作アラーム入力にも設定可。',
        usedIn: 'レーダ、電子戦、通信ペイロード、国防無線等の RF システムにおける LDMOS/GaAs/GaN パワーアンプの自律バイアス制御回路。',
        desc: '4 チャネル PA バイアス精密 AFE。EEPROM に 4 組の温度-電圧変換関数を格納、ゲートバイアススイッチ付、DAC 分解能 13-bit/1.22mV、SPI/I2C 両インタフェース、24-VQFN 4×4mm、-55°C~125°C（Enhanced Product）。',
        thermalPad: 'パッケージ底部放熱パッド（Table 4-1 に Thermal Pad 列明記）；複数ビアで内部 PCB 接地層に接続。',
        specs: [
          { k: 'DAC 分解能', v: '13-bit、4 組単調 DAC、分解能 1.22mV' },
          { k: '出力範囲', v: '自動設定：正出力最高 5.5V／負出力最低 -10V' },
          { k: '駆動能力', v: 'source 最高 100mA／sink 最高 20mA；容量負荷 15µF まで対応' },
          { k: 'ゲートバイアススイッチ', v: '2 組のプログラマブル遮断電圧、高速応答' },
          { k: '補助 DAC', v: '2 組（CLAMP1/2）、分解能 1.22mV、切替時間典型 50ns、オン抵抗最大 3Ω' },
          { k: '温度検出', v: 'ローカルとリモートのダイオード温度検出、誤差 ±2.5°C（max）、分解能 0.0625°C' },
          { k: 'EEPROM', v: '内蔵、4 組の独立温度-電圧変換関数と素子設定を格納、ユーザ領域あり、定格 15 年データ保持' },
          { k: '参照電圧', v: '内蔵 2.5V' },
          { k: 'インタフェース', v: 'SPI（4 線）と I2C（8 組選択可能アドレス）、動作電圧 1.7V~3.6V' },
          { k: '温度範囲', v: '-55°C ~ 125°C' },
          { k: 'パッケージ', v: '24-VQFN 4×4mm、底部放熱パッド付' },
          { k: '特殊規格', v: '国防/宇宙用途規格：controlled baseline、単一組立試験工場、単一ファブ、製品追跡可能性、延長製品ライフサイクル' }
        ]
      },
      ko: {
        subcategory: '4채널 PA 바이어스 제어 정밀 아날로그 프론트엔드(EEPROM과 게이트 바이어스 스위치 포함)',
        whatIs: '고집적 자율형 파워앰프(PA) 정밀 바이어스 아날로그 프론트엔드(AFE), 온도 보상 DAC 4조·EEPROM·게이트 바이어스 스위치 내장; 기동 후 내부 EEPROM 저장의 온도-전압 변환 함수에 따라 자동으로 바이어스를 보정, 시스템 컨트롤러의 지속 개입 없이 PA 바이어스 설정과 온도 보상 완료, 국방/우주 RF 시스템에 적합. 부품 번호 끝 -EP는 TI Enhanced Product(강화 공정과 품질 관리)로 패키지 노출 패드와 무관 - 본 장치는 마침 둘 다 갖춤(Table 4-1 Thermal Pad 행 참조).',
        func: '4조 13-bit 단조 DAC(DAC0~3) 버퍼 출력, 기동 시 출력 범위 자동 설정(정출력 최고 5.5V, 부출력 최저 -10V), 대전류 구동(source 최고 100mA, sink 최고 20mA), 최대 15µF 용량 부하 허용; OUT1/OUT2는 DAC1/DAC2의 게이트 바이어스 스위치 경유 전환 출력, DRVEN1/DRVEN2는 대응하는 비동기 스위치 제어 신호로 2조 프로그래머블 차단 전압과 고속 응답을 갖춰 GaAs/GaN 등 공핍형 트랜지스터를 보호하고 PA_ON과 연계해 PA 시퀀스 제어 실현. CLAMP1/CLAMP2는 보조 DAC 버퍼 출력, 전환 시간 전형 50ns, 온저항 최대 3Ω. 로컬과 원격(D+/D–) 다이오드 온도 센서 내장, 오차 ±2.5°C(max), 분해능 0.0625°C. 2.5V 참조 내장. SPI(4선, SCL/{CS}, A2/SCLK, A1/SDI, A0/SDO)와 I2C(SDA, SCL, 8조 선택 가능 주소) 양 인터페이스 선택 가능, 동작 전압 1.7V~3.6V; {RESET}/{ALMIN}은 리셋 입력으로 로우 동작 알람 입력으로도 설정 가능.',
        usedIn: '레이더, 전자전, 통신 페이로드, 국방 무전 등 RF 시스템에서 LDMOS/GaAs/GaN 파워앰프의 자율 바이어스 제어 회로.',
        desc: '4채널 PA 바이어스 정밀 AFE. EEPROM에 4조 온도-전압 변환 함수 저장, 게이트 바이어스 스위치 포함, DAC 분해능 13-bit/1.22mV, SPI/I2C 양 인터페이스, 24-VQFN 4×4mm, -55°C~125°C(Enhanced Product).',
        thermalPad: '패키지 바닥 방열 패드(Table 4-1에 Thermal Pad 행 명기); 복수 비아로 내부 PCB 접지층에 연결.',
        specs: [
          { k: 'DAC 분해능', v: '13-bit, 4조 단조 DAC, 분해능 1.22mV' },
          { k: '출력 범위', v: '자동 설정: 정출력 최고 5.5V / 부출력 최저 -10V' },
          { k: '구동 능력', v: 'source 최고 100mA / sink 최고 20mA; 용량 부하 15µF까지 허용' },
          { k: '게이트 바이어스 스위치', v: '2조 프로그래머블 차단 전압, 고속 응답' },
          { k: '보조 DAC', v: '2조(CLAMP1/2), 분해능 1.22mV, 전환 시간 전형 50ns, 온저항 최대 3Ω' },
          { k: '온도 감지', v: '로컬과 원격 다이오드 온도 감지, 오차 ±2.5°C(max), 분해능 0.0625°C' },
          { k: 'EEPROM', v: '내장, 4조 독립 온도-전압 변환 함수와 소자 설정 저장, 사용자 영역 있음, 정격 15년 데이터 보존' },
          { k: '참조 전압', v: '내장 2.5V' },
          { k: '인터페이스', v: 'SPI(4선)와 I2C(8조 선택 가능 주소), 동작 전압 1.7V~3.6V' },
          { k: '온도 범위', v: '-55°C ~ 125°C' },
          { k: '패키지', v: '24-VQFN 4×4mm, 바닥 방열 패드 포함' },
          { k: '특수 규격', v: '국방/우주 용도 규격: controlled baseline, 단일 조립 시험 공장, 단일 팹, 제품 추적 가능성, 연장 제품 수명 주기' }
        ]
      }
    },
    'ADS1278QML-SP': {
      en: {
        subcategory: 'Space-grade 8-channel simultaneous-sampling Δ-Σ ADC',
        whatIs: 'Radiation-tolerant space-grade 8-channel, 24-bit Δ-Σ analog-to-digital converter: eight channels sampled simultaneously, data rates up to 128kSPS, TID RLAT 50krad(Si), SEL-immune to LET 51MeV-cm²/mg (125°C), QMLV flight-grade screened — for precision measurement and sensing on satellites and space platforms.',
        func: 'Eight Δ-Σ modulators sample simultaneously with a built-in linear-phase digital filter (bypassable to output raw modulator data); four selectable operating modes: High-Speed (128kSPS, 106dB SNR), High-Resolution (52kSPS, 111dB SNR), Low-Power (52kSPS, 31mW/ch), Low-Speed (10kSPS, 7mW/ch); SPI or Frame-Sync serial output, per-channel independent PWDN power-down control; analog supply 5V, digital core 1.8V, I/O supply 1.8~3.3V; low sampling-aperture error, chopper-stabilized high-order modulator architecture.',
        usedIn: 'Temperature and attitude sensing on satellites/shuttles/space stations, orbital observation systems, space precision and scientific measurement, high-precision instrumentation — multi-channel simultaneous sampling in radiation environments.',
        desc: 'Space-grade 8-channel 24-bit simultaneous-sampling Δ-Σ ADC, 128kSPS, 111dB SNR (High-Resolution mode), TID RLAT 50krad(Si), SEL-immune 51MeV-cm²/mg, SPI/Frame-Sync interface, 84-Pin CFP (HFQ).',
        thermalPad: 'No exposed pad (84-pin CFP ceramic quad flat pack); thermal/mounting design per the datasheet mechanical section.',
        specs: [
          { k: 'Radiation tolerance', v: 'TID RLAT 50krad(Si); SEL-immune to LET 51MeV-cm²/mg @125°C' },
          { k: 'Device grades', v: '5962L2521001VXC: Flight Grade 50krad(Si), −55°C~125°C; 5962L2521002VXC: Flight Grade 50krad(Si), −55°C~115°C' },
          { k: 'Resolution/channels', v: '24-bit, 8-channel simultaneous sampling' },
          { k: 'Data rate', v: 'up to 128kSPS (High-Speed mode)' },
          { k: 'AC performance', v: '63kHz bandwidth, 111dB SNR (High-Resolution mode), THD −108dB' },
          { k: 'DC performance', v: 'offset drift 0.8μV/°C; gain drift 1.3ppm/°C' },
          { k: 'Operating modes', v: 'High-Speed 128kSPS/106dB SNR; High-Resolution 52kSPS/111dB SNR; Low-Power 52kSPS/31mW/ch; Low-Speed 10kSPS/7mW/ch' },
          { k: 'Interface', v: 'SPI or Frame-Sync serial; linear-phase digital filter, bypassable for raw modulator output' },
          { k: 'Supply', v: 'AVDD 5V; DVDD 1.8V; IOVDD 1.8V~3.3V' },
          { k: 'Package', v: '84-Pin CFP (HFQ), mass 4.46g (±10%)' }
        ]
      },
      ja: {
        subcategory: '宇宙級 8 チャネル同時サンプリング Δ-Σ ADC',
        whatIs: '耐放射線宇宙級 8 チャネル・24-bit Δ-Σ A/D コンバータ：8 チャネル同時サンプリング、データレート最高 128kSPS、TID RLAT 50krad(Si)、SEL は LET 51MeV-cm²/mg（125°C）まで免疫、宇宙飛行グレードスクリーニング（QMLV）適合、衛星と宇宙プラットフォームの精密計測・センシング用。',
        func: '8 組の Δ-Σ 変調器が同時サンプリング、線形位相デジタルフィルタ内蔵（バイパスして変調器生データ出力可）；4 種の選択可能動作モード：High-Speed（128kSPS、106dB SNR）、High-Resolution（52kSPS、111dB SNR）、Low-Power（52kSPS、31mW/ch）、Low-Speed（10kSPS、7mW/ch）；SPI または Frame-Sync シリアル出力、各チャネル独立 PWDN 電源遮断制御；アナログ電源 5V、デジタルコア 1.8V、I/O 電源 1.8~3.3V；低サンプリングアパーチャ誤差、チョッパ安定化高次変調器アーキテクチャ。',
        usedIn: '衛星/シャトル/宇宙ステーションの温度・姿勢センシング、軌道観測システム、宇宙精密・科学計測、高精度計装等、放射線環境下の多チャネル同時サンプリングシステム。',
        desc: '宇宙級 8 チャネル 24-bit 同時サンプリング Δ-Σ ADC、128kSPS・111dB SNR（High-Resolution モード）、TID RLAT 50krad(Si)、SEL 免疫 51MeV-cm²/mg、SPI/Frame-Sync インタフェース、84-Pin CFP (HFQ)。',
        thermalPad: '露出パッドなし（84-pin CFP セラミック四辺扁平パッケージ）；放熱と実装設計は datasheet 機構章参照。',
        specs: [
          { k: '放射線耐性', v: 'TID RLAT 50krad(Si)；SEL は LET 51MeV-cm²/mg @125°C まで免疫' },
          { k: '素子グレード', v: '5962L2521001VXC：Flight Grade 50krad(Si)、−55°C~125°C；5962L2521002VXC：Flight Grade 50krad(Si)、−55°C~115°C' },
          { k: '分解能/チャネル', v: '24-bit、8 チャネル同時サンプリング' },
          { k: 'データレート', v: '最高 128kSPS（High-Speed モード）' },
          { k: 'AC 性能', v: '63kHz 帯域、111dB SNR（High-Resolution モード）、THD −108dB' },
          { k: 'DC 性能', v: 'オフセットドリフト 0.8μV/°C；ゲインドリフト 1.3ppm/°C' },
          { k: '動作モード', v: 'High-Speed 128kSPS/106dB SNR；High-Resolution 52kSPS/111dB SNR；Low-Power 52kSPS/31mW/ch；Low-Speed 10kSPS/7mW/ch' },
          { k: 'インタフェース', v: 'SPI または Frame-Sync シリアル；線形位相デジタルフィルタ、バイパスして変調器生データ出力可' },
          { k: '電源', v: 'AVDD 5V；DVDD 1.8V；IOVDD 1.8V~3.3V' },
          { k: 'パッケージ', v: '84-Pin CFP (HFQ)、質量 4.46g（±10%）' }
        ]
      },
      ko: {
        subcategory: '우주급 8채널 동시 샘플링 Δ-Σ ADC',
        whatIs: '내방사선 우주급 8채널·24-bit Δ-Σ 아날로그-디지털 변환기: 8채널 동시 샘플링, 데이터 속도 최고 128kSPS, TID RLAT 50krad(Si), SEL은 LET 51MeV-cm²/mg(125°C)까지 면역, 우주 비행 등급 스크리닝(QMLV) 적합, 위성과 우주 플랫폼의 정밀 계측·센싱용.',
        func: '8조 Δ-Σ 변조기가 동시 샘플링, 선형 위상 디지털 필터 내장(바이패스해 변조기 원시 데이터 출력 가능); 4종 선택 가능 동작 모드: High-Speed(128kSPS, 106dB SNR), High-Resolution(52kSPS, 111dB SNR), Low-Power(52kSPS, 31mW/ch), Low-Speed(10kSPS, 7mW/ch); SPI 또는 Frame-Sync 시리얼 출력, 각 채널 독립 PWDN 전원 차단 제어; 아날로그 전원 5V, 디지털 코어 1.8V, I/O 전원 1.8~3.3V; 저 샘플링 어퍼처 오차, 초퍼 안정화 고차 변조기 아키텍처.',
        usedIn: '위성/셔틀/우주정거장의 온도·자세 센싱, 궤도 관측 시스템, 우주 정밀·과학 계측, 고정밀 계기 등 방사선 환경 하의 다채널 동시 샘플링 시스템.',
        desc: '우주급 8채널 24-bit 동시 샘플링 Δ-Σ ADC, 128kSPS·111dB SNR(High-Resolution 모드), TID RLAT 50krad(Si), SEL 면역 51MeV-cm²/mg, SPI/Frame-Sync 인터페이스, 84-Pin CFP (HFQ).',
        thermalPad: '노출 패드 없음(84-pin CFP 세라믹 사변 편평 패키지); 방열과 실장 설계는 datasheet 기구 장 참조.',
        specs: [
          { k: '방사선 내성', v: 'TID RLAT 50krad(Si); SEL은 LET 51MeV-cm²/mg @125°C까지 면역' },
          { k: '소자 등급', v: '5962L2521001VXC: Flight Grade 50krad(Si), −55°C~125°C; 5962L2521002VXC: Flight Grade 50krad(Si), −55°C~115°C' },
          { k: '분해능/채널', v: '24-bit, 8채널 동시 샘플링' },
          { k: '데이터 속도', v: '최고 128kSPS(High-Speed 모드)' },
          { k: 'AC 성능', v: '63kHz 대역, 111dB SNR(High-Resolution 모드), THD −108dB' },
          { k: 'DC 성능', v: '오프셋 드리프트 0.8μV/°C; 이득 드리프트 1.3ppm/°C' },
          { k: '동작 모드', v: 'High-Speed 128kSPS/106dB SNR; High-Resolution 52kSPS/111dB SNR; Low-Power 52kSPS/31mW/ch; Low-Speed 10kSPS/7mW/ch' },
          { k: '인터페이스', v: 'SPI 또는 Frame-Sync 시리얼; 선형 위상 디지털 필터, 바이패스해 변조기 원시 데이터 출력 가능' },
          { k: '전원', v: 'AVDD 5V; DVDD 1.8V; IOVDD 1.8V~3.3V' },
          { k: '패키지', v: '84-Pin CFP (HFQ), 질량 4.46g(±10%)' }
        ]
      }
    }
  };
  Object.assign(window.IC_I18N, T);
})();

/* batch 12B: entries 150-158 (DAC39RF10-SP, DAC39RFS10-SP, DRV8218, DRV81646-Q1,
   FAN31790, X4003, NX48P0407, MCT8376Z-Q1, DRV8363) */
(function () {
  // DAC39RF10-SP / DAC39RFS10-SP 姊妹料共享文本（同一 datasheet SBAS932A）
  function dacEntry(L, d) {
    return {
      subcategory: d.subcategory,
      whatIs: d.whatIs,
      func: d.func,
      usedIn: d.usedIn,
      desc: d.desc,
      thermalPad: L.thermalPad,
      specs: [
        { k: L.kRad1, v: L.vRad1 },
        { k: L.kRad2, v: L.vRad2 },
        { k: L.kRes, v: d.vRes },
        { k: L.kRate, v: d.vRate },
        { k: L.kBw, v: L.vBw },
        { k: L.kAc, v: L.vAc },
        { k: L.kDuc, v: d.vDuc },
        { k: L.kJesd, v: L.vJesd },
        { k: L.kScreen, v: L.vScreen },
        { k: L.kGrade, v: d.vGrade },
        { k: L.kPkg, v: d.vPkg }
      ],
      dropIn: [{ note: d.dropNote }]
    };
  }
  var dacL = {
    en: {
      thermalPad: 'No exposed pad (256-ball FCBGA; heat dissipates through the ball array and substrate); see datasheet for thermal design',
      kRad1: 'Radiation tolerance (-SP)', vRad1: 'SEU-immune registers; SEL 120MeV-cm²/mg; TID RLAT 300krad(Si)',
      kRad2: 'Radiation tolerance (-SEP, not in library, reference only)', vRad2: 'See datasheet: SEU-immune registers; SEL 43MeV-cm²/mg; TID RLAT 30krad(Si)',
      kRes: 'Resolution/sample rate', kRate: 'Max input data rate',
      kBw: 'Output bandwidth', vBw: '−3dB 12GHz',
      kAc: 'AC performance (fOUT=2.997GHz, DES2XL, DEM/Dither off)', vAc: 'Noise floor −155dBFS/Hz; SFDR(−0.1dBFS) 60dBc; IMD3(−7dBFS/tone) −62dBc; additive phase noise −138dBc/Hz @10kHz offset',
      kDuc: 'Digital upconversion',
      kJesd: 'JESD204C interface', vJesd: 'Up to 16 lanes, up to 12.8Gbps per lane; Class C-S subclass-1; built-in AC-coupling capacitors',
      kScreen: 'Space screening', vScreen: 'ASTM E595 outgassing compliant; single wafer fab/assembly/test site; wafer-lot traceability; extended product life cycle; RLAT; -SP adds production burn-in',
      kGrade: 'Part number/grade', kPkg: 'Package'
    },
    ja: {
      thermalPad: '露出パッドなし（256-ball FCBGA、放熱はボールアレイと基板経由）；熱設計は datasheet 参照',
      kRad1: '放射線耐性（-SP）', vRad1: 'SEU 免疫レジスタ；SEL 120MeV-cm²/mg；TID RLAT 300krad(Si)',
      kRad2: '放射線耐性（-SEP、未登録・参考）', vRad2: 'datasheet 参照：SEU 免疫レジスタ；SEL 43MeV-cm²/mg；TID RLAT 30krad(Si)',
      kRes: '分解能/サンプルレート', kRate: '最大入力データレート',
      kBw: '出力帯域', vBw: '−3dB 12GHz',
      kAc: 'AC 性能（fOUT=2.997GHz、DES2XL、DEM/Dither off）', vAc: 'ノイズフロア −155dBFS/Hz；SFDR(−0.1dBFS) 60dBc；IMD3(−7dBFS/tone) −62dBc；付加位相雑音 −138dBc/Hz@10kHz オフセット',
      kDuc: 'デジタルアップコンバート',
      kJesd: 'JESD204C インタフェース', vJesd: '最大 16 レーン、1 レーン最大 12.8Gbps；Class C-S subclass-1；AC 結合コンデンサ内蔵',
      kScreen: '宇宙スクリーニング', vScreen: 'ASTM E595 アウトガス規格適合；単一ウェハ製造/組立/テスト拠点；ウェハロット追跡可能；製品ライフサイクル延長；RLAT；-SP 版は production burn-in 込み',
      kGrade: '型番/グレード', kPkg: 'パッケージ'
    },
    ko: {
      thermalPad: '노출 패드 없음(256-ball FCBGA, 방열은 볼 어레이와 기판 경유); 열 설계는 datasheet 참조',
      kRad1: '방사선 내성(-SP)', vRad1: 'SEU 면역 레지스터; SEL 120MeV-cm²/mg; TID RLAT 300krad(Si)',
      kRad2: '방사선 내성(-SEP, 미등록·참고)', vRad2: 'datasheet 참조: SEU 면역 레지스터; SEL 43MeV-cm²/mg; TID RLAT 30krad(Si)',
      kRes: '분해능/샘플레이트', kRate: '최대 입력 데이터 속도',
      kBw: '출력 대역폭', vBw: '−3dB 12GHz',
      kAc: 'AC 성능(fOUT=2.997GHz, DES2XL, DEM/Dither off)', vAc: '노이즈 플로어 −155dBFS/Hz; SFDR(−0.1dBFS) 60dBc; IMD3(−7dBFS/tone) −62dBc; 부가 위상 잡음 −138dBc/Hz@10kHz 오프셋',
      kDuc: '디지털 업컨버전',
      kJesd: 'JESD204C 인터페이스', vJesd: '최대 16레인, 레인당 최대 12.8Gbps; Class C-S subclass-1; AC 결합 커패시터 내장',
      kScreen: '우주 스크리닝', vScreen: 'ASTM E595 아웃개싱 규격 적합; 단일 웨이퍼 제조/조립/테스트 사이트; 웨이퍼 로트 추적 가능; 제품 수명 주기 연장; RLAT; -SP판은 production burn-in 포함',
      kGrade: '형번/등급', kPkg: '패키지'
    }
  };
  var T = {
    'DAC39RF10-SP': {
      en: dacEntry(dacL.en, {
        subcategory: 'Space-grade dual-channel 16-bit RF DAC (JESD204C)',
        whatIs: 'Radiation-hardened space-grade dual-channel 16-bit multi-Nyquist digital-to-analog converter: up to 10.4GSPS/channel (dual) or 20.8GSPS (single-channel DES mode), JESD204C high-speed serial interface. For satellite communications, wideband high-speed signal generation and phased-array antennas on space platforms.',
        func: 'Dual-channel 16-bit DAC core usable as a non-interpolating or interpolating DAC for direct RF sampling or complex baseband signal generation; 4 built-in digital upconverters (DUC) with 1x~256x interpolation, complex baseband I/Q output and complex-to-real upconversion for dual-channel direct RF sampling; 64-bit NCO frequency resolution with phase-continuous frequency hopping; JESD204C interface up to 16 lane pairs, up to 12.8Gbps per lane, Class C-S subclass-1 compliant with built-in AC-coupling capacitors; SYSREF windowing auto-calibrates SYSREF timing.',
        usedIn: 'Satellite communications (SATCOM), wideband high-speed data transmission, clock/LO RF synthesis, phased-array antenna systems, synthetic aperture radar (SAR) excitation sources, spectrum measurement and other space-platform high-speed signal generation.',
        desc: 'Space-grade dual-channel 16-bit multi-Nyquist DAC, 10.4GSPS/ch (dual) or 20.8GSPS (single-channel DES), JESD204C up to 16 lanes @12.8Gbps, SEL 120MeV-cm²/mg, TID RLAT 300krad(Si), 256-ball FCBGA 17×17mm 1mm pitch.',
        vRes: '16-bit, 10.4 or 20.8GSPS multi-Nyquist DAC core',
        vRate: 'Single-channel DES: 8-bit 20.8GSPS / 12-bit 15.5GSPS / 16-bit 10.4GSPS; dual-channel: 8-bit 10.4GSPS / 12-bit 7.75GSPS/ch / 16-bit 6.2GSPS/ch',
        vDuc: '4 DUCs, interpolation 1x/2x/3x/4x/6x/8x/12x...256x; 64-bit NCO frequency resolution',
        vGrade: 'DAC39RF10ACL-MLS: Flight grade Space-MLS (-SP), 300krad(Si); DAC39RF10ACLNSP: Space Enhanced (-SEP), 30krad(Si) (see datasheet)',
        vPkg: '256-ball FCBGA (ACL), 17mm×17mm, 1mm pitch',
        dropNote: 'Same datasheet (TI SBAS932A); Table 5-1 shares one 256-ball FCBGA pinout (ball numbers and names identical). RFS10 is the single-channel version; its DACOUTB+/DACOUTB− (balls T12/T13) are marked "Not available in single channel devices" in the datasheet. Channel-B power balls (VDDA18B/VDDLB/VDDEB/VEEBM18/TXEN1 etc.) are not explicitly excluded — confirm with the full datasheet or TI whether they are disabled/floating on the single-channel version.'
      }),
      ja: dacEntry(dacL.ja, {
        subcategory: '宇宙グレード デュアルチャネル 16-bit RF DAC（JESD204C）',
        whatIs: '耐放射線・宇宙グレードのデュアルチャネル 16-bit マルチナイキスト（multi-Nyquist）D/A コンバータ：最高 10.4GSPS/ch（デュアル）または 20.8GSPS（シングルチャネル DES モード）、JESD204C 高速シリアルインタフェース。衛星通信、広帯域高速信号生成、フェーズドアレイアンテナなど宇宙プラットフォーム用途。',
        func: 'デュアルチャネル 16-bit DAC コア。非補間/補間 DAC として直接 RF サンプリングや複素ベースバンド信号生成に使用；デジタルアップコンバータ（DUC）4 系統内蔵、補間率 1x~256x、複素ベースバンド I/Q 出力とデュアルチャネル直接 RF サンプリングの複素→実数アップコンバートに対応；64-bit NCO 周波数分解能、位相連続周波数ホッピング対応；JESD204C 最大 16 レーン・1 レーン最大 12.8Gbps、Class C-S subclass-1 準拠、AC 結合コンデンサ内蔵；SYSREF windowing により SYSREF タイミングを自動校正。',
        usedIn: '衛星通信（SATCOM）、広帯域高速データ伝送、クロック/局部発振（LO）RF 合成、フェーズドアレイアンテナ、合成開口レーダー（SAR）励振源、スペクトラム測定など宇宙プラットフォームの高速信号生成。',
        desc: '宇宙グレード デュアルチャネル 16-bit multi-Nyquist DAC、10.4GSPS/ch（デュアル）または 20.8GSPS（シングル DES）、JESD204C 最大 16 レーン @12.8Gbps、SEL 120MeV-cm²/mg、TID RLAT 300krad(Si)、256-Ball FCBGA 17×17mm 1mm ピッチ。',
        vRes: '16-bit、10.4 または 20.8GSPS multi-Nyquist DAC コア',
        vRate: 'シングルチャネル DES：8-bit 20.8GSPS／12-bit 15.5GSPS／16-bit 10.4GSPS；デュアルチャネル：8-bit 10.4GSPS／12-bit 7.75GSPS/ch／16-bit 6.2GSPS/ch',
        vDuc: 'DUC 4 系統、補間 1x/2x/3x/4x/6x/8x/12x...256x；64-bit NCO 周波数分解能',
        vGrade: 'DAC39RF10ACL-MLS：Flight grade Space-MLS(-SP)、300krad(Si)；DAC39RF10ACLNSP：Space Enhanced(-SEP)、30krad(Si)（datasheet 参照）',
        vPkg: '256-Ball FCBGA (ACL)、17mm×17mm、1mm ピッチ',
        dropNote: '同一 datasheet（TI SBAS932A）・Table 5-1 の 256-ball FCBGA ピン配置を共用（ボール番号・ボール名とも同一）；RFS10 はシングルチャネル版で、DACOUTB+/DACOUTB−（ボール T12/T13）は datasheet に「Not available in single channel devices」と明記。チャネル B 系電源ボール（VDDA18B/VDDLB/VDDEB/VEEBM18/TXEN1 等）は明文の除外記載なし——シングルチャネル版で無効/開放かは完全版 datasheet か TI へ確認のこと。'
      }),
      ko: dacEntry(dacL.ko, {
        subcategory: '우주급 듀얼 채널 16-bit RF DAC(JESD204C)',
        whatIs: '내방사선 우주급 듀얼 채널 16-bit 멀티 나이퀴스트(multi-Nyquist) D/A 변환기: 최고 10.4GSPS/채널(듀얼) 또는 20.8GSPS(싱글 채널 DES 모드), JESD204C 고속 직렬 인터페이스. 위성 통신, 광대역 고속 신호 생성, 위상 배열 안테나 등 우주 플랫폼 응용.',
        func: '듀얼 채널 16-bit DAC 코어. 비보간/보간 DAC로 직접 RF 샘플링이나 복소 기저대역 신호 생성에 사용; 디지털 업컨버터(DUC) 4조 내장, 보간율 1x~256x, 복소 기저대역 I/Q 출력과 듀얼 채널 직접 RF 샘플링의 복소→실수 업컨버트 지원; 64-bit NCO 주파수 분해능, 위상 연속 주파수 호핑 지원; JESD204C 최대 16레인·레인당 최대 12.8Gbps, Class C-S subclass-1 준거, AC 결합 커패시터 내장; SYSREF windowing으로 SYSREF 타이밍 자동 교정.',
        usedIn: '위성 통신(SATCOM), 광대역 고속 데이터 전송, 클록/국부 발진(LO) RF 합성, 위상 배열 안테나 시스템, 합성 개구 레이더(SAR) 여기원, 스펙트럼 측정 등 우주 플랫폼 고속 신호 생성 응용.',
        desc: '우주급 듀얼 채널 16-bit multi-Nyquist DAC, 10.4GSPS/ch(듀얼) 또는 20.8GSPS(싱글 DES), JESD204C 최대 16레인 @12.8Gbps, SEL 120MeV-cm²/mg, TID RLAT 300krad(Si), 256-Ball FCBGA 17×17mm 1mm 피치.',
        vRes: '16-bit, 10.4 또는 20.8GSPS multi-Nyquist DAC 코어',
        vRate: '싱글 채널 DES: 8-bit 20.8GSPS/12-bit 15.5GSPS/16-bit 10.4GSPS; 듀얼 채널: 8-bit 10.4GSPS/12-bit 7.75GSPS/ch/16-bit 6.2GSPS/ch',
        vDuc: 'DUC 4조, 보간 1x/2x/3x/4x/6x/8x/12x...256x; 64-bit NCO 주파수 분해능',
        vGrade: 'DAC39RF10ACL-MLS: Flight grade Space-MLS(-SP), 300krad(Si); DAC39RF10ACLNSP: Space Enhanced(-SEP), 30krad(Si)(datasheet 참조)',
        vPkg: '256-Ball FCBGA (ACL), 17mm×17mm, 1mm 피치',
        dropNote: '동일 datasheet(TI SBAS932A)·Table 5-1의 256-ball FCBGA 핀 배치 공용(볼 번호·볼 이름 동일); RFS10은 싱글 채널판으로, DACOUTB+/DACOUTB−(볼 T12/T13)는 datasheet에 「Not available in single channel devices」로 명기. 채널 B 계열 전원 볼(VDDA18B/VDDLB/VDDEB/VEEBM18/TXEN1 등)은 명문 제외 기재 없음——싱글 채널판에서 비활성/개방 여부는 완전판 datasheet나 TI로 확인할 것.'
      })
    },
    'DAC39RFS10-SP': {
      en: dacEntry(dacL.en, {
        subcategory: 'Space-grade single-channel 16-bit RF DAC (JESD204C)',
        whatIs: 'Radiation-hardened space-grade single-channel 16-bit multi-Nyquist digital-to-analog converter: up to 20.8GSPS (single-channel DES mode), JESD204C high-speed serial interface; shares the die/package/datasheet with the dual-channel DAC39RF10-SP (channel-B outputs unavailable). For satellite communications, wideband high-speed signal generation and phased-array antennas on space platforms.',
        func: 'Single-channel 16-bit DAC core usable as a non-interpolating or interpolating DAC for direct RF sampling or complex baseband signal generation; built-in digital upconverter (DUC) with 1x~256x interpolation and complex baseband I/Q output; 64-bit NCO frequency resolution with phase-continuous frequency hopping; JESD204C interface up to 16 lane pairs, up to 12.8Gbps per lane, Class C-S subclass-1 compliant with built-in AC-coupling capacitors; SYSREF windowing auto-calibrates SYSREF timing; DACOUTB+/DACOUTB− are unavailable on this single-channel version.',
        usedIn: 'Satellite communications (SATCOM), wideband high-speed data transmission, clock/LO RF synthesis, phased-array antenna systems, synthetic aperture radar (SAR) excitation sources, spectrum measurement and other space-platform single-channel high-speed signal generation.',
        desc: 'Space-grade single-channel 16-bit multi-Nyquist DAC, up to 20.8GSPS (single-channel DES mode), JESD204C up to 16 lanes @12.8Gbps, SEL 120MeV-cm²/mg, TID RLAT 300krad(Si); shares the 256-ball FCBGA 17×17mm 1mm-pitch pinout with DAC39RF10-SP (DACOUTB unavailable).',
        vRes: '16-bit, up to 20.8GSPS (DES mode) multi-Nyquist DAC core',
        vRate: 'Single-channel DES: 8-bit 20.8GSPS / 12-bit 15.5GSPS / 16-bit 10.4GSPS',
        vDuc: 'Interpolation 1x/2x/3x/4x/6x/8x/12x...256x; 64-bit NCO frequency resolution',
        vGrade: 'DAC39RFS10ACL-MLS: Flight grade Space-MLS (-SP), 300krad(Si); DAC39RFS10ACLNSP: Space Enhanced (-SEP), 30krad(Si) (see datasheet)',
        vPkg: '256-ball FCBGA (ACL), 17mm×17mm, 1mm pitch (shares pinout with DAC39RF10-SP)',
        dropNote: 'Same datasheet (TI SBAS932A); Table 5-1 shares one 256-ball FCBGA pinout (ball numbers and names identical). RF10 is the dual-channel version; DACOUTB+/DACOUTB− (balls T12/T13) of this part (RFS10) are marked "Not available in single channel devices" in the datasheet, and this entry types those two balls as NC. Channel-B power balls (VDDA18B/VDDLB/VDDEB/VEEBM18/TXEN1 etc.) are not explicitly excluded — confirm with the full datasheet or TI whether they are disabled/floating on the single-channel version.'
      }),
      ja: dacEntry(dacL.ja, {
        subcategory: '宇宙グレード シングルチャネル 16-bit RF DAC（JESD204C）',
        whatIs: '耐放射線・宇宙グレードのシングルチャネル 16-bit マルチナイキスト（multi-Nyquist）D/A コンバータ：シングルチャネル最高 20.8GSPS（DES モード）、JESD204C 高速シリアルインタフェース。デュアルチャネル版 DAC39RF10-SP とチップ/パッケージ/datasheet を共用（チャネル B 系出力は使用不可）、衛星通信、広帯域高速信号生成、フェーズドアレイアンテナなど宇宙プラットフォーム用途。',
        func: 'シングルチャネル 16-bit DAC コア。非補間/補間 DAC として直接 RF サンプリングや複素ベースバンド信号生成に使用；デジタルアップコンバータ（DUC）内蔵、補間率 1x~256x、複素ベースバンド I/Q 出力対応；64-bit NCO 周波数分解能、位相連続周波数ホッピング対応；JESD204C 最大 16 レーン・1 レーン最大 12.8Gbps、Class C-S subclass-1 準拠、AC 結合コンデンサ内蔵；SYSREF windowing により SYSREF タイミングを自動校正；DACOUTB+/DACOUTB− は本シングルチャネル版では使用不可。',
        usedIn: '衛星通信（SATCOM）、広帯域高速データ伝送、クロック/局部発振（LO）RF 合成、フェーズドアレイアンテナ、合成開口レーダー（SAR）励振源、スペクトラム測定など宇宙プラットフォームのシングルチャネル高速信号生成。',
        desc: '宇宙グレード シングルチャネル 16-bit multi-Nyquist DAC、最高 20.8GSPS（シングルチャネル DES モード）、JESD204C 最大 16 レーン @12.8Gbps、SEL 120MeV-cm²/mg、TID RLAT 300krad(Si)、DAC39RF10-SP と 256-Ball FCBGA 17×17mm 1mm ピッチのピン配置を共用（DACOUTB 使用不可）。',
        vRes: '16-bit、シングルチャネル最高 20.8GSPS（DES モード）multi-Nyquist DAC コア',
        vRate: 'シングルチャネル DES：8-bit 20.8GSPS／12-bit 15.5GSPS／16-bit 10.4GSPS',
        vDuc: '補間 1x/2x/3x/4x/6x/8x/12x...256x；64-bit NCO 周波数分解能',
        vGrade: 'DAC39RFS10ACL-MLS：Flight grade Space-MLS(-SP)、300krad(Si)；DAC39RFS10ACLNSP：Space Enhanced(-SEP)、30krad(Si)（datasheet 参照）',
        vPkg: '256-Ball FCBGA (ACL)、17mm×17mm、1mm ピッチ（DAC39RF10-SP とピン配置共用）',
        dropNote: '同一 datasheet（TI SBAS932A）・Table 5-1 の 256-ball FCBGA ピン配置を共用（ボール番号・ボール名とも同一）；RF10 はデュアルチャネル版。本品（RFS10）の DACOUTB+/DACOUTB−（ボール T12/T13）は datasheet に「Not available in single channel devices」と明記、本ライブラリでは当該 2 ボールの type を NC としている。チャネル B 系電源ボール（VDDA18B/VDDLB/VDDEB/VEEBM18/TXEN1 等）は明文の除外記載なし——シングルチャネル版で無効/開放かは完全版 datasheet か TI へ確認のこと。'
      }),
      ko: dacEntry(dacL.ko, {
        subcategory: '우주급 싱글 채널 16-bit RF DAC(JESD204C)',
        whatIs: '내방사선 우주급 싱글 채널 16-bit 멀티 나이퀴스트(multi-Nyquist) D/A 변환기: 싱글 채널 최고 20.8GSPS(DES 모드), JESD204C 고속 직렬 인터페이스. 듀얼 채널판 DAC39RF10-SP와 칩/패키지/datasheet 공용(채널 B 계열 출력 사용 불가), 위성 통신, 광대역 고속 신호 생성, 위상 배열 안테나 등 우주 플랫폼 응용.',
        func: '싱글 채널 16-bit DAC 코어. 비보간/보간 DAC로 직접 RF 샘플링이나 복소 기저대역 신호 생성에 사용; 디지털 업컨버터(DUC) 내장, 보간율 1x~256x, 복소 기저대역 I/Q 출력 지원; 64-bit NCO 주파수 분해능, 위상 연속 주파수 호핑 지원; JESD204C 최대 16레인·레인당 최대 12.8Gbps, Class C-S subclass-1 준거, AC 결합 커패시터 내장; SYSREF windowing으로 SYSREF 타이밍 자동 교정; DACOUTB+/DACOUTB−는 본 싱글 채널판에서 사용 불가.',
        usedIn: '위성 통신(SATCOM), 광대역 고속 데이터 전송, 클록/국부 발진(LO) RF 합성, 위상 배열 안테나 시스템, 합성 개구 레이더(SAR) 여기원, 스펙트럼 측정 등 우주 플랫폼 싱글 채널 고속 신호 생성 응용.',
        desc: '우주급 싱글 채널 16-bit multi-Nyquist DAC, 최고 20.8GSPS(싱글 채널 DES 모드), JESD204C 최대 16레인 @12.8Gbps, SEL 120MeV-cm²/mg, TID RLAT 300krad(Si), DAC39RF10-SP와 256-Ball FCBGA 17×17mm 1mm 피치 핀 배치 공용(DACOUTB 사용 불가).',
        vRes: '16-bit, 싱글 채널 최고 20.8GSPS(DES 모드) multi-Nyquist DAC 코어',
        vRate: '싱글 채널 DES: 8-bit 20.8GSPS/12-bit 15.5GSPS/16-bit 10.4GSPS',
        vDuc: '보간 1x/2x/3x/4x/6x/8x/12x...256x; 64-bit NCO 주파수 분해능',
        vGrade: 'DAC39RFS10ACL-MLS: Flight grade Space-MLS(-SP), 300krad(Si); DAC39RFS10ACLNSP: Space Enhanced(-SEP), 30krad(Si)(datasheet 참조)',
        vPkg: '256-Ball FCBGA (ACL), 17mm×17mm, 1mm 피치(DAC39RF10-SP와 핀 배치 공용)',
        dropNote: '동일 datasheet(TI SBAS932A)·Table 5-1의 256-ball FCBGA 핀 배치 공용(볼 번호·볼 이름 동일); RF10은 듀얼 채널판. 본 부품(RFS10)의 DACOUTB+/DACOUTB−(볼 T12/T13)는 datasheet에 「Not available in single channel devices」로 명기, 본 라이브러리는 해당 2볼의 type을 NC로 표기. 채널 B 계열 전원 볼(VDDA18B/VDDLB/VDDEB/VEEBM18/TXEN1 등)은 명문 제외 기재 없음——싱글 채널판에서 비활성/개방 여부는 완전판 datasheet나 TI로 확인할 것.'
      })
    },
    'DRV8218': {
      en: {
        subcategory: 'Brushed-DC motor driver (single-channel H-bridge)',
        whatIs: '11V/8A single-channel H-bridge brushed-DC motor driver: four N-channel power FETs, a tripler charge pump and protection circuits integrated on one chip, all capacitors built in, operates from 1.8V.',
        func: 'Accepts PWM, PH-EN or independent half-bridge control interfaces (selected by the tri-level MODE pin) to drive one bidirectional brushed motor, two unidirectional motors, relays or solenoids; sleep-mode quiescent current under 120nA.',
        usedIn: 'Electric toothbrushes, smart locks, water/electricity/gas meters, toy robots, IP-camera IR-cut, video doorbells, blood pressure monitors, infusion pumps and other battery-powered small-motor applications.',
        desc: '8-WSON H-bridge motor driver, VM 1.8-11V, VCC 1.8-5.5V, 80mΩ RDS(ON) (HS+LS), 8A peak, supports paralleled half-bridges (20mΩ). Built-in UVLO/OCP/TSD protection. DRV8210/8212/8220 share the pinout family (different voltage/resistance, not in library). ADVANCE INFORMATION (2026-05 pre-production document); recheck against the latest datasheet before production.',
        thermalPad: 'Thermal pad to system ground (confirmed by both the pin table and the pad in the center of the pin diagram)',
        specs: [
          { k: 'Motor supply', v: '1.8V-11V (VM)' },
          { k: 'Logic supply', v: '1.8V-5.5V (VCC), supports 1.8/3.3/5V logic' },
          { k: 'Output', v: '8A peak, RDS(ON) 80mΩ (HS+LS total); paralleled half-bridge 20mΩ' },
          { k: 'Sleep current', v: '<120nA (VM=5V, VCC=3.3V, 25°C)' },
          { k: 'Control interface', v: 'PWM (IN1/IN2), PH/EN, independent half-bridge, parallel half-bridge' },
          { k: 'Protection', v: 'UVLO, OCP, TSD' }
        ]
      },
      ja: {
        subcategory: 'ブラシ付き DC モータドライバ（単チャネル H ブリッジ）',
        whatIs: '11V/8A 単チャネル H ブリッジ ブラシ付き DC モータドライバ：N チャネルパワー FET 4 個＋3 倍圧チャージポンプ＋保護回路をワンチップに集積、コンデンサ全内蔵、1.8V から動作。',
        func: 'PWM／PH-EN／独立ハーフブリッジの 3 種の制御インタフェース（MODE 3 値ピンで選択）を受け、双方向ブラシ付きモータ 1 個、単方向モータ 2 個、リレーやソレノイドを駆動；スリープ時静止電流 <120nA。',
        usedIn: '電動歯ブラシ、スマートロック、水道/電気/ガスメーター、玩具ロボット、ネットワークカメラの IR カットフィルタ、ビデオドアホン、血圧計、輸液ポンプなど電池駆動の小型モータ用途。',
        desc: '8-WSON の H ブリッジモータドライバ、VM 1.8-11V・VCC 1.8-5.5V、80mΩ RDS(ON)（HS+LS）・ピーク 8A、ハーフブリッジ並列（20mΩ）対応。UVLO/OCP/TSD 保護内蔵。DRV8210/8212/8220 は同ピン配置ファミリ（電圧/抵抗違い、ライブラリ未登録）。ADVANCE INFORMATION（2026-05 量産前文書）、量産前に最新版 datasheet で照合のこと。',
        thermalPad: 'サーマルパッドはシステムグラウンドへ接続（ピン表とピン図中央の両方で確認）',
        specs: [
          { k: 'モータ電源', v: '1.8V-11V（VM）' },
          { k: 'ロジック電源', v: '1.8V-5.5V（VCC）、1.8/3.3/5V ロジック対応' },
          { k: '出力', v: 'ピーク 8A、RDS(ON) 80mΩ（HS+LS 合計）；ハーフブリッジ並列 20mΩ' },
          { k: 'スリープ電流', v: '<120nA（VM=5V, VCC=3.3V, 25°C）' },
          { k: '制御インタフェース', v: 'PWM (IN1/IN2)、PH/EN、独立ハーフブリッジ、並列ハーフブリッジ' },
          { k: '保護', v: 'UVLO、OCP、TSD' }
        ]
      },
      ko: {
        subcategory: '브러시 DC 모터 드라이버(단일 채널 H-브리지)',
        whatIs: '11V/8A 단일 채널 H-브리지 브러시 DC 모터 드라이버: N채널 파워 FET 4개+3배압 차지 펌프+보호 회로를 단일 칩에 집적, 커패시터 전부 내장, 1.8V부터 동작.',
        func: 'PWM/PH-EN/독립 하프 브리지 3종 제어 인터페이스(MODE 3레벨 핀으로 선택)를 받아 양방향 브러시 모터 1개, 단방향 모터 2개, 릴레이나 솔레노이드를 구동; 슬립 모드 대기 전류 <120nA.',
        usedIn: '전동 칫솔, 스마트 도어락, 수도/전기/가스 계량기, 완구 로봇, 네트워크 카메라 IR-cut, 비디오 초인종, 혈압계, 수액 펌프 등 배터리 구동 소형 모터 응용.',
        desc: '8-WSON H-브리지 모터 드라이버, VM 1.8-11V, VCC 1.8-5.5V, 80mΩ RDS(ON)(HS+LS), 8A 피크, 하프 브리지 병렬(20mΩ) 지원. UVLO/OCP/TSD 보호 내장. DRV8210/8212/8220은 동일 핀 배치 패밀리(전압/저항 상이, 라이브러리 미등록). ADVANCE INFORMATION(2026-05 양산 전 문서), 양산 전 최신 datasheet로 확인 필요.',
        thermalPad: '서멀 패드는 시스템 그라운드에 연결(핀 표와 핀 다이어그램 중앙 양쪽으로 확인)',
        specs: [
          { k: '모터 전원', v: '1.8V-11V(VM)' },
          { k: '로직 전원', v: '1.8V-5.5V(VCC), 1.8/3.3/5V 로직 지원' },
          { k: '출력', v: '8A 피크, RDS(ON) 80mΩ(HS+LS 합계); 병렬 하프 브리지 20mΩ' },
          { k: '슬립 전류', v: '<120nA(VM=5V, VCC=3.3V, 25°C)' },
          { k: '제어 인터페이스', v: 'PWM (IN1/IN2), PH/EN, 독립 하프 브리지, 병렬 하프 브리지' },
          { k: '보호', v: 'UVLO, OCP, TSD' }
        ]
      }
    },
    'DRV81646-Q1': {
      en: {
        subcategory: 'Automotive quad low-side driver (Hardware/SPI)',
        whatIs: 'Automotive 65V quad integrated low-side switch: 140mΩ RDS(ON) per channel, built-in freewheeling diodes to VCLAMP, configurable current limit and slew rate.',
        func: 'Controls four low-side switches via hardware GPIO (independent PWM input per channel) or 4-wire SPI to drive relays/solenoid valves/LEDs/unidirectional motors; a single ILIM resistor sets a global 0.5-4A current limit, RSLEW/CNTL sets slew rate (100-1500ns), nFAULT reports faults.',
        usedIn: 'Relay/valve/LED driving in automotive body electronics and lighting, engine management, BMS and zone control units.',
        desc: '24-HVSSOP automotive (AEC-Q100 family) quad low-side driver, 4.5-65V (70V abs max), PWM up to 500kHz, independent per-channel overtemperature/overcurrent protection, configurable overcurrent-deglitch delay (COD 0.5-2ms) and INRUSH mode. SRC1-4 brought out separately for external sense resistors. ADVANCE INFORMATION (2026-05 pre-production document); recheck against the latest datasheet before production.',
        thermalPad: 'THERMAL PAD to system ground (confirmed by both the pin table and the pad in the center of the pin diagram); continuous ground copper with direct-connect vias',
        specs: [
          { k: 'Supply', v: '4.5V-65V (70V abs max)' },
          { k: 'Channels', v: '4 low-side channels, RDS(ON) 140mΩ/channel (25°C)' },
          { k: 'Current limit', v: '0.5A-4A selectable (global, via ILIM resistor)' },
          { k: 'PWM', v: 'Up to 500kHz' },
          { k: 'Slew rate', v: '100-1500ns configurable (RSLEW)' },
          { k: 'Interface', v: 'Hardware (per-channel PWM) or 4-wire SPI; nFAULT interrupt' },
          { k: 'Protection', v: 'Independent per-channel overtemp/overcurrent, COD 0.5-2ms, INRUSH mode' }
        ]
      },
      ja: {
        subcategory: '車載 4 チャネル ローサイドドライバ（Hardware/SPI）',
        whatIs: '車載 65V 4 チャネル集積ローサイドスイッチ：各チャネル 140mΩ RDS(ON)、VCLAMP への還流ダイオード内蔵、電流制限とスルーレートを設定可能。',
        func: 'ハードウェア GPIO（チャネルごとに独立 PWM 入力）または 4 線 SPI で 4 系統のローサイドスイッチを制御し、リレー/ソレノイドバルブ/LED/単方向モータを駆動；ILIM 抵抗 1 本で全チャネル一括 0.5-4A の電流制限を設定、RSLEW/CNTL でスルーレート（100-1500ns）を設定、nFAULT で故障を通知。',
        usedIn: '車体電装と照明、エンジン管理、BMS、ゾーンコントローラ（Zone Control Unit）のリレー/バルブ/LED 駆動。',
        desc: '24-HVSSOP 車載（AEC-Q100 系）4 チャネルローサイドドライバ、4.5-65V（絶対最大 70V）、PWM 最高 500kHz、チャネルごとに独立した過熱/過電流保護、過電流遮断遅延（COD 0.5-2ms）と INRUSH モード設定可能。SRC1-4 を個別に引き出し外付けセンス抵抗を接続可能。ADVANCE INFORMATION（2026-05 量産前文書）、量産前に最新版 datasheet で照合のこと。',
        thermalPad: 'THERMAL PAD はシステムグラウンドへ接続（ピン表とピン図中央の両方で確認）；連続したグラウンド銅箔＋direct-connect ビア',
        specs: [
          { k: '電源', v: '4.5V-65V（絶対最大 70V）' },
          { k: 'チャネル', v: 'ローサイド 4 チャネル、RDS(ON) 140mΩ/ch（25°C）' },
          { k: '電流制限', v: '0.5A-4A 選択可（ILIM 抵抗で一括設定）' },
          { k: 'PWM', v: '最高 500kHz' },
          { k: 'スルーレート', v: '100-1500ns 設定可（RSLEW）' },
          { k: 'インタフェース', v: 'Hardware（チャネル別 PWM）または 4 線 SPI；nFAULT 割り込み' },
          { k: '保護', v: 'チャネル独立の過熱/過電流、COD 0.5-2ms、INRUSH モード' }
        ]
      },
      ko: {
        subcategory: '차량용 4채널 로우사이드 드라이버(Hardware/SPI)',
        whatIs: '차량용 65V 4채널 집적 로우사이드 스위치: 채널당 140mΩ RDS(ON), VCLAMP로의 환류 다이오드 내장, 전류 제한과 슬루 레이트 설정 가능.',
        func: '하드웨어 GPIO(채널별 독립 PWM 입력) 또는 4선 SPI로 4개 로우사이드 스위치를 제어해 릴레이/솔레노이드 밸브/LED/단방향 모터를 구동; ILIM 저항 1개로 전 채널 공통 0.5-4A 전류 제한 설정, RSLEW/CNTL로 슬루 레이트(100-1500ns) 설정, nFAULT로 고장 보고.',
        usedIn: '차체 전장과 조명, 엔진 관리, BMS, 존 컨트롤러(Zone Control Unit)의 릴레이/밸브/LED 구동.',
        desc: '24-HVSSOP 차량용(AEC-Q100 계열) 4채널 로우사이드 드라이버, 4.5-65V(절대 최대 70V), PWM 최고 500kHz, 채널별 독립 과열/과전류 보호, 과전류 차단 지연(COD 0.5-2ms)과 INRUSH 모드 설정 가능. SRC1-4 개별 인출로 외부 센스 저항 연결 가능. ADVANCE INFORMATION(2026-05 양산 전 문서), 양산 전 최신 datasheet로 확인 필요.',
        thermalPad: 'THERMAL PAD는 시스템 그라운드에 연결(핀 표와 핀 다이어그램 중앙 양쪽으로 확인); 연속 그라운드 동박+direct-connect 비아',
        specs: [
          { k: '전원', v: '4.5V-65V(절대 최대 70V)' },
          { k: '채널', v: '로우사이드 4채널, RDS(ON) 140mΩ/채널(25°C)' },
          { k: '전류 제한', v: '0.5A-4A 선택 가능(ILIM 저항으로 공통 설정)' },
          { k: 'PWM', v: '최고 500kHz' },
          { k: '슬루 레이트', v: '100-1500ns 설정 가능(RSLEW)' },
          { k: '인터페이스', v: 'Hardware(채널별 PWM) 또는 4선 SPI; nFAULT 인터럽트' },
          { k: '보호', v: '채널별 독립 과열/과전류, COD 0.5-2ms, INRUSH 모드' }
        ]
      }
    },
    'FAN31790': {
      en: {
        subcategory: 'Fan controller (6-channel PWM/RPM, I2C)',
        whatIs: '6-channel intelligent fan controller: independent 9-bit PWM outputs plus dedicated TACH inputs for closed-loop speed control, I2C interface, pin-to-pin/BOM-to-BOM compatible with common fan controllers.',
        func: 'Drives 4-wire fans with six PWM channels (25Hz-25kHz) (3-wire/2-wire via external transistors), monitors up to 12 tachometer inputs at 11-bit; automatically adjusts duty cycle to hold the target RPM, enters a safe state on fault detection; power-on defaults are hardware-set by external pins.',
        usedIn: 'Fan speed control and monitoring on desktop/server motherboards, GPU cards and hardware accelerators, automotive seat fans, air purifiers.',
        desc: '28-LGA (4×4mm, pinout matches WQFN 4×4) 6-channel fan controller, 1.62-3.6V supply, -40 to 125°C. Built-in ±5% 32kHz oscillator, optional external 32.768kHz crystal (XTAL1/2) with CLKOUT output; I2C fast-mode 400kbps, 16 addresses (ADD0/1 quad-state); integrated watchdog. Register map compatible with existing driver software. Note: this package numbers pins counterclockwise (pin 1 bottom-left, pins 1-7 on the bottom edge).',
        thermalPad: 'Thermal pad (GND/VSS) to GND (confirmed by both the pin table and the pad in the center of the pin diagram)',
        specs: [
          { k: 'Supply', v: '1.62V-3.6V; -40°C to 125°C' },
          { k: 'PWM', v: '6 channels, 9-bit, 25Hz-25kHz, configurable duty ramp rate' },
          { k: 'TACH', v: '6 dedicated + PWMOUT reconfigurable, up to 12 channels, 11-bit' },
          { k: 'Interface', v: 'I2C fast-mode 400kbps, 16 hardware addresses' },
          { k: 'Clock', v: 'Built-in 32kHz ±5%; optional external 32.768kHz crystal; CLKOUT output' },
          { k: 'Compatibility', v: 'Pin-to-pin / BOM-to-BOM / register compatible with common fan controllers' }
        ]
      },
      ja: {
        subcategory: 'ファンコントローラ（6 チャネル PWM/RPM、I2C）',
        whatIs: '6 チャネルインテリジェントファンコントローラ：独立 9-bit PWM 出力＋専用 TACH 入力によるクローズドループ回転数制御、I2C インタフェース、一般的なファンコントローラと pin-to-pin/BOM-to-BOM 互換。',
        func: '6 系統の PWM（25Hz-25kHz）で 4 線ファンを駆動（3 線/2 線は外付けトランジスタ経由）、最大 12 系統の 11-bit タコメータ入力を監視；目標回転数を維持するようデューティ比を自動調整、故障検出時はセーフステートへ移行；電源投入時のデフォルト値は外部ピンでハードウェア設定。',
        usedIn: 'デスクトップ/サーバーマザーボード、GPU カードやハードウェアアクセラレータ、車載シートファン、空気清浄機のファン制御と監視。',
        desc: '28-LGA（4×4mm、ピン配置は WQFN 4×4 と同一）6 チャネルファンコントローラ、電源 1.62-3.6V、-40~125°C。±5% 32kHz 発振器内蔵、外付け 32.768kHz 水晶（XTAL1/2）対応・CLKOUT 出力；I2C fast-mode 400kbps、16 種アドレス（ADD0/1 4 値）；ウォッチドッグ集積。レジスタマップは既存ドライバソフトウェアと互換。注意：本パッケージは反時計回りのピン番号（pin 1 左下、1-7 が底辺）。',
        thermalPad: 'サーマルパッド（GND/VSS）は GND へ接続（ピン表とピン図中央の両方で確認）',
        specs: [
          { k: '電源', v: '1.62V-3.6V；-40°C~125°C' },
          { k: 'PWM', v: '6 チャネル 9-bit、25Hz-25kHz、デューティ変化率設定可' },
          { k: 'TACH', v: '専用 6＋PWMOUT 再構成可、最大 12 チャネル 11-bit' },
          { k: 'インタフェース', v: 'I2C fast-mode 400kbps、ハードウェアアドレス 16 種' },
          { k: 'クロック', v: '内蔵 32kHz ±5%；外付け 32.768kHz 水晶対応；CLKOUT 出力' },
          { k: '互換性', v: '一般的なファンコントローラと pin-to-pin / BOM-to-BOM / レジスタ互換' }
        ]
      },
      ko: {
        subcategory: '팬 컨트롤러(6채널 PWM/RPM, I2C)',
        whatIs: '6채널 지능형 팬 컨트롤러: 독립 9-bit PWM 출력+전용 TACH 입력의 폐루프 회전수 제어, I2C 인터페이스, 일반 팬 컨트롤러와 pin-to-pin/BOM-to-BOM 호환.',
        func: '6개 PWM(25Hz-25kHz)으로 4선 팬 구동(3선/2선은 외부 트랜지스터 경유), 최대 12개 11-bit 타코미터 입력 감시; 목표 회전수를 유지하도록 듀티비 자동 조정, 고장 감지 시 세이프 스테이트 진입; 전원 인가 시 기본값은 외부 핀으로 하드웨어 설정.',
        usedIn: '데스크톱/서버 메인보드, GPU 카드와 하드웨어 가속기, 차량 시트 팬, 공기청정기의 팬 속도 제어와 모니터링.',
        desc: '28-LGA(4×4mm, 핀 배치는 WQFN 4×4와 동일) 6채널 팬 컨트롤러, 전원 1.62-3.6V, -40~125°C. ±5% 32kHz 발진기 내장, 외부 32.768kHz 크리스털(XTAL1/2) 지원·CLKOUT 출력; I2C fast-mode 400kbps, 16종 주소(ADD0/1 4레벨); 워치독 집적. 레지스터 맵은 기존 드라이버 소프트웨어와 호환. 주의: 본 패키지는 반시계 방향 핀 번호(pin 1 왼쪽 아래, 1-7이 아래변).',
        thermalPad: '서멀 패드(GND/VSS)는 GND에 연결(핀 표와 핀 다이어그램 중앙 양쪽으로 확인)',
        specs: [
          { k: '전원', v: '1.62V-3.6V; -40°C~125°C' },
          { k: 'PWM', v: '6채널 9-bit, 25Hz-25kHz, 듀티 변화율 설정 가능' },
          { k: 'TACH', v: '전용 6+PWMOUT 재구성 가능, 최대 12채널 11-bit' },
          { k: '인터페이스', v: 'I2C fast-mode 400kbps, 하드웨어 주소 16종' },
          { k: '클록', v: '내장 32kHz ±5%; 외부 32.768kHz 크리스털 지원; CLKOUT 출력' },
          { k: '호환성', v: '일반 팬 컨트롤러와 pin-to-pin / BOM-to-BOM / 레지스터 호환' }
        ]
      }
    },
    'X4003': {
      en: {
        subcategory: 'CPU supervisor (POR + watchdog + low-voltage monitor)',
        whatIs: 'Three-in-one CPU supervisor: power-on reset (POR), selectable watchdog timer and supply-voltage monitor on a single chip, replacing three parts to cut cost.',
        func: 'Holds RESET active for 250ms at power-up so the supply and oscillator can stabilize; asserts RESET whenever VCC falls below the VTRIP threshold; the watchdog monitors SDA/SCL activity (fed by an I2C start+stop pattern) and resets the system if not serviced in time.',
        usedIn: 'Power supervision and hang recovery for microcontroller/microprocessor systems (the supervisor slot on industrial and embedded boards).',
        desc: '8-pin CPU supervisor (2005 Intersil document FN8113.0, now Renesas). Watchdog selectable 200ms/600ms/1.4s/off; five standard VTRIP levels (4.62/4.38/2.92/2.68/1.75V), trimmable via a special procedure; RESET valid down to VCC=1V. X4003 = active-low RESET, X4005 = active-high RESET (sister part, same datasheet). TSSOP pin map: WP=1, VCC=2, NC=3,4, RESET=5, VSS=6, SDA=7, SCL=8; MSOP: VCC=1, RESET=2, VSS=3, SDA=4, SCL=5, WP=6.',
        thermalPad: 'None (no exposed pad on SOIC/MSOP/TSSOP)',
        specs: [
          { k: 'Supply', v: '1.8V-5.5V' },
          { k: 'Watchdog', v: '200ms / 600ms / 1.4s / off, four settings (nonvolatile, lockable via WP)' },
          { k: 'VTRIP', v: 'Five standard levels 4.62/4.38/2.92/2.68/1.75V, programmable trim' },
          { k: 'Standby current', v: '12µA typ (watchdog on) / 800nA typ (watchdog off); 3mA active' },
          { k: 'Interface', v: 'I2C 400kHz' },
          { k: 'Variants', v: 'X4003 = active-low RESET; X4005 = active-high RESET (same datasheet)' }
        ]
      },
      ja: {
        subcategory: 'CPU スーパーバイザ（POR＋ウォッチドッグ＋低電圧監視）',
        whatIs: 'CPU スーパーバイザ 3-in-1：パワーオンリセット（POR）、選択可能なウォッチドッグタイマ、電源電圧監視をワンチップに集積し、3 部品を置き換えてコスト削減。',
        func: '電源投入時に RESET を 250ms 有効に保持し電源と発振器の安定を待つ；動作中 VCC が VTRIP しきい値を下回ると RESET をアサート；ウォッチドッグは SDA/SCL のアクティビティを監視（I2C start＋stop パターンで更新）、時間内に更新がなければリセット。',
        usedIn: 'マイコン/マイクロプロセッサシステムの電源監視とハングアップ自動復旧（産業用ボード・組込みシステムのスーパーバイザ枠）。',
        desc: '8 ピン CPU スーパーバイザ（2005 年 Intersil 文書 FN8113.0、現 Renesas）。ウォッチドッグ 200ms/600ms/1.4s/オフの 4 段選択；標準 VTRIP 5 段（4.62/4.38/2.92/2.68/1.75V）、特殊手順で微調整可；RESET は VCC=1V まで有効。X4003=RESET 負論理、X4005=RESET 正論理（同一 datasheet の姉妹品）。TSSOP ピン対応：WP=1,VCC=2,NC=3,4,RESET=5,VSS=6,SDA=7,SCL=8；MSOP：VCC=1,RESET=2,VSS=3,SDA=4,SCL=5,WP=6。',
        thermalPad: 'なし（SOIC/MSOP/TSSOP いずれも露出パッドなし）',
        specs: [
          { k: '電源', v: '1.8V-5.5V' },
          { k: 'ウォッチドッグ', v: '200ms / 600ms / 1.4s / オフ、4 段選択（不揮発設定、WP でロック可）' },
          { k: 'VTRIP', v: '標準 5 段 4.62/4.38/2.92/2.68/1.75V、プログラム微調整可' },
          { k: 'スタンバイ電流', v: '12µA typ（ウォッチドッグ有効）／800nA typ（無効）；動作時 3mA' },
          { k: 'インタフェース', v: 'I2C 400kHz' },
          { k: 'バリエーション', v: 'X4003=RESET 負論理；X4005=RESET 正論理（同一 datasheet）' }
        ]
      },
      ko: {
        subcategory: 'CPU 슈퍼바이저(POR+워치독+저전압 감시)',
        whatIs: 'CPU 슈퍼바이저 3-in-1: 파워온 리셋(POR), 선택 가능한 워치독 타이머, 전원 전압 감시를 단일 칩에 집적, 3개 부품을 대체해 비용 절감.',
        func: '전원 인가 시 RESET을 250ms 동안 유지해 전원과 발진기 안정화를 대기; 동작 중 VCC가 VTRIP 임계값 아래로 떨어지면 RESET 어서트; 워치독은 SDA/SCL 활동을 감시(I2C start+stop 패턴으로 갱신), 제때 갱신이 없으면 리셋.',
        usedIn: '마이크로컨트롤러/마이크로프로세서 시스템의 전원 감시와 행업 자동 복구(산업용 보드·임베디드 시스템의 슈퍼바이저 슬롯).',
        desc: '8핀 CPU 슈퍼바이저(2005년 Intersil 문서 FN8113.0, 현 Renesas). 워치독 200ms/600ms/1.4s/끄기 4단 선택; 표준 VTRIP 5단(4.62/4.38/2.92/2.68/1.75V), 특수 절차로 미세 조정 가능; RESET은 VCC=1V까지 유효. X4003=RESET 액티브 로우, X4005=RESET 액티브 하이(동일 datasheet 자매품). TSSOP 핀 대응: WP=1,VCC=2,NC=3,4,RESET=5,VSS=6,SDA=7,SCL=8; MSOP: VCC=1,RESET=2,VSS=3,SDA=4,SCL=5,WP=6.',
        thermalPad: '없음(SOIC/MSOP/TSSOP 모두 노출 패드 없음)',
        specs: [
          { k: '전원', v: '1.8V-5.5V' },
          { k: '워치독', v: '200ms / 600ms / 1.4s / 끄기, 4단 선택(비휘발 설정, WP로 잠금 가능)' },
          { k: 'VTRIP', v: '표준 5단 4.62/4.38/2.92/2.68/1.75V, 프로그램 미세 조정 가능' },
          { k: '대기 전류', v: '12µA typ(워치독 켬)/800nA typ(워치독 끔); 동작 3mA' },
          { k: '인터페이스', v: 'I2C 400kHz' },
          { k: '변형', v: 'X4003=RESET 액티브 로우; X4005=RESET 액티브 하이(동일 datasheet)' }
        ]
      }
    },
    'NX48P0407': {
      en: {
        subcategory: 'USB Type-C CC/SBU protection IC (48V, USB PD EPR)',
        whatIs: '48V Type-C CC and SBU line protection IC: ultra-fast OVP response protects the CC/SBU pins from short-to-VBUS damage, for USB PD EPR systems (up to 48V VBUS).',
        func: 'Sits between the USB PD controller (HOST side) and the Type-C connector (CON side); CC1/CC2 and SBU1/SBU2 each pass through a switch pair; on overvoltage it disconnects and reports via FLAG; built-in dead-battery Rd (DBRD pin) keeps the port recognizable by a source when there is no battery.',
        usedIn: 'Type-C port protection in USB PD EPR (28V/36V/48V) laptops/power banks/monitors, in front of the PD controller.',
        desc: 'HVQFN16 Type-C CC/SBU protection IC (NXP short datasheet Rev 1.0, 2024-08). Includes IEC ESD/surge protection, post clamp, OVP (OVPSEL-selectable), POR/OTP/UVLO, charge pump and dead-battery circuit. Note: the datasheet table misprints the CON_SBU1 description as "Connect SBU2" and CON_CC1 as "Connect CC2" — map by pin name.',
        thermalPad: 'Neither the pin table nor the pin diagram of the short datasheet shows an EP connection — HVQFN physically has a central exposed pad; confirm the connection with the full NXP datasheet (honest scoping, nothing invented)',
        specs: [
          { k: 'Protects', v: 'Type-C CC1/CC2 and SBU1/SBU2 against short-to-VBUS (up to 48V PD EPR)' },
          { k: 'Protection', v: 'Ultra-fast OVP disconnect, IEC ESD/surge protection, post clamp, OTP' },
          { k: 'Dead battery', v: 'Built-in Rd (DBRD_CC1/CC2), recognizable by a source with no battery' },
          { k: 'Indication', v: 'FLAG open-drain active-low fault output' },
          { k: 'Document', v: 'Product short data sheet Rev 1.0 (2024-08); full specs in the complete NXP datasheet' }
        ]
      },
      ja: {
        subcategory: 'USB Type-C CC/SBU 保護 IC（48V、USB PD EPR）',
        whatIs: '48V Type-C CC/SBU ライン保護 IC：超高速 OVP 応答で CC/SBU ピンを short-to-VBUS 破壊から保護、USB PD EPR（最大 48V VBUS）システム対応。',
        func: 'USB PD コントローラ（HOST 側）と Type-C コネクタ（CON 側）の間に直列挿入、CC1/CC2 と SBU1/SBU2 はそれぞれスイッチ対を経由；過電圧を検出すると遮断し FLAG で通知；dead-battery Rd 内蔵（DBRD ピン）でバッテリなし状態でも給電側から認識可能。',
        usedIn: 'USB PD EPR（28V/36V/48V）ノート PC/モバイルバッテリ/モニタの Type-C ポート保護、PD コントローラ前段。',
        desc: 'HVQFN16 の Type-C CC/SBU 保護 IC（NXP ショート datasheet Rev 1.0、2024-08）。IEC ESD/サージ保護、post clamp、OVP（OVPSEL 選択）、POR/OTP/UVLO、チャージポンプ、dead-battery 回路内蔵。注意：datasheet 表では CON_SBU1 の説明が「Connect SBU2」、CON_CC1 が「Connect CC2」と誤植——ピン名で対応付けること。',
        thermalPad: 'ショート datasheet のピン表・ピン図とも EP 接続の記載なし——HVQFN は物理的に中央露出パッドを持つ；接続は NXP 完全版 datasheet で確認のこと（誠実な範囲設定、創作しない）',
        specs: [
          { k: '保護対象', v: 'Type-C CC1/CC2 と SBU1/SBU2 の short-to-VBUS（最大 48V PD EPR）' },
          { k: '保護機構', v: '超高速 OVP 遮断、IEC ESD/サージ保護、post clamp、OTP' },
          { k: 'Dead battery', v: 'Rd 内蔵（DBRD_CC1/CC2）、バッテリなしでも給電側から認識可能' },
          { k: '表示', v: 'FLAG オープンドレイン負論理フォールト出力' },
          { k: '文書', v: 'Product short data sheet Rev 1.0（2024-08）；完全な仕様は NXP 完全版参照' }
        ]
      },
      ko: {
        subcategory: 'USB Type-C CC/SBU 보호 IC(48V, USB PD EPR)',
        whatIs: '48V Type-C CC/SBU 라인 보호 IC: 초고속 OVP 응답으로 CC/SBU 핀을 short-to-VBUS 손상에서 보호, USB PD EPR(최대 48V VBUS) 시스템 지원.',
        func: 'USB PD 컨트롤러(HOST 측)와 Type-C 커넥터(CON 측) 사이에 직렬 삽입, CC1/CC2와 SBU1/SBU2는 각각 스위치 쌍 경유; 과전압 감지 시 차단하고 FLAG로 보고; dead-battery Rd 내장(DBRD 핀)으로 배터리 없는 상태에서도 전원 공급 측이 인식 가능.',
        usedIn: 'USB PD EPR(28V/36V/48V) 노트북/보조 배터리/모니터의 Type-C 포트 보호, PD 컨트롤러 전단.',
        desc: 'HVQFN16 Type-C CC/SBU 보호 IC(NXP 쇼트 datasheet Rev 1.0, 2024-08). IEC ESD/서지 보호, post clamp, OVP(OVPSEL 선택), POR/OTP/UVLO, 차지 펌프, dead-battery 회로 내장. 주의: datasheet 표에서 CON_SBU1 설명이 「Connect SBU2」, CON_CC1이 「Connect CC2」로 오기——핀 이름으로 대응할 것.',
        thermalPad: '쇼트 datasheet의 핀 표·핀 다이어그램 모두 EP 연결 표기 없음——HVQFN은 물리적으로 중앙 노출 패드 보유; 연결은 NXP 완전판 datasheet로 확인(정직한 범위 설정, 창작하지 않음)',
        specs: [
          { k: '보호 대상', v: 'Type-C CC1/CC2와 SBU1/SBU2의 short-to-VBUS(최대 48V PD EPR)' },
          { k: '보호 기구', v: '초고속 OVP 차단, IEC ESD/서지 보호, post clamp, OTP' },
          { k: 'Dead battery', v: 'Rd 내장(DBRD_CC1/CC2), 배터리 없이도 전원 공급 측이 인식 가능' },
          { k: '표시', v: 'FLAG 오픈 드레인 액티브 로우 고장 출력' },
          { k: '문서', v: 'Product short data sheet Rev 1.0(2024-08); 완전한 사양은 NXP 완전판 참조' }
        ]
      }
    },
    'MCT8376Z-Q1': {
      en: {
        subcategory: 'Sensored trapezoidal BLDC motor driver (integrated power FETs)',
        whatIs: 'Sensored (Hall-based) trapezoidal (120° square-wave) three-phase BLDC motor driver with six integrated power MOSFETs (three half-bridges) — completes BLDC commutation without an external gate driver or MCU.',
        func: 'Three built-in analog Hall comparators read the rotor position; a fixed-function state machine performs 120° sensored trapezoidal commutation; PWM input controls speed, DIR/BRAKE control direction and braking, nFAULT outputs fault status. Two configuration variants: MCT8376ZS-Q1 provides a 5MHz 16-bit SPI for configuration and fault-diagnostics readout; MCT8376ZH-Q1 uses external resistors on dedicated pins for hardware configuration (ADVANCE, MODE, GAIN_SLEW_tLOCK and other 7-level resistor-divider inputs).',
        usedIn: 'HVAC blowers, office automation machines, factory automation and robotics, wireless antenna rotation motors, drones and other 4.5-65V BLDC motor modules.',
        desc: '28-VQFN exposed-pad package, 4.5V-65V operation (70V abs max), 400mΩ RDS(ON) (high side + low side) @TA=25°C, 4.5A peak output; two built-in LDOs (3.3V/30mA and 5V/30mA); UVLO, CPUV, OCP (cycle-by-cycle phase-current limit), motor-lock protection, OTW/OTSD. This entry is the generic MCT8376Z-Q1 covering the hardware variant MCT8376ZH-Q1 and the SPI variant MCT8376ZS-Q1 — both share the same 28-VQFN package and pin numbering; only pins 20/21/22/23 differ by variant, and both functions are listed in each pin description.',
        thermalPad: 'Thermal pad must be connected to analog ground AGND (Table 5-1: Must be connected to analog ground).',
        specs: [
          { k: 'Operating voltage', v: '4.5V-65V (70V abs max)' },
          { k: 'RDS(ON)', v: '400mΩ (high side + low side) @TA=25°C' },
          { k: 'Peak output current', v: '4.5A' },
          { k: 'Sleep current', v: '1.5µA typ (VVM=24V, TA=25°C)' },
          { k: 'PWM frequency', v: 'Up to 100kHz' },
          { k: 'LDO', v: 'Built-in 3.3V/30mA and 5V/30mA LDOs' },
          { k: 'Configuration interface', v: 'H-Q1: external-resistor hardware config; S-Q1: 5MHz 16-bit SPI' }
        ]
      },
      ja: {
        subcategory: 'センサ付き台形波 BLDC モータドライバ（パワー FET 集積）',
        whatIs: 'センサ付き（Hall ベース）台形波（120° 方形波）三相ブラシレス DC モータドライバ：パワー MOSFET 6 個（ハーフブリッジ 3 組）内蔵、外付けゲートドライバや MCU なしで BLDC 転流制御を完結。',
        func: '内蔵アナログ Hall コンパレータ 3 組でロータ位置を読み取り、固定機能ステートマシンが 120° センサ付き台形波転流を実行；PWM 入力で回転数制御、DIR/BRAKE で方向とブレーキ、nFAULT で故障状態を出力。設定バリアント 2 種：MCT8376ZS-Q1 は 5MHz 16-bit SPI で設定と故障診断読み出し；MCT8376ZH-Q1 は特定ピンの外付け抵抗によるハードウェア設定（ADVANCE、MODE、GAIN_SLEW_tLOCK など 7 レベル抵抗分圧入力）。',
        usedIn: 'HVAC 送風モータ、オフィスオートメーション機器、工場自動化とロボット、無線アンテナ回転モータ、ドローンなど 4.5-65V BLDC モータモジュール。',
        desc: '28-VQFN 露出パッドパッケージ、4.5V-65V 動作（絶対最大 70V）、400mΩ RDS(ON)（ハイサイド+ローサイド合計）@TA=25°C、ピーク出力 4.5A；3.3V/30mA と 5V/30mA の LDO 2 系統内蔵；UVLO、CPUV、OCP（サイクルごとの相電流制限）、モータロック保護、OTW/OTSD。本エントリは汎用型番 MCT8376Z-Q1 としてハードウェア設定版 MCT8376ZH-Q1 と SPI 版 MCT8376ZS-Q1 をカバー——両者は同一 28-VQFN パッケージとピン番号を共有し、pin20/21/22/23 の 4 ピンのみバリアントで機能が異なる（各ピン説明に両バリアントの機能を併記）。',
        thermalPad: 'サーマルパッドはアナロググラウンド AGND へ接続必須（Table 5-1 明記：Must be connected to analog ground）。',
        specs: [
          { k: '動作電圧', v: '4.5V-65V（絶対最大 70V）' },
          { k: 'RDS(ON)', v: '400mΩ（ハイサイド+ローサイド合計）@TA=25°C' },
          { k: 'ピーク出力電流', v: '4.5A' },
          { k: 'スリープ電流', v: '1.5µA typ（VVM=24V, TA=25°C）' },
          { k: 'PWM 周波数', v: '最高 100kHz' },
          { k: 'LDO', v: '3.3V/30mA、5V/30mA 各 1 系統内蔵' },
          { k: '設定インタフェース', v: 'H-Q1：外付け抵抗ハードウェア設定；S-Q1：5MHz 16-bit SPI' }
        ]
      },
      ko: {
        subcategory: '센서형 사다리꼴파 BLDC 모터 드라이버(파워 FET 집적)',
        whatIs: '센서형(Hall 기반) 사다리꼴파(120° 구형파) 3상 브러시리스 DC 모터 드라이버: 파워 MOSFET 6개(하프 브리지 3조) 내장, 외부 게이트 드라이버나 MCU 없이 BLDC 정류 제어 완결.',
        func: '내장 아날로그 Hall 비교기 3조로 로터 위치를 읽고 고정 기능 상태 머신이 120° 센서형 사다리꼴파 정류를 수행; PWM 입력으로 속도 제어, DIR/BRAKE로 방향과 제동, nFAULT로 고장 상태 출력. 설정 변형 2종: MCT8376ZS-Q1은 5MHz 16-bit SPI로 설정과 고장 진단 판독; MCT8376ZH-Q1은 특정 핀의 외부 저항으로 하드웨어 설정(ADVANCE, MODE, GAIN_SLEW_tLOCK 등 7레벨 저항 분압 입력).',
        usedIn: 'HVAC 송풍 모터, 사무 자동화 기기, 공장 자동화와 로봇, 무선 안테나 회전 모터, 드론 등 4.5-65V BLDC 모터 모듈.',
        desc: '28-VQFN 노출 패드 패키지, 4.5V-65V 동작(절대 최대 70V), 400mΩ RDS(ON)(하이사이드+로우사이드 합계) @TA=25°C, 피크 출력 4.5A; 3.3V/30mA와 5V/30mA LDO 2조 내장; UVLO, CPUV, OCP(사이클 단위 상전류 제한), 모터 잠금 보호, OTW/OTSD. 본 항목은 범용 형번 MCT8376Z-Q1로 하드웨어 설정판 MCT8376ZH-Q1과 SPI판 MCT8376ZS-Q1을 포괄——둘은 동일 28-VQFN 패키지와 핀 번호를 공유하며 pin20/21/22/23 4핀만 변형별로 기능이 다름(각 핀 설명에 두 변형 기능 병기).',
        thermalPad: '서멀 패드는 아날로그 그라운드 AGND에 연결 필수(Table 5-1 명기: Must be connected to analog ground).',
        specs: [
          { k: '동작 전압', v: '4.5V-65V(절대 최대 70V)' },
          { k: 'RDS(ON)', v: '400mΩ(하이사이드+로우사이드 합계) @TA=25°C' },
          { k: '피크 출력 전류', v: '4.5A' },
          { k: '슬립 전류', v: '1.5µA typ(VVM=24V, TA=25°C)' },
          { k: 'PWM 주파수', v: '최고 100kHz' },
          { k: 'LDO', v: '3.3V/30mA, 5V/30mA 각 1조 내장' },
          { k: '설정 인터페이스', v: 'H-Q1: 외부 저항 하드웨어 설정; S-Q1: 5MHz 16-bit SPI' }
        ]
      }
    },
    'DRV8363': {
      en: {
        subcategory: '48V three-phase smart gate driver (external power MOSFETs)',
        whatIs: '48V-battery three-phase smart gate driver (external power MOSFETs): drives six N-channel MOSFETs forming three half-bridges, with a built-in low-side precision current-sense amplifier and full fault monitoring.',
        func: 'Drives three high-side/low-side gate pairs with a bootstrap architecture; the Smart Gate Drive architecture offers 15 adjustable peak gate-drive current levels (up to 1A source / 2A sink) and supports 6x, 3x, 1x and independent PWM control modes; SPI provides detailed configuration and fault-diagnostics readout, DRVOFF independently disables the driver outputs, ASCIN triggers active-short-circuit braking.',
        usedIn: 'Home appliances, cordless garden and power tools, lawn mowers, BLDC/PMSM motor modules, fan/pump/servo drives, e-bikes/scooters, cordless vacuums, drones and industrial/logistics robots, RC toys and other 48V battery motor applications.',
        desc: '48-QFN exposed-pad package, 8V-85V wide operating range, 50mA average gate-switching current drives 400nC MOSFETs @20kHz; the trickle charge pump supports 100% PWM duty and provides overdrive supply for external switches. Low-side current-sense amplifier: 1mV input offset, 4 selectable gains, adjustable output bias for unidirectional or bidirectional sensing. Integrated battery/supply voltage monitors, MOSFET VDS and Rsense overcurrent monitors, VGS gate-fault monitor, thermal warning/shutdown and a fault-indication pin.',
        thermalPad: 'Exposed pad is thermal-only, not an electrical ground — high-impedance to GND/AGND (datasheet Layout chapter p.87); Table 4-1 Pin Functions does not list it as a separate pin.',
        specs: [
          { k: 'Operating voltage', v: '8V-85V (VDRAIN)' },
          { k: 'Gate-drive current', v: '15 levels, up to 1A source / 2A sink' },
          { k: 'MOSFET drive capability', v: '50mA average gate-switching current, drives 400nC MOSFETs @20kHz' },
          { k: 'Current sensing', v: 'Low-side shunt amplifier, 1mV input offset, 4 selectable gains' },
          { k: 'Control interface', v: 'SPI configuration and diagnostics; 6x/3x/1x/independent PWM modes' },
          { k: 'Protection', v: 'Supply voltage monitors, VDS/Rsense overcurrent, VGS gate fault, thermal warning/shutdown' }
        ]
      },
      ja: {
        subcategory: '48V 三相スマートゲートドライバ（外付けパワー MOSFET）',
        whatIs: '48V バッテリ用三相スマートゲートドライバ（外付けパワー MOSFET）：N チャネル MOSFET 6 個で構成する三相ハーフブリッジを駆動、ローサイド高精度電流センスアンプと完全な故障監視を内蔵。',
        func: 'ブートストラップ構成で 3 組のハイサイド/ローサイドゲートを駆動、Smart Gate Drive アーキテクチャは 15 段可変ピークゲート駆動電流（最大 1A ソース / 2A シンク）を提供し、6x、3x、1x、独立 PWM の 4 制御モードに対応；SPI で詳細設定と故障診断読み出し、DRVOFF でドライバ出力を独立遮断、ASCIN でアクティブ短絡（active short circuit）ブレーキを起動。',
        usedIn: '家電、コードレス園芸/電動工具、芝刈り機、BLDC/PMSM モータモジュール、ファン/ポンプ/サーボ駆動、電動自転車/キックボード、コードレス掃除機、ドローン、産業/物流ロボット、RC トイなど 48V バッテリモータ用途。',
        desc: '48-QFN 露出パッドパッケージ、8V-85V 広動作電圧、平均ゲートスイッチング電流 50mA で 400nC MOSFET を 20kHz 駆動；トリクルチャージポンプが 100% PWM デューティに対応し外部スイッチへ overdrive 電源を供給。ローサイド電流センスアンプは入力オフセット 1mV、4 段可変ゲイン、出力バイアス調整で単方向/双方向センシングに対応。バッテリ/電源電圧監視、MOSFET VDS と Rsense 過電流監視、VGS ゲート故障監視、熱警告/シャットダウン、故障表示ピンを集積。',
        thermalPad: '露出パッドは放熱専用で電気的グラウンドではない——GND/AGND とは高インピーダンス接続（datasheet Layout 章 p.87 明記）；Table 4-1 Pin Functions には独立ピンとして記載なし。',
        specs: [
          { k: '動作電圧', v: '8V-85V（VDRAIN）' },
          { k: 'ゲート駆動電流', v: '15 段可変、最大 1A ソース / 2A シンク' },
          { k: '駆動可能 MOSFET', v: '平均ゲートスイッチング電流 50mA、400nC MOSFET を 20kHz で駆動' },
          { k: '電流センス', v: 'ローサイドシャントアンプ、入力オフセット 1mV、4 段可変ゲイン' },
          { k: '制御インタフェース', v: 'SPI 設定と診断；6x/3x/1x/独立 PWM モード' },
          { k: '保護', v: '電源電圧監視、VDS/Rsense 過電流、VGS ゲート故障、熱警告/シャットダウン' }
        ]
      },
      ko: {
        subcategory: '48V 3상 스마트 게이트 드라이버(외부 파워 MOSFET)',
        whatIs: '48V 배터리용 3상 스마트 게이트 드라이버(외부 파워 MOSFET): N채널 MOSFET 6개로 구성한 3상 하프 브리지를 구동, 로우사이드 정밀 전류 감지 앰프와 완전한 고장 모니터링 내장.',
        func: '부트스트랩 구조로 3조의 하이사이드/로우사이드 게이트를 구동, Smart Gate Drive 아키텍처는 15단 가변 피크 게이트 구동 전류(최대 1A 소스/2A 싱크)를 제공하고 6x, 3x, 1x, 독립 PWM 4가지 제어 모드 지원; SPI로 상세 설정과 고장 진단 판독, DRVOFF로 드라이버 출력 독립 차단, ASCIN으로 능동 단락(active short circuit) 제동 트리거.',
        usedIn: '가전, 무선 정원/전동 공구, 잔디깎이, BLDC/PMSM 모터 모듈, 팬/펌프/서보 드라이브, 전기자전거/킥보드, 무선 청소기, 드론, 산업/물류 로봇, RC 완구 등 48V 배터리 모터 응용.',
        desc: '48-QFN 노출 패드 패키지, 8V-85V 광범위 동작 전압, 평균 게이트 스위칭 전류 50mA로 400nC MOSFET을 20kHz 구동; 트리클 차지 펌프가 100% PWM 듀티를 지원하고 외부 스위치에 overdrive 전원 공급. 로우사이드 전류 감지 앰프는 입력 오프셋 1mV, 4단 가변 이득, 출력 바이어스 조정으로 단방향/양방향 감지 지원. 배터리/전원 전압 감시, MOSFET VDS와 Rsense 과전류 감시, VGS 게이트 고장 감시, 열 경고/셧다운, 고장 표시 핀 집적.',
        thermalPad: '노출 패드는 방열 전용으로 전기적 그라운드가 아님——GND/AGND와는 고임피던스 연결(datasheet Layout 장 p.87 명기); Table 4-1 Pin Functions에는 독립 핀으로 기재 없음.',
        specs: [
          { k: '동작 전압', v: '8V-85V(VDRAIN)' },
          { k: '게이트 구동 전류', v: '15단 가변, 최대 1A 소스/2A 싱크' },
          { k: '구동 가능 MOSFET', v: '평균 게이트 스위칭 전류 50mA, 400nC MOSFET을 20kHz로 구동' },
          { k: '전류 감지', v: '로우사이드 션트 앰프, 입력 오프셋 1mV, 4단 가변 이득' },
          { k: '제어 인터페이스', v: 'SPI 설정과 진단; 6x/3x/1x/독립 PWM 모드' },
          { k: '보호', v: '전원 전압 감시, VDS/Rsense 과전류, VGS 게이트 고장, 열 경고/셧다운' }
        ]
      }
    }
  };
  Object.assign(window.IC_I18N, T);
})();

(function () {
  var T = {
    'DRV8762-Q1': {
      en: {
        subcategory: 'Automotive 48V H-Bridge Smart Gate Driver (external power MOSFETs)',
        whatIs: 'Automotive-grade 48V H-bridge smart gate driver (external power MOSFETs): drives four N-channel MOSFETs forming one H-bridge, with an integrated low-side precision current-sense amplifier and full fault monitoring, AEC-Q100 qualified.',
        func: 'Uses a bootstrap architecture to drive two high-side/low-side gate pairs; the Smart Gate Drive architecture provides 8-step adjustable peak gate-drive current (up to 224mA source / 448mA sink); supports 4x and 2x PWM modes; SPI provides detailed configuration and fault-diagnostic readback; DRVOFF independently disables the driver outputs; ASCIN triggers active short-circuit braking. The 48-QFN package shares the same pin framework as the six-channel DRV8363, with most unused channels shown as RSVD reserved pins.',
        usedIn: '48V automotive motor-control applications such as automotive body motors, transmission actuators, and automotive brushed-DC (BDC) motors.',
        desc: '48-QFN exposed-pad package, AEC-Q100 automotive-grade (device ambient -40C to +125C), 8V-85V wide operating voltage; 50mA average gate switching current can drive a 400nC MOSFET @20kHz; a trickle charge pump supports 100% PWM duty cycle and provides overdrive supply to the external switches. Low-side current-sense amplifier with 1mV input offset and 4-step adjustable gain. Integrated protections include battery/supply voltage monitoring, MOSFET VDS and Rsense overcurrent monitoring, VGS gate-fault monitoring, device thermal warning/shutdown and a fault-indication pin. BSTB2(pin46)/SHB2(pin47) are parallel auxiliary bootstrap/source-sense pins for channel B, tied to BSTB(pin45)/SHB(pin44) respectively.',
        thermalPad: 'The exposed pad is for heat dissipation only, not electrical ground; it is high-impedance to GND/AGND (stated in the datasheet Layout section, p.75). Table 4-1 Pin Functions does not list this pad separately.',
        specs: [
          { k: 'Temp grade', v: 'AEC-Q100, device ambient -40C to +125C' },
          { k: 'Operating voltage', v: '8V-85V (VDRAIN)' },
          { k: 'Gate-drive current', v: '8-step adjustable, up to 224mA source / 448mA sink' },
          { k: 'MOSFET drive', v: '50mA average gate switching current, drives 400nC MOSFET @20kHz' },
          { k: 'Current sense', v: 'Low-side shunt amplifier, 1mV input offset, 4-step adjustable gain' },
          { k: 'Control interface', v: 'SPI configuration and diagnostics; 4x/2x PWM modes' }
        ]
      },
      ja: {
        subcategory: '車載48V Hブリッジ スマートゲートドライバ（外付けパワーMOSFET）',
        whatIs: '車載グレード48V Hブリッジ スマートゲートドライバ（外付けパワーMOSFET）：4個のNチャネルMOSFETを駆動して1組のHブリッジを構成し、ローサイド精密電流センスアンプと完全な故障監視を内蔵、AEC-Q100認定済み。',
        func: 'ブートストラップ構成で2組のハイサイド/ローサイドゲートを駆動し、Smart Gate Driveアーキテクチャが8段階調整可能なピークゲート駆動電流（最大224mAソース/448mAシンク）を提供；4xおよび2x PWMモードに対応；SPIで詳細設定と故障診断の読み出しが可能；DRVOFFでドライバ出力を個別に無効化；ASCINでアクティブショートブレーキを起動。48-QFNパッケージは6チャネル版DRV8363と同じピンフレームを共有し、未使用チャネルの多くはRSVD予約ピンとして現れる。',
        usedIn: '車載ボディモータ、トランスミッションアクチュエータ、車載ブラシ付きDCモータなど、48V車載モータ制御アプリケーション。',
        desc: '48-QFN露出パッドパッケージ、AEC-Q100車載グレード（デバイス周囲温度-40C～+125C）、8V～85Vの広い動作電圧；50mAの平均ゲートスイッチング電流で400nC MOSFETを20kHzで駆動可能；トリクルチャージポンプが100% PWMデューティに対応し、外部スイッチにオーバードライブ電源を供給。ローサイド電流センスアンプは入力オフセット1mV、4段階調整可能ゲイン。バッテリ/電源電圧監視、MOSFET VDSおよびRsense過電流監視、VGSゲート故障監視、デバイス過熱警告/シャットダウン、故障表示ピンなどの保護を統合。BSTB2(pin46)/SHB2(pin47)はBチャネルのブートストラップ/ソースセンス並列補助ピンで、それぞれBSTB(pin45)/SHB(pin44)に接続する。',
        thermalPad: '露出パッドは放熱専用で電気的なグランドではなく、GND/AGNDに対して高インピーダンス接続（datasheet Layout章 p.75に明記）；Table 4-1 Pin Functionsにこのパッドは個別に記載されていない。',
        specs: [
          { k: '温度グレード', v: 'AEC-Q100、デバイス周囲温度 -40C～+125C' },
          { k: '動作電圧', v: '8V～85V（VDRAIN）' },
          { k: 'ゲート駆動電流', v: '8段階調整、最大224mAソース/448mAシンク' },
          { k: '駆動可能MOSFET', v: '50mA平均ゲートスイッチング電流、400nC MOSFETを20kHzで駆動可能' },
          { k: '電流センス', v: 'ローサイドシャントアンプ、入力オフセット1mV、4段階調整ゲイン' },
          { k: '制御インターフェース', v: 'SPI設定と診断；4x/2x PWMモード' }
        ]
      },
      ko: {
        subcategory: '차량용 48V H-브리지 스마트 게이트 드라이버 (외부 파워 MOSFET)',
        whatIs: '차량용 등급 48V H-브리지 스마트 게이트 드라이버 (외부 파워 MOSFET): 4개의 N채널 MOSFET을 구동하여 하나의 H-브리지를 구성하며, 로우사이드 정밀 전류 감지 증폭기와 완전한 고장 감시를 내장, AEC-Q100 인증 완료.',
        func: '부트스트랩 구조로 2조의 하이사이드/로우사이드 게이트를 구동하며, Smart Gate Drive 아키텍처가 8단계 조정 가능한 피크 게이트 구동 전류(최대 224mA 소스 / 448mA 싱크)를 제공; 4x 및 2x PWM 모드 지원; SPI로 상세 설정과 고장 진단 읽기 제공; DRVOFF로 드라이버 출력을 독립적으로 비활성화; ASCIN으로 능동 단락 제동을 트리거. 48-QFN 패키지는 6채널 버전 DRV8363과 동일한 핀 프레임을 공유하며, 사용하지 않는 대부분의 채널은 RSVD 예약 핀으로 표시된다.',
        usedIn: '차량용 바디 모터, 변속기 액추에이터, 차량용 브러시 DC 모터 등 48V 차량용 모터 제어 응용.',
        desc: '48-QFN 노출 패드 패키지, AEC-Q100 차량용 등급(소자 주위 온도 -40C~+125C), 8V~85V 광범위 동작 전압; 50mA 평균 게이트 스위칭 전류로 400nC MOSFET을 20kHz에서 구동 가능; 트리클 차지 펌프가 100% PWM 듀티를 지원하고 외부 스위치에 오버드라이브 전원을 공급. 로우사이드 전류 감지 증폭기는 입력 오프셋 1mV, 4단계 조정 가능 게인. 배터리/전원 전압 감시, MOSFET VDS 및 Rsense 과전류 감시, VGS 게이트 고장 감시, 소자 과열 경고/셧다운, 고장 표시 핀 등의 보호를 통합. BSTB2(pin46)/SHB2(pin47)은 B채널의 부트스트랩/소스 감지 병렬 보조 핀으로, 각각 BSTB(pin45)/SHB(pin44)에 연결된다.',
        thermalPad: '노출 패드는 방열 전용이며 전기적 접지가 아니고, GND/AGND에 대해 고임피던스 연결(datasheet Layout 장 p.75에 명기); Table 4-1 Pin Functions에 이 패드는 별도로 기재되어 있지 않다.',
        specs: [
          { k: '온도 등급', v: 'AEC-Q100, 소자 주위 온도 -40C~+125C' },
          { k: '동작 전압', v: '8V~85V (VDRAIN)' },
          { k: '게이트 구동 전류', v: '8단계 조정, 최대 224mA 소스 / 448mA 싱크' },
          { k: '구동 가능 MOSFET', v: '50mA 평균 게이트 스위칭 전류, 400nC MOSFET을 20kHz에서 구동 가능' },
          { k: '전류 감지', v: '로우사이드 션트 증폭기, 입력 오프셋 1mV, 4단계 조정 게인' },
          { k: '제어 인터페이스', v: 'SPI 설정 및 진단; 4x/2x PWM 모드' }
        ]
      }
    },
    'MCF8329HS': {
      en: {
        subcategory: 'Sensorless FOC Three-Phase BLDC Motor Gate Driver (external power MOSFETs)',
        whatIs: 'Sensorless field-oriented control (FOC) three-phase BLDC/PMSM motor gate driver (external power MOSFETs), with a built-in code-free FOC algorithm that drives the motor without an MCU.',
        func: 'Built-in sensorless FOC algorithm supporting up to 2.5kHz electrical frequency, offering speed/current/power/voltage control modes and supporting forward/reverse rotation and windmilling; configurable power and speed limits; control input can be analog, PWM, frequency or I2C; settings can be stored in EEPROM for standalone operation; provides external-MCU watchdog monitoring and a limp-home mode; supports one optional Hall input for position backup.',
        usedIn: '12V/24V BLDC/PMSM motor applications such as cordless vacuum cleaners, dishwasher/washing-machine pumps, appliance fans and pumps, cordless garden and power tools, and lawn mowers.',
        desc: '36-WQFN exposed-pad package, 4.5V-60V operating voltage, 65V three-phase half-bridge gate driver, bootstrap architecture supporting 100% duty cycle, 1A/2A peak source/sink current; sleep current max 5uA @24V, 25C; configurable EEPROM with read/write safety mechanism; supports up to 80kHz PWM switching frequency; configurable LDO (3.3V or 5V +/-3%, 80mA). A functional-safety-certified version MCF8329HSULIREER (UL 60730-1 certified, with locked-rotor, overload and phase-loss safety functions) shares the same 36-WQFN package and pinout as the standard MCF8329HSIREER.',
        thermalPad: 'The Thermal Pad must be connected to ground (Table 5-1 states: Must be connected to ground).',
        specs: [
          { k: 'Operating voltage', v: '4.5V-60V' },
          { k: 'Electrical frequency', v: 'Up to 2.5kHz' },
          { k: 'Gate-drive current', v: '1A/2A peak source/sink' },
          { k: 'Sleep current', v: '5uA max @24V, 25C' },
          { k: 'PWM switching frequency', v: 'Up to 80kHz' },
          { k: 'LDO', v: 'Configurable 3.3V or 5V +/-3%, 80mA' },
          { k: 'Control input', v: 'Analog, PWM, frequency or I2C' }
        ]
      },
      ja: {
        subcategory: 'センサレスFOC三相ブラシレスモータ ゲートドライバ（外付けパワーMOSFET）',
        whatIs: 'センサレス磁界方向制御（FOC）三相ブラシレス/PMSMモータ ゲートドライバ（外付けパワーMOSFET）、code-free FOCアルゴリズムを内蔵し、MCUなしでモータを駆動可能。',
        func: 'センサレスFOCアルゴリズムを内蔵し、最大2.5kHzの電気周波数に対応、速度/電流/電力/電圧などの制御モードを提供、正転/逆転およびウインドミリング（風による自転）に対応；電力と回転数の上限を設定可能；制御入力はアナログ、PWM、周波数またはI2C；設定をEEPROMに保存でき、デバイス単独動作が可能；外部MCUウォッチドッグ監視とlimp-homeモードを備える；位置バックアップ用に1個のHall入力をオプション対応。',
        usedIn: 'コードレス掃除機、食洗機/洗濯機ポンプ、家電ファンとポンプ、コードレス園芸/電動工具、芝刈り機など12V/24V BLDC/PMSMモータアプリケーション。',
        desc: '36-WQFN露出パッドパッケージ、4.5V～60V動作電圧、65V三相ハーフブリッジゲートドライバ、ブートストラップ構成で100%デューティに対応、1A/2Aピークソース/シンク電流；スリープ電流最大5uA @24V, 25C；EEPROM設定可能で読み書き安全機構を備える；最大80kHz PWMスイッチング周波数に対応；LDO設定可能（3.3Vまたは5V ±3%, 80mA）。機能安全認証版MCF8329HSULIREER（UL 60730-1認証、ロック回転/過負荷/欠相などの安全機能を含む）があり、標準版MCF8329HSIREERと同じ36-WQFNパッケージとピン配置を共有する。',
        thermalPad: 'Thermal Padは接地する必要がある（Table 5-1に明記：Must be connected to ground）。',
        specs: [
          { k: '動作電圧', v: '4.5V～60V' },
          { k: '電気周波数', v: '最大2.5kHz' },
          { k: 'ゲート駆動電流', v: '1A/2Aピークソース/シンク' },
          { k: 'スリープ電流', v: '5uA max @24V, 25C' },
          { k: 'PWMスイッチング周波数', v: '最大80kHz' },
          { k: 'LDO', v: '設定可能 3.3Vまたは5V ±3%, 80mA' },
          { k: '制御入力', v: 'アナログ、PWM、周波数またはI2C' }
        ]
      },
      ko: {
        subcategory: '센서리스 FOC 3상 BLDC 모터 게이트 드라이버 (외부 파워 MOSFET)',
        whatIs: '센서리스 자속 방향 제어(FOC) 3상 BLDC/PMSM 모터 게이트 드라이버 (외부 파워 MOSFET), code-free FOC 알고리즘을 내장하여 MCU 없이 모터를 구동 가능.',
        func: '센서리스 FOC 알고리즘을 내장하여 최대 2.5kHz 전기 주파수를 지원, 속도/전류/전력/전압 등 제어 모드를 제공, 정회전/역회전 및 윈드밀링(바람에 의한 자전)을 지원; 전력과 회전수 상한 설정 가능; 제어 입력은 아날로그, PWM, 주파수 또는 I2C; 설정을 EEPROM에 저장하여 소자 독립 동작 가능; 외부 MCU 워치도그 감시와 limp-home 모드를 제공; 위치 백업용으로 1개의 Hall 입력을 옵션 지원.',
        usedIn: '무선 청소기, 식기세척기/세탁기 펌프, 가전 팬과 펌프, 무선 원예/전동 공구, 잔디깎기 등 12V/24V BLDC/PMSM 모터 응용.',
        desc: '36-WQFN 노출 패드 패키지, 4.5V~60V 동작 전압, 65V 3상 하프브리지 게이트 드라이버, 부트스트랩 구조로 100% 듀티 지원, 1A/2A 피크 소스/싱크 전류; 슬립 전류 최대 5uA @24V, 25C; EEPROM 설정 가능하며 읽기/쓰기 안전 기구를 갖춤; 최대 80kHz PWM 스위칭 주파수 지원; LDO 설정 가능(3.3V 또는 5V ±3%, 80mA). 기능 안전 인증 버전 MCF8329HSULIREER(UL 60730-1 인증, 잠금 회전/과부하/결상 등 안전 기능 포함)이 있으며, 표준 버전 MCF8329HSIREER과 동일한 36-WQFN 패키지와 핀 배치를 공유한다.',
        thermalPad: 'Thermal Pad는 접지에 연결해야 한다(Table 5-1 명시: Must be connected to ground).',
        specs: [
          { k: '동작 전압', v: '4.5V~60V' },
          { k: '전기 주파수', v: '최대 2.5kHz' },
          { k: '게이트 구동 전류', v: '1A/2A 피크 소스/싱크' },
          { k: '슬립 전류', v: '5uA max @24V, 25C' },
          { k: 'PWM 스위칭 주파수', v: '최대 80kHz' },
          { k: 'LDO', v: '설정 가능 3.3V 또는 5V ±3%, 80mA' },
          { k: '제어 입력', v: '아날로그, PWM, 주파수 또는 I2C' }
        ]
      }
    }
  };
  Object.assign(window.IC_I18N, T);
})();

/* CC2745P10-Q1 / CC2745R7-Q1 — automotive BLE 6.0 MCU family (shared text) */
(function () {
  // English shared
  var e_fh = 'Integrates a 96MHz Arm Cortex-M33 (with FPU, TrustZone-M) and a 96MHz algorithm processing unit (APU); the APU assists post-processing for Bluetooth Channel Sounding high-precision ranging (super-resolution algorithms such as IFFT and MUSIC plus vector/matrix operations); includes an HSM crypto subsystem (AES-256, ECC-521, RSA-3072, SHA-512, TRNG) and a separate LAES-128 accelerator for link-layer real-time encryption/decryption, plus TrustZone-M, memory firewall and voltage-glitch monitor (VGM) for automotive-grade security; integrates a BALUN and RF switch, ';
  var e_ui = 'Automotive access and security systems: Digital Key, Phone-as-a-Key (PaaK), Passive Entry Passive Start (PEPS), Remote Keyless Entry (RKE).';
  var e_core = { k: 'Core', v: 'Arm Cortex-M33 96MHz + APU 96MHz (Bluetooth Channel Sounding post-processing)' };
  var e_rx = { k: 'RX sensitivity', v: 'BLE 125kbps -103.5dBm / 1Mbps -97dBm' };
  var e_per = { k: 'Peripherals', v: '23 GPIO, 2x UART(LIN), 2x SPI, 1x I2C, 1x I2S, 1x CAN-FD, 12-bit ADC 1.2MSPS' };
  var e_sec = { k: 'Security', v: 'HSM (AES-256/ECC-521/RSA-3072/SHA-512/TRNG), separate LAES-128, TrustZone-M, VGM' };
  var e_pkg = { k: 'Grade/Package', v: 'AEC-Q100 Grade 2, Tj -40 to 125C; QFN-40 (RHA) 6x6mm' };
  // Japanese shared
  var j_fh = '96MHz Arm Cortex-M33（FPU、TrustZone-M内蔵）と96MHzアルゴリズム処理ユニット（APU）を統合し、APUはBluetooth Channel Soundingの高精度測距の後処理（IFFT、MUSICなどの超解像アルゴリズムおよびベクトル/行列演算）を支援；HSM暗号サブシステム（AES-256、ECC-521、RSA-3072、SHA-512、真性乱数生成器）と独立したLAES-128アクセラレータ（リンク層のリアルタイム暗号化/復号）を内蔵、さらにTrustZone-M、メモリファイアウォール、電圧グリッチ監視（VGM）で車載グレードのセキュリティを提供；BALUNとRFスイッチを統合し、';
  var j_ui = '車載アクセス・セキュリティシステム：デジタルキー、スマートフォンキー（PaaK）、パッシブエントリ・パッシブスタート（PEPS）、リモートキーレスエントリ（RKE）。';
  var j_core = { k: 'コア', v: 'Arm Cortex-M33 96MHz + APU 96MHz（Bluetooth Channel Sounding後処理）' };
  var j_rx = { k: '受信感度', v: 'BLE 125kbps -103.5dBm／1Mbps -97dBm' };
  var j_per = { k: '周辺機能', v: '23 GPIO、2×UART(LIN)、2×SPI、1×I2C、1×I2S、1×CAN-FD、12-bit ADC 1.2MSPS' };
  var j_sec = { k: 'セキュリティ', v: 'HSM（AES-256/ECC-521/RSA-3072/SHA-512/TRNG）、独立LAES-128、TrustZone-M、VGM' };
  var j_pkg = { k: '車載/パッケージ', v: 'AEC-Q100 Grade 2、Tj -40～125C；QFN-40 (RHA) 6×6mm' };
  // Korean shared
  var k_fh = '96MHz Arm Cortex-M33(FPU, TrustZone-M 내장)와 96MHz 알고리즘 처리 유닛(APU)을 통합하며, APU는 Bluetooth Channel Sounding 고정밀 측거의 후처리(IFFT, MUSIC 등 초해상 알고리즘 및 벡터/행렬 연산)를 지원; HSM 암호 서브시스템(AES-256, ECC-521, RSA-3072, SHA-512, 진성 난수 생성기)과 독립 LAES-128 가속기(링크 계층 실시간 암복호화)를 내장, 또한 TrustZone-M, 메모리 방화벽, 전압 글리치 감시(VGM)로 차량용 등급 보안을 제공; BALUN과 RF 스위치를 통합하며, ';
  var k_ui = '차량용 액세스·보안 시스템: 디지털 키, 스마트폰 키(PaaK), 패시브 엔트리 패시브 스타트(PEPS), 리모트 키리스 엔트리(RKE).';
  var k_core = { k: '코어', v: 'Arm Cortex-M33 96MHz + APU 96MHz(Bluetooth Channel Sounding 후처리)' };
  var k_rx = { k: '수신 감도', v: 'BLE 125kbps -103.5dBm／1Mbps -97dBm' };
  var k_per = { k: '주변 기능', v: '23 GPIO, 2×UART(LIN), 2×SPI, 1×I2C, 1×I2S, 1×CAN-FD, 12-bit ADC 1.2MSPS' };
  var k_sec = { k: '보안', v: 'HSM(AES-256/ECC-521/RSA-3072/SHA-512/TRNG), 독립 LAES-128, TrustZone-M, VGM' };
  var k_pkg = { k: '차량용/패키지', v: 'AEC-Q100 Grade 2, Tj -40~125C; QFN-40 (RHA) 6×6mm' };

  var T = {
    'CC2745P10-Q1': {
      en: {
        subcategory: 'SimpleLink Bluetooth Low Energy Wireless MCU (Cortex-M33, automotive, +20dBm PA)',
        whatIs: 'Automotive-grade (AEC-Q100 Grade 2) 2.4GHz wireless microcontroller (MCU): Arm Cortex-M33 core + Bluetooth Low Energy 6.0 transceiver, with a built-in hardware security module (HSM); this P10 version supports up to +20dBm output power.',
        func: e_fh + 'with the P version still completing TX/RX on a single RF pin to reduce BOM.',
        usedIn: e_ui,
        desc: 'AEC-Q100 automotive 2.4GHz BLE 6.0 wireless MCU, Cortex-M33 + APU, 1024KB Flash / 162KB SRAM, up to +20dBm output, QFN40 package, with CAN-FD and HSM; high-power version for automotive access applications.',
        specs: [ e_core, { k: 'Memory', v: 'Flash 1024KB (96KB reserved for HSM firmware), SRAM 162KB (144KB with parity enabled)' }, { k: 'Wireless', v: 'Bluetooth Low Energy 6.0 certified, supports Channel Sounding; output power up to +20dBm' }, e_rx, e_per, e_sec, e_pkg ],
        dropIn: [ { note: 'Same datasheet, pinout 100% identical; R7 is the standard-power version (PA up to +10dBm, Flash 864KB/SRAM 128KB; P10 is +20dBm, 1024KB/162KB).' } ]
      },
      ja: {
        subcategory: 'SimpleLink Bluetooth Low Energy 無線MCU (Cortex-M33, 車載, +20dBm PA)',
        whatIs: '車載グレード（AEC-Q100 Grade 2）2.4GHz 無線マイコン（MCU）：Arm Cortex-M33コア＋Bluetooth Low Energy 6.0トランシーバ、ハードウェアセキュリティモジュール（HSM）を内蔵、本P10版は最大+20dBm出力に対応。',
        func: j_fh + 'P版は単一のRFピンで送受信を完結し、BOMを削減。',
        usedIn: j_ui,
        desc: 'AEC-Q100車載 2.4GHz BLE 6.0 無線MCU、Cortex-M33 + APU、1024KB Flash / 162KB SRAM、最大+20dBm出力、QFN40パッケージ、CAN-FDとHSMを内蔵、車載アクセス向け高出力版。',
        specs: [ j_core, { k: 'メモリ', v: 'Flash 1024KB（うち96KBはHSMファームウェア用予約）、SRAM 162KB（parity有効時144KB）' }, { k: '無線', v: 'Bluetooth Low Energy 6.0認証、Channel Sounding対応；出力最大+20dBm' }, j_rx, j_per, j_sec, j_pkg ],
        dropIn: [ { note: '同じdatasheet、ピン配置100%同一；R7は標準出力版（PA最大+10dBm、Flash 864KB/SRAM 128KB、P10は+20dBm、1024KB/162KB）。' } ]
      },
      ko: {
        subcategory: 'SimpleLink Bluetooth Low Energy 무선 MCU (Cortex-M33, 차량용, +20dBm PA)',
        whatIs: '차량용 등급(AEC-Q100 Grade 2) 2.4GHz 무선 마이크로컨트롤러(MCU): Arm Cortex-M33 코어 + Bluetooth Low Energy 6.0 트랜시버, 하드웨어 보안 모듈(HSM) 내장, 본 P10 버전은 최대 +20dBm 출력을 지원.',
        func: k_fh + 'P 버전은 단일 RF 핀으로 송수신을 완결하여 BOM을 절감.',
        usedIn: k_ui,
        desc: 'AEC-Q100 차량용 2.4GHz BLE 6.0 무선 MCU, Cortex-M33 + APU, 1024KB Flash / 162KB SRAM, 최대 +20dBm 출력, QFN40 패키지, CAN-FD와 HSM 내장, 차량용 액세스용 고출력 버전.',
        specs: [ k_core, { k: '메모리', v: 'Flash 1024KB(그중 96KB는 HSM 펌웨어 예약), SRAM 162KB(parity 활성화 시 144KB)' }, { k: '무선', v: 'Bluetooth Low Energy 6.0 인증, Channel Sounding 지원; 출력 최대 +20dBm' }, k_rx, k_per, k_sec, k_pkg ],
        dropIn: [ { note: '동일 datasheet, 핀 배치 100% 동일; R7은 표준 출력 버전(PA 최대 +10dBm, Flash 864KB/SRAM 128KB, P10은 +20dBm, 1024KB/162KB).' } ]
      }
    },
    'CC2745R7-Q1': {
      en: {
        subcategory: 'SimpleLink Bluetooth Low Energy Wireless MCU (Cortex-M33, automotive, +10dBm PA)',
        whatIs: 'Automotive-grade (AEC-Q100 Grade 2) 2.4GHz wireless microcontroller (MCU): Arm Cortex-M33 core + Bluetooth Low Energy 6.0 transceiver, with a built-in hardware security module (HSM); this R7 version is the standard-power variant (up to +10dBm), with smaller Flash/SRAM than the P10/R10 versions.',
        func: e_fh + 'with maximum output power of +10dBm, reducing BOM.',
        usedIn: e_ui,
        desc: 'AEC-Q100 automotive 2.4GHz BLE 6.0 wireless MCU, Cortex-M33 + APU, 864KB Flash / 128KB SRAM, up to +10dBm output, QFN40 package, with CAN-FD and HSM; standard-power version for automotive access applications.',
        specs: [ e_core, { k: 'Memory', v: 'Flash 864KB (96KB reserved for HSM firmware), SRAM 128KB' }, { k: 'Wireless', v: 'Bluetooth Low Energy 6.0 certified, supports Channel Sounding; output power up to +10dBm' }, e_rx, e_per, e_sec, e_pkg ],
        dropIn: [ { note: 'Same datasheet, pinout 100% identical; P10 is the high-power version (PA up to +20dBm, Flash 1024KB/SRAM 162KB; R7 is +10dBm, 864KB/128KB).' } ]
      },
      ja: {
        subcategory: 'SimpleLink Bluetooth Low Energy 無線MCU (Cortex-M33, 車載, +10dBm PA)',
        whatIs: '車載グレード（AEC-Q100 Grade 2）2.4GHz 無線マイコン（MCU）：Arm Cortex-M33コア＋Bluetooth Low Energy 6.0トランシーバ、HSMを内蔵、本R7版は標準出力版（最大+10dBm）で、Flash/SRAM容量はP10/R10版より小さい。',
        func: j_fh + '最大出力+10dBmでBOMを削減。',
        usedIn: j_ui,
        desc: 'AEC-Q100車載 2.4GHz BLE 6.0 無線MCU、Cortex-M33 + APU、864KB Flash / 128KB SRAM、最大+10dBm出力、QFN40パッケージ、CAN-FDとHSMを内蔵、車載アクセス向け標準出力版。',
        specs: [ j_core, { k: 'メモリ', v: 'Flash 864KB（うち96KBはHSMファームウェア用予約）、SRAM 128KB' }, { k: '無線', v: 'Bluetooth Low Energy 6.0認証、Channel Sounding対応；出力最大+10dBm' }, j_rx, j_per, j_sec, j_pkg ],
        dropIn: [ { note: '同じdatasheet、ピン配置100%同一；P10は高出力版（PA最大+20dBm、Flash 1024KB/SRAM 162KB、R7は+10dBm、864KB/128KB）。' } ]
      },
      ko: {
        subcategory: 'SimpleLink Bluetooth Low Energy 무선 MCU (Cortex-M33, 차량용, +10dBm PA)',
        whatIs: '차량용 등급(AEC-Q100 Grade 2) 2.4GHz 무선 마이크로컨트롤러(MCU): Arm Cortex-M33 코어 + Bluetooth Low Energy 6.0 트랜시버, HSM 내장, 본 R7 버전은 표준 출력 버전(최대 +10dBm)으로, Flash/SRAM 용량이 P10/R10 버전보다 작다.',
        func: k_fh + '최대 출력 +10dBm로 BOM을 절감.',
        usedIn: k_ui,
        desc: 'AEC-Q100 차량용 2.4GHz BLE 6.0 무선 MCU, Cortex-M33 + APU, 864KB Flash / 128KB SRAM, 최대 +10dBm 출력, QFN40 패키지, CAN-FD와 HSM 내장, 차량용 액세스용 표준 출력 버전.',
        specs: [ k_core, { k: '메모리', v: 'Flash 864KB(그중 96KB는 HSM 펌웨어 예약), SRAM 128KB' }, { k: '무선', v: 'Bluetooth Low Energy 6.0 인증, Channel Sounding 지원; 출력 최대 +10dBm' }, k_rx, k_per, k_sec, k_pkg ],
        dropIn: [ { note: '동일 datasheet, 핀 배치 100% 동일; P10은 고출력 버전(PA 최대 +20dBm, Flash 1024KB/SRAM 162KB, R7은 +10dBm, 864KB/128KB).' } ]
      }
    }
  };
  Object.assign(window.IC_I18N, T);
})();

/* CC2755P10 / CC2755R10 — non-automotive multiprotocol 2.4GHz MCU family (shared text) */
(function () {
  var e_fh = 'Integrates a 96MHz Arm Cortex-M33 (with FPU, TrustZone-M) and a 96MHz algorithm processing unit (APU); the APU assists post-processing for Bluetooth Channel Sounding high-precision ranging (super-resolution algorithms such as IFFT and MUSIC); the same die can be flashed via the SimpleLink SDK with BLE, Zigbee, Thread or Matter protocol stacks and supports OTA firmware update (OAD); includes an HSM crypto subsystem (AES-256, ECC-521, RSA-3072, SHA-512, TRNG), a separate LAES-128 accelerator, TrustZone-M, VGM and other security mechanisms; integrates a BALUN and RF switch, ';
  var e_ui = 'Home healthcare (glucose meters, blood-pressure monitors, CPAP, digital thermometers), patient-monitoring sensor patches, wearable fitness devices; building security (motion detection, smart locks, door/window sensors, garage doors), HVAC thermostats and environmental sensing, fire smoke/heat detection, IP surveillance cameras; lighting control; factory automation; retail electronic shelf labels; smart water/electricity/gas meters and grid communication; wireless LAN/router equipment; consumer peripherals, toys and non-medical wearables.';
  var e_core = { k: 'Core', v: 'Arm Cortex-M33 96MHz + APU 96MHz (Bluetooth Channel Sounding post-processing)' };
  var e_mem = { k: 'Memory', v: 'Flash 1024KB (96KB reserved for HSM firmware), SRAM 162KB' };
  var e_rx = { k: 'RX sensitivity', v: 'BLE 125kbps -103.5dBm / 1Mbps -97dBm; IEEE 802.15.4 -103dBm' };
  var e_per = { k: 'Peripherals', v: '23 GPIO, 2x UART(LIN), 2x SPI, 1x I2C, 1x I2S, 12-bit ADC 1.2MSPS (no CAN-FD)' };
  var e_sec = { k: 'Security', v: 'HSM (AES-256/ECC-521/RSA-3072/SHA-512/TRNG), separate LAES-128, TrustZone-M, VGM' };
  var e_pkg = { k: 'Package', v: 'QFN-40 (RHA) 6x6mm; the series also offers a WCSP 3.5x3.4mm preview package (not this part number)' };
  var j_fh = '96MHz Arm Cortex-M33（FPU、TrustZone-M内蔵）と96MHzアルゴリズム処理ユニット（APU）を統合し、APUはBluetooth Channel Soundingの高精度測距の後処理（IFFT、MUSICなどの超解像アルゴリズム）を支援；同一のダイにSimpleLink SDKでBLE、Zigbee、ThreadまたはMatterのプロトコルスタックを書き込み可能、OTAファームウェア更新（OAD）に対応；HSM暗号サブシステム（AES-256、ECC-521、RSA-3072、SHA-512、TRNG）、独立LAES-128アクセラレータ、TrustZone-M、VGMなどのセキュリティ機構を内蔵；BALUNとRFスイッチを統合し、';
  var j_ui = 'ホームヘルスケア（血糖計、血圧計、CPAP、電子体温計）、患者モニタリング用センサパッチ、ウェアラブルフィットネス機器；ビル警備（動体検知、スマートロック、ドア/窓センサ、ガレージドア）、HVACサーモスタットと環境センシング、火災の煙/熱検知、IP監視カメラ；照明制御；工場自動化；小売用電子棚札；スマート水道/電気/ガスメータとグリッド通信；無線LAN/ルータ機器；民生用周辺機器、玩具、非医療ウェアラブル。';
  var j_core = { k: 'コア', v: 'Arm Cortex-M33 96MHz + APU 96MHz（Bluetooth Channel Sounding後処理）' };
  var j_mem = { k: 'メモリ', v: 'Flash 1024KB（うち96KBはHSMファームウェア用予約）、SRAM 162KB' };
  var j_rx = { k: '受信感度', v: 'BLE 125kbps -103.5dBm／1Mbps -97dBm；IEEE 802.15.4 -103dBm' };
  var j_per = { k: '周辺機能', v: '23 GPIO、2×UART(LIN)、2×SPI、1×I2C、1×I2S、12-bit ADC 1.2MSPS（CAN-FDなし）' };
  var j_sec = { k: 'セキュリティ', v: 'HSM（AES-256/ECC-521/RSA-3072/SHA-512/TRNG）、独立LAES-128、TrustZone-M、VGM' };
  var j_pkg = { k: 'パッケージ', v: 'QFN-40 (RHA) 6×6mm；同シリーズにWCSP 3.5×3.4mmプレビューパッケージあり（本料番ではない）' };
  var k_fh = '96MHz Arm Cortex-M33(FPU, TrustZone-M 내장)와 96MHz 알고리즘 처리 유닛(APU)을 통합하며, APU는 Bluetooth Channel Sounding 고정밀 측거의 후처리(IFFT, MUSIC 등 초해상 알고리즘)를 지원; 동일한 다이에 SimpleLink SDK로 BLE, Zigbee, Thread 또는 Matter 프로토콜 스택을 기록 가능하며, OTA 펌웨어 업데이트(OAD)를 지원; HSM 암호 서브시스템(AES-256, ECC-521, RSA-3072, SHA-512, TRNG), 독립 LAES-128 가속기, TrustZone-M, VGM 등 보안 기구를 내장; BALUN과 RF 스위치를 통합하며, ';
  var k_ui = '홈 헬스케어(혈당계, 혈압계, CPAP, 전자 체온계), 환자 모니터링 센서 패치, 웨어러블 피트니스 기기; 건물 보안(움직임 감지, 스마트 도어록, 도어/창문 센서, 차고문), HVAC 서모스탯과 환경 센싱, 화재 연기/열 감지, IP 감시 카메라; 조명 제어; 공장 자동화; 소매용 전자 선반 라벨; 스마트 수도/전기/가스 미터와 그리드 통신; 무선 LAN/라우터 장비; 소비자용 주변 기기, 완구, 비의료 웨어러블.';
  var k_core = { k: '코어', v: 'Arm Cortex-M33 96MHz + APU 96MHz(Bluetooth Channel Sounding 후처리)' };
  var k_mem = { k: '메모리', v: 'Flash 1024KB(그중 96KB는 HSM 펌웨어 예약), SRAM 162KB' };
  var k_rx = { k: '수신 감도', v: 'BLE 125kbps -103.5dBm／1Mbps -97dBm; IEEE 802.15.4 -103dBm' };
  var k_per = { k: '주변 기능', v: '23 GPIO, 2×UART(LIN), 2×SPI, 1×I2C, 1×I2S, 12-bit ADC 1.2MSPS(CAN-FD 없음)' };
  var k_sec = { k: '보안', v: 'HSM(AES-256/ECC-521/RSA-3072/SHA-512/TRNG), 독립 LAES-128, TrustZone-M, VGM' };
  var k_pkg = { k: '패키지', v: 'QFN-40 (RHA) 6×6mm; 동일 시리즈에 WCSP 3.5×3.4mm 프리뷰 패키지 있음(본 부품 번호 아님)' };

  var T = {
    'CC2755P10': {
      en: {
        subcategory: 'SimpleLink Multiprotocol 2.4GHz Wireless MCU (Cortex-M33, BLE/Zigbee/Thread/Matter, +20dBm PA)',
        whatIs: 'Non-automotive 2.4GHz multiprotocol wireless microcontroller (MCU): Arm Cortex-M33 core, supporting Bluetooth Low Energy 6.0, Zigbee 3.0, Thread, Matter and proprietary 2.4GHz protocols; this P10 version supports up to +20dBm output power.',
        func: e_fh + 'with the P version still completing TX/RX on a single RF pin to reduce BOM.',
        usedIn: e_ui,
        desc: 'Non-automotive 2.4GHz multiprotocol (BLE/Zigbee/Thread/Matter) wireless MCU, Cortex-M33 + APU, 1024KB Flash / 162KB SRAM, up to +20dBm output, QFN40 package.',
        specs: [ e_core, e_mem, { k: 'Wireless protocols', v: 'Bluetooth Low Energy 6.0, IEEE 802.15.4 (Zigbee 3.0 certified, Thread, Matter, proprietary 2.4GHz, multiprotocol); output power up to +20dBm' }, e_rx, e_per, e_sec, e_pkg ],
        dropIn: [ { note: 'Same datasheet, pinout 100% identical; R10 is the standard-power version (PA up to +10dBm, Flash/SRAM same as P10: 1024KB/162KB).' } ]
      },
      ja: {
        subcategory: 'SimpleLink マルチプロトコル 2.4GHz 無線MCU (Cortex-M33, BLE/Zigbee/Thread/Matter, +20dBm PA)',
        whatIs: '非車載 2.4GHz マルチプロトコル無線マイコン（MCU）：Arm Cortex-M33コア、Bluetooth Low Energy 6.0、Zigbee 3.0、Thread、Matterおよび独自2.4GHzプロトコルに対応、本P10版は最大+20dBm出力に対応。',
        func: j_fh + 'P版は単一のRFピンで送受信を完結し、BOMを削減。',
        usedIn: j_ui,
        desc: '非車載 2.4GHz マルチプロトコル（BLE/Zigbee/Thread/Matter）無線MCU、Cortex-M33 + APU、1024KB Flash / 162KB SRAM、最大+20dBm出力、QFN40パッケージ。',
        specs: [ j_core, j_mem, { k: '無線プロトコル', v: 'Bluetooth Low Energy 6.0、IEEE 802.15.4（Zigbee 3.0認証、Thread、Matter、独自2.4GHz、マルチプロトコル）；出力最大+20dBm' }, j_rx, j_per, j_sec, j_pkg ],
        dropIn: [ { note: '同じdatasheet、ピン配置100%同一；R10は標準出力版（PA最大+10dBm、Flash/SRAMはP10と同じ：1024KB/162KB）。' } ]
      },
      ko: {
        subcategory: 'SimpleLink 멀티프로토콜 2.4GHz 무선 MCU (Cortex-M33, BLE/Zigbee/Thread/Matter, +20dBm PA)',
        whatIs: '비차량용 2.4GHz 멀티프로토콜 무선 마이크로컨트롤러(MCU): Arm Cortex-M33 코어, Bluetooth Low Energy 6.0, Zigbee 3.0, Thread, Matter 및 독자 2.4GHz 프로토콜을 지원, 본 P10 버전은 최대 +20dBm 출력을 지원.',
        func: k_fh + 'P 버전은 단일 RF 핀으로 송수신을 완결하여 BOM을 절감.',
        usedIn: k_ui,
        desc: '비차량용 2.4GHz 멀티프로토콜(BLE/Zigbee/Thread/Matter) 무선 MCU, Cortex-M33 + APU, 1024KB Flash / 162KB SRAM, 최대 +20dBm 출력, QFN40 패키지.',
        specs: [ k_core, k_mem, { k: '무선 프로토콜', v: 'Bluetooth Low Energy 6.0, IEEE 802.15.4(Zigbee 3.0 인증, Thread, Matter, 독자 2.4GHz, 멀티프로토콜); 출력 최대 +20dBm' }, k_rx, k_per, k_sec, k_pkg ],
        dropIn: [ { note: '동일 datasheet, 핀 배치 100% 동일; R10은 표준 출력 버전(PA 최대 +10dBm, Flash/SRAM은 P10과 동일: 1024KB/162KB).' } ]
      }
    },
    'CC2755R10': {
      en: {
        subcategory: 'SimpleLink Multiprotocol 2.4GHz Wireless MCU (Cortex-M33, BLE/Zigbee/Thread/Matter, +10dBm PA)',
        whatIs: 'Non-automotive 2.4GHz multiprotocol wireless microcontroller (MCU): Arm Cortex-M33 core, supporting Bluetooth Low Energy 6.0, Zigbee 3.0, Thread, Matter and proprietary 2.4GHz protocols; this R10 version is the standard-power variant (up to +10dBm).',
        func: e_fh + 'with maximum output power of +10dBm, reducing BOM.',
        usedIn: e_ui,
        desc: 'Non-automotive 2.4GHz multiprotocol (BLE/Zigbee/Thread/Matter) wireless MCU, Cortex-M33 + APU, 1024KB Flash / 162KB SRAM, up to +10dBm output, QFN40 package.',
        specs: [ e_core, e_mem, { k: 'Wireless protocols', v: 'Bluetooth Low Energy 6.0, IEEE 802.15.4 (Zigbee 3.0 certified, Thread, Matter, proprietary 2.4GHz, multiprotocol); output power up to +10dBm' }, e_rx, e_per, e_sec, e_pkg ],
        dropIn: [ { note: 'Same datasheet, pinout 100% identical; P10 is the high-power version (PA up to +20dBm, Flash/SRAM same as R10: 1024KB/162KB).' } ]
      },
      ja: {
        subcategory: 'SimpleLink マルチプロトコル 2.4GHz 無線MCU (Cortex-M33, BLE/Zigbee/Thread/Matter, +10dBm PA)',
        whatIs: '非車載 2.4GHz マルチプロトコル無線マイコン（MCU）：Arm Cortex-M33コア、Bluetooth Low Energy 6.0、Zigbee 3.0、Thread、Matterおよび独自2.4GHzプロトコルに対応、本R10版は標準出力版（最大+10dBm）。',
        func: j_fh + '最大出力+10dBmでBOMを削減。',
        usedIn: j_ui,
        desc: '非車載 2.4GHz マルチプロトコル（BLE/Zigbee/Thread/Matter）無線MCU、Cortex-M33 + APU、1024KB Flash / 162KB SRAM、最大+10dBm出力、QFN40パッケージ。',
        specs: [ j_core, j_mem, { k: '無線プロトコル', v: 'Bluetooth Low Energy 6.0、IEEE 802.15.4（Zigbee 3.0認証、Thread、Matter、独自2.4GHz、マルチプロトコル）；出力最大+10dBm' }, j_rx, j_per, j_sec, j_pkg ],
        dropIn: [ { note: '同じdatasheet、ピン配置100%同一；P10は高出力版（PA最大+20dBm、Flash/SRAMはR10と同じ：1024KB/162KB）。' } ]
      },
      ko: {
        subcategory: 'SimpleLink 멀티프로토콜 2.4GHz 무선 MCU (Cortex-M33, BLE/Zigbee/Thread/Matter, +10dBm PA)',
        whatIs: '비차량용 2.4GHz 멀티프로토콜 무선 마이크로컨트롤러(MCU): Arm Cortex-M33 코어, Bluetooth Low Energy 6.0, Zigbee 3.0, Thread, Matter 및 독자 2.4GHz 프로토콜을 지원, 본 R10 버전은 표준 출력 버전(최대 +10dBm).',
        func: k_fh + '최대 출력 +10dBm로 BOM을 절감.',
        usedIn: k_ui,
        desc: '비차량용 2.4GHz 멀티프로토콜(BLE/Zigbee/Thread/Matter) 무선 MCU, Cortex-M33 + APU, 1024KB Flash / 162KB SRAM, 최대 +10dBm 출력, QFN40 패키지.',
        specs: [ k_core, k_mem, { k: '무선 프로토콜', v: 'Bluetooth Low Energy 6.0, IEEE 802.15.4(Zigbee 3.0 인증, Thread, Matter, 독자 2.4GHz, 멀티프로토콜); 출력 최대 +10dBm' }, k_rx, k_per, k_sec, k_pkg ],
        dropIn: [ { note: '동일 datasheet, 핀 배치 100% 동일; P10은 고출력 버전(PA 최대 +20dBm, Flash/SRAM은 R10과 동일: 1024KB/162KB).' } ]
      }
    }
  };
  Object.assign(window.IC_I18N, T);
})();

/* CC3300MOD / CC3301MOD / CC3350MOD / CC3351MOD — Wi-Fi 6 companion module family (shared spec rows) */
(function () {
  // shared spec rows
  var e_host = { k: 'Host interface', v: '4-bit SDIO or SPI' };
  var e_hostble = { k: 'Host interface', v: '4-bit SDIO or SPI; BLE HCI can also use UART or shared SDIO' };
  var e_thru = { k: 'Throughput', v: 'Up to ~50Mbps at application layer' };
  var e_temp = { k: 'Operating temp', v: '-40C to +85C' };
  var e_pkg = { k: 'Package', v: '65-pin LGA, 11mm x 11mm, 0.65mm pitch' };
  var j_host = { k: 'ホストインターフェース', v: '4-bit SDIOまたはSPI' };
  var j_hostble = { k: 'ホストインターフェース', v: '4-bit SDIOまたはSPI；BLE HCIはUARTまたは共用SDIOも使用可能' };
  var j_thru = { k: 'スループット', v: 'アプリケーション層で最大約50Mbps' };
  var j_temp = { k: '動作温度', v: '-40C～+85C' };
  var j_pkg = { k: 'パッケージ', v: '65-pin LGA、11mm×11mm、0.65mmピッチ' };
  var k_host = { k: '호스트 인터페이스', v: '4-bit SDIO 또는 SPI' };
  var k_hostble = { k: '호스트 인터페이스', v: '4-bit SDIO 또는 SPI; BLE HCI는 UART 또는 공용 SDIO도 사용 가능' };
  var k_thru = { k: '처리량', v: '애플리케이션 계층 최대 약 50Mbps' };
  var k_temp = { k: '동작 온도', v: '-40C~+85C' };
  var k_pkg = { k: '패키지', v: '65-pin LGA, 11mm×11mm, 0.65mm 피치' };
  // band-specific rows
  var e_wifi24 = { k: 'Wi-Fi', v: 'IEEE 802.11 b/g/n/ax, 2.4GHz, 20MHz bandwidth, single spatial stream (SISO)' };
  var e_wifidual = { k: 'Wi-Fi', v: 'IEEE 802.11 a/b/g/n/ax, 2.4GHz and 5GHz dual-band, 20MHz bandwidth, single spatial stream (SISO)' };
  var e_pw24 = { k: 'Output power', v: 'Integrated 2.4GHz PA, up to +18.4dBm' };
  var e_pwdual = { k: 'Output power', v: 'Integrated dual-band PA, up to +18.3dBm' };
  var e_bt54 = { k: 'Bluetooth', v: 'Bluetooth Low Energy 5.4, supports LE Coded PHY / LE 2M PHY / Advertising Extension' };
  var j_wifi24 = { k: 'Wi-Fi', v: 'IEEE 802.11 b/g/n/ax、2.4GHz、20MHz帯域、シングル空間ストリーム（SISO）' };
  var j_wifidual = { k: 'Wi-Fi', v: 'IEEE 802.11 a/b/g/n/ax、2.4GHzと5GHzのデュアルバンド、20MHz帯域、シングル空間ストリーム（SISO）' };
  var j_pw24 = { k: '出力', v: '2.4GHz PA内蔵、最大+18.4dBm' };
  var j_pwdual = { k: '出力', v: 'デュアルバンドPA内蔵、最大+18.3dBm' };
  var j_bt54 = { k: 'Bluetooth', v: 'Bluetooth Low Energy 5.4、LE Coded PHY／LE 2M PHY／Advertising Extensionに対応' };
  var k_wifi24 = { k: 'Wi-Fi', v: 'IEEE 802.11 b/g/n/ax, 2.4GHz, 20MHz 대역폭, 단일 공간 스트림(SISO)' };
  var k_wifidual = { k: 'Wi-Fi', v: 'IEEE 802.11 a/b/g/n/ax, 2.4GHz와 5GHz 듀얼밴드, 20MHz 대역폭, 단일 공간 스트림(SISO)' };
  var k_pw24 = { k: '출력', v: '2.4GHz PA 내장, 최대 +18.4dBm' };
  var k_pwdual = { k: '출력', v: '듀얼밴드 PA 내장, 최대 +18.3dBm' };
  var k_bt54 = { k: 'Bluetooth', v: 'Bluetooth Low Energy 5.4, LE Coded PHY／LE 2M PHY／Advertising Extension 지원' };

  var T = {
    'CC3300MOD': {
      en: {
        subcategory: 'Wi-Fi 6 (2.4GHz) Companion Module',
        whatIs: '2.4GHz Wi-Fi 6 (802.11ax) companion module: integrates a complete Wi-Fi 6 transceiver, PA and antenna front end, providing a host MCU/processor with full TCP/IP wireless connectivity over an SDIO or SPI interface, freeing the host from handling RF and antenna design.',
        func: 'Integrates MAC, baseband and a 2.4GHz RF transceiver, supporting IEEE 802.11 b/g/n/ax; includes a 2.4GHz power amplifier (PA) with up to +18.4dBm output; supports Wi-Fi 6 efficiency features such as TWT, OFDMA, downlink MU-MIMO and BSS Coloring, with hardware-accelerated WPA2/WPA3 encryption; host interface is 4-bit SDIO or SPI; a 40MHz XTAL fast clock is integrated in the module, and the slow clock can use an internal or external 32.768kHz; supports multi-role operation (e.g. concurrent STA+AP) and antenna diversity/selection; a 3-wire or 1-wire PTA allows coexistence with other 2.4GHz radios (such as Thread/Zigbee).',
        usedIn: 'Cloud-connected applications such as grid infrastructure (meters, string/micro inverters, energy-storage PCS, EV charging stations), building/home automation (HVAC controllers/gateways, thermostats, garage doors, IP cameras/video doorbells), appliances (refrigerators, ovens, washing machines, water heaters, air purifiers, robotic vacuums) and medical devices (infusion pumps, patient monitors, blood-pressure monitors).',
        desc: '65-pin 11x11mm LGA 2.4GHz Wi-Fi 6 companion module with integrated PA and transceiver, SDIO/SPI host interface, operating -40C to +85C; CC3300MOD is Wi-Fi-only, without Bluetooth (the BLE version is CC3301MOD).',
        specs: [ e_wifi24, { k: 'Bluetooth', v: 'Not supported (Wi-Fi-only; BLE version is CC3301MOD)' }, e_pw24, e_host, e_thru, e_temp, e_pkg ],
        dropIn: [ { note: 'Identical 65-pin LGA pinout (deep-equal verified); CC3301MOD additionally includes BLE 5.4 and can be swapped in to save cost when Bluetooth is not needed.' } ]
      },
      ja: {
        subcategory: 'Wi-Fi 6 (2.4GHz) コンパニオンモジュール',
        whatIs: '2.4GHz Wi-Fi 6（802.11ax）コンパニオンモジュール：完全なWi-Fi 6トランシーバ、PA、アンテナフロントエンドを内蔵し、SDIOまたはSPIインターフェース経由でホストMCU/プロセッサに完全なTCP/IP無線接続を提供、ホストがRFやアンテナ設計を扱う必要をなくす。',
        func: 'MAC、ベースバンド、2.4GHz RFトランシーバを統合し、IEEE 802.11 b/g/n/axに対応；2.4GHzパワーアンプ（PA）を内蔵し最大+18.4dBm出力；TWT、OFDMA、下りMU-MIMO、BSS ColoringなどのWi-Fi 6効率機能に対応、WPA2/WPA3暗号化をハードウェアで高速化；ホストインターフェースは4-bit SDIOまたはSPI；40MHz XTAL高速クロックをモジュール内に統合、低速クロックは内蔵または外部32.768kHzを使用可能；マルチロール動作（STA+AP同時など）とアンテナダイバーシティ/選択に対応；3線または1線のPTAで他の2.4GHz無線（Thread/Zigbeeなど）と共存可能。',
        usedIn: '電力網インフラ（電力量計、ストリング/マイクロインバータ、蓄電PCS、EV充電器）、ビル/ホームオートメーション（HVACコントローラ/ゲートウェイ、サーモスタット、ガレージドア、IPカメラ/ビデオドアベル）、家電（冷蔵庫、オーブン、洗濯機、給湯器、空気清浄機、ロボット掃除機）、医療機器（輸液ポンプ、患者モニタ、血圧計）などのクラウド接続アプリケーション。',
        desc: '65-pin 11×11mm LGAパッケージの2.4GHz Wi-Fi 6コンパニオンモジュール、PAとトランシーバを内蔵、SDIO/SPIホストインターフェース、動作温度-40C～+85C；CC3300MODはWi-FiのみでBluetoothなし（BLE版はCC3301MOD）。',
        specs: [ j_wifi24, { k: 'Bluetooth', v: '非対応（Wi-Fiのみ；BLE版はCC3301MOD）' }, j_pw24, j_host, j_thru, j_temp, j_pkg ],
        dropIn: [ { note: '同一の65-pin LGAピン配置（deep-equal確認済み）；CC3301MODはBLE 5.4を追加で内蔵し、Bluetooth不要ならコスト削減のため置き換え可能。' } ]
      },
      ko: {
        subcategory: 'Wi-Fi 6 (2.4GHz) 컴패니언 모듈',
        whatIs: '2.4GHz Wi-Fi 6(802.11ax) 컴패니언 모듈: 완전한 Wi-Fi 6 트랜시버, PA, 안테나 프런트엔드를 내장하여 SDIO 또는 SPI 인터페이스를 통해 호스트 MCU/프로세서에 완전한 TCP/IP 무선 연결을 제공, 호스트가 RF와 안테나 설계를 다룰 필요를 없앤다.',
        func: 'MAC, 베이스밴드, 2.4GHz RF 트랜시버를 통합하여 IEEE 802.11 b/g/n/ax를 지원; 2.4GHz 파워 앰프(PA)를 내장하여 최대 +18.4dBm 출력; TWT, OFDMA, 하향 MU-MIMO, BSS Coloring 등 Wi-Fi 6 효율 기능을 지원, WPA2/WPA3 암호화를 하드웨어로 가속; 호스트 인터페이스는 4-bit SDIO 또는 SPI; 40MHz XTAL 고속 클록을 모듈 내에 통합, 저속 클록은 내장 또는 외부 32.768kHz 사용 가능; 멀티롤 동작(STA+AP 동시 등)과 안테나 다이버시티/선택을 지원; 3선 또는 1선 PTA로 다른 2.4GHz 무선(Thread/Zigbee 등)과 공존 가능.',
        usedIn: '전력망 인프라(전력량계, 스트링/마이크로 인버터, 에너지 저장 PCS, EV 충전기), 빌딩/홈 오토메이션(HVAC 컨트롤러/게이트웨이, 서모스탯, 차고문, IP 카메라/비디오 도어벨), 가전(냉장고, 오븐, 세탁기, 온수기, 공기청정기, 로봇청소기), 의료기기(수액 펌프, 환자 모니터, 혈압계) 등 클라우드 연결 응용.',
        desc: '65-pin 11×11mm LGA 2.4GHz Wi-Fi 6 컴패니언 모듈, PA와 트랜시버 내장, SDIO/SPI 호스트 인터페이스, 동작 온도 -40C~+85C; CC3300MOD는 Wi-Fi 전용으로 Bluetooth 없음(BLE 버전은 CC3301MOD).',
        specs: [ k_wifi24, { k: 'Bluetooth', v: '미지원(Wi-Fi 전용; BLE 버전은 CC3301MOD)' }, k_pw24, k_host, k_thru, k_temp, k_pkg ],
        dropIn: [ { note: '동일한 65-pin LGA 핀 배치(deep-equal 확인 완료); CC3301MOD는 BLE 5.4를 추가로 내장하며, Bluetooth가 필요 없으면 비용 절감을 위해 교체 가능.' } ]
      }
    },
    'CC3301MOD': {
      en: {
        subcategory: 'Wi-Fi 6 (2.4GHz) + BLE 5.4 Companion Module',
        whatIs: '2.4GHz Wi-Fi 6 (802.11ax) and Bluetooth Low Energy 5.4 companion module: the same Wi-Fi 6 transceiver and PA as the CC3300MOD, plus a BLE 5.4 controller subsystem, with both radios sharing the same RF front end and antenna.',
        func: 'Integrates MAC, baseband and a 2.4GHz RF transceiver, supporting IEEE 802.11 b/g/n/ax; includes a 2.4GHz PA with up to +18.4dBm output; supports Wi-Fi 6 efficiency features such as TWT, OFDMA, downlink MU-MIMO and BSS Coloring, with hardware-accelerated WPA2/WPA3; also integrates a Bluetooth Low Energy 5.4 controller subsystem supporting LE Coded PHY (long range), LE 2M PHY (high speed) and Advertising Extension, with HCI transport over UART or shared SDIO, and an internal coexistence mechanism that lets BLE and Wi-Fi share the same RF chain and antenna; host interface is 4-bit SDIO or SPI; a 40MHz XTAL is integrated in the module.',
        usedIn: 'Same applications as the CC3300MOD (grid infrastructure, building/home automation, appliances, medical devices, etc.), plus scenarios requiring Bluetooth pairing/data transfer such as wearable pairing, mobile-app on-site provisioning and BLE-beacon hybrid connectivity.',
        desc: '65-pin 11x11mm LGA package, 2.4GHz Wi-Fi 6 + Bluetooth Low Energy 5.4 companion module, SDIO/SPI to host, internal Wi-Fi/BLE coexistence, operating -40C to +85C.',
        specs: [ e_wifi24, e_bt54, e_pw24, e_hostble, e_thru, e_temp, e_pkg ],
        dropIn: [ { note: 'Identical 65-pin LGA pinout (deep-equal verified); CC3300MOD is the Wi-Fi-only version (no BLE) and can be swapped in when Bluetooth is not needed.' } ]
      },
      ja: {
        subcategory: 'Wi-Fi 6 (2.4GHz) + BLE 5.4 コンパニオンモジュール',
        whatIs: '2.4GHz Wi-Fi 6（802.11ax）とBluetooth Low Energy 5.4のコンパニオンモジュール：CC3300MODと同じWi-Fi 6トランシーバとPAに、BLE 5.4コントローラサブシステムを追加、両無線が同じRFフロントエンドとアンテナを共有。',
        func: 'MAC、ベースバンド、2.4GHz RFトランシーバを統合し、IEEE 802.11 b/g/n/axに対応；2.4GHz PAを内蔵し最大+18.4dBm出力；TWT、OFDMA、下りMU-MIMO、BSS ColoringなどのWi-Fi 6効率機能に対応、WPA2/WPA3をハードウェアで高速化；さらにBluetooth Low Energy 5.4コントローラサブシステムを統合し、LE Coded PHY（長距離）、LE 2M PHY（高速）、Advertising Extensionに対応、HCI伝送はUARTまたは共用SDIO、内部共存機構によりBLEとWi-Fiが同一のRFチェーンとアンテナを共有；ホストインターフェースは4-bit SDIOまたはSPI；40MHz XTALをモジュール内に統合。',
        usedIn: 'CC3300MODと同じアプリケーション（電力網インフラ、ビル/ホームオートメーション、家電、医療機器など）に加え、ウェアラブルのペアリング、モバイルアプリによる現地設定、BLEビーコンのハイブリッド接続など、Bluetoothペアリング/データ転送が必要なシナリオもカバー。',
        desc: '65-pin 11×11mm LGAパッケージ、2.4GHz Wi-Fi 6 + Bluetooth Low Energy 5.4コンパニオンモジュール、SDIO/SPIでホスト接続、内部Wi-Fi/BLE共存、動作温度-40C～+85C。',
        specs: [ j_wifi24, j_bt54, j_pw24, j_hostble, j_thru, j_temp, j_pkg ],
        dropIn: [ { note: '同一の65-pin LGAピン配置（deep-equal確認済み）；CC3300MODはWi-Fiのみ版（BLEなし）で、Bluetooth不要時に置き換え可能。' } ]
      },
      ko: {
        subcategory: 'Wi-Fi 6 (2.4GHz) + BLE 5.4 컴패니언 모듈',
        whatIs: '2.4GHz Wi-Fi 6(802.11ax)와 Bluetooth Low Energy 5.4 컴패니언 모듈: CC3300MOD와 동일한 Wi-Fi 6 트랜시버와 PA에 BLE 5.4 컨트롤러 서브시스템을 추가, 두 무선이 동일한 RF 프런트엔드와 안테나를 공유.',
        func: 'MAC, 베이스밴드, 2.4GHz RF 트랜시버를 통합하여 IEEE 802.11 b/g/n/ax를 지원; 2.4GHz PA를 내장하여 최대 +18.4dBm 출력; TWT, OFDMA, 하향 MU-MIMO, BSS Coloring 등 Wi-Fi 6 효율 기능을 지원, WPA2/WPA3를 하드웨어로 가속; 또한 Bluetooth Low Energy 5.4 컨트롤러 서브시스템을 통합하여 LE Coded PHY(장거리), LE 2M PHY(고속), Advertising Extension을 지원, HCI 전송은 UART 또는 공용 SDIO, 내부 공존 기구로 BLE와 Wi-Fi가 동일한 RF 체인과 안테나를 공유; 호스트 인터페이스는 4-bit SDIO 또는 SPI; 40MHz XTAL을 모듈 내에 통합.',
        usedIn: 'CC3300MOD와 동일한 응용(전력망 인프라, 빌딩/홈 오토메이션, 가전, 의료기기 등)에 더해, 웨어러블 페어링, 모바일 앱 현장 설정, BLE 비콘 하이브리드 연결 등 Bluetooth 페어링/데이터 전송이 필요한 시나리오도 포함.',
        desc: '65-pin 11×11mm LGA 패키지, 2.4GHz Wi-Fi 6 + Bluetooth Low Energy 5.4 컴패니언 모듈, SDIO/SPI로 호스트 연결, 내부 Wi-Fi/BLE 공존, 동작 온도 -40C~+85C.',
        specs: [ k_wifi24, k_bt54, k_pw24, k_hostble, k_thru, k_temp, k_pkg ],
        dropIn: [ { note: '동일한 65-pin LGA 핀 배치(deep-equal 확인 완료); CC3300MOD는 Wi-Fi 전용 버전(BLE 없음)으로, Bluetooth가 필요 없을 때 교체 가능.' } ]
      }
    },
    'CC3350MOD': {
      en: {
        subcategory: 'Dual-Band (2.4/5GHz) Wi-Fi 6 Companion Module',
        whatIs: '2.4GHz and 5GHz dual-band Wi-Fi 6 (802.11ax) companion module: integrates a dual-band transceiver, PA and antenna front end, providing a host MCU/processor with full TCP/IP wireless connectivity over an SDIO or SPI interface.',
        func: 'Integrates MAC, baseband and a dual-band RF transceiver, supporting IEEE 802.11 a/b/g/n/ax (compatible with Wi-Fi 4 and Wi-Fi 5 802.11ac); both 2.4GHz and 5GHz are 20MHz, single spatial stream; includes 2.4GHz and 5GHz PAs with up to +18.3dBm output; supports Wi-Fi 6 efficiency features such as TWT, OFDMA, downlink MU-MIMO and BSS Coloring, with hardware-accelerated WPA2/WPA3; host interface is 4-bit SDIO or SPI; a 40MHz XTAL fast clock is integrated in the module, and the slow clock can use an internal or external 32.768kHz; supports multi-role operation and antenna diversity/selection; a 3-wire or 1-wire PTA allows coexistence with external 2.4GHz radios.',
        usedIn: 'Grid infrastructure (meters, string/micro inverters, energy-storage PCS, EV charging stations), building/home automation (HVAC controllers/gateways, thermostats, garage doors, IP cameras/video doorbells), appliances (refrigerators, ovens, washing machines, water heaters, air purifiers, robotic vacuums) and medical devices (infusion pumps, patient monitors, blood-pressure monitors) requiring dual-band Wi-Fi connectivity.',
        desc: '65-pin 11x11mm LGA 2.4GHz/5GHz dual-band Wi-Fi 6 companion module with integrated dual-band PA and transceiver, SDIO/SPI host interface, operating -40C to +85C; CC3350MOD is Wi-Fi-only, without Bluetooth (the BLE version is CC3351MOD).',
        specs: [ e_wifidual, { k: 'Bluetooth', v: 'Not supported (Wi-Fi-only; BLE version is CC3351MOD)' }, e_pwdual, e_host, e_thru, e_temp, e_pkg ],
        dropIn: [ { note: 'Identical 65-pin LGA pinout (deep-equal verified); CC3351MOD additionally includes BLE 5.4 and can be swapped in to save cost when Bluetooth is not needed.' } ]
      },
      ja: {
        subcategory: 'デュアルバンド (2.4/5GHz) Wi-Fi 6 コンパニオンモジュール',
        whatIs: '2.4GHzと5GHzのデュアルバンドWi-Fi 6（802.11ax）コンパニオンモジュール：デュアルバンドトランシーバ、PA、アンテナフロントエンドを内蔵し、SDIOまたはSPIインターフェース経由でホストMCU/プロセッサに完全なTCP/IP無線接続を提供。',
        func: 'MAC、ベースバンド、デュアルバンドRFトランシーバを統合し、IEEE 802.11 a/b/g/n/axに対応（Wi-Fi 4およびWi-Fi 5 802.11acと互換）；2.4GHzと5GHzはいずれも20MHz、シングル空間ストリーム；2.4GHzと5GHzのPAを内蔵し最大+18.3dBm出力；TWT、OFDMA、下りMU-MIMO、BSS ColoringなどのWi-Fi 6効率機能に対応、WPA2/WPA3をハードウェアで高速化；ホストインターフェースは4-bit SDIOまたはSPI；40MHz XTAL高速クロックをモジュール内に統合、低速クロックは内蔵または外部32.768kHzを使用可能；マルチロール動作とアンテナダイバーシティ/選択に対応；3線または1線のPTAで外部2.4GHz無線と共存可能。',
        usedIn: '電力網インフラ（電力量計、ストリング/マイクロインバータ、蓄電PCS、EV充電器）、ビル/ホームオートメーション（HVACコントローラ/ゲートウェイ、サーモスタット、ガレージドア、IPカメラ/ビデオドアベル）、家電（冷蔵庫、オーブン、洗濯機、給湯器、空気清浄機、ロボット掃除機）、医療機器（輸液ポンプ、患者モニタ、血圧計）など、デュアルバンドWi-Fiが必要な接続アプリケーション。',
        desc: '65-pin 11×11mm LGAパッケージの2.4GHz/5GHzデュアルバンドWi-Fi 6コンパニオンモジュール、デュアルバンドPAとトランシーバを内蔵、SDIO/SPIホストインターフェース、動作温度-40C～+85C；CC3350MODはWi-FiのみでBluetoothなし（BLE版はCC3351MOD）。',
        specs: [ j_wifidual, { k: 'Bluetooth', v: '非対応（Wi-Fiのみ；BLE版はCC3351MOD）' }, j_pwdual, j_host, j_thru, j_temp, j_pkg ],
        dropIn: [ { note: '同一の65-pin LGAピン配置（deep-equal確認済み）；CC3351MODはBLE 5.4を追加で内蔵し、Bluetooth不要ならコスト削減のため置き換え可能。' } ]
      },
      ko: {
        subcategory: '듀얼밴드 (2.4/5GHz) Wi-Fi 6 컴패니언 모듈',
        whatIs: '2.4GHz와 5GHz 듀얼밴드 Wi-Fi 6(802.11ax) 컴패니언 모듈: 듀얼밴드 트랜시버, PA, 안테나 프런트엔드를 내장하여 SDIO 또는 SPI 인터페이스를 통해 호스트 MCU/프로세서에 완전한 TCP/IP 무선 연결을 제공.',
        func: 'MAC, 베이스밴드, 듀얼밴드 RF 트랜시버를 통합하여 IEEE 802.11 a/b/g/n/ax를 지원(Wi-Fi 4 및 Wi-Fi 5 802.11ac 호환); 2.4GHz와 5GHz 모두 20MHz, 단일 공간 스트림; 2.4GHz와 5GHz PA를 내장하여 최대 +18.3dBm 출력; TWT, OFDMA, 하향 MU-MIMO, BSS Coloring 등 Wi-Fi 6 효율 기능을 지원, WPA2/WPA3를 하드웨어로 가속; 호스트 인터페이스는 4-bit SDIO 또는 SPI; 40MHz XTAL 고속 클록을 모듈 내에 통합, 저속 클록은 내장 또는 외부 32.768kHz 사용 가능; 멀티롤 동작과 안테나 다이버시티/선택을 지원; 3선 또는 1선 PTA로 외부 2.4GHz 무선과 공존 가능.',
        usedIn: '전력망 인프라(전력량계, 스트링/마이크로 인버터, 에너지 저장 PCS, EV 충전기), 빌딩/홈 오토메이션(HVAC 컨트롤러/게이트웨이, 서모스탯, 차고문, IP 카메라/비디오 도어벨), 가전(냉장고, 오븐, 세탁기, 온수기, 공기청정기, 로봇청소기), 의료기기(수액 펌프, 환자 모니터, 혈압계) 등 듀얼밴드 Wi-Fi가 필요한 연결 응용.',
        desc: '65-pin 11×11mm LGA 2.4GHz/5GHz 듀얼밴드 Wi-Fi 6 컴패니언 모듈, 듀얼밴드 PA와 트랜시버 내장, SDIO/SPI 호스트 인터페이스, 동작 온도 -40C~+85C; CC3350MOD는 Wi-Fi 전용으로 Bluetooth 없음(BLE 버전은 CC3351MOD).',
        specs: [ k_wifidual, { k: 'Bluetooth', v: '미지원(Wi-Fi 전용; BLE 버전은 CC3351MOD)' }, k_pwdual, k_host, k_thru, k_temp, k_pkg ],
        dropIn: [ { note: '동일한 65-pin LGA 핀 배치(deep-equal 확인 완료); CC3351MOD는 BLE 5.4를 추가로 내장하며, Bluetooth가 필요 없으면 비용 절감을 위해 교체 가능.' } ]
      }
    },
    'CC3351MOD': {
      en: {
        subcategory: 'Dual-Band (2.4/5GHz) Wi-Fi 6 + BLE 5.4 Companion Module',
        whatIs: '2.4GHz and 5GHz dual-band Wi-Fi 6 (802.11ax) and Bluetooth Low Energy 5.4 companion module: the same dual-band transceiver and PA as the CC3350MOD, plus a BLE 5.4 controller subsystem, with both radios sharing the same RF front end and antenna.',
        func: 'Integrates MAC, baseband and a dual-band RF transceiver, supporting IEEE 802.11 a/b/g/n/ax (compatible with Wi-Fi 4 and Wi-Fi 5 802.11ac); includes a dual-band PA with up to +18.3dBm output; supports Wi-Fi 6 efficiency features such as TWT, OFDMA, downlink MU-MIMO and BSS Coloring, with hardware-accelerated WPA2/WPA3; also integrates a Bluetooth Low Energy 5.4 controller subsystem supporting LE Coded PHY (long range), LE 2M PHY (high speed) and Advertising Extension, with HCI transport over UART or shared SDIO, and an internal coexistence mechanism that lets BLE and Wi-Fi share the same RF chain and antenna; host interface is 4-bit SDIO or SPI.',
        usedIn: 'Same applications as the CC3350MOD (grid infrastructure, building/home automation, appliances, medical devices and other dual-band Wi-Fi scenarios), plus scenarios requiring Bluetooth pairing/data transfer such as wearable pairing, mobile-app on-site provisioning and BLE-beacon hybrid connectivity.',
        desc: '65-pin 11x11mm LGA package, 2.4GHz/5GHz dual-band Wi-Fi 6 + Bluetooth Low Energy 5.4 companion module, SDIO/SPI to host, internal Wi-Fi/BLE coexistence, operating -40C to +85C.',
        specs: [ e_wifidual, e_bt54, e_pwdual, e_hostble, e_thru, e_temp, e_pkg ],
        dropIn: [ { note: 'Identical 65-pin LGA pinout (deep-equal verified); CC3350MOD is the Wi-Fi-only version (no BLE) and can be swapped in when Bluetooth is not needed.' } ]
      },
      ja: {
        subcategory: 'デュアルバンド (2.4/5GHz) Wi-Fi 6 + BLE 5.4 コンパニオンモジュール',
        whatIs: '2.4GHzと5GHzのデュアルバンドWi-Fi 6（802.11ax）とBluetooth Low Energy 5.4のコンパニオンモジュール：CC3350MODと同じデュアルバンドトランシーバとPAに、BLE 5.4コントローラサブシステムを追加、両無線が同じRFフロントエンドとアンテナを共有。',
        func: 'MAC、ベースバンド、デュアルバンドRFトランシーバを統合し、IEEE 802.11 a/b/g/n/axに対応（Wi-Fi 4およびWi-Fi 5 802.11acと互換）；デュアルバンドPAを内蔵し最大+18.3dBm出力；TWT、OFDMA、下りMU-MIMO、BSS ColoringなどのWi-Fi 6効率機能に対応、WPA2/WPA3をハードウェアで高速化；さらにBluetooth Low Energy 5.4コントローラサブシステムを統合し、LE Coded PHY（長距離）、LE 2M PHY（高速）、Advertising Extensionに対応、HCI伝送はUARTまたは共用SDIO、内部共存機構によりBLEとWi-Fiが同一のRFチェーンとアンテナを共有；ホストインターフェースは4-bit SDIOまたはSPI。',
        usedIn: 'CC3350MODと同じアプリケーション（電力網インフラ、ビル/ホームオートメーション、家電、医療機器などのデュアルバンドWi-Fiシナリオ）に加え、ウェアラブルのペアリング、モバイルアプリによる現地設定、BLEビーコンのハイブリッド接続など、Bluetoothペアリング/データ転送が必要なシナリオもカバー。',
        desc: '65-pin 11×11mm LGAパッケージ、2.4GHz/5GHzデュアルバンドWi-Fi 6 + Bluetooth Low Energy 5.4コンパニオンモジュール、SDIO/SPIでホスト接続、内部Wi-Fi/BLE共存、動作温度-40C～+85C。',
        specs: [ j_wifidual, j_bt54, j_pwdual, j_hostble, j_thru, j_temp, j_pkg ],
        dropIn: [ { note: '同一の65-pin LGAピン配置（deep-equal確認済み）；CC3350MODはWi-Fiのみ版（BLEなし）で、Bluetooth不要時に置き換え可能。' } ]
      },
      ko: {
        subcategory: '듀얼밴드 (2.4/5GHz) Wi-Fi 6 + BLE 5.4 컴패니언 모듈',
        whatIs: '2.4GHz와 5GHz 듀얼밴드 Wi-Fi 6(802.11ax)와 Bluetooth Low Energy 5.4 컴패니언 모듈: CC3350MOD와 동일한 듀얼밴드 트랜시버와 PA에 BLE 5.4 컨트롤러 서브시스템을 추가, 두 무선이 동일한 RF 프런트엔드와 안테나를 공유.',
        func: 'MAC, 베이스밴드, 듀얼밴드 RF 트랜시버를 통합하여 IEEE 802.11 a/b/g/n/ax를 지원(Wi-Fi 4 및 Wi-Fi 5 802.11ac 호환); 듀얼밴드 PA를 내장하여 최대 +18.3dBm 출력; TWT, OFDMA, 하향 MU-MIMO, BSS Coloring 등 Wi-Fi 6 효율 기능을 지원, WPA2/WPA3를 하드웨어로 가속; 또한 Bluetooth Low Energy 5.4 컨트롤러 서브시스템을 통합하여 LE Coded PHY(장거리), LE 2M PHY(고속), Advertising Extension을 지원, HCI 전송은 UART 또는 공용 SDIO, 내부 공존 기구로 BLE와 Wi-Fi가 동일한 RF 체인과 안테나를 공유; 호스트 인터페이스는 4-bit SDIO 또는 SPI.',
        usedIn: 'CC3350MOD와 동일한 응용(전력망 인프라, 빌딩/홈 오토메이션, 가전, 의료기기 등 듀얼밴드 Wi-Fi 시나리오)에 더해, 웨어러블 페어링, 모바일 앱 현장 설정, BLE 비콘 하이브리드 연결 등 Bluetooth 페어링/데이터 전송이 필요한 시나리오도 포함.',
        desc: '65-pin 11×11mm LGA 패키지, 2.4GHz/5GHz 듀얼밴드 Wi-Fi 6 + Bluetooth Low Energy 5.4 컴패니언 모듈, SDIO/SPI로 호스트 연결, 내부 Wi-Fi/BLE 공존, 동작 온도 -40C~+85C.',
        specs: [ k_wifidual, k_bt54, k_pwdual, k_hostble, k_thru, k_temp, k_pkg ],
        dropIn: [ { note: '동일한 65-pin LGA 핀 배치(deep-equal 확인 완료); CC3350MOD는 Wi-Fi 전용 버전(BLE 없음)으로, Bluetooth가 필요 없을 때 교체 가능.' } ]
      }
    }
  };
  Object.assign(window.IC_I18N, T);
})();

/* IWRL6432WMOD, MSPM0G5117, MSPM33C321A */
(function () {
  var T = {
    'IWRL6432WMOD': {
      en: {
        subcategory: '60GHz FMCW mmWave Radar Module (Motion/Presence)',
        whatIs: '60GHz mmWave radar module for motion and presence detection: integrates the IWRL6432W mmWave sensing chip, PCB-etched antennas and a power network; the host configures detection range, motion sensitivity and update rate over SPI.',
        func: 'Integrated FMCW (frequency-modulated continuous-wave) transceiver with built-in PLL, transmitter, receiver, baseband and ADC; 3 receive and 2 transmit channel antennas are etched on the PCB, with an integrated power-distribution network and 40MHz XTAL; 5MHz IF bandwidth, real-only receive channels; antennas cover 57GHz-61.5GHz (4.5GHz continuous bandwidth) with a +/-60 degree field of view (azimuth and elevation); the host reads/writes configuration over SPI, and motion/presence detection results are indicated on GPIO outputs; the module has a built-in 1.8V regulator and on-chip LDO network to strengthen PSRR, supports a BOM-optimized mode, and includes low-power modes.',
        usedIn: 'Presence/motion sensing applications such as air conditioners, automatic doors/gates, gaming/home entertainment, IP network cameras, occupancy detectors, PCs/laptops, portable electronics, refrigerators/freezers, smartwatches, tablets, TVs, thermostats, video doorbells and robots.',
        desc: '30-pad LGA (4x9 grid, QFM) 60GHz FMCW mmWave radar module, 31mm x 15mm, with built-in antennas and 1.8V regulator, SPI host interface, motion/presence detection via GPIO outputs, operating -40C to +85C.',
        specs: [
          { k: 'Frequency', v: '57GHz-61.5GHz, 4.5GHz continuous bandwidth' },
          { k: 'Field of view (FoV)', v: '+/-60 deg azimuth; +/-60 deg elevation' },
          { k: 'Detection range', v: 'Human presence typical: ~15m at 0 deg; ~8m at FoV edge' },
          { k: 'Supply', v: 'VCC/VIOIN both 3.3V (3.135-3.465V), built-in 1.8V regulator' },
          { k: 'Host interface', v: 'SPI (BUSY/MOSI/MISO/CLK/CS)' },
          { k: 'IF bandwidth', v: '5MHz, real-only receive channels' },
          { k: 'Operating temp', v: '-40C to +85C (industrial)' }
        ]
      },
      ja: {
        subcategory: '60GHz FMCW ミリ波レーダモジュール（動き/存在検知）',
        whatIs: '動き（motion）と存在（presence）検知用の60GHz mmWaveレーダモジュール：IWRL6432W mmWaveセンシングチップ、PCBエッチングアンテナ、電源ネットワークを内蔵し、ホストはSPIで検知距離、動き感度、更新レートを設定。',
        func: '統合型FMCW（周波数変調連続波）トランシーバ、PLL、送信器、受信器、ベースバンド、ADCを内蔵；3系統の受信、2系統の送信チャネルアンテナをPCB上にエッチングし、電源分配ネットワークと40MHz XTALを統合；5MHz IF帯域、実数のみ（real-only）受信チャネル；アンテナは57GHz～61.5GHz（連続帯域4.5GHz）をカバー、視野角±60°（方位角と仰角）；ホストはSPIで設定を読み書きし、動き/存在検知結果はGPIO出力で表示；モジュールは1.8VレギュレータとオンチップLDOネットワークを内蔵しPSRRを強化、BOM最適化モードに対応、低消費電力モードを備える。',
        usedIn: 'エアコン、自動ドア/ゲート、ゲーム/ホームエンタテインメント、IPネットワークカメラ、在室検知器、PC/ノートPC、携帯電子機器、冷蔵庫/冷凍庫、スマートウォッチ、タブレット、テレビ、サーモスタット、ビデオドアベル、ロボットなどの存在/動き検知アプリケーション。',
        desc: '30-pad LGA（4×9グリッド、QFM）パッケージの60GHz FMCW mmWaveレーダモジュール、31mm×15mm、アンテナと1.8Vレギュレータを内蔵、SPIホストインターフェース、動き/存在検知はGPIO出力、動作温度-40C～+85C。',
        specs: [
          { k: '周波数', v: '57GHz～61.5GHz、連続帯域4.5GHz' },
          { k: '視野角 (FoV)', v: '±60° 方位角；±60° 仰角' },
          { k: '検知距離', v: '人体存在検知の代表値：0°方向で約15m；FoV端で約8m' },
          { k: '電源', v: 'VCC/VIOINともに3.3V（3.135～3.465V）、1.8Vレギュレータ内蔵' },
          { k: 'ホストインターフェース', v: 'SPI（BUSY/MOSI/MISO/CLK/CS）' },
          { k: 'IF帯域', v: '5MHz、実数のみ（real-only）受信チャネル' },
          { k: '動作温度', v: '-40C～+85C（工業級）' }
        ]
      },
      ko: {
        subcategory: '60GHz FMCW mmWave 레이더 모듈 (움직임/존재 감지)',
        whatIs: '움직임(motion)과 존재(presence) 감지를 위한 60GHz mmWave 레이더 모듈: IWRL6432W mmWave 센싱 칩, PCB 에칭 안테나, 전원 네트워크를 내장하며, 호스트는 SPI로 감지 거리, 움직임 감도, 갱신율을 설정.',
        func: '통합형 FMCW(주파수 변조 연속파) 트랜시버, PLL, 송신기, 수신기, 베이스밴드, ADC를 내장; 3계통 수신, 2계통 송신 채널 안테나를 PCB 위에 에칭하고, 전원 분배 네트워크와 40MHz XTAL을 통합; 5MHz IF 대역폭, 실수 전용(real-only) 수신 채널; 안테나는 57GHz~61.5GHz(연속 대역 4.5GHz)를 커버, 시야각 ±60°(방위각과 앙각); 호스트는 SPI로 설정을 읽고 쓰며, 움직임/존재 감지 결과는 GPIO 출력으로 표시; 모듈은 1.8V 레귤레이터와 온칩 LDO 네트워크를 내장하여 PSRR을 강화, BOM 최적화 모드를 지원, 저전력 모드를 갖춘다.',
        usedIn: '에어컨, 자동문/게이트, 게임/홈 엔터테인먼트, IP 네트워크 카메라, 재실 감지기, PC/노트북, 휴대용 전자기기, 냉장고/냉동고, 스마트워치, 태블릿, TV, 서모스탯, 비디오 도어벨, 로봇 등 존재/움직임 감지 응용.',
        desc: '30-pad LGA(4×9 그리드, QFM) 패키지의 60GHz FMCW mmWave 레이더 모듈, 31mm×15mm, 안테나와 1.8V 레귤레이터 내장, SPI 호스트 인터페이스, 움직임/존재 감지는 GPIO 출력, 동작 온도 -40C~+85C.',
        specs: [
          { k: '주파수', v: '57GHz~61.5GHz, 연속 대역 4.5GHz' },
          { k: '시야각 (FoV)', v: '±60° 방위각; ±60° 앙각' },
          { k: '감지 거리', v: '인체 존재 감지 대표값: 0° 방향 약 15m; FoV 가장자리 약 8m' },
          { k: '전원', v: 'VCC/VIOIN 모두 3.3V(3.135~3.465V), 1.8V 레귤레이터 내장' },
          { k: '호스트 인터페이스', v: 'SPI(BUSY/MOSI/MISO/CLK/CS)' },
          { k: 'IF 대역폭', v: '5MHz, 실수 전용(real-only) 수신 채널' },
          { k: '동작 온도', v: '-40C~+85C(산업용)' }
        ]
      }
    },
    'MSPM0G5117': {
      en: {
        subcategory: 'Arm Cortex-M0+ USB 2.0-FS Mixed-Signal MCU (up to 128KB flash / 32KB RAM)',
        whatIs: 'Mixed-signal MCU: Arm 32-bit Cortex-M0+ core (with memory protection unit, up to 80MHz, PLL up to 80MHz), operating temperature -40C to 125C, supply range 1.62V-3.6V; up to 128KB flash (ECC, dual-bank supporting address swap for OTA update) + 8KB data-flash bank (ECC) + up to 32KB SRAM (ECC or hardware parity); built-in 12-bit 1.6Msps ADC (up to 26 external channels, configurable 1.6Msps with VREF1 or 0.9Msps with VREF2, 14-bit effective resolution at 100ksps), high-speed comparator COMP (with 8-bit reference DAC, 32ns propagation delay), two VREFs, and an integrated temperature sensor; built-in USB 2.0 full-speed (12Mbps) interface supporting device/host modes, crystal-less device operation and up to 8 bidirectional endpoints; targets PSA-L1 certification. MSPM0G5117, MSPM0G5116 and MSPM0G5115 are three memory-capacity variants in the same family; MSPM0G5117 is listed first in the page-1 Features (generally corresponding to the largest capacity, 128KB flash / 32KB SRAM); exact per-part configuration is not shown on this excerpt page, see the datasheet Device Comparison. Package options include DGS20, RUY, YCJ, RGE, RHB, RGZ (48-VQFN), PT (48-LQFP) and PM (8 total); per-package pin counts and exact dimensions are in the datasheet.',
        func: 'Low-power modes: RUN 103uA/MHz (CoreMark), SLEEP 34uA/MHz, STOP 199uA@4MHz, STANDBY 1.5uA@32kHz (RTC + full SRAM/state retention), SHUTDOWN 88nA (IO wake supported); digital peripherals: 12-channel DMA controller, four timers supporting up to 14 PWM outputs (two 16-bit general-purpose timers; one 16-bit general-purpose timer with STANDBY low-power operation; one 16-bit advanced timer with deadband and complementary outputs, up to 8 PWM), one basic software timer with 4 independently configurable 16-bit counters (two can be chained into a 32-bit counter and generate 2x-interrupt-driven PWM), two windowed watchdogs (WWDT), one independent watchdog (IWDT), and an RTC with alarm and calendar modes; communication interfaces: four configurable UNICOMM serial interfaces (two support UART(LIN) or I2C(SMBus/PMBus); one supports UART or SPI; one supports SPI up to 32Mbps), one USB 2.0 full-speed interface, one digital-audio interface (supporting I2S standard UM11732, Codec LSB/MSB Justified, DSP serial interface with up to 8 audio channels per data pin, PCM short/long frame, TDM Classic/I2S/Left/Right Justified up to 8 slots); clock system: built-in 4-32MHz SYSOSC (+/-1.2%), PLL up to 80MHz, built-in 60MHz USB FLL (+/-0.25%), built-in 32kHz LFOSC (+/-3%), external 4-48MHz HFXT, external 32kHz LFXT, external clock input; security: AES accelerator (GCM/GMAC, CCM/CBC-MAC, CBC, CTR), up to 4 AES keys in secure storage; I/O: 43 GPIO pins (PAx/PBx) on the 48-VQFN (RGZ) package, plus NRST, VDD, VSS, VCORE and VUSB33 (one each); development: 2-pin SWD.',
        usedIn: 'Suitable for general embedded applications needing a USB 2.0-FS interface, such as USB peripherals, sensor nodes, motor control, industrial automation, consumer electronics and data-acquisition modules (this excerpt page contains no explicit Applications list; see the datasheet).',
        desc: 'Arm Cortex-M0+ MCU, up to 80MHz / up to 128KB flash / 32KB SRAM, built-in USB 2.0-FS interface, 12-bit 1.6Msps ADC, multiple packages including 48-VQFN (RGZ).',
        thermalPad: 'Exposed pad (marked Thermal Pad in the center of the 48-pin RGZ in datasheet Figure 6-3); must connect to the VSS board ground plane.',
        specs: [
          { k: 'Core', v: 'Arm 32-bit Cortex-M0+, with memory protection unit, up to 80MHz (PLL up to 80MHz)' },
          { k: 'Supply range', v: '1.62V ~ 3.6V' },
          { k: 'Memory', v: 'Up to 128KB flash (ECC, dual-bank OTA address swap) + 8KB data-flash bank (ECC) + up to 32KB SRAM (ECC or hardware parity); MSPM0G5117 is the largest-capacity part in the series, exact configuration see datasheet' },
          { k: 'ADC', v: '12-bit, 1.6Msps, up to 26 external channels; configurable 1.6Msps (VREF1) or 0.9Msps (VREF2); 14-bit effective resolution at 100ksps (hardware averaging)' },
          { k: 'Comparator', v: 'High-speed COMP with 8-bit reference DAC, 32ns propagation delay (high-speed mode), <1uA in low-power mode' },
          { k: 'USB', v: 'USB 2.0 full-speed (12Mbps), device/host modes, crystal-less device operation, up to 8 bidirectional endpoints' },
          { k: 'Low power', v: 'RUN 103uA/MHz (CoreMark); SLEEP 34uA/MHz; STOP 199uA@4MHz; STANDBY 1.5uA@32kHz (RTC + full SRAM retention); SHUTDOWN 88nA (IO wake supported)' },
          { k: 'Comm interfaces', v: '4 configurable UNICOMM serial interfaces (2x UART(LIN)/I2C(SMBus/PMBus); 1x UART or SPI; 1x SPI up to 32Mbps); 1 digital-audio interface (I2S/PCM/TDM)' },
          { k: 'Clocks', v: 'Built-in 4-32MHz SYSOSC (+/-1.2%); PLL up to 80MHz; built-in 60MHz USB FLL (+/-0.25%); built-in 32kHz LFOSC (+/-3%); external 4-48MHz HFXT; external 32kHz LFXT' },
          { k: 'Security', v: 'AES accelerator (GCM/GMAC, CCM/CBC-MAC, CBC, CTR); up to 4 AES keys in secure storage' },
          { k: 'I/O', v: '43 GPIO on the 48-VQFN (RGZ) package' },
          { k: 'Package options', v: 'DGS20, RUY, YCJ, RGE, RHB, RGZ (48-VQFN), PT (48-LQFP), PM (8 total)' },
          { k: 'Debug', v: '2-pin SWD' }
        ]
      },
      ja: {
        subcategory: 'Arm Cortex-M0+ USB 2.0-FS ミックスドシグナルMCU（最大128KB flash／32KB RAM）',
        whatIs: 'ミックスドシグナルMCU：Arm 32-bit Cortex-M0+コア（メモリ保護ユニット内蔵、最大80MHz、PLLで80MHz可能）、動作温度-40C～125C、電源範囲1.62V～3.6V；最大128KB flash（ECC、デュアルバンクでOTA更新用のアドレス交換に対応）＋8KB data flashバンク（ECC）＋最大32KB SRAM（ECCまたはハードウェアパリティ）；12-bit 1.6Msps ADC（最大26の外部チャネル、VREF1で1.6MspsまたはVREF2で0.9Mspsに設定可能、100kspsで14-bit有効分解能）、高速コンパレータCOMP（8-bit基準DAC内蔵、32ns伝搬遅延）、2組のVREF、温度センサを内蔵；USB2.0フルスピード（12Mbps）インターフェースを内蔵し、device/hostモード、クリスタルレスdevice動作、最大8個の双方向エンドポイントに対応；PSA-L1認証を目標。MSPM0G5117、MSPM0G5116、MSPM0G5115は同一ファミリの3つのメモリ容量型番で、MSPM0G5117はページ1 Featuresの先頭に記載（一般に最大容量128KB flash／32KB SRAMに対応）、正確な型番ごとの構成は本抜粋ページには記載なし、datasheet Device Comparison参照。パッケージオプションはDGS20、RUY、YCJ、RGE、RHB、RGZ (48-VQFN)、PT (48-LQFP)、PMの計8種、各パッケージのピン数と正確な寸法はdatasheet参照。',
        func: '低消費電力モード：RUN 103uA/MHz（CoreMark）、SLEEP 34uA/MHz、STOP 199uA@4MHz、STANDBY 1.5uA@32kHz（RTC＋全SRAM/状態保持）、SHUTDOWN 88nA（IOウェイク対応）；デジタル周辺機能：12チャネルDMAコントローラ、4つのタイマで最大14系統のPWM出力（16-bit汎用タイマ2個；STANDBY低消費電力動作対応の16-bit汎用タイマ1個；deadbandと相補出力を備えた16-bit高機能タイマ1個、最大8系統PWM）、4組の独立設定可能な16-bitカウンタを持つ基本ソフトウェアタイマ1個（2組を32-bitカウンタに連結可能、2倍割り込み駆動PWMを生成可能）、2組のウィンドウ付きウォッチドッグ（WWDT）、1組の独立ウォッチドッグ（IWDT）、アラームとカレンダーモードを備えたRTC；通信インターフェース：4組の設定可能なUNICOMMシリアルインターフェース（2組はUART(LIN)またはI2C(SMBus/PMBus)対応；1組はUARTまたはSPI対応；1組はSPI最大32Mbps対応）、1組のUSB2.0フルスピードインターフェース、1組のデジタルオーディオインターフェース（I2S標準UM11732、Codec LSB/MSB Justified、データピンあたり最大8オーディオチャネルのDSPシリアルインターフェース、PCM短/長フレーム、TDM Classic/I2S/Left/Right Justified最大8スロットに対応）；クロックシステム：内蔵4～32MHz SYSOSC（±1.2%）、PLL最大80MHz、内蔵60MHz USB FLL（±0.25%）、内蔵32kHz LFOSC（±3%）、外部4～48MHz HFXT、外部32kHz LFXT、外部クロック入力；セキュリティ：AESアクセラレータ（GCM/GMAC、CCM/CBC-MAC、CBC、CTR対応）、最大4組のAES鍵をセキュアストレージに保存；I/O：48-VQFN(RGZ)パッケージ上に43個のGPIOピン（PAx/PBx）、ほかにNRST、VDD、VSS、VCORE、VUSB33を各1；開発サポート：2-pin SWD。',
        usedIn: 'USB 2.0-FSインターフェースが必要な汎用組み込みアプリケーション（USB周辺機器、センサノード、モータ制御、産業オートメーション、民生用電子機器、データ収集モジュールなど）に適する（本抜粋ページに明確なApplicationsリストはなし、datasheet参照）。',
        desc: 'Arm Cortex-M0+ MCU、最大80MHz／最大128KB flash／32KB SRAM、USB 2.0-FSインターフェース内蔵、12-bit 1.6Msps ADC、48-VQFN (RGZ) など複数パッケージから選択可能。',
        thermalPad: '露出パッド（datasheet図6-3の48-pin RGZ中央にThermal Padと表示）、VSSの基板グランドプレーンに接続する必要がある。',
        specs: [
          { k: 'コア', v: 'Arm 32-bit Cortex-M0+、メモリ保護ユニット内蔵、最大80MHz（PLLで80MHz可能）' },
          { k: '電源範囲', v: '1.62V ~ 3.6V' },
          { k: 'メモリ', v: '最大128KB flash（ECC、デュアルバンクでOTAアドレス交換対応）＋8KB data flashバンク(ECC)＋最大32KB SRAM(ECCまたはハードウェアパリティ)；MSPM0G5117はシリーズ最大容量型番、正確な構成はdatasheet参照' },
          { k: 'ADC', v: '12-bit、1.6Msps、最大26の外部チャネル；1.6Msps(VREF1)または0.9Msps(VREF2)に設定可能；100kspsで14-bit有効分解能(ハードウェア平均)' },
          { k: 'コンパレータ', v: '高速COMP、8-bit基準DAC内蔵、32ns伝搬遅延(高速モード)、低消費電力モードで<1uA' },
          { k: 'USB', v: 'USB2.0フルスピード(12Mbps)、device/hostモード、クリスタルレスdevice動作、最大8個の双方向エンドポイント' },
          { k: '低消費電力', v: 'RUN 103uA/MHz(CoreMark)；SLEEP 34uA/MHz；STOP 199uA@4MHz；STANDBY 1.5uA@32kHz(RTC+全SRAM保持)；SHUTDOWN 88nA(IOウェイク対応)' },
          { k: '通信インターフェース', v: '4組の設定可能なUNICOMMシリアルインターフェース(2組UART(LIN)/I2C(SMBus/PMBus)；1組UARTまたはSPI；1組SPI最大32Mbps)；1組デジタルオーディオインターフェース(I2S/PCM/TDM)' },
          { k: 'クロック', v: '内蔵4～32MHz SYSOSC(±1.2%)；PLL最大80MHz；内蔵60MHz USB FLL(±0.25%)；内蔵32kHz LFOSC(±3%)；外部4～48MHz HFXT；外部32kHz LFXT' },
          { k: 'セキュリティ', v: 'AESアクセラレータ(GCM/GMAC、CCM/CBC-MAC、CBC、CTR)；最大4組のAES鍵をセキュアストレージに保存' },
          { k: 'I/O', v: '48-VQFN(RGZ)パッケージ上に43個のGPIO' },
          { k: 'パッケージオプション', v: 'DGS20、RUY、YCJ、RGE、RHB、RGZ(48-VQFN)、PT(48-LQFP)、PMの計8種' },
          { k: 'デバッグ', v: '2-pin SWD' }
        ]
      },
      ko: {
        subcategory: 'Arm Cortex-M0+ USB 2.0-FS 혼합신호 MCU (최대 128KB flash / 32KB RAM)',
        whatIs: '혼합신호 MCU: Arm 32-bit Cortex-M0+ 코어(메모리 보호 유닛 내장, 최대 80MHz, PLL로 80MHz 가능), 동작 온도 -40C~125C, 전원 범위 1.62V~3.6V; 최대 128KB flash(ECC, 듀얼 뱅크로 OTA 업데이트용 주소 교환 지원) + 8KB data flash 뱅크(ECC) + 최대 32KB SRAM(ECC 또는 하드웨어 패리티); 12-bit 1.6Msps ADC(최대 26개 외부 채널, VREF1로 1.6Msps 또는 VREF2로 0.9Msps 설정 가능, 100ksps에서 14-bit 유효 분해능), 고속 비교기 COMP(8-bit 기준 DAC 내장, 32ns 전파 지연), 2조 VREF, 온도 센서를 내장; USB2.0 풀스피드(12Mbps) 인터페이스를 내장하여 device/host 모드, 크리스털리스 device 동작, 최대 8개 양방향 엔드포인트를 지원; PSA-L1 인증을 목표. MSPM0G5117, MSPM0G5116, MSPM0G5115는 동일 패밀리의 3가지 메모리 용량 모델이며, MSPM0G5117은 페이지1 Features 선두에 기재(일반적으로 최대 용량 128KB flash / 32KB SRAM에 대응), 정확한 모델별 구성은 본 발췌 페이지에 없음, datasheet Device Comparison 참조. 패키지 옵션은 DGS20, RUY, YCJ, RGE, RHB, RGZ (48-VQFN), PT (48-LQFP), PM 총 8종, 각 패키지의 핀 수와 정확한 치수는 datasheet 참조.',
        func: '저전력 모드: RUN 103uA/MHz(CoreMark), SLEEP 34uA/MHz, STOP 199uA@4MHz, STANDBY 1.5uA@32kHz(RTC + 전체 SRAM/상태 유지), SHUTDOWN 88nA(IO 웨이크 지원); 디지털 주변 기능: 12채널 DMA 컨트롤러, 4개 타이머로 최대 14계통 PWM 출력(16-bit 범용 타이머 2개; STANDBY 저전력 동작 지원 16-bit 범용 타이머 1개; deadband와 상보 출력을 갖춘 16-bit 고급 타이머 1개, 최대 8계통 PWM), 4조의 독립 설정 가능한 16-bit 카운터를 갖는 기본 소프트웨어 타이머 1개(2조를 32-bit 카운터로 연결 가능, 2배 인터럽트 구동 PWM 생성 가능), 2조 윈도우 워치도그(WWDT), 1조 독립 워치도그(IWDT), 알람과 캘린더 모드를 갖춘 RTC; 통신 인터페이스: 4조의 설정 가능한 UNICOMM 시리얼 인터페이스(2조는 UART(LIN) 또는 I2C(SMBus/PMBus) 지원; 1조는 UART 또는 SPI 지원; 1조는 SPI 최대 32Mbps 지원), 1조 USB2.0 풀스피드 인터페이스, 1조 디지털 오디오 인터페이스(I2S 표준 UM11732, Codec LSB/MSB Justified, 데이터 핀당 최대 8 오디오 채널의 DSP 시리얼 인터페이스, PCM 짧은/긴 프레임, TDM Classic/I2S/Left/Right Justified 최대 8 슬롯 지원); 클록 시스템: 내장 4~32MHz SYSOSC(±1.2%), PLL 최대 80MHz, 내장 60MHz USB FLL(±0.25%), 내장 32kHz LFOSC(±3%), 외부 4~48MHz HFXT, 외부 32kHz LFXT, 외부 클록 입력; 보안: AES 가속기(GCM/GMAC, CCM/CBC-MAC, CBC, CTR 지원), 최대 4조 AES 키를 보안 저장소에 저장; I/O: 48-VQFN(RGZ) 패키지에 43개 GPIO 핀(PAx/PBx), 그 외 NRST, VDD, VSS, VCORE, VUSB33 각 1; 개발 지원: 2-pin SWD.',
        usedIn: 'USB 2.0-FS 인터페이스가 필요한 범용 임베디드 응용(USB 주변기기, 센서 노드, 모터 제어, 산업 자동화, 소비자 전자, 데이터 수집 모듈 등)에 적합(본 발췌 페이지에 명확한 Applications 목록 없음, datasheet 참조).',
        desc: 'Arm Cortex-M0+ MCU, 최대 80MHz / 최대 128KB flash / 32KB SRAM, USB 2.0-FS 인터페이스 내장, 12-bit 1.6Msps ADC, 48-VQFN (RGZ) 등 다양한 패키지 선택 가능.',
        thermalPad: '노출 패드(datasheet 그림 6-3의 48-pin RGZ 중앙에 Thermal Pad 표시), VSS 기판 접지 평면에 연결해야 한다.',
        specs: [
          { k: '코어', v: 'Arm 32-bit Cortex-M0+, 메모리 보호 유닛 내장, 최대 80MHz(PLL로 80MHz 가능)' },
          { k: '전원 범위', v: '1.62V ~ 3.6V' },
          { k: '메모리', v: '최대 128KB flash(ECC, 듀얼 뱅크 OTA 주소 교환 지원) + 8KB data flash 뱅크(ECC) + 최대 32KB SRAM(ECC 또는 하드웨어 패리티); MSPM0G5117은 시리즈 최대 용량 모델, 정확한 구성은 datasheet 참조' },
          { k: 'ADC', v: '12-bit, 1.6Msps, 최대 26개 외부 채널; 1.6Msps(VREF1) 또는 0.9Msps(VREF2) 설정 가능; 100ksps에서 14-bit 유효 분해능(하드웨어 평균)' },
          { k: '비교기', v: '고속 COMP, 8-bit 기준 DAC 내장, 32ns 전파 지연(고속 모드), 저전력 모드에서 <1uA' },
          { k: 'USB', v: 'USB2.0 풀스피드(12Mbps), device/host 모드, 크리스털리스 device 동작, 최대 8개 양방향 엔드포인트' },
          { k: '저전력', v: 'RUN 103uA/MHz(CoreMark); SLEEP 34uA/MHz; STOP 199uA@4MHz; STANDBY 1.5uA@32kHz(RTC+전체 SRAM 유지); SHUTDOWN 88nA(IO 웨이크 지원)' },
          { k: '통신 인터페이스', v: '4조 설정 가능한 UNICOMM 시리얼 인터페이스(2조 UART(LIN)/I2C(SMBus/PMBus); 1조 UART 또는 SPI; 1조 SPI 최대 32Mbps); 1조 디지털 오디오 인터페이스(I2S/PCM/TDM)' },
          { k: '클록', v: '내장 4~32MHz SYSOSC(±1.2%); PLL 최대 80MHz; 내장 60MHz USB FLL(±0.25%); 내장 32kHz LFOSC(±3%); 외부 4~48MHz HFXT; 외부 32kHz LFXT' },
          { k: '보안', v: 'AES 가속기(GCM/GMAC, CCM/CBC-MAC, CBC, CTR 지원); 최대 4조 AES 키를 보안 저장소에 저장' },
          { k: 'I/O', v: '48-VQFN(RGZ) 패키지에 43개 GPIO' },
          { k: '패키지 옵션', v: 'DGS20, RUY, YCJ, RGE, RHB, RGZ(48-VQFN), PT(48-LQFP), PM 총 8종' },
          { k: '디버그', v: '2-pin SWD' }
        ]
      }
    },
    'MSPM33C321A': {
      en: {
        subcategory: 'Arm Cortex-M33 TrustZone Mixed-Signal MCU (up to 1MB flash / 256KB RAM, dual CAN-FD, ADVANCE INFORMATION preproduction)',
        whatIs: '[Note: this part\'s datasheet (SLASFB6) is marked ADVANCE INFORMATION and is a preproduction specification subject to change without notice; values may change before mass production, so always refer to the latest TI datasheet.] Mixed-signal MCU: 160MHz Arm 32-bit Cortex-M33 CPU with TrustZone, FPU and DSP extensions, 4kB instruction cache for 0-wait-state execution; operating temperature -40C to 125C, supply range 1.71V-3.6V; up to 1MB flash (ECC, dual-bank address swap) + 256KB SRAM (ECC) + EEPROM emulation via 32KB high-endurance data flash; security: immutable Root of Trust in ROM (secure firmware install/boot/key provisioning), Global Security Controller (dynamic flash/SRAM/peripheral access control), AES256 hardware accelerator (GCM), SHA256 hardware accelerator (HMAC), Public Key Accelerator (PKA), 32-bit true random number generator (TRNG); analog: two high-speed 9.4Msps 12-bit ADCs (up to 36 external channels), two high-speed/low-power comparators (COMP), two externally accessible 8-bit DACs, a configurable 1.4V or 2.5V internal shared VREF, and integrated temperature and supply monitoring; a VBAT island with independent backup supply (including RTC, three tamper-detection IOs with timestamp, an independent watchdog IWDT, and 32B backup memory); up to 93 GPIO (largest package in the series). MSPM33C321A is the largest-capacity part in the series (1MB flash/256KB SRAM); the family MSPM33C3219 has 512KB flash/256KB SRAM. Package options: 100-pin LQFP (0.4mm & 0.5mm pitch, PFA/PZ), 80-pin LQFP (0.5mm, PN), 64-pin LQFP (0.5mm, PM), 48-pin VQFN (0.5mm, RGZ), 100-pin nFBGA (0.8mm, ZAW).',
        func: 'Low-power modes: RUN 207uA/MHz (CoreMark), STANDBY 16uA (CPU-execution resume + 64KB SRAM retention), SHUTDOWN <100nA (IO wake supported); digital peripherals: two DMA controllers with 16 channels total, nine timers supporting up to 30 PWM outputs (two 16-bit advanced timers with deadband/fault handling/complementary output pairs; four 16-bit general-purpose timers; one 32-bit general-purpose timer; two 16-bit general-purpose timers with quadrature-encoder interface), one windowed watchdog, CRC16/32 module; communication interfaces: QSPI (for external memory, up to 20MB/s), two CAN interfaces (CAN2.0A/B and CAN-FD), three configurable serial interfaces supporting UART(LIN) or I2C(SMBus/PMBus), four configurable serial interfaces supporting UART/I2C/SPI, two dedicated I2C (up to FM+ 1Mbit/s, SMBus/PMBus), one dedicated SPI, one dedicated UART (supporting LIN, IrDA, DALI, Smart Card, Manchester), two digital-audio interfaces (full-duplex I2S and TDM 16-slot); clock system: built-in 32MHz SYSOSC, PLL, built-in 32kHz LFOSC, external 4-48MHz HFXT, external 32kHz LFXT, external clock input; development: 2-pin SWD; dev kit: LaunchPad EVM LP-MSPM33C321A, MSP SDK; 38 GPIO pins (PAx/PBx/PCx, including TDI/TDO JTAG-cum-GPIO pins) on the 48-VQFN (RGZ) package, plus NRST, VBAT, VDD (2 pins), VCORE.',
        usedIn: 'Suitable for applications needing high security (TrustZone/RoT/AES256/SHA256/PKA/TRNG) and dual CAN-FD communication, such as industrial automation, motor control, battery management and security gateways (this excerpt page contains no explicit Applications list; see the datasheet).',
        desc: 'Arm Cortex-M33 MCU (160MHz, with TrustZone/FPU/DSP), up to 1MB flash / 256KB SRAM, dual 9.4Msps 12-bit ADC, dual CAN-FD, multiple packages including 48-VQFN (RGZ) (ADVANCE INFORMATION, preproduction spec, see datasheet SLASFB6).',
        thermalPad: 'Exposed pad = VSS (marked VSS in the center of the 48-pin RGZ in datasheet Figure 6-5); ground connection for this package is via this pad, which must connect to the board ground plane.',
        specs: [
          { k: 'Status', v: 'ADVANCE INFORMATION (preproduction spec, SLASFB6, Dec 2025); values may change, refer to the latest TI datasheet before production' },
          { k: 'Core', v: '160MHz Arm 32-bit Cortex-M33 with TrustZone, FPU, DSP extensions; 4kB instruction cache (0 wait-state)' },
          { k: 'Supply range', v: '1.71V ~ 3.6V' },
          { k: 'Memory', v: 'Up to 1MB flash (ECC, dual-bank address swap) + 256KB SRAM (ECC) + 32KB high-endurance data flash (EEPROM emulation); MSPM33C321A is the largest-capacity part in the series' },
          { k: 'Security', v: 'ROM Root of Trust; Global Security Controller; AES256 (GCM); SHA256 (HMAC); PKA; 32-bit TRNG' },
          { k: 'ADC', v: 'Two high-speed 12-bit ADCs, 9.4Msps, up to 36 external channels' },
          { k: 'Comparator/DAC', v: 'Two high-speed/low-power COMP; two externally accessible 8-bit DACs; configurable 1.4V/2.5V internal shared VREF; integrated temperature and supply monitoring' },
          { k: 'Low power', v: 'RUN 207uA/MHz (CoreMark); STANDBY 16uA (CPU-execution resume + 64KB SRAM retention); SHUTDOWN <100nA (IO wake supported)' },
          { k: 'Comm interfaces', v: 'QSPI up to 20MB/s; 2x CAN (CAN2.0A/B + CAN-FD); 3x UART(LIN)/I2C; 4x UART/I2C/SPI; 2x dedicated I2C (FM+ 1Mbit/s); 1x dedicated SPI; 1x dedicated UART (LIN/IrDA/DALI/SmartCard/Manchester); 2x digital audio (full-duplex I2S/TDM 16-slot)' },
          { k: 'VBAT island', v: 'Independent supply, with RTC, 3 tamper-detection IOs (timestamp), independent watchdog IWDT, 32B backup memory' },
          { k: 'I/O', v: 'Up to 93 GPIO (largest package in series); 38 GPIO on the 48-VQFN (RGZ) package' },
          { k: 'Package options', v: '100-pin LQFP (0.4mm/0.5mm, PFA/PZ), 80-pin LQFP (PN), 64-pin LQFP (PM), 48-pin VQFN (RGZ), 100-pin nFBGA (ZAW)' },
          { k: 'Debug', v: '2-pin SWD' }
        ]
      },
      ja: {
        subcategory: 'Arm Cortex-M33 TrustZone ミックスドシグナルMCU（最大1MB flash／256KB RAM、デュアルCAN-FD、ADVANCE INFORMATION 先行製品）',
        whatIs: '【注意：本料番のdatasheet（SLASFB6）はADVANCE INFORMATIONと表示され、先行製品（preproduction）仕様で予告なく変更される場合があり、量産前に数値が変わる可能性があるため、必ずTIの最新版datasheetを参照】ミックスドシグナルMCU：160MHz Arm 32-bit Cortex-M33 CPU、TrustZone、FPU、DSP拡張を内蔵、4kB命令キャッシュで0 wait-state実行に対応；動作温度-40C～125C、電源範囲1.71V～3.6V；最大1MB flash（ECC、デュアルバンクアドレス交換）＋256KB SRAM（ECC）＋32KB高耐久data flashによるEEPROMエミュレーション；セキュリティ：ROM内蔵の不変Root of Trust（セキュアファームウェアインストール/起動/鍵プロビジョニング）、Global Security Controller（flash/SRAM/周辺の動的アクセス制御）、AES256ハードウェアアクセラレータ(GCM)、SHA256ハードウェアアクセラレータ(HMAC)、Public Key Accelerator(PKA)、32-bit真性乱数生成器(TRNG)；アナログ：高速9.4Msps 12-bit ADC 2組（最大36の外部チャネル）、高速/低消費電力コンパレータ(COMP)2組、外部から利用可能な8-bit DAC 2組、設定可能な1.4Vまたは2.5V内部共用VREF、温度と電源の監視を統合；VBAT island独立補助電源（RTC、タイムスタンプ付き3組のtamper検出IO、独立ウォッチドッグIWDT、32Bバックアップメモリを含む）；最大93個のGPIO（シリーズ最大パッケージ）。MSPM33C321Aはシリーズ最大容量型番（1MB flash/256KB SRAM）、同シリーズのMSPM33C3219は512KB flash/256KB SRAM。パッケージオプション：100-pin LQFP(0.4mm & 0.5mmピッチ、PFA/PZ)、80-pin LQFP(0.5mm、PN)、64-pin LQFP(0.5mm、PM)、48-pin VQFN(0.5mm、RGZ)、100-pin nFBGA(0.8mm、ZAW)。',
        func: '低消費電力モード：RUN 207uA/MHz（CoreMark）、STANDBY 16uA（CPU実行復帰＋64KB SRAM保持）、SHUTDOWN <100nA（IOウェイク対応）；デジタル周辺機能：合計16チャネルのDMAコントローラ2組、9つのタイマで最大30系統のPWM出力（deadband/フォールト処理/相補出力ペアを備えた16-bit高機能タイマ2個；16-bit汎用タイマ4個；32-bit汎用タイマ1個；直交エンコーダインターフェース対応の16-bit汎用タイマ2個）、ウィンドウ付きウォッチドッグ1組、CRC16/32モジュール；通信インターフェース：QSPI（外部メモリ用、最大20MB/s）、2組のCANインターフェース（CAN2.0A/BとCAN-FD対応）、UART(LIN)またはI2C(SMBus/PMBus)対応の設定可能なシリアルインターフェース3組、UART/I2C/SPI対応の設定可能なシリアルインターフェース4組、専用I2C 2組（最大FM+ 1Mbit/s、SMBus/PMBus）、専用SPI 1組、専用UART 1組（LIN、IrDA、DALI、Smart Card、Manchester対応）、デジタルオーディオインターフェース2組（全二重I2SとTDM 16スロット）；クロックシステム：内蔵32MHz SYSOSC、PLL、内蔵32kHz LFOSC、外部4～48MHz HFXT、外部32kHz LFXT、外部クロック入力；開発サポート：2-pin SWD；開発キット：LaunchPad EVM LP-MSPM33C321A、MSP SDK；48-VQFN(RGZ)パッケージ上に38個のGPIOピン（PAx/PBx/PCx、TDI/TDOのJTAG兼GPIOピンを含む）、ほかにNRST、VBAT、VDD(2本)、VCORE。',
        usedIn: '高いセキュリティ（TrustZone/RoT/AES256/SHA256/PKA/TRNG）とデュアルCAN-FD通信が必要な産業オートメーション、モータ制御、バッテリ管理、セキュリティゲートウェイなどのアプリケーションに適する（本抜粋ページに明確なApplicationsリストはなし、datasheet参照）。',
        desc: 'Arm Cortex-M33 MCU（160MHz、TrustZone/FPU/DSP内蔵）、最大1MB flash／256KB SRAM、デュアル9.4Msps 12-bit ADC、デュアルCAN-FD、48-VQFN (RGZ) など複数パッケージから選択可能（ADVANCE INFORMATION、先行製品仕様、datasheet SLASFB6参照）。',
        thermalPad: '露出パッド＝VSS（datasheet図6-5の48-pin RGZ中央にVSSと表示）；本パッケージのグランド接続はこのパッド経由で、基板グランドプレーンに接続する必要がある。',
        specs: [
          { k: 'ステータス', v: 'ADVANCE INFORMATION（先行製品仕様、SLASFB6、2025年12月）、数値は変更の可能性あり、量産前にTI最新版datasheetを基準とする' },
          { k: 'コア', v: '160MHz Arm 32-bit Cortex-M33、TrustZone、FPU、DSP拡張内蔵；4kB命令キャッシュ（0 wait-state）' },
          { k: '電源範囲', v: '1.71V ~ 3.6V' },
          { k: 'メモリ', v: '最大1MB flash（ECC、デュアルバンクアドレス交換）＋256KB SRAM（ECC）＋32KB高耐久data flash（EEPROMエミュレーション）；MSPM33C321Aはシリーズ最大容量型番' },
          { k: 'セキュリティ', v: 'ROM内蔵Root of Trust；Global Security Controller；AES256(GCM)；SHA256(HMAC)；PKA；32-bit TRNG' },
          { k: 'ADC', v: '高速12-bit ADC 2組、9.4Msps、最大36の外部チャネル' },
          { k: 'コンパレータ/DAC', v: '高速/低消費電力COMP 2組；外部から利用可能な8-bit DAC 2組；設定可能な1.4V/2.5V内部共用VREF；温度と電源の監視を統合' },
          { k: '低消費電力', v: 'RUN 207uA/MHz(CoreMark)；STANDBY 16uA(CPU実行復帰+64KB SRAM保持)；SHUTDOWN <100nA(IOウェイク対応)' },
          { k: '通信インターフェース', v: 'QSPI最大20MB/s；2×CAN(CAN2.0A/B+CAN-FD)；3組UART(LIN)/I2C；4組UART/I2C/SPI；2×専用I2C(FM+ 1Mbit/s)；1×専用SPI；1×専用UART(LIN/IrDA/DALI/SmartCard/Manchester)；2×デジタルオーディオ(I2S全二重/TDM 16スロット)' },
          { k: 'VBAT island', v: '独立電源、RTC、3組のtamper検出IO(タイムスタンプ)、独立ウォッチドッグIWDT、32Bバックアップメモリを含む' },
          { k: 'I/O', v: '最大93個のGPIO（シリーズ最大パッケージ）；48-VQFN(RGZ)パッケージ上に38個のGPIO' },
          { k: 'パッケージオプション', v: '100-pin LQFP(0.4mm/0.5mm、PFA/PZ)、80-pin LQFP(PN)、64-pin LQFP(PM)、48-pin VQFN(RGZ)、100-pin nFBGA(ZAW)' },
          { k: 'デバッグ', v: '2-pin SWD' }
        ]
      },
      ko: {
        subcategory: 'Arm Cortex-M33 TrustZone 혼합신호 MCU (최대 1MB flash / 256KB RAM, 듀얼 CAN-FD, ADVANCE INFORMATION 선행 제품)',
        whatIs: '[주의: 본 부품의 datasheet(SLASFB6)는 ADVANCE INFORMATION으로 표시된 선행 제품(preproduction) 사양으로 예고 없이 변경될 수 있으며, 양산 전에 값이 바뀔 수 있으므로 반드시 TI 최신 datasheet를 참조] 혼합신호 MCU: 160MHz Arm 32-bit Cortex-M33 CPU, TrustZone, FPU, DSP 확장 내장, 4kB 명령 캐시로 0 wait-state 실행 지원; 동작 온도 -40C~125C, 전원 범위 1.71V~3.6V; 최대 1MB flash(ECC, 듀얼 뱅크 주소 교환) + 256KB SRAM(ECC) + 32KB 고내구 data flash에 의한 EEPROM 에뮬레이션; 보안: ROM 내장 불변 Root of Trust(보안 펌웨어 설치/부팅/키 프로비저닝), Global Security Controller(flash/SRAM/주변 동적 접근 제어), AES256 하드웨어 가속기(GCM), SHA256 하드웨어 가속기(HMAC), Public Key Accelerator(PKA), 32-bit 진성 난수 생성기(TRNG); 아날로그: 고속 9.4Msps 12-bit ADC 2조(최대 36개 외부 채널), 고속/저전력 비교기(COMP) 2조, 외부에서 사용 가능한 8-bit DAC 2조, 설정 가능한 1.4V 또는 2.5V 내부 공용 VREF, 온도와 전원 감시를 통합; VBAT island 독립 백업 전원(RTC, 타임스탬프 포함 3조 tamper 감지 IO, 독립 워치도그 IWDT, 32B 백업 메모리 포함); 최대 93개 GPIO(시리즈 최대 패키지). MSPM33C321A는 시리즈 최대 용량 모델(1MB flash/256KB SRAM), 동일 시리즈 MSPM33C3219는 512KB flash/256KB SRAM. 패키지 옵션: 100-pin LQFP(0.4mm & 0.5mm 피치, PFA/PZ), 80-pin LQFP(0.5mm, PN), 64-pin LQFP(0.5mm, PM), 48-pin VQFN(0.5mm, RGZ), 100-pin nFBGA(0.8mm, ZAW).',
        func: '저전력 모드: RUN 207uA/MHz(CoreMark), STANDBY 16uA(CPU 실행 복귀 + 64KB SRAM 유지), SHUTDOWN <100nA(IO 웨이크 지원); 디지털 주변 기능: 총 16채널 DMA 컨트롤러 2조, 9개 타이머로 최대 30계통 PWM 출력(deadband/폴트 처리/상보 출력 쌍을 갖춘 16-bit 고급 타이머 2개; 16-bit 범용 타이머 4개; 32-bit 범용 타이머 1개; 직교 인코더 인터페이스 지원 16-bit 범용 타이머 2개), 윈도우 워치도그 1조, CRC16/32 모듈; 통신 인터페이스: QSPI(외부 메모리용, 최대 20MB/s), 2조 CAN 인터페이스(CAN2.0A/B와 CAN-FD 지원), UART(LIN) 또는 I2C(SMBus/PMBus) 지원 설정 가능 시리얼 인터페이스 3조, UART/I2C/SPI 지원 설정 가능 시리얼 인터페이스 4조, 전용 I2C 2조(최대 FM+ 1Mbit/s, SMBus/PMBus), 전용 SPI 1조, 전용 UART 1조(LIN, IrDA, DALI, Smart Card, Manchester 지원), 디지털 오디오 인터페이스 2조(전이중 I2S와 TDM 16슬롯); 클록 시스템: 내장 32MHz SYSOSC, PLL, 내장 32kHz LFOSC, 외부 4~48MHz HFXT, 외부 32kHz LFXT, 외부 클록 입력; 개발 지원: 2-pin SWD; 개발 키트: LaunchPad EVM LP-MSPM33C321A, MSP SDK; 48-VQFN(RGZ) 패키지에 38개 GPIO 핀(PAx/PBx/PCx, TDI/TDO JTAG 겸 GPIO 핀 포함), 그 외 NRST, VBAT, VDD(2개), VCORE.',
        usedIn: '높은 보안(TrustZone/RoT/AES256/SHA256/PKA/TRNG)과 듀얼 CAN-FD 통신이 필요한 산업 자동화, 모터 제어, 배터리 관리, 보안 게이트웨이 등 응용에 적합(본 발췌 페이지에 명확한 Applications 목록 없음, datasheet 참조).',
        desc: 'Arm Cortex-M33 MCU(160MHz, TrustZone/FPU/DSP 내장), 최대 1MB flash / 256KB SRAM, 듀얼 9.4Msps 12-bit ADC, 듀얼 CAN-FD, 48-VQFN (RGZ) 등 다양한 패키지 선택 가능(ADVANCE INFORMATION, 선행 제품 사양, datasheet SLASFB6 참조).',
        thermalPad: '노출 패드 = VSS(datasheet 그림 6-5의 48-pin RGZ 중앙에 VSS 표시); 본 패키지의 접지 연결은 이 패드를 통하며, 기판 접지 평면에 연결해야 한다.',
        specs: [
          { k: '상태', v: 'ADVANCE INFORMATION(선행 제품 사양, SLASFB6, 2025년 12월), 값이 변경될 수 있음, 양산 전 TI 최신 datasheet를 기준으로 함' },
          { k: '코어', v: '160MHz Arm 32-bit Cortex-M33, TrustZone, FPU, DSP 확장 내장; 4kB 명령 캐시(0 wait-state)' },
          { k: '전원 범위', v: '1.71V ~ 3.6V' },
          { k: '메모리', v: '최대 1MB flash(ECC, 듀얼 뱅크 주소 교환) + 256KB SRAM(ECC) + 32KB 고내구 data flash(EEPROM 에뮬레이션); MSPM33C321A는 시리즈 최대 용량 모델' },
          { k: '보안', v: 'ROM 내장 Root of Trust; Global Security Controller; AES256(GCM); SHA256(HMAC); PKA; 32-bit TRNG' },
          { k: 'ADC', v: '고속 12-bit ADC 2조, 9.4Msps, 최대 36개 외부 채널' },
          { k: '비교기/DAC', v: '고속/저전력 COMP 2조; 외부에서 사용 가능한 8-bit DAC 2조; 설정 가능한 1.4V/2.5V 내부 공용 VREF; 온도와 전원 감시 통합' },
          { k: '저전력', v: 'RUN 207uA/MHz(CoreMark); STANDBY 16uA(CPU 실행 복귀+64KB SRAM 유지); SHUTDOWN <100nA(IO 웨이크 지원)' },
          { k: '통신 인터페이스', v: 'QSPI 최대 20MB/s; 2×CAN(CAN2.0A/B+CAN-FD); 3조 UART(LIN)/I2C; 4조 UART/I2C/SPI; 2×전용 I2C(FM+ 1Mbit/s); 1×전용 SPI; 1×전용 UART(LIN/IrDA/DALI/SmartCard/Manchester); 2×디지털 오디오(I2S 전이중/TDM 16슬롯)' },
          { k: 'VBAT island', v: '독립 전원, RTC, 3조 tamper 감지 IO(타임스탬프), 독립 워치도그 IWDT, 32B 백업 메모리 포함' },
          { k: 'I/O', v: '최대 93개 GPIO(시리즈 최대 패키지); 48-VQFN(RGZ) 패키지에 38개 GPIO' },
          { k: '패키지 옵션', v: '100-pin LQFP(0.4mm/0.5mm, PFA/PZ), 80-pin LQFP(PN), 64-pin LQFP(PM), 48-pin VQFN(RGZ), 100-pin nFBGA(ZAW)' },
          { k: '디버그', v: '2-pin SWD' }
        ]
      }
    }
  };
  Object.assign(window.IC_I18N, T);
})();
