# NEW SESSION — 接手指南（2026-07-31）

上一段 session 做的是**面試題庫補圖**：從 5/38 有圖做到 38/38，
接著被使用者退了一輪畫風（「電阻畫個方框是幹嘛」），正在把 38 張全部改用站上既有的
符號庫重畫，目前 **9/38**。上線那三軌（網域／綠界／Resend）這段沒動，狀態見 §6。

先讀本檔，再讀 `HANDOFF.md`（專案硬規矩）。動 `Documents/Web` 前務必讀完這兩份。

---

## 0. 硬規矩

1. **圖字絕不重疊、元件絕不互疊**。改完圖跑幾何檢查（§4），再用瀏覽器實測收尾。
2. **不憑印象畫電路／腳位**。沒有可查證依據就不畫，寧可寫成文字圖說。
3. **元件符號一律用 `schematic-symbols.js`（`Sym`）**：電阻鋸齒、MOSFET 有閘極板/通道/本體箭頭/體二極體。
   自己刻方框已經被使用者退過一次，別再犯。
4. **改知識卡內容或自動圖 → 同步遞增 `BUILTIN_VERSION`（knowledge.js）與 `?v=`（knowledge.html）**。
   改 `interview-bank.js` → 遞增 `interview.html` 的 `interview-bank.js?v=`。
5. **只驗重疊不夠**。q18 曾因單位算錯把整條曲線推出畫布，重疊檢查照樣回報乾淨——
   空白畫布當然不會疊。每張圖都要有「畫的數字/拓樸對不對」的斷言。

---

## 1. 現況（2026-07-31 收工）

| 項目 | 狀態 |
|---|---|
| 面試題 | **38 題全部有圖**（起點 5 題） |
| 圖字重疊 | 瀏覽器實測 **0**（zh+en 共 71 張、1100+ 文字） |
| 畫風轉換 | **9 / 38**：`q1 q2 q3 q4 q5 q9 q10 q13 q15` |
| CI | 17 關全綠（新增 `interview-diagram-check` 自我測試 + 本體） |
| 知識卡 | 146 卡、重疊 0（這段沒動） |
| 上線阻礙 | **網域未買** → Resend 與正式金流都卡在這 |

---

## 2. 下一步：剩 29 題轉成符號庫畫風

使用者原話：「我要你的配色都跟圖二一樣」（圖二 = q3 那張白底藍線條）。
混著深色手繪版看會很怪，所以要全轉。

| 批次 | 題 | 性質 |
|---|---|---|
| 電路類 B | `q6 q8 q11 q19 q21 q25 q36`（q21 與 q33 同圖） | 要重排版面 |
| flyback | `q28 q29 q30 q31 q32` | 共用底圖、720 寬、37 個標籤，最花時間 |
| 波形/曲線 | `q7 q12 q16 q17 q18 q24 q26 q27` | 主要是改配色 |
| 表格/剖面 | `q14 q20 q22 q23 q34 q35 q37 q38` | 主要是改配色 |

**做法與工具全在 `tools/interview-diagrams/README.md`，先讀它再動手。**
產生器就在那個資料夾；`interview-bank.js` 裡的 SVG 是產生出來的，別直接編輯那串轉義字串。

---

## 3. 線上顯示的兩條路（很重要，會踩）

線上題目從 **Supabase** 抓，不是 repo；`interview-bank.js` 只是本機 demo 資料。
為了不必等使用者跑 SQL，`interview.html` 有一段**前端回填**：

```
DB 的 answer 沒有 <svg>  →  用題幹比對 interview-bank.js  →  把圖前置進去
DB 的 answer 已有 <svg>  →  原樣不動
```

推論兩件事：

- 改 `interview-bank.js` 就能改變線上顯示（33 題走這條）。
- **flyback 那 5 題 DB 已有舊圖，回填碰不到** → 非跑 SQL 不可。

使用者說「沒看到圖」時，先確認是不是瀏覽器快取（`interview.html` 是 `max-age=600`）：
用線上的 `interview-questions-seed.sql` 解析出真正的 DB 題幹，餵回填函式驗一次，別急著改程式。

---

## 4. 檢查

```bash
node interview-diagram-check.test.js   # 先證明守衛抓得到（5 種壞法 + --max）
node interview-diagram-check.js        # 規格 + 圖字重疊，0 發現才算過
node circuit-check.js --strict         # 知識卡：接線被吸附塌成零長
node wire-gap-check.js --selftest && node wire-gap-check.js --strict
node symbol-overlap-check.js --selftest && node symbol-overlap-check.js --strict
node svg-overlap-check.js --strict     # 知識卡圖字不重疊
node i18n-check.js                     # 改 HTML 後跑
```

`interview-diagram-check.js` 是**估算器**（node 沒有 DOM，字寬靠內建字元寬度表）。
門檻 2px，比瀏覽器版的 0.5px 鬆，因為估算誤差在 11px 字上約 ±1.5px。
**驗收仍以 `overlap-audit.md` 的瀏覽器 snippet 為準。**

知識卡未清完的帳（棘輪鎖住，只准降）：`wire-gap` 沒接上 8、多出線頭 6、無標籤自由端 18。

