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

**HTML 一定會報「不同」，那不是沒部署**：Cloudflare 會往線上的 HTML 注入一段
analytics beacon（`static.cloudflareinsights.com/beacon.min.js`，實測 `pcb.html` 多 359 字元）。
`.js` 檔不會被動到，所以判斷有沒有部署**看 js**；HTML 要比對就得先把 beacon 那一段拿掉。

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
| `pcb-constraints.js` | `ConstraintMgr` | net class（**可逐段指定**：`classOfTrace`）、間距矩陣、銳角 |
| `pcb-bus-drc.js` | `BusDrc` | **匯流排層級 DRC**：每束一套規則（主要層一致／via 數一致／skew 上限／束內間距／via 上限／必須全繞完），規則存 `state.busRules` 跟板子走 |
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
| `pcb-logic.test.js` | 660 | 編輯器邏輯、DRC、繞線策略、差分對、橡皮筋、公版缺陷預算 |
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
| `fpinst.test.js` | 104 | 元件實例／封裝庫分離：**手改過的幾何不可被一鍵更新蓋掉**、同步不可弄丟 net |
| `shove.test.js` | 77 | 推擠：不該推的時候不可推；連鎖與其三個守衛；**繞路的端點守恆、首尾相接、橫穿要拒絕** |
| `pcb-drag.test.js` | 40 | 拖整段走線：**pad 那一端不可以被拖走**、對齊輔助線 |
| `pcb-index.test.js` | 60 | 空間索引：300 物件 × 60 查詢與全比對逐一對照 |
| `pcb-interact.test.js` | 32 | 互動資料層：**圓弧走線的高亮要當弧描邊**、右鍵選單項目、快捷鍵表四語齊全 |
| `pcb-theme.test.js` | 112 | 配色主題：**每層對背景的對比度 >= 4.5**、前四層色相距 >= 55°、換主題不留舊層色 |
| `pcb-3d-shapes.test.js` | 30 | 元件外型：封裝分類、**每根腳都要壓在 pad 上**、畸形輸入不可產生 NaN／負尺寸 |
| `snp.test.js` | 47 | Touchstone：**2 埠 S21/S12 換位**、MA/DB/RI 三種格式、四種頻率單位、續行、壞檔要報錯不可回一半 |
| `pcb-mesh.test.js` | 36 | 網格模型：**KiCad 2.54 換算**、VRML 多邊形扇形三角化、多 Shape 索引平移、索引越界要當場報錯 |
| `netspec.test.js` | 47 | 受控阻抗規格表：**沒有要求就不產檔**（空表會讓板廠以為沒有要求）、沒繞的要寫 NOT ROUTED、線寬量的是真走線、**三包檔（Gerber／ODB++／IPC-2581）要說同一個數字** |
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
| `ipc2581.test.js` | 91 | IPC-2581 ＋ 組裝圖；第一條就是 **well-formed XML**（阻抗註記帶 `&` 與引號也要跳脫得掉） |
| `step.test.js` | 87 | STEP：參照完整性、**流形性**、尤拉示性數 |
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
- ⚠️ **金流已經是正式收款**（`ECPAY_MODE=live`，站主 2026-09-01 確認真實小額測試通過）。
  改 `create-order` / `ecpay-webhook` / `_shared/ecpay*` 動到的是**真的錢**：
  先在沙盒驗，切回正式前確認 `ECPAY_MODE` 仍是 `live`——那是唯一擋住「真客戶被送去沙盒付款頁」的保險絲。
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

**兩支工具，用途不同**：
- `tools/refboard-rebuild.js`：丟掉示意走線 → 擺位鬆弛 → 全部重繞。**會動擺位與板框**，
  一定要從 git 上的原始資料跑（否則拿上一輪的結果當輸入，一代一代漂移）。
- `tools/refboard-fill.js`（2026-09-01 新增）：**只補繞**還沒繞的那些 net，不動擺位、不動既有走線。
  先縫 via（同點同 net 不同層的壞接點）→ 補繞 → 再縫一次 → 每片板各自驗收 DRC，沒維持 0 就整片放棄。
- 兩支共用 `tools/refboard-policy.js`（線寬與淨空政策）。各留一份會分岔，
  而分岔的症狀是「補繞出來的線在重建的板上違規」。

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

### 第三方驗證（本機，不在 CI）

上面那些檢查驗的是「我們寫出來的東西符合**我們對格式的理解**」。理解錯了，自己驗自己永遠是綠的
（實測：STEP 62 條斷言全綠，CAD 開起來 0 個物件）。動到匯出相關的東西就手動跑這個：

```powershell
pwsh -File toolserifyerify.ps1
```

