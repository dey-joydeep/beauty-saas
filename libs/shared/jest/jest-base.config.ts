// @ts-ignore - Using CommonJS for better compatibility with Nx

import type { Config } from '@jest/types';
import { basename, dirname } from 'path';

// Create a custom Haste resolver to handle module name collisions
const getHasteName = (filePath: string) => {
  const fileName = basename(filePath, '.js');
  const parentDir = basename(dirname(filePath));
  return `${parentDir}__${fileName}`.replace(/\W+/g, '_');
};

/**
 * Base Jest configuration that can be extended by other projects
 */
const config: Config.InitialOptions = {
  // Common configuration options here
  testEnvironment: 'node',
  preset: 'ts-jest',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(t|j)sx?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/../../libs/shared/src/$1',
    '^@backend/(.*)$': '<rootDir>/../../libs/backend/src/$1',
    '^@backend-shared/(.*)$': '<rootDir>/../../libs/backend/src/$1',
    '^@frontend/(.*)$': '<rootDir>/../../libs/frontend/src/$1',
  },
  // Add Haste configuration to handle module name collisions
  haste: {
    computeSha1: true,
    enableSymlinks: false,
    forceNodeFilesystemAPI: true,
    throwOnModuleCollision: false,
    hasteImplModulePath: '<rootDir>/jest-haste-impl.ts',
  },
  // Ignore patterns to avoid processing node_modules and dist folders
  modulePathIgnorePatterns: [
    '<rootDir>/node_modules',
    '<rootDir>/dist',
    '<rootDir>/coverage',
    '<rootDir>/libs/.*/dist',
  ],
  // Reset the module registry before running each test
  resetModules: true,
  // Clear mock calls between tests
  clearMocks: true,
  // Reset the module registry before running each test
  resetMocks: true,
  // Restore mock state between tests
  restoreMocks: true,
  // Watch plugins configuration
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
  // Test timeout
  testTimeout: 10000,
};

export default config;
