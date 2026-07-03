# 匯出額度閘門設定（export quota）

免費版每人每月每格式 3 次匯出；VIP 由 `user_plans.monthly_export_limit` 控制（月/半年付 100、年付實質不限且 unlock_all 全解鎖）。方案過期自動回落 free(3)。
未設定 Supabase 時網站為本機 demo 模式：匯出不限次數、不擋。

## 架構（誰擋、擋在哪）

```
匯出鈕 → vs-adapters.exportIC()
       → window.ExportGate.consume(格式)      ← export-gate.js（介面層）
       → Supabase RPC consume_export_quota    ← 真正的閘門（原子扣額、FOR UPDATE）
       → 允許才產檔下載
```

- 限制核心在 **Postgres RPC + RLS**，不在前端 —— 改前端 JS 只能跳過「介面」，RPC 不給 allowed 就沒有已授權結果。
- `month_key` 由伺服器 `to_char(now(),'YYYY-MM')` 計算，**不收 client 參數**（否則傳未來月份就能重置額度）。
- `export_usage` / `user_plans` 對 client 只讀（RLS 無 insert/update policy）。
- 之後要更嚴：把檔案生成搬進 `export-gateway` Edge Function，前端只拿一次性下載結果。

## 啟用步驟

1. Supabase Dashboard → SQL Editor → 貼上執行 `supabase/sql/export-quota.sql`（冪等可重跑）。
2. `auth-config.js` 填 Project URL + anon key（service_role **絕不**放前端）。
3. （選用）部署 Edge Function：`supabase functions deploy export-gateway`。
4. 驗證：
   - 未登入 → 按匯出 → 顯示「請先登入才能匯出」。
   - 登入 free → 匯出 3 次後 → 「已達本月匯出上限」。
   - SQL Editor 查 `select * from export_usage;` count 正確、兩分頁同按不超扣。

## VIP 升級（金流接上後）

金流 webhook（驗簽通過）→ service_role 更新：

```sql
insert into user_plans (user_id, plan, monthly_export_limit)
values ('<uid>', 'vip', 100)
on conflict (user_id) do update set plan='vip', monthly_export_limit=100, updated_at=now();
```

## 每月歸零？

不需要。`month_key` 換月自動新起一列。舊資料清理見 SQL 檔尾的 pg_cron 範例（保留 12 個月）。
