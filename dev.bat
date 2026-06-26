@echo off
setlocal
title HexaCore - Dev Mode
cd /d "%~dp0"
where node >nul 2>nul || (echo Node.js not found - install from https://nodejs.org & pause & exit /b 1)
if not exist "node_modules" (
    echo First run - installing dependencies...
    call npm install || (echo Install failed & pause & exit /b 1)
)
echo Starting HexaCore in development mode...
call npm run dev
endlocal
