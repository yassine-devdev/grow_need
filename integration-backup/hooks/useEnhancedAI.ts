import { useState, useCallback, useRef, useEffect } from 'react';
import { enhancedAI, StreamingOptions, EducationalContext } from '../services/enhancedAIService';

export interface UseEnhancedAIOptions {
  taskType?: string;
  context?: EducationalContext;
  autoConnect?: boolean;
}

export interface StreamingState {
  isStreaming: boolean;
  currentText: string;
  isComplete: boolean;
  error: Error | null;
}

export function useEnhancedAI(options: UseEnhancedAIOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [streamingState, setStreamingState] = useState<StreamingState>({
    isStreaming: false,
    currentText: '',
    isComplete: false,
    error: null
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Check connection on mount
  useEffect(() => {
    if (options.autoConnect !== false) {
      checkConnection();
      loadAvailableModels();
    }
  }, [options.autoConnect]);

  const checkConnection = useCallback(async () => {
    try {
      const connected = await enhancedAI.checkConnection();
      setIsConnected(connected);
      return connected;
    } catch (error) {
      setIsConnected(false);
      return false;
    }
  }, []);

  const loadAvailableModels = useCallback(async () => {
    try {
      const models = await enhancedAI.getAvailableModels();
      setAvailableModels(models);
    } catch (error) {
      console.error('Failed to load models:', error);
    }
  }, []);

  const generateStreamingContent = useCallback(async (
    prompt: string,
    customOptions: Partial<StreamingOptions & { 
      taskType?: string;
      context?: EducationalContext;
      systemPrompt?: string;
    }> = {}
  ): Promise<string> => {
    // Abort any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setStreamingState({
      isStreaming: true,
      currentText: '',
      isComplete: false,
      error: null
    });

    try {
      const streamingOptions: StreamingOptions = {
        onChunk: (chunk: string) => {
          setStreamingState(prev => ({
            ...prev,
            currentText: prev.currentText + chunk
          }));
          customOptions.onChunk?.(chunk);
        },
        onComplete: (fullText: string) => {
          setStreamingState(prev => ({
            ...prev,
            isStreaming: false,
            isComplete: true,
            currentText: fullText
          }));
          customOptions.onComplete?.(fullText);
        },
        onError: (error: Error) => {
          setStreamingState(prev => ({
            ...prev,
            isStreaming: false,
            error
          }));
          customOptions.onError?.(error);
        }
      };

      const result = await enhancedAI.generateStreamingContent(prompt, {
        ...streamingOptions,
        taskType: customOptions.taskType || options.taskType,
        context: customOptions.context || options.context,
        systemPrompt: customOptions.systemPrompt
      });

      return result;
    } catch (error) {
      const err = error as Error;
      setStreamingState(prev => ({
        ...prev,
        isStreaming: false,
        error: err
      }));
      throw err;
    }
  }, [options.taskType, options.context]);

  const generateStructuredContent = useCallback(async <T>(
    prompt: string,
    schema: any,
    customOptions: {
      taskType?: string;
      context?: EducationalContext;
      systemPrompt?: string;
    } = {}
  ): Promise<T> => {
    try {
      const result = await enhancedAI.generateStructuredContent(prompt, schema, {
        taskType: customOptions.taskType || options.taskType,
        context: customOptions.context || options.context,
        systemPrompt: customOptions.systemPrompt
      });
      return result;
    } catch (error) {
      console.error('Structured content generation failed:', error);
      throw error;
    }
  }, [options.taskType, options.context]);

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setStreamingState(prev => ({
        ...prev,
        isStreaming: false
      }));
    }
  }, []);

  const resetStreaming = useCallback(() => {
    setStreamingState({
      isStreaming: false,
      currentText: '',
      isComplete: false,
      error: null
    });
  }, []);

  // Educational-specific methods
  const generateLessonPlan = useCallback(async (
    subject: string,
    grade: string,
    topic: string,
    duration: string
  ) => {
    return await enhancedAI.generateInteractiveLessonPlan(subject, grade, topic, duration);
  }, []);

  const generateQuiz = useCallback(async (
    topic: string,
    difficulty: string,
    questionCount: number,
    questionTypes: string[] = ['multiple-choice', 'true-false', 'short-answer']
  ) => {
    return await enhancedAI.generateInteractiveQuiz(topic, difficulty, questionCount, questionTypes);
  }, []);

  const generateTutoring = useCallback(async (
    question: string,
    studentLevel: string,
    subject: string,
    learningStyle: string,
    streamingOptions: StreamingOptions = {}
  ) => {
    return await enhancedAI.generatePersonalizedTutoring(
      question,
      studentLevel,
      subject,
      learningStyle,
      streamingOptions
    );
  }, []);

  const generateRubric = useCallback(async (
    assignmentType: string,
    subject: string,
    grade: string,
    criteria: string[]
  ) => {
    return await enhancedAI.generateAssessmentRubric(assignmentType, subject, grade, criteria);
  }, []);

  const generateParentReport = useCallback(async (
    studentName: string,
    subject: string,
    period: string,
    achievements: string[],
    challenges: string[],
    streamingOptions: StreamingOptions = {}
  ) => {
    return await enhancedAI.generateParentReport(
      studentName,
      subject,
      period,
      achievements,
      challenges,
      streamingOptions
    );
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // Connection state
    isConnected,
    availableModels,
    checkConnection,
    loadAvailableModels,

    // Streaming state
    streamingState,
    isStreaming: streamingState.isStreaming,
    currentText: streamingState.currentText,
    isComplete: streamingState.isComplete,
    error: streamingState.error,

    // Core methods
    generateStreamingContent,
    generateStructuredContent,
    stopStreaming,
    resetStreaming,

    // Educational methods
    generateLessonPlan,
    generateQuiz,
    generateTutoring,
    generateRubric,
    generateParentReport,
  };
}

// Specialized hook for chat interfaces
export function useEnhancedChat(options: UseEnhancedAIOptions = {}) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const {
    isConnected,
    generateStreamingContent,
    streamingState,
    stopStreaming,
    resetStreaming
  } = useEnhancedAI(options);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage = { role: 'user' as const, content, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    resetStreaming();

    try {
      let assistantContent = '';
      
      await generateStreamingContent(content, {
        onChunk: (chunk: string) => {
          assistantContent += chunk;
          // Update the last message if it's from assistant, or add new one
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
              return [
                ...prev.slice(0, -1),
                { ...lastMessage, content: assistantContent }
              ];
            } else {
              return [
                ...prev,
                { role: 'assistant', content: assistantContent, timestamp: new Date() }
              ];
            }
          });
        },
        onComplete: () => {
          setIsTyping(false);
        },
        onError: (error) => {
          setIsTyping(false);
          console.error('Chat error:', error);
        }
      });
    } catch (error) {
      setIsTyping(false);
      const errorMessage = { 
        role: 'assistant' as const, 
        content: 'Sorry, I encountered an error. Please try again.', 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  }, [generateStreamingContent, resetStreaming]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    resetStreaming();
  }, [resetStreaming]);

  return {
    messages,
    isTyping,
    isConnected,
    sendMessage,
    clearMessages,
    stopStreaming,
    streamingState
  };
}
