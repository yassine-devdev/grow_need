# Enhanced Vector Database for Educational AI

A comprehensive local vector database solution with **ChromaDB**, **Ollama integration**, and **educational AI specializations**. Perfect for RAG (Retrieval Augmented Generation) applications in educational settings.

## 🎯 Features

### 🔧 Core Functionality
- **Local Vector Database** with ChromaDB
- **Ollama Integration** for embeddings and chat
- **Multi-format File Processing** (PDF, DOCX, TXT, MD, HTML, CSV, JSON, YAML)
- **Educational Content Detection** and classification
- **Automatic Chunking** and metadata extraction
- **Full-text Search** with semantic similarity
- **Backup & Restore** functionality

### 🎓 Educational Specializations
- **Lesson Plan** storage and retrieval
- **Assessment Materials** (quizzes, tests, rubrics)
- **Student Work** management
- **Parent Communications** templates
- **Curriculum Standards** alignment
- **Grade Level** and subject classification

### 🌐 Web Interface
- **File Upload** with drag-and-drop
- **Real-time Search** with relevance scoring
- **Collection Management** and statistics
- **Backup Management** with one-click restore
- **API Endpoints** for integration

### 🚀 Advanced Features
- **Smart Content Classification** based on educational context
- **Metadata Extraction** (grade level, subject, topics)
- **Chunking Strategies** optimized for educational content
- **Performance Monitoring** and analytics
- **Scalable Architecture** for growing datasets

## 📦 Installation

### Quick Start
```bash
# Clone or download the database files
cd database/

# Run the automated installer
chmod +x install.sh
./install.sh
```

### Manual Installation
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create directories
mkdir -p chroma_db uploads processed backups logs

# Install Ollama (if not already installed)
# Visit: https://ollama.ai
ollama pull nomic-embed-text
ollama pull qwen2.5:3b-instruct
```

## 🚀 Quick Start

### 1. Start Ollama
```bash
ollama serve
```

### 2. Initialize Database
```bash
source venv/bin/activate
python3 setup-vector-database.py
```

### 3. Start Web Interface
```bash
python3 web-interface.py
```

### 4. Access Web Interface
Open your browser to: **http://localhost:5000**

## 📁 Project Structure

```
database/
├── setup-vector-database.py    # Core database setup
├── file-processor.py           # Advanced file processing
├── web-interface.py            # Flask web interface
├── requirements.txt            # Python dependencies
├── install.sh                  # Automated installer
├── config.json                 # Configuration file
├── README.md                   # This file
├── chroma_db/                  # Vector database storage
├── uploads/                    # File upload directory
├── processed/                  # Processed files archive
├── backups/                    # Database backups
├── logs/                       # Application logs
└── templates/                  # Web interface templates
```

## 🔧 Configuration

### Database Configuration
```json
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
    }
}
```

### Supported File Formats
- **PDF** (.pdf) - Lesson plans, worksheets, textbooks
- **Word Documents** (.docx, .doc) - Assignments, reports
- **Text Files** (.txt) - Notes, plain text content
- **Markdown** (.md) - Documentation, formatted content
- **HTML** (.html) - Web content, online resources
- **CSV** (.csv) - Data files, grade books
- **JSON** (.json) - Structured data, configurations
- **YAML** (.yml, .yaml) - Configuration files

## 📚 Usage Examples

### Python API Usage

#### Initialize Database
```python
from setup_vector_database import EnhancedVectorDatabase, DatabaseConfig

# Initialize database
config = DatabaseConfig()
db = EnhancedVectorDatabase(config)

# Add educational content
doc_id = db.add_document(
    "lesson_plans",
    "Lesson on photosynthesis for 5th grade science...",
    {
        "title": "Photosynthesis Lesson",
        "subject": "Science",
        "grade_level": "5th",
        "topic": "Plant Biology"
    }
)
```

#### Search Content
```python
# Search for relevant content
results = db.search_documents(
    "lesson_plans", 
    "How do plants make energy?", 
    n_results=5
)

for doc in results['documents'][0]:
    print(f"Content: {doc[:200]}...")
```

#### File Processing
```python
from file_processor import AdvancedFileProcessor

# Initialize processor
processor = AdvancedFileProcessor(db)

# Process a file
result = processor.process_file(
    Path("lesson_plan.pdf"),
    collection_name="lesson_plans",
    custom_metadata={"author": "Teacher Name"}
)

if result.success:
    print(f"Document added: {result.document_id}")
```

### Web Interface Usage

1. **Upload Files**: Drag and drop educational materials
2. **Search Content**: Find relevant materials by topic or keyword
3. **Manage Collections**: Organize content by type
4. **Create Backups**: Protect your data with automated backups
5. **Monitor Performance**: View statistics and usage metrics

### API Endpoints

#### Search API
```bash
curl -X POST http://localhost:5000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "fraction lesson plans",
    "collection": "lesson_plans",
    "n_results": 5
  }'
```

#### Upload API
```bash
curl -X POST http://localhost:5000/api/upload \
  -F "file=@lesson_plan.pdf" \
  -F "collection=lesson_plans" \
  -F "title=Fractions Lesson" \
  -F "subject=Mathematics" \
  -F "grade_level=4th"
