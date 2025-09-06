export default {
  displayName: 'server-feature-auth',
  preset: '../../../../jest.preset.cjs',
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/src/**/*.spec.ts',
    '<rootDir>/src/**/*.test.ts',
    '<rootDir>/tests/**/*.spec.ts',
    '<rootDir>/tests/**/*.it-spec.ts',
  ],
  globalSetup: '<rootDir>/../../core/src/testing/global-setup.ts',
  globalTeardown: '<rootDir>/../../core/src/testing/global-teardown.ts',
  testTimeout: 30000,
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../../coverage/libs/server/features/auth',
  coverageThreshold: {
    global: {
      statements: 100,
      branches: 95,
      functions: 100,
      lines: 100,
    },
  },
};
