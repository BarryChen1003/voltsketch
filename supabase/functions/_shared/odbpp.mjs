/**
 * odbpp.mjs — ODB++ 匯出（銅層 / 鑽孔 / 板框）。
 *
 * 為什麼有這支：Gerber 是一疊互不相識的影像檔，板廠要靠檔名猜哪張是哪層；
 * ODB++ 把層別、疊構、鑽孔跨層關係寫在資料裡（matrix），CAM 端不必猜。
 *
 * 誠實界定（v1 就這麼多，不要對外宣稱「完整 ODB++」）：
 *   有：matrix/matrix、misc/info、steps/pcb/stephdr、profile（板框）、
 *       每個銅層的 features（pad / 走線 / via / 鋪銅 / 淚滴）、drill 層。
 *   沒有：阻焊、絲印、鋼網、元件（CMP）、netlist（cadnet）、attributes、字型。
 *       這幾樣仍以 Gerber 打版包為準——ODB++ 這包是給 CAM 端看層別與鑽孔關係的，
 *       不是拿來取代打版包。build() 會把這件事放進 warnings 帶回前端。
 *   幾何：弧輸出成弦線近似（與 Gerber 的 arc3 不同），roundrect pad 用 rect 近似。
 *       兩者都在 warnings 裡講明。
 *
 * 座標：ODB++ 用右手座標（Y 向上），本站 state 是 Y 向下，所以 Y 一律取負。
 * 單位：mm（misc/info 的 UNITS=MM 與 stephdr 一致）。
 */

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

function surface(pts) {
  const out = ['S P 0', 'OB ' + N(pts[0][0]) + ' ' + NY(pts[0][1]) + ' I'];
  for (let i = 1; i < pts.length; i++) out.push('OS ' + N(pts[i][0]) + ' ' + NY(pts[i][1]));
  out.push('OS ' + N(pts[0][0]) + ' ' + NY(pts[0][1]), 'OE', 'SE');
  return out;
}

function featureFile(symLines, feats) {
  return ['#', '#Feature symbol names', '#']
    .concat(symLines)
    .concat(['#', '#Layer features', '#'])
    .concat(feats)
    .join(NL) + NL;
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

    (state.traces || []).forEach(t => {
      if ((t.layer || 'F.Cu') !== layer.id) return;
      const s = sym.round(t.width || 0.3);
      feats.push('L ' + N(t.x1) + ' ' + NY(t.y1) + ' ' + N(t.x2) + ' ' + NY(t.y2) + ' ' + s + ' P 0');
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

    const surfaces = []
      .concat((state.zoneFills || []).filter(z => z.layer === layer.id).map(z => z.pts))
      .concat((state.userZones || []).filter(z => z.layer === layer.id).map(z => z.pts))
      .concat((state.teardrops || []).filter(t => (t.layer || 'F.Cu') === layer.id).map(t => t.pts));
    surfaces.forEach(pts => { if (pts && pts.length >= 3) feats.push.apply(feats, surface(pts)); });

    files.push({
      name: root + '/steps/' + stepName + '/layers/' + layerName(layer, idx) + '/features',
      text: featureFile(sym.lines(), feats)
    });
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
  files.push({
    name: root + '/steps/' + stepName + '/profile',
    text: surface(outlineOf(state, warnings)).join(NL) + NL
  });

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
  files.push({ name: root + '/matrix/matrix', text: matrix.join(NL) + NL });

  // --- misc/info：不放時間戳，同一塊板匯出兩次要位元組相同（測試要對得起來） ---
  files.push({
    name: root + '/misc/info',
    text: [
      'JOB=' + base,
      'UNITS=MM',
      'ODB_VERSION_MAJOR=8',
      'ODB_VERSION_MINOR=1',
      'ODB_SOURCE=HardwareAI',
      'LAYERS_COUNT=' + (cuStack.length + 1),
      'STEPS_COUNT=1',
      ''
    ].join(NL)
  });

  return { files, warnings, stats };
}

export { build, outlineOf as _outlineOf };
