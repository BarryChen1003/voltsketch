/**
 * gerber-import.js — Gerber RS-274X ＋ Excellon 匯入
 *
 * 定位（先講清楚，免得被當成「還原成可編輯的板子」）：
 *   Gerber 是**製造用的影像格式**。它沒有 net、沒有元件、沒有封裝——
 *   一顆 0603 電阻在 Gerber 裡就是兩個矩形，跟旁邊的測試點長得一模一樣。
 *   所以匯入的正確用途是「看別人的板子、量距離、疊圖比對」。
 *   toBoard() 提供有損轉換（線段→走線、閃光→pad、鑽孔→via），但 net 一律空白，
 *   元件不會回來。要當成可編輯的設計檔，只有 KiCad 那條路（kicad-io.js）。
 *
 * 支援：
 *   %FS[LT][AI]Xnm Ynm*%  座標格式（前導/後導零省略、絕對/增量）
 *   %MOMM*% / %MOIN*%     單位
 *   %ADDnn C|R|O|P,…*%    圓/矩形/長圓/多邊形光圈
 *   %LPD*% / %LPC*%       正/負極性（負極性區域＝挖空）
 *   G01/G02/G03 + G74/G75 直線與單/多象限圓弧
 *   D01/D02/D03           畫線 / 移動 / 閃光
 *   G36/G37               區域填充
 *   %TF.FileFunction,…*%  層別屬性（用來自動判斷這個檔是哪一層）
 *   Excellon：M48 標頭、METRIC/INCH、TZ/LZ、Tn C 定義、G90/G05、G85 長槽
 *
 * 不支援（會回報在 warnings，不會靜靜吃掉）：
 *   %AM*% 光圈巨集（自訂形狀）、階梯重複 %SR*%、增量座標 G91。
 *   碰到這些會照實說「這個檔有 N 個巨集光圈沒有展開」，不假裝畫得出來。
 *
 * 純函式：不碰 DOM，node 可直接測。測試：gerber-import.test.js
 */
