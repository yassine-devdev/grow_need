import React, { useState, useRef, useEffect } from 'react';
import { useEnhancedChat } from '../../../hooks/useEnhancedAI';
import { Icons } from '../../icons';
import './AuraConcierge.css';
import './EnhancedAuraConcierge.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

const EnhancedAuraConcierge: React.FC = () => {
  const {
    messages,
    isTyping,
    isConnected,
    sendMessage,
    clearMessages,
    stopStreaming,
    streamingState
  } = useEnhancedChat({
    taskType: 'general-chat',
    context: {
      studentLevel: 'mixed',
      subject: 'general',
      learningStyle: 'visual'
    },
    autoConnect: true
  });

  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages, streamingState.currentText]);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping || !isConnected) return;

    const userInput = input.trim();
    setInput('');
    await sendMessage(userInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = (message: Message, index: number) => {
    const isUser = message.role === 'user';
    const isLastAssistantMessage = !isUser && index === messages.length - 1;
    const displayContent = isLastAssistantMessage && streamingState.isStreaming 
      ? streamingState.currentText 
      : message.content;

    return (
      <div key={index} className={`message ${isUser ? 'user' : 'assistant'}`}>
        <div className="message-avatar">
          {isUser ? (
            <Icons.User size={20} />
          ) : (
            <Icons.ConciergeAI size={20} />
          )}
        </div>
        <div className="message-content">
          <div className="message-text">
            {displayContent}
            {isLastAssistantMessage && streamingState.isStreaming && (
              <span className="streaming-cursor">▊</span>
            )}
          </div>
          <div className="message-time">
            {formatTime(message.timestamp)}
            {isLastAssistantMessage && streamingState.isStreaming && (
              <span className="streaming-indicator">Typing...</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const quickActions = [
    { label: 'Create Lesson Plan', icon: Icons.BookOpen, prompt: 'Help me create a lesson plan for 5th grade math on fractions.' },
    { label: 'Generate Quiz', icon: Icons.ClipboardList, prompt: 'Create a quiz with 5 questions about the solar system for 3rd graders.' },
    { label: 'Grade Assignment', icon: Icons.CheckCircle, prompt: 'Help me create a rubric for grading a science project on plants.' },
    { label: 'Parent Communication', icon: Icons.MessageCircle, prompt: 'Help me write a positive note to parents about their child\'s progress.' }
  ];

  if (!isExpanded) {
    return (
      <div className="aura-concierge-minimized">
        <button 
          className="concierge-toggle-button"
          onClick={() => setIsExpanded(true)}
          title="Open Aura Concierge"
        >
          <Icons.ConciergeAI size={24} />
          <span className={`connection-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
        </button>
      </div>
    );
  }

  return (
    <div className="aura-concierge-container enhanced">
      <div className="concierge-header">
        <div className="header-info">
          <Icons.ConciergeAI size={28} />
          <div>
            <h3>Aura Concierge</h3>
            <p>Enhanced AI Assistant</p>
          </div>
        </div>
        <div className="header-controls">
          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            <span className="status-dot"></span>
            <span className="status-text">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <button 
            className="minimize-button"
            onClick={() => setIsExpanded(false)}
            title="Minimize"
          >
            <Icons.Minimize size={16} />
          </button>
        </div>
      </div>

      {messages.length === 0 && (
        <div className="welcome-section">
          <div className="welcome-message">
            <Icons.ConciergeAI size={48} />
            <h4>Hello! I'm Aura Concierge</h4>
            <p>Your enhanced AI assistant for education. I can help with lesson planning, grading, parent communication, and much more!</p>
          </div>
          
          <div className="quick-actions">
            <h5>Quick Actions:</h5>
            <div className="action-grid">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="quick-action-button"
                  onClick={() => {
                    setInput(action.prompt);
                    inputRef.current?.focus();
                  }}
                  disabled={!isConnected}
                >
                  <action.icon size={20} />
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="message-list" ref={messageListRef}>
        {messages.map((message, index) => renderMessage(message, index))}
        
        {isTyping && messages.length > 0 && (
          <div className="typing-indicator">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>

      <div className="input-section">
        {streamingState.isStreaming && (
          <div className="streaming-controls">
            <button 
              className="stop-button"
              onClick={stopStreaming}
              title="Stop generation"
            >
              <Icons.Square size={16} />
              Stop
            </button>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="input-form">
          <div className="input-container">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isConnected ? "Ask me anything about education..." : "Connecting to AI..."}
              disabled={!isConnected}
              className="message-input"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping || !isConnected}
              className="send-button"
              title="Send message"
            >
              {isTyping ? (
                <Icons.Loader size={20} className="spinning" />
              ) : (
                <Icons.Send size={20} />
              )}
            </button>
          </div>
        </form>

        {messages.length > 0 && (
          <div className="chat-controls">
            <button
              onClick={clearMessages}
              className="clear-button"
              title="Clear conversation"
            >
              <Icons.Trash size={16} />
              Clear Chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedAuraConcierge;
