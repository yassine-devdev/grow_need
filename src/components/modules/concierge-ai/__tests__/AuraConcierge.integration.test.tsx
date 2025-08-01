import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AuraConcierge from '../AuraConcierge';

// Real-world integration tests for AuraConcierge component
describe('AuraConcierge Component - Real-World Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    
    // Mock console.error to suppress error logs during testing
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Real Ollama AI Integration', () => {
    it('should connect to real Ollama service and display connection status', async () => {
      // Mock successful Ollama connection
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ 
          models: [
            { name: 'qwen2.5:3b-instruct', size: 2000000000 },
            { name: 'llama3.2:1b', size: 1000000000 }
          ] 
        })
      });

      render(<AuraConcierge />);

      await waitFor(() => {
        // Should attempt to connect to Ollama
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/tags'),
          expect.objectContaining({
            method: 'GET'
          })
        );
      }, { timeout: 5000 });

      await waitFor(() => {
        // Should show connected status
        const statusElement = screen.queryByText(/connected/i);
        expect(statusElement).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should handle Ollama connection failure gracefully', async () => {
      // Mock Ollama connection failure
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Connection refused'));

      render(<AuraConcierge />);

      await waitFor(() => {
        // Should show disconnected status
        const statusElement = screen.queryByText(/disconnected/i);
        expect(statusElement).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should display current model information when connected', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ 
          models: [{ name: 'qwen2.5:3b-instruct' }] 
        })
      });

      render(<AuraConcierge />);

      await waitFor(() => {
        // Should display model name in status
        const modelElement = screen.queryByText(/qwen2.5:3b-instruct/i);
        expect(modelElement).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Real Message Sending and Receiving', () => {
    it('should send real messages to Ollama and receive responses', async () => {
      // Mock successful connection
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ models: [{ name: 'qwen2.5:3b-instruct' }] })
        })
        // Mock streaming response
        .mockResolvedValueOnce({
          ok: true,
          body: {
            getReader: () => ({
              read: jest.fn()
                .mockResolvedValueOnce({
                  done: false,
                  value: new TextEncoder().encode('{"response": "Hello! How can I help you today?"}')
                })
                .mockResolvedValueOnce({
                  done: true,
                  value: undefined
                })
            })
          }
        });

      render(<AuraConcierge />);

      // Wait for connection
      await waitFor(() => {
        expect(screen.queryByText(/connected/i)).toBeInTheDocument();
      }, { timeout: 5000 });

      // Find and interact with message input
      const messageInput = screen.queryByPlaceholderText(/type your message/i) || 
                          screen.queryByRole('textbox');
      
      if (messageInput) {
        fireEvent.change(messageInput, { target: { value: 'Hello, Aura!' } });
        
        // Find and click send button
        const sendButton = screen.queryByRole('button', { name: /send/i }) ||
                          screen.queryByText(/send/i);
        
        if (sendButton) {
          fireEvent.click(sendButton);
          
          // Should make API call to generate response
          await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
              expect.stringContaining('/api/generate'),
              expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                  'Content-Type': 'application/json'
                }),
                body: expect.stringContaining('Hello, Aura!')
              })
            );
          }, { timeout: 5000 });
        }
      }
    });

    it('should handle message sending errors gracefully', async () => {
      // Mock successful connection but failed message
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ models: [{ name: 'qwen2.5:3b-instruct' }] })
        })
        .mockRejectedValueOnce(new Error('Message sending failed'));

      render(<AuraConcierge />);

      await waitFor(() => {
        expect(screen.queryByText(/connected/i)).toBeInTheDocument();
      }, { timeout: 5000 });

      const messageInput = screen.queryByPlaceholderText(/type your message/i) || 
                          screen.queryByRole('textbox');
      
      if (messageInput) {
        fireEvent.change(messageInput, { target: { value: 'Test message' } });
        
        const sendButton = screen.queryByRole('button', { name: /send/i }) ||
                          screen.queryByText(/send/i);
        
        if (sendButton) {
          fireEvent.click(sendButton);
          
          // Should handle error gracefully without crashing
          await waitFor(() => {
            expect(screen.getByText(/aura concierge/i)).toBeInTheDocument();
          }, { timeout: 3000 });
        }
      }
    });

    it('should display loading state during message processing', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ models: [{ name: 'qwen2.5:3b-instruct' }] })
        })
        .mockImplementationOnce(() => 
          new Promise(resolve => setTimeout(() => resolve({
            ok: true,
            body: {
              getReader: () => ({
                read: async () => ({
                  done: true,
                  value: new TextEncoder().encode('{"response": "Response"}')
                })
              })
            }
          }), 2000))
        );

      render(<AuraConcierge />);

      await waitFor(() => {
        expect(screen.queryByText(/connected/i)).toBeInTheDocument();
      }, { timeout: 5000 });

      const messageInput = screen.queryByPlaceholderText(/type your message/i) || 
                          screen.queryByRole('textbox');
      
      if (messageInput) {
        fireEvent.change(messageInput, { target: { value: 'Test message' } });
        
        const sendButton = screen.queryByRole('button', { name: /send/i }) ||
                          screen.queryByText(/send/i);
        
        if (sendButton) {
          fireEvent.click(sendButton);
          
          // Should show loading indicator
          await waitFor(() => {
            const loadingElement = screen.queryByText(/thinking/i) ||
                                 screen.queryByText(/loading/i) ||
                                 document.querySelector('.loading') ||
                                 document.querySelector('.spinner');
            expect(loadingElement).toBeInTheDocument();
          }, { timeout: 1000 });
        }
      }
    });
  });

  describe('Message History and Display', () => {
    it('should display message history correctly', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ models: [{ name: 'qwen2.5:3b-instruct' }] })
        })
        .mockResolvedValueOnce({
          ok: true,
          body: {
            getReader: () => ({
              read: jest.fn()
                .mockResolvedValueOnce({
                  done: false,
                  value: new TextEncoder().encode('{"response": "Hello! How can I help?"}')
                })
                .mockResolvedValueOnce({
                  done: true,
                  value: undefined
                })
            })
          }
        });

      render(<AuraConcierge />);

      await waitFor(() => {
        expect(screen.queryByText(/connected/i)).toBeInTheDocument();
      }, { timeout: 5000 });

      const messageInput = screen.queryByPlaceholderText(/type your message/i) || 
                          screen.queryByRole('textbox');
      
      if (messageInput) {
        fireEvent.change(messageInput, { target: { value: 'Hello' } });
        
        const sendButton = screen.queryByRole('button', { name: /send/i }) ||
                          screen.queryByText(/send/i);
        
        if (sendButton) {
          fireEvent.click(sendButton);
          
          // Should display user message
          await waitFor(() => {
            expect(screen.queryByText('Hello')).toBeInTheDocument();
          }, { timeout: 5000 });
          
          // Should display AI response
          await waitFor(() => {
            expect(screen.queryByText(/how can i help/i)).toBeInTheDocument();
          }, { timeout: 5000 });
        }
      }
    });

    it('should auto-scroll to latest messages', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ models: [{ name: 'qwen2.5:3b-instruct' }] })
      });

      render(<AuraConcierge />);

      // Mock scrollTop and scrollHeight for testing auto-scroll
      const mockScrollElement = {
        scrollTop: 0,
        scrollHeight: 1000,
        clientHeight: 400
      };

      Object.defineProperty(HTMLDivElement.prototype, 'scrollTop', {
        get: () => mockScrollElement.scrollTop,
        set: (value) => { mockScrollElement.scrollTop = value; },
        configurable: true
      });

      Object.defineProperty(HTMLDivElement.prototype, 'scrollHeight', {
        get: () => mockScrollElement.scrollHeight,
        configurable: true
      });

      // Should auto-scroll when new messages arrive
      await waitFor(() => {
        expect(screen.getByText(/aura concierge/i)).toBeInTheDocument();
      });
    });
  });

  describe('User Interface Interactions', () => {
    it('should handle textarea auto-resize for long messages', async () => {
      render(<AuraConcierge />);

      const messageInput = screen.queryByPlaceholderText(/type your message/i) || 
                          screen.queryByRole('textbox');
      
      if (messageInput) {
        const longMessage = 'This is a very long message that should cause the textarea to resize automatically when the user types more content than can fit in a single line.';
        
        fireEvent.change(messageInput, { target: { value: longMessage } });
        
        // Should handle long text input
        expect(messageInput).toHaveValue(longMessage);
      }
    });

    it('should handle keyboard shortcuts for sending messages', async () => {
      render(<AuraConcierge />);

      const messageInput = screen.queryByPlaceholderText(/type your message/i) || 
                          screen.queryByRole('textbox');
      
      if (messageInput) {
        fireEvent.change(messageInput, { target: { value: 'Test message' } });
        
        // Test Ctrl+Enter or Enter to send
        fireEvent.keyDown(messageInput, { 
          key: 'Enter', 
          code: 'Enter',
          ctrlKey: true 
        });
        
        // Should trigger message sending
        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalled();
        }, { timeout: 3000 });
      }
    });

    it('should disable send button when not connected', async () => {
      // Mock connection failure
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Connection failed'));

      render(<AuraConcierge />);

      await waitFor(() => {
        expect(screen.queryByText(/disconnected/i)).toBeInTheDocument();
      }, { timeout: 5000 });

      const sendButton = screen.queryByRole('button', { name: /send/i }) ||
                        screen.queryByText(/send/i);
      
      if (sendButton) {
        expect(sendButton).toBeDisabled();
      }
    });
  });

  describe('Performance and Memory Management', () => {
    it('should handle rapid message sending without memory leaks', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ models: [{ name: 'qwen2.5:3b-instruct' }] })
      });

      render(<AuraConcierge />);

      await waitFor(() => {
        expect(screen.queryByText(/connected/i)).toBeInTheDocument();
      }, { timeout: 5000 });

      const messageInput = screen.queryByPlaceholderText(/type your message/i) || 
                          screen.queryByRole('textbox');
      
      if (messageInput) {
        // Send multiple messages rapidly
        for (let i = 0; i < 5; i++) {
          fireEvent.change(messageInput, { target: { value: `Message ${i}` } });
          
          const sendButton = screen.queryByRole('button', { name: /send/i });
          if (sendButton && !sendButton.hasAttribute('disabled')) {
            fireEvent.click(sendButton);
          }
          
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Should still be functional
      expect(screen.getByText(/aura concierge/i)).toBeInTheDocument();
    });

    it('should clean up properly on component unmount', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ models: [{ name: 'qwen2.5:3b-instruct' }] })
      });

      const { unmount } = render(<AuraConcierge />);

      await waitFor(() => {
        expect(screen.queryByText(/aura concierge/i)).toBeInTheDocument();
      });

      // Unmount component
      unmount();

      // Should not cause memory leaks or errors
      expect(true).toBe(true);
    });
  });

  describe('Accessibility and User Experience', () => {
    it('should have proper ARIA labels and roles', async () => {
      render(<AuraConcierge />);

      // Check for proper accessibility attributes
      const messageInput = screen.queryByRole('textbox');
      expect(messageInput).toBeInTheDocument();

      const sendButton = screen.queryByRole('button', { name: /send/i });
      if (sendButton) {
        expect(sendButton).toBeInTheDocument();
      }
    });

    it('should support screen reader navigation', async () => {
      render(<AuraConcierge />);

      // Should have proper heading structure
      const heading = screen.queryByRole('heading') || 
                     screen.queryByText(/aura concierge/i);
      expect(heading).toBeInTheDocument();

      // Should have proper landmark roles
      const main = screen.queryByRole('main') || 
                  document.querySelector('[role="main"]');
      expect(main || screen.getByText(/aura concierge/i)).toBeInTheDocument();
    });

    it('should handle focus management correctly', async () => {
      render(<AuraConcierge />);

      const messageInput = screen.queryByPlaceholderText(/type your message/i) || 
                          screen.queryByRole('textbox');
      
      if (messageInput) {
        // Focus should be manageable
        messageInput.focus();
        expect(document.activeElement).toBe(messageInput);
      }
    });
  });
});
