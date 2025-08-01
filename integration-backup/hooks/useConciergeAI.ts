import { useState, useCallback, useEffect } from 'react';
import { useOllamaAI, Message as OllamaMessage } from './useOllamaAI';

export interface Message {
  role: 'user' | 'model';
  text: string;
}

export const useConciergeAI = () => {
  const {
    messages: ollamaMessages,
    isLoading,
    error,
    isConnected,
    sendMessage: ollamaSendMessage,
    initializeWithSystemPrompt,
    currentModel
  } = useOllamaAI({ model: 'qwen2.5:3b-instruct' });

  const [messages, setMessages] = useState<Message[]>([]);

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
    const conciergeMessages: Message[] = [];
    
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

  return {
    messages,
    isLoading,
    error,
    isConnected,
    sendMessage,
    currentModel,
    connectionStatus: isConnected ? 'connected' : 'disconnected'
  };
};
