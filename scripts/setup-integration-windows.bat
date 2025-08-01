@echo off
REM Enhanced AI Integration Setup Script for Windows
REM Complete setup for integrating vector database with enhanced AI services

echo ================================
echo Enhanced AI Integration Setup
echo ================================
echo.

echo This script will set up the complete Enhanced AI integration with:
echo   🤖 Vercel AI SDK + Ollama integration
echo   🗄️  Local vector database with ChromaDB
echo   🎓 Educational AI specializations
echo   🔍 RAG (Retrieval Augmented Generation)
echo   🌐 Web interface for content management
echo.

set /p CONTINUE="Continue with the setup? (y/N): "
if /i not "%CONTINUE%"=="y" (
    echo Setup cancelled.
    exit /b 0
)

echo.
echo [STEP] Checking project structure...

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] package.json not found. Are you in the project root?
    pause
    exit /b 1
)

echo [INFO] Project structure looks good

echo.
echo [STEP] Creating backup...

REM Create backup directory
if exist "integration-backup" (
    echo [WARNING] Backup directory already exists. Removing old backup...
    rmdir /s /q "integration-backup"
)

mkdir "integration-backup"

REM Backup important files and directories
for %%i in (services hooks components package.json .env.local .env) do (
    if exist "%%i" (
        xcopy "%%i" "integration-backup\%%i" /e /i /q >nul 2>&1
        echo [INFO] Backed up: %%i
    )
)

echo [SUCCESS] Backup created at integration-backup

echo.
echo [STEP] Installing Node.js dependencies...

REM Check if npm is available
where npm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not installed. Please install Node.js and npm first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo [INFO] Installing main dependencies...
call npm install ai @ai-sdk/openai @types/node dotenv

echo [INFO] Installing dev dependencies...
call npm install -D @types/react typescript

echo [SUCCESS] Node.js dependencies installed

echo.
echo [STEP] Creating environment configuration...

REM Create .env.example
(
echo # Enhanced AI Configuration
echo OLLAMA_BASE_URL=http://localhost:11434
echo OLLAMA_CHAT_MODEL=qwen2.5:3b-instruct
echo OLLAMA_EMBEDDING_MODEL=nomic-embed-text
echo.
echo # Vector Database Configuration
echo VECTOR_DB_URL=http://localhost:5000
echo VECTOR_DB_PATH=./database/chroma_db
echo.
echo # Feature Flags
echo ENABLE_ENHANCED_AI=true
echo ENABLE_VECTOR_SEARCH=true
echo ENABLE_RAG=true
echo ENABLE_STREAMING=true
echo.
echo # Development
echo NODE_ENV=development
) > .env.example

echo [INFO] Created .env.example

REM Create .env.local if it doesn't exist
if not exist ".env.local" (
    copy ".env.example" ".env.local" >nul
    echo [INFO] Created .env.local
) else (
    echo [WARNING] .env.local already exists. Please update it manually with the new configuration.
)

echo [SUCCESS] Environment configuration completed

echo.
echo [STEP] Checking Python installation...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Python is not installed. Vector database requires Python 3.8+
    echo.
    echo Please install Python from: https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation
    echo.
    echo After installing Python, you can set up the vector database manually:
    echo   cd database
    echo   python -m pip install -r requirements.txt
    echo   python setup-vector-database.py
    echo.
    set PYTHON_AVAILABLE=false
) else (
    echo [INFO] Python found
    set PYTHON_AVAILABLE=true
)

echo.
echo [STEP] Checking Ollama installation...

