/**
 * knowledge-extra2.js — 特殊線路知識卡批2（datasheet 打底自撰；sourcePdf 指向館內 IC-spec）
 * 8 張：隔離閘極驅動/USB-C PD sink/時脈樹端接/Class-D 輸出/太空級電源/電流感測 Kelvin/QFN EP 散熱/Hot-Rod 佈局
 * 併入方式同 knowledge-paid.js：concat 進 window.KNOWLEDGE_EXTRA，由 knowledge.js getSampleData() 吃入。
 */
(function () {
  var CARDS = [
  {
    "id": "isolated-gate-driver",
    "title": "隔離閘極驅動器設計（CMTI／DESAT／米勒箝位）",
    "category": "power-management",
    "products": [
      "車用電子",
      "AI 伺服器",
      "通用"
    ],
    "description": "SiC/IGBT 高壓開關需要跨隔離障壁把控制訊號變成閘極驅動——隔離耐壓、共模瞬態抗擾（CMTI）、去飽和保護、米勒箝位，四件事沒顧到，開關就會誤動作甚至炸管。",
    "principles": "隔離閘極驅動器把控制側（MCU/DSP 參考地）的 PWM 訊號，透過電容/磁/光隔離傳到功率側（浮動於開關源極/射極的高壓域），並提供足夠電流把 SiC MOSFET/IGBT 閘極快速充放電。CMTI（Common-Mode Transient Immunity）衡量隔離障壁兩側地電位快速跳動（dV/dt）時，訊號還能不能正確穿越——高壓開關切換瞬間障壁兩端電位差可能以 100V/ns 級速度變化，CMTI 不足會誤觸發或丟失訊號。DESAT（去飽和）保護監看功率開關導通時的 Vce/Vds，若開關該飽和導通卻電壓異常升高（代表短路或過電流、開關被拖出飽和區），保護電路在數百 ns 內軟關斷開關，避免短路電流無限制上升炸管。米勒箝位（Miller Clamp）解決開關在關斷狀態時，同相位臂另一開關切換造成的 dV/dt 透過米勒電容耦合進閘極、把 VGS 抬高到閾值以上引發誤導通（shoot-through）的問題——驅動器偵測閘極電壓低到某門檻後，用低阻抗路徑把閘極強拉到參考電位。隔離側供電（浮動域 VDD/VEE）需要獨立的隔離電源（如反馳或推挽變壓器供電），並在驅動器旁就近去耦，因為它要提供開關瞬間的大峰值電流。",
    "circuits": [],
    "keyFormulas": [
      "CMTI ≥ 150V/ns（UCC21711-Q1 規格下限）",
      "去飽和/過電流回應時間 ~270ns（快速偵測到軟關斷觸發）",
      "軟關斷電流 400mA（偵測到故障後緩降閘極，避免di/dt過大）",
      "米勒箝位觸發門檻 VCLMPTH ≈ VEE + 2V，箝位電流可達 4A"
    ],
    "designNotes": [
      "OC/DESAT 腳位偵測電壓只在開關導通期間有效（輸出低態時內部下拉鎖定，避免關斷時誤觸發）——用SenseFET＋精密電阻或傳統RC濾波去飽和電路皆可接",
      "米勒箝位只在驅動器輸出關斷、且閘極電壓夠低時才啟動，不能取代外部閘極電阻對dV/dt的抑制，兩者要一起設計",
      "隔離側供電要用專用隔離DC/DC，浮動域去耦電容就近擺，處理大電流閘極充放電的瞬態",
      "12V VDD UVLO＋開汲極RDY腳位是上電時序判斷點，MCU要等RDY確認才送PWM",
      "一次側/二次側爬電與間隙距離依安規等級（如UL1577）選封裝，勿只看資料表數字不看實際PCB佈局淨空"
    ],
    "commonMistakes": [
      "誤以為CMTI只是隔離元件參數，忽略PCB布局（隔離帶下方淨空、走線耦合）也會拉低實際共模抗擾",
      "米勒箝位電流當作可長時間承受的驅動電流使用，其實只設計來瞬態嵌位",
      "去飽和保護RC濾波時間設太長，短路偵測慢過功率開關短路耐受時間（SiC通常僅數µs）",
      "忽略隔離側供電去耦，開關瞬間電流跌落造成VDD跌破UVLO，開機或切換中斷驅動"
    ],
    "examples": [
      {
        "title": "SiC逆變器閘極驅動",
        "application": "牽引逆變器/OBC以UCC21711-Q1驅動1700V SiC MOSFET，DESAT+OC雙重保護搭配主動米勒箝位",
        "circuit": "MCU PWM → 隔離閘極驅動器 → 閘極電阻 → SiC MOSFET，OC腳接SenseFET或分流電阻"
      }
    ],
    "relatedTopics": [
      "regulator-ldo-vs-buck",
      "acdc-flyback",
      "auto-load-dump"
    ],
    "i18n": {
      "en": {
        "title": "Isolated Gate Driver Design (CMTI / DESAT / Miller Clamp)",
        "description": "SiC/IGBT high-voltage switches need control signals carried across an isolation barrier into gate drive - get isolation rating, CMTI, desaturation protection, or Miller clamp wrong and the switch mis-fires or blows up.",
        "principles": "An isolated gate driver carries the PWM signal from the control-side reference (MCU/DSP ground) across a capacitive/magnetic/optical barrier to the power side (a high-voltage domain floating on the switch source/emitter), and supplies enough current to slew the SiC MOSFET/IGBT gate quickly. CMTI (Common-Mode Transient Immunity) measures whether the signal still crosses correctly when the ground potential on the two sides of the barrier jumps fast (dV/dt) - during high-voltage switching the potential difference across the barrier can slew at 100V/ns-class rates, and insufficient CMTI causes false triggering or lost pulses. DESAT (desaturation) protection watches Vce/Vds while the power switch is supposed to be fully on; if the voltage rises abnormally (short circuit or overcurrent pulling the device out of saturation), the protection soft-turns-off the switch within a few hundred ns to keep the short-circuit current from running away. The Miller clamp addresses shoot-through: while a switch sits OFF, the other switch in the same phase leg turning on couples dV/dt through the Miller capacitance into the gate, potentially lifting VGS above threshold - the driver senses the gate voltage dropping below a threshold and pulls it hard to the reference rail through a low-impedance path. Isolated-side supply (the floating VDD/VEE domain) needs its own isolated DC/DC with decoupling placed right at the driver, since it must supply large peak currents during gate switching transients.",
        "designNotes": [
          "OC/DESAT pin sensing is only valid while the switch is ON (an internal pulldown locks it during OFF state to prevent false triggering) - works with SenseFET plus precision resistor or a traditional RC desaturation circuit",
          "Miller clamp only engages when the driver output is OFF and the gate voltage is already low; it does not replace external gate resistor sizing for dV/dt control - design both together",
          "Isolated-side supply needs a dedicated isolated DC/DC with decoupling placed right at the floating domain to handle large gate charge/discharge transients",
          "12V VDD UVLO plus the open-drain RDY pin mark the power-up timing gate - the MCU should wait for RDY before sending PWM",
          "Primary/secondary creepage and clearance follow the safety rating (e.g. UL1577) chosen for the package - verify actual PCB clearance under the isolation gap, not just the datasheet number"
        ],
        "commonMistakes": [
          "Treating CMTI as purely an isolator-component spec while ignoring that PCB layout (clearance under the isolation gap, trace coupling) also degrades real-world common-mode immunity",
          "Using the Miller clamp's peak current rating as if it were a sustained drive current, when it is only meant for transient clamping",
          "Setting the desaturation RC filter time too long, so short-circuit detection is slower than the power switch's short-circuit withstand time (often just a few microseconds for SiC)",
          "Skipping decoupling on the isolated-side supply, letting a switching current transient sag VDD below UVLO and interrupt drive mid-switch or at power-up"
        ]
      },
      "ja": {
        "title": "絶縁ゲートドライバ設計（CMTI／DESAT／ミラークランプ）",
        "description": "SiC/IGBT の高電圧スイッチは絶縁バリアを跨いで制御信号をゲート駆動に変換する必要がある——絶縁耐圧、CMTI、デサチュレーション保護、ミラークランプのどれかを外すと誤動作や破壊につながる。",
        "principles": "絶縁ゲートドライバは制御側（MCU/DSP 基準グランド）の PWM 信号を容量／磁気／光絶縁でパワー側（スイッチのソース／エミッタに浮いた高電圧ドメイン）へ伝え、SiC MOSFET/IGBT ゲートを高速に充放電する電流を供給する。CMTI（同相過渡耐性）は絶縁バリア両側のグランド電位が急変（dV/dt）しても信号が正しく通過できるかを示す指標——高電圧スイッチング瞬間はバリア両端の電位差が 100V/ns 級で変化しうるため、CMTI 不足は誤トリガや信号欠落を招く。DESAT（デサチュレーション）保護はスイッチが飽和導通しているはずの期間の Vce/Vds を監視し、異常上昇（短絡や過電流でデバイスが飽和領域から外れる）を検知すると数百 ns 以内にソフトターンオフして短絡電流の暴走を防ぐ。ミラークランプはシュートスルー対策——スイッチが OFF の間に同一相アームの他方が ON してミラー容量経由で dV/dt がゲートに結合し VGS が閾値を超えて誤導通する現象を防ぐため、ゲート電圧が一定しきい値以下に下がったことを検知し低インピーダンス経路で基準電位へ強制的に引き下げる。絶縁側電源（浮動 VDD/VEE ドメイン）は専用絶縁 DC/DC が必要で、ゲート充放電の大きな瞬時電流を賄うためドライバ直近にデカップリングを配置する。",
        "designNotes": [
          "OC/DESAT ピンの検出はスイッチ ON 期間のみ有効（OFF 時は内部プルダウンでロックし誤トリガ防止）——SenseFET＋高精度抵抗、または従来型 RC デサチュレーション回路のどちらでも接続可能",
          "ミラークランプはドライバ出力が OFF かつゲート電圧が十分低い時のみ動作し、外部ゲート抵抗による dV/dt 抑制の代替にはならない——両方を併せて設計する",
          "絶縁側電源は専用絶縁 DC/DC を使用し、ゲート充放電の大電流過渡に対応するためデカップリングを浮動ドメイン直近に配置",
          "12V VDD UVLO とオープンドレインの RDY ピンが電源投入タイミングの判断点——MCU は RDY 確認後に PWM を送出すべき",
          "一次/二次側の沿面・空間距離は安全規格（UL1577 等）に応じたパッケージ選定に従う——データシート数値だけでなく実基板の絶縁ギャップ下のクリアランスも確認"
        ],
        "commonMistakes": [
          "CMTI を絶縁部品単体のスペックとみなし、PCB レイアウト（絶縁ギャップ下のクリアランス、配線結合）が実効的な同相耐性を下げることを見落とす",
          "ミラークランプのピーク電流定格を持続駆動電流のように使ってしまう——本来は過渡クランプ専用",
          "デサチュレーション RC フィルタの時定数を長く設定しすぎ、短絡検出がパワースイッチの短絡耐量時間（SiC では数 µs 程度）より遅くなる",
          "絶縁側電源のデカップリングを省略し、スイッチング電流過渡で VDD が UVLO を割り込み、起動時や切替中にドライブが途切れる"
        ]
      },
      "ko": {
        "title": "절연 게이트 드라이버 설계(CMTI/DESAT/밀러 클램프)",
        "description": "SiC/IGBT 고전압 스위치는 절연 배리어를 넘어 제어 신호를 게이트 구동으로 바꿔야 한다 - 절연 내압, CMTI, 디새추레이션 보호, 밀러 클램프 중 하나라도 놓치면 오동작하거나 소자가 파손된다.",
        "principles": "절연 게이트 드라이버는 제어측(MCU/DSP 기준 그라운드)의 PWM 신호를 커패시티브/자기/광 절연을 통해 파워측(스위치 소스/에미터에 떠 있는 고전압 도메인)으로 전달하고, SiC MOSFET/IGBT 게이트를 빠르게 충방전할 전류를 공급한다. CMTI(공통모드 과도 내성)는 절연 배리어 양단의 그라운드 전위가 급변(dV/dt)해도 신호가 제대로 통과하는지를 나타내는 지표다 - 고전압 스위칭 순간 배리어 양단 전위차는 100V/ns급으로 변할 수 있어, CMTI가 부족하면 오트리거나 신호 유실이 발생한다. DESAT(디새추레이션) 보호는 스위치가 포화 도통 상태여야 할 때 Vce/Vds를 감시해, 비정상적으로 상승하면(단락이나 과전류로 소자가 포화 영역을 벗어남) 수백 ns 이내에 소프트 턴오프시켜 단락 전류가 폭주하지 않게 막는다. 밀러 클램프는 슛스루 방지 기능이다 - 스위치가 OFF 상태일 때 같은 상암의 다른 스위치가 켜지면서 밀러 커패시턴스를 통해 dV/dt가 게이트에 결합되어 VGS가 문턱 전압을 넘어 오도통되는 것을 막기 위해, 게이트 전압이 일정 문턱 이하로 내려간 것을 감지해 저임피던스 경로로 기준 전위에 강제로 끌어내린다. 절연측 전원(플로팅 VDD/VEE 도메인)은 전용 절연 DC/DC가 필요하며, 게이트 충방전의 큰 순시 전류를 감당하도록 드라이버 바로 옆에 디커플링을 배치한다.",
        "designNotes": [
          "OC/DESAT 핀 감지는 스위치 ON 구간에서만 유효(OFF 시 내부 풀다운으로 잠겨 오트리거 방지) - SenseFET+정밀 저항, 또는 전통적 RC 디새추레이션 회로 모두 연결 가능",
          "밀러 클램프는 드라이버 출력이 OFF이고 게이트 전압이 충분히 낮을 때만 동작하며, 외부 게이트 저항의 dV/dt 억제를 대체하지 않는다 - 둘을 함께 설계해야 함",
          "절연측 전원은 전용 절연 DC/DC를 사용하고, 게이트 충방전의 대전류 과도에 대응하도록 플로팅 도메인 바로 옆에 디커플링 배치",
          "12V VDD UVLO와 오픈드레인 RDY 핀이 전원 인가 타이밍 판단점 - MCU는 RDY 확인 후 PWM을 보내야 함",
          "1차/2차측 연면·공간 거리는 안전 등급(UL1577 등)에 맞춰 패키지를 선정 - 데이터시트 수치뿐 아니라 실제 PCB의 절연 갭 아래 클리어런스도 확인"
        ],
        "commonMistakes": [
          "CMTI를 절연 부품 단독 스펙으로만 여기고, PCB 레이아웃(절연 갭 아래 클리어런스, 배선 커플링)도 실효 공통모드 내성을 떨어뜨린다는 점을 간과",
          "밀러 클램프의 피크 전류 정격을 지속 구동 전류처럼 사용 - 원래 과도 클램핑 전용",
          "디새추레이션 RC 필터 시정수를 너무 길게 설정해, 단락 검출이 파워 스위치의 단락 내량 시간(SiC는 보통 수 µs)보다 느려짐",
          "절연측 전원 디커플링 생략으로 스위칭 전류 과도 시 VDD가 UVLO 아래로 처져 기동 중이나 스위칭 도중 구동이 끊김"
        ]
      }
    },
    "sourcePdf": "IC-spec/ucc21711-q1.pdf",
    "createdAt": "2026-07-10T00:00:00Z",
    "updatedAt": "2026-07-10T00:00:00Z"
  },
  {
    "id": "usbc-pd-sink-path",
    "title": "USB-C PD Sink 電源路徑設計（CC 腳／外部 FET 閘控／Dead-Battery）",
    "category": "power-management",
    "products": [
      "筆電",
      "手機",
      "通用"
    ],
    "description": "把 USB-C 埠變成受電端不只是接一顆 PD 控制器——CC 腳協商角色、VBUS 到系統的功率路徑要防倒灌與過壓、還要在電池完全沒電時也能吃電開機。",
    "principles": "USB-C PD sink 電源路徑三個關鍵環節。CC1/CC2：一開始靠 Rd 下拉／Rp 上拉分壓判斷插頭方向與供受電角色，插入後成為 PD 通訊的實體層（BMC 編碼），同時持續監看是否過壓（PHY OVP）以保護控制器。功率路徑閘控：控制器可以內建高壓負載開關直接導通 VBUS→系統（如 TPS25730AD 的 PPHV），也可以只驅動外部N型 MOSFET 閘極（TPS25730AS 的 PP_EXT），常見做法是兩顆N-FET共汲極或共源背對背串接，一顆負責正向導通控制，另一顆的本徵二極體方向相反，阻斷 VBUS 側電壓經 FET 本徵二極體倒灌回 VBUS 或系統側——這就是反向電流保護（RCP）。過壓保護（OVP）持續比較 VBUS／VSYS 電壓，超過設定門檻就切斷閘極，並用適當的閘極串聯電阻限制關斷時間但不能太大（放大會拖慢保護反應）。Dead-battery：系統電池完全放電、無法提供任何內部偏壓時，PD 控制器仍要能被識別為 sink——靠內建、不需外部電源就能拉低的 dead-battery Rd（下拉電阻），讓對面 source 偵測到 sink 存在並開始供電；控制器再用 VBUS 直接以內部高壓 LDO 產生 3.3V 給自己開機，等到系統韌體透過 I2C 清除 dead-battery flag 後才切回正常 CC 邏輯。",
    "circuits": [],
    "keyFormulas": [
      "Dead-battery Rd 下拉電阻 4.6–5.6kΩ（TPS25730A 規格，VIN_3V3=0V 時仍有效）",
      "外部N-FET閘極開啟時間 tGATE_VBUS_ON：VGS 0V→>3V 約 0.25–2ms（依外部FET特性，典型測試用 CSD17571Q2）",
      "VBUS過壓保護門檻 VOVP4RCP 可規劃範圍 5–24V",
      "閘極串聯電阻上限：不可超過3Ω，否則OVP/RCP關斷時間被拖慢"
    ],
    "designNotes": [
      "選內建開關（integrated switch）或外部閘控（external gate driver）看電流與成本：內建省外部元件但電流受限，外部FET可依應用選導通電阻與電流餘裕",
      "外部反向電流保護必須用共汲極（或共源）背對背雙FET，單顆FET的本徵二極體無法擋反向電流",
      "Dead-battery LDO與Rd電路要能在系統完全沒有任何偏壓時仍正常動作，量測時記得斷開電池模擬真實dead-battery情境",
      "CC腳位的PHY OVP保護獨立於功率路徑OVP，兩層保護不可只做一層",
      "VBUS放電電流電路（討論見規格書 IDSCH）確保拔除後VBUS快速降到安全電壓，避免插拔瞬間殘壓"
    ],
    "commonMistakes": [
      "只做正向導通FET，漏了背對背第二顆FET，結果VBUS異常時電流仍能經本徵二極體倒灌",
      "閘極串聯電阻抓太大想省成本，結果OVP/RCP反應時間變慢，失去保護意義",
      "忽略dead-battery情境測試，電池完全放電後USB-C根本無法識別、無法充電開機",
      "CC腳直接短接或未做PHY OVP，插入異常電壓源時控制器燒毀"
    ],
    "examples": [
      {
        "title": "筆電/工具機Type-C受電埠",
        "application": "以TPS25730AS驅動外部背對背NFET，支援dead-battery啟動與OVP/RCP",
        "circuit": "Type-C CC1/CC2 → PD控制器 → GATE_VSYS/GATE_VBUS驅動外部NFET → 系統VSYS"
      }
    ],
    "relatedTopics": [
      "usb-pd-fastcharge",
      "laptop-battery-charger",
      "reverse-battery-auto"
    ],
    "i18n": {
      "en": {
        "title": "USB-C PD Sink Power Path Design (CC Pins / External FET Gating / Dead-Battery)",
        "description": "Turning a USB-C port into a sink is more than dropping in a PD controller - the CC pins negotiate roles, the VBUS-to-system power path needs reverse-current and overvoltage protection, and the port must still power up when the battery is completely dead.",
        "principles": "Three key pieces of a USB-C PD sink power path. CC1/CC2: initially a Rd pulldown / Rp pullup divider decides plug orientation and source/sink role; after attach the pins become the PD physical layer (BMC encoding) and are continuously watched for overvoltage (PHY OVP) to protect the controller. Power-path gating: the controller can either integrate a high-voltage load switch straight from VBUS to system (e.g. TPS25730AD's PPHV) or just drive external N-channel MOSFET gates (TPS25730AS's PP_EXT) - the common topology is two N-FETs wired back-to-back common-drain (or common-source), one controlling forward conduction, the other's body diode oriented oppositely to block VBUS-side voltage from flowing back through a body diode into VBUS or the system rail - this is reverse current protection (RCP). Overvoltage protection (OVP) continuously compares VBUS/VSYS against a threshold and cuts the gate when exceeded, using a series gate resistor sized to limit turn-off time without slowing the protection response. Dead-battery: when the system battery is fully discharged with no internal bias available, the PD controller must still be recognized as a sink - via a built-in dead-battery Rd pulldown that works with no external supply, letting the source detect a sink and start delivering power; the controller then powers itself up from VBUS through an internal high-voltage LDO to 3.3V, and only reverts to normal CC logic once system firmware clears the dead-battery flag over I2C.",
        "designNotes": [
          "Integrated switch vs. external gate driver is a current/cost tradeoff: integrated saves external parts but limits current, external FETs let you pick RDS(on) and current headroom per application",
          "External reverse current protection needs two back-to-back FETs (common-drain or common-source) - a single FET's body diode cannot block reverse current",
          "The dead-battery LDO and Rd circuit must work with zero system bias present; test with the battery disconnected to simulate the real dead-battery case",
          "CC-pin PHY OVP protection is independent from power-path OVP - implement both layers, not just one",
          "VBUS discharge current (IDSCH in the datasheet) ensures VBUS drops to a safe level quickly after disconnect, avoiding residual voltage on hot-plug"
        ],
        "commonMistakes": [
          "Only implementing the forward-conduction FET and skipping the back-to-back second FET, so current can still flow backward through a body diode under an abnormal VBUS condition",
          "Oversizing the gate series resistor to save cost, which slows OVP/RCP response time and defeats the protection",
          "Skipping dead-battery testing - with the battery fully discharged the USB-C port can't be recognized at all and won't charge or power up",
          "Shorting the CC pins directly or omitting PHY OVP, letting an abnormal voltage source on CC destroy the controller"
        ]
      },
      "ja": {
        "title": "USB-C PD シンク電源経路設計（CC ピン／外部 FET ゲート制御／デッドバッテリー）",
        "description": "USB-C ポートをシンクにするには PD コントローラを載せるだけでは足りない——CC ピンが役割を交渉し、VBUS からシステムへの電力経路は逆流と過電圧を防ぎ、バッテリーが完全に空でも起動できなければならない。",
        "principles": "USB-C PD シンク電源経路の要点は3つ。CC1/CC2：接続前は Rd プルダウン／Rp プルアップの分圧でプラグの向きと給電/受電の役割を判定し、接続後は PD 通信の物理層（BMC 符号化）となり、同時にコントローラ保護のため過電圧（PHY OVP）を常時監視する。電力経路のゲート制御：コントローラは VBUS からシステムへ直結する高電圧ロードスイッチを内蔵する方式（TPS25730AD の PPHV）と、外部 N チャネル MOSFET のゲートのみを駆動する方式（TPS25730AS の PP_EXT）があり、後者では 2 個の N-FET を背中合わせ（共通ドレインまたは共通ソース）に接続し、片方が順方向導通を制御、もう一方は寄生ダイオードの向きが逆になるよう配置して VBUS 側の電圧が寄生ダイオード経由で VBUS やシステム側へ逆流するのを阻止する——これが逆電流保護（RCP）。過電圧保護（OVP）は VBUS/VSYS を常時しきい値と比較し、超えるとゲートを遮断する。ゲート直列抵抗はターンオフ時間を制限しつつ保護応答を遅らせない値に選ぶ。デッドバッテリー：システムバッテリーが完全放電し内部バイアスが得られない状態でも PD コントローラはシンクとして認識される必要がある——外部電源なしでも動作する内蔵デッドバッテリー Rd プルダウンにより、相手の source がシンクの存在を検知して給電を開始し、コントローラは VBUS から内蔵高電圧 LDO で 3.3V を生成して自身を起動、システムファームウェアが I2C 経由でデッドバッテリーフラグを解除して初めて通常の CC ロジックに戻る。",
        "designNotes": [
          "内蔵スイッチか外部ゲート駆動かは電流とコストのトレードオフ——内蔵は部品点数を減らせるが電流が制限され、外部 FET はオン抵抗と電流余裕をアプリケーションに応じて選べる",
          "外部逆電流保護には背中合わせの2個の FET（共通ドレインまたは共通ソース）が必要——単体 FET の寄生ダイオードでは逆電流を阻止できない",
          "デッドバッテリー用 LDO と Rd 回路はシステムバイアスがゼロの状態でも動作する必要があり、実測時はバッテリーを外して実際のデッドバッテリー状態を再現する",
          "CC ピンの PHY OVP 保護は電力経路 OVP とは独立しており、両方の保護層を実装すること",
          "VBUS 放電電流（データシートの IDSCH）により切断後 VBUS が安全な電圧まで速やかに下がり、抜き差し時の残留電圧を防ぐ"
        ],
        "commonMistakes": [
          "順方向導通用 FET のみ実装し背中合わせの2個目を省略、異常な VBUS 条件下で寄生ダイオード経由の逆流を許してしまう",
          "コスト削減でゲート直列抵抗を大きくしすぎ、OVP/RCP の応答が遅くなり保護の意味を失う",
          "デッドバッテリー試験を省略——バッテリー完全放電時に USB-C がまったく認識されず充電も起動もできない",
          "CC ピンを直結またはPHY OVPを省略し、異常電圧源が挿入されるとコントローラが破壊される"
        ]
      },
      "ko": {
        "title": "USB-C PD 싱크 전원 경로 설계(CC 핀/외부 FET 게이트 제어/데드배터리)",
        "description": "USB-C 포트를 싱크로 만드는 건 PD 컨트롤러 하나로 끝나지 않는다 - CC 핀이 역할을 협상하고, VBUS에서 시스템으로 가는 전력 경로는 역전류와 과전압을 막아야 하며, 배터리가 완전히 방전된 상태에서도 기동할 수 있어야 한다.",
        "principles": "USB-C PD 싱크 전원 경로의 핵심 세 가지. CC1/CC2: 연결 전에는 Rd 풀다운/Rp 풀업 분압으로 플러그 방향과 소스/싱크 역할을 판단하고, 연결 후에는 PD 통신의 물리 계층(BMC 인코딩)이 되며 동시에 컨트롤러 보호를 위해 과전압(PHY OVP)을 상시 감시한다. 전력 경로 게이팅: 컨트롤러는 VBUS에서 시스템으로 직결되는 고전압 로드 스위치를 내장하는 방식(TPS25730AD의 PPHV)이나 외부 N채널 MOSFET 게이트만 구동하는 방식(TPS25730AS의 PP_EXT)을 쓸 수 있다. 후자는 N-FET 두 개를 등을 맞대어(공통 드레인 또는 공통 소스) 연결하는 게 일반적으로, 하나는 순방향 도통을 제어하고 다른 하나는 바디 다이오드 방향을 반대로 두어 VBUS 측 전압이 바디 다이오드를 통해 VBUS나 시스템 측으로 역류하는 것을 막는다 - 이것이 역전류 보호(RCP)다. 과전압 보호(OVP)는 VBUS/VSYS를 문턱값과 상시 비교해 초과하면 게이트를 차단하며, 게이트 직렬 저항은 턴오프 시간을 제한하되 보호 응답을 늦추지 않는 값으로 선정한다. 데드배터리: 시스템 배터리가 완전 방전되어 내부 바이어스가 전혀 없어도 PD 컨트롤러는 싱크로 인식되어야 한다 - 외부 전원 없이도 동작하는 내장 데드배터리 Rd 풀다운으로 상대 소스가 싱크의 존재를 감지해 전력 공급을 시작하게 하고, 컨트롤러는 VBUS로부터 내장 고전압 LDO로 3.3V를 만들어 스스로 기동하며, 시스템 펌웨어가 I2C로 데드배터리 플래그를 해제해야 비로소 정상 CC 로직으로 돌아간다.",
        "designNotes": [
          "내장 스위치냐 외부 게이트 드라이버냐는 전류와 비용의 트레이드오프 - 내장은 외부 부품을 줄이지만 전류가 제한되고, 외부 FET는 온저항과 전류 여유를 애플리케이션에 맞게 고를 수 있음",
          "외부 역전류 보호는 등을 맞댄 FET 2개(공통 드레인 또는 공통 소스)가 필요 - 단일 FET의 바디 다이오드로는 역전류를 막을 수 없음",
          "데드배터리용 LDO와 Rd 회로는 시스템 바이어스가 전혀 없는 상태에서도 동작해야 하며, 실측 시 배터리를 분리해 실제 데드배터리 상황을 재현할 것",
          "CC 핀의 PHY OVP 보호는 전력 경로 OVP와 독립적이므로 두 보호 계층 모두 구현할 것",
          "VBUS 방전 전류(데이터시트의 IDSCH)로 분리 후 VBUS가 안전 전압까지 빠르게 떨어져 재삽입 시 잔류 전압을 방지"
        ],
        "commonMistakes": [
          "순방향 도통용 FET만 넣고 등을 맞댄 두 번째 FET를 생략, 비정상 VBUS 조건에서 바디 다이오드를 통한 역류를 허용",
          "비용 절감을 위해 게이트 직렬 저항을 과도하게 키워 OVP/RCP 응답이 느려지고 보호 기능이 무력화",
          "데드배터리 시험을 생략 - 배터리 완전 방전 시 USB-C가 아예 인식되지 않아 충전도 기동도 불가",
          "CC 핀을 직결하거나 PHY OVP를 생략해 비정상 전압원 삽입 시 컨트롤러가 파손"
        ]
      }
    },
    "sourcePdf": "IC-spec/tps25730a.pdf",
    "createdAt": "2026-07-10T00:00:00Z",
    "updatedAt": "2026-07-10T00:00:00Z"
  },
  {
    "id": "clock-tree-fanout",
    "title": "時脈樹扇出與端接（LVPECL Fanout Buffer）",
    "category": "high-speed",
    "products": [
      "AI 伺服器",
      "通用"
    ],
    "description": "一顆振盪器要餵給多顆 FPGA/ASIC/ADC 時，不能硬把輸出接去多點——要靠扇出緩衝器重新驅動，並且每條差動線都要端接對，否則反射與偏移（skew）會吃光時脈預算。",
    "principles": "時脈樹的核心問題是「一路變多路」還要保證每一路品質幾乎相同。扇出緩衝器（fanout buffer）把單一輸入時脈重新驅動成多組獨立輸出（如1:10），每組輸出有自己的驅動級，彼此不互相負載，避免菊鏈分支造成的阻抗不連續與反射。LVPECL（Low-Voltage Positive ECL）是高速時脈分佈的常見差動邏輯，輸出級是射極耦合對，天生需要靠電流源到負電源端接才能正常工作——端接不是「可加可不加」的選項，是電路正常運作的必要條件。典型端接有兩種：100Ω差動電阻直接跨在差動對兩端（簡單但不提供DC偏壓路徑，需搭配AC耦合），或戴維寧（Thevenin）等效——每一支輸出各自用一個電阻分壓到VCC與VCC-2V附近，同時提供DC工作點與AC端接，電阻值依VCC電壓不同而不同。Skew是同一顆緩衝器內，不同輸出通道之間的時間差，決定了下游元件之間的相對時序餘裕；抖動（jitter，又分固有的additive jitter與相位雜訊）則疊加在每個邊沿的時間不確定性上，直接吃掉高速介面的時序eye。時脈走線原則：差動對走線長度匹配、阻抗連續（50Ω單端或100Ω差動）、遠離其他高速數位訊號降低串擾，未用到的輸出腳位依資料表建議處理（留空或另一支同樣端接），避免半浮接造成的雜散反射。",
    "circuits": [],
    "keyFormulas": [
      "LVPECL輸出戴維寧端接(VCC=2.5V): 上拉250Ω + 下拉62.5Ω等效",
      "LVPECL輸出戴維寧端接(VCC=3.3V): 上拉130Ω + 下拉82Ω等效",
      "CDCLVP111-SEP: 典型輸出間偏移(skew)15ps，附加抖動<1ps，傳播延遲<355ps",
      "差動走線特性阻抗:單端約50Ω(到VCC-2V)，差動100Ω"
    ],
    "designNotes": [
      "每組差動輸出的端接電阻值必須對應實際VCC(2.5V/3.3V端接電阻不同)，抄錯電壓的端接表會讓輸出偏壓跑掉",
      "未使用的輸出對：依資料表建議留空(省電)，若差動對只用單邊，另一支腳仍要接同樣的50Ω端接，否則差動平衡被破壞",
      "電源去耦：每個供電腳位旁放高頻電容(如0.1µF)，並在板電源與晶片電源之間串接磁珠，隔離時脈緩衝器切換雜訊竄回主電源",
      "差動走線長度匹配(組內、組間都要)，彎折用等長蛇行補償，避免skew超出下游元件的時序餘裕",
      "單端輸入時要接VBB參考電壓到輸入並旁路電容，差動輸入才是高速應用的建議做法"
    ],
    "commonMistakes": [
      "LVPECL輸出當作一般CMOS訊號，沒做端接就直接接下一級，結果輸出波形反射鈴振、時脈品質崩壞",
      "端接電阻值套錯VCC電壓版本(2.5V電路套3.3V端接表)，輸出直流偏壓不在正確工作範圍",
      "扇出輸出直接並聯多顆負載當作分支，而不是每路獨立端接，造成阻抗不連續與skew暴增",
      "忽略電源去耦與雜訊隔離，附加抖動被電源雜訊放大，拖垮高速ADC/SerDes的時序餘裕"
    ],
    "examples": [
      {
        "title": "AI伺服器多顆FPGA共用主時脈",
        "application": "單顆晶振經CDCLVP111-SEP 1:10扇出，各輸出等長端接送到FPGA/ADC參考時脈輸入",
        "circuit": "OSC → LVPECL扇出緩衝器 → 10路差動端接輸出 → 各下游元件CLK腳"
      }
    ],
    "relatedTopics": [
      "retimer-redriver",
      "hbm-power-decoupling",
      "via-design"
    ],
    "i18n": {
      "en": {
        "title": "Clock Tree Fanout & Termination (LVPECL Fanout Buffer)",
        "description": "Feeding one oscillator to multiple FPGAs/ASICs/ADCs can't be done by wiring the output to several points directly - a fanout buffer must re-drive each branch, and every differential line needs proper termination or reflections and skew eat the entire clock budget.",
        "principles": "The core problem of a clock tree is turning one path into many while keeping every path's quality nearly identical. A fanout buffer re-drives a single input clock into several independent outputs (e.g. 1:10), each with its own output stage so branches don't load each other and avoid the impedance discontinuities and reflections that daisy-chained branches cause. LVPECL (Low-Voltage Positive ECL) is a common differential logic family for high-speed clock distribution; its output stage is an emitter-coupled pair that inherently needs a current path to a low rail through termination to work at all - termination isn't optional, it's required for the circuit to function. Two termination schemes are typical: a 100-ohm differential resistor straight across the pair (simple but provides no DC bias path, needs AC coupling), or a Thevenin equivalent - each output leg gets its own resistor divider toward VCC and roughly VCC-2V, giving both a DC operating point and AC termination, with resistor values depending on the supply voltage. Skew is the timing difference between output channels on the same buffer, setting the relative timing margin between downstream devices; jitter (both additive jitter and phase noise) adds uncertainty on every edge and directly eats into the timing eye of high-speed interfaces. Clock trace rules: match differential pair lengths, keep impedance continuous (50 ohm single-ended or 100 ohm differential), route away from other high-speed digital signals to cut crosstalk, and handle unused output pins per the datasheet recommendation (leave open, or terminate the other leg of the pair identically) to avoid stray reflections from a half-floating node.",
        "designNotes": [
          "Termination resistor values must match the actual VCC (2.5V and 3.3V need different resistor values) - using the wrong voltage's termination table shifts the output bias point",
          "Unused output pairs: leave open per the datasheet to save power; if only one leg of a pair is used, the other leg still needs identical 50-ohm termination or differential balance breaks",
          "Power decoupling: place a high-frequency cap (e.g. 0.1uF) at every supply pin, and add a ferrite bead between board and chip supply to isolate the clock buffer's switching noise from the main rail",
          "Match differential trace lengths (within and between pairs), use equal-length serpentine for bends, to keep skew inside downstream devices' timing margin",
          "For single-ended input, tie the VBB reference to the input and bypass it; differential input is still the recommended approach for high-speed applications"
        ],
        "commonMistakes": [
          "Treating LVPECL output like plain CMOS and wiring it straight to the next stage without termination - the output waveform rings from reflections and clock quality collapses",
          "Applying the wrong VCC version's termination resistor table (using the 3.3V table on a 2.5V rail), leaving the DC bias outside the correct operating range",
          "Paralleling multiple loads directly off one fanout output as if it were a branch, instead of terminating each path independently, causing impedance discontinuity and skew blowup",
          "Skipping power decoupling and noise isolation, letting supply noise amplify additive jitter and blow the timing margin of high-speed ADCs/SerDes"
        ]
      },
      "ja": {
        "title": "クロックツリーのファンアウトと終端（LVPECL ファンアウトバッファ）",
        "description": "1個の発振器を複数の FPGA/ASIC/ADC に供給する際、出力を複数点に直結してはいけない——ファンアウトバッファで再駆動し、各差動線を正しく終端しないと反射とスキューがクロック予算を食い尽くす。",
        "principles": "クロックツリーの本質は「1系統を多系統に分岐しつつ各系統の品質をほぼ揃える」こと。ファンアウトバッファは単一の入力クロックを複数の独立出力（例：1:10）に再駆動し、各出力が独自の出力段を持つことで分岐同士が負荷し合わず、デイジーチェーン分岐特有のインピーダンス不連続と反射を回避する。LVPECL（低電圧 PECL）は高速クロック分配で一般的な差動論理で、出力段はエミッタ結合対であり、正常動作には負電源側への電流経路（終端）が本質的に必要——終端は「あってもなくても良い」オプションではなく動作の必須条件。代表的な終端は2種：差動対の両端に100Ω抵抗を直結する方式（単純だが DC バイアス経路がなく AC 結合が必要）、または戴維寧（Thevenin）等価——各出力脚ごとに VCC と概ね VCC-2V 付近への分圧抵抗を入れ、DC 動作点と AC 終端を同時に与える。抵抗値は電源電圧により異なる。スキューは同一バッファ内の出力チャネル間の時間差で下流デバイス間の相対タイミング余裕を決め、ジッタ（固有の付加ジッタと位相雑音）は各エッジの時間不確かさとして重畳し高速インターフェースのタイミングアイを直接圧迫する。クロック配線の原則：差動対の長さを揃え、インピーダンスを連続に保ち（シングルエンド約50Ω、差動100Ω）、他の高速デジタル信号から離してクロストークを抑え、未使用出力ピンはデータシート推奨に従い処理（開放、または対の片側のみ使用時はもう片方も同様に終端）し半浮遊による迷走反射を避ける。",
        "designNotes": [
          "終端抵抗値は実際の VCC に対応させる（2.5V と 3.3V で抵抗値が異なる）——電圧を間違えた終端表を使うと出力バイアス点がずれる",
          "未使用出力対はデータシート推奨に従い開放（省電力）。差動対の片側のみ使用する場合ももう片方に同じ 50Ω 終端を施さないと差動バランスが崩れる",
          "電源デカップリング：各電源ピン近くに高周波コンデンサ（例：0.1μF）を配置し、基板電源とチップ電源の間にフェライトビーズを挿入してクロックバッファのスイッチング雑音がメイン電源へ回り込むのを遮断",
          "差動配線長を（対内・対間とも）揃え、曲げには等長蛇行を用いてスキューを下流デバイスのタイミング余裕内に収める",
          "シングルエンド入力時は VBB 参照電圧を入力に接続しバイパス——高速用途では差動入力が引き続き推奨"
        ],
        "commonMistakes": [
          "LVPECL 出力を通常の CMOS 信号のように扱い終端なしで次段に直結、出力波形が反射でリンギングしクロック品質が崩壊",
          "電源電圧バージョンを取り違えた終端抵抗表を適用（2.5V 回路に 3.3V 用終端表）、DC バイアスが正しい動作範囲から外れる",
          "ファンアウト出力に複数負荷を直接並列接続して分岐扱いし、各経路を個別終端しないためインピーダンス不連続とスキュー急増を招く",
          "電源デカップリングとノイズ分離を省略、電源雑音が付加ジッタを増幅し高速 ADC/SerDes のタイミング余裕を圧迫"
        ]
      },
      "ko": {
        "title": "클럭 트리 팬아웃과 종단(LVPECL 팬아웃 버퍼)",
        "description": "발진기 하나를 여러 FPGA/ASIC/ADC에 공급할 때 출력을 여러 지점에 직결하면 안 된다 - 팬아웃 버퍼로 재구동하고 모든 차동선을 제대로 종단하지 않으면 반사와 스큐가 클럭 예산을 다 잡아먹는다.",
        "principles": "클럭 트리의 핵심은 '한 경로를 여러 경로로 나누면서도 각 경로 품질을 거의 동일하게 유지'하는 것이다. 팬아웃 버퍼는 하나의 입력 클럭을 여러 독립 출력(예: 1:10)으로 재구동하며, 각 출력이 자체 출력단을 가져 서로 부하를 주지 않아 데이지체인 분기 특유의 임피던스 불연속과 반사를 피한다. LVPECL(저전압 PECL)은 고속 클럭 분배에 흔히 쓰이는 차동 로직으로, 출력단이 에미터 결합쌍이라 정상 동작하려면 음전원 쪽으로의 전류 경로(종단)가 본질적으로 필요하다 - 종단은 '있어도 되고 없어도 되는' 옵션이 아니라 회로가 동작하기 위한 필수 조건이다. 대표적 종단 방식은 두 가지: 차동쌍 양단에 100Ω 저항을 직결하는 방식(단순하지만 DC 바이어스 경로가 없어 AC 커플링 필요), 또는 테브난(Thevenin) 등가 - 각 출력 다리마다 VCC와 대략 VCC-2V 쪽으로 분압 저항을 넣어 DC 동작점과 AC 종단을 동시에 제공하며, 저항값은 공급 전압에 따라 다르다. 스큐는 같은 버퍼 내 출력 채널 간 시간차로 하류 소자 간 상대 타이밍 여유를 결정하고, 지터(고유 부가 지터와 위상 잡음)는 매 에지의 시간 불확실성으로 더해져 고속 인터페이스의 타이밍 아이를 직접 잠식한다. 클럭 배선 원칙: 차동쌍 길이 매칭, 임피던스 연속성 유지(싱글엔드 약 50Ω, 차동 100Ω), 다른 고속 디지털 신호와 떨어뜨려 크로스토크 저감, 미사용 출력 핀은 데이터시트 권장대로 처리(개방, 또는 쌍의 한쪽만 쓰면 다른 쪽도 동일하게 종단)해 반부유 노드로 인한 미로 반사를 피한다.",
        "designNotes": [
          "종단 저항값은 실제 VCC에 맞춰야 함(2.5V와 3.3V는 저항값이 다름) - 전압을 틀린 종단표를 쓰면 출력 바이어스점이 벗어남",
          "미사용 출력쌍은 데이터시트 권장대로 개방(절전); 쌍의 한쪽만 사용해도 다른 쪽에 동일한 50Ω 종단을 해야 차동 밸런스가 유지됨",
          "전원 디커플링: 각 전원 핀 근처에 고주파 커패시터(예: 0.1µF) 배치, 보드 전원과 칩 전원 사이에 페라이트 비드를 넣어 클럭 버퍼의 스위칭 잡음이 메인 전원으로 역류하는 것을 차단",
          "차동 배선 길이를(쌍 내부·쌍 간 모두) 매칭하고 꺾임에는 등길이 서펜타인을 사용해 스큐를 하류 소자의 타이밍 여유 안에 유지",
          "싱글엔드 입력 시 VBB 기준 전압을 입력에 연결하고 바이패스 - 고속 응용에서는 여전히 차동 입력이 권장됨"
        ],
        "commonMistakes": [
          "LVPECL 출력을 일반 CMOS 신호처럼 취급해 종단 없이 다음 단에 직결, 출력 파형이 반사로 링잉되어 클럭 품질 붕괴",
          "전원 전압 버전을 잘못 적용한 종단 저항표 사용(2.5V 회로에 3.3V용 종단표), DC 바이어스가 정상 동작 범위를 벗어남",
          "팬아웃 출력에 여러 부하를 직접 병렬 연결해 분기로 취급, 각 경로를 개별 종단하지 않아 임피던스 불연속과 스큐 급증",
          "전원 디커플링과 잡음 격리를 생략, 전원 잡음이 부가 지터를 증폭시켜 고속 ADC/SerDes의 타이밍 여유를 무너뜨림"
        ]
      }
    },
    "sourcePdf": "IC-spec/cdclvp111-sep.pdf",
    "createdAt": "2026-07-10T00:00:00Z",
    "updatedAt": "2026-07-10T00:00:00Z"
  },
  {
    "id": "classd-output-filter",
    "title": "Class-D音訊輸出級設計（LC濾波／免濾波近場／EMI）",
    "category": "power-management",
    "products": [
      "手機",
      "筆電",
      "通用"
    ],
    "description": "Class-D功率放大器把音訊調變成PWM開關訊號直接驅動喇叭，效率高但輸出是方波不是正弦波——要不要加LC重建濾波器、怎麼壓EMI，是每次選型都要算清楚的取捨。",
    "principles": "Class-D輸出級用高頻PWM開關驅動輸出橋，平均值才是還原出的音訊波形，開關頻率本身與其諧波是必然存在的高頻雜訊。傳統做法在輸出端加LC低通濾波器把開關頻率濾掉，只留音訊頻帶——但電感電容本身佔板面積、有損耗、還影響負載阻抗匹配。現代Class-D IC靠edge-rate control(邊沿轉換率控制)把開關邊沿的dV/dt/dI/dt主動放緩，大幅降低輻射與傳導雜訊，讓喇叭走線可以直接免濾波器(filterless/近場)驅動——條件是喇叭導線夠短(近場，通常指到喇叭的走線在可接受的輻射範圍內)、系統本身EMI裕度夠。若應用需要更嚴格的EMI裕度(如靠近天線、需過嚴格認證)，才加上選用的LC濾波器，此時濾波器截止頻率要設在遠高於音訊頻帶但低於欲抑制的雜訊頻段之間，且電感/電容必須成對使用——只裝電容沒裝電感、或反過來，會破壞輸出級的穩定性(電容單獨接在高dV/dt開關節點上造成過大充放電電流衝擊)。電源側同樣重要：PVDD是功率橋的直接供電，需要低ESL去耦電容(小容值、擺最近)搭配大容量儲能電容(供給脈衝電流)，兩者分工不能只用一種。",
    "circuits": [],
    "keyFormulas": [
      "LC濾波器截止頻率 Fc > 2.4MHz（高於音訊頻帶，低於欲抑制雜訊頻段）",
      "電感值下限 L_IND > 4×VBST/(π×Fc)（依開關電壓與截止頻率反推）",
      "PVDD低ESL去耦電容0.1µF（緊靠電源腳）+ 大容量儲能電容10µF（供脈衝電流）",
      "典型負載模擬條件 RL=8Ω+33µH(喇叭電阻+音圈電感)"
    ],
    "designNotes": [
      "免濾波(filterless)是靠邊沿轉換率控制達成，不是省略保護——選型前先確認IC是否明確支援filterless模式與其適用的喇叭走線長度上限",
      "LC濾波器一旦決定要裝，電感電容必須成對安裝(裝一顆不裝另一顆反而破壞輸出穩定性)，且電容要接在電感之後(靠近喇叭端)",
      "PVDD去耦分兩級：低ESL小電容處理高頻開關瞬態，大電容處理低頻脈衝電流供給，兩者都要靠近電源腳，不能互相取代",
      "GND迴路與功率地要獨立規劃，類比小訊號地不可與功率開關地共用同一段走線",
      "近場(filterless)應用仍建議做EMI預掃描，不同PCB布局/線長差異會讓輻射結果不同，不能只信規格書標稱值"
    ],
    "commonMistakes": [
      "只裝濾波電容不裝濾波電感省成本，結果高dV/dt節點直接對電容充放電，輸出級不穩定甚至過熱",
      "喇叭線拉得很長還用免濾波模式，近場條件被破壞，EMI認證過不了",
      "PVDD只放一顆去耦電容應付所有頻段，結果高頻雜訊或低頻脈衝其中一項處理不到位",
      "類比小訊號走線與Class-D開關輸出(OUT_P/OUT_N)平行佈線太近，耦合雜訊進前級電路"
    ],
    "examples": [
      {
        "title": "手機/筆電內建喇叭驅動",
        "application": "TAS2320以edge-rate control免濾波直驅喇叭，PVDD雙級去耦(0.1µF+10µF)",
        "circuit": "I2S音訊 → Class-D放大器 → OUT_P/OUT_N → 喇叭(近場，選配LC濾波)"
      }
    ],
    "relatedTopics": [
      "qfn-ep-thermal",
      "regulator-ldo-vs-buck",
      "emi-basics"
    ],
    "i18n": {
      "en": {
        "title": "Class-D Audio Output Stage Design (LC Filter / Filterless Near-Field / EMI)",
        "description": "A Class-D amplifier modulates audio into a PWM switching waveform that drives the speaker directly - efficient, but the output is a square wave, not a sine wave. Whether to add an LC reconstruction filter and how to control EMI is a tradeoff to work through every time.",
        "principles": "The Class-D output stage drives an output bridge with high-frequency PWM; only the average value reconstructs the audio waveform, and the switching frequency plus its harmonics are inherently high-frequency noise. The traditional approach adds an LC low-pass filter at the output to remove the switching frequency and keep only the audio band - but the inductor and capacitor take board area, add loss, and affect load impedance matching. Modern Class-D ICs use edge-rate control to actively slow the dV/dt/dI/dt of switching edges, cutting radiated and conducted noise enough that speaker traces can be driven directly filterless (near-field) - provided the speaker wiring is short enough (near-field generally means the trace-to-speaker run stays within an acceptable radiation envelope) and the system has enough EMI margin. Where an application needs tighter EMI margin (near an antenna, stricter certification), an optional LC filter is added; the cutoff frequency should sit well above the audio band but below the noise band to be suppressed, and the inductor and capacitor must always be used as a pair - installing only the capacitor without the inductor (or vice versa) breaks output-stage stability, since a capacitor alone on a high-dV/dt switching node causes excessive charge/discharge current spikes. The supply side matters equally: PVDD directly feeds the power bridge and needs a low-ESL decoupling cap (small value, placed closest) paired with a larger bulk cap (to supply pulse current) - the two roles are not interchangeable.",
        "designNotes": [
          "Filterless operation relies on edge-rate control, not on skipping protection - before selecting a device, confirm it explicitly supports a filterless mode and the maximum speaker trace length it's rated for",
          "Once an LC filter is used, the inductor and capacitor must be installed as a pair (installing only one breaks output stability), and the capacitor must sit after the inductor (closer to the speaker)",
          "Split PVDD decoupling into two tiers: a low-ESL small cap for high-frequency switching transients, a bulk cap for low-frequency pulse current supply - both must sit close to the supply pin and neither substitutes for the other",
          "Plan the ground return and power ground separately - analog small-signal ground must not share a trace segment with the power switching ground",
          "Even near-field (filterless) applications should still get an EMI pre-scan - radiated results vary with PCB layout and trace length, so don't rely solely on the datasheet's nominal numbers"
        ],
        "commonMistakes": [
          "Installing only the filter capacitor to save cost without the inductor, so the high-dV/dt node charges/discharges the cap directly and the output stage becomes unstable or overheats",
          "Running long speaker traces while still using filterless mode, breaking the near-field condition and failing EMI certification",
          "Using a single PVDD decoupling capacitor to cover every frequency band, leaving either the high-frequency noise or the low-frequency pulse current inadequately handled",
          "Routing analog small-signal traces too close and parallel to the Class-D switching outputs (OUT_P/OUT_N), coupling noise into the front-end circuit"
        ]
      },
      "ja": {
        "title": "Class-D オーディオ出力段設計（LC フィルタ／フィルタレス近接駆動／EMI）",
        "description": "Class-D アンプはオーディオを PWM スイッチング波形に変調してスピーカーを直接駆動する——高効率だが出力は方形波であって正弦波ではない。LC 再構成フィルタを付けるかどうか、EMI をどう抑えるかは毎回検討すべきトレードオフ。",
        "principles": "Class-D 出力段は高周波 PWM で出力ブリッジを駆動し、平均値がオーディオ波形を再現する。スイッチング周波数とその高調波は必然的に存在する高周波雑音である。従来手法は出力に LC ローパスフィルタを付けてスイッチング周波数を除去しオーディオ帯域のみ残すが、インダクタとコンデンサは基板面積を取り、損失があり、負荷インピーダンス整合にも影響する。現代の Class-D IC はエッジレートコントロール（スイッチングエッジの dV/dt・dI/dt を能動的に緩やかにする機能）により放射・伝導雑音を大幅に低減し、スピーカー配線を直接フィルタレス（近接駆動）で駆動できる——条件はスピーカー配線が十分短いこと（近接＝スピーカーまでの配線が許容放射範囲内であること）とシステムの EMI 余裕が十分であること。アンテナ近接や厳しい認証が必要な用途では、より厳しい EMI 余裕を得るためオプションの LC フィルタを追加する。この場合カットオフ周波数はオーディオ帯域より十分高く、抑制対象の雑音帯域より低い値に設定し、インダクタとコンデンサは必ずペアで使用する——コンデンサのみ実装しインダクタを省くと（あるいはその逆）出力段の安定性が崩れる（高 dV/dt スイッチングノードに単独接続されたコンデンサが過大な充放電電流を引き起こすため）。電源側も同様に重要：PVDD はパワーブリッジへの直接供給であり、低 ESL デカップリングコンデンサ（小容量・最近接配置）と大容量蓄電コンデンサ（パルス電流供給用）を併用する必要があり、どちらか一方では代替できない。",
        "designNotes": [
          "フィルタレス動作はエッジレートコントロールによるものであり、保護を省略しているわけではない——選定前にフィルタレスモードへの明示対応とその適用スピーカー配線長上限を確認する",
          "LC フィルタを使う場合、インダクタとコンデンサは必ずペアで実装（片方のみだと出力安定性が崩れる）し、コンデンサはインダクタの後段（スピーカー側）に配置する",
          "PVDD デカップリングは2段構成：低 ESL 小容量コンデンサで高周波スイッチング過渡に対応、大容量コンデンサで低周波パルス電流供給に対応——両方とも電源ピン近くに配置し、互いに代替不可",
          "グランドリターンとパワーグランドは独立して計画し、アナログ小信号グランドはパワースイッチンググランドと配線区間を共有しない",
          "近接（フィルタレス）用途でも EMI 事前スキャンを実施すべき——放射結果は PCB レイアウトや配線長で変わるため、データシートの公称値のみに頼らない"
        ],
        "commonMistakes": [
          "コスト削減のためフィルタコンデンサのみ実装しインダクタを省略、高 dV/dt ノードが直接コンデンサを充放電し出力段が不安定または過熱",
          "フィルタレスモードのままスピーカー配線を長く引き、近接条件が崩れ EMI 認証に不合格",
          "PVDD デカップリングコンデンサを1個だけで全帯域をカバーしようとし、高周波雑音か低周波パルス電流のいずれかが不十分な処理になる",
          "アナログ小信号配線を Class-D スイッチング出力（OUT_P/OUT_N）に近接・並走させ、前段回路に雑音を結合させる"
        ]
      },
      "ko": {
        "title": "Class-D 오디오 출력단 설계(LC 필터/필터리스 근접 구동/EMI)",
        "description": "Class-D 앰프는 오디오를 PWM 스위칭 파형으로 변조해 스피커를 직접 구동한다 - 효율은 높지만 출력은 사인파가 아니라 구형파다. LC 재구성 필터를 넣을지, EMI를 어떻게 억제할지는 매번 따져야 할 트레이드오프다.",
        "principles": "Class-D 출력단은 고주파 PWM으로 출력 브리지를 구동하며, 평균값이 오디오 파형을 재현한다. 스위칭 주파수와 그 고조파는 필연적으로 존재하는 고주파 잡음이다. 전통적 방식은 출력에 LC 저역통과 필터를 달아 스위칭 주파수를 제거하고 오디오 대역만 남기지만, 인덕터와 커패시터는 보드 면적을 차지하고 손실이 있으며 부하 임피던스 매칭에도 영향을 준다. 최신 Class-D IC는 에지 레이트 제어(스위칭 에지의 dV/dt, dI/dt를 능동적으로 완만하게 하는 기능)로 방사·전도 잡음을 크게 줄여 스피커 배선을 필터 없이(필터리스, 근접 구동) 직접 구동할 수 있다 - 조건은 스피커 배선이 충분히 짧을 것(근접이란 스피커까지의 배선이 허용 방사 범위 안에 있다는 뜻)과 시스템 자체의 EMI 여유가 충분할 것이다. 안테나 근접이나 엄격한 인증이 필요한 응용에서는 더 엄격한 EMI 여유를 위해 선택적 LC 필터를 추가하는데, 이때 차단 주파수는 오디오 대역보다 충분히 높고 억제 대상 잡음 대역보다는 낮게 설정하며, 인덕터와 커패시터는 반드시 짝으로 사용해야 한다 - 커패시터만 달고 인덕터를 생략하면(또는 반대로) 출력단 안정성이 무너진다(높은 dV/dt 스위칭 노드에 커패시터만 연결되면 과도한 충방전 전류 스파이크가 발생하기 때문). 전원측도 마찬가지로 중요하다: PVDD는 파워 브리지에 직접 전원을 공급하므로 낮은 ESL 디커플링 커패시터(소용량, 최근접 배치)와 대용량 벌크 커패시터(펄스 전류 공급용)를 함께 써야 하며 서로 대체할 수 없다.",
        "designNotes": [
          "필터리스 동작은 에지 레이트 제어 덕분이지 보호를 생략한 것이 아니다 - 선정 전에 필터리스 모드를 명시적으로 지원하는지와 적용 가능한 스피커 배선 길이 상한을 확인할 것",
          "LC 필터를 쓰기로 했다면 인덕터와 커패시터를 반드시 짝으로 설치(하나만 설치하면 출력 안정성이 무너짐)하고, 커패시터는 인덕터 뒤(스피커 쪽)에 배치",
          "PVDD 디커플링은 2단으로: 낮은 ESL 소용량 커패시터로 고주파 스위칭 과도 대응, 대용량 커패시터로 저주파 펄스 전류 공급 대응 - 둘 다 전원 핀 근처에 두고 서로 대체 불가",
          "그라운드 리턴과 파워 그라운드를 별도로 계획하고, 아날로그 소신호 그라운드가 파워 스위칭 그라운드와 배선 구간을 공유하지 않게 할 것",
          "근접(필터리스) 응용이라도 EMI 사전 스캔을 진행할 것 - 방사 결과는 PCB 레이아웃과 배선 길이에 따라 달라지므로 데이터시트 공칭값만 믿지 말 것"
        ],
        "commonMistakes": [
          "비용 절감을 위해 필터 커패시터만 달고 인덕터를 생략, 높은 dV/dt 노드가 커패시터를 직접 충방전시켜 출력단이 불안정하거나 과열",
          "필터리스 모드인 채로 스피커 배선을 길게 끌어 근접 조건이 깨지고 EMI 인증 탈락",
          "PVDD 디커플링 커패시터 하나로 전 대역을 커버하려다 고주파 잡음이나 저주파 펄스 전류 중 하나가 제대로 처리되지 않음",
          "아날로그 소신호 배선을 Class-D 스위칭 출력(OUT_P/OUT_N)에 너무 가깝게 나란히 배선해 전단 회로에 잡음 결합"
        ]
      }
    },
    "sourcePdf": "IC-spec/tas2320.pdf",
    "createdAt": "2026-07-10T00:00:00Z",
    "updatedAt": "2026-07-10T00:00:00Z"
  },
  {
    "id": "space-grade-power",
    "title": "太空級電源設計要點（TID/SEE／QMLV vs SEP／降額冗餘）",
    "category": "power-management",
    "products": [
      "通用"
    ],
    "description": "太空環境的輻射會慢慢累積損傷元件(TID)，也會單一高能粒子瞬間打亂或打壞電路(SEE)——太空級電源選型不是「規格好一點」，而是整套驗證流程與降額思維都不同。",
    "principles": "太空輻射對電子元件有兩類機制。TID(Total Ionizing Dose，總游離劑量)是元件長期暴露在游離輻射下累積的損傷，會讓半導體參數緩慢漂移(如洩漏電流上升、閾值電壓偏移)，用krad(Si)為單位，任務壽命越長、軌道輻射環境越惡劣，要求的TID等級越高。SEE(Single Event Effect，單一事件效應)是單顆高能重離子或質子瞬間打入元件造成的效應，又分破壞性(SEL閂鎖、SEB燒毀、SEGR閘極擊穿——這些會永久損壞元件)與非破壞性(SET單一事件瞬態、SEFI功能中斷——系統可恢復但當下輸出異常)，用LET(Linear Energy Transfer，線性能量轉移，單位MeV·cm²/mg)衡量元件對粒子能量沉積的耐受上限。元件等級上，QML(Qualified Manufacturer List)是美規最高信賴等級的品質認證體系，QMLV(Class V)用陶瓷封裝、最嚴格的篩選與批次認證流程，適合飛行任務；QMLP(Class P/Q)封裝改用塑封、流程精簡，成本與交期較佳但認證強度較低。介於商規與QMLV之間還有SEP(Space Enhanced Plastic，太空增強塑封)這種流程：用塑膠QFN等商規封裝但走控制基線生產(固定產線、可追溯性、每批次TID保證)，TID保證等級通常落在20~30krad(Si)區間，遠低於QMLV可達的100krad(Si)，但成本與交期大幅優於陶瓷QML。設計時的降額與冗餘思維：所有電壓/電流/功耗規格都要留足夠裕度(常見降額到額定值的50~80%，依元件類型與任務關鍵度而定)，關鍵電源路徑用備份或多數決(voting)架構，避免單點SEE故障拖垮整個任務。",
    "circuits": [],
    "keyFormulas": [
      "TID單位:krad(Si)——TPS7H4010-SEP保證20krad(Si)/每片wafer lot，特性化到30krad(Si)；TPS7H500x-SP系列QMLV-RHA保證100krad(Si)",
      "LET單位:MeV·cm²/mg——TPS7H4010-SEP的SEL/SEB/SEGR免疫、SET/SEFI特性化皆至LET=43；TPS7H500x-SP系列DSEE(破壞性單事件效應)免疫至LET=75",
      "QML品質等級:QMLV(陶瓷，最高信賴)> QMLP(塑封)> SEP(商規塑封+控制基線)> 一般商規",
      "降額原則:額定電壓/電流/功耗抓50~80%餘裕，依任務關鍵度調整"
    ],
    "designNotes": [
      "選型第一步先分清楚任務需求的TID總劑量(依軌道高度/任務年限估算)與需要免疫的LET範圍(依防護遮蔽與軌道粒子環境估算)，再對照元件規格，不要只看『太空級』三個字",
      "QMLV零件用JAN標準料號(5962Rxxxxxxx格式)，下單前核對料號後綴(封裝/等級代碼)與工程樣品版本(EM)不可混用於飛行硬體——工程樣品未過完整流程，不可作飛行件",
      "SEP是成本與可靠度的中間解，適合非關鍵酬載或TID/LET需求不高的次系統；真正關鍵路徑(如姿態控制、通訊主鏈)仍應評估QMLV",
      "破壞性SEE(SEL/SEB/SEGR)沒有『重試』選項——一旦發生就是永久損壞，設計上要用電流限制/熔絲/看門狗做主動保護而非只靠元件本身免疫等級",
      "地面測試涵蓋TID(鈷60或X射線源加速老化)與SEE(重離子加速器打靶)兩種獨立驗證，不能互相取代，採購時確認兩份測試報告都齊全"
    ],
    "commonMistakes": [
      "把『工業級』、『軍規AEC-Q』與『太空級QML/SEP』混為一談——溫度範圍寬不代表抗輻射，選型只看溫規會漏掉TID/SEE要求",
      "只看TID數字沒看LET範圍，結果元件耐得住累積劑量卻在單一粒子事件下閂鎖燒毀",
      "混用工程樣品(EM)與飛行等級(V/P)料號，工程樣品成本低但未經完整輻射鑑定流程，誤用在飛行硬體上",
      "降額只做電壓沒做電流/功耗/溫度，單一維度降額無法涵蓋輻射環境加上熱真空的複合應力"
    ],
    "examples": [
      {
        "title": "衛星酬載點負載電源",
        "application": "同步降壓TPS7H4010-SEP供應FPGA/ADC點負載，SEL/SEB/SEGR免疫至LET 43，TID 20~30krad(Si)",
        "circuit": "衛星匯流排電壓 → TPS7H4010-SEP同步降壓 → FPGA/ASIC點負載，關鍵訊號鏈另評估QMLV等級控制器"
      }
    ],
    "relatedTopics": [
      "regulator-ldo-vs-buck",
      "aec-q100",
      "auto-load-dump"
    ],
    "i18n": {
      "en": {
        "title": "Space-Grade Power Design Essentials (TID/SEE, QMLV vs SEP, Derating & Redundancy)",
        "description": "Space radiation both slowly damages components over time (TID) and can instantly upset or destroy a circuit with a single high-energy particle (SEE) - selecting space-grade power parts isn't just 'better spec,' it's a different qualification flow and a different derating mindset altogether.",
        "principles": "Space radiation affects electronics through two mechanisms. TID (Total Ionizing Dose) is cumulative damage from long-term exposure to ionizing radiation, slowly drifting semiconductor parameters (rising leakage current, shifted threshold voltage); measured in krad(Si), the longer the mission and the harsher the orbital radiation environment, the higher the TID rating required. SEE (Single Event Effect) is caused by a single high-energy heavy ion or proton striking a device instantaneously, split into destructive effects (SEL latch-up, SEB burnout, SEGR gate rupture - all permanently damage the part) and non-destructive effects (SET single-event transient, SEFI functional interrupt - the system recovers but the output is momentarily wrong); LET (Linear Energy Transfer, MeV·cm²/mg) measures the upper bound of energy deposition a part can withstand from a particle strike. On the qualification-grade side, QML (Qualified Manufacturer List) is the highest US quality-assurance framework for semiconductors: QMLV (Class V) uses ceramic packaging with the strictest screening and lot-qualification flow, suited to flight missions; QMLP (Class P/Q) switches to plastic packaging with a streamlined flow, better cost and lead time but lower qualification rigor. Between commercial grade and QMLV sits SEP (Space Enhanced Plastic): a plastic package (e.g. QFN) built on a controlled baseline (fixed fab line, traceability, per-lot TID guarantee), typically guaranteeing TID in the 20-30krad(Si) range - far below what QMLV can reach (up to 100krad(Si)) - but with much better cost and lead time than ceramic QML. Design-time derating and redundancy thinking: leave adequate margin on every voltage/current/power spec (commonly derating to 50-80% of rated value depending on part type and mission criticality), and use backup or voting architectures on critical power paths so a single-point SEE failure doesn't take down the whole mission.",
        "designNotes": [
          "First separate the mission's total TID requirement (estimated from orbit altitude/mission duration) from the LET range that must be immune (estimated from shielding and the orbital particle environment), then match against the part spec - don't select on the words 'space grade' alone",
          "QMLV parts use JAN-standard part numbers (5962Rxxxxxxx format) - verify the suffix (package/grade code) before ordering, and never mix engineering-sample (EM) revisions into flight hardware; engineering samples have not been through the full qualification flow",
          "SEP is a cost/reliability middle ground, suited to non-critical payloads or subsystems with modest TID/LET requirements; truly critical paths (attitude control, primary comms) should still be evaluated against QMLV",
          "Destructive SEE (SEL/SEB/SEGR) has no 'retry' option - once it happens the damage is permanent, so design in active protection (current limiting, fuses, watchdogs) rather than relying solely on the part's inherent immunity rating",
          "Ground testing covers TID (accelerated aging via Co-60 or X-ray source) and SEE (heavy-ion accelerator irradiation) as two independent verifications that cannot substitute for each other - confirm both test reports are on file before procurement"
        ],
        "commonMistakes": [
          "Conflating 'industrial grade,' 'AEC-Q automotive grade,' and 'space-grade QML/SEP' - a wide temperature range does not imply radiation tolerance; selecting on temp spec alone misses TID/SEE requirements entirely",
          "Checking only the TID number without the LET range, ending up with a part that survives the cumulative dose but latches up and burns out on a single particle event",
          "Mixing engineering-sample (EM) and flight-grade (V/P) part numbers - EM parts are cheaper but have not been through full radiation qualification and get mistakenly used on flight hardware",
          "Derating only voltage while skipping current/power/temperature - single-axis derating cannot cover the combined stress of radiation plus thermal vacuum"
        ]
      },
      "ja": {
        "title": "宇宙用電源設計の要点（TID/SEE、QMLV vs SEP、ディレーティングと冗長性）",
        "description": "宇宙放射線は部品を徐々に損傷させる（TID）だけでなく、単一の高エネルギー粒子が瞬時に回路を誤動作・破壊する（SEE）こともある——宇宙用電源部品の選定は『スペックが良い』だけでなく、認証フローとディレーティングの考え方自体が異なる。",
        "principles": "宇宙放射線が電子部品に与える影響には2つのメカニズムがある。TID（総電離線量）は長期間の電離放射線暴露による累積損傷で、半導体パラメータが緩やかにドリフトする（漏れ電流増加、しきい値電圧シフトなど）。単位は krad(Si) で、ミッション期間が長く軌道放射線環境が厳しいほど要求される TID 等級は高くなる。SEE（単一事象効果）は単一の高エネルギー重イオンや陽子が瞬時に部品へ入射することで生じ、破壊的効果（SEL ラッチアップ、SEB 焼損、SEGR ゲート破壊——いずれも永久損傷）と非破壊的効果（SET 単一事象過渡、SEFI 機能中断——システムは復旧可能だが一時的に出力異常）に分かれる。LET（線エネルギー付与、単位 MeV・cm²/mg）は部品が粒子のエネルギー付与に耐えられる上限を示す。品質等級としては、QML（認定製造者リスト）が米国規格における半導体の最高信頼性認証体系で、QMLV（クラス V）はセラミックパッケージ、最も厳格な選別とロット認証フローを採用しフライトミッション向け。QMLP（クラス P/Q）はプラスチックパッケージに切り替え、フローを簡略化してコストと納期を改善する代わりに認証の厳格さは下がる。商用グレードと QMLV の中間には SEP（宇宙強化プラスチック）があり、プラスチック QFN 等の商用パッケージをコントロールドベースライン生産（固定ラインとトレーサビリティ、ロットごとの TID 保証）で製造する方式で、TID 保証等級は通常 20〜30krad(Si) 程度と QMLV の最大 100krad(Si) には及ばないが、セラミック QML よりコストと納期で大きく優れる。設計時のディレーティングと冗長性の考え方：あらゆる電圧・電流・消費電力仕様に十分な余裕を残す（部品種別とミッション重要度に応じて定格の 50〜80% 程度までディレーティングするのが一般的）とともに、重要な電源経路にはバックアップまたは多数決（ボーティング）構成を用い、単一の SEE 故障がミッション全体を落とさないようにする。",
        "designNotes": [
          "選定の第一歩はミッションが要求する総 TID（軌道高度・ミッション期間から推定）と免疫すべき LET 範囲（遮蔽と軌道粒子環境から推定）を切り分けること——『宇宙用』という言葉だけで選ばない",
          "QMLV 部品は JAN 標準型番（5962Rxxxxxxx 形式）を使用——発注前にサフィックス（パッケージ／等級コード）を確認し、エンジニアリングサンプル（EM）版をフライトハードウェアに混用しないこと。EM は完全な認証フローを経ていない",
          "SEP はコストと信頼性の中間解であり、非重要ペイロードや TID/LET 要求が高くないサブシステムに適する。真に重要な経路（姿勢制御、主通信）は QMLV での評価も検討すべき",
          "破壊的 SEE（SEL/SEB/SEGR）には『リトライ』の選択肢がない——発生すれば永久損傷なので、部品固有の免疫等級だけに頼らず電流制限・ヒューズ・ウォッチドッグなど能動的保護を設計に組み込む",
          "地上試験は TID（コバルト60 または X 線源による加速劣化）と SEE（重イオン加速器による照射）という独立した2種類の検証をカバーし、互いに代替できない——調達時は両方の試験レポートが揃っているか確認"
        ],
        "commonMistakes": [
          "『産業用』『車載 AEC-Q』『宇宙用 QML/SEP』を混同——広い温度範囲は耐放射線性を意味せず、温度規格だけで選定すると TID/SEE 要件を見落とす",
          "TID 数値のみ確認し LET 範囲を見ない結果、累積線量には耐えるが単一粒子事象でラッチアップ焼損する部品を選んでしまう",
          "エンジニアリングサンプル（EM）とフライトグレード（V/P）の型番を混用——EM は安価だが完全な耐放射線認証を経ておらず、誤ってフライトハードウェアに使用される",
          "電圧のみディレーティングし電流・消費電力・温度を行わない——単一軸のディレーティングでは放射線と熱真空の複合ストレスをカバーできない"
        ]
      },
      "ko": {
        "title": "우주급 전원 설계 핵심(TID/SEE, QMLV vs SEP, 디레이팅과 이중화)",
        "description": "우주 방사선은 부품을 서서히 손상시키기도 하고(TID) 단일 고에너지 입자가 순간적으로 회로를 오동작시키거나 파괴하기도 한다(SEE) - 우주급 전원 부품 선정은 '스펙이 좋은 정도'가 아니라 검증 절차와 디레이팅 사고방식 자체가 다르다.",
        "principles": "우주 방사선이 전자 부품에 미치는 영향은 두 가지 메커니즘으로 나뉜다. TID(총 이온화 선량)는 장기간 이온화 방사선 노출로 인한 누적 손상으로, 반도체 파라미터가 서서히 드리프트한다(누설 전류 증가, 문턱 전압 이동 등). 단위는 krad(Si)이며, 임무 기간이 길고 궤도 방사선 환경이 가혹할수록 요구되는 TID 등급이 높아진다. SEE(단일 사건 효과)는 단일 고에너지 중이온이나 양성자가 순간적으로 부품에 입사해 발생하며, 파괴적 효과(SEL 래치업, SEB 소손, SEGR 게이트 파괴 - 모두 영구 손상)와 비파괴적 효과(SET 단일 사건 과도, SEFI 기능 중단 - 시스템은 복구되지만 일시적으로 출력 이상)로 나뉜다. LET(선형 에너지 전달, 단위 MeV·cm²/mg)는 부품이 입자의 에너지 침착을 견딜 수 있는 상한을 나타낸다. 품질 등급 면에서 QML(인증 제조사 목록)은 미국 규격 반도체 최고 신뢰성 인증 체계로, QMLV(클래스 V)는 세라믹 패키지에 가장 엄격한 선별과 로트 인증 절차를 적용해 비행 임무에 적합하고, QMLP(클래스 P/Q)는 플라스틱 패키지로 바꿔 절차를 간소화해 비용과 납기는 좋지만 인증 엄격도는 낮다. 상용 등급과 QMLV 사이에는 SEP(우주 강화 플라스틱)가 있는데, 플라스틱 QFN 등 상용 패키지를 통제된 기준선 생산(고정 생산 라인, 추적성, 로트별 TID 보증)으로 만드는 방식으로, TID 보증 등급은 보통 20~30krad(Si) 수준으로 QMLV가 도달 가능한 최대 100krad(Si)에는 못 미치지만 세라믹 QML보다 비용과 납기에서 크게 유리하다. 설계 시 디레이팅과 이중화 사고방식: 모든 전압/전류/전력 스펙에 충분한 여유를 두고(부품 종류와 임무 중요도에 따라 정격의 50~80%까지 디레이팅하는 것이 일반적), 핵심 전원 경로는 백업이나 다수결(보팅) 구조를 써서 단일 SEE 고장이 임무 전체를 무너뜨리지 않게 한다.",
        "designNotes": [
          "선정의 첫 단계는 임무가 요구하는 총 TID(궤도 고도·임무 기간으로 추정)와 면역해야 할 LET 범위(차폐와 궤도 입자 환경으로 추정)를 구분하는 것 - '우주급'이라는 단어만 보고 고르지 말 것",
          "QMLV 부품은 JAN 표준 부품번호(5962Rxxxxxxx 형식)를 사용 - 주문 전 접미사(패키지/등급 코드)를 확인하고, 엔지니어링 샘플(EM) 버전을 비행 하드웨어에 섞어 쓰지 말 것. EM은 완전한 인증 절차를 거치지 않음",
          "SEP는 비용과 신뢰성의 중간 해법으로 비핵심 페이로드나 TID/LET 요구가 높지 않은 서브시스템에 적합하며, 진짜 핵심 경로(자세 제어, 주 통신)는 QMLV로도 평가해야 함",
          "파괴적 SEE(SEL/SEB/SEGR)는 '재시도' 옵션이 없다 - 발생하면 영구 손상이므로 부품 고유 면역 등급에만 의존하지 말고 전류 제한, 퓨즈, 워치독 등 능동 보호를 설계에 넣을 것",
          "지상 시험은 TID(코발트-60 또는 X선원 가속 노화)와 SEE(중이온 가속기 조사)라는 독립된 두 가지 검증을 다루며 서로 대체할 수 없다 - 조달 시 두 시험 보고서가 모두 갖춰졌는지 확인"
        ],
        "commonMistakes": [
          "'산업용', '차량용 AEC-Q', '우주급 QML/SEP'를 혼동 - 넓은 온도 범위가 내방사선성을 의미하지 않으며, 온도 규격만 보고 선정하면 TID/SEE 요구를 놓침",
          "TID 수치만 보고 LET 범위를 보지 않아, 누적 선량은 견디지만 단일 입자 사건에서 래치업으로 소손되는 부품을 선택",
          "엔지니어링 샘플(EM)과 비행 등급(V/P) 부품번호를 혼용 - EM은 저렴하지만 완전한 방사선 인증 절차를 거치지 않았는데 실수로 비행 하드웨어에 사용",
          "전압만 디레이팅하고 전류/전력/온도는 하지 않음 - 단일 축 디레이팅으로는 방사선과 열진공의 복합 스트레스를 커버할 수 없음"
        ]
      }
    },
    "sourcePdf": "IC-spec/tps7h4010-sep.pdf, IC-spec/tps7h5001-sp.pdf",
    "createdAt": "2026-07-10T00:00:00Z",
    "updatedAt": "2026-07-10T00:00:00Z"
  },
  {
    "id": "current-sense-kelvin",
    "title": "電流感測與Kelvin接法（低邊/高邊/DCR比較）",
    "category": "measurement",
    "products": [
      "AI 伺服器",
      "通用"
    ],
    "description": "量電流的方法有好幾種，精度、成本、功耗互相拉扯；不管哪一種，只要牽涉到毫歐姆級的訊號，佈線方式(Kelvin)沒做對，量到的都是雜訊不是電流。",
    "principles": "電流感測常見三種做法。低邊感測(low-side)：在功率地回路串一顆精密分流電阻或利用MOSFET導通電阻，運放抓兩端壓差；優點是共模電壓低(接近地)，放大器容易做，缺點是感測電阻抬升了地電位，可能干擾其他以地為參考的電路。高邊感測(high-side)：分流電阻放在電源正端，需要能承受輸入電壓等級的高共模輸入放大器，好處是能偵測到對地短路故障(低邊感測偵測不到)，但放大器成本較高。DCR感測：不加額外分流電阻，直接用電感本身的直流電阻(DCR)當感測元件，搭配RC網路取樣——零額外損耗、零額外成本，但DCR隨溫度飄移大(銅電阻溫度係數)，需要溫度補償才能拿到準確讀值，精度天生比精密分流電阻差。實務上許多同步降壓IC選用第四種做法：直接量測功率MOSFET導通時的Vds、換算成電流(cycle-by-cycle valley current sensing)——不需外部感測元件，適合做逐週期電流限制保護，但精度通常只夠拿來做保護與粗略監控，不適合當計量級電流讀值。無論哪種方式，只要感測訊號是毫伏等級，佈線就要用Kelvin(四線)接法——感測點的電壓量測線要直接從電流承載路徑的量測點單獨拉出，不與大電流路徑共用同一段走線，否則走線本身的電阻/電感壓降會疊加進量測值，誤差可能遠大於感測電阻本身的容差。",
    "circuits": [],
    "keyFormulas": [
      "低邊/高邊/DCR/RDS(on) valley sensing——四種方式精度與成本互有取捨，無單一最優解",
      "TPS544B28逐週期電流限制:監看低邊MOSFET導通期間的Vds，超過門檻即延長低邊導通、降低平均輸出電流(valley current detect)",
      "TPS544B28負向電流限制:典型-10A門檻，偵測到即關低邊、開高邊(依VIN/VOUT/fSW決定on-time)保護低邊MOSFET",
      "Kelvin感測線本地旁路電容建議≥0.1µF，GOS相對AGND建議工作範圍±100mV"
    ],
    "designNotes": [
      "感測電阻或DCR取樣點的兩條量測線要各自獨立拉線到運放/ADC輸入，不可與大電流走線共用任何一段銅箔或過孔",
      "量測線要遠離電感、開關節點等雜訊源，必要時上下加地平面屏蔽，避免耦合雜訊疊加進毫伏訊號",
      "選用RDS(on)/valley current sensing的IC做電流限制保護沒問題，但需要計量級精度(如電池計量、伺服器功耗監控)時應另加專用精密分流電阻+電流檢測放大器",
      "DCR感測務必做溫度補償(常見用NTC或感測電感附近溫度的補償網路)，否則常溫校準的讀值到高溫環境會系統性偏移",
      "高邊感測選用運放時要確認共模輸入範圍涵蓋最高輸入電壓，並注意其對電源突波/反接的耐受"
    ],
    "commonMistakes": [
      "感測電阻兩端量測線與功率走線共用一段PCB銅箔，量到的電壓包含走線壓降，誤差遠超電阻本身容差",
      "DCR感測沒做溫度補償，環境溫度變化大時電流讀值系統性偏移，保護門檻或計量數字失準",
      "把逐週期valley current sensing的粗略保護精度當成計量級電流讀值使用，拿去做精確功耗計算",
      "高邊感測用的運放共模輸入範圍不夠，滿載或突波時運放飽和，電流讀值失真甚至損壞"
    ],
    "examples": [
      {
        "title": "伺服器電源模組電流限制與遙測",
        "application": "TPS544B28用低邊RDS(on) valley sensing做逐週期電流限制，搭配Kelvin接法的差動遠端電壓感測維持輸出精度",
        "circuit": "功率MOSFET Vds取樣 → 電流限制比較器；VOS/GOS差動線Kelvin接到負載端"
      }
    ],
    "relatedTopics": [
      "wqfn-hotrod-layout",
      "vrm-multiphase",
      "pmbus-telemetry"
    ],
    "i18n": {
      "en": {
        "title": "Current Sensing and Kelvin Connections (Low-Side / High-Side / DCR Compared)",
        "description": "There are several ways to measure current, and accuracy, cost, and power dissipation pull against each other. Whichever method is used, once the signal is down at the milliohm level, if the routing (Kelvin) isn't done right, what you measure is noise, not current.",
        "principles": "Three common current-sensing approaches. Low-side: a precision shunt resistor (or a MOSFET's RDS(on)) sits in the power ground return, with an op amp reading the voltage across it - the common-mode voltage stays low (near ground), making the amplifier easy to design, but the sense resistor lifts the local ground potential, which can disturb other ground-referenced circuits. High-side: the shunt sits on the supply's positive rail, requiring an amplifier with a common-mode input range that covers the full input voltage; the upside is it can detect a short-to-ground fault that low-side sensing misses, but the amplifier costs more. DCR sensing: skip the extra shunt resistor entirely and use the inductor's own DC resistance (DCR) as the sense element, sampled through an RC network - zero extra loss and zero extra component cost, but DCR drifts significantly with temperature (copper's temperature coefficient), needing temperature compensation to get an accurate reading, so it is inherently less precise than a precision shunt. In practice many synchronous buck ICs use a fourth approach: measuring the power MOSFET's Vds directly during its on-time and converting that to current (cycle-by-cycle valley current sensing) - no external sense element needed, well suited to per-cycle current-limit protection, but typically only accurate enough for protection and coarse monitoring, not metering-grade current readings. Whichever method is used, once the sense signal is at the millivolt level, the routing must use Kelvin (four-wire) connections - the voltage-sense lines must be pulled independently straight from the measurement points on the current-carrying path, never sharing a trace segment with the high-current path, or the trace's own resistive/inductive drop adds directly into the reading, and the error can dwarf the sense resistor's own tolerance.",
        "designNotes": [
          "Both sense-voltage lines from a shunt resistor or DCR tap point must route independently to the amplifier/ADC input, never sharing any trace segment or via with the high-current path",
          "Route sense lines away from noise sources like the inductor and switch node; add ground-plane shielding above and below if needed to avoid coupling noise into a millivolt-level signal",
          "An IC using RDS(on)/valley current sensing is fine for current-limit protection, but where metering-grade accuracy is needed (battery gauging, server power monitoring) add a dedicated precision shunt plus current-sense amplifier",
          "DCR sensing must include temperature compensation (commonly an NTC or a network compensating for temperature near the inductor), or a reading calibrated at room temperature drifts systematically at high temperature",
          "When choosing the op amp for high-side sensing, confirm its common-mode input range covers the maximum input voltage, and check its tolerance to supply surges/reverse connection"
        ],
        "commonMistakes": [
          "Sharing a segment of PCB copper between the shunt resistor's sense lines and the power trace, so the measured voltage includes trace drop and the error far exceeds the resistor's own tolerance",
          "Skipping temperature compensation on DCR sensing, letting the current reading drift systematically as ambient temperature swings, throwing off protection thresholds or metering numbers",
          "Treating the coarse accuracy of cycle-by-cycle valley current sensing as metering-grade and using it for precise power calculations",
          "Choosing a high-side sense amplifier whose common-mode input range is insufficient, so it saturates under full load or a surge, distorting or damaging the current reading path"
        ]
      },
      "ja": {
        "title": "電流検出と Kelvin 接続（ローサイド／ハイサイド／DCR の比較）",
        "description": "電流を測る方法は複数あり、精度・コスト・消費電力が互いにトレードオフの関係にある。どの方式でも、信号がミリオーム級になった時点で配線方式（Kelvin）を誤ると、測っているのは電流ではなくノイズになる。",
        "principles": "代表的な電流検出方式は3つ。ローサイド検出：パワーグランドリターンに精密シャント抵抗（または MOSFET の RDS(on)）を挿入し、オペアンプで両端電圧差を読む——同相電圧が低く（グランド付近）増幅回路が設計しやすい利点があるが、センス抵抗がローカルグランド電位を持ち上げ、他のグランド基準回路に干渉しうる。ハイサイド検出：シャントを電源正極側に配置し、入力電圧全域をカバーする同相入力範囲を持つアンプが必要——ローサイド検出では検知できない対地短絡故障を検知できる利点があるが、アンプのコストが高い。DCR 検出：追加のシャント抵抗を使わずインダクタ自身の直流抵抗（DCR）をセンス素子として利用し RC ネットワークでサンプリングする——追加損失も追加コストもゼロだが、DCR は温度により大きくドリフトする（銅の温度係数）ため正確な読み値には温度補償が必須で、精度は本質的に精密シャントより劣る。実務では多くの同期整流降圧 IC が第4の方式を採用する：パワー MOSFET の導通期間の Vds を直接測定して電流に換算する（サイクルバイサイクルのバレー電流検出）——外部センス素子不要でサイクルごとの電流制限保護に適するが、精度は通常保護と大まかな監視に足りる程度で、計量グレードの電流読み値には向かない。どの方式でも、センス信号がミリボルトレベルになった時点で配線は Kelvin（四線）接続を用いる必要がある——電圧センス線は電流経路の測定点から独立して引き出し、大電流経路と配線区間を共有してはならない。共有すると配線自体の抵抗・インダクタンスによる電圧降下が読み値に直接加算され、誤差がセンス抵抗自体の公差をはるかに超えうる。",
        "designNotes": [
          "シャント抵抗や DCR タップ点からの2本のセンス電圧線はそれぞれ独立してアンプ／ADC 入力へ配線し、大電流経路と配線やビアを共有しない",
          "センス線はインダクタやスイッチノードなどのノイズ源から離し、必要に応じて上下にグランドプレーンを設けてミリボルト信号へのノイズ結合を防ぐ",
          "RDS(on)／バレー電流検出を用いる IC は電流制限保護には十分だが、計量グレードの精度が必要な場合（バッテリー計量、サーバー電力監視など）は専用の精密シャントと電流検出アンプを追加する",
          "DCR 検出には必ず温度補償を組み込む（NTC やインダクタ近傍温度を補償するネットワークが一般的）——室温校正のみでは高温環境で読み値が系統的にずれる",
          "ハイサイド検出用オペアンプ選定時は同相入力範囲が最大入力電圧をカバーすることを確認し、電源サージや逆接続への耐性も確認する"
        ],
        "commonMistakes": [
          "シャント抵抗のセンス線とパワートレースが PCB 銅箔の一区間を共有し、測定電圧に配線降下が含まれ誤差が抵抗自体の公差を大きく超える",
          "DCR 検出で温度補償を省略し、周囲温度変化で電流読み値が系統的にずれ、保護しきい値や計量値が不正確になる",
          "サイクルバイサイクルのバレー電流検出の粗い精度を計量グレードとみなし、精密な電力計算に使用してしまう",
          "ハイサイド検出用アンプの同相入力範囲が不足し、フル負荷やサージ時に飽和して電流読み値が歪む、あるいは破損する"
        ]
      },
      "ko": {
        "title": "전류 감지와 켈빈 접속(로우사이드/하이사이드/DCR 비교)",
        "description": "전류를 재는 방법은 여러 가지이고 정확도, 비용, 소비전력이 서로 상충한다. 어떤 방식이든 신호가 밀리옴 급으로 내려가면 배선 방식(켈빈)을 제대로 하지 않으면 측정되는 건 전류가 아니라 잡음이다.",
        "principles": "대표적인 전류 감지 방식은 세 가지다. 로우사이드 감지: 파워 그라운드 리턴에 정밀 션트 저항(또는 MOSFET의 RDS(on))을 넣고 연산증폭기로 양단 전압차를 읽는다 - 공통모드 전압이 낮아(그라운드 근처) 증폭 회로 설계가 쉽지만, 센스 저항이 로컬 그라운드 전위를 들어올려 다른 그라운드 기준 회로를 방해할 수 있다. 하이사이드 감지: 션트를 전원 양극 쪽에 두며 입력 전압 전체를 커버하는 공통모드 입력 범위를 가진 증폭기가 필요하다 - 로우사이드 감지가 놓치는 대지 단락 고장을 감지할 수 있지만 증폭기 비용이 더 든다. DCR 감지: 별도 션트 저항 없이 인덕터 자체의 직류 저항(DCR)을 감지 소자로 써서 RC 네트워크로 샘플링한다 - 추가 손실도 추가 비용도 없지만, DCR은 온도에 따라 크게 변하므로(구리의 온도 계수) 정확한 값을 얻으려면 온도 보상이 필수이며 정밀 션트보다 본질적으로 정확도가 떨어진다. 실무에서는 많은 동기 정류 벅 IC가 네 번째 방식을 쓴다: 파워 MOSFET의 도통 구간 Vds를 직접 측정해 전류로 환산(사이클별 밸리 전류 감지)하는 방식으로, 외부 감지 소자가 필요 없고 사이클별 전류 제한 보호에 적합하지만 보통 보호와 대략적인 모니터링에 충분한 정도이지 계량급 전류값에는 적합하지 않다. 어떤 방식이든 감지 신호가 밀리볼트 수준이 되면 배선은 켈빈(4선) 접속을 써야 한다 - 전압 감지선은 전류 경로의 측정점에서 독립적으로 끌어내야 하며 대전류 경로와 배선 구간을 공유하면 안 된다. 공유하면 배선 자체의 저항·인덕턴스 강하가 측정값에 그대로 더해져 오차가 센스 저항 자체의 공차를 크게 넘어설 수 있다.",
        "designNotes": [
          "션트 저항이나 DCR 탭 지점에서 나오는 두 감지 전압선은 각각 독립적으로 증폭기/ADC 입력까지 배선하고, 대전류 경로와 배선이나 비아를 절대 공유하지 말 것",
          "감지선은 인덕터, 스위치 노드 등 잡음원에서 멀리 배선하고, 필요하면 위아래에 그라운드 플레인을 두어 밀리볼트 신호로의 잡음 결합을 막을 것",
          "RDS(on)/밸리 전류 감지를 쓰는 IC는 전류 제한 보호에는 충분하지만, 계량급 정확도가 필요하면(배터리 게이징, 서버 전력 모니터링 등) 전용 정밀 션트와 전류 감지 증폭기를 추가할 것",
          "DCR 감지는 반드시 온도 보상을 포함해야 함(NTC나 인덕터 근처 온도를 보상하는 네트워크가 일반적) - 상온에서만 교정하면 고온 환경에서 값이 체계적으로 어긋남",
          "하이사이드 감지용 연산증폭기 선정 시 공통모드 입력 범위가 최대 입력 전압을 커버하는지, 전원 서지·역접속에 대한 내성도 확인할 것"
        ],
        "commonMistakes": [
          "션트 저항의 감지선과 파워 배선이 PCB 동박 구간을 공유해, 측정 전압에 배선 강하가 포함되어 오차가 저항 자체 공차를 크게 초과",
          "DCR 감지에서 온도 보상을 생략해 주변 온도 변화에 따라 전류값이 체계적으로 어긋나 보호 문턱값이나 계량값이 부정확해짐",
          "사이클별 밸리 전류 감지의 대략적 정확도를 계량급으로 여기고 정밀 전력 계산에 사용",
          "하이사이드 감지용 증폭기의 공통모드 입력 범위가 부족해 풀로드나 서지 시 포화되어 전류 읽기값이 왜곡되거나 손상됨"
        ]
      }
    },
    "sourcePdf": "IC-spec/tps544b28.pdf",
    "createdAt": "2026-07-10T00:00:00Z",
    "updatedAt": "2026-07-10T00:00:00Z"
  },
  {
    "id": "qfn-ep-thermal",
    "title": "QFN散熱EP佈局（Exposed Pad Via陣列與鋼網設計）",
    "category": "pcb-design",
    "products": [
      "手機",
      "通用"
    ],
    "description": "QFN/DFN封裝的散熱裸露墊(EP)是晶片散熱的主要出口——但EP做得再大，底下沒有正確的via陣列與鋼網設計，熱阻照樣居高不下，錫膏空洞還可能拖累電性接觸。",
    "principles": "無引腳QFN/DFN封裝的中央裸露金屬墊(Exposed Pad, EP)直接連到晶粒背面(die attach)，是熱量從晶片流向PCB的主要低阻通道，同時常兼作接地/散熱共用端。EP佈局的核心工作是把熱阻從「晶片接面到板子(RθJB)」與「接面到殼(RθJC)」有效轉換成「板子把熱散出去」的能力——這需要EP下方鑽一整片via陣列，把EP的熱量透過過孔傳到內層或底層的散熱銅面/銅箔。Via本身要考慮塞孔選項：直接開孔讓錫膏流入(便宜但可能造成錫膏被吸走、頂面錫量不足)；填銅塞孔或環氧樹脂塞孔後電鍍封蓋(via-in-pad，成本高但錫膏不會流失、熱傳導更完整)，中大電流/高功率元件通常值得多花這道工序。錫膏鋼網(stencil)開口設計上，EP若整片開一個大窗口，回焊時容易因為錫膏量過大而產生大空洞(排氣不出去)；業界慣例是把EP鋼網開口切成多個小格(常見50~70%的開口覆蓋率，依元件與via分布切分成陣列格子)，讓錫膏均勻分布、空氣容易排出，兼顧散熱與可靠度。整體θJA(接面到環境熱阻)不是晶片單一參數，同一顆晶片在JEDEC標準測試板與實際應用多層板佈局下θJA可以差到3倍以上——EP via密度、板層數、銅面積都是決定因素。",
    "circuits": [],
    "keyFormulas": [
      "TAS2320(HR-QFN 26pin)JEDEC標準板:RθJA=51.5°C/W、RθJC(top)=28.5°C/W、RθJB=15.3°C/W",
      "θJA隨PCB散熱設計大幅變動(via密度、銅面積、板層數)——同封裝在不同板子上實測值可差數倍，選型不能只信單一θJA數字",
      "鋼網EP開口覆蓋率常見抓50~70%，切分成陣列小格而非單一大窗口",
      "EP下方via陣列常見做法:滿版陣列鑽孔，搭配填孔/塞孔電鍍封蓋降低錫膏流失風險"
    ],
    "designNotes": [
      "EP下方via陣列孔徑、孔數、孔距要在PCB設計初期就跟散熱模擬(或至少熱阻估算)一起定案，不要留到佈線後期才補",
      "高功率/高電流元件優先考慮填孔塞孔(via-in-pad plugged & plated)避免錫膏經via流失導致接觸不良或熱傳導路徑中斷",
      "鋼網開口切格子時要對齊via分布，避免錫膏印到via正上方造成錫膏被吸入via、頂面反而缺錫",
      "EP若同時作為電氣接地/訊號共用端，要確認via陣列不會因散熱設計把接地阻抗或迴流路徑意外破壞",
      "多層板時EP的熱通常還要匯到內層或底層大面積銅箔並搭配外部散熱(如金屬殼、散熱片)才能發揮設計θJA，單靠via陣列可能不夠"
    ],
    "commonMistakes": [
      "EP鋼網開一個大窗口圖方便，回焊後空洞率過高，實測熱阻遠高於資料表數字",
      "EP下方via不做塞孔，回焊時錫膏被via吸走，造成晶片與PCB間錫量不足，虛焊或熱阻異常",
      "只看資料表θJA數字就估算系統散熱，沒有對照自己板子的層數與銅面積，結果實際運作溫度遠超預期",
      "via陣列孔距太密導致鑽孔可靠度下降，或孔距太疏使熱阻改善有限，兩者都要跟PCB廠製程能力核對"
    ],
    "examples": [
      {
        "title": "手機Class-D功放EP散熱",
        "application": "HR-QFN 26pin封裝EP下方滿版via陣列搭配填孔電鍍，鋼網切分50~70%覆蓋率格子降低空洞",
        "circuit": "IC EP → via陣列 → 內層/底層散熱銅面 → 機構散熱路徑"
      }
    ],
    "relatedTopics": [
      "classd-output-filter",
      "wqfn-hotrod-layout",
      "thermal-design"
    ],
    "i18n": {
      "en": {
        "title": "QFN Thermal EP Layout (Exposed-Pad Via Array & Stencil Design)",
        "description": "The exposed thermal pad (EP) on a QFN/DFN package is the chip's main heat exit - but no matter how big the EP is, without a correctly designed via array and stencil underneath it, thermal resistance stays high and solder voiding can even hurt the electrical contact.",
        "principles": "The central exposed metal pad (EP) on a leadless QFN/DFN package connects directly to the die attach on the back of the die, forming the primary low-impedance path for heat to flow from chip to PCB, and often doubles as a shared ground/thermal terminal. The core job of EP layout is converting the resistance from 'junction to board (RθJB)' and 'junction to case (RθJC)' into the board's actual ability to carry that heat away - which requires drilling a full via array under the EP to conduct heat through the vias to inner-layer or bottom-layer thermal copper. The vias themselves need a plugging decision: leaving them open lets solder paste flow in during reflow (cheap, but paste can get wicked away, leaving too little on top); filling with copper or epoxy and plating over the cap (via-in-pad) costs more but prevents paste loss and gives a more complete thermal path - usually worth the extra process step for medium/high-power or high-current parts. On the solder paste stencil, opening one large window over the entire EP tends to trap too much paste during reflow and create large voids that can't outgas; industry practice is to cut the EP stencil opening into a grid of smaller apertures (commonly 50-70% coverage, gridded to match the via layout), spreading the paste evenly and letting air escape, balancing thermal performance against reliability. Overall θJA (junction-to-ambient thermal resistance) is not a fixed chip-only number - the same chip can show more than 3x difference in θJA between a JEDEC standard test board and a real multilayer application board; EP via density, board layer count, and copper area all drive the result.",
        "designNotes": [
          "The via array diameter, count, and pitch under the EP must be settled together with thermal simulation (or at least a thermal-resistance estimate) early in PCB design, not patched in after routing is done",
          "For high-power/high-current parts, prefer plugged-and-plated via-in-pad to avoid solder paste wicking through the vias and causing poor contact or a broken thermal path",
          "When gridding the stencil opening, align it with the via layout - printing paste directly over a via lets the paste get sucked in, leaving too little on top",
          "If the EP also serves as an electrical ground/shared-signal terminal, confirm the via array's thermal design doesn't accidentally break the ground impedance or return-current path",
          "On multilayer boards, EP heat usually still needs to be gathered onto a large inner-layer or bottom-layer copper area and paired with external cooling (metal case, heatsink) to actually achieve the design θJA - the via array alone may not be enough"
        ],
        "commonMistakes": [
          "Cutting one large stencil window over the EP for convenience, producing high void rates after reflow with measured thermal resistance far above the datasheet number",
          "Leaving the vias under the EP unplugged so solder paste wicks through them during reflow, leaving insufficient solder between chip and PCB, causing weak solder joints or abnormal thermal resistance",
          "Estimating system cooling from the datasheet θJA alone without checking it against your own board's layer count and copper area, so actual operating temperature far exceeds expectations",
          "Setting via pitch too tight, hurting drilling reliability, or too loose, giving limited thermal improvement - both need checking against the PCB vendor's process capability"
        ]
      },
      "ja": {
        "title": "QFN 放熱 EP レイアウト（露出パッド Via アレイとステンシル設計）",
        "description": "QFN/DFN パッケージの放熱露出パッド（EP）はチップの主要な放熱出口だが、EP をどれだけ大きくしても下部の Via アレイとステンシル設計が正しくなければ熱抵抗は下がらず、はんだボイドが電気的接触まで悪化させることもある。",
        "principles": "リードレス QFN/DFN パッケージ中央の露出金属パッド（EP）はダイ裏面のダイアタッチに直結し、チップから PCB への熱の主要な低インピーダンス経路であり、しばしばグランド／放熱兼用端子も兼ねる。EP レイアウトの核心作業は『接合部から基板まで（RθJB）』『接合部からケースまで（RθJC）』の熱抵抗を、実際に『基板が熱を逃がす能力』に変換すること——これには EP 直下に Via アレイを開け、内層または底層の放熱銅箔へ熱を伝える必要がある。Via 自体は塞孔方式の選択が必要：開放のままだとリフロー時にはんだペーストが Via に流れ込む（安価だがペーストが吸われ上面のはんだ量不足を招きうる）、銅または樹脂で塞孔しめっきで蓋をする方式（via-in-pad）はコストが高いがペースト流出を防ぎ熱伝導経路もより完全になる——中～大電力・高電流部品では追加コストをかける価値が多い。はんだペーストステンシルの開口設計では、EP 全面を一つの大窓で開けるとリフロー時にペースト量過多で大きなボイド（排気できない）を生じやすい。業界慣行は EP ステンシル開口を複数の小さな格子に分割すること（一般に50〜70%の開口率、Via 配置に合わせてグリッド分割）で、ペーストを均一に分布させ空気を排出しやすくし、放熱性と信頼性を両立させる。全体の θJA（接合部-周囲熱抵抗）はチップ単体の固定値ではない——同一チップでも JEDEC 標準テスト基板と実際の多層アプリケーション基板とで θJA が3倍以上異なることがある。EP の Via 密度、基板層数、銅面積がすべて結果を左右する。",
        "designNotes": [
          "EP 下部の Via アレイの孔径・数・ピッチは熱シミュレーション（少なくとも熱抵抗見積もり）と併せて PCB 設計初期に確定すべきで、配線後に後付けしない",
          "高電力・高電流部品では塞孔めっき封止（via-in-pad plugged & plated）を優先し、はんだペーストが Via 経由で流出して接触不良や熱経路断絶を招くのを防ぐ",
          "ステンシル開口を格子分割する際は Via 配置に合わせる——Via の真上にペーストを印刷すると Via に吸い込まれ上面のはんだ不足を招く",
          "EP が電気的グランド／信号兼用端子でもある場合、Via アレイの放熱設計がグランドインピーダンスや帰路経路を意図せず破壊しないか確認する",
          "多層基板では EP の熱を内層または底層の広い銅面積へ集約し、外部冷却（金属筐体、ヒートシンク）と組み合わせて初めて設計 θJA を達成できることが多く、Via アレイのみでは不十分な場合がある"
        ],
        "commonMistakes": [
          "手軽さから EP ステンシルを一つの大窓にし、リフロー後のボイド率が高くなり実測熱抵抗がデータシート値を大きく上回る",
          "EP 下部の Via を塞孔せず、リフロー時にはんだペーストが Via に流出しチップと PCB 間のはんだ量が不足、はんだ不良や異常な熱抵抗を招く",
          "データシートの θJA 値のみでシステム放熱を見積もり、自社基板の層数や銅面積と照合しないため実動作温度が想定を大きく超える",
          "Via ピッチを詰めすぎてドリル信頼性を損なう、または粗すぎて熱抵抗改善効果が限定的——どちらも PCB 業者の製造能力と照合すべき"
        ]
      },
      "ko": {
        "title": "QFN 방열 EP 레이아웃(노출 패드 비아 배열과 스텐실 설계)",
        "description": "QFN/DFN 패키지의 노출 방열 패드(EP)는 칩의 주요 방열 출구지만, EP를 아무리 크게 만들어도 그 아래 비아 배열과 스텐실 설계가 제대로 되어 있지 않으면 열저항은 여전히 높고 솔더 보이드가 전기적 접촉까지 나쁘게 만들 수 있다.",
        "principles": "리드리스 QFN/DFN 패키지 중앙의 노출 금속 패드(EP)는 다이 뒷면의 다이 어태치에 직결되어 칩에서 PCB로 열이 흐르는 주요 저저항 경로이며, 종종 그라운드/방열 겸용 단자 역할도 한다. EP 레이아웃의 핵심 작업은 '접합부에서 보드까지(RθJB)'와 '접합부에서 케이스까지(RθJC)'의 열저항을 실제로 '보드가 열을 내보내는 능력'으로 바꾸는 것이다 - 이를 위해 EP 아래에 비아 배열을 뚫어 내층이나 하부층의 방열 동박으로 열을 전달해야 한다. 비아 자체는 막음 방식을 결정해야 한다: 개방 상태로 두면 리플로우 시 솔더 페이스트가 비아로 흘러들어간다(저렴하지만 페이스트가 빨려 들어가 상면 솔더량이 부족해질 수 있음). 구리나 에폭시로 막고 도금으로 덮는 방식(via-in-pad)은 비용이 더 들지만 페이스트 손실을 막고 열전도 경로도 더 완전해진다 - 중대전류·고전력 부품에서는 이 추가 공정을 들일 가치가 많다. 솔더 페이스트 스텐실 개구 설계에서 EP 전체를 하나의 큰 창으로 열면 리플로우 시 페이스트 양이 과다해 큰 보이드(가스가 빠지지 못함)가 생기기 쉽다. 업계 관행은 EP 스텐실 개구를 여러 개의 작은 격자로 나누는 것(보통 50~70% 개구율, 비아 배치에 맞춰 격자 분할)으로, 페이스트를 균일하게 분포시키고 공기가 잘 빠지게 해 방열성과 신뢰성을 함께 잡는다. 전체 θJA(접합부-주변 열저항)는 칩 단독의 고정값이 아니다 - 같은 칩이라도 JEDEC 표준 테스트 보드와 실제 다층 응용 보드에서 θJA가 3배 이상 차이날 수 있다. EP 비아 밀도, 보드 층수, 동박 면적이 모두 결과를 좌우한다.",
        "designNotes": [
          "EP 아래 비아 배열의 지름, 개수, 피치는 열 시뮬레이션(최소한 열저항 추정)과 함께 PCB 설계 초기에 확정해야지, 배선 후에 나중에 덧붙이면 안 됨",
          "고전력·고전류 부품에는 막음-도금 via-in-pad를 우선 고려해 솔더 페이스트가 비아를 통해 빠져나가 접촉 불량이나 열 경로 단절을 일으키는 것을 방지",
          "스텐실 개구를 격자로 나눌 때는 비아 배치에 맞춰야 함 - 비아 바로 위에 페이스트를 인쇄하면 비아로 빨려 들어가 상면 솔더가 부족해짐",
          "EP가 전기적 그라운드/신호 겸용 단자이기도 하면, 비아 배열의 방열 설계가 그라운드 임피던스나 리턴 경로를 의도치 않게 깨뜨리지 않는지 확인",
          "다층 보드에서는 EP의 열을 내층이나 하부층의 넓은 동박 면적으로 모으고 외부 냉각(금속 케이스, 히트싱크)과 결합해야 설계 θJA를 실제로 달성하는 경우가 많으며, 비아 배열만으로는 부족할 수 있음"
        ],
        "commonMistakes": [
          "편의상 EP 스텐실을 큰 창 하나로 열어 리플로우 후 보이드율이 높아지고 실측 열저항이 데이터시트 수치를 크게 웃돎",
          "EP 아래 비아를 막지 않아 리플로우 시 솔더 페이스트가 비아로 빠져나가 칩과 PCB 사이 솔더량이 부족해지고 냉납이나 이상 열저항 발생",
          "데이터시트의 θJA 수치만으로 시스템 방열을 추정하고 자사 보드의 층수·동박 면적과 대조하지 않아 실제 동작 온도가 예상을 크게 초과",
          "비아 피치를 너무 좁게 잡아 드릴 신뢰성이 떨어지거나, 너무 넓게 잡아 열저항 개선 효과가 제한적 - 둘 다 PCB 업체의 공정 능력과 대조해야 함"
        ]
      }
    },
    "sourcePdf": "IC-spec/tas2320.pdf",
    "createdAt": "2026-07-10T00:00:00Z",
    "updatedAt": "2026-07-10T00:00:00Z"
  },
  {
    "id": "wqfn-hotrod-layout",
    "title": "Hot-Rod／翻晶QFN功率佈局（無引線框架與功率迴路最小化）",
    "category": "pcb-design",
    "products": [
      "AI 伺服器",
      "通用"
    ],
    "description": "WQFN-HR(俗稱Hot-Rod)封裝把功率級塞進無引線的小型QFN裡，佈局做得好可以讓θJA差到3倍以上——輸入迴路面積與SW節點處理是決定效率、EMI、散熱三件事的關鍵。",
    "principles": "WQFN-HR(HR即Hot-Rod)是把功率MOSFET與控制電路整合進無引線QFN封裝的技術，省去傳統引腳的寄生電感與電阻，適合高電流密度的同步降壓/升壓模組。無引線意味著I/O腳位就在封裝邊緣直接與PCB銅箔相連，寄生電感遠低於傳統QFP/SOIC，但也代表佈局設計的容錯空間更小——走線寬度、過孔位置、去耦電容擺放位置的微小差異，都會直接反映在效率與EMI上。輸入迴路最小化是功率佈局第一原則:高側/低側MOSFET開關瞬間，輸入電容到功率地之間的迴路承載著di/dt很大的脈衝電流，迴路面積越大，寄生電感越大，開關瞬間的電壓尖峰與輻射雜訊就越嚴重——因此輸入去耦電容必須貼著VIN與相鄰PGND腳位擺放，並在電容下方與腳位下方大量佈滿過孔，讓電流走最短路徑回到晶片。SW節點(開關節點，連接內部橋臂到外部電感的那段走線)是另一個處理重點:它承載全振幅的方波電壓且dV/dt很高，走線要盡量短且寬以降低寄生電感造成的振鈴與EMI，但又不能佈得離其他小訊號線太近，因為它本身就是最大的雜訊源。這類封裝通常還有多顆PGND/VIN腳位分散在封裝周邊，佈局時要用內層把同名腳位低阻抗連通，不能只讓每顆腳位各自孤立去耦。",
    "circuits": [],
    "keyFormulas": [
      "TPS544B28(19-pin WQFN-HR)RθJA:JEDEC標準板59°C/W → 應用層6層板佈局19.0°C/W(降幅逾3倍，凸顯佈局對散熱的決定性)",
      "VIN去耦電容規格範例:1µF/25V/0402陶瓷高頻旁路電容，緊貼每個VIN腳位並連到相鄰PGND腳位",
      "VCC去耦迴路走線寬度建議≥12mil，BOOT電容走線同樣≥12mil",
      "SW節點原則:走線盡量短且寬，同時遠離小訊號/回授走線"
    ],
    "designNotes": [
      "輸入電容優先貼緊VIN/PGND腳位，其餘輸入電容才擺板子另一面，並用大量過孔連通降低阻抗",
      "PGND腳位下方與周邊盡量佈滿過孔，同時降低寄生阻抗與熱阻(過孔既是電流回路也是散熱路徑)",
      "兩顆或以上VIN腳位之間要用內層低阻抗連通，並在每顆VIN腳位下方各留一顆過孔",
      "SW節點面積與長度是效率、EMI、可靠度的共同折衷點，佈局時優先滿足短寬原則，再讓小訊號(回授、電流限制設定)遠離它",
      "回授/遠端感測(Kelvin)走線要與SW/電感等雜訊源分開規劃，並用接地層上下屏蔽，詳見電流感測與Kelvin接法卡片"
    ],
    "commonMistakes": [
      "輸入去耦電容擺得離VIN/PGND腳位較遠，輸入迴路面積放大，開關雜訊與電壓尖峰明顯惡化",
      "只用JEDEC標準測試板的θJA數字做熱設計，沒有依實際多層板佈局重新評估，結果散熱裕度嚴重不足",
      "SW節點走線又長又細(遷就佈線方便)，振鈴與EMI超標，效率也因寄生電感loss下降",
      "多顆PGND/VIN腳位各自獨立去耦、內層沒有低阻抗連通，造成腳位間電位不一致，影響電流分配與雜訊表現"
    ],
    "examples": [
      {
        "title": "伺服器多相/單相同步降壓模組",
        "application": "TPS544B28以WQFN-HR封裝驅動20A輸出，VIN/PGND腳位就近去耦+滿版過孔，SW節點短寬處理",
        "circuit": "VIN去耦電容(緊貼腳位) → WQFN-HR IC → SW節點(短寬) → 電感 → 輸出"
      }
    ],
    "relatedTopics": [
      "qfn-ep-thermal",
      "current-sense-kelvin",
      "vrm-multiphase"
    ],
    "i18n": {
      "en": {
        "title": "Hot-Rod / Flip-Chip QFN Power Layout (Leadless Frame & Input-Loop Minimization)",
        "description": "WQFN-HR (commonly called Hot-Rod) packages squeeze a power stage into a small leadless QFN - good layout can swing θJA by more than 3x, and input-loop area plus SW-node handling are what decide efficiency, EMI, and thermal performance together.",
        "principles": "WQFN-HR (HR = Hot-Rod) integrates power MOSFETs and control circuitry into a leadless QFN package, eliminating the parasitic inductance and resistance of traditional leads, well suited to high-current-density synchronous buck/boost modules. Leadless means the I/O pads connect straight to PCB copper right at the package edge, giving far lower parasitic inductance than a traditional QFP/SOIC - but it also means less margin for layout error: small differences in trace width, via placement, and decoupling capacitor position show up directly in efficiency and EMI. Input-loop minimization is the first principle of power layout: during high-side/low-side switching transitions, the loop between the input capacitor and power ground carries a pulse current with a large di/dt; the larger the loop area, the larger the parasitic inductance, and the worse the voltage spike and radiated noise at each switching edge - so the input decoupling capacitor must sit right against the VIN pin and adjacent PGND pin, with vias packed densely under both the capacitor and the pins so current takes the shortest path back into the chip. The SW node (the switching node - the trace connecting the internal bridge to the external inductor) is the other focal point: it carries the full-swing square wave with high dV/dt, so its trace should be as short and wide as possible to reduce ringing and EMI from parasitic inductance, while staying away from small-signal traces since it's the biggest noise source on the board. These packages typically also have multiple PGND/VIN pads spread around the package perimeter; the layout should tie same-named pads together at low impedance through an inner layer rather than decoupling each pad in isolation.",
        "designNotes": [
          "Prioritize input capacitors right against the VIN/PGND pins; place any remaining input capacitance elsewhere on the board and tie it back with plenty of vias to keep impedance low",
          "Fill the area under and around the PGND pins with as many vias as possible - vias serve both as the current return path and the thermal path",
          "Tie two or more VIN pins together through an inner layer at low impedance, and leave a via under each VIN pin",
          "SW-node area and length are a shared tradeoff among efficiency, EMI, and reliability - prioritize the short-and-wide rule first, then route small-signal traces (feedback, current-limit setting) away from it",
          "Feedback/remote-sense (Kelvin) traces should be planned separately from noise sources like the SW node and inductor, shielded above and below with ground planes - see the current-sense-kelvin card for detail"
        ],
        "commonMistakes": [
          "Placing the input decoupling capacitor farther from the VIN/PGND pins than it needs to be, enlarging the input loop area and visibly worsening switching noise and voltage spikes",
          "Using the JEDEC standard test board's θJA number alone for thermal design without re-evaluating against the actual multilayer application layout, leaving thermal margin badly short",
          "Making the SW-node trace long and thin for routing convenience, exceeding ringing and EMI limits while also losing efficiency to parasitic inductance",
          "Decoupling multiple PGND/VIN pins independently without a low-impedance inner-layer tie, leaving inconsistent potentials between pins that skew current sharing and noise performance"
        ]
      },
      "ja": {
        "title": "Hot-Rod／フリップチップ QFN パワーレイアウト（リードレスフレームと入力ループ最小化）",
        "description": "WQFN-HR（通称 Hot-Rod）パッケージはパワー段を小型リードレス QFN に詰め込む——レイアウト次第で θJA が3倍以上変わり、入力ループ面積と SW ノードの処理が効率・EMI・放熱の三つを同時に左右する。",
        "principles": "WQFN-HR（HR は Hot-Rod）はパワー MOSFET と制御回路をリードレス QFN パッケージに統合する技術で、従来リードの寄生インダクタンスと抵抗を排除し、高電流密度の同期整流バック／ブースト用モジュールに適する。リードレスとは I/O パッドがパッケージ端で直接 PCB 銅箔に接続されることを意味し、従来の QFP/SOIC より寄生インダクタンスがはるかに低いが、その分レイアウト設計の許容誤差が小さいことも意味する——配線幅、Via 位置、デカップリングコンデンサの配置のわずかな違いが効率と EMI に直接反映される。入力ループ最小化はパワーレイアウトの第一原則：ハイサイド／ローサイド MOSFET のスイッチング瞬間、入力コンデンサからパワーグランドまでのループには di/dt の大きいパルス電流が流れ、ループ面積が大きいほど寄生インダクタンスが大きくなり、スイッチング瞬間の電圧スパイクと放射雑音が悪化する——そのため入力デカップリングコンデンサは VIN と隣接する PGND ピンに密着させて配置し、コンデンサとピンの下に多数の Via を配置して電流が最短経路でチップへ戻れるようにする。SW ノード（スイッチングノード、内部ブリッジと外部インダクタを結ぶ配線）はもう一つの重点箇所：フルスイングの方形波電圧を運び dV/dt が高いため、配線は寄生インダクタンスによるリンギングと EMI を抑えるためできるだけ短く太くする一方、それ自体が最大の雑音源であるため他の小信号配線からは離す。この種のパッケージは通常複数の PGND/VIN パッドがパッケージ周囲に分散配置されており、レイアウトでは同名ピンを内層で低インピーダンスに接続すべきで、各ピンを個別にデカップリングするだけでは不十分。",
        "designNotes": [
          "入力コンデンサはまず VIN/PGND ピンに密着配置を優先し、残りの入力容量は基板の別面に配置して多数の Via で低インピーダンスに接続する",
          "PGND ピンの下および周辺にできるだけ多くの Via を配置——Via は電流帰路と放熱経路を兼ねる",
          "2個以上の VIN ピンは内層で低インピーダンスに接続し、各 VIN ピンの下にも Via を1個ずつ配置する",
          "SW ノードの面積と長さは効率・EMI・信頼性の共通のトレードオフ点——まず短く太くの原則を優先し、その後に小信号配線（帰還、電流制限設定）をそこから離す",
          "帰還／リモートセンス（Kelvin）配線は SW ノードやインダクタなどの雑音源とは別に計画し、上下をグランドプレーンで遮蔽する——詳細は電流検出と Kelvin 接続のカードを参照"
        ],
        "commonMistakes": [
          "入力デカップリングコンデンサを VIN/PGND ピンから必要以上に離して配置し、入力ループ面積が拡大してスイッチング雑音と電圧スパイクが明らかに悪化",
          "JEDEC 標準テスト基板の θJA 値のみで熱設計を行い、実際の多層アプリケーション基板レイアウトで再評価しないため放熱余裕が大幅に不足",
          "配線の都合で SW ノード配線を長く細くし、リンギングと EMI が規格超過、寄生インダクタンス損失で効率も低下",
          "複数の PGND/VIN ピンを個別にデカップリングし内層での低インピーダンス接続を行わないため、ピン間で電位が不揃いになり電流分配と雑音性能に影響"
        ]
      },
      "ko": {
        "title": "Hot-Rod/플립칩 QFN 파워 레이아웃(리드리스 프레임과 입력 루프 최소화)",
        "description": "WQFN-HR(흔히 Hot-Rod라 부름) 패키지는 파워단을 작은 리드리스 QFN에 욱여넣는다 - 레이아웃을 잘하면 θJA가 3배 이상 차이나며, 입력 루프 면적과 SW 노드 처리가 효율·EMI·방열 세 가지를 함께 좌우한다.",
        "principles": "WQFN-HR(HR은 Hot-Rod)는 파워 MOSFET과 제어 회로를 리드리스 QFN 패키지에 통합하는 기술로, 기존 리드의 기생 인덕턴스와 저항을 없애 고전류 밀도의 동기 정류 벅/부스트 모듈에 적합하다. 리드리스라는 것은 I/O 패드가 패키지 가장자리에서 PCB 동박에 직결된다는 뜻으로, 기존 QFP/SOIC보다 기생 인덕턴스가 훨씬 낮지만 그만큼 레이아웃 설계의 오차 허용 범위도 작다는 뜻이다 - 배선 폭, 비아 위치, 디커플링 커패시터 배치의 작은 차이가 효율과 EMI에 직접 반영된다. 입력 루프 최소화는 파워 레이아웃의 첫 번째 원칙이다: 하이사이드/로우사이드 MOSFET 스위칭 순간, 입력 커패시터에서 파워 그라운드까지의 루프에는 di/dt가 큰 펄스 전류가 흐르며, 루프 면적이 클수록 기생 인덕턴스가 커져 스위칭 순간의 전압 스파이크와 방사 잡음이 심해진다 - 그래서 입력 디커플링 커패시터는 VIN과 인접 PGND 핀에 바짝 붙여 배치하고, 커패시터와 핀 아래에 비아를 촘촘히 넣어 전류가 최단 경로로 칩에 돌아가게 해야 한다. SW 노드(스위칭 노드, 내부 브리지와 외부 인덕터를 잇는 배선)는 또 다른 핵심 지점이다: 풀스윙 구형파 전압을 실어 dV/dt가 높으므로 배선을 최대한 짧고 넓게 해 기생 인덕턴스로 인한 링잉과 EMI를 줄여야 하지만, 그 자체가 최대 잡음원이므로 다른 소신호 배선과는 떨어뜨려야 한다. 이런 패키지는 보통 여러 개의 PGND/VIN 패드가 패키지 둘레에 분산되어 있어, 레이아웃에서는 동일 명칭 핀들을 내층으로 저임피던스 연결해야지 각 핀을 따로따로 디커플링하는 것만으로는 부족하다.",
        "designNotes": [
          "입력 커패시터는 VIN/PGND 핀에 바짝 붙이는 것을 우선하고, 나머지 입력 용량은 보드 반대면에 두되 비아를 많이 써서 저임피던스로 연결",
          "PGND 핀 아래와 주변에 비아를 최대한 많이 배치 - 비아는 전류 리턴 경로이자 방열 경로를 겸함",
          "VIN 핀 2개 이상은 내층으로 저임피던스 연결하고, 각 VIN 핀 아래에도 비아를 하나씩 둘 것",
          "SW 노드의 면적과 길이는 효율·EMI·신뢰성이 함께 얽힌 트레이드오프 지점 - 짧고 넓게 원칙을 먼저 만족시킨 뒤 소신호 배선(피드백, 전류 제한 설정)을 거기서 떨어뜨릴 것",
          "피드백/원격 감지(켈빈) 배선은 SW 노드나 인덕터 같은 잡음원과 별도로 계획하고 위아래를 그라운드 플레인으로 차폐 - 자세한 내용은 전류 감지와 켈빈 접속 카드 참고"
        ],
        "commonMistakes": [
          "입력 디커플링 커패시터를 VIN/PGND 핀에서 필요 이상 멀리 배치, 입력 루프 면적이 커져 스위칭 잡음과 전압 스파이크가 눈에 띄게 악화",
          "JEDEC 표준 테스트 보드의 θJA 값만으로 열 설계를 하고 실제 다층 응용 보드 레이아웃으로 재평가하지 않아 방열 여유가 크게 부족",
          "배선 편의를 위해 SW 노드 배선을 길고 가늘게 해 링잉과 EMI가 기준을 초과하고 기생 인덕턴스 손실로 효율도 저하",
          "여러 PGND/VIN 핀을 각각 독립적으로 디커플링하고 내층 저임피던스 연결을 하지 않아 핀 간 전위가 불균일해지고 전류 분배와 잡음 성능에 영향"
        ]
      }
    },
    "sourcePdf": "IC-spec/tps544b28.pdf",
    "createdAt": "2026-07-10T00:00:00Z",
    "updatedAt": "2026-07-10T00:00:00Z"
  }
];
  window.KNOWLEDGE_EXTRA = (window.KNOWLEDGE_EXTRA || []).concat(CARDS);
})();
