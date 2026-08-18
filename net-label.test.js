/**
 * net-label.test.js — net 命名的守衛。
 *
 * 先證明「沒有標籤時 net 是匿名的」，再證明每一條命名規則真的生效。
 * 跑法：node net-label.test.js
 */
'use strict';

global.window = {};
require('./circuit-engine.js');
const E = global.window.CircuitEngine;

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; return; }
  fail++;
  console.log('  FAIL: ' + name + (extra ? '  → ' + extra : ''));
}
function eq(name, got, want) { ok(name, got === want, 'got ' + JSON.stringify(got) + ' want ' + JSON.stringify(want)); }

// 兩顆電阻用一條線接起來：R1.b(24,0)+(100,100) → (124,100)，線到 (224,100)=R2.a
const R1 = { id: 'r1', type: 'resistor', x: 100, y: 100, rotation: 0 };
const R2 = { id: 'r2', type: 'resistor', x: 248, y: 100, rotation: 0 };  // a 腳在 224,100
const WIRE = { x1: 124, y1: 100, x2: 224, y2: 100 };

// ---- 1) 基準：沒有標籤 → 有連線但沒有名字 ----
{
  const n = E.computeNets([R1, R2], [WIRE]);
  ok('無標籤時兩腳同 net', n.pinNet.get('r1:1') === n.pinNet.get('r2:0'));
  eq('無標籤時沒有名字', n.nameOfPin('r1:1'), '');
  eq('無標籤時 netName 是空的', n.netName.size, 0);
}

// ---- 2) text 綁到線上 → 那條 net 有名字 ----
{
  const label = { id: 't1', type: 'text', x: 174, y: 70, text: 'P3V3_BMC', netAt: { x: 174, y: 100 } };
  const n = E.computeNets([R1, R2, label], [WIRE]);
  eq('text 綁定後 net 有名字', n.nameOfPin('r1:1'), 'P3V3_BMC');
  eq('同一條 net 兩端都拿到名字', n.nameOfPin('r2:0'), 'P3V3_BMC');
}

// ---- 3) 沒綁定（netAt 缺）的純文字不影響 net ----
{
  const floating = { id: 't2', type: 'text', x: 174, y: 70, text: '這只是註解' };
  const n = E.computeNets([R1, R2, floating], [WIRE]);
  eq('未綁定的文字不命名任何 net', n.nameOfPin('r1:1'), '');
  eq('未綁定的文字不進標籤清單', n.netLabels.length, 0);
}

// ---- 4) 同名標籤跨區 union：兩段不相連的線，同名 → 同一條 net ----
{
  // 左邊一段：R1.b —— 線 —— 開路端
  const wA = { x1: 124, y1: 100, x2: 200, y2: 100 };
  // 右邊另一段，完全不接觸：R3 在很遠的地方
  const R3 = { id: 'r3', type: 'resistor', x: 700, y: 400, rotation: 0 };
  const wB = { x1: 724, y1: 400, x2: 800, y2: 400 };
  const labA = { id: 'ta', type: 'text', x: 160, y: 70, text: '3V3_STBY', netAt: { x: 160, y: 100 } };
  const labB = { id: 'tb', type: 'text', x: 760, y: 370, text: '3V3_STBY', netAt: { x: 760, y: 400 } };

  const without = E.computeNets([R1, R3], [wA, wB]);
  ok('沒有標籤時兩段是不同 net', without.pinNet.get('r1:1') !== without.pinNet.get('r3:1'));

  const withL = E.computeNets([R1, R3, labA, labB], [wA, wB]);
  ok('同名標籤把兩段併成同一條 net',
    withL.pinNet.get('r1:1') === withL.pinNet.get('r3:1'),
    'r1net=' + withL.pinNet.get('r1:1') + ' r3net=' + withL.pinNet.get('r3:1'));
  eq('併起來之後名字一致', withL.nameOfPin('r3:1'), '3V3_STBY');
}

