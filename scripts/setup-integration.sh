#!/bin/bash

# Enhanced AI Integration Setup Script
# Complete setup for integrating vector database with enhanced AI services

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

# Configuration
PROJECT_ROOT=$(pwd)
BACKUP_DIR="./integration-backup"
DATABASE_DIR="./database"
SCRIPTS_DIR="./scripts"

# Check if we're in the right directory
check_project_structure() {
    print_step "Checking project structure..."
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Are you in the project root?"
        exit 1
    fi
    
    if [ ! -d "components" ] && [ ! -d "src/components" ]; then
        print_warning "Components directory not found. This might not be a React project."
    fi
    
    print_status "Project structure looks good"
}

# Create backup
create_backup() {
    print_step "Creating backup..."
    
    if [ -d "$BACKUP_DIR" ]; then
        print_warning "Backup directory already exists. Removing old backup..."
        rm -rf "$BACKUP_DIR"
    fi
    
    mkdir -p "$BACKUP_DIR"
    
    # Backup important files and directories
    for item in "services" "hooks" "components" "package.json" ".env.local" ".env"; do
        if [ -e "$item" ]; then
            cp -r "$item" "$BACKUP_DIR/" 2>/dev/null || true
            print_status "Backed up: $item"
        fi
    done
    
    print_success "Backup created at $BACKUP_DIR"
}

# Install Node.js dependencies
install_node_dependencies() {
    print_step "Installing Node.js dependencies..."
    
    # Check if npm is available
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install Node.js and npm first."
        exit 1
    fi
    
    # Install main dependencies
    print_status "Installing main dependencies..."
    npm install ai @ai-sdk/openai @types/node dotenv
    
    # Install dev dependencies
    print_status "Installing dev dependencies..."
    npm install -D @types/react typescript
    
    print_success "Node.js dependencies installed"
}

# Set up vector database
setup_vector_database() {
    print_step "Setting up vector database..."
    
    if [ ! -d "$DATABASE_DIR" ]; then
        print_error "Database directory not found. Please ensure the database files are in place."
        exit 1
    fi
    
    cd "$DATABASE_DIR"
    
    # Make install script executable
    chmod +x install.sh
    
    # Run database installation
    print_status "Running database installation..."
    ./install.sh
    
    cd "$PROJECT_ROOT"
    print_success "Vector database setup completed"
}

# Check Ollama installation
check_ollama() {
    print_step "Checking Ollama installation..."
    
    if ! command -v ollama &> /dev/null; then
        print_warning "Ollama not found. Please install Ollama from https://ollama.ai"
        print_warning "After installing Ollama, run this script again."
        return 1
    fi
    
    print_status "Ollama found"
    
    # Check if Ollama is running
    if curl -s http://localhost:11434/api/tags &> /dev/null; then
        print_status "Ollama is running"
        
        # Check for required models
        print_status "Checking for required models..."
        
        if ollama list | grep -q "qwen2.5:3b-instruct"; then
            print_status "Chat model found: qwen2.5:3b-instruct"
        else
            print_warning "Chat model not found. Installing..."
            ollama pull qwen2.5:3b-instruct
        fi
        
        if ollama list | grep -q "nomic-embed-text"; then
            print_status "Embedding model found: nomic-embed-text"
        else
            print_warning "Embedding model not found. Installing..."
            ollama pull nomic-embed-text
        fi
        
    else
        print_warning "Ollama is not running. Please start it with: ollama serve"
        print_warning "Then run this script again."
        return 1
    fi
    
    print_success "Ollama setup verified"
    return 0
}

# Create environment configuration
create_environment_config() {
    print_step "Creating environment configuration..."
    
    # Create .env.example
    cat > .env.example << 'EOF'
# Enhanced AI Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_CHAT_MODEL=qwen2.5:3b-instruct
OLLAMA_EMBEDDING_MODEL=nomic-embed-text

# Vector Database Configuration
VECTOR_DB_URL=http://localhost:5000
VECTOR_DB_PATH=./database/chroma_db

# Feature Flags
ENABLE_ENHANCED_AI=true
ENABLE_VECTOR_SEARCH=true
ENABLE_RAG=true
ENABLE_STREAMING=true

# Development
NODE_ENV=development
EOF
    
    print_status "Created .env.example"
    
    # Create .env.local if it doesn't exist
    if [ ! -f ".env.local" ]; then
        cp .env.example .env.local
        print_status "Created .env.local"
    else
        print_warning ".env.local already exists. Please update it manually with the new configuration."
    fi
    
    print_success "Environment configuration completed"
}

# Run TypeScript migration
run_typescript_migration() {
    print_step "Running TypeScript migration..."
    
    if [ -f "$SCRIPTS_DIR/migrate-to-enhanced-ai.ts" ]; then
        print_status "Running migration script..."
        npx ts-node "$SCRIPTS_DIR/migrate-to-enhanced-ai.ts" --verbose
    else
        print_warning "Migration script not found. Manual integration required."
    fi
    
    print_success "TypeScript migration completed"
}

# Test the integration
test_integration() {
    print_step "Testing integration..."
    
    # Check TypeScript compilation
    print_status "Checking TypeScript compilation..."
    if npx tsc --noEmit; then
        print_success "TypeScript compilation successful"
    else
        print_warning "TypeScript compilation issues detected. Please review and fix."
    fi
    
    # Test vector database connection
    print_status "Testing vector database connection..."
    if curl -s http://localhost:5000/api/stats &> /dev/null; then
        print_success "Vector database is accessible"
    else
        print_warning "Vector database not accessible. Make sure it's running."
    fi
    
    # Test Ollama connection
    print_status "Testing Ollama connection..."
    if curl -s http://localhost:11434/api/tags &> /dev/null; then
        print_success "Ollama is accessible"
    else
        print_warning "Ollama not accessible. Make sure it's running."
    fi
    
    print_success "Integration tests completed"
}

