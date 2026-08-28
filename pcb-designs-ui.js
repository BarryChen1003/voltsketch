/**
 * pcb-designs-ui.js — PCB 頁把「雲端專案」面板接上 pcbApp
 *
 * 清單本體在 designs-ui.js（兩頁共用）。這支只提供這一頁專屬的三件事：
 * 存哪個欄位、怎麼取當前板子、怎麼把板子套回去。
 *
 * 載入順序：只在事件裡用到 pcbApp，可以排在 pcb.js 之後。
 */
(function () {
  'use strict';

  function boot() {
    if (!window.DesignsUI) return;
    const cfgForBoth = {
      field: 'pcb',
      // 走 PcbHistory 的 snapshot/restore，跟「儲存版面檔」是同一條序列化路徑——
      // 分家的話遲早會出現「下載的 .json 打得開、雲端存的打不開」。
      snapshot: () => {
        const a = window.pcbApp;
        return (a && window.PcbHistory && window.PcbHistory.snapshot) ? window.PcbHistory.snapshot(a) : null;
      },
      restore: obj => {
        const a = window.pcbApp;
        return !!(a && window.PcbHistory && window.PcbHistory.restore(a, obj));
      },
      toast: (msg, kind) => { const a = window.pcbApp; if (a && a.toast) a.toast(msg, kind); },
    };
    window.DesignsUI.mount(cfgForBoth);
    // 變更歷史用同一組 snapshot / restore：兩條路分家的話，遲早會出現
    // 「存檔存得進去、還原卻套不回來」這種只在其中一邊復現的 bug。
    if (window.DesignHistoryUI) window.DesignHistoryUI.mount(cfgForBoth);

  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
