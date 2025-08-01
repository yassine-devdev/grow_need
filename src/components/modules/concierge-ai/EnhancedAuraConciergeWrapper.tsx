/**
 * Enhanced Aura Concierge Wrapper
 * Provides backward compatibility while enabling enhanced AI features
 */

import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../../icons';
import { useConciergeOllama } from '../../../hooks/useConciergeOllama';
import { useAIProvider, useAIFeatures } from '../../common/AIProviderWrapper';
import { useEnhancedAI } from '../../../hooks/useEnhancedAIIntegration';
import './AuraConcierge.css';

// Type for messages compatible with both providers
interface Message {
  role: 'user' | 'model';
  text: string;
  sources?: Array<{
    content: string;
    metadata: any;
    relevance: number;
  }>;
  metadata?: {
    usedRAG: boolean;
    responseTime: number;
    sourcesUsed: number;
  };
}

const UserAvatar: React.FC = () => <div className="chat-message-avatar user-avatar"><Icons.User size={20} /></div>;
const AiAvatar: React.FC = () => <div className="chat-message-avatar ai-avatar"><Icons.ConciergeAI size={20} /></div>;

const ChatMessage: React.FC<{ message: Message }> = React.memo(({ message }) => {
  const isUser = message.role === 'user';
  const [showSources, setShowSources] = useState(false);
  
  return (
    <div className={`chat-message ${isUser ? 'user-message' : 'assistant-message'}`}>
      {isUser ? <UserAvatar /> : <AiAvatar />}
      <div className="chat-message-content">
        {message.text}
        
        {/* Enhanced features: Show RAG metadata and sources */}
        {!isUser && message.metadata && (
          <div className="message-metadata" style={{ 
            fontSize: '0.75rem', 
            color: '#666', 
            marginTop: '8px',
            padding: '4px 8px',
            background: 'rgba(0,0,0,0.05)',
            borderRadius: '4px'
          }}>
            {message.metadata.usedRAG && (
              <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                🧠 RAG Enhanced
              </span>
            )}
            <span style={{ marginLeft: '8px' }}>
              ⏱️ {message.metadata.responseTime}ms
            </span>
            {message.metadata.sourcesUsed > 0 && (
              <button
                onClick={() => setShowSources(!showSources)}
                style={{
                  marginLeft: '8px',
                  background: 'none',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  fontSize: '0.7rem',
                  cursor: 'pointer'
                }}
              >
                📚 {message.metadata.sourcesUsed} sources
              </button>
            )}
          </div>
        )}
        
        {/* Show sources if expanded */}
        {!isUser && showSources && message.sources && (
          <div className="message-sources" style={{
            marginTop: '8px',
            padding: '8px',
            background: 'rgba(102, 126, 234, 0.1)',
            borderRadius: '6px',
            fontSize: '0.8rem'
          }}>
            <strong>Sources used:</strong>
            {message.sources.map((source, index) => (
              <div key={index} style={{ 
                marginTop: '4px', 
                padding: '4px',
                background: 'rgba(255,255,255,0.7)',
                borderRadius: '4px'
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>
                  Source {index + 1} (Relevance: {(source.relevance * 100).toFixed(1)}%)
                </div>
                <div style={{ marginTop: '2px' }}>
                  {source.content.substring(0, 200)}...
                </div>
                {source.metadata && (
                  <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '2px' }}>
                    {source.metadata.title && `Title: ${source.metadata.title}`}
                    {source.metadata.subject && ` | Subject: ${source.metadata.subject}`}
                    {source.metadata.grade_level && ` | Grade: ${source.metadata.grade_level}`}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

const EnhancedAuraConciergeWrapper: React.FC = () => {
  const { isEnhanced, isConnected } = useAIProvider();
  const features = useAIFeatures();
  
  // Use enhanced AI if available, fallback to legacy
  const enhancedAI = useEnhancedAI({ autoConnect: true });
  const legacyAI = useConciergeOllama();
  
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Determine which AI system to use
  const useEnhancedFeatures = isEnhanced && features.available.enhancedAI;
  
  // Use appropriate messages based on AI system
  const displayMessages = useEnhancedFeatures ? messages : legacyAI.messages;
  const displayIsLoading = useEnhancedFeatures ? isLoading : legacyAI.isLoading;
  const displayIsConnected = useEnhancedFeatures ? enhancedAI.state.isConnected : legacyAI.isConnected;

  useEffect(() => {
    // Scroll to the bottom of the message list whenever messages change
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [displayMessages, displayIsLoading]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || displayIsLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    if (useEnhancedFeatures) {
      // Use enhanced AI with RAG
      const newUserMessage: Message = { role: 'user', text: userMessage };
      setMessages(prev => [...prev, newUserMessage]);
      setIsLoading(true);

      try {
        const result = await enhancedAI.generateContent(userMessage, {
          useRAG: features.available.rag,
          collection: 'educational_content'
        });

        const aiMessage: Message = {
          role: 'model',
          text: result.content,
          sources: result.sources,
          metadata: result.metadata
        };

        setMessages(prev => [...prev, aiMessage]);
      } catch (error) {
        console.error('Enhanced AI generation failed:', error);
        const errorMessage: Message = {
          role: 'model',
          text: 'Sorry, I encountered an error while processing your request. Please try again.'
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Use legacy AI system
      legacyAI.sendMessage(userMessage);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="aura-concierge">
      <div className="concierge-header">
        <div className="concierge-title">
          <Icons.ConciergeAI size={24} />
          <span>Aura Concierge</span>
          {useEnhancedFeatures && (
            <span style={{ 
              fontSize: '0.7rem', 
              background: '#10b981', 
              color: 'white', 
              padding: '2px 6px', 
              borderRadius: '4px',
              marginLeft: '8px'
            }}>
              Enhanced
            </span>
          )}
        </div>
        <div className="concierge-status">
          <div className={`status-indicator ${displayIsConnected ? 'connected' : 'disconnected'}`}>
            {displayIsConnected ? 'Connected' : 'Disconnected'}
          </div>
          {useEnhancedFeatures && enhancedAI.state.vectorDBAvailable && (
            <div style={{ 
              fontSize: '0.7rem', 
              color: '#10b981',
              marginLeft: '8px'
            }}>
              🧠 RAG Ready
            </div>
          )}
        </div>
      </div>

      <div className="concierge-chat">
        <div className="chat-messages" ref={messageListRef}>
          {displayMessages.length === 0 && (
            <div className="welcome-message">
              <AiAvatar />
              <div className="chat-message-content">
                Hello! I'm Aura, your AI concierge. 
                {useEnhancedFeatures 
                  ? " I'm enhanced with access to your educational content and can provide context-aware responses!"
                  : " How can I help you today?"
                }
              </div>
            </div>
          )}
          
          {displayMessages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
          
          {displayIsLoading && (
            <div className="chat-message assistant-message">
              <AiAvatar />
              <div className="chat-message-content typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
        </div>

        <form className="chat-input-form" onSubmit={handleSubmit}>
          <div className="chat-input-container">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={useEnhancedFeatures 
                ? "Ask me anything about your educational content..." 
                : "Type your message..."
              }
              className="chat-input"
              rows={1}
              disabled={displayIsLoading}
            />
            <button 
              type="submit" 
              className="chat-send-button"
              disabled={!input.trim() || displayIsLoading}
            >
              <Icons.Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnhancedAuraConciergeWrapper;
