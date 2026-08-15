# HardwareAI 上線總指南

寫於 2026-08-14。這份是**照著做就能上線**的順序表；每一步都寫「你要做什麼」與「我接手做什麼」。
細節文件不重複貼，只指路：`SETUP-PAYMENT.md`、`SETUP-AUTH.md`、`supabase/sql/RUN-ORDER.md`、
`supabase/email-templates/SMTP-SETUP.md`、`supabase/functions/DEPLOY.ps1`。
單項的完成度看 `TODO.md`。

> **為什麼順序重要**：網域沒定，SMTP 的 DNS、Supabase 的 redirect URL、綠界的 ReturnURL 全都得重設一次。
> **先買網域**，其餘照下面的順序推，不會回頭返工。

```
① 網域 ──► ② 代管搬家 ──► ③ Supabase 後端 ──► ④ 信件(SMTP)
                                  │                    │
                                  └──► ⑤ 金流沙盒 ──► ⑥ 綠界正式 ──► ⑦ 發票
                                                                        │
                                       ⑧ 資安收尾 ◄──────────────────────┘
                                                │
                                       ⑨ 上線後的例行事
```

---

## ① 網域（✅ 2026-08-15 完成：`hardware-ai.org`，Cloudflare Registrar，$11.20/年，自動續約開）

- `hardwareai.com` 2016 年就被註冊佔走（Dynadot，2026-09-19 到期）。
- **不要用 `.work` 這類低價 gTLD**：寄信信譽差，而這站要寄付款收據與驗證信。
- 建議在 **Cloudflare Registrar** 一次搜 `.io` / `.app` / `.dev`，哪個有拿哪個
  （之後代管、DNS、安全標頭都在同一個後台，少一層設定）。
- `.app` 與 `.dev` 是 HSTS preload 網域，**強制 HTTPS**。
  **實際買的是 `.org`**——老牌 TLD、寄信信譽好、名稱對得上，沒問題；
  差別只有 `.org` 不在 preload 清單，所以 HSTS 要自己送（已在 `_headers` 設好，見 §9.1）。

**買完給我：網域名稱 + 你選的代管。** 我接手：DNS 記錄、CNAME、安全標頭、
全站 canonical/og:url 改寫、301 舊網址、Supabase redirect URL、綠界 ReturnURL/ClientBackURL。

> `localStorage` 的 key 與舊 github.io 網址**刻意保留**（見 `hardwareai-rebrand` 記憶）：
> 換網址不能把老使用者存在瀏覽器裡的專案洗掉。

---

## ② 代管搬家：GitHub Pages → Cloudflare Pages（建議）

**為什麼要搬**：GitHub Pages **不能自訂 HTTP 標頭**。也就是說 CSP、HSTS、
`X-Content-Type-Options`、`Referrer-Policy` 這些全都設不了。一個會收錢、會登入的站不該這樣。

Cloudflare Pages（或 Netlify）可以放一個 `_headers` 檔就設好，而且免費層夠用。

**✅ 2026-08-15 已完成**，實際落在 **Cloudflare Workers 靜態資產**（不是 Pages），
部署指令 `npx wrangler deploy`，推 main 就自動部署。目前網址：
`https://voltsketch.barry871003.workers.dev`（自訂網域還沒接）。

三個檔控制部署，**都在 repo 裡**：

| 檔 | 作用 |
|---|---|
| `wrangler.jsonc` | 專案設定。**沒有這檔的話 Cloudflare 會自動產一份**，內容是 `assets.directory: "."` |
| `.assetsignore` | 哪些東西不要上傳（見下面「坑 1」；檔內自帶驗收指令） |
| `_headers` | 安全標頭（見 §9.1） |
| `_redirects` | 根路徑 `/` 改寫成 `index.html` |

**踩過的兩個坑（改設定前先看）**：

1. **第一次部署把整個 repo 放上公開網站**。`/.git/config`、
   `/supabase/.temp/linked-project.json`、所有內部 `.md` 都能用瀏覽器直接打開（實測 200）。
   沒有金鑰外洩（repo 本來就公開、`.git/config` 裡沒憑證），但 `.assetsignore` 是必要的。
