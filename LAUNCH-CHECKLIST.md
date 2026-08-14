# HardwareAI 上線交接清單（1 → 3 → 2）

> Claude 已把每項的手動步驟壓到最少（貼一次 / 按幾下）。
> 這三項都需要**你的 Supabase 帳號登入或外部帳號憑證**，依安全規則 Claude 不代做
> （不建帳號、不輸入密碼/金鑰）。每項都附「你要做的動作」與現成檔案。

> ⚠️ **相依提醒**：若要實測 item 3 的付款流程，`orders` 等表要先存在 →
> 需先跑 item 2 的 **Phase A SQL**。所以實務順序建議 **1 → 2(Phase A) → 3**；
> 但下面仍照你指定的 1 → 3 → 2 呈現，照做無妨，只是 item 3 實測前補跑 Phase A 即可。

---

## ① SMTP（Resend）— 最硬的門
真實用戶收不到驗證信就無法註冊。
- 檔案：[`supabase/email-templates/SMTP-SETUP.md`](supabase/email-templates/SMTP-SETUP.md)（逐步）
  ＋ `confirm-signup.html`、`reset-password.html`（品牌信件模板，貼進 Supabase）
- 你要做：Resend 註冊拿 SMTP 憑證 → Supabase Auth 填 SMTP → 貼兩個模板 → 寄測試信。
- 站主自己不必等這步（Phase B 的 owner-unlock 會手動確認站主信箱）。

## ⚠️ 上線前必改（2026-08-06 加）
- ✅ 2026-08-14 已改：`privacy.html` / `terms.html` 的聯絡信箱改成 `smallshark1003@gmail.com`，
  四語譯文同步、「（上線前請換成實際信箱）」的提示（`ui_mail_todo`）已整條移除。
- ✅ 2026-08-14 已確認：站主信箱就是 `owner-unlock.sql` 裡的 `smallshark1003@gmail.com`
  （系統帳號 `barry871003@gmail.com` 只是登入 Claude 用的，與站主帳號無關）。
- **法律頁的英日韓版沒有法務看過**：那是使用者按同意時所同意的內容，上線前值得找人審。
- **`ECPAY_MODE` 一定要設**（見 item ③）：切正式金鑰時忘了改成 `live`，等於保險絲沒裝。

## ③ 部署金流 Edge Functions
前後端都寫好了（upgrade.html 已串、create-order/ecpay-webhook/_shared 齊全），只差部署。
- 檔案：[`supabase/functions/DEPLOY.ps1`](supabase/functions/DEPLOY.ps1)（逐段執行）
- 你要做：`supabase login`（互動式，只有你能做）→ link → `secrets set` 綠界密鑰 → `functions deploy` ×2。
- 綠界密鑰：腳本預設「官方**公開測試**密鑰」可立即端到端驗證流程；正式密鑰待特約商店核准後換上（腳本內選項 B）。
- **`ECPAY_MODE` 保險絲（2026-08-06 補）**：原本四個綠界設定值都有沙盒 fallback，
  secrets 掉了或變數名打錯會**安靜地**把真實客戶送到沙盒付款頁——測試卡付得過、
  webhook 用沙盒 HashKey 驗章也過、訂單標 paid、VIP 免費開通，整條路不噴錯。
  現在 `ECPAY_MODE=live` 時缺值／用測試憑證／網址不是正式站台一律 throw。
  邏輯在 `_shared/ecpay-config.mjs`，測試 `node ecpay-config.test.mjs`（14 條，CI 有跑）。
- ⚠ **`.mjs` 在 Supabase edge runtime 的載入尚未實測**（本機沒裝 Deno）。
  第一次 `functions deploy` 後先打一次 create-order 確認 function 起得來——
  若不相容會在部署當下就失敗，不會靜默。
- 實測前提：先跑 item 2 Phase A（orders 表）。

## ② 跑後端 SQL
- 檔案：[`supabase/sql/RUN-ORDER.md`](supabase/sql/RUN-ORDER.md)（順序說明）
  ＋ [`supabase/sql/00-RUN-phaseA.sql`](supabase/sql/00-RUN-phaseA.sql)（**整份貼一次**建好 7 段表）
- 你要做：
  - **Phase A**：SQL Editor 貼 `00-RUN-phaseA.sql` → Run（建 profiles/observability/orders/quota/面試題）。
  - **Phase B**：你在網站註冊過一次後，跑 `owner-unlock.sql`（設站主 admin＋手動確認信箱）。
- ⚠️ owner-unlock/grant 內信箱是 `smallshark1003@gmail.com`，與你系統帳號 `barry871003@gmail.com` 不同 —
  跑前確認要用哪個信箱（見 RUN-ORDER.md）。

---

## 其餘上線項（先前已交接，未變）
- 註冊網域 hardwareai.app → canonical/og:url 仍指 github.io 舊址，遷移時一起改。
- repo secret `SUPABASE_DB_URL` → 啟用 backup.yml 自動備份（見 backup-supabase.ps1）。
- 綠界特約商店送件（正式收款；審核查退款政策，已補進 terms.html ✅）。
- D1 資安總檢（你說了才做）。

## 觀測資料（你設成 admin 後）
```sql
select * from public.error_summary;     -- 近 7 天前端錯誤
select * from public.pageview_summary;  -- 近 7 天各頁流量
```