三個跟我們無關的判官：kicad-cli 的 DRC、FreeCAD 的 OCCT、gerbonara。裝法與已知例外見
`tools/verify/README.md`。**其中兩個已經在 CI**（`verify-3p` job，2026-09-02 起）：
gerbonara 與 kicad-cli 每次 push 都跑。**只有 STEP 的 OCCT 檢查要靠人記得跑**——
動到 `pcb-step.js` 就跑一次上面那行。

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
| **8 片公版的佈局是重建出來的** | DRC error 0（預算鎖在 `pcb-logic.test.js` 第 21 節，**全 0 只准往下**）。2026-09-02 現況：**未繞 42、零長度 5**（2026-09-01 是 43／6，當日起點是未繞 134、零長度 70+）。零長度飛線＝同一點、同 net、不同層、缺 via 的壞接點：畫面上看不見，使用者只覺得飛線降不下去。根因（繞線器收線收在沒有銅的層）已修；剩下的密腳區靠**逃逸 via**解掉（via 往外挪、兩層各補短線，`AutoRoute.escapeVia`）。2026-09-02 補了 **padstack 梯子**（`FabProfiles.viaLadder`）：縫合時從預設 0.7/0.3 一階一階往小試，下限取板廠能力檔（minDrill／minAnnular／minViaPad），自己編一個「反正更小就好」的數字只是把繞不過換成打樣退件。這樣多縫回 1 顆（rp2040 QSPI_SD0，用 0.5/0.2）。**剩下的 5 條連最小孔都塞不下，是擺位問題，不是繞線問題**。未繞與零長度各有預算（第 21b 節，只准往下）|
| **公版的 pad 大多沒有 net** | 公版資料本來就沒有 netlist。openrex 1436 顆 pad 裡 1400+ 沒 net。真正的解是匯入原廠 netlist |
| **ODB++ 缺絲印文字；ATTR 只做了阻抗相關** | 2026-08-31 補上阻焊／鋼版／絲印圖形三組層與 netlist 的 subnet（`SNT TOP`）。2026-09-01 依官方規格（8.1 Update 4）補上阻抗相關的**系統屬性**：`steps/pcb/impedance.xml`（p.128／schema p.496）帶目標值與容差、線段 feature 用 `.imp_constraint_id` 指回 Descriptor、net 用 `.diff_pair`、整層單一目標時層寫 `.z0impedance`。**仍缺**：絲印文字（ODB++ 字型是另一套資料結構，半套寫出去 CAM 顯示亂碼）、阻抗以外的其它 ATTR、subnet 只標元件腳沒有分 TRACE/VIA/PLANE。開窗規則刻意跟 Gerber 產生器同一套——兩包給同一家板廠，規則不同會得到互相矛盾的答案 |
| **IPC-2581 是可製造子集** | 疊構只有順序與厚度（沒有材料與介電常數，我們沒那資料）、沒有 DFX 規則集。2026-09-01：**阻抗需求進來了**，掛在 LogicalNet 底下的 `NonstandardAttribute`（Z0／Zdiff／容差／配對／實際走線的層與線寬）。**刻意不自創 `<Spec>`／`<Impedance>` 這種標準元素**——猜錯 schema 會讓整份檔驗不過，比沒帶更糟；這也表示**讀不讀得懂看 CAM 工具**，權威版本仍是 Gerber 包的 `-NetSpec.txt` |
| **組裝圖的外框一半是估的** | 2026-08-31：有真 courtyard（KiCad 匯入才有）就畫真的，**圖上寫出幾顆是真的**；pad 會畫出來（方向的唯一線索）；**方向斜角改成畫在第 1 腳那個角**——以前固定畫左上，pad 1 在右下的元件會拿到兩個指相反方向的提示。**仍缺**：真實輪廓（沒有那個資料）、courtyard 只有矩形沒有多邊形 |
| **Gerber 匯入是有損的** | Gerber 沒有 net、沒有元件。用途是「看別人的板子與量距離」 |
| **Eagle 匯入不還原封裝圖形** | 元件用佔位尺寸放上去、pads 空的 |
| **SPICE 是一階模型** | 二極體 Shockley、BJT Ebers-Moll、MOSFET 平方律。AC 的非線性小訊號模型是簡化的（有警告） |
| **量測精度受取樣間隔限制** | 游標與自動量測都是取樣點之間的線性內插；上升時間之類的數字精度上限就是取樣間隔（結果會附取樣數與間隔） |
| **掃描的指標只有 AC 的 −3dB 轉角** | 那是算得最準也最常被公差影響的一個數字。換指標要改程式，**刻意不做成使用者輸入的表達式**（那會變成沒人驗得了的小語言） |
| **蒙地卡羅不給信心區間** | 刻意的。樣本是同一個模型的重複求解，不是獨立實驗；元件模型本身還是一階的 |
| **差分對繞線**（2026-09-01 修） | `AutoRoute.routePair` 繞中心線再左右偏移展開，**展開後原本沒有重新檢查淨空**：空板上沒事，密板上兩條展開線會壓到鄰居（實測 esp32 +8、a20-lime +21、openrex +42 個 DRC error）。現在展開後會把兩條線**各自**放進板子副本跑一次真正的 DRC，error 變多就回 `pair_clearance` 讓呼叫端退回單線繞。另外兩件一起修掉：①違規多半不是沒空間，而是中心線落在格點上整體偏半格 → 往細裡試 grid/2、grid/4、0.05；②**DRC 本來不認識差分對**（一對線的間距本來就小於一般淨空 → 每對都報一排 `drc_tt`），現在宣告或命名推得出來的一對，用它自己的 `pairGap` 判定。配對規則統一走 `NetModel.pairOf`——以前繞線器與 DRC 各有一套，繞出來的對 DRC 不認 |
| **推擠：平移 → 繞路 → 拆掉重繞** | 2026-08-31：平移失敗（端點焊在 pad 上／要挪太遠）時改**繞路**——把擋路的線改走 45° 梯形繞道，端點原地不動。2026-09-02：繞路也失敗時再退一步，**把擋路的那幾條拆掉丟回 A* 重繞**（`Shove.planRipup`）——平移與繞路都只在同一層動手腳，所以**同層橫穿**在它們手上永遠無解，那需要換層打 via，而換層是繞線器的事。重繞的結果要通過**真正的 DRC**（error 不可以變多）才算數，換層產生的 via 會跟著套用（少放就是斷線）。**仍然只重繞擋路的那幾條**，不做整區重繞（那是 autoRoute 的工作）|
| **階層交叉探測**（2026-09-01 補完） | 2026-08-31：**雙擊圖紙符號可進入子圖**，分頁列右側有麵包屑與「⬆ 上一層」；手動點分頁列會清掉路徑（不清的話「上一層」會跳去不相干的頁）。**階層路徑其實一直都有帶進 refdes**（`SchHier.build` 產出 `PWR1/R1`，`Sch2Pcb` 直接用它當 ref）——更早的版本這份文件寫錯了。2026-09-01：cross-probe 改用**全名**（`PWR1/r12`）當共同語言——線路圖送出時附上自己所在的層，PCB 送的本來就是全名；PCB 選到子圖裡的元件，線路圖會**自動跳進那一層**再選。選取面板新增「線路圖層級」與「選同層」（同一張子圖的元件在板上散在各處）。**修掉的**：階層設計以前 sch→PCB 方向根本對不上（`r12` 對不到 `sch-PWR1/r12`），兩邊各自「有反應」但永遠選不到對方。**還缺的**：從 PCB 反查不會高亮母圖上的那個圖紙符號；跨層多選只會跳到成員最多的那一層（一次只顯示一頁） |
| **匯流排在 PCB 端只到「知道成組」** | 2026-08-31：同步 netlist 時把匯流排帶過來（`Sch2Pcb.busGroupsFrom`），PCB 有匯流排面板：整束高亮、每束的 skew（**只算已繞的成員**，把沒繞的算 0 會得到假的大 skew）、一鍵整束等長（走既有的 `meanderNet`，不另寫一套）。2026-09-01 補上**整束佈線**：照 D0..Dn 的順序把這一束的飛線整批交給既有繞線器（`order:'none'`）——照長度排會讓一束線互相穿過去。2026-09-02 補上**真正的束狀繞線**（`AutoRoute.routeBundle`）：中心線只繞一次（走廊寬＝N×線寬＋(N−1)×間距），再把 N 條沿法線展開，所以全程等距、一起轉彎。`routeBus` 先試它，失敗才退回批次繞。四個踩過的坑都寫在函式檔頭：①轉角要**斜接**（各段位移完再補一小段接起來的話，內側兩段會重疊、補段往回走，實測一次 30 個 `drc_tt`）②扇出要 45° 斜線＋進場點錯開（階梯式的水平段會貼著別人的車道跑）③**束要落在 pad 所在的層**（中心線兩端是 pad 重心、不在任何 pad 上，繞線器對它沒有層約束，實測整束跑到 B.Cu 而 pad 全在 F.Cu，未連線 4 → 8）④細格點重試只准兩階並看時間（束的走廊寬，格子細一倍就是四倍格數，實測 60×40 試到 0.0625 要 29 秒＝畫面凍住）。展開後的檢查跟差分對**相反**：整束一起驗，成員互相壓到也算違規（一束的間距預設就是全域淨空）。2026-09-02 補上**匯流排層級 DRC**（`pcb-bus-drc.js`）：每束一套規則，存在 `state.busRules` 跟著板子走。一致性規則（成員**主要層**一致、via 數一致）**預設開**、報 warning——不必填任何數字就抓得到「D3 自己跑到底層」；數值上限（skew 上限、束內間距、via 上限、必須全繞完）**預設關**，填了才檢查。三個刻意的取捨：①看主要層不看「有沒有跨層」（有 via 的線都跨層，那樣整塊板都是警告）②skew 直接呼叫 `SchBus.report`，全站只有一個定義③束內間距只在比全域淨空**嚴**時才報，否則跟 `PadDrc` 報同一件事兩次 |
| **gate swap 是「換位置」不是「換封裝內的單元」** | 2026-08-31 補了 UI（選兩顆 → 「⇆ 換件」）。這個資料模型沒有「一顆封裝內含四個閘」的概念，所以對調的是**擺放位置**，net 各自跟著走；會回報飛線總長變化（沒變也照講）。同型別／同料號／同封裝三關過不了就擋下並說是哪一關 |
| **net 屬性三包都進了**（2026-09-01） | 2026-08-31：Gerber 打包多一個 `-NetSpec.txt`（阻抗目標／差動目標／容差／配對／實際用到的層與線寬）。**沒有任何 net 設過屬性就不產這個檔**——空表會讓板廠以為這片板沒有阻抗要求。**刻意不在匯出端重算阻抗**：IPC-2141 公式在 `pcb-nets.js` 只有一份，重算會出現「畫面 50Ω、檔案 47Ω」。2026-09-01 **ODB++ 與 IPC-2581 都帶了**：ODB++ 走官方位置（`impedance.xml` ＋ `.imp_constraint_id` ＋ `.diff_pair` ＋ `.z0impedance`）外加人看的 `misc/netspec.txt`（與 Gerber 那份同一段文字、同一個產生器）；IPC-2581 用 `NonstandardAttribute`。**還缺的**：IPC-2581 的標準阻抗元素（`<Spec>` 系列，schema 未確認前不自創） |
| **封裝同步：自製封裝雙向，其餘單向** | 庫 → 板一直都有。2026-09-01 補上 **板 → 庫**：選取元件按「↑ 存回這顆封裝」，把手改過的 pad 幾何存回它原本那顆**自製封裝**（`FpInst.pushPlan` 判斷能不能覆蓋）。只送幾何、net 剝掉（庫是所有板子共用的）。**內建庫／IC 產生／公版參考封裝一律不可覆蓋**——那是所有板子的共同基準，那條路仍是「從選取的元件建立」另存一顆。回寫後不必另外標記別的實例：`status()` 每次跟庫重算，其他實例自動變成 stale |
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
| ODB++ 阻抗改走官方 ATTR（取代 `#IMP` 註解） | 先把 ODB++ 8.1 Update 4 規格 PDF 抓下來查，不憑印象寫：阻抗需求的正式位置是 `steps/<step>/impedance.xml`（Descriptor / RequiredImpedance），線段用系統屬性 `.imp_constraint_id` 指回 Descriptor.Id，差分對用 net 的 `.diff_pair`，`.z0impedance` 是**層**的屬性（不是 net）。因此**完全不需要自訂屬性**，也就不用 `misc/userattr`。`.diff_pair` 的值是「這一對的名字」（兩個 net 名排序後接起來）——各寫對方的 net 名的話 CAM 會看到兩個不同值，認不出是一對 |
| 匯流排整束佈線 | 重點不是繞線器，是**排隊順序**：既有的 `RouteAll` 預設照長度排，一束線那樣繞會互相穿過去、拉出來像打結；指定 `order:'none'` 並照匯流排成員順序遞給它，出來才是一疊平行線。測法換過一次——先用「各線 y 座標單調」去驗，但線長一樣時兩種排法結果相同（突變測試沒紅），改成直接驗遞給繞線器的順序與 `order` 選項 |
| 修：繞線器會產生「接不到東西的銅」 | `layersAtEnd` 只看 pad：飛線的一端如果是**另一段走線的端點**（公版就是這樣），它會退回「所有層都行」，於是收線收在別層又不打 via。DRC 不抗議（銅沒互相違規），只多一條**零長度飛線**——看不見。修法是把既有走線端點與 via 也算進可用層。第 39 節測試守著（突變實測會紅）|
| 公版補繞（`tools/refboard-fill.js`） | 先量再改（硬規矩 14）：原以為要改繞線策略，實測 134 條未繞裡 118 條當場就繞得出來——缺的是**資料從來沒補繞過**。新工具只補繞、不動擺位（rebuild 會動擺位、有世代漂移風險）。兩輪 via 縫合（補繞自己也會製造需要 via 的接點）＋跨層同幾何去重（不去重會被 `gerber-readback` 判成「走線漏到別的銅層」）。每片板各自驗收：DRC 沒維持在 0 就整片放棄不寫 |
| 量測工具 `tools/refboard-route-audit.js` | 只讀、不寫檔，報「未繞／單獨可繞／幾何不可繞／真實板況繞得成」。第一版用 0.15mm ＋ 預設淨空量，數字偏樂觀（POWER class 下限是 0.3~0.5mm）；改成跟補繞共用 `refboard-policy.js` 之後，同一批板子從「118 條繞得出來」變成「46 條」——**量測工具跟被量的東西必須用同一份規則**，否則量出來的是另一個世界 |
| 修：放大有極限、而且越放大越糊（站主回報） | 三件事各自獨立：①縮放上限寫死 **3**（30px/mm）——0.4mm 球距只有 12px，那還沒開始放大，改成 40（400px/mm）；②canvas 的 backing store 沒乘 `devicePixelRatio`，在 1.25×／2× 螢幕上等於用一半解析度畫，**放大也不會變清楚**（糊的是畫布不是幾何）；③標註字級寫死上限（pad 號碼 11px、腳名 9px、refdes 9px），放大後幾何變大、字沒變，看起來就是「放大了但沒有更清楚」。另外滾輪縮放改成**以游標為錨**（實測漂移 0.00001mm），並在線夠寬時把 net 名標在走線上（同 net 太近的不重複標）|
| 修：差分對展開後沒重新檢查淨空 | 見 §8 那一列。過程中連帶修掉「DRC 不認識差分對」與「配對規則有兩份」——後者是典型的規則分裂：繞線器照命名推、DRC 只認宣告，於是繞出來的一對 DRC 不承認 |
| 修：pad 的 net 回推用外接圓 | 0.2×0.85mm 的 QFN pad 對角半徑 0.44mm，0.4mm 間距下會把一條線的端點同時貼給相鄰兩顆腳。改成在 pad 自己的座標系做矩形／橢圓內含判定，落在兩顆之間的空隙就誰都不給 |
| 公版重跑一次產生器 | pad net 修好之後，原本被錯 net 遮住的違規會現形（實測 31 個）。用 `refboard-rebuild.js` 重跑：DRC 回到全 0、繞成 509/578、擺位 0 輪（沒有漂移）。未繞 84、零長度 18，兩個預算都重新對齊實測值 |
| 逃逸 via（`AutoRoute.escapeVia`） | 密腳區（BGA／QFN／B2B）本來就沒有空間把 via 放在 pad 正下方——真實 layout 的作法是**往外挪、用短線接出去**，這裡照做：先原地試，放不下就一圈一圈往外找（8 段半徑 × 24 個方向），找到就**兩層各補一段 P→C 的短線**。只補一層的話另一層還是斷的（測試守著）。粗篩只看附近 4mm 內的銅（每個候選都跑全板 DRC 的話一個點要幾十秒），選中的再讓呼叫端跑一次真 DRC 確認。實測：零長度 18 → **6**、未繞 84 → **52**、DRC 維持全 0、`gerber-readback` 全綠。中間踩到一個坑：逃逸線可能剛好跟**別層的同 net 走線幾何重合**，`gerber-readback` 會判成「同一條線出現在兩層」（那條檢查是用來抓 Gerber 寫錯層的，不能為此放寬）。產生端會避開，寫進資料前再驗一次同一條不變式——不變式要守在寫入那一關，不能只靠產生端記得 |
| 盲孔／埋孔終於接得到 | 繞線器早就支援（`opt.blindBuried`），但**沒有任何呼叫端傳過那個值**——只有測試在用，等於藏起來沒做（硬規矩 16）。這輪一起補完三段：①面板加開關，打開時當場提示「板廠多半不接」；②`escapeVia` 只擋**跨到的那幾層**（密腳區的死路有一半是穿孔要求「每一層都空」）；③**DRC 本來把每顆 via 都當穿孔**，一顆 In1–In2 的埋孔會被拿去跟頂層的線比距離，報一個實體上不存在的違規。銅箔的淨空改成看跨層；**鑽孔間距（via↔via）刻意不放寬**——那是鑽頭與壓合次序的事，不是我們判得了的 |
| 先量再改改變了要做的事（第二次） | 原訂「加深 rip-up 提高繞線成功率」。量完（`refboard-route-audit.js`）：未繞 52 裡 **31 條放到空板單獨繞也繞不過**（pad 擠死／板邊／禁佈區＝擺位問題，rip-up 幫不上忙），真正的組成是「零長度 6 ＋ 同層短斷口 8 ＋ 要繞的 38」。所以改做補斷口 |
| 先量再改改變了要做的事（第三次） | 原訂「把公版剩下的 43 條補繞完」。量測工具說 12 條繞得成，實際一條都繞不成——`AutoRoute.route` 在起終點同格時回 `ok:true` 卻沒產生任何銅，量測與補繞兩支都照單全收。修完之後的誠實數字：**繞得成 0 條、擺位問題 38 條、缺 via 的壞接點 5 條**。唯一能自動處理的是 padstack 梯子多縫回的那 1 顆。要再往下就一定得動擺位，而公版是照真板重建的——動了就不再是參考板，那是產品決定，不是工程決定 |
| 補短斷口（`AutoRoute.closeGap`） | 同 net、同層、只差 0.2~0.6mm 沒接上。**A* 補不了**：那兩端本來就貼在鄰居的淨空範圍內（密腳區），起訖格子被判 `rule_ep_blocked` 直接放棄。只補一段直線、不繞路（要繞路就是真的沒接上，該走繞線器），補完要驗「飛線真的消失」。實測未繞 52 → **43** |
| 補繞工具的分組改照「線寬＋淨空」 | 舊版一個寬度一組、整組用組裡**最嚴**的淨空去繞：群組裡只要有一條 POWER（0.3~0.5mm），同組的訊號線就一起被綁死。量測工具是每條 net 用自己的淨空量的——**量測與被量的東西必須用同一份規則**，這次是規則用得比量測嚴 |
| 推擠加上「拆掉重繞」這條退路 | 使用者手動佈線最常撞到的限制就是同層橫穿：推不動、繞不開，只能自己改路。現在推擠失敗時會把擋路的線丟回繞線器重繞（可能換層打 via），瀏覽器實測 DRC 1 → 0。驗收閘門用真 DRC：**重繞不可以讓板子變差**——沒有這道閘門，使用者會看到「已重繞」而板上多了他沒做過的違規 |
| 封裝在線路圖端就綁得住 | 轉換時封裝有三個來源（PCB 端覆寫 → 線路圖元件自帶 → MAP 預設）。第二個以前**只有 PCB 回寫才會出現**，所以第一次轉換必然是猜的（標 assumed）。線路圖的屬性面板現在有封裝選擇器，格式跟 `Sch2Pcb` 認的一樣（`lib:variant`）。實測：指定過的元件轉出來 `assumed:false`，沒指定的照樣標「猜的」 |
| net class 從線路圖帶過去 | PCB 端本來拿 net **名字**比 pattern 猜（GND/VCC→POWER、_P/_N→DIFF）——名字叫 `SYS_RAIL` 的電源永遠猜不到，而「這條是電源」是設計意圖不是命名巧合。現在導線上可以指定 class，`Sch2Pcb.netClassesFrom` 收集、同步時帶進 `state.netClasses`，`ConstraintMgr.classOf` 明講優先。**同一條 net 兩種 class 不猜**：報衝突讓使用者決定（線寬忽大忽小而且看不出原因）。指到不存在的 class 時退回名字猜，不讓那條 net 失去規則 |
| 踩到：不可以寫 inline 的 canvas CSS 尺寸 | `#pcbCanvas` 的 CSS 是 `width/height:100%`。為了配合 dpr 而寫 `style.width = w + 'px'`，等於把尺寸凍在當下那一刻，而容器又跟著畫布走——實測整個畫布卡在 **1px 寬**。CSS 尺寸交給 CSS，程式只負責 backing store |
| 封裝回寫（板 → 庫） | 界線跟另一個方向對稱：**幾何歸庫、net 歸實例**，所以 payload 走既有的 `FootprintEditor.fromComponent`（它已經剝掉 net），不另寫一份。存完要 `cacheFp()` 更新快取並重新蓋章，否則畫面上狀態還是 edited；其他實例不用手動標記——`status()` 跟庫重算，它們自然變成「庫已更新」 |

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

