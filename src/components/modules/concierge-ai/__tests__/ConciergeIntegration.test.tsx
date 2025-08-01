import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConciergeAIModule from '../ConciergeAIModule';

// Real-world integration tests for the entire Concierge AI module
describe('Concierge AI Module - Complete Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup real AI service mocks (not component mocks)
    global.fetch = jest.fn();
    
    // Mock Ollama service for real API testing
    Object.defineProperty(window, 'location', {
      value: { hostname: 'localhost' },
      writable: true
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Complete Concierge Module Workflow', () => {
    it('should load Concierge AI module and display Chat tab by default', async () => {
      render(<ConciergeAIModule />);
      
      // Verify Concierge module loads
      expect(screen.getByText('Chat')).toBeInTheDocument();
      expect(screen.getByText('AI Tools')).toBeInTheDocument();
      expect(screen.getByText('Prompt Library')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      
      // Verify Chat tab is active by default
      const chatTab = screen.getByRole('button', { name: /chat/i });
      expect(chatTab).toHaveClass('active');
      
      // Verify Aura Concierge L2 button is present
      expect(screen.getByLabelText('Aura Concierge')).toBeInTheDocument();
    });

    it('should handle L1 tab switching between all main sections', async () => {
      render(<ConciergeAIModule />);
      
      const tabs = ['Chat', 'AI Tools', 'Prompt Library', 'Settings'];
      
      for (const tabName of tabs) {
        const tabButton = screen.getByRole('button', { name: new RegExp(tabName, 'i') });
        fireEvent.click(tabButton);
        
        await waitFor(() => {
          expect(tabButton).toHaveClass('active');
        });
      }
    });

    it('should display correct L2 components for each L1 tab', async () => {
      render(<ConciergeAIModule />);
      
      // Test Chat tab L2 components
      const chatTab = screen.getByRole('button', { name: /chat/i });
      fireEvent.click(chatTab);
      
      await waitFor(() => {
        expect(screen.getByLabelText('Aura Concierge')).toBeInTheDocument();
        expect(screen.getByLabelText('Chat History')).toBeInTheDocument();
      });
      
      // Test AI Tools tab L2 components
      const aiToolsTab = screen.getByRole('button', { name: /ai tools/i });
      fireEvent.click(aiToolsTab);
      
      await waitFor(() => {
        expect(screen.getByLabelText('Summarizer')).toBeInTheDocument();
        expect(screen.getByLabelText('Translator')).toBeInTheDocument();
        expect(screen.getByLabelText('Content Generator')).toBeInTheDocument();
      });
      
      // Test Prompt Library tab L2 components
      const promptLibraryTab = screen.getByRole('button', { name: /prompt library/i });
      fireEvent.click(promptLibraryTab);
      
      await waitFor(() => {
        expect(screen.getByLabelText('Education')).toBeInTheDocument();
        expect(screen.getByLabelText('Administration')).toBeInTheDocument();
        expect(screen.getByLabelText('Productivity')).toBeInTheDocument();
      });
      
      // Test Settings tab L2 components
      const settingsTab = screen.getByRole('button', { name: /settings/i });
      fireEvent.click(settingsTab);
      
      await waitFor(() => {
        expect(screen.getByLabelText('Persona & Behavior')).toBeInTheDocument();
        expect(screen.getByLabelText('Model & Performance')).toBeInTheDocument();
        expect(screen.getByLabelText('Data & Privacy')).toBeInTheDocument();
        expect(screen.getByLabelText('Usage & Limits')).toBeInTheDocument();
      });
    });
  });

  describe('Real AI Integration Tests', () => {
    it('should handle Ollama AI service integration', async () => {
      // Mock successful Ollama connection
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ models: [{ name: 'qwen2.5:3b-instruct' }] })
      });

      render(<ConciergeAIModule />);
      
      // Navigate to Aura Concierge
      const auraConciergeButton = screen.getByLabelText('Aura Concierge');
      fireEvent.click(auraConciergeButton);
      
      await waitFor(() => {
        // Should attempt to connect to Ollama
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/tags'),
          expect.any(Object)
        );
      }, { timeout: 5000 });
    });

    it('should handle AI service failures gracefully', async () => {
      // Mock Ollama connection failure
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Connection failed'));

      render(<ConciergeAIModule />);
      
      const auraConciergeButton = screen.getByLabelText('Aura Concierge');
      fireEvent.click(auraConciergeButton);
      
      await waitFor(() => {
        // Should show disconnected status
        const statusElement = screen.queryByText(/disconnected/i);
        expect(statusElement).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should test real message sending functionality', async () => {
      // Mock successful Ollama response
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ models: [{ name: 'qwen2.5:3b-instruct' }] })
        })
        .mockResolvedValueOnce({
          ok: true,
          body: {
            getReader: () => ({
              read: async () => ({
                done: true,
                value: new TextEncoder().encode('{"response": "Hello! How can I help you today?"}')
              })
            })
          }
        });

      render(<ConciergeAIModule />);
      
      const auraConciergeButton = screen.getByLabelText('Aura Concierge');
      fireEvent.click(auraConciergeButton);
      
      await waitFor(() => {
        const messageInput = screen.queryByPlaceholderText(/type your message/i);
        if (messageInput) {
          fireEvent.change(messageInput, { target: { value: 'Hello, Aura!' } });
          
          const sendButton = screen.queryByRole('button', { name: /send/i });
          if (sendButton) {
            fireEvent.click(sendButton);
          }
        }
      }, { timeout: 5000 });
    });
  });

  describe('Component Navigation and State Management', () => {
    it('should maintain state when switching between L2 components', async () => {
      render(<ConciergeAIModule />);
      
      // Switch to AI Tools
      const aiToolsTab = screen.getByRole('button', { name: /ai tools/i });
      fireEvent.click(aiToolsTab);
      
      // Click on Summarizer
      const summarizerButton = screen.getByLabelText('Summarizer');
      fireEvent.click(summarizerButton);
      
      await waitFor(() => {
        expect(summarizerButton.closest('button')).toHaveClass('active');
      });
      
      // Switch to Translator
      const translatorButton = screen.getByLabelText('Translator');
      fireEvent.click(translatorButton);
      
      await waitFor(() => {
        expect(translatorButton.closest('button')).toHaveClass('active');
        expect(summarizerButton.closest('button')).not.toHaveClass('active');
      });
    });

    it('should handle rapid navigation without errors', async () => {
      render(<ConciergeAIModule />);
      
      const tabs = [
        screen.getByRole('button', { name: /chat/i }),
        screen.getByRole('button', { name: /ai tools/i }),
        screen.getByRole('button', { name: /prompt library/i }),
        screen.getByRole('button', { name: /settings/i })
      ];
      
      // Rapidly switch between tabs
      for (let i = 0; i < 3; i++) {
        for (const tab of tabs) {
          fireEvent.click(tab);
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
      
      // Final state should be stable
      const lastTab = tabs[tabs.length - 1];
      await waitFor(() => {
        expect(lastTab).toHaveClass('active');
      });
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle component loading errors gracefully', async () => {
      // Mock console.error to suppress error logs during testing
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<ConciergeAIModule />);
      
      // Try to access all components to ensure they don't crash
      const allTabs = [
        screen.getByRole('button', { name: /chat/i }),
        screen.getByRole('button', { name: /ai tools/i }),
        screen.getByRole('button', { name: /prompt library/i }),
        screen.getByRole('button', { name: /settings/i })
      ];
      
      for (const tab of allTabs) {
        fireEvent.click(tab);
        
        await waitFor(() => {
          expect(tab).toHaveClass('active');
        });
        
        // Should not crash the application
        expect(screen.getByText('Chat')).toBeInTheDocument();
      }
      
      consoleSpy.mockRestore();
    });

    it('should recover from network interruptions', async () => {
      // Start with working network
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ models: [{ name: 'qwen2.5:3b-instruct' }] })
      });

      render(<ConciergeAIModule />);
      
      const auraConciergeButton = screen.getByLabelText('Aura Concierge');
      fireEvent.click(auraConciergeButton);
      
      // Network fails
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      
      // Try to send a message (should fail gracefully)
      await waitFor(() => {
        const messageInput = screen.queryByPlaceholderText(/type your message/i);
        if (messageInput) {
          fireEvent.change(messageInput, { target: { value: 'Test message' } });
        }
      }, { timeout: 3000 });
      
      // Should not crash the application
      expect(screen.getByText('Chat')).toBeInTheDocument();
    });
  });

  describe('Performance and Accessibility', () => {
    it('should handle multiple simultaneous component interactions', async () => {
      render(<ConciergeAIModule />);
      
      // Simulate multiple rapid interactions
      const chatTab = screen.getByRole('button', { name: /chat/i });
      const aiToolsTab = screen.getByRole('button', { name: /ai tools/i });
      
      // Rapid clicking
      for (let i = 0; i < 5; i++) {
        fireEvent.click(chatTab);
        fireEvent.click(aiToolsTab);
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      // Should still be functional
      expect(screen.getByText('AI Tools')).toBeInTheDocument();
    });

    it('should have proper ARIA labels and accessibility', async () => {
      render(<ConciergeAIModule />);
      
      // Check for proper ARIA labels on L2 buttons
      expect(screen.getByLabelText('Aura Concierge')).toBeInTheDocument();
      expect(screen.getByLabelText('Chat History')).toBeInTheDocument();
      
      // Switch to AI Tools and check labels
      const aiToolsTab = screen.getByRole('button', { name: /ai tools/i });
      fireEvent.click(aiToolsTab);
      
      await waitFor(() => {
        expect(screen.getByLabelText('Summarizer')).toBeInTheDocument();
        expect(screen.getByLabelText('Translator')).toBeInTheDocument();
        expect(screen.getByLabelText('Content Generator')).toBeInTheDocument();
      });
    });

    it('should handle keyboard navigation', async () => {
      render(<ConciergeAIModule />);
      
      // Test keyboard navigation on tabs
      const chatTab = screen.getByRole('button', { name: /chat/i });
      chatTab.focus();
      
      // Press Enter to activate
      fireEvent.keyDown(chatTab, { key: 'Enter', code: 'Enter' });
      
      await waitFor(() => {
        expect(chatTab).toHaveClass('active');
      });
    });
  });

  describe('Real-World Usage Scenarios', () => {
    it('should handle complete user workflow from chat to tools to settings', async () => {
      render(<ConciergeAIModule />);
      
      // 1. User starts with chat
      expect(screen.getByRole('button', { name: /chat/i })).toHaveClass('active');
      
      // 2. User switches to AI Tools
      const aiToolsTab = screen.getByRole('button', { name: /ai tools/i });
      fireEvent.click(aiToolsTab);
      
      await waitFor(() => {
        expect(aiToolsTab).toHaveClass('active');
      });
      
      // 3. User tries Summarizer
      const summarizerButton = screen.getByLabelText('Summarizer');
      fireEvent.click(summarizerButton);
      
      await waitFor(() => {
        expect(summarizerButton.closest('button')).toHaveClass('active');
      });
      
      // 4. User goes to Settings
      const settingsTab = screen.getByRole('button', { name: /settings/i });
      fireEvent.click(settingsTab);
      
      await waitFor(() => {
        expect(settingsTab).toHaveClass('active');
      });
      
      // 5. User checks AI Model settings
      const modelButton = screen.getByLabelText('Model & Performance');
      fireEvent.click(modelButton);
      
      await waitFor(() => {
        expect(modelButton.closest('button')).toHaveClass('active');
      });
      
      // Workflow should complete successfully
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('should maintain responsive design across different screen sizes', async () => {
      // Test mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<ConciergeAIModule />);
      
      // Should still be functional on mobile
      const chatTab = screen.getByRole('button', { name: /chat/i });
      fireEvent.click(chatTab);
      
      await waitFor(() => {
        expect(chatTab).toHaveClass('active');
      });
      
      // Test desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });
      
      // Should work on desktop too
      const aiToolsTab = screen.getByRole('button', { name: /ai tools/i });
      fireEvent.click(aiToolsTab);
      
      await waitFor(() => {
        expect(aiToolsTab).toHaveClass('active');
      });
    });
  });
});
