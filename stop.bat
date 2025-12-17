@echo off
title Sufian Panel - Stopping...

:: Change to the directory where this script is located
cd /d "%~dp0"

echo.
echo ========================================
echo       ARRET DE SUFIAN PANEL
echo ========================================
echo.

:: Stop containers (try both docker compose and docker-compose)
docker compose down 2>nul
if %ERRORLEVEL% NEQ 0 (
    docker-compose down
)

echo.
echo [OK] Application arretee.
echo.
pause
