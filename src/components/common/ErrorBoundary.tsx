/**
 * Enhanced Error Boundary Component
 * Catches React errors and integrates with our error handling system
 */

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { errorHandler, ErrorCategory, ErrorSeverity } from '../../utils/errorHandler';
import { logger } from '../../utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Handle the error with our error handling system
    const appError = errorHandler.handleError(
      error,
      ErrorCategory.UI_COMPONENT,
      ErrorSeverity.HIGH,
      {
        component: 'ErrorBoundary',
        metadata: {
          errorInfo: {
            componentStack: errorInfo.componentStack,
            errorBoundary: this.constructor.name
          }
        }
      },
      true // retryable
    );

    // Log the error
    logger.error('React Error Boundary caught error', {
      errorId: appError.id,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });

    // Update state with error details
    this.setState({
      errorInfo,
      errorId: appError.id
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    // Reset error state if props changed and resetOnPropsChange is true
    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary();
    }

    // Reset error state if any of the resetKeys changed
    if (hasError && resetKeys && prevProps.resetKeys) {
      const hasResetKeyChanged = resetKeys.some(
        (resetKey, idx) => prevProps.resetKeys![idx] !== resetKey
      );
      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: undefined,
      retryCount: 0
    });

    logger.info('Error boundary reset', {
      component: 'ErrorBoundary'
    });
  };

  handleRetry = () => {
    const { retryCount } = this.state;
    const maxRetries = 3;

    if (retryCount < maxRetries) {
      logger.info('Retrying after error', {
        component: 'ErrorBoundary',
        retryCount: retryCount + 1,
        maxRetries
      });

      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: retryCount + 1
      });
    }
  };

  handleReload = () => {
    logger.info('Reloading page after error', {
      component: 'ErrorBoundary'
    });
    window.location.reload();
  };

  render() {
    const { hasError, error, errorId, retryCount } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <div className="error-boundary-icon">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-red-500"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            <h2 className="error-boundary-title">
              Oops! Something went wrong
            </h2>

            <p className="error-boundary-message">
              We encountered an unexpected error. Don't worry, we've been notified and are working on a fix.
            </p>

            {process.env.NODE_ENV === 'development' && error && (
              <details className="error-boundary-details">
                <summary>Error Details (Development)</summary>
                <div className="error-boundary-error-info">
                  <p><strong>Error ID:</strong> {errorId}</p>
                  <p><strong>Message:</strong> {error.message}</p>
                  <pre className="error-boundary-stack">
                    {error.stack}
                  </pre>
                </div>
              </details>
            )}

            <div className="error-boundary-actions">
              {retryCount < 3 && (
                <button
                  onClick={this.handleRetry}
                  className="error-boundary-button error-boundary-button-primary"
                >
                  Try Again ({3 - retryCount} attempts left)
                </button>
              )}

              <button
                onClick={this.handleReload}
                className="error-boundary-button error-boundary-button-secondary"
              >
                Reload Page
              </button>

              <button
                onClick={() => window.history.back()}
                className="error-boundary-button error-boundary-button-secondary"
              >
                Go Back
              </button>
            </div>

            <p className="error-boundary-support">
              If this problem persists, please contact support with error ID: <code>{errorId}</code>
            </p>
          </div>

          <style>{`
            .error-boundary-container {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 400px;
              padding: 2rem;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }

            .error-boundary-content {
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(20px);
              border-radius: 20px;
              padding: 2rem;
              max-width: 600px;
              text-align: center;
              color: white;
              border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .error-boundary-icon {
              margin-bottom: 1rem;
            }

            .error-boundary-title {
              font-size: 1.5rem;
              font-weight: bold;
              margin-bottom: 1rem;
              color: white;
            }

            .error-boundary-message {
              margin-bottom: 1.5rem;
              color: rgba(255, 255, 255, 0.9);
              line-height: 1.6;
            }

            .error-boundary-details {
              text-align: left;
              margin-bottom: 1.5rem;
              background: rgba(0, 0, 0, 0.2);
              border-radius: 8px;
              padding: 1rem;
            }

            .error-boundary-details summary {
              cursor: pointer;
              font-weight: bold;
              margin-bottom: 0.5rem;
            }

            .error-boundary-error-info {
              font-size: 0.875rem;
              color: rgba(255, 255, 255, 0.8);
            }

            .error-boundary-stack {
              background: rgba(0, 0, 0, 0.3);
              padding: 0.5rem;
              border-radius: 4px;
              overflow-x: auto;
              font-size: 0.75rem;
              margin-top: 0.5rem;
            }

            .error-boundary-actions {
              display: flex;
              gap: 0.5rem;
              justify-content: center;
              flex-wrap: wrap;
              margin-bottom: 1.5rem;
            }

            .error-boundary-button {
              padding: 0.75rem 1.5rem;
              border: none;
              border-radius: 8px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s;
            }

            .error-boundary-button-primary {
              background: #10b981;
              color: white;
            }

            .error-boundary-button-primary:hover {
              background: #059669;
            }

            .error-boundary-button-secondary {
              background: rgba(255, 255, 255, 0.2);
              color: white;
              border: 1px solid rgba(255, 255, 255, 0.3);
            }

            .error-boundary-button-secondary:hover {
              background: rgba(255, 255, 255, 0.3);
            }

            .error-boundary-support {
              font-size: 0.875rem;
              color: rgba(255, 255, 255, 0.7);
            }

            .error-boundary-support code {
              background: rgba(0, 0, 0, 0.3);
              padding: 0.25rem 0.5rem;
              border-radius: 4px;
              font-family: monospace;
            }
          `}</style>
        </div>
      );
    }

    return children;
  }
}

// Higher-order component for easy wrapping
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
