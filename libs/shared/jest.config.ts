/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  // Shared library specific configuration
  testEnvironment: 'node',
  preset: 'ts-jest',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(t|j)sx?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../../coverage/libs/shared',
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/src/$1',
    '^@backend/(.*)$': '<rootDir>/../backend/src/$1',
    '^@backend-shared/(.*)$': '<rootDir>/../backend/src/$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};

// Export using ESM syntax for ts-jest compatibility
export default config;
