/**
 * pcb3d.test.js — 3D 檢視的純幾何部分（node，無瀏覽器、不需要 Three.js）
 *
 * 3D 那支大部分是 Three.js 呼叫，測不了也不值得測；但有兩塊是自己算的，
 * 錯了畫面會很像對的：板框串接（串不起來要退回矩形，不能畫出破的板）
 * 與元件高度（安裝孔不該長出一塊方塊）。這裡只測這兩塊。
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

global.window = {};
require('./pcb-3d.js');
const P3D = window.Pcb3D;

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL: ' + m); } };
const eq = (a, b, m) => ok(a === b, `${m} (得 ${JSON.stringify(a)}，期望 ${JSON.stringify(b)})`);

// ---------- 板框串接 ----------
{
  const seg = (x1, y1, x2, y2) => ({ x1, y1, x2, y2 });
  // 正方形，四段順向
  const square = P3D._outlineFromSegs([
    seg(-10, -10, 10, -10), seg(10, -10, 10, 10), seg(10, 10, -10, 10), seg(-10, 10, -10, -10)
  ]);
  ok(!!square, '板框：四段封閉要串得起來');
  eq(square && square.length, 4, '板框：正方形回 4 個點');

  // 順序打亂、方向相反也要串得起來（KiCad 匯出的線段順序不保證）
  const shuffled = P3D._outlineFromSegs([
    seg(10, 10, -10, 10), seg(-10, -10, 10, -10), seg(-10, 10, -10, -10), seg(10, -10, 10, 10)
  ]);
  ok(!!shuffled, '板框：順序打亂仍要串得起來');
  eq(shuffled && shuffled.length, 4, '板框：打亂後一樣是 4 個點');

  // 有缺口 → 回 null（呼叫端會退回矩形，不可畫出破的板）
  const gap = P3D._outlineFromSegs([
    seg(-10, -10, 10, -10), seg(10, -10, 10, 10), seg(10, 10, -10, 10)
  ]);
  eq(gap, null, '板框：缺一段要回 null');

  // 線段太少
  eq(P3D._outlineFromSegs([seg(0, 0, 1, 0)]), null, '板框：線段太少回 null');
  eq(P3D._outlineFromSegs([]), null, '板框：空陣列回 null');
  eq(P3D._outlineFromSegs(null), null, '板框：null 也不可爆');

  // 座標有 NaN 的線段要被濾掉（濾完不足 3 段就回 null）
  eq(P3D._outlineFromSegs([seg(NaN, 0, 1, 0), seg(0, 0, 1, 0), seg(1, 0, 1, 1)]), null,
     '板框：含 NaN 的資料不可硬串');

  // 容差內的接點算同一點（0.02mm）
  const withTol = P3D._outlineFromSegs([
    seg(-10, -10, 10, -10), seg(10.005, -10, 10, 10), seg(10, 10, -10, 10), seg(-10, 10, -10, -10)
  ]);
  ok(!!withTol, '板框：0.005mm 的縫要當成接上');
}

// ---------- 元件高度 ----------
{
  const h = P3D._heightOf;
  eq(h({ kind: 'mech', w: 3, h: 3 }), 0, '高度：安裝孔不長方塊');
  ok(h({ kind: 'passive', w: 1.6, h: 0.8 }) < h({ kind: 'ic', w: 7, h: 7 }),
     '高度：被動件要比 IC 矮');
  ok(h({ kind: 'ic', w: 7, h: 7 }) < h({ kind: 'conn', w: 9, h: 7 }),
     '高度：IC 要比連接器矮');
  ok(h({ kind: 'passive', w: 1, h: 0.5 }) >= 0.35, '高度：再小的被動件也要看得見');
  ok(h({ kind: 'conn', w: 40, h: 40 }) <= 11, '高度：連接器有上限，不可長成柱子');
  ok(h({ w: 2, h: 2 }) > 0, '高度：沒有 kind 也要給得出高度');
  ok(h({}) > 0, '高度：什麼都沒有也不可回 NaN');
  ok(Number.isFinite(h({ kind: 'ic' })), '高度：缺尺寸時要回有限值');
}

// ---- 絲印攤平（阻焊貼圖的資料來源）----
// 3D 好不好看是品味，但「絲印有沒有被撿到、座標轉對了沒」算得出來。
// 這段守的是：元件旋轉後絲印要跟著轉——轉錯的話 2D 看起來對、3D 的字全歪。
{
  const S = P3D._silkItems, R = P3D._compRel;

  const st = {
    components: [{
      x: 10, y: 5, rot: 0,
      silk: [{ kind: 'line', x1: -1, y1: 0, x2: 1, y2: 0, side: 'F', w: 0.12 }],
      silkTexts: [{ text: 'U1', x: 0, y: -2, size: 1, side: 'F' }]
    }],
    silkGr: [{ kind: 'circle', cx: 0, cy: 0, r: 2, side: 'B', w: 0.15 }]
  };
  const items = S(st);
  eq(items.length, 3, '絲印：元件圖形＋元件文字＋板上圖形都要撿到');
  eq(items.filter(i => i.side === 'B').length, 1, '絲印：底層項目分得出來');

  const txt = items.find(i => i.kind === 'text');
  eq(txt.x, 10, '絲印：文字 x 轉成絕對座標');
  eq(txt.y, 3, '絲印：文字 y 轉成絕對座標');

  // 旋轉 90°：相對 (0,-2) 應轉到元件的另一側，不可以還在原地
  const rot = R({ x: 10, y: 5, rot: 90 }, 0, -2);
  ok(Math.abs(rot.x - 8) < 1e-9, '絲印：旋轉 90° 後 x 要跟著轉');
  ok(Math.abs(rot.y - 5) < 1e-9, '絲印：旋轉 90° 後 y 要跟著轉');
  eq(S({}).length, 0, '絲印：空 state 回空陣列，不可以爆');
  eq(S({ components: [{ x: 0, y: 0 }] }).length, 0, '絲印：元件沒有絲印欄位也不可以爆');
}

console.log(`\npcb3d.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
