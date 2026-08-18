-- ============================================================
-- export-quota-whitelist.sql — 匯出額度：限制 export_type 只能是已知格式
-- 用法：Supabase Dashboard → SQL Editor → 貼上執行（冪等，可重跑）。
--
-- 為什麼要這一支（D1 資安總檢 D-5）：
--   額度是以 (user_id, month_key, export_type) 計數的，而舊版只檢查
--   length(p_export_type) <= 32。也就是說，把參數改成 'kicad_1'、'kicad_2'…
--   每個字串都會開一個全新的計數桶，額度形同虛設——不必改前端、
--   直接呼叫 RPC 換個字就有無限次。
--
--   這裡把可用的格式寫死成白名單。新增匯出格式時要一起更新這份清單，
--   否則新格式會被擋掉（回 bad_export_type）。
-- ============================================================

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
  -- 已知的匯出格式。要加新格式就改這裡（前端 vs-adapters.js 的 id 要對得上）。
  -- 實際會傳進來的值（2026-08-18 由程式碼查證，不是憑印象列的）：
  --   vs-adapters.js 的 adapter id：json / kicad / csv / tcl
  --   architecture.html：'arch-' + fmt，fmt 只有 json / bom / dsn
  -- 加新匯出格式時**必須**同步這裡，否則新格式會被擋成 bad_export_type。
  v_allowed constant text[] := array[
    'json', 'kicad', 'csv', 'tcl',
    'arch-json', 'arch-bom', 'arch-dsn'
  ];
begin
  if v_user is null then
    return query select false, 0, 'not_authenticated'; return;
  end if;
  -- 白名單：擋掉「換個字串就換一個額度桶」的繞法
  if p_export_type is null or not (p_export_type = any(v_allowed)) then
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

-- 查詢用的那支同樣擋一下，避免用未知字串探測
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
  -- 實際會傳進來的值（2026-08-18 由程式碼查證，不是憑印象列的）：
  --   vs-adapters.js 的 adapter id：json / kicad / csv / tcl
  --   architecture.html：'arch-' + fmt，fmt 只有 json / bom / dsn
  -- 加新匯出格式時**必須**同步這裡，否則新格式會被擋成 bad_export_type。
  v_allowed constant text[] := array[
    'json', 'kicad', 'csv', 'tcl',
    'arch-json', 'arch-bom', 'arch-dsn'
  ];
begin
  if v_user is null then return query select 0, 'anonymous'; return; end if;
  if p_export_type is null or not (p_export_type = any(v_allowed)) then
    return query select 0, 'bad_export_type'; return;
  end if;
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

-- 權限維持原樣：只有 authenticated 能執行
revoke all on function public.consume_export_quota(text) from public, anon;
revoke all on function public.get_export_quota(text) from public, anon;
grant execute on function public.consume_export_quota(text) to authenticated;
grant execute on function public.get_export_quota(text) to authenticated;

-- 跑完自我檢查：這行應該回 bad_export_type（未登入時會回 not_authenticated，也算正常）
-- select * from public.consume_export_quota('kicad_bypass_attempt');
