/**
 * design-history.test.js — 專案變更歷史（design-history.js，node，不連網）
 *
 * 三個壞了不會馬上發現的地方：
 *   1. **清單有沒有把 sch/pcb 一起撈回來**。撈了就是「歷史面板一開就卡」，
 *      而且只有存到十幾版的人才會遇到。
 *   2. **淘汰有沒有刪到不該刪的**。使用者取過名的版本、以及別人的 parent，
 *      刪掉就是永久遺失，而且畫面上只會少一列，沒有任何提示。
 *   3. **每一次查詢有沒有帶 user_id**。RLS 是最後一道，前端漏帶等於把
 *      「別人的列存不存在」交給 policy 決定。
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

global.window = {};
const H = require('./design-history.js');

let pass = 0, fail = 0;
function eq(a, b, msg) {
  const okk = JSON.stringify(a) === JSON.stringify(b);
  if (okk) pass++; else { fail++; console.error(`FAIL ${msg}\n  expected ${JSON.stringify(b)}\n  got      ${JSON.stringify(a)}`); }
}
const ok = (v, msg) => eq(!!v, true, msg);

// 假 client：記下每一次查詢長什麼樣，才驗得到「有沒有帶 user_id」「有沒有撈 data」
function fakeClient(rows) {
  const calls = [];
  let store = (rows || []).slice();
  function q(table) {
    const st = { table, filters: {}, sel: '', order: null, op: '' };
    const self = {
      select(s) { st.sel = s; st.op = st.op || 'select'; return self; },
      eq(k, v) { st.filters[k] = v; return self; },
      in(k, v) { st.filters[k] = v; st.inKey = k; return self; },
      order(k, o) { st.order = [k, o]; return self; },
      insert(rec) { st.op = 'insert'; st.rec = rec; return self; },
      update(rec) { st.op = 'update'; st.rec = rec; return self; },
      delete() { st.op = 'delete'; return self; },
      maybeSingle() { calls.push(st); return Promise.resolve({ data: pick()[0] || null, error: null }); },
      single() {
        calls.push(st);
        if (st.op === 'insert') {
          const row = Object.assign({ id: 'v' + (store.length + 1), created_at: '2026-08-28T00:00:' + String(store.length).padStart(2, '0') + 'Z' }, st.rec);
          store.push(row);
          return Promise.resolve({ data: row, error: null });
        }
        return Promise.resolve({ data: pick()[0] || null, error: null });
      },
      then(res) { calls.push(st); return Promise.resolve(run()).then(res); }
    };
    function pick() {
      return store.filter(r => Object.keys(st.filters).every(k => {
        const v = st.filters[k];
        return Array.isArray(v) ? v.indexOf(r[k]) >= 0 : r[k] === v;
      }));
    }
    function run() {
      if (st.op === 'delete') { const hit = pick(); store = store.filter(r => hit.indexOf(r) < 0); return { data: null, error: null }; }
      if (st.op === 'update') { pick().forEach(r => Object.assign(r, st.rec)); return { data: null, error: null }; }
      let out = pick();
      if (st.order) out = out.slice().sort((a, b) => String(a[st.order[0]]).localeCompare(String(b[st.order[0]]))) ;
      if (st.order && st.order[1] && st.order[1].ascending === false) out = out.reverse();
      return { data: out, error: null };
    }
    return self;
  }
  return { from: q, _calls: calls, _rows: () => store };
}

const V = (id, o) => Object.assign({ id, user_id: 'u1', design_id: 'd1', parent_id: null, label: '', created_at: '2026-08-28T00:00:' + String(id).replace(/\D/g, '').padStart(2, '0') + 'Z' }, o || {});

// ---- 1. 標籤與大小 ----
{
  eq(H.normLabel('  收到板廠回覆前  '), '收到板廠回覆前', '1.1 去頭尾空白');
  eq(H.normLabel(''), '', '1.2 空字串是合法的（沒取名的檢查點）');
  eq(H.normLabel(null), '', '1.3 null');
  eq(H.normLabel('x'.repeat(200)).length, 60, '1.4 長度上限');
  eq(H.checkSize({ sch: { a: 1 } }).ok, true, '1.5 小的過');
  const big = { sch: { s: 'x'.repeat(3 * 1024 * 1024) } };
  eq(H.checkSize(big).err, 'version_too_large', '1.6 太大要擋');
  // 中文用 UTF-8 算，不是 .length
  ok(H.byteLen('中') === 3, '1.7 位元組長度用 UTF-8（用 .length 會低估到三分之一）');
}

// ---- 2. 淘汰：不該刪的不能刪 ----
{
  const rows = [];
  for (let i = 1; i <= 8; i++) rows.push(V('v' + i));
  eq(H.prune(rows, 20), [], '2.1 沒超過上限就不刪');
  eq(H.prune(rows, 5), ['v1', 'v2', 'v3'], '2.2 由舊到新淘汰到剩 5 個');

  // 取過名的不刪
  const named = rows.map(r => r.id === 'v2' ? V('v2', { label: '送廠前' }) : r);
  eq(H.prune(named, 5), ['v1', 'v3', 'v4'], '2.3 **取過名的跳過**（使用者特地留的）');

  // 是別人的 parent 的不刪
  const withChild = rows.map(r => r.id === 'v7' ? V('v7', { parent_id: 'v1' }) : r);
  eq(H.prune(withChild, 5), ['v2', 'v3', 'v4'], '2.4 **v1 是 v7 的來源，不刪**（刪了樹會斷）');

  // 最新的不刪
  eq(H.prune(rows, 1).indexOf('v8'), -1, '2.5 最新的那一版不刪');

  // 全部受保護就不刪 —— 寧可讓上限擋住新版，也不刪使用者標記過的
  const allNamed = rows.map(r => V(r.id, { label: 'keep' }));
  eq(H.prune(allNamed, 2), [], '2.6 全部有名字時一個都不刪');
  eq(H.prune([], 5), [], '2.7 空');
  eq(H.prune(null, 5), [], '2.8 null');
}

// ---- 3. 樹 ----
{
  const rows = [
    V('v1'),
    V('v2', { parent_id: 'v1' }),
    V('v3', { parent_id: 'v1' }),
    V('v4', { parent_id: 'v3' }),
    V('v5')
  ];
  const t = H.tree(rows);
  eq(t.map(n => n.id), ['v1', 'v2', 'v3', 'v4', 'v5'], '3.1 深度優先展平');
  const byId = {}; t.forEach(n => { byId[n.id] = n; });
  eq([byId.v1.depth, byId.v2.depth, byId.v3.depth, byId.v4.depth, byId.v5.depth], [0, 1, 1, 2, 0], '3.2 各節點深度');
  eq(byId.v1.children.map(c => c.id), ['v2', 'v3'], '3.3 子節點');

  // parent 已被淘汰的要當成根，**不可以整個丟掉**
  const orphan = [V('v9', { parent_id: 'gone' })];
  eq(H.tree(orphan).map(n => n.id), ['v9'], '3.4 來源被淘汰的版本仍要出現（丟掉＝從畫面上消失，但它其實還在）');
  eq(H.tree([]).length, 0, '3.5 空');
}

// ---- 4. 清單：不可以撈 sch/pcb，而且要帶 user_id ----
{
  const c = fakeClient([V('v1'), V('v2', { design_id: 'd2' })]);
  H._inject({ client: c, uid: 'u1' });
  return_list();
  async function return_list() {
    const rows = await H.list('d1');
    const call = c._calls[c._calls.length - 1];
    // 要求「明列欄位」而不只是「字串裡沒有 sch」：select('*') 同樣會把 data 撈回來，
    // 但字面上不含 'sch'，只比對字串的斷言抓不到（2026-08-28 mutation 測出來的）。
    ok(call.sel && call.sel.indexOf('*') < 0, '4.1 **清單不可以 select 全部欄位**');
    ok(call.sel.indexOf('sch') < 0 && call.sel.indexOf('pcb') < 0, '4.1b **也不可以明列 sch/pcb**（歷史面板一開就卡的成因）');
    ok(call.sel.indexOf('id') >= 0 && call.sel.indexOf('created_at') >= 0, '4.1c 但該有的欄位要在');
    eq(call.filters.user_id, 'u1', '4.2 **帶 user_id**（RLS 是最後一道，不是唯一一道）');
    eq(call.filters.design_id, 'd1', '4.3 只查這個專案');
    eq(rows.map(r => r.id), ['v1'], '4.4 別的專案的不回');
    afterList();
  }

  function afterList() {
    // 5. 存檔：大小檢查、parent、淘汰
    (async () => {
      const rows = [];
      for (let i = 1; i <= 20; i++) rows.push(V('v' + i));
      const c2 = fakeClient(rows);
      H._inject({ client: c2, uid: 'u1' });
      const r = await H.save('d1', { sch: { components: [] }, pcb: null, meta: { sc: 0 } }, '送廠前', 'v3');
      ok(!!r.id, '5.1 存得進去');
      const ins = c2._calls.find(x => x.op === 'insert');
      eq(ins.rec.user_id, 'u1', '5.2 寫入帶 user_id');
      eq(ins.rec.parent_id, 'v3', '5.3 **記下來源版本**（不記的話還原會讓中間幾版看起來憑空消失）');
      eq(ins.rec.label, '送廠前', '5.4 標籤');
      ok(r.pruned > 0, '5.5 超過上限要淘汰');

      // 載入才可以撈 data
      const c3 = fakeClient([V('v1', { sch: { a: 1 } })]);
      H._inject({ client: c3, uid: 'u1' });
      const one = await H.load('v1');
      const lcall = c3._calls[c3._calls.length - 1];
      ok(lcall.sel.indexOf('sch') >= 0, '5.6 載入單一版本才撈 data');
      eq(lcall.filters.user_id, 'u1', '5.7 載入也要帶 user_id');
      eq(one.id, 'v1', '5.8 拿得到');

      // 太大要在送出前就擋掉（省一次來回，訊息也講得清楚）
      H._inject({ client: fakeClient([]), uid: 'u1' });
      let threw = '';
      try { await H.save('d1', { sch: { s: 'x'.repeat(3 * 1024 * 1024) } }, '', null); }
      catch (e) { threw = e.message; }
      eq(threw, 'version_too_large', '5.9 太大要擋');

      // 沒登入
      H._inject({ client: null, uid: null });
      let t2 = '';
      try { await H.save('d1', {}, '', null); } catch (e) { t2 = e.message; }
      eq(t2, 'not_signed_in', '5.10 沒登入');
      eq(await H.list('d1'), [], '5.11 沒登入時清單是空的，不炸');
      eq(await H.load('v1'), null, '5.12 同理');

      // 6. 刪除與改名都要帶 user_id
      const c4 = fakeClient([V('v1')]);
      H._inject({ client: c4, uid: 'u1' });
      await H.remove('v1');
      const del = c4._calls.find(x => x.op === 'delete');
      eq(del.filters.user_id, 'u1', '6.1 刪除帶 user_id');
      eq(del.filters.id, 'v1', '6.2 只刪指定那一版');

      const c5 = fakeClient([V('v1')]);
      H._inject({ client: c5, uid: 'u1' });
      await H.rename('v1', '  改過的名字  ');
      const up = c5._calls.find(x => x.op === 'update');
      eq(up.filters.user_id, 'u1', '6.3 改名帶 user_id');
      eq(up.rec.label, '改過的名字', '6.4 改名會正規化');

      // 7. 錯誤訊息對得上
      eq(H.mapErr(new Error('version_too_large')), 'version_too_large', '7.1');
      eq(H.mapErr(new Error('new row violates row-level security policy')), 'version_denied', '7.2');
      eq(H.mapErr(null), 'version_failed', '7.3 未知錯誤有預設');

      console.log(`\ndesign-history.test: ${pass} passed, ${fail} failed`);
      process.exit(fail ? 1 : 0);
    })();
  }
}
