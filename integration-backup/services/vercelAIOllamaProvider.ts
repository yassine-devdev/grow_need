import { LanguageModelV1, LanguageModelV1StreamPart } from 'ai';

export interface OllamaConfig {
  baseURL?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export class VercelAIOllamaProvider implements LanguageModelV1 {
  readonly specificationVersion = 'v1';
  readonly provider = 'ollama';
  readonly modelId: string;
  readonly baseURL: string;
  readonly defaultObjectGenerationMode = 'json';

  constructor(
    modelId: string,
    config: OllamaConfig = {}
  ) {
    this.modelId = modelId;
    this.baseURL = config.baseURL ?? 'http://localhost:11434';
  }

  async doGenerate(options: any): Promise<any> {
    const { prompt, messages, temperature, maxTokens } = options;
    
    const requestBody = {
      model: this.modelId,
      messages: this.formatMessages(messages || [{ role: 'user', content: prompt }]),
      stream: false,
      options: {
        temperature: temperature ?? 0.7,
        num_predict: maxTokens ?? 1000,
      }
    };

    const response = await fetch(`${this.baseURL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      text: data.message?.content || '',
      finishReason: 'stop',
      usage: {
        promptTokens: data.prompt_eval_count || 0,
        completionTokens: data.eval_count || 0,
      },
    };
  }

  async doStream(options: any): Promise<ReadableStream<LanguageModelV1StreamPart>> {
    const { prompt, messages, temperature, maxTokens } = options;
    
    const requestBody = {
      model: this.modelId,
      messages: this.formatMessages(messages || [{ role: 'user', content: prompt }]),
      stream: true,
      options: {
        temperature: temperature ?? 0.7,
        num_predict: maxTokens ?? 1000,
      }
    };

    const response = await fetch(`${this.baseURL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    return new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.trim()) {
                try {
                  const data = JSON.parse(line);
                  if (data.message?.content) {
                    controller.enqueue({
                      type: 'text-delta',
                      textDelta: data.message.content,
                    });
                  }
                  if (data.done) {
                    controller.enqueue({
                      type: 'finish',
                      finishReason: 'stop',
                      usage: {
                        promptTokens: data.prompt_eval_count || 0,
                        completionTokens: data.eval_count || 0,
                      },
                    });
                  }
                } catch (e) {
                  // Skip invalid JSON lines
                }
              }
            }
          }
        } catch (error) {
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });
  }

  private formatMessages(messages: any[]): any[] {
    return messages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : msg.role,
      content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
    }));
  }
}

// Factory function to create Ollama providers
export function createOllama(config: OllamaConfig = {}) {
  return (modelId: string) => new VercelAIOllamaProvider(modelId, config);
}

// Pre-configured models
export const ollama = createOllama({
  baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
});

// Educational model configurations
export const educationalModels = {
  general: 'qwen2.5:3b-instruct',      // Best for general educational tasks
  math: 'qwen2.5:3b-instruct',         // Good for mathematical reasoning
  creative: 'llama2:latest',           // Best for creative writing
  coding: 'deepseek-coder:1.3b-instruct', // Best for programming
  analysis: 'gemma3:4b',               // Best for analysis tasks
  reasoning: 'nemotron-mini:4b'        // Best for logical reasoning
};

// Smart model selection based on task type
export function getOptimalModel(taskType: string): string {
  const modelMap: Record<string, string> = {
    'lesson-plan': educationalModels.general,
    'quiz-generation': educationalModels.general,
    'math-tutoring': educationalModels.math,
    'creative-writing': educationalModels.creative,
    'code-help': educationalModels.coding,
    'essay-grading': educationalModels.analysis,
    'problem-solving': educationalModels.reasoning,
    'general-chat': educationalModels.general,
  };
  
  return modelMap[taskType] || educationalModels.general;
}
