module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  globals: {
    // DOM types
    DocumentReadyState: 'readonly',
    RequestInfo: 'readonly',
    RequestInit: 'readonly',
    EventListenerOrEventListenerObject: 'readonly',
    AddEventListenerOptions: 'readonly',
    FrameRequestCallback: 'readonly',
    Console: 'readonly',
  },
  extends: ['eslint:recommended', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    // Prettier integration
    'prettier/prettier': 'error',

    // General code quality rules
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-alert': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',
    'prefer-arrow-callback': 'error',
    'arrow-spacing': 'error',
    'no-duplicate-imports': 'error',
    'no-useless-constructor': 'error',
    'no-unused-expressions': 'error',
    'no-return-assign': 'error',
    'no-sequences': 'error',
    'no-throw-literal': 'error',
    'no-unmodified-loop-condition': 'error',
    'no-useless-concat': 'error',
    'no-useless-return': 'error',
    'prefer-promise-reject-errors': 'error',
    'require-await': 'error',
    yoda: 'error',

    // Code organization (import sorting disabled for now)

    // Complexity and maintainability (relaxed for now)
    complexity: ['warn', 20],
    'max-depth': ['warn', 6],
    'max-lines': ['warn', 500],
    'max-lines-per-function': ['warn', 100],
    'max-params': ['warn', 6],
    'max-nested-callbacks': ['warn', 5],
  },
  overrides: [
    {
      // Test files have different rules
      files: ['**/*.test.ts', '**/*.test.js', '**/test-utils.ts'],
      env: {
        jest: true,
      },
      rules: {
        'no-console': 'off',
        'max-lines-per-function': 'off',
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'no-var': 'off',
        'require-await': 'off',
        'max-lines': 'off',
      },
    },
    {
      // Configuration files
      files: ['*.config.js', '*.config.ts', 'vite.config.ts'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
  ignorePatterns: ['dist/', 'node_modules/', '*.min.js', 'coverage/', '.vite/'],
};
