# live-check.ps1 — 線上檔案是不是本機這一版？
#
# 用法（Windows PowerShell 5.1 與 pwsh 7 都可）：
#   powershell -ExecutionPolicy Bypass -File tools\live-check.ps1
#   powershell -ExecutionPolicy Bypass -File tools\live-check.ps1 pcb.js app.js
#
# 為什麼不比字串、要比位元組：
#   站台回 `Content-Type: text/javascript`（沒有 charset），5.1 的 Invoke-WebRequest
#   會把 .Content 當 ISO-8859-1 解碼；同一版 5.1 的 Get-Content -Raw 又把無 BOM 的
#   UTF-8 檔當系統 ANSI(cp950) 解碼。兩邊各爛一種，逐字元比對必定報「不同」——
#   看起來像沒部署，其實是解碼問題。所以這裡一律讀原始位元組、明確用 UTF-8 解，
#   只把 CRLF 正規化成 LF（本機工作區可能是 CRLF，線上一定是 LF）。

# 空白分隔的多個檔名要全部收下。只有 [string[]] 的話，PowerShell 只綁第一個位置參數，
# 其餘被安靜丟掉——腳本會只驗一個檔卻回報「全部一致」，比沒有檢查更糟。
# （2026-08-31 實測踩到：`... live-check.ps1 a.js b.js` 只驗了 a.js。）
param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Files)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$base = 'https://hardware-ai.org'

if (-not $Files -or $Files.Count -eq 0) {
  $Files = 'pcb.js','app.js','i18n.js','pcb-nets.js','design-history.js','design-history-ui.js'
}

function Read-Utf8Norm([string]$path) {
  [Text.Encoding]::UTF8.GetString([IO.File]::ReadAllBytes($path)) -replace "`r`n", "`n"
}

$tmp  = Join-Path ([IO.Path]::GetTempPath()) 'live-check.tmp'
$bad  = 0

foreach ($f in $Files) {
  $localPath = Join-Path $root $f
  if (-not (Test-Path $localPath)) {
    Write-Host ("{0,-22} 本機沒有這個檔" -f $f) -ForegroundColor Yellow; $bad++; continue
  }
  try {
    Invoke-WebRequest "$base/$f" -OutFile $tmp -TimeoutSec 40 -UseBasicParsing
  } catch {
    # 抓不到就要說抓不到。空回應的雜湊看起來只是「不一樣」，會被誤讀成沒部署。
    Write-Host ("{0,-22} 抓不到（{1}）" -f $f, $_.Exception.Message) -ForegroundColor Yellow; $bad++; continue
  }
  $live  = Read-Utf8Norm $tmp
  $local = Read-Utf8Norm $localPath
  if ($live -eq $local) {
    Write-Host ("{0,-22} OK    線上＝本機（{1} 字元）" -f $f, $local.Length) -ForegroundColor Green
  } else {
    Write-Host ("{0,-22} 不同  本機 {1} / 線上 {2} 字元" -f $f, $local.Length, $live.Length) -ForegroundColor Red
    $bad++
  }
}

Remove-Item $tmp -ErrorAction SilentlyContinue
if ($bad -eq 0) { Write-Host "`n全部一致：線上跑的就是本機這一版。" -ForegroundColor Green }
else { Write-Host "`n有 $bad 項不一致或抓不到，見上面。" -ForegroundColor Red }
exit $bad
