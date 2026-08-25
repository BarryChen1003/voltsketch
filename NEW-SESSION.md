# NEW SESSION — 接手指南（2026-08-24，第二次更新）

先讀本檔，再讀 `HANDOFF.md`（長期規矩、開發環境、踩過的坑）。兩份衝突時**以本檔為準**。

> **站已經上線，而且在收真錢。** `https://hardware-ai.org`（Cloudflare Workers 靜態資產，推 main 自動部署）。
> 任何動到 `supabase/functions/`、`_headers`、`vendor/` 的改動，都可能讓真實客戶付不了款或整頁停擺——動之前先讀 §3。

> **這一輪的主題：把 PCB Layout 補強。** 現況地圖在 §2，工作計畫在 §8。
> 這塊的問題不是「沒有功能」，是**大部分功能沒有測試**——先讀 §7 再動手。

---

## 0. 硬規矩

1. **圖字絕不重疊、元件絕不互疊**。改完圖跑幾何檢查（§5），再用瀏覽器實測收尾。
2. **不憑印象畫電路／腳位／規格**。沒有可查證依據就不畫、不填；抽不到就標「未擷取」。
3. **元件符號一律用 `schematic-symbols.js`（`Sym`）**。自己刻方框已被使用者退過一次。
4. **改知識卡內容或自動圖 → 同步遞增 `BUILTIN_VERSION`（knowledge.js）與 `?v=`（knowledge.html）**。
   改 `app.js`／`pcb.js` → 遞增對應 HTML 的 `?v=`，否則使用者拿到的是快取的舊檔（2026-08-21 踩過）。
5. **只驗重疊不夠**。每張圖、每個功能都要有「畫的數字／算的結果對不對」的斷言。
6. **新功能一律四語**（zh / en / ja / ko）。**任何新增或修改的內容都算，不只新功能。**
7. **做完就 commit + push**，不要停在「沒有 commit（未指示）」。
8. **要使用者跑 SQL 或指令時，把完整內容貼進對話**，不要只給檔案路徑叫他自己去開。
9. **宣稱「完成／修好」之前先實際驗證**。跑測試、貼 exit code、實際呼叫一次。
   **要寫進對外文案的功能，先在瀏覽器實跑一次**——2026-08-21 就是這樣抓到「直流模擬」名不副實。
10. **新視窗裡的 inline script 與 inline onclick 一律不會執行**（繼承本站 CSP）。
    用 `window.open` + `document.write` 開出來的頁面，動作要由開啟它的那一頁掛 listener 或直接呼叫。
    已中招兩次：2nd source 報告的列印鈕、線路圖的 PDF 匯出。
11. **`core.autocrlf=true`：本機 HTML 是 CRLF，git 與線上是 LF**。任何「比對檔案位元組」的
    檢查器都要先 `.replace(/\r\n/g, '\n')`。`csp-hash.js` 已修（2026-08-24）；
    再寫類似的工具記得比照，否則會出現「本機紅、線上綠」或更糟的「本機重算後上線全炸」。

---

## 1. 現況（2026-08-24）

| 項目 | 狀態 |
|---|---|
| **正式站** | `hardware-ai.org`（Cloudflare Workers）。HTTPS、安全標頭、`.git` 不外流、`www` 301 |
| **金流** | ✅ 正式收款中。綠界正式金鑰已設、真卡實測通過並退刷 |
| **帳號** | 驗證碼註冊（不是連結）、Resend SMTP、站主 `smallshark1003@gmail.com` 是 admin |
| **密碼重設** | ✅ 2026-08-21 修好。之前信件連結回到 `login.html`，但頁面沒有「設定新密碼」那一步 |
| **權限** | PCB 隨**任何 VIP 方案**開通；面試題庫限 12 個月方案。**到期會自動失效** |
| **CSP** | ✅ 嚴格模式。`script-src` 無 `unsafe-inline`，16 段 inline script 逐段雜湊 |
| **前端相依** | ✅ 4 支程式庫自行代管於 `vendor/`（釘版本＋SHA-256），全站零外部腳本 |
| **Gerber** | ✅ 產生器在後端（`supabase/functions/_shared/gerber.mjs`，592 行），前端拿不到 |
| **備份** | 每週日 `pg_dump` → GitHub artifact，含 `auth` schema。**還原演練腳本已寫好但未跑過真檔** |
| IC 元件庫 | 196 顆全建檔；2nd source 比對可用（見 §7） |
| CI | 29 關，本地與線上皆綠 |

