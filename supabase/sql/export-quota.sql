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
