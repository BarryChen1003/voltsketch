/**
 * assembly.test.js — 組裝圖（supabase/functions/_shared/assembly.mjs）
 *
 * 這張圖是給產線的人看的，錯的方式很具體：
 *   1. **兩個方向提示互相矛盾**：斜角以前固定畫在左上角，第 1 腳圓點畫在真的 pad 1 上。
 *      pad 1 在右下的元件就會拿到兩個指相反方向的提示，作業員得停下來想「看哪個」。
 *      現在斜角跟著第 1 腳走（第 1 節）。
 *   2. **看不出方向**：只有一個空白方框，元件轉了 90° 還是 0° 完全看不出來。
 *      pad 排列才看得出來，所以 pad 一定要畫（第 2 節）。
 *   3. **不說哪些是估的**：外框有真的 courtyard 才是量出來的，其餘是用 w/h 估的。
 *      圖上要寫出「幾顆是真的」，不能讓人以為每一顆都準（第 3 節）。
 *   4. **底面沒鏡射**：那是站在板子底下看的視角，錯了整張圖左右相反，
 *      而產線不會懷疑圖，只會把料貼到錯的位置（第 4 節）。
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

const A = require('./supabase/functions/_shared/assembly.mjs');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL: ' + m); } };
const eq = (a, b, m) => ok(a === b, `${m} (得 ${JSON.stringify(a)}，期望 ${JSON.stringify(b)})`);

const padAbs = (c, p) => ({ x: c.x + (p.x || 0), y: c.y + (p.y || 0) });
const pad = (n, x, y, o) => Object.assign({ num: String(n), x, y, w: 0.6, h: 0.9 }, o || {});
const comp = (o) => Object.assign({ ref: 'U1', part: '', x: 0, y: 0, w: 3, h: 3, side: 'top', rot: 0, pads: [] }, o);
const board = (comps) => ({ boardWidth: 40, boardHeight: 30, components: comps });
const count = (txt, cls) => (txt.match(new RegExp('class="' + cls + '"', 'g')) || []).length;

// ---- 1. 方向標記：斜角要跟第 1 腳同一個角 ----
{
  const P = A._isPolarised;
  ok(P({ ref: 'D1' }), '1.1 二極體有方向');
  ok(P({ ref: 'U1', part: 'RP2040' }), '1.2 IC 也有方向（不是只有極性元件才需要標）');
  ok(P({ ref: 'C9', part: '100uF elec' }), '1.3 寫成 C9 但封裝是 elec 也算');
  ok(!P({ ref: 'R5' }), '1.4 電阻沒有方向，不標');
  ok(!P({ ref: '', part: '' }), '1.5 什麼都沒有時不猜');

  // 這是這一節真正的重點：斜角的位置。固定畫左上的話，pad 1 在右下的元件
  // 會拿到一個跟圓點指相反方向的提示——兩個互相矛盾的標記比只有一個更糟。
  const chamfer = (p1x, p1y) => {
    const st = board([comp({ ref: 'U1', w: 4, h: 4, pads: [pad(1, p1x, p1y)] })]);
    const m = /class="pol" points="([^"]+)"/.exec(A.sheet(st, padAbs, { side: 'top' }).text);
    return m ? m[1] : '';
  };
  ok(/^-2,/.test(chamfer(-1.5, -1.5)), '1.6 pad 1 在左上 → 斜角在左上');
  ok(/^2,/.test(chamfer(1.5, 1.5)), '1.7 pad 1 在右下 → 斜角在右下');
  ok(chamfer(1.5, -1.5) !== chamfer(-1.5, 1.5), '1.8 右上與左下不可以畫成同一個角');
  // 沒有 pad 1 的元件仍要有斜角（退回左上），不可以整個不標
  const noP1 = board([comp({ ref: 'D9', pads: [pad(2, 1, 0)] })]);
  ok(/class="pol"/.test(A.sheet(noP1, padAbs, { side: 'top' }).text), '1.9 沒有 pad 1 也要標方向');
}

// ---- 2. pad 要畫出來（方向的唯一線索）----
{
  const st = board([comp({ ref: 'U1', pads: [pad(1, -1, -1), pad(2, -1, 0), pad(3, 1, 0, { shape: 'circle' })] })]);
  const r = A.sheet(st, padAbs, { side: 'top', base: 'b' });
  eq(r.stats.pads, 3, '2.1 三顆 pad 都畫');
  eq(count(r.text, 'pad'), 3, '2.2 SVG 裡真的有三個 pad 圖元');
  ok(/<ellipse class="pad"/.test(r.text), '2.3 圓形 pad 用 ellipse，不是一律方框');
  // 非銅的開窗 pad 不是焊接點，畫上去會讓人以為要貼
  const st2 = board([comp({ pads: [pad(1, 0, 0), pad(2, 1, 0, { cu: false })] })]);
  eq(A.sheet(st2, padAbs, { side: 'top' }).stats.pads, 1, '2.4 cu:false 的開窗不算 pad');
}

// ---- 3. 外框來源要誠實 ----
{
  const withCy = comp({ ref: 'U1', crtyd: { minx: -2, miny: -2, maxx: 2, maxy: 2 }, pads: [pad(1, 0, 0)] });
  const noCy = comp({ ref: 'R1', x: 8, pads: [pad(1, 0, 0)] });
  const r = A.sheet(board([withCy, noCy]), padAbs, { side: 'top' });
  eq(r.stats.placed, 2, '3.1 兩顆都放');
  eq(r.stats.courtyard, 1, '3.2 只有一顆有真的 courtyard');
  eq(count(r.text, 'cy'), 1, '3.3 只畫一個 courtyard 框');
  ok(/1 of 2 outlines from real courtyard/.test(r.text), '3.4 **圖上要寫出幾顆是真的**');
  // 壞掉的 courtyard（寬度 0 或 NaN）不算，寧可退回估的也不要畫一條線
  const bad = comp({ ref: 'U2', crtyd: { minx: 1, miny: 1, maxx: 1, maxy: 5 }, pads: [pad(1, 0, 0)] });
  eq(A.sheet(board([bad]), padAbs, { side: 'top' }).stats.courtyard, 0, '3.5 寬度 0 的 courtyard 不算');
}

// ---- 4. 底面鏡射 ----
{
  const st = board([comp({ ref: 'D1', x: 10, y: 0, side: 'bottom', pads: [pad(1, 0, 0)] })]);
  const top = A.sheet(st, padAbs, { side: 'top' });
  const bot = A.sheet(st, padAbs, { side: 'bottom' });
  eq(top.stats.placed, 0, '4.1 底面元件不出現在頂視圖');
  eq(bot.stats.placed, 1, '4.2 出現在底視圖');
  ok(/translate\(-10/.test(bot.text), '4.3 底視圖左右鏡射（x = -10）');
  ok(/BOTTOM/.test(bot.text), '4.4 標題要講這是底面');
}

// ---- 5. 空板與畸形資料 ----
{
  const r = A.sheet(board([]), padAbs, { side: 'top' });
  eq(r.stats.placed, 0, '5.1 空板不爆');
  ok(r.text.indexOf('<svg') >= 0, '5.2 仍然產得出 SVG');
  const weird = A.sheet(board([comp({ ref: 'X', w: 0, h: 0, pads: [pad(1, 0, 0, { w: 0, h: 0 })] })]), padAbs, { side: 'top' });
  ok(!/NaN|Infinity/.test(weird.text), '5.3 尺寸 0 也不可以產生 NaN');
}

console.log(`\nassembly.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
