/**
 * designs.test.js — 雲端多專案存檔驗證（node，不連網）
 *
 * 這支盯三個最容易壞、壞了又不會馬上發現的地方：
 *   1. 清單有沒有把 sch/pcb 一起撈回來（撈了就是「開清單很卡」的成因，
 *      而且平常只有幾個專案時完全看不出來，等使用者存到 20 個才爆）。
 *   2. 只存板子時會不會把線路圖清成 null（資料遺失，而且是靜默的）。
 *   3. 每一次查詢有沒有帶 user_id 過濾。RLS 是最後一道，但前端漏帶就等於
 *      把「別人的列」的存在與否交給 policy 決定——policy 改錯一次就全開。
 *
 * 過 = exit 0；任何失敗 = exit 1。
 */
'use strict';

// localStorage 只給 currentId/setCurrent 用。後面有一節會把它拆掉，
// 驗證「localStorage 被停用時整站照樣運作」——無痕視窗與企業原則下真的會這樣。
global.localStorage = {
  _d: {}, _off: false,
  getItem(k) { if (this._off) throw new Error('denied'); return this._d[k] ?? null; },
  setItem(k, v) { if (this._off) throw new Error('denied'); this._d[k] = String(v); },
  removeItem(k) { if (this._off) throw new Error('denied'); delete this._d[k]; },
};
global.window = { localStorage: global.localStorage };
require('./designs.js');
const D = window.Designs;

let pass = 0, fail = 0;
function eq(a, b, msg) {
  const ok = JSON.stringify(a) === JSON.stringify(b);
  if (ok) { pass++; } else { fail++; console.error(`FAIL ${msg}\n  expected ${JSON.stringify(b)}\n  got      ${JSON.stringify(a)}`); }
}
function ok(v, msg) { eq(!!v, true, msg); }
async function throws(fn, want, msg) {
  try { await fn(); fail++; console.error(`FAIL ${msg}（沒有丟錯）`); }
  catch (e) { eq(String(e.message), want, msg); }
}

// ---- 假 supabase client ----
// 只實作 designs.js 真正用到的鏈式呼叫。每一次查詢都把用過的欄位與過濾條件
// 記進 calls，測試才驗得到「有沒有撈 data」「有沒有帶 user_id」。
function fakeDb(rows, opts) {
  const o = opts || {};
  const calls = [];
  const match = (r, filters) => filters.every(f => String(r[f[0]]) === String(f[1]));

  function builder(op, payload) {
    const st = { op, payload, cols: null, filters: [], count: null, head: false };
    const rec = extra => calls.push(Object.assign({ op: st.op, cols: st.cols, filters: st.filters.slice() }, extra || {}));
    const run = () => {
      if (st.op === 'select') {
        const hit = rows.filter(r => match(r, st.filters));
        rec({ head: st.head });
        if (st.head) return { data: null, count: hit.length, error: null };
        // 只回被 select 的欄位——真的 PostgREST 就是這樣，
        // 前端漏了欄位會拿到 undefined 而不是悄悄拿到全部
        const cols = String(st.cols || '').split(',').map(s => s.trim()).filter(Boolean);
        return { data: hit.map(r => { const x = {}; for (const c of cols) x[c] = r[c]; return x; }), count: hit.length, error: null };
      }
      if (st.op === 'insert') {
        rec();
        if (o.insertError) return { data: null, error: { message: o.insertError } };
        const row = Object.assign({ id: 'id' + (rows.length + 1), updated_at: new Date().toISOString() }, st.payload);
        rows.push(row);
        return { data: row, error: null };
      }
      if (st.op === 'update') {
        rec({ payload: st.payload });
        const hit = rows.filter(r => match(r, st.filters));
        hit.forEach(r => Object.assign(r, st.payload, { updated_at: new Date().toISOString() }));
        return { data: hit, error: null };
      }
      if (st.op === 'delete') {
        rec();
        for (let i = rows.length - 1; i >= 0; i--) if (match(rows[i], st.filters)) rows.splice(i, 1);
        return { data: null, error: null };
      }
      return { data: null, error: { message: 'unsupported' } };
    };
    const api = {
      select(cols, opt) { st.cols = cols; if (opt && opt.head) st.head = true; return api; },
      eq(k, v) { st.filters.push([k, v]); return api; },
      order() { return api; },
      maybeSingle() { const r = run(); return Promise.resolve({ data: (r.data || [])[0] || null, error: r.error }); },
      single() { const r = run(); return Promise.resolve({ data: Array.isArray(r.data) ? r.data[0] : r.data, error: r.error }); },
      then(res, rej) { return Promise.resolve(run()).then(res, rej); },
    };
    return api;
  }

  return {
    calls,
    rows,
    from() {
      return {
        select(cols, opt) { return builder('select').select(cols, opt); },
        insert(row) { return builder('insert', row); },
        update(row) { return builder('update', row); },
        delete() { return builder('delete'); },
      };
    },
  };
}

