# 硬體新技術：每月更新流程

頁面 `news.html`｜資料 `news-data.js`｜渲染 `news.js`｜守衛 `news-i18n-check.js`

每月 1 號更新一批。下面是照著做就不會出錯的順序。

**2026-08-14 起改成排程自動跑**：本機排程任務 `hardwareai-news-monthly`
（`~/.claude/scheduled-tasks/hardwareai-news-monthly/SKILL.md`），每月 1 號 09:00 觸發，
內容就是這份流程。它**開 PR 不直接 push main**——站上內容要人看過才發佈。
排程只在 Claude 這個 app 開著時才跑；當天沒開就順延到下次啟動。
要改時間或停用：在側欄 Scheduled 區管理，或叫我改。

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

## 1. 來源清單（每月至少各掃一輪）

| 地區 | 來源 |
|---|---|
| 美國 | EE Times、EDN、Power Electronics News、Semiconductor Engineering、廠商新聞稿（TI／ADI／Infineon／Navitas…） |
| 台灣 | TechNews 科技新報、工研院新聞室、台積電新聞稿 |
| 日本 | EE Times Japan（`eetimes.itmedia.co.jp`）、MONOist、廠商發表（ROHM／HIOKI／村田…） |
| 韓國 | TheElec（`thelec.net`）、ETNews |
| 大陸 | 電子工程專輯 EET China、與非網、艾邦半導體網 |
| 研討會 | ISSCC、APEC、PCIM、IEEE EMC+SIPI、EMC Europe、ECTC、DesignCon |

WebFetch 優先（免費）；搜尋不到再用搜尋工具。**Brave Search 有額度，非必要不用。**

## 2. 動手

1. 掃來源，挑出上個月符合收錄標準的項目。
2. 對每個要收的項目**實際 WebFetch 那個 URL**，核對數字。抓不到就標 `verified: false`，或乾脆不收。
3. 寫進 `news-data.js` 陣列**最前面**（排序是程式做的，但新的放前面比較好讀）。
4. 四語都寫。術語照 `knowledge-art-i18n.js` 的既有譯法，不要同一個詞兩種寫法。
5. 舊條目**不刪**——這頁是累積的技術年表，不是滾動式新聞牆。真的過時（例如規格被取代）就在 `why` 補一句。

## 3. 驗收（三個都要綠才算做完）

```bash
node news-i18n-check.js --strict   # 四語、出處、欄位值
node html-i18n-check.js --strict   # 頁面沒有寫死中文
node i18n-check.js                 # key 完整性
```

再開預覽（`.claude/launch.json` 的 `web-static`）看 `news.html`，四種語言各切一次，確認：
- 卡片數量對得上
- 篩選（領域 × 地區）點了會變
- 出處連結點得開

## 4. 收尾

- `news-data.js?v=` 與 `news.js?v=`（若改過）在 `news.html` 遞增，否則使用者的瀏覽器吃舊快取。
- commit + push（硬規矩 7）。

## 教訓

- 2026-08-06 | 第一批建置 | 用搜尋結果的摘要寫條目風險高：有一則彙整頁把兩篇文章的數字混在一起（電壓與熱阻），差點寫進站 | 要收的條目一律自己抓原文核對，抓不到就標 `verified:false` 或不收
