import js from '@eslint/js';
import ts from 'typescript-eslint';
import base from '../../../eslint.base.js';
import nx from '@nx/eslint-plugin';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    languageOptions: {
      parser: ts.parser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
];
