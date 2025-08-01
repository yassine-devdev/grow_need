/**
 * Advanced File Processing Service
 * Handles real file processing for educational content with business logic
 */

export interface ProcessedFileResult {
  success: boolean;
  content: string;
  metadata: FileMetadata;
  chunks: string[];
  wordCount: number;
  readingLevel: number;
  topics: string[];
  error?: string;
}

export interface FileMetadata {
  filename: string;
  fileSize: number;
  mimeType: string;
  extension: string;
  processedAt: Date;
  language: string;
  encoding: string;
  pageCount?: number;
  author?: string;
  title?: string;
  subject?: string;
  gradeLevel?: string;
  educationalObjectives?: string[];
}

export interface ProcessingOptions {
  extractMetadata?: boolean;
  analyzeContent?: boolean;
  generateChunks?: boolean;
  chunkSize?: number;
  detectLanguage?: boolean;
  calculateReadingLevel?: boolean;
  extractTopics?: boolean;
}

class AdvancedFileProcessor {
  private readonly supportedFormats = [
    'text/plain',
    'text/csv',
    'application/json',
    'text/html',
    'text/markdown',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];

  /**
   * Process a file and extract content with metadata
   */
  async processFile(file: File, options: ProcessingOptions = {}): Promise<ProcessedFileResult> {
    try {
      // Validate file
      this.validateFile(file);

      // Extract basic metadata
      const metadata = await this.extractBasicMetadata(file);

      // Extract content based on file type
      const content = await this.extractContent(file);

      // Process content if requested
      let chunks: string[] = [];
      let wordCount = 0;
      let readingLevel = 0;
      let topics: string[] = [];

      if (options.generateChunks !== false) {
        chunks = this.generateChunks(content, options.chunkSize || 1000);
      }

      if (options.analyzeContent !== false) {
        wordCount = this.calculateWordCount(content);
        readingLevel = this.calculateReadingLevel(content);
        topics = this.extractTopics(content);
      }

      // Extract additional metadata if requested
      if (options.extractMetadata !== false) {
        const additionalMetadata = await this.extractAdvancedMetadata(file, content);
        Object.assign(metadata, additionalMetadata);
      }

      return {
        success: true,
        content,
        metadata,
        chunks,
        wordCount,
        readingLevel,
        topics
      };

    } catch (error) {
      return {
        success: false,
        content: '',
        metadata: await this.extractBasicMetadata(file),
        chunks: [],
        wordCount: 0,
        readingLevel: 0,
        topics: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Validate file format and size
   */
  private validateFile(file: File): void {
    if (!this.supportedFormats.includes(file.type)) {
      throw new Error(`Unsupported file format: ${file.type}`);
    }

    // 50MB limit
    if (file.size > 50 * 1024 * 1024) {
      throw new Error('File size exceeds 50MB limit');
    }

    if (file.size === 0) {
      throw new Error('File is empty');
    }
  }

  /**
   * Extract basic file metadata
   */
  private async extractBasicMetadata(file: File): Promise<FileMetadata> {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    
    return {
      filename: file.name,
      fileSize: file.size,
      mimeType: file.type,
      extension,
      processedAt: new Date(),
      language: 'en', // Default, can be detected later
      encoding: 'utf-8'
    };
  }

  /**
   * Extract content based on file type
   */
  private async extractContent(file: File): Promise<string> {
    switch (file.type) {
      case 'text/plain':
      case 'text/csv':
      case 'text/html':
      case 'text/markdown':
        return await this.extractTextContent(file);
      
      case 'application/json':
        return await this.extractJSONContent(file);
      
      case 'application/pdf':
        return await this.extractPDFContent(file);
      
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return await this.extractDocxContent(file);
      
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return await this.extractExcelContent(file);
      
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        return await this.extractPowerPointContent(file);
      
      default:
        throw new Error(`Content extraction not implemented for ${file.type}`);
    }
  }

  /**
   * Extract text content from text files
   */
  private async extractTextContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => reject(new Error('Failed to read text file'));
      reader.readAsText(file);
    });
  }

