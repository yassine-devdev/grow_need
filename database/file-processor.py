#!/usr/bin/env python3
"""
Advanced File Processing System for Vector Database
Supports PDF, DOCX, TXT, MD, and other educational file formats
"""

import os
import mimetypes
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
import logging
from dataclasses import dataclass
import hashlib
from datetime import datetime

# File processing libraries
try:
    import PyPDF2
    import docx
    import markdown
    from bs4 import BeautifulSoup
    import pandas as pd
    import json
    import yaml
except ImportError as e:
    print(f"Missing required library: {e}")
    print("Install with: pip install PyPDF2 python-docx markdown beautifulsoup4 pandas pyyaml")

import sys
import os
import importlib.util

# Add current directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

# Import setup_vector_database dynamically
spec = importlib.util.spec_from_file_location("setup_vector_database", os.path.join(current_dir, "setup-vector-database.py"))
svd = importlib.util.module_from_spec(spec)
spec.loader.exec_module(svd)

# Use the imported classes
EnhancedVectorDatabase = svd.EnhancedVectorDatabase
DatabaseConfig = svd.DatabaseConfig

logger = logging.getLogger(__name__)

@dataclass
class ProcessingResult:
    """Result of file processing"""
    success: bool
    file_path: str
    content: str
    metadata: Dict[str, Any]
    document_id: Optional[str] = None
    error: Optional[str] = None
    chunks_created: int = 0

