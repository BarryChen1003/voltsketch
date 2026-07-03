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

  return {
    enabled() { return ready; },
    raw() { return client; },
    async signUp(email, pw) { return client.auth.signUp({ email, password: pw }); },
    async signIn(email, pw) { return client.auth.signInWithPassword({ email, password: pw }); },
    async oauth(provider) { return client.auth.signInWithOAuth({ provider, options: { redirectTo: location.origin + location.pathname } }); },
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
    // 權限/解鎖旗標（表 profiles: id uuid PK = auth.uid, pcb_access bool, interview_paid bool, role text）
    async entitlements() {
      const u = await this.user(); if (!u) return {};
      const { data } = await client.from('profiles').select('pcb_access, interview_paid, role').eq('id', u.id).maybeSingle();
      return data || {};
    },
    async isAdmin() { const e = await this.entitlements(); return e.role === 'admin'; },
    // 面試題庫：RLS 限 interview_paid=true（或 admin）才 SELECT 到列。未授權回空陣列。
    async getInterviewQuestions() {
      if (!ready) return null;
      const u = await this.user(); if (!u) return null;
      const { data, error } = await client.from('interview_questions')
        .select('category, question, answer, question_en, answer_en').order('id', { ascending: true });
      if (error) return null;
      return data || [];
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
