@echo off
title Sufian Panel - Git Setup
color 0B

cd /d "%~dp0"

echo.
echo ========================================
echo    SUFIAN PANEL - GIT SETUP
echo ========================================
echo.

:: Check if git is available
git --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERREUR] Git n'est pas installe!
    echo.
    echo 1. Telechargez Git: https://git-scm.com/download/win
    echo 2. Installez avec les options par defaut
    echo 3. Relancez ce fichier
    echo.
    pause
    exit /b 1
)

echo [OK] Git est installe
echo.

:: Check if already a git repo
if exist ".git" (
    echo [OK] Git deja configure!
    echo.
    echo Utilisez update.bat pour mettre a jour.
    echo.
    pause
    exit /b 0
)

:: Initialize git and connect to repo
echo Configuration de Git...
echo.

git init
git remote add origin https://github.com/diannescotland/SufianPanel.git
git fetch origin
git reset --hard origin/main

echo.
echo ========================================
echo    CONFIGURATION TERMINEE!
echo ========================================
echo.
echo Vous pouvez maintenant utiliser:
echo   - update.bat : pour mettre a jour
echo   - start.bat  : pour lancer l'application
echo.
pause
