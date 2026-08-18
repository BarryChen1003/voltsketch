/**
 * net-label.test.js — net 命名的守衛。
 *
 * 模型（2026-08-18 修正）：**net 名字存在導線的 `net` 欄位上**。
 *   - 文字元件只是輸入與顯示的手段，本身不是名字的所在地。
 *   - 電壓符號(vrail) **不參與** net 命名，它只是一個可移動的符號。
 *
 * 上一版把名字綁在一個絕對座標上，而且讓 vrail 也當標籤，兩者都被使用者退回。
 * 這裡逐條把「退回的行為」寫成反向斷言，避免再犯。
 *
 * 跑法：node net-label.test.js
 */
'use strict';

global.window = {};
require('./circuit-engine.js');
const E = global.window.CircuitEngine;

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; return; }
  fail++; console.log('  FAIL: ' + name + (extra ? '  → ' + extra : ''));
}
function eq(name, got, want) { ok(name, got === want, 'got ' + JSON.stringify(got) + ' want ' + JSON.stringify(want)); }

const R1 = { id: 'r1', type: 'resistor', x: 100, y: 100, rotation: 0 };
const R2 = { id: 'r2', type: 'resistor', x: 248, y: 100, rotation: 0 };

// ---- 1) 基準：導線沒有 net 欄位 → net 無名 ----
{
  const w = { x1: 124, y1: 100, x2: 224, y2: 100 };
  const n = E.computeNets([R1, R2], [w]);
  ok('無名時兩腳仍同 net', n.pinNet.get('r1:1') === n.pinNet.get('r2:0'));
  eq('無名時 nameOfPin 為空', n.nameOfPin('r1:1'), '');
}

// ---- 2) 名字設在導線上 → 該 net 有名字 ----
{
  const w = { x1: 124, y1: 100, x2: 224, y2: 100, net: 'HMC_RST_N' };
  const n = E.computeNets([R1, R2], [w]);
  eq('導線帶 net 名，兩端接腳都拿得到', n.nameOfPin('r1:1'), 'HMC_RST_N');
  eq('另一端也一樣', n.nameOfPin('r2:0'), 'HMC_RST_N');
}

// ---- 3) 名字跟著導線走：導線移動後仍然有效（這是改掉座標綁定的原因）----
{
  const w = { x1: 124, y1: 100, x2: 224, y2: 100, net: 'VBUS' };
  const before = E.computeNets([R1, R2], [w]).nameOfPin('r1:1');
  // 模擬導線被拖到別的地方（元件跟著移動）
  const R1b = { id: 'r1', type: 'resistor', x: 100, y: 500, rotation: 0 };
  const R2b = { id: 'r2', type: 'resistor', x: 248, y: 500, rotation: 0 };
  const wMoved = { x1: 124, y1: 500, x2: 224, y2: 500, net: 'VBUS' };
  const after = E.computeNets([R1b, R2b], [wMoved]).nameOfPin('r1:1');
  eq('移動前有名字', before, 'VBUS');
  eq('移動後名字還在（不會因為座標變了就失效）', after, 'VBUS');
}

// ---- 4) 同名導線跨區視為相連 ----
{
  const R3 = { id: 'r3', type: 'resistor', x: 700, y: 400, rotation: 0 };
  const wA = { x1: 124, y1: 100, x2: 200, y2: 100, net: '3V3_STBY' };
  const wB = { x1: 724, y1: 400, x2: 800, y2: 400, net: '3V3_STBY' };
  const without = E.computeNets([R1, R3], [{ x1: 124, y1: 100, x2: 200, y2: 100 }, { x1: 724, y1: 400, x2: 800, y2: 400 }]);
  ok('沒名字時兩段是不同 net', without.pinNet.get('r1:1') !== without.pinNet.get('r3:1'));
  const withL = E.computeNets([R1, R3], [wA, wB]);
  ok('同名導線併成同一條 net', withL.pinNet.get('r1:1') === withL.pinNet.get('r3:1'));
}

