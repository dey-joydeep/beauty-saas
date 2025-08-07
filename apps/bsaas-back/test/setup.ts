// Global test setup
import '@testing-library/jest-dom';
import { configure } from '@testing-library/dom';

// Configure test environment
configure({
  testIdAttribute: 'data-test-id',
});

// Global mocks
jest.mock('@prisma/client', () => {
  const originalModule = jest.requireActual('@prisma/client');
  return {
    ...originalModule,
    PrismaClient: jest.fn().mockImplementation(() => ({
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      $on: jest.fn(),
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      // Add other Prisma models as needed
    })),
  };
});
