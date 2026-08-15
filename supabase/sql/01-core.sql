-- ============================================================
-- 00-RUN-phaseA.sql — 【一次貼上執行】HardwareAI 後端 Phase A
-- 由 Claude 依相依順序自動串接（2026-07-21）。全部冪等，可重跑。
-- 用法：Supabase Dashboard → SQL Editor → 貼上「整份」→ Run。
-- Phase B（owner-unlock：設站主 admin＋手動確認信箱）另跑，見 RUN-ORDER.md，
--         因為它需要你先在網站按過一次「註冊」（auth.users 要先有列）。
-- ============================================================



-- 核心建表：profiles / 觀測 / orders / 額度。**先跑這支**，站主流程（註冊→owner-unlock）就通了。
-- ╔══════════════════════════════════════════════════════════
-- ║ 段落來源：supabase-schema.sql
-- ╚══════════════════════════════════════════════════════════
-- ============================================================
-- HardwareAI 後端 schema（Supabase）— SQL Editor 一次貼上執行
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
-- ╔══════════════════════════════════════════════════════════
-- ║ 段落來源：supabase-observability.sql
-- ╚══════════════════════════════════════════════════════════
-- ============================================================
-- HardwareAI 觀測性 schema：前端錯誤日誌 + 輕量 analytics
-- Supabase SQL Editor 一次貼上執行（依賴 supabase-schema.sql 已建的 public.is_admin()）。
-- 設計：anon 可 INSERT（前端寫入），只有 admin 可 SELECT（隱私：用戶讀不到別人的日誌）。
-- 誠實界定：anon 可寫＝任何拿到公開 anonKey 的人都能塞列。前端已做去重+每 session 上限，
--   但這不是伺服器級防濫用；真要擋洪水需 Edge Function 限流。金流上線後若見異常量再加。
-- ============================================================

-- ---------- 1) 前端錯誤日誌 ----------
create table if not exists public.error_logs (
  id         bigint generated always as identity primary key,
  created_at timestamptz default now(),
  kind       text,          -- 'error' | 'unhandledrejection'
  message    text,          -- 已截斷 ~500 字
  source     text,          -- 出錯檔 URL
  lineno     int,
  colno      int,
  stack      text,          -- 已截斷 ~2000 字
  page       text,          -- location.pathname（不含 query，避免 PII）
  ua         text,          -- navigator.userAgent（已截斷）
  sid        text,          -- 隨機 session id（非帳號、非可追人）
  ver        text           -- app 版本標記（選填）
);
create index if not exists error_logs_created_idx on public.error_logs (created_at desc);

-- ---------- 2) 輕量 analytics（pageview + 自訂事件）----------
create table if not exists public.page_views (
  id         bigint generated always as identity primary key,
  created_at timestamptz default now(),
  kind       text default 'pageview',  -- 'pageview' | 'event'
  name       text,                      -- 事件名（pageview 時為 null）
  path       text,                      -- location.pathname
  ref        text,                      -- document.referrer 的「host only」（不存完整 URL）
  lang       text,
  vw         int,                       -- viewport 寬
  vh         int,                       -- viewport 高
  sid        text                       -- 隨機 session id
);
create index if not exists page_views_created_idx on public.page_views (created_at desc);

-- ---------- 3) RLS：anon 只能 INSERT，admin 才能 SELECT ----------
alter table public.error_logs enable row level security;
alter table public.page_views enable row level security;

-- error_logs
drop policy if exists "anon insert errors" on public.error_logs;
create policy "anon insert errors" on public.error_logs
  for insert to anon, authenticated with check (true);

drop policy if exists "admin read errors" on public.error_logs;
create policy "admin read errors" on public.error_logs
  for select using (public.is_admin());

-- page_views
drop policy if exists "anon insert views" on public.page_views;
create policy "anon insert views" on public.page_views
  for insert to anon, authenticated with check (true);

drop policy if exists "admin read views" on public.page_views;
create policy "admin read views" on public.page_views
  for select using (public.is_admin());

-- ---------- 4) 給你看資料的方便 view（admin 才讀得到內容，RLS 續生效）----------
-- 近 7 天錯誤彙總（同訊息合併計數）
create or replace view public.error_summary as
  select message, source, count(*) as n, max(created_at) as last_seen
  from public.error_logs
  where created_at > now() - interval '7 days'
  group by message, source
  order by n desc;

-- 近 7 天各頁瀏覽量
create or replace view public.pageview_summary as
  select path, count(*) filter (where kind='pageview') as views,
         count(distinct sid) as sessions, max(created_at) as last_seen
  from public.page_views
  where created_at > now() - interval '7 days'
  group by path
  order by views desc;

-- ---------- 5)（選用）保留期清理：手動或用 pg_cron 定期跑，避免免費層爆容量 ----------
-- delete from public.error_logs where created_at < now() - interval '90 days';
-- delete from public.page_views  where created_at < now() - interval '180 days';
-- ╔══════════════════════════════════════════════════════════
-- ║ 段落來源：payment.sql
-- ╚══════════════════════════════════════════════════════════
-- ============================================================
-- payment.sql — 訂單表（綠界 ECPay 金流）
-- 用法：Supabase SQL Editor 執行（冪等）。
-- 安全：client 只能讀自己的訂單；建立/更新只由 Edge Function（service_role）做。
--       金額/方案在 create-order Function 後端決定，不信前端。
-- ============================================================

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trade_no text not null unique,          -- MerchantTradeNo（<=20 字）
  plan text not null,                     -- 'vip_monthly' 等（型錄在 create-order）
  amount integer not null,                -- 新台幣元
  status text not null default 'pending', -- pending | paid | failed
  ecpay_trade_no text,                    -- 綠界交易編號（webhook 回填）
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

