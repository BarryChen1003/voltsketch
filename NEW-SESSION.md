# NEW SESSION — 接手指南（2026-08-28）

`Documents/Web`，repo `voltsketch`，線上 <https://hardware-ai.org>（Cloudflare Workers）。

> **站已經上線，而且在收真錢。** 動到 `supabase/functions/`、`_headers`、`vendor/` 都可能
> 讓真實客戶付不了款或整頁停擺——動之前先讀 §4。

> **部署不是自動的。** CI 只跑測試，沒有 deploy step。push 完線上仍是舊版，
> 而且從 repo 這端完全看不出來。怎麼確認與怎麼部署見 §1 與 §0 規矩 7。

`HANDOFF.md` 停在 2026-07-22，只當補充；衝突時以本檔為準。

---

## 0. 硬規矩

1. **圖字絕不重疊、元件絕不互疊**。改完圖跑幾何檢查（§6），再用瀏覽器實測收尾。
2. **不憑印象畫電路／腳位／規格**。沒有可查證依據就不畫、不填；抽不到就標「未擷取」。
3. **元件符號一律用 `schematic-symbols.js`（`Sym`）**，不要自己刻方框。
4. **改檔就遞增快取版號**。改 `app.js` → `index.html` 的 `app.js?v=`；改 `pcb*.js` → `pcb.html`
   對應版號；改知識卡 → `knowledge.js` 的 `BUILTIN_VERSION` 與 `knowledge.html` 的 `?v=`。
   忘了改＝使用者拿到快取舊檔，而且**你在本機測起來完全正常**。
   2026-08-26 中招兩次：改完 footprint 產生器與公版資料，瀏覽器還是舊的，差點以為修法沒效。
5. **只驗「有沒有產出」不算驗**。每個功能都要有「算出來的數字／幾何對不對」的斷言。
6. **新增或修改的任何內容一律四語**（zh / en / ja / ko），不只新功能。
7. **做完就 commit + push；靜態站 push 完會自動上線，Edge Function 不會。**
   - **靜態站：Cloudflare 端接了 GitHub，push 到 main 就自動部署**（2026-08-28 實測：
     拆閘門的 commit push 完，線上馬上就沒有閘門、新檔 `pcb-nets.js` 也已 200，
     而當時 `wrangler deploy` 還沒成功跑過一次；之後手動跑，回的是
     `No updated asset files to upload`——資產早就在上面了）。
     手動 `npx wrangler deploy` 仍然可用，是備援與緊急回滾用，不是每次都要跑。
     **`.github/workflows/ci.yml` 沒有 deploy step**，自動部署是 Cloudflare 那一端做的，
     從 repo 這邊看不出來——別再照舊文件叫使用者每次手動部署。
   - **Edge Function 一定要手動**：動到 `supabase/functions/` 就得
     `npx --yes supabase functions deploy <函式> --project-ref dmkxjawjrmltmrmkebbs --use-api`。
     不部署＝前端已更新、後端還是舊的，**安靜給錯東西**（見 §4）。
   - 兩種部署都要互動式登入，**只有使用者做得了**。指令照規矩 8 貼完整，
     **自帶 `cd "C:\Users\User\Documents\Web"`、用 PowerShell 語法、一段一個指令**。
8. **要使用者跑 SQL 或指令時，把完整內容貼進對話**，不要只給檔案路徑。
9. **宣稱「完成／修好」前先實際驗證**：跑測試、貼 exit code、實際呼叫一次。
   要寫進對外文案的功能，先在瀏覽器實跑一次。
10. **新視窗裡的 inline script 與 onclick 一律不執行**（繼承本站 CSP）。
    `window.open` + `document.write` 開出來的頁面，互動要由開啟它的那一頁掛 listener。
11. **`core.autocrlf=true`：本機 HTML 是 CRLF，git 與線上是 LF**。任何比對檔案位元組的
    檢查器都要先 `.replace(/\r\n/g, '\n')`。改檔的腳本也要偵測既有換行再寫回，
    否則整個檔案的 diff 會炸開。
12. **外部腳本一律自行代管**。線上 CSP 是 `script-src 'self' https://static.cloudflareinsights.com`，
    從 CDN 載腳本上線必被擋，而本機 dev server 不套 `_headers` 所以看不出來。
    `csp-hash.js --check` 與 `vendor-check.js` 有守門。
13. **測資要能分辨實作**。每寫一條斷言就問：**錯的實作會讓這條紅嗎**？
    答不出來就是還沒測到。做法：改壞那一行、確認測試真的紅、再改回來。
14. **先量再改**。動效能或成功率之前先量瓶頸在哪，否則會對著錯的假設寫一整個功能。
15. **驗收要走使用者的路徑**。node 沒有 localStorage、工具有自己的 state、
    只跑一半的 DRC 都會給你綠燈。要驗就：重新載入 → 套用所有規則來源 → 再看（教訓段有三次實例）。

---

## 1. 開場三分鐘

```bash
node pcb-logic.test.js && node gerber-check.js && node gerber-readback.js
```

三支綠代表 PCB 地基沒壞。全套見 §6。

**接著確認線上是不是最新版**（repo 乾淨不代表已部署）：

```bash
curl -s https://hardware-ai.org/pcb.js | grep -c previewClearance
```

回 0 就是線上還沒有即時淨空那批功能。要逐檔比對就抓 hash：

```bash
for f in pcb.js pcb-rules.js i18n.js; do L=$(md5sum $f | cut -c1-8); R=$(curl -s https://hardware-ai.org/$f | md5sum | cut -c1-8); echo "$f local=$L live=$R"; done
```

---

## 2. PCB 模組地圖

`pcb.js`（3803 行）是編輯器主體，其餘都是可獨立測試的模組。
**新功能優先寫成模組**：純函式、不碰 DOM、node 測得到；UI 綁定另外放。

