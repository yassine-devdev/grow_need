/**
 * API Interceptor with Enhanced Error Handling and Logging
 * Intercepts all API calls to provide consistent error handling and logging
 */

import { errorHandler, ErrorCategory, ErrorSeverity } from './errorHandler';
import { logger, logApiCall, startPerformanceTracking } from './logger';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
  status: number;
  headers?: Record<string, string>;
}

export interface ApiRequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export class ApiInterceptor {
  private static instance: ApiInterceptor;
  private baseUrl: string = '';
  private defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  private defaultTimeout = 30000; // 30 seconds
  private requestQueue: Map<string, AbortController> = new Map();

  private constructor() {}

  static getInstance(): ApiInterceptor {
    if (!ApiInterceptor.instance) {
      ApiInterceptor.instance = new ApiInterceptor();
    }
    return ApiInterceptor.instance;
  }

  /**
   * Set base URL for all requests
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url.replace(/\/$/, ''); // Remove trailing slash
  }

  /**
   * Set default headers for all requests
   */
  setDefaultHeaders(headers: Record<string, string>): void {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }

  /**
   * Make an API request with enhanced error handling and logging
   */
  async request<T = any>(config: ApiRequestConfig): Promise<ApiResponse<T>> {
    const requestId = this.generateRequestId();
    const fullUrl = this.buildFullUrl(config.url);
    const method = config.method || 'GET';
    
    // Start performance tracking
    const endPerformanceTracking = startPerformanceTracking(`API ${method} ${config.url}`);

    // Create abort controller for this request
    const abortController = new AbortController();
    this.requestQueue.set(requestId, abortController);

    // Set up timeout
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, config.timeout || this.defaultTimeout);

    try {
      // Log request start
      logger.info(`API request started: ${method} ${fullUrl}`, {
        requestId,
        method,
        url: fullUrl,
        headers: config.headers
      });

      // Prepare request options
      const requestOptions: RequestInit = {
        method,
        headers: {
          ...this.defaultHeaders,
          ...config.headers
        },
        signal: abortController.signal
      };

      // Add body for non-GET requests
      if (config.body && method !== 'GET') {
        requestOptions.body = typeof config.body === 'string' 
          ? config.body 
          : JSON.stringify(config.body);
      }

      // Make the request
      const startTime = performance.now();
      const response = await fetch(fullUrl, requestOptions);
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Clear timeout
      clearTimeout(timeoutId);

      // Parse response
      let responseData: T | undefined;
      let responseText = '';

      try {
        responseText = await response.text();
        if (responseText) {
          responseData = JSON.parse(responseText);
        }
      } catch (parseError) {
        // If JSON parsing fails, treat as text response
        responseData = responseText as any;
      }

      // Create response object
      const apiResponse: ApiResponse<T> = {
        data: responseData,
        success: response.ok,
        status: response.status,
        headers: this.extractHeaders(response.headers)
      };

      if (!response.ok) {
        apiResponse.error = this.extractErrorMessage(responseData, response.status);
      }

      // Log response
      logApiCall(method, fullUrl, response.status, duration, {
        requestId,
        responseSize: responseText.length,
        success: response.ok
      });

      // Handle errors
      if (!response.ok) {
        this.handleApiError(response.status, apiResponse.error!, fullUrl, method, duration);
      }

      // End performance tracking
      endPerformanceTracking();

      return apiResponse;

    } catch (error) {
      // Clear timeout
      clearTimeout(timeoutId);

      // End performance tracking
      endPerformanceTracking();

      // Handle different types of errors
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return this.handleTimeoutError(fullUrl, method, requestId);
        }
        
