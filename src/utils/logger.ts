/**
 * Comprehensive Logging System
 * Provides structured logging with different levels and contexts
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export enum LogCategory {
  USER_ACTION = 'user_action',
  API_CALL = 'api_call',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  AI_INTERACTION = 'ai_interaction',
  DATABASE = 'database',
  SYSTEM = 'system',
  NAVIGATION = 'navigation'
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  component?: string;
  action?: string;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface PerformanceMetrics {
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  metadata?: Record<string, any>;
}

export class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private maxLogSize = 2000;
  private currentLogLevel = LogLevel.INFO;
  private performanceMetrics: PerformanceMetrics[] = [];
  private sessionId: string;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.setupGlobalErrorHandler();
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Set the minimum log level
   */
  setLogLevel(level: LogLevel): void {
    this.currentLogLevel = level;
  }

  /**
   * Log a debug message
   */
  debug(message: string, context?: Record<string, any>, component?: string): void {
    this.log(LogLevel.DEBUG, LogCategory.SYSTEM, message, context, component);
  }

  /**
   * Log an info message
   */
  info(message: string, context?: Record<string, any>, component?: string): void {
    this.log(LogLevel.INFO, LogCategory.SYSTEM, message, context, component);
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: Record<string, any>, component?: string): void {
    this.log(LogLevel.WARN, LogCategory.SYSTEM, message, context, component);
  }

  /**
   * Log an error message
   */
  error(message: string, context?: Record<string, any>, component?: string): void {
    this.log(LogLevel.ERROR, LogCategory.SYSTEM, message, context, component);
  }

  /**
   * Log a critical message
   */
  critical(message: string, context?: Record<string, any>, component?: string): void {
    this.log(LogLevel.CRITICAL, LogCategory.SYSTEM, message, context, component);
  }

  /**
   * Log user actions
   */
  logUserAction(action: string, component: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.INFO, LogCategory.USER_ACTION, `User action: ${action}`, {
      action,
      component,
      ...metadata
    }, component);
  }

  /**
   * Log API calls
   */
  logApiCall(
    method: string,
    url: string,
    status: number,
    duration: number,
    metadata?: Record<string, any>
  ): void {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    this.log(level, LogCategory.API_CALL, `API ${method} ${url} - ${status}`, {
      method,
      url,
      status,
      duration,
      ...metadata
    });
  }

  /**
   * Log AI interactions
   */
  logAIInteraction(
    type: string,
    model: string,
    success: boolean,
    duration: number,
    metadata?: Record<string, any>
  ): void {
    const level = success ? LogLevel.INFO : LogLevel.WARN;
    this.log(level, LogCategory.AI_INTERACTION, `AI ${type} with ${model}`, {
      type,
      model,
      success,
      duration,
      ...metadata
    });
  }

  /**
   * Log performance metrics
   */
  logPerformance(operation: string, duration: number, success: boolean, metadata?: Record<string, any>): void {
    const level = duration > 5000 ? LogLevel.WARN : LogLevel.INFO;
    this.log(level, LogCategory.PERFORMANCE, `Performance: ${operation} took ${duration}ms`, {
      operation,
      duration,
      success,
      ...metadata
    });

    // Store performance metrics
    this.performanceMetrics.push({
      operation,
      startTime: Date.now() - duration,
      endTime: Date.now(),
      duration,
      success,
      metadata
    });

    // Maintain metrics size
    if (this.performanceMetrics.length > 500) {
      this.performanceMetrics = this.performanceMetrics.slice(-500);
    }
  }

  /**
   * Log navigation events
   */
  logNavigation(from: string, to: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.INFO, LogCategory.NAVIGATION, `Navigation: ${from} → ${to}`, {
      from,
      to,
      ...metadata
    });
  }

  /**
   * Log security events
   */
  logSecurity(event: string, severity: 'low' | 'medium' | 'high', metadata?: Record<string, any>): void {
    const level = severity === 'high' ? LogLevel.CRITICAL : severity === 'medium' ? LogLevel.ERROR : LogLevel.WARN;
    this.log(level, LogCategory.SECURITY, `Security: ${event}`, {
      event,
      severity,
      ...metadata
    });
  }

  /**
   * Start performance tracking
   */
  startPerformanceTracking(operation: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      this.logPerformance(operation, duration, true);
    };
  }

  /**
   * Get log statistics
   */
  getLogStats(): {
    total: number;
    byLevel: Record<LogLevel, number>;
    byCategory: Record<LogCategory, number>;
    recentErrors: LogEntry[];
    performanceStats: {
      averageApiTime: number;
      slowOperations: PerformanceMetrics[];
      totalOperations: number;
    };
  } {
    const byLevel = {} as Record<LogLevel, number>;
    const byCategory = {} as Record<LogCategory, number>;

    // Initialize counters
    Object.values(LogLevel).forEach(level => {
      if (typeof level === 'number') byLevel[level] = 0;
    });
    Object.values(LogCategory).forEach(cat => byCategory[cat] = 0);

    // Count logs
    this.logs.forEach(log => {
      byLevel[log.level]++;
      byCategory[log.category]++;
    });

    // Get recent errors
    const recentErrors = this.logs
      .filter(log => log.level >= LogLevel.ERROR)
      .slice(-20);

    // Performance statistics
    const apiCalls = this.performanceMetrics.filter(m => m.operation.includes('API'));
    const averageApiTime = apiCalls.length > 0 
      ? apiCalls.reduce((sum, m) => sum + (m.duration || 0), 0) / apiCalls.length 
      : 0;
    
    const slowOperations = this.performanceMetrics
      .filter(m => (m.duration || 0) > 3000)
      .slice(-10);

    return {
      total: this.logs.length,
      byLevel,
      byCategory,
      recentErrors,
      performanceStats: {
        averageApiTime,
        slowOperations,
        totalOperations: this.performanceMetrics.length
      }
    };
  }

  /**
   * Export logs for debugging
   */
  exportLogs(filter?: { level?: LogLevel; category?: LogCategory; since?: Date }): string {
    let filteredLogs = this.logs;

    if (filter) {
      filteredLogs = this.logs.filter(log => {
        if (filter.level !== undefined && log.level < filter.level) return false;
        if (filter.category && log.category !== filter.category) return false;
        if (filter.since && new Date(log.timestamp) < filter.since) return false;
        return true;
      });
    }

    return JSON.stringify(filteredLogs, null, 2);
  }

  /**
   * Clear logs
   */
  clearLogs(): void {
    this.logs = [];
    this.performanceMetrics = [];
  }

  private log(
    level: LogLevel,
    category: LogCategory,
    message: string,
    context?: Record<string, any>,
    component?: string,
    action?: string
  ): void {
    // Check if we should log this level
    if (level < this.currentLogLevel) return;

    const logEntry: LogEntry = {
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      context,
      sessionId: this.sessionId,
      component,
      action,
      userId: this.getCurrentUserId(),
      metadata: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        viewport: `${window.innerWidth}x${window.innerHeight}`
      }
    };

    // Add to logs
    this.logs.push(logEntry);

    // Maintain log size
    if (this.logs.length > this.maxLogSize) {
      this.logs = this.logs.slice(-this.maxLogSize);
    }

    // Console output
    this.outputToConsole(logEntry);

    // Send to external logging service (if configured)
    this.sendToExternalService(logEntry);
  }

  private outputToConsole(entry: LogEntry): void {
    const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'];
    const levelName = levelNames[entry.level];
    const prefix = `[${levelName}] [${entry.category}]`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(prefix, entry.message, entry.context);
        break;
      case LogLevel.INFO:
        console.info(prefix, entry.message, entry.context);
        break;
      case LogLevel.WARN:
        console.warn(prefix, entry.message, entry.context);
        break;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(prefix, entry.message, entry.context);
        break;
    }
  }

  private sendToExternalService(entry: LogEntry): void {
    // In production, send to external logging service
    if (process.env.NODE_ENV === 'production' && entry.level >= LogLevel.ERROR) {
      // Example: Send to logging service
      // loggingService.send(entry);
    }
  }

  private setupGlobalErrorHandler(): void {
    window.addEventListener('error', (event) => {
      this.error('Global error caught', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled promise rejection', {
        reason: event.reason,
        stack: event.reason?.stack
      });
    });
  }

  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentUserId(): string | undefined {
    // In a real application, get from authentication context
    return undefined;
  }
}

// Singleton instance
export const logger = Logger.getInstance();

// Convenience functions
export const logUserAction = (action: string, component: string, metadata?: Record<string, any>) => {
  logger.logUserAction(action, component, metadata);
};

export const logApiCall = (method: string, url: string, status: number, duration: number, metadata?: Record<string, any>) => {
  logger.logApiCall(method, url, status, duration, metadata);
};

export const logPerformance = (operation: string, duration: number, success: boolean, metadata?: Record<string, any>) => {
  logger.logPerformance(operation, duration, success, metadata);
};

export const startPerformanceTracking = (operation: string) => {
  return logger.startPerformanceTracking(operation);
};
