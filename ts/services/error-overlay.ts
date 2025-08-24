// Enhanced Error Handling System (TypeScript)

declare global {
  interface Window {
    __ERROR_OVERLAY_ATTACHED__?: boolean;
    errorReporter?: ErrorReporter;
  }
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Error categories
export enum ErrorCategory {
  RUNTIME = 'runtime',
  NETWORK = 'network',
  STORAGE = 'storage',
  VALIDATION = 'validation',
  UI = 'ui',
  PERFORMANCE = 'performance',
  SYSTEM = 'system',
}

// Error context interface
export interface ErrorContext {
  component?: string;
  operation?: string;
  userAgent?: string;
  url?: string;
  timestamp: number;
  sessionId?: string;
  userId?: string;
  gameState?: any;
  stackTrace?: string | undefined;
}

// Enhanced error interface
export interface AppError {
  id: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  context: ErrorContext;
  originalError?: Error;
  recovery?: {
    attempted: boolean;
    successful: boolean;
    action?: string;
  };
}

// Error reporter class
class ErrorReporter {
  private errors: AppError[] = [];
  private maxErrors = 50;
  private sessionId: string;
  private isReportingEnabled = true;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeErrorHandling();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeErrorHandling(): void {
    // Global error handler
    window.addEventListener('error', event => {
      this.handleGlobalError(event);
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', event => {
      this.handleUnhandledRejection(event);
    });

    // React error boundary fallback (if React is used)
    window.addEventListener('error', event => {
      if (event.message?.includes('React') || event.filename?.includes('react')) {
        this.handleReactError(event);
      }
    });
  }

  private handleGlobalError(event: ErrorEvent): void {
    const appError: AppError = {
      id: this.generateErrorId(),
      message: event.message || 'Unknown runtime error',
      category: ErrorCategory.RUNTIME,
      severity: this.classifyErrorSeverity(event.message),
      context: {
        component: 'global',
        operation: 'runtime_execution',
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: Date.now(),
        sessionId: this.sessionId,
        stackTrace: event.error?.stack,
      },
      originalError: event.error,
    };

    this.reportError(appError);
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    const reason = event.reason;
    const message = reason instanceof Error ? reason.message : String(reason);

    const appError: AppError = {
      id: this.generateErrorId(),
      message: `Unhandled promise rejection: ${message}`,
      category: ErrorCategory.RUNTIME,
      severity: ErrorSeverity.HIGH,
      context: {
        component: 'promise',
        operation: 'async_operation',
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: Date.now(),
        sessionId: this.sessionId,
        stackTrace: reason instanceof Error ? reason.stack : undefined,
      },
      originalError: reason instanceof Error ? reason : new Error(String(reason)),
    };

    this.reportError(appError);
  }

  private handleReactError(event: ErrorEvent): void {
    const appError: AppError = {
      id: this.generateErrorId(),
      message: event.message || 'React error',
      category: ErrorCategory.UI,
      severity: ErrorSeverity.HIGH,
      context: {
        component: 'react',
        operation: 'component_rendering',
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: Date.now(),
        sessionId: this.sessionId,
        stackTrace: event.error?.stack,
      },
      originalError: event.error,
    };

    this.reportError(appError);
  }

  private classifyErrorSeverity(message: string): ErrorSeverity {
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes('out of memory') ||
      lowerMessage.includes('stack overflow') ||
      lowerMessage.includes('maximum call stack')
    ) {
      return ErrorSeverity.CRITICAL;
    }

    if (
      lowerMessage.includes('network') ||
      lowerMessage.includes('fetch') ||
      lowerMessage.includes('xhr') ||
      lowerMessage.includes('connection')
    ) {
      return ErrorSeverity.HIGH;
    }

    if (
      lowerMessage.includes('undefined') ||
      lowerMessage.includes('null') ||
      lowerMessage.includes('cannot read') ||
      lowerMessage.includes('not a function')
    ) {
      return ErrorSeverity.MEDIUM;
    }

    return ErrorSeverity.LOW;
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public API
  public reportError(error: AppError): void {
    // Add to error history
    this.errors.push(error);

    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Log error
    this.logError(error);

    // Show error overlay for high/critical errors
    if (error.severity === ErrorSeverity.HIGH || error.severity === ErrorSeverity.CRITICAL) {
      this.showErrorOverlay(error);
    }

    // Attempt recovery if possible
    this.attemptRecovery(error);

    // Send to external reporting service (if configured)
    this.sendToExternalService(error);
  }

  private logError(error: AppError): void {
    const severityIcon = {
      [ErrorSeverity.LOW]: '🟡',
      [ErrorSeverity.MEDIUM]: '🟠',
      [ErrorSeverity.HIGH]: '🔴',
      [ErrorSeverity.CRITICAL]: '💥',
    };

    console.error(
      `${severityIcon[error.severity]} [${error.category.toUpperCase()}] ${error.message}`,
      error.context,
      error.originalError
    );
  }

  private showErrorOverlay(error: AppError): void {
    // Show error overlay (existing functionality)
    if (window.__ERROR_OVERLAY_ATTACHED__) {
      const overlay = document.getElementById('error-overlay');
      if (overlay) {
        const list = overlay.querySelector('div[role="log"]');
        if (list) {
          const item = document.createElement('div');
          item.style.margin = '6px 0';
          item.style.whiteSpace = 'pre-wrap';
          item.textContent = `${error.category.toUpperCase()}: ${error.message}`;
          list.appendChild(item);
          overlay.style.display = 'block';
        }
      }
    }
  }

  private attemptRecovery(error: AppError): void {
    let recoveryAttempted = false;
    let recoverySuccessful = false;
    let recoveryAction: string | undefined;

    try {
      switch (error.category) {
        case ErrorCategory.STORAGE:
          // Try to clear corrupted storage
          if (error.message.includes('localStorage') || error.message.includes('JSON')) {
            recoveryAction = 'clear_corrupted_storage';
            localStorage.clear();
            recoverySuccessful = true;
          }
          break;

        case ErrorCategory.UI:
          // Try to reset UI state
          if (error.message.includes('DOM') || error.message.includes('element')) {
            recoveryAction = 'reset_ui_state';
            // Clear DOM cache
            if ((window as any).DOM_CACHE) {
              (window as any).DOM_CACHE = {};
            }
            recoverySuccessful = true;
          }
          break;

        case ErrorCategory.VALIDATION:
          // Try to reset to default values
          recoveryAction = 'reset_to_defaults';
          // This would be handled by the calling code
          recoverySuccessful = true;
          break;
      }

      recoveryAttempted = true;
    } catch (recoveryError) {
      console.error('Recovery attempt failed:', recoveryError);
    }

    // Update error with recovery info
    const recovery: typeof error.recovery = {
      attempted: recoveryAttempted,
      successful: recoverySuccessful,
      ...(recoveryAction && { action: recoveryAction }),
    };
    error.recovery = recovery;
  }

  private sendToExternalService(error: AppError): void {
    if (!this.isReportingEnabled) return;

    // Send to analytics service if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'error_occurred', {
        error_id: error.id,
        error_category: error.category,
        error_severity: error.severity,
        error_message: error.message,
        session_id: error.context.sessionId,
      });
    }
  }

  // Public methods
  public getErrors(): AppError[] {
    return [...this.errors];
  }

  public getErrorsBySeverity(severity: ErrorSeverity): AppError[] {
    return this.errors.filter(error => error.severity === severity);
  }

  public getErrorsByCategory(category: ErrorCategory): AppError[] {
    return this.errors.filter(error => error.category === category);
  }

  public clearErrors(): void {
    this.errors = [];
  }

  public setReportingEnabled(enabled: boolean): void {
    this.isReportingEnabled = enabled;
  }

  public generateErrorReport(): string {
    const errorCounts = {
      [ErrorCategory.RUNTIME]: 0,
      [ErrorCategory.NETWORK]: 0,
      [ErrorCategory.STORAGE]: 0,
      [ErrorCategory.VALIDATION]: 0,
      [ErrorCategory.UI]: 0,
      [ErrorCategory.PERFORMANCE]: 0,
      [ErrorCategory.SYSTEM]: 0,
    };

    this.errors.forEach(error => {
      errorCounts[error.category]++;
    });

    let report = `🚨 Error Report - Session: ${this.sessionId}\n`;
    report += `Total Errors: ${this.errors.length}\n\n`;

    report += `Error Breakdown by Category:\n`;
    Object.entries(errorCounts).forEach(([category, count]) => {
      if (count > 0) {
        report += `- ${category}: ${count}\n`;
      }
    });

    if (this.errors.length > 0) {
      report += `\nRecent Errors:\n`;
      const recentErrors = this.errors.slice(-5);
      recentErrors.forEach((error, index) => {
        report += `${index + 1}. [${error.severity.toUpperCase()}] ${error.category}: ${error.message}\n`;
      });
    }

    return report;
  }
}

