/**
 * sch2pcb.test.js — 線路圖 → PCB 轉換驗證（node，無瀏覽器）
 *
 * 舊版把每個元件都當 IC、pad 一律 1.2×1.2mm 方塊、位置是符號腳位座標乘 0.08。
 * 飛線會出來、DRC 跑得動，看起來像成功了，但那片板做不出來。
 * 所以這支的重點是：**出來的封裝是真的嗎**，以及**對不出來的有沒有誠實講**。
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

global.window = {};
require('./parts-lib.js');
require('./ic-data.js');
require('./footprint-gen.js');
global.PartsLib = window.PartsLib;
global.FootprintGen = window.FootprintGen;
global.IC_DATA = window.IC_DATA || [];
const S = require('./pcb-sch2pcb.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL: ' + m); } };
const eq = (a, b, m) => ok(a === b, `${m} (得 ${JSON.stringify(a)}，期望 ${JSON.stringify(b)})`);

const PINS = { resistor: 2, capacitor: 2, inductor: 2, led: 2, diode: 2, fuse: 2, xtal: 2, bead: 2,
  npn: 3, pnp: 3, nmos: 3, pmos: 3, io: 1, vrail: 1, ground: 1, switch: 2 };
const anIC = IC_DATA.find(x => (x.pins || []).length >= 8) || IC_DATA[0];
const getPins = c => {
  if (S.IC_TYPES.indexOf(c.type) >= 0) {
    const ic = IC_DATA.find(x => x.part === c.name);
    const n = ic ? (ic.pins || []).length : 8;
    return Array.from({ length: n }, (_, i) => ({ name: String(i + 1), index: i }));
  }
  return Array.from({ length: PINS[c.type] || 2 }, (_, i) => ({ name: String(i + 1), index: i }));
};
const netOf = (id, i) => 'N_' + id + '_' + i;

// ============ 1) 封裝必須是真的，不是方塊 ============
{
  ok(IC_DATA.length >= 190, `1 IC_DATA 應載入（得 ${IC_DATA.length}），否則這支等於沒驗`);

  const r = S.mapFootprint({ id: 'r', type: 'resistor', label: 'R1' }, {});
  ok(r.ok, '1 電阻應對得到封裝');
  eq(r.source, 'partslib', '1 電阻應走 PartsLib');
  eq(r.variant, '0603', '1 電阻預設 0603');
  eq(r.pads.length, 2, '1 0603 應有 2 個 pad');
  // 跟 PartsLib 直接建出來的必須完全一致（不可自己編尺寸）
  const ref0603 = PartsLib.build('res', '0603');
  eq(JSON.stringify(r.pads), JSON.stringify(ref0603.pads), '1 pad 幾何必須與 PartsLib 一字不差');
  eq(JSON.stringify(r.body), JSON.stringify(ref0603.body), '1 body 必須與 PartsLib 一致');
  // 舊版的病徵：1.2×1.2 方 pad。任何一個 pad 長這樣就是又退回去了
  ok(!r.pads.some(p => Math.abs(p.w - 1.2) < 1e-9 && Math.abs(p.h - 1.2) < 1e-9),
     '1 不可再出現 1.2×1.2mm 的假 pad');
  ok(r.body.w > 0 && r.body.h > 0 && r.body.w !== r.body.h, '1 0603 本體應為長方形，不是正方形');

  const q = S.mapFootprint({ id: 'q', type: 'npn', label: 'Q1' }, {});
  eq(q.pads.length, 3, '1 電晶體 SOT-23 應有 3 個 pad');
  eq(q.variant, 'SOT-23', '1 電晶體預設 SOT-23');

  const x = S.mapFootprint({ id: 'x', type: 'xtal', label: 'Y1' }, {});
  eq(x.pads.length, 2, '1 石英振盪器預設應選 2-pad，才對得上符號的 2 腳');

  const u = S.mapFootprint({ id: 'u', type: 'ic', label: 'U1', name: anIC.part }, {});
  ok(u.ok, '1 IC 應對得到封裝');
  eq(u.source, 'ic', '1 IC 應走 FootprintGen');
  eq(u.pads.length, (anIC.pins || []).length, '1 IC 的 pad 數應等於資料裡的腳數');
  eq(JSON.stringify(u.pads), JSON.stringify(FootprintGen.fromIC(anIC).pads), '1 IC pad 應與產生器一致');

  // 覆寫要生效
  const ov = S.mapFootprint({ id: 'r', type: 'resistor' }, { overrides: { r: { lib: 'res', variant: '1206' } } });
  eq(ov.variant, '1206', '1 覆寫應改變變體');
  ok(ov.body.w > ref0603.body.w, '1 1206 應比 0603 大');
}

// ============ 2) 對不出來的要講出來，不可靜靜編一個 ============
{
  eq(S.mapFootprint({ id: 'g', type: 'ground' }, {}).reason, 'nonPhysical', '2 接地符號屬非實體');
  eq(S.mapFootprint({ id: 't', type: 'text' }, {}).reason, 'nonPhysical', '2 文字屬非實體');
  eq(S.mapFootprint({ id: 's', type: 'switch' }, {}).reason, 'noMapping', '2 沒有映射的型別要回 noMapping');
  eq(S.mapFootprint({ id: 'i', type: 'ic', name: '不存在的料號' }, {}).reason, 'icNotInLibrary',
     '2 元件庫裡沒有的 IC 要回 icNotInLibrary');
  eq(S.mapFootprint({ id: 'i2', type: 'ic', name: '' }, {}).reason, 'icNotInLibrary', '2 沒填料號的 IC 也要標出來');
  eq(S.mapFootprint({ id: 'r', type: 'resistor' }, { overrides: { r: { lib: 'res', variant: '9999' } } }).reason,
     'variantNotFound', '2 不存在的變體要回 variantNotFound');
}

// ============ 2b) 沒有唯一正解的符號：給預設但要標「這是假設」 ============
{
  const src = S.mapFootprint({ id: 'v', type: 'source', label: 'V1' }, {});
  ok(src.ok, '2b 電源符號應給得出預設封裝（不要讓使用者拿到一片沒有電源接口的板）');
  eq(src.assumed, true, '2b 電源符號的封裝必須標成假設');
  eq(src.variant, '2P', '2b 電源預設 2P 端子台');
  eq(src.pads.length, 2, '2b 端子台 2P 應有 2 個 pad，對得上 +/- 兩腳');

  // 明確映射的不可被標成假設
  eq(S.mapFootprint({ id: 'r', type: 'resistor' }, {}).assumed, false, '2b 電阻是明確映射，不可標假設');
  eq(S.mapFootprint({ id: 'q', type: 'npn' }, {}).assumed, false, '2b 電晶體是明確映射，不可標假設');

  // 使用者自己指定過就不再算假設
  const ov = S.mapFootprint({ id: 'v', type: 'source' }, { overrides: { v: { lib: 'hdr', variant: '1×2' } } });
  eq(ov.assumed, false, '2b 使用者覆寫後不應再標假設');
  eq(ov.variant, '1×2', '2b 覆寫應生效');

  // convert 要把假設的分開列，不可混進 unresolved
  const sch = [
    { id: 'v', type: 'source', x: 0, y: 0, label: 'V1' },
    { id: 'r', type: 'resistor', x: 100, y: 0, label: 'R1' },
    { id: 's', type: 'switch', x: 200, y: 0, label: 'SW1' }
  ];
  const conv = S.convert(sch, getPins, netOf, {});
  eq(conv.assumed.length, 1, '2b 應有 1 個用了假設封裝');
  eq(conv.assumed[0].label, 'V1', '2b 假設的是 V1');
  eq(conv.unresolved.length, 1, '2b 真的對不出來的仍要單獨列');
  eq(conv.unresolved[0].label, 'SW1', '2b 對不出來的是 SW1');
  eq(conv.stats.placed, 2, '2b 假設封裝的元件要真的放上板');
  const v = conv.components.find(c => c.ref === 'V1');
  eq(v.footprintAssumed, true, '2b 放上板的元件要帶著假設標記，之後 UI 才提示得出來');
  eq(conv.components.find(c => c.ref === 'R1').footprintAssumed, false, '2b 明確映射的不帶假設標記');
}

// ============ 3) net 綁到正確的腳 ============
{
  // 被動件：照順序
  const r = S.mapFootprint({ id: 'r', type: 'resistor' }, {});
  const b = S.bindNets(r.pads, [{ name: '1', index: 0 }, { name: '2', index: 1 }], netOf, 'r');
  eq(b.pads[0].net, 'N_r_0', '3 pad1 應接到腳 0');
  eq(b.pads[1].net, 'N_r_1', '3 pad2 應接到腳 1');
  eq(b.notes.length, 0, '3 腳數相同時不應有註記');

  // IC：照 pad.num 對腳號，不是照陣列順序
  const u = S.mapFootprint({ id: 'u', type: 'ic', name: anIC.part }, {});
  const n = u.pads.length;
  // 故意把腳位順序打亂：若實作是照 index 綁，就會綁錯
  const shuffled = Array.from({ length: n }, (_, i) => ({ name: String(n - i), index: n - 1 - i }));
  const bu = S.bindNets(u.pads, shuffled, netOf, 'u');
  ok(bu.matchedByNum === n, `3 IC 應全部以 pad.num 對到腳號（得 ${bu.matchedByNum}/${n}）`);
  const pad1 = bu.pads.find(p => p.num === '1');
  eq(pad1.net, 'N_u_0', '3 打亂順序後 pad「1」仍應接到腳號 1（index 0）');

  // 封裝 pad 比腳多（例如帶散熱 pad）：多的留空並註記，不可亂接
  const extra = S.bindNets(u.pads, [{ name: '1', index: 0 }], netOf, 'u');
  ok(extra.notes.indexOf('extraPads') >= 0, '3 pad 比腳多時要註記 extraPads');
  eq(extra.pads.filter(p => p.net).length, 1, '3 多出來的 pad 不可亂接 net');

  // 原始 pad 陣列不可被改到
  eq(r.pads[0].net, '', '3 bindNets 不可污染來源封裝');
}

// ============ 4) 整體轉換 ============
{
  const sch = [
    { id: 'a', type: 'resistor', x: 100, y: 100, label: 'R1' },
    { id: 'b', type: 'capacitor', x: 200, y: 100, label: 'C1' },
    { id: 'c', type: 'npn', x: 300, y: 100, label: 'Q1' },
    { id: 'd', type: 'ic', x: 400, y: 200, label: 'U1', name: anIC.part },
    { id: 'e', type: 'ground', x: 100, y: 300, label: 'GND' },
    { id: 'f', type: 'switch', x: 500, y: 100, label: 'SW1' }
  ];
  const r = S.convert(sch, getPins, netOf, {});
  eq(r.components.length, 4, '4 應放上 4 個實體元件');
  eq(r.stats.bySource.partslib, 3, '4 其中 3 個走 PartsLib');
  eq(r.stats.bySource.ic, 1, '4 其中 1 個走 IC 產生器');
  eq(r.unresolved.length, 1, '4 應有 1 個對不出來');
  eq(r.unresolved[0].label, 'SW1', '4 對不出來的是 SW1');
  ok(!r.unresolved.some(u => u.type === 'ground'), '4 非實體符號不該被列成「對不出來」');

  // refdes 沿用線路圖的，不可重編
  const refs = r.components.map(c => c.ref).sort();
  eq(refs.join(','), 'C1,Q1,R1,U1', '4 refdes 應沿用線路圖');

  // 每個 pad 都要有 net（這片測試電路每一腳都有接）
  const noNet = r.components.reduce((a, c) => a + c.pads.filter(p => !p.net).length, 0);
  eq(noNet, 0, '4 每個 pad 都應綁到 net');

  // 擺位：不可互相重疊
  let overlap = 0;
  for (let i = 0; i < r.components.length; i++)
    for (let j = i + 1; j < r.components.length; j++) {
      const a = r.components[i], b = r.components[j];
      if (Math.abs(a.x - b.x) < (a.w + b.w) / 2 && Math.abs(a.y - b.y) < (a.h + b.h) / 2) overlap++;
    }
  eq(overlap, 0, '4 擺位後元件不可互相重疊');

  // 擺位要反映線路圖的相對關係（R1 在 C1 左邊、C1 在 Q1 左邊）
  const at = ref => r.components.find(c => c.ref === ref);
  ok(at('R1').x < at('C1').x, '4 應保留線路圖的左右關係（R1 在 C1 左）');
  ok(at('C1').x < at('Q1').x, '4 應保留線路圖的左右關係（C1 在 Q1 左）');
  ok(at('U1').y > at('R1').y, '4 應保留上下關係（U1 在下方）');

  // 板框建議要包得住所有元件
  const bd = S.suggestBoard(r.components, 5);
  const fits = r.components.every(c =>
    Math.abs(c.x) + c.w / 2 <= bd.w / 2 + 1e-6 && Math.abs(c.y) + c.h / 2 <= bd.h / 2 + 1e-6);
  ok(fits, `4 建議板框 ${bd.w}×${bd.h} 應包得住所有元件`);

  // 空輸入不可爆
  const empty = S.convert([], getPins, netOf, {});
  eq(empty.components.length, 0, '4 空線路圖應回空陣列');
  eq(S.suggestBoard([], 5).w > 0, true, '4 沒有元件時板框建議仍要合法');
}

// ============ 5) 腳數對不上要擋下來 ============
{
  // 用一個 3 腳的符號去配 2-pad 封裝：pad 不夠掛，必須拒絕而不是漏接
  const sch = [{ id: 'z', type: 'resistor', x: 0, y: 0, label: 'R9' }];
  const threePins = () => [{ name: '1', index: 0 }, { name: '2', index: 1 }, { name: '3', index: 2 }];
  const r = S.convert(sch, threePins, netOf, {});
  eq(r.components.length, 0, '5 pad 少於腳數時不可放上去');
  eq(r.unresolved[0].reason, 'pinCountMismatch', '5 應回報腳數不符');
  eq(r.unresolved[0].pads, 2, '5 應說出封裝有幾個 pad');
  eq(r.unresolved[0].pins, 3, '5 應說出符號有幾隻腳');
}

// ============ 6) 擺位演算法本身 ============
{
  const mk = (id, x, y, w, h) => ({ id, ref: id, x: 0, y: 0, w, h, pads: [], _sch: { x, y } });
  // 全部疊在同一點：推開後不可還有重疊
  const stack = [mk('a', 0, 0, 3, 3), mk('b', 0, 0, 3, 3), mk('c', 0, 0, 3, 3), mk('d', 0, 0, 3, 3)];
  S.place(stack, { scale: 0.15, spacing: 1 });
  let ov = 0;
  for (let i = 0; i < stack.length; i++)
    for (let j = i + 1; j < stack.length; j++)
      if (Math.abs(stack[i].x - stack[j].x) < 3 && Math.abs(stack[i].y - stack[j].y) < 3) ov++;
  eq(ov, 0, '6 完全重疊的元件推開後不可還重疊');

  // 已經分開的不該被亂動
  const spread = [mk('a', 0, 0, 1, 1), mk('b', 1000, 0, 1, 1)];
  S.place(spread, { scale: 0.15, spacing: 1 });
  ok(Math.abs(spread[1].x - spread[0].x - 150) < 1e-6, '6 已分開的元件間距應照比例縮放，不被推動');

  // 縮放比例要生效
  const two = [mk('a', 0, 0, 1, 1), mk('b', 100, 0, 1, 1)];
  S.place(two, { scale: 0.3, spacing: 1 });
  ok(Math.abs(two[1].x - two[0].x - 30) < 1e-6, '6 scale=0.3 時 100px 應變成 30mm');

  // 單一元件應置中
  const one = [mk('a', 999, 999, 2, 2)];
  S.place(one, {});
  ok(Math.abs(one[0].x) < 1e-9 && Math.abs(one[0].y) < 1e-9, '6 單一元件應置中於原點');
}

console.log(`\nsch2pcb.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
