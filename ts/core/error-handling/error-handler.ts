// Centralized error handling system with standardized patterns

import { logger } from '../../services/logger';
import {
  GameError,
  ErrorSeverity,
  CriticalGameError,
  WarningGameError,
  ValidationGameError,
  StorageGameError,
  StateGameError,
  CalculationGameError,
} from './error-types';

export interface ErrorHandlerConfig {
  enableErrorRecovery: boolean;
  enableErrorReporting: boolean;
  maxRetries: number;
  retryDelay: number;
}

class ErrorHandler {
  private config: ErrorHandlerConfig = {
    enableErrorRecovery: true,
    enableErrorReporting: true,
    maxRetries: 3,
    retryDelay: 1000,
  };

  private errorCounts: Map<string, number> = new Map();
  private recentErrors: GameError[] = [];

  configure(config: Partial<ErrorHandlerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Standardized error handling with proper categorization and logging
  handleError(error: unknown, operation?: string, context?: Record<string, any>): GameError {
    const gameError = this.categorizeError(error, operation, context);
    this.logError(gameError);
    this.trackError(gameError);

    if (gameError.severity === ErrorSeverity.CRITICAL) {
      this.handleCriticalError(gameError);
    }

    return gameError;
  }

  // Safe execution wrapper with automatic error handling
  async safeExecute<T>(
    operation: () => Promise<T> | T,
    operationName: string,
    context?: Record<string, any>,
    fallback?: T
  ): Promise<T | undefined> {
    try {
      const result = await operation();
      return result;
    } catch (error) {
      const gameError = this.handleError(error, operationName, context);

      if (this.config.enableErrorRecovery && gameError.recoverable) {
        if (fallback !== undefined) {
          logger.warn(`Using fallback value for ${operationName}:`, fallback);
          return fallback;
        }
      }

      if (gameError.severity === ErrorSeverity.CRITICAL) {
        throw gameError;
      }

      return undefined;
    }
  }

  // Retry mechanism for recoverable errors
  async retryOperation<T>(
    operation: () => Promise<T> | T,
    operationName: string,
    context?: Record<string, any>,
    maxRetries?: number
  ): Promise<T | undefined> {
    const retries = maxRetries ?? this.config.maxRetries;
    let lastError: GameError | undefined;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const result = await operation();
        if (attempt > 1) {
          logger.info(`Operation ${operationName} succeeded on attempt ${attempt}`);
        }
        return result;
      } catch (error) {
        lastError = this.handleError(error, operationName, { ...context, attempt });

        if (!lastError.recoverable || attempt === retries) {
          break;
        }

        logger.warn(
          `Retrying ${operationName} in ${this.config.retryDelay}ms (attempt ${attempt + 1}/${retries})`
        );
        await this.delay(this.config.retryDelay);
      }
    }

