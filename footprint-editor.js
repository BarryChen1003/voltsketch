/**
 * footprint-editor.js — 自製封裝
 *
 * 為什麼要有：使用者遇到庫裡沒有的封裝時，目前沒有任何路可走。
 * footprint-gen.js 是「從 IC 資料推封裝」（只吃得到 IC_DATA 裡有的），
 * parts-lib.js 是固定目錄。兩者都不能讓人自己畫一顆新的。
 *
 * 這支處理的是「使用者自己的庫」，跟明確不做的 LCSC 料件生態系無關——
 * 那是別人的商業資料，這是自己的工具。
 *
 * 內部格式（跟 PCB 元件的 pads 同形，套用時直接展開）：
 *   { name, kind, pads:[{ num, x, y, w, h, shape, rot, drill, side }], courtyard:{w,h}, silk:[…] }
 *   座標以封裝原點為中心，單位 mm。
 *
 * 參數化產生器涵蓋四種排列，因為 90% 的封裝都是這四種之一：
 *   dual  兩排（SOIC / SOP / DIP / TSSOP）
 *   quad  四排（QFP / QFN）
 *   grid  網格（BGA / LGA）
 *   chip  兩顆對稱 pad（0402 / 0603 / 1206 這類被動件）
 *
 * check() 是這支最重要的部分：自製封裝最常見的錯不是畫不出來，
 * 而是畫出來看起來對、pad 間距差 0.05mm、送去打板才發現焊不上。
 *
 * 純函式：不碰 DOM，node 可直接測。測試：footprint-editor.test.js
 */
