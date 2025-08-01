@echo off
echo 🚀 Starting Enhanced AI Integration...
echo.

REM Check if Ollama is running
echo [INFO] Checking Ollama status...
curl -s http://localhost:11434/api/tags >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Ollama is not running. Please start it manually:
    echo   ollama serve
    echo.
    echo After starting Ollama, make sure you have the required models:
    echo   ollama pull qwen2.5:3b-instruct
    echo   ollama pull nomic-embed-text
    echo.
) else (
    echo [SUCCESS] Ollama is running
)

REM Check if Vector Database is running
echo [INFO] Checking Vector Database status...
curl -s http://localhost:5000/api/stats >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Vector Database is not running.
    if exist "database\web-interface.py" (
        echo [INFO] Starting Vector Database...
        cd database
        start /b python web-interface.py
        cd ..
        echo [INFO] Vector Database starting in background...
        timeout /t 5 /nobreak >nul
    ) else (
        echo [WARNING] Vector Database files not found. Please set up the database first:
        echo   cd database
        echo   python setup-vector-database.py
        echo.
    )
) else (
    echo [SUCCESS] Vector Database is running
)

REM Start the main application
echo [INFO] Starting main application...
echo.
echo 🌐 Your enhanced AI application will start shortly...
echo 📊 Test dashboard: tests/index.html
echo 🗄️ Vector DB interface: http://localhost:5000
echo 🤖 Ollama API: http://localhost:11434
echo.

npm run dev
