@echo off
title Sufian Panel - Starting...
color 0B

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║            SUFIAN PANEL - DESIGN STUDIO                    ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM ============================================
REM Check Prerequisites
REM ============================================

REM Check if Python is available
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERROR] Python not found!
    echo.
    echo Please install Python 3.11+ from:
    echo https://www.python.org/downloads/
    echo.
    echo IMPORTANT: Check "Add Python to PATH" during installation!
    echo.
    start https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Check if Node.js is available
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERROR] Node.js not found!
    echo.
    echo Please install Node.js 18+ from:
    echo https://nodejs.org/
    echo.
    echo Choose the LTS (Long Term Support) version.
    echo.
    start https://nodejs.org/
    pause
    exit /b 1
)

REM ============================================
REM Start Backend
REM ============================================

echo [1/4] Starting Backend...
cd /d "%~dp0backend"

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo      Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment and install dependencies
call venv\Scripts\activate.bat
pip install -r requirements.txt -q 2>nul

REM Run migrations
python manage.py migrate --run-syncdb -v 0 2>nul

REM Seed tools if not already done
python manage.py seed_tools 2>nul

REM Start backend in background
start "Sufian Panel - Backend" /min cmd /c "venv\Scripts\activate.bat && python manage.py runserver 8000"

echo      [OK] Backend starting on http://localhost:8000
echo.

REM Wait for backend to start
timeout /t 3 /nobreak >nul

REM ============================================
REM Start Frontend
REM ============================================

echo [2/4] Starting Frontend...
cd /d "%~dp0frontend"

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo      Installing frontend dependencies (first run only)...
    call npm install --silent
)

REM Start frontend
start "Sufian Panel - Frontend" /min cmd /c "npm run dev"

echo      [OK] Frontend starting on http://localhost:3000
echo.

REM ============================================
REM Wait and Open Browser
REM ============================================

echo [3/4] Waiting for services to be ready...
timeout /t 5 /nobreak >nul

echo [4/4] Opening browser...
start http://localhost:3000

echo.
color 0A
echo ╔════════════════════════════════════════════════════════════╗
echo ║              ALL SERVICES STARTED!                         ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║                                                            ║
echo ║  Dashboard:  http://localhost:3000                        ║
echo ║  Backend:    http://localhost:8000                        ║
echo ║  Admin:      http://localhost:8000/admin/                 ║
echo ║                                                            ║
echo ║  To stop: Close terminal windows or run stop.bat          ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo You can minimize this window. Do not close it.
echo.
pause
