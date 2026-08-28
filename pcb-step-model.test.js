/**
 * pcb-step-model.test.js — 匯入自己的 STEP 綁到封裝（pcb-step-model.js）
 *
 * 這個功能最惡的失敗是「打得開但位置不對」——比打不開難發現得多，
 * 而且機構端會照著那個錯的位置去做外殼。所以重點全在座標：
 *   1. **CARTESIAN_POINT 旋轉＋平移；DIRECTION／VECTOR 只旋轉**。
 *      把方向也平移的話法向量會被加上偏移，模型歪掉或翻面。
 *   2. **編號平移之後不可以有斷掉的參照**。搬進來的實體彼此互指，
 *      少平移一個就是一份打不開的檔。
 *   3. 解析不了要**說出來**，不可以安靜地退回方塊——那樣機構端會以為
 *      那顆料真的長成一個方塊。
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

global.window = {};
const M = require('./pcb-step-model.js');

let pass = 0, fail = 0;
function eq(a, b, msg) {
  const okk = JSON.stringify(a) === JSON.stringify(b);
  if (okk) pass++; else { fail++; console.error(`FAIL ${msg}\n  expected ${JSON.stringify(b)}\n  got      ${JSON.stringify(a)}`); }
}
const ok = (v, msg) => eq(!!v, true, msg);
function near(a, b, tol, msg) {
  const d = Math.abs(a - b);
  if (d <= tol) pass++; else { fail++; console.error(`FAIL ${msg}\n  ${a} 與 ${b} 差 ${d} > ${tol}`); }
}

// 一份最小但合法形狀的 STEP（實體之間互相參照，才驗得到編號平移）
const STEP = [
  'ISO-10303-21;',
  'HEADER;',
  "FILE_DESCRIPTION((''),'2;1');",
  "FILE_NAME('part','2026-01-01T00:00:00',(''),(''),'x','','');",
  "FILE_SCHEMA(('AUTOMOTIVE_DESIGN'));",
  'ENDSEC;',
  'DATA;',
  "#1 = CARTESIAN_POINT('',(1.,2.,3.));",
  "#2 = DIRECTION('',(0.,0.,1.));",
  "#3 = DIRECTION('',(1.,0.,0.));",
  "#4 = AXIS2_PLACEMENT_3D('',#1,#2,#3);",
  "#5 = VECTOR('',#3,1.);",
  "#6 = CARTESIAN_POINT('with ; and ( inside',(0.,0.,0.));",
  "#7 = MANIFOLD_SOLID_BREP('SOLID',#4);",
  'ENDSEC;',
  'END-ISO-10303-21;'
].join('\n');

// ---- 1. 解析 ----
{
  const r = M.parse(STEP);
  eq(r.ok, true, '1.1 解析得動');
  eq(r.entities.length, 7, '1.2 七個實體');
  eq(r.maxId, 7, '1.3 最大編號');
  eq(r.entities[0].body, "CARTESIAN_POINT('',(1.,2.,3.))", '1.4 body 不含尾端分號');
  // 字串裡的分號與括號不可以被當成分隔
  ok(r.entities[5].body.indexOf('with ; and ( inside') >= 0, '1.5 **字串裡的 ; 與 ( 不可以切斷實體**');
  eq(M.parse('').reason, 'empty', '1.6 空');
  eq(M.parse('不是 step').reason, 'notStep', '1.7 不是 STEP');
  eq(M.parse('ISO-10303-21;\nHEADER;\nENDSEC;\nEND-ISO-10303-21;').reason, 'noData', '1.8 沒有 DATA 段');
  eq(M.parse('ISO-10303-21;\nDATA;\nENDSEC;\nEND-ISO-10303-21;').reason, 'noEntities', '1.9 DATA 是空的');
  eq(M.parse('ISO-10303-21;\nDATA;\n#1 = FOO(\nENDSEC;').reason, 'unterminated', '1.10 沒收尾的實體');
  ok(M.parse('ISO-10303-21;DATA;' + 'x'.repeat(9 * 1024 * 1024)).reason === 'tooLarge', '1.11 太大要擋');
}

// ---- 2. 型別統計與頂層實體 ----
{
  const r = M.parse(STEP);
  eq(M.typesOf(r.entities).CARTESIAN_POINT, 2, '2.1 型別統計');
  eq(M.solidsOf(r.entities), [7], '2.2 找得到頂層實體');
  eq(M.solidsOf([]), [], '2.3 空');
}

// ---- 3. 座標變換：**方向不可以被平移** ----
{
  const r = M.parse(STEP);
  const moved = M.transplant(r.entities, 100, { x: 10, y: 20, z: 5, rot: 0 });
  const get = id => moved.find(e => e.id === id).body;
  const nums = b => (/\(\s*(-?[\d.eE+-]+)\s*,\s*(-?[\d.eE+-]+)\s*,\s*(-?[\d.eE+-]+)\s*\)/.exec(b) || []).slice(1).map(Number);

  eq(nums(get(101)), [11, 22, 8], '3.1 CARTESIAN_POINT 平移');
  eq(nums(get(102)), [0, 0, 1], '3.2 **DIRECTION 不可以被平移**（平移了法向量就毀了）');
  eq(nums(get(103)), [1, 0, 0], '3.3 另一個方向也一樣');

  // 旋轉 90°：點 (1,2,3) → (-2,1,3)；方向 (1,0,0) → (0,1,0)
  const rot = M.transplant(r.entities, 0, { rot: 90 });
  const g2 = id => rot.find(e => e.id === id).body;
  const p = nums(g2(1)), d = nums(g2(3));
  near(p[0], -2, 1e-6, '3.4 旋轉 90° 的點 x');
  near(p[1], 1, 1e-6, '3.5 旋轉 90° 的點 y');
  near(d[0], 0, 1e-6, '3.6 方向也要旋轉 x');
  near(d[1], 1, 1e-6, '3.7 方向也要旋轉 y');

  // 底面：Z 翻面。點與方向的 z 都要變號，但只有點會再加上平移。
  const mir = M.transplant(r.entities, 0, { mirror: true, z: 1.6 });
  const gm = id => mir.find(e => e.id === id).body;
  near(nums(gm(1))[2], 1.6 - 3, 1e-6, '3.8 底面的點：先翻面再平移');
  near(nums(gm(2))[2], -1, 1e-6, '3.9 底面的方向：只翻面，不加平移');

  // 縮放只作用在點上（DIRECTION 是單位向量，縮放會讓它不再是單位向量）
  const sc = M.transplant(r.entities, 0, { scale: 2 });
  const gs = id => sc.find(e => e.id === id).body;
  eq(nums(gs(1)), [2, 4, 6], '3.10 點會縮放');
  eq(nums(gs(2)), [0, 0, 1], '3.11 **方向不縮放**（縮放後就不是單位向量了）');
}

// ---- 4. 編號平移：不可以留下斷掉的參照 ----
{
  const r = M.parse(STEP);
  const moved = M.transplant(r.entities, 1000, {});
  eq(moved.map(e => e.id), [1001, 1002, 1003, 1004, 1005, 1006, 1007], '4.1 編號整批平移');
  eq(moved.find(e => e.id === 1004).body, "AXIS2_PLACEMENT_3D('',#1001,#1002,#1003)", '4.2 **參照也要跟著平移**');
  eq(M.danglingRefs(moved), [], '4.3 沒有斷掉的參照');

  // 反例守衛：只平移 id 不平移 body 裡的參照 → 一定要驗得出來
  const broken = r.entities.map(e => ({ id: e.id + 1000, body: e.body }));
  ok(M.danglingRefs(broken).length > 0, '4.4 忘了平移參照時要抓得到（證明 4.3 測到的是真的）');
}

// ---- 5. 存放 ----
{
  const mem = {};
  global.localStorage = {
    getItem: k => (k in mem ? mem[k] : null),
    setItem: (k, v) => { mem[k] = String(v); },
    removeItem: k => { delete mem[k]; }
  };
  eq(M.store.all(), {}, '5.1 一開始是空的');
  eq(M.store.set('partslib|res|0603|||', { name: 'r.step', text: STEP }), true, '5.2 存得進去');
  eq(M.store.get('partslib|res|0603|||').name, 'r.step', '5.3 拿得回來');
  eq(M.store.keys(), ['partslib|res|0603|||'], '5.4 列得出來');
  eq(M.store.remove('partslib|res|0603|||'), true, '5.5 刪得掉');
  eq(M.store.get('partslib|res|0603|||'), null, '5.6 刪完就沒了');
  eq(M.store.remove('nope'), false, '5.7 刪不存在的回 false');
  // 配額滿了要回 false，不要靜靜失敗
  global.localStorage.setItem = () => { throw new Error('quota'); };
  eq(M.store.set('k', { text: 'x' }), false, '5.8 **存不進去要回 false**（讓 UI 講得出來）');
  global.localStorage = undefined;
  eq(M.store.all(), {}, '5.9 沒有 localStorage 也不炸');
}

// ---- 6. 接進匯出：綁了模型就放真模型 ----
{
  global.localStorage = undefined;
  global.StepModel = M;
  require('./pcb-drc.js');
  const Step = require('./pcb-step.js') || global.window.PcbStep;
  const S = global.window.PcbStep || Step;

  const comp = {
    id: 'c1', ref: 'R1', x: 10, y: 20, w: 1.6, h: 0.8, rot: 0, side: 'top',
    fpRef: { src: 'partslib', lib: 'res', variant: '0603', part: '', name: '' }
  };
  // FpInst 決定「這顆的封裝身分」，keyOf 靠它
  require('./pcb-fpinst.js');
  global.window.FpInst = global.window.FpInst || require('./pcb-fpinst.js');
  const key = M.keyOf(comp);
  ok(!!key, '6.1 元件有封裝身分（沒有的話綁不上模型）');

  const state = { boardWidth: 50, boardHeight: 40, components: [comp], traces: [], vias: [], edgeSegs: [] };

  const plain = S.build(state, { models: {} });
  const withModel = S.build(state, { models: { [key]: { name: 'r.step', text: STEP } } });
  ok(withModel.text.length !== plain.text.length, '6.2 綁了模型之後輸出不一樣');
  eq(withModel.stats.models, 1, '6.3 統計要說用了幾個真模型');
  eq(plain.stats.models, undefined, '6.4 沒綁就沒有這個數字');
  ok(withModel.text.indexOf('MANIFOLD_SOLID_BREP') >= 0, '6.5 模型的實體有進去');

  // 匯進去的檔仍然要參照完整 —— 這是「打得開」的最低門檻
  const parsed = M.parse(withModel.text);
  eq(parsed.ok, true, '6.6 產出的檔自己解析得動');
  eq(M.danglingRefs(parsed.entities), [], '6.7 **整份檔沒有斷掉的參照**');

  // 解析不了的模型要退回方塊**並且說出來**
  const bad = S.build(state, { models: { [key]: { name: 'x', text: '不是 step' } } });
  ok(bad.warnings.some(w => w.code === 'modelUnusable'), '6.8 **模型用不了要報出來**（安靜退回方塊＝機構端以為那顆料長這樣）');
  eq(bad.stats.models, undefined, '6.9 而且不算進真模型數');
}

console.log(`\npcb-step-model.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
