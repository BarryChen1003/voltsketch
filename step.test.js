/**
 * step.test.js — STEP 3D 匯出驗證（node，無瀏覽器）
 *
 * 開不了 CAD，所以不能宣稱「在 SolidWorks 打得開」。能驗的是這些，而且都很硬：
 *   - 參照完整性：不可有指向不存在的實體、不可有重複編號
 *   - **流形性**：每條邊剛好被兩個面用到，且方向相反（封閉殼的定義）
 *   - 尤拉示性數：每個柱體 V−E+F = 2
 *   - 座標與輸入一致、板厚正確、旋轉與底面元件方向正確
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

const S = require('./pcb-step.js');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL: ' + m); } };
const eq = (a, b, m) => ok(a === b, `${m} (得 ${JSON.stringify(a)}，期望 ${JSON.stringify(b)})`);
const near = (a, b, t, m) => ok(Math.abs(a - b) <= (t || 1e-6), `${m} (得 ${a}，期望 ${b}）`);

// ---- 把 STEP 讀回來，重建面/邊/點 ----
function readBack(text) {
  const ent = new Map();
  for (const ln of text.split(/\r?\n/)) {
    const m = /^#(\d+) = ([A-Z_]+|\()(.*);$/.exec(ln);
    if (!m) continue;
    ent.set(+m[1], { type: m[2] === '(' ? 'COMPLEX' : m[2], body: (m[2] === '(' ? m[2] : '') + m[3] });
  }
  const refs = body => [...body.matchAll(/#(\d+)/g)].map(x => +x[1]);
  const faces = [], edges = new Map(), points = [];
  ent.forEach((e, id) => {
    if (e.type === 'ADVANCED_FACE') faces.push(id);
    if (e.type === 'EDGE_CURVE') edges.set(id, { uses: [] });
    if (e.type === 'CARTESIAN_POINT') {
      const m = /\(([-\d.,eE+]+)\)\)\s*$/.exec(e.body);
      if (m) points.push(m[1].split(',').map(Number));
    }
  });
  // 走 ADVANCED_FACE → FACE_OUTER_BOUND → EDGE_LOOP → ORIENTED_EDGE
  for (const fid of faces) {
    for (const bid of refs(ent.get(fid).body)) {
      const b = ent.get(bid);
      if (!b || b.type !== 'FACE_OUTER_BOUND') continue;
      for (const lid of refs(b.body)) {
        const l = ent.get(lid);
        if (!l || l.type !== 'EDGE_LOOP') continue;
        for (const oid of refs(l.body)) {
          const o = ent.get(oid);
          if (!o || o.type !== 'ORIENTED_EDGE') continue;
          const dir = /\.T\.\)\s*$/.test(o.body);
          const ec = refs(o.body).find(x => edges.has(x));
          if (ec != null) edges.get(ec).uses.push({ face: fid, dir });
        }
      }
    }
  }
  return { ent, faces, edges, points, solids: [...ent.values()].filter(e => e.type === 'MANIFOLD_SOLID_BREP').length };
}

const rect = (w, h) => [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]];
const segsOf = pts => pts.map((p, i) => {
  const q = pts[(i + 1) % pts.length];
  return { x1: p[0], y1: p[1], x2: q[0], y2: q[1] };
});

// ============ 1) 結構與參照 ============
{
  const r = S.build({ boardWidth: 80, boardHeight: 50, components: [] }, {});
  const v = S.verify(r.text);
  ok(v.ok, `1 結構檢查應通過（問題：${JSON.stringify(v.problems)}）`);
  eq(v.problems.length, 0, '1 不可有結構問題');
  ok(/^ISO-10303-21;/.test(r.text), '1 應有 ISO-10303-21 表頭');
  ok(/END-ISO-10303-21;\s*$/.test(r.text), '1 應以 END-ISO-10303-21 收尾');
  ok(/FILE_SCHEMA\(\('AUTOMOTIVE_DESIGN/.test(r.text), '1 應宣告 AP214 schema');
  ok(/MANIFOLD_SOLID_BREP/.test(r.text), '1 應有實體');
  ok(/SI_UNIT\(\.MILLI\.,\.METRE\.\)/.test(r.text), '1 單位應為 mm');
  ok(v.refs > 100, `1 應有大量內部參照（得 ${v.refs}）`);

  // 壞掉的檔要驗得出來（證明 verify 不是永遠回 ok）
  const broken = r.text.replace(/#3 = /, '#999999 = ');
  ok(!S.verify(broken).ok, '1 動過手腳的檔應驗不過');
  ok(S.verify(broken).problems.some(p => p.code === 'danglingRef'), '1 應指出懸空參照');
  ok(!S.verify(r.text.replace('END-ISO-10303-21;', '')).ok, '1 缺收尾應驗不過');
  const dup = r.text.replace(/^#5 = /m, '#4 = ');
  ok(S.verify(dup).problems.some(p => p.code === 'duplicateId'), '1 重複編號應驗得出來');
}

// ============ 2) 流形性：封閉殼的定義 ============
{
  const r = S.build({ boardWidth: 80, boardHeight: 50, components: [] }, {});
  const rb = readBack(r.text);
  eq(rb.solids, 1, '2 只有板子時應有 1 個實體');
  eq(rb.faces.length, 6, '2 矩形柱體應有 6 個面');
  eq(rb.edges.size, 12, '2 矩形柱體應有 12 條邊');

  let bad = 0, badDir = 0;
  rb.edges.forEach(e => {
    if (e.uses.length !== 2) bad++;
    else if (e.uses[0].dir === e.uses[1].dir) badDir++;
  });
  eq(bad, 0, '2 每條邊必須剛好被兩個面用到（封閉殼）');
  eq(badDir, 0, '2 同一條邊在兩個面上的方向必須相反');

  // 尤拉示性數
  eq(r.stats.V - r.stats.E + r.stats.F, 2 * r.stats.solids, '2 V−E+F 應等於 2×實體數');
  eq(r.stats.V, 8, '2 矩形柱體 8 個頂點');
  eq(r.stats.E, 12, '2 矩形柱體 12 條邊');
  eq(r.stats.F, 6, '2 矩形柱體 6 個面');

  // 多元件時每個實體都要各自滿足
  const many = S.build({
    boardWidth: 80, boardHeight: 50,
    components: [
      { ref: 'R1', x: 0, y: 0, rot: 0, w: 1.6, h: 1, footprintVariant: '0603' },
      { ref: 'R2', x: 5, y: 0, rot: 0, w: 1.6, h: 1, footprintVariant: '0603' },
      { ref: 'U1', x: -5, y: 0, rot: 0, w: 5, h: 5, footprintVariant: 'QFN' }
    ]
  }, {});
  eq(many.stats.solids, 4, '2 板 + 3 元件 = 4 個實體');
  eq(many.stats.V - many.stats.E + many.stats.F, 8, '2 四個實體的 V−E+F 總和應為 8');
  const rbm = readBack(many.text);
  eq(rbm.solids, 4, '2 檔案裡應有 4 個 MANIFOLD_SOLID_BREP');
  eq(rbm.faces.length, 24, '2 四個矩形柱體共 24 個面');
  let bad2 = 0;
  rbm.edges.forEach(e => { if (e.uses.length !== 2 || e.uses[0].dir === e.uses[1].dir) bad2++; });
  eq(bad2, 0, '2 多實體時每條邊仍須剛好兩用且反向');
}

// ============ 3) 幾何：座標與板厚要對得上輸入 ============
{
  const r = S.build({ boardWidth: 80, boardHeight: 50, components: [] }, { thickness: 1.6 });
  const rb = readBack(r.text);
  const zs = [...new Set(rb.points.map(p => p[2]))].sort((a, b) => a - b);
  eq(zs.length, 2, '3 只有板子時 Z 應只有兩個值（上下面）');
  near(zs[0], 0, 1e-6, '3 板底面 z=0');
  near(zs[1], 1.6, 1e-6, '3 板頂面 z=板厚');

  const thick = S.build({ boardWidth: 80, boardHeight: 50, components: [] }, { thickness: 0.8 });
  const zt = [...new Set(readBack(thick.text).points.map(p => p[2]))].sort((a, b) => a - b);
  near(zt[1], 0.8, 1e-6, '3 板厚應照參數');

  // XY 角點要出現在檔案裡
  const xs = [...new Set(rb.points.map(p => p[0]))].sort((a, b) => a - b);
  const ys = [...new Set(rb.points.map(p => p[1]))].sort((a, b) => a - b);
  near(xs[0], -40, 1e-6, '3 板框左緣 -40');
  near(xs[xs.length - 1], 40, 1e-6, '3 板框右緣 +40');
  near(ys[0], -25, 1e-6, '3 板框下緣 -25');
  near(ys[ys.length - 1], 25, 1e-6, '3 板框上緣 +25');

  // 元件在板子上面
  const withPart = S.build({
    boardWidth: 80, boardHeight: 50,
    components: [{ ref: 'R1', x: 0, y: 0, rot: 0, w: 1.6, h: 1, footprintVariant: '0603' }]
  }, { thickness: 1.6 });
  const zp = [...new Set(readBack(withPart.text).points.map(p => p[2]))].sort((a, b) => a - b);
  eq(zp.length, 3, '3 板 + 頂面元件應有 3 個 Z 值（0 / 板厚 / 板厚+元件高）');
  near(zp[2], 1.6 + 0.6, 1e-6, '3 0603 高 0.6mm，頂面應在 2.2mm');

  // 底面元件要往下長
  const bottom = S.build({
    boardWidth: 80, boardHeight: 50,
    components: [{ ref: 'R2', x: 0, y: 0, rot: 0, w: 1.6, h: 1, side: 'bottom', footprintVariant: '0603' }]
  }, { thickness: 1.6 });
  const zb = [...new Set(readBack(bottom.text).points.map(p => p[2]))].sort((a, b) => a - b);
  near(zb[0], -0.6, 1e-6, '3 底面元件應長在 z<0');

  // 旋轉要生效
  const rot = S.build({
    boardWidth: 80, boardHeight: 50,
    components: [{ ref: 'J1', x: 0, y: 0, rot: 90, w: 10, h: 2, footprintVariant: 'hdr' }]
  }, {});
  const pr = readBack(rot.text).points.filter(p => Math.abs(p[2] - 1.6) < 1e-6 && Math.abs(p[0]) <= 6);
  const maxY = Math.max(...pr.map(p => Math.abs(p[1])));
  near(maxY, 5, 1e-6, '3 旋轉 90° 後 10mm 的長邊應落在 Y 方向');
}

// ============ 4) 板框迴路 ============
{
  // 矩形
  const loop = S.loopFromSegs(segsOf(rect(80, 50)), 0.01);
  ok(loop && loop.length === 4, '4 矩形應接成 4 點迴路');

  // 順序打亂也要接得起來
  const shuffled = segsOf(rect(80, 50)).slice().reverse();
  ok(S.loopFromSegs(shuffled, 0.01), '4 線段順序打亂仍應接得起來');
  // 個別線段頭尾顛倒也要接得起來
  const flipped = segsOf(rect(80, 50)).map((s, i) =>
    i % 2 ? { x1: s.x2, y1: s.y2, x2: s.x1, y2: s.y1 } : s);
  ok(S.loopFromSegs(flipped, 0.01), '4 線段頭尾顛倒仍應接得起來');

  // L 形
  const L = [[0, 0], [80, 0], [80, 30], [40, 30], [40, 50], [0, 50]];
  const lloop = S.loopFromSegs(segsOf(L), 0.01);
  ok(lloop && lloop.length === 6, '4 L 形應接成 6 點迴路');

  // 缺一邊：接不起來就要回 null，不可硬湊
  const broken = segsOf(rect(80, 50)).slice(0, 3);
  eq(S.loopFromSegs(broken, 0.01), null, '4 沒封閉應回 null');
  // 兩個獨立迴路：不是單一外框，也要回 null
  const two = segsOf(rect(20, 20)).concat(segsOf(rect(10, 10)).map(s =>
    ({ x1: s.x1 + 50, y1: s.y1, x2: s.x2 + 50, y2: s.y2 })));
  eq(S.loopFromSegs(two, 0.01), null, '4 兩條獨立迴路應回 null');
  eq(S.loopFromSegs([], 0.01), null, '4 空輸入回 null');

  // build 拿 edgeSegs 用：接得起來就用它，接不起來退回矩形並警告
  const useL = S.build({ boardWidth: 80, boardHeight: 50, edgeSegs: segsOf(L), components: [] }, {});
  eq(useL.stats.F, 8, '4 L 形（6 邊）柱體應有 6+2 = 8 個面');
  eq(useL.warnings.length, 0, '4 板框接得起來時不應有警告');

  const fallback = S.build({ boardWidth: 80, boardHeight: 50, edgeSegs: broken, components: [] }, {});
  ok(fallback.warnings.some(w => w.code === 'outlineNotClosed'), '4 板框沒封閉要警告');
  eq(fallback.stats.F, 6, '4 退回矩形時應是 6 面');
  ok(S.verify(fallback.text).ok, '4 退回矩形後檔案仍要合法');
}

// ============ 5) 元件高度：估值也要有依據且可覆寫 ============
{
  near(S.heightOf({ footprintVariant: '0603' }), 0.6, 1e-9, '5 0603 高 0.6mm');
  near(S.heightOf({ footprintVariant: '1206' }), 0.95, 1e-9, '5 1206 高 0.95mm');
  near(S.heightOf({ part: 'tran SOT-23' }), 1.15, 1e-9, '5 SOT-23 高 1.15mm');
  near(S.heightOf({ part: 'hdr 1×2' }), 8.5, 1e-9, '5 排針高 8.5mm');
  near(S.heightOf({ footprintVariant: '沒見過' }), S.DEFAULT_H, 1e-9, '5 沒對到的用預設高度');
  near(S.heightOf({ footprintVariant: '0603', height: 3 }), 3, 1e-9, '5 明確指定的高度優先');
  // 高度 0 的（螺絲孔）不該產生實體
  const holes = S.build({
    boardWidth: 50, boardHeight: 50,
    components: [{ ref: 'H1', x: 0, y: 0, w: 3, h: 3, part: 'hole M3 (Ø3.2)' }]
  }, {});
  eq(holes.stats.parts, 0, '5 高度 0 的元件不應產生實體');
  eq(holes.stats.solids, 1, '5 只剩板子一個實體');
}

// ============ 6) 邊界情況不可爆 ============
{
  ok(S.verify(S.build({}, {}).text).ok, '6 空 state 也要產生合法檔');
  ok(S.verify(S.build({ boardWidth: 0, boardHeight: 0, components: [] }, {}).text).ok, '6 尺寸 0 不可產生壞檔');
  const noComp = S.build({ boardWidth: 10, boardHeight: 10, components: [] }, { components: false });
  eq(noComp.stats.parts, 0, '6 components:false 時不畫元件');
  const zeroSize = S.build({
    boardWidth: 50, boardHeight: 50,
    components: [{ ref: 'X', x: 0, y: 0, w: 0, h: 0, footprintVariant: '0603' }]
  }, {});
  ok(S.verify(zeroSize.text).ok, '6 尺寸 0 的元件不可產生壞檔');
}

console.log(`\nstep.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