---

## 2. PCB Layout 現況地圖（這一輪的主戰場）

| 檔 | 行數 | 內容 | 有沒有測試 |
|---|---|---|---|
| `pcb.js` | 3038 | 編輯器主體：擺件、走線、鋪銅、DRC、autoRoute、差分對、等長調諧、KiCad 匯出 | 🟡 `pcb-logic.test.js` 148 條斷言（§8 階段 A 做掉一半） |
| `pcb-stackup.js` | 290 | 疊層編輯器、Via padstack、Backdrill 殘樁、`geomFor()` 層感知阻抗幾何 | ✅ 背鑽與 geomFor 已測 |
| `pcb-fabs.js` | 250 | **中立多廠 DFM**：JLCPCB／PCBWay／OSH Park／Seeed 能力檔＋檢查器 | ✅ 含「未公開欄位不可編數字」的斷言 |
| `pcb-rules.js` | 373 | NetRules、Ratsnest、AutoRoute（A* 單層繞線） | ✅ 淨空遵從、板邊淨空已測 |
| `footprint-gen.js` | 268 | 依封裝產 footprint | 🟡 `reffp-check.js` 只驗公版對得上 |
| `supabase/functions/_shared/gerber.mjs` | 592 | Gerber / Excellon / CPL / IPC 產生（後端） | ✅ `gerber-check.js` 473 條斷言、跨 8 片公版 |
| `pcb-refboards.js` | — | 8 片參考公版（2／4／8 層） | ✅ 被 gerber-check 用 |
| `supabase/functions/pcb-thermal` | — | 熱模擬 Edge Function | ❌ 無 |

`pcb.js` 裡已經有的功能（行號用 `grep -n` 對得到）：

| 功能 | 位置 | 狀態 |
|---|---|---|
| 疊層產生 `buildLayerStack(n)` | :81 | 沒有獨立測試 |
| DRC `runDrc()` / `loadDrcRules()` | :735 / :926 | 沒有獨立測試 |
| KiCad 匯出 `exportKicad()` | :1061 | 結構驗過，**沒人用真的 KiCad 開過** |
| EMI 檢查 `runEmiCheck()` | :1325 | 沒有測試 |
| 熱檢查 `runThermalSimple()` | :1390 | 沒有測試 |
| 差分對間距 `diffGapOf()` | :1747 | 沒有測試 |
| 等長調諧 `meanderTune()` | :1762 | **沒有測試**（蛇形補償的長度數學沒人驗過） |
| 走線規則稽核 `checkTraceRules()` | :1819 | 沒有測試 |
| 自動繞線 `autoRoute()` | :2155 | 沒有測試；**一次只處理 30 條**（`cap = 30`） |
| 使用者鋪銅 `state.userZones` | :35 | 沒有測試 |

---

## 3. 動這幾個檔之前先讀（會讓真實客戶出事）

### `_headers`（CSP）
- **改任何一段 inline `<script>` 之後，一定要跑 `node csp-hash.js`**，否則那段上線後被自己的 CSP 擋掉。
- **不准加 inline 事件處理器**（`onclick=`）。`csp-hash.js` 會直接 FAIL。
- 三個 directive 改了會**靜靜壞掉**：`form-action` 少綠界網域（沙盒與正式是不同網域）→ 付款沒反應；
  `frame-src` 少 `falstad.com` → 模擬器不動；`connect-src` 少 Supabase → 全站 API 死掉。

### `supabase/functions/`（金流與 Gerber）
- 改完**必須重新部署**：
  ```
  npx --yes supabase functions deploy <名稱> --project-ref dmkxjawjrmltmrmkebbs --use-api
  ```
- **`ecpay-webhook` 要加 `--no-verify-jwt`**；**`pcb-export` 與 `create-order` 絕對不要加**。
- `--use-api` 是必要的（本機沒跑 Docker）。
- webhook 的回應規則：**任何 DB 失敗都不准回 `1|OK`**。

### `vendor/`
- 內容與 `vendor/README.md` 的 SHA-256 必須相符，`vendor-check.js` 在 CI 顧著。
- `.gitattributes` 把 `vendor/**` 標成 `-text`。**`pdf-3.11.174.worker.min.js` 的檔名不能改**。

