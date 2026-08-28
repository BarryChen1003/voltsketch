-- design-versions.sql — 專案的變更歷史（版本樹）
--
-- 為什麼要這張表：
--   designs 那一列是被 update 覆蓋的，上一版就沒了。佈到一半想退回半小時前的
--   樣子，目前沒有那條路。
--
-- 為什麼是「檢查點」不是「每次存檔」：
--   自動存檔每 4 秒一次。每次都留一版，一天幾千版、幾百 MB，
--   而 Supabase 免費層 500MB 是整站共用的。所以版本由使用者按下去才建立，
--   而且每個專案最多 20 版（前端 prune 之外，這裡的 trigger 是真正算數的那道）。
--
-- 為什麼有 parent_id：
--   從舊版還原之後再存新版，那一版的來源是舊版，不是當時的最新版。
--   記下來，歷史才是一棵樹；不記的話「還原」會讓中間那幾版看起來憑空消失。
--
-- 誠實界定：這不是 git。沒有 diff、沒有合併、沒有衝突解決，就是整份快照 + 來源。
--
-- 在 Supabase Dashboard → SQL Editor 整段貼上執行。可重複執行。

create extension if not exists pgcrypto;

create table if not exists public.design_versions (
  id         uuid primary key default gen_random_uuid(),
  design_id  uuid not null references public.designs(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  -- 來源版本。自己被刪掉時子版本不該跟著消失，所以是 set null 不是 cascade。
  parent_id  uuid references public.design_versions(id) on delete set null,
  label      text not null default '',
  sch        jsonb,
  pcb        jsonb,
  meta       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 清單查詢就是 where user_id = ? and design_id = ? order by created_at desc
create index if not exists design_versions_lookup_idx
  on public.design_versions (user_id, design_id, created_at desc);

-- ---- 上限 ----
-- 用 trigger 不用 CHECK：CHECK 要求 immutable，pg_column_size 不是。
create or replace function public.design_versions_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  n     int;
  bytes bigint;
begin
  bytes := coalesce(pg_column_size(new.sch), 0) + coalesce(pg_column_size(new.pcb), 0);
  if bytes > 2 * 1024 * 1024 then
    raise exception 'version_too_large';
  end if;

  if tg_op = 'INSERT' then
    select count(*) into n from public.design_versions
     where design_id = new.design_id and user_id = new.user_id;
    -- 前端會先淘汰再存；這裡放寬到 40 是為了不要在正常流程上誤擋，
    -- 但仍然擋得住「前端壞掉狂寫」的情況。
    if n >= 40 then
      raise exception 'version_limit_reached';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists design_versions_guard_trg on public.design_versions;
create trigger design_versions_guard_trg
  before insert or update on public.design_versions
  for each row execute function public.design_versions_guard();

-- ---- RLS：每個人只看得到自己的 ----
alter table public.design_versions enable row level security;

drop policy if exists "design_versions_select_own" on public.design_versions;
create policy "design_versions_select_own" on public.design_versions
  for select using (auth.uid() = user_id);

drop policy if exists "design_versions_insert_own" on public.design_versions;
create policy "design_versions_insert_own" on public.design_versions
  for insert with check (auth.uid() = user_id);

drop policy if exists "design_versions_update_own" on public.design_versions;
create policy "design_versions_update_own" on public.design_versions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "design_versions_delete_own" on public.design_versions;
create policy "design_versions_delete_own" on public.design_versions
  for delete using (auth.uid() = user_id);
