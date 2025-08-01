/**
 * AI Provider Factory
 * Provides a unified interface that can switch between Ollama and Google Gemini
 */

import { ollamaService } from './ollamaService';

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

class OllamaProvider implements AIProvider {
  async generateContent(prompt: string, options: AIGenerateOptions = {}): Promise<AIResponse> {
    const response = await ollamaService.generateContent(prompt, options);
    return {
      text: response.text,
      model: response.model
    };
  }

  async generateJSON(prompt: string, schema: any, options: AIGenerateOptions = {}): Promise<any> {
    return ollamaService.generateJSON(prompt, schema, options);
  }

  async testConnection(): Promise<boolean> {
    return ollamaService.testConnection();
  }

  async getAvailableModels(): Promise<string[]> {
    return ollamaService.getAvailableModels();
  }

  async analyzeFeedback(text: string): Promise<any> {
    return ollamaService.analyzeFeedback(text);
  }

  async generateEducationalContent(type: string, topic: string, grade: string, requirements?: string): Promise<string> {
    return ollamaService.generateEducationalContent(type, topic, grade, requirements);
  }

  async gradeSubmission(submission: string, rubric: string, context?: string): Promise<string> {
    return ollamaService.gradeSubmission(submission, rubric, context);
  }

  async detectLearningGaps(topic: string, answers: string): Promise<string> {
    return ollamaService.detectLearningGaps(topic, answers);
  }

  async generatePolicy(topic: string, audience: string, context?: string): Promise<string> {
    return ollamaService.generatePolicy(topic, audience, context);
  }

  async translateText(text: string, targetLang: string, sourceLang: string = 'auto'): Promise<string> {
    return ollamaService.translateText(text, targetLang, sourceLang);
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
  const provider = process.env.AI_PROVIDER || 'ollama';
  
  if (provider === 'gemini') {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      console.warn('Gemini API key not found, falling back to Ollama');
      return new OllamaProvider();
    }
    return new GeminiProvider(apiKey);
  }
  
  return new OllamaProvider();
}

// Export singleton instance
export const aiProvider = createAIProvider();
