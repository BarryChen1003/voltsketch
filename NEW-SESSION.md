# NEW SESSION — 接手指南（2026-08-20）

先讀本檔，再讀 `HANDOFF.md`（長期規矩、開發環境、踩過的坑）。兩份衝突時**以本檔為準**。

> **站已經上線，而且在收真錢。** `https://hardware-ai.org`（Cloudflare Workers 靜態資產，推 main 自動部署）。
> 綠界正式金鑰已生效、真卡付款實測通過。任何動到 `supabase/functions/` 或 `_headers` 的改動，
> 都可能讓真實客戶付不了款或整頁停擺——動之前先讀 §3。

---

## 0. 硬規矩

1. **圖字絕不重疊、元件絕不互疊**。改完圖跑幾何檢查（§5），再用瀏覽器實測收尾。
2. **不憑印象畫電路／腳位／規格**。沒有可查證依據就不畫、不填；datasheet 抽不到就標「未擷取」。
3. **元件符號一律用 `schematic-symbols.js`（`Sym`）**。自己刻方框已被使用者退過一次。
4. **改知識卡內容或自動圖 → 同步遞增 `BUILTIN_VERSION`（knowledge.js）與 `?v=`（knowledge.html）**。
   改 `interview-bank.js` → 遞增 `interview.html` 的 `?v=`。
5. **只驗重疊不夠**。每張圖都要有「畫的數字／拓樸對不對」的斷言。
6. **新功能一律四語**（zh / en / ja / ko）。**任何新增或修改的內容都算，不只新功能。**
7. **做完就 commit + push**，不要停在「沒有 commit（未指示）」。
8. **要使用者跑 SQL 或指令時，把完整內容貼進對話**，不要只給檔案路徑叫他自己去開。
   （使用者為此糾正過兩次；他在 Supabase 網頁介面操作，只給路徑等於多三個步驟。）
9. **宣稱「完成／修好」之前先實際驗證**。跑測試、貼 exit code、實際呼叫一次。
   這個 repo 有大量「有畫面但不能用」的前例（見 §7），目視不算數。

---

## 1. 現況（2026-08-20）

| 項目 | 狀態 |
|---|---|
| **正式站** | `hardware-ai.org`（Cloudflare Workers）。HTTPS、安全標頭、`.git` 不外流、`www` 301 |
| **金流** | ✅ **正式收款中**。綠界正式金鑰已設、真卡 NT$300 實測通過並退刷 |
| **帳號** | 驗證碼註冊（不是連結）、Resend SMTP、站主 `smallshark1003@gmail.com` 是 admin |
| **權限** | PCB 隨**任何 VIP 方案**開通；面試題庫限 12 個月方案。**到期會自動失效** |
| **CSP** | ✅ 嚴格模式。`script-src` 無 `unsafe-inline`，16 段 inline script 逐段雜湊 |
| **前端相依** | ✅ 4 支程式庫自行代管於 `vendor/`（釘版本＋SHA-256），全站零外部腳本 |
| **Gerber** | ✅ 產生器已搬到後端（`supabase/functions/_shared/gerber.mjs`），前端拿不到 |
| **備份** | 每週日 `pg_dump` → GitHub artifact，含 `auth` schema。**還原演練腳本已寫好但未跑過真檔** |
| IC 元件庫 | 196 顆全建檔 |
| CI | 28 關，本地與線上皆綠 |

### 使用者的下一步是「推廣」

他要開始對外宣傳。所以**任何會讓新訪客看到壞掉功能的東西，優先序高於新功能**。

---

## 2. 這一輪（2026-08-18 ~ 20）做了什麼

按重要性排：

