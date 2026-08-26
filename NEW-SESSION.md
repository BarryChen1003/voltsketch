# NEW SESSION — 接手指南（2026-08-25）

`Documents/Web`，repo `voltsketch`，線上 <https://hardware-ai.org>（Cloudflare Workers，推 main 自動部署）。

> **站已經上線，而且在收真錢。** 動到 `supabase/functions/`、`_headers`、`vendor/` 都可能
> 讓真實客戶付不了款或整頁停擺——動之前先讀 §4。

`HANDOFF.md` 停在 2026-07-22，只當補充；衝突時以本檔為準。

---

## 0. 硬規矩

1. **圖字絕不重疊、元件絕不互疊**。改完圖跑幾何檢查（§6），再用瀏覽器實測收尾。
2. **不憑印象畫電路／腳位／規格**。沒有可查證依據就不畫、不填；抽不到就標「未擷取」。
3. **元件符號一律用 `schematic-symbols.js`（`Sym`）**，不要自己刻方框。
4. **改檔就遞增快取版號**。改 `app.js` → `index.html` 的 `app.js?v=`；改 `pcb*.js` → `pcb.html`
   對應版號；改知識卡 → `knowledge.js` 的 `BUILTIN_VERSION` 與 `knowledge.html` 的 `?v=`。
   忘了改＝使用者拿到快取舊檔，而且**你在本機測起來完全正常**。
5. **只驗「有沒有產出」不算驗**。每個功能都要有「算出來的數字／幾何對不對」的斷言。
6. **新增或修改的任何內容一律四語**（zh / en / ja / ko），不只新功能。
7. **做完就 commit + push，然後部署上站**，不要停在「未指示」。CI **沒有** deploy step：
   靜態站要手動 `npx wrangler deploy`（先 `wrangler login`，互動式授權，**只有使用者能做**）；
   動到 `supabase/functions/` 就再 `supabase functions deploy <函式>`。
   push 了但沒部署＝線上還是舊版，而且 repo 看起來一切正常。
   2026-08-26 實測抓到：盲埋孔、繞線策略、DRC 加速等一整批功能都沒上站。
   自己登不了就把指令貼給使用者（見規矩 8），不要默默當做完了。
8. **要使用者跑 SQL 或指令時，把完整內容貼進對話**，不要只給檔案路徑。
9. **宣稱「完成／修好」前先實際驗證**：跑測試、貼 exit code、實際呼叫一次。
   要寫進對外文案的功能，先在瀏覽器實跑一次。
10. **新視窗裡的 inline script 與 onclick 一律不執行**（繼承本站 CSP）。
    `window.open` + `document.write` 開出來的頁面，互動要由開啟它的那一頁掛 listener。
    已中招兩次：2nd source 報告的列印鈕、線路圖的 PDF 匯出。
11. **`core.autocrlf=true`：本機 HTML 是 CRLF，git 與線上是 LF**。任何比對檔案位元組的
    檢查器都要先 `.replace(/\r\n/g, '\n')`。不做會「本機紅、線上綠」，
    或更糟——本機重算後上線全炸。
12. **外部腳本一律自行代管**。線上 CSP 是 `script-src 'self' https://static.cloudflareinsights.com`，
    從 CDN 載腳本上線必被擋，而本機 dev server 不套 `_headers` 所以看不出來。
    `csp-hash.js --check` 有守門。
13. **測資要能分辨實作**。每寫一條斷言就問：**錯的實作會讓這條紅嗎**？
    答不出來就是還沒測到。這件事本 session 重寫過四組測資。
14. **先量再改**。動效能或成功率之前先量瓶頸在哪，否則會對著錯的假設寫一整個功能。

---

## 1. 開場三分鐘

```bash
node pcb-logic.test.js && node gerber-check.js && node gerber-readback.js
```

三支綠代表 PCB 地基沒壞。全套見 §6。

---

## 2. PCB 模組地圖

`pcb.js`（3262 行）是編輯器主體，其餘都是可獨立測試的模組。
**新功能優先寫成模組**：純函式、不碰 DOM、node 測得到；UI 綁定另外放。