// ErrorReporter class already exported above

// Initialize error reporter
export const errorReporter = new ErrorReporter();

// Make it globally available
if (typeof window !== 'undefined') {
  window.errorReporter = errorReporter;
}

(function attachErrorOverlay(): void {
  if (window.__ERROR_OVERLAY_ATTACHED__) return;
  window.__ERROR_OVERLAY_ATTACHED__ = true;

  const overlay = document.createElement('div');
  overlay.id = 'error-overlay';
  overlay.style.position = 'fixed';
  overlay.style.right = '8px';
  overlay.style.bottom = '8px';
  overlay.style.maxWidth = '38vw';
  overlay.style.maxHeight = '40vh';
  overlay.style.overflow = 'auto';
  overlay.style.background = 'rgba(220, 50, 47, 0.95)';
  overlay.style.color = '#fff';
  overlay.style.font = '12px/1.4 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
  overlay.style.padding = '8px 10px';
  overlay.style.borderRadius = '6px';
  overlay.style.boxShadow = '0 4px 16px rgba(0,0,0,0.3)';
  overlay.style.zIndex = '99999';
  overlay.style.display = 'none';

  const header = document.createElement('div');
  header.textContent = 'Runtime Errors';
  header.style.fontWeight = '700';
  header.style.marginBottom = '6px';

  const list = document.createElement('div');
  list.setAttribute('role', 'log');

  overlay.appendChild(header);
  overlay.appendChild(list);
  document.body.appendChild(overlay);

  function show(msg: string): void {
    overlay.style.display = 'block';
    const item = document.createElement('div');
    item.style.margin = '6px 0';
    item.style.whiteSpace = 'pre-wrap';
    item.textContent = msg;
    list.appendChild(item);
  }

  window.addEventListener('error', e => {
    try {
      const src = (e as ErrorEvent).filename
        ? `\n@ ${(e as ErrorEvent).filename}:${(e as ErrorEvent).lineno}:${(e as ErrorEvent).colno}`
        : '';
      const msg = (e as ErrorEvent).message || (e as any).error?.message || 'Unknown error';
      show(`Error: ${msg}${src}`);
    } catch (error) {
      console.warn('Error overlay failed to handle error event:', error);
    }
  });

  window.addEventListener('unhandledrejection', e => {
    try {
      const reason: any = (e as PromiseRejectionEvent).reason;
      const msg = typeof reason === 'string' ? reason : reason?.message || JSON.stringify(reason);
      show(`Unhandled Promise rejection: ${msg}`);
    } catch (error) {
      console.warn('Error overlay failed to handle unhandled rejection:', error);
    }
  });

  overlay.addEventListener('click', () => {
    overlay.style.display = 'none';
    list.innerHTML = '';
  });
})();

// Circuit Breaker Pattern for Runtime Safety
export class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private failureThreshold = 5,
    private timeout = 60000, // 1 minute
    private serviceName = 'unknown'
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'half-open';
      } else {
        throw new Error(`Circuit breaker is OPEN for ${this.serviceName}. Too many failures.`);
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = 'closed';
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'open';
    }
  }

  public getState(): string {
    return `${this.serviceName}: ${this.state} (${this.failureCount}/${this.failureThreshold})`;
  }

  public reset(): void {
    this.failureCount = 0;
    this.state = 'closed';
    this.lastFailureTime = 0;
  }
}

// Create circuit breakers for critical services
export const storageCircuitBreaker = new CircuitBreaker(3, 30000, 'storage');
export const uiCircuitBreaker = new CircuitBreaker(5, 60000, 'ui');
export const networkCircuitBreaker = new CircuitBreaker(3, 120000, 'network');

// ErrorReporter class and enums are already exported above
// errorReporter instance is exported above
