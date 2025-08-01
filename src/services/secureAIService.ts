/**
 * Secure AI API Service
 * Replaces direct AI service calls with backend proxy calls
 */

import { apiInterceptor } from '../utils/apiInterceptor';

export interface SecureAIRequest {
  prompt: string;
  content_type: 'lesson-plan' | 'quiz' | 'assessment' | 'activity' | 'general';
  topic?: string;
  grade?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface SecureAIResponse {
  success: boolean;
  content?: string;
  model?: string;
  content_type?: string;
  error?: string;
}

export interface FeedbackAnalysisRequest {
  text: string;
  analysis_type?: 'sentiment' | 'themes' | 'suggestions';
}

export interface FeedbackAnalysisResponse {
  success: boolean;
  analysis?: any;
  analysis_type?: string;
  error?: string;
}

export interface AIConnectionStatus {
  success: boolean;
  services?: {
    ollama: {
      connected: boolean;
      url: string;
    };
  };
  error?: string;
}

export interface AIModelsResponse {
  success: boolean;
  models?: string[];
  default_model?: string;
  error?: string;
}

class SecureAIService {
  private baseUrl: string;

  constructor() {
    // Use backend API URL - handle test environment
    this.baseUrl = (typeof import !== 'undefined' && import.meta?.env?.VITE_API_BASE_URL) || 
                   process.env.VITE_API_BASE_URL || 
                   'http://localhost:5000';
    
    // Configure API interceptor with backend URL
    apiInterceptor.setBaseUrl(this.baseUrl);
  }

  /**
   * Generate educational content securely through backend
   */
  async generateContent(request: SecureAIRequest): Promise<SecureAIResponse> {
    try {
      // Validate input on frontend as well
      this.validateGenerateRequest(request);

      const response = await apiInterceptor.post<SecureAIResponse>('/api/ai/generate', request);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        return {
          success: false,
          error: response.error || 'Failed to generate content'
        };
      }
    } catch (error) {
      console.error('AI content generation error:', error);
      return {
        success: false,
        error: 'Network error or service unavailable'
      };
    }
  }

