#!/usr/bin/env node

/**
 * Ollama Health Check Script
 * Monitors Ollama service and provides helpful status information
 */

import http from 'http';

const OLLAMA_URL = 'http://localhost:11434';
const CHECK_INTERVAL = 5000; // 5 seconds
const REQUIRED_MODELS = ['qwen2.5:3b-instruct', 'nomic-embed-text'];

let isFirstCheck = true;
let lastStatus = null;

function colorLog(message, color = 'white') {
  const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m'
  };
  
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkOllamaHealth() {
  return new Promise((resolve) => {
    const req = http.get(`${OLLAMA_URL}/api/tags`, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const models = JSON.parse(data);
          resolve({ 
            status: 'running', 
            models: models.models || [],
            modelCount: models.models ? models.models.length : 0
          });
        } catch (e) {
          resolve({ status: 'error', error: 'Invalid response from Ollama' });
        }
      });
    });
    
    req.on('error', () => {
      resolve({ status: 'not_running' });
    });
    
    req.setTimeout(3000, () => {
      req.destroy();
      resolve({ status: 'timeout' });
    });
  });
}

function checkRequiredModels(models) {
  const modelNames = models.map(m => m.name);
  const missing = REQUIRED_MODELS.filter(required => 
    !modelNames.some(name => name.includes(required))
  );
  return { available: modelNames, missing };
}

async function monitorOllama() {
  const health = await checkOllamaHealth();
  const timestamp = new Date().toLocaleTimeString();
  
  // Only log status changes or first check
  if (isFirstCheck || health.status !== lastStatus) {
    switch (health.status) {
      case 'running':
        colorLog(`[${timestamp}] ✅ Ollama is running with ${health.modelCount} models`, 'green');
        
        if (health.models.length > 0) {
          const modelCheck = checkRequiredModels(health.models);
          
          if (modelCheck.missing.length === 0) {
            colorLog(`[${timestamp}] ✅ All required models are available`, 'green');
          } else {
            colorLog(`[${timestamp}] ⚠️  Missing models: ${modelCheck.missing.join(', ')}`, 'yellow');
            colorLog(`[${timestamp}] 💡 Install with: ollama pull ${modelCheck.missing[0]}`, 'cyan');
          }
        }
        break;
        
      case 'not_running':
        colorLog(`[${timestamp}] ❌ Ollama is not running`, 'red');
        colorLog(`[${timestamp}] 💡 Start with: ollama serve`, 'cyan');
        break;
        
      case 'timeout':
        colorLog(`[${timestamp}] ⏱️  Ollama connection timeout`, 'yellow');
        break;
        
      case 'error':
        colorLog(`[${timestamp}] ❌ Ollama error: ${health.error}`, 'red');
        break;
    }
    
    lastStatus = health.status;
    isFirstCheck = false;
  }
}

// Initial check
colorLog('🤖 Starting Ollama health monitor...', 'cyan');
monitorOllama();

// Periodic checks
setInterval(monitorOllama, CHECK_INTERVAL);

// Graceful shutdown
process.on('SIGINT', () => {
  colorLog('\n👋 Ollama monitor stopped', 'cyan');
  process.exit(0);
});

process.on('SIGTERM', () => {
  colorLog('\n👋 Ollama monitor stopped', 'cyan');
  process.exit(0);
});
