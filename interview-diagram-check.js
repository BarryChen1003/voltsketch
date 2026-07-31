#!/usr/bin/env node
/**
 * interview-diagram-check.js — 面試題庫圖表的 CI 守衛
 *
 * 擋兩類回歸：
 *   1) 規格：每張 SVG 要有 width/height 屬性、viewBox 寬 <= 720、字級 >= 10
 *   2) 圖字重疊：文字不得壓到方塊/走線/其他文字，也不得出界（鐵律）
 *
 * 這是「估算器」，不是實測：node 沒有 DOM，字寬靠下面的字元寬度表推算。
 * 表是在瀏覽器實測 1051 個文字節點量出來的（每字元的前進寬度，單位 1/1000 em），
 * 校正後每種字重的「實測/估算」比值：中位數 1.000、範圍 0.928-1.043（最差低估 4.3 趴）。
 *
 * 兩個容差是配套的，別單獨調：
 *   SAFETY = 1.05  字寬往寬抓，覆蓋最差 4.3 趴低估
 *   TOL    = 2.0   必須真的疊超過 2px 才報
 * 為什麼不是瀏覽器版的 0.5px：估算誤差本身就有 ±4%，在 11px 字上約 ±1.5px，
 * 用 0.5px 會把「刻意留 1-2px 邊距」的合法排版全部報成重疊（實測會多出 33 筆誤報）。
 * 2px 以下的擦邊肉眼看不出來，2px 以上才是真的疊到。
 *
 * 驗收要用瀏覽器實測（overlap-audit.md 有可貼到 console 的權威版本，門檻 0.5px）。
 * 本檔的定位跟 svg-overlap-check.js 一樣：擋 CI 回歸。
 *
 * 用法：
 *   node interview-diagram-check.js            # 有任何發現就 exit 1
 *   node interview-diagram-check.js --max=2    # 容許 N 個已知誤報
 *   node interview-diagram-check.js --verbose  # 列出每張圖的統計
 *   node interview-diagram-check.js path/to/bank.js   # 檢查別的 bank（負向測試用）
 */

const path = require('path');

/* ---------- 字元寬度表（瀏覽器實測，1/1000 em，每字元 4 位數） ----------
 * 4 位數不是隨便挑的：粗體 'M' 是 1.005 em，用 3 位會爆位、整條表往後錯開，
 * 粗體字寬會全錯（實測踩過：估算誤差從 3 趴變成 19 趴，還誤報了 4 筆重疊）。 */
const CHARS = " #%&()*+,-./0123456789:;<=>ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_abcdefghijklmnopqrstuvwxyz~▲";
const W = {
  normal: '0274059108180800030203020417068402170400021703900539053905390539053905390539053905390539021702170684068406840645057305940701050604880686071002660320058004710898074807540560075405980531054206870621093405900553057003020302068404150509058804620589052303130589056602420242049702420861056605860588058903480424033905660479072304590484045206840861',
  bold:   '0276059208670850036903690455070702710404027104430575057505750575057505750575057505750575027102710707070707070703064105960737053205200711076603170422064905110957079007580614075806530561060507230667100506550607060703690369070704150538062004800619054103830619060202840298055902840916060506110620061903980440038906050542079705520538047907070861',
  mono:   '0550055005500550055005500550055005500550055005500550055005500550055005500550055005500550055005500550055005500550055005500550055005500550055005500550055005500550055005500550055005500550055005500550055005500550055005500550055005500550055005500550055005500550055005500550055005500550055005500550055005500550055005500550055005500550055005500550',
};
const TABLE = {};
for (const k of Object.keys(W)) {
  if (W[k].length !== CHARS.length * 4) throw new Error('width table length mismatch: ' + k);
  TABLE[k] = {};
  [...CHARS].forEach((c, i) => { TABLE[k][c] = +W[k].slice(i * 4, i * 4 + 4) / 1000; });
}
const SAFETY = 1.05;      // 字寬安全係數（見檔頭：與 TOL 配套；實測最差低估 4.3 趴）
const TOL = 2.0;          // 疊超過這個像素數才算數（估算誤差在 11px 字上約 ±1.5px）
const ASCENT = 1.08;      // 基線以上（實測值，字型行高盒；不是每字不同，量過三種字重都一樣）
const DESCENT = 0.25;     // 基線以下（同上；垂直方向不再額外灌水，餘裕統一交給 TOL）
const FALLBACK_W = 0.6;   // 表外字元（CJK 等）保守給 0.6 em