2. **Workers 預設會把 `/news.html` 307 導到 `/news`**。全站連結與 canonical 都寫 `.html`，
   放著不管等於每次點導覽多一次轉址、canonical 指的網址跟實際服務的對不上。
   設 `html_handling: "none"` 修好——但副作用是根路徑 `/` 變 404，所以要配 `_redirects` 的
   `/  /index.html  200`（**改寫不是轉址**，網址列不變，才對得上 index.html 的 canonical）。

**✅ 2026-08-15 正式網域上線：`https://hardware-ai.org`**（HTTPS 憑證自動發，標頭實測都有送）。

自訂網域**不是在儀表板綁的**——這種「只有靜態資產」的 Worker，
Settings 沒有 Domains & Routes 那一區（Variables / Triggers 也一併被擋，畫面會寫
「cannot be added to a Worker that only has static assets」）。
改用 `wrangler.jsonc` 的 `routes` + `custom_domain: true`，`wrangler deploy` 會順便建 DNS 記錄。
同時關掉 `workers_dev` 與 `preview_urls`，避免同一份內容掛在多個網址。

canonical / og:url / JSON-LD / `sitemap.xml` / `robots.txt` / `.well-known/security.txt`
已全部改成新網域（15 個 HTML + 3 個檔）。

**綠界不用改**（我先前寫錯，這裡更正）：`ReturnURL` 指的是 Supabase functions 的網址、與站台網域無關；
`ClientBackURL` 取 request 的 `origin`，使用者從哪個網址來就回哪裡。所以換網域不必動金流程式。

**還沒做**：Supabase Auth 的 Site URL / Redirect URLs（只能在 Dashboard 改）；
`www.hardware-ai.org` 導到根網域（要在 Cloudflare 加 Redirect Rule）；
舊的 GitHub Pages 站要不要關掉（現在 canonical 已指向新網域，Google 會逐漸收斂）。

---

## ③ Supabase 後端（SQL + 帳號）

專案：`dmkxjawjrmltmrmkebbs`（Dashboard 名稱「Hardware ai」）。
下面每一步都標了選單路徑；Supabase 改版時以選單名為準，網址只是捷徑。

### 3.0 五步驟總覽（照順序，不能跳）

| # | 做什麼 | 在哪 |
|---|---|---|
| 1 | 跑 Phase A SQL（建表） | SQL Editor |
| 2 | 改 Site URL / Redirect URLs 成 `https://hardware-ai.org` | Authentication → URL Configuration |
| 3 | 到 `hardware-ai.org` 用 `smallshark1003@gmail.com` 註冊一次 | 網站 |
| 4 | 跑 `owner-unlock.sql`（拿全權限＋免驗證信） | SQL Editor |
| 5 | 接 Resend SMTP＋貼信件模板（給**真實用戶**用） | Project Settings → Authentication |

**第 2 步不能省，也不能排在第 3 步後面。** Site URL 還是舊網址的話，
註冊驗證信裡的連結會指回 github.io——就算信寄出去了也點不回正確的站。

### 3.1 為什麼「站主拿全權限」不需要等信

`owner-unlock.sql` 做四件事，其中第一件就是**直接把信箱標成已確認**：

| 段 | 效果 |
|---|---|
| ① `email_confirmed_at = now()` | **免收驗證信就能登入**——所以你不必等 SMTP 弄好 |
| ② `profiles.role='admin'`＋`interview_paid`＋`pcb_access` | 面試題與 PCB 的 RLS 全通 |
| ③ `user_plans` plan=`owner`、額度 9999、`unlock_all`、**永不過期** | 付費知識卡全開、匯出不受限 |
| ④ 兩個 `select` | 跑完自己核對，各應回 1 列 |

**前提：`auth.users` 要先有你那一列**，也就是**得先在網站按過一次註冊**（信收不到沒關係，帳號列還是會建立）。
所以順序是「先註冊，再跑這支 SQL」。

