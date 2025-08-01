/**
 * Environment validation utilities
 * Provides validation and fallback mechanisms for environment variables
 */

export interface EnvValidationResult {
  isValid: boolean;
  missingVars: string[];
  warnings: string[];
}

export interface EnvConfig {
  // AI Provider Configuration
  AI_PROVIDER: string;
  GEMINI_API_KEY?: string;
  OPENAI_API_KEY?: string;
  OLLAMA_BASE_URL: string;
  OLLAMA_MODEL: string;
  
  // Vector DB Configuration
  VECTOR_DB_URL: string;
  
  // Feature Flags
  ENABLE_ENHANCED_AI: boolean;
  ENABLE_RAG: boolean;
  ENABLE_VECTOR_SEARCH: boolean;
  ENABLE_STREAMING: boolean;
  
  // App Configuration
  NODE_ENV: string;
  DEBUG: boolean;
}

/**
 * Required environment variables for different environments
 */
const REQUIRED_VARS = {
  development: [
    'NODE_ENV',
  ],
  production: [
    'NODE_ENV',
    'AI_PROVIDER',
  ],
  test: [
    'NODE_ENV',
  ],
};

/**
 * Optional environment variables with fallbacks
 */
const FALLBACKS = {
  AI_PROVIDER: 'ollama',
  OLLAMA_BASE_URL: 'http://localhost:11434',
  OLLAMA_MODEL: 'qwen2.5:3b-instruct',
  VECTOR_DB_URL: 'http://localhost:5000',
  ENABLE_ENHANCED_AI: 'true',
  ENABLE_RAG: 'true',
  ENABLE_VECTOR_SEARCH: 'true',
  ENABLE_STREAMING: 'true',
  NODE_ENV: 'development',
  DEBUG: 'false',
};

/**
 * Get environment variable with fallback
 */
export function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key] || fallback || (FALLBACKS as any)[key];
  return value || '';
}

/**
 * Get boolean environment variable
 */
export function getBooleanEnvVar(key: string, fallback: boolean = false): boolean {
  const value = getEnvVar(key, fallback.toString());
  return value.toLowerCase() === 'true';
}

/**
 * Validate required environment variables
 */
export function validateEnvironment(env: string = process.env.NODE_ENV || 'development'): EnvValidationResult {
  const requiredVars = REQUIRED_VARS[env as keyof typeof REQUIRED_VARS] || REQUIRED_VARS.development;
  const missingVars: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const varName of requiredVars) {
    if (!process.env[varName] && !(FALLBACKS as any)[varName]) {
      missingVars.push(varName);
    }
  }

  // Check AI provider specific requirements
  const aiProvider = getEnvVar('AI_PROVIDER', 'ollama');
  if (aiProvider === 'gemini' && !process.env.GEMINI_API_KEY && !process.env.API_KEY) {
    warnings.push('GEMINI_API_KEY is not set. AI features may not work properly.');
  }
  if (aiProvider === 'openai' && !process.env.OPENAI_API_KEY) {
    warnings.push('OPENAI_API_KEY is not set. AI features may not work properly.');
  }

  return {
    isValid: missingVars.length === 0,
    missingVars,
    warnings,
  };
}

/**
 * Get validated environment configuration
 */
export function getEnvConfig(): EnvConfig {
  return {
    AI_PROVIDER: getEnvVar('AI_PROVIDER', 'ollama'),
    GEMINI_API_KEY: getEnvVar('GEMINI_API_KEY') || getEnvVar('API_KEY'),
    OPENAI_API_KEY: getEnvVar('OPENAI_API_KEY'),
    OLLAMA_BASE_URL: getEnvVar('OLLAMA_BASE_URL', 'http://localhost:11434'),
    OLLAMA_MODEL: getEnvVar('OLLAMA_MODEL', 'qwen2.5:3b-instruct'),
    VECTOR_DB_URL: getEnvVar('VECTOR_DB_URL', 'http://localhost:5000'),
    ENABLE_ENHANCED_AI: getBooleanEnvVar('ENABLE_ENHANCED_AI', true),
    ENABLE_RAG: getBooleanEnvVar('ENABLE_RAG', true),
    ENABLE_VECTOR_SEARCH: getBooleanEnvVar('ENABLE_VECTOR_SEARCH', true),
    ENABLE_STREAMING: getBooleanEnvVar('ENABLE_STREAMING', true),
    NODE_ENV: getEnvVar('NODE_ENV', 'development'),
    DEBUG: getBooleanEnvVar('DEBUG', false),
  };
}

/**
 * Check if API keys are available for the current AI provider
 */
export function hasValidAPIKeys(): boolean {
  const config = getEnvConfig();
  
  switch (config.AI_PROVIDER) {
    case 'gemini':
      return !!(config.GEMINI_API_KEY);
    case 'openai':
      return !!(config.OPENAI_API_KEY);
    case 'ollama':
      // Ollama doesn't require API keys, just check if URL is accessible
      return !!config.OLLAMA_BASE_URL;
    default:
      return false;
  }
}

/**
 * Get environment-specific configuration
 */
export function getEnvironmentConfig(env: string = process.env.NODE_ENV || 'development') {
  const baseConfig = getEnvConfig();
  
  switch (env) {
    case 'production':
      return {
        ...baseConfig,
        DEBUG: false,
        ENABLE_STREAMING: false, // More conservative in production
      };
    
    case 'test':
      return {
        ...baseConfig,
        DEBUG: false,
        ENABLE_ENHANCED_AI: false, // Disable AI in tests by default
        ENABLE_RAG: false,
        ENABLE_VECTOR_SEARCH: false,
        ENABLE_STREAMING: false,
        VECTOR_DB_URL: 'http://localhost:5001', // Use different port for tests
      };
    
    case 'development':
    default:
      return {
        ...baseConfig,
        DEBUG: getBooleanEnvVar('DEBUG', true),
      };
  }
}

/**
 * Log environment validation results
 */
export function logEnvironmentStatus(): void {
  const validation = validateEnvironment();
  const config = getEnvConfig();
  
  console.log('🔧 Environment Configuration:');
  console.log(`   Environment: ${config.NODE_ENV}`);
  console.log(`   AI Provider: ${config.AI_PROVIDER}`);
  console.log(`   Vector DB URL: ${config.VECTOR_DB_URL}`);
  console.log(`   Enhanced AI: ${config.ENABLE_ENHANCED_AI ? '✅' : '❌'}`);
  console.log(`   RAG Enabled: ${config.ENABLE_RAG ? '✅' : '❌'}`);
  
  if (!validation.isValid) {
    console.warn('⚠️  Missing required environment variables:');
    validation.missingVars.forEach(varName => {
      console.warn(`   - ${varName}`);
    });
  }
  
  if (validation.warnings.length > 0) {
    console.warn('⚠️  Environment warnings:');
    validation.warnings.forEach(warning => {
      console.warn(`   - ${warning}`);
    });
  }
  
  if (validation.isValid && validation.warnings.length === 0) {
    console.log('✅ Environment configuration is valid');
  }
}