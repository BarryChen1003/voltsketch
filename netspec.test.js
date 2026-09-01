/**
 * netspec.test.js — 受控阻抗規格表（supabase/functions/_shared/netspec.mjs）
 *
 * 這張表是「使用者要求的阻抗有沒有傳到板廠」的唯一出口。它最惡的兩種失敗都不會噴錯：
 *   1. 沒有任何 net 設過屬性時仍然產一張空表 → 板廠以為這片板沒有阻抗要求。
 *   2. 有要求但那條 net 還沒繞 → 表上留白，看起來像漏印，板廠只能自己猜。
 * 所以第 1 節守「沒有就不要產」，第 3 節守「沒繞要寫 NOT ROUTED」。
 *
 * 另外守一條界線：**這裡不重算阻抗**。IPC-2141 的公式在 pcb-nets.js 只有一份，
 * 在匯出端再寫一份，分岔的症狀是「畫面說 50Ω、送廠的檔說 47Ω」。
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { buildNetSpec } = require('./supabase/functions/_shared/netspec.mjs');
// 換行字元用 fromCharCode 組：字面跳脫在幾層轉寫裡被吃掉過。
const NLC = String.fromCharCode(10);

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL: ' + m); } };
const eq = (a, b, m) => ok(a === b, `${m} (得 ${JSON.stringify(a)}，期望 ${JSON.stringify(b)})`);

const tr = (net, w, layer, x2) => ({ x1: 0, y1: 0, x2: x2 || 10, y2: 0, width: w, layer: layer || 'F.Cu', net });

// ---- 1. 沒有要求就不要產表 ----
{
  eq(buildNetSpec({ netProps: {}, traces: [] }), null, '1.1 完全沒設屬性回 null');
  eq(buildNetSpec({}), null, '1.2 沒有 netProps 也回 null');
  // 只有空物件（面板開過又清掉）也不算有要求
  eq(buildNetSpec({ netProps: { GND: {} }, traces: [] }), null, '1.3 空屬性不算要求');
  // 有 note 也算要求：那是使用者寫給板廠看的
  ok(buildNetSpec({ netProps: { GND: { note: 'keep away from switching' } }, traces: [] }), '1.4 只有備註也要產');
}

// ---- 2. 目標值照抄，容差有預設 ----
{
  const r = buildNetSpec({
    netProps: { USB_DP: { z0: 90, zdiff: 90, ztol: 7, pair: 'USB_DN' }, CLK: { z0: 50 } },
    traces: [tr('USB_DP', 0.25), tr('CLK', 0.3)]
  }, { name: 'demo' });
  eq(r.rows.length, 2, '2.1 兩個 net');
  eq(r.rows[0].net, 'CLK', '2.2 依名字排序，輸出才穩定');
  eq(r.rows[0].tol, 10, '2.3 沒寫容差用 10%');
  eq(r.rows[1].tol, 7, '2.4 寫了就照寫');
  eq(r.rows[1].pair, 'USB_DN', '2.5 配對 net 要帶出去');
  ok(r.text.indexOf('USB_DP') > 0 && r.text.indexOf('90') > 0, '2.6 文字表含 net 與目標值');
  ok(r.text.indexOf('IPC-2141') > 0, '2.7 表上要講清楚計算值在哪，不重算');
}

// ---- 3. 幾何量的是真的走線 ----
{
  const r = buildNetSpec({
    netProps: { A: { z0: 50 }, B: { z0: 50 } },
    traces: [tr('A', 0.2, 'F.Cu'), tr('A', 0.25, 'In1.Cu'), tr('A', 0.2, 'F.Cu')]
  });
  const a = r.rows.find(x => x.net === 'A'), b = r.rows.find(x => x.net === 'B');
  eq(a.widths.join(','), '0.2,0.25', '3.1 線寬去重且排序');
  eq(a.layers.join('/'), 'F.Cu/In1.Cu', '3.2 用到的層都列出來');
  eq(a.routed, true, '3.3 有走線');
  eq(b.routed, false, '3.4 有要求但沒繞');
  ok(r.text.indexOf('NOT ROUTED') > 0, '3.5 沒繞要明講，不可以留白讓人以為漏印');
}

// ---- 4. 零長度線段不算走線 ----
{
  const r = buildNetSpec({
    netProps: { Z: { z0: 50 } },
    traces: [{ x1: 5, y1: 5, x2: 5, y2: 5, width: 0.3, layer: 'F.Cu', net: 'Z' }]
  });
  eq(r.rows[0].routed, false, '4.1 零長度的殘段不算已繞（不然會報一個假的線寬）');
}

// ---- 5. 真的進了打包 ----
{
  const g = fs.readFileSync(path.join(__dirname, 'supabase/functions/_shared/gerber.mjs'), 'utf8');
  ok(g.indexOf('netspec.mjs') > 0, '5.1 gerber.mjs 有引用');
  ok(g.indexOf('NetSpec') > 0, '5.2 打包裡有這個檔名');
  // 沒有要求時不可以塞一個空檔進去
  ok(/netSpec\s*&&|if\s*\(\s*netSpec/.test(g), '5.3 沒有要求就不加檔');
}

// ---- 6. 三包檔要說同一件事（Gerber / ODB++ / IPC-2581）----
// 這一節防的是最貴的一種分岔：三個匯出端各自抄一份阻抗，板廠拿到兩包檔、兩個數字。
// 這裡不比「格式對不對」（那要真 CAM 才算數），只比「同一個要求有沒有以同一個值送出去」。
(async () => {
  const padAbs = (c, p) => ({ x: c.x + p.x, y: c.y + p.y });
  const st = () => ({
    layerStack: [{ id: 'F.Cu', kind: 'copper' }, { id: 'B.Cu', kind: 'copper' }],
    boardWidth: 20, boardHeight: 20, edgeSegs: [],
    components: [{ ref: 'U1', part: 'X', x: 0, y: 0, rot: 0, side: 'top', w: 2, h: 2,
      pads: [{ num: 1, x: 0, y: 0, w: 1, h: 1, shape: 'rect', net: 'CLK', side: 'F' }] }],
    traces: [{ x1: 0, y1: 0, x2: 5, y2: 0, layer: 'F.Cu', width: 0.2, net: 'CLK' }],
    vias: [], userZones: [], keepouts: [], zoneFills: [], teardrops: [],
    netProps: { CLK: { z0: 50, ztol: 8 }, USB_DP: { zdiff: 90, pair: 'USB_DM' } }
  });

  const odbm = await import('./supabase/functions/_shared/odbpp.mjs');
  const ipcm = await import('./supabase/functions/_shared/ipc2581.mjs');
  const germ = await import('./supabase/functions/_shared/gerber.mjs');

  const withProps = st();
  const spec = buildNetSpec(withProps, { name: 'demo' });

  const ger = germ.build(withProps, padAbs, 'demo');
  const gerFile = ger.files.find(f => f.name.indexOf('NetSpec') >= 0);
  ok(!!gerFile, '6.1 Gerber 包有 -NetSpec.txt');
  eq(gerFile && gerFile.text, spec.text, '6.2 Gerber 那份來自同一個產生器');

  const odb = odbm.build(withProps, padAbs, 'demo');
  const odbFile = odb.files.find(f => f.name.endsWith('/misc/netspec.txt'));
  ok(!!odbFile, '6.3 ODB++ 包有 misc/netspec.txt');
  eq(odbFile && odbFile.text, spec.text, '6.4 ODB++ 那份與 Gerber 那份是同一段文字');

  const eda = odb.files.find(f => f.name.endsWith('/eda/data'));
  const impLines = eda.text.split(NLC).filter(l => l.indexOf('#IMP ') === 0);
  eq(impLines.length, 1, '6.5 只有已在板上的 CLK 有 #IMP（USB_DP 沒幾何，不塞進 netlist）');
  ok(impLines[0].indexOf('Z0=50') > 0, '6.6 #IMP 帶設計端的目標值');
  ok(impLines[0].indexOf('TOL=8') > 0, '6.7 容差要帶（沒有容差的目標板廠做不了）');
  ok(impLines[0].indexOf('LAYERS=F.Cu') > 0, '6.8 帶實際走線的層');
  eq(eda.text.indexOf('ATTR'), -1, '6.9 不可以自創沒在 attrlist 宣告的 ODB++ ATTR');

  const xml = ipcm.build(withProps, padAbs, 'demo').files[0].text;
  const netBlock = n => {
    const i = xml.indexOf('<LogicalNet name="' + n + '">');
    return i < 0 ? '' : xml.slice(i, xml.indexOf('</LogicalNet>', i));
  };
  ok(netBlock('CLK').indexOf('name="impedanceZ0Ohm" value="50"') > 0, '6.10 IPC-2581 帶同一個 Z0');
  ok(netBlock('CLK').indexOf('name="impedanceTolerancePercent" value="8"') > 0, '6.11 IPC-2581 帶同一個容差');
  ok(netBlock('USB_DP').indexOf('value="90"') > 0, '6.12 有要求但還沒繞的 net 也要留在檔裡');
  ok(netBlock('USB_DP').indexOf('NOT_ROUTED') > 0, '6.13 沒繞要明講，不可以留白');
  ok(netBlock('USB_DP').indexOf('differentialPairNet" value="USB_DM"') > 0, '6.14 配對關係要帶出去');

  const bare = st(); delete bare.netProps;
  const g2 = germ.build(bare, padAbs, 'demo');
  const o2 = odbm.build(bare, padAbs, 'demo');
  const x2 = ipcm.build(bare, padAbs, 'demo').files[0].text;
  eq(g2.files.filter(f => f.name.indexOf('NetSpec') >= 0).length, 0, '6.15 沒要求時 Gerber 不產表');
  eq(o2.files.filter(f => f.name.endsWith('/misc/netspec.txt')).length, 0, '6.16 沒要求時 ODB++ 不產表');
  eq(o2.files.find(f => f.name.endsWith('/eda/data')).text.indexOf('#IMP '), -1, '6.17 沒要求時沒有 #IMP');
  eq(x2.indexOf('impedanceZ0Ohm'), -1, '6.18 沒要求時 XML 不帶阻抗屬性');

  const info = odb.files.find(f => f.name.endsWith('/misc/info')).text;
  const matrix = odb.files.find(f => f.name.endsWith('/matrix/matrix')).text;
  const declared = Number((info.split('LAYERS_COUNT=')[1] || '').split(NLC)[0]);
  const actual = matrix.split('LAYER ').length - 1;
  eq(declared, actual, '6.19 misc/info 宣告的層數要等於 matrix 實際列出的層數');

  console.log(`\nnetspec.test: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
