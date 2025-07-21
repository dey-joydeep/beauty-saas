import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';

class MockRouter {
  navigate = jasmine.createSpy('navigate');
  parseUrl = (url: string) => url;
}

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let router: MockRouter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthGuard, { provide: Router, useClass: MockRouter }],
    });
    guard = TestBed.inject(AuthGuard);
    router = TestBed.inject(Router) as any;
  });

  it('should allow activation if token exists', () => {
    spyOn(localStorage, 'getItem').and.returnValue('token');
    expect(guard.canActivate()).toBeTrue();
  });

  it('should redirect to /login if no token', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    const result = guard.canActivate();
    expect(result).not.toBeTrue(); // Should not be allowed
    expect(result).not.toBeFalse(); // Should not be false, should be a UrlTree or string
    expect(result).toBeDefined();
  });
});
