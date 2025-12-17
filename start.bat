@echo off
title Sufian Panel - Starting...
color 0B

:: Change to the directory where this script is located
cd /d "%~dp0"

echo.
echo ========================================
echo       SUFIAN PANEL - DESIGN STUDIO
echo ========================================
echo.

:: Check if Docker is running
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERREUR] Docker n'est pas demarre!
    echo.
    echo Veuillez ouvrir Docker Desktop et attendre
    echo qu'il soit pret (icone verte).
    echo.
    pause
    exit /b 1
)

echo [OK] Docker est pret
echo.
echo Demarrage de l'application...
echo (Cela peut prendre 1-2 minutes la premiere fois)
echo.

:: Start containers (try both docker-compose and docker compose)
docker compose up -d 2>nul
if %ERRORLEVEL% NEQ 0 (
    docker-compose up -d
)

if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo [ERREUR] Impossible de demarrer l'application.
    echo Verifiez que Docker Desktop fonctionne correctement.
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo    APPLICATION DEMARREE!
echo ========================================
echo.
echo Ouvrez votre navigateur:
echo http://localhost:3000
echo.
echo Pour arreter: lancez stop.bat
echo.

:: Open browser
start http://localhost:3000

pause
