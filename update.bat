@echo off
setlocal enableextensions
title HexaCore - Updater
color 0B

echo.
echo  ============================================
echo    HEXACORE  -  Update / Rebuild
echo  ============================================
echo.

cd /d "%~dp0"

REM --- Pull latest source if this is a git checkout ---
where git >nul 2>nul
if not errorlevel 1 (
    if exist ".git" (
        echo  [1/4] Pulling latest changes from git...
        call git pull
        if errorlevel 1 (
            echo  [!] git pull reported a problem - continuing with local files.
        ) else (
            echo  [OK] Source updated.
        )
    ) else (
        echo  [1/4] Not a git checkout - skipping source pull.
    )
) else (
    echo  [1/4] git not found - skipping source pull.
)
echo.

REM --- Refresh dependencies ---
echo  [2/4] Updating dependencies...
call npm install
if errorlevel 1 (
    echo  [X] Dependency update failed.
    pause
    exit /b 1
)
echo  [OK] Dependencies up to date.
echo.

REM --- Rebuild ---
echo  [3/4] Rebuilding HexaCore...
call npm run build
if errorlevel 1 (
    echo  [X] Build failed.
    pause
    exit /b 1
)
echo  [OK] Build complete.
echo.

REM --- Repackage installer ---
echo  [4/4] Repackaging the Windows installer...
call npm run dist:win
if errorlevel 1 (
    echo  [X] Packaging failed.
    pause
    exit /b 1
)
echo.
echo  ============================================
echo    UPDATE COMPLETE.
echo    New installer is in:  dist\HexaCore Setup *.exe
echo  ============================================
echo.
echo  In-app auto-update: published releases are detected on launch
echo  via electron-updater ^(see src\main\updater.ts^).
echo.
pause
endlocal
