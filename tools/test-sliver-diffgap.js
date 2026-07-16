// 阻焊 sliver + 差分對間距 DRC 測試
global.window = global;
// i18n.js 需要的最小 stub（訊息已 key 化，載 i18n.js 才能還原 zh 文字給下方 regex 斷言）
global.localStorage = { getItem: () => null, setItem: () => { } };
global.document = { readyState: 'loading', addEventListener: () => { } };
const fs = require('fs');
eval(fs.readFileSync('C:/Users/User/Documents/Web/i18n.js', 'utf8'));
eval(fs.readFileSync('C:/Users/User/Documents/Web/pcb-drc.js', 'utf8'));
eval(fs.readFileSync('C:/Users/User/Documents/Web/pcb-rules.js', 'utf8'));

let fail = 0;
const chk = (name, cond) => { console.log((cond ? 'PASS ' : 'FAIL ') + name); if (!cond) fail++; };
const padAbs = (c, p) => {
  const th = (c.rot || 0) * Math.PI / 180, co = Math.cos(th), si = Math.sin(th);
  return { x: c.x + p.x * co + p.y * si, y: c.y - p.x * si + p.y * co };
};
const RULES = { clearance: { traceToTrace: 0.15, traceToPad: 0.15, padToPad: 0.15, traceToEdge: 0.3, viaToVia: 0.15, holeToHole: 0.25 }, via: { minDrill: 0.2, minRing: 0.15 }, maskSliver: 0.15 };
const mkPad = (num, x, y, w, h, net) => ({ num: String(num), x, y, rot: 0, w, h, shape: 'rect', drill: 0, side: 'F', type: 'smd', net: net || 'N' + num, cu: true });
const board = comps => ({ boardWidth: 50, boardHeight: 40, layers: 2, components: comps, traces: [], vias: [], zones: [], zoneFills: [], edgeSegs: [], layerStack: [{ id: 'F.Cu', kind: 'copper' }, { id: 'B.Cu', kind: 'copper' }] });

// --- sliver 案例 ---
// A: 兩 pad 邊距 0.10（1×1 pad，中心距 1.10）→ sliver warning
let r = window.PadDrc.run(board([{ ref: 'U1', x: 0, y: 0, rot: 0, pads: [mkPad(1, -0.55, 0, 1, 1), mkPad(2, 0.55, 0, 1, 1)] }]), padAbs, RULES);
chk('sliver 0.10 → 報 warning', r.some(x => /阻焊橋/.test(x.message) && x.type === 'warning'));
// B: 邊距 0.20 → 不報
r = window.PadDrc.run(board([{ ref: 'U1', x: 0, y: 0, rot: 0, pads: [mkPad(1, -0.60, 0, 1, 1), mkPad(2, 0.60, 0, 1, 1)] }]), padAbs, RULES);
chk('sliver 0.20 → 不報', !r.some(x => /阻焊橋/.test(x.message)));
// C: 重疊（合併開窗）→ 不報 sliver（pad 間距 error 另計，同 net 避開）
r = window.PadDrc.run(board([{ ref: 'U1', x: 0, y: 0, rot: 0, pads: [mkPad(1, -0.3, 0, 1, 1, 'X'), mkPad(2, 0.3, 0, 1, 1, 'X')] }]), padAbs, RULES);
chk('重疊開窗 → 不報 sliver', !r.some(x => /阻焊橋/.test(x.message)));
// D: 異面（F vs B）→ 不報
const pB = mkPad(2, 0.55, 0, 1, 1); pB.side = 'B';
r = window.PadDrc.run(board([{ ref: 'U1', x: 0, y: 0, rot: 0, pads: [mkPad(1, -0.55, 0, 1, 1), pB] }]), padAbs, RULES);
chk('異面 → 不報 sliver', !r.some(x => /阻焊橋/.test(x.message)));
// E: QFN 0.5 pitch（pad 寬 0.3，邊距 0.2）→ 預設 0.15 不報（不洗版）
const qfnPads = []; for (let i = 0; i < 4; i++) qfnPads.push(mkPad(i + 1, -2.5, (i - 1.5) * 0.5, 0.9, 0.3));
r = window.PadDrc.run(board([{ ref: 'U2', x: 0, y: 0, rot: 0, pads: qfnPads }]), padAbs, RULES);
chk('QFN 0.5 pitch → 預設不報', !r.some(x => /阻焊橋/.test(x.message)));

// --- 差分對間距案例 ---
const rules = [{ pattern: '/^USB_D[PN]$/', minW: 0, maxLen: 0, pairTol: 0, gap: 0.2 }];
const mkTrace = (net, x1, y1, x2, y2, w) => ({ net, x1, y1, x2, y2, width: w || 0.2, layer: 'F.Cu' });
// A: 平行 gap 0.2（中心距 0.4，寬 0.2）全程耦合 → 無報
let res = window.NetRules.audit(rules, { traces: [mkTrace('USB_DP', 0, 0, 10, 0), mkTrace('USB_DN', 0, 0.4, 10, 0.4)] });
chk('耦合 ok → 無報', res.length === 0);
// B: gap 0.05（過近，中心距 0.25）→ error
res = window.NetRules.audit(rules, { traces: [mkTrace('USB_DP', 0, 0, 10, 0), mkTrace('USB_DN', 0, 0.25, 10, 0.25)] });
chk('過近 → error', res.some(x => x.type === 'error' && /過近/.test(x.message)));
// C: 一半路徑分開跑（gap 2mm）→ 未耦合 50% > 20% → warning
res = window.NetRules.audit(rules, { traces: [
  mkTrace('USB_DP', 0, 0, 10, 0), mkTrace('USB_DP', 10, 0, 20, 0),
  mkTrace('USB_DN', 0, 0.4, 10, 0.4), mkTrace('USB_DN', 10, 2.4, 20, 2.4)] });
chk('未耦合 50% → warning', res.some(x => x.type === 'warning' && /耦合不足/.test(x.message)));
// D: 異層不算耦合 → 全程未耦合 warning
res = window.NetRules.audit(rules, { traces: [mkTrace('USB_DP', 0, 0, 10, 0), { ...mkTrace('USB_DN', 0, 0.4, 10, 0.4), layer: 'B.Cu' }] });
chk('異層 → 耦合不足 warning', res.some(x => /耦合不足/.test(x.message)));
// E: gap=0 規則 → 不查
res = window.NetRules.audit([{ pattern: 'USB', gap: 0 }], { traces: [mkTrace('USB_DP', 0, 0, 10, 0), mkTrace('USB_DN', 0, 5, 10, 5)] });
chk('gap=0 → 不查', res.length === 0);
// F: 既有檢查不受影響（長度差仍動作）
res = window.NetRules.audit([{ pattern: '/^USB_D[PN]$/', pairTol: 0.5 }], { traces: [mkTrace('USB_DP', 0, 0, 10, 0), mkTrace('USB_DN', 0, 0.4, 15, 0.4)] });
chk('pairTol 迴歸 → 長度差 warning', res.some(x => /長度差/.test(x.message)));

console.log(fail ? `\n${fail} FAILURES` : '\nALL PASS');
process.exit(fail ? 1 : 0);
