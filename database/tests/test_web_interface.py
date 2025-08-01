#!/usr/bin/env python3
"""
Comprehensive test suite for the vector database web interface
"""

import pytest
import json
import tempfile
import os
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock
import sys

# Add the database directory to the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the web interface module
import importlib.util
web_interface_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "web-interface.py")
spec = importlib.util.spec_from_file_location("web_interface", web_interface_path)
if spec is None or spec.loader is None:
    raise ImportError(f"Could not load web_interface from {web_interface_path}")
web_interface = importlib.util.module_from_spec(spec)
spec.loader.exec_module(web_interface)

@pytest.fixture
def client():
    """Create a test client for the Flask app"""
    web_interface.app.config['TESTING'] = True
    web_interface.app.config['WTF_CSRF_ENABLED'] = False
    with web_interface.app.test_client() as client:
        yield client

@pytest.fixture
def mock_processor():
    """Mock file processor"""
    with patch('web_interface.fp') as mock:
        mock.FileProcessor.return_value.upload_dir = Path(tempfile.mkdtemp())
        mock.FileProcessor.return_value.process_file.return_value = {
            'success': True,
            'message': 'File processed successfully',
            'file_id': 'test-file-id'
        }
        yield mock

@pytest.fixture
def mock_database():
    """Mock vector database"""
    with patch('web_interface.svd') as mock:
        mock.VectorDatabase.return_value.search.return_value = {
            'documents': [['Test document content']],
            'metadatas': [[{'source': 'test.txt', 'type': 'text'}]],
            'distances': [[0.1]]
        }
        mock.VectorDatabase.return_value.get_stats.return_value = {
            'total_documents': 10,
            'collections': ['test_collection'],
            'last_updated': '2024-01-01T00:00:00Z'
        }
        yield mock

class TestWebInterface:
    """Test the web interface functionality"""
    
    def test_index_route(self, client):
        """Test the main index route"""
        response = client.get('/')
        assert response.status_code == 200
        assert b'Vector Database' in response.data
    
    def test_api_stats(self, client, mock_database):
        """Test the API stats endpoint"""
        response = client.get('/api/stats')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'total_documents' in data
        assert 'collections' in data
    
    def test_api_search_valid_query(self, client, mock_database):
        """Test API search with valid query"""
        response = client.post('/api/search', 
                             json={'query': 'test query', 'limit': 5})
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'results' in data
        assert len(data['results']) > 0
    
    def test_api_search_missing_query(self, client):
        """Test API search with missing query"""
        response = client.post('/api/search', json={})
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_api_upload_valid_file(self, client, mock_processor):
        """Test file upload with valid file"""
        data = {
            'file': (tempfile.NamedTemporaryFile(suffix='.txt', delete=False), 'test.txt'),
            'collection': 'test_collection'
        }
        response = client.post('/api/upload', data=data)
        assert response.status_code == 200
        response_data = json.loads(response.data)
        assert response_data['success'] is True
    
    def test_api_upload_no_file(self, client):
        """Test file upload with no file"""
        response = client.post('/api/upload', data={})
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_api_upload_invalid_file_type(self, client):
        """Test file upload with invalid file type"""
        data = {
            'file': (tempfile.NamedTemporaryFile(suffix='.exe', delete=False), 'test.exe'),
            'collection': 'test_collection'
        }
        response = client.post('/api/upload', data=data)
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data

class TestAPIEndpoints:
    """Test specific API endpoints"""
    
    def test_health_check(self, client):
        """Test health check endpoint"""
        response = client.get('/api/health')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'healthy'
    
    def test_collections_endpoint(self, client, mock_database):
        """Test collections listing endpoint"""
        response = client.get('/api/collections')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'collections' in data
    
    def test_cors_headers(self, client):
        """Test CORS headers are present"""
        response = client.options('/api/stats')
        assert 'Access-Control-Allow-Origin' in response.headers

class TestErrorHandling:
    """Test error handling scenarios"""
    
    def test_database_connection_error(self, client):
        """Test handling of database connection errors"""
        with patch('web_interface.svd.VectorDatabase') as mock_db:
            mock_db.side_effect = Exception("Database connection failed")
            response = client.get('/api/stats')
            assert response.status_code == 500
    
    def test_file_processing_error(self, client):
        """Test handling of file processing errors"""
        with patch('web_interface.fp.FileProcessor') as mock_processor:
            mock_processor.side_effect = Exception("File processing failed")
            data = {
                'file': (tempfile.NamedTemporaryFile(suffix='.txt', delete=False), 'test.txt'),
                'collection': 'test_collection'
            }
            response = client.post('/api/upload', data=data)
            assert response.status_code == 500

class TestIntegration:
    """Integration tests for the complete workflow"""
    
    @pytest.mark.integration
    def test_complete_upload_and_search_workflow(self, client, mock_processor, mock_database):
        """Test complete workflow: upload file then search for content"""
        # Upload a file
        upload_data = {
            'file': (tempfile.NamedTemporaryFile(suffix='.txt', delete=False), 'test.txt'),
            'collection': 'test_collection'
        }
        upload_response = client.post('/api/upload', data=upload_data)
        assert upload_response.status_code == 200
        
        # Search for content
        search_response = client.post('/api/search', 
                                    json={'query': 'test content', 'limit': 5})
        assert search_response.status_code == 200
        search_data = json.loads(search_response.data)
        assert 'results' in search_data

if __name__ == '__main__':
    pytest.main([__file__, '-v'])
