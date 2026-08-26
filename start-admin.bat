@echo off
echo Starting JeevaLife Admin...
echo.
echo [1] Starting Admin API server on port 3001...
start "JeevaLife Admin API" cmd /k "cd /d %~dp0 && node admin/server/index.js"
timeout /t 2 /nobreak > nul
echo [2] Starting Admin UI on port 5174...
start "JeevaLife Admin UI" cmd /k "cd /d %~dp0\admin && npm run dev"
echo.
echo Both services starting...
echo   API:  http://localhost:3001
echo   UI:   http://localhost:5174
echo.
pause
