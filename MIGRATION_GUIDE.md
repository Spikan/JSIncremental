# Development Patterns & Guidelines

## 🎯 Current Development Practices

The codebase follows modern TypeScript development patterns with full type safety and modular architecture.

### Adding New UI Components

1. **Add HTML element** with `data-action="actionName"` attribute
2. **Handle in button dispatcher** (`ts/ui/buttons.ts`)
3. **Use modular functions** via `App.systems.*` or `App.ui.*` patterns

### Configuration Access

- Use `ts/core/systems/config-accessor.ts` to read upgrade/config data
- It prefers `App.data.upgrades` and falls back to `GAME_CONFIG.BALANCE`

### Function Organization

| Function Type      | Location                 | Access Pattern                          |
| ------------------ | ------------------------ | --------------------------------------- |
| Display Updates    | `ts/ui/displays.ts`      | `App.ui.functionName()`                 |
| Stats Management   | `ts/ui/stats.ts`         | `App.ui.functionName()`                 |
| Button Logic       | `ts/ui/buttons.ts`       | `App.ui.functionName()`                 |
| Game Mechanics     | `ts/core/rules/`         | `App.rules.functionName()`              |
| Storage Operations | `ts/services/storage.ts` | `App.storage.functionName()`            |
| System Operations  | `ts/core/systems/`       | `App.systems.systemName.functionName()` |

---

## ⚛️ break_eternity.js Migration - Extreme Number Precision

### Overview

The codebase has been migrated to use **break_eternity.js** for handling numbers beyond JavaScript's native limits (1e308+). This enables the game to handle extreme values like 1e2000, 1e5000, and beyond with full precision.

### Key Changes

#### 1. **Removed Dangerous toNumber() Function**

```typescript
// ❌ BEFORE: This was dangerous and caused precision loss
export function toNumber(value: NumericValue): number {
  if (isDecimal(value)) {
    return value.toNumber(); // Lost precision for extreme values!
  }
}

// ✅ AFTER: Completely removed - use .toString() instead
// toNumber() function no longer exists
```

#### 2. **Direct break_eternity.js Usage**

```typescript
// ✅ NEW: Direct library usage with full precision
const extremeValue = new Decimal('1e2000');
const displayValue = extremeValue.toString(); // ✅ "1e2000" (preserves precision)
const brokenValue = extremeValue.toNumber(); // ❌ Infinity (precision lost)
```

#### 3. **Safe Number Handling Patterns**

**✅ SAFE: Always use these methods:**

```typescript
// For display (preserves extreme values)
decimal.toString(); // Returns "1e2000", "1e5000", etc.

// For arithmetic (direct operations)
decimal.add(other); // Direct addition
decimal.mul(other); // Direct multiplication
decimal.gte(other); // Safe comparison

// For type conversion (safe mixed-type operations)
import { add, multiply, toDecimal } from '../numbers/migration-utils';
const result = add(userInput, gameState.value); // Handles any type safely
```

**❌ DANGEROUS: Never use these for extreme values:**

```typescript
// These destroy precision for values > 1e308
decimal.toNumber(); // ❌ Returns Infinity for 1e2000
Number(decimal); // ❌ Same precision loss
parseFloat(decimal); // ❌ Same precision loss
```

### Precision Safety Rules

#### **Display Values**

```typescript
// ✅ GOOD: Preserve precision for display
function displaySips(sips: DecimalType): string {
  return sips.toString(); // Always use .toString()
}

// ❌ BAD: Loses precision
function displaySips(sips: DecimalType): string {
  return sips.toNumber().toString(); // Precision lost!
}
```

#### **State Updates**

```typescript
// ✅ GOOD: Use strings for extreme values in state
w.sips = sipsValue.toString(); // Preserves 1e2000

// ❌ BAD: Converts to JavaScript number
w.sips = sipsValue.toNumber(); // Becomes Infinity
```

#### **Calculations**

```typescript
// ✅ GOOD: Direct Decimal arithmetic
const cost = nextStrawCost(straws, baseCost, scaling); // Returns Decimal
const canAfford = gte(currentSips, cost); // Safe comparison

// ❌ BAD: Convert to numbers first
const costNum = nextStrawCost(straws, baseCost, scaling).toNumber(); // Precision lost!
const canAfford = currentSips.toNumber() >= costNum; // Both lose precision
```

### File Structure Changes

#### **New Number System Files**

```
ts/core/numbers/
├── index.ts           # Main exports and utilities
├── migration-utils.ts # Safe type conversions & arithmetic
├── decimal-utils.ts   # Type guards and formatting
├── performance-utils.ts # Memoized calculations
└── test-large-number.ts # Extreme number testing
```

#### **Updated Core Files**

- All calculation functions now return `DecimalType`
- State management uses string representation for extreme values
- UI display functions preserve precision
- Save/load handles extreme values seamlessly

### Testing Extreme Values

#### **Dev Tools Available**

```javascript
// Add extreme resources for testing
addExtremeResources(); // Adds 1e2000 of all resources
addMassiveSips(); // Adds 1e500 sips
testScientificNotation(); // Progressive scaling test
```

#### **Console Verification**

```javascript
// Verify extreme values work correctly
const extreme = new Decimal('1e2000');
console.log(extreme.toString()); // "1e2000" ✅
console.log(extreme.toNumber()); // Infinity ❌ (expected for extreme values)
```

### Migration Checklist

- [x] Remove all `.toNumber()` calls on Decimal objects
- [x] Replace with `.toString()` for display/storage
- [x] Use direct Decimal arithmetic operations
- [x] Update type annotations to use `DecimalType`
- [x] Test with extreme values (1e2000+)
- [x] Verify save/load works with extreme values

### Performance Notes

- **Memory**: Large numbers use efficient representation
- **Speed**: Calculations remain fast even with extreme values
- **Display**: Scientific notation rendering is optimized
- **Storage**: JSON compression works well with large numbers

---

## 🏗️ Architecture Patterns

### State Management

- **Use Zustand selectors** for optimized re-renders
- **Subscribe to specific state** rather than entire store
- **Test environment bypass** available for testing

### Error Handling

- **Enterprise-grade error reporting** with 4 severity levels
- **Automatic recovery mechanisms** for common issues
- **Circuit breakers** for service protection

### Performance Optimization

- **Intelligent code splitting** for bundle optimization
- **Memoized computed selectors** for derived state
- **Granular subscriptions** to minimize re-renders

---
