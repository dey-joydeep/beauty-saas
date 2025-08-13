module.exports = {
  extends: ['angular', 'plugin:prettier/recommended', 'plugin:sonarjs/recommended'],
  plugins: ['sonarjs', 'eslint-plugin-import-helpers'],
  rules: {
    // Angular-specific rules
    '@angular-eslint/component-class-suffix': 'error',
    '@angular-eslint/directive-class-suffix': 'error',
    '@angular-eslint/no-input-rename': 'error',
    '@angular-eslint/no-output-rename': 'error',

    // TypeScript rules
    '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'no-public' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

    // Performance rules
    'sonarjs/cognitive-complexity': ['error', 15],
    'max-lines-per-function': ['warn', 50],
    'max-params': ['error', 4],

    // Code organization
    'import-helpers/order-imports': [
      'warn',
      {
        newlinesBetween: 'always',
        groups: ['module', '/^@angular/', '/^@app\//', ['parent', 'sibling', 'index']],
        alphabetize: { order: 'asc', ignoreCase: true },
      },
    ],
  },
  overrides: [
    {
      files: ['*.component.ts'],
      rules: {
        'max-lines-per-function': 'off',
      },
    },
    {
      files: ['*.spec.ts'],
      rules: {
        'max-lines': ['warn', 200],
        'sonarjs/no-duplicate-string': 'off',
      },
    },
  ],
};
