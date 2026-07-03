/**
 * plan.js — 方案/權限查詢（前端快取層）
 * window.Plan.get() → { plan, isVip, unlockAll, knowledgeUnlocked, interviewUnlocked, demo }
 * 權限模型：
 *   free（含方案過期）  → 匯出 3 次/月；熱門知識主題鎖；面試題鎖
 *   vip_1m/3m/6m         → 匯出 30 次/月；熱門知識主題解鎖（每月上新）
 *   vip_12m              → 全解鎖（unlock_all：知識 + 面試題 + PCB 權限）
 * 注意：這是 UX 層。真正的存取控制在後端 —— 面試題靠 RLS（未授權拿不到列）、
 *       匯出靠 RPC 扣額。知識庫內容目前隨前端 JS 出貨，此鎖為軟鎖；
 *       要硬鎖需把內容搬進 Supabase 表（同面試題模式）。
 * 測試：網址帶 ?lockdemo=1 可在 demo 模式強制看「鎖定」畫面。
 */
window.Plan = (function () {
  let cache = null;

  async function get() {
    if (cache) return cache;
    // 上線版：demo 模式（未設 Supabase）「預設鎖定」，與正式權限一致。
    // 站主預覽：?unlock=1 全開（localStorage 記住），?lock=1 恢復鎖定。接 Supabase 後自動走正式權限。
    if (/[?&]unlock=1/.test(location.search)) localStorage.setItem('vs-dev-unlock', '1');
    if (/[?&]lock=1/.test(location.search)) localStorage.removeItem('vs-dev-unlock');
    const devUnlock = localStorage.getItem('vs-dev-unlock') === '1';
    if (!window.Auth || !window.Auth.enabled()) {
      return cache = {
        plan: 'demo', isVip: devUnlock, unlockAll: devUnlock,
        knowledgeUnlocked: devUnlock, interviewUnlocked: devUnlock, demo: true
      };
    }
    const u = await window.Auth.user();
    if (!u) return cache = { plan: 'anon', isVip: false, unlockAll: false, knowledgeUnlocked: false, interviewUnlocked: false, demo: false };

    const c = window.Auth.raw();
    const { data: p } = await c.from('user_plans')
      .select('plan, monthly_export_limit, plan_expires_at, unlock_all')
      .eq('user_id', u.id).maybeSingle();
    const ent = await window.Auth.entitlements();  // profiles: interview_paid / pcb_access / role

    const active = !!p && p.plan !== 'free' &&
      (!p.plan_expires_at || new Date(p.plan_expires_at) > new Date());
    const admin = ent.role === 'admin';
    const unlockAll = admin || (active && !!p.unlock_all);

    return cache = {
      plan: active ? p.plan : 'free',
      isVip: active || admin,
      unlockAll,
      knowledgeUnlocked: unlockAll || active,                 // 任一付費方案解鎖熱門知識
      interviewUnlocked: unlockAll || !!ent.interview_paid,   // 面試題：年付或單獨購買
      demo: false
    };
  }

  function refresh() { cache = null; }
  return { get, refresh };
})();
