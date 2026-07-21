# HardwareAI 後端 SQL 執行順序（交接 runbook）

> 由 Claude 整理 2026-07-21。全部檔案冪等（可重跑不壞）。

## Phase A — 現在就跑（一次貼上）

到 **Supabase Dashboard → SQL Editor**，把 **`00-RUN-phaseA.sql`** 整份貼上 → Run。
它已依相依順序串好這 7 段：

| 順序 | 段落 | 建立什麼 |
|---|---|---|
| 1 | supabase-schema.sql | `profiles`、`interview_questions`、`is_admin()`、註冊自動建 profile 的 trigger、RLS |
| 2 | supabase-observability.sql | `error_logs`、`page_views`（前端 observe.js 寫入目標）、admin 彙總 view |
| 3 | payment.sql | `orders`（金流訂單，create-order Function 寫入） |
| 4 | export-quota.sql | `user_plans`、`export_usage`（匯出額度） |
| 5 | interview-i18n.sql | 給 `interview_questions` 加 ja/ko 欄位（**必須在 batch2 之前**） |
| 6 | interview-pcb.sql | PCB 面試題種子 |
| 7 | interview-batch2.sql | 第二批面試題種子（用到 ja/ko 欄，故排在 i18n 後） |

跑完不需要逐檔再跑；單檔留著只為日後單獨維護。

## Phase B — 你「在網站註冊過一次」之後才跑

`owner-unlock.sql`（**建議用這支**，非 owner-grant）：
- 它會 `email_confirmed_at = now()` **手動確認站主信箱** → 站主不必等驗證信即可登入（**繞過 SMTP，站主自己不卡 item 1**）。
- 設 `role='admin'` + 全解鎖 + 匯出額度 9999。

前提：`auth.users` 要先有站主那一列 → 你得先在網站按一次「註冊」（即使驗證信沒到，帳號列也會建立）。

### ⚠️ 要你確認的一點（我沒擅自改）
`owner-unlock.sql` / `owner-grant.sql` 內寫的信箱是 **`smallshark1003@gmail.com`**，
但你的系統帳號是 **`barry871003@gmail.com`**。跑之前二選一：
- 若站主帳號就是 `smallshark1003@gmail.com` → 用該信箱註冊，直接跑。
- 若要用 `barry871003@gmail.com` → 先把這兩檔內的信箱改掉再跑。

`owner-grant.sql` 與 `owner-unlock.sql` 功能重疊；跑 `owner-unlock` 即可，不必兩支都跑。

## 驗證（Phase B 跑完，各應回 1 列）
```sql
select u.email, u.email_confirmed_at, p.role, p.interview_paid, p.pcb_access
  from auth.users u join public.profiles p on p.id = u.id
 where u.email = '<你註冊的信箱>';
```

## 之後看觀測資料（你已是 admin）
```sql
select * from public.error_summary;     -- 近 7 天前端錯誤（合併計數）
select * from public.pageview_summary;  -- 近 7 天各頁瀏覽/session
```