| 檔 | 全域 | 做什麼 |
|---|---|---|
| `pcb.js` | `pcbApp` | 編輯器主體：擺件、走線、渲染、DRC 呼叫、匯出入口 |
| `pcb-rules.js` | `NetRules` `Ratsnest` `AutoRoute` `RouteAll` | net 規則、飛線、單條繞線原語、多條繞線策略 |
| `pcb-drc.js` | `PadDrc` | pad 級 DRC（線距／環寬／孔距／sliver／courtyard…） |
| `pcb-constraints.js` | `ConstraintMgr` | net class、間距矩陣、銳角 |
| `pcb-stackup.js` | `Stackup` `Padstack` `Backdrill` | 疊層、via 預設、背鑽 |
| `pcb-fabs.js` | `FabProfiles` | 四廠能力檔與 DFM 檢查（規矩見 §5） |
| `pcb-mfg.js` | `Mfg` `MfgUI` | 淚滴、縫合孔、鑽孔表、拼板 |
| `pcb-pour.js` | `PcbPour` | 鋪銅孤島偵測與移除 |
| `pcb-sch2pcb.js` | `Sch2Pcb` | 線路圖 → PCB（用真封裝） |
| `pcb-dxf.js` | `PcbDxf` | 板框 DXF 匯入／匯出 |
| `pcb-step.js` | `PcbStep` | STEP (AP214) 3D 匯出 |
| `pcb-silkimg.js` | `PcbSilkImg` | 圖片轉絲印 |
| `pcb-crossprobe.js` | `CrossProbe` | 線路圖 ↔ PCB 選取連動 |
| `pcb-3d.js` | `Pcb3D` | 教學級 3D 檢視（**Three.js 尚未代管，見 §8**） |
| `pcb-panels.js` | — | 浮動面板：自動收集 `.panel-section[data-panel]`，加一段 HTML 就會出現 |
| `pcb-refboards.js` | `PCB_REFBOARDS` | 8 片參考公版（4500 行資料） |
| `supabase/functions/_shared/gerber.mjs` | — | 後端 Gerber／Excellon／CPL／IPC-356／鑽孔表 |

### `pcb.js` 裡找得到的東西

| 功能 | 行號 |
|---|---|
| `runDrc()` / `loadDrcRules()` | :763 / :956 |
| `exportKicad()` / `exportGerber()` | :1091 / :1112 |
| `assignPadNets()` | :1303 |
| `runEmiCheck()` / `runThermalSimple()` | :1415 / :1480 |
| `initCrossProbe()` | :1717 |
| `meanderTune()` | :1934 |
| `syncFromSchematic()` | :2270 |
| `routableLayers()` / `autoRoute()` | :2356 / :2362 |
| `calcImpedance()` | :2411 |

### 載入順序有講究

`pcb.html` 裡，**被 `pcbApp.init()` 直接用到的模組必須排在 `pcb.js` 之前**
（例如 `pcb-crossprobe.js`）。排後面會讓功能靜靜不啟用，**沒有任何錯誤訊息**。
只在按鈕事件裡用的（`pcb-mfg.js` 等）才可以排後面。

---

## 3. 測試地圖

13 支、合計 **1567 條斷言**。改哪裡就先看對應那一支。

| 測試 | 斷言 | 守什麼 |
|---|---|---|
| `pcb-logic.test.js` | 325 | 編輯器邏輯、DRC、繞線策略、等長調諧、**大板效能** |
| `gerber-check.js` | 473 | 匯出**結構**：表頭、層數、鑽孔對齊 pad、CPL／IPC 行數 |
| `gerber-readback.js` | 195 | 匯出**幾何**：解析回來跟原始板逐條比對 |
| `pcb-mfg.test.js` | 118 | 淚滴／縫合孔／鑽孔表／拼板的幾何合法性 |
| `sch2pcb.test.js` | 70 | 線路圖轉 PCB：封裝是不是真的 |
| `dxf.test.js` | 63 | 板框：單位、弧線、**封閉性**、來回一趟 |
| `step.test.js` | 62 | STEP：參照完整性、**流形性**、尤拉示性數 |
| `gerber-mfg.test.js` | 61 | 製造功能有沒有真的進匯出檔（含前後端鑽孔表對齊） |
| `silkimg.test.js` | 47 | 圖片絲印：換算、合併、太細偵測 |
| `pour.test.js` | 45 | 鋪銅孤島：連通性、挖除範圍、誤判 |
| `gerber-pour.test.js` | 43 | 鋪銅**極性**：間隙、熱風焊盤輻條、孤島真的沒進檔 |
| `blindvia.test.js` | 38 | 盲埋孔：跨層範圍、分檔、板廠能力 |
| `crossprobe.test.js` | 27 | 選取連動：回音防護、訊息驗證 |

