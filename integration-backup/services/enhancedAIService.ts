import { generateText, generateObject, streamText, StreamTextResult } from 'ai';
import { ollama, getOptimalModel, educationalModels } from './vercelAIOllamaProvider';
import { z } from 'zod';

export interface StreamingOptions {
  onChunk?: (chunk: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

export interface EducationalContext {
  studentLevel?: string;
  subject?: string;
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  language?: string;
}

export class EnhancedAIService {
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:11434') {
    this.baseURL = baseURL;
  }

  // Enhanced streaming text generation
  async generateStreamingContent(
    prompt: string,
    options: StreamingOptions & { 
      taskType?: string;
      context?: EducationalContext;
      systemPrompt?: string;
    } = {}
  ): Promise<string> {
    const model = getOptimalModel(options.taskType || 'general-chat');
    const systemPrompt = options.systemPrompt || this.getSystemPrompt(options.taskType, options.context);

    try {
      const result = await streamText({
        model: ollama(model),
        system: systemPrompt,
        prompt: prompt,
        temperature: 0.7,
        maxTokens: 2000,
      });

      let fullText = '';

      for await (const delta of result.textStream) {
        fullText += delta;
        options.onChunk?.(delta);
      }

      options.onComplete?.(fullText);
      return fullText;

    } catch (error) {
      const err = error as Error;
      options.onError?.(err);
      throw err;
    }
  }

  // Enhanced object generation with schemas
  async generateStructuredContent<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    options: {
      taskType?: string;
      context?: EducationalContext;
      systemPrompt?: string;
    } = {}
  ): Promise<T> {
    const model = getOptimalModel(options.taskType || 'general-chat');
    const systemPrompt = options.systemPrompt || this.getSystemPrompt(options.taskType, options.context);

    const result = await generateObject({
      model: ollama(model),
      system: systemPrompt,
      prompt: prompt,
      schema: schema,
      temperature: 0.3, // Lower temperature for structured output
    });

    return result.object;
  }

  // Educational-specific methods with streaming
  async generateInteractiveLessonPlan(
    subject: string,
    grade: string,
    topic: string,
    duration: string,
    options: StreamingOptions = {}
  ): Promise<any> {
    const schema = z.object({
      title: z.string(),
      objectives: z.array(z.string()),
      materials: z.array(z.string()),
      activities: z.array(z.object({
        name: z.string(),
        duration: z.string(),
        description: z.string(),
        type: z.enum(['individual', 'group', 'discussion', 'hands-on'])
      })),
      assessment: z.object({
        formative: z.array(z.string()),
        summative: z.array(z.string())
      }),
      differentiation: z.array(z.string()),
      homework: z.string().optional()
    });

    const prompt = `Create a comprehensive lesson plan for ${grade} grade ${subject} on the topic "${topic}" with a duration of ${duration}. Include interactive activities, assessment strategies, and differentiation for diverse learners.`;

    return await this.generateStructuredContent(prompt, schema, {
      taskType: 'lesson-plan',
      context: { studentLevel: grade, subject }
    });
  }

  async generateInteractiveQuiz(
    topic: string,
    difficulty: string,
    questionCount: number,
    questionTypes: string[] = ['multiple-choice', 'true-false', 'short-answer'],
    options: StreamingOptions = {}
  ): Promise<any> {
    const schema = z.object({
      title: z.string(),
      instructions: z.string(),
      questions: z.array(z.object({
        id: z.number(),
        type: z.enum(['multiple-choice', 'true-false', 'short-answer', 'essay']),
        question: z.string(),
        options: z.array(z.string()).optional(),
        correctAnswer: z.string(),
        explanation: z.string(),
        points: z.number(),
        difficulty: z.enum(['easy', 'medium', 'hard'])
      })),
      totalPoints: z.number(),
      timeLimit: z.string().optional()
    });

    const prompt = `Create an interactive quiz on "${topic}" with ${questionCount} questions at ${difficulty} difficulty level. Include question types: ${questionTypes.join(', ')}. Provide clear explanations for each answer.`;

    return await this.generateStructuredContent(prompt, schema, {
      taskType: 'quiz-generation',
      context: { difficulty: difficulty as any }
    });
  }

  async generatePersonalizedTutoring(
    question: string,
    studentLevel: string,
    subject: string,
    learningStyle: string,
    options: StreamingOptions = {}
  ): Promise<string> {
    const prompt = `A ${studentLevel} student in ${subject} with a ${learningStyle} learning style asks: "${question}". Provide personalized tutoring guidance using the Socratic method. Don't give direct answers - guide them to discover the solution.`;

    return await this.generateStreamingContent(prompt, {
      ...options,
      taskType: 'math-tutoring',
      context: {
        studentLevel,
        subject,
        learningStyle: learningStyle as any
      }
    });
  }

