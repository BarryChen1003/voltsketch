/** verify-batch5.js — 批次 5 的語意/幾何驗證 */
const D = require('./batch5.js');
let fail = 0;
const ok = (n, c, d) => { console.log((c ? 'PASS ' : 'FAIL ') + n + (d ? '  ' + d : '')); if (!c) fail++; };

for (const [id, svg] of Object.entries(D)) {
  const vb = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
  const f = [...svg.matchAll(/font-size="([\d.]+)"/g)].map(m => +m[1]);
  ok(id + ' viewBox 520 + width 屬性', +vb[1] === 520 && /<svg width="520"/.test(svg));
  ok(id + ' 字級 >= 11', Math.min(...f) >= 11, 'min=' + Math.min(...f));
}

/* --- q18：曲線與標點必須符合 tr = 0.8473 Rp Cb --- */
{
  const K = 0.8473;
  const tr = (rpK, cbPF) => K * rpK * cbPF;   // kohm x pF = ns
  ok('q18 tr(2.2k,100pF) = 186ns', Math.round(tr(2.2, 100)) === 186 && /tr 186ns  PASS/.test(D.q18), Math.round(tr(2.2, 100)) + 'ns');
  ok('q18 tr(10k,100pF) = 847ns', Math.round(tr(10, 100)) === 847 && /tr 847ns  FAIL/.test(D.q18), Math.round(tr(10, 100)) + 'ns');
  ok('q18 2.2k 通過 300ns、10k 不通過', tr(2.2, 100) < 300 && tr(10, 100) > 300);
  ok('q18 標明 (C) 是錯的修法', /\(C\) raise Rp 2\.2k -&gt; 10k: WRONG/.test(D.q18));
  ok('q18 (A)(B)(D) 標為正確', /\(A\) lower Rp: OK/.test(D.q18) && /\(B\) shorter trace/.test(D.q18) && /\(D\) fewer slaves: OK/.test(D.q18));
  ok('q18 公式寫出 0.8473', /tr = 0\.8473 x Rp x Cb/.test(D.q18));
  // 兩條斜線：Cb 越大同一 Rp 的 tr 越大 → 200pF 那條更陡（更早觸頂）
  const polys = [...D.q18.matchAll(/<polyline points="([\d.]+),([\d.]+) ([\d.]+),([\d.]+)"/g)]
    .map(m => ({ x1: +m[1], y1: +m[2], x2: +m[3], y2: +m[4] }));
  ok('q18 兩條 tr-Rp 直線', polys.length === 2);
  const slope = p => (p.y1 - p.y2) / (p.x2 - p.x1);
  ok('q18 Cb=200pF 的斜率是 100pF 的兩倍', Math.abs(slope(polys[1]) / slope(polys[0]) - 2) < 0.02,
    (slope(polys[1]) / slope(polys[0])).toFixed(3));
  // 標點座標必須落在 100pF 那條線上
  const dots = [...D.q18.matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)" r="4"/g)].map(m => ({ x: +m[1], y: +m[2] }));
  const onLine = d => Math.abs((polys[0].y1 - slope(polys[0]) * (d.x - polys[0].x1)) - d.y) < 0.5;
  ok('q18 兩個標點都落在 Cb=100pF 的線上', dots.length === 2 && dots.every(onLine));
  ok('q18 FAIL 點在限制線上方、PASS 點在下方',
    dots[1].y < 143.4 && dots[0].y > 143.4, `pass y=${dots[0].y} fail y=${dots[1].y}`);
}

/* --- q20：HBM/CDM 五項對照與峰值電流 --- */
{
  ok('q20 HBM 等效電路 100pF + 1.5k', /100pF \+ 1\.5k/.test(D.q20));
  ok('q20 CDM 是封裝電容 1-30pF、約 1 ohm', /package C 1-30pF, ~1 ohm/.test(D.q20));
  ok('q20 放電時間 150ns vs 1ns', /~150ns/.test(D.q20) && /~1ns \(very fast\)/.test(D.q20));
  ok('q20 等級 2kV Class 2 / 500V Class C4', /2kV \(Class 2\)/.test(D.q20) && /500V \(Class C4\)/.test(D.q20));
  ok('q20 損傷型式 接面燒毀 vs 氧化層擊穿', /junction burn-out/.test(D.q20) && /oxide breakdown/.test(D.q20));
  ok('q20 HBM 峰值 = 2kV/1.5k = 1.33A', Math.abs(2000 / 1500 - 1.333) < 0.001 && /2kV \/ 1\.5k = 1\.33A/.test(D.q20));
  const rows = (D.q20.match(/<text x="24" y="\d+"/g) || []).length;
  ok('q20 五個比較項目', rows === 5, 'rows=' + rows);
}

