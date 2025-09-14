// Production-optimized logging utility
// Replaces console.log calls with conditional logging for better performance

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LoggerConfig {
  level: LogLevel;
  enableInProduction: boolean;
  enableTimestamps: boolean;
  enableCallerInfo: boolean;
}

class Logger {
  private config: LoggerConfig;
  private isProduction: boolean;

  constructor() {
    this.isProduction = import.meta.env.PROD;
    this.config = {
      level: this.isProduction ? 'warn' : 'debug',
      enableInProduction: false,
      enableTimestamps: !this.isProduction,
      enableCallerInfo: !this.isProduction,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isProduction && !this.config.enableInProduction) {
      return level === 'error'; // Only log errors in production
    }

    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };

    return levels[level] >= levels[this.config.level];
  }

  private formatMessage(level: LogLevel, message: string, ...args: any[]): [string, ...any[]] {
    const parts: string[] = [];

    if (this.config.enableTimestamps) {
      parts.push(`[${new Date().toISOString()}]`);
    }

    parts.push(`[${level.toUpperCase()}]`);

    if (this.config.enableCallerInfo) {
      const stack = new Error().stack;
      const caller = stack?.split('\n')[3]?.trim() || 'unknown';
      parts.push(`(${caller})`);
    }

    parts.push(message);

    return [parts.join(' '), ...args];
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.log(...this.formatMessage('debug', message, ...args));
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info(...this.formatMessage('info', message, ...args));
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(...this.formatMessage('warn', message, ...args));
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(...this.formatMessage('error', message, ...args));
    }
  }

  // Performance-optimized logging for game loop
  gameLoop(message: string, ...args: any[]): void {
    if (!this.isProduction && this.shouldLog('debug')) {
      console.log(`[GAME] ${message}`, ...args);
    }
  }

  // Performance-optimized logging for UI updates
  uiUpdate(message: string, ...args: any[]): void {
    if (!this.isProduction && this.shouldLog('debug')) {
      console.log(`[UI] ${message}`, ...args);
    }
  }

  // Performance-optimized logging for state changes
  stateChange(message: string, ...args: any[]): void {
    if (!this.isProduction && this.shouldLog('debug')) {
      console.log(`[STATE] ${message}`, ...args);
    }
  }

  // Configure logger
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Get current configuration
  getConfig(): LoggerConfig {
    return { ...this.config };
  }

  // Check if logging is enabled for a level
  isEnabled(level: LogLevel): boolean {
    return this.shouldLog(level);
  }
}

// Create singleton instance
export const logger = new Logger();

// Export convenience functions
export const log = logger.debug.bind(logger);
export const info = logger.info.bind(logger);
export const warn = logger.warn.bind(logger);
export const error = logger.error.bind(logger);
export const gameLog = logger.gameLoop.bind(logger);
export const uiLog = logger.uiUpdate.bind(logger);
export const stateLog = logger.stateChange.bind(logger);

// Export for global access
if (typeof window !== 'undefined') {
  (window as any).logger = logger;
  (window as any).log = log;
  (window as any).info = info;
  (window as any).warn = warn;
  (window as any).error = error;
}

export default logger;
