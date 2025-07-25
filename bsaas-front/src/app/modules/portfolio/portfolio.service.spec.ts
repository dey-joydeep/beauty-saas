import { TestBed } from '@angular/core/testing';
import { PortfolioService } from './portfolio.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('PortfolioService', () => {
  let service: PortfolioService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PortfolioService],
    });
    service = TestBed.inject(PortfolioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should handle error responses gracefully', () => {
    service.savePortfolio({ title: 'Test', description: 'Desc', image: null }).subscribe({
      next: () => fail('should have errored'),
      error: (err) => {
        expect(err.userMessage || err.error || err.message).toBeDefined();
      },
    });
    const req = httpMock.expectOne('/api/portfolio');
    req.flush({ userMessage: 'Failed to save portfolio.' }, { status: 500, statusText: 'Server Error' });
  });
});
