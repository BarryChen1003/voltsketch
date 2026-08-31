/**
 * pcb-3d-shapes.test.js — 依封裝推元件外型（pcb-3d-shapes.js）
 *
 * 3D 好不好看是品味，測不了；但「這顆被判成什麼封裝、引腳有沒有長在 pad 上、
 * 高度合不合理」全部算得出來，而且錯了畫面會很像對的——
 * QFP 被判成方塊，遠看還是一塊黑的，只有放大才發現沒有腳。
 *
 * 第 3 節特別守「引腳要壓在 pad 上」：腳的座標若沒跟著 pad 走，
 * 畫面上會看到腳浮在空中或穿進本體，那是最容易被當成「渲染問題」而放過的錯。
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

const fs = require('fs');
const path = require('path');
const S = require('./pcb-3d-shapes.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL: ' + m); } };
const eq = (a, b, m) => ok(a === b, `${m} (得 ${JSON.stringify(a)}，期望 ${JSON.stringify(b)})`);

// 造測資：pads 用相對元件中心的座標
const pad = (n, x, y, o) => Object.assign({ num: String(n), x: x, y: y, w: 0.3, h: 0.9 }, o || {});
const qfp = (n, size) => {
  const pads = [], half = size / 2 - 0.35, per = n / 4, step = (size * 0.8) / per;
  for (let i = 0; i < per; i++) {
    const t = -(size * 0.4) + step * (i + 0.5);
    pads.push(pad(i * 4 + 1, -half, t), pad(i * 4 + 2, half, t), pad(i * 4 + 3, t, -half), pad(i * 4 + 4, t, half));
  }
  return { ref: 'U1', part: 'RP2040', kind: 'ic', w: size, h: size, pads: pads };
};

// ---- 1. 分類 ----
{
  eq(S.classify(qfp(16, 7)).type, 'qfp', '1.1 四邊都有腳 → QFP');

  const soic = { ref: 'U2', part: 'W25Q16', kind: 'ic', w: 5, h: 4, pads: [] };
  for (let i = 0; i < 4; i++) { soic.pads.push(pad(i + 1, -2.2, -1.2 + i * 0.8), pad(i + 5, 2.2, -1.2 + i * 0.8)); }
  eq(S.classify(soic).type, 'soic', '1.2 只有左右兩排 → SOIC');

  eq(S.classify({ ref: 'R1', kind: 'passive', w: 1.6, h: 0.8, pads: [pad(1, -0.7, 0), pad(2, 0.7, 0)] }).type,
     'chip', '1.3 兩顆 pad 的小件 → 晶片電阻電容');

  eq(S.classify({ ref: 'C9', kind: 'passive', w: 5, h: 5, pads: [pad(1, -1.8, 0), pad(2, 1.8, 0)] }).type,
     'electrolytic', '1.4 兩腳、方形、夠大、ref 是 C → 電解電容');

  eq(S.classify({ ref: 'Y1', part: '12MHz', kind: 'passive', w: 3.2, h: 2.5, pads: [pad(1, -1.2, 0), pad(2, 1.2, 0)] }).type,
     'can', '1.5 晶振 → 金屬殼（不是黑方塊）');

  const hdr = { ref: 'J1', part: 'HEADER-1x6', kind: 'conn', w: 15.2, h: 2.54, pads: [] };
  for (let i = 0; i < 6; i++) hdr.pads.push(pad(i + 1, -6.35 + i * 2.54, 0, { drill: 1.0 }));
  const hc = S.classify(hdr);
  eq(hc.type, 'header', '1.6 帶孔、節距 2.54 → 排針');
  ok(Math.abs(hc.pitch - 2.54) < 0.01, '1.7 節距量得準');

  eq(S.classify({ ref: 'J2', part: 'USB-C', kind: 'conn', w: 9, h: 7.5, pads: [] }).type,
     'shell', '1.8 USB → 金屬殼');
  eq(S.classify({ kind: 'mech', w: 3, h: 3, pads: [] }).type, 'none', '1.9 安裝孔不長東西');

  // 猜不出來要說是猜的，不可以假裝判斷出來
  const guess = S.classify({ ref: 'Q1', kind: 'ic', w: 3, h: 3, pads: [pad(1, -1, 0), pad(2, 1, 0), pad(3, 0, 1)] });
  ok(guess.guessed === true || guess.type === 'box', '1.10 判不出來要標 guessed');
}

// ---- 2. 高度 ----
{
  const h = (c, t) => S.bodyHeight(c, t);
  const c5 = { w: 5, h: 5 };
  ok(h(c5, 'electrolytic') > h(c5, 'qfp'), '2.1 電解電容要比 QFP 高');
  ok(h(c5, 'chip') < h(c5, 'soic'), '2.2 晶片電阻要比 SOIC 矮');
  eq(h(c5, 'none'), 0, '2.3 none 不佔高度');
  ok(h({ w: 40, h: 40 }, 'shell') <= 11, '2.4 連接器有高度上限，不可長成柱子');
  ok(Number.isFinite(h({}, 'box')) && h({}, 'box') > 0, '2.5 沒尺寸也要回有限正值');
}

// ---- 3. 零件組成：腳要長在 pad 上 ----
{
  const q = qfp(16, 7);
  const r = S.partsFor(q);
  eq(r.type, 'qfp', '3.1 partsFor 帶回型別');
  const leads = r.parts.filter(p => p.color === S.COLORS.lead);
  eq(leads.length, q.pads.length, '3.2 每顆 pad 都要有一根腳');
  // 每根腳的座標必須等於某顆 pad 的座標——差一點點就是浮在空中
  const missed = leads.filter(l => !q.pads.some(p => Math.abs(p.x - l.x) < 1e-9 && Math.abs(p.y - l.z) < 1e-9));
  eq(missed.length, 0, '3.3 腳的座標要跟 pad 對齊');
  const body = r.parts.find(p => p.color === S.COLORS.epoxy);
  ok(body && body.w < q.w && body.d < q.h, '3.4 本體要比封裝外框小（差額就是腳的位置）');
  ok(r.parts.length >= q.pads.length + 1, '3.5 至少本體＋每根腳');

  const hdr = { ref: 'J1', kind: 'conn', w: 15.2, h: 2.54, pads: [] };
  for (let i = 0; i < 6; i++) hdr.pads.push(pad(i + 1, -6.35 + i * 2.54, 0, { drill: 1 }));
  const hp = S.partsFor(hdr);
  eq(hp.parts.filter(p => p.color === S.COLORS.pin).length, 6, '3.6 排針要一針一根');

  const chip = S.partsFor({ ref: 'R1', kind: 'passive', w: 1.6, h: 0.8, pads: [pad(1, -0.7, 0), pad(2, 0.7, 0)] });
  eq(chip.parts.filter(p => p.color === S.COLORS.lead).length, 2, '3.7 晶片電阻兩端要有電極');

  const cap = S.partsFor({ ref: 'C9', kind: 'passive', w: 5, h: 5, pads: [pad(1, -1.8, 0), pad(2, 1.8, 0)] });
  ok(cap.parts.every(p => p.shape === 'cyl'), '3.8 電解電容全部是圓柱，不可混方塊');

  eq(S.partsFor({ kind: 'mech', w: 3, h: 3 }).parts.length, 0, '3.9 安裝孔不產生任何零件');
  eq(S.partsFor({}).parts.length, 0, '3.10 空元件不可以爆');
}

// ---- 4. 尺寸不可以是 NaN 或負的 ----
{
  const weird = [{ ref: 'U9', kind: 'ic' }, { ref: 'R9', kind: 'passive', w: 0, h: 0, pads: [] },
                 { ref: 'J9', kind: 'conn', w: -3, h: 2, pads: [] }];
  weird.forEach((c, i) => {
    const r = S.partsFor(c);
    const bad = r.parts.filter(p => ![p.x, p.y, p.z].every(Number.isFinite) ||
      (p.shape === 'box' ? !(p.w > 0 && p.h > 0 && p.d > 0) : !(p.r > 0 && p.h > 0)));
    eq(bad.length, 0, '4.' + (i + 1) + ' 畸形輸入也不可以產生 NaN／負尺寸');
  });
}

// ---- 5. 真的接進 3D ----
{
  const src = fs.readFileSync(path.join(__dirname, 'pcb-3d.js'), 'utf8');
  ok(src.indexOf('Pcb3DShapes') > 0, '5.1 pcb-3d.js 有用到外型模組');
  const html = fs.readFileSync(path.join(__dirname, 'pcb.html'), 'utf8');
  ok(html.indexOf('pcb-3d-shapes.js') > 0, '5.2 pcb.html 有載入模組');
}

console.log(`\npcb-3d-shapes.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