// ---- 5) 不同名字不會被誤併 ----
{
  const R3 = { id: 'r3', type: 'resistor', x: 700, y: 400, rotation: 0 };
  const n = E.computeNets([R1, R3], [
    { x1: 124, y1: 100, x2: 200, y2: 100, net: 'VBUS' },
    { x1: 724, y1: 400, x2: 800, y2: 400, net: 'VSYS' },
  ]);
  ok('不同名字不相併', n.pinNet.get('r1:1') !== n.pinNet.get('r3:1'));
  eq('各自的名字 A', n.nameOfPin('r1:1'), 'VBUS');
  eq('各自的名字 B', n.nameOfPin('r3:1'), 'VSYS');
}

// ---- 6) 空白名字不算標籤（否則所有無名 net 會被併成一條）----
{
  const R3 = { id: 'r3', type: 'resistor', x: 700, y: 400, rotation: 0 };
  const n = E.computeNets([R1, R3], [
    { x1: 124, y1: 100, x2: 200, y2: 100, net: '   ' },
    { x1: 724, y1: 400, x2: 800, y2: 400, net: '' },
  ]);
  eq('空白不進標籤清單', n.netLabels.length, 0);
  ok('空白不會把不相干的 net 併起來', n.pinNet.get('r1:1') !== n.pinNet.get('r3:1'));
}

// ---- 7) 使用者退回的行為 A：vrail 不准參與 net 命名 ----
{
  // vrail 腳在 (x, y+14)。放 (124,86) → 腳在 (124,100) = R1.b
  const rail = { id: 'v1', type: 'vrail', x: 124, y: 86, rotation: 0, label: 'P12V', value: 12 };
  const n = E.computeNets([R1, rail], []);
  eq('vrail 的 label 不會變成 net 名', n.nameOfPin('r1:1'), '');
  eq('vrail 不產生任何標籤', n.netLabels.length, 0);
}

// ---- 8) 使用者退回的行為 B：兩顆同名 vrail 不准自動併成一條 net ----
{
  const R3 = { id: 'r3', type: 'resistor', x: 700, y: 400, rotation: 0 };
  const v1 = { id: 'v1', type: 'vrail', x: 76, y: 86, rotation: 0, label: 'P3V3', value: 3.3 };
  const v2 = { id: 'v2', type: 'vrail', x: 676, y: 386, rotation: 0, label: 'P3V3', value: 3.3 };
  const n = E.computeNets([R1, R3, v1, v2], []);
  ok('同名 vrail 不會被自動連在一起（它只是個符號）',
    n.pinNet.get('r1:0') !== n.pinNet.get('r3:0'));
}

// ---- 9) vrail 仍然是正常元件：接到導線就參與連通 ----
{
  const rail = { id: 'v1', type: 'vrail', x: 124, y: 86, rotation: 0, label: 'P12V', value: 12 };
  const w = { x1: 124, y1: 100, x2: 224, y2: 100, net: 'P12V_RAIL' };
  const n = E.computeNets([R1, R2, rail], [w]);
  ok('vrail 的腳與導線相連', n.pinNet.get('v1:0') === n.pinNet.get('r2:0'));
  eq('那條 net 的名字來自導線', n.nameOfPin('v1:0'), 'P12V_RAIL');
}

// ---- 10) 同一條 net 上兩段導線給了不同名字 → 要報衝突 ----
{
  const n = E.computeNets([R1, R2], [
    { x1: 124, y1: 100, x2: 174, y2: 100, net: 'VBUS' },
    { x1: 174, y1: 100, x2: 224, y2: 100, net: 'VSYS' },
  ]);
  ok('同一條 net 兩個名字要進 nameConflicts', n.nameConflicts.length >= 1,
    JSON.stringify(n.nameConflicts));
}

// ---- 11) 一條 net 由多段組成、全部標同名 → 不算衝突 ----
{
  const n = E.computeNets([R1, R2], [
    { x1: 124, y1: 100, x2: 174, y2: 100, net: 'SDA' },
    { x1: 174, y1: 100, x2: 224, y2: 100, net: 'SDA' },
  ]);
  eq('多段同名不算衝突', n.nameConflicts.length, 0);
  eq('名字正確', n.nameOfPin('r1:1'), 'SDA');
}

console.log('\nnet-label.test: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
