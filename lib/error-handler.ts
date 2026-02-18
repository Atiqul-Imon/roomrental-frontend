/**
 * Centralized Error Handling Utility
 * 
 * Provides consistent error handling, logging, and user-friendly error messages
 * across the application. Includes extensible error reporting for future integration
 * with services like Sentry.
 */

import { logger } from './logger';

export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: unknown;
  timestamp: string;
  context?: ErrorContext;
}

export interface ErrorContext {
  user?: {
    id?: string;
    email?: string;
    role?: string;
  };
  route?: string;
  url?: string;
  userAgent?: string;
  referrer?: string;
  screenResolution?: string;
  viewport?: string;
  [key: string]: unknown;
}

export interface ErrorReporter {
  reportError(error: AppError, context?: ErrorContext): void | Promise<void>;
}

/**
 * Error reporting service with extensible architecture
 * Can be extended to integrate with Sentry, LogRocket, etc.
 */
class ErrorReportingService {
  private reporters: ErrorReporter[] = [];

  /**
   * Register an error reporter (e.g., Sentry)
   */
  registerReporter(reporter: ErrorReporter): void {
    this.reporters.push(reporter);
  }

  /**
   * Report error to all registered reporters
   */
  async reportError(error: AppError, context?: ErrorContext): Promise<void> {
    // Always log to console
    this.logToConsole(error, context);

    // Report to external services
    for (const reporter of this.reporters) {
      try {
        await reporter.reportError(error, context);
      } catch (reportError) {
        // Don't let reporter errors break the app
        logger.error('Error reporter failed:', reportError);
      }
    }
  }

  /**
   * Log error to console with structured format
   */
  private logToConsole(error: AppError, context?: ErrorContext): void {
    const logData: Record<string, unknown> = {
      message: error.message,
      code: error.code,
      status: error.statusCode,
      timestamp: error.timestamp,
    };

    if (error.details) {
      logData.details = error.details;
    }

    if (context) {
      logData.context = context;
    }

    logger.error('🚨 Error tracked:', logData);
  }
}

// Singleton instance
const errorReportingService = new ErrorReportingService();

/**
 * Get browser context information
 * Safe for SSR - returns empty object if browser APIs are not available
 */
function getBrowserContext(): Partial<ErrorContext> {
  if (typeof window === 'undefined' || typeof document === 'undefined' || typeof navigator === 'undefined') {
    return {};
  }

  try {
    const location = window.location;
    const screen = window.screen;
    
    if (!location) {
      return {};
    }

    return {
      url: location.href,
      route: location.pathname,
      referrer: document.referrer || undefined,
      userAgent: navigator.userAgent,
      screenResolution: screen ? `${screen.width}x${screen.height}` : undefined,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
    };
  } catch (error) {
    // Fallback if any property access fails (e.g., during SSR)
    return {};
  }
}

/**
 * Get user context from localStorage
 */
function getUserContext(): ErrorContext['user'] {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return {
        id: user.id,
        email: user.email,
        role: user.role,
      };
    }
  } catch (error) {
    // Ignore parsing errors
  }

  return undefined;
}

export class ErrorHandler {
  /**
   * Normalize error to AppError format
   */
  static normalizeError(error: unknown): AppError {
    const timestamp = new Date().toISOString();

    // Axios errors
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: { data?: unknown; status?: number };
        message?: string;
      };
      
