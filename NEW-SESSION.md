# NEW SESSION — 接手指南（2026-08-15）

先讀本檔（現況、上輪做了什麼、待辦），再讀 `HANDOFF.md`（長期硬規矩、開發環境、踩過的坑）。
動 `Documents/Web` 前務必讀完這兩份；兩份衝突時以本檔為準。
**上線的順序與剩餘關卡看 `LAUNCH-GUIDE.md`**（那份是站主照著點的操作手冊，本檔不重複）。

**站已經上線了**：`https://hardware-ai.org`，Cloudflare Workers 靜態資產，推 main 自動部署。
帳號系統可用（驗證碼註冊、站主全權限）、資料庫每週自動備份。
**還沒能收錢**——綠界特約商店要等使用者送件核准（見 §6）。

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
   例外只有：公式、訊號名、封裝名、料號。**任何新增或修改的內容都算，不只新功能**（使用者 2026-08-06 指示）。
7. **使用者要的是「上線」**：做完就 commit + push，不要停在「沒有 commit（未指示）」。

---

## 1. 現況（2026-08-15）

| 項目 | 狀態 |
|---|---|
| **正式站** | `https://hardware-ai.org`（Cloudflare Workers，推 main 自動部署）。HTTPS、安全標頭、`.git` 不外流，全部實測過 |
| **帳號** | 註冊走**驗證碼**（不是連結）；Resend SMTP 已接、四語模板已貼；站主 `smallshark1003@gmail.com` 是 admin＋owner＋額度 9999 |
| **資料庫備份** | ✅ 每週日自動 `pg_dump` → GitHub artifact。**還原演練還沒做** |
| **金流** | 程式全備好，**Functions 還沒部署**、綠界特約商店還沒申請 |
| 面試題 | 38 題全部有圖、38/38 符號庫畫風；DB 種子與 flyback 修圖 SQL **已全部跑完** |
| 知識卡 | 152 張；圖 155 張、985 條字串四語齊全；瀏覽器實測重疊 0 |
| IC 元件庫 | 196 顆全建檔；2nd Source 比對（`ds-compare.js`）；datasheet 連結指 TI 官網（`ic-datasheet.js`） |
| 硬體新技術 | `news.html` 分頁（每頁 8 則，最新在第 1 頁）；`kind` 分 news／paper |
| 新技術自動更新 | 本機排程：新聞每天 09:00/12:00/21:00、期刊研討會每月 1 號，**直接 push main** |
| 全站四語 | HTML 寫死中文 0 處；編輯器 `uiT` 全覆蓋 |
| 線路圖編輯器 | 鎖色預設開、0Ω 顯示得出來、背景格線無邊界、快捷鍵四語 |
| PCB | 邀請碼閘門會看 `pcb_access`／`admin` 自動放行（12 個月方案的承諾終於兌現） |
| CI | 26 關，本地與線上皆綠 |

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
或 Cloudflare 的部署延遲（推 main 後約一分鐘生效）；別急著改程式。

---

## 4. 檢查（CI 26 關的本地版）

