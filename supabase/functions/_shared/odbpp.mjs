/**
 * odbpp.mjs — ODB++ 匯出（銅層 / 鑽孔 / 板框）。
 *
 * 為什麼有這支：Gerber 是一疊互不相識的影像檔，板廠要靠檔名猜哪張是哪層；
 * ODB++ 把層別、疊構、鑽孔跨層關係寫在資料裡（matrix），CAM 端不必猜。
 *
 * 誠實界定（v3 就這麼多，不要對外宣稱「完整 ODB++」）：
 *   有：matrix/matrix、misc/info、steps/pcb/stephdr、profile（板框）、
 *       每個銅層的 features（pad / 走線 / via / 鋪銅 / 淚滴）、drill 層、
 *       元件（components/comp_+_top|bot 的 CMP 與 TOP 記錄）、
 *       netlist（eda/data 的 NET / PKG / PIN）、
 *       **鋪銅的內孔（surface 的 I/H contour，2026-08-27 補上）**。
 *   2026-08-31 補：阻焊（sm_top/bot）、鋼網（sp_top/bot）、絲印圖形（ss_top/bot）、
 *       netlist 的 subnet（SNT TOP，CAM 網表比對的依據）。
 *   仍然沒有：**絲印文字**（字型是另一套資料結構，半套寫出去 CAM 會顯示亂碼）、
 *       **ATTR 屬性**（要在每個 emitter 上串屬性索引，半套的屬性表比沒有更難查）、
 *       subnet 只標 TOP（元件腳），沒有分 TRACE/VIA/PLANE。
 *       build() 會把這些放進 warnings 帶回前端。
 *   幾何：弧輸出成弦線近似（與 Gerber 的 arc3 不同），roundrect pad 用 rect 近似。
 *       兩者都在 warnings 裡講明。
 *
 * 座標：ODB++ 用右手座標（Y 向上），本站 state 是 Y 向下，所以 Y 一律取負。
 * 單位：mm（misc/info 的 UNITS=MM 與 stephdr 一致）。
 */

// 阻抗目標只有一份來源：netspec.mjs 讀 state.netProps。匯出端各抄一份的下場是
// 「Gerber 包說 50Ω、ODB++ 說 47Ω」，而收到兩包檔的板廠不知道該信哪一個。
import { buildNetSpec } from './netspec.mjs';

const NL = String.fromCharCode(10);
const T = (k, vars) => ({ k, v: vars || {} });
const N = mm => (Math.round((mm + Number.EPSILON) * 1e6) / 1e6).toFixed(6);
const NY = mm => N(-mm);   // Y 翻正

// ---------- 符號表 ----------
// ODB++ 的 feature 都指向一個符號編號，符號名用標準名（r=圓、rect=矩形、oval=橢圓）
function SymbolTable() {
  const list = [];
  const seen = new Map();
  const add = name => {
    if (seen.has(name)) return seen.get(name);
    const i = list.length;
    list.push(name);
    seen.set(name, i);
    return i;
  };
  return {
    add,
    round: d => add('r' + N(Math.max(d, 0.001))),
    rect: (w, h) => add('rect' + N(Math.max(w, 0.001)) + 'x' + N(Math.max(h, 0.001))),
    oval: (w, h) => add('oval' + N(Math.max(w, 0.001)) + 'x' + N(Math.max(h, 0.001))),
    lines: () => list.map((nm, i) => '$' + i + ' ' + nm)
  };
}

function padSymbol(sym, pad) {
  if (pad.shape === 'circle') return sym.round(pad.w || 0.6);
  if (pad.shape === 'oval') return sym.oval(pad.w || 0.6, pad.h || 0.6);
  return sym.rect(pad.w || 0.6, pad.h || 0.6);   // rect 與 roundrect 都走這裡（近似）
}

// ---------- 板框 ----------
// edgeSegs（KiCad 匯入的非矩形板框）串成封閉多邊形；串不起來就退回矩形並警告。
function outlineOf(state, warnings) {
  const segs = (state.edgeSegs || []).filter(s => Number.isFinite(s.x1) && Number.isFinite(s.y1));
  const W = state.boardWidth || 100, H = state.boardHeight || 80;
  const rect = [[-W / 2, -H / 2], [W / 2, -H / 2], [W / 2, H / 2], [-W / 2, H / 2]];
  if (segs.length < 3) return rect;

  const EPS = 0.01;
  const same = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]) <= EPS;
  const pool = segs.map(s => [[s.x1, s.y1], [s.x2, s.y2]]);
  const pts = [pool[0][0], pool[0][1]];
  pool.splice(0, 1);
  let guard = pool.length + 2;
  while (pool.length && guard-- > 0) {
    const tail = pts[pts.length - 1];
    const i = pool.findIndex(s => same(s[0], tail) || same(s[1], tail));
    if (i < 0) break;
    const s = pool.splice(i, 1)[0];
    pts.push(same(s[0], tail) ? s[1] : s[0]);
  }
  if (pool.length || pts.length < 4 || !same(pts[0], pts[pts.length - 1])) {
    if (warnings) warnings.push(T('odb_w_outline'));
    return rect;
  }
  pts.pop();                      // 去掉重複的收尾點（surface 自動封閉）
  return pts;
}