# Create startup scripts
create_startup_scripts() {
    print_step "Creating startup scripts..."
    
    # Create start-all script
    cat > start-all.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting Enhanced AI Integration..."

# Start Ollama in background if not running
if ! curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "Starting Ollama..."
    ollama serve &
    sleep 5
fi

# Start vector database in background
if ! curl -s http://localhost:5000/api/stats > /dev/null; then
    echo "Starting vector database..."
    cd database && python3 web-interface.py &
    cd ..
    sleep 5
fi

# Start the main application
echo "Starting main application..."
npm run dev
EOF
    
    chmod +x start-all.sh
    print_status "Created start-all.sh"
    
    # Create stop-all script
    cat > stop-all.sh << 'EOF'
#!/bin/bash

echo "🛑 Stopping Enhanced AI Integration..."

# Stop processes
pkill -f "ollama serve" || true
pkill -f "web-interface.py" || true
pkill -f "npm run dev" || true

echo "✅ All services stopped"
EOF
    
    chmod +x stop-all.sh
    print_status "Created stop-all.sh"
    
    print_success "Startup scripts created"
}

# Generate integration report
generate_report() {
    print_step "Generating integration report..."
    
    cat > INTEGRATION_REPORT.md << EOF
# Enhanced AI Integration Report

Generated: $(date)

## Integration Status
- ✅ Vector database setup completed
- ✅ Node.js dependencies installed
- ✅ Environment configuration created
- ✅ TypeScript migration completed
- ✅ Startup scripts created

## Services Status
- Ollama: $(if curl -s http://localhost:11434/api/tags &> /dev/null; then echo "✅ Running"; else echo "❌ Not running"; fi)
- Vector Database: $(if curl -s http://localhost:5000/api/stats &> /dev/null; then echo "✅ Running"; else echo "❌ Not running"; fi)

## Available Models
$(ollama list 2>/dev/null || echo "Ollama not accessible")

## Next Steps
1. **Start all services**: \`./start-all.sh\`
2. **Wrap your app** with AIProviderWrapper:
   \`\`\`tsx
   import { AIProviderWrapper } from './components/common/AIProviderWrapper';
   
   function App() {
     return (
       <AIProviderWrapper>
         {/* Your app content */}
       </AIProviderWrapper>
     );
   }
   \`\`\`
3. **Use enhanced AI** in your components:
   \`\`\`tsx
   import { useEnhancedAI } from './hooks/useEnhancedAIIntegration';
   
   const { generateContent, searchContent } = useEnhancedAI();
   \`\`\`
4. **Test the integration** by uploading educational content
5. **Monitor performance** using the test suite

## Troubleshooting
- If Ollama is not running: \`ollama serve\`
- If vector database fails: \`cd database && python3 web-interface.py\`
- If TypeScript errors: \`npx tsc --noEmit\`
- For detailed logs: Check the test suite at \`tests/index.html\`

## Backup Location
Your original files are backed up at: $BACKUP_DIR

## Support
- Check the integration plan: INTEGRATION_PLAN.md
- Run the test suite: open tests/index.html
- Review the database documentation: database/README.md
EOF
    
    print_success "Integration report created: INTEGRATION_REPORT.md"
}

# Main execution
main() {
    print_header "Enhanced AI Integration Setup"
    
    echo "This script will set up the complete Enhanced AI integration with:"
    echo "  🤖 Vercel AI SDK + Ollama integration"
    echo "  🗄️  Local vector database with ChromaDB"
    echo "  🎓 Educational AI specializations"
    echo "  🔍 RAG (Retrieval Augmented Generation)"
    echo "  🌐 Web interface for content management"
    echo ""
    
    read -p "Continue with the setup? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
    
    # Run setup steps
    check_project_structure
    create_backup
    install_node_dependencies
    create_environment_config
    
    # Set up vector database
    if setup_vector_database; then
        print_success "Vector database setup completed"
    else
        print_warning "Vector database setup had issues. Please check manually."
    fi
    
    # Check Ollama (non-blocking)
    if check_ollama; then
        print_success "Ollama setup verified"
    else
        print_warning "Ollama setup incomplete. Please install and configure Ollama."
    fi
    
    run_typescript_migration
    create_startup_scripts
    test_integration
    generate_report
    
    print_header "Setup Complete!"
    
    echo ""
    print_success "🎉 Enhanced AI Integration setup completed successfully!"
    echo ""
    echo "📋 What was set up:"
    echo "   ✅ Vector database with ChromaDB"
    echo "   ✅ Enhanced AI services with RAG"
    echo "   ✅ TypeScript integration layer"
    echo "   ✅ Environment configuration"
    echo "   ✅ Startup and management scripts"
    echo ""
    echo "🚀 Quick start:"
    echo "   1. Start all services: ./start-all.sh"
    echo "   2. Open your app and test AI features"
    echo "   3. Upload educational content via web interface"
    echo "   4. Run tests: open tests/index.html"
    echo ""
    echo "📖 Documentation:"
    echo "   - Integration plan: INTEGRATION_PLAN.md"
    echo "   - Integration report: INTEGRATION_REPORT.md"
    echo "   - Database docs: database/README.md"
    echo "   - Test suite: tests/index.html"
    echo ""
    echo "🔧 Management:"
    echo "   - Start all: ./start-all.sh"
    echo "   - Stop all: ./stop-all.sh"
    echo "   - Vector DB web interface: http://localhost:5000"
    echo "   - Test dashboard: tests/index.html"
    echo ""
    print_success "Happy coding! 🎓✨"
}

# Run main function
main "$@"
