#!/usr/bin/env python3
"""
Security utilities tests
Tests for the security hardening implementation
"""

import unittest
import json
import time
from unittest.mock import Mock, patch
from security_utils import (
    InputValidator, 
    RateLimiter, 
    require_rate_limit, 
    validate_json_input,
    log_security_event
)

class TestInputValidator(unittest.TestCase):
    
    def test_sanitize_html(self):
        """Test HTML sanitization"""
        # Test normal text
        result = InputValidator.sanitize_html("Hello World")
        self.assertEqual(result, "Hello World")
        
        # Test HTML escaping
        result = InputValidator.sanitize_html("<script>alert('xss')</script>")
        self.assertEqual(result, "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;")
        
        # Test empty input
        result = InputValidator.sanitize_html("")
        self.assertEqual(result, "")
        
        # Test None input
        result = InputValidator.sanitize_html(None)
        self.assertEqual(result, "")
    
    def test_sanitize_prompt(self):
        """Test prompt sanitization"""
        # Test normal prompt
        result = InputValidator.sanitize_prompt("Create a lesson plan about science")
        self.assertEqual(result, "Create a lesson plan about science")
        
        # Test HTML in prompt
        result = InputValidator.sanitize_prompt("Create a <strong>lesson</strong> plan")
        self.assertEqual(result, "Create a &lt;strong&gt;lesson&lt;/strong&gt; plan")
        
        # Test forbidden patterns
        with self.assertRaises(ValueError):
            InputValidator.sanitize_prompt("<script>alert('xss')</script>")
        
        with self.assertRaises(ValueError):
            InputValidator.sanitize_prompt("javascript:alert('xss')")
        
        # Test prompt too long
        long_prompt = "x" * 5001
        with self.assertRaises(ValueError):
            InputValidator.sanitize_prompt(long_prompt)
    
    def test_validate_educational_content_request(self):
        """Test educational content request validation"""
        # Valid request
        valid_data = {
            'prompt': 'Create a math lesson',
            'content_type': 'lesson-plan',
            'topic': 'Mathematics',
            'grade': '5th Grade',
            'temperature': 0.7,
            'max_tokens': 2048
        }
        
        result = InputValidator.validate_educational_content_request(valid_data)
        self.assertEqual(result['prompt'], 'Create a math lesson')
        self.assertEqual(result['content_type'], 'lesson-plan')
        self.assertEqual(result['topic'], 'Mathematics')
        self.assertEqual(result['grade'], '5th Grade')
        self.assertEqual(result['temperature'], 0.7)
        self.assertEqual(result['max_tokens'], 2048)
        
        # Missing required field
        invalid_data = {'content_type': 'lesson-plan'}
        with self.assertRaises(ValueError):
            InputValidator.validate_educational_content_request(invalid_data)
        
        # Invalid content type
        invalid_data = {
            'prompt': 'Test',
            'content_type': 'invalid-type'
        }
        with self.assertRaises(ValueError):
            InputValidator.validate_educational_content_request(invalid_data)
        
        # Invalid temperature
        invalid_data = {
            'prompt': 'Test',
            'content_type': 'general',
            'temperature': 3.0
        }
        with self.assertRaises(ValueError):
            InputValidator.validate_educational_content_request(invalid_data)
        
        # Invalid max_tokens
        invalid_data = {
            'prompt': 'Test',
            'content_type': 'general',
            'max_tokens': 5000
        }
        with self.assertRaises(ValueError):
            InputValidator.validate_educational_content_request(invalid_data)
    
    def test_validate_filename(self):
        """Test filename validation"""
        # Valid filename
        result = InputValidator.validate_filename("test_file.txt")
        self.assertEqual(result, "test_file.txt")
        
        # Empty filename
        with self.assertRaises(ValueError):
            InputValidator.validate_filename("")
        
        # Filename too long
        long_filename = "x" * 300
        with self.assertRaises(ValueError):
            InputValidator.validate_filename(long_filename)
        
        # Invalid characters
        with self.assertRaises(ValueError):
            InputValidator.validate_filename("file<script>.txt")
        
        # Path traversal
        with self.assertRaises(ValueError):
            InputValidator.validate_filename("../secret.txt")
        
        with self.assertRaises(ValueError):
            InputValidator.validate_filename("dir/file.txt")


