// 線路圖 ↔ PCB 選取連動（cross-probe）
//
// 用途：在 PCB 上點一顆元件，另一個分頁的線路圖同時把它選起來，反之亦然。
// 佈線時要一直回頭確認「這條到底是哪一段電路」，沒有連動就得靠 refdes 用眼睛找。
//
// 傳輸走 BroadcastChannel（同源、跨分頁），瀏覽器不支援時退回 localStorage 事件。
// 兩邊都會廣播也都會接收，所以最重要的是**回音防護**：
// 套用遠端選取時不可再廣播出去，否則兩個分頁會互相彈來彈去停不下來。
//
// 對應關係來自線路圖轉 PCB：轉出來的元件 id 是 `sch-<線路圖元件 id>`。
// 沒有這個前綴的（公版、KiCad 匯入、手動放的）本來就對不到線路圖，直接略過，不亂猜。
(() => {
  'use strict';

  const CHANNEL = 'vs-crossprobe-v1';
  const LS_KEY = 'vs-crossprobe-msg';
  const PREFIX = 'sch-';

  // ---------- 純函式：id 對應與訊息驗證 ----------
  const schIdOf = comp => {
    const id = comp && comp.id;
    if (typeof id !== 'string' || id.indexOf(PREFIX) !== 0) return null;
    const rest = id.slice(PREFIX.length);
    return rest || null;
  };
  const pcbIdOf = schId => (typeof schId === 'string' && schId) ? PREFIX + schId : null;

  // 收到的東西可能來自別的分頁、舊版本、或根本不是我們的訊息。
  // 只接受形狀完全對的，其餘一律丟掉——寧可沒反應，不要選錯元件。
  function validate(msg, selfId) {
    if (!msg || typeof msg !== 'object') return null;
    if (msg.v !== 1) return null;
    if (msg.from !== 'pcb' && msg.from !== 'sch') return null;
    if (!Array.isArray(msg.ids)) return null;
    if (selfId && msg.src === selfId) return null;              // 自己發的不收
    const ids = msg.ids.filter(x => typeof x === 'string' && x).slice(0, 500);
    return { from: msg.from, ids, src: msg.src || '' };
  }

  // ---------- 傳輸 ----------
  function makeBus(selfId, onMessage) {
    let bc = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel(CHANNEL);
        bc.onmessage = e => { const m = validate(e.data, selfId); if (m) onMessage(m); };
      }
    } catch (e) { bc = null; }
    if (!bc && typeof window !== 'undefined') {
      window.addEventListener('storage', e => {
        if (e.key !== LS_KEY || !e.newValue) return;
        let d = null;
        try { d = JSON.parse(e.newValue); } catch (err) { return; }
        const m = validate(d, selfId);
        if (m) onMessage(m);
      });
    }
    return {
      post(msg) {
        const packed = Object.assign({ v: 1, src: selfId, t: Date.now() }, msg);
        if (bc) { try { bc.postMessage(packed); return; } catch (e) { /* 落到 localStorage */ } }
        try { localStorage.setItem(LS_KEY, JSON.stringify(packed)); } catch (e) { }
      },
      close() { if (bc) try { bc.close(); } catch (e) { } }
    };
  }

  /**
   * 掛上連動。
   * opts: {
   *   side: 'pcb' | 'sch',
   *   getSelection: () => string[]      本地目前選取（pcb 回線路圖 id、sch 回自己的 id）
   *   applySelection: (ids) => void     套用遠端來的選取
   * }
   * 回 { notify, dispose, _state }
   */
  function attach(opts) {
    const side = opts.side;
    const selfId = side + '-' + Math.random().toString(36).slice(2, 10);
    let applying = false;      // 回音防護：套用遠端選取期間不廣播
    let last = '';

    const bus = makeBus(selfId, msg => {
      if (msg.from === side) return;         // 同一側的訊息不處理
      applying = true;
      try { opts.applySelection(msg.ids); } finally {
        // 用 setTimeout 讓套用過程觸發的 notify 全部落在 applying 為 true 的期間
        setTimeout(() => { applying = false; }, 0);
      }
    });

    function notify() {
      if (applying) return;
      const ids = (opts.getSelection() || []).filter(Boolean);
      const key = ids.slice().sort().join(',');
      if (key === last) return;              // 沒變就不廣播，省掉來回抖動
      last = key;
      bus.post({ from: side, ids });
    }

    return {
      notify,
      dispose() { bus.close(); },
      _state: () => ({ applying, last, selfId })
    };
  }

  const CrossProbe = { attach, schIdOf, pcbIdOf, validate, makeBus, CHANNEL, LS_KEY, PREFIX };
  if (typeof window !== 'undefined') window.CrossProbe = CrossProbe;
  if (typeof module !== 'undefined' && module.exports) module.exports = CrossProbe;
})();