| 檔 | 全域 | 做什麼 |
|---|---|---|
| `pcb.js` | `pcbApp` | 編輯器主體：擺件、走線、渲染、DRC 呼叫、匯出入口 |
| `pcb-rules.js` | `NetRules` `Ratsnest` `AutoRoute` `RouteAll` | net 規則、飛線、單條繞線原語（含差分對與逃逸繞線）、多條策略 |
| `pcb-shove.js` | `Shove` | 推擠：把擋路的平行鄰居側推（只平移、不重繞、不連鎖） |
| `pcb-drc.js` | `PadDrc` | pad 級 DRC（線距／環寬／孔距／sliver／courtyard…）＋幾何工具 `_geom` |
| `pcb-constraints.js` | `ConstraintMgr` | net class、間距矩陣、銳角 |
| `pcb-stackup.js` | `Stackup` `Padstack` `Backdrill` | 疊層、via 預設、背鑽 |
| `pcb-fabs.js` | `FabProfiles` | 四廠能力檔與 DFM 檢查（規矩見 §5） |
| `pcb-mfg.js` | `Mfg` `MfgUI` | 淚滴、縫合孔、鑽孔表、拼板、轉角導角（`Mitre`） |
| `pcb-pour.js` | `PcbPour` | 鋪銅孤島偵測與移除（**柵格**版，匯出目前吃這條路） |
| `pcb-pour-geom.js` | `PourGeom` | 鋪銅**多邊形布林**（Clipper）；目前是選用，見 §8 |
| `pcb-sch2pcb.js` | `Sch2Pcb` | 線路圖 → PCB（真封裝）、ECO 增量合併、封裝回寫 |
| `pcb-dxf.js` | `PcbDxf` | 板框 DXF 匯入／匯出 |
| `pcb-step.js` | `PcbStep` | STEP (AP214) 3D 匯出 |
| `pcb-silkimg.js` | `PcbSilkImg` | 圖片轉絲印 |
| `pcb-crossprobe.js` | `CrossProbe` | 線路圖 ↔ PCB 選取連動 |
| `pcb-3d.js` | `Pcb3D` | 3D 板面檢視（Three.js 自 `vendor/` 載入；元件為方塊近似） |
| `pcb-panels.js` | — | 浮動面板：自動收集 `.panel-section[data-panel]`，加一段 HTML 就會出現 |
| `pcb-refboards.js` | `PCB_REFBOARDS` | 8 片參考公版（7009 行，**產生出來的**，見 §4） |
| `supabase/functions/_shared/gerber.mjs` | — | 後端 Gerber／Excellon／CPL／IPC-356／鑽孔表 |
| `supabase/functions/_shared/odbpp.mjs` | — | 後端 ODB++（銅層／鑽孔／板框／元件／netlist／**鋪銅內孔**） |
| `supabase/functions/_shared/ipc2581.mjs` | — | 後端 IPC-2581（開放標準單一 XML；真圓弧＋鋪銅 Cutout） |
| `supabase/functions/_shared/assembly.mjs` | — | 後端組裝圖（頂／底 SVG ＋ 放置清單；**底面鏡射**） |
| `pcb-index.js` | `PcbIndex` | 共用空間索引（可增刪）＋各種圖元外框；增量 DRC 的地基 |
| `pcb-nets.js` | `NetModel` | net 一級物件：屬性表（阻抗目標／成對關係）、**唯一一份** net 參照列舉與 IPC-2141 公式 |
| `pcb-fpinst.js` | `FpInst` | 元件實例 ／ 封裝庫分離：fpRef＋幾何雜湊，判斷跟庫同不同步、安全同步 |
| `pcb-arc.js` | `PcbArc` | 圓弧幾何：點到弧精確解、弧對線段/弧的有界誤差細分 |
| `gerber-import.js` | `GerberImport` | Gerber RS-274X ＋ Excellon 匯入（有損，見 §8） |
| `alien-import.js` | `AlienImport` | Eagle .sch/.brd、LTspice .asc 匯入；Altium 只辨識不解析 |
| `spice.js` | `Spice` | MNA 求解器：DC／瞬態／AC（一階元件模型） |
| `sch-spice.js` | `SchSpice` | 線路圖 → SPICE 網表（認不得的元件拒絕分析，不硬塞） |
| `annotate.js` | `Annotate` | 線路圖 refdes 自動編號（做在線路圖端才不會被同步蓋掉） |
| `sch-bus.js` | `SchBus` | 匯流排：寫法解析、分支幾何、稽核（幹線「不導電」那條規則在 `circuit-engine.js`） |
| `sch-hier.js` | `SchHier` | 階層式圖紙：port／圖紙符號、遞迴偵測、攤平成「元件清單＋netOf」 |
| `sch-swap.js` | `SchSwap` | pin/gate swap：哪些腳可互換（**保守表**）、排列合成、稽核 |
| `pcb-autoplace.js` | `AutoPlace` | 自動擺件粗排（無亂數、可重現） |
| `footprint-editor.js` | `FootprintEditor` | 自製封裝：dual/quad/grid/chip ＋ 幾何檢查 |
| `fp-lib.js` | `FpLib` | 封裝庫存取：沒登入落 localStorage、登入落雲端，介面相同 |
| `designs.js` | `Designs` | 雲端多專案存檔（sch ＋ pcb 同一列） |
| `designs-ui.js` | `DesignsUI` | 專案清單 UI，線路圖頁與 PCB 頁共用 |

### `pcb.js` 裡找得到的東西

| 功能 | 行號 |
|---|---|
| `runDrc()` | :790 |
| `exportFab(format)`（Gerber／ODB++ 共用） | :1145 |
| `applySelFootprint()`（換封裝＋回寫線路圖） | :1843 |
| `beginRubber()` / `updateRubber()`（拖曳橡皮筋） | :2166 |
| `previewClearance()`（繞線時即時淨空） | :2204 |
| `syncFromSchematic()`（多頁 ECO 同步） | :2578 |
| `autoRoutePairs()`（差分對優先繞） | :2756 |
| `autoRoute()` | :2801 |
| `netSummary()` / `renderNetPanel()`（網路清單） | :3718 |

### 載入順序有講究

`pcb.html` 裡，**被 `pcbApp.init()` 直接用到的模組必須排在 `pcb.js` 之前**
（例如 `pcb-crossprobe.js`）。排後面會讓功能靜靜不啟用，**沒有任何錯誤訊息**。
只在按鈕事件裡用的（`pcb-mfg.js` 等）才可以排後面。

---

## 3. 測試地圖

PCB 相關 34 支、合計 **約 3100 條斷言**，另有 `dead-button-check` 掃 136 顆按鈕。
2026-08-27 新增 13 支、2026-08-28 再 2 支（下表加粗者），全部對**解析解**或 **round-trip** 比對，不對「上次跑出來的數字」比對。
改哪裡就先看對應那一支。

