@echo off
setlocal enabledelayedexpansion
title Sufian Panel - Launcher
color 0B

:: Change to the directory where this script is located
cd /d "%~dp0"

:: Configuration
set "DOCKER_DESKTOP_PATH=C:\Program Files\Docker\Docker\Docker Desktop.exe"
set "DOCKER_CLI_PATH=C:\Program Files\Docker\Docker\resources\bin"
set "MAX_WAIT_SECONDS=120"
set "CHECK_INTERVAL=5"

:: Add Docker to PATH
set PATH=%PATH%;%DOCKER_CLI_PATH%;%LOCALAPPDATA%\Microsoft\WindowsApps

echo.
echo ========================================
echo       SUFIAN PANEL - LAUNCHER
echo ========================================
echo.

:: ===== Step 1: Check if Docker Desktop is installed =====
echo [1/4] Checking Docker Desktop installation...
if not exist "%DOCKER_DESKTOP_PATH%" (
    color 0C
    echo.
    echo ========================================
    echo [ERROR] Docker Desktop not found!
    echo ========================================
    echo.
    echo Expected location: %DOCKER_DESKTOP_PATH%
    echo.
    echo Please install Docker Desktop from:
    echo https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)
echo [OK] Docker Desktop is installed.
echo.

:: ===== Step 2: Check if Docker daemon is already running =====
echo [2/4] Checking if Docker is running...
docker version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Docker is already running!
    echo.
    goto :start_app
)

:: ===== Step 3: Start Docker Desktop =====
echo [INFO] Docker is not running. Starting Docker Desktop...
echo.

:: Check if Docker Desktop process is already starting
tasklist /FI "IMAGENAME eq Docker Desktop.exe" 2>nul | find /I "Docker Desktop.exe" >nul
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Docker Desktop is starting up...
) else (
    echo [INFO] Launching Docker Desktop...
    start "" "%DOCKER_DESKTOP_PATH%"
)

:: ===== Step 4: Wait for Docker daemon to be ready =====
echo.
echo [3/4] Waiting for Docker daemon to be ready...
echo      (This may take 30-60 seconds)
echo.

set /a "elapsed=0"
set /a "dots=0"

:wait_loop
:: Check if Docker is ready
docker version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo.
    echo.
    echo [OK] Docker daemon is ready! (took !elapsed! seconds)
    echo.
    goto :start_app
)

:: Check timeout
if !elapsed! GEQ %MAX_WAIT_SECONDS% (
    echo.
    echo.
    color 0C
    echo ========================================
    echo [ERROR] Timeout waiting for Docker!
    echo ========================================
    echo.
    echo Docker daemon did not start within %MAX_WAIT_SECONDS% seconds.
    echo.
    echo Please try:
    echo 1. Open Docker Desktop manually
    echo 2. Wait for the icon to turn GREEN
    echo 3. Run this launcher again
    echo.
    pause
    exit /b 1
)

:: Show progress with animated dots
set /a "dots=(dots+1) %% 4"
if !dots! EQU 0 set "progress=."
if !dots! EQU 1 set "progress=.."
if !dots! EQU 2 set "progress=..."
if !dots! EQU 3 set "progress=...."

<nul set /p "=    Waiting!progress!  [!elapsed!s / %MAX_WAIT_SECONDS%s]   "
echo.

:: Wait and increment counter
timeout /t %CHECK_INTERVAL% /nobreak >nul
set /a "elapsed+=CHECK_INTERVAL"
goto :wait_loop

:start_app
:: ===== Step 5: Run the existing start.bat logic =====
echo [4/4] Starting Sufian Panel...
echo.

:: Check if docker-compose.yml exists
if not exist "docker-compose.yml" (
    color 0C
    echo [ERROR] docker-compose.yml not found!
    echo Please ensure all files are extracted correctly.
    echo.
    pause
    exit /b 1
)

echo ========================================
echo    STARTING APPLICATION...
echo ========================================
echo.
echo This may take 3-5 minutes on first run.
echo.

:: Build containers
docker compose build --progress=plain
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo [ERROR] Build failed!
    echo.
    pause
    exit /b 1
)

echo.
echo [OK] Build completed!
echo.
echo Starting services...
echo.

:: Open browser
start "" http://localhost:3000

:: Run containers (foreground)
docker compose up

echo.
echo ========================================
echo    APPLICATION STOPPED
echo ========================================
echo.
pause
