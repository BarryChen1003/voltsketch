/**
 * sch-spice.js — 線路圖 → SPICE 網表
 *
 * 求解器在 spice.js（純數值、node 測得到）。這支是**轉換層**：
 * 把畫布上的元件與接線轉成求解器吃的網表格式。
 *
 * 為什麼要獨立一支：轉換的每一個決定都是可以出錯而且測得出來的
 * （接地怎麼認、兩腳元件的極性、電壓源的方向、認不得的元件怎麼處理），
 * 塞進 UI 檔就變成只能靠人眼看畫面驗證。
 *
 * 對照組是既有的「單迴路估算」（app.js 的 runSimulation）：那條路不看拓樸、
 * 不處理並聯與多迴路。這條路走真的 MNA，所以並聯、多迴路、橋式都算得出來。
 *
 * 誠實界定：
 *   - 元件模型是一階模型（見 spice.js 檔頭）。
 *   - 認不得的元件**不會**被當成短路或開路塞進去——那會產生一個能跑但錯的答案。
 *     一律列進 unsupported 讓 UI 顯示，並且拒絕分析。
 *   - IC（運放、邏輯閘、DCDC）目前沒有內建模型，屬於認不得的那一類。
 *
 * 純函式：不碰 DOM，node 可直接測。測試：sch-spice.test.js
 */
