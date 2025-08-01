@echo off
echo 🛑 Stopping Enhanced AI Integration...
echo.

REM Stop Node.js development server
echo [INFO] Stopping Node.js development server...
taskkill /f /im "node.exe" 2>nul
if errorlevel 1 (
    echo [INFO] No Node.js processes found
) else (
    echo [SUCCESS] Node.js processes stopped
)

REM Stop Python processes (Vector Database)
echo [INFO] Stopping Vector Database...
taskkill /f /im "python.exe" 2>nul
if errorlevel 1 (
    echo [INFO] No Python processes found
) else (
    echo [SUCCESS] Python processes stopped
)

REM Note about Ollama (don't stop it as it might be used by other applications)
echo [INFO] Ollama left running (stop manually if needed: taskkill /f /im ollama.exe)

echo.
echo ✅ Enhanced AI Integration services stopped
echo.
pause
