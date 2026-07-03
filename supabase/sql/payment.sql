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
