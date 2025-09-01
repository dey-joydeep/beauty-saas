import type { Config } from '@jest/types';
import nxPreset from '@nx/jest/preset';

/**
 * Root Jest configuration preset for the entire monorepo.
 * This is the single source of truth for Jest configuration.
 * Individual projects can extend and override these settings.
 */
const config: Omit<Config.InitialOptions, 'testFailureExitCode'> & { testFailureExitCode?: number } = {
  // Start with Nx defaults
  ...nxPreset,

  // Test file patterns
  testMatch: ['**/+(*.)+(spec|test).+(ts|js)?(x)'],

  // Transform settings
  transform: {
    '^.+\\.(ts|js|html)$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
        isolatedModules: true, // Improves performance
      },
    ],
  },

  // Module resolution
  moduleFileExtensions: ['ts', 'js', 'html', 'json'],

  // Coverage settings
  collectCoverage: true,
  coverageReporters: ['html', 'text', 'lcov'],
  coverageDirectory: '<rootDir>/coverage',


  // Ignore patterns
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],

  // Test environment
  testEnvironment: 'node',

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Test timeout and failure settings
  testTimeout: 10000,
  testFailureExitCode: 1, // Explicitly set as number
};

export default config;
