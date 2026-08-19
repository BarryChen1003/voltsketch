-- ============================================================
-- entitlements-expiry.sql — 付費權限到期就失效
-- 用法：Supabase Dashboard → SQL Editor → 貼上執行（冪等，可重跑）。
--
-- 修的問題：
--   profiles.pcb_access 與 profiles.interview_paid 是純布林值，
--   webhook 付款成功時設 true，**沒有任何地方會設回 false，也沒有任何地方
--   檢查 plan_expires_at**。所以買一次 12 個月方案，PCB 與面試題庫就永久有效，
--   方案過期照樣能用。匯出額度沒有這個問題（它會檢查到期日回落 free），
--   只有這兩個旗標漏掉。
--
--   PCB 下放到 NT$300 的 1 個月方案之後，這個洞會變成「付 300 買斷 PCB」，
--   所以必須一起修。
--
-- 判定規則（重要，白名單靠這條活著）：
--   role='admin'                                   → 全開
--   有 user_plans 且 plan_expires_at 已過          → 付費旗標一律不算
--   其餘（沒有 user_plans 列，或到期日是 null）    → 旗標照算
--
--   最後一條就是**手動白名單**的情形：站主直接 update profiles 給權限的人
--   不會有 user_plans 列，因此不會被當成過期。要收回就把旗標改回 false。
-- ============================================================

-- ---------- 有效權限：單一真相 ----------
create or replace function public.my_entitlements()
returns table(pcb_access boolean, interview_paid boolean, role text, plan text, plan_expires_at timestamptz, expired boolean)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_p    public.profiles%rowtype;
  v_exp  timestamptz;
  v_plan text;
  v_has_plan boolean;
  v_expired boolean;
begin
  if v_user is null then
    return query select false, false, null::text, null::text, null::timestamptz, false; return;
  end if;

  select * into v_p from public.profiles where id = v_user;
  if not found then
    return query select false, false, null::text, null::text, null::timestamptz, false; return;
  end if;

  select up.plan, up.plan_expires_at, true
    into v_plan, v_exp, v_has_plan
  from public.user_plans up where up.user_id = v_user;

  -- 只有「確實有方案、且到期日已過」才算過期。
  -- 沒有方案列或到期日 null＝手動授權/永久，不受影響。
  v_expired := coalesce(v_has_plan, false) and v_exp is not null and v_exp < now();

  if coalesce(v_p.role, '') = 'admin' then
    return query select true, true, v_p.role, v_plan, v_exp, v_expired; return;
  end if;

  return query select
    coalesce(v_p.pcb_access, false)     and not v_expired,
    coalesce(v_p.interview_paid, false) and not v_expired,
    v_p.role, v_plan, v_exp, v_expired;
end;
$$;

revoke all on function public.my_entitlements() from public, anon;
grant execute on function public.my_entitlements() to authenticated;

-- ---------- 面試題庫的 RLS 也要跟著到期 ----------
-- 這支是 interview_questions 的 RLS 判準。原本只看 profiles.interview_paid，
-- 所以方案過期之後 RLS 照樣放行——前端擋住了，直接打 REST 仍然拿得到題目。
create or replace function public.is_interview_paid()
returns boolean
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles p
    left join public.user_plans up on up.user_id = p.id
    where p.id = auth.uid()
      and (
        p.role = 'admin'
        or (
          p.interview_paid = true
          and (up.user_id is null or up.plan_expires_at is null or up.plan_expires_at > now())
        )
      )
  );
$$;

-- ============================================================
-- 驗證（登入後在 SQL Editor 跑）：
--   select * from public.my_entitlements();
--
-- 手動把權限給某個人（白名單；這種授權不會過期）：
--   update public.profiles set pcb_access = true
--   where id = (select id from auth.users where email = '對方的email');
--
-- 收回：
--   update public.profiles set pcb_access = false where id = '...';
-- ============================================================
