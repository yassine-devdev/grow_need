/**
 * Comprehensive Error Handling and Logging System
 * Provides centralized error management, logging, and monitoring
 */

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ErrorCategory {
  NETWORK = 'network',
  AI_SERVICE = 'ai_service',
  DATABASE = 'database',
  AUTHENTICATION = 'authentication',
  VALIDATION = 'validation',
  UI_COMPONENT = 'ui_component',
  SYSTEM = 'system'
}

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
  userAgent?: string;
  url?: string;
}

export interface AppError {
  id: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  context: ErrorContext;
  stack?: string;
  originalError?: Error;
  retryable: boolean;
  userMessage: string;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: AppError[] = [];
  private maxLogSize = 1000;
  private retryAttempts = new Map<string, number>();

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle and log an error
   */
  handleError(
    error: Error | string,
    category: ErrorCategory,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context: ErrorContext = {},
    retryable: boolean = false
  ): AppError {
    const appError: AppError = {
      id: this.generateErrorId(),
      message: typeof error === 'string' ? error : error.message,
      category,
      severity,
      context: {
        ...context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      },
      stack: typeof error === 'object' ? error.stack : undefined,
      originalError: typeof error === 'object' ? error : undefined,
      retryable,
      userMessage: this.generateUserMessage(category, severity)
    };

    // Log the error
    this.logError(appError);

    // Send to monitoring service (if configured)
    this.sendToMonitoring(appError);

    // Handle critical errors
    if (severity === ErrorSeverity.CRITICAL) {
      this.handleCriticalError(appError);
    }

    return appError;
  }

  /**
   * Retry a failed operation
   */
  async retryOperation<T>(
    operation: () => Promise<T>,
    errorId: string,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    const currentAttempts = this.retryAttempts.get(errorId) || 0;

    if (currentAttempts >= maxRetries) {
      throw new Error(`Max retry attempts (${maxRetries}) exceeded for operation ${errorId}`);
    }

    try {
      const result = await operation();
      this.retryAttempts.delete(errorId); // Clear on success
      return result;
    } catch (error) {
      this.retryAttempts.set(errorId, currentAttempts + 1);
      
      if (currentAttempts + 1 < maxRetries) {
        await this.delay(delay * Math.pow(2, currentAttempts)); // Exponential backoff
        return this.retryOperation(operation, errorId, maxRetries, delay);
      } else {
        throw error;
      }
    }
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    total: number;
    byCategory: Record<ErrorCategory, number>;
    bySeverity: Record<ErrorSeverity, number>;
    recent: AppError[];
  } {
    const byCategory = {} as Record<ErrorCategory, number>;
    const bySeverity = {} as Record<ErrorSeverity, number>;

    // Initialize counters
    Object.values(ErrorCategory).forEach(cat => byCategory[cat] = 0);
    Object.values(ErrorSeverity).forEach(sev => bySeverity[sev] = 0);

    // Count errors
    this.errorLog.forEach(error => {
      byCategory[error.category]++;
      bySeverity[error.severity]++;
    });

    // Get recent errors (last 10)
    const recent = this.errorLog.slice(-10);

    return {
      total: this.errorLog.length,
      byCategory,
      bySeverity,
      recent
    };
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
    this.retryAttempts.clear();
  }

