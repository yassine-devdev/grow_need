
import React, { useState, useRef, useEffect } from 'react';
import { useOllamaAI, Message as OllamaMessage } from '../../../../hooks/useOllamaAI';
import { Icons } from '../../../icons';
import './AIStudyAssistant.css';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const UserAvatar: React.FC = () => <div className="study-assistant-avatar user"><Icons.User size={20} /></div>;
const AiAvatar: React.FC = () => <div className="study-assistant-avatar ai"><Icons.AIHelper size={20} /></div>;

const ChatMessage: React.FC<{ message: Message }> = React.memo(({ message }) => {
  const isUser = message.role === 'user';
  return (
    <div className={`study-assistant-message ${isUser ? 'user' : 'ai'}`}>
      {isUser ? <UserAvatar /> : <AiAvatar />}
      <div className="study-assistant-message-content">
        {message.text.split('**').map((part, index) => 
          index % 2 === 1 ? <strong key={index}>{part}</strong> : part
        )}
      </div>
    </div>
  );
});

const AIStudyAssistant: React.FC = () => {
  const {
    messages: ollamaMessages,
    isLoading,
    error,
    isConnected,
    sendMessage: ollamaSendMessage,
    initializeWithSystemPrompt
  } = useOllamaAI({ model: 'qwen2.5:3b-instruct' });

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messageListRef = useRef<HTMLDivElement>(null);

  // System instruction for the study assistant
  const systemInstruction = "You are Aura, an AI study assistant for K-12 students. Your purpose is to help students learn by guiding them, not by giving them the answers directly. Use the Socratic method. Ask leading questions. Explain concepts simply. Break down complex problems. Be encouraging and patient. Never just give the final answer to a homework problem. Format your responses clearly with bullet points or numbered steps when helpful.";

  // Initialize the chat with system prompt
  useEffect(() => {
    if (isConnected) {
      const initialMessage = "Hello! I am Aura, your AI Study Assistant. What subject can I help you with today?";
      initializeWithSystemPrompt(systemInstruction, initialMessage);
      setMessages([{ role: 'model', text: initialMessage }]);
    } else {
      setMessages([{
        role: 'model',
        text: 'Error: Could not connect to AI Assistant. Please make sure Ollama is running and try again.'
      }]);
    }
  }, [isConnected, initializeWithSystemPrompt]);

  // Convert Ollama messages to Study Assistant format
  useEffect(() => {
    const studyMessages: Message[] = [];

    ollamaMessages.forEach(msg => {
      if (msg.role === 'user') {
        studyMessages.push({ role: 'user', text: msg.content });
      } else if (msg.role === 'assistant') {
        studyMessages.push({ role: 'model', text: msg.content });
      }
      // Skip system messages in the UI
    });

    setMessages(studyMessages);
  }, [ollamaMessages]);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !isConnected) return;

    setInput('');

    try {
      await ollamaSendMessage(input, systemInstruction);
    } catch (err) {
      console.error("AI Study Assistant error:", err);
      const errorMessage = "I seem to be having trouble connecting. Please check your Ollama connection and try again in a moment.";
      setMessages(prev => [...prev, { role: 'model', text: errorMessage }]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="study-assistant-container">
      <div className="study-assistant-header">
        <div className="study-assistant-title">
          <Icons.AIHelper size={24} />
          <h3>Aura Study Assistant</h3>
        </div>
        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          <span className="status-dot"></span>
          <span className="status-text">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
      <div className="study-assistant-message-list" ref={messageListRef}>
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
        {isLoading && (
            <div className="study-assistant-message ai">
                <AiAvatar />
                <div className="study-assistant-message-content thinking">
                    <span></span><span></span><span></span>
                </div>
            </div>
        )}
      </div>
      <div className="study-assistant-input-area">
        <form onSubmit={handleSubmit} className="study-assistant-form">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about any subject..."
            className="study-assistant-textarea"
            rows={1}
            disabled={isLoading || !isConnected}
          />
          <button type="submit" className="study-assistant-send-button" disabled={isLoading || !input.trim() || !isConnected}>
            <Icons.Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIStudyAssistant;
