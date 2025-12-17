@echo off
title Sufian Panel - Database Backup
color 0B

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║            SUFIAN PANEL - DATABASE BACKUP                  ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Create backups folder if it doesn't exist
if not exist "%~dp0backups" (
    mkdir "%~dp0backups"
)

REM Generate timestamp
for /f "tokens=1-3 delims=/ " %%a in ('date /t') do set DATE=%%c-%%b-%%a
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set TIME=%%a%%b

REM Set backup filename
set BACKUP_NAME=db-backup-%DATE%-%TIME%.sqlite3
set SOURCE=%~dp0backend\db.sqlite3
set DEST=%~dp0backups\%BACKUP_NAME%

REM Check if database exists
if not exist "%SOURCE%" (
    color 0C
    echo [ERROR] Database file not found!
    echo Expected location: %SOURCE%
    echo.
    echo Please run the application at least once to create the database.
    pause
    exit /b 1
)

REM Copy database
echo Creating backup...
copy "%SOURCE%" "%DEST%" >nul

if %ERRORLEVEL% EQU 0 (
    color 0A
    echo.
    echo ╔════════════════════════════════════════════════════════════╗
    echo ║              BACKUP CREATED SUCCESSFULLY!                  ║
    echo ╚════════════════════════════════════════════════════════════╝
    echo.
    echo Backup saved to:
    echo %DEST%
    echo.
) else (
    color 0C
    echo [ERROR] Failed to create backup!
)

pause
