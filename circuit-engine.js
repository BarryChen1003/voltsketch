/**
 * circuit-engine.js
 * 電路連線引擎：接腳(pin)定義、節點(net)計算、Falstad netlist 匯出。
 * 純函式，掛在 window.CircuitEngine，供 app.js 使用。
 *
 * 座標系：元件以 translate(x,y) rotate(rotation) 繪製，
 * 故 pin 以「中心(0,0) 為原點、未旋轉」的本地座標定義，使用時再套旋轉+平移。
 * 本地 pin 座標必須對齊 schematic-symbols.js 的實際符號終端。
 */
(function (global) {
  'use strict';

  // 每種元件的本地接腳：[dx, dy, name]
  const PinDefs = {
    resistor:  [[-24, 0, 'a'], [24, 0, 'b']],
    source:    [[0, -22, '+'], [0, 22, '-']],
    ground:    [[0, -18, 'g']],
    switch:    [[-14, 0, 'a'], [14, 0, 'b']],
    lamp:      [[-14, 0, 'a'], [14, 0, 'b']],
    led:       [[-16, 0, 'a'], [16, 0, 'k']],
    diode:     [[-14, 0, 'a'], [14, 0, 'k']],
    capacitor: [[0, -22, 'a'], [0, 22, 'b']],
    inductor:  [[-24, 0, 'a'], [24, 0, 'b']],
    ammeter:   [[-14, 0, 'a'], [14, 0, 'b']],
    voltmeter: [[-14, 0, 'a'], [14, 0, 'b']],
    nmos:      [[-30, 0, 'G'], [26, -20, 'S'], [26, 20, 'D']],
    pmos:      [[-30, 0, 'G'], [26, -20, 'S'], [26, 20, 'D']],
    // 雙 MOS：外框 ±60，G 左出(-60)、S/D 右出(+60)；下顆上下標籤對調(D2 上、S2 下)
    dualnmos:  [[-60, -32, 'G1'], [60, -52, 'S1'], [60, -12, 'D1'], [-60, 32, 'G2'], [60, 12, 'D2'], [60, 52, 'S2']],
    dualpmos:  [[-60, -32, 'G1'], [60, -52, 'S1'], [60, -12, 'D1'], [-60, 32, 'G2'], [60, 12, 'D2'], [60, 52, 'S2']],
    npn:       [[-26, 0, 'B'], [8, -30, 'C'], [8, 30, 'E']],
    pnp:       [[-26, 0, 'B'], [8, -30, 'C'], [8, 30, 'E']],
    opamp:     [[-18, -10, 'IN+'], [-18, 10, 'IN-'], [18, 0, 'OUT']],
    comparator:[[-28, -7, '1'], [-28, 7, '2'], [28, 0, '4'], [0, -30, '5'], [0, 30, '3']],
    dcdc:      [[-18, -6, 'VIN'], [-18, 6, 'GND'], [18, -6, 'VOUT'], [18, 6, 'FB']],
    // 單閘邏輯 IC(SC70-5)：1/2 左輸入、4 右輸出、5 頂(VCC)、3 底(GND)
    and:  [[-28, -7, '1'], [-28, 7, '2'], [28, 0, '4'], [0, -30, '5'], [0, 30, '3']],
    or:   [[-28, -7, '1'], [-28, 7, '2'], [28, 0, '4'], [0, -30, '5'], [0, 30, '3']],
    nand: [[-28, -7, '1'], [-28, 7, '2'], [28, 0, '4'], [0, -30, '5'], [0, 30, '3']],
    nor:  [[-28, -7, '1'], [-28, 7, '2'], [28, 0, '4'], [0, -30, '5'], [0, 30, '3']],
    xor:  [[-28, -7, '1'], [-28, 7, '2'], [28, 0, '4'], [0, -30, '5'], [0, 30, '3']],
    xnor: [[-28, -7, '1'], [-28, 7, '2'], [28, 0, '4'], [0, -30, '5'], [0, 30, '3']],
    not:    [[-28, 0, '1'], [28, 0, '4'], [0, -30, '5'], [0, 30, '3']],
    buffer: [[-28, 0, '1'], [28, 0, '4'], [0, -30, '5'], [0, 30, '3']]
  };

  // Falstad 可直接匯出的二端元件（其餘列為未支援）
  const FALSTAD_SUPPORTED = new Set([
    'resistor', 'source', 'ground', 'switch', 'lamp', 'led', 'diode',
    'capacitor', 'inductor', 'ammeter', 'voltmeter'
  ]);

  function rot(dx, dy, deg) {
    const r = (deg || 0) * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
    return [dx * c - dy * s, dx * s + dy * c];
  }

  /**
   * 自訂 IC 方框佈局：依 comp.icPins([{num,name,side,type}]) 算方框尺寸與各腳本地座標。
   * side 未給 → DIP 自動分配(前半左、後半右)。回傳 {w,h,pins:[{...,bx,by,x,y}]}。
   * (bx,by)=方框邊上的接點、(x,y)=引線端(接線處，在框外)。
   */
  function icLayout(comp) {
    // pitch/lead/box 皆 20 格倍數 → 元件中心在格點時，所有腳端點也落在格點（接線可貼齊）
    const pitch = 40, lead = 40, pad = 32, minW = 120, minH = 80;
    const raw = comp.icPins || [];
    const pins = raw.map((p, i) => ({
      num: String(p.num != null ? p.num : i + 1), name: p.name || '',
      side: (p.side || '').toUpperCase(), type: p.type || '', index: i
    }));
    if (!pins.some(p => p.side)) {
      const k = Math.ceil(pins.length / 2);
      pins.forEach((p, i) => { p.side = i < k ? 'L' : 'R'; });
    } else pins.forEach(p => { if (!p.side) p.side = 'L'; });
    const L = pins.filter(p => p.side === 'L'), R = pins.filter(p => p.side === 'R'),
      T = pins.filter(p => p.side === 'T'), B = pins.filter(p => p.side === 'B');
    const nameW = String(comp.name || comp.label || '').length * 6 + 24;
    // box 邊長取 40 倍數 → ±w/2、±h/2 落在 20 格，腳端點貼齊
    const w = Math.ceil(Math.max(minW, nameW, T.length * pitch + pad, B.length * pitch + pad) / 40) * 40;
    const h = Math.ceil(Math.max(minH, Math.max(L.length, R.length) * pitch + pad) / 40) * 40;
    const placeV = (arr, bx, sign) => { const m = arr.length; arr.forEach((p, i) => { const y = -(m - 1) / 2 * pitch + i * pitch; p.bx = bx; p.by = y; p.x = bx + sign * lead; p.y = y; }); };
    const placeH = (arr, by, sign) => { const m = arr.length; arr.forEach((p, i) => { const x = -(m - 1) / 2 * pitch + i * pitch; p.bx = x; p.by = by; p.x = x; p.y = by + sign * lead; }); };
    placeV(L, -w / 2, -1); placeV(R, w / 2, 1); placeH(T, -h / 2, -1); placeH(B, h / 2, 1);
    return { w, h, pins };
  }

  // 回傳元件的絕對接腳：[{name, x, y, comp, index}]（含水平/垂直翻轉）
  function getPins(comp) {
    const k = comp.scale || 1;   // 連接點位置隨大小縮放（點本身大小不變）
    const sx = (comp.flipH ? -1 : 1) * k, sy = (comp.flipV ? -1 : 1) * k;
    if (comp.type === 'ic') {
      return icLayout(comp).pins.map((p, i) => {
        const [rx, ry] = rot(p.x * sx, p.y * sy, comp.rotation);
        return { name: p.num, x: comp.x + rx, y: comp.y + ry, comp, index: i };
      });
    }
    const defs = PinDefs[comp.type] || [];
    return defs.map(([dx, dy, name], i) => {
      const [rx, ry] = rot(dx * sx, dy * sy, comp.rotation);
      return { name, x: comp.x + rx, y: comp.y + ry, comp, index: i };
    });
  }

  function dist(ax, ay, bx, by) { return Math.hypot(ax - bx, ay - by); }

  // 點是否落在線段「內部」(距線段≤eps 且不靠近兩端點)
  function onSegInterior(px, py, seg, eps) {
    const x0 = seg[0], y0 = seg[1], x1 = seg[2], y1 = seg[3];
    if (dist(px, py, x0, y0) <= eps || dist(px, py, x1, y1) <= eps) return false;
    const dx = x1 - x0, dy = y1 - y0, L2 = dx * dx + dy * dy;
    if (L2 === 0) return false;
    let t = ((px - x0) * dx + (py - y0) * dy) / L2;
    if (t <= 0 || t >= 1) return false;
    const d = dist(px, py, x0 + t * dx, y0 + t * dy);
    return d <= eps;
  }

  /**
   * 找最近的吸附目標（接腳或既有導線端點），半徑內回傳 {x,y,type,pin}，否則回傳網格吸附點。
   */
  function snapTarget(x, y, components, wires, radius, grid) {
    radius = radius || 14; grid = grid || 10;
    let best = null, bestD = radius;
    (components || []).forEach(c => {
      getPins(c).forEach(p => {
        const d = dist(x, y, p.x, p.y);
        if (d < bestD) { bestD = d; best = { x: p.x, y: p.y, type: 'pin', pin: p }; }
      });
    });
    (wires || []).forEach(w => {
      [[w.x1, w.y1], [w.x2, w.y2]].forEach(([ex, ey]) => {
        const d = dist(x, y, ex, ey);
        if (d < bestD) { bestD = d; best = { x: ex, y: ey, type: 'wireEnd' }; }
      });
    });
    if (best) return best;
    return { x: Math.round(x / grid) * grid, y: Math.round(y / grid) * grid, type: 'grid' };
  }

  /**
   * 節點計算：union-find 把同電位點併在一起。
   * 規則：每條導線兩端同電位；任何空間重合(≤EPS)的點同電位。
   * 回傳 { pinNet: Map(comp.id+':'+index -> netId), netCount, connectedPins:Set }
   */
  function computeNets(components, wires, eps) {
    eps = eps || 6;
    const pts = []; // {x,y,kind,key}
    (components || []).forEach(c => {
      getPins(c).forEach(p => pts.push({ x: p.x, y: p.y, kind: 'pin', key: c.id + ':' + p.index }));
    });
    (wires || []).forEach((w, i) => {
      pts.push({ x: w.x1, y: w.y1, kind: 'wire', key: 'w' + i + ':a', wi: i });
      pts.push({ x: w.x2, y: w.y2, kind: 'wire', key: 'w' + i + ':b', wi: i });
    });
    const parent = pts.map((_, i) => i);
    function find(a) { while (parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a]; } return a; }
    function union(a, b) { const ra = find(a), rb = find(b); if (ra !== rb) parent[ra] = rb; }
    // 導線兩端相連
    const wireEnds = {};
    pts.forEach((p, i) => { if (p.kind === 'wire') { (wireEnds[p.wi] = wireEnds[p.wi] || []).push(i); } });
    Object.values(wireEnds).forEach(arr => { for (let k = 1; k < arr.length; k++) union(arr[0], arr[k]); });
    // 空間重合相連（O(n^2)，元件數不大可接受）
    for (let i = 0; i < pts.length; i++)
      for (let j = i + 1; j < pts.length; j++)
        if (dist(pts[i].x, pts[i].y, pts[j].x, pts[j].y) <= eps) union(i, j);
    // T 型接點：某點落在另一條導線內部 → 視為相連
    (wires || []).forEach((w, wi) => {
      const seg = [w.x1, w.y1, w.x2, w.y2];
      const ends = wireEnds[wi];
      if (!ends || !ends.length) return;
      pts.forEach((p, i) => {
        if (p.kind === 'wire' && p.wi === wi) return; // 跳過自己兩端
        if (onSegInterior(p.x, p.y, seg, eps)) union(i, ends[0]);
      });
    });

    // 整理每個 net 內的 pin 數
    const netMembers = {};
    pts.forEach((p, i) => { const r = find(i); (netMembers[r] = netMembers[r] || []).push(p); });
    const pinNet = new Map();
    const connectedPins = new Set();
    pts.forEach((p, i) => {
      if (p.kind !== 'pin') return;
      const r = find(i);
      pinNet.set(p.key, r);
      const members = netMembers[r];
      const pinCount = members.filter(m => m.kind === 'pin').length;
      if (pinCount >= 2) connectedPins.add(p.key); // 與其他接腳同網才算「已連接」
    });
    return { pinNet, connectedPins, netCount: Object.keys(netMembers).length, find, pts };
  }

  /**
   * 導線接點(顯示用)：回傳 [{x,y}]，在「電氣相連」處畫實心點。
   * 規則：連接數 = 重合的導線端點數 + 2×(內部穿過此點的導線數)，≥3 才畫點。
   * → T 型(端點落在線中)、三線交會 會畫；單純轉角(2端)或無共點交叉 不畫。
   */
  function junctions(components, wires, eps) {
    eps = eps || 6;
    wires = wires || [];
    const ends = [];
    wires.forEach(w => { ends.push([w.x1, w.y1]); ends.push([w.x2, w.y2]); });
    const used = ends.map(() => false);
    const res = [];
    for (let i = 0; i < ends.length; i++) {
      if (used[i]) continue;
      const cx = ends[i][0], cy = ends[i][1];
      let count = 0;
      ends.forEach((e, j) => { if (dist(cx, cy, e[0], e[1]) <= eps) { count++; used[j] = true; } });
      let through = 0;
      wires.forEach(w => { if (onSegInterior(cx, cy, [w.x1, w.y1, w.x2, w.y2], eps)) through++; });
      if (count + 2 * through >= 3) res.push({ x: cx, y: cy });
    }
    return res;
  }

  // ---- Falstad 匯出 ----
  function fval(v, d) { return (v === undefined || v === null || isNaN(v)) ? d : v; }
  function ri(n) { return Math.round(n); }

  function elemLine(comp) {
    const pins = getPins(comp).map(p => ({ x: ri(p.x), y: ri(p.y) }));
    const t = comp.type, v = comp.value;
    const a = pins[0], b = pins[1];
    switch (t) {
      case 'resistor': return `r ${a.x} ${a.y} ${b.x} ${b.y} 0 ${fval(v, 1000)}`;
      case 'lamp':     return `r ${a.x} ${a.y} ${b.x} ${b.y} 0 ${fval(v, 100)}`;
      case 'ammeter':  return `w ${a.x} ${a.y} ${b.x} ${b.y} 0`;                 // 串聯近似 0Ω
      case 'voltmeter':return `p ${a.x} ${a.y} ${b.x} ${b.y} 0 3`;              // Falstad 電壓探針
      case 'source':   return `v ${a.x} ${a.y} ${b.x} ${b.y} 0 0 40 ${fval(v, 5)} 0 0 0.5`;
      case 'ground':   return `g ${a.x} ${a.y} ${a.x} ${a.y + 16} 0`;
      case 'switch':   return `s ${a.x} ${a.y} ${b.x} ${b.y} 0 ${comp.closed ? 0 : 1} false`;
      case 'led':      return `d ${a.x} ${a.y} ${b.x} ${b.y} 2 default`;        // LED 以二極體近似
      case 'diode':    return `d ${a.x} ${a.y} ${b.x} ${b.y} 2 default`;
      case 'capacitor':return `c ${a.x} ${a.y} ${b.x} ${b.y} 0 ${fval(v, 1e-7)} 0 0.001`;
      case 'inductor': return `l ${a.x} ${a.y} ${b.x} ${b.y} 0 ${fval(v, 1e-3)} 0`;
      default: return null;
    }
  }

  /**
   * 三端元件(電晶體)匯出：CircuitJS 的 f/t 把 post0(gate/base) 放在第一個 dump 點 →
   * 用我們的 gate/base 接腳當第一點，可靠自動接；通道(D/S 或 C/E)端放在第二點側，
   * 以 w 線接到我們的接腳。屬實驗性(通道端幾何為近似，需在 Falstad 內確認)。
   */
  function emitTransistor(c, lines) {
    const pins = getPins(c).map(p => ({ x: ri(p.x), y: ri(p.y), name: p.name }));
    if (pins.length < 3) return false;
    const ctrl = pins[0];                 // gate / base
    const bx = ctrl.x + 48, by = ctrl.y;  // body 點(水平擺放)
    if (c.type === 'nmos' || c.type === 'pmos') {
      const S = pins[1], D = pins[2];
      lines.push(`f ${ctrl.x} ${ctrl.y} ${bx} ${by} ${c.type === 'pmos' ? 1 : 0} 1.5 0.02`);
      lines.push(`w ${bx} ${by - 16} ${D.x} ${D.y} 0`);
      lines.push(`w ${bx} ${by + 16} ${S.x} ${S.y} 0`);
    } else { // npn / pnp
      const C2 = pins[1], E = pins[2];
      lines.push(`t ${ctrl.x} ${ctrl.y} ${bx} ${by} 0 ${c.type === 'pnp' ? -1 : 1} 0 0 100`);
      lines.push(`w ${bx} ${by - 16} ${C2.x} ${C2.y} 0`);
      lines.push(`w ${bx} ${by + 16} ${E.x} ${E.y} 0`);
    }
    return true;
  }

  const FALSTAD_TRANSISTOR = new Set(['nmos', 'pmos', 'npn', 'pnp']);

  /** 回傳 { text, unsupported:[{...}], experimental:[label] } */
  function toFalstad(components, wires) {
    const lines = ['$ 1 0.000005 10.20027730826997 50 5 50 5e-11'];
    const unsupported = [];
    const experimental = [];
    (components || []).forEach(c => {
      if (FALSTAD_SUPPORTED.has(c.type)) {
        const ln = elemLine(c);
        if (ln) lines.push(ln); else unsupported.push({ id: c.id, type: c.type, label: c.label });
      } else if (FALSTAD_TRANSISTOR.has(c.type)) {
        if (emitTransistor(c, lines)) experimental.push(c.label || c.type);
        else unsupported.push({ id: c.id, type: c.type, label: c.label });
      } else {
        unsupported.push({ id: c.id, type: c.type, label: c.label }); // 閘/雙MOS/OP/DC-DC 暫不轉
      }
    });
    (wires || []).forEach(w => {
      lines.push(`w ${ri(w.x1)} ${ri(w.y1)} ${ri(w.x2)} ${ri(w.y2)} 0`);
    });
    return { text: lines.join('\n') + '\n', unsupported, experimental };
  }

  function falstadURL(text, opts) {
    opts = opts || {};
    const base = 'https://www.falstad.com/circuit/circuitjs.html';
    const params = ['cct=' + encodeURIComponent(text)];
    if (opts.running === false) params.push('running=false');
    if (opts.hideMenu) params.push('hideMenu=true');
    return base + '?' + params.join('&');
  }

  global.CircuitEngine = {
    PinDefs, FALSTAD_SUPPORTED, getPins, snapTarget, computeNets, toFalstad, falstadURL, dist, junctions, icLayout, onSegInterior
  };
})(typeof window !== 'undefined' ? window : this);
