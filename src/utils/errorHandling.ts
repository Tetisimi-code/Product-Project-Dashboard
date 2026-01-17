/**
 * Error Handling Utilities
 * 
 * Provides consistent error handling, user-friendly messages,
 * and retry logic for network requests
 */

import { toast } from 'sonner@2.0.3';
import { retryConfig } from './config';

export type ErrorType = 
  | 'network'
  | 'authentication'
  | 'authorization'
  | 'validation'
  | 'not_found'
  | 'server'
  | 'unknown';

export interface AppError {
  type: ErrorType;
  message: string;
  userMessage: string;
  originalError?: unknown;
  statusCode?: number;
  retryable: boolean;
}

/**
 * Parse and classify errors into user-friendly messages
 */
export function parseError(error: unknown, context?: string): AppError {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      type: 'network',
      message: 'Network request failed',
      userMessage: 'Unable to connect to the server. Please check your internet connection.',
      originalError: error,
      retryable: true,
    };
  }

  // HTTP errors
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as any).status;
    
    if (status === 401) {
      return {
        type: 'authentication',
        message: 'Authentication required',
        userMessage: 'Your session has expired. Please log in again.',
        statusCode: 401,
        retryable: false,
      };
    }
    
    if (status === 403) {
      return {
        type: 'authorization',
        message: 'Access denied',
        userMessage: 'You do not have permission to perform this action.',
        statusCode: 403,
        retryable: false,
      };
    }
    
    if (status === 404) {
      return {
        type: 'not_found',
        message: 'Resource not found',
        userMessage: 'The requested resource was not found.',
        statusCode: 404,
        retryable: false,
      };
    }
    
    if (status >= 500) {
      return {
        type: 'server',
        message: 'Server error',
        userMessage: 'The server encountered an error. Please try again later.',
        statusCode: status,
        retryable: true,
      };
    }
    
    if (status === 429) {
      return {
        type: 'server',
        message: 'Rate limited',
        userMessage: 'Too many requests. Please wait a moment and try again.',
        statusCode: 429,
        retryable: true,
      };
    }
  }

  // String errors
  if (typeof error === 'string') {
    return {
      type: 'unknown',
      message: error,
      userMessage: error,
      retryable: false,
    };
  }

  // Error objects with message
  if (error instanceof Error) {
    return {
      type: 'unknown',
      message: error.message,
      userMessage: context 
        ? `${context}: ${error.message}`
        : error.message,
      originalError: error,
      retryable: false,
    };
  }

  // Unknown errors
  return {
    type: 'unknown',
    message: 'An unexpected error occurred',
    userMessage: context
      ? `${context}: An unexpected error occurred`
      : 'An unexpected error occurred. Please try again.',
    originalError: error,
    retryable: false,
  };
}

/**
 * Show error toast notification
 */
export function showError(error: unknown, context?: string) {
  const appError = parseError(error, context);
  
  console.error(`[Error] ${context || 'Unknown context'}:`, {
    type: appError.type,
    message: appError.message,
    originalError: appError.originalError,
  });

  toast.error(appError.userMessage, {
    duration: appError.type === 'network' ? 5000 : 4000,
    action: appError.retryable ? {
      label: 'Retry',
      onClick: () => {
        // This is a placeholder - actual retry logic should be in calling code
        window.location.reload();
      },
    } : undefined,
  });

  return appError;
}

/**
 * Retry logic for failed requests
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: {
    maxRetries?: number;
    onRetry?: (attempt: number, error: unknown) => void;
    shouldRetry?: (error: unknown) => boolean;
  }
): Promise<T> {
  const maxRetries = options?.maxRetries ?? retryConfig.maxRetries;
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if we should retry
      const appError = parseError(error);
      const shouldRetry = options?.shouldRetry 
        ? options.shouldRetry(error)
        : appError.retryable;

      if (!shouldRetry || attempt === maxRetries) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        retryConfig.initialDelay * Math.pow(retryConfig.backoffMultiplier, attempt),
        retryConfig.maxDelay
      );

      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
      
      options?.onRetry?.(attempt + 1, error);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Safe async wrapper that catches and logs errors
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  fallback: T,
  context?: string
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    showError(error, context);
    return fallback;
  }
}

/**
 * Network status monitoring
 */
export class NetworkMonitor {
  private listeners: Set<(online: boolean) => void> = new Set();
  private _isOnline = navigator.onLine;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
  }

  private handleOnline = () => {
    this._isOnline = true;
    this.notify(true);
    toast.success('Back online', {
      description: 'Your connection has been restored',
    });
  };

  private handleOffline = () => {
    this._isOnline = false;
    this.notify(false);
    toast.error('No internet connection', {
      description: 'Some features may not work offline',
      duration: Infinity,
    });
  };

  private notify(online: boolean) {
    this.listeners.forEach(listener => listener(online));
  }

  public get isOnline() {
    return this._isOnline;
  }

  public subscribe(listener: (online: boolean) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
    this.listeners.clear();
  }
}

// Singleton instance
export const networkMonitor = new NetworkMonitor();

/**
 * Validation helpers
 */
export function validateRequired(value: unknown, fieldName: string): void {
  if (!value || (typeof value === 'string' && !value.trim())) {
    throw new Error(`${fieldName} is required`);
  }
}

export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Please enter a valid email address');
  }
}

export function validatePassword(password: string): void {
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }
}
