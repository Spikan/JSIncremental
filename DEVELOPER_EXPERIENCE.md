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
- **Available**: Via `App.performance` global
- **Metrics**: Web Vitals, memory usage, FPS
- **Command**: `npm run performance`

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

**Remember**: Quality tools are here to help, not hinder. Use them to write better, more maintainable code! 🎯
