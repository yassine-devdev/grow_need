import { logger } from '../logger';
import { errorHandler } from '../errorHandler';

describe('Logger Utility', () => {
  beforeEach(() => {
    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'info').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('logs info messages correctly', () => {
    logger.info('Test info message');
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('[INFO]'),
      expect.stringContaining('Test info message')
    );
  });

  it('logs error messages correctly', () => {
    logger.error('Test error message');
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('[ERROR]'),
      expect.stringContaining('Test error message')
    );
  });

  it('logs warning messages correctly', () => {
    logger.warn('Test warning message');
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('[WARN]'),
      expect.stringContaining('Test warning message')
    );
  });

  it('includes timestamp in log messages', () => {
    logger.info('Test message');
    expect(console.log).toHaveBeenCalledWith(
      expect.stringMatching(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
      expect.any(String)
    );
  });

  it('supports structured logging with metadata', () => {
    const metadata = { userId: 123, action: 'login' };
    logger.info('User action', metadata);
    
    expect(console.log).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('User action'),
      expect.objectContaining(metadata)
    );
  });

  it('filters log levels based on environment', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    logger.debug('Debug message');
    expect(console.log).not.toHaveBeenCalled();

    process.env.NODE_ENV = originalEnv;
  });

  it('handles circular references in objects', () => {
    const circularObj: any = { name: 'test' };
    circularObj.self = circularObj;

    expect(() => logger.info('Circular object', circularObj)).not.toThrow();
  });

  it('supports custom log formatters', () => {
    const customFormatter = jest.fn((level, message) => `CUSTOM: ${level} - ${message}`);
    logger.setFormatter(customFormatter);
    
    logger.info('Test message');
    expect(customFormatter).toHaveBeenCalledWith('INFO', 'Test message');
  });
});

describe('Error Handler Utility', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(logger, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('handles generic errors', () => {
    const error = new Error('Test error');
    const result = errorHandler.handle(error);

    expect(result).toEqual({
      success: false,
      error: 'Test error',
      code: 'GENERIC_ERROR',
    });
  });

  it('handles API errors with status codes', () => {
    const apiError = {
      name: 'APIError',
      message: 'Not found',
      status: 404,
    };

    const result = errorHandler.handle(apiError);

    expect(result).toEqual({
      success: false,
      error: 'Not found',
      code: 'API_ERROR',
      status: 404,
    });
  });

  it('handles network errors', () => {
    const networkError = new Error('Network error');
    networkError.name = 'NetworkError';

    const result = errorHandler.handle(networkError);

    expect(result.code).toBe('NETWORK_ERROR');
    expect(result.error).toContain('Network error');
  });

  it('handles validation errors', () => {
    const validationError = {
      name: 'ValidationError',
      message: 'Invalid input',
      details: ['Field is required', 'Invalid email format'],
    };

    const result = errorHandler.handle(validationError);

    expect(result.code).toBe('VALIDATION_ERROR');
    expect(result.details).toEqual(validationError.details);
  });

  it('sanitizes sensitive information from errors', () => {
    const sensitiveError = new Error('Database connection failed: password123');
    const result = errorHandler.handle(sensitiveError);

    expect(result.error).not.toContain('password123');
    expect(result.error).toContain('[REDACTED]');
  });

  it('tracks error frequency for monitoring', () => {
    const error = new Error('Repeated error');
    
    errorHandler.handle(error);
    errorHandler.handle(error);
    errorHandler.handle(error);

    const stats = errorHandler.getErrorStats();
    expect(stats['Repeated error']).toBe(3);
  });

  it('supports custom error handlers', () => {
    const customHandler = jest.fn();
    errorHandler.addCustomHandler('CustomError', customHandler);

    const customError = new Error('Custom error message');
    customError.name = 'CustomError';
    
    errorHandler.handle(customError);
    expect(customHandler).toHaveBeenCalledWith(customError);
  });

  it('logs errors to external services in production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const mockExternalLogger = jest.fn();
    errorHandler.setExternalLogger(mockExternalLogger);

    const error = new Error('Production error');
    errorHandler.handle(error);

    expect(mockExternalLogger).toHaveBeenCalledWith(error);

    process.env.NODE_ENV = originalEnv;
  });

  it('includes context information in error reports', () => {
    const context = {
      userId: 123,
      path: '/dashboard',
      timestamp: new Date().toISOString(),
    };

    const error = new Error('Context error');
    const result = errorHandler.handle(error, context);

    expect(result.context).toEqual(context);
  });

  it('handles promise rejections', async () => {
    const rejectedPromise = Promise.reject(new Error('Async error'));
    
    const result = await errorHandler.handleAsync(rejectedPromise);
    
    expect(result.success).toBe(false);
    expect(result.error).toBe('Async error');
  });

  it('provides error recovery suggestions', () => {
    const networkError = new Error('Failed to fetch');
    networkError.name = 'NetworkError';
    
    const result = errorHandler.handle(networkError);
    
    expect(result.recovery).toContain('Check your internet connection');
  });

  it('supports error grouping and categorization', () => {
    const errors = [
      new Error('Database connection timeout'),
      new Error('Database query failed'),
      new Error('Network timeout'),
    ];

    errors.forEach(error => errorHandler.handle(error));
    
    const grouped = errorHandler.getGroupedErrors();
    expect(grouped.database).toHaveLength(2);
    expect(grouped.network).toHaveLength(1);
  });
});