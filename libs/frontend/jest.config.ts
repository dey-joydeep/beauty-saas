// Frontend-specific Jest configuration
export default {
  testMatch: ['<rootDir>/**/*.spec.ts', '<rootDir>/**/*.test.ts'],
  transform: {
    '^.+\\.(ts|js|html)$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/frontend',
  testEnvironment: 'jsdom',
  collectCoverage: true,
  coverageReporters: ['html', 'text'],
  moduleNameMapper: {
    '^@beauty-saas/(.*)$': '<rootDir>/../../libs/$1/src',
  },
  // Workaround for ESM modules
  transformIgnorePatterns: [
    'node_modules/(?!(@angular|rxjs|@ngrx|@ngx-translate|@nestjs|@testing-library)/)',
  ],
};