| 項目 | 一句話 |
|---|---|
| **Gerber 搬後端** | 產生器原本送給每個訪客，等於免費送 PCB 的核心價值。現在只在 Edge Function，需驗權限 |
| **嚴格 CSP** | 拿掉 `unsafe-inline`，16 段 inline script 逐段雜湊。實證：注入的 script 不執行、列冊的照跑 |
| **權限到期失效** | `pcb_access`／`interview_paid` 從來不會被收回＝付一次永久有效。改成比對 `plan_expires_at` |
| **PCB 下放全方案** | NT$300 起就含 PCB（原本限 12 個月）。`unlockAll` 拆成 `pcb`／`interview` 兩個旗標 |
| **邀請碼整個移除** | 5 組明碼寫在公開 HTML 裡；`pcb-viewer` 只認 localStorage 旗標（一行 setItem 就進得去） |
| **webhook 三修** | DB 失敗仍回 `1\|OK`（收錢沒開通）、續購吃掉剩餘天數、重送競態 |
| **CDN 自行代管** | supabase-js 原本是浮動 `@2`，跑在登入頁與付款頁 |
| **net 命名＋電壓** | 文字綁到導線成為 net 名，可標電壓；DRC 抓電位衝突與電源對地短路 |
| **電壓符號 vrail** | 可移動的電源符號，**不參與** net 命名（使用者明確要求分開） |
| **Net 清單 CSV** | BOM 視窗多一個匯出：每條 net 的名稱、電壓、接腳 |
| 自訂 IC 保留 | 建立後真的存進元件庫（原本只丟畫布，換張圖就沒了）；需登入 |
| 放置避讓 | 新元件不再疊在既有元件上 |
| 隱私權政策 | 補「資料儲存於澳洲雪梨、跨境傳輸」條款，四語 |

---

## 3. 動這幾個檔之前先讀（會讓真實客戶出事）

### `_headers`（CSP）

- **改任何一段 inline `<script>` 之後，一定要跑 `node csp-hash.js`**，否則那段上線後被自己的
  CSP 擋掉、整頁功能停擺。CI 的 `csp-hash.js --check` 會擋住忘記重跑。
- **不准加 inline 事件處理器**（`onclick=`）。雜湊蓋不到屬性上的程式碼；`csp-hash.js` 會直接 FAIL。
- 三個 directive 改了會**靜靜壞掉**：
  - `form-action` 少了綠界網域 → 按付款沒反應（沙盒與正式是**不同網域**，兩個都要留）
  - `frame-src` 少了 `falstad.com` → 線路圖頁的模擬器不動
  - `connect-src` 少了 Supabase → 全站 API 死掉

### `supabase/functions/`（金流與 Gerber）

- 改完**必須重新部署**，secrets 與程式碼都不會自動生效：
  ```
  npx --yes supabase functions deploy <名稱> --project-ref dmkxjawjrmltmrmkebbs --use-api
  ```
- **`ecpay-webhook` 要加 `--no-verify-jwt`**（綠界不帶 token）。
- **`pcb-export` 與 `create-order` 絕對不要加**（它們靠身分決定給不給）。
- `--use-api` 是必要的：本機 Docker daemon 沒在跑，預設走 Docker 會失敗。
- webhook 的回應規則：**任何 DB 失敗都不准回 `1|OK`**。回了就等於告訴綠界「錢收下、事辦好了」，
  而使用者的 VIP 沒開通，且沒有第二次機會。

### `vendor/`

- 檔案內容與 `vendor/README.md` 記的 SHA-256 必須相符，`vendor-check.js` 在 CI 顧著。
- `.gitattributes` 把 `vendor/**` 標成 `-text`，git 不准改換行（否則雜湊在 Linux CI 會對不上）。
- **`pdf-3.11.174.worker.min.js` 的檔名不能改**。pdf.js 沒設 `workerSrc` 時會拿主檔名把
  `.min.js` 換成 `.worker.min.js` 去猜路徑，改名就整個解析失敗。

---

## 4. 只存在本機、不在 git 的報告（重要）

repo 是**公開**的，所以「還沒修好的問題清單」不能進 git：

| 檔 | 內容 |
|---|---|
| `SECURITY-AUDIT-D1.md` | D1 資安總檢，D-1～D-9 編號與修復狀態 |
| `SANDBOX-VERIFY.md` | 綠界驗證進度，哪幾項驗過、哪幾項沒有 |
| `BACKUP-RESTORE-DRILL.md` | 備份還原的 runbook 與驗收條件 |

**找到新的資安問題：寫進本機報告，不要 commit。** 只有「修好了」的東西才進 git。
`.gitignore` 已擋 `SECURITY-AUDIT-*.md`、`SANDBOX-VERIFY.md`、`BACKUP-RESTORE-DRILL.md`、
`supabase-dump-*.sql`、`supabase-auth-*.sql`。

---

## 5. 檢查（CI 28 關的本地版）

