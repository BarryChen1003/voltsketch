/**
 * knowledge-extra5.js — DC/DC 降壓轉換器 PCB 佈局（7 卡）
 * 資料來源：ROHM《DC/DC Buck Converter PCB Layout Basics》Hand Book，文件編號 TWHB-03e-001（2021）。
 * 內容為依該手冊整理改寫的工程重點與數字（非原文轉載）；每張卡的 designNotes 註明出處章節。
 * 併入方式同 extra2/3/4：concat 進 window.KNOWLEDGE_EXTRA，由 knowledge.js getSampleData() 吃入。
 * 圖：knowledge-circuits2.js 內對應同名 id。
 */
(function () {
  var SRC = 'ROHM 應用手冊 TWHB-03e';
  var CARDS = [];

  CARDS.push({
    "id": "buck-layout-current-loops",
    "title": "降壓轉換器的電流路徑與「差集迴路」（佈局第一原理）",
    "category": "pcb-design",
    "products": ["通用"],
    "description": "把開關 ON 與 OFF 兩張電流圖相減，剩下的那一圈就是每次切換都在突變的高 di/dt 迴路。佈局的優先權全部給它，其餘才輪得到。",
    "principles": "開關 Q1 導通的瞬間電流陡升，但這股電流主要由高頻去耦電容 CBYPASS 供應，接著才是大容值的 CIN，輸入電源本身只提供變化平緩的部分。Q1 關斷後二極體 D1 導通，電感把儲存的能量放到輸出端。把這兩張圖相減，差集就是「每次切換電流都會突然反轉」的那一段——CIN/CBYPASS 到開關、到二極體、再回到 CIN 的這一圈。這段電流波形含大量諧波，同時是雜訊源與振鈴源，所以佈局要先把它的面積壓到最小。輸出側因為電感串在路徑上，電流是平滑的漲落，優先權比較低。ROHM 手冊列出的佈局原則全部由此推導：輸入電容與二極體必須與 IC 同面且盡量靠近，電感其次但也要近，銅面不要大過需要，輸出電容靠電感，回授遠離電感與二極體這些雜訊源，轉角走圓弧。無論開關是內建、外接，或下管換成 MOSFET 的同步整流，電流走向相同，這條推論一樣適用。",
    "circuits": [],
    "keyFormulas": [
      "ON 路徑：CBYPASS → CIN → Q1 → L → CO → 回 CIN 地",
      "OFF 路徑：L → CO → D1 → 回 L（輸入側不參與）",
      "差集迴路（要最小化）：CIN/CBYPASS → 開關 → D1 → 回 CIN",
      "走線電感 ≈ 1nH/mm；迴路面積↑ ⇒ 寄生電感↑ ⇒ 振鈴與輻射↑"
    ],
    "designNotes": [
      "動手排零件前先在電路圖上把 ON/OFF 兩條路徑各畫一次，再圈出差集——這圈就是佈局的第一優先（" + SRC + " §1.2）",
      "差集迴路裡的元件（CIN、CBYPASS、開關、D1）必須同面、相鄰；其他元件都排在它們之後",
      "同步整流把 D1 換成下管 MOSFET，差集迴路的形狀不變，一樣要最小化",
      "輸出側電流平滑，是先顧輸入迴路再顧輸出的原因，不是因為輸出不重要"
    ],
    "commonMistakes": [
      "照電路圖的擺法直接排版：電路圖上相鄰不代表電流迴路小",
      "先排好看的元件陣列，最後才把輸入電容塞進剩下的空位",
      "只看穩態電流大小決定線寬與位置，忽略切換瞬間的 di/dt",
      "以為同步整流沒有二極體就沒有這個迴路，結果下管迴路一樣繞大圈"
    ],
    "relatedTopics": ["buck-converter", "sw-node-ringing-parasitics", "input-cap-layout-cin-cbypass", "emi-layout"],
    "i18n": {
      "en": {
        "title": "Buck Converter Current Loops and the Difference Loop (First Principle of Layout)",
        "description": "Subtract the switch-off current picture from the switch-on one. What is left is the loop whose current reverses every cycle - layout priority number one.",
        "principles": "When Q1 turns on, current rises steeply, but most of it comes from the high-frequency decoupling capacitor CBYPASS, then from the bulk CIN; the input source itself only supplies the slowly changing part. When Q1 turns off, D1 conducts and the inductor dumps its stored energy into the output. Subtract the two pictures and the difference is the section where current reverses on every switching edge: CIN/CBYPASS to the switch, to the diode, and back to CIN. That waveform is rich in harmonics and is both the noise source and the ringing source, so the layout must shrink its area first. The output side carries smooth current because the inductor sits in series, so it ranks lower. Every rule in the ROHM handbook follows from this: input capacitors and the diode on the same side as the IC pins and as close as possible, inductor next, copper area no larger than necessary, output capacitor near the inductor, feedback away from the inductor and diode, corners rounded. The same reasoning holds for an external switch or for synchronous rectification.",
        "designNotes": [
          "Before placing anything, draw the ON path and the OFF path, then circle the difference - that loop gets first priority (" + SRC + " section 1.2)",
          "Components inside the difference loop (CIN, CBYPASS, switch, D1) must be on the same side and adjacent; everything else comes after",
          "Synchronous rectification replaces D1 with a low-side MOSFET, but the difference loop keeps the same shape",
          "Output current is smooth - that is why input comes first, not because the output does not matter"
        ],
        "commonMistakes": [
          "Placing parts the way they sit on the schematic: adjacency on paper is not a small current loop",
          "Arranging the pretty component grid first and squeezing the input capacitor into whatever space is left",
          "Sizing traces from steady-state current only, ignoring di/dt at the switching edges",
          "Assuming synchronous rectification has no such loop because there is no diode"
        ]
      },
      "ja": {
        "title": "降圧コンバータの電流経路と「差分ループ」（レイアウトの第一原理）",
        "description": "スイッチ ON と OFF の電流図を引き算すると、毎サイクル電流が反転するループが残る。レイアウトの最優先はここ。",
        "principles": "Q1 がオンした瞬間、電流は急峻に立ち上がるが、その大部分は高周波デカップリング CBYPASS から供給され、次に大容量の CIN、入力電源自体はゆるやかな変化分だけを担う。Q1 がオフすると D1 が導通し、インダクタが蓄えたエネルギーを出力へ放出する。この二枚の図を引き算した差分が、スイッチングのたびに電流が急反転する区間——CIN/CBYPASS からスイッチ、ダイオード、そして CIN へ戻る一周である。この波形は高調波を多く含み、ノイズ源でありリンギング源でもあるため、レイアウトではまずこのループ面積を最小化する。出力側はインダクタが直列に入るので電流が滑らかで、優先度は下がる。ROHM ハンドブックのレイアウト原則はすべてここから導かれる：入力コンデンサとダイオードは IC ピンと同一面かつ最短、インダクタはその次、銅箔面積は必要以上に広げない、出力コンデンサはインダクタの近く、帰還配線はインダクタやダイオードから遠ざける、コーナーは丸める。外付けスイッチでも同期整流でも電流の流れは同じで、この推論はそのまま成り立つ。",
        "designNotes": [
          "部品を置く前に ON 経路と OFF 経路を描き、その差分を囲む——そのループが最優先（" + SRC + " 1.2 節）",
          "差分ループ内の部品（CIN、CBYPASS、スイッチ、D1）は同一面で隣接させ、他はその後に配置する",
          "同期整流で D1 を下側 MOSFET に置き換えても、差分ループの形は変わらない",
          "出力電流が滑らかだから入力を先に見る。出力が重要でないという意味ではない"
        ],
        "commonMistakes": [
          "回路図の並びのまま配置する：図面上の隣接は電流ループの小ささを意味しない",
          "見栄えのする部品配置を先に決め、最後に入力コンデンサを空きスペースへ押し込む",
          "定常電流だけで線幅と位置を決め、スイッチング時の di/dt を無視する",
          "同期整流はダイオードが無いからこのループも無い、と思い込む"
        ]
      },
      "ko": {
        "title": "벅 컨버터 전류 경로와 '차집합 루프' (레이아웃 제1원리)",
        "description": "스위치 ON과 OFF 전류 그림을 빼면 매 주기 전류가 뒤집히는 루프가 남는다. 레이아웃 최우선은 그 루프다.",
        "principles": "Q1이 켜지는 순간 전류는 가파르게 상승하지만 대부분은 고주파 디커플링 CBYPASS에서, 그다음 대용량 CIN에서 공급되고 입력 전원은 완만한 성분만 담당한다. Q1이 꺼지면 D1이 도통하고 인덕터가 저장한 에너지를 출력으로 내보낸다. 두 그림을 빼면 스위칭마다 전류가 급반전하는 구간, 즉 CIN/CBYPASS에서 스위치와 다이오드를 거쳐 CIN으로 돌아오는 한 바퀴가 남는다. 이 파형은 고조파가 많아 노이즈원이자 링잉원이므로 레이아웃에서 이 루프 면적을 먼저 줄여야 한다. 출력 쪽은 인덕터가 직렬로 들어가 전류가 매끄러워 우선순위가 낮다. ROHM 핸드북의 레이아웃 원칙은 모두 여기서 나온다: 입력 커패시터와 다이오드는 IC 핀과 같은 면에 최대한 가깝게, 인덕터가 그다음, 구리 면적은 필요 이상으로 넓히지 않기, 출력 커패시터는 인덕터 근처, 피드백은 인덕터와 다이오드에서 멀리, 코너는 둥글게. 외장 스위치든 동기 정류든 전류 흐름은 같아 이 추론이 그대로 적용된다.",
        "designNotes": [
          "부품을 놓기 전에 ON 경로와 OFF 경로를 그리고 차집합을 표시한다 - 그 루프가 최우선 (" + SRC + " 1.2절)",
          "차집합 루프 안의 부품(CIN, CBYPASS, 스위치, D1)은 같은 면에 인접 배치하고 나머지는 그 뒤에 배치",
          "동기 정류로 D1을 로우사이드 MOSFET으로 바꿔도 차집합 루프 모양은 그대로다",
          "출력 전류가 매끄럽기 때문에 입력을 먼저 보는 것이지 출력이 덜 중요해서가 아니다"
        ],
        "commonMistakes": [
          "회로도 배치 그대로 배선: 도면상 인접이 곧 작은 전류 루프는 아니다",
          "보기 좋은 배열을 먼저 정하고 입력 커패시터를 남는 자리에 밀어 넣기",
          "정상 전류만으로 선폭과 위치를 정하고 스위칭 di/dt를 무시",
          "동기 정류는 다이오드가 없으니 이 루프도 없다고 착각"
        ]
      }
    },
    "sourcePdf": null,
    "createdAt": "2026-08-01T00:00:00Z",
    "updatedAt": "2026-08-01T00:00:00Z"
  });

  CARDS.push({
    "id": "sw-node-ringing-parasitics",
    "title": "SW 節點振鈴：寄生電感電容怎麼變成 100MHz 的鈴聲",
    "category": "pcb-design",
    "products": ["通用"],
    "description": "走線電感約 1nH/mm、MOSFET 的 tr/tf 只有幾 ns，兩者相乘就是振鈴。用 I=C·dV/dt 與 V=L·dI/dt 兩條式子就能把它算成具體的伏特數。",
    "principles": "實際板子上有電路圖看不到的寄生電容與電感，而它們的影響比想像大：電路本身沒錯卻不會動，多半是佈局沒把寄生量算進去。兩條基本式就夠用：I = C·dV/dt 與 V = L·dI/dt。舉例，切換電壓 5V、寄生電容 1000pF、邊沿 5ns，得到 1A 的電流；這 1A 流過 10nH（約 10mm 走線）且同樣 5ns，就在走線上產生 2V。振鈴頻段用 f = 1/t 估：tr 與 tf 各 5ns，週期視為 10ns，就是 100MHz；開關頻率通常 500kHz–1MHz，所以振鈴落在開關頻率的 100–200 倍。機制上，上管導通時寄生電容 C2 被充電、寄生電感 L1–L5 儲能，SW 電位追到 VIN 之後，這些電感能量與 C2 諧振而產生大振鈴；上管關斷時電感電流仍在，C1 被充電、C2 放電，直到下管體二極體導通，殘餘電感能量與 C1 諧振。內建開關的 IC，L1、L2 與 C2 由 IC 決定，佈局動不了；L3 與 L5 則完全由佈局決定——這就是「走線要短」不是口號的理由。邊沿越快效率越好，但振鈴也越兇，這是要自己拿捏的取捨。",
    "circuits": [],
    "keyFormulas": [
      "I = C × dV/dt；V = L × dI/dt",
      "例：1000pF × 5V / 5ns = 1A；10nH × 1A / 5ns = 2V",
      "PON = ½ × (L1+L2+L3+L4+L5) × I²",
      "fON = 1 / (2π√((L1+L2+L3+L4+L5) × C2))；fOFF 換成 C1",
      "振鈴頻段 f = 1/t：tr=tf=5ns → 週期 10ns → 約 100MHz（開關頻率的 100–200 倍）"
    ],
    "designNotes": [
      "走線電感抓 1nH/mm 心算：10mm 就是 10nH，配 1A/5ns 就是 2V 的尖波（" + SRC + " §1.3）",
      "能改的只有 L3/L5（佈局），L1/L2/C2 在內建開關的 IC 裡是固定值——先確認自己在改哪一段",
      "要更快的邊沿換效率，就要同時準備 snubber 或閘極電阻，不能只調一邊",
      "量到的振鈴頻率反推 LC，可以驗證是哪一段走線太長"
    ],
    "commonMistakes": [
      "把振鈴當成 IC 的問題送 RMA，實際是輸入電容拉遠了 10mm",
      "看到振鈴先加 snubber，沒先量迴路長度——治標且犧牲效率",
      "以為開關頻率 1MHz 的板子只要顧 1MHz，忽略 100MHz 級的振鈴頻段",
      "為了效率把 tr/tf 調到最快，卻沒重新檢查 EMI 與 VDS 尖波"
    ],
    "relatedTopics": ["buck-layout-current-loops", "rc-snubber", "mosfet-switching", "emi-layout"],
    "i18n": {
      "en": {
        "title": "Switch-Node Ringing: How Parasitic L and C Become a 100MHz Bell",
        "description": "Trace inductance runs about 1nH/mm and MOSFET edges are only a few ns. Multiply them with I=C dV/dt and V=L dI/dt and the ringing becomes an actual number of volts.",
        "principles": "A real board carries parasitic capacitance and inductance that never appear on the schematic, and their effect is larger than people expect: when a circuit that looks correct refuses to work, the layout usually failed to account for them. Two equations cover it: I = C x dV/dt and V = L x dI/dt. With a 5V switching edge, 1000pF of parasitic capacitance and a 5ns edge you get 1A; push that 1A through 10nH (roughly 10mm of trace) in the same 5ns and you generate 2V along the trace. Estimate the ringing band with f = 1/t: 5ns rise plus 5ns fall is a 10ns period, so about 100MHz. Switching frequencies are typically 500kHz to 1MHz, so the ringing sits 100 to 200 times higher. Mechanically: when the high side turns on, C2 charges and L1 through L5 store energy; once the switch node reaches VIN that stored energy resonates with C2 and rings hard. When the high side turns off the inductor current continues, C1 charges and C2 discharges until the low-side body diode takes over, and the remaining inductive energy resonates with C1. In an IC with an integrated switch, L1, L2 and C2 are fixed by the IC; L3 and L5 belong entirely to the layout - which is why short wiring is physics, not a slogan. Faster edges cut switching loss but make ringing worse; that trade-off is yours to make.",
        "designNotes": [
          "Do the mental math at 1nH/mm: 10mm is 10nH, and 1A in 5ns across it is a 2V spike (" + SRC + " section 1.3)",
          "Layout can only change L3/L5; L1, L2 and C2 are fixed inside an integrated-switch IC - know which one you are fighting",
          "If you speed up the edges for efficiency, budget for a snubber or gate resistor at the same time",
          "Back out L and C from the measured ringing frequency to find which trace is too long"
        ],
        "commonMistakes": [
          "Returning the IC as faulty when the real cause is an input capacitor placed 10mm away",
          "Reaching for a snubber before measuring loop length - it treats the symptom and costs efficiency",
          "Assuming a 1MHz converter only needs 1MHz thinking, and ignoring the 100MHz ringing band",
          "Speeding up tr/tf for efficiency without re-checking EMI and the VDS spike"
        ]
      },
      "ja": {
        "title": "スイッチノードのリンギング：寄生 L・C はこうして 100MHz の鈴になる",
        "description": "配線インダクタンスは約 1nH/mm、MOSFET のエッジは数 ns。I=C dV/dt と V=L dI/dt を掛け合わせれば、リンギングは具体的な電圧になる。",
        "principles": "実際の基板には回路図に現れない寄生容量とインダクタンスがあり、その影響は想像以上に大きい。回路に問題が無いのに動かない場合、レイアウトでの寄生の考慮不足がしばしば原因になる。式は二つで足りる：I = C × dV/dt と V = L × dI/dt。スイッチング電圧 5V、寄生容量 1000pF、エッジ 5ns なら 1A。その 1A が 10nH（配線約 10mm）を同じ 5ns で流れれば、配線上に 2V が発生する。リンギング帯域は f = 1/t で概算でき、tr・tf ともに 5ns なら周期 10ns、すなわち約 100MHz。スイッチング周波数は通常 500kHz〜1MHz なので、リンギングはその 100〜200 倍の帯域に現れる。動作としては、ハイサイドがオンすると C2 が充電され L1〜L5 にエネルギーが蓄積し、スイッチノードが VIN に達した時点でそのエネルギーが C2 と共振して大きなリンギングになる。オフではインダクタ電流が流れ続け、C1 が充電・C2 が放電し、ローサイドのボディダイオードが導通するまで進み、残るインダクタンスのエネルギーが C1 と共振する。スイッチ内蔵 IC では L1・L2・C2 は IC 固有の固定値で、L3・L5 だけがレイアウト依存——「配線は短く」が物理である理由がこれ。エッジを速くすれば損失は減るがリンギングは悪化する、というトレードオフになる。",
        "designNotes": [
          "1nH/mm で暗算する：10mm は 10nH、そこに 1A/5ns で 2V のスパイク（" + SRC + " 1.3 節）",
          "レイアウトで変えられるのは L3/L5 のみ。内蔵スイッチ IC の L1・L2・C2 は固定値",
          "効率のためにエッジを速くするなら、スナバやゲート抵抗も同時に検討する",
          "測ったリンギング周波数から L と C を逆算すれば、どの配線が長すぎるか特定できる"
        ],
        "commonMistakes": [
          "入力コンデンサが 10mm 離れているのが原因なのに、IC 不良として返品する",
          "配線長を測る前にスナバを足す——対症療法で効率も落ちる",
          "1MHz のコンバータだから 1MHz だけ見ればよいと考え、100MHz 帯のリンギングを見落とす",
          "効率のため tr/tf を最速にし、EMI と VDS スパイクを再確認しない"
        ]
      },
      "ko": {
        "title": "스위치 노드 링잉: 기생 L·C가 100MHz 종소리가 되는 과정",
        "description": "배선 인덕턴스는 약 1nH/mm, MOSFET 엣지는 몇 ns. I=C dV/dt와 V=L dI/dt를 곱하면 링잉이 실제 전압 값이 된다.",
        "principles": "실제 기판에는 회로도에 없는 기생 커패시턴스와 인덕턴스가 있고 그 영향은 생각보다 크다. 회로에 문제가 없는데 동작하지 않는다면 레이아웃에서 기생 성분을 고려하지 않은 경우가 많다. 식은 두 개면 충분하다: I = C × dV/dt, V = L × dI/dt. 스위칭 전압 5V, 기생 커패시턴스 1000pF, 엣지 5ns면 1A가 나오고, 그 1A가 10nH(약 10mm 배선)를 같은 5ns에 흐르면 배선에 2V가 생긴다. 링잉 대역은 f = 1/t로 추정하며 tr, tf가 각각 5ns면 주기 10ns, 즉 약 100MHz다. 스위칭 주파수는 보통 500kHz~1MHz이므로 링잉은 그 100~200배 대역에 나타난다. 동작은 이렇다: 하이사이드가 켜지면 C2가 충전되고 L1~L5에 에너지가 쌓이며, 스위치 노드가 VIN에 도달하면 그 에너지가 C2와 공진해 큰 링잉이 생긴다. 꺼질 때는 인덕터 전류가 계속 흘러 C1이 충전되고 C2가 방전되며, 로우사이드 바디 다이오드가 도통할 때까지 진행되고 남은 인덕턴스 에너지가 C1과 공진한다. 스위치 내장 IC에서 L1, L2, C2는 IC가 정하는 고정값이고 L3, L5만 레이아웃이 결정한다 - '배선은 짧게'가 구호가 아니라 물리인 이유다. 엣지를 빠르게 하면 손실은 줄지만 링잉은 심해지는 트레이드오프가 된다.",
        "designNotes": [
          "1nH/mm로 암산한다: 10mm면 10nH, 여기에 1A/5ns면 2V 스파이크 (" + SRC + " 1.3절)",
          "레이아웃이 바꿀 수 있는 것은 L3/L5뿐, 내장 스위치 IC의 L1·L2·C2는 고정값",
          "효율을 위해 엣지를 빠르게 한다면 스너버나 게이트 저항도 함께 준비",
          "측정한 링잉 주파수로 L과 C를 역산하면 어느 배선이 긴지 찾을 수 있다"
        ],
        "commonMistakes": [
          "입력 커패시터가 10mm 떨어진 것이 원인인데 IC 불량으로 반품",
          "루프 길이를 재기 전에 스너버부터 추가 - 증상만 덮고 효율도 잃는다",
          "1MHz 컨버터니 1MHz만 보면 된다고 생각하고 100MHz 대역 링잉을 놓침",
          "효율 때문에 tr/tf를 최대로 빠르게 하고 EMI와 VDS 스파이크를 재확인하지 않음"
        ]
      }
    },
    "sourcePdf": null,
    "createdAt": "2026-08-01T00:00:00Z",
    "updatedAt": "2026-08-01T00:00:00Z"
  });

  CARDS.push({
    "id": "input-cap-layout-cin-cbypass",
    "title": "輸入電容擺放：CBYPASS 與 CIN 的分工與可接受的妥協",
    "category": "pcb-design",
    "products": ["通用"],
    "description": "CBYPASS 顧高頻、CIN 顧容量。CBYPASS 到位的話 CIN 可以退到 2cm；但兩顆都放背面經過孔，是不能做的那一種。",
    "principles": "大容值的 CIN 高頻特性通常不好，所以要並一顆頻率特性好的 MLCC 當 CBYPASS，兩者合成才得到夠寬的阻抗曲線；輸出電流小（IO ≤ 1A）時容量需求低，可以用單顆陶瓷電容兼任兩者的角色，但頻率特性隨廠牌與型號差很多，要看實際規格。擺放的優先順序是死的：CBYPASS 必須與 IC 同面，緊貼 VIN 腳與 GND 腳。以此為前提，手冊給了幾種情況的判定——CBYPASS 到位時 CIN 即使遠到 2cm 也還可以接受（脈衝電流大部分由 CBYPASS 供應）；CIN 因空間限制放到背面走過孔也可以，但要實測大電流下漣波是否因過孔電阻升高；CBYPASS 與 CIN 兩顆都放背面則絕對不行，過孔電感會直接放大電壓雜訊。二極體同樣要與 IC 同面且靠近，用最短最寬的線接到 IC 的開關腳與 GND 腳。實測顯示 CBYPASS 距離 2mm 與 10mm 的振鈴差異一眼就看得出來，而且那圈迴路本身會像天線一樣往外輻射。另外，CIN 的地與輸出電容 CO 的地建議隔開 1–2cm，避免輸入端幾百 MHz 的雜訊經共用地跑到輸出。",
    "circuits": [],
    "keyFormulas": [
      "順位：CBYPASS 貼 IC（同面、最短）＞ CIN ＞ 其他",
      "可接受：CBYPASS 到位時 CIN 距離 ≤ 2cm",
      "可接受但要驗：CIN 走過孔放背面（大電流下漣波可能上升）",
      "禁止：CBYPASS 與 CIN 都放背面（過孔電感放大雜訊）",
      "CIN 的地與 CO 的地相隔 1–2cm"
    ],
    "designNotes": [
      "IO ≤ 1A 的小電源可用單顆陶瓷電容兼 CIN/CBYPASS，但要查該顆的頻率特性（" + SRC + " §2.1）",
      "CBYPASS 的兩端要同時靠近 VIN 腳與 GND 腳——只靠近其中一腳等於沒靠近",
      "二極體用最短最寬的走線接到開關腳與 GND 腳，且與 IC 同面",
      "空間真的不夠時，退讓順序是先讓 CIN 退（≤2cm），絕不讓 CBYPASS 退"
    ],
    "commonMistakes": [
      "CBYPASS 與 CIN 一起搬到背面用過孔連——手冊明列為絕對不可",
      "只看容量選電容，忽略大容值電容的高頻阻抗其實很差",
      "把 CIN 的地與 CO 的地接在一起且緊鄰，輸入雜訊直接傳到輸出",
      "二極體離 IC 遠，走線電感讓尖波變得明顯"
    ],
    "relatedTopics": ["buck-layout-current-loops", "decoupling-capacitor", "sw-node-ringing-parasitics", "via-design"],
    "i18n": {
      "en": {
        "title": "Input Capacitor Placement: What CBYPASS and CIN Each Do, and Which Compromises Are Allowed",
        "description": "CBYPASS handles the high frequencies, CIN handles the bulk. With CBYPASS in place CIN may sit 2cm away - but putting both on the back side through vias is the one thing you must not do.",
        "principles": "A large-value CIN usually has poor high-frequency behaviour, so a good MLCC is placed in parallel as CBYPASS; the pair together gives the impedance curve you actually need. For a small output current (IO up to 1A) a single ceramic capacitor can serve as both, because smaller values have better frequency behaviour - but the response varies by type and brand, so check the part you actually use. The placement order is fixed: CBYPASS must be on the same side as the IC, hugging the VIN and GND pins. From there the handbook grades the compromises. With CBYPASS in place, CIN can be as far as 2cm and still work, because CBYPASS supplies most of the pulsed current. CIN on the back side through vias is acceptable, but confirm on the bench that ripple does not rise at high current because of via resistance. Putting both CBYPASS and CIN on the back side is never acceptable: via inductance amplifies the voltage noise. The diode follows the same rule - same side, close, and connected to the IC switch pin and GND pin with the shortest and widest wiring. Measurements show the difference in ringing between CBYPASS at 2mm and at 10mm plainly, and that loop also radiates like an antenna. Finally, keep the ground of CIN 1 to 2cm away from the ground of the output capacitor CO so that hundreds of MHz on the input side do not travel to the output.",
        "designNotes": [
          "Below 1A a single ceramic can cover both roles, but check that part's frequency response (" + SRC + " section 2.1)",
          "Both terminals of CBYPASS must be close to the VIN pin and the GND pin - close to only one of them is not close",
          "Connect the diode to the switch pin and GND pin with the shortest, widest wiring, on the same side as the IC",
          "When space runs out, let CIN move away first (2cm max); never let CBYPASS move"
        ],
        "commonMistakes": [
          "Moving CBYPASS and CIN together to the back side through vias - the handbook flags this as never acceptable",
          "Choosing capacitors by value alone and ignoring how bad a bulk capacitor is at high frequency",
          "Tying the CIN ground and the CO ground together right next to each other, so input noise reaches the output",
          "Leaving the diode far from the IC, where wiring inductance makes the spikes obvious"
        ]
      },
      "ja": {
        "title": "入力コンデンサの配置：CBYPASS と CIN の役割分担と許される妥協",
        "description": "CBYPASS が高周波、CIN が容量を担う。CBYPASS が適切なら CIN は 2cm 離れてもよいが、両方を裏面にビアで置くのは禁じ手。",
        "principles": "大容量の CIN は一般に高周波特性が良くないため、周波数特性の良い MLCC を CBYPASS として並列に配置し、二つの合成で必要なインピーダンス特性を得る。出力電流が小さい場合（IO ≦ 1A）は容量値も小さくなり、セラミックコンデンサ 1 個で両者を兼ねられることもあるが、特性は種類やブランドで大きく変わるため実使用部品の確認が必要になる。配置順序は動かせない：CBYPASS は IC と同一面で、VIN ピンと GND ピンに密着させる。その前提で妥協の可否が決まる。CBYPASS が適切なら CIN は 2cm 離れても実用上問題ない（パルス電流の大半は CBYPASS が供給するため）。スペースの都合で CIN をビア経由の裏面に置くのは許容されるが、大電流時にビア抵抗でリップルが増えないか実測確認が要る。CBYPASS と CIN の両方を裏面に置くのは不可——ビアのインダクタンスが電圧ノイズを増幅する。ダイオードも同様に同一面かつ近接で、IC のスイッチピンと GND ピンへ最短・最太の配線で接続する。CBYPASS が 2mm の場合と 10mm の場合ではリンギングの差が明確に現れ、そのループ自体がアンテナとして周囲に放射する。さらに、CIN のグランドは出力コンデンサ CO のグランドから 1〜2cm 離すことが推奨される。",
        "designNotes": [
          "1A 以下ならセラミック 1 個で兼用可能だが、その部品の周波数特性を確認する（" + SRC + " 2.1 節）",
          "CBYPASS の両端が VIN ピンと GND ピンの両方に近いこと。片側だけ近いのは近いと言えない",
          "ダイオードは IC と同一面で、スイッチピンと GND ピンへ最短・最太で接続する",
          "スペースが足りないときに下げるのは CIN（最大 2cm）。CBYPASS は絶対に下げない"
        ],
        "commonMistakes": [
          "CBYPASS と CIN をまとめて裏面へ移しビアで接続する——ハンドブックが明確に不可としている",
          "容量値だけで選び、大容量品の高周波インピーダンスの悪さを見落とす",
          "CIN のグランドと CO のグランドを隣接させ、入力ノイズが出力へ伝わる",
          "ダイオードを IC から離し、配線インダクタンスでスパイクノイズを目立たせる"
        ]
      },
      "ko": {
        "title": "입력 커패시터 배치: CBYPASS와 CIN의 역할 분담과 허용되는 타협",
        "description": "CBYPASS는 고주파, CIN은 용량을 담당한다. CBYPASS가 제자리면 CIN은 2cm 떨어져도 되지만, 둘 다 뒷면에 비아로 두는 것은 금지다.",
        "principles": "대용량 CIN은 보통 고주파 특성이 나빠서 주파수 특성이 좋은 MLCC를 CBYPASS로 병렬 배치하고, 둘의 합성으로 필요한 임피던스 곡선을 얻는다. 출력 전류가 작으면(IO ≤ 1A) 용량도 작아 세라믹 하나로 두 역할을 겸할 수 있지만 특성은 종류와 브랜드에 따라 크게 달라 실제 사용 부품 확인이 필요하다. 배치 순서는 고정이다: CBYPASS는 IC와 같은 면에서 VIN 핀과 GND 핀에 밀착시킨다. 그 전제 위에서 타협의 등급이 정해진다. CBYPASS가 제자리면 CIN은 2cm까지 떨어져도 실용상 문제없다(펄스 전류 대부분을 CBYPASS가 공급하기 때문). 공간 문제로 CIN을 비아를 거쳐 뒷면에 두는 것은 허용되지만, 대전류에서 비아 저항으로 리플이 증가하지 않는지 실측해야 한다. CBYPASS와 CIN을 모두 뒷면에 두는 것은 불가다 - 비아 인덕턴스가 전압 노이즈를 증폭한다. 다이오드도 같은 면에 가깝게 두고 IC의 스위치 핀과 GND 핀에 가장 짧고 넓은 배선으로 연결한다. CBYPASS가 2mm일 때와 10mm일 때의 링잉 차이는 눈으로 확인될 정도이며, 그 루프 자체가 안테나처럼 방사한다. 또한 CIN의 그라운드는 출력 커패시터 CO의 그라운드에서 1~2cm 떨어뜨리는 것이 권장된다.",
        "designNotes": [
          "1A 이하 소전력은 세라믹 하나로 겸용 가능하지만 그 부품의 주파수 특성을 확인 (" + SRC + " 2.1절)",
          "CBYPASS의 두 단자가 VIN 핀과 GND 핀 모두에 가까워야 한다. 한쪽만 가까운 것은 가까운 게 아니다",
          "다이오드는 IC와 같은 면에서 스위치 핀과 GND 핀에 최단·최대 폭으로 연결",
          "공간이 부족하면 CIN을 먼저 물린다(최대 2cm). CBYPASS는 절대 물리지 않는다"
        ],
        "commonMistakes": [
          "CBYPASS와 CIN을 함께 뒷면으로 옮겨 비아로 연결 - 핸드북이 절대 불가로 명시",
          "용량만 보고 선정해 대용량 커패시터의 나쁜 고주파 임피던스를 놓침",
          "CIN 그라운드와 CO 그라운드를 바로 옆에 붙여 입력 노이즈가 출력으로 전달",
          "다이오드를 IC에서 멀리 두어 배선 인덕턴스로 스파이크가 두드러짐"
        ]
      }
    },
    "sourcePdf": null,
    "createdAt": "2026-08-01T00:00:00Z",
    "updatedAt": "2026-08-01T00:00:00Z"
  });

  CARDS.push({
    "id": "copper-foil-resistance-inductance",
    "title": "銅箔的電阻與電感：線寬、溫升與 1nH/mm",
    "category": "pcb-design",
    "products": ["通用"],
    "description": "銅箔不是理想導線。35µm、3mm 寬、50mm 長就有 8.17mΩ，3A 掉 24.5mV，升到 100°C 再多 29%。電感則約 1nH/mm。",
    "principles": "銅箔有電阻，大電流下就是導通損耗、壓降與發熱。一般算式為 R = ρ × l / (t × w) × 10 [mΩ]，其中 l 是長度 mm、w 是寬度 mm、t 是銅厚 µm、ρ 是電阻率；銅在 25°C 時 ρ = 1.72 µΩcm，溫度修正 ρ(T) = ρ(25°C) × {1 + 0.00385 × (T − 25)}。也可以用查表法：R = Rp × (l/w) × (35/t)，Rp 是每單位面積的查表值（以 35µm 厚、1mm 見方為基準）。手冊的例子：25°C、寬 3mm、長 50mm，得 8.17mΩ；通 3A 時壓降 24.5mV；若溫度升到 100°C，電阻增加 29%，壓降變成 31.6mV。電感方面，走線電感約 1nH/mm，縮短長度是降低電感最直接的手段。載流能力則看溫升：35µm 銅要把溫升壓在 20°C 以內，2A 只需 0.53mm 線寬，但實際會被周邊元件發熱與環境溫度影響，所以要留餘裕——1oz（35µm）建議 1mm 以上，2oz（70µm）建議 0.7mm 以上。",
    "circuits": [],
    "keyFormulas": [
      "R = ρ × l / (t × w) × 10 [mΩ]（l:mm、w:mm、t:µm）",
      "ρ(25°C) = 1.72 µΩcm；ρ(T) = ρ(25°C) × {1 + 0.00385 (T − 25)}",
      "查表法：R = Rp × (l/w) × (35/t)",
      "例：35µm、3mm × 50mm → 8.17mΩ；3A → 24.5mV；100°C → 31.6mV（+29%）",
      "走線電感 ≈ 1nH/mm",
      "溫升 ≤20°C：35µm/2A 需 0.53mm；建議 1oz ≥1mm、2oz ≥0.7mm"
    ],
    "designNotes": [
      "大電流路徑先算壓降再畫線寬，不要憑感覺加粗（" + SRC + " §1.5、§1.6）",
      "電阻要用工作溫度算，不是室溫：100°C 時比 25°C 高約 29%",
      "壓降會直接吃掉回授精度——取樣點與電源路徑要分開想",
      "降電感靠縮短長度，不是靠加寬；加寬主要是降電阻與散熱"
    ],
    "commonMistakes": [
      "只用室溫電阻估壓降，實機熱起來才發現輸出偏低",
      "把「線夠寬」當成「電感夠低」，其實長度才是電感的主因",
      "用最小線寬走大電流，靠銅箔自己發熱去平衡",
      "把回授取樣點接在大電流路徑上，量到的是含壓降的電壓"
    ],
    "relatedTopics": ["thermal-design", "sw-node-ringing-parasitics", "pdn-design", "current-sensing"],
    "i18n": {
      "en": {
        "title": "Copper Foil Resistance and Inductance: Width, Temperature Rise and 1nH/mm",
        "description": "Copper is not an ideal wire. 35um foil, 3mm wide and 50mm long is 8.17 milliohm - 24.5mV at 3A, and 29% more once it reaches 100C. Inductance is roughly 1nH/mm.",
        "principles": "Copper foil has resistance, and at high current that means conduction loss, voltage drop and heat. The general form is R = rho x l / (t x w) x 10 in milliohms, with l in mm, w in mm, t in micrometres and rho the resistivity; copper is 1.72 microohm-cm at 25C, corrected by rho(T) = rho(25C) x {1 + 0.00385 x (T - 25)}. A chart-based form also works: R = Rp x (l/w) x (35/t), where Rp is the tabulated resistance per unit area referenced to 35um thickness and a 1mm square. The handbook's worked example: at 25C, 3mm wide and 50mm long gives 8.17 milliohm; at 3A that is a 24.5mV drop; at 100C the resistance is 29% higher and the drop becomes 31.6mV. For inductance, trace inductance is about 1nH per millimetre, and shortening the run is the most direct way to reduce it. Current capability is a temperature-rise question: with 35um copper, holding the rise to 20C at 2A needs only 0.53mm of width, but nearby heat sources and ambient temperature eat into that, so leave margin - at least 1mm for one-ounce copper and at least 0.7mm for two-ounce.",
        "designNotes": [
          "Compute the drop before you choose a width on any high-current path (" + SRC + " sections 1.5 and 1.6)",
          "Use the operating temperature, not room temperature: resistance is about 29% higher at 100C",
          "Voltage drop eats regulation accuracy - keep the sense point off the power path",
          "Shorter wiring lowers inductance; wider wiring lowers resistance and spreads heat"
        ],
        "commonMistakes": [
          "Estimating drop at room temperature and finding the output low once the board warms up",
          "Treating wide as low-inductance, when length is what dominates inductance",
          "Running high current through minimum-width traces and letting the copper find its own temperature",
          "Taking the feedback sense point on the high-current path, so it reads the drop as well"
        ]
      },
      "ja": {
        "title": "銅箔の抵抗とインダクタンス：線幅・温度上昇・1nH/mm",
        "description": "銅箔は理想配線ではない。35µm・幅 3mm・長さ 50mm で 8.17mΩ、3A で 24.5mV、100°C ではさらに 29% 増える。インダクタンスは約 1nH/mm。",
        "principles": "銅箔には抵抗があり、大電流条件では導通損失＝電圧降下と発熱になる。一般式は R = ρ × l / (t × w) × 10 [mΩ]（l:mm、w:mm、t:µm）。銅の抵抗率は 25°C で 1.72 µΩcm、温度補正は ρ(T) = ρ(25°C) × {1 + 0.00385 × (T − 25)}。グラフ読み取り式 R = Rp × (l/w) × (35/t) も使える（Rp は 35µm 厚・1mm 角基準の単位面積あたり抵抗）。ハンドブックの例では、25°C・幅 3mm・長さ 50mm で 8.17mΩ、3A 通電時の電圧降下は 24.5mV、100°C まで上がると抵抗は 29% 増加し降下は 31.6mV になる。インダクタンスは配線でおよそ 1nH/mm であり、長さを短くすることが最も直接的な低減手段になる。許容電流は温度上昇で決まり、35µm 銅で温度上昇 20°C 以内なら 2A に対して 0.53mm の幅で足りるが、周辺部品の発熱と周囲温度の影響を受けるため余裕が必要で、1oz（35µm）では 1mm 以上、2oz（70µm）では 0.7mm 以上が推奨される。",
        "designNotes": [
          "大電流経路は線幅を決める前に電圧降下を計算する（" + SRC + " 1.5・1.6 節）",
          "抵抗は動作温度で計算する。100°C では 25°C より約 29% 高い",
          "電圧降下は帰還精度を直接削る。センス点は電力経路から分ける",
          "インダクタンスは長さを短くして下げる。幅は抵抗と放熱のため"
        ],
        "commonMistakes": [
          "室温の抵抗で降下を見積もり、実機が温まってから出力低下に気づく",
          "「幅が広い＝低インダクタンス」と考える。支配的なのは長さ",
          "最小線幅で大電流を流し、発熱まかせにする",
          "帰還のセンス点を大電流経路上に置き、降下込みの電圧を測ってしまう"
        ]
      },
      "ko": {
        "title": "동박의 저항과 인덕턴스: 선폭, 온도 상승, 1nH/mm",
        "description": "동박은 이상적인 도선이 아니다. 35µm, 폭 3mm, 길이 50mm면 8.17mΩ, 3A에서 24.5mV, 100°C에서 29% 더 늘어난다. 인덕턴스는 약 1nH/mm.",
        "principles": "동박에는 저항이 있고 대전류 조건에서는 도통 손실, 즉 전압 강하와 발열이 된다. 일반식은 R = ρ × l / (t × w) × 10 [mΩ](l:mm, w:mm, t:µm)이다. 구리 저항률은 25°C에서 1.72 µΩcm이고 온도 보정은 ρ(T) = ρ(25°C) × {1 + 0.00385 × (T − 25)}이다. 그래프 방식인 R = Rp × (l/w) × (35/t)도 쓸 수 있으며 Rp는 35µm 두께, 1mm 정사각 기준의 단위 면적당 저항이다. 핸드북 예제: 25°C, 폭 3mm, 길이 50mm에서 8.17mΩ, 3A에서 전압 강하 24.5mV, 100°C가 되면 저항이 29% 증가해 강하는 31.6mV가 된다. 인덕턴스는 배선당 약 1nH/mm이며 길이를 줄이는 것이 가장 직접적인 저감 수단이다. 허용 전류는 온도 상승 문제로, 35µm 구리에서 상승을 20°C 이내로 유지하려면 2A에 0.53mm 폭이면 충분하지만 주변 발열과 주위 온도 영향을 받으므로 여유가 필요해 1oz(35µm)는 1mm 이상, 2oz(70µm)는 0.7mm 이상이 권장된다.",
        "designNotes": [
          "대전류 경로는 선폭을 정하기 전에 전압 강하를 계산 (" + SRC + " 1.5, 1.6절)",
          "저항은 동작 온도로 계산한다. 100°C는 25°C보다 약 29% 높다",
          "전압 강하는 레귤레이션 정확도를 깎는다. 센스 점은 전력 경로에서 분리",
          "인덕턴스는 길이를 줄여 낮추고, 폭은 저항과 방열을 위한 것"
        ],
        "commonMistakes": [
          "상온 저항으로 강하를 추정하고 실제 보드가 뜨거워진 뒤 출력 저하를 발견",
          "'넓으면 저인덕턴스'로 여김 - 인덕턴스를 지배하는 것은 길이",
          "최소 선폭으로 대전류를 흘리고 동박 발열에 맡김",
          "피드백 센스 점을 대전류 경로 위에 두어 강하까지 함께 측정"
        ]
      }
    },
    "sourcePdf": null,
    "createdAt": "2026-08-01T00:00:00Z",
    "updatedAt": "2026-08-01T00:00:00Z"
  });

  CARDS.push({
    "id": "thermal-via-placement",
    "title": "散熱過孔：孔距約 1.2mm、打在散熱片正下方",
    "category": "pcb-design",
    "products": ["通用"],
    "description": "散熱過孔是把熱從表面帶到另一面銅箔的通道。位置錯了就沒有效果——要在發熱體正下方，間距約 1.2mm。",
    "principles": "表面黏著元件靠板子散熱，熱阻取決於散熱銅箔的面積與厚度，以及板材的厚度與材質。銅厚受標準規格限制不能無限加厚，板面積又受省空間的要求限制，而且銅面超過一定面積之後，再放大也換不到等比例的散熱效果。散熱過孔的作用就是突破這個瓶頸：在板上打通孔把正反面（或內層）的銅箔連起來，等於增加散熱用的面積與體積，也就是降低熱阻。要有效，位置比數量更關鍵——過孔要靠近發熱體，最好就在元件正下方。實務做法是把過孔陣列打在封裝底部散熱片（exposed pad）正下方，孔距約 1.2mm；若只靠底部散熱片下方的過孔不夠，再往 IC 周邊補，同樣是越靠近 IC 越好。",
    "circuits": [],
    "keyFormulas": [
      "熱阻 ∝ 1 / (散熱銅箔面積 × 厚度)；面積增益有飽和點",
      "散熱過孔陣列間距約 1.2mm，打在封裝散熱片正下方",
      "不足時再往 IC 周邊補過孔（仍以越近越好）"
    ],
    "designNotes": [
      "先在 exposed pad 正下方鋪滿陣列，再考慮周邊補孔（" + SRC + " §2.2）",
      "過孔要連到「有面積」的銅面，通到一塊小銅片等於沒通",
      "散熱過孔與鋼板開孔要一起設計，否則迴焊時錫會被吸進孔裡（tombstone / 空焊）",
      "銅面加大有邊際效應：到一定面積後改用過孔與內層銅面比繼續加大有效"
    ],
    "commonMistakes": [
      "過孔打在元件旁邊而不是正下方，熱要先橫向傳導，效果打折",
      "只算過孔數量不看間距與位置，以為越多越好",
      "過孔接到細長的銅條，等於把熱塞進一條沒有面積的路徑",
      "忘記與鋼板/迴焊製程對齊，散熱孔變成吃錫孔"
    ],
    "relatedTopics": ["qfn-ep-thermal", "thermal-design", "via-design", "copper-foil-resistance-inductance"],
    "i18n": {
      "en": {
        "title": "Thermal Vias: About 1.2mm Pitch, Directly Under the Pad",
        "description": "Thermal vias carry heat from the surface to copper on the other side. Put them in the wrong place and they do nothing - they belong directly under the heat source, about 1.2mm apart.",
        "principles": "Surface-mount parts dissipate through the board, and that thermal resistance depends on the area and thickness of the dissipating copper as well as the thickness and material of the board itself. Copper thickness follows standard specifications and cannot be increased arbitrarily, board area is constrained by the constant demand to save space, and beyond a certain area the heat-dissipating benefit stops scaling with it. Thermal vias break that ceiling: through-holes tie the front copper to the back (or inner) copper, adding area and volume for dissipation, which is another way of saying they lower thermal resistance. Position matters more than count - the vias must be close to the heat source, ideally directly beneath the component. In practice the array goes directly under the exposed pad on the bottom of the package with a pitch of about 1.2mm, and when that alone is not enough, additional vias go around the periphery of the IC, again as close as possible.",
        "designNotes": [
          "Fill the array under the exposed pad first, then add peripheral vias if needed (" + SRC + " section 2.2)",
          "Vias must land on copper that has real area; connecting to a small pad achieves nothing",
          "Design the vias together with the stencil apertures, or reflow solder wicks into the holes",
          "Enlarging copper has diminishing returns - past a point, vias into inner planes beat more area"
        ],
        "commonMistakes": [
          "Placing vias beside the part instead of under it, so heat must travel sideways first",
          "Counting vias without checking pitch and position, assuming more is always better",
          "Connecting vias to a narrow copper strip, which has no area to spread into",
          "Forgetting the stencil and reflow interaction, so the thermal vias become solder sinks"
        ]
      },
      "ja": {
        "title": "サーマルビア：ピッチ約 1.2mm、放熱パッドの真下に打つ",
        "description": "サーマルビアは表面の熱を反対面の銅箔へ運ぶ通路。位置を誤ると効果は出ない——発熱体の真下、間隔は約 1.2mm。",
        "principles": "表面実装部品は基板を介して放熱し、その熱抵抗は放熱に寄与する銅箔の面積と厚み、そして基板の厚みと材質で決まる。銅箔厚は標準規格に従うため無制限には厚くできず、基板面積も省スペース要求で制限され、しかも一定面積を超えると面積に見合った放熱効果は得られなくなる。サーマルビアはこの頭打ちを破る手段で、基板に貫通孔を設けて表と裏（あるいは内層）の銅箔をつなぎ、放熱に使える面積と体積を増やす＝熱抵抗を下げる。効かせるには数より位置が重要で、ビアは発熱体の近く、できれば部品の真下に置く。実務ではパッケージ底面の放熱パッド直下にビアアレイをピッチ約 1.2mm で配置し、それだけで足りない場合は IC の周辺にも追加する。この場合もできる限り IC に近い位置が良い。",
        "designNotes": [
          "まず放熱パッド直下にアレイを敷き、不足なら周辺へ追加する（" + SRC + " 2.2 節）",
          "ビアは「面積のある」銅箔につなぐ。小さなランドに落とすのは無意味",
          "メタルマスクの開口と併せて設計する。さもないとリフローで穴に半田が吸われる",
          "銅面積の拡大には飽和がある。ある点からはビアと内層銅面のほうが効く"
        ],
        "commonMistakes": [
          "部品の真下ではなく脇にビアを打ち、熱がまず横方向へ伝わる形にする",
          "ピッチと位置を見ずに本数だけ数え、多ければ良いと考える",
          "細い銅パターンにビアをつなぎ、広がる面積が無い経路に熱を押し込む",
          "メタルマスク／リフローとの関係を忘れ、サーマルビアが半田の吸い込み口になる"
        ]
      },
      "ko": {
        "title": "서멀 비아: 피치 약 1.2mm, 방열 패드 바로 아래",
        "description": "서멀 비아는 표면의 열을 반대편 구리로 옮기는 통로다. 위치가 틀리면 효과가 없다 - 발열체 바로 아래, 간격 약 1.2mm.",
        "principles": "표면실장 부품은 기판을 통해 방열하며 그 열저항은 방열에 쓰이는 구리의 면적과 두께, 기판의 두께와 재질로 정해진다. 구리 두께는 표준 규격을 따라 무한정 두껍게 할 수 없고 기판 면적도 공간 절약 요구로 제한되며, 일정 면적을 넘으면 면적에 비례하는 방열 효과를 더 얻지 못한다. 서멀 비아는 이 한계를 넘는 수단으로, 관통 홀로 앞면과 뒷면(또는 내층) 구리를 연결해 방열에 쓰이는 면적과 부피를 늘린다. 즉 열저항을 낮춘다. 효과를 내려면 개수보다 위치가 중요하며, 비아는 발열체 가까이, 되도록 부품 바로 아래에 두어야 한다. 실무에서는 패키지 하부 방열 패드 바로 아래에 약 1.2mm 피치로 비아 배열을 두고, 그것만으로 부족하면 IC 주변에도 추가하되 역시 IC에 가까울수록 좋다.",
        "designNotes": [
          "먼저 방열 패드 바로 아래를 배열로 채우고 부족하면 주변에 추가 (" + SRC + " 2.2절)",
          "비아는 '면적이 있는' 구리에 연결해야 한다. 작은 랜드로 빼면 의미 없다",
          "스텐실 개구와 함께 설계하지 않으면 리플로우에서 솔더가 홀로 빨려 들어간다",
          "구리 면적 확대는 포화한다. 어느 지점부터는 비아와 내층 구리가 더 효과적"
        ],
        "commonMistakes": [
          "부품 바로 아래가 아니라 옆에 비아를 두어 열이 먼저 옆으로 퍼지게 만듦",
          "피치와 위치를 보지 않고 개수만 세며 많을수록 좋다고 가정",
          "비아를 좁은 구리 스트립에 연결해 퍼질 면적이 없는 경로로 열을 밀어 넣음",
          "스텐실과 리플로우 상호작용을 잊어 서멀 비아가 솔더 흡입구가 됨"
        ]
      }
    },
    "sourcePdf": null,
    "createdAt": "2026-08-01T00:00:00Z",
    "updatedAt": "2026-08-01T00:00:00Z"
  });

  CARDS.push({
    "id": "inductor-layout-eddy-current",
    "title": "電感底下不要鋪地：渦流會吃掉電感值與 Q",
    "category": "pcb-design",
    "products": ["通用"],
    "description": "電感的磁力線穿過銅箔會感應渦流，渦流反抗磁力線 → 電感值下降、Q 下降（損耗上升），訊號線還會被耦入切換雜訊。",
    "principles": "電流流過電感會產生磁力線，磁力線穿過導體（例如 PCB 的銅箔）時會在該處感應渦流。渦流的方向是抵消磁力線的方向，結果就是電感值變小、Q 值下降——Q 是描述電感損耗的參數，Q 越高損耗越小。若電感附近的銅箔是訊號線，渦流還會把切換雜訊耦合進訊號，影響電路動作。所以電感正下方不要鋪地平面，訊號線同樣不要從電感底下穿過；真的必須穿過時，要選閉磁路結構、漏磁小的電感，而且一定要實測確認。另一個容易忽略的點是電感兩個端子的走線不能太靠近：距離太短時，切換節點的高頻會經雜散電容耦合到輸出端。擺放上，電感雖然沒有輸入電容那麼關鍵，但為了降低切換節點的輻射雜訊，仍要盡量靠近 IC；而為了降低走線電阻或散熱把銅面畫得過大也不行，過大的銅面會變成天線讓 EMI 惡化——銅面「不要大過需要」。最後，電感本身是發熱元件（繞組電阻與各種損耗），溫度過高時特性會劣化，鐵氧體磁芯超過居里溫度電感值會急速下降。",
    "circuits": [],
    "keyFormulas": [
      "磁力線穿過銅箔 → 渦流 → 抵消磁力線 → L↓、Q↓（損耗↑）",
      "Q 高 = 損耗小",
      "電感兩端子走線太近 → 雜散電容把 SW 高頻耦到輸出",
      "銅面過大 → 變天線 → EMI↑（面積以夠用為準）",
      "鐵氧體磁芯超過居里溫度 → 電感值急降"
    ],
    "designNotes": [
      "電感正下方不鋪地、不走訊號線；非過不可時選閉磁路電感並實測（" + SRC + " §2.3）",
      "電感兩端子的走線刻意拉開，不要平行貼著走",
      "電感靠近 IC 以縮短 SW 節點，但銅面只做到夠散熱與夠載流即可",
      "電感的溫升要與其他熱源一起評估，特別是鐵氧體磁芯的居里溫度"
    ],
    "commonMistakes": [
      "為了「地要完整」在電感底下也鋪滿地，電感值與效率一起掉",
      "把 SW 節點銅面畫得又大又漂亮，EMI 測試直接超標",
      "訊號線從電感底下抄近路，抓不到的雜訊就從這裡進來",
      "只看規格書的電流額定，沒算實際溫升與磁芯溫度限制"
    ],
    "relatedTopics": ["buck-layout-current-loops", "emi-layout", "thermal-design", "buck-converter-advanced"],
    "i18n": {
      "en": {
        "title": "No Ground Under the Inductor: Eddy Currents Eat Inductance and Q",
        "description": "Field lines from the inductor induce eddy currents in nearby copper. The eddy currents oppose the field, so inductance and Q both fall, and signal traces pick up switching noise.",
        "principles": "Current through an inductor creates magnetic field lines, and when those lines pass through a conductor such as PCB copper they induce eddy currents in it. Those eddy currents flow so as to cancel the field, which lowers the inductance and drops the Q factor - Q describes loss in an inductor, and higher Q means lower loss. If the copper near the inductor is a signal trace, the eddy currents can also couple switching noise into that signal and disturb circuit operation. So do not run a ground plane directly under an inductor, and keep signal traces from passing underneath as well. If a trace absolutely must pass under it, choose an inductor with a closed magnetic circuit so leakage is small, and always confirm by measurement. A second point is easy to miss: the traces to the two inductor terminals must not run too close to each other, because stray capacitance will couple switch-node high frequencies into the output. As for placement, the inductor is not as critical as the input capacitor, but it should still sit close to the IC to limit radiation from the switch node. Do not enlarge the copper area for lower resistance or heat spreading beyond what is needed either - oversized copper acts as an antenna and worsens EMI. Finally, an inductor is a heat source in its own right through winding resistance and other losses; at high temperature its parts degrade, and a ferrite core past its Curie temperature loses inductance sharply.",
        "designNotes": [
          "No ground plane and no signal traces directly under the inductor; if unavoidable, use a closed-magnetic-circuit part and measure (" + SRC + " section 2.3)",
          "Deliberately separate the traces to the two inductor terminals instead of running them side by side",
          "Keep the inductor close to the IC to shorten the switch node, but size the copper only for heat and current",
          "Evaluate inductor temperature rise together with other heat sources, especially against the ferrite Curie point"
        ],
        "commonMistakes": [
          "Flooding ground under the inductor in the name of a solid plane, losing inductance and efficiency together",
          "Drawing a large, tidy switch-node copper pour and failing EMI outright",
          "Routing a signal trace under the inductor as a shortcut, which is exactly where the noise gets in",
          "Trusting only the datasheet current rating without checking real temperature rise and core limits"
        ]
      },
      "ja": {
        "title": "インダクタの真下にグランドを敷かない：渦電流がインダクタンスと Q を食う",
        "description": "インダクタの磁力線が銅箔を貫くと渦電流が生じ、磁力線を打ち消してインダクタンスと Q を下げる。信号線ならスイッチングノイズも乗る。",
        "principles": "インダクタに電流が流れると磁力線が発生し、その磁力線が PCB の銅箔などの導体を通過すると、その部分に渦電流が誘導される。渦電流は磁力線を打ち消す向きに流れるため、インダクタンスは低下し Q 値も下がる（損失増加）。Q はインダクタの損失を表すパラメータで、Q が高い＝損失が小さいという意味になる。インダクタ近傍の銅箔が信号線であれば、渦電流によってスイッチングノイズが信号へ伝播し、回路動作に悪影響を与えうる。したがってインダクタ直下には GND 層を置かず、信号線も真下を通さない。どうしても通す必要がある場合は、漏れ磁束の少ない閉磁路構造のインダクタを選び、必ず実測で確認する。見落としやすいもう一点として、インダクタ両端子の配線を近づけすぎてはいけない。距離が近いと浮遊容量を介してスイッチノードの高周波が出力へ誘導される。配置としては、インダクタは入力コンデンサほど重要ではないものの、スイッチノードからの放射ノイズを抑えるため IC の近くに置く。配線抵抗低減や放熱のために銅箔面積を広げすぎるのも禁物で、大きすぎる銅箔はアンテナとして働き EMI を悪化させる。最後に、インダクタ自身も巻線抵抗などの損失で発熱する部品であり、高温では部材が劣化し、フェライトコアはキュリー温度を超えるとインダクタンスが急激に低下する。",
        "designNotes": [
          "インダクタ直下は GND も信号線も通さない。やむを得ない場合は閉磁路品を選び実測する（" + SRC + " 2.3 節）",
          "インダクタ両端子の配線は意図的に離す。並走させない",
          "スイッチノードを短くするため IC に近づけるが、銅箔は放熱と通電に必要な分だけにする",
          "インダクタの温度上昇は他の熱源と合わせて評価する。特にフェライトのキュリー温度"
        ],
        "commonMistakes": [
          "「グランドはベタが正義」とインダクタ直下まで敷き詰め、インダクタンスと効率を同時に落とす",
          "スイッチノードの銅箔を大きく綺麗に描き、EMI 試験で一発アウト",
          "近道として信号線をインダクタの下に通し、まさにそこからノイズを拾う",
          "データシートの定格電流だけを見て、実際の温度上昇とコアの温度制限を確認しない"
        ]
      },
      "ko": {
        "title": "인덕터 아래에는 그라운드를 깔지 않는다: 와전류가 인덕턴스와 Q를 갉아먹는다",
        "description": "인덕터 자기력선이 구리를 지나면 와전류가 유도되고, 와전류는 자기력선을 상쇄해 인덕턴스와 Q를 낮춘다. 신호선이면 스위칭 노이즈까지 실린다.",
        "principles": "인덕터에 전류가 흐르면 자기력선이 생기고, 그 자기력선이 PCB 구리 같은 도체를 통과하면 그 부분에 와전류가 유도된다. 와전류는 자기력선을 상쇄하는 방향으로 흐르므로 인덕턴스가 줄고 Q 값이 떨어진다(손실 증가). Q는 인덕터의 손실을 나타내는 파라미터로, Q가 높다는 것은 손실이 작다는 뜻이다. 인덕터 근처의 구리가 신호선이라면 와전류로 스위칭 노이즈가 신호에 결합되어 회로 동작에 악영향을 줄 수 있다. 따라서 인덕터 바로 아래에는 GND 평면을 두지 않고 신호선도 통과시키지 않는다. 반드시 통과시켜야 한다면 누설 자속이 적은 폐자로 구조 인덕터를 고르고 반드시 실측으로 확인한다. 놓치기 쉬운 또 하나는 인덕터 두 단자의 배선을 너무 가깝게 두면 안 된다는 점이다. 거리가 짧으면 부유 용량을 통해 스위치 노드의 고주파가 출력으로 유도된다. 배치 면에서 인덕터는 입력 커패시터만큼 중요하지는 않지만 스위치 노드의 방사 노이즈를 줄이기 위해 IC 가까이 둔다. 배선 저항 저감이나 방열을 이유로 구리 면적을 필요 이상 넓히는 것도 금물이며, 지나치게 큰 구리는 안테나로 작용해 EMI를 악화시킨다. 마지막으로 인덕터 자체도 권선 저항 등 손실로 발열하는 부품이며, 고온에서는 부재가 열화되고 페라이트 코어는 퀴리 온도를 넘으면 인덕턴스가 급격히 떨어진다.",
        "designNotes": [
          "인덕터 바로 아래에는 GND도 신호선도 두지 않는다. 불가피하면 폐자로 부품을 고르고 실측 (" + SRC + " 2.3절)",
          "인덕터 두 단자 배선은 의도적으로 떨어뜨리고 나란히 붙여 가지 않는다",
          "스위치 노드를 짧게 하려고 IC 가까이 두되 구리는 방열과 통전에 필요한 만큼만",
          "인덕터 온도 상승은 다른 열원과 함께 평가한다. 특히 페라이트 퀴리 온도"
        ],
        "commonMistakes": [
          "'그라운드는 꽉 채워야 한다'며 인덕터 바로 아래까지 깔아 인덕턴스와 효율을 함께 잃음",
          "스위치 노드 구리를 크고 예쁘게 그려 EMI 시험에서 바로 초과",
          "지름길로 신호선을 인덕터 아래로 통과시켜 바로 그곳에서 노이즈를 받음",
          "데이터시트 정격 전류만 믿고 실제 온도 상승과 코어 온도 한계를 확인하지 않음"
        ]
      }
    },
    "sourcePdf": null,
    "createdAt": "2026-08-01T00:00:00Z",
    "updatedAt": "2026-08-01T00:00:00Z"
  });

  CARDS.push({
    "id": "feedback-and-ground-layout",
    "title": "回授走線與 AGND／PGND：訊號地與功率地怎麼分、在哪裡合",
    "category": "pcb-design",
    "products": ["通用"],
    "description": "FB 腳是高阻抗節點，撿到雜訊就是輸出誤差甚至振盪。分壓要短、取樣點要在輸出電容之後、走線要離開切換節點；AGND 與 PGND 分開走、單點相接。",
    "principles": "回授路徑把輸出電壓經分壓電阻送回 IC 的 FB 腳，也就是誤差放大器的輸入。這條路若混進實際輸出以外的雜訊或擾動，輕則輸出電壓不準，重則振盪與不穩定。四條規矩：FB 腳是高阻抗節點，到分壓中點的走線要盡可能短；輸出電壓的取樣點要取在輸出電容兩端或輸出電容之後；從輸出到分壓電阻的兩條線要平行且靠近，比較不容易撿雜訊；整條路徑要遠離電感與二極體這些切換節點，且不可走在電感或二極體正下方，也不要與功率線平行（多層板也一樣）。實務上常把回授走線經過孔繞到背面以遠離切換節點，但「越短越好」的基本原則仍在，不要為了繞遠而繞遠。地的部分：類比小訊號地（AGND／SGND）與功率地（PGND）要分開，PGND 原則上在頂層不中斷地鋪設；若 PGND 被切斷而用背面過孔接回，過孔的電阻與電感會讓損耗與雜訊惡化，必須驗證。多層板放內層或背面地平面時，共用地與訊號地要接到 PGND 上「高頻雜訊小」的位置——靠近輸出電容 CO，不可接在輸入電容 CIN 或二極體附近。頂層 PGND 與內層 PGND 之間要用多顆過孔連接以降低阻抗。很多 DC/DC IC 本來就有 AGND（SGND）與 PGND 兩支腳，理由完全相同，最終仍要在單一點連接——連接點請照該 IC 資料手冊的建議。",
    "circuits": [],
    "keyFormulas": [
      "FB 為高阻抗 → 到分壓中點走線最短",
      "取樣點：輸出電容兩端或其之後",
      "輸出到分壓的兩條線平行且靠近",
      "遠離電感／二極體；不走其正下方、不與功率線平行",
      "AGND 與 PGND 分離、單點相接；PGND 頂層不中斷",
      "共用地／訊號地接到 PGND 的位置：靠近 CO，不靠近 CIN 或 D"
    ],
    "designNotes": [
      "回授走背面是常見解法，但仍要短——不要為了避開而繞一大圈（" + SRC + " §2.5）",
      "分壓電阻靠 IC 放，中點到 FB 的那一段最敏感",
      "PGND 若必須用過孔繞背面，要驗證損耗與雜訊沒有變差",
      "AGND/PGND 的單點連接位置以 IC 資料手冊的建議為準，不要自己發明"
    ],
    "commonMistakes": [
      "回授線與電感平行走，電感磁場直接感應進回授",
      "取樣點取在輸出電容之前，量到的是含漣波的電壓",
      "把訊號地接在 CIN 或二極體附近的 PGND 上，等於把最吵的地當基準",
      "AGND 與 PGND 在多處相接形成迴路，雜訊沿地流動"
    ],
    "relatedTopics": ["grounding-design", "buck-layout-current-loops", "input-cap-layout-cin-cbypass", "em-fields-return-path"],
    "i18n": {
      "en": {
        "title": "Feedback Routing and AGND/PGND: Where to Split the Grounds and Where to Join Them",
        "description": "The FB pin is a high-impedance node: noise on it becomes output error or oscillation. Keep the divider short, sense after the output capacitor, stay away from the switch node - and join AGND to PGND at exactly one point.",
        "principles": "The feedback path returns the output voltage through a resistive divider to the FB pin, which is the input of the error amplifier. If anything other than the real output voltage reaches it, the output regulates poorly at best and oscillates at worst. Four rules follow. The FB pin is high impedance, so the wiring from the divider tap to the pin must be as short as possible. Sense the output either across the terminals of the output capacitor or after it. Run the two lines from the output to the divider parallel and close together so they pick up less noise. Keep the whole path away from switching nodes such as the inductor and the diode, never route it directly beneath them, and do not run it parallel to power wiring - the same applies on inner layers of a multilayer board. A common solution is to drop the feedback trace to the back side through a via to get away from the switch node, but the basic rule of keeping wiring short still applies; do not take a long detour for its own sake. For grounds: the analog small-signal ground (AGND or SGND) and the power ground (PGND) are laid out separately, with PGND kept unbroken on the top layer. If PGND has to be interrupted and reconnected through vias on the back, the resistance and inductance of those vias can worsen loss and noise, so verify it. When a ground plane sits on an inner layer or the back of a multilayer board, connect the common ground and signal ground to PGND at a point with little high-frequency switching noise - near the output capacitor CO, never near the input capacitor CIN or the diode. Tie the top-layer PGND to the inner-layer PGND with many vias to lower impedance. Many DC/DC ICs already provide separate AGND (SGND) and PGND pins for exactly the same reason, and they must ultimately be joined at a single point - use the connection point recommended in that IC's datasheet.",
        "designNotes": [
          "Routing feedback on the back side is a normal answer, but keep it short - do not detour for the sake of detouring (" + SRC + " section 2.5)",
          "Put the divider resistors near the IC; the tap-to-FB segment is the sensitive one",
          "If PGND must reroute through vias, verify that loss and noise did not get worse",
          "Take the AGND/PGND single-point location from the IC datasheet rather than inventing one"
        ],
        "commonMistakes": [
          "Running the feedback trace parallel to the inductor, so its field induces noise directly into the loop",
          "Sensing before the output capacitor and feeding ripple back into the error amplifier",
          "Connecting signal ground to PGND near CIN or the diode, using the noisiest ground as the reference",
          "Joining AGND and PGND in several places and creating a loop for noise to circulate in"
        ]
      },
      "ja": {
        "title": "帰還配線と AGND／PGND：信号系と電力系をどこで分け、どこで結ぶか",
        "description": "FB ピンは高インピーダンス節点。ノイズを拾えば出力誤差や発振になる。分圧は短く、検出は出力コンデンサ以降、配線はスイッチノードから離す。AGND と PGND は一点接続。",
        "principles": "帰還経路は出力電圧を分圧抵抗経由で電源 IC の FB ピン＝誤差アンプ入力へ戻す経路である。ここに実際の出力電圧以外のノイズや変動が入ると、正確な出力制御ができないだけでなく、条件によっては発振などの不安定動作を招く。守るべき点は四つ。FB ピンは高インピーダンスなので、分圧の中点から FB までの配線はできるだけ短くする。出力電圧の検出点は出力コンデンサの両端、またはそれ以降にとる。出力から分圧抵抗までの二本はノイズを拾いにくいよう平行かつ近接させる。経路全体をインダクタやダイオードといったスイッチノードから離し、それらの真下を通さず、電力系配線と並走させない（多層基板の内層でも同様）。実務では帰還配線をビアで裏面へ落としてスイッチノードから遠ざける方法がよく使われるが、「できるだけ短く」という原則は生きているため、遠ざけるためだけに大きく迂回してはいけない。グランドについては、アナログ小信号グランド（AGND／SGND）と電力グランド（PGND）を分けて配線し、PGND は原則として表層で途切れさせない。PGND が途切れてビアで裏面接続する場合、ビアの抵抗とインダクタンスにより損失とノイズが悪化しうるため検証が必要になる。多層基板の内層や裏面にグランドプレーンを置く場合、共通グランドと信号グランドは PGND の高周波ノイズが小さい位置、すなわち出力コンデンサ CO の近くに接続し、入力コンデンサ CIN やダイオードの近くには接続しない。表層 PGND と内層 PGND は多数のビアで接続してインピーダンスを下げる。多くの DC/DC IC が AGND（SGND）と PGND の二つのグランドピンを持つ理由もまったく同じで、最終的には一点で接続する。接続点は該当 IC のデータシートの推奨に従う。",
        "designNotes": [
          "帰還を裏面に回すのは定石だが短さは維持する。避けるためだけの大迂回はしない（" + SRC + " 2.5 節）",
          "分圧抵抗は IC の近くに置く。中点から FB までの区間が最も敏感",
          "PGND をビアで裏面に回さざるを得ない場合、損失とノイズが悪化していないか検証する",
          "AGND/PGND の一点接続位置は自分で決めず、IC データシートの推奨に従う"
        ],
        "commonMistakes": [
          "帰還配線をインダクタと並走させ、磁界を直接誘導させる",
          "出力コンデンサの手前で検出し、リップル込みの電圧を誤差アンプへ返す",
          "信号グランドを CIN やダイオード近傍の PGND に接続し、最も騒がしいグランドを基準にする",
          "AGND と PGND を複数箇所で接続してループを作り、ノイズをグランドに流す"
        ]
      },
      "ko": {
        "title": "피드백 배선과 AGND/PGND: 신호 그라운드와 파워 그라운드를 어디서 나누고 어디서 합칠까",
        "description": "FB 핀은 고임피던스 노드다. 노이즈를 받으면 출력 오차나 발진이 된다. 분압은 짧게, 센싱은 출력 커패시터 이후, 배선은 스위치 노드에서 멀리. AGND와 PGND는 한 점에서 연결.",
        "principles": "피드백 경로는 출력 전압을 분압 저항을 거쳐 전원 IC의 FB 핀, 즉 오차 증폭기 입력으로 되돌리는 경로다. 여기에 실제 출력 전압이 아닌 노이즈나 변동이 섞이면 정확한 출력 조정이 안 될 뿐 아니라 조건에 따라 발진 등 불안정 동작을 일으킨다. 규칙은 네 가지다. FB 핀은 고임피던스이므로 분압 중점에서 FB까지의 배선은 최대한 짧게 한다. 출력 전압 검출점은 출력 커패시터 양단 또는 그 이후로 잡는다. 출력에서 분압 저항까지의 두 선은 노이즈를 덜 받도록 나란히 가깝게 배치한다. 경로 전체를 인덕터와 다이오드 같은 스위칭 노드에서 멀리 두고, 그 바로 아래를 지나지 않으며, 전력 배선과 나란히 가지 않는다(다층 기판 내층도 동일). 실무에서는 피드백 배선을 비아로 뒷면에 내려 스위치 노드에서 멀리 두는 방법을 흔히 쓰지만 '가능한 한 짧게'라는 원칙은 그대로이므로 피하려고 크게 우회해서는 안 된다. 그라운드는 아날로그 소신호 그라운드(AGND/SGND)와 파워 그라운드(PGND)를 나누어 배선하고 PGND는 원칙적으로 상층에서 끊기지 않게 한다. PGND가 끊겨 비아로 뒷면 연결해야 한다면 비아의 저항과 인덕턴스로 손실과 노이즈가 나빠질 수 있어 검증이 필요하다. 다층 기판 내층이나 뒷면에 그라운드 평면을 둘 때 공통 그라운드와 신호 그라운드는 PGND 중 고주파 노이즈가 작은 위치, 즉 출력 커패시터 CO 근처에 연결하고 입력 커패시터 CIN이나 다이오드 근처에는 연결하지 않는다. 상층 PGND와 내층 PGND는 다수의 비아로 연결해 임피던스를 낮춘다. 많은 DC/DC IC가 AGND(SGND)와 PGND 두 개의 그라운드 핀을 갖는 이유도 완전히 같으며, 최종적으로는 한 점에서 연결한다. 연결 지점은 해당 IC 데이터시트 권장을 따른다.",
        "designNotes": [
          "피드백을 뒷면으로 돌리는 것은 정석이지만 짧게 유지한다. 피하려고 크게 우회하지 않는다 (" + SRC + " 2.5절)",
          "분압 저항은 IC 근처에 두고, 중점에서 FB까지 구간이 가장 민감하다",
          "PGND를 비아로 뒷면에 돌려야 한다면 손실과 노이즈가 나빠지지 않았는지 검증",
          "AGND/PGND 단일 접속 위치는 임의로 정하지 말고 IC 데이터시트 권장을 따른다"
        ],
        "commonMistakes": [
          "피드백 배선을 인덕터와 나란히 배치해 자기장이 그대로 유도됨",
          "출력 커패시터 앞에서 센싱해 리플이 섞인 전압을 오차 증폭기로 되돌림",
          "신호 그라운드를 CIN이나 다이오드 근처 PGND에 연결해 가장 시끄러운 그라운드를 기준으로 삼음",
          "AGND와 PGND를 여러 곳에서 연결해 루프를 만들고 노이즈가 그라운드로 흐르게 함"
        ]
      }
    },
    "sourcePdf": null,
    "createdAt": "2026-08-01T00:00:00Z",
    "updatedAt": "2026-08-01T00:00:00Z"
  });

  window.KNOWLEDGE_EXTRA = (window.KNOWLEDGE_EXTRA || []).concat(CARDS);
})();