**`gerber-check` 綠不代表匯出對**：把所有走線孔徑改成固定 0.25，它照樣全綠，
`gerber-readback` 才抓得到。結構與幾何是兩件事。

---

## 4. 動這幾個檔之前先讀

### `_headers`（CSP）
- 改任何 inline `<script>` 之後**一定要跑 `node csp-hash.js`**，否則那段上線被自己的 CSP 擋掉。
- **不准加 inline 事件處理器**（`onclick=`），`csp-hash.js` 直接 FAIL。
- 三個 directive 改了會**靜靜壞掉**：`form-action` 少綠界網域（沙盒與正式是不同網域）→ 付款沒反應；
  `frame-src` 少 `falstad.com` → 模擬器不動；`connect-src` 少 Supabase → 全站 API 死掉。

### `supabase/functions/`（金流與 Gerber）
改完**必須重新部署**：
```bash
npx --yes supabase functions deploy <名稱> --project-ref dmkxjawjrmltmrmkebbs --use-api
```
- `ecpay-webhook` 要加 `--no-verify-jwt`；**`pcb-export` 與 `create-order` 絕對不要加**。
- `--use-api` 是必要的（本機沒跑 Docker）。
- webhook：**任何 DB 失敗都不准回 `1|OK`**。

### `vendor/`
- 內容與 `vendor/README.md` 的 SHA-256 必須相符，`vendor-check.js` 在 CI 顧著。
- `.gitattributes` 把 `vendor/**` 標成 `-text`。**`pdf-3.11.174.worker.min.js` 的檔名不能改**。

### `pcb-refboards.js` 是「產生出來的」，不要手改座標
公版的 components 座標、traces、vias 由 `tools/refboard-rebuild.js` 產生：
丟掉示意走線 → 擺位鬆弛（安裝孔不動、連接器少動、被動元件最自由）→ 用真的繞線器重繞。
手改完再跑一次工具就會被蓋掉。要調就調工具的參數（可動度、線寬、時間預算），再整批重跑。

```bash
node tools/refboard-rebuild.js --dry          # 只看數字不寫檔
node tools/refboard-rebuild.js rp2040-pico30  # 只重建一片
```

其他欄位（名稱、電路說明、github 連結、`level`）工具不動，可以放心手改。

### 鑽孔表有兩份實作
`pcb-mfg.js`（面板顯示）與 `gerber.mjs`（實際送廠）各一份。**改一邊就要改另一邊**，
`gerber-mfg.test.js` 拿兩邊逐列比對，分岔就紅。

---

## 5. 板廠檔的誠實條款

`pcb-fabs.js` 是「中立多廠 DFM」的地基，規矩比別處嚴：

- **每個數字都要有官方出處與擷取日期**。查不到就填 `null` 走 `skipped`，
  **絕不借用別家的值**。有 mutation 測試守著。
- `isStale()` 超過 12 個月會在面板標出擷取日期，提醒回官方頁對照。
- 排序不可獎勵資訊不透明：以「錯誤數」排序時，公開規格最少的廠會被捧成第一名。

---

## 6. 檢查（CI 45 關的本地版）

```bash
# PCB 地基
node pcb-logic.test.js
node gerber-check.js
node gerber-readback.js
node odb-check.js
node gerber-pour.test.js
node gerber-mfg.test.js
node reffp-check.js
node dead-button-check.js

# PCB 功能模組
node pcb-mfg.test.js
node pour.test.js
node blindvia.test.js
node sch2pcb.test.js
node dxf.test.js
node step.test.js
node silkimg.test.js
node crossprobe.test.js

# 線路圖與知識庫
node circuit-check.js --strict
node wire-gap-check.js --selftest && node wire-gap-check.js --strict
node symbol-overlap-check.js --selftest && node symbol-overlap-check.js --strict
node svg-overlap-check.js --strict
node knowledge-art-audit.js --strict --quiet
node knowledge-format.test.js
node net-label.test.js
node interview-diagram-check.test.js && node interview-diagram-check.js

# 資料抽取
node pin-extract.test.js
node ic-extract.test.js
node ds-compare.test.js

# 四語
node i18n-check.js
node ui-i18n-check.js --strict
node html-i18n-check.js --strict
node art-i18n-check.js --strict
node art-lang-render.test.js
node interview-i18n-check.js --strict
node news-i18n-check.js --strict

# 供應鏈與 CSP
node vendor-check.js --strict
node csp-hash.js --check

# 金流
node ecpay-config.test.mjs
node plan-dates.test.mjs
```

