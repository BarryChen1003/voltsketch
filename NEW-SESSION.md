# NEW SESSION — 接手指南（2026-08-05）

先讀本檔（現況、本輪做了什麼、待辦），再讀 `HANDOFF.md`（長期硬規矩、開發環境、踩過的坑）。
動 `Documents/Web` 前務必讀完這兩份；兩份衝突時以本檔為準。

**現在的狀態**：面試題畫風轉換做完了（38/38），知識卡加到 152 張，IC 元件庫多了
「上傳兩份 datasheet → 產出 2nd Source 比對報告」，知識卡的 155 張圖現在四語都會跟著切（§7）。
全部已 commit 並推上 GitHub Pages。
**接下來卡在你（使用者）身上的是上線三軌，見 §6。**

---

## 0. 硬規矩

1. **圖字絕不重疊、元件絕不互疊**。改完圖跑幾何檢查（§4），再用瀏覽器實測收尾。
2. **不憑印象畫電路／腳位／規格**。沒有可查證依據就不畫、不填；datasheet 抽不到就標「未擷取」。
3. **元件符號一律用 `schematic-symbols.js`（`Sym`）**：電阻鋸齒、MOSFET 有閘極板/通道/本體箭頭/體二極體。
   自己刻方框已經被使用者退過一次，別再犯。
4. **改知識卡內容或自動圖 → 同步遞增 `BUILTIN_VERSION`（knowledge.js）與 `?v=`（knowledge.html）**。
   改 `interview-bank.js` → 遞增 `interview.html` 的 `interview-bank.js?v=`。
5. **只驗重疊不夠**。q18 曾因單位算錯把整條曲線推出畫布，重疊檢查照樣回報乾淨——
   空白畫布當然不會疊。每張圖都要有「畫的數字/拓樸對不對」的斷言。
6. **新功能一律四語**（zh / en / ja / ko）。UI 字串、程式產生的句子、報告輸出都算。
   例外只有：公式、訊號名、封裝名、料號。**知識卡的圖目前是中文，見 §7 的未決事項。**
7. **使用者要的是「上線」**：做完就 commit + push，不要停在「沒有 commit（未指示）」。

---

## 1. 現況（2026-08-05）

| 項目 | 狀態 |
|---|---|
| 面試題 | 38 題全部有圖、**38/38 已轉符號庫畫風**；zh+en 共 76 張 |
| 圖字重疊 | 面試題瀏覽器實測（0.5px、線段真交集）**全庫 0**；知識卡 `svg-overlap` 0 |
| 知識卡 | **152 張**（含 2026-08-01 新增 7 張 ROHM DC/DC 佈局卡，檔 `knowledge-extra5.js`）；圖 80 張 |
| IC 元件庫 | 195 顆；2026-08-02 新增 **2nd Source 比對**（`ds-compare.js`） |
| 知識卡的圖 | 155 張、985 條字串**四語齊全**（2026-08-06，見 §7）；四語瀏覽器實測重疊 0 |
| 全站四語 | 2026-08-06 補完：編輯器 `uiT` 173 條、HTML 寫死中文 **0 處**、面試題 38/38 四語 |
| 硬體新技術 | 新頁 `news.html`，10 則（2026-05～08），每則附出處與日期；每月 1 號更新，流程見 `NEWS-UPDATE.md` |
| 金流保險絲 | 2026-08-06 修：`ECPAY_MODE=live` 時不准 fallback 沙盒（原本 secrets 掉了會靜默送客戶去測試商店） |
| CI | 25 關，本地與線上皆綠（`fcdd45c` success） |
| 部署 | HEAD == origin/main，`https://barrychen1003.github.io/voltsketch/` 已是最新 |
| 上線阻礙 | **網域未買** → Resend 與正式金流都卡在這（§6） |

---

## 2. 2nd Source 比對（本輪新功能，IC 元件庫）

