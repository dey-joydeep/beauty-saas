// Test setup for Jest with Prisma mocks

globalThis.jest = jest;

// Create a mock implementation for Prisma Client
const mockPrismaClient = () => ({
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $on: jest.fn(),
  $transaction: jest.fn((fn) => fn()),
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  social: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
});

// Mock PrismaClient
type PrismaClient = ReturnType<typeof mockPrismaClient>;
const mockPrisma = mockPrismaClient();

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
  Prisma: {
    // Add any Prisma enums or other exports you need
  },
}));

// Export the mock for use in individual test files
export { mockPrisma };