(function (root) {
  'use strict';

  // 線路圖元件 → SPICE 元件型別。沒列到的一律當「不支援」，不猜。
  const KIND = {
    resistor: 'R', capacitor: 'C', inductor: 'L', bead: 'R',
    source: 'V', vrail: 'V',
    diode: 'D', led: 'D', tvs: 'D',
    npn: 'Q', pnp: 'Q',
    nmos: 'M', pmos: 'M',
    lamp: 'R', fuse: 'R', varistor: 'R',
    switch: 'SW',
    ground: 'GND',
    // 以下是「線路圖上有、但電性上不參與」的，跳過但不算錯
    text: null, shield: null, ammeter: null, voltmeter: null,
  };

  // 元件預設值（使用者沒填 value 時）。跟 app.js 的 getDefaultValue 一致，
  // 但單位換成 SI：app.js 的電容存的是 µF、電感是 µH。
  const DEFAULT = { R: 1000, C: 1e-7, L: 1e-5, V: 5 };

  const numOf = (v, d) => {
    const S = root.Spice;
    if (v == null || v === '') return d;
    const n = S ? S.parseValue(v) : parseFloat(v);
    return isNaN(n) || n === 0 ? (typeof v === 'number' ? v : d) : n;
  };

  /**
   * 把線路圖轉成網表。
   * @param comps  app.state.components
   * @param wires  app.state.wires
   * @param engine window.CircuitEngine（要 computeNets 與 getPins）
   * @returns { elements, nodes, unsupported, warnings, groundCount }
   */
  function toNetlist(comps, wires, engine) {
    const out = { elements: [], nodes: [], unsupported: [], warnings: [], groundCount: 0 };
    const list = (comps || []).filter(Boolean);
    if (!list.length) { out.warnings.push('empty'); return out; }
    if (!engine || !engine.computeNets) { out.warnings.push('no_engine'); return out; }

    const { pinNet } = engine.computeNets(list, wires || []);
    const netOf = (c, i) => {
      const n = pinNet.get(c.id + ':' + i);
      return n == null ? null : String(n);
    };

    // 接地節點：所有接到 ground 符號的網路都是 '0'。
    // 沒有這一步的話，MNA 少一個參考點，矩陣必然奇異——而且錯誤訊息會是
    // 「singular_matrix」而不是「你沒有接地」，使用者看不懂。
    const gnd = new Set();
    for (const c of list) {
      if (c.type !== 'ground') continue;
      out.groundCount++;
      const n = netOf(c, 0);
      if (n != null) gnd.add(n);
    }
    const nd = n => (n == null ? '0' : (gnd.has(n) ? '0' : 'n' + n));

    for (const c of list) {
      const kind = KIND[c.type];
      if (kind === undefined) { out.unsupported.push({ id: c.id, label: c.label || '', type: c.type }); continue; }
      if (kind === null || kind === 'GND') continue;

      const pins = engine.getPins ? (engine.getPins(c) || []) : [];
      const nodes = pins.map((p, i) => nd(netOf(c, i)));
      const id = c.label || c.id;

      if (kind === 'R' || kind === 'C' || kind === 'L') {
        if (nodes.length < 2) { out.unsupported.push({ id: c.id, label: id, type: c.type, why: 'pins' }); continue; }
        // app.js 存的電容是 µF、電感是 µH，換成 SI
        const raw = c.value;
        const v = kind === 'C' ? numOf(raw, 0.1) * 1e-6
          : kind === 'L' ? numOf(raw, 10) * 1e-6
            : numOf(raw, DEFAULT.R);
        out.elements.push({ id, type: kind, nodes: [nodes[0], nodes[1]], value: v });
        continue;
      }

      if (kind === 'V') {
        // vrail 是「這個節點固定在某個電壓」，另一端天生接地
        if (c.type === 'vrail') {
          const n0 = nodes[0] || '0';
          out.elements.push({ id, type: 'V', nodes: [n0, '0'], value: numOf(c.value, 3.3) });
        } else {
          if (nodes.length < 2) { out.unsupported.push({ id: c.id, label: id, type: c.type, why: 'pins' }); continue; }
          out.elements.push({ id, type: 'V', nodes: [nodes[0], nodes[1]], value: numOf(c.value, DEFAULT.V) });
        }
        continue;
      }

      if (kind === 'D') {
        if (nodes.length < 2) { out.unsupported.push({ id: c.id, label: id, type: c.type, why: 'pins' }); continue; }
        const p = c.params || {};
        // LED 的順向壓降遠高於一般矽二極體，用不同的飽和電流去逼近
        const is = c.type === 'led' ? 1e-20 : 1e-14;
        out.elements.push({ id, type: 'D', nodes: [nodes[0], nodes[1]], model: { is: numOf(p.is, is), n: numOf(p.n, 1) } });
        continue;
      }

      if (kind === 'Q') {
        if (nodes.length < 3) { out.unsupported.push({ id: c.id, label: id, type: c.type, why: 'pins' }); continue; }
        const p = c.params || {};
        out.elements.push({
          id, type: 'Q', nodes: [nodes[0], nodes[1], nodes[2]],
          pnp: c.type === 'pnp', model: { bf: numOf(p.hfe, 100), is: 1e-16 },
        });
        continue;
      }

      if (kind === 'M') {
        if (nodes.length < 3) { out.unsupported.push({ id: c.id, label: id, type: c.type, why: 'pins' }); continue; }
        const p = c.params || {};
        out.elements.push({
          id, type: 'M', nodes: [nodes[0], nodes[1], nodes[2]],
          p: c.type === 'pmos',
          model: { vth: numOf(p.vth, 2), kp: 2e-5, wl: 200, lambda: 0.02 },
        });
        continue;
      }

      if (kind === 'SW') {
        // 開關用電阻近似：閉合 1mΩ、斷開 1GΩ。
        // 用「移除元件」表示斷開會讓節點浮接，反而更難解。
        if (nodes.length < 2) { out.unsupported.push({ id: c.id, label: id, type: c.type, why: 'pins' }); continue; }
        out.elements.push({ id, type: 'R', nodes: [nodes[0], nodes[1]], value: c.closed ? 1e-3 : 1e9 });
        continue;
      }
    }

    out.nodes = [...new Set(out.elements.flatMap(e => e.nodes))].filter(n => n !== '0').sort();
    if (!out.groundCount) out.warnings.push('no_ground');
    if (!out.elements.some(e => e.type === 'V' || e.type === 'I')) out.warnings.push('no_source');
    return out;
  }

  /** 跑 DC 工作點，回傳每個節點的電壓（節點名換回線路圖的 net 名）。 */
  function dc(comps, wires, engine) {
    const nl = toNetlist(comps, wires, engine);
    if (nl.unsupported.length) return { ok: false, reason: 'unsupported', netlist: nl };
    if (!nl.elements.length) return { ok: false, reason: 'empty', netlist: nl };
    const r = root.Spice.dcOp(nl.elements, {});
    return { ok: r.converged, result: r, netlist: nl };
  }

  function tran(comps, wires, engine, opts) {
    const nl = toNetlist(comps, wires, engine);
    if (nl.unsupported.length) return { ok: false, reason: 'unsupported', netlist: nl };
    if (!nl.elements.length) return { ok: false, reason: 'empty', netlist: nl };
    const r = root.Spice.tran(nl.elements, opts || {});
    return { ok: r.converged, result: r, netlist: nl };
  }

  function ac(comps, wires, engine, opts) {
    const nl = toNetlist(comps, wires, engine);
    if (nl.unsupported.length) return { ok: false, reason: 'unsupported', netlist: nl };
    // AC 需要一個有 ac 振幅的源；沒有的話所有節點都是 0，圖是一條平線
    const src = nl.elements.find(e => e.type === 'V');
    if (src) src.ac = 1;
    const r = root.Spice.ac(nl.elements, opts || {});
    return { ok: r.converged, result: r, netlist: nl };
  }

  const SchSpice = { KIND, DEFAULT, toNetlist, dc, tran, ac };
  if (typeof module !== 'undefined' && module.exports) module.exports = SchSpice;
  root.SchSpice = SchSpice;
})(typeof window !== 'undefined' ? window : globalThis);
