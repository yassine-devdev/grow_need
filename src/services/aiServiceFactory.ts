/**
 * AI Service Factory
 * Provides unified interface for creating AI service instances
 * Handles feature flags and graceful fallbacks
 */

import { EnhancedAIProvider } from './enhancedAIProvider';

// Import existing services for backward compatibility
interface LegacyAIProvider {
  generateContent(prompt: string, options?: any): Promise<string>;
  isConnected(): Promise<boolean>;
}

// Feature flags interface
interface FeatureFlags {
  enableEnhancedAI: boolean;
  enableVectorSearch: boolean;
  enableRAG: boolean;
  enableStreaming: boolean;
}

// Service configuration
interface ServiceConfig {
  ollamaUrl?: string;
  vectorDBUrl?: string;
  featureFlags?: Partial<FeatureFlags>;
  fallbackToLegacy?: boolean;
}

export class AIServiceFactory {
  private static instance: AIServiceFactory;
  private config: ServiceConfig;
  private enhancedProvider: EnhancedAIProvider | null = null;
  private legacyProvider: LegacyAIProvider | null = null;

  private constructor(config: ServiceConfig = {}) {
    this.config = {
      ollamaUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      vectorDBUrl: process.env.VECTOR_DB_URL || 'http://localhost:5000',
      featureFlags: {
        enableEnhancedAI: process.env.ENABLE_ENHANCED_AI === 'true',
        enableVectorSearch: process.env.ENABLE_VECTOR_SEARCH === 'true',
        enableRAG: process.env.ENABLE_RAG === 'true',
        enableStreaming: process.env.ENABLE_STREAMING === 'true',
      },
      fallbackToLegacy: true,
      ...config,
    };
  }

  /**
   * Get singleton instance
   */
  static getInstance(config?: ServiceConfig): AIServiceFactory {
    if (!AIServiceFactory.instance) {
      AIServiceFactory.instance = new AIServiceFactory(config);
    }
    return AIServiceFactory.instance;
  }

  /**
   * Create AI provider based on configuration and feature flags
   */
  async createProvider(forceEnhanced = false): Promise<EnhancedAIProvider | LegacyAIProvider> {
    const useEnhanced = forceEnhanced || this.config.featureFlags?.enableEnhancedAI;

    if (useEnhanced) {
      try {
        if (!this.enhancedProvider) {
          this.enhancedProvider = new EnhancedAIProvider(this.config.vectorDBUrl);
        }

        // Test if enhanced provider is working
        const healthStatus = await this.enhancedProvider.getHealthStatus();
        
        if (healthStatus.overall !== 'unhealthy') {
          return this.enhancedProvider;
        } else if (this.config.fallbackToLegacy) {
          console.warn('Enhanced AI provider unhealthy, falling back to legacy provider');
          return this.createLegacyProvider();
        } else {
          throw new Error('Enhanced AI provider is unhealthy and fallback is disabled');
        }
      } catch (error) {
        console.error('Failed to create enhanced provider:', error);
        
        if (this.config.fallbackToLegacy) {
          console.warn('Falling back to legacy provider');
          return this.createLegacyProvider();
        } else {
          throw error;
        }
      }
    }

    return this.createLegacyProvider();
  }

