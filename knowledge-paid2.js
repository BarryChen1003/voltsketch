/**
 * knowledge-paid2.js — 付費知識卡月更批（2026-07 第一批，5 張，付費分類輪流：
 * 電子紙／車用電子／AI 伺服器／手機／筆電；智慧手錶輪空、下批優先）。
 * 掛法同 knowledge-paid.js：concat 進 window.KNOWLEDGE_EXTRA；products 決定付費鎖。
 * i18n 內嵌（extra2/3/4 同規格：title/description/principles/designNotes/commonMistakes；
 * keyFormulas/examples 沿用 zh）。加卡務必 bump knowledge.js BUILTIN_VERSION + knowledge.html ?v=。
 */
(function () {
  var T = '2026-07-17T10:00:00Z';
  var CARDS = [
    {
      id: 'epd-frontlight', title: '電子紙前光設計（導光板＋雙色溫 LED 調光）', category: 'power-management', products: ['電子紙'],
      description: '電子紙不自發光，夜讀靠「前光」：LED 從側面打進導光板、均勻灑在面板正面。設計重點是 LED 驅動的無頻閃調光、冷暖雙色溫混光，以及超低亮度端的線性度。',
      principles: '前光模組＝側入式 LED＋導光板（貼在 EPD 上方，光朝下打向面板再反射入眼）。閱讀器常配冷白＋暖黃兩組 LED 做色溫調節：兩路各自獨立調光，混光比例決定色溫。驅動有兩路線：(1) MCU 直接 PWM 拉 MOSFET——簡單但低亮度端步階粗、頻率選不好會頻閃；(2) 專用 LED driver（升壓或線性）＋高解析度調光（PWM 12bit 以上或類比調光）——低亮度平滑。EPD 本身不耗電、前光反而是夜讀主要功耗，超低亮度（<1 nit 級）要能穩定輸出，考驗 driver 的最小導通時間與 LED Vf 一致性。',
      circuits: [],
      keyFormulas: ['色溫混光：暖佔比 = I_warm/(I_warm+I_cool)（近似線性內插）', 'PWM 頻閃：調光頻率 > 1kHz 基本無感（IEEE 1789 建議越高越好）', '最低亮度步階 = 滿亮度/2^n（n=調光位元數，12bit→4096 階）', '側入式均勻度靠導光板網點設計，電路端只管電流精度'],
      designNotes: ['調光 PWM 頻率避開相機拍攝頻閃帶（>2kHz 較保險），且勿與 EPD 更新期間的電源突波疊加', '兩路 LED 共用升壓時注意一路關斷瞬間的電壓過衝打到另一路', '低亮度端改用類比調光（降電流）可消 PWM 頻閃，但 LED 色點會隨電流漂——雙色溫混光時要補償', '前光 FPC 與 EPD 高壓軌（±15V）走線分開，調光 PWM 別耦合進 VCOM', '亮度記憶與漸亮漸暗（fade）在 MCU 端做，避免開燈瞬間刺眼'],
      commonMistakes: ['PWM 頻率取幾百 Hz → 低亮度肉眼頻閃、拍照有滾動條紋', '兩路色溫直接並聯共享一路電流 → 色溫無法獨立調', '低亮度只靠縮 PWM 佔空比 → 最低亮度跳階、閃爍', '前光走線貼著 VCOM → 調光雜訊變成畫面淡紋'],
      examples: [{ title: '閱讀器夜讀模式', application: '冷暖雙路 LED 各 12bit PWM，混光實現 2700K~6500K 連續色溫', circuit: '升壓 LED driver ×2 路 + MCU PWM/I2C 調光' }],
      relatedTopics: ['epd-power-rails', 'epd-partial-refresh', 'laptop-backlight'], sourcePdf: null, createdAt: T, updatedAt: T,
      i18n: {
        en: {
          title: 'E-Paper Front Light (Light Guide + Dual-CCT LED Dimming)',
          description: 'E-paper does not emit light; night reading relies on a front light: side LEDs inject into a light guide that washes the panel face evenly. The design hinges on flicker-free LED dimming, warm/cool dual-CCT mixing, and linearity at the very bottom of the brightness range.',
          principles: 'The front-light module is an edge-lit LED set plus a light guide laminated above the EPD, throwing light down onto the panel to reflect into the eye. Readers usually carry cool-white and warm-amber LED strings for color-temperature adjustment: each string dims independently and the mixing ratio sets the CCT. Two drive approaches: (1) MCU PWM driving a MOSFET directly - simple, but coarse steps at low brightness and flicker if the frequency is poorly chosen; (2) a dedicated LED driver (boost or linear) with high-resolution dimming (12-bit+ PWM or analog) - smooth at the bottom end. The EPD itself burns nothing; the front light dominates night-reading power, and stable sub-1-nit output tests the driver minimum on-time and LED Vf matching.',
          designNotes: ['Keep the dimming PWM above the camera-flicker band (>2kHz is safer) and never let it stack on the supply transients during an EPD update', 'When two strings share one boost, watch the overshoot that hits the other string the instant one turns off', 'Switching to analog dimming (current reduction) at the bottom end removes PWM flicker, but the LED color point drifts with current - compensate when mixing two CCTs', 'Route the front-light FPC away from the EPD high-voltage rails (±15V); keep dimming PWM out of VCOM', 'Do brightness memory and fade-in/out in the MCU so the lamp never snaps on at full glare'],
          commonMistakes: ['Choosing a few hundred Hz for PWM - visible flicker at low brightness and rolling bands on camera', 'Paralleling both CCT strings on one current path - color temperature can no longer be adjusted independently', 'Reaching minimum brightness only by shrinking duty - the bottom step jumps and flickers', 'Front-light traces hugging VCOM - dimming noise turns into faint image streaks']
        },
        ja: {
          title: '電子ペーパーのフロントライト設計（導光板＋2色温 LED 調光）',
          description: '電子ペーパーは自発光しないため、夜間はフロントライトに頼る：LED を側面から導光板に入れ、パネル前面を均一に照らす。設計の要はフリッカーフリー調光、寒暖 2 色温の混光、超低輝度端のリニアリティ。',
          principles: 'フロントライトモジュール＝サイド入光 LED＋導光板（EPD の上に貼り、光を下向きに当てて反射で目に届ける）。リーダーは寒色白＋暖色アンバーの 2 系統 LED で色温調節するのが常道：各系統を独立に調光し、混光比が色温を決める。駆動は 2 通り：(1) MCU の PWM で MOSFET を直接駆動——簡単だが低輝度端のステップが粗く、周波数を誤るとフリッカー；(2) 専用 LED ドライバ（昇圧またはリニア）＋高分解能調光（12bit 以上の PWM またはアナログ調光）——低輝度端が滑らか。EPD 自体は電力を食わず、夜間読書の消費はフロントライトが支配的。1nit 未満の安定出力はドライバの最小オン時間と LED Vf の揃いが試される。',
          designNotes: ['調光 PWM はカメラフリッカー帯を避け（>2kHz が無難）、EPD 更新中の電源過渡と重ねない', '2 系統が 1 つの昇圧を共有する場合、片方オフの瞬間の過電圧がもう片方を叩くのに注意', '低輝度端をアナログ調光（電流低減）に切り替えると PWM フリッカーは消えるが、LED の色点が電流で漂う——2 色温混光では補償が要る', 'フロントライト FPC は EPD 高圧レール（±15V）から離し、調光 PWM を VCOM に結合させない', '輝度記憶とフェードイン/アウトは MCU 側で行い、点灯瞬間の眩しさを避ける'],
          commonMistakes: ['PWM を数百 Hz にする → 低輝度で目に見えるフリッカー、カメラにローリング縞', '2 色温を 1 電流経路に並列 → 色温を独立調整できない', '最低輝度をデューティ縮小だけで作る → 最下段が段飛び・ちらつき', 'フロントライト配線が VCOM に密着 → 調光ノイズが薄い画面縞になる']
        },
        ko: {
          title: '전자잉크 프런트라이트 설계(도광판+2색온 LED 조광)',
          description: '전자잉크는 자발광하지 않아 야간 독서는 프런트라이트에 의존: LED를 측면에서 도광판에 넣어 패널 전면을 균일하게 비춘다. 설계 핵심은 플리커 프리 조광, 냉·온 2색온 혼광, 초저휘도 구간의 선형성.',
          principles: '프런트라이트 모듈=측면 입광 LED+도광판(EPD 위에 접합, 빛을 아래로 쏘아 반사로 눈에 전달). 리더기는 냉백+온앰버 2계통 LED로 색온도를 조절: 각 계통을 독립 조광하고 혼광비가 색온도를 결정. 구동은 두 갈래: (1) MCU PWM으로 MOSFET 직접 구동——간단하지만 저휘도 스텝이 거칠고 주파수를 잘못 잡으면 플리커; (2) 전용 LED 드라이버(부스트/리니어)+고분해능 조광(12bit 이상 PWM 또는 아날로그)——저휘도 구간이 매끄러움. EPD 자체는 전력을 안 쓰고 야간 소비는 프런트라이트가 지배적. 1nit 미만 안정 출력은 드라이버 최소 온타임과 LED Vf 편차가 관건.',
          designNotes: ['조광 PWM은 카메라 플리커 대역을 피하고(>2kHz 권장) EPD 갱신 중 전원 과도와 겹치지 않게', '2계통이 부스트 하나를 공유하면 한쪽 오프 순간의 과전압이 다른 쪽을 때리는 것에 주의', '저휘도 구간을 아날로그 조광(전류 저감)으로 바꾸면 PWM 플리커는 사라지나 LED 색점이 전류에 따라 표류——2색온 혼광 시 보상 필요', '프런트라이트 FPC는 EPD 고압 레일(±15V)과 분리, 조광 PWM이 VCOM에 결합되지 않게', '휘도 기억과 페이드 인/아웃은 MCU에서 처리해 점등 순간 눈부심 방지'],
          commonMistakes: ['PWM을 수백 Hz로 → 저휘도에서 육안 플리커, 카메라에 롤링 줄무늬', '2색온을 한 전류 경로에 병렬 → 색온도 독립 조절 불가', '최저 휘도를 듀티 축소만으로 → 최하단 계단 튐·깜빡임', '프런트라이트 배선이 VCOM에 밀착 → 조광 노이즈가 옅은 화면 줄무늬로'],
        }
      }
    },
    {
      id: 'auto-lin-bus', title: '車用 LIN Bus 硬體設計（單線 12V、休眠喚醒）', category: 'communication', products: ['車用電子'],
      description: 'LIN 是車身電子的低成本單線匯流排（車窗、後視鏡、座椅、雨刷）：12V 位準、20kbps、主從式。硬體重點在收發器選型、上拉與二極體、以及休眠電流。',
      principles: 'LIN＝單線＋地回流，顯性 0（拉低）/隱性 1（靠上拉回 VBAT）。主節點上拉 1kΩ＋串聯二極體（防 VBAT 掉電時從匯流排倒灌），從節點內建 30kΩ 上拉。速率上限 20kbps（波形斜率被收發器刻意限制以壓 EMI）。收發器（如 TJA102x 級）整合波形整形、過壓保護、休眠模式與喚醒偵測：匯流排顯性 >150µs 或本地喚醒腳觸發 INH 拉起，喚醒整個節點電源。協議層主節點輪詢排程（break+sync+ID），從節點靠 sync 場校準自身時脈——所以從節點可用 RC 振盪器省成本，這是 LIN 成本優勢的核心。',
      circuits: [],
      keyFormulas: ['主節點上拉 1kΩ＋二極體；從節點 30kΩ（內建）', '匯流排時間常數 τ = R_total × C_bus ≤ 5µs（規範）', '速率 ≤ 20kbps；斜率控制壓 EMI', '休眠電流：整節點 <100µA 級（收發器 sleep + INH 關 LDO）'],
      designNotes: ['收發器 TXD 有短路超時保護，但 MCU UART 腳位設定錯（極性反）會整條匯流排卡顯性——開機預設腳位先確認', '匯流排線對電池短路/對地短路是常態測試項——收發器要選耐 ±40V 級', 'C_bus 總量管制：每節點 ESD 電容 + 線纜電容加總不可讓 τ 超標，節點多時每站電容要縮', 'INH 腳直接控制節點 LDO 的 EN＝休眠時整站斷電，喚醒鏈路要驗證「誰能叫醒誰」', '離車架地遠的節點注意地偏移：LIN 顯性/隱性門檻以各自 VBAT 比例判定，地差大會誤判'],
      commonMistakes: ['主節點忘了串二極體 → KL30 掉電時 ECU 從匯流排被反向供電', '把 LIN 當一般 UART 直連不經收發器 → 位準不對、無斜率控制、EMI 炸', '休眠設計只關 MCU 不關收發器/LDO → 整車暗電流超標（車廠常要求整站 <100µA）', '從節點用晶振而非 RC → 白花成本（sync 場本來就會校時）'],
      examples: [{ title: '車窗升降模組', application: '門控主節點輪詢 4 個 LIN 從站（馬達/開關/防夾），點火 OFF 全站休眠', circuit: 'MCU UART ↔ LIN 收發器 ↔ 單線匯流排；INH → LDO EN' }],
      relatedTopics: ['can-fd-automotive', 'auto-power-arch', 'reverse-battery-auto'], sourcePdf: null, createdAt: T, updatedAt: T,
      i18n: {
        en: {
          title: 'Automotive LIN Bus Hardware (Single-Wire 12V, Sleep/Wake)',
          description: 'LIN is the low-cost single-wire bus of body electronics (windows, mirrors, seats, wipers): 12V levels, 20kbps, master-slave. Hardware focus: transceiver choice, the pull-up and its diode, and sleep current.',
          principles: 'LIN is one wire plus ground return: dominant 0 (pulled low) / recessive 1 (pulled to VBAT). The master pulls up with 1kΩ plus a series diode (blocks back-feed from the bus when VBAT drops); slaves have a built-in 30kΩ. The rate tops out at 20kbps - the transceiver deliberately slew-limits edges to keep EMI down. Transceivers (TJA102x class) integrate wave shaping, overvoltage protection, sleep mode and wake detection: a dominant level >150µs, or a local wake pin, raises INH to power the whole node back up. The master schedules polling (break+sync+ID) and slaves calibrate their clocks on the sync field - which is why slaves can run on an RC oscillator, the core of LIN cost advantage.',
          designNotes: ['Transceivers time-out a stuck TXD, but a mis-configured MCU UART pin (inverted polarity) still jams the bus dominant - verify power-up pin defaults', 'Bus-to-battery and bus-to-ground shorts are standard tests - pick a ±40V-class transceiver', 'Budget total C_bus: per-node ESD caps plus cable capacitance must keep τ = R×C ≤ 5µs; with many nodes, shrink each station cap', 'INH driving the node LDO EN means the whole station powers off in sleep - validate the wake chain: who can wake whom', 'Nodes far from chassis ground: dominant/recessive thresholds are ratios of each node own VBAT, so ground offset can flip a bit'],
          commonMistakes: ['Master missing the series diode - the ECU gets back-powered from the bus when KL30 drops', 'Wiring LIN as plain UART without a transceiver - wrong levels, no slew control, EMI explosion', 'Sleeping only the MCU but not the transceiver/LDO - vehicle dark current fails (OEMs often demand <100µA per station)', 'Putting a crystal on a slave instead of RC - wasted cost, the sync field calibrates anyway']
        },
        ja: {
          title: '車載 LIN バスのハードウェア設計（シングルワイヤ 12V、スリープ/ウェイク）',
          description: 'LIN はボディ系の低コスト・シングルワイヤバス（ウィンドウ、ミラー、シート、ワイパー）：12V レベル、20kbps、マスタ・スレーブ式。ハードの要はトランシーバ選定、プルアップとダイオード、スリープ電流。',
          principles: 'LIN＝1 線＋グランドリターン。ドミナント 0（引き下げ）／リセッシブ 1（プルアップで VBAT へ）。マスタは 1kΩ＋直列ダイオード（VBAT 低下時のバスからの逆流を阻止）、スレーブは内蔵 30kΩ。速度上限 20kbps（トランシーバが意図的にスルーレート制限して EMI を抑制）。トランシーバ（TJA102x 級）は波形整形、過電圧保護、スリープと(ウェイク検出を統合：バスのドミナント >150µs またはローカルウェイクピンで INH が立ち上がり、ノード全体の電源を起こす。マスタがポーリングスケジュール（break+sync+ID）を回し、スレーブは sync フィールドで自クロックを校正——だからスレーブは RC 発振器で済み、これが LIN のコスト優位の核心。',
          designNotes: ['トランシーバは TXD 固着のタイムアウト保護を持つが、MCU UART ピン設定ミス（極性反転）はバスをドミナント固着させる——起動時のピンデフォルトを確認', 'バスの対バッテリ/対グランド短絡は定番試験——±40V 級トランシーバを選ぶ', 'C_bus 総量管理：各ノードの ESD 容量＋ケーブル容量の合計で τ = R×C ≤ 5µs を守る。ノードが多いほど 1 局あたりの容量を絞る', 'INH でノード LDO の EN を制御＝スリープ時に局全体が断電。「誰が誰を起こせるか」のウェイク連鎖を検証', 'シャーシグランドから遠いノードはグランドオフセットに注意：判定しきい値は各ノードの VBAT 比率なので、地電位差でビット誤判定があり得る'],
          commonMistakes: ['マスタの直列ダイオード忘れ → KL30 断時に ECU がバスから逆給電される', 'トランシーバなしで LIN を普通の UART 直結 → レベル不正・スルー制御なし・EMI 爆発', 'MCU だけスリープしてトランシーバ/LDO を切らない → 暗電流超過（OEM は局あたり <100µA を要求しがち）', 'スレーブに水晶を載せる → 無駄コスト（sync フィールドで校時される）']
        },
        ko: {
          title: '차량용 LIN 버스 하드웨어 설계(단선 12V, 슬립/웨이크)',
          description: 'LIN은 차체 전장의 저비용 단선 버스(윈도우, 미러, 시트, 와이퍼): 12V 레벨, 20kbps, 마스터-슬레이브. 하드웨어 핵심은 트랜시버 선정, 풀업과 다이오드, 슬립 전류.',
          principles: 'LIN=한 가닥+접지 리턴. 도미넌트 0(풀다운)/리세시브 1(풀업으로 VBAT). 마스터는 1kΩ+직렬 다이오드(VBAT 강하 시 버스로부터의 역류 차단), 슬레이브는 내장 30kΩ. 속도 상한 20kbps(트랜시버가 의도적으로 슬루 제한해 EMI 억제). 트랜시버(TJA102x급)는 파형 정형, 과전압 보호, 슬립·웨이크 감지를 통합: 버스 도미넌트 >150µs 또는 로컬 웨이크 핀으로 INH가 올라가 노드 전체 전원을 깨움. 마스터가 폴링 스케줄(break+sync+ID)을 돌리고 슬레이브는 sync 필드로 자기 클록을 교정——그래서 슬레이브는 RC 발진기로 충분, 이것이 LIN 비용 우위의 핵심.',
          designNotes: ['트랜시버는 TXD 고착 타임아웃 보호가 있지만 MCU UART 핀 설정 오류(극성 반전)는 버스를 도미넌트로 고착시킴——부팅 시 핀 디폴트 확인', '버스의 배터리 단락/접지 단락은 표준 시험——±40V급 트랜시버 선정', 'C_bus 총량 관리: 노드별 ESD 커패시터+케이블 용량 합이 τ=R×C ≤ 5µs를 지키게. 노드가 많을수록 국당 용량 축소', 'INH가 노드 LDO EN을 제어=슬립 시 스테이션 전체 단전. "누가 누구를 깨울 수 있는가" 웨이크 체인 검증', '섀시 접지에서 먼 노드는 접지 오프셋 주의: 판정 임계값이 각 노드 VBAT 비율이라 지전위차로 비트 오판 가능'],
          commonMistakes: ['마스터 직렬 다이오드 누락 → KL30 차단 시 ECU가 버스에서 역급전됨', '트랜시버 없이 LIN을 일반 UART 직결 → 레벨 불일치·슬루 제어 없음·EMI 폭발', 'MCU만 슬립하고 트랜시버/LDO를 안 끔 → 암전류 초과(OEM은 국당 <100µA 요구 흔함)', '슬레이브에 크리스털 탑재 → 비용 낭비(sync 필드가 교정해줌)'],
        }
      }
    },
    {
      id: 'server-hotswap-efuse', title: 'AI 伺服器熱插拔控制與 eFuse（浪湧、SOA、ORing）', category: 'protection', products: ['AI 伺服器'],
      description: '板卡帶電插入 12V/48V 背板瞬間，母線電容等於短路負載——熱插拔控制器用外部 MOSFET 限制浪湧、監控故障；eFuse 把這套整合成單晶片。關鍵字：inrush、SOA、ORing。',
      principles: '插入瞬間 V=12V、C=數 mF，未受控的 inrush 可達數百安培：燒接點、拉垮背板、觸發整櫃保護。熱插拔控制器串一顆 NMOS 當「慢啟動開關」：以固定 dV/dt（閘極電流源充 CGD）或恆流模式抬升輸出，把 inrush 壓到設定值；同時監控 UV/OV/OC，故障時斷開並上報（PMBus/GPIO）。MOSFET 選型的核心不是 RDS(on) 而是 SOA——啟動期間 MOSFET 同時扛高 VDS 與大電流（線性區工作），必須用 datasheet SOA 曲線對照啟動時間驗證，抓 derating。eFuse 把 MOSFET＋控制＋保護整合單晶片（電流位階較小、多用於 12V 支路）；48V 大電流仍以控制器＋分立 MOSFET 為主。多電源並聯用 ORing（理想二極體控制器＋MOSFET 取代肖特基）防倒灌並省導通損。',
      circuits: [],
      keyFormulas: ['inrush I = C × dV/dt（控制 dV/dt 即控制浪湧）', '啟動能量 E ≈ ½CV²（全部落在 MOSFET 上，對照 SOA）', 'SOA 檢查點：VDS × ID × 啟動時間 vs datasheet 脈衝曲線', 'ORing 導通損 = I²×RDS(on) ≪ 二極體 I×Vf'],
      designNotes: ['dV/dt 設定要同時滿足：inrush 夠低（背板容忍）且啟動時間夠短（SOA 撐得住）——兩者相反，先算 SOA 再定斜率', '熱插拔 MOSFET 選「linear mode 強化」料（SOA 標到 10ms 級），一般低 RDS(on) 開關管在線性區很脆', '感流電阻功率與 Kelvin 接法：mΩ 級電阻走大電流，四線感測否則 OC 門檻漂', '插槽引腳長短設計（先地、後電源、再訊號）配合控制器的 present/短腳偵測', '故障重試策略要定：hiccup 重試次數、還是鎖死等 PMBus 清除——資料中心通常要遙測+鎖死', 'ORing 控制器的反向關斷速度（µs 級）決定母線倒灌深度，背靠背 MOSFET 才能雙向斷'],
      commonMistakes: ['MOSFET 只看 RDS(on) 不查 SOA → 啟動線性區燒管（最常見的熱插拔炸點）', 'dV/dt 設太慢 → 啟動超過 SOA 時間窗，一樣燒', '感流電阻沒 Kelvin → OC 誤跳或不跳', '用肖特基做 ORing → 大電流下 Vf 損耗與熱都不可接受'],
      examples: [{ title: 'GPU 板 12V 熱插拔', application: '12V/60A 板卡：熱插拔控制器 + 2 並聯 SOA 強化 MOSFET，dV/dt 2ms 啟動，PMBus 上報', circuit: '背板 12V → 熱插拔控制器/MOSFET → 板內 VRM；ORing 於雙電源輸入' }],
      relatedTopics: ['server-48v-power', 'vrm-multiphase', 'pmbus-telemetry'], sourcePdf: null, createdAt: T, updatedAt: T,
      i18n: {
        en: {
          title: 'Server Hot-Swap Control and eFuse (Inrush, SOA, ORing)',
          description: 'The instant a card is plugged into a live 12V/48V backplane, its bulk capacitance is a short: hot-swap controllers use an external MOSFET to limit inrush and supervise faults; an eFuse integrates the whole thing. Keywords: inrush, SOA, ORing.',
          principles: 'At insertion V=12V into several mF - uncontrolled inrush reaches hundreds of amps: burnt contacts, sagged backplane, tripped rack protection. A hot-swap controller inserts an NMOS as a slow-start switch: it ramps the output at a fixed dV/dt (gate current source charging CGD) or in constant-current mode, capping inrush at the set value, while supervising UV/OV/OC and disconnecting + reporting (PMBus/GPIO) on fault. MOSFET selection is not about RDS(on) but SOA - during start-up the FET carries high VDS and high current simultaneously (linear region), so you must check the datasheet SOA curve against the ramp time with derating. An eFuse integrates FET + control + protection in one die (smaller currents, mostly 12V branches); 48V high current stays controller + discrete FETs. Parallel feeds use ORing (ideal-diode controller + MOSFET replacing the Schottky) to block back-feed and save conduction loss.',
          designNotes: ['The dV/dt setting must satisfy both low-enough inrush (backplane tolerance) and short-enough ramp (SOA survival) - they oppose each other, so size SOA first, then the slope', 'Pick linear-mode-rated FETs (SOA specified out to ~10ms); ordinary low-RDS(on) switching FETs are fragile in the linear region', 'Sense-resistor power and Kelvin connection: mΩ parts carrying full current need 4-wire sensing or the OC threshold drifts', 'Staggered pin lengths (ground first, then power, then signal) work with the controller present/short-pin detect', 'Define the fault-retry policy: hiccup with N retries vs latch-off until PMBus clear - data centers usually want telemetry + latch-off', 'ORing reverse turn-off speed (µs class) sets how deep the bus back-feeds; back-to-back FETs are needed for true bidirectional blocking'],
          commonMistakes: ['Choosing the FET on RDS(on) alone without SOA - it burns in the linear region at start-up (the classic hot-swap failure)', 'Setting dV/dt too slow - the ramp exceeds the SOA time window and burns anyway', 'No Kelvin on the sense resistor - OC trips falsely or never', 'Using a Schottky for ORing - Vf loss and heat are unacceptable at high current']
        },
        ja: {
          title: 'サーバのホットスワップ制御と eFuse（突入電流・SOA・ORing）',
          description: '通電中の 12V/48V バックプレーンにカードを挿す瞬間、バルク容量は短絡負荷になる——ホットスワップコントローラは外付け MOSFET で突入を制限し障害を監視；eFuse はそれを 1 チップに統合。キーワード：inrush、SOA、ORing。',
          principles: '挿入瞬間は 12V を数 mF に印加——無制御の突入は数百 A に達し、接点焼損・バックプレーン電圧低下・ラック保護作動を招く。ホットスワップコントローラは NMOS を「スロースタートスイッチ」として直列に入れ、固定 dV/dt（ゲート電流源が CGD を充電）または定電流モードで出力を立ち上げ、突入を設定値に抑える。同時に UV/OV/OC を監視し、障害時は遮断して報告（PMBus/GPIO）。MOSFET 選定の核心は RDS(on) ではなく SOA——起動中の FET は高 VDS と大電流を同時に負う（線形領域動作）ため、datasheet の SOA 曲線と立ち上げ時間をディレーティング込みで照合する。eFuse は FET＋制御＋保護をワンチップ化（電流小さめ、主に 12V 支線）；48V 大電流はコントローラ＋ディスクリート FET が主流。並列給電は ORing（理想ダイオードコントローラ＋MOSFET でショットキー代替）で逆流阻止と導通損削減。',
          designNotes: ['dV/dt は「突入が十分低い（バックプレーン許容）」と「立ち上げが十分短い（SOA が持つ）」を同時に満たす——相反するので、まず SOA を計算してから傾斜を決める', 'リニアモード強化品（SOA が 10ms 級まで規定）を選ぶ。普通の低 RDS(on) スイッチング FET は線形領域に弱い', 'センス抵抗の電力とケルビン接続：mΩ 級に大電流が流れるので 4 線検出でないと OC しきい値が漂う', 'ピンの長短設計（グランド先、電源後、信号最後）をコントローラの present/ショートピン検出と組み合わせる', '障害リトライ方針を決める：ヒカップ N 回か、PMBus クリアまでラッチオフか——データセンターは遙測＋ラッチオフが通例', 'ORing の逆方向遮断速度（µs 級）がバスへの逆流深さを決める。双方向遮断には背中合わせ FET が必要'],
          commonMistakes: ['RDS(on) だけで FET を選び SOA を見ない → 起動の線形領域で焼損（ホットスワップの定番故障）', 'dV/dt を遅くしすぎ → SOA の時間窓を超えてやはり焼損', 'センス抵抗にケルビンなし → OC が誤動作または不動作', 'ORing にショットキー → 大電流では Vf 損失と発熱が許容できない']
        },
        ko: {
          title: '서버 핫스왑 제어와 eFuse(돌입 전류·SOA·ORing)',
          description: '통전 중인 12V/48V 백플레인에 카드를 꽂는 순간 벌크 커패시턴스는 단락 부하——핫스왑 컨트롤러는 외부 MOSFET으로 돌입을 제한하고 고장을 감시; eFuse는 이를 단일 칩에 통합. 키워드: inrush, SOA, ORing.',
          principles: '삽입 순간 12V가 수 mF에 인가——무제어 돌입은 수백 A에 달해 접점 소손·백플레인 강하·랙 보호 작동을 유발. 핫스왑 컨트롤러는 NMOS를 슬로 스타트 스위치로 직렬 삽입: 고정 dV/dt(게이트 전류원이 CGD 충전) 또는 정전류 모드로 출력을 상승시켜 돌입을 설정값으로 제한하고, UV/OV/OC를 감시해 고장 시 차단+보고(PMBus/GPIO). MOSFET 선정의 핵심은 RDS(on)이 아니라 SOA——기동 중 FET는 높은 VDS와 대전류를 동시에 부담(선형 영역)하므로 datasheet SOA 곡선과 램프 시간을 디레이팅 포함해 대조해야 함. eFuse는 FET+제어+보호를 원칩화(전류 소용량, 주로 12V 지선); 48V 대전류는 컨트롤러+디스크리트 FET가 주류. 병렬 급전은 ORing(이상 다이오드 컨트롤러+MOSFET로 쇼트키 대체)으로 역류 차단과 도통 손실 절감.',
          designNotes: ['dV/dt 설정은 "돌입 충분히 낮게(백플레인 허용)"와 "램프 충분히 짧게(SOA 생존)"를 동시에——상반되므로 SOA 먼저 계산 후 기울기 결정', '리니어 모드 강화품(SOA 10ms급까지 규정) 선택. 일반 저 RDS(on) 스위칭 FET는 선형 영역에 취약', '감지 저항 전력과 켈빈 연결: mΩ급에 대전류가 흐르므로 4선 감지 아니면 OC 임계값 표류', '핀 장단 설계(접지 먼저, 전원 다음, 신호 마지막)를 컨트롤러의 present/짧은 핀 감지와 조합', '고장 재시도 정책 결정: 히컵 N회 vs PMBus 클리어까지 래치오프——데이터센터는 원격측정+래치오프 통례', 'ORing 역방향 차단 속도(µs급)가 버스 역류 깊이를 결정. 양방향 차단은 등맞댐 FET 필요'],
          commonMistakes: ['RDS(on)만 보고 FET 선정, SOA 무시 → 기동 선형 영역에서 소손(핫스왑 단골 고장)', 'dV/dt 너무 느리게 → SOA 시간 창 초과로 역시 소손', '감지 저항에 켈빈 없음 → OC 오동작 또는 부동작', 'ORing에 쇼트키 사용 → 대전류에서 Vf 손실과 발열 허용 불가'],
        }
      }
    },
    {
      id: 'mobile-camera-power', title: '手機相機模組電源（AVDD/DVDD/IOVDD 與上電時序）', category: 'power-management', products: ['手機'],
      description: '一顆相機模組要三到四路電源：類比 AVDD(2.8V)、數位核心 DVDD(1.05/1.2V)、介面 IOVDD(1.8V)，再加對焦馬達 AF 2.8V。時序錯了輕則條紋重則閂鎖。',
      principles: '感光元件（CIS）內部是類比像素陣列＋ADC＋MIPI 介面三塊，各吃各的電：AVDD 供像素/PGA/ADC（雜訊最敏感）、DVDD 供數位邏輯（電流最大、常由 PMIC buck 供）、IOVDD 供 MIPI/I2C IO 域。datasheet 規定上電順序（常見 IOVDD→AVDD→DVDD 或 DVDD 最後，各家不同）與各軌間最大間隔；違反可能觸發內部閂鎖或狀態機異常。手機常用「相機專用 PMIC」（多路 LDO＋1 buck，I2C 控制、內建時序）取代分散 LDO。AVDD 的電源雜訊直接乘進影像：PSRR 高的 LDO＋緊貼模組的去耦；AF 音圈馬達（VCM）是感性負載＋數百 mA 突波，與 AVDD 共軌會把對焦動作打成影像橫紋。',
      circuits: [],
      keyFormulas: ['AVDD 雜訊 → 影像條紋：行頻與雜訊頻率拍頻可見', 'LDO PSRR @ 開關頻率 決定 buck 前級殘紋抑制', 'AF VCM 突波 ~數百 mA；驅動迴路獨立供電', '時序間隔依 datasheet（常見各軌 0~數 ms 順序窗）'],
      designNotes: ['AVDD 用高 PSRR LDO 且輸入接乾淨 buck 軌，去耦電容放模組連接器 3mm 內', 'AF/OIS 驅動器獨立 2.8V，別與 AVDD 共 LDO——對焦瞬間的壓降會變成影像亮度階', 'MIPI 走線與相機電源 FPC 分層，IOVDD 域的回流路徑完整', '斷電順序同樣有規定（常為上電反序），kill switch 直接全斷會累積損傷', '多鏡頭共 PMIC 時注意「開 A 鏡頭瞬間 B 鏡頭在串流」的軌間耦合——分軌或加大去耦', 'privacy/斷電需求（實體開關）要斷在模組電源側而非只斷 I2C'],
      commonMistakes: ['DVDD/AVDD 上電順序照抄別家模組 → 新 CIS 閂鎖或初始化偶發失敗', 'AF 與 AVDD 共軌 → 對焦時影像出現橫紋/亮度跳', 'AVDD 直接掛 buck 省 LDO → 開關殘紋進影像', '斷電直接全拉 → 長期使用後模組偶發不啟動'],
      examples: [{ title: '三鏡頭手機', application: '相機 PMIC 一顆管主鏡頭 4 軌＋超廣角/長焦各 3 軌，I2C 設時序', circuit: 'PMIC(多 LDO+buck) → CIS AVDD/DVDD/IOVDD + VCM 2.8V' }],
      relatedTopics: ['mobile-pmic', 'ppg-afe', 'power-sequencing'], sourcePdf: null, createdAt: T, updatedAt: T,
      i18n: {
        en: {
          title: 'Phone Camera Module Power (AVDD/DVDD/IOVDD and Sequencing)',
          description: 'A camera module needs three or four rails: analog AVDD (2.8V), digital core DVDD (1.05/1.2V), interface IOVDD (1.8V), plus 2.8V for the AF motor. Wrong sequencing means banding at best, latch-up at worst.',
          principles: 'A CIS is three blocks - analog pixel array, ADC, MIPI interface - each on its own rail: AVDD feeds pixels/PGA/ADC (most noise-sensitive), DVDD feeds digital logic (highest current, usually a PMIC buck), IOVDD feeds the MIPI/I2C IO domain. The datasheet dictates power-up order (often IOVDD→AVDD→DVDD or DVDD last - vendors differ) and maximum gaps between rails; violations can trigger internal latch-up or a stuck state machine. Phones use a dedicated camera PMIC (several LDOs + one buck, I2C-controlled, built-in sequencing) instead of scattered LDOs. AVDD noise multiplies straight into the image, so use a high-PSRR LDO decoupled right at the module; the AF voice-coil (VCM) is an inductive load with hundreds of mA transients - sharing the AVDD rail turns focus moves into horizontal image bands.',
          designNotes: ['Feed AVDD from a high-PSRR LDO off a clean buck rail, with decoupling within 3mm of the module connector', 'Give the AF/OIS driver its own 2.8V, never share the AVDD LDO - the droop during a focus step becomes a brightness step in the image', 'Split MIPI routing from the camera-power FPC layers and keep the IOVDD return path intact', 'Power-down order is specified too (usually reverse of power-up); a kill switch that drops everything at once accumulates damage', 'With multiple cameras on one PMIC, watch rail coupling when camera A powers up while camera B is streaming - separate rails or beef up decoupling', 'A hardware privacy switch must cut the module power rails, not just the I2C'],
          commonMistakes: ['Copying another module sequencing for a new CIS - latch-up or intermittent init failures', 'Sharing AF and AVDD on one rail - focus moves produce banding/brightness jumps', 'Hanging AVDD straight off a buck to save an LDO - switching ripple prints into the image', 'Cutting all rails at once at power-down - the module intermittently fails to start after long-term use']
        },
        ja: {
          title: 'スマホカメラモジュールの電源（AVDD/DVDD/IOVDD と投入シーケンス）',
          description: 'カメラモジュールは 3～4 系統の電源が要る：アナログ AVDD(2.8V)、デジタルコア DVDD(1.05/1.2V)、インタフェース IOVDD(1.8V)、さらに AF モータ用 2.8V。シーケンスを誤ると軽くて縞、重くてラッチアップ。',
          principles: 'CIS の中身はアナログ画素アレイ＋ADC＋MIPI の 3 ブロックで、それぞれ別レール：AVDD は画素/PGA/ADC（最もノイズに敏感）、DVDD はデジタルロジック（電流最大、通常 PMIC の buck）、IOVDD は MIPI/I2C IO ドメイン。datasheet が投入順（IOVDD→AVDD→DVDD や DVDD 最後などベンダで異なる）とレール間の最大間隔を規定；違反は内部ラッチアップやステートマシン異常を招く。スマホは分散 LDO でなく「カメラ専用 PMIC」（複数 LDO＋buck、I2C 制御、シーケンサ内蔵）が主流。AVDD のノイズは映像にそのまま乗る：高 PSRR LDO＋モジュール直近のデカップリング。AF ボイスコイル（VCM）は誘導性負荷で数百 mA の過渡——AVDD と共用するとフォーカス動作が映像の横縞になる。',
          designNotes: ['AVDD は高 PSRR LDO をクリーンな buck レールから給電し、デカップリングはモジュールコネクタから 3mm 以内', 'AF/OIS ドライバは独立 2.8V。AVDD の LDO と共用しない——フォーカス時の電圧降下が映像の輝度段差になる', 'MIPI 配線とカメラ電源 FPC は層を分け、IOVDD ドメインのリターンパスを確保', '断電順序も規定あり（通常は投入の逆順）。キルスイッチで一斉断は損傷が蓄積', '複数カメラを 1 PMIC で賄う場合、「A 起動の瞬間に B がストリーミング中」のレール間結合に注意——レール分離かデカップリング増強', 'プライバシー用の物理スイッチはモジュール電源側を切る。I2C だけ切るのは不十分'],
          commonMistakes: ['他モジュールのシーケンスを新 CIS に流用 → ラッチアップや初期化の間欠不良', 'AF と AVDD を共用レールに → フォーカス時に横縞/輝度跳び', 'LDO を省いて AVDD を buck 直結 → スイッチングリップルが映像に写り込む', '断電で全レール一斉遮断 → 長期使用でモジュールが時々起動しなくなる']
        },
        ko: {
          title: '스마트폰 카메라 모듈 전원(AVDD/DVDD/IOVDD와 인가 시퀀스)',
          description: '카메라 모듈은 3~4개 레일이 필요: 아날로그 AVDD(2.8V), 디지털 코어 DVDD(1.05/1.2V), 인터페이스 IOVDD(1.8V), AF 모터용 2.8V. 시퀀스가 틀리면 가볍게는 줄무늬, 심하면 래치업.',
          principles: 'CIS는 아날로그 픽셀 어레이+ADC+MIPI 세 블록이며 각자 레일 사용: AVDD는 픽셀/PGA/ADC(노이즈에 가장 민감), DVDD는 디지털 로직(전류 최대, 보통 PMIC 벅), IOVDD는 MIPI/I2C IO 도메인. datasheet가 인가 순서(IOVDD→AVDD→DVDD 또는 DVDD 마지막 등 벤더별 상이)와 레일 간 최대 간격을 규정; 위반 시 내부 래치업이나 상태 머신 이상. 스마트폰은 분산 LDO 대신 카메라 전용 PMIC(다수 LDO+벅, I2C 제어, 시퀀서 내장)가 주류. AVDD 노이즈는 영상에 그대로 곱해짐: 고 PSRR LDO+모듈 밀착 디커플링. AF 보이스코일(VCM)은 유도성 부하에 수백 mA 과도——AVDD와 공유하면 포커스 동작이 영상 가로줄이 됨.',
          designNotes: ['AVDD는 깨끗한 벅 레일에서 고 PSRR LDO로 급전, 디커플링은 모듈 커넥터 3mm 이내', 'AF/OIS 드라이버는 독립 2.8V. AVDD LDO와 공유 금지——포커스 순간 강하가 영상 밝기 계단이 됨', 'MIPI 배선과 카메라 전원 FPC 층 분리, IOVDD 도메인 리턴 경로 확보', '단전 순서도 규정됨(보통 인가의 역순). 킬 스위치로 일괄 차단하면 손상 누적', '멀티 카메라를 한 PMIC로 커버 시 "A 기동 순간 B 스트리밍 중" 레일 간 결합 주의——레일 분리 또는 디커플링 보강', '프라이버시 물리 스위치는 모듈 전원 측을 차단해야 함. I2C만 끊는 건 불충분'],
          commonMistakes: ['다른 모듈 시퀀스를 새 CIS에 복붙 → 래치업 또는 간헐 초기화 실패', 'AF와 AVDD 공유 레일 → 포커스 시 가로줄/밝기 점프', 'LDO 아끼려 AVDD를 벅 직결 → 스위칭 리플이 영상에 인화', '단전 시 전 레일 일괄 차단 → 장기 사용 후 모듈 간헐 미기동'],
        }
      }
    },
    {
      id: 'laptop-fan-control', title: '筆電風扇控制（4 線 PWM、TACH 閉環、失速偵測）', category: 'embedded', products: ['筆電'],
      description: '筆電散熱靠 EC 管風扇：4 線風扇用 25kHz PWM 調速、TACH 回轉速做閉環；低轉速起轉、失速偵測、聲學曲線是三個實戰難點。',
      principles: '4 線風扇＝電源、地、PWM 調速輸入、TACH 轉速輸出（開汲極，每轉 2 脈衝為主流）。PWM 標準頻率 25kHz（避開可聽頻帶）；風扇內建驅動晶片依佔空比調換相電流，所以外部只送邏輯位準 PWM、不切電源線。EC（或風扇控制器如 FAN319x 級）讀溫度感測器（CPU DTS、板上熱敏、NTC）跑查表或 PI 迴路：溫度→目標轉速→PWM，TACH 回授修正。難點一：低佔空比起轉——靜止風扇需要衝轉（先 100% 數百 ms 再回目標）；難點二：失速偵測——TACH 無脈衝超時判失速，斷電重試 N 次後上報；難點三：聲學——轉速斜率限制（RPM ramp）避免「呼吸聲」，遲滯避免溫度臨界處反覆升降速。',
      circuits: [],
      keyFormulas: ['RPM = 60 × f_TACH / 每轉脈衝數（常見 2）', 'PWM 頻率 25kHz（Intel 4-wire 規範）', '風量 ∝ RPM、噪音 ∝ RPM^5~6 級（小降速大降噪）', '遲滯：升速門檻 > 降速門檻（防振盪）'],
      designNotes: ['TACH 是開汲極，上拉到 EC IO 電壓；跨電源域（風扇 5V、EC 1.8V/3.3V）注意上拉接對邊', '起轉衝轉（spin-up boost）必做：低目標轉速直接給低 PWM 會起不來，先滿速再回', '失速重試策略：斷電>1s 再試（讓驅動 IC 復位），3 次失敗上報 OS/使用者', '風扇電源 5V 軌的突波（起轉瞬間數百 mA）別跟音訊/相機共軌', 'RPM 斜率限幅（如 ±200RPM/s）+ 溫度遲滯（如 3~5°C）是安靜筆電的核心參數', '塵堵老化：同 PWM 下 RPM 逐年降，韌體可用 PWM-RPM 曲線漂移做壽命預警'],
      commonMistakes: ['低轉速直接給低 PWM 不衝轉 → 風扇停轉但韌體以為在轉（沒讀 TACH 就更慘）', 'TACH 上拉接錯電壓域 → EC 讀不到或風扇端過壓', '無遲滯無斜率限制 → 溫度臨界點風扇忽快忽慢、用戶聽得一清二楚', '失速only靠 RPM=0 判定但 TACH 線斷路沒偵測 → 過熱關機才發現'],
      examples: [{ title: '雙風扇電競本', application: 'EC 讀 CPU/GPU DTS + 3 顆板上 NTC，查表+PI 分控雙扇，斜率限幅防呼吸聲', circuit: 'EC PWM×2 → 風扇；TACH×2 → EC；NTC → EC ADC' }],
      relatedTopics: ['ec-controller', 'laptop-power-seq', 'ntc-sensing'], sourcePdf: null, createdAt: T, updatedAt: T,
      i18n: {
        en: {
          title: 'Laptop Fan Control (4-Wire PWM, TACH Loop, Stall Detection)',
          description: 'Laptop cooling lives in the EC: 4-wire fans take 25kHz PWM for speed and return TACH for closed loop. The three practical pains: low-speed spin-up, stall detection, and the acoustic curve.',
          principles: 'A 4-wire fan = power, ground, PWM input, TACH output (open-drain, typically 2 pulses per revolution). The standard PWM frequency is 25kHz (above the audible band); the fan internal driver scales the phase current by duty, so you feed a logic-level PWM and never chop the supply line. The EC (or a fan controller) reads temperature sources (CPU DTS, on-board thermistors) and runs a lookup table or PI loop: temperature → target RPM → PWM, corrected by TACH feedback. Pain one: spin-up at low duty - a stationary fan needs a boost (100% for a few hundred ms, then back to target). Pain two: stall detection - no TACH pulses within a timeout means stalled; power-cycle and retry N times, then report. Pain three: acoustics - RPM slew limiting kills the breathing sound, hysteresis stops hunting around a temperature threshold.',
          designNotes: ['TACH is open-drain - pull up to the EC IO voltage; across domains (5V fan vs 1.8/3.3V EC) put the pull-up on the correct side', 'Always implement spin-up boost: a low target straight from standstill will not start; go full speed first, then settle', 'Stall retry policy: power off >1s before retrying (lets the driver IC reset), report to the OS after 3 failures', 'The fan 5V rail sees hundreds of mA at spin-up - never share it with audio or camera rails', 'RPM slew limiting (e.g. ±200RPM/s) plus temperature hysteresis (3-5°C) are the core parameters of a quiet laptop', 'Dust and aging drop RPM at a given PWM year over year - firmware can use the PWM-RPM curve drift as an end-of-life early warning'],
          commonMistakes: ['Commanding low PWM from standstill without boost - the fan sits stalled while firmware believes it spins (worse if TACH is never read)', 'Pulling TACH up to the wrong voltage domain - the EC reads nothing or the fan pin is overstressed', 'No hysteresis or slew limit - the fan hunts audibly around the temperature threshold', 'Detecting stall only as RPM=0 without catching a broken TACH line - you find out at thermal shutdown']
        },
        ja: {
          title: 'ノート PC のファン制御（4 線 PWM・TACH 閉ループ・失速検出）',
          description: 'ノートの冷却は EC がファンを管理：4 線ファンは 25kHz PWM で調速、TACH で回転数を返して閉ループ。実戦の難所は低速起動、失速検出、音響カーブの三つ。',
          principles: '4 線ファン＝電源、グランド、PWM 入力、TACH 出力（オープンドレイン、1 回転 2 パルスが主流）。PWM 標準周波数は 25kHz（可聴帯を回避）；ファン内蔵ドライバがデューティに応じて相電流を調整するので、外部はロジックレベルの PWM を送るだけで電源線は切らない。EC（またはファンコントローラ）が温度源（CPU DTS、基板サーミスタ）を読み、テーブルか PI ループで温度→目標回転数→PWM、TACH 帰還で補正。難所その一：低デューティ起動——静止ファンにはスピンアップブースト（数百 ms 全速→目標へ戻す）が必須。その二：失速検出——タイムアウト内に TACH パルスが無ければ失速と判定、電源断→N 回リトライ→報告。その三：音響——RPM スルーレート制限で「呼吸音」を消し、ヒステリシスで温度しきい値付近のハンチングを止める。',
          designNotes: ['TACH はオープンドレイン——EC の IO 電圧へプルアップ；電源ドメインを跨ぐ場合（ファン 5V、EC 1.8/3.3V）はプルアップを正しい側に', 'スピンアップブーストは必須：静止から低目標をそのまま与えると回らない。まず全速、その後目標へ', '失速リトライ方針：>1s 断電してから再試行（ドライバ IC をリセット）、3 回失敗で OS へ報告', 'ファン 5V レールの起動突入（数百 mA）をオーディオやカメラのレールと共有しない', 'RPM スルー制限（±200RPM/s など）＋温度ヒステリシス（3～5°C）が静音ノートの核心パラメータ', 'ほこりと経年で同じ PWM でも RPM が年々低下——PWM-RPM カーブの漂移を寿命予警に使える'],
          commonMistakes: ['静止からブーストなしで低 PWM → ファンは止まったままなのにファームは回っているつもり（TACH を読まないと最悪）', 'TACH のプルアップを誤ったドメインへ → EC が読めない、またはファン側が過電圧', 'ヒステリシスもスルー制限もなし → 温度しきい値付近で回転が上下しユーザに丸聞こえ', '失速判定が RPM=0 のみで TACH 断線を検出しない → 熱シャットダウンで初めて発覚']
        },
        ko: {
          title: '노트북 팬 제어(4선 PWM·TACH 폐루프·실속 감지)',
          description: '노트북 냉각은 EC가 팬을 관리: 4선 팬은 25kHz PWM으로 조속, TACH로 회전수를 돌려받아 폐루프. 실전 난점은 저속 기동, 실속 감지, 음향 커브 세 가지.',
          principles: '4선 팬=전원, 접지, PWM 입력, TACH 출력(오픈 드레인, 회전당 2펄스가 주류). PWM 표준 주파수 25kHz(가청대 회피); 팬 내장 드라이버가 듀티에 따라 상전류를 조절하므로 외부는 로직 레벨 PWM만 보내고 전원선은 자르지 않음. EC(또는 팬 컨트롤러)가 온도원(CPU DTS, 보드 서미스터)을 읽어 테이블 또는 PI 루프: 온도→목표 RPM→PWM, TACH 피드백으로 보정. 난점 1: 저듀티 기동——정지 팬은 스핀업 부스트(수백 ms 전속 후 목표 복귀) 필수. 난점 2: 실속 감지——타임아웃 내 TACH 펄스 없으면 실속 판정, 단전 후 N회 재시도, 실패 시 보고. 난점 3: 음향——RPM 슬루 제한으로 숨소리 제거, 히스테리시스로 온도 임계 부근 헌팅 방지.',
          designNotes: ['TACH는 오픈 드레인——EC IO 전압으로 풀업; 도메인을 넘으면(팬 5V, EC 1.8/3.3V) 풀업을 올바른 쪽에', '스핀업 부스트 필수: 정지 상태에서 낮은 목표를 바로 주면 안 돎. 먼저 전속, 그 후 목표로', '실속 재시도 정책: >1s 단전 후 재시도(드라이버 IC 리셋), 3회 실패 시 OS 보고', '팬 5V 레일의 기동 돌입(수백 mA)을 오디오/카메라 레일과 공유 금지', 'RPM 슬루 제한(±200RPM/s 등)+온도 히스테리시스(3~5°C)가 조용한 노트북의 핵심 파라미터', '먼지·노화로 같은 PWM에서 RPM이 해마다 하락——PWM-RPM 곡선 표류를 수명 조기 경보로 활용'],
          commonMistakes: ['정지에서 부스트 없이 낮은 PWM → 팬은 멈춰 있는데 펌웨어는 도는 줄 앎(TACH 안 읽으면 최악)', 'TACH 풀업을 잘못된 도메인에 → EC가 못 읽거나 팬 핀 과전압', '히스테리시스·슬루 제한 없음 → 온도 임계 부근에서 팬이 오르내려 사용자에게 다 들림', '실속 판정이 RPM=0뿐, TACH 단선 미감지 → 열 셧다운에서야 발각'],
        }
      }
    }
  ];
  window.KNOWLEDGE_EXTRA = (window.KNOWLEDGE_EXTRA || []).concat(CARDS);
})();
