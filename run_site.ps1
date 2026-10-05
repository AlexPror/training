# FORCE local server — Unicode-safe
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

$port = 8765
$url = "http://127.0.0.1:$port/site/"
$index = Join-Path $PSScriptRoot 'site\index.html'

if (-not (Test-Path -LiteralPath $index)) {
  Write-Host '[ERROR] site\index.html not found. Build first:'
  Write-Host '  cd dashboard'
  Write-Host '  npm run build'
  Read-Host 'Press Enter'
  exit 1
}

$python = $null
foreach ($ver in 314, 313, 312, 311, 310) {
  $c = Join-Path $env:LOCALAPPDATA "Programs\Python\Python$ver\python.exe"
  if (Test-Path -LiteralPath $c) { $python = $c; break }
}
if (-not $python) {
  $cmd = Get-Command python -ErrorAction SilentlyContinue
  if ($cmd -and $cmd.Source -notmatch 'WindowsApps') { $python = $cmd.Source }
}
if (-not $python) {
  Write-Host '[ERROR] Python not found'
  Read-Host 'Press Enter'
  exit 1
}

# free stale listener on this port
Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
  Where-Object { $_.State -eq 'Listen' } |
  ForEach-Object {
    try { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } catch {}
  }

Write-Host 'FORCE log'
Write-Host "Python: $python"
Write-Host "Root:   $PSScriptRoot"
Write-Host "Open:   $url"
Write-Host 'Stop:   close this window or Ctrl+C'
Write-Host ''

$proc = Start-Process -FilePath $python `
  -ArgumentList @('-m', 'http.server', "$port", '--bind', '127.0.0.1') `
  -WorkingDirectory $PSScriptRoot `
  -PassThru `
  -WindowStyle Hidden

$ready = $false
for ($i = 0; $i -lt 40; $i++) {
  Start-Sleep -Milliseconds 150
  if ($proc.HasExited) { break }
  try {
    $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 1
    if ($r.StatusCode -eq 200) { $ready = $true; break }
  } catch {}
}

if (-not $ready) {
  Write-Host '[ERROR] Server failed to start.'
  if (-not $proc.HasExited) { Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue }
  Read-Host 'Press Enter'
  exit 1
}

Write-Host 'Server OK — opening browser...'
Start-Process $url

try {
  Wait-Process -Id $proc.Id
} finally {
  if (-not $proc.HasExited) {
    Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
  }
}
