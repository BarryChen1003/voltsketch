# NEW SESSION — 接手指南（2026-08-31）

`Documents/Web`，repo `voltsketch`，線上 <https://hardware-ai.org>（Cloudflare Workers）。

> **站已經上線，而且在收真錢。** 動到 `supabase/functions/`、`_headers`、`vendor/` 都可能
> 讓真實客戶付不了款或整頁停擺——動之前先讀 §4。

> **靜態站 push 到 main 就自動上線**（Cloudflare 接了 GitHub）。
> **Edge Function 不會**，那個要手動部署，而且是唯一會「安靜給錯東西」的路。見 §0 規矩 7。

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
7. **做完就 commit + push；靜態站會自動上線，Edge Function 不會。**
   - **靜態站：push 到 main 即自動部署**（2026-08-28 實測：拆閘門的 commit push 完，
     線上馬上就沒有閘門、當天新建的 `pcb-nets.js` 也已 200，而當時 `wrangler deploy`
     還沒成功跑過一次；之後手動跑回的是 `No updated asset files to upload`）。
     手動 `npx wrangler deploy` 仍可用，是備援與緊急回滾，不是每次都要跑。
     **`ci.yml` 沒有 deploy step**，自動部署在 Cloudflare 那一端，從 repo 看不出來。
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
    檢查器都要先 `.replace(/\r\n/g, '\n')`；**用腳本改檔也一樣**，先偵測既有換行再組字串。
    這條也適用於手打的 `curl` 比對——不正規化會把每個檔都報成「不同」。
12. **外部腳本一律自行代管**。線上 CSP 是 `script-src 'self' https://static.cloudflareinsights.com`，
    從 CDN 載腳本上線必被擋，而本機 dev server 不套 `_headers` 所以看不出來。
    `csp-hash.js --check` 與 `vendor-check.js` 有守門。
13. **測資要能分辨實作**。每寫一條斷言就問：**錯的實作會讓這條紅嗎**？
    答不出來就是還沒測到。做法：改壞那一行、確認測試真的紅、再改回來。
14. **先量再改**。動效能或成功率之前先量瓶頸在哪，否則會對著錯的假設寫一整個功能。
15. **驗收要走使用者的路徑**。node 沒有 localStorage、工具有自己的 state、
    只跑一半的 DRC 都會給你綠燈。要驗就：重新載入 → 套用所有規則來源 → 再看。
16. **功能藏起來等於沒有做**。這一輪最貴的兩個 bug 都不是演算法錯：「📤 匯出」對著
    **隱藏的浮動面板**做 `scrollIntoView`（畫面毫無反應，合理結論是「沒做」）、
    ODB++ 匯出藏在標題叫「KiCad 匯入 / 匯出」的面板裡（沒人會去那裡找）。
    **把東西搬進浮動面板時，所有跳轉到它的程式都要跟著改**；面板名稱用使用者找東西的詞。
17. **給使用者的指令一律 PowerShell 語法，而且要在 PowerShell 裡實跑過**。
    不要假設是 pwsh 7——他的視窗可能是 5.1，兩個致命預設：無 charset 的回應用 ISO-8859-1 解、
    無 BOM 的檔案用系統 ANSI(cp950) 解。比對檔案一律讀原始位元組再明確 UTF-8 解。
    含中文的 `.ps1` 存成 **UTF-8 with BOM**；收多個位置參數要加 `ValueFromRemainingArguments`。

---

## 1. 開場三分鐘

```bash
node pcb-logic.test.js && node gerber-check.js && node gerber-readback.js
```

三支綠代表 PCB 地基沒壞。全套見 §6（`node ci-parity-check.js` 確認 §6 與 CI 一致）。

**確認線上是不是最新版**（現在是自動部署，但仍要能查）：

```powershell
powershell -ExecutionPolicy Bypass -File tools\live-check.ps1
```

（只查幾個檔就接檔名：`... -File tools\live-check.ps1 pcb.js app.js`。
全部一致回 exit 0，有不一致回不一致的個數。）

指令給的是 PowerShell 版本，因為使用者的殼是 PowerShell——bash 的 `for f in ...; do`
在那邊直接 parse error。腳本裡有三個防呆，三個都是踩過的坑：

- **一律讀原始位元組、明確用 UTF-8 解碼**，不用 `Get-Content -Raw` 也不用
  `Invoke-WebRequest` 的 `.Content`。站台回 `Content-Type: text/javascript`（無 charset），
  Windows PowerShell 5.1 會把回應當 ISO-8859-1 解、把無 BOM 的本機檔當 cp950 解，
  兩邊各爛一種 → **每個檔都報「不同」**，看起來就像整批沒部署。
  （實測 `i18n.js`：409463 bytes；UTF-8 解 271517 字元、Latin-1 解 409463、cp950 解 303492。）
- **`` -replace "`r`n","`n" ``**：本機工作區可能是 CRLF、線上一定是 LF，不正規化一樣全報「不同」。
- **抓不到要說抓不到**。下載失敗時內容是空的，逐字元比對只會顯示「不一樣」，
  會被誤讀成沒部署。腳本改成印出例外訊息並計入失敗數。

順帶一提：`tools/live-check.ps1` 存成 **UTF-8 with BOM**。沒有 BOM 的話 5.1 會用
cp950 讀腳本本身，中文註解變亂碼、直接 parse error——這條對所有含中文的 `.ps1` 都成立。

---

## 2. 模組地圖

`pcb.js`（4396 行）與 `app.js`（3507 行）是兩個編輯器主體，其餘都是可獨立測試的模組。
**新功能優先寫成模組**：純函式、不碰 DOM、node 測得到；UI 綁定另外放。

### PCB 編輯器

