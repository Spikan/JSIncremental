// Standardized error types and categories for consistent error handling

export enum ErrorCategory {
  CRITICAL = 'CRITICAL', // Game-breaking errors that should stop execution
  WARNING = 'WARNING', // Non-critical errors that should be logged but allow continuation
  VALIDATION = 'VALIDATION', // Input validation errors
  NETWORK = 'NETWORK', // Network-related errors
  STORAGE = 'STORAGE', // Storage/save-related errors
  UI = 'UI', // UI-related errors
  STATE = 'STATE', // State management errors
  CALCULATION = 'CALCULATION', // Mathematical calculation errors
  SYSTEM = 'SYSTEM', // System-level errors
}

export enum ErrorSeverity {
  LOW = 'LOW', // Minor issues that don't affect gameplay
  MEDIUM = 'MEDIUM', // Issues that may affect some functionality
  HIGH = 'HIGH', // Issues that significantly impact gameplay
  CRITICAL = 'CRITICAL', // Issues that break the game
}

export interface GameError extends Error {
  category: ErrorCategory;
  severity: ErrorSeverity;
  context: Record<string, any> | undefined;
  recoverable: boolean;
  timestamp: number;
  operation: string | undefined;
}

export class CriticalGameError extends Error implements GameError {
  category = ErrorCategory.CRITICAL;
  severity = ErrorSeverity.CRITICAL;
  recoverable = false;
  timestamp = Date.now();
  context: Record<string, any> | undefined;
  operation: string | undefined;

  constructor(message: string, operation?: string, context?: Record<string, any>) {
    super(message);
    this.name = 'CriticalGameError';
    this.operation = operation;
    this.context = context;
  }
}

export class WarningGameError extends Error implements GameError {
  category = ErrorCategory.WARNING;
  severity = ErrorSeverity.MEDIUM;
  recoverable = true;
  timestamp = Date.now();
  context: Record<string, any> | undefined;
  operation: string | undefined;

  constructor(message: string, operation?: string, context?: Record<string, any>) {
    super(message);
    this.name = 'WarningGameError';
    this.operation = operation;
    this.context = context;
  }
}

export class ValidationGameError extends Error implements GameError {
  category = ErrorCategory.VALIDATION;
  severity = ErrorSeverity.LOW;
  recoverable = true;
  timestamp = Date.now();
  context: Record<string, any> | undefined;
  operation: string | undefined;

  constructor(message: string, operation?: string, context?: Record<string, any>) {
    super(message);
    this.name = 'ValidationGameError';
    this.operation = operation;
    this.context = context;
  }
}

export class StorageGameError extends Error implements GameError {
  category = ErrorCategory.STORAGE;
  severity = ErrorSeverity.HIGH;
  recoverable = true;
  timestamp = Date.now();
  context: Record<string, any> | undefined;
  operation: string | undefined;

  constructor(message: string, operation?: string, context?: Record<string, any>) {
    super(message);
    this.name = 'StorageGameError';
    this.operation = operation;
    this.context = context;
  }
}

export class StateGameError extends Error implements GameError {
  category = ErrorCategory.STATE;
  severity = ErrorSeverity.HIGH;
  recoverable = true;
  timestamp = Date.now();
  context: Record<string, any> | undefined;
  operation: string | undefined;

  constructor(message: string, operation?: string, context?: Record<string, any>) {
    super(message);
    this.name = 'StateGameError';
    this.operation = operation;
    this.context = context;
  }
}

export class CalculationGameError extends Error implements GameError {
  category = ErrorCategory.CALCULATION;
  severity = ErrorSeverity.MEDIUM;
  recoverable = true;
  timestamp = Date.now();
  context: Record<string, any> | undefined;
  operation: string | undefined;

  constructor(message: string, operation?: string, context?: Record<string, any>) {
    super(message);
    this.name = 'CalculationGameError';
    this.operation = operation;
    this.context = context;
  }
}