  /**
   * Extract and format JSON content
   */
  private async extractJSONContent(file: File): Promise<string> {
    const textContent = await this.extractTextContent(file);
    try {
      const jsonData = JSON.parse(textContent);
      return this.formatJSONForProcessing(jsonData);
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  }

  /**
   * Format JSON data for text processing
   */
  private formatJSONForProcessing(data: any): string {
    if (typeof data === 'string') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.formatJSONForProcessing(item)).join('\n');
    }

    if (typeof data === 'object' && data !== null) {
      return Object.entries(data)
        .map(([key, value]) => `${key}: ${this.formatJSONForProcessing(value)}`)
        .join('\n');
    }

    return String(data);
  }

  /**
   * Extract PDF content (placeholder - would need PDF.js or similar)
   */
  private async extractPDFContent(file: File): Promise<string> {
    // In a real implementation, you would use PDF.js or send to backend
    throw new Error('PDF processing requires backend service or PDF.js integration');
  }

  /**
   * Extract DOCX content (placeholder - would need docx library)
   */
  private async extractDocxContent(file: File): Promise<string> {
    // In a real implementation, you would use docx library or send to backend
    throw new Error('DOCX processing requires backend service or docx library');
  }

  /**
   * Extract Excel content using XLSX library
   */
  private async extractExcelContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (!data) {
            reject(new Error('Failed to read Excel file'));
            return;
          }

          // Import XLSX dynamically to avoid issues in test environment
          import('xlsx').then(XLSX => {
            const workbook = XLSX.read(data, { type: 'array' });
            let content = '';

            // Process all worksheets
            workbook.SheetNames.forEach((sheetName, index) => {
              const worksheet = workbook.Sheets[sheetName];

              // Add sheet header
              if (index > 0) content += '\n\n';
              content += `=== Sheet: ${sheetName} ===\n`;

              // Convert sheet to JSON for structured data
              const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

              // Process rows
              jsonData.forEach((row: any[]) => {
                if (Array.isArray(row) && row.length > 0) {
                  // Filter out empty cells and join with tabs
                  const rowContent = row
                    .map(cell => cell !== null && cell !== undefined ? String(cell).trim() : '')
                    .filter(cell => cell.length > 0)
                    .join('\t');

                  if (rowContent) {
                    content += rowContent + '\n';
                  }
                }
              });
            });

            resolve(content.trim());
          }).catch(error => {
            reject(new Error(`Failed to process Excel file: ${error.message}`));
          });
        } catch (error) {
          reject(new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      };

      reader.onerror = () => reject(new Error('Failed to read Excel file'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Extract PowerPoint content (placeholder)
   */
  private async extractPowerPointContent(_file: File): Promise<string> {
    throw new Error('PowerPoint processing requires backend service');
  }

  /**
   * Generate content chunks for processing
   */
  private generateChunks(content: string, chunkSize: number): string[] {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      const separator = currentChunk ? '. ' : '';
      const potentialChunk = currentChunk + separator + trimmedSentence;

      if (potentialChunk.length > chunkSize && currentChunk.length > 0) {
        // Add current chunk and start new one
        chunks.push(currentChunk.trim() + '.');
        currentChunk = trimmedSentence;
      } else {
        currentChunk = potentialChunk;
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim() + (currentChunk.trim().endsWith('.') ? '' : '.'));
    }

    return chunks;
  }

  /**
   * Calculate word count
   */
  private calculateWordCount(content: string): number {
    return content.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Calculate reading level using Flesch-Kincaid formula
   */
  private calculateReadingLevel(content: string): number {
    // Clean content and split into sentences
    const cleanContent = content.replace(/\s+/g, ' ').trim();
    const sentences = cleanContent.split(/[.!?]+/).filter(s => s.trim().length > 5);
    const words = cleanContent.split(/\s+/).filter(word => word.length > 0);

    if (sentences.length === 0 || words.length === 0) {
      return 1; // Minimum reading level
    }

    const syllables = words.reduce((count, word) => count + this.countSyllables(word), 0);
    const avgSentenceLength = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;

    // Flesch-Kincaid Grade Level formula
    const gradeLevel = 0.39 * avgSentenceLength + 11.8 * avgSyllablesPerWord - 15.59;

    return Math.max(1, Math.round(gradeLevel * 10) / 10);
  }

  /**
   * Count syllables in a word (simplified algorithm)
   */
  private countSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    const vowels = 'aeiouy';
    let syllableCount = 0;
    let previousWasVowel = false;

    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i]);
      if (isVowel && !previousWasVowel) {
        syllableCount++;
      }
      previousWasVowel = isVowel;
    }

    // Handle silent 'e'
    if (word.endsWith('e')) {
      syllableCount--;
    }

    return Math.max(1, syllableCount);
  }

  /**
   * Extract topics using keyword analysis
   */
  private extractTopics(content: string): string[] {
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);

    // Count word frequency
    const wordCount = words.reduce((count, word) => {
      count[word] = (count[word] || 0) + 1;
      return count;
    }, {} as Record<string, number>);

    // Filter out common words
    const commonWords = new Set([
      'this', 'that', 'with', 'have', 'will', 'from', 'they', 'know',
      'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when',
      'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over',
      'such', 'take', 'than', 'them', 'well', 'were', 'what', 'your'
    ]);

    const topics = Object.entries(wordCount)
      .filter(([word, count]) => !commonWords.has(word) && count >= 2)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);

    return topics;
  }

  /**
   * Extract advanced metadata from content
   */
  private async extractAdvancedMetadata(_file: File, content: string): Promise<Partial<FileMetadata>> {
    const metadata: Partial<FileMetadata> = {};

    // Try to extract title from content
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length > 0) {
      metadata.title = lines[0].trim().substring(0, 100);
    }

    // Detect educational content patterns
    const educationalKeywords = [
      'lesson', 'objective', 'learning', 'student', 'grade', 'curriculum',
      'assessment', 'activity', 'homework', 'quiz', 'test', 'project'
    ];

    const contentLower = content.toLowerCase();
    const foundKeywords = educationalKeywords.filter(keyword => 
      contentLower.includes(keyword)
    );

    if (foundKeywords.length > 0) {
      metadata.subject = 'Education';
    }

    // Try to extract grade level
    const gradeMatches = content.match(/(\d+)(st|nd|rd|th)?\s*grade/gi);
    if (gradeMatches && gradeMatches.length > 0) {
      metadata.gradeLevel = gradeMatches[0];
    }

    // Extract learning objectives
    const objectiveMatches = content.match(/(?:objective|goal|aim)s?:?\s*([^\n]+)/gi);
    if (objectiveMatches) {
      metadata.educationalObjectives = objectiveMatches.map(match => 
        match.replace(/^(?:objective|goal|aim)s?:?\s*/i, '').trim()
      );
    }

    return metadata;
  }

  /**
   * Get supported file formats
   */
  getSupportedFormats(): string[] {
    return [...this.supportedFormats];
  }

  /**
   * Check if file format is supported
   */
  isFormatSupported(mimeType: string): boolean {
    return this.supportedFormats.includes(mimeType);
  }

  /**
   * Get file processing statistics
   */
  getProcessingStats(result: ProcessedFileResult): Record<string, any> {
    return {
      fileSize: result.metadata.fileSize,
      wordCount: result.wordCount,
      chunkCount: result.chunks.length,
      readingLevel: result.readingLevel,
      topicCount: result.topics.length,
      processingTime: new Date().getTime() - result.metadata.processedAt.getTime(),
      success: result.success
    };
  }
}

export const advancedFileProcessor = new AdvancedFileProcessor();
