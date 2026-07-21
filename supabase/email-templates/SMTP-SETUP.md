# item 1 — 接自訂 SMTP（Resend）+ 套用信件模板

> 這是最硬的上線門：Supabase 內建郵件每小時上限極低、常進垃圾桶 →
> 驗證信發不出 → 真實用戶無法完成註冊。接好自訂 SMTP 才算通。
> Claude 無法代做（不建帳號、不輸入密碼/金鑰）；以下步驟由你執行，已壓到最少。

## A. 建 Resend 並拿 SMTP 憑證（約 5 分鐘）
1. 到 resend.com 註冊（免費層每月 3000 封夠早期用）。
2. Domains → 加入你的寄件網域（等網域註冊好，見 item「網域」；暫時可用 Resend 提供的 onboarding 網域測試）。
3. 依畫面加 DNS（SPF/DKIM）記錄，等驗證通過（綠勾）。
4. API Keys → 建一把 → 拿到 SMTP 帳密：
   - Host: `smtp.resend.com`
   - Port: `465`（SSL）或 `587`（STARTTLS）
   - User: `resend`
   - Pass: 你的 Resend API key（`re_...`）

## B. 在 Supabase 填 SMTP（約 2 分鐘）
Dashboard → **Project Settings → Authentication → SMTP Settings** → Enable custom SMTP：
| 欄位 | 值 |
|---|---|
| Sender email | `no-reply@<你的網域>`（網域好之前先用可寄的信箱） |
| Sender name | `HardwareAI` |
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | 你的 Resend API key |

存檔後按 **Send test email** 確認能收到。

## C. 套用品牌信件模板（約 2 分鐘）
Dashboard → **Authentication → Emails → Templates**：
- **Confirm signup** → 貼上 `confirm-signup.html` 全文
- **Reset password** → 貼上 `reset-password.html` 全文

（模板用 `{{ .ConfirmationURL }}` 變數，Supabase 自動代入連結。）

## 完成判準
用一個「非站主」的信箱到網站按註冊 → 收到 HardwareAI 品牌驗證信 → 點連結能啟用 → 登入成功。
（站主自己不必等這步：Phase B 的 `owner-unlock.sql` 會手動確認站主信箱。）

## 網域注意
接好網域（hardwareai.app）後，Sender email 換成該網域、DNS 的 SPF/DKIM 也要指向 Resend，
並把 Supabase Auth 的 Site URL / Redirect URLs 一併改成新網域，否則驗證連結會指到舊 github.io。
