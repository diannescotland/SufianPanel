@echo off
title Sufian Panel - First Time Setup
color 0A

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║            SUFIAN PANEL - FIRST TIME SETUP                 ║
echo ║                  Design Studio Manager                     ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM ============================================
REM Check Prerequisites
REM ============================================

echo [Step 1/6] Checking prerequisites...
echo.

REM Check Python
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo ╔════════════════════════════════════════════════════════════╗
    echo ║  ERROR: Python is not installed!                          ║
    echo ╠════════════════════════════════════════════════════════════╣
    echo ║  Please download and install Python 3.11 or higher:       ║
    echo ║                                                            ║
    echo ║  https://www.python.org/downloads/                        ║
    echo ║                                                            ║
    echo ║  IMPORTANT: Check "Add Python to PATH" during install!    ║
    echo ╚════════════════════════════════════════════════════════════╝
    echo.
    echo Opening download page...
    start https://www.python.org/downloads/
    pause
    exit /b 1
)
echo    [OK] Python found

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo ╔════════════════════════════════════════════════════════════╗
    echo ║  ERROR: Node.js is not installed!                         ║
    echo ╠════════════════════════════════════════════════════════════╣
    echo ║  Please download and install Node.js 18 LTS or higher:    ║
    echo ║                                                            ║
    echo ║  https://nodejs.org/                                      ║
    echo ║                                                            ║
    echo ║  Choose the LTS (Long Term Support) version.              ║
    echo ╚════════════════════════════════════════════════════════════╝
    echo.
    echo Opening download page...
    start https://nodejs.org/
    pause
    exit /b 1
)
echo    [OK] Node.js found
echo.

REM ============================================
REM Setup Backend
REM ============================================

echo [Step 2/6] Setting up backend...
cd /d "%~dp0backend"

if not exist "venv" (
    echo    Creating Python virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat
echo    Installing Python packages (this may take a minute)...
pip install -r requirements.txt -q
echo    [OK] Backend packages installed
echo.

REM ============================================
REM Setup Database
REM ============================================

echo [Step 3/6] Setting up database...
python manage.py migrate --run-syncdb -v 0
echo    [OK] Database ready

REM Seed AI tools
python manage.py seed_tools 2>nul
echo    [OK] AI tools loaded
echo.

REM ============================================
REM Setup Frontend
REM ============================================

echo [Step 4/6] Setting up frontend...
cd /d "%~dp0frontend"

if not exist "node_modules" (
    echo    Installing frontend packages (this may take 2-3 minutes)...
    call npm install --silent
)
echo    [OK] Frontend packages installed
echo.

REM ============================================
REM Create Desktop Shortcut
REM ============================================

echo [Step 5/6] Creating desktop shortcut...
cd /d "%~dp0"
cscript //nologo create-shortcut.vbs
echo    [OK] Desktop shortcut created
echo.

REM ============================================
REM Done!
REM ============================================

echo [Step 6/6] Setup complete!
echo.
color 0A
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║              SETUP COMPLETED SUCCESSFULLY!                 ║
echo ║                                                            ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║                                                            ║
echo ║  A shortcut "Sufian Panel" has been created on your       ║
echo ║  desktop. Double-click it to start the application.       ║
echo ║                                                            ║
echo ║  To stop the application, close the terminal windows      ║
echo ║  or double-click "stop.bat" in this folder.               ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Would you like to start the application now? (Y/N)
set /p START_NOW="> "
if /i "%START_NOW%"=="Y" (
    call "%~dp0start.bat"
)

pause
