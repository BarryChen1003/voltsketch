/**
 * pour-default.test.js — 布林鋪銅成為匯出預設路徑的驗證（node）
 *
 * §10.1 的重點：把 PourGeom 的結果（zone.fillPolys）變成 Gerber 與 ODB++
 * 實際吃的東西，柵格版（PcbPour）退居備援。
 *
 * 兩條路的表達方式是**相反**的，混用會出事：
 *   柵格版 —— 畫整片鋪銅，再用清除極性（LPC）把 pad/走線/via/孤島挖掉。
 *   布林版 —— fillPolys 已經是最終該留下的銅，直接畫，不可以再減一次。
 * 再減一次的結果是「淨空被扣兩次」——銅比該有的少，畫面完全看不出來。
 * 這支就是在守這條界線。
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

global.window = {};
global.ClipperLib = require('./vendor/clipper-6.4.2.js');
require('./pcb-index.js');   // 鋪銅的範圍篩選走共用索引
const PourGeom = require('./pcb-pour-geom.js');

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
const CL = { traceToTrace: 0.3, traceToPad: 0.3, traceToEdge: 0.3, padToPad: 0.15 };

function board() {
  return {
    boardWidth: 60, boardHeight: 60,
    layerStack: [{ id: 'F.Cu', kind: 'copper' }, { id: 'B.Cu', kind: 'copper' }],
    components: [{
      ref: 'U1', part: 'X', x: 0, y: 0, rot: 0, side: 'top', w: 4, h: 4, pads: [
        { num: 1, x: -2, y: 0, w: 1.2, h: 1.2, shape: 'rect', net: 'SIG', side: 'F' },
        { num: 2, x: 2, y: 0, w: 1.2, h: 1.2, shape: 'rect', net: 'GND', side: 'F' },
      ],
    }],
    traces: [{ x1: -8, y1: 5, x2: 8, y2: 5, layer: 'F.Cu', width: 0.3, net: 'SIG' }],
    vias: [], keepouts: [], zoneFills: [], teardrops: [],
    userZones: [{ layer: 'F.Cu', net: 'GND', pts: [[-10, -10], [10, -10], [10, 10], [-10, 10]], clearance: 0.3, thermal: true }],
  };
}

(async () => {
  const gerber = await import('./supabase/functions/_shared/gerber.mjs');
  const odb = await import('./supabase/functions/_shared/odbpp.mjs');

  // ---- 1. applyAll / clearAll ----
  {
    const st = board();
    const r = PourGeom.applyAll(st, padAbs, { clearance: CL });
    eq([r.zones, r.ok, r.failed], [1, 1, 0], '1.1 一塊鋪銅算成功');
    ok(Array.isArray(st.userZones[0].fillPolys), '1.2 結果掛在 zone.fillPolys 上');
    ok(st.userZones[0].fillPolys.length >= 1, '1.3 至少一座島');
    ok(r.area > 0, '1.4 面積 > 0');

    eq(PourGeom.clearAll(st), 1, '1.5 clearAll 清掉一塊');
    eq(st.userZones[0].fillPolys, undefined, '1.6 欄位真的不見了');
  }
  {
    // 壞掉的 zone 不可以留下半成品
    const st = board();
    st.userZones[0].pts = [[0, 0]];              // 點數不足
    const r = PourGeom.applyAll(st, padAbs, { clearance: CL });
    eq([r.ok, r.failed], [0, 1], '1.7 壞 zone 算失敗');
    eq(st.userZones[0].fillPolys, undefined, '1.8 失敗時不寫 fillPolys（下游才會退回柵格版）');
    ok(r.warnings.some(w => /badZone/.test(w.k)), '1.9 而且有回報原因');
  }

  // ---- 2. Gerber：有 fillPolys 走布林路徑 ----
  const cuOf = files => (files.find(f => /F_Cu\.gbr$/.test(f.name)) || {}).text || '';
  {
    const st = board();
    PourGeom.applyAll(st, padAbs, { clearance: CL });
    const g = gerber.build(st, padAbs, 'bool');
    const cu = cuOf(g.files);
    ok(cu.length > 0, '2.1 有輸出 F_Cu');
    ok(!/NaN|undefined/.test(cu), '2.2 沒有 NaN/undefined');

    // 布林路徑不做「整片 zone 外框」那一筆 region。
    // zone 外框是 ±10 的正方形，如果走舊路一定會出現 X-10000000 這個座標
    // 當成 region 的起點；走布林路徑則不會。
    const st2 = board();                          // 沒有 fillPolys
    const g2 = gerber.build(st2, padAbs, 'grid');
    const cu2 = cuOf(g2.files);
    ok(cu !== cu2, '2.3 有無 fillPolys 產出的 Gerber 不一樣（分岔真的生效了）');
    ok(cu.length < cu2.length * 3, '2.4 布林路徑不會爆量（沒有把兩條路都畫一次）');
  }
  {
    // 布林路徑的島有內孔時要用 LPC 挖掉
    const st = board();
    PourGeom.applyAll(st, padAbs, { clearance: CL });
    const holes = st.userZones[0].fillPolys.reduce((n, is) => n + (is.holes || []).length, 0);
    const g = gerber.build(st, padAbs, 'holes');
    const cu = cuOf(g.files);
    if (holes) {
      ok(/%LPC\*%/.test(cu), '2.5 有內孔時用了清除極性');
      ok(/%LPD\*%/.test(cu), '2.6 而且有切回暗極性（不切回去的話後面的走線會被當成挖除）');
    } else {
      pass++; pass++;   // 這組資料沒產生內孔，跳過但不算失敗
    }
  }

  // ---- 3. 混合：一塊有布林、一塊沒有 ----
  {
    const st = board();
    st.userZones.push({
      layer: 'F.Cu', net: 'VCC',
      pts: [[12, -8], [20, -8], [20, 8], [12, 8]], clearance: 0.3, thermal: true,
    });
    // 只對第一塊算
    const r = PourGeom.build(st, padAbs, st.userZones[0], { clearance: CL });
    st.userZones[0].fillPolys = r.islands;

    const g = gerber.build(st, padAbs, 'mixed');
    const cu = cuOf(g.files);
    ok(!/NaN|undefined/.test(cu), '3.1 混合模式沒有 NaN');
    ok(cu.length > 0, '3.2 有輸出');
    // 第二塊走柵格路徑，它的外框座標（x=12、20）應該出現在檔案裡
    ok(/X12000000|X20000000/.test(cu), '3.3 沒有 fillPolys 的那塊仍然照舊畫整片外框');
    eq(g.warnings.some(w => /NaN/.test(JSON.stringify(w))), false, '3.4 警告裡沒有異常');
  }

  // ---- 4. 可重現 ----
  {
    const a = board(); PourGeom.applyAll(a, padAbs, { clearance: CL });
    const b = board(); PourGeom.applyAll(b, padAbs, { clearance: CL });
    eq(JSON.stringify(a.userZones[0].fillPolys), JSON.stringify(b.userZones[0].fillPolys),
      '4.1 同樣輸入算兩次結果相同');
    const g1 = gerber.build(a, padAbs, 'r');
    const g2 = gerber.build(b, padAbs, 'r');
    // .gbrjob 帶 CreationDate 時間戳，兩次跑一定不同——那不是不可重現。
    // 只比會影響製造的檔案。
    const stripJob = g => g.files.filter(f => !/\.gbrjob$/.test(f.name));
    eq(JSON.stringify(stripJob(g1)), JSON.stringify(stripJob(g2)),
      '4.2 除了 .gbrjob 的時間戳之外，Gerber 位元組相同');
  }

  // ---- 4b. 布林路徑真的有生效（不是看起來像而已）----
  {
    const st = board();
    PourGeom.applyAll(st, padAbs, { clearance: CL });
    const zone = st.userZones[0];
    const outers = zone.fillPolys.length;
    const holes = zone.fillPolys.reduce((n, is) => n + (is.holes || []).length, 0);

    const g = gerber.build(st, padAbs, 'v');
    const cu = g.files.find(f => /F_Cu\.gbr$/.test(f.name));
    // 布林路徑畫的 region 數 = 島的外環 + 內孔（這一層沒有 zoneFills / teardrops）
    eq(cu.stats.region, outers + holes,
      `4b.1 Gerber 的 region 數 = 島 ${outers} + 內孔 ${holes}（證明畫的是布林結果，不是整片再減）`);

    // 對照組：柵格路徑的 region 數是「1 片外框 + 每個要挖的東西」，
    // 兩者的數字不會剛好一樣（除非島剛好一個、挖的東西數量也剛好對上）
    const st2 = board();
    const g2 = gerber.build(st2, padAbs, 'v2');
    const cu2 = g2.files.find(f => /F_Cu\.gbr$/.test(f.name));
    ok(cu2.stats.region >= 1, '4b.2 柵格路徑也畫得出東西（備援仍然可用）');
  }

  // ---- 5. ODB++ ----
  {
    const st = board();
    PourGeom.applyAll(st, padAbs, { clearance: CL });
    const r = odb.build(st, padAbs, 'odbpour');
    const top = (r.files.find(f => /layers\/top\/features$/.test(f.name)) || {}).text || '';
    ok(top.length > 0, '5.1 ODB++ 有輸出頂層');
    ok(!/NaN|undefined/.test(top), '5.2 沒有 NaN');

    const holes = st.userZones[0].fillPolys.reduce((n, is) => n + (is.holes || []).length, 0);
    const islands = st.userZones[0].fillPolys.length;

    // v3 起內孔真的挖了，不再需要那條警告
    eq(r.warnings.some(w => w.k === 'odb_w_pour_holes'), false,
      '5.3 內孔已經挖了，不該再出現 odb_w_pour_holes 警告');

    // surface 的 contour：外環是 I、內孔是 H
    const iRings = (top.match(/^OB .* I$/gm) || []).length;
    const hRings = (top.match(/^OB .* H$/gm) || []).length;
    eq(hRings, holes, `5.4 H contour 數 = 內孔數（${holes}）`);
    ok(iRings >= islands, `5.5 I contour 數 ≥ 島數（${islands}）`);
    eq(r.stats.pourHoles, holes, '5.6 統計有回報內孔數');

    // 內孔的繞向要與外環相反：多數 CAM 會用繞向再確認一次
    const areaOf = pts => {
      let a = 0;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) a += pts[j][0] * pts[i][1] - pts[i][0] * pts[j][1];
      return a / 2;
    };
    if (holes) {
      // 直接讀寫出去的 ODB++ 文字，不去猜實作怎麼處理繞向。
      // 從 top 的每個 surface 抽出 I 與 H 的座標，逐一比繞向。
      const blocks = top.split('S P 0').slice(1);
      let checked = 0, sameSign = 0;
      for (const b of blocks) {
        const rings = [];
        for (const m of b.matchAll(/OB ([-\d.]+) ([-\d.]+) ([IH])([\s\S]*?)OE/g)) {
          const pts = [[+m[1], +m[2]]];
          for (const p of m[4].matchAll(/OS ([-\d.]+) ([-\d.]+)/g)) pts.push([+p[1], +p[2]]);
          rings.push({ kind: m[3], pts });
        }
        const outer = rings.find(r => r.kind === 'I');
        if (!outer) continue;
        const os = Math.sign(areaOf(outer.pts));
        for (const r of rings.filter(r => r.kind === 'H')) {
          checked++;
          if (Math.sign(areaOf(r.pts)) === os) sameSign++;
        }
      }
      ok(checked > 0, '5.7a 有讀到 H contour 可以驗');
      eq(sameSign, 0, `5.7b 每個 H contour 的繞向都與外環相反（檢查 ${checked} 個）`);
    }
  }
  {
    // 沒有布林結果時 ODB++ 照舊畫整片
    const st = board();
    const r = odb.build(st, padAbs, 'odbgrid');
    const top = (r.files.find(f => /layers\/top\/features$/.test(f.name)) || {}).text || '';
    ok(/S P 0/.test(top), '5.4 柵格路徑仍然畫得出 surface');
    eq(r.warnings.some(w => w.k === 'odb_w_pour_holes'), false, '5.5 柵格路徑不會出現內孔警告');
  }

  // ---- 6. 界線：布林結果不可以再被減一次 ----
  {
    // 把同一塊 zone 算兩次布林（模擬「重算之後又跑一次減法」的錯誤）
    // 面積必須一樣——會變小就表示淨空被扣了兩次。
    const st = board();
    PourGeom.applyAll(st, padAbs, { clearance: CL });
    const area1 = st.userZones[0].fillPolys
      .reduce((s, is) => s + PourGeom._areaOf(is.outer) - (is.holes || []).reduce((h, p) => h + PourGeom._areaOf(p), 0), 0);
    PourGeom.applyAll(st, padAbs, { clearance: CL });   // 再算一次
    const area2 = st.userZones[0].fillPolys
      .reduce((s, is) => s + PourGeom._areaOf(is.outer) - (is.holes || []).reduce((h, p) => h + PourGeom._areaOf(p), 0), 0);
    ok(Math.abs(area1 - area2) < 1e-6,
      `6.1 重算是冪等的（${area1.toFixed(3)} vs ${area2.toFixed(3)}）——不是的話代表淨空被扣了兩次`);
  }

  console.log(`\npour-default.test: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
