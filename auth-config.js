// === Supabase 設定 ===
// 1) 到 https://supabase.com 開免費專案
// 2) Project Settings → API：複製 Project URL 與 anon public key 貼到下面
// 3) 只能放 anon(公開)金鑰；service_role 金鑰「絕對不可」放前端
// 未填時 App 自動以「本機 demo 模式」運作（不連雲、只用 localStorage）。
window.AUTH_CONFIG = {
  url: 'YOUR_SUPABASE_URL',
  anonKey: 'YOUR_SUPABASE_ANON_KEY'
};
