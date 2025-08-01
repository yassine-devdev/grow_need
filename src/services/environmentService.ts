/**
 * Environment Configuration Service
 * Provides centralized environment configuration with graceful fallbacks
 */

import { getEnvConfig, hasValidAPIKeys, logEnvironmentStatus } from '../utils/envValidation';

export class EnvironmentService {
  private static instance: EnvironmentService;
  private config: ReturnType<typeof getEnvConfig>;
  private initialized = false;

  private constructor() {
    this.config = getEnvConfig();
  }

  static getInstance(): EnvironmentService {
    if (!EnvironmentService.instance) {
      EnvironmentService.instance = new EnvironmentService();
    }
    return EnvironmentService.instance;
  }

  /**
   * Initialize the environment service
   */
  initialize(): void {
    if (this.initialized) return;
    
    logEnvironmentStatus();
    this.initialized = true;
  }

  /**
   * Get the current environment configuration
   */
  getConfig() {
    return this.config;
  }

  /**
   * Check if AI features are available
   */
  isAIAvailable(): boolean {
    return this.config.ENABLE_ENHANCED_AI && hasValidAPIKeys();
  }

  /**
   * Check if RAG features are available
   */
  isRAGAvailable(): boolean {
    return this.config.ENABLE_RAG && this.isAIAvailable();
  }

  /**
   * Check if vector search is available
   */
  isVectorSearchAvailable(): boolean {
    return this.config.ENABLE_VECTOR_SEARCH && !!this.config.VECTOR_DB_URL;
  }

  /**
   * Get AI provider configuration with fallbacks
   */
  getAIProviderConfig() {
    const { AI_PROVIDER, GEMINI_API_KEY, OPENAI_API_KEY, OLLAMA_BASE_URL, OLLAMA_MODEL } = this.config;
    
    if (!this.isAIAvailable()) {
      return {
        provider: 'mock',
        available: false,
        reason: 'AI features disabled or API keys missing'
      };
    }

    switch (AI_PROVIDER) {
      case 'gemini':
        return {
          provider: 'gemini',
          apiKey: GEMINI_API_KEY,
          available: !!GEMINI_API_KEY,
          reason: !GEMINI_API_KEY ? 'Gemini API key not configured' : undefined
        };
      
      case 'openai':
        return {
          provider: 'openai',
          apiKey: OPENAI_API_KEY,
          available: !!OPENAI_API_KEY,
          reason: !OPENAI_API_KEY ? 'OpenAI API key not configured' : undefined
        };
      
      case 'ollama':
      default:
        return {
          provider: 'ollama',
          baseUrl: OLLAMA_BASE_URL,
          model: OLLAMA_MODEL,
          available: !!OLLAMA_BASE_URL,
          reason: !OLLAMA_BASE_URL ? 'Ollama URL not configured' : undefined
        };
    }
  }

  /**
   * Get vector database configuration
   */
  getVectorDBConfig() {
    return {
      url: this.config.VECTOR_DB_URL,
      available: this.isVectorSearchAvailable(),
      reason: !this.config.VECTOR_DB_URL ? 'Vector DB URL not configured' : undefined
    };
  }

  /**
   * Get feature flags
   */
  getFeatureFlags() {
    return {
      enhancedAI: this.isAIAvailable(),
      rag: this.isRAGAvailable(),
      vectorSearch: this.isVectorSearchAvailable(),
      streaming: this.config.ENABLE_STREAMING,
    };
  }

  /**
   * Handle missing environment variable gracefully
   */
  handleMissingEnvVar(varName: string, fallback?: string): string {
    const value = process.env[varName] || fallback || '';
    
    if (!value) {
      console.warn(`⚠️  Environment variable ${varName} is not set${fallback ? `, using fallback: ${fallback}` : ''}`);
    }
    
    return value;
  }

  /**
   * Get environment-specific URLs with fallbacks
   */
  getServiceUrls() {
    const { NODE_ENV } = this.config;
    
    const baseUrls = {
      development: {
        api: 'http://localhost:5000',
        vectorDB: 'http://localhost:5000',
        ollama: 'http://localhost:11434',
      },
      production: {
        api: process.env.VITE_API_BASE_URL || 'https://api.yourapp.com',
        vectorDB: process.env.VITE_VECTOR_DB_URL || 'https://vectordb.yourapp.com',
        ollama: process.env.VITE_OLLAMA_BASE_URL || 'https://ollama.yourapp.com',
      },
      test: {
        api: 'http://localhost:5001',
        vectorDB: 'http://localhost:5001',
        ollama: 'http://localhost:11435',
      }
    };

    return baseUrls[NODE_ENV as keyof typeof baseUrls] || baseUrls.development;
  }

  /**
   * Check if we're in development mode
   */
  isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }

  /**
   * Check if we're in production mode
   */
  isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }

  /**
   * Check if we're in test mode
   */
  isTest(): boolean {
    return this.config.NODE_ENV === 'test';
  }

  /**
   * Get debug status
   */
  isDebugEnabled(): boolean {
    return this.config.DEBUG;
  }
}

// Export singleton instance
export const envService = EnvironmentService.getInstance();