/**
 * knowledge-art-i18n.js — 知識卡「圖內文字」的四語字典
 *
 * key 是圖上的中文原文（逐字，含全形括號與標點），value 是 en/ja/ko。
 * 用的人：knowledge-circuits2.js 的 tr()（80 張自動圖）、knowledge.js 的 CircuitSVG._S()（26 張掛卡的圖）。
 * 查不到 key 或該語言是空字串 → 回中文原文。所以字典缺條目不會讓圖畫不出來，只會那條維持中文；
 * `art-i18n-check.js` 負責把「還沒翻的」數出來，CI 不准有漏。
 *
 * ⚠ 寫譯文的鐵律（違反就是製造重疊）：
 *   1. **越短越好**。中文一個字約等於字級 1.0，英數約 0.52 → 中文 8 字 ≈ 英文 15 字元的寬度。
 *      超過這個比例，字就會壓到旁邊的圖形，而圖的座標是手排的、不會跟著讓開。
 *   2. **不要翻訊號名、料號、封裝、單位、公式**：VOUT、C_BOOT、TPS65185、QFN、µs、ΔI 一律原樣。
 *   3. 專有名詞照 IEEE/JEDEC 慣用寫法，不要自創（Deadtime 不要寫成 dead-band）。
 *   4. 標點用該語言的：中文「，（）」→ 英文 ", ()"；日文「、（）」；韓文 ", ()"。
 *   5. 改完一定要跑四語幾何檢查（見 HANDOFF.md §1）。
 */
(function () {
  const D = {
  };
  (typeof window !== 'undefined' ? window : globalThis).ART_I18N = D;
})();
