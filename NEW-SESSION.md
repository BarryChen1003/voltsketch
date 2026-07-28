# NEW SESSION — 接手指南（2026-07-27）

上一段 session 做完的是「知識卡圖形正確性」；下一段要做的是**上線**：網域 → 資安 → 綠界金流 → email 綁定。
先讀本檔，再讀 `HANDOFF.md`（專案硬規矩）。動 `Documents/Web` 前務必讀完這兩份。

---

## 0. 三條硬規矩（沿用，別重新發明）

1. **圖字絕不重疊、元件絕不互疊**：改完圖一律跑四支幾何檢查（見 §2），並用瀏覽器實測收尾（`overlap-audit.md` 的 snippet；估算器看不到 0.5px 級與 `<g transform>` 之外的問題）。
2. **不憑印象畫電路／腳位／動畫**：沒有可查證依據就不畫，寧可寫成文字圖說。
3. **改任何知識卡內容或自動圖，一定同步遞增 `BUILTIN_VERSION`（knowledge.js）與該檔的 `?v=`（knowledge.html）**。
   原因：`getSampleKnowledge()` 產圖在快取分支**之前**，快取命中時舊 SVG 會贏 → 不 bump 就等於沒改。

---

## 1. 現況（2026-07-27 收工時）

| 項目 | 狀態 |
|---|---|
| 知識卡 | **145 張**（運放兩張已合併）／**148 張圖** |
| 圖字重疊 | 瀏覽器實測 **0**（148 圖 / 1532 文字） |
| 元件互疊 | **0** |
| 全圖尺寸 | 統一 ×1.3（以光耦卡為基準）：字級中位 10.4px、畫布寬中位 520px |
| CI | 14 關全綠（含 4 支幾何檢查，各自有 selftest） |
| 上線阻礙 | **網域未買** → SMTP／自訂寄信與正式金流都卡在這 |

最近 10 個 commit 都是圖形修正，逐筆理由寫在 commit message 裡（`git log --format='%h %s'`）。

---

## 2. 四支幾何檢查（CI 都是 --strict／棘輪）

```bash
node circuit-check.js --strict        # 接線被吸附塌成零長
node wire-gap-check.js --selftest     # 先證明檢查抓得到缺陷（4/4）
node wire-gap-check.js --strict       # 沒接上/多出線頭/無標籤自由端（棘輪）
node symbol-overlap-check.js --selftest   # 7/7
node symbol-overlap-check.js --strict # 元件互疊（基線 0）
node svg-overlap-check.js --strict    # 圖字不重疊（基線 0）
```

未清完的帳（棘輪鎖住，只准降）：`wire-gap` 沒接上 8、多出線頭 6、無標籤自由端 18。
清法：跑 `node wire-gap-check.js` 看座標 → 逐張確認是真缺陷還是「腳位標籤離 16px 外」的假陽性 → 修完 `--update` 收緊。

---

## 3. 上線工作（依相依順序，不能跳）

### 3.1 網域（**只有你能做**：要付款）

- 現況：站在 `barrychen1003.github.io/voltsketch`，**沒有 DNS 控制權** → 不能設自訂寄信網域、不能設安全標頭。
- 需要你決定：**網域名稱**與**註冊商**（Cloudflare Registrar 最便宜且免代管費；Gandi/Namecheap 亦可）。年費約 US$10–20。
- 買完給我：網域名稱 + 你要用哪個代管（建議 Cloudflare Pages 或 Netlify，兩者都能設 headers；GitHub Pages 不能設）。

我能做的（等網域確定就開工）：
- `CNAME`／DNS 記錄清單、`_redirects`／`netlify.toml` 或 Cloudflare Pages 設定檔
- 全站 canonical／og:url 從 github.io 改成新網域（**localStorage key 與舊 github.io 網址刻意保留**，見 `hardwareai-rebrand` 記憶）
- 301 舊網址 → 新網域

### 3.2 資安（可先做一半）

不需等網域：
- 依賴與金鑰盤查：確認前端只有 anon key、`service_role` 不在任何前端檔（`SETUP-AUTH.md` §1 已寫死這條）
- `.gitignore` 覆蓋 `.env`；repo 內既有檔案掃一次有沒有誤commit 的金鑰
- `security.txt`、CSP（先用 `<meta http-equiv>` 版本，之後搬到真標頭）
- Supabase RLS 複查：`profiles.pcb_access / interview_paid / role` 前端不可寫（`supabase-schema.sql` 已設，要驗證）

要等網域：HSTS／CSP／X-Frame-Options 等**真**標頭、TLS 設定。

### 3.3 綠界 ECPay（**申請只有你能做**）

`SETUP-PAYMENT.md` 已定版方案與流程（create-order Edge Function 算 CheckMacValue、webhook 驗簽＋核對金額防改價/重放）。
- 你要做：申請特約商店（正式收款需公司行號或個人賣家方案）→ 給我 **沙盒** MerchantID/HashKey/HashIV 先接通測試。
- 我要做：部署 `create-order`／`ecpay-webhook`、跑沙盒付款全流程、把 `PLANS` 與 `PLAN_RULES` 兩處價格對齊測試、失敗案例（改金額、重送 webhook）各驗一次。
- **絕不**在未驗證沙盒前切正式；正式金鑰由你在 Supabase 後台填，我不碰。

### 3.4 Email 綁定（等網域）

- 註冊/驗證信目前走 Supabase 內建寄信（有速率限制、寄件人是 supabase.co）。
- 正式：接 Resend（免費 3000 封/月）→ 需要在網域加 SPF／DKIM／DMARC 三筆 DNS。
- 我要做：Supabase SMTP 設定步驟、DNS 記錄清單、寄信模板（驗證信／重設密碼／付款成功）、實際寄一封驗證。

---

## 4. 交接時的未決事項（等你決定才能動）

1. 網域名稱 + 註冊商 + 代管平台（Cloudflare Pages / Netlify / 留在 GitHub Pages）
2. 綠界：先接沙盒還是等正式特約商店下來一次做完
3. Email：Resend 還是其他（SendGrid/Postmark），寄件人網址用 `noreply@<你的網域>` 嗎

---

## 5. 這段 session 的教訓（別重犯）

- **等比放大不會造成「圖字」重疊，但會讓既有的「元件互疊」變明顯**——當時沒有任何檢查在看元件互疊，所以我先說了「不會有新重疊」，被你抓到兩次。現在 `symbol-overlap-check` 補上了這個缺口。
- **估算器與瀏覽器會不一致**：字寬用係數估算會低估 CJK 混排，0.5px 級的擦邊只有 `getBBox` 看得到。改完一定跑瀏覽器實測。
- **`Sym.rail` 的桿子固定 12px**：橫軌要畫在 `y+12`，不然桿子突出（電流鏡、惠斯通電橋都中過）。
- **`Sym.diode` 沒有 `horizontal:false`**：要垂直得自己包 `rotate(90)`（LIN 那張因此整顆二極體沒接上）。
- **標籤比縫隙寬就會壓框**：`A()` 已有自動閃避（上下挪、含 12% 字寬餘裕），但估算不準時要用瀏覽器搜乾淨位再寫死。