## 12. 與業界工具的差距（2026-09-01 重新盤點）

對照組是 EasyEDA。這一節只列**還缺什麼**，已經有的看 §2、界線看 §8。
生態系（LCSC 料庫與庫存）已明確不做。

| 面向 | 還缺什麼 |
|---|---|
| 線路圖 ↔ Layout | 2026-09-02 補上：封裝可在線路圖端綁定、net class 可在導線上指定並帶到 PCB。2026-09-02 再補上**通用 IC 封裝**：`PartsLib` 從 15 類長到 22 類（多了 SOIC／TSSOP／SSOP／MSOP／QFN／QFP／DIP，共 124 個變體），幾何交給 `FootprintGen.fromIC`（不另刻一套，否則同一個封裝會在兩處長出不一樣的 pad）。意義是**料號不在 `ic-data.js` 裡也綁得了封裝**——以前 IC 的封裝只能由料號決定，庫裡沒有那顆料就整個 `icNotInLibrary`。推估來的尺寸（QFN 的 pitch／body）警告一路帶到轉換報告，不在中間吞掉。2026-09-02 再補上**分段 class**：指定在走線物件上（`trace.netClass`），所以跟著存檔、復原、匯出與拖動走，換 net 名字也不會失效。優先序＝這一段指定的 → 線路圖明講的 → 名字猜的；指到不存在的 class 退回整條 net 的規則（class 被刪掉不該讓那一段變成沒有規則）。**線寬逐段判、線長仍看整條 net**——一段線談不上「太長」，兩邊都逐段判的話長度上限形同虛設。間距矩陣也改成逐段查 class。**還缺**：2026-09-02 開始建**連接器**：JST PH（2.0mm）與 XH（2.5mm）的 THT header 已進庫，孔位逐個對過原廠 datasheet 的 PC board layout（出處與推導寫在 `parts-lib.js` 的註解裡），`meta.src` 標成 `datasheet` 以便跟 IPC 推估的區分開來——放件訊息也會照實講是哪一種。**還缺**：USB-C／micro-USB／RJ45／桶插，以及 THT 分立件（TO-220／TO-92／DO-41／軸向電阻）。這些一律要照原廠 land pattern 或 JEDEC 外形＋IPC-2222 孔徑推導，不能用家族推估——推錯的後果是那顆料裝不上去 |
| 互動 | 推擠會繞路但**不重繞**（同層橫穿仍明確拒絕）；cross-probe 反查不到母圖上的圖紙符號 |
| 製造 | 🔴 沒人用真 CAM／CAD 開過匯出檔（站主無 CAD，等打樣時板廠代驗）；IPC-2581 疊構沒有材料；組裝圖外形只有矩形 courtyard |
| 模擬 | 元件模型一階；量測精度受取樣間隔限制；掃描指標只有 −3dB |
| 匯出檔的第三方驗證 | 2026-09-02 起**本機就驗得完**（`tools/verify/`，見那裡的 README）：kicad-cli 跑 KiCad 自己的 DRC、FreeCAD 的 OCCT 開 STEP、gerbonara 讀 Gerber/Excellon。第一次跑就抓到六個內部檢查完全看不到的真 bug（最大的一個：STEP 沒有產品結構，CAD 開起來是 0 個物件）。**還沒有第三方背書的**：IPC-2581 與 ODB++ 沒有夠成熟的開源讀檔器 |
| 資料 | 匯入的 STEP **仍是攤平**（每個實例一份幾何）——2026-09-02 起會把代價量出來（唯一模型數／放置次數／多寫了幾個實體）並顯示在匯出訊息裡，但真正的裝配結構要有 CAD 才驗得了，跟 #1 卡在同一件事。IPC-2581 的阻抗與**介電厚度／Dk** 走非標準屬性（`<Spec>`、`DIELCORE` 這些標準元素的 schema 抓不到，webstds.ipc.org 擋外部存取，不照猜的寫） |
| 匯流排 | 束狀繞線與層級 DRC 都在（2026-09-02）。**還沒有的**：束狀繞線不會自己換層（整束只走 pad 所在的那一層，要跨層得先手動放 via）；扇出是 45° 直線，不做真實工具那種弧形收束 |