class AdvancedFileProcessor:
    """Advanced file processor for educational content"""
    
    SUPPORTED_FORMATS = {
        '.pdf': 'PDF Document',
        '.docx': 'Word Document',
        '.doc': 'Word Document (Legacy)',
        '.txt': 'Text File',
        '.md': 'Markdown File',
        '.html': 'HTML File',
        '.csv': 'CSV Data File',
        '.json': 'JSON Data File',
        '.yaml': 'YAML Configuration',
        '.yml': 'YAML Configuration'
    }
    
    def __init__(self, database: EnhancedVectorDatabase):
        self.database = database
        self.upload_dir = Path("./uploads")
        self.processed_dir = Path("./processed")
        self.setup_directories()
    
    def setup_directories(self):
        """Create necessary directories"""
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        self.processed_dir.mkdir(parents=True, exist_ok=True)
        
        # Create subdirectories for different file types
        for ext in self.SUPPORTED_FORMATS:
            (self.processed_dir / ext[1:]).mkdir(parents=True, exist_ok=True)
    
    def get_file_info(self, file_path: Path) -> Dict[str, Any]:
        """Extract basic file information"""
        stat = file_path.stat()
        return {
            "filename": file_path.name,
            "file_extension": file_path.suffix.lower(),
            "file_size": stat.st_size,
            "created_at": datetime.fromtimestamp(stat.st_ctime).isoformat(),
            "modified_at": datetime.fromtimestamp(stat.st_mtime).isoformat(),
            "file_hash": self.calculate_file_hash(file_path),
            "mime_type": mimetypes.guess_type(str(file_path))[0]
        }
    
    def calculate_file_hash(self, file_path: Path) -> str:
        """Calculate SHA256 hash of file"""
        hash_sha256 = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_sha256.update(chunk)
        return hash_sha256.hexdigest()
    
    def extract_text_from_pdf(self, file_path: Path) -> str:
        """Extract text from PDF file"""
        try:
            text = ""
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
            return text.strip()
        except Exception as e:
            logger.error(f"Failed to extract text from PDF {file_path}: {e}")
            raise
    
    def extract_text_from_docx(self, file_path: Path) -> str:
        """Extract text from DOCX file"""
        try:
            doc = docx.Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text.strip()
        except Exception as e:
            logger.error(f"Failed to extract text from DOCX {file_path}: {e}")
            raise
    
    def extract_text_from_markdown(self, file_path: Path) -> str:
        """Extract text from Markdown file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                md_content = file.read()
            
            # Convert markdown to HTML then extract text
            html = markdown.markdown(md_content)
            soup = BeautifulSoup(html, 'html.parser')
            return soup.get_text().strip()
        except Exception as e:
            logger.error(f"Failed to extract text from Markdown {file_path}: {e}")
            raise
    
    def extract_text_from_html(self, file_path: Path) -> str:
        """Extract text from HTML file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                html_content = file.read()
            
            soup = BeautifulSoup(html_content, 'html.parser')
            return soup.get_text().strip()
        except Exception as e:
            logger.error(f"Failed to extract text from HTML {file_path}: {e}")
            raise
    
    def extract_text_from_csv(self, file_path: Path) -> str:
        """Extract text from CSV file"""
        try:
            df = pd.read_csv(file_path)
            # Convert DataFrame to text representation
            text = f"CSV Data with {len(df)} rows and {len(df.columns)} columns:\n\n"
            text += f"Columns: {', '.join(df.columns)}\n\n"
            text += df.to_string(index=False)
            return text
        except Exception as e:
            logger.error(f"Failed to extract text from CSV {file_path}: {e}")
            raise
    
    def extract_text_from_json(self, file_path: Path) -> str:
        """Extract text from JSON file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                data = json.load(file)
            
            # Convert JSON to readable text
            return json.dumps(data, indent=2, ensure_ascii=False)
        except Exception as e:
            logger.error(f"Failed to extract text from JSON {file_path}: {e}")
            raise
    
    def extract_text_from_yaml(self, file_path: Path) -> str:
        """Extract text from YAML file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                data = yaml.safe_load(file)
            
            # Convert YAML to readable text
            return yaml.dump(data, default_flow_style=False, allow_unicode=True)
        except Exception as e:
            logger.error(f"Failed to extract text from YAML {file_path}: {e}")
            raise
    
    def extract_text_from_txt(self, file_path: Path) -> str:
        """Extract text from plain text file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read().strip()
        except Exception as e:
            logger.error(f"Failed to extract text from TXT {file_path}: {e}")
            raise
    
    def extract_text(self, file_path: Path) -> str:
        """Extract text from file based on extension"""
        extension = file_path.suffix.lower()
        
        extractors = {
            '.pdf': self.extract_text_from_pdf,
            '.docx': self.extract_text_from_docx,
            '.doc': self.extract_text_from_docx,  # Try DOCX extractor for DOC
            '.txt': self.extract_text_from_txt,
            '.md': self.extract_text_from_markdown,
            '.html': self.extract_text_from_html,
            '.csv': self.extract_text_from_csv,
            '.json': self.extract_text_from_json,
            '.yaml': self.extract_text_from_yaml,
            '.yml': self.extract_text_from_yaml
        }
        
        extractor = extractors.get(extension)
        if not extractor:
            raise ValueError(f"Unsupported file format: {extension}")
        
        return extractor(file_path)
    
    def detect_content_type(self, content: str, filename: str) -> str:
        """Detect the type of educational content"""
        content_lower = content.lower()
        filename_lower = filename.lower()
        
        # Educational content type detection
        if any(word in content_lower for word in ['lesson plan', 'objective', 'activity', 'assessment']):
            return 'lesson_plan'
        elif any(word in content_lower for word in ['quiz', 'test', 'question', 'answer', 'multiple choice']):
            return 'assessment'
        elif any(word in content_lower for word in ['assignment', 'homework', 'project', 'student work']):
            return 'student_work'
        elif any(word in content_lower for word in ['parent', 'guardian', 'communication', 'progress report']):
            return 'parent_communication'
        elif any(word in filename_lower for word in ['curriculum', 'standard', 'guideline']):
            return 'curriculum'
        else:
            return 'educational_content'
    
    def extract_educational_metadata(self, content: str, filename: str) -> Dict[str, Any]:
        """Extract educational metadata from content"""
        content_lower = content.lower()
        metadata = {}
        
        # Grade level detection
        grade_patterns = [
            'kindergarten', '1st grade', '2nd grade', '3rd grade', '4th grade', '5th grade',
            'grade 1', 'grade 2', 'grade 3', 'grade 4', 'grade 5', 'grade 6',
            'elementary', 'middle school', 'high school'
        ]
        
        for pattern in grade_patterns:
            if pattern in content_lower:
                metadata['grade_level'] = pattern
                break
        
        # Subject detection
        subjects = [
            'mathematics', 'math', 'science', 'biology', 'chemistry', 'physics',
            'english', 'language arts', 'reading', 'writing', 'history',
            'social studies', 'geography', 'art', 'music', 'physical education'
        ]
        
        for subject in subjects:
            if subject in content_lower:
                metadata['subject'] = subject
                break
        
        # Topic extraction (simple keyword extraction)
        topics = []
        topic_keywords = [
            'fractions', 'multiplication', 'division', 'photosynthesis', 'solar system',
            'grammar', 'vocabulary', 'civil war', 'democracy', 'ecosystem'
        ]
        
        for keyword in topic_keywords:
            if keyword in content_lower:
                topics.append(keyword)
        
        if topics:
            metadata['topics'] = topics
        
        return metadata
    
    def process_file(self, file_path: Path, collection_name: str = None, 
                    custom_metadata: Dict[str, Any] = None) -> ProcessingResult:
        """Process a single file and add to vector database"""
        try:
            # Validate file
            if not file_path.exists():
                raise FileNotFoundError(f"File not found: {file_path}")
            
            if file_path.suffix.lower() not in self.SUPPORTED_FORMATS:
                raise ValueError(f"Unsupported file format: {file_path.suffix}")
            
            # Extract basic file info
            file_info = self.get_file_info(file_path)
            
            # Extract text content
            content = self.extract_text(file_path)
            
            if not content.strip():
                raise ValueError("No text content extracted from file")
            
            # Detect content type and collection
            content_type = self.detect_content_type(content, file_path.name)
            if not collection_name:
                collection_name = content_type
            
            # Extract educational metadata
            educational_metadata = self.extract_educational_metadata(content, file_path.name)
            
            # Combine all metadata
            metadata = {
                **file_info,
                **educational_metadata,
                "content_type": content_type,
                "processed_at": datetime.now().isoformat(),
                "processor_version": "1.0"
            }
            
            # Add custom metadata if provided
            if custom_metadata:
                metadata.update(custom_metadata)
            
            # Add to vector database
            document_id = self.database.add_document(collection_name, content, metadata)
            
            # Move file to processed directory
            processed_path = self.processed_dir / file_path.suffix[1:] / file_path.name
            processed_path.parent.mkdir(parents=True, exist_ok=True)
            file_path.rename(processed_path)
            
            # Calculate chunks created
            chunks_created = len(self.database.chunk_text(content))
            
            logger.info(f"Successfully processed file: {file_path.name} -> {document_id}")
            
            return ProcessingResult(
                success=True,
                file_path=str(file_path),
                content=content,
                metadata=metadata,
                document_id=document_id,
                chunks_created=chunks_created
            )
            
        except Exception as e:
            logger.error(f"Failed to process file {file_path}: {e}")
            return ProcessingResult(
                success=False,
                file_path=str(file_path),
                content="",
                metadata={},
                error=str(e)
            )
    
    def process_directory(self, directory_path: Path, recursive: bool = True) -> List[ProcessingResult]:
        """Process all supported files in a directory"""
        results = []
        
        if recursive:
            pattern = "**/*"
        else:
            pattern = "*"
        
        for file_path in directory_path.glob(pattern):
            if file_path.is_file() and file_path.suffix.lower() in self.SUPPORTED_FORMATS:
                result = self.process_file(file_path)
                results.append(result)
        
        return results
    
    def get_processing_stats(self, results: List[ProcessingResult]) -> Dict[str, Any]:
        """Get statistics from processing results"""
        successful = [r for r in results if r.success]
        failed = [r for r in results if not r.success]
        
        return {
            "total_files": len(results),
            "successful": len(successful),
            "failed": len(failed),
            "total_chunks": sum(r.chunks_created for r in successful),
            "file_types": {ext: len([r for r in successful if r.file_path.endswith(ext)]) 
                          for ext in self.SUPPORTED_FORMATS.keys()},
            "errors": [{"file": r.file_path, "error": r.error} for r in failed]
        }

def main():
    """Main function to demonstrate file processing"""
    print("📁 Setting up Advanced File Processor...")
    
    # Initialize database and processor
    config = DatabaseConfig()
    database = EnhancedVectorDatabase(config)
    processor = AdvancedFileProcessor(database)
    
    print(f"✅ File processor initialized")
    print(f"📂 Upload directory: {processor.upload_dir}")
    print(f"📂 Processed directory: {processor.processed_dir}")
    print(f"🔧 Supported formats: {', '.join(processor.SUPPORTED_FORMATS.keys())}")
    
    # Create sample files for testing
    sample_files = {
        "sample_lesson.txt": """
        Lesson Plan: Introduction to Fractions
        Grade Level: 4th Grade
        Subject: Mathematics
        
        Objective: Students will understand what fractions represent and identify fractions in everyday life.
        
        Materials:
        - Fraction circles
        - Pizza cutouts
        - Worksheets
        
        Activities:
        1. Introduction (10 minutes): Discuss what students know about fractions
        2. Demonstration (15 minutes): Use pizza cutouts to show 1/2, 1/4, 1/8
        3. Practice (20 minutes): Students work with fraction circles
        4. Assessment (10 minutes): Quick quiz on fraction identification
        
        Assessment: Students will correctly identify 4 out of 5 fractions shown.
        """,
        
        "sample_quiz.md": """
        # Solar System Quiz - 3rd Grade Science
        
        ## Instructions
        Answer all questions about our solar system.
        
        ## Questions
        
        1. **How many planets are in our solar system?**
           - A) 7
           - B) 8
           - C) 9
           - D) 10
           
        2. **Which planet is closest to the Sun?**
           - A) Venus
           - B) Earth
           - C) Mercury
           - D) Mars
           
        3. **True or False: The Sun is a star.**
           - True
           - False
        
        ## Answer Key
        1. B) 8
        2. C) Mercury
        3. True
        """
    }
    
    # Create sample files
    for filename, content in sample_files.items():
        file_path = processor.upload_dir / filename
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"📄 Created sample file: {filename}")
    
    # Process the upload directory
    results = processor.process_directory(processor.upload_dir)
    
    # Show processing statistics
    stats = processor.get_processing_stats(results)
    print(f"\n📊 Processing Statistics:")
    print(f"   Total files: {stats['total_files']}")
    print(f"   Successful: {stats['successful']}")
    print(f"   Failed: {stats['failed']}")
    print(f"   Total chunks created: {stats['total_chunks']}")
    
    if stats['errors']:
        print(f"   Errors:")
        for error in stats['errors']:
            print(f"     - {error['file']}: {error['error']}")
    
    print("✅ File processing complete!")

if __name__ == "__main__":
    main()
