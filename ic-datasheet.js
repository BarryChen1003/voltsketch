// datasheet 連結解析（線上版）。
//
// 為什麼要這支：`IC-spec/` 在 gitignore（255 個 PDF、718 MB，不上 GitHub Pages），
// 所以任何指向 `IC-spec/xxx.pdf` 的連結線上一律 404。改成指原廠網址。
//
// 規則的依據（2026-08-14 對元件庫 196 顆逐一發 HTTP 請求驗過，不是憑印象組網址）：
//   183 顆 https://www.ti.com/lit/ds/symlink/<料號>.pdf → 200 且 content-type: application/pdf
//    13 顆 404 —— 都不是 TI 的料（Microchip / Winbond / Nexperia / ADI / Silabs …）
// 假料號會正確回 404（拿 `zzzznotarealpart123` 驗過），所以這不是「什麼都給 200」的路徑。
//
// 新增料號時如果不是 TI 的，請填 `datasheetUrl`（ic-manager 的欄位），
// 或把料號加進下面 NOT_TI；否則會產出一個指向 TI 的死連結。
(function (root) {
  'use strict';

  var TI_BASE = 'https://www.ti.com/lit/ds/symlink/';

  // 實測 404 的 13 顆。放這裡是為了「不給錯的連結」，不是為了排除誰。
  var NOT_TI = [
    'KSZ9031RNX', 'LAN8710A', '74LVC4066_Q100', 'W25Q128JV', 'ds1230y',
    'AXP209', 'drv7167', 'NX48P0407', 'RT6150', 'slg59h1403c',
    'X4003', 'ADG601_602', 'EFR32BG24L'
  ].map(function (s) { return s.toLowerCase(); });

  function norm(p) { return String(p == null ? '' : p).trim().toLowerCase(); }

  function isHttp(u) { return typeof u === 'string' && /^https?:\/\//i.test(u); }

  // part：料號字串（元件庫還沒建檔的料也給得出來）
  // ic  ：ic-data.js 的那筆資料，可為 null
  // 回傳 https 網址，或 null（表示我們沒有可信的連結，呼叫端就別放連結）
  function datasheetUrl(part, ic) {
    if (ic) {
      // 自訂 IC 由使用者填的網址優先；ic-data.js 的 `datasheet` 是本機路徑，只在它是網址時才採用
      if (isHttp(ic.datasheetUrl)) return ic.datasheetUrl;
      if (isHttp(ic.datasheet)) return ic.datasheet;
    }
    var p = norm(part || (ic && ic.part));
    if (!p) return null;
    if (NOT_TI.indexOf(p) !== -1) return null;
    return TI_BASE + encodeURIComponent(p) + '.pdf';
  }

  function isKnownNonTi(part) { return NOT_TI.indexOf(norm(part)) !== -1; }

  root.ICDatasheet = { TI_BASE: TI_BASE, datasheetUrl: datasheetUrl, isKnownNonTi: isKnownNonTi };
})(typeof window !== 'undefined' ? window : globalThis);