| 檔 | 全域 | 做什麼 |
|---|---|---|
| `pcb.js` | `pcbApp` | 編輯器主體：擺件、走線、渲染、DRC 呼叫、匯出入口 |
| `pcb-rules.js` | `NetRules` `Ratsnest` `AutoRoute` `RouteAll` | net 規則、飛線、繞線原語（含差分對與逃逸繞線）、多條策略 |
| `pcb-nets.js` | `NetModel` | **net 一級物件**：屬性表（阻抗目標／成對關係）、唯一一份 net 參照列舉與 IPC-2141 公式 |
| `pcb-fpinst.js` | `FpInst` | **元件實例 ／ 封裝庫分離**：fpRef ＋ 幾何雜湊，判斷同不同步、安全同步 |
| `pcb-drag.js` | `TraceDrag` | 拖整段走線（pad 那端補線不斷線）＋ 對齊輔助線 |
| `pcb-interact.js` | `PcbInteract` | 互動資料層：走線描邊路徑（**弧要當弧**）、弧長、右鍵選單項目、快捷鍵表 |
| `pcb-drc.js` | `PadDrc` | pad 級 DRC。**每筆違規帶 `x`/`y`**（pcb.js `drawDrcMarks` 拿去在畫面上標紅；沒有座標的檢查只會進清單） |
| `pcb-theme.js` | `PcbTheme` | 2D 配色主題（cam 螢光／EasyEDA／原綠底）＋**對比度與色相距離計算**（用來擋看不見的層色） |
| `pcb-3d-shapes.js` | `Pcb3DShapes` | 用 pad 佈局反推元件外型（QFP 四邊引腳／排針一根根／電解電容圓柱）；判不出來會標 `guessed` |
| `snp.js` / `snp-ui.js` | `Snp` / `SnpUI` | Touchstone S 參數匯入。**2 埠檔的行順序是 S11 S21 S12 S22**（照直覺讀會把插入損耗與反射損耗對調）；UI 只讀不改板子 |
| `_shared/netspec.mjs` | — | 受控阻抗規格表（Gerber 包的 `-NetSpec.txt`）。**改到這裡要手動部署 `pcb-export`** |
| `pcb-mesh.js` / `pcb-mesh-ui.js` | `PcbMesh` / `PcbMeshUI` | 3D **顯示**用的網格模型（.wrl/.obj）。**KiCad .wrl 的 1 單位 = 2.54mm**；綁定鑰匙沿用 `StepModel.keyOf`（封裝身分），跟 STEP 匯出同一把 |
| `pcb-shove.js` | `Shove` | 推擠：側推平行鄰居；`planChain` 支援連鎖（只平移、不重繞） |
| `pcb-drc.js` | `PadDrc` | pad 級 DRC（線距／環寬／孔距／sliver／courtyard…）＋幾何工具 `_geom` |
| `pcb-constraints.js` | `ConstraintMgr` | net class、間距矩陣、銳角 |
| `pcb-stackup.js` | `Stackup` `Padstack` `Backdrill` | 疊層、via 預設、背鑽 |
| `pcb-fabs.js` | `FabProfiles` | 四廠能力檔與 DFM 檢查（規矩見 §5） |
| `pcb-mfg.js` | `Mfg` `MfgUI` | 淚滴、縫合孔、鑽孔表、拼板、轉角導角（`Mitre`） |
| `pcb-pour.js` / `pcb-pour-geom.js` | `PcbPour` / `PourGeom` | 鋪銅：柵格洪水填充 ／ 多邊形布林（Clipper，匯出預設） |
| `pcb-sch2pcb.js` | `Sch2Pcb` | 線路圖 → PCB（真封裝）、ECO 增量合併、封裝／refdes／net／**pin swap** 回寫 |
| `pcb-index.js` | `PcbIndex` | 共用空間索引；DRC、繞線、鋪銅三邊都在用 |
| `pcb-arc.js` | `PcbArc` | 圓弧幾何：點到弧精確解、有界誤差細分 |
| `pcb-step.js` / `pcb-step-model.js` | `PcbStep` / `StepModel` | STEP (AP214) 匯出 ／ **匯入自己的 STEP 綁到封裝** |
| `pcb-dxf.js` `pcb-silkimg.js` `pcb-3d.js` `pcb-crossprobe.js` | | 板框 DXF、圖片轉絲印、3D 檢視、線路圖↔PCB 選取連動 |
| `pcb-autoplace.js` | `AutoPlace` | 自動擺件粗排（無亂數、可重現） |
| `pcb-refboards.js` | `PCB_REFBOARDS` | 8 片參考公版（**產生出來的**，見 §4） |
| `pcb-panels.js` | — | 浮動面板：自動收集 `.panel-section[data-panel]`，加一段 HTML 就會出現 |

### 線路圖編輯器

| 檔 | 全域 | 做什麼 |
|---|---|---|
| `app.js` | `app` | 編輯器主體 |
| `circuit-engine.js` | `CircuitEngine` | 節點計算（union-find）、腳位定義、**匯流排正規化**（`normalizeBuses`） |
| `sch-bus.js` | `SchBus` | **匯流排**：寫法解析、分支幾何、稽核，以及帶到 PCB 端的 `groups()`／`report()`（skew **只算已繞的成員**） |
| `sch-hier.js` | `SchHier` | **階層式圖紙**：port／圖紙符號、遞迴偵測、攤平成「元件清單＋netOf」 |
| `sch-swap.js` | `SchSwap` | **pin/gate swap**：哪些腳可互換（保守表）、排列合成、稽核 |
| `schematic-check.js` | `SchematicCheck` | net 感知檢查（短路／浮接／I2C 上拉／匯流排／階層／換腳） |
| `spice.js` | `Spice` | MNA 求解器：DC／瞬態／AC（一階元件模型） |
| `spice-measure.js` | `SpiceMeasure` | **探針、游標、自動量測**（上升時間／頻率／−3dB…）；量不出來回 null |
| `spice-sweep.js` | `SpiceSweep` | **參數掃描與蒙地卡羅**（種子亂數＝可重現；不改原始網表） |
| `sch-spice.js` | `SchSpice` | 線路圖 → SPICE 網表（認不得的元件拒絕分析） |
| `annotate.js` | `Annotate` | refdes 自動編號 |
| `sheets.js` | — | 多頁（`vs-sheets-v1`，無對外 API，要讀就直接讀那個 key） |

### 存檔、封裝庫、後端

| 檔 | 全域 | 做什麼 |
|---|---|---|
| `designs.js` / `designs-ui.js` | `Designs` / `DesignsUI` | 雲端多專案（sch ＋ pcb 同一列），清單刻意不撈 data |
| `design-history.js` / `design-history-ui.js` | `DesignHistory` | **變更歷史**：檢查點、淘汰規則、版本樹 |
| `fp-lib.js` / `footprint-editor.js` | `FpLib` / `FootprintEditor` | 自製封裝庫（未登入落 localStorage、登入落雲端） |
| `gerber-import.js` `alien-import.js` | | Gerber/Excellon、Eagle/LTspice 匯入（有損，見 §8） |
| `supabase/functions/_shared/gerber.mjs` | — | 後端 Gerber／Excellon／CPL／IPC-356／鑽孔表 |
| `supabase/functions/_shared/odbpp.mjs` | — | 後端 ODB++（含鋪銅內孔） |
| `supabase/functions/_shared/ipc2581.mjs` | — | 後端 IPC-2581（真圓弧＋鋪銅 Cutout） |
| `supabase/functions/_shared/assembly.mjs` | — | 後端組裝圖（頂／底 SVG ＋ 放置清單，底面鏡射） |

### `pcb.js` 裡找得到的東西

| 功能 | 大概位置 |
|---|---|
| `runDrc()` | 檔案前段；所有 audit 在這裡匯流 |
| `exportFab(format)` | Gerber／ODB++／IPC-2581／組裝圖共用，**表驅動** |
| `finishTraceSegment()` / `continueTraceChain()` | 走線收筆與連續繪製 |
| `swapSelPins()` | pin swap ＋ 回寫線路圖 |
| `renderNetPanel()` → `renderNetProps()` / `renderFpSync()` | net 屬性與封裝同步面板 |

---

## 3. 測試地圖

**49 支測試檔（`*.test.js`）＋ 檢查器，§6 共 72 支指令，合計約 3900 條斷言。**
全部對**解析解**或 **round-trip** 比對，不對「上次跑出來的數字」比對。改哪裡就先看對應那一支。

### PCB 地基（最大的幾支）

| 測試 | 斷言 | 守什麼 |
|---|---|---|
| `gerber-check.js` | 473 | 匯出**結構**：表頭、層數、鑽孔對齊 pad、CPL／IPC 行數 |
| `pcb-logic.test.js` | 396 | 編輯器邏輯、DRC、繞線策略、差分對、橡皮筋、公版缺陷預算 |
| `odb-check.js` | 387 | ODB++ 結構 + **readback**：features 讀回來逐筆比對 |
| `gerber-readback.js` | 195 | Gerber **幾何**：解析回來跟原始板逐條比對 |
| `pcb-mfg.test.js` | 137 | 淚滴／縫合孔／鑽孔表／拼板／轉角導角的幾何合法性 |
| `sch2pcb.test.js` | 101 | 線路圖轉 PCB：封裝是不是真的、ECO 合併、封裝回寫 |

**`gerber-check` 綠不代表匯出對**：把所有走線孔徑改成固定 0.25 它照樣全綠，
`gerber-readback` 才抓得到。結構與幾何是兩件事。

### 資料模型與互動

