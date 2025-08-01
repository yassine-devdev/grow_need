import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import AuraConcierge from '../AuraConcierge';

// Mock fetch for AI API calls
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('AuraConcierge AI Integration', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    // Reset mocks
    (fetch as jest.Mock).mockClear();
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('renders the AI concierge interface', () => {
    render(<AuraConcierge />);
    
    expect(screen.getByText(/Aura AI Concierge/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ask me anything/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('sends a message and receives AI response', async () => {
    // Mock successful AI API response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        response: 'Hello! I am Aura, your AI concierge. How can I help you today?',
        confidence: 0.95,
        timestamp: new Date().toISOString(),
      }),
    });

    render(<AuraConcierge />);
    
    const input = screen.getByPlaceholderText(/Ask me anything/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    // Type a message
    await user.type(input, 'Hello, how can you help me?');
    await user.click(sendButton);

    // Verify the user message appears
    expect(screen.getByText('Hello, how can you help me?')).toBeInTheDocument();

    // Wait for AI response
    await waitFor(() => {
      expect(screen.getByText(/Hello! I am Aura, your AI concierge/i)).toBeInTheDocument();
    });

    // Verify API was called correctly
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/ai/chat'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('Hello, how can you help me?'),
      })
    );
  });

  it('handles AI API errors gracefully', async () => {
    // Mock failed AI API response
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('AI service unavailable'));

    render(<AuraConcierge />);
    
    const input = screen.getByPlaceholderText(/Ask me anything/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    await user.type(input, 'Test message');
    await user.click(sendButton);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/Sorry, I'm having trouble connecting/i)).toBeInTheDocument();
    });
  });

  it('displays typing indicator while AI is processing', async () => {
    // Mock AI API with delay
    (fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: async () => ({ response: 'Test response' }),
        }), 100)
      )
    );

    render(<AuraConcierge />);
    
    const input = screen.getByPlaceholderText(/Ask me anything/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    await user.type(input, 'Test message');
    await user.click(sendButton);

    // Should show typing indicator
    expect(screen.getByText(/Aura is typing/i)).toBeInTheDocument();

    // Wait for response and typing indicator to disappear
    await waitFor(() => {
      expect(screen.queryByText(/Aura is typing/i)).not.toBeInTheDocument();
    });
  });

  it('persists chat history in localStorage', async () => {
    // Mock successful AI API response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        response: 'Test AI response',
        timestamp: new Date().toISOString(),
      }),
    });

    render(<AuraConcierge />);
    
    const input = screen.getByPlaceholderText(/Ask me anything/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    await user.type(input, 'Test message for history');
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Test AI response')).toBeInTheDocument();
    });

    // Verify chat history was saved to localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'aura-chat-history',
      expect.stringContaining('Test message for history')
    );
  });

  it('loads previous chat history on mount', () => {
    // Set up existing chat history in localStorage
    const existingHistory = [
      {
        id: '1',
        message: 'Previous message',
        sender: 'user',
        timestamp: new Date().toISOString(),
      },
      {
        id: '2',
        message: 'Previous AI response',
        sender: 'ai',
        timestamp: new Date().toISOString(),
      },
    ];

    localStorageMock.setItem('aura-chat-history', JSON.stringify(existingHistory));

    render(<AuraConcierge />);

    // Should display previous chat history
    expect(screen.getByText('Previous message')).toBeInTheDocument();
    expect(screen.getByText('Previous AI response')).toBeInTheDocument();
  });

  it('clears chat history when clear button is clicked', async () => {
    // Set up existing chat history
    const existingHistory = [
      {
        id: '1',
        message: 'Message to be cleared',
        sender: 'user',
        timestamp: new Date().toISOString(),
      },
    ];

    localStorageMock.setItem('aura-chat-history', JSON.stringify(existingHistory));

    render(<AuraConcierge />);

    // Verify message is initially displayed
    expect(screen.getByText('Message to be cleared')).toBeInTheDocument();

    // Click clear history button
    const clearButton = screen.getByRole('button', { name: /clear history/i });
    await user.click(clearButton);

    // Verify message is removed and localStorage is cleared
    expect(screen.queryByText('Message to be cleared')).not.toBeInTheDocument();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('aura-chat-history');
  });

  it('supports keyboard shortcuts for sending messages', async () => {
    // Mock successful AI API response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        response: 'Response via keyboard',
        timestamp: new Date().toISOString(),
      }),
    });

    render(<AuraConcierge />);
    
    const input = screen.getByPlaceholderText(/Ask me anything/i);

    await user.type(input, 'Message via Enter key');
    await user.keyboard('{Enter}');

    // Verify message was sent
    expect(screen.getByText('Message via Enter key')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Response via keyboard')).toBeInTheDocument();
    });
  });

  it('handles long conversations with scroll behavior', async () => {
    render(<AuraConcierge />);

    // Simulate multiple messages to test scrolling
    for (let i = 1; i <= 5; i++) {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: `AI response ${i}`,
          timestamp: new Date().toISOString(),
        }),
      });

      const input = screen.getByPlaceholderText(/Ask me anything/i);
      const sendButton = screen.getByRole('button', { name: /send/i });

      await user.clear(input);
      await user.type(input, `User message ${i}`);
      await user.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText(`AI response ${i}`)).toBeInTheDocument();
      });
    }

    // Verify all messages are present
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByText(`User message ${i}`)).toBeInTheDocument();
      expect(screen.getByText(`AI response ${i}`)).toBeInTheDocument();
    }
  });
});