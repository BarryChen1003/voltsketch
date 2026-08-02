# NEW SESSION — 接手指南（2026-08-01）

面試題庫 38 題全部有圖，而且 **38/38 都已改成符號庫畫風**（白底藍線條、電阻鋸齒、
MOSFET 有體二極體），畫風轉換這件事到此結束。**下一件事是上線三軌，卡在網域，見 §6。**

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

## 1. 現況（2026-08-01 收工）

| 項目 | 狀態 |
|---|---|
| 面試題 | **38 題全部有圖**；zh+en 共 76 張（flyback 那 5 題的 en 原本沒圖，這輪補上） |
| 圖字重疊 | 瀏覽器實測（0.5px、線段真交集）**全庫 0**：76 張、740 個文字 |
| 畫風轉換 | **38 / 38 完成**（2026-08-01）。8 題純波形/剖面沒有 `data-sym`：本來就沒有離散元件可畫 |
| CI | 17 關全綠（新增 `interview-diagram-check` 自我測試 + 本體） |
| 知識卡 | 線上 152 張卡、圖 80 張、重疊 0；2026-08-01 新增 7 張 DC/DC 佈局卡（來源 ROHM TWHB-03e，檔 `knowledge-extra5.js`） |
| 上線阻礙 | **網域未買** → Resend 與正式金流都卡在這 |

---

## 2. 畫風轉換（已完成，留著當索引）

使用者原話：「我要你的配色都跟圖二一樣」（圖二 = q3 那張白底藍線條）。
混著深色手繪版看會很怪，所以要全轉。

| 批次 | 題 | 性質 |
|---|---|---|
| ~~電路類 B~~ | ~~`q6 q8 q11 q19 q21 q25 q36`~~ | 2026-08-01 完成（batch11.js，q33 跟著 q21 一起轉） |
| ~~flyback~~ | ~~`q28 q29 q30 q31 q32`~~ | 2026-08-01 完成（batch12.js，共用底圖 720x480） |
| ~~波形/曲線~~ | ~~`q7 q12 q16 q17 q18 q24 q26 q27`~~ | 2026-08-01 完成（batch13.js） |
| ~~表格/剖面~~ | ~~`q14 q20 q22 q23 q34 q35 q37 q38`~~ | 2026-08-01 完成（batch14.js，q34 與 q23 同圖） |

