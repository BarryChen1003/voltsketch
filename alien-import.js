/**
 * alien-import.js — 其它 EDA 的設計檔匯入（Eagle / LTspice / Altium）
 *
 * 一支模組放三種格式的理由：它們的產物都是「線路圖元件 ＋ 接線」，
 * 進到同一個內部結構（跟 app.js 的 state.components / state.wires 同形），
 * 再走既有的 Sch2Pcb 轉板子。分三支會有三份一樣的型別對應表。
 *
 * 各格式的實話：
 *
 *   Eagle (.sch / .brd) — XML，解析得動。
 *     .sch：元件、接線、net 名稱都拿得到。library 裡的符號圖形不還原
 *           （我們用自己的符號畫），所以視覺會跟 Eagle 裡不一樣，接線關係一致。
 *     .brd：元件位置、走線、via 拿得到。封裝圖形同樣不還原，改用 PartsLib 對應。
 *
 *   LTspice (.asc) — 純文字，最好解析的一個。
 *     元件、接線、net 標籤、參數值都完整。SPICE 指令（.tran/.ac）另外收在 directives，
 *     之後給 SPICE 求解器用。
 *
 *   Altium (.PcbDoc / .SchDoc) — **二進位 OLE 複合檔，沒有公開規格**。
 *     這一版只做「認出來並說清楚」：讀 OLE 標頭確認確實是 Altium 檔，
 *     報出裡面有哪些 storage，然後告訴使用者請先用 Altium 匯出成 KiCad 或 Gerber。
 *     不做半套逆向——猜錯的元件位置比沒有匯入更糟。
 *
 * 純函式：不碰 DOM，node 可直接測。測試：alien-import.test.js
 */
