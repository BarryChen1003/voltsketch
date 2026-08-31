/**
 * pcb-theme.js — PCB 2D 配色主題（純資料 + 對比度計算，不碰 DOM）
 *
 * 為什麼要主題而不是一組寫死的顏色：使用者要的是「CAM 螢光」那種黑底多層板的樣子
 * （亮綠／青／洋紅／藍疊在純黑上），但站上原本的綠底風格也有人習慣。
 * 兩種都留，預設換成 cam。
 *
 * 為什麼顏色要能被程式檢查：配色最惡的失敗是「某一層跟背景差不多暗，看起來像沒畫」——
 * 截圖看不出來（它確實有渲染），要用對比度算才抓得到。所以 contrast() 與
 * pcb-theme.test.js 的門檻是這個檔的一部分，不是附帶品。
 *
 * 層色指派原則：相鄰的兩層在色相環上要離得夠遠，否則 4 層板一疊，
 * 使用者分不出這條線在 In1 還是 In2。
 */
'use strict';
(function (root) {
  const Theme = {};

  // 螢光層色環：綠 → 青 → 洋紅 → 藍 → 黃 → 橘 → 紫 → 青綠。
  // 順序是刻意的：前四個是最常見的 4 層板，兩兩色相距離都 > 60°。
  const CAM_RAMP = ['#39ff5a', '#00e5ff', '#ff2e9a', '#6a5cff', '#ffd400', '#ff7a1a', '#c46bff', '#00ffc2',
                    '#7cff3d', '#00b7ff', '#ff5ec7', '#8aa5ff'];
  const EDA_RAMP = ['#ff4040', '#5b83ff', '#20c997', '#d16bff', '#e0b400', '#00b8a9', '#ff8f3d', '#6ea8ff',
                    '#ff6b9d', '#3ddc84', '#ffcf40', '#8f7bff'];
  const CLASSIC_RAMP = ['#ff6b5b', '#5bb8f5', '#5ce68a', '#c78ce0', '#f5a04a', '#2fd6b4', '#ffc857', '#7ec8f0',
                        '#ff8f80', '#a0e85c', '#d9a3f0', '#ff9d4d'];

  const THEMES = {
    cam: {
      i18n: 'pt_theme_cam',
      bg: '#000308', grid: '#0e2a3a', board: '#dfe9ff', boardFill: '#050b12',
      silkF: '#ffffff', silkB: '#8fa6c0',
      compTop: '#1d3a5c', compBottom: '#16304a',
      ramp: CAM_RAMP
    },
    easyeda: {
      i18n: 'pt_theme_easyeda',
      bg: '#191c22', grid: '#2a3038', board: '#d8dee9', boardFill: '#22262e',
      silkF: '#f5f5f5', silkB: '#9aa4b2',
      compTop: '#2b3a4a', compBottom: '#22303e',
      ramp: EDA_RAMP
    },
    classic: {
      i18n: 'pt_theme_classic',
      bg: '#1a1a2e', grid: '#3d5a4e', board: '#4fae6d', boardFill: '#2d4a3e',
      silkF: '#f1c40f', silkB: '#b7950b',
      compTop: '#34495e', compBottom: '#1f3a5f',
      ramp: CLASSIC_RAMP
    }
  };

  Theme.DEFAULT = 'cam';
  Theme.ids = () => Object.keys(THEMES);
  Theme.list = () => Object.keys(THEMES).map(id => ({ id: id, i18n: THEMES[id].i18n }));
  Theme.get = id => THEMES[id] || THEMES[Theme.DEFAULT];

  /** 第 i 個銅層的顏色（i 從 0 起算，F.Cu 是 0）。 */
  Theme.layerColor = function (id, i) {
    const r = Theme.get(id).ramp;
    return r[((i % r.length) + r.length) % r.length];
  };

  /**
   * 攤平成 pcb.js 用的 palette 物件。cuIds 給實際疊層的銅層 id 順序，
   * 沒給就退回最常見的兩層，讓沒有板子時也拿得到一組值。
   */
  Theme.paletteFor = function (id, cuIds) {
    const t = Theme.get(id);
    const ids = (cuIds && cuIds.length) ? cuIds : ['F.Cu', 'B.Cu'];
    const pal = {
      theme: THEMES[id] ? id : Theme.DEFAULT,
      bg: t.bg, grid: t.grid, board: t.board, boardFill: t.boardFill,
      silkF: t.silkF, silkB: t.silkB,
      compTop: t.compTop, compBottom: t.compBottom
    };
    ids.forEach((lid, i) => { pal[lid] = Theme.layerColor(id, i); });
    return pal;
  };

  // ---- 對比度：用來擋「某層顏色在背景上根本看不見」 ----
  Theme.rgb = function (hex) {
    const h = String(hex || '').replace('#', '');
    const s = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
    return [0, 2, 4].map(i => parseInt(s.slice(i, i + 2), 16) || 0);
  };

  /** WCAG 相對亮度 */
  Theme.luminance = function (hex) {
    const c = Theme.rgb(hex).map(v => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };

  /** WCAG 對比度（1〜21）。走線細，1:1 的顏色等於沒畫。 */
  Theme.contrast = function (a, b) {
    const la = Theme.luminance(a), lb = Theme.luminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  };

  /** 兩色的色相距離（0〜180°）。用來擋「相鄰層看起來同一色」。 */
  Theme.hueDistance = function (a, b) {
    const hue = hex => {
      const [r, g, bl] = Theme.rgb(hex).map(v => v / 255);
      const mx = Math.max(r, g, bl), mn = Math.min(r, g, bl), d = mx - mn;
      if (!d) return 0;
      let h;
      if (mx === r) h = ((g - bl) / d) % 6;
      else if (mx === g) h = (bl - r) / d + 2;
      else h = (r - g) / d + 4;
      return (h * 60 + 360) % 360;
    };
    const d = Math.abs(hue(a) - hue(b)) % 360;
    return d > 180 ? 360 - d : d;
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = Theme;
  root.PcbTheme = Theme;
})(typeof window !== 'undefined' ? window : globalThis);
