/**
 * Monitoring Dashboard Component
 * Displays error and logging statistics for system monitoring
 */

import React, { useState, useEffect } from 'react';
import { errorHandler } from '../../utils/errorHandler';
import { logger } from '../../utils/logger';

interface MonitoringStats {
  errors: {
    total: number;
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
    recent: any[];
  };
  logs: {
    total: number;
    byLevel: Record<string, number>;
    byCategory: Record<string, number>;
    recentErrors: any[];
    performanceStats: {
      averageApiTime: number;
      slowOperations: any[];
      totalOperations: number;
    };
  };
}

export const MonitoringDashboard: React.FC = () => {
  const [stats, setStats] = useState<MonitoringStats | null>(null);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  const refreshStats = () => {
    const errorStats = errorHandler.getErrorStats();
    const logStats = logger.getLogStats();
    
    setStats({
      errors: errorStats,
      logs: logStats
    });
  };

  useEffect(() => {
    refreshStats();
  }, []);

  useEffect(() => {
    if (isAutoRefresh) {
      const interval = setInterval(refreshStats, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [isAutoRefresh, refreshInterval]);

  const handleClearLogs = () => {
    if (confirm('Are you sure you want to clear all logs?')) {
      logger.clearLogs();
      errorHandler.clearErrorLog();
      refreshStats();
    }
  };

  const handleExportLogs = () => {
    const errorLog = errorHandler.exportErrorLog();
    const systemLog = logger.exportLogs();
    
    const exportData = {
      timestamp: new Date().toISOString(),
      errors: JSON.parse(errorLog),
      logs: JSON.parse(systemLog)
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monitoring-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!stats) {
    return (
      <div className="monitoring-dashboard loading">
        <div className="loading-spinner"></div>
        <p>Loading monitoring data...</p>
      </div>
    );
  }

  return (
    <div className="monitoring-dashboard">
      <div className="dashboard-header">
        <h2>System Monitoring Dashboard</h2>
        <div className="dashboard-controls">
          <label>
            <input
              type="checkbox"
              checked={isAutoRefresh}
              onChange={(e) => setIsAutoRefresh(e.target.checked)}
            />
            Auto-refresh
          </label>
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            disabled={!isAutoRefresh}
          >
            <option value={1000}>1s</option>
            <option value={5000}>5s</option>
            <option value={10000}>10s</option>
            <option value={30000}>30s</option>
          </select>
          <button onClick={refreshStats}>Refresh</button>
          <button onClick={handleExportLogs}>Export</button>
          <button onClick={handleClearLogs} className="danger">Clear All</button>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Error Statistics */}
        <div className="dashboard-card">
          <h3>Error Statistics</h3>
          <div className="stat-grid">
            <div className="stat-item">
              <span className="stat-label">Total Errors</span>
              <span className="stat-value">{stats.errors.total}</span>
            </div>
          </div>
          
          <h4>By Severity</h4>
          <div className="stat-list">
            {Object.entries(stats.errors.bySeverity).map(([severity, count]) => (
              <div key={severity} className="stat-row">
                <span className={`severity-badge severity-${severity}`}>
                  {severity}
                </span>
                <span>{count}</span>
              </div>
            ))}
          </div>

          <h4>By Category</h4>
          <div className="stat-list">
            {Object.entries(stats.errors.byCategory).map(([category, count]) => (
              <div key={category} className="stat-row">
                <span>{category}</span>
                <span>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Log Statistics */}
        <div className="dashboard-card">
          <h3>Log Statistics</h3>
          <div className="stat-grid">
            <div className="stat-item">
              <span className="stat-label">Total Logs</span>
              <span className="stat-value">{stats.logs.total}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Avg API Time</span>
              <span className="stat-value">
                {stats.logs.performanceStats.averageApiTime.toFixed(0)}ms
              </span>
            </div>
          </div>

          <h4>By Level</h4>
          <div className="stat-list">
            {Object.entries(stats.logs.byLevel).map(([level, count]) => (
              <div key={level} className="stat-row">
                <span className={`level-badge level-${level}`}>
                  {['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'][Number(level)]}
                </span>
                <span>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="dashboard-card">
          <h3>Performance Metrics</h3>
          <div className="stat-grid">
            <div className="stat-item">
              <span className="stat-label">Total Operations</span>
              <span className="stat-value">{stats.logs.performanceStats.totalOperations}</span>
            </div>
          </div>

          <h4>Slow Operations</h4>
          <div className="operation-list">
            {stats.logs.performanceStats.slowOperations.slice(0, 5).map((op, index) => (
              <div key={index} className="operation-item">
                <span className="operation-name">{op.operation}</span>
                <span className="operation-time">{op.duration}ms</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Errors */}
        <div className="dashboard-card full-width">
          <h3>Recent Errors</h3>
          <div className="error-list">
            {stats.errors.recent.slice(0, 10).map((error, index) => (
              <div key={index} className="error-item">
                <div className="error-header">
                  <span className={`severity-badge severity-${error.severity}`}>
                    {error.severity}
                  </span>
                  <span className="error-category">{error.category}</span>
                  <span className="error-time">
                    {new Date(error.context.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="error-message">{error.message}</div>
                {error.context.component && (
                  <div className="error-component">Component: {error.context.component}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .monitoring-dashboard {
          padding: 1rem;
          background: #f8fafc;
          min-height: 100vh;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding: 1rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .dashboard-controls {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .dashboard-controls button {
          padding: 0.5rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          background: white;
          cursor: pointer;
        }

        .dashboard-controls button.danger {
          background: #ef4444;
          color: white;
          border-color: #ef4444;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
        }

        .dashboard-card {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .dashboard-card.full-width {
          grid-column: 1 / -1;
        }

        .stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .stat-item {
          text-align: center;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 4px;
        }

        .stat-label {
          display: block;
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 0.5rem;
        }

        .stat-value {
          display: block;
          font-size: 1.5rem;
          font-weight: bold;
          color: #1f2937;
        }

        .stat-list, .operation-list, .error-list {
          space-y: 0.5rem;
        }

        .stat-row, .operation-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background: #f8fafc;
          border-radius: 4px;
          margin-bottom: 0.5rem;
        }

        .severity-badge, .level-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
        }

        .severity-low { background: #dbeafe; color: #1e40af; }
        .severity-medium { background: #fef3c7; color: #92400e; }
        .severity-high { background: #fee2e2; color: #dc2626; }
        .severity-critical { background: #fecaca; color: #991b1b; }

        .level-0 { background: #f3f4f6; color: #374151; }
        .level-1 { background: #dbeafe; color: #1e40af; }
        .level-2 { background: #fef3c7; color: #92400e; }
        .level-3 { background: #fee2e2; color: #dc2626; }
        .level-4 { background: #fecaca; color: #991b1b; }

        .error-item {
          padding: 1rem;
          background: #fef2f2;
          border-left: 4px solid #ef4444;
          border-radius: 4px;
          margin-bottom: 0.5rem;
        }

        .error-header {
          display: flex;
          gap: 1rem;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .error-message {
          font-weight: 500;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .error-component {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f4f6;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