2026-09-01 從這張表移除（已經做掉）：進入子圖的導覽、net 屬性不進匯出檔、封裝同步單向。

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

- **canvas 的「畫布大小」有兩個，混在一起就是糊**。`canvas.width/height` 是 backing store（裝置像素），
  CSS 的 width/height 是版面尺寸（邏輯像素）。只設前者不乘 dpr → 高 DPI 螢幕上永遠糊；
  用 inline style 設後者 → 把 CSS 的 100% 凍死。正解：CSS 管版面、程式管 backing store，
  繪圖座標一律用邏輯像素（`viewW`／`viewH`），開頭 `setTransform(dpr,0,0,dpr,0,0)`。
- **「DRC 全綠」跟「接得起來」是兩件事**。公版 8 片 DRC error 全 0，卻有 70+ 條**零長度飛線**：
  同一點、同 net、不同層、缺 via。畫面上看不見（線長 0），DRC 不管（銅沒互相違規），
  只有把飛線按長度分類才看得出來。要驗連通性就得直接數飛線，不能只看 DRC。
- **位移一條折線不是「每段各自平移」**。轉角處位移後的兩段會重疊，補一段把它們接起來就變成
  往回走的尖刺；四條一束展開後直接打結、跨到隔壁那條上（實測一次 30 個 `drc_tt`）。
  正解是把頂點移到兩條位移線的**交點**（斜接），太尖的角再夾一個上限。差分對與束狀
  現在共用同一份 `_offsetSegs`——兩套位移邏輯遲早分岔。
