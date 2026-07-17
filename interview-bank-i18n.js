/**
 * interview-bank-i18n.js — 面試題庫 ja/ko 內容層（覆蓋 interview-bank.js）
 * 結構：INTERVIEW_BANK_I18N[qid] = { catJa, catKo, ja:{text,answer}, ko:{text,answer} }
 * answer 內 {{SVG}} = 沿用 zh 版電路圖（interview.html 渲染時代入，圖不重畫）。
 * 載入順序：interview-bank.js → 本檔 → interview.html 渲染時 merge。
 */
window.INTERVIEW_BANK_I18N = {};
Object.assign(window.INTERVIEW_BANK_I18N, {
 q1: {
  catJa: '一、BJT／MOSFET の基礎', catKo: '1. BJT/MOSFET 기초',
  ja: {
   text: '以下は BJT (NPN) の飽和 (ON) と遮断 (OFF) の条件です。空欄を埋めてください：<br><br><strong>BJT (NPN) 飽和：</strong>V<sub>BE</sub> [___], V<sub>BC</sub> [___], I<sub>B</sub> ( ___ ) I<sub>C</sub>/β<br><strong>BJT (NPN) 遮断：</strong>V<sub>BE</sub> [___], V<sub>BC</sub> [___], I<sub>C</sub> ( ___ ) 0',
   answer: '<strong>BJT (NPN) 飽和 (Saturation)：</strong><br><div class="formula-highlight">V<sub>BE</sub> [≥ 0.7V (順方向バイアス)], V<sub>BC</sub> [≥ 0V (順方向バイアス)]<br>I<sub>B</sub> ( &gt; ) I<sub>C</sub>/β ← オーバードライブ：ベース電流が線形動作に必要な量を超える</div><strong>BJT (NPN) 遮断 (Cutoff)：</strong><br><div class="formula-highlight">V<sub>BE</sub> [&lt; 0.7V (逆バイアスまたはしきい値未満)], V<sub>BC</sub> [&lt; 0V (逆バイアス)]<br>I<sub>C</sub> ( ≈ ) 0 ← 微小な漏れ電流 I<sub>CEO</sub> のみ</div><div class="key-point">ポイント：飽和時は BE・BC 両接合とも順バイアスで V<sub>CE(sat)</sub> ≈ 0.2V。遮断時は両接合とも逆バイアス</div>'
  },
  ko: {
   text: '다음은 BJT (NPN)의 포화 (ON) 및 차단 (OFF) 조건입니다. 빈칸을 채우세요:<br><br><strong>BJT (NPN) 포화:</strong> V<sub>BE</sub> [___], V<sub>BC</sub> [___], I<sub>B</sub> ( ___ ) I<sub>C</sub>/β<br><strong>BJT (NPN) 차단:</strong> V<sub>BE</sub> [___], V<sub>BC</sub> [___], I<sub>C</sub> ( ___ ) 0',
   answer: '<strong>BJT (NPN) 포화 (Saturation):</strong><br><div class="formula-highlight">V<sub>BE</sub> [≥ 0.7V (순방향 바이어스)], V<sub>BC</sub> [≥ 0V (순방향 바이어스)]<br>I<sub>B</sub> ( &gt; ) I<sub>C</sub>/β ← 오버드라이브: 베이스 전류가 선형 동작에 필요한 값을 초과</div><strong>BJT (NPN) 차단 (Cutoff):</strong><br><div class="formula-highlight">V<sub>BE</sub> [&lt; 0.7V (역바이어스 또는 문턱 미달)], V<sub>BC</sub> [&lt; 0V (역바이어스)]<br>I<sub>C</sub> ( ≈ ) 0 ← 미세한 누설 전류 I<sub>CEO</sub>만 존재</div><div class="key-point">핵심: 포화 시 BE·BC 두 접합 모두 순방향 바이어스, V<sub>CE(sat)</sub> ≈ 0.2V. 차단 시 두 접합 모두 역바이어스</div>'
  }
 },
 q2: {
  catJa: '一、BJT／MOSFET の基礎', catKo: '1. BJT/MOSFET 기초',
  ja: {
   text: '以下は NMOSFET のオン (ON) とオフ (OFF) の条件です。空欄を埋めてください：<br><br><strong>MOSFET (N-Ch) 飽和／ON：</strong>V<sub>GS</sub> ( ___ ) V<sub>TH</sub>, I<sub>D</sub> ( ___ ) 0<br><strong>MOSFET (N-Ch) OFF：</strong>V<sub>GS</sub> ( ___ ) V<sub>TH</sub>, I<sub>D</sub> ( ___ ) 0',
   answer: '<strong>MOSFET (N-Ch) ON：</strong><br><div class="formula-highlight">V<sub>GS</sub> ( &gt; ) V<sub>TH</sub> ← ゲート電圧がしきい値電圧を超え、チャネルが形成される<br>I<sub>D</sub> ( &gt; ) 0 ← ドレイン電流が導通</div><strong>MOSFET (N-Ch) OFF：</strong><br><div class="formula-highlight">V<sub>GS</sub> ( &lt; ) V<sub>TH</sub> ← ゲート電圧がしきい値未満、チャネル未形成<br>I<sub>D</sub> ( = ) 0 ← ドレイン電流なし（pA オーダーのリークのみ）</div><div class="key-point">注意：MOSFET は電圧制御素子（ゲートにほぼ電流が流れない）。電流制御の BJT と対照的</div>'
  },
  ko: {
   text: '다음은 NMOSFET의 ON 및 OFF 조건입니다. 빈칸을 채우세요:<br><br><strong>MOSFET (N-Ch) 포화/ON:</strong> V<sub>GS</sub> ( ___ ) V<sub>TH</sub>, I<sub>D</sub> ( ___ ) 0<br><strong>MOSFET (N-Ch) 차단:</strong> V<sub>GS</sub> ( ___ ) V<sub>TH</sub>, I<sub>D</sub> ( ___ ) 0',
   answer: '<strong>MOSFET (N-Ch) ON:</strong><br><div class="formula-highlight">V<sub>GS</sub> ( &gt; ) V<sub>TH</sub> ← 게이트 전압이 문턱 전압을 넘어 채널 형성<br>I<sub>D</sub> ( &gt; ) 0 ← 드레인 전류 도통</div><strong>MOSFET (N-Ch) OFF:</strong><br><div class="formula-highlight">V<sub>GS</sub> ( &lt; ) V<sub>TH</sub> ← 게이트 전압이 문턱 미만, 채널 미형성<br>I<sub>D</sub> ( = ) 0 ← 드레인 전류 없음 (pA 수준 누설만)</div><div class="key-point">주의: MOSFET은 전압 제어 소자 (게이트 전류 거의 0). 전류 제어인 BJT와 다름</div>'
  }
 },
 q3: {
  catJa: '一、BJT／MOSFET の基礎', catKo: '1. BJT/MOSFET 기초',
  ja: {
   text: 'BSS138 NMOS 回路解析：Q27 のゲートは 5V（10K 抵抗 R1 経由）、ドレインは 12V（10K 抵抗 R452 経由）、ソースは GND。Q28 のゲートは Q27 のドレイン（B 点）、ドレインは 5V（10K 抵抗 R453 経由）、ソースは GND。<br><br>A 点 = 5V のとき、<strong>B, C</strong> 両点の電圧レベルは？',
   answer: '<strong>解析手順：</strong><br>1. A 点 = 5V → Q27 の V<sub>GS</sub> = 5V - 0V = 5V &gt; V<sub>TH</sub>(≈1.5V) → <strong>Q27 は ON</strong><br>2. Q27 ON → ドレイン（B 点）は GND に引き下げられる（R<sub>DS(on)</sub> ≈ 数 Ω 経由）<br><div class="formula-highlight">B 点 ≈ 0V（V<sub>DS(on)</sub> ≈ I<sub>D</sub> × R<sub>DS(on)</sub> ≈ 数 mV、0V と近似可能）<br>I<sub>D</sub> = (12V - 0V) / 10KΩ = 1.2mA</div>3. B 点 ≈ 0V → Q28 の V<sub>GS</sub> = 0V &lt; V<sub>TH</sub> → <strong>Q28 は OFF</strong><br>4. Q28 OFF → ドレイン（C 点）は R453 で 5V にプルアップ<br><div class="formula-highlight">C 点 ≈ 5V（R453 に電流が流れず電圧降下なし）</div><div class="key-point">答え：B = 0V、C = 5V<br>典型的な NMOS インバータ 2 段構成（レベルシフタ）回路。A=HIGH → B=LOW → C=HIGH</div>'
  },
  ko: {
   text: 'BSS138 NMOS 회로 해석: Q27의 게이트는 5V (10K 저항 R1 경유), 드레인은 12V (10K 저항 R452 경유), 소스는 GND. Q28의 게이트는 Q27의 드레인 (B점), 드레인은 5V (10K 저항 R453 경유), 소스는 GND.<br><br>A점 = 5V일 때 <strong>B, C</strong> 두 점의 전압 레벨은?',
   answer: '<strong>해석 단계:</strong><br>1. A점 = 5V → Q27의 V<sub>GS</sub> = 5V - 0V = 5V &gt; V<sub>TH</sub>(≈1.5V) → <strong>Q27 도통 (ON)</strong><br>2. Q27 ON → 드레인 (B점)이 GND로 당겨짐 (R<sub>DS(on)</sub> ≈ 수 Ω 경유)<br><div class="formula-highlight">B점 ≈ 0V (V<sub>DS(on)</sub> ≈ I<sub>D</sub> × R<sub>DS(on)</sub> ≈ 수 mV, 0V로 근사 가능)<br>I<sub>D</sub> = (12V - 0V) / 10KΩ = 1.2mA</div>3. B점 ≈ 0V → Q28의 V<sub>GS</sub> = 0V &lt; V<sub>TH</sub> → <strong>Q28 차단 (OFF)</strong><br>4. Q28 OFF → 드레인 (C점)은 R453으로 5V에 풀업<br><div class="formula-highlight">C점 ≈ 5V (R453에 전류가 흐르지 않아 전압 강하 없음)</div><div class="key-point">정답: B = 0V, C = 5V<br>전형적인 NMOS 인버터 직렬 (레벨 시프터) 회로. A=HIGH → B=LOW → C=HIGH</div>'
  }
 },
 q4: {
  catJa: '一、BJT／MOSFET の基礎', catKo: '1. BJT/MOSFET 기초',
  ja: {
   text: 'BJT の 4 つの動作領域（遮断・活性／線形・飽和・逆活性）を説明し、各領域の V<sub>BE</sub> と V<sub>BC</sub> のバイアス条件を書いてください。',
   answer: '<table class="exam-table"><tr><th>動作領域</th><th>V<sub>BE</sub></th><th>V<sub>BC</sub></th><th>用途</th></tr><tr><td>遮断 (Cutoff)</td><td>逆バイアス (&lt;0.7V)</td><td>逆バイアス</td><td>スイッチ OFF</td></tr><tr><td>活性 (Active)</td><td>順バイアス (≈0.7V)</td><td>逆バイアス</td><td>増幅器</td></tr><tr><td>飽和 (Saturation)</td><td>順バイアス</td><td>順バイアス</td><td>スイッチ ON</td></tr><tr><td>逆活性 (Reverse)</td><td>逆バイアス</td><td>順バイアス</td><td>ほぼ未使用</td></tr></table><div class="key-point">実務ポイント：デジタル回路では BJT は主にスイッチ（遮断↔飽和）、アナログ回路では増幅器（活性領域）として使用</div>'
  },
  ko: {
   text: 'BJT의 4가지 동작 영역 (차단, 활성/선형, 포화, 역활성)을 설명하고, 각 영역의 V<sub>BE</sub>와 V<sub>BC</sub> 바이어스 조건을 쓰세요.',
   answer: '<table class="exam-table"><tr><th>동작 영역</th><th>V<sub>BE</sub></th><th>V<sub>BC</sub></th><th>용도</th></tr><tr><td>차단 (Cutoff)</td><td>역바이어스 (&lt;0.7V)</td><td>역바이어스</td><td>스위치 OFF</td></tr><tr><td>활성 (Active)</td><td>순방향 (≈0.7V)</td><td>역바이어스</td><td>증폭기</td></tr><tr><td>포화 (Saturation)</td><td>순방향</td><td>순방향</td><td>스위치 ON</td></tr><tr><td>역활성 (Reverse)</td><td>역바이어스</td><td>순방향</td><td>거의 사용 안 함</td></tr></table><div class="key-point">실무 핵심: 디지털 회로에서 BJT는 주로 스위치 (차단↔포화), 아날로그 회로에서는 증폭기 (활성 영역)로 사용</div>'
  }
 },
 q5: {
  catJa: '二、IO アーキテクチャとインターフェース設計', catKo: '2. IO 아키텍처와 인터페이스 설계',
  ja: {
   text: 'IO の <strong>Open-Drain</strong> と <strong>Push-Pull</strong> の 2 種類の出力アーキテクチャ図を描き、それぞれの特徴と用途を説明してください。',
   answer: '{{SVG}}<strong>Push-Pull（プッシュプル）：</strong><br>• 相補型 MOSFET ペア（上側 PMOS + 下側 NMOS）で構成<br>• 出力 HIGH = PMOS ON（VDD 接続）、出力 LOW = NMOS ON（GND 接続）<br>• HIGH/LOW とも能動的に駆動、高速で駆動能力が高い<br>• 欠点：ワイヤード OR 不可、複数出力の並列接続不可<br><br><strong>Open-Drain（オープンドレイン）：</strong><br>• プルダウン用 NMOS 1 個のみ、上側トランジスタなし<br>• 出力 LOW = NMOS ON（GND に引く）、HIGH = NMOS OFF（外部プルアップ抵抗 Rp で VDD へ）<br>• 利点：ワイヤード AND/OR 可、異電圧ドメイン対応（例 1.8V ↔ 3.3V）<br>• 欠点：立ち上がりが Rp × C で制限され遅い、消費電力が大きい（プルアップ電流が流れ続ける）<br><div class="key-point">用途：I2C は Open-Drain（SDA/SCL とも外部プルアップ必須）。GPIO/SPI は通常 Push-Pull</div>'
  },
  ko: {
   text: 'IO의 <strong>Open-Drain</strong>과 <strong>Push-Pull</strong> 두 가지 출력 구조도를 그리고, 각각의 특징과 용도를 설명하세요.',
   answer: '{{SVG}}<strong>Push-Pull (푸시풀):</strong><br>• 상보형 MOSFET 쌍 (상단 PMOS + 하단 NMOS)으로 구성<br>• 출력 HIGH = PMOS ON (VDD 연결), 출력 LOW = NMOS ON (GND 연결)<br>• HIGH/LOW 모두 능동 구동, 속도 빠르고 구동 능력 강함<br>• 단점: Wire-OR 불가, 여러 출력 병렬 연결 불가<br><br><strong>Open-Drain (오픈 드레인):</strong><br>• 풀다운용 NMOS 1개만 존재, 상단 트랜지스터 없음<br>• 출력 LOW = NMOS ON (GND로 당김), HIGH = NMOS OFF (외부 풀업 저항 Rp로 VDD까지)<br>• 장점: Wire-AND/OR 구현 가능, 서로 다른 전압 도메인 지원 (예: 1.8V ↔ 3.3V)<br>• 단점: 상승 에지가 Rp × C로 제한되어 느림, 소비 전력 큼 (풀업 전류 지속)<br><div class="key-point">응용: I2C는 Open-Drain (SDA/SCL 모두 외부 풀업 필요). GPIO/SPI는 보통 Push-Pull</div>'
  }
 },
 q6: {
  catJa: '二、IO アーキテクチャとインターフェース設計', catKo: '2. IO 아키텍처와 인터페이스 설계',
  ja: {
   text: '<strong>I2C バス</strong>の配線図を描いてください。Master/Slave 構成、プルアップ抵抗、SDA/SCL 信号の方向性を含めること。',
   answer: '{{SVG}}<strong>I2C バス構成のポイント：</strong><br>• SDA（データ）と SCL（クロック）はともに <strong>Open-Drain</strong> 構成で、外部プルアップ抵抗 Rp（典型 4.7KΩ）が必要<br>• SCL は <strong>Master が駆動</strong>（単方向）、Slave は Clock Stretching 時のみ SCL を Low に引く<br>• SDA は<strong>双方向</strong>：Master 書き込み時は Master が、読み出し時は Slave が駆動（ACK も Slave が駆動）<br>• 複数 Slave 接続可（各々固有の 7-bit アドレス）、同一バスの最大 Cb ≤ 400pF<br><div class="formula-highlight">Rp の選定：Rp(min) = (VDD - V<sub>OL</sub>) / I<sub>OL</sub> ≈ (3.3-0.4)/3mA ≈ 967Ω<br>Rp(max) = tr / (0.8473 × Cb) ← 立ち上がり時間要求から決定</div><div class="key-point">よくあるミス：プルアップ抵抗の付け忘れ、Rp が大きすぎ（tr 遅い）または小さすぎ（I<sub>OL</sub> が 3mA シンク能力超過）</div>'
  },
  ko: {
   text: '<strong>I2C 버스</strong> 배선도를 그리세요. Master/Slave 구조, 풀업 저항, SDA/SCL 신호 방향성을 포함할 것.',
   answer: '{{SVG}}<strong>I2C 버스 구조 핵심:</strong><br>• SDA (데이터)와 SCL (클럭) 모두 <strong>Open-Drain</strong> 구조로 외부 풀업 저항 Rp (일반적으로 4.7KΩ) 필요<br>• SCL은 <strong>Master가 구동</strong> (단방향), Slave는 Clock Stretching 시에만 SCL을 Low로 당김<br>• SDA는 <strong>양방향</strong>: Master 쓰기 시 Master가, 읽기 시 Slave가 구동 (ACK도 Slave가 구동)<br>• 여러 Slave 연결 가능 (각각 고유 7-bit 주소), 동일 버스 최대 Cb ≤ 400pF<br><div class="formula-highlight">Rp 선정: Rp(min) = (VDD - V<sub>OL</sub>) / I<sub>OL</sub> ≈ (3.3-0.4)/3mA ≈ 967Ω<br>Rp(max) = tr / (0.8473 × Cb) ← 상승 시간 요구로 결정</div><div class="key-point">흔한 실수: 풀업 저항 누락, Rp가 너무 큼 (tr 느림) 또는 너무 작음 (I<sub>OL</sub>이 3mA 싱크 능력 초과)</div>'
  }
 },
 q7: {
  catJa: '二、IO アーキテクチャとインターフェース設計', catKo: '2. IO 아키텍처와 인터페이스 설계',
  ja: {
   text: 'SPI Mode は何種類ありますか？どの 2 つのパラメータで決まりますか？',
   answer: '<strong>SPI には 4 つのモード</strong>があり、CPOL（クロック極性）と CPHA（クロック位相）の 2 パラメータで決まります：<br><br><table class="exam-table"><tr><th>Mode</th><th>CPOL</th><th>CPHA</th><th>説明</th></tr><tr><td>Mode 0</td><td>0</td><td>0</td><td>アイドル LOW、最初のエッジでサンプル（最も一般的）</td></tr><tr><td>Mode 1</td><td>0</td><td>1</td><td>アイドル LOW、2 番目のエッジでサンプル</td></tr><tr><td>Mode 2</td><td>1</td><td>0</td><td>アイドル HIGH、最初のエッジでサンプル</td></tr><tr><td>Mode 3</td><td>1</td><td>1</td><td>アイドル HIGH、2 番目のエッジでサンプル</td></tr></table><div class="key-point">CPOL は SCLK アイドル時のレベル（0=LOW, 1=HIGH）<br>CPHA はデータをサンプルするクロックエッジ（0=最初, 1=2 番目）<br>Master と Slave は同じ Mode に設定しないと通信できない！</div>'
  },
  ko: {
   text: 'SPI Mode는 몇 가지 형식이 있습니까? 어떤 두 파라미터로 결정됩니까?',
   answer: '<strong>SPI에는 4가지 모드</strong>가 있으며, CPOL (클럭 극성)과 CPHA (클럭 위상) 두 파라미터로 결정됩니다:<br><br><table class="exam-table"><tr><th>Mode</th><th>CPOL</th><th>CPHA</th><th>설명</th></tr><tr><td>Mode 0</td><td>0</td><td>0</td><td>유휴 LOW, 첫 에지에서 샘플 (가장 많이 사용)</td></tr><tr><td>Mode 1</td><td>0</td><td>1</td><td>유휴 LOW, 두 번째 에지에서 샘플</td></tr><tr><td>Mode 2</td><td>1</td><td>0</td><td>유휴 HIGH, 첫 에지에서 샘플</td></tr><tr><td>Mode 3</td><td>1</td><td>1</td><td>유휴 HIGH, 두 번째 에지에서 샘플</td></tr></table><div class="key-point">CPOL은 SCLK 유휴 시 레벨 결정 (0=LOW, 1=HIGH)<br>CPHA는 몇 번째 클럭 에지에서 데이터를 샘플할지 결정 (0=첫 에지, 1=두 번째)<br>Master와 Slave는 반드시 같은 Mode로 설정해야 통신 가능!</div>'
  }
 },
 q8: {
  catJa: '二、IO アーキテクチャとインターフェース設計', catKo: '2. IO 아키텍처와 인터페이스 설계',
  ja: {
   text: 'SPI の回路設計ではバスに抵抗を直列に入れることがよくあります：<br>1. どの Pin（SCLK/MOSI/MISO/CS#）に入れる？<br>2. どちら側（Master か Slave か）の近く？<br>3. この抵抗の目的は？',
   answer: '<strong>1. どの Pin に入れる？</strong><br>通常 <strong>SCLK・MOSI・CS#</strong>（Master が出力する信号線）に入れる。MISO はあまり入れない。<br><br><strong>2. どちら側の近く？</strong><br>直列抵抗は<strong>信号源側（Master 側）</strong>に、できるだけ近く配置する。<br><br><strong>3. 目的は？</strong><br><div class="formula-highlight">• インピーダンス整合／直列終端 (Series Termination)：R ≈ Z₀ - R<sub>out</sub>（典型 22-33Ω）<br>• 反射の抑制：伝送線路のインピーダンス不連続によるリンギングを除去<br>• EMI 低減：エッジレート（スルーレート）を緩め高周波放射を低減<br>• オーバーシュート／アンダーシュートの抑制</div><div class="key-point">設計ポイント：抵抗値は通常 22Ω~33Ω、Source 側（Master）に配置。配線が非常に短い（&lt; 1cm）場合は省略可。<br>MISO に入れる場合は Slave 側に配置（その信号の Source は Slave のため）。</div>'
  },
  ko: {
   text: 'SPI 회로 설계 시 버스에 저항을 직렬로 넣는 경우가 많습니다:<br>1. 어느 Pin (SCLK/MOSI/MISO/CS#)에 넣습니까?<br>2. 어느 쪽 (Master 또는 Slave)에 가깝게?<br>3. 이 저항의 목적은?',
   answer: '<strong>1. 어느 Pin에?</strong><br>보통 <strong>SCLK, MOSI, CS#</strong> (Master가 출력하는 신호선)에 넣음. MISO에는 잘 넣지 않음.<br><br><strong>2. 어느 쪽에 가깝게?</strong><br>직렬 저항은 <strong>신호원 쪽 (Master 쪽)</strong>에, 가능한 한 가깝게 배치.<br><br><strong>3. 목적은?</strong><br><div class="formula-highlight">• 임피던스 매칭 / 직렬 종단 (Series Termination): R ≈ Z₀ - R<sub>out</sub> (일반 22-33Ω)<br>• 반사 억제: 전송선 임피던스 불연속에 의한 링잉 제거<br>• EMI 저감: 에지 속도 (slew rate)를 늦춰 고주파 방사 감소<br>• 오버슈트/언더슈트 억제</div><div class="key-point">설계 포인트: 저항값은 보통 22Ω~33Ω, Source 쪽 (Master)에 배치. 배선이 아주 짧으면 (&lt; 1cm) 생략 가능.<br>MISO에 넣을 경우 Slave 쪽에 배치 (해당 신호의 Source가 Slave이므로).</div>'
  }
 },
 q9: {
  catJa: '三、DC-DC 電源設計', catKo: '3. DC-DC 전원 설계',
  ja: {
   text: '以下の DC-DC Buck 回路にはハイサイド MOSFET とローサイドがあります。ローサイドが（ダイオードではなく）MOSFET の場合、これは Synchronous と Non-synchronous のどちらの Buck 回路ですか？',
   answer: '<div class="formula-highlight"><strong>答え：Synchronous（同期）Buck</strong></div><strong>判断根拠：</strong><br>• <strong>Synchronous Buck</strong>：上下とも MOSFET → 高効率（R<sub>DS(on)</sub> の電圧降下が小さい）<br>• <strong>Non-synchronous Buck</strong>：ハイサイド MOSFET + ローサイドはダイオード（ショットキー）→ 低コストだが効率は低い（ダイオード V<sub>F</sub> ≈ 0.3-0.5V）<br><br><div class="key-point">同期整流の利点：低出力電圧（1.0V/0.8V など）で効率差がより顕著。<br>欠点：シュートスルー（上下同時導通）防止のためデッドタイム制御が必要</div>'
  },
  ko: {
   text: '다음 DC-DC Buck 회로에는 상단 (High-Side MOSFET)과 하단 (Low-Side)이 있습니다. 하단이 (다이오드가 아닌) MOSFET이라면 이것은 Synchronous입니까 Non-synchronous Buck 회로입니까?',
   answer: '<div class="formula-highlight"><strong>정답: Synchronous (동기) Buck</strong></div><strong>판단 근거:</strong><br>• <strong>Synchronous Buck</strong>: 상단 + 하단 모두 MOSFET → 고효율 (R<sub>DS(on)</sub> 전압 강하 작음)<br>• <strong>Non-synchronous Buck</strong>: 상단 MOSFET + 하단은 다이오드 (쇼트키) → 저비용이지만 효율 낮음 (다이오드 V<sub>F</sub> ≈ 0.3-0.5V)<br><br><div class="key-point">동기 정류 장점: 낮은 출력 전압 (1.0V/0.8V 등)에서 효율 차이가 더 뚜렷.<br>단점: shoot-through (상하 동시 도통) 방지를 위한 dead time 제어 필요</div>'
  }
 }
});
Object.assign(window.INTERVIEW_BANK_I18N, {
 q10: {
  catJa: '三、DC-DC 電源設計', catKo: '3. DC-DC 전원 설계',
  ja: {
   text: 'Buck 回路の <strong>D1 ダイオード</strong>（または Body Diode）の役割は何ですか？',
   answer: '<strong>D1（還流ダイオード / Freewheeling Diode）の機能：</strong><br><br>1. <strong>還流動作</strong>：ハイサイド OFF 時、インダクタ電流は瞬時に途切れない（V = L × di/dt）ため、D1 が電流の還流経路を提供<br>2. <strong>デッドタイム導通</strong>：同期 Buck では上下切り替えのデッドタイム中、MOSFET の Body Diode を通して還流<br>3. <strong>保護動作</strong>：インダクタの逆起電力 (Back-EMF) による MOSFET 破損を防止<br><div class="formula-highlight">Non-synchronous Buck：D1 = 独立ショットキーダイオード（V<sub>F</sub> ≈ 0.3V）<br>Synchronous Buck：D1 = ローサイド MOSFET の Body Diode（デッドタイム時のみ導通）</div><div class="key-point">設計ポイント：デッドタイムは短いほど良い（Body Diode 導通損失の低減）が、短すぎるとシュートスルーの危険</div>'
  },
  ko: {
   text: 'Buck 회로의 <strong>D1 다이오드</strong> (또는 Body Diode)의 용도는 무엇입니까?',
   answer: '<strong>D1 (환류 다이오드 / Freewheeling Diode)의 기능:</strong><br><br>1. <strong>환류 작용</strong>: 상단 OFF 시 인덕터 전류는 순간적으로 끊길 수 없어 (V = L × di/dt), D1이 전류 환류 경로 제공<br>2. <strong>Dead Time 도통</strong>: 동기 Buck에서 상하단 전환의 Dead Time 동안 MOSFET의 Body Diode를 통해 환류<br>3. <strong>보호 작용</strong>: 인덕터 역기전력 (Back-EMF)에 의한 MOSFET 손상 방지<br><div class="formula-highlight">Non-synchronous Buck: D1 = 독립 쇼트키 다이오드 (V<sub>F</sub> ≈ 0.3V)<br>Synchronous Buck: D1 = Low-Side MOSFET의 Body Diode (Dead Time에 도통)</div><div class="key-point">설계 포인트: Dead Time은 짧을수록 좋음 (body diode 도통 손실 감소), 너무 짧으면 shoot-through 위험</div>'
  }
 },
 q11: {
  catJa: '三、DC-DC 電源設計', catKo: '3. DC-DC 전원 설계',
  ja: {
   text: 'DC-DC 回路で SR2, SC3 が構成する回路は何と呼ばれますか？その機能は？',
   answer: '<div class="formula-highlight"><strong>Snubber（スナバ）回路</strong>、RC Snubber とも呼ぶ</div><strong>機能：</strong><br>1. <strong>電圧スパイクの抑制</strong>：MOSFET スイッチング瞬間、寄生インダクタンス L<sub>stray</sub> が V = L × di/dt のスパイクを発生<br>2. <strong>リンギングの低減</strong>：寄生 LC 共振による高周波振動<br>3. <strong>EMI 低減</strong>：高周波エネルギーを吸収し放射ノイズを低減<br>4. <strong>MOSFET 保護</strong>：V<sub>DS</sub> スパイクが V<sub>BR(DSS)</sub> を超える絶縁破壊を防止<br><br><div class="formula-highlight">設計：R = √(L<sub>stray</sub>/C<sub>oss</sub>), C &gt; 2×C<sub>oss</sub><br>典型値：R = 1-10Ω, C = 100pF-1nF</div><div class="key-point">配置：MOSFET の Drain-Source 端子にできるだけ近く</div>'
  },
  ko: {
   text: 'DC-DC 회로에서 SR2, SC3가 구성하는 회로는 무엇이라고 부릅니까? 그 기능은?',
   answer: '<div class="formula-highlight"><strong>Snubber (스너버) 회로</strong>, RC Snubber라고도 함</div><strong>기능:</strong><br>1. <strong>전압 스파이크 억제</strong>: MOSFET 스위칭 순간 기생 인덕턴스 L<sub>stray</sub>가 V = L × di/dt 스파이크 발생<br>2. <strong>링잉 감소</strong>: 기생 LC 공진에 의한 고주파 진동<br>3. <strong>EMI 저감</strong>: 고주파 에너지를 흡수해 방사 간섭 감소<br>4. <strong>MOSFET 보호</strong>: V<sub>DS</sub> 스파이크가 V<sub>BR(DSS)</sub>를 초과하는 절연 파괴 방지<br><br><div class="formula-highlight">설계: R = √(L<sub>stray</sub>/C<sub>oss</sub>), C &gt; 2×C<sub>oss</sub><br>일반값: R = 1-10Ω, C = 100pF-1nF</div><div class="key-point">배치 위치: MOSFET의 Drain-Source 단자에 최대한 가깝게</div>'
  }
 },
 q12: {
  catJa: '三、DC-DC 電源設計', catKo: '3. DC-DC 전원 설계',
  ja: {
   text: '5VDUAL = +5V、V_SM = +1.5V のとき、この Buck 回路の <strong>Duty Cycle</strong> = ?',
   answer: '<strong>Buck コンバータの Duty Cycle 公式：</strong><br><div class="formula-highlight">D = V<sub>OUT</sub> / V<sub>IN</sub> = V_SM / 5VDUAL = 1.5V / 5V = <strong>0.3（30%）</strong></div>これは理想値（ダイオード電圧降下と MOSFET R<sub>DS(on)</sub> 損失を無視）。<br><br>損失を考慮した実際の式：<br><div class="formula-highlight">D = (V<sub>OUT</sub> + V<sub>DS(low)</sub>) / (V<sub>IN</sub> - V<sub>DS(high)</sub> + V<sub>DS(low)</sub>)<br>≈ (1.5 + 0.05) / (5 - 0.05 + 0.05) ≈ 0.31（31%）</div><div class="key-point">答え：D ≈ 30%（理想）/ 31%（実際）<br>意味：ハイサイド MOSFET が 1 周期のうち 30% の時間導通する</div>'
  },
  ko: {
   text: '5VDUAL = +5V, V_SM = +1.5V일 때, 이 Buck 회로의 <strong>Duty Cycle</strong> = ?',
   answer: '<strong>Buck 컨버터 Duty Cycle 공식:</strong><br><div class="formula-highlight">D = V<sub>OUT</sub> / V<sub>IN</sub> = V_SM / 5VDUAL = 1.5V / 5V = <strong>0.3 (30%)</strong></div>이것은 이상적인 경우 (다이오드 전압 강하와 MOSFET R<sub>DS(on)</sub> 손실 무시).<br><br>손실을 고려한 실제 공식:<br><div class="formula-highlight">D = (V<sub>OUT</sub> + V<sub>DS(low)</sub>) / (V<sub>IN</sub> - V<sub>DS(high)</sub> + V<sub>DS(low)</sub>)<br>≈ (1.5 + 0.05) / (5 - 0.05 + 0.05) ≈ 0.31 (31%)</div><div class="key-point">정답: D ≈ 30% (이상) / 31% (실제)<br>의미: 상단 (High-Side MOSFET)이 한 주기 중 30% 시간 동안 도통</div>'
  }
 },
 q13: {
  catJa: '三、DC-DC 電源設計', catKo: '3. DC-DC 전원 설계',
  ja: {
   text: 'Buck コンバータの電流経路図を描き、ハイサイド ON と OFF それぞれの電流の流れを示してください。',
   answer: '{{SVG}}<strong>ハイサイド ON（Phase 1）：</strong><br>電流経路：V<sub>IN</sub> → High-Side MOSFET → インダクタ L → 負荷 → GND<br>インダクタは蓄エネ（i<sub>L</sub> 上昇）、di/dt = (V<sub>IN</sub> - V<sub>OUT</sub>)/L<br><br><strong>ハイサイド OFF（Phase 2）：</strong><br>電流経路：GND → Low-Side MOSFET/Diode → インダクタ L → 負荷 → GND<br>インダクタは放エネ（i<sub>L</sub> 下降）、di/dt = -V<sub>OUT</sub>/L<br><div class="key-point">ポイント：インダクタ電流が連続（CCM）なら両フェーズが交互動作。軽負荷では不連続モード（DCM）に入りインダクタ電流がゼロになることがある</div>'
  },
  ko: {
   text: 'Buck 컨버터의 전류 경로도를 그리고, 상단 ON과 상단 OFF 시 전류 흐름을 각각 표시하세요.',
   answer: '{{SVG}}<strong>상단 ON (Phase 1):</strong><br>전류 경로: V<sub>IN</sub> → High-Side MOSFET → 인덕터 L → 부하 → GND<br>인덕터 에너지 저장 (i<sub>L</sub> 상승), di/dt = (V<sub>IN</sub> - V<sub>OUT</sub>)/L<br><br><strong>상단 OFF (Phase 2):</strong><br>전류 경로: GND → Low-Side MOSFET/Diode → 인덕터 L → 부하 → GND<br>인덕터 에너지 방출 (i<sub>L</sub> 하강), di/dt = -V<sub>OUT</sub>/L<br><div class="key-point">핵심: 인덕터 전류 연속 (CCM) 시 두 페이즈 교대. 경부하 시 불연속 모드 (DCM)에 들어가 인덕터 전류가 0까지 떨어질 수 있음</div>'
  }
 },
 q14: {
  catJa: '四、デジタル論理ゲートと真理値表', catKo: '4. 디지털 논리 게이트와 진리표',
  ja: {
   text: '以下の論理ゲートの真理値表を埋めてください：<br><br><table class="exam-table"><tr><th>A</th><th>B</th><th>AND</th><th>OR</th><th>NAND</th><th>NOR</th><th>XOR</th></tr><tr><td>0</td><td>0</td><td>?</td><td>?</td><td>?</td><td>?</td><td>?</td></tr><tr><td>0</td><td>1</td><td>?</td><td>?</td><td>?</td><td>?</td><td>?</td></tr><tr><td>1</td><td>0</td><td>?</td><td>?</td><td>?</td><td>?</td><td>?</td></tr><tr><td>1</td><td>1</td><td>?</td><td>?</td><td>?</td><td>?</td><td>?</td></tr></table>',
   answer: '<table class="exam-table"><tr><th>A</th><th>B</th><th>AND</th><th>OR</th><th>NAND</th><th>NOR</th><th>XOR</th></tr><tr><td>0</td><td>0</td><td>0</td><td>0</td><td>1</td><td>1</td><td>0</td></tr><tr><td>0</td><td>1</td><td>0</td><td>1</td><td>1</td><td>0</td><td>1</td></tr><tr><td>1</td><td>0</td><td>0</td><td>1</td><td>1</td><td>0</td><td>1</td></tr><tr><td>1</td><td>1</td><td>1</td><td>1</td><td>0</td><td>0</td><td>0</td></tr></table><div class="formula-highlight">AND: 全て 1 で 1 | OR: どれか 1 で 1 | NAND: AND の反転 | NOR: OR の反転 | XOR: 異なれば 1</div><div class="key-point">NOT ゲート（インバータ）：入力 0→出力 1、入力 1→出力 0<br>NAND はユニバーサルゲート：NAND の組み合わせで他の全ての論理ゲートを実現可能</div>'
  },
  ko: {
   text: '다음 논리 게이트의 진리표를 채우세요:<br><br><table class="exam-table"><tr><th>A</th><th>B</th><th>AND</th><th>OR</th><th>NAND</th><th>NOR</th><th>XOR</th></tr><tr><td>0</td><td>0</td><td>?</td><td>?</td><td>?</td><td>?</td><td>?</td></tr><tr><td>0</td><td>1</td><td>?</td><td>?</td><td>?</td><td>?</td><td>?</td></tr><tr><td>1</td><td>0</td><td>?</td><td>?</td><td>?</td><td>?</td><td>?</td></tr><tr><td>1</td><td>1</td><td>?</td><td>?</td><td>?</td><td>?</td><td>?</td></tr></table>',
   answer: '<table class="exam-table"><tr><th>A</th><th>B</th><th>AND</th><th>OR</th><th>NAND</th><th>NOR</th><th>XOR</th></tr><tr><td>0</td><td>0</td><td>0</td><td>0</td><td>1</td><td>1</td><td>0</td></tr><tr><td>0</td><td>1</td><td>0</td><td>1</td><td>1</td><td>0</td><td>1</td></tr><tr><td>1</td><td>0</td><td>0</td><td>1</td><td>1</td><td>0</td><td>1</td></tr><tr><td>1</td><td>1</td><td>1</td><td>1</td><td>0</td><td>0</td><td>0</td></tr></table><div class="formula-highlight">AND: 모두 1이면 1 | OR: 하나라도 1이면 1 | NAND: AND 반전 | NOR: OR 반전 | XOR: 다르면 1</div><div class="key-point">NOT 게이트 (인버터): 입력 0→출력 1, 입력 1→출력 0<br>NAND는 범용 게이트 (Universal Gate): NAND 조합으로 다른 모든 논리 게이트 구현 가능</div>'
  }
 },
 q15: {
  catJa: '四、デジタル論理ゲートと真理値表', catKo: '4. 디지털 논리 게이트와 진리표',
  ja: {
   text: 'NMOS インバータ回路：上側は 10KΩ で 5V にプルアップ、NMOS のドレインが抵抗に接続、ソースは GND。<br>INPUT: L = 0V, H &gt; V<sub>TH</sub> のとき、OUTPUT 波形を描いてください。',
   answer: '<strong>NMOS インバータの動作原理：</strong><br><div class="formula-highlight">INPUT = LOW (0V)：V<sub>GS</sub> &lt; V<sub>TH</sub> → NMOS OFF → OUTPUT はプルアップされ <strong>5V (HIGH)</strong><br>INPUT = HIGH (&gt;V<sub>TH</sub>)：V<sub>GS</sub> &gt; V<sub>TH</sub> → NMOS ON → OUTPUT は <strong>≈ 0V (LOW)</strong> に引かれる</div>出力波形は入力の<strong>反転</strong>：<br>• 入力 LOW → 出力 HIGH (5V)<br>• 入力 HIGH → 出力 LOW (≈0V、実際は V<sub>DS(on)</sub> ≈ 数十 mV)<br><div class="key-point">注意：立ち上がりは遅い（R×C 充電で決まる）、立ち下がりは速い（NMOS の R<sub>DS(on)</sub> が低い）<br>これが Open-Drain の基本原理！BSS138 レベルシフタもこの構成。</div>'
  },
  ko: {
   text: 'NMOS 인버터 회로: 상단은 10KΩ으로 5V에 풀업, NMOS 드레인이 저항에 연결, 소스는 GND.<br>INPUT: L = 0V, H &gt; V<sub>TH</sub>일 때 OUTPUT 파형을 그리세요.',
   answer: '<strong>NMOS 인버터 동작 원리:</strong><br><div class="formula-highlight">INPUT = LOW (0V): V<sub>GS</sub> &lt; V<sub>TH</sub> → NMOS OFF → OUTPUT은 풀업되어 <strong>5V (HIGH)</strong><br>INPUT = HIGH (&gt;V<sub>TH</sub>): V<sub>GS</sub> &gt; V<sub>TH</sub> → NMOS ON → OUTPUT은 <strong>≈ 0V (LOW)</strong>로 당겨짐</div>출력 파형은 입력과 <strong>반전</strong>:<br>• 입력 LOW → 출력 HIGH (5V)<br>• 입력 HIGH → 출력 LOW (≈0V, 실제로는 V<sub>DS(on)</sub> ≈ 수십 mV)<br><div class="key-point">주의: 상승 에지는 느림 (R×C 충전으로 결정), 하강 에지는 빠름 (NMOS R<sub>DS(on)</sub>이 매우 낮음)<br>이것이 Open-Drain의 기본 원리! BSS138 레벨 시프터가 바로 이 구조.</div>'
  }
 },
 q16: {
  catJa: '五、I2C プロトコル上級検証', catKo: '5. I2C 프로토콜 심화 검증',
  ja: {
   text: 'I2C Fast Mode 規格における SCL の 5 つの重要タイミング試験項目は？各項目の規格値を挙げてください。',
   answer: '<table class="exam-table"><tr><th>#</th><th>試験項目</th><th>規格 (Fast Mode)</th><th>測定点</th></tr><tr><td>1</td><td>fSCL 周波数</td><td>≤ 400 kHz</td><td>SCL 周期</td></tr><tr><td>2</td><td>tLOW / tHIGH</td><td>≥ 1.3µs / ≥ 0.6µs</td><td>30%/70% VDD 交差</td></tr><tr><td>3</td><td>tr / tf 立ち上がり/立ち下がり</td><td>20~300ns / ≤ 300ns</td><td>30%~70% VDD</td></tr><tr><td>4</td><td>tSU:DAT / tHD:DAT</td><td>≥ 100ns / 0~0.9µs</td><td>SDA vs SCL エッジ</td></tr><tr><td>5</td><td>Start/Stop タイミング</td><td>tHD:STA ≥ 0.6µs, tSU:STO ≥ 0.6µs, tBUF ≥ 1.3µs</td><td>SDA/SCL エッジ</td></tr></table><div class="key-point">★ 第 3 項の tr/tf が最も FAIL しやすい項目！<br>Fix: Rp を下げる（4.7K→2.2K→1K）またはバス容量 Cb を減らす（配線短縮）<br>tr ≈ 0.8473 × Rp × Cb</div>'
  },
  ko: {
   text: 'I2C Fast Mode 규격에서 SCL의 5가지 핵심 타이밍 테스트는 무엇입니까? 각 항목의 규격값을 나열하세요.',
   answer: '<table class="exam-table"><tr><th>#</th><th>테스트 항목</th><th>규격 (Fast Mode)</th><th>측정점</th></tr><tr><td>1</td><td>fSCL 주파수</td><td>≤ 400 kHz</td><td>SCL 주기</td></tr><tr><td>2</td><td>tLOW / tHIGH</td><td>≥ 1.3µs / ≥ 0.6µs</td><td>30%/70% VDD 교차</td></tr><tr><td>3</td><td>tr / tf 상승/하강</td><td>20~300ns / ≤ 300ns</td><td>30%~70% VDD</td></tr><tr><td>4</td><td>tSU:DAT / tHD:DAT</td><td>≥ 100ns / 0~0.9µs</td><td>SDA vs SCL 에지</td></tr><tr><td>5</td><td>Start/Stop 타이밍</td><td>tHD:STA ≥ 0.6µs, tSU:STO ≥ 0.6µs, tBUF ≥ 1.3µs</td><td>SDA/SCL 에지</td></tr></table><div class="key-point">★ 3번 tr/tf가 가장 흔한 FAIL 항목!<br>Fix: Rp를 낮추거나 (4.7K→2.2K→1K) 버스 커패시턴스 Cb 감소 (배선 단축)<br>tr ≈ 0.8473 × Rp × Cb</div>'
  }
 },
 q17: {
  catJa: '五、I2C プロトコル上級検証', catKo: '5. I2C 프로토콜 심화 검증',
  ja: {
   text: 'I2C バスの Cb = 200pF、目標 tr = 300ns（Fast Mode 最大値）のとき、許容される最大プルアップ抵抗 Rp を計算してください。',
   answer: '<div class="formula-highlight">tr ≈ 0.8473 × Rp × Cb<br>Rp = tr / (0.8473 × Cb)<br>Rp = 300ns / (0.8473 × 200pF)<br>Rp = 300 × 10⁻⁹ / (0.8473 × 200 × 10⁻¹²)<br>Rp = 300 / 169.46 × 10³<br><strong>Rp ≈ 1.77 KΩ（最大値）</strong></div><div class="key-point">実務での選定：1.5KΩ（マージン確保）または 1.8KΩ（標準抵抗値）<br>同時に Rp(min) = (VDD - VOL) / IOL ≈ (3.3-0.4)/3mA = 967Ω も確認<br>よって Rp 範囲：967Ω ~ 1770Ω、<strong>1.5KΩ</strong> が安全</div>'
  },
  ko: {
   text: 'I2C 버스의 Cb = 200pF, 목표 tr = 300ns (Fast Mode 최대값)일 때, 허용되는 최대 풀업 저항 Rp 값을 계산하세요.',
   answer: '<div class="formula-highlight">tr ≈ 0.8473 × Rp × Cb<br>Rp = tr / (0.8473 × Cb)<br>Rp = 300ns / (0.8473 × 200pF)<br>Rp = 300 × 10⁻⁹ / (0.8473 × 200 × 10⁻¹²)<br>Rp = 300 / 169.46 × 10³<br><strong>Rp ≈ 1.77 KΩ (최대값)</strong></div><div class="key-point">실무 선택: 1.5KΩ (여유 확보) 또는 1.8KΩ (표준 저항값)<br>동시에 Rp(min) = (VDD - VOL) / IOL ≈ (3.3-0.4)/3mA = 967Ω 확인 필요<br>따라서 Rp 범위: 967Ω ~ 1770Ω, <strong>1.5KΩ</strong>이 안전</div>'
  }
 },
 q18: {
  catJa: '五、I2C プロトコル上級検証', catKo: '5. I2C 프로토콜 심화 검증',
  ja: {
   text: 'I2C の tr（立ち上がり時間）が FAIL のとき、正しくない修正方法は次のどれ？<br><span class="exam-option">(A) プルアップ抵抗 Rp を下げる（4.7K→2.2K）</span><span class="exam-option">(B) PCB 配線を短縮して Cb を減らす</span><span class="exam-option">(C) プルアップ抵抗 Rp を上げる（2.2K→10K）</span><span class="exam-option">(D) バス上の Slave 数を減らす</span>',
   answer: '<div class="formula-highlight">答え：<strong>(C) プルアップ抵抗 Rp を上げる（2.2K→10K）</strong> ← これが間違い！</div><strong>分析：</strong><br>• (A) ✓ Rp を下げる → プルアップ電流増加 → 充電が速い → tr 減少<br>• (B) ✓ 配線短縮 → Cb 減少 → RC 時定数減少 → tr 減少<br>• (C) ✗ Rp を上げる → プルアップ電流減少 → 充電が遅い → <strong>tr はさらに増大、FAIL 悪化！</strong><br>• (D) ✓ Slave 削減 → バス負荷容量 Cb 減少 → tr 減少<br><div class="key-point">覚え方：tr ≈ 0.8473 × Rp × Cb<br>tr FAIL = tr が大きすぎ → Rp か Cb を下げる</div>'
  },
  ko: {
   text: 'I2C tr (상승 시간) FAIL 시, 다음 중 올바르지 않은 수정 방법은?<br><span class="exam-option">(A) 풀업 저항 Rp 낮추기 (4.7K→2.2K)</span><span class="exam-option">(B) PCB 배선 길이를 줄여 Cb 감소</span><span class="exam-option">(C) 풀업 저항 Rp 올리기 (2.2K→10K)</span><span class="exam-option">(D) 버스의 Slave 수 줄이기</span>',
   answer: '<div class="formula-highlight">정답: <strong>(C) 풀업 저항 Rp 올리기 (2.2K→10K)</strong> ← 이것이 잘못된 방법!</div><strong>분석:</strong><br>• (A) ✓ Rp 낮춤 → 풀업 전류 증가 → 충전 빨라짐 → tr 감소<br>• (B) ✓ 배선 단축 → Cb 감소 → RC 시정수 감소 → tr 감소<br>• (C) ✗ Rp 올림 → 풀업 전류 감소 → 충전 느려짐 → <strong>tr 오히려 증가, FAIL 더 심각!</strong><br>• (D) ✓ Slave 감소 → 버스 부하 커패시턴스 Cb 감소 → tr 감소<br><div class="key-point">기억: tr ≈ 0.8473 × Rp × Cb<br>tr FAIL = tr이 너무 큼 → Rp 또는 Cb를 낮춰야 함</div>'
  }
 }
});
Object.assign(window.INTERVIEW_BANK_I18N, {
 q19: {
  catJa: '六、総合回路設計', catKo: '6. 종합 회로 설계',
  ja: {
   text: 'LDO の入力 5V、出力 3.3V、負荷電流 500mA のとき、LDO の電力損失と効率を計算してください。',
   answer: '<div class="formula-highlight">P<sub>loss</sub> = (V<sub>IN</sub> - V<sub>OUT</sub>) × I<sub>LOAD</sub><br>P<sub>loss</sub> = (5V - 3.3V) × 500mA = 1.7V × 0.5A = <strong>0.85W</strong></div><div class="formula-highlight">η = V<sub>OUT</sub> / V<sub>IN</sub> × 100%<br>η = 3.3V / 5V × 100% = <strong>66%</strong></div><div class="key-point">0.85W の損失はかなりの発熱となるため、パッケージの熱抵抗 θ<sub>JA</sub> を考慮する必要がある。<br>θ<sub>JA</sub> = 50°C/W、周囲温度 25°C なら → T<sub>J</sub> = 25 + 0.85×50 = 67.5°C<br>入出力電圧差や電流がさらに大きい場合は Buck コンバータへの置き換えを検討</div>'
  },
  ko: {
   text: 'LDO 입력 5V, 출력 3.3V, 부하 전류 500mA일 때 LDO의 전력 손실과 효율을 계산하세요.',
   answer: '<div class="formula-highlight">P<sub>loss</sub> = (V<sub>IN</sub> - V<sub>OUT</sub>) × I<sub>LOAD</sub><br>P<sub>loss</sub> = (5V - 3.3V) × 500mA = 1.7V × 0.5A = <strong>0.85W</strong></div><div class="formula-highlight">η = V<sub>OUT</sub> / V<sub>IN</sub> × 100%<br>η = 3.3V / 5V × 100% = <strong>66%</strong></div><div class="key-point">0.85W 손실은 상당한 열을 발생시키므로 패키지 열저항 θ<sub>JA</sub> 고려 필요.<br>θ<sub>JA</sub> = 50°C/W, 주변 25°C → T<sub>J</sub> = 25 + 0.85×50 = 67.5°C<br>전압 차나 전류가 더 크면 LDO 대신 Buck 컨버터 사용 검토</div>'
  }
 },
 q20: {
  catJa: '六、総合回路設計', catKo: '6. 종합 회로 설계',
  ja: {
   text: 'ESD（静電気放電）とは何ですか？ハードウェア設計でよく使われる ESD 保護レベルは？HBM と CDM モデルの違いを説明してください。',
   answer: '<strong>ESD（Electrostatic Discharge、静電気放電）</strong>は帯電体が導体に接触または接近した瞬間に放電する現象。<br><br><table class="exam-table"><tr><th>モデル</th><th>HBM</th><th>CDM</th></tr><tr><td>正式名称</td><td>Human Body Model</td><td>Charged Device Model</td></tr><tr><td>模擬対象</td><td>人体が IC に触れる</td><td>IC 自体が帯電後に放電</td></tr><tr><td>等価回路</td><td>100pF + 1.5KΩ</td><td>IC パッケージ容量 (1-30pF)</td></tr><tr><td>放電時間</td><td>~150ns</td><td>~1ns（極めて速い！）</td></tr><tr><td>典型レベル</td><td>2000V (Class 2)</td><td>500V (Class C4)</td></tr><tr><td>損傷の特徴</td><td>接合部の焼損</td><td>酸化膜の絶縁破壊</td></tr></table><div class="key-point">保護設計：TVS ダイオード、ガードリング、ESD クランプ、VDD/GND レールへの保護ダイオード<br>PCB レベル：保護素子はコネクタの近くに配置、長い配線によるアンテナ効果を回避</div>'
  },
  ko: {
   text: 'ESD (정전기 방전)란 무엇입니까? 하드웨어 설계에서 흔한 ESD 보호 등급은? HBM과 CDM 모델의 차이를 설명하세요.',
   answer: '<strong>ESD (Electrostatic Discharge, 정전기 방전)</strong>는 대전체가 도체에 접촉하거나 접근할 때 순간적으로 방전하는 현상.<br><br><table class="exam-table"><tr><th>모델</th><th>HBM</th><th>CDM</th></tr><tr><td>정식 명칭</td><td>Human Body Model</td><td>Charged Device Model</td></tr><tr><td>모의 대상</td><td>인체가 IC 접촉</td><td>IC 자체가 대전 후 방전</td></tr><tr><td>등가 회로</td><td>100pF + 1.5KΩ</td><td>IC 패키지 커패시턴스 (1-30pF)</td></tr><tr><td>방전 시간</td><td>~150ns</td><td>~1ns (매우 빠름!)</td></tr><tr><td>일반 등급</td><td>2000V (Class 2)</td><td>500V (Class C4)</td></tr><tr><td>손상 특성</td><td>접합부 소손</td><td>산화막 절연 파괴</td></tr></table><div class="key-point">보호 설계: TVS 다이오드, Guard Ring, ESD Clamp, VDD/GND 레일로의 보호 다이오드<br>PCB 차원: 보호 소자는 커넥터 가까이 배치, 긴 배선의 안테나 효과 회피</div>'
  }
 },
 q21: {
  catJa: '六、総合回路設計', catKo: '6. 종합 회로 설계',
  ja: {
   text: 'Bypass Capacitor（バイパスコンデンサ）と Decoupling Capacitor（デカップリングコンデンサ）の役割と配置原則を説明してください。',
   answer: '<strong>Bypass Capacitor（バイパスコンデンサ）：</strong><br>• 電源上の高周波ノイズを GND にバイパスし、AC 短絡経路を提供<br>• 典型値：100nF (0.1µF) セラミックコンデンサ<br><br><strong>Decoupling Capacitor（デカップリングコンデンサ）：</strong><br>• IC の瞬時電流需要に応えるローカル電荷貯蔵<br>• 典型値：100nF + 10µF の組み合わせ（高周波+低周波カバー）<br><br><strong>配置原則：</strong><br><div class="formula-highlight">1. IC の電源ピンにできるだけ近く（近いほど良い、配線は短いほど良い）<br>2. 100nF を IC に最も近く、10µF はやや遠くて可<br>3. コンデンサの GND ビアは短く太く（等価直列インダクタンス ESL の低減）<br>4. 各電源ピンに独立したデカップリングコンデンサ<br>5. 配線順序：電源 → コンデンサ → IC ピン（T 字分岐は不可）</div><div class="key-point">実務：まず 100nF をピンの近くに、次に 10µF をバルクとして配置。高速設計では 1nF/10nF を追加してより高い周波数帯をカバー。</div>'
  },
  ko: {
   text: 'Bypass Capacitor (바이패스 커패시터)와 Decoupling Capacitor (디커플링 커패시터)의 역할과 배치 원칙을 설명하세요.',
   answer: '<strong>Bypass Capacitor (바이패스 커패시터):</strong><br>• 전원의 고주파 노이즈를 GND로 바이패스, AC 단락 경로 제공<br>• 일반값: 100nF (0.1µF) 세라믹 커패시터<br><br><strong>Decoupling Capacitor (디커플링 커패시터):</strong><br>• IC의 순간 전류 수요를 위한 로컬 전하 저장<br>• 일반값: 100nF + 10µF 조합 (고주파+저주파 커버)<br><br><strong>배치 원칙:</strong><br><div class="formula-highlight">1. IC 전원 핀에 최대한 가깝게 (가까울수록, 배선 짧을수록 좋음)<br>2. 100nF를 IC에 가장 가깝게, 10µF는 조금 멀어도 됨<br>3. 커패시터 접지 via는 짧고 굵게 (등가 직렬 인덕턴스 ESL 감소)<br>4. 모든 전원 핀마다 독립적인 디커플링 커패시터<br>5. 배선 순서: 전원 → 커패시터 → IC 핀 (T자 분기 불가)</div><div class="key-point">실무: 먼저 100nF를 핀 가까이, 그 다음 10µF를 벌크로. 고속 설계에는 1nF/10nF 추가로 더 높은 주파수 대역 커버.</div>'
  }
 },
 q22: {
  catJa: '六、総合回路設計', catKo: '6. 종합 회로 설계',
  ja: {
   text: '差動インピーダンス設計：PCB 配線幅 W=5mil、間隔 S=5mil、誘電体厚 H=4mil、εr=4.2。<br>シングルエンドインピーダンス Z₀ と差動インピーダンス Z<sub>diff</sub> の近似値を計算してください。',
   answer: '<strong>マイクロストリップ (Microstrip) 近似式：</strong><br><div class="formula-highlight">Z₀ ≈ 87/√(εr+1.41) × ln(5.98×H/(0.8×W+T))<br>T=1.2mil (1oz 銅) と仮定：<br>Z₀ ≈ 87/√(4.2+1.41) × ln(5.98×4/(0.8×5+1.2))<br>Z₀ ≈ 87/√5.61 × ln(23.92/5.2)<br>Z₀ ≈ 87/2.369 × ln(4.6)<br>Z₀ ≈ 36.72 × 1.526<br><strong>Z₀ ≈ 56Ω</strong></div><div class="formula-highlight">Z<sub>diff</sub> ≈ 2 × Z₀ × (1 - 0.48 × e<sup>-0.96×S/H</sup>)<br>Z<sub>diff</sub> ≈ 2 × 56 × (1 - 0.48 × e<sup>-0.96×5/4</sup>)<br>Z<sub>diff</sub> ≈ 112 × (1 - 0.48 × 0.301)<br>Z<sub>diff</sub> ≈ 112 × (1 - 0.145)<br><strong>Z<sub>diff</sub> ≈ 95.8Ω ≈ 96Ω</strong></div><div class="key-point">USB 規格は 90Ω ±10% を要求。この設計はやや高めなので、W を広げるか S を狭めて調整可能。<br>実設計では EDA ツール（Polar Si9000 など）での精密計算を推奨。</div>'
  },
  ko: {
   text: '차동 임피던스 설계: PCB 배선 폭 W=5mil, 간격 S=5mil, 유전층 두께 H=4mil, εr=4.2.<br>싱글엔드 임피던스 Z₀와 차동 임피던스 Z<sub>diff</sub>의 근사값을 계산하세요.',
   answer: '<strong>마이크로스트립 (Microstrip) 근사 공식:</strong><br><div class="formula-highlight">Z₀ ≈ 87/√(εr+1.41) × ln(5.98×H/(0.8×W+T))<br>T=1.2mil (1oz 구리) 가정:<br>Z₀ ≈ 87/√(4.2+1.41) × ln(5.98×4/(0.8×5+1.2))<br>Z₀ ≈ 87/√5.61 × ln(23.92/5.2)<br>Z₀ ≈ 87/2.369 × ln(4.6)<br>Z₀ ≈ 36.72 × 1.526<br><strong>Z₀ ≈ 56Ω</strong></div><div class="formula-highlight">Z<sub>diff</sub> ≈ 2 × Z₀ × (1 - 0.48 × e<sup>-0.96×S/H</sup>)<br>Z<sub>diff</sub> ≈ 2 × 56 × (1 - 0.48 × e<sup>-0.96×5/4</sup>)<br>Z<sub>diff</sub> ≈ 112 × (1 - 0.48 × 0.301)<br>Z<sub>diff</sub> ≈ 112 × (1 - 0.145)<br><strong>Z<sub>diff</sub> ≈ 95.8Ω ≈ 96Ω</strong></div><div class="key-point">USB 규격은 90Ω ±10% 요구. 이 설계는 약간 높으므로 W를 넓히거나 S를 줄여 조정 가능.<br>실제 설계에서는 EDA 툴 (Polar Si9000 등) 정밀 계산 권장.</div>'
  }
 },
 q23: {
  catJa: '六、総合回路設計', catKo: '6. 종합 회로 설계',
  ja: {
   text: 'PCB 設計で高速差動ペア配線（USB/PCIe など）が従うべき原則は次のどれ？<br><span class="exam-option">(A) 差動ペアは別々の層に分けて配線してよい</span><span class="exam-option">(B) 差動ペアの間はベタ銅を入れず空けておく</span><span class="exam-option">(C) 差動ペアは等長でペアリングし、一定間隔を保つ</span><span class="exam-option">(D) 差動ペアにリファレンスプレーンは不要</span>',
   answer: '<div class="formula-highlight">答え：<strong>(C) 差動ペアは等長でペアリングし、一定間隔を保つ</strong></div><strong>選択肢の分析：</strong><br>• (A) ✗ 差動ペアは同一層必須。層をまたぐとインピーダンスと結合が変化<br>• (B) ✗ 差動ペア間には通常結合があり、ベタ銅の有無は設計次第だが空白が必須ではない<br>• (C) ✓ 等長で信号が同時到達（スキュー低減）、一定間隔でインピーダンス一定<br>• (D) ✗ 差動ペアもインピーダンス制御のため連続したリファレンスプレーンが必要<br><div class="key-point">差動ペア設計ポイント：等長（スキュー &lt; 5mil）・等間隔・同一層・連続リファレンスプレーン・プレーン分割をまたがない</div>'
  },
  ko: {
   text: 'PCB 설계에서 고속 차동 페어 배선 (USB/PCIe 등)이 따라야 할 원칙은?<br><span class="exam-option">(A) 차동 페어는 서로 다른 층에 나눠 배선해도 된다</span><span class="exam-option">(B) 차동 페어 사이에는 구리를 깔지 않고 비워 둔다</span><span class="exam-option">(C) 차동 페어는 등장 매칭하고 일정한 간격 유지</span><span class="exam-option">(D) 차동 페어는 기준 평면이 필요 없다</span>',
   answer: '<div class="formula-highlight">정답: <strong>(C) 차동 페어는 등장 매칭하고 일정한 간격 유지</strong></div><strong>항목별 분석:</strong><br>• (A) ✗ 차동 페어는 반드시 같은 층. 층을 넘으면 임피던스와 커플링 변화<br>• (B) ✗ 차동 페어 사이에는 보통 커플링이 있고, 구리 유무는 설계에 따르지만 공백이 필수는 아님<br>• (C) ✓ 등장으로 신호 동시 도달 (skew 감소), 일정 간격으로 임피던스 일관성 확보<br>• (D) ✗ 차동 페어도 임피던스 제어를 위해 완전한 기준 평면 필요<br><div class="key-point">차동 페어 설계 핵심: 등장 (skew &lt; 5mil), 등간격, 동일층, 연속 기준 평면, 평면 분할 넘지 않기</div>'
  }
 },
 q24: {
  catJa: '七、面接実戦問題', catKo: '7. 면접 실전 문제',
  ja: {
   text: 'MOSFET 選定時に注目すべき 6 つの重要パラメータを説明し、FOM（性能指数）の定義を述べてください。',
   answer: '<table class="exam-table"><tr><th>パラメータ</th><th>記号</th><th>意味</th></tr><tr><td>降伏電圧</td><td>V<sub>(BR)DSS</sub></td><td>最大 Drain-Source 電圧、≥ 1.2×V<sub>max</sub> を選定</td></tr><tr><td>オン抵抗</td><td>R<sub>DS(on)</sub></td><td>導通損失 P = I²×R<sub>DS(on)</sub></td></tr><tr><td>ゲート電荷</td><td>Q<sub>g</sub></td><td>ゲート駆動に必要な電荷量、スイッチング速度に影響</td></tr><tr><td>しきい値電圧</td><td>V<sub>GS(th)</sub></td><td>MOSFET が導通し始める最低ゲート電圧</td></tr><tr><td>最大電流</td><td>I<sub>D(max)</sub></td><td>連続ドレイン電流定格</td></tr><tr><td>安全動作領域</td><td>SOA</td><td>電圧×電流×時間の安全動作範囲</td></tr></table><div class="formula-highlight">FOM = R<sub>DS(on)</sub> × Q<sub>g</sub>（小さいほど良い）<br>FOM は導通損失とスイッチング損失のバランスを同時に評価</div><div class="key-point">実務：低周波・大電流 → R<sub>DS(on)</sub> の小さい品種。高周波スイッチング → Q<sub>g</sub> の小さい品種</div>'
  },
  ko: {
   text: 'MOSFET 선정 시 주목해야 할 6가지 핵심 파라미터를 설명하고, FOM (품질 지수)의 정의를 말하세요.',
   answer: '<table class="exam-table"><tr><th>파라미터</th><th>기호</th><th>의미</th></tr><tr><td>항복 전압</td><td>V<sub>(BR)DSS</sub></td><td>최대 Drain-Source 전압, ≥ 1.2×V<sub>max</sub> 선정</td></tr><tr><td>온저항</td><td>R<sub>DS(on)</sub></td><td>도통 손실 P = I²×R<sub>DS(on)</sub></td></tr><tr><td>게이트 전하</td><td>Q<sub>g</sub></td><td>게이트 구동에 필요한 전하량, 스위칭 속도에 영향</td></tr><tr><td>문턱 전압</td><td>V<sub>GS(th)</sub></td><td>MOSFET이 도통을 시작하는 최저 게이트 전압</td></tr><tr><td>최대 전류</td><td>I<sub>D(max)</sub></td><td>연속 드레인 전류 정격</td></tr><tr><td>안전 동작 영역</td><td>SOA</td><td>전압×전류×시간의 안전 동작 범위</td></tr></table><div class="formula-highlight">FOM = R<sub>DS(on)</sub> × Q<sub>g</sub> (작을수록 좋음)<br>FOM은 도통 손실과 스위칭 손실의 균형을 동시에 평가</div><div class="key-point">실무: 저주파 대전류 → R<sub>DS(on)</sub> 작은 것. 고주파 스위칭 → Q<sub>g</sub> 작은 것</div>'
  }
 },
 q25: {
  catJa: '七、面接実戦問題', catKo: '7. 면접 실전 문제',
  ja: {
   text: 'Latch-up（ラッチアップ）とは何ですか？どのような状況で発生し、どう予防しますか？',
   answer: '<strong>Latch-up（ラッチアップ）：</strong><br>CMOS 構造内の寄生 PNPN サイリスタ (SCR) がトリガされ低インピーダンス状態にロックされる現象。VDD から GND への大電流経路が形成され、IC が焼損する恐れがある。<br><br><strong>トリガ条件：</strong><br>• IO ピン電圧が VDD 超過または GND 未満（1 ダイオード降下以上）<br>• 大電流注入（ESD イベントなど）<br>• 電源投入順序の誤り（IO 電圧が VDD より先に到達）<br>• 高温環境（トリガしきい値の低下）<br><br><strong>予防策：</strong><br><div class="formula-highlight">1. ガードリング：P+ リングを VDD へ、N+ リングを GND へ<br>2. 正しい電源投入順序：VDD が IO 信号より先<br>3. 電流制限抵抗：IO ピンに直列抵抗で注入電流を制限<br>4. ESD 保護：IO ピンに VDD/GND レールへの保護ダイオード<br>5. 十分な Substrate/Well タップ密度</div><div class="key-point">ラッチアップが一度発生したら、解除方法は電源再投入のみ！予防が検出より重要。</div>'
  },
  ko: {
   text: 'Latch-up (래치업)이란 무엇입니까? 어떤 상황에서 발생하며, 어떻게 예방합니까?',
   answer: '<strong>Latch-up (래치업):</strong><br>CMOS 구조 내 기생 PNPN 사이리스터 (SCR)가 트리거된 후 저임피던스 상태에 고정되는 현상. VDD에서 GND로 대전류 경로가 형성되어 IC가 소손될 수 있음.<br><br><strong>트리거 조건:</strong><br>• IO 핀 전압이 VDD 초과 또는 GND 미만 (다이오드 강하 이상)<br>• 대전류 주입 (ESD 이벤트 등)<br>• 전원 인가 순서 오류 (IO 전압이 VDD보다 먼저 도달)<br>• 고온 환경 (트리거 문턱 저하)<br><br><strong>예방 대책:</strong><br><div class="formula-highlight">1. Guard Ring: P+ 링은 VDD에, N+ 링은 GND에<br>2. 올바른 전원 순서: VDD가 IO 신호보다 먼저<br>3. 전류 제한 저항: IO 핀에 직렬 저항으로 주입 전류 제한<br>4. ESD 보호: IO 핀에 VDD/GND 레일로의 보호 다이오드<br>5. 충분한 Substrate/Well 탭 밀도</div><div class="key-point">래치업이 한번 발생하면 유일한 해제 방법은 전원 재시작! 예방이 검출보다 중요.</div>'
  }
 },
 q26: {
  catJa: '七、面接実戦問題', catKo: '7. 면접 실전 문제',
  ja: {
   text: 'RC ローパスフィルタ：R=10KΩ, C=10nF。カットオフ周波数 fc と -3dB 点での位相シフトを計算してください。',
   answer: '<div class="formula-highlight">fc = 1/(2πRC)<br>fc = 1/(2π × 10×10³ × 10×10⁻⁹)<br>fc = 1/(2π × 10⁻⁴)<br>fc = 1/(6.283 × 10⁻⁴)<br><strong>fc ≈ 1591.5 Hz ≈ 1.59 KHz</strong></div><div class="formula-highlight">カットオフ周波数 fc（-3dB 点）での位相シフト：<br><strong>φ = -45°</strong></div><strong>周波数応答特性：</strong><br>• f &lt;&lt; fc：ゲイン ≈ 0dB、位相 ≈ 0°<br>• f = fc：ゲイン = -3dB、位相 = -45°<br>• f &gt;&gt; fc：ゲインは -20dB/decade で低下、位相は -90° に漸近<br><div class="key-point">-3dB は電力が半分、電圧が 1/√2 ≈ 0.707 倍に減衰することを意味</div>'
  },
  ko: {
   text: 'RC 저역 통과 필터: R=10KΩ, C=10nF. 차단 주파수 fc와 -3dB에서의 위상 변이를 계산하세요.',
   answer: '<div class="formula-highlight">fc = 1/(2πRC)<br>fc = 1/(2π × 10×10³ × 10×10⁻⁹)<br>fc = 1/(2π × 10⁻⁴)<br>fc = 1/(6.283 × 10⁻⁴)<br><strong>fc ≈ 1591.5 Hz ≈ 1.59 KHz</strong></div><div class="formula-highlight">차단 주파수 fc (-3dB 점)에서의 위상 변이:<br><strong>φ = -45°</strong></div><strong>주파수 응답 특성:</strong><br>• f &lt;&lt; fc: 이득 ≈ 0dB, 위상 ≈ 0°<br>• f = fc: 이득 = -3dB, 위상 = -45°<br>• f &gt;&gt; fc: 이득은 -20dB/decade로 감소, 위상은 -90°에 수렴<br><div class="key-point">-3dB는 전력이 절반, 전압이 1/√2 ≈ 0.707배로 감쇠함을 의미</div>'
  }
 },
 q27: {
  catJa: '七、面接実戦問題', catKo: '7. 면접 실전 문제',
  ja: {
   text: 'Setup Time と Hold Time の定義を説明し、これらのタイミング要件に違反すると何が起きるか述べてください。',
   answer: '<strong>Setup Time (t<sub>su</sub>)：</strong><br>クロック有効エッジの<strong>前に</strong>データが安定していなければならない最短時間。レジスタの正しいサンプリングを保証。<br><br><strong>Hold Time (t<sub>h</sub>)：</strong><br>クロック有効エッジの<strong>後も</strong>データが安定を維持しなければならない最短時間。サンプリング完了を保証。<br><br><div class="formula-highlight">タイミングマージン (Slack)：<br>Setup Slack = T<sub>clk</sub> - T<sub>co</sub> - T<sub>comb</sub> - T<sub>su</sub> ≥ 0<br>Hold Slack = T<sub>co</sub> + T<sub>comb</sub> - T<sub>h</sub> ≥ 0</div><strong>違反した場合の結果：</strong><br><div class="key-point">• メタステーブル (Metastability)：レジスタ出力が 0 と 1 の間で不定に振動<br>• データエラー：誤った値をサンプリング<br>• システム不安定：間欠的な故障（最悪の場合、温度/電圧の限界条件でのみ発現）<br>Setup 違反の修正：クロック周波数を下げるか組み合わせ論理の遅延を短縮<br>Hold 違反の修正：buffer/delay cell を挿入して経路遅延を増加</div>'
  },
  ko: {
   text: 'Setup Time과 Hold Time의 정의를 설명하고, 이러한 타이밍 요구를 위반하면 어떤 문제가 발생하는지 말하세요.',
   answer: '<strong>Setup Time (t<sub>su</sub>):</strong><br>데이터가 클럭 유효 에지 <strong>이전에</strong> 안정되어야 하는 최소 시간. 레지스터의 올바른 샘플링 보장.<br><br><strong>Hold Time (t<sub>h</sub>):</strong><br>데이터가 클럭 유효 에지 <strong>이후에도</strong> 계속 안정을 유지해야 하는 최소 시간. 샘플링 완료 보장.<br><br><div class="formula-highlight">타이밍 여유 (Slack):<br>Setup Slack = T<sub>clk</sub> - T<sub>co</sub> - T<sub>comb</sub> - T<sub>su</sub> ≥ 0<br>Hold Slack = T<sub>co</sub> + T<sub>comb</sub> - T<sub>h</sub> ≥ 0</div><strong>위반 시 결과:</strong><br><div class="key-point">• 준안정 상태 (Metastability): 레지스터 출력이 0과 1 사이에서 불확정하게 진동<br>• 데이터 오류: 잘못된 값을 샘플링<br>• 시스템 불안정: 간헐적 고장 (최악의 경우 온도/전압 한계 조건에서만 발현)<br>Setup 위반 수정: 클럭 주파수 낮추기 또는 조합 논리 지연 단축<br>Hold 위반 수정: buffer/delay cell 삽입으로 경로 지연 증가</div>'
  }
 },
 q28: {
  catJa: "八、電源回路のループ識別（フライバック）", catKo: "8. 전원 회로 루프 식별(플라이백)",
  ja: { text: "図はフライバック充電器の回路です。(1) 一次側の<strong>主ループ</strong>（スイッチングの大電流経路）、(2) 一次側の<strong>高電圧区間</strong>（ヒント：主ループと一部重なります）を示してください。展開して回路図と解答を確認。", answer: "{{SVG}}<div style=\"font-size:12px;margin:4px 0\"><span style=\"display:inline-block;width:10px;height:10px;background:#eab308;margin:0 4px 0 10px\"></span>黄＝主ループ（大電流）<span style=\"display:inline-block;width:10px;height:10px;background:#ef4444;margin:0 4px 0 10px\"></span>赤＝高電圧区間</div><strong>主ループ（黄）：</strong>バルクコンデンサ C1 → トランス一次巻線 → Q1 → 電流検出抵抗 Rs → C1 に戻る。Q1 オン期間のスイッチング大電流がこのループを流れ、di/dt が最大——レイアウト面積を最小にし、C1 をトランスと Q1 の直近に置く。<br><strong>高電圧区間（赤）：</strong>ヒューズ以降の AC ライン、整流ブリッジ、HV+ 直流バス（90–264VAC 整流後 約 120–370VDC）、一次巻線から Q1 ドレインまで——ターンオフ時のドレインは反射電圧と漏れインダクタンスのスパイクが重畳し 600V 級に達する。<br><strong>なぜ重なるか：</strong>主ループ自体が高圧バス上を走る——C1→一次巻線→ドレインの区間は大電流経路であり高電圧ノードでもあり、EMI（ループ最小）と安全規格（沿面/空間距離）を同時に満たすレイアウトが要る。<div class=\"key-point\">面接官が見るのは「電流を一周たどれるか」：バルクコンデンサ（ループの源）を見つけ、スイッチを回って一周＝主ループ；ブリッジ出力からバスに沿ってスイッチノードまで＝高電圧区間。</div>" },
  ko: { text: "그림은 플라이백 충전기 회로입니다. (1) 1차측 <strong>주 루프</strong>(스위칭 대전류 경로), (2) 1차측 <strong>고전압 구간</strong>(힌트: 주 루프와 일부 겹칩니다)을 표시하세요. 펼쳐서 회로도와 해답 확인.", answer: "{{SVG}}<div style=\"font-size:12px;margin:4px 0\"><span style=\"display:inline-block;width:10px;height:10px;background:#eab308;margin:0 4px 0 10px\"></span>노랑=주 루프(대전류)<span style=\"display:inline-block;width:10px;height:10px;background:#ef4444;margin:0 4px 0 10px\"></span>빨강=고전압 구간</div><strong>주 루프(노랑):</strong> 벌크 커패시터 C1 → 변압기 1차 권선 → Q1 → 전류 감지 저항 Rs → C1로 복귀. Q1 도통 기간의 스위칭 대전류가 이 루프를 돌며 di/dt가 최대——레이아웃 면적을 최소화하고 C1을 변압기와 Q1에 밀착 배치.<br><strong>고전압 구간(빨강):</strong> 퓨즈 이후 AC 라인, 정류 브리지, HV+ DC 버스(90–264VAC 정류 후 약 120–370VDC), 1차 권선에서 Q1 드레인까지——턴오프 시 드레인은 반사 전압과 누설 인덕턴스 스파이크가 겹쳐 600V급까지 상승.<br><strong>왜 겹치는가:</strong> 주 루프 자체가 고압 버스 위를 달린다——C1→1차 권선→드레인 구간은 대전류 경로이자 고전압 노드로, EMI(최소 루프)와 안전 규격(연면/공간 거리)을 동시에 만족해야 함.<div class=\"key-point\">면접관은 \"전류를 한 바퀴 따라갈 수 있는가\"를 본다: 벌크 커패시터(루프의 근원)를 찾아 스위치를 돌아 한 바퀴=주 루프; 브리지 출력에서 버스를 따라 스위치 노드까지=고전압 구간.</div>" }
 },
 q29: {
  catJa: "八、電源回路のループ識別（フライバック）", catKo: "8. 전원 회로 루프 식별(플라이백)",
  ja: { text: "同じフライバック回路で<strong>二次側主ループ</strong>（出力整流の大電流経路）を示し、このループ面積を最小にすべき理由を説明してください。", answer: "{{SVG}}<div style=\"font-size:12px;margin:4px 0\"><span style=\"display:inline-block;width:10px;height:10px;background:#eab308;margin:0 4px 0 10px\"></span>黄＝主ループ（大電流）</div><strong>二次側主ループ（黄）：</strong>二次巻線 → 出力整流 D3 → 出力コンデンサ Cout → 巻線に戻る。<br><strong>面積を最小にする理由：</strong>フライバックの二次電流は Q1 オフ期間のみ流れる<strong>パルス状大電流</strong>で di/dt が極めて大きい；ループ面積が大きい＝寄生インダクタンスが大きい → D3 ターンオフのリンギング、電圧オーバーシュート、放射 EMI がすべて悪化。Cout の ESL もループの一部なので、Cout は D3 と巻線ピンに密着させ、必要なら MLCC を並列で近接配置。<div class=\"key-point\">フライバックレイアウトの三大ループ：一次ホットループ（C1-P-Q1-Rs）、二次整流ループ（S-D3-Cout）、ゲート駆動ループ——三つ全部言えれば面接は半分勝ち。</div>" },
  ko: { text: "같은 플라이백 회로에서 <strong>2차측 주 루프</strong>(출력 정류 대전류 경로)를 표시하고, 이 루프 면적을 최소화해야 하는 이유를 설명하세요.", answer: "{{SVG}}<div style=\"font-size:12px;margin:4px 0\"><span style=\"display:inline-block;width:10px;height:10px;background:#eab308;margin:0 4px 0 10px\"></span>노랑=주 루프(대전류)</div><strong>2차측 주 루프(노랑):</strong> 2차 권선 → 출력 정류 D3 → 출력 커패시터 Cout → 권선으로 복귀.<br><strong>면적 최소화 이유:</strong> 플라이백 2차 전류는 Q1 오프 기간에만 흐르는 <strong>펄스형 대전류</strong>로 di/dt가 매우 큼; 루프 면적이 크면 기생 인덕턴스가 커져 → D3 턴오프 링잉, 전압 오버슈트, 방사 EMI 모두 악화. Cout의 ESL도 루프의 일부이므로 Cout을 D3와 권선 핀에 밀착시키고 필요 시 MLCC 병렬로 근접 배치.<div class=\"key-point\">플라이백 레이아웃 3대 루프: 1차 핫 루프(C1-P-Q1-Rs), 2차 정류 루프(S-D3-Cout), 게이트 구동 루프——셋 다 말하면 면접 절반은 이긴 것.</div>" }
 },
 q30: {
  catJa: "八、電源回路のループ識別（フライバック）", catKo: "8. 전원 회로 루프 식별(플라이백)",
  ja: { text: "スイッチングノイズはトランスの一二次巻線間寄生容量を通って二次側へ流れ、コモンモード EMI になります。この<strong>コモンモードノイズ経路</strong>を示し、Y コンデンサ (CY) の役割と配置原則を説明してください。", answer: "{{SVG}}<div style=\"font-size:12px;margin:4px 0\"><span style=\"display:inline-block;width:10px;height:10px;background:#22c55e;margin:0 4px 0 10px\"></span>緑＝信号/ノイズ経路</div><strong>コモンモード経路（緑）：</strong>ノイズ源＝Q1 ドレイン（SW ノード）の高 dv/dt → 巻線間寄生容量 Cps を通って二次側へ → 二次グランドを流れ → <strong>CY を通って一次グランドへ</strong>戻り、ノイズ源へ短絡帰還。<br><strong>CY が無いと：</strong>ノイズ電流は出力ケーブル、人体/大地、LISN を回る大ループでしか戻れず＝伝導コモンモード EMI が即不合格。<br><strong>CY の配置：</strong>一次グランド–二次グランド間（または一次 HV+–二次グランド間）に安全規格 Y1/Y2 コンデンサを跨がせる；容量は漏れ電流で制限（通常 ≤4.7nF、AC アダプタは 1~2.2nF が多い）；トランスに密着させ両端の配線を最短にしてノイズループを最小化。<div class=\"key-point\">コモンモード EMI の考え方は「ノイズに最短の帰り道を与える」——Y コンデンサがその道。</div>" },
  ko: { text: "스위칭 노이즈는 변압기 1·2차 권선 간 기생 커패시턴스를 통해 2차측으로 흘러 공통 모드 EMI가 됩니다. 이 <strong>공통 모드 노이즈 경로</strong>를 표시하고 Y 커패시터(CY)의 역할과 배치 원칙을 설명하세요.", answer: "{{SVG}}<div style=\"font-size:12px;margin:4px 0\"><span style=\"display:inline-block;width:10px;height:10px;background:#22c55e;margin:0 4px 0 10px\"></span>초록=신호/노이즈 경로</div><strong>공통 모드 경로(초록):</strong> 노이즈원=Q1 드레인(SW 노드)의 높은 dv/dt → 권선 간 기생 커패시턴스 Cps를 통해 2차측으로 → 2차 접지를 따라 흐름 → <strong>CY를 통해 1차 접지로</strong> 복귀, 노이즈원으로 단락 귀환.<br><strong>CY가 없으면:</strong> 노이즈 전류는 출력 케이블, 인체/대지, LISN을 도는 큰 루프로만 돌아옴=전도 공통 모드 EMI 즉시 불합격.<br><strong>CY 배치:</strong> 1차 접지–2차 접지 간(또는 1차 HV+–2차 접지 간)에 안전 규격 Y1/Y2 커패시터를 연결; 용량은 누설 전류로 제한(보통 ≤4.7nF, 어댑터는 1~2.2nF); 변압기에 밀착시키고 양단 배선을 최단으로 하여 노이즈 루프 최소화.<div class=\"key-point\">공통 모드 EMI 사고방식=\"노이즈에게 가장 짧은 귀갓길을 준다\"——Y 커패시터가 그 길.</div>" }
 },
 q31: {
  catJa: "八、電源回路のループ識別（フライバック）", catKo: "8. 전원 회로 루프 식별(플라이백)",
  ja: { text: "出力電圧から制御 IC の FB ピンまでの<strong>フィードバック信号経路</strong>（TL431 とフォトカプラ経由）を示し、フィードバック配線がレイアウト上避けるべきものを説明してください。", answer: "{{SVG}}<div style=\"font-size:12px;margin:4px 0\"><span style=\"display:inline-block;width:10px;height:10px;background:#22c55e;margin:0 4px 0 10px\"></span>緑＝信号/ノイズ経路</div><strong>フィードバック経路（緑）：</strong>VOUT → 分圧抵抗 → TL431（誤差増幅・基準比較）→ フォトカプラ LED →（絶縁バリアを越えて）→ フォトカプラのトランジスタ → IC の FB ピン。<br><strong>避けるべきもの：</strong>フィードバックは高インピーダンスの小信号——SW ノードの dv/dt と主ループの di/dt との結合を最も嫌う。トランス、Q1 ドレイン、RCD クランプから離して配線；分圧中点（TL431 REF）が最も敏感なので分圧抵抗は TL431 の直近に置き配線最短；フォトカプラの両側はそれぞれ一次グランドと二次グランドに属し、便宜のために領域を跨いで引き回さない。<div class=\"key-point\">出力が理由なく発振/ジッタする時は、まず FB 配線が SW ノードに沿って走っていないか確認——フライバックで最も多いレイアウト事故。</div>" },
  ko: { text: "출력 전압에서 제어 IC의 FB 핀까지의 <strong>피드백 신호 경로</strong>(TL431과 포토커플러 경유)를 표시하고, 피드백 배선이 레이아웃에서 피해야 할 것을 설명하세요.", answer: "{{SVG}}<div style=\"font-size:12px;margin:4px 0\"><span style=\"display:inline-block;width:10px;height:10px;background:#22c55e;margin:0 4px 0 10px\"></span>초록=신호/노이즈 경로</div><strong>피드백 경로(초록):</strong> VOUT → 분압 저항 → TL431(오차 증폭·기준 비교) → 포토커플러 LED → (절연 장벽을 넘어) → 포토커플러 트랜지스터 → IC의 FB 핀.<br><strong>피해야 할 것:</strong> 피드백은 고임피던스 소신호——SW 노드의 dv/dt와 주 루프의 di/dt와의 결합을 가장 꺼림. 변압기, Q1 드레인, RCD 클램프에서 멀리 배선; 분압 중점(TL431 REF)이 가장 민감하므로 분압 저항은 TL431 바로 옆에 두고 배선 최단; 포토커플러 양측은 각각 1차 접지와 2차 접지에 속하며 편의상 영역을 넘나들며 배선하지 않는다.<div class=\"key-point\">출력이 이유 없이 발진/지터하면 먼저 FB 배선이 SW 노드를 따라 달리는지 확인——플라이백에서 가장 흔한 레이아웃 사고.</div>" }
 },
 q32: {
  catJa: "八、電源回路のループ識別（フライバック）", catKo: "8. 전원 회로 루프 식별(플라이백)",
  ja: { text: "電源投入直後は補助巻線にまだ電圧がありません。IC の<strong>起動給電経路</strong>と通常動作時の<strong>補助給電経路</strong>を示し、起動抵抗と待機電力の関係を説明してください。", answer: "{{SVG}}<div style=\"font-size:12px;margin:4px 0\"><span style=\"display:inline-block;width:10px;height:10px;background:#f97316;margin:0 4px 0 10px\"></span>橙＝給電経路</div><strong>起動経路（橙・上）：</strong>HV+ バス → 起動抵抗 Rst → VDD（VDD コンデンサを UVLO 開始しきい値まで充電し、IC がスイッチング開始）。<br><strong>通常給電（橙・下）：</strong>スイッチング確立後は補助巻線 AUX → D2 整流 → VDD が給電を引き継ぐ；AUX 電圧は巻数比で出力に比例し、一次側レギュレーション (PSR) では出力電圧センスも兼ねる。<br><strong>待機電力：</strong>Rst は高圧バスにぶら下がり P≈V²/R が常時発生——365VDC では 1MΩ でも 0.13W を消費し、<30mW 級の待機規格を直撃。対策：抵抗値を上げる（起動時間を犠牲）、複数直列（耐圧）、または HV 起動ピン内蔵（起動後に遮断する内蔵 JFET 電流源）のコントローラを選ぶ。<div class=\"key-point\">VDD コンデンサは「起動から AUX が引き継ぐまで」の空白を持たせる——小さすぎるとヒカップ再起動。面接の定番追い打ち。</div>" },
  ko: { text: "전원 인가 직후에는 보조 권선에 아직 전압이 없습니다. IC의 <strong>기동 공급 경로</strong>와 정상 동작 시의 <strong>보조 공급 경로</strong>를 표시하고, 기동 저항과 대기 전력의 관계를 설명하세요.", answer: "{{SVG}}<div style=\"font-size:12px;margin:4px 0\"><span style=\"display:inline-block;width:10px;height:10px;background:#f97316;margin:0 4px 0 10px\"></span>주황=공급 경로</div><strong>기동 경로(주황, 상):</strong> HV+ 버스 → 기동 저항 Rst → VDD(VDD 커패시터를 UVLO 개시 임계값까지 충전, IC 스위칭 시작).<br><strong>정상 공급(주황, 하):</strong> 스위칭 확립 후 보조 권선 AUX → D2 정류 → VDD가 공급을 인계; AUX 전압은 권선비로 출력에 비례하며 1차측 레귤레이션(PSR)에서는 출력 전압 감지도 겸함.<br><strong>대기 전력:</strong> Rst는 고압 버스에 매달려 P≈V²/R이 상시 발생——365VDC에서 1MΩ이라도 0.13W를 소모, <30mW급 대기 규격을 직격. 대책: 저항값 증가(기동 시간 희생), 여러 개 직렬(내압), 또는 HV 기동 핀 내장(기동 후 차단되는 내장 JFET 전류원) 컨트롤러 선택.<div class=\"key-point\">VDD 커패시터는 \"기동부터 AUX 인계까지\"의 공백을 버텨야 함——너무 작으면 딸꾹질(hiccup) 재기동. 면접 단골 추가 질문.</div>" }
 }
});