**信箱寫死 `smallshark1003@gmail.com`**（`owner-unlock.sql` 三處）。要用別的信箱就先改 SQL 再跑。

照 `supabase/sql/RUN-ORDER.md`：

1. **Phase A**：SQL Editor 貼 `supabase/sql/00-RUN-phaseA.sql` → Run。
   一次建好 profiles / observability / orders / quota / 面試題，冪等可重跑。
2. **在網站按一次註冊**（用 `smallshark1003@gmail.com`）。驗證信還沒通沒關係，帳號列會建立。
3. **Phase B**：跑 `supabase/sql/owner-unlock.sql`。它會手動確認站主信箱＋設 admin＋全解鎖，
   所以**站主自己不必等 SMTP**。
4. 驗證（應回 1 列）：
   ```sql
   select u.email, u.email_confirmed_at, p.role, p.interview_paid, p.pcb_access
     from auth.users u join public.profiles p on p.id = u.id
    where u.email = 'smallshark1003@gmail.com';
   ```

**已知徵狀**：2026-08-15 在 Cloudflare 上實測，前端打 `/rest/v1/page_views` 回 **404**——
就是因為 Phase A 還沒跑，`page_views` 表不存在。所以現在**沒有任何流量與錯誤紀錄**在收。

**還有幾筆面試題 SQL 沒跑**（`NEW-SESSION.md` §5 列了七支，`supabase/sql/interview-flyback-fix.sql` 是必跑）。

**Auth 設定要順手做的**（Dashboard → Authentication）：
- Site URL / Redirect URLs 換成新網域（不改的話，驗證信裡的連結會指回 github.io）。
- 開 **Leaked password protection**（Supabase 內建，擋已外洩密碼）。
- 看一下 Rate limits 的預設值夠不夠。

**要確認的一件事**：免費層有閒置暫停與資源上限。**開始收錢之前**去 Dashboard 確認
你的方案在流量與可用性上撐得住——收了錢的站被暫停是客訴，不是技術問題。

---

## ④ 信件（Resend + SMTP）

真實用戶收不到驗證信就無法註冊。逐步在 `supabase/email-templates/SMTP-SETUP.md`。

**之前收不到驗證信的原因**：沒接自訂 SMTP 時走 Supabase 內建寄信，每小時上限極低而且常被判垃圾信。
這不是程式壞掉，是預設就不能拿來當正式服務用。

**「驗證碼」與「驗證連結」是兩種東西，現在做的是連結**：
`auth.js` 用 `signUp({email, password})`，登入頁沒有輸入驗證碼的欄位，
信件模板變數是 `{{ .ConfirmationURL }}`——使用者收到的是一條**點下去就啟用**的連結。
要改成「收 6 位數驗證碼、自己打進網站」得三樣一起改：
模板換 `{{ .Token }}`、登入頁加輸入欄、前端改呼叫 `verifyOtp()`。是一個小功能，不是設定改一改。

- **SPF / DKIM / DMARC 三筆掛在子網域**（`send.` 或 `mail.`），不要掛根網域——
  這樣寄信信譽出問題時不會拖累根網域。
- 模板 `supabase/email-templates/confirm-signup.html`、`supabase/email-templates/reset-password.html` 貼進 Supabase Auth。
- **最後一定要實際寄一封到 Gmail 收**，看有沒有進垃圾桶。DNS 設對不等於送得到。

---

## ⑤ 金流沙盒（不用申請，現在就能跑）

程式端全備好了。沙盒會 fallback 到綠界官方測試商店 2000132，**不需要任何金鑰**。

1. `supabase login` → `link` → 部署兩支 function：
   ```
   supabase functions deploy create-order
   supabase functions deploy ecpay-webhook --no-verify-jwt
   ```
   `--no-verify-jwt` 不能省：綠界的 server-to-server 通知不帶 JWT。
2. 第一次部署後**先打一次 create-order** 確認 function 起得來
   （`supabase/functions/_shared/ecpay-config.mjs` 在 Supabase edge runtime 的載入還沒實測過）。