```

## 🎓 Educational Use Cases

### For Teachers
- **Lesson Plan Library**: Store and search lesson plans by topic, grade, or standard
- **Resource Management**: Organize worksheets, activities, and assessments
- **Content Discovery**: Find relevant materials for lesson planning
- **Curriculum Alignment**: Tag content with standards and learning objectives

### For Administrators
- **Curriculum Oversight**: Monitor and organize district-wide educational content
- **Resource Sharing**: Enable teachers to share and discover materials
- **Standards Tracking**: Ensure content aligns with educational standards
- **Performance Analytics**: Track usage and effectiveness of materials

### For Students
- **Study Materials**: Access organized study guides and resources
- **Research Support**: Find relevant information for projects
- **Personalized Learning**: Get content recommendations based on learning needs
- **Progress Tracking**: Monitor learning progress and achievements

## 🔄 Backup & Recovery

### Create Backup
```python
# Programmatic backup
backup_path = db.backup_database("my_backup_2024")

# Web interface: Go to /backups and click "Create Backup"
```

### Restore from Backup
```python
# Programmatic restore
db.restore_database("./backups/my_backup_2024")

# Web interface: Select backup and click "Restore"
```

### Automated Backups
```bash
# Add to crontab for daily backups
0 2 * * * cd /path/to/database && python3 -c "
from setup_vector_database import EnhancedVectorDatabase
db = EnhancedVectorDatabase()
db.backup_database('auto_backup_$(date +%Y%m%d)')
"
```

## 🔧 Advanced Configuration

### Custom Embedding Models
```python
# Use different embedding models
config = DatabaseConfig()
config.embedding_model = "all-MiniLM-L6-v2"  # Alternative model
db = EnhancedVectorDatabase(config)
```

### Custom Chunking Strategies
```python
# Adjust chunking for different content types
config.chunk_size = 500      # Smaller chunks for detailed search
config.chunk_overlap = 100   # Less overlap for efficiency
```

### Performance Optimization
```python
# Optimize for large datasets
config.max_file_size = 100 * 1024 * 1024  # 100MB max files
```

## 🐛 Troubleshooting

### Common Issues

#### Ollama Connection Failed
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Start Ollama if not running
ollama serve
```

#### Missing Embedding Model
```bash
# Install the embedding model
ollama pull nomic-embed-text
```

#### File Processing Errors
```bash
# Install missing dependencies
pip install PyPDF2 python-docx

# Check file permissions
chmod 644 uploads/*.pdf
```

#### Database Corruption
```bash
# Restore from backup
python3 -c "
from setup_vector_database import EnhancedVectorDatabase
db = EnhancedVectorDatabase()
db.restore_database('./backups/latest_backup')
"
```

### Performance Issues

#### Slow Search Performance
- Reduce chunk size for faster indexing
- Use more specific search queries
- Consider upgrading hardware (more RAM/SSD)

#### Large File Processing
- Increase `max_file_size` in configuration
- Process files in smaller batches
- Use background processing for large uploads

## 🤝 Integration with Enhanced AI

### Connect with Existing AI Services
```python
# Integration with enhanced AI service
from services.enhancedAIService import EnhancedAIService

# Use vector database for RAG
ai_service = EnhancedAIService()
search_results = db.search_documents("lesson_plans", user_query)

# Enhance AI responses with retrieved content
enhanced_response = ai_service.generate_with_context(
    user_query, 
    context=search_results['documents'][0]
)
```

### Educational AI Workflows
1. **Content-Aware Lesson Planning**: Use stored lesson plans to generate new ones
2. **Personalized Tutoring**: Retrieve relevant materials for student questions
3. **Assessment Generation**: Use existing assessments to create new quizzes
4. **Curriculum Alignment**: Ensure generated content meets standards

## 📈 Monitoring & Analytics

### Database Statistics
```python
# Get comprehensive database info
info = db.get_database_info()
print(f"Total documents: {info['total_documents']}")
print(f"Collections: {len(info['collections'])}")
```

### Usage Analytics
- Track search queries and results
- Monitor file upload patterns
- Analyze content usage by subject/grade
- Generate usage reports for administrators

## 🔒 Security & Privacy

### Data Protection
- All data stored locally (no cloud dependencies)
- File encryption for sensitive content
- Access control and user authentication
- Audit logging for compliance

### Privacy Considerations
- Student data protection (FERPA compliance)
- Secure file handling and storage
- Data retention policies
- Backup encryption

## 🚀 Future Enhancements

### Planned Features
- **Multi-language Support** for international schools
- **Advanced OCR** for scanned documents
- **Real-time Collaboration** for team-based content creation
- **Mobile App** for on-the-go access
- **Advanced Analytics** with machine learning insights
- **Integration APIs** for popular educational platforms

### Community Contributions
- Submit feature requests via GitHub issues
- Contribute code improvements and bug fixes
- Share educational content templates
- Provide feedback on user experience

---

## 📞 Support

For questions, issues, or contributions:
- Check the troubleshooting section above
- Review the configuration options
- Test with the provided examples
- Ensure all dependencies are properly installed

**Happy Learning! 🎓✨**