### 快取版號
- 改 `app.js` → 遞增 `index.html` 的 `app.js?v=`；改 `pcb.js` → 遞增 `pcb.html` 的對應版號。
  忘了改＝使用者拿到舊檔，而且你在本機測起來完全正常（2026-08-21 踩過）。

---

## 4. 只存在本機、不在 git 的報告

repo 是**公開**的，所以「還沒修好的問題清單」不能進 git：

| 檔 | 內容 |
|---|---|
| `SECURITY-AUDIT-D1.md` | D1 資安總檢，D-1～D-9 編號與修復狀態 |
| `SANDBOX-VERIFY.md` | 綠界驗證進度 |
| `BACKUP-RESTORE-DRILL.md` | 備份還原 runbook |

**找到新的資安問題：寫進本機報告，不要 commit。**

---

## 5. 檢查（CI 29 關的本地版）

```bash
# PCB（這一輪最相關）
node gerber-check.js               # 8 片公版、473 條結構與幾何斷言
node gerber-readback.js   # 把匯出的 Gerber 解回幾何，跟原始板逐條比對
node gerber-pour.test.js  # 鋪銅避讓間隙與熱風焊盤輻條（判讀 Gerber 極性）
node pcb-mfg.test.js      # 淚滴/縫合孔/鑽孔表/拼板 的幾何合法性
node gerber-mfg.test.js   # 上面那些有沒有真的進匯出檔（含前後端鑽孔表對齊）
node sch2pcb.test.js      # 線路圖轉 PCB：封裝是不是真的、對不出來的有沒有講
node pcb-logic.test.js
node reffp-check.js

# 金流與權限
node ecpay-config.test.mjs
node plan-dates.test.mjs

# 前端供應鏈與 CSP
node vendor-check.js --strict
node csp-hash.js --check

# 線路圖
node net-label.test.js
node circuit-check.js --strict
node svg-overlap-check.js --strict
node wire-gap-check.js --selftest && node wire-gap-check.js --strict
node symbol-overlap-check.js --selftest && node symbol-overlap-check.js --strict
node knowledge-art-audit.js --strict --quiet

# 資料與抽取
node ds-compare.test.js            # datasheet 比對
node ic-extract.test.js            # 建庫驗證器
node pin-extract.test.js

# 四語
node i18n-check.js
node ui-i18n-check.js --strict
node html-i18n-check.js --strict
node art-i18n-check.js --strict
node interview-i18n-check.js --strict
node news-i18n-check.js --strict
node art-lang-render.test.js

# 面試題圖
node interview-diagram-check.test.js && node interview-diagram-check.js
node knowledge-format.test.js
```

改圖或改譯文要跑四語版本：

```bash
for L in en ja ko; do
  node svg-overlap-check.js --strict --lang=$L
  node circuit-check.js --strict --lang=$L
  node knowledge-art-audit.js --strict --quiet --lang=$L
  node wire-gap-check.js --strict --lang=$L
  node symbol-overlap-check.js --strict --lang=$L
done
```

**棘輪帳只准降不准升**，每語一份基線（`*-baseline.en/ja/ko.json`）。

---

## 6. 使用者要你怎麼做事

- **給證據，不要給保證。** 他吃「我跑了 X，輸出是 Y」，不吃「應該可以了」。
- **要他跑指令／SQL 時，內容直接貼進對話**（硬規矩 8）。
- **他會自己實測，而且會抓到你漏的**。PDF→IC、2nd source、密碼重設都是他先發現不能用。
- **他問「這些功能都驗過嗎」的時候，答案要是實測結果，不是讀過程式碼的印象。**
- **他推翻你的建議時，那是他的決定**，照做並講清楚代價，不要再勸一次。
- **不要順手重構沒叫你動的東西。**

---

## 7. 已知缺陷（有畫面但不能用／不可信）

**這一段最重要。** 這個 repo 反覆出現同一種失敗：功能有 UI、按下去有反應、但結果錯或沒用。

