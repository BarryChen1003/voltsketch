// 線路圖 → PCB 轉換
//
// 為什麼重寫：舊的 syncFromSchematic 把每個元件都當成 IC，pad 一律 1.2×1.2mm SMD，
// 位置直接拿線路圖符號的腳位座標乘 0.08。電阻符號兩腳距 60px → 4.8mm 腳距、1.2mm 方 pad，
// 那不是任何真實封裝。飛線會出來、DRC 跑得動、看起來像成功了，但那片板做不出來。
//
// 這裡改成用真封裝：被動件走 PartsLib（15 類、含 0201～2512 與各種 SOT/SOD），
// IC 走 FootprintGen.fromIC（IC_DATA 全覆蓋）。**對不出來的就標出來讓使用者指定，
// 不編一個假的方塊塞過去**——這是跟 EasyEDA 最大的差別：它要求你在線路圖階段就綁好封裝，
// 我們允許你之後補，但絕不假裝已經有了。
//
// 純函式（不碰 DOM），node 可直接測。
(() => {
  'use strict';

  // 線路圖元件型別 → 真實封裝。變體選預設值，之後可由 UI 覆寫。
  // 選變體的原則：讓封裝腳數與符號腳數對得上（例如石英振盪器選 2-pad 而不是 4-pad）。
  const MAP = {
    resistor: { lib: 'res', variant: '0603' },
    capacitor: { lib: 'cap', variant: '0603' },
    inductor: { lib: 'ind', variant: '0603' },
    bead: { lib: 'bead', variant: '0603' },
    led: { lib: 'led', variant: '0603' },
    diode: { lib: 'dio', variant: 'SOD-123' },
    tvs: { lib: 'dio', variant: 'SMA (DO-214AC)' },
    varistor: { lib: 'dio', variant: 'SMB (DO-214AA)' },
    gdt: { lib: 'dio', variant: 'SMC (DO-214AB)' },
    fuse: { lib: 'fuse', variant: '1206' },
    xtal: { lib: 'xtal', variant: '5032 (2-pad)' },
    npn: { lib: 'tran', variant: 'SOT-23' },
    pnp: { lib: 'tran', variant: 'SOT-23' },
    nmos: { lib: 'tran', variant: 'SOT-23' },
    pmos: { lib: 'tran', variant: 'SOT-23' },
    dualnmos: { lib: 'tran', variant: 'SOT-23-5' },
    dualpmos: { lib: 'tran', variant: 'SOT-23-5' },
    // 以下幾種符號沒有唯一正解，給常見預設但標 assumed：
    // 電源符號在真板上可能是端子台、桶插、排針或電池座；I/O 埠可能是測試點或接頭。
    // 標出來讓使用者知道「這是我替你選的」，而不是讓他以為線路圖裡本來就指定好了。
    source: { lib: 'term', variant: '2P', assumed: true },
    io: { lib: 'tp', variant: 'Ø1.5', assumed: true },
    vrail: { lib: 'tp', variant: 'Ø1.5', assumed: true },
    lamp: { lib: 'led', variant: '1206', assumed: true }
  };

  // 這些是線路圖上的符號，不是板子上的零件。跳過但要說出來，不要靜靜消失。
  // port / sheetref 是階層式圖紙的記號（sch-hier.js），不是料件。
  // sheetref 正常情況下在 SchHier.build 就被展開掉了；列在這裡是為了
  // 「沒有走展開那條路」的舊資料也不會被當成一顆要買的零件。
  const NON_PHYSICAL = ['ground', 'text', 'grid', 'shield', 'ammeter', 'voltmeter', 'port', 'sheetref'];

  // 走 IC 封裝產生器的型別（用 comp.name 去 IC_DATA 查）
  const IC_TYPES = ['ic', 'opamp', 'comparator', 'buffer', 'dcdc',
    'and', 'or', 'nand', 'nor', 'xor', 'xnor', 'not'];

  const libs = () => ({
    PartsLib: (typeof window !== 'undefined' && window.PartsLib) || (typeof global !== 'undefined' && global.PartsLib),
    FootprintGen: (typeof window !== 'undefined' && window.FootprintGen) || (typeof global !== 'undefined' && global.FootprintGen),
    IC_DATA: (typeof window !== 'undefined' && window.IC_DATA) || (typeof global !== 'undefined' && global.IC_DATA) || []
  });

  // 一個線路圖元件 → 封裝。回 {ok:true, pads, body, source, variant} 或 {ok:false, reason}
  function mapFootprint(sch, opts) {
    opts = opts || {};
    const { PartsLib, FootprintGen, IC_DATA } = libs();
    const type = sch.type || '';
    if (NON_PHYSICAL.indexOf(type) >= 0) return { ok: false, reason: 'nonPhysical' };

    // 使用者指定的覆寫優先（UI 之後可以逐顆改）
    // 封裝的決定有三個來源，由近到遠：
    //   1. 這次轉換傳進來的 overrides（PCB 端剛改的）
    //   2. 線路圖元件自己帶的 footprint（back-annotation 寫回去的，跨 session 存活）
    //   3. MAP 的預設值（猜的，會被標成 assumed）
    // 沒有第 2 項的話，使用者在 PCB 挑好的封裝只活在這一頁分頁的記憶體裡。
    const fromSch = (() => {
      const f = String(sch.footprint || "");
      const at = f.indexOf(":");
      if (at <= 0) return null;
      return { lib: f.slice(0, at), variant: f.slice(at + 1) };
    })();
    const ov = (opts.overrides || {})[sch.id] || fromSch;
    const m = ov || MAP[type];

    if (m && PartsLib) {
      const b = PartsLib.build(m.lib, m.variant);
      if (b && b.ok) return {
        ok: true, pads: b.pads, body: b.body, source: 'partslib',
        lib: m.lib, variant: m.variant, assumed: !ov && !!m.assumed
      };
      return { ok: false, reason: 'variantNotFound', lib: m.lib, variant: m.variant };
    }

    if (IC_TYPES.indexOf(type) >= 0) {
      if (!FootprintGen) return { ok: false, reason: 'noGenerator' };
      const part = sch.name || sch.part || '';
      const ic = IC_DATA.find(x => x.part === part) ||
                 IC_DATA.find(x => String(x.part || '').toLowerCase() === String(part).toLowerCase());
      if (!ic) return { ok: false, reason: 'icNotInLibrary', part };
      const f = FootprintGen.fromIC(ic);
      if (!f || !f.ok) return { ok: false, reason: 'footprintGenFailed', part };
      return { ok: true, pads: f.pads, body: f.body, source: 'ic', part, meta: f.meta };
    }

    return { ok: false, reason: 'noMapping', type };
  }

  // pad ↔ 線路圖腳位對應。IC 走「pad.num = 腳號」，其餘走順序。
  // 對不起來就照實回報，不要把 net 掛到錯的腳上——那種錯板子做出來才會發現。
  //
  // pin swap（sch-swap.js）在這裡套用，而且**只在這裡**：pad 要取哪一隻線路圖腳的 net
  // 是這個函式的職責，交換規則散到別處就會出現「有的路徑套了、有的沒套」。
  // 交換記在線路圖元件的 pinSwap 上，所以下一次 ECO 同步會照樣套用，不會被蓋回去。
  function bindNets(pads, schPins, netOf, schId, schComp) {
    const out = pads.map(p => Object.assign({}, p));
    const notes = [];
    const byName = new Map();
    schPins.forEach(p => byName.set(String(p.name), p));
    const SW = (typeof window !== 'undefined' && window.SchSwap) || (typeof global !== 'undefined' && global.SchSwap);
    const swapped = (SW && schComp) ? SW.permutationOf(schComp) : {};
    const hasSwap = Object.keys(swapped).length > 0;
    let matchedByNum = 0;
    out.forEach((pad, i) => {
      let pin = byName.get(String(pad.num));
      if (pin) matchedByNum++;
      else pin = schPins[i];
      // 交換**在解出線路圖腳之後**才套用。
      // 反過來（先把 pad 編號換掉再去查）只在「pad 編號就是腳名」時有效——
      // 被動件的 pad 是 1/2 而腳名是 a/b，那條路會靜靜失效，交換看起來像沒做。
      if (hasSwap && pin) {
        const want = SW.mapPin(schComp, pin.name);
        if (want !== String(pin.name)) { const alt = byName.get(want); if (alt) pin = alt; }
      }
      pad.net = pin ? (netOf(schId, pin.index) || '') : '';
      if (!pin) pad.net = '';
    });
    if (hasSwap) notes.push('pinSwap');
    if (out.length > schPins.length) notes.push('extraPads');
    return { pads: out, notes, matchedByNum };
  }

  /**
   * 主轉換。
   * schComps: 線路圖元件陣列；getPins: (comp)=>[{name,index,x,y}]；
   * netOf: (schId, pinIndex)=>netName；opts: {overrides, scale, spacing}
   * 回 { components, unresolved, stats }
   */
  function convert(schComps, getPins, netOf, opts) {
    opts = Object.assign({ scale: 0.15, spacing: 1.5 }, opts || {});
    const components = [], unresolved = [], assumed = [];
    const bySource = { partslib: 0, ic: 0 };
    let refSeq = {};

    (schComps || []).forEach((sch, i) => {
      const fp = mapFootprint(sch, opts);
      if (!fp.ok) {
        if (fp.reason !== 'nonPhysical') {
          unresolved.push({ id: sch.id, type: sch.type, label: sch.label || '', reason: fp.reason, part: fp.part || '' });
        }
        return;
      }
      const schPins = getPins(sch) || [];
      if (fp.pads.length < schPins.length) {
        unresolved.push({
          id: sch.id, type: sch.type, label: sch.label || '',
          reason: 'pinCountMismatch', pads: fp.pads.length, pins: schPins.length
        });
        return;
      }
      const bound = bindNets(fp.pads, schPins, netOf, sch.id, sch);
      if (fp.assumed) assumed.push({ id: sch.id, type: sch.type, label: sch.label || '', lib: fp.lib, variant: fp.variant });
      const prefix = (sch.label || '').replace(/\d+$/, '') || 'U';
      refSeq[prefix] = (refSeq[prefix] || 0) + 1;
      const comp = {
        id: 'sch-' + sch.id,
        type: fp.source === 'ic' ? 'ic' : 'part', kind: fp.source === 'ic' ? 'ic' : 'part',
        x: 0, y: 0, rot: 0, side: 'top',
        w: Math.max(1, fp.body.w), h: Math.max(1, fp.body.h),
        ref: sch.label || (prefix + refSeq[prefix]),
        part: fp.source === 'ic' ? fp.part : (fp.lib + ' ' + fp.variant),
        label: sch.label || sch.type,
        footprintSource: fp.source, footprintVariant: fp.variant || (fp.meta && fp.meta.family) || '',
        footprintAssumed: !!fp.assumed,
        notes: bound.notes,
        pads: bound.pads,
        _sch: { x: sch.x || 0, y: sch.y || 0 }
      };
      // 元件實例 ／ 封裝庫分離：記下這顆的 pad 是從哪個庫展開的、當時長什麼樣。
      // 沒有這一章，之後庫改了就只能靠人眼比對（FpInst.status → unverified）。
      const FI = (typeof window !== 'undefined' && window.FpInst) || (typeof global !== 'undefined' && global.FpInst);
      if (FI) FI.stamp(comp, fp.source === 'ic'
        ? { src: 'ic', part: fp.part }
        : { src: 'partslib', lib: fp.lib, variant: fp.variant }, comp.pads);
      components.push(comp);
      bySource[fp.source]++;
    });

    place(components, opts);

    return {
      components, unresolved, assumed,
      stats: {
        total: (schComps || []).length, placed: components.length,
        unresolved: unresolved.length, assumed: assumed.length, bySource
      }
    };
  }

  /**
   * 擺位：照線路圖的相對位置縮放過來，再把重疊的推開。
   * 比「排成格子」有用得多——PCB 一眼看得出對應線路圖的哪一塊。
   */
  function place(components, opts) {
    opts = Object.assign({ scale: 0.15, spacing: 1.5, iterations: 60 }, opts || {});
    if (!components.length) return components;
    const S = opts.scale;
    let cx = 0, cy = 0;
    components.forEach(c => { cx += c._sch.x; cy += c._sch.y; });
    cx /= components.length; cy /= components.length;
    components.forEach(c => {
      c.x = (c._sch.x - cx) * S;
      c.y = (c._sch.y - cy) * S;
    });
    // 推開重疊：以包圍盒 + 間距判定，重疊就沿中心連線推開一半
    const gap = opts.spacing;
    for (let it = 0; it < opts.iterations; it++) {
      let moved = false;
      for (let i = 0; i < components.length; i++) {
        for (let j = i + 1; j < components.length; j++) {
          const a = components[i], b = components[j];
          const needX = (a.w + b.w) / 2 + gap, needY = (a.h + b.h) / 2 + gap;
          const dx = b.x - a.x, dy = b.y - a.y;
          const ox = needX - Math.abs(dx), oy = needY - Math.abs(dy);
          if (ox <= 0 || oy <= 0) continue;          // 沒重疊
          moved = true;
          // 推最少的那一軸，位移比較不會把版面攪亂
          if (ox < oy) {
            const s = (dx >= 0 ? 1 : -1) * ox / 2 + (dx === 0 ? ox / 2 : 0);
            a.x -= s; b.x += s;
          } else {
            const s = (dy >= 0 ? 1 : -1) * oy / 2 + (dy === 0 ? oy / 2 : 0);
            a.y -= s; b.y += s;
          }
        }
      }
      if (!moved) break;
    }
    return components;
  }

  // 板框建議：包住所有元件再加邊距，取整到 1mm
  function suggestBoard(components, margin) {
    const m = margin > 0 ? margin : 5;
    if (!components.length) return { w: 50, h: 40 };
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    components.forEach(c => {
      x0 = Math.min(x0, c.x - c.w / 2); x1 = Math.max(x1, c.x + c.w / 2);
      y0 = Math.min(y0, c.y - c.h / 2); y1 = Math.max(y1, c.y + c.h / 2);
    });
    return {
      w: Math.max(10, Math.ceil((x1 - x0) + 2 * m)),
      h: Math.max(10, Math.ceil((y1 - y0) + 2 * m))
    };
  }

  // ---- 增量更新（ECO）----
  // 為什麼要這個：舊的同步是「重新產生一片板」——components 換掉、traces/vias/鋪銅全清空。
  // 線路圖改一顆電阻，佈局就從頭來過，等於逼使用者永遠不要改線路圖。
  // 真正的 EDA 做法是把線路圖的改動當成 ECO：對得起來的保留位置與走線，
  // 新增的放進來，刪掉的移走，並且把差異列出來讓人確認。
  //
  // 對應鍵：線路圖轉出來的元件 id 是 `sch-<線路圖元件 id>`（與 cross-probe 同一套）。
  // 沒有這個前綴的（公版、KiCad 匯入、手動放的）不屬於這張線路圖，一律不動。
  //
  // 回 { components, kept, added, removed, netChanged, keptRefs, addedRefs, removedRefs }
  function merge(existing, converted) {
    const isSch = c => typeof c.id === "string" && c.id.indexOf("sch-") === 0;
    const byId = new Map();
    (existing || []).forEach(c => { if (isSch(c)) byId.set(c.id, c); });
    const out = (existing || []).filter(c => !isSch(c));   // 非線路圖來源的原樣留著
    const keptRefs = [], addedRefs = [], removedRefs = [];
    let netChanged = 0;

    for (const nc of (converted || [])) {
      const old = byId.get(nc.id);
      if (!old) { out.push(nc); addedRefs.push(nc.ref); continue; }
      byId.delete(nc.id);
      // 位置與旋轉是使用者辛苦擺的，保留；封裝與 net 以線路圖為準，換新的。
      const merged = Object.assign({}, nc, { x: old.x, y: old.y, rot: old.rot != null ? old.rot : nc.rot });
      // net 有變的話要記一筆：走線可能因此接到錯的網路上
      const oldNets = (old.pads || []).map(pd => (pd.num != null ? pd.num : "") + "=" + (pd.net || "")).join(",");
      const newNets = (merged.pads || []).map(pd => (pd.num != null ? pd.num : "") + "=" + (pd.net || "")).join(",");
      if (oldNets !== newNets) netChanged++;
      out.push(merged);
      keptRefs.push(nc.ref);
    }
    // 線路圖裡已經沒有的，從板上移除
    for (const gone of byId.values()) removedRefs.push(gone.ref);

    return {
      components: out,
      kept: keptRefs.length, added: addedRefs.length, removed: removedRefs.length,
      netChanged, keptRefs, addedRefs, removedRefs
    };
  }

  // 走線的 net 還在不在：線路圖刪掉一段電路之後，板上會留下接不到任何 pad 的孤兒走線。
  // 不自動刪（那是使用者的銅），但一定要報出來。
  function orphanTraces(traces, components) {
    const live = new Set();
    (components || []).forEach(c => (c.pads || []).forEach(pd => { if (pd.net) live.add(pd.net); }));
    return (traces || []).filter(t => t.net && !live.has(t.net));
  }

  // ---- back-annotation ----
  // 把 PCB 端的封裝決定寫回線路圖頁資料。純函式：吃 pages 陣列（sheets.js 的形狀）、
  // 直接改上面的元件物件，回報改了幾筆。呼叫端負責存回 localStorage。
  //
  // 為什麼要回寫而不是只存在 PCB：封裝是「這顆料是什麼」的一部分，屬於線路圖。
  // 只存 PCB 的話，換一台機器、清一次快取、或重新轉換，選擇就沒了。
  function annotateFootprint(pages, schId, footprint) {
    let changed = 0, found = 0;
    for (const pg of (pages || [])) {
      const comps = (pg && pg.data && pg.data.components) || [];
      for (const c of comps) {
        if (!c || c.id !== schId) continue;
        found++;
        if (c.footprint === footprint) continue;
        c.footprint = footprint;
        changed++;
      }
    }
    return { changed, found };
  }

  // 把 PCB 端改的 refdes 寫回線路圖。
  //
  // 為什麼一定要回寫：merge() 合併時寫的是 Object.assign({}, nc, { x, y, rot })
  // ——ref 以線路圖為準。只改 PCB 的話，下一次 ECO 同步就被蓋回去，
  // 使用者會看到「我明明改過，同步一次又變回來」。
  //
  // 撞名不改：兩顆 R1 會讓 BOM、網表、電測全部對不上，寧可回報讓使用者決定。
  function annotateRef(pages, schId, label) {
    const want = String(label == null ? "" : label).trim();
    if (!want) return { changed: 0, found: 0, conflict: null };
    let changed = 0, found = 0, conflict = null;
    for (const pg of (pages || [])) {
      const comps = (pg && pg.data && pg.data.components) || [];
      for (const c of comps) {
        if (!c || c.id === schId) continue;
        if (String(c.label || "") === want) { conflict = c.id; break; }
      }
      if (conflict) break;
    }
    if (conflict) return { changed: 0, found: 0, conflict };
    for (const pg of (pages || [])) {
      const comps = (pg && pg.data && pg.data.components) || [];
      for (const c of comps) {
        if (!c || c.id !== schId) continue;
        found++;
        if (String(c.label || "") === want) continue;
        c.label = want;
        changed++;
      }
    }
    return { changed, found, conflict: null };
  }

  /**
   * 把 PCB 端做的 pin swap 寫回線路圖元件的 `pinSwap`。
   *
   * 沒有這一步的話，交換只活在板子上：merge() 的 net 以線路圖為準，
   * 下一次 ECO 同步就把 pad 的 net 換回去，而且不會有任何訊息——
   * 使用者只會看到「我換過的腳自己跑回來了」。
   *
   * `pinSwap` 傳 null 代表清掉（換回原狀），欄位一併移除，不留空物件。
   */
  function annotateSwap(pages, schId, pinSwap) {
    let changed = 0, found = 0;
    for (const pg of (pages || [])) {
      const comps = (pg && pg.data && pg.data.components) || [];
      for (const c of comps) {
        if (!c || c.id !== schId) continue;
        found++;
        const before = JSON.stringify(c.pinSwap || null);
        if (pinSwap && Object.keys(pinSwap).length) c.pinSwap = pinSwap;
        else delete c.pinSwap;
        if (JSON.stringify(c.pinSwap || null) !== before) changed++;
      }
    }
    return { changed, found };
  }

  // 把 PCB 端改的 net 名寫回線路圖。
  // net 名字存在**導線的 net 欄位**上（模型見 net-label.test.js 的檔頭），
  // 不是綁在文字元件或某個座標上，所以改名就是掃過所有 wire 換字串。
  //
  // 新名字已經被別的 net 用掉時不改：那是「把兩條網路合併」，屬於電性變更，
  // 不可以當成改名靜靜做掉。
  function renameNet(pages, oldName, newName) {
    const from = String(oldName == null ? "" : oldName).trim();
    const to = String(newName == null ? "" : newName).trim();
    if (!from || !to || from === to) return { changed: 0, pages: 0, conflict: null };
    for (const pg of (pages || [])) {
      for (const w of ((pg && pg.data && pg.data.wires) || [])) {
        if (w && String(w.net || "") === to) return { changed: 0, pages: 0, conflict: to };
      }
    }
    let changed = 0, touched = 0;
    for (const pg of (pages || [])) {
      const wires = (pg && pg.data && pg.data.wires) || [];
      let any = 0;
      for (const w of wires) {
        if (!w || String(w.net || "") !== from) continue;
        w.net = to;
        changed++; any++;
      }
      if (any) touched++;
    }
    return { changed, pages: touched, conflict: null };
  }

  // PCB 元件 id → 線路圖元件 id。`sch-r1` → `r1`；多頁的 `sch-p2-r1` → `r1`。
  function schIdOf(pcbId) {
    const s = String(pcbId || "");
    if (s.indexOf("sch-") !== 0) return null;
    const rest = s.slice(4);
    const m = /^p(\d+)-(.+)$/.exec(rest);
    return m ? m[2] : rest;
  }

  const Sch2Pcb = { MAP, NON_PHYSICAL, IC_TYPES, mapFootprint, bindNets, convert, place, suggestBoard, merge, orphanTraces, annotateFootprint, annotateRef, annotateSwap, renameNet, schIdOf };
  if (typeof window !== 'undefined') window.Sch2Pcb = Sch2Pcb;
  if (typeof module !== 'undefined' && module.exports) module.exports = Sch2Pcb;
})();







