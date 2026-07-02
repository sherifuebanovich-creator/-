@echo off
echo.
echo  ██████╗  ██████╗ ██╗   ██╗██╗  ██╗
echo  ██╔══██╗██╔═══██╗██║   ██║╚██╗██╔╝
echo  ██████╔╝██║   ██║██║   ██║ ╚███╔╝ 
echo  ██╔══██╗██║   ██║╚██╗ ██╔╝ ██╔██╗ 
echo  ██║  ██║╚██████╔╝ ╚████╔╝ ██╔╝ ██╗
echo  ╚═╝  ╚═╝ ╚═════╝   ╚═══╝  ╚═╝  ╚═╝
echo.
echo  AI Navigation Platform
echo  ========================
echo.

:: Check Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker not found! Install Docker Desktop first.
    echo Download: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo [OK] Docker found
echo.
echo [*] Starting ROVX... (first run takes 5-10 minutes)
echo.

docker compose down --remove-orphans >nul 2>&1
docker compose up --build

pause
