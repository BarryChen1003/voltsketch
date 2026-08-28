/**
 * sch-designs-ui.js — 線路圖頁把「雲端專案」面板接上 app
 *
 * 清單本體在 designs-ui.js（兩頁共用）。這支只提供這一頁專屬的三件事：
 * 存哪個欄位、怎麼取當前線路圖、怎麼把線路圖套回去。
 *
 * 注意 app 是 app.js 頂層的 const，不是 window 的屬性——同一個 global scope
 * 的其它 script 直接用識別字取得（sim-bench.js 也是這樣），但一定要排在 app.js 之後。
 */
(function () {
  'use strict';

  const A = () => (typeof app !== 'undefined' ? app : null);

  function boot() {
    if (!window.DesignsUI) return;
    window.DesignsUI.mount({
      field: 'sch',
      snapshot: () => {
        const a = A();
        if (!a || !a.state) return null;
        return {
          components: a.state.components,
          wires: a.state.wires,
          componentIdCounter: a.state.componentIdCounter,
        };
      },
      restore: obj => {
        const a = A();
        if (!a || !obj || !obj.components) return false;
        a.saveUndo();                       // 開啟雲端專案之後還可以復原回原本的圖
        a.state.components = obj.components;
        a.state.wires = obj.wires || [];
        a.state.componentIdCounter = obj.componentIdCounter || 0;
        a.setSelection && a.setSelection([]);
        a.render();
        return true;
      },
      // showToast 的第二個參數是毫秒，不是種類——錯誤訊息留久一點
      toast: (msg, kind) => { const a = A(); if (a && a.showToast) a.showToast(msg, kind === 'error' ? 6000 : 3000); },
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
