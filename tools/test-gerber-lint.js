// GerberExport 測試：真板生成 + 格式驗證 + 幾何驗證 + ZIP
global.window = global;
global.TextEncoder = require('util').TextEncoder;
const fs = require('fs');
eval(fs.readFileSync('C:/Users/User/Documents/Web/kicad-io.js', 'utf8'));
eval(fs.readFileSync('C:/Users/User/Documents/Web/gerber-export.js', 'utf8'));

let fail = 0;
const eq = (name, got, want, tol) => {
  const ok = tol !== undefined ? Math.abs(got - want) <= tol : got === want;
  if (!ok) { console.log(`FAIL ${name}: got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); fail++; }
  else console.log(`PASS ${name}`);
};

// ---- padOutline 幾何：圓角矩形面積 = w·h − (4−π)r² ----
const shoelace = pts => {
  let a = 0;
  for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; }
  return Math.abs(a) / 2;
};
const ol = window.GerberExport._padOutline(0, 0, 2, 1, 0, 0.25);
eq('圓角矩形面積（16段/角，內接弦差<0.0005）', shoelace(ol), 2 * 1 - (4 - Math.PI) * 0.25 * 0.25, 0.0005);
const ol90 = window.GerberExport._padOutline(5, 3, 2, 1, 90, 0);
eq('旋轉90矩形面積不變', shoelace(ol90), 2, 0.001);
// 旋轉 90 後：寬高互換 → x 範圍應為 ±0.5（圍繞 5）
const xs = ol90.map(p => p[0]);
eq('旋轉90 x 範圍', Math.max(...xs) - Math.min(...xs), 1, 0.001);

// ---- 真板：Olimex RP2040-PICO30 ----
const { model: m } = window.KicadIO.importText(fs.readFileSync('C:/Users/User/Documents/Web/datasheets/pico30-real.kicad_pcb', 'utf8'));
const off = { x: m.bbox.x + m.bbox.w / 2, y: m.bbox.y + m.bbox.h / 2 };
console.log(`zoneFills: ${m.zoneFills.length}（v5 檔灌銅多邊形）| arcsRaw: ${m.arcsRaw.length} | slot pads: ${m.comps.reduce((a, c) => a + c.pads.filter(p => p.slot).length, 0)}`);

// 模擬 pcb.js importKicad 映射
const cuStack = m.cuLayers.map((id, i) => ({ id, kind: 'copper' }));
const state = {
  boardWidth: m.bbox.w, boardHeight: m.bbox.h, layers: m.cuLayers.length,
  layerStack: cuStack.concat([{ id: 'F.SilkS', kind: 'silk' }, { id: 'Edge.Cuts', kind: 'edge' }]),
  components: m.comps.map((c, i) => ({ id: 'k' + i, ref: c.ref, x: c.kx - off.x, y: c.ky - off.y, rot: c.rot, pads: c.pads })),
  traces: m.traces.map(t => ({ ...t, x1: t.x1 - off.x, y1: t.y1 - off.y, x2: t.x2 - off.x, y2: t.y2 - off.y })),
  vias: m.vias.map(v => ({ x: v.x - off.x, y: v.y - off.y, od: v.od, id: v.id })),
  zones: m.zones, edgeSegs: m.edgeSegs.map(e => ({ x1: e.x1 - off.x, y1: e.y1 - off.y, x2: e.x2 - off.x, y2: e.y2 - off.y })),
  zoneFills: m.zoneFills.map(z => ({ layer: z.layer, pts: z.pts.map(p => [p[0] - off.x, p[1] - off.y]) })),
  kicadArcs: m.arcsRaw.map(a => ({ ...a, x1: a.x1 - off.x, y1: a.y1 - off.y, xm: a.xm - off.x, ym: a.ym - off.y, x2: a.x2 - off.x, y2: a.y2 - off.y }))
};
const padAbs = (comp, pad) => {
  const th = (comp.rot || 0) * Math.PI / 180, c = Math.cos(th), s = Math.sin(th);
  return { x: comp.x + pad.x * c + pad.y * s, y: comp.y - pad.x * s + pad.y * c };
};

const r = window.GerberExport.build(state, padAbs, 'pico30');
console.log('檔案: ' + r.files.map(f => f.name).join(', '));
console.log('警告: ' + (r.warnings.join(' | ') || '無'));
eq('銅層檔數', r.files.filter(f => /_Cu\.gbr/.test(f.name)).length, 4);
eq('防焊檔數', r.files.filter(f => /Mask/.test(f.name)).length, 2);
eq('板框檔', r.files.filter(f => /Edge_Cuts/.test(f.name)).length, 1);
eq('鑽孔檔至少 PTH', r.files.filter(f => /\.drl$/.test(f.name)).length >= 1, true);

// ---- Gerber 格式驗證器（獨立實作，不信生成器） ----
function lint(text, name) {
  const errs = [];
  if (!/%FSLAX46Y46\*%/.test(text)) errs.push('缺 FSLAX46Y46');
  if (!/%MOMM\*%/.test(text)) errs.push('缺 MOMM');
  if (!/M02\*\s*$/.test(text)) errs.push('缺 M02 結尾');
  const g36 = (text.match(/G36\*/g) || []).length, g37 = (text.match(/G37\*/g) || []).length;
  if (g36 !== g37) errs.push(`G36/G37 不平衡 ${g36}/${g37}`);
  const defined = new Set([...text.matchAll(/%ADD(\d+)/g)].map(x => x[1]));
  const used = new Set([...text.matchAll(/^D(\d+)\*$/gm)].map(x => x[1]));
  for (const u of used) if (!defined.has(u)) errs.push('光圈 D' + u + ' 未定義');
  // 座標範圍（板 21x51 置中 → |X| ≤ ~11e6、|Y| ≤ ~26.5e6，pad 外伸留 3mm 裕度）
  for (const mt of text.matchAll(/X(-?\d+)Y(-?\d+)D0[123]\*/g)) {
    if (Math.abs(+mt[1]) > 14e6 || Math.abs(+mt[2]) > 29e6) { errs.push('座標超界 ' + mt[0]); break; }
  }
  // 弧線前必有 G75
  if (/G0[23]X/.test(text) && !/G75\*/.test(text)) errs.push('有 G02/G03 但無 G75');
  return errs;
}
for (const f of r.files.filter(x => /\.gbr$/.test(x.name))) {
  const errs = lint(f.text, f.name);
  eq('lint ' + f.name + (f.stats ? `（flash ${f.stats.flash}/draw ${f.stats.draw}/arc ${f.stats.arc}/region ${f.stats.region}）` : ''), errs.join(';'), '');
}

// flash 數合理性：頂層 = F pads(flash或region) + THT + via
const top = r.files.find(f => /F_Cu/.test(f.name));
const fPads = m.comps.reduce((a, c) => a + c.pads.filter(p => p.side === 'F' && p.cu !== false).length, 0); // cu:false=paste/mask 開窗不進銅層
const tht = m.comps.reduce((a, c) => a + c.pads.filter(p => p.side === '*' && p.cu !== false).length, 0);
console.log(`頂層 flash+region=${top.stats.flash + top.stats.region} vs F pads ${fPads}+THT ${tht}+via ${m.vias.length}=${fPads + tht + m.vias.length}（zone region 另計 ${state.zoneFills.filter(z => z.layer === 'F.Cu').length}）`);
eq('頂層元素數吻合', top.stats.flash + top.stats.region, fPads + tht + m.vias.length + state.zoneFills.filter(z => z.layer === 'F.Cu').length);

// 鑽孔檔驗證
const drl = r.files.find(f => /PTH\.drl$/.test(f.name));
eq('Excellon 頭尾', /^M48/.test(drl.text) && /M30\s*$/.test(drl.text), true);
const hitCount = (drl.text.match(/^X-?[\d.]+Y-?[\d.]+$/gm) || []).length;
const slotCount = (drl.text.match(/G85/g) || []).length;
console.log(`PTH 鑽孔 ${hitCount} + 開槽 ${slotCount}（via ${m.vias.length} + THT 圓孔）`);
eq('鑽孔數 ≥ via 數', hitCount >= m.vias.length, true);

// ---- ZIP 產出 + 落檔（PowerShell 解壓驗證在外部） ----
const zip = window.GerberExport.zipStore(r.files.map(f => ({ name: f.name, text: f.text })));
fs.writeFileSync('C:/Users/User/AppData/Local/Temp/claude/C--Users-User-Hardware/f963c232-f8d2-4539-98f0-5b31418967ef/scratchpad/pico30-gerber.zip', Buffer.from(zip));
console.log('zip bytes: ' + zip.length);
// 落檔各 gerber 供人工/外部檢視
r.files.forEach(f => fs.writeFileSync('C:/Users/User/AppData/Local/Temp/claude/C--Users-User-Hardware/f963c232-f8d2-4539-98f0-5b31418967ef/scratchpad/gerber-out-' + f.name, f.text));

console.log(fail ? `\n${fail} FAILURES` : '\nALL PASS');
process.exit(fail ? 1 : 0);
