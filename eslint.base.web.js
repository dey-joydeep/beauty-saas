import base from './eslint.base.js';
import nx from '@nx/eslint-plugin';

// Centralized web (Angular) ESLint base
// - Extends the root base (type-aware TS, module boundaries, etc.)
// - Adds Angular TS + template presets for web apps/libs
export default [
  ...base,
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],
  // Safety: explicitly disable TS-only rules on HTML templates
  {
    files: ['**/*.html'],
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
];