```bash
# 金流與權限
node ecpay-config.test.mjs        # live 不准 fallback 沙盒
node plan-dates.test.mjs          # 續購不吃掉剩餘天數、月底不溢位

# 前端供應鏈與 CSP
node vendor-check.js --strict     # 不准回頭用 CDN；vendor 雜湊要相符
node csp-hash.js --check          # inline script 雜湊要與 _headers 同步

# 線路圖
node net-label.test.js            # net 命名與電壓（含 vrail 不參與命名）
node circuit-check.js --strict
node svg-overlap-check.js --strict
node wire-gap-check.js --selftest && node wire-gap-check.js --strict
node symbol-overlap-check.js --selftest && node symbol-overlap-check.js --strict
node knowledge-art-audit.js --strict --quiet

# PCB
node gerber-check.js              # 8 片公版、473 條結構與幾何斷言
node pcb-logic.test.js
node reffp-check.js

# 資料與抽取
node ds-compare.test.js
node pin-extract.test.js

# 四語
node i18n-check.js
node ui-i18n-check.js --strict
node html-i18n-check.js --strict
node art-i18n-check.js --strict
node interview-i18n-check.js --strict
node news-i18n-check.js --strict
node art-lang-render.test.js

# 面試題圖
node interview-diagram-check.test.js && node interview-diagram-check.js
node knowledge-format.test.js
```

改圖或改譯文要跑四語版本：

```bash
for L in en ja ko; do
  node svg-overlap-check.js --strict --lang=$L
  node circuit-check.js --strict --lang=$L
  node knowledge-art-audit.js --strict --quiet --lang=$L
  node wire-gap-check.js --strict --lang=$L
  node symbol-overlap-check.js --strict --lang=$L
done
```

**棘輪帳只准降不准升**，每語一份基線（`*-baseline.en/ja/ko.json`）。

---

## 6. 使用者要你怎麼做事

- **給證據，不要給保證。** 他吃「我跑了 X，輸出是 Y」，不吃「應該可以了」。
- **要他跑指令／SQL 時，內容直接貼進對話**（硬規矩 8）。
- **他會自己實測，而且會抓到你漏的**。PDF→IC、2nd source 比對都是他先發現不能用。
- **他推翻你的建議時，那是他的決定**，照做並講清楚代價，不要再勸一次。
- **不要順手重構沒叫你動的東西。**

---

## 7. 已知缺陷（有畫面但不能用／不可信）

**這一段最重要。** 這個 repo 有一種反覆出現的失敗模式：功能有 UI、按下去有反應、但結果錯或沒用。
推廣期間這種東西比「沒有功能」傷害更大。

| 功能 | 實際狀況 |
|---|---|
| **2nd source 比對** | 🟢 **可以拿去用了（推廣時講「差異與注意事項」，不要講「判定可換」）**。報告的重點是**換料注意事項**：把差異翻成線路上的動作，分三級（要動線路／要人工確認／參考）。現在認得 7 類會改到板子的差異：I/O 內建上拉、5V 耐受、中斷腳開汲極、散熱墊（含須接地）、未使用腳可否浮接、內建功能（軟啟動／補償／振盪器／bootstrap／UVLO／過溫）、I/O 上電預設，加上電源與溫度範圍、腳數。抽不到的一律講「要人工確認」，不留白帶過。真實案例 PCA9555A(NXP)→PCA9535(TI)：pin-to-pin 但 TI 明寫「removal of the internal I/O pullup resistor」，報告標紅要求每支外加上拉，並抓出電源下限 1.65V→2.3V。五份真 datasheet 迴歸在 `tools/ds-compare/fixtures/`，`ds-compare.test.js` 145 passed。**報告本身**：一個檔案裡四語（純 CSS 切換、無 JavaScript，另存或列印都不會壞），兩邊都沒抽到的參數不佔表格列、改用一行註腳列出名字（並註明「不代表兩顆相同」）。**沒有比**：暫存器內容、I2C 時序、IOL/IOH、ESD、熱阻數值——報告最後一條會自己講。**盲測（2026-08-21，`IC-spec/` 底下沒參與開發的 8 份）**：抽取數 0~10/21，其中掃描檔（BD335，chars=3）正確判為無文字層；抓到並修掉 5 個誤判（VS 量測條件當工作電壓、Die Pad 座標表當散熱墊、圖說「Fig. 8.4 R DS(ON)」當 8.4 Ω、MIN TYP MAX 的溫度取到 typ、料號排列不同誤報對不上）。**外部檔案的抽取率會比這五份低，這是預期**——規則對得上的寫法才抽得到，對不上就留白。 |
| **datasheet PDF 抽腳位** | 🟡 193 顆實測：完全正確 77、部分正確 37、錯得多 34、明講讀不出來 35。抽不到會拒絕填入（不會給錯的），但正確率不到四成。跨多頁大表只抽得到前幾腳 |
| **OrCAD Tcl 匯出** | 🟡 程式碼自己的註解寫著「建 pin API 依版本微調」——是樣板不是成品 |
| **KiCad 符號匯出** | 🟢 結構驗過（括號平衡、腳數 5／17／207 全對、無 NaN），但**沒有人用真的 KiCad 開過** |
| **PCB 進階功能** | ⬜ 差分對、等長蛇形、疊層、背鑽在 `pcb-stackup.js` 等檔裡有實作，但**沒有實際操作驗證過** |
| **贊助流程** | ⬜ `plan='sponsor'` 只入帳不發權益那條路從沒實測。金額上下限（30–30000）也沒驗 |
| **備份還原** | ⬜ `restore-drill.sh` 寫好並用合成 dump 自我驗證過，但**沒有跑過真的 artifact** |

