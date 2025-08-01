import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      // Plugins for bundle analysis
      plugins: [
        // Bundle analyzer (only in build mode)
        mode === 'production' && visualizer({
          filename: 'dist/bundle-analysis.html',
          open: false,
          gzipSize: true,
          brotliSize: true,
          template: 'treemap' // 'treemap', 'sunburst', 'network'
        })
      ].filter(Boolean),
      // Performance optimizations
      optimizeDeps: {
        include: [
          'react',
          'react-dom',
          'ai',
          '@ai-sdk/openai',
          'lucide-react',
          'recharts'
        ],
        exclude: ['@types/node']
      },

      // Advanced Build Optimizations
      build: {
        target: 'esnext',
        minify: 'terser',
        sourcemap: false,
        rollupOptions: {
          treeshake: {
            moduleSideEffects: false,
            propertyReadSideEffects: false,
            tryCatchDeoptimization: false
          },
          output: {
            // Advanced chunking strategy
            manualChunks: (id) => {
              // Core React ecosystem
              if (id.includes('node_modules')) {
                // React core (keep small and separate)
                if (id.includes('react/') || id.includes('react-dom/')) {
                  return 'react-core';
                }

                // React ecosystem
                if (id.includes('react-') || id.includes('@react')) {
                  return 'react-ecosystem';
                }

                // AI/ML libraries
                if (id.includes('ai') || id.includes('@ai-sdk') || id.includes('openai')) {
                  return 'ai-libs';
                }

                // UI libraries (icons, charts, etc.)
                if (id.includes('lucide-react') || id.includes('recharts') || id.includes('framer-motion')) {
                  return 'ui-libs';
                }

                // Agentic tools
                if (id.includes('@pimzino/agentic-tools-mcp')) {
                  return 'agentic-tools';
                }

                // Utility libraries
                if (id.includes('lodash') || id.includes('date-fns') || id.includes('uuid')) {
                  return 'utils';
                }

                // Other vendor libraries
                return 'vendor-misc';
              }

              // Application modules - intelligent splitting

              // Core infrastructure
              if (id.includes('/services/') || id.includes('/hooks/') || id.includes('/utils/')) {
                return 'app-core';
              }

              // UI components (shared across modules)
              if (id.includes('/components/ui/') || id.includes('/components/common/') || id.includes('/components/layout/')) {
                return 'ui-shared';
              }

              // Icons (used everywhere)
              if (id.includes('/components/icons/')) {
                return 'icons';
              }

              // School Hub - split into logical sub-modules
              if (id.includes('/modules/school-hub/')) {
                if (id.includes('/school/') || id.includes('/administration/')) {
                  return 'school-admin';
                }
                if (id.includes('/teacher/') || id.includes('/student/')) {
                  return 'school-academic';
                }
                if (id.includes('/finance/') || id.includes('/marketing/')) {
                  return 'school-business';
                }
                if (id.includes('/parent/') || id.includes('/games/')) {
                  return 'school-community';
                }
                return 'school-hub-core';
              }

              // CRM module
              if (id.includes('/modules/crm/')) {
                return 'crm-module';
              }

              // Analytics module
              if (id.includes('/modules/analytics/')) {
                return 'analytics-module';
              }

              // Concierge AI module
              if (id.includes('/modules/concierge/')) {
                return 'concierge-module';
              }

              // Agentic components
              if (id.includes('/components/agentic/')) {
                return 'agentic-components';
              }

              // Other modules
              if (id.includes('/modules/')) {
                return 'modules-misc';
              }

              // Overlays
              if (id.includes('/overlays/')) {
                return 'overlays';
              }

              // Main app chunk for everything else
              return 'app-main';
            },

            // Optimize chunk naming
            chunkFileNames: 'assets/[name]-[hash].js',

            // Optimize asset naming
            assetFileNames: 'assets/[name]-[hash].[ext]',
            entryFileNames: 'assets/[name]-[hash].js',
          },

          // External dependencies (if needed)
          external: [],
        },

        // Terser options for better minification
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
            passes: 2
          },
          mangle: {
            safari10: true
          },
          format: {
            comments: false
          }
        },

        // Chunk size warning limit
        chunkSizeWarningLimit: 500,

        // Enable CSS code splitting
        cssCodeSplit: true,

        // Optimize dependencies
        commonjsOptions: {
          include: [/node_modules/],
          transformMixedEsModules: true
        }
      },

      // Development server optimizations
      server: {
        hmr: {
          overlay: false // Disable error overlay for faster development
        }
      },

      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.OLLAMA_BASE_URL': JSON.stringify(env.OLLAMA_BASE_URL || 'http://localhost:11434'),
        'process.env.OLLAMA_MODEL': JSON.stringify(env.OLLAMA_MODEL || 'qwen2.5:3b-instruct'),
        'process.env.AI_PROVIDER': JSON.stringify(env.AI_PROVIDER || 'ollama'),
        // Enhanced AI environment variables
        'process.env.VECTOR_DB_URL': JSON.stringify(env.VECTOR_DB_URL || 'http://localhost:5000'),
        'process.env.ENABLE_ENHANCED_AI': JSON.stringify(env.ENABLE_ENHANCED_AI || 'true'),
        'process.env.ENABLE_RAG': JSON.stringify(env.ENABLE_RAG || 'true')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
