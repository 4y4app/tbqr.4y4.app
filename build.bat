@echo off
cd /d "%~dp0"

echo Installing dependencies...
call npm install
if errorlevel 1 (
    echo npm install failed.
    exit /b 1
)

echo Building site...
call npm run build
if errorlevel 1 (
    echo Build failed.
    exit /b 1
)

echo Build completed. Output: dist\
pause
