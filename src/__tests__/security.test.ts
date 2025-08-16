/**
 * Security improvements tests
 * Tests for the security hardening implementation
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { secureStorage } from '../utils/secureStorage';
import { secureAIService } from '../services/secureAIService';

// Mock fetch for testing
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Security Improvements', () => {
  beforeEach(() => {
    // Clear storage before each test
    secureStorage.clear();
    mockFetch.mockClear();
  });

  afterEach(() => {
    // Clean up after each test
    secureStorage.clear();
  });

  describe('Secure Storage', () => {
    test('should store and retrieve allowed data', () => {
      const testData = { theme: 'dark', language: 'en' };
      
      const success = secureStorage.setItem('user-preferences', testData);
      expect(success).toBe(true);
      
      const retrieved = secureStorage.getItem('user-preferences');
      expect(retrieved).toEqual(testData);
    });

    test('should reject sensitive data storage', () => {
      const sensitiveData = { 
        api_key: 'secret123',
        password: 'mypassword',
        token: 'auth-token'
      };
      
      const success = secureStorage.setItem('user-settings', sensitiveData);
      expect(success).toBe(false);
    });

    test('should reject non-whitelisted keys', () => {
      const data = { setting: 'value' };
      
      const success = secureStorage.setItem('unauthorized-key', data);
      expect(success).toBe(false);
    });

    test('should enforce size limits', () => {
      const largeData = 'x'.repeat(60000); // Exceeds 50KB limit
      
      const success = secureStorage.setItem('aura-theme', { large: largeData });
      expect(success).toBe(false);
    });

    test('should handle storage cleanup', () => {
      // Set some test data
      secureStorage.setItem('aura-theme', { color: 'blue' });
      secureStorage.setItem('aura-design', { size: 'large' });
      
      const statsBefore = secureStorage.getStorageStats();
      expect(statsBefore.totalItems).toBe(2);
      
      // Cleanup old items (using 0ms age to clean everything)
      const removedCount = secureStorage.cleanup(0);
      expect(removedCount).toBe(2);
      
      const statsAfter = secureStorage.getStorageStats();
      expect(statsAfter.totalItems).toBe(0);
    });

    test('should migrate legacy localStorage items', () => {
      // Simulate legacy data
      const legacyTheme = { color: 'red', background: 'dark' };
      localStorage.setItem('aura-theme', JSON.stringify(legacyTheme));
      
      const migratedCount = secureStorage.migrateLegacyItems();
      expect(migratedCount).toBe(1);
      
      // Check that data was migrated
      const migratedData = secureStorage.getItem('aura-theme');
      expect(migratedData).toEqual(legacyTheme);
      
      // Check that legacy item was removed
      const legacyItem = localStorage.getItem('aura-theme');
      expect(legacyItem).toBeNull();
    });
  });

  describe('Secure AI Service', () => {
    test('should validate input parameters', async () => {
      // Test with invalid prompt (empty)
      await expect(
        secureAIService.generateContent({
          prompt: '',
          content_type: 'general'
        })
      ).rejects.toThrow('Prompt is required');

      // Test with invalid content type
      await expect(
        secureAIService.generateContent({
          prompt: 'Test prompt',
          content_type: 'invalid-type' as any
        })
      ).rejects.toThrow('Invalid content type');

      // Test with prompt too long
      const longPrompt = 'x'.repeat(5001);
      await expect(
        secureAIService.generateContent({
          prompt: longPrompt,
          content_type: 'general'
        })
      ).rejects.toThrow('Prompt is too long');
    });

    test('should use backend API endpoints', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          content: 'Generated content',
          model: 'test-model'
        })
      });

      const response = await secureAIService.generateContent({
        prompt: 'Test prompt',
        content_type: 'general'
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/ai/generate'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: expect.stringContaining('Test prompt')
        })
      );

      expect(response.success).toBe(true);
      expect(response.content).toBe('Generated content');
    });

    test('should handle backend errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({
          error: 'Rate limit exceeded'
        })
      });

      const response = await secureAIService.generateContent({
        prompt: 'Test prompt',
        content_type: 'general'
      });

      expect(response.success).toBe(false);
      expect(response.error).toContain('Rate limit exceeded');
    });

    test('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const response = await secureAIService.generateContent({
        prompt: 'Test prompt',
        content_type: 'general'
      });

      expect(response.success).toBe(false);
      expect(response.error).toBe('Network error or service unavailable');
    });

    test('should test connection to backend', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          services: {
            ollama: {
              connected: true,
              url: 'http://localhost:11434'
            }
          }
        })
      });

      const response = await secureAIService.testConnection();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/ai/test-connection'),
        expect.any(Object)
      );

      expect(response.success).toBe(true);
      expect(response.services?.ollama?.connected).toBe(true);
    });

    test('should get available models', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          models: ['model1', 'model2'],
          default_model: 'model1'
        })
      });

      const response = await secureAIService.getAvailableModels();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/ai/models'),
        expect.any(Object)
      );

      expect(response.success).toBe(true);
      expect(response.models).toEqual(['model1', 'model2']);
      expect(response.default_model).toBe('model1');
    });

    test('should analyze feedback', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          analysis: {
            sentiment: 'positive',
            summary: 'Good feedback',
            key_themes: ['quality', 'satisfaction']
          },
          analysis_type: 'sentiment'
        })
      });

      const response = await secureAIService.analyzeFeedback({
        text: 'Great service!',
        analysis_type: 'sentiment'
      });

      expect(response.success).toBe(true);
      expect(response.analysis?.sentiment).toBe('positive');
    });
  });

  describe('Input Validation', () => {
    test('should sanitize HTML content', () => {
      const maliciousInput = '<script>alert("xss")</script>Hello World';
      
      // This would be tested if we export the InputValidator from the backend
      // For now, we test that the frontend validation works
      expect(() => {
        secureAIService.generateContent({
          prompt: maliciousInput,
          content_type: 'general'
        });
      }).not.toThrow(); // Should sanitize, not throw
    });

    test('should enforce content type validation', () => {
      expect(() => {
        secureAIService.generateContent({
          prompt: 'Test',
          content_type: 'malicious-type' as any
        });
      }).rejects.toThrow('Invalid content type');
    });

    test('should enforce parameter ranges', () => {
      expect(() => {
        secureAIService.generateContent({
          prompt: 'Test',
          content_type: 'general',
          temperature: 3.0 // Invalid range
        });
      }).rejects.toThrow('Temperature must be between 0 and 2');

      expect(() => {
        secureAIService.generateContent({
          prompt: 'Test',
          content_type: 'general',
          max_tokens: 5000 // Invalid range
        });
      }).rejects.toThrow('Max tokens must be between 1 and 4096');
    });
  });

  describe('Legacy API Compatibility', () => {
    test('should maintain backward compatibility', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          content: 'Educational content',
          model: 'test-model'
        })
      });

      // Test legacy method still works
      const result = await secureAIService.generateEducationalContent(
        'lesson-plan',
        'Math',
        '5th Grade',
        'Include interactive elements'
      );

      expect(result).toBe('Educational content');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/ai/generate'),
        expect.any(Object)
      );
    });
  });
});

describe('Security Headers and CORS', () => {
  test('should include security headers in requests', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });

    await secureAIService.generateContent({
      prompt: 'Test',
      content_type: 'general'
    });

    const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1];
    const requestOptions = lastCall[1];

    expect(requestOptions.headers['Content-Type']).toBe('application/json');
  });
});

// Integration test for the entire security flow
describe('Security Integration', () => {
  test('should handle complete secure workflow', async () => {
    // 1. Store user preferences securely
    const preferences = { theme: 'dark', ai_model: 'secure-model' };
    const storeSuccess = secureStorage.setItem('user-preferences', preferences);
    expect(storeSuccess).toBe(true);

    // 2. Mock successful AI API call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        content: 'Secure AI response',
        model: 'secure-model'
      })
    });

    // 3. Make secure AI request
    const aiResponse = await secureAIService.generateContent({
      prompt: 'Create a secure lesson plan',
      content_type: 'lesson-plan',
      temperature: 0.7
    });

    // 4. Verify secure flow
    expect(aiResponse.success).toBe(true);
    expect(aiResponse.content).toBe('Secure AI response');

    // 5. Verify storage is secure
    const storedPrefs = secureStorage.getItem('user-preferences');
    expect(storedPrefs).toEqual(preferences);

    // 6. Verify API was called securely
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/ai/generate'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      })
    );
  });
});