**入口**：`ic-library.html` 頁面上方常駐一列（三欄之上），不必先選料號。
料號詳細頁另有一顆按鈕，作用是把該顆的替換準則帶進上方那列並捲過去。

**流程**：兩份 PDF →（pdf.js 在瀏覽器取文字，檔案不上傳）→ 抽 14 個參數 → 差異表
＋ `ic-data.js` 的 `secondSource` 準則逐條判定 → 報告新分頁 → 「列印 / 存成 PDF」。

| 檔 | 作用 |
|---|---|
| `ds-compare.js` | 抽取規則、diff、judge、四語報告。不碰 DOM，node 可直接測 |
| `ds-compare.test.js` | 66 條斷言（CI 第 6 關） |

**設計上不可退讓的三件事**（改的時候別破壞）：

- **抽不到就是 `null`**，報告標「未擷取」。絕不用猜的值填——這份報告會被拿去做換料決策。
- **判不了就判 `manual`**：準則對不到參數、數值語意不明、商務條件（交期／Tape&Reel）一律人工。
- **判定與顯示語言無關**：準則以 `{match, show}` 傳入，`match` 永遠是中文原文。
  曾經拿翻譯後的字串比對關鍵字，導致同樣兩份 PDF 在英文介面得到不同判定。

**已知限制**：只抽 14 個參數；掃描圖檔版 PDF 取不到文字（會明確報錯，不產空報告）。
要更深的比較得接 LLM——需要金鑰、Edge Function，且 datasheet 會送到外部，
使用者已明確選擇「不上傳」，所以沒做。

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
- **flyback 那 5 題 DB 已有舊圖，回填碰不到** → 非跑 SQL 不可（§5）。

使用者說「沒看到圖」時，先確認是不是瀏覽器快取（`interview.html` 是 `max-age=600`），
或 GitHub Pages 的部署延遲（推上去約一分鐘才生效）；別急著改程式。

---

## 4. 檢查（CI 18 關的本地版）

```bash
node ds-compare.test.js                        # datasheet 比對：抽不到不編造、四語判定一致
node interview-diagram-check.test.js           # 先證明守衛抓得到（6 種壞法，全是通用變異）
node interview-diagram-check.js                # 面試題規格 + 圖字重疊，0 發現才算過
node circuit-check.js --strict                 # 知識卡：接線被吸附塌成零長
node wire-gap-check.js --selftest && node wire-gap-check.js --strict
node symbol-overlap-check.js --selftest && node symbol-overlap-check.js --strict
node svg-overlap-check.js --strict             # 知識卡圖字不重疊
node knowledge-art-audit.js --strict --quiet   # 知識卡圖：接腳真的接上、字離圖形 >=3px（棘輪）
node knowledge-format.test.js                  # 原理說明排版不改內容
node i18n-check.js                             # 改 HTML 後跑
node art-i18n-check.js --strict                # 圖上的字四語齊全（985/985）
node art-lang-render.test.js                   # 三種圖的換語言路徑
node ui-i18n-check.js --strict                 # 編輯器畫面文字（uiT + ui-i18n.js）
node html-i18n-check.js --strict               # HTML 不准寫死中文
node interview-i18n-check.js --strict          # 面試題庫 38/38 四語
node news-i18n-check.js --strict               # 新技術：四語＋每則都要有出處
node ecpay-config.test.mjs                     # 金流保險絲：live 不准 fallback 沙盒
for L in en ja ko; do                          # 改圖或改譯文都要跑：字寬變、座標不變
  node svg-overlap-check.js --strict --lang=$L
  node circuit-check.js --strict --lang=$L
  node knowledge-art-audit.js --strict --quiet --lang=$L
  node wire-gap-check.js --strict --lang=$L
  node symbol-overlap-check.js --strict --lang=$L
done
node tools/interview-diagrams/verify-batch11.js   # 電路類 B 的拓樸/數字斷言
node tools/interview-diagrams/verify-batch12.js   # flyback 的拓樸/極性斷言（66 條）
node tools/interview-diagrams/verify-batch13.js   # 波形/曲線的數值斷言（84 條）
node tools/interview-diagrams/verify-batch14.js   # 表格/剖面的比例與真值表斷言（62 條）
```

