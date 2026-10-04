@echo off
cd /d "%~dp0"
node scripts/launch.mjs
if errorlevel 1 (
 echo Install Node.js 22.12+ with npm and Python 3.11 or 3.12. Read any error above.
 pause
)