// 一個 surface 可以由多個 contour 組成：`OB … I` 是實心島、`OB … H` 是挖出來的洞。
// v2 只畫外環（洞沒挖），CAM 端看到的銅會比實際多——那是 odb_w_pour_holes 那條警告。
// v3 把洞補上：布林鋪銅算出來的 islands 本來就帶 holes，直接一個一個寫成 H 迴圈。
//
// 繞向：ODB++ 靠 I/H 標記判定，不像 Gerber 靠繞向。但多數 CAM 仍會用繞向
// 再確認一次，繞向一致的洞有機會被當成重疊的實心島。
//
// 不可以「無條件把洞反轉」：Clipper 的 PolyTree 產出的 hole contour 本來就已經
// 與外環反向，再反一次就變成同向了（第一版就是這樣錯的，測試 5.7 抓到）。
// 正確做法是先量有向面積，同號才反——這樣對 Clipper 來的、手寫的都成立。
const signedArea = pts => {
  let a = 0;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    a += pts[j][0] * pts[i][1] - pts[i][0] * pts[j][1];
  }
  return a / 2;
};

function ring(pts, kind) {
  const out = ['OB ' + N(pts[0][0]) + ' ' + NY(pts[0][1]) + ' ' + kind];
  for (let i = 1; i < pts.length; i++) out.push('OS ' + N(pts[i][0]) + ' ' + NY(pts[i][1]));
  out.push('OS ' + N(pts[0][0]) + ' ' + NY(pts[0][1]), 'OE');
  return out;
}

function surface(pts, holes) {
  const out = ['S P 0'].concat(ring(pts, 'I'));
  const outerSign = Math.sign(signedArea(pts));
  for (const h of (holes || [])) {
    if (!h || h.length < 3) continue;
    const hs = Math.sign(signedArea(h));
    // 同號（含退化的 0）才反轉；已經反向的原樣寫出去
    out.push.apply(out, ring(hs === outerSign ? h.slice().reverse() : h, 'H'));
  }
  out.push('SE');
  return out;
}

function featureFile(symLines, feats, attrNames) {
  // 屬性查表要放在 features 之前，記錄用索引指回來（規格 p.28 Attribute Value Assignment）。
  const attrs = (attrNames && attrNames.length)
    ? ['#', '#Feature attribute names', '#'].concat(attrNames.map((n, i) => '@' + i + ' ' + n))
    : [];
  return ['#', '#Feature symbol names', '#']
    .concat(symLines)
    .concat(attrs)
    .concat(['#', '#Layer features', '#'])
    .concat(feats)
    .join(NL) + NL;
}

// ---------- 阻焊 / 鋼網 / 絲印 ----------
// 規則刻意跟 Gerber 產生器同一套（gerber.mjs 的 maskDefs / pasteDefs / 絲印段）：
// 兩包檔案給同一家板廠，開窗規則不一樣的話，對方會拿到兩個互相矛盾的答案。

/** 阻焊開窗＝該面所有銅 pad 同外形。via 蓋油不開窗（業界常規）。 */
function maskFeatures(state, padAbsFn, side, sym) {
  const feats = [];
  for (const c of (state.components || [])) {
    for (const pad of (c.pads || [])) {
      if (pad.cu === false) continue;
      if (!(pad.side === side || pad.side === '*')) continue;
      const a = padAbsFn(c, pad);
      const rot = ((pad.rot || 0) % 360 + 360) % 360;
      feats.push('P ' + N(a.x) + ' ' + NY(a.y) + ' ' + padSymbol(sym, pad) + ' P ' + N(rot));
    }
  }
  return feats;
}

/** 鋼網：只有 SMD。有孔的、np_thru_hole、paste:false 的都不上錫膏。 */
function pasteFeatures(state, padAbsFn, side, sym) {
  const feats = [];
  for (const c of (state.components || [])) {
    for (const pad of (c.pads || [])) {
      if (pad.drill > 0 || pad.type === 'np_thru_hole') continue;
      if (pad.side !== side) continue;
      if (pad.paste === false) continue;
      const a = padAbsFn(c, pad);
      const rot = ((pad.rot || 0) % 360 + 360) % 360;
      feats.push('P ' + N(a.x) + ' ' + NY(a.y) + ' ' + padSymbol(sym, pad) + ' P ' + N(rot));
    }
  }
  return feats;
}

