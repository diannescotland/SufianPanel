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
echo ========================================
echo    DEMARRAGE DE L'APPLICATION...
echo ========================================
echo.
echo Cela peut prendre 3-5 minutes la premiere fois.
echo Vous verrez le progres ci-dessous:
echo.

:: Start containers with plain progress output
docker compose build --progress=plain
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

docker compose up

echo.
echo ========================================
echo    APPLICATION ARRETEE
echo ========================================
echo.
pause
