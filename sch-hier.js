/**
 * sch-hier.js — 階層式圖紙：把一張圖紙當成一顆符號放到另一張圖紙上（window.SchHier）
 *
 * 兩種新圖元：
 *   port     子圖上的對外接點。`{type:'port', name:'CLK', dir:'in'|'out'|'bidir'}`，一隻腳。
 *            它落在哪條 net 上，那條 net 就是這張圖紙對外的 CLK。
 *   sheetref 母圖上的圖紙符號。`{type:'sheetref', sheet:'<頁名>', label:'U1'}`，
 *            腳位＝被參照那頁的 port（照名字排序，順序才穩定）。
 *
 * 腳位快取：sheetref 的腳存在自己的 `icPins` 上（跟 IC 走同一條 icLayout）。
 * 為什麼快取而不是每次去查子圖：circuit-engine 是純函式、拿不到 sheets 存檔，
 * 而畫面每一幀都要知道腳在哪。子圖改了 port 之後快取會過期，`instanceStatus`
 * 會講出來——跟 FpInst 對封裝庫的做法同一套（快取 + 明講過期，不要靜靜用舊的）。
 *
 * ── net 的範圍（這一段是全檔最重要的設計決定）──
 * 多實例的意義就是「同一張子圖放兩份，內部訊號各走各的」。所以：
 *   **沒有標籤的內部 net → 依實例分開**（自動名字帶實例路徑，兩份不會相通）。
 *   **有標籤的 net → 維持全域**（沿用既有行為：net 標籤本來就是跨頁連接的唯一途徑）。
 * 後者在「同一張子圖被放兩次、而且內部用了標籤」時會把兩份短在一起。
 * **不偷偷改掉這個行為，而是報出來**（hier_drc_shared_label）：
 * 悄悄把既有的跨頁連線改成區域的，會讓現有的圖一夜之間斷線，那比報一條訊息糟得多。
 * 要跨階層連的東西，正確做法是拉一個 port。
 *
 * 純函式、不碰 DOM，node 測得到（sch-hier.test.js）。
 */