| 測試 | 斷言 | 守什麼 |
|---|---|---|
| `netmodel.test.js` | 118 | net 一級物件：六種圖元的改名列舉、IPC-2141 閉式解、解算器 round-trip、差分對量測 |
| `fpinst.test.js` | 87 | 元件實例／封裝庫分離：**手改過的幾何不可被一鍵更新蓋掉**、同步不可弄丟 net |
| `shove.test.js` | 77 | 推擠：不該推的時候不可推；連鎖與其三個守衛；**繞路的端點守恆、首尾相接、橫穿要拒絕** |
| `pcb-drag.test.js` | 40 | 拖整段走線：**pad 那一端不可以被拖走**、對齊輔助線 |
| `pcb-index.test.js` | 60 | 空間索引：300 物件 × 60 查詢與全比對逐一對照 |
| `pcb-interact.test.js` | 32 | 互動資料層：**圓弧走線的高亮要當弧描邊**、右鍵選單項目、快捷鍵表四語齊全 |
| `pcb-theme.test.js` | 112 | 配色主題：**每層對背景的對比度 >= 4.5**、前四層色相距 >= 55°、換主題不留舊層色 |
| `pcb-3d-shapes.test.js` | 30 | 元件外型：封裝分類、**每根腳都要壓在 pad 上**、畸形輸入不可產生 NaN／負尺寸 |
| `snp.test.js` | 47 | Touchstone：**2 埠 S21/S12 換位**、MA/DB/RI 三種格式、四種頻率單位、續行、壞檔要報錯不可回一半 |
| `pcb-mesh.test.js` | 36 | 網格模型：**KiCad 2.54 換算**、VRML 多邊形扇形三角化、多 Shape 索引平移、索引越界要當場報錯 |
| `netspec.test.js` | 39 | 受控阻抗規格表：**沒有要求就不產檔**（空表會讓板廠以為沒有要求）、沒繞的要寫 NOT ROUTED、線寬量的是真走線、**三包檔（Gerber／ODB++／IPC-2581）要說同一個數字** |
| `assembly.test.js` | 25 | 組裝圖：**方向斜角要跟第 1 腳同一個角**（固定左上會跟圓點指相反）、pad 要畫、外框來源要誠實、底面鏡射 |

### 線路圖

| 測試 | 斷言 | 守什麼 |
|---|---|---|
| `sch-bus.test.js` | 67 | 匯流排：**幹線不可以把整束訊號短在一起**、寫法解析、分支幾何 |
| `sch-swap.test.js` | 66 | pin swap：**有極性的腳不可以換**、排列是合成不是覆寫、換完活得過 ECO |
| `sch-hier.test.js` | 96 | 階層式圖紙：**多實例必須彼此隔離**、遞迴當場擋下、頂層判定、**實例路徑走得到對的分頁** |
| `crossprobe.test.js` | 62 | 線路圖 ↔ PCB 選取連動：回音防護、亂訊息一律丟掉、**階層路徑兩側對得上** |
| `net-label.test.js` | 38 | net 命名：同名相連、空白不亂併 |
| `annotate.test.js` / `backannotate.test.js` | 29 / 27 | refdes 編號與回寫（含「沒回寫就會被同步蓋掉」的反例） |

### 模擬

| 測試 | 斷言 | 守什麼 |
|---|---|---|
| `spice.test.js` | 62 | MNA：分壓、RC/RL 時間常數、−3dB、LC 諧振全對閉式解 |
| `spice-sweep.test.js` | 61 | 掃描／蒙地卡羅：**同種子同結果**、樣本不超出公差、原始網表不被改到 |
| `spice-measure.test.js` | 58 | 波形量測：正弦 RMS、斜坡 10–90%、RC 的 −3dB 全對解析解；**範圍外不外插** |
| `sch-spice.test.js` | 37 | 線路圖轉網表：接地認定、單位換算、拒絕分析的時機 |

### 匯出與匯入

| 測試 | 斷言 | 守什麼 |
|---|---|---|
| `ipc2581.test.js` | 73 | IPC-2581 ＋ 組裝圖；第一條就是 **well-formed XML**（阻抗註記帶 `&` 與引號也要跳脫得掉） |
| `step.test.js` | 62 | STEP：參照完整性、**流形性**、尤拉示性數 |
| `pcb-step-model.test.js` | 47 | 匯入 STEP：**方向不可被平移**、編號平移後參照不可斷 |
| `gerber-import.test.js` | 76 | Gerber/Excellon 匯入：拿自家產生器的輸出 round-trip |
| `alien-import.test.js` | 63 | Eagle／LTspice：認不得的元件**不可以**被硬塞成別的 |
| `dxf.test.js` / `gerber-mfg.test.js` | 63 / 61 | 板框封閉性與來回一趟 ／ 製造功能真的進匯出檔 |

### 存檔與封裝

| 測試 | 斷言 | 守什麼 |
|---|---|---|
| `designs.test.js` | 61 | 雲端專案：清單**不可以**撈 data、存一半不可以清掉另一半 |
| `design-history.test.js` | 45 | 變更歷史：**不刪取過名的版本**、清單不撈 data、每次查詢帶 user_id |
| `footprint-editor.test.js` | 73 | 自製封裝：對 SOIC-8／TSSOP-20／QFP-32／0603 的規格書數字 |
| `fp-lib.test.js` | 42 | 封裝庫：登入後本機那份不可以不見 |

---

## 4. 動這幾個檔之前先讀

### `_headers`（CSP）
- 改任何 inline `<script>` 之後**一定要跑 `node csp-hash.js`**，否則那段上線被自己的 CSP 擋掉。
- **不准加 inline 事件處理器**（`onclick=`），`csp-hash.js` 直接 FAIL。
- **`frame-src` 少 `'self'` → 板面檢視整頁變一塊灰色破圖**（2026-08-31 修）。
  pcb.html 內嵌自家 `pcb-viewer.html`，CSP 原本只寫 `frame-src https://www.falstad.com`，
  同源 iframe 一樣被擋。**本機 dev server 不套 `_headers`，所以本機永遠測不出來**——
  這類問題只有量線上才會發現。
- 三個 directive 改了會**靜靜壞掉**：`form-action` 少綠界網域 → 付款沒反應；
  `frame-src` 少 `falstad.com` → 模擬器不動；`connect-src` 少 Supabase → 全站 API 死掉。

### `supabase/functions/`（金流與匯出）
改完**必須重新部署**：
```bash
npx --yes supabase functions deploy <名稱> --project-ref dmkxjawjrmltmrmkebbs --use-api
```
- `ecpay-webhook` 要加 `--no-verify-jwt`；**`pcb-export` 與 `create-order` 絕對不要加**。
- `--use-api` 是必要的（本機沒跑 Docker）。
- webhook：**任何 DB 失敗都不准回 `1|OK`**。
- `pcb-export` 同時吃 `gerber` / `odb` / `ipc2581` / `assembly`；**前端有按鈕但後端沒重部署的話，
  使用者會拿到一包 Gerber 卻叫 `-odbpp.zip`**——安靜給錯東西，比報錯嚴重。

### `vendor/`
- 內容與 `vendor/README.md` 的 SHA-256 必須相符，`vendor-check.js` 在 CI 顧著。
- 目前 7 個檔：supabase-js、pdf.js（主檔＋worker）、qrcodejs、three r128＋OrbitControls、clipper 6.4.2。
- 新增前先掃**外部網址與網路 API**（`fetch`／`XMLHttpRequest`／`WebSocket`／`sendBeacon`）。
- `.gitattributes` 把 `vendor/**` 標成 `-text`。**`pdf-3.11.174.worker.min.js` 的檔名不能改**。

