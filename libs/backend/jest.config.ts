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
    '^@backend/(.*)$': '<rootDir>/src/$1',
    '^@backend-shared/(.*)$': '<rootDir>/src/$1',
    '^@shared/(.*)$': '<rootDir>/../shared/src/$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/e2e/'],
};