    logger.error(`Operation ${operationName} failed after ${retries} attempts`);
    return undefined;
  }

  // Validation helper with standardized error handling
  validate<T>(
    value: T,
    validator: (value: T) => boolean,
    errorMessage: string,
    context?: Record<string, any>
  ): T {
    if (!validator(value)) {
      throw new ValidationGameError(errorMessage, 'validation', { value, ...context });
    }
    return value;
  }

  // State operation wrapper with error handling
  safeStateOperation<T>(
    operation: () => T,
    operationName: string,
    context?: Record<string, any>
  ): T | undefined {
    try {
      return operation();
    } catch (error) {
      const gameError = this.handleError(error, operationName, context);

      if (gameError.severity === ErrorSeverity.CRITICAL) {
        throw gameError;
      }

      return undefined;
    }
  }

  // Storage operation wrapper with error handling
  async safeStorageOperation<T>(
    operation: () => Promise<T> | T,
    operationName: string,
    context?: Record<string, any>
  ): Promise<T | undefined> {
    try {
      return await operation();
    } catch (error) {
      const gameError = this.handleError(error, operationName, context);

      if (gameError.severity === ErrorSeverity.CRITICAL) {
        throw gameError;
      }

      return undefined;
    }
  }

  // Get error statistics
  getErrorStats(): {
    totalErrors: number;
    errorsByCategory: Record<string, number>;
    errorsBySeverity: Record<string, number>;
    recentErrors: GameError[];
  } {
    const errorsByCategory: Record<string, number> = {};
    const errorsBySeverity: Record<string, number> = {};

    this.recentErrors.forEach(error => {
      errorsByCategory[error.category] = (errorsByCategory[error.category] || 0) + 1;
      errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1;
    });

    return {
      totalErrors: this.recentErrors.length,
      errorsByCategory,
      errorsBySeverity,
      recentErrors: [...this.recentErrors],
    };
  }

  // Clear error history
  clearErrorHistory(): void {
    this.recentErrors = [];
    this.errorCounts.clear();
  }

  private categorizeError(
    error: unknown,
    operation?: string,
    context?: Record<string, any>
  ): GameError {
    if (error instanceof CriticalGameError) return error;
    if (error instanceof WarningGameError) return error;
    if (error instanceof ValidationGameError) return error;
    if (error instanceof StorageGameError) return error;
    if (error instanceof StateGameError) return error;
    if (error instanceof CalculationGameError) return error;

    // Categorize based on error message and context
    const message = error instanceof Error ? error.message : String(error);
    const errorString = message.toLowerCase();

    if (errorString.includes('critical') || errorString.includes('fatal')) {
      return new CriticalGameError(message, operation, context);
    }

    if (
      errorString.includes('storage') ||
      errorString.includes('save') ||
      errorString.includes('load')
    ) {
      return new StorageGameError(message, operation, context);
    }

    if (
      errorString.includes('state') ||
      errorString.includes('zustand') ||
      errorString.includes('store')
    ) {
      return new StateGameError(message, operation, context);
    }

    if (
      errorString.includes('validation') ||
      errorString.includes('invalid') ||
      errorString.includes('required')
    ) {
      return new ValidationGameError(message, operation, context);
    }

    if (
      errorString.includes('calculation') ||
      errorString.includes('decimal') ||
      errorString.includes('math')
    ) {
      return new CalculationGameError(message, operation, context);
    }

    // Default to warning for unknown errors
    return new WarningGameError(message, operation, context);
  }

  private logError(gameError: GameError): void {
    const logMessage = `[${gameError.category}] ${gameError.operation || 'Unknown operation'}: ${gameError.message}`;
    const logContext = {
      category: gameError.category,
      severity: gameError.severity,
      operation: gameError.operation,
      context: gameError.context,
      timestamp: gameError.timestamp,
    };

    switch (gameError.severity) {
      case ErrorSeverity.CRITICAL:
        logger.error(logMessage, logContext);
        break;
      case ErrorSeverity.HIGH:
        logger.error(logMessage, logContext);
        break;
      case ErrorSeverity.MEDIUM:
        logger.warn(logMessage, logContext);
        break;
      case ErrorSeverity.LOW:
        logger.info(logMessage, logContext);
        break;
    }
  }

  private trackError(gameError: GameError): void {
    this.recentErrors.push(gameError);

    // Keep only last 100 errors
    if (this.recentErrors.length > 100) {
      this.recentErrors = this.recentErrors.slice(-100);
    }

    // Track error counts
    const key = `${gameError.category}:${gameError.operation}`;
    this.errorCounts.set(key, (this.errorCounts.get(key) || 0) + 1);
  }

  private handleCriticalError(gameError: GameError): void {
    logger.error('CRITICAL ERROR - Game may be unstable:', gameError);

    // Could implement emergency save, error reporting, etc.
    if (this.config.enableErrorReporting) {
      this.reportError(gameError);
    }
  }

  private reportError(gameError: GameError): void {
    // Could send to error reporting service
    logger.error('Error reported:', gameError);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create singleton instance
export const errorHandler = new ErrorHandler();

// Export convenience functions
export const safeExecute = errorHandler.safeExecute.bind(errorHandler);
export const retryOperation = errorHandler.retryOperation.bind(errorHandler);
export const validate = errorHandler.validate.bind(errorHandler);
export const safeStateOperation = errorHandler.safeStateOperation.bind(errorHandler);
export const safeStorageOperation = errorHandler.safeStorageOperation.bind(errorHandler);

export default errorHandler;
