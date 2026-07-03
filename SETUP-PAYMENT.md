# 金流設定（綠界 ECPay）

方案（2026-07-03 定版）：

| 方案代號 | 金額 | 期限 | 內容 |
|---|---|---|---|
| `vip_1m`  | NT$300  | 1 個月  | 知識庫付費主題（每月上新）+ 匯出 30 次/月 |
| `vip_3m`  | NT$750  | 3 個月  | 同上（250/月） |
| `vip_6m`  | NT$1500 | 6 個月  | 同上（250/月） |
| `vip_12m` | NT$3300 | 12 個月 | 同上 + **面試題庫**（interview_paid）+ **PCB 權限**（pcb_access，unlock_all） |

免費版：匯出 3 次/月、知識庫付費主題鎖定、面試題僅 2 題試閱。方案有 `plan_expires_at`，過期自動回落 free(3 次)。
改價格：`create-order/index.ts` 的 `PLANS` + `ecpay-webhook/index.ts` 的 `PLAN_RULES` **兩處同步**（後端唯一真相，前端只送方案代號）。
站主帳號：見 `supabase/sql/owner-grant.sql`（註冊後執行一次，全權限）。

## 流程

```
upgrade.html 按付款
→ Edge Function create-order（驗 JWT、後端定金額、寫 orders(pending)、算 CheckMacValue）
→ 前端組 form POST 到綠界 AioCheckOut
→ 使用者在綠界付款
→ 綠界 server-to-server POST ecpay-webhook
   → 驗 CheckMacValue（擋偽造）
   → 核對 orders：trade_no 存在、金額一致、未入帳（擋重放/改價）
   → service_role 更新 orders=paid + user_plans=VIP
→ 使用者回站（ClientBackURL），額度即時生效
```

## 部署步驟（從零到收款，完整順序）

0. 前置（一次性）：
   - 建 Supabase 專案（免費層即可起步）→ 取得 Project URL + anon key 填入 `auth-config.js`。
   - SQL Editor 依序執行：`supabase-schema.sql`（profiles/面試題/RLS）→ `supabase/sql/export-quota.sql`（額度）→ `supabase/sql/payment.sql`（orders 表）。
   - 站主註冊帳號後執行 `supabase/sql/owner-grant.sql`（全權限）。
   - 申請綠界特約商店（正式收款需公司行號或個人賣家方案；沙盒不用申請）。
2. 部署 Functions：
   ```
   supabase functions deploy create-order
   supabase functions deploy ecpay-webhook --no-verify-jwt   # 綠界不帶 JWT，必須關驗證
   ```
3. 金鑰（正式環境；沙盒可不設，程式 fallback 綠界官方公開測試商店 2000132）：
   ```
   supabase secrets set ECPAY_MERCHANT_ID=xxxxxxx
   supabase secrets set ECPAY_HASH_KEY=xxxxxxxx
   supabase secrets set ECPAY_HASH_IV=xxxxxxxx
   supabase secrets set ECPAY_ACTION_URL=https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5
   ```
   金鑰**只放 Supabase secrets**，不進前端、不進 git。

## 沙盒測試（上正式前必做）

1. 用綠界測試環境（程式預設 `payment-stage.ecpay.com.tw` + 測試商店 2000132）。
2. upgrade.html → 付款 → 綠界測試頁用測試卡號（見綠界文件）完成付款。
3. 確認：
   - `orders.status` 變 `paid`、`ecpay_trade_no` 有值。
   - `user_plans` 出現該使用者 `vip_1m / 30`。
   - ic-library 匯出訊息顯示「本月剩 29 次」。
   - 用假資料 POST webhook（錯的 CheckMacValue）→ 回 `0|CheckMacValue Error`、不入帳。
   - 同一筆通知重送 → 回 `1|OK` 但不重複入帳（冪等）。

## 注意

- CheckMacValue 為 SHA256（EncryptType=1），演算法在 `functions/_shared/ecpay.ts`；
  沙盒實測是最終驗證，若比對失敗先檢查參數是否含未排序/多餘欄位。
- 目前為單次購買開通（月費概念）。要自動扣款（定期定額）需申請綠界定期定額服務，另接 `SpCheckOut`。
- 退款/爭議處理在綠界後台操作；`orders` 表保留對帳紀錄。
