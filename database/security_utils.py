#!/usr/bin/env python3
"""
Security utilities for input validation, sanitization, and rate limiting
"""

import re
import time
import html
import hashlib
from typing import Dict, List, Optional, Tuple, Any
from functools import wraps
from datetime import datetime, timedelta
from flask import request, jsonify
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class InputValidator:
    """Input validation and sanitization utilities"""
    
    # Maximum lengths for different input types
    MAX_PROMPT_LENGTH = 5000
    MAX_TOPIC_LENGTH = 200
    MAX_GRADE_LENGTH = 50
    MAX_FILENAME_LENGTH = 255
    
    # Forbidden patterns (basic content filtering)
    FORBIDDEN_PATTERNS = [
        r'<script[^>]*>.*?</script>',  # Script tags
        r'javascript:',                # JavaScript URLs
        r'on\w+\s*=',                 # Event handlers
        r'data:\s*text/html',         # Data URLs with HTML
        r'vbscript:',                 # VBScript URLs
    ]
    
    # Allowed characters for different input types
    ALLOWED_PROMPT_CHARS = re.compile(r'^[a-zA-Z0-9\s\.\,\?\!\'\"\-\(\)\[\]\{\}\n\r\t\:\;]+$')
    ALLOWED_ALPHANUMERIC = re.compile(r'^[a-zA-Z0-9\s\-_]+$')
    ALLOWED_FILENAME = re.compile(r'^[a-zA-Z0-9\.\-_\s]+$')
    
    @staticmethod
    def sanitize_html(text: str) -> str:
        """Sanitize HTML content"""
        if not text:
            return ""
        return html.escape(text.strip())
    
    @staticmethod
    def sanitize_prompt(prompt: str) -> str:
        """Sanitize AI prompt input"""
        if not prompt:
            return ""
        
        # Remove HTML tags and escape
        sanitized = html.escape(prompt.strip())
        
        # Check for forbidden patterns
        for pattern in InputValidator.FORBIDDEN_PATTERNS:
            if re.search(pattern, sanitized, re.IGNORECASE):
                raise ValueError(f"Forbidden content detected in prompt")
        
        # Limit length
        if len(sanitized) > InputValidator.MAX_PROMPT_LENGTH:
            raise ValueError(f"Prompt too long (max {InputValidator.MAX_PROMPT_LENGTH} characters)")
        
        return sanitized
    
    @staticmethod
    def validate_educational_content_request(data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate educational content generation request"""
        validated = {}
        
        # Required fields
        required_fields = ['prompt', 'content_type']
        for field in required_fields:
            if field not in data:
                raise ValueError(f"Missing required field: {field}")
        
        # Validate prompt
        validated['prompt'] = InputValidator.sanitize_prompt(data['prompt'])
        
        # Validate content type
        allowed_content_types = ['lesson-plan', 'quiz', 'assessment', 'activity', 'general']
        if data['content_type'] not in allowed_content_types:
            raise ValueError(f"Invalid content type: {data['content_type']}")
        validated['content_type'] = data['content_type']
        
        # Optional fields with validation
        if 'topic' in data:
            topic = InputValidator.sanitize_html(data['topic'])
            if len(topic) > InputValidator.MAX_TOPIC_LENGTH:
                raise ValueError(f"Topic too long (max {InputValidator.MAX_TOPIC_LENGTH} characters)")
            validated['topic'] = topic
        
        if 'grade' in data:
            grade = InputValidator.sanitize_html(data['grade'])
            if len(grade) > InputValidator.MAX_GRADE_LENGTH:
                raise ValueError(f"Grade too long (max {InputValidator.MAX_GRADE_LENGTH} characters)")
            validated['grade'] = grade
        
        # Validate optional parameters
        if 'temperature' in data:
            try:
                temp = float(data['temperature'])
                if not 0.0 <= temp <= 2.0:
                    raise ValueError("Temperature must be between 0.0 and 2.0")
                validated['temperature'] = temp
            except (ValueError, TypeError):
                raise ValueError("Invalid temperature value")
        
        if 'max_tokens' in data:
            try:
                tokens = int(data['max_tokens'])
                if not 1 <= tokens <= 4096:
                    raise ValueError("Max tokens must be between 1 and 4096")
                validated['max_tokens'] = tokens
            except (ValueError, TypeError):
                raise ValueError("Invalid max_tokens value")
        
        return validated
    
    @staticmethod
    def validate_filename(filename: str) -> str:
        """Validate and sanitize filename"""
        if not filename:
            raise ValueError("Filename cannot be empty")
        
        sanitized = filename.strip()
        
        if len(sanitized) > InputValidator.MAX_FILENAME_LENGTH:
            raise ValueError(f"Filename too long (max {InputValidator.MAX_FILENAME_LENGTH} characters)")
        
        if not InputValidator.ALLOWED_FILENAME.match(sanitized):
            raise ValueError("Filename contains invalid characters")
        
        # Prevent path traversal
        if '..' in sanitized or '/' in sanitized or '\\' in sanitized:
            raise ValueError("Invalid filename: path traversal detected")
        
        return sanitized


class RateLimiter:
    """Simple in-memory rate limiter"""
    
    def __init__(self):
        # Store: {client_id: [(timestamp, endpoint), ...]}
        self.requests: Dict[str, List[Tuple[float, str]]] = {}
        
        # Rate limits per endpoint (requests per hour)
        self.limits = {
            'ai_generate': 50,      # 50 AI generation requests per hour
            'ai_search': 100,       # 100 search requests per hour
            'upload': 20,           # 20 uploads per hour
            'default': 200          # 200 general requests per hour
        }
        
        # Cleanup interval (seconds)
        self.cleanup_interval = 3600  # 1 hour
        self.last_cleanup = time.time()
    
    def get_client_id(self, request) -> str:
        """Get client identifier (IP address or user ID)"""
        # Use X-Forwarded-For if behind proxy, otherwise use remote_addr
        client_ip = request.headers.get('X-Forwarded-For', request.remote_addr)
        if client_ip:
            # Take the first IP if comma-separated
            client_ip = client_ip.split(',')[0].strip()
        
        # For authenticated requests, you could use user ID instead
        # user_id = request.headers.get('X-User-ID')
        # if user_id:
        #     return f"user_{user_id}"
        
        return f"ip_{client_ip}"
    
    def cleanup_old_requests(self):
        """Remove old request records"""
        current_time = time.time()
        
        # Only cleanup if enough time has passed
        if current_time - self.last_cleanup < self.cleanup_interval:
            return
        
        cutoff_time = current_time - 3600  # Remove requests older than 1 hour
        
        for client_id in list(self.requests.keys()):
            # Filter out old requests
            self.requests[client_id] = [
                (timestamp, endpoint) for timestamp, endpoint in self.requests[client_id]
                if timestamp > cutoff_time
            ]
            
            # Remove empty client records
            if not self.requests[client_id]:
                del self.requests[client_id]
        
        self.last_cleanup = current_time
    
    def is_allowed(self, client_id: str, endpoint: str) -> Tuple[bool, Dict[str, Any]]:
        """Check if request is allowed under rate limit"""
        current_time = time.time()
        
        # Clean up old requests periodically
        self.cleanup_old_requests()
        
        # Get rate limit for endpoint
        limit = self.limits.get(endpoint, self.limits['default'])
        
        # Get client's request history
        if client_id not in self.requests:
            self.requests[client_id] = []
        
        client_requests = self.requests[client_id]
        
        # Count requests in the last hour for this endpoint
        one_hour_ago = current_time - 3600
        recent_requests = [
            req for req in client_requests 
            if req[0] > one_hour_ago and req[1] == endpoint
        ]
        
        # Check if limit exceeded
        if len(recent_requests) >= limit:
            # Calculate when the oldest request will expire
            oldest_request_time = min(req[0] for req in recent_requests)
            reset_time = oldest_request_time + 3600
            
            return False, {
                'error': 'Rate limit exceeded',
                'limit': limit,
                'requests_made': len(recent_requests),
                'reset_time': reset_time,
                'retry_after': int(reset_time - current_time)
            }
        
        # Record this request
        self.requests[client_id].append((current_time, endpoint))
        
        return True, {
            'limit': limit,
            'requests_made': len(recent_requests) + 1,
            'remaining': limit - len(recent_requests) - 1
        }
    
    def get_stats(self, client_id: str) -> Dict[str, Any]:
        """Get rate limiting stats for a client"""
        current_time = time.time()
        one_hour_ago = current_time - 3600
        
        if client_id not in self.requests:
            return {'total_requests': 0, 'requests_by_endpoint': {}}
        
        client_requests = self.requests[client_id]
        recent_requests = [req for req in client_requests if req[0] > one_hour_ago]
        
        # Count by endpoint
        requests_by_endpoint = {}
        for _, endpoint in recent_requests:
            requests_by_endpoint[endpoint] = requests_by_endpoint.get(endpoint, 0) + 1
        
        return {
            'total_requests': len(recent_requests),
            'requests_by_endpoint': requests_by_endpoint
        }


# Global rate limiter instance
rate_limiter = RateLimiter()


def require_rate_limit(endpoint: str):
    """Decorator to enforce rate limiting on endpoints"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            client_id = rate_limiter.get_client_id(request)
            allowed, info = rate_limiter.is_allowed(client_id, endpoint)
            
            if not allowed:
                logger.warning(f"Rate limit exceeded for {client_id} on {endpoint}")
                response = jsonify({
                    'error': info['error'],
                    'limit': info['limit'],
                    'retry_after': info['retry_after']
                })
                response.status_code = 429
                response.headers['Retry-After'] = str(info['retry_after'])
                return response
            
            # Add rate limit headers to response
            response = f(*args, **kwargs)
            if hasattr(response, 'headers'):
                response.headers['X-RateLimit-Limit'] = str(info['limit'])
                response.headers['X-RateLimit-Remaining'] = str(info['remaining'])
            
            return response
        return decorated_function
    return decorator


def validate_json_input(validator_func):
    """Decorator to validate JSON input using a validator function"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                if not request.is_json:
                    return jsonify({'error': 'Content-Type must be application/json'}), 400
                
                data = request.get_json()
                if not data:
                    return jsonify({'error': 'Invalid JSON or empty request body'}), 400
                
                # Validate input using the provided validator
                validated_data = validator_func(data)
                
                # Add validated data to kwargs
                kwargs['validated_data'] = validated_data
                
                return f(*args, **kwargs)
                
            except ValueError as e:
                logger.warning(f"Input validation failed: {str(e)}")
                return jsonify({'error': f'Validation error: {str(e)}'}), 400
            except Exception as e:
                logger.error(f"Unexpected validation error: {str(e)}")
                return jsonify({'error': 'Internal validation error'}), 500
                
        return decorated_function
    return decorator


def log_security_event(event_type: str, details: Dict[str, Any]):
    """Log security events for monitoring"""
    client_ip = request.headers.get('X-Forwarded-For', request.remote_addr)
    user_agent = request.headers.get('User-Agent', 'Unknown')
    
    log_entry = {
        'timestamp': datetime.now().isoformat(),
        'event_type': event_type,
        'client_ip': client_ip,
        'user_agent': user_agent,
        'endpoint': request.endpoint,
        'method': request.method,
        'details': details
    }
    
    logger.info(f"Security Event: {event_type}", extra=log_entry)


def get_rate_limit_stats():
    """Get rate limiting statistics for monitoring"""
    return {
        'total_clients': len(rate_limiter.requests),
        'limits': rate_limiter.limits,
        'cleanup_interval': rate_limiter.cleanup_interval
    }