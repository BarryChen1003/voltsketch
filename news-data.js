/**
 * news-data.js — 硬體新技術追蹤（資料層）
 *
 * 規矩（違反就不要收進來）：
 *   1. **每一則都要有 url 與 date**，而且 date 是來源上印的日期，不是抓取日。
 *      查不到出處的不收——這站砍過兩批「內容不可驗」的東西（電路動畫、範例應用）。
 *   2. 只收「技術」：新製程、新元件、新材料、新架構、新規範、研討會/期刊發表。
 *      純財報、股價、產能擴充、人事不收（沒有工程師可以拿去用的東西）。
 *   3. summary 寫「做了什麼＋數字」，why 寫「對設計者的意義」。沒有數字的條目要想清楚還值不值得收。
 *   4. 四語齊全（硬規矩 6）。`news-i18n-check.js` 會把缺的抓出來。
 *   5. verified: true 表示我實際抓過那個 URL 並核對過內文數字；
 *      false 表示只在來源的列表頁/彙整文看到，數字未逐一核對——UI 上會標出來。
 *
 * region: US | TW | CN | KR | JP    cat: power | semi | pcb | emc | circuit
 * kind: news | paper
 *   news  = 媒體報導、廠商新聞稿、新產品、商業消息 → **每天**更新一批
 *   paper = 期刊論文、研討會/論壇發表（ISSCC、APEC、PCIM、EMC+SIPI、ECTC…）→ **每月 1 號**更新一批
 * 兩種更新的差別只在「掃什麼來源、多久掃一次」。舊條目一律不刪，頁面用分頁往後堆。
 * 流程見 NEWS-UPDATE.md。
 */