| 功能 | 實際狀況 |
|---|---|
| **PCB 進階功能** | 🟢 2026-08-24 全數釘住：等長蛇形、疊層、背鑽、autoRoute（含多層）、DRC、差分間距、走線稽核、EMI 迴路面積、熱簡估、Gerber 讀回幾何，合計 **287 + 195 + 31 + 118 + 61 + 70** 條斷言（邏輯／Gerber 讀回／鋪銅幾何／製造功能／製造匯出／線路圖轉 PCB） |
| **8 片公版自己過不了 DRC** | 🔴 **2026-08-24 實測確認，不是誤判**。合計 388 個 error：VBUS 走線直接橫越 J1 整排 pad（回報距離 `d=0`，實際就是短路）；U1 與 C3 的 pad 只隔 0.095mm，連 JLCPCB 的 0.10mm 下限都不到。公版的走線是「示意直線」不是真的繞線，幾何上確實不可製造。已用缺陷預算鎖住（`pcb-logic.test.js` 第 21 節），**只准往下不准往上**。**2026-08-24 實驗過了**：拿新的多層路由器把示意直線全部重繞，error 從 **388 降到 252**（降 35%）就停住了：剩下的大多是 `drc_padgap`，那是**元件擺得太近**，重繞救不了。全修＝連擺位一起重做 8 片板，屬於重新設計、不是修 bug，需要使用者先決定要不要做 |
| **DRC 的線距檢查靠 `pcb-drc.js`** | 🟡 `runDrc()` 把 pad 級淨距外包給這個模組。它沒載入時 DRC 是「不完整」而不是「通過」——舊版只回一條 info，使用者看到 0 error 會以為線距沒問題。2026-08-24 已提升為 warning 並加測試 |
| **KiCad 符號／footprint 匯出** | 🟢 結構驗過（括號平衡、腳數、無 NaN），但**沒有人用真的 KiCad 開過** |
| **datasheet PDF 抽腳位** | 🟡 193 顆實測：完全正確 77、部分正確 37、錯得多 34、明講讀不出來 35。抽不到會拒填 |
| **線路圖的「模擬」** | 🟡 是**單迴路估算**（`I=(ΣV−Σ順向壓降)/ΣR`），**不看接線拓樸**、不處理並聯與多迴路。2026-08-21 已把 UI 文案改成講實話，不要再寫成「節點分析」 |
| **2nd source 比對** | 🟢 可用於「講差異與注意事項」，不可用於「判定能不能換」。196 顆裡 49 顆還沒有 `secondSource` 準則 |
| **自訂多腳 IC 存進元件庫** | ⬜ 要登入才測得到，**沒人驗過**。使用者說要自己測，還沒回報 |
| **贊助流程** | ⬜ `plan='sponsor'` 只入帳不發權益那條路從沒實測 |
| **備份還原** | ⬜ `restore-drill.sh` 用合成 dump 自我驗證過，**沒有跑過真的 artifact** |

**沒有 Allegro SKILL 匯出。** 只有 json / kicad / csv / tcl 四種。

---

## 8. 這一輪的工作：PCB Layout 強化

### 為什麼先補測試再加功能

`pcb.js` 有 3036 行、十幾個功能，測試只蓋到 9 個純邏輯點。現在直接加新功能，等於在沒有網子的地方疊高。
而且這個 repo 已經有前例：範例電路自己過不了 DRC、模擬把 LED 當電阻——**都是沒有斷言的地方**。

`gerber-check.js` 是好榜樣（473 條、跨 8 片公版、驗到鑽孔座標對得上 pad）。PCB 這邊照它的模式做。

### 階段 A：把現有功能釘住（先做這個）

每一項的驗收條件都要**可判定真假**，不接受「看起來正常」。

**2026-08-24 進度**：**階段 A 全數完成**（A-1～A-6）。
`pcb-logic.test.js` 從 9 個邏輯點長到 **287 條斷言**，第 9～26 節是這一輪加的（含多層繞線、EMI 迴路面積、IPC-2221 線寬）。
每一項都做過 mutation 驗證（把修好的地方改回去，確認測試會紅），不是寫完就算。