**沒有 Allegro SKILL 匯出。** 只有 json / kicad / csv（OLB pin 清單）/ tcl 四種。
（曾經在文案草稿裡寫錯，記在這裡免得再犯。）

---

## 8. 剩下的工作

### 卡使用者（外部／只有他能做）

| # | 事 | 說明 |
|---|---|---|
| A-4 | **稅籍登記** | **唯一有時鐘在走的**。已在收錢，綠界的交易紀錄會報給國稅局。要問國稅局：起徵點、達標後多久要登記、營業場所可否為住家、免用統一發票的門檻 |
| B-2 | 電子發票 | **卡在 A-4**。沒有稅籍登記不能開統一發票，現在做是白工。他手上的「電子收據」金鑰是另一種東西，不能取代發票 |
| — | 備份還原演練 | 下載 artifact 後跑 `./restore-drill.sh <public> <auth>`（Git Bash） |
| — | 沙盒剩餘項 | 贊助 NT$30 一次可同時驗完「只入帳不發權益」與金額下限 |

### 可自主做

| 優先 | 項目 |
|---|---|
| **1** | **注意事項再長幾條**（已有 7 類，加法照 `iopull` 那條寫、四語字串在 `L.*.note`）。還缺：I2C 位址範圍是否相同、輸出驅動能力 IOL/IOH、上電時序與 POR 門檻、暫存器預設值。另有一個已知限制：兩欄排版的 datasheet 會把右欄併進同一列，跨欄的敘述抓不到（RT6150 的「internal soft-start」就是被右欄切斷，改用規格表的 tSS／fOSC 當證據繞過）。要根治得做欄位重排 |
| **2** | **補 49 顆 IC 的 `secondSource` 準則**（`ic-data.js`；用 `ic-crit-i18n-data.js` 既有片語就不必另外翻四語。準則裡要有「內建上拉一致」這類會改到外部電路的條件） |
| 3 | 腳位抽取正確率（77/193）與跨頁大表 |
| 4 | C-1 付費知識卡月更（每月 5 張）——**付費頁面的承諾，收錢後是契約義務** |
| 5 | 面試題庫擴充｜知識卡產品卡填充 |
| 6 | `page_views` 保留期清理（推廣後這張表長最快） |

### 使用者要列清單才能動

- 表達不清的知識卡（哪幾張）
- 有問題的 IC 料號（哪幾顆）

### 已評估、決定不做

- **PCB 編輯器搬後端**：129KB 互動編輯器搬後端會變慢變貴，而且沒必要。已改成擋「產出」（Gerber）
  不擋「操作」。編輯器程式碼公開是 web app 的本質，不是缺陷。

---

## 9. 額度與成本

Supabase 免費層（2026-08-19 查證）：