`interview-diagram-check.test.js` 的六個案例現在**全部是通用變異**，不再綁任何一張圖的文案，
重畫剩下那 8 題不會再讓自我測試以 `mutation did nothing` 中止。

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
node tools/interview-diagrams/verify-batch11.js   # 電路類 B 的拓樸/數字斷言
node tools/interview-diagrams/verify-batch12.js   # flyback 的拓樸/極性斷言（66 條）
node tools/interview-diagrams/verify-batch13.js   # 波形/曲線的數值斷言（84 條）
node tools/interview-diagrams/verify-batch14.js   # 表格/剖面的比例與真值表斷言（62 條）
```

`interview-diagram-check.js` 是**估算器**（node 沒有 DOM，字寬靠內建字元寬度表）。
門檻 2px，比瀏覽器版的 0.5px 鬆，因為估算誤差在 11px 字上約 ±1.5px。
**驗收仍以 `overlap-audit.md` 的瀏覽器 snippet 為準。**

知識卡未清完的帳（棘輪鎖住，只准降）：`wire-gap` 沒接上 8、多出線頭 6、無標籤自由端 18。

---

## 5. 待跑的 SQL（只有使用者能跑）

```
supabase/sql/interview-flyback-fix.sql      ← 必跑：那 5 筆前端回填碰不到（2026-08-01 已重產，內容是新底圖）
supabase/sql/interview-fix-diagrams.sql        q5/q6/q13
supabase/sql/interview-batch1-diagrams.sql     q7/q12/q17/q19/q26/q27
supabase/sql/interview-batch3-diagrams.sql     q1/q2/q4/q14/q15/q16/q22
supabase/sql/interview-batch4-diagrams.sql     q3/q8/q9/q10/q11
supabase/sql/interview-batch5-diagrams.sql     q18/q20/q21/q23/q24/q25
supabase/sql/interview-pcb-diagrams.sql        q33–q38
```

全部冪等、可重跑。**改完圖要重新產生對應 SQL**（`gen-*-sql.js`），否則 SQL 裡是舊圖。
2026-08-01 已重新產生全部七支：`flyback-fix`、`fix-diagrams`、`batch1`、`batch3`、`batch4`、`batch5`、`pcb`。
（38 題散在這七支裡，四批重畫都動到，所以七支全部重產過。）
順帶修好 `gen-batch1-sql.js`：它原本從 `batch1.js` 取圖，那份沒有後來補上的 `width/height`
屬性，等於這支 SQL 一直在吐不合規格的圖；現在跟其他支一樣從 `interview-bank.js` 取。

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

- **`Sym.npn` 的 C/E 是寫死的（上 C 下 E），`pnp:true` 只換箭頭**：latch-up 的寄生 PNP 需要
  射極朝上，剛好相反；而且 pnp 模式那個三角形實際指向與它自己的註解（「朝基極」）不一致。
  照 `diodeV` 的慣例在 `batch11.js` 自己組了 `pnpUp()`，沒有動共用符號庫（146 張知識卡在用）。
- **`Sym` 的 `opt.label` / `showPins` 一律不能用**：那些字是 8-10px，低於本專案 ≥11。
  `Sym.ic` 的腳位文字是 8px、`Sym.rail(x,y,label)` 的標籤是 9px——要標就自己用 `T()` 畫。
- **文字中心落在方框內是合法的**（檢查器把它當成該方框的標題），所以 IC 框裡放兩行 11px
  說明不會被判重疊；但只要有一個字元探出框外就變成「壓方塊」。

**檢查器**

- **自我測試的變異綁死圖上文案，重畫該圖就整組報廢**：這輪重畫 q19，`interview-diagram-check.test.js`
  的案例 1、6 直接 `mutation did nothing` 中止。已改成通用變異（在第一張圖的第一條走線上蓋字）。
- **node 估算器 2px、瀏覽器 0.5px，中間那段只有瀏覽器看得到**：2026-08-01 實測全庫 8 筆
  「壓線」全落在 q18（3 筆 ×2 語言）與 q26（1 筆 ×2），node 版是乾淨的。
  比對過改動前的 HEAD 版本，這 8 筆改動前就在，不是這輪造成的；那兩題轉畫風時順手修掉。

- **字元寬度表 3 位數編碼會爆位**：粗體 `M` 是 1.005 em → 整條表往後錯開，粗體字寬全錯
  （誤差 3% → 19%，還誤報 4 筆）。現在 4 位數 + 載入時檢查長度。
- **「保險起見把字框做高」會製造誤報**：把五處刻意留的 2px 邊距報成重疊。
  垂直用實測值（上緣 1.08em、下緣 0.25em），餘裕統一交給單一容差。
- **拿線段 bbox 當障礙，斜線會嚴重誤判**：要用線段 vs 矩形真交集（slab 法）。
- **驗證器用顏色挑 polyline 會抓錯**：`Sym.resistor` 的鋸齒也是同色 polyline。用起點座標挑。
- **測試的變異目標別引用特定圖的文案**：重畫一張圖就讓測試靜默失效（已改成通用變異）。

- **一張圖擠 20 個元件時，先畫樓層平面再下筆**：flyback 底圖排了三輪才收斂。
  規則：每個縱向欄位只給一個網路（C1 一欄、Rst/VDD 一欄、Cvdd 一欄、Q1/Rs 一欄），
  橫向匯流排只留兩條（HV+ 與 PGND）。不先切欄就會出現「怎麼繞都跨到別人身上」。
- **IC 的腳名寫在框內**：檢查器把「中心落在方框內的文字」當成該框的標題直接放行，
  而框外的腳名要跟走線搶那 14px 的巷子。U1 五個腳名移進框內之後，四筆重疊一次消失。
- **交叉是可以有的，但要挑地方**：底圖只留兩個無點交叉（AUX 引線跨汲極引線、
  FB 訊號跨一次地匯流排），兩處都在 verify-batch12.js 斷言「不准有接點」。
- **變壓器/水平電容/反向二極體/保險絲，符號庫都沒有**：照 `diodeV` 的慣例在 batch 檔裡
  用 `Sym.line/tri` 自己組（`coilV` / `capH` / `diodeHL` / `fuse`），不要包 rotate。

- **瀏覽器 snippet 曾經比圖還不可靠**：它把「線段 bbox」當障礙，一條斜線的 bbox 會蓋掉
  整個象限——q18 因此誤報三筆。node 版早就用線段真交集（slab）了。
  規矩：**兩版對不上時先確認哪一版的幾何算錯**，不要急著搬圖上的字去迎合檢查器。
  snippet 已在 `overlap-audit.md` 換成 slab 版，並補上圓弧（`A`）的解析。
- **真正的擦邊都在 2px 以下**：node 版容差 2px 看不到，只有瀏覽器版（0.5px）抓得到。
  這輪抓到兩筆（q26 的 `-3dB at fc` 離曲線 1.5px、flyback 的 `470u` 離極板 1px），都已修。

- **表格的值用算的、不要手打**：q14 的真值表 20 格是 `(a,b)=>a&b` 這類函式吐出來的，
  驗證器再用同一組函式對一次。手打的表格永遠會有一格錯，而且沒人會發現。
- **剖面圖要有比例尺**：q22/q37 統一 1mil = 8px，W/S/H/T 的相對關係是真的，
  驗證器直接回推 rect 的寬高檢查。示意圖畫成不成比例，讀者就學不到「S 比 H 小會怎樣」。
- **圖上宣稱的東西要畫得出來**：q23 標「等長、等距」，第一版的第二條線是把 y 加 16，
  結果 45 度斜段的垂距變成 19.8 —— 圖自己打自己的臉。改成沿法線平移再求交點，
  驗證器逐段量距離（16.00 / 16.00 / 16.00）與長度差（< 0.5px）。

**版面 / 資料**

- **`main` 是 flex item 又帶 `margin:0 auto`**：給 SVG 固定寬會把整頁撐寬出現橫捲。
  窄螢幕的橫向捲動要在媒體查詢裡同時歸零 `margin-left/right` 與 `min-width`。
- **PCB 那 6 題只存在 `supabase/sql/interview-pcb.sql`**，bank 沒有就永遠回填不到 → 已補成 q33–q38，
  題幹**從 SQL 解析**不是手抄。
- **seed 抽題時把 SVG 剝掉了**：DB 裡只剩空的 `<div class="exam-diagram-box"></div>`，
  而 ja/ko 反而有圖。遇到「圖不見了」先查 DB 欄位，不要假設是前端問題。
