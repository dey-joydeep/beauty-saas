export default {
  displayName: 'server-feature-auth',
  preset: '../../../../jest.preset.cjs',
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/src/**/*.spec.ts',
    '<rootDir>/src/**/*.test.ts',
    '<rootDir>/tests/**/*.spec.ts',
    '<rootDir>/tests/**/*.int-spec.ts',
  ],
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
