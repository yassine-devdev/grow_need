import { aiServiceFactory } from '../aiServiceFactory';
import { enhancedAIService } from '../enhancedAIService';

// Mock the dependencies
jest.mock('../enhancedAIService');
jest.mock('../ollamaService');
jest.mock('../vercelAIOllamaProvider');

describe('AI Service Factory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear environment variables
    delete process.env.AI_PROVIDER;
    delete process.env.OPENAI_API_KEY;
    delete process.env.OLLAMA_BASE_URL;
  });

  it('creates enhanced AI service by default', () => {
    const service = aiServiceFactory.createService();
    expect(service).toBeDefined();
  });

  it('creates service based on environment configuration', () => {
    process.env.AI_PROVIDER = 'enhanced';
    const service = aiServiceFactory.createService();
    expect(service).toBeDefined();
  });

  it('validates configuration before creating service', () => {
    const isValid = aiServiceFactory.validateConfiguration();
    expect(typeof isValid).toBe('boolean');
  });

  it('handles invalid configuration gracefully', () => {
    process.env.AI_PROVIDER = 'invalid-provider';
    expect(() => aiServiceFactory.createService()).not.toThrow();
  });

  it('supports multiple AI providers', () => {
    const providers = ['enhanced', 'ollama', 'vercel'];
    
    providers.forEach(provider => {
      process.env.AI_PROVIDER = provider;
      const service = aiServiceFactory.createService();
      expect(service).toBeDefined();
    });
  });
});

describe('Enhanced AI Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock fetch
    global.fetch = jest.fn();
  });

  it('processes text queries correctly', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        response: 'Test AI response',
        confidence: 0.95,
      }),
    });

    const result = await enhancedAIService.processQuery('Test query');
    
    expect(result).toEqual({
      response: 'Test AI response',
      confidence: 0.95,
    });
  });

  it('handles API errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    await expect(enhancedAIService.processQuery('Test query')).rejects.toThrow('API Error');
  });

  it('validates input parameters', async () => {
    await expect(enhancedAIService.processQuery('')).rejects.toThrow(/Query cannot be empty/);
    await expect(enhancedAIService.processQuery(null as any)).rejects.toThrow(/Query must be a string/);
  });

  it('supports different query types', async () => {
    const queryTypes = ['question', 'instruction', 'conversation'];
    
    for (const type of queryTypes) {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ response: `Response for ${type}` }),
      });

      const result = await enhancedAIService.processQuery('Test query', { type });
      expect(result.response).toContain(type);
    }
  });

  it('applies rate limiting', async () => {
    const queries = Array(10).fill('Test query');
    
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ response: 'Response' }),
    });

    // Should handle multiple concurrent requests
    const promises = queries.map(query => enhancedAIService.processQuery(query));
    const results = await Promise.allSettled(promises);
    
    // Some requests should succeed, rate limiting might affect others
    const successful = results.filter(r => r.status === 'fulfilled');
    expect(successful.length).toBeGreaterThan(0);
  });

  it('supports context-aware conversations', async () => {
    const context = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there!' },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        response: 'Context-aware response',
        context: [...context, { role: 'user', content: 'Follow-up question' }],
      }),
    });

    const result = await enhancedAIService.processQuery('Follow-up question', { context });
    
    expect(result.response).toBe('Context-aware response');
    expect(result.context).toHaveLength(3);
  });

  it('handles streaming responses', async () => {
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue('chunk 1');
        controller.enqueue('chunk 2');
        controller.close();
      },
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      body: mockStream,
    });

    const onChunk = jest.fn();
    await enhancedAIService.streamQuery('Test query', { onChunk });

    expect(onChunk).toHaveBeenCalledWith('chunk 1');
    expect(onChunk).toHaveBeenCalledWith('chunk 2');
  });

  it('supports content moderation', async () => {
    const inappropriateQuery = 'Inappropriate content here';
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        flagged: true,
        reason: 'Content policy violation',
      }),
    });

    await expect(
      enhancedAIService.processQuery(inappropriateQuery, { moderate: true })
    ).rejects.toThrow(/Content policy violation/);
  });

  it('caches responses for repeated queries', async () => {
    const query = 'Cacheable query';
    
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ response: 'Cached response' }),
    });

    // First call
    await enhancedAIService.processQuery(query, { cache: true });
    
    // Second call should use cache
    await enhancedAIService.processQuery(query, { cache: true });
    
    // Should only make one actual API call
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('supports custom AI models', async () => {
    const customModel = 'gpt-4-custom';
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: 'Custom model response' }),
    });

    await enhancedAIService.processQuery('Test query', { model: customModel });
    
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: expect.stringContaining(customModel),
      })
    );
  });
});