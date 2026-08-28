/**
 * pcb-import-ui.js — 「匯入其它 EDA」面板的綁定
 *
 * 解析邏輯全在 gerber-import.js 與 alien-import.js（純函式、node 測得到）。
 * 這支只負責：收檔案、判格式、顯示報告、問確認、套用到板子。
 *
 * 為什麼一定要顯示報告：這幾種匯入**都是有損的**，而且損失的東西看不出來——
 * Gerber 沒有 net、Eagle 的封裝圖形不還原、Altium 根本解不了。
 * 使用者要在按下「套用」之前就知道自己會拿到什麼，不是事後才發現飛線全空。
 *
 * 載入順序：只在事件裡用到 pcbApp，可以排在 pcb.js 之後。
 */
(function () {
  'use strict';

  const T = (k, v) => (window.I18N ? window.I18N.t(k, v) : k);
  const el = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  let staged = null;      // { kind, board, report, warnings, files }

  // 副檔名 → 格式。Gerber 沒有統一副檔名（.gbr/.gtl/.gbl/.gko…），
  // 所以用「排除法」：認得的專有格式先挑掉，剩下的當 Gerber 試。
  function classify(name) {
    const n = String(name || '').toLowerCase();
    if (/\.kicad_pcb$/.test(n)) return 'kicad';
    if (/\.(pcbdoc|schdoc|pcblib|schlib)$/.test(n)) return 'altium';
    if (/\.brd$/.test(n)) return 'eagle-brd';
    if (/\.sch$/.test(n)) return 'eagle-sch';
    if (/\.asc$/.test(n)) return 'ltspice';
    if (/\.(drl|xln|txt|nc|exc)$/.test(n)) return 'drill';
    return 'gerber';
  }

  const readText = f => new Promise(res => {
    const r = new FileReader();
    r.onload = () => res(String(r.result || ''));
    r.onerror = () => res('');
    r.readAsText(f);
  });
  const readBytes = f => new Promise(res => {
    const r = new FileReader();
    r.onload = () => res(new Uint8Array(r.result));
    r.onerror = () => res(new Uint8Array());
    r.readAsArrayBuffer(f);
  });

  function line(txt, kind) {
    const color = kind === 'error' ? '#c0392b' : kind === 'warn' ? '#d35400' : 'var(--muted)';
    return '<div style="color:' + color + '">' + esc(txt) + '</div>';
  }

  function show(html) { const o = el('impOut2'); if (o) o.innerHTML = html; }

  async function onFiles(fileList) {
    const files = [...(fileList || [])];
    if (!files.length) return;
    staged = null;
    const applyBtn = el('impApply');
    if (applyBtn) applyBtn.disabled = true;

    const groups = {};
    for (const f of files) (groups[classify(f.name)] = groups[classify(f.name)] || []).push(f);

    // Altium：只辨識，不解析。先擋在最前面，免得使用者以為在跑
    if (groups.altium) {
      const f = groups.altium[0];
      const r = window.AlienImport.inspectAltium(await readBytes(f), f.name);
      const bits = [line(T('pj_imp_altium_no'), 'error')];
      if (r.isOle) {
        bits.push(line(T('pj_imp_altium_seen', { kind: r.kind || '?', n: r.storages.length })));
        if (r.storages.length) bits.push(line(r.storages.join(', ')));
        bits.push(line(T('pj_imp_altium_advice'), 'warn'));
      } else {
        bits.push(line(T('pj_imp_altium_bad')));
      }
      show(bits.join(''));
      return;
    }

    if (groups.kicad) {
      show(line(T('pj_imp_use_kicad_panel'), 'warn'));
      return;
    }

    if (groups.ltspice) {
      const f = groups.ltspice[0];
      const r = window.AlienImport.parseLtspice(await readText(f));
      const bits = [line(T('pj_imp_ltspice_sch', { n: r.report.components, w: r.report.wires }), 'warn')];
      if (r.report.unknown.length) bits.push(line(T('pj_imp_unknown', { list: r.report.unknown.join(', ') }), 'warn'));
      if (r.report.directives) bits.push(line(T('pj_imp_directives', { n: r.report.directives })));
      show(bits.join(''));
      return;
    }

    if (groups['eagle-sch']) {
      const f = groups['eagle-sch'][0];
      const r = window.AlienImport.parseEagleSch(await readText(f));
      const bits = [line(T('pj_imp_eagle_sch', { n: r.report.components, w: r.report.wires, nets: r.report.nets }), 'warn')];
      if (r.report.unknown.length) bits.push(line(T('pj_imp_unknown', { list: r.report.unknown.slice(0, 8).join(', ') }), 'warn'));
      show(bits.join(''));
      return;
    }

    if (groups['eagle-brd']) {
      const f = groups['eagle-brd'][0];
      const r = window.AlienImport.parseEagleBrd(await readText(f));
      staged = {
        kind: 'eagle',
        board: { traces: r.traces, vias: r.vias, outline: r.outline, components: r.components, pads: [] },
        report: r.report, warnings: r.warnings,
      };
      const bits = [line(T('pj_imp_eagle_brd', {
        n: r.report.components, t: r.report.traces, v: r.report.vias, o: r.report.outline,
      }))];
      bits.push(line(T('pj_imp_lossy_fp'), 'warn'));
      if (r.report.unknown.length) bits.push(line(T('pj_imp_unknown', { list: r.report.unknown.slice(0, 8).join(', ') }), 'warn'));
      show(bits.join(''));
      if (applyBtn) applyBtn.disabled = false;
      return;
    }

    // Gerber（可能一疊）＋ 鑽孔
    const layers = [], drills = [];
    for (const f of (groups.gerber || [])) layers.push({ name: f.name, text: await readText(f) });
    for (const f of (groups.drill || [])) drills.push({ name: f.name, text: await readText(f) });
    if (!layers.length && !drills.length) { show(line(T('pj_imp_nothing'), 'error')); return; }

    const b = window.GerberImport.toBoard(layers, drills);
    staged = { kind: 'gerber', board: b, report: b.report, warnings: b.warnings };

    const bits = [];
    bits.push(line(T('pj_imp_gerber', { t: b.report.traces, p: b.report.pads, v: b.report.vias, o: b.report.outline })));
    for (const L of b.report.layers) {
      bits.push(line('· ' + L.name + ' → ' + (L.layer || '?') +
        '（' + L.stats.lines + ' 線 / ' + L.stats.arcs + ' 弧 / ' + L.stats.flashes + ' 閃 / ' + L.stats.regions + ' 區）'));
    }
    // 有損的地方一定要講在按鈕上方
    bits.push(line(T('pj_imp_lossy_gerber'), 'warn'));
    if (b.report.regionsSkipped) bits.push(line(T('pj_imp_regions', { n: b.report.regionsSkipped }), 'warn'));
    const uniqW = [...new Set(b.warnings)];
    if (uniqW.length) bits.push(line(T('pj_imp_warn', { list: uniqW.slice(0, 6).join('; ') }), 'warn'));
    show(bits.join(''));
    if (applyBtn) applyBtn.disabled = false;
  }

  function apply() {
    const app = window.pcbApp;
    if (!app || !staged) return;
    const n = (staged.board.traces || []).length + (staged.board.vias || []).length +
      (staged.board.components || []).length;
    // 蓋掉現有板子會弄丟工作，而且匯入來的東西沒有 net——先講清楚再問
    if (!window.confirm(T('pj_imp_confirm', { n }))) return;

    app.hist();
    const s = app.state;
    if (staged.kind === 'gerber') {
      s.traces = (staged.board.traces || []).slice();
      s.vias = (staged.board.vias || []).slice();
      // Gerber 的閃光轉成 pad，但它們不屬於任何元件——包成一顆「匯入」的假元件，
      // 不然這些 pad 進不了任何需要 component 的流程（DRC 的 pad 檢查、CPL、ODB++）。
      const pads = staged.board.pads || [];
      s.components = pads.length ? [{
        id: 'imp-gerber', ref: 'IMPORT', part: 'gerber', x: 0, y: 0, rot: 0, side: 'top',
        kind: 'part', w: 1, h: 1,
        pads: pads.map(p => Object.assign({}, p, { side: /B\.Cu/.test(p.layer) ? 'B' : 'F' })),
      }] : [];
      s.outline = (staged.board.outline || []).slice();
    } else {
      s.traces = (staged.board.traces || []).slice();
      s.vias = (staged.board.vias || []).slice();
      s.components = (staged.board.components || []).slice();
      s.outline = (staged.board.outline || []).slice();
    }
    s.selected = null; s.selectedSet = null; s.ratsnest = null;

    app.renderLayerList && app.renderLayerList();
    app.renderPartsList && app.renderPartsList();
    app.syncSelPanel && app.syncSelPanel();
    app.render();
    if (app.renderNetPanel) app.renderNetPanel();
    app.toast(T('pj_imp_applied', { n }), 'info');
    const applyBtn = el('impApply');
    if (applyBtn) applyBtn.disabled = true;
    staged = null;
  }

  function boot() {
    const input = el('impFiles');
    if (!input) return;
    input.addEventListener('change', e => onFiles(e.target.files));
    el('impApply')?.addEventListener('click', apply);
    const paint = () => { const h = el('impHint2'); if (h) h.textContent = T('pj_imp_hint'); };
    paint();
    document.addEventListener('vs-lang-change', paint);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
