// PCB Layout Application
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
    refOverlayId: null   // 目前疊加中的公版 id
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
      { id: 'Edge.Cuts', name: 'Edge.Cuts (板框)', color: '#95a5a6', kind: 'edge' }
    ]);
  },

  renderLayerList() {
    const el = document.getElementById('layerList');
    if (!el) return;
    const cnt = {};
    this.state.traces.forEach(t => { const k = t.layer || 'F.Cu'; cnt[k] = (cnt[k] || 0) + 1; });
    el.innerHTML = (this.state.layerStack || []).map(l => {
      const vis = this.state.visibleLayers.includes(l.id);
      const n = cnt[l.id] ? `<span style="font-size:10px;color:var(--muted);margin-left:4px">${cnt[l.id]}條</span>` : '';
      const typeSel = l.kind === 'copper'
        ? `<select class="layer-type" data-layer="${l.id}" style="margin-left:auto;font-size:11px;padding:1px 4px;" onclick="event.stopPropagation()">` +
        ['Signal', 'GND', 'PWR', 'Mixed'].map(t => `<option ${l.type === t ? 'selected' : ''}>${t}</option>`).join('') + `</select>`
        : '';
      return `<div class="layer-item" data-layer="${l.id}"><div class="layer-color" style="background:${l.color}"></div>` +
        `<span class="layer-name">${l.name}</span>${n}${typeSel}<span class="layer-visibility" style="opacity:${vis ? 1 : 0.3};margin-left:8px">👁</span></div>`;
    }).join('');
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

    // Draw components
    this.drawComponents(scale);

    // Draw traces
    this.drawTraces(scale);

    // Draw vias
    this.drawVias(scale);

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

      ctx.fillStyle = this.compFill(comp);
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.strokeStyle = sel ? '#f39c12' : (comp.side === 'bottom' ? '#5dade2' : '#ecf0f1');
      ctx.lineWidth = sel ? 2 : 1;
      ctx.strokeRect(r.x, r.y, r.w, r.h);

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
        message: '板框尺寸過小，建議至少 10mm x 10mm'
      });
    }

    // Check component count
    if (this.state.components.length === 0) {
      results.push({
        type: 'info',
        message: '尚未放置任何元件'
      });
    }

    // Check trace count
    if (this.state.traces.length === 0) {
      results.push({
        type: 'info',
        message: '尚未建立任何走線'
      });
    }

    // Check trace clearance
    this.state.traces.forEach((trace, i) => {
      this.state.traces.forEach((other, j) => {
        if (i >= j) return;
        const dist = this.calculateTraceDistance(trace, other);
        if (dist < rules.clearance.traceToTrace) {
          results.push({
            type: 'error',
            message: `走線間距不足：${dist.toFixed(2)}mm < ${rules.clearance.traceToTrace}mm`
          });
        }
      });
    });

    // Check trace width
    this.state.traces.forEach(trace => {
      const width = trace.width || 0.3;
      if (width < rules.width.minTrace) {
        results.push({
          type: 'warning',
          message: `走線寬度過細：${width}mm < ${rules.width.minTrace}mm`
        });
      }
    });

    // Check via count
    if (this.state.vias.length === 0 && this.state.traces.length > 10) {
      results.push({
        type: 'info',
        message: '建議使用 Via 進行層間連接'
      });
    }

    // Check unconnected nets
    const nets = new Set(this.state.traces.map(t => t.net).filter(Boolean));
    if (nets.size < this.state.components.length / 2) {
      results.push({
        type: 'warning',
        message: '可能存在未連接的網路'
      });
    }

    // 電源網路線寬不足（net 名含 VCC/VIN/VDD/PWR/GND/PGND/SW/V+ → 視為電源/大電流）
    this.state.traces.forEach(t => {
      if (t.net && /vcc|vin|vdd|pwr|pgnd|gnd|^sw$|v\+|bat/i.test(t.net)) {
        const w = t.width || 0.3;
        if (w < rules.width.minPowerTrace)
          results.push({ type: 'warning', message: `電源/大電流線 ${t.net} 線寬 ${w}mm < ${rules.width.minPowerTrace}mm` });
      }
    });

    // 走線/元件 距板邊太近（板框 ±W/2, ±H/2）
    const halfW = this.state.boardWidth / 2, halfH = this.state.boardHeight / 2;
    const edgeGap = (x, y) => Math.min(halfW - Math.abs(x), halfH - Math.abs(y));
    this.state.traces.forEach((t, i) => {
      [[t.x1, t.y1], [t.x2, t.y2]].forEach(([x, y]) => {
        const g = edgeGap(x, y);
        if (g < rules.clearance.traceToEdge)
          results.push({ type: g < 0 ? 'error' : 'warning', message: `走線#${i + 1} 距板邊 ${g.toFixed(2)}mm < ${rules.clearance.traceToEdge}mm` });
      });
    });

    // 元件間距過近 / 重疊
    const comps = this.state.components;
    for (let i = 0; i < comps.length; i++)
      for (let j = i + 1; j < comps.length; j++) {
        const d = Math.hypot(comps[i].x - comps[j].x, comps[i].y - comps[j].y);
        if (d < rules.compSpacing)
          results.push({ type: d < rules.compSpacing / 2 ? 'error' : 'warning', message: `元件 ${comps[i].label}/${comps[j].label} 間距 ${d.toFixed(2)}mm < ${rules.compSpacing}mm` });
      }

    // Cin → IC 距離（沿用 EMI 角色指派）
    const byId = {}; comps.forEach(c => { byId[c.id] = c; });
    const cinSel = document.querySelector('.emi-role[data-role="cin"]'), icSel = document.querySelector('.emi-role[data-role="ic"]');
    const cin = cinSel && byId[cinSel.value], ic = icSel && byId[icSel.value];
    if (cin && ic) {
      const d = Math.hypot(cin.x - ic.x, cin.y - ic.y);
      if (d > rules.cinDist)
        results.push({ type: 'warning', message: `Cin 離 IC ${d.toFixed(2)}mm > ${rules.cinDist}mm → 輸入迴路電感大，拉近` });
    }

    // 多層板電源/地平面建議
    const cu = (this.state.layerStack || []).filter(l => l.kind === 'copper');
    if (cu.length >= 4 && !cu.some(l => l.type === 'GND'))
      results.push({ type: 'info', message: '多層板建議至少一層完整 GND 平面（降低迴路電感/EMI）' });

    // Display results
    const container = document.querySelector('#drcResults');
    const errorCount = results.filter(r => r.type === 'error').length;
    const warningCount = results.filter(r => r.type === 'warning').length;
    const infoCount = results.filter(r => r.type === 'info').length;

    if (results.length === 0) {
      container.innerHTML = '<p style="color: var(--accent-strong); padding: 12px;">✓ DRC 檢查通過</p>';
    } else {
      let header = `<div style="padding: 8px; border-bottom: 1px solid var(--line); font-size: 12px;">`;
      if (errorCount > 0) header += `<span style="color: var(--danger);">✕ ${errorCount} 個錯誤</span> `;
      if (warningCount > 0) header += `<span style="color: var(--warn);">! ${warningCount} 個警告</span> `;
      if (infoCount > 0) header += `<span style="color: var(--accent-strong);">i ${infoCount} 個資訊</span>`;
      header += `</div>`;

      container.innerHTML = header + results.map(r => `
        <div class="drc-item">
          <div class="drc-icon ${r.type}">${r.type === 'error' ? '✕' : r.type === 'warning' ? '!' : 'i'}</div>
          <span>${r.message}</span>
        </div>
      `).join('');
    }
  },

  loadDrcRules() {
    const v = (id, d) => { const el = document.getElementById(id); const n = el ? parseFloat(el.value) : NaN; return isNaN(n) ? d : n; };
    const cl = v('ruleClearance', 0.15);
    return {
      clearance: { traceToTrace: cl, traceToPad: cl, padToPad: cl, traceToEdge: v('ruleEdge', 0.3), viaToVia: 0.25 },
      width: { minTrace: v('ruleMinTrace', 0.1), maxTrace: 20, minPowerTrace: v('ruleMinPower', 0.3) },
      via: { minDrill: 0.2, minRing: 0.15 },
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
          <span style="font-size:11px;color:var(--accent-strong)">${b.soc} · ${b.layers} 層 · ${b.w}×${b.h}mm</span>
        </div>
        <div style="font-size:12px;color:var(--muted);margin:6px 0;line-height:1.6">${b.note}</div>
        <ul style="margin:6px 0;padding-left:16px;font-size:12px;color:var(--muted);line-height:1.6">
          ${b.circuits.map(c => `<li>${c}</li>`).join('')}
        </ul>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">
          <button class="primary-button ref-load" data-refid="${b.id}" style="padding:6px 12px;font-size:12px">📥 載入到 Layout（編輯）</button>
          <button class="icon-button ref-overlay" data-refid="${b.id}" style="padding:6px 12px;font-size:12px">🔍 疊加比較</button>
          <a href="${b.github}" target="_blank" rel="noopener" style="padding:6px 12px;font-size:12px;color:var(--accent-strong);text-decoration:none;align-self:center">原始碼 ↗</a>
        </div>
      </div>`).join('');
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
    const layerTxt = Object.keys(perLayer).map(l => `${l} ${perLayer[l]}條`).join('、') || '無';
    sum.innerHTML = `<div style="font-size:12px;color:var(--muted);line-height:1.7">` +
      `${this.state.layers} 層板 · 料件 ${comps.length}（頂 ${top}／底 ${bot}）· via ${this.state.vias.length}<br>走線：${layerTxt}</div>`;
    list.innerHTML = comps.map((c, i) =>
      `<div class="part-row" data-idx="${i}" style="display:flex;gap:6px;align-items:center;padding:3px 6px;border-radius:5px;cursor:pointer;font-size:12px;${this.state.selected === c ? 'background:var(--accent-soft);' : ''}">` +
      `<b style="font-family:ui-monospace,monospace;min-width:38px">${c.ref || c.label || '-'}</b>` +
      `<span style="color:var(--muted);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.part || c.label || ''}</span>` +
      `<span style="font-size:10px;padding:0 5px;border-radius:999px;background:${c.side === 'bottom' ? '#1f3a5f' : '#2d4a3e'};color:#cbd5e1">${c.side === 'bottom' ? '底' : '頂'}</span></div>`
    ).join('') || '<div style="font-size:12px;color:var(--muted);padding:4px 6px">尚無料件（載入公版或放置元件）</div>';
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
    const rate = a => a < 25 ? ['green', '良好'] : a < 100 ? ['orange', '偏大'] : ['red', '過大'];
    if (inPts.length >= 3) {
      const [c, t] = rate(inArea);
      issues.push({ sev: c === 'red' ? 'err' : c === 'orange' ? 'warn' : 'ok', msg: `輸入熱環面積 ≈ ${inArea.toFixed(1)} mm²（${t}）` });
    } else issues.push({ sev: 'info', msg: '輸入熱環需指派 Cin / IC / D 三者' });
    if (outPts.length >= 3) {
      const [c, t] = rate(outArea);
      issues.push({ sev: c === 'red' ? 'err' : c === 'orange' ? 'warn' : 'ok', msg: `輸出環面積 ≈ ${outArea.toFixed(1)} mm²（${t}）` });
    } else issues.push({ sev: 'info', msg: '輸出環需指派 D / L / Cout 三者' });
    if (inPts.length >= 3 && outPts.length >= 3 && inArea > outArea)
      issues.push({ sev: 'warn', msg: '⚠ 輸入熱環比輸出環大 → 優先縮小輸入環（di/dt 大、EMI 主因）' });
    if (role.cin && role.ic && dist(role.cin, role.ic) > 5)
      issues.push({ sev: 'warn', msg: `⚠ Cin 離 IC ${dist(role.cin, role.ic).toFixed(1)}mm（>5mm）→ 輸入迴路電感大，拉近` });
    if (role.l && role.ic && dist(role.l, role.ic) > 8)
      issues.push({ sev: 'info', msg: `電感離 SW ${dist(role.l, role.ic).toFixed(1)}mm，建議靠近 SW` });

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
      { sev: 'ok', msg: `載 ${p.I}A、ΔT ${p.dT}°C（${p.oz}oz）→ 建議最小線寬 ≈ ${wNeedMm.toFixed(2)} mm` },
      { sev, msg: `功率元件 Tj 簡估 ≈ ${Tj.toFixed(0)}°C（θ_ja≈${theta.toFixed(0)}°C/W）` }
    ];
    if (sev !== 'ok') issues.push({ sev: 'info', msg: '降溫：加大散熱銅面積、多打散熱孔、加厚銅、必要時加散熱片' });
    issues.push({ sev: 'info', msg: '🔒 逐條走線載流量精算為進階功能，登入 + PCB 解鎖後由後端計算' });
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

  bindEvents() {
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
      this.render();
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
        this.state.isPanning = true;
        this.canvas.style.cursor = 'grabbing';
      } else if (this.state.tool === 'trace') {
        // Start trace
        this.state.traceStart = pos;
      }
    });

    this.canvas?.addEventListener('mousemove', (e) => {
      if (this.state.isPanning) {
        const pos = this.getMousePos(e);
        this.state.panX += pos.x - this.state.lastMouse.x;
        this.state.panY += pos.y - this.state.lastMouse.y;
        this.state.lastMouse = pos;
        this.render();
      }
    });

    this.canvas?.addEventListener('mouseup', (e) => {
      if (this.state.isPanning) {
        this.state.isPanning = false;
        this.canvas.style.cursor = 'crosshair';
      }
    });

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
      container.innerHTML = '<p style="color: var(--muted);">尚無 Netlist 資料</p>';
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
