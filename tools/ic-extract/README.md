# ic-extract — 建庫用的抽取驗證器

**為什麼有這個目錄**：datasheet 抽出來的值，不管是規則抽的、模型抽的還是人填的，
進 `ic-data.js` 之前都要能被機械覆核。引擎會換，這支不換——它才是「錯的值進不了資料庫」的保證。

前台（訪客上傳兩份 PDF 比對）不會用到這裡的東西，那條路仍然是純規則、瀏覽器端、檔案不上傳。

## 一個「宣稱」長什麼樣

```json
{ "key": "iq", "value": "1.5 µA", "n": 1.5e-6,
  "quote": "Low standby current consumption: 1.5 µA typical", "page": 3 }
```

範圍型用 `lo`/`hi` 取代 `n`。可選欄位：

| 欄位 | 意思 |
|---|---|
| `srcTag: "fromAbsMax"` | 我知道這個值取自絕對最大額定，請照樣收（報告會標出處） |
| `absolute: true` | 我存的是絕對值（IOH 在 datasheet 寫成負的） |
| `textFree: true` | 這一項不要用字面比對驗（顯示值帶單位或括號說明） |

## 四道覆核

| # | 檢查 | 擋掉什麼 |
|---|---|---|
| 1 | `quote` 必須逐字出現在 datasheet（正規化後） | 模型編出來的句子 |
| 2 | 數值必須能從 `quote` 自己重新解析出來，且與宣稱一致 | 引擎的算術或單位換算出錯 |
| 3 | 量級要落在 `ds-compare.js` 的 `BOUNDS` 內 | IQ = 160 mA 這種不可能的值 |
| 4 | `quote` 不能落在 Absolute Maximum／Limiting values 段 | 拿「不可超過值」當工作值 |

文字／旗標型的參數（內建上拉、散熱墊、上電預設…）不用字面比對，改成
**把規則重新跑在 `quote` 上**：光看那一行，是否足以得到同樣的判斷。
引用了不相干的句子會得到 `quote-does-not-support`。

沒過的不是「錯」，是「不可信」：一律降級成未擷取，或送人工看。

## 用法

```bash
# 用現有規則產生宣稱，逐條驗證（基準線）
node tools/ic-extract/run.js datasheets/pca9555a.pdf datasheets/pca9535.pdf

# 驗證別的引擎（模型或人工）產生的宣稱
node tools/ic-extract/run.js --claims claims.json datasheets/pca9555a.pdf

# 只想看某一頁抽出來長怎樣
node tools/ic-extract/pdf-pages.js datasheets/rt6150.pdf 5
```

覆核清單寫到 `tools/ic-extract/out/<檔名>.review.json`（本機產物，不進 git）。
**這支不會去改 `ic-data.js`**——要不要收是人的決定。

## 目前的覆蓋範圍

**全部 21 個參數都會產出出處**，因此都驗得動。多筆出處（`quotes`）用在「好幾列共同支撐
一個判斷」的情況：多種封裝、介面清單、內建功能清單——每一列都要各自在文件裡找得到。

封裝的出處還多一道條件：那一列**自己**就要讀得出這個封裝。
（W25Q128JV 的 `WSON8 6x5-mm` 規則讀不出來，就不會被拿來當 WSON-8 的出處。）

實測（2026-08-21，9 份 datasheet，其中 4 份是開發時沒看過的）：

| 檔 | 宣稱 | 通過 |
|---|---|---|
| PCA9555A / PCA9535 / RT6150 / W25Q128JV / AXP209 | 9–13 | 100% |
| 74LVC4066 / ADG601 / SLG59H1403C（沒看過） | 4–7 | 100% |
| ADS8688W（沒看過） | 9 | 8（ESD 的出處那一列沒有數字 → 擋下） |

## 測試

```bash
node ic-extract.test.js
```

CI 有這一關。測試包含五份真 datasheet 的規則產出必須全部驗得過——
規則哪天退化到「值撐不住出處」，這關會紅。