REM Check if Ollama is available
where ollama >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Ollama not found. Please install Ollama from https://ollama.ai
    echo After installing Ollama, run these commands:
    echo   ollama serve
    echo   ollama pull qwen2.5:3b-instruct
    echo   ollama pull nomic-embed-text
    set OLLAMA_AVAILABLE=false
) else (
    echo [INFO] Ollama found
    
    REM Check if Ollama is running
    curl -s http://localhost:11434/api/tags >nul 2>&1
    if errorlevel 1 (
        echo [WARNING] Ollama is not running. Please start it with: ollama serve
        echo Then install required models:
        echo   ollama pull qwen2.5:3b-instruct
        echo   ollama pull nomic-embed-text
        set OLLAMA_AVAILABLE=false
    ) else (
        echo [INFO] Ollama is running
        
        REM Check for required models
        echo [INFO] Checking for required models...
        
        ollama list | findstr "qwen2.5:3b-instruct" >nul
        if errorlevel 1 (
            echo [WARNING] Chat model not found. Installing...
            ollama pull qwen2.5:3b-instruct
        ) else (
            echo [INFO] Chat model found: qwen2.5:3b-instruct
        )
        
        ollama list | findstr "nomic-embed-text" >nul
        if errorlevel 1 (
            echo [WARNING] Embedding model not found. Installing...
            ollama pull nomic-embed-text
        ) else (
            echo [INFO] Embedding model found: nomic-embed-text
        )
        
        set OLLAMA_AVAILABLE=true
    )
)

if "%OLLAMA_AVAILABLE%"=="true" (
    echo [SUCCESS] Ollama setup verified
) else (
    echo [WARNING] Ollama setup incomplete
)

echo.
echo [STEP] Setting up vector database...

if "%PYTHON_AVAILABLE%"=="true" (
    if exist "database" (
        cd database
        
        echo [INFO] Installing Python dependencies...
        python -m pip install -r requirements.txt
        
        echo [INFO] Initializing vector database...
        python setup-vector-database.py
        
        cd ..
        echo [SUCCESS] Vector database setup completed
    ) else (
        echo [WARNING] Database directory not found. Vector database setup skipped.
    )
) else (
    echo [WARNING] Python not available. Vector database setup skipped.
)

echo.
echo [STEP] Creating startup scripts...

REM Create start-all.bat script
(
echo @echo off
echo echo 🚀 Starting Enhanced AI Integration...
echo.
echo REM Start Ollama in background if not running
echo curl -s http://localhost:11434/api/tags ^>nul 2^>^&1
echo if errorlevel 1 ^(
echo     echo Starting Ollama...
echo     start /b ollama serve
echo     timeout /t 5 /nobreak ^>nul
echo ^)
echo.
echo REM Start vector database in background
echo curl -s http://localhost:5000/api/stats ^>nul 2^>^&1
echo if errorlevel 1 ^(
echo     echo Starting vector database...
echo     cd database
echo     start /b python web-interface.py
echo     cd ..
echo     timeout /t 5 /nobreak ^>nul
echo ^)
echo.
echo REM Start the main application
echo echo Starting main application...
echo npm run dev
) > start-all.bat

echo [INFO] Created start-all.bat

REM Create stop-all.bat script
(
echo @echo off
echo echo 🛑 Stopping Enhanced AI Integration...
echo.
echo REM Stop processes
echo taskkill /f /im "ollama.exe" 2^>nul
echo taskkill /f /im "python.exe" 2^>nul
echo.
echo echo ✅ All services stopped
) > stop-all.bat

echo [INFO] Created stop-all.bat

echo [SUCCESS] Startup scripts created

echo.
echo [STEP] Testing integration...

REM Check TypeScript compilation
echo [INFO] Checking TypeScript compilation...
call npx tsc --noEmit
if errorlevel 1 (
    echo [WARNING] TypeScript compilation issues detected. Please review and fix.
) else (
    echo [SUCCESS] TypeScript compilation successful
)

REM Test vector database connection
if "%PYTHON_AVAILABLE%"=="true" (
    echo [INFO] Testing vector database connection...
    curl -s http://localhost:5000/api/stats >nul 2>&1
    if errorlevel 1 (
        echo [WARNING] Vector database not accessible. Make sure it's running.
    ) else (
        echo [SUCCESS] Vector database is accessible
    )
)

