# Security Implementation Guide

This document outlines the security improvements implemented in the Grow Need application to address critical vulnerabilities and harden the system against attacks.

## Overview

The security hardening implementation addresses the following key areas:
- Backend API proxy for AI service calls
- Input validation and sanitization
- Rate limiting and abuse prevention
- Secure storage patterns
- CORS configuration and security headers

## Security Features

### 1. Backend AI Proxy (`database/web-interface.py`)

**Problem**: Frontend was making direct API calls to AI services (Ollama, Gemini), exposing API keys and allowing unlimited requests.

**Solution**: Implemented secure backend endpoints that proxy all AI service calls.

#### Endpoints:
- `POST /api/ai/generate` - Secure AI content generation
- `GET /api/ai/test-connection` - Test AI service connectivity
- `GET /api/ai/models` - Get available AI models
- `POST /api/ai/feedback-analysis` - Analyze feedback text
- `GET /api/security/rate-limit-stats` - Get rate limiting statistics

#### Security Features:
- All API keys are stored on backend only
- Input validation for all requests
- Rate limiting per IP address
- Comprehensive error handling without information disclosure
- Security event logging

### 2. Input Validation & Sanitization (`database/security_utils.py`)

**Problem**: No validation of user inputs sent to AI services, allowing potential injection attacks.

**Solution**: Comprehensive input validation and sanitization system.

#### Features:
- **HTML sanitization**: Escapes all HTML content to prevent XSS
- **Content filtering**: Blocks malicious patterns (scripts, javascript:, etc.)
- **Size limits**: Enforces maximum lengths for prompts, topics, filenames
- **Parameter validation**: Validates temperature, token limits, content types
- **Educational content validation**: Specific validation for lesson plans, quizzes, assessments

#### Example Usage:
```python
# Validate educational content request
validated_data = InputValidator.validate_educational_content_request({
    'prompt': 'Create a math lesson',
    'content_type': 'lesson-plan',
    'temperature': 0.7
})
```

### 3. Rate Limiting (`database/security_utils.py`)

**Problem**: No rate limiting on AI features, allowing abuse and excessive resource consumption.

**Solution**: Implemented comprehensive rate limiting system.

#### Features:
- **Per-IP tracking**: Tracks requests by client IP address
- **Endpoint-specific limits**: Different limits for different operations
- **Automatic cleanup**: Removes old request records
- **Configurable limits**: Easily adjustable rate limits
- **Statistics tracking**: Monitor usage patterns

#### Default Limits:
- AI Generation: 50 requests per hour
- Search: 100 requests per hour
- Upload: 20 requests per hour
- Default: 200 requests per hour

#### Example Usage:
```python
@require_rate_limit('ai_generate')
def secure_endpoint():
    # Endpoint automatically protected by rate limiting
    pass
```

### 4. Secure Storage (`src/utils/secureStorage.ts`)

**Problem**: Potential insecure localStorage usage that could store sensitive data.

**Solution**: Secure storage wrapper with validation and protection.

#### Features:
- **Sensitive data detection**: Prevents storing API keys, passwords, tokens
- **Whitelist approach**: Only allows approved storage keys
- **Size limits**: Enforces maximum storage size per item
- **Version checking**: Handles storage format migrations
- **Automatic cleanup**: Removes old and corrupted data
- **Legacy migration**: Safely migrates old localStorage items

#### Allowed Storage Keys:
- `aura-theme` - UI theme settings
- `aura-design` - UI design preferences
- `user-preferences` - Non-sensitive user preferences
- `design-studio-projects` - Design studio project data

#### Example Usage:
```typescript
// Safe storage
secureStorage.setItem('user-preferences', { theme: 'dark' }); // ✅ Allowed

// Blocked storage
secureStorage.setItem('api-keys', { key: 'secret' }); // ❌ Blocked
```

### 5. Secure AI Service (`src/services/secureAIService.ts`)

**Problem**: Frontend services were calling AI APIs directly.

**Solution**: New service that routes all AI calls through secure backend.

#### Features:
- **Backend-only communication**: All AI calls go through secure backend
- **Input validation**: Client-side validation before sending to backend
- **Error handling**: Graceful handling of network and API errors
- **Legacy compatibility**: Maintains backward compatibility with existing code
- **Type safety**: Full TypeScript support with proper interfaces