// ---- 5) 不同名字不會被誤併 ----
{
  const wA = { x1: 124, y1: 100, x2: 200, y2: 100 };
  const R3 = { id: 'r3', type: 'resistor', x: 700, y: 400, rotation: 0 };
  const wB = { x1: 724, y1: 400, x2: 800, y2: 400 };
  const labA = { id: 'ta', type: 'text', x: 160, y: 70, text: 'VBUS', netAt: { x: 160, y: 100 } };
  const labB = { id: 'tb', type: 'text', x: 760, y: 370, text: 'VSYS', netAt: { x: 760, y: 400 } };
  const n = E.computeNets([R1, R3, labA, labB], [wA, wB]);
  ok('不同名字不相併', n.pinNet.get('r1:1') !== n.pinNet.get('r3:1'));
  eq('各自拿到自己的名字 A', n.nameOfPin('r1:1'), 'VBUS');
  eq('各自拿到自己的名字 B', n.nameOfPin('r3:1'), 'VSYS');
}

// ---- 6) vrail 電壓符號本身就是 net 標籤 ----
{
  // vrail 腳在 (x, y+14)。放 (124, 86) → 腳在 (124,100) = R1.b
  const rail = { id: 'v1', type: 'vrail', x: 124, y: 86, rotation: 0, label: 'P12V', value: 12 };
  const n = E.computeNets([R1, rail], []);
  eq('vrail 命名它接到的 net', n.nameOfPin('r1:1'), 'P12V');
}

// ---- 7) vrail 沒填名字 → 退回用電壓值當名字 ----
{
  const rail = { id: 'v2', type: 'vrail', x: 124, y: 86, rotation: 0, label: '', value: 3.3 };
  const n = E.computeNets([R1, rail], []);
  eq('vrail 無標籤時用電壓當名字', n.nameOfPin('r1:1'), '3.3V');
}

// ---- 8) vrail 兩顆同名 → 同一條 net（電源符號的重點行為）----
{
  const R3 = { id: 'r3', type: 'resistor', x: 700, y: 400, rotation: 0 };
  const v1 = { id: 'v1', type: 'vrail', x: 76, y: 86, rotation: 0, label: 'P3V3', value: 3.3 };   // 腳 (76,100)=R1.a
  const v2 = { id: 'v2', type: 'vrail', x: 676, y: 386, rotation: 0, label: 'P3V3', value: 3.3 }; // 腳 (676,400)=R3.a
  const n = E.computeNets([R1, R3, v1, v2], []);
  ok('同名電壓符號跨區相連', n.pinNet.get('r1:0') === n.pinNet.get('r3:0'));
  eq('名字正確', n.nameOfPin('r3:0'), 'P3V3');
}

// ---- 9) 同一條 net 被貼兩個不同名字 → 要報衝突，不能安靜吃掉 ----
{
  const labA = { id: 'ta', type: 'text', x: 150, y: 70, text: 'VBUS', netAt: { x: 150, y: 100 } };
  const labB = { id: 'tb', type: 'text', x: 200, y: 70, text: 'VSYS', netAt: { x: 200, y: 100 } };
  const n = E.computeNets([R1, R2, labA, labB], [WIRE]);
  ok('同一條 net 兩個名字要進 nameConflicts', n.nameConflicts.length >= 1,
    'conflicts=' + JSON.stringify(n.nameConflicts));
}

// ---- 10) 空白名字不算標籤（避免空字串把所有無名 net 併成一條）----
{
  const blank1 = { id: 'b1', type: 'text', x: 150, y: 70, text: '   ', netAt: { x: 150, y: 100 } };
  const R3 = { id: 'r3', type: 'resistor', x: 700, y: 400, rotation: 0 };
  const blank2 = { id: 'b2', type: 'text', x: 760, y: 370, text: '', netAt: { x: 760, y: 400 } };
  const n = E.computeNets([R1, R3, blank1, blank2], [WIRE, { x1: 724, y1: 400, x2: 800, y2: 400 }]);
  eq('空白標籤不進清單', n.netLabels.length, 0);
  ok('空白標籤不會把不相干的 net 併起來', n.pinNet.get('r1:1') !== n.pinNet.get('r3:1'));
}

console.log('\nnet-label.test: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
