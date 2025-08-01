/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_OPENAI_API_KEY: string;
  readonly VITE_OLLAMA_BASE_URL: string;
  readonly VITE_VECTOR_DB_URL: string;
  readonly VITE_APP_ENV: string;
  readonly VITE_DEBUG: string;
  // Add more environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}