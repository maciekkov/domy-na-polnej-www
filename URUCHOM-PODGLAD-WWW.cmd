@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Wymagany Node.js 22.12 lub nowszy. Zainstaluj Node i uruchom ponownie.
  pause
  exit /b 1
)
if not exist "dist\index.html" (
  node scripts\build-portable.cjs
  if errorlevel 1 (pause & exit /b 1)
)
echo Podglad: http://127.0.0.1:4173
echo Formularz w podgladzie NIE wysyla wiadomosci.
echo Zatrzymaj serwer klawiszami Ctrl+C. Nie otwieraj index.html przez file://.
echo Po uruchomieniu serwera otworz powyzszy adres w przegladarce.
node preview-server.mjs
if errorlevel 1 pause