- **自己驗自己永遠是綠的**。`step.test.js` 62 條斷言全綠——流形性、尤拉示性數、參照完整性
  一條不漏——而 OCCT 打開那份 STEP 讀到 **0 個物件**。原因是檔裡沒有 `PRODUCT_DEFINITION`
  那條產品結構：幾何一直是對的，只是沒有門讓人走進來。我們的檢查驗的是「我們對格式的理解」，
  而錯的正是那個理解。**任何格式的匯出，最終都要有一個跟我們無關的讀檔器點頭**——
  工具鏈在 `tools/verify/`，本機跑得完，不用找人。
- **內部檢查讀的是 state，不是產出的檔**。KiCad 匯出的 177 個 pad 只有 1 個帶 net、底面 pad
  掛在頂層、安裝孔變成鍍通孔、via 鑽徑欄位讀錯——四個都在同一次第三方 DRC 裡現形，
  而我們所有的測試都是綠的。要抓這一類，測試就得**打開產出的檔案**去看，不能只看記憶體。
- **同一個東西有兩個欄位名，遲早有人只讀其中一個**。via 的鑽徑在 KiCad 匯入寫 `id`、
  繞線器與公版資料寫 `drill`，而 Gerber／Excellon／DXF／鑽孔表／DRC **全部只讀 `id`**，
  於是公版 83 顆 via 一律按 0.3mm 鑽。0.3 剛好是預設值，所以十個月沒人發現。