        return this.handleNetworkError(error, fullUrl, method, requestId);
      }

      // Unknown error
      return this.handleUnknownError(error, fullUrl, method, requestId);

    } finally {
      // Clean up
      this.requestQueue.delete(requestId);
    }
  }

  /**
   * Convenience methods for different HTTP methods
   */
  async get<T = any>(url: string, config?: Omit<ApiRequestConfig, 'url' | 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'GET' });
  }

  async post<T = any>(url: string, body?: any, config?: Omit<ApiRequestConfig, 'url' | 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'POST', body });
  }

  async put<T = any>(url: string, body?: any, config?: Omit<ApiRequestConfig, 'url' | 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'PUT', body });
  }

  async delete<T = any>(url: string, config?: Omit<ApiRequestConfig, 'url' | 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'DELETE' });
  }

  async patch<T = any>(url: string, body?: any, config?: Omit<ApiRequestConfig, 'url' | 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'PATCH', body });
  }

  /**
   * Cancel all pending requests
   */
  cancelAllRequests(): void {
    this.requestQueue.forEach((controller) => {
      controller.abort();
    });
    this.requestQueue.clear();
    
    logger.info('All pending API requests cancelled');
  }

  /**
   * Cancel a specific request
   */
  cancelRequest(requestId: string): void {
    const controller = this.requestQueue.get(requestId);
    if (controller) {
      controller.abort();
      this.requestQueue.delete(requestId);
      logger.info(`API request cancelled: ${requestId}`);
    }
  }

  private buildFullUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${this.baseUrl}${url.startsWith('/') ? url : '/' + url}`;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  private extractHeaders(headers: Headers): Record<string, string> {
    const headerObj: Record<string, string> = {};
    headers.forEach((value, key) => {
      headerObj[key] = value;
    });
    return headerObj;
  }

  private extractErrorMessage(responseData: any, status: number): string {
    if (typeof responseData === 'string') {
      return responseData;
    }
    
    if (responseData && typeof responseData === 'object') {
      return responseData.error || responseData.message || responseData.detail || `HTTP ${status}`;
    }
    
    return `HTTP ${status}`;
  }

  private handleApiError(status: number, message: string, url: string, method: string, duration: number): void {
    let severity = ErrorSeverity.MEDIUM;
    let category = ErrorCategory.NETWORK;

    // Determine severity based on status code
    if (status >= 500) {
      severity = ErrorSeverity.HIGH;
    } else if (status === 401 || status === 403) {
      severity = ErrorSeverity.HIGH;
      category = ErrorCategory.AUTHENTICATION;
    } else if (status >= 400) {
      severity = ErrorSeverity.MEDIUM;
      category = ErrorCategory.VALIDATION;
    }

    errorHandler.handleError(
      `API Error: ${message}`,
      category,
      severity,
      {
        component: 'ApiInterceptor',
        metadata: {
          url,
          method,
          status,
          duration
        }
      },
      status >= 500 // Retryable for server errors
    );
  }

  private handleTimeoutError(url: string, method: string, requestId: string): ApiResponse {
    const error = errorHandler.handleError(
      'Request timeout',
      ErrorCategory.NETWORK,
      ErrorSeverity.MEDIUM,
      {
        component: 'ApiInterceptor',
        metadata: {
          url,
          method,
          requestId
        }
      },
      true
    );

    return {
      success: false,
      status: 408,
      error: error.userMessage
    };
  }

  private handleNetworkError(error: Error, url: string, method: string, requestId: string): ApiResponse {
    const appError = errorHandler.handleError(
      error,
      ErrorCategory.NETWORK,
      ErrorSeverity.HIGH,
      {
        component: 'ApiInterceptor',
        metadata: {
          url,
          method,
          requestId
        }
      },
      true
    );

    return {
      success: false,
      status: 0,
      error: appError.userMessage
    };
  }

  private handleUnknownError(error: any, url: string, method: string, requestId: string): ApiResponse {
    const appError = errorHandler.handleError(
      `Unknown error: ${String(error)}`,
      ErrorCategory.SYSTEM,
      ErrorSeverity.HIGH,
      {
        component: 'ApiInterceptor',
        metadata: {
          url,
          method,
          requestId
        }
      },
      false
    );

    return {
      success: false,
      status: 0,
      error: appError.userMessage
    };
  }
}

// Singleton instance
export const apiInterceptor = ApiInterceptor.getInstance();

// Convenience functions
export const apiGet = <T = any>(url: string, config?: Omit<ApiRequestConfig, 'url' | 'method'>) => {
  return apiInterceptor.get<T>(url, config);
};

export const apiPost = <T = any>(url: string, body?: any, config?: Omit<ApiRequestConfig, 'url' | 'method' | 'body'>) => {
  return apiInterceptor.post<T>(url, body, config);
};

export const apiPut = <T = any>(url: string, body?: any, config?: Omit<ApiRequestConfig, 'url' | 'method' | 'body'>) => {
  return apiInterceptor.put<T>(url, body, config);
};

export const apiDelete = <T = any>(url: string, config?: Omit<ApiRequestConfig, 'url' | 'method'>) => {
  return apiInterceptor.delete<T>(url, config);
};

export const apiPatch = <T = any>(url: string, body?: any, config?: Omit<ApiRequestConfig, 'url' | 'method' | 'body'>) => {
  return apiInterceptor.patch<T>(url, body, config);
};