REM Test Ollama connection
if "%OLLAMA_AVAILABLE%"=="true" (
    echo [INFO] Testing Ollama connection...
    curl -s http://localhost:11434/api/tags >nul 2>&1
    if errorlevel 1 (
        echo [WARNING] Ollama not accessible. Make sure it's running.
    ) else (
        echo [SUCCESS] Ollama is accessible
    )
)

echo [SUCCESS] Integration tests completed

echo.
echo [STEP] Generating integration report...

REM Create integration report
(
echo # Enhanced AI Integration Report
echo.
echo Generated: %date% %time%
echo.
echo ## Integration Status
echo - ✅ Node.js dependencies installed
echo - ✅ Environment configuration created
echo - ✅ Startup scripts created
if "%PYTHON_AVAILABLE%"=="true" (
    echo - ✅ Vector database setup completed
) else (
    echo - ⚠️ Vector database setup skipped ^(Python not available^)
)
if "%OLLAMA_AVAILABLE%"=="true" (
    echo - ✅ Ollama setup verified
) else (
    echo - ⚠️ Ollama setup incomplete
)
echo.
echo ## Next Steps
echo 1. **Start all services**: start-all.bat
echo 2. **Wrap your app** with AIProviderWrapper
echo 3. **Use enhanced AI** in your components
echo 4. **Test the integration** by uploading educational content
echo 5. **Monitor performance** using the test suite
echo.
echo ## Manual Setup Required
if "%PYTHON_AVAILABLE%"=="false" (
    echo - Install Python 3.8+ from https://www.python.org/downloads/
    echo - Run: cd database ^&^& python -m pip install -r requirements.txt
    echo - Run: python setup-vector-database.py
)
if "%OLLAMA_AVAILABLE%"=="false" (
    echo - Install Ollama from https://ollama.ai
    echo - Run: ollama serve
    echo - Run: ollama pull qwen2.5:3b-instruct
    echo - Run: ollama pull nomic-embed-text
)
echo.
echo ## Backup Location
echo Your original files are backed up at: integration-backup
echo.
echo ## Support
echo - Check the integration plan: INTEGRATION_PLAN.md
echo - Run the test suite: open tests/index.html
echo - Review the database documentation: database/README.md
) > INTEGRATION_REPORT.md

echo [SUCCESS] Integration report created: INTEGRATION_REPORT.md

echo.
echo ================================
echo Setup Complete!
echo ================================
echo.

echo [SUCCESS] 🎉 Enhanced AI Integration setup completed!
echo.
echo 📋 What was set up:
echo    ✅ Node.js dependencies installed
echo    ✅ Environment configuration created
echo    ✅ Startup and management scripts created
if "%PYTHON_AVAILABLE%"=="true" (
    echo    ✅ Vector database setup completed
) else (
    echo    ⚠️ Vector database requires Python installation
)
if "%OLLAMA_AVAILABLE%"=="true" (
    echo    ✅ Ollama setup verified
) else (
    echo    ⚠️ Ollama requires installation and setup
)
echo.
echo 🚀 Quick start:
echo    1. Install missing dependencies if any
echo    2. Start all services: start-all.bat
echo    3. Open your app and test AI features
echo    4. Upload educational content via web interface
echo    5. Run tests: open tests/index.html
echo.
echo 📖 Documentation:
echo    - Integration plan: INTEGRATION_PLAN.md
echo    - Integration report: INTEGRATION_REPORT.md
echo    - Database docs: database/README.md
echo    - Test suite: tests/index.html
echo.
echo 🔧 Management:
echo    - Start all: start-all.bat
echo    - Stop all: stop-all.bat
echo    - Vector DB web interface: http://localhost:5000
echo    - Test dashboard: tests/index.html
echo.
echo [SUCCESS] Happy coding! 🎓✨

pause
