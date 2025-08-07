import type { Config } from '@jest/types';
import { join } from 'path';

// Get the root directory of the workspace
const rootDir = join(__dirname, '../../..');

// Import the shared base config
const baseConfig = require('../../libs/shared/jest/jest-base.config');

// Path to the Haste implementation
const hasteImplPath = join(__dirname, '../../libs/shared/jest/jest-haste-impl.ts');

/**
 * Backend application Jest configuration
 * Extends the shared base config with backend-specific settings
 */
const config: Config.InitialOptions = {
  ...baseConfig,
  displayName: 'backend',
  coverageDirectory: join(rootDir, 'coverage/apps/bsaas-back'),
  
  // Backend-specific overrides
  testMatch: ['**/*.test.ts', '**/*.spec.ts'],
  
  // Configure Haste to use our custom implementation
  haste: {
    ...baseConfig.haste,
    hasteImplModulePath: hasteImplPath,
  },
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@shared/(.*)$': join(rootDir, 'libs/shared/src/$1'),
  },
  
  // Test environment and setup
  testEnvironment: 'node',
  setupFilesAfterEnv: [
    '<rootDir>/test/setup.ts',
    '<rootDir>/jest.setup.ts'
  ],
  
  // Coverage settings
  collectCoverage: false, // Disable coverage for now
  
  // Test timeout
  testTimeout: 10000,
};

export default config;