### `pcb-refboards.js` 是「產生出來的」，不要手改座標
```bash
git checkout pcb-refboards.js                 # 一定要先還原，工具不可吃自己的輸出
node tools/refboard-rebuild.js --dry          # 只看數字不寫檔
node tools/refboard-rebuild.js rp2040-pico30  # 只重建一片
```
其他欄位（名稱、電路說明、github 連結、`level`）工具不動，可以放心手改。

### 鑽孔表有兩份實作
`pcb-mfg.js`（面板顯示）與 `gerber.mjs`（實際送廠）各一份。**改一邊就要改另一邊**，
`gerber-mfg.test.js` 拿兩邊逐列比對，分岔就紅。

### 需要使用者跑 SQL 的檔
`supabase/sql/` 底下：`designs.sql`、`footprints.sql`、`design-versions.sql`
（`design-versions.sql` **2026-08-30 已由使用者執行**，驗證查詢回 `tbl=1 / policies=4 / trg=1`）。
照規矩 8：把整段 SQL 貼進對話，不要只給路徑。

---

## 5. 板廠檔的誠實條款

`pcb-fabs.js` 是「中立多廠 DFM」的地基，規矩比別處嚴：

- **每個數字都要有官方出處與擷取日期**。查不到就填 `null` 走 `skipped`，
  **絕不借用別家的值**。有 mutation 測試守著。
- `isStale()` 超過 12 個月會在面板標出擷取日期，提醒回官方頁對照。
- 排序不可獎勵資訊不透明：以「錯誤數」排序時，公開規格最少的廠會被捧成第一名。

---

## 6. 檢查（與 `ci.yml` 一一對應）

2026-08-28 起由 `ci-parity-check.js` 守住：§6 列的每一支都必須在 `.github/workflows/ci.yml` 裡。
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
node pcb-drag.test.js
node pcb-interact.test.js
node pcb-theme.test.js
node pcb-3d-shapes.test.js
node snp.test.js
node pcb-mesh.test.js
node netspec.test.js
node assembly.test.js
node spice-measure.test.js
node spice-sweep.test.js
node design-history.test.js
node pcb-step-model.test.js
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

瀏覽器驗證的三個坑：
- **pane 沒顯示時 canvas 會是 0 寬**（先 `resize_window` 再測）。
- **瀏覽器會快取 HTML**（網址加 `?cb=<隨便>` 強制重抓，否則你改的 `?v=` 根本沒生效）。
- **不要跨重畫重用 DOM 參照**。面板一律 `innerHTML = …` 重建，舊參照會變孤兒節點，
  對它送事件看起來像功能壞了。每次互動都重新 `getElementById`。

---

## 7. 使用者要你怎麼做事

- **給明確清單 → 期待自主跑完 → 隨做隨落檔 → 證據型回報**（exit code、file:line，不要「應該可以了」）。
- **不要順手重構沒叫你動的東西。**
- 需要他決定的事（新增外部相依、要不要重做既有資料、動到金流權限）**先問**。
- **他要一次部署完**：功能全部做完再給部署清單，不要每做一小塊就叫他部署一次。
- **指令用 PowerShell 語法、一段一個指令、自帶目錄**。`rm -rf` 那種 bash 寫法他會當場吃到錯誤。

---

## 8. 已知缺陷

**這一段最重要。** 這個 repo 反覆出現同一種失敗：功能有 UI、按下去有反應、結果錯或沒用。

### 🔴 目前風險最高

| 功能 | 實際狀況 |
|---|---|
| **六種匯出格式沒有人用真工具開過** | 結構與 round-trip 共 1200+ 條斷言全綠，但那證明的是「我們自己讀得回來」。測試板與逐步清單已備妥：`node tools/make-verify-boards.js` ＋ `VERIFY-EXPORTS.md`。**只有站主做得了。** |

### 🟡 有替代路徑，但要知道界線

