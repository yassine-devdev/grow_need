/**
 * AI Provider Factory - Secure Version
 * Provides a unified interface that routes through secure backend endpoints
 */

import { secureAIService } from './secureAIService';

export interface AIResponse {
  text: string;
  model?: string;
}

export interface AIGenerateOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  system?: string;
}

export interface AIProvider {
  generateContent(prompt: string, options?: AIGenerateOptions): Promise<AIResponse>;
  generateJSON(prompt: string, schema: any, options?: AIGenerateOptions): Promise<any>;
  testConnection(): Promise<boolean>;
  getAvailableModels(): Promise<string[]>;
  analyzeFeedback(text: string): Promise<any>;
  generateEducationalContent(type: string, topic: string, grade: string, requirements?: string): Promise<string>;
  gradeSubmission(submission: string, rubric: string, context?: string): Promise<string>;
  detectLearningGaps(topic: string, answers: string): Promise<string>;
  generatePolicy(topic: string, audience: string, context?: string): Promise<string>;
  translateText(text: string, targetLang: string, sourceLang?: string): Promise<string>;
}

class SecureOllamaProvider implements AIProvider {
  async generateContent(prompt: string, options: AIGenerateOptions = {}): Promise<AIResponse> {
    try {
      const response = await secureAIService.generateContent({
        prompt,
        content_type: 'general',
        temperature: options.temperature,
        max_tokens: options.max_tokens
      });

      if (response.success && response.content) {
        return {
          text: response.content,
          model: response.model || 'secure-backend'
        };
      } else {
        throw new Error(response.error || 'Failed to generate content');
      }
    } catch (error) {
      console.error('Secure AI generation error:', error);
      throw error;
    }
  }

  async generateJSON(prompt: string, schema: any, options: AIGenerateOptions = {}): Promise<any> {
    try {
      const jsonPrompt = `${prompt}\n\nIMPORTANT: Respond with valid JSON only that matches this schema: ${JSON.stringify(schema)}`;
      
      const response = await secureAIService.generateContent({
        prompt: jsonPrompt,
        content_type: 'general',
        temperature: options.temperature || 0.3,
        max_tokens: options.max_tokens
      });

      if (response.success && response.content) {
        try {
          return JSON.parse(response.content);
        } catch (parseError) {
          // Try to extract JSON from response
          const jsonMatch = response.content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
          }
          throw new Error('Response is not valid JSON');
        }
      } else {
        throw new Error(response.error || 'Failed to generate JSON');
      }
    } catch (error) {
      console.error('Secure JSON generation error:', error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await secureAIService.testConnection();
      return response.success && response.services?.ollama?.connected === true;
    } catch (error) {
      console.error('Connection test error:', error);
      return false;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await secureAIService.getAvailableModels();
      return response.success ? response.models || [] : [];
    } catch (error) {
      console.error('Get models error:', error);
      return [];
    }
  }

  async analyzeFeedback(text: string): Promise<any> {
    try {
      const response = await secureAIService.analyzeFeedback({
        text,
        analysis_type: 'sentiment'
      });

      if (response.success && response.analysis) {
        return response.analysis;
      } else {
        throw new Error(response.error || 'Failed to analyze feedback');
      }
    } catch (error) {
      console.error('Feedback analysis error:', error);
      throw error;
    }
  }

  async generateEducationalContent(type: string, topic: string, grade: string, requirements?: string): Promise<string> {
    return secureAIService.generateEducationalContent(type, topic, grade, requirements);
  }

  async gradeSubmission(submission: string, rubric: string, context?: string): Promise<string> {
    return secureAIService.gradeSubmission(submission, rubric, context);
  }

  async detectLearningGaps(topic: string, answers: string): Promise<string> {
    return secureAIService.detectLearningGaps(topic, answers);
  }

  async generatePolicy(topic: string, audience: string, context?: string): Promise<string> {
    return secureAIService.generatePolicy(topic, audience, context);
  }

  async translateText(text: string, targetLang: string, sourceLang: string = 'auto'): Promise<string> {
    return secureAIService.translateText(text, targetLang, sourceLang);
  }
}

class GeminiProvider implements AIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateContent(prompt: string, options: AIGenerateOptions = {}): Promise<AIResponse> {
    // Import GoogleGenAI dynamically to avoid errors if not available
    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: this.apiKey });
      
      const response = await ai.models.generateContent({
        model: options.model || 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: options.temperature,
          maxOutputTokens: options.max_tokens,
          systemInstruction: options.system
        }
      });

      return {
        text: response.text,
        model: options.model || 'gemini-2.5-flash'
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to generate content with Gemini API');
    }
  }

  async generateJSON(prompt: string, schema: any, options: AIGenerateOptions = {}): Promise<any> {
    try {
      const { GoogleGenAI, Type } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: this.apiKey });
      
      const response = await ai.models.generateContent({
        model: options.model || 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: options.temperature,
          maxOutputTokens: options.max_tokens,
          systemInstruction: options.system
        }
      });

      return JSON.parse(response.text);
    } catch (error) {
      console.error('Gemini JSON generation error:', error);
      throw new Error('Failed to generate JSON with Gemini API');
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.generateContent("Hello", { max_tokens: 10 });
      return !!response.text;
    } catch (error) {
      return false;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    return ['gemini-2.5-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'];
  }

  async analyzeFeedback(text: string): Promise<any> {
    const prompt = `Analyze this feedback and return JSON: "${text}"`;
    const schema = {
      type: "object",
      properties: {
        sentiment: { type: "string" },
        summary: { type: "string" },
        key_themes: { type: "array", items: { type: "string" } },
        actionable_suggestions: { type: "array", items: { type: "string" } }
      }
    };
    return this.generateJSON(prompt, schema);
  }

  async generateEducationalContent(type: string, topic: string, grade: string, requirements?: string): Promise<string> {
    const prompt = `Create a ${type} for grade ${grade} on topic "${topic}". ${requirements || ''}`;
    const response = await this.generateContent(prompt, {
      system: "You are an experienced educator creating educational content."
    });
    return response.text;
  }

  async gradeSubmission(submission: string, rubric: string, context?: string): Promise<string> {
    const prompt = `Grade this submission using the rubric:\n\nSubmission: ${submission}\n\nRubric: ${rubric}\n\n${context || ''}`;
    const response = await this.generateContent(prompt, {
      system: "You are an experienced teacher providing constructive feedback."
    });
    return response.text;
  }

  async detectLearningGaps(topic: string, answers: string): Promise<string> {
    const prompt = `Analyze student answers for topic "${topic}" and identify learning gaps:\n\n${answers}`;
    const response = await this.generateContent(prompt, {
      system: "You are an educational analyst identifying learning gaps."
    });
    return response.text;
  }

  async generatePolicy(topic: string, audience: string, context?: string): Promise<string> {
    const prompt = `Generate a school policy on "${topic}" for ${audience}. ${context || ''}`;
    const response = await this.generateContent(prompt, {
      system: "You are a school administrator creating comprehensive policies."
    });
    return response.text;
  }

  async translateText(text: string, targetLang: string, sourceLang: string = 'auto'): Promise<string> {
    const prompt = `Translate "${text}" to ${targetLang}`;
    const response = await this.generateContent(prompt, {
      system: "You are a professional translator."
    });
    return response.text;
  }
}

// Factory function to create the appropriate AI provider
export function createAIProvider(): AIProvider {
  // Always use secure provider now - no more direct API calls
  return new SecureOllamaProvider();
}

// Export singleton instance
export const aiProvider = createAIProvider();
