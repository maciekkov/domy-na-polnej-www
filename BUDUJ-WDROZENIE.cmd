@echo off
setlocal
cd /d "%~dp0"
node scripts\build-portable.cjs
if errorlevel 1 (pause & exit /b 1)
echo Gotowe pliki wdrozenia znajduja sie w folderze dist.
pause
