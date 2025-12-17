@echo off
title Sufian Panel - Starting...
color 0B

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

:: Start containers
docker-compose up -d

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
