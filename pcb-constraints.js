// Constraint Manager（Allegro 風約束管理）
// window.ConstraintMgr：net class 分組 + 每 class 實體/電氣約束 + class-pair 間距矩陣 + 銳角檢查。
// localStorage 持久（vs-constraints-v1）。純資料函式（classOf/clearanceBetween/audit）node harness 可直接測；
// renderPanel 只在瀏覽器掛 UI。audit 由 pcb.js runDrc 併入。
(() => {
  const KEY = 'vs-constraints-v1';

  const DEFAULTS = () => ({
    classes: [
      { id: 'default', name: 'DEFAULT', patterns: [], phys: { minW: 0.1, prefW: 0.3 }, elec: { maxLen: 0, pairGap: 0, pairTol: 0 } },
      { id: 'power', name: 'POWER', patterns: ['GND', 'VIN', 'VCC', 'VDD', 'PVIN', '+5V', '+3V3'], phys: { minW: 0.3, prefW: 0.5 }, elec: { maxLen: 0, pairGap: 0, pairTol: 0 } },
      { id: 'diff', name: 'DIFF', patterns: ['/_[PN]$/', '/[+-]$/'], phys: { minW: 0.1, prefW: 0.15 }, elec: { maxLen: 0, pairGap: 0.2, pairTol: 0.5 } }
    ],
    // class-pair 間距（mm）。key = 兩 class id 排序後 join('|')；未列者退回全域 DRC clearance。
    matrix: { 'default|power': 0.2, 'diff|power': 0.25 }
  });

  const matchPat = (pattern, net) => {
    if (!pattern || !net) return false;
    if (pattern.length > 2 && pattern[0] === '/' && pattern.endsWith('/')) {
      try { return new RegExp(pattern.slice(1, -1), 'i').test(net); } catch (e) { return false; }
    }
    return net.toLowerCase().includes(pattern.toLowerCase());
  };

  // i18n：I18N 未載（node harness）時回 key
  const T = (k, vars) => (typeof window !== 'undefined' && window.I18N) ? window.I18N.t(k, vars) : k;
  const pairKey = (a, b) => [a, b].sort().join('|');

  // 線段最短距離（端點對段 ×4 + 相交檢查）；走線稀少，O(n²) 可接受
  function segDist(a, b) {
    const p2s = (px, py, x1, y1, x2, y2) => {
      const dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy;
      if (l2 === 0) return Math.hypot(px - x1, py - y1);
      const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / l2));
      return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
    };
    const ccw = (ax, ay, bx, by, cx, cy) => (cy - ay) * (bx - ax) > (by - ay) * (cx - ax);
    const cross = ccw(a.x1, a.y1, b.x1, b.y1, b.x2, b.y2) !== ccw(a.x2, a.y2, b.x1, b.y1, b.x2, b.y2)
      && ccw(a.x1, a.y1, a.x2, a.y2, b.x1, b.y1) !== ccw(a.x1, a.y1, a.x2, a.y2, b.x2, b.y2);
    if (cross) return 0;
    return Math.min(
      p2s(a.x1, a.y1, b.x1, b.y1, b.x2, b.y2), p2s(a.x2, a.y2, b.x1, b.y1, b.x2, b.y2),
      p2s(b.x1, b.y1, a.x1, a.y1, a.x2, a.y2), p2s(b.x2, b.y2, a.x1, a.y1, a.x2, a.y2));
  }

  const ConstraintMgr = {
    load() {
      try {
        const s = (typeof localStorage !== 'undefined') && localStorage.getItem(KEY);
        if (s) { const d = JSON.parse(s); if (d && Array.isArray(d.classes)) return d; }
      } catch (e) { /* 損壞回預設 */ }
      return DEFAULTS();
    },
    save(data) {
      try { if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { }
    },
    reset() { const d = DEFAULTS(); this.save(d); return d; },

    /**
     * net → class。
     * explicit（線路圖帶過來的 {net: className}）**優先於 patterns**：
     * 「這條是電源」是設計意圖，名字叫 SYS_RAIL 的電源永遠猜不到。
     * 沒指定的才照名字猜，行為與舊版相同。
     */
    classOf(data, net, explicit) {
      if (explicit && net) {
        const want = explicit[net];
        if (want) {
          const hit = (data.classes || []).find(c => c.name === want || c.id === want);
          if (hit) return hit;      // 找不到就當沒指定：class 定義可能被刪掉了，不要整條 net 失去規則
        }
      }
      return this.classOfByPattern(data, net);
    },

    /**
     * 一「段」走線的 class。優先序：這一段自己指定的 → 整條 net 的 → 名字猜的。
     *
     * 為什麼需要分段：同一條 net 在不同位置本來就有不同的規格——出 BGA 的那一段
     * 只能走 0.1mm，離開扇出區之後應該加寬到 0.3mm 才不會壓降。整條 net 一個 class
     * 的話，使用者只能兩害相權：要嘛整條走窄的（沒必要的壓降），要嘛整條走寬的
     * （扇出區直接繞不出來）。
     *
     * 指定在**走線物件上**（`trace.netClass`），所以它跟著存檔、復原、匯出走，
     * 也跟著那一段被拖動——換 net 名字不會讓它失效。
     * 指到不存在的 class 就退回整條 net 的規則（class 定義可能被刪掉了，
     * 不該讓那一段變成沒有規則）。
     */
    classOfTrace(data, trace, explicit) {
      const want = trace && String(trace.netClass || '').trim();
      if (want) {
        const hit = (data.classes || []).find(c => c.name === want || c.id === want);
        if (hit) return hit;
      }
      return this.classOf(data, (trace && trace.net) || '', explicit);
    },

    // net → class（patterns 第一命中；default class 收尾）
    classOfByPattern(data, net) {
      let def = null;
      for (const c of data.classes) {
        if (c.id === 'default') { def = c; continue; }
        for (const p of (c.patterns || [])) if (matchPat(p, net)) return c;
      }
      return def || data.classes[0] || null;
    },
    // 兩 net 的要求間距：matrix 命中取之，否則 fallback（全域 DRC clearance 由呼叫端傳入）
    // explicit（線路圖帶過來的 {net: className}）要一起傳，否則「明講的 class」在這條路上失效：
    // 畫線時的即時間距提示會用名字猜出來的 class，跟 DRC 報的不是同一套規則。
    clearanceBetween(data, netA, netB, fallback, explicit) {
      const ca = this.classOf(data, netA, explicit), cb = this.classOf(data, netB, explicit);
      if (!ca || !cb) return fallback;
      const m = data.matrix[pairKey(ca.id, cb.id)];
      return (typeof m === 'number' && m > 0) ? Math.max(m, fallback || 0) : (fallback || 0);
    },

    // 全面稽核：class 線寬/線長 + 矩陣間距 + 銳角。回 [{type,message}]（併入 runDrc）
    // 線路圖明講的 class（state.netClasses）在這裡一樣優先：只在 classOf 支援還不夠，
    // 稽核不傳的話「指定成 POWER 的 SYS_RAIL」在 DRC 眼裡仍然是 DEFAULT，
    // 面板寫 POWER、DRC 用 DEFAULT 的線寬下限——兩邊各自看起來都對。
    audit(data, state, globalClearance) {
      const res = [];
      const explicit = (state && state.netClasses) || null;
      const traces = (state.traces || []).filter(t => t.x1 !== t.x2 || t.y1 !== t.y2);
      const nets = [...new Set(traces.map(t => t.net).filter(Boolean))];

      // 1) class 實體線寬（逐段判）＋ 電氣線長（整條 net 判）
      //
      // 線寬要**逐段**判，因為 class 可以指定在單獨一段上（出 BGA 走 0.1、幹道走 0.3
      // 是同一條 net 的常態）。用整條 net 一個 class 去判的話，加寬過的那一段會被
      // 拿窄 class 的下限去量，或反過來——兩種都是假警報。
      // 報告仍照「net × class」聚合：同一條 net 的十段窄線報十次沒人看得完。
      const byGroup = new Map();
      for (const t of traces) {
        if (!t.net) continue;
        const cls = this.classOfTrace(data, t, explicit);
        if (!cls) continue;
        const k = t.net + '\u0000' + cls.id;
        if (!byGroup.has(k)) byGroup.set(k, { net: t.net, cls, segs: [] });
        byGroup.get(k).segs.push(t);
      }
      for (const g of byGroup.values()) {
        const minW = g.cls.phys && g.cls.phys.minW;
        if (!(minW > 0)) continue;
        const bad = g.segs.filter(t => (t.width || 0.3) < minW - 1e-9);
        if (!bad.length) continue;
        const seen = Math.min(...bad.map(t => t.width || 0.3));
        res.push({ type: 'error', message: T('cm_e_width', { net: g.net, cls: g.cls.name, n: bad.length, min: minW, seen }) });
      }
      // 線長是**整條 net** 的性質，不是一段的：一段線談不上「太長」。
      // 所以這一條照舊用整條 net 的 class（分段指定不影響它）。
      for (const net of nets) {
        const cls = this.classOf(data, net, explicit);
        if (!cls) continue;
        const maxLen = cls.elec && cls.elec.maxLen;
        if (!(maxLen > 0)) continue;
        let L = 0;
        for (const t of traces) if (t.net === net) L += Math.hypot(t.x2 - t.x1, t.y2 - t.y1);
        if (L > maxLen) res.push({ type: 'error', message: T('cm_e_len', { net, cls: cls.name, len: L.toFixed(2), max: maxLen }) });
      }

      // 2) 矩陣間距（不同 net、同層、要求 > 全域才另報，避免與 PadDrc 全域檢查重複）
      const fb = globalClearance || 0;
      const reported = new Set();
      // 原本是 n² 全比對，而且每一對都先呼叫 clearanceBetween（要查 class 再查矩陣）。
      // 1000 條走線＝50 萬次查表，量到 535ms，是整個 DRC 最慢的一段。
      // 兩件事：① class 與 net-pair 的查表結果記起來 ② 用空間網格只比可能靠近的。
      // 網格桶邊長取矩陣裡的最大要求間距，所以候選一定涵蓋所有可能違規的配對。
      // class 現在是**逐段**的，所以快取的鑰匙從 net 換成走線索引；
      // 每一對都去查 class 太慢，先整批算好（每段一次，不是每一對一次）。
      const clsOfIdx = traces.map(t => this.classOfTrace(data, t, explicit));
      const classOfCached = idx => clsOfIdx[idx];
      const reqCache = new Map();
      const reqOf = (ia, ib) => {
        const ca = classOfCached(ia), cb = classOfCached(ib);
        if (!ca || !cb) return fb;
        const k = ca.id < cb.id ? ca.id + "|" + cb.id : cb.id + "|" + ca.id;
        if (reqCache.has(k)) return reqCache.get(k);
        const m = data.matrix[pairKey(ca.id, cb.id)];
        const v = (typeof m === "number" && m > 0) ? Math.max(m, fb) : fb;
        reqCache.set(k, v);
        return v;
      };
      let maxReq = fb;
      Object.keys(data.matrix || {}).forEach(k => {
        const v = data.matrix[k];
        if (typeof v === 'number' && v > maxReq) maxReq = v;
      });

      const cell = Math.max(1, 2 * (maxReq + 1));
      const buckets = new Map();
      const bkey = (ix, iy) => ix + ',' + iy;
      const bboxOf = t => {
        const m = (t.width || 0.3) / 2 + maxReq;
        return { minx: Math.min(t.x1, t.x2) - m, maxx: Math.max(t.x1, t.x2) + m,
                 miny: Math.min(t.y1, t.y2) - m, maxy: Math.max(t.y1, t.y2) + m };
      };
      const boxes = traces.map(bboxOf);
      traces.forEach((t, i) => {
        const b = boxes[i];
        for (let iy = Math.floor(b.miny / cell); iy <= Math.floor(b.maxy / cell); iy++)
          for (let ix = Math.floor(b.minx / cell); ix <= Math.floor(b.maxx / cell); ix++) {
            const k = bkey(ix, iy);
            let a = buckets.get(k);
            if (!a) { a = []; buckets.set(k, a); }
            a.push(i);
          }
      });

      for (let i = 0; i < traces.length; i++) {
        const b = boxes[i];
        const cand = new Set();
        for (let iy = Math.floor(b.miny / cell); iy <= Math.floor(b.maxy / cell); iy++)
          for (let ix = Math.floor(b.minx / cell); ix <= Math.floor(b.maxx / cell); ix++) {
            const a = buckets.get(bkey(ix, iy));
            if (a) for (let n = 0; n < a.length; n++) if (a[n] > i) cand.add(a[n]);
          }
        // 照原始索引順序處理：報告有數量上限，順序變了會列出不同的結果
        const list = [...cand].sort((x, y) => x - y);
        for (const j of list) {
        const A = traces[i], B = traces[j];
        if (!A.net || !B.net || A.net === B.net) continue;
        if ((A.layer || 'F.Cu') !== (B.layer || 'F.Cu')) continue;
        const req = reqOf(i, j);
        if (req <= fb) continue; // 全域檢查已涵蓋
        const d = segDist(A, B) - ((A.width || 0.3) + (B.width || 0.3)) / 2;
        if (d < req - 1e-9) {
          const k = pairKey(A.net, B.net);
          if (reported.has(k)) continue;
          reported.add(k);
          const ca = classOfCached(i), cb = classOfCached(j);
          res.push({ type: 'error', message: T('cm_e_clear', { netA: A.net, clsA: ca.name, netB: B.net, clsB: cb.name, d: Math.max(0, d).toFixed(3), req }) });
        }
        }
      }

      // 3) 銳角走線（同 net 共端點兩段夾角 < 90° → 酸角蝕刻風險）
      const EPS = 0.01;
      const byNet = {};
      traces.forEach(t => { (byNet[t.net || ''] = byNet[t.net || ''] || []).push(t); });
      let acuteN = 0;
      for (const [net, segs] of Object.entries(byNet)) {
        if (!net) continue;
        for (let i = 0; i < segs.length; i++) for (let j = i + 1; j < segs.length; j++) {
          const a = segs[i], b = segs[j];
          if ((a.layer || 'F.Cu') !== (b.layer || 'F.Cu')) continue;
          // 找共用端點
          const ends = [[a.x1, a.y1, a.x2, a.y2], [a.x2, a.y2, a.x1, a.y1]];
          for (const [sx, sy, ox, oy] of ends) {
            let bx = null, by2 = null;
            if (Math.hypot(sx - b.x1, sy - b.y1) < EPS) { bx = b.x2; by2 = b.y2; }
            else if (Math.hypot(sx - b.x2, sy - b.y2) < EPS) { bx = b.x1; by2 = b.y1; }
            if (bx === null) continue;
            const v1x = ox - sx, v1y = oy - sy, v2x = bx - sx, v2y = by2 - sy;
            const L1 = Math.hypot(v1x, v1y), L2 = Math.hypot(v2x, v2y);
            if (L1 < EPS || L2 < EPS) continue;
            const ang = Math.acos(Math.max(-1, Math.min(1, (v1x * v2x + v1y * v2y) / (L1 * L2)))) * 180 / Math.PI;
            if (ang < 89.5) {
              acuteN++;
              if (acuteN <= 5) res.push({ type: 'warning', message: T('cm_w_acute', { net, x: sx.toFixed(1), y: sy.toFixed(1), ang: ang.toFixed(0) }) });
            }
            break;
          }
        }
      }
      if (acuteN > 5) res.push({ type: 'warning', message: T('cm_w_acute_more', { n: acuteN - 5 }) });
      return res;
    },

    // ---------- UI ----------
    renderPanel() {
      const host = document.getElementById('cmPanel');
      if (!host) return;
      const data = this.load();
      const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
      const num = v => (v === 0 || v === undefined || v === null) ? '' : v;

      const rows = data.classes.map((c, i) => `
        <tr data-i="${i}">
          <td><input class="cm-name" value="${esc(c.name)}" ${c.id === 'default' ? 'disabled' : ''} style="width:64px"></td>
          <td><input class="cm-pat" value="${esc((c.patterns || []).join(','))}" ${c.id === 'default' ? 'disabled placeholder="*"' : ''} style="width:110px"></td>
          <td><input class="cm-minw" type="number" step="0.05" min="0" value="${num(c.phys && c.phys.minW)}" style="width:52px"></td>
          <td><input class="cm-maxlen" type="number" step="1" min="0" value="${num(c.elec && c.elec.maxLen)}" style="width:52px"></td>
          <td>${c.id === 'default' ? '' : `<button class="cm-del" title="${esc(T('cm_del'))}">✕</button>`}</td>
        </tr>`).join('');

      // 矩陣（上三角，對稱）
      const ids = data.classes.map(c => c.id);
      const names = data.classes.map(c => c.name);
      let mat = '<table style="border-collapse:collapse;font-size:11px"><tr><td></td>' +
        names.map(n => `<td style="padding:2px 4px;color:var(--muted)">${esc(n)}</td>`).join('') + '</tr>';
      for (let r = 0; r < ids.length; r++) {
        mat += `<tr><td style="padding:2px 4px;color:var(--muted)">${esc(names[r])}</td>`;
        for (let c = 0; c < ids.length; c++) {
          if (c < r) { mat += '<td></td>'; continue; }
          const k = pairKey(ids[r], ids[c]);
          mat += `<td><input class="cm-mx" data-k="${esc(k)}" type="number" step="0.05" min="0" value="${num(data.matrix[k])}" placeholder="—" style="width:46px;padding:2px"></td>`;
        }
        mat += '</tr>';
      }
      mat += '</table>';

      host.innerHTML = `
        <table style="border-collapse:collapse;font-size:11px;width:100%">
          <tr style="color:var(--muted)"><td>${esc(T('cm_class'))}</td><td>${esc(T('cm_patterns'))}</td><td>${esc(T('cm_minw'))}</td><td>${esc(T('cm_maxlen'))}</td><td></td></tr>
          ${rows}
        </table>
        <div style="display:flex;gap:6px;margin:6px 0">
          <button class="small-button" id="cmAdd">${esc(T('cm_add'))}</button>
          <button class="small-button" id="cmReset">${esc(T('cm_reset'))}</button>
          <button class="small-button" id="cmNets">${esc(T('cm_nets_btn'))}</button>
        </div>
        <div style="font-size:11px;color:var(--muted);margin:4px 0">${esc(T('cm_matrix'))}</div>
        <div style="overflow-x:auto">${mat}</div>
        <div id="cmNetsOut" style="font-size:11px;color:var(--muted);margin-top:4px"></div>
        <p style="font-size:11px;color:var(--muted);margin:6px 0 0">${esc(T('cm_hint'))}</p>`;

      const persist = () => {
        host.querySelectorAll('tr[data-i]').forEach(tr => {
          const c = data.classes[+tr.dataset.i];
          if (!c) return;
          if (c.id !== 'default') {
            c.name = tr.querySelector('.cm-name').value.trim() || c.name;
            c.patterns = tr.querySelector('.cm-pat').value.split(',').map(s => s.trim()).filter(Boolean);
          }
          c.phys = c.phys || {}; c.elec = c.elec || {};
          c.phys.minW = parseFloat(tr.querySelector('.cm-minw').value) || 0;
          c.elec.maxLen = parseFloat(tr.querySelector('.cm-maxlen').value) || 0;
        });
        host.querySelectorAll('.cm-mx').forEach(inp => {
          const v = parseFloat(inp.value);
          if (v > 0) data.matrix[inp.dataset.k] = v; else delete data.matrix[inp.dataset.k];
        });
        this.save(data);
      };
      host.addEventListener('change', persist);
      host.querySelector('#cmAdd').addEventListener('click', () => {
        persist();
        data.classes.push({ id: 'c' + Date.now(), name: 'CLASS' + data.classes.length, patterns: [], phys: { minW: 0 }, elec: { maxLen: 0 } });
        this.save(data); this.renderPanel();
      });
      host.querySelector('#cmReset').addEventListener('click', () => { this.save(DEFAULTS()); this.renderPanel(); });
      host.querySelectorAll('.cm-del').forEach(btn => btn.addEventListener('click', e => {
        persist();
        const i = +e.target.closest('tr').dataset.i;
        if (data.classes[i] && data.classes[i].id !== 'default') { data.classes.splice(i, 1); this.save(data); this.renderPanel(); }
      }));
      host.querySelector('#cmNets').addEventListener('click', () => {
        const st = (window.pcbApp && pcbApp.state) || {};
        const nets = new Set();
        (st.components || []).forEach(c => (c.pads || []).forEach(p => { if (p.net) nets.add(p.net); }));
        (st.traces || []).forEach(t => { if (t.net) nets.add(t.net); });
        const out = [...nets].sort().map(n => { const c = this.classOf(data, n, st.netClasses); return esc(n) + ' → ' + esc(c ? c.name : '?'); });
        document.getElementById('cmNetsOut').innerHTML = out.length ? out.join('<br>') : esc(T('cm_no_nets'));
      });
    }
  };

  if (typeof window !== 'undefined') {
    window.ConstraintMgr = ConstraintMgr;
    const mount = () => { ConstraintMgr.renderPanel(); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
    document.addEventListener('vs-lang-change', mount);
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = ConstraintMgr;
})();
