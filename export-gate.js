/**
 * export-gate.js — 匯出額度閘門（前端側）
 * vs-adapters.js 匯出前會呼叫 window.ExportGate.consume(exportType)。
 * 行為：
 *   - 未設定 Supabase（AUTH_CONFIG 空）→ 本機 demo 模式，直接放行。
 *   - 已設定但未登入 → 擋下，請使用者登入。
 *   - 已登入 → 呼叫 RPC consume_export_quota（原子扣額；月鍵由伺服器算）。
 * 安全：真正的限制在 Postgres RPC + RLS（見 supabase/sql/export-quota.sql）。
 *       這裡只是介面層 —— 就算使用者改前端 JS 繞過這檔，RPC 不扣額就拿不到「已授權」結果；
 *       之後把「檔案生成」搬進 Edge Function 後，繞過前端連檔案都拿不到。
 */
window.ExportGate = (function () {
  // analytics：匯出是核心轉換動作，這裡是所有格式的唯一咽喉 → 埋一處抓全漏斗。靜默失敗。
  const track = n => { try { window.Observe && window.Observe.track(n); } catch (e) { } };

  function localPass() { return { allowed: true, remaining: -1, reason: 'local' }; }

  async function consume(exportType) {
    if (!window.Auth || !window.Auth.enabled()) { track('export:' + exportType); return localPass(); } // demo 模式
    const u = await window.Auth.user();
    if (!u) { track('gate:login'); return { allowed: false, remaining: 0, reason: 'not_authenticated' }; }
    const { data, error } = await window.Auth.raw().rpc('consume_export_quota', { p_export_type: exportType });
    if (error) return { allowed: false, remaining: 0, reason: 'rpc_error: ' + error.message };
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return { allowed: false, remaining: 0, reason: 'rpc_empty' };
    const res = { allowed: !!row.allowed, remaining: row.remaining, reason: row.reason };
    track(res.allowed ? 'export:' + exportType : 'gate:quota');   // 額度用完＝最強升級訊號
    return res;
  }

  // 只查不扣（UI 顯示「本月剩 N 次」）
  async function check(exportType) {
    if (!window.Auth || !window.Auth.enabled()) return localPass();
    const u = await window.Auth.user();
    if (!u) return { allowed: false, remaining: 0, reason: 'not_authenticated' };
    const { data, error } = await window.Auth.raw().rpc('get_export_quota', { p_export_type: exportType });
    if (error) return { allowed: false, remaining: 0, reason: 'rpc_error: ' + error.message };
    const row = Array.isArray(data) ? data[0] : data;
    return { allowed: (row && row.remaining > 0), remaining: row ? row.remaining : 0, reason: row ? row.plan : 'unknown' };
  }

  return { consume, check };
})();
