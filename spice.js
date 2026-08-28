/**
 * spice.js — 改良節點分析（MNA）求解器：DC / 瞬態 / AC
 *
 * 為什麼自己寫而不是移植 ngspice：
 *   ngspice 編成 WASM 要在 _headers 的 script-src 加 'wasm-unsafe-eval'，
 *   等於在鎖緊的 CSP 上開一個口，還要多背 1–3MB 的 vendor 與一條 Emscripten 工具鏈。
 *   這裡的元件集合（R/L/C/V/I/二極體/BJT/MOSFET）用 MNA 自己解，
 *   幾百行就夠，而且每一條式子都看得到、測得動。
 *
 * 誠實界定（UI 一定要顯示這幾條，不要讓人拿去當 SPICE 用）：
 *   - 元件模型是**一階模型**：二極體用 Shockley、BJT 用 Ebers-Moll、MOSFET 用
 *     平方律。沒有通道長度調變以外的二階效應、沒有溫度、沒有雜訊、沒有 BSIM。
 *     用來看「這個偏壓對不對、這個 RC 大概多久、這個濾波器轉角在哪」是夠的；
 *     用來預測真實元件的邊界行為（次臨界、飽和區細節、高頻）不夠。
 *   - AC 分析在工作點做小訊號線性化。非線性元件的大訊號失真看不到。
 *   - 收斂失敗就照實回報 converged:false，不回傳一組看起來像答案的數字。
 *
 * 數值方法：
 *   DC      Newton-Raphson + 可選的 Gmin stepping（收斂不了時自動啟用）
 *   瞬態    梯形法（trapezoidal），每步再跑一次 Newton
 *   AC      工作點線性化後解複數方程組
 *   線性解  部分主元高斯消去（複數版另寫一份）
 *
 * 純函式：不碰 DOM，node 可直接測。測試：spice.test.js
 */
