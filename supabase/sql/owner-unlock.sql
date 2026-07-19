-- owner-unlock.sql — 站主一鍵解鎖（確認信箱 + 全權限）
-- 用法：Supabase Dashboard → SQL Editor → 貼上全部 → Run。跑一次即可。
-- 前提：smallshark1003@gmail.com 已在網站按過「註冊」（auth.users 已有此列）。

-- ① 手動確認站主信箱（免收驗證信，Supabase 內建信不可靠）
update auth.users
set email_confirmed_at = now()
where email = 'smallshark1003@gmail.com'
  and email_confirmed_at is null;

-- ② profiles：admin 角色（面試題/PCB RLS 全通、plan.js unlockAll）+ 面試題 + PCB 旗標
insert into public.profiles (id, role, interview_paid, pcb_access)
select id, 'admin', true, true
from auth.users
where email = 'smallshark1003@gmail.com'
on conflict (id) do update
  set role = 'admin', interview_paid = true, pcb_access = true;

-- ③ user_plans：匯出額度 9999、全解鎖、永不過期
insert into public.user_plans (user_id, plan, monthly_export_limit, plan_expires_at, unlock_all)
select id, 'owner', 9999, null, true
from auth.users
where email = 'smallshark1003@gmail.com'
on conflict (user_id) do update
  set plan = 'owner', monthly_export_limit = 9999,
      plan_expires_at = null, unlock_all = true, updated_at = now();

-- ④ 驗證（兩個 select 應各回 1 列，欄位值如註解）
--    email_confirmed_at 非空、role=admin、interview_paid=t、pcb_access=t
select u.email, u.email_confirmed_at, p.role, p.interview_paid, p.pcb_access
  from auth.users u join public.profiles p on p.id = u.id
 where u.email = 'smallshark1003@gmail.com';
--    plan=owner、monthly_export_limit=9999、unlock_all=t
select up.plan, up.monthly_export_limit, up.unlock_all
  from public.user_plans up join auth.users u on u.id = up.user_id
 where u.email = 'smallshark1003@gmail.com';
