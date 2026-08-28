# 匯出檔的真工具驗證清單

**要解決的問題**：Gerber / ODB++ / STEP / KiCad 四種格式，我們自己的檢查共 900+ 條斷言全綠，
但那證明的是「**我們自己讀得回來**」，不是「**別人的工具打得開**」。
`NEW-SESSION.md` §12 §D 把這一項標成 🔴，是目前風險最高的一條。

這份清單只有你做得了（要裝軟體、要看畫面）。做完把結果填回最後那張表。

---

## 0. 產生測試板

```bash
cd C:\Users\User\Documents\Web ; node tools/make-verify-boards.js
```

產出在 `verify-out/`，四個資料夾。這些板**不是**隨便畫的，
每一片都刻意塞進「我們驗得過、但真工具最可能不吃」的東西：

| 板 | 專門測什麼 | 塞了什麼 |
|---|---|---|
| **A-geometry** | 形狀對不對 | 真圓弧走線（90°/180°/小半徑 0.8mm）、旋轉 45° 的矩形 pad、旋轉 30° 的長圓 pad、通孔、**非矩形板框**（右上切 45° 斜角） |
| **B-pour** | 極性對不對 | 兩層鋪銅、**47 個區域**、熱風焊盤輻條、刻意造的孤島、禁佈區、穿過鋪銅的異網走線 |
| **C-netlist** | 網表與元件 | 4 層板、兩面元件、同一封裝用三次、**沒接網路的機構孔**、盲埋孔 |
| **D-mech** | 3D 與機構 | 同 A 但元件有高度差 |

`verify-out/summary.json` 有每片板的統計，對照用。

---

## 1. Gerber → gerbv（免費，最快）

**裝**：<https://sourceforge.net/projects/gerbv/>（Windows 版）或 KiCad 內建的 Gerber Viewer。

**開**：`verify-out/A-geometry/` 裡所有 `.gbr` ＋ `PTH.drl`

### 逐項確認

- [ ] **圓弧是圓的，不是折線**。放大 `F_Cu` 那三段弧（左下 90°、左上 180°、
      下方小半徑 0.8mm）。折線化的話小半徑那段最明顯。
      → 失敗表示 `G75` / `G02/G03` 沒被吃進去
- [ ] **弧與直線的接點沒有斷開或重疊**
- [ ] **旋轉 45° 的 SOIC-8**：八個 pad 應該整齊斜排，不是歪七扭八
- [ ] **長圓 pad** 是長圓不是矩形（J1，旋轉 30°）
- [ ] **板框右上角是 45° 斜角**，而且是**封閉**的
      → 沒封閉的話板廠會退件
- [ ] **鑽孔對齊 pad**：開 `PTH.drl`，孔應該落在 DIP-8 的 pad 中心
- [ ] 沒有任何「unknown aperture」「invalid command」之類的警告

接著開 `verify-out/B-pour/`：

- [ ] **鋪銅是一片有洞的銅，不是整片實心、也不是整片空**
      → 整片實心 = 清除極性（`%LPC*%`）沒被吃；整片空 = 極性反了
- [ ] **每個異網 pad 周圍都有一圈空隙**
- [ ] **接 GND 的 pad 有四根輻條連到鋪銅**（熱風焊盤）
- [ ] **右邊那塊被走線圍起來的小方塊沒有銅**（我們刻意丟掉的孤島）
- [ ] **左下角的禁佈區沒有銅**
- [ ] 底層 `B_Cu` 的 VCC 鋪銅也在（不是空的）

---

## 2. ODB++ → CAM350 / Genesis 2000 / ODB++ Viewer

**裝**：正版 CAM 軟體要錢。免費替代：
- **ODB++ Viewer**（Siemens 免費版，要註冊）<https://www.odbplusplus.com/>
- 或直接把資料夾寄給你合作的板廠，請他們用 Genesis 開一次回報

**開**：`verify-out/C-netlist/odb/`（整個資料夾，它就是 ODB++ 的 job 結構）

### 逐項確認

