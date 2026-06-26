@echo off
setlocal enableextensions
title HexaCore - Installer
color 0B

echo.
echo  ============================================
echo    HEXACORE  -  Gaming Browser Installer
echo  ============================================
echo.

REM --- Move to this script's folder ---
cd /d "%~dp0"

REM --- Check Node.js ---
where node >nul 2>nul
if errorlevel 1 (
    echo  [X] Node.js was not found on this system.
    echo      Install the LTS build from https://nodejs.org  ^(v18 or newer^)
    echo      then run this installer again.
    echo.
    pause
    exit /b 1
)
for /f "delims=" %%v in ('node -v') do set NODEVER=%%v
echo  [OK] Node.js %NODEVER% detected.

REM --- Check npm ---
where npm >nul 2>nul
if errorlevel 1 (
    echo  [X] npm was not found. Reinstall Node.js with npm included.
    pause
    exit /b 1
)
echo  [OK] npm detected.
echo.

REM --- Install dependencies ---
echo  [1/3] Installing dependencies ^(this can take a few minutes^)...
call npm install
if errorlevel 1 (
    echo  [X] Dependency installation failed.
    echo      Check your internet connection and that npm can reach the registry,
    echo      then run this installer again. ^(No C++ build tools are required.^)
    pause
    exit /b 1
)
echo  [OK] Dependencies installed.
echo.

REM --- Build the app ---
echo  [2/3] Building HexaCore...
call npm run build
if errorlevel 1 (
    echo  [X] Build failed. See the log above.
    pause
    exit /b 1
)
echo  [OK] Build complete.
echo.

REM --- Package the Windows installer (NSIS .exe) ---
echo  [3/3] Packaging the Windows installer...
call npm run dist:win
if errorlevel 1 (
    echo  [X] Packaging failed. See the log above.
    pause
    exit /b 1
)
echo.
echo  ============================================
echo    DONE!  Installer created in the  dist\  folder.
echo    Look for:  dist\HexaCore Setup *.exe
echo  ============================================
echo.

REM --- Offer to launch the installer now ---
set /p RUNIT=  Launch the installer now? [Y/N] 
if /i "%RUNIT%"=="Y" (
    for %%f in ("dist\HexaCore Setup *.exe") do (
        echo  Starting %%~nxf ...
        start "" "%%f"
        goto :done
    )
    echo  [!] Could not find the setup .exe in dist\
)
:done
echo.
echo  Tip: run  dev.bat  to start HexaCore in development mode without packaging.
pause
endlocal
