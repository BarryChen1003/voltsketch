# backup-supabase.ps1 — 本機手動備份 Supabase（pg_dump 整個 public schema）
# 用法：
#   1) 裝 PostgreSQL client（含 pg_dump）：https://www.postgresql.org/download/windows/
#   2) 設連線字串環境變數（"不要"寫進檔案 / 不要 commit）：
#        $env:SUPABASE_DB_URL = 'postgresql://postgres:<密碼>@db.dmkxjawjrmltmrmkebbs.supabase.co:5432/postgres'
#   3) 執行：  pwsh ./backup-supabase.ps1
# 輸出：backups\supabase-dump-<時間>.sql.gz（此資料夾已列入 .gitignore，含 PII 絕不進 repo）

$ErrorActionPreference = 'Stop'

$dbUrl = $env:SUPABASE_DB_URL
if ([string]::IsNullOrWhiteSpace($dbUrl)) {
    Write-Error "未設 `$env:SUPABASE_DB_URL。見本檔頂部說明。"
    exit 1
}

$pgDump = (Get-Command pg_dump -ErrorAction SilentlyContinue)
if (-not $pgDump) {
    Write-Error "找不到 pg_dump。請先安裝 PostgreSQL client 並加入 PATH。"
    exit 1
}

$dir = Join-Path $PSScriptRoot 'backups'
if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }

$stamp = Get-Date -Format 'yyyyMMdd-HHmm'
$out = Join-Path $dir "supabase-dump-$stamp.sql"

Write-Host "pg_dump public schema → $out ..."
& pg_dump $dbUrl --schema=public --no-owner --no-privileges --file=$out
if ($LASTEXITCODE -ne 0) { Write-Error "pg_dump 失敗（exit $LASTEXITCODE）"; exit 1 }

# gzip（用 .NET 壓縮，免額外工具）
$gz = "$out.gz"
$inStream = [System.IO.File]::OpenRead($out)
$outStream = [System.IO.File]::Create($gz)
$gzStream = New-Object System.IO.Compression.GzipStream($outStream, [System.IO.Compression.CompressionLevel]::Optimal)
$inStream.CopyTo($gzStream)
$gzStream.Dispose(); $outStream.Dispose(); $inStream.Dispose()
Remove-Item $out

$size = [math]::Round((Get-Item $gz).Length / 1KB, 1)
Write-Host "完成：$gz ($size KB)"
Write-Host "還原到新專案：gunzip 後於 SQL Editor 貼上，或 psql `$env:SUPABASE_DB_URL -f dump.sql"
