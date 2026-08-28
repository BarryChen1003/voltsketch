/**
 * pcb-autoplace.js — PCB 自動擺件（粗排）
 *
 * 定位講清楚：這是**粗排**，不是自動佈局。目標是把一堆疊在原點、或散在板外的元件
 * 整理成「不重疊、在板框內、相連的靠在一起」的起始狀態，讓人接手細擺。
 * 它不看層、不看熱、不看阻抗、不保證可繞通。
 *
 * 為什麼做在 PCB 端是安全的：
 *   Sch2Pcb.merge() 合併時是 Object.assign({}, nc, { x: old.x, y: old.y, rot: old.rot })
 *   —— 位置以板子為準保留。所以擺好的位置不會被下一次 ECO 同步蓋掉。
 *   （refdes 相反，見 annotate.js 檔頭。）
 *
 * 兩段式，沒有亂數（同樣輸入永遠同樣輸出，測試才驗得動）：
 *   1. shelf packing 給初始位置：面積大的先放，由左至右排、放不下就換列。
 *   2. 有 net 連接資訊時，跑固定輪數的力導向微調：相連的互相吸引，
 *      每輪結束強制解重疊並夾回板框內。沒有 net 就停在第 1 段的整齊排列。
 *
 * 力導向為什麼要夾在最後：先解重疊再夾邊界的話，夾邊界會把元件推回去重疊。
 * 順序固定為「吸引 → 解重疊 → 夾邊界」，最後一步保證不出框，代價是邊緣可能微擠。
 *
 * 純函式：不碰 DOM、不改傳進來的物件，回傳新座標讓呼叫端套用。
 * 測試：autoplace.test.js
 */
