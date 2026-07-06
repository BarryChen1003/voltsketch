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
