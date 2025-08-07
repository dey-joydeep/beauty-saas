// Backend-specific Jest configuration
module.exports = {
  testEnvironment: 'node',
  preset: 'ts-jest',
  testMatch: ['**/*.test.ts', '**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverage: true,
  coverageDirectory: '../../coverage/libs/backend',
  moduleNameMapper: {
    '^@beauty-saas/(.*)$': '<rootDir>/../../libs/$1/src',
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/e2e/'
  ]
};
