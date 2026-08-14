# 硬體新技術：更新流程

頁面 `news.html`｜資料 `news-data.js`｜渲染 `news.js`｜守衛 `news-i18n-check.js`

## 兩種更新頻率（2026-08-14 使用者指示）

每則資料有 `kind` 欄位，決定它歸哪一次更新：

| kind | 收什麼 | 多久跑一次 | 排程任務 |
|---|---|---|---|
| `news` | 媒體報導、廠商新聞稿、新產品、商業消息 | **每天 09:00 / 12:00 / 21:00**（來源橫跨美台日韓中，發布時間不同） | `hardwareai-news-daily` |
| `paper` | 期刊論文、研討會／論壇發表（ISSCC、APEC、PCIM、EMC+SIPI、ECTC、DesignCon…） | **每月 1 號 09:00** | `hardwareai-news-monthly` |

兩支都**直接 push main**（使用者 2026-08-14 決定），GitHub Pages 約一分鐘後生效。
沒有新項目就什麼都不做——不 commit、不 push。一天三次，大多數時候本來就該是「沒有新項目」。
**去重是每日任務最容易出事的地方**：同一件事會在不同媒體以不同標題與 URL 出現，寫之前先比對現有的 `id` 與 `url`。

兩者共用同一份收錄標準與驗收步驟（下面各節），差別只在**掃哪些來源、多久掃一次**。

排程檔在 `~/.claude/scheduled-tasks/<任務名>/SKILL.md`。
排程只在 Claude 這個 app 開著時才跑；當天沒開就順延到下次啟動。
要改時間或停用：在側欄 Scheduled 區管理，或叫我改。

## 舊條目一律不刪，用分頁往後堆

這頁是**累積的技術年表**，不是滾動式新聞牆。`news.js` 每頁 8 則、最新的永遠在第 1 頁，
舊的自動往後面的頁碼移。所以「更新」永遠是**往陣列前面加**，不是換掉現有內容。
真的過時（規格被取代）就在 `why` 補一句，還是不刪。

## 0. 收錄標準（先看這段，決定要不要收）

**收**：新製程／新元件／新材料／新架構／新規範／研討會與期刊發表。
**不收**：財報、股價、產能擴充、人事、併購**除非**它改變了技術供給（例如買下 IVR 公司這種）。

判斷句：**這條能不能讓一個硬體工程師改變他下一版的設計或選料？** 不能就不要收。

每則一定要有：
- `url`（http/https）與 `date`（來源上印的日期，不是你抓取的日期）
- `summary` 帶數字（電壓、效率、密度、頻率、尺寸…）。沒有數字的條目要想清楚還值不值得收
- `why`：對設計者的意義，不是重複 summary
- 四語齊全（硬規矩 6）

`verified` 欄位不准說謊：
- `true` = 你**實際抓過那個 URL**、核對過內文數字
- `false` = 只在來源的列表頁或彙整文看到

## 1. 來源清單

### 每天掃（kind: `news`）

| 地區 | 來源 |
|---|---|
| 美國 | EE Times、EDN、Power Electronics News、Semiconductor Engineering、廠商新聞稿（TI／ADI／Infineon／Navitas…） |
| 台灣 | TechNews 科技新報、工研院新聞室、台積電新聞稿 |
| 日本 | EE Times Japan（`eetimes.itmedia.co.jp`）、MONOist、廠商發表（ROHM／HIOKI／村田…） |
| 韓國 | TheElec（`thelec.net`）、ETNews |
| 大陸 | 電子工程專輯 EET China、與非網、艾邦半導體網 |

每天只看**前一天**的新東西。一天沒有值得收的就明說沒有，不要把舊的翻出來湊。

### 每月 1 號掃（kind: `paper`）

| 類型 | 來源 |
|---|---|
| 研討會 | ISSCC、APEC、PCIM、IEEE EMC+SIPI、EMC Europe、ECTC、DesignCon |
| 期刊 | IEEE TPEL / TCAS / TEMC、JSSC，以及各校/法人的論壇發表（工研院、CMP 論壇這類） |

每月看**上個月**的發表。研討會的議程頁常常一次列很多篇，挑得動設計決策的收。

WebFetch 優先（免費）；搜尋不到再用搜尋工具。**Brave Search 有額度，非必要不用。**

## 2. 動手

1. 掃對應的來源（每天跑就掃 news 那組，每月跑就掃 paper 那組），挑出符合收錄標準的項目。
2. 對每個要收的項目**實際 WebFetch 那個 URL**，核對數字。抓不到就標 `verified: false`，或乾脆不收。
3. 寫進 `news-data.js` 陣列**最前面**，並填 `kind`（`news` 或 `paper`）。
4. **先比對既有的 `id` 與 `url`，重複的不要再收一次**。每天跑最容易踩這個——同一則新聞會在不同媒體出現。
5. 四語都寫。術語照 `knowledge-art-i18n.js` 的既有譯法，不要同一個詞兩種寫法。
6. 舊條目**不刪**——這頁是累積的技術年表，靠分頁往後堆。真的過時（例如規格被取代）就在 `why` 補一句。

## 3. 驗收（三個都要綠才算做完）

```bash
node news-i18n-check.js --strict   # 四語、出處、欄位值
node html-i18n-check.js --strict   # 頁面沒有寫死中文
node i18n-check.js                 # key 完整性
```

再開預覽（`.claude/launch.json` 的 `web-static`）看 `news.html`，四種語言各切一次，確認：
- 卡片數量對得上
- 篩選（領域 × 地區 × 類型）點了會變，換條件會跳回第 1 頁
- 分頁：最新的在第 1 頁，點第 2 頁看得到比較舊的
- 出處連結點得開

## 4. 收尾

- `news-data.js?v=` 與 `news.js?v=`（若改過）在 `news.html` 遞增，否則使用者的瀏覽器吃舊快取。
- commit + push（硬規矩 7）。

## 教訓

- 2026-08-06 | 第一批建置 | 用搜尋結果的摘要寫條目風險高：有一則彙整頁把兩篇文章的數字混在一起（電壓與熱阻），差點寫進站 | 要收的條目一律自己抓原文核對，抓不到就標 `verified:false` 或不收