- **寫死的預設值比留白危險**。IPC-2581 的疊構一直寫 totalFinishedThickness="1.6"、每層銅
  0.035mm，不管使用者在疊層編輯器設了什麼——因為那份資料在 localStorage，Edge Function
  讀不到。板廠會照著那個數字報價與壓合。**有資料沒送過去**跟「沒有資料」是兩回事：
  前者要修管線，後者要留白並警告。凡是「常數看起來很合理」的地方，先問那個常數是不是
  應該由使用者決定。
- **資料在檔裡，只是被丟掉了**。KiCad 匯入時已經讀到 courtyard 的每一條線段，卻只留下
  外接矩形，於是 L 形、帶缺角的封裝在組裝圖上全變成方塊——看圖的人會以為那是「沒資料
  的佔位」。解析階段丟掉的東西，後面誰也救不回來；先留著，用不用是下游的事。
- **合成出來的端點沒有層的約束**。束狀繞線的中心線兩端是「所有 pad 的重心」，那個點不在任何
  pad 上，所以繞線器可以自由選層——實測整束被繞到 B.Cu 而 pad 全在 F.Cu，畫面上線都在、
  未連線卻從 4 變 8（每個 pad 各多一條零長度飛線）。**凡是自己合成的起訖點，都要自己補上
  原本由 pad 帶來的限制**。
