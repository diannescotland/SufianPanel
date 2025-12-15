@echo off
title Sufian Panel - Stopping...

echo ========================================
echo    Stopping Sufian Panel Services
echo ========================================
echo.

REM Kill processes on ports 8000 and 3000
echo Stopping backend (port 8000)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do (
    taskkill /PID %%a /F >nul 2>nul
)

echo Stopping frontend (port 3000)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /PID %%a /F >nul 2>nul
)

echo.
echo All services stopped.
pause