  /**
   * Analyze feedback text securely
   */
  async analyzeFeedback(request: FeedbackAnalysisRequest): Promise<FeedbackAnalysisResponse> {
    try {
      if (!request.text?.trim()) {
        throw new Error('Text is required for analysis');
      }

      const response = await apiInterceptor.post<FeedbackAnalysisResponse>('/api/ai/feedback-analysis', request);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        return {
          success: false,
          error: response.error || 'Failed to analyze feedback'
        };
      }
    } catch (error) {
      console.error('Feedback analysis error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Analysis failed'
      };
    }
  }

  /**
   * Test AI service connection
   */
  async testConnection(): Promise<AIConnectionStatus> {
    try {
      const response = await apiInterceptor.get<AIConnectionStatus>('/api/ai/test-connection');
      
      if (response.success && response.data) {
        return response.data;
      } else {
        return {
          success: false,
          error: response.error || 'Connection test failed'
        };
      }
    } catch (error) {
      console.error('AI connection test error:', error);
      return {
        success: false,
        error: 'Network error'
      };
    }
  }

  /**
   * Get available AI models
   */
  async getAvailableModels(): Promise<AIModelsResponse> {
    try {
      const response = await apiInterceptor.get<AIModelsResponse>('/api/ai/models');
      
      if (response.success && response.data) {
        return response.data;
      } else {
        return {
          success: false,
          error: response.error || 'Failed to fetch models'
        };
      }
    } catch (error) {
      console.error('Get models error:', error);
      return {
        success: false,
        error: 'Network error'
      };
    }
  }

  /**
   * Get rate limiting statistics
   */
  async getRateLimitStats(): Promise<any> {
    try {
      const response = await apiInterceptor.get('/api/security/rate-limit-stats');
      return response.data || { success: false, error: 'Failed to get stats' };
    } catch (error) {
      console.error('Rate limit stats error:', error);
      return { success: false, error: 'Network error' };
    }
  }

  /**
   * Legacy methods for backward compatibility with existing code
   * These methods now use the secure backend endpoints
   */
  
  async generateEducationalContent(
    type: string,
    topic: string,
    grade: string,
    requirements?: string
  ): Promise<string> {
    const prompt = requirements 
      ? `Create a ${type} for grade ${grade} on topic "${topic}". Additional requirements: ${requirements}`
      : `Create a ${type} for grade ${grade} on topic "${topic}".`;

    const response = await this.generateContent({
      prompt,
      content_type: this.mapContentType(type),
      topic,
      grade
    });

    if (response.success && response.content) {
      return response.content;
    } else {
      throw new Error(response.error || 'Failed to generate educational content');
    }
  }

  async gradeSubmission(
    submission: string,
    rubric: string,
    context?: string
  ): Promise<string> {
    const prompt = `Grade the following submission based on the rubric:\n\nSubmission: ${submission}\n\nRubric: ${rubric}${context ? `\n\nContext: ${context}` : ''}`;

    const response = await this.generateContent({
      prompt,
      content_type: 'assessment'
    });

    if (response.success && response.content) {
      return response.content;
    } else {
      throw new Error(response.error || 'Failed to grade submission');
    }
  }

  async detectLearningGaps(topic: string, answers: string): Promise<string> {
    const prompt = `Analyze student answers for topic "${topic}" and identify learning gaps:\n\n${answers}`;

    const response = await this.generateContent({
      prompt,
      content_type: 'assessment',
      topic
    });

    if (response.success && response.content) {
      return response.content;
    } else {
      throw new Error(response.error || 'Failed to detect learning gaps');
    }
  }

  async generatePolicy(topic: string, audience: string, context?: string): Promise<string> {
    const prompt = `Generate a school policy on "${topic}" for ${audience}.${context ? ` Context: ${context}` : ''}`;

    const response = await this.generateContent({
      prompt,
      content_type: 'general'
    });

    if (response.success && response.content) {
      return response.content;
    } else {
      throw new Error(response.error || 'Failed to generate policy');
    }
  }

  async translateText(text: string, targetLang: string, sourceLang?: string): Promise<string> {
    const prompt = `Translate "${text}" ${sourceLang ? `from ${sourceLang}` : ''} to ${targetLang}`;

    const response = await this.generateContent({
      prompt,
      content_type: 'general'
    });

    if (response.success && response.content) {
      return response.content;
    } else {
      throw new Error(response.error || 'Failed to translate text');
    }
  }

  /**
   * Validate generate request parameters
   */
  private validateGenerateRequest(request: SecureAIRequest): void {
    if (!request.prompt?.trim()) {
      throw new Error('Prompt is required');
    }

    if (request.prompt.length > 5000) {
      throw new Error('Prompt is too long (max 5000 characters)');
    }

    const allowedTypes = ['lesson-plan', 'quiz', 'assessment', 'activity', 'general'];
    if (!allowedTypes.includes(request.content_type)) {
      throw new Error('Invalid content type');
    }

    if (request.temperature !== undefined && (request.temperature < 0 || request.temperature > 2)) {
      throw new Error('Temperature must be between 0 and 2');
    }

    if (request.max_tokens !== undefined && (request.max_tokens < 1 || request.max_tokens > 4096)) {
      throw new Error('Max tokens must be between 1 and 4096');
    }
  }

  /**
   * Map legacy content types to secure API types
   */
  private mapContentType(type: string): SecureAIRequest['content_type'] {
    const typeMap: Record<string, SecureAIRequest['content_type']> = {
      'lesson': 'lesson-plan',
      'lesson-plan': 'lesson-plan',
      'quiz': 'quiz',
      'test': 'quiz',
      'assessment': 'assessment',
      'rubric': 'assessment',
      'activity': 'activity',
      'exercise': 'activity'
    };

    return typeMap[type.toLowerCase()] || 'general';
  }
}

// Export singleton instance
export const secureAIService = new SecureAIService();

// Export default for backward compatibility
export default secureAIService;