/** footprint 相對點 → 絕對（跟 pcb.js compRel 同一個公式；不同套會整片轉錯角度）。 */
function compRel(c, rx, ry) {
  const th = (c.rot || 0) * Math.PI / 180, cs = Math.cos(th), sn = Math.sin(th);
  return { x: c.x + rx * cs + ry * sn, y: c.y - rx * sn + ry * cs };
}

/**
 * 絲印：元件圖形 + 板級圖形。**文字不畫**——ODB++ 的字型是另一套資料結構，
 * 半套寫出去 CAM 會顯示成亂碼或直接跳過，那比沒有更糟。這件事進 warnings。
 */
function silkFeatures(state, side, sym) {
  const feats = [];
  let texts = 0;
  const line = (a, b, w) => feats.push('L ' + N(a.x) + ' ' + NY(a.y) + ' ' + N(b.x) + ' ' + NY(b.y) + ' ' + sym.round(w || 0.12) + ' P 0');
  const emit = (g, toAbs) => {
    if ((g.side || 'F') !== side) return;
    if (g.kind === 'line') { line(toAbs(g.x1, g.y1), toAbs(g.x2, g.y2), g.w); return; }
    if (g.kind === 'circle') {
      // 圓用 12 段折線近似：ODB++ 的 A 記錄要圓心與方向，折線在絲印上看不出差別
      const c0 = toAbs(g.cx, g.cy), r = g.r || 0.5;
      let prev = null;
      for (let i = 0; i <= 12; i++) {
        const th = i / 12 * Math.PI * 2;
        const pt = { x: c0.x + Math.cos(th) * r, y: c0.y + Math.sin(th) * r };
        if (prev) line(prev, pt, g.w);
        prev = pt;
      }
      return;
    }
    if (g.kind === 'region' && Array.isArray(g.pts) && g.pts.length >= 3) {
      const abs = g.pts.map(pt => toAbs(pt[0], pt[1]));
      feats.push.apply(feats, surface(abs.map(a2 => [a2.x, a2.y]), []));
      return;
    }
    if (g.kind === 'arc') {
      // 三點弧：兩端直接連線（跟銅層的弧一樣是弦線近似，已在 warnings 講明）
      line(toAbs(g.x1, g.y1), toAbs(g.x2, g.y2), g.w);
    }
  };
  for (const c of (state.components || [])) {
    const toAbs = (rx, ry) => compRel(c, rx, ry);
    for (const g of (c.silk || [])) emit(g, toAbs);
    for (const t of (c.silkTexts || [])) { if ((t.side || 'F') === side) texts++; }
  }
  for (const g of (state.silkGr || [])) emit(g, (x, y) => ({ x: x, y: y }));
  return { feats: feats, texts: texts };
}

// ---------- 元件與 netlist ----------

// net 名 → 編號。ODB++ 的 feature 與 toeprint 都用編號互指，名字只出現在 eda/data 一次。
// 排序用名稱字典序而不是「出現順序」：同一塊板匯出兩次要位元組相同，
// 出現順序會隨元件陣列的順序變動。
function netTable(state) {
  const set = new Set();
  (state.components || []).forEach(c => (c.pads || []).forEach(p => { if (p.net) set.add(String(p.net)); }));
  (state.traces || []).forEach(t => { if (t.net) set.add(String(t.net)); });
  (state.vias || []).forEach(v => { if (v.net) set.add(String(v.net)); });
  const order = [...set].sort();
  const index = new Map();
  order.forEach((n, i) => index.set(n, i));
  return { order, index, numOf: n => (n && index.has(String(n)) ? index.get(String(n)) : -1) };
}

// 封裝表。同一種封裝只寫一次，元件用編號指過去（ODB++ 的 PKG 段就是這個意思）。
// 判定「同一種」用 part 名 ＋ pad 數 ＋ 外框，不用物件參照——
// 同一顆料在 state 裡是各自獨立的物件。
function packageTable(state) {
  const order = [];
  const index = new Map();
  for (const c of (state.components || [])) {
    const pads = c.pads || [];
    const key = (c.part || c.ref || 'PKG') + '|' + pads.length + '|' + (c.w || 0) + 'x' + (c.h || 0);
    if (index.has(key)) continue;
    index.set(key, order.length);
    order.push({ key, name: String(c.part || c.ref || 'PKG').replace(/[^\w.-]/g, '_'), pads, w: c.w || 0, h: c.h || 0 });
  }
  return { order, index, numOf: c => index.get((c.part || c.ref || 'PKG') + '|' + (c.pads || []).length + '|' + (c.w || 0) + 'x' + (c.h || 0)) };
}

