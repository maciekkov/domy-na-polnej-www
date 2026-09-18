@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Ten podglad wymaga Node.js. Po instalacji uruchom plik ponownie.
 pause
 exit /b 1
)
start "" "http://127.0.0.1:4180"
node preview-tour.mjs
pause
