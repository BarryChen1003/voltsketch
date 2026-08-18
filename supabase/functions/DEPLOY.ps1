# DEPLOY.ps1 — 部署 HardwareAI 金流 Edge Functions（create-order + ecpay-webhook）
# 交接 runbook：以下步驟需「你的 Supabase 帳號登入」，Claude 無法代做互動式登入。
# 直接在 PowerShell 逐段執行（或整檔跑，login 那步會開瀏覽器要你授權）。
#
# 前提：先跑完 sql/00-RUN-phaseA.sql（orders 表要先存在）。

$ErrorActionPreference = 'Stop'
$PROJECT_REF = 'dmkxjawjrmltmrmkebbs'   # 你的 Supabase 專案（auth-config.js 內公開值）

# 0) 取得 supabase CLI（未安裝就用 npx，免全域安裝）
function sb { npx --yes supabase @args }

# 1) 登入（互動式：會開瀏覽器，貼上授權碼）——只有你能做
sb login

# 2) 連結專案
sb link --project-ref $PROJECT_REF

# 3) 設綠界密鑰（secrets set＝輸入金鑰，依安全規則須由你執行，不由 Claude 代打）
#
# ⚠ ECPAY_MODE 是保險絲，不要省略：
#    sandbox（預設）→ 缺值時 fallback 綠界公開測試商店，只跑得動測試金流。
#    live           → 四個值缺一不可、不准是測試憑證、網址必須是正式站台，
#                     任一條不符就直接 throw。這是為了避免 secrets 掉了之後，
#                     真實客戶被安靜地送到沙盒付款頁（測試卡付得過 → 訂單標 paid
#                     → VIP 免費開通，而且整條路都不會噴錯）。
#    判斷邏輯：_shared/ecpay-config.mjs；測試：node ecpay-config.test.mjs（14 條）
#
# ---- 選項 A：綠界「官方公開測試」密鑰（安全、無真金流；先驗證整條流程用）----
sb secrets set `
  ECPAY_MODE=sandbox `
  ECPAY_MERCHANT_ID=2000132 `
  ECPAY_HASH_KEY=5294y06JbISpM5x9 `
  ECPAY_HASH_IV=v77hoKGq4kWxNNIS `
  ECPAY_ACTION_URL=https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5

# ---- 選項 B：正式密鑰（特約商店核准後，用你的實際值取代並改用正式網址）----
# 沙盒五項驗證沒過之前不要切這段。
# sb secrets set `
#   ECPAY_MODE=live `
#   ECPAY_MERCHANT_ID=<你的商店代號> `
#   ECPAY_HASH_KEY=<你的HashKey> `
#   ECPAY_HASH_IV=<你的HashIV> `
#   ECPAY_ACTION_URL=https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5

# 4) 部署兩個 function
#
# ⚠ ecpay-webhook 一定要帶 --no-verify-jwt。綠界是 server-to-server 通知，
#   不會帶 Authorization 標頭；沒關掉 JWT 驗證的話，每一筆付款通知都會被
#   Supabase 擋在我們的程式之前（401）。症狀是「錢收了、VIP 沒開通」，
#   而且函式 log 裡什麼都看不到——請求根本沒進到函式。
sb functions deploy create-order
sb functions deploy ecpay-webhook --no-verify-jwt

# 5) 驗證：到 upgrade.html 按方案 → 應被導到綠界測試付款頁；
#    測試卡：4311-9522-2222-2222，任一未過期年月，任一 3 碼 CVV。
#    付款後 orders.status 應由 pending → paid（ecpay-webhook 回填）。
Write-Host "部署流程完成。到 upgrade.html 實測一次付款流程。" -ForegroundColor Green