| 功能 | 實際狀況 |
|---|---|
| **8 片公版的佈局是重建出來的** | DRC error 0，但繞不完的 net 沒有走線（143/197 繞成）。缺陷預算鎖在 `pcb-logic.test.js` 第 21 節（**全 0，只准往下**） |
| **公版的 pad 大多沒有 net** | 公版資料本來就沒有 netlist。openrex 1436 顆 pad 裡 1400+ 沒 net。真正的解是匯入原廠 netlist |
| **ODB++ 缺絲印文字與 ATTR** | 2026-08-31 補上阻焊／鋼網／絲印圖形三組層與 netlist 的 subnet（`SNT TOP`）。**仍缺**：絲印文字（ODB++ 字型是另一套資料結構，半套寫出去 CAM 顯示亂碼）、ATTR 屬性、subnet 只標元件腳沒有分 TRACE/VIA/PLANE。開窗規則刻意跟 Gerber 產生器同一套——兩包給同一家板廠，規則不同會得到互相矛盾的答案 |
| **IPC-2581 是可製造子集** | 疊構只有順序與厚度（沒有材料與介電常數，我們沒那資料）、沒有 DFX 規則集。2026-09-01：**阻抗需求進來了**，掛在 LogicalNet 底下的 `NonstandardAttribute`（Z0／Zdiff／容差／配對／實際走線的層與線寬）。**刻意不自創 `<Spec>`／`<Impedance>` 這種標準元素**——猜錯 schema 會讓整份檔驗不過，比沒帶更糟；這也表示**讀不讀得懂看 CAM 工具**，權威版本仍是 Gerber 包的 `-NetSpec.txt` |
| **組裝圖的外框一半是估的** | 2026-08-31：有真 courtyard（KiCad 匯入才有）就畫真的，**圖上寫出幾顆是真的**；pad 會畫出來（方向的唯一線索）；**方向斜角改成畫在第 1 腳那個角**——以前固定畫左上，pad 1 在右下的元件會拿到兩個指相反方向的提示。**仍缺**：真實輪廓（沒有那個資料）、courtyard 只有矩形沒有多邊形 |
| **Gerber 匯入是有損的** | Gerber 沒有 net、沒有元件。用途是「看別人的板子與量距離」 |
| **Eagle 匯入不還原封裝圖形** | 元件用佔位尺寸放上去、pads 空的 |
| **SPICE 是一階模型** | 二極體 Shockley、BJT Ebers-Moll、MOSFET 平方律。AC 的非線性小訊號模型是簡化的（有警告） |
| **量測精度受取樣間隔限制** | 游標與自動量測都是取樣點之間的線性內插；上升時間之類的數字精度上限就是取樣間隔（結果會附取樣數與間隔） |
| **掃描的指標只有 AC 的 −3dB 轉角** | 那是算得最準也最常被公差影響的一個數字。換指標要改程式，**刻意不做成使用者輸入的表達式**（那會變成沒人驗得了的小語言） |
| **蒙地卡羅不給信心區間** | 刻意的。樣本是同一個模型的重複求解，不是獨立實驗；元件模型本身還是一階的 |
| **繞路只處理平行鄰居** | 2026-08-31：平移失敗（端點焊在 pad 上／要挪太遠）時改**繞路**——把擋路的線改走 45° 梯形繞道，端點原地不動；連鎖失敗也會退到繞路。**同層橫穿仍然無解**（那要換層打 via），會明確失敗而不是生出一條「看起來繞開、其實還壓著」的線 |
| **階層交叉探測**（2026-09-01 補完） | 2026-08-31：**雙擊圖紙符號可進入子圖**，分頁列右側有麵包屑與「⬆ 上一層」；手動點分頁列會清掉路徑（不清的話「上一層」會跳去不相干的頁）。**階層路徑其實一直都有帶進 refdes**（`SchHier.build` 產出 `PWR1/R1`，`Sch2Pcb` 直接用它當 ref）——更早的版本這份文件寫錯了。2026-09-01：cross-probe 改用**全名**（`PWR1/r12`）當共同語言——線路圖送出時附上自己所在的層，PCB 送的本來就是全名；PCB 選到子圖裡的元件，線路圖會**自動跳進那一層**再選。選取面板新增「線路圖層級」與「選同層」（同一張子圖的元件在板上散在各處）。**修掉的**：階層設計以前 sch→PCB 方向根本對不上（`r12` 對不到 `sch-PWR1/r12`），兩邊各自「有反應」但永遠選不到對方。**還缺的**：從 PCB 反查不會高亮母圖上的那個圖紙符號；跨層多選只會跳到成員最多的那一層（一次只顯示一頁） |
| **匯流排在 PCB 端只到「知道成組」** | 2026-08-31：同步 netlist 時把匯流排帶過來（`Sch2Pcb.busGroupsFrom`），PCB 有匯流排面板：整束高亮、每束的 skew（**只算已繞的成員**，把沒繞的算 0 會得到假的大 skew）、一鍵整束等長（走既有的 `meanderNet`，不另寫一套）。**還沒有的**：群組佈線（一次拉一束）、匯流排層級的 DRC 規則 |
| **gate swap 是「換位置」不是「換封裝內的單元」** | 2026-08-31 補了 UI（選兩顆 → 「⇆ 換件」）。這個資料模型沒有「一顆封裝內含四個閘」的概念，所以對調的是**擺放位置**，net 各自跟著走；會回報飛線總長變化（沒變也照講）。同型別／同料號／同封裝三關過不了就擋下並說是哪一關 |
| **net 屬性三包都進了**（2026-09-01） | 2026-08-31：Gerber 打包多一個 `-NetSpec.txt`（阻抗目標／差動目標／容差／配對／實際用到的層與線寬）。**沒有任何 net 設過屬性就不產這個檔**——空表會讓板廠以為這片板沒有阻抗要求。**刻意不在匯出端重算阻抗**：IPC-2141 公式在 `pcb-nets.js` 只有一份，重算會出現「畫面 50Ω、檔案 47Ω」。2026-09-01 **ODB++ 與 IPC-2581 都帶了**：ODB++ 放 `misc/netspec.txt`（與 Gerber 那份同一段文字，同一個產生器）＋ `eda/data` 每條 net 一行 `#IMP` 註解；IPC-2581 用 `NonstandardAttribute`。**ODB++ 刻意不寫成 ATTR**——屬性名沒在 attrlist 宣告，嚴格的 CAM 會整段解析失敗。**還缺的**：ODB++ 的正式 ATTR（要先做 attrlist）、IPC-2581 的標準阻抗元素（要先確認 schema） |
| **封裝同步是單向的** | 庫 → 板可以，板上改好的幾何回寫成庫要手動走「從選取建封裝」 |
| **匯入的 STEP 是攤平的** | 每個實例一份幾何（不是裝配參照），同一顆料放十次檔案就十份。理由見 `pcb-step-model.js` 檔頭 |
| **3D 元件預設是推出來的** | 2026-08-31：阻焊／pad 開窗／絲印貼圖、亮面材質、元件外型用 pad 佈局反推（QFP 有腳、排針一根根、晶振是金屬罐）。綁了 `.wrl`/`.obj` 的封裝會畫**真模型**（`pcb-mesh.js`）。**STEP 仍只走匯出**——B-rep 要 CAD kernel 才畫得出來，為此塞一顆幾 MB 的 WASM 不划算 |
| **阻抗／熱／EMI** | IPC-2141 ±10%；θ 公式是擬合值無出處；EMI 只算迴路面積。建議線寬只在 IPC-2141 標示的有效範圍內給（microstrip 0.1 ≤ w/h ≤ 3、stripline w ≤ 0.35(2h+t)），超出就明說做不到 |
| **datasheet PDF 抽腳位** | 193 顆實測：完全正確 77、部分正確 37、錯得多 34、明講讀不出來 35 |
| **2nd source 比對** | 可用於「講差異」，不可用於「判定能不能換」 |
| **PCB 權限界線** | 2026-08-28 起編輯器**對所有人開放**（閘門整個移除）。付費線在後端：`pcb-export`（板廠檔）與 `pcb-thermal`（逐條載流量）仍檢查 `profiles.pcb_access`。**四種方案都給 pcb_access**（`vip_1m/3m/6m/12m`），12 個月多的是面試題庫 |

### ⬜ 刻意不做／從沒實測

| 功能 | 實際狀況 |
|---|---|
| **Altium 匯入只辨識不解析** | 刻意的。`.PcbDoc` 是二進位 OLE、無公開規格，半套逆向會把元件放在錯的位置，比匯入失敗更糟 |
| **內建 3D 模型庫** | 刻意不做。那是別人的商業資料，跟明確不做的 LCSC 生態同一條線。做的是「匯入你自己的」 |
| **料件庫存與採購整合** | 同上 |
| **變更歷史沒走過真實路徑** | 表已於 2026-08-30 建好（`tbl=1 / policies=4 / trg=1`），但「建檢查點 → 改東西 → 還原 → 歷史長出分支」這條**沒有人從瀏覽器實際走過一次**。node 測的是純函式，測不到 RLS 與登入 |
| **自訂多腳 IC 存元件庫** | 要登入才測得到，**沒人驗過**（封裝庫那條路已驗，這是線路圖端的 IC） |
| **贊助流程** | `plan='sponsor'` 只入帳不發權益那條路從沒實測 |
| **備份還原** | `restore-drill.sh` 用合成 dump 自我驗證過，**沒跑過真的 artifact** |
| **練習模式／教學導覽** | `pcb-practice.js`、`pcb-tutorial.js` 存在但**沒有任何頁面載入**，13KB 死碼 |

**沒有 Allegro SKILL 匯出**，只有 json / kicad / gerber / odb++ / ipc2581 / assembly / step / csv / tcl。

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

## 10. 路線圖

### 2026-08-27 ～ 08-28：七批（15 項）全部完成並上線

分批原則是**先低風險純新增、再動核心資料模型**，每批做完跑全套並更新這份文件。

| 批次 | 項目 | 關鍵決定 |
|---|---|---|
| 1 匯出正確性 | ODB++ 鋪銅內孔、IPC-2581、組裝圖 | 測試直接讀輸出文字驗繞向，不猜實作；組裝圖**底面鏡射**（旋轉方向也反） |
| 2 效能架構 | 繞線與鋪銅共用空間索引 | 大板 **3 倍**，結果逐一相同 |
| 3 資料模型 | net 一級物件、元件實例／封裝庫分離 | **net 識別仍是名字**（換 id 要遷移每張存過的板）；pads 不搬家，另記 fpRef＋雜湊 |
| 4 線路圖 | 匯流排、階層式圖紙、pin swap | 幹線**不是導體**（規則放引擎裡，六個呼叫端才不會漏）；多實例必須隔離；交換要**回寫線路圖**才活得過 ECO |
| 5 互動 | 連續繪製、整段拖曳、對齊輔助線、連鎖推擠 | pad 那端**補一小段**而不是扯下來；連鎖中途不驗、整條算完再驗 |
| 6 模擬 | 探針／游標量測、掃描／蒙地卡羅 | 量不出來回 **null 不回 0**；種子亂數＝可重現；**不給信心區間** |
| 7 其它 | 變更歷史、匯入自己的 STEP | 淘汰**不碰取過名的版本**；方向只旋轉不平移 |

### 2026-08-31：手感、外觀與七項清單

前半場是「編輯器用起來像不像 PCB 工具」，後半場是使用者核定的七項清單。

