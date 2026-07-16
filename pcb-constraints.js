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

    // net → class（patterns 第一命中；default class 收尾）
    classOf(data, net) {
      let def = null;
      for (const c of data.classes) {
        if (c.id === 'default') { def = c; continue; }
        for (const p of (c.patterns || [])) if (matchPat(p, net)) return c;
      }
      return def || data.classes[0] || null;
    },
    // 兩 net 的要求間距：matrix 命中取之，否則 fallback（全域 DRC clearance 由呼叫端傳入）
    clearanceBetween(data, netA, netB, fallback) {
      const ca = this.classOf(data, netA), cb = this.classOf(data, netB);
      if (!ca || !cb) return fallback;
      const m = data.matrix[pairKey(ca.id, cb.id)];
      return (typeof m === 'number' && m > 0) ? Math.max(m, fallback || 0) : (fallback || 0);
    },

    // 全面稽核：class 線寬/線長 + 矩陣間距 + 銳角。回 [{type,message}]（併入 runDrc）
    audit(data, state, globalClearance) {
      const res = [];
      const traces = (state.traces || []).filter(t => t.x1 !== t.x2 || t.y1 !== t.y2);
      const nets = [...new Set(traces.map(t => t.net).filter(Boolean))];

      // 1) class 實體線寬 + 電氣線長
      for (const net of nets) {
        const cls = this.classOf(data, net);
        if (!cls) continue;
        const segs = traces.filter(t => t.net === net);
        const minW = cls.phys && cls.phys.minW;
        if (minW > 0) {
          const bad = segs.filter(t => (t.width || 0.3) < minW - 1e-9);
          if (bad.length) {
            const seen = Math.min(...bad.map(t => t.width || 0.3));
            res.push({ type: 'error', message: T('cm_e_width', { net, cls: cls.name, n: bad.length, min: minW, seen }) });
          }
        }
        const maxLen = cls.elec && cls.elec.maxLen;
        if (maxLen > 0) {
          let L = 0; for (const t of segs) L += Math.hypot(t.x2 - t.x1, t.y2 - t.y1);
          if (L > maxLen) res.push({ type: 'error', message: T('cm_e_len', { net, cls: cls.name, len: L.toFixed(2), max: maxLen }) });
        }
      }

      // 2) 矩陣間距（不同 net、同層、要求 > 全域才另報，避免與 PadDrc 全域檢查重複）
      const fb = globalClearance || 0;
      const reported = new Set();
      for (let i = 0; i < traces.length; i++) for (let j = i + 1; j < traces.length; j++) {
        const A = traces[i], B = traces[j];
        if (!A.net || !B.net || A.net === B.net) continue;
        if ((A.layer || 'F.Cu') !== (B.layer || 'F.Cu')) continue;
        const req = this.clearanceBetween(data, A.net, B.net, fb);
        if (req <= fb) continue; // 全域檢查已涵蓋
        const d = segDist(A, B) - ((A.width || 0.3) + (B.width || 0.3)) / 2;
        if (d < req - 1e-9) {
          const k = pairKey(A.net, B.net);
          if (reported.has(k)) continue;
          reported.add(k);
          const ca = this.classOf(data, A.net), cb = this.classOf(data, B.net);
          res.push({ type: 'error', message: T('cm_e_clear', { netA: A.net, clsA: ca.name, netB: B.net, clsB: cb.name, d: Math.max(0, d).toFixed(3), req }) });
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
        const out = [...nets].sort().map(n => { const c = this.classOf(data, n); return esc(n) + ' → ' + esc(c ? c.name : '?'); });
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
