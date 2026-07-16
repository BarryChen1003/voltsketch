// PCB Layout Application
// i18n：I18N 未載時回 key（pcb.html 先載 i18n.js）
const pcbT = (k, vars) => window.I18N ? window.I18N.t(k, vars) : k;
const pcbApp = {
  canvas: null,
  ctx: null,
  state: {
    tool: 'select',
    zoom: 1,
    panX: 0,
    panY: 0,
    boardWidth: 100,
    boardHeight: 80,
    layers: 2,
    visibleLayers: ['F.Cu', 'B.Cu', 'F.SilkS', 'Edge.Cuts'],
    components: [],
    traces: [],
    vias: [],
    nets: [],
    selected: null,
    isDragging: false,
    isPanning: false,
    lastMouse: { x: 0, y: 0 },
    refBoard: null,      // 疊加比較用的公版方塊（ghost 繪製）
    refOverlayId: null,  // 目前疊加中的公版 id
    zones: [],           // KiCad 鋪銅外框（渲染用）
    edgeSegs: [],        // 非矩形板框線段（KiCad Edge.Cuts）
    kicad: null,         // { tree, off } — KiCad 匯入樹（零落差匯出用）
    traceWidth: 0.3,     // 畫線線寬（#traceWidth）
    traceLayer: 'F.Cu',  // 畫線層（#traceLayer）
    traceDraw: null,     // 進行中走線 {x1,y1,x2,y2,net}
    showRatsnest: false, // 顯示飛線
    ratsnest: null,      // 飛線快取（null=待重算）
    netRules: [],        // Layout 規則（NetRules）
    userZones: [],       // 使用者畫的鋪銅 {layer,net,pts,clearance}
    zoneDraw: null       // 進行中 zone {pts, net, cursor:[x,y]}
  },
  gridSize: 1, // 1mm

  init() {
    this.canvas = document.querySelector('#pcbCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.state.layerStack = this.buildLayerStack(this.state.layers);
    this.state.visibleLayers = this.state.layerStack.map(l => l.id);
    this.resizeCanvas();
    this.bindEvents();
    this.renderLayerList();
    this.renderPartsList();
    this.populateEmiSelects();
    this.renderRefBoards();
    this.populateIcPicker();
    this.populatePartsPicker();
    this.state.netRules = window.NetRules ? window.NetRules.load() : [];
    this.renderNetRules();
    this.render();
  },

  // 依層數產生疊層：F.Cu(頂) + In1..In(n-2) + B.Cu(底) + 絲印/板框
  buildLayerStack(n) {
    n = Math.max(1, Math.min(40, n || 2));
    const palette = ['#e74c3c', '#3498db', '#16a085', '#9b59b6', '#e67e22', '#2ecc71', '#f39c12', '#1abc9c', '#c0392b', '#2980b9', '#8e44ad', '#d35400'];
    const cu = [{ id: 'F.Cu', name: 'F.Cu (頂層)', type: 'Signal' }];
    for (let i = 1; i <= n - 2; i++) cu.push({ id: 'In' + i + '.Cu', name: 'In' + i + '.Cu (內層)', type: (i % 2 ? 'GND' : 'PWR') });
    if (n >= 2) cu.push({ id: 'B.Cu', name: 'B.Cu (底層)', type: 'Signal' });
    cu.forEach((l, i) => { l.color = palette[i % palette.length]; l.kind = 'copper'; });
    return cu.concat([
      { id: 'F.SilkS', name: 'F.SilkS (絲印)', color: '#f1c40f', kind: 'silk' },
      { id: 'B.SilkS', name: 'B.SilkS (底絲印)', color: '#b7950b', kind: 'silk' },
      { id: 'Edge.Cuts', name: 'Edge.Cuts (板框)', color: '#95a5a6', kind: 'edge' }
    ]);
  },

  // 層顯示名依當前語言派生（layerStack.name 存 zh，不直接用）
  layerDispName(l) {
    const sfx = l.id === 'F.Cu' ? 'pj_layer_top'
      : l.id === 'B.Cu' ? 'pj_layer_bottom'
      : /^In\d+\.Cu$/.test(l.id) ? 'pj_layer_inner'
      : l.id === 'F.SilkS' ? 'pj_layer_silk'
      : l.id === 'B.SilkS' ? 'pj_layer_bsilk'
      : l.id === 'Edge.Cuts' ? 'pj_layer_edge' : null;
    return sfx ? `${l.id} (${pcbT(sfx)})` : (l.name || l.id);
  },

  renderLayerList() {
    const el = document.getElementById('layerList');
    if (!el) return;
    const cnt = {};
    this.state.traces.forEach(t => { const k = t.layer || 'F.Cu'; cnt[k] = (cnt[k] || 0) + 1; });
    el.innerHTML = (this.state.layerStack || []).map(l => {
      const vis = this.state.visibleLayers.includes(l.id);
      const n = cnt[l.id] ? `<span style="font-size:10px;color:var(--muted);margin-left:4px">${pcbT('pj_seg_count', { n: cnt[l.id] })}</span>` : '';
      const typeSel = l.kind === 'copper'
        ? `<select class="layer-type" data-layer="${l.id}" style="margin-left:auto;font-size:11px;padding:1px 4px;" onclick="event.stopPropagation()">` +
        ['Signal', 'GND', 'PWR', 'Mixed'].map(t => `<option ${l.type === t ? 'selected' : ''}>${t}</option>`).join('') + `</select>`
        : '';
      return `<div class="layer-item" data-layer="${l.id}"><div class="layer-color" style="background:${l.color}"></div>` +
        `<span class="layer-name">${this.layerDispName(l)}</span>${n}${typeSel}<span class="layer-visibility" style="opacity:${vis ? 1 : 0.3};margin-left:8px">👁</span></div>`;
    }).join('');
    this.populateTraceLayerSel();
  },

  resizeCanvas() {
    const container = this.canvas.parentElement;
    this.canvas.width = container.clientWidth;
    this.canvas.height = container.clientHeight;
    this.render();
  },

  render() {
    const { ctx, canvas, state } = this;
    const { zoom, panX, panY, boardWidth, boardHeight } = state;

    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate scale (1mm = 10px at 100% zoom)
    const scale = 10 * zoom;

    // Save context
    ctx.save();

    // Apply pan
    ctx.translate(panX, panY);

    // Draw board outline
    this.drawBoard(scale);

    // Draw grid
    this.drawGrid(scale);

    // Draw zones（鋪銅外框，墊底）
    this.drawZones(scale);

    // 使用者鋪銅（顯示端避讓打洞）
    this.drawUserZones(scale);

    // Draw components
    this.drawComponents(scale);

    // Draw traces
    this.drawTraces(scale);

    // Draw vias
    this.drawVias(scale);

    // 絲印（KiCad 匯入的 footprint 圖形與文字）
    this.drawSilk(scale);

    // 飛線與畫線預覽
    this.drawRatsnest(scale);
    this.drawTracePreview(scale);

    // Draw EMI 環路疊圖
    this.drawEmiLoops(scale);

    // Restore context
    ctx.restore();
  },

  drawBoard(scale) {
    const { ctx, state } = this;
    const { boardWidth, boardHeight } = state;

    const x = (this.canvas.width / 2 - (boardWidth * scale) / 2);
    const y = (this.canvas.height / 2 - (boardHeight * scale) / 2);
    const w = boardWidth * scale;
    const h = boardHeight * scale;

    // Board fill
    ctx.fillStyle = '#2d4a3e';
    ctx.fillRect(x, y, w, h);

    // Board outline
    ctx.strokeStyle = '#7f8c8d';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // 非矩形板框（KiCad Edge.Cuts）：精確線段疊繪
    if (state.edgeSegs && state.edgeSegs.length && state.visibleLayers.includes('Edge.Cuts')) {
      ctx.strokeStyle = '#bdc3c7';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      state.edgeSegs.forEach(s => {
        ctx.moveTo(this.canvas.width / 2 + s.x1 * scale, this.canvas.height / 2 + s.y1 * scale);
        ctx.lineTo(this.canvas.width / 2 + s.x2 * scale, this.canvas.height / 2 + s.y2 * scale);
      });
      ctx.stroke();
    }

    // Draw board dimensions
    ctx.fillStyle = '#ecf0f1';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${boardWidth}mm`, x + w / 2, y - 10);
    ctx.save();
    ctx.translate(x - 10, y + h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${boardHeight}mm`, 0, 0);
    ctx.restore();
  },

  drawZones(scale) {
    const { ctx, state } = this;
    if (!state.zones || !state.zones.length) return;
    const layerOf = id => (state.layerStack || []).find(l => l.id === id);
    state.zones.forEach(z => {
      if (!state.visibleLayers.includes(z.layer)) return;
      const ldef = layerOf(z.layer);
      ctx.save();
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = ldef ? ldef.color : '#16a085';
      ctx.beginPath();
      z.pts.forEach((p, i) => {
        const sx = this.canvas.width / 2 + p[0] * scale, sy = this.canvas.height / 2 + p[1] * scale;
        i ? ctx.lineTo(sx, sy) : ctx.moveTo(sx, sy);
      });
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = ldef ? ldef.color : '#16a085';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    });
  },

  // KiCad footprint 旋轉：abs = at + R(θ)·rel（y 向下座標系，θ 度、視覺逆時針）
  padAbs(comp, pad) {
    const th = (comp.rot || 0) * Math.PI / 180;
    const c = Math.cos(th), s = Math.sin(th);
    return { x: comp.x + pad.x * c + pad.y * s, y: comp.y - pad.x * s + pad.y * c };
  },

  drawPads(comp, scale) {
    const { ctx, state } = this;
    const layerOf = id => (state.layerStack || []).find(l => l.id === id);
    const fCol = (layerOf('F.Cu') || {}).color || '#e74c3c';
    const bCol = (layerOf('B.Cu') || {}).color || '#3498db';
    const fVis = state.visibleLayers.includes('F.Cu'), bVis = state.visibleLayers.includes('B.Cu');
    comp.pads.forEach(pad => {
      if (pad.cu === false) return; // paste/mask-only 開窗非銅
      if (pad.side === 'F' && !fVis) return;
      if (pad.side === 'B' && !bVis) return;
      if (pad.side === '*' && !fVis && !bVis) return;
      const p = this.padAbs(comp, pad);
      const sx = this.canvas.width / 2 + p.x * scale, sy = this.canvas.height / 2 + p.y * scale;
      const w = Math.max(1, pad.w * scale), h = Math.max(1, pad.h * scale);
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(-(pad.rot || 0) * Math.PI / 180);
      ctx.fillStyle = pad.side === 'B' ? bCol : (pad.side === '*' ? '#c8a165' : fCol);
      if (pad.shape === 'circle' || pad.shape === 'oval') {
        ctx.beginPath();
        ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-w / 2, -h / 2, w, h);
      }
      if (pad.drill > 0) {
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(0.5, pad.drill / 2 * scale), 0, Math.PI * 2);
        ctx.fillStyle = '#1a1a2e';
        ctx.fill();
      }
      ctx.restore();
    });
  },

  drawGrid(scale) {
    const { ctx, state } = this;
    const { boardWidth, boardHeight } = state;

    const startX = (this.canvas.width / 2 - (boardWidth * scale) / 2);
    const startY = (this.canvas.height / 2 - (boardHeight * scale) / 2);
    const endX = startX + boardWidth * scale;
    const endY = startY + boardHeight * scale;

    ctx.strokeStyle = '#3d5a4e';
    ctx.lineWidth = 0.5;

    // Vertical lines
    for (let x = startX; x <= endX; x += scale) {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = startY; y <= endY; y += scale) {
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }
  },

  // kind → 填色（top 面）；bottom 面統一偏藍且僅在 B.Cu 可見時畫
  compFill(comp) {
    if (comp.side === 'bottom') return '#1f3a5f';
    return { ic: '#34495e', passive: '#3f5561', conn: '#6e5b1e', mech: '#4a4a55' }[comp.kind] || '#34495e';
  },

  compVisible(comp) {
    const v = this.state.visibleLayers;
    return comp.side === 'bottom' ? v.includes('B.Cu') : (v.includes('F.Cu') || v.includes('F.SilkS'));
  },

  // 元件實際尺寸（mm）；舊資料/手放元件退回 4×3mm
  compRect(comp, scale) {
    const w = (comp.w || 4) * scale, h = (comp.h || 3) * scale;
    const x = this.canvas.width / 2 + comp.x * scale - w / 2;
    const y = this.canvas.height / 2 + comp.y * scale - h / 2;
    return { x, y, w, h };
  },

  drawComponents(scale) {
    const { ctx, state } = this;

    // 公版疊加比較：ghost（虛線、半透明橙）繪於底層
    if (state.refBoard && state.refBoard.length) {
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.setLineDash([4, 3]);
      state.refBoard.forEach(b => {
        const r = this.compRect(b, scale);
        ctx.strokeStyle = '#e67e22';
        ctx.lineWidth = 1;
        ctx.strokeRect(r.x, r.y, r.w, r.h);
        ctx.fillStyle = '#e67e22';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(b.label || b.ref || '', r.x + r.w / 2, r.y + r.h / 2 + 3);
      });
      ctx.restore();
    }

    state.components.forEach(comp => {
      if (!this.compVisible(comp)) return;
      const r = this.compRect(comp, scale);
      const sel = state.selected === comp;

      if (comp.pads && comp.pads.length) {
        // KiCad 精確元件：畫 pad 幾何 + 旋轉外形框，不畫實心方塊
        ctx.save();
        ctx.translate(r.x + r.w / 2, r.y + r.h / 2);
        ctx.rotate(-(comp.rot || 0) * Math.PI / 180);
        ctx.strokeStyle = sel ? '#f39c12' : (comp.side === 'bottom' ? '#5dade2' : 'rgba(236,240,241,0.55)');
        ctx.lineWidth = sel ? 2 : 1;
        ctx.strokeRect(-r.w / 2, -r.h / 2, r.w, r.h);
        ctx.restore();
        this.drawPads(comp, scale);
        const label = comp.ref || comp.label || '';
        if (label && (sel || r.w >= 18)) {
          ctx.fillStyle = sel ? '#f39c12' : '#bdc3c7';
          ctx.font = '9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(label, r.x + r.w / 2, r.y - 3);
        }
        return;
      }

      ctx.save();
      ctx.translate(r.x + r.w / 2, r.y + r.h / 2);
      ctx.rotate(-(comp.rot || 0) * Math.PI / 180);
      ctx.fillStyle = this.compFill(comp);
      ctx.fillRect(-r.w / 2, -r.h / 2, r.w, r.h);
      ctx.strokeStyle = sel ? '#f39c12' : (comp.side === 'bottom' ? '#5dade2' : '#ecf0f1');
      ctx.lineWidth = sel ? 2 : 1;
      ctx.strokeRect(-r.w / 2, -r.h / 2, r.w, r.h);
      ctx.restore();

      // 標籤：夠大才畫（避免小 R/C 糊成一片）；選取中一律畫
      const label = comp.label || comp.ref || '';
      if (label && (sel || r.w >= 26)) {
        ctx.fillStyle = sel ? '#f39c12' : '#ecf0f1';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(label, r.x + r.w / 2, r.y + r.h / 2 + 3);
      } else if (label && r.w >= 10) {
        ctx.fillStyle = '#bdc3c7';
        ctx.font = '7px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(comp.ref || label, r.x + r.w / 2, r.y - 2);
      }
    });
  },

  drawTraces(scale) {
    const { ctx, state } = this;
    const layerOf = id => (state.layerStack || []).find(l => l.id === id);
    ctx.save();
    ctx.lineCap = 'round';
    state.traces.forEach(trace => {
      const lid = trace.layer || 'F.Cu';
      if (!state.visibleLayers.includes(lid)) return;
      const ldef = layerOf(lid);
      ctx.strokeStyle = ldef ? ldef.color : '#e74c3c';
      ctx.lineWidth = Math.max(1, (trace.width || 0.3) * scale);
      ctx.globalAlpha = lid === 'F.Cu' ? 1 : 0.85;
      ctx.beginPath();
      ctx.moveTo(this.canvas.width / 2 + trace.x1 * scale, this.canvas.height / 2 + trace.y1 * scale);
      ctx.lineTo(this.canvas.width / 2 + trace.x2 * scale, this.canvas.height / 2 + trace.y2 * scale);
      ctx.stroke();
    });
    ctx.restore();
  },

  drawVias(scale) {
    const { ctx, state } = this;
    const anyCu = state.visibleLayers.some(id => (state.layerStack || []).find(l => l.id === id && l.kind === 'copper'));
    if (!anyCu) return;
    state.vias.forEach(v => {
      const x = this.canvas.width / 2 + v.x * scale;
      const y = this.canvas.height / 2 + v.y * scale;
      const ro = Math.max(2, (v.od || 0.6) / 2 * scale), ri = Math.max(1, (v.id || 0.3) / 2 * scale);
      ctx.beginPath(); ctx.arc(x, y, ro, 0, Math.PI * 2); ctx.fillStyle = '#b8c2cc'; ctx.fill();
      ctx.beginPath(); ctx.arc(x, y, ri, 0, Math.PI * 2); ctx.fillStyle = '#1a1a2e'; ctx.fill();
    });
  },

  setTool(tool) {
    this.state.tool = tool;
    document.querySelectorAll('.pcb-tool-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tool === tool);
    });
  },

  zoomIn() {
    this.state.zoom = Math.min(3, this.state.zoom * 1.2);
    document.querySelector('#zoomLevel').textContent = `${Math.round(this.state.zoom * 100)}%`;
    this.render();
  },

  zoomOut() {
    this.state.zoom = Math.max(0.3, this.state.zoom / 1.2);
    document.querySelector('#zoomLevel').textContent = `${Math.round(this.state.zoom * 100)}%`;
    this.render();
  },

  zoomFit() {
    this.state.zoom = 1;
    this.state.panX = 0;
    this.state.panY = 0;
    document.querySelector('#zoomLevel').textContent = '100%';
    this.render();
  },

  runDrc() {
    const results = [];
    const rules = this.loadDrcRules();

    // Check board dimensions
    if (this.state.boardWidth < 10 || this.state.boardHeight < 10) {
      results.push({
        type: 'warning',
        message: pcbT('pj_drc_board_small')
      });
    }

    // Check component count
    if (this.state.components.length === 0) {
      results.push({
        type: 'info',
        message: pcbT('pj_drc_no_comp')
      });
    }

    // Check trace count
    if (this.state.traces.length === 0) {
      results.push({
        type: 'info',
        message: pcbT('pj_drc_no_trace')
      });
    }

    // 走線間距改由 pad 級 DRC 檢查（線寬/net/層感知，見 pcb-drc.js）

    // Check trace width
    this.state.traces.forEach(trace => {
      const width = trace.width || 0.3;
      if (width < rules.width.minTrace) {
        results.push({
          type: 'warning',
          message: pcbT('pj_drc_thin', { w: width, lim: rules.width.minTrace })
        });
      }
    });

    // Check via count
    if (this.state.vias.length === 0 && this.state.traces.length > 10) {
      results.push({
        type: 'info',
        message: pcbT('pj_drc_use_via')
      });
    }

    // Check unconnected nets
    const nets = new Set(this.state.traces.map(t => t.net).filter(Boolean));
    if (nets.size < this.state.components.length / 2) {
      results.push({
        type: 'warning',
        message: pcbT('pj_drc_unconnected')
      });
    }

    // 電源網路線寬不足（net 名含 VCC/VIN/VDD/PWR/GND/PGND/SW/V+ → 視為電源/大電流）：按 net 聚合
    const powerThin = {};
    this.state.traces.forEach(t => {
      if (t.net && /vcc|vin|vdd|pwr|pgnd|gnd|^sw$|v\+|bat/i.test(t.net)) {
        const w = t.width || 0.3;
        if (w < rules.width.minPowerTrace) {
          const e = powerThin[t.net] || (powerThin[t.net] = { n: 0, min: w });
          e.n++; e.min = Math.min(e.min, w);
        }
      }
    });
    Object.entries(powerThin).forEach(([net, e]) =>
      results.push({ type: 'warning', message: pcbT('pj_drc_power_thin', { net, n: e.n, lim: rules.width.minPowerTrace, min: e.min }) }));

    // 走線距板邊太近：有真實板框幾何（KiCad 匯入）時由 pad 級 DRC 用 edgeSegs 算，這裡只做矩形近似
    if (!(this.state.edgeSegs || []).length) {
      const halfW = this.state.boardWidth / 2, halfH = this.state.boardHeight / 2;
      const edgeGap = (x, y) => Math.min(halfW - Math.abs(x), halfH - Math.abs(y));
      this.state.traces.forEach((t, i) => {
        const g = Math.min(edgeGap(t.x1, t.y1), edgeGap(t.x2, t.y2));
        if (g < rules.clearance.traceToEdge)
          results.push({ type: g < 0 ? 'error' : 'warning', message: pcbT('pj_drc_edge_near', { i: i + 1, d: g.toFixed(2), lim: rules.clearance.traceToEdge }) });
      });
    }

    // 元件間距過近 / 重疊（中心距近似——只適用手放教學方塊；
    // KiCad 匯入元件有真幾何交給 pad 級 DRC，絲印/logo footprint 無銅不檢）
    const comps = this.state.components;
    const hasGeom = c => (c.pads || []).length > 0 || !!c.kicadNode;
    for (let i = 0; i < comps.length; i++)
      for (let j = i + 1; j < comps.length; j++) {
        if (hasGeom(comps[i]) && hasGeom(comps[j])) continue;
        const d = Math.hypot(comps[i].x - comps[j].x, comps[i].y - comps[j].y);
        if (d < rules.compSpacing)
          results.push({ type: d < rules.compSpacing / 2 ? 'error' : 'warning', message: pcbT('pj_drc_comp_close', { a: comps[i].label, b: comps[j].label, d: d.toFixed(2), lim: rules.compSpacing }) });
      }

    // Cin → IC 距離（沿用 EMI 角色指派）
    const byId = {}; comps.forEach(c => { byId[c.id] = c; });
    const cinSel = document.querySelector('.emi-role[data-role="cin"]'), icSel = document.querySelector('.emi-role[data-role="ic"]');
    const cin = cinSel && byId[cinSel.value], ic = icSel && byId[icSel.value];
    if (cin && ic) {
      const d = Math.hypot(cin.x - ic.x, cin.y - ic.y);
      if (d > rules.cinDist)
        results.push({ type: 'warning', message: pcbT('pj_drc_cin_far', { d: d.toFixed(2), lim: rules.cinDist }) });
    }

    // 多層板電源/地平面建議
    const cu = (this.state.layerStack || []).filter(l => l.kind === 'copper');
    if (cu.length >= 4 && !cu.some(l => l.type === 'GND'))
      results.push({ type: 'info', message: pcbT('pj_drc_gnd_plane') });

    // pad 級 DRC：真 pad 幾何算間距/環寬/鑽孔餘裕（pcb-drc.js）
    if (window.PadDrc) results.push(...window.PadDrc.run(this.state, this.padAbs.bind(this), rules));
    else results.push({ type: 'info', message: pcbT('pj_drc_no_paddrc') });

    // Layout 規則稽核（net 線寬下限/線長上限/差分對長度差）
    if (window.NetRules) results.push(...window.NetRules.audit(this.state.netRules || [], this.state));

    // Constraint Manager：class 線寬/線長/類別間距矩陣/銳角
    if (window.ConstraintMgr) results.push(...window.ConstraintMgr.audit(window.ConstraintMgr.load(), this.state, rules.clearance.traceToTrace));

    // 未連線統計（飛線）
    if (window.Ratsnest) {
      const rl = window.Ratsnest.compute(this.state, this.padAbs.bind(this));
      if (rl.length) results.push({ type: 'warning', message: pcbT('pj_drc_ratsnest', { n: rl.length }) });
    }

    // Display results
    const container = document.querySelector('#drcResults');
    const errorCount = results.filter(r => r.type === 'error').length;
    const warningCount = results.filter(r => r.type === 'warning').length;
    const infoCount = results.filter(r => r.type === 'info').length;

    if (results.length === 0) {
      container.innerHTML = `<p style="color: var(--accent-strong); padding: 12px;">${pcbT('pj_drc_pass')}</p>`;
    } else {
      let header = `<div style="padding: 8px; border-bottom: 1px solid var(--line); font-size: 12px;">`;
      if (errorCount > 0) header += `<span style="color: var(--danger);">${pcbT('pj_drc_err_n', { n: errorCount })}</span> `;
      if (warningCount > 0) header += `<span style="color: var(--warn);">${pcbT('pj_drc_warn_n', { n: warningCount })}</span> `;
      if (infoCount > 0) header += `<span style="color: var(--accent-strong);">${pcbT('pj_drc_info_n', { n: infoCount })}</span>`;
      header += `</div>`;

      container.innerHTML = header + results.map(r => `
        <div class="drc-item">
          <div class="drc-icon ${r.type}">${r.type === 'error' ? '✕' : r.type === 'warning' ? '!' : 'i'}</div>
          <span>${r.message}</span>
        </div>
      `).join('');
    }
    return results;
  },

  loadDrcRules() {
    const v = (id, d) => { const el = document.getElementById(id); const n = el ? parseFloat(el.value) : NaN; return isNaN(n) ? d : n; };
    const cl = v('ruleClearance', 0.15);
    return {
      clearance: { traceToTrace: cl, traceToPad: cl, padToPad: cl, traceToEdge: v('ruleEdge', 0.3), viaToVia: cl, holeToHole: 0.25 },
      width: { minTrace: v('ruleMinTrace', 0.1), maxTrace: 20, minPowerTrace: v('ruleMinPower', 0.3) },
      via: { minDrill: 0.2, minRing: 0.15 },
      maskSliver: v('ruleMaskSliver', 0.15),
      compSpacing: v('ruleCompSpace', 2),
      cinDist: v('ruleCinDist', 5)
    };
  },

  calculateTraceDistance(trace1, trace2) {
    // Simple distance calculation between two line segments
    const x1 = trace1.x1, y1 = trace1.y1;
    const x2 = trace1.x2, y2 = trace1.y2;
    const x3 = trace2.x1, y3 = trace2.y1;
    const x4 = trace2.x2, y4 = trace2.y2;

    // Calculate minimum distance between line segments
    const d1 = this.pointToSegmentDistance(x1, y1, x3, y3, x4, y4);
    const d2 = this.pointToSegmentDistance(x2, y2, x3, y3, x4, y4);
    const d3 = this.pointToSegmentDistance(x3, y3, x1, y1, x2, y2);
    const d4 = this.pointToSegmentDistance(x4, y4, x1, y1, x2, y2);

    return Math.min(d1, d2, d3, d4);
  },

  pointToSegmentDistance(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len2 = dx * dx + dy * dy;

    if (len2 === 0) return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);

    let t = ((px - x1) * dx + (py - y1) * dy) / len2;
    t = Math.max(0, Math.min(1, t));

    const projX = x1 + t * dx;
    const projY = y1 + t * dy;

    return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
  },

  addComponent(type, x, y) {
    const comp = {
      id: `comp-${Date.now()}`,
      type,
      x,
      y,
      label: `${type}${this.state.components.length + 1}`
    };
    this.state.components.push(comp);
    this.populateEmiSelects();
    this.renderPartsList();
    this.render();
  },

  // ---- 開源公版：載入起手板 / 疊加比較 ----
  renderRefBoards() {
    const host = document.querySelector('#refBoardList');
    if (!host) return;
    const boards = window.PCB_REFBOARDS || [];
    host.innerHTML = boards.map(b => `
      <div class="ref-card" style="border:1px solid var(--line);border-radius:10px;padding:12px;background:var(--panel-soft)">
        <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap">
          <b style="color:var(--ink);font-size:14px">${b.name}</b>
          <span style="font-size:11px;color:var(--accent-strong)">${b.soc} · ${pcbT('pj_ref_layers', { n: b.layers })} · ${b.w}×${b.h}mm</span>
        </div>
        <div style="font-size:12px;color:var(--muted);margin:6px 0;line-height:1.6">${b.note}</div>
        <ul style="margin:6px 0;padding-left:16px;font-size:12px;color:var(--muted);line-height:1.6">
          ${b.circuits.map(c => `<li>${c}</li>`).join('')}
        </ul>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">
          <button class="primary-button ref-load" data-refid="${b.id}" style="padding:6px 12px;font-size:12px">📥 ${pcbT('pj_ref_load')}</button>
          <button class="icon-button ref-overlay" data-refid="${b.id}" style="padding:6px 12px;font-size:12px">🔍 ${pcbT('pj_ref_overlay')}</button>
          <a href="${b.github}" target="_blank" rel="noopener" style="padding:6px 12px;font-size:12px;color:var(--accent-strong);text-decoration:none;align-self:center">${pcbT('pj_ref_source')} ↗</a>
        </div>
      </div>`).join('');
  },

  // ---- KiCad 匯入/匯出（kicad-io.js）----
  importKicad(text, fileName) {
    let parsed;
    try { parsed = window.KicadIO.importText(text); }
    catch (err) { alert(pcbT('pj_kicad_parse_fail', { err: err.message })); return false; }
    const m = parsed.model;
    const off = { x: m.bbox.x + m.bbox.w / 2, y: m.bbox.y + m.bbox.h / 2 }; // 置中偏移（匯出時還原）
    const s = this.state;
    s.boardWidth = Math.round(m.bbox.w * 100) / 100;
    s.boardHeight = Math.round(m.bbox.h * 100) / 100;
    s.layers = Math.max(2, m.cuLayers.length);
    s.layerStack = this.buildLayerStack(s.layers);
    s.visibleLayers = s.layerStack.map(l => l.id);
    s.components = m.comps.map((c, i) => ({
      id: `kicad-${i}`, type: 'ic',
      x: c.kx - off.x, y: c.ky - off.y, rot: c.rot,
      w: c.bw, h: c.bh,
      side: c.layer === 'B.Cu' ? 'bottom' : 'top',
      kind: 'ic', ref: c.ref, part: c.value || c.lib, label: c.ref,
      pads: c.pads, kicadNode: c.node,
      kicadTexts: c.texts, kicadRot0: c.rot,
      silk: c.silk, silkTexts: c.silkTexts, crtyd: c.crtyd
    }));
    s.silkGr = (m.silkGr || []).map(g => {
      const o = { ...g };
      if (g.kind === 'line') { o.x1 -= off.x; o.y1 -= off.y; o.x2 -= off.x; o.y2 -= off.y; }
      else if (g.kind === 'circle') { o.cx -= off.x; o.cy -= off.y; }
      else if (g.kind === 'arc') { o.x1 -= off.x; o.y1 -= off.y; o.xm -= off.x; o.ym -= off.y; o.x2 -= off.x; o.y2 -= off.y; }
      return o;
    });
    s.traces = m.traces.map((t, i) => ({
      id: `kicad-t-${i}`, x1: t.x1 - off.x, y1: t.y1 - off.y, x2: t.x2 - off.x, y2: t.y2 - off.y,
      width: t.width, layer: t.layer, net: t.net
    }));
    s.vias = m.vias.map(v => ({ x: v.x - off.x, y: v.y - off.y, od: v.od, id: v.id, net: v.net }));
    s.zones = m.zones.map(z => ({ layer: z.layer, net: z.net, pts: z.pts.map(p => [p[0] - off.x, p[1] - off.y]) }));
    s.zoneFills = m.zoneFills.map(z => ({ layer: z.layer, net: z.net, pts: z.pts.map(p => [p[0] - off.x, p[1] - off.y]) }));
    s.kicadArcs = m.arcsRaw.map(a => ({ ...a, x1: a.x1 - off.x, y1: a.y1 - off.y, xm: a.xm - off.x, ym: a.ym - off.y, x2: a.x2 - off.x, y2: a.y2 - off.y }));
    s.edgeSegs = m.edgeSegs.map(e => ({ x1: e.x1 - off.x, y1: e.y1 - off.y, x2: e.x2 - off.x, y2: e.y2 - off.y }));
    s.kicad = { tree: parsed.tree, off, fileName: fileName || 'board.kicad_pcb' };
    s.refBoard = null; s.refOverlayId = null; s.selected = null; s.ratsnest = null;
    this.syncSelPanel();
    const wI = document.querySelector('#boardWidth'), hI = document.querySelector('#boardHeight'), lI = document.querySelector('#boardLayers');
    if (wI) wI.value = s.boardWidth; if (hI) hI.value = s.boardHeight; if (lI) lI.value = s.layers;
    this.renderLayerList();
    this.renderPartsList();
    this.populateEmiSelects();
    this.render();
    return true;
  },

  exportKicad() {
    const s = this.state;
    const text = s.kicad
      ? window.KicadIO.exportText(s.kicad, s)          // 零落差：整樹回寫
      : window.KicadIO.buildNew(s);                    // 從零：基本檔（元件無 pad，見文件）
    const name = s.kicad ? s.kicad.fileName.replace(/\.kicad_pcb$/i, '') + '-voltsketch.kicad_pcb' : 'voltsketch.kicad_pcb';
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
    const el = document.getElementById('kicadIoMsg');
    if (el) el.textContent = s.kicad
      ? pcbT('pj_kicad_exported_tree', { name })
      : pcbT('pj_kicad_exported_new', { name });
  },

  exportGerber() {
    const s = this.state;
    const base = s.kicad ? s.kicad.fileName : 'voltsketch';
    const r = window.GerberExport.downloadZip(s, this.padAbs.bind(this), base);
    const el = document.getElementById('kicadIoMsg');
    if (el) {
      const names = r.files.map(f => f.name.replace(/^.*?-/, '')).join('、');
      el.innerHTML = pcbT('pj_gerber_exported', {
        n: r.files.length, names, pth: r.drillCounts.pth,
        npth: r.drillCounts.npth ? '＋NPTH ' + r.drillCounts.npth : '',
        slots: r.drillCounts.slots ? pcbT('pj_gerber_slots', { n: r.drillCounts.slots }) : ''
      }) + (r.warnings.length ? '<br>⚠ ' + r.warnings.join('<br>⚠ ') : '');
    }
  },

  // ---- IC 庫放料：footprint-gen 產真 pad（取代方框示意）----
  populateIcPicker() {
    const dl = document.getElementById('icPartsList');
    if (!dl || !window.IC_DATA) return;
    dl.innerHTML = window.IC_DATA.map(ic => `<option value="${ic.part}">`).join('');
  },

  placeIcFootprint(partName) {
    const msg = document.getElementById('icPlaceMsg');
    const say = t => { if (msg) msg.textContent = t; };
    const ic = (window.IC_DATA || []).find(x => x.part === partName);
    if (!ic) { say(pcbT('pj_ic_notfound', { part: partName })); return; }
    const n = this.state.components.length;
    const ref = 'U' + (this.state.components.filter(c => /^U\d+$/.test(c.ref || '')).length + 1);
    const base = { id: `lib-${Date.now()}`, type: 'ic', ref, part: ic.part, package: ic.package || '', label: ref, side: 'top', kind: 'ic', rot: 0, x: (n % 5) * 8 - 16, y: Math.floor(n / 5) * 8 - 8 };
    const r = window.FootprintGen ? window.FootprintGen.fromIC(ic) : { ok: false, reason: pcbT('pj_ic_nofpgen') };
    let comp;
    if (r.ok) {
      comp = Object.assign(base, { w: r.body.w, h: r.body.h, pads: r.pads });
      say(pcbT('pj_ic_placed', { ref, part: ic.part, family: r.meta.family, n: r.pads.length, pitch: r.meta.pitch }) +
        (r.meta.warnings.length ? '；⚠ ' + r.meta.warnings.join('；') : '') + '。' + pcbT('pj_fp_src'));
    } else {
      comp = Object.assign(base, { w: 6, h: 4 });
      say(pcbT('pj_ic_placed_box', { ref, part: ic.part, reason: r.reason }));
    }
    this.state.components.push(comp);
    this.state.selected = comp;
    this.renderPartsList();
    this.populateEmiSelects();
    this.render();
  },

  // ---- 基本元件放料（parts-lib.js：R/C/L/二極體/電晶體/排針/測試點…）----
  populatePartsPicker() {
    const catSel = document.getElementById('plCat');
    if (!catSel || !window.PartsLib) return;
    const cur = catSel.value;
    catSel.innerHTML = window.PartsLib.list().map(c =>
      `<option value="${c.id}">${pcbT('pl_c_' + c.id)}</option>`).join('');
    if ([...catSel.options].some(o => o.value === cur)) catSel.value = cur;
    this.populatePartsVariants();
  },

  populatePartsVariants() {
    const catSel = document.getElementById('plCat');
    const varSel = document.getElementById('plVar');
    if (!catSel || !varSel || !window.PartsLib) return;
    const cat = window.PartsLib.list().find(c => c.id === catSel.value);
    if (!cat) return;
    const cur = varSel.value;
    varSel.innerHTML = cat.variants.map(v => `<option>${v}</option>`).join('');
    if (cat.variants.includes(cur)) varSel.value = cur;
  },

  placePart(catId, variant, value) {
    const msg = document.getElementById('plMsg');
    const say = t => { if (msg) msg.textContent = t; };
    const r = window.PartsLib ? window.PartsLib.build(catId, variant) : { ok: false };
    if (!r.ok) { say(pcbT('pl_fail')); return; }
    const seq = this.state.components.filter(c => new RegExp('^' + r.ref + '\\d+$').test(c.ref || '')).length + 1;
    const ref = r.ref + seq;
    const n = this.state.components.length;
    const comp = {
      id: `part-${Date.now()}`, type: 'ic', kind: 'part', ref, label: ref,
      part: value || variant, package: variant, side: 'top', rot: 0,
      x: (n % 5) * 8 - 16, y: Math.floor(n / 5) * 8 - 8,
      w: r.body.w, h: r.body.h, pads: r.pads
    };
    this.state.components.push(comp);
    this.state.selected = comp;
    this.renderPartsList();
    this.populateEmiSelects();
    this.render();
    say(pcbT('pl_placed', { ref, name: comp.part, pads: r.pads.length }) + ' ' + pcbT('pj_fp_src'));
  },

  // 公版元件來源：schema v2 用 components（含尺寸/正反面），舊資料退回 blocks
  refBoardParts(b) {
    if (b.components && b.components.length) {
      return b.components.map((c, i) => ({
        id: `ref-${b.id}-${i}`, type: 'ic', x: c.x, y: c.y, w: c.w, h: c.h,
        side: c.side || 'top', kind: c.kind || 'ic', ref: c.ref, part: c.part,
        label: c.ref || c.part || ''
      }));
    }
    return (b.blocks || []).map((blk, i) => ({ id: `ref-${b.id}-${i}`, type: 'ic', x: blk.x, y: blk.y, label: blk.label }));
  },

  loadRefBoard(id) {
    const b = (window.PCB_REFBOARDS || []).find(x => x.id === id);
    if (!b) return;
    this.state.boardWidth = b.w;
    this.state.boardHeight = b.h;
    this.state.layers = Math.max(1, Math.min(40, b.layers));
    this.state.layerStack = this.buildLayerStack(this.state.layers);
    this.state.visibleLayers = this.state.layerStack.map(l => l.id);
    this.state.components = this.refBoardParts(b);
    this.state.traces = (b.traces || []).map((t, i) => ({ id: `ref-t-${i}`, ...t }));
    this.state.vias = (b.vias || []).map(v => ({ ...v }));
    this.state.refBoard = null; this.state.refOverlayId = null; this.state.selected = null;
    this.state.ratsnest = null;
    this.syncSelPanel();
    this.state.zones = []; this.state.edgeSegs = []; this.state.kicad = null;
    this.state.zoneFills = []; this.state.kicadArcs = [];
    // 同步板框輸入框
    const wI = document.querySelector('#boardWidth'), hI = document.querySelector('#boardHeight'), lI = document.querySelector('#boardLayers');
    if (wI) wI.value = b.w; if (hI) hI.value = b.h; if (lI) lI.value = b.layers;
    this.renderLayerList();
    this.renderPartsList();
    this.populateEmiSelects();
    this.render();
    // 切到 Layout 分頁（觸發 pcb.html 的分頁 handler）
    const t = document.querySelector('#tabLayout'); if (t) t.click();
  },

  toggleRefOverlay(id) {
    if (this.state.refOverlayId === id) { this.state.refBoard = null; this.state.refOverlayId = null; }
    else {
      const b = (window.PCB_REFBOARDS || []).find(x => x.id === id);
      if (!b) return;
      this.state.refBoard = this.refBoardParts(b);
      this.state.refOverlayId = id;
      const t = document.querySelector('#tabLayout'); if (t) t.click();
    }
    this.render();
  },

  // ---- 板上料件清單（頂/底面統計 + 逐件列表，點擊選取）----
  renderPartsList() {
    const sum = document.getElementById('partsSummary');
    const list = document.getElementById('partsList');
    if (!sum || !list) return;
    const comps = this.state.components;
    const top = comps.filter(c => c.side !== 'bottom').length;
    const bot = comps.length - top;
    const perLayer = {};
    this.state.traces.forEach(t => { const l = t.layer || 'F.Cu'; perLayer[l] = (perLayer[l] || 0) + 1; });
    const layerTxt = Object.keys(perLayer).map(l => `${l} ${pcbT('pj_seg_count', { n: perLayer[l] })}`).join('、') || pcbT('pj_none');
    sum.innerHTML = `<div style="font-size:12px;color:var(--muted);line-height:1.7">` +
      pcbT('pj_parts_sum', { layers: this.state.layers, n: comps.length, top, bot, vias: this.state.vias.length, layerTxt }) + `</div>`;
    list.innerHTML = comps.map((c, i) =>
      `<div class="part-row" data-idx="${i}" style="display:flex;gap:6px;align-items:center;padding:3px 6px;border-radius:5px;cursor:pointer;font-size:12px;${this.state.selected === c ? 'background:var(--accent-soft);' : ''}">` +
      `<b style="font-family:ui-monospace,monospace;min-width:38px">${c.ref || c.label || '-'}</b>` +
      `<span style="color:var(--muted);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.part || c.label || ''}</span>` +
      `<span style="font-size:10px;padding:0 5px;border-radius:999px;background:${c.side === 'bottom' ? '#1f3a5f' : '#2d4a3e'};color:#cbd5e1">${c.side === 'bottom' ? pcbT('pj_side_bottom') : pcbT('pj_side_top')}</span></div>`
    ).join('') || `<div style="font-size:12px;color:var(--muted);padding:4px 6px">${pcbT('pj_parts_empty')}</div>`;
  },

  // ---- EMI 環路檢查（心中有環）----
  populateEmiSelects() {
    const opts = '<option value="">--</option>' +
      this.state.components.map(c => `<option value="${c.id}">${c.label}</option>`).join('');
    document.querySelectorAll('.emi-role').forEach(sel => {
      const cur = sel.value;
      sel.innerHTML = opts;
      if ([...sel.options].some(o => o.value === cur)) sel.value = cur;
    });
  },

  polyArea(pts) { // 鞋帶公式，mm²
    if (pts.length < 3) return 0;
    let a = 0;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], q = pts[(i + 1) % pts.length];
      a += p.x * q.y - q.x * p.y;
    }
    return Math.abs(a) / 2;
  },

  runEmiCheck() {
    const byId = {}; this.state.components.forEach(c => { byId[c.id] = c; });
    const role = {};
    document.querySelectorAll('.emi-role').forEach(sel => { role[sel.dataset.role] = byId[sel.value] || null; });
    const issues = [];
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    // 輸入熱環 = Cin → IC → D；輸出環 = D → L → Cout
    const inPts = [role.cin, role.ic, role.d].filter(Boolean);
    const outPts = [role.d, role.l, role.cout].filter(Boolean);
    const inArea = this.polyArea(inPts), outArea = this.polyArea(outPts);
    const rate = a => a < 25 ? ['green', pcbT('pj_rate_good')] : a < 100 ? ['orange', pcbT('pj_rate_high')] : ['red', pcbT('pj_rate_toobig')];
    if (inPts.length >= 3) {
      const [c, t] = rate(inArea);
      issues.push({ sev: c === 'red' ? 'err' : c === 'orange' ? 'warn' : 'ok', msg: pcbT('pj_emi_in_area', { a: inArea.toFixed(1), t }) });
    } else issues.push({ sev: 'info', msg: pcbT('pj_emi_in_need') });
    if (outPts.length >= 3) {
      const [c, t] = rate(outArea);
      issues.push({ sev: c === 'red' ? 'err' : c === 'orange' ? 'warn' : 'ok', msg: pcbT('pj_emi_out_area', { a: outArea.toFixed(1), t }) });
    } else issues.push({ sev: 'info', msg: pcbT('pj_emi_out_need') });
    if (inPts.length >= 3 && outPts.length >= 3 && inArea > outArea)
      issues.push({ sev: 'warn', msg: pcbT('pj_emi_in_gt_out') });
    if (role.cin && role.ic && dist(role.cin, role.ic) > 5)
      issues.push({ sev: 'warn', msg: pcbT('pj_emi_cin_far', { d: dist(role.cin, role.ic).toFixed(1) }) });
    if (role.l && role.ic && dist(role.l, role.ic) > 8)
      issues.push({ sev: 'info', msg: pcbT('pj_emi_l_far', { d: dist(role.l, role.ic).toFixed(1) }) });

    this.state.emiLoops = { input: inPts, output: outPts, inArea, outArea };
    this.renderEmiResults(issues);
    this.render();
  },

  renderEmiResults(issues) {
    const el = document.getElementById('emiResults');
    if (!el) return;
    const col = { err: '#e74c3c', warn: '#e67e22', ok: '#2ecc71', info: '#95a5a6' };
    const ico = { err: '✕', warn: '⚠', ok: '✓', info: 'ℹ' };
    el.innerHTML = issues.map(i =>
      `<div style="padding:3px 6px;margin:2px 0;border-left:3px solid ${col[i.sev]};background:#0f1626;color:#cbd5e1">${ico[i.sev]} ${i.msg}</div>`
    ).join('');
  },

  // ---- 熱 / 散熱估算 ----
  // 完整 IPC-2221 精算（逐條走線載流量 + 認證係數）搬後端 Edge Function 'pcb-thermal'，由 pcb_access 鎖。
  // 未設定金鑰 / 未解鎖 → 本機僅給「簡估」(粗略 Tj + 最小線寬)，精算需解鎖。
  async runThermal() {
    const val = (id, d) => { const el = document.getElementById(id); const n = el ? parseFloat(el.value) : NaN; return isNaN(n) ? d : n; };
    const params = {
      oz: val('thCu', 1), dT: Math.max(1, val('thDT', 10)), Ta: val('thTa', 25),
      I: val('thI', 1), P: val('thP', 0.5), areaCm2: val('thArea', 1), vias: val('thVias', 0),
      traces: (this.state.traces || []).slice(0, 8).map(t => ({ width: t.width || 0.3 }))
    };
    // 進階精算：登入且 pcb_access(或 admin) → 後端計算（精算演算法只在伺服器）
    if (window.Auth && Auth.enabled()) {
      try {
        const ent = await Auth.entitlements();
        if (ent.pcb_access || ent.role === 'admin') {
          const res = await Auth.callFn('pcb-thermal', params);
          if (res && Array.isArray(res.issues)) { this.renderThermalResults(res.issues); return; }
        }
      } catch (e) { /* 降級到簡估 */ }
    }
    this.runThermalSimple(params);
  },

  // 本機簡估（免費）：粗略 Tj + 最小線寬；不含逐條走線精算（精算需解鎖）
  runThermalSimple(p) {
    const k = 0.048, mm2mil = 0.03937, tMil = p.oz * 1.378;
    const Aneed = Math.pow(p.I / (k * Math.pow(p.dT, 0.44)), 1 / 0.725);
    const wNeedMm = (Aneed / tMil) * mm2mil;
    const theta = Math.max(20, 80 / (1 + p.areaCm2 * 0.6 + p.vias * 0.08));
    const Tj = p.Ta + p.P * theta;
    const sev = Tj > 125 ? 'err' : Tj > 85 ? 'warn' : 'ok';
    const issues = [
      { sev: 'ok', msg: pcbT('pj_th_minw', { i: p.I, dt: p.dT, oz: p.oz, w: wNeedMm.toFixed(2) }) },
      { sev, msg: pcbT('pj_th_tj', { tj: Tj.toFixed(0), theta: theta.toFixed(0) }) }
    ];
    if (sev !== 'ok') issues.push({ sev: 'info', msg: pcbT('pj_th_cool') });
    issues.push({ sev: 'info', msg: pcbT('pj_th_locked') });
    this.renderThermalResults(issues);
  },

  renderThermalResults(issues) {
    const el = document.getElementById('thermalResults');
    if (!el) return;
    const col = { err: '#e74c3c', warn: '#e67e22', ok: '#2ecc71', info: '#95a5a6' };
    const ico = { err: '✕', warn: '⚠', ok: '✓', info: 'ℹ' };
    el.innerHTML = issues.map(i =>
      `<div style="padding:3px 6px;margin:2px 0;border-left:3px solid ${col[i.sev]};background:#0f1626;color:#cbd5e1">${ico[i.sev]} ${i.msg}</div>`
    ).join('');
  },

  drawEmiLoops(scale) {
    const loops = this.state.emiLoops;
    if (!loops) return;
    const { ctx } = this;
    const toScreen = c => ({ x: this.canvas.width / 2 + c.x * scale, y: this.canvas.height / 2 + c.y * scale });
    const drawLoop = (pts, color) => {
      if (pts.length < 2) return;
      ctx.save();
      ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.fillStyle = color + '22';
      ctx.beginPath();
      pts.forEach((p, i) => { const s = toScreen(p); i ? ctx.lineTo(s.x, s.y) : ctx.moveTo(s.x, s.y); });
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();
    };
    drawLoop(loops.output, '#3498db');
    drawLoop(loops.input, '#e67e22'); // 輸入熱環畫在上層更醒目
  },

  addTrace(x1, y1, x2, y2) {
    const trace = {
      id: `trace-${Date.now()}`,
      x1, y1, x2, y2,
      net: 'net1',
      width: 0.3
    };
    this.state.traces.push(trace);
    this.renderPartsList();
    this.render();
  },

  getMousePos(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  },

  screenToBoard(e) {
    const pos = this.getMousePos(e);
    const scale = 10 * this.state.zoom;
    return {
      x: (pos.x - this.state.panX - this.canvas.width / 2) / scale,
      y: (pos.y - this.state.panY - this.canvas.height / 2) / scale
    };
  },

  gridStep() {
    const el = document.getElementById('gridSnap');
    const v = el ? parseFloat(el.value) : 0.05;
    return isNaN(v) || v <= 0 ? 0 : v;
  },

  snap(v, g) {
    return g > 0 ? Math.round(Math.round(v / g) * g * 1e6) / 1e6 : Math.round(v * 1e6) / 1e6;
  },

  // 命中測試：點（板座標 mm）落在哪個元件的旋轉外形框內（後畫者優先）
  compHit(bx, by) {
    const cs = this.state.components;
    for (let i = cs.length - 1; i >= 0; i--) {
      const c = cs[i];
      if (!this.compVisible(c)) continue;
      const th = (c.rot || 0) * Math.PI / 180, co = Math.cos(th), si = Math.sin(th);
      const dx = bx - c.x, dy = by - c.y;
      const rx = dx * co - dy * si, ry = dx * si + dy * co; // padAbs 旋轉的反變換
      if (Math.abs(rx) <= (c.w || 4) / 2 && Math.abs(ry) <= (c.h || 3) / 2) return c;
    }
    return null;
  },

  // 旋轉選取元件：comp.rot 與每 pad.rot（總角度）必須同步加
  rotateSelected(delta) {
    const c = this.state.selected;
    if (!c) return;
    const norm = a => ((a % 360) + 360) % 360;
    c.rot = norm((c.rot || 0) + delta);
    (c.pads || []).forEach(p => { p.rot = norm((p.rot || 0) + delta); });
    this.state.ratsnest = null;
    this.syncSelPanel();
    this.render();
  },

  syncSelPanel() {
    const c = this.state.selected;
    const fields = document.getElementById('selFields'), info = document.getElementById('selInfo');
    if (!fields) return;
    fields.style.display = c ? 'grid' : 'none';
    if (info) info.style.display = c ? 'none' : '';
    if (!c) return;
    const ref = document.getElementById('selRef');
    if (ref) ref.textContent = `${c.ref || c.label || c.id}${c.part ? '｜' + c.part : ''}`;
    const set = (id, v) => {
      const el = document.getElementById(id);
      if (el && document.activeElement !== el) el.value = Math.round(v * 1000) / 1000;
    };
    set('selX', c.x); set('selY', c.y); set('selRot', c.rot || 0);
  },

  toast(msg, kind) {
    const host = document.getElementById('toastHost');
    if (!host) return;
    const el = document.createElement('div');
    el.textContent = msg;
    el.style.cssText = 'margin-top:8px;padding:9px 14px;border-radius:8px;font-size:13px;color:#fff;box-shadow:0 4px 12px rgba(0,0,0,.25);background:' +
      (kind === 'error' ? '#c0392b' : kind === 'warn' ? '#d35400' : '#2c3e50');
    host.appendChild(el);
    setTimeout(() => el.remove(), 4500);
  },

  // 畫線附著點：pad 中心（半徑+0.1mm 內）/ via / 走線端點（0.5mm 內）→ {x,y,net}
  snapTarget(bx, by) {
    let best = null;
    const consider = (x, y, net, d) => { if (!best || d < best.d) best = { x, y, net: net || '', d }; };
    for (const c of this.state.components) {
      for (const p of (c.pads || [])) {
        if (p.cu === false) continue;
        const a = this.padAbs(c, p);
        const d = Math.hypot(bx - a.x, by - a.y);
        if (d <= Math.max(p.w || 0.5, p.h || 0.5) / 2 + 0.1) consider(a.x, a.y, p.net, d);
      }
    }
    for (const v of this.state.vias) {
      const d = Math.hypot(bx - v.x, by - v.y);
      if (d <= (v.od || 0.6) / 2 + 0.1) consider(v.x, v.y, v.net, d);
    }
    for (const t of this.state.traces) {
      for (const [x, y] of [[t.x1, t.y1], [t.x2, t.y2]]) {
        const d = Math.hypot(bx - x, by - y);
        if (d <= 0.5) consider(x, y, t.net, d);
      }
    }
    return best;
  },

  // 走線落子後即時規則檢查（超標 toast 警示）
  checkTraceRules(tr) {
    if (!window.NetRules || !tr.net) return;
    const r = window.NetRules.match(this.state.netRules, tr.net);
    if (!r) return;
    if (r.minW > 0 && (tr.width || 0.3) < r.minW - 1e-9)
      this.toast(pcbT('pj_rule_w_toast', { net: tr.net, w: tr.width, lim: r.minW, pattern: r.pattern }), 'error');
    if (r.maxLen > 0) {
      const L = window.NetRules.netLength(this.state.traces, tr.net);
      if (L > r.maxLen + 1e-9)
        this.toast(pcbT('pj_rule_len_toast', { net: tr.net, len: L.toFixed(2), lim: r.maxLen, pattern: r.pattern }), 'error');
    }
  },

  drawTracePreview(scale) {
    const td = this.state.traceDraw;
    if (!td) return;
    const { ctx } = this;
    const X = x => this.canvas.width / 2 + x * scale, Y = y => this.canvas.height / 2 + y * scale;
    const len = Math.hypot(td.x2 - td.x1, td.y2 - td.y1);
    let over = false, label = `${len.toFixed(2)}mm`;
    if (window.NetRules && td.net) {
      const r = window.NetRules.match(this.state.netRules, td.net);
      if (r && r.maxLen > 0) {
        const total = window.NetRules.netLength(this.state.traces, td.net) + len;
        label += ' │ ' + pcbT('pj_draw_total', { net: td.net, total: total.toFixed(1), max: r.maxLen });
        if (total > r.maxLen) { over = true; label += ' ' + pcbT('pj_draw_over'); }
      }
      if (r && r.minW > 0 && (this.state.traceWidth || 0.3) < r.minW) { over = true; label += ' │ ' + pcbT('pj_draw_thin', { lim: r.minW }); }
    }
    ctx.save();
    ctx.strokeStyle = over ? '#e74c3c' : '#2ecc71';
    ctx.lineWidth = Math.max(1, (this.state.traceWidth || 0.3) * scale);
    ctx.globalAlpha = 0.75;
    ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(X(td.x1), Y(td.y1)); ctx.lineTo(X(td.x2), Y(td.y2)); ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = over ? '#e74c3c' : '#ecf0f1';
    ctx.fillText(label, X((td.x1 + td.x2) / 2) + 8, Y((td.y1 + td.y2) / 2) - 6);
    ctx.restore();
  },

  // footprint 相對點 → 絕對（同 padAbs 旋轉公式）
  compRel(comp, rx, ry) {
    const th = (comp.rot || 0) * Math.PI / 180;
    const c = Math.cos(th), s = Math.sin(th);
    return { x: comp.x + rx * c + ry * s, y: comp.y - rx * s + ry * c };
  },

  drawSilk(scale) {
    const { ctx, state } = this;
    const fVis = state.visibleLayers.includes('F.SilkS'), bVis = state.visibleLayers.includes('B.SilkS');
    if (!fVis && !bVis) return;
    const X = x => this.canvas.width / 2 + x * scale, Y = y => this.canvas.height / 2 + y * scale;
    const colF = '#f1c40f', colB = '#b7950b';
    const visOk = side => side === 'B' ? bVis : fVis;
    ctx.save();
    ctx.lineCap = 'round';
    const drawItem = (g, toAbs) => {
      if (!visOk(g.side)) return;
      ctx.strokeStyle = g.side === 'B' ? colB : colF;
      ctx.lineWidth = Math.max(0.6, (g.w || 0.12) * scale);
      ctx.beginPath();
      if (g.kind === 'line') {
        const a = toAbs(g.x1, g.y1), b = toAbs(g.x2, g.y2);
        ctx.moveTo(X(a.x), Y(a.y)); ctx.lineTo(X(b.x), Y(b.y));
      } else if (g.kind === 'circle') {
        const c = toAbs(g.cx, g.cy);
        ctx.arc(X(c.x), Y(c.y), Math.max(0.5, g.r * scale), 0, Math.PI * 2);
      } else if (g.kind === 'arc') {
        // 三點折 12 段
        const pts = window.KicadIO && window.KicadIO._arcPoints
          ? window.KicadIO._arcPoints(g.x1, g.y1, g.xm, g.ym, g.x2, g.y2, 12) : [[g.x1, g.y1], [g.x2, g.y2]];
        pts.forEach((p, i) => {
          const a = toAbs(p[0], p[1]);
          i ? ctx.lineTo(X(a.x), Y(a.y)) : ctx.moveTo(X(a.x), Y(a.y));
        });
      }
      ctx.stroke();
    };
    for (const comp of state.components) {
      const toAbs = (rx, ry) => this.compRel(comp, rx, ry);
      (comp.silk || []).forEach(g => drawItem(g, toAbs));
      (comp.silkTexts || []).forEach(t => {
        if (!visOk(t.side)) return;
        const p = this.compRel(comp, t.x, t.y);
        ctx.fillStyle = t.side === 'B' ? colB : colF;
        ctx.font = `${Math.max(7, t.size * scale)}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(t.text, X(p.x), Y(p.y) + t.size * scale * 0.35);
      });
    }
    (state.silkGr || []).forEach(g => drawItem(g, (x, y) => ({ x, y })));
    ctx.restore();
  },

  drawUserZones(scale) {
    const { state, ctx } = this;
    const zs = (state.userZones || []).filter(z => state.visibleLayers.includes(z.layer));
    const zd = state.zoneDraw;
    if (!zs.length && !zd) return;
    const X = x => this.canvas.width / 2 + x * scale, Y = y => this.canvas.height / 2 + y * scale;
    const layerOf = id => (state.layerStack || []).find(l => l.id === id);
    for (const z of zs) {
      const col = (layerOf(z.layer) || {}).color || '#16a085';
      const off = document.createElement('canvas');
      off.width = this.canvas.width; off.height = this.canvas.height;
      const o = off.getContext('2d');
      o.fillStyle = col;
      o.globalAlpha = 0.4;
      o.beginPath();
      z.pts.forEach((p, i) => i ? o.lineTo(X(p[0]), Y(p[1])) : o.moveTo(X(p[0]), Y(p[1])));
      o.closePath(); o.fill();
      // 避讓打洞（destination-out）：異網 pad / 走線 / via
      o.globalAlpha = 1;
      o.globalCompositeOperation = 'destination-out';
      const c = z.clearance || 0.3;
      for (const comp of state.components) for (const p of (comp.pads || [])) {
        if (p.cu === false) continue;
        if (z.net && (p.net || '') === z.net) continue;
        const sideOk = p.side === '*' || (z.layer === 'F.Cu' && p.side === 'F') || (z.layer === 'B.Cu' && p.side === 'B');
        if (!sideOk) continue;
        const a = this.padAbs(comp, p);
        o.save();
        o.translate(X(a.x), Y(a.y));
        o.rotate(-(p.rot || 0) * Math.PI / 180);
        o.fillRect(-((p.w || 0.5) / 2 + c) * scale, -((p.h || 0.5) / 2 + c) * scale,
                   ((p.w || 0.5) + 2 * c) * scale, ((p.h || 0.5) + 2 * c) * scale);
        o.restore();
      }
      o.lineCap = 'round';
      for (const t of state.traces) {
        if ((t.layer || 'F.Cu') !== z.layer) continue;
        if (z.net && (t.net || '') === z.net) continue;
        o.lineWidth = ((t.width || 0.3) + 2 * c) * scale;
        o.beginPath(); o.moveTo(X(t.x1), Y(t.y1)); o.lineTo(X(t.x2), Y(t.y2)); o.stroke();
      }
      for (const v of state.vias) {
        if (z.net && (v.net || '') === z.net) continue;
        o.beginPath(); o.arc(X(v.x), Y(v.y), ((v.od || 0.6) / 2 + c) * scale, 0, Math.PI * 2); o.fill();
      }
      ctx.drawImage(off, 0, 0);
      // 外框
      ctx.strokeStyle = col;
      ctx.globalAlpha = 0.9;
      ctx.lineWidth = 1;
      ctx.beginPath();
      z.pts.forEach((p, i) => i ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1])));
      ctx.closePath(); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    // 進行中預覽（虛線）
    if (zd && zd.pts.length) {
      ctx.save();
      ctx.strokeStyle = '#2ecc71';
      ctx.setLineDash([5, 4]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      zd.pts.forEach((p, i) => i ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1])));
      if (zd.cursor) ctx.lineTo(X(zd.cursor[0]), Y(zd.cursor[1]));
      ctx.stroke();
      ctx.restore();
    }
  },

  drawRatsnest(scale) {
    if (!this.state.showRatsnest || !window.Ratsnest) return;
    if (!this.state.ratsnest) this.state.ratsnest = window.Ratsnest.compute(this.state, this.padAbs.bind(this));
    const { ctx } = this;
    const X = x => this.canvas.width / 2 + x * scale, Y = y => this.canvas.height / 2 + y * scale;
    ctx.save();
    ctx.strokeStyle = '#f1c40f';
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    for (const l of this.state.ratsnest) {
      ctx.beginPath(); ctx.moveTo(X(l.x1), Y(l.y1)); ctx.lineTo(X(l.x2), Y(l.y2)); ctx.stroke();
    }
    ctx.restore();
  },

  renderNetRules() {
    const host = document.getElementById('netRulesList');
    if (!host) return;
    const rules = this.state.netRules || [];
    host.innerHTML = rules.map((r, i) =>
      `<div class="nr-row" data-i="${i}" style="display:grid;grid-template-columns:1fr 46px 46px 46px 46px 20px;gap:4px;margin-bottom:4px;font-size:12px">
        <input class="nr-pat" value="${(r.pattern || '').replace(/"/g, '&quot;')}" placeholder="${pcbT('pj_nr_pat_ph')}" style="padding:3px">
        <input class="nr-minw" type="number" step="0.05" min="0" value="${r.minW || 0}" title="${pcbT('pj_nr_minw_t')}" style="padding:3px">
        <input class="nr-maxl" type="number" step="1" min="0" value="${r.maxLen || 0}" title="${pcbT('pj_nr_maxl_t')}" style="padding:3px">
        <input class="nr-pair" type="number" step="0.1" min="0" value="${r.pairTol || 0}" title="${pcbT('pj_nr_pair_t')}" style="padding:3px">
        <input class="nr-gap" type="number" step="0.05" min="0" value="${r.gap || 0}" title="${pcbT('pj_nr_gap_t')}" style="padding:3px">
        <button class="nr-del" title="${pcbT('pj_nr_del_t')}" style="padding:0;cursor:pointer">✕</button>
      </div>`).join('') || `<p style="color:var(--muted);font-size:12px;margin:0">${pcbT('pj_nr_empty')}</p>`;
  },

  readNetRules() {
    const rows = [...document.querySelectorAll('#netRulesList .nr-row')];
    this.state.netRules = rows.map(r => ({
      pattern: r.querySelector('.nr-pat').value.trim(),
      minW: parseFloat(r.querySelector('.nr-minw').value) || 0,
      maxLen: parseFloat(r.querySelector('.nr-maxl').value) || 0,
      pairTol: parseFloat(r.querySelector('.nr-pair').value) || 0,
      gap: parseFloat(r.querySelector('.nr-gap').value) || 0
    })).filter(r => r.pattern);
    if (window.NetRules) window.NetRules.save(this.state.netRules);
  },

  // netlist 同步：讀線路圖（localStorage voltsketch-project）→ 建 PCB 元件+pad net，飛線引導佈線
  syncFromSchematic() {
    if (!window.CircuitEngine) { this.toast(pcbT('pj_sync_noeng'), 'error'); return; }
    let proj = null;
    try { proj = JSON.parse(localStorage.getItem('voltsketch-project') || 'null'); } catch (e) {}
    const sComps = (proj && proj.components || []).filter(c => c && c.type);
    if (!sComps.length) { this.toast(pcbT('pj_sync_nodata'), 'warn'); return; }
    if (this.state.components.length || this.state.traces.length) {
      if (!confirm(pcbT('pj_sync_confirm'))) return;
    }
    const eng = window.CircuitEngine;
    const nets = eng.computeNets(sComps, proj.wires || []);
    const byId = {}; sComps.forEach(c => { byId[c.id] = c; });
    // net 命名：含 ground → GND；含 source/battery + 腳 → VCC；其餘 N$n
    const rootName = new Map();
    for (let i = 0; i < nets.pts.length; i++) {
      const p = nets.pts[i];
      if (p.kind !== 'pin') continue;
      const r = nets.find(i);
      const c = byId[p.key.split(':')[0]];
      if (!c) continue;
      if (/ground/i.test(c.type)) rootName.set(r, 'GND');
      else if (/source|battery|vcc|vdd/i.test(c.type) && !rootName.has(r)) rootName.set(r, 'VCC');
    }
    let serial = 1;
    const netNameOf = key => {
      if (!nets.connectedPins.has(key)) return '';
      const r = nets.pinNet.get(key);
      if (!rootName.has(r)) rootName.set(r, 'N$' + serial++);
      return rootName.get(r);
    };
    // 建 PCB 元件：pad 位置照線路圖 pin 幾何縮放（px→mm）
    const SC = 0.08;
    const newComps = [];
    const grid = { cols: 8, dx: 16, dy: 14 };
    sComps.forEach((c, i) => {
      const pins = eng.getPins(c);
      if (!pins.length) return;
      const rel = pins.map(p => ({ x: (p.x - c.x) * SC, y: (p.y - c.y) * SC, name: String(p.name || ''), index: p.index }));
      const ext = rel.reduce((m, p) => ({
        minx: Math.min(m.minx, p.x), maxx: Math.max(m.maxx, p.x),
        miny: Math.min(m.miny, p.y), maxy: Math.max(m.maxy, p.y)
      }), { minx: 0, maxx: 0, miny: 0, maxy: 0 });
      const col = i % grid.cols, row = Math.floor(i / grid.cols);
      newComps.push({
        id: `sync-${c.id}`, type: 'ic', kind: 'ic',
        x: (col - (grid.cols - 1) / 2) * grid.dx,
        y: (row - 1.5) * grid.dy,
        rot: 0, side: 'top',
        w: Math.max(3, ext.maxx - ext.minx + 2.4), h: Math.max(3, ext.maxy - ext.miny + 2.4),
        ref: c.label || (c.type.toUpperCase().slice(0, 3) + (i + 1)), part: c.type, label: c.label || c.type,
        pads: rel.map((p, k) => ({
          num: String(k + 1), name: p.name, type: 'smd', shape: 'rect',
          x: p.x, y: p.y, rot: 0, w: 1.2, h: 1.2, drill: 0, slot: null, rr: 0,
          side: 'F', cu: true, net: netNameOf(c.id + ':' + p.index)
        }))
      });
    });
    const s = this.state;
    s.components = newComps;
    s.traces = []; s.vias = []; s.zones = []; s.zoneFills = []; s.userZones = [];
    s.kicad = null; s.kicadArcs = []; s.edgeSegs = []; s.silkGr = [];
    s.refBoard = null; s.refOverlayId = null; s.selected = null; s.ratsnest = null;
    s.showRatsnest = true;
    const tgl = document.getElementById('ratsnestToggle');
    if (tgl) tgl.checked = true;
    this.syncSelPanel();
    this.renderPartsList();
    this.populateEmiSelects();
    this.render();
    const netN = new Set([...rootName.values()]).size;
    this.toast(pcbT('pj_sync_done', { c: newComps.length, n: netN }), 'info');
  },

  // 自動佈線：把目前所有飛線逐條丟給 A*（單層試驗，無推擠、不插 via）
  autoRoute() {
    if (!window.Ratsnest || !window.AutoRoute) return;
    const lines = window.Ratsnest.compute(this.state, this.padAbs.bind(this));
    if (!lines.length) { this.toast(pcbT('pj_ar_none'), 'info'); return; }
    const cap = 30;
    const todo = lines.slice(0, cap);
    let okN = 0, failN = 0;
    const t0 = performance.now();
    for (const line of todo) {
      const r = window.AutoRoute.route(this.state, this.padAbs.bind(this), line, {
        layer: this.state.traceLayer || 'F.Cu',
        width: this.state.traceWidth || 0.25,
        clearance: 0.15,
        grid: 0.25
      });
      if (!r.ok) { failN++; continue; }
      for (const sg of r.segs) {
        this.state.traces.push({
          id: `trace-${Date.now()}-${this.state.traces.length}`,
          x1: sg.x1, y1: sg.y1, x2: sg.x2, y2: sg.y2,
          width: this.state.traceWidth || 0.25, layer: this.state.traceLayer || 'F.Cu', net: line.net
        });
      }
      okN++;
    }
    const ms = Math.round(performance.now() - t0);
    this.state.ratsnest = null;
    this.renderPartsList();
    this.render();
    this.toast(pcbT('pj_ar_done', { ok: okN, fail: failN, cap: lines.length > cap ? pcbT('pj_ar_cap', { cap }) : '', ms }), failN ? 'warn' : 'info');
  },

  // 阻抗計算（IPC-2141 近似式；±10% 等級，正式設計用場型解算器）
  calcImpedance(kind, w, h, t, er, s) {
    if (!(w > 0 && h > 0 && t > 0 && er > 1)) return null;
    const ms = 87 / Math.sqrt(er + 1.41) * Math.log(5.98 * h / (0.8 * w + t));
    const sl = 60 / Math.sqrt(er) * Math.log(1.9 * (2 * h + t) / (0.8 * w + t));
    if (kind === 'microstrip') return { z0: ms };
    if (kind === 'stripline') return { z0: sl };
    if (kind === 'diff-microstrip') {
      if (!(s > 0)) return null;
      return { z0: ms, zdiff: 2 * ms * (1 - 0.48 * Math.exp(-0.96 * s / h)) };
    }
    if (kind === 'diff-stripline') {
      if (!(s > 0)) return null;
      return { z0: sl, zdiff: 2 * sl * (1 - 0.347 * Math.exp(-2.9 * s / h)) };
    }
    return null;
  },

  runImpedance() {
    const v = id => parseFloat(document.getElementById(id)?.value);
    const kind = document.getElementById('impKind')?.value;
    const r = this.calcImpedance(kind, v('impW'), v('impH'), v('impT'), v('impEr'), v('impS'));
    const out = document.getElementById('impOut');
    if (!out) return;
    if (!r) { out.textContent = pcbT('pj_imp_bad'); return; }
    out.textContent = `Z0 ≈ ${r.z0.toFixed(1)} Ω` + (r.zdiff ? `；Zdiff ≈ ${r.zdiff.toFixed(1)} Ω` : '');
  },

  populateTraceLayerSel() {
    const sel = document.getElementById('traceLayer');
    if (!sel) return;
    const cu = (this.state.layerStack || []).filter(l => l.kind === 'copper');
    if (!cu.find(l => l.id === this.state.traceLayer)) this.state.traceLayer = 'F.Cu';
    sel.innerHTML = cu.map(l => `<option value="${l.id}" ${l.id === this.state.traceLayer ? 'selected' : ''}>${l.id}</option>`).join('');
  },

  bindEvents() {
    // 切語言：JS 產生的清單/面板重繪（DRC 結果有內容才重跑）
    document.addEventListener('vs-lang-change', () => {
      this.renderLayerList();
      this.renderPartsList();
      this.renderNetRules();
      this.renderRefBoards();
      this.populatePartsPicker();
      const drc = document.querySelector('#drcResults');
      if (drc && drc.innerHTML.trim()) this.runDrc();
    });

    // Tool buttons
    document.querySelectorAll('.pcb-tool-btn').forEach(btn => {
      btn.addEventListener('click', () => this.setTool(btn.dataset.tool));
    });

    // Zoom controls
    document.querySelector('#zoomIn')?.addEventListener('click', () => this.zoomIn());
    document.querySelector('#zoomOut')?.addEventListener('click', () => this.zoomOut());
    document.querySelector('#zoomFit')?.addEventListener('click', () => this.zoomFit());

    // DRC
    document.querySelector('#runDrc')?.addEventListener('click', () => this.runDrc());

    // Layout 規則表
    document.getElementById('netRulesList')?.addEventListener('change', () => this.readNetRules());
    document.getElementById('netRulesList')?.addEventListener('click', (e) => {
      const del = e.target.closest('.nr-del');
      if (!del) return;
      this.state.netRules.splice(+del.closest('.nr-row').dataset.i, 1);
      if (window.NetRules) window.NetRules.save(this.state.netRules);
      this.renderNetRules();
    });
    document.getElementById('nrAdd')?.addEventListener('click', () => {
      this.state.netRules.push({ pattern: '', minW: 0, maxLen: 0, pairTol: 0 });
      this.renderNetRules();
    });

    // 畫線參數與飛線
    document.getElementById('traceWidth')?.addEventListener('change', (e) => {
      const v = parseFloat(e.target.value);
      if (!isNaN(v) && v > 0) this.state.traceWidth = v;
    });
    document.getElementById('traceLayer')?.addEventListener('change', (e) => { this.state.traceLayer = e.target.value; });
    document.getElementById('ratsnestToggle')?.addEventListener('change', (e) => {
      this.state.showRatsnest = e.target.checked;
      this.state.ratsnest = null;
      this.render();
    });

    // 自動佈線（試驗性：逐條飛線單層 A*）
    document.getElementById('autoRouteBtn')?.addEventListener('click', () => this.autoRoute());

    // netlist 同步（線路圖 → PCB）
    document.getElementById('syncNetlistBtn')?.addEventListener('click', () => this.syncFromSchematic());

    // 3D 檢視
    document.getElementById('view3dBtn')?.addEventListener('click', () => {
      if (window.Pcb3D) window.Pcb3D.open(this.state, this.padAbs.bind(this));
    });

    // 阻抗計算
    document.getElementById('impCalc')?.addEventListener('click', () => this.runImpedance());
    ['impKind', 'impW', 'impH', 'impT', 'impEr', 'impS'].forEach(id =>
      document.getElementById(id)?.addEventListener('change', () => this.runImpedance()));

    // EMI 環路檢查
    document.querySelector('#runEmi')?.addEventListener('click', () => this.runEmiCheck());

    // 熱估算
    document.querySelector('#runThermal')?.addEventListener('click', () => this.runThermal());

    // 開源公版：載入 / 疊加（事件委派）
    document.querySelector('#refBoardList')?.addEventListener('click', (e) => {
      const load = e.target.closest('.ref-load');
      const ov = e.target.closest('.ref-overlay');
      if (load) this.loadRefBoard(load.dataset.refid);
      else if (ov) this.toggleRefOverlay(ov.dataset.refid);
    });

    // 板上料件清單：點列選取元件
    document.querySelector('#partsList')?.addEventListener('click', (e) => {
      const row = e.target.closest('.part-row');
      if (!row) return;
      this.state.selected = this.state.components[+row.dataset.idx] || null;
      this.renderPartsList();
      this.syncSelPanel();
      this.render();
    });

    // KiCad 匯入/匯出
    document.querySelector('#kicadFile')?.addEventListener('change', (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const rd = new FileReader();
      rd.onload = () => {
        const ok = this.importKicad(String(rd.result), f.name);
        const el = document.getElementById('kicadIoMsg');
        if (el && ok) el.textContent = pcbT('pj_kicad_imported', { name: f.name, c: this.state.components.length, t: this.state.traces.length, v: this.state.vias.length, l: this.state.layers });
      };
      rd.readAsText(f);
      e.target.value = '';
    });
    document.querySelector('#exportKicadBtn')?.addEventListener('click', () => this.exportKicad());
    document.querySelector('#exportGerberBtn')?.addEventListener('click', () => this.exportGerber());

    // IC 庫放料
    document.querySelector('#placeIcBtn')?.addEventListener('click', () => {
      const v = document.getElementById('icPartPick')?.value?.trim();
      if (v) this.placeIcFootprint(v);
    });
    document.querySelector('#icPartPick')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); const v = e.target.value.trim(); if (v) this.placeIcFootprint(v); }
    });

    // 基本元件放料
    document.getElementById('plCat')?.addEventListener('change', () => this.populatePartsVariants());
    document.getElementById('plPlaceBtn')?.addEventListener('click', () => {
      const cat = document.getElementById('plCat')?.value;
      const variant = document.getElementById('plVar')?.value;
      const value = document.getElementById('plVal')?.value?.trim() || '';
      if (cat && variant) this.placePart(cat, variant, value);
    });

    // Board settings
    document.querySelector('#applyBoardSettings')?.addEventListener('click', () => {
      this.state.boardWidth = parseInt(document.querySelector('#boardWidth').value) || 100;
      this.state.boardHeight = parseInt(document.querySelector('#boardHeight').value) || 80;
      const n = Math.max(1, Math.min(40, parseInt(document.querySelector('#boardLayers').value) || 2));
      this.state.layers = n;
      this.state.layerStack = this.buildLayerStack(n);
      this.state.visibleLayers = this.state.layerStack.map(l => l.id);
      this.renderLayerList();
      this.render();
    });

    // Canvas events
    this.canvas?.addEventListener('mousedown', (e) => {
      const pos = this.getMousePos(e);
      this.state.lastMouse = pos;

      if (this.state.tool === 'select') {
        const b = this.screenToBoard(e);
        const hit = this.compHit(b.x, b.y);
        if (hit) {
          this.state.selected = hit;
          this.state.dragComp = hit;
          this.state.dragOff = { x: hit.x - b.x, y: hit.y - b.y };
          this.canvas.style.cursor = 'move';
          this.renderPartsList();
          this.syncSelPanel();
          this.render();
        } else {
          if (this.state.selected) {
            this.state.selected = null;
            this.renderPartsList();
            this.syncSelPanel();
            this.render();
          }
          this.state.isPanning = true;
          this.canvas.style.cursor = 'grabbing';
        }
      } else if (this.state.tool === 'trace') {
        const b = this.screenToBoard(e);
        const g = this.gridStep();
        const hit = this.snapTarget(b.x, b.y);
        const sx = hit ? hit.x : this.snap(b.x, g), sy = hit ? hit.y : this.snap(b.y, g);
        this.state.traceDraw = { x1: sx, y1: sy, x2: sx, y2: sy, net: hit ? hit.net : '' };
        this.render();
      } else if (this.state.tool === 'via') {
        const b = this.screenToBoard(e);
        const g = this.gridStep();
        const hit = this.snapTarget(b.x, b.y);
        this.state.vias.push({
          x: hit ? hit.x : this.snap(b.x, g), y: hit ? hit.y : this.snap(b.y, g),
          od: 0.6, id: 0.3, net: hit ? hit.net : '', user: true
        });
        this.state.ratsnest = null;
        this.renderPartsList();
        this.render();
      } else if (this.state.tool === 'plane') {
        const b = this.screenToBoard(e);
        const g = this.gridStep();
        const px = this.snap(b.x, g), py = this.snap(b.y, g);
        if (!this.state.zoneDraw) {
          const hit = this.snapTarget(b.x, b.y);
          this.state.zoneDraw = { pts: [[px, py]], net: hit ? hit.net : '', cursor: [px, py] };
          this.toast(this.state.zoneDraw.net
            ? pcbT('pj_zone_start_net', { net: this.state.zoneDraw.net })
            : pcbT('pj_zone_start_nonet'), 'info');
        } else {
          this.state.zoneDraw.pts.push([px, py]);
        }
        this.render();
      }
    });

    // 雙擊：收尾鋪銅多邊形
    this.canvas?.addEventListener('dblclick', () => {
      const zd = this.state.zoneDraw;
      if (!zd) return;
      this.state.zoneDraw = null;
      // 雙擊會多推一個重複點，去尾
      if (zd.pts.length >= 2) {
        const [ax, ay] = zd.pts[zd.pts.length - 1], [bx2, by2] = zd.pts[zd.pts.length - 2];
        if (Math.hypot(ax - bx2, ay - by2) < 1e-9) zd.pts.pop();
      }
      if (zd.pts.length < 3) { this.toast(pcbT('pj_zone_min3'), 'warn'); this.render(); return; }
      this.state.userZones.push({ layer: this.state.traceLayer || 'F.Cu', net: zd.net || '', pts: zd.pts, clearance: 0.3, user: true });
      this.state.ratsnest = null;
      this.toast(pcbT('pj_zone_done', { net: zd.net || pcbT('drc_nonet'), layer: this.state.traceLayer }), 'info');
      this.render();
    });

    this.canvas?.addEventListener('mousemove', (e) => {
      if (this.state.zoneDraw) {
        const b = this.screenToBoard(e);
        const g = this.gridStep();
        this.state.zoneDraw.cursor = [this.snap(b.x, g), this.snap(b.y, g)];
        this.render();
        return;
      }
      if (this.state.traceDraw) {
        const td = this.state.traceDraw;
        const b = this.screenToBoard(e);
        let ex = b.x, ey = b.y;
        if (!e.shiftKey) { // 0/45/90 吸角（Shift=自由角度）
          const dx = ex - td.x1, dy = ey - td.y1;
          const len = Math.hypot(dx, dy);
          if (len > 0) {
            const a = Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) * (Math.PI / 4);
            ex = td.x1 + len * Math.cos(a);
            ey = td.y1 + len * Math.sin(a);
          }
        }
        const g = this.gridStep();
        td.x2 = this.snap(ex, g); td.y2 = this.snap(ey, g);
        this.render();
        return;
      }
      if (this.state.dragComp) {
        const b = this.screenToBoard(e);
        const g = this.gridStep();
        const c = this.state.dragComp;
        c.x = this.snap(b.x + this.state.dragOff.x, g);
        c.y = this.snap(b.y + this.state.dragOff.y, g);
        this.syncSelPanel();
        this.render();
      } else if (this.state.isPanning) {
        const pos = this.getMousePos(e);
        this.state.panX += pos.x - this.state.lastMouse.x;
        this.state.panY += pos.y - this.state.lastMouse.y;
        this.state.lastMouse = pos;
        this.render();
      }
    });

    this.canvas?.addEventListener('mouseup', (e) => {
      if (this.state.traceDraw) {
        const td = this.state.traceDraw;
        this.state.traceDraw = null;
        if (Math.hypot(td.x2 - td.x1, td.y2 - td.y1) >= 0.05) {
          const endHit = this.snapTarget(td.x2, td.y2);
          if (endHit) { td.x2 = endHit.x; td.y2 = endHit.y; }
          const net = td.net || (endHit ? endHit.net : '');
          if (td.net && endHit && endHit.net && endHit.net !== td.net)
            this.toast(pcbT('pj_net_mismatch', { a: td.net, b: endHit.net }), 'error');
          const tr = {
            id: `trace-${Date.now()}-${this.state.traces.length}`,
            x1: td.x1, y1: td.y1, x2: td.x2, y2: td.y2,
            width: this.state.traceWidth || 0.3, layer: this.state.traceLayer || 'F.Cu', net
          };
          this.state.traces.push(tr);
          this.state.ratsnest = null;
          this.checkTraceRules(tr);
          this.renderPartsList();
        }
        this.render();
        return;
      }
      if (this.state.dragComp) {
        this.state.dragComp = null;
        this.state.ratsnest = null;
        this.canvas.style.cursor = 'crosshair';
        this.renderPartsList();
      }
      if (this.state.isPanning) {
        this.state.isPanning = false;
        this.canvas.style.cursor = 'crosshair';
      }
    });

    // 鍵盤：R=旋轉 90°、Esc=取消選取（輸入框聚焦時不攔截）
    document.addEventListener('keydown', (e) => {
      if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '')) return;
      if ((e.key === 'r' || e.key === 'R') && this.state.selected) {
        e.preventDefault();
        this.rotateSelected(90);
      } else if (e.key === 'Escape') {
        if (this.state.zoneDraw) {
          this.state.zoneDraw = null;
          this.render();
        } else if (this.state.traceDraw) {
          this.state.traceDraw = null;
          this.render();
        } else if (this.state.selected) {
          this.state.selected = null;
          this.renderPartsList();
          this.syncSelPanel();
          this.render();
        }
      }
    });

    // 選取元件屬性面板：座標/角度直接輸入
    ['selX', 'selY', 'selRot'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', () => {
        const c = this.state.selected;
        if (!c) return;
        const v = parseFloat(document.getElementById(id).value);
        if (isNaN(v)) { this.syncSelPanel(); return; }
        if (id === 'selX') c.x = v;
        else if (id === 'selY') c.y = v;
        else {
          const norm = a => ((a % 360) + 360) % 360;
          const delta = v - (c.rot || 0);
          c.rot = norm(v);
          (c.pads || []).forEach(p => { p.rot = norm((p.rot || 0) + delta); });
        }
        this.state.ratsnest = null;
        this.syncSelPanel();
        this.render();
      });
    });
    document.getElementById('selRotBtn')?.addEventListener('click', () => this.rotateSelected(90));

    this.canvas?.addEventListener('click', (e) => {
      if (this.state.tool === 'pad') {
        const pos = this.getMousePos(e);
        const scale = 10 * this.state.zoom;
        const x = (pos.x - this.canvas.width / 2 - this.state.panX) / scale;
        const y = (pos.y - this.canvas.height / 2 - this.state.panY) / scale;
        this.addComponent('pad', x, y);
      }
    });

    this.canvas?.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        this.zoomIn();
      } else {
        this.zoomOut();
      }
    });

    // Layer visibility（委派，圖層清單為動態產生）
    const layerList = document.getElementById('layerList');
    layerList?.addEventListener('click', (e) => {
      if (e.target.closest('.layer-type')) return;
      const item = e.target.closest('.layer-item');
      if (!item) return;
      const layer = item.dataset.layer;
      const index = this.state.visibleLayers.indexOf(layer);
      if (index >= 0) this.state.visibleLayers.splice(index, 1);
      else this.state.visibleLayers.push(layer);
      item.querySelector('.layer-visibility').style.opacity = this.state.visibleLayers.includes(layer) ? '1' : '0.3';
      this.render();
    });
    layerList?.addEventListener('change', (e) => {
      const sel = e.target.closest('.layer-type');
      if (!sel) return;
      const l = this.state.layerStack.find(x => x.id === sel.dataset.layer);
      if (l) l.type = sel.value;
    });

    // Window resize
    window.addEventListener('resize', () => this.resizeCanvas());
  },

  // Netlist Management
  generateNetlist() {
    const nets = {};
    
    // Group components by net
    this.state.traces.forEach(trace => {
      const netName = trace.net || 'unassigned';
      if (!nets[netName]) {
        nets[netName] = { name: netName, connections: [] };
      }
      nets[netName].connections.push({
        x1: trace.x1, y1: trace.y1,
        x2: trace.x2, y2: trace.y2
      });
    });

    this.state.nets = Object.values(nets);
    this.renderNetlist();
    return this.state.nets;
  },

  renderNetlist() {
    const container = document.querySelector('#netlistContent');
    if (!container) return;

    if (this.state.nets.length === 0) {
      container.innerHTML = `<p style="color: var(--muted);">${pcbT('pj_netlist_empty')}</p>`;
      return;
    }

    container.innerHTML = this.state.nets.map(net => `
      <div class="net-item" style="padding: 6px; border-bottom: 1px solid var(--line);">
        <strong>${net.name}</strong>
        <span style="color: var(--muted); font-size: 11px;"> (${net.connections.length} connections)</span>
      </div>
    `).join('');
  },

  addNet(name) {
    if (!this.state.nets.find(n => n.name === name)) {
      this.state.nets.push({ name, connections: [] });
      this.renderNetlist();
    }
  },

  assignNetToTrace(traceId, netName) {
    const trace = this.state.traces.find(t => t.id === traceId);
    if (trace) {
      trace.net = netName;
      this.generateNetlist();
    }
  }
};

// Initialize
pcbApp.init();
window.pcbApp = pcbApp;