- [ ] **job 打得開**，`matrix` 認得出 4 層銅 + drill + 兩層元件
- [ ] **元件清單有東西**：U1（頂）、R1/R2/R3（頂）、U2（**底面，要標 mirror**）、H1
- [ ] **同一種封裝只定義一次**：`eda/data` 的 `PKG` 應該只有 3 筆
      （SOIC-8、R0603、MTG-M3），不是 6 筆
- [ ] **網表對得起來**：點 U1 的第 1 腳應該顯示 `VCC`，第 4 腳 `GND`
- [ ] **機構孔 H1 沒有網路**（`net_num = -1`），不該出現在電測點清單裡
- [ ] **盲埋孔的跨層範圍正確**（F.Cu → In1.Cu）

接著開 `verify-out/B-pour/odb/`：

- [ ] **鋪銅是一片有洞的銅**：內孔已於 2026-08-27 補上（surface 的 I/H contour）。
      如果 CAM 端看到的是整片實心，表示 H contour 沒被吃進去 → 回報給我。

---

## 3. STEP → FreeCAD（免費）

**裝**：<https://www.freecad.org/>

**開**：`verify-out/D-mech/D-mech.step`

### 逐項確認

- [ ] **檔案打得開**，不是「invalid STEP file」
- [ ] **板子是一塊有厚度的實體**（1.6mm），不是一堆散面
- [ ] **板框的 45° 斜角在**
- [ ] **通孔是真的穿透**，不是畫在表面的圓
- [ ] 元件方塊有高度差（1.2 / 3.5 / 8mm 三種）
- [ ] FreeCAD 的 `Check geometry`（Part → Check geometry）沒有報
      `invalid shape` / `self-intersection`

> 元件是**佔位方塊**不是原廠 3D 模型，這是已知的（§8）。不用回報這一項。

---

## 4. KiCad → KiCad（免費）

**裝**：<https://www.kicad.org/>（8.x 或 9.x）

**開**：`verify-out/A-geometry/A-geometry.kicad_pcb`

### 逐項確認

- [ ] **檔案打得開**，沒有 parse error
- [ ] 走線、pad、via 的位置與我們畫的一致
- [ ] **板框在 Edge.Cuts 層**且封閉
- [ ] KiCad 的 DRC（Inspect → Design Rules Checker）不報「unconnected items」
      以外的結構性錯誤
- [ ] File → Export → Gerber 再匯出一次，跟我們的 Gerber 對照**沒有明顯差異**
      （這是最強的交叉驗證：兩個獨立實作對同一塊板的理解一致）

> 已知限制：KiCad 匯出走 `buildNew` 時元件沒有 pad（見 `NEW-SESSION.md` §4）。
> 用 `A-geometry` 這片（元件有 pad）驗才有意義。

---

## 5. 回填結果

做完把這張表填一填，貼給我，我依結果決定要修什麼：

| 格式 | 工具 | 打得開 | 幾何正確 | 發現的問題 |
|---|---|---|---|---|
| Gerber | gerbv / KiCad Viewer | ☐ | ☐ | |
| ODB++ | | ☐ | ☐ | |
| STEP | FreeCAD | ☐ | ☐ | |
| KiCad | KiCad | ☐ | ☐ | |

**回報時請附**：
1. 打不開的話 → 錯誤訊息原文
2. 幾何不對的話 → 截圖 ＋ 說明「應該長怎樣、實際長怎樣」
3. 工具的版本號

### 判讀原則

- **打不開** = 🔴 立刻修，那表示格式根本不合規
- **打得開但幾何錯** = 🔴 同樣嚴重，而且更危險（板廠不會發現，會直接做）
- **打得開、幾何對、只有警告** = 🟡 記進 §8，排進待辦
- **已知的那兩項**（ODB++ 內孔、STEP 佔位方塊）不算新問題

---

## 附錄：如果你只有時間做一項

**做 Gerber**。理由：
1. 那是實際送去打板的東西，錯了直接變成廢板。
2. gerbv 免費、五分鐘裝好。
3. 圓弧與鋪銅極性這兩項是這一輪新改的，風險最高。

ODB++ 可以晚一點（目前是輔助格式，打版仍以 Gerber 為準）。
