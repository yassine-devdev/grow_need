# Environment Configuration Guide

This document provides comprehensive instructions for setting up and managing environment variables in the GROW YouR NEED SaaS School application.

## Quick Start

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Update the values** in `.env` according to your setup

3. **Verify your configuration:**
   ```bash
   npm run dev
   ```
   Check the console for environment validation messages.

## Environment Variables Reference

### Core Settings

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Application environment (development/production/test) |

### AI Provider Configuration

The application supports multiple AI providers. Configure one or more based on your needs:

#### Gemini (Google AI)
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AI_PROVIDER` | No | `ollama` | Set to `gemini` to use Google's Gemini API |
| `GEMINI_API_KEY` | Yes* | - | Your Google AI API key |
| `API_KEY` | Yes* | - | Alternative name for Gemini API key |

*Required only when using Gemini as the AI provider.

#### OpenAI
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AI_PROVIDER` | No | `ollama` | Set to `openai` to use OpenAI API |
| `OPENAI_API_KEY` | Yes* | - | Your OpenAI API key |

*Required only when using OpenAI as the AI provider.

#### Ollama (Local AI)
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AI_PROVIDER` | No | `ollama` | Set to `ollama` for local AI |
| `OLLAMA_BASE_URL` | No | `http://localhost:11434` | Ollama server URL |
| `OLLAMA_MODEL` | No | `qwen2.5:3b-instruct` | Default model to use |
| `OLLAMA_CHAT_MODEL` | No | `qwen2.5:3b-instruct` | Model for chat functionality |
| `OLLAMA_EMBEDDING_MODEL` | No | `nomic-embed-text` | Model for embeddings |

### Vector Database Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VECTOR_DB_URL` | No | `http://localhost:5000` | Vector database API URL |
| `VECTOR_DB_PATH` | No | `./database/chroma_db` | Local vector database path |

### Feature Flags

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ENABLE_ENHANCED_AI` | No | `true` | Enable enhanced AI features |
| `ENABLE_VECTOR_SEARCH` | No | `true` | Enable vector search capabilities |
| `ENABLE_RAG` | No | `true` | Enable Retrieval-Augmented Generation |
| `ENABLE_STREAMING` | No | `true` | Enable streaming responses |

### Frontend Variables (VITE_*)

These variables are exposed to the browser and must be prefixed with `VITE_`:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_BASE_URL` | No | `http://localhost:5000` | Frontend API base URL |
| `VITE_OLLAMA_BASE_URL` | No | `http://localhost:11434` | Frontend Ollama URL |
| `VITE_VECTOR_DB_URL` | No | `http://localhost:5000` | Frontend vector DB URL |
| `VITE_OPENAI_API_KEY` | No | - | OpenAI key for frontend (use with caution) |
| `VITE_APP_ENV` | No | `development` | Frontend environment indicator |
| `VITE_DEBUG` | No | `false` | Enable frontend debug mode |
| `VITE_ENABLE_ENHANCED_AI` | No | `true` | Frontend AI feature flag |
| `VITE_ENABLE_RAG` | No | `true` | Frontend RAG feature flag |

## Environment-Specific Configurations

### Development Environment

```bash
NODE_ENV=development
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
VECTOR_DB_URL=http://localhost:5000
ENABLE_ENHANCED_AI=true
ENABLE_RAG=true
VITE_DEBUG=true
```

### Production Environment

```bash
NODE_ENV=production
AI_PROVIDER=gemini
GEMINI_API_KEY=your_production_api_key
VECTOR_DB_URL=https://vectordb.yourapp.com
ENABLE_ENHANCED_AI=true
ENABLE_RAG=true
ENABLE_STREAMING=false  # More conservative in production
VITE_DEBUG=false
```

### Test Environment

```bash
NODE_ENV=test
ENABLE_ENHANCED_AI=false  # Disable AI in tests
ENABLE_RAG=false
ENABLE_VECTOR_SEARCH=false
VECTOR_DB_URL=http://localhost:5001  # Different port for tests
```

## Getting API Keys

### Google Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Add it to your `.env` file:
   ```bash
   GEMINI_API_KEY=your_api_key_here
   ```

### OpenAI API Key

1. Visit [OpenAI API](https://platform.openai.com/api-keys)
2. Sign in to your OpenAI account
3. Create a new API key
4. Add it to your `.env` file:
   ```bash
   OPENAI_API_KEY=your_api_key_here
   ```

### Setting up Ollama

1. Install Ollama from [ollama.ai](https://ollama.ai)
2. Start the Ollama service:
   ```bash
   ollama serve
   ```
3. Pull the required models:
   ```bash
   ollama pull qwen2.5:3b-instruct
   ollama pull nomic-embed-text
   ```

## Troubleshooting

### Common Issues

#### 1. AI Features Not Working

**Symptoms:** AI-related functionality is disabled or returning errors.

**Solutions:**
- Check that your AI provider is correctly configured
- Verify API keys are valid and have sufficient quota
- For Ollama, ensure the service is running and models are downloaded

#### 2. Vector Database Connection Issues

**Symptoms:** Search functionality not working, RAG features disabled.

**Solutions:**
- Verify `VECTOR_DB_URL` is correct and accessible
- Check if the vector database service is running
- For local development, ensure the Python vector DB service is started

#### 3. Environment Variables Not Loading

**Symptoms:** Default values being used instead of your configuration.

**Solutions:**
- Ensure `.env` file is in the project root
- Check that variable names are exactly as specified (case-sensitive)
- For frontend variables, ensure they're prefixed with `VITE_`
- Restart the development server after changing `.env`

### Validation Messages

The application provides detailed validation messages on startup:

```
🔧 Environment Configuration:
   Mode: development
   AI Provider: ollama
   Vector DB URL: http://localhost:5000
   Enhanced AI: ✅
   RAG Enabled: ✅
✅ Environment configuration is valid
```

If you see warnings or errors, review the messages and update your configuration accordingly.

### Debug Mode

Enable debug mode for more detailed logging:

```bash
VITE_DEBUG=true
```

This will provide additional information about environment loading and feature availability.

## Security Best Practices

1. **Never commit `.env` files** containing real credentials to version control
2. **Use different API keys** for different environments
3. **Rotate API keys regularly** 
4. **Limit API key permissions** to only what's necessary
5. **Use environment-specific configurations** to minimize exposure
6. **Monitor API usage** to detect unauthorized access

## Production Deployment

For production deployments:

1. **Set environment variables** through your hosting platform (Vercel, Netlify, etc.)
2. **Don't use `.env` files** in production - use platform environment variables
3. **Enable production-specific settings** like reduced feature flags
4. **Use HTTPS URLs** for all external services
5. **Monitor API usage and costs**

## Advanced Configuration

### Custom AI Providers

To add support for additional AI providers, update:

1. `src/utils/envValidation.ts` - Add validation logic
2. `src/services/environmentService.ts` - Add provider configuration
3. Update this documentation

### Environment-Specific Features

Use feature flags to enable/disable functionality per environment:

```typescript
import { envService } from './services/environmentService';

if (envService.getFeatureFlags().enhancedAI) {
  // AI features enabled
}
```

### Custom Validation

Add custom validation logic in `src/utils/envValidation.ts` for specific requirements.

## Support

If you encounter issues with environment configuration:

1. Check the console for validation messages
2. Review this documentation
3. Verify your `.env` file against `.env.example`
4. Test with minimal configuration first
5. Enable debug mode for more information