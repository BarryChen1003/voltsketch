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