// steps/pcb/eda/data —— 網表與封裝定義。
// 這是子集：NET/PKG/PIN 有；net 屬性目前只帶 .diff_pair（系統屬性），
// subnet 的完整分類（VIA/TRACE/PLANE）沒有。
function edaData(state, cuStack, nets, packages, layerName, specOf) {
  const L = [];
  L.push('HDR UNITS=MM');
  L.push('HDR SOURCE=HardwareAI');
  cuStack.forEach((layer, i) => L.push('LYR ' + layerName(layer, i).toUpperCase()));

  packages.order.forEach((pk, i) => {
    L.push('PKG ' + pk.name + ' ' + N(pk.h) + ' ' + N(-pk.w / 2) + ' ' + N(-pk.h / 2) + ' ' + N(pk.w / 2) + ' ' + N(pk.h / 2) + ' ' + pk.pads.length);
    pk.pads.forEach((p, j) => {
      // PIN <name> <type> <x> <y> <fhs> <etype> <mtype>
      // type 0=通孔 1=SMD；etype 0=電氣 1=機械
      const tht = p.drill > 0 ? 0 : 1;
      L.push('PIN ' + (p.num != null ? p.num : (j + 1)) + ' ' + tht + ' ' + N(p.x) + ' ' + NY(p.y) + ' ' + N(p.drill || 0) + ' 0 0');
    });
    L.push('#PKG ' + i);
  });

  // 每個 net 連到哪些腳。ODB++ 的 SNT TOP <元件序號> <腳序號> 是 CAM 網表比對的依據；
  // 只寫 NET 名稱的話，對方只知道有這個網路、不知道它接到哪裡，比對做不了。
  const pinsOfNet = {};
  const compIndex = new Map();
  let ci = 0;
  for (const c of (state.components || [])) {
    if (!(c.pads || []).length) continue;
    compIndex.set(c, ci++);
    (c.pads || []).forEach((pd, pi) => {
      const nm = String(pd.net || '').trim();
      if (!nm) return;
      (pinsOfNet[nm] = pinsOfNet[nm] || []).push([compIndex.get(c), pi]);
    });
  }

  // net 屬性查表。規格：查表必須放在第一筆 NET 之前，記錄用索引指回來（p.109）。
  // 這裡只用 .diff_pair（Text，系統屬性）——配對關係是 net 層級唯一有標準位置的一項；
  // 阻抗目標是「線段＋層」的性質，走 impedance.xml，不硬塞到 net 上。
  // .diff_pair 的值是「這一對的名字」，不是對方的 net 名：
  // 兩條線各寫對方的名字，CAM 會看到兩個不同的值，也就認不出它們是一對。
  // 所以兩邊都寫同一個名字（兩個 net 名排序後接起來），而且只設一邊也會補到另一邊。
  const pairNameOf = new Map();
  (specOf ? [...specOf.values()] : []).forEach(r => {
    if (!r.pair) return;
    const nm = [String(r.net), String(r.pair)].sort().join('-');
    pairNameOf.set(String(r.net), nm);
    pairNameOf.set(String(r.pair), nm);
  });
  const pairText = [];
  const pairIdx = new Map();
  nets.order.forEach(name => {
    const nm = pairNameOf.get(name);
    if (!nm || pairIdx.has(nm)) return;
    pairIdx.set(nm, pairText.length);
    pairText.push(nm);
  });
  if (pairText.length) {
    L.push('#', '#Net attribute names', '#', '@0 .diff_pair');
    L.push('#', '#Net attribute text strings', '#');
    pairText.forEach((t, i) => L.push('&' + i + ' ' + t));
    L.push('#');
  }

  nets.order.forEach((name, i) => {
    const pv = pairIdx.get(pairNameOf.get(name));
    L.push('NET ' + name + (pv === undefined ? '' : ';0=' + pv));
    // #NET 編號緊接在 NET 之後（我們自己的索引標記，讀檔的人與測試都靠它）；
    // SNT 放在後面。順序反過來會讓「下一行就是編號」這個假設失效。
    L.push('#NET ' + i);
    for (const [cIdx, pIdx] of (pinsOfNet[name] || [])) L.push('SNT TOP ' + cIdx + ' ' + pIdx);
  });
  L.push('');
  return L.join(NL);
}