drop policy if exists "read own orders" on public.orders;
create policy "read own orders" on public.orders
  for select to authenticated using (auth.uid() = user_id);

-- 不建 insert/update policy：寫入一律由 Edge Function 以 service_role 執行。
-- ╔══════════════════════════════════════════════════════════
-- ║ 段落來源：export-quota.sql
-- ╚══════════════════════════════════════════════════════════
-- ============================================================
-- export-quota.sql — 匯出額度閘門（HardwareAI）
-- 用法：Supabase Dashboard → SQL Editor → 貼上執行（可重跑，冪等）。
-- 安全設計：
--   1. RLS 全開；client 只能 SELECT 自己的列，不能 INSERT/UPDATE。
--   2. 扣額度只能走 consume_export_quota RPC（security definer、原子、FOR UPDATE）。
--   3. month_key 由伺服器計算（to_char(now(),'YYYY-MM')），不收 client 參數 ——
--      否則 client 傳未來月份就能拿到新額度。
--   4. anon 不可執行 RPC；只有 authenticated。
-- ============================================================

-- ---- 資料表 ----
create table if not exists public.user_plans (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free',
  monthly_export_limit integer not null default 3,
  plan_expires_at timestamptz,              -- null = 不過期（free 或永久）
  unlock_all boolean not null default false,-- 年付：全解鎖（知識/面試/PCB）
  updated_at timestamptz not null default now()
);
-- 舊表升級（冪等）
alter table public.user_plans add column if not exists plan_expires_at timestamptz;
alter table public.user_plans add column if not exists unlock_all boolean not null default false;
alter table public.user_plans alter column monthly_export_limit set default 3;

create table if not exists public.export_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month_key text not null,
  export_type text not null,
  count integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, month_key, export_type)
);

-- ---- RLS：只讀自己的，寫入一律走 RPC ----
alter table public.user_plans enable row level security;
alter table public.export_usage enable row level security;

drop policy if exists "read own plan" on public.user_plans;
create policy "read own plan" on public.user_plans
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "read own usage" on public.export_usage;
create policy "read own usage" on public.export_usage
  for select to authenticated using (auth.uid() = user_id);

-- 注意：故意不建 insert/update policy → client 直接寫會被 RLS 擋。

-- ---- RPC：原子扣額度 ----
create or replace function public.consume_export_quota(p_export_type text)
returns table(allowed boolean, remaining integer, reason text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_month text := to_char(now(), 'YYYY-MM');   -- 伺服器算，不信 client
  v_limit integer;
  v_count integer;
begin
  if v_user is null then
    return query select false, 0, 'not_authenticated'; return;
  end if;
  if p_export_type is null or length(p_export_type) > 32 then
    return query select false, 0, 'bad_export_type'; return;
  end if;

  -- 方案過期 → 回落 free（3 次）；無方案列 = free 預設 3 次
  select case
           when plan_expires_at is not null and plan_expires_at < now() then 3
           else monthly_export_limit
         end into v_limit
  from public.user_plans where user_id = v_user;
  if v_limit is null then v_limit := 3; end if;

  insert into public.export_usage(user_id, month_key, export_type, count)
  values (v_user, v_month, p_export_type, 0)
  on conflict (user_id, month_key, export_type) do nothing;

  select count into v_count from public.export_usage
  where user_id = v_user and month_key = v_month and export_type = p_export_type
  for update;                                     -- 鎖列 → 兩分頁同按也不超扣

  if v_count >= v_limit then
    return query select false, 0, 'quota_exceeded'; return;
  end if;

  update public.export_usage
  set count = count + 1, updated_at = now()
  where user_id = v_user and month_key = v_month and export_type = p_export_type;

  return query select true, v_limit - v_count - 1, 'ok';
end;
$$;

-- ---- RPC：只查不扣（UI 顯示剩餘次數用）----
create or replace function public.get_export_quota(p_export_type text)
returns table(remaining integer, plan text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_month text := to_char(now(), 'YYYY-MM');
  v_limit integer; v_plan text; v_count integer;
begin
  if v_user is null then return query select 0, 'anonymous'; return; end if;
  select case
           when plan_expires_at is not null and plan_expires_at < now() then 3
           else monthly_export_limit
         end,
         case
           when plan_expires_at is not null and plan_expires_at < now() then 'free'
           else user_plans.plan
         end
    into v_limit, v_plan
  from public.user_plans where user_id = v_user;
  if v_limit is null then v_limit := 3; v_plan := 'free'; end if;
  select coalesce(max(count), 0) into v_count from public.export_usage
  where user_id = v_user and month_key = v_month and export_type = p_export_type;
  return query select greatest(v_limit - v_count, 0), v_plan;
end;
$$;

-- ---- 權限：只給 authenticated ----
revoke all on function public.consume_export_quota(text) from public, anon;
revoke all on function public.get_export_quota(text) from public, anon;
grant execute on function public.consume_export_quota(text) to authenticated;
grant execute on function public.get_export_quota(text) to authenticated;

-- ---- 清舊資料（選用；配 pg_cron 每月跑，保留 12 個月）----
-- select cron.schedule('purge-old-export-usage', '0 3 1 * *',
--   $$delete from public.export_usage where month_key < to_char(now() - interval '12 months', 'YYYY-MM')$$);
