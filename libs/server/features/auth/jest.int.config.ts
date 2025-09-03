import base from './jest.config';

export default {
  ...base,
  testMatch: ['<rootDir>/tests/**/*.spec.ts', '<rootDir>/tests/**/*.it-spec.ts'],
};
