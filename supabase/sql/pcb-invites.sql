-- ============================================================
-- pcb-invites.sql — PCB 邀請碼改成後端驗證
-- 用法：Supabase Dashboard → SQL Editor → 貼上執行（冪等，可重跑）。
--
-- 問題（D1 資安總檢 D-1 的一部分）：
--   5 組邀請碼直接寫在 pcb.html 的 <script> 裡。那是公開網站的原始碼，
--   任何人按「檢視原始碼」就拿得到，等於沒有邀請制。
--   而且驗證在前端做，就算換一組碼，下一個人照樣看得到。
--
-- 改法：
--   1. 資料庫只存 **SHA-256 雜湊**，不存明碼。就算 DB 外流也還原不出邀請碼。
--   2. 兌換走 SECURITY DEFINER 的 RPC，需要登入（auth.uid()）。
--      兌換成功就把權限寫進 profiles.pcb_access —— 那是後端 RLS 認的旗標，
--      不是 localStorage 那種前端旗標，清瀏覽器或改 DOM 都沒用。
--   3. 舊的 5 組碼已經公開過，視為作廢。下面會產新的。
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists public.pcb_invites (
  id          bigint generated always as identity primary key,
  code_hash   text not null unique,          -- sha256(明碼)，不存明碼
  label       text,                          -- 給誰／什麼用途，自己看的備註
  max_uses    integer not null default 1,    -- 這組碼可以被幾個帳號兌換
  used_count  integer not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- 誰兌換過（防同一人重複佔用次數，也留紀錄）
create table if not exists public.pcb_invite_redemptions (
  invite_id  bigint not null references public.pcb_invites(id) on delete cascade,
  user_id    uuid   not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (invite_id, user_id)
);

-- 兩張表都不開放前端直接讀寫：只能透過下面的 RPC。
alter table public.pcb_invites enable row level security;
alter table public.pcb_invite_redemptions enable row level security;
-- 刻意不建任何 policy → 除了 service_role 與 SECURITY DEFINER 函式，誰都讀不到。

-- ---------- 兌換 ----------
create or replace function public.redeem_pcb_invite(p_code text)
returns table(ok boolean, reason text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_hash text;
  v_inv  public.pcb_invites%rowtype;
begin
  if v_user is null then
    return query select false, 'not_authenticated'; return;
  end if;
  if p_code is null or length(btrim(p_code)) = 0 then
    return query select false, 'bad_code'; return;
  end if;

  -- 大小寫不敏感：使用者常常會打成小寫
  v_hash := encode(digest(upper(btrim(p_code)), 'sha256'), 'hex');

  select * into v_inv from public.pcb_invites
  where code_hash = v_hash and active
  for update;                                  -- 鎖列：兩個人同時兌換最後一個名額不會超發

  if not found then
    return query select false, 'bad_code'; return;
  end if;

  -- 同一個人重複兌換：直接視為成功，但不吃次數
  if exists (select 1 from public.pcb_invite_redemptions
             where invite_id = v_inv.id and user_id = v_user) then
    update public.profiles set pcb_access = true where id = v_user;
    return query select true, 'already_redeemed'; return;
  end if;

  if v_inv.used_count >= v_inv.max_uses then
    return query select false, 'exhausted'; return;
  end if;

  insert into public.pcb_invite_redemptions(invite_id, user_id) values (v_inv.id, v_user);
  update public.pcb_invites set used_count = used_count + 1 where id = v_inv.id;
  update public.profiles set pcb_access = true where id = v_user;

  return query select true, 'ok';
end;
$$;

revoke all on function public.redeem_pcb_invite(text) from public, anon;
grant execute on function public.redeem_pcb_invite(text) to authenticated;

-- ---------- 產生新邀請碼（只有 admin 能跑）----------
-- 回傳的明碼**只會顯示這一次**，資料庫只留雜湊。請當場複製保存。
create or replace function public.gen_pcb_invites(p_count integer default 5, p_max_uses integer default 1, p_label text default null)
returns table(code text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_code text;
  i integer;
begin
  if not public.is_admin() then
    raise exception 'admin only';
  end if;
  for i in 1..greatest(1, p_count) loop
    -- VSPCB- + 10 碼（字集去掉容易看錯的 0/O/1/I）
    v_code := 'VSPCB-' || (
      select string_agg(substr('23456789ABCDEFGHJKLMNPQRSTUVWXYZ',
                               (floor(random() * 32) + 1)::int, 1), '')
      from generate_series(1, 10)
    );
    insert into public.pcb_invites(code_hash, label, max_uses)
    values (encode(digest(v_code, 'sha256'), 'hex'), p_label, p_max_uses);
    code := v_code;
    return next;
  end loop;
end;
$$;

revoke all on function public.gen_pcb_invites(integer, integer, text) from public, anon, authenticated;
-- 只給 service_role 與 admin（函式內另有 is_admin() 檢查）
grant execute on function public.gen_pcb_invites(integer, integer, text) to authenticated;

-- ---------- 作廢舊的公開碼 ----------
-- 這 5 組寫在公開 HTML 裡過，一律標成失效（若之前就沒進 DB，這行不影響任何列）。
insert into public.pcb_invites(code_hash, label, max_uses, active)
select encode(digest(c, 'sha256'), 'hex'), '已公開外洩，作廢', 0, false
from unnest(array['VSPCB-7K3M9','VSPCB-2QX8F','VSPCB-R5TN4','VSPCB-J8WD6','VSPCB-M3ZK7']) as c
on conflict (code_hash) do update set active = false, max_uses = 0, label = '已公開外洩，作廢';

-- ============================================================
-- 跑完之後，執行這行產生 5 組新碼（明碼只顯示這一次，請複製保存）：
--
--   select * from public.gen_pcb_invites(5, 1, '2026-08 第一批');
--
-- 驗證舊碼確實失效（應回 false / bad_code）：
--   select * from public.redeem_pcb_invite('VSPCB-7K3M9');
-- ============================================================
