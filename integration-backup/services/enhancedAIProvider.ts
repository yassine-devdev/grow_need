/**
 * Enhanced AI Provider with Vector Database Integration
 * Combines existing AI capabilities with RAG (Retrieval Augmented Generation)
 */

import { vectorDBBridge, VectorDBBridge } from './vectorDBBridge';
import { EnhancedAIService } from './enhancedAIService';

export interface RAGOptions {
  useRAG?: boolean;
  collection?: string;
  maxContext?: number;
  includeMetadata?: boolean;
  contextWeight?: number;
}

export interface EnhancedGenerationOptions extends RAGOptions {
  taskType?: string;
  context?: any;
  onChunk?: (chunk: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GenerationResult {
  content: string;
  sources?: Array<{
    content: string;
    metadata: any;
    relevance: number;
  }>;
  metadata: {
    usedRAG: boolean;
    responseTime: number;
    tokensGenerated?: number;
    sourcesUsed: number;
  };
}

export class EnhancedAIProvider {
  private vectorDB: VectorDBBridge;
  private enhancedAI: EnhancedAIService;
  private isVectorDBAvailable: boolean = false;

  constructor(vectorDBUrl?: string) {
    this.vectorDB = vectorDBUrl ? new VectorDBBridge(vectorDBUrl) : vectorDBBridge;
    this.enhancedAI = new EnhancedAIService();
    this.checkVectorDBAvailability();
  }

  /**
   * Check if vector database is available
   */
  private async checkVectorDBAvailability(): Promise<void> {
    try {
      this.isVectorDBAvailable = await this.vectorDB.testConnection();
    } catch (error) {
      console.warn('Vector database not available, falling back to standard AI generation');
      this.isVectorDBAvailable = false;
    }
  }

  /**
   * Generate content with optional RAG enhancement
   */
  async generateContent(
    prompt: string,
    options: EnhancedGenerationOptions = {}
  ): Promise<GenerationResult> {
    const startTime = Date.now();
    const {
      useRAG = true,
      collection = 'educational_content',
      maxContext = 3,
      includeMetadata = true,
      ...aiOptions
    } = options;

    let sources: any[] = [];
    let enhancedPrompt = prompt;
    let usedRAG = false;

    // Try to enhance with RAG if available and requested
    if (useRAG && this.isVectorDBAvailable) {
      try {
        const ragResult = await this.vectorDB.searchForRAG(prompt, {
          collection,
          nResults: maxContext,
          includeMetadata,
        });

        if (ragResult.context) {
          enhancedPrompt = this.buildRAGPrompt(prompt, ragResult.context);
          sources = ragResult.sources;
          usedRAG = true;
        }
      } catch (error) {
        console.warn('RAG enhancement failed, using standard generation:', error);
        // Continue with standard generation
      }
    }

    // Generate content using enhanced AI service
    try {
      const content = await this.enhancedAI.generateStreamingContent(
        enhancedPrompt,
        aiOptions
      );

      const responseTime = Date.now() - startTime;

      return {
        content,
        sources: usedRAG ? sources : undefined,
        metadata: {
          usedRAG,
          responseTime,
          sourcesUsed: sources.length,
        },
      };
    } catch (error) {
      console.error('Content generation failed:', error);
      throw new Error(`Content generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate streaming content with RAG
   */
  async generateStreamingContent(
    prompt: string,
    options: EnhancedGenerationOptions = {}
  ): Promise<string> {
    const {
      useRAG = true,
      collection = 'educational_content',
      maxContext = 3,
      onChunk,
      onComplete,
      onError,
      ...aiOptions
    } = options;

    let enhancedPrompt = prompt;

    // Enhance with RAG if available
    if (useRAG && this.isVectorDBAvailable) {
      try {
        const ragResult = await this.vectorDB.searchForRAG(prompt, {
          collection,
          nResults: maxContext,
        });

        if (ragResult.context) {
          enhancedPrompt = this.buildRAGPrompt(prompt, ragResult.context);
        }
      } catch (error) {
        console.warn('RAG enhancement failed for streaming:', error);
      }
    }

    // Generate streaming content
    return this.enhancedAI.generateStreamingContent(enhancedPrompt, {
      ...aiOptions,
      onChunk,
      onComplete,
      onError,
    });
  }

  /**
   * Generate educational content with specialized prompts
   */
  async generateEducationalContent(
    type: 'lesson-plan' | 'quiz' | 'assessment' | 'activity',
    parameters: any,
    options: EnhancedGenerationOptions = {}
  ): Promise<GenerationResult> {
    const { useRAG = true, collection } = options;

    // Determine appropriate collection based on content type
    const targetCollection = collection || this.getCollectionForType(type);

    let content: any;

    switch (type) {
      case 'lesson-plan':
        content = await this.generateLessonPlan(parameters, { ...options, collection: targetCollection });
        break;
      case 'quiz':
        content = await this.generateQuiz(parameters, { ...options, collection: targetCollection });
        break;
      case 'assessment':
        content = await this.generateAssessment(parameters, { ...options, collection: targetCollection });
        break;
      case 'activity':
        content = await this.generateActivity(parameters, { ...options, collection: targetCollection });
        break;
      default:
        throw new Error(`Unsupported educational content type: ${type}`);
    }

    return content;
  }

  /**
   * Generate lesson plan with RAG enhancement
   */
  private async generateLessonPlan(
    parameters: {
      subject: string;
      grade: string;
      topic: string;
      duration: string;
    },
    options: EnhancedGenerationOptions = {}
  ): Promise<GenerationResult> {
    const { subject, grade, topic, duration } = parameters;
    
    const prompt = `Create a comprehensive lesson plan for ${grade} grade ${subject} on the topic "${topic}" with a duration of ${duration}. Include learning objectives, materials needed, step-by-step activities, assessment strategies, and differentiation for diverse learners.`;

    return this.generateContent(prompt, {
      ...options,
      taskType: 'lesson-plan',
      context: { studentLevel: grade, subject },
    });
  }

  /**
   * Generate quiz with RAG enhancement
   */
  private async generateQuiz(
    parameters: {
      topic: string;
      difficulty: string;
      questionCount: number;
      questionTypes?: string[];
    },
    options: EnhancedGenerationOptions = {}
  ): Promise<GenerationResult> {
    const { topic, difficulty, questionCount, questionTypes = [] } = parameters;
    
    const prompt = `Create an interactive quiz on "${topic}" with ${questionCount} questions at ${difficulty} difficulty level. ${questionTypes.length > 0 ? `Include question types: ${questionTypes.join(', ')}.` : ''} Provide clear explanations for each answer.`;

    return this.generateContent(prompt, {
      ...options,
      taskType: 'quiz-generation',
      context: { difficulty },
    });
  }

  /**
   * Generate assessment rubric
   */
  private async generateAssessment(
    parameters: {
      assignmentType: string;
      subject: string;
      grade: string;
      criteria: string[];
    },
    options: EnhancedGenerationOptions = {}
  ): Promise<GenerationResult> {
    const { assignmentType, subject, grade, criteria } = parameters;
    
    const prompt = `Create a detailed assessment rubric for a ${assignmentType} in ${grade} grade ${subject}. Include criteria: ${criteria.join(', ')}. Use a 4-point scale (Excellent, Good, Satisfactory, Needs Improvement).`;

    return this.generateContent(prompt, {
      ...options,
      taskType: 'essay-grading',
      context: { studentLevel: grade, subject },
    });
  }

  /**
   * Generate learning activity
   */
  private async generateActivity(
    parameters: {
      subject: string;
      grade: string;
      topic: string;
      activityType?: string;
    },
    options: EnhancedGenerationOptions = {}
  ): Promise<GenerationResult> {
    const { subject, grade, topic, activityType = 'hands-on' } = parameters;
    
    const prompt = `Create a ${activityType} learning activity for ${grade} grade ${subject} on the topic "${topic}". Include clear instructions, materials needed, learning objectives, and assessment criteria.`;

    return this.generateContent(prompt, {
      ...options,
      taskType: 'general-chat',
      context: { studentLevel: grade, subject },
    });
  }

  /**
   * Build RAG-enhanced prompt
   */
  private buildRAGPrompt(originalPrompt: string, context: string): string {
    return `Context Information:
${context}

Based on the above context and your knowledge, please respond to the following:

${originalPrompt}

Please provide a comprehensive response that incorporates relevant information from the context while adding your own expertise.`;
  }

  /**
   * Get appropriate collection for content type
   */
  private getCollectionForType(type: string): string {
    const collectionMap: Record<string, string> = {
      'lesson-plan': 'lesson_plans',
      'quiz': 'assessments',
      'assessment': 'assessments',
      'activity': 'educational_content',
    };

    return collectionMap[type] || 'educational_content';
  }

  /**
   * Upload educational content to vector database
   */
  async uploadContent(
    file: File,
    metadata: {
      title?: string;
      subject?: string;
      grade_level?: string;
      content_type?: string;
      description?: string;
    } = {}
  ): Promise<{ success: boolean; document_id?: string; error?: string }> {
    if (!this.isVectorDBAvailable) {
      return {
        success: false,
        error: 'Vector database not available',
      };
    }

    try {
      const result = await this.vectorDB.uploadDocument(file, metadata);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Search educational content
   */
  async searchContent(
    query: string,
    collection = 'educational_content',
    maxResults = 5
  ): Promise<{
    results: Array<{
      content: string;
      metadata: any;
      relevance: number;
    }>;
    totalFound: number;
  }> {
    if (!this.isVectorDBAvailable) {
      return { results: [], totalFound: 0 };
    }

    try {
      const searchResult = await this.vectorDB.searchForRAG(query, {
        collection,
        nResults: maxResults,
      });

      return {
        results: searchResult.sources,
        totalFound: searchResult.sources.length,
      };
    } catch (error) {
      console.error('Content search failed:', error);
      return { results: [], totalFound: 0 };
    }
  }

  /**
   * Get system health status
   */
  async getHealthStatus(): Promise<{
    ai: boolean;
    vectorDB: boolean;
    overall: 'healthy' | 'degraded' | 'unhealthy';
  }> {
    const aiHealthy = await this.enhancedAI.checkConnection();
    const vectorDBHealthy = await this.vectorDB.testConnection();

    let overall: 'healthy' | 'degraded' | 'unhealthy';
    if (aiHealthy && vectorDBHealthy) {
      overall = 'healthy';
    } else if (aiHealthy || vectorDBHealthy) {
      overall = 'degraded';
    } else {
      overall = 'unhealthy';
    }

    return {
      ai: aiHealthy,
      vectorDB: vectorDBHealthy,
      overall,
    };
  }
}

// Export singleton instance
export const enhancedAIProvider = new EnhancedAIProvider();

export default enhancedAIProvider;