| 做了什麼 | 關鍵決定 |
|---|---|
| 點哪亮哪、右鍵選單、走線屬性面板、快捷鍵說明、hover 資訊卡 | 選單項目與快捷鍵表是**純資料**（`pcb-interact.js`），畫面另外組——說明與綁定同源才不會「寫了沒綁」 |
| 走線中按 1..9 換層並自動打 via | 第一版只在「待收線段有長度」時落 via，而連續繪製模式下那段長度是 0——**兩層之間會靜靜斷掉** |
| 圓弧走線高亮修正 | 選取與網路高亮都用兩端點畫直線；改走同一份 `pathOf`，測試數 `ctx.arc` 呼叫次數守著 |
| CAM 螢光配色（`pcb-theme.js`） | 對比度檢查寫在前面，當場抓到**現行預設配色有六個層色對比度不足 4.5**（最低 2.91） |
| 3D：阻焊/絲印貼圖、元件外型反推、綁 `.wrl`/`.obj` 真模型 | STEP 是 B-rep，瀏覽器畫不出來（要 CAD kernel）；顯示走已鑲嵌格式，**匯出仍走 STEP** |
| DRC 違規畫面標紅 | 違規帶座標（`pcb-drc.js` 的 `add()` 第 4 參數）；任何編輯都讓標記過期 |
| Touchstone (.sNp) 匯入 | **2 埠檔的行順序是 S11 S21 S12 S22**，照直覺讀會把插入損耗與反射損耗對調 |
| 1 gate swap UI | 這個模型沒有「封裝內單元」，對調的是**擺放位置**；回報飛線總長變化，變長也照講 |
| 2 匯流排帶進 PCB | skew **只算已繞的成員**；整束等長走既有的 `meanderNet`（先把它從 DOM handler 拆出來） |
| 3 net 屬性進匯出檔 | `-NetSpec.txt`；**不在匯出端重算阻抗**（IPC-2141 只有一份，重算會出現「畫面 50Ω、檔案 47Ω」）；沒有要求就不產檔 |
| 4 階層導覽 | 雙擊圖紙符號進子圖、麵包屑、上一層；手動切分頁會清路徑。**階層路徑一直都有進 refdes**，舊文件寫錯了 |
| 5 組裝圖外形 | 斜角改畫在**第 1 腳那個角**（固定左上會跟圓點指相反）；pad 畫出來；圖上寫出幾顆外框是真的 |
| 6 推擠會繞路 | 平移對「兩端焊死」無效——改走 45° 梯形繞道，端點不動；**同層橫穿明確拒絕**（那要換層打 via） |
| 7 ODB++ 補完 | 阻焊／鋼網／絲印圖形＋subnet；開窗規則跟 `gerber.mjs` 同一套；空的那面不產檔 |
| 修：CSP `frame-src` 缺 `'self'` | 板面檢視在線上是一塊灰色破圖，**本機 dev server 不套 `_headers` 所以永遠測不出來** |
| 修：📤 匯出按了沒反應 | 對著隱藏的浮動面板 `scrollIntoView`；四種匯出一直都在，只是叫不出來 |
| 修：面板不能拉大 | 只設 `max-height` 在內容較矮時完全沒反應；把手加到四邊八角 |
| 修：`live-check.ps1` 只驗第一個檔 | `[string[]]` 只綁第一個位置參數，其餘安靜丟掉，卻回報「全部一致」 |
| 新工具 `tools/odb-verify.js` | 解開的 ODB++ 自我檢查（結構與自洽）。**不是「板廠打得開」**，那仍要 CAM |

### 2026-09-01：cross-probe 到階層

| 做了什麼 | 關鍵決定 |
|---|---|
| 兩側改用**全名**（`PWR1/r12`）當共同語言 | 攤平後的 id 本來就自帶實例路徑，PCB 那側一直有答案；缺的是線路圖那側——它一次只看得到一頁、手上只有 `r12`。所以訊息多一個 `path` 欄位，送出時補上自己所在的層。**沒有 path 的舊訊息當根層收下**，不整包丟掉 |
| PCB 選到子圖裡的元件 → 線路圖自動跳進那一層 | 跳不到要出訊息並**留在原頁**：靜靜跳去別頁，使用者會以為選到的是這一層的元件。路徑解析（`SchHier.navResolve`）是純函式，走不到回 `{error, at}` 講出卡在哪一段 |
| 跨層多選跳「成員最多的那一層」 | 板上可以一次選跨三層，線路圖一次只顯示一頁。要有**確定**規則（同票取先出現的），不能每次跳去不同層 |
| 選取面板：線路圖層級 ＋「選同層」 | 同一張子圖的元件在板上通常散在各處，整層選起來才看得出這塊電路擺在哪 |
| 修：階層設計的 sch→PCB 方向從來對不上 | `r12` 永遠對不到 `sch-PWR1/r12`。兩邊各自「有反應」，但**永遠選不到對方**——這種缺陷看畫面看不出來 |
| 修：`sheets.js` 的錯誤訊息一次都沒出現過 | 兩個坑疊在一起：線路圖那支叫 `showToast` 不是 `toast`，而且 `app` 是 script scope 的 const、**不在 `window` 上**。原本的 `window.app && app.toast` 兩關都不過，靜靜什麼都不做 |
| 修：`odb-check.js` 從 08-31 起就是紅的 | 那條斷言寫死「銅層 + drill + 元件層」，而 08-31 補了阻焊／鋼版／絲印之後真實檔案多出 4 層——**檔案是對的，過期的是檢查器**。改成「每一個真的存在的層檔各一列」，並補一條 **ROW 必須 1..N 連續不重複**（ROW 撞號的症狀是「CAM 打得開、但層是錯的」，改壞 `odbpp.mjs` 的起算值實測會紅）。395 passed / 0 failed。**只動檢查器，不用重新部署** |
| 修：`pcb-interact.test.js` 在 CRLF 工作區會紅 | 5.10 用距離型正則（`switchLayerWithVia` 到 `vias.push` 之間 ≤1200 字元）＝其實在測位元組數；CRLF 每行多一個位元組，同一份原始碼就忽然對不上。讀檔先正規化換行（硬規矩 11），`sch-hier.test.js` 的兩條同型正則一併處理 |
| net 屬性進 IPC-2581 | 掛在 `LogicalNet` 底下的 `NonstandardAttribute`（這份檔的 Component 帶 side 也是用同一個機制）。**不自創 `<Spec>`／`<Impedance>`**：schema 猜錯會讓整份檔驗不過，比沒帶更糟。有要求但還沒繞的 net 也要留在檔裡標 `NOT_ROUTED`——那條正是最需要傳出去的 |
| net 屬性進 ODB++ | `misc/netspec.txt`（與 Gerber 的 `-NetSpec.txt` **同一段文字、同一個產生器**）＋ `eda/data` 每條 net 一行 `#IMP` 註解。**不寫成 ATTR**：屬性名沒在 attrlist 宣告，嚴格的 CAM 會整段解析失敗。註解行任何讀檔器都會略過，人與 grep 找得到 |
| 修：ODB++ `misc/info` 的 `LAYERS_COUNT` 對不上 matrix | 寫死「銅層 + 1」，補了阻焊／鋼版／絲印與元件層之後變成 info 說 5 層、matrix 列 11 層。對得起來的 CAM 會判這包壞掉。改成直接數 matrix 的 LAYER 筆數，`odb-check` 與 `netspec.test` 各加一條守著 |

### 接下來

**只有站主做得了**（要裝軟體／要登入／要真檔案）：

1. **用真 CAM／CAD 開一次匯出檔**（§8 唯一的 🔴）。測試板已生在 `verify-out/`，清單見 `VERIFY-EXPORTS.md`；
   ODB++ 可先跑 `node tools/odb-verify.js <解開的資料夾>` 做結構自檢。
2. **在瀏覽器走一次變更歷史**（表已建好，功能沒被真的用過；要登入才測得到 RLS）。
3. 自訂多腳 IC 存元件庫（同樣要登入）、贊助流程、備份還原跑真 artifact。