```bash
node ds-compare.test.js                        # datasheet 比對：抽不到不編造、四語判定一致
node pin-extract.test.js                       # 腳位抽取：先證明守衛抓得到 4 種壞法，再驗真 fixture
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

## 5. 面試題 SQL：✅ 2026-08-15 全部跑完

站主已跑完 `01-core` → `02-interview-i18n` → `03-interview-pcb` →
`04-batch2-1~5of5` → `flyback-fix-1~5of5`。DB 裡的題目與圖都是最新的。

**兩件會再踩到的事**：

1. **大檔貼不進 SQL Editor**。面試題 SQL 內嵌 SVG，單行 20–50 KB，
   整檔貼會被截斷，報 `ERROR: 42601: syntax error at end of input`。
   已拆成 `04-batch2-*of5.sql`（各 52 KB）與 `flyback-fix-*of5.sql`（各 22 KB），
   **用拆檔不要用原檔**。詳見 `supabase/sql/RUN-ORDER.md`。
2. **Supabase 會誤判「這個 query 建了沒開 RLS 的表」**。那些檔只有 insert/update，
   一張表都沒建（它甚至把 SQL 裡的英文單字 `the` 當成表名）。**一律按 Run without RLS**。
   `interview_questions` 的 RLS 在 `supabase/sql/01-core.sql` 就開好了，可用這句自己驗：
   ```sql
   select relname, relrowsecurity from pg_class where relname = 'interview_questions';
   ```

**改完圖一定要重跑對應的 `gen-*-sql.js`**，否則 SQL 裡是舊圖。
所有 `gen-*-sql.js` 都從 `interview-bank.js` 取圖（不要再綁 batch 檔，題目會被下一批重畫）。

---

## 6. 上線：已完成與剩餘（完整操作步驟在 `LAUNCH-GUIDE.md`）

### 已完成（2026-08-15）

網域 `hardware-ai.org`（Cloudflare Registrar）→ 搬到 Cloudflare Workers →
安全標頭 → canonical/sitemap/robots 全站換網域 → Supabase 建表 →
站主全權限 → Resend SMTP＋驗證碼 → 資料庫備份。

### 剩餘（卡在使用者）

| 事 | 誰 | 備註 |
|---|---|---|
| 綠界特約商店申請 | 使用者 | 3–5 工作天。**先送件，等的時候做別的** |
| `supabase login` + 部署兩支 Function | 使用者 | `create-order`、`ecpay-webhook --no-verify-jwt` |
| 營業登記／統一發票／定型化契約／個資跨境 | 使用者問會計師 | **不要替他猜法規**，只列出要問什麼 |
| Supabase 免費層夠不夠 | 使用者確認 | 收錢後被暫停是客訴 |
| Search Console + GA4 | 使用者 | 網域已定，可以辦了 |

### 剩餘（我做，等使用者先動作）

| 事 | 前提 |
|---|---|
| 綠界沙盒五項驗證 | Functions 部署後。**沙盒沒過絕不切正式** |
| 電子發票串接（`TODO.md` A4） | 綠界核准後 |
| **D1 資安總檢** | 隨時可開始。**建議排在正式收款之前** |
| 備份還原演練 | 隨時。備份沒還原過不算備份 |

**綠界不必因為換網域而改**：`ReturnURL` 指 Supabase functions、與站台網域無關；
`ClientBackURL` 取 request 的 `origin`。

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

## 7b. 使用者已裁決（2026-08-14 提的六件，全部結案）

| # | 事 | 結果 |
|---|---|---|
| 1 | 法律頁的聯絡信箱 | ✅ 改成 `smallshark1003@gmail.com`，四語同步，`ui_mail_todo` 提示整條刪除 |
| 2 | 站主要用哪個 Gmail | ✅ 確認是 `smallshark1003@gmail.com`（`supabase/sql/owner-unlock.sql` 原本就對，不用改） |
| 3 | IC 符號畫風要不要翻成「腳號在框外、腳名在框內」 | ✅ **不改**。維持現行「號內名外」，196 顆與 `ic-preview.html` 的說明都不動 |
| 4 | 線上 datasheet 連結 404 | ✅ 改連 TI 官網（`ic-datasheet.js`）。詳情與實測數字見 §7c |
| 5 | 新技術每月更新 | ✅ 改排程：本機任務 `hardwareai-news-monthly`，每月 1 號 09:00，開 PR 不 push main（見 `NEWS-UPDATE.md` 開頭） |
| 6 | 編輯器快捷鍵說明 | ✅ 補齊四語：Ctrl+C/V/X、Ctrl+A/Z/Y、方向鍵平移（Shift 大步）、Esc、H/V 翻轉 |

## 7c. datasheet 連結：改連 TI 官網（2026-08-14 完成）

**當初的問題描述不準，這裡是實際查證後的版本**：

- 元件庫的 196 顆**全部已建檔**（`IC_DATA.length === 196`，瀏覽器實測）。
  「104 顆」那個數字是 `grep -c "^    part:"` 數出來的，`ic-data.js` 有些條目縮排不同，漏數了 92 顆。
  **數量要在瀏覽器問資料本身，不要用縮排當 pattern grep。**
- 已建檔的料**詳細頁本來就沒有 datasheet 連結**（`detailCard()` 沒放這一列）。
- 會 404 的其實是兩個地方：
  1. `ic-library.html` 的 `notBuilt` 分支硬寫 `IC-spec/<part>.pdf`——但 196 顆都建檔了，
     這條路只有在使用者自己打一個不在庫裡的料號時才走得到。
  2. `ic-export.js` 把 `ic.datasheet` 原封不動寫進 KiCad 符號的 Datasheet 屬性。
     那個欄位**格式根本不一致**：106 筆是 `IC-spec/xxx.pdf`（本機死路徑）、
     13 筆是完整網址、77 筆是人看的引用字串（`Microchip DS00002117`）。
     所以每一份匯出的符號檔，Datasheet 屬性都不是可以點的東西。

**兩條路的實測數字**：

| 路 | 代價 |
|---|---|
| PDF 進 repo | `IC-spec/` = **255 個 PDF、718 MB**。GitHub Pages 建議整站 ≤1 GB，clone 也會變很痛。否決 |
| 改連 TI 官網 | URL 規則 `https://www.ti.com/lit/ds/symlink/<料號>.pdf`。2026-08-14 對 196 顆逐一發請求（不是憑印象）：**183 顆 200 且 content-type 是 application/pdf，13 顆 404**。假料號正確回 404（拿 `zzzznotarealpart123` 驗過），所以不是「什麼都給 200」。**採用** |

