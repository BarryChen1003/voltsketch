#!/usr/bin/env bash
# restore-drill.sh — 備份還原演練
#
# 為什麼要有這支：備份「有產生」跟「還原得回來」是兩件事。GitHub Actions 每週產出
# artifact，但在真的把它倒進一個乾淨資料庫、確認帳號與訂單都回得來之前，
# 那份備份只是一個沒人驗過的檔案。
#
# 全程在本機臨時叢集（獨立 port），**不碰你的正式資料庫，也不碰本機 5432**。
#
# 用法（Git Bash）：
#   ./restore-drill.sh <public-dump.sql> [auth-dump.sql]
#
# 取得 dump：GitHub → Actions →「Supabase 備份」→ 最新一次成功的執行 →
#            下載 artifact → 解壓縮，會有 supabase-dump-*.sql 與 supabase-auth-*.sql
#
# 需要：本機 PostgreSQL 17（預設找 /c/Program Files/PostgreSQL/17/bin，可用 PGBIN 覆寫）
#
# 注意：dump 含使用者 email 等個資。演練完把解壓出來的檔案刪掉，不要留在專案目錄。
#       （.gitignore 已擋 *.sql 於 backups/，但解到別處就沒擋了）

set -uo pipefail

PGBIN="${PGBIN:-/c/Program Files/PostgreSQL/17/bin}"
PORT="${PORT:-55442}"
PUB="${1:-}"
AUTH="${2:-}"

fail=0
ok()   { echo "  [OK]   $1"; }
bad()  { echo "  [FAIL] $1"; fail=$((fail+1)); }

if [ -z "$PUB" ]; then
  echo "用法：./restore-drill.sh <public-dump.sql> [auth-dump.sql]" >&2; exit 2
fi
[ -f "$PUB" ] || { echo "找不到 public dump：$PUB" >&2; exit 2; }
[ -n "$AUTH" ] && { [ -f "$AUTH" ] || { echo "找不到 auth dump：$AUTH" >&2; exit 2; }; }

export PATH="$PGBIN:$PATH"
for exe in initdb pg_ctl psql; do
  command -v "$exe" >/dev/null 2>&1 || { echo "找不到 $exe（設 PGBIN 指向 PostgreSQL 的 bin）" >&2; exit 2; }
done

DATA="$(mktemp -d -t restore-drill-XXXXXX)"
Q()    { psql -h localhost -p "$PORT" -U postgres -d postgres -w -tAc "$1" 2>&1; }
RUNF() { psql -h localhost -p "$PORT" -U postgres -d postgres -w -f "$1" 2>&1; }

cleanup() {
  echo
  echo "清理臨時叢集..."
  pg_ctl -D "$DATA" stop -m fast >/dev/null 2>&1
  sleep 1
  rm -rf "$DATA" 2>/dev/null
  [ -d "$DATA" ] && echo "  (刪不掉 $DATA，請手動移除)" || echo "  已刪除"
}
trap cleanup EXIT

echo
echo "=== 備份還原演練 ==="
echo "public dump : $PUB"
echo "auth dump   : ${AUTH:-(未提供)}"
echo "臨時叢集    : $DATA  (port $PORT)"
echo

# ---- 1) 臨時叢集 ----
echo "[1/5] 建立臨時叢集..."
initdb -D "$DATA" -U postgres -A trust --encoding=UTF8 --locale=C >"$DATA.initdb.log" 2>&1 \
  || { echo "initdb 失敗，看 $DATA.initdb.log" >&2; exit 1; }
pg_ctl -D "$DATA" -o "-p $PORT -c listen_addresses=localhost" -l "$DATA/log" -w -t 30 start >/dev/null 2>&1
sleep 2
Q 'select 1' >/dev/null 2>&1 || { echo "臨時叢集起不來，看 $DATA/log" >&2; exit 1; }
ok "臨時叢集已啟動（port $PORT）"

