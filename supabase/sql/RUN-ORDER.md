# HardwareAI 後端 SQL 執行順序（交接 runbook）

> 由 Claude 整理 2026-07-21。全部檔案冪等（可重跑不壞）。

## Phase A — 分四次貼（2026-08-15 改）

**`00-RUN-phaseA.sql` 整份是 372 KB**（763 行，但面試題內嵌 SVG 讓單行極長），
貼進 Supabase SQL Editor 會卡住。已拆成四支，**照編號依序貼**：

| 檔 | 大小 | 內容 | 什麼時候要 |
|---|---|---|---|
| `01-core.sql` | 18 KB | profiles / 觀測 / orders / 額度 | **先跑這支就夠**——註冊→`owner-unlock` 的流程立刻可用 |
| `02-interview-i18n.sql` | 85 KB | 面試題 ja/ko 欄位＋譯文 | 要上面試題內容時。**必須在 04 之前** |
| `03-interview-pcb.sql` | 5 KB | PCB 面試題種子 | 同上 |
| `04-batch2-1of5.sql` ~ `5of5` | 各約 52 KB | 第二批面試題種子（原 `04-interview-batch2.sql` 257 KB **實測貼不下**，已拆成一題一檔） | 同上。依編號跑，**每支只跑一次**（重跑會產生重複題目） |

拆檔已驗證與原檔逐行一致（660 有效行對 660）。`00-RUN-phaseA.sql` 保留當備查，不要直接貼。

**踩過的坑**：把 Dashboard 的網址貼進查詢框會得到
`ERROR: 42601: syntax error at or near "https"`——網址是要在瀏覽器開的，
查詢框要貼的是 `.sql` **檔案裡的內容**。

原本 7 段的相依順序（拆檔已照這個順序切）：

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

## 貼不進 SQL Editor 的檔案（2026-08-15 實測）

面試題的種子與修圖 SQL 都內嵌 SVG，單行動輒 20–50 KB，整檔貼進 Supabase SQL Editor 會被截斷，
症狀是 `ERROR: 42601: syntax error at end of input`（語句沒收尾）。已拆成小檔，**用拆檔不要用原檔**：

| 原檔 | 大小 | 改用 |
|---|---|---|
| `04-interview-batch2.sql` | 257 KB | `04-batch2-1of5.sql` ~ `5of5`（各約 52 KB，**每支只跑一次**，重跑會重複題目） |
| `interview-flyback-fix.sql` | 109 KB | `flyback-fix-1of5.sql` ~ `5of5`（各約 22 KB，**冪等可重跑**，這是 update 不是 insert） |

拆檔都逐字驗證過與原檔一致。原檔保留當備查。

跳出「Potential issue detected / without enabling RLS」一律按 **Run without RLS**：
這些檔只有 insert/update，沒有建表，`interview_questions` 的 RLS 在 `01-core.sql` 就開好了。
Supabase 的檢查器會把 SQL 裡的英文單字誤判成表名（看過它說表名叫 `the`）。