/* --- q21：串接順序與 via --- */
{
  // 兩顆電容都是「從電源軌垂下到地平面」的並聯元件，不是串在軌上
  const rail = D.q21.match(/<line x1="40" y1="90" x2="340" y2="90"/);
  ok('q21 電源軌是一條連續走線（電容並聯不串聯）', !!rail);
  const legs = [...D.q21.matchAll(/<line x1="(\d+)" y1="112" x2="\1" y2="150"/g)].map(m => +m[1]);
  ok('q21 兩顆電容都接到地平面', legs.length === 2, 'x=' + legs.join(','));
  const c100 = D.q21.indexOf('100nF'), c10 = D.q21.indexOf('10uF');
  const x100 = +D.q21.match(/<text x="(\d+)" y="72"[^>]*>100nF/)[1];
  const x10 = +D.q21.match(/<text x="(\d+)" y="72"[^>]*>10uF/)[1];
  const xic = +D.q21.match(/<rect x="(\d+)" y="54" width="120"/)[1];
  ok('q21 100nF 比 10uF 更靠近 IC', Math.abs(xic - x100) < Math.abs(xic - x10), `IC@${xic} 100nF@${x100} 10uF@${x10}`);
  ok('q21 標明順序 rail -> 10uF -> 100nF -> pin', /rail -&gt; 10uF -&gt; 100nF -&gt; IC pin/.test(D.q21));
  ok('q21 禁止 T 型分叉', /No T-stub/.test(D.q21));
  ok('q21 via 要短粗降 ESL', /vias short and fat = low ESL/.test(D.q21));
  ok('q21 區分 bypass 與 decoupling', /Bypass = shunt HF noise/.test(D.q21) && /Decoupling = local charge/.test(D.q21));
  const vias = (D.q21.match(/r="3\.5" fill="#00ff88"/g) || []).length;
  ok('q21 三個接地 via（兩顆電容 + IC）', vias === 3, 'vias=' + vias);
}

/* --- q23：正確答案是 (C)，錯誤側要有跨層/直角/平面分割 --- */
{
  ok('q23 標出 (C) 為正解', /\(C\) correct/.test(D.q23));
  ok('q23 標出 (A)(B)(D) 為錯', /\(A\)\(B\)\(D\) wrong/.test(D.q23));
  // 正確側：兩條走線同樣的折點與長度（等長等距）
  const good = [...D.q23.matchAll(/<polyline points="(24,\d+ 96,\d+ 128,\d+ 236,\d+)"/g)].map(m => m[1]);
  ok('q23 正確側兩條走線平行且折點相同', good.length === 2);
  const len = pts => { const p = pts.split(' ').map(s => s.split(',').map(Number)); let L = 0;
    for (let i = 1; i < p.length; i++) L += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return L; };
  ok('q23 正確側兩條長度相等（skew = 0）', Math.abs(len(good[0]) - len(good[1])) < 0.01,
    len(good[0]).toFixed(2) + ' vs ' + len(good[1]).toFixed(2));
  const gap = (() => { const a = good[0].split(' ').map(s => s.split(',').map(Number)),
    b = good[1].split(' ').map(s => s.split(',').map(Number));
    return a.map((p, i) => b[i][1] - p[1]); })();
  ok('q23 正確側間距固定', new Set(gap).size === 1, 'gaps=' + gap.join(','));
  ok('q23 正確側有連續參考平面', /solid reference plane/.test(D.q23));
  // 錯誤側：平面被切成兩塊
  const split = [...D.q23.matchAll(/<rect x="(\d+)" y="140" width="86"/g)].map(m => +m[1]);
  ok('q23 錯誤側參考平面被切開', split.length === 2 && split[1] - (split[0] + 86) > 0,
    `gap=${split.length === 2 ? split[1] - split[0] - 86 : 'n/a'}px`);
  ok('q23 錯誤側有跨層 via 與直角', /via to another layer, 90 deg turns/.test(D.q23) && /stroke-dasharray="5"/.test(D.q23));
  ok('q23 skew 規格 < 5mil', /skew under 5mil/.test(D.q23));
}

