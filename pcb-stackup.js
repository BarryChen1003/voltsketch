// 疊層編輯器 + Via Padstack + Backdrill（企業級模組④）
// window.Stackup：銅層厚(oz)/介電層厚/εr 編輯，總板厚，一鍵帶入阻抗計算。
// window.Padstack：via 預設外徑/鑽徑（新 via 取用；可回填既有 via）。
// window.Backdrill：依 Constraint Manager 類別挑高速 net，計算 via 殘樁（stub）背鑽
//   （compute 為純函式可 node 測）；結果存 pcbApp.state.backdrills，Gerber 匯出 Excellon 背鑽檔。
(() => {
  const SK_KEY = 'vs-stackup-v1';
  const PS_KEY = 'vs-padstack-v1';
  const BD_KEY = 'vs-backdrill-v1';
  const OZ_MM = 0.035; // 1 oz ≈ 35µm

  const T = (k, vars) => (typeof window !== 'undefined' && window.I18N) ? window.I18N.t(k, vars) : k;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const store = {
    get(k, d) { try { const s = (typeof localStorage !== 'undefined') && localStorage.getItem(k); if (s) return JSON.parse(s); } catch (e) { } return d; },
    set(k, v) { try { if (typeof localStorage !== 'undefined') localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
  };
  const copperIds = state => (state.layerStack || []).filter(l => l.kind === 'copper').map(l => l.id);

  // ---------------- 疊層 ----------------
  const Stackup = {
    // 依當前銅層數對齊：oz 依層 id 記、介電層陣列長度 = 銅層數-1（保留既有值）
    load(state) {
      const d = store.get(SK_KEY, { oz: {}, diel: [] });
      const ids = copperIds(state || (window.pcbApp && pcbApp.state) || { layerStack: [] });
      ids.forEach(id => { if (!(d.oz[id] > 0)) d.oz[id] = 1; });
      const need = Math.max(0, ids.length - 1);
      while (d.diel.length < need) d.diel.push({ t: 0.2, er: 4.4 });
      d.diel.length = need;
      return d;
    },
    save(d) { store.set(SK_KEY, d); },
    // 依銀層推導阻抗幾何（純函數，node 可測）。
    // 外層 → microstrip；內層 → stripline。h 用 IPC-2141 的定義：單側介電厚。
    // 回 {kind, h, er, t, ref, warn[]}；推不出來回 null。
    // warn: 'asym' 上下介電不對稱（對稱 stripline 公式不適用）
    //       'refsig' 參考層是訊號層，不是完整平面，回流路徑不連續
    geomFor(d, state, layerId) {
      const ids = copperIds(state);
      const i = ids.indexOf(layerId);
      if (i < 0 || ids.length < 2) return null;
      const stack = state.layerStack || [];
      const typeOf = id => (stack.find(l => l.id === id) || {}).type || 'Signal';
      const t = (d.oz[layerId] || 1) * OZ_MM;
      const above = i > 0 ? d.diel[i - 1] : null;          // 本層與上一銀層之間
      const below = i < ids.length - 1 ? d.diel[i] : null; // 本層與下一銀層之間
      const warn = [];
      let kind, h, er, refIds;
      if (i === 0 || i === ids.length - 1) {
        kind = 'microstrip';
        const die = i === 0 ? below : above;
        if (!die || !(die.t > 0)) return null;
        h = die.t; er = die.er;
        refIds = [i === 0 ? ids[1] : ids[ids.length - 2]];
      } else {
        kind = 'stripline';
        if (!above || !below || !(above.t > 0) || !(below.t > 0)) return null;
        h = (above.t + below.t) / 2;
        er = (above.er * above.t + below.er * below.t) / (above.t + below.t);
        refIds = [ids[i - 1], ids[i + 1]];
        if (Math.abs(above.t - below.t) / h > 0.2) warn.push('asym');
      }
      if (refIds.some(id => typeOf(id) === 'Signal')) warn.push('refsig');
      return { kind, h, er, t, ref: refIds.join('/'), warn };
    },

    totalThickness(d, state) {
      const ids = copperIds(state);
      let t = 0;
      ids.forEach(id => t += (d.oz[id] || 1) * OZ_MM);
      d.diel.forEach(x => t += (x.t || 0));
      return t;
    }
  };

  // ---------------- Via Padstack ----------------
  const Padstack = {
    // 預設 0.7/0.3 → 環寬 0.2mm。舊預設是 0.6/0.3，環寬只有 0.15mm，
    // 低於 JLCPCB 1–2 層的絕對下限 0.18mm：使用者拿預設值畫的板一律會被退件。
    // 0.2mm 過得了四家的絕對下限（JLC 0.18 / PCBWay 0.15 / OSH Park 0.127），
    // 但仍低於 JLC 的建議值 0.25，所以板廠檢查還是會給一條 warn，這是誠實的。
    load() { const d = store.get(PS_KEY, { od: 0.7, drill: 0.3 }); if (!(d.od > 0)) d.od = 0.7; if (!(d.drill > 0)) d.drill = 0.3; return d; },
    save(d) { store.set(PS_KEY, d); }
  };

  // ---------------- Backdrill ----------------
  const EPS = 0.05;
  const Backdrill = {
    loadCfg() { return store.get(BD_KEY, { classes: ['diff'] }); },
    saveCfg(c) { store.set(BD_KEY, c); },
    hash(state) {
      let sx = 0;
      (state.vias || []).forEach(v => sx += v.x + v.y);
      (state.traces || []).forEach(t => sx += t.x1 + t.y2);
      return (state.vias || []).length + '|' + (state.traces || []).length + '|' + sx.toFixed(2);
    },
    // 純函式：state + 銅層序 + net 篩選器（net => boolean，null＝全 net）→ 背鑽清單
    // 規則：via 所屬 net 在哪些銅層有走線端點（±EPS 命中 via 座標）＝實際使用層；
    //       頂側未用到的連續層段＝頂樁→自頂背鑽（must-not-cut＝最上使用層），底側同理。
    compute(state, copper, netFilter) {
      const out = [];
      if (copper.length < 4) return out; // 2 層板無殘樁可鑽
      for (const v of (state.vias || [])) {
        if (!v.net) continue;
        if (netFilter && !netFilter(v.net)) continue;
        const used = new Set();
        for (const t of (state.traces || [])) {
          if (t.net !== v.net) continue;
          if ((Math.hypot(t.x1 - v.x, t.y1 - v.y) < EPS) || (Math.hypot(t.x2 - v.x, t.y2 - v.y) < EPS)) {
            const i = copper.indexOf(t.layer || 'F.Cu');
            if (i >= 0) used.add(i);
          }
        }
        if (!used.size) continue;
        const minI = Math.min(...used), maxI = Math.max(...used);
        const d = (v.od || 0.6) + 0.2; // 背鑽刀徑＝via 外徑 + 0.2mm（常規過切）
        if (minI > 0) out.push({ x: v.x, y: v.y, d, side: 'T', to: copper[minI], removed: minI, net: v.net });
        if (maxI < copper.length - 1) out.push({ x: v.x, y: v.y, d, side: 'B', to: copper[maxI], removed: copper.length - 1 - maxI, net: v.net });
      }
      return out;
    },
    update() {
      const st = pcbApp.state;
      const cfg = this.loadCfg();
      const sel = new Set(cfg.classes);
      let netFilter = null;
      if (window.ConstraintMgr) {
        const cls = ConstraintMgr.load();
        netFilter = net => { const c = ConstraintMgr.classOf(cls, net); return !!c && sel.has(c.id); };
      }
      st.backdrills = this.compute(st, copperIds(st), netFilter);
      st._bdHash = this.hash(st);
      if (pcbApp.render) pcbApp.render();
      return st.backdrills;
    },
    status() {
      const st = (window.pcbApp && pcbApp.state) || {};
      const n = (st.backdrills || []).length;
      return { n, stale: n > 0 && st._bdHash !== this.hash(st) };
    },
    // 疊加畫在 via 上（pcb.js render 尾呼叫）
    draw(app, scale) {
      const st = app.state;
      if (!st.backdrills || !st.backdrills.length) return;
      const ctx = app.ctx;
      ctx.save();
      ctx.setLineDash([2, 2]);
      ctx.lineWidth = 1.2;
      for (const b of st.backdrills) {
        const sx = app.viewW / 2 + b.x * scale, sy = app.viewH / 2 + b.y * scale;
        ctx.strokeStyle = b.side === 'T' ? '#e67e22' : '#9b59b6';
        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(3, b.d / 2 * scale), 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
  };

  // ---------------- UI ----------------
  function renderPanel() {
    const host = document.getElementById('skPanel');
    if (!host || !window.pcbApp) return;
    const st = pcbApp.state;
    const ids = copperIds(st);
    const sk = Stackup.load(st);
    const ps = Padstack.load();
    const bd = Backdrill.loadCfg();
    const typeOf = id => { const l = (st.layerStack || []).find(x => x.id === id); return l ? (l.type || '') : ''; };

    // 疊層表：銅層列與介電列交錯
    let rows = '';
    ids.forEach((id, i) => {
      rows += `<tr style="background:var(--accent-soft)">
        <td style="padding:2px 6px;font-weight:600">${esc(id)}</td>
        <td style="padding:2px 6px;color:var(--muted)">${esc(typeOf(id))}</td>
        <td><select class="sk-oz" data-id="${esc(id)}" style="width:64px;padding:2px">${[0.5, 1, 2, 3].map(o => `<option value="${o}"${(sk.oz[id] || 1) === o ? ' selected' : ''}>${o} oz</option>`).join('')}</select></td>
        <td style="padding:2px 6px;color:var(--muted)">${((sk.oz[id] || 1) * OZ_MM).toFixed(3)}mm</td></tr>`;
      if (i < ids.length - 1) {
        const dl = sk.diel[i];
        rows += `<tr>
          <td style="padding:2px 6px;color:var(--muted)">${esc(T('sk_diel'))} ${i + 1}</td>
          <td style="padding:2px 6px;color:var(--muted)">FR-4</td>
          <td><input class="sk-t" data-i="${i}" type="number" step="0.05" min="0.05" value="${dl.t}" style="width:64px;padding:2px"></td>
          <td><input class="sk-er" data-i="${i}" type="number" step="0.1" min="1" value="${dl.er}" style="width:52px;padding:2px" title="εr"></td></tr>`;
      }
    });

    const clsList = window.ConstraintMgr ? ConstraintMgr.load().classes : [];
    const clsChecks = clsList.map(c =>
      `<label style="margin-right:8px;cursor:pointer"><input type="checkbox" class="bd-cls" value="${esc(c.id)}"${bd.classes.includes(c.id) ? ' checked' : ''}> ${esc(c.name)}</label>`).join('');

    host.innerHTML = `
      <table style="border-collapse:collapse;font-size:11px;width:100%">
        <tr style="color:var(--muted)"><td>${esc(T('sk_layer'))}</td><td>${esc(T('sk_type'))}</td><td>${esc(T('sk_thick'))}</td><td>εr / Cu</td></tr>
        ${rows}
      </table>
      <div style="display:flex;gap:8px;align-items:center;margin:6px 0;font-size:12px">
        <b>${esc(T('sk_total'))}: <span id="skTotal">${Stackup.totalThickness(sk, st).toFixed(3)}</span> mm</b>
        <button class="small-button" id="skToImp">${esc(T('sk_toimp'))}</button>
      </div>
      <div style="border-top:1px solid var(--line);margin:8px 0;padding-top:8px;font-size:12px">
        <b>${esc(T('ps_title'))}</b>
        <div style="display:flex;gap:8px;align-items:center;margin-top:4px;flex-wrap:wrap">
          <label>${esc(T('ps_od'))} <input id="psOd" type="number" step="0.05" min="0.2" value="${ps.od}" style="width:56px;padding:2px"></label>
          <label>${esc(T('ps_drill'))} <input id="psDrill" type="number" step="0.05" min="0.1" value="${ps.drill}" style="width:56px;padding:2px"></label>
          <button class="small-button" id="psApply">${esc(T('ps_apply'))}</button>
        </div>
      </div>
      <div style="border-top:1px solid var(--line);margin:8px 0;padding-top:8px;font-size:12px">
        <b>${esc(T('bd_title'))}</b>
        <div style="margin:4px 0">${esc(T('bd_classes'))}: ${clsChecks || '—'}</div>
        <button class="small-button" id="bdUpdate">${esc(T('bd_update'))}</button>
        <span id="bdOut" style="font-size:11px;color:var(--muted);margin-left:6px"></span>
      </div>`;

    const persistSk = () => {
      // 面板開著時板層數可能被改掉（套用板框設定）。不先對齊的話，
      // DOM 上新多出來的介電列會因為 sk.diel[i] 不存在而被丟掉，
      // 緊接著 Stackup.save 又把舊的短陣列寫回 localStorage，覆蓋掉正確資料。
      const curIds = copperIds(st);
      curIds.forEach(id => { if (!(sk.oz[id] > 0)) sk.oz[id] = 1; });
      const need = Math.max(0, curIds.length - 1);
      while (sk.diel.length < need) sk.diel.push({ t: 0.2, er: 4.4 });
      sk.diel.length = need;
      host.querySelectorAll('.sk-oz').forEach(s => sk.oz[s.dataset.id] = parseFloat(s.value) || 1);
      host.querySelectorAll('.sk-t').forEach(inp => { const i = +inp.dataset.i; if (sk.diel[i]) sk.diel[i].t = parseFloat(inp.value) || 0.2; });
      host.querySelectorAll('.sk-er').forEach(inp => { const i = +inp.dataset.i; if (sk.diel[i]) sk.diel[i].er = parseFloat(inp.value) || 4.4; });
      Stackup.save(sk);
      const el = document.getElementById('skTotal');
      if (el) el.textContent = Stackup.totalThickness(sk, st).toFixed(3);
    };
    host.addEventListener('change', e => {
      persistSk();
      const od = parseFloat(document.getElementById('psOd').value), dr = parseFloat(document.getElementById('psDrill').value);
      if (od > 0 && dr > 0 && dr < od) Padstack.save({ od, drill: dr });
      const sel = [...host.querySelectorAll('.bd-cls')].filter(c => c.checked).map(c => c.value);
      Backdrill.saveCfg({ classes: sel });
    });
    host.querySelector('#skToImp').addEventListener('click', () => {
      persistSk();
      // 舊版固定拿 diel[0] 與頂層銀，不管使用者實際在哪一層走線，
      // 內層走線會拿到錯的 h/εr 而且結構還用 microstrip。改成依當前畫線層推導。
      const layer = (pcbApp.state && pcbApp.state.traceLayer) || copperIds(st)[0];
      const gm = Stackup.geomFor(sk, st, layer);
      if (!gm) { if (pcbApp.toast) pcbApp.toast(T('sk_imp_nogeom', { layer }), 'warn'); return; }
      const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
      const kindSel = document.getElementById('impKind');
      const wantDiff = kindSel && /^diff-/.test(kindSel.value);
      set('impH', +gm.h.toFixed(4));
      set('impEr', +gm.er.toFixed(3));
      set('impT', gm.t.toFixed(3));
      if (kindSel) kindSel.value = (wantDiff ? 'diff-' : '') + gm.kind;
      if (pcbApp.runImpedance) pcbApp.runImpedance();
      const notes = gm.warn.map(w => T('sk_imp_' + w)).join('　│ ');
      if (pcbApp.toast) pcbApp.toast(T('sk_applied', { layer, kind: gm.kind, ref: gm.ref }) + (notes ? ' │ ' + notes : ''), gm.warn.length ? 'warn' : 'info');
    });
    host.querySelector('#psApply').addEventListener('click', () => {
      const p = Padstack.load();
      let n = 0;
      (st.vias || []).forEach(v => { if (v.user) { v.od = p.od; v.id = p.drill; n++; } });
      if (pcbApp.render) pcbApp.render();
      if (pcbApp.toast) pcbApp.toast(T('ps_applied', { n }), 'info');
    });
    host.querySelector('#bdUpdate').addEventListener('click', () => {
      const list = Backdrill.update();
      const t = list.filter(b => b.side === 'T').length, b = list.filter(x => x.side === 'B').length;
      document.getElementById('bdOut').textContent = list.length ? T('bd_result', { n: list.length, t, b }) : T('bd_none');
    });
  }

  if (typeof window !== 'undefined') {
    window.Stackup = Stackup;
    window.Padstack = Padstack;
    window.Backdrill = Backdrill;
    const mount = () => renderPanel();
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
    document.addEventListener('vs-lang-change', mount);
    // 層數變更後重繪疊層表
    const ab = document.getElementById('applyBoardSettings');
    if (ab) ab.addEventListener('click', () => setTimeout(mount, 50));
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { Stackup, Padstack, Backdrill };
})();
