@echo off
echo ========================================
echo   Home Media Server - Stopping...
echo ========================================
echo.

echo Stopping all services...
docker-compose down

echo.
echo Services stopped successfully!
pause