---

## 5. 待跑的 SQL（只有使用者能跑）

```
supabase/sql/interview-flyback-fix.sql      ← 必跑：那 5 筆前端回填碰不到
supabase/sql/interview-fix-diagrams.sql        q5/q6/q13
supabase/sql/interview-batch1-diagrams.sql     q7/q12/q17/q19/q26/q27
supabase/sql/interview-batch3-diagrams.sql     q1/q2/q4/q14/q15/q16/q22
supabase/sql/interview-batch4-diagrams.sql     q3/q8/q9/q10/q11
supabase/sql/interview-batch5-diagrams.sql     q18/q20/q21/q23/q24/q25
supabase/sql/interview-pcb-diagrams.sql        q33–q38
```

全部冪等、可重跑。**改完圖要重新產生對應 SQL**（`gen-*-sql.js`），否則 SQL 裡是舊圖。

---

## 6. 上線三軌（這段 session 沒動）

### 6.1 網域（只有你能做：要付款）

- `hardwareai.com` 2016 年就被註冊佔走（Dynadot，2026-09-19 到期）。
- `.work` 不建議：低價 gTLD 的寄信信譽差，而這站要寄付款收據。
- 建議去 Cloudflare Registrar 一次搜 `.io` / `.app` / `.dev`，哪個有拿哪個。
- 買完給我網域 + 代管（Cloudflare Pages / Netlify 能設安全標頭，GitHub Pages 不能）。
  我接手：DNS 記錄、CNAME、安全標頭、canonical/og:url 全站改寫、301 舊網址。
  **localStorage key 與舊 github.io 網址刻意保留**（見 `hardwareai-rebrand` 記憶）。

### 6.2 綠界（申請只有你能做）

- `SETUP-PAYMENT.md` 已定版。沙盒會 fallback 到官方測試商店 2000132，**不需要任何金鑰**就能先跑通。
- 你要做：部署 `create-order` / `ecpay-webhook`（`--no-verify-jwt`，綠界通知不帶 JWT）。
- 我接手：沙盒五項驗證（入帳、錯 CheckMacValue 要回 `0|CheckMacValue Error`、重送冪等、
  贊助只入帳不升級、金額界外擋下）。**沙盒沒過絕不切正式**；正式金鑰你自己填，我不碰。

### 6.3 Resend（等網域）

- SPF/DKIM/DMARC 三筆掛在**子網域**（`send.` 或 `mail.`），保護根網域寄信信譽。
- 我接手：三筆 DNS 完整值、Supabase SMTP 設定、三種信件模板、實際寄一封驗證送達。

---

## 7. 這輪踩過的坑（別重踩）

**畫圖**

- **符號庫早就存在，我沒用**：`schematic-symbols.js` 檔頭就寫著「風格參考使用者提供圖片：
  電阻=鋸齒、NMOS=閘極板+通道+本體箭頭+體二極體」。自己刻方框＝跟知識庫 146 卡完全不同調。
- **`Sym` 內建標籤 9–10px**，低於本專案 ≥10 規格 → `showPins:false`，文字自己畫 11px。
- **符號比方框佔空間**：第一次轉換撞了 14 處。先切帶（標題/電路/說明）再放元件。
- **`Sym.diode` 只有水平版**：`tools/interview-diagrams/light.js` 有 `diodeV()`（用同一組筆觸自己組），
  比包 `rotate(90)` 好——檢查器讀不到 transform。
- **`Sym.rail` 的桿子固定 12px**：橫軌畫在 `y+12`，不然桿子突出。

**檢查器**

- **字元寬度表 3 位數編碼會爆位**：粗體 `M` 是 1.005 em → 整條表往後錯開，粗體字寬全錯
  （誤差 3% → 19%，還誤報 4 筆）。現在 4 位數 + 載入時檢查長度。
- **「保險起見把字框做高」會製造誤報**：把五處刻意留的 2px 邊距報成重疊。
  垂直用實測值（上緣 1.08em、下緣 0.25em），餘裕統一交給單一容差。
- **拿線段 bbox 當障礙，斜線會嚴重誤判**：要用線段 vs 矩形真交集（slab 法）。
- **驗證器用顏色挑 polyline 會抓錯**：`Sym.resistor` 的鋸齒也是同色 polyline。用起點座標挑。
- **測試的變異目標別引用特定圖的文案**：重畫一張圖就讓測試靜默失效（已改成通用變異）。

**版面 / 資料**

- **`main` 是 flex item 又帶 `margin:0 auto`**：給 SVG 固定寬會把整頁撐寬出現橫捲。
  窄螢幕的橫向捲動要在媒體查詢裡同時歸零 `margin-left/right` 與 `min-width`。
- **PCB 那 6 題只存在 `supabase/sql/interview-pcb.sql`**，bank 沒有就永遠回填不到 → 已補成 q33–q38，
  題幹**從 SQL 解析**不是手抄。
- **seed 抽題時把 SVG 剝掉了**：DB 裡只剩空的 `<div class="exam-diagram-box"></div>`，
  而 ja/ko 反而有圖。遇到「圖不見了」先查 DB 欄位，不要假設是前端問題。