`interview-diagram-check.js` 是**估算器**（node 沒有 DOM，字寬靠內建字元寬度表），門檻 2px；
瀏覽器版是 0.5px。**驗收以 `overlap-audit.md` 的瀏覽器 snippet 為準**（已是線段真交集版）。

**棘輪帳（只准降，不准升）**：

| 檢查 | 現況 |
|---|---|
| `wire-gap` | 沒接上 8、多出線頭 6、無標籤自由端 18 |
| `knowledge-art-audit` | 38 張圖 / 139 項（我新畫的 7 張是 0） |

棘輪基線**每個語言一份**（`*-baseline.en/ja/ko.json`）：譯文長度不同，統計本來就不一樣，
拿中文基線去卡英文只會每次都紅。en 138 / ja 140 / ko 130 項，規則不變——只准往下。

改善之後跑 `--update` 把新數字收進基線；**基線只能往下**。

**卡數要現場數，不要抄文件裡的舊數字**（曾經沿用 2026-07-22 的「146 卡」當基準，實際是 145）。
在 `knowledge.html` 的 console 跑這行，側欄 14 類的加總就是權威值：

```js
[...document.querySelectorAll('aside *')].filter(e=>e.children.length===0&&/^\d+$/.test(e.textContent.trim()))
  .reduce((a,e)=>a+ +e.textContent.trim(),0)
```

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

七支都是 2026-08-01 依現行 bank 重新產生的，全部冪等、可重跑。
**改完圖一定要重跑對應的 `gen-*-sql.js`**，否則 SQL 裡是舊圖。
所有 `gen-*-sql.js` 現在都從 `interview-bank.js` 取圖（不要再綁 batch 檔，題目會被下一批重畫）。

---

## 6. 上線三軌（卡在使用者，程式端都備好了）

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

## 7. 知識卡的圖：四語（2026-08-06 完成）

使用者選了「全部都做」。實際範圍比原本估的「80 張 SVG」大：**155 張圖、985 條中文字串**
（原本漏算掛在卡上的 26 張 `CircuitSVG` 圖、卡片自帶的內嵌 svg，以及每張圖上方的圖說）。

字典：`knowledge-art-i18n.js`（key 是中文原文）。三種圖三種換法：

| 圖 | 張數 | 換字時機 |
|---|---|---|
| `CIRCUITS2` 自動補圖 | 80 | **畫的時候**（`T()`/`A()`/`B()` 入口）——`A()` 的標籤閃避是照字寬算的，譯文晚一步換就是拿中文寬度排英文 |
| `CircuitSVG` 掛卡的圖 | 26 | 畫的時候（`CircuitSVG._S()` 包一層 `Sym`，68 個方法不用逐個改） |
| 卡片自帶的內嵌 svg | 其餘 | render 時 `localizeSvgText` 換 `<text>` 內容；含 tspan 的整段不動 |

**翻譯只在開卡片的當下做，不寫回 `this.items`**：localStorage 存的永遠是中文版，
所以切語言不必清快取、也不會有哪個語言被固化進快取（`BUILTIN_VERSION` 因此不用動）。

驗收（見 §4 的指令）：node 五支檢查器 × 四語全綠；瀏覽器實測 **155 張圖 × 4 語、每語 1607 個文字、重疊 0**。

---

## 8. 踩過的坑（別重踩）

**畫圖**

