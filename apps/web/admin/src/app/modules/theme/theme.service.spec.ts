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
    const testToken = 'test-token';
    const testTenantId = 'test-tenant';

    service.getTheme(testToken, testTenantId).subscribe({
      next: () => fail('should have errored'),
      error: (err: any) => {
        expect(err.userMessage || err.error || err.message).toBeDefined();
      },
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/${testTenantId}`);
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${testToken}`);

    req.flush({ error: 'Failed to fetch theme.' }, { status: 500, statusText: 'Server Error' });
  });
});
