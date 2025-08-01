#!/usr/bin/env python3
"""
Enhanced Vector Database Web Interface
Provides a web interface for managing educational content in the vector database
"""

import os
import sys
import logging
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple, Union
from flask import Flask, render_template, request, redirect, flash, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import importlib.util
import requests
import json

# Import mock data
from mock_data import (
    generate_school_analytics_data,
    generate_financial_data,
    generate_communication_data,
    generate_enrollment_data,
    generate_parent_portal_data,
    generate_dashboard_data
)

# Import security utilities
from security_utils import (
    InputValidator, 
    RateLimiter, 
    require_rate_limit, 
    validate_json_input,
    log_security_event
)

# Add current directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

# Import modules dynamically with proper type checking
spec1 = importlib.util.spec_from_file_location("setup_vector_database", os.path.join(current_dir, "setup-vector-database.py"))
if spec1 is None or spec1.loader is None:
    raise ImportError("Could not load setup_vector_database module")
svd = importlib.util.module_from_spec(spec1)
spec1.loader.exec_module(svd)

spec2 = importlib.util.spec_from_file_location("file_processor", os.path.join(current_dir, "file-processor.py"))
if spec2 is None or spec2.loader is None:
    raise ImportError("Could not load file_processor module")
fp = importlib.util.module_from_spec(spec2)
spec2.loader.exec_module(fp)

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'your-secret-key-change-this-in-production')