(function (root) {
  'use strict';

  const MM_PER_INCH = 25.4;

  // ---- 座標格式 ----
  // %FSLAX46Y46*% → 前導零省略、絕對座標、X 整數 4 位小數 6 位
  function parseFS(s) {
    const m = /^FS([LT])?([AI])?X(\d)(\d)Y(\d)(\d)$/.exec(s);
    if (!m) return null;
    return {
      zero: m[1] || 'L', mode: m[2] || 'A',
      xi: +m[3], xd: +m[4], yi: +m[5], yd: +m[6],
    };
  }

  // Gerber 的座標是整數，小數點位置由 FS 決定。
  // 前導零省略（L）＝數值靠右對齊，直接除。後導零省略（T）＝靠左對齊，要先補零。
  function coord(raw, intDigits, decDigits, zero) {
    if (raw == null || raw === '') return null;
    let s = String(raw), neg = false;
    if (s[0] === '+') s = s.slice(1);
    if (s[0] === '-') { neg = true; s = s.slice(1); }
    if (zero === 'T') s = s.padEnd(intDigits + decDigits, '0');
    const v = parseInt(s, 10) / Math.pow(10, decDigits);
    return neg ? -v : v;
  }

  // ---- 光圈 ----
  // C=圓 R=矩形 O=長圓 P=正多邊形；逗號後是尺寸，×分隔，最後一個可能是鑽孔徑
  function parseAD(body) {
    const m = /^ADD(\d+)([A-Za-z_$][A-Za-z0-9_$.\-]*)?,?(.*)$/.exec(body);
    if (!m) return null;
    const code = 'D' + m[1];
    const type = m[2] || '';
    const params = (m[3] || '').split('X').map(x => parseFloat(x)).filter(x => !isNaN(x));
    return { code, type, params };
  }

  // k 是單位換算係數（英吋檔要 ×25.4）。忘了乘的話，英吋檔的線寬會小 25.4 倍，
  // 畫面看起來還「有東西」，只是全部細得像頭髮——那種錯最難發現。
  function apertureSize(ap, k) {
    const s = k || 1;
    if (!ap) return { w: 0, h: 0, shape: 'circle' };
    const p = (ap.params || []).map(v => v * s);
    switch (ap.type) {
      case 'C': return { w: p[0] || 0, h: p[0] || 0, shape: 'circle' };
      case 'R': return { w: p[0] || 0, h: p[1] || p[0] || 0, shape: 'rect' };
      case 'O': return { w: p[0] || 0, h: p[1] || p[0] || 0, shape: 'oval' };
      case 'P': return { w: p[0] || 0, h: p[0] || 0, shape: 'poly' };
      default: return { w: p[0] || 0, h: p[1] || p[0] || 0, shape: 'macro' };
    }
  }

  // %TF.FileFunction,Copper,L1,Top*% → 'F.Cu'
  function layerFromFunction(fn) {
    const p = String(fn || '').split(',').map(s => s.trim());
    const kind = (p[0] || '').toLowerCase();
    const last = (p[p.length - 1] || '').toLowerCase();
    const side = last === 'top' ? 'F' : last === 'bot' || last === 'bottom' ? 'B' : '';
    if (kind === 'copper') {
      if (side) return side + '.Cu';
      const li = p.find(x => /^L\d+$/i.test(x));
      return li ? 'In' + li.slice(1) + '.Cu' : 'F.Cu';
    }
    if (kind === 'soldermask') return (side || 'F') + '.Mask';
    if (kind === 'paste' || kind === 'solderpaste') return (side || 'F') + '.Paste';
    if (kind === 'legend' || kind === 'silkscreen') return (side || 'F') + '.SilkS';
    if (kind === 'profile') return 'Edge.Cuts';
    return '';
  }

  // 檔名猜層別。沒有 %TF 屬性的舊檔（很多板廠工具不寫）只能靠這個。
  const NAME_RULES = [
    [/(^|[-_.])f[-_.]?cu|top[-_.]?copper|\.gtl$|copper_top/i, 'F.Cu'],
    [/(^|[-_.])b[-_.]?cu|bot(tom)?[-_.]?copper|\.gbl$|copper_bottom/i, 'B.Cu'],
    [/in(\d+)[-_.]?cu|\.g(\d)$/i, 'In.Cu'],
    [/f[-_.]?mask|\.gts$/i, 'F.Mask'],
    [/b[-_.]?mask|\.gbs$/i, 'B.Mask'],
    [/f[-_.]?paste|\.gtp$/i, 'F.Paste'],
    [/b[-_.]?paste|\.gbp$/i, 'B.Paste'],
    [/f[-_.]?silk|\.gto$/i, 'F.SilkS'],
    [/b[-_.]?silk|\.gbo$/i, 'B.SilkS'],
    [/edge|outline|profile|\.gko$|\.gm1$/i, 'Edge.Cuts'],
  ];
  function layerFromName(name) {
    for (const [re, id] of NAME_RULES) if (re.test(String(name || ''))) return id;
    return '';
  }

  /**
   * 解析一個 Gerber 檔。
   * @returns { format, unit, apertures, primitives, layer, warnings, stats }
   *   primitives：{ kind:'line', x1,y1,x2,y2, w, ap }
   *               { kind:'arc',  x1,y1,x2,y2, cx,cy, ccw, w, ap }
   *               { kind:'flash', x,y, w,h, shape, ap }
   *               { kind:'region', pts:[[x,y]…], polarity:'D'|'C' }
   *   座標一律轉成 mm。
   */
  function parseGerber(text, opts) {
    const o = opts || {};
    const warnings = [];
    const apertures = {};
    const primitives = [];
    let fs = null, unit = null, layer = '';
    let ap = null, apSize = { w: 0, h: 0, shape: 'circle' };
    let interp = 'G01', quad = 'G75', polarity = 'D';
    let cx = 0, cy = 0;                  // 當前點（mm）
    let region = null;                   // G36 進行中的多邊形
    let macros = 0, srBlocks = 0, incremental = false;

    const src = String(text || '');
    // 指令以 * 結尾；%…% 是擴充指令，裡面可能含多個 *
    const tokens = [];
    {
      let i = 0;
      while (i < src.length) {
        const ch = src[i];
        if (ch === '%') {
          const end = src.indexOf('%', i + 1);
          if (end < 0) { warnings.push('extended_unterminated'); break; }
          src.slice(i + 1, end).split('*').map(s => s.trim()).filter(Boolean)
            .forEach(s => tokens.push({ ext: true, s }));
          i = end + 1;
        } else if (/\s/.test(ch)) { i++; }
        else {
          const end = src.indexOf('*', i);
          if (end < 0) { const t = src.slice(i).trim(); if (t) tokens.push({ ext: false, s: t }); break; }
          const t = src.slice(i, end).trim();
          if (t) tokens.push({ ext: false, s: t });
          i = end + 1;
        }
      }
    }

    const toMM = v => (v == null ? null : (unit === 'IN' ? v * MM_PER_INCH : v));

    for (const tk of tokens) {
      const s = tk.s;
      if (tk.ext) {
        if (/^FS/.test(s)) {
          fs = parseFS(s);
          if (!fs) warnings.push('bad_fs:' + s);
          else if (fs.mode === 'I') { incremental = true; warnings.push('incremental_coords'); }
          continue;
        }
        if (/^MO(MM|IN)$/.test(s)) { unit = s.slice(2); continue; }
        if (/^ADD/.test(s)) {
          const a = parseAD(s);
          if (a) {
            apertures[a.code] = a;
            if (a.type && !'CROP'.includes(a.type)) macros++;
          } else warnings.push('bad_ad:' + s);
          continue;
        }
        if (/^AM/.test(s)) { macros++; continue; }
        if (/^LP([DC])$/.test(s)) { polarity = s[2]; continue; }
        if (/^SR/.test(s)) { if (s !== 'SRX1Y1I0J0') srBlocks++; continue; }
        if (/^TF\.FileFunction,/.test(s)) { layer = layerFromFunction(s.slice('TF.FileFunction,'.length)) || layer; continue; }
        continue;                       // 其它屬性（TA/TO/TD）對幾何無影響
      }

      // 一般指令：可能是 G 碼、D 碼、座標，或三者混在同一行
      if (/^M0?[02]$/.test(s)) break;   // M02 檔案結束

      const gm = /^G(\d+)/.exec(s);
      if (gm && !/[XYIJ]/.test(s)) {
        const g = +gm[1];
        if (g === 1 || g === 2 || g === 3) interp = 'G0' + g;
        else if (g === 36) { region = []; }
        else if (g === 37) {
          if (region && region.length >= 3) primitives.push({ kind: 'region', pts: region, polarity });
          region = null;
        }
        else if (g === 74 || g === 75) quad = 'G' + g;
        else if (g === 4) { /* 註解 */ }
        continue;
      }

      const dsel = /^(?:G\d+)?D0*(\d+)$/.exec(s);
      if (dsel && +dsel[1] >= 10) {      // 選光圈
        ap = 'D' + dsel[1];
        apSize = apertureSize(apertures[ap], unit === 'IN' ? MM_PER_INCH : 1);
        continue;
      }

      // 座標 + 動作
      const hasCoord = /[XYIJ]-?\d/.test(s);
      if (!hasCoord) continue;
      if (!fs) { warnings.push('coord_before_fs'); continue; }

      const gpre = /^G0?([123])/.exec(s);
      if (gpre) interp = 'G0' + gpre[1];

      const gx = /X(-?\d+)/.exec(s), gy = /Y(-?\d+)/.exec(s);
      const gi = /I(-?\d+)/.exec(s), gj = /J(-?\d+)/.exec(s);
      const nx = gx ? toMM(coord(gx[1], fs.xi, fs.xd, fs.zero)) : null;
      const ny = gy ? toMM(coord(gy[1], fs.yi, fs.yd, fs.zero)) : null;
      const ni = gi ? toMM(coord(gi[1], fs.xi, fs.xd, fs.zero)) : null;
      const nj = gj ? toMM(coord(gj[1], fs.yi, fs.yd, fs.zero)) : null;

      const dm = /D0*([123])$/.exec(s);
      const op = dm ? +dm[1] : null;
      const tx = nx == null ? cx : (incremental ? cx + nx : nx);
      const ty = ny == null ? cy : (incremental ? cy + ny : ny);

      if (op === 2) { cx = tx; cy = ty; if (region) region.push([cx, cy]); continue; }

      if (op === 1) {
        if (region) { region.push([tx, ty]); cx = tx; cy = ty; continue; }
        if (interp === 'G01') {
          primitives.push({ kind: 'line', x1: cx, y1: cy, x2: tx, y2: ty, w: apSize.w, ap });
        } else {
          // I/J 是圓心相對於起點的偏移。G74 單象限時 I/J 無正負號，
          // 要試四種組合挑出半徑一致的那個——所以這裡優先支援 G75（現代檔案都是 G75）。
          const ccw = interp === 'G03';
          let ox = ni || 0, oy = nj || 0;
          if (quad === 'G74') {
            const r0 = Math.hypot(ox, oy);
            let best = null;
            for (const sx of [1, -1]) for (const sy of [1, -1]) {
              const c0x = cx + sx * Math.abs(ox), c0y = cy + sy * Math.abs(oy);
              const err = Math.abs(Math.hypot(tx - c0x, ty - c0y) - r0);
              if (!best || err < best.err) best = { err, ox: sx * Math.abs(ox), oy: sy * Math.abs(oy) };
            }
            ox = best.ox; oy = best.oy;
          }
          primitives.push({ kind: 'arc', x1: cx, y1: cy, x2: tx, y2: ty, cx: cx + ox, cy: cy + oy, ccw, w: apSize.w, ap });
        }
        cx = tx; cy = ty;
        continue;
      }

      if (op === 3) {
        primitives.push({ kind: 'flash', x: tx, y: ty, w: apSize.w, h: apSize.h, shape: apSize.shape, ap });
        cx = tx; cy = ty;
        continue;
      }

      // 沒有 D 碼的純座標＝沿用上一個動作（多數檔案不會這樣寫，但規格允許）
      cx = tx; cy = ty;
      if (region) region.push([cx, cy]);
    }

    if (region) { warnings.push('unclosed_region'); }
    if (!unit) warnings.push('no_unit');
    if (macros) warnings.push('aperture_macros:' + macros);
    if (srBlocks) warnings.push('step_repeat:' + srBlocks);
    if (!layer && o.name) layer = layerFromName(o.name);

    const stats = {
      lines: primitives.filter(p => p.kind === 'line').length,
      arcs: primitives.filter(p => p.kind === 'arc').length,
      flashes: primitives.filter(p => p.kind === 'flash').length,
      regions: primitives.filter(p => p.kind === 'region').length,
      apertures: Object.keys(apertures).length,
    };
    return { format: fs, unit: unit || 'MM', layer, apertures, primitives, warnings, stats };
  }

  // Excellon 的格式宣告有兩種寫法，長得很不一樣但意思相同：
  //   METRIC,TZ,000.000  →  3 位整數 3 位小數（用字串長度）
  //   METRIC,TZ,3.3      →  3 位整數 3 位小數（用數值）
  // 只用 /\d\.\d/ 抓的話，'000.000' 會抓到 '0.0' 而得出「小數 0 位」——
  // 座標會整整差 1000 倍，而且畫面上只是「圖變得很小」，不會報錯。
  function parseFmtDecl(text) {
    const m = /(\d+)\.(\d+)/.exec(String(text || ''));
    if (!m) return null;
    const side = t => (t.length > 1 ? t.length : +t);
    return { int: side(m[1]), dec: side(m[2]) };
  }

  /**
   * 解析 Excellon 鑽孔檔。
   * @returns { unit, tools, holes:[{x,y,d,tool,slot}], warnings, stats }
   */
  function parseExcellon(text, opts) {
    const warnings = [];
    const tools = {};
    const holes = [];
    let unit = null, zero = 'T', inHeader = false, tool = null;
    let fmtDec = null;                  // INCH 常見 2.4，METRIC 常見 3.3
    let lastX = 0, lastY = 0, plated = (opts && opts.plated) !== false;

    const raw = String(text || '');

    // 先掃一遍決定座標是「十進位」還是「格式化整數」。這一步不能省：
    //   X20      → 十進位就是 20mm，格式化整數 3.3 下卻是 0.02mm（差 1000 倍）
    // 判準（保守，只在證據明確時才選十進位）：
    //   1. 檔案裡出現過小數點 → 十進位。
    //   2. 全部沒有小數點，但座標位數 < 整數位+小數位（格式化整數一定補滿）→ 十進位。
    // 兩者皆不成立就按宣告的格式解析。
    const declared = parseFmtDecl(raw);      // { int, dec } 或 null
    let decimalMode = false;
    {
      const body = raw.split(/\r?\n/).filter(l => /^[XY]-?[\d.]/.test(l.trim()));
      const hasDot = body.some(l => /\./.test(l));
      const isIn = /INCH/.test(raw);
      const need = declared ? declared.int + declared.dec : (isIn ? 6 : 6);
      const maxDigits = body.reduce((m, l) => {
        const g = l.match(/[XY]-?\d+(?![\d.])/g) || [];
        return g.reduce((mm, t) => Math.max(mm, t.replace(/[XY-]/g, '').length), m);
      }, 0);
      decimalMode = hasDot || (maxDigits > 0 && maxDigits < need);
    }

    for (const rawLine of raw.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line[0] === ';') continue;

      if (line === 'M48') { inHeader = true; continue; }
      if (line === '%' || line === 'M95') { inHeader = false; continue; }
      if (line === 'M30' || line === 'M00') break;

      if (/^(METRIC|INCH)/.test(line)) {
        unit = line.startsWith('METRIC') ? 'MM' : 'IN';
        if (/LZ/.test(line)) zero = 'L';
        if (/TZ/.test(line)) zero = 'T';
        const fm = parseFmtDecl(line);
        if (fm) fmtDec = fm.dec;
        continue;
      }
      if (/^FMAT/.test(line) || /^G90$/.test(line) || /^G05$/.test(line) || /^G0?1$/.test(line)) continue;
      if (/^ICI,?ON/i.test(line)) { warnings.push('incremental_coords'); continue; }

      // 工具定義：T1C0.3（可能帶 F/S 參數）
      const td = /^T(\d+)(?:[FS][\d.]+)*C([\d.]+)/.exec(line);
      if (td) { tools['T' + (+td[1])] = { d: parseFloat(td[2]) }; continue; }

      // 選工具
      const ts = /^T(\d+)$/.exec(line);
      if (ts) { tool = +ts[1] === 0 ? null : 'T' + (+ts[1]); continue; }

      if (inHeader) continue;

      // 座標。Excellon 最麻煩的地方：同一個 `X20` 可能是 20mm（十進位），
      // 也可能是格式化整數 3.3 下的 0.02mm——差 1000 倍，而且兩種寫法都很常見。
      // 靠單行猜一定會錯，所以在迴圈外先掃過全檔決定 decimalMode（見上方 scan）。
      const cm = /X(-?[\d.]+)?Y(-?[\d.]+)?/.exec(line);
      if (!cm || (!cm[1] && !cm[2])) continue;
      const dec = fmtDec != null ? fmtDec : (unit === 'IN' ? 4 : 3);
      const num = raw => {
        if (raw == null) return null;
        if (/\./.test(raw) || decimalMode) return parseFloat(raw);
        return coord(raw, unit === 'IN' ? 2 : 3, dec, zero);
      };
      let x = num(cm[1]), y = num(cm[2]);
      x = x == null ? lastX : x; y = y == null ? lastY : y;
      const mm = v => (unit === 'IN' ? v * MM_PER_INCH : v);

      // G85 長槽：X..Y..G85X..Y..
      const slot = /G85X(-?[\d.]+)Y(-?[\d.]+)/.exec(line);
      const d = tools[tool] ? tools[tool].d : 0;
      const dmm = unit === 'IN' ? d * MM_PER_INCH : d;
      if (slot) {
        holes.push({ x: mm(x), y: mm(y), x2: mm(num(slot[1])), y2: mm(num(slot[2])), d: dmm, tool, slot: true, plated });
      } else {
        holes.push({ x: mm(x), y: mm(y), d: dmm, tool, slot: false, plated });
      }
      lastX = x; lastY = y;
    }

    if (!unit) warnings.push('no_unit');
    if (!Object.keys(tools).length && holes.length) warnings.push('no_tool_defs');
    return {
      unit: unit || 'MM', tools, holes, warnings,
      stats: { holes: holes.length, slots: holes.filter(h => h.slot).length, tools: Object.keys(tools).length },
    };
  }

  // 弧取樣成線段。下游的 DRC、鋪銅、匯出全部吃線段（跟 Mfg.Mitre 同一個理由）。
  function arcPoints(a, seg) {
    const r = Math.hypot(a.x1 - a.cx, a.y1 - a.cy);
    let a0 = Math.atan2(a.y1 - a.cy, a.x1 - a.cx);
    let a1 = Math.atan2(a.y2 - a.cy, a.x2 - a.cx);
    if (a.ccw && a1 <= a0) a1 += 2 * Math.PI;
    if (!a.ccw && a1 >= a0) a1 -= 2 * Math.PI;
    const n = Math.max(2, seg || Math.max(3, Math.ceil(Math.abs(a1 - a0) / 0.25)));
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = a0 + (a1 - a0) * (i / n);
      pts.push([a.cx + r * Math.cos(t), a.cy + r * Math.sin(t)]);
    }
    return pts;
  }

  /**
   * 有損轉成板子物件。
   * @param layers [{ name, text }] Gerber 檔；drills [{ name, text, plated }] Excellon 檔
   * @returns { traces, vias, pads, outline, warnings, report }
   *
   * 誠實界定（同樣寫進 report，UI 要顯示給使用者看）：
   *   net 一律空白——Gerber 沒有網路資訊，猜出來的網路會讓 DRC 與鋪銅給出錯誤結論。
   *   元件不會回來——閃光只知道位置與形狀，不知道它屬於哪一顆料。
   *   Y 軸翻轉：Gerber 的 Y 向上，這個編輯器的 Y 向下。
   */
  function toBoard(layers, drills, opts) {
    const o = opts || {};
    const traces = [], pads = [], vias = [], outline = [];
    const warnings = [];
    const perLayer = [];

    for (const f of (layers || [])) {
      const g = parseGerber(f.text, { name: f.name });
      const id = g.layer || layerFromName(f.name) || 'F.Cu';
      g.warnings.forEach(w => warnings.push(f.name + ': ' + w));
      perLayer.push({ name: f.name, layer: id, stats: g.stats });
      const isCu = /\.Cu$/.test(id);
      const isEdge = id === 'Edge.Cuts';

      for (const p of g.primitives) {
        if (p.kind === 'line') {
          const t = { x1: p.x1, y1: -p.y1, x2: p.x2, y2: -p.y2, width: p.w || 0.3, layer: id, net: '' };
          if (isEdge) outline.push(t); else if (isCu) traces.push(t);
        } else if (p.kind === 'arc') {
          const pts = arcPoints(p, o.arcSegments);
          for (let i = 1; i < pts.length; i++) {
            const t = {
              x1: pts[i - 1][0], y1: -pts[i - 1][1], x2: pts[i][0], y2: -pts[i][1],
              width: p.w || 0.3, layer: id, net: '', fromArc: true,
            };
            if (isEdge) outline.push(t); else if (isCu) traces.push(t);
          }
        } else if (p.kind === 'flash' && isCu) {
          pads.push({ x: p.x, y: -p.y, w: p.w, h: p.h, shape: p.shape === 'poly' ? 'circle' : p.shape, layer: id, net: '' });
        }
        // region：鋪銅區域。轉成 pour 需要跟現有 zone 模型對齊，這一版先不轉，
        // 只在 report 裡告訴使用者「這一層有 N 個填充區沒有匯入」。
      }
    }

    for (const f of (drills || [])) {
      const d = parseExcellon(f.text, { plated: f.plated !== false });
      d.warnings.forEach(w => warnings.push(f.name + ': ' + w));
      for (const h of d.holes) {
        if (h.slot) { warnings.push(f.name + ': slot_not_imported'); continue; }
        vias.push({ x: h.x, y: -h.y, d: h.d, drill: h.d, net: '', plated: h.plated });
      }
    }

    const regions = perLayer.reduce((n, l) => n + (l.stats.regions || 0), 0);
    const report = {
      layers: perLayer,
      traces: traces.length, pads: pads.length, vias: vias.length, outline: outline.length,
      regionsSkipped: regions,
      lossy: ['no_nets', 'no_components', regions ? 'regions_skipped' : null].filter(Boolean),
    };
    return { traces, pads, vias, outline, warnings, report };
  }

  const GerberImport = {
    parseGerber, parseExcellon, toBoard,
    layerFromFunction, layerFromName, arcPoints,
    _parseFS: parseFS, _coord: coord, _parseAD: parseAD, _apertureSize: apertureSize,
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = GerberImport;
  root.GerberImport = GerberImport;
})(typeof window !== 'undefined' ? window : globalThis);