- **符號庫早就存在，我沒用**：`schematic-symbols.js` 檔頭就寫著風格參考。自己刻方框＝跟知識庫完全不同調。
- **`Sym` 的 `opt.label` / `showPins` 一律不能用**：那些字是 8-10px，低於本專案 ≥11。要標就自己用 `T()` 畫。
- **符號比方框佔空間**：先切帶（標題/電路/說明）再放元件。
- **符號庫缺的東西自己組，不要包 `transform`**（檢查器讀不到）：`light.js` 的 `diodeV`、
  `batch11.js` 的 `pnpUp`、`batch12.js` 的 `coilV`/`capH`/`diodeHL`/`fuse`、`knowledge-circuits2.js` 的 `dioV`。
- **`Sym.npn` 的 C/E 寫死（上 C 下 E），`pnp:true` 只換箭頭**，而且那個箭頭方向與它自己的註解不一致。
- **文字中心落在方框內是合法的**（檢查器當成該框的標題），所以 IC 腳名寫框內最省事。
- **一張圖擠 20 個元件時先畫樓層平面**：每個縱向欄位只給一個網路，橫向匯流排只留兩條。
- **圖上宣稱的東西要畫得出來**：標「等長等距」就要真的等長等距（q23 第一版斜段垂距是 19.8 不是 16）。
- **表格的值用算的、剖面圖要有比例尺**，驗證器才驗得到（q14 真值表、q22/q37 的 1mil=8px）。

**檢查器**

- **三支知識卡檢查器會放過「看得出來的斷線」**：`wire-gap` 只驗接線端點、`svg-overlap` 只驗字框相交。
  補了 `knowledge-art-audit.js`（接腳必須有接線碰到、字離圖形 ≥3px）。改知識卡的圖後要跑它。
- **稽核器自己也會有 bug**：第一版把「元件自己的 bbox」算成合法連接目標 → 每支腳都通過。
  **寫檢查器時先確認它抓得到你已知的那個缺陷**，再相信它的乾淨報告。
- **拿線段 bbox 當障礙，斜線會嚴重誤判**：要用線段 vs 矩形真交集（slab 法）。
  瀏覽器 snippet 曾因此在 q18 誤報三筆。兩版對不上時**先確認哪一版的幾何算錯**，不要急著搬圖上的字。
- **自我測試的變異綁死圖上文案，重畫該圖就整組報廢**。六個案例現在全是通用變異。
- **真正的擦邊都在 2px 以下**：node 版看不到，只有瀏覽器版（0.5px）抓得到。

**datasheet 比對**

- **抽取規則一定要拿真 datasheet 驗**：合成測試全過、真檔一跑四處出錯——
  TI 的溫度寫成「–40 125 °C」（en-dash、沒有 to、°C 只出現一次）、封裝寫成「RTE (WQFN, 16)」、
  目錄行「4 Pin Configuration」被當成腳數 4、內部基準的「Output voltage 1.25V」被當成 VOUT。
- **一份 datasheet 涵蓋整個系列是常態**（`ads112c14.pdf` 與 `ads122c14.pdf` 逐字相同）。
  沒有偵測就會產出「參數全部相同 → 可以換」這種害人的結論。`sameDoc()` 會把所有判定轉人工並標紅字。
- **翻譯後的字串不能拿來做邏輯比對**：判定會跟著介面語言跑掉。原文比對、翻譯只用於顯示。

**UI**

- **入口埋在詳細頁最底部＝沒有入口**。使用者第一句話是「沒有可以上傳檔案的地方」。
  常用功能放頁面上方，而且不要求使用者先選好某顆料。
- **兩個檔案選擇器不值得一個 modal**。使用者原話：「太大材小用」。

**版面 / 資料**

- **`main` 是 flex item 又帶 `margin:0 auto`**：給 SVG 固定寬會把整頁撐寬出現橫捲。
- **seed 抽題時把 SVG 剝掉了**：DB 只剩空的 `<div class="exam-diagram-box"></div>`，而 ja/ko 反而有圖。
  遇到「圖不見了」先查 DB 欄位，不要假設是前端問題。
