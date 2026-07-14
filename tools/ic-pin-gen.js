#!/usr/bin/env node
/**
 * ic-pin-gen.js — pins[].desc 模板字串的規則生成器。
 *
 * 為什麼要有這支：未譯的 pin desc 長尾高度模板化（GPIO#、「X 通道 Lane N」、
 * 正/負端、N/C 球位、MBRST(n)…）。手打數千條近乎相同的字串既慢又易錯，
 * 用規則生成既快又不會手滑。
 *
 * 用法：
 *   node tools/ic-i18n-coverage.js tools   # 先產 tools/pin-todo.json
 *   node tools/ic-pin-gen.js               # 讀 pin-todo.json，產 pin-gen-out.js
 *   # 抽驗無誤後 append 進 ic-pin-i18n-data.js，並 bump 它的 ?v=（兩頁都要）
 *
 * 加規則：往 RULES 加 [regex, m => ({en, ja, ko})]。沒被命中的字串留在
 * pin-todo-rest.json，那些得手譯。
 */
const fs = require('fs'), path = require('path');
const todo = require('./pin-todo.json');

const POL = { '正': ['positive', '正極', '정극'], '負': ['negative', '負極', '부극'] };
const p = m => POL[m];

const RULES = [
  // GPIO with Pin Attributes note
  [/^通用輸入輸出 GPIO(\d+)（多工功能見 Pin Attributes 表）$/, m => ({
    en: `General-purpose I/O GPIO${m[1]} (see the Pin Attributes table for multiplexed functions)`,
    ja: `汎用入出力 GPIO${m[1]}（多重化機能は Pin Attributes 表を参照）`,
    ko: `범용 입출력 GPIO${m[1]}(다중화 기능은 Pin Attributes 표 참조)`
  })],
  // GPIO with peripheral mux list
  [/^通用輸入輸出 GPIO(\d+)（多工週邊 UART\/SPI\/I2C\/I2S\/PWM\/ADC 等，指派見 datasheet Signal Descriptions）$/, m => ({
    en: `General-purpose I/O GPIO${m[1]} (multiplexed peripherals such as UART/SPI/I2C/I2S/PWM/ADC; see the datasheet Signal Descriptions for the assignment)`,
    ja: `汎用入出力 GPIO${m[1]}（UART/SPI/I2C/I2S/PWM/ADC などの多重化ペリフェラル。割り当ては datasheet の Signal Descriptions を参照）`,
    ko: `범용 입출력 GPIO${m[1]}(UART/SPI/I2C/I2S/PWM/ADC 등 다중화 주변장치; 할당은 datasheet의 Signal Descriptions 참조)`
  })],
  // high-speed diff data pair, channel X lane N (100 ohm)
  [/^高速差動資料對，([A-Z]) 通道 Lane (\d+)（差動 (\d+)Ω 端接）$/, m => ({
    en: `High-speed differential data pair, channel ${m[1]} lane ${m[2]} (differential ${m[3]} ohm terminated)`,
    ja: `高速差動データペア、${m[1]} チャネル Lane ${m[2]}（差動 ${m[3]}Ω 終端）`,
    ko: `고속 차동 데이터 쌍, ${m[1]} 채널 Lane ${m[2]}(차동 ${m[3]}Ω 종단)`
  })],
  // high-speed diff clock, channel X
  [/^高速差動時脈，([A-Z]) 通道（差動 (\d+)Ω 端接）$/, m => ({
    en: `High-speed differential clock, channel ${m[1]} (differential ${m[2]} ohm terminated)`,
    ja: `高速差動クロック、${m[1]} チャネル（差動 ${m[2]}Ω 終端）`,
    ko: `고속 차동 클록, ${m[1]} 채널(차동 ${m[2]}Ω 종단)`
  })],
  // SubLVDS pair channel X lane N pos/neg
  [/^高速差動資料對（SubLVDS）([A-Z]) 通道 Lane (\d+) ([正負])端$/, m => ({
    en: `High-speed differential data pair (SubLVDS), channel ${m[1]} lane ${m[2]} ${p(m[3])[0]} side`,
    ja: `高速差動データペア（SubLVDS）${m[1]} チャネル Lane ${m[2]} ${p(m[3])[1]}側`,
    ko: `고속 차동 데이터 쌍(SubLVDS) ${m[1]} 채널 Lane ${m[2]} ${p(m[3])[2]} 측`
  })],
  // high-speed diff pair channel X lane N input pos/neg; 100 ohm
  [/^高速差動資料對 ([A-Z]) 通道 lane (\d+) 輸入([正負])端；差動 (\d+)Ω 端接$/, m => ({
    en: `High-speed differential data pair, channel ${m[1]} lane ${m[2]} ${p(m[3])[0]} input; differential ${m[4]} ohm terminated`,
    ja: `高速差動データペア ${m[1]} チャネル lane ${m[2]} 入力${p(m[3])[1]}側；差動 ${m[4]}Ω 終端`,
    ko: `고속 차동 데이터 쌍 ${m[1]} 채널 lane ${m[2]} 입력 ${p(m[3])[2]} 측; 차동 ${m[4]}Ω 종단`
  })],
  // LVDS bus X lane N pos/neg input; 100 ohm
  [/^LVDS 高速差動資料匯流排 ([A-Z]) lane (\d+) ([正負])端輸入；差動 (\d+)Ω 端接$/, m => ({
    en: `LVDS high-speed differential data bus ${m[1]} lane ${m[2]} ${p(m[3])[0]} input; differential ${m[4]} ohm terminated`,
    ja: `LVDS 高速差動データバス ${m[1]} lane ${m[2]} ${p(m[3])[1]}側入力；差動 ${m[4]}Ω 終端`,
    ko: `LVDS 고속 차동 데이터 버스 ${m[1]} lane ${m[2]} ${p(m[3])[2]} 측 입력; 차동 ${m[4]}Ω 종단`
  })],
  // SerDes ch N pos/neg with AC coupling cap
  [/^SerDes 通道 (\d+) ([正負])端輸入；封裝內含交流耦合串接電容與 (\d+)Ω 內部端接至 (\S+)$/, m => ({
    en: `SerDes channel ${m[1]} ${p(m[2])[0]} input; the package contains an AC-coupling series capacitor and a ${m[3]} ohm internal termination to ${m[4]}`,
    ja: `SerDes チャネル ${m[1]} ${p(m[2])[1]}側入力；パッケージ内に AC 結合直列コンデンサと ${m[3]}Ω の内部終端（${m[4]} へ）を内蔵`,
    ko: `SerDes 채널 ${m[1]} ${p(m[2])[2]} 측 입력; 패키지 내에 AC 결합 직렬 커패시터와 ${m[3]}Ω 내부 종단(${m[4]}로)을 포함`
  })],
  // SerDes ch N pos/neg with internal termination, may float
  [/^SerDes 通道 (\d+) ([正負])端輸入；內建 (\d+)Ω 端接至 (\S+)；未使用時可懸空不接$/, m => ({
    en: `SerDes channel ${m[1]} ${p(m[2])[0]} input; built-in ${m[3]} ohm termination to ${m[4]}; may be left floating when unused`,
    ja: `SerDes チャネル ${m[1]} ${p(m[2])[1]}側入力；${m[3]}Ω 終端（${m[4]} へ）を内蔵；未使用時はオープンのままでよい`,
    ko: `SerDes 채널 ${m[1]} ${p(m[2])[2]} 측 입력; ${m[3]}Ω 종단(${m[4]}로) 내장; 미사용 시 개방 상태로 두어도 무방`
  })],
  // N/C ball for unused channel lane
  [/^未連接腳位；本型號未使用 ([A-Z]) 通道資料 Lane (\d+) ([正負])端所在球位（datasheet Table (\d+)-(\d+) 標為 N\/C）$/, m => ({
    en: `Not-connected pin; this part does not use the ball position of channel ${m[1]} data lane ${m[2]} ${p(m[3])[0]} side (marked N/C in datasheet Table ${m[4]}-${m[5]})`,
    ja: `未接続ピン。本型番は ${m[1]} チャネルのデータ Lane ${m[2]} ${p(m[3])[1]}側のボール位置を使用しない（datasheet Table ${m[4]}-${m[5]} で N/C と表示）`,
    ko: `미연결 핀; 본 모델은 ${m[1]} 채널 데이터 Lane ${m[2]} ${p(m[3])[2]} 측의 볼 위치를 사용하지 않음(datasheet Table ${m[4]}-${m[5]}에 N/C로 표시)`
  })],
  // MBRST
  [/^微鏡偏壓重置輸入訊號 MBRST\((\d+)\)（Mirror actuation signal）$/, m => ({
    en: `Micromirror bias reset input signal MBRST(${m[1]}) (mirror actuation signal)`,
    ja: `マイクロミラーバイアスリセット入力信号 MBRST(${m[1]})（Mirror actuation signal）`,
    ko: `마이크로미러 바이어스 리셋 입력 신호 MBRST(${m[1]})(Mirror actuation signal)`
  })],
  // DAC output N
  [/^DAC 輸出 (\d+)$/, m => ({ en: `DAC output ${m[1]}`, ja: `DAC 出力 ${m[1]}`, ko: `DAC 출력 ${m[1]}` })],
  // analog input channel N, pos/neg
  [/^類比輸入通道 (\d+)，([正負])端$/, m => ({
    en: `Analog input channel ${m[1]}, ${p(m[2])[0]} side`,
    ja: `アナログ入力チャネル ${m[1]}、${p(m[2])[1]}側`,
    ko: `아날로그 입력 채널 ${m[1]}, ${p(m[2])[2]} 측`
  })],
  // analog input N
  [/^類比輸入 (\d+)$/, m => ({ en: `Analog input ${m[1]}`, ja: `アナログ入力 ${m[1]}`, ko: `아날로그 입력 ${m[1]}` })],
  // address input A#
  [/^位址輸入 A(\d+)$/, m => ({ en: `Address input A${m[1]}`, ja: `アドレス入力 A${m[1]}`, ko: `주소 입력 A${m[1]}` })],
  // LP-HCSL diff clock out N pos/neg; NC if unused
  [/^LP-HCSL 差動時脈輸出 (\d+) ([正負])端；未用可 NC$/, m => ({
    en: `LP-HCSL differential clock output ${m[1]} ${p(m[2])[0]} side; may be left NC if unused`,
    ja: `LP-HCSL 差動クロック出力 ${m[1]} ${p(m[2])[1]}側；未使用時は NC 可`,
    ko: `LP-HCSL 차동 클록 출력 ${m[1]} ${p(m[2])[2]} 측; 미사용 시 NC 가능`
  })],
  // LP-HCSL diff clock out N; NC if unused
  [/^LP-HCSL 差動時脈輸出 (\d+)，未用可 NC$/, m => ({
    en: `LP-HCSL differential clock output ${m[1]}; may be left NC if unused`,
    ja: `LP-HCSL 差動クロック出力 ${m[1]}；未使用時は NC 可`,
    ko: `LP-HCSL 차동 클록 출력 ${m[1]}; 미사용 시 NC 가능`
  })],
  // differential output N (complementary / positive)
  [/^差動輸出 (\d+)（互補）$/, m => ({ en: `Differential output ${m[1]} (complementary)`, ja: `差動出力 ${m[1]}（相補）`, ko: `차동 출력 ${m[1]}(상보)` })],
  [/^差動輸出 (\d+)（正）$/, m => ({ en: `Differential output ${m[1]} (positive)`, ja: `差動出力 ${m[1]}（正）`, ko: `차동 출력 ${m[1]}(정)` })],
  // JESD serial output lane N
  [/^差動高速序列 JESD(\S+) 輸出資料介面，lane (\d+)$/, m => ({
    en: `Differential high-speed serial JESD${m[1]} output data interface, lane ${m[2]}`,
    ja: `差動高速シリアル JESD${m[1]} 出力データインターフェース、lane ${m[2]}`,
    ko: `차동 고속 직렬 JESD${m[1]} 출력 데이터 인터페이스, lane ${m[2]}`
  })],
  // CLKn output enable
  [/^CLK(\d+) 輸出致能（active-low，內建上拉）：(\d+)=輸出作用、(\d+)=輸出停用$/, m => ({
    en: `CLK${m[1]} output enable (active-low, internal pull-up): ${m[2]} = output active, ${m[3]} = output disabled`,
    ja: `CLK${m[1]} 出力イネーブル（active-low、内蔵プルアップ）：${m[2]}=出力有効、${m[3]}=出力無効`,
    ko: `CLK${m[1]} 출력 인에이블(active-low, 내장 풀업): ${m[2]}=출력 활성, ${m[3]}=출력 비활성`
  })],
  // downstream channel N clock
  [/^下游通道 (\d+) 時脈$/, m => ({ en: `Downstream channel ${m[1]} clock`, ja: `下流チャネル ${m[1]} クロック`, ko: `하류 채널 ${m[1]} 클록` })],
  // channel N side B
  [/^通道 (\d+) 端 B$/, m => ({ en: `Channel ${m[1]} side B`, ja: `チャネル ${m[1]} B 側`, ko: `채널 ${m[1]} B 측` })],
  // IOMUX signal ball; mux: ADCn_AINm
  [/^IOMUX 訊號球；mux: (\S+)$/, m => ({
    en: `IOMUX signal ball; mux: ${m[1]}`,
    ja: `IOMUX 信号ボール；mux: ${m[1]}`,
    ko: `IOMUX 신호 볼; mux: ${m[1]}`
  })],
  // analog input N / analog GPIO N
  [/^類比輸入 (\d+)／類比通用輸出入 (\d+)$/, m => ({
    en: `Analog input ${m[1]} / analog general-purpose I/O ${m[2]}`,
    ja: `アナログ入力 ${m[1]}／アナログ汎用入出力 ${m[2]}`,
    ko: `아날로그 입력 ${m[1]}／아날로그 범용 입출력 ${m[2]}`
  })],

  // ---- 第二批規則 ----
  [/^差動時脈輸出 (\d+)，支援 LP-HCSL\((\d+)Ω\/(\d+)Ω\)、LVDS、([\d./]+)V LVCMOS，未用時保持浮接$/, m => ({
    en: `Differential clock output ${m[1]}; supports LP-HCSL (${m[2]} ohm/${m[3]} ohm), LVDS and ${m[4]}V LVCMOS; leave floating when unused`,
    ja: `差動クロック出力 ${m[1]}；LP-HCSL(${m[2]}Ω/${m[3]}Ω)、LVDS、${m[4]}V LVCMOS に対応。未使用時はオープンのままとする`,
    ko: `차동 클록 출력 ${m[1]}; LP-HCSL(${m[2]}Ω/${m[3]}Ω), LVDS, ${m[4]}V LVCMOS 지원; 미사용 시 개방 상태 유지`
  })],
  [/^AINP\[(\d+):(\d+)\] 正端類比輸入，通道 (\d+)$/, m => ({
    en: `AINP[${m[1]}:${m[2]}] positive analog input, channel ${m[3]}`,
    ja: `AINP[${m[1]}:${m[2]}] 正極アナログ入力、チャネル ${m[3]}`,
    ko: `AINP[${m[1]}:${m[2]}] 정극 아날로그 입력, 채널 ${m[3]}`
  })],
  [/^AINN\[(\d+):(\d+)\] 負端類比輸入，通道 (\d+)$/, m => ({
    en: `AINN[${m[1]}:${m[2]}] negative analog input, channel ${m[3]}`,
    ja: `AINN[${m[1]}:${m[2]}] 負極アナログ入力、チャネル ${m[3]}`,
    ko: `AINN[${m[1]}:${m[2]}] 부극 아날로그 입력, 채널 ${m[3]}`
  })],
  [/^PWDN\[(\d+):(\d+)\] 通道 (\d+)~(\d+) 電源關閉控制，通道 (\d+)$/, m => ({
    en: `PWDN[${m[1]}:${m[2]}] power-down control for channels ${m[3]}-${m[4]}, channel ${m[5]}`,
    ja: `PWDN[${m[1]}:${m[2]}] チャネル ${m[3]}～${m[4]} のパワーダウン制御、チャネル ${m[5]}`,
    ko: `PWDN[${m[1]}:${m[2]}] 채널 ${m[3]}~${m[4]} 파워다운 제어, 채널 ${m[5]}`
  })],
  [/^DOUT\[(\d+):(\d+)\] 通道 (\d+)~(\d+) 資料輸出，通道 (\d+)$/, m => ({
    en: `DOUT[${m[1]}:${m[2]}] data output for channels ${m[3]}-${m[4]}, channel ${m[5]}`,
    ja: `DOUT[${m[1]}:${m[2]}] チャネル ${m[3]}～${m[4]} のデータ出力、チャネル ${m[5]}`,
    ko: `DOUT[${m[1]}:${m[2]}] 채널 ${m[3]}~${m[4]} 데이터 출력, 채널 ${m[5]}`
  })],
  [/^通用輸入輸出 P([A-D])(\d+)（可多工週邊功能，替代功能見 datasheet Table (\d+)\.(\d+)）$/, m => ({
    en: `General-purpose I/O P${m[1]}${m[2]} (peripheral functions can be multiplexed; see datasheet Table ${m[3]}.${m[4]} for alternate functions)`,
    ja: `汎用入出力 P${m[1]}${m[2]}（ペリフェラル機能を多重化可能。代替機能は datasheet Table ${m[3]}.${m[4]} を参照）`,
    ko: `범용 입출력 P${m[1]}${m[2]}(주변 기능 다중화 가능; 대체 기능은 datasheet Table ${m[3]}.${m[4]} 참조)`
  })],
  [/^通用輸入輸出 GPIO(\d+)（多工功能見 Pin Attributes 表）；ADC 通道\/封裝球位：(.+)$/, m => ({
    en: `General-purpose I/O GPIO${m[1]} (see the Pin Attributes table for multiplexed functions); ADC channel / package ball: ${m[2]}`,
    ja: `汎用入出力 GPIO${m[1]}（多重化機能は Pin Attributes 表を参照）；ADC チャネル/パッケージボール：${m[2]}`,
    ko: `범용 입출력 GPIO${m[1]}(다중화 기능은 Pin Attributes 표 참조); ADC 채널/패키지 볼: ${m[2]}`
  })],
  [/^類比輸入通道 (\d+) ([正負])端$/, m => ({
    en: `Analog input channel ${m[1]} ${p(m[2])[0]} side`,
    ja: `アナログ入力チャネル ${m[1]} ${p(m[2])[1]}側`,
    ko: `아날로그 입력 채널 ${m[1]} ${p(m[2])[2]} 측`
  })],
  [/^資料輸出入位元 (\d+)$/, m => ({ en: `Data I/O bit ${m[1]}`, ja: `データ入出力ビット ${m[1]}`, ko: `데이터 입출력 비트 ${m[1]}` })],
  [/^資料輸出 (\d+)$/, m => ({ en: `Data output ${m[1]}`, ja: `データ出力 ${m[1]}`, ko: `데이터 출력 ${m[1]}` })],
  [/^來源腳 (\d+)$/, m => ({ en: `Source pin ${m[1]}`, ja: `ソースピン ${m[1]}`, ko: `소스 핀 ${m[1]}` })],
  [/^([AB]) 組來源腳 (\d+)$/, m => ({ en: `Group ${m[1]} source pin ${m[2]}`, ja: `${m[1]} 組ソースピン ${m[2]}`, ko: `${m[1]} 그룹 소스 핀 ${m[2]}` })],
  [/^來源 (\d+)$/, m => ({ en: `Source ${m[1]}`, ja: `ソース ${m[1]}`, ko: `소스 ${m[1]}` })],
  [/^通道 (\d+) 端 ([AB])$/, m => ({ en: `Channel ${m[1]} side ${m[2]}`, ja: `チャネル ${m[1]} ${m[2]} 側`, ko: `채널 ${m[1]} ${m[2]} 측` })],
  [/^通道 (\d+) 資料 ([AB])$/, m => ({ en: `Channel ${m[1]} data ${m[2]}`, ja: `チャネル ${m[1]} データ ${m[2]}`, ko: `채널 ${m[1]} 데이터 ${m[2]}` })],
  [/^通道 (\d+) 分支 (\d+)$/, m => ({ en: `Channel ${m[1]} branch ${m[2]}`, ja: `チャネル ${m[1]} 分岐 ${m[2]}`, ko: `채널 ${m[1]} 분기 ${m[2]}` })],
  [/^通道 (\d+) 共用端$/, m => ({ en: `Channel ${m[1]} common terminal`, ja: `チャネル ${m[1]} 共通端子`, ko: `채널 ${m[1]} 공통 단자` })],
  [/^通道 (\d+) 輸出$/, m => ({ en: `Channel ${m[1]} output`, ja: `チャネル ${m[1]} 出力`, ko: `채널 ${m[1]} 출력` })],
  [/^通道 (\d+) 輸入$/, m => ({ en: `Channel ${m[1]} input`, ja: `チャネル ${m[1]} 入力`, ko: `채널 ${m[1]} 입력` })],
  [/^通道 (\d+) 輸出致能（高態導通）$/, m => ({
    en: `Channel ${m[1]} output enable (active high)`,
    ja: `チャネル ${m[1]} 出力イネーブル（ハイでオン）`,
    ko: `채널 ${m[1]} 출력 인에이블(하이에서 온)`
  })],
  [/^通道 (\d+) 選通（高=致能輸出）$/, m => ({
    en: `Channel ${m[1]} select (high = output enabled)`,
    ja: `チャネル ${m[1]} 選択（ハイ=出力有効）`,
    ko: `채널 ${m[1]} 선택(하이=출력 활성)`
  })],
  [/^通道 (\d+) LVDS (反相|非反相)輸入$/, m => ({
    en: `Channel ${m[1]} LVDS ${m[2] === '反相' ? 'inverting' : 'non-inverting'} input`,
    ja: `チャネル ${m[1]} LVDS ${m[2] === '反相' ? '反転' : '非反転'}入力`,
    ko: `채널 ${m[1]} LVDS ${m[2] === '反相' ? '반전' : '비반전'} 입력`
  })],
  [/^通道 (\d+) (反相|非反相)輸出$/, m => ({
    en: `Channel ${m[1]} ${m[2] === '反相' ? 'inverting' : 'non-inverting'} output`,
    ja: `チャネル ${m[1]} ${m[2] === '反相' ? '反転' : '非反転'}出力`,
    ko: `채널 ${m[1]} ${m[2] === '反相' ? '반전' : '비반전'} 출력`
  })],
  [/^通道 (\d+) LVTTL 輸出$/, m => ({ en: `Channel ${m[1]} LVTTL output`, ja: `チャネル ${m[1]} LVTTL 出力`, ko: `채널 ${m[1]} LVTTL 출력` })],
  [/^通道 (\d+) TIA 輸入$/, m => ({ en: `Channel ${m[1]} TIA input`, ja: `チャネル ${m[1]} TIA 入力`, ko: `채널 ${m[1]} TIA 입력` })],
  [/^通道 (\d+) 輸出，接負載 (\d+)$/, m => ({
    en: `Channel ${m[1]} output, driving load ${m[2]}`,
    ja: `チャネル ${m[1]} 出力、負荷 ${m[2]} に接続`,
    ko: `채널 ${m[1]} 출력, 부하 ${m[2]}에 연결`
  })],
  [/^通道 (\d+) 低邊 FET 源極：接系統地，或經感測電阻接地做外部電流感測$/, m => ({
    en: `Channel ${m[1]} low-side FET source: tie to system ground, or to ground through a sense resistor for external current sensing`,
    ja: `チャネル ${m[1]} ローサイド FET のソース：システムグランドに接続、または外部電流センス用にセンス抵抗経由で接地`,
    ko: `채널 ${m[1]} 로우사이드 FET 소스: 시스템 접지에 연결하거나, 외부 전류 감지를 위해 감지 저항을 거쳐 접지`
  })],
  [/^下游通道 (\d+) 資料$/, m => ({ en: `Downstream channel ${m[1]} data`, ja: `下流チャネル ${m[1]} データ`, ko: `하류 채널 ${m[1]} 데이터` })],
  [/^外部類比訊號輸入通道(\d+)，經專用 ADC 介面取樣。$/, m => ({
    en: `External analog signal input channel ${m[1]}, sampled through the dedicated ADC interface.`,
    ja: `外部アナログ信号入力チャネル ${m[1]}。専用 ADC インターフェース経由でサンプリングされる。`,
    ko: `외부 아날로그 신호 입력 채널 ${m[1]}, 전용 ADC 인터페이스를 통해 샘플링된다.`
  })],
  [/^IOMUX 訊號球；mux: (.+)$/, m => ({
    en: `IOMUX signal ball; mux: ${m[1]}`,
    ja: `IOMUX 信号ボール；mux: ${m[1]}`,
    ko: `IOMUX 신호 볼; mux: ${m[1]}`
  })],
  [/^轉速計輸入 (\d+)（數位或類比訊號可設定）$/, m => ({
    en: `Tachometer input ${m[1]} (configurable for a digital or analog signal)`,
    ja: `タコメータ入力 ${m[1]}（デジタルまたはアナログ信号に設定可能）`,
    ko: `타코미터 입력 ${m[1]}(디지털 또는 아날로그 신호로 설정 가능)`
  })],
  [/^開汲極 PWM 輸出 (\d+)；可再配置為 TACH(\d+) 輸入$/, m => ({
    en: `Open-drain PWM output ${m[1]}; can be reconfigured as the TACH${m[2]} input`,
    ja: `オープンドレイン PWM 出力 ${m[1]}；TACH${m[2]} 入力に再構成可能`,
    ko: `오픈 드레인 PWM 출력 ${m[1]}; TACH${m[2]} 입력으로 재구성 가능`
  })],
  [/^LPSDR 輸出（低速介面讀取資料，([A-Z]) 通道）$/, m => ({
    en: `LPSDR output (low-speed interface read data, channel ${m[1]})`,
    ja: `LPSDR 出力（低速インターフェースの読み出しデータ、${m[1]} チャネル）`,
    ko: `LPSDR 출력(저속 인터페이스 읽기 데이터, ${m[1]} 채널)`
  })],
  [/^LVCMOS 時脈輸出 (\d+)$/, m => ({ en: `LVCMOS clock output ${m[1]}`, ja: `LVCMOS クロック出力 ${m[1]}`, ko: `LVCMOS 클록 출력 ${m[1]}` })],
  [/^快速重組態介面資料位元 (\d+)$/, m => ({
    en: `Fast reconfiguration interface data bit ${m[1]}`,
    ja: `高速再構成インターフェースのデータビット ${m[1]}`,
    ko: `고속 재구성 인터페이스 데이터 비트 ${m[1]}`
  })],
  [/^外接 XiP Flash 的 quad\/octal-SPI 介面 資料 (\d+)（支援即時解密）$/, m => ({
    en: `Quad/octal-SPI interface data ${m[1]} for the external XiP flash (with on-the-fly decryption)`,
    ja: `外付け XiP Flash 用 quad/octal-SPI インターフェースのデータ ${m[1]}（オンザフライ復号に対応）`,
    ko: `외부 XiP Flash용 quad/octal-SPI 인터페이스 데이터 ${m[1]}(실시간 복호 지원)`
  })],
  [/^高速差動時脈（SubLVDS）([A-Z]) 通道 ([正負])端$/, m => ({
    en: `High-speed differential clock (SubLVDS), channel ${m[1]} ${p(m[2])[0]} side`,
    ja: `高速差動クロック（SubLVDS）${m[1]} チャネル ${p(m[2])[1]}側`,
    ko: `고속 차동 클록(SubLVDS) ${m[1]} 채널 ${p(m[2])[2]} 측`
  })],
  [/^高速差動時脈（SubLVDS）([A-Z]) 通道([正負])端 \(([PN])\)$/, m => ({
    en: `High-speed differential clock (SubLVDS), channel ${m[1]} ${p(m[2])[0]} side (${m[3]})`,
    ja: `高速差動クロック（SubLVDS）${m[1]} チャネル ${p(m[2])[1]}側 (${m[3]})`,
    ko: `고속 차동 클록(SubLVDS) ${m[1]} 채널 ${p(m[2])[2]} 측 (${m[3]})`
  })],
  [/^MUX: GPADC(\d+)$/, m => ({ en: `MUX: GPADC${m[1]}`, ja: `MUX: GPADC${m[1]}`, ko: `MUX: GPADC${m[1]}` })],
  [/^(\d+)GHz (接收|發射)天線埠 \((RX|TX)(\d+)\)$/, m => ({
    en: `${m[1]}GHz ${m[2] === '接收' ? 'receive' : 'transmit'} antenna port (${m[3]}${m[4]})`,
    ja: `${m[1]}GHz ${m[2] === '接收' ? '受信' : '送信'}アンテナポート (${m[3]}${m[4]})`,
    ko: `${m[1]}GHz ${m[2] === '接收' ? '수신' : '송신'} 안테나 포트 (${m[3]}${m[4]})`
  })],
  [/^([AB]) 埠 I\/O (\d+)$/, m => ({ en: `Port ${m[1]} I/O ${m[2]}`, ja: `${m[1]} ポート I/O ${m[2]}`, ko: `${m[1]} 포트 I/O ${m[2]}` })],
  [/^開關 (\d+) 控制（高導通）$/, m => ({
    en: `Switch ${m[1]} control (high = on)`,
    ja: `スイッチ ${m[1]} 制御（ハイでオン）`,
    ko: `스위치 ${m[1]} 제어(하이에서 온)`
  })],
  [/^開關 (\d+) 端 ([YZ])$/, m => ({ en: `Switch ${m[1]} terminal ${m[2]}`, ja: `スイッチ ${m[1]} ${m[2]} 端子`, ko: `스위치 ${m[1]} ${m[2]} 단자` })],
  [/^差動時脈輸出 (\d+) ([正負])$/, m => ({
    en: `Differential clock output ${m[1]} ${p(m[2])[0]}`,
    ja: `差動クロック出力 ${m[1]} ${p(m[2])[1]}`,
    ko: `차동 클록 출력 ${m[1]} ${p(m[2])[2]}`
  })],
  [/^RGMII 模式：傳送資料位元 (\d+)（TD(\d+)）輸入$/, m => ({
    en: `RGMII mode: transmit data bit ${m[1]} (TD${m[2]}) input`,
    ja: `RGMII モード：送信データビット ${m[1]}（TD${m[2]}）入力`,
    ko: `RGMII 모드: 송신 데이터 비트 ${m[1]}(TD${m[2]}) 입력`
  })],
  [/^RGMII 模式：接收資料位元 (\d+)（RD(\d+)）輸出；上電 strap：鎖存為 MODE\[(\d+)\]，上拉=(\d+)／下拉=(\d+)$/, m => ({
    en: `RGMII mode: receive data bit ${m[1]} (RD${m[2]}) output; power-up strap: latched as MODE[${m[3]}], pull-up = ${m[4]} / pull-down = ${m[5]}`,
    ja: `RGMII モード：受信データビット ${m[1]}（RD${m[2]}）出力；電源投入時 strap：MODE[${m[3]}] としてラッチ、プルアップ=${m[4]}／プルダウン=${m[5]}`,
    ko: `RGMII 모드: 수신 데이터 비트 ${m[1]}(RD${m[2]}) 출력; 전원 투입 strap: MODE[${m[3]}]로 래치, 풀업=${m[4]}／풀다운=${m[5]}`
  })],
  [/^LED 致能觸發輸入(\d+)。$/, m => ({
    en: `LED enable trigger input ${m[1]}.`,
    ja: `LED イネーブルトリガ入力 ${m[1]}。`,
    ko: `LED 인에이블 트리거 입력 ${m[1]}.`
  })],
  [/^序列輸出資料通道 (\d+)$/, m => ({ en: `Serial output data channel ${m[1]}`, ja: `シリアル出力データチャネル ${m[1]}`, ko: `직렬 출력 데이터 채널 ${m[1]}` })],
  [/^序列輸出資料通道 (\d+)，或菊鏈輸入 (\d+)$/, m => ({
    en: `Serial output data channel ${m[1]}, or daisy-chain input ${m[2]}`,
    ja: `シリアル出力データチャネル ${m[1]}、またはデイジーチェーン入力 ${m[2]}`,
    ko: `직렬 출력 데이터 채널 ${m[1]}, 또는 데이지 체인 입력 ${m[2]}`
  })],
  [/^([A-Z]) 通道 lane (\d+) 序列 LVDS 輸出，([正負])端$/, m => ({
    en: `Channel ${m[1]} lane ${m[2]} serial LVDS output, ${p(m[3])[0]} side`,
    ja: `${m[1]} チャネル lane ${m[2]} シリアル LVDS 出力、${p(m[3])[1]}側`,
    ko: `${m[1]} 채널 lane ${m[2]} 직렬 LVDS 출력, ${p(m[3])[2]} 측`
  })],
  [/^([A-Z]) 通道 lane (\d+) 序列 LVDS 輸出([正負])端$/, m => ({
    en: `Channel ${m[1]} lane ${m[2]} serial LVDS output ${p(m[3])[0]} side`,
    ja: `${m[1]} チャネル lane ${m[2]} シリアル LVDS 出力${p(m[3])[1]}側`,
    ko: `${m[1]} 채널 lane ${m[2]} 직렬 LVDS 출력 ${p(m[3])[2]} 측`
  })],
  [/^DAC(\d+) 緩衝輸出$/, m => ({ en: `DAC${m[1]} buffered output`, ja: `DAC${m[1]} バッファ出力`, ko: `DAC${m[1]} 버퍼 출력` })],
  [/^ADC 類比輸入通道（(.+)）$/, m => ({
    en: `ADC analog input channel (${m[1]})`,
    ja: `ADC アナログ入力チャネル（${m[1]}）`,
    ko: `ADC 아날로그 입력 채널(${m[1]})`
  })],
  [/^差動類比輸入，通道 (\d+) ([正負])端。內建可程式 (\d+)\/(\d+)\/(\d+)Ω 端接$/, m => ({
    en: `Differential analog input, channel ${m[1]} ${p(m[2])[0]} side. Built-in programmable ${m[3]}/${m[4]}/${m[5]} ohm termination`,
    ja: `差動アナログ入力、チャネル ${m[1]} ${p(m[2])[1]}側。プログラマブル ${m[3]}/${m[4]}/${m[5]}Ω 終端を内蔵`,
    ko: `차동 아날로그 입력, 채널 ${m[1]} ${p(m[2])[2]} 측. 프로그래머블 ${m[3]}/${m[4]}/${m[5]}Ω 종단 내장`
  })],
  [/^觸發介面球 (\d+)；於 FR Interface 亦作為資料輸入 (\d+)；內建下拉$/, m => ({
    en: `Trigger interface ball ${m[1]}; also serves as data input ${m[2]} on the FR Interface; built-in pull-down`,
    ja: `トリガインターフェースボール ${m[1]}；FR Interface ではデータ入力 ${m[2]} も兼ねる；プルダウン内蔵`,
    ko: `트리거 인터페이스 볼 ${m[1]}; FR Interface에서는 데이터 입력 ${m[2]}도 겸함; 풀다운 내장`
  })],
  [/^位址選擇 (\d+)；內建 (\d+)MΩ 下拉$/, m => ({
    en: `Address select ${m[1]}; built-in ${m[2]} Mohm pull-down`,
    ja: `アドレス選択 ${m[1]}；${m[2]}MΩ プルダウン内蔵`,
    ko: `주소 선택 ${m[1]}; ${m[2]}MΩ 풀다운 내장`
  })],
  [/^位址線 (\d+)$/, m => ({ en: `Address line ${m[1]}`, ja: `アドレスライン ${m[1]}`, ko: `주소 라인 ${m[1]}` })],
  [/^I2C 位址選擇 (\d+)$/, m => ({ en: `I2C address select ${m[1]}`, ja: `I2C アドレス選択 ${m[1]}`, ko: `I2C 주소 선택 ${m[1]}` })],
  [/^輸出 (\d+) 電源$/, m => ({ en: `Output ${m[1]} supply`, ja: `出力 ${m[1]} 電源`, ko: `출력 ${m[1]} 전원` })],
  [/^DCDC(\d+) 電感接腳（開關節點）$/, m => ({
    en: `DCDC${m[1]} inductor pin (switch node)`,
    ja: `DCDC${m[1]} インダクタピン（スイッチノード）`,
    ko: `DCDC${m[1]} 인덕터 핀(스위치 노드)`
  })],
  [/^DCDC(\d+) 的 NMOS 功率地$/, m => ({
    en: `NMOS power ground for DCDC${m[1]}`,
    ja: `DCDC${m[1]} の NMOS パワーグランド`,
    ko: `DCDC${m[1]}의 NMOS 파워 그라운드`
  })],
  [/^LDO(\d+) 輸出腳$/, m => ({ en: `LDO${m[1]} output pin`, ja: `LDO${m[1]} 出力ピン`, ko: `LDO${m[1]} 출력 핀` })],
  [/^外部 ([\d.]+)V buck 致能訊號\(([\d.]+)V 輸出位準\)。$/, m => ({
    en: `Enable signal for the external ${m[1]}V buck (${m[2]}V output level).`,
    ja: `外部 ${m[1]}V buck のイネーブル信号（${m[2]}V 出力レベル）。`,
    ko: `외부 ${m[1]}V buck 인에이블 신호(${m[2]}V 출력 레벨).`
  })],
  [/^外部 ([\d.]+)V buck 電壓監控輸入。$/, m => ({
    en: `Voltage monitor input for the external ${m[1]}V buck.`,
    ja: `外部 ${m[1]}V buck の電圧監視入力。`,
    ko: `외부 ${m[1]}V buck 전압 감시 입력.`
  })],
  [/^比較器非反相輸入，監控電源軌 (\d+)；接法同 SENSE(\d+)，設定 VON(\d+)\/VOFF(\d+)。$/, m => ({
    en: `Comparator non-inverting input, monitoring supply rail ${m[1]}; connected the same way as SENSE${m[2]}, setting VON${m[3]}/VOFF${m[4]}.`,
    ja: `コンパレータの非反転入力。電源レール ${m[1]} を監視；接続方法は SENSE${m[2]} と同じ、VON${m[3]}/VOFF${m[4]} を設定。`,
    ko: `비교기 비반전 입력, 전원 레일 ${m[1]} 감시; 연결 방법은 SENSE${m[2]}와 동일, VON${m[3]}/VOFF${m[4]} 설정.`
  })],
  [/^重置輸出 (\d+)；SENSE(\d+) 故障時輸出低態。接法同 RESET(\d+)。$/, m => ({
    en: `Reset output ${m[1]}; drives low when SENSE${m[2]} faults. Connected the same way as RESET${m[3]}.`,
    ja: `リセット出力 ${m[1]}；SENSE${m[2]} が故障するとローを出力。接続方法は RESET${m[3]} と同じ。`,
    ko: `리셋 출력 ${m[1]}; SENSE${m[2]} 고장 시 로우를 출력. 연결 방법은 RESET${m[3]}과 동일.`
  })]
];