/* ---------- 規格 ---------- */
const MAX_VIEWBOX_W = 720;
const MIN_FONT = 10;

/* ---------- 極小的 SVG 屬性解析 ---------- */
const attrs = tag => {
  const o = {};
  for (const m of tag.matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/g)) o[m[1]] = m[2];
  return o;
};
const num = (v, d = 0) => (v === undefined || v === '' || isNaN(+v) ? d : +v);

const textWidth = (s, fs, fam, weight) => {
  const t = fam === 'monospace' ? TABLE.mono : (weight === 'bold' ? TABLE.bold : TABLE.normal);
  const collapsed = s.replace(/\s+/g, ' ').trim();   // 瀏覽器預設會摺疊連續空白
  let em = 0;
  for (const c of collapsed) em += (t[c] !== undefined ? t[c] : FALLBACK_W);
  return em * fs * SAFETY;
};

const textBox = tag => {
  const a = attrs(tag);
  const inner = tag.replace(/^<text[^>]*>/, '').replace(/<\/text>$/, '');
  const s = inner.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  if (!s.trim()) return null;
  const fs = num(a['font-size'], 11);
  const w = textWidth(s, fs, a['font-family'], a['font-weight']);
  const x = num(a.x), y = num(a.y);
  const anchor = a['text-anchor'] || 'start';
  const left = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
  return { s: s.trim(), fs, x: left, y: y - ASCENT * fs, width: w, height: (ASCENT + DESCENT) * fs };
};

/* ---------- 幾何 ---------- */
const overlap = (a, b) =>
  a.x < b.x + b.width - TOL && a.x + a.width > b.x + TOL &&
  a.y < b.y + b.height - TOL && a.y + a.height > b.y + TOL;

// 線段 vs 矩形：slab 法（拿線段 bbox 當障礙會讓斜線嚴重誤判）
const segHitsRect = (x1, y1, x2, y2, r, pad) => {
  const rx1 = r.x - pad, ry1 = r.y - pad, rx2 = r.x + r.width + pad, ry2 = r.y + r.height + pad;
  if (Math.max(x1, x2) < rx1 || Math.min(x1, x2) > rx2) return false;
  if (Math.max(y1, y2) < ry1 || Math.min(y1, y2) > ry2) return false;
  const dx = x2 - x1, dy = y2 - y1;
  let t0 = 0, t1 = 1;
  const clip = (p, q) => {
    if (p === 0) return q >= 0;
    const t = q / p;
    if (p < 0) { if (t > t1) return false; if (t > t0) t0 = t; }
    else { if (t < t0) return false; if (t < t1) t1 = t; }
    return true;
  };
  return clip(-dx, x1 - rx1) && clip(dx, rx2 - x1) && clip(-dy, y1 - ry1) && clip(dy, ry2 - y1);
};

