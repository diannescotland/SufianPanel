@echo off
title Sufian Panel - Starting...

echo ========================================
echo    Sufian Panel - Design Studio
echo ========================================
echo.

REM Check if Python is available
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python not found. Please install Python 3.10+
    pause
    exit /b 1
)

REM Check if Node.js is available
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found. Please install Node.js 18+
    pause
    exit /b 1
)

echo [1/4] Starting Backend...
cd /d "%~dp0backend"

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment and install dependencies
call venv\Scripts\activate.bat
pip install -r requirements.txt -q

REM Run migrations
python manage.py migrate --run-syncdb -v 0

REM Seed tools if not already done
python manage.py seed_tools 2>nul

REM Start backend in background
start "Sufian Panel - Backend" cmd /c "venv\Scripts\activate.bat && python manage.py runserver 8000"

echo [2/4] Backend started on http://localhost:8000
echo.

REM Wait for backend to start
timeout /t 3 /nobreak >nul

echo [3/4] Starting Frontend...
cd /d "%~dp0frontend"

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)

REM Start frontend
start "Sufian Panel - Frontend" cmd /c "npm run dev"

echo [4/4] Frontend started on http://localhost:3000
echo.

echo ========================================
echo    All services started!
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo Admin:    http://localhost:8000/admin/
echo.
echo Press any key to open the dashboard...
pause >nul

start http://localhost:3000
