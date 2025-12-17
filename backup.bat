@echo off
title Sufian Panel - Database Backup
color 0B

:: Change to script directory
cd /d "%~dp0"

echo.
echo ========================================
echo     SUFIAN PANEL - DATABASE BACKUP
echo ========================================
echo.

:: Create backups folder if it doesn't exist
if not exist "backups" mkdir backups

:: Generate timestamp
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /format:list') do set datetime=%%I
set BACKUP_NAME=db-backup-%datetime:~0,8%-%datetime:~8,4%.sqlite3

:: Check if Docker is running
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERREUR] Docker n'est pas demarre!
    echo Veuillez ouvrir Docker Desktop.
    pause
    exit /b 1
)

:: Check if container is running
docker ps --filter "name=sufian-panel-backend" --format "{{.Names}}" | findstr "sufian-panel-backend" >nul
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERREUR] L'application n'est pas demarree!
    echo Lancez start.bat d'abord.
    pause
    exit /b 1
)

:: Copy database from container
echo Creation de la sauvegarde...
docker cp sufian-panel-backend:/app/data/db.sqlite3 "backups\%BACKUP_NAME%"

if %ERRORLEVEL% EQU 0 (
    color 0A
    echo.
    echo ========================================
    echo     SAUVEGARDE CREEE AVEC SUCCES!
    echo ========================================
    echo.
    echo Fichier: backups\%BACKUP_NAME%
    echo.
) else (
    color 0C
    echo [ERREUR] Echec de la sauvegarde!
)

pause