      return {
        message: this.extractMessage(axiosError.response?.data) || axiosError.message || 'Network error occurred',
        code: 'NETWORK_ERROR',
        statusCode: axiosError.response?.status,
        details: axiosError.response?.data,
        timestamp,
      };
    }

    // Error instances
    if (error instanceof Error) {
      return {
        message: error.message || 'An unexpected error occurred',
        code: error.name || 'UNKNOWN_ERROR',
        details: error.stack,
        timestamp,
      };
    }

    // String errors
    if (typeof error === 'string') {
      return {
        message: error,
        code: 'STRING_ERROR',
        timestamp,
      };
    }

    // Unknown error type
    return {
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      details: error,
      timestamp,
    };
  }

  /**
   * Extract user-friendly message from error data
   */
  private static extractMessage(data: unknown): string | null {
    if (!data || typeof data !== 'object') return null;

    // Check common error response formats
    if ('message' in data && typeof data.message === 'string') {
      return data.message;
    }
    if ('error' in data && typeof data.error === 'string') {
      return data.error;
    }
    if ('msg' in data && typeof data.msg === 'string') {
      return data.msg;
    }

    return null;
  }

  /**
   * Get user-friendly error message
   */
  static getUserMessage(error: unknown): string {
    const normalized = this.normalizeError(error);

    // Map common error codes to user-friendly messages
    const userMessages: Record<string, string> = {
      NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
      UNAUTHORIZED: 'You are not authorized to perform this action. Please log in.',
      FORBIDDEN: 'You do not have permission to access this resource.',
      NOT_FOUND: 'The requested resource was not found.',
      VALIDATION_ERROR: 'Please check your input and try again.',
      SERVER_ERROR: 'A server error occurred. Please try again later.',
      TIMEOUT: 'The request took too long. Please try again.',
    };

    if (normalized.code && userMessages[normalized.code]) {
      return userMessages[normalized.code];
    }

    // Return the error message if it's user-friendly, otherwise return generic message
    if (normalized.message && normalized.message.length < 200) {
      return normalized.message;
    }

    return 'Something went wrong. Please try again.';
  }

  /**
   * Log error with context tracking
   * Always logs errors (not just in development) for production debugging
   */
  static async logError(error: unknown, context?: string | ErrorContext): Promise<void> {
    const normalized = this.normalizeError(error);
    
    // Build error context
    const browserContext = getBrowserContext();
    const userContext = getUserContext();
    const errorContext: ErrorContext = {
      ...browserContext,
    };

    if (userContext) {
      errorContext.user = userContext;
    }

    // Add custom context if provided
    if (context) {
      if (typeof context === 'string') {
        errorContext.customContext = context;
      } else {
        Object.assign(errorContext, context);
      }
    }

    normalized.context = errorContext;

    // Report error through the reporting service
    await errorReportingService.reportError(normalized, errorContext);
  }

  /**
   * Register an error reporter (e.g., Sentry)
   */
  static registerReporter(reporter: ErrorReporter): void {
    errorReportingService.registerReporter(reporter);
  }

  /**
   * Check if error is a network error
   */
  static isNetworkError(error: unknown): boolean {
    const normalized = this.normalizeError(error);
    return normalized.code === 'NETWORK_ERROR' || normalized.statusCode === undefined;
  }

  /**
   * Check if error is a client error (4xx)
   */
  static isClientError(error: unknown): boolean {
    const normalized = this.normalizeError(error);
    return normalized.statusCode !== undefined && normalized.statusCode >= 400 && normalized.statusCode < 500;
  }

  /**
   * Check if error is a server error (5xx)
   */
  static isServerError(error: unknown): boolean {
    const normalized = this.normalizeError(error);
    return normalized.statusCode !== undefined && normalized.statusCode >= 500;
  }

  /**
   * Check if error is retryable
   */
  static isRetryable(error: unknown): boolean {
    const normalized = this.normalizeError(error);
    
    // Network errors are retryable
    if (this.isNetworkError(error)) return true;
    
    // Server errors (5xx) are retryable
    if (this.isServerError(error)) return true;
    
    // Timeout errors are retryable
    if (normalized.code === 'TIMEOUT') return true;
    
    // Client errors (4xx) are generally not retryable
    return false;
  }
}

/**
 * React Hook for error handling
 */
export function useErrorHandler() {
  return {
    handleError: async (error: unknown, context?: string | ErrorContext) => {
      await ErrorHandler.logError(error, context);
      return ErrorHandler.getUserMessage(error);
    },
    normalizeError: (error: unknown) => ErrorHandler.normalizeError(error),
    getUserMessage: (error: unknown) => ErrorHandler.getUserMessage(error),
    isRetryable: (error: unknown) => ErrorHandler.isRetryable(error),
    isNetworkError: (error: unknown) => ErrorHandler.isNetworkError(error),
  };
}

/**
 * Initialize global error handlers
 * Call this once in your app initialization (e.g., in layout.tsx or _app.tsx)
 */
export function initializeErrorTracking(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Handle unhandled errors
  window.addEventListener('error', (event) => {
    const error = event.error || new Error(event.message || 'Unknown error');
    ErrorHandler.logError(error, {
      source: 'window.onerror',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason || 'Unhandled promise rejection'));
    
    ErrorHandler.logError(error, {
      source: 'unhandledrejection',
      promise: true,
    });
  });
}










