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
//
// 階層式圖紙：攤平後的 id 是 `PWR1/r12`（實例路徑 + 區域 id），PCB 存的就是這個全名，
// 而線路圖一次只顯示一頁、手上只有 `r12`。所以訊息多帶一個 path 欄位，
// 兩邊都用「全名」當共同語言：線路圖送出時補上自己的層，收到時跳到對的層再選。
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

  // ---------- 階層路徑 ----------
  // 攤平後的線路圖 id 自帶實例路徑（`SchHier.build` 產 `PWR1/r12`），所以 PCB 這一側
  // 天生就知道「這顆屬於哪一層」。線路圖那一側相反：它手上只有目前這一頁的區域 id，
  // 送訊息時必須附上自己所在的層，否則階層設計的兩邊永遠對不上（＝等於沒有連動）。
  const SEP = '/';
  const splitPath = schId => {
    const s = typeof schId === 'string' ? schId : '';
    const cut = s.lastIndexOf(SEP);
    return cut < 0 ? { path: '', local: s } : { path: s.slice(0, cut), local: s.slice(cut + 1) };
  };
  const joinPath = (path, local) => {
    const p = typeof path === 'string' ? path : '';
    const l = typeof local === 'string' ? local : '';
    return l ? (p ? p + SEP + l : l) : '';
  };
  // 區域 id ＋ 路徑 → 攤平 id。已經自帶路徑的不再加一次（母圖上的選取本來就是全名）。
  const qualify = (ids, path) => (ids || [])
    .map(id => (typeof id === 'string' && id) ? (id.indexOf(SEP) >= 0 ? id : joinPath(path, id)) : '')
    .filter(Boolean);
  // 攤平 id → 指定那一層的區域 id。不在那一層的丟掉，不硬塞：
  // 別層可能有同名的另一顆（同一張子圖放兩次就是這樣），硬塞會選到錯的元件。
  const localize = (ids, path) => {
    const want = typeof path === 'string' ? path : '';
    const out = [];
    (ids || []).forEach(id => { const p = splitPath(id); if (p.path === want && p.local) out.push(p.local); });
    return out;
  };
  // PCB 一次可以選到跨好幾層的元件，線路圖一次只顯示一頁。
  // 規則：成員最多的那一層；同票取先出現的——要有確定答案，不能每次跳去不同層。
  const dominantPath = ids => {
    const count = new Map();
    (ids || []).forEach(id => {
      if (typeof id !== 'string' || !id) return;
      const p = splitPath(id).path;
      count.set(p, (count.get(p) || 0) + 1);
    });
    let best = '', n = -1;
    for (const [p, c] of count) if (c > n) { best = p; n = c; }
    return best;
  };

  // 收到的東西可能來自別的分頁、舊版本、或根本不是我們的訊息。
  // 只接受形狀完全對的，其餘一律丟掉——寧可沒反應，不要選錯元件。
  function validate(msg, selfId) {
    if (!msg || typeof msg !== 'object') return null;
    if (msg.v !== 1) return null;
    if (msg.from !== 'pcb' && msg.from !== 'sch') return null;
    if (!Array.isArray(msg.ids)) return null;
    if (selfId && msg.src === selfId) return null;              // 自己發的不收
    const ids = msg.ids.filter(x => typeof x === 'string' && x).slice(0, 500);
    // path 是選填：舊分頁不會送，收到就當作根層（行為退回舊版，不會選錯）。
    const path = typeof msg.path === 'string' ? msg.path.slice(0, 400) : '';
    return { from: msg.from, ids, src: msg.src || '', path };
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
 *   applySelection: (ids, path) => void  套用遠端來的選取（path＝對方所在的階層）
 *   getPath: () => string             選填：本地所在的階層路徑（線路圖側才需要）
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
      try { opts.applySelection(msg.ids, msg.path || ''); } finally {
        // 用 setTimeout 讓套用過程觸發的 notify 全部落在 applying 為 true 的期間
        setTimeout(() => { applying = false; }, 0);
      }
    });

    function notify() {
      if (applying) return;
      const ids = (opts.getSelection() || []).filter(Boolean);
      const path = opts.getPath ? (opts.getPath() || '') : '';
      // 層也要進 key：同一批區域 id 在不同層是不同的東西，只比 id 會漏送。
      const key = path + '|' + ids.slice().sort().join(',');
      if (key === last) return;              // 沒變就不廣播，省掉來回抖動
      last = key;
      bus.post({ from: side, ids, path });
    }

    return {
      notify,
      dispose() { bus.close(); },
      _state: () => ({ applying, last, selfId })
    };
  }

  const CrossProbe = {
    attach, schIdOf, pcbIdOf, validate, makeBus, CHANNEL, LS_KEY, PREFIX,
    splitPath, joinPath, qualify, localize, dominantPath, SEP
  };
  if (typeof window !== 'undefined') window.CrossProbe = CrossProbe;
  if (typeof module !== 'undefined' && module.exports) module.exports = CrossProbe;
})();
