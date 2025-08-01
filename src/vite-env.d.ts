/// <reference types="vite/client" />

interface ImportMetaEnv {
  // API Configuration
  readonly VITE_API_BASE_URL: string;
  readonly VITE_OPENAI_API_KEY: string;
  readonly VITE_OLLAMA_BASE_URL: string;
  readonly VITE_VECTOR_DB_URL: string;
  
  // App Configuration
  readonly VITE_APP_ENV: string;
  readonly VITE_DEBUG: string;
  
  // Feature Flags
  readonly VITE_ENABLE_ENHANCED_AI: string;
  readonly VITE_ENABLE_RAG: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Global process.env types for server-side and build-time variables
declare namespace NodeJS {
  interface ProcessEnv {
    // Core environment
    readonly NODE_ENV: 'development' | 'production' | 'test';
    
    // AI Provider Configuration
    readonly AI_PROVIDER: 'gemini' | 'openai' | 'ollama';
    readonly GEMINI_API_KEY?: string;
    readonly API_KEY?: string;
    readonly OPENAI_API_KEY?: string;
    readonly OLLAMA_BASE_URL: string;
    readonly OLLAMA_MODEL: string;
    readonly OLLAMA_CHAT_MODEL?: string;
    readonly OLLAMA_EMBEDDING_MODEL?: string;
    
    // Vector Database Configuration
    readonly VECTOR_DB_URL: string;
    readonly VECTOR_DB_PATH?: string;
    
    // Feature Flags
    readonly ENABLE_ENHANCED_AI: string;
    readonly ENABLE_RAG: string;
    readonly ENABLE_VECTOR_SEARCH: string;
    readonly ENABLE_STREAMING: string;
    
    // Frontend Variables (VITE_*)
    readonly VITE_API_BASE_URL?: string;
    readonly VITE_OPENAI_API_KEY?: string;
    readonly VITE_OLLAMA_BASE_URL?: string;
    readonly VITE_VECTOR_DB_URL?: string;
    readonly VITE_APP_ENV?: string;
    readonly VITE_DEBUG?: string;
    readonly VITE_ENABLE_ENHANCED_AI?: string;
    readonly VITE_ENABLE_RAG?: string;
  }
}