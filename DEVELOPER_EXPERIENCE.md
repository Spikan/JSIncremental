# 🚀 Developer Experience Guide

This document outlines the enhanced developer experience features added to the Soda Clicker Pro project.

## 🛠️ Code Quality Tools

### ESLint

- **Configuration**: `.eslintrc.js`
- **Purpose**: Advanced code linting with TypeScript support
- **Features**:
  - Strict TypeScript rules
  - Code complexity limits
  - Import sorting
  - Consistent code style enforcement

### Prettier

- **Configuration**: `.prettierrc`
- **Purpose**: Automatic code formatting
- **Features**:
  - Consistent indentation (2 spaces)
  - Single quotes
  - Trailing commas
  - 100 character line width

### TypeScript Configuration

- **File**: `tsconfig.json`
- **Enhancements**:
  - ES2022 target
  - Strict type checking
  - No unchecked indexed access
  - Exact optional property types

## 🔧 Available Scripts

### Code Quality

```bash
# Run all quality checks
npm run quality

# Lint code
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Check formatting
npm run format:check

# Format code automatically
npm run format

# Type checking
npm run type-check

# Fix all issues automatically
npm run fix
```

### Development

```bash
# Start development server
npm run dev

# Run tests
npm run test

# Watch mode tests
npm run test:watch

# Test coverage
npm run test:coverage

# Test UI
npm run test:ui
```

## 🪝 Git Hooks (Husky)

### Pre-commit Hook

- **File**: `.husky/pre-commit`
- **Actions**:
  - ESLint validation
  - Prettier formatting check
  - TypeScript type checking

### Commit Message Hook

- **File**: `.husky/commit-msg`
- **Purpose**: Enforce conventional commit messages
- **Format**: `type(scope): description`

### Conventional Commit Types

- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test changes
- `chore`: Maintenance tasks

## 📝 Lint-staged Configuration

- **File**: `.lintstagedrc.js`
- **Purpose**: Run linting only on staged files
- **Actions**:
  - ESLint + auto-fix for JS/TS files
  - Prettier formatting for all files
  - TypeScript type checking for TS files

## 🎯 Code Quality Rules

### ESLint Rules

- **Complexity**: Max 10 cyclomatic complexity
- **Depth**: Max 4 nesting levels
- **Lines**: Max 300 lines per file, 50 per function
- **Parameters**: Max 4 function parameters
- **Callbacks**: Max 3 nested callbacks

### TypeScript Rules

- **Strict mode**: Enabled
- **No implicit returns**: Required
- **No unchecked indexed access**: Required
- **Exact optional properties**: Required
- **No unreachable code**: Allowed

## 🔍 IDE Integration

### VS Code Extensions (Recommended)

- ESLint
- Prettier
- TypeScript Importer
- Error Lens

### VS Code Settings

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

## 🚨 Common Issues & Solutions

### ESLint Errors

```bash
# Auto-fix all issues
npm run lint:fix

# Check specific file
npx eslint ts/core/state/zustand-store.ts
```

### Prettier Issues

```bash
# Format specific file
npx prettier --write ts/core/state/zustand-store.ts

# Check formatting
npm run format:check
```

### TypeScript Errors

```bash
# Check types
npm run type-check

# Check specific file
npx tsc --noEmit ts/core/state/zustand-store.ts
```

## 📊 Quality Metrics

### Code Coverage

- **Target**: >80% coverage
- **Command**: `npm run test:coverage`
- **Report**: Generated in `coverage/` directory

### Bundle Analysis

- **Command**: `npm run build:analyze`
- **Output**: `dist/stats.html`
- **Purpose**: Identify bundle size issues

### Performance Monitoring

- **Available**: Via `performanceMonitor` global
- **Metrics**: Web Vitals, memory usage, FPS
- **Command**: Access via global `performanceMonitor` in browser console

## 🔄 Workflow Integration

### Pre-commit Process

1. Stage your changes: `git add .`
2. Commit: `git commit -m "feat: add new feature"`
3. Hooks automatically run:
   - ESLint validation
   - Prettier formatting check
   - TypeScript type checking
4. If all pass, commit succeeds
5. If any fail, fix issues and try again

### Continuous Integration

