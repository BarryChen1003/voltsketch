# Hardware Lab Platform Roadmap

這個專案會整合三個核心能力：線路圖繪製/模擬、硬體知識庫、PCB Layout 練習與模擬。

## 1. 線路圖繪製與模擬

目標：使用者可以放置標準元件、自訂 IC symbol、匯入線路圖圖片/PDF 與 datasheet，讓系統檢查線路是否畫錯。

### 必要功能

- 支援上傳 IC datasheet，萃取 pin table、電源腳、GND、GPIO、通訊腳、絕對最大額定、建議典型應用電路。
- 根據 datasheet 自動建立 IC symbol，包含 pin name、pin number、pin type、方向、電源域與封裝資訊。
- IC symbol 可以無限制新增，並保存到本機資料庫或 JSON library。
- 支援上傳線路圖圖片/PDF/工程檔，用於線路檢查。
- 檢查項目包含 TX/RX 反接、I2C pull-up、SPI 腳位、USB D+/D-、CANH/CANL、電源腳漏接、GND 漏接、RESET/BOOT/EN 腳位、decoupling capacitor、電壓域不匹配。
- 線路圖內的自訂 IC 可以跟 datasheet 規則連動，讓檢查結果指出錯誤 pin、錯誤 net、可能缺少的周邊元件。

### 建議資料結構

- `ic-library/`：自動或手動建立的 IC symbol JSON。
- `datasheets/`：上傳的 datasheet 原始檔。
- `schematic-checks/`：線路檢查報告與規則。
- `projects/`：使用者建立的線路圖專案。

## 2. 硬體知識庫

目標：根據大量 PDF 建立硬體知識內容，用文字、圖片，未來可加入動圖方式呈現。

### 必要功能

- 批次讀取 `hardware-pdfs/` 內的 PDF。
- 將 PDF 內容轉成主題知識卡，例如 Level Shift、LDO、Buck、Boost、Op Amp、MOSFET Gate Driver、ESD、EMI、UART/I2C/SPI/CAN/USB。
- 每個主題包含：原理說明、典型電路圖、關鍵公式、設計注意事項、常見錯誤、範例應用。
- 能把 PDF 中的重要圖片擷取出來，插入知識頁。
- 未來若需要動圖，可用 SVG/canvas 動畫呈現電流方向、電壓變化、開關週期、layout return path。

### 建議資料結構

- `hardware-pdfs/`：原始 PDF。
- `hardware-knowledge-site/`：Claude Code 之前做的硬體知識網頁。
- `knowledge-db/`：從 PDF 整理出的 JSON/Markdown 知識資料。
- `knowledge-assets/`：圖片、示意圖、未來動畫素材。

## 3. PCB Layout 練習與模擬工具

目標：根據 YouTube 與 PDF 教學內容建立 PCB layout 練習環境，讓使用者可以練走線與理解 layout 原則。

### 必要功能

- PCB canvas：元件、pad、via、trace、plane、keepout、net label。
- 支援 schematic to PCB 的基礎 netlist 對應。
- 提供 layout 規則檢查：短路、未連線、線寬、間距、過孔、電源回路、decoupling capacitor 位置。
- 教學模式：依據知識庫內容顯示 layout 建議，例如高速線、差分對、電源回路、類比/數位分區、接地策略。
- 練習模式：給一個電路，讓使用者完成 PCB，再由系統給出檢查結果。

### 建議資料結構

- `pcb-projects/`：PCB 練習專案。
- `pcb-rules/`：DRC 與 layout 教學規則。
- `pcb-lessons/`：從 YouTube/PDF 整理出的 layout 教學內容。

## 整合方向

第一階段先完成資料流：

1. PDF/datasheet 上傳。
2. IC symbol 自動建立。
3. 線路圖檢查報告。
4. PDF 知識卡生成。

第二階段再完成互動工具：

1. 自訂 IC library 管理。
2. 知識庫搜尋與主題頁。
3. PCB canvas 與 netlist。
4. PCB layout 檢查與教學模式。

第三階段再加入更進階能力：

1. 從圖片/PDF OCR 解析線路圖。
2. 根據 datasheet 自動生成典型應用電路。
3. 用動畫呈現硬體知識。
4. 用 AI 對 schematic 與 PCB layout 做交叉檢查。
