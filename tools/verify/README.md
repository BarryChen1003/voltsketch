# tools/verify — 用第三方工具驗我們的匯出檔

repo 裡那一整排 `gerber-check.js` / `step.test.js` / `ipc2581.test.js` 驗的是
**「我們寫出來的東西符合我們對格式的理解」**。它們很硬——流形性、尤拉示性數、
參照完整性、座標一致——但跟被驗的東西出自同一套假設：**理解本身錯了，自己驗自己永遠是綠的。**

2026-09-02 第一次跑這套就證實了那句話。當時 `step.test.js` 62 條斷言全綠，
而 OCCT（FreeCAD 的 CAD 核心）打開我們的 STEP 讀到 **0 個物件**——146KB 的幾何，
CAD 眼裡是空檔。詳細清單見下面「第一次跑出來的東西」。

## 三個判官

| 工具 | 驗什麼 | 為什麼是它 |
|---|---|---|
| `kicad-cli`（KiCad 10） | 對我們匯出的 `.kicad_pcb` 跑 **KiCad 自己的 DRC** | 真正會有人拿我們的檔進去的那個軟體 |
| `FreeCADCmd`（OCCT 核心） | 開我們的 STEP，判定 shape 有效、實體封閉、算體積 | OCCT 是 CATIA／FreeCAD 血統的 CAD 核心，它讀得進去才叫打得開 |
| `gerbonara`（Python） | 讀 Gerber／Excellon，數圖形與鑽孔 | pcb-tools 的後繼，跟我們毫無關係的解析器 |

沒有涵蓋的：**IPC-2581 與 ODB++ 沒有夠成熟的開源讀檔器**，那兩個目前只有我們自己的檢查。
這件事就照實寫在這裡，不要讓人以為全部格式都有第三方背書。

## 裝起來（一次）

```powershell
winget install --id Python.Python.3.13 --exact --scope user
winget install --id KiCad.KiCad --exact
winget install --id FreeCAD.FreeCAD --exact
py -3.13 -m venv tools\verify\.venv
tools\verify\.venv\Scripts\python.exe -m pip install gerbonara
```

三個都是官方發行、開源、不需要任何帳號或憑證（KiCad GPL-3.0、FreeCAD LGPL-2.0+、Python PSF）。
winget 裝在使用者範圍，不用管理員權限。磁碟約 4GB。
`.venv/` 與 `out/` 都在 `.gitignore` 裡——工具進 git，環境不進。

## 跑

```powershell
pwsh -File tools\verify\verify.ps1                 # 8 片公版全跑
pwsh -File tools\verify\verify.ps1 rp2040-pico30   # 單片
```

exit 0 ＝ 三個判官都沒話說。產物與各自的報告在 `tools/verify/out/<板>/`：
`kicad-drc.json`、`step-occt.json`、`gerber-3p.json`。

**三個判官裡有兩個已經在 CI**（`ci.yml` 的 `verify-3p` job，2026-09-02 起）：
gerbonara 走 pip、kicad-cli 走官方 `kicad/kicad:10.0` image，每次 push 都跑。
**STEP 的 OCCT 檢查只有本機有**——那要 FreeCAD 或 OCP，為了一個檢查在 runner 上裝幾百 MB
不划算，而當初那兩個坑（產品結構、面的平面）已經被 `step.test.js` 釘成斷言了。
所以：動到 `pcb-step.js` 就手動跑一次這支；動到 `kicad-io.js` 或 `gerber.mjs`，CI 會替你跑。

## baseline.json

第三方報出來、但**已經查過**的項目寫在這裡，每一條都要附「為什麼這不是 bug」。
沒列到的一律算失敗——所以這份清單只會因為有人寫下理由而變長，不會靜靜長大。
寫不出理由就讓它紅著，那才是它存在的意義。

## 第一次跑出來的東西（2026-09-02）

六個真 bug，內部檢查一個都沒抓到，因為它們讀的是我們自己的 state，不是產出的檔：

| # | 問題 | 症狀 | 修在哪 |
|---|---|---|---|
| 1 | STEP 沒有產品結構 | CAD 開起來 **0 個物件**（幾何全對，但沒有門讓人走進來） | `pcb-step.js` 補 `PRODUCT_DEFINITION` → `SHAPE_DEFINITION_REPRESENTATION` |
| 2 | STEP 每個面都用 +Z 平面、每條邊共用一條過原點的假直線 | OCCT：Self-intersecting wire／Unorientable shape | `pcb-step.js` 的 `prism`：側面用真正的外側法向、邊的 LINE 從自己的起點出發 |
| 3 | KiCad 匯出的 pad 沒有 net | 177 個 pad 只有 1 個帶 net；KiCad 報 43 條 shorting_items，板子有銅沒連線 | `kicad-io.js` `buildNew` |
| 4 | 底面元件的 pad 掛在 F.Cu | 底面 SMD 在 KiCad 裡全跑到頂層 | 同上 |
| 5 | via 鑽徑只讀 `v.id`，公版 83 顆全用 `v.drill` | 一律退回 0.3mm——**Gerber／Excellon／DXF／鑽孔表／我們自己的 DRC 全中** | 10 處統一成 `v.id \|\| v.drill \|\| 0.3` |
| 6 | 安裝孔匯出成鍍通孔 | 板廠會把安裝孔鍍上銅；KiCad 每片報 2～4 條環寬 0 | `kicad-io.js` 認 `np_thru_hole` |

外加一個格式歧義：Excellon 的刀徑 `T4C1` 沒有小數點，在 TZ 格式下可以讀成 1mm 或 0.001mm
（gerbonara 直接解析失敗）。現在一律 `C1.000`。

還有一個不是 bug 但很要緊的事：KiCad 7 之後**設計規則不在板檔裡，在專案檔**。
只給 `.kicad_pcb` 的話 KiCad 用它自己的預設值檢查我們的板，一片板憑空多出 123 條
`track_width` 與 37 條 `clearance`。現在匯出會一起給 `.kicad_pro`（同名），
同一片板的違規從 242 掉到 97。

修完之後：8 片公版的 STEP **全部通過 OCCT 的有效性檢查**，Gerber 全部被 gerbonara 讀得懂
且鑽孔數對得上，KiCad DRC 有 6 片是 0 error，另外 2 片剩下的都寫進 `baseline.json`。
