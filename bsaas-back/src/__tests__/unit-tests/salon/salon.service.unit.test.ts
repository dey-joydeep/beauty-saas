// Inline all required types and enums to remove dependency on broken imports
// and ensure tests run independently.

// If any enums or types are needed, define them here.
// For now, no external enums are referenced in this test file.

import { SalonService } from '../../../modules/salon/salon.service';

// Mock dependencies
const mockFindMany = jest.fn();
const mockGetAverageRating = jest.fn();

jest.mock('../../../modules/salon/salon.service', () => {
  const original = jest.requireActual('../../../modules/salon/salon.service');
  return {
    ...original,
    PrismaClient: jest.fn().mockImplementation(() => ({
      salon: { findMany: mockFindMany },
    })),
    ReviewService: jest.fn().mockImplementation(() => ({
      getAverageRating: mockGetAverageRating,
    })),
  };
});

describe('SalonService.searchSalons', () => {
  let salonService: SalonService;
  beforeEach(() => {
    salonService = new SalonService();
    mockFindMany.mockReset();
    mockGetAverageRating.mockReset();
  });

  it('should sort salons by rating descending', async () => {
    const mockSalons = [
      { id: '1', name: 'A' },
      { id: '2', name: 'B' },
      { id: '3', name: 'C' },
    ];
    const ratings: Record<string, { average: number; count: number }> = {
      '1': { average: 4.8, count: 20 },
      '2': { average: 4.2, count: 15 },
      '3': { average: 4.9, count: 10 },
    };
    mockFindMany.mockResolvedValue(mockSalons);
    mockGetAverageRating.mockImplementation(({ filter }) =>
      Promise.resolve(ratings[filter.salonId]),
    );
    const results = await salonService.searchSalons({ sort: 'rating' });
    expect(results.map((s: any) => s.id)).toEqual(['3', '1', '2']);
  });

  it('should sort salons by review count descending', async () => {
    const mockSalons = [
      { id: '1', name: 'A' },
      { id: '2', name: 'B' },
      { id: '3', name: 'C' },
    ];
    const ratings: Record<string, { average: number; count: number }> = {
      '1': { average: 4.8, count: 20 },
      '2': { average: 4.2, count: 15 },
      '3': { average: 4.9, count: 10 },
    };
    mockFindMany.mockResolvedValue(mockSalons);
    mockGetAverageRating.mockImplementation(({ filter }) =>
      Promise.resolve(ratings[filter.salonId]),
    );
    const results = await salonService.searchSalons({ sort: 'reviews' });
    expect(results.map((s: any) => s.id)).toEqual(['1', '2', '3']);
  });

  it('should sort salons by name ascending', async () => {
    const mockSalons = [
      { id: '1', name: 'B' },
      { id: '2', name: 'A' },
      { id: '3', name: 'C' },
    ];
    const ratings: Record<string, { average: number; count: number }> = {
      '1': { average: 4.8, count: 20 },
      '2': { average: 4.2, count: 15 },
      '3': { average: 4.9, count: 10 },
    };
    mockFindMany.mockResolvedValue(mockSalons);
    mockGetAverageRating.mockImplementation(({ filter }) =>
      Promise.resolve(ratings[filter.salonId]),
    );
    const results = await salonService.searchSalons({ sort: 'name' });
    expect(results.map((s: any) => s.name)).toEqual(['A', 'B', 'C']);
  });

  it('should filter by min_rating and max_rating', async () => {
    const mockSalons = [
      { id: '1', name: 'A' },
      { id: '2', name: 'B' },
      { id: '3', name: 'C' },
    ];
    const ratings: Record<string, { average: number; count: number }> = {
      '1': { average: 4.8, count: 20 },
      '2': { average: 4.2, count: 15 },
      '3': { average: 4.9, count: 10 },
    };
    mockFindMany.mockResolvedValue(mockSalons);
    mockGetAverageRating.mockImplementation(({ filter }) =>
      Promise.resolve(ratings[filter.salonId]),
    );
    const results = await salonService.searchSalons({ min_rating: 4.7, max_rating: 4.85 });
    expect(results.map((s: any) => s.id)).toEqual(['1']);
  });
});