#### Example Usage:
```typescript
// Secure AI generation
const response = await secureAIService.generateContent({
    prompt: 'Create a lesson plan',
    content_type: 'lesson-plan',
    temperature: 0.7
});
```

### 6. CORS Configuration

**Problem**: Loose CORS configuration allowing potential cross-origin attacks.

**Solution**: Strict CORS policies with specific allowed origins.

#### Configuration:
```python
CORS(app, 
     origins=['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allow_headers=['Content-Type', 'Authorization', 'X-Requested-With'],
     supports_credentials=False)
```

## Environment Configuration

### Backend Environment Variables

```bash
# Security
FLASK_SECRET_KEY=your-secure-secret-key
ENABLE_RATE_LIMITING=true
RATE_LIMIT_AI_REQUESTS=50

# API Keys (Backend only)
GEMINI_API_KEY=your-api-key
OLLAMA_BASE_URL=http://localhost:11434

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

### Frontend Environment Variables

```bash
# Safe to expose to frontend
VITE_API_BASE_URL=http://localhost:5000
VITE_ENABLE_ENHANCED_AI=true
VITE_ENVIRONMENT=development
```

## Testing

### Frontend Tests (`src/__tests__/security.test.ts`)

Tests cover:
- Secure storage validation
- AI service security
- Input validation
- Rate limiting responses
- Legacy compatibility

Run tests:
```bash
npm test -- security.test.ts
```

### Backend Tests (`database/test_security.py`)

Tests cover:
- Input validation and sanitization
- Rate limiting functionality
- Security decorators
- Event logging

Run tests:
```bash
cd database && python test_security.py
```

## Security Best Practices

### For Developers:

1. **Never expose API keys to frontend**
   - Store all API keys in backend environment variables
   - Use backend proxy endpoints for external API calls

2. **Validate all inputs**
   - Use InputValidator for all user inputs
   - Sanitize HTML content to prevent XSS
   - Validate parameter ranges and types

3. **Implement rate limiting**
   - Use @require_rate_limit decorator on endpoints
   - Set appropriate limits based on resource requirements
   - Monitor rate limit statistics

4. **Use secure storage**
   - Use secureStorage instead of direct localStorage
   - Never store sensitive data in browser storage
   - Follow whitelist approach for storage keys

5. **Log security events**
   - Use log_security_event for important actions
   - Monitor logs for suspicious activity
   - Include relevant context in log entries

### For Deployment:

1. **Environment configuration**
   - Use strong secret keys in production
   - Configure appropriate CORS origins
   - Enable security logging

2. **Monitoring**
   - Monitor rate limiting statistics
   - Watch for security event logs
   - Set up alerts for abuse patterns

3. **Updates**
   - Keep dependencies updated
   - Review security configurations regularly
   - Audit storage usage patterns

## Security Headers (Future Enhancement)

Consider implementing additional security headers:

```python
@app.after_request
def add_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    return response
```

## Monitoring and Alerting

### Rate Limiting Monitoring

```python
# Get rate limiting statistics
stats = get_rate_limit_stats()
print(f"Total clients: {stats['total_clients']}")
print(f"Rate limits: {stats['limits']}")
```

### Security Event Monitoring

```python
# Log security events
log_security_event('suspicious_activity', {
    'pattern': 'multiple_failed_attempts',
    'count': 5
})
```

## Migration Guide

### Updating Existing Code

1. **Replace direct AI calls**:
   ```typescript
   // Before
   const result = await ollamaService.generateContent(prompt);
   
   // After
   const result = await secureAIService.generateContent({
       prompt,
       content_type: 'general'
   });
   ```

2. **Replace localStorage usage**:
   ```typescript
   // Before
   localStorage.setItem('theme', JSON.stringify(theme));
   
   // After
   secureStorage.setItem('aura-theme', theme);
   ```

3. **Add input validation**:
   ```python
   # Before
   @app.route('/api/endpoint', methods=['POST'])
   def endpoint():
       data = request.get_json()
       # Process data...
   
   # After
   @app.route('/api/endpoint', methods=['POST'])
   @require_rate_limit('endpoint')
   @validate_json_input(validator_function)
   def endpoint(validated_data):
       # Process validated_data...
   ```

## Conclusion

These security improvements provide comprehensive protection against common web application vulnerabilities while maintaining functionality and user experience. The implementation follows security best practices and provides a foundation for further security enhancements.

For questions or security concerns, please review the implementation code and tests, or consult the development team.