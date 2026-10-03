@echo off
cd /d "%~dp0"
where npm >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 22.12+ with npm and Python 3.11 or 3.12, then reopen this launcher.
  pause
  exit /b 1
)
if not exist node_modules (
  call npm ci
  if errorlevel 1 goto failed
)
if not exist .venv goto setup
if not exist frontend\node_modules goto setup
if not exist models\multilingual-minilm\onnx\model_quantized.onnx goto setup
goto run
:setup
call npm run setup
if errorlevel 1 goto failed
:run
call npm start
pause
exit /b
:failed
echo Setup failed. Read the error above and the README troubleshooting section.
pause
exit /b 1
