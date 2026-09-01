/**
 * pcb-interact.test.js — 互動資料層（pcb-interact.js）
 *
 * 這支測試存在的理由是一個真實的缺陷：選取高亮與網路高亮都用兩端點畫直線，
 * 圓弧走線被選中時，高亮框跟被選的線對不上。弧越大偏越多，而且沒有任何測試會紅，
 * 因為「有沒有畫出東西」本來就都是有。所以第 1 節在守「弧要當弧描邊」。
 *
 * 第 4 節守四語：選單與快捷鍵說明是新的畫面文字，硬規矩 6 要求 zh/en/ja/ko 齊全。
 * 少一種語言就紅——不是靠人記得去補。
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

const fs = require('fs');
const path = require('path');
const I = require('./pcb-interact.js');

let pass = 0, fail = 0;
function eq(a, b, msg) {
  const okk = JSON.stringify(a) === JSON.stringify(b);
  if (okk) pass++; else { fail++; console.error('FAIL ' + msg + '\n  expected ' + JSON.stringify(b) + '\n  got      ' + JSON.stringify(a)); }
}
const ok = (v, msg) => eq(!!v, true, msg);
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, msg + ' (得 ' + a + '，期望 ' + b + '±' + tol + ')');

// ---- 1. pathOf：弧要當弧 ----
{
  const line = { x1: 0, y1: 0, x2: 3, y2: 4, width: 0.3 };
  eq(I.pathOf(line).kind, 'line', '1.1 沒有 arc 就是直線');

  const arc = { x1: 0, y1: 2, x2: 2, y2: 0, arc: { cx: 0, cy: 0, r: 2, a0: 0, a1: Math.PI / 2 } };
  eq(I.pathOf(arc).kind, 'arc', '1.2 有 arc 就要當弧');
  eq(I.pathOf(arc).r, 2, '1.3 半徑照抄');

  // 半套的 arc（r 是 0、角度是 NaN）不可以當弧畫，否則 canvas 畫出空路徑，
  // 使用者看到的是「選了但沒有高亮」——比畫成直線更難查。
  eq(I.pathOf({ x1: 0, y1: 0, x2: 1, y2: 1, arc: { cx: 0, cy: 0, r: 0, a0: 0, a1: 1 } }).kind, 'line', '1.4 r=0 退回直線');
  eq(I.pathOf({ x1: 0, y1: 0, x2: 1, y2: 1, arc: { cx: NaN, cy: 0, r: 2, a0: 0, a1: 1 } }).kind, 'line', '1.5 NaN 退回直線');
}

// ---- 2. lengthOf：弧長不是弦長 ----
{
  eq(I.lengthOf({ x1: 0, y1: 0, x2: 3, y2: 4 }), 5, '2.1 直線長度');
  // 半徑 2 的 90° 弧：弧長 π，弦長只有 2.83。用弦長會短報 10%。
  const q = { x1: 0, y1: 2, x2: 2, y2: 0, arc: { cx: 0, cy: 0, r: 2, a0: 0, a1: Math.PI / 2 } };
  near(I.lengthOf(q), Math.PI, 1e-9, '2.2 90° 弧長 = πr/2 × 2');
  ok(I.lengthOf(q) > Math.hypot(2, 2), '2.3 弧長必大於弦長');
}

// ---- 3. flipLayer 與選單 ----
{
  eq(I.flipLayer('F.Cu'), 'B.Cu', '3.1 頂翻底');
  eq(I.flipLayer('B.Cu'), 'F.Cu', '3.2 底翻頂');
  eq(I.flipLayer('In1.Cu'), 'In1.Cu', '3.3 內層不猜要翻到哪，維持原層');

  const onTrace = I.menuFor({ kind: 'trace', trace: { net: 'GND', layer: 'F.Cu' } }, {});
  eq(onTrace.map(i => i.id), ['hlnet', 'flip', 'applyw', 'delete'], '3.4 走線選單四項');
  ok(onTrace[3].danger, '3.5 刪除要標 danger');
  ok(!onTrace[0].disabled, '3.6 走線有 net → 高亮可按');

  // 沒有 net 的走線不能按「高亮此網路」，但項目仍要看得到
  const noNet = I.menuFor({ kind: 'trace', trace: { layer: 'In1.Cu' } }, {});
  ok(noNet[0].disabled, '3.7 無 net → 高亮 disabled');
  ok(noNet[1].disabled, '3.8 內層 → 換層 disabled');
  eq(noNet.length, 4, '3.9 disabled 不等於拿掉項目');

  const onComp = I.menuFor({ kind: 'comp', net: '' }, {});
  eq(onComp.map(i => i.id), ['rotate', 'rename', 'hlnet', 'delete'], '3.10 元件選單四項');

  const empty = I.menuFor(null, {});
  eq(empty.map(i => i.id), ['paste', 'fit', 'rats', 'clearhl'], '3.11 空白處選單');
  ok(empty[0].disabled, '3.12 剪貼簿空 → 貼上 disabled');
  ok(!I.menuFor(null, { clipboard: [{}] })[0].disabled, '3.13 剪貼簿有東西 → 可貼上');
  ok(!I.menuFor(null, { highlightNet: 'GND' })[3].disabled, '3.14 有高亮才可取消高亮');
}

// ---- 4. 快捷鍵表與四語覆蓋 ----
{
  const sc = I.shortcuts();
  ok(sc.length >= 10, '4.1 快捷鍵至少 10 組');
  ok(sc.every(s => s.keys && s.act && s.i18n), '4.2 每組都要有 keys/act/i18n');
  const acts = sc.map(s => s.act);
  eq(acts.length, new Set(acts).size, '4.3 act 不重複');

  // 硬規矩 6：畫面上的字一律四語。少一種就紅。
  const src = fs.readFileSync(path.join(__dirname, 'i18n.js'), 'utf8');
  const missing = [];
  for (const key of I.i18nKeys()) {
    const at = src.indexOf(key + ':');
    if (at < 0) { missing.push(key + ' (整個 key 不存在)'); continue; }
    const seg = src.slice(at, at + 1500);
    const end = seg.indexOf('},');
    const body = end > 0 ? seg.slice(0, end) : seg;
    for (const lang of ['zh:', 'en:', 'ja:', 'ko:']) {
      if (body.indexOf(lang) < 0) missing.push(key + ' 缺 ' + lang.replace(':', ''));
    }
  }
  eq(missing, [], '4.4 所有新 key 四語齊全');
}

// ---- 4b. hover 資訊卡內容 ----
// 資訊卡上的數字會被使用者拿來判斷（這條線多寬、屬於哪個網路）。
// 顯示錯比不顯示更糟——弧線用弦長算長度就是這種錯，所以這裡守著。
{
  const arc = { net: 'USB_DP', layer: 'F.Cu', width: 0.25,
                x1: 0, y1: 2, x2: 2, y2: 0, arc: { cx: 0, cy: 0, r: 2, a0: 0, a1: Math.PI / 2 } };
  const rows = I.hoverInfo({ kind: 'trace', trace: arc });
  eq(rows.map(r => r.label), ['pj_ts_net', 'pj_ts_layer', 'pj_ts_width', 'pj_ts_len'], '4b.1 走線四列');
  eq(rows[0].value, 'USB_DP', '4b.2 網路名');
  ok(parseFloat(rows[3].value) > 2.82, '4b.3 弧線長度要用弧長（π≈3.14），不是弦長 2.83');

  const noNet = I.hoverInfo({ kind: 'trace', trace: { layer: 'B.Cu' } });
  eq(noNet[0].value, '—', '4b.4 沒有網路要顯示破折號，不可以是 undefined');

  const pad = I.hoverInfo({ kind: 'pad', ref: 'U1', pin: '7', net: 'GND', drill: 0 });
  eq(pad[0].value, 'U1.7', '4b.5 pad 顯示 ref.pin');
  eq(pad.length, 2, '4b.6 沒有鑽孔就不列鑽孔');
  eq(I.hoverInfo({ kind: 'pad', ref: 'J1', pin: '1', net: 'V5', drill: 1 }).length, 3, '4b.7 有孔才列');

  eq(I.hoverInfo(null).length, 0, '4b.8 沒命中回空陣列');
  eq(I.hoverInfo({ kind: 'nope' }).length, 0, '4b.9 不認識的種類不可以爆');
}

// ---- 4c. 走線中數字鍵換層 ----
{
  const cu4 = ['F.Cu', 'In1.Cu', 'In2.Cu', 'B.Cu'];
  eq(I.layerForKey('1', cu4), 'F.Cu', '4c.1 1 = 第一個銅層');
  eq(I.layerForKey('4', cu4), 'B.Cu', '4c.2 4 = 第四個銅層');
  // 2 層板按 4 沒有對應層——不可以回 undefined 讓呼叫端把 traceLayer 設成 undefined
  eq(I.layerForKey('4', ['F.Cu', 'B.Cu']), null, '4c.3 超出層數回 null');
  eq(I.layerForKey('0', cu4), null, '4c.4 0 不對應任何層');
  eq(I.layerForKey('a', cu4), null, '4c.5 非數字回 null');
  eq(I.layerForKey('2', []), null, '4c.6 沒有疊層資料回 null');
}

// ---- 5. pcb.js 真的有把這些接上去 ----
{
  // 說明面板寫了鍵、程式沒綁，是最典型的文件謊言。這裡對照 pcb.js 原始碼。
  // 硬規矩 11：本機工作區可能是 CRLF。距離型正則（[\s\S]{0,N}）在 CRLF 下每行多一個位元組，
  // 同一份原始碼會忽然對不上——先正規化，測的才是內容而不是換行風格。
  const app = fs.readFileSync(path.join(__dirname, 'pcb.js'), 'utf8').replace(/\r\n/g, '\n');
  ok(app.indexOf('PcbInteract') > 0, '5.1 pcb.js 有用到 PcbInteract');
  ok(app.indexOf('contextmenu') > 0, '5.2 pcb.js 有掛右鍵選單');
  ok(app.indexOf('pathOf') > 0, '5.3 高亮描邊改用 pathOf');
  const html = fs.readFileSync(path.join(__dirname, 'pcb.html'), 'utf8').replace(/\r\n/g, '\n');
  ok(html.indexOf('pcb-interact.js') > 0, '5.4 pcb.html 有載入模組');
  ok(html.indexOf('traceSelFields') > 0, '5.5 pcb.html 有走線屬性面板');
  ok(html.indexOf('shortcutRows') > 0, '5.6 pcb.html 有快捷鍵說明面板');
  ok(html.indexOf('pcbHoverTip') > 0, '5.7 pcb.html 有 hover 資訊卡容器');
  ok(app.indexOf('hoverHitAt') > 0, '5.8 pcb.js 有 hover 命中判斷');
  ok(app.indexOf('switchLayerWithVia') > 0, '5.9 pcb.js 有走線中換層');
  // 換層而不落 via＝兩層之間是斷的，畫面上卻看起來連著。這條守著那個 via。
  ok(/switchLayerWithVia[\s\S]{0,1200}vias\.push/.test(app), '5.10 換層時要落 via');
}

console.log((fail ? 'FAIL' : 'PASS') + ' pcb-interact: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