(function (root) {
  'use strict';

  // ---- 共用：外部型別 → 本站線路圖型別 ----
  // 對不到的一律回 null，由呼叫端當成「不認得的元件」照實回報。
  // 硬塞一個 resistor 進去會產生看起來正常、電性完全錯誤的圖。
  // 順序有意義：長前綴一定要排在短前綴之前，否則 FB1（磁珠）會先被 F（保險絲）吃掉、
  // XTAL1 會先被 X（連接器）吃掉。單一字母的規則一律排最後。
  const EAGLE_DEVICE = [
    [/^FB\d/i, 'bead'], [/^SW\d/i, 'switch'], [/^XTAL/i, 'xtal'], [/^LED/i, 'led'],
    [/^CON/i, 'io'], [/^RV\d/i, 'varistor'], [/^TVS/i, 'tvs'],
    [/^R[\d-]/i, 'resistor'], [/^C[\d-]/i, 'capacitor'], [/^L[\d-]/i, 'inductor'],
    [/^D[\d-]/i, 'diode'], [/^Q[\d-]/i, 'npn'], [/^[UI]C?[\d-]/i, 'ic'],
    [/^[JP][\d-]/i, 'io'], [/^Y[\d-]/i, 'xtal'], [/^F[\d-]/i, 'fuse'],
  ];

  // LTspice 的符號名就是型別，對應很直接
  const LTSPICE_SYM = {
    res: 'resistor', res2: 'resistor', cap: 'capacitor', ind: 'inductor', ind2: 'inductor',
    diode: 'diode', led: 'led', zener: 'diode', schottky: 'diode',
    npn: 'npn', pnp: 'pnp', nmos: 'nmos', pmos: 'pmos', njf: 'nmos', pjf: 'pmos',
    voltage: 'source', current: 'source', battery: 'source',
    opamp: 'opamp', opamp2: 'opamp', sw: 'switch', csw: 'switch',
    ind3: 'inductor', polcap: 'capacitor', varistor: 'varistor',
  };

  function eagleType(deviceOrName) {
    const s = String(deviceOrName || '');
    for (const [re, t] of EAGLE_DEVICE) if (re.test(s)) return t;
    return null;
  }

  // ---- 極小 XML 讀取器 ----
  // Eagle 檔可以到幾 MB，DOMParser 在 node 沒有，正則式對巢狀結構又不可靠。
  // 這裡寫一個只做「開標籤/閉標籤/屬性」的掃描器：夠用、可預期、不會因為
  // 屬性裡出現 '>' 就整個解析錯位。
  function xmlNodes(text, tag) {
    const out = [];
    const src = String(text || '');
    const open = new RegExp('<' + tag + '(\\s[^>]*?)?(/)?>', 'g');
    let m;
    while ((m = open.exec(src))) {
      const attrs = parseAttrs(m[1] || '');
      if (m[2]) { out.push({ attrs, inner: '' }); continue; }
      // 找對應的閉標籤，要算巢狀層數
      const closeTag = '</' + tag + '>';
      const openTag = new RegExp('<' + tag + '(\\s[^>]*?)?>', 'g');
      let depth = 1, i = open.lastIndex;
      while (depth > 0 && i < src.length) {
        const nc = src.indexOf(closeTag, i);
        if (nc < 0) break;
        openTag.lastIndex = i;
        let no = -1;
        const om = openTag.exec(src);
        if (om && om.index < nc) no = om.index;
        if (no >= 0) { depth++; i = openTag.lastIndex; }
        else { depth--; i = nc + closeTag.length; }
      }
      out.push({ attrs, inner: src.slice(open.lastIndex, i - closeTag.length) });
      // 刻意「不」把 lastIndex 推到閉標籤之後：推了的話巢狀的同名子節點會被整段跳過。
      // 保持在開標籤之後，外層與內層各自被列出一次（Eagle 的 wire 就有這種用法）。
    }
    return out;
  }

  function parseAttrs(s) {
    const a = {};
    const re = /([\w:.\-]+)\s*=\s*"([^"]*)"/g;
    let m;
    while ((m = re.exec(s || ''))) a[m[1]] = m[2];
    return a;
  }

  // ---- Eagle .sch ----
  /**
   * @returns { components, wires, nets, warnings, report }
   *   components 與 app.js 的 state.components 同形（id/type/x/y/rotation/label/value）
   *   wires 與 state.wires 同形（[x1,y1,x2,y2] 四元組陣列）
   */
  function parseEagleSch(text, opts) {
    const o = opts || {};
    const scale = o.scale || 10;        // Eagle 用 mm/inch 混用，畫布用 px；10 是視覺上剛好的比例
    const warnings = [];
    const components = [];
    const wires = [];
    const nets = [];
    const unknown = [];

    const src = String(text || '');
    if (!/<eagle/i.test(src)) { warnings.push('not_eagle'); return { components, wires, nets, warnings, report: { unknown } }; }

    // 元件實例。Eagle 把「值」放 part、把「位置」放 instance，要用 part 名配對。
    const partType = new Map();
    for (const p of xmlNodes(src, 'part')) {
      const name = p.attrs.name || '';
      // 先看 refdes（R1/U1/C1）——那是設計者自己標的，最可靠。
      // 用 deviceset 首字母猜會出事：'LM358' 開頭是 L，會被當成電感。
      const t = eagleType(name) || eagleType(p.attrs.deviceset || p.attrs.device || '');
      partType.set(name, { type: t, value: p.attrs.value || '' });
      if (!t) unknown.push(name + '(' + (p.attrs.deviceset || '?') + ')');
    }

    let n = 0;
    for (const inst of xmlNodes(src, 'instance')) {
      const name = inst.attrs.part || '';
      const info = partType.get(name) || { type: null, value: '' };
      if (!info.type) continue;         // 認不得的不放進畫布，但已經記在 unknown
      const rot = /R(\d+)/.exec(inst.attrs.rot || '');
      components.push({
        id: 'eag-' + (++n),
        type: info.type,
        x: Math.round(parseFloat(inst.attrs.x || 0) * scale),
        y: Math.round(-parseFloat(inst.attrs.y || 0) * scale),   // Eagle 的 Y 向上
        rotation: rot ? +rot[1] : 0,
        label: name,
        value: info.value,
      });
    }

    // 接線。Eagle 的 net 底下是 segment，segment 底下才是 wire。
    for (const net of xmlNodes(src, 'net')) {
      const nm = net.attrs.name || '';
      let count = 0;
      for (const w of xmlNodes(net.inner, 'wire')) {
        wires.push([
          Math.round(parseFloat(w.attrs.x1 || 0) * scale), Math.round(-parseFloat(w.attrs.y1 || 0) * scale),
          Math.round(parseFloat(w.attrs.x2 || 0) * scale), Math.round(-parseFloat(w.attrs.y2 || 0) * scale),
        ]);
        count++;
      }
      if (nm) nets.push({ name: nm, segments: count });
    }

    if (unknown.length) warnings.push('unknown_devices:' + unknown.length);
    if (!components.length) warnings.push('no_components');
    return {
      components, wires, nets, warnings,
      report: { components: components.length, wires: wires.length, nets: nets.length, unknown },
    };
  }

  // ---- Eagle .brd ----
  /**
   * @returns { components, traces, vias, outline, warnings, report }
   *   結構與 PCB 編輯器的 state 同形（mm）。封裝圖形不還原——
   *   pads 留空，由使用者在 PCB 頁指定封裝（跟 Sch2Pcb 認不得封裝時同一條路）。
   */
  function parseEagleBrd(text) {
    const warnings = [];
    const components = [], traces = [], vias = [], outline = [];
    const unknown = [];
    const src = String(text || '');
    if (!/<eagle/i.test(src)) { warnings.push('not_eagle'); return { components, traces, vias, outline, warnings, report: { unknown } }; }

    let n = 0;
    for (const e of xmlNodes(src, 'element')) {
      const name = e.attrs.name || '';
      const rot = /R(\d+)/.exec(e.attrs.rot || '');
      const mirrored = /^M/.test(e.attrs.rot || '');
      const pkg = e.attrs.package || '';
      if (!eagleType(e.attrs.library || name)) unknown.push(name + '(' + pkg + ')');
      components.push({
        id: 'eag-' + (++n), ref: name,
        part: e.attrs.value || pkg,
        x: parseFloat(e.attrs.x || 0), y: -parseFloat(e.attrs.y || 0),
        rot: rot ? +rot[1] : 0,
        side: mirrored ? 'bottom' : 'top',
        w: 2, h: 2,                     // 沒有封裝就沒有真尺寸，給一個佔位值並記在 report
        pads: [],
      });
    }

    // Eagle 的層號：1=Top 16=Bottom 20=Dimension
    const LAYER = { 1: 'F.Cu', 16: 'B.Cu', 20: 'Edge.Cuts' };
    for (const w of xmlNodes(src, 'wire')) {
      const ly = LAYER[+w.attrs.layer];
      if (!ly) continue;
      const t = {
        x1: parseFloat(w.attrs.x1 || 0), y1: -parseFloat(w.attrs.y1 || 0),
        x2: parseFloat(w.attrs.x2 || 0), y2: -parseFloat(w.attrs.y2 || 0),
        width: parseFloat(w.attrs.width || 0.3) || 0.3,
        layer: ly, net: '',
      };
      if (ly === 'Edge.Cuts') outline.push(t); else traces.push(t);
    }

    for (const v of xmlNodes(src, 'via')) {
      const d = parseFloat(v.attrs.drill || 0.3) || 0.3;
      vias.push({
        x: parseFloat(v.attrs.x || 0), y: -parseFloat(v.attrs.y || 0),
        d: parseFloat(v.attrs.diameter || 0) || d + 0.3, drill: d, net: '',
      });
    }

    // net 名要從 signal 帶到走線上。Eagle 的 signal 底下才是 wire/via，
    // 上面那一輪是全檔掃描（含 signal 外的板框），所以這裡再走一次補 net。
    for (const sig of xmlNodes(src, 'signal')) {
      const nm = sig.attrs.name || '';
      if (!nm) continue;
      for (const w of xmlNodes(sig.inner, 'wire')) {
        const ly = LAYER[+w.attrs.layer];
        if (!ly || ly === 'Edge.Cuts') continue;
        const x1 = parseFloat(w.attrs.x1 || 0), y1 = -parseFloat(w.attrs.y1 || 0);
        const hit = traces.find(t => t.x1 === x1 && t.y1 === y1 && !t.net);
        if (hit) hit.net = nm;
      }
    }

    if (unknown.length) warnings.push('unknown_packages:' + unknown.length);
    warnings.push('footprints_not_imported');   // 一定要講：pads 是空的
    return {
      components, traces, vias, outline, warnings,
      report: {
        components: components.length, traces: traces.length, vias: vias.length,
        outline: outline.length, unknown,
        lossy: ['no_footprints', 'placeholder_sizes'],
      },
    };
  }

  // ---- LTspice .asc ----
  /**
   * @returns { components, wires, nets, directives, warnings, report }
   * LTspice 的座標單位是「schematic unit」，向下為正，跟這個編輯器一致，不必翻 Y。
   */
  function parseLtspice(text, opts) {
    const o = opts || {};
    const scale = o.scale || 1;
    const warnings = [];
    const components = [], wires = [], nets = [], directives = [];
    const unknown = [];
    const lines = String(text || '').split(/\r?\n/);

    if (!lines.some(l => /^Version\s+\d/.test(l.trim()))) warnings.push('not_ltspice');

    let cur = null, n = 0;
    const flush = () => { if (cur) { components.push(cur); cur = null; } };

    for (const raw of lines) {
      const line = raw.trim();
      if (!line) continue;
      const parts = line.split(/\s+/);

      if (parts[0] === 'WIRE') {
        wires.push([+parts[1] * scale, +parts[2] * scale, +parts[3] * scale, +parts[4] * scale]);
        continue;
      }
      if (parts[0] === 'FLAG') {
        // FLAG x y name —— name 是 net 標籤（0 代表接地）
        const nm = parts[3];
        if (nm === '0') {
          components.push({ id: 'lt-' + (++n), type: 'ground', x: +parts[1] * scale, y: +parts[2] * scale, rotation: 0, label: '' });
        } else if (nm) {
          nets.push({ name: nm, x: +parts[1] * scale, y: +parts[2] * scale });
        }
        continue;
      }
      if (parts[0] === 'SYMBOL') {
        flush();
        const sym = String(parts[1] || '').split(/[\\/]/).pop().toLowerCase();
        const type = LTSPICE_SYM[sym] || null;
        if (!type) { unknown.push(sym); cur = null; continue; }
        const rot = /R(\d+)/.exec(parts[4] || '');
        cur = {
          id: 'lt-' + (++n), type,
          x: +parts[2] * scale, y: +parts[3] * scale,
          rotation: rot ? +rot[1] : 0, label: '', value: '',
        };
        continue;
      }
      if (parts[0] === 'SYMATTR' && cur) {
        const k = parts[1], v = parts.slice(2).join(' ');
        if (k === 'InstName') cur.label = v;
        else if (k === 'Value') cur.value = v;
        continue;
      }
      if (parts[0] === 'TEXT') {
        // TEXT x y Left 2 !.tran 10m  —— '!' 開頭是 SPICE 指令，';' 是註解
        const bang = line.indexOf('!');
        if (bang >= 0) directives.push(line.slice(bang + 1).trim());
        continue;
      }
    }
    flush();

    if (unknown.length) warnings.push('unknown_symbols:' + [...new Set(unknown)].join(','));
    if (!components.length) warnings.push('no_components');
    return {
      components, wires, nets, directives, warnings,
      report: { components: components.length, wires: wires.length, nets: nets.length, directives: directives.length, unknown: [...new Set(unknown)] },
    };
  }

  // ---- Altium ----
  // OLE2 複合檔的標頭簽章。認得出來就能給明確指引，而不是丟一句「解析失敗」。
  const OLE_SIG = [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1];

  /**
   * 只做辨識，不做解析。回 { ok:false, kind, advice, storages }。
   * 為什麼不做半套逆向：.PcbDoc 沒有公開規格，欄位靠猜。猜錯的元件位置
   * 會產生一片「看起來像板子、每一顆都在錯的地方」的東西——那比匯入失敗更糟，
   * 因為使用者會拿它去改，改到一半才發現全錯。
   */
  function inspectAltium(bytes, name) {
    const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
    const isOle = b.length >= 8 && OLE_SIG.every((v, i) => b[i] === v);
    const nm = String(name || '');
    const kind = /\.pcbdoc$/i.test(nm) ? 'PcbDoc' : /\.schdoc$/i.test(nm) ? 'SchDoc'
      : /\.pcblib$/i.test(nm) ? 'PcbLib' : /\.schlib$/i.test(nm) ? 'SchLib' : '';

    // OLE 目錄裡的 storage 名稱是 UTF-16LE，掃得出來就列給使用者看，
    // 至少證明「我確實讀到了這個檔，只是不解析它」。
    const storages = [];
    if (isOle) {
      const known = ['Board6', 'Components6', 'Tracks6', 'Pads6', 'Vias6', 'Arcs6', 'Nets6', 'FileHeader'];
      for (const k of known) {
        const utf16 = [];
        for (const ch of k) { utf16.push(ch.charCodeAt(0), 0); }
        for (let i = 0; i + utf16.length <= b.length; i++) {
          let hit = true;
          for (let j = 0; j < utf16.length; j++) if (b[i + j] !== utf16[j]) { hit = false; break; }
          if (hit) { storages.push(k); break; }
        }
      }
    }

    return {
      ok: false,
      isOle, kind, storages,
      reason: isOle ? 'altium_binary_unsupported' : 'not_altium',
      advice: isOle ? 'export_kicad_or_gerber' : 'wrong_file',
    };
  }

  const AlienImport = {
    parseEagleSch, parseEagleBrd, parseLtspice, inspectAltium,
    eagleType, LTSPICE_SYM, EAGLE_DEVICE,
    _xmlNodes: xmlNodes, _parseAttrs: parseAttrs,
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = AlienImport;
  root.AlienImport = AlienImport;
})(typeof window !== 'undefined' ? window : globalThis);
