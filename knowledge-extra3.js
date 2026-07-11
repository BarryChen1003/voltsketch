/**
 * knowledge-extra3.js — 特殊線路知識卡批3（datasheet 打底自撰；sourcePdf 指向館內 IC-spec）
 * 8 張：FMCW 毫米波雷達前端／天線整合封裝(AoP)佈局／大型 BGA 電源完整性／JESD204C 轉換器時脈／
 *       DLP DMD 顯示介面／C2000 數位電源控制／多通道整合 AFE SAR ADC／太空級電壓監控看門狗。
 * 源料＝批21-29 新建 IC（awrl6844/iwrl6432aop/am2611-q1/dac39rf20/dlp800xe/tms320f28p551sg/ads8688w/tps7h3034-sp）。
 * 併入方式同 knowledge-paid.js/extra2：concat 進 window.KNOWLEDGE_EXTRA，由 knowledge.js getSampleData() 吃入。
 * i18n 覆蓋 title/description/principles/designNotes/commonMistakes 五欄（keyFormulas/examples 沿用 zh，與 extra 卡同規格）。
 */
(function () {
  var CARDS = [];

  CARDS.push({
    "id": "fmcw-radar-frontend",
    "title": "FMCW 毫米波雷達收發前端（chirp／TX 天線／RX 混頻／LVDS 資料）",
    "category": "high-speed",
    "products": ["車用電子", "通用"],
    "description": "60/77GHz 單晶片雷達把 chirp 合成、多路 TX/RX、混頻與 ADC 全整合在一顆——設計重點在 chirp 線性度、天線埠阻抗匹配、IF/資料介面與相位雜訊，任一環沒顧到就偵測距離縮水或速度失準。",
    "principles": "FMCW（調頻連續波）雷達發射線性掃頻的 chirp，目標反射回來時帶有時間延遲與都卜勒位移；把回波與發射 chirp 混頻（去斜 dechirp）會得到一個正比於距離的低頻拍頻，而多個 chirp 之間的相位變化則給出速度。單晶片雷達（如 AWRL6844，57–64GHz、4TX/4RX、207-ball FCCSP）把整條鏈整合進一顆：產生 chirp 的 PLL/合成器、TX 功率放大器與天線埠、RX 低雜訊放大器與混頻器、IF 鏈與 ADC，以及高速原始資料介面（LVDS/CSI-2）。TX/RX 天線埠是高頻類比節點，PCB 上必須以受控阻抗線路（接地共面波導 GCPW／微帶）搭配連續參考地與良好的 launch 過渡來走線，否則天線效率與波束形狀劣化。合成器的相位雜訊決定近距離雜波底與速度精度，其供電要用低雜訊 LDO 並就近去耦，絕不與數位或開關電源共用髒 rail。原始資料輸出是高速差分匯流排，要等長、鬆耦合差分繞線並依介面規範端接。",
    "circuits": [],
    "keyFormulas": [
      "距離解析度 ΔR = c/(2·B)（B=chirp 掃頻帶寬，4GHz→ΔR≈3.75cm）",
      "拍頻 fb = 2·R·S/c（S=chirp 斜率）；最大量測距離受 IF 頻寬與 ADC 取樣率限制",
      "AWRL6844：57–64GHz、4TX/4RX、207-ball FCCSP，TX 埠 A3/A5/A7/A9、RX 埠 N1/L1/J1/G1",
      "60GHz 自由空間波長 λ≈5mm，天線陣列間距通常 ~λ/2"
    ],
    "designNotes": [
      "TX/RX 天線埠以受控阻抗線路（GCPW/微帶）＋連續參考地＋良好 launch 過渡走線，阻抗不連續直接損失天線效率",
      "合成器相位雜訊決定近距離雜波與速度精度——用低雜訊 LDO＋就近去耦供電，別和數位/開關電源共用",
      "LVDS/CSI-2 原始資料是高速差分對群，等長、鬆耦合差分繞線並依介面規範端接",
      "60GHz 波長僅 5mm，天線陣列與過孔柵欄尺寸公差直接移動波束——嚴格照原廠天線參考佈局",
      "SOP（sense-on-power）腳決定開機模式；mux mode0 常是 RSVD/SOP 且方向與腳主功能相反，別把 mode0 當主功能（建庫實測的教訓）"
    ],
    "commonMistakes": [
      "天線埠當一般訊號走線，忽略受控阻抗與連續參考地，天線增益與波束成形嚴重劣化",
      "合成器供電與數位/開關電源共用，相位雜訊惡化，近距離目標被雜波淹沒",
      "差分資料對繞線不等長或誤用緊耦合，高速資料 eye 崩、封包錯誤",
      "只抄天線圖案沒對疊層/介電常數，實際頻率偏移或阻抗跑掉"
    ],
    "examples": [
      {
        "title": "車用角雷達",
        "application": "77/60GHz 角雷達以 AWRL6844 4TX/4RX 做到約 3.75cm 距離解析＋波束成形盲點偵測",
        "circuit": "chirp 合成 → TX 天線陣列 → 目標反射 → RX 混頻去斜 → IF ADC → LVDS/CSI-2 原始資料 → 處理器 FFT"
      }
    ],
    "relatedTopics": ["aop-radar-layout", "large-bga-power-integrity", "jesd204-converter-clocking"],
    "i18n": {
      "en": {
        "title": "FMCW mmWave Radar Front-End (Chirp / TX Antenna / RX Mixer / LVDS Data)",
        "description": "A single-chip 60/77GHz radar integrates chirp synthesis, multiple TX/RX, mixing and the ADC on one die - the design hinges on chirp linearity, antenna-port impedance matching, the IF/data interface and phase noise; miss any one and detection range shrinks or velocity accuracy suffers.",
        "principles": "FMCW (frequency-modulated continuous-wave) radar transmits a linearly swept chirp; the target reflection returns delayed and Doppler-shifted, and mixing (dechirping) the echo against the transmitted chirp yields a low beat frequency proportional to range, while the phase change across chirps gives velocity. A single-chip radar such as the AWRL6844 (57-64GHz, 4TX/4RX, 207-ball FCCSP) integrates the whole chain: the PLL/synthesizer that generates the chirp, the TX power amplifiers and antenna ports, the RX low-noise amplifiers and mixers, the IF chain and ADC, and a high-speed raw-data interface (LVDS/CSI-2). The TX/RX antenna ports are high-frequency analog nodes and on the PCB must be routed as controlled-impedance lines (grounded coplanar waveguide / microstrip) with a continuous reference ground and a well-designed launch transition, or antenna efficiency and beam shape degrade. Synthesizer phase noise sets the near-range clutter floor and velocity accuracy, so its supply must be a low-noise LDO decoupled right at the pin and never shared with digital or switching rails. The raw-data output is a high-speed differential bus that must be length-matched, loosely-coupled differential routing and terminated per the interface spec.",
        "designNotes": [
          "Route TX/RX antenna ports as controlled-impedance lines (GCPW/microstrip) with a continuous reference ground and a clean launch transition; impedance discontinuities directly cost antenna efficiency",
          "Synthesizer phase noise sets near-range clutter and velocity accuracy - power it from a low-noise LDO with local decoupling, not a shared or noisy rail",
          "The LVDS/CSI-2 raw-data output is a set of high-speed differential pairs - route length-matched, loosely-coupled differential and terminate per the interface spec",
          "At 60GHz the wavelength is only ~5mm, so antenna-array and via-fence dimensional tolerances move the beam directly - follow the vendor antenna reference layout closely",
          "SOP (sense-on-power) pins set the boot mode, and mux mode0 is often RSVD/SOP with the opposite direction to the pin main function - do not take mux mode0 as the pin main function (a real library-build lesson)"
        ],
        "commonMistakes": [
          "Routing antenna ports like ordinary signals, ignoring controlled impedance and a continuous reference ground, so antenna gain and beamforming degrade badly",
          "Sharing the synthesizer supply with digital or switching rails, worsening phase noise until near-range targets drown in clutter",
          "Length-mismatched or wrongly tight-coupled differential data pairs, collapsing the high-speed data eye and causing packet errors",
          "Copying only the antenna pattern without matching stackup and dielectric constant, so the real-world frequency shifts or impedance drifts off"
        ]
      },
      "ja": {
        "title": "FMCW ミリ波レーダーフロントエンド（チャープ／TX アンテナ／RX ミキサ／LVDS データ）",
        "description": "単一チップの 60/77GHz レーダーはチャープ生成、複数の TX/RX、ミキシング、ADC を 1 チップに集積する——設計の要はチャープ直線性、アンテナポートのインピーダンス整合、IF/データインタフェース、位相雑音で、どれか一つを外すと検出距離が縮み速度精度が落ちる。",
        "principles": "FMCW（周波数変調連続波）レーダーは直線的に周波数を掃引するチャープを送信し、ターゲットからの反射は遅延しドップラーシフトして戻る。エコーを送信チャープとミキシング（デチャープ）すると距離に比例した低いビート周波数が得られ、チャープ間の位相変化から速度が求まる。AWRL6844（57-64GHz、4TX/4RX、207 ボール FCCSP）のような単一チップレーダーはチェーン全体を集積する——チャープを生成する PLL/シンセサイザ、TX パワーアンプとアンテナポート、RX 低雑音アンプとミキサ、IF チェーンと ADC、そして高速生データインタフェース（LVDS/CSI-2）。TX/RX アンテナポートは高周波アナログノードで、PCB 上では制御インピーダンス線路（グランド付きコプレーナ導波路／マイクロストリップ）として連続した基準グランドと適切なランチ遷移で配線しないと、アンテナ効率とビーム形状が劣化する。シンセサイザの位相雑音は近距離クラッタ底と速度精度を決めるため、その電源はピン直近でデカップリングした低雑音 LDO とし、デジタルやスイッチング電源と共用してはならない。生データ出力は高速差動バスで、等長・疎結合差動配線としインタフェース規格どおりに終端する。",
        "designNotes": [
          "TX/RX アンテナポートは制御インピーダンス線路（GCPW/マイクロストリップ）＋連続基準グランド＋良好なランチ遷移で配線；インピーダンス不連続はアンテナ効率を直接損なう",
          "シンセサイザの位相雑音が近距離クラッタと速度精度を決める——低雑音 LDO＋ローカルデカップリングで給電し、共用や雑音の多いレールを避ける",
          "LVDS/CSI-2 生データは高速差動ペア群——等長・疎結合差動で配線しインタフェース規格どおりに終端",
          "60GHz では波長がわずか約 5mm、アンテナアレイやビアフェンスの寸法公差がビームを直接動かす——ベンダのアンテナ参照レイアウトに忠実に従う",
          "SOP（sense-on-power）ピンがブートモードを決め、mux mode0 は多くが RSVD/SOP でピン主機能と方向が逆——mode0 をピン主機能と見なさない（ライブラリ構築での実測教訓）"
        ],
        "commonMistakes": [
          "アンテナポートを一般信号として配線し、制御インピーダンスと連続基準グランドを無視、アンテナ利得とビームフォーミングが大きく劣化",
          "シンセサイザ電源をデジタルやスイッチング電源と共用し位相雑音が悪化、近距離ターゲットがクラッタに埋もれる",
          "差動データペアの長さ不整合や誤った密結合で高速データアイが崩れパケットエラー",
          "アンテナパターンだけを流用しスタックアップや誘電率を合わせず、実機で周波数がずれインピーダンスが外れる"
        ]
      },
      "ko": {
        "title": "FMCW 밀리미터파 레이더 프런트엔드(처프/TX 안테나/RX 믹서/LVDS 데이터)",
        "description": "단일 칩 60/77GHz 레이더는 처프 생성, 다중 TX/RX, 믹싱, ADC를 한 다이에 집적한다 - 설계의 핵심은 처프 선형성, 안테나 포트 임피던스 정합, IF/데이터 인터페이스, 위상 잡음이며, 하나라도 놓치면 검출 거리가 줄고 속도 정확도가 떨어진다.",
        "principles": "FMCW(주파수 변조 연속파) 레이더는 선형으로 주파수를 스윕하는 처프를 송신하고, 타깃 반사는 지연되고 도플러 편이되어 돌아온다. 에코를 송신 처프와 믹싱(디처프)하면 거리에 비례하는 낮은 비트 주파수가 나오고, 처프 간 위상 변화로 속도를 구한다. AWRL6844(57-64GHz, 4TX/4RX, 207볼 FCCSP) 같은 단일 칩 레이더는 체인 전체를 집적한다 - 처프를 만드는 PLL/신시사이저, TX 전력 증폭기와 안테나 포트, RX 저잡음 증폭기와 믹서, IF 체인과 ADC, 그리고 고속 원시 데이터 인터페이스(LVDS/CSI-2). TX/RX 안테나 포트는 고주파 아날로그 노드로, PCB에서는 제어 임피던스 선로(접지 코플래너 도파로/마이크로스트립)로 연속 기준 접지와 잘 설계된 런치 천이를 갖춰 배선하지 않으면 안테나 효율과 빔 형상이 열화된다. 신시사이저 위상 잡음은 근거리 클러터 바닥과 속도 정확도를 결정하므로 전원은 핀 바로 옆에서 디커플링한 저잡음 LDO로 하고 디지털이나 스위칭 레일과 공유하지 않는다. 원시 데이터 출력은 고속 차동 버스로 등장·느슨 결합 차동 배선하고 인터페이스 규격대로 종단한다.",
        "designNotes": [
          "TX/RX 안테나 포트는 제어 임피던스 선로(GCPW/마이크로스트립)+연속 기준 접지+깔끔한 런치 천이로 배선; 임피던스 불연속은 안테나 효율을 직접 깎는다",
          "신시사이저 위상 잡음이 근거리 클러터와 속도 정확도를 결정 - 저잡음 LDO+로컬 디커플링으로 급전하고 공유·잡음 레일을 피함",
          "LVDS/CSI-2 원시 데이터는 고속 차동 쌍 묶음 - 등장·느슨 결합 차동으로 배선하고 인터페이스 규격대로 종단",
          "60GHz에서 파장은 약 5mm에 불과해 안테나 어레이와 비아 펜스 치수 공차가 빔을 직접 움직인다 - 벤더 안테나 참조 레이아웃을 충실히 따름",
          "SOP(sense-on-power) 핀이 부팅 모드를 결정하고, mux mode0은 흔히 RSVD/SOP로 핀 주기능과 방향이 반대 - mode0을 핀 주기능으로 보지 말 것(라이브러리 구축 실측 교훈)"
        ],
        "commonMistakes": [
          "안테나 포트를 일반 신호처럼 배선해 제어 임피던스와 연속 기준 접지를 무시, 안테나 이득과 빔포밍이 크게 열화",
          "신시사이저 전원을 디지털·스위칭 레일과 공유해 위상 잡음이 악화, 근거리 타깃이 클러터에 묻힘",
          "차동 데이터 쌍 길이 불일치나 잘못된 밀결합으로 고속 데이터 아이가 무너져 패킷 오류",
          "안테나 패턴만 복사하고 스택업과 유전율을 맞추지 않아 실제로 주파수가 어긋나고 임피던스가 벗어남"
        ]
      }
    },
    "sourcePdf": "IC-spec/awrl6844.pdf",
    "createdAt": "2026-07-11T00:00:00Z",
    "updatedAt": "2026-07-11T00:00:00Z"
  });

  CARDS.push({
    "id": "aop-radar-layout",
    "title": "天線整合封裝（AoP）雷達 PCB 佈局（天線淨空／參考地／熱）",
    "category": "pcb-design",
    "products": ["車用電子", "通用"],
    "description": "AoP 把天線陣列做進封裝，省掉板上天線與 60GHz 走線，但換來封裝上方與周邊的淨空、參考地、熱與非對稱球佈局規範——佈局踩雷等於天線失效。",
    "principles": "天線整合封裝（Antenna-on-Package，AoP）把發射/接收天線陣列直接整合在 IC 封裝內（如 IWRL6432AOP 的 AMY0101A 矩形 BGA，10.9×6.7mm、101 球），board 端不再需要 60GHz 受控阻抗走線與板上天線，大幅簡化高頻佈局並縮小方案尺寸。代價是佈局規範更嚴：封裝的天線輻射面正上方與周邊要保留無金屬、無零件的淨空區（keep-out），否則反射與遮蔽會破壞波束成形並抬高旁瓣。封裝下方 BGA 是電源、地與 IF/資料球——AoP 的球佈局常是雙側 bank（左右各一排訊號球、中間是天線區無球，例如 IWRL6432AOP 的 col1–5 左側、col6–10 右側、中間為天線無球），與一般方形對稱 BGA 不同，逃逸繞線與 via 佈局要照這個非對稱佈局規劃。接地面要在封裝正下方連續完整，作為天線的參考地與 RF 回流路徑，任何切割或挖空都會讓天線效率與方向性劣化。熱方面 AoP 把功率放大器與天線塞在小封裝內，散熱靠 BGA 地球陣列＋via 陣列導到內層/底層銅，電源地球下方的 via-in-pad 兼具導熱與導電。",
    "circuits": [],
    "keyFormulas": [
      "IWRL6432AOP：57–63.5GHz、AMY0101A 101-ball 矩形 BGA 10.9×6.7mm、13 列(A–N 跳 I)×10 欄",
      "60GHz 自由空間波長 λ≈5mm；天線陣列間距通常 ~λ/2（約 2.5mm）決定波束與柵瓣",
      "AoP 球佈局：col1–5 左側 bank／col6–10 右側 bank，中間 x 區為天線無球",
      "天線淨空區依原廠 layout guide（正上方數 mm 無金屬/無零件）"
    ],
    "designNotes": [
      "天線輻射面淨空區嚴格照原廠 layout guide：正上方與周邊禁放金屬、零件、螺絲、外殼肋條，連金屬漆都避開",
      "封裝正下方接地面連續完整不切割，作為天線參考地與 RF 回流；地球用 via 陣列導到內層地平面",
      "雙側 bank 的訊號球逃逸繞線照非對稱佈局規劃，別套方形對稱 BGA 扇出習慣",
      "PA/天線熱靠地球陣列＋via-in-pad 導熱，電源地球下方鋪滿導熱 via 到底層散熱銅",
      "外殼/雷達罩（radome）材料介電常數與厚度會改變波束，機構件要一起模擬，別只顧 PCB"
    ],
    "commonMistakes": [
      "天線淨空區放了零件、走線或金屬（甚至沉銅過孔），波束變形、旁瓣抬高、偵測距離縮水",
      "封裝下方地面被電源分割或訊號走線切開，天線參考地不連續，效率與方向性劣化",
      "套用方形對稱 BGA 扇出習慣處理雙側 bank，逃逸繞線擠不開或誤接",
      "忽略外殼/radome 影響，PCB 單獨量測好但裝進機構就頻偏、增益掉"
    ],
    "examples": [
      {
        "title": "AoP 存在感測/手勢雷達",
        "application": "IWRL6432AOP 60GHz AoP 單晶片做智慧居家存在感測，免板上天線與 60GHz 走線",
        "circuit": "封裝內天線陣列 ⇄ 收發前端 → 內建 M4F/HWA 處理 → 低速介面輸出點雲/存在旗標"
      }
    ],
    "relatedTopics": ["fmcw-radar-frontend", "large-bga-power-integrity", "qfn-ep-thermal"],
    "i18n": {
      "en": {
        "title": "Antenna-on-Package (AoP) Radar PCB Layout (Antenna Keep-Out / Reference Ground / Thermal)",
        "description": "AoP builds the antenna array into the package, removing on-board antennas and 60GHz routing, but in exchange imposes strict keep-out, reference-ground, thermal and asymmetric ball-layout rules - get the layout wrong and the antenna simply fails.",
        "principles": "Antenna-on-Package (AoP) integrates the transmit/receive antenna array directly inside the IC package (for example the AMY0101A rectangular BGA of the IWRL6432AOP, 10.9x6.7mm, 101 balls), so the board no longer needs 60GHz controlled-impedance routing or on-board antennas, greatly simplifying the high-frequency layout and shrinking the solution. The cost is stricter layout rules: the area directly above and around the package antenna radiating face must be a metal-free, component-free keep-out, or reflections and shadowing wreck beamforming and raise sidelobes. Under the package the BGA carries power, ground and IF/data balls - AoP ball layouts are often dual-side banks (a row of signal balls on each side, with the antenna region and no balls in the middle, e.g. the IWRL6432AOP has col1-5 on the left, col6-10 on the right, and no balls in between), unlike a symmetric square BGA, so escape routing and via placement must follow this asymmetric layout. The ground plane directly under the package must be continuous and unbroken as the antenna reference ground and RF return path; any split or cutout degrades antenna efficiency and directivity. Thermally, AoP packs the power amplifier and antenna into a small package, so heat leaves through the BGA ground-ball array and a via array into inner/bottom copper, with via-in-pad under the power/ground balls doing both heat and current.",
        "designNotes": [
          "Follow the vendor layout guide for the antenna keep-out strictly: no metal, components, screws or enclosure ribs above or around it - even metallic paint",
          "Keep the ground plane directly under the package continuous and unbroken as the antenna reference ground and RF return; route ground balls through a via array to the inner ground plane",
          "Plan escape routing for the dual-side banks per the asymmetric layout - do not apply symmetric square-BGA fanout habits",
          "PA/antenna heat leaves via the ground-ball array and via-in-pad - fill via under the power/ground balls down to bottom heat-spreader copper",
          "The enclosure/radome dielectric constant and thickness change the beam - simulate the mechanicals together, not just the PCB"
        ],
        "commonMistakes": [
          "Placing components, traces or metal (even plated through-holes) in the antenna keep-out, distorting the beam, raising sidelobes and shrinking detection range",
          "Splitting the ground under the package with power or signal traces, breaking the antenna reference ground and degrading efficiency and directivity",
          "Applying symmetric square-BGA fanout habits to the dual-side banks, so escape routing does not fit or mis-connects",
          "Ignoring the enclosure/radome, so the PCB measures fine alone but shifts frequency and loses gain once inside the mechanicals"
        ]
      },
      "ja": {
        "title": "アンテナ集積パッケージ（AoP）レーダー PCB レイアウト（アンテナ禁止領域／基準グランド／熱）",
        "description": "AoP はアンテナアレイをパッケージ内に作り込み、基板上のアンテナと 60GHz 配線を不要にするが、代わりに禁止領域・基準グランド・熱・非対称ボール配置の厳しい規則を課す——レイアウトを誤るとアンテナそのものが機能しない。",
        "principles": "アンテナ集積パッケージ（Antenna-on-Package、AoP）は送受信アンテナアレイを IC パッケージ内に直接集積する（例：IWRL6432AOP の AMY0101A 矩形 BGA、10.9x6.7mm、101 ボール）。基板側は 60GHz の制御インピーダンス配線や基板上アンテナが不要になり、高周波レイアウトが大幅に簡素化し方案が小型化する。代償はより厳しいレイアウト規則である。パッケージのアンテナ放射面の真上と周囲は、金属も部品もない禁止領域（キープアウト）とする必要があり、そうしないと反射や遮蔽がビームフォーミングを壊し副ローブを持ち上げる。パッケージ下の BGA は電源・グランド・IF/データボールを担う——AoP のボール配置はしばしば両側バンク（両側に信号ボールの列、中央はアンテナ領域でボールなし。例えば IWRL6432AOP は col1-5 が左、col6-10 が右、中間はボールなし）で、対称正方形 BGA とは異なるため、エスケープ配線とビア配置はこの非対称配置に従う。パッケージ直下のグランド面はアンテナ基準グランドと RF リターン経路として連続かつ切れ目なく保つ必要があり、分割や切り欠きはアンテナ効率と指向性を劣化させる。熱面では AoP はパワーアンプとアンテナを小型パッケージに詰め込むため、放熱は BGA グランドボールアレイとビアアレイを通して内層/底層銅へ逃がし、電源/グランドボール下の via-in-pad が放熱と導電の両方を担う。",
        "designNotes": [
          "アンテナ禁止領域はベンダのレイアウトガイドに厳密に従う：真上と周囲に金属・部品・ねじ・筐体リブを置かない——金属塗料も避ける",
          "パッケージ直下のグランド面はアンテナ基準グランドと RF リターンとして連続かつ切れ目なく保つ；グランドボールはビアアレイで内層グランド面へ",
          "両側バンクのエスケープ配線は非対称配置に従って計画——対称正方形 BGA のファンアウト習慣を当てはめない",
          "PA/アンテナの熱はグランドボールアレイと via-in-pad で逃がす——電源/グランドボール下を底層ヒートスプレッダ銅までビアで埋める",
          "筐体/レドームの誘電率と厚みがビームを変える——PCB だけでなく機構も一緒にシミュレーションする"
        ],
        "commonMistakes": [
          "アンテナ禁止領域に部品・配線・金属（メッキスルーホールさえ）を置き、ビームが歪み副ローブが上がり検出距離が縮む",
          "パッケージ下のグランドを電源や信号配線で分割し、アンテナ基準グランドが不連続になり効率と指向性が劣化",
          "両側バンクに対称正方形 BGA のファンアウト習慣を当てはめ、エスケープ配線が収まらないか誤接続",
          "筐体/レドームを無視し、PCB 単体では良好でも機構に組み込むと周波数がずれ利得が落ちる"
        ]
      },
      "ko": {
        "title": "안테나 집적 패키지(AoP) 레이더 PCB 레이아웃(안테나 키프아웃/기준 접지/열)",
        "description": "AoP는 안테나 어레이를 패키지 안에 넣어 보드상 안테나와 60GHz 배선을 없애지만, 대신 키프아웃·기준 접지·열·비대칭 볼 배치라는 엄격한 규칙을 부과한다 - 레이아웃을 잘못하면 안테나 자체가 작동하지 않는다.",
        "principles": "안테나 집적 패키지(Antenna-on-Package, AoP)는 송수신 안테나 어레이를 IC 패키지 안에 직접 집적한다(예: IWRL6432AOP의 AMY0101A 직사각 BGA, 10.9x6.7mm, 101볼). 보드 쪽은 60GHz 제어 임피던스 배선이나 보드상 안테나가 필요 없어져 고주파 레이아웃이 크게 단순해지고 솔루션이 작아진다. 대가는 더 엄격한 레이아웃 규칙이다. 패키지 안테나 방사면 바로 위와 주변은 금속도 부품도 없는 키프아웃이어야 하며, 그렇지 않으면 반사와 차폐가 빔포밍을 망치고 사이드로브를 높인다. 패키지 아래 BGA는 전원·접지·IF/데이터 볼을 담당한다 - AoP 볼 배치는 흔히 양측 뱅크(양쪽에 신호 볼 열, 가운데는 안테나 영역으로 볼 없음. 예: IWRL6432AOP는 col1-5 왼쪽, col6-10 오른쪽, 중간은 볼 없음)로 대칭 정사각 BGA와 달라, 이스케이프 배선과 비아 배치는 이 비대칭 배치를 따라야 한다. 패키지 바로 아래 접지면은 안테나 기준 접지이자 RF 리턴 경로로 연속되고 끊김 없이 유지해야 하며, 분할이나 컷아웃은 안테나 효율과 지향성을 열화시킨다. 열 측면에서 AoP는 전력 증폭기와 안테나를 작은 패키지에 넣으므로 방열은 BGA 접지 볼 어레이와 비아 어레이로 내층/저층 구리로 빠지고, 전원/접지 볼 아래 via-in-pad가 방열과 도전을 함께 담당한다.",
        "designNotes": [
          "안테나 키프아웃은 벤더 레이아웃 가이드를 엄격히 따름: 바로 위와 주변에 금속·부품·나사·하우징 리브 금지 - 금속 도료도 피함",
          "패키지 바로 아래 접지면은 안테나 기준 접지와 RF 리턴으로 연속되고 끊김 없이 유지; 접지 볼은 비아 어레이로 내층 접지면에 연결",
          "양측 뱅크 이스케이프 배선은 비대칭 배치에 맞춰 계획 - 대칭 정사각 BGA 팬아웃 습관을 적용하지 않음",
          "PA/안테나 열은 접지 볼 어레이와 via-in-pad로 방출 - 전원/접지 볼 아래를 저층 히트 스프레더 구리까지 비아로 채움",
          "하우징/레이돔 유전율과 두께가 빔을 바꾼다 - PCB뿐 아니라 기구도 함께 시뮬레이션"
        ],
        "commonMistakes": [
          "안테나 키프아웃에 부품·배선·금속(도금 스루홀까지) 배치로 빔이 왜곡되고 사이드로브가 올라가며 검출 거리가 줄어듦",
          "패키지 아래 접지를 전원이나 신호 배선으로 분할해 안테나 기준 접지가 불연속되어 효율과 지향성 열화",
          "양측 뱅크에 대칭 정사각 BGA 팬아웃 습관을 적용해 이스케이프 배선이 안 들어가거나 오접속",
          "하우징/레이돔을 무시해 PCB 단독으로는 양호하지만 기구에 넣으면 주파수가 어긋나고 이득이 떨어짐"
        ]
      }
    },
    "sourcePdf": "IC-spec/iwrl6432aop.pdf",
    "createdAt": "2026-07-11T00:00:00Z",
    "updatedAt": "2026-07-11T00:00:00Z"
  });

  CARDS.push({
    "id": "large-bga-power-integrity",
    "title": "大型 BGA 處理器電源完整性（電源/地球陣列／分頻段去耦／via-in-pad）",
    "category": "power-management",
    "products": ["AI 伺服器", "通用"],
    "description": "幾百顆球的 BGA 處理器，電源不是「接上就好」——上百顆電源/地球要低阻抗分配、多電壓域各自去耦、via-in-pad 導出電流，PDN 阻抗沒壓好就是隨機當機。",
    "principles": "大型 BGA（如 AM2611-Q1 Sitara MCU，293-ball nFBGA ZNC，含 51 電源球、98 地球）的電源完整性核心是 PDN（電源分配網路）阻抗。處理器有多個電壓域（核心 VDD、I/O、類比 VREF/PLL、記憶體介面等），各有數十顆電源球與地球，board 要用完整的電源平面/地平面把電流從穩壓器低阻抗地送到每一顆球；任一域的 PDN 在其工作頻段阻抗過高，暫態電流一抽就壓降、時脈抖動、隨機當機。去耦電容要分頻段配置：大容值（µF 級 bulk）壓低頻、MLCC（nF–µF）壓中頻、就近小封裝 MLCC 壓高頻，擺位越靠球陣列、回流迴路越小越有效，封裝本身的內建電容與板上電容共同決定 PDN。BGA 下方球間距小（常 0.4–0.8mm pitch），電源/地球要用 via-in-pad（把過孔直接打在焊盤上、以導電或非導電樹脂填孔再電鍍平整）把電流從表層焊盤導到內層平面，同時兼作導熱路徑；一般 dog-bone（焊盤旁打孔＋短引線）在密間距 BGA 擠不下且電感大。類比與 PLL 電源要與數位/開關電源隔離，獨立 LDO＋就近去耦，避免數位切換雜訊進到參考與時脈。",
    "circuits": [],
    "keyFormulas": [
      "AM2611-Q1：293-ball nFBGA(ZNC)，電源球 51／地球 98／類比 19／IO 123，多電壓域",
      "PDN 目標阻抗 Ztarget ≈ (Vdd·允許漣波%)/Itransient",
      "去耦分頻段：bulk µF 壓低頻、MLCC 壓中頻、就近小 MLCC 壓高頻",
      "去耦有效性 ∝ 1/迴路電感；擺位靠近球陣列、via 短、迴路小"
    ],
    "designNotes": [
      "每個電壓域用完整電源平面＋地平面配對降 PDN 阻抗，別用細走線供高電流核心",
      "去耦電容分頻段配置並就近擺在對應電源球下方/背面，縮短回流迴路電感",
      "密間距 BGA 電源/地球用 via-in-pad（填孔電鍍平整），一般 dog-bone 擠不下且電感大",
      "類比/PLL 電源獨立 LDO＋隔離去耦，遠離數位與開關電源雜訊",
      "電源/地球 via 兼導熱：地球下方鋪滿 via 到內層地平面，兼作散熱與低阻抗回流"
    ],
    "commonMistakes": [
      "只顧把電源接上，沒做 PDN 阻抗規劃，暫態電流一抽核心壓降造成隨機當機或重開",
      "去耦電容擺太遠或全用同一容值，迴路電感大、某頻段阻抗尖峰壓不住",
      "密間距 BGA 用 dog-bone 打孔，焊盤旁擠不下、via 電感大，電流分配不均",
      "類比/PLL 電源與數位共用 rail，時脈抖動與轉換雜訊惡化"
    ],
    "examples": [
      {
        "title": "車用/工業 Sitara MCU 供電",
        "application": "AM2611-Q1 293-ball BGA 多域供電：核心/IO/類比各自平面對＋via-in-pad＋分頻段去耦",
        "circuit": "PMIC/多路 DC-DC+LDO → 電源平面 → BGA 電源球陣列；地球陣列 via 導內層地平面兼散熱"
      }
    ],
    "relatedTopics": ["hbm-power-decoupling", "aop-radar-layout", "qfn-ep-thermal"],
    "i18n": {
      "en": {
        "title": "Large BGA Processor Power Integrity (Power/Ground Ball Array / Banded Decoupling / Via-in-Pad)",
        "description": "For a BGA processor with hundreds of balls, power is not just 'connect it up' - hundreds of power/ground balls need low-impedance distribution, each voltage domain its own decoupling, and via-in-pad to carry current out; get the PDN impedance wrong and you get random crashes.",
        "principles": "For a large BGA (e.g. the AM2611-Q1 Sitara MCU, 293-ball nFBGA ZNC, with 51 power balls and 98 ground balls) power integrity centers on PDN (power distribution network) impedance. The processor has several voltage domains (core VDD, I/O, analog VREF/PLL, memory interface, etc.), each with dozens of power and ground balls, and the board must use full power/ground planes to carry current from the regulator with low impedance to every ball; if any domain's PDN is too high-impedance in its operating band, a transient current draw sags the rail, jitters the clock and crashes randomly. Decoupling must be banded: large bulk (µF-class) for low frequency, MLCC (nF-µF) for mid-band, and small local MLCC for high frequency, with placement closer to the ball array and smaller return loops being more effective; the package's own capacitance and the board capacitors together set the PDN. Under the BGA the ball pitch is small (often 0.4-0.8mm), so power/ground balls need via-in-pad (a via placed on the pad, filled with conductive or non-conductive resin then plated flat) to carry current from the surface pad to the inner planes while also acting as a thermal path; ordinary dog-bone (a via beside the pad on a short stub) does not fit at fine pitch and adds inductance. Analog and PLL supplies must be isolated from digital/switching rails with a dedicated LDO and local decoupling to keep digital switching noise out of the reference and clock.",
        "designNotes": [
          "Use a full power-plane plus ground-plane pair per voltage domain to lower PDN impedance - do not feed a high-current core through thin traces",
          "Band the decoupling capacitors and place them close, under or behind the matching power balls, to shorten the return-loop inductance",
          "Use via-in-pad (filled and plated flat) for power/ground balls on fine-pitch BGA; ordinary dog-bone does not fit and adds inductance",
          "Give analog/PLL supplies a dedicated LDO and isolated decoupling, away from digital and switching noise",
          "Power/ground vias double as thermal paths - fill vias under the ground balls to the inner ground plane for both heat spreading and low-impedance return"
        ],
        "commonMistakes": [
          "Just connecting power without planning PDN impedance, so a transient draw sags the core and causes random crashes or resets",
          "Placing decoupling too far away or all one value, so loop inductance is high and an impedance peak in some band goes unsuppressed",
          "Using dog-bone vias on a fine-pitch BGA, which do not fit beside the pad, add via inductance and unbalance current distribution",
          "Sharing the analog/PLL supply with digital rails, worsening clock jitter and conversion noise"
        ]
      },
      "ja": {
        "title": "大型 BGA プロセッサの電源インテグリティ（電源/グランドボールアレイ／帯域別デカップリング／via-in-pad）",
        "description": "数百ボールの BGA プロセッサでは電源は「つなげば良い」ではない——数百の電源/グランドボールに低インピーダンス分配、各電圧ドメインごとのデカップリング、電流を逃がす via-in-pad が必要で、PDN インピーダンスを外すとランダムクラッシュになる。",
        "principles": "大型 BGA（例：AM2611-Q1 Sitara MCU、293 ボール nFBGA ZNC、電源ボール 51、グランドボール 98）の電源インテグリティの核心は PDN（電源分配網）インピーダンスである。プロセッサは複数の電圧ドメイン（コア VDD、I/O、アナログ VREF/PLL、メモリインタフェース等）を持ち、それぞれ数十の電源ボールとグランドボールがある。基板は完全な電源面/グランド面でレギュレータから各ボールへ低インピーダンスに電流を供給する必要があり、いずれかのドメインの PDN が動作帯域で高インピーダンスだと、過渡電流を引いた瞬間にレールが沈みクロックがジッタしランダムにクラッシュする。デカップリングは帯域別に配置する：大容量（µF 級バルク）で低域、MLCC（nF-µF）で中域、直近の小型 MLCC で高域を抑え、ボールアレイに近くリターンループが小さいほど効果的で、パッケージ自体の容量と基板コンデンサが合わせて PDN を決める。BGA 下はボールピッチが小さく（多くは 0.4-0.8mm）、電源/グランドボールには via-in-pad（パッド上にビアを打ち、導電性/非導電性樹脂で埋めてから平坦にメッキ）で表層パッドから内層面へ電流を導き、同時に熱経路も担わせる；通常の dog-bone（パッド脇の短いスタブにビア）は狭ピッチでは収まらずインダクタンスも大きい。アナログと PLL 電源はデジタル/スイッチングレールから専用 LDO とローカルデカップリングで分離し、デジタルのスイッチング雑音を基準とクロックに入れない。",
        "designNotes": [
          "各電圧ドメインに完全な電源面＋グランド面ペアを使い PDN インピーダンスを下げる——大電流コアを細い配線で給電しない",
          "デカップリングコンデンサを帯域別に配置し、対応する電源ボールの直下/裏面に近接させリターンループのインダクタンスを短くする",
          "狭ピッチ BGA の電源/グランドボールは via-in-pad（埋め・平坦メッキ）を使う；通常の dog-bone は収まらずインダクタンスも増す",
          "アナログ/PLL 電源には専用 LDO と分離デカップリングを与え、デジタルとスイッチング雑音から遠ざける",
          "電源/グランドビアは熱経路も兼ねる——グランドボール下を内層グランド面までビアで埋め、放熱と低インピーダンスリターンの両立"
        ],
        "commonMistakes": [
          "PDN インピーダンスを計画せず電源をつなぐだけで、過渡電流でコアが沈みランダムクラッシュやリセットが起きる",
          "デカップリングを遠くに置くか全て同じ容量にし、ループインダクタンスが大きくある帯域のインピーダンスピークが抑えられない",
          "狭ピッチ BGA に dog-bone ビアを使い、パッド脇に収まらずビアインダクタンスで電流分配が不均一になる",
          "アナログ/PLL 電源をデジタルレールと共用しクロックジッタと変換雑音が悪化"
        ]
      },
      "ko": {
        "title": "대형 BGA 프로세서 전원 무결성(전원/접지 볼 어레이/대역별 디커플링/via-in-pad)",
        "description": "수백 볼 BGA 프로세서에서 전원은 '연결만 하면 되는' 게 아니다 - 수백 개 전원/접지 볼에 저임피던스 분배, 각 전압 도메인별 디커플링, 전류를 빼내는 via-in-pad가 필요하며, PDN 임피던스를 잘못하면 랜덤 크래시가 난다.",
        "principles": "대형 BGA(예: AM2611-Q1 Sitara MCU, 293볼 nFBGA ZNC, 전원 볼 51개·접지 볼 98개)의 전원 무결성 핵심은 PDN(전원 분배망) 임피던스다. 프로세서는 여러 전압 도메인(코어 VDD, I/O, 아날로그 VREF/PLL, 메모리 인터페이스 등)을 가지며 각각 수십 개의 전원·접지 볼이 있다. 보드는 완전한 전원면/접지면으로 레귤레이터에서 각 볼로 저임피던스로 전류를 공급해야 하며, 어느 한 도메인의 PDN이 동작 대역에서 고임피던스면 과도 전류를 뽑는 순간 레일이 처지고 클록이 지터되어 랜덤하게 크래시한다. 디커플링은 대역별로 배치한다: 대용량(µF급 벌크)으로 저역, MLCC(nF-µF)로 중역, 근접 소형 MLCC로 고역을 억제하며, 볼 어레이에 가깝고 리턴 루프가 작을수록 효과적이고, 패키지 자체 용량과 보드 커패시터가 함께 PDN을 결정한다. BGA 아래는 볼 피치가 작아(흔히 0.4-0.8mm), 전원/접지 볼에는 via-in-pad(패드 위에 비아를 뚫고 도전/비도전 수지로 채운 뒤 평탄 도금)로 표층 패드에서 내층면으로 전류를 유도하며 동시에 열 경로도 담당한다; 일반 dog-bone(패드 옆 짧은 스터브의 비아)은 미세 피치에서 안 들어가고 인덕턴스도 크다. 아날로그와 PLL 전원은 디지털/스위칭 레일에서 전용 LDO와 로컬 디커플링으로 분리해 디지털 스위칭 잡음을 기준과 클록에 넣지 않는다.",
        "designNotes": [
          "각 전압 도메인에 완전한 전원면+접지면 쌍을 써 PDN 임피던스를 낮춤 - 대전류 코어를 얇은 배선으로 급전하지 않음",
          "디커플링 커패시터를 대역별로 배치하고 대응 전원 볼 바로 아래/뒷면에 근접시켜 리턴 루프 인덕턴스를 줄임",
          "미세 피치 BGA의 전원/접지 볼은 via-in-pad(충전·평탄 도금)를 사용; 일반 dog-bone은 안 들어가고 인덕턴스도 늘어남",
          "아날로그/PLL 전원에 전용 LDO와 분리 디커플링을 주고 디지털·스위칭 잡음에서 멀리함",
          "전원/접지 비아는 열 경로도 겸함 - 접지 볼 아래를 내층 접지면까지 비아로 채워 방열과 저임피던스 리턴을 함께"
        ],
        "commonMistakes": [
          "PDN 임피던스를 계획하지 않고 전원만 연결해, 과도 전류로 코어가 처지고 랜덤 크래시나 리셋이 발생",
          "디커플링을 멀리 두거나 전부 같은 용량으로 해, 루프 인덕턴스가 크고 어느 대역의 임피던스 피크가 억제되지 않음",
          "미세 피치 BGA에 dog-bone 비아를 써 패드 옆에 안 들어가고 비아 인덕턴스로 전류 분배가 불균일해짐",
          "아날로그/PLL 전원을 디지털 레일과 공유해 클록 지터와 변환 잡음이 악화"
        ]
      }
    },
    "sourcePdf": "IC-spec/am2611-q1.pdf",
    "createdAt": "2026-07-11T00:00:00Z",
    "updatedAt": "2026-07-11T00:00:00Z"
  });

  CARDS.push({
    "id": "jesd204-converter-clocking",
    "title": "RF 取樣資料轉換器時脈與 JESD204C 對齊（SYSREF／差分時脈／確定性延遲）",
    "category": "high-speed",
    "products": ["AI 伺服器", "通用"],
    "description": "GSPS 級 RF DAC/ADC 靠 JESD204 串列鏈把資料搬進 FPGA，時脈與 SYSREF 的相位對齊決定多通道能不能同步——對不齊，多通道相位就漂、確定性延遲失效。",
    "principles": "RF 取樣資料轉換器（如 DAC39RF20，最高 44GSPS 16-bit RF DAC；ADC32RF72，雙通道 1.5GSPS RF ADC）取樣率高到無法用並列匯流排，改用 JESD204B/C 高速串列鏈把資料在多條差分 lane 上與 FPGA/ASIC 交換。要讓多顆轉換器、多通道之間有確定且可重現的相位關係（確定性延遲，deterministic latency），需要兩個時脈：高頻的裝置時脈/取樣時脈（DEVCLK/CLK，差分，決定取樣瞬間與雜訊底），以及低頻的 SYSREF（差分，作為所有裝置對齊 LMFC/LEMC 邊界的共同參考）。SYSREF 必須與 DEVCLK 有固定相位關係（source-synchronous，用同源時脈產生器如 LMK 系列同時產生兩者），並在所有轉換器與邏輯之間等長分配，讓每顆裝置在同一個時脈邊界鎖定，否則各通道相位隨機、波束成形/MIMO 失效。差分時脈與 SYSREF 走線要嚴格等長、鬆耦合差分、就近端接，供電用低相位雜訊 LDO——時脈相位雜訊直接變成轉換器的抖動（jitter），抬高高頻段雜訊底、砍掉 SNR。",
    "circuits": [],
    "keyFormulas": [
      "DAC39RF20：22/44GSPS 16-bit RF DAC，289-ball FCCSP；CLK± N17/P17、SYSREF± D17/E17、DACOUTA± A11/A13",
      "時脈抖動造成的 SNR 上限：SNR ≈ −20·log10(2π·fin·tjitter)",
      "SYSREF 與 DEVCLK 須 source-synchronous、固定相位；SYSREF 建立/保持窗要滿足",
      "確定性延遲：各裝置在同一 LMFC/LEMC 邊界對齊，多通道相位可重現"
    ],
    "designNotes": [
      "DEVCLK 與 SYSREF 由同一時脈產生器（如 LMK 系列）source-synchronous 產生，維持固定相位關係",
      "差分時脈/SYSREF 走線嚴格等長、鬆耦合差分、就近端接；跨多顆轉換器分配也要等長",
      "時脈供電用低相位雜訊 LDO 並就近去耦，別和數位/開關電源共用——jitter 直接吃 SNR",
      "JESD204 lane 是高速差分對，等長、參考地連續，依速率做通道等化/去加重",
      "差分對極性（CLK±/SYSREF±/DACOUT±）建庫與佈線都要盯，接反相位翻轉（建庫抽驗即為此）"
    ],
    "commonMistakes": [
      "SYSREF 與 DEVCLK 非同源或相位不固定，多通道對不齊、確定性延遲失效、波束成形錯亂",
      "時脈供電和數位/開關電源共用，相位雜訊惡化，高頻輸入 SNR 大幅下降",
      "差分時脈/SYSREF/lane 走線不等長，建立保持違例或封包錯誤",
      "差分對極性接反（把 P/N 對調），相位反轉或鏈路不通"
    ],
    "examples": [
      {
        "title": "相位陣列/儀器 RF 前端",
        "application": "多顆 DAC39RF20/ADC32RF72 以 LMK 時脈＋SYSREF 同步，JESD204C 對 FPGA，做相位陣列波束成形",
        "circuit": "LMK 時脈產生器 → DEVCLK+SYSREF 等長分配 → 各 RF DAC/ADC → JESD204C 差分 lane → FPGA"
      }
    ],
    "relatedTopics": ["clock-tree-fanout", "large-bga-power-integrity", "retimer-redriver"],
    "i18n": {
      "en": {
        "title": "RF-Sampling Converter Clocking and JESD204C Alignment (SYSREF / Differential Clock / Deterministic Latency)",
        "description": "GSPS-class RF DAC/ADCs move data into an FPGA over a JESD204 serial link, and the phase alignment of the clock and SYSREF decides whether multiple channels can synchronize - misalign them and channel phase drifts and deterministic latency fails.",
        "principles": "RF-sampling data converters (e.g. the DAC39RF20, a 16-bit RF DAC up to 44GSPS; the ADC32RF72, a dual-channel 1.5GSPS RF ADC) sample too fast for a parallel bus, so they use JESD204B/C high-speed serial links to exchange data with an FPGA/ASIC over several differential lanes. To give multiple converters and channels a deterministic, reproducible phase relationship (deterministic latency), you need two clocks: a high-frequency device/sampling clock (DEVCLK/CLK, differential, which sets the sampling instant and the noise floor) and a low-frequency SYSREF (differential, the common reference that all devices use to align to the LMFC/LEMC boundary). SYSREF must have a fixed phase relationship to DEVCLK (source-synchronous, generated together by a common clock generator such as the LMK family) and be distributed length-matched across all converters and logic, so every device latches on the same clock edge; otherwise channel phase is random and beamforming/MIMO fails. The differential clock and SYSREF routing must be strictly length-matched, loosely-coupled differential and terminated close in, powered from a low-phase-noise LDO - clock phase noise turns directly into converter jitter, raising the high-frequency noise floor and cutting SNR.",
        "designNotes": [
          "Generate DEVCLK and SYSREF source-synchronously from one clock generator (e.g. the LMK family) to keep a fixed phase relationship",
          "Route the differential clock/SYSREF strictly length-matched, loosely-coupled differential and terminated close in; keep distribution length-matched across multiple converters too",
          "Power the clock from a low-phase-noise LDO with local decoupling, not shared with digital/switching rails - jitter eats SNR directly",
          "JESD204 lanes are high-speed differential pairs - length-match, keep the reference ground continuous, and apply channel equalization/de-emphasis per the rate",
          "Watch differential-pair polarity (CLK+/-, SYSREF+/-, DACOUT+/-) in both the library and routing; swapping them inverts the phase (spot-checking these is exactly why library verification exists)"
        ],
        "commonMistakes": [
          "SYSREF and DEVCLK not source-synchronous or not fixed in phase, so channels do not align, deterministic latency fails and beamforming scrambles",
          "Sharing the clock supply with digital/switching rails, worsening phase noise and dropping high-frequency-input SNR sharply",
          "Length-mismatched clock/SYSREF/lane routing, causing setup/hold violations or packet errors",
          "Swapping differential-pair polarity (P/N reversed), inverting phase or breaking the link"
        ]
      },
      "ja": {
        "title": "RF サンプリング変換器のクロックと JESD204C アライメント（SYSREF／差動クロック／確定的レイテンシ）",
        "description": "GSPS 級の RF DAC/ADC は JESD204 シリアルリンクで FPGA へデータを送り、クロックと SYSREF の位相アライメントが複数チャネルを同期できるかを決める——ずれるとチャネル位相がドリフトし確定的レイテンシが破綻する。",
        "principles": "RF サンプリングデータ変換器（例：DAC39RF20、最大 44GSPS の 16 ビット RF DAC；ADC32RF72、デュアルチャネル 1.5GSPS RF ADC）はサンプリングレートが高すぎて並列バスが使えず、JESD204B/C 高速シリアルリンクで複数の差動レーン上を FPGA/ASIC とデータ交換する。複数の変換器・チャネル間に確定的で再現可能な位相関係（確定的レイテンシ）を持たせるには 2 つのクロックが要る：高周波のデバイス/サンプリングクロック（DEVCLK/CLK、差動、サンプリング瞬間と雑音底を決める）と、低周波の SYSREF（差動、全デバイスが LMFC/LEMC 境界に整列する共通基準）。SYSREF は DEVCLK と固定位相関係（source-synchronous、LMK ファミリのような同源クロックジェネレータで同時生成）を持ち、全変換器と論理間で等長分配し、各デバイスを同一クロックエッジでラッチさせる必要がある；さもないとチャネル位相がランダムになりビームフォーミング/MIMO が破綻する。差動クロックと SYSREF の配線は厳密に等長・疎結合差動・近接終端とし、低位相雑音 LDO で給電する——クロック位相雑音はそのまま変換器のジッタになり、高周波帯の雑音底を持ち上げ SNR を削る。",
        "designNotes": [
          "DEVCLK と SYSREF を一つのクロックジェネレータ（例：LMK ファミリ）で source-synchronous に生成し固定位相関係を保つ",
          "差動クロック/SYSREF を厳密に等長・疎結合差動・近接終端で配線；複数変換器への分配も等長に保つ",
          "クロック電源は低位相雑音 LDO＋ローカルデカップリングとし、デジタル/スイッチングレールと共用しない——ジッタが SNR を直接食う",
          "JESD204 レーンは高速差動ペア——等長にし、基準グランドを連続させ、レートに応じてチャネル等化/デエンファシスを適用",
          "差動ペア極性（CLK+/-、SYSREF+/-、DACOUT+/-）をライブラリと配線の両方で監視；入れ替えると位相が反転する（これらの抜き取り検証がライブラリ検証の目的そのもの）"
        ],
        "commonMistakes": [
          "SYSREF と DEVCLK が同源でない、または位相が固定でなく、チャネルが整列せず確定的レイテンシが破綻しビームフォーミングが乱れる",
          "クロック電源をデジタル/スイッチングレールと共用し位相雑音が悪化、高周波入力の SNR が大きく低下",
          "クロック/SYSREF/レーンの配線が等長でなく、セットアップ/ホールド違反やパケットエラー",
          "差動ペア極性を逆接続（P/N を入れ替え）し、位相反転やリンク不通"
        ]
      },
      "ko": {
        "title": "RF 샘플링 변환기 클로킹과 JESD204C 정렬(SYSREF/차동 클록/결정적 지연)",
        "description": "GSPS급 RF DAC/ADC는 JESD204 직렬 링크로 FPGA에 데이터를 보내며, 클록과 SYSREF의 위상 정렬이 다중 채널 동기화 여부를 결정한다 - 어긋나면 채널 위상이 드리프트하고 결정적 지연이 무너진다.",
        "principles": "RF 샘플링 데이터 변환기(예: DAC39RF20, 최대 44GSPS 16비트 RF DAC; ADC32RF72, 듀얼 채널 1.5GSPS RF ADC)는 샘플링 속도가 너무 높아 병렬 버스를 쓸 수 없어, JESD204B/C 고속 직렬 링크로 여러 차동 레인에서 FPGA/ASIC와 데이터를 교환한다. 여러 변환기·채널 사이에 결정적이고 재현 가능한 위상 관계(결정적 지연)를 주려면 두 클록이 필요하다: 고주파 디바이스/샘플링 클록(DEVCLK/CLK, 차동, 샘플링 순간과 잡음 바닥을 결정)과 저주파 SYSREF(차동, 모든 디바이스가 LMFC/LEMC 경계에 정렬하는 공통 기준). SYSREF는 DEVCLK와 고정 위상 관계(source-synchronous, LMK 계열 같은 동일 소스 클록 생성기로 함께 생성)를 가지고 모든 변환기와 로직 간에 등장 분배되어 각 디바이스가 같은 클록 에지에서 래치되어야 한다; 그렇지 않으면 채널 위상이 무작위가 되어 빔포밍/MIMO가 무너진다. 차동 클록과 SYSREF 배선은 엄격히 등장·느슨 결합 차동·근접 종단이어야 하고 저위상잡음 LDO로 급전한다 - 클록 위상 잡음은 그대로 변환기 지터가 되어 고주파 대역 잡음 바닥을 올리고 SNR을 깎는다.",
        "designNotes": [
          "DEVCLK와 SYSREF를 하나의 클록 생성기(예: LMK 계열)에서 source-synchronous로 생성해 고정 위상 관계를 유지",
          "차동 클록/SYSREF를 엄격히 등장·느슨 결합 차동·근접 종단으로 배선; 여러 변환기로의 분배도 등장 유지",
          "클록 전원은 저위상잡음 LDO+로컬 디커플링으로 하고 디지털/스위칭 레일과 공유하지 않음 - 지터가 SNR을 직접 먹음",
          "JESD204 레인은 고속 차동 쌍 - 등장하고 기준 접지를 연속시키며 속도에 맞춰 채널 이퀄라이제이션/디엠퍼시스 적용",
          "차동 쌍 극성(CLK+/-, SYSREF+/-, DACOUT+/-)을 라이브러리와 배선 양쪽에서 주시; 뒤바꾸면 위상이 반전됨(이 항목 표본 검증이 라이브러리 검증의 목적)"
        ],
        "commonMistakes": [
          "SYSREF와 DEVCLK가 동일 소스가 아니거나 위상이 고정되지 않아 채널이 정렬되지 않고 결정적 지연이 무너지며 빔포밍이 흐트러짐",
          "클록 전원을 디지털/스위칭 레일과 공유해 위상 잡음이 악화되고 고주파 입력 SNR이 크게 하락",
          "클록/SYSREF/레인 배선 길이 불일치로 셋업/홀드 위반이나 패킷 오류",
          "차동 쌍 극성을 반대로 접속(P/N 뒤바꿈)해 위상 반전이나 링크 불통"
        ]
      }
    },
    "sourcePdf": "IC-spec/dac39rf20.pdf",
    "createdAt": "2026-07-11T00:00:00Z",
    "updatedAt": "2026-07-11T00:00:00Z"
  });

  CARDS.push({
    "id": "dlp-dmd-display-interface",
    "title": "DLP DMD 微鏡顯示驅動介面（sub-LVDS 匯流排／微鏡復位／控制器配對）",
    "category": "high-speed",
    "products": ["車用電子", "通用"],
    "description": "DMD 不是一般顯示面板——上百萬顆可翻轉微鏡靠高速 sub-LVDS 匯流排載入位元平面、靠精密復位波形（MBRST）同步翻轉，DMD、DLPC 控制器與 PMIC 三者要成套配對。",
    "principles": "DLP 的核心是 DMD（Digital Micromirror Device，如 DLP800XE 0.8\" 4K+ DMD，FYV 350-Pin BGA），一整片微機電（MEMS）微鏡陣列，每顆鏡子代表一個像素、可在 ±θ 兩個角度間翻轉，把光導向投影透鏡（亮）或光陷阱（暗），靠 PWM 式的時間積分產生灰階。影像資料透過高速 sub-LVDS/LVDS 差分匯流排，由 DLPC 顯示控制器把位元平面（bit-plane）串流進 DMD；4K 級 DMD 常有多組 LVDS bus（如 Bus A/B/C/D），每組多對差分訊號＋差分時脈，要嚴格等長與受控阻抗。微鏡的翻轉不是資料寫入就動，而是由 DMD 的復位機制（MBRST，Micromirror Reset，多相分區）發出高壓復位波形，讓整片或分區的微鏡在精確時刻同步釋放/鎖定到新狀態——復位波形時序與位元平面載入必須配合，否則出現殘影或翻轉錯誤。DMD、DLPC 控制器、以及提供微鏡偏壓/復位高壓與各式類比電壓的 DLPA/PMIC 三者是成套設計（chipset），偏壓時序（上電/下電把微鏡 park 到安全角度）要嚴格照時序，違反會損傷 MEMS 鏡面。",
    "circuits": [],
    "keyFormulas": [
      "DLP800XE：0.8\" 4K+ UHD DMD，FYV 350-Pin BGA，多組 LVDS bus＋SCTRL 差分對",
      "灰階由微鏡 PWM 時間積分產生；位元平面深度決定灰階級數",
      "MBRST 復位分區：多相高壓波形讓微鏡在精確時刻同步翻轉",
      "DMD/DLPC 控制器/DLPA(PMIC) 三件成套配對，偏壓與復位時序照 chipset 規範"
    ],
    "designNotes": [
      "LVDS/sub-LVDS 位元平面匯流排：多對差分＋差分時脈嚴格等長、受控阻抗、參考地連續",
      "MBRST 復位波形是高壓時序訊號，走線與偏壓供電照原廠時序，別與資料對混繞",
      "上電/下電要把微鏡 park 到安全角度（照 DLPC 時序），違反時序會損傷 MEMS 鏡面",
      "DMD、DLPC、DLPA/PMIC 三件必須成套（同 chipset），別混搭不同世代",
      "350-ball BGA 電源/地球陣列＋偏壓多電壓域，PDN 與去耦照大 BGA 規範處理"
    ],
    "commonMistakes": [
      "LVDS 匯流排差分對不等長或阻抗失控，位元平面載入錯誤、畫面雜訊或閃爍",
      "忽略上下電 park 時序，微鏡停在錯誤角度或帶電釋放，損傷 MEMS",
      "復位波形時序與位元平面載入不同步，殘影、翻轉錯誤或對比下降",
      "DMD 與控制器/PMIC 混搭不同 chipset 世代，偏壓/時序不相容"
    ],
    "examples": [
      {
        "title": "4K 投影/車用 HUD",
        "application": "DLP800XE 4K+ DMD 配 DLPC 控制器＋DLPA PMIC 做超短焦投影或車用抬頭顯示",
        "circuit": "影像源 → DLPC 控制器 → sub-LVDS 位元平面 → DMD 微鏡；DLPA 供偏壓/復位高壓＋MBRST"
      }
    ],
    "relatedTopics": ["large-bga-power-integrity", "jesd204-converter-clocking", "clock-tree-fanout"],
    "i18n": {
      "en": {
        "title": "DLP DMD Micromirror Display Interface (sub-LVDS Bus / Micromirror Reset / Chipset Pairing)",
        "description": "A DMD is not an ordinary display panel - millions of tiltable micromirrors load bit-planes over a high-speed sub-LVDS bus and flip in sync on a precise reset waveform (MBRST); the DMD, the DLPC controller and the PMIC must be paired as a chipset.",
        "principles": "The heart of DLP is the DMD (Digital Micromirror Device, e.g. the DLP800XE 0.8-inch 4K+ DMD, FYV 350-pin BGA), a MEMS array of micromirrors where each mirror is a pixel that tilts between +/-theta to steer light into the projection lens (on) or a light trap (off), producing grayscale by PWM-style time integration. Image data is streamed as bit-planes into the DMD by the DLPC display controller over a high-speed sub-LVDS/LVDS differential bus; a 4K-class DMD often has several LVDS buses (e.g. Bus A/B/C/D), each with multiple differential signals plus a differential clock, all requiring strict length-matching and controlled impedance. The mirrors do not flip the instant data is written; the DMD's reset mechanism (MBRST, Micromirror Reset, multi-phase and zoned) issues a high-voltage reset waveform that releases/latches the whole array or a zone into its new state at a precise moment - the reset timing must coordinate with bit-plane loading, or you get afterimages or flip errors. The DMD, the DLPC controller, and the DLPA/PMIC that supplies the micromirror bias/reset high voltage and the various analog rails are designed as a chipset; the bias sequence (parking the mirrors to a safe angle at power-up/down) must follow the timing exactly, and violating it damages the MEMS surface.",
        "designNotes": [
          "The LVDS/sub-LVDS bit-plane bus: keep the many differential pairs plus differential clock strictly length-matched, controlled-impedance, with a continuous reference ground",
          "The MBRST reset waveform is a high-voltage timing signal - route it and its bias supply per the vendor timing, not interleaved with the data pairs",
          "Park the mirrors to a safe angle at power-up/down per the DLPC timing; violating the sequence damages the MEMS surface",
          "The DMD, DLPC and DLPA/PMIC must be a matched set (same chipset) - do not mix generations",
          "The 350-ball BGA has power/ground ball arrays and multiple bias rails - handle PDN and decoupling per large-BGA practice"
        ],
        "commonMistakes": [
          "Length-mismatched or impedance-uncontrolled LVDS bus pairs, causing bit-plane loading errors, image noise or flicker",
          "Ignoring the power-up/down park timing, so mirrors stop at the wrong angle or release while biased, damaging the MEMS",
          "Reset timing out of sync with bit-plane loading, causing afterimages, flip errors or reduced contrast",
          "Mixing DMD with a controller/PMIC of a different chipset generation, so bias/timing are incompatible"
        ]
      },
      "ja": {
        "title": "DLP DMD マイクロミラー表示インタフェース（sub-LVDS バス／マイクロミラーリセット／チップセット組合せ）",
        "description": "DMD は通常の表示パネルではない——数百万の傾動可能なマイクロミラーが高速 sub-LVDS バスでビットプレーンを読み込み、精密なリセット波形（MBRST）で同期して反転する；DMD、DLPC コントローラ、PMIC をチップセットとして組み合わせる必要がある。",
        "principles": "DLP の核心は DMD（Digital Micromirror Device、例：DLP800XE 0.8 インチ 4K+ DMD、FYV 350 ピン BGA）で、MEMS マイクロミラーアレイである。各ミラーが 1 画素で ±θ 間を傾動し、光を投影レンズ（オン）か光トラップ（オフ）へ向け、PWM 的な時間積分で階調を作る。画像データは DLPC 表示コントローラがビットプレーンとして高速 sub-LVDS/LVDS 差動バスで DMD へストリーミングする；4K 級 DMD はしばしば複数の LVDS バス（例：Bus A/B/C/D）を持ち、各バスは複数の差動信号＋差動クロックからなり、厳密な等長と制御インピーダンスを要する。ミラーはデータ書き込みで即座に反転せず、DMD のリセット機構（MBRST、Micromirror Reset、多相・ゾーン化）が高圧リセット波形を出し、全体またはゾーンのミラーを正確な瞬間に新状態へ解放/ラッチする——リセットタイミングとビットプレーン読み込みが協調しないと残像や反転エラーになる。DMD、DLPC コントローラ、そしてマイクロミラーのバイアス/リセット高電圧と各種アナログ電圧を供給する DLPA/PMIC はチップセットとして設計され、バイアスシーケンス（電源投入/切断時にミラーを安全角度へパーク）はタイミングに厳密に従う必要があり、違反すると MEMS 面を損傷する。",
        "designNotes": [
          "LVDS/sub-LVDS ビットプレーンバス：多数の差動ペア＋差動クロックを厳密に等長・制御インピーダンス・連続基準グランドに保つ",
          "MBRST リセット波形は高圧タイミング信号——ベンダのタイミングに従って配線しバイアス給電し、データペアと混ぜて配線しない",
          "電源投入/切断時に DLPC のタイミングに従いミラーを安全角度へパーク；シーケンス違反は MEMS 面を損傷する",
          "DMD、DLPC、DLPA/PMIC は同一チップセットの組合せでなければならない——世代を混ぜない",
          "350 ボール BGA は電源/グランドボールアレイと複数のバイアスレールを持つ——PDN とデカップリングを大型 BGA の流儀で扱う"
        ],
        "commonMistakes": [
          "LVDS バスのペアが等長でない、またはインピーダンス制御が甘く、ビットプレーン読み込みエラー・画像雑音・ちらつきが起きる",
          "電源投入/切断のパークタイミングを無視し、ミラーが誤った角度で止まるかバイアス中に解放され MEMS を損傷",
          "リセットタイミングがビットプレーン読み込みと同期せず、残像・反転エラー・コントラスト低下",
          "DMD と異なるチップセット世代のコントローラ/PMIC を混ぜ、バイアス/タイミングが非互換"
        ]
      },
      "ko": {
        "title": "DLP DMD 마이크로미러 디스플레이 인터페이스(sub-LVDS 버스/마이크로미러 리셋/칩셋 페어링)",
        "description": "DMD는 일반 디스플레이 패널이 아니다 - 수백만 개의 기울일 수 있는 마이크로미러가 고속 sub-LVDS 버스로 비트플레인을 로드하고 정밀 리셋 파형(MBRST)으로 동기 반전한다; DMD, DLPC 컨트롤러, PMIC를 칩셋으로 페어링해야 한다.",
        "principles": "DLP의 핵심은 DMD(Digital Micromirror Device, 예: DLP800XE 0.8인치 4K+ DMD, FYV 350핀 BGA)로, MEMS 마이크로미러 어레이다. 각 미러가 1픽셀이며 ±θ 사이로 기울어 빛을 투영 렌즈(온)나 광 트랩(오프)으로 보내고, PWM식 시간 적분으로 계조를 만든다. 영상 데이터는 DLPC 디스플레이 컨트롤러가 비트플레인으로 고속 sub-LVDS/LVDS 차동 버스를 통해 DMD로 스트리밍한다; 4K급 DMD는 흔히 여러 LVDS 버스(예: Bus A/B/C/D)를 가지며, 각 버스는 다수의 차동 신호+차동 클록으로 구성되어 엄격한 등장과 제어 임피던스를 요한다. 미러는 데이터 기록 즉시 반전하지 않고, DMD의 리셋 기구(MBRST, Micromirror Reset, 다상·구역화)가 고전압 리셋 파형을 내보내 전체 또는 구역의 미러를 정확한 순간에 새 상태로 해제/래치한다 - 리셋 타이밍과 비트플레인 로딩이 협조하지 않으면 잔상이나 반전 오류가 생긴다. DMD, DLPC 컨트롤러, 그리고 마이크로미러 바이어스/리셋 고전압과 각종 아날로그 전압을 공급하는 DLPA/PMIC는 칩셋으로 설계되며, 바이어스 시퀀스(전원 인가/차단 시 미러를 안전 각도로 파킹)는 타이밍을 엄격히 따라야 하고 위반하면 MEMS 면을 손상한다.",
        "designNotes": [
          "LVDS/sub-LVDS 비트플레인 버스: 다수의 차동 쌍+차동 클록을 엄격히 등장·제어 임피던스·연속 기준 접지로 유지",
          "MBRST 리셋 파형은 고전압 타이밍 신호 - 벤더 타이밍대로 배선하고 바이어스 급전하며 데이터 쌍과 섞어 배선하지 않음",
          "전원 인가/차단 시 DLPC 타이밍에 따라 미러를 안전 각도로 파킹; 시퀀스 위반은 MEMS 면을 손상",
          "DMD, DLPC, DLPA/PMIC는 동일 칩셋 조합이어야 함 - 세대를 섞지 않음",
          "350볼 BGA는 전원/접지 볼 어레이와 다중 바이어스 레일을 가짐 - PDN과 디커플링을 대형 BGA 방식으로 처리"
        ],
        "commonMistakes": [
          "LVDS 버스 쌍이 등장이 아니거나 임피던스 제어가 안 되어 비트플레인 로딩 오류·영상 잡음·깜빡임 발생",
          "전원 인가/차단 파킹 타이밍을 무시해 미러가 잘못된 각도에서 멈추거나 바이어스 중 해제되어 MEMS 손상",
          "리셋 타이밍이 비트플레인 로딩과 동기되지 않아 잔상·반전 오류·대비 저하",
          "DMD와 다른 칩셋 세대의 컨트롤러/PMIC를 섞어 바이어스/타이밍 비호환"
        ]
      }
    },
    "sourcePdf": "IC-spec/dlp800xe.pdf",
    "createdAt": "2026-07-11T00:00:00Z",
    "updatedAt": "2026-07-11T00:00:00Z"
  });

  CARDS.push({
    "id": "c2000-digital-power-control",
    "title": "C2000 即時控制 MCU 數位電源設計（HRPWM／CMPSS 快保護／同步 ADC）",
    "category": "power-management",
    "products": ["AI 伺服器", "車用電子", "通用"],
    "description": "數位電源與馬達控制要在數十 kHz～MHz 內閉環——C2000 這類即時 MCU 用高解析 PWM、內建比較器快速保護、與同步 ADC 把類比迴路搬進數位，佈局與時序沒配好就迴路不穩或炸功率級。",
    "principles": "C2000（如 TMS320F28P551SG，C28x DSP 核心 160MHz、100-PZ LQFP；或 F29 三核）是為即時控制設計的 MCU，核心是把電源/馬達的類比回授、運算與 PWM 輸出全部在一個高速控制迴路（數十 kHz～數百 kHz 的中斷服務程式）內閉環。關鍵外設：HRPWM（高解析度 PWM）把 PWM 邊緣解析度從系統時脈週期細分到皮秒級，讓數位電源在高開關頻率下仍有足夠占空比解析度，否則量化誤差造成輸出電壓抖動或極限環；CMPSS（比較器子系統）內建類比比較器＋DAC 參考，可在硬體層對過流/過壓在數十～數百 ns 內直接觸發 PWM 跳脫（trip zone），比軟體迴路快得多，保護功率級；整合的高速 ADC＋觸發鏈可與 PWM 同步取樣（在開關雜訊最小的時刻擷取電流/電壓），降低取樣雜訊。佈局上，回授類比訊號（電流感測、分壓）要遠離 PWM/開關節點的切換雜訊，ADC 參考與類比電源獨立乾淨供電；PWM 輸出到閘極驅動器的走線短而對稱，避免上下臂時序偏移造成貫穿。控制迴路設計要顧取樣延遲＋運算延遲＋PWM 更新延遲的總相位裕度，數位補償器（如 2p2z/3p3z）係數要照實際迴路延遲整定。",
    "circuits": [],
    "keyFormulas": [
      "TMS320F28P551SG：C28x 160MHz、100-PZ LQFP；HRPWM 皮秒級邊緣、CMPSS 硬體跳脫",
      "HRPWM 有效占空比解析度 ≫ 系統時脈/開關週期（皮秒級微步）",
      "數位控制迴路總延遲 = 取樣＋運算＋PWM 更新；相位裕度據此整定補償器",
      "CMPSS 硬體過流/過壓跳脫 ~數十–數百 ns，遠快於軟體迴路"
    ],
    "designNotes": [
      "高開關頻率數位電源用 HRPWM 補占空比解析度，避免量化造成的極限環與輸出抖動",
      "過流/過壓保護用 CMPSS 硬體跳脫直接關 PWM，別只靠軟體中斷（太慢救不了功率級）",
      "ADC 與 PWM 同步觸發，在開關雜訊最小時刻取樣電流/電壓，降低取樣誤差",
      "類比回授走線遠離 SW/PWM 切換雜訊，ADC 參考與類比電源獨立乾淨供電＋就近去耦",
      "PWM→閘極驅動走線短而上下臂對稱，死區時間顧好避免貫穿；控制迴路照總延遲整定補償器"
    ],
    "commonMistakes": [
      "用一般 PWM 解析度做高頻數位電源，占空比量化誤差造成極限環、輸出電壓抖動",
      "過流保護只寫在軟體中斷，回應太慢，短路時功率級已炸",
      "ADC 隨意取樣沒和 PWM 同步，取到開關雜訊尖峰，回授失真、迴路不穩",
      "類比回授緊貼開關節點走線，切換雜訊耦合進 ADC，量測值跳動"
    ],
    "examples": [
      {
        "title": "數位控制 PFC/DC-DC 或馬達驅動",
        "application": "TMS320F28P551SG 以 HRPWM＋CMPSS＋同步 ADC 做數位 PFC/LLC 或 FOC 馬達控制，硬體快保護",
        "circuit": "電流/電壓感測 → 同步 ADC → C28x 補償器運算 → HRPWM → 閘極驅動 → 功率級；CMPSS 硬體跳脫"
      }
    ],
    "relatedTopics": ["isolated-gate-driver", "vrm-multiphase", "current-sense-kelvin"],
    "i18n": {
      "en": {
        "title": "C2000 Real-Time Control MCU Digital Power Design (HRPWM / CMPSS Fast Trip / Synchronized ADC)",
        "description": "Digital power and motor control must close the loop within tens of kHz to MHz - a real-time MCU like the C2000 uses high-resolution PWM, an on-chip comparator for fast protection and a synchronized ADC to move the analog loop into the digital domain; get layout or timing wrong and the loop is unstable or the power stage blows up.",
        "principles": "The C2000 (e.g. the TMS320F28P551SG, C28x DSP core at 160MHz, 100-PZ LQFP; or the triple-core F29) is an MCU built for real-time control, closing the analog feedback, computation and PWM output of a power supply or motor entirely inside one fast control loop (a tens-to-hundreds-of-kHz interrupt service routine). Key peripherals: HRPWM (high-resolution PWM) subdivides the PWM edge resolution from the system clock period down to picoseconds, so digital power still has enough duty-cycle resolution at high switching frequency - otherwise quantization error causes output-voltage jitter or a limit cycle. CMPSS (comparator subsystem) has an on-chip analog comparator plus DAC reference and can trip the PWM (trip zone) directly in hardware within tens to hundreds of ns on overcurrent/overvoltage, far faster than a software loop, protecting the power stage. The integrated high-speed ADC plus trigger chain can sample in sync with the PWM (capturing current/voltage at the instant of least switching noise), lowering sampling noise. In layout, the analog feedback signals (current sense, dividers) must stay away from the switching noise of the PWM/switch node, and the ADC reference and analog supply need clean, separate power; the PWM-to-gate-driver traces should be short and symmetric to avoid high/low-side timing skew causing shoot-through. Loop design must account for the total phase margin of sampling delay plus computation delay plus PWM-update delay, and the digital compensator (e.g. 2p2z/3p3z) coefficients must be tuned to the real loop delay.",
        "designNotes": [
          "Use HRPWM to make up duty-cycle resolution in high-switching-frequency digital power, avoiding quantization-driven limit cycles and output jitter",
          "Use CMPSS hardware trip to cut the PWM directly for overcurrent/overvoltage - do not rely on a software ISR alone (too slow to save the power stage)",
          "Trigger the ADC in sync with the PWM to sample current/voltage at the instant of least switching noise, lowering sampling error",
          "Keep analog feedback routing away from SW/PWM switching noise, and give the ADC reference and analog supply clean, separate power with local decoupling",
          "Keep PWM-to-gate-driver traces short and high/low-side symmetric, mind the dead time to avoid shoot-through, and tune the compensator to the total loop delay"
        ],
        "commonMistakes": [
          "Using ordinary PWM resolution for high-frequency digital power, so duty-cycle quantization error causes a limit cycle and output-voltage jitter",
          "Putting overcurrent protection only in a software ISR, which responds too slowly and blows the power stage on a short",
          "Sampling the ADC without synchronizing to the PWM, catching a switching-noise spike, distorting feedback and destabilizing the loop",
          "Routing analog feedback right against the switch node, coupling switching noise into the ADC so readings jump around"
        ]
      },
      "ja": {
        "title": "C2000 リアルタイム制御 MCU デジタル電源設計（HRPWM／CMPSS 高速トリップ／同期 ADC）",
        "description": "デジタル電源とモータ制御は数十 kHz～MHz でループを閉じる必要がある——C2000 のようなリアルタイム MCU は高分解能 PWM、オンチップ比較器による高速保護、同期 ADC でアナログループをデジタル領域へ移す；レイアウトやタイミングを外すとループが不安定になるかパワー段が破壊される。",
        "principles": "C2000（例：TMS320F28P551SG、C28x DSP コア 160MHz、100-PZ LQFP；または 3 コアの F29）はリアルタイム制御向けに設計された MCU で、電源やモータのアナログ帰還・演算・PWM 出力を一つの高速制御ループ（数十～数百 kHz の割り込みサービスルーチン）内で完全に閉じることが核心である。主要ペリフェラル：HRPWM（高分解能 PWM）は PWM エッジ分解能をシステムクロック周期からピコ秒級まで細分し、高スイッチング周波数でもデジタル電源に十分なデューティ分解能を与える。さもないと量子化誤差が出力電圧ジッタやリミットサイクルを引き起こす。CMPSS（比較器サブシステム）はオンチップアナログ比較器＋DAC 参照を持ち、過電流/過電圧に対してハードウェアで数十～数百 ns 以内に PWM をトリップ（トリップゾーン）でき、ソフトウェアループよりはるかに速くパワー段を保護する。集積された高速 ADC＋トリガチェーンは PWM と同期してサンプリングでき（スイッチング雑音が最小の瞬間に電流/電圧を取得）、サンプリング雑音を下げる。レイアウトでは帰還アナログ信号（電流センス、分圧）を PWM/スイッチノードのスイッチング雑音から遠ざけ、ADC 参照とアナログ電源はクリーンに分離給電する；PWM からゲートドライバへの配線は短く対称にし、上下アームのタイミングずれによる貫通を避ける。ループ設計はサンプリング遅延＋演算遅延＋PWM 更新遅延の総位相余裕を考慮し、デジタル補償器（例：2p2z/3p3z）の係数を実際のループ遅延に合わせて整定する。",
        "designNotes": [
          "高スイッチング周波数のデジタル電源では HRPWM でデューティ分解能を補い、量子化によるリミットサイクルと出力ジッタを避ける",
          "過電流/過電圧保護は CMPSS ハードウェアトリップで直接 PWM を切る——ソフトウェア割り込みだけに頼らない（遅すぎてパワー段を救えない）",
          "ADC を PWM と同期してトリガし、スイッチング雑音が最小の瞬間に電流/電圧をサンプリングしてサンプリング誤差を下げる",
          "帰還アナログ配線を SW/PWM のスイッチング雑音から遠ざけ、ADC 参照とアナログ電源をクリーンに分離給電＋ローカルデカップリング",
          "PWM からゲートドライバへの配線を短く上下アーム対称にし、デッドタイムに注意して貫通を避け、補償器を総ループ遅延に合わせて整定"
        ],
        "commonMistakes": [
          "高周波デジタル電源に通常の PWM 分解能を使い、デューティ量子化誤差でリミットサイクルと出力電圧ジッタが起きる",
          "過電流保護をソフトウェア割り込みだけに書き、応答が遅すぎて短絡時にパワー段が破壊される",
          "ADC を PWM と同期せずに任意にサンプリングしスイッチング雑音のスパイクを拾い、帰還が歪みループが不安定化",
          "帰還アナログをスイッチノードに密着させて配線し、スイッチング雑音が ADC に結合して測定値が跳ねる"
        ]
      },
      "ko": {
        "title": "C2000 실시간 제어 MCU 디지털 전원 설계(HRPWM/CMPSS 고속 트립/동기 ADC)",
        "description": "디지털 전원과 모터 제어는 수십 kHz~MHz 내에서 루프를 닫아야 한다 - C2000 같은 실시간 MCU는 고분해능 PWM, 온칩 비교기 고속 보호, 동기 ADC로 아날로그 루프를 디지털 영역으로 옮긴다; 레이아웃이나 타이밍을 잘못하면 루프가 불안정하거나 파워단이 터진다.",
        "principles": "C2000(예: TMS320F28P551SG, C28x DSP 코어 160MHz, 100-PZ LQFP; 또는 3코어 F29)은 실시간 제어용으로 설계된 MCU로, 전원이나 모터의 아날로그 피드백·연산·PWM 출력을 하나의 고속 제어 루프(수십~수백 kHz 인터럽트 서비스 루틴) 안에서 완전히 닫는 것이 핵심이다. 주요 주변장치: HRPWM(고분해능 PWM)은 PWM 에지 분해능을 시스템 클록 주기에서 피코초급까지 세분해 고스위칭 주파수에서도 디지털 전원에 충분한 듀티 분해능을 준다. 그렇지 않으면 양자화 오차가 출력 전압 지터나 리미트 사이클을 일으킨다. CMPSS(비교기 서브시스템)는 온칩 아날로그 비교기+DAC 기준을 가지고 과전류/과전압에 대해 하드웨어로 수십~수백 ns 이내에 PWM을 트립(트립 존)할 수 있어 소프트웨어 루프보다 훨씬 빨라 파워단을 보호한다. 집적된 고속 ADC+트리거 체인은 PWM과 동기해 샘플링할 수 있어(스위칭 잡음이 최소인 순간에 전류/전압 포착) 샘플링 잡음을 낮춘다. 레이아웃에서 피드백 아날로그 신호(전류 센스, 분압)는 PWM/스위치 노드의 스위칭 잡음에서 멀리 두고, ADC 기준과 아날로그 전원은 깨끗하게 분리 급전한다; PWM에서 게이트 드라이버로의 배선은 짧고 대칭으로 해 상하암 타이밍 스큐로 인한 슛스루를 피한다. 루프 설계는 샘플링 지연+연산 지연+PWM 갱신 지연의 총 위상 여유를 고려하고, 디지털 보상기(예: 2p2z/3p3z) 계수를 실제 루프 지연에 맞춰 정정한다.",
        "designNotes": [
          "고스위칭 주파수 디지털 전원에는 HRPWM으로 듀티 분해능을 보충해 양자화로 인한 리미트 사이클과 출력 지터를 피함",
          "과전류/과전압 보호는 CMPSS 하드웨어 트립으로 PWM을 직접 차단 - 소프트웨어 인터럽트에만 의존하지 않음(너무 느려 파워단을 못 구함)",
          "ADC를 PWM과 동기 트리거해 스위칭 잡음이 최소인 순간에 전류/전압을 샘플링해 샘플링 오차를 낮춤",
          "피드백 아날로그 배선을 SW/PWM 스위칭 잡음에서 멀리 두고, ADC 기준과 아날로그 전원을 깨끗하게 분리 급전+로컬 디커플링",
          "PWM에서 게이트 드라이버 배선을 짧고 상하암 대칭으로, 데드타임에 유의해 슛스루를 피하고 보상기를 총 루프 지연에 맞춰 정정"
        ],
        "commonMistakes": [
          "고주파 디지털 전원에 일반 PWM 분해능을 써 듀티 양자화 오차로 리미트 사이클과 출력 전압 지터 발생",
          "과전류 보호를 소프트웨어 인터럽트에만 작성해 응답이 너무 느려 단락 시 파워단이 터짐",
          "ADC를 PWM과 동기하지 않고 임의로 샘플링해 스위칭 잡음 스파이크를 잡아 피드백이 왜곡되고 루프가 불안정",
          "피드백 아날로그를 스위치 노드에 밀착 배선해 스위칭 잡음이 ADC에 결합되어 측정값이 튐"
        ]
      }
    },
    "sourcePdf": "IC-spec/tms320f28p551sg.pdf",
    "createdAt": "2026-07-11T00:00:00Z",
    "updatedAt": "2026-07-11T00:00:00Z"
  });

  CARDS.push({
    "id": "multichannel-sar-afe",
    "title": "多通道整合 AFE 的 SAR ADC 前端（高阻輸入／內建 PGA／多工掃描）",
    "category": "measurement",
    "products": ["通用"],
    "description": "多通道量測想省下外部運放與保護，整合 AFE 的 SAR ADC 把高阻抗輸入、可程式增益、輸入多工全塞進一顆——但輸入範圍、共模、掃描時序沒設好，通道間就串擾或飽和。",
    "principles": "傳統多通道量測要在每個通道前放運放緩衝、衰減/增益、保護與抗混疊濾波，再多工進 ADC。整合 AFE 的 SAR ADC（如 ADS8688W，16-bit 500kSPS 8 通道，內建 AFE）把這些整合進單晶片：每個通道有高阻抗輸入（可直接接感測器/分壓而不明顯負載）、可程式增益/輸入範圍（如 ±10V/±5V/0–10V 等多種軟體選擇，內部把高壓輸入衰減到 ADC 核心範圍）、輸入多工器與自動掃描序列，讓一顆 ADC 分時服務多通道。SAR（逐次逼近）架構每次轉換要在取樣（sample）階段對內部取樣電容充電到輸入電壓，因此輸入的驅動源阻抗與取樣時間要匹配——雖然整合 AFE 已提供高阻輸入緩衝，仍要顧採樣建立時間與抗混疊。多通道掃描時，通道切換後取樣電容要有足夠建立時間，否則前一通道的殘餘電荷造成通道間串擾（尤其大訊號跳到小訊號時）。輸入共模與範圍要在規格內，超過會飽和或觸發內部保護；參考電壓（內部或外部 REF）的精度與去耦直接決定滿刻度精度與雜訊。",
    "circuits": [],
    "keyFormulas": [
      "ADS8688W：16-bit 500kSPS 8 通道 SAR＋整合 AFE，多種軟體可選輸入範圍（如 ±10V/±5V/0–10V）",
      "SAR 取樣建立：source 阻抗×取樣電容的 RC 要 ≪ 取樣時間（誤差 < ½ LSB）",
      "通道掃描切換後留足建立時間，避免大→小訊號的通道間串擾",
      "有效解析度受參考雜訊/精度、輸入雜訊與建立誤差共同限制"
    ],
    "designNotes": [
      "用內建可程式輸入範圍匹配感測器滿刻度，別讓訊號只用到 ADC 一小段動態範圍",
      "輸入共模與範圍守在規格內，超範圍會飽和或觸發保護，量測失真",
      "多通道自動掃描留足通道切換後的取樣建立時間，抑制通道間串擾",
      "參考電壓（內/外部 REF）精度與就近去耦決定滿刻度精度，REF 走線遠離數位雜訊",
      "高阻輸入仍要顧抗混疊：輸入端 RC 濾波截止頻率與取樣率配好，別讓帶外雜訊摺回"
    ],
    "commonMistakes": [
      "輸入範圍選太大，小訊號只用到少數 LSB，有效解析度浪費",
      "多通道掃描切太快，取樣電容沒建立完，大訊號通道殘餘造成鄰通道讀值偏移（串擾）",
      "忽略參考去耦與精度，滿刻度飄、雜訊底抬高",
      "以為整合 AFE 就不用抗混疊，帶外雜訊摺回落在訊號帶內"
    ],
    "examples": [
      {
        "title": "工業多通道資料擷取",
        "application": "ADS8688W 8 通道整合 AFE 直接量多路感測器（±10V/電流環等），省外部運放與保護",
        "circuit": "多路感測器 → 高阻輸入＋PGA → 內部多工掃描 → SAR ADC → SPI → MCU；外接精密 REF＋去耦"
      }
    ],
    "relatedTopics": ["current-sense-kelvin", "jesd204-converter-clocking"],
    "i18n": {
      "en": {
        "title": "Multichannel SAR ADC with Integrated AFE (High-Z Input / Built-in PGA / Muxed Scanning)",
        "description": "To save the external op-amps and protection in multichannel measurement, a SAR ADC with integrated AFE packs high-impedance input, programmable gain and an input mux into one chip - but set the input range, common mode or scan timing wrong and channels cross-talk or saturate.",
        "principles": "Traditional multichannel measurement puts an op-amp buffer, attenuation/gain, protection and anti-alias filtering in front of each channel, then muxes into the ADC. A SAR ADC with an integrated AFE (e.g. the ADS8688W, 16-bit 500kSPS, 8 channels, built-in AFE) integrates all of that on one die: each channel has a high-impedance input (it can drive a sensor/divider directly without noticeable loading), programmable gain/input range (e.g. software-selectable +/-10V, +/-5V, 0-10V, with the high-voltage input internally attenuated to the ADC core range), and an input mux with an auto-scan sequence so one ADC time-shares across channels. A SAR (successive-approximation) core must charge its internal sampling capacitor to the input voltage during the sample phase, so the input's drive source impedance and sample time must match - even though the integrated AFE provides a high-Z buffer, you still watch sampling settling and anti-aliasing. During a multichannel scan, the sampling capacitor needs enough settling time after a channel switch, or residual charge from the previous channel causes channel-to-channel cross-talk (especially jumping from a large signal to a small one). The input common mode and range must stay in spec, or the input saturates or trips internal protection; the reference voltage (internal or external REF) accuracy and decoupling set full-scale accuracy and noise directly.",
        "designNotes": [
          "Use the built-in programmable input range to match the sensor full-scale - do not leave the signal using only a small part of the ADC dynamic range",
          "Keep the input common mode and range within spec; going out of range saturates or trips protection and distorts the measurement",
          "In a multichannel auto-scan, allow enough settling time after a channel switch to suppress channel-to-channel cross-talk",
          "Reference (internal/external REF) accuracy and local decoupling set full-scale accuracy - route REF away from digital noise",
          "A high-Z input still needs anti-aliasing: match the input RC filter cutoff to the sample rate so out-of-band noise does not fold back"
        ],
        "commonMistakes": [
          "Choosing too large an input range, so a small signal uses only a few LSBs and effective resolution is wasted",
          "Scanning channels too fast so the sampling capacitor has not settled, and residue from a large-signal channel shifts the neighbor reading (cross-talk)",
          "Ignoring reference decoupling and accuracy, so full-scale drifts and the noise floor rises",
          "Assuming the integrated AFE removes the need for anti-aliasing, so out-of-band noise folds into the signal band"
        ]
      },
      "ja": {
        "title": "AFE 集積の多チャネル SAR ADC フロントエンド（高インピーダンス入力／内蔵 PGA／マルチプレクサ走査）",
        "description": "多チャネル測定で外付けオペアンプと保護を省くため、AFE 集積 SAR ADC は高インピーダンス入力・可変利得・入力マルチプレクサを 1 チップに詰め込む——しかし入力範囲・同相・走査タイミングを誤るとチャネル間クロストークや飽和が起きる。",
        "principles": "従来の多チャネル測定は各チャネル前にオペアンプバッファ、減衰/利得、保護、アンチエイリアシングフィルタを置き、その後 ADC へマルチプレクスする。AFE 集積の SAR ADC（例：ADS8688W、16 ビット 500kSPS、8 チャネル、AFE 内蔵）はこれらを 1 ダイに集積する：各チャネルに高インピーダンス入力（センサ/分圧を目立った負荷なく直接駆動可能）、可変利得/入力範囲（例：ソフトウェア選択の ±10V/±5V/0-10V、高電圧入力を内部で ADC コア範囲へ減衰）、入力マルチプレクサと自動走査シーケンスがあり、1 個の ADC が時分割で複数チャネルを担う。SAR（逐次比較）コアはサンプル期に内部サンプリングコンデンサを入力電圧まで充電する必要があるため、入力の駆動源インピーダンスとサンプル時間を整合させる——AFE 集積が高インピーダンスバッファを提供しても、サンプリング整定とアンチエイリアシングは依然として要注意である。多チャネル走査時はチャネル切替後にサンプリングコンデンサに十分な整定時間が必要で、さもないと前チャネルの残留電荷がチャネル間クロストークを生む（特に大信号から小信号へ移るとき）。入力同相と範囲は規格内に保つ必要があり、超えると飽和や内部保護動作になる；参照電圧（内蔵/外付け REF）の精度とデカップリングがフルスケール精度と雑音を直接決める。",
        "designNotes": [
          "内蔵の可変入力範囲でセンサのフルスケールに合わせる——信号が ADC ダイナミックレンジの一部しか使わない状態にしない",
          "入力同相と範囲を規格内に保つ；範囲を超えると飽和や保護動作で測定が歪む",
          "多チャネル自動走査ではチャネル切替後に十分な整定時間を確保しチャネル間クロストークを抑える",
          "参照（内蔵/外付け REF）の精度とローカルデカップリングがフルスケール精度を決める——REF 配線をデジタル雑音から遠ざける",
          "高インピーダンス入力でもアンチエイリアシングは必要：入力 RC フィルタのカットオフをサンプルレートに合わせ帯域外雑音が折り返さないようにする"
        ],
        "commonMistakes": [
          "入力範囲を大きく取りすぎ、小信号が数 LSB しか使わず有効分解能が無駄になる",
          "チャネルを速く走査しすぎサンプリングコンデンサが整定せず、大信号チャネルの残留が隣チャネルの読値をずらす（クロストーク）",
          "参照のデカップリングと精度を無視し、フルスケールがドリフトし雑音底が上がる",
          "AFE 集積だからとアンチエイリアシングを不要と思い込み、帯域外雑音が信号帯域に折り返す"
        ]
      },
      "ko": {
        "title": "AFE 집적 다채널 SAR ADC 프런트엔드(고임피던스 입력/내장 PGA/멀티플렉서 스캔)",
        "description": "다채널 측정에서 외부 op-amp와 보호를 줄이려고 AFE 집적 SAR ADC는 고임피던스 입력·가변 이득·입력 멀티플렉서를 한 칩에 넣는다 - 그러나 입력 범위·공통 모드·스캔 타이밍을 잘못하면 채널 간 크로스토크나 포화가 생긴다.",
        "principles": "전통적 다채널 측정은 각 채널 앞에 op-amp 버퍼, 감쇠/이득, 보호, 안티에일리어싱 필터를 두고 ADC로 멀티플렉싱한다. AFE 집적 SAR ADC(예: ADS8688W, 16비트 500kSPS, 8채널, AFE 내장)는 이를 한 다이에 집적한다: 각 채널에 고임피던스 입력(센서/분압을 눈에 띄는 부하 없이 직접 구동 가능), 가변 이득/입력 범위(예: 소프트웨어 선택 ±10V/±5V/0-10V, 고전압 입력을 내부에서 ADC 코어 범위로 감쇠), 입력 멀티플렉서와 자동 스캔 시퀀스가 있어 하나의 ADC가 시분할로 여러 채널을 담당한다. SAR(축차 비교) 코어는 샘플 구간에 내부 샘플링 커패시터를 입력 전압까지 충전해야 하므로 입력의 구동 소스 임피던스와 샘플 시간을 정합해야 한다 - AFE 집적이 고임피던스 버퍼를 제공해도 샘플링 정착과 안티에일리어싱은 여전히 주의해야 한다. 다채널 스캔 시 채널 전환 후 샘플링 커패시터에 충분한 정착 시간이 필요하며, 그렇지 않으면 이전 채널의 잔류 전하가 채널 간 크로스토크를 만든다(특히 큰 신호에서 작은 신호로 넘어갈 때). 입력 공통 모드와 범위는 규격 내로 유지해야 하며, 초과하면 포화나 내부 보호 동작이 된다; 기준 전압(내장/외부 REF)의 정확도와 디커플링이 풀스케일 정확도와 잡음을 직접 결정한다.",
        "designNotes": [
          "내장 가변 입력 범위로 센서 풀스케일에 맞춤 - 신호가 ADC 다이내믹 레인지의 일부만 쓰지 않게 함",
          "입력 공통 모드와 범위를 규격 내로 유지; 범위를 넘으면 포화나 보호 동작으로 측정이 왜곡됨",
          "다채널 자동 스캔에서 채널 전환 후 충분한 정착 시간을 확보해 채널 간 크로스토크를 억제",
          "기준(내장/외부 REF) 정확도와 로컬 디커플링이 풀스케일 정확도를 결정 - REF 배선을 디지털 잡음에서 멀리함",
          "고임피던스 입력도 안티에일리어싱이 필요: 입력 RC 필터 컷오프를 샘플 레이트에 맞춰 대역 외 잡음이 접히지 않게 함"
        ],
        "commonMistakes": [
          "입력 범위를 너무 크게 잡아 작은 신호가 몇 LSB만 써서 유효 분해능이 낭비됨",
          "채널을 너무 빨리 스캔해 샘플링 커패시터가 정착하지 못하고, 큰 신호 채널의 잔류가 이웃 채널 읽기를 이동시킴(크로스토크)",
          "기준 디커플링과 정확도를 무시해 풀스케일이 드리프트하고 잡음 바닥이 올라감",
          "AFE 집적이라 안티에일리어싱이 필요 없다고 여겨 대역 외 잡음이 신호 대역으로 접힘"
        ]
      }
    },
    "sourcePdf": "IC-spec/ads8688w.pdf",
    "createdAt": "2026-07-11T00:00:00Z",
    "updatedAt": "2026-07-11T00:00:00Z"
  });

  CARDS.push({
    "id": "space-grade-supervisor",
    "title": "太空級電壓監控與看門狗（多路 UV/OV＋SEE 加固＋序列監控）",
    "category": "power-management",
    "products": ["通用"],
    "description": "衛星/太空電子沒法現場重開機，電源監控與看門狗是最後防線——多路欠壓/過壓監控、上下電序列、看門狗，還要對抗單粒子效應（SEE），一顆閂鎖就可能報廢整個載荷。",
    "principles": "太空級（rad-hard/QMLV）電壓監控器與看門狗（如 TPS7H3034-SP，太空級四路電壓監控＋看門狗，22-CFP，push-pull 輸出）是電源系統的安全網。多路電壓監控同時盯多條供電軌的欠壓（UV）與過壓（OV），任一軌越界就發出 reset/中斷，避免處理器在電壓異常下執行錯誤指令或損傷；上下電序列監控確保多電壓域按正確順序上電（如先核心後 I/O，或反之），順序錯誤會造成閂鎖或漏電路徑。看門狗（watchdog）要求被監看的處理器週期性餵狗，若軟體當掉沒餵狗，看門狗逾時觸發 reset 把系統拉回已知狀態——太空環境沒有人能按重開機鍵，看門狗是自主復原的關鍵。太空環境的核心挑戰是輻射：總游離劑量（TID）造成參數漂移，單粒子效應（SEE）包括單粒子翻轉（SEU，改變暫存器/邏輯狀態）與單粒子閂鎖（SEL，寄生 SCR 導通造成大電流閂鎖，可能永久損壞）——太空級元件經過抗輻射設計與 QMLV/SMD 篩選加固，門檻閾值精度與輸出（push-pull 可主動拉高拉低、不需外部上拉，在高輻射下狀態比開汲極確定）都為此優化。供電與參考要冗餘、去耦，監控閾值的分壓電阻要用高穩定度、抗輻射的精密電阻。",
    "circuits": [],
    "keyFormulas": [
      "TPS7H3034-SP：太空級四路電壓監控＋看門狗，22-CFP(HFT)+蓋/EP=23 腳，push-pull 輸出",
      "監控閾值分壓：Vth = Vref·(1+R1/R2)，用高穩定/抗輻射精密電阻",
      "看門狗逾時 → 自主 reset（太空無人工重開機）",
      "SEE：SEU（單粒子翻轉）／SEL（單粒子閂鎖，寄生 SCR 大電流，可能永久損壞）；TID 選件看 krad(Si) 額定"
    ],
    "designNotes": [
      "多路 UV/OV 同時監控各供電軌，任一越界即 reset/中斷，避免異常電壓下誤動作或損傷",
      "上下電序列照處理器規範排序，避免順序錯誤造成閂鎖或漏電路徑",
      "看門狗餵狗機制要涵蓋真正的主迴路健康度，別只在空迴圈餵狗（會掩蓋當機）",
      "push-pull 輸出主動拉高拉低、不靠外部上拉，在高輻射下狀態比開汲極確定",
      "監控閾值分壓與參考用高穩定/抗輻射精密電阻，供電/參考冗餘＋去耦；選件看 TID(krad) 與 SEL 免閂鎖額定"
    ],
    "commonMistakes": [
      "只監控單一軌或只做 UV 不做 OV，過壓事件沒抓到就損傷下游",
      "看門狗在空迴圈或中斷裡固定餵狗，主任務當掉也照餵，看門狗形同虛設",
      "上下電序列沒管，多域亂序上電造成閂鎖或大漏電",
      "用商規/一般精密電阻做閾值分壓，輻射下阻值漂移使閾值跑掉",
      "忽略 SEL 額定，單粒子閂鎖造成大電流永久損壞元件"
    ],
    "examples": [
      {
        "title": "衛星載荷電源安全網",
        "application": "TPS7H3034-SP 監控 FPGA/處理器多路供電＋看門狗，SEE 加固，自主復原無需地面介入",
        "circuit": "各供電軌 → 分壓 → 四路 UV/OV 監控 → RESET/中斷；處理器週期餵狗 → 看門狗逾時 reset"
      }
    ],
    "relatedTopics": ["space-grade-power", "large-bga-power-integrity", "c2000-digital-power-control"],
    "i18n": {
      "en": {
        "title": "Space-Grade Voltage Supervisor and Watchdog (Multi-rail UV/OV + SEE Hardening + Sequence Monitor)",
        "description": "Satellite/space electronics cannot be power-cycled on site, so the voltage supervisor and watchdog are the last line of defense - multi-rail undervoltage/overvoltage monitoring, power sequencing, a watchdog, and single-event-effect (SEE) resistance; one latch-up can lose the whole payload.",
        "principles": "A space-grade (rad-hard/QMLV) voltage supervisor and watchdog (e.g. the TPS7H3034-SP, a space-grade four-rail voltage supervisor plus watchdog, 22-CFP, push-pull output) is the power system's safety net. Multi-rail monitoring watches undervoltage (UV) and overvoltage (OV) on several supply rails at once and issues a reset/interrupt when any rail goes out of bounds, keeping the processor from executing wrong instructions or being damaged under abnormal voltage; power-sequence monitoring ensures the multiple voltage domains come up in the correct order (e.g. core before I/O, or the reverse), since a wrong order can cause latch-up or leakage paths. The watchdog requires the monitored processor to service it periodically; if software hangs and stops feeding it, the watchdog times out and resets the system back to a known state - in space no one can press a reset button, so the watchdog is the key to autonomous recovery. The core challenge of the space environment is radiation: total ionizing dose (TID) causes parameter drift, and single-event effects (SEE) include single-event upset (SEU, flipping a register/logic state) and single-event latch-up (SEL, a parasitic SCR turning on into a high-current latch that can be permanently destructive) - space-grade parts are radiation-hardened by design and QMLV/SMD screened, with threshold accuracy and the output (push-pull actively drives high and low, needs no external pull-up, and is more deterministic than open-drain under high radiation) optimized for this. Supply and reference should be redundant and decoupled, and the threshold-divider resistors should be high-stability, radiation-tolerant precision resistors.",
        "designNotes": [
          "Monitor all supply rails for UV/OV simultaneously and reset/interrupt on any excursion, preventing misbehavior or damage under abnormal voltage",
          "Sequence power-up/down per the processor spec to avoid latch-up or leakage paths from a wrong order",
          "Make the watchdog service reflect real main-loop health - do not feed it from an idle loop (that masks a hang)",
          "A push-pull output actively drives high and low without an external pull-up, giving a more deterministic state under high radiation than open-drain",
          "Use high-stability, radiation-tolerant precision resistors for the threshold divider and reference; make supply/reference redundant and decoupled; select parts by TID (krad) and SEL latch-up-immunity rating"
        ],
        "commonMistakes": [
          "Monitoring only one rail, or doing UV but not OV, so an overvoltage event goes uncaught and damages downstream",
          "Feeding the watchdog from a fixed point in an idle loop or interrupt, so it is still fed when the main task hangs, making the watchdog useless",
          "Not managing the power-up/down sequence, so out-of-order multi-domain power-up causes latch-up or large leakage",
          "Using commercial/ordinary precision resistors for the threshold divider, so their value drifts under radiation and the threshold moves",
          "Ignoring the SEL rating, so a single-event latch-up destroys the part with high current"
        ]
      },
      "ja": {
        "title": "宇宙グレード電圧スーパーバイザとウォッチドッグ（多レール UV/OV＋SEE 耐性＋シーケンス監視）",
        "description": "衛星/宇宙用エレクトロニクスは現地で電源再投入できないため、電圧スーパーバイザとウォッチドッグが最後の砦である——多レールの低電圧/過電圧監視、電源シーケンス、ウォッチドッグ、そして単一事象効果（SEE）耐性；一度のラッチアップでペイロード全体を失いかねない。",
        "principles": "宇宙グレード（rad-hard/QMLV）電圧スーパーバイザとウォッチドッグ（例：TPS7H3034-SP、宇宙グレードの 4 レール電圧スーパーバイザ＋ウォッチドッグ、22-CFP、プッシュプル出力）は電源システムの安全網である。多レール監視は複数電源レールの低電圧（UV）と過電圧（OV）を同時に監視し、いずれかが範囲を外れると reset/割り込みを出し、異常電圧下でプロセッサが誤命令を実行したり損傷したりするのを防ぐ；電源シーケンス監視は複数電圧ドメインが正しい順序で立ち上がる（例：コアの後に I/O、または逆）ことを保証し、順序を誤るとラッチアップやリーク経路を生む。ウォッチドッグは監視対象プロセッサに定期的なサービスを要求し、ソフトウェアがハングして餌やりを止めるとタイムアウトしてシステムを既知状態へリセットする——宇宙では誰もリセットボタンを押せないため、ウォッチドッグは自律復旧の鍵である。宇宙環境の核心的課題は放射線である：総電離線量（TID）はパラメータドリフトを起こし、単一事象効果（SEE）には単一事象アップセット（SEU、レジスタ/論理状態の反転）と単一事象ラッチアップ（SEL、寄生 SCR が導通して大電流ラッチとなり永久破壊しうる）が含まれる——宇宙グレード部品は設計段階で放射線耐性化され QMLV/SMD スクリーニングされ、しきい値精度と出力（プッシュプルは能動的にハイ/ローを駆動し外部プルアップ不要で、高放射線下ではオープンドレインより状態が確定的）がこのために最適化されている。電源と参照は冗長化しデカップリングし、しきい値分圧抵抗は高安定・放射線耐性の高精度抵抗を用いる。",
        "designNotes": [
          "全電源レールの UV/OV を同時監視し、逸脱時に reset/割り込みを出して異常電圧下の誤動作や損傷を防ぐ",
          "電源投入/切断をプロセッサ仕様どおりにシーケンスし、順序誤りによるラッチアップやリーク経路を避ける",
          "ウォッチドッグのサービスが実際のメインループの健全性を反映するようにする——アイドルループから餌やりしない（ハングを隠す）",
          "プッシュプル出力は外部プルアップなしに能動的にハイ/ローを駆動し、高放射線下でオープンドレインより状態が確定的",
          "しきい値分圧と参照に高安定・放射線耐性の高精度抵抗を使い、電源/参照を冗長化＋デカップリング；部品は TID(krad) と SEL ラッチアップ耐性で選定"
        ],
        "commonMistakes": [
          "単一レールのみ、または UV だけで OV を監視せず、過電圧事象を捕捉できず下流を損傷",
          "ウォッチドッグをアイドルループや割り込みの固定点から餌やりし、メインタスクがハングしても餌やりされ続けウォッチドッグが無意味化",
          "電源投入/切断シーケンスを管理せず、多ドメインの順不同投入でラッチアップや大リークが起きる",
          "しきい値分圧に商用/一般の高精度抵抗を使い、放射線下で抵抗値がドリフトししきい値がずれる",
          "SEL 定格を無視し、単一事象ラッチアップが大電流で部品を永久破壊"
        ]
      },
      "ko": {
        "title": "우주급 전압 슈퍼바이저와 워치독(다중 레일 UV/OV+SEE 강화+시퀀스 감시)",
        "description": "위성/우주 전자는 현장에서 전원 재투입이 불가능해 전압 슈퍼바이저와 워치독이 최후의 방어선이다 - 다중 레일 저전압/과전압 감시, 전원 시퀀싱, 워치독, 그리고 단일 사건 효과(SEE) 내성; 한 번의 래치업으로 페이로드 전체를 잃을 수 있다.",
        "principles": "우주급(rad-hard/QMLV) 전압 슈퍼바이저와 워치독(예: TPS7H3034-SP, 우주급 4레일 전압 슈퍼바이저+워치독, 22-CFP, 푸시풀 출력)은 전원 시스템의 안전망이다. 다중 레일 감시는 여러 공급 레일의 저전압(UV)과 과전압(OV)을 동시에 감시해 어느 레일이든 범위를 벗어나면 reset/인터럽트를 내보내, 프로세서가 비정상 전압에서 잘못된 명령을 실행하거나 손상되는 것을 막는다; 전원 시퀀스 감시는 여러 전압 도메인이 올바른 순서로 올라오도록(예: 코어 다음 I/O, 또는 반대) 보장하며, 순서를 틀리면 래치업이나 누설 경로를 만든다. 워치독은 감시 대상 프로세서에 주기적 서비스를 요구하고, 소프트웨어가 멈춰 급이를 중단하면 타임아웃되어 시스템을 알려진 상태로 리셋한다 - 우주에서는 아무도 리셋 버튼을 누를 수 없어 워치독이 자율 복구의 열쇠다. 우주 환경의 핵심 과제는 방사선이다: 총 이온화 선량(TID)은 파라미터 드리프트를 일으키고, 단일 사건 효과(SEE)에는 단일 사건 업셋(SEU, 레지스터/논리 상태 반전)과 단일 사건 래치업(SEL, 기생 SCR이 도통해 대전류 래치가 되어 영구 파괴될 수 있음)이 포함된다 - 우주급 부품은 설계 단계에서 방사선 강화되고 QMLV/SMD 스크리닝되며, 임계값 정확도와 출력(푸시풀은 능동적으로 하이/로를 구동하고 외부 풀업이 불필요하며 고방사선에서 오픈드레인보다 상태가 결정적)이 이를 위해 최적화된다. 전원과 기준은 이중화·디커플링하고, 임계값 분압 저항은 고안정·방사선 내성 정밀 저항을 쓴다.",
        "designNotes": [
          "모든 공급 레일의 UV/OV를 동시 감시하고 이탈 시 reset/인터럽트를 내보내 비정상 전압에서의 오동작·손상을 방지",
          "전원 인가/차단을 프로세서 규격대로 시퀀싱해 순서 오류로 인한 래치업·누설 경로를 피함",
          "워치독 서비스가 실제 메인 루프 건전성을 반영하도록 함 - 아이들 루프에서 급이하지 않음(멈춤을 가림)",
          "푸시풀 출력은 외부 풀업 없이 능동적으로 하이/로를 구동해 고방사선에서 오픈드레인보다 상태가 결정적",
          "임계값 분압과 기준에 고안정·방사선 내성 정밀 저항을 쓰고 전원/기준을 이중화+디커플링; 부품은 TID(krad)와 SEL 래치업 면역 정격으로 선정"
        ],
        "commonMistakes": [
          "단일 레일만, 또는 UV만 하고 OV를 감시하지 않아 과전압 사건을 못 잡고 하류를 손상",
          "워치독을 아이들 루프나 인터럽트의 고정점에서 급이해 메인 태스크가 멈춰도 계속 급이되어 워치독이 무의미해짐",
          "전원 인가/차단 시퀀스를 관리하지 않아 다중 도메인 무순서 투입으로 래치업이나 대누설 발생",
          "임계값 분압에 상용/일반 정밀 저항을 써 방사선에서 저항값이 드리프트해 임계값이 어긋남",
          "SEL 정격을 무시해 단일 사건 래치업이 대전류로 부품을 영구 파괴"
        ]
      }
    },
    "sourcePdf": "IC-spec/tps7h3034-sp.pdf",
    "createdAt": "2026-07-11T00:00:00Z",
    "updatedAt": "2026-07-11T00:00:00Z"
  });

  window.KNOWLEDGE_EXTRA = (window.KNOWLEDGE_EXTRA || []).concat(CARDS);
})();