  async generateAssessmentRubric(
    assignmentType: string,
    subject: string,
    grade: string,
    criteria: string[],
    options: StreamingOptions = {}
  ): Promise<any> {
    const schema = z.object({
      title: z.string(),
      description: z.string(),
      criteria: z.array(z.object({
        name: z.string(),
        description: z.string(),
        levels: z.array(z.object({
          level: z.string(),
          points: z.number(),
          description: z.string()
        }))
      })),
      totalPoints: z.number(),
      gradingScale: z.object({
        A: z.string(),
        B: z.string(),
        C: z.string(),
        D: z.string(),
        F: z.string()
      })
    });

    const prompt = `Create a detailed assessment rubric for a ${assignmentType} in ${grade} grade ${subject}. Include criteria: ${criteria.join(', ')}. Use a 4-point scale (Excellent, Good, Satisfactory, Needs Improvement).`;

    return await this.generateStructuredContent(prompt, schema, {
      taskType: 'essay-grading',
      context: { studentLevel: grade, subject }
    });
  }

  async generateParentReport(
    studentName: string,
    subject: string,
    period: string,
    achievements: string[],
    challenges: string[],
    options: StreamingOptions = {}
  ): Promise<string> {
    const prompt = `Generate a comprehensive parent report for ${studentName} in ${subject} for the ${period}. Achievements: ${achievements.join(', ')}. Areas for improvement: ${challenges.join(', ')}. Include specific recommendations for home support.`;

    return await this.generateStreamingContent(prompt, {
      ...options,
      taskType: 'general-chat',
      systemPrompt: 'You are a professional educator writing a detailed, constructive parent report. Be specific, encouraging, and provide actionable recommendations.'
    });
  }

  // System prompt generator based on task type and context
  private getSystemPrompt(taskType?: string, context?: EducationalContext): string {
    const basePrompt = "You are an expert educational AI assistant with deep knowledge of pedagogy, curriculum design, and student learning.";
    
    const taskPrompts: Record<string, string> = {
      'lesson-plan': `${basePrompt} You specialize in creating engaging, standards-aligned lesson plans that incorporate diverse teaching strategies and assessment methods.`,
      'quiz-generation': `${basePrompt} You excel at creating fair, comprehensive assessments that accurately measure student understanding while being engaging and appropriately challenging.`,
      'math-tutoring': `${basePrompt} You are a patient math tutor who uses the Socratic method to guide students to discover solutions themselves. You adapt your explanations to different learning styles.`,
      'creative-writing': `${basePrompt} You inspire creativity while teaching proper writing techniques. You provide constructive feedback that encourages students to express themselves authentically.`,
      'code-help': `${basePrompt} You are a programming instructor who teaches coding concepts through practical examples and encourages best practices and problem-solving skills.`,
      'essay-grading': `${basePrompt} You provide detailed, constructive feedback on student writing, focusing on both content and mechanics while maintaining an encouraging tone.`,
      'problem-solving': `${basePrompt} You guide students through complex problems step-by-step, helping them develop critical thinking and analytical skills.`,
      'general-chat': `${basePrompt} You are helpful, encouraging, and adapt your communication style to the student's level and needs.`
    };

    let prompt = taskPrompts[taskType || 'general-chat'] || taskPrompts['general-chat'];

    if (context) {
      if (context.studentLevel) {
        prompt += ` You are working with ${context.studentLevel} level students.`;
      }
      if (context.subject) {
        prompt += ` The subject area is ${context.subject}.`;
      }
      if (context.learningStyle) {
        prompt += ` Adapt your response for ${context.learningStyle} learners.`;
      }
      if (context.difficulty) {
        prompt += ` Adjust the complexity to ${context.difficulty} level.`;
      }
      if (context.language && context.language !== 'en') {
        prompt += ` Respond in ${context.language}.`;
      }
    }

    return prompt;
  }

  // Health check for the service
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/api/tags`);
      return response.ok;
    } catch {
      return false;
    }
  }

  // Get available models
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/tags`);
      const data = await response.json();
      return data.models?.map((model: any) => model.name) || [];
    } catch {
      return Object.values(educationalModels);
    }
  }
}

// Export singleton instance
export const enhancedAI = new EnhancedAIService();
