/**
 * Centralized Error Handling Utility
 * 
 * Provides consistent error handling, logging, and user-friendly error messages
 * across the application.
 */

export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: unknown;
  timestamp: string;
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
   * Log error for debugging (only in development)
   */
  static logError(error: unknown, context?: string): void {
    if (process.env.NODE_ENV !== 'production') {
      const normalized = this.normalizeError(error);
      console.group(`🚨 Error${context ? ` in ${context}` : ''}`);
      console.error('Message:', normalized.message);
      console.error('Code:', normalized.code);
      console.error('Status:', normalized.statusCode);
      console.error('Details:', normalized.details);
      console.error('Timestamp:', normalized.timestamp);
      console.groupEnd();
    }
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
    handleError: (error: unknown, context?: string) => {
      ErrorHandler.logError(error, context);
      return ErrorHandler.getUserMessage(error);
    },
    normalizeError: (error: unknown) => ErrorHandler.normalizeError(error),
    getUserMessage: (error: unknown) => ErrorHandler.getUserMessage(error),
    isRetryable: (error: unknown) => ErrorHandler.isRetryable(error),
    isNetworkError: (error: unknown) => ErrorHandler.isNetworkError(error),
  };
}






