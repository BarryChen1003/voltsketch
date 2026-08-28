/**
 * assembly.mjs — 組裝圖（Assembly Drawing）
 *
 * 為什麼要有：Gerber 與 ODB++ 是給機器看的，產線的人要的是另一張圖——
 * 每顆料在哪、第 1 腳朝哪、哪些是不貼的（DNP）、極性元件的方向。
 * 沒有這張圖，貼片廠會打電話來問，或者更糟：自己猜。
 *
 * 產出 SVG（可直接列印或轉 PDF）。為什麼是 SVG 不是 PDF：
 *   PDF 要自己寫字型嵌入與壓縮，那是一大包程式碼；SVG 瀏覽器與印表機都吃，
 *   而且是文字檔——出問題可以直接開起來看是哪一行畫錯。
 *
 * 一面一張（頂面／底面），因為產線是分兩次過爐的。
 * 底面那張**左右鏡射**：那是站在板子底下看的視角，跟實際作業一致。
 *
 * 誠實界定：
 *   - 元件外形用 courtyard 方框近似，不畫真實輪廓（我們沒有那個資料）。
 *   - 第 1 腳標記畫在 pad 1 的位置；沒有 pad 1 的元件不標。
 *   - 極性元件（二極體、電解電容、LED）目前只靠 refdes 前綴判斷。
 *
 * 純計算，不碰 DOM。測試：assembly.test.js
 */
'use strict';

const NL = String.fromCharCode(10);
const T = (k, vars) => ({ k, v: vars || {} });
const N = v => (Math.round((Number(v) + Number.EPSILON) * 1000) / 1000);
const X = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

// 極性元件：方向錯了就是壞的，圖上一定要標出來。
// 靠 refdes 前綴判斷是粗糙的，但比不標好——標錯的成本是「多看一眼」，
// 不標的成本是「整批裝反」。
const POLARISED = /^(D|LED|CR|C[ET]|U|Q|IC|Y|X)\d/i;

function isPolarised(c) {
  const ref = String(c.ref || '');
  if (POLARISED.test(ref)) return true;
  // 電解電容常寫成 C1 但封裝名帶 elec/tant
  return /elec|tant|polar/i.test(String(c.part || ''));
}

/**
 * @param opts { side:'top'|'bottom', dnp:[refdes…], title }
 * @returns { name, text }  一張 SVG
 */