**做法**：新增 `ic-datasheet.js`，`ICDatasheet.datasheetUrl(part, ic)` 依序試
① `ic.datasheetUrl` ② `ic.datasheet`（僅當它是 http/https）③ TI 規則 ④ 回 `null`。
回 `null` 時呼叫端**不放連結**，改顯示「這顆不是 TI 的料，請到原廠網站查」（四語）。
接上的地方：`ic-library.html` 的 `notBuilt` 分支、`ic-export.js` 的 Datasheet 屬性。
實測：KiCad 匯出 184 顆得到真網址、12 顆留空（原本 196 顆全是死字串）。

12 顆非 TI 且沒有網址（新增這類料號時請填 `datasheetUrl`，否則會產出指向 TI 的死連結）：
`ADG601_602`、`DRV7167`、`KSZ9031RNX`、`LAN8710A`、`W25Q128JV`、`RT6150`、
`AXP209`、`X4003`、`NX48P0407`、`EFR32BG24L`、`DS1230Y`、`SLG59H1403C`。

**還沒做（使用者當時選的是「只改連結」）**：詳細頁仍然沒有 datasheet 那一列。
要加就是在 `detailCard()` 補一列 + 兩條四語字串，`ICDatasheet` 已經備好了。

## 7d. 「使用者自己建一顆 IC」現在能做到哪（2026-08-14 實測）

使用者問：別人想建新的 IC，要怎麼上傳 datasheet PDF 然後建一顆料來畫？現況：

| 環節 | 狀態 |
|---|---|
| 入口 | ✅ 線路圖頁左欄「＋ 自訂 IC（多腳）」→ 填名稱 + Pin 表（每行 `編號,名稱,側別(L/R/T/B),類型`，側別可省略走 DIP 分配）→「建立並放置」 |
| 手打 pin 表 | ✅ 通的。建完就能拉線、能匯出 |
| 「從 PDF 預填」 | ✅ 2026-08-14 重寫（`pin-extract.js`），詳見 §7e |
| 存到哪 | localStorage `voltsketch-ics`，**只在他自己的瀏覽器**。不會進站上那 196 顆，別人看不到 |
| 上傳 PDF 到伺服器 | ❌ 沒有，也是刻意的——PDF 一律在瀏覽器內解析不上傳（ds-compare 同樣設計） |

**「從 PDF 預填」壞在哪**（拿 `IC-spec/` 的真 datasheet 實測，不是推測）：
pdf.js 取文字沒問題（ads112c14 抽到 199,505 字元、945 ms）。壞的是 `pdf-parser.js`（已刪除，2026-08-14 由 `pin-extract.js` 取代）
只有兩條非常粗的 regex，抽出來的是這種東西：