const pointsOf = (tag, name) => {
  const a = attrs(tag), out = [];
  if (name === 'path') {
    let cx = 0, cy = 0;
    (a.d || '').replace(/([MHVLZ])\s*([-\d.,\s]*)/gi, (_, cmd, args) => {
      const n = args.trim().split(/[\s,]+/).filter(v => v !== '').map(Number);
      const c = cmd.toUpperCase();
      if (c === 'M') { cx = n[0]; cy = n[1]; out.push([cx, cy]); }
      else if (c === 'L') { for (let i = 0; i < n.length; i += 2) { cx = n[i]; cy = n[i + 1]; out.push([cx, cy]); } }
      else if (c === 'H') { n.forEach(v => { cx = v; out.push([cx, cy]); }); }
      else if (c === 'V') { n.forEach(v => { cy = v; out.push([cx, cy]); }); }
      else if (c === 'Z' && out.length) out.push(out[0]);
      return '';
    });
  } else {
    (a.points || '').trim().split(/\s+/).forEach(p => {
      const v = p.split(',').map(Number);
      if (v.length === 2 && v.every(x => !isNaN(x))) out.push(v);
    });
    if (name === 'polygon' && out.length) out.push(out[0]);
  }
  return out;
};

/* ---------- 檢查單張圖 ---------- */
function checkSvg(id, svg) {
  const findings = [];
  const rootTag = svg.match(/<svg[^>]*>/)[0];
  const ra = attrs(rootTag);
  const vb = (ra.viewBox || '').split(/\s+/).map(Number);
  if (vb.length !== 4 || vb.some(isNaN)) {
    findings.push({ id, kind: 'spec', text: '', why: 'viewBox 缺失或格式錯誤' });
    return findings;
  }
  if (!ra.width || !ra.height) findings.push({ id, kind: 'spec', text: '', why: 'svg 缺 width/height 屬性（CSS 靠它決定自然寬度）' });
  if (vb[2] > MAX_VIEWBOX_W) findings.push({ id, kind: 'spec', text: '', why: `viewBox 寬 ${vb[2]} > ${MAX_VIEWBOX_W}` });

  const tags = svg.match(/<(text[^>]*>[^<]*<\/text|line[^>]*|rect[^>]*|circle[^>]*|path[^>]*|polyline[^>]*|polygon[^>]*)>/g) || [];
  const texts = [], rects = [], segs = [];

  for (const t of tags) {
    const name = t.slice(1).match(/^[\w]+/)[0];
    const a = attrs(t);
    if (name === 'text') {
      const b = textBox(t);
      if (!b) continue;
      if (b.fs < MIN_FONT) findings.push({ id, kind: 'spec', text: b.s.slice(0, 20), why: `字級 ${b.fs} < ${MIN_FONT}` });
      texts.push(b);
    } else if (name === 'rect') {
      const r = { x: num(a.x), y: num(a.y), width: num(a.width), height: num(a.height) };
      if (r.width >= vb[2] - 1 && r.height >= vb[3] - 1) continue;   // 整張底色不算障礙
      rects.push(r);
    } else if (name === 'circle') {
      const r = num(a.r);
      rects.push({ x: num(a.cx) - r, y: num(a.cy) - r, width: r * 2, height: r * 2, isDot: true });
    } else if (name === 'line') {
      const sw = num(a['stroke-width'], 2);
      if (sw < 1.2) continue;
      segs.push({ x1: num(a.x1), y1: num(a.y1), x2: num(a.x2), y2: num(a.y2), pad: sw / 2 });
    } else {
      if (num(a['stroke-opacity'], 1) < 0.5) continue;               // 半透明高亮帶本來就疊在線路上
      const sw = num(a['stroke-width'], 1.5);
      const P = pointsOf(t, name);
      for (let i = 1; i < P.length; i++) segs.push({ x1: P[i - 1][0], y1: P[i - 1][1], x2: P[i][0], y2: P[i][1], pad: sw / 2 });
    }
  }

  // 文字中心落在某方塊內 → 那是該方塊自己的標題，合法
  const inOwn = b => {
    const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
    return rects.some(r => !r.isDot && cx > r.x && cx < r.x + r.width && cy > r.y && cy < r.y + r.height);
  };

  texts.forEach((t, i) => {
    if (inOwn(t)) return;
    if (t.x < vb[0] - 1 || t.y < vb[1] - 1 || t.x + t.width > vb[0] + vb[2] + 1 || t.y + t.height > vb[1] + vb[3] + 1) {
      findings.push({ id, kind: 'overlap', text: t.s.slice(0, 20), why: '出界' });
      return;
    }
    const hitRect = rects.find(r => overlap(t, r));
    if (hitRect) {
      findings.push({ id, kind: 'overlap', text: t.s.slice(0, 20),
        why: `壓方塊 rect(${hitRect.x},${hitRect.y},${hitRect.width}x${hitRect.height}) vs text(${t.x.toFixed(1)},${t.y.toFixed(1)},${t.width.toFixed(1)}x${t.height.toFixed(1)})` });
      return;
    }
    const shrunk = { x: t.x + TOL, y: t.y + TOL, width: Math.max(t.width - 2 * TOL, 1), height: Math.max(t.height - 2 * TOL, 1) };
    const hitSeg = segs.find(s => segHitsRect(s.x1, s.y1, s.x2, s.y2, shrunk, s.pad));
    if (hitSeg) { findings.push({ id, kind: 'overlap', text: t.s.slice(0, 20), why: `壓線 (${hitSeg.x1},${hitSeg.y1})-(${hitSeg.x2},${hitSeg.y2})` }); return; }
    const hitText = texts.find((o, j) => j !== i && overlap(t, o));
    if (hitText) findings.push({ id, kind: 'overlap', text: t.s.slice(0, 20),
      why: `壓文字 "${hitText.s.slice(0, 14)}"  a(${t.x.toFixed(1)},${t.y.toFixed(1)},${t.width.toFixed(1)}) b(${hitText.x.toFixed(1)},${hitText.y.toFixed(1)},${hitText.width.toFixed(1)})` });
  });

  return findings;
}