預覽用 `preview_start({ name: "web-static" })`，**不要用 Bash 起 server**。

⚠ 那份設定在 **`C:\Users\User\Hardware\.claude\launch.json`**（Claude 的工作目錄），
**不在這個 repo 裡**。它做的事就是 `python -m http.server 8099 --directory C:/Users/User/Documents/Web`。
換一台機器或換工作目錄就沒有了，要自己補一份。

---

## 7. 使用者要你怎麼做事

- **證據型回報**：exit code、`file:line`、實測數字。不要「應該可以了」。
- **他指出問題時先驗證他說的**，通常是對的。
- **他推翻你的建議時那是他的決定**，照做並講清楚代價，不要再勸一次。
- **不要順手重構沒叫你動的東西。**
- 需要他決定的事（新增外部相依、要不要重做既有資料）**先問**，不要自作主張。

---

## 8. 已知缺陷

**這一段最重要。** 這個 repo 反覆出現同一種失敗：功能有 UI、按下去有反應、結果錯或沒用。

| 功能 | 實際狀況 |
|---|---|
| **8 片公版的佈局是重建出來的** | 🟡 2026-08-26 用 `tools/refboard-rebuild.js` 重跑過一輪：丟掉示意走線、擺位鬆弛推開太近的元件、再用真的繞線器重繞，DRC error 從 **388 降到 0**。代價是繞不完的 net 沒有走線（143/197 條繞成），板子變成「幾何上乾淨、電性上仍是近似」。缺陷預算鎖在 `pcb-logic.test.js` 第 21 節，**只准往下** |
| **公版的 pad 大多沒有 net** | 🟡 根因是公版資料本來就沒有 netlist（只有 20~29 條帶 net 的示意走線）。pad 的 net 只能從走線端點回推，openrex 1436 顆 pad 裡仍有 1400+ 顆沒有 net。沒 net 的 pad 對繞線器一律是障礙，這是重建後仍有 net 繞不完的主因。真正的解是匯入原廠 netlist |
| **3D 檢視實質不可用** | 🔴 `pcb-3d.js` 需要自行代管的 Three.js，**目前不在 `vendor/`**。已改成只從 `vendor/` 載並明講「尚未代管」，不再退回 CDN（退回去線上一定被 CSP 擋）。**要不要把 Three.js（約 600KB）收進 vendor 是使用者的決定** |
| **ODB++ 匯出** | 🟡 v1 是**子集**：銅層／鑽孔／板框有，阻焊、絲印、鋼網、元件、netlist 沒有。弧走弦線近似、roundrect 當 rect。`odb-check.js` 驗結構與 readback（379 條），但**沒有人用真的 CAM 開過** |
| **autoRoute 差分對** | 🟡 中心線繞一次再展開，耦合度實測 98.8%。但不做 push-and-shove、轉角處靠補段連接、長度差只回報不自動補（要自己按等長調諧） |
| **STEP 匯出** | 🟡 拓樸與參照程式驗過（流形、尤拉、參照完整），但**沒有人用真的 CAD 開過**；元件是佔位方塊不是原廠模型 |
| **KiCad 匯出** | 🟡 結構驗過，**沒有人用真的 KiCad 開過** |
| **autoRoute** | 🟡 沒有 push-and-shove、一次一條不看全局、4 秒預算。合成板（net 完整）60／120 顆元件都 100%；公版 70%（原因見上） |
| **阻抗** | 🟡 IPC-2141 近似 **±10%**，量產以板廠場解為準。UI 有標 |
| **熱** | 🟡 本機只有「簡估」，精算在後端且要 `pcb_access`。θ 公式是擬合值、無出處 |
| **EMI** | 🟡 只算迴路面積，不做場模擬 |
| **datasheet PDF 抽腳位** | 🟡 193 顆實測：完全正確 77、部分正確 37、錯得多 34、明講讀不出來 35 |
| **線路圖的「模擬」** | 🟡 是**單迴路估算**（`I=(ΣV−Σ順向壓降)/ΣR`），**不看接線拓樸**、不處理並聯與多迴路 |
| **2nd source 比對** | 🟡 可用於「講差異與注意事項」，不可用於「判定能不能換」 |
| **自訂多腳 IC 存元件庫** | ⬜ 要登入才測得到，**沒人驗過** |
| **贊助流程** | ⬜ `plan='sponsor'` 只入帳不發權益那條路從沒實測 |
| **備份還原** | ⬜ `restore-drill.sh` 用合成 dump 自我驗證過，**沒跑過真的 artifact** |

