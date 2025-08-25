// Error recovery utilities for break_eternity.js Decimal operations
// Provides robust error handling and recovery strategies

import { isDecimal, DecimalType } from './decimal-utils';
import { isValidDecimalString } from './safe-conversion';

/**
 * Handles Decimal conversion errors with recovery strategies
 */
export class DecimalErrorRecovery {
  /**
   * Attempts to recover from a conversion error
   */
  static handleConversionError(value: any, context: string): DecimalType {
    console.error(`Decimal conversion error in ${context}:`, value);
    
    // Attempt recovery strategies
    if (typeof value === 'string') {
      // Try to extract numeric part
      const numericMatch = value.match(/-?\d+(\.\d+)?/);
      if (numericMatch) {
        try {
          return new (globalThis as any).Decimal(numericMatch[0]);
        } catch {
          // Continue to next recovery strategy
        }
      }
      
      // Try to clean the string
      const cleaned = value.replace(/[^\d.-]/g, '');
      if (cleaned && isValidDecimalString(cleaned)) {
        try {
          return new (globalThis as any).Decimal(cleaned);
        } catch {
          // Continue to next recovery strategy
        }
      }
    }
    
    // Try to convert to number first
    if (typeof value === 'number') {
      if (isFinite(value)) {
        try {
          return new (globalThis as any).Decimal(value);
        } catch {
          // Continue to fallback
        }
      }
    }
    
    // Fallback to safe default
    console.warn(`Using fallback value 0 for ${context}`);
    return new (globalThis as any).Decimal(0);
  }

  /**
   * Validates calculation results
   */
  static validateCalculation(result: DecimalType, operation: string): boolean {
    if (!isDecimal(result)) {
      console.error(`Invalid result from ${operation}:`, result);
      return false;
    }

    try {
      // Check if result is reasonable
      const num = result.toNumber();
      if (!isFinite(num)) {
        console.warn(`Non-finite result from ${operation}:`, result.toString());
        return false;
      }
      return true;
    } catch {
      console.warn(`Extreme result from ${operation}:`, result.toString());
      return true; // Extreme values are acceptable
    }
  }

  /**
   * Validates arithmetic operation inputs
   */
  static validateInputs(a: any, b: any, operation: string): boolean {
    const issues: string[] = [];
    
    if (!isDecimal(a) && typeof a !== 'number' && typeof a !== 'string') {
      issues.push(`Invalid first operand: ${typeof a}`);
    }
    
    if (!isDecimal(b) && typeof b !== 'number' && typeof b !== 'string') {
      issues.push(`Invalid second operand: ${typeof b}`);
    }
    
    if (issues.length > 0) {
      console.warn(`Input validation failed for ${operation}:`, issues.join(', '));
      return false;
    }
    
    return true;
  }

  /**
   * Attempts to recover from arithmetic operation errors
   */
  static handleArithmeticError(
    a: any, 
    b: any, 
    operation: string, 
    error: any
  ): DecimalType {
    console.error(`Arithmetic error in ${operation}:`, error);
    console.error('Operands:', { a, b });
    
    // Try to convert operands to safe values
    const safeA = this.convertToSafeDecimal(a);
    const safeB = this.convertToSafeDecimal(b);
    
    try {
      switch (operation) {
        case 'add':
          return safeA.add(safeB);
        case 'subtract':
          return safeA.sub(safeB);
        case 'multiply':
          return safeA.mul(safeB);
        case 'divide':
          return safeB.eq(0) ? new (globalThis as any).Decimal(0) : safeA.div(safeB);
        default:
          return new (globalThis as any).Decimal(0);
      }
    } catch (recoveryError) {
      console.error(`Recovery failed for ${operation}:`, recoveryError);
      return new (globalThis as any).Decimal(0);
    }
  }

  /**
   * Converts any value to a safe Decimal
   */
  private static convertToSafeDecimal(value: any): DecimalType {
    if (isDecimal(value)) {
      return value;
    }
    
    if (typeof value === 'number') {
      if (isFinite(value)) {
        return new (globalThis as any).Decimal(value);
      }
      return new (globalThis as any).Decimal(0);
    }
    
    if (typeof value === 'string') {
      if (isValidDecimalString(value)) {
        try {
          return new (globalThis as any).Decimal(value);
        } catch {
          // Continue to fallback
        }
      }
    }
    
    return new (globalThis as any).Decimal(0);
  }
}

/**
 * Performance monitoring for extreme value operations
 */
export class ExtremeValueMonitor {
  private static instance: ExtremeValueMonitor;
  private extremeValueCount = 0;
  private performanceWarnings: string[] = [];
  private operationCounts = new Map<string, number>();

  static getInstance(): ExtremeValueMonitor {
    if (!ExtremeValueMonitor.instance) {
      ExtremeValueMonitor.instance = new ExtremeValueMonitor();
    }
    return ExtremeValueMonitor.instance;
  }

  /**
   * Checks if a Decimal operation might impact performance
   */
  checkPerformance(decimal: DecimalType, operation: string): void {
    if (!isDecimal(decimal)) return;

    // Track operation counts
    const currentCount = this.operationCounts.get(operation) || 0;
    this.operationCounts.set(operation, currentCount + 1);

    try {
      const num = decimal.toNumber();
      if (!isFinite(num) || num >= 1e100) {
        this.extremeValueCount++;
        
        if (this.extremeValueCount > 100) {
          const warning = `High extreme value usage detected: ${this.extremeValueCount} operations`;
          if (!this.performanceWarnings.includes(warning)) {
            this.performanceWarnings.push(warning);
            console.warn(warning, 'Operation:', operation);
          }
        }
      }
    } catch {
      // Value is too extreme even for toNumber()
      this.extremeValueCount++;
    }
  }

  /**
   * Gets performance statistics
   */
  getStats() {
    return {
      extremeValueCount: this.extremeValueCount,
      warnings: this.performanceWarnings.length,
      operationCounts: Object.fromEntries(this.operationCounts),
    };
  }

  /**
   * Resets monitoring state
   */
  reset() {
    this.extremeValueCount = 0;
    this.performanceWarnings = [];
    this.operationCounts.clear();
  }

  /**
   * Checks if performance optimization is needed
   */
  needsOptimization(): boolean {
    return this.extremeValueCount > 50;
  }
}

/**
 * Global error handler for Decimal operations
 */
export function setupGlobalErrorHandling(): void {
  if (typeof window === 'undefined') return;

  // Override console.error to capture Decimal-related errors
  const originalError = console.error;
  console.error = (...args: any[]) => {
    const message = args.join(' ');
    
    // Check if this is a Decimal-related error
    if (message.includes('Decimal') || message.includes('toNumber') || message.includes('Infinity')) {
      console.warn('Decimal-related error detected:', message);
      
      // Log to performance monitor
      ExtremeValueMonitor.getInstance().checkPerformance(
        new (globalThis as any).Decimal(0), 
        'error-handling'
      );
    }
    
    originalError.apply(console, args);
  };
}