| 測試 | 斷言 | 守什麼 |
|---|---|---|
| `pcb-logic.test.js` | 396 | 編輯器邏輯、DRC、繞線策略、差分對、逃逸繞線、橡皮筋、即時淨空、網路清單、公版缺陷預算 |
| `gerber-check.js` | 473 | 匯出**結構**：表頭、層數、鑽孔對齊 pad、CPL／IPC 行數 |
| `odb-check.js` | 379 | ODB++ 結構 + **readback**：features 讀回來逐筆比對 |
| `gerber-readback.js` | 195 | Gerber **幾何**：解析回來跟原始板逐條比對 |
| `pcb-mfg.test.js` | 137 | 淚滴／縫合孔／鑽孔表／拼板／轉角導角的幾何合法性 |
| `sch2pcb.test.js` | 101 | 線路圖轉 PCB：封裝是不是真的、ECO 合併、封裝回寫 |
| `dxf.test.js` | 63 | 板框：單位、弧線、**封閉性**、來回一趟 |
| `step.test.js` | 62 | STEP：參照完整性、**流形性**、尤拉示性數 |
| `gerber-mfg.test.js` | 61 | 製造功能有沒有真的進匯出檔（含前後端鑽孔表對齊） |
| `silkimg.test.js` | 47 | 圖片絲印：換算、合併、太細偵測 |
| `pour.test.js` | 45 | 鋪銅孤島（柵格版）：連通性、挖除範圍、誤判 |
| `gerber-pour.test.js` | 43 | 鋪銅**極性**：間隙、熱風焊盤輻條、孤島真的沒進檔 |
| `blindvia.test.js` | 38 | 盲埋孔：跨層範圍、分檔、板廠能力 |
| `crossprobe.test.js` | 27 | 選取連動：回音防護、訊息驗證 |
| `shove.test.js` | 26 | 推擠：**不該推的時候不可推**（端點被釘住、會撞到別人、距離太遠） |
| `pourgeom.test.js` | 25 | 鋪銅布林：每個案例對**面積的解析解** |
| `pcb3d.test.js` | 18 | 3D 的自算部分：板框串接、元件高度 |
| **`gerber-import.test.js`** | 76 | Gerber/Excellon 匯入：拿自家產生器的輸出 round-trip |
| **`footprint-editor.test.js`** | 73 | 自製封裝：對 SOIC-8／TSSOP-20／QFP-32／0603 的規格書數字 |
| **`alien-import.test.js`** | 63 | Eagle／LTspice：認不得的元件**不可以**被硬塞成別的 |
| **`spice.test.js`** | 62 | MNA：分壓、RC/RL 時間常數、−3dB、LC 諧振全對閉式解 |
| **`pcb-arc.test.js`** | 62 | 圓弧幾何；細分誤差要真的量一次最大弦高 |
| **`designs.test.js`** | 61 | 雲端專案：清單**不可以**撈 data、存一半不可以清掉另一半 |
| **`pcb-index.test.js`** | 60 | 空間索引：300 物件 × 60 查詢與全比對逐一對照 |
| **`fp-lib.test.js`** | 42 | 封裝庫：登入後本機那份不可以不見 |
| **`sch-spice.test.js`** | 37 | 線路圖轉網表：接地認定、單位換算、拒絕分析的時機 |
| **`true-arc.test.js`** | 38 | 真圓弧端到端：導角 → DRC → Gerber G02/G03 → 解析回來 |
| **`ipc2581.test.js`** | 66 | IPC-2581 ＋ 組裝圖；第一條就是 **well-formed XML** 檢查 |
| **`autoplace.test.js`** | 32 | 自動擺件：不重疊、在框內、可重現、鎖定的不動 |
| **`odb-cmp.test.js`** | 30 | ODB++ 元件與 netlist（公版沒有 pad，驗不到，另造合成板） |
| **`pour-default.test.js`** | 29 | 布林鋪銅成為匯出預設；重算必須冪等 |
| **`annotate.test.js`** | 29 | refdes 編號：fill 模式不可以動既有編號 |
| **`backannotate.test.js`** | 27 | refdes／net 回寫；含「沒回寫就會被同步蓋掉」的反例 |
| **`drc-incremental.test.js`** | 25 | 增量 DRC：只擔心漏報 |
| **`drc-arc.test.js`** | 15 | DRC 對真弧：差 0.001mm 的違規也要抓到 |
| **`sch-bus.test.js`** | 67 | 匯流排：**幹線不可以把整束訊號短在一起**、寫法解析、分支幾何、稽核 |
| **`sch-hier.test.js`** | 58 | 階層式圖紙：**多實例必須彼此隔離**、遞迴當場擋下、port 上下接、頂層判定 |
| **`sch-swap.test.js`** | 66 | pin swap：**有極性的腳不可以換**、排列是合成不是覆寫、換完活得過 ECO |
| **`netmodel.test.js`** | 118 | net 一級物件：六種圖元的改名列舉、IPC-2141 閉式解、解算器 round-trip、差分對量測 |
| **`fpinst.test.js`** | 87 | 元件實例／封裝庫分離：**手改過的幾何不可被一鍵更新蓋掉**、同步不可弄丟 net |

**`gerber-check` 綠不代表匯出對**：把所有走線孔徑改成固定 0.25，它照樣全綠，
`gerber-readback` 才抓得到。結構與幾何是兩件事。

---

## 4. 動這幾個檔之前先讀

### `_headers`（CSP）
- 改任何 inline `<script>` 之後**一定要跑 `node csp-hash.js`**，否則那段上線被自己的 CSP 擋掉。
- **不准加 inline 事件處理器**（`onclick=`），`csp-hash.js` 直接 FAIL。
- 三個 directive 改了會**靜靜壞掉**：`form-action` 少綠界網域（沙盒與正式是不同網域）→ 付款沒反應；
  `frame-src` 少 `falstad.com` → 模擬器不動；`connect-src` 少 Supabase → 全站 API 死掉。

### `supabase/functions/`（金流與匯出）
改完**必須重新部署**：
```bash
npx --yes supabase functions deploy <名稱> --project-ref dmkxjawjrmltmrmkebbs --use-api
```
- `ecpay-webhook` 要加 `--no-verify-jwt`；**`pcb-export` 與 `create-order` 絕對不要加**。
- `--use-api` 是必要的（本機沒跑 Docker）。
- webhook：**任何 DB 失敗都不准回 `1|OK`**。
- `pcb-export` 現在同時吃 `format: "gerber"` 與 `"odb"`；**前端有 ODB++ 按鈕但後端沒重部署的話，
  使用者會拿到一包 Gerber 卻叫 `-odbpp.zip`**——安靜給錯東西，比報錯嚴重。