**沒有 Allegro SKILL 匯出**，只有 json / kicad / csv / tcl。

---

## 9. 只存在本機、不在 git 的報告

repo 是**公開**的，所以「還沒修好的問題清單」不能進 git：

| 檔 | 內容 |
|---|---|
| `SECURITY-AUDIT-D1.md` | D1 資安總檢，D-1～D-9 編號與修復狀態 |
| `SANDBOX-VERIFY.md` | 綠界驗證進度 |
| `BACKUP-RESTORE-DRILL.md` | 備份還原 runbook |

**找到新的資安問題：寫進本機報告，不要 commit。**

---

## 10. 待辦（依序）

使用者 2026-08-26 核定的路線圖，目標是「線路圖與 Layout 能一起用」。生態系（LCSC 那種料庫）明確不做。

| # | 項目 | 狀態 |
|---|---|---|
| 1 | 繞線時的即時碰撞與淨空光暈 | ✅ 2026-08-26（`previewClearance`，openrex 實測 0.65ms/次） |
| 2 | 拖元件時走線橡皮筋 | ✅ 2026-08-26（`beginRubber`/`updateRubber`） |
| 3 | 弧線／45° 圓角走線 | 🟡 2026-08-26 做了轉角導角（`Mfg.Mitre`，45° 斜切／圓弧逼近）。**輸出是線段不是真圓弧**——下游 DRC／鋪銅／匯出全部吃線段，真圓弧要動 DRC 的距離運算 |
| 4 | net 升級成一級物件 | 🟡 已完成：公版帶 `padNets`、ECO 增量同步、網名穩定化、多頁一起同步、網路清單／未接線面板、封裝 back-annotation。**還缺**：net 物件與屬性、refdes/net 改名回寫 |
| 5 | push-and-shove | ⬜ 要建立在 4 之上 |
| 6 | Clipper 布林鋪銅 | ⬜ 目前柵格夠用且誠實標註 |

另外兩件與路線圖無關但還欠著：

1. **Three.js 是否收進 `vendor/`**：使用者決定；3D 檢視在那之前都不可用。
2. **ODB++ 的元件與 netlist**：v1 只有銅層／鑽孔／板框（見 §8）。

---

## 11. 額度與成本

- Supabase 免費層：Egress 5 GB/月（未登入訪客瀏覽＝Supabase 0 KB）、資料庫 500 MB（目前約 60 KB）、
  Edge Function 500,000 次/月、MAU 50,000、閒置暫停 1 週（`keepalive.yml` 每週一四擋著）。
- Brave Search 額度有限（~1000/月）：**優先 WebFetch**，非必要不用 `brave_web_search`。
- YouTube 內容用 `~/.claude/yt-read.ps1`，不要直接 WebFetch。
- 大檔（>200 行）先 Grep 定位再 Read 該段，不要整檔讀。

---

## 12. 與業界工具的差距（2026-08-26 盤點）

使用者的目標是「線路圖與 Layout 能一起用」，對照組是 EasyEDA。這一節只列**還缺什麼**，
已經有的東西看 §2 模組地圖。生態系（LCSC 那種料庫與庫存）已明確不做，不列在這裡。

判讀方式：🔴 擋住「能不能用」；🟡 影響體感或正確性但有替代路徑；⬜ 想要但不急。

### A. 線路圖 ↔ Layout

| 缺什麼 | 影響 | 現況 |
|---|---|---|
| 🟡 **back-annotation（PCB → 線路圖）** | 2026-08-26 做了封裝這一項：在 PCB 換封裝會寫回線路圖元件的 footprint 欄位，下次轉換照它走。**還沒有的**：refdes 改名、net 改名、pin/gate swap 都不會回寫 | 封裝已回寫 |
| 🟡 **封裝在線路圖階段就綁定** | 轉換時仍會挑預設變體（電阻 0603）並標成「猜的」；使用者要在 PCB 選取那顆改，改完才寫回線路圖 | 選取面板有封裝選單 |
| 🟡 **匯流排（bus）** | 位址線資料線只能一條一條畫 | 沒有；跨頁只能靠同名網路標籤 |
| 🟡 **net class 從線路圖帶過來** | class 目前是 PCB 端用 pattern 猜（POWER 比對 GND/VCC…） | `ConstraintMgr` 的 class 與線路圖無關聯 |
| ⬜ gate / pin swap | 多閘 IC 沒辦法交換以縮短走線 | 沒有 |

