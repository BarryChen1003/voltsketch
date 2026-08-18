// plan-dates.mjs — 方案到期日的算法。純函式，node 可直接測（測試：plan-dates.test.mjs）。
//
// 為什麼獨立成一個檔：這段算的是「使用者付了錢換到多少天」。算錯就是金錢損害，
// 而且錯法很安靜（沒有人會噴錯，只有客戶發現自己少了幾天）。所以要能離線測。

/**
 * 加 N 個月，月底不要溢位。
 * JS 原生的 setMonth 在 1/31 加一個月會變成 3/2 或 3/3（因為 2/31 不存在會往後滾）。
 * 這裡改成「滾到當月最後一天為止」：1/31 + 1 個月 = 2/28（或閏年 2/29）。
 */
export function addMonths(date, n) {
  const d = new Date(date.getTime());
  const day = d.getUTCDate();
  d.setUTCDate(1);                                  // 先退到 1 號，避免中途溢位
  d.setUTCMonth(d.getUTCMonth() + n);
  const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, lastDay));
  return d;
}

/**
 * 續購後的新到期日。
 *
 * 舊版直接寫「現在 + N 個月」，所以還剩 20 天時續購，那 20 天就被吃掉了。
 * 正確做法是從「現在」與「目前到期日」取較晚者當基準再加。
 *
 * @param currentExpiry 目前的 plan_expires_at（null / 已過期 都當作沒有）
 * @param months        這次購買的月數
 * @param now           現在時間（測試可注入）
 */
export function nextExpiry(currentExpiry, months, now) {
  const t = now instanceof Date ? now : new Date();
  let base = t;
  if (currentExpiry) {
    const cur = currentExpiry instanceof Date ? currentExpiry : new Date(currentExpiry);
    // 無效日期當作沒有，不要讓一個壞字串把到期日算成 NaN
    if (!Number.isNaN(cur.getTime()) && cur.getTime() > t.getTime()) base = cur;
  }
  return addMonths(base, months);
}
