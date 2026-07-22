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
    zoneDraw: null,      // 進行中 zone {pts, net, cursor:[x,y]}
    showPinNums: true,   // pad 上顯示 pin number（Allegro 慣例，預設開）
    showPinNames: true,  // pad 下方顯示腳名/網路（夠大才畫）
    selectedTrace: null, // 選取中的走線（select 工具點走線；Delete 可刪）
    texts: [],           // 絲印文字 {x,y,text,layer,size}
    dims: [],            // 尺寸標註 {x1,y1,x2,y2}
    keepouts: [],        // 禁止區 {layer,pts}
    dimDraw: null,       // 進行中尺寸標註 {x1,y1,cx,cy}
    keepoutDraw: null,   // 進行中禁止區 {pts, cursor:[x,y]}
    selectedSet: [],     // 多選元件（Shift+點 加選、Shift+拖 框選）
    dragEndpoint: null,  // 走線端點拖曳 {trace, end:'a'|'b'}
    dragGroup: null,     // 群組拖曳快照 [{c, ox, oy}]＋dragAnchor
    dragAnchor: null,    // 群組拖曳起點（board 座標）
    boxSel: null,        // 進行中框選 {x1,y1,x2,y2}
    clipboard: []        // 複製暫存（Ctrl+C/V）
  },
  gridSize: 1, // 1mm

  init() {
    this.canvas = document.querySelector('#pcbCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.state.layerStack = this.buildLayerStack(this.state.layers);
    this.state.visibleLayers = this.state.layerStack.map(l => l.id);
    this.loadPalette();
    this.renderPalettePanel();
    this.resizeCanvas();
    this.watchCanvasSize();
    this.bindEvents();
    this.renderLayerList();
    this.renderPartsList();
    this.populateEmiSelects();
    this.renderRefBoards();
    this.populateIcPicker();
    this.populatePartsPicker();
    this.state.netRules = window.NetRules ? window.NetRules.load() : [];
    this.renderNetRules();
    // 自動存檔還原（有上次版面就接續；空版面不還原）
    if (window.PcbHistory && PcbHistory.boot(this)) this.toast(pcbT('pj_hist_restored'), 'info');
    this.render();
  },

  // 變更動作前呼叫：現狀進復原疊（Ctrl+Z 可回）
  hist() { if (window.PcbHistory) PcbHistory.push(this.state); },

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
    const w = Math.max(1, container.clientWidth), h = Math.max(1, container.clientHeight);
    if (this.canvas.width === w && this.canvas.height === h) return;   // 無變化不重畫
    this.canvas.width = w;
    this.canvas.height = h;
    this.render();
  },

  // 全域配色：背景／板框／各銅層／元件底色。存 localStorage，重載沿用。
  PALETTE_LS: 'vs-pcb-palette',
  paletteDefaults() {
    return {
      bg: '#1a1a2e', board: '#2d5a3d', grid: '#3d5a4e',
      'F.Cu': '#e74c3c', 'B.Cu': '#3498db',
      compTop: '#34495e', compBottom: '#1f3a5f'
    };
  },
  loadPalette() {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(this.PALETTE_LS)) || {}; } catch (e) {}
    this.state.palette = Object.assign(this.paletteDefaults(), saved);
    this.applyPalette();
  },
  savePalette() {
    try { localStorage.setItem(this.PALETTE_LS, JSON.stringify(this.state.palette)); } catch (e) {}
  },
  // 把配色推進 layerStack（走線/pad 取層色），其餘由 compFill / render 直接讀 palette
  applyPalette() {
    const p = this.state.palette || {};
    (this.state.layerStack || []).forEach(l => { if (p[l.id]) l.color = p[l.id]; });
  },
  renderPalettePanel() {
    const host = document.getElementById('paletteRows');
    if (!host) return;
    const p = this.state.palette || this.paletteDefaults();
    const rows = [
      ['bg', '畫布背景'], ['board', '板框'], ['grid', '格線'],
      ['F.Cu', '正面銅（F.Cu）'], ['B.Cu', '背面銅（B.Cu）'],
      ['compTop', '正面元件底色'], ['compBottom', '背面元件底色']
    ];
    host.innerHTML = rows.map(([k, label]) =>
      `<label style="display:flex;align-items:center;gap:8px;justify-content:space-between">
         <span>${label}</span>
         <input type="color" data-pal="${k}" value="${p[k] || '#000000'}"
                style="width:44px;height:24px;padding:0;border:1px solid var(--line);border-radius:4px;background:none;cursor:pointer">
       </label>`).join('');
    host.querySelectorAll('input[data-pal]').forEach(inp => {
      inp.addEventListener('input', e => {
        this.state.palette[inp.dataset.pal] = e.target.value;
        this.applyPalette();
        this.savePalette();
        this.renderLayerList();
        this.render();
      });
    });
    document.getElementById('paletteReset')?.addEventListener('click', () => {
      this.state.palette = this.paletteDefaults();
      this.applyPalette();
      this.savePalette();
      this.renderPalettePanel();
      this.renderLayerList();
      this.render();
    }, { once: true });
  },

  // 板面平移方向盤：點一下移動、長按連續移動；中間鍵＝適合視窗
  bindPanPad() {
    const pad = document.getElementById('pcbPanPad');
    if (!pad) return;
    const dir = { up: [0, 1], down: [0, -1], left: [1, 0], right: [-1, 0] };  // panX/panY 與視線方向相反
    pad.querySelectorAll('.pan-btn').forEach(btn => {
      const key = btn.dataset.pan;
      if (key === 'fit') { btn.addEventListener('click', () => this.zoomFit()); return; }
      const [dx, dy] = dir[key];
      let hold = null, rep = null;
      const step = k => {
        this.state.panX += dx * this.canvas.width * k;
        this.state.panY += dy * this.canvas.height * k;
        this.render();
      };
      const stop = () => { clearTimeout(hold); clearInterval(rep); hold = rep = null; };
      btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        step(0.25);
        hold = setTimeout(() => { rep = setInterval(() => step(0.10), 45); }, 300);
      });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => btn.addEventListener(ev, stop));
    });
  },

  // 容器尺寸一變（視窗縮放／側欄展開）就同步 canvas buffer，
  // 否則 buffer 與顯示尺寸脫節 → 滑鼠座標偏移、命中判定失準。
  watchCanvasSize() {
    const container = this.canvas?.parentElement;
    if (!container) return;
    if (typeof ResizeObserver !== 'undefined') {
      this._ro = new ResizeObserver(() => this.resizeCanvas());
      this._ro.observe(container);
    }
    window.addEventListener('resize', () => this.resizeCanvas());
  },

  render() {
    const { ctx, canvas, state } = this;
    const { zoom, panX, panY, boardWidth, boardHeight } = state;

    // Clear canvas（背景色可由「整體配色」面板設定）
    ctx.fillStyle = (state.palette && state.palette.bg) || '#1a1a2e';
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

    // Backdrill 標記（虛線圈疊加在 via 上）
    if (window.Backdrill) Backdrill.draw(this, scale);

    // 禁止區／絲印文字／尺寸標註／進行中預覽
    this.drawKeepouts(scale);
    this.drawTexts(scale);
    this.drawDims(scale);
    this.drawDimPreview(scale);
    this.drawBoxSel(scale);

    // Restore context
    ctx.restore();

    // 資料有動就會走到這裡：debounce 自動存檔
    if (window.PcbHistory) PcbHistory.saveSoon(this);
  },

  // ---- 禁止區（keepout）：斜線填充多邊形 ----
  drawKeepouts(scale) {
    const { ctx, state } = this;
    const toS = p => [this.canvas.width / 2 + p[0] * scale, this.canvas.height / 2 + p[1] * scale];
    const drawPoly = (pts, closed) => {
      ctx.beginPath();
      pts.forEach((p, i) => { const [sx, sy] = toS(p); i ? ctx.lineTo(sx, sy) : ctx.moveTo(sx, sy); });
      if (closed) ctx.closePath();
    };
    (state.keepouts || []).forEach(k => {
      if (!state.visibleLayers.includes(k.layer)) return;
      ctx.save();
      drawPoly(k.pts, true);
      ctx.globalAlpha = 0.12; ctx.fillStyle = '#e74c3c'; ctx.fill();
      ctx.globalAlpha = 0.8; ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]); ctx.stroke();
      // ⊘ 記號在質心
      const cx = k.pts.reduce((s, p) => s + p[0], 0) / k.pts.length;
      const cy = k.pts.reduce((s, p) => s + p[1], 0) / k.pts.length;
      const [sx, sy] = toS([cx, cy]);
      ctx.setLineDash([]); ctx.font = '14px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#e74c3c'; ctx.globalAlpha = 0.9; ctx.fillText('⊘', sx, sy);
      ctx.restore();
    });
    // 進行中
    if (state.keepoutDraw && state.keepoutDraw.pts.length) {
      ctx.save();
      const pts = state.keepoutDraw.pts.concat(state.keepoutDraw.cursor ? [state.keepoutDraw.cursor] : []);
      drawPoly(pts, false);
      ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]); ctx.globalAlpha = 0.9; ctx.stroke();
      ctx.restore();
    }
  },

  // ---- 絲印文字 ----
  drawTexts(scale) {
    const { ctx, state } = this;
    (state.texts || []).forEach(t => {
      if (!state.visibleLayers.includes(t.layer || 'F.SilkS')) return;
      const sx = this.canvas.width / 2 + t.x * scale, sy = this.canvas.height / 2 + t.y * scale;
      ctx.save();
      ctx.font = `${Math.max(8, (t.size || 1.5) * scale)}px sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = (t.layer === 'B.SilkS') ? '#b7950b' : '#f1c40f';
      ctx.fillText(t.text, sx, sy);
      ctx.restore();
    });
  },

  // ---- 尺寸標註：兩端刻度線＋mm 標籤 ----
  drawDimLine(x1, y1, x2, y2, scale, preview) {
    const { ctx } = this;
    const toX = v => this.canvas.width / 2 + v * scale, toY = v => this.canvas.height / 2 + v * scale;
    const len = Math.hypot(x2 - x1, y2 - y1);
    if (len < 1e-6) return;
    const ux = (x2 - x1) / len, uy = (y2 - y1) / len, px = -uy, py = ux;
    const tick = 4; // px
    ctx.save();
    ctx.strokeStyle = preview ? '#f39c12' : '#aab7c4';
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = 1;
    if (preview) ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(toX(x1), toY(y1)); ctx.lineTo(toX(x2), toY(y2));
    [[x1, y1], [x2, y2]].forEach(([x, y]) => {
      ctx.moveTo(toX(x) + px * tick, toY(y) + py * tick);
      ctx.lineTo(toX(x) - px * tick, toY(y) - py * tick);
    });
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = '11px monospace'; ctx.textAlign = 'center';
    ctx.fillText(`${len.toFixed(2)}mm`, toX((x1 + x2) / 2) + px * 12, toY((y1 + y2) / 2) + py * 12);
    ctx.restore();
  },
  drawDims(scale) {
    (this.state.dims || []).forEach(d => this.drawDimLine(d.x1, d.y1, d.x2, d.y2, scale, false));
  },
  drawDimPreview(scale) {
    const d = this.state.dimDraw;
    if (d && d.cx != null) this.drawDimLine(d.x1, d.y1, d.cx, d.cy, scale, true);
  },

  // 框選橡皮筋矩形（Shift+拖空白）
  drawBoxSel(scale) {
    const bs = this.state.boxSel;
    if (!bs) return;
    const { ctx } = this;
    const toX = v => this.canvas.width / 2 + v * scale, toY = v => this.canvas.height / 2 + v * scale;
    const x = toX(Math.min(bs.x1, bs.x2)), y = toY(Math.min(bs.y1, bs.y2));
    const w = Math.abs(bs.x2 - bs.x1) * scale, h = Math.abs(bs.y2 - bs.y1) * scale;
    ctx.save();
    ctx.fillStyle = 'rgba(243,156,18,0.10)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#f39c12';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 3]);
    ctx.strokeRect(x, y, w, h);
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
      // pin number（＋可選 pin 名/網路）標在 pad 上，讓人看得出接的是第幾腳
      this.drawPadLabel(pad, sx, sy, w, h, scale);
    });
  },

  // pad 標註：號碼畫在 pad 中央；放大到看得清時再加腳名/網路在下方。
  // 標註不隨 pad 旋轉（永遠正向可讀），太小就不畫避免糊成一團。
  drawPadLabel(pad, sx, sy, w, h, scale) {
    if (!this.state.showPinNums) return;
    const num = pad.num == null ? '' : String(pad.num);
    if (!num) return;
    const box = Math.min(w, h);
    if (box < 7) return;                       // 太小畫了也看不清
    const { ctx } = this;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const fs = Math.max(6, Math.min(11, box * 0.62));
    ctx.font = `600 ${fs}px ui-monospace,SFMono-Regular,Menlo,monospace`;
    ctx.lineWidth = Math.max(2, fs * 0.28);
    ctx.strokeStyle = 'rgba(10,14,32,.85)';    // 描邊：任何 pad 顏色上都讀得到
    ctx.lineJoin = 'round';
    ctx.strokeText(num, 0, 0);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(num, 0, 0);
    // 腳名／網路：只在夠大時顯示，避免蓋住旁邊的 pad
    const sub = this.state.showPinNames ? (pad.name || pad.net || '') : '';
    if (sub && box >= 16) {
      const f2 = Math.max(6, Math.min(9, box * 0.34));
      ctx.font = `500 ${f2}px ui-sans-serif,system-ui,sans-serif`;
      ctx.lineWidth = Math.max(2, f2 * 0.3);
      ctx.strokeText(sub, 0, h / 2 + f2 * 0.9);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(sub, 0, h / 2 + f2 * 0.9);
    }
    ctx.restore();
  },

  drawGrid(scale) {
    const { ctx, state } = this;
    const { boardWidth, boardHeight } = state;

    const startX = (this.canvas.width / 2 - (boardWidth * scale) / 2);
    const startY = (this.canvas.height / 2 - (boardHeight * scale) / 2);
    const endX = startX + boardWidth * scale;
    const endY = startY + boardHeight * scale;

    ctx.strokeStyle = (state.palette && state.palette.grid) || '#3d5a4e';
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
    if (comp.color) return comp.color;                       // 個別元件上色優先
    const pal = this.state.palette || {};
    if (comp.side === 'bottom') return pal.compBottom || '#1f3a5f';
    return (pal.kind && pal.kind[comp.kind])
      || { ic: '#34495e', passive: '#3f5561', conn: '#6e5b1e', mech: '#4a4a55' }[comp.kind]
      || pal.compTop || '#34495e';
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
      // 多選集內成員一律以選取色高亮（state.selected 只是集內錨點）
      const sel = state.selected === comp || (state.selectedSet && state.selectedSet.includes(comp));

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
      // 個別走線可覆蓋顏色（trace.color），沒設就用該層顏色
      ctx.strokeStyle = trace.color || (ldef ? ldef.color : '#e74c3c');
      ctx.lineWidth = Math.max(1, (trace.width || 0.3) * scale);
      ctx.globalAlpha = lid === 'F.Cu' ? 1 : 0.85;
      ctx.beginPath();
      ctx.moveTo(this.canvas.width / 2 + trace.x1 * scale, this.canvas.height / 2 + trace.y1 * scale);
      ctx.lineTo(this.canvas.width / 2 + trace.x2 * scale, this.canvas.height / 2 + trace.y2 * scale);
      ctx.stroke();
    });
    // 選取中的走線：橘色外框高亮（Delete 可刪）
    const sel = state.selectedTrace;
    if (sel && state.traces.includes(sel)) {
      ctx.strokeStyle = '#f39c12';
      ctx.globalAlpha = 0.9;
      ctx.lineWidth = Math.max(3, (sel.width || 0.3) * scale + 4);
      ctx.beginPath();
      ctx.moveTo(this.canvas.width / 2 + sel.x1 * scale, this.canvas.height / 2 + sel.y1 * scale);
      ctx.lineTo(this.canvas.width / 2 + sel.x2 * scale, this.canvas.height / 2 + sel.y2 * scale);
      ctx.stroke();
    }
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

    // 禁止區：同層走線/via 闖入 → error
    if ((this.state.keepouts || []).length) {
      const inPoly = (x, y, pts) => {
        let ins = false;
        for (let a = 0, b = pts.length - 1; a < pts.length; b = a++) {
          const [xa, ya] = pts[a], [xb, yb] = pts[b];
          if ((ya > y) !== (yb > y) && x < (xb - xa) * (y - ya) / (yb - ya) + xa) ins = !ins;
        }
        return ins;
      };
      const segX = (x1, y1, x2, y2, x3, y3, x4, y4) => {
        const d = (x2 - x1) * (y4 - y3) - (y2 - y1) * (x4 - x3);
        if (Math.abs(d) < 1e-12) return false;
        const t = ((x3 - x1) * (y4 - y3) - (y3 - y1) * (x4 - x3)) / d;
        const u = ((x3 - x1) * (y2 - y1) - (y3 - y1) * (x2 - x1)) / d;
        return t >= 0 && t <= 1 && u >= 0 && u <= 1;
      };
      this.state.keepouts.forEach((k, ki) => {
        this.state.traces.forEach((t, ti) => {
          if ((t.layer || 'F.Cu') !== k.layer) return;
          let bad = inPoly(t.x1, t.y1, k.pts) || inPoly(t.x2, t.y2, k.pts);
          for (let a = 0; !bad && a < k.pts.length; a++) {
            const [xa, ya] = k.pts[a], [xb, yb] = k.pts[(a + 1) % k.pts.length];
            bad = segX(t.x1, t.y1, t.x2, t.y2, xa, ya, xb, yb);
          }
          if (bad) results.push({ type: 'error', message: pcbT('pj_drc_keepout', { i: ti + 1, layer: k.layer, k: ki + 1 }) });
        });
        this.state.vias.forEach((v, vi) => {
          if (inPoly(v.x, v.y, k.pts))
            results.push({ type: 'error', message: pcbT('pj_drc_keepout_via', { i: vi + 1, k: ki + 1 }) });
        });
      });
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

    // Backdrill：已計算的背鑽數＋板況變更後的過期警示
    if (window.Backdrill) {
      const bs = Backdrill.status();
      if (bs.n) results.push({ type: bs.stale ? 'warning' : 'info', message: pcbT(bs.stale ? 'bd_drc_stale' : 'bd_drc', { n: bs.n }) });
    }

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
    this.hist();
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
    this.hist();
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
    const name = s.kicad ? s.kicad.fileName.replace(/\.kicad_pcb$/i, '') + '-hardwareai.kicad_pcb' : 'hardwareai.kicad_pcb';
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
    const base = s.kicad ? s.kicad.fileName : 'hardwareai';
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
    try { window.Observe && window.Observe.track('pcb:ic_place'); } catch (e) { }
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
    this.hist();
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
    this.hist();
    this.state.components.push(comp);
    this.state.selected = comp;
    this.renderPartsList();
    this.populateEmiSelects();
    this.render();
    say(pcbT('pl_placed', { ref, name: comp.part, pads: r.pads.length }) + ' ' + pcbT('pj_fp_src'));
  },

  // 公版元件來源：schema v2 用 components（含尺寸/正反面），舊資料退回 blocks
  // pcb-ref-fp.js 解析器有配到 footprint 時掛真 pad（pin number/腳名），body 以 footprint 為準
  refBoardParts(b) {
    if (b.components && b.components.length) {
      return b.components.map((c, i) => {
        const comp = {
          id: `ref-${b.id}-${i}`, type: 'ic', x: c.x, y: c.y, w: c.w, h: c.h,
          side: c.side || 'top', kind: c.kind || 'ic', ref: c.ref, part: c.part,
          label: c.ref || c.part || ''
        };
        const fp = (window.RefFP && window.RefFP.resolve) ? window.RefFP.resolve(c) : null;
        if (fp && fp.ok) {
          comp.pads = fp.pads; comp.w = fp.body.w; comp.h = fp.body.h;
          if (comp.side === 'bottom') comp.pads.forEach(p => { if (p.side === 'F') p.side = 'B'; });
          if (fp.pkg) comp.package = fp.pkg;
          comp.fpMeta = fp.meta;
        }
        return comp;
      });
    }
    return (b.blocks || []).map((blk, i) => ({ id: `ref-${b.id}-${i}`, type: 'ic', x: blk.x, y: blk.y, label: blk.label }));
  },

  loadRefBoard(id) {
    const b = (window.PCB_REFBOARDS || []).find(x => x.id === id);
    if (!b) return;
    try { window.Observe && window.Observe.track('refboard:' + id); } catch (e) { }  // 哪些公版最常被載
    this.hist();
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

  // 滑鼠事件是 CSS px，繪圖座標是 canvas buffer px。兩者尺寸可能不同
  // （容器被撐大／視窗改變而 buffer 未同步）→ 必須換算，否則點擊位置與畫面偏移，
  // 連帶 compHit 命中不到元件（零件拖不動）。
  getMousePos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const sx = rect.width ? this.canvas.width / rect.width : 1;
    const sy = rect.height ? this.canvas.height / rect.height : 1;
    return {
      x: (e.clientX - rect.left) * sx,
      y: (e.clientY - rect.top) * sy
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

  // 目前作用選集：多選集優先，否則單選（給對齊/分佈/微調/旋轉共用）
  selectionList() {
    const set = this.state.selectedSet || [];
    if (set.length) return set.slice();
    return this.state.selected ? [this.state.selected] : [];
  },

  // 單顆旋轉（角度同步到 pad）
  rotateOne(c, delta) {
    const norm = a => ((a % 360) + 360) % 360;
    c.rot = norm((c.rot || 0) + delta);
    (c.pads || []).forEach(p => { p.rot = norm((p.rot || 0) + delta); });
  },

  // 旋轉選取：多選＝繞群組中心公轉＋各自自轉；單選＝原地自轉
  rotateSelected(delta) {
    const sel = this.selectionList();
    if (!sel.length) return;
    this.hist();
    if (sel.length > 1) {
      // 群組中心（各元件中心的平均）
      const cx = sel.reduce((s, c) => s + c.x, 0) / sel.length;
      const cy = sel.reduce((s, c) => s + c.y, 0) / sel.length;
      const th = delta * Math.PI / 180, co = Math.cos(th), si = Math.sin(th);
      sel.forEach(c => {
        const dx = c.x - cx, dy = c.y - cy;
        c.x = Math.round((cx + dx * co - dy * si) * 1e6) / 1e6;
        c.y = Math.round((cy + dx * si + dy * co) * 1e6) / 1e6;
        this.rotateOne(c, delta);
      });
    } else {
      this.rotateOne(sel[0], delta);
    }
    this.state.ratsnest = null;
    this.syncSelPanel();
    this.render();
  },

  // 方向鍵微調：把選集平移 (dx,dy) mm（Ctrl/⌘＝細步）
  nudgeSelected(dx, dy) {
    const sel = this.selectionList();
    if (!sel.length) return;
    this.hist();
    sel.forEach(c => { c.x = Math.round((c.x + dx) * 1e6) / 1e6; c.y = Math.round((c.y + dy) * 1e6) / 1e6; });
    this.state.ratsnest = null;
    this.syncSelPanel();
    this.render();
  },

  // 對齊：left/right/top/bottom/centerH(垂直中線,對齊 x)/centerV(水平中線,對齊 y)
  alignSelected(mode) {
    const sel = this.selectionList();
    if (sel.length < 2) { this.toast(pcbT('pj_need2'), 'warn'); return; }
    this.hist();
    const L = c => c.x - (c.w || 0) / 2, R = c => c.x + (c.w || 0) / 2;
    const T = c => c.y - (c.h || 0) / 2, B = c => c.y + (c.h || 0) / 2;
    const minL = Math.min(...sel.map(L)), maxR = Math.max(...sel.map(R));
    const minT = Math.min(...sel.map(T)), maxB = Math.max(...sel.map(B));
    sel.forEach(c => {
      if (mode === 'left') c.x = minL + (c.w || 0) / 2;
      else if (mode === 'right') c.x = maxR - (c.w || 0) / 2;
      else if (mode === 'top') c.y = minT + (c.h || 0) / 2;
      else if (mode === 'bottom') c.y = maxB - (c.h || 0) / 2;
      else if (mode === 'centerH') c.x = (minL + maxR) / 2;
      else if (mode === 'centerV') c.y = (minT + maxB) / 2;
      c.x = Math.round(c.x * 1e6) / 1e6; c.y = Math.round(c.y * 1e6) / 1e6;
    });
    this.state.ratsnest = null;
    this.syncSelPanel();
    this.render();
  },

  // 分佈：≥3 顆，沿 axis('h'|'v') 讓「中心」等距（首尾固定）
  distributeSelected(axis) {
    const sel = this.selectionList();
    if (sel.length < 3) { this.toast(pcbT('pj_need3'), 'warn'); return; }
    this.hist();
    const key = axis === 'v' ? 'y' : 'x';
    const sorted = sel.slice().sort((a, b) => a[key] - b[key]);
    const first = sorted[0][key], last = sorted[sorted.length - 1][key];
    const gap = (last - first) / (sorted.length - 1);
    sorted.forEach((c, i) => { c[key] = Math.round((first + gap * i) * 1e6) / 1e6; });
    this.state.ratsnest = null;
    this.syncSelPanel();
    this.render();
  },

  // 刪除選取元件（Delete 鍵；Ctrl+Z 可回復）
  deleteSelected() {
    const c = this.state.selected;
    if (!c) return;
    this.hist();
    const i = this.state.components.indexOf(c);
    if (i >= 0) this.state.components.splice(i, 1);
    this.state.selected = null;
    this.state.ratsnest = null;
    this.toast(pcbT('pj_del_comp', { ref: c.ref || c.label || '?' }), 'info');
    this.renderPartsList();
    this.populateEmiSelects();
    this.syncSelPanel();
    this.render();
  },

  // 貼上剪貼簿元件：每顆給新 id/新 refdes、位置 +2mm，貼完選取這批
  pasteClipboard() {
    const clip = this.state.clipboard || [];
    if (!clip.length) return;
    this.hist();
    const now = Date.now();
    const pasted = clip.map((snap, i) => {
      const c = JSON.parse(JSON.stringify(snap));
      c.id = `paste-${now}-${i}`;
      c.x = (c.x || 0) + 2; c.y = (c.y || 0) + 2;
      const pre = (String(c.ref || 'U').match(/^[A-Za-z]+/) || ['U'])[0];
      c.ref = this.nextRef(pre);
      c.label = c.ref;
      this.state.components.push(c);   // push 逐顆，讓 nextRef 看得到剛加的、不撞號
      return c;
    });
    this.state.selectedSet = pasted;
    this.state.selected = pasted[pasted.length - 1];
    this.state.selectedTrace = null;
    this.state.ratsnest = null;
    this.toast(pcbT('pj_pasted', { n: pasted.length }), 'info');
    this.renderPartsList();
    this.populateEmiSelects();
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
    // 顏色欄反映目前生效色（自訂色優先，否則顯示預設色）
    const col = document.getElementById('selColor');
    if (col && document.activeElement !== col) col.value = c.color || this.compFill(c) || '#34495e';
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
    // extra 帶命中物件參照（pad/via/trace），netlabel 等要「改到原物件」時用
    const consider = (x, y, net, d, extra) => { if (!best || d < best.d) best = Object.assign({ x, y, net: net || '', d }, extra || {}); };
    for (const c of this.state.components) {
      for (const p of (c.pads || [])) {
        if (p.cu === false) continue;
        const a = this.padAbs(c, p);
        const d = Math.hypot(bx - a.x, by - a.y);
        if (d <= Math.max(p.w || 0.5, p.h || 0.5) / 2 + 0.1) consider(a.x, a.y, p.net, d, { pad: p });
      }
    }
    for (const v of this.state.vias) {
      const d = Math.hypot(bx - v.x, by - v.y);
      if (d <= (v.od || 0.6) / 2 + 0.1) consider(v.x, v.y, v.net, d, { via: v });
    }
    for (const t of this.state.traces) {
      for (const [x, y] of [[t.x1, t.y1], [t.x2, t.y2]]) {
        const d = Math.hypot(bx - x, by - y);
        if (d <= 0.5) consider(x, y, t.net, d, { trace: t });
      }
    }
    return best;
  },

  // 走線命中：點到線段距離 ≤ 半寬＋0.3mm（可見層才算）
  traceHit(bx, by) {
    let best = null;
    for (const t of this.state.traces) {
      if (!this.state.visibleLayers.includes(t.layer || 'F.Cu')) continue;
      const dx = t.x2 - t.x1, dy = t.y2 - t.y1;
      const L2 = dx * dx + dy * dy;
      const u = L2 ? Math.max(0, Math.min(1, ((bx - t.x1) * dx + (by - t.y1) * dy) / L2)) : 0;
      const d = Math.hypot(bx - (t.x1 + u * dx), by - (t.y1 + u * dy));
      const r = (t.width || 0.3) / 2 + 0.3;
      if (d <= r && (!best || d < best.d)) best = { t, d };
    }
    return best ? best.t : null;
  },

  // 走線端點命中：靠近某條走線的端點（可見層）→ 回 {trace, end:'a'|'b'} 供拖曳
  traceEndpointHit(bx, by, tol) {
    tol = tol || 0.6;
    let best = null;
    for (const t of this.state.traces) {
      if (!this.state.visibleLayers.includes(t.layer || 'F.Cu')) continue;
      const da = Math.hypot(bx - t.x1, by - t.y1), db = Math.hypot(bx - t.x2, by - t.y2);
      if (da <= tol && (!best || da < best.d)) best = { trace: t, end: 'a', d: da };
      if (db <= tol && (!best || db < best.d)) best = { trace: t, end: 'b', d: db };
    }
    return best ? { trace: best.trace, end: best.end } : null;
  },

  // 依前綴取下一個未用的 refdes（複製貼上時避免撞號）
  nextRef(prefix) {
    prefix = prefix || 'U';
    let n = 0;
    const re = new RegExp('^' + prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(\\d+)$');
    for (const c of this.state.components) { const m = re.exec(c.ref || ''); if (m) n = Math.max(n, +m[1]); }
    return prefix + (n + 1);
  },

  // ---- 差分對佈線 / 等長調諧（B4-③）----
  // 配對網名：X_P↔X_N、…P↔…N、…+↔…-（存在於板上才算）
  pairNetOf(net) {
    if (!net) return null;
    const subs = [['_P', '_N'], ['_N', '_P'], ['_p', '_n'], ['_n', '_p'], ['P', 'N'], ['N', 'P'], ['+', '-'], ['-', '+']];
    for (const [a, b] of subs) {
      if (net.endsWith(a)) {
        const cand = net.slice(0, net.length - a.length) + b;
        if (cand !== net && this.netExists(cand)) return cand;
      }
    }
    return null;
  },

  netExists(net) {
    for (const c of this.state.components) for (const p of (c.pads || [])) if ((p.net || '') === net) return true;
    for (const t of this.state.traces) if ((t.net || '') === net) return true;
    return false;
  },

  findNetPad(net, nx, ny) {
    let best = null;
    for (const c of this.state.components) for (const p of (c.pads || [])) {
      if ((p.net || '') !== net) continue;
      const a = this.padAbs(c, p);
      const d = Math.hypot(a.x - nx, a.y - ny);
      if (!best || d < best.d) best = { x: a.x, y: a.y, d };
    }
    return best && best.d <= 5 ? best : null; // 配對腳限 5mm 內
  },

  // 差分對間距：Constraint Manager 的 class pairGap > NetRules gap > 0.2mm
  diffGapOf(net) {
    try {
      if (window.ConstraintMgr) {
        const cls = ConstraintMgr.classOf(ConstraintMgr.load(), net);
        if (cls && cls.elec && cls.elec.pairGap > 0) return cls.elec.pairGap;
      }
    } catch (e) { }
    if (window.NetRules) {
      const r = NetRules.match(this.state.netRules || [], net);
      if (r && r.gap > 0) return r.gap;
    }
    return 0.2;
  },

  // 等長調諧：把 net 的最長段換成蛇形，補到目標長（空目標＝對齊配對網路）
  meanderTune() {
    const msg = document.getElementById('tuneMsg');
    const say = (t, k) => { if (msg) msg.textContent = t; this.toast(t, k || 'info'); };
    const net = document.getElementById('tuneNet')?.value?.trim();
    if (!net) { say(pcbT('pj_tune_nonet'), 'warn'); return; }
    if (!window.NetRules) return;
    const L = NetRules.netLength(this.state.traces, net);
    if (!(L > 0)) { say(pcbT('pj_tune_notrace', { net }), 'warn'); return; }
    let target = parseFloat(document.getElementById('tuneTarget')?.value);
    let pair = null;
    if (!(target > 0)) {
      pair = this.pairNetOf(net);
      if (!pair) { say(pcbT('pj_tune_nopair', { net }), 'warn'); return; }
      target = NetRules.netLength(this.state.traces, pair);
    }
    const dL = target - L;
    if (dL < 0.05) { say(pcbT('pj_tune_already', { len: L.toFixed(2), target: target.toFixed(2) }), 'info'); return; }
    const segs = this.state.traces.filter(t => (t.net || '') === net);
    let seg = null, best = 0;
    for (const t of segs) { const l = Math.hypot(t.x2 - t.x1, t.y2 - t.y1); if (l > best) { best = l; seg = t; } }
    const w = seg.width || 0.3;
    const s = Math.max(4 * w, 1.2);            // 每 bump 沿線耗長
    const kMax = Math.floor((best - 1.0) / s); // 兩端留 0.5 lead
    if (kMax < 1) { say(pcbT('pj_tune_nofit'), 'error'); return; }
    let k = Math.min(kMax, Math.max(1, Math.ceil(dL / (2 * 2.0)))); // 振幅上限 2mm 起算
    let A = dL / (2 * k);
    if (A > 3.0) { say(pcbT('pj_tune_nofit'), 'error'); return; }   // 段不夠長塞不下
    // 蛇形折線（單側方波；每 bump 額外 +2A）
    const ux = (seg.x2 - seg.x1) / best, uy = (seg.y2 - seg.y1) / best, pxv = -uy, pyv = ux;
    const lead = (best - k * s) / 2;
    const pts = [[seg.x1, seg.y1]];
    let cx = seg.x1 + ux * lead, cy = seg.y1 + uy * lead;
    pts.push([cx, cy]);
    for (let i = 0; i < k; i++) {
      pts.push([cx + pxv * A, cy + pyv * A]);
      cx += ux * (s / 2); cy += uy * (s / 2);
      pts.push([cx + pxv * A, cy + pyv * A]);
      pts.push([cx, cy]);
      cx += ux * (s / 2); cy += uy * (s / 2);
      pts.push([cx, cy]);
    }
    pts.push([seg.x2, seg.y2]);
    this.hist();
    this.state.traces.splice(this.state.traces.indexOf(seg), 1);
    pts.forEach((p, i) => {
      if (i === 0) return;
      const [x1, y1] = pts[i - 1], [x2, y2] = p;
      if (Math.hypot(x2 - x1, y2 - y1) < 1e-6) return;
      this.state.traces.push({ id: `trace-${Date.now()}-${i}`, x1, y1, x2, y2, width: w, layer: seg.layer, net });
    });
    this.state.ratsnest = null;
    const after = NetRules.netLength(this.state.traces, net);
    say(pcbT('pj_tune_done', { net, before: L.toFixed(2), after: after.toFixed(2), target: target.toFixed(2), k, amp: A.toFixed(2) }), 'info');
    this.render();
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
    // 即時間距提示：預覽段 vs 同層異網走線（Constraint 矩陣感知）
    if (window.PadDrc && window.PadDrc._geom) {
      const gm = window.PadDrc._geom;
      const lay = this.state.traceLayer || 'F.Cu';
      const w2 = (this.state.traceWidth || 0.3) / 2;
      const cmData = window.ConstraintMgr ? ConstraintMgr.load() : null;
      let worstD = Infinity, worstReq = 0;
      for (const t of this.state.traces) {
        if ((t.layer || 'F.Cu') !== lay) continue;
        if (td.net && t.net && t.net === td.net) continue;
        const d = gm.segSegDist(td.x1, td.y1, td.x2, td.y2, t.x1, t.y1, t.x2, t.y2) - w2 - (t.width || 0.3) / 2;
        const req = cmData ? ConstraintMgr.clearanceBetween(cmData, td.net || '', t.net || '', 0.15) : 0.15;
        if (d - req < worstD - worstReq) { worstD = d; worstReq = req; }
      }
      if (worstD < worstReq) { over = true; label += ' │ ' + pcbT('pj_draw_clr', { d: Math.max(0, worstD).toFixed(2), lim: worstReq }); }
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
    // 動態填充模式（Status 面板）：smooth=實算避讓+thermal、rough=純半透明、disabled=只畫外框
    const fillMode = localStorage.getItem('pcb-dyn-fill') || 'smooth';
    const pip = (px, py, pts) => {
      let ins = false;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
        if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) ins = !ins;
      }
      return ins;
    };
    for (const z of zs) {
      const col = (layerOf(z.layer) || {}).color || '#16a085';
      if (fillMode !== 'disabled') {
        const off = document.createElement('canvas');
        off.width = this.canvas.width; off.height = this.canvas.height;
        const o = off.getContext('2d');
        o.fillStyle = col;
        o.globalAlpha = 0.4;
        o.beginPath();
        z.pts.forEach((p, i) => i ? o.lineTo(X(p[0]), Y(p[1])) : o.moveTo(X(p[0]), Y(p[1])));
        o.closePath(); o.fill();
        if (fillMode === 'smooth') {
          // 避讓打洞（destination-out）：異網 pad / 走線 / via；同網 pad＝thermal 環隙＋輻條
          o.globalAlpha = 1;
          o.globalCompositeOperation = 'destination-out';
          const c = z.clearance || 0.3;
          const thermalOn = z.thermal !== false && !!z.net;
          const spokes = [];
          for (const comp of state.components) for (const p of (comp.pads || [])) {
            if (p.cu === false) continue;
            const sideOk = p.side === '*' || (z.layer === 'F.Cu' && p.side === 'F') || (z.layer === 'B.Cu' && p.side === 'B');
            if (!sideOk) continue;
            const a = this.padAbs(comp, p);
            const same = z.net && (p.net || '') === z.net;
            if (same && (!thermalOn || !pip(a.x, a.y, z.pts))) continue; // 實心連接
            o.save();
            o.translate(X(a.x), Y(a.y));
            o.rotate(-(p.rot || 0) * Math.PI / 180);
            o.fillRect(-((p.w || 0.5) / 2 + c) * scale, -((p.h || 0.5) / 2 + c) * scale,
                       ((p.w || 0.5) + 2 * c) * scale, ((p.h || 0.5) + 2 * c) * scale);
            o.restore();
            if (same) {
              const L = (Math.max(p.w || 0.5, p.h || 0.5) / 2 + c + 0.05);
              const a0 = ((p.rot || 0) % 360) * Math.PI / 180;
              for (let k = 0; k < 4; k++) {
                const ang = a0 + k * Math.PI / 2;
                spokes.push([a.x, a.y, a.x + L * Math.cos(ang), a.y + L * Math.sin(ang)]);
              }
            }
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
          // 輻條（回暗色畫在 zone 圖層上；pad 本體由元件層蓋回）
          o.globalCompositeOperation = 'source-over';
          o.globalAlpha = 0.4;
          o.strokeStyle = col;
          o.lineWidth = 0.4 * scale;
          for (const s of spokes) {
            o.beginPath(); o.moveTo(X(s[0]), Y(s[1])); o.lineTo(X(s[2]), Y(s[3])); o.stroke();
          }
        }
        ctx.drawImage(off, 0, 0);
      }
      // 外框
      ctx.strokeStyle = col;
      ctx.globalAlpha = 0.9;
      ctx.lineWidth = 1;
      if (fillMode === 'disabled') ctx.setLineDash([4, 3]);
      ctx.beginPath();
      z.pts.forEach((p, i) => i ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1])));
      ctx.closePath(); ctx.stroke();
      ctx.setLineDash([]);
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
    this.hist();
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
    this.hist();
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
    this.bindPanPad();

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

    // 選取物件上色（元件或走線皆可；空值＝回到層/種類預設色）
    document.getElementById('selColor')?.addEventListener('input', (e) => {
      const t = this.state.selected;
      if (!t) return;
      t.color = e.target.value;
      this.render();
    });
    document.getElementById('selColorClear')?.addEventListener('click', () => {
      const t = this.state.selected;
      if (!t) return;
      delete t.color;
      this.render();
      this.syncSelPanel();
    });

    // pin number / 腳名 顯示開關
    document.getElementById('pinNumToggle')?.addEventListener('change', (e) => {
      this.state.showPinNums = e.target.checked;
      this.render();
    });
    document.getElementById('pinNameToggle')?.addEventListener('change', (e) => {
      this.state.showPinNames = e.target.checked;
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

    // 等長調諧
    document.getElementById('tuneBtn')?.addEventListener('click', () => this.meanderTune());

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
      this.hist();
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
        // 1) 走線端點拖曳優先（比元件更靠近端點時才搶）
        const epHit = this.traceEndpointHit(b.x, b.y);
        if (epHit && !this.compHit(b.x, b.y)) {
          this.hist();
          this.state.dragEndpoint = epHit;
          this.state.selectedTrace = epHit.trace;
          this.state.selected = null;
          this.canvas.style.cursor = 'move';
          this.render();
          return;
        }
        const hit = this.compHit(b.x, b.y);
        if (hit) {
          if (e.shiftKey) {
            // Shift+點：加入/移出多選集
            const set = this.state.selectedSet;
            const i = set.indexOf(hit);
            if (i >= 0) set.splice(i, 1); else set.push(hit);
            this.state.selected = set.length ? set[set.length - 1] : null;
            this.state.selectedTrace = null;
            this.renderPartsList();
            this.syncSelPanel();
            this.render();
            return;
          }
          this.hist(); // 拖曳前的位置可 Ctrl+Z 回復
          this.state.selectedTrace = null;
          // 抓到多選集內成員 → 群組拖曳；否則單選
          if (this.state.selectedSet.includes(hit) && this.state.selectedSet.length > 1) {
            this.state.dragGroup = this.state.selectedSet.map(c => ({ c, ox: c.x, oy: c.y }));
            this.state.dragAnchor = { x: b.x, y: b.y };
          } else {
            this.state.selectedSet = [hit];
            this.state.dragComp = hit;
            this.state.dragOff = { x: hit.x - b.x, y: hit.y - b.y };
          }
          this.state.selected = hit;
          this.canvas.style.cursor = 'move';
          this.renderPartsList();
          this.syncSelPanel();
          this.render();
        } else {
          // 沒點到元件 → 試點走線（可選取、Delete 刪）
          const tHit = this.traceHit(b.x, b.y);
          if (tHit) {
            this.state.selectedTrace = tHit;
            this.state.selected = null;
            this.state.selectedSet = [];
            this.renderPartsList();
            this.syncSelPanel();
            this.render();
            return;
          }
          // Shift+拖空白 = 框選；一般拖空白 = 平移
          if (e.shiftKey) {
            this.state.boxSel = { x1: b.x, y1: b.y, x2: b.x, y2: b.y };
            this.render();
            return;
          }
          if (this.state.selected || this.state.selectedTrace || this.state.selectedSet.length) {
            this.state.selected = null;
            this.state.selectedTrace = null;
            this.state.selectedSet = [];
            this.renderPartsList();
            this.syncSelPanel();
            this.render();
          }
          this.state.isPanning = true;
          this.canvas.style.cursor = 'grabbing';
        }
      } else if (this.state.tool === 'text') {
        const b = this.screenToBoard(e);
        const txt = prompt(pcbT('pj_text_prompt'), '');
        if (txt && txt.trim()) {
          this.hist();
          const layer = this.state.traceLayer === 'B.Cu' ? 'B.SilkS' : 'F.SilkS';
          this.state.texts.push({ x: b.x, y: b.y, text: txt.trim(), layer, size: 1.5 });
          this.render();
        }
      } else if (this.state.tool === 'dimension') {
        const b = this.screenToBoard(e);
        const g = this.gridStep();
        const px = this.snap(b.x, g), py = this.snap(b.y, g);
        if (!this.state.dimDraw) {
          this.state.dimDraw = { x1: px, y1: py, cx: px, cy: py };
        } else {
          const d = this.state.dimDraw;
          this.state.dimDraw = null;
          if (Math.hypot(px - d.x1, py - d.y1) >= 0.05) {
            this.hist();
            this.state.dims.push({ x1: d.x1, y1: d.y1, x2: px, y2: py });
          }
          this.render();
        }
      } else if (this.state.tool === 'netlabel') {
        const b = this.screenToBoard(e);
        const hit = this.snapTarget(b.x, b.y);   // pad / 走線端點（帶所屬 net）
        const tHit = hit ? null : this.traceHit(b.x, b.y);
        if (!hit && !tHit) { this.toast(pcbT('pj_netlabel_miss'), 'warn'); return; }
        const cur = hit ? (hit.net || '') : (tHit.net || '');
        const name = prompt(pcbT('pj_netlabel_prompt'), cur);
        if (name == null) return;
        this.hist();
        const target = hit ? (hit.pad || hit.via || hit.trace) : tHit;
        if (target) target.net = name.trim();
        this.state.ratsnest = null;
        this.toast(pcbT('pj_netlabel_done', { net: name.trim() || '(-)' }), 'info');
        this.render();
      } else if (this.state.tool === 'keepout') {
        const b = this.screenToBoard(e);
        const g = this.gridStep();
        const px = this.snap(b.x, g), py = this.snap(b.y, g);
        if (!this.state.keepoutDraw) {
          this.state.keepoutDraw = { pts: [[px, py]], cursor: [px, py] };
          this.toast(pcbT('pj_keepout_start'), 'info');
        } else {
          this.state.keepoutDraw.pts.push([px, py]);
        }
        this.render();
      } else if (this.state.tool === 'trace') {
        const b = this.screenToBoard(e);
        const g = this.gridStep();
        const hit = this.snapTarget(b.x, b.y);
        const sx = hit ? hit.x : this.snap(b.x, g), sy = hit ? hit.y : this.snap(b.y, g);
        this.state.traceDraw = { x1: sx, y1: sy, x2: sx, y2: sy, net: hit ? hit.net : '' };
        // 差分對模式：起點吸到 P/N 網且配對腳在近旁 → 改畫中心線，收尾展開平行對
        const dp = document.getElementById('diffPair');
        if (dp && dp.checked && hit && hit.net) {
          const pairNet = this.pairNetOf(hit.net);
          const mate = pairNet && this.findNetPad(pairNet, hit.x, hit.y);
          if (mate) {
            const mx = (hit.x + mate.x) / 2, my = (hit.y + mate.y) / 2;
            this.state.traceDraw = {
              x1: mx, y1: my, x2: mx, y2: my, net: hit.net,
              diff: { netA: hit.net, ax: hit.x, ay: hit.y, netB: pairNet, bx: mate.x, by: mate.y }
            };
          } else {
            this.toast(pcbT('pj_diff_nopair', { net: hit.net }), 'warn');
          }
        }
        this.render();
      } else if (this.state.tool === 'via') {
        const b = this.screenToBoard(e);
        const g = this.gridStep();
        const hit = this.snapTarget(b.x, b.y);
        const psDef = window.Padstack ? Padstack.load() : { od: 0.6, drill: 0.3 };
        this.hist();
        this.state.vias.push({
          x: hit ? hit.x : this.snap(b.x, g), y: hit ? hit.y : this.snap(b.y, g),
          od: psDef.od, id: psDef.drill, net: hit ? hit.net : '', user: true
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

    // 雙擊：收尾禁止區多邊形
    this.canvas?.addEventListener('dblclick', () => {
      const kd = this.state.keepoutDraw;
      if (!kd) return;
      this.state.keepoutDraw = null;
      if (kd.pts.length >= 2) {
        const [ax, ay] = kd.pts[kd.pts.length - 1], [bx2, by2] = kd.pts[kd.pts.length - 2];
        if (Math.hypot(ax - bx2, ay - by2) < 1e-9) kd.pts.pop();
      }
      if (kd.pts.length < 3) { this.toast(pcbT('pj_zone_min3'), 'warn'); this.render(); return; }
      this.hist();
      this.state.keepouts.push({ layer: this.state.traceLayer || 'F.Cu', pts: kd.pts });
      this.toast(pcbT('pj_keepout_done', { layer: this.state.traceLayer || 'F.Cu' }), 'info');
      this.render();
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
      const thermal = document.getElementById('zoneThermal') ? document.getElementById('zoneThermal').checked : true;
      this.hist();
      this.state.userZones.push({ layer: this.state.traceLayer || 'F.Cu', net: zd.net || '', pts: zd.pts, clearance: 0.3, thermal, user: true });
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
      if (this.state.keepoutDraw) {
        const b = this.screenToBoard(e);
        const g = this.gridStep();
        this.state.keepoutDraw.cursor = [this.snap(b.x, g), this.snap(b.y, g)];
        this.render();
        return;
      }
      if (this.state.dimDraw) {
        const b = this.screenToBoard(e);
        const g = this.gridStep();
        this.state.dimDraw.cx = this.snap(b.x, g);
        this.state.dimDraw.cy = this.snap(b.y, g);
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
      if (this.state.dragEndpoint) {
        const b = this.screenToBoard(e);
        const g = this.gridStep();
        const { trace, end } = this.state.dragEndpoint;
        const nx = this.snap(b.x, g), ny = this.snap(b.y, g);
        if (end === 'a') { trace.x1 = nx; trace.y1 = ny; } else { trace.x2 = nx; trace.y2 = ny; }
        this.state.ratsnest = null;
        this.render();
        return;
      }
      if (this.state.dragGroup) {
        const b = this.screenToBoard(e);
        const g = this.gridStep();
        const ddx = this.snap(b.x - this.state.dragAnchor.x, g);
        const ddy = this.snap(b.y - this.state.dragAnchor.y, g);
        this.state.dragGroup.forEach(s => { s.c.x = s.ox + ddx; s.c.y = s.oy + ddy; });
        this.syncSelPanel();
        this.render();
        return;
      }
      if (this.state.boxSel) {
        const b = this.screenToBoard(e);
        this.state.boxSel.x2 = b.x; this.state.boxSel.y2 = b.y;
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
      // 走線端點拖曳收尾：靠近 pad/via/走線端點就吸附＋接該 net
      if (this.state.dragEndpoint) {
        const { trace, end } = this.state.dragEndpoint;
        const ex = end === 'a' ? trace.x1 : trace.x2, ey = end === 'a' ? trace.y1 : trace.y2;
        const snapT = this.snapTarget(ex, ey);
        if (snapT) {
          if (end === 'a') { trace.x1 = snapT.x; trace.y1 = snapT.y; } else { trace.x2 = snapT.x; trace.y2 = snapT.y; }
          if (snapT.net) trace.net = snapT.net;
        }
        this.state.dragEndpoint = null;
        this.state.ratsnest = null;
        this.checkTraceRules(trace);
        this.render();
        return;
      }
      if (this.state.dragGroup) {
        this.state.dragGroup = null;
        this.state.dragAnchor = null;
        this.state.ratsnest = null;
        this.renderPartsList();
        this.render();
        return;
      }
      if (this.state.boxSel) {
        const bs = this.state.boxSel;
        this.state.boxSel = null;
        const x0 = Math.min(bs.x1, bs.x2), x1 = Math.max(bs.x1, bs.x2);
        const y0 = Math.min(bs.y1, bs.y2), y1 = Math.max(bs.y1, bs.y2);
        if (Math.abs(x1 - x0) > 0.5 || Math.abs(y1 - y0) > 0.5) {
          this.state.selectedSet = this.state.components.filter(c => c.x >= x0 && c.x <= x1 && c.y >= y0 && c.y <= y1);
          this.state.selected = this.state.selectedSet.length ? this.state.selectedSet[this.state.selectedSet.length - 1] : null;
          this.state.selectedTrace = null;
          this.toast(pcbT('pj_boxsel', { n: this.state.selectedSet.length }), 'info');
          this.renderPartsList();
          this.syncSelPanel();
        }
        this.render();
        return;
      }
      if (this.state.traceDraw && this.state.traceDraw.diff) {
        // 差分對收尾：中心線 → 兩條平行走線＋起點（及終點）fanout
        const td = this.state.traceDraw;
        this.state.traceDraw = null;
        const len = Math.hypot(td.x2 - td.x1, td.y2 - td.y1);
        if (len >= 0.05) {
          const w = this.state.traceWidth || 0.3;
          const gap = this.diffGapOf(td.diff.netA);
          const half = (gap + w) / 2;
          const ux = (td.x2 - td.x1) / len, uy = (td.y2 - td.y1) / len;
          const pxv = -uy, pyv = ux;
          const sideA = ((td.diff.ax - td.x1) * pxv + (td.diff.ay - td.y1) * pyv) >= 0 ? 1 : -1;
          const ox = pxv * half * sideA, oy = pyv * half * sideA;
          const layer = this.state.traceLayer || 'F.Cu';
          const segs = [];
          const mk = (x1, y1, x2, y2, net) => segs.push({
            id: `trace-${Date.now()}-${this.state.traces.length + segs.length}`,
            x1, y1, x2, y2, width: w, layer, net
          });
          mk(td.diff.ax, td.diff.ay, td.x1 + ox, td.y1 + oy, td.diff.netA);
          mk(td.diff.bx, td.diff.by, td.x1 - ox, td.y1 - oy, td.diff.netB);
          mk(td.x1 + ox, td.y1 + oy, td.x2 + ox, td.y2 + oy, td.diff.netA);
          mk(td.x1 - ox, td.y1 - oy, td.x2 - ox, td.y2 - oy, td.diff.netB);
          // 終點附近（5mm 內）有 P/N 配對腳且非起點腳 → 兩側補終端 fanout
          const aEnd = this.findNetPad(td.diff.netA, td.x2, td.y2);
          const bEnd = this.findNetPad(td.diff.netB, td.x2, td.y2);
          const notStart = (p, sx2, sy2) => p && Math.hypot(p.x - sx2, p.y - sy2) > 0.01;
          if (notStart(aEnd, td.diff.ax, td.diff.ay) && notStart(bEnd, td.diff.bx, td.diff.by)) {
            mk(td.x2 + ox, td.y2 + oy, aEnd.x, aEnd.y, td.diff.netA);
            mk(td.x2 - ox, td.y2 - oy, bEnd.x, bEnd.y, td.diff.netB);
          }
          this.hist();
          this.state.traces.push(...segs);
          this.state.ratsnest = null;
          segs.slice(2, 4).forEach(t => this.checkTraceRules(t));
          this.toast(pcbT('pj_diff_done', { a: td.diff.netA, b: td.diff.netB, gap }), 'info');
          this.renderPartsList();
        }
        this.render();
        return;
      }
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
          this.hist();
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

    // 鍵盤：R=旋轉 90°、Delete=刪選取、Ctrl+Z/Y=復原/重做、Esc=取消（輸入框聚焦時不攔截）
    document.addEventListener('keydown', (e) => {
      if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '')) return;
      const k = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && k === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (!(window.PcbHistory && PcbHistory.undo(this))) this.toast(pcbT('pj_hist_none'), 'warn');
      } else if ((e.ctrlKey || e.metaKey) && (k === 'y' || (k === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (!(window.PcbHistory && PcbHistory.redo(this))) this.toast(pcbT('pj_hist_none'), 'warn');
      } else if ((e.ctrlKey || e.metaKey) && k === 'c') {
        const set = this.state.selectedSet.length ? this.state.selectedSet : (this.state.selected ? [this.state.selected] : []);
        if (set.length) {
          e.preventDefault();
          this.state.clipboard = set.map(c => JSON.parse(JSON.stringify(c)));
          this.toast(pcbT('pj_copied', { n: set.length }), 'info');
        }
      } else if ((e.ctrlKey || e.metaKey) && k === 'v') {
        if (this.state.clipboard && this.state.clipboard.length) {
          e.preventDefault();
          this.pasteClipboard();
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (this.state.selectedSet.length > 1) {
          e.preventDefault();
          this.hist();
          const del = new Set(this.state.selectedSet);
          this.state.components = this.state.components.filter(c => !del.has(c));
          this.state.selectedSet = []; this.state.selected = null;
          this.state.ratsnest = null;
          this.toast(pcbT('pj_del_n', { n: del.size }), 'info');
          this.renderPartsList(); this.populateEmiSelects(); this.syncSelPanel(); this.render();
        } else if (this.state.selected) {
          e.preventDefault();
          this.deleteSelected();
        } else if (this.state.selectedTrace) {
          e.preventDefault();
          this.hist();
          const i = this.state.traces.indexOf(this.state.selectedTrace);
          if (i >= 0) this.state.traces.splice(i, 1);
          this.state.selectedTrace = null;
          this.state.ratsnest = null;
          this.renderPartsList();
          this.render();
        }
      } else if ((e.key === 'r' || e.key === 'R') && (this.state.selected || this.state.selectedSet.length)) {
        e.preventDefault();
        this.rotateSelected(90);
      } else if (/^Arrow(Up|Down|Left|Right)$/.test(e.key) && (this.state.selected || this.state.selectedSet.length)) {
        // 方向鍵微調選集：預設一格；Ctrl/⌘＝0.1mm 細步
        e.preventDefault();
        const step = (e.ctrlKey || e.metaKey) ? 0.1 : this.gridStep();
        const d = { ArrowUp: [0, -step], ArrowDown: [0, step], ArrowLeft: [-step, 0], ArrowRight: [step, 0] }[e.key];
        this.nudgeSelected(d[0], d[1]);
      } else if (e.key === 'Escape') {
        if (this.state.zoneDraw) {
          this.state.zoneDraw = null;
          this.render();
        } else if (this.state.keepoutDraw) {
          this.state.keepoutDraw = null;
          this.render();
        } else if (this.state.dimDraw) {
          this.state.dimDraw = null;
          this.render();
        } else if (this.state.traceDraw) {
          this.state.traceDraw = null;
          this.render();
        } else if (this.state.boxSel) {
          this.state.boxSel = null;
          this.render();
        } else if (this.state.selected || this.state.selectedTrace || this.state.selectedSet.length) {
          this.state.selected = null;
          this.state.selectedTrace = null;
          this.state.selectedSet = [];
          this.renderPartsList();
          this.syncSelPanel();
          this.render();
        }
      }
    });

    // 復原/重做/匯出/匯入按鈕
    document.getElementById('undoBtn')?.addEventListener('click', () => {
      if (!(window.PcbHistory && PcbHistory.undo(this))) this.toast(pcbT('pj_hist_none'), 'warn');
    });
    document.getElementById('redoBtn')?.addEventListener('click', () => {
      if (!(window.PcbHistory && PcbHistory.redo(this))) this.toast(pcbT('pj_hist_none'), 'warn');
    });
    document.getElementById('saveBoardBtn')?.addEventListener('click', () => {
      if (window.PcbHistory) PcbHistory.exportBoard(this);
    });
    document.getElementById('loadBoardBtn')?.addEventListener('click', () => document.getElementById('loadBoardFile')?.click());
    document.getElementById('loadBoardFile')?.addEventListener('change', (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const rd = new FileReader();
      rd.onload = () => {
        const ok = window.PcbHistory && PcbHistory.importBoard(this, String(rd.result));
        this.toast(pcbT(ok ? 'pj_board_loaded' : 'pj_board_bad'), ok ? 'info' : 'error');
      };
      rd.readAsText(f);
      e.target.value = '';
    });

    // 對齊 / 分佈按鈕（事件委派，作用於當前選集）
    document.querySelectorAll('[data-align]').forEach(btn =>
      btn.addEventListener('click', () => this.alignSelected(btn.dataset.align)));
    document.querySelectorAll('[data-distribute]').forEach(btn =>
      btn.addEventListener('click', () => this.distributeSelected(btn.dataset.distribute)));

    // 選取元件屬性面板：座標/角度直接輸入
    ['selX', 'selY', 'selRot'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', () => {
        const c = this.state.selected;
        if (!c) return;
        const v = parseFloat(document.getElementById(id).value);
        if (isNaN(v)) { this.syncSelPanel(); return; }
        this.hist();
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
