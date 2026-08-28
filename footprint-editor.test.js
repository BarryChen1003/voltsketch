/**
 * footprint-editor.test.js — 自製封裝驗證（node）
 *
 * 對照真實封裝的規格書數字（SOIC-8、TSSOP-20、QFP-32、0603），
 * 不對「上次跑出來的數字」比對。自製封裝最危險的失敗是「量起來差 0.05mm」，
 * 那種錯只有拿規格書對才抓得到。
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

const FE = require('./footprint-editor.js');

let pass = 0, fail = 0;
function eq(a, b, msg) {
  const ok = JSON.stringify(a) === JSON.stringify(b);
  if (ok) pass++; else { fail++; console.error(`FAIL ${msg}\n  expected ${JSON.stringify(b)}\n  got      ${JSON.stringify(a)}`); }
}
const ok = (v, msg) => eq(!!v, true, msg);
function near(a, b, tol, msg) {
  const d = Math.abs(a - b);
  if (d <= tol) pass++; else { fail++; console.error(`FAIL ${msg}\n  ${a} 與 ${b} 差 ${d} > ${tol}`); }
}
const errs = r => r.filter(x => x.level === 'error');
const codes = r => r.map(x => x.code).sort();

// ---- 1. SOIC-8（規格：pitch 1.27、兩排中心距 5.4）----
{
  const fp = FE.dual({ pins: 8, pitch: 1.27, span: 5.4, padW: 1.5, padH: 0.6, name: 'SOIC-8' });
  eq(fp.pads.length, 8, '1.1 八個 pad');
  eq(fp.pads.map(p => p.num), [1, 2, 3, 4, 5, 6, 7, 8], '1.2 編號 1..8');
  // 第 1 腳在左上，第 8 腳在右上（IPC 慣例：左排由上往下，右排由下往上）
  const p1 = fp.pads[0], p4 = fp.pads[3], p5 = fp.pads[4], p8 = fp.pads[7];
  near(p1.x, -2.7, 1e-9, '1.3 第 1 腳在左排（span/2 = 2.7）');
  near(p8.x, 2.7, 1e-9, '1.4 第 8 腳在右排');
  near(p1.y, p8.y, 1e-9, '1.5 第 1 腳與第 8 腳同高（對面）');
  near(p4.y, p5.y, 1e-9, '1.6 第 4 腳與第 5 腳同高');
  near(Math.abs(fp.pads[1].y - fp.pads[0].y), 1.27, 1e-9, '1.7 間距 1.27mm');
  near(Math.abs(p4.y - p1.y), 1.27 * 3, 1e-9, '1.8 左排跨距 = 3 個間距');
  eq(errs(FE.check(fp)).length, 0, '1.9 SOIC-8 沒有錯誤');
  // courtyard 要包得住：寬 = 2.7*2 + 1.5 + 2*0.25 = 7.4
  near(fp.courtyard.w, 7.4, 1e-9, '1.10 courtyard 寬度算對');
  near(fp.courtyard.h, 1.27 * 3 + 0.6 + 0.5, 1e-9, '1.11 courtyard 高度算對');
}

// ---- 2. TSSOP-20（pitch 0.65）----
{
  const fp = FE.dual({ pins: 20, pitch: 0.65, span: 5.6, padW: 1.4, padH: 0.4 });
  eq(fp.pads.length, 20, '2.1 二十個 pad');
  near(Math.abs(fp.pads[1].y - fp.pads[0].y), 0.65, 1e-9, '2.2 間距 0.65mm');
  eq(FE.detectPitch(fp.pads), 0.65, '2.3 間距偵測抓得到 0.65');
  const r = FE.check(fp);
  eq(errs(r).length, 0, '2.4 沒有錯誤');
  eq(r.some(x => x.code === 'unusual_pitch'), false, '2.5 0.65 是常見間距，不該被警告');
}

// ---- 3. QFP-32（四排，pitch 0.5）----
{
  const fp = FE.quad({ pins: 32, pitch: 0.5, span: 7, padW: 1.2, padH: 0.3 });
  eq(fp.pads.length, 32, '3.1 三十二個 pad');
  eq(fp.pads.map(p => p.num), Array.from({ length: 32 }, (_, i) => i + 1), '3.2 編號 1..32 連續');
  // 每一排 8 個
  const left = fp.pads.filter(p => Math.abs(p.x + 3.5) < 1e-9);
  const top = fp.pads.filter(p => Math.abs(p.y - 3.5) < 1e-9);
  eq([left.length, top.length], [8, 8], '3.3 左排與上排各 8 個');
  // 上下兩排的 pad 要轉 90 度（長邊朝外）
  eq(top.every(p => p.rot === 90), true, '3.4 上排 pad 轉 90 度');
  eq(left.every(p => p.rot === 0), true, '3.5 左排 pad 不轉');
  const r = FE.check(fp);
  eq(errs(r).length, 0, '3.6 QFP-32 沒有錯誤（padHalf 有處理旋轉，轉角不該誤判重疊）');
}

// ---- 4. BGA 網格 ----
{
  const fp = FE.grid({ rows: 4, cols: 4, pitch: 0.8, ballD: 0.4 });
  eq(fp.pads.length, 16, '4.1 4×4 = 16 顆球');
  eq(fp.pads[0].num, 'A1', '4.2 第一顆是 A1');
  eq(fp.pads[15].num, 'D4', '4.3 最後一顆是 D4');
  eq(fp.pads.every(p => p.shape === 'circle'), true, '4.4 BGA 球是圓的');
  near(Math.abs(fp.pads[1].x - fp.pads[0].x), 0.8, 1e-9, '4.5 間距 0.8');
  eq(errs(FE.check(fp)).length, 0, '4.6 沒有錯誤');
}
{
  // 字母要跳過 I / O / Q / S / X / Z（JEDEC 規定，避免跟數字混淆）
  eq([0, 1, 2, 7, 8].map(FE.rowName), ['A', 'B', 'C', 'H', 'J'], '4.7 跳過 I（第 8 個是 J 不是 I）');
  ok(!'ABCDEFGHJKLMNPRTUVWY'.includes('I'), '4.8 字母表確實不含 I');
  ok(!'ABCDEFGHJKLMNPRTUVWY'.includes('O'), '4.9 字母表確實不含 O');
}
{
  // 挖掉中間的球（很多 BGA 這樣做）
  const fp = FE.grid({ rows: 3, cols: 3, pitch: 0.8, skip: ['B2'] });
  eq(fp.pads.length, 8, '4.10 挖掉一顆剩 8');
  eq(fp.pads.some(p => p.num === 'B2'), false, '4.11 被挖的那顆確實不在');
}

// ---- 5. 0603 被動件 ----
{
  // 0603 的 IPC 標準 land：pad 0.8×0.9，中心距 1.55
  const fp = FE.chip({ span: 1.55, padW: 0.8, padH: 0.9, name: 'R0603' });
  eq(fp.pads.length, 2, '5.1 兩個 pad');
  near(fp.pads[0].x, -0.775, 1e-9, '5.2 左 pad 位置');
  near(fp.pads[1].x, 0.775, 1e-9, '5.3 右 pad 位置');
  near(fp.courtyard.w, 1.55 + 0.8 + 0.5, 1e-9, '5.4 courtyard 寬');
  eq(errs(FE.check(fp)).length, 0, '5.5 沒有錯誤');
}

// ---- 6. 通孔（DIP）----
{
  const fp = FE.dual({ pins: 8, pitch: 2.54, span: 7.62, padW: 1.6, padH: 1.6, tht: true, drill: 0.8 });
  eq(fp.pads.every(p => p.drill === 0.8), true, '6.1 每個 pad 都有孔');
  eq(fp.pads[0].shape, 'rect', '6.2 第 1 腳是方的（看得出方向）');
  eq(fp.pads[1].shape, 'circle', '6.3 其它腳是圓的');
  eq(fp.pads.every(p => p.side === '*'), true, '6.4 通孔兩面都有銅');
  eq(errs(FE.check(fp)).length, 0, '6.5 沒有錯誤');
}

// ---- 7. check 抓得到真實錯誤 ----
{
  // pad 重疊
  let fp = FE.blank('BAD');
  fp = FE.addPad(fp, { num: 1, x: 0, y: 0, w: 1, h: 1 });
  fp = FE.addPad(fp, { num: 2, x: 0.5, y: 0, w: 1, h: 1 });
  fp.courtyard = FE.courtyardOf(fp, 0.25);
  const r = FE.check(fp);
  ok(codes(r).includes('pad_overlap'), '7.1 抓得到 pad 重疊');
  eq(errs(r).length >= 1, true, '7.2 而且是 error 等級');
}
{
  // pad 太近（沒重疊但間距不足）
  let fp = FE.blank('CLOSE');
  fp = FE.addPad(fp, { num: 1, x: 0, y: 0, w: 1, h: 1 });
  fp = FE.addPad(fp, { num: 2, x: 1.05, y: 0, w: 1, h: 1 });   // 間距 0.05
  fp.courtyard = FE.courtyardOf(fp, 0.25);
  const r = FE.check(fp, { minGap: 0.1 });
  ok(codes(r).includes('pad_too_close'), '7.3 抓得到 pad 太近');
  eq(errs(r).length, 0, '7.4 太近是警告不是錯誤（板廠可能做得到）');
}
{
  // 編號重複
  let fp = FE.blank('DUP');
  fp = FE.addPad(fp, { num: 1, x: -2, y: 0, w: 1, h: 1 });
  fp = FE.addPad(fp, { num: 1, x: 2, y: 0, w: 1, h: 1 });
  fp.courtyard = FE.courtyardOf(fp, 0.25);
  ok(codes(FE.check(fp)).includes('dup_pad_num'), '7.5 抓得到編號重複');
}
{
  // 跳號
  let fp = FE.blank('GAP');
  fp = FE.addPad(fp, { num: 1, x: -3, y: 0, w: 1, h: 1 });
  fp = FE.addPad(fp, { num: 2, x: 0, y: 0, w: 1, h: 1 });
  fp = FE.addPad(fp, { num: 5, x: 3, y: 0, w: 1, h: 1 });
  fp.courtyard = FE.courtyardOf(fp, 0.25);
  ok(codes(FE.check(fp)).includes('pad_num_gap'), '7.6 抓得到編號跳號');
}
{
  // 孔比 pad 大
  let fp = FE.blank('DRILL');
  fp = FE.addPad(fp, { num: 1, x: 0, y: 0, w: 1, h: 1, drill: 1.2 });
  fp.courtyard = FE.courtyardOf(fp, 0.25);
  const r = FE.check(fp);
  ok(codes(r).includes('drill_bigger_than_pad'), '7.7 抓得到孔比 pad 大');
  eq(errs(r).length >= 1, true, '7.8 這是 error（做出來就是一個洞）');
}
{
  // 環寬太薄
  let fp = FE.blank('ANN');
  fp = FE.addPad(fp, { num: 1, x: 0, y: 0, w: 1, h: 1, drill: 0.85 });
  fp.courtyard = FE.courtyardOf(fp, 0.25);
  ok(codes(FE.check(fp)).includes('annular_thin'), '7.9 抓得到環寬太薄（0.075mm）');
}
{
  // courtyard 包不住 pad
  const fp = FE.dual({ pins: 8, pitch: 1.27, span: 5.4, padW: 1.5, padH: 0.6 });
  fp.courtyard = { w: 1, h: 1 };
  ok(codes(FE.check(fp)).includes('courtyard_too_small'), '7.10 抓得到 courtyard 太小');
}
{
  // 奇怪的間距（0.6 而不是 0.65，典型打錯字）
  const fp = FE.dual({ pins: 8, pitch: 0.6, span: 5, padW: 1, padH: 0.3 });
  ok(codes(FE.check(fp)).includes('unusual_pitch'), '7.11 非常見間距要警告（0.65 打成 0.6 這種）');
}
eq(FE.check(FE.blank('X')).map(x => x.code), ['no_pads'], '7.12 空封裝要報 no_pads');

// ---- 8. 編輯操作 ----
{
  let fp = FE.blank('E');
  fp = FE.addPad(fp, { x: 1, y: 2 });
  fp = FE.addPad(fp, { x: 3, y: 4 });
  eq(fp.pads.map(p => p.num), [1, 2], '8.1 沒給編號就自動接續');
  fp = FE.movePad(fp, 1, 9, 9);
  eq([fp.pads[0].x, fp.pads[0].y], [9, 9], '8.2 移動 pad');
  fp = FE.removePad(fp, 1);
  eq(fp.pads.map(p => p.num), [2], '8.3 刪除 pad');
  eq(FE.nextNum(fp), 3, '8.4 下一個編號接在最大號之後');
}
{
  // 編輯不可以改到原本的物件（純函式）
  const a = FE.dual({ pins: 4 });
  const b = FE.movePad(a, 1, 99, 99);
  eq(a.pads[0].x === 99, false, '8.5 movePad 不改到原物件');
  eq(b.pads[0].x, 99, '8.6 但新物件有改到');
}

// ---- 9. 與 PCB 元件互轉 ----
{
  const fp = FE.dual({ pins: 8, pitch: 1.27, span: 5.4, padW: 1.5, padH: 0.6, name: 'SOIC-8' });
  const c = FE.toComponent(fp, 'U7', 10, 20);
  eq([c.ref, c.x, c.y, c.part], ['U7', 10, 20, 'SOIC-8'], '9.1 轉成元件帶對 ref 與位置');
  eq(c.pads.length, 8, '9.2 pad 都在');
  eq(c.pads.every(p => p.net === ''), true, '9.3 net 空白（封裝本身沒有網路）');
  near(c.w, fp.courtyard.w, 1e-9, '9.4 元件尺寸取自 courtyard（DRC 才量得到）');

  const back = FE.fromComponent(c, 'ROUNDTRIP');
  eq(back.pads.length, 8, '9.5 反向轉回來 pad 數一致');
  eq(back.pads.map(p => [p.x, p.y]), fp.pads.map(p => [p.x, p.y]), '9.6 座標 round-trip 完全一致');
}

// ---- 10. 參數錯誤要擋 ----
{
  let threw = false;
  try { FE.dual({ pins: 7 }); } catch (e) { threw = /even/.test(e.message); }
  ok(threw, '10.1 兩排封裝的腳數必須是偶數');
  threw = false;
  try { FE.quad({ pins: 30 }); } catch (e) { threw = /multiple_of_4/.test(e.message); }
  ok(threw, '10.2 四排封裝的腳數必須是 4 的倍數');
}
{
  // padHalf 對旋轉的處理（QFP 不誤判重疊的關鍵）
  eq(FE.padHalf({ w: 2, h: 1, rot: 0 }), { w: 1, h: 0.5 }, '10.3 未旋轉');
  eq(FE.padHalf({ w: 2, h: 1, rot: 90 }), { w: 0.5, h: 1 }, '10.4 轉 90 度寬高對調');
  eq(FE.padHalf({ w: 2, h: 1, rot: 180 }), { w: 1, h: 0.5 }, '10.5 轉 180 度等同未轉');
  eq(FE.padHalf({ w: 2, h: 1, rot: 270 }), { w: 0.5, h: 1 }, '10.6 轉 270 度等同轉 90');
}

console.log(`\nfootprint-editor.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