window.SchHier = (function () {
  'use strict';

  const T = (k, vars) => (typeof window !== 'undefined' && window.I18N) ? window.I18N.t(k, vars) : k;
  const S = v => String(v == null ? '' : v).trim();
  const PORT_DIRS = ['in', 'out', 'bidir'];
  const MAX_DEPTH = 16;          // 遞迴保險絲；cycles() 抓不到的怪資料也不會把瀏覽器鎖死

  const isPort = c => !!(c && c.type === 'port');
  const isInstance = c => !!(c && c.type === 'sheetref');

  /** 子圖對外的接點清單，照名字排序（順序穩定，母圖的腳才不會因為畫的先後而跳動） */
  function portsOf(pageData) {
    const out = [];
    for (const c of ((pageData && pageData.components) || [])) {
      if (!isPort(c)) continue;
      const name = S(c.name);
      if (!name) continue;
      out.push({ name, dir: PORT_DIRS.indexOf(S(c.dir)) >= 0 ? S(c.dir) : 'bidir', compId: c.id });
    }
    out.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    return out;
  }

  const instancesOf = pageData => ((pageData && pageData.components) || []).filter(isInstance);
  const pageIndex = (pages, name) => (pages || []).findIndex(p => S(p && p.name) === S(name));
  const hasHierarchy = pages => (pages || []).some(p => instancesOf(p && p.data).length > 0);

  /**
   * 頂層是哪一頁：**沒有被任何人放進去**的那一頁。
   * 直接用第 0 頁的話，使用者把子圖排在前面（很常見，因為子圖先畫）
   * 就會從子圖開始展開，母圖上的東西整批不見——而且不會有任何錯誤訊息。
   * 都被參照（例如全是環）或都沒有實例 → 退回 0。
   */
  function rootIndex(pages) {
    pages = pages || [];
    if (!pages.length) return 0;
    const used = new Set();
    for (const p of pages) for (const inst of instancesOf(p.data)) used.add(S(inst.sheet));
    for (let i = 0; i < pages.length; i++) if (!used.has(S(pages[i].name))) return i;
    return 0;
  }

  // ---------------- 腳位快取 ----------------
  // port → icPins。左右各半，跟 icLayout 的預設分配一致。
  function portsToPins(ports) {
    const k = Math.ceil(ports.length / 2);
    return ports.map((p, i) => ({ num: p.name, name: p.name, side: i < k ? 'L' : 'R', type: p.dir }));
  }
  const pinsKey = pins => (pins || []).map(p => S(p.num) + '/' + S(p.side) + '/' + S(p.type)).join('|');

  function syncInstance(comp, ports) {
    if (!isInstance(comp)) return false;
    comp.icPins = portsToPins(ports || []);
    return true;
  }

  /** 'synced' | 'stale' | 'missing'（找不到那一頁）| 'empty'（那頁沒有 port） */
  function instanceStatus(comp, pages) {
    if (!isInstance(comp)) return 'missing';
    const pi = pageIndex(pages, comp.sheet);
    if (pi < 0) return 'missing';
    const ports = portsOf(pages[pi].data);
    if (!ports.length) return 'empty';
    return pinsKey(comp.icPins) === pinsKey(portsToPins(ports)) ? 'synced' : 'stale';
  }

  // ---------------- 遞迴偵測 ----------------
  /**
   * 回 [[頁名,…]]，每個是一條環。A 放 B、B 放 A 這種圖如果直接展開，
   * 不是很久，是**永遠**——瀏覽器當場沒反應，而使用者只會覺得「按了沒事發生」。
   */
  function cycles(pages) {
    const found = [], seen = new Set();
    const idx = new Map((pages || []).map((p, i) => [S(p.name), i]));
    const state = new Map();       // 0=未訪 1=訪問中 2=完成
    const stack = [];
    function walk(name) {
      const st = state.get(name) || 0;
      if (st === 1) {
        const at = stack.indexOf(name);
        const loop = stack.slice(at >= 0 ? at : 0).concat([name]);
        const key = loop.join('>');
        if (!seen.has(key)) { seen.add(key); found.push(loop); }
        return;
      }
      if (st === 2) return;
      state.set(name, 1); stack.push(name);
      const i = idx.get(name);
      if (i != null) for (const inst of instancesOf(pages[i].data)) {
        const child = S(inst.sheet);
        if (child) walk(child);
      }
      stack.pop(); state.set(name, 2);
    }
    for (const p of (pages || [])) walk(S(p.name));
    return found;
  }

  // ---------------- 檢查 ----------------
  function validate(pages) {
    const res = [];
    pages = pages || [];
    if (!hasHierarchy(pages)) return res;

    for (const loop of cycles(pages))
      res.push({ type: 'error', message: T('hier_drc_cycle', { loop: loop.join(' → ') }) });

    for (const pg of pages) {
      // 同一頁上兩個 port 同名＝對外只會剩一隻腳，另一條線悄悄斷掉
      const names = new Map();
      for (const p of portsOf(pg.data)) {
        if (names.has(p.name)) res.push({ type: 'error', message: T('hier_drc_dup_port', { page: S(pg.name), port: p.name }) });
        names.set(p.name, true);
      }
      // 同一頁上兩個實例同名＝展開後的路徑會撞在一起
      const labels = new Map();
      for (const inst of instancesOf(pg.data)) {
        const lb = S(inst.label) || S(inst.id);
        if (labels.has(lb)) res.push({ type: 'error', message: T('hier_drc_dup_inst', { page: S(pg.name), label: lb }) });
        labels.set(lb, true);
        const st = instanceStatus(inst, pages);
        if (st === 'missing') res.push({ type: 'error', message: T('hier_drc_no_sheet', { label: lb, sheet: S(inst.sheet) }) });
        else if (st === 'empty') res.push({ type: 'warning', message: T('hier_drc_no_port', { label: lb, sheet: S(inst.sheet) }) });
        else if (st === 'stale') res.push({ type: 'warning', message: T('hier_drc_stale', { label: lb, sheet: S(inst.sheet) }) });
      }
    }

    // 同一張子圖被放兩次以上，而且內部有 net 標籤 → 那些標籤會把兩份短在一起
    const useCount = new Map();
    for (const pg of pages) for (const inst of instancesOf(pg.data)) {
      const s = S(inst.sheet); if (s) useCount.set(s, (useCount.get(s) || 0) + 1);
    }
    for (const [sheet, n] of useCount) {
      if (n < 2) continue;
      const pi = pageIndex(pages, sheet);
      if (pi < 0) continue;
      const labelled = [...new Set(((pages[pi].data && pages[pi].data.wires) || []).map(w => S(w && w.net)).filter(Boolean))];
      if (labelled.length) res.push({
        type: 'warning',
        message: T('hier_drc_shared_label', { sheet, n, list: labelled.slice(0, 6).join(', ') })
      });
    }
    return res;
  }

  // ---------------- 展開 ----------------
  /**
   * 把階層攤平成「一份元件清單 + 一個 netOf()」，剛好是 Sch2Pcb.convert 要的形狀。
   *
   * 攤平在 **net 層**做，不是把幾何複製一份：複製幾何要重算座標、重接導線，
   * 錯一個地方就是一條看不見的斷線。這裡只做兩件事——
   *   1. 每一頁各自算 net（沿用既有引擎）
   *   2. 把「子圖的 port 所在 net」與「母圖上該實例對應腳的 net」接起來（union-find）
   *
   * 回 { comps, netOf(compId, pinIndex), findings, instances, netCount }
   * comps 的 id/label 帶實例路徑（U1/R1），所以同一張子圖放兩次不會撞名。
   */
  function build(pages, rootIdx, eng, opts) {
    opts = opts || {};
    pages = pages || [];
    const findings = validate(pages);
    const res = { comps: [], netOf: () => '', findings, instances: [], netCount: 0 };
    const eng2 = eng || (typeof window !== 'undefined' && window.CircuitEngine);
    if (!eng2 || !pages.length) return res;
    if (cycles(pages).length) return res;              // 有環就不展開，findings 已經說了

    // union-find over 「實例路徑 + 該頁 net root」
    const parent = new Map();
    const find = a => { while (parent.get(a) !== a) { parent.set(a, parent.get(parent.get(a))); a = parent.get(a); } return a; };
    const add = a => { if (!parent.has(a)) parent.set(a, a); return a; };
    const union = (a, b) => { const ra = find(add(a)), rb = find(add(b)); if (ra !== rb) parent.set(ra, rb); };

    const comps = [];
    const pinKeyOf = new Map();   // 攤平後的 "compId:pinIndex" → union key
    const labelOf = new Map();    // union key(root) → 使用者標籤

    function walk(pageIdx, path, depth, bindPortKey) {
      if (depth > MAX_DEPTH) return;
      const pg = pages[pageIdx];
      if (!pg || !pg.data) return;
      const raw = (pg.data.components || []).filter(c => c && c.type);
      const nets = eng2.computeNets(raw, pg.data.wires || []);
      const byId = {}; raw.forEach(c => { byId[c.id] = c; });

      // 這一頁每個 net root 的 union key。有標籤的用標籤（全域，沿用既有行為），
      // 沒標籤的帶實例路徑（區域，同一張圖放兩次才不會相通）。
      const keyOfRoot = r => {
        const nm = nets.netName ? nets.netName.get(r) : '';
        if (nm) { const k = 'L:' + nm; add(k); labelOf.set(k, nm); return k; }
        return add('P:' + path + '#' + r);
      };

      // port：把這一頁的 port net 接到母圖傳下來的那條
      for (const c of raw) {
        if (!isPort(c)) continue;
        const nm = S(c.name); if (!nm) continue;
        const r = nets.pinNet.get(c.id + ':0');
        if (r == null) continue;
        const k = keyOfRoot(r);
        if (bindPortKey) { const up = bindPortKey(nm); if (up) union(k, up); }
      }

      for (const c of raw) {
        if (isPort(c)) continue;

        if (isInstance(c)) {
          const lb = S(c.label) || S(c.id);
          const childIdx = pageIndex(pages, c.sheet);
          if (childIdx < 0) continue;
          // 這個實例每隻腳所在的 net（母圖這一側）
          const pins = eng2.getPins(c);
          const upOf = new Map();
          pins.forEach((p, i) => {
            const r = nets.pinNet.get(c.id + ':' + i);
            if (r == null) return;
            upOf.set(S(p.name), keyOfRoot(r));
          });
          res.instances.push({ path: path ? path + '/' + lb : lb, sheet: S(c.sheet) });
          walk(childIdx, path ? path + '/' + lb : lb, depth + 1, nm => upOf.get(nm) || '');
          continue;
        }

        // 一般元件：帶實例路徑複製一份
        const nid = path ? path + '/' + c.id : c.id;
        const flat = Object.assign({}, c, {
          id: nid,
          label: path ? path + '/' + S(c.label || c.id) : S(c.label || c.id)
        });
        comps.push(flat);
        eng2.getPins(c).forEach((p, i) => {
          const r = nets.pinNet.get(c.id + ':' + i);
          if (r == null) return;
          if (!nets.connectedPins.has(c.id + ':' + i)) return;
          pinKeyOf.set(nid + ':' + i, keyOfRoot(r));
        });
      }
    }

    walk(rootIdx || 0, '', 0, null);

    // union key → 對外名字。有標籤的用標籤；其餘照「路徑 + 第一隻腳」給穩定名字
    const membersOf = new Map();
    for (const [pk, k] of pinKeyOf) {
      const r = find(k);
      if (!membersOf.has(r)) membersOf.set(r, []);
      membersOf.get(r).push(pk);
    }
    const nameOf = new Map();
    for (const [r, mem] of membersOf) {
      let nm = '';
      for (const k of parent.keys()) if (find(k) === r && labelOf.has(k)) { nm = labelOf.get(k); break; }
      if (!nm) {
        const first = mem.slice().sort()[0];
        const at = first.lastIndexOf(':');
        nm = 'N$' + first.slice(0, at) + '.' + first.slice(at + 1);
      }
      nameOf.set(r, nm);
    }

    res.comps = comps;
    res.netCount = nameOf.size;
    res.netOf = (compId, pinIndex) => {
      const k = pinKeyOf.get(compId + ':' + pinIndex);
      if (k == null) return '';
      return nameOf.get(find(k)) || '';
    };
    return res;
  }

  return {
    PORT_DIRS, isPort, isInstance, portsOf, instancesOf, pageIndex, hasHierarchy, rootIndex,
    portsToPins, syncInstance, instanceStatus, cycles, validate, build, MAX_DEPTH
  };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = window.SchHier;
