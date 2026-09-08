# TRINETRA — 1-Click Local Development Launcher (Root)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   TRINETRA 3D ULPIN Platform — Starting Services" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

$CurrentDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Detect if we are in trinetra-final or trinetra
if (Test-Path "$CurrentDir\trinetra\backend") {
    $ProjectRoot = "$CurrentDir\trinetra"
} elseif (Test-Path "$CurrentDir\backend") {
    $ProjectRoot = $CurrentDir
} else {
    Write-Host "Error: Could not locate backend directory." -ForegroundColor Red
    exit 1
}

# 1. Start Backend in new window
Write-Host "[1/2] Starting FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ProjectRoot\backend'; python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

# 2. Start Frontend in new window
Write-Host "[2/2] Starting Vite Frontend on http://localhost:5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ProjectRoot\frontend'; npm run dev"

Write-Host "`nBoth services launched in separate windows!" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "Backend:  http://127.0.0.1:8000/docs" -ForegroundColor White