| datasheet | 實際腳數 | 抽出列數 | 樣本 |
|---|---|---|---|
| `sn74lvc1g07` | 5 | 30（9 個相異編號） | `2025,Texas`、`4,Thermal`、`1,Application` |
| `ads112c14` | 16 | 153 | `4,Thermal`、`1,Analog`、`14,Conversion` |
| `iso7741u` | 16 | 87 | `1577,and`、`2026,Texas` |

## 7e. 腳位抽取重寫（2026-08-14）

檔：`pin-extract.js`（純函式，node 可測）＋ `pin-extract.test.js`（CI 用）
＋ `tools/pin-extract/verify.html`（拿 `IC-spec/` 的真 PDF 批次驗證，不上線）。
`pdf-parser.js`（已刪除，2026-08-14 由 `pin-extract.js` 取代） 已刪除。

**壞在哪**：舊版把整頁文字 `join(' ')` 成一長串再套兩條 regex。表格的欄位結構在
join 的那一刻就沒了，所以抽到的是頁尾版權年份與章節標題。

**新做法**：用 pdf.js 給的座標。依 y 分行、行內依 x 排序，再把**內容**的 x 分群當欄位，
依每群的內容判斷誰是腳號欄、誰是腳名欄。抽不到就回 `ok:false`，**不動 textarea**。

**踩到的四個坑**（都是拿真 datasheet 才會出現的）：

1. **表頭字是置中的、欄位內容是靠左的**。第一版拿表頭 x 當欄位左邊界，
   TYPE 欄（表頭置中在 219.7，內容從 201.2 開始）整欄被吃進 NAME，
   抽出 `VDD1High-sidepower`。→ 欄位改由內容的 x 分群決定。
2. **TI 的註腳上標 `(1)` 基線比內文高**，被切成獨立一行，長得像「表格結束的註腳」，
   一遇到就 break，整張表一列都沒讀到。→ 真註腳在 `(n)` 後面還有字，上標那行拿掉 `(n)` 就空了。
3. **`NC — — —` 是「這個封裝沒有這支腳」，不是名稱換行**。第一版當成待接的名稱，
   下一列就變成 `NCOUTA`。
4. **腳號欄不一定緊鄰腳名欄**（ADS112C14 的腳名換行文字自成一群夾在中間），
   **腳名可以用數字開頭**（74 系列的 `1A`/`2Y`），**腳號可以不是數字**（DSBGA 的球號 `A1`/`B1`）。

**實測結果（2026-08-14，193 顆有腳位資料的料；答案取 `ic-data.js` 人工核對過的腳位）**：

| 結果 | 數量 | 意思 |
|---|---|---|
| 完全正確 | **77** | 腳號與腳名跟人工核對過的答案一致 |
| 部分正確 | 37 | 對到 ≥60%，通常是少幾腳或名稱換行沒接好 |
| 錯得多 | 34 | 對到 <60% |
| 明講「讀不出來」 | 35 | 不產出任何東西、不動 textarea（16 找不到表、18 讀不出欄位、1 表下無內容） |
| 讀檔失敗 | 10 | 本機沒有那份 PDF |

**最重要的一條：腳號抽對不代表腳名抽對。**
只靠「缺號」警告的話，量到有 **26** 份是「腳號 1..N 連號、看起來乾淨，但腳名整欄抓錯」——
使用者會直接相信。所以加了四個信號：腳名重複率、腳名長度（抓到 TYPE 欄的徵兆）、
多封裝提醒、以及拿 datasheet 自己寫的「65-pin LGA」對帳腳數。

最後量到的安全性（148 份有產出的）：**51 份完全沒警告，其中只有 3 份是錯的**
（TPS25751A、CC2755P10、CC2755R10）；其餘 97 份都至少帶一條警告。
**這幾個數字每次改抽取規則都要用 `tools/pin-extract/verify.html` 重量，不准用推的。**