**可以接著做的**（依價值排序）：

1. **ODB++ 的絲印文字與 ATTR**——目前刻意不做（字型是另一套結構、屬性索引要串過每個 emitter），
   要做就要一次做完，半套比沒有更難查。
2. ~~**cross-probe 到階層**~~ ✅ 2026-09-01 完成（見 §8 與下面 09-01 那批）。
3. **3D 接 STEP 真模型**：要 CAD kernel（OpenCascade WASM 好幾 MB），先評估值不值得。
4. ~~**IPC-2581 / ODB++ 帶 net 屬性**~~ ✅ 2026-09-01 完成（見 §8 與 09-01 那批）。剩下的是「正式 ATTR／標準元素」，兩者都要先確定規格。
5. **練習模式／教學導覽**：`pcb-practice.js`＋`pcb-tutorial.js` 13KB 死碼，沒有任何頁面載入。
   要嘛接上、要嘛刪掉——留著是最糟的一種。**這是取捨題，要站主決定。**

---

## 11. 額度與成本

- Supabase 免費層：Egress 5 GB/月（未登入訪客瀏覽＝Supabase 0 KB）、資料庫 500 MB、
  Edge Function 500,000 次/月、MAU 50,000、閒置暫停 1 週（`keepalive.yml` 每週一四擋著）。
- **變更歷史會吃資料庫**：每專案 20 版 × 幾十 KB。淘汰規則在 `design-history.js`，
  上限也寫在 `design-versions.sql` 的 trigger 裡（那個才算數）。
- **匯入的 STEP 存 localStorage 不進雲端**：檔案是使用者自己的，而且動輒幾 MB。
- Brave Search 額度有限（~1000/月）：**優先 WebFetch**。
- 大檔（>200 行）先 Grep 定位再 Read 該段，不要整檔讀。
- 重建公版是**離線工具**，全 8 片約 35 分鐘。丟背景跑，不要卡著等。

---

## 12. 與業界工具的差距（2026-08-28 盤點）

對照組是 EasyEDA。這一節只列**還缺什麼**，已經有的看 §2、界線看 §8。
生態系（LCSC 料庫與庫存）已明確不做。

| 面向 | 還缺什麼 |
|---|---|
| 線路圖 ↔ Layout | 封裝不在線路圖階段綁定（轉換時挑預設並標「猜的」）；net class 由 PCB 端 pattern 猜，不從線路圖帶 |
| 互動 | 推擠不重繞；沒有「進入子圖」的導覽 |
| 製造 | 🔴 沒人用真 CAM／CAD 開過匯出檔；IPC-2581 疊構沒有材料；組裝圖外形是方框 |
| 模擬 | 元件模型一階；量測精度受取樣間隔限制；掃描指標只有 −3dB |
| 資料 | net 屬性不進匯出檔；封裝同步單向；匯入的 STEP 攤平不裝配 |

### F. 規模與效能（實測）

| 項目 | 實測 | 備註 |
|---|---|---|
| 整張重畫 | 2.5ms（openrex 1436 pad） | 不是瓶頸 |
| 全板 DRC | 210ms（1600 pad 合成板） | — |
| **區域 DRC** | **0.46ms** | 畫線當下就檢查（460×） |
| **布林鋪銅（大板）** | **7.1ms**（原 21.5ms） | 範圍篩選，結果逐一相同 |
| net 屬性稽核 | 0.2ms | 併進 runDrc |
| 封裝同步稽核 | 2.5ms（28 顆元件 1436 pad） | 併進 runDrc |
| undo 快照 | 1.9ms、狀態 219KB | 十倍規模會吃記憶體 |
| 3D 建場 | 130ms | InstancedMesh 合併後 |

---

## 教訓

按「同型的第二次出現就升級成規則」整理過；只留還會再犯的。

### 驗證

- **期望值寫死公式，功能長大就變假警報**。odb-check 的 matrix 層數寫成
  「銅層 + drill + 元件層」，補了阻焊／鋼版／絲印之後每片公版都紅，但輸出其實是對的。
  可數的東西就照實數（每個真的存在的層檔各一列），別把當下的層種類硬編進斷言。
- **距離型正則等於在測位元組數**。`switchLayerWithVia[\s\S]{0,1200}vias.push` 這種寫法，在 CRLF 工作區每行多一個位元組就會突然對不上——原始碼一個字都沒改。
  讀檔比對一律先 `.replace(/
/g, '
')`（硬規矩 11 講的就是這件事）。
- **畫面上的訊息要在瀏覽器實跑才算數**。node 測得到「有呼叫 toast」，測不到「被呼叫的那支存在」。
  `sheets.js` 寫 `window.app && app.toast(...)`，兩個假設都錯——線路圖那支叫 `showToast`，
  而 `app` 根本不在 `window` 上。守衛不過就靜靜跳過：從 2026-08-31 起「找不到分頁」一次都沒顯示過。
- **測資要照真正的呼叫方式擺資料**。推擠的驗證會把新線再複製一份加進副本，
  但呼叫端是「先放進 `state.traces` 再推擠」——那條線跟自己的分身距離 0，
  推擠**每次都判失敗**。26 條測試全綠，因為測資都把 seg 放在清單外。
  「函式自己測得過」跟「呼叫端用起來對」是兩件事。
- **要驗「我傳的參數真的生效」**。`Spice.ac` 的選項是 `start/stop/points/sweep`，
  寫成 `from/to/ppd` **不報錯**，全部退回預設值；node 測試因為預設範圍夠寬而通過。
- **mutation 測到「拿掉還是綠」時，要補的是只觸發其中一個守衛的案例**。
  連鎖推擠的「深度不夠」與「最後驗證」互相掩護，拿掉任一個都還是全綠。
  造不出那個幾何就直接測機制本身（`_computeMoves` 的 protect）。
- **檢查腳本要有「掃到 0 筆就算失敗」的下限守衛**。在 §6 內文寫一行
  `indexOf('## 6. 檢查')` 找章節，結果找到**自己那行指令裡的字串**，
  掃出 0 支測試然後回報「CI 缺：無」。**假通過比沒有檢查更糟**。
- **驗收要用使用者實際會看到的狀態**。同一批公版，三種驗法給三種答案：
  只跑 `PadDrc` → 0 錯；跑完整 `runDrc` 但用工具自己的 state → 0 錯；
  node 跑 `runDrc` → 0 錯，瀏覽器打開卻紅（node 沒有 localStorage，`NetRules` 是空的）。
- 「有渲染」「有產出」「有檔案」都不等於「對」。轉換類功能要斷言輸出**與權威來源逐位元一致**。
- 「DRC 全綠」不等於「板子對」：連通性（鋪銅孤島）這類性質要另外驗。
- **產生器不要吃自己的輸出**。重建工具會寫回 `pcb-refboards.js`；沒先 `git checkout` 就重跑，
  等於拿上一輪的結果當輸入，一代一代漂移（197 條線變成 491 條）。

### 架構

- **classic script 的頂層 `const` 不在 `window` 上**。`app`（app.js）、`pcbApp` 是不同寫法：
  後者有 `window.pcbApp = pcbApp`，前者沒有。同一個 script scope 的檔案用裸名字取得到，
  但 `window.app` 是 `undefined`——拿 `window.x && x.y` 當守衛會變成「永遠不執行」。
- **同一份清單被抄第二次就抽成單一列舉**。net 名字散在六個陣列，改名手抄了四個，
  漏掉 `userZones` 與 `teardrops`——改完名字使用者畫的鋪銅還掛在舊網路上，畫面上看不出來。
