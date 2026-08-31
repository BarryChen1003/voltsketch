/**
 * pcb-theme.test.js — 2D 配色主題（pcb-theme.js）
 *
 * 配色最惡的失敗不是「醜」，是「某一層在背景上根本看不見」——畫面上它確實有渲染，
 * 截圖也看得到有東西，但那條線的顏色跟底色差不多暗，使用者以為那層沒畫。
 * 所以這裡不看「好不好看」（那是品味），只守兩件算得出來的事：
 *   1. 每個層色對背景的 WCAG 對比度 >= 4.5（細線比文字更難看清，門檻不放寬）。
 *   2. 前四層（最常見的 4 層板）兩兩色相距離 >= 55°，不然疊起來分不出哪條在哪層。
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

const fs = require('fs');
const path = require('path');
const T = require('./pcb-theme.js');

let pass = 0, fail = 0;
function eq(a, b, msg) {
  const okk = JSON.stringify(a) === JSON.stringify(b);
  if (okk) pass++; else { fail++; console.error('FAIL ' + msg + '\n  expected ' + JSON.stringify(b) + '\n  got      ' + JSON.stringify(a)); }
}
const ok = (v, msg) => eq(!!v, true, msg);

// ---- 1. 主題結構 ----
{
  ok(T.ids().indexOf('cam') >= 0, '1.1 有 cam 主題');
  eq(T.DEFAULT, 'cam', '1.2 預設是 cam（使用者要的黑底螢光）');
  eq(T.ids().length >= 3, true, '1.3 至少三套主題');
  T.ids().forEach(id => {
    const t = T.get(id);
    ['bg', 'grid', 'board', 'silkF', 'silkB', 'compTop', 'compBottom', 'ramp', 'i18n'].forEach(k =>
      ok(t[k], '1.4 ' + id + ' 有 ' + k));
    ok(t.ramp.length >= 8, '1.5 ' + id + ' 層色環至少 8 色（8 層板不重複）');
  });
  // 不存在的 id 要退回預設，不可以回 undefined 讓呼叫端整個爆掉
  eq(T.get('nope'), T.get('cam'), '1.6 未知主題退回預設');
}

// ---- 2. 對比度：每層都要看得見 ----
{
  T.ids().forEach(id => {
    const t = T.get(id);
    t.ramp.forEach((c, i) => {
      const r = T.contrast(c, t.bg);
      ok(r >= 4.5, '2.1 ' + id + ' 第 ' + i + ' 層 ' + c + ' 對比度 ' + r.toFixed(2) + ' >= 4.5');
    });
    ok(T.contrast(t.silkF, t.bg) >= 4.5, '2.2 ' + id + ' 頂絲印看得見');
    ok(T.contrast(t.board, t.bg) >= 3, '2.3 ' + id + ' 板框看得見');
    // 格線相反：太亮會蓋過走線。要在背景之上、又不可以比最暗的層色還顯眼
    const gc = T.contrast(t.grid, t.bg);
    ok(gc > 1.05 && gc < 4.5, '2.4 ' + id + ' 格線比背景亮一點但不搶戲（' + gc.toFixed(2) + '）');
  });
}

// ---- 3. 相鄰層要分得出來 ----
{
  T.ids().forEach(id => {
    const r = T.get(id).ramp;
    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        const d = T.hueDistance(r[i], r[j]);
        ok(d >= 55, '3.1 ' + id + ' 第 ' + i + ' 與第 ' + j + ' 層色相距 ' + Math.round(d) + '° >= 55');
      }
    }
    eq(new Set(r).size, r.length, '3.2 ' + id + ' 層色不重複');
  });
}

// ---- 4. paletteFor 攤平 ----
{
  const p = T.paletteFor('cam', ['F.Cu', 'In1.Cu', 'In2.Cu', 'B.Cu']);
  eq(p.theme, 'cam', '4.1 帶回主題 id');
  eq(p['F.Cu'], T.layerColor('cam', 0), '4.2 F.Cu 取第 0 色');
  eq(p['B.Cu'], T.layerColor('cam', 3), '4.3 B.Cu 取第 3 色（依實際疊層順序）');
  ok(p.bg && p.grid && p.silkF, '4.4 一併帶背景/格線/絲印');
  // 沒有板子時也要拿得到一組值，不然開新頁面會是一片黑
  const bare = T.paletteFor('cam', []);
  ok(bare['F.Cu'] && bare['B.Cu'], '4.5 沒給疊層也有兩層預設色');
  eq(T.paletteFor('nope', ['F.Cu']).theme, 'cam', '4.6 未知主題退回預設 id');
}

// ---- 5. 色環索引不可越界 ----
{
  const r = T.get('cam').ramp;
  eq(T.layerColor('cam', r.length), r[0], '5.1 超過長度就繞回第一色');
  eq(T.layerColor('cam', -1), r[r.length - 1], '5.2 負索引不可回 undefined');
}

// ---- 6. 真的接進 pcb.js 與畫面 ----
{
  const app = fs.readFileSync(path.join(__dirname, 'pcb.js'), 'utf8');
  ok(app.indexOf('PcbTheme') > 0, '6.1 pcb.js 有用到 PcbTheme');
  const html = fs.readFileSync(path.join(__dirname, 'pcb.html'), 'utf8');
  ok(html.indexOf('pcb-theme.js') > 0, '6.2 pcb.html 有載入模組');
  ok(html.indexOf('paletteTheme') > 0, '6.3 配色面板有主題選單');
  // 鑽孔中心以前寫死 #1a1a2e（舊背景色）。換主題後它會變成黑底上的深藍點，
  // 看起來像「孔沒對準」。必須改成讀背景色。
  ok(app.indexOf("fillStyle = '#1a1a2e'") < 0, '6.4 鑽孔不再寫死舊背景色');
}

console.log((fail ? 'FAIL' : 'PASS') + ' pcb-theme: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