class TestRateLimiter(unittest.TestCase):
    
    def setUp(self):
        """Set up test fixtures"""
        self.rate_limiter = RateLimiter()
        # Use very small limits for testing
        self.rate_limiter.limits = {
            'test_endpoint': 2,  # 2 requests per hour
            'default': 5
        }
    
    def test_client_id_generation(self):
        """Test client ID generation"""
        # Mock request object
        mock_request = Mock()
        mock_request.headers = {}
        mock_request.remote_addr = '127.0.0.1'
        
        client_id = self.rate_limiter.get_client_id(mock_request)
        self.assertEqual(client_id, 'ip_127.0.0.1')
        
        # Test with X-Forwarded-For header
        mock_request.headers = {'X-Forwarded-For': '192.168.1.1, 10.0.0.1'}
        client_id = self.rate_limiter.get_client_id(mock_request)
        self.assertEqual(client_id, 'ip_192.168.1.1')
    
    def test_rate_limiting(self):
        """Test rate limiting functionality"""
        client_id = 'test_client'
        endpoint = 'test_endpoint'
        
        # First request should be allowed
        allowed, info = self.rate_limiter.is_allowed(client_id, endpoint)
        self.assertTrue(allowed)
        self.assertEqual(info['requests_made'], 1)
        self.assertEqual(info['remaining'], 1)
        
        # Second request should be allowed
        allowed, info = self.rate_limiter.is_allowed(client_id, endpoint)
        self.assertTrue(allowed)
        self.assertEqual(info['requests_made'], 2)
        self.assertEqual(info['remaining'], 0)
        
        # Third request should be blocked
        allowed, info = self.rate_limiter.is_allowed(client_id, endpoint)
        self.assertFalse(allowed)
        self.assertEqual(info['error'], 'Rate limit exceeded')
        self.assertEqual(info['requests_made'], 2)
    
    def test_different_endpoints(self):
        """Test that different endpoints have separate limits"""
        client_id = 'test_client'
        
        # Use up limit for test_endpoint
        self.rate_limiter.is_allowed(client_id, 'test_endpoint')
        self.rate_limiter.is_allowed(client_id, 'test_endpoint')
        
        # Should still be allowed for default endpoint
        allowed, info = self.rate_limiter.is_allowed(client_id, 'other_endpoint')
        self.assertTrue(allowed)
    
    def test_cleanup_old_requests(self):
        """Test cleanup of old request records"""
        client_id = 'test_client'
        endpoint = 'test_endpoint'
        
        # Add some requests
        self.rate_limiter.is_allowed(client_id, endpoint)
        self.rate_limiter.is_allowed(client_id, endpoint)
        
        # Verify requests are recorded
        self.assertEqual(len(self.rate_limiter.requests[client_id]), 2)
        
        # Force cleanup by setting old timestamp
        self.rate_limiter.last_cleanup = 0
        
        # Mock time to simulate old requests
        with patch('time.time', return_value=time.time() + 3700):  # 1+ hour later
            self.rate_limiter.cleanup_old_requests()
        
        # Old requests should be cleaned up
        self.assertEqual(len(self.rate_limiter.requests.get(client_id, [])), 0)
    
    def test_get_stats(self):
        """Test getting rate limiting statistics"""
        client_id = 'test_client'
        
        # Make some requests
        self.rate_limiter.is_allowed(client_id, 'test_endpoint')
        self.rate_limiter.is_allowed(client_id, 'default')
        
        stats = self.rate_limiter.get_stats(client_id)
        
        self.assertEqual(stats['total_requests'], 2)
        self.assertEqual(stats['requests_by_endpoint']['test_endpoint'], 1)
        self.assertEqual(stats['requests_by_endpoint']['default'], 1)


class MockFlaskRequest:
    """Mock Flask request for testing decorators"""
    def __init__(self, json_data=None, is_json=True, headers=None, remote_addr='127.0.0.1'):
        self._json_data = json_data
        self.is_json = is_json
        self.headers = headers or {}
        self.remote_addr = remote_addr
        self.endpoint = 'test_endpoint'
        self.method = 'POST'
    
    def get_json(self):
        return self._json_data


class TestDecorators(unittest.TestCase):
    
    @patch('security_utils.request')
    @patch('security_utils.jsonify')
    def test_require_rate_limit_decorator(self, mock_jsonify, mock_request):
        """Test rate limiting decorator"""
        # Setup mock request
        mock_request.headers = {}
        mock_request.remote_addr = '127.0.0.1'
        
        # Create a test function with the decorator
        rate_limiter = RateLimiter()
        rate_limiter.limits['test'] = 1  # Very low limit for testing
        
        @require_rate_limit('test')
        def test_function():
            return "success"
        
        # Patch the global rate_limiter
        with patch('security_utils.rate_limiter', rate_limiter):
            # First call should succeed
            result = test_function()
            self.assertEqual(result, "success")
            
            # Second call should be rate limited
            mock_jsonify.return_value.status_code = 429
            result = test_function()
            mock_jsonify.assert_called()
    
    @patch('security_utils.request')
    def test_validate_json_input_decorator(self, mock_request):
        """Test JSON input validation decorator"""
        
        def test_validator(data):
            if 'required_field' not in data:
                raise ValueError("Missing required field")
            return {'validated': data['required_field']}
        
        @validate_json_input(test_validator)
        def test_function(validated_data):
            return f"processed: {validated_data['validated']}"
        
        # Test valid input
        mock_request.is_json = True
        mock_request.get_json.return_value = {'required_field': 'test_value'}
        
        result = test_function()
        self.assertEqual(result, "processed: test_value")
        
        # Test invalid input - will be tested in integration tests


class TestSecurityLogging(unittest.TestCase):
    
    @patch('security_utils.request')
    @patch('security_utils.logger')
    def test_log_security_event(self, mock_logger, mock_request):
        """Test security event logging"""
        mock_request.headers = {'User-Agent': 'TestAgent'}
        mock_request.remote_addr = '127.0.0.1'
        mock_request.endpoint = 'test_endpoint'
        mock_request.method = 'POST'
        
        log_security_event('test_event', {'detail': 'test_detail'})
        
        # Verify logger was called
        mock_logger.info.assert_called_once()
        call_args = mock_logger.info.call_args[0]
        self.assertIn('test_event', call_args[0])


if __name__ == '__main__':
    # Run the tests
    unittest.main(verbosity=2)