| # | 項目 | 驗收條件 |
|---|---|---|
| A-1 ✅ | **等長調諧 `meanderTune()`** | （實作在 `pcb-logic.test.js` 第 11 節，沒另開檔）給定走線與目標長度，蛇形後的**實際長度**與目標差 < 0.05mm；bump 數與補償量的數學要有斷言；補不到目標時要誠實回報而不是靜默 |
| A-2 ✅ | **差分對 `diffGapOf()` 與收尾 fanout** | 間距優先序（Constraint Manager class pairGap > NetRules gap > 0.2mm）逐條測；收尾展開後兩條線**平行且等長**，端點落在 pad 上 |
| A-3 ✅ | **走線規則稽核 `checkTraceRules()`** | 線寬下限、長度上限、差分長度差三種違規各造一個案例，要抓得到；合規的案例不可誤報 |
| A-4 ✅ | **`runDrc()`** | 間距不足、線壓 pad、線出板框、via 落在禁佈區——各一個案例。**沿用線路圖那次的教訓：先確認 8 片公版自己過得了 DRC**（實測結果：**過不了**，388 個 error，見 §7） |
| A-5 ✅ | **疊層與背鑽 `pcb-stackup.js`** | `buildLayerStack(n)` 對 n=2/4/6/8 的層序與命名要對；Backdrill 殘樁長度＝板厚 − 目標層深度，數學要有斷言 |
| A-6 ✅ | **`autoRoute()`** | 完成率要誠實（回報的成功數＝實際連上的數）；**不准產生短路或穿越禁佈區**；`cap=30` 這個上限要嘛拿掉、要嘛在 UI 講清楚（**淨空已修並鎖住；cap=30 仍在，只在 toast 提示**） |

### 主軸：中立多廠 DFM（2026-08-24 使用者選定）

比不贏 EasyEDA 的地方不要比：它有 LCSC 百萬料號、JLCPCB 一鍵下單、Pro 版撐 5000 元件 / 10000 pad，
我們 `autoRoute` 單層、`cap=30`。那是垂直整合，不是功能。

要打的是它**結構上不能跟進**的：EasyEDA 是嘉立創的前端，永遠不會告訴你 PCBWay 這片更便宜或做得了。

| 進度 | 項目 |
|---|---|
| ✅ | 四廠能力檔（官方出處＋擷取日期）、DFM 檢查器、四語比較面板 |
| ✅ | 誠實條款：官方未公開的欄位一律 null／skipped，有 mutation 測試守著 |
| ⏸ | **報價比較**（**2026-08-24 使用者明言不做**）——刻意還沒做。板廠報價是動態的，靜態表會過期騙人；要嘛接官方 API、要嘛只給「成本驅動因子」。這題要先決定路線 |
| ✅ | 依選定板廠**回填 DRC 規則**。`fabSel` 選定廠商持久化，`fabApplyDrc` 一鍵把線距／線寬／板邊寫回 DRC 面板；未公開的欄位保留原值並明言「{n} 項未公開」 |
| ✅ | 匯出 Gerber 前的 **DFM 闘門**。有 error 就彈 confirm 列出退件原因；使用者選不要就**不呼叫後端**（瀏覽器實測三種情境都驗過） |
| ✅ | 線距（`minSpace`）與 via 焊環外徑（`minViaPad`）檢查。這兩條規則一直在資料檔裡却從來沒被檢查過；線距用線段對線段距離，交叉的兩條線抳得到 |
| ✅ | **能力資料過期提醒**。`isStale()` 超過 12 個月就在面板上標出擷取日期，提醒先對照官方頁 |

### 對照 EasyEDA 的功能缺口（2026-08-25）

盤點方式是 grep 這個 repo 的編輯器程式碼，不是憑印象。`Ref/` 與知識卡裡出現的
「淚滴」「拼板」是**文件內容**，不是編輯器功能，別被搜尋結果騙了。

