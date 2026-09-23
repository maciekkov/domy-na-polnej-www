@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Zainstaluj Node.js 22.12 lub nowszy i uruchom ten plik ponownie.
  pause
  exit /b 1
)
if not exist "node_modules\vite\bin\vite.js" (
  call npm ci
  if errorlevel 1 (
    echo Instalacja zaleznosci nie powiodla sie. Sprawdz polaczenie z npm.
    pause
    exit /b 1
  )
)
call npm run dev -- --port 5174 --open
if errorlevel 1 pause
