/**
 * fpinst.test.js — 元件實例 ／ 封裝庫分離（pcb-fpinst.js / FpInst）驗證（node）
 *
 * 這個功能唯一的價值是「庫改了，板子知道」。所以測的重點不是「有沒有跑完」，
 * 而是四件會真的害到人的事：
 *   1. **手改過的幾何不可以被一鍵更新蓋掉**。使用者不會知道自己微調過的 pad
 *      什麼時候不見的——這是最惡的一種資料遺失。
 *   2. **同步不可以把 net 弄丟**。幾何歸庫、net 歸實例；庫裡少掉的 pad
 *      會讓 net 失去落點，這件事一定要報出來，不可以靜靜發生。
 *   3. **舊板子（沒有 fpRef/fpHash）不可以被動到**。推不出來源就是 unknown。
 *   4. **雜湊要對幾何敏感、對 net 不敏感**。反過來的話，改一條線的網路名
 *      就會讓整板元件變成「不同步」。
 *
 * 庫全部用注入的假庫，不依賴 localStorage 或網路。
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

global.window = {};
require('./parts-lib.js');
const FI = require('./pcb-fpinst.js');
const PartsLib = global.window.PartsLib;

let pass = 0, fail = 0;
function eq(a, b, msg) {
  const okk = JSON.stringify(a) === JSON.stringify(b);
  if (okk) pass++; else { fail++; console.error(`FAIL ${msg}\n  expected ${JSON.stringify(b)}\n  got      ${JSON.stringify(a)}`); }
}
const ok = (v, msg) => eq(!!v, true, msg);

// 假庫：可以隨時「改版」，模擬封裝庫更新
function fakeLib(mutate) {
  return {
    PartsLib: {
      build(lib, variant) {
        const b = PartsLib.build(lib, variant);
        if (!b || !b.ok) return b;
        const pads = b.pads.map(p => Object.assign({}, p));
        const body = Object.assign({}, b.body);
        if (mutate) mutate(pads, body);
        return { ok: true, pads, body };
      },
      list: () => PartsLib.list()
    }
  };
}
const REAL = fakeLib(null);
// 「庫改版」：pad 加大 0.1mm（IPC-7351 修訂之類的真實情況）
const BIGGER = fakeLib(pads => pads.forEach(p => { p.w = Math.round((p.w + 0.1) * 1000) / 1000; }));

function newComp(lib, variant, nets, side) {
  const b = PartsLib.build(lib, variant);
  const c = {
    id: 'sch-x', ref: 'R1', side: side || 'top',
    part: lib + ' ' + variant, footprintSource: 'partslib',
    w: b.body.w, h: b.body.h,
    pads: b.pads.map((p, i) => Object.assign({}, p, { net: (nets || [])[i] || '' }))
  };
  FI.stamp(c, { src: 'partslib', lib, variant }, c.pads);
  return c;
}

// ---- 1. 雜湊：對幾何敏感、對 net 不敏感 ----
{
  const b = PartsLib.build('res', '0603');
  const h0 = FI.hash(b.pads);
  eq(FI.hash(b.pads.slice().reverse()), h0, '1.1 pad 順序不影響雜湊');
  eq(FI.hash(b.pads.map(p => Object.assign({}, p, { net: 'GND' }))), h0, '1.2 net 是實例的，不進雜湊');
  const moved = b.pads.map((p, i) => i === 0 ? Object.assign({}, p, { x: p.x + 0.001 }) : p);
  ok(FI.hash(moved) !== h0, '1.3 1µm 的位移就要換雜湊（不然庫的小修訂偵測不到）');
  const named = b.pads.map((p, i) => i === 0 ? Object.assign({}, p, { name: 'A' }) : p);
  ok(FI.hash(named) !== h0, '1.4 腳名也算幾何的一部分（庫補腳名值得提示）');
  ok(FI.hash([]) !== h0, '1.5 空 pad 不可以跟有 pad 撞雜湊');
  eq(FI.hash(b.pads).split('-')[0], '2', '1.6 雜湊前綴帶 pad 數');
}

// ---- 2. refOf：舊板推導 ----
{
  eq(FI.refOf({ footprintSource: 'partslib', part: 'res 0603', side: 'top' }),
    { src: 'partslib', lib: 'res', variant: '0603', part: '', name: '', spec: null, side: 'top' }, '2.1 partslib');
  // variant 本身有空白：只能切第一個空白，切錯就整顆對不到庫
  eq(FI.refOf({ footprintSource: 'partslib', part: 'dio SMA (DO-214AC)', side: 'top' }).variant,
    'SMA (DO-214AC)', '2.2 含空白的 variant 不可以被切斷');
  eq(FI.refOf({ footprintSource: 'ic', part: 'ATSAMD21G18A', side: 'top' }).src, 'ic', '2.3 IC');
  // 公版刻意不做舊板推導：RefFP 靠 kind/ref/w/h 分流，而放上板之後 w/h 已被封裝本體蓋掉，
  // 拿板上的值回推會配到別的封裝，然後整片公版報一堆假的「庫裡找不到」。
  eq(FI.refOf({ id: 'ref-pico-3', part: 'RP2040', side: 'top' }), null, '2.4 沒蓋章的公版元件 → 不推導');
  eq(FI.refOf({ id: 'kicad-9', part: '' }), null, '2.5 推不出來就是 null，不硬猜');
  eq(FI.refOf({ footprintSource: 'partslib', part: 'res' }), null, '2.6 part 沒有 "lib variant" 形式 → null');
  // 明寫的 fpRef 優先
  eq(FI.refOf({ fpRef: { src: 'user', name: 'MYFP' }, footprintSource: 'partslib', part: 'res 0603' }).src,
    'user', '2.7 明寫的 fpRef 優先於推導');
}

// ---- 3. 狀態機 ----
{
  const c = newComp('res', '0603', ['GND', 'VCC']);
  eq(FI.status(c, REAL).status, 'synced', '3.1 剛建出來＝同步');
  eq(FI.status(c, REAL).unverified, undefined, '3.2 有蓋章就不是 unverified');

  eq(FI.status(c, BIGGER).status, 'stale', '3.3 庫改版 → stale');
  eq(FI.status(c, BIGGER).changes.length, 2, '3.4 兩個 pad 都變了');
  eq(FI.status(c, BIGGER).changes[0].kind, 'changed', '3.5 差異種類');
  eq(FI.status(c, BIGGER).changes[0].fields, ['w'], '3.6 差在哪一欄');

  const edited = newComp('res', '0603', ['GND', 'VCC']);
  edited.pads[0].x -= 0.05;
  eq(FI.status(edited, REAL).status, 'edited', '3.7 手改幾何 → edited（就算庫沒變）');
  eq(FI.status(edited, BIGGER).status, 'edited', '3.8 手改過的，庫也改了，仍然是 edited（不可以自動蓋）');

  const legacy = newComp('res', '0603', ['GND', 'VCC']);
  delete legacy.fpRef; delete legacy.fpHash;
  eq(FI.status(legacy, REAL).status, 'synced', '3.9 舊板沒蓋章，但幾何跟庫一樣 → synced');
  eq(FI.status(legacy, REAL).unverified, true, '3.10 但要標成「分不出來」');
  eq(FI.status(legacy, BIGGER).status, 'stale', '3.11 舊板幾何跟庫不同 → stale + unverified');
  eq(FI.status(legacy, BIGGER).unverified, true, '3.12 一樣標 unverified');

  const det = newComp('res', '0603');
  FI.detach(det);
  eq(FI.status(det, BIGGER).status, 'detached', '3.13 明講不跟庫 → 永遠不動');

  const unk = { id: 'k1', ref: 'X1', pads: [{ num: '1', x: 0, y: 0, w: 1, h: 1 }] };
  eq(FI.status(unk, REAL).status, 'unknown', '3.14 推不出來源 → unknown');

  const gone = newComp('res', '0603');
  gone.fpRef = { src: 'partslib', lib: 'res', variant: 'NOT-A-SIZE' };
  eq(FI.status(gone, REAL).status, 'missing', '3.15 庫裡找不到 → missing');
  eq(FI.status(gone, REAL).reason, 'variantNotFound', '3.16 說出為什麼');

  // 自製封裝庫沒載入 ≠ 庫裡沒有。混在一起會讓每次開頁跳一串假警告。
  const userFp = { fpRef: { src: 'user', name: 'MYFP' }, id: 'fp-U9', ref: 'U9', pads: [{ num: '1', x: 0, y: 0, w: 1, h: 1 }] };
  eq(FI.status(userFp, { userFps: [] }).status, 'unknown', '3.17 自製封裝庫沒載入 → unknown 不是 missing');
  eq(FI.status(userFp, { userFps: [{ name: 'OTHER', pads: [] }] }).status, 'missing', '3.18 庫載入了但沒這顆 → missing');
}

// ---- 4. 同步：幾何歸庫、net 歸實例 ----
{
  const c = newComp('res', '0603', ['GND', 'VCC']);
  const before = c.pads.map(p => p.w);
  const r = FI.sync(c, BIGGER);
  eq(r.changed, true, '4.1 有變');
  eq(c.pads.map(p => p.w), before.map(w => Math.round((w + 0.1) * 1000) / 1000), '4.2 幾何換成庫的');
  eq(c.pads.map(p => p.net), ['GND', 'VCC'], '4.3 net 按 pad 編號接回去，一條都不能掉');
  eq(FI.status(c, BIGGER).status, 'synced', '4.4 同步完就是 synced');
  eq(r.lost.length, 0, '4.5 沒有 net 失去落點');

  // 庫少掉一個 pad → 那條 net 失去落點，必須報
  const LESS = {
    PartsLib: { build: (l, v) => { const b = PartsLib.build(l, v); return { ok: true, pads: [b.pads[0]], body: b.body }; } }
  };
  const c2 = newComp('res', '0603', ['GND', 'VCC']);
  eq(FI.status(c2, LESS).lost, [{ num: '2', net: 'VCC' }], '4.6 事前就要算得出誰會失去落點');
  const r2 = FI.sync(c2, LESS);
  eq(r2.lost, [{ num: '2', net: 'VCC' }], '4.7 同步後照實回報，不可以靜靜丟掉');
  eq(c2.pads.length, 1, '4.8 pad 以庫為準');

  // 庫多一個 pad → 新 pad 沒有 net
  const MORE = {
    PartsLib: {
      build: (l, v) => {
        const b = PartsLib.build(l, v);
        return { ok: true, pads: b.pads.concat([Object.assign({}, b.pads[0], { num: 'EP', x: 0, net: '' })]), body: b.body };
      }
    }
  };
  const c3 = newComp('res', '0603', ['GND', 'VCC']);
  const r3 = FI.sync(c3, MORE);
  eq(r3.added, ['EP'], '4.9 新增的 pad 要報出來');
  eq(c3.pads.find(p => p.num === 'EP').net, '', '4.10 新 pad 沒有 net');
  eq(c3.pads.filter(p => p.net).length, 2, '4.11 舊的兩條 net 還在');

  // body 尺寸也要跟著更新
  const BODY = {
    PartsLib: { build: (l, v) => { const b = PartsLib.build(l, v); return { ok: true, pads: b.pads, body: { w: 9, h: 7 } }; } }
  };
  const c4 = newComp('res', '0603');
  FI.sync(c4, BODY);
  eq([c4.w, c4.h], [9, 7], '4.12 本體尺寸跟著庫走');

  // 認不出來源的不動
  const unk = { id: 'k1', ref: 'X1', pads: [{ num: '1', x: 0, y: 0, w: 1, h: 1 }] };
  const snapshot = JSON.stringify(unk);
  eq(FI.sync(unk, REAL).changed, false, '4.13 unknown 不同步');
  eq(JSON.stringify(unk), snapshot, '4.14 而且一個位元組都不能動');
}

// ---- 5. 底面元件：pad 的層別不可以被翻回頂層 ----
{
  const c = newComp('res', '0603', ['GND', 'VCC'], 'bottom');
  c.pads.forEach(p => { if (p.side === 'F') p.side = 'B'; });
  FI.stamp(c, { src: 'partslib', lib: 'res', variant: '0603' }, c.pads);
  eq(FI.status(c, REAL).status, 'synced', '5.1 底面元件也要判成同步');
  FI.sync(c, BIGGER);
  eq(c.pads.every(p => p.side === 'B'), true, '5.2 同步後仍在底面（翻回頂層＝匯出直接錯層）');
}

// ---- 6. 一鍵更新：只動 stale ----
{
  const state = {
    components: [
      newComp('res', '0603', ['GND', 'VCC']),                    // stale（庫改了）
      Object.assign(newComp('cap', '0603', ['A', 'B']), { id: 'sch-y', ref: 'C1' }),
      (() => { const e = newComp('ind', '0603', ['C', 'D']); e.id = 'sch-z'; e.ref = 'L1'; e.pads[0].y += 0.03; return e; })(),  // edited
      (() => { const d = newComp('bead', '0603'); d.id = 'sch-w'; d.ref = 'FB1'; FI.detach(d); return d; })(),                   // detached
      { id: 'k1', ref: 'X1', pads: [{ num: '1', x: 0, y: 0, w: 1, h: 1 }] }                                                      // unknown
    ]
  };
  const a = FI.audit(state, BIGGER);
  eq([a.total, a.counts.stale, a.counts.edited, a.counts.detached, a.counts.unknown],
    [5, 2, 1, 1, 1], '6.1 分類統計');

  const editedBefore = JSON.stringify(state.components[2].pads);
  const detachedBefore = JSON.stringify(state.components[3].pads);
  const unknownBefore = JSON.stringify(state.components[4].pads);
  const r = FI.syncAll(state, BIGGER);
  eq(r.synced, 2, '6.2 只更新兩顆 stale');
  eq(JSON.stringify(state.components[2].pads), editedBefore, '6.3 手改過的一個位元組都不能動');
  eq(JSON.stringify(state.components[3].pads), detachedBefore, '6.4 detached 不動');
  eq(JSON.stringify(state.components[4].pads), unknownBefore, '6.5 unknown 不動');
  eq(FI.audit(state, BIGGER).counts.stale, 0, '6.6 更新完就沒有 stale 了');

  // 明確要求才會動 edited
  const r2 = FI.syncAll(state, BIGGER, { includeEdited: true });
  eq(r2.synced, 1, '6.7 includeEdited 才動手改過的');
  eq(FI.audit(state, BIGGER).counts.edited, 0, '6.8 動完就不是 edited');

  // 指定 id 只動那幾顆
  const st2 = { components: [newComp('res', '0603'), Object.assign(newComp('cap', '0603'), { id: 'sch-q' })] };
  eq(FI.syncAll(st2, BIGGER, { ids: ['sch-q'] }).synced, 1, '6.9 ids 過濾');
  eq(FI.status(st2.components[0], BIGGER).status, 'stale', '6.10 沒點名的維持原狀');
}

// ---- 7. diff：講得出「更新會動到什麼」 ----
{
  const b = PartsLib.build('res', '0603');
  const after = b.pads.map(p => Object.assign({}, p));
  after[0].x -= 0.2;
  after.push(Object.assign({}, b.pads[0], { num: 'EP' }));
  const d = FI.diff(b.pads, after);
  eq(d.length, 2, '7.1 一個 changed 一個 added');
  eq(d.find(x => x.num === '1').fields, ['x'], '7.2 只報真的變的欄位');
  eq(d.find(x => x.num === 'EP').kind, 'added', '7.3 新增');
  eq(FI.diff(after, b.pads).find(x => x.num === 'EP').kind, 'removed', '7.4 移除');
  eq(FI.diff(b.pads, b.pads), [], '7.5 一樣就沒有差異');
}

// ---- 8. DRC 訊息 ----
{
  const state = { components: [newComp('res', '0603'), Object.assign(newComp('cap', '0603'), { id: 'sch-y' })] };
  eq(FI.auditFindings(state, REAL).length, 0, '8.1 全同步就不出聲');
  const f = FI.auditFindings(state, BIGGER);
  eq(f.length, 1, '8.2 有 stale 就報一條');
  eq([f[0].type, f[0].message], ['warning', 'fi_drc_stale'], '8.3 warning + 對的 key');
}

// ---- 9. Sch2Pcb 真的有蓋章（沒蓋章的話上面全部是空談）----
{
  global.PartsLib = global.window.PartsLib;
  require('./footprint-gen.js');
  global.FootprintGen = global.window.FootprintGen;
  let icData = [];
  try { require('./ic-data.js'); icData = global.window.IC_DATA || []; } catch (e) { }
  global.IC_DATA = icData;
  global.FpInst = FI;
  const S = require('./pcb-sch2pcb.js');
  const getPins = () => [{ name: '1', index: 0 }, { name: '2', index: 1 }];
  const r = S.convert([{ id: 'r1', type: 'resistor', label: 'R1', x: 0, y: 0 }],
    getPins, (id, i) => 'N' + i, {});
  eq(r.components.length, 1, '9.1 轉出一顆');
  eq(r.components[0].fpRef, { src: 'partslib', lib: 'res', variant: '0603', part: '', name: '' }, '9.2 Sch2Pcb 有蓋 fpRef');
  ok(!!r.components[0].fpHash, '9.3 也蓋了 fpHash');
  eq(FI.status(r.components[0], REAL).status, 'synced', '9.4 剛轉出來就是 synced');
  eq(FI.status(r.components[0], REAL).unverified, undefined, '9.5 而且不是 unverified');
  eq(FI.status(r.components[0], BIGGER).status, 'stale', '9.6 庫改了就 stale');
}

// ---- 9b. 公版（reffp）：spec 一定要帶原始規格 ----
// 這一節是「量了才發現」的回歸測試：一開始 fpRef 只存 part，
// 於是整片 arduino-uno-r3 被判成 missing，DRC 每次都吐一條假警告。
{
  require('./pcb-ref-fp.js');
  const RefFP = global.window.RefFP;
  const spec = { ref: 'R1', part: '0805', kind: 'passive', x: 0, y: 0, w: 2, h: 1.25 };
  const fp = RefFP.resolve(spec);
  ok(fp.ok, '9b.1 RefFP 配得出這顆');

  const comp = { id: 'ref-uno-0', ref: 'R1', part: spec.part, side: 'top', w: fp.body.w, h: fp.body.h, pads: fp.pads };
  FI.stamp(comp, { src: 'reffp', part: spec.part, spec }, comp.pads);
  eq(FI.status(comp, { RefFP }).status, 'synced', '9b.2 帶著原始 spec 就對得回去');
  ok(comp.fpRef.spec && comp.fpRef.spec.kind === 'passive', '9b.3 spec 有抄下 kind');
  ok(comp.fpRef.spec.w === 2, '9b.4 spec 抄的是規格表的 w，不是被封裝蓋掉之後的');
  ok(comp.fpRef.spec.x === undefined, '9b.5 只抄 RefFP 要用到的欄位，不整顆搬');

  // 只帶 part（原本的錯法）→ 解不出來，而且要說出原因
  const bad = { id: 'ref-uno-1', ref: 'R1', part: spec.part, side: 'top', pads: fp.pads };
  FI.stamp(bad, { src: 'reffp', part: spec.part }, bad.pads);
  eq(FI.status(bad, { RefFP }).reason, 'noRefSpec', '9b.6 沒有 spec 就明說，不裝作庫裡沒有');

  // spec 是副本：公版資料之後被改到，板上的章不可以跟著變
  spec.kind = 'ic';
  eq(comp.fpRef.spec.kind, 'passive', '9b.7 spec 是副本不是參照');
}

// ---- 10. 邊界 ----
{
  eq(FI.refOf(null), null, '10.1 null 不炸');
  eq(FI.status(null).status, 'unknown', '10.2 null 元件');
  eq(FI.resolve(null).ok, false, '10.3 null ref');
  eq(FI.resolve({ src: 'nope' }).reason, 'unknownSrc', '10.4 認不得的來源');
  eq(FI.audit(null).total, 0, '10.5 null state');
  eq(FI.syncAll(null, REAL).synced, 0, '10.6 null state 同步');
  eq(FI.stamp(null, { src: 'partslib' }), false, '10.7 蓋不了章回 false');
  eq(FI.stamp({}, null), false, '10.8 沒有 ref 不蓋章');
  const c = newComp('res', '0603');
  FI.detach(c);
  FI.attach(c);
  eq(FI.status(c, REAL).status, 'synced', '10.9 attach 之後回到跟庫連動');
}

console.log(`\nfpinst.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