(async () => {
  // ---- 1. 純函式 ----
  eq(D.normName('   '), 'Untitled', '1.1 空名稱給預設名');
  eq(D.normName('  my board  '), 'my board', '1.2 前後空白去掉');
  eq(D.normName('x'.repeat(80)).length, 60, '1.3 名稱截到 60');
  eq(D.normName('a\u0000b\u001fc'), 'a b c', '1.4 控制字元換成空白');
  eq(D.normName('A-B (v2) #1'), 'A-B (v2) #1', '1.5 一般標點不能被吃掉');

  eq(D.byteLen('中文'), 6, '2.1 UTF-8 中文 3 bytes/字');
  eq(D.byteLen(null), 0, '2.2 null 算 0');
  eq(D.byteLen({ a: 1 }), 7, '2.3 物件算序列化後長度');

  ok(D.checkSize({ sch: { a: 1 } }).ok, '3.1 小專案過');
  const big = { components: [{ pad: 'x'.repeat(1024 * 1024) }, { pad: 'y'.repeat(1024 * 1024) }] };
  eq(D.checkSize({ pcb: big }).ok, false, '3.2 超過 2MB 擋下');
  eq(D.checkSize({ pcb: big }).err, 'design_too_large', '3.3 錯誤碼正確');

  eq(D.metaOf({ components: [1, 2], wires: [1] }, { components: [1], traces: [1, 2, 3] }),
    { sc: 2, sw: 1, pc: 1, pt: 3 }, '4.1 meta 計數');
  eq(D.metaOf(null, null), { sc: 0, sw: 0, pc: 0, pt: 0 }, '4.2 空專案 meta 不炸');
  eq(D.hasPcb({ sc: 5, pc: 0, pt: 0 }), false, '4.3 只有線路圖時 hasPcb=false');

  eq(D.mapErr({ message: 'design_limit_reached' }), 'design_limit_reached', '5.1 上限錯誤');
  eq(D.mapErr({ message: 'new row violates row-level security policy' }), 'design_denied', '5.2 RLS 錯誤');

  eq(D.sortList([{ updated_at: '2026-01-01' }, { updated_at: '2026-08-01' }]).map(r => r.updated_at),
    ['2026-08-01', '2026-01-01'], '6.1 新的排前面');

  // ---- 2. 清單（最重要的一條）----
  const db = fakeDb([
    { id: 'a', user_id: 'u1', name: '板 A', sch: { components: [1] }, pcb: { traces: [1, 2] }, meta: { sc: 1, pt: 2 }, updated_at: '2026-08-01' },
    { id: 'b', user_id: 'u1', name: '板 B', sch: null, pcb: { traces: [1] }, meta: { pt: 1 }, updated_at: '2026-08-26' },
    { id: 'c', user_id: 'u2', name: '別人的', sch: null, pcb: null, meta: {}, updated_at: '2026-08-27' },
  ]);
  D._inject({ client: db, uid: 'u1' });

  const l = await D.list();
  eq(l.map(r => r.id), ['b', 'a'], '7.1 清單依 updated_at 新到舊');
  eq(l.length, 2, '7.2 只回自己的列');
  const listCall = db.calls.find(c => c.op === 'select');
  ok(!/sch|pcb/.test(String(listCall.cols)), '7.3 清單「不可以」select sch/pcb（撈了就是那個卡）');
  eq(listCall.cols, 'id,name,meta,updated_at', '7.4 清單欄位固定這四個');
  ok(listCall.filters.some(f => f[0] === 'user_id'), '7.5 清單有帶 user_id 過濾');
  eq(l[0].hasPcb, true, '7.6 hasPcb 由 meta 推出，不必撈 data');
  eq(l[0].hasSch, false, '7.7 hasSch 由 meta 推出');
  eq(l[1].sch, undefined, '7.8 清單結果不含 sch 欄位');

  // ---- 3. 讀取單一專案才撈 data ----
  db.calls.length = 0;
  const one = await D.load('a');
  eq(one.name, '板 A', '8.1 load 回得到名稱');
  eq(one.pcb, { traces: [1, 2] }, '8.2 load 才帶 pcb');
  ok(/sch/.test(String(db.calls[0].cols)) && /pcb/.test(String(db.calls[0].cols)), '8.3 load 有 select sch/pcb');
  ok(db.calls[0].filters.some(f => f[0] === 'user_id'), '8.4 load 有帶 user_id');

  // ---- 4. 存檔不可以清掉另一半 ----
  db.calls.length = 0;
  await D.save('a', { pcb: { traces: [9, 9, 9] } });
  const rowA = db.rows.find(r => r.id === 'a');
  eq(rowA.pcb, { traces: [9, 9, 9] }, '9.1 pcb 更新了');
  eq(rowA.sch, { components: [1] }, '9.2 只存板子「不可以」把線路圖清成 null');
  eq(rowA.meta, { sc: 1, sw: 0, pc: 0, pt: 3 }, '9.3 meta 一起更新');
  const upd = db.calls.find(c => c.op === 'update');
  ok(upd.filters.some(f => f[0] === 'user_id'), '9.4 update 有帶 user_id');
  ok(upd.filters.some(f => f[0] === 'id'), '9.5 update 有帶 id');
  ok(!('name' in upd.payload), '9.6 沒傳 name 就不要動 name');

  await D.save('a', { name: '改名了' });
  eq(db.rows.find(r => r.id === 'a').name, '改名了', '9.7 有傳 name 才改名');
  eq(db.rows.find(r => r.id === 'a').pcb, { traces: [9, 9, 9] }, '9.8 改名不動板子');

  await throws(() => D.save(null, { pcb: {} }), 'design_no_id', '9.9 沒有 id 要擋');
  await throws(() => D.save('a', { pcb: big }), 'design_too_large', '9.10 存過大要擋');

  // ---- 5. 新建與上限 ----
  db.calls.length = 0;
  const made = await D.create('新板', null, { traces: [1] });
  ok(made && made.id, '10.1 create 回傳 id');
  eq(db.rows.filter(r => r.user_id === 'u1').length, 3, '10.2 列數增加');
  const ins = db.calls.find(c => c.op === 'insert');
  ok(db.calls.some(c => c.op === 'select' && c.head), '10.3 新建前先用 head count 問數量（不撈資料）');
  eq(ins.filters.length, 0, '10.4 insert 不需要 filter');

  const full = fakeDb(Array.from({ length: 20 }, (_, i) => ({ id: 'x' + i, user_id: 'u1', meta: {}, updated_at: '2026-01-01' })));
  D._inject({ client: full, uid: 'u1' });
  await throws(() => D.create('第 21 個', null, {}), 'design_limit_reached', '10.5 滿 20 個要擋');
  eq(full.rows.length, 20, '10.6 被擋下就不可以真的寫進去');
  await throws(() => D.create('太大', null, big), 'design_too_large', '10.7 過大在送出前就擋');

  // ---- 6. 未登入 ----
  D._inject({ client: db, uid: () => null });
  eq(await D.list(), [], '11.1 未登入清單回空陣列，不丟錯');
  eq(await D.load('a'), null, '11.2 未登入 load 回 null');
  await throws(() => D.create('x'), 'design_signin', '11.3 未登入 create 要丟 design_signin');
  await throws(() => D.remove('a'), 'design_signin', '11.4 未登入 remove 要丟 design_signin');

  // ---- 7. 刪除 ----
  D._inject({ client: db, uid: 'u1' });
  db.calls.length = 0;
  await D.remove('a');
  eq(db.rows.some(r => r.id === 'a'), false, '12.1 刪掉了');
  eq(db.rows.some(r => r.id === 'c'), true, '12.2 別人的列還在');
  const del = db.calls.find(c => c.op === 'delete');
  ok(del.filters.some(f => f[0] === 'user_id'), '12.3 delete 有帶 user_id（漏了就靠 RLS 一道）');

  // ---- 8. 目前專案指標（線路圖頁與 PCB 頁共用同一個 key）----
  eq(D.currentId(), null, '13.1 一開始沒有連結專案');
  eq(D.setCurrent('abc'), 'abc', '13.2 setCurrent 回傳設好的 id');
  eq(D.currentId(), 'abc', '13.3 讀得回來');
  eq(localStorage._d['vs-design-id'], 'abc', '13.4 用的是 vs-design-id 這個 key（兩頁靠它對齊）');
  eq(D.setCurrent(null), null, '13.5 清掉');
  eq(D.currentId(), null, '13.6 清掉之後讀回 null');

  // localStorage 被停用（無痕/企業原則）時不可以讓編輯器爆掉
  localStorage._off = true;
  eq(D.currentId(), null, '13.7 localStorage 拋錯時 currentId 回 null，不往外丟');
  eq(D.setCurrent('zzz'), 'zzz', '13.8 localStorage 拋錯時 setCurrent 仍回傳值，不往外丟');
  localStorage._off = false;

  console.log(`\ndesigns.test: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
