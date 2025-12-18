@echo off
title Sufian Panel - Starting...
color 0B

:: Change to the directory where this script is located
cd /d "%~dp0"

:: Add Docker to PATH (fixes PATH issues on some machines)
set PATH=%PATH%;C:\Program Files\Docker\Docker\resources\bin;%LOCALAPPDATA%\Microsoft\WindowsApps

echo.
echo ========================================
echo       SUFIAN PANEL - DESIGN STUDIO
echo ========================================
echo.
echo Dossier: %CD%
echo.

:: Check if docker-compose.yml exists
if not exist "docker-compose.yml" (
    color 0C
    echo [ERREUR] Fichier docker-compose.yml non trouve!
    echo Verifiez que vous avez extrait tous les fichiers.
    echo.
    pause
    exit /b 1
)

:: Check if Docker is running
echo Verification de Docker...
echo.
docker version
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo ========================================
    echo [ERREUR] Docker n'est pas pret!
    echo ========================================
    echo.
    echo 1. Ouvrez Docker Desktop depuis le menu Demarrer
    echo 2. Attendez que l'icone devienne VERTE
    echo 3. Relancez ce fichier
    echo.
    pause
    exit /b 1
)

echo.
echo [OK] Docker est pret
echo.

:: Clean up Docker cache to prevent layer corruption
echo Nettoyage du cache Docker...
docker system prune -f >nul 2>&1
echo [OK] Cache nettoye
echo.

echo ========================================
echo    DEMARRAGE DE L'APPLICATION...
echo ========================================
echo.
echo Cela peut prendre 3-5 minutes la premiere fois.
echo Vous verrez le progres ci-dessous:
echo.

:: Start containers with plain progress output (no-cache to avoid layer issues)
docker compose build --progress=plain --no-cache
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo [ERREUR] Echec de la construction!
    pause
    exit /b 1
)

echo.
echo [OK] Construction terminee!
echo.
echo Demarrage des services...
echo.

:: Start backend first
echo Demarrage du backend...
docker compose up -d backend

:: Wait for backend to be ready
echo.
echo Attente du backend (verification de sante)...
:wait_backend
timeout /t 2 /nobreak >nul
curl -s http://localhost:8000/api/health/ >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo    En attente...
    goto wait_backend
)
echo [OK] Backend pret!
echo.

:: Start frontend
echo Demarrage du frontend...
docker compose up -d frontend

:: Wait a moment for frontend to initialize
timeout /t 5 /nobreak >nul

:: Open browser
echo.
echo Ouverture du navigateur...
start "" http://localhost:3000

:: Show logs
echo.
echo ========================================
echo    APPLICATION DEMARREE!
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Appuyez sur Ctrl+C pour arreter.
echo.
docker compose logs -f

echo.
echo ========================================
echo    APPLICATION ARRETEE
echo ========================================
echo.
pause
