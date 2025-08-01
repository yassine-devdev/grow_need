/**
 * Example component showing how to use the environment service
 * This demonstrates graceful handling of missing API keys and environment-specific behavior
 */

import React, { useEffect, useState } from 'react';
import { envService } from '../../services/environmentService';

interface EnvironmentStatusProps {
  className?: string;
}

export const EnvironmentStatus: React.FC<EnvironmentStatusProps> = ({ className = '' }) => {
  const [config, setConfig] = useState(envService.getConfig());
  const [featureFlags, setFeatureFlags] = useState(envService.getFeatureFlags());
  const [aiConfig, setAiConfig] = useState(envService.getAIProviderConfig());

  useEffect(() => {
    envService.initialize();
    // Refresh config in case it changed
    setConfig(envService.getConfig());
    setFeatureFlags(envService.getFeatureFlags());
    setAiConfig(envService.getAIProviderConfig());
  }, []);

  const getStatusIcon = (available: boolean) => available ? '✅' : '❌';

  return (
    <div className={`environment-status ${className}`}>
      <h3>🔧 Environment Status</h3>
      
      <div className="env-section">
        <h4>Environment</h4>
        <p>Mode: <strong>{config.NODE_ENV}</strong></p>
        <p>Debug: {getStatusIcon(config.DEBUG)} {config.DEBUG ? 'Enabled' : 'Disabled'}</p>
      </div>

      <div className="env-section">
        <h4>AI Provider</h4>
        <p>Provider: <strong>{aiConfig.provider}</strong></p>
        <p>Status: {getStatusIcon(aiConfig.available)} {aiConfig.available ? 'Available' : 'Unavailable'}</p>
        {!aiConfig.available && aiConfig.reason && (
          <p className="warning">⚠️ {aiConfig.reason}</p>
        )}
      </div>

      <div className="env-section">
        <h4>Features</h4>
        <p>Enhanced AI: {getStatusIcon(featureFlags.enhancedAI)} {featureFlags.enhancedAI ? 'Enabled' : 'Disabled'}</p>
        <p>RAG: {getStatusIcon(featureFlags.rag)} {featureFlags.rag ? 'Enabled' : 'Disabled'}</p>
        <p>Vector Search: {getStatusIcon(featureFlags.vectorSearch)} {featureFlags.vectorSearch ? 'Enabled' : 'Disabled'}</p>
        <p>Streaming: {getStatusIcon(featureFlags.streaming)} {featureFlags.streaming ? 'Enabled' : 'Disabled'}</p>
      </div>

      {!featureFlags.enhancedAI && (
        <div className="env-warning">
          <p>⚠️ AI features are disabled. Check your API key configuration in .env file.</p>
        </div>
      )}

      {envService.isDevelopment() && (
        <div className="env-dev-info">
          <p>🛠️ Development mode active. Additional debugging available.</p>
        </div>
      )}
    </div>
  );
};

export default EnvironmentStatus;