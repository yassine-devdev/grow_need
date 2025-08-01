import { renderHook, act, waitFor } from '@testing-library/react';
import { useConciergeAI } from '../../../hooks/useConciergeAI';

// Mock the useOllamaAI hook
jest.mock('../../../hooks/useOllamaAI', () => ({
  useOllamaAI: jest.fn(() => ({
    messages: [],
    isLoading: false,
    error: null,
    isConnected: true,
    sendMessage: jest.fn(),
    initializeWithSystemPrompt: jest.fn(),
    currentModel: 'qwen2.5:3b-instruct'
  }))
}));

import { useOllamaAI } from '../../../hooks/useOllamaAI';

describe('useConciergeAI', () => {
  const mockOllamaAI = {
    messages: [],
    isLoading: false,
    error: null,
    isConnected: true,
    sendMessage: jest.fn(),
    initializeWithSystemPrompt: jest.fn(),
    currentModel: 'qwen2.5:3b-instruct'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useOllamaAI as jest.Mock).mockReturnValue(mockOllamaAI);
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useConciergeAI());

    expect(result.current.messages).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.isConnected).toBe(true);
    expect(typeof result.current.sendMessage).toBe('function');
  });

  it('converts Ollama messages to Concierge format', async () => {
    const ollamaMessages = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there!' },
      { role: 'system', content: 'System message' }
    ];

    (useOllamaAI as jest.Mock).mockReturnValue({
      ...mockOllamaAI,
      messages: ollamaMessages
    });

    const { result } = renderHook(() => useConciergeAI());

    await waitFor(() => {
      expect(result.current.messages).toEqual([
        { role: 'user', text: 'Hello' },
        { role: 'model', text: 'Hi there!' }
        // System message should be filtered out
      ]);
    });
  });

  it('handles sendMessage correctly', async () => {
    const mockSendMessage = jest.fn();
    (useOllamaAI as jest.Mock).mockReturnValue({
      ...mockOllamaAI,
      sendMessage: mockSendMessage
    });

    const { result } = renderHook(() => useConciergeAI());

    await act(async () => {
      await result.current.sendMessage('Test message');
    });

    expect(mockSendMessage).toHaveBeenCalledWith(
      'Test message',
      expect.stringContaining('Aura Concierge')
    );
  });

  it('does not send message when loading', async () => {
    const mockSendMessage = jest.fn();
    (useOllamaAI as jest.Mock).mockReturnValue({
      ...mockOllamaAI,
      isLoading: true,
      sendMessage: mockSendMessage
    });

    const { result } = renderHook(() => useConciergeAI());

    await act(async () => {
      await result.current.sendMessage('Test message');
    });

    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  it('does not send message when not connected', async () => {
    const mockSendMessage = jest.fn();
    (useOllamaAI as jest.Mock).mockReturnValue({
      ...mockOllamaAI,
      isConnected: false,
      sendMessage: mockSendMessage
    });

    const { result } = renderHook(() => useConciergeAI());

    await act(async () => {
      await result.current.sendMessage('Test message');
    });

    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  it('does not send empty message', async () => {
    const mockSendMessage = jest.fn();
    (useOllamaAI as jest.Mock).mockReturnValue({
      ...mockOllamaAI,
      sendMessage: mockSendMessage
    });

    const { result } = renderHook(() => useConciergeAI());

    await act(async () => {
      await result.current.sendMessage('');
    });

    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  it('handles errors gracefully', async () => {
    const mockSendMessage = jest.fn().mockRejectedValue(new Error('API Error'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    (useOllamaAI as jest.Mock).mockReturnValue({
      ...mockOllamaAI,
      sendMessage: mockSendMessage
    });

    const { result } = renderHook(() => useConciergeAI());

    await act(async () => {
      await result.current.sendMessage('Test message');
    });

    expect(consoleSpy).toHaveBeenCalledWith('Concierge message error:', expect.any(Error));
    
    consoleSpy.mockRestore();
  });

  it('passes through loading state', () => {
    (useOllamaAI as jest.Mock).mockReturnValue({
      ...mockOllamaAI,
      isLoading: true
    });

    const { result } = renderHook(() => useConciergeAI());

    expect(result.current.isLoading).toBe(true);
  });

  it('passes through error state', () => {
    const testError = new Error('Test error');
    (useOllamaAI as jest.Mock).mockReturnValue({
      ...mockOllamaAI,
      error: testError
    });

    const { result } = renderHook(() => useConciergeAI());

    expect(result.current.error).toBe(testError);
  });

  it('passes through connection state', () => {
    (useOllamaAI as jest.Mock).mockReturnValue({
      ...mockOllamaAI,
      isConnected: false
    });

    const { result } = renderHook(() => useConciergeAI());

    expect(result.current.isConnected).toBe(false);
  });
});