### `vendor/`
- 內容與 `vendor/README.md` 的 SHA-256 必須相符，`vendor-check.js` 在 CI 顧著。
- 目前 7 個檔：supabase-js、pdf.js（主檔＋worker）、qrcodejs、three r128＋OrbitControls、clipper 6.4.2。
- 新增前先掃**外部網址與網路 API**（`fetch`／`XMLHttpRequest`／`WebSocket`／`sendBeacon`），把結果寫進 README。
- `.gitattributes` 把 `vendor/**` 標成 `-text`。**`pdf-3.11.174.worker.min.js` 的檔名不能改**。

### `pcb-refboards.js` 是「產生出來的」，不要手改座標
公版的 components 座標、traces、vias、板框尺寸由 `tools/refboard-rebuild.js` 產生：
丟掉示意走線 → 擺位鬆弛（安裝孔不動、連接器少動、被動元件最自由；推不開就把板框放大）→
依 net class／NetRules 的線寬用真的繞線器重繞。

```bash
git checkout pcb-refboards.js                 # 一定要先還原，工具不可吃自己的輸出
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

## 6. 檢查（與 `ci.yml` 一一對應）

2026-08-28 對齊過一次：這份清單的 63 支與 `.github/workflows/ci.yml` **完全相同**。
（在那之前 2026-08-27 新增的 18 支一支都不在 CI 裡——本機跑得到、push 上去不會擋。）
**加測試就要同時加進 `ci.yml`**，用這支驗有沒有漏（它自己也在 CI 裡）：

```bash
node ci-parity-check.js
```

```bash
# PCB 地基
node pcb-logic.test.js
node gerber-check.js
node gerber-readback.js
node odb-check.js
node odb-cmp.test.js
node gerber-pour.test.js
node pour-default.test.js
node gerber-mfg.test.js
node true-arc.test.js
node ipc2581.test.js
node reffp-check.js
node dead-button-check.js

# PCB 功能模組
node pcb-mfg.test.js
node pour.test.js
node pourgeom.test.js
node blindvia.test.js
node pcb3d.test.js
node shove.test.js
node sch2pcb.test.js
node dxf.test.js
node step.test.js
node silkimg.test.js
node crossprobe.test.js
node pcb-arc.test.js
node drc-arc.test.js
node pcb-index.test.js
node drc-incremental.test.js
node netmodel.test.js
node fpinst.test.js
node designs.test.js
node annotate.test.js
node autoplace.test.js
node backannotate.test.js
node gerber-import.test.js
node alien-import.test.js
node spice.test.js
node sch-spice.test.js
node footprint-editor.test.js
node fp-lib.test.js

# 線路圖與知識庫
node circuit-check.js --strict
node wire-gap-check.js --selftest && node wire-gap-check.js --strict
node symbol-overlap-check.js --selftest && node symbol-overlap-check.js --strict
node svg-overlap-check.js --strict
node knowledge-art-audit.js --strict --quiet
node knowledge-format.test.js
node net-label.test.js
node sch-bus.test.js
node sch-hier.test.js
node sch-swap.test.js
node interview-diagram-check.test.js && node interview-diagram-check.js

# 資料抽取
node pin-extract.test.js
node ic-extract.test.js
node ds-compare.test.js

# 四語
node i18n-check.js
node i18n-quad-check.js
node ui-i18n-check.js --strict
node html-i18n-check.js --strict
node art-i18n-check.js --strict
node art-lang-render.test.js
node interview-i18n-check.js --strict
node news-i18n-check.js --strict

# 供應鏈與 CSP
node vendor-check.js --strict
node csp-hash.js --check
node asset-leak-check.js
node ci-parity-check.js

