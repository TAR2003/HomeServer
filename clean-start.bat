@echo off
echo ========================================
echo   Home Media Server - Clean Restart
echo ========================================
echo.
echo WARNING: This will remove all volumes and data!
echo.
set /p confirm="Are you sure? (y/n): "

if /i "%confirm%"=="y" (
    echo.
    echo Stopping services and removing volumes...
    docker-compose down -v
    
    echo.
    echo Rebuilding and starting...
    docker-compose up --build
) else (
    echo.
    echo Operation cancelled.
)

pause
