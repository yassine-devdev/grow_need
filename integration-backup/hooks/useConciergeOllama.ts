import { useState, useCallback, useEffect } from 'react';
import { useOllamaAI, Message } from './useOllamaAI';

export interface ConciergeMessage {
  role: 'user' | 'model';
  text: string;
}

export const useConciergeOllama = (model: string = 'qwen2.5:3b-instruct') => {
  const {
    messages: ollamaMessages,
    isLoading,
    error,
    isConnected,
    sendMessage: ollamaSendMessage,
    initializeWithSystemPrompt,
    currentModel
  } = useOllamaAI({ model });

  const [messages, setMessages] = useState<ConciergeMessage[]>([]);

  // System prompt for Aura Concierge
  const systemInstruction = "You are Aura Concierge, a personal AI assistant for a school management platform. Be helpful, friendly, and slightly futuristic. Your goal is to assist users in managing their educational tasks and information within this application. Keep your responses concise and clear. You can help with school administration, teaching tasks, student support, and general educational guidance.";

  // Initialize the chat with system prompt
  useEffect(() => {
    if (isConnected) {
      const initialMessage = "Hello! I am Aura Concierge, your personal AI assistant. How can I help you today?";
      initializeWithSystemPrompt(systemInstruction, initialMessage);
      setMessages([{ role: 'model', text: initialMessage }]);
    } else {
      setMessages([{ 
        role: 'model', 
        text: 'Sorry, I couldn\'t connect to the AI service. Please make sure Ollama is running and try again.' 
      }]);
    }
  }, [isConnected, initializeWithSystemPrompt]);

  // Convert Ollama messages to Concierge format
  useEffect(() => {
    const conciergeMessages: ConciergeMessage[] = [];
    
    ollamaMessages.forEach(msg => {
      if (msg.role === 'user') {
        conciergeMessages.push({ role: 'user', text: msg.content });
      } else if (msg.role === 'assistant') {
        conciergeMessages.push({ role: 'model', text: msg.content });
      }
      // Skip system messages in the UI
    });

    setMessages(conciergeMessages);
  }, [ollamaMessages]);

  const sendMessage = useCallback(async (prompt: string) => {
    if (!prompt || isLoading || !isConnected) return;

    try {
      await ollamaSendMessage(prompt, systemInstruction);
    } catch (err) {
      console.error('Concierge message error:', err);
    }
  }, [ollamaSendMessage, isLoading, isConnected, systemInstruction]);

  const sendMessageStream = useCallback(async (prompt: string, onChunk?: (chunk: string) => void) => {
    // For now, we'll use the regular sendMessage and simulate streaming
    // In the future, we can implement actual streaming with Ollama's streaming API
    if (!prompt || isLoading || !isConnected) return;

    try {
      const response = await ollamaSendMessage(prompt, systemInstruction);
      
      // Simulate streaming by sending chunks
      if (onChunk && response) {
        const words = response.split(' ');
        for (let i = 0; i < words.length; i++) {
          setTimeout(() => {
            onChunk(words.slice(0, i + 1).join(' '));
          }, i * 50); // 50ms delay between words
        }
      }
      
      return response;
    } catch (err) {
      console.error('Concierge stream error:', err);
      throw err;
    }
  }, [ollamaSendMessage, isLoading, isConnected, systemInstruction]);

  return {
    messages,
    isLoading,
    error,
    isConnected,
    sendMessage,
    sendMessageStream,
    currentModel,
    connectionStatus: isConnected ? 'connected' : 'disconnected'
  };
};
