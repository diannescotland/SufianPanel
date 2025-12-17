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
echo Dossier: %CD%
echo.

:: Check if Docker is running
echo Verification de Docker...
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo [ERREUR] Docker n'est pas demarre!
    echo.
    echo 1. Ouvrez Docker Desktop depuis le menu Demarrer
    echo 2. Attendez que l'icone devienne verte (en bas a gauche)
    echo 3. Relancez ce fichier
    echo.
    echo Appuyez sur une touche pour fermer...
    pause >nul
    exit /b 1
)

echo [OK] Docker est pret
echo.

:: Check if docker-compose.yml exists
if not exist "docker-compose.yml" (
    color 0C
    echo [ERREUR] Fichier docker-compose.yml non trouve!
    echo Verifiez que vous avez extrait tous les fichiers.
    echo.
    echo Appuyez sur une touche pour fermer...
    pause >nul
    exit /b 1
)

echo ========================================
echo    DEMARRAGE DE L'APPLICATION...
echo ========================================
echo.
echo Cela peut prendre 3-5 minutes la premiere fois.
echo Veuillez patienter...
echo.

:: Start containers with visible output
docker compose up --build

:: If we get here, user closed with Ctrl+C or there was an error
echo.
echo ========================================
echo    APPLICATION ARRETEE
echo ========================================
echo.
echo Appuyez sur une touche pour fermer...
pause >nul