// steps/pcb/components/comp_+_{top,bot} —— 元件與它的 toeprint（每個 pad 屬於哪個 net）。
function componentsFile(state, padAbsFn, side, nets, packages) {
  const L = ['UNITS=MM', '#'];
  let count = 0;
  (state.components || []).forEach(cp => {
    const cside = (cp.side === 'bottom' || cp.side === 'B') ? 'bot' : 'top';
    if (cside !== side) return;
    const pads = (cp.pads || []).filter(p => p.cu !== false);
    if (!pads.length) return;
    const pkg = packages.numOf(cp);
    const rot = ((cp.rot || 0) % 360 + 360) % 360;
    // CMP <pkg_ref> <x> <y> <rot> <mirror> <comp_name> <part_name>
    L.push('CMP ' + (pkg == null ? 0 : pkg) + ' ' + N(cp.x) + ' ' + NY(cp.y) + ' ' + N(rot) +
      ' ' + (side === 'bot' ? 'M' : 'N') + ' ' + (cp.ref || 'REF') + ' ' + String(cp.part || cp.ref || '').replace(/\s+/g, '_'));
    pads.forEach((pad, i) => {
      const p = padAbsFn(cp, pad);
      const nn = nets.numOf(pad.net);
      const prot = ((pad.rot || 0) % 360 + 360) % 360;
      // TOP <index> <x> <y> <rot> <mirror> <net_num> <subnet_num> <name>
      // net_num = -1 代表這個 pad 沒有接任何網路（機構孔、未接腳），CAM 端靠這個排除電測點
      L.push('TOP ' + i + ' ' + N(p.x) + ' ' + NY(p.y) + ' ' + N(prot) +
        ' ' + (side === 'bot' ? 'M' : 'N') + ' ' + nn + ' -1 ' + (pad.num != null ? pad.num : (i + 1)));
    });
    L.push('#CMP ' + count);
    count++;
  });
  L.push('');
  return { text: L.join(NL), count };
}

