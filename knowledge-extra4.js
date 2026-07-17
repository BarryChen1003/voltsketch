/**
 * knowledge-extra4.js — 特殊線路知識卡批4（datasheet 打底自撰；sourcePdf 指向館內 IC-spec／datasheets）
 * 8 張：GbE PHY 佈局／QSPI NOR Flash 開機電路／隔離電流量測／GaN 閘極驅動／
 *       三相 BLDC 智慧驅動／霍爾磁感測／車用矩陣式 LED 大燈／USB-C CC 邏輯與 mux。
 * 源料＝館內 IC：KSZ9031RNX·LAN8710A／W25Q128JV／AMC0206M25·AMC0303M2510／LMG1020-Q1·UCC57142-Q1／
 *       MCT8376Z-Q1·MCF8329HS·DRV8363／TMAG5134·TMAG5230·TMAG6184／TPS99002S-Q1／HD3SS3220L。
 * 併入方式同 extra2/3：concat 進 window.KNOWLEDGE_EXTRA，由 knowledge.js getSampleData() 吃入。
 * i18n 覆蓋 title/description/principles/designNotes/commonMistakes 五欄（keyFormulas/examples 沿用 zh）。
 */
(function () {
  var CARDS = [];

  CARDS.push({
    "id": "ethernet-phy-layout",
    "title": "乙太網 PHY 電路與佈局（RGMII/RMII、MDI 差分對、磁隔離）",
    "category": "high-speed",
    "products": ["AI 伺服器", "通用"],
    "description": "PHY 是 MAC 與網路線之間的實體層晶片——RGMII/RMII 數位側要顧時序 skew，MDI 類比側要顧 100Ω 差分阻抗與磁隔離；strap 腳開機取樣決定位址與模式，接錯開不了機。",
    "principles": "乙太網 PHY（如 GbE 的 KSZ9031RNX、10/100 的 LAN8710A）做兩件事：對 MAC 用 RGMII/RMII/MII 數位介面收發封包資料，對線材側把資料編碼成差分類比訊號經變壓器（magnetics）上線。RGMII 是 4-bit DDR、125MHz 的來源同步介面，TXC/RXC 時脈與資料的相對 skew 有規格（常靠 PHY 內部 delay 或 PCB 蛇形補償 ~1.5–2ns 的 clock delay）；RMII 只需 50MHz 單一參考時脈，腳數少適合小系統。MDI 側每對線是 100Ω 差分對，經變壓器中心抽頭（center tap）取得偏壓並隔離共模，Bob Smith 端接（75Ω+高壓電容到機殼地）吸收未用對與共模能量。PHY 的位址、介面模式常用 strap 腳在 reset 解除時取樣——這些腳平時是資料腳，上/下拉值與取樣時序都有規格，外部裝置若在 reset 期間拉動 strap 腳會改變開機組態。時脈來源（25MHz 晶振或 50MHz 振盪器）的精度需 ±50ppm 內。",
    "circuits": [],
    "keyFormulas": [
      "RGMII：4-bit DDR @125MHz＝1Gbps；clock-to-data skew 需求約 ±500ps（含內部 delay 模式）",
      "MDI 差分阻抗 100Ω ±10%；對內等長常抓 <5mil（0.127mm）",
      "Bob Smith 端接：未用中心抽頭經 75Ω＋1000pF/2kV 電容到機殼地",
      "參考時脈精度 ±50ppm（IEEE 802.3）"
    ],
    "designNotes": [
      "MDI 四對（GbE 全用）100Ω 差分、對內嚴格等長，變壓器與 RJ45 之間不跨分割地",
      "RGMII 用 PHY 內部 delay（registers/strap 可設）優先於 PCB 蛇形補償，板上等長仍需對齊資料群",
      "strap 腳（PHYAD/MODE）在 reset 上升緣取樣——同腳上掛的 LED 或其他裝置要確認不影響取樣位準",
      "變壓器中心抽頭依 PHY 電流模式/電壓模式驅動接對應電源或電容——照 PHY datasheet，不同家做法不同",
      "晶振走線短、地護欄圍起；50MHz RMII 時脈同時餵 MAC 與 PHY 時注意相位與負載"
    ],
    "commonMistakes": [
      "RGMII skew 沒補（內部 delay 沒開、板上也沒補償），link 起得來但大量 CRC 錯誤",
      "MDI 差分對跨參考地分割或穿過變壓器下方的隔離挖空區，EMI 與回損惡化",
      "strap 腳被外部電路在 reset 期間拉錯，PHY 位址/模式開機讀錯，MDIO 掃不到",
      "變壓器中心抽頭接法照抄別家 PHY（電流模式 vs 電壓模式不同），驅動幅度錯、眼圖崩"
    ],
    "examples": [
      {
        "title": "嵌入式 GbE 介面",
        "application": "SoC MAC ←RGMII→ KSZ9031RNX ←MDI 4 對→ 變壓器 → RJ45，MDIO/MDC 管理匯流排設定 PHY",
        "circuit": "SoC ←RGMII(12 線)→ PHY ←100Ω 差分×4→ magnetics（中心抽頭＋Bob Smith）→ RJ45"
      }
    ],
    "relatedTopics": ["differential-pair", "em-fields-return-path", "clock-tree-fanout"],
    "i18n": {
      "en": {
        "title": "Ethernet PHY Circuit & Layout (RGMII/RMII, MDI Pairs, Magnetics)",
        "description": "The PHY sits between the MAC and the cable - the RGMII/RMII digital side is about timing skew, the MDI analog side is about 100Ω differential impedance and magnetic isolation; strap pins sampled at power-up set address and mode, and a wrong strap means the link never comes up.",
        "principles": "An Ethernet PHY (KSZ9031RNX for GbE, LAN8710A for 10/100) does two jobs: it exchanges packet data with the MAC over a digital RGMII/RMII/MII interface, and it encodes data into differential analog signals that go onto the cable through a transformer (magnetics). RGMII is a 4-bit DDR source-synchronous interface at 125MHz; the relative skew between TXC/RXC clocks and data is specified and is usually met with the PHY internal delay mode or ~1.5-2ns of PCB serpentine on the clock. RMII needs only a single 50MHz reference clock and fewer pins. On the MDI side each pair is a 100Ω differential pair through the transformer, whose center tap provides bias and common-mode isolation; Bob Smith termination (75Ω plus a high-voltage capacitor to chassis ground) absorbs energy on unused pairs and common mode. PHY address and interface mode are set by strap pins sampled when reset deasserts - these pins double as data pins, their pull values and sampling timing are specified, and anything external that pulls a strap during reset changes the boot configuration. The reference clock (25MHz crystal or 50MHz oscillator) must be within ±50ppm.",
        "designNotes": [
          "Route all four MDI pairs (GbE uses all of them) as 100Ω differential with tight intra-pair matching, and never cross a ground split between magnetics and RJ45",
          "Prefer the PHY internal delay (register/strap selectable) over PCB serpentines for RGMII skew; still length-match within the data group on the board",
          "Strap pins (PHYAD/MODE) are sampled on the reset rising edge - check that LEDs or other loads on the same pins do not shift the sampled level",
          "Connect the transformer center taps per the PHY drive type (current mode vs voltage mode) - follow the PHY datasheet, vendors differ",
          "Keep the crystal short and guarded with ground; when one 50MHz RMII clock feeds both MAC and PHY, watch phase and loading"
        ],
        "commonMistakes": [
          "RGMII skew never compensated (internal delay off, no board compensation) - the link comes up but CRC errors pile up",
          "MDI pairs crossing a reference split or the isolation keepout under the magnetics, degrading EMI and return loss",
          "A strap pin pulled the wrong way by external circuitry during reset, so the PHY boots with the wrong address/mode and MDIO scans find nothing",
          "Copying another vendor's center-tap connection (current-mode vs voltage-mode differ), so drive amplitude is wrong and the eye collapses"
        ]
      },
      "ja": {
        "title": "イーサネット PHY 回路とレイアウト（RGMII/RMII、MDI 差動、パルストランス）",
        "description": "PHY は MAC とケーブルの間の物理層チップ——RGMII/RMII デジタル側はタイミングスキュー、MDI アナログ側は 100Ω 差動インピーダンスと磁気絶縁が要点。ストラップピンは起動時サンプリングでアドレスとモードを決め、間違えるとリンクが上がらない。",
        "principles": "イーサネット PHY（GbE の KSZ9031RNX、10/100 の LAN8710A）は 2 つの仕事をする：MAC と RGMII/RMII/MII デジタルインタフェースでパケットデータを交換し、データを差動アナログ信号に符号化してパルストランス経由でケーブルに送る。RGMII は 125MHz の 4 ビット DDR ソース同期インタフェースで、TXC/RXC クロックとデータの相対スキューが規定され、通常は PHY 内部ディレイモードかクロックへの約 1.5-2ns の基板ミアンダで満たす。RMII は 50MHz の単一基準クロックのみでピン数が少ない。MDI 側は各ペアが 100Ω 差動でトランスを通り、センタータップがバイアスとコモンモード絶縁を担い、Bob Smith 終端（75Ω＋高耐圧コンデンサでシャーシグランドへ）が未使用ペアとコモンモードのエネルギーを吸収する。PHY のアドレスとモードはリセット解除時にサンプリングされるストラップピンで決まる——これらは通常データピンを兼ね、プル値とサンプリングタイミングが規定されており、リセット中に外部回路がストラップを引くと起動構成が変わる。基準クロック（25MHz 水晶または 50MHz 発振器）は ±50ppm 以内。",
        "designNotes": [
          "MDI 4 ペア（GbE は全使用）を 100Ω 差動・ペア内厳密等長で配線し、トランスと RJ45 の間でグランド分割をまたがない",
          "RGMII スキューは基板ミアンダより PHY 内部ディレイ（レジスタ/ストラップ設定）を優先。基板上でもデータ群内は等長",
          "ストラップピン（PHYAD/MODE）はリセット立ち上がりでサンプリング——同じピンの LED や負荷がレベルを動かさないか確認",
          "トランスのセンタータップは PHY の駆動方式（電流モード/電圧モード）に従って接続——ベンダごとに違うので PHY データシートに従う",
          "水晶は短く配線しグランドで囲む。50MHz RMII クロックを MAC と PHY 両方に供給する場合は位相と負荷に注意"
        ],
        "commonMistakes": [
          "RGMII スキュー未補償（内部ディレイもオフ、基板補償もなし）でリンクは上がるが CRC エラーが多発",
          "MDI ペアが基準グランド分割やトランス下の絶縁キープアウトをまたぎ、EMI とリターンロスが悪化",
          "リセット中に外部回路がストラップを誤った方向に引き、PHY のアドレス/モードが誤読、MDIO スキャンで見つからない",
          "他社 PHY のセンタータップ接続を流用（電流モードと電圧モードで異なる）、駆動振幅が狂いアイが崩れる"
        ]
      },
      "ko": {
        "title": "이더넷 PHY 회로와 레이아웃(RGMII/RMII, MDI 차동, 마그네틱스)",
        "description": "PHY는 MAC과 케이블 사이의 물리층 칩 - RGMII/RMII 디지털 쪽은 타이밍 스큐, MDI 아날로그 쪽은 100Ω 차동 임피던스와 자기 절연이 핵심이며, 스트랩 핀은 부팅 시 샘플링으로 주소와 모드를 정해 잘못 걸면 링크가 올라오지 않는다.",
        "principles": "이더넷 PHY(GbE의 KSZ9031RNX, 10/100의 LAN8710A)는 두 가지 일을 한다: MAC과 RGMII/RMII/MII 디지털 인터페이스로 패킷 데이터를 주고받고, 데이터를 차동 아날로그 신호로 부호화해 트랜스포머(마그네틱스)를 거쳐 케이블에 싣는다. RGMII는 125MHz 4비트 DDR 소스 동기 인터페이스로 TXC/RXC 클록과 데이터의 상대 스큐가 규정되며, 보통 PHY 내부 딜레이 모드나 클록에 약 1.5-2ns의 보드 서펜타인으로 맞춘다. RMII는 50MHz 단일 기준 클록만 필요해 핀이 적다. MDI 쪽 각 쌍은 100Ω 차동으로 트랜스포머를 지나며, 센터 탭이 바이어스와 공통모드 절연을 담당하고 Bob Smith 종단(75Ω+고내압 커패시터로 섀시 접지)이 미사용 쌍과 공통모드 에너지를 흡수한다. PHY 주소와 모드는 리셋 해제 시 샘플링되는 스트랩 핀으로 정해진다 - 이 핀들은 데이터 핀을 겸하고 풀 값과 샘플링 타이밍이 규정되어 있어, 리셋 중 외부 회로가 스트랩을 당기면 부팅 구성이 바뀐다. 기준 클록(25MHz 크리스털 또는 50MHz 오실레이터)은 ±50ppm 이내여야 한다.",
        "designNotes": [
          "MDI 4쌍(GbE는 전부 사용)을 100Ω 차동·쌍 내 엄격 등장으로 배선하고, 마그네틱스와 RJ45 사이에서 접지 분할을 넘지 않음",
          "RGMII 스큐는 보드 서펜타인보다 PHY 내부 딜레이(레지스터/스트랩 설정)를 우선; 보드에서도 데이터 그룹 내 등장 유지",
          "스트랩 핀(PHYAD/MODE)은 리셋 상승 에지에서 샘플링 - 같은 핀의 LED나 부하가 레벨을 움직이지 않는지 확인",
          "트랜스포머 센터 탭은 PHY 구동 방식(전류 모드/전압 모드)에 따라 연결 - 벤더마다 달라 PHY 데이터시트를 따름",
          "크리스털은 짧게 배선하고 접지로 두름; 50MHz RMII 클록을 MAC과 PHY에 같이 줄 때 위상과 부하 주의"
        ],
        "commonMistakes": [
          "RGMII 스큐 미보상(내부 딜레이 꺼짐, 보드 보상도 없음)으로 링크는 올라오나 CRC 오류가 쌓임",
          "MDI 쌍이 기준 접지 분할이나 마그네틱스 아래 절연 킵아웃을 가로질러 EMI와 반사 손실 악화",
          "리셋 중 외부 회로가 스트랩을 잘못 당겨 PHY 주소/모드가 잘못 읽히고 MDIO 스캔에 안 잡힘",
          "다른 벤더 PHY의 센터 탭 연결을 그대로 복사(전류 모드 vs 전압 모드가 다름), 구동 진폭이 틀려 아이가 무너짐"
        ]
      }
    },
    "createdAt": "2026-07-17T00:00:00Z",
    "updatedAt": "2026-07-17T00:00:00Z"
  });

  CARDS.push({
    "id": "qspi-nor-flash",
    "title": "QSPI NOR Flash 開機電路（W25Q 系：WP/HOLD、上拉、佈線）",
    "category": "high-speed",
    "products": ["通用", "WiFi 路由器"],
    "description": "SPI NOR Flash 是多數 MCU/SoC 的開機媒體——單線 SPI 到 Quad I/O 的腳位會變身（WP/HOLD 變 IO2/IO3），上拉、走線長度與 CS 時序沒處理好，就會出現「偶爾開不了機」這種最難查的問題。",
    "principles": "SPI NOR Flash（如 W25Q128JV，128Mbit、SOIC-8）標準腳位是 CS#、CLK、DI(IO0)、DO(IO1)、WP#(IO2)、HOLD#(IO3)：單線模式下 WP# 是寫保護、HOLD# 是暫停；切到 Quad 模式後這兩腳變成資料線 IO2/IO3。這帶來一個經典陷阱——單線開機階段若 WP#/HOLD# 浮接或被誤拉低，寫入被鎖或傳輸被暫停；因此兩腳要上拉（10k–100k）到 VCC，且進 Quad 後上拉不影響資料線切換（弱上拉即可）。CS# 必須上拉，避免主控 IO 未初始化期間 Flash 被誤選、誤讀干擾開機。QSPI 時脈可到 104–133MHz，走線要短、群組等長（clock 對資料的 skew 預算隨頻率縮小），必要時串 22–33Ω 源端阻尼電阻壓 ringing。電源 3.3V 加 0.1µF 就近去耦；掉電期間的寫入保護靠主控端 reset 管理與 Flash 的內建位準偵測。",
    "circuits": [],
    "keyFormulas": [
      "W25Q128JV：128Mbit（16MB）、Quad I/O 至 133MHz、SOIC-8",
      "上拉建議：CS#/WP#/HOLD# 各 10k–100k 到 VCC",
      "104MHz 時脈週期 9.6ns——clock/data skew 預算約 ±1ns 等級，走線群組等長",
      "源端串阻 22–33Ω 抑制反射（線長 >25mm 時建議）"
    ],
    "designNotes": [
      "WP#/HOLD#（IO2/IO3）一律弱上拉——單線開機期不浮接，Quad 模式也不影響",
      "CS# 上拉必加：主控 reset/未初始化期間防誤選；多顆 Flash 共享匯流排時每顆獨立 CS 上拉",
      "QSPI 6 線群組等長、遠離開關電源與 RF；>50mm 或 >100MHz 認真對待阻抗與端接",
      "0.1µF 去耦貼 VCC 腳；大容量寫入時的電流尖峰再補 1µF",
      "版面預留 1.27mm SOIC-8 與 8-WSON 雙 footprint（兩封裝腳位相容）方便料源切換"
    ],
    "commonMistakes": [
      "WP#/HOLD# 浮接——單線模式偶發寫鎖或匯流排暫停，「偶爾開不了機」極難重現",
      "CS# 沒上拉，主控開機 IO 三態期間 Flash 被雜訊誤選，開機資料流錯亂",
      "Quad 模式沒在 Flash 狀態暫存器啟用（QE 位元）就切四線，IO2/IO3 沒反應",
      "時脈線過長無阻尼，ringing 造成雙重取樣，讀出資料位移"
    ],
    "examples": [
      {
        "title": "MCU XIP 開機",
        "application": "MCU 從 W25Q128JV Quad-SPI 直接執行（XIP），133MHz 四線讀取餵指令快取",
        "circuit": "MCU QSPI 控制器 ←CS#/CLK/IO0-3（各上拉）→ W25Q128JV，VCC 0.1µF 去耦"
      }
    ],
    "relatedTopics": ["spi-design", "power-sequencing", "decoupling-capacitor"],
    "sourcePdf": "datasheets/w25q128jv.pdf",
    "i18n": {
      "en": {
        "title": "QSPI NOR Flash Boot Circuit (W25Q: WP/HOLD, Pull-ups, Routing)",
        "description": "SPI NOR flash boots most MCUs/SoCs - pins change roles from single SPI to Quad I/O (WP/HOLD become IO2/IO3), and mishandled pull-ups, trace lengths or CS timing produce the hardest bug of all: the board that sometimes fails to boot.",
        "principles": "A SPI NOR flash such as the W25Q128JV (128Mbit, SOIC-8) pins out as CS#, CLK, DI(IO0), DO(IO1), WP#(IO2), HOLD#(IO3): in single-wire mode WP# is write protect and HOLD# pauses the bus; in Quad mode both become data lines IO2/IO3. That creates the classic trap - during single-wire boot a floating or accidentally-low WP#/HOLD# locks writes or pauses transfers, so both pins get pulled up (10k-100k) to VCC; weak pull-ups do not disturb them once they switch to data duty in Quad mode. CS# must be pulled up so the flash is not falsely selected while the host IOs are still uninitialized. QSPI clocks reach 104-133MHz, so keep the traces short and group-length-matched (the clock-to-data skew budget shrinks with frequency) and add 22-33Ω source-series damping when needed. Decouple the 3.3V pin with 0.1µF right at the pin; write protection through power-down relies on host reset management plus the flash's built-in voltage detection.",
        "designNotes": [
          "Always pull WP#/HOLD# (IO2/IO3) up weakly - no floating during single-wire boot, and no impact in Quad mode",
          "CS# pull-up is mandatory: prevents false selection while the host is in reset/uninitialized; with multiple flashes, pull up each CS separately",
          "Length-match the six QSPI lines as a group and keep them away from switchers and RF; treat impedance and termination seriously above 50mm or 100MHz",
          "0.1µF decoupling at the VCC pin; add 1µF for write-burst current peaks",
          "Reserve a dual footprint (1.27mm SOIC-8 and 8-WSON, pin-compatible) for sourcing flexibility"
        ],
        "commonMistakes": [
          "Floating WP#/HOLD# - sporadic write locks or bus pauses in single-wire mode; the occasional boot failure is nearly impossible to reproduce",
          "No CS# pull-up, so noise selects the flash while the host IOs are tri-stated at boot and the boot stream is corrupted",
          "Switching to four-wire mode without setting the QE bit in the flash status register, so IO2/IO3 never respond",
          "A long undamped clock line rings and double-clocks the flash, shifting the read data"
        ]
      },
      "ja": {
        "title": "QSPI NOR フラッシュ起動回路（W25Q 系：WP/HOLD、プルアップ、配線）",
        "description": "SPI NOR フラッシュは多くの MCU/SoC の起動メディア——シングル SPI から Quad I/O へピンの役割が変わり（WP/HOLD が IO2/IO3 に）、プルアップ・配線長・CS タイミングを誤ると「時々起動しない」という最も厄介な問題が出る。",
        "principles": "W25Q128JV（128Mbit、SOIC-8）のような SPI NOR フラッシュのピンは CS#、CLK、DI(IO0)、DO(IO1)、WP#(IO2)、HOLD#(IO3)：シングルモードでは WP# は書き込み保護、HOLD# はバス一時停止で、Quad モードでは両ピンがデータ線 IO2/IO3 になる。ここに古典的な罠がある——シングルモード起動中に WP#/HOLD# が浮いていたり誤って Low だと書き込みロックや転送一時停止が起きる。よって両ピンは VCC へ 10k-100k でプルアップし、弱いプルアップなら Quad モードのデータ動作にも影響しない。CS# はプルアップ必須で、ホスト IO 未初期化期間の誤選択を防ぐ。QSPI クロックは 104-133MHz に達するため配線は短くグループ等長にし（クロック対データのスキューバジェットは周波数とともに縮む）、必要なら 22-33Ω のソース直列ダンピングを入れる。3.3V ピンには 0.1µF をピン直近でデカップリング。電源断時の書き込み保護はホストのリセット管理とフラッシュ内蔵の電圧検出に頼る。",
        "designNotes": [
          "WP#/HOLD#（IO2/IO3）は常に弱プルアップ——シングル起動時に浮かせず、Quad モードにも影響なし",
          "CS# プルアップ必須：ホストのリセット/未初期化中の誤選択を防止。複数フラッシュでは各 CS を個別にプルアップ",
          "QSPI 6 本はグループ等長にし、スイッチング電源や RF から離す。50mm 超や 100MHz 超ではインピーダンスと終端を真剣に",
          "0.1µF を VCC ピン直近に。書き込みバーストの電流ピークには 1µF を追加",
          "1.27mm SOIC-8 と 8-WSON のデュアル footprint を用意（ピン互換）して調達切替に備える"
        ],
        "commonMistakes": [
          "WP#/HOLD# が浮いている——シングルモードで散発的な書き込みロックやバス停止、「時々起動しない」は再現困難",
          "CS# プルアップなしで、起動時ホスト IO がハイインピーダンスの間にノイズでフラッシュが誤選択され起動データが壊れる",
          "ステータスレジスタの QE ビットを立てずに 4 線モードへ切替、IO2/IO3 が応答しない",
          "長いクロック線を無ダンピングで配線しリンギングで二重サンプリング、読み出しデータがずれる"
        ]
      },
      "ko": {
        "title": "QSPI NOR 플래시 부팅 회로(W25Q: WP/HOLD, 풀업, 배선)",
        "description": "SPI NOR 플래시는 대부분의 MCU/SoC 부팅 매체 - 싱글 SPI에서 Quad I/O로 핀 역할이 바뀌고(WP/HOLD가 IO2/IO3로), 풀업·배선 길이·CS 타이밍을 잘못 다루면 '가끔 부팅 안 됨'이라는 가장 잡기 어려운 문제가 생긴다.",
        "principles": "W25Q128JV(128Mbit, SOIC-8) 같은 SPI NOR 플래시의 핀은 CS#, CLK, DI(IO0), DO(IO1), WP#(IO2), HOLD#(IO3)이다: 싱글 모드에서 WP#는 쓰기 보호, HOLD#는 버스 일시정지이고 Quad 모드에서는 두 핀이 데이터선 IO2/IO3가 된다. 여기에 고전적인 함정이 있다 - 싱글 모드 부팅 중 WP#/HOLD#가 플로팅이거나 잘못 Low면 쓰기 잠금이나 전송 정지가 발생하므로 두 핀을 VCC로 10k-100k 풀업하고, 약한 풀업이면 Quad 모드 데이터 동작에도 영향이 없다. CS#는 풀업 필수로, 호스트 IO 미초기화 기간의 오선택을 막는다. QSPI 클록은 104-133MHz에 달하므로 배선은 짧게 그룹 등장으로 하고(클록 대 데이터 스큐 예산은 주파수와 함께 줄어듦) 필요하면 22-33Ω 소스 직렬 댐핑을 넣는다. 3.3V 핀에는 0.1µF를 핀 바로 옆에 디커플링; 전원 차단 시 쓰기 보호는 호스트 리셋 관리와 플래시 내장 전압 검출에 의존한다.",
        "designNotes": [
          "WP#/HOLD#(IO2/IO3)는 항상 약하게 풀업 - 싱글 부팅 시 플로팅 금지, Quad 모드에도 영향 없음",
          "CS# 풀업 필수: 호스트 리셋/미초기화 중 오선택 방지; 플래시가 여러 개면 각 CS를 개별 풀업",
          "QSPI 6선은 그룹 등장, 스위칭 전원·RF에서 떨어뜨림; 50mm 초과나 100MHz 초과면 임피던스와 종단을 진지하게",
          "0.1µF를 VCC 핀 옆에; 쓰기 버스트 전류 피크에는 1µF 추가",
          "1.27mm SOIC-8과 8-WSON 듀얼 footprint(핀 호환)를 준비해 수급 전환에 대비"
        ],
        "commonMistakes": [
          "WP#/HOLD# 플로팅 - 싱글 모드에서 산발적 쓰기 잠금·버스 정지, '가끔 부팅 안 됨'은 재현이 거의 불가",
          "CS# 풀업 없음, 부팅 시 호스트 IO가 하이임피던스인 동안 노이즈로 플래시가 오선택되어 부팅 스트림 손상",
          "상태 레지스터의 QE 비트를 안 켜고 4선 모드로 전환해 IO2/IO3 무반응",
          "긴 클록선을 댐핑 없이 배선해 링잉으로 이중 샘플링, 읽기 데이터가 밀림"
        ]
      }
    },
    "createdAt": "2026-07-17T00:00:00Z",
    "updatedAt": "2026-07-17T00:00:00Z"
  });

  CARDS.push({
    "id": "isolated-current-sense",
    "title": "隔離電流量測（隔離放大器/ΔΣ 調變器＋shunt：AMC 系）",
    "category": "measurement",
    "products": ["車用電子", "AI 伺服器", "通用"],
    "description": "馬達相電流、高壓匯流排量測要跨越安規隔離帶——隔離放大器把 shunt 上的毫伏訊號調變過隔離屏障；高壓側供電、共模暫態耐受（CMTI）與佈局隔離距離是三大命門。",
    "principles": "在高壓側（馬達相腳、母線）串低阻值 shunt，壓降由隔離放大器（如 AMC0206 系）或隔離 ΔΣ 調變器（如 AMC0303 系）讀取：訊號在高壓側先進 ΔΣ 調變，過電容式/磁式隔離屏障後在低壓側解調（放大器輸出類比差分）或直接輸出位元流（調變器輸出 CLK/DATA 給 MCU 的 sinc 濾波器）。輸入檔位是毫伏級（shunt 檔常見 ±50mV/±250mV 等），shunt 選擇在功耗與 SNR 之間權衡。高壓側需要隔離電源（常由變壓器繞組、隔離 DC-DC 或自舉供電），其品質直接進量測。CMTI（共模暫態抗擾度）規格決定在幾十 kV/µs 的開關 dv/dt 下位元流會不會被打壞——SiC/GaN 系統尤其要挑高 CMTI 料。佈局上隔離帶（creepage/clearance）依安規等級留足，屏障下方所有層都不得有銅。",
    "circuits": [],
    "keyFormulas": [
      "P_shunt = I² × R_shunt——1mΩ @ 100A＝10W，散熱與溫漂都要算",
      "量測誤差 ≈ shunt 容差 ＋ 溫漂(ppm/°C×ΔT) ＋ 放大器增益誤差",
      "ΔΣ 位元流經 sinc3 濾波：解析度與延遲隨抽取率（OSR）交換",
      "CMTI 需求 ≥ 系統最大 dv/dt（SiC 半橋常 >50kV/µs）"
    ],
    "designNotes": [
      "shunt 用 Kelvin（四線）接法，感測走線從 shunt 焊盤內側引出成緊耦合差分對",
      "隔離帶下方全層無銅，creepage 依安規（基本/加強隔離）與污染等級查表留距",
      "高壓側供電就近去耦；隔離電源的漣波會直接混進量測，加 LC 濾波",
      "調變器 CLK/DATA 走線短、遠離功率迴路；位元流是數位訊號但 timing 敏感",
      "多相馬達每相獨立調變器＋同步取樣，才能重建正確的相電流向量"
    ],
    "commonMistakes": [
      "shunt 兩線接法，功率走線壓降混入量測，滿量程誤差百分比級",
      "隔離帶下方內層鋪了銅（忘了內層），安規測試打穿或耦合劣化 CMTI",
      "高壓側隔離電源漣波大又沒濾，量測底噪抬高、SNR 掉一截",
      "CMTI 不足的料用在 SiC 高 dv/dt 半橋，開關瞬間位元流錯亂、電流讀值跳針"
    ],
    "examples": [
      {
        "title": "馬達相電流回授",
        "application": "三相變頻器每相 shunt＋隔離 ΔΣ 調變器，MCU sinc3 濾波重建相電流做 FOC",
        "circuit": "相腳 shunt(1mΩ Kelvin) → AMC0303 調變 → 隔離屏障 → MCU SDFM 介面（CLK/DATA）"
      }
    ],
    "relatedTopics": ["current-sense-kelvin", "current-sensing", "isolated-gate-driver"],
    "sourcePdf": "IC-spec/amc0303m2510.pdf",
    "i18n": {
      "en": {
        "title": "Isolated Current Sensing (Isolated Amp / ΔΣ Modulator + Shunt: AMC Family)",
        "description": "Motor phase and high-voltage bus currents must be measured across a safety isolation barrier - an isolated amplifier modulates the shunt's millivolt signal across the barrier; high-side supply quality, common-mode transient immunity (CMTI) and layout isolation distances are the three make-or-break items.",
        "principles": "A low-value shunt sits in the high-voltage path (motor phase leg, DC bus) and its drop is read by an isolated amplifier (AMC0206 family) or an isolated ΔΣ modulator (AMC0303 family): the signal is ΔΣ-modulated on the high side, crosses a capacitive or magnetic isolation barrier, and is either demodulated on the low side (amplifier outputs analog differential) or delivered as a raw bitstream (modulator outputs CLK/DATA into the MCU's sinc filter). Input ranges are millivolt-class (±50mV / ±250mV shunt ranges are typical), and shunt selection trades power dissipation against SNR. The high side needs an isolated supply (transformer winding, isolated DC-DC or bootstrap) whose quality feeds straight into the measurement. The CMTI rating decides whether the bitstream survives tens of kV/µs of switching dv/dt - SiC/GaN systems especially demand high-CMTI parts. In layout, keep creepage/clearance per the safety class, with no copper on any layer under the barrier.",
        "designNotes": [
          "Use a Kelvin (4-wire) shunt connection with the sense traces leaving from the inner pad edges as a tightly-coupled differential pair",
          "No copper on any layer under the isolation band; set creepage per safety class (basic/reinforced) and pollution degree tables",
          "Decouple the high-side supply locally; isolated-supply ripple mixes straight into the measurement, so add LC filtering",
          "Keep modulator CLK/DATA short and away from the power loop; the bitstream is digital but timing-sensitive",
          "For multi-phase motors use one modulator per phase with synchronized sampling to reconstruct the true current vector"
        ],
        "commonMistakes": [
          "Two-wire shunt connection mixes power-trace drop into the measurement - percent-level full-scale error",
          "Copper poured on an inner layer under the isolation band (forgotten layer) - safety test flashover or CMTI degraded by coupling",
          "Noisy unfiltered high-side isolated supply raises the measurement noise floor and eats SNR",
          "A low-CMTI part in a SiC high-dv/dt half-bridge corrupts the bitstream at every switching edge and the current reading glitches"
        ]
      },
      "ja": {
        "title": "絶縁電流計測（絶縁アンプ/ΔΣ モジュレータ＋シャント：AMC 系）",
        "description": "モータ相電流や高圧バスの計測は安全絶縁帯を越える必要がある——絶縁アンプはシャントのミリボルト信号を変調して絶縁バリアを渡す。高圧側電源の品質、コモンモード過渡耐量（CMTI）、レイアウトの絶縁距離が三大急所。",
        "principles": "高圧側（モータ相脚、DC バス）に低抵抗シャントを入れ、その電圧降下を絶縁アンプ（AMC0206 系）または絶縁 ΔΣ モジュレータ（AMC0303 系）で読む：信号は高圧側で ΔΣ 変調され、容量式/磁気式絶縁バリアを渡り、低圧側で復調される（アンプはアナログ差動出力）か、ビットストリームのまま出力される（モジュレータは CLK/DATA を MCU の sinc フィルタへ）。入力レンジはミリボルト級（±50mV/±250mV のシャントレンジが典型）で、シャント選定は損失と SNR のトレードオフ。高圧側には絶縁電源（トランス巻線、絶縁 DC-DC、ブートストラップ）が必要で、その品質はそのまま計測に入り込む。CMTI 規格は数十 kV/µs のスイッチング dv/dt でビットストリームが壊れないかを決める——SiC/GaN システムでは特に高 CMTI 品を選ぶ。レイアウトでは沿面/空間距離を安全規格クラスに従って確保し、バリア直下は全層で銅を置かない。",
        "designNotes": [
          "シャントはケルビン（4 線）接続とし、センス配線はシャントパッド内側から密結合差動ペアで引き出す",
          "絶縁帯の直下は全層無銅。沿面距離は安全クラス（基本/強化絶縁）と汚損度の表に従う",
          "高圧側電源はローカルにデカップリング。絶縁電源のリップルは計測に直結するので LC フィルタを追加",
          "モジュレータの CLK/DATA は短くパワーループから離す。ビットストリームはデジタルだがタイミングに敏感",
          "多相モータは相ごとに独立モジュレータ＋同期サンプリングで正しい電流ベクトルを再構成"
        ],
        "commonMistakes": [
          "シャント 2 線接続でパワー配線の電圧降下が計測に混入、フルスケール誤差がパーセント級",
          "絶縁帯直下の内層に銅を残し（内層を忘れ）、安全試験で沿面破壊、または結合で CMTI 劣化",
          "高圧側絶縁電源のリップルが大きく未フィルタで、計測ノイズフロアが上がり SNR が低下",
          "CMTI 不足の品を SiC 高 dv/dt ハーフブリッジに使い、スイッチングごとにビットストリームが乱れ電流値が飛ぶ"
        ]
      },
      "ko": {
        "title": "절연 전류 측정(절연 앰프/ΔΣ 모듈레이터+션트: AMC 계열)",
        "description": "모터 상전류·고전압 버스 측정은 안전 절연 대역을 넘어야 한다 - 절연 앰프가 션트의 밀리볼트 신호를 변조해 절연 배리어를 건넌다; 고압 측 전원 품질, 공통모드 과도 내성(CMTI), 레이아웃 절연 거리가 3대 급소다.",
        "principles": "고압 경로(모터 상 레그, DC 버스)에 저저항 션트를 넣고 그 전압 강하를 절연 앰프(AMC0206 계열)나 절연 ΔΣ 모듈레이터(AMC0303 계열)로 읽는다: 신호는 고압 측에서 ΔΣ 변조되어 용량식/자기식 절연 배리어를 건너고, 저압 측에서 복조되거나(앰프는 아날로그 차동 출력) 비트스트림 그대로 출력된다(모듈레이터는 CLK/DATA를 MCU의 sinc 필터로). 입력 범위는 밀리볼트급(±50mV/±250mV 션트 레인지가 전형)이고 션트 선정은 손실과 SNR의 트레이드오프다. 고압 측에는 절연 전원(트랜스 권선, 절연 DC-DC, 부트스트랩)이 필요하며 그 품질이 그대로 측정에 들어간다. CMTI 사양은 수십 kV/µs 스위칭 dv/dt에서 비트스트림이 살아남는지를 결정한다 - SiC/GaN 시스템은 특히 고 CMTI 부품이 필요하다. 레이아웃에서는 연면/공간 거리를 안전 등급에 맞게 확보하고 배리어 아래는 전 층에 동박을 두지 않는다.",
        "designNotes": [
          "션트는 켈빈(4선) 연결, 센스 배선은 션트 패드 안쪽에서 밀결합 차동 쌍으로 인출",
          "절연 대역 아래는 전 층 무동박; 연면 거리는 안전 등급(기본/강화 절연)과 오염 등급 표를 따름",
          "고압 측 전원은 로컬 디커플링; 절연 전원 리플은 측정에 직결되므로 LC 필터 추가",
          "모듈레이터 CLK/DATA는 짧게, 전력 루프에서 멀리; 비트스트림은 디지털이지만 타이밍에 민감",
          "다상 모터는 상마다 독립 모듈레이터+동기 샘플링으로 올바른 전류 벡터 재구성"
        ],
        "commonMistakes": [
          "션트 2선 연결로 전력 배선 강하가 측정에 섞여 풀스케일 오차가 퍼센트급",
          "절연 대역 아래 내층에 동박이 남아(내층 누락) 안전 시험에서 연면 파괴 또는 결합으로 CMTI 열화",
          "고압 측 절연 전원 리플이 크고 필터 없음, 측정 노이즈 플로어 상승·SNR 하락",
          "CMTI 부족 부품을 SiC 고 dv/dt 하프브리지에 사용, 스위칭마다 비트스트림이 깨져 전류 값이 튐"
        ]
      }
    },
    "createdAt": "2026-07-17T00:00:00Z",
    "updatedAt": "2026-07-17T00:00:00Z"
  });

  CARDS.push({
    "id": "gan-gate-drive",
    "title": "GaN 閘極驅動電路（LMG1020/UCC57142：ns 級邊沿的驅動迴路）",
    "category": "power-management",
    "products": ["AI 伺服器", "通用"],
    "description": "GaN FET 開關邊沿到 ns 級、閘極電壓窗又窄——驅動迴路電感每 1nH 都會變成過衝與振鈴；驅動器選型（擺幅/UVLO/傳播延遲）與 mm 級的佈局功力決定 GaN 是提效還是炸機。",
    "principles": "GaN HEMT 與 Si MOSFET 兩個關鍵差異：一是閘極電壓窗窄（e-mode GaN 常 6V 絕對上限、建議 5V 驅動，過壓即損傷），二是開關速度快一個量級（ns 級邊沿、dv/dt 可上 100V/ns）。專用 GaN 驅動器（如 LMG1020：5V 驅動、次奈秒級傳播延遲、獨立拉高/拉低輸出）提供精準擺幅與 UVLO，把閘極過壓風險擋掉。獨立 source/sink 腳允許不同的開/關閘極電阻（開慢一點壓過衝、關快一點防誤導通）。驅動迴路（驅動器輸出→Rg→閘極→源極→回驅動器地）的寄生電感是頭號敵人：di/dt 在 nH 上都會感應出伏級電壓疊到窄窗閘極上。佈局要把驅動器貼著 FET 放（<5mm）、驅動迴路面積壓到最小、去耦電容貼驅動器 VDD、用 Kelvin source（若 FET 有）分離功率源極與驅動回線。高低邊都用 GaN 時，自舉供電要處理負壓擺與 dv/dt 竄擾，或直接用隔離驅動。",
    "circuits": [],
    "keyFormulas": [
      "V_L = L × di/dt——1nH @ 1A/ns＝1V 疊加在閘極上",
      "LMG1020：5V 驅動、prop delay 次 ns 級、獨立 OUTH/OUTL",
      "e-mode GaN 閘極絕對上限常見 6V（建議 5.0–5.2V 驅動）",
      "開關損耗 ≈ ½·V·I·(tr+tf)·fsw——GaN 邊沿快 10 倍＝同頻損耗大減或頻率上探 MHz"
    ],
    "designNotes": [
      "驅動器到 FET 閘極 <5mm，驅動迴路（含回線）面積最小化——這一條抵過所有其他優化",
      "獨立 Rg_on/Rg_off：開的電阻調 dv/dt 壓過衝，關的電阻小、關得快防 Miller 誤導通",
      "VDD 去耦（0.1µF+1µF）貼驅動器腳；5V rail 精度顧好，別讓它飄近 6V 上限",
      "Kelvin source 腳（有就用）：驅動回線與功率源極分開，共源電感不進閘極迴路",
      "半橋高邊 GaN 的位準移轉/自舉要能吃 100V/ns dv/dt，佈局讓高低邊驅動迴路互不重疊"
    ],
    "commonMistakes": [
      "拿通用 MOSFET 驅動器（12V 擺幅）驅 GaN，第一次上電就過壓打穿閘極",
      "驅動迴路繞遠路（驅動器放板另一角），nH 級電感讓閘極振鈴超窗，FET 慢性劣化",
      "共源極電感沒用 Kelvin 分離，功率 di/dt 回灌閘極造成誤導通、半橋直通",
      "只看效率上頻率，磁性元件與驅動損耗沒跟上，MHz 下反而更熱"
    ],
    "examples": [
      {
        "title": "MHz LLC / LiDAR 脈衝",
        "application": "LMG1020 驅動 e-mode GaN 做 ns 脈衝雷射驅動或 MHz 級 LLC，邊沿 <1ns",
        "circuit": "PWM → LMG1020（OUTH/OUTL 分離 Rg）→ GaN 閘極；VDD 5V 就地去耦；Kelvin source 回線"
      }
    ],
    "relatedTopics": ["gate-driver", "isolated-gate-driver", "mosfet-switching"],
    "sourcePdf": "IC-spec/lmg1020-q1.pdf",
    "i18n": {
      "en": {
        "title": "GaN Gate-Drive Circuit (LMG1020/UCC57142: Drive Loops for ns Edges)",
        "description": "GaN FETs switch in nanoseconds with a narrow gate-voltage window - every nanohenry in the drive loop becomes overshoot and ringing; driver selection (swing/UVLO/propagation delay) and millimeter-scale layout decide whether GaN improves efficiency or blows up.",
        "principles": "GaN HEMTs differ from Si MOSFETs in two key ways: the gate window is narrow (e-mode GaN often has a 6V absolute maximum with 5V recommended drive - overvoltage means damage) and switching is an order of magnitude faster (ns edges, dv/dt up to 100V/ns). A dedicated GaN driver such as the LMG1020 (5V drive, sub-ns propagation delay, separate pull-up/pull-down outputs) provides a precise swing and UVLO to keep the gate safe. Separate source/sink pins allow different turn-on and turn-off gate resistors (slow the turn-on to tame overshoot, keep turn-off fast to prevent spurious turn-on). The drive loop (driver output → Rg → gate → source → back to driver ground) parasitic inductance is enemy number one: with ns-scale di/dt even 1nH induces volts on top of the narrow gate window. Place the driver within 5mm of the FET, minimize the loop area, decouple VDD at the driver, and use the Kelvin source pin (if present) to separate the power source path from the drive return. With GaN on both sides of a half-bridge, the bootstrap must handle negative swing and dv/dt coupling - or use an isolated driver.",
        "designNotes": [
          "Driver-to-gate under 5mm and minimum drive-loop area (including the return) - this one rule outweighs every other optimization",
          "Separate Rg_on/Rg_off: turn-on resistor shapes dv/dt and overshoot; keep turn-off small and fast against Miller turn-on",
          "VDD decoupling (0.1µF+1µF) at the driver pin; keep the 5V rail accurate - do not let it drift toward the 6V limit",
          "Use the Kelvin source pin where available so common-source inductance stays out of the gate loop",
          "High-side level shift/bootstrap must survive 100V/ns dv/dt; keep high- and low-side drive loops from overlapping"
        ],
        "commonMistakes": [
          "Driving GaN with a generic 12V-swing MOSFET driver - the gate is punched through on first power-up",
          "A long drive loop (driver placed across the board) rings the gate beyond its window and slowly degrades the FET",
          "No Kelvin separation of common-source inductance, so power di/dt kicks back into the gate causing spurious turn-on and shoot-through",
          "Raising frequency for efficiency without upgrading magnetics and drive loss budgets - the MHz design runs hotter instead"
        ]
      },
      "ja": {
        "title": "GaN ゲート駆動回路（LMG1020/UCC57142：ns エッジの駆動ループ）",
        "description": "GaN FET は ns 級エッジでスイッチングし、ゲート電圧窓が狭い——駆動ループの 1nH がそのままオーバーシュートとリンギングになる。ドライバ選定（振幅/UVLO/伝搬遅延）と mm 単位のレイアウトが、GaN が効率化か破壊かを分ける。",
        "principles": "GaN HEMT と Si MOSFET の重要な違いは 2 つ：ゲート窓が狭い（e-mode GaN は絶対最大 6V、推奨 5V 駆動が多く、過電圧は即損傷）ことと、スイッチングが一桁速い（ns エッジ、dv/dt は 100V/ns 級）こと。LMG1020 のような専用 GaN ドライバ（5V 駆動、サブ ns 伝搬遅延、独立プルアップ/プルダウン出力）は正確な振幅と UVLO でゲートを守る。独立ソース/シンクピンによりターンオン/オフで別のゲート抵抗が使える（オンは遅めでオーバーシュート抑制、オフは速くして誤オン防止）。駆動ループ（ドライバ出力→Rg→ゲート→ソース→ドライバグランド）の寄生インダクタンスが最大の敵：ns 級 di/dt では 1nH でも狭いゲート窓にボルト級の電圧が乗る。ドライバは FET から 5mm 以内、ループ面積最小、VDD デカップリングはドライバ直近、Kelvin ソース（あれば）でパワー経路と駆動リターンを分離。ハーフブリッジ両側 GaN ではブートストラップが負スイングと dv/dt 干渉に耐える必要がある——または絶縁ドライバを使う。",
        "designNotes": [
          "ドライバ〜ゲート 5mm 以内、駆動ループ（リターン含む）面積最小——この 1 項が他の全最適化に勝る",
          "Rg_on/Rg_off を分離：オン側で dv/dt とオーバーシュートを調整、オフ側は小さく速くして Miller 誤オンを防ぐ",
          "VDD デカップリング（0.1µF+1µF）をドライバピン直近に。5V レールの精度を保ち 6V 上限に近づけない",
          "Kelvin ソースピンがあれば使う：共通ソースインダクタンスをゲートループから排除",
          "ハイサイドのレベルシフト/ブートストラップは 100V/ns の dv/dt に耐えること。高低側の駆動ループを重ねない"
        ],
        "commonMistakes": [
          "汎用 12V 振幅の MOSFET ドライバで GaN を駆動し、初回通電でゲートを過電圧破壊",
          "駆動ループが遠回り（ドライバが基板の反対側）で nH 級インダクタンスがゲートを窓外までリンギングさせ FET が徐々に劣化",
          "共通ソースインダクタンスを Kelvin 分離せず、パワー di/dt がゲートに回り込み誤オン・貫通",
          "効率だけ見て周波数を上げ、磁性部品と駆動損失が追いつかず MHz でかえって発熱"
        ]
      },
      "ko": {
        "title": "GaN 게이트 구동 회로(LMG1020/UCC57142: ns 에지의 구동 루프)",
        "description": "GaN FET는 ns급 에지로 스위칭하고 게이트 전압 창이 좁다 - 구동 루프의 1nH가 그대로 오버슈트와 링잉이 된다; 드라이버 선정(스윙/UVLO/전파 지연)과 mm 단위 레이아웃이 GaN이 효율 개선이 될지 폭발이 될지를 가른다.",
        "principles": "GaN HEMT와 Si MOSFET의 핵심 차이는 두 가지다: 게이트 창이 좁고(e-mode GaN은 절대 최대 6V, 권장 5V 구동이 많으며 과전압은 곧 손상), 스위칭이 한 자릿수 빠르다(ns 에지, dv/dt 100V/ns급). LMG1020 같은 전용 GaN 드라이버(5V 구동, 서브 ns 전파 지연, 독립 풀업/풀다운 출력)는 정확한 스윙과 UVLO로 게이트를 지킨다. 독립 소스/싱크 핀으로 턴온/턴오프에 다른 게이트 저항을 쓸 수 있다(온은 느리게 해 오버슈트 억제, 오프는 빠르게 해 오도통 방지). 구동 루프(드라이버 출력→Rg→게이트→소스→드라이버 접지)의 기생 인덕턴스가 제1의 적: ns급 di/dt에서는 1nH에도 좁은 게이트 창 위에 볼트급 전압이 얹힌다. 드라이버는 FET에서 5mm 이내, 루프 면적 최소화, VDD 디커플링은 드라이버 옆, Kelvin 소스 핀(있으면)으로 전력 경로와 구동 리턴 분리. 하프브리지 양쪽이 GaN이면 부트스트랩이 음스윙과 dv/dt 간섭을 견뎌야 한다 - 아니면 절연 드라이버를 쓴다.",
        "designNotes": [
          "드라이버-게이트 5mm 이내, 구동 루프(리턴 포함) 면적 최소 - 이 한 줄이 다른 모든 최적화보다 중요",
          "Rg_on/Rg_off 분리: 온 저항으로 dv/dt·오버슈트 조정, 오프는 작고 빠르게 해 Miller 오도통 방지",
          "VDD 디커플링(0.1µF+1µF)을 드라이버 핀 옆에; 5V 레일 정확도를 지켜 6V 상한에 접근 금지",
          "Kelvin 소스 핀이 있으면 사용: 공통 소스 인덕턴스를 게이트 루프에서 배제",
          "하이사이드 레벨 시프트/부트스트랩은 100V/ns dv/dt를 견뎌야 함; 고·저측 구동 루프가 겹치지 않게"
        ],
        "commonMistakes": [
          "범용 12V 스윙 MOSFET 드라이버로 GaN을 구동해 첫 전원 인가에 게이트 과전압 파괴",
          "구동 루프가 멀리 돌아(드라이버가 보드 반대편) nH급 인덕턴스로 게이트가 창 밖까지 링잉, FET가 서서히 열화",
          "공통 소스 인덕턴스를 Kelvin 분리하지 않아 전력 di/dt가 게이트로 되돌아와 오도통·관통",
          "효율만 보고 주파수를 올렸는데 자성 부품과 구동 손실이 못 따라와 MHz에서 오히려 더 뜨거움"
        ]
      }
    },
    "createdAt": "2026-07-17T00:00:00Z",
    "updatedAt": "2026-07-17T00:00:00Z"
  });

  CARDS.push({
    "id": "bldc-three-phase-drive",
    "title": "三相 BLDC 智慧閘極驅動（MCT8376Z/MCF8329/DRV8363：整合驅動＋保護）",
    "category": "power-management",
    "products": ["車用電子", "通用"],
    "description": "三相無刷馬達驅動＝三個半橋＋換相邏輯＋電流回授＋一籃子保護——智慧閘極驅動器把驅動、電荷幫浦、電流感測與保護整合進一顆，設計重心移到功率級佈局與回授路徑。",
    "principles": "BLDC/PMSM 由三個半橋（6 顆 FET）驅動，依轉子位置換相：有感（霍爾/編碼器）或無感（反電動勢/磁通觀測器）。智慧閘極驅動器分兩級：純驅動器（如 DRV8363，三相半橋驅動＋電流感測放大器＋保護，換相邏輯在外部 MCU）與整合控制器（如 MCF8329HS 無感 FOC、MCT8376Z-Q1 內建換相，直接吃速度命令）。共通關鍵塊：電荷幫浦/自舉產生高邊閘壓（低轉速或 100% 占空比時電荷幫浦才撐得住）、死區時間防直通、VDS/VGS 監測做過流與閘極故障偵測、相電流感測（低邊 shunt 或相內 shunt）餵 FOC。功率級佈局決定成敗：三個半橋的開關迴路（母線電容→高邊 FET→低邊 FET→回電容）要小而對稱，shunt 的 Kelvin 感測、閘極走線短直、驅動器貼 FET。車規應用還要處理負載突降（load dump）與反接（另見對應卡）。",
    "circuits": [],
    "keyFormulas": [
      "電磁轉矩 T ∝ Kt × Iq（FOC 下 q 軸電流）；反電動勢 E = Ke × ω",
      "死區時間 t_dead 需 > FET 關斷延遲差；過長則波形失真、轉矩漣波",
      "低邊 shunt 取樣窗＝低邊導通期間——PWM 占空比高時窗口變窄，取樣時序要對齊",
      "電荷幫浦：100% 占空比高邊常開時唯一的高邊閘壓來源"
    ],
    "designNotes": [
      "三相半橋佈局對稱：開關迴路面積一致，否則三相 EMI 與開關應力不均",
      "shunt Kelvin 走線成差分對進放大器；三相共用單 shunt 時取樣時序由驅動器/MCU 精確控制",
      "閘極走線短直、高低邊分開走；驅動器 GND 與功率 GND 星狀匯接於 shunt 附近",
      "電荷幫浦飛跨電容與儲存電容依 datasheet 值與耐壓選，貼近 IC",
      "VDS 過流門檻依 FET RDS(on) 溫度係數留裕度，冷機誤跳與熱機漏保都要避開"
    ],
    "commonMistakes": [
      "三相迴路不對稱（一相繞遠路），該相開關振鈴大、EMI 超標且 FET 提前老化",
      "shunt 感測走線單端拉線混入功率壓降，電流回授失真、FOC 轉矩漣波",
      "死區時間照預設沒對 FET 特性調，輕載波形交越失真或重載直通發熱",
      "電荷幫浦電容漏配或值錯，低速/滿占空比時高邊閘壓塌掉、FET 半開燒毀"
    ],
    "examples": [
      {
        "title": "48V 車用風扇/泵",
        "application": "MCF8329HS 無感 FOC 直驅 48V BLDC 泵，程式碼免寫，I2C 調參數",
        "circuit": "電池 → 母線電容 → 3×半橋（6 FET）→ 馬達三相；驅動器整合電荷幫浦＋CSA＋保護"
      }
    ],
    "relatedTopics": ["h-bridge-motor", "isolated-current-sense", "gate-driver"],
    "sourcePdf": "IC-spec/mcf8329hs.pdf",
    "i18n": {
      "en": {
        "title": "Three-Phase BLDC Smart Gate Drive (MCT8376Z/MCF8329/DRV8363: Integrated Drive + Protection)",
        "description": "Driving a three-phase brushless motor means three half-bridges, commutation logic, current feedback and a basket of protections - smart gate drivers integrate the drive, charge pump, current sensing and protection into one chip, shifting the design focus to power-stage layout and feedback paths.",
        "principles": "A BLDC/PMSM is driven by three half-bridges (6 FETs) commutated by rotor position: sensored (Hall/encoder) or sensorless (back-EMF / flux observer). Smart gate drivers come in two tiers: pure drivers (DRV8363 - three-phase half-bridge drive plus current-sense amplifiers and protection, with commutation in an external MCU) and integrated controllers (MCF8329HS sensorless FOC, MCT8376Z-Q1 with built-in commutation taking a speed command directly). The common key blocks: a charge pump/bootstrap generating high-side gate voltage (only the charge pump survives low speed or 100% duty), dead time against shoot-through, VDS/VGS monitoring for overcurrent and gate-fault detection, and phase-current sensing (low-side or in-phase shunts) feeding FOC. Power-stage layout decides success: the three switching loops (bus cap → high FET → low FET → back to cap) must be small and symmetrical, shunts Kelvin-sensed, gate traces short and direct, driver next to the FETs. Automotive designs also handle load dump and reverse battery (see the dedicated cards).",
        "designNotes": [
          "Lay the three half-bridges out symmetrically: equal loop areas, or the phases see unequal EMI and switching stress",
          "Route shunt Kelvin sense as differential pairs into the amplifier; with a single shared shunt, sampling timing must be precisely controlled by the driver/MCU",
          "Gate traces short and direct, high/low side separated; star the driver ground and power ground near the shunt",
          "Choose charge-pump flying and storage capacitors per datasheet value and voltage rating, placed close to the IC",
          "Set the VDS overcurrent threshold with margin for the FET RDS(on) temperature coefficient - avoid both cold false trips and hot missed trips"
        ],
        "commonMistakes": [
          "Asymmetric phase loops (one phase routed the long way) - that phase rings harder, fails EMI and ages its FETs early",
          "Single-ended shunt sense wiring picks up power-trace drop, distorting current feedback and adding FOC torque ripple",
          "Default dead time never tuned to the FETs - crossover distortion at light load or shoot-through heating at full load",
          "Missing or wrong charge-pump capacitors - high-side gate voltage collapses at low speed/full duty and FETs burn half-on"
        ]
      },
      "ja": {
        "title": "三相 BLDC スマートゲートドライブ（MCT8376Z/MCF8329/DRV8363：駆動＋保護統合）",
        "description": "三相ブラシレスモータの駆動は 3 つのハーフブリッジ＋転流ロジック＋電流フィードバック＋各種保護——スマートゲートドライバは駆動・チャージポンプ・電流検出・保護を 1 チップに統合し、設計の重心はパワーステージのレイアウトとフィードバック経路に移る。",
        "principles": "BLDC/PMSM は 3 つのハーフブリッジ（FET 6 個）で駆動し、ロータ位置に応じて転流する：センサ付き（ホール/エンコーダ）またはセンサレス（逆起電力/磁束オブザーバ）。スマートゲートドライバは 2 段階ある：純ドライバ（DRV8363——三相ハーフブリッジ駆動＋電流センスアンプ＋保護、転流は外部 MCU）と統合コントローラ（MCF8329HS のセンサレス FOC、MCT8376Z-Q1 の内蔵転流で速度指令を直接受ける）。共通の重要ブロック：ハイサイドゲート電圧を作るチャージポンプ/ブートストラップ（低回転や 100% デューティではチャージポンプのみが有効）、貫通防止のデッドタイム、過電流とゲート故障検出の VDS/VGS 監視、FOC へ渡す相電流検出（ローサイドまたは相内シャント）。パワーステージのレイアウトが成否を決める：3 つのスイッチングループ（バスコンデンサ→ハイ FET→ロー FET→コンデンサへ戻る）は小さく対称に、シャントはケルビン検出、ゲート配線は短く直進、ドライバは FET の隣。車載ではロードダンプとバッテリ逆接も扱う（対応カード参照）。",
        "designNotes": [
          "三相ハーフブリッジを対称にレイアウト：ループ面積を揃えないと相ごとに EMI とスイッチングストレスが不均一",
          "シャントのケルビン検出は差動ペアでアンプへ。単一共用シャントではサンプリングタイミングをドライバ/MCU で厳密制御",
          "ゲート配線は短く直進、高低側を分離。ドライバ GND とパワー GND はシャント付近でスター接続",
          "チャージポンプのフライング/貯蔵コンデンサはデータシートの値と耐圧で選び IC 直近に配置",
          "VDS 過電流閾値は FET RDS(on) の温度係数に余裕を持たせる——冷間誤動作と熱間保護漏れの両方を回避"
        ],
        "commonMistakes": [
          "三相ループが非対称（1 相だけ遠回り）でその相のリンギングが大きく EMI 超過、FET が早期劣化",
          "シャント検出をシングルエンドで引いてパワー配線の電圧降下が混入、電流フィードバックが歪み FOC トルクリップル",
          "デッドタイムをデフォルトのまま FET 特性に合わせず、軽負荷でクロスオーバー歪みまたは重負荷で貫通発熱",
          "チャージポンプコンデンサの欠落や値違いで低速/フルデューティ時にハイサイドゲート電圧が崩れ、FET が半オンで焼損"
        ]
      },
      "ko": {
        "title": "3상 BLDC 스마트 게이트 드라이브(MCT8376Z/MCF8329/DRV8363: 구동+보호 통합)",
        "description": "3상 브러시리스 모터 구동은 하프브리지 3개+정류 로직+전류 피드백+각종 보호의 묶음 - 스마트 게이트 드라이버는 구동·차지 펌프·전류 감지·보호를 한 칩에 통합해 설계 중심이 파워 스테이지 레이아웃과 피드백 경로로 옮겨간다.",
        "principles": "BLDC/PMSM은 하프브리지 3개(FET 6개)로 구동하며 로터 위치에 따라 정류한다: 센서형(홀/엔코더) 또는 센서리스(역기전력/자속 관측기). 스마트 게이트 드라이버는 두 단계다: 순수 드라이버(DRV8363 - 3상 하프브리지 구동+전류 감지 앰프+보호, 정류는 외부 MCU)와 통합 컨트롤러(MCF8329HS 센서리스 FOC, MCT8376Z-Q1 내장 정류로 속도 명령을 직접 받음). 공통 핵심 블록: 하이사이드 게이트 전압을 만드는 차지 펌프/부트스트랩(저속이나 100% 듀티에서는 차지 펌프만 유효), 관통 방지 데드타임, 과전류·게이트 고장 검출용 VDS/VGS 감시, FOC에 주는 상전류 감지(로우사이드 또는 상내 션트). 파워 스테이지 레이아웃이 성패를 가른다: 3개 스위칭 루프(버스 커패시터→하이 FET→로우 FET→커패시터 복귀)는 작고 대칭으로, 션트는 켈빈 감지, 게이트 배선은 짧고 곧게, 드라이버는 FET 옆에. 차량용은 로드 덤프와 배터리 역접속도 다룬다(해당 카드 참조).",
        "designNotes": [
          "3상 하프브리지를 대칭으로 배치: 루프 면적이 다르면 상마다 EMI와 스위칭 스트레스가 불균일",
          "션트 켈빈 감지는 차동 쌍으로 앰프에; 단일 공용 션트면 샘플링 타이밍을 드라이버/MCU가 정밀 제어",
          "게이트 배선은 짧고 곧게, 고·저측 분리; 드라이버 GND와 전력 GND는 션트 근처에서 스타 접속",
          "차지 펌프 플라잉/저장 커패시터는 데이터시트 값·내압으로 선정해 IC 옆에 배치",
          "VDS 과전류 문턱은 FET RDS(on) 온도 계수에 여유를 - 냉간 오동작과 열간 보호 누락 둘 다 회피"
        ],
        "commonMistakes": [
          "3상 루프 비대칭(한 상만 멀리 돌아감) - 그 상의 링잉이 커져 EMI 초과, FET 조기 열화",
          "션트 감지를 싱글엔드로 끌어 전력 배선 강하가 섞임, 전류 피드백 왜곡·FOC 토크 리플",
          "데드타임을 기본값 그대로 FET 특성에 안 맞춰 경부하 교차 왜곡 또는 중부하 관통 발열",
          "차지 펌프 커패시터 누락/값 오류로 저속·풀듀티에서 하이사이드 게이트 전압 붕괴, FET 반쯤 켜진 채 소손"
        ]
      }
    },
    "createdAt": "2026-07-17T00:00:00Z",
    "updatedAt": "2026-07-17T00:00:00Z"
  });

  CARDS.push({
    "id": "hall-magnetic-sensing",
    "title": "霍爾磁感測應用電路（TMAG 系：開關/鎖存/線性/角度）",
    "category": "measurement",
    "products": ["智慧手錶", "車用電子", "通用"],
    "description": "翻蓋偵測、轉速計數、旋鈕角度、非接觸位置回授全靠霍爾感測器——開關型/鎖存型/線性型/3D 角度型的選型、磁鐵工作點設計與雜散磁場抗擾是三個決定成敗的環節。",
    "principles": "霍爾元件輸出正比於垂直磁通密度的電壓，依後端處理分四類：開關型（過 B_OP 導通、退到 B_RP 釋放，遲滯防抖，如蓋合偵測）、鎖存型（南極導通北極釋放，配環形磁鐵數轉速）、線性型（輸出正比 B，做位置/電流量測）、3D/角度型（如 TMAG 系多軸，量磁鐵角度做旋鈕/馬達換相）。設計從磁路開始：磁鐵材質（NdFeB 強而溫漂大、鐵氧體弱而穩）、充磁方向、工作距離決定感測器看到的 B 範圍，必須把整個機構公差鏈（距離±、偏移±、溫度）掃過後仍落在 B_OP/B_RP 或線性範圍內。低功耗型用占空比取樣（µA 級平均電流）適合電池裝置，但取樣率限制了可偵測的最高轉速/開合速度。車用要考慮雜散場抗擾（ISO 11452-8）——差分霍爾或梯度量測能對消均勻雜散場。",
    "circuits": [],
    "keyFormulas": [
      "遲滯 B_HYS = B_OP − B_RP——防機構抖動來回觸發",
      "磁通密度隨距離近似 B ∝ 1/d³（小磁鐵遠場），公差鏈用最壞情況掃",
      "占空比取樣平均電流 ≈ I_active × (t_on/t_period)＋I_sleep",
      "可偵測最高頻率 < 取樣率/2（開合/轉速都受限）"
    ],
    "designNotes": [
      "先畫磁路再選料：工作距離掃最近/最遠＋偏移公差，B 範圍要含裕度落在規格窗內",
      "NdFeB 溫度係數約 -0.1%/°C——高溫應用把 B 衰減算進最遠工作點",
      "低功耗取樣型注意取樣率 vs 最快事件：手錶翻蓋 10Hz 夠、馬達換相不夠",
      "感測器背後/附近的鐵磁材料（螺絲、屏蔽罩）會扭曲磁路，機構定案前實測",
      "車用選帶雜散場抗擾的差分/梯度型，或佈局上讓干擾源（大電流線）遠離"
    ],
    "commonMistakes": [
      "只在標稱距離驗證，公差最壞情況（最遠＋偏移＋高溫）B 掉出 B_OP，量產機率性失效",
      "鎖存型當開關型用（或反過來），磁鐵極性設計錯，行為完全不對",
      "取樣型霍爾用在快速事件，事件落在取樣間隙漏偵測",
      "感測器旁邊後加金屬支架，磁路被分流，量產後靈敏度集體漂移"
    ],
    "examples": [
      {
        "title": "手錶錶蓋偵測",
        "application": "低功耗開關型霍爾＋小 NdFeB 磁鐵做開合偵測，平均電流 µA 級",
        "circuit": "磁鐵（蓋側）→ 霍爾開關（本體側，占空比取樣）→ GPIO 喚醒 MCU"
      }
    ],
    "relatedTopics": ["wearable-lowpower", "bldc-three-phase-drive", "ntc-thermistor"],
    "sourcePdf": "IC-spec/tmag5134.pdf",
    "i18n": {
      "en": {
        "title": "Hall Magnetic Sensing Circuits (TMAG Family: Switch/Latch/Linear/Angle)",
        "description": "Lid detection, RPM counting, knob angles and contactless position feedback all ride on Hall sensors - choosing among switch/latch/linear/3D-angle types, designing the magnet operating point, and stray-field immunity are the three make-or-break steps.",
        "principles": "A Hall element outputs a voltage proportional to the perpendicular flux density; by back-end processing there are four families: switches (turn on past B_OP, release at B_RP, hysteresis against chatter - lid detection), latches (south turns on, north releases - RPM counting with ring magnets), linear parts (output proportional to B - position/current sensing) and 3D/angle parts (multi-axis TMAG family - knob angles, motor commutation). Design starts from the magnetic circuit: magnet material (NdFeB strong but temperature-sensitive, ferrite weak but stable), magnetization direction and working distance set the B range the sensor sees, and the full mechanical tolerance chain (distance ±, offset ±, temperature) must still land inside B_OP/B_RP or the linear range. Duty-cycled low-power variants (µA-level average current) suit battery devices, but the sampling rate caps the fastest detectable RPM or open/close event. Automotive parts need stray-field immunity (ISO 11452-8) - differential Hall or gradient sensing cancels uniform stray fields.",
        "designNotes": [
          "Draw the magnetic circuit before picking parts: sweep nearest/farthest distance plus offset tolerance and keep B inside the spec window with margin",
          "NdFeB tempco is about -0.1%/°C - include the B loss at temperature in the farthest operating point",
          "For duty-cycled parts check sampling rate vs fastest event: 10Hz suits a watch lid, not motor commutation",
          "Ferromagnetic hardware near the sensor (screws, shields) warps the magnetic circuit - measure before the mechanics freeze",
          "For automotive pick differential/gradient types with stray-field immunity, or keep high-current traces away by layout"
        ],
        "commonMistakes": [
          "Validating only at nominal distance - at worst-case (farthest + offset + hot) B falls below B_OP and production fails statistically",
          "Using a latch as a switch (or vice versa) with the wrong magnet polarity design - behavior is completely wrong",
          "A duty-cycled Hall on a fast event - the event lands between samples and is missed",
          "A metal bracket added near the sensor after design - the magnetic circuit is shunted and sensitivity drifts across the whole production lot"
        ]
      },
      "ja": {
        "title": "ホール磁気センサ応用回路（TMAG 系：スイッチ/ラッチ/リニア/角度）",
        "description": "蓋の開閉検出、回転数カウント、ノブ角度、非接触位置フィードバックはすべてホールセンサ頼み——スイッチ/ラッチ/リニア/3D 角度型の選定、磁石動作点の設計、外乱磁場耐性が成否を分ける 3 つの要素。",
        "principles": "ホール素子は垂直磁束密度に比例した電圧を出力し、後段処理により 4 系統に分かれる：スイッチ型（B_OP で ON、B_RP で解除、ヒステリシスでチャタリング防止——蓋検出）、ラッチ型（S 極で ON、N 極で解除——リング磁石で回転数カウント）、リニア型（B に比例出力——位置/電流計測）、3D/角度型（多軸 TMAG 系——ノブ角度、モータ転流）。設計は磁気回路から始まる：磁石材質（NdFeB は強いが温度に敏感、フェライトは弱いが安定）、着磁方向、動作距離がセンサの見る B 範囲を決め、機構公差チェーン全体（距離±、オフセット±、温度）を掃引しても B_OP/B_RP またはリニア範囲に収まる必要がある。デューティサンプリングの低消費電力型（平均 µA 級）は電池機器向けだが、サンプリングレートが検出可能な最高回転数/開閉速度を制限する。車載は外乱磁場耐性（ISO 11452-8）が必要——差動ホール/勾配計測なら均一な外乱磁場を相殺できる。",
        "designNotes": [
          "部品選定の前に磁気回路を描く：最近/最遠距離＋オフセット公差を掃引し、B が余裕を持って規格窓に収まること",
          "NdFeB の温度係数は約 -0.1%/°C——高温での B 減衰を最遠動作点に織り込む",
          "デューティサンプリング型はサンプリングレート vs 最速イベントを確認：時計の蓋 10Hz は足りるがモータ転流には不足",
          "センサ近傍の強磁性部品（ねじ、シールド）は磁気回路を歪める——機構確定前に実測",
          "車載は外乱磁場耐性のある差動/勾配型を選ぶか、レイアウトで大電流配線を遠ざける"
        ],
        "commonMistakes": [
          "公称距離だけで検証し、最悪ケース（最遠＋オフセット＋高温）で B が B_OP を下回り量産で確率的に不良",
          "ラッチ型をスイッチ型として使う（またはその逆）、磁石極性設計が誤り動作がまったく違う",
          "サンプリング型ホールを高速イベントに使い、イベントがサンプル間に落ちて検出漏れ",
          "設計後にセンサ近くへ金属ブラケットを追加、磁気回路が分流され量産全体で感度がドリフト"
        ]
      },
      "ko": {
        "title": "홀 자기 감지 응용 회로(TMAG 계열: 스위치/래치/리니어/각도)",
        "description": "덮개 감지, 회전수 카운트, 노브 각도, 비접촉 위치 피드백은 모두 홀 센서에 달렸다 - 스위치/래치/리니어/3D 각도형 선정, 자석 동작점 설계, 외란 자기장 내성이 성패를 가르는 세 단계다.",
        "principles": "홀 소자는 수직 자속 밀도에 비례한 전압을 출력하고, 후단 처리에 따라 4가지로 나뉜다: 스위치형(B_OP에서 ON, B_RP에서 해제, 히스테리시스로 채터링 방지 - 덮개 감지), 래치형(S극 ON, N극 해제 - 링 자석으로 회전수 카운트), 리니어형(B에 비례 출력 - 위치/전류 측정), 3D/각도형(다축 TMAG 계열 - 노브 각도, 모터 정류). 설계는 자기 회로에서 시작한다: 자석 재질(NdFeB는 강하지만 온도에 민감, 페라이트는 약하지만 안정), 착자 방향, 동작 거리가 센서가 보는 B 범위를 정하고, 기구 공차 사슬 전체(거리±, 오프셋±, 온도)를 훑어도 B_OP/B_RP나 리니어 범위 안에 들어야 한다. 듀티 샘플링 저전력형(평균 µA급)은 배터리 기기에 적합하지만 샘플링 속도가 감지 가능한 최고 회전수/개폐 속도를 제한한다. 차량용은 외란 자기장 내성(ISO 11452-8)이 필요 - 차동 홀/그래디언트 측정이면 균일한 외란 자기장을 상쇄할 수 있다.",
        "designNotes": [
          "부품 선정 전에 자기 회로부터 그림: 최근/최원 거리+오프셋 공차를 훑고 B가 여유 있게 규격 창 안에 들도록",
          "NdFeB 온도 계수는 약 -0.1%/°C - 고온에서의 B 감쇠를 최원 동작점에 반영",
          "듀티 샘플링형은 샘플링 속도 vs 최고속 이벤트 확인: 시계 덮개 10Hz면 충분하나 모터 정류에는 부족",
          "센서 근처의 강자성 부품(나사, 실드)은 자기 회로를 왜곡 - 기구 확정 전 실측",
          "차량용은 외란 자기장 내성이 있는 차동/그래디언트형을 고르거나 레이아웃에서 대전류 배선을 멀리"
        ],
        "commonMistakes": [
          "공칭 거리에서만 검증 - 최악 조건(최원+오프셋+고온)에서 B가 B_OP 아래로 떨어져 양산에서 확률적 불량",
          "래치형을 스위치형으로 사용(또는 반대), 자석 극성 설계가 틀려 동작이 완전히 다름",
          "샘플링형 홀을 빠른 이벤트에 사용, 이벤트가 샘플 사이에 떨어져 감지 누락",
          "설계 후 센서 근처에 금속 브래킷 추가, 자기 회로가 분류되어 양산 전체에서 감도 드리프트"
        ]
      }
    },
    "createdAt": "2026-07-17T00:00:00Z",
    "updatedAt": "2026-07-17T00:00:00Z"
  });

  CARDS.push({
    "id": "automotive-led-matrix",
    "title": "車用矩陣式 LED 大燈驅動（TPS99002S-Q1：升壓＋矩陣管理）",
    "category": "power-management",
    "products": ["車用電子"],
    "description": "自適應頭燈（ADB）把光束切成幾十顆可獨立調光的 LED 像素——電源級要恆流驅動長串 LED，矩陣管理器再對每顆做旁路調光；熱設計、PWM 頻閃與故障診斷是車規三大關卡。",
    "principles": "矩陣式頭燈的架構是「恆流源＋串聯 LED 串＋每顆 LED 並聯一個旁路開關」：升壓（或升降壓）級把電池 9–16V 抬到 LED 串電壓（十幾顆白光 LED 串聯＝40–60V），輸出以恆流（如 1A 級）流過整串；矩陣管理器（如 TPS99002S-Q1 這類頭燈專用控制器）內含多路旁路 FET，把個別 LED 短路即熄滅該像素，PWM 旁路占空比即調光。這架構的巧妙在恆流源不用管像素開關——電流永遠一樣，只是流過 LED 或旁路 FET 的差別；但旁路切換瞬間 LED 串電壓跳變，恆流環路要夠快跟上，輸出電容又不能大到拖慢響應。診斷是車規重點：單顆 LED 開路（旁路 FET 兩端電壓異常）、短路（該級壓降消失）都要偵測回報。PWM 調光頻率要避開人眼與車載相機頻閃（>200Hz 起跳，相機系統常要求更高）。熱設計上幾十瓦的 LED 熱由金屬基板（MCPCB）帶走，驅動電子與 LED 常分板。",
    "circuits": [],
    "keyFormulas": [
      "LED 串電壓 V_string ≈ n × Vf（12 顆白光 ×3.2V ≈ 38V）",
      "像素功率 P_LED = If × Vf；旁路 FET 導通損 = If² × RDS(on)",
      "PWM 調光頻率 >200Hz 避人眼頻閃；車載相機系統常需 kHz 級",
      "升壓級輸出功率 = If × V_string ÷ η——40W 級頭燈電源效率每 1% 都是熱"
    ],
    "designNotes": [
      "恆流環路頻寬 vs 旁路切換：輸出電容小而快的補償，像素切換時電流過衝要壓住",
      "旁路 FET 的開關順序/斜率管理降低電壓跳變（管理器內建 slew 控制就用它）",
      "LED 板用 MCPCB/厚銅，驅動板與 LED 板的連接線算進恆流迴路電感",
      "診斷線（故障回報、LED 溫度 NTC）與功率線分開走，ADC 取樣點加 RC 濾波",
      "EMC：升壓級輸入 π 濾波＋擴頻（spread spectrum）調變，CISPR 25 Class 5 是常見門檻"
    ],
    "commonMistakes": [
      "輸出電容照一般升壓選大值，像素切換時恆流環跟不上，畫面切換瞬間全串閃爍",
      "PWM 調光頻率取 100–200Hz，人眼不覺但行車記錄器/ADAS 相機拍到頻閃條紋",
      "旁路 FET 熱沒算（全亮時旁路不導通沒事，半亮時一半電流走 FET），部分調光工況過熱",
      "單 LED 開路沒被診斷攔住，恆流源把整串電壓推到 OVP，整燈熄滅而非單像素失效"
    ],
    "examples": [
      {
        "title": "ADB 自適應遠光",
        "application": "偵測對向來車後熄滅對應像素——TPS99002S-Q1 類管理器控制數十像素獨立調光",
        "circuit": "電池 → 升壓恆流（40–60V/1A）→ LED 串 ×N → 每顆並聯旁路 FET（矩陣管理器）→ CAN/UART 收像素命令"
      }
    ],
    "relatedTopics": ["led-driver", "boost-converter", "auto-load-dump"],
    "sourcePdf": "IC-spec/tps99002s-q1.pdf",
    "i18n": {
      "en": {
        "title": "Automotive Matrix LED Headlamp Drive (TPS99002S-Q1: Boost + Matrix Manager)",
        "description": "Adaptive driving beams slice the beam into dozens of individually dimmable LED pixels - a constant-current stage drives the long LED string and a matrix manager bypass-dims each LED; thermal design, PWM flicker and fault diagnostics are the three automotive gates.",
        "principles": "A matrix headlamp is 'constant-current source + series LED string + one bypass switch across each LED': a boost (or buck-boost) stage lifts the 9-16V battery to the string voltage (a dozen-plus white LEDs in series is 40-60V) and drives a constant current (around 1A) through the whole string; the matrix manager (a headlamp controller like the TPS99002S-Q1) integrates many bypass FETs - shorting an LED extinguishes that pixel, and PWM-ing the bypass duty dims it. The elegance is that the current source ignores pixel switching - the current never changes, it merely flows through either the LED or its bypass FET; but each bypass transition steps the string voltage, so the constant-current loop must be fast enough to follow while the output capacitor stays small enough not to slow it. Diagnostics are the automotive core: a single open LED (abnormal voltage across its bypass FET) or shorted LED (missing stage drop) must be detected and reported. PWM dimming frequency must dodge both human-eye and camera flicker (200Hz minimum, camera systems often demand kHz). Tens of watts of LED heat leave through a metal-core PCB, with drive electronics usually on a separate board.",
        "designNotes": [
          "Constant-current loop bandwidth vs bypass switching: small output capacitance with fast compensation, and clamp the current overshoot at pixel transitions",
          "Use the manager's built-in slew/sequencing control on bypass FETs to soften string-voltage steps",
          "LED board on MCPCB/heavy copper; include the drive-to-LED harness inductance in the current loop",
          "Route diagnostic lines (fault report, LED NTC) away from power, with RC filters at ADC sampling points",
          "EMC: input π-filter plus spread-spectrum modulation on the boost stage; CISPR 25 Class 5 is the usual bar"
        ],
        "commonMistakes": [
          "Output capacitor sized like a generic boost - the current loop cannot follow pixel switching and the whole string flickers at scene changes",
          "PWM dimming at 100-200Hz - invisible to the eye but dashcams/ADAS cameras record flicker banding",
          "Bypass-FET heat ignored (fine at full brightness, but at half dimming half the current runs in the FETs) - overheating at partial-dim operating points",
          "A single open LED not caught by diagnostics - the current source pushes the string to OVP and the whole lamp goes dark instead of one pixel"
        ]
      },
      "ja": {
        "title": "車載マトリクス LED ヘッドランプ駆動（TPS99002S-Q1：ブースト＋マトリクス管理）",
        "description": "アダプティブヘッドランプ（ADB）はビームを数十個の独立調光 LED ピクセルに分割する——定電流段が長い LED ストリングを駆動し、マトリクスマネージャが各 LED をバイパス調光。熱設計、PWM フリッカ、故障診断が車載の三大関門。",
        "principles": "マトリクスヘッドランプの構成は「定電流源＋直列 LED ストリング＋各 LED に並列のバイパススイッチ」：ブースト（または昇降圧）段がバッテリの 9-16V を LED ストリング電圧（白色 LED 十数個直列で 40-60V）まで昇圧し、ストリング全体に定電流（1A 級）を流す。マトリクスマネージャ（TPS99002S-Q1 のようなヘッドランプ用コントローラ）は多チャネルのバイパス FET を内蔵し、個別 LED を短絡すればそのピクセルが消灯、バイパスの PWM デューティで調光する。この方式の妙は定電流源がピクセルスイッチングを気にしなくてよいこと——電流は常に同じで、LED を流れるかバイパス FET を流れるかの違いだけ。ただしバイパス切替の瞬間にストリング電圧が跳ぶため、定電流ループは十分速く追従し、出力コンデンサは応答を遅らせない程度に小さく。診断が車載の核心：単一 LED のオープン（バイパス FET 両端電圧異常）もショート（その段の電圧降下消失）も検出・報告する。PWM 調光周波数は人間の目と車載カメラのフリッカを避ける（200Hz 以上、カメラシステムは kHz 級要求も）。数十ワットの LED 熱はメタル基板（MCPCB）で逃がし、駆動電子と LED は別基板が普通。",
        "designNotes": [
          "定電流ループ帯域 vs バイパス切替：出力容量は小さく補償は速く、ピクセル切替時の電流オーバーシュートを抑える",
          "バイパス FET はマネージャ内蔵のスルー/シーケンス制御を使いストリング電圧の跳びを緩和",
          "LED 基板は MCPCB/厚銅。駆動基板と LED 基板間のハーネスインダクタンスを電流ループに含めて評価",
          "診断線（故障報告、LED NTC）はパワーと分離して配線し、ADC サンプリング点に RC フィルタ",
          "EMC：ブースト入力に π フィルタ＋スペクトラム拡散変調。CISPR 25 Class 5 が通常の関門"
        ],
        "commonMistakes": [
          "出力コンデンサを一般ブースト感覚で大きくし、ピクセル切替に電流ループが追従できずシーン切替でストリング全体がちらつく",
          "PWM 調光を 100-200Hz にして人の目には見えないがドラレコ/ADAS カメラにフリッカ縞が写る",
          "バイパス FET の発熱を無視（全点灯では流れないが、半調光では電流の半分が FET を通る）、部分調光条件で過熱",
          "単一 LED オープンを診断で捕まえず、定電流源がストリング電圧を OVP まで押し上げ、1 ピクセルでなくランプ全体が消灯"
        ]
      },
      "ko": {
        "title": "차량용 매트릭스 LED 헤드램프 구동(TPS99002S-Q1: 부스트+매트릭스 관리)",
        "description": "어댑티브 헤드램프(ADB)는 빔을 수십 개의 독립 조광 LED 픽셀로 나눈다 - 정전류단이 긴 LED 스트링을 구동하고 매트릭스 매니저가 각 LED를 바이패스 조광한다; 열 설계, PWM 플리커, 고장 진단이 차량 3대 관문이다.",
        "principles": "매트릭스 헤드램프 구조는 '정전류원+직렬 LED 스트링+각 LED에 병렬 바이패스 스위치'다: 부스트(또는 벅부스트)단이 배터리 9-16V를 스트링 전압(백색 LED 십수 개 직렬 = 40-60V)으로 올리고 스트링 전체에 정전류(1A급)를 흘린다; 매트릭스 매니저(TPS99002S-Q1 같은 헤드램프 컨트롤러)는 다채널 바이패스 FET를 내장해 개별 LED를 단락하면 그 픽셀이 꺼지고 바이패스 PWM 듀티로 조광한다. 이 구조의 묘미는 정전류원이 픽셀 스위칭을 신경 쓸 필요가 없다는 것 - 전류는 항상 같고 LED로 흐르느냐 바이패스 FET로 흐르느냐만 다르다; 다만 바이패스 전환 순간 스트링 전압이 계단으로 튀므로 정전류 루프가 충분히 빨라야 하고 출력 커패시터는 응답을 늦추지 않게 작아야 한다. 진단이 차량의 핵심: LED 하나의 오픈(바이패스 FET 양단 전압 이상)이나 단락(그 단의 전압 강하 소실)을 감지·보고해야 한다. PWM 조광 주파수는 사람 눈과 차량 카메라 플리커를 피해야 한다(최소 200Hz, 카메라 시스템은 kHz급 요구). 수십 와트의 LED 열은 메탈 기판(MCPCB)으로 빼고 구동 전자부는 보통 별도 보드다.",
        "designNotes": [
          "정전류 루프 대역 vs 바이패스 전환: 출력 용량은 작게 보상은 빠르게, 픽셀 전환 시 전류 오버슈트 억제",
          "바이패스 FET는 매니저 내장 슬루/시퀀스 제어를 활용해 스트링 전압 계단을 완화",
          "LED 보드는 MCPCB/후동박; 구동 보드-LED 보드 하니스 인덕턴스를 전류 루프에 포함해 평가",
          "진단선(고장 보고, LED NTC)은 전력선과 분리 배선, ADC 샘플링 지점에 RC 필터",
          "EMC: 부스트 입력 π 필터+스펙트럼 확산 변조; CISPR 25 Class 5가 통상 기준"
        ],
        "commonMistakes": [
          "출력 커패시터를 일반 부스트처럼 크게 잡아 픽셀 전환에 전류 루프가 못 따라가 장면 전환마다 스트링 전체가 깜빡임",
          "PWM 조광을 100-200Hz로 잡아 눈에는 안 보여도 블랙박스/ADAS 카메라에 플리커 줄무늬가 찍힘",
          "바이패스 FET 발열 무시(전체 점등 시는 괜찮지만 반조광 시 전류 절반이 FET로) - 부분 조광 조건에서 과열",
          "LED 하나 오픈을 진단이 못 잡아 정전류원이 스트링 전압을 OVP까지 밀어올려 픽셀 하나가 아닌 램프 전체 소등"
        ]
      }
    },
    "createdAt": "2026-07-17T00:00:00Z",
    "updatedAt": "2026-07-17T00:00:00Z"
  });

  CARDS.push({
    "id": "usbc-cc-mux",
    "title": "USB-C CC 邏輯與 SuperSpeed Mux（HD3SS3220：DRP/正反插切換）",
    "category": "high-speed",
    "products": ["筆電", "手機", "通用"],
    "description": "Type-C 的正反插與角色協商全靠兩根 CC 腳——CC 控制器判斷插入方向與 DFP/UFP 角色，SuperSpeed mux 把對應方向那組差分對接進 SoC；CC 上拉/下拉值與 mux 訊號完整性是兩個核心。",
    "principles": "USB-C 接頭上下兩排各有一組 SuperSpeed 差分對（TX/RX），插正插反只有一組真正接到線纜——所以需要偵測方向再用 2:1 mux 切換。方向與角色判斷都在 CC1/CC2 腳：DFP（主機）在 CC 上掛上拉電流/電阻（Rp，值代表可供電流 500mA/1.5A/3A），UFP（裝置）掛 5.1kΩ 下拉（Rd）；插入後只有一根 CC 導通，哪根有效即知方向。DRP（雙角色）在 Rp/Rd 之間輪替，插入時依對方角色落定。HD3SS3220 這類整合 IC＝CC 控制器＋10Gbps 級 SuperSpeed mux：處理方向偵測、角色協商、VCONN 供電（給主動線纜的 e-marker），並把正確方向的 TX/RX 對切給 SoC。mux 是高速類比開關，插入損耗與回損直接吃訊號預算，10Gbps 下走線要當 USB3.2 標準對待：100Ω 差分（實務常 90Ω±10% 依規範）、對內等長、AC 耦合電容照規範位置放。PD 快充另需 PD 控制器在 CC 上跑 BMC 協定（見 PD 卡）。",
    "circuits": [],
    "keyFormulas": [
      "Rp 對應供流：56kΩ→預設 500/900mA、22kΩ→1.5A、10kΩ→3A（5V pull-up 時）",
      "UFP 下拉 Rd = 5.1kΩ ±10%",
      "USB3.2 Gen1/Gen2＝5/10Gbps，差分阻抗 90Ω（±10%）、對內 skew <5ps 級",
      "VCONN 供電範圍 3.0–5.5V，主動線纜 e-marker 由 VCONN 供電"
    ],
    "designNotes": [
      "CC1/CC2 各自獨立走線到控制器，別互換；死電池（dead battery）功能需要的 Rd 路徑照 datasheet 保留",
      "mux 到接頭與到 SoC 的 SuperSpeed 對都算插損預算，走線短、90Ω 差分、對內等長",
      "AC 耦合電容（TX 對上 100nF 級）位置照規範，焊盤挖空參考層降低不連續",
      "VBUS 熱插拔浪湧：入口加 TVS 與適當 bulk；CC 腳 ESD 防護選低電容品",
      "接頭 shell 接地與屏蔽罩縫合 via 圍一圈，10Gbps 下接頭區是 EMI 熱點"
    ],
    "commonMistakes": [
      "Rp/Rd 值配錯（拿 10kΩ 當預設檔），對方以為可拉 3A，實際供電不起導致掉電重啟",
      "只接 CC1 沒接 CC2（或反了），正插能用反插死機——正反插測試各角度都要跑",
      "mux 省掉直接把兩組對併聯到 SoC，stub 效應在 5Gbps 就把眼圖吃掉",
      "AC 耦合電容放錯側或用大封裝，10Gbps 回損超標、相容性測試翻車"
    ],
    "examples": [
      {
        "title": "筆電 Type-C 埠",
        "application": "HD3SS3220 做 DRP：接手機變主機、接塢站變裝置，SuperSpeed 正反插自動切換",
        "circuit": "Type-C 接頭 CC1/CC2 → HD3SS3220（Rp/Rd 輪替＋方向偵測）→ mux 切 TX/RX 對 → SoC USB3 PHY"
      }
    ],
    "relatedTopics": ["usbc-pd-sink-path", "usb-design", "differential-pair"],
    "sourcePdf": "IC-spec/hd3ss3220l.pdf",
    "i18n": {
      "en": {
        "title": "USB-C CC Logic & SuperSpeed Mux (HD3SS3220: DRP / Flip Detection)",
        "description": "Type-C flip-ability and role negotiation ride entirely on the two CC pins - a CC controller resolves orientation and DFP/UFP role, and a SuperSpeed mux routes the active differential pairs to the SoC; CC pull values and mux signal integrity are the two cores.",
        "principles": "A Type-C receptacle has a SuperSpeed pair set (TX/RX) on each of its two rows, and only one set actually reaches the cable depending on plug orientation - hence orientation detection plus a 2:1 mux. Orientation and role both live on CC1/CC2: a DFP (host) presents a pull-up (Rp, whose value advertises 500mA/1.5A/3A), a UFP (device) presents a 5.1kΩ pull-down (Rd); after attach only one CC is connected, and which one identifies the orientation. A DRP alternates Rp/Rd and settles based on the partner. An integrated part like the HD3SS3220 combines the CC controller with a 10Gbps-class SuperSpeed mux: it detects orientation, negotiates roles, supplies VCONN (for e-marked active cables) and switches the correct TX/RX pairs to the SoC. The mux is a high-speed analog switch whose insertion and return loss eat straight into the link budget, so at 10Gbps the routing is full USB3.2 discipline: 90Ω differential (±10%), tight intra-pair matching, AC-coupling caps at their specified positions. PD fast charging additionally needs a PD controller running BMC on CC (see the PD card).",
        "designNotes": [
          "Route CC1/CC2 individually to the controller and never swap them; preserve the Rd path required for dead-battery operation per datasheet",
          "Both mux-to-connector and mux-to-SoC SuperSpeed pairs count in the insertion-loss budget - short, 90Ω differential, intra-pair matched",
          "Place AC-coupling caps (about 100nF on TX pairs) at the spec position and void the reference plane under the pads to reduce discontinuity",
          "VBUS hot-plug inrush: TVS plus appropriate bulk at the port; choose low-capacitance ESD parts for CC pins",
          "Stitch the connector shell and shield can with a via fence - the connector area is the EMI hotspot at 10Gbps"
        ],
        "commonMistakes": [
          "Wrong Rp/Rd value (10kΩ used as the default tier) - the partner believes it may draw 3A, the supply cannot deliver, and the port brown-outs and restarts",
          "Only CC1 wired (or swapped) - works right-side-up, dead when flipped; test every plug orientation",
          "Omitting the mux and teeing both pair sets to the SoC - stub effects destroy the eye already at 5Gbps",
          "AC-coupling caps on the wrong side or in a large package - return loss fails at 10Gbps and compliance testing collapses"
        ]
      },
      "ja": {
        "title": "USB-C CC ロジックと SuperSpeed Mux（HD3SS3220：DRP／表裏検出）",
        "description": "Type-C の表裏挿しとロール交渉は 2 本の CC ピンがすべて——CC コントローラが挿入方向と DFP/UFP ロールを判定し、SuperSpeed mux が有効な側の差動ペアを SoC につなぐ。CC のプル値と mux の信号品質が 2 つの核心。",
        "principles": "Type-C レセプタクルは上下 2 列それぞれに SuperSpeed ペア（TX/RX）を持ち、挿す向きによって実際にケーブルへつながるのは片方だけ——だから方向検出と 2:1 mux が要る。方向とロールは CC1/CC2 で決まる：DFP（ホスト）は CC にプルアップ（Rp、値が供給可能電流 500mA/1.5A/3A を宣言）、UFP（デバイス）は 5.1kΩ プルダウン（Rd）。接続後は片方の CC だけが導通し、どちらが有効かで向きがわかる。DRP（デュアルロール）は Rp/Rd を交互に出し、相手に応じて確定する。HD3SS3220 のような統合 IC は CC コントローラ＋10Gbps 級 SuperSpeed mux：方向検出、ロール交渉、VCONN 供給（e-marker 付きアクティブケーブル用）を処理し、正しい TX/RX ペアを SoC へ切り替える。mux は高速アナログスイッチで挿入損失と反射損失がリンクバジェットを直接削るため、10Gbps では USB3.2 の流儀で配線する：90Ω 差動（±10%）、ペア内等長、AC 結合コンデンサは規定位置。PD 急速充電はさらに PD コントローラが CC 上で BMC プロトコルを走らせる（PD カード参照）。",
        "designNotes": [
          "CC1/CC2 は個別にコントローラへ配線し入れ替えない。デッドバッテリ動作に必要な Rd 経路はデータシートどおり残す",
          "mux〜コネクタ、mux〜SoC の両方の SuperSpeed ペアが挿入損失バジェットに入る——短く、90Ω 差動、ペア内等長",
          "AC 結合コンデンサ（TX ペアに 100nF 級）は規定位置に置き、パッド下の基準プレーンを抜いて不連続を低減",
          "VBUS ホットプラグ突入：ポートに TVS と適切なバルク容量。CC ピンの ESD 保護は低容量品を選ぶ",
          "コネクタシェルとシールド缶をビアフェンスで縫う——10Gbps ではコネクタ周りが EMI ホットスポット"
        ],
        "commonMistakes": [
          "Rp/Rd の値違い（10kΩ をデフォルト段として使用）で相手が 3A 引けると誤解、供給が追いつかずポートが電圧低下・再起動",
          "CC1 しか配線しない（または入れ替え）、正挿しは動くが逆挿しで死ぬ——全方向の挿抜テスト必須",
          "mux を省いて両ペアを SoC に並列接続、スタブ効果で 5Gbps でもアイが消える",
          "AC 結合コンデンサを誤った側や大型パッケージで実装、10Gbps で反射損失超過、コンプライアンス試験に落ちる"
        ]
      },
      "ko": {
        "title": "USB-C CC 로직과 SuperSpeed Mux(HD3SS3220: DRP/방향 감지)",
        "description": "Type-C의 뒤집어 꽂기와 역할 협상은 CC 핀 두 개에 전부 달렸다 - CC 컨트롤러가 삽입 방향과 DFP/UFP 역할을 판정하고 SuperSpeed mux가 유효한 쪽 차동 쌍을 SoC에 연결한다; CC 풀 값과 mux 신호 무결성이 두 핵심이다.",
        "principles": "Type-C 리셉터클은 상하 두 열에 각각 SuperSpeed 쌍(TX/RX)이 있고, 꽂는 방향에 따라 실제 케이블에 연결되는 것은 한 세트뿐 - 그래서 방향 감지와 2:1 mux가 필요하다. 방향과 역할은 CC1/CC2에서 정해진다: DFP(호스트)는 CC에 풀업(Rp, 값이 공급 가능 전류 500mA/1.5A/3A를 광고), UFP(디바이스)는 5.1kΩ 풀다운(Rd); 연결 후 한쪽 CC만 도통하고 어느 쪽이 유효한지로 방향을 안다. DRP(듀얼 롤)는 Rp/Rd를 번갈아 내고 상대에 따라 확정한다. HD3SS3220 같은 통합 IC는 CC 컨트롤러+10Gbps급 SuperSpeed mux: 방향 감지, 역할 협상, VCONN 공급(e-마커 액티브 케이블용)을 처리하고 올바른 TX/RX 쌍을 SoC로 전환한다. mux는 고속 아날로그 스위치라 삽입 손실·반사 손실이 링크 버짓을 직접 깎으므로 10Gbps에서는 USB3.2 규율로 배선한다: 90Ω 차동(±10%), 쌍 내 등장, AC 커플링 커패시터는 규정 위치에. PD 급속충전은 추가로 PD 컨트롤러가 CC에서 BMC 프로토콜을 돌린다(PD 카드 참조).",
        "designNotes": [
          "CC1/CC2는 각각 개별로 컨트롤러에 배선하고 바꿔치지 말 것; 데드 배터리 동작에 필요한 Rd 경로는 데이터시트대로 유지",
          "mux-커넥터, mux-SoC 양쪽 SuperSpeed 쌍 모두 삽입 손실 버짓에 포함 - 짧게, 90Ω 차동, 쌍 내 등장",
          "AC 커플링 커패시터(TX 쌍에 100nF급)는 규정 위치에, 패드 아래 기준 플레인을 비워 불연속 저감",
          "VBUS 핫플러그 돌입: 포트에 TVS와 적절한 벌크; CC 핀 ESD 보호는 저용량품 선택",
          "커넥터 셸과 실드 캔을 비아 펜스로 봉합 - 10Gbps에서 커넥터 주변이 EMI 핫스팟"
        ],
        "commonMistakes": [
          "Rp/Rd 값 오배(10kΩ을 기본 단으로 사용) - 상대가 3A를 끌 수 있다고 오해, 공급이 못 버텨 포트가 전압 강하·재시작",
          "CC1만 배선(또는 뒤바뀜) - 바로 꽂으면 되고 뒤집으면 죽음; 모든 방향 삽입 테스트 필수",
          "mux를 생략하고 두 쌍을 SoC에 병렬 연결 - 스텁 효과로 5Gbps에서 이미 아이가 사라짐",
          "AC 커플링 커패시터를 잘못된 쪽이나 큰 패키지로 실장 - 10Gbps 반사 손실 초과, 컴플라이언스 시험 탈락"
        ]
      }
    },
    "createdAt": "2026-07-17T00:00:00Z",
    "updatedAt": "2026-07-17T00:00:00Z"
  });

  window.KNOWLEDGE_EXTRA = (window.KNOWLEDGE_EXTRA || []).concat(CARDS);
})();
