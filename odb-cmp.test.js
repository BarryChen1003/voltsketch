/**
 * odb-cmp.test.js — ODB++ v2 的元件與 netlist 驗證（node）
 *
 * odb-check.js 跑的是 8 片公版，而公版的 pad 大多沒有 net、元件也沒有 pads，
 * 所以那支驗不到 CMP / TOP / NET 這條路。這支用合成板子把它補起來。
 *
 * 驗的是「CAM 端真正會拿去用的東西」：
 *   每個 pad 都要找得到它屬於哪顆料（CMP → TOP）
 *   每個 TOP 的 net 編號都要指得到 eda/data 裡真的存在的 NET
 *   沒接網路的 pad 要標 -1，不可以硬指到某個 net
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

let pass = 0, fail = 0;
function eq(a, b, msg) {
  const ok = JSON.stringify(a) === JSON.stringify(b);
  if (ok) pass++; else { fail++; console.error(`FAIL ${msg}\n  expected ${JSON.stringify(b)}\n  got      ${JSON.stringify(a)}`); }
}
const ok = (v, msg) => eq(!!v, true, msg);

const padAbs = (c, p) => {
  const th = ((c.rot || 0) * Math.PI) / 180, co = Math.cos(th), s = Math.sin(th);
  return { x: c.x + p.x * co + p.y * s, y: c.y - p.x * s + p.y * co };
};

const ST = {
  boardWidth: 40, boardHeight: 30,
  layerStack: [{ id: 'F.Cu', kind: 'copper' }, { id: 'B.Cu', kind: 'copper' }],
  components: [
    {
      ref: 'U1', part: 'SOIC-8', x: 10, y: 10, rot: 0, side: 'top', w: 6, h: 5, pads: [
        { num: 1, x: -2.7, y: -1.9, w: 1.5, h: 0.6, shape: 'rect', net: 'VCC', side: 'F' },
        { num: 2, x: -2.7, y: -0.6, w: 1.5, h: 0.6, shape: 'rect', net: 'SDA', side: 'F' },
        { num: 3, x: -2.7, y: 0.6, w: 1.5, h: 0.6, shape: 'rect', net: '', side: 'F' },
        { num: 4, x: -2.7, y: 1.9, w: 1.5, h: 0.6, shape: 'rect', net: 'GND', side: 'F' },
      ],
    },
    {
      ref: 'R1', part: 'R0603', x: 20, y: 10, rot: 90, side: 'top', w: 2.4, h: 1.4, pads: [
        { num: 1, x: -0.775, y: 0, w: 0.8, h: 0.9, shape: 'rect', net: 'SDA', side: 'F' },
        { num: 2, x: 0.775, y: 0, w: 0.8, h: 0.9, shape: 'rect', net: 'VCC', side: 'F' },
      ],
    },
    {
      ref: 'R2', part: 'R0603', x: 25, y: 20, rot: 0, side: 'bottom', w: 2.4, h: 1.4, pads: [
        { num: 1, x: -0.775, y: 0, w: 0.8, h: 0.9, shape: 'rect', net: 'GND', side: 'B' },
        { num: 2, x: 0.775, y: 0, w: 0.8, h: 0.9, shape: 'rect', net: 'SDA', side: 'B' },
      ],
    },
    // 機構孔：沒有 net，也不該進電測
    {
      ref: 'H1', part: 'MTG-M3', x: 3, y: 3, rot: 0, side: 'top', w: 6, h: 6, pads: [
        { num: 1, x: 0, y: 0, w: 6, h: 6, shape: 'circle', drill: 3.2, net: '', side: '*' },
      ],
    },
  ],
  traces: [{ x1: 12.7, y1: 10, x2: 19, y2: 10, layer: 'F.Cu', width: 0.25, net: 'SDA' }],
  vias: [{ x: 19, y: 10, d: 0.6, drill: 0.3, net: 'SDA' }],
};

(async () => {
  const mod = await import('./supabase/functions/_shared/odbpp.mjs');
  const r = mod.build(ST, padAbs, 'cmp');
  const get = s => r.files.find(f => f.name === 'cmp' + s);

  // ---- 1. 檔案存在 ----
  const eda = get('/steps/pcb/eda/data');
  const top = get('/steps/pcb/components/comp_+_top');
  const bot = get('/steps/pcb/components/comp_+_bot');
  ok(eda, '1.1 有 eda/data');
  ok(top, '1.2 有 comp_+_top');
  ok(bot, '1.3 有 comp_+_bot（R2 在底面）');
  ok(!/NaN|undefined/.test(eda.text + top.text + bot.text), '1.4 沒有 NaN / undefined');

  // ---- 2. netlist ----
  const netLines = eda.text.split('\n').filter(l => l.startsWith('NET '));
  eq(netLines.map(l => l.slice(4)), ['GND', 'SDA', 'VCC'], '2.1 三個 net，依字典序（可重現）');
  const netNum = {};
  eda.text.split('\n').forEach((l, i, arr) => {
    if (l.startsWith('NET ')) {
      const idx = /#NET (\d+)/.exec(arr[i + 1] || '');
      if (idx) netNum[l.slice(4)] = +idx[1];
    }
  });
  eq(netNum, { GND: 0, SDA: 1, VCC: 2 }, '2.2 net 編號與宣告順序一致');

  // ---- 3. 封裝 ----
  const pkgLines = eda.text.split('\n').filter(l => l.startsWith('PKG '));
  eq(pkgLines.length, 3, '3.1 三種封裝（SOIC-8 / R0603 / MTG-M3），R0603 用兩次只寫一次');
  const pinCount = eda.text.split('\n').filter(l => l.startsWith('PIN ')).length;
  eq(pinCount, 4 + 2 + 1, '3.2 PIN 總數 = 各封裝的 pad 數');
  ok(/PIN 1 0 /.test(eda.text), '3.3 機構孔的 PIN 標成通孔（type 0）');
  ok(/PIN 1 1 /.test(eda.text), '3.4 SMD 的 PIN 標成 1');

  // ---- 4. 元件與 toeprint ----
  const cmpTop = top.text.split('\n').filter(l => l.startsWith('CMP '));
  eq(cmpTop.length, 3, '4.1 頂面三顆（U1 / R1 / H1）');
  const cmpBot = bot.text.split('\n').filter(l => l.startsWith('CMP '));
  eq(cmpBot.length, 1, '4.2 底面一顆（R2）');
  ok(/CMP \d+ 10\.000000 -10\.000000 0\.000000 N U1 SOIC-8/.test(top.text), '4.3 U1 的座標與 Y 翻轉正確');
  ok(/ M R2 R0603/.test(bot.text), '4.4 底面元件標記 M（鏡射）');

  const topPrints = top.text.split('\n').filter(l => l.startsWith('TOP '));
  eq(topPrints.length, 4 + 2 + 1, '4.5 頂面 toeprint 數 = 各元件的 pad 數總和');

  // ---- 5. net 編號要指得到真的存在的 NET ----
  const maxNet = netLines.length - 1;
  const nums = [...top.text.matchAll(/^TOP \d+ \S+ \S+ \S+ [NM] (-?\d+) /gm)].map(m => +m[1]);
  ok(nums.length > 0, '5.1 抓得到 toeprint 的 net 編號');
  ok(nums.every(n => n === -1 || (n >= 0 && n <= maxNet)), '5.2 每個 net 編號都在有效範圍內');
  eq(nums.filter(n => n === -1).length, 2, '5.3 兩個沒接網路的 pad 標 -1（U1 第 3 腳與機構孔）');

  // U1 的四個 pad 依序是 VCC / SDA / (無) / GND
  const u1Block = top.text.slice(top.text.indexOf('CMP 0'), top.text.indexOf('#CMP 0'));
  const u1Nets = [...u1Block.matchAll(/^TOP \d+ \S+ \S+ \S+ [NM] (-?\d+) /gm)].map(m => +m[1]);
  eq(u1Nets, [netNum.VCC, netNum.SDA, -1, netNum.GND], '5.4 U1 每個 pad 的 net 對得上');

  // ---- 6. matrix ----
  const matrix = get('/matrix/matrix');
  eq((matrix.text.match(/TYPE=COMPONENT/g) || []).length, 2, '6.1 matrix 有兩筆 COMPONENT（top + bot）');
  ok(/NAME=COMP_\+_TOP/.test(matrix.text), '6.2 頂面元件層命名正確');
  ok(/NAME=COMP_\+_BOT/.test(matrix.text), '6.3 底面元件層命名正確');

  // ---- 7. 統計與可重現 ----
  eq(r.stats.components, 4, '7.1 統計回報 4 顆元件');
  eq(r.stats.nets, 3, '7.2 統計回報 3 個 net');
  const again = mod.build(ST, padAbs, 'cmp');
  eq(JSON.stringify(again.files), JSON.stringify(r.files), '7.3 連跑兩次輸出位元組相同');

  // ---- 8. 沒有元件的板子不可以產生空檔 ----
  {
    const bare = Object.assign({}, ST, { components: [] });
    const rb = mod.build(bare, padAbs, 'bare');
    eq(rb.files.some(f => /comp_\+_/.test(f.name)), false, '8.1 沒有元件就不產生 components 檔');
    const mx = rb.files.find(f => f.name === 'bare/matrix/matrix');
    eq((mx.text.match(/TYPE=COMPONENT/g) || []).length, 0, '8.2 matrix 也不列 COMPONENT');
  }
  {
    // 只有頂面元件時，不可以產生底面的空檔
    const topOnly = Object.assign({}, ST, { components: ST.components.filter(c => c.side !== 'bottom') });
    const rt = mod.build(topOnly, padAbs, 'topo');
    eq(rt.files.some(f => f.name.endsWith('comp_+_bot')), false, '8.3 沒有底面元件就不產生 comp_+_bot');
    eq(rt.files.some(f => f.name.endsWith('comp_+_top')), true, '8.4 頂面的還是要有');
    const mx = rt.files.find(f => f.name === 'topo/matrix/matrix');
    eq((mx.text.match(/TYPE=COMPONENT/g) || []).length, 1, '8.5 matrix 只列一筆');
  }

  // ---- 阻焊 / 鋼網 / 絲印 / subnet（2026-08-31 補）----
// 這四樣以前完全沒有，板廠只能回頭去看 Gerber。新加的東西最容易出的錯是
// 「matrix 列了層但沒有檔」與「規則跟 Gerber 包不一致」——兩個都是安靜的錯：
// CAM 打得開，只是一面空的、或開窗規則兩包不同。
{
  const padAbs2 = (c, p2) => ({ x: c.x + (p2.x || 0), y: c.y + (p2.y || 0) });
  const st2 = {
    boardWidth: 40, boardHeight: 30,
    layerStack: [{ id: 'F.Cu', kind: 'copper' }, { id: 'B.Cu', kind: 'copper' }],
    components: [{
      ref: 'U1', part: 'IC', x: 0, y: 0, w: 4, h: 4, rot: 0, side: 'top',
      pads: [
        { num: '1', x: -1.5, y: 0, w: 0.6, h: 0.9, side: 'F', net: 'A' },
        { num: '2', x: 1.5, y: 0, w: 0.6, h: 0.9, side: 'F', net: 'B' },
        { num: '3', x: 0, y: 1.8, w: 1, h: 1, side: '*', drill: 0.5, net: 'A' },
        { num: '4', x: 0, y: -1.8, w: 1, h: 1, side: 'F', paste: false, net: 'B' }
      ],
      silk: [{ kind: 'line', x1: -2, y1: -2, x2: 2, y2: -2, w: 0.12, side: 'F' }],
      silkTexts: [{ text: 'U1', x: 0, y: -3, size: 1, side: 'F' }]
    }],
    traces: [], vias: [], userZones: [], zoneFills: [], teardrops: [], silkGr: []
  };
  const r2 = mod.build(st2, padAbs2, 'x');
  const has = n => r2.files.some(f => f.name.endsWith(n));
  const file = n => (r2.files.find(f => f.name.endsWith(n)) || {}).text || '';
  const mx = file('/matrix/matrix');

  ok(has('/layers/sm_top/features'), '6.1 有頂面阻焊');
  ok(has('/layers/sp_top/features'), '6.2 有頂面鋼網');
  ok(has('/layers/ss_top/features'), '6.3 有頂面絲印');
  ok(/TYPE=SOLDER_MASK/.test(mx) && /TYPE=SOLDER_PASTE/.test(mx) && /TYPE=SILK_SCREEN/.test(mx),
     '6.4 matrix 要列出三種型別（不列＝CAM 看不到）');

  // 每個 matrix 列的層都要有檔：列了沒檔＝CAM 顯示空層，跟「這面沒東西」分不出來
  const named = [...mx.matchAll(/NAME=(\S+)/g)].map(x => x[1].toLowerCase())
    .filter(n => n !== 'pcb' && !/^comp_/.test(n));
  const missing = named.filter(n => !has('/layers/' + n + '/features'));
  eq(missing, [], '6.5 matrix 列的每一層都要有 features 檔');

  // ROW 不可以重號：重號的症狀是 CAM 端層序錯亂——打得開、層是錯的
  const rows = [...mx.matchAll(/ROW=(\d+)/g)].map(x => +x[1]);
  eq(rows.length, new Set(rows).size, '6.6 ROW 不重號');

  // 開窗規則要跟 Gerber 包一致：阻焊＝所有銅 pad（含穿孔）；鋼網＝只有 SMD 且未標 paste:false
  eq((file('/layers/sm_top/features').match(/^P /gm) || []).length, 4, '6.7 阻焊開窗＝該面 4 顆銅 pad');
  eq((file('/layers/sp_top/features').match(/^P /gm) || []).length, 2, '6.8 鋼網只有 SMD 且排除 paste:false');

  // 絲印文字沒輸出要講出來（ODB++ 的字型是另一套資料結構，半套寫出去會是亂碼）
  ok(r2.warnings.some(w => w.k === 'odb_w_silktext'), '6.9 有絲印文字時要警告沒輸出');

  // subnet：CAM 網表比對的依據。只有 NET 名稱的話，對方不知道它接到哪裡
  const eda2 = file('/eda/data');
  const snt = (eda2.match(/^SNT TOP \d+ \d+$/gm) || []);
  eq(snt.length, 4, '6.10 四顆有 net 的 pad → 四筆 subnet');
  ok(/NET A\r?\n#NET 0/.test(eda2), '6.11 #NET 編號仍緊接在 NET 之後（既有解析靠這個）');

  // 空的那一面不可以產空檔
  ok(!has('/layers/ss_bot/features'), '6.12 底面沒有絲印就不要產檔');
}

console.log(`\nodb-cmp.test: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
