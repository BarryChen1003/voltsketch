/**
 * sch-hier.test.js — 階層式圖紙（sch-hier.js）
 *
 * 這個功能有兩個一旦錯就很難察覺的地方：
 *   1. **多實例必須彼此隔離**。同一張子圖放兩份，內部訊號要各走各的。
 *      沒隔離的話兩份會共用同一條 net——畫面上完全正常，到板子上是短路。
 *      第 3 節同時驗「該連的有連」與「不該連的沒連」，缺一條都測不到東西。
 *   2. **遞迴要當場擋下**。A 放 B、B 放 A，展開不是很久，是永遠：
 *      瀏覽器沒反應，而使用者只會覺得「按了沒事發生」。
 *
 * 另外釘住一個刻意的取捨：**net 標籤仍然是全域的**（沿用既有跨頁行為）。
 * 同一張子圖放兩次又在裡面用了標籤，那兩份就會相通——這件事不偷偷改掉，
 * 而是報一條 warning（第 5 節）。悄悄改成區域的會讓現有的圖一夜之間斷線。
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

global.window = { I18N: null };
require('./circuit-engine.js');
const H = require('./sch-hier.js');
const E = global.window.CircuitEngine;

let pass = 0, fail = 0;
function eq(a, b, msg) {
  const okk = JSON.stringify(a) === JSON.stringify(b);
  if (okk) pass++; else { fail++; console.error(`FAIL ${msg}\n  expected ${JSON.stringify(b)}\n  got      ${JSON.stringify(a)}`); }
}
const ok = (v, msg) => eq(!!v, true, msg);

// 子圖：port IN —wire— R1 —wire— port OUT
function subPage(name, extraWires) {
  return {
    name, data: {
      components: [
        { id: 'pin', type: 'port', name: 'IN', dir: 'in', x: 0, y: 100, rotation: 0 },
        { id: 'r1', type: 'resistor', x: 100, y: 100, rotation: 0, label: 'R1' },
        { id: 'pout', type: 'port', name: 'OUT', dir: 'out', x: 200, y: 100, rotation: 180 }
      ],
      wires: [{ x1: 24, y1: 100, x2: 76, y2: 100 }, { x1: 124, y1: 100, x2: 176, y2: 100 }].concat(extraWires || [])
    }
  };
}
function inst(id, label, sheet, x, ports) {
  const c = { id, type: 'sheetref', sheet, label, x, y: 100, rotation: 0 };
  H.syncInstance(c, ports || []);
  return c;
}
const pinAt = (c, name) => E.getPins(c).find(p => p.name === name);

// ---- 1. port 清單 ----
{
  const d = {
    components: [
      { id: 'b', type: 'port', name: 'ZZ' },
      { id: 'a', type: 'port', name: 'AA', dir: 'out' },
      { id: 'c', type: 'port', name: '' },              // 沒名字：不算
      { id: 'r', type: 'resistor' }
    ]
  };
  eq(H.portsOf(d).map(p => p.name), ['AA', 'ZZ'], '1.1 依名字排序（順序不穩的話母圖的腳會亂跳）');
  eq(H.portsOf(d).length, 2, '1.2 沒名字的 port 不算');
  eq(H.portsOf(d)[0].dir, 'out', '1.3 方向');
  eq(H.portsOf(d)[1].dir, 'bidir', '1.4 沒寫方向預設 bidir');
  eq(H.portsOf(null), [], '1.5 null 不炸');
  eq(H.portsOf({ components: [{ id: 'x', type: 'port', name: 'A', dir: '亂寫' }] })[0].dir, 'bidir', '1.6 方向亂寫退回 bidir');
}

// ---- 2. 腳位快取 ----
{
  const ports = H.portsOf(subPage('SUB').data);
  const u = inst('u1', 'U1', 'SUB', 100, ports);
  eq(u.icPins.map(p => p.num), ['IN', 'OUT'], '2.1 腳名＝port 名');
  eq(E.getPins(u).map(p => p.name), ['IN', 'OUT'], '2.2 引擎給得出腳（走 icLayout）');
  eq(H.instanceStatus(u, [subPage('SUB')]), 'synced', '2.3 剛同步＝一致');

  // 子圖加了一個 port → 母圖那顆的快取過期，必須講出來
  const changed = subPage('SUB');
  changed.data.components.push({ id: 'p3', type: 'port', name: 'EN', dir: 'in' });
  eq(H.instanceStatus(u, [changed]), 'stale', '2.4 子圖改了 port → stale');
  eq(H.instanceStatus(u, [{ name: 'OTHER', data: {} }]), 'missing', '2.5 找不到那一頁');
  eq(H.instanceStatus(u, [{ name: 'SUB', data: { components: [] } }]), 'empty', '2.6 那頁沒有 port');
  eq(H.instanceStatus({ type: 'resistor' }, []), 'missing', '2.7 不是實例');
}

// ---- 3. 展開：該連的連、不該連的不連 ----
{
  const sub = subPage('SUB');
  const ports = H.portsOf(sub.data);
  const u1 = inst('u1', 'U1', 'SUB', 100, ports);
  const u2 = inst('u2', 'U2', 'SUB', 400, ports);
  const o1 = pinAt(u1, 'OUT'), i2 = pinAt(u2, 'IN');
  const top = { name: 'TOP', data: { components: [u1, u2], wires: [{ x1: o1.x, y1: o1.y, x2: i2.x, y2: i2.y }] } };
  const b = H.build([top, sub], 0, E);

  eq(b.comps.map(c => c.id), ['U1/r1', 'U2/r1'], '3.1 元件帶實例路徑，兩份不撞名');
  eq(b.comps.map(c => c.label), ['U1/R1', 'U2/R1'], '3.2 refdes 也帶路徑');
  eq(b.findings.length, 0, '3.3 這張圖沒有問題');
  eq(b.instances.map(i => i.path), ['U1', 'U2'], '3.4 實例清單');

  const n = (id, i) => b.netOf(id, i);
  ok(n('U1/r1', 1) === n('U2/r1', 0), '3.5 U1.OUT 接 U2.IN → **同一條 net**');
  ok(n('U1/r1', 0) !== n('U2/r1', 0), '3.6 U1.IN 與 U2.IN → **不可以是同一條**（多實例的全部意義）');
  ok(n('U1/r1', 0) !== n('U1/r1', 1), '3.7 同一顆電阻兩腳不同 net');
  eq(new Set([n('U1/r1', 0), n('U1/r1', 1), n('U2/r1', 1)]).size, 3, '3.8 三條相異的 net');
  eq(n('nope', 0), '', '3.9 問不存在的腳回空字串');

  // 母圖那條線拿掉 → 3.5 必須反過來。沒有這條的話 3.5 可能只是碰巧成立。
  const top2 = { name: 'TOP', data: { components: [u1, u2], wires: [] } };
  const b2 = H.build([top2, sub], 0, E);
  ok(b2.netOf('U1/r1', 1) !== b2.netOf('U2/r1', 0), '3.10 母圖沒接線時就不該同 net（證明 3.5 測到的是那條線）');
}

// ---- 4. 遞迴 ----
{
  const selfRef = { name: 'A', data: { components: [{ id: 'x', type: 'sheetref', sheet: 'A', label: 'X' }] } };
  eq(H.cycles([selfRef]).length, 1, '4.1 自己放自己');

  // 環裡放一顆真元件：沒有它的話，「有環就不展開」與「展開到 MAX_DEPTH 才停」
  // 都會得到 0 顆元件，4.5 就分辨不出實作（2026-08-28 mutation 測出來的）。
  const a = { name: 'A', data: { components: [{ id: 'x', type: 'sheetref', sheet: 'B', label: 'X' }, { id: 'ra', type: 'resistor', x: 0, y: 0, label: 'RA' }] } };
  const bb = { name: 'B', data: { components: [{ id: 'y', type: 'sheetref', sheet: 'A', label: 'Y' }] } };
  eq(H.cycles([a, bb]).length, 1, '4.2 A→B→A');

  // 菱形不是環：TOP 放 A 與 B，兩者都放 C。誤判成環會讓正常的圖無法展開。
  const dia = [
    { name: 'TOP', data: { components: [{ id: '1', type: 'sheetref', sheet: 'A', label: 'A1' }, { id: '2', type: 'sheetref', sheet: 'B', label: 'B1' }] } },
    { name: 'A', data: { components: [{ id: '3', type: 'sheetref', sheet: 'C', label: 'C1' }] } },
    { name: 'B', data: { components: [{ id: '4', type: 'sheetref', sheet: 'C', label: 'C2' }] } },
    { name: 'C', data: { components: [{ id: 'r', type: 'resistor', x: 0, y: 0 }] } }
  ];
  eq(H.cycles(dia).length, 0, '4.3 菱形不是環（誤判會讓正常的圖展不開）');
  eq(H.build(dia, 0, E).comps.map(c => c.id).sort(), ['A1/C1/r', 'B1/C2/r'], '4.4 菱形要展開成兩份');

  // 有環時：不可以當掉，而且要回報
  const looped = H.build([a, bb], 0, E);
  eq(looped.comps.length, 0, '4.5 有環就**一顆都不展開**（不是靠深度上限硬停，那會吐出一串半成品）');
  ok(looped.findings.some(f => f.message === 'hier_drc_cycle'), '4.6 而且要報出來');
  eq(looped.findings.find(f => f.message === 'hier_drc_cycle').type, 'error', '4.7 是 error');
}

// ---- 5. 檢查 ----
{
  const k = r => r.map(x => x.message);   // node 沒有 I18N，T() 回 key 本身

  const sub = subPage('SUB');
  const ports = H.portsOf(sub.data);
  const u1 = inst('u1', 'U1', 'NOPE', 100, ports);
  eq(k(H.validate([{ name: 'TOP', data: { components: [u1] } }, sub])).filter(m => m === 'hier_drc_no_sheet').length, 1, '5.1 參照不存在的圖紙');

  const dup = { name: 'TOP', data: { components: [inst('a', 'U1', 'SUB', 100, ports), inst('b', 'U1', 'SUB', 400, ports)] } };
  eq(k(H.validate([dup, sub])).filter(m => m === 'hier_drc_dup_inst').length, 1, '5.2 同一頁兩個實例同名 → 展開後路徑會撞');

  const dupPort = { name: 'SUB2', data: { components: [{ id: 'a', type: 'port', name: 'IN' }, { id: 'b', type: 'port', name: 'IN' }] } };
  const useIt = { name: 'TOP', data: { components: [inst('u', 'U1', 'SUB2', 100, [])] } };
  eq(k(H.validate([useIt, dupPort])).filter(m => m === 'hier_drc_dup_port').length, 1, '5.3 同一頁兩個 port 同名');

  const noPort = { name: 'EMPTY', data: { components: [{ id: 'r', type: 'resistor' }] } };
  const useEmpty = { name: 'TOP', data: { components: [inst('u', 'U1', 'EMPTY', 100, [])] } };
  eq(k(H.validate([useEmpty, noPort])).filter(m => m === 'hier_drc_no_port').length, 1, '5.4 子圖沒有 port → 接不上任何東西');

  const changed = subPage('SUB');
  changed.data.components.push({ id: 'p3', type: 'port', name: 'EN' });
  const staleTop = { name: 'TOP', data: { components: [inst('u', 'U1', 'SUB', 100, ports)] } };
  eq(k(H.validate([staleTop, changed])).filter(m => m === 'hier_drc_stale').length, 1, '5.5 子圖 port 改了、母圖那顆沒同步');

  // 刻意的取捨：標籤仍是全域的，同一張圖放兩次就會相通 → 要報
  const labelled = subPage('SUBL', [{ x1: 300, y1: 100, x2: 360, y2: 100, net: 'MID' }]);
  const twice = { name: 'TOP', data: { components: [inst('a', 'U1', 'SUBL', 100, ports), inst('b', 'U2', 'SUBL', 400, ports)] } };
  const w = H.validate([twice, labelled]).filter(x => x.message === 'hier_drc_shared_label');
  eq(w.length, 1, '5.6 同一張子圖放兩次又用了 net 標籤 → 報（不偷偷改成區域的）');
  eq(w[0].type, 'warning', '5.7 是 warning');

  const once = { name: 'TOP', data: { components: [inst('a', 'U1', 'SUBL', 100, ports)] } };
  eq(H.validate([once, labelled]).filter(x => x.message === 'hier_drc_shared_label').length, 0, '5.8 只放一次就不用報');

  eq(H.validate([]).length, 0, '5.9 空');
  eq(H.validate([{ name: 'A', data: { components: [{ id: 'r', type: 'resistor' }] } }]).length, 0, '5.10 沒有階層就完全不出聲');
}

// ---- 6. 巢狀 ----
{
  const leaf = subPage('LEAF');
  const leafPorts = H.portsOf(leaf.data);
  // MID：把 LEAF 放進去，並把自己的 port 接到 LEAF 的 port
  const li = inst('l1', 'L1', 'LEAF', 100, leafPorts);
  const lin = pinAt(li, 'IN'), lout = pinAt(li, 'OUT');
  const mid = {
    name: 'MID', data: {
      components: [
        { id: 'mi', type: 'port', name: 'A', dir: 'in', x: lin.x - 80, y: lin.y, rotation: 0 },
        li,
        { id: 'mo', type: 'port', name: 'B', dir: 'out', x: lout.x + 80, y: lout.y, rotation: 180 }
      ],
      wires: [
        { x1: lin.x - 80 + 24, y1: lin.y, x2: lin.x, y2: lin.y },
        { x1: lout.x, y1: lout.y, x2: lout.x + 80 - 24, y2: lout.y }
      ]
    }
  };
  const midPorts = H.portsOf(mid.data);
  eq(midPorts.map(p => p.name), ['A', 'B'], '6.1 MID 對外兩隻腳');
  const mi = inst('m1', 'M1', 'MID', 100, midPorts);
  const top = { name: 'TOP', data: { components: [mi], wires: [] } };
  const b = H.build([top, mid, leaf], 0, E);
  eq(b.comps.map(c => c.id), ['M1/L1/r1'], '6.2 兩層路徑');
  eq(b.instances.map(i => i.path), ['M1', 'M1/L1'], '6.3 實例路徑含中間層');
  ok(b.netOf('M1/L1/r1', 0) !== b.netOf('M1/L1/r1', 1), '6.4 巢狀展開後 net 還是分得開');
}

// ---- 6b. 頂層是哪一頁 ----
// 直接用第 0 頁的話，使用者把子圖排在前面（很常見：子圖通常先畫）就會從子圖開始展開，
// 母圖上的東西整批不見，而且不會有任何錯誤訊息。
{
  const sub = subPage('SUB');
  const ports = H.portsOf(sub.data);
  const top = { name: 'TOP', data: { components: [inst('u', 'U1', 'SUB', 100, ports)], wires: [] } };
  eq(H.rootIndex([sub, top]), 1, '6b.1 子圖排在前面時，頂層仍是沒被參照的那一頁');
  eq(H.rootIndex([top, sub]), 0, '6b.2 正常排法');
  eq(H.rootIndex([]), 0, '6b.3 空');
  eq(H.rootIndex([{ name: 'A', data: {} }]), 0, '6b.4 沒有階層');
  // 全部互相參照（環）→ 沒有「沒被參照」的頁，退回 0 而不是 -1
  const a = { name: 'A', data: { components: [{ id: 'x', type: 'sheetref', sheet: 'B' }] } };
  const bb = { name: 'B', data: { components: [{ id: 'y', type: 'sheetref', sheet: 'A' }] } };
  eq(H.rootIndex([a, bb]), 0, '6b.5 全被參照時退回 0，不可以回 -1');
  // 展開時真的要用它
  eq(H.build([sub, top], H.rootIndex([sub, top]), E).comps.map(c => c.id), ['U1/r1'], '6b.6 從正確的頂層展開');
}

// ---- 7. 邊界 ----
{
  eq(H.build([], 0, E).comps.length, 0, '7.1 沒有頁面');
  eq(H.build(null, 0, E).comps.length, 0, '7.2 null');
  eq(H.hasHierarchy([{ name: 'A', data: { components: [{ id: 'r', type: 'resistor' }] } }]), false, '7.3 沒有實例＝沒有階層');
  eq(H.hasHierarchy([{ name: 'A', data: { components: [{ id: 'x', type: 'sheetref', sheet: 'B' }] } }]), true, '7.4 有實例');
  eq(H.pageIndex([{ name: 'A' }, { name: 'B' }], 'B'), 1, '7.5 找頁');
  eq(H.pageIndex([{ name: 'A' }], 'Z'), -1, '7.6 找不到');
  eq(H.syncInstance({ type: 'resistor' }, []), false, '7.7 不是實例就不同步');
  // 沒有實例的單頁：展開＝原樣（路徑是空的，id 不加前綴）
  const flat = { name: 'ONLY', data: { components: [{ id: 'r1', type: 'resistor', x: 0, y: 0, label: 'R1' }], wires: [] } };
  eq(H.build([flat], 0, E).comps.map(c => c.id), ['r1'], '7.8 沒有階層時 id 不加前綴（既有的板子不會被當成全部換新）');
}

// ---- 導覽（進子圖／回上層）----
// 路徑錯了不會有任何測試紅：圖照樣畫得出來，只是使用者不知道自己在第幾層、
// 「上一層」跳到不相干的頁。所以這一段守 stack 的行為。
{
  const root = { page: 0, name: 'ROOT', label: '' };

  let st = H.navPush([root], { page: 1, name: 'PWR', label: 'PWR1' });
  eq(st.length, 2, '導覽：進一層');
  eq(H.navPath(st).join('>'), 'ROOT>PWR1', '導覽：麵包屑用實例名，不是分頁名');

  // 連點兩下不該把路徑變成 PWR1 ▸ PWR1
  const again = H.navPush(st, { page: 1, name: 'PWR', label: 'PWR1' });
  eq(again.length, 2, '導覽：重複進同一層不疊第二次');
  // 但同一頁的另一個實例是不同的路徑，要疊
  eq(H.navPush(st, { page: 1, name: 'PWR', label: 'PWR2' }).length, 3, '導覽：同頁不同實例要疊');

  const up = H.navUp(st);
  eq(up.page, 0, '導覽：上一層回到母圖那一頁');
  eq(up.stack.length, 1, '導覽：stack 少一層');
  // 已經在頂層再按上一層：不可以變成空的（麵包屑會消失、也回不去）
  const top = H.navUp(up.stack);
  eq(top.stack.length, 1, '導覽：頂層再上一層仍留著自己');
  eq(top.page, 0, '導覽：頂層再上一層回自己');
  eq(H.navUp([]).page, null, '導覽：空 stack 回 null 而不是 0（0 是一個有效的頁）');

  // 沒有標籤的層要顯示分頁名，兩個都沒有才顯示 ?——空字串看起來像壞掉
  eq(H.navPath([{ page: 0, name: 'ROOT', label: '' }]).join(''), 'ROOT', '導覽：沒有實例名退回分頁名');
  eq(H.navPath([{ page: 0, name: '', label: '' }]).join(''), '?', '導覽：兩個都沒有顯示 ?');

  eq(H.navPush([root], null).length, 1, '導覽：垃圾輸入不改 stack');
  eq(H.navPush([root], { name: 'X' }).length, 1, '導覽：沒有頁碼不算一層');
  // 不可以就地改：呼叫端拿舊的 stack 還原時會發現它已經被動過
  const before = [root];
  H.navPush(before, { page: 1, name: 'A', label: 'A1' });
  eq(before.length, 1, '導覽：不改原陣列');

  eq(H.pageByName([{ name: 'ROOT' }, { name: 'PWR' }], 'PWR'), 1, '導覽：依名字找頁');
  eq(H.pageByName([{ name: 'ROOT' }], 'NOPE'), -1, '導覽：找不到回 -1（不可以靜靜跳到第 0 頁）');
  eq(H.pageByName([{ name: 'ROOT' }], ''), -1, '導覽：空名字回 -1');
}

// ---- 從 PCB 反查是哪一層（navResolve）----
// 板上的元件 id 帶的是**實例名**（PWR1），不是分頁名（PWR）。要切到對的那一頁
// 只能一層一層走。走不到就要講出來——靜靜跳到第 0 頁比不動更糟（看起來像選錯元件）。
{
  const pages = [
    { name: 'ROOT', data: { components: [
      { id: 's1', type: 'sheetref', sheet: 'PWR', label: 'PWR1' },
      { id: 's2', type: 'sheetref', sheet: 'PWR', label: 'PWR2' },
      { id: 's3', type: 'sheetref', sheet: 'GONE', label: 'X1' }
    ], wires: [] } },
    { name: 'PWR', data: { components: [
      { id: 'r1', type: 'resistor', label: 'R1' },
      { id: 's4', type: 'sheetref', sheet: 'FILT', label: 'F1' }
    ], wires: [] } },
    { name: 'FILT', data: { components: [{ id: 'c1', type: 'capacitor', label: 'C1' }], wires: [] } }
  ];
  const r1 = H.navResolve(pages, 0, ['PWR1']);
  eq(r1.page, 1, 'navResolve：一層走得到對的分頁');
  eq(H.navPath(r1.stack), ['ROOT', 'PWR1'], 'navResolve：麵包屑用實例名');
  const r2 = H.navResolve(pages, 0, ['PWR2', 'F1']);
  eq(r2.page, 2, 'navResolve：兩層也走得到');
  eq(H.navPath(r2.stack), ['ROOT', 'PWR2', 'F1'], 'navResolve：第二層的實例名要留在路徑上');
  eq(H.navResolve(pages, 0, []).page, 0, 'navResolve：空路徑＝留在根層');
  eq(H.navResolve(pages, 0, ['NOPE']).error, 'instance', 'navResolve：實例名對不上要回報，不可硬跳');
  eq(H.navResolve(pages, 0, ['NOPE']).at, 'NOPE', 'navResolve：要講出卡在哪一段');
  eq(H.navResolve(pages, 0, ['X1']).error, 'sheet', 'navResolve：圖紙符號指到不存在的頁');
  eq(H.navResolve(pages, 0, ['PWR1', 'NOPE']).error, 'instance', 'navResolve：第二層對不上也要擋');
  // 兩個實例指同一張子圖：走 PWR2 不可以跑去 PWR1 那一份
  eq(H.navResolve(pages, 0, ['PWR2']).stack[1].label, 'PWR2', 'navResolve：多實例不可互相認錯');
}

// ---- 真的接上畫面 ----
{
  const fsx = require('fs'), pathx = require('path');
  // 硬規矩 11：距離型正則在 CRLF 工作區會對不上，先正規化換行。
  const sh = fsx.readFileSync(pathx.join(__dirname, 'sheets.js'), 'utf8').replace(/\r\n/g, '\n');
  ok(sh.indexOf('enterSheet') > 0, '導覽：sheets.js 有進子圖');
  ok(sh.indexOf('window.Sheets') > 0, '導覽：對外開放 API（原本整支是私有 IIFE）');
  ok(sh.indexOf('hierPath') > 0, '導覽：有麵包屑');
  // 使用者自己點分頁列時要清掉路徑，否則「上一層」會帶去不相干的頁
  ok(/keepNav[\s\S]{0,200}navStack = \[\]/.test(sh), '導覽：手動切頁要清 stack');
  const app = fsx.readFileSync(pathx.join(__dirname, 'app.js'), 'utf8').replace(/\r\n/g, '\n');
  ok(/sheetref[\s\S]{0,120}enterSheet/.test(app), '導覽：雙擊圖紙符號會進去');
  ok(sh.indexOf('gotoPath') > 0, '導覽：sheets.js 要能被 cross-probe 叫去指定的層');
  ok(sh.indexOf('curPath') > 0, '導覽：sheets.js 要說得出目前在哪一層');
  ok(sh.indexOf('sh_no_path') > 0, '導覽：跳不到要出訊息，不可靜靜留在原頁');
  // 線路圖那支叫 showToast。猜錯名字＝訊息一次都不會出現，而這裡正是最需要講話的地方。
  ok(sh.indexOf('showToast') > 0, '導覽：訊息要用線路圖真的有的那支函式');
  ok(sh.indexOf('app.toast(') < 0, '導覽：不可呼叫線路圖沒有的 app.toast（會一路靜默）');
  ok(app.indexOf('Sheets.gotoPath') > 0, '導覽：PCB 選到子圖裡的元件時要跳過去');
}

console.log(`\nsch-hier.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
