-- owner-grant.sql — 站主帳號全權限（smallshark1003@gmail.com）
-- 使用時機：站主先在網站上完成註冊/登入一次（auth.users 有列後），
--           再到 Supabase Dashboard → SQL Editor 執行本檔（執行一次即可）。
-- 效果：profiles.role='admin'（plan.js / interview RLS / pcb RLS 全通）
--       + user_plans 保險（匯出額度 9999、unlock_all、永不過期）。

-- 1) profiles：admin 角色 + 面試題 + PCB 旗標
insert into public.profiles (id, role, interview_paid, pcb_access)
select id, 'admin', true, true
from auth.users
where email = 'smallshark1003@gmail.com'
on conflict (id) do update
  set role = 'admin', interview_paid = true, pcb_access = true;

-- 2) user_plans：匯出額度實質不限、全解鎖、永不過期
insert into public.user_plans (user_id, plan, monthly_export_limit, plan_expires_at, unlock_all)
select id, 'owner', 9999, null, true
from auth.users
where email = 'smallshark1003@gmail.com'
on conflict (user_id) do update
  set plan = 'owner', monthly_export_limit = 9999,
      plan_expires_at = null, unlock_all = true, updated_at = now();

-- 驗證（應各回 1 列）：
-- select u.email, p.role, p.interview_paid, p.pcb_access
--   from auth.users u join public.profiles p on p.id = u.id
--  where u.email = 'smallshark1003@gmail.com';
-- select u.email, up.plan, up.monthly_export_limit, up.unlock_all
--   from auth.users u join public.user_plans up on up.user_id = u.id
--  where u.email = 'smallshark1003@gmail.com';
