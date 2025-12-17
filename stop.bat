@echo off
title Sufian Panel - Stopping...

:: Change to the directory where this script is located
cd /d "%~dp0"

:: Add Docker to PATH (fixes PATH issues on some machines)
set PATH=%PATH%;C:\Program Files\Docker\Docker\resources\bin;%LOCALAPPDATA%\Microsoft\WindowsApps

echo.
echo ========================================
echo       ARRET DE SUFIAN PANEL
echo ========================================
echo.

docker compose down

echo.
echo [OK] Application arretee.
echo.
pause
