-- footprints.sql — 使用者自製封裝庫
--
-- 為什麼要獨立一張表（不放進 designs）：
--   封裝是**跨專案共用**的。同一顆 SOIC-8 會被十個板子用到，
--   塞進某一個 designs 列的話，換一個專案就找不到它了。
--
-- 跟明確不做的 LCSC 料庫無關：那是別人的商業資料，這是使用者自己畫的東西。
--
-- 資料形狀（footprint-editor.js 的 blank()/dual()/quad()/grid()/chip() 產物）：
--   { name, kind, pads:[{num,x,y,w,h,shape,rot,drill,side}], courtyard:{w,h}, silk:[] }
--
-- 上限：每人 200 個封裝、單一封裝 256KB。
--   200 個是「畫得完的量」——BGA 之外的封裝一個大約 1–4KB，
--   200 個約 0.5MB/人，跟 designs 的 1MB/人 同一個量級。
--
-- 在 Supabase Dashboard → SQL Editor 整段貼上執行。可重複執行。

create extension if not exists pgcrypto;

create table if not exists public.footprints (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  kind       text not null default 'custom',
  data       jsonb not null,
  pad_count  int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 同一個人不可以有兩個同名封裝：挑封裝時看到兩個一樣的名字，
-- 沒有任何辦法分辨哪個才是要的那個。
create unique index if not exists footprints_user_name_uniq
  on public.footprints (user_id, lower(name));

create index if not exists footprints_user_updated_idx
  on public.footprints (user_id, updated_at desc);

-- ---- 上限與 updated_at ----
create or replace function public.footprints_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  n  int;
  sz int;
begin
  sz := coalesce(octet_length(new.data::text), 0);
  if sz > 262144 then
    raise exception 'footprint_too_large:%', sz;
  end if;

  -- pad 數是給清單顯示用的，由伺服器算，前端傳什麼都不採信
  new.pad_count := coalesce(jsonb_array_length(new.data -> 'pads'), 0);
  if new.pad_count = 0 then
    raise exception 'footprint_no_pads';
  end if;

  if tg_op = 'INSERT' then
    select count(*) into n from public.footprints where user_id = new.user_id;
    if n >= 200 then
      raise exception 'footprint_limit_reached';
    end if;
  end if;

  new.updated_at := now();
  return new;
end
$$;

drop trigger if exists footprints_guard_trg on public.footprints;
create trigger footprints_guard_trg
  before insert or update on public.footprints
  for each row execute function public.footprints_guard();

-- ---- RLS ----
alter table public.footprints enable row level security;

drop policy if exists footprints_select_own on public.footprints;
create policy footprints_select_own on public.footprints
  for select using (auth.uid() = user_id);

drop policy if exists footprints_insert_own on public.footprints;
create policy footprints_insert_own on public.footprints
  for insert with check (auth.uid() = user_id);

drop policy if exists footprints_update_own on public.footprints;
create policy footprints_update_own on public.footprints
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists footprints_delete_own on public.footprints;
create policy footprints_delete_own on public.footprints
  for delete using (auth.uid() = user_id);

-- 驗收：跑完應該看到 0 列、4 條 policy、1 個 trigger、2 個索引。
select
  (select count(*) from public.footprints)                                  as rows,
  (select count(*) from pg_policies where tablename = 'footprints')         as policies,
  (select count(*) from pg_trigger where tgname = 'footprints_guard_trg')   as triggers,
  (select count(*) from pg_indexes where tablename = 'footprints'
     and indexname in ('footprints_user_name_uniq','footprints_user_updated_idx')) as idx;