**已知還沒解的**：跨很多頁的大表（CC3300MOD 是 65 腳橫跨 4 頁，只抽到前 8 腳）——
續頁的續讀還是會停。現在靠「datasheet 說 65 腳、只抽到 8 腳」的對帳警告擋住，
不會安靜地給錯的東西，但也還沒真的抽全。

---

## 7f. 上線那一輪的關鍵設定（2026-08-15）

改這些之前先看，每一項都是踩過才長這樣。

### 部署（Cloudflare Workers 靜態資產）

四個檔控制部署，全在 repo：`wrangler.jsonc`／`.assetsignore`／`_headers`／`_redirects`。

| 設定 | 為什麼非這樣不可 |
|---|---|
| `wrangler.jsonc` 存在 | **沒有它 Cloudflare 會自動產一份** `assets.directory: "."`，把 `.git/`、`supabase/`、所有內部 `.md` 放上公開網站（實測 `/.git/config` 回 200） |
| `html_handling: "none"` | 預設會把 `/news.html` 307 導到 `/news`，但全站連結與 canonical 都寫 `.html`，會變成每次導覽多一次轉址、canonical 指向沒在服務的網址 |
| `_redirects` 的 `/ /index.html 200` | 上一項的副作用是根路徑變 404。**要用改寫（200）不是轉址**，網址列不變才對得上 index 的 canonical |
| `routes` + `custom_domain` | 「只有靜態資產」的 Worker，儀表板沒有 Domains & Routes 那區，自訂網域只能寫在設定檔 |
| `workers_dev: false` | 同一份內容掛多個網址＝重複內容；而且 `create-order` 的 `ClientBackURL` 取 request origin，付款不該有第二個入口 |

改完**一定要實際 curl 幾個不該公開的路徑確認是 404**，不要只看建置成功。

### 註冊改用驗證碼（不是連結）

三處必須一致，只改一處就會壞：

| 檔 | 做什麼 |
|---|---|
| `supabase/email-templates/confirm-signup.html` | `{{ .Token }}`（**不是** `{{ .ConfirmationURL }}`） |
| `auth.js` | `verifySignup()` 走 `verifyOtp({type:'signup'})`、`resendSignup()` 重寄 |
| `login.html` | 註冊後切驗證碼步驟；登入遇「未驗證」會自動重寄並切過去 |

**畫面文案不准寫死位數**：位數由 Supabase 的 Email OTP length 決定（站主目前設 8），
寫「6 位數」就會跟實際不符。

### 資料庫備份

secret 只有一個：**`SUPABASE_DB_PASSWORD`，值是密碼本身**（不是連線字串）。
主機／使用者／port 寫死在 workflow 的 `env`，因為那三個值連續害我們失敗三次：

| 症狀 | 真因 |
|---|---|
| `socket "@@]@db...supabase.co/.s.PGSQL.5432"` | 密碼含 `@` `]` 沒編碼，URI 被切錯 |
| 連不上 | Direct connection 主機只有 IPv6，GitHub Actions 沒 IPv6 → 要用 Session pooler |
| `password authentication failed for user "postgres"` | **不是使用者名稱錯**。pooler 就是這樣顯示，`.<ref>` 只用於路由。真因是密碼 |

### 免費層做不到的事

**Leaked password protection 是 Pro 方案才有的**（畫面自己寫 "Only available on Pro plan and above"）。
免費層的替代：把 Minimum password length 從 6 調到 8、Password requirements 選有字元要求的。

---

## 8. 踩過的坑（別重踩）

- **翻轉的補償要繞字的視覺中心**，不要繞錨點：字身在基線上方，垂直鏡射後會整塊位移一個字高。
  另外 `DOMMatrix` 解析不了 SVG 的三參數 `rotate(deg cx cy)`（T/B 腳名就是這種），
  要用 `el.transform.baseVal.consolidate().matrix`。稽核 snippet 與四語實測數字在 `overlap-audit.md`。
- **「已經有這個功能」不等於「使用者用得到」**：activeColor 早就套用到新元件了，但顏色框沒選東西時 disabled，
  等於永遠沒機會先選色；改功能前先照著使用者的操作路徑走一次。
