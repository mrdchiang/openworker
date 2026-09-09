param(
    [ValidateSet('server', 'ui')]
    [string]$Service = 'server'
)

$ErrorActionPreference = 'Stop'
$visionRoot = Split-Path $PSScriptRoot -Parent
$env:COWORKER_STATE_DIR = Join-Path $env:LOCALAPPDATA 'MACOM/VisionBeta/dev-state'
$env:COWORKER_VISION_MODE = '1'
$visionWorkspace = Join-Path $env:LOCALAPPDATA 'MACOM/VisionBeta/demo-workspace'
New-Item -ItemType Directory -Force -Path $env:COWORKER_STATE_DIR, $visionWorkspace | Out-Null

if ($Service -eq 'server') {
    Set-Location $visionRoot
    & "$visionRoot/.venv/Scripts/openworker-server.exe" --host 127.0.0.1 --port 8765 --cwd $visionWorkspace --model 'ollama:qwen3:latest'
} else {
    if (-not (Test-Path (Join-Path $env:COWORKER_STATE_DIR 'sidecar-8765.token'))) {
        throw 'Start scripts/vision-dev.ps1 server before launching the UI.'
    }
    $env:VITE_COWORKER_HTTP = 'http://127.0.0.1:8765'
    $env:VITE_COWORKER_WS = 'ws://127.0.0.1:8765'
    Set-Location (Join-Path $visionRoot 'surfaces/gui')
    & npm.cmd run dev -- --host 127.0.0.1
}
exit $LASTEXITCODE
