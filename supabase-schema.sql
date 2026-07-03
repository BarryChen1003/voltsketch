-- ============================================================
-- VoltSketch 後端 schema（Supabase）— SQL Editor 一次貼上執行
-- 安全核心：所有表開 RLS；解鎖旗標(pcb_access/interview_paid/role)前端「不可」自行寫入。
-- ============================================================

-- ---------- 1) 表 ----------
-- 專案雲端存檔
create table if not exists public.projects (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb,
  updated_at timestamptz default now()
);

-- 使用者權限 / 角色（id = auth.uid）
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  pcb_access boolean default false,
  interview_paid boolean default false,
  role text default 'user'            -- 'user' | 'admin'
);

-- 面試題庫（內容只存後端；未授權帳號 query 不到任何列）。question/answer=繁中，*_en=英文。
create table if not exists public.interview_questions (
  id bigint generated always as identity primary key,
  category text,
  question text not null,
  answer text not null,
  question_en text,
  answer_en text,
  created_at timestamptz default now()
);

-- ---------- 2) 防遞迴的 admin 判斷（SECURITY DEFINER 繞過 RLS，避免 profiles 自參照無限遞迴）----------
create or replace function public.is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.has_interview() returns boolean
language sql security definer stable set search_path = public as $$
  select exists(select 1 from public.profiles
                where id = auth.uid() and (interview_paid = true or role = 'admin'));
$$;

create or replace function public.has_pcb() returns boolean
language sql security definer stable set search_path = public as $$
  select exists(select 1 from public.profiles
                where id = auth.uid() and (pcb_access = true or role = 'admin'));
$$;

-- ---------- 3) 註冊時自動建立 profile 列 ----------
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- ---------- 4) 開 RLS（最重要）----------
alter table public.projects enable row level security;
alter table public.profiles enable row level security;
alter table public.interview_questions enable row level security;

-- projects：只能存取自己的
drop policy if exists "own project" on public.projects;
create policy "own project" on public.projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- profiles：本人或 admin 可讀；本人「不可」改旗標（無 user update policy）
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

-- profiles：只有 admin 可改/授權他人（前端一般帳號改不了 → 真鎖）
drop policy if exists "admin write profile" on public.profiles;
create policy "admin write profile" on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

-- interview_questions：只有 interview_paid 或 admin 才 SELECT 得到列
drop policy if exists "paid read questions" on public.interview_questions;
create policy "paid read questions" on public.interview_questions
  for select using (public.has_interview());

-- interview_questions：只有 admin 可新增/修改題目（你更新內容用）
drop policy if exists "admin manage questions" on public.interview_questions;
create policy "admin manage questions" on public.interview_questions
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- 5) 種子題目 ----------
-- 題目改由 interview-questions-seed.sql 匯入（從 hw-engineer-pro.html 自動抽取，雙語）。
-- 跑完本檔後，再到 SQL Editor 貼上 interview-questions-seed.sql 執行。

-- ============================================================
-- 授權指令（在 SQL Editor 執行；email 換成你的）
--   設自己為 admin：
--     update public.profiles set role='admin'
--       where id = (select id from auth.users where email='barry871003@gmail.com');
--   給某帳號解鎖題庫 / PCB：
--     update public.profiles set interview_paid=true, pcb_access=true
--       where id = (select id from auth.users where email='someone@example.com');
-- ============================================================
