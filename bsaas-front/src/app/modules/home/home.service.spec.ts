import { TestBed } from '@angular/core/testing';
import { HomeService } from './home.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

describe('HomeService', () => {
  let service: HomeService;
  let httpMock: HttpTestingController;
  const apiBaseUrl = '/api/home';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HomeService],
    });
    service = TestBed.inject(HomeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getHomeData', () => {
    it('should return home data', () => {
      const mockData = {
        featuredSalons: [],
        featuredServices: [],
        testimonials: [],
        cities: [],
      };

      service.getHomeData().subscribe((data) => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${apiBaseUrl}/data`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should handle error responses', () => {
      service.getHomeData().subscribe({
        next: () => fail('should have errored'),
        error: (err) => {
          expect(err.status).toBe(500);
        },
      });

      const req = httpMock.expectOne(`${apiBaseUrl}/data`);
      req.flush({}, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('searchSalons', () => {
    it('should call search with correct parameters', () => {
      const params = {
        q: 'test',
        cityId: '1',
        page: 1,
        limit: 10,
      };

      service.searchSalons(params).subscribe();

      const req = httpMock.expectOne(
        (req) => req.url === `${apiBaseUrl}/search` && req.params.get('q') === params.q && req.params.get('cityId') === params.cityId,
      );

      expect(req.request.method).toBe('GET');
      req.flush({ data: [], total: 0 });
    });
  });

  describe('getFeaturedSalons', () => {
    it('should fetch featured salons with default limit', () => {
      service.getFeaturedSalons().subscribe();

      const req = httpMock.expectOne(`${apiBaseUrl}/featured-salons`);
      expect(req.request.params.get('limit')).toBe('10');
      req.flush([]);
    });

    it('should fetch featured salons with custom limit', () => {
      const limit = 5;
      service.getFeaturedSalons(limit).subscribe();

      const req = httpMock.expectOne(`${apiBaseUrl}/featured-salons?limit=${limit}`);
      expect(req.request.params.get('limit')).toBe(limit.toString());
      req.flush([]);
    });
  });

  describe('getCities', () => {
    it('should fetch cities', () => {
      const mockCities = [{ id: '1', name: 'Test City' }];

      service.getCities().subscribe((cities) => {
        expect(cities).toEqual(mockCities);
      });

      const req = httpMock.expectOne(`${apiBaseUrl}/cities`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCities);
    });
  });

  describe('getLanguages', () => {
    it('should fetch languages', () => {
      const mockLanguages = [{ code: 'en', name: 'English' }];

      service.getLanguages().subscribe((languages) => {
        expect(languages).toEqual(mockLanguages);
      });

      const req = httpMock.expectOne(`${apiBaseUrl}/languages`);
      expect(req.request.method).toBe('GET');
      req.flush(mockLanguages);
    });
  });
});
