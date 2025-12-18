@echo off
title Sufian Panel - Updating...
color 0B

cd /d "%~dp0"

echo.
echo ========================================
echo       SUFIAN PANEL - UPDATE
echo ========================================
echo.

:: Check if git is available
git --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERREUR] Git n'est pas installe!
    echo.
    echo Telechargez Git: https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)

echo Mise a jour en cours...
echo.

:: Pull latest changes
git pull origin main

if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo [ERREUR] Echec de la mise a jour!
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo    MISE A JOUR TERMINEE!
echo ========================================
echo.
echo Vous pouvez maintenant lancer start.bat
echo.
pause
