#!/bin/bash

# Enhanced Vector Database Installation Script
# Comprehensive setup for local vector database with educational AI integration

set -e  # Exit on any error

echo "🚀 Enhanced Vector Database Installation"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if Python is installed
check_python() {
    print_step "Checking Python installation..."
    
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
        print_status "Python $PYTHON_VERSION found"
        
        # Check if version is 3.8 or higher
        if python3 -c "import sys; exit(0 if sys.version_info >= (3, 8) else 1)"; then
            print_status "Python version is compatible (3.8+)"
        else
            print_error "Python 3.8 or higher is required. Current version: $PYTHON_VERSION"
            exit 1
        fi
    else
        print_error "Python 3 is not installed. Please install Python 3.8 or higher."
        exit 1
    fi
}

# Check if pip is installed
check_pip() {
    print_step "Checking pip installation..."
    
    if command -v pip3 &> /dev/null; then
        print_status "pip3 found"
    else
        print_error "pip3 is not installed. Please install pip3."
        exit 1
    fi
}

# Create virtual environment
create_venv() {
    print_step "Creating virtual environment..."
    
    if [ ! -d "venv" ]; then
        python3 -m venv venv
        print_status "Virtual environment created"
    else
        print_warning "Virtual environment already exists"
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    print_status "Virtual environment activated"
    
    # Upgrade pip
    pip install --upgrade pip
    print_status "pip upgraded"
}

# Install Python dependencies
install_dependencies() {
    print_step "Installing Python dependencies..."
    
    # Install core requirements
    pip install -r requirements.txt
    print_status "Core dependencies installed"
    
    # Install optional dependencies for enhanced functionality
    print_step "Installing optional dependencies..."
    
    # Try to install optional packages
    optional_packages=(
        "nltk"
        "spacy"
        "python-pptx"
        "openpyxl"
        "xlrd"
        "Pillow"
        "pytesseract"
    )
    
    for package in "${optional_packages[@]}"; do
        if pip install "$package" &> /dev/null; then
            print_status "Installed optional package: $package"
        else
            print_warning "Failed to install optional package: $package (skipping)"
        fi
    done
}

# Download spaCy model if spaCy is installed
setup_spacy() {
    print_step "Setting up spaCy language model..."
    
    if python3 -c "import spacy" &> /dev/null; then
        if python3 -m spacy download en_core_web_sm &> /dev/null; then
            print_status "spaCy English model downloaded"
        else
            print_warning "Failed to download spaCy model (optional)"
        fi
    else
        print_warning "spaCy not installed, skipping model download"
    fi
}

# Download NLTK data if NLTK is installed
setup_nltk() {
    print_step "Setting up NLTK data..."
    
    if python3 -c "import nltk" &> /dev/null; then
        python3 -c "
import nltk
try:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
    nltk.download('wordnet', quiet=True)
    print('NLTK data downloaded successfully')
except:
    print('Failed to download NLTK data (optional)')
" || print_warning "Failed to download NLTK data (optional)"
    else
        print_warning "NLTK not installed, skipping data download"
    fi
}

# Check Ollama installation
check_ollama() {
    print_step "Checking Ollama installation..."
    
    if command -v ollama &> /dev/null; then
        print_status "Ollama found"
        
        # Check if Ollama is running
        if curl -s http://localhost:11434/api/tags &> /dev/null; then
            print_status "Ollama is running"
            
            # Check for embedding model
            if ollama list | grep -q "nomic-embed-text"; then
                print_status "Embedding model 'nomic-embed-text' found"
            else
                print_warning "Embedding model 'nomic-embed-text' not found"
                print_step "Installing embedding model..."
                if ollama pull nomic-embed-text; then
                    print_status "Embedding model installed"
                else
                    print_warning "Failed to install embedding model (you can install it later)"
                fi
            fi
        else
            print_warning "Ollama is not running. Start it with: ollama serve"
        fi
    else
        print_warning "Ollama not found. Please install Ollama from https://ollama.ai"
        print_warning "After installing Ollama, run: ollama pull nomic-embed-text"
    fi
}

