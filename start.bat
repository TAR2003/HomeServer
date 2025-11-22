@echo off
echo ========================================
echo   Home Media Server - Starting...
echo ========================================
echo.

echo Building and starting all services...
docker-compose up --build

pause