- All quality checks run on PR
- Coverage reports generated
- Bundle analysis performed
- Performance metrics tracked

## 📚 Best Practices

### Code Organization

- Use consistent import sorting
- Group imports by type (external, internal, relative)
- Maintain single responsibility principle
- Keep functions under 50 lines

### Type Safety

- Avoid `any` types
- Use strict TypeScript settings
- Define proper interfaces
- Handle null/undefined explicitly

### Performance

- Monitor bundle size
- Track performance metrics
- Use lazy loading where appropriate
- Optimize critical rendering paths

## 🆘 Getting Help

### Debugging

```bash
# Verbose test output
npm run test:debug

# Watch mode with UI
npm run test:ui

# Development server
npm run dev
```

### Documentation

- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [TypeScript Config](https://www.typescriptlang.org/tsconfig)
- [Husky Documentation](https://typicode.github.io/husky/)

---

## ⚛️ Extreme Number Precision Testing

### Testing break_eternity.js Integration

The project uses **break_eternity.js** for handling numbers beyond JavaScript's native limits (1e308+). When testing, ensure extreme values maintain precision:

#### **Available Test Functions**

```javascript
// Test extreme values from browser console
addExtremeResources(); // Adds 1e2000 of all resources
addMassiveSips(); // Adds 1e500 sips
testScientificNotation(); // Progressive scaling test
resetAllResources(); // Clean slate
```

#### **Precision Verification**

```javascript
// ✅ Verify extreme values work correctly
const extreme = new Decimal('1e2000');
console.log(extreme.toString()); // "1e2000" ✅ (preserves precision)
console.log(extreme.toNumber()); // Infinity ❌ (expected, but don't use for display)
```

#### **Testing Best Practices**

- **Always test with extreme values** (1e2000+) during development
- **Never use `.toNumber()`** for display - it destroys precision
- **Use `.toString()`** for all UI display and storage
- **Verify save/load** works with extreme values
- **Check console warnings** for precision loss attempts

### Extreme Value Test Scenarios

#### **Basic Scaling Test**

```javascript
resetAllResources();
addExtremeResources(); // 1e2000 of everything
// Check that UI displays scientific notation correctly
// Verify calculations don't crash
// Test save/load functionality
```

#### **Progressive Scaling Test**

```javascript
resetAllResources();
testScientificNotation(); // Watch 1e100 → 1e5000 progression
// Should see smooth scientific notation display
// No performance degradation
```

#### **Edge Case Testing**

```javascript
// Test boundary values
const boundary1 = new Decimal('1e308'); // JavaScript limit
const boundary2 = new Decimal('1e309'); // Beyond JavaScript limit
console.log(boundary1.toString()); // Should work
console.log(boundary2.toString()); // Should work with break_eternity.js
```

### Precision Safety Checklist

When adding new code that handles numbers:

- [ ] **No `.toNumber()` calls** on Decimal objects for display
- [ ] **Use `.toString()`** for all UI rendering
- [ ] **Direct Decimal arithmetic** (`decimal.add()`, `decimal.mul()`)
- [ ] **Type annotations** use `DecimalType`, not raw `Decimal`
- [ ] **Test with extreme values** (1e2000+)
- [ ] **Verify save/load compatibility**

### Performance Testing

#### **Benchmark Extreme Calculations**

```javascript
// Test calculation performance with extreme values
const hugeValue = new Decimal('1e1000');
const start = performance.now();

// Perform calculations
for (let i = 0; i < 1000; i++) {
  hugeValue.add(new Decimal('1e500')).mul(new Decimal('2'));
}

const end = performance.now();
console.log(`1000 calculations took: ${end - start}ms`);
// Should be sub-millisecond performance
```

#### **Memory Usage Verification**

```javascript
// Verify memory efficiency
const extremeValues = [];
for (let i = 0; i < 10000; i++) {
  extremeValues.push(new Decimal(`1e${1000 + i}`));
}
console.log('Created 10,000 extreme values');
// Memory usage should remain reasonable
```

---

**Remember**: Quality tools are here to help, not hinder. Use them to write better, more maintainable code! 🎯

**Precision Reminder**: Always test with extreme values (1e2000+) to ensure your code handles the full range that break_eternity.js enables! ⚛️
