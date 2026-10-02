@echo off
cd /d "%~dp0frontend"
where npm >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 22.12 or later, then run this launcher again.
  pause
  exit /b 1
)
if not exist node_modules (
  call npm ci
  if errorlevel 1 (
    pause
    exit /b 1
  )
)
call npm start
pause