### B. 互動與手感

| 缺什麼 | 影響 | 現況 |
|---|---|---|
| 🟡 **push-and-shove** | 走線遇到既有線只能自己繞開，不能推開它 | 沒有（路線圖 #5） |
| 🟡 **真圓弧走線** | 導角輸出的是線段逼近；高速線要真圓弧 | `Mfg.Mitre` 產生線段；真圓弧要改 DRC 的距離運算 |
| 🟡 **連續多段繪製** | 一次拖一段，轉彎要放開再拉 | 起點會自動吸附上一段的端點，但不是連續模式 |
| 🟡 **整條走線拖曳** | 只能拖端點，不能整段平移 | `dragEndpoint` 只處理端點 |
| ⬜ 拖曳時的對齊輔助線 | 對齊只能事後按對齊鈕 | 有對齊/分佈按鈕，沒有即時 snap 線 |
| ⬜ 快捷鍵不完整 | R 旋轉、Delete、Ctrl+Z/Y、Esc 之外沒有 | — |

### C. 資料模型

| 缺什麼 | 影響 | 現況 |
|---|---|---|
| 🟡 **net 仍是字串欄位** | 改名要逐一掃 pad 與走線；net 沒有屬性（阻抗目標、成對關係） | 公版已用 `padNets` 持久化；差分對靠命名推斷 |
| 🟡 **元件沒有實例／封裝庫分離** | footprint 直接展開成 pads 存進元件，改庫不會回頭更新既有板 | `RefFP`/`FootprintGen` 每次載入現產 |
| ⬜ 存檔格式沒有遷移機制 | 欄位改名要靠手動相容 | board JSON 只有 `v: 1` |
| ⬜ 沒有變更歷史 | 只有 50 步 undo，關掉就沒了 | `PcbHistory` 快照式 |

### D. 製造與驗證

| 缺什麼 | 影響 | 現況 |
|---|---|---|
| 🔴 **3D 檢視不可用** | Three.js 尚未代管，按了只會跳提示 | 等使用者決定要不要收 600KB 進 `vendor/` |
| 🟡 **ODB++ 沒有元件與 netlist** | CAM 端只能看銅層與鑽孔關係，不能做電測比對 | v1 子集（§8） |
| 🟡 **鋪銅是柵格近似** | 解析度以下的細頸會被當成斷開 | 刻意取捨，`pcb-pour.js` 檔頭寫明（路線圖 #6） |
| 🟡 **阻抗只有 IPC-2141 近似** | ±10%，量產要以板廠場解為準 | UI 有標 |
| ⬜ IPC-2581 | 另一種現代格式 | 沒有 |
| ⬜ 組裝圖 / 真 3D 元件模型 | STEP 匯出的元件是佔位方塊 | 沒有模型庫 |

### E. 規模與效能（2026-08-26 openrex-imx6 實測，1436 pad）

| 項目 | 實測 | 風險 |
|---|---|---|
| 整張重畫 | 2.5ms（約 400fps） | 目前不是瓶頸 |
| 全板 DRC | 240ms | 沒有增量檢查，改一條線就全掃 |
| undo 快照 | 1.9ms、狀態 219KB | 整份 state JSON × 50 步；十倍規模會吃掉記憶體 |
| 即時淨空 | 0.65ms/次 | 只掃單一線段的鄰域，可接受 |

共通問題：**沒有共用的空間索引**。DRC、繞線、鋪銅各自臨時建網格，同一份幾何被重複整理。

### F. 不做的

料件庫存與採購整合（LCSC/JLCPCB 那一層）。那是商業資料授權，不是工程問題，追不上也不該追。

---

## 教訓

只留還會再犯的。同型的已升級成 §0 硬規矩，不重複列。