- **「成功」的定義要是「東西真的變了」，不能是「函式回了 ok」**。`AutoRoute.route` 在起終點
  落到同一格時 A* 立刻抵達，回 `ok:true` 但 `segs`／`vias` 全空。於是三份報告同時說謊：
  `refboard-route-audit` 說「12 條繞得成」、`refboard-fill` 說「補繞 12 條」、實際加 0 段、
  未繞數動也不動——三邊各自看起來都對，交叉比對才看得出來。2026-09-02 修成沒產生任何銅就回
  `rule_no_geometry`，補繞計數也改成「這條真的多出線或 via 才算」。**公版真正繞得成的是 0 條，
  剩下 42 條全是擺位問題**——原本那個 12 是假的。
- **失敗原因要回 key，不要回譯文**。`route` 以前回 `T(rule_ep_blocked)`，node 沒載 I18N 時
  T 回傳 key 所以測試永遠是綠的；瀏覽器載了 I18N 就回中文，呼叫端拿去組 `pj_ar_why_<key>`
  變成 `pj_ar_why_端點被異網障礙包住`，直接印在畫面上。**只在 node 測會看不到這種錯**。
- **先量再改會改變要做的事**。原訂是「改繞線策略提高公版成功率」，實測發現 134 條未繞裡
  118 條當場就繞得出來——真正缺的是「資料沒補繞過」與一個收線層的 bug。沒有那次量測，
  會花好幾天調一個沒有壞掉的演算法。
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
