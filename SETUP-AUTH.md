# 後端帳號系統設定（Supabase 免費）

App 沒設定金鑰時是「本機 demo」（只用 localStorage）。要啟用真正登入/雲端存檔/真權限鎖，照以下做。

## 1. 開專案、拿金鑰
1. 到 https://supabase.com 註冊、建立 free 專案。
2. Project Settings → API：複製 **Project URL** 與 **anon public** key。
3. 編輯 `auth-config.js`，把 `url` / `anonKey` 填進去。
   - ✅ 只放 **anon（公開）** 金鑰。
   - ❌ **service_role** 金鑰絕對不可放前端（它能繞過所有權限）。

## 2. 開 Email / Google 登入
- Authentication → Providers：開 **Email**（可設需信箱驗證）。
- Google：在 Google Cloud 建 OAuth client，把 client id/secret 填進 Supabase Google provider，Authorized redirect 用 Supabase 給的 callback URL。

## 3. 建表 + RLS（一次完成）
SQL Editor 貼上整份 **`supabase-schema.sql`** 執行。它會建立：
- `projects`（雲端存檔）、`profiles`（權限/角色）、`interview_questions`（題庫，內容只存後端）
- **RLS 全開**：使用者只能讀自己的資料；`interview_questions` 只有 `interview_paid`/admin 才 SELECT 得到列
- 防遞迴的 `is_admin()/has_interview()/has_pcb()`、註冊自動建 profile 的 trigger、5 題種子

> ★ 安全核心：`pcb_access / interview_paid / role` 前端**改不了**（只有 admin policy 或金流後端能寫）→ 才是真鎖。沒 RLS = anon 金鑰讓任何人讀全部。

## 4. 設定 admin、授權帳號
SQL Editor 執行（email 換成你的）：
```sql
-- 設自己為 admin（可管題庫、授權他人）
update public.profiles set role='admin'
  where id = (select id from auth.users where email='barry871003@gmail.com');
-- 給某帳號解鎖
update public.profiles set interview_paid=true, pcb_access=true
  where id = (select id from auth.users where email='someone@example.com');
```
未來幾位 admin 同理設 `role='admin'`。付費上線後改由**金流 webhook（service_role）**設 `interview_paid=true`。

## 5. 面試題庫怎麼運作（真鎖）+ 匯入題目
- 題目存在後端 `interview_questions`，**前端 JS 不含題目**（雙語：question/answer=繁中、question_en/answer_en=英文）。
- `interview.html` 登入後呼叫 `Auth.getInterviewQuestions()`；RLS 擋掉未付費帳號 → 拿到空、看不到題。
- **匯入初始題庫**：跑完 `supabase-schema.sql` 後，到 SQL Editor 貼上 **`interview-questions-seed.sql`** 執行（27 題，從 hw-engineer-pro.html 自動抽取）。
- 重新產生 seed（之後擴增題庫）：`node tools/extract-questions.js` → 會更新 `interview-questions-seed.sql`。
- 改/加題：admin 帳號或 Supabase dashboard 編 `interview_questions` 列，**即時生效、免重新部署**。

## 6. PCB 進階精算（部分運算後端化）
完整 IPC-2221 逐條走線載流量精算放在 **Edge Function `pcb-thermal`**（程式碼只在伺服器，前端讀不到）。
```bash
# 安裝 supabase CLI 後，在專案根目錄：
supabase functions deploy pcb-thermal
```
- 前端 `pcb.js` 的「熱估算」：登入且 `pcb_access` → 呼叫後端拿精算；否則本機只給「簡估」+ 解鎖提示。
- PCB 工具骨架是前端程式碼、無法完全隱藏；此設計把「精算演算法」鎖到後端，未授權拿不到精算結果。

## 7. 驗證
填好金鑰後重整 → 右上「登入」進 login.html；登入後出現「☁同步」「登出」與 email。
- 未授權帳號開 interview.html → 顯示「未解鎖」、拿不到題。
- 設 `interview_paid=true` 後重整 → 看得到完整題庫。
- 設 `pcb_access=true` 後 PCB 熱估算 → 出現「Tj 精算」與逐條走線載流量。


## Google OAuth 登入（免費）

login.html 已有「使用 Google 登入」鈕（auth.js `oauth('google')`）。啟用只要設定，兩邊都免費：

1. **Google Cloud Console**（console.cloud.google.com）→ 建專案 → APIs & Services → OAuth consent screen（External、填 App 名稱）→ Credentials → Create OAuth client ID（Web application）。
2. Authorized redirect URI 填 Supabase 的 callback：
   `https://<你的專案>.supabase.co/auth/v1/callback`
3. 得到 Client ID / Client Secret → Supabase Dashboard → Authentication → Providers → Google → 貼上並 Enable。
4. 完成。本機測試需把網站網址加進 Supabase Authentication → URL Configuration 的 Redirect URLs。

## 手機簡訊 OTP — 成本評估（結論：先不做）

| 方案 | 費用 | 備註 |
|---|---|---|
| Supabase Phone Auth + Twilio | 簡訊按條計費（台灣約 NT$2~2.5/條）+ Twilio 門號月費 | 無免費額度足以營運 |
| + Vonage / MessageBird | 類似，按條計費 | 同上 |
| Email + Google OAuth | **NT$0** | Supabase 內建（Email 驗證信免費額度內）|

**建議**：免費路線＝Email + Google 二擇一註冊（皆已就緒）。手機 OTP 等有營收再開（Twilio 掛上即用，login.html 預留擴充點）。

## 站主全權限（owner）

1. 站主用 smallshark1003@gmail.com 在網站註冊/登入一次（讓 auth.users 有這列）。
2. Supabase SQL Editor 執行 `supabase/sql/owner-grant.sql`。
3. 效果：profiles.role=admin（面試題/PCB RLS 全通、plan.js unlockAll）+ user_plans 匯出 9999 次、永不過期。
4. 上線前本機/demo 預覽：任一頁網址帶 `?unlock=1` 全開（`?lock=1` 恢復鎖定）。