# ---- 2) Supabase 的角色與 auth 結構 ----
# dump 裡會 grant 給 anon/authenticated 等角色；auth dump 是 data-only，
# 沒有 auth.users 這張表就整份倒不進去。這一步就是在補這些前提。
echo "[2/5] 建立 Supabase 角色與 auth 結構..."
psql -h localhost -p "$PORT" -U postgres -d postgres -w >/dev/null 2>&1 <<'SQL'
create role anon;
create role authenticated;
create role service_role;
create role supabase_admin;
create role supabase_auth_admin;
create schema if not exists auth;
create schema if not exists extensions;
create extension if not exists pgcrypto;
create table if not exists auth.users (
  instance_id uuid, id uuid primary key, aud varchar(255), role varchar(255),
  email varchar(255), encrypted_password varchar(255),
  email_confirmed_at timestamptz, invited_at timestamptz,
  confirmation_token varchar(255), confirmation_sent_at timestamptz,
  recovery_token varchar(255), recovery_sent_at timestamptz,
  email_change_token_new varchar(255), email_change varchar(255),
  email_change_sent_at timestamptz, last_sign_in_at timestamptz,
  raw_app_meta_data jsonb, raw_user_meta_data jsonb,
  is_super_admin boolean, created_at timestamptz, updated_at timestamptz,
  phone text, phone_confirmed_at timestamptz, phone_change text,
  phone_change_token varchar(255), phone_change_sent_at timestamptz,
  confirmed_at timestamptz, email_change_token_current varchar(255),
  email_change_confirm_status smallint, banned_until timestamptz,
  reauthentication_token varchar(255), reauthentication_sent_at timestamptz,
  is_sso_user boolean default false, deleted_at timestamptz, is_anonymous boolean default false
);
create or replace function auth.uid() returns uuid language sql stable as $fn$ select null::uuid $fn$;
create or replace function auth.role() returns text language sql stable as $fn$ select null::text $fn$;
SQL
ok "角色與 auth 結構就緒"

# ---- 3) 還原 public ----
echo "[3/5] 還原 public schema..."
PUBLOG="$(RUNF "$PUB")"
PUBERR="$(printf '%s\n' "$PUBLOG" | grep -c 'ERROR:')"
if [ "$PUBERR" -eq 0 ]; then ok "public 還原無錯誤"
else
  bad "public 還原有 $PUBERR 個 ERROR（前 5 筆）"
  printf '%s\n' "$PUBLOG" | grep 'ERROR:' | head -5 | sed 's/^/         /'
fi

# ---- 4) 還原 auth ----
if [ -n "$AUTH" ]; then
  echo "[4/5] 還原 auth（data-only）..."
  AUTHLOG="$(RUNF "$AUTH")"
  AUTHERR="$(printf '%s\n' "$AUTHLOG" | grep -c 'ERROR:')"
  if [ "$AUTHERR" -eq 0 ]; then ok "auth 還原無錯誤"
  else
    bad "auth 還原有 $AUTHERR 個 ERROR（前 5 筆）"
    printf '%s\n' "$AUTHLOG" | grep 'ERROR:' | head -5 | sed 's/^/         /'
  fi
else
  echo "[4/5] 略過 auth（未提供）"
fi

# ---- 5) 驗收 ----
echo "[5/5] 驗收..."
for t in profiles user_plans orders interview_questions; do
  n="$(Q "select count(*) from public.$t")"
  case "$n" in
    ''|*[!0-9]*) bad "public.$t 不存在或查不到" ;;
    *)           ok "public.$t 有 $n 列" ;;
  esac
done

# 帳號是這次備份修正的重點：沒有帳號，還原了也沒人登得進來
u="$(Q 'select count(*) from auth.users')"
case "$u" in
  ''|*[!0-9]*) bad "auth.users 不存在" ;;
  0)           bad "auth.users 是空的 —— 帳號沒有被備份到" ;;
  *)           ok "auth.users 有 $u 個帳號" ;;
esac

r="$(Q "select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relrowsecurity")"
case "$r" in ''|*[!0-9]*|0) bad "沒有任何表開著 RLS —— 還原後資料是裸的" ;; *) ok "$r 張表開著 RLS" ;; esac

p="$(Q "select count(*) from pg_policies where schemaname='public'")"
case "$p" in ''|*[!0-9]*|0) bad "沒有任何 RLS policy" ;; *) ok "$p 條 RLS policy" ;; esac

for f in is_admin is_interview_paid my_entitlements consume_export_quota; do
  e="$(Q "select count(*) from pg_proc pr join pg_namespace n on n.oid=pr.pronamespace where n.nspname='public' and pr.proname='$f'")"
  case "$e" in ''|*[!0-9]*|0) bad "函式 public.$f 沒還原回來" ;; *) ok "函式 public.$f 存在" ;; esac
done

echo
if [ "$fail" -eq 0 ]; then
  echo "=== 演練通過：這份備份還原得回來 ==="
  exit 0
else
  echo "=== 演練失敗：$fail 項不通過。這份備份還原不回完整的站台。 ==="
  exit 1
fi