(function (root) {
  'use strict';

  const K_BOLTZ = 1.380649e-23;
  const Q_ELEM = 1.602176634e-19;
  const T_DEFAULT = 300.15;                 // 27°C
  const VT = (T) => (K_BOLTZ * (T || T_DEFAULT)) / Q_ELEM;   // ≈ 25.86mV

  // ---- 數值：實數線性系統 ----
  // 部分主元高斯消去。矩陣不大（節點數 + 電壓源數），不值得上 LU 分解快取。
  function solve(A, b) {
    const n = b.length;
    const M = A.map((row, i) => row.slice().concat([b[i]]));
    for (let c = 0; c < n; c++) {
      let piv = c;
      for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r;
      if (Math.abs(M[piv][c]) < 1e-18) return null;      // 奇異矩陣＝電路有問題（浮接節點等）
      if (piv !== c) { const t = M[piv]; M[piv] = M[c]; M[c] = t; }
      const d = M[c][c];
      for (let k = c; k <= n; k++) M[c][k] /= d;
      for (let r = 0; r < n; r++) {
        if (r === c) continue;
        const f = M[r][c];
        if (!f) continue;
        for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
      }
    }
    return M.map(row => row[n]);
  }

  // ---- 數值：複數線性系統（AC 用）----
  const cAdd = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const cSub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const cMul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
  const cDiv = (a, b) => {
    const d = b[0] * b[0] + b[1] * b[1];
    if (d === 0) return [0, 0];
    return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d];
  };
  const cAbs = a => Math.hypot(a[0], a[1]);

  function solveComplex(A, b) {
    const n = b.length;
    const M = A.map((row, i) => row.map(v => v.slice()).concat([b[i].slice()]));
    for (let c = 0; c < n; c++) {
      let piv = c;
      for (let r = c + 1; r < n; r++) if (cAbs(M[r][c]) > cAbs(M[piv][c])) piv = r;
      if (cAbs(M[piv][c]) < 1e-18) return null;
      if (piv !== c) { const t = M[piv]; M[piv] = M[c]; M[c] = t; }
      const d = M[c][c];
      for (let k = c; k <= n; k++) M[c][k] = cDiv(M[c][k], d);
      for (let r = 0; r < n; r++) {
        if (r === c) continue;
        const f = M[r][c];
        if (cAbs(f) === 0) continue;
        for (let k = c; k <= n; k++) M[r][k] = cSub(M[r][k], cMul(f, M[c][k]));
      }
    }
    return M.map(row => row[n]);
  }

  // ---- 網表 ----
  // 元件格式（跟 SPICE 卡片對齊，但用物件避免字串解析）：
  //   { type:'R', nodes:['1','2'], value:1000 }
  //   { type:'V', nodes:['1','0'], value:5, ac:1, tran:{kind:'pulse'|'sine', …} }
  //   { type:'D', nodes:['a','k'], model:{ is, n } }
  //   { type:'Q', nodes:['c','b','e'], model:{ bf, is, ... }, pnp:false }
  //   { type:'M', nodes:['d','g','s'], model:{ vth, kp, lambda }, p:false }
  const LINEAR = new Set(['R', 'C', 'L', 'V', 'I']);

  // 節點編號：'0' 與 'gnd' 一律接地（索引 -1，不進矩陣）
  function indexNodes(elements) {
    const map = new Map();
    let n = 0;
    for (const e of elements) {
      for (const nd of e.nodes) {
        const k = String(nd);
        if (k === '0' || /^gnd$/i.test(k)) continue;
        if (!map.has(k)) map.set(k, n++);
      }
    }
    return { map, count: n };
  }
  const nidx = (map, nd) => {
    const k = String(nd);
    if (k === '0' || /^gnd$/i.test(k)) return -1;
    return map.has(k) ? map.get(k) : -1;
  };

  // ---- 元件蓋章 ----
  function stampR(G, i, j, g) {
    if (i >= 0) G[i][i] += g;
    if (j >= 0) G[j][j] += g;
    if (i >= 0 && j >= 0) { G[i][j] -= g; G[j][i] -= g; }
  }
  function stampI(rhs, i, j, cur) {   // 電流由 i 流向 j
    if (i >= 0) rhs[i] -= cur;
    if (j >= 0) rhs[j] += cur;
  }

  // 二極體：Shockley。指數會爆掉，所以超過臨界電壓後改用切線外推
  // （SPICE 也是這樣做的，否則 Newton 第一步就送進 Infinity）。
  function diodeStamp(vd, m) {
    const is = m.is != null ? m.is : 1e-14;
    const n = m.n != null ? m.n : 1;
    const vt = n * VT(m.temp);
    const VCRIT = vt * Math.log(vt / (Math.SQRT2 * is));
    let id, gd;
    if (vd > VCRIT) {
      const ic = is * (Math.exp(VCRIT / vt) - 1);
      const gc = (is / vt) * Math.exp(VCRIT / vt);
      id = ic + gc * (vd - VCRIT);
      gd = gc;
    } else {
      const ex = Math.exp(vd / vt);
      id = is * (ex - 1);
      gd = (is / vt) * ex;
    }
    return { id, gd: Math.max(gd, 1e-12) };
  }

  /**
   * 建立並解一次 DC 工作點（或瞬態的某一步）。
   * @param opts { tran:{dt, prev}, gmin }
   */
  function dcStep(elements, ni, x0, opts) {
    const o = opts || {};
    const n = ni.count;
    const vsrc = elements.filter(e => e.type === 'V' || e.type === 'L');
    const m = vsrc.length;
    const N = n + m;
    const G = Array.from({ length: N }, () => new Array(N).fill(0));
    const rhs = new Array(N).fill(0);
    // gmin 可以是 0（線性電路要精度），所以用 != null 判斷，不能用 ||
    const gmin = o.gmin != null ? o.gmin : 1e-12;
    if (gmin) for (let i = 0; i < n; i++) G[i][i] += gmin;   // 讓浮接節點有一條微弱的路，避免奇異

    const V = k => (k < 0 ? 0 : (x0 ? x0[k] || 0 : 0));
    let vi = 0;

    for (const e of elements) {
      const a = nidx(ni.map, e.nodes[0]);
      const b = nidx(ni.map, e.nodes[1]);
      switch (e.type) {
        case 'R': {
          const g = 1 / (e.value || 1e-9);
          stampR(G, a, b, g);
          break;
        }
        case 'I': stampI(rhs, a, b, srcValue(e, o.time)); break;
        case 'C': {
          if (!o.tran) break;                          // DC 時電容開路
          const c = e.value || 0, dt = o.tran.dt;
          // 梯形法的伴隨模型：Geq = 2C/dt，Ieq 由上一步的電壓與電流決定
          const geq = (2 * c) / dt;
          const vprev = (o.tran.prevV && o.tran.prevV[e._id]) || 0;
          const iprev = (o.tran.prevI && o.tran.prevI[e._id]) || 0;
          const ieq = geq * vprev + iprev;
          stampR(G, a, b, geq);
          stampI(rhs, a, b, -ieq);
          break;
        }
        case 'V': {
          const k = n + vi++;
          if (a >= 0) { G[a][k] += 1; G[k][a] += 1; }
          if (b >= 0) { G[b][k] -= 1; G[k][b] -= 1; }
          rhs[k] += srcValue(e, o.time);
          break;
        }
        case 'L': {
          const k = n + vi++;
          if (a >= 0) { G[a][k] += 1; G[k][a] += 1; }
          if (b >= 0) { G[b][k] -= 1; G[k][b] -= 1; }
          if (!o.tran) { G[k][k] -= 0; }               // DC 時電感短路：Vab = 0
          else {
            // 梯形法：V = L·di/dt → Vab - (2L/dt)·i = -(2L/dt)·iprev - vprev
            const req = (2 * (e.value || 0)) / o.tran.dt;
            const iprev = (o.tran.prevI && o.tran.prevI[e._id]) || 0;
            const vprev = (o.tran.prevV && o.tran.prevV[e._id]) || 0;
            G[k][k] -= req;
            rhs[k] -= req * iprev + vprev;
          }
          break;
        }
        case 'D': {
          const vd = V(a) - V(b);
          const { id, gd } = diodeStamp(vd, e.model || {});
          stampR(G, a, b, gd);
          stampI(rhs, a, b, id - gd * vd);
          break;
        }
        case 'Q': {
          // Ebers-Moll。nodes = [c, b, e]
          const c = nidx(ni.map, e.nodes[0]), bb = nidx(ni.map, e.nodes[1]), ee = nidx(ni.map, e.nodes[2]);
          const md = e.model || {};
          const s = e.pnp ? -1 : 1;
          const is = md.is != null ? md.is : 1e-16;
          const bf = md.bf != null ? md.bf : 100;
          const br = md.br != null ? md.br : 1;
          const vbe = s * (V(bb) - V(ee)), vbc = s * (V(bb) - V(c));
          const d1 = diodeStamp(vbe, { is: is / bf, n: 1 });
          const d2 = diodeStamp(vbc, { is: is / br, n: 1 });
          // 基極兩個接面 + 受控電流源（用線性化後的跨導近似）
          stampR(G, bb, ee, d1.gd);
          stampI(rhs, bb, ee, s * (d1.id - d1.gd * vbe));
          stampR(G, bb, c, d2.gd);
          stampI(rhs, bb, c, s * (d2.id - d2.gd * vbc));
          const gm = bf * d1.gd;
          const ic = bf * d1.id;
          // 集極電流 = β·Ib，線性化成 gm·vbe
          if (c >= 0 && bb >= 0) G[c][bb] += gm;
          if (c >= 0 && ee >= 0) G[c][ee] -= gm;
          if (ee >= 0 && bb >= 0) G[ee][bb] -= gm;
          if (ee >= 0 && ee >= 0) G[ee][ee] += gm;
          stampI(rhs, c, ee, s * (ic - gm * vbe));
          break;
        }
        case 'M': {
          // 平方律 MOSFET。nodes = [d, g, s]
          const d = nidx(ni.map, e.nodes[0]), g = nidx(ni.map, e.nodes[1]), sN = nidx(ni.map, e.nodes[2]);
          const md = e.model || {};
          const sgn = e.p ? -1 : 1;
          const vth = (md.vth != null ? md.vth : 1) * sgn;
          const kp = md.kp != null ? md.kp : 2e-5;
          const W_L = md.wl != null ? md.wl : 10;
          const lam = md.lambda != null ? md.lambda : 0;
          const beta = kp * W_L;
          let vgs = sgn * (V(g) - V(sN)), vds = sgn * (V(d) - V(sN));
          const vov = vgs - sgn * vth * sgn;
          const vovr = vgs - Math.abs(vth);
          let id = 0, gm = 0, gds = 0;
          if (vovr <= 0) { id = 0; gm = 0; gds = 1e-12; }
          else if (vds < vovr) {                       // 線性區
            id = beta * (vovr * vds - vds * vds / 2);
            gm = beta * vds;
            gds = beta * (vovr - vds);
          } else {                                     // 飽和區
            id = (beta / 2) * vovr * vovr * (1 + lam * vds);
            gm = beta * vovr * (1 + lam * vds);
            gds = (beta / 2) * vovr * vovr * lam;
          }
          gds = Math.max(gds, 1e-12);
          stampR(G, d, sN, gds);
          if (d >= 0 && g >= 0) G[d][g] += gm;
          if (d >= 0 && sN >= 0) G[d][sN] -= gm;
          if (sN >= 0 && g >= 0) G[sN][g] -= gm;
          if (sN >= 0 && sN >= 0) G[sN][sN] += gm;
          stampI(rhs, d, sN, sgn * (id - gm * vgs - gds * vds));
          break;
        }
        default: break;
      }
    }
    const x = solve(G, rhs);
    return x ? { x, G, rhs, vsrc } : null;
  }

  // 電壓/電流源的時變值
  function srcValue(e, t) {
    const tr = e.tran;
    if (!tr || t == null) return e.value || 0;
    if (tr.kind === 'sine') {
      const a = tr.amp != null ? tr.amp : 1;
      const f = tr.freq != null ? tr.freq : 1000;
      const off = tr.offset != null ? tr.offset : (e.value || 0);
      return off + a * Math.sin(2 * Math.PI * f * t + (tr.phase || 0));
    }
    if (tr.kind === 'pulse') {
      const v1 = tr.v1 != null ? tr.v1 : 0, v2 = tr.v2 != null ? tr.v2 : 1;
      const td = tr.td || 0, tr_ = tr.tr || 0, tf = tr.tf || 0;
      const pw = tr.pw != null ? tr.pw : Infinity, per = tr.per != null ? tr.per : Infinity;
      let tt = t - td;
      if (tt < 0) return v1;
      if (isFinite(per) && per > 0) tt = tt % per;
      if (tt < tr_) return v1 + (v2 - v1) * (tt / tr_);
      if (tt < tr_ + pw) return v2;
      if (tt < tr_ + pw + tf) return v2 + (v1 - v2) * ((tt - tr_ - pw) / tf);
      return v1;
    }
    if (tr.kind === 'step') return t >= (tr.td || 0) ? (tr.v2 != null ? tr.v2 : 1) : (tr.v1 || 0);
    return e.value || 0;
  }

  const isNonlinear = e => !LINEAR.has(e.type);

  /**
   * DC 工作點。
   * @returns { converged, iterations, nodes:{name:V}, branches:{id:I}, warnings }
   */
  function dcOp(elements, opts) {
    const o = opts || {};
    const els = prep(elements);
    const ni = indexNodes(els);
    const warnings = [];
    if (!ni.count) return { converged: false, iterations: 0, nodes: {}, branches: {}, warnings: ['no_nodes'] };

    const tol = o.tol || 1e-9;
    const maxIter = o.maxIter || 100;
    const nonlinear = els.some(isNonlinear);

    // Gmin stepping：先用很鬆的 Gmin 求出一個大概的解，再逐步收緊。
    // 非線性電路（尤其含 BJT）從零起始常常一步就發散，這是 SPICE 的標準對策。
    //
    // 線性電路則從 gmin=0 開始：加了 1e-12 會讓 1k 分壓的中點差到 1e-8 V，
    // 明明有閉式解卻對不準到小數第八位。真的奇異（浮接節點）時下一輪的
    // 1e-12 會接手，所以不會因此解不出來。
    const gminSeq = nonlinear ? [1e-3, 1e-5, 1e-7, 1e-9, 1e-12] : [0, 1e-12];
    let x = new Array(ni.count + els.filter(e => e.type === 'V' || e.type === 'L').length).fill(0);
    let iterations = 0, converged = false;

    let singular = 0;
    for (const gmin of gminSeq) {
      converged = false;
      let bad = false;
      const xSave = x.slice();
      for (let it = 0; it < maxIter; it++) {
        iterations++;
        const r = dcStep(els, ni, x, { gmin, tran: o.tran, time: o.time });
        if (!r) {
          // 這一輪的 gmin 撐不住（真的奇異）。不要直接放棄——
          // 下一個較大的 gmin 可能就解得開（浮接節點就是這樣救回來的）。
          singular++; bad = true; x = xSave;
          break;
        }
        let maxd = 0;
        for (let i = 0; i < r.x.length; i++) maxd = Math.max(maxd, Math.abs(r.x[i] - x[i]));
        x = r.x;
        if (!nonlinear || maxd < tol) { converged = true; break; }
      }
      if (converged && !nonlinear) break;   // 線性電路一次就解完，不要讓下一個 gmin 蓋掉精度
      if (!converged && !bad) warnings.push('gmin_step_failed:' + gmin);
    }

    if (!converged) {
      if (singular >= gminSeq.length) warnings.push('singular_matrix');
      warnings.push('not_converged');
      return { converged: false, iterations, nodes: {}, branches: {}, warnings };
    }
    return packResult(els, ni, x, converged, iterations, warnings);
  }

  function packResult(els, ni, x, converged, iterations, warnings) {
    const nodes = {};
    for (const [name, i] of ni.map) nodes[name] = x[i];
    nodes['0'] = 0;
    const branches = {};
    let vi = 0;
    for (const e of els) {
      if (e.type === 'V' || e.type === 'L') branches[e.id || e._id] = x[ni.count + vi++];
    }
    return { converged, iterations, nodes, branches, warnings };
  }

  // 給每個元件一個內部 id（瞬態要用它記住上一步的狀態）
  function prep(elements) {
    return (elements || []).filter(Boolean).map((e, i) => Object.assign({}, e, { _id: e.id || ('e' + i) }));
  }

  /**
   * 瞬態分析。
   * @param opts { stop, step, start }
   * @returns { converged, t:[…], nodes:{name:[…]}, warnings }
   */
  function tran(elements, opts) {
    const o = opts || {};
    const els = prep(elements);
    const ni = indexNodes(els);
    const dt = o.step || (o.stop || 1e-3) / 200;
    const stop = o.stop || 1e-3;
    const start = o.start || 0;
    const warnings = [];
    if (!ni.count) return { converged: false, t: [], nodes: {}, warnings: ['no_nodes'] };

    // 起始條件走一次 DC（電容開路、電感短路），跟 SPICE 的 .tran 預設一致
    const op = dcOp(els, { tol: o.tol, maxIter: o.maxIter });
    if (!op.converged) warnings.push('op_not_converged');

    const t = [];
    const series = {};
    for (const [name] of ni.map) series[name] = [];
    series['0'] = [];

    const prevV = {}, prevI = {};
    for (const e of els) { prevV[e._id] = 0; prevI[e._id] = 0; }
    // 電容的初始電壓取自工作點
    for (const e of els) {
      if (e.type !== 'C') continue;
      const a = nidx(ni.map, e.nodes[0]), b = nidx(ni.map, e.nodes[1]);
      prevV[e._id] = (a >= 0 ? op.nodes[e.nodes[0]] || 0 : 0) - (b >= 0 ? op.nodes[e.nodes[1]] || 0 : 0);
    }

    let x = new Array(ni.count + els.filter(e => e.type === 'V' || e.type === 'L').length).fill(0);
    for (const [name, i] of ni.map) x[i] = op.nodes[name] || 0;

    let ok = true;
    const nonlinear = els.some(isNonlinear);

    // t=0 記的是「初始條件」，不是積分過一步的結果。
    // 從 time=0 開始跑迴圈的話，第一個記錄點已經套用了一次 dt 的積分——
    // RC 步階的起始值會變成 0.000999 而不是 0，看起來只是「差一點」，
    // 其實是整條曲線往前平移了一步。
    if (start <= 0) {
      t.push(0);
      for (const [name, i] of ni.map) series[name].push(x[i]);
      series['0'].push(0);
    }

    for (let time = dt; time <= stop + 1e-15; time += dt) {
      let conv = !nonlinear;
      for (let it = 0; it < (o.maxIter || 60); it++) {
        const r = dcStep(els, ni, x, { tran: { dt, prevV, prevI }, time, gmin: 1e-12 });
        if (!r) { ok = false; warnings.push('singular_at_t:' + time.toExponential(2)); break; }
        let maxd = 0;
        for (let i = 0; i < r.x.length; i++) maxd = Math.max(maxd, Math.abs(r.x[i] - x[i]));
        x = r.x;
        if (!nonlinear || maxd < (o.tol || 1e-9)) { conv = true; break; }
      }
      if (!ok) break;
      if (!conv) { warnings.push('step_not_converged:' + time.toExponential(2)); }

      // 記錄並更新伴隨模型的狀態
      for (const e of els) {
        const a = nidx(ni.map, e.nodes[0]), b = nidx(ni.map, e.nodes[1]);
        const va = a >= 0 ? x[a] : 0, vb = b >= 0 ? x[b] : 0;
        if (e.type === 'C') {
          const v = va - vb;
          const geq = (2 * (e.value || 0)) / dt;
          prevI[e._id] = geq * (v - prevV[e._id]) - prevI[e._id];
          prevV[e._id] = v;
        } else if (e.type === 'L') {
          prevV[e._id] = va - vb;
        }
      }
      let vi2 = 0;
      for (const e of els) {
        if (e.type === 'V' || e.type === 'L') { const cur = x[ni.count + vi2++]; if (e.type === 'L') prevI[e._id] = cur; }
      }

      if (time >= start) {
        t.push(time);
        for (const [name, i] of ni.map) series[name].push(x[i]);
        series['0'].push(0);
      }
    }

    return { converged: ok && !warnings.some(w => /not_converged|singular/.test(w)), t, nodes: series, warnings };
  }

  /**
   * AC 小訊號分析。先解工作點，再在該點線性化。
   * @param opts { start, stop, points, sweep:'dec'|'lin' }
   * @returns { converged, f:[…], nodes:{name:{mag:[…], phase:[…]}}, warnings }
   */
  function ac(elements, opts) {
    const o = opts || {};
    const els = prep(elements);
    const ni = indexNodes(els);
    const warnings = [];
    if (!ni.count) return { converged: false, f: [], nodes: {}, warnings: ['no_nodes'] };

    const op = dcOp(els, {});
    if (!op.converged) warnings.push('op_not_converged');

    const f0 = o.start || 1, f1 = o.stop || 1e6;
    const pts = o.points || 20;
    const freqs = [];
    if ((o.sweep || 'dec') === 'dec') {
      const decades = Math.log10(f1 / f0);
      const n = Math.max(1, Math.round(decades * pts));
      for (let i = 0; i <= n; i++) freqs.push(f0 * Math.pow(10, (decades * i) / n));
    } else {
      for (let i = 0; i <= pts; i++) freqs.push(f0 + ((f1 - f0) * i) / pts);
    }

    const nV = els.filter(e => e.type === 'V' || e.type === 'L').length;
    const N = ni.count + nV;
    const out = {};
    for (const [name] of ni.map) out[name] = { mag: [], phase: [] };

    const V = k => (k < 0 ? 0 : op.nodes[[...ni.map.keys()][k]] || 0);

    for (const f of freqs) {
      const w = 2 * Math.PI * f;
      const A = Array.from({ length: N }, () => Array.from({ length: N }, () => [0, 0]));
      const b = Array.from({ length: N }, () => [0, 0]);
      let vi = 0;
      const addY = (i, j, y) => {
        if (i >= 0) A[i][i] = cAdd(A[i][i], y);
        if (j >= 0) A[j][j] = cAdd(A[j][j], y);
        if (i >= 0 && j >= 0) { A[i][j] = cSub(A[i][j], y); A[j][i] = cSub(A[j][i], y); }
      };
      for (let i = 0; i < ni.count; i++) A[i][i] = cAdd(A[i][i], [1e-12, 0]);

      for (const e of els) {
        const i = nidx(ni.map, e.nodes[0]), j = nidx(ni.map, e.nodes[1]);
        switch (e.type) {
          case 'R': addY(i, j, [1 / (e.value || 1e-9), 0]); break;
          case 'C': addY(i, j, [0, w * (e.value || 0)]); break;
          case 'L': {
            const k = ni.count + vi++;
            if (i >= 0) { A[i][k] = cAdd(A[i][k], [1, 0]); A[k][i] = cAdd(A[k][i], [1, 0]); }
            if (j >= 0) { A[j][k] = cSub(A[j][k], [1, 0]); A[k][j] = cSub(A[k][j], [1, 0]); }
            A[k][k] = cSub(A[k][k], [0, w * (e.value || 0)]);
            break;
          }
          case 'V': {
            const k = ni.count + vi++;
            if (i >= 0) { A[i][k] = cAdd(A[i][k], [1, 0]); A[k][i] = cAdd(A[k][i], [1, 0]); }
            if (j >= 0) { A[j][k] = cSub(A[j][k], [1, 0]); A[k][j] = cSub(A[k][j], [1, 0]); }
            b[k] = cAdd(b[k], [e.ac != null ? e.ac : 0, 0]);
            break;
          }
          case 'I': {
            const amp = e.ac != null ? e.ac : 0;
            if (i >= 0) b[i] = cSub(b[i], [amp, 0]);
            if (j >= 0) b[j] = cAdd(b[j], [amp, 0]);
            break;
          }
          case 'D': {
            const vd = (op.nodes[e.nodes[0]] || 0) - (op.nodes[e.nodes[1]] || 0);
            addY(i, j, [diodeStamp(vd, e.model || {}).gd, 0]);
            break;
          }
          default: {
            // 其它非線性元件在工作點的小訊號導納：用 DC 那一輪算出的 gd/gm 近似。
            // 這一版只做到「不讓它變成開路」，完整的小訊號模型（含 gm 交叉項）
            // 要等 dcStep 把雅可比矩陣輸出出來重用——列在 warnings 讓人知道。
            if (isNonlinear(e)) warnings.push('ac_model_simplified:' + e.type);
            break;
          }
        }
      }

      const x = solveComplex(A, b);
      if (!x) { warnings.push('singular_at_f:' + f.toExponential(2)); break; }
      for (const [name, k] of ni.map) {
        out[name].mag.push(cAbs(x[k]));
        out[name].phase.push(Math.atan2(x[k][1], x[k][0]) * 180 / Math.PI);
      }
    }

    return {
      converged: !warnings.some(w => /singular/.test(w)),
      f: freqs, nodes: out,
      warnings: [...new Set(warnings)],
    };
  }

  // ---- SPICE 數值字串（10k、100n、4u7）----
  const SUFFIX = { t: 1e12, g: 1e9, meg: 1e6, k: 1e3, m: 1e-3, u: 1e-6, µ: 1e-6, n: 1e-9, p: 1e-12, f: 1e-15 };
  function parseValue(s) {
    if (typeof s === 'number') return s;
    const t = String(s == null ? '' : s).trim().toLowerCase();
    if (!t) return 0;
    // 4k7 這種「後綴當小數點」的寫法一定要先比對：
    // 走一般規則的話 '4k7' 會被讀成 4×1000 = 4000，那個 7 靜靜消失。
    const m2 = /^([+-]?\d+)(meg|[tgkmuµnpf])(\d+)$/.exec(t);
    if (m2) {
      const sign = m2[1][0] === '-' ? -1 : 1;
      return sign * (Math.abs(parseFloat(m2[1])) + parseFloat('0.' + m2[3])) * SUFFIX[m2[2]];
    }
    // 'meg' 一定要在 'm' 之前比對，否則 4meg 會被讀成 4 毫
    const m = /^([+-]?[\d.]+)\s*(meg|[tgkmuµnpf])?/.exec(t);
    if (!m) return 0;
    const v = parseFloat(m[1]);
    if (isNaN(v)) return 0;
    return m[2] ? v * SUFFIX[m[2]] : v;
  }

  const Spice = {
    dcOp, tran, ac, parseValue,
    VT, solve, solveComplex, diodeStamp, srcValue,
    _indexNodes: indexNodes, _dcStep: dcStep,
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = Spice;
  root.Spice = Spice;
})(typeof window !== 'undefined' ? window : globalThis);