- **規則要放在唯一會被經過的那一層**。匯流排幹線「不導電」放在 `computeNets` 裡，
  不是呼叫端的前置步驟：那個函式有六個呼叫端，少一個記得就把整束訊號短在一起。
- **「這個東西不准動」要明確傳下去**。連鎖推擠第二輪起，使用者剛畫的那一段只是
  清單裡的普通線，`t === seg` 那個判斷只在第一輪成立。
- **要能重算的來源，把當初的輸入整組抄一份**。`RefFP.resolve` 吃 part+kind+ref+w/h，
  而 w/h 放上板後已被封裝本體蓋掉；只存 part 就回推，整片板被判成「庫裡找不到」。
- **二元判斷遇到第三個選項一定要改表**。`format === odb ? A : B` 加了第三第四種格式
  就變成「拿到 IPC-2581 卻叫 `-gerber.zip`」。
- **「哪一個是根」要用結構推，不要用順序猜**。階層展開直接取第 0 頁，
  而使用者通常先畫子圖、子圖就排在前面 → 從子圖開始展開，母圖的東西整批不見還不報錯。
- **包裝函式做的準備工作要嘛沿用它、要嘛抄過來並註明為什麼**。直接呼叫 `Spice.ac`
  漏掉「電壓源要帶 `ac:1`」→ 整條線都是 0、圖是平的、−3dB 一律量不到，**完全沒有錯誤訊息**。

### 演算法與幾何

- **退化幾何要單獨想過**：`ptInPoly` 對「全部共線」的多邊形回 true，
  於是核心塌成一條線的 oval pad 把每個點都當成在裡面。
- **障礙物不是只有銅**：NPTH 機構孔沒有銅箔，但鑽頭會把上面的走線與 via 一起吃掉。
- **布林運算要顧繞向**。Clipper 的 nonzero 規則會讓繞向相反的重疊多邊形互相抵銷；
  但**不可以連 subject 一起正規化**——它的內孔本來就要反向。
- **同一個物件可能同時扮演兩個角色**。推擠時一條線可能既是「擋路的」又是「別人的續線」。
- **位置的變換要在兩邊命名一致的那一層做**。pin swap 的排列 key 是線路圖腳名（a/b），
  pad 編號是 1/2；先換編號再查腳，交換就靜靜失效。
- **方向不是位置**。匯入 STEP 時 `CARTESIAN_POINT` 要旋轉＋平移，
  `DIRECTION`／`VECTOR` **只能旋轉**——平移了法向量就毀了，而症狀是「模型畫錯了」。
- **曲線擬合式反解要限在有效範圍內**。IPC-2141 在寬線時 ln 引數 < 1、阻抗算成負的，
  於是「1Ω」也解得出答案。超出範圍回 null，不回邊界值。
- 效能最佳化：**先量瓶頸**（第一刀砍錯地方，789→714ms 幾乎沒動），
  加速改動一律要能證明「輸出逐行不變」；而且要量兩種規模——
  鋪銅加空間索引在小板上反而**慢 2 倍**。

### 資料與介面

- **自動產生的名字要由內容決定，不要用流水號**。網名原本是 `N$1`、`N$2`…，
  線路圖加一顆元件就整批位移，板上既有走線的 net 全部變成不存在的網路。
- 新增資料時先 grep 既有欄位名，不要另立一套（via 鑽徑欄位叫 `id` 不是 `drill`）。
- 內建預設值要拿真實製造規則驗一次（via 預設曾是 0.6/0.3，環寬低於 JLCPCB 下限）。
- 沒有唯一正解的地方可以給預設，但要標成「假設」並與「真的對不出來」分開報。
- **有極性的東西不要進「可互換」表**。分不出來（電容沒有極性欄位）就不要猜。
- **快取要能講出自己過期了**。封裝、圖紙符號的腳位都是快取；
  過期不報就是「你看到的跟實際用的不是同一份」。

### 對外

- 要寫進文案的每一句功能描述，先在瀏覽器跑一次；跑不出來就不要寫。
- **「哪裡沒有做這件事」推不出「沒有人在做這件事」**。文件寫「CI 沒有 deploy step
  所以要手動 wrangler」，但 Cloudflare 那端早就接了 GitHub。
  部署與否要**直接量線上內容**，不要從 repo 這端的設定推論。
- **權限文案要從授權的那一段程式推導**。前端閘門寫「12 個月方案專屬」，
  webhook 其實四種方案都給 `pcb_access`——文案與實作講的是兩件事，沒有人會回報。
- `.gitignore` 擋 git，`.assetsignore` 擋網站，兩個是分開的閘。
- **前端先上、後端沒跟上＝安靜給錯東西**。
- **CSP 的每個 directive 都要含 `'self'` 才用得到自家資源**。`frame-src` 漏了 `'self'`，
  板面檢視在線上是一塊破圖，而本機因為不套 `_headers` 看起來完全正常。
- **`max-height` 不是高度**：拖曳縮放面板時只設 `max-height`，內容比拉出來的高度矮就完全沒反應——
  使用者拉了半天視窗紋風不動。要設實際 `height` 並把 `max-height` 解掉（2026-08-31）。
- **把東西搬進浮動面板之後，所有「跳到那個功能」的程式都要改**。
  `revealExportPanel()` 只做 `scrollIntoView`＋`focus`，而目標被搬進**預設隱藏**的浮動視窗——
  捲到隱藏元素等於什麼都沒發生：使用者按「📤 匯出」畫面毫無反應，合理結論是「這功能沒做」。
  實際上 Gerber／ODB++／IPC-2581／組裝圖四種都在（2026-08-31 修：先切回 Layout 分頁、再開面板）。
- **面板名稱要用使用者找東西的詞**。ODB++ 匯出藏在標題叫「KiCad 匯入 / 匯出」的面板裡，
  沒有人會去那裡找——已改名為「匯出 / 匯入（Gerber・ODB++・IPC-2581・組裝圖・KiCad）」。
- **浮動面板的縮放把手要在四邊八角**。原本只有右下角一個 14px 小三角，使用者找不到，
  面板永遠是預設大小、內容被壓在下面看不到——看起來像「這個功能沒有做」。
- **選單／清單類 UI 一律給 `max-height` + `overflow-y:auto`**。面板選單有十幾項，
  沒有上限就直接超出畫面底部，下面幾項永遠選不到——而開發時視窗夠高，看不出來。
- **清單型的東西要有「兩邊對照」的檢查**（§6 與 `ci.yml`），不要靠記得同時改兩個地方。

### 環境（給使用者跑的指令）

- **給使用者的指令一律 PowerShell 語法，並且在 PowerShell 裡實跑過再貼**。
  bash 的 `for f in ...; do` 在他的殼是 parse error；「我在自己的環境跑過」不算驗證。
- **不要假設是 pwsh 7**。使用者的視窗可能是 Windows PowerShell 5.1，而 5.1 有兩個致命預設：
  無 charset 的回應用 ISO-8859-1 解、無 BOM 的檔案用系統 ANSI(cp950) 解。
  比對線上與本機一律**讀原始位元組再明確用 UTF-8 解**，不要比 `.Content` 與 `Get-Content -Raw`。
- **含中文的 `.ps1` 存成 UTF-8 with BOM**，否則 5.1 讀腳本本身就亂碼、直接 parse error。
- 兩件都驗過才算數：`powershell.exe -NoProfile -File <script>`（5.1）與 pwsh 7 各跑一次。
- **PowerShell 的 `[string[]]` 參數只綁第一個位置參數**，其餘安靜丟掉。
  `live-check.ps1 a.js b.js` 只驗了 a.js 卻回報「全部一致」——比沒有檢查更糟。
  收多個位置參數一律加 `[Parameter(ValueFromRemainingArguments = $true)]`（2026-08-31 修）。
