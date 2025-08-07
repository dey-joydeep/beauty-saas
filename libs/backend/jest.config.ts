// Backend-specific Jest configuration with ESM support
import type { Config } from 'jest';
import { createDefaultEsmPreset } from 'ts-jest';

// Create the base config with ESM preset
const config: Config = {
  displayName: 'backend',
  // Use the default ESM preset from ts-jest
  ...createDefaultEsmPreset({
    tsconfig: '<rootDir>/tsconfig.json',
    // Enable ESM support
    useESM: true,
    // Enable coverage collection
    diagnostics: false, // Disable type checking in tests for better performance
  }),
  
  // Test environment
  testEnvironment: 'node',
  
  // Test file patterns - look for test files in src directory
  testMatch: [
    '**/src/**/*.spec.ts',
    '**/src/**/*.test.ts',
    '**/test/**/*.spec.ts',
    '**/test/**/*.test.ts',
  ],
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'js', 'json'],
  
  // Test coverage configuration - using coverageProvider instead of collectCoverage
  collectCoverage: true,
  coverageProvider: 'v8',
  coverageDirectory: '../../coverage/backend',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/main.ts',
    '!**/node_modules/**',
  ],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '.spec.ts$',
    '.test.ts$',
  ],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  
  // Module resolution
  moduleDirectories: ['node_modules', '<rootDir>'],
  
  // Transform configuration
  transform: {
    '^.+\.(t|j)s$': 'ts-jest',
  },
};

export default config;
