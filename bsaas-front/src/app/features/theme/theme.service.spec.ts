import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('ThemeService', () => {
  let service: ThemeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ThemeService],
    });
    service = TestBed.inject(ThemeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should handle error responses gracefully', () => {
    service.getThemes().subscribe({
      next: () => fail('should have errored'),
      error: (err) => {
        expect(err.userMessage || err.error || err.message).toBeDefined();
      },
    });
    const req = httpMock.expectOne('/api/themes');
    req.flush({ userMessage: 'Failed to fetch themes.' }, { status: 500, statusText: 'Server Error' });
  });
});
