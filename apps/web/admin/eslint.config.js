import js from '@eslint/js';
import base from '../../../eslint.base.js';
import nx from '@nx/eslint-plugin';

export default [
  ...base,
  // Angular presets (TS + HTML templates)
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],
  // HTML templates: disable TS-only comments rule
  {
    files: ['**/*.html'],
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
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

  // TypeScript configuration
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
