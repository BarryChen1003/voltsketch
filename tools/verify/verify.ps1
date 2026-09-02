# verify.ps1 — 用**本機裝的第三方工具**驗我們的匯出檔。
#
# 為什麼要有這一支：repo 裡那些 gerber-check / step.test / ipc2581.test 驗的是
# 「我們寫出來的東西符合我們對格式的理解」。它們很硬（流形性、尤拉示性數、參照完整性），
# 但跟被驗的東西出自同一套假設——理解本身錯了，自己驗自己永遠是綠的。
# 2026-09-02 第一次跑這支就證實了：STEP 內部 62 條斷言全綠，OCCT 開起來**是空的**。
#
# 三個判官，都跟我們無關：
#   kicad-cli   (KiCad 10)      → 對我們匯出的 .kicad_pcb 跑 KiCad 自己的 DRC
#   FreeCADCmd  (OCCT 核心)     → 開我們的 STEP，判定 shape 有效、實體封閉
#   gerbonara   (Python)        → 讀我們的 Gerber/Excellon，數圖形與鑽孔
#
# 用法：
#   pwsh -File tools\verify\verify.ps1              # 全部公版
#   pwsh -File tools\verify\verify.ps1 rp2040-pico30
#
# exit 0 = 三個判官都沒話說；非 0 = 有問題，訊息在上面。

param([string]$Board = '')

$ErrorActionPreference = 'Stop'
$Web = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$Here = $PSScriptRoot
$Out = Join-Path $Here 'out'

$KiCad   = "$env:LOCALAPPDATA\Programs\KiCad\10.0\bin\kicad-cli.exe"
$FreeCAD = "$env:LOCALAPPDATA\Programs\FreeCAD 1.1\bin\FreeCADCmd.exe"
$Py      = Join-Path $Here '.venv\Scripts\python.exe'

$missing = @()
foreach ($t in @(@('kicad-cli', $KiCad), @('FreeCADCmd', $FreeCAD), @('venv python', $Py))) {
  if (-not (Test-Path $t[1])) { $missing += ($t[0] + ' → ' + $t[1]) }
}
if ($missing.Count) {
  Write-Host '工具鏈不完整，先照 tools/verify/README.md 裝起來：' -ForegroundColor Yellow
  $missing | ForEach-Object { Write-Host "  缺 $_" }
  exit 2
}

# 1) 產檔
Write-Host '== 產出匯出檔 ==' -ForegroundColor Cyan
Push-Location $Web
try { node (Join-Path $Here 'emit.js') $Board } finally { Pop-Location }
$index = Get-Content (Join-Path $Out 'index.json') -Raw | ConvertFrom-Json
$baseline = Get-Content (Join-Path $Here 'baseline.json') -Raw | ConvertFrom-Json

$fail = 0
$rows = @()

foreach ($b in $index) {
  $dir = Join-Path $Out $b.id
  $row = [ordered]@{ board = $b.id; kicad = ''; step = ''; gerber = '' }

  # 2) KiCad 自己的 DRC（.kicad_pro 一起在旁邊，KiCad 才會用我們的規則而不是它的預設）
  $drcJson = Join-Path $dir 'kicad-drc.json'
  & $KiCad pcb drc --format json --output $drcJson --severity-error --severity-warning `
    (Join-Path $dir 'board.kicad_pcb') | Out-Null
  if (Test-Path $drcJson) {
    $drc = Get-Content $drcJson -Raw | ConvertFrom-Json
    $errs = @($drc.violations | Where-Object { $_.severity -eq 'error' })
    $warns = @($drc.violations | Where-Object { $_.severity -eq 'warning' })
    # 白名單：已經查過、而且寫下理由的那幾類不算失敗。沒列到的一律算——
    # 清單只會因為有人寫理由而變長，不會靜靜長大。
    $unexpected = @()
    foreach ($grp in ($errs | Group-Object type)) {
      $acc = $baseline.acceptedErrors.($grp.Name)
      $okBoard = $acc -and ($acc.boards -contains $b.id) -and ($grp.Count -le $acc.max)
      if (-not $okBoard) { $unexpected += "$($grp.Name)×$($grp.Count)" }
    }
    $row.kicad = "error $($errs.Count)（已判定過的除外還剩 $($unexpected.Count) 類）/ warn $($warns.Count) / 未連接 $(@($drc.unconnected_items).Count)"
    if ($unexpected.Count -gt 0) { $row.kicad += ' → ' + ($unexpected -join ', '); $fail++ }
  } else { $row.kicad = 'DRC 沒產出報告'; $fail++ }

  # 3) OCCT 開 STEP
  $stepJson = Join-Path $dir 'step-occt.json'
  & $FreeCAD (Join-Path $Here 'step-check.py') (Join-Path $dir 'board.step') $stepJson $b.expect.stepSolids 2>&1 | Out-Null
  if (Test-Path $stepJson) {
    $s = Get-Content $stepJson -Raw | ConvertFrom-Json
    $row.step = if ($s.ok) { "valid，實體 $($s.solids)，體積 $($s.volume)mm3" } else { ($s.problems -join '; ') }
    if (-not $s.ok) { $fail++ }
  } else { $row.step = 'OCCT 沒產出報告'; $fail++ }

  # 4) gerbonara 讀 Gerber/Excellon
  $expJson = Join-Path $dir 'expect.json'
  $b.expect | ConvertTo-Json -Depth 4 | Set-Content $expJson -Encoding UTF8
  $gbrJson = Join-Path $dir 'gerber-3p.json'
  & $Py (Join-Path $Here 'gerber-check.py') (Join-Path $dir 'gerber') $expJson $gbrJson 2>&1 | Out-Null
  if (Test-Path $gbrJson) {
    $g = Get-Content $gbrJson -Raw | ConvertFrom-Json
    $row.gerber = if ($g.ok) { "$($g.gerberFiles) 層可讀，鑽孔 $($g.holes)" } else { ($g.problems -join '; ') }
    if (-not $g.ok) { $fail++ }
  } else { $row.gerber = 'gerbonara 沒產出報告'; $fail++ }

  $rows += [pscustomobject]$row
}

Write-Host ''
Write-Host '== 第三方判定 ==' -ForegroundColor Cyan
$rows | Format-List

if ($fail -gt 0) {
  Write-Host "$fail 項沒過。細節在各板目錄下的 kicad-drc.json / step-occt.json / gerber-3p.json" -ForegroundColor Red
  exit 1
}
Write-Host '三個判官都沒話說。' -ForegroundColor Green
exit 0