3. 五項驗證（`SETUP-PAYMENT.md` 有詳細步驟，**五項全過才准往下**）：
   - 測試卡付款 → `orders.status=paid`、`user_plans` 出現方案
   - 錯的 CheckMacValue → 回 `0|CheckMacValue Error`、不入帳
   - 同一筆通知重送 → 回 `1|OK` 但不重複入帳
   - 贊助 → 只入帳、**不得**升級權益
   - 金額界外（<30 或 >30000）→ 擋下

---

## ⑥ 綠界正式收款

- **你要做**：申請特約商店（個人賣家或公司行號，約 3–5 工作天）→ 拿 MerchantID / HashKey / HashIV。
- 金鑰**只放 Supabase secrets**，不進前端、不進 git：
  ```
  supabase secrets set ECPAY_MERCHANT_ID=xxx
  supabase secrets set ECPAY_HASH_KEY=xxx
  supabase secrets set ECPAY_HASH_IV=xxx
  supabase secrets set ECPAY_ACTION_URL=https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5
  supabase secrets set ECPAY_MODE=live
  ```
- **`ECPAY_MODE=live` 一定要設**。這是保險絲：原本四個綠界設定值都有沙盒 fallback，
  secrets 掉了或變數名打錯會**安靜地**把真實客戶送到沙盒付款頁——測試卡付得過、
  webhook 驗章也過、訂單標 paid、VIP 免費開通，整條路一聲不吭。
  設了 `live` 之後，缺值／用測試憑證／網址不是正式站台一律 throw。
- 切正式後**自己用真卡付一筆最小金額**，確認入帳與權益，再退款。沙盒過不等於正式過。

---

## ⑦ 電子發票（`TODO.md` A4，還沒做）

在台灣對消費者收費要開發票。綠界有 **B2C 電子發票 API**
（技術文件：`https://developers.ecpay.com.tw/?p=7809`，2026-08-14 確認這頁存在），
可以接進 `ecpay-webhook` 的入帳流程，付款成功就自動開立。

**這件事有兩半**：
- **工程**（我可以做）：串發票 API、把發票號碼寫進 `orders`、失敗要能重試。
- **行政**（只有你能做）：要不要辦營業登記、用哪種發票、載具與捐贈設定。

---

## ⑧ 你要自己確認的法遵事項（我不能代你決定，也不會替你猜法規）

我沒有查證台灣稅法的細節數字，**下面是你要去問的問題**，不是答案。
問對象：國稅局（免費諮詢）或會計師。

| 要問的事 | 為什麼要問 |
|---|---|
| 我這樣的線上訂閱收入，要不要辦**營業登記**？門檻是多少？ | 決定要不要開發票、報哪些稅 |
| 要開**統一發票**嗎？電子發票怎麼申請？ | 影響 ⑦ 的做法 |
| 營業稅、所得稅怎麼報？ | 收錢之後就會發生 |
| 線上服務適用哪些**定型化契約應記載及不得記載事項**？ | terms.html 可能還缺必要條款 |
| 個資法的**告知義務與安全維護**，我這站做到了嗎？ | privacy.html 已寫，但沒人審過 |
| 使用者資料存在 Supabase（境外），**跨境傳輸**要怎麼告知？ | privacy.html 目前沒寫這件事 |

**另外三件現在就看得到的問題**：

1. **條款描述的服務跟實作對不上（優先修）**
   `terms.html` 寫「訂閱取消後…取消後不再自動續扣」，但實作是**單次購買開通**，
   根本沒有自動續扣這回事（`SETUP-PAYMENT.md`：「目前為單次購買開通」）。
   使用者照條款會以為自己在訂閱、會被續扣。二選一：
   **改條款文字**（一小時的事），或**做定期定額**（要另外申請綠界服務、接 `SpCheckOut`）。
2. **法律頁的英日韓版沒有法務看過**。那是使用者按「同意」時所同意的內容。
   中文版有「歧異以中文版為準」的條款兜底，但值得找人審。
