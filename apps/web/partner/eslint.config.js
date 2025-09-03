import js from '@eslint/js';
import webBase from '../../../eslint.base.web.js';

export default [
  ...webBase,
  // Base JavaScript configuration
  {
    files: ['**/*.js'],
    ignores: ['node_modules/**', 'dist/**', 'coverage/**'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      ...js.configs.recommended.rules,
      quotes: ['error', 'single'],
      'no-unused-vars': 'warn',
    },
  },

  // TypeScript configuration (project-specific rules; parser set in base)
  {
    files: ['**/*.ts'],
    ignores: ['node_modules/**', 'dist/**', 'coverage/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
];
