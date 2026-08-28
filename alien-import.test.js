/**
 * alien-import.test.js — Eagle / LTspice / Altium 匯入驗證（node）
 *
 * 重點在「不認得的東西要照實說」，因為這類匯入最危險的失敗不是解析不出來，
 * 而是把認不得的元件硬塞成電阻——圖畫得出來、模擬跑得動、結果全錯。
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

const AI = require('./alien-import.js');

let pass = 0, fail = 0;
function eq(a, b, msg) {
  const ok = JSON.stringify(a) === JSON.stringify(b);
  if (ok) pass++; else { fail++; console.error(`FAIL ${msg}\n  expected ${JSON.stringify(b)}\n  got      ${JSON.stringify(a)}`); }
}
const ok = (v, msg) => eq(!!v, true, msg);

// ---- 0. XML 掃描器 ----
{
  const x = '<a k="1"><b n="x"/><b n="y">inner</b></a>';
  eq(AI._xmlNodes(x, 'b').map(n => n.attrs.n), ['x', 'y'], '0.1 自閉與成對標籤都抓得到');
  eq(AI._xmlNodes(x, 'b')[1].inner, 'inner', '0.2 內容取得出來');
  eq(AI._parseAttrs(' x="1" y="-2.5" rot="R90"'), { x: '1', y: '-2.5', rot: 'R90' }, '0.3 屬性解析');
}
{
  // 巢狀同名標籤不可以提早收尾
  const x = '<n name="A"><n name="B">deep</n>tail</n>';
  const got = AI._xmlNodes(x, 'n');
  eq(got.length, 2, '0.4 巢狀同名標籤各算一個');
  eq(got[0].inner, '<n name="B">deep</n>tail', '0.5 外層 inner 含完整內層（沒有提早收尾）');
}

// ---- 1. Eagle .sch ----
const EAGLE_SCH = `<?xml version="1.0"?>
<eagle version="9.6.2"><drawing><schematic>
<parts>
  <part name="R1" library="rcl" deviceset="R-EU_" device="0603" value="10k"/>
  <part name="C1" library="rcl" deviceset="C-EU" device="0603" value="100n"/>
  <part name="U1" library="ic" deviceset="LM358" device="SO08"/>
  <part name="WEIRD1" library="zzz" deviceset="MYSTERY" device="X"/>
</parts>
<sheets><sheet>
<instances>
  <instance part="R1" gate="G$1" x="10.16" y="45.72"/>
  <instance part="C1" gate="G$1" x="20.32" y="45.72" rot="R90"/>
  <instance part="U1" gate="A" x="40.64" y="50.8"/>
  <instance part="WEIRD1" gate="G$1" x="60" y="60"/>
</instances>
<nets>
  <net name="VCC" class="0"><segment>
    <wire x1="10.16" y1="50.8" x2="20.32" y2="50.8" width="0.1524" layer="91"/>
  </segment></net>
  <net name="GND" class="0"><segment>
    <wire x1="10.16" y1="40.64" x2="20.32" y2="40.64" width="0.1524" layer="91"/>
    <wire x1="20.32" y1="40.64" x2="40.64" y2="40.64" width="0.1524" layer="91"/>
  </segment></net>
</nets>
</sheet></sheets>
</schematic></drawing></eagle>`;
{
  const r = AI.parseEagleSch(EAGLE_SCH);
  eq(r.components.length, 3, '1.1 三顆認得的元件（MYSTERY 不放進畫布）');
  eq(r.components.map(c => c.type), ['resistor', 'capacitor', 'ic'], '1.2 型別對應正確');
  eq(r.components.map(c => c.label), ['R1', 'C1', 'U1'], '1.3 refdes 帶過來');
  eq(r.components[0].value, '10k', '1.4 值帶過來');
  eq(r.components[1].rotation, 90, '1.5 旋轉帶過來');
  eq(r.components[0].y < 0, true, '1.6 Y 有翻轉（Eagle 的 Y 向上）');
  eq(r.wires.length, 3, '1.7 三段接線');
  eq(r.nets.map(n => n.name), ['VCC', 'GND'], '1.8 net 名稱拿得到');
  eq(r.report.unknown, ['WEIRD1(MYSTERY)'], '1.9 認不得的元件照實列出來');
  ok(r.warnings.some(w => /unknown_devices:1/.test(w)), '1.10 而且有警告——絕對不可以硬塞成電阻');
}
{
  const r = AI.parseEagleSch('<?xml version="1.0"?><notEagle/>');
  ok(r.warnings.includes('not_eagle'), '1.11 不是 Eagle 檔要講');
  eq(r.components, [], '1.12 而且不產出任何東西');
}

// ---- 2. Eagle .brd ----
const EAGLE_BRD = `<?xml version="1.0"?>
<eagle version="9.6.2"><drawing><board>
<plain>
  <wire x1="0" y1="0" x2="50" y2="0" width="0" layer="20"/>
  <wire x1="50" y1="0" x2="50" y2="40" width="0" layer="20"/>
</plain>
<elements>
  <element name="R1" library="rcl" package="R0603" value="10k" x="10" y="20" rot="R90"/>
  <element name="C1" library="rcl" package="C0603" value="100n" x="15" y="20" rot="MR180"/>
</elements>
<signals>
  <signal name="VCC">
    <wire x1="10" y1="20" x2="20" y2="20" width="0.254" layer="1"/>
    <via x="20" y="20" extent="1-16" drill="0.3" diameter="0.6"/>
  </signal>
  <signal name="GND">
    <wire x1="5" y1="5" x2="8" y2="5" width="0.4" layer="16"/>
  </signal>
</signals>
</board></drawing></eagle>`;
{
  const r = AI.parseEagleBrd(EAGLE_BRD);
  eq(r.components.length, 2, '2.1 兩顆元件');
  eq(r.components[0].ref, 'R1', '2.2 ref 帶過來');
  eq(r.components[0].rot, 90, '2.3 旋轉帶過來');
  eq(r.components[1].side, 'bottom', '2.4 MR180 認得出是底面');
  eq(r.components[0].y, -20, '2.5 Y 有翻轉');
  eq(r.traces.length, 2, '2.6 兩條走線（板框不算在內）');
  eq(r.outline.length, 2, '2.7 板框兩段（layer 20）');
  eq(r.traces.find(t => t.layer === 'F.Cu').net, 'VCC', '2.8 net 名有帶到走線上');
  eq(r.traces.find(t => t.layer === 'B.Cu').net, 'GND', '2.9 底層走線的 net 也有');
  eq(r.vias.length, 1, '2.10 一個 via');
  eq([r.vias[0].x, r.vias[0].y, r.vias[0].drill], [20, -20, 0.3], '2.11 via 位置與孔徑');
  ok(r.warnings.includes('footprints_not_imported'), '2.12 一定要講「封裝沒有匯入」');
  eq(r.report.lossy.includes('placeholder_sizes'), true, '2.13 尺寸是佔位值，report 有標');
}

// ---- 3. LTspice .asc ----
const LTSPICE = `Version 4
SHEET 1 880 680
WIRE 176 96 80 96
WIRE 320 96 176 96
WIRE 80 208 80 96
FLAG 80 288 0
FLAG 176 96 VOUT
SYMBOL res 160 80 R0
SYMATTR InstName R1
SYMATTR Value 10k
SYMBOL cap 304 80 R0
SYMATTR InstName C1
SYMATTR Value 100n
SYMBOL voltage 80 192 R0
SYMATTR InstName V1
SYMATTR Value 5
SYMBOL wormhole 400 400 R0
SYMATTR InstName X1
TEXT 80 320 Left 2 !.tran 10m
TEXT 80 350 Left 2 ;this is a comment`;
{
  const r = AI.parseLtspice(LTSPICE);
  const named = r.components.filter(c => c.label);
  eq(named.map(c => c.type), ['resistor', 'capacitor', 'source'], '3.1 三顆元件型別對應');
  eq(named.map(c => c.label), ['R1', 'C1', 'V1'], '3.2 InstName 帶過來');
  eq(named.map(c => c.value), ['10k', '100n', '5'], '3.3 Value 帶過來');
  eq(r.wires.length, 3, '3.4 三段接線');
  eq(r.components.filter(c => c.type === 'ground').length, 1, '3.5 FLAG 0 變成接地符號');
  eq(r.nets.map(n => n.name), ['VOUT'], '3.6 具名 net 標籤收在 nets');
  eq(r.directives, ['.tran 10m'], '3.7 SPICE 指令收起來（給求解器用）');
  eq(r.report.unknown, ['wormhole'], '3.8 認不得的符號照實列出');
  ok(r.warnings.some(w => /unknown_symbols:wormhole/.test(w)), '3.9 而且有警告');
  eq(r.components.some(c => c.label === 'X1'), false, '3.10 認不得的不放進畫布');
}
{
  const r = AI.parseLtspice('rubbish');
  ok(r.warnings.includes('not_ltspice'), '3.11 不是 .asc 要講');
}
{
  // LTspice 的 Y 向下，跟這個編輯器一致，不可以翻
  const r = AI.parseLtspice('Version 4\nSYMBOL res 100 200 R0\nSYMATTR InstName R9');
  eq([r.components[0].x, r.components[0].y], [100, 200], '3.12 LTspice 座標不翻 Y');
}

// ---- 4. Altium：只辨識不解析 ----
{
  const ole = new Uint8Array(600);
  ole.set([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1], 0);
  // 埋一個 UTF-16LE 的 'Tracks6'
  const w = 'Tracks6';
  for (let i = 0; i < w.length; i++) { ole[100 + i * 2] = w.charCodeAt(i); ole[101 + i * 2] = 0; }
  const r = AI.inspectAltium(ole, 'board.PcbDoc');
  eq(r.ok, false, '4.1 不假裝解析成功');
  eq(r.isOle, true, '4.2 認得出 OLE 複合檔');
  eq(r.kind, 'PcbDoc', '4.3 認得出檔種');
  eq(r.storages, ['Tracks6'], '4.4 列得出裡面有哪些 storage（證明真的讀到了）');
  eq(r.advice, 'export_kicad_or_gerber', '4.5 給明確指引，不是只丟一句失敗');
}
{
  const r = AI.inspectAltium(new Uint8Array([1, 2, 3]), 'x.PcbDoc');
  eq([r.isOle, r.advice], [false, 'wrong_file'], '4.6 不是 OLE 就說檔案不對');
}
eq(AI.inspectAltium(null, '').ok, false, '4.7 null 不炸');

// ---- 5. 型別對應表本身 ----
eq(AI.eagleType('R1'), 'resistor', '5.1 refdes R1 → 電阻');
eq(AI.eagleType('LM358'), null, '5.1b LM358 不可以被當成電感（首字母 L 的陷阱）');
eq(AI.eagleType('U1'), 'ic', '5.1c U1 → IC');
eq(AI.eagleType('FB1'), 'bead', '5.1d FB1 → 磁珠（不可以被 F 吃掉）');
eq(AI.eagleType('MYSTERY'), null, '5.2 對不到就回 null（不猜）');
eq(AI.eagleType('XTAL1'), 'xtal', '5.2b XTAL1 → 晶振（不可以被 X 吃掉）');
eq(AI.LTSPICE_SYM.res, 'resistor', '5.3 LTspice res');
eq(AI.LTSPICE_SYM.voltage, 'source', '5.4 LTspice voltage');
eq(AI.LTSPICE_SYM.wormhole, undefined, '5.5 沒有的符號就是沒有');

// ---- 6. 邊界 ----
eq(AI.parseEagleSch('').components, [], '6.1 空字串不炸');
eq(AI.parseEagleSch(null).components, [], '6.2 null 不炸');
eq(AI.parseEagleBrd('').traces, [], '6.3 空 brd 不炸');
eq(AI.parseLtspice('').components, [], '6.4 空 asc 不炸');
eq(AI.parseLtspice(null).wires, [], '6.5 null asc 不炸');

console.log(`\nalien-import.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
