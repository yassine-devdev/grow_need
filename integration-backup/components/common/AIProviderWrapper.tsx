/**
 * AI Provider Wrapper Component
 * Provides unified AI context for the entire application
 * Handles feature flags, fallbacks, and provider switching
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { EnhancedAIProvider } from '../../services/enhancedAIProvider';
import { AIServiceFactory, getSystemStatus } from '../../services/aiServiceFactory';

// Context interfaces
interface AIContextValue {
  provider: EnhancedAIProvider | any;
  isEnhanced: boolean;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  systemStatus: any;
  features: {
    enhancedAI: boolean;
    vectorSearch: boolean;
    rag: boolean;
    streaming: boolean;
  };
  refreshProvider: () => Promise<void>;
  switchToEnhanced: () => Promise<void>;
  switchToLegacy: () => Promise<void>;
}

interface AIProviderWrapperProps {
  children: ReactNode;
  config?: {
    autoConnect?: boolean;
    preferEnhanced?: boolean;
    fallbackToLegacy?: boolean;
    enableFeatureFlags?: boolean;
  };
}

// Create context
const AIContext = createContext<AIContextValue | null>(null);

// Feature flag component
const FeatureFlagIndicator: React.FC<{ features: any }> = ({ features }) => {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 10,
        right: 10,
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        zIndex: 9999,
        fontFamily: 'monospace',
      }}
    >
      <div>🤖 AI: {features.enhancedAI ? '✅' : '❌'}</div>
      <div>🔍 Vector: {features.vectorSearch ? '✅' : '❌'}</div>
      <div>🧠 RAG: {features.rag ? '✅' : '❌'}</div>
      <div>⚡ Stream: {features.streaming ? '✅' : '❌'}</div>
    </div>
  );
};

// Connection status indicator
const ConnectionStatusIndicator: React.FC<{ 
  isConnected: boolean; 
  isEnhanced: boolean; 
  systemStatus: any;
}> = ({ isConnected, isEnhanced, systemStatus }) => {
  if (process.env.NODE_ENV !== 'development') return null;

  const getStatusColor = () => {
    if (!isConnected) return '#ef4444';
    if (systemStatus?.overall === 'healthy') return '#10b981';
    if (systemStatus?.overall === 'degraded') return '#f59e0b';
    return '#6b7280';
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 10,
        right: 10,
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        zIndex: 9999,
        fontFamily: 'monospace',
        border: `2px solid ${getStatusColor()}`,
      }}
    >
      <div>Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}</div>
      <div>Mode: {isEnhanced ? '🚀 Enhanced' : '⚡ Legacy'}</div>
      {systemStatus && (
        <div>Health: {systemStatus.overall || 'Unknown'}</div>
      )}
    </div>
  );
};

// Main provider component
export const AIProviderWrapper: React.FC<AIProviderWrapperProps> = ({
  children,
  config = {},
}) => {
  const {
    autoConnect = true,
    preferEnhanced = true,
    fallbackToLegacy = true,
    enableFeatureFlags = process.env.NODE_ENV === 'development',
  } = config;

  // State management
  const [provider, setProvider] = useState<EnhancedAIProvider | any>(null);
  const [isEnhanced, setIsEnhanced] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [features, setFeatures] = useState({
    enhancedAI: false,
    vectorSearch: false,
    rag: false,
    streaming: false,
  });

  // Initialize provider
  const initializeProvider = async (forceEnhanced = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const factory = AIServiceFactory.getInstance();
      const newProvider = await factory.createProvider(forceEnhanced || preferEnhanced);
      
      setProvider(newProvider);
      setIsEnhanced(newProvider instanceof EnhancedAIProvider);

      // Test connection
      let connected = false;
      if (newProvider instanceof EnhancedAIProvider) {
        const health = await newProvider.getHealthStatus();
        setSystemStatus(health);
        connected = health.overall !== 'unhealthy';
      } else {
        connected = await newProvider.isConnected();
      }

      setIsConnected(connected);

      // Update feature flags
      const factoryFeatures = factory.getFeatureFlags();
      setFeatures({
        enhancedAI: factoryFeatures.enableEnhancedAI,
        vectorSearch: factoryFeatures.enableVectorSearch,
        rag: factoryFeatures.enableRAG,
        streaming: factoryFeatures.enableStreaming,
      });

    } catch (err) {
      console.error('Failed to initialize AI provider:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize AI provider');
      setIsConnected(false);
      
      // Try fallback if enabled
      if (fallbackToLegacy && !forceEnhanced) {
        try {
          const factory = AIServiceFactory.getInstance();
          const fallbackProvider = await factory.createLegacyProvider();
          setProvider(fallbackProvider);
          setIsEnhanced(false);
          setIsConnected(await fallbackProvider.isConnected());
          setError(null);
        } catch (fallbackErr) {
          console.error('Fallback provider also failed:', fallbackErr);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh provider
  const refreshProvider = async () => {
    if (provider) {
      await initializeProvider(isEnhanced);
    }
  };

  // Switch to enhanced
  const switchToEnhanced = async () => {
    await initializeProvider(true);
  };

  // Switch to legacy
  const switchToLegacy = async () => {
    setIsLoading(true);
    try {
      const factory = AIServiceFactory.getInstance();
      const legacyProvider = await factory.createLegacyProvider();
      setProvider(legacyProvider);
      setIsEnhanced(false);
      setIsConnected(await legacyProvider.isConnected());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch to legacy provider');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize on mount
  useEffect(() => {
    if (autoConnect) {
      initializeProvider();
    }
  }, [autoConnect]);

  // Periodic health checks
  useEffect(() => {
    if (!isConnected || !provider) return;

    const interval = setInterval(async () => {
      try {
        if (provider instanceof EnhancedAIProvider) {
          const health = await provider.getHealthStatus();
          setSystemStatus(health);
          setIsConnected(health.overall !== 'unhealthy');
        } else {
          const connected = await provider.isConnected();
          setIsConnected(connected);
        }
      } catch (err) {
        console.warn('Health check failed:', err);
        setIsConnected(false);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [isConnected, provider]);

  // Get system status periodically
  useEffect(() => {
    const updateSystemStatus = async () => {
      try {
        const status = await getSystemStatus();
        setSystemStatus(status);
      } catch (err) {
        console.warn('Failed to get system status:', err);
      }
    };

    updateSystemStatus();
    const interval = setInterval(updateSystemStatus, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Context value
  const contextValue: AIContextValue = {
    provider,
    isEnhanced,
    isConnected,
    isLoading,
    error,
    systemStatus,
    features,
    refreshProvider,
    switchToEnhanced,
    switchToLegacy,
  };

  return (
    <AIContext.Provider value={contextValue}>
      {children}
      {enableFeatureFlags && <FeatureFlagIndicator features={features} />}
      {enableFeatureFlags && (
        <ConnectionStatusIndicator
          isConnected={isConnected}
          isEnhanced={isEnhanced}
          systemStatus={systemStatus}
        />
      )}
    </AIContext.Provider>
  );
};

// Hook to use AI context
export const useAIProvider = (): AIContextValue => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAIProvider must be used within AIProviderWrapper');
  }
  return context;
};

// Hook for enhanced AI specifically
export const useEnhancedAIProvider = (): EnhancedAIProvider => {
  const { provider, isEnhanced } = useAIProvider();
  
  if (!isEnhanced || !(provider instanceof EnhancedAIProvider)) {
    throw new Error('Enhanced AI provider not available');
  }
  
  return provider;
};

// Hook for checking feature availability
export const useAIFeatures = () => {
  const { features, isEnhanced, isConnected, systemStatus } = useAIProvider();
  
  return {
    ...features,
    available: {
      enhancedAI: isEnhanced && isConnected,
      vectorSearch: features.vectorSearch && systemStatus?.vectorDB,
      rag: features.rag && systemStatus?.vectorDB,
      streaming: features.streaming && isConnected,
    },
  };
};

// Error boundary for AI provider
export class AIProviderErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('AI Provider Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h3>AI Provider Error</h3>
            <p>Something went wrong with the AI provider.</p>
            <button onClick={() => this.setState({ hasError: false })}>
              Try Again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default AIProviderWrapper;
