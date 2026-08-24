# NEW SESSION — 接手指南（2026-08-24）

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
| `pcb.js` | 3036 | 編輯器主體：擺件、走線、鋪銅、DRC、autoRoute、差分對、等長調諧、KiCad 匯出 | 🟡 `pcb-logic.test.js` 只測 9 個純邏輯點 |
| `pcb-stackup.js` | 228 | 疊層編輯器、Via padstack、Backdrill 殘樁計算 | ❌ 無 |
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
| **PCB 進階功能** | ⬜ 差分對、等長蛇形、疊層、背鑽、EMI／熱檢查、autoRoute **全部沒有測試，也沒實際操作驗證過**。這是這一輪的主要工作，見 §8 |
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

| # | 項目 | 驗收條件 |
|---|---|---|
| A-1 | **等長調諧 `meanderTune()`** | 新增 `pcb-length.test.js`：給定走線與目標長度，蛇形後的**實際長度**與目標差 < 0.05mm；bump 數與補償量的數學要有斷言；補不到目標時要誠實回報而不是靜默 |
| A-2 | **差分對 `diffGapOf()` 與收尾 fanout** | 間距優先序（Constraint Manager class pairGap > NetRules gap > 0.2mm）逐條測；收尾展開後兩條線**平行且等長**，端點落在 pad 上 |
| A-3 | **走線規則稽核 `checkTraceRules()`** | 線寬下限、長度上限、差分長度差三種違規各造一個案例，要抓得到；合規的案例不可誤報 |
| A-4 | **`runDrc()`** | 間距不足、線壓 pad、線出板框、via 落在禁佈區——各一個案例。**沿用線路圖那次的教訓：先確認 8 片公版自己過得了 DRC** |
| A-5 | **疊層與背鑽 `pcb-stackup.js`** | `buildLayerStack(n)` 對 n=2/4/6/8 的層序與命名要對；Backdrill 殘樁長度＝板厚 − 目標層深度，數學要有斷言 |
| A-6 | **`autoRoute()`** | 完成率要誠實（回報的成功數＝實際連上的數）；**不准產生短路或穿越禁佈區**；`cap=30` 這個上限要嘛拿掉、要嘛在 UI 講清楚 |

### 階段 B：功能強化（A 有網子之後才動）

| # | 項目 | 備註 |
|---|---|---|
| B-1 | Gerber **讀回驗證** | 把匯出的 Gerber 再 parse 回來，跟原始板比對座標與層數。這是板廠級的信心來源 |
| B-2 | 鋪銅（`userZones`）的**避讓與熱焊盤** | 目前顯示端有避讓，實際匯出的銅箔幾何沒驗過 |
| B-3 | 載流／線寬計算（IPC-2221） | `runThermalSimple()` 已有雛形，要有依據與斷言 |
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