// ---------- 主流程 ----------
function build(state, padAbsFn, baseName) {
  const warnings = [T('odb_w_subset')];
  const base = String(baseName || 'hardwareai').replace(/[^\w.-]/g, '_') || 'hardwareai';
  const cuStack = (state.layerStack || []).filter(l => l.kind === 'copper');
  if (!cuStack.length) return { files: [], warnings: [T('odb_w_nolayers')], stats: { layers: 0, features: 0 } };

  const files = [];
  const root = base;
  const stepName = 'pcb';
  const layerName = (l, i) => (i === 0 ? 'top' : i === cuStack.length - 1 ? 'bot' : 'in' + i);
  const stats = { layers: 0, features: 0, drills: 0, pads: 0, traces: 0 };

  // --- 受控阻抗：ODB++ 本來就有正式位置，不自創屬性 ---
  // 出處：ODB++Design Format Specification 8.1 Update 4
  //   p.28  Attribute Value Assignment（@ 名稱表／& 字串表／記錄用索引指回來）
  //   p.110 NET 記錄：`NET <net_name>;<attributes>;ID=<id>`
  //   p.128 steps/<step>/impedance.xml；p.496 Impedances schema
  //   系統屬性：.imp_constraint_id（Integer，線段 feature 指回 Descriptor.Id）、
  //             .diff_pair（Text，net 的差分對名）、.z0impedance（Float，Layer 實體）
  // 沒有任何 net 設過屬性就一個檔都不產（跟 -NetSpec.txt 同一條規則）：
  // 產空的需求＝告訴板廠「這片板沒有阻抗要求」，那是另一個意思。
  const netSpec = buildNetSpec(state, { name: base });
  const specRows = netSpec ? netSpec.rows : [];
  const specOf = new Map(specRows.map(r => [r.net, r]));

  // Descriptor 一條 (net, 層) 一個 Id，從 1 起算。
  // 沒繞的 net 沒有 Descriptor：Descriptor 是綁在「那一層的線段」上的，沒有線段就沒有東西可綁。
  // 那條要求仍在 misc/netspec.txt 裡（標 NOT ROUTED），不會憑空消失。
  const impIdOf = new Map();
  const impDescs = [];
  specRows.forEach(r => {
    const ohms = r.z0 != null ? r.z0 : r.zdiff;
    if (ohms == null || !r.routed) return;
    r.layers.forEach(lid => {
      const li = cuStack.findIndex(l => l.id === lid);
      if (li < 0) return;
      const id = impDescs.length + 1;
      impIdOf.set(r.net + '|' + lid, id);
      impDescs.push({ id, layer: layerName(cuStack[li], li), ohms, tol: r.tol, width: r.widths[0] });
    });
  });

  // --- 每個銅層一個 features 檔 ---
  cuStack.forEach((layer, idx) => {
    const sym = SymbolTable();
    const feats = [];
    const onLayer = side => side === '*' || (side === 'F' && idx === 0) || (side === 'B' && idx === cuStack.length - 1);

    (state.components || []).forEach(cp => (cp.pads || []).forEach(pad => {
      if (pad.cu === false || !onLayer(pad.side)) return;
      const p = padAbsFn(cp, pad);
      const s = padSymbol(sym, pad);
      const rot = ((pad.rot || 0) % 360 + 360) % 360;
      feats.push('P ' + N(p.x) + ' ' + NY(p.y) + ' ' + s + ' P ' + N(rot));
      stats.pads++;
    }));

    // 這一層有阻抗需求的線段要指回 impedance.xml 的 Descriptor。
    // 屬性索引固定 0（這個檔只用一個 feature 屬性），對應 @0 .imp_constraint_id。
    let usedImp = false;
    (state.traces || []).forEach(t => {
      if ((t.layer || 'F.Cu') !== layer.id) return;
      const s = sym.round(t.width || 0.3);
      const impId = impIdOf.get(String(t.net || '') + '|' + layer.id);
      if (impId) usedImp = true;
      feats.push('L ' + N(t.x1) + ' ' + NY(t.y1) + ' ' + N(t.x2) + ' ' + NY(t.y2) + ' ' + s + ' P 0' +
        (impId ? ';0=' + impId : ''));
      stats.traces++;
    });

    // 弧：本站的 kicadArcs 用三點定義。ODB++ 的 A 記錄要圓心，這裡用弦線近似並警告。
    const arcs = (state.kicadArcs || []).filter(a => a.layer === layer.id);
    if (arcs.length) {
      if (!warnings.some(w => w.k === 'odb_w_arcs')) warnings.push(T('odb_w_arcs'));
      arcs.forEach(a => {
        const s = sym.round(a.width || 0.3);
        feats.push('L ' + N(a.x1) + ' ' + NY(a.y1) + ' ' + N(a.x2) + ' ' + NY(a.y2) + ' ' + s + ' P 0');
        stats.traces++;
      });
    }

    (state.vias || []).forEach(v => {
      const s = sym.round(v.od || 0.7);
      feats.push('P ' + N(v.x) + ' ' + NY(v.y) + ' ' + s + ' P 0');
    });

    // 鋪銅：布林版（fillPolys）已經是最終該留下的銅，外環寫成 I、內孔寫成 H；
    // 沒有布林結果的才退回畫整塊 zone 外框（那條路本來就沒有內孔可講）。
    const cuZones = (state.userZones || []).filter(z => z.layer === layer.id);
    const pourSurfaces = [];
    let holeCount = 0;
    for (const z of cuZones) {
      if (Array.isArray(z.fillPolys)) {
        for (const is of z.fillPolys) {
          pourSurfaces.push({ outer: is.outer, holes: is.holes || [] });
          holeCount += (is.holes || []).length;
        }
      } else {
        pourSurfaces.push({ outer: z.pts, holes: [] });
      }
    }
    stats.pourHoles = (stats.pourHoles || 0) + holeCount;

    const surfaces = []
      .concat((state.zoneFills || []).filter(z => z.layer === layer.id).map(z => ({ outer: z.pts, holes: [] })))
      .concat(pourSurfaces)
      .concat((state.teardrops || []).filter(t => (t.layer || 'F.Cu') === layer.id).map(t => ({ outer: t.pts, holes: [] })));
    surfaces.forEach(s => {
      if (s.outer && s.outer.length >= 3) feats.push.apply(feats, surface(s.outer, s.holes));
    });

    const lname = layerName(layer, idx);
    files.push({
      name: root + '/steps/' + stepName + '/layers/' + lname + '/features',
      text: featureFile(sym.lines(), feats, usedImp ? ['.imp_constraint_id'] : null)
    });
    // .z0impedance 是**層**的屬性（規格：Float／Entity=Layer，「這一層要求的典型特性阻抗」）。
    // 只有這一層所有需求都指向同一個數字時才寫：兩個不同目標混在同一層，
    // 寫哪一個都是錯的，那時候讓 impedance.xml 逐條講就好。
    const ohmsHere = [...new Set(impDescs.filter(d => d.layer === lname).map(d => d.ohms))];
    if (ohmsHere.length === 1) {
      files.push({
        name: root + '/steps/' + stepName + '/layers/' + lname + '/attrlist',
        text: ['UNITS=MM', '.z0impedance = ' + ohmsHere[0], ''].join(NL)
      });
    }
    stats.layers++;
    stats.features += feats.length;
  });

  // --- 鑽孔層：孔徑用 pad 記錄，跨層關係寫在 matrix 的 START/END ---
  {
    const sym = SymbolTable();
    const feats = [];
    (state.components || []).forEach(cp => (cp.pads || []).forEach(pad => {
      if (!(pad.drill > 0)) return;
      const p = padAbsFn(cp, pad);
      feats.push('P ' + N(p.x) + ' ' + NY(p.y) + ' ' + sym.round(pad.drill) + ' P 0');
      stats.drills++;
    }));
    (state.vias || []).forEach(v => {
      feats.push('P ' + N(v.x) + ' ' + NY(v.y) + ' ' + sym.round(v.drill || 0.3) + ' P 0');
      stats.drills++;
    });
    files.push({
      name: root + '/steps/' + stepName + '/layers/drill/features',
      text: featureFile(sym.lines(), feats)
    });
  }

  // --- 板框 ---
  // --- 阻焊 / 鋼網 / 絲印 ---
  // 空的那一面不產檔：matrix 列了層卻是空檔，CAM 會顯示一個空層，
  // 看圖的人分不出「這面沒東西」與「這面漏了」。
  const extraLayers = [];
  let silkTexts = 0;
  for (const [side, tag] of [['F', 'top'], ['B', 'bot']]) {
    const smSym = SymbolTable();
    const sm = maskFeatures(state, padAbsFn, side, smSym);
    if (sm.length) {
      files.push({ name: root + '/steps/' + stepName + '/layers/sm_' + tag + '/features', text: featureFile(smSym.lines(), sm) });
      extraLayers.push({ name: 'SM_' + tag.toUpperCase(), type: 'SOLDER_MASK' });
      stats.features += sm.length;
    }
    const spSym = SymbolTable();
    const sp = pasteFeatures(state, padAbsFn, side, spSym);
    if (sp.length) {
      files.push({ name: root + '/steps/' + stepName + '/layers/sp_' + tag + '/features', text: featureFile(spSym.lines(), sp) });
      extraLayers.push({ name: 'SP_' + tag.toUpperCase(), type: 'SOLDER_PASTE' });
      stats.features += sp.length;
    }
    const ssSym = SymbolTable();
    const ss = silkFeatures(state, side, ssSym);
    silkTexts += ss.texts;
    if (ss.feats.length) {
      files.push({ name: root + '/steps/' + stepName + '/layers/ss_' + tag + '/features', text: featureFile(ssSym.lines(), ss.feats) });
      extraLayers.push({ name: 'SS_' + tag.toUpperCase(), type: 'SILK_SCREEN' });
      stats.features += ss.feats.length;
    }
  }
  // 絲印文字沒有輸出：ODB++ 的字型是另一套資料結構，半套寫出去 CAM 會顯示亂碼
  if (silkTexts) warnings.push(T('odb_w_silktext', { n: silkTexts }));

  files.push({
    name: root + '/steps/' + stepName + '/profile',
    text: surface(outlineOf(state, warnings)).join(NL) + NL
  });

  // --- 元件 ＋ netlist（v2 補上）---
  // 為什麼要有：CAM 端拿 ODB++ 最想要的兩件事就是「哪個 pad 屬於哪顆料」與
  // 「哪些 pad 該是同一個網路」。前者決定貼片程式，後者決定電測治具生不生得出來。
  // 只有銅層的話，這包 ODB++ 的資訊量其實跟一疊 Gerber 一樣。
  const nets = netTable(state);
  const packages = packageTable(state);
  {
    files.push({
      name: root + '/steps/' + stepName + '/eda/data',
      text: edaData(state, cuStack, nets, packages, layerName, specOf)
    });
    for (const side of ['top', 'bot']) {
      const cmp = componentsFile(state, padAbsFn, side, nets, packages);
      // 那一面沒有元件就不要產生空檔：CAM 工具看到空的 components 檔會當成錯誤
      if (cmp.count) {
        files.push({ name: root + '/steps/' + stepName + '/components/comp_+_' + side, text: cmp.text });
        stats.components = (stats.components || 0) + cmp.count;
      }
    }
    stats.nets = nets.order.length;
  }

  // --- stephdr ---
  const W = state.boardWidth || 100, H = state.boardHeight || 80;
  files.push({
    name: root + '/steps/' + stepName + '/stephdr',
    text: [
      'UNITS=MM',
      'X_DATUM=0',
      'Y_DATUM=0',
      'X_ORIGIN=' + N(-W / 2),
      'Y_ORIGIN=' + N(-H / 2),
      'TOP_ACTIVE=0',
      'BOTTOM_ACTIVE=0',
      'RIGHT_ACTIVE=0',
      'LEFT_ACTIVE=0',
      ''
    ].join(NL)
  });

  // --- matrix：層順序與型別。ODB++ 的價值就在這張表 ---
  const matrix = ['STEP {', '    COL=1', '    NAME=' + stepName.toUpperCase(), '}'];
  cuStack.forEach((layer, idx) => {
    matrix.push('LAYER {',
      '    ROW=' + (idx + 1),
      '    CONTEXT=BOARD',
      '    TYPE=SIGNAL',
      '    NAME=' + layerName(layer, idx).toUpperCase(),
      '    POLARITY=POSITIVE',
      '    START_NAME=',
      '    END_NAME=',
      '}');
  });
  matrix.push('LAYER {',
    '    ROW=' + (cuStack.length + 1),
    '    CONTEXT=BOARD',
    '    TYPE=DRILL',
    '    NAME=DRILL',
    '    POLARITY=POSITIVE',
    '    START_NAME=' + layerName(cuStack[0], 0).toUpperCase(),
    '    END_NAME=' + layerName(cuStack[cuStack.length - 1], cuStack.length - 1).toUpperCase(),
    '}');
  // 阻焊 / 鋼網 / 絲印。只列**實際產出**的那幾層——列了但沒有檔，
  // CAM 會顯示空層，跟「這面本來就沒東西」分不出來。
  let exRow = cuStack.length + 1;
  for (const ex of extraLayers) {
    matrix.push('LAYER {',
      '    ROW=' + (++exRow),
      '    CONTEXT=BOARD',
      '    TYPE=' + ex.type,
      '    NAME=' + ex.name,
      '    POLARITY=POSITIVE',
      '    START_NAME=',
      '    END_NAME=',
      '}');
  }

  // 元件層要進 matrix，CAM 端才找得到 components/ 底下的檔。
  // 只列實際有產出的那一面——列了但檔案不存在，等於叫對方去開一個不存在的檔。
  // row 接在阻焊/鋼網/絲印之後：沿用舊的起算值會跟新層撞號，
  // 而 ROW 撞號的症狀是 CAM 端層序錯亂——打得開、但層是錯的。
  let row = exRow;
  for (const side of ['top', 'bot']) {
    if (!files.some(f => f.name.endsWith('/components/comp_+_' + side))) continue;
    matrix.push('LAYER {',
      '    ROW=' + (++row),
      '    CONTEXT=BOARD',
      '    TYPE=COMPONENT',
      '    NAME=COMP_+_' + side.toUpperCase(),
      '    POLARITY=POSITIVE',
      '    START_NAME=',
      '    END_NAME=',
      '}');
  }
  files.push({ name: root + '/matrix/matrix', text: matrix.join(NL) + NL });

  // --- steps/<step>/impedance.xml：阻抗需求的官方載體（規格 p.128、schema p.496）---
  // Descriptor.Id 是給線段 feature 用 .imp_constraint_id 指回來的；
  // MaxImpIdValUsed 是「用過的最大 Id」，刪掉 Descriptor 之後也不可以重複使用。
  if (impDescs.length) {
    const xml = ['<?xml version="1.0" encoding="UTF-8"?>',
      '<Impedances Version="8.1" MaxImpIdValUsed="' + impDescs.length + '">'];
    for (const d of impDescs) {
      xml.push('  <Descriptor Id="' + d.id + '" TraceLayerName="' + d.layer + '">');
      // 容差走百分比（ValPercent=true）：面板收的就是 %，換算成絕對值只會多一個會走鐘的數字。
      xml.push('    <RequiredImpedance ValOhms="' + d.ohms + '" PlusVal="' + d.tol +
        '" MinusVal="' + d.tol + '" ValPercent="true"/>');
      if (d.width != null) xml.push('    <OriginalTraceWidth Val="' + d.width + '" Units="MM"/>');
      xml.push('  </Descriptor>');
    }
    xml.push('</Impedances>', '');
    files.push({ name: root + '/steps/' + stepName + '/impedance.xml', text: xml.join(NL) });
  }

  // --- misc/netspec.txt：受控阻抗需求的完整表 ---
  // 跟 Gerber 包裡的 -NetSpec.txt 是同一份文字（同一個產生器），拿到哪一包都讀得到同一件事。
  // eda/data 裡的 #IMP 註解只夠 grep；要給人看的表在這裡。
  if (netSpec) {
    files.push({ name: root + '/misc/netspec.txt', text: netSpec.text });
    warnings.push(T('odb_w_netspec'));
  }

  // --- misc/info：不放時間戳，同一塊板匯出兩次要位元組相同（測試要對得起來） ---
  // LAYERS_COUNT 要跟 matrix 的 LAYER 筆數一致。寫成「銅層 + 1」是 2026-08-31 補了
  // 阻焊／鋼版／絲印與元件層之後留下的舊帳：info 說 5 層、matrix 列 11 層，
  // 對得起來的 CAM 會當成這包壞掉。
  const matrixLayers = matrix.filter(l => l === 'LAYER {').length;
  files.push({
    name: root + '/misc/info',
    text: [
      'JOB=' + base,
      'UNITS=MM',
      'ODB_VERSION_MAJOR=8',
      'ODB_VERSION_MINOR=1',
      'ODB_SOURCE=HardwareAI',
      'LAYERS_COUNT=' + matrixLayers,
      'STEPS_COUNT=1',
      ''
    ].join(NL)
  });

  return { files, warnings, stats };
}

export { build, outlineOf as _outlineOf };
