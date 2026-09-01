/**
 * refboard-fill.js — 把公版上「還沒繞的那些 net」補繞完，其餘一律不動。
 *
 * 跟 refboard-rebuild.js 的差別（兩支都要留）：
 *   rebuild：丟掉示意走線 → 擺位鬆弛 → 全部重繞。動擺位、動板框，會改變整片板。
 *   fill   ：**不動擺位、不動既有走線**，只把 Ratsnest 還看得到的飛線補繞上去。
 *
 * 為什麼需要這支：2026-09-01 實測 8 片公版還有 134 條沒繞，其中 118 條用現在的
 * 繞線器當場就繞得出來——缺的不是演算法，是那些線從來沒有被補繞過。
 * 用 rebuild 來補會連擺位一起重算（世代漂移，見 rebuild 檔頭），代價太大。
 *
 * 安全閥：**每片板各自驗收**。補完重跑 runDrc，error 沒有維持在 0 就整片放棄，
 * 不寫回。寧可少補一片，不可把「乾淨的公版」換成「多了幾條線但有違規」。
 *
 * 線寬與淨空政策跟 rebuild 共用 tools/refboard-policy.js（抄第二次就會分岔）。
 *
 * 用法：
 *   node tools/refboard-fill.js --dry          # 只跑不寫檔（看數字）
 *   node tools/refboard-fill.js                # 全部 8 片，寫回 pcb-refboards.js
 *   node tools/refboard-fill.js librevna       # 指定board
 */
'use strict';

const path = require('path');
const fs = require('fs');
const W = path.resolve(__dirname, '..');
const R = f => require(path.join(W, f));

// ---------- DOM stub（載 pcb.js 但不跑 init）----------
const noop = () => {};
const ctxStub = new Proxy({}, { get: () => () => undefined });
const canvasStub = { width: 680, height: 478, getContext: () => ctxStub, getBoundingClientRect: () => ({ left: 0, top: 0, width: 680, height: 478 }), addEventListener: noop, style: {}, parentElement: { clientWidth: 680, clientHeight: 478 } };
const drcBox = { innerHTML: '' };   // runDrc 會把結果寫進 #drcResults
const docStub = { querySelector: (s) => (s === '#pcbCanvas' ? canvasStub : (s === '#drcResults' ? drcBox : null)), querySelectorAll: () => [], getElementById: () => null, createElement: () => ({ addEventListener: noop, style: {}, click: noop }), addEventListener: noop, body: {} };
const lsStub = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };
global.window = { I18N: null, localStorage: lsStub, addEventListener: noop, innerWidth: 1280, innerHeight: 720 };
global.document = docStub; global.localStorage = lsStub; global.window.document = docStub;

try { R('ic-data.js'); } catch (e) { /* IC 資料非必要 */ }
['footprint-gen', 'parts-lib', 'pcb-ref-fp', 'pcb-refboards', 'pcb-history', 'pcb-rules',
 'pcb-stackup', 'pcb-constraints', 'pcb-drc', 'pcb-fabs'].forEach(m => R(m + '.js'));
['PcbHistory', 'FootprintGen', 'RefFP', 'PartsLib', 'PCB_REFBOARDS', 'IC_DATA', 'NetRules', 'Ratsnest',
 'AutoRoute', 'RouteAll', 'Stackup', 'Padstack', 'Backdrill', 'FabProfiles', 'ConstraintMgr', 'PadDrc']
  .forEach(k => { global[k] = global.window[k]; });

let src = fs.readFileSync(path.join(W, 'pcb.js'), 'utf8').replace(/pcbApp\.init\(\);\s*/m, '');
eval(src);
const app = global.window.pcbApp;
global.pcbApp = app; global.window.pcbApp = app;   // pcb-stackup 等模組用裸全域引用
['render', 'renderPartsList', 'syncSelPanel', 'populateEmiSelects', 'renderLayerList', 'toast', 'checkTraceRules'].forEach(m => { app[m] = noop; });
app.canvas = canvasStub; app.ctx = ctxStub;

const padAbs = app.padAbs.bind(app);
const GEOM = window.PadDrc._geom;
const rules = app.loadDrcRules();
const CL = rules.clearance;

const errsOf = () => app.runDrc().filter(f => f.type === 'error');

// ---------- 補繞 ----------
const args = process.argv.slice(2);
const dry = args.includes('--dry');
const want = args.filter(a => !a.startsWith('--'));
const boards = (window.PCB_REFBOARDS || []).filter(b => !want.length || want.includes(b.id));
if (!boards.length) { console.error('找不到指定的公版：' + want.join(', ')); process.exit(1); }

