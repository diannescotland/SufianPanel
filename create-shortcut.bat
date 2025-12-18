@echo off
title Creating Desktop Shortcut...
cd /d "%~dp0"

echo.
echo Running shortcut creator...
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0create-shortcut.ps1"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Failed to create shortcut.
    pause
)
