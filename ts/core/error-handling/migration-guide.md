# Error Handling Migration Guide

## Overview

This guide outlines the migration from inconsistent error handling patterns to a standardized, robust error handling system.

## Current Issues

1. **Inconsistent logging**: Mix of `console.error`, `console.warn`, `console.log`
2. **No error categorization**: All errors treated the same way
3. **No error recovery**: Most errors just log and continue
4. **No error context**: Errors lack information about what operation failed
5. **No retry mechanisms**: No automatic retry for recoverable errors

## New Error Handling System

### Error Categories

- `CRITICAL`: Game-breaking errors that should stop execution
- `WARNING`: Non-critical errors that should be logged but allow continuation
- `VALIDATION`: Input validation errors
- `NETWORK`: Network-related errors
- `STORAGE`: Storage/save-related errors
- `UI`: UI-related errors
- `STATE`: State management errors
- `CALCULATION`: Mathematical calculation errors
- `SYSTEM`: System-level errors

### Error Severities

- `LOW`: Minor issues that don't affect gameplay
- `MEDIUM`: Issues that may affect some functionality
- `HIGH`: Issues that significantly impact gameplay
- `CRITICAL`: Issues that break the game

### Migration Patterns

#### Before (Inconsistent)

```typescript
try {
  // Some operation
  const result = riskyOperation();
  return result;
} catch (error) {
  console.error('Something failed:', error);
  return false;
}
```

#### After (Standardized)

```typescript
import { safeExecute, errorHandler } from '../core/error-handling/error-handler';

// Option 1: Safe execution with fallback
const result = await safeExecute(
  () => riskyOperation(),
  'riskyOperation',
  { additionalContext: 'value' },
  fallbackValue
);

// Option 2: Retry mechanism
const result = await retryOperation(() => riskyOperation(), 'riskyOperation', {
  additionalContext: 'value',
});

// Option 3: Direct error handling
try {
  const result = riskyOperation();
  return result;
} catch (error) {
  const gameError = errorHandler.handleError(error, 'riskyOperation', {
    additionalContext: 'value',
  });
  if (gameError.severity === ErrorSeverity.CRITICAL) {
    throw gameError;
  }
  return fallbackValue;
}
```

### State Operations

```typescript
// Before
try {
  useGameStore.setState({ sips: newSips });
} catch (error) {
  console.error('Failed to update sips:', error);
}

// After
import { safeStateOperation } from '../core/error-handling/error-handler';

const success = safeStateOperation(() => useGameStore.setState({ sips: newSips }), 'updateSips', {
  newSips,
  oldSips: currentSips,
});
```

### Storage Operations

```typescript
// Before
try {
  await AppStorage.save('gameData', data);
} catch (error) {
  console.error('Failed to save:', error);
}

// After
import { safeStorageOperation } from '../core/error-handling/error-handler';

const success = await safeStorageOperation(
  () => AppStorage.save('gameData', data),
  'saveGameData',
  { dataSize: JSON.stringify(data).length }
);
```

### Validation

```typescript
// Before
if (!isValid(value)) {
  console.warn('Invalid value:', value);
  return;
}

// After
import { validate } from '../core/error-handling/error-handler';

validate(value, isValid, 'Value must be valid', { value, expectedType: 'number' });
```

## Migration Priority

### Phase 1: Critical Systems (High Priority)

1. `ts/core/systems/purchases-system.ts` - Purchase operations
2. `ts/core/systems/save-system.ts` - Save/load operations
3. `ts/core/systems/state/zustand-store.ts` - State management
4. `ts/index.ts` - Main game loop

### Phase 2: UI Systems (Medium Priority)

1. `ts/ui/buttons.ts` - Button interactions
2. `ts/ui/index.ts` - UI updates
3. `ts/ui/displays.ts` - Display updates

### Phase 3: Utility Systems (Lower Priority)

1. `ts/core/systems/dev.ts` - Development tools
2. `ts/core/systems/options-system.ts` - Options management
3. `ts/services/*.ts` - Service layers

## Benefits

1. **Consistent error logging** with proper categorization
2. **Automatic error recovery** with retry mechanisms
3. **Better debugging** with contextual error information
4. **Performance monitoring** with error statistics
5. **Graceful degradation** with fallback values
6. **Centralized error handling** for easier maintenance

## Testing

After migration, test error scenarios:

1. Network failures
2. Storage failures
3. Invalid user input
4. State corruption
5. Calculation errors
6. UI rendering failures