### 驗證
- **驗收要用使用者實際會看到的狀態**。同一批公版，三種驗法給三種答案：
  只跑 `PadDrc` → 0 錯（漏掉 Constraint Manager 的 class 線寬，13 條電源線只有 0.15mm）；
  跑完整 `runDrc` 但用工具自己的 state → 0 錯（漏掉重新載入時 net 會重推，via 旁邊那顆 pad 變成異網）；
  node 跑 `runDrc` → 0 錯，瀏覽器打開卻紅（node 沒有 localStorage，`NetRules` 是空的；瀏覽器一載入就是 VIN 0.5mm）。
  三次都是「驗了一半就宣布完成」。要驗就照使用者的路徑：載入 → 套用所有規則來源 → 再看。
- **產生器不要吃自己的輸出**。重建工具會把結果寫回 `pcb-refboards.js`；沒先 `git checkout` 就重跑，
  等於拿上一輪的走線端點當輸入，一代一代漂移（197 條線變成 491 條），再也無法從原始檔重現。
- 「有渲染」「有產出」「有檔案」都不等於「對」。轉換類功能要斷言輸出**與權威來源逐位元一致**。
- 「DRC 全綠」不等於「板子對」：規則檢查只涵蓋寫得出規則的部分，
  連通性（鋪銅孤島）這類性質要另外驗。
- 開不了 CAD 不等於不能驗：流形性、尤拉示性數、參照完整性都是程式驗得了的硬性質。
  驗不了的照實標「未驗證」。
- mutation 測試沒紅時，先懷疑**測資**而不是慶祝。本 session 四次都是測資的錯。
- 有數量上限的輸出必須是決定性的：候選要照原始索引排序，否則同一片板兩次跑出不同結果。
- 測試太慢＝沒人會跑。用禁佈區多邊形取代上萬條線段，同樣的封鎖從數分鐘變 0.3 秒。

### 演算法
- 退化幾何要單獨想過：`ptInPoly` 對「全部共線」的多邊形回 true，於是核心塌成一條線的 oval pad
  把每個點都當成在裡面，兩顆離 2.6mm 的 pad 被算成重疊 1.2mm。凸多邊形判定要問「有沒有形成方向」。
- 障礙物不是只有銅：NPTH 機構孔沒有銅箔，但鑽頭會把上面的走線與 via 一起吃掉。
  繞線器看 `cu === false` 就跳過的話，自動繞線會穿過 M3 安裝孔，畫面上完全正常。
- 「在容差內算同一點」要按**實際距離分群**，不要用 `Math.round(x/tol)` 分桶（桶邊界會把該合的拆開）。
- 判「點在不在形狀裡」就用點在多邊形內，不要用距離門檻近似。
- 任何「先破壞再嘗試」的最佳化都要有**回滾守衛**，保證結果只可能變好；
  而且要用會走進破壞路徑的測資測它（本 session 第一版 rip-up 讓成功率從 95% 掉到 10%）。
- 效能最佳化：先量瓶頸（第一刀砍錯地方，789→714ms 幾乎沒動），
  加速改動一律要能證明「輸出逐行不變」。

### 資料與介面
- 新增資料時先 grep 既有欄位名，不要另立一套（via 鑽徑欄位叫 `id` 不是 `drill`，寫錯會靜靜用預設值）。
- 內建預設值要拿真實製造規則驗一次（via 預設曾是 0.6/0.3，環寬 0.15mm，低於 JLCPCB 下限 0.18mm）。
- 沒有唯一正解的地方（電源符號要對到什麼封裝）可以給預設，
  但要標成「假設」並與「真的對不出來」分開報。
- 資料欄位加了就要有對應斷言，否則它只是看起來很完整
  （`minSpace`／`minViaPad` 躺在檔案裡從沒被檢查過）。
- 盤功能缺口要 grep **編輯器程式碼**，不要 grep 整個 repo
  （`Ref/` 與知識卡裡的「淚滴」「拼板」是文章不是功能）。

### 對外
- 要寫進文案的每一句功能描述，先在瀏覽器跑一次；跑不出來就不要寫。
- 內建範例／公版要納入自動檢查，那是新訪客看到的第一個東西。
  一時修不完就用「只准往下」的缺陷預算鎖住，不要假裝是綠的。
- `.gitignore` 擋 git，`.assetsignore` 擋網站，兩個是分開的閘。wrangler 從**工作目錄**上傳，
  gitignore 的資料夾照樣會被放上公開站。新增本機資料夾後兩個檔都要加。
  用 `npx wrangler deploy --dry-run` 驗（會實際擋超過 25 MiB 的檔，已用負向對照確認它真的會紅）。
