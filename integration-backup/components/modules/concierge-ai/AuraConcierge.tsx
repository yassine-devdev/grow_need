
import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../../icons';
import { useConciergeOllama } from '../../../hooks/useConciergeOllama';
import './AuraConcierge.css';

// Type for messages compatible with both providers
interface Message {
  role: 'user' | 'model';
  text: string;
}

const UserAvatar: React.FC = () => <div className="chat-message-avatar user-avatar"><Icons.User size={20} /></div>;
const AiAvatar: React.FC = () => <div className="chat-message-avatar ai-avatar"><Icons.ConciergeAI size={20} /></div>;

const ChatMessage: React.FC<{ message: Message }> = React.memo(({ message }) => {
  const isUser = message.role === 'user';
  return (
    <div className={`chat-message ${isUser ? 'user-message' : 'assistant-message'}`}>
      {isUser ? <UserAvatar /> : <AiAvatar />}
      <div className="chat-message-content">
        {message.text}
      </div>
    </div>
  );
});

const AuraConcierge: React.FC = () => {
  const { messages, isLoading, sendMessage, isConnected, currentModel } = useConciergeOllama();
  const [input, setInput] = useState('');
  const messageListRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Scroll to the bottom of the message list whenever messages change
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages, isLoading]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input.trim());
      setInput('');
      if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="aura-concierge-container">
        <div className="chat-header">
          <div className="chat-header-info">
            <Icons.ConciergeAI size={24} />
            <div>
              <h3>Aura Concierge</h3>
              <p>Your AI Assistant</p>
            </div>
          </div>
          <div className="chat-status">
            <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
              <span className="status-dot"></span>
              <span className="status-text">
                {isConnected ? `Connected (${currentModel})` : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
        <div ref={messageListRef} className="message-list">
          {messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}
           {isLoading && messages[messages.length-1]?.text === '' && (
            <div className="chat-message assistant-message">
                <AiAvatar />
                <div className="chat-message-content typing-indicator">
                    <span></span><span></span><span></span>
                </div>
            </div>
        )}
        </div>
        <div className="chat-input-area">
          <form onSubmit={handleSubmit} className="chat-input-form">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask Aura Concierge anything..."
              className="chat-textarea"
              rows={1}
              disabled={isLoading}
            />
            <button type="submit" className="chat-send-button" disabled={isLoading || !input.trim()}>
              <Icons.Send size={20} />
            </button>
          </form>
        </div>
    </div>
  );
};

export default AuraConcierge;
