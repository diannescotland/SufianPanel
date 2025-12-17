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
    echo 1. Ouvrez Docker Desktop depuis le menu Demarrer
    echo 2. Attendez que l'icone devienne verte (en bas a gauche)
    echo 3. Relancez ce fichier
    echo.
    pause
    exit /b 1
)

echo [OK] Docker est pret
echo.

:: Check if images exist (first run detection)
docker images sufianpanel-backend --format "{{.Repository}}" 2>nul | findstr "sufianpanel-backend" >nul
if %ERRORLEVEL% NEQ 0 (
    echo ========================================
    echo    PREMIERE INSTALLATION EN COURS...
    echo ========================================
    echo.
    echo Telechargement et configuration des composants.
    echo Cela peut prendre 3-5 minutes. Veuillez patienter...
    echo.

    :: First run - show progress (not detached)
    docker compose up --build
) else (
    echo Demarrage de l'application...
    echo.

    :: Normal run - detached mode
    docker compose up -d

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
)

pause
