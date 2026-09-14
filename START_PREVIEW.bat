@echo off
where node >nul 2>nul
if errorlevel 1 (
  echo Do uruchomienia podgladu potrzebny jest Node.js: https://nodejs.org/
  pause
  exit /b 1
)
start "" "http://127.0.0.1:4173"
node preview-server.mjs
