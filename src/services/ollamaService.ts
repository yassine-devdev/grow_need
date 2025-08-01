/**
 * Ollama AI Service
 * Provides a unified interface for all AI operations using local Ollama models
 */

export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OllamaGenerateOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  system?: string;
}

export interface OllamaResponse {
  text: string;
  model: string;
  created_at: string;
}

class OllamaService {
  private baseUrl: string;
  private defaultModel: string;

  constructor(baseUrl: string = 'http://localhost:11434', defaultModel: string = 'qwen2.5:3b-instruct') {
    this.baseUrl = baseUrl;
    this.defaultModel = defaultModel;
  }

  /**
   * Test connection to Ollama server
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch (error) {
      console.error('Ollama connection test failed:', error);
      return false;
    }
  }

  /**
   * Get list of available models
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }
      const data = await response.json();
      return data.models?.map((model: any) => model.name) || [];
    } catch (error) {
      console.error('Failed to get available models:', error);
      return [];
    }
  }

  /**
   * Generate content using Ollama
   */
  async generateContent(
    prompt: string, 
    options: OllamaGenerateOptions = {}
  ): Promise<OllamaResponse> {
    const model = options.model || this.defaultModel;
    
    try {
      const messages: OllamaMessage[] = [];
      
      // Add system message if provided
      if (options.system) {
        messages.push({ role: 'system', content: options.system });
      }
      
      // Add user prompt
      messages.push({ role: 'user', content: prompt });

      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          stream: false,
          options: {
            temperature: options.temperature || 0.7,
            num_predict: options.max_tokens || 2048,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        text: data.message.content,
        model: data.model,
        created_at: data.created_at
      };

    } catch (error) {
      console.error('Ollama generateContent error:', error);
      throw error;
    }
  }

  /**
   * Generate structured JSON response
   */
  async generateJSON(
    prompt: string,
    schema: any,
    options: OllamaGenerateOptions = {}
  ): Promise<any> {
    const systemPrompt = `${options.system || ''}\n\nIMPORTANT: You must respond with valid JSON only. No additional text or explanation. The JSON must match this schema: ${JSON.stringify(schema)}`;
    
    try {
      const response = await this.generateContent(prompt, {
        ...options,
        system: systemPrompt
      });

      // Try to parse JSON response
      try {
        return JSON.parse(response.text);
      } catch (parseError) {
        // If JSON parsing fails, try to extract JSON from the response
        const jsonMatch = response.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        throw new Error('Response is not valid JSON');
      }
    } catch (error) {
      console.error('Ollama generateJSON error:', error);
      throw error;
    }
  }

  /**
   * Analyze text sentiment and themes
   */
  async analyzeFeedback(feedbackText: string): Promise<{
    sentiment: string;
    summary: string;
    key_themes: string[];
    actionable_suggestions: string[];
  }> {
    const prompt = `Analyze the following feedback text and provide insights:

Feedback: "${feedbackText}"

Please analyze this feedback and provide:
1. Overall sentiment (Positive, Negative, Neutral, or Mixed)
2. A brief summary
3. Key themes mentioned
4. Actionable suggestions for improvement`;

    const schema = {
      sentiment: "string (Positive, Negative, Neutral, or Mixed)",
      summary: "string",
      key_themes: "array of strings",
      actionable_suggestions: "array of strings"
    };

    return this.generateJSON(prompt, schema, {
      system: "You are an expert in analyzing educational feedback and community sentiment."
    });
  }

  /**
   * Generate educational content
   */
  async generateEducationalContent(
    contentType: string,
    topic: string,
    gradeLevel: string,
    additionalRequirements?: string
  ): Promise<string> {
    const prompt = `Create a ${contentType} for ${gradeLevel} grade students on the topic: "${topic}".
    
    ${additionalRequirements ? `Additional requirements: ${additionalRequirements}` : ''}
    
    Please make it age-appropriate, engaging, and educationally valuable.`;

    const response = await this.generateContent(prompt, {
      system: "You are an experienced educator and curriculum designer. Create high-quality educational content that is engaging, age-appropriate, and pedagogically sound."
    });

    return response.text;
  }

  /**
   * Grade student work
   */
  async gradeSubmission(
    submission: string,
    rubric: string,
    additionalContext?: string
  ): Promise<string> {
    const prompt = `Grade the following student submission based on the provided rubric:

--- SUBMISSION ---
${submission}

--- RUBRIC ---
${rubric}

${additionalContext ? `--- ADDITIONAL CONTEXT ---\n${additionalContext}` : ''}

Please provide:
1. A score for each rubric criterion
2. An overall score/grade
3. Constructive feedback highlighting strengths
4. Specific areas for improvement
5. Suggestions for next steps

Format your response clearly using markdown.`;

    const response = await this.generateContent(prompt, {
      system: "You are an experienced teacher and grader. Provide fair, constructive, and helpful feedback that encourages student learning and improvement."
    });

    return response.text;
  }

  /**
   * Detect learning gaps
   */
  async detectLearningGaps(
    topic: string,
    studentAnswers: string
  ): Promise<string> {
    const prompt = `Analyze the following student answers for a quiz on "${topic}" and identify learning gaps:

Student Answers:
${studentAnswers}

Please identify:
1. Common misunderstandings or misconceptions
2. Knowledge gaps that need to be addressed
3. Specific teaching strategies to address each gap
4. Recommended resources or activities

Provide your analysis in a clear, actionable format.`;

    const response = await this.generateContent(prompt, {
      system: "You are an expert educational analyst specializing in identifying learning gaps and designing targeted interventions."
    });

    return response.text;
  }

  /**
   * Generate policy content
   */
  async generatePolicy(
    topic: string,
    audience: string,
    schoolContext?: string
  ): Promise<string> {
    const prompt = `Generate a comprehensive school policy on "${topic}" for ${audience}.

    ${schoolContext ? `School Context: ${schoolContext}` : ''}

    The policy should include:
    1. Purpose and scope
    2. Clear guidelines and procedures
    3. Responsibilities and expectations
    4. Consequences and enforcement
    5. Review and update procedures

    Make it professional, clear, and actionable.`;

    const response = await this.generateContent(prompt, {
      system: "You are an experienced school administrator and policy writer. Create comprehensive, fair, and legally sound school policies."
    });

    return response.text;
  }

  /**
   * Translate text
   */
  async translateText(
    text: string,
    targetLanguage: string,
    sourceLanguage: string = 'auto'
  ): Promise<string> {
    const prompt = `Translate the following text ${sourceLanguage !== 'auto' ? `from ${sourceLanguage}` : ''} to ${targetLanguage}:

"${text}"

Provide only the translation, maintaining the original tone and context.`;

    const response = await this.generateContent(prompt, {
      system: "You are a professional translator. Provide accurate, contextually appropriate translations that preserve the original meaning and tone."
    });

    return response.text;
  }
}

// Export singleton instance
export const ollamaService = new OllamaService();

// Export class for custom instances
export { OllamaService };
