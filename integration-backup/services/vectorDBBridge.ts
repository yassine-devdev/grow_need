/**
 * Vector Database Bridge Service
 * Connects TypeScript frontend with Python vector database backend
 */

export interface VectorSearchResult {
  documents: string[][];
  metadatas: any[][];
  distances: number[][];
  ids: string[][];
}

export interface DocumentMetadata {
  title?: string;
  subject?: string;
  grade_level?: string;
  content_type?: string;
  description?: string;
  author?: string;
  [key: string]: any;
}

export interface UploadResult {
  success: boolean;
  document_id?: string;
  chunks_created?: number;
  metadata?: DocumentMetadata;
  error?: string;
}

export interface DatabaseStats {
  total_documents: number;
  collections: Record<string, any>;
  database_path: string;
  created_at: string;
}

export class VectorDBBridge {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl = 'http://localhost:5000', timeout = 30000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  /**
   * Test connection to vector database
   */
  async testConnection(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.baseUrl}/api/stats`, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.error('Vector DB connection test failed:', error);
      return false;
    }
  }

  /**
   * Search documents in the vector database
   */
  async searchDocuments(
    query: string,
    collection = 'educational_content',
    nResults = 5
  ): Promise<VectorSearchResult> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          collection,
          n_results: nResults,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Vector search failed:', error);
      throw new Error(`Vector search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload and process a document
   */
  async uploadDocument(
    file: File,
    metadata: DocumentMetadata = {},
    collection = 'educational_content'
  ): Promise<UploadResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('collection', collection);

      // Add metadata fields
      Object.entries(metadata).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/api/upload`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Upload failed: ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error('Document upload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats(): Promise<DatabaseStats> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${this.baseUrl}/api/stats`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to get stats: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get database stats:', error);
      throw error;
    }
  }

  /**
   * Get available collections
   */
  async getCollections(): Promise<string[]> {
    try {
      const stats = await this.getDatabaseStats();
      return Object.keys(stats.collections || {});
    } catch (error) {
      console.error('Failed to get collections:', error);
      return ['educational_content', 'lesson_plans', 'assessments'];
    }
  }

  /**
   * Search with enhanced context for RAG
   */
  async searchForRAG(
    query: string,
    options: {
      collection?: string;
      nResults?: number;
      includeMetadata?: boolean;
    } = {}
  ): Promise<{
    context: string;
    sources: Array<{ content: string; metadata: any; relevance: number }>;
  }> {
    const {
      collection = 'educational_content',
      nResults = 3,
      includeMetadata = true,
    } = options;

    try {
      const searchResult = await this.searchDocuments(query, collection, nResults);

      if (!searchResult.documents || !searchResult.documents[0]) {
        return { context: '', sources: [] };
      }

      const sources = searchResult.documents[0].map((doc, index) => ({
        content: doc,
        metadata: includeMetadata && searchResult.metadatas?.[0]?.[index] || {},
        relevance: searchResult.distances?.[0]?.[index] 
          ? Math.max(0, 1 - searchResult.distances[0][index]) 
          : 0,
      }));

      // Combine documents into context
      const context = sources
        .map((source, index) => `[Source ${index + 1}]: ${source.content}`)
        .join('\n\n');

      return { context, sources };
    } catch (error) {
      console.error('RAG search failed:', error);
      return { context: '', sources: [] };
    }
  }

  /**
   * Batch upload multiple files
   */
  async uploadMultipleDocuments(
    files: File[],
    metadata: DocumentMetadata = {},
    collection = 'educational_content',
    onProgress?: (completed: number, total: number) => void
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        const result = await this.uploadDocument(file, metadata, collection);
        results.push(result);
        
        if (onProgress) {
          onProgress(i + 1, files.length);
        }
      } catch (error) {
        results.push({
          success: false,
          error: `Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }

    return results;
  }

  /**
   * Health check for the vector database service
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    details: {
      connection: boolean;
      database: boolean;
      collections: number;
      totalDocuments: number;
    };
  }> {
    try {
      const connectionOk = await this.testConnection();
      
      if (!connectionOk) {
        return {
          status: 'unhealthy',
          details: {
            connection: false,
            database: false,
            collections: 0,
            totalDocuments: 0,
          },
        };
      }

      const stats = await this.getDatabaseStats();
      
      return {
        status: 'healthy',
        details: {
          connection: true,
          database: true,
          collections: Object.keys(stats.collections || {}).length,
          totalDocuments: stats.total_documents || 0,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          connection: false,
          database: false,
          collections: 0,
          totalDocuments: 0,
        },
      };
    }
  }
}

// Singleton instance
export const vectorDBBridge = new VectorDBBridge(
  process.env.VECTOR_DB_URL || 'http://localhost:5000'
);

export default vectorDBBridge;
