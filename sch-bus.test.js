/**
 * sch-bus.test.js — 線路圖匯流排（sch-bus.js ＋ circuit-engine 的 normalizeBuses）
 *
 * 這個功能只有一個真正致命的失敗方式：**幹線把整束訊號短在一起**。
 * 幹線在幾何上就是一條線，分支端點又落在它身上，照 T 型接點的規則
 * D0..D7 會被 union 成同一條 net——畫面上完全正常，DRC 不會叫，
 * 一路錯到 PCB 才會發現板子上有一坨短路。第 1 節整節在守這件事。
 *
 * 其餘重點：
 *   - 解析要「認得懂的接受、看不懂的明說」，不可以半懂半猜（D[0.. 不能被當成 D）。
 *   - 分支接在幹線**端點**上是正常畫法，不可以判成沒接上。
 *   - 稽核要抓得到「名字不在這束裡」與「同名匯流排範圍不一致」。
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

global.window = { I18N: null };
require('./circuit-engine.js');
const B = require('./sch-bus.js');
const E = global.window.CircuitEngine;

let pass = 0, fail = 0;
function eq(a, b, msg) {
  const okk = JSON.stringify(a) === JSON.stringify(b);
  if (okk) pass++; else { fail++; console.error(`FAIL ${msg}\n  expected ${JSON.stringify(b)}\n  got      ${JSON.stringify(a)}`); }
}
const ok = (v, msg) => eq(!!v, true, msg);

// 電阻預設腳位 [[-24,0],[24,0]]；轉 90° 之後變成上下，接點在 y±24
const res = (id, x, y) => ({ id, type: 'resistor', x, y, rotation: 90 });
const busW = (x1, y1, x2, y2, spec) => ({ x1, y1, x2, y2, bus: spec });
const tapW = (x1, y1, x2, y2, member) => ({ x1, y1, x2, y2, busTap: member });

// ---- 1. 幹線絕對不可以把訊號短在一起（這個功能的命脈）----
{
  const bus = busW(0, 0, 400, 0, 'D[0..7]');
  const comps = [res('r0', 50, 60), res('r1', 150, 60), res('r2', 250, 60)];
  const tps = [tapW(50, 0, 50, 36, 'D0'), tapW(150, 0, 150, 36, 'D1'), tapW(250, 0, 250, 36, 'D2')];
  const n = E.computeNets(comps, [bus].concat(tps));

  eq(n.nameOfPin('r0:0'), 'D0', '1.1 分支展開成成員名字');
  eq(n.nameOfPin('r1:0'), 'D1', '1.2');
  eq(n.nameOfPin('r2:0'), 'D2', '1.3');
  ok(n.pinNet.get('r0:0') !== n.pinNet.get('r1:0'), '1.4 **D0 與 D1 不可以是同一條 net**（幹線不是導體）');
  ok(n.pinNet.get('r1:0') !== n.pinNet.get('r2:0'), '1.5 D1 與 D2 也不可以');
  eq(new Set([n.pinNet.get('r0:0'), n.pinNet.get('r1:0'), n.pinNet.get('r2:0')]).size, 3, '1.6 三個分支＝三條不同的 net');

  // 反例守衛：把 bus 欄位拿掉（＝退回普通導線），同樣的幾何**必須**短在一起。
  // 沒有這條的話，上面那幾條可能只是因為幾何本來就沒碰到，測不到任何東西。
  const plain = [{ x1: 0, y1: 0, x2: 400, y2: 0 }].concat(tps.map(t => ({ x1: t.x1, y1: t.y1, x2: t.x2, y2: t.y2 })));
  const n2 = E.computeNets(comps, plain);
  eq(n2.pinNet.get('r0:0'), n2.pinNet.get('r1:0'), '1.7 同樣幾何但不是匯流排時，本來就會短在一起（證明 1.4 測到的是 bus 欄位）');
}

// ---- 2. 跨頁／隔很遠的同名成員要自動相連 ----
// 這是匯流排最有用的性質：兩處寫 D3 就是同一條，不必把線拉過去。
{
  const comps = [res('a', 50, 60), res('b', 900, 60)];
  const wires = [
    busW(0, 0, 200, 0, 'D[0..7]'), tapW(50, 0, 50, 36, 'D3'),
    busW(800, 0, 1000, 0, 'D[0..7]'), tapW(900, 0, 900, 36, 'D3')
  ];
  const n = E.computeNets(comps, wires);
  eq(n.pinNet.get('a:0'), n.pinNet.get('b:0'), '2.1 相隔很遠的兩個 D3 是同一條 net');
  eq(n.nameOfPin('b:0'), 'D3', '2.2 名字對');
}

// ---- 3. 解析：認得懂的接受，看不懂的明說 ----
{
  eq(B.parse('D[0..7]').members, ['D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'], '3.1 範圍');
  eq(B.parse('D[7..0]').members, ['D7', 'D6', 'D5', 'D4', 'D3', 'D2', 'D1', 'D0'], '3.2 反向要真的反過來（MSB first）');
  eq(B.parse('ADDR[0:15]').width, 16, '3.3 冒號寫法');
  eq(B.parse('X[3..3]').members, ['X3'], '3.4 單一位元');
  eq(B.parse('{CLK,RST,EN}').members, ['CLK', 'RST', 'EN'], '3.5 明列');
  eq(B.parse(' D[0..1] ').members, ['D0', 'D1'], '3.6 前後空白');
  eq(B.parse('D[ 0 .. 1 ]').members, ['D0', 'D1'], '3.7 括號內空白');
  eq(B.parse('D_A$1[0..1]').members, ['D_A$10', 'D_A$11'], '3.8 底線與 $ 是合法名字字元');

  // 看不懂的一律 ok:false，不可以半懂半猜
  for (const bad of ['', 'D', 'D[]', 'D[0..', 'D[a..b]', '[0..7]', 'D[0..7', '{}', '{CLK', 'D[-1..3]', '1D[0..3]'])
    eq(B.parse(bad).ok, false, `3.9 「${bad}」必須拒絕`);
  eq(B.parse('D[0..999]').reason, 'too_wide', '3.10 太寬要擋（不擋會當場鎖死瀏覽器）');
  eq(B.parse('{A,A}').reason, 'dup_member', '3.11 明列裡自己重複＝打錯了，不靜靜去重');
  eq(B.parse('{A,1B}').reason, 'bad_member', '3.12 明列裡的名字也要合法');
  eq(B.members('nope'), [], '3.13 解析不了就沒有成員');
  eq(B.format('D', 0, 7), 'D[0..7]', '3.14 反過來寫回字串');
}

// ---- 4. 幾何：接在幹線端點上也算接上 ----
{
  const bus = busW(100, 0, 300, 0, 'D[0..7]');
  const wires = [
    bus,
    tapW(100, 0, 100, 40, 'D0'),   // 幹線起點
    tapW(300, 0, 300, 40, 'D1'),   // 幹線終點
    tapW(200, 0, 200, 40, 'D2'),   // 幹線中間
    tapW(700, 0, 700, 40, 'D3')    // 沒碰到
  ];
  const links = B.attach(wires);
  const by = {}; links.forEach(l => { by[l.member] = l.busIndex; });
  eq(by.D0, 0, '4.1 接在幹線**起點**要算接上（正常畫法，不可以判成沒接）');
  eq(by.D1, 0, '4.2 接在幹線終點也算');
  eq(by.D2, 0, '4.3 接在中間');
  eq(by.D3, null, '4.4 沒碰到就是沒接上');
  eq(links.length, 4, '4.5 四條分支都要列到');

  // 分支的另一端貼上去（不是只認第一端）
  eq(B.attach([bus, tapW(200, 40, 200, 0, 'D4')])[0].busIndex, 0, '4.6 任一端點碰到都算');
}

// ---- 5. 稽核 ----
{
  const good = [busW(0, 0, 200, 0, 'D[0..3]'), tapW(50, 0, 50, 40, 'D0'), tapW(100, 0, 100, 40, 'D1'),
    tapW(150, 0, 150, 40, 'D2'), tapW(200, 0, 200, 40, 'D3')];
  eq(B.audit([], good).length, 0, '5.1 四個成員全接滿 → 沒有發現');

  // node 沒有 I18N，T() 回 key 本身——斷言比對「哪一種發現」比比對譯文精確
  const k = r => r.map(x => x.message);

  const notMember = [busW(0, 0, 200, 0, 'D[0..3]'), tapW(50, 0, 50, 40, 'D9')];
  eq(k(B.audit([], notMember)).filter(m => m === 'bus_drc_not_member').length, 1, '5.2 名字不在這束裡 → 報');
  eq(B.audit([], notMember).find(x => x.message === 'bus_drc_not_member').type, 'error', '5.3 是 error');

  const detached = [busW(0, 0, 200, 0, 'D[0..3]'), tapW(700, 0, 700, 40, 'D0')];
  eq(k(B.audit([], detached)).filter(m => m === 'bus_drc_detached').length, 1, '5.4 分支沒接到任何幹線 → 報');

  const badSpec = [busW(0, 0, 200, 0, 'D[0..')];
  eq(k(B.audit([], badSpec)).filter(m => m === 'bus_drc_spec').length, 1, '5.5 幹線寫法錯 → 報');

  // 幹線寫法已經錯了就不要再罵分支「名字不在裡面」——同一個錯報兩次只會蓋掉真訊息
  const badSpecTap = [busW(0, 0, 200, 0, 'D[0..'), tapW(50, 0, 50, 40, 'D0')];
  eq(k(B.audit([], badSpecTap)).filter(m => m === 'bus_drc_not_member').length, 0, '5.6 幹線壞掉時不重複罵分支');

  const conflict = [busW(0, 0, 200, 0, 'D[0..7]'), busW(0, 100, 200, 100, 'D[0..15]')];
  eq(k(B.audit([], conflict)).filter(m => m === 'bus_drc_conflict').length, 1, '5.7 同名匯流排範圍不一致 → 報');

  const sameSpecTwice = [busW(0, 0, 200, 0, 'D[0..7]'), busW(200, 0, 200, 100, 'D[0..7]'), tapW(50, 0, 50, 40, 'D0')];
  eq(k(B.audit([], sameSpecTwice)).filter(m => m === 'bus_drc_conflict').length, 0, '5.8 轉角切成兩段的同一條匯流排不可以報衝突');

  const noTap = [busW(0, 0, 200, 0, 'D[0..3]')];
  eq(k(B.audit([], noTap)).filter(m => m === 'bus_drc_no_tap').length, 1, '5.9 畫了匯流排但一條分支都沒有 → warning');

  const partial = [busW(0, 0, 200, 0, 'D[0..3]'), tapW(50, 0, 50, 40, 'D0')];
  const idle = B.audit([], partial).filter(x => x.message === 'bus_drc_idle');
  eq(idle.length, 1, '5.10 有成員沒接出來 → info');
  eq(idle[0].type, 'info', '5.11 只是提示，設計到一半很正常');

  // 轉角切三段的同一條匯流排，未使用成員只能報一次
  const corner = [busW(0, 0, 200, 0, 'D[0..3]'), busW(200, 0, 200, 100, 'D[0..3]'), busW(200, 100, 400, 100, 'D[0..3]'),
    tapW(50, 0, 50, 40, 'D0')];
  eq(B.audit([], corner).filter(x => x.message === 'bus_drc_idle').length, 1, '5.12 同一條匯流排切成三段，未使用成員只報一次');

  const dbl = [busW(0, 0, 200, 0, 'D[0..3]'), Object.assign(tapW(50, 0, 50, 40, 'D0'), { net: 'CLK' })];
  eq(k(B.audit([], dbl)).filter(m => m === 'bus_drc_double').length, 1, '5.13 同時寫了 net 與 busTap → warning');

  eq(B.audit([], []).length, 0, '5.14 沒有匯流排就完全不出聲');
  eq(B.audit([], [{ x1: 0, y1: 0, x2: 10, y2: 0 }]).length, 0, '5.15 普通導線不受影響');
}

// ---- 6. 明講的 net 蓋過展開 ----
{
  const comps = [res('a', 50, 60)];
  const wires = [busW(0, 0, 200, 0, 'D[0..7]'), Object.assign(tapW(50, 0, 50, 36, 'D0'), { net: 'CLK' })];
  eq(E.computeNets(comps, wires).nameOfPin('a:0'), 'CLK', '6.1 使用者明講的 net 不可以被展開蓋掉');
}

// ---- 7. nextFree：畫下一條分支時的預設名字 ----
{
  const wires = [busW(0, 0, 400, 0, 'D[0..3]'), tapW(50, 0, 50, 40, 'D0'), tapW(150, 0, 150, 40, 'D1')];
  eq(B.nextFree(wires, 'D[0..3]'), 'D2', '7.1 給下一個還沒用掉的');
  const full = wires.concat([tapW(250, 0, 250, 40, 'D2'), tapW(350, 0, 350, 40, 'D3')]);
  eq(B.nextFree(full, 'D[0..3]'), '', '7.2 全滿就回空字串，不亂編一個');
  eq(B.nextFree(wires, 'bogus'), '', '7.3 解析不了回空');
}

// ---- 8. 舊資料與邊界 ----
{
  eq(E.normalizeBuses(null), [], '8.1 null 不炸');
  const plain = [{ x1: 0, y1: 0, x2: 10, y2: 0 }];
  ok(E.normalizeBuses(plain) === plain, '8.2 沒有匯流排時原樣回傳，不多配一個陣列');
  const withBus = [{ x1: 0, y1: 0, x2: 10, y2: 0, bus: 'D[0..1]' }, { x1: 0, y1: 0, x2: 5, y2: 5, busTap: 'D0' }];
  const norm = E.normalizeBuses(withBus);
  eq(norm.length, 1, '8.3 幹線被拿掉');
  eq(norm[0].net, 'D0', '8.4 分支拿到成員名');
  eq(withBus[1].net, undefined, '8.5 **不可以改到原陣列**（呼叫端還在用同一份 state）');
  eq(B.buses([]).length, 0, '8.6 空');
  eq(B.taps(undefined).length, 0, '8.7 undefined');
  eq(B.isBus({ bus: '' }), false, '8.8 空字串不算匯流排');
  eq(B.attach([{ x1: 0, y1: 0, x2: 5, y2: 5, busTap: 'D0' }]).length, 1, '8.9 只有分支沒有幹線也要列出來（好報「沒接上」）');
}

// ---- 帶到 PCB 端：分組與長度報告 ----
// 轉成 PCB 之後匯流排就散成一條條 net。這兩支是板子唯一還知道成組關係的地方，
// 錯了不會有任何測試紅——畫面上仍然有 net、仍然畫得出走線。
{
  const w = (bus, y) => ({ bus: bus, x1: 0, y1: y, x2: 10, y2: y });
  // 同一束會被畫成好幾段導線，去重之後只能有一組
  const g = B.groups([w('D[0..3]', 0), w('D[0..3]', 1), w('A[0..1]', 2)]);
  eq(g.length, 2, 'bus 分組：同 spec 的多段導線算一束');
  eq(g[0].members.join(','), 'D0,D1,D2,D3', 'bus 分組：成員照 spec 展開');
  eq(g[0].width, 4, 'bus 分組：寬度');
  eq(B.groups([]).length, 0, 'bus 分組：沒有導線回空');
  eq(B.groups([{ bus: 'D[0]' }]).length, 0, 'bus 分組：只有一條的不算一束');
  eq(B.groups([{ bus: '???' }]).length, 0, 'bus 分組：解析不出來的不硬湊一組');

  // skew 只算已繞的成員：把沒繞的當 0 會得到一個假的大 skew，
  // 看起來像等長差很多，其實只是還沒繞——這條是這一段的重點。
  const rep = B.report(g[0], n => ({ D0: 10, D1: 14, D2: 12, D3: 0 })[n]);
  eq(rep.routed, 3, 'bus 報告：三條已繞');
  eq(rep.unrouted, 1, 'bus 報告：一條沒繞');
  eq(rep.skew, 4, 'bus 報告：skew = 14 - 10，沒繞的那條不參與');
  eq(rep.max, 14, 'bus 報告：最長');
  eq(rep.min, 10, 'bus 報告：最短（不是 0）');
  eq(rep.rows.length, 4, 'bus 報告：每個成員都列出來，包含沒繞的');

  const none = B.report(g[0], () => 0);
  eq(none.skew, 0, 'bus 報告：一條都沒繞時 skew 是 0，不可以是 NaN');
  eq(none.routed, 0, 'bus 報告：沒有已繞成員');
}

// ---- 真的接上 PCB 端 ----
{
  const fsx = require('fs'), pathx = require('path');
  const app = fsx.readFileSync(pathx.join(__dirname, 'pcb.js'), 'utf8');
  ok(app.indexOf('busGroups') > 0, 'bus: pcb.js 記下匯流排');
  ok(app.indexOf('tuneBus') > 0, 'bus: 有整束等長');
  ok(app.indexOf('meanderNet(') > 0, 'bus: 整束等長走既有的蛇形調諧，不是另寫一套');
  const s2p = fsx.readFileSync(pathx.join(__dirname, 'pcb-sch2pcb.js'), 'utf8');
  ok(s2p.indexOf('busGroupsFrom') > 0, 'bus: 同步時從頁面收集');
  const html = fsx.readFileSync(pathx.join(__dirname, 'pcb.html'), 'utf8');
  ok(html.indexOf('busRows') > 0, 'bus: PCB 頁有面板');
  // PCB 頁一開始沒有載入 sch-bus.js，面板會安靜地永遠顯示「沒有匯流排」
  ok(html.indexOf('sch-bus.js') > 0, 'bus: PCB 頁要載入 sch-bus.js');
}

console.log(`\nsch-bus.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
