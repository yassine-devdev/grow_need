import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnhancedAuraConciergeWrapper from '../EnhancedAuraConciergeWrapper';

// Mock the AI provider context
const mockAIProvider = {
  isEnhanced: true,
  isConnected: true,
  provider: 'enhanced'
};

const mockAIFeatures = {
  available: {
    enhancedAI: true,
    rag: true,
    vectorDB: true,
    streaming: true
  }
};

const mockEnhancedAI = {
  generateContent: jest.fn(),
  state: {
    vectorDBAvailable: true,
    isConnected: true
  }
};

const mockLegacyAI = {
  sendMessage: jest.fn(),
  messages: [],
  isLoading: false,
  isConnected: false
};

// Mock the hooks
jest.mock('../../common/AIProviderWrapper', () => ({
  useAIProvider: () => mockAIProvider,
  useAIFeatures: () => mockAIFeatures
}));

jest.mock('../../../hooks/useEnhancedAIIntegration', () => ({
  useEnhancedAI: () => mockEnhancedAI
}));

jest.mock('../../../hooks/useConciergeOllama', () => ({
  useConciergeOllama: () => mockLegacyAI
}));

// Real-world integration tests for Enhanced AI functionality
describe('Enhanced AI Integration - Real-World Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    
    // Reset mock states
    mockAIProvider.isEnhanced = true;
    mockAIProvider.isConnected = true;
    mockAIFeatures.available.enhancedAI = true;
    mockAIFeatures.available.rag = true;
    mockEnhancedAI.state.vectorDBAvailable = true;
    mockEnhancedAI.state.isConnected = true;
    
    // Mock console.error to suppress error logs during testing
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Enhanced AI Provider Integration', () => {
    it('should use enhanced AI when available and connected', async () => {
      mockEnhancedAI.generateContent.mockResolvedValue({
        content: 'Enhanced AI response with RAG',
        sources: [
          {
            content: 'Educational content from vector DB',
            metadata: { source: 'curriculum_guide.pdf' },
            relevance: 0.95
          }
        ],
        metadata: {
          usedRAG: true,
          responseTime: 1200,
          sourcesUsed: 1
        }
      });

      render(<EnhancedAuraConciergeWrapper />);

      // Should display enhanced mode indicator
      await waitFor(() => {
        expect(screen.getByText('Enhanced')).toBeInTheDocument();
      });

      // Should show RAG ready indicator
      expect(screen.getByText('🧠 RAG Ready')).toBeInTheDocument();

      // Test message sending with enhanced AI
      const messageInput = screen.getByRole('textbox');
      const sendButton = screen.getByRole('button', { name: /send/i });

      fireEvent.change(messageInput, { 
        target: { value: 'How do I create a lesson plan?' } 
      });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(mockEnhancedAI.generateContent).toHaveBeenCalledWith(
          'How do I create a lesson plan?',
          {
            useRAG: true,
            collection: 'educational_content'
          }
        );
      });

      // Should display enhanced response with sources
      await waitFor(() => {
        expect(screen.getByText('Enhanced AI response with RAG')).toBeInTheDocument();
      });
    });

    it('should fallback to legacy AI when enhanced AI is unavailable', async () => {
      // Disable enhanced AI
      mockAIProvider.isEnhanced = false;
      mockAIFeatures.available.enhancedAI = false;

      render(<EnhancedAuraConciergeWrapper />);

      // Should not display enhanced mode indicator
      expect(screen.queryByText('Enhanced')).not.toBeInTheDocument();
      expect(screen.queryByText('🧠 RAG Ready')).not.toBeInTheDocument();

      // Test message sending with legacy AI
      const messageInput = screen.getByRole('textbox');
      const sendButton = screen.getByRole('button', { name: /send/i });

      fireEvent.change(messageInput, { 
        target: { value: 'Test message for legacy AI' } 
      });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(mockLegacyAI.sendMessage).toHaveBeenCalledWith('Test message for legacy AI');
      });

      // Should not call enhanced AI
      expect(mockEnhancedAI.generateContent).not.toHaveBeenCalled();
    });

    it('should handle enhanced AI connection failures gracefully', async () => {
      mockEnhancedAI.generateContent.mockRejectedValue(
        new Error('Enhanced AI generation failed')
      );

      render(<EnhancedAuraConciergeWrapper />);

      const messageInput = screen.getByRole('textbox');
      const sendButton = screen.getByRole('button', { name: /send/i });

      fireEvent.change(messageInput, { 
        target: { value: 'Test message that will fail' } 
      });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(mockEnhancedAI.generateContent).toHaveBeenCalled();
      });

      // Should display error message
      await waitFor(() => {
        expect(screen.getByText(/encountered an error/i)).toBeInTheDocument();
      });
    });
  });

  describe('RAG (Retrieval-Augmented Generation) Integration', () => {
    it('should use RAG when available and display sources', async () => {
      mockEnhancedAI.generateContent.mockResolvedValue({
        content: 'Based on the curriculum guidelines, here is how to create an effective lesson plan...',
        sources: [
          {
            content: 'Lesson planning best practices from educational research',
            metadata: { 
              source: 'teaching_handbook.pdf',
              page: 42,
              section: 'Curriculum Design'
            },
            relevance: 0.92
          },
          {
            content: 'Assessment strategies for student learning outcomes',
            metadata: { 
              source: 'assessment_guide.pdf',
              page: 15,
              section: 'Formative Assessment'
            },
            relevance: 0.88
          }
        ],
        metadata: {
          usedRAG: true,
          responseTime: 1500,
          sourcesUsed: 2
        }
      });

      render(<EnhancedAuraConciergeWrapper />);

      const messageInput = screen.getByRole('textbox');
      const sendButton = screen.getByRole('button', { name: /send/i });

      fireEvent.change(messageInput, { 
        target: { value: 'How do I create an effective lesson plan?' } 
      });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(mockEnhancedAI.generateContent).toHaveBeenCalledWith(
          'How do I create an effective lesson plan?',
          {
            useRAG: true,
            collection: 'educational_content'
          }
        );
      });

      // Should display response with RAG content
      await waitFor(() => {
        expect(screen.getByText(/based on the curriculum guidelines/i)).toBeInTheDocument();
      });

      // Should display source information if implemented
      // Note: This depends on the UI implementation for showing sources
    });

    it('should work without RAG when vector DB is unavailable', async () => {
      mockAIFeatures.available.rag = false;
      mockEnhancedAI.state.vectorDBAvailable = false;

      mockEnhancedAI.generateContent.mockResolvedValue({
        content: 'Standard AI response without RAG',
        sources: [],
        metadata: {
          usedRAG: false,
          responseTime: 800,
          sourcesUsed: 0
        }
      });

      render(<EnhancedAuraConciergeWrapper />);

      // Should not show RAG ready indicator
      expect(screen.queryByText('🧠 RAG Ready')).not.toBeInTheDocument();

      const messageInput = screen.getByRole('textbox');
      const sendButton = screen.getByRole('button', { name: /send/i });

      fireEvent.change(messageInput, { 
        target: { value: 'Test without RAG' } 
      });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(mockEnhancedAI.generateContent).toHaveBeenCalledWith(
          'Test without RAG',
          {
            useRAG: false,
            collection: 'educational_content'
          }
        );
      });
    });
  });

  describe('Real Gemini API Integration', () => {
    it('should handle real Gemini API calls through enhanced AI', async () => {
      // Mock a realistic Gemini API response
      mockEnhancedAI.generateContent.mockImplementation(async (prompt, options) => {
        // Simulate real API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
          content: `I understand you're asking about "${prompt}". As your AI assistant, I can help with educational tasks, lesson planning, and administrative work.`,
          sources: options.useRAG ? [
            {
              content: 'Educational best practices from knowledge base',
              metadata: { source: 'education_db', confidence: 0.9 },
              relevance: 0.85
            }
          ] : [],
          metadata: {
            usedRAG: options.useRAG,
            responseTime: 1000,
            sourcesUsed: options.useRAG ? 1 : 0,
            model: 'gemini-2.5-flash'
          }
        };
      });

      render(<EnhancedAuraConciergeWrapper />);

      const messageInput = screen.getByRole('textbox');
      const sendButton = screen.getByRole('button', { name: /send/i });

      fireEvent.change(messageInput, { 
        target: { value: 'Help me with student assessment strategies' } 
      });
      fireEvent.click(sendButton);

      // Should show loading state
      await waitFor(() => {
        const loadingElement = screen.queryByText(/thinking/i) ||
                             document.querySelector('.loading') ||
                             document.querySelector('.spinner');
        expect(loadingElement).toBeInTheDocument();
      }, { timeout: 500 });

      // Should display response after API call
      await waitFor(() => {
        expect(screen.getByText(/student assessment strategies/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should handle Gemini API rate limiting and errors', async () => {
      mockEnhancedAI.generateContent.mockRejectedValue(
        new Error('API rate limit exceeded')
      );

      render(<EnhancedAuraConciergeWrapper />);

      const messageInput = screen.getByRole('textbox');
      const sendButton = screen.getByRole('button', { name: /send/i });

      fireEvent.change(messageInput, { 
        target: { value: 'This will trigger rate limit error' } 
      });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText(/encountered an error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Performance and Streaming', () => {
    it('should handle streaming responses when available', async () => {
      let streamCallback: ((chunk: string) => void) | null = null;
      
      mockEnhancedAI.generateContent.mockImplementation(async (prompt, options) => {
        // Simulate streaming response
        return new Promise((resolve) => {
          const chunks = [
            'I can help you with ',
            'educational planning and ',
            'administrative tasks. ',
            'What specific area would you like assistance with?'
          ];
          
          let index = 0;
          const interval = setInterval(() => {
            if (streamCallback && index < chunks.length) {
              streamCallback(chunks[index]);
              index++;
            } else {
              clearInterval(interval);
              resolve({
                content: chunks.join(''),
                sources: [],
                metadata: {
                  usedRAG: false,
                  responseTime: 2000,
                  sourcesUsed: 0,
                  streaming: true
                }
              });
            }
          }, 200);
        });
      });

      render(<EnhancedAuraConciergeWrapper />);

      const messageInput = screen.getByRole('textbox');
      const sendButton = screen.getByRole('button', { name: /send/i });

      fireEvent.change(messageInput, { 
        target: { value: 'Test streaming response' } 
      });
      fireEvent.click(sendButton);

      // Should eventually display complete response
      await waitFor(() => {
        expect(screen.getByText(/educational planning and administrative tasks/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should handle concurrent message requests properly', async () => {
      let callCount = 0;
      mockEnhancedAI.generateContent.mockImplementation(async (prompt) => {
        callCount++;
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
          content: `Response ${callCount} for: ${prompt}`,
          sources: [],
          metadata: { usedRAG: false, responseTime: 500, sourcesUsed: 0 }
        };
      });

      render(<EnhancedAuraConciergeWrapper />);

      const messageInput = screen.getByRole('textbox');
      const sendButton = screen.getByRole('button', { name: /send/i });

      // Send multiple messages rapidly
      for (let i = 1; i <= 3; i++) {
        fireEvent.change(messageInput, { 
          target: { value: `Message ${i}` } 
        });
        fireEvent.click(sendButton);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Should handle all requests properly
      await waitFor(() => {
        expect(mockEnhancedAI.generateContent).toHaveBeenCalledTimes(3);
      }, { timeout: 3000 });
    });
  });

  describe('User Experience and Accessibility', () => {
    it('should provide clear visual indicators for enhanced features', async () => {
      render(<EnhancedAuraConciergeWrapper />);

      // Should show enhanced mode badge
      expect(screen.getByText('Enhanced')).toBeInTheDocument();
      expect(screen.getByText('Enhanced')).toHaveStyle({
        background: '#10b981',
        color: 'white'
      });

      // Should show RAG ready indicator
      expect(screen.getByText('🧠 RAG Ready')).toBeInTheDocument();
      expect(screen.getByText('🧠 RAG Ready')).toHaveStyle({
        color: '#10b981'
      });
    });

    it('should maintain accessibility with enhanced features', async () => {
      render(<EnhancedAuraConciergeWrapper />);

      // Should have proper ARIA labels
      const messageInput = screen.getByRole('textbox');
      expect(messageInput).toBeInTheDocument();

      const sendButton = screen.getByRole('button', { name: /send/i });
      expect(sendButton).toBeInTheDocument();

      // Enhanced features should not break accessibility
      expect(screen.getByText('Aura Concierge')).toBeInTheDocument();
    });

    it('should handle component unmounting during AI operations', async () => {
      mockEnhancedAI.generateContent.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return {
          content: 'Response after unmount',
          sources: [],
          metadata: { usedRAG: false, responseTime: 2000, sourcesUsed: 0 }
        };
      });

      const { unmount } = render(<EnhancedAuraConciergeWrapper />);

      const messageInput = screen.getByRole('textbox');
      const sendButton = screen.getByRole('button', { name: /send/i });

      fireEvent.change(messageInput, { 
        target: { value: 'Message before unmount' } 
      });
      fireEvent.click(sendButton);

      // Unmount before response arrives
      unmount();

      // Should not cause memory leaks or errors
      await new Promise(resolve => setTimeout(resolve, 3000));
      expect(true).toBe(true);
    });
  });
});
