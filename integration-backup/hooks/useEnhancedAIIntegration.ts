/**
 * Enhanced AI Integration Hook
 * Provides unified interface for enhanced AI features with fallback support
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { EnhancedAIProvider, GenerationResult, EnhancedGenerationOptions } from '../services/enhancedAIProvider';
import { AIServiceFactory, createAIProvider, isEnhancedAvailable } from '../services/aiServiceFactory';

export interface UseEnhancedAIOptions {
  autoConnect?: boolean;
  enableRAG?: boolean;
  defaultCollection?: string;
  fallbackToLegacy?: boolean;
}

export interface EnhancedAIState {
  isConnected: boolean;
  isEnhanced: boolean;
  isLoading: boolean;
  error: string | null;
  vectorDBAvailable: boolean;
  systemHealth: {
    ai: boolean;
    vectorDB: boolean;
    overall: 'healthy' | 'degraded' | 'unhealthy';
  } | null;
}

export interface UseEnhancedAIReturn {
  // State
  state: EnhancedAIState;
  
  // Core generation methods
  generateContent: (prompt: string, options?: EnhancedGenerationOptions) => Promise<GenerationResult>;
  generateStreaming: (
    prompt: string, 
    options?: EnhancedGenerationOptions & {
      onChunk?: (chunk: string) => void;
      onComplete?: (fullText: string) => void;
    }
  ) => Promise<string>;
  
  // Educational content methods
  generateLessonPlan: (params: {
    subject: string;
    grade: string;
    topic: string;
    duration: string;
  }, options?: EnhancedGenerationOptions) => Promise<GenerationResult>;
  
  generateQuiz: (params: {
    topic: string;
    difficulty: string;
    questionCount: number;
    questionTypes?: string[];
  }, options?: EnhancedGenerationOptions) => Promise<GenerationResult>;
  
  generateAssessment: (params: {
    assignmentType: string;
    subject: string;
    grade: string;
    criteria: string[];
  }, options?: EnhancedGenerationOptions) => Promise<GenerationResult>;
  
  // Vector database methods
  searchContent: (query: string, collection?: string) => Promise<any>;
  uploadContent: (file: File, metadata?: any) => Promise<any>;
  
  // System methods
  checkConnection: () => Promise<void>;
  refreshHealth: () => Promise<void>;
  toggleRAG: (enabled: boolean) => void;
}

export const useEnhancedAI = (options: UseEnhancedAIOptions = {}): UseEnhancedAIReturn => {
  const {
    autoConnect = true,
    enableRAG = true,
    defaultCollection = 'educational_content',
    fallbackToLegacy = true,
  } = options;

  // State management
  const [state, setState] = useState<EnhancedAIState>({
    isConnected: false,
    isEnhanced: false,
    isLoading: false,
    error: null,
    vectorDBAvailable: false,
    systemHealth: null,
  });

  // Refs for providers
  const providerRef = useRef<EnhancedAIProvider | any>(null);
  const ragEnabledRef = useRef(enableRAG);

  // Update state helper
  const updateState = useCallback((updates: Partial<EnhancedAIState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Initialize provider
  const initializeProvider = useCallback(async () => {
    updateState({ isLoading: true, error: null });

    try {
      // Check if enhanced AI is available
      const enhancedAvailable = await isEnhancedAvailable();
      
      // Create appropriate provider
      const provider = await createAIProvider(enhancedAvailable);
      providerRef.current = provider;

      // Check system health if enhanced
      let systemHealth = null;
      if (provider instanceof EnhancedAIProvider) {
        systemHealth = await provider.getHealthStatus();
      }

      updateState({
        isConnected: true,
        isEnhanced: provider instanceof EnhancedAIProvider,
        vectorDBAvailable: systemHealth?.vectorDB || false,
        systemHealth,
        isLoading: false,
      });

    } catch (error) {
      console.error('Failed to initialize AI provider:', error);
      updateState({
        isConnected: false,
        isEnhanced: false,
        vectorDBAvailable: false,
        error: error instanceof Error ? error.message : 'Failed to initialize AI provider',
        isLoading: false,
      });
    }
  }, [updateState]);

  // Check connection
  const checkConnection = useCallback(async () => {
    if (!providerRef.current) {
      await initializeProvider();
      return;
    }

    try {
      updateState({ isLoading: true, error: null });

      if (providerRef.current instanceof EnhancedAIProvider) {
        const health = await providerRef.current.getHealthStatus();
        updateState({
          isConnected: health.overall !== 'unhealthy',
          systemHealth: health,
          vectorDBAvailable: health.vectorDB,
          isLoading: false,
        });
      } else {
        const connected = await providerRef.current.isConnected();
        updateState({
          isConnected: connected,
          isLoading: false,
        });
      }
    } catch (error) {
      updateState({
        isConnected: false,
        error: error instanceof Error ? error.message : 'Connection check failed',
        isLoading: false,
      });
    }
  }, [initializeProvider, updateState]);

  // Refresh health status
  const refreshHealth = useCallback(async () => {
    if (providerRef.current instanceof EnhancedAIProvider) {
      try {
        const health = await providerRef.current.getHealthStatus();
        updateState({
          systemHealth: health,
          isConnected: health.overall !== 'unhealthy',
          vectorDBAvailable: health.vectorDB,
        });
      } catch (error) {
        console.error('Failed to refresh health:', error);
      }
    }
  }, [updateState]);

  // Toggle RAG
  const toggleRAG = useCallback((enabled: boolean) => {
    ragEnabledRef.current = enabled;
  }, []);

  // Generate content
  const generateContent = useCallback(async (
    prompt: string,
    options: EnhancedGenerationOptions = {}
  ): Promise<GenerationResult> => {
    if (!providerRef.current) {
      throw new Error('AI provider not initialized');
    }

    const enhancedOptions = {
      useRAG: ragEnabledRef.current && state.vectorDBAvailable,
      collection: defaultCollection,
      ...options,
    };

    if (providerRef.current instanceof EnhancedAIProvider) {
      return providerRef.current.generateContent(prompt, enhancedOptions);
    } else {
      // Fallback for legacy provider
      const content = await providerRef.current.generateContent(prompt, options);
      return {
        content,
        metadata: {
          usedRAG: false,
          responseTime: 0,
          sourcesUsed: 0,
        },
      };
    }
  }, [state.vectorDBAvailable, defaultCollection]);

  // Generate streaming content
  const generateStreaming = useCallback(async (
    prompt: string,
    options: EnhancedGenerationOptions & {
      onChunk?: (chunk: string) => void;
      onComplete?: (fullText: string) => void;
    } = {}
  ): Promise<string> => {
    if (!providerRef.current) {
      throw new Error('AI provider not initialized');
    }

    const enhancedOptions = {
      useRAG: ragEnabledRef.current && state.vectorDBAvailable,
      collection: defaultCollection,
      ...options,
    };

    if (providerRef.current instanceof EnhancedAIProvider) {
      return providerRef.current.generateStreamingContent(prompt, enhancedOptions);
    } else {
      // Fallback for legacy provider
      const content = await providerRef.current.generateContent(prompt, options);
      options.onComplete?.(content);
      return content;
    }
  }, [state.vectorDBAvailable, defaultCollection]);

  // Educational content generation methods
  const generateLessonPlan = useCallback(async (
    params: {
      subject: string;
      grade: string;
      topic: string;
      duration: string;
    },
    options: EnhancedGenerationOptions = {}
  ): Promise<GenerationResult> => {
    if (!(providerRef.current instanceof EnhancedAIProvider)) {
      throw new Error('Enhanced AI provider required for lesson plan generation');
    }

    return providerRef.current.generateEducationalContent('lesson-plan', params, {
      useRAG: ragEnabledRef.current && state.vectorDBAvailable,
      collection: 'lesson_plans',
      ...options,
    });
  }, [state.vectorDBAvailable]);

  const generateQuiz = useCallback(async (
    params: {
      topic: string;
      difficulty: string;
      questionCount: number;
      questionTypes?: string[];
    },
    options: EnhancedGenerationOptions = {}
  ): Promise<GenerationResult> => {
    if (!(providerRef.current instanceof EnhancedAIProvider)) {
      throw new Error('Enhanced AI provider required for quiz generation');
    }

    return providerRef.current.generateEducationalContent('quiz', params, {
      useRAG: ragEnabledRef.current && state.vectorDBAvailable,
      collection: 'assessments',
      ...options,
    });
  }, [state.vectorDBAvailable]);

  const generateAssessment = useCallback(async (
    params: {
      assignmentType: string;
      subject: string;
      grade: string;
      criteria: string[];
    },
    options: EnhancedGenerationOptions = {}
  ): Promise<GenerationResult> => {
    if (!(providerRef.current instanceof EnhancedAIProvider)) {
      throw new Error('Enhanced AI provider required for assessment generation');
    }

    return providerRef.current.generateEducationalContent('assessment', params, {
      useRAG: ragEnabledRef.current && state.vectorDBAvailable,
      collection: 'assessments',
      ...options,
    });
  }, [state.vectorDBAvailable]);

  // Vector database methods
  const searchContent = useCallback(async (
    query: string,
    collection = defaultCollection
  ) => {
    if (!(providerRef.current instanceof EnhancedAIProvider)) {
      throw new Error('Enhanced AI provider required for content search');
    }

    return providerRef.current.searchContent(query, collection);
  }, [defaultCollection]);

  const uploadContent = useCallback(async (
    file: File,
    metadata: any = {}
  ) => {
    if (!(providerRef.current instanceof EnhancedAIProvider)) {
      throw new Error('Enhanced AI provider required for content upload');
    }

    return providerRef.current.uploadContent(file, metadata);
  }, []);

  // Initialize on mount
  useEffect(() => {
    if (autoConnect) {
      initializeProvider();
    }
  }, [autoConnect, initializeProvider]);

  // Periodic health checks
  useEffect(() => {
    if (!state.isConnected || !state.isEnhanced) return;

    const interval = setInterval(refreshHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [state.isConnected, state.isEnhanced, refreshHealth]);

  return {
    state,
    generateContent,
    generateStreaming,
    generateLessonPlan,
    generateQuiz,
    generateAssessment,
    searchContent,
    uploadContent,
    checkConnection,
    refreshHealth,
    toggleRAG,
  };
};

export default useEnhancedAI;
