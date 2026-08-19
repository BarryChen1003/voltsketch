/**
 * auth.js — Supabase 帳號/雲端存檔包裝。
 * 沒設定金鑰時 enabled()=false，App 以本機 demo 模式運作（不連雲）。
 * 安全：只用 anon 公開金鑰；資料表務必開 RLS（見 SETUP-AUTH.md）。
 */
window.Auth = (function () {
  let client = null, ready = false;
  const cfg = window.AUTH_CONFIG || {};

  function configured() {
    return cfg.url && cfg.anonKey && !/YOUR_/.test(String(cfg.url) + String(cfg.anonKey));
  }
  function init() {
    if (!configured()) return false;
    if (typeof supabase === 'undefined' || !supabase.createClient) return false;
    try { client = supabase.createClient(cfg.url, cfg.anonKey); ready = true; } catch (e) { ready = false; }
    return ready;
  }
  init();

  // analytics：註冊/登入是漏斗頂端；成功才記（靜默失敗、不含 email）
  const obs = n => { try { window.Observe && window.Observe.track(n); } catch (e) { } };

  return {
    enabled() { return ready; },
    raw() { return client; },
    async signUp(email, pw) { const r = await client.auth.signUp({ email, password: pw }); if (r && !r.error) obs('signup'); return r; },
    async signIn(email, pw) { const r = await client.auth.signInWithPassword({ email, password: pw }); if (r && !r.error) obs('login'); return r; },
    async oauth(provider) { obs('oauth:' + provider); return client.auth.signInWithOAuth({ provider, options: { redirectTo: location.origin + location.pathname } }); },
    // 註冊驗證用 6 位數驗證碼，不是點連結。
    // 為什麼：連結在手機上常被信件 App 用內建瀏覽器打開 → session 落在那個瀏覽器裡，
    // 使用者切回原本的分頁還是「沒登入」。驗證碼從頭到尾都在同一個瀏覽器。
    // 對應的信件模板必須用 {{ .Token }}（見 supabase/email-templates/confirm-signup.html）。
    async verifySignup(email, token) {
      const r = await client.auth.verifyOtp({ email, token: String(token).trim(), type: 'signup' });
      if (r && !r.error) obs('verify_signup');
      return r;
    },
    async resendSignup(email) { return client.auth.resend({ type: 'signup', email }); },
    async reset(email) { return client.auth.resetPasswordForEmail(email, { redirectTo: location.origin + '/login.html' }); },
    async updatePassword(pw) { return client.auth.updateUser({ password: pw }); },
    async signOut() { try { return await client.auth.signOut(); } catch (e) { } },
    async user() {
      if (!ready) return null;
      try { const { data } = await client.auth.getUser(); return data.user || null; } catch (e) { return null; }
    },
    onChange(cb) { if (ready) client.auth.onAuthStateChange((_e, s) => cb(s && s.user || null)); },
    // 雲端專案存/讀（表 projects: user_id uuid PK, data jsonb, updated_at）
    async saveProject(json) {
      const u = await this.user(); if (!u) throw new Error('未登入');
      return client.from('projects').upsert({ user_id: u.id, data: json, updated_at: new Date().toISOString() });
    },
    async loadProject() {
      const u = await this.user(); if (!u) return null;
      const { data } = await client.from('projects').select('data').eq('user_id', u.id).maybeSingle();
      return data ? data.data : null;
    },
    // 有效權限。走 my_entitlements() RPC，因為那支會比對 user_plans.plan_expires_at。
    // profiles 上的 pcb_access / interview_paid 記的是「買過」，不是「現在還有效」——
    // 它們只會被設成 true、從來不會設回 false，直接讀等於付一次就永久有效。
    // RPC 不存在時（entitlements-expiry.sql 還沒跑）退回舊的直接讀，站台照常運作，
    // 但**那條路不會檢查到期**。
    async entitlements() {
      const u = await this.user(); if (!u) return {};
      try {
        const { data, error } = await client.rpc('my_entitlements');
        if (!error && data) {
          const r = Array.isArray(data) ? data[0] : data;
          if (r) return r;
        }
      } catch (e) { /* 落到下面的舊路徑 */ }
      const { data } = await client.from('profiles').select('pcb_access, interview_paid, role').eq('id', u.id).maybeSingle();
      return data || {};
    },
    async isAdmin() { const e = await this.entitlements(); return e.role === 'admin'; },
    // 面試題庫：RLS 限 interview_paid=true（或 admin）才 SELECT 到列。未授權回空陣列。
    async getInterviewQuestions() {
      if (!ready) return null;
      const u = await this.user(); if (!u) return null;
      // 先嘗試含 ja/ko 欄位（interview-i18n.sql 執行後存在）；失敗回退舊欄位集
      let r = await client.from('interview_questions')
        .select('category, category_en, category_ja, category_ko, question, answer, question_en, answer_en, question_ja, answer_ja, question_ko, answer_ko')
        .order('id', { ascending: true });
      if (r.error) r = await client.from('interview_questions')
        .select('category, question, answer, question_en, answer_en').order('id', { ascending: true });
      if (r.error) return null;
      return r.data || [];
    },
    // 呼叫 Edge Function（帶登入 JWT；後端再驗 pcb_access）。失敗回 null 讓前端降級。
    async callFn(name, body) {
      if (!ready) return null;
      try {
        const { data, error } = await client.functions.invoke(name, { body });
        if (error) return null;
        return data;
      } catch (e) { return null; }
    }
  };
})();
