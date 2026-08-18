-- ============================================================
-- observability.sql — 前端錯誤日誌 + 輕量 analytics
--
-- 用法：Supabase Dashboard → SQL Editor → New query → 貼上整份 → Run。
-- 冪等：全部 if not exists / or replace / drop policy if exists，可以重跑。
--
-- 為什麼獨立成一支（2026-08-18）：
--   這段本來包在 01-core.sql 裡，但正式庫實測 error_logs 與 page_views 都不存在
--   （orders / user_plans / profiles 都在），代表當初這段沒有真的跑到。
--   前端 observe.js 一直在寫入這兩張表，所以線上每次載入頁面都會拿到
--   PGRST205「Could not find the table」404。分成獨立檔案比較不會再漏。
--
-- 依賴：public.is_admin()（在 01-core.sql 前段建立）。若這支報
--   `function public.is_admin() does not exist`，表示 01-core.sql 前半沒跑，先補跑那支。
-- ============================================================

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
