@echo off
title TRINETRA Development Launcher
echo ================================================
echo    TRINETRA 3D ULPIN Platform — Starting Services
echo ================================================

set "SCRIPT_DIR=%~dp0"
if exist "%SCRIPT_DIR%trinetra\backend" (
    set "PROJECT_ROOT=%SCRIPT_DIR%trinetra"
) else (
    set "PROJECT_ROOT=%SCRIPT_DIR%"
)

echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000...
start "TRINETRA Backend (FastAPI)" cmd /k "cd /d %PROJECT_ROOT%\backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Starting Vite Frontend on http://localhost:5173...
start "TRINETRA Frontend (Vite)" cmd /k "cd /d %PROJECT_ROOT%\frontend && npm run dev"

echo.
echo Both services launched in separate windows!
echo Frontend: http://localhost:5173
echo Backend:  http://127.0.0.1:8000/docs
