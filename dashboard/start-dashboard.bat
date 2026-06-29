@echo off
REM Playwright BDD Test Execution Dashboard - Startup Script for Windows

echo ==========================================
echo   Playwright BDD Dashboard Startup
echo ==========================================
echo.

REM Get the directory where this script is located
cd /d "%~dp0"

REM Step 1: Build Frontend
echo Step 1: Building Frontend...
cd frontend

if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)

echo Running build...
call npm run build

if errorlevel 1 (
    echo ❌ Frontend build failed!
    pause
    exit /b 1
)

echo ✓ Frontend build completed
echo.

REM Step 2: Start Backend
echo Step 2: Starting Backend Server...
cd ../backend

if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
)

echo.
echo ==========================================
echo   🚀 Dashboard is starting...
echo ==========================================
echo.
echo 📊 Dashboard URL: http://localhost:3001
echo 🔌 API Endpoint: http://localhost:3001/api
echo.
echo Press Ctrl+C to stop the server
echo.

call npm start