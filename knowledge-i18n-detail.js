/**
 * knowledge-i18n-detail.js — 知識卡詳情欄位 i18n（principles/keyFormulas/designNotes/commonMistakes）
 * 深合併進 window.KNOWLEDGE_I18N[id][lang]（title/description 在 knowledge-i18n.js，本檔只補詳情欄位）。
 * 載入序：knowledge-i18n.js → 本檔。批次填充，缺欄位者 showDetail 自動 fallback 中文。
 * 批1（2026-07-04）：電子紙5 + 智慧手錶5。
 */
(function () {
  var DETAIL = {
    // ===== 電子紙 =====
    'epd-driver-waveform': {
      en: {
        principles: 'Each microcapsule holds black (negatively charged) and white (positively charged) pigment suspended in clear fluid. A positive pixel voltage floats white up (shows white); negative shows black. Grayscale comes from pulse duration/count setting the intermediate position. A waveform is a lookup table (LUT) mapping (start gray, target gray, temperature) to a voltage sequence, stored in the driver IC or host. On update the TCON sends 2-bit commands (drive positive/negative/hold/ground) per frame to the source driver; the particles settle only after the whole waveform (hundreds of ms) runs.',
        keyFormulas: ['Update time proportional to waveform frame count x frame period (~50Hz typical)', 'Gray levels = LUT levels supported (2-level B/W / 16-gray / more for color)', 'Particle migration proportional to field x time (so grayscale uses pulse width)', 'Ghosting = particles from the previous image not fully reset'],
        designNotes: ['The waveform LUT must match the panel model and lot; wrong LUT causes ghosting or off colors', 'DC balance: the positive/negative voltage integral over one update must be ~0, else long-term image sticking', 'Temperature directly affects fluid viscosity, so switch waveform by temperature (see epd-temp-comp)', 'Never cut power mid-update; particles freeze halfway', 'Partial updates save time but accumulate ghosting; insert a full refresh periodically to clear it'],
        commonMistakes: ['Wrong temperature-zone waveform causes faded color or ghosting', 'No DC balance causes long-term image sticking and shortened panel life', 'Losing a power rail mid-update garbles the image', 'Only partial-refreshing without full refresh piles up ghosting']
      },
      ja: {
        principles: '各マイクロカプセルは黒（負帯電）と白（正帯電）の粒子を透明液中に含む。画素電極が正電圧→白粒子が浮き白表示、負電圧→黒表示。中間階調はパルス時間/回数で位置を調整。Waveform＝(開始階調, 目標階調, 温度)→電圧列の LUT で、駆動 IC かホストに格納。更新時 TCON が各フレーム 2-bit（正/負/保持/接地）をソース駆動へ送り、waveform 全体（数百 ms）走って初めて粒子が安定。',
        keyFormulas: ['更新時間 ∝ waveform フレーム数 × フレーム周期（~50Hz 典型）', '階調数 = LUT 対応段数（白黒2階調/16階調/カラーは更に多い）', '粒子移動 ∝ 電界 × 時間（ゆえに階調はパルス幅）', 'ゴースト = 前画面の粒子が未復帰'],
        designNotes: ['Waveform LUT はパネル型番とロットに一致必須、誤ると残像や色ずれ', 'DC バランス：1 更新周期の正負電圧積分を ≈0 に、さもないと長期残留（image sticking）', '温度が液粘度に直接影響→ waveform を温度で切替（epd-temp-comp 参照）', '更新中は電源を切らない、粒子が途中で止まる', '部分更新は速いが残像蓄積、定期的に全更新でクリア'],
        commonMistakes: ['温度域違いの waveform → 色が薄い/ゴースト', 'DC バランス無し → 長期残留、寿命低下', '更新中に電源レール喪失 → 画像が乱れる', '部分更新のみで全更新しない → 残像が蓄積']
      },
      ko: {
        principles: '각 마이크로캡슐은 검정(음전하)과 흰색(양전하) 입자를 투명 액 중에 담음. 화소 전극이 양전압→흰 입자가 떠올라 흰색 표시, 음전압→검정. 중간 계조는 펄스 시간/횟수로 위치 조정. 파형=(시작 계조, 목표 계조, 온도)→전압 시퀀스의 LUT로 구동 IC나 호스트에 저장. 갱신 시 TCON이 프레임마다 2-bit(양/음/유지/접지)를 소스 구동에 보내고, 파형 전체(수백 ms)가 돌아야 입자가 안정.',
        keyFormulas: ['갱신 시간 ∝ 파형 프레임 수 × 프레임 주기(~50Hz 전형)', '계조 수 = LUT 지원 단계(흑백 2계조/16계조/컬러는 더 많음)', '입자 이동 ∝ 전기장 × 시간(따라서 계조는 펄스 폭)', '잔상 = 이전 화면 입자가 완전히 복귀 안 됨'],
        designNotes: ['파형 LUT는 패널 모델과 로트에 일치 필수, 틀리면 잔상/색 오차', 'DC 밸런스: 1 갱신 주기의 정/부 전압 적분을 ≈0으로, 아니면 장기 잔류(image sticking)', '온도가 액 점도에 직접 영향→파형을 온도로 전환(epd-temp-comp 참조)', '갱신 중 전원 차단 금지, 입자가 중간에 멈춤', '부분 갱신은 빠르나 잔상 누적, 주기적 전체 갱신으로 제거'],
        commonMistakes: ['온도 구역이 다른 파형 → 색 흐림/고스트', 'DC 밸런스 없음 → 장기 잔류, 수명 저하', '갱신 중 전원 레일 상실 → 이미지 깨짐', '부분 갱신만 하고 전체 갱신 안 함 → 잔상 누적']
      }
    },
    'epd-power-rails': {
      en: {
        principles: 'An EPD panel needs a symmetric set of positive/negative high voltages: VPOS/VNEG (source drive, typically +/-15V), VGH/VGL (TFT gate switching, e.g. +22V/-20V) and VCOM (common electrode bias, usually a small adjustable negative -1 to -3V). Mainstream designs use an integrated PMIC (e.g. TPS65185/SY7636) that generates all rails from one boost + charge pumps and provides power-up/down sequencing (powergood/pwrup pins). VCOM sets contrast and is usually factory-calibrated, stored in panel or PMIC EEPROM.',
        keyFormulas: ['VPOS/VNEG symmetric +/-15V class (panel spec dependent)', 'VGH - VGL ~40V class (TFT switching swing)', 'VCOM must be adjustable and stable (drift changes contrast)', 'Power-up order: VN before VP, VGL before VGH (built into PMIC)'],
        designNotes: ['Use a dedicated EPD PMIC; do not build a discrete boost yourself (sequencing is tricky)', 'Route VCOM away from high-speed digital; noise becomes visible display speckle', 'Choose each rail decoupling per PMIC datasheet (charge-pump flying-cap value/rating must match)', 'Connect PMIC powergood to the MCU; confirm rails are ready before updating', 'Turn off high-voltage rails when idle to save power (EPD holds the image with no power)'],
        commonMistakes: ['Wrong sequencing on a discrete boost latches up the TFT or damages the panel', 'Fixed VCOM without calibration gives poor contrast and grayscale offset', 'Under-rated flying capacitor collapses the charge-pump output', 'Not turning off HV rails in standby wastes power, losing the EPD low-power advantage']
      },
      ja: {
        principles: 'EPD パネルは対称な正負高電圧が必要：VPOS/VNEG（ソース駆動、±15V 級）、VGH/VGL（TFT ゲートスイッチ、+22V/-20V 等）、VCOM（共通電極バイアス、小さな可変負値 -1~-3V）。主流は統合 PMIC（TPS65185/SY7636 等）で 1 つの昇圧＋チャージポンプから全レール生成し、電源投入/遮断シーケンス（powergood/pwrup ピン）も提供。VCOM は表示コントラストを左右し、通常出荷校正でパネルや PMIC EEPROM に格納。',
        keyFormulas: ['VPOS/VNEG 対称 ±15V 級（パネル仕様依存）', 'VGH-VGL ≈40V 級（TFT スイッチ振幅）', 'VCOM は可変かつ安定（ドリフト→コントラスト変化）', '投入順：VN が VP より先、VGL が VGH より先（PMIC 内蔵）'],
        designNotes: ['専用 EPD PMIC を使う、分立昇圧を自作しない（シーケンスが難しい）', 'VCOM は高速デジタルから離す、ノイズが表示スペックルに', '各レールのデカップリングは PMIC データシート通り（チャージポンプ飛渡容量/耐圧を合わせる）', 'PMIC の powergood を MCU に接続、更新前にレール準備確認', '待機時は高圧レールを切って省電（EPD は無電力で画像保持）'],
        commonMistakes: ['分立昇圧のシーケンス誤り → TFT ラッチアップやパネル損傷', 'VCOM 固定・無校正 → コントラスト不良・階調ずれ', '飛渡コンデンサ耐圧不足 → チャージポンプ出力崩壊', '待機で高圧レールを切らない → 無駄な消費、EPD 省電優位を失う']
      },
      ko: {
        principles: 'EPD 패널은 대칭 정/부 고전압이 필요: VPOS/VNEG(소스 구동, ±15V급), VGH/VGL(TFT 게이트 스위칭, +22V/-20V 등), VCOM(공통 전극 바이어스, 작은 가변 음값 -1~-3V). 주류는 통합 PMIC(TPS65185/SY7636 등)로 하나의 부스트+차지 펌프에서 전 레일 생성하고 전원 인가/차단 시퀀스(powergood/pwrup 핀)도 제공. VCOM은 표시 대비를 좌우하며 보통 출하 교정되어 패널이나 PMIC EEPROM에 저장.',
        keyFormulas: ['VPOS/VNEG 대칭 ±15V급(패널 사양 의존)', 'VGH-VGL ≈40V급(TFT 스위칭 진폭)', 'VCOM은 가변이고 안정해야(드리프트→대비 변화)', '인가 순서: VN이 VP보다 먼저, VGL이 VGH보다 먼저(PMIC 내장)'],
        designNotes: ['전용 EPD PMIC 사용, 분리형 부스트 자작 금지(시퀀스가 까다로움)', 'VCOM은 고속 디지털에서 멀리, 노이즈가 표시 스페클로', '각 레일 디커플링은 PMIC 데이터시트대로(차지 펌프 플라잉 커패시터 용량/내압 일치)', 'PMIC powergood을 MCU에 연결, 갱신 전 레일 준비 확인', '대기 시 고전압 레일 차단으로 절전(EPD는 무전력으로 이미지 유지)'],
        commonMistakes: ['분리형 부스트 시퀀스 오류 → TFT 래치업이나 패널 손상', 'VCOM 고정·무교정 → 대비 불량·계조 오프셋', '플라잉 커패시터 내압 부족 → 차지 펌프 출력 붕괴', '대기 시 HV 레일 미차단 → 전력 낭비, EPD 저전력 이점 상실']
      }
    },
    'epd-tcon': {
      en: {
        principles: 'The TCON receives the host image (SPI/parallel, or integrated in the driver IC), scans line by line, sends each pixel the waveform-mapped voltage command to the source driver, and the gate driver turns on TFTs row by row. In small EPDs (ESL/wearable) the driver+TCON are one chip; the MCU sends commands over SPI (init, load image RAM, trigger update). Large EPDs (signage) use a standalone TCON plus cascaded source drivers; the higher data rate moves to parallel or LVDS-class interfaces.',
        keyFormulas: ['Update frame rate ~50Hz typical (EPD is slow, not video)', 'SPI clock per driver limit (commonly <=20MHz)', 'Image RAM size = resolution x bits/pixel (1bpp B/W / 2bpp 4-gray)', 'Cascaded source drivers: data shifts through the whole chain'],
        designNotes: ['Keep SPI traces short; wire CS/DC/BUSY fully (BUSY means updating, MCU must wait)', 'Dual RAM (old/new image) lets the driver compute the diff for partial update', 'Follow the reset pin timing per datasheet; power up, reset, then init', 'For large cascaded panels watch driver timing skew and power distribution', 'Match interface voltage domains (1.8V/3.3V); level-shift across domains'],
        commonMistakes: ['Sending the next command before BUSY clears interrupts the update and garbles the screen', 'Missing a step in the init sequence leaves the panel unresponsive or garbled', 'Over-clocking SPI causes intermittent comms failure', 'Not maintaining the old RAM for partial updates miscomputes the diff and ghosts']
      },
      ja: {
        principles: 'TCON はホスト画像を受信（SPI/並列、または駆動 IC 統合）、逐行走査し、各画素に waveform 対応電圧命令をソース駆動へ送り、ゲート駆動が逐行 TFT を開通。小型 EPD（ESL/ウェアラブル）は駆動＋TCON 単一チップ、MCU が SPI で命令送信（初期化、画像 RAM 読込、更新トリガ）。大型 EPD（看板）は独立 TCON＋ソース駆動級縦続、高データレートは並列/LVDS 級へ。',
        keyFormulas: ['更新フレームレート ~50Hz 典型（EPD は遅い、非動画）', 'SPI クロックは駆動上限依存（≤20MHz 一般）', '画像 RAM = 解像度 × ビット/画素（1bpp 白黒/2bpp 4階調）', '縦続ソース駆動：データがチェーン全体をシフト'],
        designNotes: ['SPI 配線は短く、CS/DC/BUSY を完備（BUSY は更新中、MCU は待つ）', 'デュアル RAM（旧/新画像）で駆動が差分計算し部分更新', 'リセットピンのタイミングはデータシート通り、投入→リセット→初期化', '大型縦続はタイミングスキューと電源分配に注意', 'インターフェース電圧域を揃える（1.8V/3.3V）、跨ぐ場合レベルシフト'],
        commonMistakes: ['BUSY 解除前に次命令 → 更新中断、画面エラー', '初期化手順の抜け → 無反応や乱表示', 'SPI 過速 → 間欠通信失敗', '部分更新で旧 RAM を保持しない → 差分誤算、ゴースト']
      },
      ko: {
        principles: 'TCON은 호스트 이미지를 수신(SPI/병렬 또는 구동 IC 통합), 라인별 스캔하고 각 화소에 파형 매핑 전압 명령을 소스 구동에 보내며, 게이트 구동이 행별로 TFT를 켬. 소형 EPD(ESL/웨어러블)는 구동+TCON 단일 칩, MCU가 SPI로 명령 전송(초기화, 이미지 RAM 로드, 갱신 트리거). 대형 EPD(사이니지)는 독립 TCON+소스 구동 캐스케이드, 높은 데이터율은 병렬/LVDS급으로.',
        keyFormulas: ['갱신 프레임률 ~50Hz 전형(EPD는 느림, 비디오 아님)', 'SPI 클럭은 구동 상한 의존(≤20MHz 일반)', '이미지 RAM = 해상도 × 비트/화소(1bpp 흑백/2bpp 4계조)', '캐스케이드 소스 구동: 데이터가 체인 전체를 시프트'],
        designNotes: ['SPI 배선 짧게, CS/DC/BUSY 완비(BUSY는 갱신 중, MCU는 대기)', '듀얼 RAM(구/신 이미지)로 구동이 차분 계산해 부분 갱신', '리셋 핀 타이밍은 데이터시트대로, 인가→리셋→초기화', '대형 캐스케이드는 타이밍 스큐와 전원 분배 주의', '인터페이스 전압 도메인 일치(1.8V/3.3V), 넘을 때 레벨 시프트'],
        commonMistakes: ['BUSY 해제 전 다음 명령 → 갱신 중단, 화면 오류', '초기화 시퀀스 단계 누락 → 무반응이나 깨진 표시', 'SPI 과속 → 간헐 통신 실패', '부분 갱신에서 구 RAM 미유지 → 차분 오산, 고스트']
      }
    },
    'epd-partial-refresh': {
      en: {
        principles: 'Full update: the whole screen runs the complete waveform, including repeated black/white flips to drive all particles to extremes then settle - clean but flashes and slow (hundreds of ms to 1s). Partial update: short waveforms on changed pixels only, no full-screen flash, good for clocks/paging, but each leaves a little un-reset particle residue (ghosting), visible after tens of updates. Strategy: partial-update normally for speed and no flash, then insert a full refresh every N updates or on big changes. DC balance is harder under partial update and needs driver support.',
        keyFormulas: ['Full-refresh time > partial-refresh time (full includes clearing flips)', 'Ghosting accumulation proportional to consecutive partial updates', 'Insert 1 full refresh per ~5-20 partial updates (panel dependent)', 'Partial-update power < full refresh (fewer pulses)'],
        designNotes: ['Design UI to avoid frequent whole-screen changes; use partial regions', 'Keep a partial-count counter; auto full-refresh at threshold', 'Fast partial modes (e.g. A2) have poor quality but are fastest, B/W only', 'Ghosting is worse at low temperature; force full refresh when cold', 'Full-refresh before holding one image long-term to avoid burn-in'],
        commonMistakes: ['Only partial updates without full refresh piles ghosting until unreadable', 'Fast mode used for grayscale distorts the gray levels', 'Forcing partial when cold makes ghosting severe', 'Whole-screen UI jitter makes each update near-full, losing the partial advantage']
      },
      ja: {
        principles: '全更新：全画面が完全な waveform を走り、黒白反転を繰返して全粒子を極端へ押し定位、綺麗だが点滅・低速（数百 ms~1s）。部分更新：変化画素のみ短い waveform、全画面点滅なし、時計/ページ送りに好適だが毎回粒子未復帰の残像（ゴースト）を残し、数十回で可視。戦略：通常は部分更新で速度と無点滅、N 回毎か大変更時に全更新を挿入。DC バランスは部分更新でより難しく駆動対応が必要。',
        keyFormulas: ['全更新時間 > 部分更新時間（全更新はクリア反転含む）', 'ゴースト蓄積 ∝ 連続部分更新回数', '部分更新 ~5~20 回毎に全更新 1 回（パネル次第）', '部分更新の消費 < 全更新（パルス少）'],
        designNotes: ['UI は全画面頻繁変更を避け部分領域を活用', '部分回数カウンタを設け閾値で自動全更新', '高速部分モード（A2 等）は画質悪いが最速、白黒のみ', '低温はゴースト悪化、低温時は全更新強制', '同一画像長期表示前に全更新で焼付き回避'],
        commonMistakes: ['部分更新のみで全更新せず → ゴースト堆積で判読不能', '高速モードで階調表示 → 階調歪み', '低温で部分更新強行 → 残像深刻', '全画面 UI ちらつき → 毎回ほぼ全更新、部分優位喪失']
      },
      ko: {
        principles: '전체 갱신: 화면 전체가 완전한 파형을 돌며 흑백 반전을 반복해 모든 입자를 극단으로 밀어 정착, 깨끗하나 깜빡이고 느림(수백 ms~1s). 부분 갱신: 변화 화소만 짧은 파형, 전체 화면 깜빡임 없음, 시계/페이지 넘김에 적합하나 매번 입자 미복귀 잔상(고스트)을 남겨 수십 회 후 가시. 전략: 평소 부분 갱신으로 속도와 무깜빡임, N회마다 또는 큰 변경 시 전체 갱신 삽입. DC 밸런스는 부분 갱신에서 더 어렵고 구동 지원 필요.',
        keyFormulas: ['전체 갱신 시간 > 부분 갱신 시간(전체는 클리어 반전 포함)', '고스트 누적 ∝ 연속 부분 갱신 횟수', '부분 갱신 ~5~20회마다 전체 갱신 1회(패널에 따라)', '부분 갱신 전력 < 전체 갱신(펄스 적음)'],
        designNotes: ['UI는 전체 화면 빈번 변경 피하고 부분 영역 활용', '부분 횟수 카운터 두고 임계값에서 자동 전체 갱신', '고속 부분 모드(A2 등)는 화질 낮지만 최고속, 흑백만', '저온은 고스트 악화, 저온 시 전체 갱신 강제', '동일 이미지 장기 표시 전 전체 갱신으로 번인 회피'],
        commonMistakes: ['부분 갱신만 하고 전체 갱신 안 함 → 고스트 누적으로 판독 불가', '고속 모드로 계조 표시 → 계조 왜곡', '저온에서 부분 갱신 강행 → 잔상 심각', '전체 화면 UI 흔들림 → 매번 거의 전체 갱신, 부분 이점 상실']
      }
    },
    'epd-temp-comp': {
      en: {
        principles: 'Electrophoretic fluid viscosity changes exponentially with temperature: cold is viscous, particles migrate slowly and need longer/stronger waveforms; hot is thin, particles move fast and overdrive overshoots. So the driver/host stores a waveform LUT per temperature zone (e.g. <5C, 5-15C, 15-25C...). The system reads temperature from a panel-embedded sensor or an external NTC/digital temp IC and picks the matching LUT. Integrated EPD PMICs (e.g. TPS65185) embed temperature sensing and report it directly. Update quality jumps at zone boundaries; the design must cover the working temperature range.',
        keyFormulas: ['Cold -> longer update time (more waveform frames)', 'Fluid viscosity proportional to exp(1/T) (approx. Arrhenius)', 'Number of zones = LUT segments provided', 'Beyond working range -> color not guaranteed (refuse update or warn)'],
        designNotes: ['Place the temp sensor near the panel; that is the temperature that matters', 'Use the integrated PMIC sensor if present, one less part', 'Very low temperature (<0C) may need heating or an update ban (per panel spec)', 'The waveform LUT travels with the panel; changing supplier means changing LUT', 'Have a fallback for temp-read failure (room-temp LUT plus a warning)'],
        commonMistakes: ['Fixed room-temperature waveform gives faded color and ghosting in winter', 'Sensor placed far, reading board temp not panel temp, biases compensation', 'Forcing updates when very cold leaves particles stuck and the image incomplete', 'Not changing LUT for a new panel lot throws colors off']
      },
      ja: {
        principles: '電気泳動液の粘度は温度で指数的変化：低温は粘く粒子移動が遅く長い/強い waveform が必要、高温は薄く速くオーバードライブで過衝。ゆえに駆動/ホストは温度域毎（<5℃、5-15℃、15-25℃…）に waveform LUT を格納。システムはパネル内蔵温度センサや外付 NTC/デジタル温度 IC で温度を読み対応 LUT を選択。統合 EPD PMIC（TPS65185 等）は温度センサ内蔵で直接報告。温度域境界で更新画質が跳ぶ、設計は動作温域を網羅。',
        keyFormulas: ['低温 → 更新時間延長（waveform フレーム増）', '液粘度 ∝ exp(1/T)（近似 Arrhenius）', '温度域数 = LUT 提供分割数', '動作温域外 → 発色不保証（更新拒否や警告）'],
        designNotes: ['温度センサはパネル近くに、それが本当のパネル温度', '統合 PMIC のセンサがあれば使う、部品を減らせる', '極低温（<0℃）は加熱や更新禁止が必要（パネル仕様次第）', 'waveform LUT はパネルに付随、供給元変更で LUT 変更', '温度読取失敗のフォールバック（室温 LUT＋警告）'],
        commonMistakes: ['室温 waveform 固定 → 冬に発色薄・ゴースト', 'センサが遠く基板温度を測る → 補償ずれ', '極低温で更新強行 → 粒子動かず画像欠損', 'パネルロット変更で LUT 未変更 → 発色ずれ']
      },
      ko: {
        principles: '전기영동 액 점도는 온도에 지수적으로 변함: 저온은 점성이 높아 입자 이동이 느려 더 길고/강한 파형 필요, 고온은 묽어 빠르며 오버드라이브가 과충. 그래서 구동/호스트는 온도 구역별(<5℃, 5-15℃, 15-25℃…)로 파형 LUT를 저장. 시스템은 패널 내장 온도 센서나 외장 NTC/디지털 온도 IC로 온도를 읽고 대응 LUT 선택. 통합 EPD PMIC(TPS65185 등)는 온도 센서 내장으로 직접 보고. 온도 구역 경계에서 갱신 화질이 튐, 설계는 동작 온도역을 커버.',
        keyFormulas: ['저온 → 갱신 시간 연장(파형 프레임 증가)', '액 점도 ∝ exp(1/T)(근사 Arrhenius)', '온도 구역 수 = LUT 제공 분할 수', '동작 온도역 밖 → 발색 미보장(갱신 거부나 경고)'],
        designNotes: ['온도 센서는 패널 근처에, 그것이 진짜 패널 온도', '통합 PMIC 센서가 있으면 사용, 부품 하나 절감', '극저온(<0℃)은 가열이나 갱신 금지 필요(패널 사양에 따라)', '파형 LUT는 패널에 부속, 공급처 변경 시 LUT 변경', '온도 읽기 실패 폴백(실온 LUT+경고)'],
        commonMistakes: ['실온 파형 고정 → 겨울에 발색 흐림·고스트', '센서가 멀어 보드 온도 측정 → 보상 오차', '극저온에서 갱신 강행 → 입자 안 움직여 이미지 결손', '패널 로트 변경 시 LUT 미변경 → 발색 어긋남']
      }
    },
    // ===== 智慧手錶 =====
    'wearable-pmu': {
      en: {
        principles: 'A wearable PMU (e.g. nPM/MAX series) integrates: battery charging, multiple bucks (SoC core, memory), multiple LDOs (analog/sensor/RF), load switches (cut unused subsystems) and a fuel gauge. The key is light-load efficiency and standby current: the watch sleeps most of the time with the SoC drawing almost nothing, so bucks enter PFM/burst mode for high light-load efficiency and the PMU quiescent current (Iq) must be microamps. Load switches fully cut screen/GPS/sensor power (not standby but eliminated leakage).',
        keyFormulas: ['Battery life ~ battery capacity(mAh) / average current(mA)', 'Standby-current target microamps (PMU Iq + SoC sleep + leakage)', 'Light-load efficiency via PFM/burst mode', 'Load-switch cutoff = zero leakage (not standby)'],
        designNotes: ['Pick a low-Iq PMU; standby current sets battery life', 'Cut unused subsystems with a load switch, not standby', 'Bucks must support automatic PFM at light load', 'Power sensors/RF from an LDO (switching noise degrades PPG/BLE)', 'Always-on display and sensing are the big drains; optimize their duty cycle'],
        commonMistakes: ['A high-Iq general PMU drains the battery in standby', 'Subsystems in standby (not cut) accumulate leakage and hurt life', 'Fixed PWM without PFM collapses light-load efficiency', 'Feeding the sensor front-end from a buck injects switching noise into the signal']
      },
      ja: {
        principles: 'ウェアラブル PMU（nPM/MAX 系等）は統合：電池充電、複数 buck（SoC コア/メモリ）、複数 LDO（アナログ/センサ/RF）、ロードスイッチ（未使用系統を切断）、燃料計。要は軽負荷効率と待機電流：時計は大半スリープで SoC はほぼ無消費、ゆえに buck は PFM/バースト動作で軽負荷高効率、PMU 静止電流（Iq）は µA 級必須。ロードスイッチが画面/GPS/センサ電源を完全遮断（待機でなく漏れ排除）。',
        keyFormulas: ['電池寿命 ≈ 容量(mAh) / 平均電流(mA)', '待機電流目標 µA 級（PMU Iq＋SoC スリープ＋漏れ）', '軽負荷効率は PFM/バースト動作で', 'ロードスイッチ遮断 = 漏れゼロ（待機でない）'],
        designNotes: ['低 Iq の PMU を選ぶ、待機電流が寿命を決める', '未使用系統はロードスイッチで「切る」、待機でなく', 'buck は軽負荷で PFM 自動切替対応', 'センサ/RF は LDO で給電（スイッチ雑音が PPG/BLE を劣化）', '常時表示とセンシングが大消費、デューティ最適化'],
        commonMistakes: ['高 Iq 汎用 PMU → 待機で電池を消耗', '系統を待機のみ・遮断せず → 漏れ蓄積で寿命悪化', '固定 PWM で PFM なし → 軽負荷効率崩壊', 'センサ前段を buck 直結 → スイッチ雑音が信号に混入']
      },
      ko: {
        principles: '웨어러블 PMU(nPM/MAX 계열 등)는 통합: 배터리 충전, 다중 buck(SoC 코어/메모리), 다중 LDO(아날로그/센서/RF), 로드 스위치(미사용 서브시스템 차단), 연료 게이지. 핵심은 경부하 효율과 대기 전류: 시계는 대부분 슬립으로 SoC가 거의 무소비, 그래서 buck은 PFM/버스트 모드로 경부하 고효율, PMU 정지 전류(Iq)는 µA급 필수. 로드 스위치가 화면/GPS/센서 전원을 완전 차단(대기가 아닌 누설 제거).',
        keyFormulas: ['배터리 수명 ≈ 용량(mAh) / 평균 전류(mA)', '대기 전류 목표 µA급(PMU Iq+SoC 슬립+누설)', '경부하 효율은 PFM/버스트 모드로', '로드 스위치 차단 = 누설 0(대기 아님)'],
        designNotes: ['낮은 Iq PMU 선택, 대기 전류가 수명 결정', '미사용 서브시스템은 로드 스위치로 "차단", 대기 아님', 'buck은 경부하에서 PFM 자동 전환 지원', '센서/RF는 LDO로 급전(스위칭 노이즈가 PPG/BLE 저하)', '상시 표시와 센싱이 큰 소비, 듀티 최적화'],
        commonMistakes: ['높은 Iq 범용 PMU → 대기에서 배터리 소진', '서브시스템 대기만·미차단 → 누설 누적으로 수명 악화', '고정 PWM에 PFM 없음 → 경부하 효율 붕괴', '센서 프런트엔드를 buck 직결 → 스위칭 노이즈가 신호에 유입']
      }
    },
    'ppg-afe': {
      en: {
        principles: 'An LED driver pulses green/red/IR LEDs, light enters the skin and is absorbed by blood, and a photodiode reads the reflection. Heartbeats vary microvascular blood volume, weakly modulating reflected light (AC component << DC background). The AFE (e.g. MAX86/AFE44xx) does ambient cancellation (sample with LED off to subtract background), transimpedance amplification (TIA converts photocurrent to voltage), high gain, and ADC. The hard parts are motion artifacts (movement changes the light path) and ambient light - handled by synchronous sampling (measure only while the LED is on) plus accelerometer-based motion compensation. SpO2 uses the red/IR ratio.',
        keyFormulas: ['AC/DC ratio = pulsatile signal / background (small, needs high gain + high-res ADC)', 'SpO2 proportional to red/IR absorption ratio', 'Low LED pulse duty (saves power + synchronous sampling)', 'SNR via ambient cancellation + motion compensation'],
        designNotes: ['Add a light barrier between LED and photodiode to block direct leakage', 'Press the sensor to the skin; the housing must block ambient light', 'Synchronous sampling: sample LED on/off and subtract to remove background', 'Fuse with an accelerometer for motion-artifact removal', 'Power the AFE from a clean LDO; switching noise enters the signal', 'Keep LED current moderate (saves power, avoids heating the skin)'],
        commonMistakes: ['LED light leaking directly into the photodiode saturates the signal', 'No ambient cancellation means no reading in sunlight', 'Ignoring motion artifacts makes heart rate jump during exercise', 'A noisy AFE supply buries the pulsatile signal in baseline noise']
      },
      ja: {
        principles: 'LED ドライバが緑/赤/赤外 LED をパルス点灯、光が皮膚に入り血液に吸収され、フォトダイオードが反射を読む。心拍が微小血管の血量を変え反射光を微弱変調（AC 成分 << DC 背景）。AFE（MAX86/AFE44xx 等）は環境光相殺（LED 消灯時に取得し背景を減算）、トランスインピーダンス増幅（TIA が光電流を電圧へ）、高利得、ADC。難所は動き雑音（動き＝光路変化）と環境光——同期サンプリング（LED 点灯時のみ測定）＋加速度センサでの動き補償で対応。SpO2 は赤/赤外の比で算出。',
        keyFormulas: ['AC/DC 比 = 脈動信号 / 背景（微小、高利得＋高分解能 ADC 要）', 'SpO2 ∝ 赤/赤外 吸収比', 'LED パルスデューティ低（省電＋同期サンプリング）', 'SNR は環境光相殺＋動き補償で'],
        designNotes: ['LED とフォトダイオード間に遮光壁、直接漏光防止', 'センサを皮膚に密着、筐体で環境光遮断', '同期サンプリング：LED 点灯/消灯を取得し減算で背景除去', '加速度センサと融合し動き雑音除去', 'AFE は綺麗な LDO で給電、スイッチ雑音が信号に', 'LED 電流は控えめに（省電＋皮膚加熱防止）'],
        commonMistakes: ['LED 漏光が直接フォトダイオードへ → 信号飽和', '環境光相殺なし → 日光下で測定不能', '動き雑音無視 → 運動時に心拍が乱れる', 'AFE の汚い電源 → 基線雑音が脈動を覆う']
      },
      ko: {
        principles: 'LED 드라이버가 녹/적/적외 LED를 펄스 점등, 빛이 피부에 들어가 혈액에 흡수되고 포토다이오드가 반사를 읽음. 심박이 미세혈관 혈량을 바꿔 반사광을 미약 변조(AC 성분 << DC 배경). AFE(MAX86/AFE44xx 등)는 주변광 상쇄(LED 소등 시 취득해 배경 감산), 트랜스임피던스 증폭(TIA가 광전류를 전압으로), 고이득, ADC. 난제는 동작 잡음(움직임=광로 변화)과 주변광 - 동기 샘플링(LED 점등 시에만 측정)+가속도계 기반 동작 보상으로 대응. SpO2는 적/적외 비로 산출.',
        keyFormulas: ['AC/DC 비 = 맥동 신호 / 배경(미소, 고이득+고해상 ADC 필요)', 'SpO2 ∝ 적/적외 흡수 비', 'LED 펄스 듀티 낮음(절전+동기 샘플링)', 'SNR은 주변광 상쇄+동작 보상으로'],
        designNotes: ['LED와 포토다이오드 사이 차광벽, 직접 누광 방지', '센서를 피부에 밀착, 하우징으로 주변광 차단', '동기 샘플링: LED 점등/소등 취득해 감산으로 배경 제거', '가속도계와 융합해 동작 잡음 제거', 'AFE는 깨끗한 LDO로 급전, 스위칭 잡음이 신호에', 'LED 전류는 적당히(절전+피부 가열 방지)'],
        commonMistakes: ['LED 누광이 직접 포토다이오드로 → 신호 포화', '주변광 상쇄 없음 → 햇빛 아래 측정 불가', '동작 잡음 무시 → 운동 시 심박이 요동', 'AFE의 지저분한 전원 → 기저선 잡음이 맥동을 덮음']
      }
    },
    'wearable-amoled': {
      en: {
        principles: 'Each AMOLED pixel is a self-emitting diode driven by current: it needs a positive rail ELVDD (+4-5V) and a negative rail ELVSS (-1 to -5V), generated from the battery by a panel power IC (boost + charge pump). Power scales with brightness x lit-pixel count, so dark UI saves power and pure black costs nothing (pixels off). Always-on Display keeps a low refresh rate (1Hz), low brightness and few lit pixels (a clock outline). Pixels age (blue fastest), so AOD must rotate pixel positions to avoid burn-in. Touch and display are often integrated (TDDI).',
        keyFormulas: ['Power proportional to brightness x lit-pixel count (black ~0)', 'ELVDD/ELVSS positive/negative rails supply OLED current', 'AOD: low refresh (<=1Hz) + low brightness + few lit pixels', 'Pixel aging proportional to cumulative emission (blue fastest)'],
        designNotes: ['Use dark/pure-black UI backgrounds to save a lot of power (key to wearable life)', 'Rotate AOD content position to prevent burn-in', 'Decouple ELVDD/ELVSS well; dark-to-bright transient is large', 'Auto-brightness (ambient sensing) saves power and protects eyes', 'Lower the refresh rate or cut panel power when not updating'],
        commonMistakes: ['White-background UI blows up OLED power and hurts battery life', 'Fixed AOD image without rotation burns in blue pixels', 'Insufficient ELVDD/ELVSS decoupling flickers on brightness change', 'Fixed max brightness is harsh indoors and wastes power']
      },
      ja: {
        principles: 'AMOLED の各画素は電流駆動の自発光ダイオード：正レール ELVDD（+4-5V）と負レール ELVSS（-1~-5V）が必要、パネル電源 IC（昇圧＋チャージポンプ）で電池から生成。消費 ∝ 輝度 × 点灯画素数、ゆえに暗い UI は省電・純黒は無消費（画素オフ）。Always-on は低更新（1Hz）・低輝度・少点灯画素（時計の輪郭）。画素は劣化（青が最速）、AOD は画素位置を輪番し焼付き回避。タッチと表示はしばしば統合（TDDI）。',
        keyFormulas: ['消費 ∝ 輝度 × 点灯画素数（黒 ≈0）', 'ELVDD/ELVSS 正負レールが OLED 電流供給', 'AOD：低更新(≤1Hz)＋低輝度＋少点灯画素', '画素劣化 ∝ 累積発光量（青が最速）'],
        designNotes: ['暗い/純黒背景 UI で大幅省電（ウェアラブル寿命の鍵）', 'AOD 内容位置を輪番し焼付き防止', 'ELVDD/ELVSS を十分デカップリング、暗→明過渡が大', '自動輝度（環境光）で省電・目に優しい', '非更新時は更新率を下げるかパネル電源を切る'],
        commonMistakes: ['白背景 UI → OLED 消費爆発・寿命悪化', 'AOD 固定画像・輪番なし → 青画素焼付き', 'ELVDD/ELVSS デカップリング不足 → 輝度変化でちらつき', '固定最大輝度 → 室内で眩しく消費も無駄']
      },
      ko: {
        principles: 'AMOLED 각 화소는 전류 구동 자발광 다이오드: 정 레일 ELVDD(+4-5V)와 부 레일 ELVSS(-1~-5V) 필요, 패널 전원 IC(부스트+차지 펌프)로 배터리에서 생성. 소비 ∝ 휘도 × 점등 화소 수, 그래서 어두운 UI는 절전·순흑은 무소비(화소 오프). Always-on은 저갱신(1Hz)·저휘도·적은 점등 화소(시계 윤곽). 화소는 노화(파랑이 최속), AOD는 화소 위치를 순번해 번인 회피. 터치와 표시는 종종 통합(TDDI).',
        keyFormulas: ['소비 ∝ 휘도 × 점등 화소 수(검정 ≈0)', 'ELVDD/ELVSS 정/부 레일이 OLED 전류 공급', 'AOD: 저갱신(≤1Hz)+저휘도+적은 점등 화소', '화소 노화 ∝ 누적 발광량(파랑이 최속)'],
        designNotes: ['어두운/순흑 배경 UI로 대폭 절전(웨어러블 수명의 핵심)', 'AOD 내용 위치를 순번해 번인 방지', 'ELVDD/ELVSS 충분히 디커플링, 암→명 과도가 큼', '자동 휘도(주변광)로 절전·눈 보호', '미갱신 시 갱신율 낮추거나 패널 전원 차단'],
        commonMistakes: ['흰 배경 UI → OLED 소비 폭발·수명 악화', 'AOD 고정 이미지·순번 없음 → 파란 화소 번인', 'ELVDD/ELVSS 디커플링 부족 → 휘도 변화 시 깜빡임', '고정 최대 휘도 → 실내에서 눈부시고 소비도 낭비']
      }
    },
    'wearable-qi-rx': {
      en: {
        principles: 'Qi wireless charging: the transmit coil (charger base) drives a high-frequency AC field, the receive coil (watch) picks up AC, then rectifies (synchronous rectifier) plus regulates into the charger IC. Communication uses load modulation (RX changes load, TX detects it -> adjusts power) for handshake and power negotiation. Watch designs (often non-standard or proprietary) are common because of small size, low power (<5W) and the need for foreign-object safety. A ferrite shield between coil and battery/board blocks eddy-current heating and interference. Rectifier + charger are often one chip.',
        keyFormulas: ['Coupling coefficient k proportional to alignment and distance', 'Received power proportional to flux rate x turns', 'Efficiency depends on coil Q, alignment, shielding', 'FOD (foreign-object detection): excess power loss -> stop charging'],
        designNotes: ['Put a ferrite sheet between the receive coil and the board to shield eddy currents and guide flux', 'Use synchronous rectification to cut loss/heat (watch dissipation is poor)', 'Turn off panel/sensors while charging to reduce heat', 'Alignment (magnetic snap) ensures adequate k', 'FOD prevents metal objects from being heated (safety)', 'Waterproofing (no exposed contacts) is the main reason for wireless charging'],
        commonMistakes: ['No ferrite: eddy currents heat the board, poor efficiency, interference', 'Diode rectification: voltage drop and heat (hard to dissipate in small space)', 'Poor alignment, low k: fails to charge or very low efficiency', 'No FOD: foreign-object heating safety risk']
      },
      ja: {
        principles: 'Qi 無線充電：送電コイル（充電台）が高周波交流磁界を作り、受電コイル（時計）が交流を感応、整流（同期整流器）＋安定化して充電 IC へ。通信は負荷変調（RX が負荷を変え TX が検出→電力調整）で握手と電力交渉。時計向け（非標準/独自が多い）は小型・低電力（<5W）・異物加熱安全のため。コイルと電池/基板間にフェライト遮蔽で渦電流発熱と干渉を防止。整流＋充電はしばしば単一チップ。',
        keyFormulas: ['結合係数 k ∝ アライメントと距離', '受電電力 ∝ 磁束変化率 × 巻数', '効率はコイル Q・アライメント・遮蔽に依存', 'FOD（異物検出）：損失超過→充電停止'],
        designNotes: ['受電コイルと基板間にフェライト、渦電流遮蔽＋磁束誘導', '同期整流で損失/発熱低減（時計は放熱が悪い）', '充電中はパネル/センサを切り発熱低減', 'アライメント（磁気吸着）で十分な k 確保', 'FOD で金属異物加熱を防止（安全）', '防水（無接点）が無線充電の主目的'],
        commonMistakes: ['フェライトなし → 渦電流が基板を発熱、効率悪・干渉', 'ダイオード整流 → 電圧降下と発熱（狭空間で放熱困難）', 'アライメント悪く k 低 → 充電不可か極低効率', 'FOD なし → 異物加熱の安全リスク']
      },
      ko: {
        principles: 'Qi 무선 충전: 송전 코일(충전대)이 고주파 교류 자기장을 만들고, 수신 코일(시계)이 교류를 감응, 정류(동기 정류기)+안정화해 충전 IC로. 통신은 부하 변조(RX가 부하를 바꾸고 TX가 감지→전력 조정)로 핸드셰이크와 전력 협상. 시계용(비표준/독자 많음)은 소형·저전력(<5W)·이물 가열 안전 때문. 코일과 배터리/보드 사이 페라이트 차폐로 와전류 발열과 간섭 방지. 정류+충전은 종종 단일 칩.',
        keyFormulas: ['결합 계수 k ∝ 정렬과 거리', '수신 전력 ∝ 자속 변화율 × 권수', '효율은 코일 Q·정렬·차폐에 의존', 'FOD(이물 감지): 손실 초과→충전 중지'],
        designNotes: ['수신 코일과 보드 사이 페라이트, 와전류 차폐+자속 유도', '동기 정류로 손실/발열 감소(시계는 방열 나쁨)', '충전 중 패널/센서 차단해 발열 감소', '정렬(자기 흡착)로 충분한 k 확보', 'FOD로 금속 이물 가열 방지(안전)', '방수(무접점)가 무선 충전의 주 목적'],
        commonMistakes: ['페라이트 없음 → 와전류가 보드 발열, 효율 나쁨·간섭', '다이오드 정류 → 전압 강하와 발열(좁은 공간서 방열 곤란)', '정렬 나쁘고 k 낮음 → 충전 불가나 극저 효율', 'FOD 없음 → 이물 가열 안전 위험']
      }
    },
    'wearable-lowpower': {
      en: {
        principles: 'Wearable power budgets are computed on average current: life = battery mAh / average mA. The system is in deep sleep the vast majority of the time (SoC sleep + RTC wake), going full-speed only briefly on events (touch, wrist-raise, BLE connection window). Techniques: sensors use an on-chip FIFO to batch data and wake the SoC in bursts (not every sample); BLE uses long connection intervals and sparse advertising; big drains like screen/GPS are strictly duty-cycled or on-demand; a sensor hub / low-power co-processor handles routine work while the main SoC sleeps. Profile each state current with a current meter to find leaks.',
        keyFormulas: ['Life = battery capacity(mAh) / average current(mA)', 'Average current = sum(state current x time fraction)', 'Higher deep-sleep fraction saves more (sleep current microamps)', 'BLE average power proportional to 1/connection interval'],
        designNotes: ['Use sensor FIFO to batch-wake, reducing SoC wake count', 'Lengthen BLE connection/advertising interval (trade off latency)', 'Use a sensor-hub co-processor for routine work; main SoC deep-sleeps', 'Event-driven (interrupt) instead of polling', 'Profile each state with a current probe before production; hunt leaks', 'Clock/power-gate unused peripherals'],
        commonMistakes: ['Polling sensors without interrupt/FIFO keeps the SoC awake and drains power', 'Too-short BLE interval means high standby current and poor life', 'Subsystems only in standby (not cut) accumulate leakage', 'No current profiling means you optimize blind, not knowing where power goes']
      },
      ja: {
        principles: 'ウェアラブルの電力予算は平均電流で計算：寿命 = 電池 mAh / 平均 mA。大半は深いスリープ（SoC スリープ＋RTC 起床）、イベント（タッチ、腕上げ、BLE 接続窓）でのみ短時間全速。手法：センサは内蔵 FIFO でデータを溜めバースト起床（毎サンプルでなく）、BLE は長い接続間隔と疎な広告、画面/GPS の大消費は厳格デューティか要求時、センサハブ/低電力コプロが常態処理し主 SoC はスリープ。電流計で各状態電流をプロファイルし漏れを探す。',
        keyFormulas: ['寿命 = 電池容量(mAh) / 平均電流(mA)', '平均電流 = Σ(各状態電流 × 占有時間比)', '深いスリープ比が高いほど省電（スリープ電流 µA 級）', 'BLE 平均電力 ∝ 1/接続間隔'],
        designNotes: ['センサ FIFO でバッチ起床、SoC 起床回数削減', 'BLE 接続/広告間隔を延長（遅延と両立）', 'センサハブコプロで常態処理、主 SoC は深いスリープ', 'ポーリングでなくイベント駆動（割込み）', '量産前に電流プローブで各状態プロファイル、漏れ探索', '未使用周辺のクロック/電源ゲーティング'],
        commonMistakes: ['割込み/FIFO なしのポーリング → SoC が起き続け消費', 'BLE 間隔が短すぎ → 待機電流高・寿命悪', '系統を待機のみ・遮断せず → 漏れ蓄積', '電流プロファイルなし → 消費先不明で盲目最適化']
      },
      ko: {
        principles: '웨어러블 전력 예산은 평균 전류로 계산: 수명 = 배터리 mAh / 평균 mA. 대부분 딥 슬립(SoC 슬립+RTC 깨움), 이벤트(터치, 손목 들기, BLE 연결 창)에서만 짧게 전속. 기법: 센서는 내장 FIFO로 데이터를 모아 버스트 깨움(매 샘플 아님), BLE는 긴 연결 간격과 드문 광고, 화면/GPS 같은 큰 소비는 엄격 듀티나 온디맨드, 센서 허브/저전력 코프로세서가 상시 작업 처리하고 메인 SoC는 슬립. 전류계로 각 상태 전류를 프로파일해 누설 탐색.',
        keyFormulas: ['수명 = 배터리 용량(mAh) / 평균 전류(mA)', '평균 전류 = Σ(각 상태 전류 × 점유 시간 비)', '딥 슬립 비율이 높을수록 절전(슬립 전류 µA급)', 'BLE 평균 전력 ∝ 1/연결 간격'],
        designNotes: ['센서 FIFO로 배치 깨움, SoC 깨움 횟수 감소', 'BLE 연결/광고 간격 연장(지연과 절충)', '센서 허브 코프로세서로 상시 작업, 메인 SoC는 딥 슬립', '폴링 대신 이벤트 구동(인터럽트)', '양산 전 전류 프로브로 각 상태 프로파일, 누설 탐색', '미사용 주변장치 클럭/전원 게이팅'],
        commonMistakes: ['인터럽트/FIFO 없는 폴링 → SoC가 계속 깨어 소비', 'BLE 간격 너무 짧음 → 대기 전류 높고 수명 나쁨', '서브시스템 대기만·미차단 → 누설 누적', '전류 프로파일 없음 → 소비처 모른 채 맹목 최적화']
      }
    },
    // ===== 手機 Mobile =====
    'mobile-pmic': {
      en: {
        principles: 'A phone PMIC is a huge integrated power IC: a dozen-plus bucks (CPU clusters/GPU/DDR, with DVS dynamic voltage scaling) plus multiple LDOs (analog/sensor), load switches, battery charging, a fuel gauge and monitoring. The SoC commands the PMIC over SPMI (MIPI power interface) or I2C to change each rail live (DVFS: raise voltage when clocking up, drop it when idle to save power). Big current cores use a multiphase buck. The power-up sequence of dozens of rails is managed by the PMIC internal state machine. Flagships often use a main plus a secondary PMIC to share the load.',
        keyFormulas: ['DVS: core voltage tracks DVFS live (key to power saving)', 'Rail count reaches dozens (one per functional domain)', 'High-current cores use a multiphase buck', 'Power-up order governed by the PMIC state machine'],
        designNotes: ['Place the PMIC near the SoC; route high-current rails short and wide', 'Decouple DVS rails to handle fast voltage transitions', 'Guard signal integrity of the SPMI/I2C control bus', 'Decouple each rail strictly per the SoC power-delivery spec', 'Thermal: the PMIC is a heat source, plan for dissipation', 'Battery path (charge/supply) carries big current; use Kelvin sensing'],
        commonMistakes: ['Thin/long high-current rails: droop, SoC undervolts and hangs', 'Insufficient DVS-rail decoupling: transient errors during voltage change', 'PMIC power-up order not per spec: SoC will not boot', 'Ignoring PMIC thermals: overheats and throttles under high load']
      },
      ja: {
        principles: 'スマホ PMIC は巨大な統合電源 IC：十数個の buck（CPU クラスタ/GPU/DDR、DVS 動的電圧付き）＋複数 LDO（アナログ/センサ）、ロードスイッチ、電池充電、燃料計、監視を統合。SoC が SPMI（MIPI 電源 IF）や I2C で各レール電圧を即時変更（DVFS：クロックアップで昇圧、アイドルで降圧し省電）。大電流コアはマルチフェーズ buck。数十レールの投入順序は PMIC 内部ステートマシンが管理。旗艦は主＋副 PMIC で負荷分担。',
        keyFormulas: ['DVS：コア電圧が DVFS に即時追従（省電の鍵）', 'レール数は数十（機能ドメイン毎に独立）', '大電流コアはマルチフェーズ buck', '投入順序は PMIC ステートマシンが管理'],
        designNotes: ['PMIC を SoC 近くに、大電流レールは短く太く', 'DVS レールは高速電圧遷移に耐えるデカップリング', 'SPMI/I2C 制御バスの信号品質を確保', '各レールは SoC の電源供給仕様通りにデカップリング', '熱：PMIC は発熱源、放熱を計画', '電池経路（充電/給電）は大電流、Kelvin 測定'],
        commonMistakes: ['大電流レールが細長い → ドループ、SoC 低電圧でハング', 'DVS レールのデカップリング不足 → 電圧変更時の過渡エラー', 'PMIC 投入順序が仕様外 → SoC が起動しない', 'PMIC 放熱無視 → 高負荷で過熱・スロットリング']
      },
      ko: {
        principles: '폰 PMIC는 거대한 통합 전원 IC: 십수 개 buck(CPU 클러스터/GPU/DDR, DVS 동적 전압)+다중 LDO(아날로그/센서), 로드 스위치, 배터리 충전, 연료 게이지, 모니터링 통합. SoC가 SPMI(MIPI 전원 IF)나 I2C로 각 레일 전압을 실시간 변경(DVFS: 클럭 상승 시 승압, 유휴 시 강압해 절전). 대전류 코어는 멀티페이즈 buck. 수십 레일의 인가 순서는 PMIC 내부 상태 머신이 관리. 플래그십은 주+부 PMIC로 부하 분담.',
        keyFormulas: ['DVS: 코어 전압이 DVFS에 실시간 추종(절전 핵심)', '레일 수는 수십(기능 도메인마다 독립)', '대전류 코어는 멀티페이즈 buck', '인가 순서는 PMIC 상태 머신이 관리'],
        designNotes: ['PMIC를 SoC 근처에, 대전류 레일은 짧고 굵게', 'DVS 레일은 빠른 전압 전환에 견디는 디커플링', 'SPMI/I2C 제어 버스 신호 무결성 확보', '각 레일은 SoC 전원 공급 사양대로 디커플링', '발열: PMIC는 발열원, 방열 계획', '배터리 경로(충전/급전)는 대전류, Kelvin 측정'],
        commonMistakes: ['대전류 레일이 가늘고 김 → 드룹, SoC 저전압으로 행', 'DVS 레일 디커플링 부족 → 전압 변경 시 과도 오류', 'PMIC 인가 순서가 사양 밖 → SoC 부팅 안 됨', 'PMIC 방열 무시 → 고부하에서 과열·스로틀링']
      }
    },
    'usb-pd-fastcharge': {
      en: {
        principles: 'USB-PD signals over the CC line with BMC coding: sink (phone) and source (charger) negotiate a power contract (5V/9V/15V/20V... or a PPS range). Traditional charging: the charger outputs a fixed voltage and the in-phone charger IC steps down to the battery, turning the drop into heat. PPS (programmable power): the phone commands the charger to trim voltage in 20mV steps so the output ~= battery voltage + line loss, and the phone direct-charges through a charge pump (2:1 divide, >97% efficient), slashing heat and charging faster. It needs CC logic, e-marker cables (>3A/5A) and VBUS overvoltage protection.',
        keyFormulas: ['PD power = negotiated voltage x current (up to 48V x 5A = 240W)', 'PPS step: 20mV (voltage) / 50mA (current)', 'Direct-charge pump 2:1: Vbat ~= Vbus/2, >97% efficient', 'Line-loss compensation: Vbus = Vbat x 2 + I x R_line'],
        designNotes: ['Connect the CC pins to the PD controller; add VBUS overvoltage protection (guards against a bad negotiation dumping high voltage into 5V parts)', '>3A needs an e-marker cable; the design must check cable capability', 'The direct-charge charge pump runs cool but needs a fat high-current path (traces/connector)', 'Kelvin-sense at the battery to compensate line loss, so PPS trims accurately', 'Provide a discharge path for the big VBUS cap (bleed after unplug)', 'Full over-voltage/current/temperature protection (fast charge carries a lot of energy)'],
        commonMistakes: ['No VBUS overvoltage protection: a bad negotiation dumps 20V into 5V parts', 'Forcing high current on an unrated cable: heat, voltage sag, slow charge', 'Thin direct-charge path: high-current droop, lower efficiency', 'PPS without line-loss compensation: wrong voltage, slow charging']
      },
      ja: {
        principles: 'USB-PD は CC 線を BMC 符号で通信：Sink（スマホ）と Source（充電器）が給電契約（5V/9V/15V/20V… や PPS 範囲）を交渉。従来充電：充電器が固定電圧を出し端末内充電 IC が電池へ降圧、差分が熱に。PPS（可変電源）：スマホが 20mV 刻みで電圧を調整させ、出力 ≈ 電池電圧＋線損とし、端末はチャージポンプで直充（2:1 分圧、効率 >97%）、発熱大幅減で充電も速い。CC ロジック、e-marker ケーブル（>3A/5A）、VBUS 過電圧保護が必要。',
        keyFormulas: ['PD 電力 = 交渉電圧 × 電流（最大 48V×5A=240W）', 'PPS 刻み：20mV（電圧）/ 50mA（電流）', '直充ポンプ 2:1：Vbat ≈ Vbus/2、効率 >97%', '線損補償：Vbus = Vbat×2 + I×R_line'],
        designNotes: ['CC ピンを PD コントローラへ、VBUS 過電圧保護を追加（交渉異常時の高電圧流入を防止）', '>3A は e-marker ケーブル必須、設計でケーブル能力を検証', '直充チャージポンプは低発熱だが大電流経路（配線/コネクタ）が必要', '電池端で Kelvin 測定し線損補償、PPS が正確に調整', 'VBUS 大容量の放電経路（抜線後の放電）を用意', '過電圧/過電流/過温保護を完備（急速充電はエネルギー大）'],
        commonMistakes: ['VBUS 過電圧保護なし → 交渉異常で 20V が 5V 部品に流入', '非対応ケーブルで大電流強行 → 発熱・電圧低下・充電遅い', '直充経路が細い → 大電流ドループ・効率低下', 'PPS で線損補償なし → 電圧不正確・充電遅い']
      },
      ko: {
        principles: 'USB-PD는 CC 선을 BMC 코딩으로 통신: Sink(폰)와 Source(충전기)가 급전 계약(5V/9V/15V/20V… 또는 PPS 범위)을 협상. 전통 충전: 충전기가 고정 전압을 내고 폰 내부 충전 IC가 배터리로 강압, 전압차가 열로. PPS(프로그래머블 전원): 폰이 20mV 단위로 전압을 조정시켜 출력 ≈ 배터리 전압+선손으로 하고, 폰은 차지 펌프로 직충(2:1 분압, 효율 >97%), 발열 대폭 감소로 충전도 빠름. CC 로직, e-marker 케이블(>3A/5A), VBUS 과전압 보호 필요.',
        keyFormulas: ['PD 전력 = 협상 전압 × 전류(최대 48V×5A=240W)', 'PPS 단위: 20mV(전압) / 50mA(전류)', '직충 펌프 2:1: Vbat ≈ Vbus/2, 효율 >97%', '선손 보상: Vbus = Vbat×2 + I×R_line'],
        designNotes: ['CC 핀을 PD 컨트롤러에, VBUS 과전압 보호 추가(협상 이상 시 고전압 유입 방지)', '>3A는 e-marker 케이블 필수, 설계에서 케이블 능력 검증', '직충 차지 펌프는 저발열이나 대전류 경로(배선/커넥터) 필요', '배터리 단에서 Kelvin 측정해 선손 보상, PPS가 정확히 조정', 'VBUS 대용량 방전 경로(분리 후 방전) 마련', '과전압/과전류/과온 보호 완비(고속 충전은 에너지 큼)'],
        commonMistakes: ['VBUS 과전압 보호 없음 → 협상 이상 시 20V가 5V 부품에 유입', '비지원 케이블로 대전류 강행 → 발열·전압 강하·충전 느림', '직충 경로가 가늚 → 대전류 드룹·효율 저하', 'PPS에서 선손 보상 없음 → 전압 부정확·충전 느림']
      }
    },
    'fuel-gauge': {
      en: {
        principles: 'A fuel gauge estimates SOC (remaining %) and SOH (health). Methods: (1) coulomb counting - integrate current in/out through a sense resistor, accurate but drifts and needs a reference to recalibrate; (2) voltage (OCV) - open-circuit voltage maps to SOC, but load pulls voltage down via internal resistance and must be compensated; (3) fusion (e.g. TI Impedance Track / MAX ModelGauge) - combines current integration, a voltage model, a battery impedance model and temperature to correct dynamically. Aging shrinks capacity, so the gauge learns and updates full-charge capacity. It recalibrates the coulomb baseline at defined full/empty points.',
        keyFormulas: ['Coulomb counting: dSOC = integral(I dt) / capacity', 'OCV-SOC: look up SOC from open-circuit voltage (needs a rest, no load)', 'Load compensation: V_terminal = OCV - I x R_internal', 'SOH = present full-charge capacity / factory capacity'],
        designNotes: ['Kelvin (4-wire) sense the current resistor to reject trace drop', 'Size the sense resistor to trade resolution against power/heat', 'Connect a temperature sensor to the gauge (capacity/impedance vary with temp)', 'Use battery-vendor model parameters (or characterize the cell)', 'Keep coulomb counting alive even when off (low-power always counting)', 'Full/empty calibration points let the algorithm reset the baseline'],
        commonMistakes: ['Pure voltage method without internal-R compensation: SOC jumps under heavy load', 'Pure coulomb counting without recalibration: error accumulates and drifts', 'Sense resistor without Kelvin: trace drop corrupts the small signal', 'No temperature/aging: inaccurate when cold or with an old battery']
      },
      ja: {
        principles: '燃料計は SOC（残量%）と SOH（健康度）を推定。方式：①クーロン計数——センス抵抗で出入電荷を積分、正確だがドリフトし基準で再校正が必要②電圧（OCV）——開放電圧が SOC に対応するが負荷で内部抵抗により電圧低下、補償が必要③融合（TI Impedance Track / MAX ModelGauge 等）——電流積分＋電圧モデル＋電池インピーダンスモデル＋温度で動的補正。劣化で容量減、計は満充電容量を学習更新。満/空の特定点でクーロン基準を再校正。',
        keyFormulas: ['クーロン計数：ΔSOC = ∫I dt / 容量', 'OCV-SOC：開放電圧から SOC を参照（無負荷で静置要）', '負荷補償：V_terminal = OCV − I×R_internal', 'SOH = 現満充電容量 / 出荷容量'],
        designNotes: ['電流センス抵抗を Kelvin（4 線）測定し配線降下を排除', 'センス抵抗値で分解能と発熱を両立', '温度センサを計に接続（容量/インピーダンスが温度依存）', '電池メーカのモデルパラメータを使う（または特性化）', '電源オフ時もクーロン計数を維持（低電力で常時計数）', '満/空校正点でアルゴリズムが基準をリセット'],
        commonMistakes: ['電圧法のみで内部抵抗補償なし → 高負荷で SOC が乱れる', 'クーロン計数のみで無校正 → 誤差蓄積・ドリフト', 'センス抵抗が Kelvin でない → 配線降下が微小信号を汚染', '温度/劣化を持たない → 低温や古い電池で不正確']
      },
      ko: {
        principles: '연료 게이지는 SOC(잔량%)와 SOH(건강도)를 추정. 방법: ①쿨롱 카운팅 - 센스 저항으로 입출 전하를 적분, 정확하나 드리프트해 기준으로 재교정 필요 ②전압(OCV) - 개방 전압이 SOC에 대응하나 부하로 내부 저항에 의해 전압 강하, 보상 필요 ③융합(TI Impedance Track / MAX ModelGauge 등) - 전류 적분+전압 모델+배터리 임피던스 모델+온도로 동적 보정. 노화로 용량 감소, 게이지는 만충전 용량을 학습 갱신. 만/공 특정점에서 쿨롱 기준 재교정.',
        keyFormulas: ['쿨롱 카운팅: ΔSOC = ∫I dt / 용량', 'OCV-SOC: 개방 전압에서 SOC 조회(무부하 정치 필요)', '부하 보상: V_terminal = OCV − I×R_internal', 'SOH = 현재 만충전 용량 / 출하 용량'],
        designNotes: ['전류 센스 저항을 Kelvin(4선) 측정해 배선 강하 제거', '센스 저항값으로 해상도와 발열 절충', '온도 센서를 게이지에 연결(용량/임피던스가 온도 의존)', '배터리 제조사 모델 파라미터 사용(또는 특성화)', '전원 꺼짐에도 쿨롱 카운팅 유지(저전력 상시 카운팅)', '만/공 교정점에서 알고리즘이 기준 리셋'],
        commonMistakes: ['전압법만 쓰고 내부 저항 보상 없음 → 고부하에서 SOC 요동', '쿨롱 카운팅만 하고 무교정 → 오차 누적·드리프트', '센스 저항이 Kelvin 아님 → 배선 강하가 미소 신호 오염', '온도/노화 미반영 → 저온이나 오래된 배터리에서 부정확']
      }
    },
    'haptics-driver': {
      en: {
        principles: 'ERM (eccentric rotating mass): an offset rotor makes vibration, cheap but slow to start/stop (inertia) and coarse. LRA (linear resonant actuator): a mass on a spring resonates and must be driven at its resonant frequency (~150-235Hz) for efficiency, giving a fine, crisp feel. A dedicated haptic driver IC generates the waveform, auto-tracks the LRA resonance (via back-EMF sensing) and actively brakes (a reverse pulse) to stop residual vibration fast, producing a clean tap. High-end designs use wideband LRAs plus waveform libraries for rich textures.',
        keyFormulas: ['LRA must be driven at its resonant frequency f0 (~150-235Hz)', 'Off f0 -> efficiency plummets, feel degrades', 'ERM start/stop is slow (inertia); LRA can actively brake to stop fast', 'Back-EMF sensing -> auto-tracks the resonant frequency'],
        designNotes: ['Use a dedicated haptic driver (auto resonance-track + brake), not a raw GPIO', 'Tune LRA drive frequency to its f0 (different actuators differ)', 'Active braking stops vibration fast for a crisp tap', 'Provide enough drive current (actuator inrush is not small)', 'Mechanically fix the actuator so vibration reaches the case', 'ERM back-EMF needs a flyback diode / driver protection'],
        commonMistakes: ['LRA not tuned to f0: weak, power-hungry, poor feel', 'No braking: residual vibration smears the feel', 'Driving the motor from GPIO: no brake, no tracking, poor feel and IO stress', 'ERM without freewheeling protection: back-EMF damages the driver']
      },
      ja: {
        principles: 'ERM（偏心回転質量）：偏心ロータで振動、安価だが起停が遅く（慣性）粗い。LRA（線形共振アクチュエータ）：ばね上の質量が共振、共振周波数（~150-235Hz）で駆動しないと効率悪、繊細で歯切れ良い。専用ハプティックドライバ IC が波形生成、逆起電力検出で LRA 共振を自動追従、能動ブレーキ（逆パルス）で残振動を速く止め、クリアなタップを生成。高級品は広帯域 LRA＋波形ライブラリで豊かな触感。',
        keyFormulas: ['LRA は共振周波数 f0（~150-235Hz）で駆動必須', 'f0 から外れ → 効率激減・触感劣化', 'ERM は起停が遅い（慣性）、LRA は能動ブレーキで速停', '逆起電力検出 → 共振周波数を自動追従'],
        designNotes: ['専用ハプティックドライバ（自動共振追従＋ブレーキ）を使う、GPIO 直駆動でなく', 'LRA 駆動周波数をその f0 に合わせる（アクチュエータ毎に異なる）', '能動ブレーキで振動を速く止めクリアなタップ', '駆動電流を十分に（アクチュエータの突入は小さくない）', 'アクチュエータを機構固定し振動を筐体へ伝える', 'ERM の逆起電力に還流ダイオード/ドライバ保護'],
        commonMistakes: ['LRA が f0 に合わず → 弱い・消費大・触感最悪', 'ブレーキなし → 残振動で触感がぼける', 'GPIO でモータ直駆動 → ブレーキ/追従なし、触感悪・IO 負担', 'ERM の還流保護なし → 逆起電力がドライバ破損']
      },
      ko: {
        principles: 'ERM(편심 회전 질량): 편심 로터로 진동, 저렴하나 기동/정지 느리고(관성) 거침. LRA(선형 공진 액추에이터): 스프링 위 질량이 공진, 공진 주파수(~150-235Hz)로 구동해야 효율, 섬세하고 또렷한 느낌. 전용 햅틱 드라이버 IC가 파형 생성, 역기전력 감지로 LRA 공진을 자동 추적, 능동 브레이크(역펄스)로 잔진동을 빠르게 멈춰 깔끔한 탭 생성. 고급형은 광대역 LRA+파형 라이브러리로 풍부한 촉감.',
        keyFormulas: ['LRA는 공진 주파수 f0(~150-235Hz)로 구동 필수', 'f0 벗어남 → 효율 급감·촉감 저하', 'ERM은 기동/정지 느림(관성), LRA는 능동 브레이크로 빠른 정지', '역기전력 감지 → 공진 주파수 자동 추적'],
        designNotes: ['전용 햅틱 드라이버(자동 공진 추적+브레이크) 사용, GPIO 직접 구동 아님', 'LRA 구동 주파수를 그 f0에 맞춤(액추에이터마다 다름)', '능동 브레이크로 진동을 빠르게 멈춰 깔끔한 탭', '구동 전류를 충분히(액추에이터 돌입이 작지 않음)', '액추에이터를 기구 고정해 진동을 케이스로 전달', 'ERM 역기전력에 플라이휠 다이오드/드라이버 보호'],
        commonMistakes: ['LRA가 f0에 안 맞음 → 약하고 소비 크고 촉감 나쁨', '브레이크 없음 → 잔진동으로 촉감 흐림', 'GPIO로 모터 직접 구동 → 브레이크/추적 없음, 촉감 나쁘고 IO 부담', 'ERM 플라이휠 보호 없음 → 역기전력이 드라이버 손상']
      }
    },
    'rf-frontend': {
      en: {
        principles: 'The RF front-end (RFFE) sits between the transceiver and the antenna. Transmit chain: the PA amplifies a small signal to enough power (trading linearity vs efficiency, using envelope tracking to save power). Receive chain: the LNA amplifies the weak signal first and sets the overall noise figure (NF). Switches (SPnT) pick bands/TX-RX/antennas. Filters (SAW/BAW/duplexers) separate bands and isolate TX from RX. An antenna tuner (variable caps) compensates hand/detuning of the antenna impedance to keep it matched. Control runs over the MIPI RFFE bus. 5G mmWave adds beamforming arrays.',
        keyFormulas: ['Receive NF is dominated by the first LNA (Friis equation)', 'PA efficiency vs linearity trade-off (improved by envelope tracking / DPD)', 'Antenna mismatch -> reflection (VSWR up) -> lower efficiency, limited TX', 'The matching network pulls antenna impedance back to 50 ohm'],
        designNotes: ['Put the LNA closest to the antenna (amplify first to preserve NF)', 'Power the PA with envelope tracking / APT to save power and cut heat', 'Route RF at 50 ohm controlled impedance, short, with few vias', 'Antenna tuning compensates hand detuning (triggered by proximity sensing)', 'MIPI RFFE control bus timing aligned to TDD TX/RX windows', 'Shield cans and grounding isolate stages against cross-talk'],
        commonMistakes: ['High loss before the LNA (long trace/bad switch): degraded NF, poor reception', 'Fixed PA supply without ET: low efficiency, heat, power drain', 'Uncontrolled RF impedance: reflection loss, lower TX efficiency', 'No antenna tuning: mismatch when held, dropped signal']
      },
      ja: {
        principles: 'RF フロントエンド（RFFE）はトランシーバとアンテナの間。送信鎖：PA が小信号を十分な電力に増幅（線形性 vs 効率を両立、包絡線追跡で省電）。受信鎖：LNA が最前段で微弱信号を増幅し全体の雑音指数（NF）を決める。スイッチ（SPnT）がバンド/送受/アンテナ切替。フィルタ（SAW/BAW/デュプレクサ）がバンド分離・送受絶縁。アンテナチューナ（可変容量）が手持ち/離調によるアンテナインピーダンスを補償し整合維持。制御は MIPI RFFE バス。5G ミリ波はビームフォーミングアレイ追加。',
        keyFormulas: ['受信 NF は初段 LNA が支配（Friis の式）', 'PA 効率 vs 線形性の両立（包絡線追跡/DPD で改善）', 'アンテナ不整合 → 反射（VSWR↑）→ 効率低下・送信制限', '整合回路がアンテナインピーダンスを 50Ω へ引き戻す'],
        designNotes: ['LNA をアンテナ最近傍に（先に増幅し NF を保つ）', 'PA 給電は包絡線追跡/APT で省電・低発熱', 'RF は 50Ω 制御インピーダンス、短く、ビア少なく', 'アンテナ整合が手持ち離調を補償（近接センシングでトリガ）', 'MIPI RFFE 制御バスのタイミングを TDD 送受窓に整合', 'シールドケースと接地で各段を絶縁しクロストーク防止'],
        commonMistakes: ['LNA 前の損失大（長配線/悪スイッチ）→ NF 悪化・受信悪', 'PA 固定給電で ET なし → 効率低・発熱・消費', 'RF インピーダンス制御失敗 → 反射損・送信効率低下', 'アンテナ整合なし → 手持ちで不整合・切断']
      },
      ko: {
        principles: 'RF 프런트엔드(RFFE)는 트랜시버와 안테나 사이. 송신 체인: PA가 작은 신호를 충분한 전력으로 증폭(선형성 vs 효율 절충, 포락선 추적으로 절전). 수신 체인: LNA가 최전단에서 미약 신호를 증폭해 전체 잡음 지수(NF)를 결정. 스위치(SPnT)가 대역/송수신/안테나 전환. 필터(SAW/BAW/듀플렉서)가 대역 분리·송수신 격리. 안테나 튜너(가변 커패시터)가 손 파지/이조에 의한 안테나 임피던스를 보상해 정합 유지. 제어는 MIPI RFFE 버스. 5G 밀리미터파는 빔포밍 어레이 추가.',
        keyFormulas: ['수신 NF는 첫 단 LNA가 지배(Friis 공식)', 'PA 효율 vs 선형성 절충(포락선 추적/DPD로 개선)', '안테나 부정합 → 반사(VSWR↑) → 효율 저하·송신 제한', '정합 회로가 안테나 임피던스를 50Ω으로 되돌림'],
        designNotes: ['LNA를 안테나 최근접에(먼저 증폭해 NF 보존)', 'PA 급전은 포락선 추적/APT로 절전·저발열', 'RF는 50Ω 제어 임피던스, 짧게, 비아 적게', '안테나 정합이 손 파지 이조 보상(근접 센싱으로 트리거)', 'MIPI RFFE 제어 버스 타이밍을 TDD 송수신 창에 정합', '차폐 캔과 접지로 각 단 격리해 누화 방지'],
        commonMistakes: ['LNA 전 손실 큼(긴 배선/나쁜 스위치) → NF 악화·수신 나쁨', 'PA 고정 급전에 ET 없음 → 효율 낮음·발열·소비', 'RF 임피던스 제어 실패 → 반사 손실·송신 효율 저하', '안테나 정합 없음 → 파지 시 부정합·신호 끊김']
      }
    },
    // ===== 車用電子 Automotive =====
    'auto-load-dump': {
      en: {
        principles: 'Load dump: while charging, the battery is disconnected (e.g. a bad contact); the alternator loses its load and dumps stored magnetic energy onto the bus, so a 12V system spikes to 30-40V+ for hundreds of ms. Modern alternators clamp it centrally (clamped load dump ~35V) but external protection is still needed. ISO 7637-2 defines pulses: 1 (inductive-disconnect negative), 2a/2b, 3a/3b (fast transient bursts), 4 (cold-crank sag to ~6V), 5 (load dump). The design uses TVS + choke / a front pre-regulator (boost or clamp) to turn the messy input into a stable rail before feeding downstream. 48V systems have their own rules.',
        keyFormulas: ['Load-dump peak: unclamped ~87V, clamped ~35V (12V system)', 'Cold crank: voltage sags to ~6V (pulse 4) - downstream must run low or the front boosts', 'TVS clamp voltage < downstream rating, > normal max operating voltage', 'Energy = 1/2 L I^2 (alternator inductance sets load-dump energy)'],
        designNotes: ['Front stage: a TVS absorbs load dump plus a pre-boost/buck regulates', 'Use a boost pre-regulator to hold downstream supply through cold crank (else it resets)', 'Pick an automotive load-dump TVS (big energy, right clamp voltage)', 'Put reverse-battery protection ahead of the front stage (see reverse-battery-auto)', 'Choose automotive AEC-Q parts (temperature/reliability), not commercial grade', 'ISO 7637 pulses must be tested and validated, not just calculated'],
        commonMistakes: ['Using commercial parts against automotive transients: load dump blows them', 'TVS clamp voltage set too high: downstream still overvolts and fails', 'Ignoring cold-crank sag: the system resets during engine start', 'Only handling load dump, forgetting fast transient bursts (3a/3b): fails EMC']
      },
      ja: {
        principles: 'ロードダンプ：充電中に電池が切断（接触不良等）、オルタネータが負荷を失い蓄積磁気エネルギーをバスに放出、12V 系が数百 ms 間 30~40V+ に急騰。現代オルタネータは中央クランプ（clamped load dump ~35V）だが外部保護は依然必要。ISO 7637-2 のパルス：1（誘導切断負）、2a/2b、3a/3b（高速過渡バースト）、4（コールドクランク ~6V 低下）、5（load dump）。設計は TVS＋チョーク/前段プリレギュレータ（昇圧やクランプ）で乱れた入力を安定レールに整えてから下流へ。48V 系は別規定。',
        keyFormulas: ['ロードダンプ尖頭：非クランプ ~87V、クランプ型 ~35V（12V 系）', 'コールドクランク：~6V 低下（パルス 4）→下流は低電圧動作か前段昇圧', 'TVS クランプ電圧 < 下流耐圧、> 通常最大動作電圧', 'エネルギー = ½ L I²（オルタネータインダクタンスが決める）'],
        designNotes: ['前段：TVS がロードダンプ吸収＋プリ昇圧/降圧で安定化', 'コールドクランクは昇圧プリレギュレータで下流給電維持（さもないと再起動）', '車載ロードダンプ専用 TVS を選ぶ（大エネルギー・適切なクランプ電圧）', '逆接続保護を前段の前に直列（reverse-battery-auto 参照）', '部品は車載 AEC-Q（温度/信頼性）、商用グレードでなく', 'ISO 7637 パルスは計算だけでなくテスト検証'],
        commonMistakes: ['商用部品で車載過渡を扱う → ロードダンプで破損', 'TVS クランプ電圧が高すぎ → 下流が依然過電圧で損傷', 'コールドクランク低下無視 → エンジン始動時にシステム再起動', 'ロードダンプのみで高速過渡バースト（3a/3b）を忘れる → EMC 不合格']
      },
      ko: {
        principles: '로드 덤프: 충전 중 배터리가 분리(접촉 불량 등), 발전기가 부하를 잃고 저장 자기 에너지를 버스에 방출, 12V 계가 수백 ms 동안 30~40V+로 급등. 현대 발전기는 중앙 클램프(clamped load dump ~35V)하나 외부 보호는 여전히 필요. ISO 7637-2 펄스: 1(유도 차단 음), 2a/2b, 3a/3b(고속 과도 버스트), 4(콜드 크랭크 ~6V 강하), 5(load dump). 설계는 TVS+초크/전단 프리레귤레이터(승압이나 클램프)로 지저분한 입력을 안정 레일로 정리 후 하류로. 48V 계는 별도 규정.',
        keyFormulas: ['로드 덤프 피크: 비클램프 ~87V, 클램프형 ~35V(12V 계)', '콜드 크랭크: ~6V 강하(펄스 4) → 하류는 저전압 동작이나 전단 승압', 'TVS 클램프 전압 < 하류 정격, > 정상 최대 동작 전압', '에너지 = ½ L I²(발전기 인덕턴스가 결정)'],
        designNotes: ['전단: TVS가 로드 덤프 흡수+프리 승압/강압으로 안정화', '콜드 크랭크는 승압 프리레귤레이터로 하류 급전 유지(아니면 재시작)', '차량용 로드 덤프 전용 TVS 선택(큰 에너지·적절한 클램프 전압)', '역접속 보호를 전단 앞에 직렬(reverse-battery-auto 참조)', '부품은 차량용 AEC-Q(온도/신뢰성), 상용 등급 아님', 'ISO 7637 펄스는 계산만이 아니라 테스트 검증'],
        commonMistakes: ['상용 부품으로 차량 과도 처리 → 로드 덤프로 파손', 'TVS 클램프 전압 너무 높음 → 하류가 여전히 과전압 손상', '콜드 크랭크 강하 무시 → 엔진 시동 시 시스템 재시작', '로드 덤프만 처리하고 고속 과도 버스트(3a/3b) 잊음 → EMC 탈락']
      }
    },
    'reverse-battery-auto': {
      en: {
        principles: 'Three generations of reverse protection: (1) series diode - simplest, but Vf x I is all heat, unviable at high current; (2) high-side P-MOS - grounding the gate auto-disconnects on reverse, conducting normally with only R_DS(on) loss, better than a diode; (3) ideal-diode controller + N-MOS - the controller senses direction and drives a low-R_DS(on) N-MOS, conducting forward and disconnecting fast on reverse, lowest loss. To block reverse battery it must also survive load dump, often integrated with the front stage. Back-to-back FETs (sources facing) block both directions (reverse connection plus reverse current feedback).',
        keyFormulas: ['Diode loss P = Vf x I (unviable at high current)', 'Ideal-diode loss P = I^2 x R_DS(on) (much lower)', 'FET rating >= load-dump peak + reverse-battery voltage', 'Back-to-back FETs block both directions (reverse + feedback)'],
        designNotes: ['At high current use an ideal-diode controller + low-R_DS(on) N-MOS', 'FET V_DS rating covers load dump (~40V) with margin', 'Design together with load-dump / reverse transient protection', 'Guard the gate-drive path against transient false triggering', 'For bidirectional blocking (no feedback) use back-to-back FETs', 'Automotive AEC-Q101 qualification (discrete parts)'],
        commonMistakes: ['Using a diode for high-current reverse protection: heat, poor efficiency', 'FET rating not covering load dump: reverse + dump double-kills it', 'Ideal-diode controller slow to transients: brief reverse feedback', 'Forgetting bidirectional-block need: reverse current feeds back into battery/system']
      },
      ja: {
        principles: '逆接続保護三世代：①直列ダイオード——最簡だが Vf×I が全て熱、大電流不可②ハイサイド P-MOS——ゲート接地で逆接続時に自動遮断、通常は R_DS(on) 損失のみ、ダイオードより良い③理想ダイオードコントローラ＋N-MOS——方向検出し低 R_DS(on) N-MOS を駆動、正接導通・逆接続で高速遮断、損失最低。逆電池を阻止しつつロードダンプにも耐える必要、前段と統合が多い。背中合わせ FET（ソース対向）は双方向阻止（逆接続＋逆流帰還）。',
        keyFormulas: ['ダイオード損失 P = Vf × I（大電流不可）', '理想ダイオード損失 P = I² × R_DS(on)（大幅に低い）', 'FET 耐圧 ≥ ロードダンプ尖頭 + 逆電池電圧', '背中合わせ FET は双方向阻止（逆接続＋帰還）'],
        designNotes: ['大電流は理想ダイオードコントローラ＋低 R_DS(on) N-MOS', 'FET V_DS 耐圧がロードダンプ（~40V）を余裕込みで網羅', 'ロードダンプ/逆接続過渡保護と一体設計', 'ゲート駆動経路を過渡誤トリガから保護', '双方向阻止（帰還防止）は背中合わせ FET', '車載 AEC-Q101 認証（分立部品）'],
        commonMistakes: ['大電流逆接続保護にダイオード → 発熱・効率悪', 'FET 耐圧がロードダンプ不足 → 逆接続+ダンプで二重破壊', '理想ダイオードコントローラが過渡に遅い → 短時間逆流帰還', '双方向阻止の要求忘れ → 逆電流が電池/システムに帰還']
      },
      ko: {
        principles: '역접속 보호 3세대: ①직렬 다이오드 - 가장 단순하나 Vf×I가 전부 열, 대전류 불가 ②하이사이드 P-MOS - 게이트 접지로 역접속 시 자동 차단, 정상 시 R_DS(on) 손실만, 다이오드보다 나음 ③이상 다이오드 컨트롤러+N-MOS - 방향 감지해 저 R_DS(on) N-MOS 구동, 순접 도통·역접속 시 고속 차단, 손실 최저. 역배터리를 차단하며 로드 덤프도 견뎌야 함, 전단과 통합 많음. 백투백 FET(소스 대향)는 양방향 차단(역접속+역류 환류).',
        keyFormulas: ['다이오드 손실 P = Vf × I(대전류 불가)', '이상 다이오드 손실 P = I² × R_DS(on)(훨씬 낮음)', 'FET 정격 ≥ 로드 덤프 피크 + 역배터리 전압', '백투백 FET는 양방향 차단(역접속+환류)'],
        designNotes: ['대전류는 이상 다이오드 컨트롤러+저 R_DS(on) N-MOS', 'FET V_DS 정격이 로드 덤프(~40V)를 여유 포함 커버', '로드 덤프/역접속 과도 보호와 일체 설계', '게이트 구동 경로를 과도 오트리거로부터 보호', '양방향 차단(환류 방지)은 백투백 FET', '차량용 AEC-Q101 인증(분리 부품)'],
        commonMistakes: ['대전류 역접속 보호에 다이오드 → 발열·효율 나쁨', 'FET 정격이 로드 덤프 부족 → 역접속+덤프로 이중 파손', '이상 다이오드 컨트롤러가 과도에 느림 → 짧은 역류 환류', '양방향 차단 필요 망각 → 역전류가 배터리/시스템으로 환류']
      }
    },
    'can-fd-automotive': {
      en: {
        principles: 'CAN: differential two-wire (CANH/CANL), dominant (0)/recessive (1), multi-master with non-destructive arbitration (lower ID wins). CAN-FD raises the data-phase bit rate (up to ~5-8Mbps) and payload (64 bytes) while the arbitration phase stays CAN-compatible. The physical layer uses a CAN transceiver, with 120-ohm termination at both bus ends to damp reflections. LIN: single-wire, master-slave, low speed (<=20kbps), cheap, for windows/seats etc. Automotive demands: bus short/open fault tolerance, wide common-mode range, transient protection (TVS/common-mode choke), and standby wake (partial networking to save power).',
        keyFormulas: ['CAN termination: 120 ohm at each end (parallel 60 ohm matches line impedance)', 'CAN-FD data phase up to ~5-8Mbps (arbitration still <=1Mbps)', 'LIN <=20kbps single-wire master-slave', 'Differential transmission -> high common-mode immunity (needed in a noisy car)'],
        designNotes: ['120 ohm termination at both bus ends (not at every node)', 'Add a common-mode choke + TVS at the transceiver (EMC + transient protection)', 'Route CANH/CANL as a differential pair, length-matched, controlled impedance', 'Keep stubs short for CAN-FD high speed to reduce reflections', 'Choose automotive transceivers that support standby wake (power saving)', 'LIN master needs a pull-up + diode; slaves do not'],
        commonMistakes: ['Wrong termination (at every node or missing): reflections, comm errors', 'CANH/CANL not matched/controlled: CAN-FD high speed fails', 'No common-mode choke/TVS: fails EMC, transients kill the transceiver', 'Stub too long: CAN-FD data-phase bit errors']
      },
      ja: {
        principles: 'CAN：差動 2 線（CANH/CANL）、ドミナント(0)/レセッシブ(1)、マルチマスタで非破壊アービトレーション（ID 小が優先）。CAN-FD はデータ段のビットレートを上げ（最大 ~5-8Mbps）ペイロード拡大（64 バイト）、アービトレーション段は CAN 互換。物理層は CAN トランシーバ、バス両端に 120Ω 終端で反射抑制。LIN：単線、マスタスレーブ、低速（≤20kbps）、安価、窓/シート等。車載要求：バス短絡/断線耐性、広コモンモード範囲、過渡保護（TVS/コモンモードチョーク）、待機ウェイク（省電）。',
        keyFormulas: ['CAN 終端：両端各 120Ω（並列 60Ω が線路インピーダンス整合）', 'CAN-FD データ段最大 ~5-8Mbps（アービトレーション段は ≤1Mbps）', 'LIN ≤20kbps 単線マスタスレーブ', '差動伝送 → 高コモンモード耐性（車載雑音環境に必要）'],
        designNotes: ['バス両端各 120Ω 終端（各ノードでなく）', 'トランシーバにコモンモードチョーク＋TVS（EMC＋過渡保護）', 'CANH/CANL を差動対で等長・制御インピーダンス配線', 'CAN-FD 高速時はスタブを短く反射低減', '待機ウェイク対応の車載トランシーバを選ぶ（省電）', 'LIN マスタ端は上拉抵抗＋ダイオード、スレーブは不要'],
        commonMistakes: ['終端が誤り（各ノードや欠落）→ 反射・通信エラー', 'CANH/CANL が非等長/非制御 → CAN-FD 高速失敗', 'コモンモードチョーク/TVS なし → EMC 不合格・過渡でトランシーバ破損', 'スタブが長すぎ → CAN-FD データ段のビットエラー']
      },
      ko: {
        principles: 'CAN: 차동 2선(CANH/CANL), 도미넌트(0)/리세시브(1), 멀티마스터 비파괴 중재(ID 작은 쪽 우선). CAN-FD는 데이터 단 비트레이트를 올리고(최대 ~5-8Mbps) 페이로드 확대(64바이트), 중재 단은 CAN 호환. 물리층은 CAN 트랜시버, 버스 양단에 120Ω 종단으로 반사 억제. LIN: 단선, 마스터-슬레이브, 저속(≤20kbps), 저렴, 창문/시트 등. 차량 요구: 버스 단락/단선 내성, 넓은 공통 모드 범위, 과도 보호(TVS/공통 모드 초크), 대기 웨이크(절전).',
        keyFormulas: ['CAN 종단: 양단 각 120Ω(병렬 60Ω이 선로 임피던스 정합)', 'CAN-FD 데이터 단 최대 ~5-8Mbps(중재 단은 ≤1Mbps)', 'LIN ≤20kbps 단선 마스터-슬레이브', '차동 전송 → 높은 공통 모드 내성(차량 잡음 환경에 필요)'],
        designNotes: ['버스 양단 각 120Ω 종단(각 노드가 아님)', '트랜시버에 공통 모드 초크+TVS(EMC+과도 보호)', 'CANH/CANL을 차동쌍으로 등장·제어 임피던스 배선', 'CAN-FD 고속 시 스터브를 짧게 해 반사 감소', '대기 웨이크 지원 차량용 트랜시버 선택(절전)', 'LIN 마스터 단은 풀업 저항+다이오드, 슬레이브는 불필요'],
        commonMistakes: ['종단 오류(각 노드나 누락) → 반사·통신 오류', 'CANH/CANL 비등장/비제어 → CAN-FD 고속 실패', '공통 모드 초크/TVS 없음 → EMC 탈락·과도로 트랜시버 파손', '스터브 너무 김 → CAN-FD 데이터 단 비트 오류']
      }
    },
    'auto-power-arch': {
      en: {
        principles: 'A typical automotive chain: battery -> reverse protection -> EMI filter -> pre-regulator -> POL step-down -> loads. The pre-regulator turns a 6-40V messy input into a stable mid rail (5V/3.3V): during cold-crank sag it boosts (or buck-boost) to hold up, during load dump it clamps and bucks down. Integrated automotive pre-regulators (e.g. LM5xxx-Q1) often combine boost+buck or a wide-input buck-boost. Downstream POLs each step down to core/IO/analog rails. The whole chain needs low quiescent current (some circuits stay on when parked, or it drains the battery).',
        keyFormulas: ['Pre-regulator input range must cover 6V (cold crank) to 40V (load dump)', 'Cold crank -> boost/buck-boost holds the mid rail', 'Load dump -> clamp + buck steps down', 'Standby quiescent current must be tiny (fears draining the battery, microamps)'],
        designNotes: ['Front stage: wide-input buck-boost or cascaded boost+buck', 'Must ride through cold crank (system cannot reset at engine start)', 'Keep POLs near loads with adequate decoupling', 'Keep always-on (KL30) path quiescent current very low', 'EMI filter at the very front (automotive conducted EMC is strict)', 'Whole chain automotive AEC-Q + functional safety (if safety-related)'],
        commonMistakes: ['Insufficient pre-regulator input range: fails at cold crank or load dump', 'High standby quiescent current: a few days parked drains the battery', 'POLs far from loads: droop, poor transient', 'Insufficient EMI filtering: conducted emission over limit, fails certification']
      },
      ja: {
        principles: '車載電源鎖の典型：電池 → 逆接続保護 → EMI フィルタ → プリレギュレータ → POL 降圧 → 負荷。プリレギュレータは 6~40V の乱れた入力を安定中間レール（5V/3.3V）に：コールドクランク低下時は昇圧（や昇降圧）で維持、ロードダンプ高電圧時はクランプ＋降圧。統合型車載プリレギュレータ（LM5xxx-Q1 等）は昇圧+降圧や広入力昇降圧を含む。下流 POL が各々コア/IO/アナログレールへ降圧。全鎖に低静止電流が必要（駐車時も一部給電、電池消耗を怖れる）。',
        keyFormulas: ['プリレギュレータ入力範囲は 6V（コールドクランク）~40V（ロードダンプ）を網羅', 'コールドクランク → 昇圧/昇降圧で中間レール維持', 'ロードダンプ → クランプ + 降圧', '待機静止電流は極小（電池消耗を怖れ µA 級）'],
        designNotes: ['前段は広入力昇降圧か昇圧+降圧の縦続', 'コールドクランクを乗り切る（エンジン始動時に再起動不可）', 'POL は負荷近くにデカップリング十分', '常時給電（KL30）経路の静止電流を極低に', 'EMI フィルタを最前に（車載伝導 EMC は厳格）', '全鎖に車載 AEC-Q + 機能安全（安全関連なら）'],
        commonMistakes: ['プリレギュレータ入力範囲不足 → コールドクランクやロードダンプで停止', '待機静止電流大 → 数日駐車で電池を吸い尽くす', 'POL が負荷から遠い → ドループ・過渡悪', 'EMI フィルタ不足 → 伝導発射超過・認証失敗']
      },
      ko: {
        principles: '차량 전원 체인의 전형: 배터리 → 역접속 보호 → EMI 필터 → 프리레귤레이터 → POL 강압 → 부하. 프리레귤레이터는 6~40V의 지저분한 입력을 안정 중간 레일(5V/3.3V)로: 콜드 크랭크 강하 시 승압(이나 승강압)으로 유지, 로드 덤프 고전압 시 클램프+강압. 통합형 차량용 프리레귤레이터(LM5xxx-Q1 등)는 승압+강압이나 광입력 승강압 포함. 하류 POL이 각각 코어/IO/아날로그 레일로 강압. 전 체인에 낮은 정지 전류 필요(주차 시도 일부 급전, 배터리 소모 우려).',
        keyFormulas: ['프리레귤레이터 입력 범위는 6V(콜드 크랭크)~40V(로드 덤프) 커버', '콜드 크랭크 → 승압/승강압으로 중간 레일 유지', '로드 덤프 → 클램프 + 강압', '대기 정지 전류는 극소(배터리 소모 우려 µA급)'],
        designNotes: ['전단은 광입력 승강압이나 승압+강압 캐스케이드', '콜드 크랭크를 견딤(엔진 시동 시 재시작 불가)', 'POL은 부하 근처에 디커플링 충분히', '상시 급전(KL30) 경로 정지 전류를 극저로', 'EMI 필터를 최전단에(차량 전도 EMC는 엄격)', '전 체인에 차량용 AEC-Q + 기능 안전(안전 관련이면)'],
        commonMistakes: ['프리레귤레이터 입력 범위 부족 → 콜드 크랭크나 로드 덤프에서 정지', '대기 정지 전류 큼 → 며칠 주차로 배터리 소진', 'POL이 부하에서 멂 → 드룹·과도 나쁨', 'EMI 필터 부족 → 전도 방사 초과·인증 실패']
      }
    },
    'aec-q100': {
      en: {
        principles: 'AEC-Q100 is a stress-test qualification for automotive ICs: temperature grades (Grade 0 -40 to 150C, Grade 1 -40 to 125C...) and a battery of reliability tests (temp cycling, HTOL high-temp operating life, humidity, ESD, latch-up...). Q101 is discretes, Q200 is passives. Passing only means the part is qualified. If a system is safety-related (braking, steering, battery management) it follows ISO 26262 functional safety: an ASIL level (A-D, D strictest) set by hazard/risk, requiring safety mechanisms (diagnostic coverage, fault detection, safe state), redundancy and reliability math (FIT/FMEDA). Automakers also demand PPAP / zero-defect quality.',
        keyFormulas: ['AEC-Q100 Grade 0: -40 to 150C; Grade 1: -40 to 125C', 'ASIL levels A<B<C<D (D strictest, e.g. braking/steering)', 'FIT = failures per 10^9 hours (reliability metric)', 'Diagnostic coverage DC%: fraction of faults the safety mechanism detects'],
        designNotes: ['Choose AEC-Q100 ICs, Q200 passives, Q101 discretes', 'Match temperature grade to the real environment (engine bay needs Grade 0/1)', 'Set ASIL per ISO 26262 for safety functions and design safety mechanisms', 'Add diagnostics/redundancy on critical signals (e.g. dual-channel measurement compare)', 'Do FMEDA to compute failure rate and verify diagnostic coverage', 'Suppliers must provide automotive docs (PPAP, reliability reports)'],
        commonMistakes: ['Commercial/industrial parts in a car: early failure at high temp or over life', 'Temperature grade too low (Grade 2 in the engine bay): overheating failure', 'Safety system without functional safety: qualification/liability problems', 'Ignoring diagnostic coverage: latent faults accumulate undetected']
      },
      ja: {
        principles: 'AEC-Q100 は車載 IC のストレス試験認証：温度グレード（Grade 0 -40~150℃、Grade 1 -40~125℃…）と一連の信頼性試験（温度サイクル、HTOL 高温動作寿命、湿度、ESD、ラッチアップ…）。Q101=分立、Q200=受動部品。合格は「部品が適格」なだけ。安全関連（ブレーキ、操舵、電池管理）なら ISO 26262 機能安全：危険/リスクで ASIL（A~D、D 最厳）を定め、安全機構（診断カバレッジ、故障検出、安全状態）、冗長、信頼性計算（FIT/FMEDA）を要求。自動車メーカは PPAP/ゼロ欠陥品質も要求。',
        keyFormulas: ['AEC-Q100 Grade 0：-40~150℃、Grade 1：-40~125℃', 'ASIL レベル A<B<C<D（D 最厳、ブレーキ/操舵等）', 'FIT = 10⁹ 時間あたり故障数（信頼性指標）', '診断カバレッジ DC%：安全機構が検出できる故障の割合'],
        designNotes: ['IC は AEC-Q100、受動は Q200、分立は Q101 を選ぶ', '温度グレードを実環境に合わせる（エンジンルームは Grade 0/1）', '安全機能は ISO 26262 で ASIL を定め安全機構を設計', '重要信号に診断/冗長（二重チャネル測定比較等）', 'FMEDA で故障率を計算し診断カバレッジを検証', 'サプライヤは車載文書（PPAP、信頼性報告）提供必須'],
        commonMistakes: ['商用/工業部品を車載 → 高温や寿命で早期故障', '温度グレード不足（エンジンルームに Grade 2）→ 過熱故障', '安全システムに機能安全なし → 認証/責任問題', '診断カバレッジ無視 → 潜在故障が検出されず蓄積']
      },
      ko: {
        principles: 'AEC-Q100은 차량용 IC의 스트레스 시험 인증: 온도 등급(Grade 0 -40~150℃, Grade 1 -40~125℃…)과 일련의 신뢰성 시험(온도 사이클, HTOL 고온 동작 수명, 습도, ESD, 래치업…). Q101=분리 부품, Q200=수동 부품. 합격은 "부품이 적격"일 뿐. 안전 관련(제동, 조향, 배터리 관리)이면 ISO 26262 기능 안전: 위험/리스크로 ASIL(A~D, D 최엄)을 정하고 안전 메커니즘(진단 커버리지, 고장 검출, 안전 상태), 중복, 신뢰성 계산(FIT/FMEDA) 요구. 완성차 업체는 PPAP/무결점 품질도 요구.',
        keyFormulas: ['AEC-Q100 Grade 0: -40~150℃, Grade 1: -40~125℃', 'ASIL 등급 A<B<C<D(D 최엄, 제동/조향 등)', 'FIT = 10⁹ 시간당 고장 수(신뢰성 지표)', '진단 커버리지 DC%: 안전 메커니즘이 검출 가능한 고장 비율'],
        designNotes: ['IC는 AEC-Q100, 수동은 Q200, 분리 부품은 Q101 선택', '온도 등급을 실제 환경에 맞춤(엔진룸은 Grade 0/1)', '안전 기능은 ISO 26262로 ASIL 정하고 안전 메커니즘 설계', '중요 신호에 진단/중복(이중 채널 측정 비교 등)', 'FMEDA로 고장률 계산하고 진단 커버리지 검증', '공급사는 차량용 문서(PPAP, 신뢰성 보고) 제공 필수'],
        commonMistakes: ['상용/산업 부품을 차량에 → 고온이나 수명에서 조기 고장', '온도 등급 부족(엔진룸에 Grade 2) → 과열 고장', '안전 시스템에 기능 안전 없음 → 인증/책임 문제', '진단 커버리지 무시 → 잠재 고장이 검출 안 되고 누적']
      }
    },
    // ===== AI 伺服器 AI Server =====
    'vrm-multiphase': {
      en: {
        principles: 'Core supply (VRM/VRD): the SoC needs 0.7-1.1V at hundreds of amps with huge load transients (current jumps when compute load hits). Multiphase buck: N power stages (a MOSFET pair + inductor each) in parallel, PWM phases interleaved (360/N degrees). Benefits: (1) current sharing (each phase carries total/N); (2) input/output ripple cancels by interleaving; (3) heat spreads. The controller (multiphase PWM + DrMOS smart power stages) does current balancing (per-phase feedback), DVID (dynamic voltage per CPU command), a load line (AVP: an effective resistance to tolerate transients), and PMBus telemetry. GPU/AI-accelerator cores are the same but with more phases.',
        keyFormulas: ['Per-phase current = total current / phase count N', 'Interleave phase = 360 / N (ripple cancellation)', 'Load line AVP: Vout = Vset - I x R_LL (transient tolerance)', 'Transient decoupling: low ESR/ESL cap array supplies instant current'],
        designNotes: ['Set phase count by total current (per-stage current limit)', 'Lay out each phase inductor/power stage symmetrically for current balance', 'DrMOS smart stage integrates driver + high/low FETs + temperature report', 'Output decoupling cap array (MLCC near the core + bulk cap)', 'PMBus to the BMC for telemetry and power management', 'Set the load line right so transient droop stays in spec', 'GPU/accelerators need more phases and tighter layout (power density)'],
        commonMistakes: ['Too few phases: per-phase overcurrent, overheating, lower efficiency', 'Asymmetric phase layout: unbalanced current, one phase burns first', 'Insufficient output decoupling: transient droop out of spec, core hangs', 'Wrong load-line setting: transient undervolt or steady-state overvolt']
      },
      ja: {
        principles: 'コア電源（VRM/VRD）：SoC は 0.7-1.1V で数百 A、負荷過渡が極大（演算負荷で電流急変）。マルチフェーズ buck：N 個の電力段（MOSFET 対＋インダクタ各）を並列、PWM 位相を交錯（360/N 度）。利点：①電流分担（各相 総電流/N）②交錯で入出力リプル相殺③発熱分散。コントローラ（マルチフェーズ PWM＋DrMOS スマート電力段）が電流均衡（各相帰還）、DVID（CPU 命令で動的電圧）、負荷線（AVP：過渡許容の等価抵抗）、PMBus 遥測。GPU/AI アクセラレータも同様だが相数増。',
        keyFormulas: ['各相電流 = 総電流 / 相数 N', '交錯位相 = 360 / N（リプル相殺）', '負荷線 AVP：Vout = Vset - I×R_LL（過渡許容）', '過渡デカップリング：低 ESR/ESL コンデンサ列が瞬時電流供給'],
        designNotes: ['相数は総電流で決める（各段の電流上限）', '各相のインダクタ/電力段を対称配置し電流均衡', 'DrMOS スマート段はドライバ＋上下 FET＋温度報告を統合', '出力デカップリングコンデンサ列（コア近傍 MLCC＋バルク）', 'PMBus を BMC へ遥測と電源管理', '負荷線を正しく設定し過渡ドループを規格内に', 'GPU/アクセラレータは相数増・配置厳格（電力密度）'],
        commonMistakes: ['相数不足 → 各相過電流・過熱・効率低下', '各相配置が非対称 → 電流不均衡・ある相が先に焼損', '出力デカップリング不足 → 過渡ドループ規格外・コアハング', '負荷線設定誤り → 過渡低電圧や定常過電圧']
      },
      ko: {
        principles: '코어 전원(VRM/VRD): SoC는 0.7-1.1V에 수백 A, 부하 과도가 극대(연산 부하 시 전류 급변). 멀티페이즈 buck: N개 전력단(MOSFET 쌍+인덕터 각) 병렬, PWM 위상 교차(360/N도). 이점: ①전류 분담(각 상 총전류/N) ②교차로 입출력 리플 상쇄 ③발열 분산. 컨트롤러(멀티페이즈 PWM+DrMOS 스마트 전력단)가 전류 균형(각 상 피드백), DVID(CPU 명령으로 동적 전압), 로드 라인(AVP: 과도 허용 등가 저항), PMBus 텔레메트리. GPU/AI 가속기도 동일하나 상 수 증가.',
        keyFormulas: ['각 상 전류 = 총전류 / 상 수 N', '교차 위상 = 360 / N(리플 상쇄)', '로드 라인 AVP: Vout = Vset - I×R_LL(과도 허용)', '과도 디커플링: 낮은 ESR/ESL 커패시터 어레이가 순간 전류 공급'],
        designNotes: ['상 수는 총전류로 결정(각 단 전류 상한)', '각 상 인덕터/전력단을 대칭 배치해 전류 균형', 'DrMOS 스마트 단은 드라이버+상하 FET+온도 보고 통합', '출력 디커플링 커패시터 어레이(코어 근처 MLCC+벌크)', 'PMBus를 BMC로 텔레메트리와 전원 관리', '로드 라인을 올바로 설정해 과도 드룹을 규격 내로', 'GPU/가속기는 상 수 증가·배치 엄격(전력 밀도)'],
        commonMistakes: ['상 수 부족 → 각 상 과전류·과열·효율 저하', '각 상 배치 비대칭 → 전류 불균형·한 상이 먼저 소손', '출력 디커플링 부족 → 과도 드룹 규격 밖·코어 행', '로드 라인 설정 오류 → 과도 저전압이나 정상 과전압']
      }
    },
    'server-48v-power': {
      en: {
        principles: 'At the same power, 4x voltage means 1/4 current means 1/16 I2R loss, so high-power racks moved to a 48V distribution bus (from data-center OCP standards) and step down to the core. Two approaches: (1) two-stage: 48V->12V (a high-efficiency intermediate bus converter IBC, often a fixed ratio like 4:1 LLC) then 12V->core multiphase VRM; (2) single-stage direct: 48V straight to ~0.8V with a dedicated converter (hybrid / switched-cap + buck), saving a stage of loss and putting power closer to the GPU. Vertical power delivery (VPD: power stages under/behind the GPU) further shortens the PDN path to lower impedance.',
        keyFormulas: ['Same power: voltage x4 -> current /4 -> I2R loss /16', 'IBC common fixed ratio 4:1 (48V->12V)', 'Single-stage 48V->core saves a conversion stage of loss', 'VPD vertical delivery: PDN impedance drops sharply (short path)'],
        designNotes: ['48V bus distribution cuts I2R loss (a must for dense racks)', 'Intermediate bus converter (IBC) uses LLC/fixed-ratio for efficiency', 'Single-stage direct puts power closer to the GPU, one less loss stage', 'Vertical delivery places power stages right under the core, shortening the PDN', '48V insulation/safety considerations (higher than 12V)', 'Thermal: high power density needs liquid cooling'],
        commonMistakes: ['High power still on a 12V bus: big I2R loss, copper heating', 'Low IBC efficiency: two-stage losses stack up', 'Long core-supply path: high PDN impedance, poor transient', 'Ignoring 48V insulation/safety: certification problems']
      },
      ja: {
        principles: '同電力で電圧×4→電流÷4→I2R 損失÷16、ゆえに高電力ラックは 48V 配電バス（データセンタ OCP 標準由来）に移行しコアへ降圧。二方式：①二段：48V→12V（高効率中間バスコンバータ IBC、4:1 LLC 等固定比が多い）→12V→コアのマルチフェーズ VRM②単段直降：48V を専用コンバータ（ハイブリッド/スイッチトキャパ+buck）で ~0.8V へ直接、一段の損失削減で給電が GPU に近い。垂直給電（VPD：電力段を GPU 直下/背面）で PDN 経路を更に短縮し低インピーダンス化。',
        keyFormulas: ['同電力：電圧×4 → 電流÷4 → I2R 損失÷16', 'IBC 固定比 4:1 が一般（48V→12V）', '単段 48V→コアは一段の変換損失削減', 'VPD 垂直給電：PDN インピーダンス大幅低下（経路短）'],
        designNotes: ['48V バス配電で I2R 損失削減（高密度ラック必須）', '中間バスコンバータ（IBC）は LLC/固定比で高効率', '単段直降は給電が GPU に近く一段少ない損失', '垂直給電は電力段をコア直下に置き PDN 短縮', '48V 絶縁/安全考慮（12V より高圧）', '熱：高電力密度は液冷が必要'],
        commonMistakes: ['高電力で 12V バスのまま → I2R 損失大・銅損発熱', 'IBC 効率不足 → 二段損失が積算', 'コア給電経路が長い → PDN インピーダンス高・過渡悪', '48V 絶縁/安全無視 → 認証問題']
      },
      ko: {
        principles: '같은 전력에서 전압×4→전류÷4→I2R 손실÷16, 그래서 고전력 랙은 48V 배전 버스(데이터센터 OCP 표준 유래)로 전환하고 코어로 강압. 두 방식: ①2단: 48V→12V(고효율 중간 버스 컨버터 IBC, 4:1 LLC 등 고정 비 많음)→12V→코어 멀티페이즈 VRM ②단단 직강: 48V를 전용 컨버터(하이브리드/스위치드 캡+buck)로 ~0.8V로 직접, 한 단 손실 감소로 급전이 GPU에 가까움. 수직 급전(VPD: 전력단을 GPU 바로 아래/뒷면)으로 PDN 경로를 더 단축해 저임피던스화.',
        keyFormulas: ['같은 전력: 전압×4 → 전류÷4 → I2R 손실÷16', 'IBC 고정 비 4:1 일반(48V→12V)', '단단 48V→코어는 한 단 변환 손실 감소', 'VPD 수직 급전: PDN 임피던스 대폭 저하(경로 짧음)'],
        designNotes: ['48V 버스 배전으로 I2R 손실 감소(고밀도 랙 필수)', '중간 버스 컨버터(IBC)는 LLC/고정 비로 고효율', '단단 직강은 급전이 GPU에 가깝고 한 단 적은 손실', '수직 급전은 전력단을 코어 바로 아래에 두어 PDN 단축', '48V 절연/안전 고려(12V보다 고전압)', '발열: 고전력 밀도는 액랭 필요'],
        commonMistakes: ['고전력에 12V 버스 그대로 → I2R 손실 큼·구리 손실 발열', 'IBC 효율 부족 → 2단 손실 누적', '코어 급전 경로가 긺 → PDN 임피던스 높고 과도 나쁨', '48V 절연/안전 무시 → 인증 문제']
      }
    },
    'pmbus-telemetry': {
      en: {
        principles: 'PMBus (Power Management Bus) runs on SMBus/I2C with a standard command set for a host (BMC/CPLD) to manage power ICs: telemetry (READ_VOUT/IOUT/TEMPERATURE/POUT), settings (VOUT_COMMAND to trim voltage, alarm thresholds), control (OPERATION to switch rails, margin testing) and status (a STATUS register reporting OV/OC/OT/fault). In a server every important rail (VRM, IBC, hot-swap, PSU) is on PMBus; the BMC polls to build a full power and health map, doing power capping, fault warning and remote management. AVSBus is a faster variant for dynamic voltage. Watch bus addressing, multi-device capacitance and pull-ups.',
        keyFormulas: ['PMBus runs on I2C/SMBus (<=400kHz/1MHz)', 'READ_* commands return telemetry (linear/direct format)', 'VOUT_COMMAND does dynamic voltage', 'STATUS register: OV/OC/OT/PGOOD/fault bits'],
        designNotes: ['Plan each PMBus device address to avoid conflict (address pins/resistor coding)', 'Keep total bus capacitance <= I2C limit; choose pull-ups right (see I2C)', 'Balance BMC poll rate against bus load', 'ALERT# line (open-drain) lets devices report faults actively (no waiting on polling)', 'Set STATUS/alarm thresholds on critical rails so faults warn early', 'AVSBus for cores that need fast dynamic voltage'],
        commonMistakes: ['PMBus address conflict: telemetry reads the wrong device', 'Bus capacitance over limit / wrong pull-up: unstable comms', 'Only polling, no ALERT#: slow fault response', 'Wrong telemetry format (linear/direct) decode: all values wrong']
      },
      ja: {
        principles: 'PMBus（Power Management Bus）は SMBus/I2C 上で標準コマンド集を使い、ホスト（BMC/CPLD）が電源 IC を管理：遥測（READ_VOUT/IOUT/TEMPERATURE/POUT）、設定（VOUT_COMMAND で電圧調整、閾値）、制御（OPERATION でレール開閉、マージンテスト）、状態（STATUS レジスタが OV/OC/OT/fault 報告）。サーバは各重要レール（VRM、IBC、hot-swap、PSU）が PMBus 接続、BMC がポーリングし全機の電力/健康図を構築、電力封頂、故障予警、遠隔管理。AVSBus は高速動的電圧の変種。バスアドレス、多装置容量、上拉に注意。',
        keyFormulas: ['PMBus は I2C/SMBus 上（≤400kHz/1MHz）', 'READ_* コマンドが遥測値を返す（linear/direct 形式）', 'VOUT_COMMAND で動的電圧', 'STATUS レジスタ：OV/OC/OT/PGOOD/fault ビット'],
        designNotes: ['各 PMBus 装置アドレスを衝突しないよう計画（アドレスピン/抵抗符号）', 'バス総容量を I2C 上限以内に、上拉を正しく（I2C 参照）', 'BMC ポーリング頻度を即時性とバス負荷で両立', 'ALERT# 線（オープンドレイン）で装置が能動的に故障報告（ポーリング待ち不要）', '重要レールの STATUS/閾値を設定し故障を予警', '高速動的電圧が要るコアは AVSBus'],
        commonMistakes: ['PMBus アドレス衝突 → 別装置の遥測を読む', 'バス容量超過/上拉誤り → 通信不安定', 'ポーリングのみで ALERT# なし → 故障反応が遅い', '遥測形式（linear/direct）復号誤り → 数値全て誤り']
      },
      ko: {
        principles: 'PMBus(Power Management Bus)는 SMBus/I2C 위에서 표준 명령 집합으로 호스트(BMC/CPLD)가 전원 IC를 관리: 텔레메트리(READ_VOUT/IOUT/TEMPERATURE/POUT), 설정(VOUT_COMMAND로 전압 조정, 임계값), 제어(OPERATION으로 레일 개폐, 마진 테스트), 상태(STATUS 레지스터가 OV/OC/OT/fault 보고). 서버는 각 중요 레일(VRM, IBC, hot-swap, PSU)이 PMBus 연결, BMC가 폴링해 전기의 전력/건강 맵을 구축, 전력 상한, 고장 예경, 원격 관리. AVSBus는 고속 동적 전압 변종. 버스 주소, 다장치 커패시턴스, 풀업 주의.',
        keyFormulas: ['PMBus는 I2C/SMBus 위(≤400kHz/1MHz)', 'READ_* 명령이 텔레메트리 값 반환(linear/direct 형식)', 'VOUT_COMMAND로 동적 전압', 'STATUS 레지스터: OV/OC/OT/PGOOD/fault 비트'],
        designNotes: ['각 PMBus 장치 주소를 충돌하지 않게 계획(주소 핀/저항 코딩)', '버스 총 커패시턴스를 I2C 상한 이내로, 풀업을 올바로(I2C 참조)', 'BMC 폴링 빈도를 즉시성과 버스 부하로 절충', 'ALERT# 선(오픈 드레인)으로 장치가 능동적 고장 보고(폴링 대기 불필요)', '중요 레일의 STATUS/임계값 설정해 고장 예경', '고속 동적 전압이 필요한 코어는 AVSBus'],
        commonMistakes: ['PMBus 주소 충돌 → 다른 장치의 텔레메트리를 읽음', '버스 커패시턴스 초과/풀업 오류 → 통신 불안정', '폴링만 하고 ALERT# 없음 → 고장 반응 느림', '텔레메트리 형식(linear/direct) 디코딩 오류 → 값 전부 틀림']
      }
    },
    'retimer-redriver': {
      en: {
        principles: 'High-speed SerDes signals lose amplitude over PCB/connectors/cables (dielectric loss proportional to frequency), closing the eye. Two fixes: (1) redriver (analog) - equalizes channel loss (CTLE) and re-drives, without regenerating clock; low latency, low cost, but does not remove accumulated jitter and extends distance only so far; (2) retimer (digital) - contains a CDR (clock-data recovery) that fully recovers data and regenerates a clean clock and signal (re-times), letting up/downstream channels equalize independently, removing jitter and reaching further, but with higher latency/cost and PCIe needs protocol awareness. AI servers use retimers widely for GPU-to-GPU, GPU-to-switch and long backplanes. Placement (channel midpoint) and count follow the channel budget.',
        keyFormulas: ['Channel loss proportional to frequency (Gen5 32GT/s, Gen6 64GT/s stricter)', 'Redriver: analog equalization, no clock regen (low latency)', 'Retimer: CDR regenerates clock, removes jitter (reaches further)', 'Placement per channel insertion-loss budget'],
        designNotes: ['Do the channel-loss budget first to decide redriver vs retimer and count', 'Place the retimer at the channel loss midpoint (half up/down)', 'PCIe retimers must be protocol-aware (LTSSM, equalization handshake)', 'Keep the retimer/redriver supply clean and well decoupled', 'Align the reference-clock architecture (common vs separate ref clock)', 'Route diff pairs with strict controlled impedance, length match, few vias'],
        commonMistakes: ['Loss over budget without a retimer: link training fails or downshifts', 'Redriver forcing a long channel: jitter accumulates, bit errors', 'Retimer in the wrong spot: unequal up/down loss, undercompensated', 'Bad diff-pair routing: no retimer count can recover it']
      },
      ja: {
        principles: '高速 SerDes 信号は PCB/コネクタ/ケーブルで振幅減衰（誘電損失 ∝ 周波数）、アイが閉じる。二つの修復：①リドライバ（アナログ）——等化器（CTLE）で通道損失を補償し再駆動、クロック再生せず、低遅延・低コストだが蓄積ジッタを消せず延伸距離に限り②リタイマ（デジタル）——CDR（クロックデータ回復）でデータを完全回復しクリーンなクロックと信号を再生（再計時）、上下流通道を独立等化・ジッタ除去・更に延伸、但し遅延/コスト高・PCIe はプロトコル認識要。AI サーバは GPU 間・GPU-スイッチ・長バックプレーンで広くリタイマ使用。配置（通道中点）と数は通道予算で決める。',
        keyFormulas: ['通道損失 ∝ 周波数（Gen5 32GT/s、Gen6 64GT/s 更厳）', 'リドライバ：アナログ等化、クロック再生なし（低遅延）', 'リタイマ：CDR がクロック再生・ジッタ除去（更に延伸）', '配置は通道挿入損失予算で算出'],
        designNotes: ['先に通道損失予算を行いリドライバかリタイマかと数を決める', 'リタイマを通道損失の中点に配置（上下流各半）', 'PCIe リタイマはプロトコル認識要（LTSSM、等化握手）', 'リタイマ/リドライバ自身の電源を清浄・十分デカップリング', '参照クロック構成を揃える（common/separate ref clock）', '差動対を厳密制御インピーダンス・等長・ビア少で配線'],
        commonMistakes: ['損失予算超過でリタイマ未追加 → リンク訓練失敗/降速', 'リドライバで長通道を無理押し → ジッタ蓄積・誤り', 'リタイマ配置誤り → 上下流損失不均・補償不足', '差動対配線が悪い → リタイマ何個でも救えない']
      },
      ko: {
        principles: '고속 SerDes 신호는 PCB/커넥터/케이블에서 진폭 감쇠(유전 손실 ∝ 주파수), 아이가 닫힘. 두 가지 수복: ①리드라이버(아날로그) - 등화기(CTLE)로 채널 손실을 보상하고 재구동, 클럭 재생 안 함; 저지연·저비용이나 누적 지터를 못 없애고 연장 거리에 한계 ②리타이머(디지털) - CDR(클럭 데이터 복원)로 데이터를 완전 복원하고 깨끗한 클럭과 신호를 재생(재계시), 상하류 채널을 독립 등화·지터 제거·더 멀리, 단 지연/비용 높고 PCIe는 프로토콜 인식 필요. AI 서버는 GPU 간·GPU-스위치·긴 백플레인에 리타이머 널리 사용. 배치(채널 중점)와 수는 채널 예산으로 결정.',
        keyFormulas: ['채널 손실 ∝ 주파수(Gen5 32GT/s, Gen6 64GT/s 더 엄격)', '리드라이버: 아날로그 등화, 클럭 재생 없음(저지연)', '리타이머: CDR이 클럭 재생·지터 제거(더 멀리)', '배치는 채널 삽입 손실 예산으로 산출'],
        designNotes: ['먼저 채널 손실 예산으로 리드라이버냐 리타이머냐와 수를 결정', '리타이머를 채널 손실 중점에 배치(상하류 각 절반)', 'PCIe 리타이머는 프로토콜 인식 필요(LTSSM, 등화 핸드셰이크)', '리타이머/리드라이버 자체 전원을 깨끗이·충분히 디커플링', '기준 클럭 구성을 일치(common/separate ref clock)', '차동쌍을 엄격 제어 임피던스·등장·비아 적게 배선'],
        commonMistakes: ['손실 예산 초과인데 리타이머 미추가 → 링크 훈련 실패/감속', '리드라이버로 긴 채널 강행 → 지터 누적·오류', '리타이머 배치 오류 → 상하류 손실 불균·보상 부족', '차동쌍 배선 나쁨 → 리타이머 몇 개라도 못 살림']
      }
    },
    'hbm-power-decoupling': {
      en: {
        principles: 'HBM sits beside the GPU on a silicon interposer, connected by thousands of microbumps (a very wide bus at low per-pin rate). Thousands of I/Os switching at once make huge SSN (simultaneous switching noise) and transient current, at frequencies where PCB-level decoupling caps are too slow (parasitic inductance). So decoupling is layered: high-frequency caps on the package/interposer (silicon caps / deep-trench caps) for the highest-frequency transient, package-substrate caps for mid frequency, PCB MLCC for low frequency and bulk. The supply rails (VDDQ etc.) need a low-impedance PDN; the impedance-vs-frequency of each cap layer must join with no gaps (or an impedance peak at that band causes droop). Heat is also a problem (stacked memory dissipates poorly, needs a shared GPU cooling scheme).',
        keyFormulas: ['Thousands of I/Os switching at once -> huge SSN/transient current', 'Cap frequency bands: silicon cap (highest) -> substrate -> PCB MLCC -> bulk', 'PDN target impedance = allowed droop / transient current', 'Cap layer impedances must join with no gaps (avoid an impedance peak)'],
        designNotes: ['Layer decoupling: interposer/package silicon caps for highest freq, PCB for low freq', 'Keep PDN impedance low across frequency with no peak (cap layers join)', 'Route VDDQ etc. on low-impedance planes', 'Manage HBM heat with the GPU (2.5D dissipates poorly)', 'This is done at package/interposer level; the PCB engineer handles the supply entry', 'Control SSN with a wide low-rate bus + close decoupling'],
        commonMistakes: ['Relying only on PCB caps: high-frequency parasitic inductance is too slow, transient droop', 'A PDN impedance peak at some band: insufficient supply there, bit errors', 'High-impedance VDDQ plane: undervolts under big transients', 'Ignoring HBM cooling: memory overheats, downclocks or errors']
      },
      ja: {
        principles: 'HBM はシリコンインターポーザで GPU 隣に配置、数千のマイクロバンプ（極広バス・低単ピンレート）で接続。数千 I/O 同時遷移で SSN（同時スイッチング雑音）と過渡電流が巨大、PCB 級デカップリングコンデンサの寄生インダクタンスが間に合わない周波数。ゆえにデカップリングを階層化：パッケージ/インターポーザ上の高周波コンデンサ（シリコンコンデンサ/深溝コンデンサ）が最高周波過渡、基板コンデンサが中周波、PCB MLCC が低周波とバルク。供給レール（VDDQ 等）は低インピーダンス PDN が必要、各層コンデンサの impedance vs frequency が隙間なく接続（さもないと該帯域のインピーダンス尖峰→ドループ）。熱も問題（積層メモリは放熱悪、GPU と共通散熱要）。',
        keyFormulas: ['数千 I/O 同時遷移 → SSN/過渡電流巨大', 'コンデンサ帯域：シリコン(最高周波)→基板→PCB MLCC→バルク', 'PDN 目標インピーダンス = 許容ドループ / 過渡電流', '各層コンデンサ impedance を隙間なく接続（インピーダンス尖峰回避）'],
        designNotes: ['デカップリング階層化：インターポーザ/パッケージシリコンが最高周波、PCB が低周波', 'PDN インピーダンスを全周波で低く尖峰なし（各層接続）', 'VDDQ 等の供給レールを低インピーダンス面に', 'HBM 熱を GPU と一緒に管理（2.5D 放熱悪）', 'この層はパッケージ/インターポーザ設計、PCB 技術者は供給入口を担当', 'SSN 制御は広低速バス＋近接デカップリング'],
        commonMistakes: ['PCB コンデンサのみ頼る → 高周波寄生インダクタンス遅く過渡ドループ', 'PDN インピーダンスがある帯域で尖峰 → 該帯域供給不足・誤り', 'VDDQ 面が高インピーダンス → 大過渡で低電圧', 'HBM 散熱無視 → メモリ過熱・降速/エラー']
      },
      ko: {
        principles: 'HBM은 실리콘 인터포저로 GPU 옆에 배치, 수천 개 마이크로범프(매우 넓은 버스·낮은 핀당 속도)로 연결. 수천 I/O 동시 전환으로 SSN(동시 스위칭 잡음)과 과도 전류가 막대, PCB급 디커플링 커패시터의 기생 인덕턴스가 못 따라가는 주파수. 그래서 디커플링을 계층화: 패키지/인터포저 위의 고주파 커패시터(실리콘 커패시터/딥 트렌치 커패시터)가 최고 주파 과도, 기판 커패시터가 중주파, PCB MLCC가 저주파와 벌크. 공급 레일(VDDQ 등)은 저임피던스 PDN 필요, 각 층 커패시터의 임피던스-주파수가 틈 없이 연결(아니면 해당 대역 임피던스 피크→드룹). 발열도 문제(적층 메모리 방열 나쁨, GPU와 공동 방열 필요).',
        keyFormulas: ['수천 I/O 동시 전환 → SSN/과도 전류 막대', '커패시터 대역: 실리콘(최고 주파)→기판→PCB MLCC→벌크', 'PDN 목표 임피던스 = 허용 드룹 / 과도 전류', '각 층 커패시터 임피던스를 틈 없이 연결(임피던스 피크 회피)'],
        designNotes: ['디커플링 계층화: 인터포저/패키지 실리콘이 최고 주파, PCB가 저주파', 'PDN 임피던스를 전 주파에서 낮게 피크 없이(각 층 연결)', 'VDDQ 등 공급 레일을 저임피던스 평면에', 'HBM 발열을 GPU와 함께 관리(2.5D 방열 나쁨)', '이 층은 패키지/인터포저 설계, PCB 엔지니어는 공급 입구 담당', 'SSN 제어는 넓은 저속 버스+근접 디커플링'],
        commonMistakes: ['PCB 커패시터에만 의존 → 고주파 기생 인덕턴스가 느려 과도 드룹', 'PDN 임피던스가 어떤 대역에서 피크 → 해당 대역 공급 부족·오류', 'VDDQ 평면이 고임피던스 → 큰 과도에서 저전압', 'HBM 방열 무시 → 메모리 과열·감속/오류']
      }
    },
    // ===== 筆電 Laptop =====
    'laptop-battery-charger': {
      en: {
        principles: 'Laptop batteries are multi-cell (2-4S, Vbat 7-17V dynamic) with varied inputs (USB-C PD 5-20V, 20V adapter). The input can be above or below the battery, so the charger must be buck-boost (four-switch). NVDC (Narrow VDC): the charger output feeds the system rail (VSYS), with the battery on that node through a FET - at light load the charger supplies the system and charges; at heavy load beyond the input capability the battery supplements current (battery boost/turbo), and VSYS is clamped near the battery in a narrow range so downstream DC-DCs are easy to design. The charger IC handles input-current limiting (not exceeding the adapter/PD capability), the charge curve (CC/CV), battery authentication and negotiation with the EC/PD.',
        keyFormulas: ['Input can be > or < Vbat -> must be buck-boost (four-switch)', 'NVDC: VSYS clamped in a narrow range near Vbat', 'Input current limit <= negotiated adapter/PD capability', 'Heavy load over input -> battery supplements current (turbo boost)'],
        designNotes: ['Use a buck-boost charger (covers input above/below the battery)', 'NVDC architecture lets the charger also supply the system, narrow VSYS range', 'Set the input current limit right (do not exceed the PD negotiation, or it collapses/trips)', 'Coordinate with the EC + PD controller (negotiate input, pick source)', 'Kelvin-sense the battery path; work with the fuel gauge', 'ORing selection across multiple inputs (PD port + adapter)'],
        commonMistakes: ['A pure buck charger: cannot charge when input is below the battery', 'Input current limit over the adapter capability: overload trips / power loss', 'VSYS range not clamped: downstream DC-DC hard to design', 'No battery boost at heavy load: system drops at peak load']
      },
      ja: {
        principles: 'ノート電池は多セル（2-4S、Vbat 7-17V 動的）、入力多様（USB-C PD 5-20V、20V アダプタ）。入力は電池より上にも下にもなり得るため充電器は Buck-Boost（四スイッチ）必須。NVDC（Narrow VDC）：充電器出力がシステムレール（VSYS）に接続、電池が FET 経由でその節点に——軽負荷時は充電器がシステム給電＋充電、重負荷で入力能力超過時は電池が電流補充（battery boost/turbo）、VSYS を電池近くの狭範囲に鉗め下流 DC-DC を設計しやすく。充電器 IC が入力電流制限（アダプタ/PD 能力超えず）、充電曲線（CC/CV）、電池認証、EC/PD との交渉を担う。',
        keyFormulas: ['入力が Vbat より上も下も → Buck-Boost 必須（四スイッチ）', 'NVDC：VSYS を Vbat 近くの狭範囲に鉗める', '入力電流制限 ≤ 交渉アダプタ/PD 能力', '重負荷で入力超過 → 電池が電流補充（turbo boost）'],
        designNotes: ['Buck-Boost 充電器を使う（入力が電池より上/下を網羅）', 'NVDC 構成で充電器がシステム給電も兼ね VSYS 狭範囲', '入力電流制限を正しく（PD 交渉値を超えず、さもないと崩壊/保護作動）', 'EC＋PD コントローラと協調（入力交渉、源選択）', '電池経路を Kelvin 測定、燃料計と協調', '複数入力（PD 端子＋アダプタ）の ORing 選択'],
        commonMistakes: ['純 Buck 充電器 → 入力が電池より下で充電不可', '入力電流制限がアダプタ能力超過 → 過負荷保護作動/電力喪失', 'VSYS 範囲を鉗めない → 下流 DC-DC 設計困難', '重負荷で battery boost なし → ピーク負荷でシステム低下']
      },
      ko: {
        principles: '노트북 배터리는 다중 셀(2-4S, Vbat 7-17V 동적), 입력 다양(USB-C PD 5-20V, 20V 어댑터). 입력이 배터리보다 위나 아래일 수 있어 충전기는 벅-부스트(4스위치) 필수. NVDC(Narrow VDC): 충전기 출력이 시스템 레일(VSYS)에 연결, 배터리가 FET 경유로 그 노드에 - 경부하 시 충전기가 시스템 급전+충전, 중부하로 입력 능력 초과 시 배터리가 전류 보충(battery boost/turbo), VSYS를 배터리 근처 좁은 범위에 고정해 하류 DC-DC를 설계하기 쉽게. 충전기 IC가 입력 전류 제한(어댑터/PD 능력 안 넘음), 충전 곡선(CC/CV), 배터리 인증, EC/PD와의 협상 담당.',
        keyFormulas: ['입력이 Vbat보다 위도 아래도 → 벅-부스트 필수(4스위치)', 'NVDC: VSYS를 Vbat 근처 좁은 범위에 고정', '입력 전류 제한 ≤ 협상 어댑터/PD 능력', '중부하로 입력 초과 → 배터리가 전류 보충(turbo boost)'],
        designNotes: ['벅-부스트 충전기 사용(입력이 배터리보다 위/아래 커버)', 'NVDC 구조로 충전기가 시스템 급전도 겸하고 VSYS 좁은 범위', '입력 전류 제한을 올바로(PD 협상값 안 넘게, 아니면 붕괴/보호 작동)', 'EC+PD 컨트롤러와 협조(입력 협상, 소스 선택)', '배터리 경로를 Kelvin 측정, 연료 게이지와 협조', '다중 입력(PD 포트+어댑터) ORing 선택'],
        commonMistakes: ['순 벅 충전기 → 입력이 배터리보다 아래일 때 충전 불가', '입력 전류 제한이 어댑터 능력 초과 → 과부하 보호 작동/전력 상실', 'VSYS 범위 미고정 → 하류 DC-DC 설계 곤란', '중부하에서 battery boost 없음 → 피크 부하에서 시스템 강하']
      }
    },
    'usbc-pd-laptop': {
      en: {
        principles: 'A USB-C port is multiplexed: (1) PD power - dual-role (DRP, source or sink), the CC line negotiates direction/voltage/current (the laptop sinks to charge itself, or sources to a peripheral); (2) data - USB 3.x/USB4; (3) video - DisplayPort Alt Mode reconfigures some high-speed pairs into DP; (4) Thunderbolt/USB4 is more complex. Key parts: a PD controller (runs CC negotiation, source/sink role), SBU/CC logic, a high-speed signal mux/retimer (routes lanes to USB or DP per negotiation), the VBUS power path (buck-boost charger or source FET), and VCONN to power e-marker cables. Reversible plug means detecting orientation via CC and switching the mux.',
        keyFormulas: ['CC line negotiates: role (DRP/source/sink), voltage, current, Alt Mode', 'DP Alt Mode: high-speed lanes reconfigured to DisplayPort', 'VCONN powers e-marker / active cables', 'Reversible plug -> CC detects orientation -> mux switches lanes'],
        designNotes: ['A PD controller manages CC negotiation and role switching', 'The high-speed mux/retimer routes lanes to USB/DP per negotiation', 'Orientation detection -> switch the mux accordingly', 'VBUS overvoltage protection (guards against a bad negotiation) + buck-boost charge path', 'VCONN powers cable e-markers; SBU carries DP AUX', 'Controlled-impedance high-speed diff pairs (USB4/TBT channels are strict)'],
        commonMistakes: ['Mux not switched per orientation/negotiation: one plug orientation fails', 'No VBUS overvoltage protection: a bad negotiation dumps high voltage', 'No e-marker/VCONN: active cables / high current not recognized', 'Poor high-speed channels: USB4/DP high-resolution fails']
      },
      ja: {
        principles: 'USB-C 端子は多重化：①PD 給電——デュアルロール（DRP、Source か Sink）、CC 線が方向/電圧/電流を交渉（ノートは受電して自己充電、または周辺機器へ給電）②データ——USB 3.x/USB4③映像——DisplayPort Alt Mode が一部高速対を DP に再構成④Thunderbolt/USB4 は更に複雑。主要部品：PD コントローラ（CC 交渉、Source/Sink 役割）、SBU/CC ロジック、高速信号 Mux/リタイマ（交渉に応じレーンを USB か DP へ）、VBUS 電源経路（Buck-Boost 充電器や給電 FET）、VCONN が e-marker ケーブル給電。可逆挿しは CC で方向検出し Mux 切替。',
        keyFormulas: ['CC 線が交渉：役割（DRP/Source/Sink）、電圧、電流、Alt Mode', 'DP Alt Mode：高速レーンを DisplayPort に再構成', 'VCONN が e-marker/アクティブケーブル給電', '可逆挿し → CC が方向検出 → Mux がレーン切替'],
        designNotes: ['PD コントローラが CC 交渉と役割切替を管理', '高速 Mux/リタイマが交渉に応じレーンを USB/DP へ', '方向検出 → Mux を対応切替', 'VBUS 過電圧保護（交渉異常防止）＋Buck-Boost 充電経路', 'VCONN がケーブル e-marker 給電、SBU が DP AUX', '制御インピーダンス高速差動対（USB4/TBT 通道は厳格）'],
        commonMistakes: ['Mux が方向/交渉で切替らず → 挿す向きの一方が不通', 'VBUS 過電圧保護なし → 交渉異常で高電圧流入', 'e-marker/VCONN なし → アクティブケーブル/大電流認識せず', '高速通道が悪い → USB4/DP 高解像失敗']
      },
      ko: {
        principles: 'USB-C 포트는 다중화: ①PD 급전 - 듀얼 롤(DRP, Source나 Sink), CC 선이 방향/전압/전류 협상(노트북은 수전해 자체 충전, 또는 주변기기로 급전) ②데이터 - USB 3.x/USB4 ③영상 - DisplayPort Alt Mode가 일부 고속쌍을 DP로 재구성 ④Thunderbolt/USB4는 더 복잡. 주요 부품: PD 컨트롤러(CC 협상, Source/Sink 역할), SBU/CC 로직, 고속 신호 Mux/리타이머(협상에 따라 레인을 USB나 DP로), VBUS 전원 경로(벅-부스트 충전기나 급전 FET), VCONN이 e-marker 케이블 급전. 가역 삽입은 CC로 방향 감지해 Mux 전환.',
        keyFormulas: ['CC 선이 협상: 역할(DRP/Source/Sink), 전압, 전류, Alt Mode', 'DP Alt Mode: 고속 레인을 DisplayPort로 재구성', 'VCONN이 e-marker/액티브 케이블 급전', '가역 삽입 → CC가 방향 감지 → Mux가 레인 전환'],
        designNotes: ['PD 컨트롤러가 CC 협상과 역할 전환 관리', '고속 Mux/리타이머가 협상에 따라 레인을 USB/DP로', '방향 감지 → Mux를 대응 전환', 'VBUS 과전압 보호(협상 이상 방지)+벅-부스트 충전 경로', 'VCONN이 케이블 e-marker 급전, SBU가 DP AUX', '제어 임피던스 고속 차동쌍(USB4/TBT 채널은 엄격)'],
        commonMistakes: ['Mux가 방향/협상으로 전환 안 됨 → 삽입 방향 한쪽이 불통', 'VBUS 과전압 보호 없음 → 협상 이상 시 고전압 유입', 'e-marker/VCONN 없음 → 액티브 케이블/대전류 인식 안 됨', '고속 채널 나쁨 → USB4/DP 고해상도 실패']
      }
    },
    'ec-controller': {
      en: {
        principles: 'The EC (Embedded Controller) is an always-on small MCU that does what the main SoC cannot or does while asleep: (1) power sequencing - control rail power-up order, PWROK/PLTRST# handshake (see pch-sideband); (2) battery - coordinate charging/gauge/PD to manage charge/discharge, pick source; (3) thermals - read temperature, control fan speed (PWM), throttle/shut down to protect if needed; (4) input - keyboard matrix scan, touchpad, power button; (5) system state - the S0/S3/S5 power state machine, wake (LID/RTC/USB), and talking to BIOS (host interface). EC firmware is a key laptop customization. It stays low-power and always on (awake even in standby), so it must be frugal itself.',
        keyFormulas: ['EC always on (awake even in S5 off) -> must be low-power itself', 'Fan PWM follows a temperature curve (thermal management)', 'Power state machine: S0(on)/S3(sleep)/S5(off)', 'PWROK/PLTRST# handshake controls power-up sequencing'],
        designNotes: ['Power the EC from the always-on domain (has power in standby)', 'Handshake power sequencing per platform spec (sideband signals)', 'Thermal: sensible temp-sensor placement, tuned fan PWM curve', 'Debounce and ESD-protect the keyboard matrix/power button', 'Align EC firmware with the BIOS/PD interface', 'Keep EC itself low-power (always-on draw hurts standby life)'],
        commonMistakes: ['EC powered from the wrong domain (dead in sleep): wake fails', 'Wrong power-sequencing handshake: fails to boot or intermittent', 'Untuned fan curve: overheating throttle or loud noise', 'EC firmware out of sync with PD/BIOS: charge/wake anomalies']
      },
      ja: {
        principles: 'EC（Embedded Controller）は常駐小 MCU、主 SoC が不便または睡眠中に要る事を担う：①電源シーケンス——各レール投入順序、PWROK/PLTRST# 握手（pch-sideband 参照）②電池——充電器/燃料計/PD と協調し充放電管理、源選択③熱管理——温度読取、ファン速度制御（PWM）、必要時降頻/停止保護④入力——キーボードマトリクス走査、タッチパッド、電源ボタン⑤システム状態——S0/S3/S5 電源ステートマシン、ウェイク（LID/RTC/USB）、BIOS 通信（host interface）。EC ファームはノート客製の要。低電力常駐（待機中も起床）、自身も省電要。',
        keyFormulas: ['EC 常駐（S5 停止中も起床）→ 自身低電力', 'ファン PWM は温度曲線に従う（熱管理）', '電源ステートマシン：S0(オン)/S3(睡眠)/S5(停止)', 'PWROK/PLTRST# 握手が投入順序を制御'],
        designNotes: ['EC を常駐域から給電（待機中も電源あり）', '電源シーケンス握手はプラットフォーム仕様通り（サイドバンド信号）', '熱：温度センサ配置を合理的に、ファン PWM 曲線を調整', 'キーボードマトリクス/電源ボタンを去抖・ESD 保護', 'EC ファームを BIOS/PD インターフェースと整合', 'EC 自身を低電力に（常駐消費が待機寿命に影響）'],
        commonMistakes: ['EC が誤った域から給電（睡眠で断電）→ ウェイク失敗', '電源シーケンス握手誤り → 起動失敗や間欠', 'ファン曲線未調整 → 過熱降頻や騒音', 'EC ファームが PD/BIOS と非同期 → 充電/ウェイク異常']
      },
      ko: {
        principles: 'EC(Embedded Controller)는 상주 소형 MCU, 메인 SoC가 불편하거나 잠든 동안 필요한 일을 담당: ①전원 시퀀스 - 각 레일 인가 순서, PWROK/PLTRST# 핸드셰이크(pch-sideband 참조) ②배터리 - 충전기/연료계/PD와 협조해 충방전 관리, 소스 선택 ③발열 관리 - 온도 읽기, 팬 속도 제어(PWM), 필요 시 감속/정지 보호 ④입력 - 키보드 매트릭스 스캔, 터치패드, 전원 버튼 ⑤시스템 상태 - S0/S3/S5 전원 상태 머신, 웨이크(LID/RTC/USB), BIOS 통신(host interface). EC 펌웨어는 노트북 커스텀의 핵심. 저전력 상주(대기 중에도 깨어 있음), 자신도 절전 필요.',
        keyFormulas: ['EC 상주(S5 정지 중에도 깨어 있음) → 자신 저전력', '팬 PWM은 온도 곡선을 따름(발열 관리)', '전원 상태 머신: S0(온)/S3(슬립)/S5(정지)', 'PWROK/PLTRST# 핸드셰이크가 인가 순서 제어'],
        designNotes: ['EC를 상주 도메인에서 급전(대기 중에도 전원 있음)', '전원 시퀀스 핸드셰이크는 플랫폼 사양대로(사이드밴드 신호)', '발열: 온도 센서 배치 합리적으로, 팬 PWM 곡선 조정', '키보드 매트릭스/전원 버튼을 디바운스·ESD 보호', 'EC 펌웨어를 BIOS/PD 인터페이스와 정합', 'EC 자체를 저전력으로(상주 소비가 대기 수명에 영향)'],
        commonMistakes: ['EC가 잘못된 도메인에서 급전(슬립에서 단전) → 웨이크 실패', '전원 시퀀스 핸드셰이크 오류 → 부팅 실패나 간헐', '팬 곡선 미조정 → 과열 감속이나 소음', 'EC 펌웨어가 PD/BIOS와 비동기 → 충전/웨이크 이상']
      }
    },
    'laptop-backlight': {
      en: {
        principles: 'LCD laptop panels run eDP to a panel TCON and need VLCD (panel logic/source-driver supply, often 3.3V). The backlight is an LED string (many in series needing high voltage) driven by a boost constant-current driver: boost the battery to enough to push the whole string, constant current for uniform brightness, and dim by PWM (switch LED duty to set perceived brightness, at a high enough frequency to avoid flicker / audible noise) or analog (adjust current, no flicker at low brightness but some color shift). OLED laptop panels self-emit per pixel, needing ELVDD/ELVSS (same AMOLED principle but large size and current). Panel power-up sequencing (VLCD vs backlight order) follows spec to avoid boot flicker.',
        keyFormulas: ['LED series string -> boost to N x Vf, constant current', 'PWM dimming: duty sets perceived brightness (high freq avoids flicker/noise)', 'Analog dimming: adjust current (no flicker at low but possible color shift)', 'OLED panels need ELVDD/ELVSS (large current)'],
        designNotes: ['Backlight boost constant-current driver, LED string voltage sized (enough boost ratio)', 'PWM dimming frequency above audible range (inductor/cap whine) and visible flicker', 'Mixed dimming (PWM+analog) at low brightness for no-flicker plus color accuracy', 'Panel VLCD vs backlight power-up sequence per spec (avoid boot flicker)', 'OLED panel ELVDD/ELVSS well decoupled (large current transient)', 'Auto-brightness (ambient sensing) saves power and protects eyes'],
        commonMistakes: ['PWM dimming frequency too low: visible flicker (eye strain) or inductor whine', 'Insufficient boost ratio: cannot push the whole LED string, dim backlight', 'Wrong panel/backlight sequence: white flash or ghosting at boot', 'Insufficient large OLED ELVDD decoupling: flicker on brightness change']
      },
      ja: {
        principles: 'LCD ノートパネルは eDP でパネル TCON へ、VLCD（パネル論理/ソース駆動電源、常 3.3V）が必要。バックライトは LED 直列（多数直列で高電圧要）を昇圧定電流駆動：電池を全列を推せる電圧に昇圧、定電流で輝度均一、調光は PWM（LED デューティで知覚輝度、点滅/可聴雑音を避ける高周波）かアナログ（電流調整、低輝度で無点滅だが色偏あり）。OLED ノートパネルは画素自発光で ELVDD/ELVSS 要（AMOLED 原理同だが大サイズ大電流）。パネル投入順序（VLCD とバックライト先後）は仕様通りで起動ちらつき回避。',
        keyFormulas: ['LED 直列 → N×Vf に昇圧、定電流駆動', 'PWM 調光：デューティで知覚輝度（高周波で点滅/雑音回避）', 'アナログ調光：電流調整（低輝度で無点滅だが色偏可能）', 'OLED パネルは ELVDD/ELVSS 要（大電流）'],
        designNotes: ['バックライト昇圧定電流駆動、LED 列電圧を正しく（昇圧比十分）', 'PWM 調光周波数を可聴域（インダクタ/コンデンサ鳴き）と可視点滅の外に', '低輝度は混合調光（PWM+アナログ）で無点滅と色精度両立', 'パネル VLCD とバックライト投入順序を仕様通り（起動ちらつき回避）', 'OLED 大パネル ELVDD/ELVSS を十分デカップリング（大電流過渡）', '自動輝度（環境光）で省電・目に優しい'],
        commonMistakes: ['PWM 調光周波数が低すぎ → 可視点滅（目疲労）やインダクタ鳴き', '昇圧比不足 → LED 列全体を推せず・バックライト暗', 'パネル/バックライト順序誤り → 起動時に白点滅や残像', 'OLED 大パネル ELVDD デカップリング不足 → 輝度変化でちらつき']
      },
      ko: {
        principles: 'LCD 노트북 패널은 eDP로 패널 TCON에, VLCD(패널 논리/소스 구동 전원, 보통 3.3V) 필요. 백라이트는 LED 직렬(다수 직렬로 고전압 필요)을 승압 정전류 구동: 배터리를 전체 스트링을 밀 수 있는 전압으로 승압, 정전류로 휘도 균일, 조광은 PWM(LED 듀티로 지각 휘도, 깜빡임/가청 잡음 피하는 고주파)이나 아날로그(전류 조정, 저휘도에서 무깜빡임이나 색 편이 있음). OLED 노트북 패널은 픽셀 자발광으로 ELVDD/ELVSS 필요(AMOLED 원리 동일하나 대형 대전류). 패널 인가 순서(VLCD와 백라이트 선후)는 사양대로 부팅 깜빡임 회피.',
        keyFormulas: ['LED 직렬 → N×Vf로 승압, 정전류 구동', 'PWM 조광: 듀티로 지각 휘도(고주파로 깜빡임/잡음 회피)', '아날로그 조광: 전류 조정(저휘도서 무깜빡임이나 색 편이 가능)', 'OLED 패널은 ELVDD/ELVSS 필요(대전류)'],
        designNotes: ['백라이트 승압 정전류 구동, LED 스트링 전압 올바로(승압비 충분)', 'PWM 조광 주파수를 가청역(인덕터/커패시터 울림)과 가시 깜빡임 밖으로', '저휘도는 혼합 조광(PWM+아날로그)으로 무깜빡임과 색 정확도 양립', '패널 VLCD와 백라이트 인가 순서를 사양대로(부팅 깜빡임 회피)', 'OLED 대형 패널 ELVDD/ELVSS 충분히 디커플링(대전류 과도)', '자동 휘도(주변광)로 절전·눈 보호'],
        commonMistakes: ['PWM 조광 주파수 너무 낮음 → 가시 깜빡임(눈 피로)이나 인덕터 울림', '승압비 부족 → LED 스트링 전체를 못 밀어 백라이트 어두움', '패널/백라이트 순서 오류 → 부팅 시 흰 깜빡임이나 잔상', 'OLED 대형 패널 ELVDD 디커플링 부족 → 휘도 변화 시 깜빡임']
      }
    },
    'laptop-power-seq': {
      en: {
        principles: 'A laptop splits power into domains: S5 (soft-off, only always-on circuits + EC awake), S3 (sleep, memory retained), S0 (fully on). Boot starts from the power button; the EC/PCH build rails in order and handshake over sideband (see pch-sideband): always-on rail -> EC starts -> sequentially open CPU/DDR/IO rails, each PWROK confirming stable before the next, and only when all are ready is PLTRST# released to let the platform run. Off/sleep reverses the order. Sequencing is managed by the EC + PCH + a power-monitor/sequencer IC (or CPLD). DDR has its own power-up/down order requirements (VDD/VDDQ/VTT/VREF order). Wrong order can latch up an IC or fail to boot.',
        keyFormulas: ['Power domains: S5(off/EC awake) -> S3(sleep/memory retained) -> S0(fully on)', 'Each rail PWROK stable -> then open the next', 'All rails ready -> release PLTRST# -> platform runs', 'DDR has a dedicated VDD/VDDQ/VTT/VREF power-up order'],
        designNotes: ['Power-up order per chipset/CPU/DDR spec (timing diagram)', 'EC + a power-sequencer IC (or CPLD) manages the multi-rail order', 'Chain each rail PGOOD; enable the next only when the previous is good', 'Strict DDR power order (VTT/VREF relative to VDDQ)', 'Cross-check the sideband (PWROK/PLTRST#) handshake', 'Reserve test points on critical rails to debug the power-up flow'],
        commonMistakes: ['Wrong power-up order: fails to boot or latches up an IC', 'DDR power order not per spec: memory training fails', 'PGOOD chain not linked: a rail opens downstream before it is stable', 'No test points: a boot failure gives no way to debug which rail is stuck']
      },
      ja: {
        principles: 'ノートは電源を域に分ける：S5（ソフトオフ、常駐回路＋EC 起床のみ）、S3（睡眠、メモリ保持）、S0（全オン）。起動は電源ボタンから、EC/PCH が各レールを順に建てサイドバンドで握手（pch-sideband 参照）：常駐レール → EC 起動 → 順に CPU/DDR/各 IO レール開通、各 PWROK 安定確認後に次、全就緒で PLTRST# 解除しプラットフォーム動作。停止/睡眠は逆順。順序は EC＋PCH＋電源監視/排序 IC（や CPLD）が管理。DDR は独自の投入/遮断順序要求（VDD/VDDQ/VTT/VREF 順）。順序誤りは IC ラッチアップや起動失敗。',
        keyFormulas: ['電源域：S5(停止/EC 起床) → S3(睡眠/メモリ保持) → S0(全オン)', '各レール PWROK 安定 → 次を開通', '全レール就緒 → PLTRST# 解除 → プラットフォーム動作', 'DDR は専用 VDD/VDDQ/VTT/VREF 投入順序'],
        designNotes: ['投入順序はチップセット/CPU/DDR 仕様通り（タイミング図）', 'EC＋電源排序 IC（や CPLD）が多レール順序を管理', '各レール PGOOD を鎖状に、前が良で次を致能', 'DDR 電源順序を厳格（VTT/VREF が VDDQ に対し）', 'サイドバンド（PWROK/PLTRST#）握手を照合', '重要レールにテストポイントを予約し投入流程を debug'],
        commonMistakes: ['投入順序誤り → 起動失敗や IC ラッチアップ', 'DDR 電源順序が仕様外 → メモリ訓練失敗', 'PGOOD 鎖が繋がらず → あるレールが未安定で下流開通', 'テストポイントなし → 起動失敗でどのレールで止まったか debug 不能']
      },
      ko: {
        principles: '노트북은 전원을 도메인으로 나눔: S5(소프트 오프, 상주 회로+EC 깨어남만), S3(슬립, 메모리 유지), S0(완전 온). 부팅은 전원 버튼에서, EC/PCH가 각 레일을 순서대로 세우고 사이드밴드로 핸드셰이크(pch-sideband 참조): 상주 레일 → EC 기동 → 순차로 CPU/DDR/각 IO 레일 개통, 각 PWROK 안정 확인 후 다음, 전부 준비되면 PLTRST# 해제해 플랫폼 동작. 정지/슬립은 역순. 순서는 EC+PCH+전원 감시/시퀀서 IC(나 CPLD)가 관리. DDR은 독자 인가/차단 순서 요구(VDD/VDDQ/VTT/VREF 순). 순서 오류는 IC 래치업이나 부팅 실패.',
        keyFormulas: ['전원 도메인: S5(정지/EC 깨어남) → S3(슬립/메모리 유지) → S0(완전 온)', '각 레일 PWROK 안정 → 다음 개통', '전 레일 준비 → PLTRST# 해제 → 플랫폼 동작', 'DDR은 전용 VDD/VDDQ/VTT/VREF 인가 순서'],
        designNotes: ['인가 순서는 칩셋/CPU/DDR 사양대로(타이밍도)', 'EC+전원 시퀀서 IC(나 CPLD)가 다중 레일 순서 관리', '각 레일 PGOOD를 체인으로, 앞이 양호해야 다음 인에이블', 'DDR 전원 순서를 엄격히(VTT/VREF가 VDDQ 대비)', '사이드밴드(PWROK/PLTRST#) 핸드셰이크 대조', '중요 레일에 테스트 포인트 예약해 인가 흐름 디버그'],
        commonMistakes: ['인가 순서 오류 → 부팅 실패나 IC 래치업', 'DDR 전원 순서가 사양 밖 → 메모리 훈련 실패', 'PGOOD 체인 미연결 → 어떤 레일이 미안정인데 하류 개통', '테스트 포인트 없음 → 부팅 실패 시 어느 레일에서 막혔는지 디버그 불가']
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
  // 重新套用到已載入的 items（覆蓋 knowledge-i18n.js 先前淺套的 i18n）
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
