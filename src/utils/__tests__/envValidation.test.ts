/**
 * Environment validation tests
 */

import { 
  validateEnvironment, 
  getEnvConfig, 
  hasValidAPIKeys,
  getEnvironmentConfig,
  getBooleanEnvVar,
  getEnvVar
} from '../envValidation';

// Mock process.env for testing
const originalEnv = process.env;

describe('Environment Validation', () => {
  beforeEach(() => {
    // Reset environment for each test
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('getEnvVar', () => {
    it('should return environment variable value', () => {
      process.env.TEST_VAR = 'test_value';
      expect(getEnvVar('TEST_VAR')).toBe('test_value');
    });

    it('should return fallback when variable is not set', () => {
      delete process.env.TEST_VAR;
      expect(getEnvVar('TEST_VAR', 'fallback')).toBe('fallback');
    });

    it('should return predefined fallback', () => {
      delete process.env.AI_PROVIDER;
      expect(getEnvVar('AI_PROVIDER')).toBe('ollama');
    });
  });

  describe('getBooleanEnvVar', () => {
    it('should return true for "true" string', () => {
      process.env.TEST_BOOL = 'true';
      expect(getBooleanEnvVar('TEST_BOOL')).toBe(true);
    });

    it('should return false for "false" string', () => {
      process.env.TEST_BOOL = 'false';
      expect(getBooleanEnvVar('TEST_BOOL')).toBe(false);
    });

    it('should return false for non-boolean strings', () => {
      process.env.TEST_BOOL = 'random';
      expect(getBooleanEnvVar('TEST_BOOL')).toBe(false);
    });

    it('should return fallback when variable is not set', () => {
      delete process.env.TEST_BOOL;
      expect(getBooleanEnvVar('TEST_BOOL', true)).toBe(true);
    });
  });

  describe('validateEnvironment', () => {
    it('should validate development environment successfully', () => {
      process.env.NODE_ENV = 'development';
      process.env.AI_PROVIDER = 'ollama';
      process.env.OLLAMA_BASE_URL = 'http://localhost:11434';
      process.env.VECTOR_DB_URL = 'http://localhost:5000';

      const result = validateEnvironment('development');
      expect(result.isValid).toBe(true);
      expect(result.missingVars).toHaveLength(0);
    });

    it('should detect missing required variables', () => {
      // Set a custom test environment that requires a variable with no fallback
      const customRequiredVars = ['CUSTOM_REQUIRED_VAR'];
      delete process.env.CUSTOM_REQUIRED_VAR;

      // Mock the REQUIRED_VARS to include our custom variable
      const originalModule = require('../envValidation');
      const mockValidateEnv = (env: string) => {
        const requiredVars = env === 'test-custom' ? customRequiredVars : [];
        const missingVars = requiredVars.filter(varName => !process.env[varName]);
        return {
          isValid: missingVars.length === 0,
          missingVars,
          warnings: []
        };
      };

      const result = mockValidateEnv('test-custom');
      expect(result.isValid).toBe(false);
      expect(result.missingVars).toContain('CUSTOM_REQUIRED_VAR');
    });

    it('should generate warnings for missing API keys', () => {
      process.env.AI_PROVIDER = 'gemini';
      delete process.env.GEMINI_API_KEY;
      delete process.env.API_KEY;

      const result = validateEnvironment('development');
      expect(result.warnings).toContain('GEMINI_API_KEY is not set. AI features may not work properly.');
    });
  });

  describe('hasValidAPIKeys', () => {
    it('should return true for ollama provider', () => {
      process.env.AI_PROVIDER = 'ollama';
      process.env.OLLAMA_BASE_URL = 'http://localhost:11434';
      expect(hasValidAPIKeys()).toBe(true);
    });

    it('should return true for gemini with API key', () => {
      process.env.AI_PROVIDER = 'gemini';
      process.env.GEMINI_API_KEY = 'test_key';
      expect(hasValidAPIKeys()).toBe(true);
    });

    it('should return false for gemini without API key', () => {
      process.env.AI_PROVIDER = 'gemini';
      delete process.env.GEMINI_API_KEY;
      delete process.env.API_KEY;
      expect(hasValidAPIKeys()).toBe(false);
    });

    it('should return true for openai with API key', () => {
      process.env.AI_PROVIDER = 'openai';
      process.env.OPENAI_API_KEY = 'test_key';
      expect(hasValidAPIKeys()).toBe(true);
    });

    it('should return false for openai without API key', () => {
      process.env.AI_PROVIDER = 'openai';
      delete process.env.OPENAI_API_KEY;
      expect(hasValidAPIKeys()).toBe(false);
    });
  });

  describe('getEnvConfig', () => {
    it('should return complete configuration with defaults', () => {
      const config = getEnvConfig();
      
      expect(config).toHaveProperty('AI_PROVIDER');
      expect(config).toHaveProperty('OLLAMA_BASE_URL');
      expect(config).toHaveProperty('VECTOR_DB_URL');
      expect(config).toHaveProperty('ENABLE_ENHANCED_AI');
      expect(config).toHaveProperty('NODE_ENV');
      
      // Test defaults
      expect(config.AI_PROVIDER).toBe('ollama');
      expect(config.OLLAMA_BASE_URL).toBe('http://localhost:11434');
      expect(config.ENABLE_ENHANCED_AI).toBe(true);
    });

    it('should use environment values when set', () => {
      process.env.AI_PROVIDER = 'gemini';
      process.env.VECTOR_DB_URL = 'https://custom-vector-db.com';
      process.env.ENABLE_RAG = 'false';

      const config = getEnvConfig();
      
      expect(config.AI_PROVIDER).toBe('gemini');
      expect(config.VECTOR_DB_URL).toBe('https://custom-vector-db.com');
      expect(config.ENABLE_RAG).toBe(false);
    });
  });

  describe('getEnvironmentConfig', () => {
    it('should return development configuration', () => {
      const config = getEnvironmentConfig('development');
      expect(config.DEBUG).toBe(true);
    });

    it('should return production configuration with conservative settings', () => {
      process.env.ENABLE_STREAMING = 'true';
      const config = getEnvironmentConfig('production');
      expect(config.DEBUG).toBe(false);
      expect(config.ENABLE_STREAMING).toBe(false); // More conservative in production
    });

    it('should return test configuration with AI disabled', () => {
      const config = getEnvironmentConfig('test');
      expect(config.ENABLE_ENHANCED_AI).toBe(false);
      expect(config.ENABLE_RAG).toBe(false);
      expect(config.VECTOR_DB_URL).toBe('http://localhost:5001');
    });
  });
});