# 金流
node ecpay-config.test.mjs
node plan-dates.test.mjs
```

預覽用 `preview_start({ name: "web-static" })`，**不要用 Bash 起 server**。

⚠ 那份設定在 **`C:\Users\User\Hardware\.claude\launch.json`**（Claude 的工作目錄），
**不在這個 repo 裡**。它做的事就是 `python -m http.server 8099 --directory C:/Users/User/Documents/Web`。
換一台機器或換工作目錄就沒有了，要自己補一份。

瀏覽器驗證有兩個坑：**pane 沒顯示時 canvas 會是 0 寬**（先 `resize_window` 再測），
以及**瀏覽器會快取 HTML**（網址加 `?cb=<隨便>` 強制重抓，否則你改的 `?v=` 根本沒生效）。

---

## 7. 使用者要你怎麼做事

- **證據型回報**：exit code、`file:line`、實測數字。不要「應該可以了」。
- **他指出問題時先驗證他說的**，通常是對的。
- **他推翻你的建議時那是他的決定**，照做並講清楚代價，不要再勸一次。
- **不要順手重構沒叫你動的東西。**
- 需要他決定的事（新增外部相依、要不要重做既有資料）**先問**，不要自作主張。
- **他要一次部署完**：功能全部做完再給一份部署清單，不要每做一小塊就叫他部署一次。

---

## 8. 已知缺陷

**這一段最重要。** 這個 repo 反覆出現同一種失敗：功能有 UI、按下去有反應、結果錯或沒用。

| 功能 | 實際狀況 |
|---|---|
| **8 片公版的佈局是重建出來的** | 🟡 DRC error 0，但繞不完的 net 沒有走線（143/197 繞成）。缺陷預算鎖在 `pcb-logic.test.js` 第 21 節（**全 0，只准往下**） |
| **公版的 pad 大多沒有 net** | 🟡 公版資料本來就沒有 netlist。openrex 1436 顆 pad 裡 1400+ 沒 net。真正的解是匯入原廠 netlist |
| **四種匯出格式沒有人用真工具開過** | 🔴 **目前風險最高的一項**。結構與 round-trip 共 900+ 條斷言全綠，但那證明的是「我們自己讀得回來」。測試板與逐步清單已備妥：`node tools/make-verify-boards.js` ＋ `VERIFY-EXPORTS.md` |
| **ODB++ 仍缺** | 🟡 阻焊、絲印、鋼網、屬性（ATTR）、subnet 的完整分類。元件、netlist、鋪銅內孔都已補（2026-08-27） |
| **IPC-2581 是可製造子集** | 🟡 疊構只有順序與厚度（沒有材料與介電常數，我們沒那資料）、沒有阻抗需求與 DFX 規則集 |
| **組裝圖的元件外形是方框** | 🟡 courtyard 矩形近似，不是真實輪廓；極性只靠 refdes 前綴判斷 |
| **Altium 匯入只辨識不解析** | ⬜ 刻意的。`.PcbDoc` 是二進位 OLE、無公開規格，半套逆向會把元件放在錯的位置，比匯入失敗更糟 |
| **Gerber 匯入是有損的** | 🟡 Gerber 沒有 net、沒有元件。匯入後 net 全空、閃光包成一顆假元件。用途是「看別人的板子與量距離」 |
| **Eagle 匯入不還原封裝圖形** | 🟡 元件用佔位尺寸放上去、pads 空的，要自己指定封裝 |
| **SPICE 是一階模型** | 🟡 二極體 Shockley、BJT Ebers-Moll、MOSFET 平方律。看偏壓／時間常數／轉角頻率夠用；預測真實元件的邊界行為不夠。AC 的非線性小訊號模型是簡化的（有警告） |
| **線路圖的舊「模擬」按鈕** | 🟡 單迴路估算，不看拓樸。留著不動（快），新的走 `sch-spice.js` 的 MNA |
| **推擠** | 🟡 只推得動平行鄰居、只平移、不連鎖 |
| **autoRoute 差分對** | 🟡 耦合度 98.8%。長度差只回報不自動補 |
| **back-annotation** | 🟡 封裝、refdes、net 都會回寫了。**pin/gate swap 仍不會** |
| **阻抗／熱／EMI** | 🟡 IPC-2141 ±10%；θ 公式是擬合值無出處；EMI 只算迴路面積。目標阻抗稽核（2026-08-28）用的是同一條近似式，而且**只在 IPC-2141 標示的有效範圍內**給建議線寬（microstrip 0.1 ≤ w/h ≤ 3、stripline w ≤ 0.35(2h+t)），超出就明說做不到 |
| **datasheet PDF 抽腳位** | 🟡 193 顆實測：完全正確 77、部分正確 37、錯得多 34、明講讀不出來 35 |
| **2nd source 比對** | 🟡 可用於「講差異」，不可用於「判定能不能換」 |
| **3D 檢視** | 🟡 元件是方塊不是原廠模型，內層走線與絲印不畫 |
| **自訂多腳 IC 存元件庫** | ⬜ 要登入才測得到，**沒人驗過**（封裝庫那條路已驗，這是線路圖端的 IC） |
| **贊助流程** | ⬜ `plan='sponsor'` 只入帳不發權益那條路從沒實測 |
| **備份還原** | ⬜ `restore-drill.sh` 用合成 dump 自我驗證過，**沒跑過真的 artifact** |
| **練習模式／教學導覽** | ⬜ `pcb-practice.js`、`pcb-tutorial.js` 存在但**沒有任何頁面載入**，13KB 死碼 |
| **PCB 權限界線（2026-08-28 改）** | 🟡 `pcb.html` / `pcb-viewer.html` 的存取閘門**已整個移除**，編輯器對所有人開放。付費線退到後端：`pcb-export`（板廠檔）與 `pcb-thermal`（逐條載流量）仍檢查 `profiles.pcb_access`。**四種方案都給 pcb_access**（`vip_1m/3m/6m/12m`），12 個月多的是面試題庫——舊閘門寫「12 個月方案專屬」本來就跟 webhook 不一致 |

**沒有 Allegro SKILL 匯出**，只有 json / kicad / gerber / odb++ / ipc2581 / assembly / csv / tcl。

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

2026-08-27：使用者核定「剩下的 15 項全部要做」。這裡是那 15 項的現況。
分批做的原則是**先低風險純新增、再動核心資料模型**，每批做完跑全套並更新這份文件。

### 批次 1 — 匯出正確性 ✅

| # | 項目 | 結果 |
|---|---|---|
| 1 | ODB++ 鋪銅內孔 | ✅ `surface` 的 I/H contour。測試直接讀輸出文字驗繞向，不猜實作 |
| 2 | IPC-2581 | ✅ 新格式。真圓弧 `<Arc>`、鋪銅 `<Cutout>`、BOM、網表 |
| 3 | 組裝圖 | ✅ 頂／底 SVG ＋ 放置清單。**底面鏡射**（旋轉方向也反） |

### 批次 2 — 效能與架構 ✅

| # | 項目 | 結果 |
|---|---|---|
| 4 | 繞線與鋪銅改用共用索引 | ✅ 繞線的節點索引換成 `PcbIndex`；鋪銅的 cuts 收集加範圍篩選（大板 **3 倍**，結果逐一相同） |

### 批次 3 — 資料模型 ✅

| # | 項目 | 結果 |
|---|---|---|
| 5 | net 升級成一級物件 | ✅ `pcb-nets.js`。屬性放 `state.netProps[名字]`（**識別仍是名字**，見下）；阻抗目標與成對關係進 DRC，會算出「該改成多少線寬／間距」 |
| 6 | 元件實例 ／ 封裝庫分離 | ✅ `pcb-fpinst.js`。**pads 不搬家**，另記 fpRef＋幾何雜湊；同不同步＝一次雜湊比對，手改過的永遠不會被一鍵更新蓋掉 |

**為什麼 net 沒有改成 id**：pad／走線／via／鋪銅上的 net 換成 id，等於每一張存過的板子都要遷移，
而且 net 名字本來就是線路圖與板子之間的共同語言（改名已有雙向同步）。
所以識別仍然是名字，屬性另外放，改名時由 `NetModel.rename` 一起搬。
**副作用（好的那種）**：net 參照列舉從此只有一份，順手修掉「改名漏掉 `userZones` 與 `teardrops`」的舊 bug。

**這一批的界線**：net 屬性目前只進 DRC 與面板，**沒有寫進匯出檔**（ODB++／IPC-2581 的網表仍只有 net 名）。
封裝同步只做「庫 → 板」，不做「板 → 庫」。

### 批次 4 — 線路圖 ✅

| # | 項目 | 狀態 |
|---|---|---|
| 7 | 匯流排（bus） | ✅ `sch-bus.js`。幹線是**記號不是導體**，分支展開成成員名，靠既有的「同名 net 標籤 union」相連 |
| 8 | 階層式圖紙（子圖當符號） | ✅ `sch-hier.js`。`port`（子圖對外接點）＋ `sheetref`（母圖上的圖紙符號）；攤平在 **net 層**做，不複製幾何 |
| 9 | pin / gate swap | ✅ `sch-swap.js`。交換記在線路圖元件的 `pinSwap`，由 `bindNets` 套用——**沒回寫就活不過下一次 ECO** |

**匯流排為什麼不必動節點演算法**：`computeNets` 本來就會把**同名 net 標籤 union**，
所以分支只要拿到成員名字（`D3`），相隔十萬八千里的兩處 `D3` 自動就是同一條 net。
真正要小心的只有一件事——**幹線不可以導電**。它在幾何上是一條線，分支端點又落在它身上，
照 T 型接點的規則會把 D0..D7 全部短在一起，而且畫面上完全正常。
這條規則放在 `circuit-engine.js` 的 `normalizeBuses`（`computeNets` 與 `junctions` 共用），
**不是**呼叫端的前置步驟：computeNets 有六個呼叫端，少一個記得就中招。

### 批次 5 — 互動 ⬜

| # | 項目 |
|---|---|
| 10 | 連續多段繪製（轉彎不必放開） |
| 11 | 整條走線拖曳（現在只能拖端點） |
| 12 | 拖曳時的對齊輔助線 |
| 13 | 完整 push-and-shove（邊繞邊擠、連鎖） |

### 批次 6 — 模擬 ⬜

| # | 項目 |
|---|---|
| 14 | SPICE 探針與游標量測 |
| 15 | 蒙地卡羅 ／ 參數掃描 |

### 批次 7 — 其它 ⬜

| # | 項目 | 界定 |
|---|---|---|
| 16 | 變更歷史（版本樹） | 雲端目前只存最新一版 |
| 17 | 原廠 3D 模型 | **做的是「匯入你自己的 STEP 並綁到封裝」**，不是內建模型庫——那是別人的商業資料，跟明確不做的 LCSC 生態同一條線 |

### 插隊項（做完批次 2 之後最該做的）

**用真工具開一次匯出檔**。這是 §8 唯一的 🔴，而且只有站主做得了。
測試板與逐步清單已備妥，見 `VERIFY-EXPORTS.md`。

## 11. 額度與成本

- Supabase 免費層：Egress 5 GB/月（未登入訪客瀏覽＝Supabase 0 KB）、資料庫 500 MB（目前約 60 KB）、
  Edge Function 500,000 次/月、MAU 50,000、閒置暫停 1 週（`keepalive.yml` 每週一四擋著）。
- Brave Search 額度有限（~1000/月）：**優先 WebFetch**，非必要不用 `brave_web_search`。
- YouTube 內容用 `~/.claude/yt-read.ps1`，不要直接 WebFetch。
- 大檔（>200 行）先 Grep 定位再 Read 該段，不要整檔讀。
- 重建公版是**離線工具**，全 8 片約 35 分鐘。丟背景跑，不要卡著等。

---

## 12. 與業界工具的差距（2026-08-27 盤點）

對照組是 EasyEDA。這一節只列**還缺什麼**，已經有的看 §2。
生態系（LCSC 料庫與庫存）已明確不做，不列在這裡。

判讀：🔴 擋住「能不能用」／🟡 影響體感或正確性但有替代路徑／⬜ 想要但不急。

### A. 線路圖 ↔ Layout

| 缺什麼 | 影響 |
|---|---|
| 🟡 **封裝不在線路圖階段綁定** | 轉換時挑預設變體並標成「猜的」，要在 PCB 選那顆改 |
| 🟡 **匯流排不進 PCB 端** | 線路圖畫得了匯流排了（2026-08-28），但轉 PCB 之後就只是一條條獨立的 net，沒有「這 8 條是一束」的概念 |
| 🟡 **階層只到 net 層** | 子圖當符號可以了（2026-08-28），但沒有「進入子圖」的導覽（要自己切頁），也沒有把階層路徑帶進 PCB 的 refdes |
| 🟡 **net class 沒從線路圖帶過來** | class 是 PCB 端用 pattern 猜的 |
| 🟡 **gate swap 只到「判斷可不可以換」** | pin swap 端到端可用了（2026-08-28）；整組閘對調有 `canSwapGates` 但還沒有 UI |

### B. 互動與手感

| 缺什麼 | 影響 |
|---|---|
| 🟡 **完整 push-and-shove** | 只推得動平行鄰居、只平移、不連鎖（批次 5） |
| 🟡 **連續多段繪製** | 一次拖一段，轉彎要放開再拉（批次 5） |
| 🟡 **整條走線拖曳** | 只能拖端點（批次 5） |
| 🟡 拖曳時的對齊輔助線 | 對齊只能事後按鈕（批次 5） |

### C. 資料模型

| 缺什麼 | 影響 |
|---|---|
| 🟡 **net 屬性沒進匯出檔** | 阻抗目標／成對關係只在編輯器與 DRC，板廠拿到的網表仍只有 net 名 |
| 🟡 **封裝同步是單向的** | 庫 → 板可以，板上改好的幾何回寫成庫需要手動走「從選取建封裝」 |
| 🟡 沒有變更歷史 | 雲端只存最新一版，沒有版本樹（批次 7） |

### D. 製造與驗證

| 缺什麼 | 影響 |
|---|---|
| 🔴 **沒有人用真的 CAM／CAD 開過匯出檔** | 六種格式的結構都驗過，但「打得開」是另一回事。**目前風險最高** |
| 🟡 **IPC-2581 的疊構沒有材料** | 只有順序與厚度，沒有 Dk／Df——我們沒有那些資料 |
| 🟡 **組裝圖的元件外形是方框** | courtyard 矩形近似，不是真實輪廓 |
| 🟡 **阻抗只有 IPC-2141 近似** | ±10%，量產以板廠場解為準 |
| ⬜ **原廠 3D 模型** | 3D 與 STEP 的元件都是佔位方塊（批次 7 做匯入自己的 STEP） |

### E. 模擬

| 缺什麼 | 影響 |
|---|---|
| 🟡 **元件模型是一階的** | 沒有 BSIM、溫度、雜訊 |
| 🟡 **AC 的非線性小訊號模型簡化** | 含電晶體的頻率響應僅供參考（有警告） |
| 🟡 **沒有探針與游標量測** | 波形畫得出來，不能點某點讀數值（批次 6） |
| 🟡 沒有蒙地卡羅、參數掃描 | 批次 6 |

### F. 規模與效能（2026-08-27 實測）

| 項目 | 實測 | 備註 |
|---|---|---|
| 整張重畫 | 2.5ms（openrex 1436 pad） | 不是瓶頸 |
| 全板 DRC | 210ms（1600 pad 合成板） | — |
| **區域 DRC** | **0.46ms** | 畫線當下就檢查（460×） |
| **布林鋪銅（大板）** | **7.1ms**（原 21.5ms） | 範圍篩選，**結果逐一相同**（3×） |
| 空間索引查詢 | 與全比對逐一對照一致 | — |
| undo 快照 | 1.9ms、狀態 219KB | 十倍規模會吃記憶體 |
| 3D 建場 | 130ms | InstancedMesh 合併後 |

共用空間索引（`pcb-index.js`）現在 **DRC、繞線、鋪銅三邊都在用**。
柵格鋪銅（`pcb-pour.js`）仍有自己的柵格，但那是洪水填充的演算法本體，
不是空間索引——那個不該換。

### G. 不做的

料件庫存與採購整合（LCSC/JLCPCB 那一層）。那是商業資料授權，不是工程問題。

## 教訓

- 2026-08-27 | 改既有檔 | 用多行字串當 replace 的 anchor 一再失敗（空白/行尾看不出差異），而且 replace 不匹配時不報錯，腳本還印「已完成」 | 改檔一律逐行定位（findIndex + splice），改完立刻 grep 驗證真的改到
- 2026-08-27 | 效能優化 | 鋪銅加了空間索引反而慢 2 倍——小板上建索引比省下來的還貴 | 優化要量兩種規模；加門檻（這裡是 200 個 pad），並寫「篩選不改結果」的測試守住
- 2026-08-27 | ODB++ 內孔 | 無條件把洞的繞向反轉，但 Clipper 產出的 hole 本來就已經反向，再反一次變同向 | 先量有向面積、同號才反；測試直接讀輸出文字比繞向，不猜實作
- 2026-08-27 | 加匯出格式 | exportFab 的檔名是 `format === odb ? A : B`，加了第三第四種格式就變成「拿到 IPC-2581 卻叫 -gerber.zip」 | 前後端都改成表驅動；二元判斷遇到第三個選項一定要改表
- 2026-08-27 | 部署 | `.assetsignore` 逐檔列檢查腳本，新增一支就漏一支（實際漏了 4 支到公開網域） | 用 pattern 不用清單，並由 `asset-leak-check.js` 在 CI 雙向守住（也要防 pattern 誤擋站台在用的檔）
- 2026-08-27 | 布林鋪銅 | 使用者按過「布林重算」之後又改走線，fillPolys 就過期了，畫面看起來完全正常 | 匯出前無條件重算一次；算失敗的那一塊不寫 fillPolys，讓下游退回柵格版
- 2026-08-27 | 加新模式 | Mitre 的訊息用二元判斷（arc 或 45），加了 trueArc 之後顯示成「45° 斜切」 | 模式名對應改成表；功能對但訊息騙人的錯沒有人會回報
- 2026-08-27 | 增量 DRC | 只過濾走線只快 1.6 倍，pad↔pad 的 O(n²) 才是主成本 | 要濾就連 pad 一起濾（濾完 210ms → 0.46ms）
- 2026-08-27 | 匯入 | Gerber 的 Excellon 座標同一個 `X20` 可能是 20mm 也可能是 0.02mm | 先掃全檔決定十進位還是格式化整數，不要靠單行猜
- 2026-08-28 | net 改名 | 六個帶 net 的陣列被手抄成四個，漏掉 `userZones` 與 `teardrops`；改完名字使用者畫的鋪銅還掛在舊網路上，畫面上完全看不出來 | 同一份清單被抄第二次就抽成單一列舉（`NetModel.refs`），改名/統計/稽核共用
- 2026-08-28 | 曲線擬合式 | 拿 IPC-2141 反解線寬，搜尋區間隨手給 [0.02, 10]，寬線讓 ln 引數 < 1、阻抗算成負的，於是「1Ω」也解得出答案 | 反解一定要把搜尋區間限在該式子**標示的有效範圍**內，超出回 null 不回邊界值
- 2026-08-28 | 重建封裝 | `RefFP.resolve` 吃的是公版規格表那一列（part+kind+ref+w/h），而 w/h 放上板後已被封裝本體蓋掉；只存 part 就回推，整片板被判成「庫裡找不到」 | 要能重算的來源，把**當初的輸入**整組抄一份存起來，不要事後從產物回推
- 2026-08-28 | 加面板 | 新面板只在 init 與按鈕時重畫，載入公版／復原之後停在上一片板的數字（看起來像功能沒作用） | 「換一批元件就會變」的面板一律掛進既有的重畫路徑（這裡是 `renderNetPanel` 與 `PcbHistory.applySnap`）
- 2026-08-28 | CI | §6 本機清單一路加到 63 支，`ci.yml` 停在 45 支——2026-08-27 新增的 18 支一支都沒進 CI，本機全綠而 push 上去根本不擋 | 清單型的東西要有「兩邊對照」的檢查（§6 開頭那段一行指令），不要靠記得同時改兩個地方
- 2026-08-28 | 付費鎖 | 前端閘門寫「12 個月方案專屬」，webhook 其實四種方案都給 `pcb_access`——文案與實作講的是兩件事，沒有人會回報 | 權限文案要從**授權的那一段程式**推導（這裡是 webhook 的 PLAN_RULES），不要各寫各的
- 2026-08-28 | 部署 | 文件寫「CI 沒有 deploy step，所以要手動 wrangler」，於是一直叫使用者手動跑——但 Cloudflare 那端早就接了 GitHub，push 就自動上線 | 「哪裡沒有做這件事」推不出「沒有人在做這件事」；部署與否要**直接量線上內容**，不要從 repo 這端的設定推論
- 2026-08-28 | 比對線上 | 第一輪 md5 比對報「3 個檔不同」，其實是本機 CRLF、線上 LF——差點誤判成沒部署 | 硬規矩 11 不是只給檢查腳本用的，**手打的 curl 比對也要先把 CR 去掉**
- 2026-08-28 | wrangler | `npx wrangler` 那包的 optionalDependencies 沒裝完（缺 `@cloudflare/workerd-windows-64`），載入階段就 throw，看起來像 wrangler 壞了 | 刪掉 `AppData/Local/npm-cache/_npx/<hash>` 那個目錄重跑即可；**不要**改成專案內 `npm i -D wrangler`——assets 目錄是 `.` 而 `.assetsignore` 沒擋 `node_modules`
- 2026-08-28 | 自檢指令 | 在 §6 內文寫了一行 `node -e` 用 `indexOf('## 6. 檢查')` 找章節，結果它找到的是**自己那行指令裡的字串**，掃出 0 支測試然後回報「CI 缺：無」 | 檢查腳本要有「掃到 0 筆就算失敗」的下限守衛；文件裡放檔名（`ci-parity-check.js`），不要放會掃到自己的一行指令
- 2026-08-28 | 階層展開 | 頂層直接取第 0 頁，但使用者通常先畫子圖、子圖就排在前面——會從子圖開始展開，母圖上的東西整批不見而且不報錯 | 「哪一個是根」要用結構推（沒有被任何人參照的那一頁），不要用順序猜
- 2026-08-28 | 量文字重疊 | 用 SVG 的 `getBBox()` 比對兩個元件的文字，回報一堆假重疊——那是**元件本地座標**，兩顆同型元件的 bbox 本來就一樣 | 跨元件比位置一律用 `getBoundingClientRect()`（畫面座標），`getBBox()` 只能拿來比同一個 `<g>` 裡面的東西
- 2026-08-28 | 改 HTML | 用 python 以 `
- 2026-08-28 | pin swap | 排列的 key 是**線路圖腳名**（a/b），但 pad 編號是 1/2；先把 pad 編號換掉再去查腳，交換就靜靜失效、看起來像沒做 | 換位置要在**兩邊命名一致的那一層**做：先照原本的規則解出腳，再換那隻腳
` 組多行字串去比對 index.html，assert 一直失敗——那個檔是 CRLF | 硬規矩 11 也適用於**腳本改檔**：先偵測既有換行再組字串，不要假設 LF

只留還會再犯的。同型的已升級成 §0 硬規矩，不重複列。

### 驗證
- **驗收要用使用者實際會看到的狀態**。同一批公版，三種驗法給三種答案：
  只跑 `PadDrc` → 0 錯（漏掉 Constraint Manager 的 class 線寬，13 條電源線只有 0.15mm）；
  跑完整 `runDrc` 但用工具自己的 state → 0 錯（漏掉重新載入時 net 會重推）；
  node 跑 `runDrc` → 0 錯，瀏覽器打開卻紅（node 沒有 localStorage，`NetRules` 是空的；
  瀏覽器一載入就是 VIN 0.5mm）。三次都是「驗了一半就宣布完成」。
- **產生器不要吃自己的輸出**。重建工具會把結果寫回 `pcb-refboards.js`；沒先 `git checkout` 就重跑，
  等於拿上一輪的走線端點當輸入，一代一代漂移（197 條線變成 491 條），再也無法從原始檔重現。
- 「有渲染」「有產出」「有檔案」都不等於「對」。轉換類功能要斷言輸出**與權威來源逐位元一致**。
- 「DRC 全綠」不等於「板子對」：規則檢查只涵蓋寫得出規則的部分，
  連通性（鋪銅孤島）這類性質要另外驗。
- 開不了 CAD 不等於不能驗：流形性、尤拉示性數、參照完整性都是程式驗得了的硬性質。
  驗不了的照實標「未驗證」。
- mutation 測試沒紅時，先懷疑**測資**而不是慶祝。
- 有數量上限的輸出必須是決定性的：候選要照原始索引排序，否則同一片板兩次跑出不同結果。
- 測試太慢＝沒人會跑。用禁佈區多邊形取代上萬條線段，同樣的封鎖從數分鐘變 0.3 秒。

### 演算法
- 退化幾何要單獨想過：`ptInPoly` 對「全部共線」的多邊形回 true，於是核心塌成一條線的 oval pad
  把每個點都當成在裡面，兩顆離 2.6mm 的 pad 被算成重疊 1.2mm。
- 障礙物不是只有銅：NPTH 機構孔沒有銅箔，但鑽頭會把上面的走線與 via 一起吃掉。
  繞線器看 `cu === false` 就跳過的話，自動繞線會穿過 M3 安裝孔，畫面上完全正常。
- **布林運算要顧繞向**。Clipper 的 nonzero 規則會讓繞向相反的重疊多邊形互相抵銷：
  走線的膠囊是「矩形＋兩端圓」，繞向不一致時兩端的圓把矩形挖掉，避讓少了 0.785mm²。
  但**不可以連 subject 一起正規化**——它的內孔本來就要反向，統一之後洞會被填回去。
- **同一個物件可能同時扮演兩個角色**。推擠時一條線可能既是「擋路的」又是「別人的續線」，
  兩邊都套用等於位移兩次，自己飛出去、接點還對不上。
- A* 的收尾段沒有被搜尋過：把最後一段硬拉到精確端點，那一段沒有經過任何淨空檢查。
- 「在容差內算同一點」要按**實際距離分群**，不要用 `Math.round(x/tol)` 分桶。
- 任何「先破壞再嘗試」的最佳化都要有**回滾守衛**，保證結果只可能變好；
  而且要用會走進破壞路徑的測資測它（第一版 rip-up 讓成功率從 95% 掉到 10%）。
- 效能最佳化：先量瓶頸（第一刀砍錯地方，789→714ms 幾乎沒動），
  加速改動一律要能證明「輸出逐行不變」。

### 資料與介面
- 新增資料時先 grep 既有欄位名，不要另立一套（via 鑽徑欄位叫 `id` 不是 `drill`）。
- **自動產生的名字要由內容決定，不要用流水號**。網名原本是 `N$1`、`N$2`…，
  線路圖加一顆元件就整批位移，板上既有走線的 net 全部變成不存在的網路。
- 內建預設值要拿真實製造規則驗一次（via 預設曾是 0.6/0.3，環寬低於 JLCPCB 下限）。
- 沒有唯一正解的地方可以給預設，但要標成「假設」並與「真的對不出來」分開報。
- 資料欄位加了就要有對應斷言，否則它只是看起來很完整。
- 盤功能缺口要 grep **編輯器程式碼**，不要 grep 整個 repo。

### 對外
- 要寫進文案的每一句功能描述，先在瀏覽器跑一次；跑不出來就不要寫。
- 內建範例／公版要納入自動檢查，那是新訪客看到的第一個東西。
- `.gitignore` 擋 git，`.assetsignore` 擋網站，兩個是分開的閘。wrangler 從**工作目錄**上傳，
  gitignore 的資料夾照樣會被放上公開站（1.9GB 原廠 PDF 差點上線）。
  用 `npx wrangler deploy --dry-run` 驗。
- **前端先上、後端沒跟上＝安靜給錯東西**。ODB++ 按鈕上線但 Edge Function 沒重部署時，
  使用者拿到的是 Gerber 卻叫 `-odbpp.zip`，不會有任何錯誤訊息。