function sheet(state, padAbsFn, opts) {
  const o = opts || {};
  const side = o.side === 'bottom' ? 'bottom' : 'top';
  const dnp = new Set((o.dnp || []).map(String));
  const W = state.boardWidth || 100, H = state.boardHeight || 80;
  const M = 8;                                   // 圖框留白（mm）

  // 底面：左右鏡射（站在板子底下看）。這一步錯了，整張圖的左右會相反，
  // 而產線的人不會懷疑圖，只會把料貼到錯的地方。
  const fx = side === 'bottom' ? -1 : 1;
  const px = x => N(fx * x);
  const py = y => N(y);                          // SVG 的 y 本來就向下，跟 state 一致

  const el = [];
  el.push('<?xml version="1.0" encoding="UTF-8"?>');
  el.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + (W + 2 * M) + 'mm" height="' + (H + 2 * M + 12) + 'mm"' +
    ' viewBox="' + (-W / 2 - M) + ' ' + (-H / 2 - M) + ' ' + (W + 2 * M) + ' ' + (H + 2 * M + 12) + '">');
  el.push('<style>');
  el.push('  .brd{fill:none;stroke:#000;stroke-width:0.25}');
  el.push('  .body{fill:#fff;stroke:#333;stroke-width:0.12}');
  el.push('  .dnp{fill:#f2f2f2;stroke:#999;stroke-width:0.12;stroke-dasharray:0.6 0.4}');
  el.push('  .pin1{fill:#000}');
  el.push('  .pol{fill:none;stroke:#000;stroke-width:0.18}');
  el.push('  .ref{font-family:sans-serif;font-size:0.9px;text-anchor:middle;dominant-baseline:middle;fill:#000}');
  el.push('  .ttl{font-family:sans-serif;font-size:2.2px;fill:#000}');
  el.push('  .sub{font-family:sans-serif;font-size:1.4px;fill:#444}');
  el.push('</style>');

  // 板框
  const outline = (state.edgeSegs || []).filter(s => Number.isFinite(s.x1));
  if (outline.length >= 3) {
    for (const s of outline) {
      el.push('<line class="brd" x1="' + px(s.x1) + '" y1="' + py(s.y1) + '" x2="' + px(s.x2) + '" y2="' + py(s.y2) + '"/>');
    }
  } else {
    el.push('<rect class="brd" x="' + N(-W / 2) + '" y="' + N(-H / 2) + '" width="' + N(W) + '" height="' + N(H) + '"/>');
  }

  let placed = 0, skipped = 0, dnpCount = 0;
  const rows = [];

  for (const c of (state.components || [])) {
    const cside = (c.side === 'bottom' || c.side === 'B') ? 'bottom' : 'top';
    if (cside !== side) { skipped++; continue; }
    const isDnp = dnp.has(String(c.ref));
    if (isDnp) dnpCount++;
    placed++;

    const w = Math.max(0.6, c.w || 2), h = Math.max(0.6, c.h || 2);
    const rot = ((c.rot || 0) % 360 + 360) % 360;
    // 鏡射之後旋轉方向也要反，否則元件會朝錯的方向
    const drawRot = side === 'bottom' ? -rot : rot;
    const g = 'transform="translate(' + px(c.x) + ',' + py(c.y) + ') rotate(' + N(drawRot) + ')"';

    el.push('<g ' + g + '>');
    el.push('  <rect class="' + (isDnp ? 'dnp' : 'body') + '" x="' + N(-w / 2) + '" y="' + N(-h / 2) +
      '" width="' + N(w) + '" height="' + N(h) + '"/>');

    // 第 1 腳標記：一個實心小圓，畫在 pad 1 的相對位置
    const p1 = (c.pads || []).find(p => String(p.num) === '1' || String(p.num) === 'A1');
    if (p1) {
      const r = Math.min(0.35, Math.max(w, h) / 8);
      el.push('  <circle class="pin1" cx="' + N(p1.x) + '" cy="' + N(p1.y) + '" r="' + N(r) + '"/>');
    }

    // 極性元件：外框加一條斜切角（業界慣例的 chamfer）
    if (isPolarised(c) && !isDnp) {
      const k = Math.min(w, h) * 0.3;
      el.push('  <polyline class="pol" points="' +
        N(-w / 2) + ',' + N(-h / 2 + k) + ' ' + N(-w / 2 + k) + ',' + N(-h / 2) + '"/>');
    }
    el.push('</g>');

    // refdes：不隨元件旋轉（旋轉的字很難讀），畫在元件正上方
    el.push('<text class="ref" x="' + px(c.x) + '" y="' + N(c.y - h / 2 - 0.6) + '">' + X(c.ref || '') + '</text>');

    rows.push({ ref: c.ref || '', part: c.part || '', x: N(c.x), y: N(c.y), rot: N(rot), dnp: isDnp });
  }

  // 標題列
  const yTitle = H / 2 + M - 2;
  el.push('<text class="ttl" x="' + N(-W / 2) + '" y="' + N(yTitle) + '">' +
    X((o.title || 'Assembly') + ' — ' + (side === 'top' ? 'TOP' : 'BOTTOM' + ' (mirrored)')) + '</text>');
  el.push('<text class="sub" x="' + N(-W / 2) + '" y="' + N(yTitle + 3) + '">' +
    X(placed + ' parts' + (dnpCount ? ' / ' + dnpCount + ' DNP' : '') +
      '   ● = pin 1   dashed = do not populate') + '</text>');

  el.push('</svg>');

  return {
    name: (o.base || 'board') + '-assembly-' + side + '.svg',
    text: el.join(NL) + NL,
    stats: { side, placed, dnp: dnpCount, skipped },
    rows,
  };
}

/**
 * 兩面各一張 ＋ 一份放置清單 CSV（產線常常直接用這個對）。
 * @returns { files, warnings, stats }
 */
function build(state, padAbsFn, baseName, opts) {
  const o = opts || {};
  const base = String(baseName || 'hardwareai').replace(/[^\w.-]/g, '_') || 'hardwareai';
  const warnings = [T('asm_w_body')];            // 元件外形是 courtyard 方框近似
  const files = [];
  const stats = { top: 0, bottom: 0, dnp: 0 };

  for (const side of ['top', 'bottom']) {
    const s = sheet(state, padAbsFn, { side, dnp: o.dnp, base, title: o.title || base });
    // 那一面沒有元件就不出圖：一張空的組裝圖只會讓人以為漏了東西
    if (!s.stats.placed) continue;
    files.push({ name: s.name, text: s.text });
    stats[side] = s.stats.placed;
    stats.dnp += s.stats.dnp;
  }

  if (!files.length) return { files: [], warnings: [T('asm_w_nocomp')], stats };

  // 放置清單：跟 CPL 的差別是這份含 DNP 標記與封裝名，是給人看的
  const csv = ['Designator,Part,Side,MidX(mm),MidY(mm),Rotation,Populate'];
  for (const c of (state.components || [])) {
    if (!(c.pads || []).length) continue;
    const side = (c.side === 'bottom' || c.side === 'B') ? 'Bottom' : 'Top';
    const isDnp = (o.dnp || []).map(String).includes(String(c.ref));
    csv.push([c.ref || '', c.part || '', side, N(c.x), N(-c.y),
      N(((c.rot || 0) % 360 + 360) % 360), isDnp ? 'No' : 'Yes'].join(','));
  }
  files.push({ name: base + '-placement.csv', text: csv.join(NL) + NL });

  return { files, warnings, stats };
}

export { build, sheet, isPolarised as _isPolarised };