| 功能 | 狀態 | 我們多做的那一件事 |
|---|---|---|
| 淚滴 | ✅ `pcb-mfg.js` Teardrops | **會先問合不合法**：淚滴多邊形若離異網銅太近就跳過，並回報跳過原因（`clearance` / `traceWiderThanPad` / `traceTooShort`）。EasyEDA 是照畫，讓 DRC 事後抱怨 |
| 縫合孔 | ✅ Stitch | **間距不用你猜**：填「最高關心頻率」，間距由 λ/20 算出來（λ=c/(f√εr)，εr 取自疊層），並把推導過程顯示出來。EasyEDA 只讓你填一個數字 |
| 鑽孔表 | ✅ DrillTable ＋ 匯出 `-DrillTable.txt` | **順便比板廠下限**：過不了選定板廠 `minDrill` 的刀直接在表上標 `BELOW FAB MIN` |
| 拼板 | ✅ Panel（V-Cut／郵票孔／工藝邊） | **會擋掉做不出來的組合**：V-Cut 強制板間距為 0（刀走直線）、拼板尺寸比對板廠板框上限、利用率過低會提醒 |
| 線路圖 → PCB | ✅ `pcb-sch2pcb.js` | **封裝是真的**：被動件走 PartsLib、IC 走 FootprintGen；對不出來的列出來不編假方塊；沒有唯一正解的（電源符號等）給預設但標「這是假設」。擺位照線路圖相對位置縮放後推開重疊，不是排成格子 |
| 3D 檢視 | 🟡 `pcb-3d.js` 早就有（教學級方塊，非精確模型）。**2026-08-25 發現它從 cdn.jsdelivr.net 載 Three.js，線上 CSP 是 `script-src 'self'`，一定被擋** —— 本機能開、上線打不開。已改成只從 `vendor/` 載並明講尚未代管；`csp-hash.js` 加了守門擋這類寫法。**要不要把 Three.js 收進 vendor/ 是使用者的決定**（約 600KB） | — |
| STEP 匯出 | ⬜ 未做 | — |
| DXF 匯入板框 | ⬜ 未做 | — |
| ODB++ 匯出 | ⬜ 未做 | — |
| 線路圖 ↔ PCB 雙向 cross-probe | ⬜ 未做（單向的「轉 PCB」已完成，反向選取連動還沒） | — |
| 圖片轉絲印 | ⬜ 未做 | — |
| 元件庫規模 | ❌ 不追 | LCSC 百萬料號＋JLCPCB 一鍵下單是垂直整合，寫不出來也買不到 |

已完成的四項：`pcb-mfg.test.js` 118 條（幾何合法性）＋ `gerber-mfg.test.js` 61 條（有沒有進匯出檔）。
面板在「▤ 面板 → 製造強化」。

### 階段 B：功能強化（A 有網子之後才動）

| # | 項目 | 備註 |
|---|---|---|
| B-1 ✅ | Gerber **讀回驗證** | `gerber-readback.js`，195 條。每條走線都要在對應銀層找得到（端點誤差 <1µm）、孔徑＝線寬、不漏到別層、線段數不多不少；pad 中心要落在銀裡（點在多邊形內）；孔徑表不可有未使用或未定義。**實證盲區**：把線寬全部改錯時`gerber-check` 仍然是綠的，這支才抳得到 |
| B-2 ✅ | 鋪銅（`userZones`）的**避讓與熱焊盤** | `gerber-pour.test.js`，31 條。鋪銅在 Gerber 裡是用極性畫的（LPD 整塊 → LPC 挖避讓 → LPD 補輻條），**同一座標會被畫很多次、最後一次才算**，只數行數完全看不出銅留在哪。這支依序重放極性做成「這一點最後是銅還是空」的查詢，再去問：異網 pad／走線／via 的間隙 >= 設定值、同網 via 實心、熱風焊盤繞一圈剛好 4 段銅（周畫 360 度數明暗交替＝8 次）、鋪銅不溢出多邊形 |
| B-3 ✅ | 載流／線寬計算（IPC-2221） | 第 26 節。**抳到單位換算寫反**：mil 乘上 0.03937（mm→mil）而非 0.0254，1A/ΔT10℃/1oz 算出 0.466mm、正確是 0.300mm，高估 55%。已修，並以手冊查表值與單調性鎖住 |
| B-4 | 使用者實際操作驗證 | 站主自己走一次完整流程：擺件 → 繞線 → 鋪銅 → DRC → 匯出 → 送板廠檢視 |

### 動手前先做的事

```bash
node pcb-logic.test.js && node gerber-check.js && node reffp-check.js
```
先確認基線是綠的再改。改完同一組再跑一次，**貼 exit code**。

UI 驗證：`pcb.html` 的按鈕 id 已知（`autoRouteBtn` `tuneBtn` `syncNetlistBtn` `exportGerberBtn`
`exportKicadBtn` `loadBoardBtn` `plPlaceBtn` `placeIcBtn` `selRotBtn` `saveBoardBtn` `undoBtn` `redoBtn`），
可以用瀏覽器工具直接點、讀 DOM 驗結果，不必手動點。