3. **退款政策**已寫進 `terms.html`（數位服務七日例外＋重複扣款 30 日內全額退），
   實際發生時的操作流程在綠界後台，`orders` 表留對帳紀錄——**先自己走一次退款演練**。

---

## ⑨ 資安（搬完家就做，不要等「有空」）

### 9.1 安全標頭（✅ 2026-08-15 已上線，實測 curl 有送出來）

`_headers` 檔已在 repo。目前這五條：

```
/*
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=()
  Content-Security-Policy: frame-ancestors 'self'
```

`frame-ancestors 'self'` 擋點擊劫持，且不需要動任何程式碼。
`.org` 不在 HSTS preload 清單，所以 `Strict-Transport-Security` 必須自己送（已送）。

驗收指令（換成正式網域後要重跑一次）：
```bash
curl -sI https://<站台>/ | grep -iE "strict-transport|content-security|x-content-type|referrer|permissions"
```

**完整的 CSP 是另一件事，不要一次上**。現況：全站有 13 段 inline `<script>`（10 個頁面）
與大量 inline `style="..."`。靜態代管沒辦法每次請求發不同的 nonce，所以完整 CSP 只有兩條路：
- 加 `'unsafe-inline'`——擋得住「從別的網域載入腳本」，**擋不住 inline 的 XSS payload**。要誠實知道這點。
- 或先把 inline script/style 搬進獨立檔案，再上嚴格 CSP。這是重構，要排時間。

### 9.2 第三方 CDN 是目前最大的供應鏈風險

全站從外部載入 **7 個**腳本（5 個寫在 HTML，2 個由 `pcb-3d.js` 動態插入）：

| 來源 | 用途 | 問題 |
|---|---|---|
| `cdn.jsdelivr.net/npm/@supabase/supabase-js@2` | 登入、資料庫 | **沒鎖版本**：`@2` 會自動吃 v2 的任何新版 |
| `cdnjs.cloudflare.com/.../pdf.js/3.11.174` | datasheet 解析 | 版本有鎖，但沒有 SRI |
| `cdnjs.cloudflare.com/.../xlsx/0.18.5` | 匯出 | 同上 |
| `cdnjs.cloudflare.com/.../mammoth/1.6.0` | 文件匯入 | 同上 |
| `cdn.jsdelivr.net/npm/qrcode@1.5.3` | QR code | 同上 |
| `cdn.jsdelivr.net/npm/three@0.128.0` | PCB 3D 檢視 | **`pcb-3d.js` 執行時才插入**，grep HTML 看不到 |
| `cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js` | 同上 | 同上 |

`supabase-js` 是**處理登入 token 的那一支**。它從外部網域載入、又不鎖版本——
CDN 被入侵或套件被投毒，等於有人拿到你所有使用者的 session。

**建議（依 CP 值排序）**：
1. `supabase-js` 鎖到明確版本 + 加 `integrity`（SRI）。
2. 更好：**7 支全部下載到 repo 自己 host**。它們都是靜態函式庫，不需要 CDN 的更新。
   做完之後 `script-src` 就只剩 `'self'`，供應鏈風險直接歸零，CSP 也好寫。

### 9.3 備份：**現在等於沒有備份**

`.github/workflows/backup.yml` 寫好了，但要 repo secret `SUPABASE_DB_URL` 才會真的跑，
沒設會 skip（不報錯，所以很容易以為有在備份）。

**你要做**：Supabase → Settings → Database → Connection string (URI，含密碼) →
GitHub repo → Settings → Secrets and variables → Actions → New secret，
名稱 `SUPABASE_DB_URL`。設完**手動觸發一次**確認真的 dump 出東西。

備份含使用者 email 等個資，只上傳成 Actions artifact（保留 90 天），**絕不能 commit 進這個公開 repo**。

**還要做一次還原演練**：備份沒還原過就不算備份。

### 9.4 金鑰盤點（現況已檢查過，維持這樣）

