# vendor/ — 自行代管的第三方程式庫

全站不再從 CDN 載入任何腳本。原因（D1 資安總檢 D-4）：CDN 被入侵或帳號被盜時，
對方能改寫我們載入的程式，而 `supabase-js` 是在**付款頁與登入頁**執行的，
能直接讀到使用者的 session token。而且原本 supabase-js 用的是浮動版本 `@2`，
等於每次載入都可能是沒審過的新版本。

下載日期 2026-08-18。只放**實際會部署的頁面**用得到的；
`Ref/hw-engineer-pro.html`（封存檔，`.assetsignore` 擋著不部署）用的 xlsx 與 mammoth 不納入。
要升級版本：重新下載、更新下表的 SHA-256、跑一次 vendor-check.js。

| 檔案 | 來源 | SHA-256 |
|---|---|---|
| `supabase-js-2.112.3.min.js` | https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.112.3/dist/umd/supabase.js | `ec004176d101aec77aeef266aa1c94411287fe2039c65ea5f6c72f5e14b3847d` |
| `pdf-3.11.174.min.js` | https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js | `5b5799e6f8c680663207ac5b42ee14eed2a406fa7af48f50c154f0c0b1566946` |
| `pdf-3.11.174.worker.min.js` | https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js | `feabdf309770ed24bba31a5467836cdc8cf639c705af27d52b585b041bb8527b` |
| `qrcodejs-1.0.0.min.js` | https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js | `c541ef06327885a8415bca8df6071e14189b4855336def4f36db54bde8484f36` |

備註：`pdf-3.11.174.worker.min.js` 的**檔名不能亂改**。pdf.js 在沒有設定
`GlobalWorkerOptions.workerSrc` 時，會拿主檔名把 `.min.js` 換成 `.worker.min.js` 去猜 worker 路徑。
第一版命名成 `pdf.worker-3.11.174.min.js`，猜出來的路徑就不存在，解析 PDF 直接失敗。

備註：`qrcodejs` 是為了取代 `qrcode@1.5.3` —— 站上原本引用的
`.../qrcode@1.5.3/build/qrcode.min.js` 在 CDN 上根本不存在（404），
那個 npm 套件沒有出瀏覽器 bundle。也就是說 `qrcode.html` 從上線以來就是壞的。
兩者 API 不同（`QRCode.toCanvas(el,url,opt)` vs `new QRCode(el,opt)`），呼叫端已一併改寫。
