// Type definitions for Jest
/// <reference types="@types/jest" />

declare namespace NodeJS {
  interface Global {
    // Add global types here if needed
  }
}

// Add any global variables that Jest provides
declare const describe: jest.Describe;
declare const it: jest.It;
declare const test: jest.It;
declare const expect: jest.Expect;
declare const beforeAll: jest.Lifecycle;
declare const afterAll: jest.Lifecycle;
declare const beforeEach: jest.Lifecycle;
declare const afterEach: jest.Lifecycle;
declare const jest: jest.Jest;

// Add any other global types your tests might need