const out = [];
for (const b of boards) {
  app.loadRefBoard(b.id);
  const st = app.state;
  // 驗收要跟瀏覽器同條件：init() 會載入 NetRules，node 不跑 init 所以自己補
  st.netRules = window.NetRules ? window.NetRules.load() : [];
  // 不要清掉 pad 的 net 再重推。那張 padNets 表記的是**意圖**（這根腳該接哪條 net），
  // 其中一半（實測 115/230）根本沒有走線支持——因為那些 net 還沒繞完，
  // 而那正是飛線要顯示的東西。清掉等於把「還沒繞」偽裝成「不用繞」。
  const before = errsOf().length;
  const lines0 = window.Ratsnest.compute(st, padAbs);
  const tracesBefore = (st.traces || []).length;

  // ---- 第一階段：把「同一點、同 net、不同層、缺 via」的壞接點縫起來 ----
  // 這些是舊版繞線器留下的（收線時允許收在別層而不打 via，2026-09-01 修掉）。
  // 症狀是一條**零長度飛線**：畫面上看不見，數字上永遠繞不完。
  // 只補 via，不動任何既有走線；DRC 沒過就把那顆 via 收回去。
  let stitched = 0, stitchFail = 0;
  const ps = window.Padstack ? window.Padstack.load() : { od: 0.7, drill: 0.3 };
  // 縫一輪。補繞之後要**再縫一次**：新走線也可能收在需要 via 的點上，
  // 只縫前面那一輪的話，補繞自己製造出來的壞接點會留在板上（rp2040 實測就是這樣）。
  let escaped = 0;
  const stitchPass = () => {
    const zero = window.Ratsnest.compute(st, padAbs)
      .filter(l => Math.hypot(l.x2 - l.x1, l.y2 - l.y1) < 1e-6);
    for (const z of zero) {
      const before = errsOf().length;
      const gone = () => !window.Ratsnest.compute(st, padAbs)
        .some(l => Math.hypot(l.x2 - l.x1, l.y2 - l.y1) < 1e-6 &&
                   Math.hypot(l.x1 - z.x1, l.y1 - z.y1) < 1e-6 && l.net === z.net);
      const v = { x: +z.x1.toFixed(3), y: +z.y1.toFixed(3), od: ps.od, drill: ps.drill, net: z.net };
      st.vias.push(v);
      if (errsOf().length <= before && gone()) { stitched++; continue; }
      st.vias.pop();

      // 原地放不下 → 逃逸：把 via 往外挪，兩層各補一段短線接過去。
      // 密腳區（BGA／QFN／B2B）本來就沒有空間把 via 放在 pad 正下方，
      // 真實 layout 也是這樣做的。粗篩由 escapeVia 做，這裡再跑一次真 DRC 確認。
      const esc = window.AutoRoute.escapeVia(st, padAbs, { x: z.x1, y: z.y1, net: z.net }, {
        clearance: CL, viaOd: ps.od, viaDrill: ps.drill, width: 0.2
      });
      if (!esc.ok) { stitchFail++; continue; }
      const nT = (esc.stubs || []).length, nV = st.vias.length;
      // 既有走線的端點：拉到新 via 的位置（不是再疊一段一模一樣的線）
      const undo = [];
      (esc.extend || []).forEach(e => {
        const t = st.traces[e.index];
        if (!t) return;
        if (e.end === 1) { undo.push([t, 'x1', t.x1, 'y1', t.y1]); t.x1 = e.to.x; t.y1 = e.to.y; }
        else { undo.push([t, 'x2', t.x2, 'y2', t.y2]); t.x2 = e.to.x; t.y2 = e.to.y; }
      });
      (esc.stubs || []).forEach(s => st.traces.push(Object.assign({ id: 'esc-' + st.traces.length }, s)));
      st.vias.push(esc.via);
      // 不變式：同一段幾何不可以同時出現在兩個銅層（gerber-readback 會判成寫錯層）。
      // escapeVia 自己也會避開，這裡再驗一次——不變式要守在「寫進資料」的那一關，
      // 不能只靠產生端記得。
      const kk = t => { const a = [+(+t.x1).toFixed(3), +(+t.y1).toFixed(3)], b = [+(+t.x2).toFixed(3), +(+t.y2).toFixed(3)];
        const [p, q] = (a[0] < b[0] || (a[0] === b[0] && a[1] <= b[1])) ? [a, b] : [b, a]; return p.concat(q).join(','); };
      const byGeom = new Map();
      let crossLayer = false;
      for (const t of st.traces) {
        const k = kk(t), l = t.layer || 'F.Cu';
        if (byGeom.has(k) && byGeom.get(k) !== l) { crossLayer = true; break; }
        byGeom.set(k, l);
      }
      if (!crossLayer && errsOf().length <= before && gone()) { escaped++; }
      else {
        st.vias.length = nV;
        st.traces.length = st.traces.length - nT;
        undo.forEach(([t, kx, vx, ky, vy]) => { t[kx] = vx; t[ky] = vy; });
        stitchFail++;
      }
    }
  };
  stitchFail = 0; stitchPass();

  const lines = window.Ratsnest.compute(st, padAbs);

  const policy = require('./refboard-policy.js').makePolicy(window, CL);
  const allNets = new Set();
  (st.components || []).forEach(c => (c.pads || []).forEach(pd => { if (pd.net) allNets.add(pd.net); }));
  lines.forEach(l => { if (l.net) allNets.add(l.net); });

  // 寬的先繞：它的選擇最少，等窄線把通道占滿就再也塞不進去（跟 rebuild 同一條理由）
  const groups = new Map();
  lines.forEach(l => {
    const w = policy.widthOf(l.net);
    if (!groups.has(w)) groups.set(w, []);
    groups.get(w).push(l);
  });

  let routed = 0;
  const addedTraces = [], addedVias = [];
  // 這裡**刻意不做成對繞**。2026-09-01 試過：接上 app.autoRoutePairs 之後，
  // esp32 +8、a20-lime +21、openrex +42 個 DRC error（閘門擋下、三片放棄）。
  // 原因在 autoRoutePairs 本身：它繞的是中心線，再把兩條線左右偏移展開，
  // **展開後沒有重新檢查淨空**——空板上沒事，密板上兩條線就壓到鄰居。
  // 那是主線功能要修的事（使用者按「自動繞線」也會踩到），不是補繞工具能繞過去的。
  for (const w of [...groups.keys()].sort((a, b) => b - a)) {
    const grp = groups.get(w);
    const r = window.RouteAll.run(st, padAbs, grp, {
      layers: (st.layerStack || []).filter(l => l.kind === 'copper').map(l => l.id),
      layer: 'F.Cu', width: w,
      clearance: policy.clearanceFor(grp.map(l => l.net), allNets),
      viaOd: Math.max(0.6, w + 0.3), viaDrill: 0.3,
      grid: 0.1, order: 'short', ripup: true, passes: 6,
      // 離線工具，時間給夠：90 秒版本有一批是「時間到才失敗」，不是真的沒有路
      budgetMs: 20000 + 15000 * grp.length
    });
    // 同一段幾何已經有了就不要再放一次：多的那一段不會多接到任何東西，
    // 而且同幾何跨兩層會被 gerber-readback 判成「走線漏到別的銅層」（實測 rp2040 的 BOOTSEL）。
    const segKey = t => [t.x1, t.y1, t.x2, t.y2].map(v => (+v).toFixed(3)).join(',');
    const segKeyRev = t => [t.x2, t.y2, t.x1, t.y1].map(v => (+v).toFixed(3)).join(',');
    const have = new Set();
    (st.traces || []).forEach(t => { have.add(segKey(t)); have.add(segKeyRev(t)); });
    r.routed.forEach(x => {
      x.segs.forEach(sg => {
        const t = { x1: +sg.x1.toFixed(3), y1: +sg.y1.toFixed(3), x2: +sg.x2.toFixed(3), y2: +sg.y2.toFixed(3),
          layer: sg.layer || 'F.Cu', width: w, net: x.line.net };
        if (have.has(segKey(t))) return;
        have.add(segKey(t)); have.add(segKeyRev(t));
        st.traces.push(t); addedTraces.push(t);
      });
      (x.vias || []).forEach(v => {
        const q = { x: +v.x.toFixed(3), y: +v.y.toFixed(3), od: v.od, drill: v.drill, net: x.line.net };
        st.vias.push(q); addedVias.push(q);
      });
    });
    routed += r.routed.length;
  }

  // 補繞可能自己製造出需要 via 的接點，所以再縫一輪（失敗數以最後一輪為準）
  stitchFail = 0; stitchPass();

  // 補繞完、**還沒重新回推 pad net 之前**先量一次未繞數：這是跟開頭同一個基準。
  // 重新回推之後數字會變大，那不是退步——新線碰到原本沒有 net 的 pad，
  // 那些 pad 才開始「需要連線」（公版多數 pad 沒有 netlist，見 NEW-SESSION §8）。
  // 兩個數字都報，閘門只看同基準的那個。
  const openSameBasis = window.Ratsnest.compute(st, padAbs).length;

  // 驗收要用使用者實際會看到的狀態：照 loadRefBoard 的順序重來一次
  //（清空 pad net → 套 padNets → 從走線回推），否則工具說 0、載進來卻有錯。
  // padNets 照實存目前每顆 pad 身上的 net（意圖表 ＋ 這一輪新繞出來的）
  const padNets = {};
  (st.components || []).forEach(c => (c.pads || []).forEach(pd => {
    if (pd.net) (padNets[c.ref] = padNets[c.ref] || {})[pd.num] = pd.net;
  }));
  st.netRules = window.NetRules ? window.NetRules.load() : [];
  const after = errsOf().length;
  const openAfter = window.Ratsnest.compute(st, padAbs).length;

  // 驗收要看的不只 DRC。補繞如果讓「未繞」變多，代表新線的端點沒有真的落在 pad 上：
  // 它在畫面上是一條線，在連通性上卻是一段浮空的銅，而 DRC 不會抗議。
  // 端點檢查照 rebuild 的同一套：兩端要落在同 net 的 pad 或同 net 的另一條線端點。
  const padPts = [];
  (st.components || []).forEach(c => (c.pads || []).forEach(pd => {
    if (pd.cu === false || !pd.net) return;
    const a = padAbs(c, pd);
    padPts.push({ x: a.x, y: a.y, net: pd.net, r: Math.max(pd.w || 0.5, pd.h || 0.5) / 2 + 0.05 });
  }));
  const onPad = (x, y, net) => padPts.some(q => q.net === net && Math.hypot(q.x - x, q.y - y) <= q.r);
  const onWire = (x, y, net, self) => st.traces.some(t => t !== self && t.net === net &&
    (Math.hypot(t.x1 - x, t.y1 - y) < 0.06 || Math.hypot(t.x2 - x, t.y2 - y) < 0.06));
  let ends = 0, endsOk = 0;
  addedTraces.forEach(t => {
    [[t.x1, t.y1], [t.x2, t.y2]].forEach(([x, y]) => {
      ends++;
      if (onPad(x, y, t.net) || onWire(x, y, t.net, t)) endsOk++;
    });
  });

  const keep = after <= before && openSameBasis <= lines0.length && ends === endsOk;
  out.push({ id: b.id, before, after, open: lines0.length, openSameBasis, openAfter, routed, stitched, stitchFail,
    added: addedTraces.length, vias: addedVias.length, ends, endsOk, keep });

  if (!dry && keep) {
    b.traces = st.traces;
    b.vias = st.vias;
    b.padNets = padNets;
  }
  console.log(b.id.padEnd(16),
    'DRC ' + before + ' -> ' + after,
    '| 未繞 ' + lines0.length + ' -> ' + openSameBasis + '（回推後 ' + openAfter + '）',
    '| 縫 via ' + stitched + (escaped ? ' + 逃逸 ' + escaped : '') + (stitchFail ? '(放棄 ' + stitchFail + ')' : ''),
    '| 補繞 ' + routed + ' 條（' + addedTraces.length + ' 段、' + addedVias.length + ' via）',
    '| 端點落點 ' + endsOk + '/' + ends,
    (keep ? '' : ' ✕ 放棄這片'));
}

const sum = k => out.reduce((a, r) => a + (typeof r[k] === 'number' ? r[k] : 0), 0);
console.log('---');
console.log('合計：未繞 ' + sum('open') + ' -> ' + sum('openSameBasis') + '（回推後 ' + sum('openAfter') + '）' +
  '｜補繞 ' + sum('routed') + ' 條｜DRC error ' + sum('before') + ' -> ' + sum('after') +
  '｜放棄 ' + out.filter(r => !r.keep).length + ' 片');

if (!dry) {
  const kept = out.filter(r => r.keep).length;
  if (!kept) { console.log('沒有任何一片通過驗收，不寫檔'); process.exit(1); }
  const file = path.join(W, 'pcb-refboards.js');
  const text = fs.readFileSync(file, 'utf8');
  const head = text.slice(0, text.indexOf('window.PCB_REFBOARDS'));
  const NLC = String.fromCharCode(10);
  fs.writeFileSync(file, head + 'window.PCB_REFBOARDS = ' + JSON.stringify(window.PCB_REFBOARDS, null, 2) + ';' + NLC, 'utf8');
  console.log('已寫回 pcb-refboards.js（' + kept + ' 片）');
} else {
  console.log('--dry：沒有寫檔');
}