  /**
   * Export error log for debugging
   */
  exportErrorLog(): string {
    return JSON.stringify(this.errorLog, null, 2);
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateUserMessage(category: ErrorCategory, severity: ErrorSeverity): string {
    const messages = {
      [ErrorCategory.NETWORK]: {
        [ErrorSeverity.LOW]: 'Connection issue detected. Please check your internet connection.',
        [ErrorSeverity.MEDIUM]: 'Network error occurred. Please try again.',
        [ErrorSeverity.HIGH]: 'Network connection failed. Please check your connection and retry.',
        [ErrorSeverity.CRITICAL]: 'Critical network failure. Please contact support.'
      },
      [ErrorCategory.AI_SERVICE]: {
        [ErrorSeverity.LOW]: 'AI service temporarily unavailable. Please try again.',
        [ErrorSeverity.MEDIUM]: 'AI service error. Please retry your request.',
        [ErrorSeverity.HIGH]: 'AI service is experiencing issues. Please try again later.',
        [ErrorSeverity.CRITICAL]: 'AI service is down. Please contact support.'
      },
      [ErrorCategory.DATABASE]: {
        [ErrorSeverity.LOW]: 'Data loading issue. Please refresh the page.',
        [ErrorSeverity.MEDIUM]: 'Database error occurred. Please try again.',
        [ErrorSeverity.HIGH]: 'Database connection failed. Please try again later.',
        [ErrorSeverity.CRITICAL]: 'Critical database error. Please contact support.'
      },
      [ErrorCategory.AUTHENTICATION]: {
        [ErrorSeverity.LOW]: 'Authentication issue. Please try logging in again.',
        [ErrorSeverity.MEDIUM]: 'Login failed. Please check your credentials.',
        [ErrorSeverity.HIGH]: 'Authentication error. Please contact your administrator.',
        [ErrorSeverity.CRITICAL]: 'Critical authentication failure. Please contact support.'
      },
      [ErrorCategory.VALIDATION]: {
        [ErrorSeverity.LOW]: 'Please check your input and try again.',
        [ErrorSeverity.MEDIUM]: 'Validation error. Please correct the highlighted fields.',
        [ErrorSeverity.HIGH]: 'Data validation failed. Please review your input.',
        [ErrorSeverity.CRITICAL]: 'Critical validation error. Please contact support.'
      },
      [ErrorCategory.UI_COMPONENT]: {
        [ErrorSeverity.LOW]: 'Interface issue detected. Please refresh the page.',
        [ErrorSeverity.MEDIUM]: 'Component error occurred. Please try again.',
        [ErrorSeverity.HIGH]: 'Interface error. Please refresh and try again.',
        [ErrorSeverity.CRITICAL]: 'Critical interface error. Please contact support.'
      },
      [ErrorCategory.SYSTEM]: {
        [ErrorSeverity.LOW]: 'System issue detected. Please try again.',
        [ErrorSeverity.MEDIUM]: 'System error occurred. Please retry.',
        [ErrorSeverity.HIGH]: 'System error. Please try again later.',
        [ErrorSeverity.CRITICAL]: 'Critical system error. Please contact support immediately.'
      }
    };

    return messages[category]?.[severity] || 'An unexpected error occurred. Please try again.';
  }

  private logError(error: AppError): void {
    // Add to internal log
    this.errorLog.push(error);

    // Maintain log size
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }

    // Console logging based on severity
    const logMethod = this.getLogMethod(error.severity);
    logMethod(`[${error.category.toUpperCase()}] ${error.message}`, {
      id: error.id,
      context: error.context,
      stack: error.stack
    });
  }

  private getLogMethod(severity: ErrorSeverity): typeof console.log {
    switch (severity) {
      case ErrorSeverity.LOW:
        return console.info;
      case ErrorSeverity.MEDIUM:
        return console.warn;
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        return console.error;
      default:
        return console.log;
    }
  }

  private sendToMonitoring(error: AppError): void {
    // In a real application, this would send to a monitoring service
    // like Sentry, LogRocket, or custom analytics
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to monitoring service
      // monitoringService.captureError(error);
    }
  }

  private handleCriticalError(error: AppError): void {
    // Handle critical errors that might require immediate attention
    console.error('CRITICAL ERROR DETECTED:', error);
    
    // In a real application, this might:
    // - Send immediate alerts
    // - Trigger fallback systems
    // - Log to persistent storage
    // - Notify administrators
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Convenience functions
export const handleError = (
  error: Error | string,
  category: ErrorCategory,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  context: ErrorContext = {},
  retryable: boolean = false
): AppError => {
  return errorHandler.handleError(error, category, severity, context, retryable);
};

export const retryOperation = <T>(
  operation: () => Promise<T>,
  errorId: string,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  return errorHandler.retryOperation(operation, errorId, maxRetries, delay);
};