(function (root) {
  'use strict';

  const DEF = {
    margin: 2,          // 離板邊留白 mm
    gap: 0.8,           // 元件之間最小間隙 mm
    grid: 0.5,          // 最後對齊的網格 mm
    rounds: 60,         // 力導向輪數（固定，不看收斂——要可重現）
    pull: 0.08,         // 吸引力係數
    maxStep: 2,         // 單輪單軸最大位移 mm，避免一步彈飛
  };

  const sizeOf = c => ({
    w: Math.max(0.4, +c.w || 1),
    h: Math.max(0.4, +c.h || 1),
  });

  const snap = (v, g) => (g > 0 ? Math.round(v / g) * g : v);
  const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

  // 電源與地的網名。跟 pcb-rules / pcb-constraints 猜 net class 用的是同一套字樣慣例。
  const POWER_RE = /^(gnd|agnd|dgnd|pgnd|gnda|gndd|vss|vcc|vdd|vee|vbat|vin|vout|vbus|v\d|\+?\d+v\d*|\d+v\d*)$/i;

  // 從 pads 的 net 推出「哪兩顆元件相連」。
  // 電源與地接了半塊板，當成連接會把所有東西吸成一坨，所以要排掉。兩道關卡：
  //   1. 網名看起來就是電源/地 → 直接排除。
  //   2. 名字看不出來，但接的元件數佔全板比例過高 → 也排除。
  // 只用絕對門檻（原本寫死 8）在小板上會失效：6 顆元件的板子，GND 接 5 顆
  // 也沒超過 8，結果全部被吸成一坨。實測就是這樣抓到的。
  function adjacency(comps, opts) {
    const o = opts || {};
    const n = comps.length;
    const maxFan = Math.max(3, Math.min(o.maxFanout || 8, Math.ceil(n / 3)));
    const byNet = new Map();
    comps.forEach((c, i) => {
      for (const p of (c.pads || [])) {
        const n = p && p.net;
        if (!n) continue;
        if (!byNet.has(n)) byNet.set(n, new Set());
        byNet.get(n).add(i);
      }
    });
    const pairs = new Map();          // "i,j" → 權重
    for (const [net, set] of byNet) {
      if (set.size < 2 || set.size > maxFan) continue;
      if (POWER_RE.test(String(net).trim())) continue;
      const idx = [...set].sort((a, b) => a - b);
      for (let a = 0; a < idx.length; a++) {
        for (let b = a + 1; b < idx.length; b++) {
          const k = idx[a] + ',' + idx[b];
          pairs.set(k, (pairs.get(k) || 0) + 1);
        }
      }
    }
    return [...pairs.entries()].map(([k, w]) => {
      const [i, j] = k.split(',').map(Number);
      return { i, j, w };
    });
  }

  // 第 1 段：shelf packing。大的先放（大件決定版面，小件填縫）。
  function shelf(items, W, H, o) {
    const order = items.map((it, i) => i).sort((a, b) => {
      const A = items[a], B = items[b];
      const areaA = A.w * A.h, areaB = B.w * B.h;
      if (areaB !== areaA) return areaB - areaA;
      return String(A.id).localeCompare(String(B.id));   // 同面積用 id 決勝，保可重現
    });
    const out = new Array(items.length);
    let cx = o.margin, cy = o.margin, rowH = 0;
    for (const i of order) {
      const it = items[i];
      if (cx + it.w > W - o.margin && cx > o.margin) {   // 換列
        cx = o.margin; cy += rowH + o.gap; rowH = 0;
      }
      out[i] = { x: cx + it.w / 2, y: cy + it.h / 2 };
      cx += it.w + o.gap;
      rowH = Math.max(rowH, it.h);
    }
    return out;
  }

  // 解重疊：只推開真的相交的一對，沿重疊較少的那一軸推（推較短的距離，破壞最小）
  // 單獨一趟不夠——推開 A/B 會把 A 推進 C。要迭代到不動為止，見 settle()。
  function separate(items, pos, locked, o) {
    let moved = 0;
    for (let a = 0; a < items.length; a++) {
      for (let b = a + 1; b < items.length; b++) {
        const A = items[a], B = items[b], pa = pos[a], pb = pos[b];
        const needX = (A.w + B.w) / 2 + o.gap;
        const needY = (A.h + B.h) / 2 + o.gap;
        const dx = pb.x - pa.x, dy = pb.y - pa.y;
        const ovX = needX - Math.abs(dx), ovY = needY - Math.abs(dy);
        if (ovX <= 0 || ovY <= 0) continue;              // 沒相交
        const bothLocked = locked[a] && locked[b];
        if (bothLocked) continue;                        // 兩顆都鎖死就讓它重疊，回報給使用者
        const push = (which, ax, ay) => {
          if (which === 'a') { pa.x -= ax; pa.y -= ay; } else { pb.x += ax; pb.y += ay; }
        };
        // 沿重疊較淺的軸推開
        let ax = 0, ay = 0;
        if (ovX < ovY) ax = (dx >= 0 ? ovX : -ovX); else ay = (dy >= 0 ? ovY : -ovY);
        if (locked[a]) { pb.x += ax; pb.y += ay; }
        else if (locked[b]) { pa.x -= ax; pa.y -= ay; }
        else { push('a', ax / 2, ay / 2); push('b', ax / 2, ay / 2); }
        moved++;
      }
    }
    return moved;
  }

  // 迭代解重疊直到沒有東西再動（或撞到上限——板子塞不下時本來就解不開，
  // 那種情況照實留著重疊並回報，不要無限迴圈也不要假裝排好了）。
  function settle(items, pos, locked, W, H, o, iters) {
    const lim = iters || 40;
    for (let k = 0; k < lim; k++) {
      const moved = separate(items, pos, locked, o);
      clampAll(items, pos, locked, W, H, o);
      if (!moved) return k;
    }
    return lim;
  }

  function clampAll(items, pos, locked, W, H, o) {
    for (let i = 0; i < items.length; i++) {
      if (locked[i]) continue;
      const it = items[i];
      pos[i].x = clamp(pos[i].x, o.margin + it.w / 2, Math.max(o.margin + it.w / 2, W - o.margin - it.w / 2));
      pos[i].y = clamp(pos[i].y, o.margin + it.h / 2, Math.max(o.margin + it.h / 2, H - o.margin - it.h / 2));
    }
  }

  /**
   * 規劃擺放。
   * @param comps 元件陣列（{ ref|id, x, y, w, h, pads? }）
   * @param opts  { boardWidth, boardHeight, locked:[ref…], margin, gap, grid, rounds, keepLocked }
   * @returns { moves:[{id, ref, from:{x,y}, to:{x,y}}], overlaps:number, linked:number, skipped:[ref] }
   */
  function plan(comps, opts) {
    const o = Object.assign({}, DEF, opts || {});
    const W = Math.max(4, +o.boardWidth || 100);
    const H = Math.max(4, +o.boardHeight || 80);
    const src = (comps || []).filter(Boolean);
    if (!src.length) return { moves: [], overlaps: 0, linked: 0, skipped: [] };

    const lockedSet = new Set((o.locked || []).map(String));
    const items = src.map((c, i) => {
      const s = sizeOf(c);
      return { id: c.id != null ? c.id : (c.ref || 'i' + i), ref: c.ref || c.id || ('i' + i), w: s.w, h: s.h };
    });
    const locked = src.map(c => lockedSet.has(String(c.ref)) || lockedSet.has(String(c.id)));

    // 放不進板框的元件不參與擺放，照實回報——硬塞只會製造出框的板子
    const tooBig = [];
    items.forEach((it, i) => {
      if (it.w > W - 2 * o.margin || it.h > H - 2 * o.margin) { tooBig.push(it.ref); locked[i] = true; }
    });

    const start = shelf(items, W, H, o);
    const pos = items.map((it, i) => (locked[i]
      ? { x: +src[i].x || 0, y: +src[i].y || 0 }        // 鎖住的留在原地
      : { x: start[i].x, y: start[i].y }));

    const links = adjacency(src, o);
    if (links.length) {
      for (let r = 0; r < o.rounds; r++) {
        const dv = pos.map(() => ({ x: 0, y: 0 }));
        for (const { i, j, w } of links) {
          const dx = pos[j].x - pos[i].x, dy = pos[j].y - pos[i].y;
          const f = o.pull * w;
          dv[i].x += dx * f; dv[i].y += dy * f;
          dv[j].x -= dx * f; dv[j].y -= dy * f;
        }
        for (let i = 0; i < pos.length; i++) {
          if (locked[i]) continue;
          pos[i].x += clamp(dv[i].x, -o.maxStep, o.maxStep);
          pos[i].y += clamp(dv[i].y, -o.maxStep, o.maxStep);
        }
        settle(items, pos, locked, W, H, o, 8);   // 每輪只求「大致不疊」，最後再解乾淨
      }
    }

    // 收尾。順序是有理由的：
    //   先用「gap + grid」的放大間距解到收斂，再對網格。
    //   snap 每軸最多位移 grid/2，兩顆最壞情況互相靠近 grid——放大的那一個 grid
    //   剛好被吃掉，snap 完仍然滿足真正的 gap。反過來（先 snap 再解）會讓
    //   最後一步的 snap 重新製造出重疊，那正是第一版沒過測試的原因。
    const wide = Object.assign({}, o, { gap: o.gap + o.grid });
    settle(items, pos, locked, W, H, wide, 60);
    for (let i = 0; i < pos.length; i++) {
      if (locked[i]) continue;
      pos[i].x = snap(pos[i].x, o.grid);
      pos[i].y = snap(pos[i].y, o.grid);
    }
    clampAll(items, pos, locked, W, H, o);      // snap 可能把邊緣的推出框半格

    const moves = [];
    for (let i = 0; i < items.length; i++) {
      if (locked[i]) continue;
      const fx = +src[i].x || 0, fy = +src[i].y || 0;
      if (Math.abs(fx - pos[i].x) < 1e-9 && Math.abs(fy - pos[i].y) < 1e-9) continue;
      moves.push({ id: items[i].id, ref: items[i].ref, from: { x: fx, y: fy }, to: { x: pos[i].x, y: pos[i].y } });
    }
    return { moves, overlaps: countOverlaps(items, pos, o), linked: links.length, skipped: tooBig };
  }

  function countOverlaps(items, pos, o) {
    const g = (o && o.gap) || 0;
    let n = 0;
    for (let a = 0; a < items.length; a++) {
      for (let b = a + 1; b < items.length; b++) {
        const needX = (items[a].w + items[b].w) / 2 + g - 1e-9;
        const needY = (items[a].h + items[b].h) / 2 + g - 1e-9;
        if (Math.abs(pos[b].x - pos[a].x) < needX && Math.abs(pos[b].y - pos[a].y) < needY) n++;
      }
    }
    return n;
  }

  function apply(comps, moves) {
    const by = new Map();
    (comps || []).forEach(c => { if (c) { by.set(String(c.id), c); by.set(String(c.ref), c); } });
    let n = 0;
    for (const m of (moves || [])) {
      const c = by.get(String(m.id)) || by.get(String(m.ref));
      if (!c) continue;
      c.x = m.to.x; c.y = m.to.y; n++;
    }
    return n;
  }

  const AutoPlace = { DEF, POWER_RE, plan, apply, adjacency, _shelf: shelf, _countOverlaps: countOverlaps };

  if (typeof module !== 'undefined' && module.exports) module.exports = AutoPlace;
  root.AutoPlace = AutoPlace;
})(typeof window !== 'undefined' ? window : globalThis);
