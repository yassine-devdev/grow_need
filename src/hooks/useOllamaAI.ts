import { useState, useCallback, useRef, useEffect } from 'react';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

export interface OllamaConfig {
  model: string;
  baseUrl?: string;
  temperature?: number;
  max_tokens?: number;
}

export const useOllamaAI = (config: OllamaConfig = { model: 'qwen2.5:3b-instruct' }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const baseUrl = config.baseUrl || 'http://localhost:11434';
  const model = config.model;

  // Test Ollama connection
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/tags`);
        if (response.ok) {
          setIsConnected(true);
          setError(null);
        } else {
          throw new Error('Ollama server not responding');
        }
      } catch (err) {
        setIsConnected(false);
        setError(new Error('Cannot connect to Ollama. Make sure Ollama is running.'));
        console.error('Ollama connection test failed:', err);
      }
    };

    testConnection();
  }, [baseUrl]);

  const sendMessage = useCallback(async (prompt: string, systemPrompt?: string) => {
    if (!prompt || isLoading || !isConnected) return;

    setIsLoading(true);
    setError(null);

    // Add user message immediately
    const userMessage: Message = { role: 'user', content: prompt };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Prepare messages for Ollama
      const messagesToSend: Message[] = [];
      
      // Add system prompt if provided
      if (systemPrompt) {
        messagesToSend.push({ role: 'system', content: systemPrompt });
      }
      
      // Add conversation history
      messagesToSend.push(...messages, userMessage);

      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: messagesToSend,
          stream: false,
          options: {
            temperature: config.temperature || 0.7,
            num_predict: config.max_tokens || 2048,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data: OllamaResponse = await response.json();
      
      // Add AI response
      const aiMessage: Message = {
        role: 'assistant',
        content: data.message.content
      };
      
      setMessages(prev => [...prev, aiMessage]);
      return data.message.content;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Ollama API error:', err);
      setError(new Error(errorMessage));
      
      // Add error message to chat
      const errorMsg: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isConnected, messages, model, baseUrl, config.temperature, config.max_tokens]);

  const generateContent = useCallback(async (prompt: string, systemPrompt?: string) => {
    if (!prompt || !isConnected) {
      throw new Error('Cannot generate content: not connected to Ollama');
    }

    try {
      const messagesToSend: Message[] = [];
      
      if (systemPrompt) {
        messagesToSend.push({ role: 'system', content: systemPrompt });
      }
      
      messagesToSend.push({ role: 'user', content: prompt });

      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: messagesToSend,
          stream: false,
          options: {
            temperature: config.temperature || 0.7,
            num_predict: config.max_tokens || 2048,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data: OllamaResponse = await response.json();
      return {
        text: data.message.content,
        model: data.model
      };

    } catch (err) {
      console.error('Ollama generateContent error:', err);
      throw err;
    }
  }, [isConnected, model, baseUrl, config.temperature, config.max_tokens]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const initializeWithSystemPrompt = useCallback((systemPrompt: string, initialMessage?: string) => {
    const messages: Message[] = [];
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    
    if (initialMessage) {
      messages.push({ role: 'assistant', content: initialMessage });
    }
    
    setMessages(messages);
  }, []);

  return {
    messages,
    isLoading,
    error,
    isConnected,
    sendMessage,
    generateContent,
    clearMessages,
    initializeWithSystemPrompt,
    currentModel: model,
    availableModels: [
      'qwen2.5:3b-instruct',
      'gemma3:4b', 
      'llama2:latest',
      'nemotron-mini:4b',
      'exaone-deep:2.4b',
      'deepseek-coder:1.3b-instruct',
      'qwen2.5-coder:3b-base',
      'TwinkleAI/Llama-3.2-3B-F1-Resoning-Instruct:latest'
    ]
  };
};
