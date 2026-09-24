@echo off
setlocal
cd /d "%~dp0"
call npm ci
if errorlevel 1 (pause & exit /b 1)
call npm run build:hosting
if errorlevel 1 (pause & exit /b 1)
echo Gotowe: hosting\public_html i hosting\private
pause