  /**
   * Create legacy provider for backward compatibility
   */
  private async createLegacyProvider(): Promise<LegacyAIProvider> {
    if (this.legacyProvider) {
      return this.legacyProvider;
    }

    // Try to import existing AI provider
    try {
      // Attempt to import existing aiProvider
      const { aiProvider } = await import('./aiProvider');
      this.legacyProvider = aiProvider;
      return this.legacyProvider;
    } catch (error) {
      console.warn('Legacy AI provider not found, creating minimal implementation');
      
      // Create minimal implementation if legacy provider doesn't exist
      this.legacyProvider = {
        async generateContent(prompt: string, options: any = {}): Promise<string> {
          // Basic Ollama implementation
          const response = await fetch(`${this.config.ollamaUrl}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'qwen2.5:3b-instruct',
              prompt,
              stream: false,
              options: {
                temperature: options.temperature || 0.7,
                num_predict: options.maxTokens || 1000,
              },
            }),
          });

          if (!response.ok) {
            throw new Error(`AI generation failed: ${response.status}`);
          }

          const data = await response.json();
          return data.response || '';
        },

        async isConnected(): Promise<boolean> {
          try {
            const response = await fetch(`${this.config.ollamaUrl}/api/tags`);
            return response.ok;
          } catch {
            return false;
          }
        },
      };

      return this.legacyProvider;
    }
  }

  /**
   * Get enhanced provider specifically (throws if not available)
   */
  async getEnhancedProvider(): Promise<EnhancedAIProvider> {
    const provider = await this.createProvider(true);
    
    if (!(provider instanceof EnhancedAIProvider)) {
      throw new Error('Enhanced AI provider not available');
    }

    return provider;
  }

  /**
   * Check if enhanced features are available
   */
  async isEnhancedAvailable(): Promise<boolean> {
    try {
      const provider = await this.getEnhancedProvider();
      const health = await provider.getHealthStatus();
      return health.overall !== 'unhealthy';
    } catch {
      return false;
    }
  }

  /**
   * Get feature flags
   */
  getFeatureFlags(): FeatureFlags {
    return {
      enableEnhancedAI: false,
      enableVectorSearch: false,
      enableRAG: false,
      enableStreaming: false,
      ...this.config.featureFlags,
    };
  }

  /**
   * Update feature flags
   */
  updateFeatureFlags(flags: Partial<FeatureFlags>): void {
    this.config.featureFlags = {
      ...this.config.featureFlags,
      ...flags,
    };
  }

  /**
   * Get system status
   */
  async getSystemStatus(): Promise<{
    enhanced: boolean;
    legacy: boolean;
    vectorDB: boolean;
    features: FeatureFlags;
    recommendations: string[];
  }> {
    const features = this.getFeatureFlags();
    const recommendations: string[] = [];

    let enhanced = false;
    let legacy = false;
    let vectorDB = false;

    // Test enhanced provider
    try {
      const enhancedProvider = await this.getEnhancedProvider();
      const health = await enhancedProvider.getHealthStatus();
      enhanced = health.ai;
      vectorDB = health.vectorDB;

      if (!health.ai) {
        recommendations.push('Ollama service is not running or not accessible');
      }
      if (!health.vectorDB) {
        recommendations.push('Vector database is not running or not accessible');
      }
    } catch (error) {
      recommendations.push('Enhanced AI provider could not be initialized');
    }

    // Test legacy provider
    try {
      const legacyProvider = await this.createLegacyProvider();
      legacy = await legacyProvider.isConnected();
    } catch (error) {
      recommendations.push('Legacy AI provider could not be initialized');
    }

    // Feature recommendations
    if (!features.enableEnhancedAI && enhanced) {
      recommendations.push('Enhanced AI is available but not enabled');
    }
    if (!features.enableRAG && vectorDB) {
      recommendations.push('Vector database is available but RAG is not enabled');
    }

    return {
      enhanced,
      legacy,
      vectorDB,
      features,
      recommendations,
    };
  }

  /**
   * Create provider with specific configuration
   */
  static async createWithConfig(config: ServiceConfig): Promise<EnhancedAIProvider | LegacyAIProvider> {
    const factory = new AIServiceFactory(config);
    return factory.createProvider();
  }

  /**
   * Quick factory methods for common use cases
   */
  static async createEnhanced(vectorDBUrl?: string): Promise<EnhancedAIProvider> {
    const factory = AIServiceFactory.getInstance({
      vectorDBUrl,
      featureFlags: { enableEnhancedAI: true, enableRAG: true },
    });
    return factory.getEnhancedProvider();
  }

  static async createLegacy(): Promise<LegacyAIProvider> {
    const factory = AIServiceFactory.getInstance({
      featureFlags: { enableEnhancedAI: false },
    });
    return factory.createLegacyProvider();
  }

  static async createAuto(): Promise<EnhancedAIProvider | LegacyAIProvider> {
    const factory = AIServiceFactory.getInstance();
    return factory.createProvider();
  }
}

// Export convenience functions
export const createAIProvider = (forceEnhanced = false) => {
  const factory = AIServiceFactory.getInstance();
  return factory.createProvider(forceEnhanced);
};

export const createEnhancedAI = (vectorDBUrl?: string) => {
  return AIServiceFactory.createEnhanced(vectorDBUrl);
};

export const createLegacyAI = () => {
  return AIServiceFactory.createLegacy();
};

export const getSystemStatus = () => {
  const factory = AIServiceFactory.getInstance();
  return factory.getSystemStatus();
};

export const isEnhancedAvailable = () => {
  const factory = AIServiceFactory.getInstance();
  return factory.isEnhancedAvailable();
};

// Export default factory instance
export default AIServiceFactory;
