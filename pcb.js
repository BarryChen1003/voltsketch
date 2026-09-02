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
    // net 屬性表（NetModel）。key = net 名字，值 {z0, zdiff, ztol, pair, note}。
    // net 的識別仍然是名字（線路圖與板子共通、改名已有雙向同步）；
    // 屬性放這裡才有地方掛「這條要 50Ω」「這兩條是一對」。改名由 NetModel.rename 一起搬。
    netProps: {},
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
    blindBuried: false,  // 盲埋孔：預設關（板廠多半不接，見 pcb-fabs 的 blindBuriedUnsupported）
    showPinNums: true,   // pad 上顯示 pin number（Allegro 慣例，預設開）
    showPinNames: true,  // pad 下方顯示腳名/網路（夠大才畫）
    selectedTrace: null, // 選取中的走線（select 工具點走線；Delete 可刪）
    texts: [],           // 絲印文字 {x,y,text,layer,size}
    dims: [],            // 尺寸標註 {x1,y1,x2,y2}
    keepouts: [],        // 禁止區 {layer,pts}
    teardrops: [],       // 淚滴 {layer,net,pts}（Mfg.Teardrops 產生；匯出為 region）
    fpOverrides: {},     // 線路圖轉 PCB 的封裝覆寫 {schId: {lib, variant}}
    schUnresolved: [],   // 上次轉換對不出封裝的元件（誠實留著，不清掉）
    panel: null,         // 拼板計畫（Mfg.Panel.plan 的結果，套用後留著給匯出參考）
    dimDraw: null,       // 進行中尺寸標註 {x1,y1,cx,cy}
    keepoutDraw: null,   // 進行中禁止區 {pts, cursor:[x,y]}
    selectedSet: [],     // 多選元件（Shift+點 加選、Shift+拖 框選）
    dragEndpoint: null,  // 走線端點拖曳 {trace, end:'a'|'b'}
    dragTrace: null,     // 整條走線拖曳 {trace, plan, sx, sy}（TraceDrag）
    guides: [],          // 拖曳中的對齊輔助線（純檢視狀態，不進快照）
    dragGroup: null,     // 群組拖曳快照 [{c, ox, oy}]＋dragAnchor
    rubber: null,        // 拖曳中要跟著 pad 走的走線端點（beginRubber 建表）
    highlightNet: null,  // 網路清單點選的高亮網路（純檢視狀態，不進快照）
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
    this.renderNetPanel();
    this.initCrossProbe();
    this.populateIcPicker();
    this.populatePartsPicker();
    this.state.netRules = window.NetRules ? window.NetRules.load() : [];
    this.renderNetRules();
    // 頂列「新建」要回到的原始狀態：趁自動存檔還原之前拍一份
    this._pristine = JSON.stringify(this.state);
    // 自動存檔還原（有上次版面就接續；空版面不還原）
    if (window.PcbHistory && PcbHistory.boot(this)) this.toast(pcbT('pj_hist_restored'), 'info');
    this.render();
  },

  // 頂列「新建」：回到開站時的空版面。有東西才問，問過才清；清完可 Ctrl+Z 救回。
  newBoard() {
    const hasWork = this.state.components.length || this.state.traces.length;
    if (hasWork && typeof window.confirm === "function" && !window.confirm(pcbT("pj_new_confirm"))) return false;
    if (!(window.PcbHistory && PcbHistory.newBoard(this, this._pristine))) return false;
    this.toast(pcbT("pj_new_done"), "info");
    return true;
  },

  // 頂列「匯出」：匯出動作分散在數個面板（製造包 / KiCad / STEP / DXF），
  // 這顆只負責把人帶到那一區並聚焦，不替使用者選格式。
  // 「📤 匯出」：把匯出面板叫出來。
  //
  // 舊版只做 scrollIntoView + focus。面板停靠系統把這一段搬進**預設隱藏**的浮動視窗之後，
  // 捲到隱藏元素等於什麼都沒發生——使用者按了匯出，畫面毫無反應，
  // 合理的結論是「這個功能沒做」。實際上 Gerber／ODB++／IPC-2581／組裝圖四種都在。
  revealExportPanel() {
    const btn = document.getElementById('exportGerberBtn');
    if (!btn) return false;
    // 在「板面檢視／開源公版」分頁時整個編輯區是收起來的，先切回 Layout
    const tab = document.getElementById('tabLayout');
    if (tab && !/primary/.test(tab.className || '')) tab.click();
    // 面板可能被搬進浮動視窗且預設隱藏：先開它
    const float = btn.closest ? btn.closest('.pcb-float') : null;
    if (float && window.PcbPanels) {
      const key = String(float.id || '').replace(/^float-/, '');
      if (key) window.PcbPanels.open(key);
    }
    const sec = btn.closest ? (btn.closest('.panel-section') || btn) : btn;
    if (sec.scrollIntoView) sec.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (btn.focus) btn.focus({ preventScroll: true });
    this.toast(pcbT("pj_export_hint"), "info");
    return true;
  },

  // 變更動作前呼叫：現狀進復原疊（Ctrl+Z 可回）
  // 任何改動都讓 DRC 標記過期：留著舊標記比沒有標記更糟——
  // 使用者會以為那裡還有問題，或以為改好了其實沒重驗。
  hist() {
    if (this.state.drcMarks && this.state.drcMarks.length) this.state.drcMarks = [];
    if (window.PcbHistory) PcbHistory.push(this.state);
  },

  // 依層數產生疊層：F.Cu(頂) + In1..In(n-2) + B.Cu(底) + 絲印/板框
  buildLayerStack(n) {
    n = Math.max(1, Math.min(40, n || 2));
    // 層色由主題色環指派（PcbTheme）。相鄰層的色相刻意拉開，
    // 否則 4 層板疊起來分不出這條線在 In1 還是 In2。模組沒載入才用這組舊的當退路。
    const fallback = ['#e74c3c', '#3498db', '#16a085', '#9b59b6', '#e67e22', '#2ecc71', '#f39c12', '#1abc9c', '#c0392b', '#2980b9', '#8e44ad', '#d35400'];
    const themeId = (this.state.palette && this.state.palette.theme) || (window.PcbTheme ? PcbTheme.DEFAULT : '');
    const layerCol = i => window.PcbTheme ? PcbTheme.layerColor(themeId, i) : fallback[i % fallback.length];
    const silkCol = side => {
      if (!window.PcbTheme) return side === 'B' ? '#b7950b' : '#f1c40f';
      const t = PcbTheme.get(themeId);
      return side === 'B' ? t.silkB : t.silkF;
    };
    const cu = [{ id: 'F.Cu', name: 'F.Cu (頂層)', type: 'Signal' }];
    for (let i = 1; i <= n - 2; i++) cu.push({ id: 'In' + i + '.Cu', name: 'In' + i + '.Cu (內層)', type: (i % 2 ? 'GND' : 'PWR') });
    if (n >= 2) cu.push({ id: 'B.Cu', name: 'B.Cu (底層)', type: 'Signal' });
    cu.forEach((l, i) => { l.color = layerCol(i); l.kind = 'copper'; });
    return cu.concat([
      { id: 'F.SilkS', name: 'F.SilkS (絲印)', color: silkCol('F'), kind: 'silk' },
      { id: 'B.SilkS', name: 'B.SilkS (底絲印)', color: silkCol('B'), kind: 'silk' },
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

  // 畫布的「邏輯尺寸」（CSS px）。所有繪圖座標都用這一組；
  // 真正的 backing store 是它乘上 devicePixelRatio——那是放大不糊的前提。
  get viewW() { return this.canvas ? this.canvas.width / (this.dpr || 1) : 0; },
  get viewH() { return this.canvas ? this.canvas.height / (this.dpr || 1) : 0; },

  resizeCanvas() {
    const container = this.canvas.parentElement;
    const w = Math.max(1, container.clientWidth), h = Math.max(1, container.clientHeight);
    // backing store 用裝置像素。少了這一步，在 1.25×／2× 的螢幕上等於用一半解析度畫：
    // 線與小字永遠糊，而且**放大也不會變清楚**——糊的是畫布本身，不是幾何。
    const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    if (this.viewW === w && this.viewH === h && this.dpr === dpr) return;   // 無變化不重畫
    this.dpr = dpr;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    // **不要**寫 inline 的 style.width/height：`#pcbCanvas` 的 CSS 是 width/height:100%，
    // 寫死 px 會把尺寸凍在當下那一刻，而容器又跟著畫布走——實測會卡在 1px 寬。
    // CSS 尺寸交給 CSS，這裡只負責 backing store。
    this.render();
  },

  // 全域配色：背景／板框／各銅層／元件底色。存 localStorage，重載沿用。
  PALETTE_LS: 'vs-pcb-palette',
  paletteDefaults(themeId) {
    if (window.PcbTheme) {
      const cu = (this.state.layerStack || []).filter(l => l.kind === 'copper').map(l => l.id);
      const id = themeId || (this.state.palette && this.state.palette.theme) || PcbTheme.DEFAULT;
      return PcbTheme.paletteFor(id, cu);
    }
    return {
      theme: 'classic',
      bg: '#1a1a2e', board: '#2d5a3d', grid: '#3d5a4e',
      silkF: '#f1c40f', silkB: '#b7950b',
      'F.Cu': '#e74c3c', 'B.Cu': '#3498db',
      compTop: '#34495e', compBottom: '#1f3a5f'
    };
  },

  // 換主題＝整組換掉，不是拿舊的蓋新的：
  // 留著上一個主題的單層自訂色，會在新背景上變成看不見的那一層。
  setPaletteTheme(id) {
    if (!window.PcbTheme) return false;
    const cu = (this.state.layerStack || []).filter(l => l.kind === 'copper').map(l => l.id);
    this.state.palette = PcbTheme.paletteFor(id, cu);
    this.applyPalette();
    this.savePalette();
    this.renderPalettePanel();
    this.renderLayerList();
    this.render();
    return true;
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
    (this.state.layerStack || []).forEach(l => {
      if (p[l.id]) { l.color = p[l.id]; return; }
      // 絲印與板框以前不吃主題：換成黑底之後，暗黃絲印在黑上幾乎看不見
      if (l.kind === 'silk' && (p.silkF || p.silkB)) l.color = (l.id === 'B.SilkS' ? p.silkB : p.silkF) || l.color;
    });
  },
  renderPalettePanel() {
    const sel = document.getElementById('paletteTheme');
    const cur = (this.state.palette && this.state.palette.theme) || (window.PcbTheme ? PcbTheme.DEFAULT : '');
    if (sel && cur && sel.value !== cur) sel.value = cur;
    const host = document.getElementById('paletteRows');
    if (!host) return;
    const p = this.state.palette || this.paletteDefaults();
    // 硬規矩 6：畫面上的字一律四語（層名走 layerDispName，這裡是配色列的標籤）
    const rows = [
      ['bg', 'col_bg'], ['board', 'col_outline'], ['grid', 'col_grid'],
      ['F.Cu', 'col_fcu'], ['B.Cu', 'col_bcu'],
      ['compTop', 'col_ffill'], ['compBottom', 'col_bfill']
    ];
    host.innerHTML = rows.map(([k, labelKey]) =>
      `<label style="display:flex;align-items:center;gap:8px;justify-content:space-between">
         <span>${pcbT(labelKey)}</span>
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
    document.getElementById('paletteTheme')?.addEventListener('change', (e) => this.setPaletteTheme(e.target.value));
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
        this.state.panX += dx * this.viewW * k;
        this.state.panY += dy * this.viewH * k;
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
    const { ctx, state } = this;
    const { zoom, panX, panY, boardWidth, boardHeight } = state;

    // 每次重畫重設 transform：backing store 是裝置像素、繪圖座標是 CSS px。
    // 少了這行，dpr 一變（拖到另一台螢幕、改系統縮放）畫面就整個位移。
    if (ctx.setTransform) ctx.setTransform(this.dpr || 1, 0, 0, this.dpr || 1, 0, 0);

    // Clear canvas（背景色可由「整體配色」面板設定）
    ctx.fillStyle = (state.palette && state.palette.bg) || '#1a1a2e';
    ctx.fillRect(0, 0, this.viewW, this.viewH);

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

    // 淚滴（畫在走線之後、via 之前：它是走線與 pad 的補強銅）
    this.drawTeardrops(scale);

    // Draw vias
    this.drawVias(scale);

    // 絲印（KiCad 匯入的 footprint 圖形與文字）
    this.drawSilk(scale);
    this.drawDrcMarks(scale);

    // 飛線與畫線預覽
    this.drawRatsnest(scale);
    this.drawNetHighlight(scale);
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
    const toS = p => [this.viewW / 2 + p[0] * scale, this.viewH / 2 + p[1] * scale];
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
      const sx = this.viewW / 2 + t.x * scale, sy = this.viewH / 2 + t.y * scale;
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
    const toX = v => this.viewW / 2 + v * scale, toY = v => this.viewH / 2 + v * scale;
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
    const toX = v => this.viewW / 2 + v * scale, toY = v => this.viewH / 2 + v * scale;
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

    const x = (this.viewW / 2 - (boardWidth * scale) / 2);
    const y = (this.viewH / 2 - (boardHeight * scale) / 2);
    const w = boardWidth * scale;
    const h = boardHeight * scale;

    // Board fill（板材底色跟著主題走；CAM 風幾乎是黑的，只比背景亮一點）
    ctx.fillStyle = (state.palette && state.palette.boardFill) || '#2d4a3e';
    ctx.fillRect(x, y, w, h);

    // Board outline
    ctx.strokeStyle = (state.palette && state.palette.board) || '#7f8c8d';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // 非矩形板框（KiCad Edge.Cuts）：精確線段疊繪
    if (state.edgeSegs && state.edgeSegs.length && state.visibleLayers.includes('Edge.Cuts')) {
      ctx.strokeStyle = '#bdc3c7';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      state.edgeSegs.forEach(s => {
        ctx.moveTo(this.viewW / 2 + s.x1 * scale, this.viewH / 2 + s.y1 * scale);
        ctx.lineTo(this.viewW / 2 + s.x2 * scale, this.viewH / 2 + s.y2 * scale);
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

  drawTeardrops(scale) {
    const tds = this.state.teardrops;
    if (!tds || !tds.length) return;
    const { ctx } = this;
    const X = x => this.viewW / 2 + x * scale, Y = y => this.viewH / 2 + y * scale;
    const vis = this.state.visibleLayers || [];
    ctx.save();
    for (const t of tds) {
      const layer = t.layer || 'F.Cu';
      if (vis.length && vis.indexOf(layer) < 0) continue;
      const l = (this.state.layerStack || []).find(x => x.id === layer);
      ctx.fillStyle = (l && l.color) || '#e74c3c';
      ctx.beginPath();
      t.pts.forEach((p, i) => { const sx = X(p[0]), sy = Y(p[1]); i ? ctx.lineTo(sx, sy) : ctx.moveTo(sx, sy); });
      ctx.closePath();
      ctx.fill();
    }
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
        const sx = this.viewW / 2 + p[0] * scale, sy = this.viewH / 2 + p[1] * scale;
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
      const sx = this.viewW / 2 + p.x * scale, sy = this.viewH / 2 + p.y * scale;
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
        // 鑽孔是「看穿板子」，顏色必須跟背景一致；寫死舊背景色的話，
        // 換成黑底主題後每個孔都變成深藍點，看起來像孔沒對準。
        ctx.fillStyle = (state.palette && state.palette.bg) || '#1a1a2e';
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
    // 字大小跟著 pad 的實際大小走。舊版鎖 11px 上限：放大之後 pad 有 300px 寬、
    // 號碼還是 11px，看起來就是「放大了但沒有更清楚」。上限只留一個防呆值。
    const fs = Math.max(6, Math.min(160, box * 0.5));
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
      const f2 = Math.max(6, Math.min(120, box * 0.3));
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

    const startX = (this.viewW / 2 - (boardWidth * scale) / 2);
    const startY = (this.viewH / 2 - (boardHeight * scale) / 2);
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
    const x = this.viewW / 2 + comp.x * scale - w / 2;
    const y = this.viewH / 2 + comp.y * scale - h / 2;
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
          // refdes 也跟著元件大小長。固定 9px 在放大之後會變成畫面上最小的東西
          const fs = Math.max(9, Math.min(72, Math.min(r.w, r.h) * 0.35));
          ctx.fillStyle = sel ? '#f39c12' : '#bdc3c7';
          ctx.font = `${fs}px monospace`;
          ctx.textAlign = 'center';
          ctx.fillText(label, r.x + r.w / 2, r.y - fs * 0.35);
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

  // 走線描邊：路徑只有 PcbInteract.pathOf 一份定義。
  // 以前高亮各自用兩端點畫直線，圓弧走線一選就偏——弧越大偏越多。
  tracePath(ctx, t, scale) {
    const X = x => this.viewW / 2 + x * scale, Y = y => this.viewH / 2 + y * scale;
    const p = window.PcbInteract ? PcbInteract.pathOf(t)
      : { kind: 'line', x1: t.x1, y1: t.y1, x2: t.x2, y2: t.y2 };
    if (p.kind === 'arc') ctx.arc(X(p.cx), Y(p.cy), p.r * scale, p.a0, p.a1, false);
    else { ctx.moveTo(X(p.x1), Y(p.y1)); ctx.lineTo(X(p.x2), Y(p.y2)); }
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
      const a = trace.arc;
      if (a && Number.isFinite(a.cx) && Number.isFinite(a.cy) && a.r > 0) {
        // 真圓弧走線。canvas 的 arc() 角度方向與螢幕 y 向下一致，
        // 而 PcbArc 的角度是用 atan2(y−cy, x−cx) 算的（同一個座標系），
        // 所以 a0/a1 可以直接餵進去，anticlockwise 一律 false（a1 一定 > a0）。
        ctx.arc(
          this.viewW / 2 + a.cx * scale,
          this.viewH / 2 + a.cy * scale,
          a.r * scale, a.a0, a.a1, false);
      } else {
        ctx.moveTo(this.viewW / 2 + trace.x1 * scale, this.viewH / 2 + trace.y1 * scale);
        ctx.lineTo(this.viewW / 2 + trace.x2 * scale, this.viewH / 2 + trace.y2 * scale);
      }
      ctx.stroke();
    });
    // 放大到看得清楚時，直接把 net 名標在走線上（Allegro／Altium 都是這樣）。
    // 門檻用**畫面上的線寬**判斷，不是 zoom 值：0.1mm 的細線與 0.5mm 的電源線
    // 在同一個 zoom 下該不該標字，本來就不一樣。
    // 同一條 net 由很多段組成，每段都標會變成一排重複的字。
    // 記下已經標過的位置，同一個 net 太近就不再標一次。
    const labelled = new Map();
    state.traces.forEach(trace => {
      const lid = trace.layer || 'F.Cu';
      if (!state.visibleLayers.includes(lid)) return;
      const net = String(trace.net || '');
      if (!net) return;
      const wpx = (trace.width || 0.3) * scale;
      if (wpx < 9) return;                                   // 線太細，字會蓋掉線本身
      const x1 = this.viewW / 2 + trace.x1 * scale, y1 = this.viewH / 2 + trace.y1 * scale;
      const x2 = this.viewW / 2 + trace.x2 * scale, y2 = this.viewH / 2 + trace.y2 * scale;
      const len = Math.hypot(x2 - x1, y2 - y1);
      const fs = Math.min(wpx * 0.75, 28);
      if (len < net.length * fs * 0.62) return;              // 這一段放不下整個名字就不標
      // 畫面外的不畫（放大之後大多數線都在畫面外，這一步省掉的成本最多）
      if (Math.max(x1, x2) < 0 || Math.min(x1, x2) > this.viewW ||
          Math.max(y1, y2) < 0 || Math.min(y1, y2) > this.viewH) return;
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      const done = labelled.get(net);
      if (done && done.some(p => Math.hypot(p[0] - mx, p[1] - my) < 260)) return;
      (labelled.get(net) || labelled.set(net, []).get(net)).push([mx, my]);
      let ang = Math.atan2(y2 - y1, x2 - x1);
      if (ang > Math.PI / 2 || ang < -Math.PI / 2) ang += Math.PI;   // 字不要上下顛倒
      ctx.save();
      ctx.translate(mx, my);
      ctx.rotate(ang);
      ctx.font = `500 ${fs}px ui-monospace,SFMono-Regular,Menlo,monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = Math.max(2, fs * 0.28);
      ctx.strokeStyle = 'rgba(10,14,32,.85)';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = 1;
      ctx.strokeText(net, 0, 0);
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(net, 0, 0);
      ctx.restore();
    });

    // 選取中的走線：橘色外框高亮（Delete 可刪）
    const sel = state.selectedTrace;
    if (sel && state.traces.includes(sel)) {
      ctx.strokeStyle = '#f39c12';
      ctx.globalAlpha = 0.9;
      ctx.lineWidth = Math.max(3, (sel.width || 0.3) * scale + 4);
      ctx.beginPath();
      this.tracePath(ctx, sel, scale);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawVias(scale) {
    const { ctx, state } = this;
    const anyCu = state.visibleLayers.some(id => (state.layerStack || []).find(l => l.id === id && l.kind === 'copper'));
    if (!anyCu) return;
    state.vias.forEach(v => {
      const x = this.viewW / 2 + v.x * scale;
      const y = this.viewH / 2 + v.y * scale;
      const ro = Math.max(2, (v.od || 0.6) / 2 * scale), ri = Math.max(1, (v.id || 0.3) / 2 * scale);
      ctx.beginPath(); ctx.arc(x, y, ro, 0, Math.PI * 2); ctx.fillStyle = '#b8c2cc'; ctx.fill();
      // 孔＝看穿板子，顏色要跟背景一致（寫死舊色的話換主題後每個 via 都有深藍點）
      ctx.beginPath(); ctx.arc(x, y, ri, 0, Math.PI * 2); ctx.fillStyle = (this.state.palette && this.state.palette.bg) || '#1a1a2e'; ctx.fill();
    });
  },

  setTool(tool) {
    this.state.tool = tool;
    document.querySelectorAll('.pcb-tool-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tool === tool);
    });
  },

  // 縮放範圍。1.0 ＝ 10px/mm；上限 40 ＝ 400px/mm（0603 的 pad 會有 300px 寬，
  // 看得到單一 pad 的圓角與絲印細節）。舊版上限是 3（30px/mm），BGA 球距 0.4mm
  // 只有 12px——那不是「放大到極限」，是根本還沒開始放大。
  ZOOM_MIN: 0.15,
  ZOOM_MAX: 40,

  showZoom() {
    const el = document.querySelector('#zoomLevel');
    if (!el) return;
    const z = this.state.zoom;
    // 放到 4000% 時 "4000%" 比 "40x" 難讀；超過 10 倍改用倍率
    el.textContent = z >= 10 ? `${z.toFixed(0)}x` : `${Math.round(z * 100)}%`;
  },

  /**
   * 以畫面上某一點為錨縮放：那個點底下的板面座標在縮放前後不動。
   * 沒有錨點的話（滾輪縮放）游標下的東西會一直跑掉，放大到 10 倍以上根本找不到目標。
   * sx/sy 是畫布邏輯座標（CSS px）；不給就用畫面中心。
   */
  zoomAt(factor, sx, sy) {
    const z0 = this.state.zoom;
    const z1 = Math.max(this.ZOOM_MIN, Math.min(this.ZOOM_MAX, z0 * factor));
    if (z1 === z0) return;
    const ax = (sx == null) ? this.viewW / 2 : sx;
    const ay = (sy == null) ? this.viewH / 2 : sy;
    // 錨點的板面座標（mm）在縮放前後必須相同：
    //   screen = pan + view/2 + mm * 10z   →   mm = (screen - pan - view/2) / (10z)
    const mmx = (ax - this.state.panX - this.viewW / 2) / (10 * z0);
    const mmy = (ay - this.state.panY - this.viewH / 2) / (10 * z0);
    this.state.zoom = z1;
    this.state.panX = ax - this.viewW / 2 - mmx * 10 * z1;
    this.state.panY = ay - this.viewH / 2 - mmy * 10 * z1;
    this.showZoom();
    this.render();
  },

  zoomIn() { this.zoomAt(1.2); },
  zoomOut() { this.zoomAt(1 / 1.2); },

  zoomFit() {
    this.state.zoom = 1;
    this.state.panX = 0;
    this.state.panY = 0;
    this.showZoom();
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
    // 線距/pad 級檢查全靠這個模組。它沒載入時 DRC 是「不完整」而不是「通過」，
    // 用 info 帶過會讓使用者看到 0 error 就以為線距沒問題。
    else results.push({ type: 'warning', message: pcbT('pj_drc_no_paddrc') });

    // 匯流排層級：一束要一起遵守的規則（成員主要層一致／via 數一致／skew 上限／束內間距）。
    if (window.BusDrc) results.push(...window.BusDrc.audit(this.state, rules.clearance.traceToTrace));

    // Layout 規則稽核（net 線寬下限/線長上限/差分對長度差）
    if (window.NetRules) results.push(...window.NetRules.audit(this.state.netRules || [], this.state));

    // Constraint Manager：class 線寬/線長/類別間距矩陣/銳角
    if (window.ConstraintMgr) results.push(...window.ConstraintMgr.audit(window.ConstraintMgr.load(), this.state, rules.clearance.traceToTrace));

    // net 屬性稽核（目標阻抗 vs 實際線寬/間距、差分對配對完整性）
    if (window.NetModel) results.push(...window.NetModel.audit(this.state));

    // 元件封裝與庫是否同步（庫改了、既有板子不知道）
    if (window.FpInst) results.push(...window.FpInst.auditFindings(this.state));

    // Backdrill：已計算的背鑽數＋板況變更後的過期警示
    if (window.Backdrill) {
      const bs = Backdrill.status();
      if (bs.n) results.push({ type: bs.stale ? 'warning' : 'info', message: pcbT(bs.stale ? 'bd_drc_stale' : 'bd_drc', { n: bs.n }) });
    }

    // 未連線統計（飛線）
    if (window.Ratsnest) {
      const rl = window.Ratsnest.compute(this.state, this.padAbs.bind(this));
      if (rl.length) results.push({ type: 'warning', message: pcbT('pj_drc_ratsnest', { n: rl.length }) });
      // 零長度飛線要單獨報，而且要帶座標。它是「同一點、同 net、不同層、缺 via」的壞接點：
      // 兩端重疊，畫面上根本畫不出那條線，使用者只看到未連線的數字降不下去、
      // 卻在板上找不到任何缺口。混在總數裡等於藏起來。
      const zero = rl.filter(l => Math.hypot(l.x2 - l.x1, l.y2 - l.y1) < 1e-6);
      zero.slice(0, 8).forEach(l => results.push({
        type: 'warning', x: l.x1, y: l.y1,
        message: pcbT('pj_drc_zero_air', { net: l.net || '?', x: l.x1.toFixed(2), y: l.y1.toFixed(2) })
      }));
      if (zero.length > 8) results.push({ type: 'warning', message: pcbT('pj_drc_zero_air_more', { n: zero.length - 8 }) });
    }

    // 違規要標在畫面上。只有清單的話，使用者拿到「@(12.3,45.6)」還得自己在板上找。
    // 這段擺在所有檢查跑完之後：以前夾在中間，後面才 push 的檢查（規則稽核、net 屬性、
    // 匯流排、零長度飛線）就算帶了座標也標不出來，看起來像那些檢查沒有位置資訊。
    this.state.drcMarks = results
      .filter(r => (r.type === 'error' || r.type === 'warning') && typeof r.x === 'number' && typeof r.y === 'number')
      .map(r => ({ x: r.x, y: r.y, type: r.type, message: r.message }));

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

  // Gerber 由後端產生（supabase/functions/pcb-export）。
  // 產生器不在前端：它送給每個訪客的話，PCB 這個付費功能真正的價值——
  // 那包拿去打版的檔案——等於免費送。這裡只負責送出板子狀態與收下 ZIP。
  async exportGerber() { return this.exportFab("gerber"); },

  // ODB++ 走同一條路（同一支 Edge Function、同一個額度計數器），只差 format。
  async exportOdb() { return this.exportFab("odb"); },
  async exportIpc() { return this.exportFab("ipc2581"); },
  async exportAsm() { return this.exportFab("assembly"); },

  // 匯出製造包。format：gerber＝Gerber＋鑽孔＋鋼網＋CPL＋IPC-356；odb＝ODB++ 子集。
  async exportFab(format) {
    const el = document.getElementById('kicadIoMsg');
    const say = (html) => { if (el) el.innerHTML = html; };

    if (!(window.Auth && Auth.enabled && Auth.enabled())) { say('⚠ ' + pcbT('pj_gerber_need_login')); return; }
    const sess = await Auth.raw().auth.getSession();
    const token = sess?.data?.session?.access_token;
    if (!token) { say('⚠ ' + pcbT('pj_gerber_need_login')); return; }

    const s = this.state;

    // 鋪銅一律在匯出前重算一次。
    //
    // 為什麼不能只靠使用者按過「布林重算」：那份 fillPolys 是按下去那一刻的幾何。
    // 之後只要動過任何一條走線或 pad，它就過期了——而過期的鋪銅在畫面上
    // 看起來完全正常（銅還在那裡），送到板廠才變成短路或斷路。
    // 這是整條路上唯一「錯了不會有任何徵兆」的地方，所以寧可每次多花幾十毫秒。
    //
    // Clipper 沒載入時 applyAll 不寫 fillPolys，匯出端自動退回柵格版。
    if (window.PourGeom && window.PourGeom.available() && (s.userZones || []).length) {
      try {
        window.PourGeom.applyAll(s, this.padAbs.bind(this), { clearance: this.loadDrcRules().clearance });
      } catch (e) { /* 算不出來就讓匯出走柵格版，不要擋住匯出 */ }
    }

    // 匯出製造包＝要送板廠了。這裡是最後一道關：拿選定板廠的公開能力檢查一次，
    // 有會被退件的項目就攔下來讓使用者決定，不要讓他花錢送一份做不出來的檔。
    if (window.FabProfiles) {
      const chk = window.FabProfiles.check(s, window.FabProfiles.selectedId(), this.padAbs.bind(this));
      const errs = chk ? chk.findings.filter(f => f.severity === 'error') : [];
      if (errs.length) {
        const list = errs.map(f => '\u2022 ' + pcbT('fab_' + f.code, {
          limit: Math.round(f.limit * 1000) / 1000,
          actual: Math.round(f.actual * 1000) / 1000,
          n: f.n || 1
        })).join('\n');
        const go = confirm(pcbT('fab_gate_fail', { name: chk.profile.name, n: errs.length, list }));
        if (!go) { say('\u26a0 ' + pcbT('fab_gate_stop')); return; }
      }
    }

    // 鑽孔表要標「哪支刀過不了板廠」，所以把選定板廠的下限一起送過去
    try {
      if (window.FabProfiles) {
        const prof = window.FabProfiles.byId(window.FabProfiles.selectedId());
        const cu = (s.layerStack || []).filter(l => l.kind === 'copper').length || 2;
        const tier = window.FabProfiles.tierFor(prof, cu);
        if (tier && tier.rules && typeof tier.rules.minDrill === 'number') s.fabMinDrill = tier.rules.minDrill;
      }
    } catch (e) { /* 帶不過去就只是少一欄註記，不該擋住匯出 */ }

    const base = s.kicad ? s.kicad.fileName : 'hardwareai';
    say(pcbT('pj_gerber_working'));

    let res;
    try {
      res = await fetch((window.AUTH_CONFIG.url) + '/functions/v1/pcb-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ state: s, baseName: base, format })
      });
    } catch (e) { say('⚠ ' + pcbT('pj_gerber_failed', { err: e.message })); return; }

    if (!res.ok) {
      let reason = res.status;
      try { const j = await res.json(); reason = j.error || reason; } catch (e) { }
      const msg = reason === 'pcb_access_required' ? pcbT('pj_gerber_no_access')
        : reason === 'not_authenticated' ? pcbT('pj_gerber_need_login')
          : reason === 'quota_exceeded' ? pcbT('pj_gerber_quota')
            : pcbT('pj_gerber_failed', { err: String(reason) });
      say('⚠ ' + msg);
      return;
    }

    // 統計與警告走標頭（本體是 ZIP）。警告是 { k, v }，在這裡才翻成四語。
    let meta = null;
    try {
      const b64 = res.headers.get('X-Gerber-Meta');
      if (b64) meta = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(b64), c => c.charCodeAt(0))));
    } catch (e) { }

    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    // 檔名跟著格式走。原本是三元判斷，加了 IPC-2581 與組裝圖之後會變成
    // 「拿到 IPC-2581 卻叫 -gerber.zip」——安靜給錯東西，跟後端那次同一種錯。
    const SUFFIX = { gerber: '-gerber.zip', odb: '-odbpp.zip', ipc2581: '-ipc2581.zip', assembly: '-assembly.zip' };
    a.download = base.replace(/\.kicad_pcb$/i, '') + (SUFFIX[format] || '-gerber.zip');
    a.click();
    URL.revokeObjectURL(a.href);

    if (meta) {
      const warnsOdb = (meta.warnings || []).map(w => pcbT(w.k, w.v));
      // IPC-2581：單一 XML，統計欄位跟 Gerber/ODB++ 都不一樣
      if (format === "ipc2581") {
        const st3 = meta.stats || {};
        say(pcbT("pj_ipc_exported", {
          layers: st3.layers || 0, nets: st3.nets || 0, comps: st3.components || 0,
          traces: st3.traces || 0, arcs: st3.arcs || 0, cutouts: st3.cutouts || 0
        }) + (warnsOdb.length ? "<br>⚠ " + warnsOdb.join("<br>⚠ ") : ""));
        return;
      }
      // 組裝圖：兩張 SVG ＋ 放置清單
      if (format === "assembly") {
        const st4 = meta.stats || {};
        say(pcbT("pj_asm_exported", {
          n: meta.files.length, top: st4.top || 0, bot: st4.bottom || 0, dnp: st4.dnp || 0
        }) + (warnsOdb.length ? "<br>⚠ " + warnsOdb.join("<br>⚠ ") : ""));
        return;
      }
      if (format === "odb") {
        const st2 = meta.stats || {};
        say(pcbT("pj_odb_exported", {
          n: meta.files.length, layers: st2.layers || 0,
          pads: st2.pads || 0, traces: st2.traces || 0, drills: st2.drills || 0
        }) + (warnsOdb.length ? "<br>⚠ " + warnsOdb.join("<br>⚠ ") : ""));
        return;
      }
      const names = meta.files.map(f => f.replace(/^.*?-/, '')).join('、');
      const warns = (meta.warnings || []).map(w => pcbT(w.k, w.v));
      say(pcbT('pj_gerber_exported', {
        n: meta.files.length, names, pth: meta.drillCounts.pth,
        npth: meta.drillCounts.npth ? '＋NPTH ' + meta.drillCounts.npth : '',
        slots: meta.drillCounts.slots ? pcbT('pj_gerber_slots', { n: meta.drillCounts.slots }) : ''
      }) + (warns.length ? '<br>⚠ ' + warns.join('<br>⚠ ') : ''));
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
          // 蓋章：記下「從 RefFP 拿的、當時長這樣」。沒有這一步，
          // 之後 RefFP 改了解析規則，公版板不會知道自己的 pad 已經過期。
          // spec 一定要帶原始的 c（RefFP 靠 kind/ref/w/h 分流），不能只帶 part：
          // comp.w/h 在上一行已經被封裝本體蓋掉了，拿它回推會配到別的封裝。
          if (window.FpInst) FpInst.stamp(comp, { src: 'reffp', part: c.part, spec: c }, comp.pads);
        }
        return comp;
      });
    }
    return (b.blocks || []).map((blk, i) => ({ id: `ref-${b.id}-${i}`, type: 'ic', x: blk.x, y: blk.y, label: blk.label }));
  },

  // 公版的 pad 是 footprint 產生器造出來的，身上沒有 net；走線卻有。
  // 結果 DRC 的「同 net 略過」永遠不成立，每條線碰到自己的 pad 都報一次淨距錯誤
  // （8 片公版各 32～64 個 error，全是假的）。這裡用走線端點把 net 回填到 pad 上。
  // 純函式化：吃 components/traces，回統計，方便 node 測。
  /**
   * 從走線端點回推 pad 的 net。
   *
   * 判定必須是「端點真的落在這顆 pad 的銅箔上」，不能用外接圓近似：
   * 舊版用 `hypot(w,h)/2`（對角半徑），0.2×0.85mm 的 QFN pad 半徑就有 0.44mm，
   * 在 0.4mm 間距下直接伸進隔壁腳——rp2040 公版的 pin15/pin16 因此都被標成 XIN，
   * 而 XIN／XOUT 是石英振盪器的兩條不同 net。錯的 net 會一路錯到飛線、netlist 與匯出。
   *
   * 另外：一個端點若同時落在兩顆 pad 上（pad 相鄰又有容差），只給**最近的那一顆**。
   */
  assignPadNets(components, traces, tol) {
    const t0 = (typeof tol === 'number' && tol >= 0) ? tol : 0.05;
    let assigned = 0, conflicts = 0;
    const ends = [];
    for (const t of (traces || [])) {
      if (!t.net) continue;
      ends.push([t.x1, t.y1, t.net], [t.x2, t.y2, t.net]);
    }
    if (!ends.length) return { assigned, conflicts };

    // pad 的絕對位置與方向先算一次
    const pads = [];
    for (const c of (components || [])) {
      for (const p of (c.pads || [])) {
        if (p.cu === false) continue;
        const a = this.padAbs(c, p);
        const rot = ((c.rot || 0) + (p.rot || 0)) * Math.PI / 180;
        pads.push({ p, x: a.x, y: a.y, w: p.w || 0.5, h: p.h || 0.5, rot, round: p.shape === 'circle' || p.shape === 'oval' });
      }
    }
    // 點在 pad 內（pad 自己的座標系；圓／橢圓走橢圓式，其餘走矩形）
    const inside = (q, x, y) => {
      const dx = x - q.x, dy = y - q.y;
      const co = Math.cos(-q.rot), si = Math.sin(-q.rot);
      const lx = dx * co - dy * si, ly = dx * si + dy * co;
      const hw = q.w / 2 + t0, hh = q.h / 2 + t0;
      if (q.round) return (lx * lx) / (hw * hw) + (ly * ly) / (hh * hh) <= 1;
      return Math.abs(lx) <= hw && Math.abs(ly) <= hh;
    };

    const hitOf = new Map();      // pad → net（同一顆 pad 被兩個 net 拉到＝資料矛盾）
    for (const [x, y, net] of ends) {
      let best = null, bestD = Infinity;
      for (const q of pads) {
        if (!inside(q, x, y)) continue;
        const d = Math.hypot(q.x - x, q.y - y);
        if (d < bestD) { bestD = d; best = q; }
      }
      if (!best) continue;
      const had = hitOf.get(best.p);
      if (had === undefined) hitOf.set(best.p, net);
      else if (had !== net) { hitOf.set(best.p, null); conflicts++; }
    }
    for (const [p, net] of hitOf) {
      if (net && !p.net) { p.net = net; assigned++; }
    }
    return { assigned, conflicts };
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
    // 公版資料可以直接帶 pad 的 net（由 tools/refboard-rebuild.js 產生）。
    // 沒有這張表的話，pad 的 net 只能從走線端點回推，多數 pad 會是無 net——
    // 而無 net 的 pad 對繞線器一律是障礙，這是公版繞不過的主因。
    if (b.padNets) {
      for (const c of this.state.components) {
        const m = b.padNets[c.ref];
        if (!m) continue;
        for (const p of (c.pads || [])) { const n = m[p.num]; if (n && !p.net) p.net = n; }
      }
    }
    this.state.traces = (b.traces || []).map((t, i) => ({ id: `ref-t-${i}`, ...t }));
    this.state.vias = (b.vias || []).map(v => ({ ...v }));
    this.assignPadNets(this.state.components, this.state.traces);
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
    this.renderNetPanel();
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
    // IPC-2221 外層：I = k × ΔT^0.44 × A^0.725（A 單位 mil²、k=0.048）。
    // 舊版把 mil 乘上 0.03937（那是 mm→mil 的係數）而不是 0.0254（mil→mm），
    // 1A / ΔT10℃ / 1oz 算出 0.466mm，正確值是 0.300mm，高估 55%。
    const k = 0.048, MIL_MM = 0.0254, tMil = p.oz * 1.378;
    const Aneed = Math.pow(p.I / (k * Math.pow(p.dT, 0.44)), 1 / 0.725);
    const wNeedMm = (Aneed / tMil) * MIL_MM;
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
    const toScreen = c => ({ x: this.viewW / 2 + c.x * scale, y: this.viewH / 2 + c.y * scale });
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
    const sx = rect.width ? this.viewW / rect.width : 1;
    const sy = rect.height ? this.viewH / rect.height : 1;
    return {
      x: (e.clientX - rect.left) * sx,
      y: (e.clientY - rect.top) * sy
    };
  },

  screenToBoard(e) {
    const pos = this.getMousePos(e);
    const scale = 10 * this.state.zoom;
    return {
      x: (pos.x - this.state.panX - this.viewW / 2) / scale,
      y: (pos.y - this.state.panY - this.viewH / 2) / scale
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

  // 線路圖 ↔ PCB 選取連動。只有從線路圖轉過來的元件（id 前綴 sch-）對得上，
  // 公版／KiCad 匯入／手動放的本來就沒有對應，略過不猜。
  initCrossProbe() {
    if (!window.CrossProbe || this._crossProbe) return;
    this._crossProbe = window.CrossProbe.attach({
      side: 'pcb',
      getSelection: () => {
        const sel = (this.state.selectedSet && this.state.selectedSet.length)
          ? this.state.selectedSet : (this.state.selected ? [this.state.selected] : []);
        return sel.map(c => window.CrossProbe.schIdOf(c)).filter(Boolean);
      },
      applySelection: (ids, path) => {
        // 線路圖送來的是那一頁的區域 id，配上它所在的層才是板上這顆的全名。
        const full = window.CrossProbe.qualify(ids, path);
        const want = new Set(full.map(id => window.CrossProbe.pcbIdOf(id)).filter(Boolean));
        const hit = (this.state.components || []).filter(c => want.has(c.id));
        this.state.selectedSet = hit;
        this.state.selected = hit.length === 1 ? hit[0] : null;
        this.state.selectedTrace = null;
        if (hit.length) this.centerOn(hit);
        this.syncSelPanel();
        this.render();
      }
    });
  },

  // ---- 這顆是線路圖哪一層來的（cross-probe 反查）----
  // 攤平後的線路圖 id 自帶實例路徑，所以板上這一側本來就有答案，只是以前沒顯示：
  // 佈線到一半要回頭確認「這是哪一塊電路」，只能靠 refdes 猜。
  selHierPath(c) {
    if (!window.CrossProbe) return '';
    const sid = window.CrossProbe.schIdOf(c);
    if (!sid) return '';
    return window.CrossProbe.splitPath(sid).path;
  },

  // 多選時 state.selected 是 null，但整層選取本來就是多選——那時候把層藏起來，
  // 使用者剛按完「選同層」畫面就少一列，看起來像按壞了。同層就照顯示。
  selHierPathOfSelection() {
    const set = (this.state.selectedSet && this.state.selectedSet.length)
      ? this.state.selectedSet : (this.state.selected ? [this.state.selected] : []);
    if (!set.length) return '';
    const paths = new Set(set.map(c => this.selHierPath(c)));
    return paths.size === 1 ? [...paths][0] : '';
  },

  syncSelHier(c) {
    const row = document.getElementById('selHierRow');
    const box = document.getElementById('selHier');
    if (!row || !box) return;
    const p = this.selHierPathOfSelection();
    row.style.display = p ? 'flex' : 'none';
    if (p) box.textContent = p.split('/').join(' ▸ ');
  },

  // 同一張子圖的元件在板上通常散在各處。整層選起來才看得出「這塊電路擺在哪」。
  selectSameSheet() {
    const c = this.state.selected;
    const p = c ? this.selHierPath(c) : '';
    if (!p) return;
    const hit = (this.state.components || []).filter(x => this.selHierPath(x) === p);
    if (!hit.length) return;
    this.state.selectedSet = hit;
    this.state.selected = hit.length === 1 ? hit[0] : c;
    this.state.selectedTrace = null;
    this.toast(pcbT('pj_hier_picked', { n: hit.length, path: p.split('/').join(' ▸ ') }), 'info');
    this.syncSelPanel();
    this.render();
  },

  // 把畫面平移到這幾顆元件的中心（連動選取時用；不改縮放，避免畫面亂跳）
  centerOn(comps) {
    if (!comps || !comps.length || !this.canvas) return;
    let x = 0, y = 0;
    comps.forEach(c => { x += c.x; y += c.y; });
    x /= comps.length; y /= comps.length;
    const scale = 10 * (this.state.zoom || 1);
    this.state.panX = -x * scale;
    this.state.panY = -y * scale;
  },

  // ---- 封裝指定 + 回寫線路圖（back-annotation）----
  // 轉換器對不出封裝時會挑一個預設值（電阻預設 0603）並標成 assumed。
  // 使用者需要能改，而且改完要留得住——所以除了改板上的 pad，也寫回線路圖那顆元件。
  // 只寫「封裝」這一項：它是「這顆料是什麼」的一部分，本來就屬於線路圖。
  // 位置、走線那些是 Layout 的事，不回寫。
  populateSelFp() {
    const row = document.getElementById("selFpRow");
    const cat = document.getElementById("selFpCat");
    const varSel = document.getElementById("selFpVar");
    const msg = document.getElementById("selFpMsg");
    const c = this.state.selected;
    if (!row || !cat || !varSel) return;
    const lib = window.PartsLib;
    // IC 的封裝由 IC 資料決定（腳位是規格的一部分），這裡只處理被動件
    const eligible = !!(c && lib && c.type !== "ic");
    row.style.display = eligible ? "grid" : "none";
    if (msg) msg.textContent = "";
    if (!eligible) return;
    const cats = lib.list();
    if (!cat.options.length) {
      cat.innerHTML = cats.map(x => "<option value='" + x.id + "'>" + x.id + "</option>").join("");
      cat.addEventListener("change", () => this.populateSelFpVariants());
    }
    // 目前封裝：part 欄位是 "lib variant"（見 Sch2Pcb.convert）
    const cur = String(c.part || "").split(" ");
    if (cur.length === 2 && cats.some(x => x.id === cur[0])) cat.value = cur[0];
    this.populateSelFpVariants(cur.length === 2 ? cur[1] : null);
    if (msg && c.footprintAssumed) msg.textContent = pcbT("pj_fp_assumed");
  },

  populateSelFpVariants(want) {
    const cat = document.getElementById("selFpCat");
    const varSel = document.getElementById("selFpVar");
    if (!cat || !varSel || !window.PartsLib) return;
    const found = window.PartsLib.list().find(x => x.id === cat.value);
    const vs = (found && found.variants) || [];
    varSel.innerHTML = vs.map(v => "<option value='" + v + "'>" + v + "</option>").join("");
    if (want && vs.indexOf(want) >= 0) varSel.value = want;
  },

  applySelFootprint() {
    const c = this.state.selected;
    const cat = document.getElementById("selFpCat");
    const varSel = document.getElementById("selFpVar");
    const msg = document.getElementById("selFpMsg");
    const say = t => { if (msg) msg.textContent = t; };
    if (!c || !cat || !varSel || !window.PartsLib) return false;
    const built = window.PartsLib.build(cat.value, varSel.value);
    if (!built || !built.ok) { say(pcbT("pj_fp_bad")); return false; }
    this.hist();
    // 換 pad 但保住 net：net 是按 pad 編號對應的，換封裝不該把接線關係弄丟
    const oldNet = {};
    (c.pads || []).forEach(pd => { if (pd.net) oldNet[pd.num] = pd.net; });
    c.pads = built.pads.map(pd => Object.assign({}, pd, { net: oldNet[pd.num] || "" }));
    c.w = Math.max(1, built.body.w); c.h = Math.max(1, built.body.h);
    c.part = cat.value + " " + varSel.value;
    c.footprintVariant = varSel.value;
    c.footprintSource = "partslib";
    // 換封裝＝重新綁庫：舊的 fpDetached / 舊 hash 都失效
    if (window.FpInst) FpInst.stamp(c, { src: "partslib", lib: cat.value, variant: varSel.value }, c.pads);
    c.footprintAssumed = false;
    const schId = window.Sch2Pcb ? Sch2Pcb.schIdOf(c.id) : null;
    if (schId) {
      this.state.fpOverrides = this.state.fpOverrides || {};
      this.state.fpOverrides[schId] = { lib: cat.value, variant: varSel.value };
    }
    const back = this.backAnnotateFootprint(c, cat.value + ":" + varSel.value);
    this.state.ratsnest = null;
    this.renderPartsList();
    this.renderNetPanel();
    this.render();
    const m = pcbT("pj_fp_done", { part: c.part, n: back.changed });
    say(m); this.toast(m, "info");
    return true;
  },

  // 寫回線路圖：多頁存檔（vs-sheets-v1）與目前頁的鏡射（voltsketch-project）都要更新，
  // 只更新其中一個的話，切頁一次就被舊資料蓋回去。
  // mutator 收 pages、就地改、回 { changed, conflict }。
  // 抽出來的理由：封裝、refdes、net 三種回寫的 localStorage 讀寫完全一樣，
  // 各寫一份的話遲早有一份忘了更新其中一個 key，症狀是「切頁一次就變回去」。
  _writeSchPages(mutator) {
    let changed = 0;
    try {
      const sh = JSON.parse(localStorage.getItem("vs-sheets-v1") || "null");
      if (sh && Array.isArray(sh.pages)) {
        const r = mutator(sh.pages) || {};
        if (r.conflict) return { changed: 0, conflict: r.conflict };
        if (r.changed) { changed += r.changed; localStorage.setItem("vs-sheets-v1", JSON.stringify(sh)); }
      }
    } catch (e) { /* 存檔壞了就只寫目前頁 */ }
    try {
      const proj = JSON.parse(localStorage.getItem("voltsketch-project") || "null");
      if (proj) {
        const r = mutator([{ data: proj }]) || {};
        if (r.conflict) return { changed: 0, conflict: r.conflict };
        if (r.changed) { localStorage.setItem("voltsketch-project", JSON.stringify(proj)); changed += r.changed; }
      }
    } catch (e) { }
    return { changed, conflict: null };
  },

  backAnnotateFootprint(comp, footprint) {
    if (!window.Sch2Pcb) return { changed: 0 };
    const schId = Sch2Pcb.schIdOf(comp.id);
    if (!schId) return { changed: 0 };
    return this._writeSchPages(pages => Sch2Pcb.annotateFootprint(pages, schId, footprint));
  },

  // refdes 改名。一定要連線路圖一起改——merge() 是拿線路圖的 ref 覆蓋板子的，
  // 只改板子的話下一次同步就變回去，中間沒有任何提示。
  renameSelRef() {
    const c = this.state.selected;
    if (!c) return;
    const cur = c.ref || c.label || '';
    const name = prompt(pcbT('pj_ref_prompt'), cur);
    if (name === null) return;
    const want = String(name).trim();
    if (!want || want === cur) return;
    // 板子上先查一次撞名：線路圖那邊也會查，但板子上可能有非線路圖來源的元件
    if ((this.state.components || []).some(o => o !== c && String(o.ref || '') === want)) {
      this.toast(pcbT('pj_ref_dup', { ref: want }), 'error');
      return;
    }
    const schId = window.Sch2Pcb ? Sch2Pcb.schIdOf(c.id) : null;
    if (schId) {
      const r = this._writeSchPages(pages => Sch2Pcb.annotateRef(pages, schId, want));
      if (r.conflict) { this.toast(pcbT('pj_ref_dup_sch', { ref: want }), 'error'); return; }
      this.hist();
      c.ref = want; c.label = want;
      this.render(); this.renderPartsList(); this.syncSelPanel();
      this.toast(pcbT('pj_ref_done', { from: cur, to: want, n: r.changed }));
    } else {
      // 不是從線路圖來的元件（KiCad 匯入、手動放的）：只改板子，沒有回寫的問題
      this.hist();
      c.ref = want; c.label = want;
      this.render(); this.renderPartsList(); this.syncSelPanel();
      this.toast(pcbT('pj_ref_done_local', { from: cur, to: want }));
    }
  },

  // net 改名。線路圖端的 net 名字存在導線的 net 欄位上（見 net-label.test.js 的模型），
  // 板子端散在 pad / 走線 / via / KiCad 鋪銅 / 使用者鋪銅 / 淚滴六處。
  // 這裡不再手抄清單：以前抄漏了 userZones 與 teardrops，改完名字使用者畫的鋪銅
  // 還掛在舊網路上，而畫面上看不出來。列舉統一由 NetModel.refs 出。
  renameNetName(oldName) {
    const from = String(oldName || '').trim();
    if (!from) return;
    const name = prompt(pcbT('pj_net_prompt', { net: from }), from);
    if (name === null) return;
    const to = String(name).trim();
    if (!to || to === from) return;

    const all = new Set(window.NetModel ? NetModel.names(this.state) : []);
    if (all.has(to)) { this.toast(pcbT('pj_net_dup', { net: to }), 'error'); return; }

    let schChanged = 0;
    if (window.Sch2Pcb) {
      const r = this._writeSchPages(pages => Sch2Pcb.renameNet(pages, from, to));
      if (r.conflict) { this.toast(pcbT('pj_net_dup_sch', { net: to }), 'error'); return; }
      schChanged = r.changed;
    }

    this.hist();
    const n = window.NetModel ? NetModel.rename(this.state, from, to) : 0;
    this.render();
    if (this.renderNetPanel) this.renderNetPanel();
    this.toast(pcbT('pj_net_done', { from, to, n, sch: schChanged }));
  },

  syncSelPanel() {
    if (this._crossProbe) this._crossProbe.notify();
    this.syncTracePanel();
    const c = this.state.selected;
    const fields = document.getElementById('selFields'), info = document.getElementById('selInfo');
    if (!fields) return;
    fields.style.display = c ? 'grid' : 'none';
    if (info) info.style.display = c ? 'none' : '';
    this.syncSelHier(c);
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
    this.populateSelFp();
  },

  // ---- 匯流排（從線路圖帶過來的成組關係）----
  // 板子上沒有「一束」這種東西，只有一條條 net。這一段把成組關係顯示出來，
  // 並且給兩個真正用得到的動作：整束高亮、整束等長。
  busReports() {
    const gs = this.state.busGroups || [];
    if (!gs.length || !window.SchBus || !window.NetRules) return [];
    const lenOf = n => window.NetRules.netLength(this.state.traces, n);
    return gs.map(g => window.SchBus.report(g, lenOf));
  },

  renderBusPanel() {
    const box = document.getElementById('busRows');
    if (!box) return;
    const reps = this.busReports();
    if (!reps.length) {
      box.innerHTML = "<div style='color:var(--muted)'>" + pcbT('pj_bus_none') + '</div>';
      this.renderBusRules();
      return;
    }
    const esc = t => String(t).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
    const cur = this.state.highlightBus || '';
    box.innerHTML = reps.map(r => {
      const on = cur === r.spec;
      // 還沒繞的成員單獨標出來：把它們算進 skew 會得到一個假的大數字
      const sk = r.routed >= 2 ? r.skew.toFixed(2) + ' mm' : '—';
      return "<div class='bus-row' data-bus='" + esc(r.spec) + "' style='display:grid;grid-template-columns:1fr auto auto;gap:6px;padding:4px 6px;cursor:pointer;border-bottom:1px solid var(--line);" +
        (on ? 'background:rgba(46,204,113,.15)' : '') + "'>" +
        '<span>' + esc(r.spec) + '</span>' +
        "<span style='color:var(--muted)'>" + r.routed + '/' + r.width + '</span>' +
        "<span title='skew' style='font-family:ui-monospace,Menlo,monospace'>" + sk + '</span></div>';
    }).join('');
    this.renderBusRules();
  },

  // ---- 每一束的規則（BusDrc）----
  // 規則掛在選中的那一束上，不是全域：DDR 的資料線要等長、I2C 那兩條不必，
  // 一組全域數字套下去只會逼使用者關掉整個檢查。
  // 空白＝不檢查（不是 0）；一致性那兩條預設就開，不必填任何數字。
  renderBusRules() {
    const box = document.getElementById('busRuleBox');
    if (!box || !window.BusDrc) return;
    const esc = t => String(t == null ? '' : t).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
    const spec = this.state.highlightBus || '';
    if (!spec) { box.innerHTML = "<div style='color:var(--muted)'>" + esc(pcbT('pj_busr_pick')) + '</div>'; return; }
    const r = window.BusDrc.rulesFor(this.state, spec);
    const num = (k, label, title, step) =>
      "<label title='" + esc(title) + "' style='display:flex;align-items:center;gap:4px'>" +
      "<span style='color:var(--muted)'>" + esc(label) + '</span>' +
      "<input class='busr-num' data-k='" + k + "' type='number' min='0' step='" + step + "' value='" +
      (r[k] > 0 ? r[k] : '') + "' placeholder='—' style='width:56px;padding:2px'></label>";
    const chk = (k, label, title) =>
      "<label title='" + esc(title) + "' style='display:flex;align-items:center;gap:4px'>" +
      "<input class='busr-chk' data-k='" + k + "' type='checkbox'" + (r[k] ? ' checked' : '') + '>' +
      "<span style='color:var(--muted)'>" + esc(label) + '</span></label>';
    box.innerHTML =
      "<div style='font-size:11px;margin-bottom:4px'>" + esc(pcbT('pj_busr_for', { spec: spec })) + '</div>' +
      "<div style='display:flex;flex-wrap:wrap;gap:8px;font-size:11px'>" +
      num('maxSkew', pcbT('pj_busr_skew'), pcbT('pj_busr_skew_t'), '0.05') +
      num('intraGap', pcbT('pj_busr_gap'), pcbT('pj_busr_gap_t'), '0.05') +
      num('maxVias', pcbT('pj_busr_maxvias'), pcbT('pj_busr_maxvias_t'), '1') +
      chk('sameLayer', pcbT('pj_busr_samelayer'), pcbT('pj_busr_samelayer_t')) +
      chk('viaMatch', pcbT('pj_busr_viamatch'), pcbT('pj_busr_viamatch_t')) +
      chk('requireAll', pcbT('pj_busr_all'), pcbT('pj_busr_all_t')) +
      '</div>' +
      "<p style='font-size:11px;color:var(--muted);margin:6px 0 0'>" + esc(pcbT('pj_busr_hint')) + '</p>';
  },

  // 規則寫回 state（跟著板子存檔走），並立刻重跑 DRC——
  // 改完規則卻要自己再按一次 DRC 的話，使用者無從知道這條規則有沒有效。
  setBusRule(spec, key, value) {
    if (!window.BusDrc || !spec) return false;
    this.hist();
    window.BusDrc.setRule(this.state, spec, key, value);
    this.renderBusRules();
    // 只在 DRC 清單已經有內容時重跑：跟語言切換那條路同一個判準。
    // 每改一個欄位就跑一次全量 DRC（公版 240ms）會讓輸入框卡住。
    const drc = document.querySelector('#drcResults');
    if (drc && drc.innerHTML.trim()) this.runDrc();
    return true;
  },

  toggleBusHighlight(spec) {
    const g = (this.state.busGroups || []).find(x => x.spec === spec);
    if (!g) return false;
    const on = this.state.highlightBus === spec;
    this.state.highlightBus = on ? '' : spec;
    this.state.highlightBusNets = on ? [] : g.members.slice();
    // 單條高亮與整束高亮互斥：兩個同時亮，使用者分不出哪個是哪個
    if (!on) this.state.highlightNet = null;
    this.renderBusPanel();
    this.renderNetPanel();
    this.render();
    return true;
  },

  // 整束等長：全部拉到目前最長的那一條。逐條走既有的蛇形調諧，
  // 不另外寫一套——兩套等長邏輯遲早會給出不同答案。
  tuneBus(spec) {
    const g = (this.state.busGroups || []).find(x => x.spec === spec);
    if (!g || !window.NetRules) return false;
    const lenOf = n => window.NetRules.netLength(this.state.traces, n);
    const rep = window.SchBus.report(g, lenOf);
    if (rep.routed < 2) { this.toast(pcbT('pj_bus_need2', { spec: spec }), 'warn'); return false; }
    const target = rep.max;
    let done = 0, skipped = 0;
    for (const row of rep.rows) {
      if (row.len <= 0) { skipped++; continue; }              // 沒繞的跳過，不是失敗
      if (target - row.len < 0.05) continue;                   // 已經是最長的那條
      if (this.meanderNet(row.net, target)) done++; else skipped++;
    }
    const after = window.SchBus.report(g, lenOf);
    this.state.ratsnest = null;
    this.renderBusPanel();
    this.render();
    this.toast(pcbT('pj_bus_tuned', { spec: spec, n: done, skew: after.skew.toFixed(2), skipped: skipped }), skipped ? 'warn' : 'info');
    return true;
  },

  // 匯流排群組佈線：一次拉一束。
  //
  // 誠實界定：這不是真正的束狀繞線（全程等距並行、共同轉彎）——那要另一種求解器。
  // 這裡做的是「把這一束的飛線整批交給既有的繞線器，並且照匯流排成員順序排隊」。
  // 順序是重點：既有的 RouteAll 預設照長度排（order:'short'），一束線那樣繞會互相穿過去，
  // 拉出來像打結；照 D0..Dn 的順序繞，出來才是一疊平行線。所以這裡指定 order:'none'。
  //
  // 繞完照樣回報 skew，而且跟面板同一條規則：**只算已繞的成員**。
  routeBus(spec) {
    const g = (this.state.busGroups || []).find(x => x.spec === spec);
    if (!g) return false;
    if (!window.Ratsnest || !window.RouteAll) return false;
    const rank = new Map(g.members.map((m, i) => [m, i]));
    const lines = window.Ratsnest.compute(this.state, this.padAbs.bind(this))
      .filter(l => rank.has(l.net))
      .sort((a, b) => (rank.get(a.net) - rank.get(b.net)));
    if (!lines.length) { this.toast(pcbT('pj_bus_route_none', { spec: spec }), 'info'); return false; }

    this.hist();
    const rules = this.loadDrcRules();
    const ps = window.Padstack ? window.Padstack.load() : { od: 0.7, drill: 0.3 };
    const opts = {
      layers: this.routableLayers(),
      layer: this.state.traceLayer || 'F.Cu',
      width: this.state.traceWidth || 0.25,
      clearance: rules.clearance,
      viaOd: ps.od, viaDrill: ps.drill,
      grid: 0.25,
      order: 'none',            // 照匯流排順序，不照長度
      ripup: true, passes: 3, budgetMs: 8000
    };
    // 先試真正的束狀繞線：中心線只繞一次，N 條沿法線展開，所以全程等距、一起轉彎。
    // 繞不出來（走廊塞不下、展開後壓到鄰居）就退回批次繞——那條路每條各自找路，
    // 出來只是「大致平行」，但它有完整的淨空檢查，總比繞不出來好。
    // 兩條路的差別會講給使用者聽：他看到的線長什麼樣，取決於走了哪一條。
    let bundled = null;
    if (window.AutoRoute && window.AutoRoute.routeBundle && lines.length >= 2) {
      const b = window.AutoRoute.routeBundle(this.state, this.padAbs.bind(this), lines,
        Object.assign({}, opts, { drcRules: rules }));
      if (b.ok) bundled = b;
    }
    const stamp = Date.now();
    if (bundled) {
      bundled.members.forEach((m, i) => {
        m.segs.forEach((sg, k) => this.state.traces.push({
          id: 'trace-' + stamp + '-bnd' + i + '-' + k,
          x1: sg.x1, y1: sg.y1, x2: sg.x2, y2: sg.y2,
          width: opts.width, layer: sg.layer || opts.layer, net: m.net
        }));
        (m.vias || []).forEach((v, k) => this.state.vias.push({
          id: 'via-' + stamp + '-bnd' + i + '-' + k,
          x: v.x, y: v.y, od: v.od, drill: v.drill, net: m.net, auto: true
        }));
      });
      this.state.ratsnest = null;
      this.state.drcMarks = null;
      const lenOf0 = n => window.NetRules ? window.NetRules.netLength(this.state.traces, n) : 0;
      const rep0 = window.SchBus ? window.SchBus.report(g, lenOf0) : { routed: 0, skew: 0 };
      this.renderBusPanel();
      this.renderNetPanel();
      this.render();
      this.toast(pcbT('pj_bus_bundled', {
        spec: spec, n: bundled.members.length, pitch: bundled.pitch.toFixed(2),
        skew: (rep0.routed >= 2 ? rep0.skew.toFixed(2) : '—')
      }), 'info');
      return true;
    }

    const r = window.RouteAll.run(this.state, this.padAbs.bind(this), lines, opts);
    r.routed.forEach((x, i) => {
      x.segs.forEach((sg, k) => this.state.traces.push({
        id: 'trace-' + stamp + '-bus' + i + '-' + k,
        x1: sg.x1, y1: sg.y1, x2: sg.x2, y2: sg.y2,
        width: opts.width, layer: sg.layer || opts.layer, net: x.line.net
      }));
      (x.vias || []).forEach((v, k) => this.state.vias.push({
        id: 'via-' + stamp + '-bus' + i + '-' + k,
        x: v.x, y: v.y, od: v.od, drill: v.drill, net: x.line.net, auto: true
      }));
    });
    this.state.ratsnest = null;
    this.state.drcMarks = null;               // 動過銅就讓 DRC 標記過期
    const lenOf = n => window.NetRules ? window.NetRules.netLength(this.state.traces, n) : 0;
    const rep = window.SchBus ? window.SchBus.report(g, lenOf) : { routed: 0, skew: 0 };
    this.renderBusPanel();
    this.renderNetPanel();
    this.render();
    this.toast(pcbT('pj_bus_routed', {
      spec: spec, n: r.routed.length, fail: r.failed.length,
      skew: (rep.routed >= 2 ? rep.skew.toFixed(2) : '—')
    }), r.failed.length ? 'warn' : 'info');
    return true;
  },

  // 走線屬性面板。以前選中走線只能刪：線寬與層都得先退出、改左側欄位、重畫一次。
  syncTracePanel() {
    const box = document.getElementById('traceSelFields');
    const hint = document.getElementById('traceSelHint');
    const t = this.state.selectedTrace;
    if (!box) return;
    box.style.display = t ? 'grid' : 'none';
    if (hint) hint.style.display = t ? 'none' : '';
    if (!t) return;
    const w = document.getElementById('tsWidth');
    if (w && document.activeElement !== w) w.value = Math.round((t.width || 0.3) * 1000) / 1000;
    const sel = document.getElementById('tsLayer');
    if (sel) {
      const cu = (this.state.layerStack || []).filter(l => l.kind === 'copper');
      if (sel.getAttribute('data-built') !== String(cu.length)) {
        sel.innerHTML = cu.map(l => '<option value="' + l.id + '">' + this.layerDispName(l) + '</option>').join('');
        sel.setAttribute('data-built', String(cu.length));
      }
      if (document.activeElement !== sel) sel.value = t.layer || 'F.Cu';
    }
    const net = document.getElementById('tsNet');
    if (net) net.textContent = t.net || '—';
    const len = document.getElementById('tsLen');
    // 弧走線的長度是弧長，不是兩端點的距離（PcbInteract.lengthOf 管這件事）
    if (len) len.textContent = (window.PcbInteract ? PcbInteract.lengthOf(t) : 0).toFixed(3) + ' mm';
  },

  deleteSelectedTrace() {
    const t = this.state.selectedTrace;
    if (!t) return false;
    this.hist();
    const i = this.state.traces.indexOf(t);
    if (i >= 0) this.state.traces.splice(i, 1);
    this.state.selectedTrace = null;
    this.state.ratsnest = null;
    this.renderPartsList();
    this.syncSelPanel();
    this.render();
    return true;
  },

  // ---- 右鍵選單 ----
  // 項目內容由 PcbInteract.menuFor 決定（純資料、node 測得到）；這裡只負責畫與接事件。
  // CSP 不准 inline onclick，所以每個項目都是 addEventListener。
  initContextMenu() {
    if (!this.canvas) return;
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const b = this.screenToBoard(e);
      const cHit = this.compHit(b.x, b.y);
      const tHit = cHit ? null : this.traceHit(b.x, b.y);
      let hit = null;
      if (cHit) {
        const sn = this.snapTarget(b.x, b.y);
        hit = { kind: 'comp', comp: cHit, net: (sn && sn.d <= 0.6) ? sn.net : '' };
        this.state.selected = cHit; this.state.selectedSet = [cHit]; this.state.selectedTrace = null;
      } else if (tHit) {
        hit = { kind: 'trace', trace: tHit };
        this.state.selectedTrace = tHit; this.state.selected = null; this.state.selectedSet = [];
      }
      this.renderPartsList(); this.syncSelPanel(); this.render();
      this.showCtxMenu(e.clientX, e.clientY, hit);
    });
    document.addEventListener('click', () => this.hideCtxMenu());
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.hideCtxMenu(); });
    window.addEventListener('blur', () => this.hideCtxMenu());
  },

  showCtxMenu(cx, cy, hit) {
    const host = document.getElementById('pcbCtxMenu');
    if (!host || !window.PcbInteract) return;
    host.innerHTML = '';
    PcbInteract.menuFor(hit, this.state).forEach(it => {
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'ctx-item' + (it.danger ? ' ctx-danger' : '');
      row.textContent = pcbT(it.i18n);
      row.disabled = !!it.disabled;
      row.addEventListener('click', (ev) => {
        ev.stopPropagation();
        this.hideCtxMenu();
        this.runCtxAction(it.id, hit);
      });
      host.appendChild(row);
    });
    host.style.display = 'grid';
    // 先顯示才量得到尺寸；貼著右下角開的話要往回收，不然選單掉出畫面外
    const r = host.getBoundingClientRect();
    const x = Math.min(cx, window.innerWidth - r.width - 8);
    const y = Math.min(cy, window.innerHeight - r.height - 8);
    host.style.left = Math.max(4, x) + 'px';
    host.style.top = Math.max(4, y) + 'px';
  },

  hideCtxMenu() {
    const host = document.getElementById('pcbCtxMenu');
    if (host) host.style.display = 'none';
  },

  runCtxAction(id, hit) {
    const t = hit && hit.trace;
    if (id === 'hlnet') {
      this.state.highlightNet = (t ? t.net : (hit && hit.net)) || null;
      this.renderNetPanel(); this.render(); return;
    }
    if (id === 'flip' && t) {
      this.hist();
      t.layer = PcbInteract.flipLayer(t.layer || 'F.Cu');
      this.state.ratsnest = null;
      this.syncSelPanel(); this.render();
      this.toast(pcbT('pj_ts_applied', { what: t.layer }), 'info'); return;
    }
    if (id === 'applyw' && t) {
      const w = this.state.traceWidth || 0.3;
      this.hist(); t.width = w;
      this.syncSelPanel(); this.render();
      this.toast(pcbT('pj_ts_applied', { what: w + ' mm' }), 'info'); return;
    }
    if (id === 'delete') { if (t) this.deleteSelectedTrace(); else if (this.state.selected) this.deleteSelected(); return; }
    if (id === 'rotate') { this.rotateSelected(90); return; }
    if (id === 'rename') { this.renameSelRef(); return; }
    if (id === 'paste') { this.pasteClipboard(); return; }
    if (id === 'fit') { this.zoomFit(); return; }
    if (id === 'rats') {
      this.state.showRatsnest = !this.state.showRatsnest;
      const cb = document.getElementById('ratsnestToggle');
      if (cb) cb.checked = this.state.showRatsnest;
      this.state.ratsnest = null; this.render(); return;
    }
    if (id === 'clearhl') { this.state.highlightNet = null; this.renderNetPanel(); this.render(); return; }
  },

  // 快捷鍵說明：跟 keydown 綁定同源（PcbInteract.shortcuts），
  // 不會出現「說明寫了、程式其實沒綁」。
  renderShortcutHelp() {
    const host = document.getElementById('shortcutRows');
    if (!host || !window.PcbInteract) return;
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    host.innerHTML = PcbInteract.shortcuts().map(s =>
      '<div class="sc-key">' + esc(s.keys) + '</div><div class="sc-act">' + esc(pcbT(s.i18n)) + '</div>').join('');
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
  // 差分對的配對規則只留一份：NetModel.pairOf（明講的優先，其次照命名推）。
  // 這裡以前自己寫了一套 _P/_N 比對，跟 DRC 用的那一套不同步——
  // 結果是繞線器成對繞出來的線，DRC 不認為它們是一對，每一對都報 drc_tt。
  pairNetOf(net) {
    if (!net) return null;
    if (window.NetModel && NetModel.pairOf) {
      const pr = NetModel.pairOf(this.state, net, this.allNetNames());
      if (pr && pr.net && this.netExists(pr.net)) return pr.net;
      return null;
    }
    return null;
  },

  allNetNames() {
    const s = new Set();
    for (const c of this.state.components) for (const p of (c.pads || [])) if (p.net) s.add(p.net);
    for (const t of this.state.traces) if (t.net) s.add(t.net);
    return [...s];
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
        const cls = ConstraintMgr.classOf(ConstraintMgr.load(), net, this.state.netClasses);
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
  // 一段走線最多能塞多少額外長度（單側方波蛇形）。
  // 每個 bump 沿線吃掉 s、額外貢獻 2A；振幅上限 ampMax，兩端各留 0.5mm 引線。
  meanderCapacity(seg, ampMax) {
    const len = Math.hypot(seg.x2 - seg.x1, seg.y2 - seg.y1);
    const w = seg.width || 0.3;
    const s = Math.max(4 * w, 1.2);
    const kMax = Math.floor((len - 1.0) / s);
    if (kMax < 1) return { len, s, kMax: 0, cap: 0 };
    return { len, s, kMax, cap: 2 * kMax * (ampMax > 0 ? ampMax : 3.0) };
  },

  // 把一段走線換成蛇形，額外補上 extra 的長度。回傳新的線段陣列。
  meanderSegment(seg, extra, net) {
    const len = Math.hypot(seg.x2 - seg.x1, seg.y2 - seg.y1);
    const w = seg.width || 0.3;
    const s = Math.max(4 * w, 1.2);
    const kMax = Math.floor((len - 1.0) / s);
    if (kMax < 1 || extra <= 0) return null;
    const k = Math.min(kMax, Math.max(1, Math.ceil(extra / (2 * 2.0))));
    const A = extra / (2 * k);
    const ux = (seg.x2 - seg.x1) / len, uy = (seg.y2 - seg.y1) / len, pxv = -uy, pyv = ux;
    const lead = (len - k * s) / 2;
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
    const out = [];
    for (let i = 1; i < pts.length; i++) {
      const [x1, y1] = pts[i - 1], [x2, y2] = pts[i];
      if (Math.hypot(x2 - x1, y2 - y1) < 1e-6) continue;
      out.push({ id: `trace-${Date.now()}-${out.length}`, x1, y1, x2, y2, width: w, layer: seg.layer, net });
    }
    return { traces: out, k, amp: A };
  },

  // 等長調諧的核心：把 net 拉長到 target。不碰 DOM、不彈 toast，
  // 因為「整束等長」要對每一條呼叫這一支——訊息由呼叫端統一講。
  // 兩套等長邏輯遲早會給出不同答案，所以只有這一份。
  meanderNet(net, target) {
    if (!window.NetRules || !net || !(target > 0)) return { ok: false, why: "args" };
    const L = NetRules.netLength(this.state.traces, net);
    if (!(L > 0)) return { ok: false, why: "notrace", net: net };
    const dL = target - L;
    if (dL < 0.05) return { ok: true, why: "already", net: net, before: L, after: L, target: target, segs: 0, bumps: 0 };

    // 補償量攤到好幾段：一條 net 常常是好幾段折線，每段都能吃一點。
    // 由長到短依序吃，每段最多吃到自己的容量上限（bump 數 × 振幅上限）。
    const AMP_MAX = 3.0;
    const segs = this.state.traces
      .filter(t => (t.net || "") === net)
      .map(t => Object.assign({ t: t }, this.meanderCapacity(t, AMP_MAX)))
      .filter(x => x.cap > 0)
      .sort((a, b) => b.cap - a.cap);
    if (!segs.length) return { ok: false, why: "nofit", net: net, before: L, target: target };

    const totalCap = segs.reduce((a, x) => a + x.cap, 0);
    if (totalCap < dL - 1e-9) {
      return { ok: false, why: "short", net: net, need: dL, cap: totalCap, n: segs.length, before: L, target: target };
    }

    this.hist();
    let left = dL, used = 0, bumps = 0;
    const replaced = [];
    for (const x of segs) {
      if (left <= 1e-9) break;
      const take = Math.min(left, x.cap);
      const r = this.meanderSegment(x.t, take, net);
      if (!r) continue;
      replaced.push({ old: x.t, add: r.traces });
      left -= take; used++; bumps += r.k;
    }
    replaced.forEach(r => {
      const i = this.state.traces.indexOf(r.old);
      if (i >= 0) this.state.traces.splice(i, 1);
      r.add.forEach(t => this.state.traces.push(t));
    });
    this.state.ratsnest = null;
    const after = NetRules.netLength(this.state.traces, net);
    return { ok: true, why: "", net: net, before: L, after: after, target: target, segs: used, bumps: bumps };
  },

  meanderTune() {
    const msg = document.getElementById("tuneMsg");
    const say = (t, k) => { if (msg) msg.textContent = t; this.toast(t, k || "info"); };
    const net = document.getElementById("tuneNet")?.value?.trim();
    if (!net) { say(pcbT("pj_tune_nonet"), "warn"); return; }
    if (!window.NetRules) return;
    const L = NetRules.netLength(this.state.traces, net);
    if (!(L > 0)) { say(pcbT("pj_tune_notrace", { net: net }), "warn"); return; }
    let target = parseFloat(document.getElementById("tuneTarget")?.value);
    if (!(target > 0)) {
      const pair = this.pairNetOf(net);
      if (!pair) { say(pcbT("pj_tune_nopair", { net: net }), "warn"); return; }
      target = NetRules.netLength(this.state.traces, pair);
    }
    const r = this.meanderNet(net, target);
    if (!r.ok) {
      if (r.why === "nofit") say(pcbT("pj_tune_nofit"), "error");
      else if (r.why === "short") say(pcbT("pj_tune_short", { need: r.need.toFixed(2), cap: r.cap.toFixed(2), n: r.n }), "error");
      else say(pcbT("pj_tune_notrace", { net: net }), "warn");
      return;
    }
    if (r.why === "already") { say(pcbT("pj_tune_already", { len: L.toFixed(2), target: target.toFixed(2) }), "info"); return; }
    say(pcbT("pj_tune_done2", {
      net: net, before: r.before.toFixed(2), after: r.after.toFixed(2), target: target.toFixed(2),
      segs: r.segs, k: r.bumps
    }), Math.abs(r.after - target) < 0.05 ? "info" : "warn");
    this.render();
  },

  // 走線落子後即時規則檢查（超標 toast 警示）
  // 剛畫完（或剛改完）一條走線之後，只對它周圍那一小塊重跑 DRC。
  //
  // 為什麼不直接 runDrc()：1436 pad 的公版全量要 240ms，每畫一段就卡一下。
  // 這裡把檢查範圍縮到「這條線的新舊位置聯集，再膨脹一個間距規則」，
  // 剩下的板子完全不碰。region 一定要膨脹，否則剛好在框外的鄰居會被漏掉
  // ——漏掉的症狀是少報一條違規，沒有任何訊息（見 drc-incremental.test.js §7）。
  //
  // 只用 toast 提示，不動「執行 DRC」那份全量清單：兩者的涵蓋範圍不同，
  // 混在一起會讓使用者不知道清單到底是全板的還是局部的。
  quickDrc(tr, beforeBox) {
    if (!window.PcbIndex || !window.PadDrc || !tr) return;
    const rules = this.loadDrcRules();
    const cl = rules.clearance.traceToTrace || 0.15;
    const after = PcbIndex.traceBox(tr, cl);
    const region = PcbIndex.dirtyRect([{ before: beforeBox || null, after }], cl);
    if (!region) return;
    let out = [];
    try {
      out = window.PadDrc.run(this.state, this.padAbs.bind(this), rules, { region }) || [];
    } catch (e) { return; }   // 即時檢查壞掉不可以擋住畫線
    const errs = out.filter(x => x.type === 'error');
    // toast 會自己消失，違規不會。畫面上標紅，使用者才看得到是「哪一段」出問題。
    this.state.drcMarks = out
      .filter(x => (x.type === 'error' || x.type === 'warning') && typeof x.x === 'number' && typeof x.y === 'number')
      .map(x => ({ x: x.x, y: x.y, type: x.type, message: x.message }));
    if (this.state.drcMarks.length) this.render();
    if (errs.length) this.toast(pcbT('pj_drc_quick', { n: errs.length }), 'warn');
  },

  checkTraceRules(tr) {
    // 先做區域 DRC——它不需要 net，所以不能放在下面那個 net 守衛後面。
    this.quickDrc(tr);
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

  // 繞線時的即時淨空檢查：只算「進行中的那一段」對周圍物件的距離。
  // 為什麼不直接跑 runDrc：1436 個 pad 的公版跑一次要 240ms，放進 mousemove 等於卡死；
  // 這裡只掃一條線對鄰域的距離，openrex 實測 <2ms。
  // 回傳最糟的那一項 { d, req, what }（d 是實際淨距、req 是規則下限），沒有東西可比就回 null。
  // ---- 橡皮筋（拖元件時走線跟著走）----
  // 舊版拖動元件時走線原地不動，pad 一走就跟走線斷開：畫面上還連著、電性上已經沒接。
  // 這裡在拖曳開始時記下「哪一條走線的哪一端貼在哪顆 pad 上、偏移多少」，
  // 拖曳過程中把那些端點跟著 pad 搬。偏移要記下來——端點不一定正好在 pad 中心。
  beginRubber(comps) {
    const list = [];
    const set = new Set(comps || []);
    for (const c of set) {
      for (const pad of (c.pads || [])) {
        if (pad.cu === false) continue;
        const a = this.padAbs(c, pad);
        const r = Math.hypot(pad.w || 0.5, pad.h || 0.5) / 2 + 0.05;
        for (const t of this.state.traces) {
          // 同 net 才算接上；任一邊沒有 net 時只能靠幾何判斷，允許
          const pn = pad.net || "", tn = t.net || "";
          if (pn && tn && pn !== tn) continue;
          if (Math.hypot(t.x1 - a.x, t.y1 - a.y) <= r) list.push({ t, end: "a", c, pad, dx: t.x1 - a.x, dy: t.y1 - a.y });
          if (Math.hypot(t.x2 - a.x, t.y2 - a.y) <= r) list.push({ t, end: "b", c, pad, dx: t.x2 - a.x, dy: t.y2 - a.y });
        }
      }
    }
    this.state.rubber = list.length ? list : null;
    return list.length;
  },

  updateRubber() {
    const list = this.state.rubber;
    if (!list) return;
    for (const r of list) {
      const a = this.padAbs(r.c, r.pad);
      if (r.end === "a") { r.t.x1 = a.x + r.dx; r.t.y1 = a.y + r.dy; }
      else { r.t.x2 = a.x + r.dx; r.t.y2 = a.y + r.dy; }
    }
    this.state.ratsnest = null;
  },

  // 推擠開關：預設開。關掉就回到「只警告不動別人的線」的舊行為。
  shoveEnabled() {
    const el = document.getElementById("shoveToggle");
    return el ? !!el.checked : true;
  },

  guidesEnabled() {
    const el = document.getElementById("guideToggle");
    return el ? !!el.checked : true;
  },

  // 連鎖推擠深度。1＝只推一層（舊行為）。上限由 Shove 自己夾在 8，
  // 這裡不重複夾——兩個地方各夾一次，改其中一個就會出現「設了沒用」。
  shoveDepth() {
    const el = document.getElementById("shoveDepth");
    const v = el ? parseInt(el.value, 10) : 3;
    return Number.isFinite(v) && v > 0 ? v : 3;
  },

  // 對齊輔助線：拖曳中對齊到什麼就畫一條穿過整片板的細虛線。
  // 只在拖曳當下畫（state.guides 是純檢視狀態、不進快照），放開就沒了。
  drawGuides(scale) {
    const gs = this.state.guides;
    if (!gs || !gs.length) return;
    const { ctx } = this;
    const X = x => this.viewW / 2 + x * scale, Y = y => this.viewH / 2 + y * scale;
    ctx.save();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    for (const g of gs) {
      ctx.beginPath();
      if (g.axis === 'x') { ctx.moveTo(X(g.at), 0); ctx.lineTo(X(g.at), this.viewH); }
      else { ctx.moveTo(0, Y(g.at)); ctx.lineTo(this.viewW, Y(g.at)); }
      ctx.stroke();
    }
    ctx.restore();
  },

  previewClearance(td) {
    const gm = window.PadDrc && window.PadDrc._geom;
    if (!gm || !td) return null;
    const lay = this.state.traceLayer || "F.Cu";
    const w2 = (this.state.traceWidth || 0.3) / 2;
    const cl = this.loadDrcRules().clearance;
    const cmData = window.ConstraintMgr ? ConstraintMgr.load() : null;
    const padAbsFn = this.padAbs.bind(this);
    let worst = null;
    // 比的是「離下限還差多少」，不是絕對距離——0.05mm 的 pad 淨空可能比 0.3mm 的板邊淨空更危險
    const consider = (d, req, what) => {
      if (!Number.isFinite(d)) return;
      if (!worst || (d - req) < (worst.d - worst.req)) worst = { d, req, what };
    };

    // 同層異網走線（Constraint Manager 的矩陣可以逐對指定淨空）
    for (const t of this.state.traces) {
      if ((t.layer || "F.Cu") !== lay) continue;
      if (td.net && t.net && t.net === td.net) continue;
      const d = gm.segSegDist(td.x1, td.y1, td.x2, td.y2, t.x1, t.y1, t.x2, t.y2) - w2 - (t.width || 0.3) / 2;
      const req = cmData ? ConstraintMgr.clearanceBetween(cmData, td.net || "", t.net || "", cl.traceToTrace, this.state.netClasses) : cl.traceToTrace;
      consider(d, req, pcbT("pj_obj_trace", { net: t.net || "?" }));
    }

    // pad：最常撞到的就是這個，舊版完全沒查
    const segMinX = Math.min(td.x1, td.x2), segMaxX = Math.max(td.x1, td.x2);
    const segMinY = Math.min(td.y1, td.y2), segMaxY = Math.max(td.y1, td.y2);
    for (const c of this.state.components) for (const pd of (c.pads || [])) {
      if (pd.cu === false) continue;
      if (td.net && (pd.net || "") === td.net) continue;
      const side = pd.side;
      if (!(side === "*" || (side === "B" ? lay === "B.Cu" : lay === "F.Cu"))) continue;
      const a = padAbsFn(c, pd);
      const rOuter = Math.hypot(pd.w || 0.5, pd.h || 0.5) / 2 + w2 + 1;
      if (a.x < segMinX - rOuter || a.x > segMaxX + rOuter || a.y < segMinY - rOuter || a.y > segMaxY + rOuter) continue;
      const d = gm.segPadDist(td.x1, td.y1, td.x2, td.y2, gm.padShape(c, pd, padAbsFn)) - w2;
      consider(d, cl.traceToPad, (c.ref || "?") + "." + (pd.num != null ? pd.num : ""));
    }

    // via（穿孔在每一層都是銅）
    for (const v of (this.state.vias || [])) {
      if (td.net && (v.net || "") === td.net) continue;
      const d = gm.ptSegDist(v.x, v.y, td.x1, td.y1, td.x2, td.y2) - (v.od || 0.7) / 2 - w2;
      consider(d, cl.traceToTrace, pcbT("pj_obj_via", { net: v.net || "?" }));
    }

    // 板邊：矩形板框，取線段最外側到板邊的距離
    const hw = (this.state.boardWidth || 100) / 2, hh = (this.state.boardHeight || 80) / 2;
    const dEdge = Math.min(hw - Math.max(Math.abs(td.x1), Math.abs(td.x2)),
                           hh - Math.max(Math.abs(td.y1), Math.abs(td.y2))) - w2;
    consider(dEdge, cl.traceToEdge, pcbT("pj_obj_edge"));

    // 禁佈區：碰到就是違規，沒有「淨空下限」可談（與 runDrc 的判定一致）
    for (const k of (this.state.keepouts || [])) {
      if (!k.pts || k.pts.length < 3) continue;
      if (k.layer && k.layer !== "*" && k.layer !== lay) continue;
      let d = Infinity;
      for (let a = 0; a < k.pts.length; a++) {
        const p1 = k.pts[a], p2 = k.pts[(a + 1) % k.pts.length];
        d = Math.min(d, gm.segSegDist(td.x1, td.y1, td.x2, td.y2, p1[0], p1[1], p2[0], p2[1]));
      }
      if (gm.ptInPoly(td.x1, td.y1, k.pts) || gm.ptInPoly(td.x2, td.y2, k.pts)) d = -w2;
      consider(d - w2, 0, pcbT("pj_obj_keepout"));
    }
    return worst;
  },

  // 高亮某個網路：走線加粗一層、pad 畫圈。只是檢視，不改資料。
  drawNetHighlight(scale) {
    // 單條高亮，或整束高亮（匯流排）。兩者互斥，同時亮的話分不出哪條是哪條。
    const set = this.state.highlightBusNets && this.state.highlightBusNets.length
      ? this.state.highlightBusNets : (this.state.highlightNet ? [this.state.highlightNet] : []);
    if (!set.length) return;
    const inSet = n => set.indexOf(n || '') >= 0;
    const net = set[0];
    const { ctx } = this;
    const X = x => this.viewW / 2 + x * scale, Y = y => this.viewH / 2 + y * scale;
    ctx.save();
    ctx.strokeStyle = "rgba(241,196,15,0.85)";
    ctx.lineCap = "round";
    for (const t of (this.state.traces || [])) {
      if (!inSet(t.net)) continue;
      ctx.lineWidth = Math.max(2, ((t.width || 0.3) + 0.25) * scale);
      ctx.beginPath(); this.tracePath(ctx, t, scale); ctx.stroke();
    }
    ctx.lineWidth = 2;
    for (const c of (this.state.components || [])) for (const pd of (c.pads || [])) {
      if (pd.cu === false || (pd.net || "") !== net) continue;
      const a = this.padAbs(c, pd);
      const rr = Math.hypot(pd.w || 0.5, pd.h || 0.5) / 2 * scale + 2;
      ctx.beginPath(); ctx.arc(X(a.x), Y(a.y), rr, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  },

  drawTracePreview(scale) {
    this.drawGuides(scale);
    const td = this.state.traceDraw;
    if (!td) return;
    const { ctx } = this;
    const X = x => this.viewW / 2 + x * scale, Y = y => this.viewH / 2 + y * scale;
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
    // 即時淨空：預覽段 vs 走線／pad／via／板邊／禁佈區（見 previewClearance）
    const near = this.previewClearance(td);
    const req = near ? near.req : 0.15;
    if (near && near.d < near.req) {
      over = true;
      label += " │ " + pcbT("pj_draw_near", { what: near.what, d: Math.max(0, near.d).toFixed(2), lim: near.req });
    }

    ctx.save();
    // 淨空光暈：把「這條線＋規則要求的淨空」實際佔多寬畫出來，
    // 使用者才看得出「還差多少」，而不是等按下去之後才被 DRC 罵。
    ctx.lineCap = "round";
    ctx.strokeStyle = over ? "rgba(231,76,60,0.22)" : "rgba(46,204,113,0.16)";
    ctx.lineWidth = Math.max(2, ((this.state.traceWidth || 0.3) + 2 * req) * scale);
    ctx.beginPath(); ctx.moveTo(X(td.x1), Y(td.y1)); ctx.lineTo(X(td.x2), Y(td.y2)); ctx.stroke();
    ctx.lineCap = "butt";
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

  // 游標下是什麼：走線 / pad / via / 元件。順序＝視覺上的疊放順序，
  // 點得到的東西才回報，否則資訊卡講的跟使用者看到的不是同一個東西。
  hoverHitAt(bx, by) {
    const t = this.traceHit(bx, by);
    if (t) return { kind: 'trace', trace: t };
    for (const v of (this.state.vias || [])) {
      if (Math.hypot(bx - v.x, by - v.y) <= (v.od || 0.6) / 2 + 0.05)
        return { kind: 'via', od: v.od, drill: v.id != null ? v.id : v.drill, net: v.net || '' };
    }
    for (const c of (this.state.components || [])) {
      for (const p of (c.pads || [])) {
        const a = this.padAbs(c, p);
        const rw = Math.max(0.2, p.w || 0.5) / 2, rh = Math.max(0.2, p.h || 0.5) / 2;
        if (Math.abs(bx - a.x) <= rw && Math.abs(by - a.y) <= rh)
          return { kind: 'pad', ref: c.ref || c.label || c.id, pin: p.num, net: p.net || '', drill: p.drill || 0 };
      }
    }
    const hit = this.compHit(bx, by);
    if (hit) return { kind: 'comp', ref: hit.ref || hit.label || hit.id, part: hit.part || '', pins: (hit.pads || []).length };
    return null;
  },

  // 資訊卡本體：內容算在 PcbInteract.hoverInfo（node 測得到），這裡只負責貼上去。
  showHoverTip(hit, cx, cy) {
    const el = document.getElementById('pcbHoverTip');
    if (!el) return;
    const rows = window.PcbInteract ? PcbInteract.hoverInfo(hit) : [];
    if (!rows.length) { el.style.display = 'none'; return; }
    const esc = v => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    el.innerHTML = rows.map(r => '<div class="hv-row"><span class="hv-k">' + esc(pcbT(r.label)) +
      '</span><span class="hv-v">' + esc(r.value) + '</span></div>').join('');
    el.style.display = 'block';
    // 貼著右／下邊界時往回收，否則資訊卡自己會被切掉一半
    const r = el.getBoundingClientRect();
    const x = Math.min(cx + 14, window.innerWidth - r.width - 8);
    const y = Math.min(cy + 16, window.innerHeight - r.height - 8);
    el.style.left = Math.max(4, x) + 'px';
    el.style.top = Math.max(4, y) + 'px';
  },

  hideHoverTip() {
    const el = document.getElementById('pcbHoverTip');
    if (el) el.style.display = 'none';
  },

  // 走線中換層：EasyEDA 按數字鍵直接換層並自動落 via。以前要 Esc 退出、改下拉、重畫。
  switchLayerWithVia(layer) {
    const td = this.state.traceDraw;
    if (!td || !layer) return false;
    const cu = (this.state.layerStack || []).filter(l => l.kind === 'copper').map(l => l.id);
    if (cu.indexOf(layer) < 0) return false;
    const cur = this.state.traceLayer || 'F.Cu';
    if (layer === cur) { this.toast(pcbT('pj_layer_same', { layer }), 'info'); return false; }
    const res = this.finishTraceSegment();
    const x = res.committed ? res.x : td.x1, y = res.committed ? res.y : td.y1;
    const net = res.committed ? (res.net || td.net || '') : (td.net || '');
    // 換層處一定要有 via，不然兩層之間是斷的——畫面上看起來卻是連著的。
    // 只看 res.committed 不夠：連續繪製模式下，使用者通常是「畫完一段、在轉角按數字鍵」，
    // 那時待收的那一段長度是 0（committed=false），接點其實在 td.x1/y1。
    // 實測就是這個情況——第一版在這裡完全不落 via，兩層之間靜靜斷掉。
    const joined = (this.state.traces || []).some(t =>
      Math.hypot(t.x1 - x, t.y1 - y) < 0.05 || Math.hypot(t.x2 - x, t.y2 - y) < 0.05);
    const dup = (this.state.vias || []).some(v => Math.hypot(v.x - x, v.y - y) < 0.05);
    // 沒有任何走線接在這裡就不落 via：那會留下一顆浮空的 via，板廠照鑽。
    if (joined && !dup) {
      if (!res.committed) this.hist();
      const ps = window.Padstack ? Padstack.load() : { od: 0.6, drill: 0.3 };
      this.state.vias.push({ x: x, y: y, od: ps.od, id: ps.drill, net: net, auto: true });
      this.state.ratsnest = null;
    }
    this.state.traceLayer = layer;
    const sel = document.getElementById('traceLayer');
    if (sel) sel.value = layer;
    this.state.traceDraw = { x1: x, y1: y, x2: x, y2: y, net: net };
    this.renderPartsList();
    this.render();
    this.toast(pcbT('pj_layer_via', { layer }), 'info');
    return true;
  },

  // DRC 違規標記。畫在最上層（走線與 pad 之上），不然密集區會被蓋掉看不到。
  drawDrcMarks(scale) {
    const marks = this.state.drcMarks || [];
    if (!marks.length) return;
    const { ctx } = this;
    const X = x => this.viewW / 2 + x * scale, Y = y => this.viewH / 2 + y * scale;
    // 半徑不跟著縮放無限縮小：縮到看不見的標記等於沒標
    const r = Math.max(6, Math.min(18, 0.9 * scale));
    ctx.save();
    ctx.lineWidth = 2;
    for (const m of marks) {
      const err = m.type === 'error';
      const x = X(m.x), y = Y(m.y);
      ctx.strokeStyle = err ? '#ff3b30' : '#ff9f0a';
      ctx.fillStyle = err ? 'rgba(255,59,48,0.16)' : 'rgba(255,159,10,0.14)';
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      if (err) {
        const k = r * 0.55;
        ctx.beginPath();
        ctx.moveTo(x - k, y - k); ctx.lineTo(x + k, y + k);
        ctx.moveTo(x + k, y - k); ctx.lineTo(x - k, y + k);
        ctx.stroke();
      }
    }
    ctx.restore();
  },

  drawSilk(scale) {
    const { ctx, state } = this;
    const fVis = state.visibleLayers.includes('F.SilkS'), bVis = state.visibleLayers.includes('B.SilkS');
    if (!fVis && !bVis) return;
    const X = x => this.viewW / 2 + x * scale, Y = y => this.viewH / 2 + y * scale;
    const pal = state.palette || {};
    const colF = pal.silkF || '#f1c40f', colB = pal.silkB || '#b7950b';
    const visOk = side => side === 'B' ? bVis : fVis;
    ctx.save();
    ctx.lineCap = 'round';
    const drawItem = (g, toAbs) => {
      if (!visOk(g.side)) return;
      ctx.strokeStyle = g.side === 'B' ? colB : colF;
      ctx.lineWidth = Math.max(0.6, (g.w || 0.12) * scale);
      ctx.beginPath();
      if (g.kind === 'region') {
        // 圖片轉絲印產生的填充區域：畫實心，不是描邊
        ctx.fillStyle = g.side === 'B' ? colB : colF;
        g.pts.forEach((pt, i) => { const a = toAbs(pt[0], pt[1]); i ? ctx.lineTo(X(a.x), Y(a.y)) : ctx.moveTo(X(a.x), Y(a.y)); });
        ctx.closePath();
        ctx.fill();
        return;
      }
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
    const X = x => this.viewW / 2 + x * scale, Y = y => this.viewH / 2 + y * scale;
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
      // 布林重算過的鋪銅：直接畫算出來的多邊形（含內孔）。
      // 不能同時畫原始外框——那會讓畫面上的銅比實際多，而鋪銅正是
      // 「畫面與實際不一致最危險」的地方（避讓少挖 0.1mm 就是短路）。
      if (z.fillPolys && z.fillPolys.length) {
        ctx.save();
        ctx.fillStyle = col;
        ctx.globalAlpha = 0.45;
        for (const is of z.fillPolys) {
          ctx.beginPath();
          is.outer.forEach((pt, k) => k ? ctx.lineTo(X(pt[0]), Y(pt[1])) : ctx.moveTo(X(pt[0]), Y(pt[1])));
          ctx.closePath();
          for (const h of (is.holes || [])) {
            // 內孔要反向繞，evenodd 才會把它當成洞
            h.slice().reverse().forEach((pt, k) => k ? ctx.lineTo(X(pt[0]), Y(pt[1])) : ctx.moveTo(X(pt[0]), Y(pt[1])));
            ctx.closePath();
          }
          ctx.fill("evenodd");
        }
        ctx.restore();
        continue;
      }
      if (fillMode !== 'disabled') {
        const off = document.createElement('canvas');
        off.width = this.viewW; off.height = this.viewH;
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
          // 孤島也要在畫面上挖掉，否則使用者看到的跟送廠的檔不一樣
          (z.orphanCuts || []).forEach(cut => {
            o.beginPath();
            cut.pts.forEach((pt, i) => { i ? o.lineTo(X(pt[0]), Y(pt[1])) : o.moveTo(X(pt[0]), Y(pt[1])); });
            o.closePath();
            o.fill();
          });
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
    const X = x => this.viewW / 2 + x * scale, Y = y => this.viewH / 2 + y * scale;
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
    if (!window.Sch2Pcb) { this.toast(pcbT('pj_sync_noeng'), 'error'); return; }
    // 線路圖可以有多頁（sheets.js）。`voltsketch-project` 只鏡射「目前這一頁」，
    // 所以舊版同步等於「只把你現在看的那一頁做成板子」——多區塊產品永遠只轉到一塊。
    // 這裡改成把所有頁一起轉進同一片板。
    //
    // 跨頁怎麼連：頁與頁之間沒有導線，只有**同名的網路標籤**能連（GND、VCC、使用者標籤）。
    // 沒有標籤的自動網名一律帶頁號，避免兩頁各自的 N$C1.0 被誤認成同一個網路。
    const eng = window.CircuitEngine;
    let pages = [];
    try {
      const sh = JSON.parse(localStorage.getItem("vs-sheets-v1") || "null");
      if (sh && Array.isArray(sh.pages) && sh.pages.length) {
        pages = sh.pages.map((pg, i) => ({ name: pg.name || ("P" + (i + 1)), data: pg.data || {} }));
      }
    } catch (err) { /* 多頁存檔壞了就退回單頁，不要因此不能同步 */ }
    if (!pages.length) {
      let proj = null;
      try { proj = JSON.parse(localStorage.getItem("voltsketch-project") || "null"); } catch (err) {}
      pages = [{ name: "P1", data: proj || {} }];
    }
    const totalComps = pages.reduce((n, pg) => n + ((pg.data.components || []).filter(c => c && c.type).length), 0);
    if (!totalComps) { this.toast(pcbT("pj_sync_nodata"), "warn"); return; }
    if (this.state.components.length || this.state.traces.length) {
      if (!confirm(pcbT("pj_sync_confirm"))) return;
    }
    this.hist();

    const conv = { components: [], unresolved: [], assumed: [], stats: { bySource: { partslib: 0, ic: 0 } } };
    const allNets = new Set();
    const usedRefs = new Set();
    let yOffset = 0;

    // ---- 階層式圖紙（SchHier）----
    // 有圖紙符號時，多頁不再是「各自獨立、只靠 net 標籤跨頁」，而是一棵樹。
    // 先攤平成一份元件清單 + 一個 netOf()，再走跟平面情況完全同一條 convert()。
    // 沒有階層就完全不進這一段，既有的板子行為一個位元組都不變。
    const hier = window.SchHier;
    const useHier = !!(hier && hier.hasHierarchy(pages));
    if (useHier) {
      const built = hier.build(pages, hier.rootIndex(pages), eng);
      const hardErr = built.findings.filter(f => f.type === 'error');
      if (hardErr.length) {
        // 遞迴、參照不存在的圖紙這類錯誤下展開的結果一定是錯的。
        // 硬轉出一片「看起來像那麼回事」的板子比擋下來糟糕得多。
        this.toast(pcbT('pj_sync_hier_err', { n: hardErr.length, why: hardErr[0].message }), 'error');
        return;
      }
      for (const f of built.findings) this.toast(f.message, 'warn');
      const one = window.Sch2Pcb.convert(built.comps, c => eng.getPins(c), built.netOf, {
        overrides: this.state.fpOverrides || {},
        scale: 0.15,
        spacing: Math.max(1, this.loadDrcRules().compSpacing / 2)
      });
      one.components.forEach(c => { usedRefs.add(c.ref); });
      for (const c of built.comps) for (let i = 0; i < eng.getPins(c).length; i++) {
        const n = built.netOf(c.id, i); if (n) allNets.add(n);
      }
      conv.components.push(...one.components);
      conv.unresolved.push(...one.unresolved);
      conv.assumed.push(...one.assumed);
      conv.stats.bySource.partslib += (one.stats && one.stats.bySource && one.stats.bySource.partslib) || 0;
      conv.stats.bySource.ic += (one.stats && one.stats.bySource && one.stats.bySource.ic) || 0;
    }

    if (!useHier) pages.forEach((pg, pi) => {
      const sComps = (pg.data.components || []).filter(c => c && c.type);
      if (!sComps.length) return;
      const nets = eng.computeNets(sComps, pg.data.wires || []);
      const byId = {}; sComps.forEach(c => { byId[c.id] = c; });
      // net 命名：含 ground → GND；含 source/battery + 腳 → VCC；其餘照腳位命名
      const rootName = new Map();
      for (let i = 0; i < nets.pts.length; i++) {
        const pt = nets.pts[i];
        if (pt.kind !== "pin") continue;
        const r = nets.find(i);
        const c = byId[pt.key.split(":")[0]];
        if (!c) continue;
        if (/ground/i.test(c.type)) rootName.set(r, "GND");
        else if (/source|battery|vcc|vdd/i.test(c.type) && !rootName.has(r)) rootName.set(r, "VCC");
      }
      // 自動網名要「同一組連線永遠得到同一個名字」。舊版用流水號 N$1、N$2…，
      // 順序一變（加一顆元件）名字就全部位移，板上既有走線的 net 會突然變成不存在的網路。
      const rootMembers = new Map();
      for (const key of nets.connectedPins) {
        const r = nets.pinNet.get(key);
        if (!rootMembers.has(r)) rootMembers.set(r, []);
        rootMembers.get(r).push(key);
      }
      const tag = pages.length > 1 ? ("P" + (pi + 1) + ".") : "";
      const autoName = r => {
        const mem = (rootMembers.get(r) || []).slice().sort();
        if (!mem.length) return "N$?";
        const [schId, pin] = mem[0].split(":");
        const c = byId[schId];
        const ref = (c && (c.label || c.ref)) || schId;
        return "N$" + tag + ref + "." + pin;
      };
      const netOf = (schId, pinIndex) => {
        const key = schId + ":" + pinIndex;
        if (!nets.connectedPins.has(key)) return "";
        // 使用者給的網路標籤是跨頁連接的唯一途徑，優先採用（不加頁號）
        const labelled = nets.nameOfPin ? nets.nameOfPin(key) : "";
        if (labelled) { allNets.add(labelled); return labelled; }
        const r = nets.pinNet.get(key);
        if (!rootName.has(r)) rootName.set(r, autoName(r));
        const nm = rootName.get(r);
        allNets.add(nm);
        return nm;
      };

      // 封裝來自 PartsLib / FootprintGen，不再拿線路圖符號的腳位座標當 footprint。
      // 對不出來的不編一個假的塞進去，列出來讓使用者處理。
      const one = window.Sch2Pcb.convert(sComps, c => eng.getPins(c), netOf, {
        overrides: this.state.fpOverrides || {},
        scale: 0.15,
        spacing: Math.max(1, this.loadDrcRules().compSpacing / 2)
      });
      // 第二頁之後：id 帶頁號（避免兩頁的 r1 撞在一起），refdes 撞名時也加頁號。
      // 第一頁維持 `sch-<id>`，才不會讓既有板子的元件全部被當成「新增」而失去擺位。
      let maxY = 0;
      one.components.forEach(c => {
        if (pi > 0 && typeof c.id === "string" && c.id.indexOf("sch-") === 0) {
          c.id = "sch-p" + (pi + 1) + "-" + c.id.slice(4);
        }
        if (usedRefs.has(c.ref)) c.ref = c.ref + "-P" + (pi + 1);
        usedRefs.add(c.ref);
        c.y += yOffset;
        maxY = Math.max(maxY, Math.abs(c.y) + (c.h || 2) / 2);
      });
      yOffset = maxY + 5;   // 下一頁排到這一頁下面，不要疊在一起
      conv.components.push(...one.components);
      conv.unresolved.push(...one.unresolved);
      conv.assumed.push(...one.assumed);
      conv.stats.bySource.partslib += (one.stats && one.stats.bySource && one.stats.bySource.partslib) || 0;
      conv.stats.bySource.ic += (one.stats && one.stats.bySource && one.stats.bySource.ic) || 0;
    });
    const rootName = new Map(allNets ? [...allNets].map(n => [n, n]) : []);   // 給下方統計網路數用

    const s2 = this.state;
    // 增量更新（ECO）：對得起來的元件保留擺位、走線與鋪銅一律不動。
    // 舊版是「重新產生一片板」，線路圖改一顆電阻佈局就從頭來過，
    // 等於逼使用者永遠不要改線路圖——線路圖與 Layout 就永遠合不起來。
    const hadLayout = (s2.components || []).some(c => (c.pads || []).length) || (s2.traces || []).length > 0;
    const eco = window.Sch2Pcb.merge(s2.components, conv.components);
    s2.components = eco.components;
    s2.schUnresolved = conv.unresolved;
    s2.schAssumed = conv.assumed;
    s2.selected = null; s2.selectedSet = [];
    s2.ratsnest = null; s2.showRatsnest = true;
    // 匯流排：轉過來之後就只剩一條條 net，這份清單是板子唯一還知道成組關係的地方
    s2.busGroups = window.Sch2Pcb.busGroupsFrom(pages) || [];
    // net class 從線路圖帶過來（明講的優先；沒指定的仍照名字猜）。
    // 衝突不猜：同一條 net 兩段導線指定成不同 class 時報出來，讓使用者決定。
    if (window.Sch2Pcb.netClassesFrom) {
      const nc = window.Sch2Pcb.netClassesFrom(pages);
      s2.netClasses = nc.classes || {};
      if ((nc.conflicts || []).length) {
        const c0 = nc.conflicts[0];
        this.toast(pcbT('pj_netclass_conflict', { n: nc.conflicts.length, net: c0.net, a: c0.a, b: c0.b }), 'warn');
      }
    }

    let bd = { w: s2.boardWidth, h: s2.boardHeight };
    if (!hadLayout) {
      // 空板：第一次轉換，照舊整片重來並把板框調到剛好
      s2.traces = []; s2.vias = []; s2.zones = []; s2.zoneFills = []; s2.userZones = [];
      s2.kicad = null; s2.kicadArcs = []; s2.edgeSegs = []; s2.silkGr = []; s2.teardrops = [];
      s2.refBoard = null; s2.refOverlayId = null;
      bd = window.Sch2Pcb.suggestBoard(conv.components, 5);
      s2.boardWidth = bd.w; s2.boardHeight = bd.h;
      const wI0 = document.getElementById("boardWidth"), hI0 = document.getElementById("boardHeight");
      if (wI0) wI0.value = bd.w; if (hI0) hI0.value = bd.h;
    }
    // 線路圖刪掉的電路會留下接不到任何 pad 的孤兒走線。不自動刪（那是使用者的銅），但要報。
    const orphans = window.Sch2Pcb.orphanTraces(s2.traces, s2.components);
    const tgl = document.getElementById('ratsnestToggle');
    if (tgl) tgl.checked = true;
    this.syncSelPanel();
    this.renderPartsList();
    this.populateEmiSelects();
    this.renderBusPanel();
    this.render();

    const netN = new Set([...rootName.values()]).size;
    let msg = pcbT('pj_sync_done2', {
      c: conv.components.length, n: netN,
      lib: conv.stats.bySource.partslib, ic: conv.stats.bySource.ic,
      w: bd.w, h: bd.h
    });
    if (conv.assumed.length) {
      const who = conv.assumed.slice(0, 6).map(a => (a.label || a.type) + '→' + a.variant).join(', ');
      msg += ' │ ' + pcbT('pj_sync_assumed', { n: conv.assumed.length, who });
    }
    if (conv.unresolved.length) {
      const why = [...new Set(conv.unresolved.map(u => u.reason))].join(', ');
      const who = conv.unresolved.slice(0, 6).map(u => u.label || u.type).join(', ');
      msg += ' │ ' + pcbT('pj_sync_unres', { n: conv.unresolved.length, who, why });
    }
    if (hadLayout) {
      msg += " │ " + pcbT("pj_sync_eco", { kept: eco.kept, added: eco.added, removed: eco.removed });
      if (eco.netChanged) msg += " │ " + pcbT("pj_sync_netchg", { n: eco.netChanged });
      if (orphans.length) msg += " │ " + pcbT("pj_sync_orphan", { n: orphans.length });
    }
    this.toast(msg, (conv.unresolved.length || conv.assumed.length || orphans.length) ? "warn" : "info");
    const box = document.getElementById('netlistContent');
    if (box) {
      box.innerHTML = '<div style="font-size:12px;white-space:pre-wrap">' +
        msg.replace(/[&<>]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch])) + '</div>';
    }
  },

  // 自動佈線：把目前所有飛線逐條丟給 A*（單層試驗，無推擠、不插 via）
  // 可繞線的銅層：訊號層與混合層。GND／PWR 是整片平面，訊號不該從那裡穿過去。
  routableLayers() {
    const cu = (this.state.layerStack || []).filter(l => l.kind === 'copper');
    const sig = cu.filter(l => l.type === 'Signal' || l.type === 'Mixed').map(l => l.id);
    return sig.length ? sig : cu.slice(0, 1).map(l => l.id);
  },

  // 差分對優先：先成對繞，剩下的才交給 RouteAll 一條一條繞。
  // 順序不能反過來——差分對要一條夠寬的走廊，等單線把空間切碎就再也塞不進去。
  // 繞好的走線直接寫進 state，所以後面的單線繞線會把它們當成障礙，不會壓上去。
  autoRoutePairs(lines, opts) {
    const out = { pairs: 0, failed: 0, skew: 0, rest: lines };
    if (!(window.AutoRoute && AutoRoute.routePair)) return out;
    const used = new Set();
    const rest = [];
    for (let i = 0; i < lines.length; i++) {
      if (used.has(i)) continue;
      const a = lines[i];
      const partner = this.pairNetOf(a.net);
      if (!partner) { rest.push(a); continue; }
      // 同 net 可能有好幾段飛線；要配的是「兩端都在附近」的那一段，不是隨便一段
      let j = -1, bestD = Infinity;
      for (let k = i + 1; k < lines.length; k++) {
        if (used.has(k) || lines[k].net !== partner) continue;
        const b = lines[k];
        const d = Math.min(
          Math.hypot(a.x1 - b.x1, a.y1 - b.y1) + Math.hypot(a.x2 - b.x2, a.y2 - b.y2),
          Math.hypot(a.x1 - b.x2, a.y1 - b.y2) + Math.hypot(a.x2 - b.x1, a.y2 - b.y1));
        if (d < bestD) { bestD = d; j = k; }
      }
      if (j < 0 || bestD > 10) { rest.push(a); continue; }
      const r = AutoRoute.routePair(this.state, this.padAbs.bind(this), a, lines[j],
        // drcRules 一起傳：展開後的檢查要用**跟 DRC 同一份規則**，不是繞線器自己的淨空值
        Object.assign({}, opts, { pairGap: this.diffGapOf(a.net), drcRules: this.loadDrcRules() }));
      used.add(j);
      if (!r.ok) { out.failed++; rest.push(a, lines[j]); continue; }
      const stamp = Date.now();
      [r.a, r.b].forEach((side, si) => {
        side.segs.forEach((sg, k) => this.state.traces.push({
          id: 'trace-' + stamp + '-dp' + i + '-' + si + '-' + k,
          x1: sg.x1, y1: sg.y1, x2: sg.x2, y2: sg.y2,
          width: opts.width, layer: sg.layer || opts.layer || 'F.Cu', net: side.net
        }));
        (side.vias || []).forEach((v, k) => this.state.vias.push({
          id: 'via-' + stamp + '-dp' + i + '-' + si + '-' + k,
          x: v.x, y: v.y, od: v.od, drill: v.drill, net: side.net, auto: true
        }));
      });
      out.pairs++;
      out.skew = Math.max(out.skew, r.skew);
      used.add(i);
    }
    out.rest = rest;
    return out;
  },

  autoRoute() {
    if (!window.Ratsnest || !window.AutoRoute || !window.RouteAll) return;
    const lines = window.Ratsnest.compute(this.state, this.padAbs.bind(this));
    if (!lines.length) { this.toast(pcbT('pj_ar_none'), 'info'); return; }
    this.hist();
    // 用使用者當下的 DRC 規則繞線。舊版這裡硬寫 clearance 0.15，
    // 使用者把淨空調大後自動繞線仍照 0.15 走，繞完直接違規而且不會報。
    const rules = this.loadDrcRules();
    const ps = window.Padstack ? window.Padstack.load() : { od: 0.7, drill: 0.3 };
    const opts = {
      layers: this.routableLayers(),
      layer: this.state.traceLayer || 'F.Cu',
      width: this.state.traceWidth || 0.25,
      clearance: rules.clearance,
      viaOd: ps.od, viaDrill: ps.drill,
      grid: 0.25,
      // 盲埋孔：使用者明確打開才用。繞線器早就支援，但以前沒有任何呼叫端傳這個值——
      // 功能藏起來等於沒有做（硬規矩 16）。
      blindBuried: !!this.state.blindBuried
    };
    // 差分對先成對繞（走廊要夠寬，等單線切碎空間就進不去了），剩下的才單條繞
    const dp = this.autoRoutePairs(lines, opts);
    const r = window.RouteAll.run(this.state, this.padAbs.bind(this), dp.rest,
      Object.assign({ order: 'short', ripup: true, passes: 3, budgetMs: 8000 }, opts));

    r.routed.forEach((x, i) => {
      x.segs.forEach((sg, k) => this.state.traces.push({
        id: `trace-${Date.now()}-${i}-${k}`,
        x1: sg.x1, y1: sg.y1, x2: sg.x2, y2: sg.y2,
        width: this.state.traceWidth || 0.25,
        layer: sg.layer || this.state.traceLayer || 'F.Cu', net: x.line.net
      }));
      (x.vias || []).forEach((v, k) => this.state.vias.push({
        id: `via-${Date.now()}-${i}-${k}`,
        x: v.x, y: v.y, od: v.od, id: v.drill, net: x.line.net, auto: true
      }));
    });

    this.state.ratsnest = null;
    this.renderNetPanel();
    this.renderPartsList();
    this.render();

    // 失敗要講得出「為什麼」與「怎麼改」。只報數字使用者無從下手。
    let msg = pcbT('pj_ar_done', {
      ok: r.routed.length, fail: r.failed.length, ms: r.ms,
      cap: r.ripped ? pcbT('pj_ar_ripped', { n: r.ripped }) : ''
    });
    if (r.failed.length) {
      const parts = Object.keys(r.reasons).map(k => pcbT('pj_ar_why_' + k, { n: r.reasons[k] }));
      msg += ' │ ' + parts.join('、');
      if (r.widthHint > 0) msg += ' │ ' + pcbT('pj_ar_width_hint', { w: r.widthHint });
    }
    if (dp.pairs) msg += ' │ ' + pcbT('pj_ar_pairs', { n: dp.pairs, skew: dp.skew.toFixed(2) });
    if (dp.failed) msg += ' │ ' + pcbT('pj_ar_pairs_fail', { n: dp.failed });
    this.toast(msg, r.failed.length ? 'warn' : 'info');
  },

  // 阻抗計算（IPC-2141 近似式；±10% 等級，正式設計用場型解算器）
  // 公式本體搬到 NetModel：net 的目標阻抗稽核也要算同一件事，
  // 兩份實作遲早會分岔（鑽孔表已經教過一次）。這裡只留轉呼叫。
  calcImpedance(kind, w, h, t, er, s) {
    if (!window.NetModel) return null;
    return window.NetModel.impedance(kind, w, h, t, er, s);
  },

  runImpedance() {
    const v = id => parseFloat(document.getElementById(id)?.value);
    const kind = document.getElementById('impKind')?.value;
    const r = this.calcImpedance(kind, v('impW'), v('impH'), v('impT'), v('impEr'), v('impS'));
    const out = document.getElementById('impOut');
    if (!out) return;
    if (!r) { out.textContent = pcbT('pj_imp_bad'); return; }
    // 誤差帶要講出來：IPC-2141 是近似式，只給單一數字會讓使用者以為可以直接下單。
    const band = z => `${(z * 0.9).toFixed(1)}–${(z * 1.1).toFixed(1)}`;
    out.textContent = `Z0 ≈ ${r.z0.toFixed(1)} Ω (${band(r.z0)})`
      + (r.zdiff ? `；Zdiff ≈ ${r.zdiff.toFixed(1)} Ω (${band(r.zdiff)})` : '')
      + ` │ ${pcbT('pj_imp_tol')}`;
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
      // 匯流排面板的欄位標籤是 render 時才翻的，不重畫就會停在切換前的語言——
      // DRC 訊息換了語言、旁邊的規則欄位還是中文，看起來像漏翻。
      this.renderBusPanel();
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
    this.initContextMenu();
    this.renderBusPanel();
    document.getElementById('busRows')?.addEventListener('click', (e) => {
      const row = e.target.closest ? e.target.closest('.bus-row') : null;
      if (row) this.toggleBusHighlight(row.getAttribute('data-bus'));
    });
    document.getElementById('busTuneBtn')?.addEventListener('click', () => {
      const spec = this.state.highlightBus;
      if (!spec) { this.toast(pcbT('pj_bus_pick'), 'warn'); return; }
      this.tuneBus(spec);
    });
    document.getElementById('busRouteBtn')?.addEventListener('click', () => {
      const spec = this.state.highlightBus;
      if (!spec) { this.toast(pcbT('pj_bus_pick'), 'warn'); return; }
      this.routeBus(spec);
    });
    // 規則欄位是每次重畫都換掉的節點，所以聽在不會被換掉的容器上（委派）。
    // 直接綁在 input 上的話，改一次規則之後那些參照就變孤兒節點，第二次改沒有反應。
    document.getElementById('busRuleBox')?.addEventListener('change', (e) => {
      const el = e.target;
      if (!el || !el.dataset || !el.dataset.k) return;
      const spec = this.state.highlightBus;
      if (!spec) return;
      if (el.type === 'checkbox') this.setBusRule(spec, el.dataset.k, el.checked);
      else this.setBusRule(spec, el.dataset.k, parseFloat(el.value));
    });
    this.renderShortcutHelp();
    window.addEventListener('vs-lang-change', () => this.renderShortcutHelp());
    document.getElementById('tsWidth')?.addEventListener('change', (e) => {
      const t = this.state.selectedTrace, v = parseFloat(e.target.value);
      if (!t || !(v > 0)) return;
      this.hist(); t.width = v; this.render();
      this.toast(pcbT('pj_ts_applied', { what: v + ' mm' }), 'info');
    });
    document.getElementById('tsLayer')?.addEventListener('change', (e) => {
      const t = this.state.selectedTrace;
      if (!t) return;
      this.hist(); t.layer = e.target.value; this.state.ratsnest = null; this.render();
      this.toast(pcbT('pj_ts_applied', { what: t.layer }), 'info');
    });
    document.getElementById('tsDelete')?.addEventListener('click', () => this.deleteSelectedTrace());
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
    document.getElementById('blindBuriedToggle')?.addEventListener('change', (e) => {
      this.state.blindBuried = !!e.target.checked;
      // 打開就當場講清楚代價：板廠檢查會擋，不要等匯出才發現
      if (this.state.blindBuried) this.toast(pcbT('pj_bb_on'), 'warn');
    });
    document.getElementById('autoRouteBtn')?.addEventListener('click', () => this.autoRoute());

    // netlist 同步（線路圖 → PCB）
    document.getElementById('syncNetlistBtn')?.addEventListener('click', () => this.syncFromSchematic());
    document.getElementById("selFpApply")?.addEventListener("click", () => this.applySelFootprint());
    document.getElementById("netRefresh")?.addEventListener("click", () => this.renderNetPanel());
    document.getElementById("netOnlyOpen")?.addEventListener("change", () => this.renderNetPanel());
    document.getElementById("netRows")?.addEventListener("click", (e) => {
      const row = e.target.closest ? e.target.closest(".net-row") : null;
      if (!row) return;
      const net = row.getAttribute("data-net");
      // 改名鈕不可以同時觸發高亮切換，否則按一下改名畫面會跟著閃
      const btn = e.target.closest ? e.target.closest("button[data-act='rename']") : null;
      if (btn) { e.stopPropagation(); this.renameNetName(net); return; }
      // 再點一次取消高亮：不做這件事的話高亮會黏在畫面上拿不掉
      this.state.highlightNet = (this.state.highlightNet === net) ? null : net;
      this.renderNetPanel();
      this.render();
    });
    document.getElementById("selRenameBtn")?.addEventListener("click", () => this.renameSelRef());
    document.getElementById("selHierPick")?.addEventListener("click", () => this.selectSameSheet());
    document.getElementById("selSwapBtn")?.addEventListener("click", () => this.swapSelPins());
    document.getElementById("selSwapGateBtn")?.addEventListener("click", () => this.swapSelGates());

    // net 屬性（NetModel）
    document.getElementById("npApply")?.addEventListener("click", () => this.applyNetProps());
    document.getElementById("npClear")?.addEventListener("click", () => this.clearNetProps());
    document.getElementById("npGc")?.addEventListener("click", () => this.gcNetProps());

    // 封裝與庫同步（FpInst）
    document.getElementById("fpSyncScan")?.addEventListener("click", () => this.renderFpSync());
    document.getElementById("fpSyncAll")?.addEventListener("click", () => this.syncFpAll());
    document.getElementById("fpSyncRows")?.addEventListener("click", (e) => {
      const btn = e.target.closest ? e.target.closest("button[data-act='fpsync']") : null;
      if (!btn) return;
      const row = e.target.closest(".fp-row");
      if (row) this.syncFpOne(row.getAttribute("data-id"));
    });

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
    document.querySelector('#exportOdbBtn')?.addEventListener('click', () => this.exportOdb());
    document.querySelector('#exportIpcBtn')?.addEventListener('click', () => this.exportIpc());
    document.querySelector('#exportAsmBtn')?.addEventListener('click', () => this.exportAsm());

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
        // 1b) 點在**已選取**的走線身上（不是端點）→ 拖整段。
        //     限定已選取是刻意的：不然在密集的板子上想框選會一直誤拖到線。
        if (!this.compHit(b.x, b.y) && window.TraceDrag) {
          const th = this.traceHit(b.x, b.y);
          if (th && th === this.state.selectedTrace) {
            const pl = TraceDrag.plan(this.state, this.padAbs.bind(this), th);
            if (pl.ok) {
              this.hist();
              this.state.dragTrace = { trace: th, plan: pl, sx: b.x, sy: b.y, lx: b.x, ly: b.y };
              this.canvas.style.cursor = 'move';
              this.render();
              return;
            }
          }
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
          // 點在 pad 上才換高亮；點元件本體不動它，否則想比對兩條網路時會一直被洗掉
          const padSnap = this.snapTarget(b.x, b.y);
          if (padSnap && padSnap.net && padSnap.d <= 0.6) {
            this.state.highlightNet = padSnap.net;
            this.renderNetPanel();
          }
          // 抓到多選集內成員 → 群組拖曳；否則單選
          if (this.state.selectedSet.includes(hit) && this.state.selectedSet.length > 1) {
            this.state.dragGroup = this.state.selectedSet.map(c => ({ c, ox: c.x, oy: c.y }));
            this.state.dragAnchor = { x: b.x, y: b.y };
            this.beginRubber(this.state.selectedSet);
          } else {
            this.state.selectedSet = [hit];
            this.state.dragComp = hit;
            this.state.dragOff = { x: hit.x - b.x, y: hit.y - b.y };
            this.beginRubber([hit]);
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
            // 點到哪條就把整個網路亮起來。以前只有右側 net 清單點得到，
            // 使用者在畫布上點了半天，不知道這條線屬於哪個網路。
            this.state.highlightNet = tHit.net || null;
            this.renderNetPanel();
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
          if (this.state.selected || this.state.selectedTrace || this.state.selectedSet.length || this.state.highlightNet) {
            this.state.selected = null;
            this.state.selectedTrace = null;
            this.state.selectedSet = [];
            this.state.highlightNet = null;
            this.renderNetPanel();
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
        // 鏈條進行中：這一下按是「這一段畫到這裡，接著畫下一段」，不是重開一條。
        // 走的是同一個 finishTraceSegment，所以推擠與規則檢查不會有一條路漏掉。
        if (this.state.traceDraw) {
          const res = this.finishTraceSegment();
          if (this.continueTraceChain(res)) { this.render(); return; }
          if (res.committed) { this.render(); return; }
        }
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
        this.hideHoverTip();
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
      if (this.state.dragTrace) {
        const dt = this.state.dragTrace;
        const b = this.screenToBoard(e);
        const g = this.gridStep();
        // 位移先吸格點，再看有沒有對齊目標。順序反過來的話格點吸附會把對齊吸掉。
        let nx = this.snap(b.x, g), ny = this.snap(b.y, g);
        const wantDx = nx - dt.sx, wantDy = ny - dt.sy;
        const probe = { x: dt.trace.x1 + (wantDx - (dt.lx - dt.sx)), y: dt.trace.y1 + (wantDy - (dt.ly - dt.sy)) };
        const gs = (window.TraceDrag && this.guidesEnabled())
          ? TraceDrag.guides(this.state, this.padAbs.bind(this), probe, { skip: dt.trace }) : [];
        this.state.guides = gs;
        if (gs.length) {
          const sn = TraceDrag.snapToGuides(probe, gs);
          nx += sn.x - probe.x; ny += sn.y - probe.y;
        }
        const dx = nx - dt.lx, dy = ny - dt.ly;
        if (dx || dy) {
          TraceDrag.apply(this.state, dt.plan, dx, dy);
          // 補線只在第一次位移時建立；之後那條線已經在 traces 裡，
          // 再 apply 一次會每動一次就多一條。改成之後只移動、不再補。
          dt.plan = Object.assign({}, dt.plan, { stubs: [] });
          dt.lx = nx; dt.ly = ny;
          this.state.ratsnest = null;
        }
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
        this.updateRubber();
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
        this.updateRubber();
        this.syncSelPanel();
        this.render();
      } else if (this.state.isPanning) {
        const pos = this.getMousePos(e);
        this.state.panX += pos.x - this.state.lastMouse.x;
        this.state.panY += pos.y - this.state.lastMouse.y;
        this.state.lastMouse = pos;
        this.render();
      } else if (this.state.tool === 'select') {
        // 閒置（沒在拖也沒在畫）才顯示 hover 資訊卡。
        // 拖曳中還跳卡片會擋住正在對齊的位置，那比沒有資訊更煩。
        const b = this.screenToBoard(e);
        const hit = this.hoverHitAt(b.x, b.y);
        if (hit) this.showHoverTip(hit, e.clientX, e.clientY); else this.hideHoverTip();
      } else {
        this.hideHoverTip();
      }
    });

    // 滑鼠離開畫布一定要收起來，不然卡片會留在畫面上
    this.canvas?.addEventListener('mouseleave', () => this.hideHoverTip());

    this.canvas?.addEventListener('mouseup', (e) => {
      // 走線端點拖曳收尾：靠近 pad/via/走線端點就吸附＋接該 net
      if (this.state.dragTrace) {
        const dt = this.state.dragTrace;
        this.state.dragTrace = null;
        this.state.guides = [];
        this.canvas.style.cursor = 'crosshair';
        this.state.ratsnest = null;
        this.checkTraceRules(dt.trace);
        this.render();
        return;
      }
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
        this.state.rubber = null;
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
        this.continueTraceChain(this.finishTraceSegment());
        this.render();
        return;
      }
      if (this.state.dragComp) {
        this.state.rubber = null;
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
      } else if (/^[1-9]$/.test(e.key) && this.state.traceDraw && window.PcbInteract) {
        // 走線中的數字鍵＝換層（跟 EasyEDA 一樣）。沒在走線時數字鍵不攔，
        // 否則在輸入框打字會被吃掉。
        const cu = (this.state.layerStack || []).filter(l => l.kind === 'copper').map(l => l.id);
        const layer = PcbInteract.layerForKey(e.key, cu);
        if (layer) { e.preventDefault(); this.switchLayerWithVia(layer); }
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
        } else if (this.state.dragTrace) {
          // 拖到一半按 Esc：整段拖曳有可能已經補了線、動了鄰居，
          // 只把 dragTrace 清掉會留下半套結果。走 undo 才乾淨。
          this.state.dragTrace = null;
          this.state.guides = [];
          if (window.PcbHistory) PcbHistory.undo(this);
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
    // 頂列 新建/儲存/匯出：與側欄按鈕共用同一套邏輯，不另開一套
    document.getElementById('newPcb')?.addEventListener('click', () => this.newBoard());
    document.getElementById('savePcb')?.addEventListener('click', () => { if (window.PcbHistory) PcbHistory.exportBoard(this); });
    document.getElementById('exportPcb')?.addEventListener('click', () => this.revealExportPanel());
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
        const x = (pos.x - this.viewW / 2 - this.state.panX) / scale;
        const y = (pos.y - this.viewH / 2 - this.state.panY) / scale;
        this.addComponent('pad', x, y);
      }
    });

    this.canvas?.addEventListener('wheel', (e) => {
      e.preventDefault();
      // 以游標為錨：放大時盯著的那顆 pad 會留在原地，而不是滑出畫面
      const p = this.getMousePos(e);
      // 觸控板的 deltaY 是連續值，用它算倍率才不會一格一格跳
      const step = Math.min(0.25, Math.abs(e.deltaY) / 500) || 0.12;
      this.zoomAt(e.deltaY < 0 ? 1 + step : 1 / (1 + step), p.x, p.y);
    }, { passive: false });

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

  // ---- 網路清單 / 未接線 ----
  // 「還有幾條沒接」是佈線時最常問的問題。原本只能看畫面上的飛線用眼睛數，
  // 而且飛線一多就看不出哪一條屬於哪個網路。這裡把它列成表：每個 net 幾顆 pad、
  // 幾段走線、總長多少、還有幾段沒接起來，點一下就在板上高亮。
  //
  // 資料一律現算，不存快取：net 是 pad 與走線上的欄位，任何編輯都可能改到它，
  // 存了就會有「面板說 3 條沒接、畫面上明明接完了」這種不一致。
  netSummary() {
    const rows = new Map();
    const get = net => {
      if (!rows.has(net)) rows.set(net, { net, pads: 0, traces: 0, len: 0, open: 0 });
      return rows.get(net);
    };
    for (const c of (this.state.components || [])) for (const pd of (c.pads || [])) {
      if (pd.cu === false || !pd.net) continue;
      get(pd.net).pads++;
    }
    for (const t of (this.state.traces || [])) {
      if (!t.net) continue;
      const r = get(t.net);
      r.traces++;
      r.len += Math.hypot(t.x2 - t.x1, t.y2 - t.y1);
    }
    // 未接線＝飛線（Ratsnest 算的是同 net 之間還沒連通的部分）
    let openTotal = 0;
    if (window.Ratsnest) {
      for (const l of window.Ratsnest.compute(this.state, this.padAbs.bind(this))) {
        if (!l.net) continue;
        get(l.net).open++;
        openTotal++;
      }
    }
    const list = [...rows.values()].sort((a, b) => (b.open - a.open) || a.net.localeCompare(b.net));
    return { list, openTotal, netCount: list.length };
  },

  renderNetPanel() {
    const box = document.getElementById("netRows");
    const sum = document.getElementById("netSummary");
    if (!box) return;
    const s = this.netSummary();
    const onlyOpen = !!(document.getElementById("netOnlyOpen") || {}).checked;
    if (sum) sum.textContent = pcbT("pj_net_summary", { nets: s.netCount, open: s.openTotal });
    const rows = onlyOpen ? s.list.filter(r => r.open > 0) : s.list;
    if (!rows.length) { box.innerHTML = "<p style='color:var(--muted)'>" + pcbT("pj_net_none") + "</p>"; return; }
    const esc = t => String(t).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[ch]));
    // 有設目標阻抗／差分對的 net 要一眼看得出來，否則屬性設了跟沒設一樣
    const NM = window.NetModel;
    const all = NM ? NM.names(this.state) : [];
    box.innerHTML = rows.map(r => {
      const on = this.state.highlightNet === r.net;
      const p = NM ? NM.get(this.state, r.net, all) : null;
      let tag = "";
      if (p && p.z0) tag += "<span title='Z0' style='color:var(--accent-strong)'>" + p.z0 + "Ω</span> ";
      if (p && p.zdiff) tag += "<span title='Zdiff' style='color:var(--accent-strong)'>Δ" + p.zdiff + "Ω</span> ";
      if (p && p.pair) tag += "<span title='" + esc(p.pair) + "' style='color:" + (p.pairSource === 'explicit' ? "var(--accent-strong)" : "var(--muted)") + "'>⇄</span>";
      return "<div class='net-row' data-net='" + esc(r.net) + "' style='display:grid;grid-template-columns:1fr auto auto auto auto;gap:6px;padding:4px 6px;cursor:pointer;border-bottom:1px solid var(--line);" +
        (on ? "background:rgba(46,204,113,.15)" : "") + "'>" +
        "<span>" + esc(r.net) + "</span>" +
        "<span style='font-size:11px'>" + tag + "</span>" +
        "<span style='color:var(--muted)'>" + r.pads + "p / " + r.traces + "s / " + r.len.toFixed(1) + "mm</span>" +
        "<span style='color:" + (r.open ? "#e67e22" : "var(--muted)") + "'>" + (r.open ? "✗" + r.open : "✓") + "</span>" +
        "<button class='small-button' data-act='rename' title='" + esc(pcbT('pj_net_rename')) + "' style='padding:0 6px'>✎</button>" +
        "</div>";
    }).join("");
    this.renderNetProps();
    // 封裝同步狀態掛在這裡一起更新：它跟 net 面板一樣是「換一批元件就會變」的東西，
    // 只在 init 與按鈕更新的話，載入公版／開雲端專案之後面板會停在上一片板的數字。
    this.renderFpSync();
  },

  // ---- 走線收筆 + 連續多段繪製 ----
  //
  // 收筆本來寫在 mouseup 裡。抽出來的理由：連續繪製要在**兩個地方**收筆
  // （放開滑鼠、以及畫下一段時的按下），兩份收筆遲早會分岔——
  // 其中一條路忘了跑推擠或忘了 checkTraceRules，症狀是「有時候會檢查有時候不會」。
  //
  // 回 { committed, terminal }。terminal＝這一段收在 pad/via 上，鏈條到此為止。
  finishTraceSegment() {
    const td = this.state.traceDraw;
    this.state.traceDraw = null;
    if (!td) return { committed: false, terminal: true };
    if (Math.hypot(td.x2 - td.x1, td.y2 - td.y1) < 0.05) return { committed: false, terminal: true };

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
    // 推擠：擋路的鄰居往旁邊挪，而不是留下一個違規讓使用者自己收拾。
    // 推不動就照實說（保留原本的規則警告），不要假裝成功——
    // 使用者看到「已推開」卻其實沒推，比看到「推不動」危險得多。
    if (this.shoveEnabled() && window.Shove) {
      const opt = { clearance: this.loadDrcRules().clearance };
      // 連鎖開著就走 planChain（A 推 B、B 再推 C）。單輪碰到「B 挪開會撞到 C」
      // 就整個放棄，而那正是密集板上最常見的情況。
      const depth = this.shoveDepth();
      let plan = (depth > 1 && Shove.planChain)
        ? Shove.planChain(this.state, this.padAbs.bind(this), tr, Object.assign({ depth }, opt))
        : Shove.plan(this.state, this.padAbs.bind(this), tr, opt);
      // 平移與繞路都只在同一層動手腳，所以**同層橫穿**永遠無解——那要換層打 via。
      // 推不動就把擋路的那幾條丟回繞線器重繞（結果要通過真 DRC 才算數）。
      if (!plan.ok && plan.blockers && Shove.planRipup) {
        const rp = Shove.planRipup(this.state, this.padAbs.bind(this), tr,
          opt.clearance, Object.assign({ drcRules: this.loadDrcRules() }, opt));
        if (rp.ok) plan = rp;
      }
      if (plan.blockers) {
        if (plan.ok) {
          const rerouted = (plan.reroutes || []).length;
          const n = Shove.apply(this.state, plan);
          // 「推開」與「繞開」是兩件事：推開的線位置變了、形狀沒變；
          // 繞開的線多了兩個彎。訊息混在一起的話，使用者不知道板子上多了什麼。
          if (plan.ripup) this.toast(pcbT("pj_shove_ripup", { n: rerouted }), "info");
          else if (rerouted) this.toast(pcbT("pj_shove_detour", { n: rerouted }), "info");
          else if (n) this.toast(pcbT(plan.rounds > 1 ? "pj_shove_done_chain" : "pj_shove_done", { n, r: plan.rounds }), "info");
        } else {
          // 理由可能帶 chain: 前綴，取最後一段當 i18n key 的字尾；
          // 找不到對應翻譯時 pcbT 會回 key 本身，至少看得出是哪一種失敗。
          const why = String(plan.reason).replace(/^chain:/, "").split(":")[0];
          this.toast(pcbT("pj_shove_fail", { n: plan.blockers, why: pcbT("pj_shove_why_" + why) }), "warn");
        }
      }
    }
    this.checkTraceRules(tr);
    this.renderPartsList();
    // 收在 pad 或 via 上＝到站了，鏈條結束。差分對那條路自己有收尾邏輯，也不續。
    // snapTarget 用 pad / via / trace 三個欄位帶回命中的是什麼（沒有 kind 欄位）。
    // 到站＝收在 pad 或 via 上；收在別條走線的端點上不算到站（那通常是轉接，還要繼續）。
    const terminal = !!(td.diff) || !!(endHit && (endHit.pad || endHit.via));
    return { committed: true, terminal, x: td.x2, y: td.y2, net };
  },

  // 連續繪製：收完一段就從終點接著畫下一段，轉彎不必放開滑鼠再重按。
  // 收在 pad/via 上（到站）或按 Esc 才結束。
  continueTraceChain(res) {
    if (!this.chainEnabled()) return false;
    if (!res || !res.committed || res.terminal) return false;
    this.state.traceDraw = { x1: res.x, y1: res.y, x2: res.x, y2: res.y, net: res.net || '' };
    return true;
  },

  chainEnabled() {
    const el = document.getElementById('traceChain');
    return el ? !!el.checked : true;   // 沒有這個開關（舊頁面）就當開著
  },

  // ---- pin swap（SchSwap）----
  // 佈線時把兩隻等價的腳對調，省掉一個交叉。
  // **一定要回寫線路圖**：merge() 的 net 以線路圖為準，只改板子的話
  // 下一次同步就換回去，而且沒有任何訊息。
  swapSelPins() {
    const SW = window.SchSwap;
    const c = this.state.selected;
    if (!SW || !c) { this.toast(pcbT('pj_swap_nosel'), 'warn'); return false; }
    const schId = window.Sch2Pcb ? Sch2Pcb.schIdOf(c.id) : null;
    if (!schId) { this.toast(pcbT('pj_swap_nosch'), 'warn'); return false; }
    const sch = this.findSchComp(schId);
    if (!sch) { this.toast(pcbT('pj_swap_nosch'), 'warn'); return false; }

    const groups = SW.groupsFor(sch);
    if (!groups.length) { this.toast(pcbT('pj_swap_none', { ref: c.ref || c.id, type: sch.type || '?' }), 'warn'); return false; }
    const flat = groups.map(g => g.join('↔')).join('  /  ');
    const ans = prompt(pcbT('pj_swap_ask', { ref: c.ref || c.id, groups: flat }), groups[0].slice(0, 2).join(','));
    if (ans == null) return false;
    const parts = String(ans).split(/[,\s]+/).map(s => s.trim()).filter(Boolean);
    if (parts.length !== 2) { this.toast(pcbT('pj_swap_two'), 'warn'); return false; }
    const r = SW.composeSwap(sch, parts[0], parts[1]);
    if (!r.ok) {
      this.toast(pcbT(r.reason === 'same' ? 'pj_swap_two' : 'pj_swap_bad', { a: parts[0], b: parts[1], groups: flat }), 'error');
      return false;
    }
    const back = this._writeSchPages(pages => Sch2Pcb.annotateSwap(pages, schId, r.pinSwap));
    if (!back.changed) { this.toast(pcbT('pj_swap_nowrite'), 'error'); return false; }
    this.hist();
    // 板上的 pad 立刻跟著換，不必等下一次同步——不然使用者會以為沒作用
    const perm = r.pinSwap || {};
    const pins = this.schPinNames(sch);
    const netByPinName = {};
    (c.pads || []).forEach((pd, i) => { const nm = pins[i]; if (nm) netByPinName[nm] = pd.net || ''; });
    (c.pads || []).forEach((pd, i) => {
      const mine = pins[i]; if (!mine) return;
      const want = perm[mine] || mine;
      pd.net = netByPinName[want] != null ? netByPinName[want] : pd.net;
    });
    this.state.ratsnest = null;
    this.renderNetPanel();
    this.render();
    this.toast(pcbT('pj_swap_done', { ref: c.ref || c.id, a: parts[0], b: parts[1], sch: back.changed }), 'info');
    return true;
  },

  // 飛線總長：對調前後各量一次，使用者才知道這一下到底有沒有比較好。
  // 沒有這個數字的話，gate swap 就是「動了一下、看起來差不多」。
  ratsnestLength() {
    if (!window.Ratsnest) return null;
    let list = null;
    try { list = Ratsnest.compute(this.state, this.padAbs.bind(this)); } catch (e) { return null; }
    if (!list || !list.length) return 0;
    return list.reduce((s, r) => s + Math.hypot((r.x2 - r.x1), (r.y2 - r.y1)), 0);
  },

  // 同型元件對調（gate swap）。
  // 這個資料模型裡沒有「一顆封裝內含四個閘」的概念，每顆元件就是一顆封裝，
  // 所以對調的是**擺放位置**：兩顆的 net 各自跟著自己走到對方的位置。
  // 效果就是佈線變短——那正是 gate swap 要的東西。不假裝我們有單元的概念。
  swapSelGates() {
    const SW = window.SchSwap;
    const set = (this.state.selectedSet || []).filter(Boolean);
    if (!SW) return false;
    if (set.length !== 2) { this.toast(pcbT('pj_gate_need2'), 'warn'); return false; }
    const [a, b] = set;
    // 判準吃的是線路圖元件（type / name / footprint），板上的元件沒有那些欄位
    const sa = this.findSchComp(window.Sch2Pcb ? Sch2Pcb.schIdOf(a.id) : null);
    const sb = this.findSchComp(window.Sch2Pcb ? Sch2Pcb.schIdOf(b.id) : null);
    // 沒有線路圖來源時退回用板上的欄位比對：公版與匯入的板子都沒有線路圖，
    // 但「同一種料、同一個封裝」這件事板上也判得出來。
    const ca = sa || { type: a.kind || '', name: a.part || '', footprint: a.footprint || a.part || '' };
    const cb = sb || { type: b.kind || '', name: b.part || '', footprint: b.footprint || b.part || '' };
    const why = SW.canSwapGatesWhy(ca, cb);
    if (!why.ok) {
      this.toast(pcbT('pj_gate_no_' + why.why, { a: why.a || '', b: why.b || '' }), 'error');
      return false;
    }
    const before = this.ratsnestLength();
    const pl = SW.swapPlacement(a, b);
    if (!pl) return false;
    this.hist();
    a.x = pl.a.x; a.y = pl.a.y; a.rot = pl.a.rot;
    b.x = pl.b.x; b.y = pl.b.y; b.rot = pl.b.rot;
    this.state.ratsnest = null;
    const after = this.ratsnestLength();
    this.renderPartsList();
    this.syncSelPanel();
    this.render();
    // 變長也照講。只報「已對調」的話，使用者不會知道自己讓佈線變難了
    const d = (before != null && after != null) ? (after - before) : null;
    // 0.05mm 以內當作沒變：講「少了 0.0mm」讀起來像有改善，其實什麼都沒發生。
    // 對稱擺放的兩顆、或 pad 根本沒有 net 的板子（公版就是），差值本來就會是 0。
    const key = d == null ? 'pj_gate_done' : (Math.abs(d) < 0.05 ? 'pj_gate_same' : (d < 0 ? 'pj_gate_better' : 'pj_gate_worse'));
    this.toast(pcbT(key, {
      a: a.ref || a.id, b: b.ref || b.id, d: d == null ? '' : Math.abs(d).toFixed(1)
    }), key === 'pj_gate_worse' ? 'warn' : 'info');
    return true;
  },

  // 線路圖那一顆（多頁都找）。交換的規則吃的是線路圖元件的 type / swapGroups，
  // 板上的元件沒有那些欄位。
  findSchComp(schId) {
    const seen = [];
    try {
      const sh = JSON.parse(localStorage.getItem('vs-sheets-v1') || 'null');
      if (sh && Array.isArray(sh.pages)) for (const pg of sh.pages) seen.push(...((pg.data && pg.data.components) || []));
    } catch (e) { }
    try {
      const proj = JSON.parse(localStorage.getItem('voltsketch-project') || 'null');
      if (proj) seen.push(...(proj.components || []));
    } catch (e) { }
    return seen.find(x => x && x.id === schId) || null;
  },

  // 線路圖元件的腳名（依序）。pad 與腳是照順序或編號對應的，這裡只要順序那一份。
  schPinNames(sch) {
    const E = window.CircuitEngine;
    if (!E || !E.getPins) return [];
    try { return E.getPins(sch).map(p => String(p.name)); } catch (e) { return []; }
  },

  // ---- net 屬性編輯（NetModel）----
  // 屬性附在「目前高亮的 net」上：net 清單點一下就是選取，不必再發明一個選取狀態。
  renderNetProps() {
    const box = document.getElementById("netPropsBox");
    if (!box || !window.NetModel) return;
    const net = this.state.highlightNet;
    const all = NetModel.names(this.state);
    if (!net || all.indexOf(net) < 0) { box.style.display = "none"; return; }
    box.style.display = "";
    const p = NetModel.get(this.state, net, all);
    const setV = (id, v) => { const el = document.getElementById(id); if (el && document.activeElement !== el) el.value = v; };
    const nameEl = document.getElementById("netPropsName");
    if (nameEl) nameEl.textContent = net;
    const clsEl = document.getElementById("netPropsCls");
    if (clsEl) clsEl.textContent = p.cls ? "class: " + p.cls : "";
    setV("npZ0", p.z0 || "");
    setV("npZdiff", p.zdiff || "");
    setV("npZtol", p.ztol);
    setV("npNote", p.note);
    const sel = document.getElementById("npPair");
    if (sel && document.activeElement !== sel) {
      const opts = ["<option value=''>—</option>"].concat(all.filter(n => n !== net).map(n =>
        "<option value='" + n.replace(/'/g, "&#39;") + "'>" + n.replace(/</g, "&lt;") + "</option>"));
      sel.innerHTML = opts.join("");
      sel.value = p.pair || "";
    }
    const hint = document.getElementById("npHint");
    if (hint) hint.textContent = this.netPropsHint(net, p);
  },

  // 「現在走成怎樣、目標要多少、該改成多少」一行講完。
  // 只給計算得出來的東西：疊層推不出幾何就說推不出來，不要給一個假數字。
  netPropsHint(net, p) {
    const NM = window.NetModel;
    if (!NM) return "";
    const segs = (this.state.traces || []).filter(t => t.net === net && (t.x1 !== t.x2 || t.y1 !== t.y2));
    if (!segs.length) return pcbT("pj_np_notraces");
    const layer = segs[0].layer || "F.Cu";
    const w = Math.round((segs[0].width || 0.3) * 1000) / 1000;
    if (!window.Stackup) return pcbT("pj_np_nostack");
    const g = Stackup.geomFor(Stackup.load(this.state), this.state, layer);
    if (!g) return pcbT("pj_np_nogeom", { layer });
    const z = NM.impedance(g.kind, w, g.h, g.t, g.er);
    if (!z) return pcbT("pj_np_nogeom", { layer });
    let s = pcbT("pj_np_now", { layer, kind: g.kind, w: w.toFixed(3), z: z.z0.toFixed(1) });
    if (p.z0 > 0) {
      const want = NM.widthFor(g.kind, p.z0, g.h, g.t, g.er);
      s += " │ " + (want == null ? pcbT("pj_np_unreachable", { target: p.z0 }) : pcbT("pj_np_want", { target: p.z0, w: want.toFixed(3) }));
    }
    if (p.zdiff > 0 && p.pair) {
      const pg = NM.pairGeometry(this.state, net, p.pair);
      if (pg.gap != null) {
        const wantGap = NM.gapFor(g.kind, p.zdiff, (pg.wA + pg.wB) / 2, g.h, g.t, g.er);
        s += " │ " + pcbT("pj_np_pairnow", { gap: pg.gap.toFixed(3), pct: Math.round(pg.coupled * 100), skew: pg.skew.toFixed(2) });
        if (wantGap != null) s += " → " + pcbT("pj_np_wantgap", { target: p.zdiff, s: wantGap.toFixed(3) });
      } else {
        s += " │ " + pcbT("pj_np_nocouple", { pct: Math.round(pg.coupled * 100) });
      }
    }
    return s;
  },

  applyNetProps() {
    const net = this.state.highlightNet;
    if (!net || !window.NetModel) return false;
    const v = id => (document.getElementById(id) || {}).value;
    this.hist();
    NetModel.set(this.state, net, { z0: v("npZ0"), zdiff: v("npZdiff"), ztol: v("npZtol"), note: v("npNote") });
    // 配對要對稱寫兩邊，所以走 setPair 而不是 set({pair})
    NetModel.setPair(this.state, net, String(v("npPair") || "").trim());
    this.renderNetPanel();
    this.toast(pcbT("pj_np_saved", { net }), "info");
    return true;
  },

  clearNetProps() {
    const net = this.state.highlightNet;
    if (!net || !window.NetModel) return false;
    this.hist();
    NetModel.setPair(this.state, net, "");
    NetModel.set(this.state, net, { z0: "", zdiff: "", ztol: "", note: "" });
    this.renderNetPanel();
    this.toast(pcbT("pj_np_cleared", { net }), "info");
    return true;
  },

  // 板上已經沒有的 net 的屬性。不自動清（可能只是暫時把線刪光重繞），要按才清。
  gcNetProps() {
    if (!window.NetModel) return 0;
    const st = NetModel.stale(this.state);
    if (!st.length) { this.toast(pcbT("pj_np_nostale"), "info"); return 0; }
    if (!window.confirm(pcbT("pj_np_gc_ask", { n: st.length, nets: st.slice(0, 8).join(", ") }))) return 0;
    this.hist();
    const rm = NetModel.gc(this.state);
    this.renderNetPanel();
    this.toast(pcbT("pj_np_gc_done", { n: rm.length }), "info");
    return rm.length;
  },

  // ---- 封裝與庫是否同步（FpInst）----
  renderFpSync() {
    const box = document.getElementById("fpSyncRows");
    const sum = document.getElementById("fpSyncSummary");
    if (!box || !window.FpInst) return;
    const a = FpInst.audit(this.state);
    const esc = t => String(t == null ? "" : t).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[ch]));
    if (sum) sum.textContent = pcbT("pj_fps_summary", {
      total: a.total, synced: a.counts.synced, stale: a.counts.stale,
      edited: a.counts.edited, missing: a.counts.missing, unknown: a.counts.unknown + a.counts.detached
    });
    const show = a.rows.filter(r => r.status === "stale" || r.status === "edited" || r.status === "missing");
    if (!show.length) { box.innerHTML = "<p style='color:var(--muted)'>" + pcbT("pj_fps_none") + "</p>"; return; }
    const COLOR = { stale: "#e67e22", edited: "var(--muted)", missing: "var(--danger)" };
    box.innerHTML = show.map(r => {
      const what = (r.fp ? (r.fp.src + " " + (r.fp.variant || r.fp.part || r.fp.name || r.fp.lib)) : "—");
      const detail = r.status === "missing" ? r.reason
        : pcbT("pj_fps_changes", { n: r.changes.length, lost: r.lost.length });
      return "<div class='fp-row' data-id='" + esc(r.id) + "' style='display:grid;grid-template-columns:auto 1fr auto;gap:6px;padding:4px 6px;border-bottom:1px solid var(--line)'>" +
        "<span style='color:" + COLOR[r.status] + "'>" + esc(r.ref || r.id) + "</span>" +
        "<span style='color:var(--muted);font-size:11px'>" + esc(what) + " │ " + esc(detail) + (r.unverified ? " ⚠" : "") + "</span>" +
        (r.status === "missing" ? "<span></span>"
          : "<button class='small-button' data-act='fpsync' style='padding:0 6px'>" + pcbT("pj_fps_one") + "</button>") +
        "</div>";
    }).join("");
  },

  // 單顆更新。edited（使用者手改過幾何）要先問——直接蓋掉是最惡的那種資料遺失：
  // 使用者不會知道自己微調過的 pad 什麼時候不見的。
  syncFpOne(id) {
    if (!window.FpInst) return false;
    const c = (this.state.components || []).find(x => x.id === id);
    if (!c) return false;
    const st = FpInst.status(c);
    if (st.status === "edited" && !window.confirm(pcbT("pj_fps_ask_edited", { ref: c.ref || c.id }))) return false;
    if (st.unverified && !window.confirm(pcbT("pj_fps_ask_unverified", { ref: c.ref || c.id }))) return false;
    if (st.lost.length && !window.confirm(pcbT("pj_fps_ask_lost", { ref: c.ref || c.id, n: st.lost.length, nets: st.lost.map(x => x.net).join(", ") }))) return false;
    this.hist();
    const r = FpInst.sync(c);
    this.state.ratsnest = null;
    this.renderFpSync();
    this.renderPartsList();
    this.renderNetPanel();
    this.render();
    this.toast(pcbT("pj_fps_done_one", { ref: c.ref || c.id, lost: r.lost.length, added: r.added.length }), r.lost.length ? "warn" : "info");
    return true;
  },

  // 一鍵更新只動 stale：edited/unknown/detached/missing 都不碰。
  syncFpAll() {
    if (!window.FpInst) return 0;
    const a = FpInst.audit(this.state);
    if (!a.counts.stale) { this.toast(pcbT("pj_fps_none"), "info"); return 0; }
    const lost = a.rows.filter(r => r.status === "stale").reduce((n, r) => n + r.lost.length, 0);
    if (!window.confirm(pcbT("pj_fps_ask_all", { n: a.counts.stale, lost }))) return 0;
    this.hist();
    const r = FpInst.syncAll(this.state);
    this.state.ratsnest = null;
    this.renderFpSync();
    this.renderPartsList();
    this.renderNetPanel();
    this.render();
    this.toast(pcbT("pj_fps_done_all", { n: r.synced, lost: r.lost }), r.lost ? "warn" : "info");
    return r.synced;
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
