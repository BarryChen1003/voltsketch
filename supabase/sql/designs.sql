-- designs.sql — 雲端多專案存檔（線路圖 ＋ Layout 同一列）
--
-- 為什麼要這張表：
--   舊的 projects 表主鍵是 user_id，等於「一個使用者只能有一個專案」，
--   而且只存線路圖（components/wires）。PCB 板子從來沒有進過雲端，
--   唯一的持久化是瀏覽器 localStorage（hardwareai-pcb-autosave）——
--   清一次瀏覽器資料、換一台電腦，使用者花幾小時佈的板就沒了。
--
-- 為什麼 sch 與 pcb 放同一列：
--   Sch2Pcb 的 ECO 同步要兩邊配對。分兩張表存會出現「這片板配哪張圖」的
--   對應問題，刪掉其中一邊還會留下孤兒。
--
-- 為什麼有 meta 欄：
--   清單頁要顯示「這個專案有幾顆料、幾條線」，但絕對不能為此把 sch/pcb 撈回來
--   （20 個專案 × 220KB = 一次拉 4MB，那就是「多開清單很卡」的成因）。
--   meta 是幾十 bytes 的計數快照，存檔時由前端一起寫。
--
-- 上限（前端也擋一次，這裡是真正算數的那道）：
--   每人 20 個專案、單一專案 2MB。Supabase 免費層 500MB，
--   20 × 50KB ≈ 1MB/人 → 約 500 人。要放寬就改 designs_guard() 裡的兩個常數。
--
-- 在 Supabase Dashboard → SQL Editor 整段貼上執行。可重複執行。

create extension if not exists pgcrypto;

create table if not exists public.designs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null default 'Untitled',
  sch        jsonb,
  pcb        jsonb,
  meta       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 清單查詢就是 where user_id = ? order by updated_at desc，索引照這個形狀建
create index if not exists designs_user_updated_idx
  on public.designs (user_id, updated_at desc);

-- ---- 上限與 updated_at ----
-- 用 trigger 不用 CHECK：CHECK 要求 immutable，pg_column_size / now() 都不是。
create or replace function public.designs_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  n  int;
  sz int;
begin
  sz := coalesce(octet_length(new.sch::text), 0) + coalesce(octet_length(new.pcb::text), 0);
  if sz > 2097152 then
    raise exception 'design_too_large:%', sz;
  end if;

  if tg_op = 'INSERT' then
    select count(*) into n from public.designs where user_id = new.user_id;
    if n >= 20 then
      raise exception 'design_limit_reached';
    end if;
  end if;

  -- updated_at 由伺服器決定。讓前端傳的話，時鐘不準的機器會把自己的專案
  -- 永遠排在清單最上面（或永遠沉底）。
  new.updated_at := now();
  return new;
end
$$;

drop trigger if exists designs_guard_trg on public.designs;
create trigger designs_guard_trg
  before insert or update on public.designs
  for each row execute function public.designs_guard();

-- ---- RLS：只看得到也只動得了自己的列 ----
alter table public.designs enable row level security;

drop policy if exists designs_select_own on public.designs;
create policy designs_select_own on public.designs
  for select using (auth.uid() = user_id);

drop policy if exists designs_insert_own on public.designs;
create policy designs_insert_own on public.designs
  for insert with check (auth.uid() = user_id);

drop policy if exists designs_update_own on public.designs;
create policy designs_update_own on public.designs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists designs_delete_own on public.designs;
create policy designs_delete_own on public.designs
  for delete using (auth.uid() = user_id);

-- ---- 舊 projects 刻意「不」搬 ----
-- 一開始寫了一段 insert ... select from projects，後來拿掉，原因是會造成重複列：
--   「目前專案」的指標（vs-design-id）存在瀏覽器 localStorage 裡。舊使用者搬完之後
--   那個指標還是空的，app.js 會退回讀舊的 projects 表（這是刻意保留的相容路徑），
--   接著他按一次「同步」就會再建一列——同一份線路圖變成兩列，而且兩列都會繼續被改。
--
-- 所以改成：projects 保持原樣不動，當作舊使用者的載入來源與安全備份；
--          第一次按「同步」時會在 designs 建第一列，之後就都走新表。
--          等到確定沒有人還在讀舊表，再單獨清 projects（那是另一次動作，要先備份）。
--
-- 對應的前端行為在 app.js：先讀 designs（有 currentId 才讀），讀不到才 Auth.loadProject()。

-- 驗收：跑完應該看到 designs 已建立、policy 四條、trigger 一條。
select
  (select count(*) from public.designs)                                    as designs_rows,
  (select count(*) from pg_policies where tablename = 'designs')           as policies,
  (select count(*) from pg_trigger where tgname = 'designs_guard_trg')     as triggers;
