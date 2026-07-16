# VoltSketch TODO / 待辦總表

> 更新：2026-07-16。狀態：✅完成 🔄進行中 ⬜未開始 ❌卡外部 ⏸依指示暫緩。
> 原始願景見 `PROJECT_ROADMAP.md`；金流/帳號部署步驟見 `SETUP-PAYMENT.md`、`SETUP-AUTH.md`、`SETUP-EXPORT-QUOTA.md`。

## A. 卡站主帳號/外部申請（工程端無法代做）

| # | 項目 | 內容 | 狀態 |
|---|---|---|---|
| A0 | **正式網域** | github.io 為暫時網址，成品後換自訂網域並關閉舊址。遷移 checklist（工程端屆時執行）：canonical/OG URL 全站改、Supabase Auth redirect URL、ECPay ReturnURL/ClientBackURL、CORS、GitHub Pages custom domain + HTTPS、（可能）舊址 301 | ⬜ 卡網域購買/定名 |
| A1 | Search Console + GA4 | **必須站主本人 Google 帳號登入操作**（工程端只能備 meta 驗證檔/sitemap＋一步步指引，不能代登入）。⚠️ 建議**等 A0 網域定案再辦**——現在對 github.io 驗證，換網域要整套重來 | ⏸ 等 A0 |
| A2 | Email 服務 | 對外聯絡信箱＋Supabase Auth SMTP（密碼重設/驗證信寄送品質）。同樣需站主本人開通，建議與 A0/A1 一起辦 | ⏸ 等 A0 |
| A3 | 綠界特約商店 | 申請正式商店（個人賣家或公司）→ 取 MerchantID/HashKey/HashIV → `supabase secrets set` → ECPAY_ACTION_URL 換正式 → 真實小額測試（沙盒 E2E 已過） | ❌ 卡申請（3–5 工作天） |
| A4 | 電子發票 | 正式收款（台灣）需開立發票：綠界電子發票加值服務或其他方案，接進 webhook 入帳流程 | ⬜ A3 之後 |
| A5 | Supabase 正式部署核對 | SQL 三件（schema/export-quota/payment）＋ owner-grant 已跑？Functions 已 deploy？secrets 已設？ | ⬜ 站主核對一次 |

## B. 工程（可自主）

| # | 項目 | 內容 | 狀態 |
|---|---|---|---|
| B1 | 贊助後端 | `create-order` 支援 `plan:'sponsor'`：後端驗 amount（整數/上下限）再簽章；沙盒測一筆；前端 UI 已上線（upgrade.html） | ⬜ 下一批 |
| B2 | PCB JS 動態字串 i18n 殘量 | 站主 2026-07-16 視翻譯為完結；並行 session 已做 pcb-practice（54c9f7e）。做 B4 時順手核對殘量（pcb.js toast/pcb-drc 訊息），不另開專輪 | 🔄 併入 B4 |
| B3 | 剩餘頁面內文 i18n | upgrade.html VIP 方案卡文字、interview/login/terms/privacy/architecture 內文逐頁盤點（nav/brand 已全站自動翻） | ⬜ |
| B4 | **PCB 企業級（當前主線）** | 依序：①Constraint Manager（net class/間距矩陣/銳角 DRC）✅e3f108f ②鋪銅實算（thermal relief/避讓/動態填充）⬜ ③佈線強化（差分對/等長調諧/push&shove）⬜ ④疊層＋padstack＋backdrill ⬜（Status 面板已上線） | 🔄 模組①完成 |
| B5 | IC 資料補洞 | KSZ9031RNX 缺 EP 腳；AMC 系列「固定增益精值待補」 | ⬜ 小 |
| B6 | 知識卡：特殊線路卡批4 | 沿 datasheet 打底模式續做（批1–3 共 24 張已上） | 🔄 可自主 |
| B7 | 知識卡：產品卡填充 | 產品大分類卡片持續補充 | 🔄 可自主 |

## C. 內容營運（付費承諾，須排程）

| # | 項目 | 內容 | 狀態 |
|---|---|---|---|
| C1 | 付費知識卡月更 | VIP 方案文案承諾「**每月上線新內容**」——收費後即為義務。建議固定節奏：每月 5 張（6 付費分類輪流），來源沿 datasheet/教學打底管線 | ⬜ 定節奏後可自主產出 |
| C2 | 面試題庫擴充 | 12 個月方案賣點；現 27+ 題，持續加題（interview-i18n.sql 已有 i18n 架構） | ⬜ |

## F. 細修（站主 2026-07-16 驗收回饋，整體完成後逐項修）

| # | 項目 | 內容 | 狀態 |
|---|---|---|---|
| F1 | 知識卡付費內容不可見 | 站主反映看不到付費卡內容——查因：owner 帳號未登入？owner-grant 未跑？KB_LOCK 邏輯把 owner 也鎖？demo 模式判斷？ | ⬜ 先診斷 |
| F2 | 知識卡內容明確性 | 部分卡片表達不夠明確——需站主指出卡片清單，逐張複審改寫 | ⬜ 待站主列卡 |
| F3 | IC symbol 文字/圖重疊 | 部分 IC 的 symbol 渲染文字與圖形重疊——需盤點是哪幾顆（ic-symbol.js 排版問題），修渲染引擎 | ⬜ 先盤點 |
| F4 | 多 pin IC 拆 multi-unit symbol | 大 pin 數 IC symbol 過大、與其他 IC 比例失衡——按功能拆 2~3 個 unit（如電源 bank/GPIO bank/類比 bank，KiCad unit 慣例），symbol 引擎＋資料層都要支援 | ⬜ 設計後做 |
| F5 | 問題 IC 盤點 | 站主反映「有幾個 IC 是有問題的」——需站主列料號，逐顆核對 datasheet 修正 | ⬜ 待站主列料號 |

## D. 最終步驟（站主明說才做）

| # | 項目 | 內容 | 狀態 |
|---|---|---|---|
| D1 | 資安總檢 | 全站盤點：RLS policies 實測（匿名/免費/VIP 各角色實打）、export-gateway 額度繞過測試、webhook 偽造/重放實測、PCB `pcb_access` 硬鎖 vs 前端邀請碼門面、XSS（esc() 覆蓋率）、依賴（supabase-js CDN 版本）、secrets 不落前端複查 | ⏸ 指定最終步 |

## E. 長期（PROJECT_ROADMAP 第二/三階段殘餘）

- datasheet 上傳 → pin table 自動萃取 → 自動建 IC symbol
- 線路圖圖片/PDF 上傳檢查（TX/RX 反接、I2C pull-up、電源/GND 漏接、decoupling、電壓域）
- PDF 批次 → 知識卡自動管線＋圖片擷取；動圖（SVG/canvas）
- schematic → PCB netlist 完整對應（現僅基礎 sync）
- OCR 解析線路圖、datasheet 自動生成典型應用電路、AI schematic/PCB 交叉檢查

## 已結案（供對照）

- IC 補料 195/195（可建者全建，無 pinout 者依鐵律 skip）
- 翻譯：IC 條目/secondSource/pins 100%、知識卡 133 張詳情全譯、全站靜態 UI（含 PCB 靜態 markup 100%、knowledge 左欄、nav/brand、IC 庫）
- SEO/Analytics 技術面（meta/canonical/OG）
- 綠界沙盒 E2E、匯出額度閘門、面試題 RLS
- 升級VIP 全頁入口、贊助前端 UI、PCB Allegro 風 Status 面板