# Create necessary directories
create_directories() {
    print_step "Creating necessary directories..."
    
    directories=(
        "chroma_db"
        "backups"
        "uploads"
        "processed"
        "logs"
        "templates"
        "static"
    )
    
    for dir in "${directories[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            print_status "Created directory: $dir"
        else
            print_warning "Directory already exists: $dir"
        fi
    done
}

# Test the installation
test_installation() {
    print_step "Testing installation..."
    
    # Test Python imports
    python3 -c "
import chromadb
import pandas as pd
import numpy as np
import requests
print('✅ Core imports successful')
"
    
    # Test file processing imports
    python3 -c "
try:
    import PyPDF2
    import docx
    import markdown
    from bs4 import BeautifulSoup
    print('✅ File processing imports successful')
except ImportError as e:
    print(f'⚠️  Some file processing libraries missing: {e}')
"
    
    # Test web interface imports
    python3 -c "
try:
    from flask import Flask
    print('✅ Web interface imports successful')
except ImportError as e:
    print(f'❌ Web interface imports failed: {e}')
"
    
    print_status "Installation test completed"
}

# Create sample configuration
create_config() {
    print_step "Creating sample configuration..."
    
    cat > config.json << EOF
{
    "database": {
        "path": "./chroma_db",
        "backup_path": "./backups",
        "chunk_size": 1000,
        "chunk_overlap": 200,
        "max_file_size": 52428800
    },
    "ollama": {
        "url": "http://localhost:11434",
        "embedding_model": "nomic-embed-text",
        "chat_model": "qwen2.5:3b-instruct"
    },
    "web_interface": {
        "host": "0.0.0.0",
        "port": 5000,
        "debug": true
    },
    "logging": {
        "level": "INFO",
        "file": "./logs/vector_db.log"
    }
}
EOF
    
    print_status "Configuration file created: config.json"
}

# Create startup script
create_startup_script() {
    print_step "Creating startup scripts..."
    
    # Database setup script
    cat > start_database.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Enhanced Vector Database..."

# Activate virtual environment
source venv/bin/activate

# Check if Ollama is running
if ! curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "⚠️  Ollama is not running. Please start it with: ollama serve"
    echo "   Then run this script again."
    exit 1
fi

# Initialize database
echo "📊 Initializing database..."
python3 setup-vector-database.py

echo "✅ Database ready!"
EOF

    # Web interface startup script
    cat > start_web_interface.sh << 'EOF'
#!/bin/bash
echo "🌐 Starting Vector Database Web Interface..."

# Activate virtual environment
source venv/bin/activate

# Check if database exists
if [ ! -d "chroma_db" ]; then
    echo "📊 Database not found. Initializing..."
    python3 setup-vector-database.py
fi

# Start web interface
echo "🚀 Starting web server on http://localhost:5000"
python3 web-interface.py
EOF

    # Make scripts executable
    chmod +x start_database.sh
    chmod +x start_web_interface.sh
    
    print_status "Startup scripts created"
}

# Main installation function
main() {
    echo
    print_step "Starting Enhanced Vector Database installation..."
    echo
    
    # Check prerequisites
    check_python
    check_pip
    
    # Setup environment
    create_venv
    install_dependencies
    
    # Setup optional components
    setup_spacy
    setup_nltk
    
    # Check external dependencies
    check_ollama
    
    # Create project structure
    create_directories
    create_config
    create_startup_script
    
    # Test installation
    test_installation
    
    echo
    print_status "🎉 Installation completed successfully!"
    echo
    echo "📋 Next steps:"
    echo "   1. Make sure Ollama is running: ollama serve"
    echo "   2. Install embedding model: ollama pull nomic-embed-text"
    echo "   3. Start the database: ./start_database.sh"
    echo "   4. Start web interface: ./start_web_interface.sh"
    echo "   5. Access web interface: http://localhost:5000"
    echo
    echo "📁 Project structure:"
    echo "   📂 chroma_db/     - Vector database storage"
    echo "   📂 uploads/       - File upload directory"
    echo "   📂 processed/     - Processed files"
    echo "   📂 backups/       - Database backups"
    echo "   📂 logs/          - Application logs"
    echo
    echo "🔧 Configuration file: config.json"
    echo "📖 Documentation: README.md"
    echo
}

# Run main function
main "$@"