# Enable CORS for all routes with stricter configuration
CORS(app, 
     origins=['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allow_headers=['Content-Type', 'Authorization', 'X-Requested-With'],
     supports_credentials=False)

# Add health check endpoint
@app.route('/api/health')
def api_health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

# Initialize database and processor
config = svd.DatabaseConfig()
database = svd.EnhancedVectorDatabase(config)
processor = fp.AdvancedFileProcessor(database)

# Create templates directory
templates_dir = Path('templates')
templates_dir.mkdir(exist_ok=True)

def create_templates():
    """Create basic HTML templates"""
    
    # Base template
    base_template = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vector Database Interface</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .nav { display: flex; gap: 20px; margin-bottom: 30px; }
        .nav a { padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; }
        .nav a:hover { background: #0056b3; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
        .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
        .btn { padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; }
        .btn:hover { background: #218838; }
        .results { margin-top: 20px; }
        .result-item { padding: 15px; margin: 10px 0; background: #f8f9fa; border-left: 4px solid #007bff; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🗄️ Vector Database Interface</h1>
            <p>Enhanced AI Educational Content Management</p>
        </div>
        <div class="nav">
            <a href="/">Dashboard</a>
            <a href="/upload">Upload Content</a>
            <a href="/search">Search</a>
            <a href="/stats">Statistics</a>
        </div>
        {% block content %}{% endblock %}
    </div>
</body>
</html>'''
    
    # Dashboard template
    dashboard_template = '''{% extends "base.html" %}
{% block content %}
<h2>📊 Database Dashboard</h2>
<div class="stats">
    <p><strong>Total Documents:</strong> {{ stats.total_documents }}</p>
    <p><strong>Collections:</strong> {{ stats.collections|length }}</p>
    <p><strong>Database Path:</strong> {{ stats.database_path }}</p>
</div>
<h3>📁 Collections</h3>
{% for collection, info in stats.collections.items() %}
<div class="result-item">
    <strong>{{ collection }}</strong>: {{ info.count }} documents
</div>
{% endfor %}
{% endblock %}'''
    
    # Upload template
    upload_template = '''{% extends "base.html" %}
{% block content %}
<h2>📁 Upload Educational Content</h2>
<form method="post" enctype="multipart/form-data">
    <div class="form-group">
        <label for="file">Select File:</label>
        <input type="file" name="file" id="file" accept=".pdf,.docx,.txt,.md" required>
    </div>
    <div class="form-group">
        <label for="title">Title:</label>
        <input type="text" name="title" id="title">
    </div>
    <div class="form-group">
        <label for="subject">Subject:</label>
        <input type="text" name="subject" id="subject">
    </div>
    <div class="form-group">
        <label for="grade_level">Grade Level:</label>
        <input type="text" name="grade_level" id="grade_level">
    </div>
    <div class="form-group">
        <label for="content_type">Content Type:</label>
        <select name="content_type" id="content_type">
            <option value="lesson_plan">Lesson Plan</option>
            <option value="worksheet">Worksheet</option>
            <option value="assessment">Assessment</option>
            <option value="resource">Resource</option>
        </select>
    </div>
    <div class="form-group">
        <label for="description">Description:</label>
        <textarea name="description" id="description" rows="3"></textarea>
    </div>
    <button type="submit" class="btn">Upload</button>
</form>
{% endblock %}'''
    
    # Search template
    search_template = '''{% extends "base.html" %}
{% block content %}
<h2>🔍 Search Content</h2>
<form method="post">
    <div class="form-group">
        <label for="query">Search Query:</label>
        <input type="text" name="query" id="query" placeholder="Enter your search terms..." required>
    </div>
    <div class="form-group">
        <label for="collection">Collection:</label>
        <select name="collection" id="collection">
            <option value="educational_content">All Content</option>
            <option value="lesson_plans">Lesson Plans</option>
            <option value="assessments">Assessments</option>
            <option value="resources">Resources</option>
        </select>
    </div>
    <button type="submit" class="btn">Search</button>
</form>
{% if results %}
<div class="results">
    <h3>Search Results ({{ results|length }} found)</h3>
    {% for result in results %}
    <div class="result-item">
        <h4>{{ result.metadata.title or 'Untitled' }}</h4>
        <p>{{ result.content[:200] }}...</p>
        <small>Subject: {{ result.metadata.subject or 'N/A' }} | Grade: {{ result.metadata.grade_level or 'N/A' }}</small>
    </div>
    {% endfor %}
</div>
{% endif %}
{% endblock %}'''
    
    # Write templates with UTF-8 encoding
    with open(templates_dir / 'base.html', 'w', encoding='utf-8') as f:
        f.write(base_template)

    with open(templates_dir / 'index.html', 'w', encoding='utf-8') as f:
        f.write(dashboard_template)

    with open(templates_dir / 'upload.html', 'w', encoding='utf-8') as f:
        f.write(upload_template)

    with open(templates_dir / 'search.html', 'w', encoding='utf-8') as f:
        f.write(search_template)
    
    print("HTML templates created successfully")

# Create templates on startup
create_templates()

@app.route('/')
def index():
    """Dashboard page"""
    try:
        stats = database.get_database_stats()
        return render_template('index.html', stats=stats)
    except Exception as e:
        flash(f'Error loading dashboard: {str(e)}', 'error')
        return render_template('index.html', stats={'total_documents': 0, 'collections': {}, 'database_path': 'Unknown'})

@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    """Upload file page"""
    if request.method == 'POST':
        try:
            if 'file' not in request.files:
                flash('No file selected', 'error')
                return redirect(request.url)
            
            file = request.files['file']
            if file.filename == '':
                flash('No file selected', 'error')
                return redirect(request.url)
            
            # Get metadata from form
            metadata = {
                'title': request.form.get('title', ''),
                'subject': request.form.get('subject', ''),
                'grade_level': request.form.get('grade_level', ''),
                'content_type': request.form.get('content_type', ''),
                'description': request.form.get('description', ''),
                'uploaded_at': datetime.now().isoformat()
            }
            
            # Save and process file
            if file.filename is None:
                return jsonify({'error': 'No filename provided'}), 400
            filename = secure_filename(file.filename)
            file_path = processor.upload_dir / filename
            file.save(file_path)
            
            # Process the file
            result = processor.process_file(file_path, metadata)
            
            if result.success:
                flash(f'File uploaded successfully! Created {result.chunks_created} chunks.', 'success')
            else:
                flash(f'Upload failed: {result.error}', 'error')
            
        except Exception as e:
            flash(f'Upload error: {str(e)}', 'error')
    
    return render_template('upload.html')

@app.route('/search', methods=['GET', 'POST'])
def search():
    """Search page"""
    results = []
    if request.method == 'POST':
        try:
            query = request.form.get('query', '')
            collection = request.form.get('collection', 'educational_content')
            
            if query:
                search_results = database.search_documents(query, collection, n_results=10)
                
                # Format results
                if search_results and search_results.get('documents'):
                    for i, doc in enumerate(search_results['documents'][0]):
                        metadata = search_results.get('metadatas', [[]])[0][i] if search_results.get('metadatas') else {}
                        results.append({
                            'content': doc,
                            'metadata': metadata,
                            'distance': search_results.get('distances', [[]])[0][i] if search_results.get('distances') else 0
                        })
                
        except Exception as e:
            flash(f'Search error: {str(e)}', 'error')
    
    return render_template('search.html', results=results)

# API Endpoints for React Integration
@app.route('/api/stats')
def api_stats():
    """API endpoint for database statistics"""
    try:
        stats = database.get_database_stats()
        return jsonify(stats)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/search', methods=['POST'])
def api_search():
    """API endpoint for content search"""
    try:
        data = request.get_json()
        query = data.get('query', '')
        collection = data.get('collection', 'educational_content')
        n_results = data.get('n_results', 5)

        results = database.search_documents(collection, query, n_results)
        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/upload', methods=['POST'])
def api_upload():
    """API endpoint for file upload"""
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file provided'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400

        # Get metadata from form
        metadata = {
            'title': request.form.get('title', ''),
            'subject': request.form.get('subject', ''),
            'grade_level': request.form.get('grade_level', ''),
            'content_type': request.form.get('content_type', ''),
            'description': request.form.get('description', ''),
            'uploaded_at': datetime.now().isoformat()
        }

        # Save and process file
        if file.filename is None:
            return jsonify({'error': 'No filename provided'}), 400
        filename = secure_filename(file.filename)
        file_path = processor.upload_dir / filename
        file.save(file_path)

        # Process the file
        result = processor.process_file(file_path, metadata)

        return jsonify({
            'success': result.success,
            'document_id': result.document_id if result.success else None,
            'chunks_created': result.chunks_created if result.success else 0,
            'error': result.error if not result.success else None
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/backup', methods=['POST'])
def api_backup():
    """API endpoint for database backup"""
    try:
        backup_path = database.backup_database()
        return jsonify({'success': True, 'backup_path': backup_path})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# CRM API Endpoints
@app.route('/api/crm/content-management')
def api_content_management():
    """API endpoint for content management data"""
    try:
        data = database.get_content_management_data()
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/crm/user-administration')
def api_user_administration():
    """API endpoint for user administration data"""
    try:
        data = database.get_user_management_data()
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/crm/ai-monitoring')
def api_ai_monitoring():
    """API endpoint for AI monitoring data"""
    try:
        data = database.get_ai_monitoring_data()
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/crm/school-analytics')
def api_school_analytics():
    """API endpoint for school analytics data"""
    try:
        data = generate_school_analytics_data()
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/crm/financial-management')
def api_financial_management():
    """API endpoint for financial management data"""
    try:
        data = generate_financial_data()
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/crm/communication-center')
def api_communication_center():
    """API endpoint for communication center data"""
    try:
        data = generate_communication_data()
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/crm/student-enrollment')
def api_student_enrollment():
    """API endpoint for student enrollment data"""
    try:
        data = generate_enrollment_data()
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/crm/parent-portal')
def api_parent_portal():
    """API endpoint for parent portal data"""
    try:
        data = generate_parent_portal_data()
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/crm/dashboard')
def api_crm_dashboard():
    """API endpoint for CRM dashboard data"""
    try:
        data = generate_dashboard_data()
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500





@app.route('/api/crm/system-administration')
def api_system_administration():
    """API endpoint for system administration data"""
    try:
        data = database.get_system_administration_data()
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Content Management Actions
@app.route('/api/crm/content/approve/<content_id>', methods=['POST'])
def api_approve_content(content_id: str) -> Any:
    """Approve content"""
    try:
        # Update content status in database
        result = database.update_content_status(content_id, 'approved')
        if result['success']:
            return jsonify({'success': True, 'message': f'Content {content_id} approved successfully'})
        else:
            return jsonify({'success': False, 'error': result['error']}), 400
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/crm/content/reject/<content_id>', methods=['POST'])
def api_reject_content(content_id):
    """Reject content"""
    try:
        data = request.get_json()
        reason = data.get('reason', 'No reason provided')
        # Update content status in database with rejection reason
        result = database.update_content_status(content_id, 'rejected', reason)
        if result['success']:
            return jsonify({'success': True, 'message': f'Content {content_id} rejected: {reason}'})
        else:
            return jsonify({'success': False, 'error': result['error']}), 400
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# User Management Actions
@app.route('/api/crm/users/approve/<user_id>', methods=['POST'])
def api_approve_user(user_id):
    """Approve user account"""
    try:
        data = request.get_json() or {}
        role = data.get('role', 'student')
        # Create user account in database
        result = database.create_user_account(user_id, role)
        if result['success']:
            return jsonify({'success': True, 'message': f'User {user_id} approved and account created'})
        else:
            return jsonify({'success': False, 'error': result['error']}), 400
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/crm/users/reject/<user_id>', methods=['POST'])
def api_reject_user(user_id):
    """Reject user account"""
    try:
        data = request.get_json() or {}
        reason = data.get('reason', 'No reason provided')
        # Reject user account in database
        result = database.reject_user_account(user_id, reason)
        if result['success']:
            return jsonify({'success': True, 'message': f'User {user_id} rejected: {reason}'})
        else:
            return jsonify({'success': False, 'error': result['error']}), 400
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# System Administration Actions
@app.route('/api/crm/system/backup', methods=['POST'])
def api_system_backup():
    """Create system backup"""
    try:
        backup_path = database.backup_database()
        return jsonify({'success': True, 'backup_path': backup_path, 'message': 'Backup created successfully'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/crm/system/optimize', methods=['POST'])
def api_system_optimize():
    """Optimize database"""
    try:
        # Run database optimization
        result = database.optimize_database()
        if result['success']:
            return jsonify({'success': True, 'message': 'Database optimization completed successfully'})
        else:
            return jsonify({'success': False, 'error': result['error']}), 400
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Additional CRM API Endpoints
@app.route('/api/crm/collections', methods=['GET'])
def api_get_collections():
    """Get all collections with detailed information"""
    try:
        collections_info = {}
        for name in database.collections.keys():
            stats = database.get_collection_stats(name)
            collections_info[name] = stats

        return jsonify({
            'success': True,
            'collections': collections_info,
            'total_collections': len(collections_info)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/crm/collections/<collection_name>', methods=['DELETE'])
def api_delete_collection(collection_name):
    """Delete a collection"""
    try:
        result = database.delete_collection(collection_name)
        if result['success']:
            return jsonify({'success': True, 'message': f'Collection {collection_name} deleted successfully'})
        else:
            return jsonify({'success': False, 'error': result['error']}), 400
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# =============================================================================
# SECURE AI PROXY ENDPOINTS
# =============================================================================

class AIServiceProxy:
    """Secure proxy for AI service calls"""
    
    def __init__(self):
        self.ollama_base_url = os.getenv('OLLAMA_BASE_URL', 'http://localhost:11434')
        self.gemini_api_key = os.getenv('GEMINI_API_KEY')
        self.default_model = os.getenv('OLLAMA_MODEL', 'qwen2.5:3b-instruct')
        
    def test_ollama_connection(self) -> bool:
        """Test Ollama service connection"""
        try:
            response = requests.get(f"{self.ollama_base_url}/api/tags", timeout=5)
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Ollama connection test failed: {e}")
            return False
    
    def call_ollama_generate(self, prompt: str, options: Dict[str, Any] = None) -> Dict[str, Any]:
        """Securely call Ollama generate endpoint"""
        if options is None:
            options = {}
            
        try:
            messages = []
            
            # Add system message if provided
            if options.get('system'):
                messages.append({
                    'role': 'system',
                    'content': options['system']
                })
            
            # Add user prompt
            messages.append({
                'role': 'user',
                'content': prompt
            })
            
            payload = {
                'model': options.get('model', self.default_model),
                'messages': messages,
                'stream': False,
                'options': {
                    'temperature': options.get('temperature', 0.7),
                    'num_predict': options.get('max_tokens', 2048)
                }
            }
            
            response = requests.post(
                f"{self.ollama_base_url}/api/chat",
                json=payload,
                timeout=60
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    'success': True,
                    'text': data.get('message', {}).get('content', ''),
                    'model': data.get('model', self.default_model)
                }
            else:
                return {
                    'success': False,
                    'error': f"Ollama API error: {response.status_code}"
                }
                
        except Exception as e:
            logger.error(f"Ollama API call failed: {e}")
            return {
                'success': False,
                'error': f"Service error: {str(e)}"
            }

# Initialize AI service proxy
ai_proxy = AIServiceProxy()

@app.route('/api/ai/generate', methods=['POST'])
@require_rate_limit('ai_generate')
@validate_json_input(InputValidator.validate_educational_content_request)
def ai_generate_content(validated_data):
    """Secure AI content generation endpoint"""
    try:
        log_security_event('ai_generate_request', {
            'content_type': validated_data.get('content_type'),
            'prompt_length': len(validated_data.get('prompt', ''))
        })
        
        # Extract validated parameters
        prompt = validated_data['prompt']
        content_type = validated_data['content_type']
        
        # Build enhanced prompt based on content type
        system_prompts = {
            'lesson-plan': "You are an experienced educator creating comprehensive lesson plans. Focus on clear learning objectives, engaging activities, and appropriate assessments.",
            'quiz': "You are an educational assessment specialist creating fair and comprehensive quizzes. Include clear questions and explanations.",
            'assessment': "You are an expert in educational assessment. Create detailed rubrics and evaluation criteria.",
            'activity': "You are a creative educator designing engaging learning activities. Focus on hands-on, interactive experiences.",
            'general': "You are a helpful educational assistant providing accurate and appropriate content."
        }
        
        options = {
            'system': system_prompts.get(content_type, system_prompts['general']),
            'temperature': validated_data.get('temperature', 0.7),
            'max_tokens': validated_data.get('max_tokens', 2048)
        }
        
        # Call AI service
        result = ai_proxy.call_ollama_generate(prompt, options)
        
        if result['success']:
            log_security_event('ai_generate_success', {
                'content_type': content_type,
                'response_length': len(result.get('text', ''))
            })
            
            return jsonify({
                'success': True,
                'content': result['text'],
                'model': result.get('model'),
                'content_type': content_type
            })
        else:
            log_security_event('ai_generate_failure', {
                'error': result['error']
            })
            return jsonify(result), 500
            
    except Exception as e:
        logger.error(f"AI generation error: {e}")
        log_security_event('ai_generate_error', {'error': str(e)})
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@app.route('/api/ai/test-connection', methods=['GET'])
@require_rate_limit('default')
def ai_test_connection():
    """Test AI service connection"""
    try:
        ollama_status = ai_proxy.test_ollama_connection()
        
        return jsonify({
            'success': True,
            'services': {
                'ollama': {
                    'connected': ollama_status,
                    'url': ai_proxy.ollama_base_url
                }
            }
        })
        
    except Exception as e:
        logger.error(f"Connection test error: {e}")
        return jsonify({
            'success': False,
            'error': 'Service test failed'
        }), 500

@app.route('/api/ai/models', methods=['GET'])
@require_rate_limit('default')
def ai_get_models():
    """Get available AI models"""
    try:
        if not ai_proxy.test_ollama_connection():
            return jsonify({
                'success': False,
                'error': 'AI service not available'
            }), 503
            
        response = requests.get(f"{ai_proxy.ollama_base_url}/api/tags", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            models = [model.get('name', '') for model in data.get('models', [])]
            
            return jsonify({
                'success': True,
                'models': models,
                'default_model': ai_proxy.default_model
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to fetch models'
            }), 500
            
    except Exception as e:
        logger.error(f"Model fetch error: {e}")
        return jsonify({
            'success': False,
            'error': 'Service error'
        }), 500

@app.route('/api/security/rate-limit-stats', methods=['GET'])
def get_security_stats():
    """Get security and rate limiting statistics"""
    try:
        from security_utils import rate_limiter, get_rate_limit_stats
        
        client_id = rate_limiter.get_client_id(request)
        client_stats = rate_limiter.get_stats(client_id)
        global_stats = get_rate_limit_stats()
        
        return jsonify({
            'success': True,
            'client_stats': client_stats,
            'global_stats': global_stats,
            'client_id': client_id
        })
        
    except Exception as e:
        logger.error(f"Security stats error: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to get security stats'
        }), 500

@app.route('/api/crm/health', methods=['GET'])
def api_health_check():
    """System health check endpoint"""
    try:
        health_data = {
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'database_connected': True,
            'collections_count': len(database.collections),
            'total_documents': sum(database.get_collection_stats(name)['document_count'] for name in database.collections.keys()),
            'ollama_connected': database.test_ollama_connection(),
            'version': '1.0.0'
        }
        return jsonify(health_data)
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'timestamp': datetime.now().isoformat(),
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("🌐 Starting Vector Database Web Interface...")
    print(f"📂 Database path: {config.db_path}")
    print(f"📁 Upload directory: {processor.upload_dir}")
    print(f"🔧 Supported formats: {', '.join(processor.SUPPORTED_FORMATS.keys())}")
    print("\n🚀 Access the web interface at: http://localhost:5000")

    app.run(debug=True, host='0.0.0.0', port=5000)