---

## 9. 額度與成本

Supabase 免費層：Egress 5 GB/月（未登入訪客瀏覽 = Supabase 0 KB）、資料庫 500 MB（目前約 60 KB）、
Edge Function 500,000 次/月、MAU 50,000、閒置暫停 1 週（`keepalive.yml` 每週一四擋著）。
每月看一次 Dashboard → Settings → Usage 即可。

---

## 教訓
- 2026-08-25 | 線路圖轉 PCB | 舊版把每個元件都當 IC、pad 一律 1.2×1.2mm、位置是符號腳位座標乘 0.08；飛線會出來、DRC 跑得動，但那不是任何真實封裝 | 「有輸出」不等於「輸出可用」：轉換類功能要斷言輸出**與權威來源逐位元一致**（這裡是 PartsLib/FootprintGen）
- 2026-08-25 | CDN 與 CSP | `pcb-3d.js` 從 jsdelivr 抓 Three.js，本機 dev server 不套 `_headers` 所以一路正常，上線 CSP `script-src 'self'` 必定擋掉，症狀是「按了沒反應」 | 任何外部腳本來源都要對照 `_headers` 的 script-src；已在 `csp-hash.js --check` 加自動守門
- 2026-08-25 | 預設值的誠實 | 電源符號在真板上可能是端子台/桶插/排針，沒有唯一正解 | 這種地方給預設值可以，但要標成「假設」並與「真的對不出來」分開報，不要讓使用者以為是線路圖裡指定好的
- 2026-08-25 | 對照競品盤點 | grep「淚滴」「拼板」有結果，但全在 `Ref/` 與知識卡裡，那是文章不是功能 | 盤功能缺口要 grep **編輯器程式碼**，不要 grep 整個 repo
- 2026-08-25 | 淚滴幾何 | 接觸點用 `atan2(hw, R)` 只有 ±8.6 度，做出來是一根細刺不是淚滴 | 幾何寫完先算一個已知案例的面積／寬度，別只看有沒有生出多邊形
- 2026-08-25 | 分岔釘子 | 前後端兩份鑽孔表的比對測試，第一版測資讓兩條規則算出同一個值，拿掉規則也不會紅 | 寫「防分岔」測試時，測資要刻意讓每條規則產生**不同**的結果，否則釘子是假的
- 2026-08-25 | 欄位命名 | autoRoute 產生的 via 寫 `drill`，但 Gerber 匯出讀的是 `id`，改鑽徑靜靜沒作用 | 新增資料時先 grep 既有欄位名，不要另立一套
- 2026-08-24 | 鋪銅驗證 | 一開始斷言「異網 pad 中心不可有銅」，但避讓挖完之後匯出本來就會把 pad 畫回來，6 條假失敗 | 驗極性圖形要問「間隙環」而不是「中心點」；測試紅了先想清楚預期對不對
- 2026-08-24 | Gerber 驗證 | 舊的 gerber-check 驗的是結構（表頭、行數、孔數），把所有走線的孔徑改成固定 0.25 它仍然全綠 | 匯出類的驗證要「讀回來跟來源比」，只比行數與表頭等於沒驗
- 2026-08-24 | 幾何比對 | pad 畫成 G36 region 時用「附近有沒有頂點」判定，1.4×0.2 的 roundrect 角頂點離中心 0.658mm，門檻設 0.6 就冒出 170 個假漏 | 判「點在不在形狀裡」就用點在多邊形內，不要用距離門檻模擬
- 2026-08-24 | 單位換算 | IPC-2221 線寬把 mil 乘上 mm→mil 的係數，高估 55% 而且看起來很合理 | 工程公式一律拿**手冊查表值**對一個點，不要只看公式形狀對不對
- 2026-08-24 | 補 PCB 測試 | `autoRoute()` 硬寫 clearance 0.15、不讀 `loadDrcRules()`，使用者調大淨空完全沒作用 | 任何吃規則的功能，測試要斷言「改規則→行為跟著改」，不只是「跑得起來」
- 2026-08-24 | 公版 DRC | 8 片公版合計 388 個 error，走線是示意直線、直接壓在別人的 pad 上 | 內建範例要納入自動檢查；一時修不完就用「只准往下」的缺陷預算鎖住，不要假裝是綠的
- 2026-08-24 | 板廠檔 | `minSpace`/`minViaPad` 寫在資料檔裡但檢查器從沒讀它 | 資料欄位加了就要有對應斷言，否則它只是看起來很完整
- 2026-08-24 | 內建預設值 | via 預設 0.6/0.3 環寬 0.15mm，低於 JLCPCB 絕對下限 0.18mm——使用者什麼都沒改就會被退件 | 內建預設值要拿真實製造規則驗一次，別只驗使用者輸入
- 2026-08-24 | CSP 雜湊 | `csp-hash.js` 直接雜湊工作區位元組，Windows 的 CRLF 讓 16 段只有 1 段命中；照「改完 HTML 要重跑」在本機重算會把 CRLF 雜湊寫進 `_headers`，上線後 inline script 全被擋 | 任何比對檔案內容的檢查器一律先正規化換行
- 2026-08-24 | 面板選單 | 標題 i18n key 存在 `data-panel-data-i18n-title`，程式讀的是 `dataset.panelTitle`（沒人設），四語選單一路顯示 `rules`／`stackup` 這種原始 id | JS 產生的字沒被 `data-i18n` 掃到，要自己在 `vs-lang-change` 重貼
- 2026-08-24 | 排序會說謊 | 多廠比較若以「錯誤數」排序，公開規格最少的廠（Seeed 沒公開環寬／板邊）錯誤最少，被捧成第一名 | 比較類功能先問「這個排序會不會獎勵資訊不透明」
- 2026-08-24 | 面板快照 | 疊層面板把 `sk`／`ids` 抓在 `renderPanel` 當下的閉包裡，板層數改了就過期，存檔還會把 3 層介電覆蓋成 1 層 | 面板事件處理器要當場重讀 state，不要信 render 當時的快照
- 2026-08-21 | 對外文案 | 把「直流模擬：節點電壓、支路電流」寫進介紹文，一實測發現是單迴路估算、根本不看接線 | 要寫進文案的每一句功能描述，先在瀏覽器跑一次；跑不出來就不要寫
- 2026-08-21 | 內建範例 | 範例電路的導線端點差幾個 px 沒落在腳位上，按「範例」再按 DRC 出 9 個警告 | 內建範例／公版要納入自動檢查，它是新訪客看到的第一個東西
- 2026-08-21 | 新視窗 | `window.open`＋`document.write` 出來的頁面繼承本站 CSP，inline script／onclick 全部不執行 | 那種頁面的互動一律由開啟者掛 listener；已中招兩次（報告列印、PDF 匯出）
- 2026-08-21 | 密碼重設 | Supabase 把人導回 `login.html`，但頁面沒有「設定新密碼」那一步，使用者只看到登入表單 | 第三方 auth 的每一條回導路徑都要有對應畫面，不能只做「寄出信」那一半
- 2026-08-21 | 抽 datasheet 溫度 | PDF 用 Symbol 字型畫符號時，pdf.js 交出的是私有區字元（U+F02D 負號、U+F0B0 度數、U+F06D µ） | 抽 PDF 文字先做私有區還原（`unpua()`），只還原意義明確的符號
- 2026-08-21 | 建庫要不要接模型 | 結論：前台不接（訪客連不到地端、雲端會打破「檔案不上傳」承諾）；後台值得，但關鍵是**驗證器**不是引擎 | 引入生成式引擎前先把機械覆核寫出來（`tools/ic-extract/`）
- 2026-08-20 | 2nd source 的重點 | 使用者指出：報告不知道原設計依賴什麼，該輸出的是「哪裡不同、線路上要注意什麼」 | 這類功能先問「使用者拿它去做什麼決定」，再決定要抽什麼
- 2026-08-20 | 寫腳本改檔 | python 非 raw 字串裡的 `\b` 會變成退格字元，寫進 JS 就成了永遠不匹配的 regex，而 `cat` 看起來完全正常 | 產生程式碼的字串一律用 raw string，改完用 `JSON.stringify` 印該行核對
- 2026-08-19 | 額度白名單 | 憑印象列了不存在的格式名，差點擋掉真正在用的 `csv` | 白名單類的清單要從程式碼查證
- 2026-08-18 | 驗收自己的修改 | 只測「該被擋的有沒有被擋」，沒測「該通過的有沒有通過」 | 權限類改動一定要正反兩面都測
