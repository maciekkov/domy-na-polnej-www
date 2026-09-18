@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Zainstaluj Node.js 22.12 lub nowszy.
  pause
  exit /b 1
)
call npm ci
if errorlevel 1 goto failed
call npm test
if errorlevel 1 goto failed
call npm run build
if errorlevel 1 goto failed
call npm run test:dist
if errorlevel 1 goto failed
echo.
echo Build i kontrola dist zakonczone. Wynik: %CD%\dist
echo Przed publikacja wykonaj testy interfejsu wedlug AUDYT_POPRAWEK_7-12.md.
start "" explorer "%CD%\dist"
pause
exit /b 0
:failed
echo.
echo PRZERWANO: sprawdz blad powyzej. Nie wdrazaj starego dist.
pause
exit /b 1