(function (root) {
  'use strict';

  const round = (v, n) => Math.round(v * Math.pow(10, n || 4)) / Math.pow(10, n || 4);

  function blank(name) {
    return { name: String(name || 'NEW-FP'), kind: 'custom', pads: [], courtyard: null, silk: [] };
  }

  // ---- 參數化產生 ----

  // 兩排（SOIC / DIP / TSSOP）。編號依 IPC 慣例：左上逆時針。
  function dual(p) {
    const n = Math.max(2, Math.round(p.pins || 8));
    if (n % 2) throw new Error('dual_pins_must_be_even');
    const half = n / 2;
    const pitch = p.pitch || 1.27;
    const span = p.span != null ? p.span : 5.4;      // 兩排 pad 中心的距離
    const pw = p.padW != null ? p.padW : 1.5;
    const ph = p.padH != null ? p.padH : 0.6;
    const tht = !!p.tht;
    const pads = [];
    const y0 = -((half - 1) * pitch) / 2;
    for (let i = 0; i < half; i++) {                 // 左排，由上往下 1..half
      pads.push(mkPad(i + 1, -span / 2, y0 + i * pitch, pw, ph, tht, p));
    }
    for (let i = 0; i < half; i++) {                 // 右排，由下往上 half+1..n
      pads.push(mkPad(half + i + 1, span / 2, y0 + (half - 1 - i) * pitch, pw, ph, tht, p));
    }
    return finish({ name: p.name || ('DUAL-' + n), kind: 'dual', pads }, p);
  }

  // 四排（QFP / QFN）。從左下角起逆時針，這是 JEDEC 的方向。
  function quad(p) {
    const n = Math.max(4, Math.round(p.pins || 32));
    if (n % 4) throw new Error('quad_pins_must_be_multiple_of_4');
    const per = n / 4;
    const pitch = p.pitch || 0.5;
    const span = p.span != null ? p.span : 7;
    const pw = p.padW != null ? p.padW : 1.2;
    const ph = p.padH != null ? p.padH : 0.3;
    const pads = [];
    const off = -((per - 1) * pitch) / 2;
    let k = 1;
    // 上下兩排傳的 w/h 跟左右排一樣，方向交給 rot=90 表示。
    // 「w/h 對調」和「rot=90」只能擇一——兩個都做等於轉了兩次，
    // padHalf 會算出長邊沿著排列方向，整排 pad 互相重疊（第一版就是這樣錯的）。
    for (let i = 0; i < per; i++) pads.push(mkPad(k++, -span / 2, off + i * pitch, pw, ph, false, p, 0));
    for (let i = 0; i < per; i++) pads.push(mkPad(k++, off + i * pitch, span / 2, pw, ph, false, p, 90));
    for (let i = 0; i < per; i++) pads.push(mkPad(k++, span / 2, off + (per - 1 - i) * pitch, pw, ph, false, p, 0));
    for (let i = 0; i < per; i++) pads.push(mkPad(k++, off + (per - 1 - i) * pitch, -span / 2, pw, ph, false, p, 90));
    return finish({ name: p.name || ('QUAD-' + n), kind: 'quad', pads }, p);
  }

  // 網格（BGA / LGA）。編號是「列字母 + 行數字」（A1、B3…），跳過 I/O/Q/S/X/Z。
  const ROW_LETTERS = 'ABCDEFGHJKLMNPRTUVWY';
  function grid(p) {
    const rows = Math.max(1, Math.round(p.rows || 8));
    const cols = Math.max(1, Math.round(p.cols || 8));
    const pitch = p.pitch || 0.8;
    const d = p.ballD != null ? p.ballD : 0.4;
    const skip = new Set((p.skip || []).map(String));
    const pads = [];
    const x0 = -((cols - 1) * pitch) / 2;
    const y0 = -((rows - 1) * pitch) / 2;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const num = rowName(r) + (c + 1);
        if (skip.has(num)) continue;
        pads.push({ num, x: round(x0 + c * pitch), y: round(y0 + r * pitch), w: d, h: d, shape: 'circle', rot: 0, side: 'F' });
      }
    }
    return finish({ name: p.name || ('BGA-' + rows + 'x' + cols), kind: 'grid', pads }, p);
  }

  // 超過 20 列時用 AA、AB…（BGA 常見）
  function rowName(i) {
    const L = ROW_LETTERS.length;
    return i < L ? ROW_LETTERS[i] : ROW_LETTERS[Math.floor(i / L) - 1] + ROW_LETTERS[i % L];
  }

  // 兩顆對稱 pad（被動件）
  function chip(p) {
    const span = p.span != null ? p.span : 1.55;
    const pw = p.padW != null ? p.padW : 0.8;
    const ph = p.padH != null ? p.padH : 0.9;
    const pads = [
      mkPad(1, -span / 2, 0, pw, ph, false, p),
      mkPad(2, span / 2, 0, pw, ph, false, p),
    ];
    return finish({ name: p.name || 'CHIP', kind: 'chip', pads }, p);
  }

  function mkPad(num, x, y, w, h, tht, p, rot) {
    const pad = {
      num, x: round(x), y: round(y), w: round(w), h: round(h),
      shape: tht ? 'circle' : (p && p.shape) || 'rect', rot: rot || 0, side: 'F',
    };
    if (tht) {
      pad.drill = (p && p.drill) || 0.8;
      pad.shape = num === 1 ? 'rect' : 'circle';     // 第 1 腳做成方形，看得出方向
      pad.side = '*';                                // 通孔兩面都有銅
    }
    return pad;
  }

  // courtyard 沒給就從 pad 外框加 margin 算出來。
  // 不自己算的話，DRC 的元件間距檢查會拿不到外框，變成「永遠不報錯」。
  function finish(fp, p) {
    const m = (p && p.courtyardMargin != null) ? p.courtyardMargin : 0.25;
    fp.courtyard = (p && p.courtyard) || courtyardOf(fp, m);
    fp.silk = (p && p.silk) || [];
    return fp;
  }

  function courtyardOf(fp, margin) {
    const pads = fp.pads || [];
    if (!pads.length) return { w: 0, h: 0 };
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const q of pads) {
      const hw = padHalf(q).w, hh = padHalf(q).h;
      x0 = Math.min(x0, q.x - hw); x1 = Math.max(x1, q.x + hw);
      y0 = Math.min(y0, q.y - hh); y1 = Math.max(y1, q.y + hh);
    }
    const m = margin != null ? margin : 0.25;
    return { w: round(x1 - x0 + 2 * m), h: round(y1 - y0 + 2 * m) };
  }

  // 旋轉 90/270 度的 pad，寬高要對調——不換的話 QFP 上下兩排的重疊檢查會全部誤判
  function padHalf(q) {
    const r = ((q.rot || 0) % 180 + 180) % 180;
    const swap = r > 45 && r < 135;
    return { w: (swap ? q.h : q.w) / 2, h: (swap ? q.w : q.h) / 2 };
  }

  // ---- 編輯 ----
  function addPad(fp, pad) {
    const out = clone(fp);
    const num = pad.num != null ? pad.num : nextNum(out);
    out.pads.push(Object.assign({ x: 0, y: 0, w: 1, h: 1, shape: 'rect', rot: 0, side: 'F' }, pad, { num }));
    return out;
  }
  function removePad(fp, num) {
    const out = clone(fp);
    out.pads = out.pads.filter(q => String(q.num) !== String(num));
    return out;
  }
  function movePad(fp, num, x, y) {
    const out = clone(fp);
    const q = out.pads.find(p => String(p.num) === String(num));
    if (q) { q.x = round(x); q.y = round(y); }
    return out;
  }
  function nextNum(fp) {
    const nums = (fp.pads || []).map(q => +q.num).filter(v => !isNaN(v));
    return nums.length ? Math.max(...nums) + 1 : 1;
  }
  const clone = fp => JSON.parse(JSON.stringify(fp || blank()));

  /**
   * 檢查。回傳 [{ level:'error'|'warn', code, msg, pads:[num…] }]
   *
   * 自製封裝的錯幾乎都是「看起來對、量起來差一點」，所以這裡查的都是數字：
   * pad 相碰、編號重複或跳號、孔比 pad 大、pad 跑出 courtyard、間距不是常見值。
   */
  function check(fp, opts) {
    const o = opts || {};
    const minGap = o.minGap != null ? o.minGap : 0.1;     // pad 之間的最小銅間距
    const out = [];
    const pads = (fp && fp.pads) || [];
    if (!pads.length) { out.push({ level: 'error', code: 'no_pads', msg: 'empty', pads: [] }); return out; }

    // 1. pad 相碰
    for (let i = 0; i < pads.length; i++) {
      for (let j = i + 1; j < pads.length; j++) {
        const a = pads[i], b = pads[j];
        const ha = padHalf(a), hb = padHalf(b);
        const dx = Math.abs(a.x - b.x) - (ha.w + hb.w);
        const dy = Math.abs(a.y - b.y) - (ha.h + hb.h);
        const gap = Math.max(dx, dy);
        if (gap < -1e-9) out.push({ level: 'error', code: 'pad_overlap', msg: 'overlap', pads: [a.num, b.num], gap: round(gap) });
        else if (gap < minGap - 1e-9) out.push({ level: 'warn', code: 'pad_too_close', msg: 'gap ' + round(gap), pads: [a.num, b.num], gap: round(gap) });
      }
    }

    // 2. 編號重複
    const seen = new Map();
    for (const q of pads) seen.set(String(q.num), (seen.get(String(q.num)) || 0) + 1);
    for (const [num, c] of seen) if (c > 1) out.push({ level: 'error', code: 'dup_pad_num', msg: num, pads: [num] });

    // 3. 數字編號跳號（BGA 的字母編號不查）
    const nums = pads.map(q => +q.num).filter(v => !isNaN(v)).sort((a, b) => a - b);
    if (nums.length === pads.length && nums.length > 1) {
      for (let i = 1; i < nums.length; i++) {
        if (nums[i] - nums[i - 1] > 1) {
          out.push({ level: 'warn', code: 'pad_num_gap', msg: nums[i - 1] + '→' + nums[i], pads: [nums[i - 1], nums[i]] });
        }
      }
      if (nums[0] !== 1) out.push({ level: 'warn', code: 'pad_num_start', msg: String(nums[0]), pads: [nums[0]] });
    }

    // 4. 孔徑
    for (const q of pads) {
      if (q.drill == null) continue;
      const minSide = Math.min(q.w, q.h);
      if (q.drill >= minSide) out.push({ level: 'error', code: 'drill_bigger_than_pad', msg: q.drill + ' >= ' + minSide, pads: [q.num] });
      else if (minSide - q.drill < 0.3 - 1e-9) out.push({ level: 'warn', code: 'annular_thin', msg: round((minSide - q.drill) / 2), pads: [q.num] });
    }

    // 5. courtyard 要包得住所有 pad
    if (fp.courtyard && fp.courtyard.w) {
      const need = courtyardOf(fp, 0);
      if (need.w - fp.courtyard.w > 1e-9 || need.h - fp.courtyard.h > 1e-9) {
        out.push({ level: 'error', code: 'courtyard_too_small', msg: need.w + '×' + need.h + ' > ' + fp.courtyard.w + '×' + fp.courtyard.h, pads: [] });
      }
    }

    // 6. 間距是不是常見值。不是的話通常是打錯字（0.65 打成 0.6）
    const pitch = detectPitch(pads);
    if (pitch != null) {
      const common = [0.4, 0.5, 0.65, 0.8, 1.0, 1.27, 2.0, 2.54];
      if (!common.some(c => Math.abs(c - pitch) < 0.005)) {
        out.push({ level: 'warn', code: 'unusual_pitch', msg: String(round(pitch, 3)), pads: [] });
      }
    }
    return out;
  }

  // 取相鄰 pad 距離的眾數當間距。
  // 一定要先分排：整包排序後相鄰的常常是「左排某腳 → 右排對面那腳」，
  // 量到的是兩排的跨距（SOIC 的 5.4）而不是間距（1.27）。
  // 分排的方式是把 x 相同的歸一組（直排）、y 相同的歸一組（橫排），組內才量相鄰距離。
  function detectPitch(pads) {
    if (pads.length < 3) return null;
    const ds = [];
    const groupBy = (key, other) => {
      const g = new Map();
      for (const q of pads) {
        const k = round(q[key], 3);
        if (!g.has(k)) g.set(k, []);
        g.get(k).push(q);
      }
      for (const [, arr] of g) {
        if (arr.length < 2) continue;
        arr.sort((a, b) => a[other] - b[other]);
        for (let i = 1; i < arr.length; i++) {
          const d = Math.abs(arr[i][other] - arr[i - 1][other]);
          if (d > 1e-6) ds.push(round(d, 3));
        }
      }
    };
    groupBy('x', 'y');    // 直排：同 x，量 y 的間距
    groupBy('y', 'x');    // 橫排：同 y，量 x 的間距
    if (!ds.length) return null;
    const cnt = new Map();
    for (const d of ds) cnt.set(d, (cnt.get(d) || 0) + 1);
    let best = null;
    for (const [d, c] of cnt) if (!best || c > best.c) best = { d, c };
    return best && best.c >= 2 ? best.d : null;
  }

  // ---- 與 PCB 元件互轉 ----
  function toComponent(fp, ref, x, y) {
    return {
      id: 'fp-' + String(ref || 'X1'),
      ref: String(ref || 'X1'),
      part: fp.name,
      x: x || 0, y: y || 0, rot: 0, side: 'top', kind: 'ic',
      w: (fp.courtyard && fp.courtyard.w) || 2,
      h: (fp.courtyard && fp.courtyard.h) || 2,
      pads: (fp.pads || []).map(q => Object.assign({}, q, { net: '' })),
    };
  }

  function fromComponent(comp, name) {
    const fp = blank(name || (comp && comp.part) || 'FROM-COMP');
    fp.pads = ((comp && comp.pads) || []).map(q => ({
      num: q.num, x: q.x, y: q.y, w: q.w, h: q.h,
      shape: q.shape || 'rect', rot: q.rot || 0, side: q.side || 'F',
      drill: q.drill,
    }));
    fp.courtyard = courtyardOf(fp, 0.25);
    return fp;
  }

  const FootprintEditor = {
    blank, dual, quad, grid, chip,
    addPad, removePad, movePad, nextNum,
    check, courtyardOf, detectPitch, padHalf, rowName,
    toComponent, fromComponent,
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = FootprintEditor;
  root.FootprintEditor = FootprintEditor;
})(typeof window !== 'undefined' ? window : globalThis);