/* --- q24：六參數與 FOM 曲線 --- */
{
  const syms = [...D.q24.matchAll(/<text x="16" y="\d+" fill="#00d4ff" font-size="11">([^<]+)</g)].map(m => m[1]);
  ok('q24 剛好六個參數', syms.length === 6, syms.join(','));
  ok('q24 六參數涵蓋 V(BR)DSS/RDS(on)/Qg/VGS(th)/ID(max)/SOA',
    JSON.stringify(syms) === JSON.stringify(['V(BR)DSS', 'RDS(on)', 'Qg', 'VGS(th)', 'ID(max)', 'SOA']));
  ok('q24 崩潰電壓選 >= 1.2x', /pick &gt;= 1\.2 x Vmax/.test(D.q24));
  ok('q24 FOM 定義 = RDS(on) x Qg，越小越好', /FOM = RDS\(on\) x Qg, lower is better/.test(D.q24));
  ok('q24 低頻大電流看 RDS(on)、高頻看 Qg', /Low frequency, high current: chase RDS\(on\)/.test(D.q24) && /High frequency: chase Qg/.test(D.q24));
  // 兩條等 FOM 曲線：任一 Qg 上，好曲線的 RDS 必須比差曲線低（螢幕 y 更大）
  const cur = [...D.q24.matchAll(/<polyline points="([^"]+)" fill="none" stroke="(#ff6b6b|#00ff88)"/g)]
    .map(m => ({ color: m[2], pts: m[1].split(' ').map(p => p.split(',').map(Number)) }));
  ok('q24 兩條等 FOM 曲線', cur.length === 2);
  const worse = cur.find(c => c.color === '#ff6b6b'), better = cur.find(c => c.color === '#00ff88');
  const sameX = better.pts.filter(p => worse.pts.some(w => Math.abs(w[0] - p[0]) < 0.05));
  ok('q24 好 FOM 曲線在差 FOM 曲線下方（同 Qg 下 RDS 更低）',
    sameX.every(p => { const w = worse.pts.find(w => Math.abs(w[0] - p[0]) < 0.05); return p[1] > w[1]; }),
    sameX.length + ' 個共同 Qg 點');
  // 等 FOM 曲線本身：RDS x Qg 應為常數
  const fomOf = c => c.pts.map(([x, y]) => ((x - 330) / 1.7) * ((190 - y) / 1.3));
  const f1 = fomOf(better), f2 = fomOf(worse);
  const spread = a => (Math.max(...a) - Math.min(...a)) / (a.reduce((s, v) => s + v, 0) / a.length);
  ok('q24 兩條曲線各自 RDS x Qg 為定值（等 FOM）', spread(f1) < 0.02 && spread(f2) < 0.02,
    `spread ${(spread(f1) * 100).toFixed(2)}% / ${(spread(f2) * 100).toFixed(2)}%`);
}

/* --- q25：寄生 SCR 結構與預防 --- */
{
  ok('q25 有 PNP 與 NPN 兩顆寄生電晶體', />PNP</.test(D.q25) && />NPN</.test(D.q25));
  ok('q25 有 Rwell 與 Rsub', />Rwell</.test(D.q25) && />Rsub</.test(D.q25));
  // 交叉耦合：兩條回授線
  const cross = (D.q25.match(/stroke="#00ff88" stroke-width="1\.4"/g) || []).length;
  ok('q25 兩條交叉耦合連線（正回授）', cross === 2, 'lines=' + cross);
  ok('q25 標明再生（regenerative）', /regenerative/.test(D.q25));
  ok('q25 觸發條件含 IO 超出軌與 ESD 注入',
    /IO overshoot beyond a diode drop/.test(D.q25) && /large injected current \(ESD\)/.test(D.q25));
  ok('q25 預防含 guard ring 極性正確（P+ 接 VDD、N+ 接 GND）', /guard rings: P\+ to VDD, N\+ to GND/.test(D.q25));
  ok('q25 預防含上電順序與串聯電阻', /VDD before IO, series R on IO/.test(D.q25));
  ok('q25 說明只能斷電重啟', /only a power cycle clears it/.test(D.q25));
  // VDD 到 GND 的低阻抗路徑要被標成紅色高亮
  ok('q25 高亮 VDD-GND 低阻抗路徑', /stroke="#ff6b6b" stroke-width="8" stroke-opacity="0\.25"/.test(D.q25));
}

console.log('\n' + (fail ? 'FAILED ' + fail : 'ALL PASS'));
process.exit(fail ? 1 : 0);
