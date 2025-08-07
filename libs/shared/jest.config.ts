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
    '^@bsaas/(.*)$': '<rootDir>/../../libs/$1/src',
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ]
};

// Use module.exports for better compatibility with Nx
export default config;