/* ---------- 主流程 ---------- */
const args = process.argv.slice(2);
const maxAllowed = (() => { const m = args.find(a => a.startsWith('--max=')); return m ? +m.split('=')[1] : 0; })();
const verbose = args.includes('--verbose');
// 可指定其他 bank 檔（測試用；不給就檢查同目錄的 interview-bank.js）
const bankPath = args.find(a => !a.startsWith('--')) || path.join(__dirname, 'interview-bank.js');

global.window = {};
require(path.resolve(bankPath));
const bank = global.window.INTERVIEW_BANK || [];

let diagrams = 0, textCount = 0;
const findings = [];
const missing = [];

bank.forEach(q => {
  if (!/<svg/.test(q.zh.answer)) missing.push(q.id);
  ['zh', 'en'].forEach(lang => {
    const m = q[lang] && q[lang].answer && q[lang].answer.match(/<svg[\s\S]*?<\/svg>/);
    if (!m) return;
    diagrams++;
    textCount += (m[0].match(/<text/g) || []).length;
    const f = checkSvg(q.id + '.' + lang, m[0]);
    findings.push(...f);
    if (verbose) console.log(`  ${q.id}.${lang}  texts=${(m[0].match(/<text/g) || []).length}  findings=${f.length}`);
  });
});

console.log(`interview-diagram-check: ${bank.length} 題 / ${diagrams} 張圖 / ${textCount} 個文字`);
if (missing.length) console.log(`沒有圖的題：${missing.join(', ')}`);

const spec = findings.filter(f => f.kind === 'spec');
const over = findings.filter(f => f.kind === 'overlap');
spec.forEach(f => console.log(`  SPEC    ${f.id}  ${f.text ? '「' + f.text + '」  ' : ''}${f.why}`));
over.forEach(f => console.log(`  OVERLAP ${f.id}  「${f.text}」  ${f.why}`));

const total = findings.length;
if (total > maxAllowed) {
  console.log(`\nFAIL：${total} 個發現（容許 ${maxAllowed}）`);
  console.log('估算器誤報請用 overlap-audit.md 的瀏覽器實測版確認後，再決定調 --max 還是修圖。');
  process.exit(1);
}
console.log(`\nPASS（發現 ${total}，容許 ${maxAllowed}）`);