| 項目 | 上限 | 實測 |
|---|---|---|
| Egress | 5 GB/月 | **未登入訪客瀏覽 = Supabase 0 KB**（靜態內容全走 Cloudflare）。只有登入後拉資料庫才算 |
| 資料庫 | 500 MB | 目前整庫壓縮後約 60 KB。`page_views` 會隨推廣一直長 |
| Edge Function | 500,000 次/月 | 不會撞到 |
| MAU | 50,000 | 不會撞到 |
| 閒置暫停 | 1 週 | `keepalive.yml` 每週一四擋著 |

**egress 不是「多少人來看網頁」**，是「多少人登入後用到需要資料庫的功能」。
每月看一次 Dashboard → Settings → Usage 即可。

---

## 教訓

- 2026-08-20 | 移植 Gerber 產生器 | 「改動不影響輸出」是假設不是證據 | 搬程式碼時寫一支新舊逐位元組比對的臨時測試，跑完再刪
- 2026-08-20 | 寫偵測器 | 掃 HTML 屬性時沒剔除 `<script>` 與註解，把自己寫的說明文字當成 `onclick=` 抓出來 | 掃 markup 前先 strip script 與 comment
- 2026-08-20 | 用 PowerShell 跑 initdb | `pwsh` 下 `initdb`／`pg_ctl` 走管線會卡住好幾分鐘且無輸出，同樣指令在 Git Bash 正常 | 這台機器的 PostgreSQL 工具用 Bash 跑，不用 PowerShell
- 2026-08-20 | 寫腳本改檔 | 用 python replace 改檔但沒驗證有沒有真的替換到，腳本照樣印「已完成」 | 改檔腳本要 assert 找得到目標，或改後 grep 驗證
- 2026-08-20 | 寫腳本改檔 | python 非 raw 字串裡的 `\b` 會變成退格字元，寫進 JS 就成了「永遠不匹配」的 regex，而且 `cat` 看起來完全正常 | 產生程式碼的字串一律用 raw string，改完用 `JSON.stringify` 印出該行核對
- 2026-08-21 | 報告視窗的列印鈕沒反應 | `window.open` + `document.write` 出來的文件會**繼承母頁的 CSP**，inline `onclick` 與 inline `<script>` 都被擋掉（在 hardware-ai.org 上實測確認，本機 http.server 沒有 CSP 所以測不出來） | 要在那種視窗裡綁事件，從開啟者用 `addEventListener` 掛；報告類 HTML 的互動優先用純 CSS 做
- 2026-08-21 | 只拿手上幾份 datasheet 調規則 | 規則會不知不覺長成那幾份的形狀。拿沒看過的檔案盲測，一次就抓到 5 個誤判（且都是「抽到錯的值」這一類） | 抽取類功能改完，固定拿 `IC-spec/` 裡沒用過的檔跑一輪盲測，只看有沒有離譜值，不調規則去迎合單一檔案
- 2026-08-20 | 抽 datasheet 溫度抽不到 | PDF 用 Symbol 字型畫符號時，pdf.js 抽出來是私有區字元（U+F000＋原碼位）：負號 U+F02D、度數 U+F0B0、µ 是 U+F06D。畫面上看起來只是「少了幾個字」，實際上整條規格都比對不到 | 抽 PDF 文字先做私有區還原（`unpua()`），只還原意義明確的符號，其餘換空白
- 2026-08-20 | 2nd source 的重點 | 使用者指出：pin-to-pin 很容易被當成可以直接換，但報告不知道原設計長什麼樣，所以真正該輸出的是「哪裡不同、線路上要注意什麼」，不是一個可換／不可換的判定 | 這類功能先問「使用者拿它去做什麼決定」，再決定要抽什麼參數
- 2026-08-20 | 抽 datasheet 參數 | 舊版把整頁 items join 成一行，`[^\n]{0,40}` 於是跨欄抓到隔壁的測試條件（IQ 抓到「I OUT = 0mA」） | PDF 轉文字要先依 y 併列；抽數值一律要求「數值與單位相鄰」
- 2026-08-19 | 額度白名單 | 憑印象列了不存在的格式名，差點擋掉真正在用的 `csv` | 白名單類的清單要從程式碼實際查證，不要憑印象
- 2026-08-18 | 驗收自己的修改 | 只測了「該被擋的有沒有被擋」，沒測「該通過的有沒有通過」，差點讓付費客戶也被鎖在門外 | 權限類改動一定要正反兩面都測