window.NEWS = [
  {
    id: 'kools-spea-tgv-plating', kind: 'news',
    date: '2026-08-23', region: 'KR', cat: 'pcb', verified: true,
    source: 'TheElec',
    url: 'https://www.thelec.net/news/articleView.html?idxno=13257',
    zh: {
      title: 'Kools 發表玻璃基板 TGV 由下而上填孔電鍍',
      summary: 'Kools 公開玻璃穿孔（TGV）金屬化技術 SPEA（Self-Propagating Electrode Architecture）：先在過孔底部形成起始電極，金屬長到哪一區、那一區就接著當電極，讓填充由下往上依序推進，避免孔口先封死而在孔內留下空洞。原文未給填充率與深寬比數字，細節由執行長曹振鉉在 2026 年 8 月 27 日水原會議中心的研討會發表。',
      why: '玻璃基板要取代有機基板，卡點就在 TGV 金屬化——孔口先長滿，孔內留下的空洞直接打到良率與可靠度。由下而上的填充若成立，玻璃基板撐得住的深寬比上限會往上走，做 2.5D/3D 封裝的人選基板時多一條路。'
    },
    en: {
      title: 'Kools shows bottom-up plating for through-glass vias',
      summary: 'Kools unveiled SPEA (Self-Propagating Electrode Architecture), a metallization method for through-glass vias: an initial electrode is formed at the bottom of the via, and each region the growing metal reaches then acts as the electrode itself, so filling proceeds bottom-up. The stated aim is to avoid pinching off the via entrance and leaving voids inside. The article gives no fill-rate or aspect-ratio figures; CEO Cho Jin-hyun presents the details at a Suwon Convention Center seminar on 27 August 2026.',
      why: 'TGV metallization is the bottleneck holding glass substrates back from replacing organic ones — if the entrance closes first, the void left inside hits yield and reliability. A working bottom-up fill raises the aspect ratio a glass substrate can carry, which adds an option when choosing substrates for 2.5D/3D packaging.'
    },
    ja: {
      title: 'Kools、ガラス基板TGVのボトムアップめっき技術を公開',
      summary: 'Koolsが貫通ガラスビア（TGV）向けメタライゼーション技術「SPEA（Self-Propagating Electrode Architecture）」を公開した。ビア底部に初期電極を形成し、金属が成長して到達した領域がそのまま電極として機能することで、充填を下から順に進める。ビア入口の目詰まりと内部ボイドの発生を抑える狙い。記事に充填率やアスペクト比の数値はなく、詳細はチョ・ジンヒョンCEOが2026年8月27日、水原コンベンションセンターのセミナーで発表する。',
      why: 'ガラス基板が有機基板を置き換えるうえでのボトルネックはTGVのメタライゼーションにある。入口が先に塞がれば内部にボイドが残り、歩留まりと信頼性に直結する。ボトムアップ充填が成立すればガラス基板が扱えるアスペクト比の上限が上がり、2.5D/3D実装の基板選定に選択肢が増える。'
    },
    ko: {
      title: 'Kools, 유리기판 TGV 바텀업 도금 기술 공개',
      summary: 'Kools가 유리관통비아(TGV) 메탈라이제이션 기술 SPEA(Self-Propagating Electrode Architecture)를 공개했다. 비아 바닥에 초기 전극을 형성하면 금속이 자라 도달한 영역이 다시 전극 역할을 해, 충전이 아래에서 위로 순차 진행된다. 비아 입구가 먼저 막혀 내부에 보이드가 생기는 것을 억제하는 것이 목표다. 기사에는 충전율이나 종횡비 수치가 없으며, 조진현 대표가 2026년 8월 27일 수원컨벤션센터 세미나에서 상세 내용을 발표한다.',
      why: '유리기판이 유기기판을 대체하는 데 걸림돌은 TGV 메탈라이제이션이다. 입구가 먼저 막히면 내부에 보이드가 남아 수율과 신뢰성에 직결된다. 바텀업 충전이 성립하면 유리기판이 감당할 수 있는 종횡비 상한이 올라가고, 2.5D/3D 패키징 기판 선정에 선택지가 늘어난다.'
    }
  },
  {
    id: 'hyundai-mobis-eis-battery-diagnostic', kind: 'news',
    date: '2026-08-22', region: 'KR', cat: 'power', verified: true,
    source: 'TheElec',
    url: 'https://www.thelec.net/news/articleView.html?idxno=13240',
    zh: {
      title: '現代摩比斯 EIS 電池診斷，熱失控預警提前 20–30 分鐘',
      summary: '現代摩比斯開發以電化學阻抗頻譜（EIS）為基礎的電動車電池管理技術，用多頻率電流訊號解析電池內部阻抗與電化學反應，比只測電壓/電流/溫度的傳統 BMS 提前 20–30 分鐘偵測熱失控徵兆。採用 ADI 車用 IC，目標 2028 年後量產，正評估導入兩款高階電動車。',
      why: '傳統 BMS 只看得到外部電氣量，內部劣化要等反映到電壓電流才抓得到。直接量測阻抗把診斷時間點往前推——電池包與 BMS IC 選型多了一個新軸線，值得留意 ADI 是否推出對應量產品項。'
    },
    en: {
      title: "Hyundai Mobis's EIS battery diagnostics catch thermal runaway 20-30 minutes earlier",
      summary: 'Hyundai Mobis is developing an EV battery management approach based on electrochemical impedance spectroscopy (EIS), applying multi-frequency current signals to read internal resistance and electrochemical reactions instead of relying only on voltage/current/temperature. It detects thermal-runaway precursors 20-30 minutes earlier than conventional BMS, uses Analog Devices automotive ICs, and targets mass production after 2028, with two high-end EV models under evaluation.',
      why: 'Conventional BMS only sees external electrical signals, so internal degradation shows up late. Measuring impedance directly pushes the detection window earlier — a new axis for battery-pack and BMS IC selection, worth watching for whether ADI ships a matching production part.'
    },
    ja: {
      title: '現代モビス、EIS電池診断で熱暴走を20〜30分早く検知',
      summary: '現代モビスは電気化学インピーダンス分光法（EIS）を用いたEVバッテリー管理技術を開発中。多周波数の電流信号で内部抵抗と電気化学反応を解析し、電圧・電流・温度のみを見る従来のBMSより熱暴走の兆候を20〜30分早く検知できる。ADI製車載ICを採用し、2028年以降の量産を目指しハイエンドEV2車種への搭載を検討中。',
      why: '従来のBMSは外部の電気量しか見えず、内部劣化の検知は後手に回る。インピーダンスを直接測ることで診断のタイミングを前倒しできる——バッテリーパックとBMS IC選定に新しい軸が生まれ、ADIが対応量産品を出すかどうか注目に値する。'
    },
    ko: {
      title: '현대모비스 EIS 배터리 진단, 열폭주 20~30분 앞서 감지',
      summary: '현대모비스가 전기화학 임피던스 분광법(EIS) 기반 EV 배터리 관리 기술을 개발 중이다. 다중 주파수 전류 신호로 내부 저항과 전기화학 반응을 분석해, 전압·전류·온도만 보는 기존 BMS보다 열폭주 징후를 20~30분 앞서 감지한다. ADI 차량용 IC를 채택했으며 2028년 이후 양산을 목표로 하이엔드 EV 2개 차종에 적용을 검토 중이다.',
      why: '기존 BMS는 외부 전기량만 보기 때문에 내부 열화 감지가 늦다. 임피던스를 직접 측정하면 진단 시점을 앞당길 수 있다 — 배터리팩과 BMS IC 선정에 새로운 축이 생기는 셈이며, ADI가 대응 양산품을 내놓을지 지켜볼 만하다.'
    }
  },
  {
    id: 'adeka-pag-euv-capacity-double', kind: 'news',
    date: '2026-08-20', region: 'JP', cat: 'semi', verified: true,
    source: 'ADEKA 新聞稿',
    url: 'https://www.adeka.co.jp/news/2026/08/260820.html',
    zh: {
      title: 'ADEKA EUV 用光酸產生劑產能翻倍，2028 年 9 月投產',
      summary: '千葉工場（千葉縣袖浦市）增設產線，投資約 10 億日圓，把光酸產生劑（PAG）產能提高到原本約 2 倍。2027 年 1 月動工、2028 年 2 月完工、2028 年 9 月商業運轉，供給體制的強化比原訂計畫提前 2 年。主力是先進世代需求看漲的聚合物結合型 PAG 單體；埼玉縣久喜市的半導體創新中心已於 2026 年 7 月正式啟用。',
      why: 'PAG 是光阻在 EUV 曝光下真正產生酸的那個成分，供給吃緊會直接反映到先進製程的產出。提前 2 年擴產代表 EUV 需求的能見度比原本估的更強——在排先進節點流片時程的人，可以把 2028 下半年當成這項材料轉寬鬆的節點。'
    },
    en: {
      title: 'ADEKA doubles EUV photoacid generator capacity, online September 2028',
      summary: 'ADEKA will add a production line at its Chiba plant (Sodegaura, Chiba) with roughly 1 billion yen of investment, raising photoacid generator (PAG) capacity to about 2x. Construction starts January 2027, completes February 2028, and commercial operation begins September 2028 — pulling the supply expansion forward by two years against the original plan. The focus is polymer-bound PAG monomer for advanced nodes. Its Semiconductor Innovation Center in Kuki, Saitama came fully online in July 2026.',
      why: 'PAG is the component of the resist that actually generates acid on EUV exposure, so a tight supply propagates straight into advanced-node output. Pulling the expansion in by two years signals stronger visibility on EUV demand than previously modelled — anyone scheduling advanced-node tape-outs can treat H2 2028 as the point where this material loosens.'
    },
    ja: {
      title: 'ADEKA、EUV向け光酸発生剤を2倍に増産、2028年9月稼働',
      summary: 'ADEKAは千葉工場（千葉県袖ケ浦市）に生産ラインを増設し、約10億円を投じて光酸発生剤（PAG）の生産能力を従来比約2倍に引き上げる。2027年1月着工、2028年2月完工、2028年9月営業運転開始で、供給体制の強化を当初計画から2年前倒しする。先端世代で需要拡大が見込まれるポリマーバウンド型のPAGモノマーが主対象。埼玉県久喜市の半導体イノベーションセンターは2026年7月に本格始動している。',
      why: 'PAGはEUV露光で実際に酸を発生させるレジストの中核材料であり、供給逼迫はそのまま先端プロセスの産出量に跳ね返る。2年前倒しは、EUV需要の見通しが従来想定より強いことの表れ。先端ノードのテープアウト計画を引く側は、2028年下期をこの材料が緩む節目として見ておける。'
    },
    ko: {
      title: 'ADEKA, EUV용 광산발생제 생산능력 2배… 2028년 9월 가동',
      summary: 'ADEKA가 지바 공장(지바현 소데가우라시)에 생산 라인을 증설해 약 10억 엔을 투자, 광산발생제(PAG) 생산능력을 기존 대비 약 2배로 늘린다. 2027년 1월 착공, 2028년 2월 완공, 2028년 9월 상업 운전 개시로 공급 체계 강화를 당초 계획보다 2년 앞당긴다. 선단 세대에서 수요 확대가 예상되는 폴리머 결합형 PAG 모노머가 주 대상이며, 사이타마현 구키시의 반도체 이노베이션 센터는 2026년 7월 본격 가동에 들어갔다.',
      why: 'PAG는 EUV 노광에서 실제로 산을 발생시키는 레지스트의 핵심 재료라, 공급 경색이 그대로 선단 공정 산출량으로 이어진다. 2년 앞당긴 증설은 EUV 수요 가시성이 기존 전망보다 강하다는 신호다. 선단 노드 테이프아웃 일정을 짜는 쪽은 2028년 하반기를 이 재료가 풀리는 분기점으로 봐 둘 만하다.'
    }
  },
  {
    id: 'tierIV-open-source-av-ai-chip', kind: 'news',
    date: '2026-08-17', region: 'JP', cat: 'semi', verified: true,
    source: 'レスポンス（Response）',
    url: 'https://response.jp/article/2026/08/17/415313.html',
    zh: {
      title: 'Tier IV 要把自駕 AI 晶片的設計資產與工具鏈開源',
      summary: 'Tier IV 參與 JST「次世代邊緣 AI 半導體研究開發事業」，負責端到端（E2E）自駕 AI 推論晶片的邏輯設計，目標把設計資產連同編譯器等工具鏈一起開源。晶片對應該公司主導的開源自駕軟體 Autoware，定位是滿足 L4 所需的功耗、即時性與安全性、且不綁特定硬體的「軟體定義 SoC」。研究課題由東京大學川原圭博教授主持。製程節點與效能數字未公布。',
      why: '車用 AI 推論晶片現在幾乎清一色是封閉的供應商平台，選了哪家就連工具鏈一起綁死。設計資產加編譯器一起開源，等於第一次讓自駕系統商有機會自己改推論管線、甚至自行流片——評估 L4 平台時多了一個不被鎖住的選項。'
    },
    en: {
      title: 'Tier IV to open-source its autonomous-driving AI chip design and toolchain',
      summary: 'Tier IV has joined JST next-generation edge AI semiconductor programme, taking on the logic design of an AI chip for end-to-end autonomous-driving inference, and aims to open-source the design assets together with the compiler and surrounding toolchain. The chip targets Autoware, the open-source autonomous-driving stack Tier IV leads, and is positioned as a hardware-independent "software-defined SoC" meeting Level 4 power, real-time and safety constraints. The research theme is led by Professor Yoshihiro Kawahara of the University of Tokyo. No process node or performance figures were disclosed.',
      why: 'Automotive AI inference silicon is almost entirely closed vendor platforms today, and picking one locks in its toolchain. Open-sourcing the design assets alongside the compiler would, for the first time, let an AV integrator rework the inference pipeline itself or even tape out its own part — a non-locked-in option to weigh when evaluating a Level 4 platform.'
    },
    ja: {
      title: 'ティアフォー、自動運転AIチップの設計とツールチェーンをオープンソース化へ',
      summary: 'ティアフォーはJST「次世代エッジAI半導体研究開発事業」に参画し、エンドツーエンド（E2E）自動運転AIの推論処理を担うAIチップの論理設計を担当する。設計資産とコンパイラなどのツールチェーンのオープンソース化を目指す。対象は同社が開発を主導するオープンソース自動運転ソフトウェア「Autoware」で、レベル4に必要な電力制約・リアルタイム性・安全性を満たしつつハードウェアに依存しない「ソフトウェア定義型SoC」と位置付ける。研究開発課題は東京大学の川原圭博教授が代表。プロセスノードや性能の数値は非公表。',
      why: '車載AI推論チップは現状ほぼ閉じたベンダープラットフォームで、選んだ時点でツールチェーンごと固定される。設計資産をコンパイラと合わせて公開すれば、自動運転システム側が推論パイプラインを自ら手直しし、場合によっては自前でテープアウトする道が初めて開く。レベル4プラットフォームの評価に、ベンダーロックインしない選択肢が加わる。'
    },
    ko: {
      title: '티어포, 자율주행 AI 칩 설계와 툴체인 오픈소스화 추진',
      summary: '티어포가 JST의 차세대 엣지 AI 반도체 연구개발사업에 참여해 엔드투엔드(E2E) 자율주행 AI 추론용 칩의 논리 설계를 맡고, 설계 자산과 컴파일러 등 툴체인의 오픈소스화를 목표로 한다. 대상은 티어포가 개발을 주도하는 오픈소스 자율주행 소프트웨어 Autoware이며, 레벨 4에 필요한 전력 제약·실시간성·안전성을 만족하면서 하드웨어에 의존하지 않는 "소프트웨어 정의 SoC"로 규정한다. 연구 과제는 도쿄대 가와하라 요시히로 교수가 대표를 맡는다. 공정 노드나 성능 수치는 공개되지 않았다.',
      why: '차량용 AI 추론 칩은 현재 대부분 폐쇄형 벤더 플랫폼이라, 선택하는 순간 툴체인까지 묶인다. 설계 자산을 컴파일러와 함께 공개하면 자율주행 시스템 업체가 직접 추론 파이프라인을 손보거나 자체 테이프아웃까지 시도할 길이 처음 열린다. 레벨 4 플랫폼 평가에 벤더 종속되지 않는 선택지가 하나 늘어난다.'
    }
  },
  {
    id: 'itri-48v-ivr-microfluidic', kind: 'paper',
    date: '2026-08-03', region: 'TW', cat: 'power', verified: true,
    source: 'TechNews 科技新報',
    url: 'https://technews.tw/2026/08/03/itri-%E2%80%8B%E2%80%8Bunveils-groundbreaking-high-efficiency-power-conversion-and-microfluidic-heat-dissipation-technologies/',
    zh: {
      title: '工研院 48V 單級直降 1V，峰值效率 93.6%',
      summary: '48V IVR 單級轉換直接降到 1V，峰值效率 93.6%、功率密度 1,037 W/in³，開關頻率 50–100MHz 走 ZVS/ZCS。同場發表 TIM-less 仿生微流道上蓋，散熱效率 3 倍、峰值溫度降 65%。2026 台日半導體技術論壇。',
      why: '傳統 48V→12V→1V 兩級轉換的損耗與面積都在中間那級。單級直降若能量產，板上配電與 VRM 佈局會整個重畫；微流道則是把散熱從封裝外搬進蓋子裡。'
    },
    en: {
      title: 'ITRI: single-stage 48V-to-1V at 93.6% peak efficiency',
      summary: 'A 48V integrated voltage regulator steps straight down to 1V at 93.6% peak efficiency and 1,037 W/in³, switching at 50–100MHz with ZVS/ZCS. Shown alongside a TIM-less bionic microfluidic lid claiming 3x cooling efficiency and a 65% lower peak temperature. 2026 Taiwan-Japan Semiconductor Technology Forum.',
      why: 'The loss and the board area in a classic 48V→12V→1V chain sit in that middle stage. A production-ready single-stage conversion redraws board power distribution and VRM placement; the microfluidic lid moves cooling from outside the package into the lid itself.'
    },
    ja: {
      title: 'ITRI、48V から 1V への単段変換でピーク効率 93.6%',
      summary: '48V IVR が 1V まで単段で降圧し、ピーク効率 93.6%、電力密度 1,037 W/in³、スイッチング 50–100MHz で ZVS/ZCS。同時に TIM レスのバイオミメティック微細流路リッド（冷却効率 3 倍、ピーク温度 65% 低減）を発表。2026 台日半導体技術フォーラム。',
      why: '従来の 48V→12V→1V 二段構成では、損失も基板面積も中間段に集中する。単段化が量産に乗れば基板の配電と VRM 配置が根本から変わる。微細流路は放熱をパッケージ外からリッド内部へ移す試み。'
    },
    ko: {
      title: 'ITRI, 48V→1V 단단 변환으로 최대 효율 93.6%',
      summary: '48V IVR가 1V까지 단일 단계로 강압하며 최대 효율 93.6%, 전력 밀도 1,037 W/in³, 스위칭 50–100MHz에 ZVS/ZCS 적용. 함께 공개한 TIM 없는 생체모방 마이크로플루이딕 리드는 냉각 효율 3배, 피크 온도 65% 감소를 제시. 2026 대만-일본 반도체 기술 포럼.',
      why: '기존 48V→12V→1V 2단 구성은 손실과 기판 면적이 중간 단에 몰린다. 단단 변환이 양산되면 기판 배전과 VRM 배치가 통째로 바뀐다. 마이크로플루이딕은 방열을 패키지 밖에서 리드 안으로 옮기는 시도.'
    }
  },
  {
    id: 'rohm-rtd-thz-gen2', kind: 'news',
    date: '2026-08-05', region: 'JP', cat: 'semi', verified: true,
    source: 'TheElec',
    url: 'https://www.thelec.net/news/articleView.html?idxno=12821',
    zh: {
      title: 'ROHM 第二代 RTD 兆赫波振盪器，輸出提高 4 倍',
      summary: '共振穿隧二極體（RTD）振盪晶片維持 0.5×0.5mm 尺寸，重新設計內部結構後輸出達 40µW，是第一代的 4 倍，室溫工作、不需雷射等大型光學系統。RTD-EVK-G2 評估套件 2026 年 8 月開賣，35 萬日圓。',
      why: '兆赫波過去卡在光源又大又貴。0.5mm 見方、室溫工作的振盪器讓非破壞檢測、含水量量測這類應用有機會做進手持設備。'
    },
    en: {
      title: 'ROHM doubles down on terahertz: 4x output from a 0.5mm RTD oscillator',
      summary: 'The second-generation resonant-tunnelling-diode oscillator keeps the same 0.5mm × 0.5mm die but reaches 40µW output, four times the first generation, running at room temperature without laser-based optics. The RTD-EVK-G2 evaluation kit went on sale in August 2026 at ¥350,000.',
      why: 'Terahertz work has been gated by bulky, expensive sources. A room-temperature oscillator in half a millimetre square puts non-destructive inspection and moisture measurement within reach of handheld instruments.'
    },
    ja: {
      title: 'ROHM、第 2 世代 RTD テラヘルツ発振器で出力 4 倍',
      summary: '共鳴トンネルダイオード（RTD）発振チップは 0.5mm×0.5mm のまま内部構造を再設計し、出力 40µW と第 1 世代の 4 倍を実現。レーザーなど大型光学系なしで室温動作する。評価キット RTD-EVK-G2 は 2026 年 8 月発売、35 万円。',
      why: 'テラヘルツ応用は光源が大きく高価な点がボトルネックだった。0.5mm 角・室温動作の発振器なら、非破壊検査や含水率測定をハンドヘルド機器に入れられる。'
    },
    ko: {
      title: 'ROHM, 2세대 RTD 테라헤르츠 발진기 출력 4배',
      summary: '공진 터널 다이오드(RTD) 발진 칩은 0.5mm×0.5mm 크기를 유지하면서 내부 구조를 재설계해 출력 40µW로 1세대의 4배를 달성했다. 레이저 같은 대형 광학계 없이 상온에서 동작한다. 평가 키트 RTD-EVK-G2는 2026년 8월 35만 엔에 출시.',
      why: '테라헤르츠 응용은 광원이 크고 비싸다는 점이 병목이었다. 0.5mm 각, 상온 동작 발진기라면 비파괴 검사나 수분 측정을 휴대형 장비에 넣을 수 있다.'
    }
  },
  {
    id: 'hioki-current-probe-10x', kind: 'news',
    date: '2026-07-13', region: 'JP', cat: 'power', verified: true,
    source: 'EE Times Japan',
    url: 'https://eetimes.itmedia.co.jp/ee/articles/2607/13/news078.html',
    zh: {
      title: 'HIOKI 新電流量測方式，精度約 10 倍',
      summary: '新的高精度電流量測法在 200kHz 以下不確定度 0.006%、1MHz 以下 0.014%，較既有方式約提高 10 倍精度。針對 EV 馬達與資料中心電源這類高頻大電流的量測。',
      why: '效率量測的誤差幾乎都來自電流那一路。宣稱 1MHz 內 0.014%，代表 GaN/SiC 高頻轉換器的效率差異第一次量得出來，不會被儀器誤差蓋掉。'
    },
    en: {
      title: 'HIOKI claims ~10x better current-measurement accuracy',
      summary: 'A new high-accuracy current measurement method reports 0.006% uncertainty up to 200kHz and 0.014% up to 1MHz — roughly ten times the accuracy of the conventional approach. Aimed at EV motors and data-centre power supplies.',
      why: 'Efficiency measurements live or die on the current path. 0.014% out to 1MHz means the efficiency deltas between GaN and SiC converters are finally larger than the instrument error.'
    },
    ja: {
      title: '日置電機、電流測定の確度を約 10 倍に',
      summary: '新しい高確度電流測定方式は 200kHz までで不確かさ 0.006%、1MHz までで 0.014% を実現し、従来方式比で約 10 倍の確度という。EV モーターやデータセンター電源など高周波・大電流の測定が対象。',
      why: '効率測定の誤差はほぼ電流側で決まる。1MHz で 0.014% なら、GaN/SiC 高周波コンバータの効率差が測定器の誤差に埋もれずに見えるようになる。'
    },
    ko: {
      title: 'HIOKI, 전류 측정 정확도 약 10배 향상',
      summary: '새 고정밀 전류 측정 방식은 200kHz까지 불확도 0.006%, 1MHz까지 0.014%로 기존 방식 대비 약 10배 정확도라고 밝혔다. EV 모터와 데이터센터 전원 같은 고주파·대전류 측정이 대상.',
      why: '효율 측정 오차는 대부분 전류 경로에서 나온다. 1MHz에서 0.014%면 GaN/SiC 고주파 컨버터의 효율 차이가 계측기 오차에 묻히지 않는다.'
    }
  },
  {
    id: 'tsmc-a13-a12-n2u', kind: 'news',
    date: '2026-04', region: 'TW', cat: 'semi', verified: true,
    source: 'TSMC 官方新聞稿',
    url: 'https://pr.tsmc.com/english/news/3302',
    zh: {
      title: '台積電端出 A13／A12／N2U，路線圖推到 2029',
      summary: 'A13、A12 為 1.3nm 與 1.2nm 級製程，皆規劃 2029 年量產，是 A14（2028）的衍生節點；A12 導入 Super Power Rail 背面供電。N2U 排 2028 年，靠 DTCO 較 N2P 速度增 3–4% 或功耗降 8–10%、邏輯密度 1.02–1.03 倍。台積電同時改成「消費級每年一節點、AI/HPC 每兩年一節點」。',
      why: '節點名稱之外，真正要看的是 A12 的背面供電：供電從正面搬到背面，電源網路與訊號繞線的規則會跟著改，做 IP 與 layout 的人要提早準備。'
    },
    en: {
      title: 'TSMC adds A13, A12 and N2U, extending the roadmap to 2029',
      summary: 'A13 and A12 are 1.3nm- and 1.2nm-class nodes, both targeted at 2029 production as derivatives of A14 (2028); A12 brings Super Power Rail backside power delivery. N2U lands in 2028, using design-technology co-optimisation for 3–4% more speed or 8–10% less power than N2P, plus 1.02–1.03x logic density. TSMC also moved to a new cadence: a client node every year, an AI/HPC node every two.',
      why: 'The node names matter less than backside power on A12. Moving delivery to the back of the wafer changes power-grid and routing rules, and IP and layout teams need lead time for that.'
    },
    ja: {
      title: 'TSMC、A13／A12／N2U を追加しロードマップを 2029 年まで延長',
      summary: 'A13 と A12 は 1.3nm／1.2nm 級で、いずれも 2029 年量産を目標とする A14（2028 年）の派生ノード。A12 は Super Power Rail による裏面電源供給を導入する。N2U は 2028 年で、DTCO により N2P 比で速度 3–4% 向上または消費電力 8–10% 低減、ロジック密度 1.02–1.03 倍。コンシューマ向けは毎年、AI/HPC 向けは 2 年ごとに新ノードという方針も示した。',
      why: 'ノード名より重要なのは A12 の裏面電源供給。給電を裏面に移すと電源網と配線のルールが変わるため、IP とレイアウトの担当は早めの準備が要る。'
    },
    ko: {
      title: 'TSMC, A13·A12·N2U 추가하며 로드맵을 2029년까지 확장',
      summary: 'A13과 A12는 1.3nm·1.2nm급 공정으로 모두 2029년 양산을 목표로 하는 A14(2028년)의 파생 노드이며, A12는 Super Power Rail 후면 전력 공급을 도입한다. N2U는 2028년으로 DTCO를 통해 N2P 대비 속도 3–4% 향상 또는 전력 8–10% 절감, 로직 밀도 1.02–1.03배. 소비자용은 매년, AI/HPC용은 2년마다 새 노드를 내는 주기도 공개했다.',
      why: '노드 이름보다 중요한 것은 A12의 후면 전력 공급이다. 급전이 뒷면으로 가면 전원망과 배선 규칙이 바뀌므로 IP와 레이아웃 팀은 준비 기간이 필요하다.'
    }
  },
  {
    id: 'navitas-pcim-2026', kind: 'paper',
    date: '2026-05-18', region: 'US', cat: 'power', verified: true,
    source: 'GlobeNewswire（Navitas 新聞稿）',
    url: 'https://www.globenewswire.com/news-release/2026/05/18/3296623/0/en/navitas-to-showcase-breakthrough-gan-and-sic-based-solutions-for-ai-data-center-energy-and-grid-infrastructure-and-industrial-electrification-at-pcim-2026.html',
    zh: {
      title: 'Navitas 在 PCIM 2026 展出 GaN／SiC 全線',
      summary: 'GaNFast FET 從 100V／0.8mΩ 到 650V／11mΩ，另有 GaNSafe、GaNSlim 與雙向 GaN IC；SiC 端是 3300V／2300V／1200V 的 Trench Assisted Planar（TAP）元件，採 SiCPAK 壓接模組，以及第 5 代 GeneSiC TAP MOSFET（QDPAK、TO247-LP）。',
      why: '雙向 GaN IC 與壓接封裝是兩個要盯的點：前者讓儲能與車載充電少一組開關，後者是為了在高溫循環下不靠焊錫。'
    },
    en: {
      title: 'Navitas brings its full GaN and SiC line to PCIM 2026',
      summary: 'GaNFast FETs from 0.8mΩ at 100V to 11mΩ at 650V, plus GaNSafe, GaNSlim and bidirectional GaN ICs. On the SiC side, 3300V, 2300V and 1200V Trench Assisted Planar devices in SiCPAK press-fit modules, and 5th-generation GeneSiC TAP MOSFETs in QDPAK and TO247-LP.',
      why: 'Two things to watch: bidirectional GaN ICs remove a switch pair from storage and onboard-charger topologies, and press-fit modules exist to avoid solder joints under hard thermal cycling.'
    },
    ja: {
      title: 'Navitas、PCIM 2026 で GaN／SiC の全ラインを展示',
      summary: 'GaNFast FET は 100V／0.8mΩ から 650V／11mΩ まで、加えて GaNSafe、GaNSlim、双方向 GaN IC。SiC 側は 3300V／2300V／1200V の Trench Assisted Planar（TAP）デバイスを SiCPAK プレスフィットモジュールで、さらに第 5 世代 GeneSiC TAP MOSFET（QDPAK、TO247-LP）。',
      why: '注目点は 2 つ。双方向 GaN IC は蓄電・車載充電のトポロジからスイッチを 1 組減らせる。プレスフィットは厳しい熱サイクル下ではんだ接合を避けるための封止。'
    },
    ko: {
      title: 'Navitas, PCIM 2026에서 GaN·SiC 전 라인 공개',
      summary: 'GaNFast FET는 100V/0.8mΩ부터 650V/11mΩ까지, 여기에 GaNSafe·GaNSlim·양방향 GaN IC를 더했다. SiC 쪽은 3300V/2300V/1200V Trench Assisted Planar 소자를 SiCPAK 프레스핏 모듈로, 5세대 GeneSiC TAP MOSFET은 QDPAK·TO247-LP로 제공한다.',
      why: '주목할 점 둘: 양방향 GaN IC는 ESS와 OBC 토폴로지에서 스위치 한 쌍을 줄이고, 프레스핏 모듈은 가혹한 열 사이클에서 솔더 접합을 피하려는 선택이다.'
    }
  },
  {
    id: 'navitas-magnachip-sic-license', kind: 'news',
    date: '2026-07', region: 'KR', cat: 'power', verified: false,
    source: 'Power Electronics News（Wide Bandgap Monthly Insights, 2026-07）',
    url: 'https://www.powerelectronicsnews.com/wide-bandgap-monthly-insights-july-2026/',
    zh: {
      title: 'Magnachip 取得 Navitas GeneSiC TAP 技術授權',
      summary: 'Magnachip 取得 Navitas 的 GeneSiC Trench-Assisted Planar 技術授權，涵蓋 1200V、2300V、3300V 及更高電壓，用於高壓與超高壓電力轉換。',
      why: '高壓 SiC 的供應商一直集中在少數幾家。多一條授權產線代表 1200V 以上的料源選擇會變多，做電網與工業驅動的可以開始評估第二來源。'
    },
    en: {
      title: 'Magnachip licenses Navitas GeneSiC TAP technology',
      summary: 'Magnachip has licensed Navitas\' GeneSiC Trench-Assisted Planar technology for 1200V, 2300V, 3300V and above, aimed at high- and ultra-high-voltage power conversion.',
      why: 'High-voltage SiC supply has been concentrated in a handful of vendors. Another licensed line means more sourcing options above 1200V — worth a second-source evaluation for grid and industrial drives.'
    },
    ja: {
      title: 'Magnachip、Navitas の GeneSiC TAP 技術をライセンス',
      summary: 'Magnachip が Navitas の GeneSiC Trench-Assisted Planar 技術を 1200V／2300V／3300V 以上でライセンス取得。高圧・超高圧の電力変換向け。',
      why: '高耐圧 SiC の供給元は数社に偏っていた。ライセンス生産が増えれば 1200V 超の調達先が広がり、系統・産業用ドライブではセカンドソース検討の余地が出る。'
    },
    ko: {
      title: '매그나칩, 나비타스 GeneSiC TAP 기술 라이선스 확보',
      summary: '매그나칩이 나비타스의 GeneSiC Trench-Assisted Planar 기술을 1200V·2300V·3300V 이상 전압대로 라이선스했다. 고압·초고압 전력 변환이 대상.',
      why: '고전압 SiC 공급은 소수 업체에 몰려 있었다. 라이선스 생산이 늘면 1200V 이상 조달처가 넓어져 계통·산업용 드라이브에서 세컨드 소스 검토가 가능해진다.'
    }
  },
  {
    id: 'adi-empower-close', kind: 'news',
    date: '2026-07-09', region: 'US', cat: 'power', verified: false,
    source: 'TheElec',
    url: 'https://www.thelec.net/news/articleView.html?idxno=12085',
    zh: {
      title: 'ADI 完成收購 Empower Semiconductor',
      summary: 'ADI 完成對 Empower Semiconductor 的收購，補強 AI 用電源產品線。Empower 的主力是整合式電壓調節器（IVR）與矽電容。',
      why: '大廠買 IVR 公司是個訊號：算力晶片的供電正在往「調節器搬進封裝裡」走，板上 VRM 的角色會被重新切分。'
    },
    en: {
      title: 'ADI closes its acquisition of Empower Semiconductor',
      summary: 'Analog Devices completed the acquisition of Empower Semiconductor, expanding its AI power portfolio. Empower is known for integrated voltage regulators and silicon capacitors.',
      why: 'A large analog vendor buying an IVR house is a signal: compute power delivery is moving the regulator into the package, which re-cuts what the board-level VRM is for.'
    },
    ja: {
      title: 'ADI、Empower Semiconductor の買収を完了',
      summary: 'アナログ・デバイセズが Empower Semiconductor の買収を完了し、AI 向け電源ポートフォリオを強化した。Empower は集積型電圧レギュレータ（IVR）とシリコンキャパシタを得意とする。',
      why: '大手アナログメーカーが IVR 企業を買うのは兆候だ。演算チップの給電はレギュレータをパッケージ内に取り込む方向へ動いており、基板側 VRM の役割分担が変わる。'
    },
    ko: {
      title: 'ADI, Empower Semiconductor 인수 완료',
      summary: '아날로그디바이스가 Empower Semiconductor 인수를 마무리하며 AI 전원 포트폴리오를 강화했다. Empower는 집적 전압 레귤레이터(IVR)와 실리콘 커패시터가 주력이다.',
      why: '대형 아날로그 업체가 IVR 회사를 사들이는 건 신호다. 연산 칩 급전이 레귤레이터를 패키지 안으로 넣는 방향으로 가면서 보드 VRM의 역할이 재편된다.'
    }
  },
  {
    id: 'tsmc-cowos-roadmap-2029', kind: 'news',
    date: '2026-04', region: 'TW', cat: 'pcb', verified: false,
    source: "Tom's Hardware",
    url: 'https://www.tomshardware.com/tech-industry/semiconductors/tsmcs-details-next-gen-cowos-roadmap-over-14-reticle-packages-and-48x-leap-in-compute-power-expected-by-2029-massive-size-enables-24-hbm5e-stacks-and-additional-memory-bandwidth-jump',
    zh: {
      title: '台積電 CoWoS 路線圖：2029 年封裝面積超過 14 倍光罩',
      summary: '下一代 CoWoS 規劃把封裝做到 14 倍光罩尺寸以上，可容納 24 顆 HBM5E 堆疊，並宣稱 2029 年前算力提升 48 倍。',
      why: '封裝越大，翹曲、應力與電源完整性就越難。板端要面對的是更大的 BGA、更嚴的共平面度，以及供電從板子灌進封裝的電流密度。'
    },
    en: {
      title: 'TSMC CoWoS roadmap: packages beyond 14 reticles by 2029',
      summary: 'Next-generation CoWoS is planned to exceed 14-reticle package sizes, hosting up to 24 HBM5E stacks, with a claimed 48x compute increase by 2029.',
      why: 'Bigger packages make warpage, stress and power integrity harder. At board level that means larger BGAs, tighter coplanarity, and far higher current density feeding the package.'
    },
    ja: {
      title: 'TSMC の CoWoS ロードマップ：2029 年にレチクル 14 枚超のパッケージ',
      summary: '次世代 CoWoS はレチクル 14 枚を超えるパッケージサイズを計画し、HBM5E を最大 24 スタック搭載、2029 年までに演算性能 48 倍を掲げる。',
      why: 'パッケージが大きくなるほど反り・応力・電源整合性が厳しくなる。基板側では BGA の大型化、平坦度要求の厳格化、そしてパッケージへ流し込む電流密度が問題になる。'
    },
    ko: {
      title: 'TSMC CoWoS 로드맵: 2029년 레티클 14장 초과 패키지',
      summary: '차세대 CoWoS는 레티클 14장을 넘는 패키지 크기를 계획하며 HBM5E를 최대 24스택 탑재하고, 2029년까지 연산 성능 48배를 제시한다.',
      why: '패키지가 커질수록 휨·응력·전원 무결성이 어려워진다. 보드 쪽에서는 더 큰 BGA, 더 엄격한 평탄도, 그리고 패키지로 흘려보내는 전류 밀도가 문제가 된다.'
    }
  },
  {
    id: 'emc-sipi-2026-dallas', kind: 'paper',
    date: '2026-08-03', region: 'US', cat: 'emc', verified: true,
    source: 'IEEE EMC+SIPI 2026',
    url: 'https://2026.emcsipi.org/',
    zh: {
      title: 'IEEE EMC+SIPI 2026：8/3–8/7 達拉斯',
      summary: '今年技術議程集中在 PCB 與晶片級 EMC、軍規與太空 EMC、資料中心與高速數位，以及用 AI／ML 做模擬與量測。四個特別場次：AI 輔助電源完整性、應用型 AI agent、醫材安全，以及針對電磁洩漏與干擾的資訊安全。',
      why: '「晶片級 EMC」與「電磁資訊安全」進主議程值得注意——EMC 的戰場正從機殼與線束往封裝內部移。'
    },
    en: {
      title: 'IEEE EMC+SIPI 2026: Dallas, August 3–7',
      summary: 'This year\'s programme centres on PCB- and chip-level EMC, military and space EMC, data-centre and high-speed digital work, and AI/ML for simulation and measurement. Four special sessions cover power integrity with AI, AI agents in applications, medical device safety, and electromagnetic information security against leakage and interference.',
      why: 'Chip-level EMC and electromagnetic information security moving into the main programme is the signal: the EMC battleground is shifting from enclosures and harnesses into the package.'
    },
    ja: {
      title: 'IEEE EMC+SIPI 2026：8/3–8/7、ダラス',
      summary: '今年の技術プログラムは基板・チップレベル EMC、軍事・宇宙 EMC、データセンターと高速デジタル、AI／ML による解析と測定が中心。特別セッションは AI を用いた電源整合性、応用向け AI エージェント、医療機器の安全性、電磁的な情報漏えい・妨害に対するセキュリティの 4 本。',
      why: '「チップレベル EMC」と「電磁情報セキュリティ」が本会議に入ったことが重要。EMC の主戦場が筐体やハーネスからパッケージ内部へ移りつつある。'
    },
    ko: {
      title: 'IEEE EMC+SIPI 2026: 8월 3–7일, 댈러스',
      summary: '올해 프로그램은 PCB·칩 레벨 EMC, 군사·우주 EMC, 데이터센터와 고속 디지털, AI/ML 기반 해석과 측정에 집중한다. 특별 세션은 AI를 활용한 전원 무결성, 응용 AI 에이전트, 의료기기 안전, 전자기 정보 유출·간섭 대응 보안 네 가지.',
      why: '칩 레벨 EMC와 전자기 정보 보안이 본 프로그램에 들어온 것이 신호다. EMC의 주 전장이 케이스와 하네스에서 패키지 내부로 옮겨가고 있다.'
    }
  },
  {
    id: 'cn-cmp-advanced-packaging-forum', kind: 'paper',
    date: '2026-07-29', region: 'CN', cat: 'pcb', verified: false,
    source: '艾邦半導體網',
    url: 'https://www.ab-sm.com/a/date/2026/07',
    zh: {
      title: '首屆 CMP 與先進封裝材料論壇，7/29–30 蘇州',
      summary: '首屆 CMP 與先進封裝材料論壇於 2026 年 7 月 29–30 日在蘇州舉行，長電科技、鼎龍股份、博來納潤、銳傑微等企業與研究機構發表。',
      why: 'CMP 研磨液與封裝材料是先進封裝的瓶頸環節之一。這類材料論壇的議程通常比產品發表更早透露量產排程。'
    },
    en: {
      title: 'First CMP and advanced packaging materials forum, Suzhou, 29–30 July',
      summary: 'The inaugural CMP and Advanced Packaging Materials Forum ran on 29–30 July 2026 in Suzhou, with presentations from JCET, Dinglong, Brainstorm and Ruijie Micro among others.',
      why: 'CMP slurries and packaging materials are one of the real bottlenecks in advanced packaging. Materials forums usually reveal production timelines earlier than product launches do.'
    },
    ja: {
      title: '第 1 回 CMP・先端パッケージ材料フォーラム、7/29–30 蘇州',
      summary: '第 1 回 CMP・先端パッケージング材料フォーラムが 2026 年 7 月 29–30 日に蘇州で開催され、JCET（長電科技）、鼎龍股份、博来納潤、鋭傑微などの企業・研究機関が講演した。',
      why: 'CMP スラリーと封止材料は先端パッケージのボトルネックのひとつ。材料系フォーラムの議題は、製品発表より早く量産時期を示すことが多い。'
    },
    ko: {
      title: '제1회 CMP·첨단 패키징 소재 포럼, 7/29–30 쑤저우',
      summary: '제1회 CMP 및 첨단 패키징 소재 포럼이 2026년 7월 29–30일 쑤저우에서 열렸고 JCET(창뎬커지), 딩룽, 브레인스톰, 루이제웨이 등 기업·연구기관이 발표했다.',
      why: 'CMP 슬러리와 패키징 소재는 첨단 패키징의 실질적 병목 중 하나다. 소재 포럼 의제는 제품 발표보다 먼저 양산 일정을 드러내는 경우가 많다.'
    }
  }
];
