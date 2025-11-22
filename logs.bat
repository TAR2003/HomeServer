@echo off
echo ========================================
echo   Home Media Server - View Logs
echo ========================================
echo.
echo Choose a service to view logs:
echo 1. All services
echo 2. Backend only
echo 3. Frontend only
echo 4. Nginx only
echo.
set /p choice="Enter choice (1-4): "

if "%choice%"=="1" (
    docker-compose logs -f
) else if "%choice%"=="2" (
    docker-compose logs -f backend
) else if "%choice%"=="3" (
    docker-compose logs -f frontend
) else if "%choice%"=="4" (
    docker-compose logs -f nginx
) else (
    echo Invalid choice!
)

pause