| 東西 | 現在放哪 | 對不對 |
|---|---|---|
| Supabase anon key | `auth-config.js`（前端、進 git） | ✅ 對。anon key 本來就是公開的，安全靠 RLS |
| Supabase service_role | 只在兩支 Edge Function 讀環境變數 | ✅ 對，前端零出現 |
| 綠界 HashKey / HashIV | Supabase secrets | ✅ 對 |
| DB 連線字串 | GitHub repo secret | ⬜ 還沒設（見 9.3） |

**anon key 公開是設計，不是漏洞——前提是 RLS 真的擋得住。** 所以下一項才是重點。

### 9.5 RLS 實測（`TODO.md` D1，你說了才做）

RLS policy 寫了不等於擋得住。要用**三種身分實打**：未登入 / 免費 / VIP，逐表確認：
- 讀不到別人的專案、訂單、使用量
- 免費帳號拿不到付費知識卡與面試題內容（**要驗 API 回應，不是驗畫面有沒有藏起來**）
- `export-gateway` 的額度繞不過（直接打 API、改前端計數都要擋）
- webhook 偽造與重放（已有測試，正式環境再實測一次）
- `esc()` 的 XSS 覆蓋率

這件事我建議**排在正式收款之前**做完。它是 `TODO.md` 的 D1，你說開始我就做。

---

## ⑨+ 上線後的例行事

- **看觀測資料**（你已是 admin）：
  ```sql
  select * from public.error_summary;     -- 近 7 天前端錯誤
  select * from public.pageview_summary;  -- 近 7 天各頁流量
  ```
- **對帳**：`orders` 表 vs 綠界後台，至少每月一次。
- **Search Console + GA4**：`TODO.md` A1，**等網域定案再辦**，不然換網址整套重來。
- **內容承諾要跟上**：付費頁面承諾「知識庫付費主題每月上新」（`SETUP-PAYMENT.md` 的方案表）。
  收了錢就是契約義務，`TODO.md` C1 是這件事的排程。
- **新技術頁已自動跑**：新聞每天 09:00/12:00/21:00、期刊與研討會每月 1 號，直接發佈到 main
  （見 `NEWS-UPDATE.md`）。排程只在 Claude app 開著時跑。

---

## 一頁版：你現在該做的下三件

1. **買網域**（Cloudflare Registrar，`.io` / `.app` / `.dev`）。其他事都卡在這。
2. **設 `SUPABASE_DB_URL` repo secret** 並手動跑一次備份。這件事跟網域無關，現在就能做，
   而且現況是**完全沒有備份**。
3. **決定條款要怎麼修**（見 ⑧ 的第 1 點）：改成單次購買的措辭，還是真的做定期定額。

## 教訓

- 2026-08-14 | 寫上線指南 | 條款寫「取消訂閱不再自動續扣」，但實作是單次購買、根本沒有續扣機制 | 法律頁描述的服務要跟實作對帳，每次改方案就重對一次
- 2026-08-15 | 第一次 Cloudflare 部署 | 沒放 wrangler 設定，建置流程自動產一份 `assets.directory: "."`，把 `.git/` 與 `supabase/` 放上公開網站 | 部署設定要收進 repo 自己控制；部署後**實際 curl 幾個不該公開的路徑**確認是 404，不要只看建置成功
- 2026-08-15 | 部署驗收 | 只看 HTTP 狀態碼會漏掉 `/news.html` 被 307 導向 `/news`——狀態碼是 200，但那是轉址後的 200 | 驗網址行為要看 `-I` 的第一行與 `Location`，不要用 `-L` 之後的狀態碼下結論
- 2026-08-15 | 排除清單 | 差點把 `ai-checker.js`、`schematic-check.js` 當成 CI 檢查器排掉——名字像，實際是網站在載的模組 | 排除任何檔案前先掃三種引用：HTML 的 src/href、程式裡的 `fetch()`、以及 `createElement('script')` 這種動態插入
- 2026-08-14 | 資安盤點 | `.github/workflows/backup.yml` 沒設 secret 時是靜默 skip，看起來像有在備份 | 「設好但沒啟用」的防護要在文件裡標成「等於沒有」，不要只寫檔案存在