- **改預設值救不了既有使用者，如果開場就把預設寫進 localStorage**：`setColorLock()` 連開場還原那次
  也 `setItem('vs-color-lock','0')`，所以「沒存過才套新預設」對每一台用過的瀏覽器都無效
  （2026-08-14 在瀏覽器實測抓到：改完 `colorLock` 仍是 false，`storedOld` 是 `'0'`）。
  兩件事一起做才有用：**換 key**（`vs-color-lock-v2`）＋**還原時不寫回**（只有使用者真的按過開關才存）。
- **`if (c.value)` 會把 0 當成「沒填」**：0Ω 跳線、0V 都是合法值，標籤整行消失。
  值的有無一律用 `hasValue()`（`!= null && !== '' && !NaN`）判斷，別用真值。
  同一個坑在四個地方：overlay 繪製、`hitTestLabel`、inspector 回填（`comp.value || ''`）、`formatValue` 的 fallback。
  順帶：`simulateDC` 的 `r.value || 1` 會把 0Ω 當 1Ω，允許 0 之後就是錯的。
- **背景格線與底色是兩塊寫死 1000×700 的 `<rect>`**：一縮小或平移出去就看到格子的邊界與白邊。
  改成每次 `setViewBox()` 就依現在的視框重鋪（`syncBackdrop()`，外加半個視框餘裕）；
  所有改視框的地方都要走 `setViewBox()`——`fitView()` 原本自己 `setAttribute('viewBox')` 繞過去了。

**畫圖**

- **符號庫早就存在，我沒用**：`schematic-symbols.js` 檔頭就寫著風格參考。自己刻方框＝跟知識庫完全不同調。
- **`Sym` 的 `opt.label` / `showPins` 一律不能用**：那些字是 8-10px，低於本專案 ≥11。要標就自己用 `T()` 畫。
- **符號比方框佔空間**：先切帶（標題/電路/說明）再放元件。
- **符號庫缺的東西自己組，不要包 `transform`**（檢查器讀不到）：`tools/interview-diagrams/light.js` 的 `diodeV`、
  `tools/interview-diagrams/batch11.js` 的 `pnpUp`、`tools/interview-diagrams/batch12.js` 的 `coilV`/`capH`/`diodeHL`/`fuse`、`knowledge-circuits2.js` 的 `dioV`。
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

**上線／部署（2026-08-15 新增）**

- **部署設定沒收進 repo，代管平台會自己產一份**——Cloudflare 產的那份把整個工作目錄當網站上傳。
  部署後要**實際 curl 幾個不該公開的路徑**確認 404，不能只看「建置成功」。
- **只看 HTTP 狀態碼會漏掉轉址**：`/news.html` 回 200，但那是 307 之後的 200。
  驗網址行為看 `curl -I` 的第一行與 `Location`，不要用 `-L` 之後的狀態碼下結論。
- **排除檔案前先掃三種引用**：HTML 的 `src/href`、程式裡的 `fetch()`、
  以及 `createElement('script')` 這種動態插入（`pcb-3d.js` 就是這樣載 three.js）。
  差點把網站在用的 `ai-checker.js`、`schematic-check.js` 當 CI 工具排掉。
- **錯誤訊息會指向錯的地方**：pooler 回 `password authentication failed for user "postgres"`，
  我據此判斷「使用者名稱少了 .<ref>」並要使用者改——**那是誤判**，pooler 本來就這樣顯示。
  同一個症狀連錯三輪之後才改設計：把固定值寫死、只留一個變因。
  **同一個東西連錯兩次就該換設計，不是換參數。**
- **付費功能會長得像設定沒開**：Leaked password protection 顯示 DISABLED 但點不動，
  因為它是 Pro 專屬。叫使用者去開之前先確認方案有沒有那一項。
- **大檔貼不進 Web SQL Editor**：內嵌 SVG 讓單行 20–50 KB，整檔貼會被截斷，
  症狀是 `syntax error at end of input`。拆檔時**逐字驗證與原檔一致**再交出去。
