# HardwareAI 交接（新 session 從這裡開始）

最後更新 2026-07-22 · repo `Documents/Web` → github.com/BarryChen1003/voltsketch · 分支 `main`
狀態：工作區乾淨、HEAD == origin/main（`1461dc4`）

---

## 0. 三條硬規矩（違反了就是重做）

1. **圖跟字絕對不能疊**（使用者稱「鐵律」）。任何 SVG 交付前用瀏覽器實測驗，不是目視。
   權威檢查 snippet 在 `overlap-audit.md`；node 版 `svg-overlap-check.js` 只是估算器，擋 CI 回歸用。
2. **不要憑印象畫電路 / 腳位 / 動畫**。電路動畫整批被砍掉就是因為畫錯——「看起來很確定的錯誤」比沒有更糟。
   畫不出有把握的就**拒畫**（回 null、退回文字），並在圖說標明依據與界限。
3. **改任何知識卡內容或圖，一定要遞增 `knowledge.js` 的 `BUILTIN_VERSION`**，
   否則使用者 localStorage 的舊快取會蓋住新內容（這個坑踩過三次）。

---

## 1. 現況：這站是什麼

| 模組 | 狀態 |
|---|---|
| 線路圖編輯器 `index.html` | 穩定 |
| **PCB Layout** `pcb.html` | 接近桌面 EDA：undo/redo、自動存檔、匯出匯入、刪除、多選/框選/群組拖曳/端點拖曳/複製貼上、對齊分佈、方向鍵微調、文字/尺寸/netlabel/禁止區、Gerber 匯出、3D |
| IC 元件庫 | footprint 覆蓋 **195/195**（0 方框） |
| 公版參考庫 | 8 板 213 料件全有 footprint/pin |
| 知識庫 `knowledge.html` | **152 卡**（2026-08-01 實測，側欄 14 類加總）；原理說明自動分段；電路圖 0 重疊；**無「範例應用」段**（2026-07-26 全數移除，內容與圖都不正確） |
| 觀測性 | `observe.js` 錯誤監控＋analytics（11 頁），**待跑 SQL 才會有資料** |
| 金流 | 前後端碼齊全，**待部署** |

## 2. CI（10 關，push/PR 觸發）

```
node --check 全 JS → reffp-check → pcb-logic.test → gerber-check → i18n-check
→ knowledge-format.test → circuit-check --strict → svg-overlap-check --max=2
→ JSON parse → HTML 引用存在性
```

本機跑全套（gerber 較慢，分批跑避免逾時）：
```bash
for f in ./*.js; do node --check "$f" || echo "FAIL $f"; done
node reffp-check.js && node pcb-logic.test.js && node knowledge-format.test.js
node circuit-check.js --strict && node i18n-check.js
node svg-overlap-check.js --max=2
node gerber-check.js
```

`svg-overlap-check` 用 `--max=2` 而非 `--strict`：那 2 處是估算器**假陽性**（看不到 `<g transform>`、字寬是估算），瀏覽器實測是 0。別為了好看改成 --strict，會被假陽性卡住。

## 3. 開發環境

- 預覽：`.claude/launch.json` 的 `web-static`（python http.server :8099）。**不要用 Bash 起 server**。
- 驗證 SVG 一律用瀏覽器 `getBBox()` + `getCTM()`（getBBox **不含**祖先 transform，只用它會誤判）。
- 改 `.js` 後要同步 bump `knowledge.html` / `pcb.html` 的 `?v=` 參數。

---

## 4. 卡在使用者（我做不了，全在 `LAUNCH-CHECKLIST.md`）

依急迫度：

| # | 事項 | 檔案 | 不做的後果 |
|---|---|---|---|
| 1 | **接自訂 SMTP（Resend）** | `supabase/email-templates/SMTP-SETUP.md` | 真實用戶收不到驗證信＝**註冊不通**，比任何功能都硬 |
| 2 | 跑 SQL Phase A | `supabase/sql/00-RUN-phaseA.sql`（整份貼一次） | observability 表不存在、orders 不存在 |
| 2b | 註冊後跑 Phase B | `supabase/sql/owner-unlock.sql` | 站主拿不到 admin。⚠ 檔內信箱是 `smallshark1003@gmail.com`，與系統帳號 `barry871003@gmail.com` 不同，跑前先確認 |
| 3 | 部署 Edge Functions | `supabase/functions/DEPLOY.ps1` | 金流不能用（腳本內含綠界公開測試密鑰，可先端到端驗） |
| 4 | 註冊網域（`.com`/`.app`，$10–20/年） | — | `github.io` 沒有 DNS 控制權 → **無法接 SMTP**。免費域（.tk 等）信譽差會被擋 |
| 5 | 加 repo secret `SUPABASE_DB_URL` | `.github/workflows/backup.yml` | 自動備份不啟用（免費層無備份，用戶/訂單炸了沒得救） |
| 6 | 綠界特約商店送件 | — | 不能正式收款（退款政策已補進 terms.html ✅） |

## 5. 工程面待辦（我能做，等指示）

- **F：footprint/知識擴充** — 需使用者指定方向。加公版板要真實 github 板檔；IC 補腳名要 datasheet，不憑印象。
- 知識卡逐張審內容（需使用者在場定調）。
- 前端 analytics 事件已埋（`Observe.track`），等 SQL 跑完才看得到資料。

---

## 6. 這個 session 學到的（別重蹈）

- **沒有可驗證判準就別產教學內容**：範例應用（文字＋自動圖）2026-07-26 整段砍掉，理由與電路動畫同一個——內容與圖都不正確。這是同型錯誤第二次；先有「怎樣算對」的檢查方法，再產內容。
- **「換個標籤」不算新內容**：範例應用第一版把卡片主圖複製一份只改 IC 名 → 同頁兩張一樣的圖，使用者直接指出沒有意義（該段現已刪除）。
- **自動吸附會吃掉接線**：`knowledge-circuits2.js` 的 `L()` 會把端點吸到 12–14px 內的腳位，兩端吸到同一點時線就塌成零長＝那條線根本沒畫。符號內部一律用 `LR()`（不吸附）。`circuit-check.js` 專抓這個。
- **拓樸方向要驗**：曾把 LDO 畫成 `3.3V→5V`（升壓，物理不可能）。凡是有方向的東西都要對照拓樸檢查。
- **中文排版禁則**：收尾標點不可置行首（曾把「）」單獨丟到第二行）。
- **估算器 ≠ 實測**：字寬估算會漏掉「bulk 貼著方塊」這種擦邊；最終驗收一律瀏覽器實測。

## 7. 使用者的合作偏好

- 要**證據型回報**（exit code、file:line、實測數字），不要「應該可以了」。
- 給明確清單後期待自主跑完，隨做隨落檔。
- 指出問題時通常是對的——先驗證他說的，別急著辯解（範例應用複製那次他就是對的）。
- 繁體中文回覆。
