const fs = require('fs');
let src = fs.readFileSync('pcb-logic.test.js', 'utf8');
src = src.split('// 9) AutoRoute')[0];
src += `
const padAbs = (c, p) => ({ x: c.x + p.x, y: c.y + p.y });
const rules = app.loadDrcRules();
const baseOpt = { layers: ['F.Cu'], width: 0.25, clearance: rules.clearance, viaOd: 0.7, viaDrill: 0.3, grid: 0.2 };
const mkBoard = (n, span, seedInit) => {
  let seed = seedInit;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const st = { boardWidth: 60, boardHeight: 60, traces: [], vias: [], keepouts: [], components: [] };
  const cols = Math.max(2, Math.round(Math.sqrt(n)));
  for (let i = 0; i < n; i++) {
    const b = window.PartsLib.build('res', '0603');
    const pads = b.pads.map(q => Object.assign({}, q));
    pads[0].net = 'N' + i;
    pads[1].net = 'N' + ((i + 1) % n);
    st.components.push({
      id: 'c' + i, ref: 'R' + (i + 1),
      x: -span / 2 + (i % cols) * (span / cols) + rnd() * 0.6,
      y: -span / 2 + Math.floor(i / cols) * (span / cols) + rnd() * 0.6,
      rot: (rnd() < 0.5 ? 0 : 90), w: b.body.w, h: b.body.h, pads
    });
  }
  return st;
};
const cases = [[12, 14, 7], [20, 20, 13], [30, 26, 19], [24, 9, 31], [30, 10, 37], [40, 12, 41]];
let worse = 0, exercised = 0;
for (const [n, span, sd] of cases) {
  const a = mkBoard(n, span, sd), b = mkBoard(n, span, sd);
  const plain = window.RouteAll.run(a, padAbs, window.Ratsnest.compute(a, padAbs), Object.assign({ ripup: false }, baseOpt));
  const rip = window.RouteAll.run(b, padAbs, window.Ratsnest.compute(b, padAbs), Object.assign({ ripup: true, passes: 3 }, baseOpt));
  if (plain.failed.length) exercised++;
  if (rip.routed.length < plain.routed.length) worse++;
  console.log('  n=' + n + ' span=' + span, '不拆', plain.routed.length + '/' + (plain.routed.length + plain.failed.length),
    '| 拆', rip.routed.length + '/' + (rip.routed.length + rip.failed.length), rip.routed.length < plain.routed.length ? '← 變差' : '');
}
console.log('變差的板數:', worse, '| 第二階段有跑到的板數:', exercised + '/' + cases.length);
`;
eval(src);
