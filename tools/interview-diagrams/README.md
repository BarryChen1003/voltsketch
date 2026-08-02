# 面試題電路圖產生器

`interview-bank.js` 裡的 SVG **不是手寫的**，是這裡的產生器吐出來的。
要改圖就改產生器再重跑，別直接編輯 `interview-bank.js` 裡那串轉義過的 SVG。

## 工作流程

```bash
cd tools/interview-diagrams

# 1) 改對應的 batchN.js（一支 batch 管幾題）
# 2) 產出 JSON 讓瀏覽器可以抓（重疊實測要用）
node -e "require('fs').writeFileSync('../../_batchN.json', JSON.stringify(require('./batchN.js')))"

# 3) 重疊實測：把 overlap-audit.md 裡的 snippet 貼進 interview.html 的 console，
#    改成 fetch('/_batchN.json') 掃這批（門檻 0.5px，這是權威驗收）

# 4) 語意驗證：畫的內容對不對（工作週期真的 30%？箭頭方向對嗎？）
node verify-batchN.js

# 5) 寫回題庫（逐題比對，未指名的題目不准被動到）
node patch-bank.js batchN.js --dry      # 先看會改哪幾題、長度變化
node patch-bank.js batchN.js            # 確認後寫回；也可只給 q6 q8 這種清單

# 6) 收尾
cd ../.. && node interview-diagram-check.js && node interview-diagram-check.test.js
rm -f _batchN.json          # 暫存檔別提交
```

## 檔案

| 檔 | 作用 |
|---|---|
| `light.js` | 共用底層：白底 `BG`、文字 `T`、接線 `wire`、電流高亮 `hl`、垂直二極體 `diodeV`、配色常數 |
| batch1.js ~ batch6.js | 早期深色手繪版（尚未轉換的題目仍由這些產出） |
| batch8.js ~ batch11.js | 符號庫版（白底 + `schematic-symbols.js`），新圖一律走這條 |
| `verify-batch*.js` | 各批的語意/幾何斷言 |
| `patch-bank.js` | 把 batch 的圖寫回 `interview-bank.js`（定點字串替換，不重新序列化整檔） |
| `gen-*-sql.js` | 產生寫進 Supabase 的 SQL；**圖一律從 `interview-bank.js` 取**，不要綁 batch 檔（題目會被下一批重畫，綁死就永遠吐舊圖） |
| `add-pcb-entries.js` | 把 `interview-pcb.sql` 的 6 題灌進 bank（題幹從 SQL 解析，不手抄） |

## 畫圖規矩

1. **元件一律用 `schematic-symbols.js`（`Sym`）**：電阻是鋸齒不是方框、MOSFET 有閘極板/通道/本體箭頭/體二極體。
   自己刻方框會跟知識庫 146 卡完全不同調——這是被使用者退過的。
2. **`Sym` 的內建標籤是 9–10px，低於本專案 ≥10 的規格** → 一律 `showPins:false`，文字用 `T()` 自己畫 11px。
3. **先切帶再放元件**：符號比方框佔空間。目前的分帶是
   標題 20 / 欄標題 46 / 電源軌 66 / 上管 110 / 節點 166 / 下管 215 / 地 264 / 說明 290+。
   直接照抄 `batch9.js` 的骨架最省事。
4. **畫布寬 520**（flyback 那組 720 是既有例外）。高度不夠就往下長，別把元件擠在一起。
5. **電流路徑用 `hl()`**：半透明粗線畫在元件底下，`stroke-opacity < 0.5` 讓重疊檢查自動略過。
6. **每張圖都要有語意斷言**，不是只驗重疊——空白畫布也不會重疊。
