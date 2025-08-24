module.exports = {
  extends: ['@commitlint/config-conventional'],

  rules: {
    // Enforce conventional commit types with game development focus
    'type-enum': [
      2,
      'always',
      [
        'feat',      // New feature
        'fix',       // Bug fix
        'docs',      // Documentation
        'style',     // Code style (formatting, etc.)
        'refactor',  // Code restructuring
        'test',      // Adding/updating tests
        'chore',     // Maintenance tasks
        'perf',      // Performance improvements
        'revert',    // Revert changes
        'build',     // Build system changes
        'ci',        // CI/CD changes
      ],
    ],

    // Type must be lowercase
    'type-case': [2, 'always', 'lowercase'],

    // Type cannot be empty
    'type-empty': [2, 'never'],

    // Subject must start with lowercase (unless it's a breaking change)
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],

    // Subject cannot be empty
    'subject-empty': [2, 'never'],

    // Subject should not end with a period
    'subject-full-stop': [2, 'never', '.'],

    // Header (type + scope + subject) max length: 100 characters
    'header-max-length': [2, 'always', 100],

    // Body should have leading blank line
    'body-leading-blank': [1, 'always'],

    // Footer should have leading blank line
    'footer-leading-blank': [1, 'always'],

    // Subject minimum length: 10 characters
    'subject-min-length': [2, 'always', 10],

    // Subject maximum length: 72 characters
    'subject-max-length': [2, 'always', 72],

    // Scope should be lowercase if present
    'scope-case': [2, 'always', 'lowercase'],

    // Allow specific scopes for game development
    'scope-enum': [
      2,
      'always',
      [
        'ui',        // User interface
        'state',     // State management
        'game',      // Game logic
        'system',    // Game systems
        'test',      // Testing
        'build',     // Build system
        'config',    // Configuration
        'docs',      // Documentation
        'lint',      // Linting/formatting
        'perf',      // Performance
        'refactor',  // Code refactoring
        'mobile',    // Mobile-specific code
        'bootstrap', // Initialization
        'save',      // Save/load system
      ],
    ],

    // Body should not be empty for non-trivial changes
    'body-empty': [1, 'never'],

    // Body should have minimum meaningful content
    'body-min-length': [1, 'always', 20],
  },
};