const out = {};
let matched = 0;
const unmatched = [];
for (const { s, n } of todo) {
  let hit = null;
  for (const [re, fn] of RULES) {
    const m = s.match(re);
    if (m) { hit = fn(m); break; }
  }
  if (hit) { out[s] = hit; matched++; }
  else unmatched.push({ s, n });
}
console.log('todo:', todo.length, '| generated:', matched, '| still unmatched:', unmatched.length);

// emit JS IIFE
const esc = t => t.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
let js = "\n(function () {\n  window.IC_PIN_I18N = window.IC_PIN_I18N || {};\n  /* pin desc batch 3: rule-generated templated strings */\n  var P = {\n";
const keys = Object.keys(out);
keys.forEach((k, i) => {
  const t = out[k];
  js += `    '${esc(k)}': { en: '${esc(t.en)}', ja: '${esc(t.ja)}', ko: '${esc(t.ko)}' }${i < keys.length - 1 ? ',' : ''}\n`;
});
js += "  };\n  Object.assign(window.IC_PIN_I18N, P);\n})();\n";
fs.writeFileSync(path.join(__dirname, 'pin-gen-out.js'), js, 'utf8');
fs.writeFileSync(path.join(__dirname, 'pin-todo-rest.json'), JSON.stringify(unmatched, null, 1));
console.log('wrote pin-gen-out.js (append into ic-pin-i18n-data.js) and pin-todo-rest.json (hand-translate these)');
