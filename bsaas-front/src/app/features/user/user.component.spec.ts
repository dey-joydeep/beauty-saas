import { TestBed } from '@angular/core/testing';
import { UserComponent } from './user.component';
import { UserService } from './user.service';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { sharedTestProviders } from '../../shared/test-setup';

const adminToken = `
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
  eyJ1c2VyX2lkIjoiYWRtaW4iLCJ0ZW5hbnRfaWQiOiJ0ZW5hbnQxIiwiZW1haWwiOiJhZG1pbkBiLmNvbSIsInJvbGUiOiJhZG1pbiJ9.
  4c1wA3H3w2v1vYbN8i4Q8o3l7w1t8w2v9w1t8w2v9w1t8w2v9w1t8w2v9w1t8w2v9
`;

const userToken = `
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
  eyJ1c2VyX2lkIjoiYWRtaW4iLCJ0ZW5hbnRfaWQiOiJ0ZW5hbnQxIiwiZW1haWwiOiJhZG1pbkBiLmNvbSIsInJvbGUiOiJ1c2VyIn0.
  4c1wA3H3w2v1vYbN8i4Q8o3l7w1t8w2v9w1t8w2v9w1t8w2v9w1t8w2v9w1t8w2v9
`;

describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: any;
  let userServiceSpy: any;

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj('UserService', ['getUserStats']);
    await TestBed.configureTestingModule({
      imports: [CommonModule, UserComponent, TranslateModule.forRoot()],
      providers: [{ provide: UserService, useValue: userServiceSpy }, ...sharedTestProviders],
    }).compileComponents();
    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
  });

  it('should show stats for admin', () => {
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'token') return adminToken;
      if (key === 'tenant_id') return 'test-tenant';
      return null;
    });
    userServiceSpy.getUserStats.and.returnValue(
      of({
        businessCount: 2,
        customerCount: 5,
        activeBusiness: 1,
        activeCustomer: 3,
      }),
    );
    fixture.detectChanges();
    expect(component.isAdmin).toBeTrue();
    expect(component.stats).toEqual({
      businessCount: 2,
      customerCount: 5,
      activeBusiness: 1,
      activeCustomer: 3,
    });
    expect(component.error).toBeNull();
  });

  it('should block stats for non-admin', () => {
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'token') return userToken;
      if (key === 'tenant_id') return 'test-tenant';
      return null;
    });
    fixture.detectChanges();
    expect(component.isAdmin).toBeFalse();
    expect(component.stats).toBeNull();
    expect(component.error).toContain('permission');
  });

  it('should show session expired for 401', () => {
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'token') return adminToken;
      if (key === 'tenant_id') return 'test-tenant';
      return null;
    });
    userServiceSpy.getUserStats.and.returnValue(throwError({ status: 401 }));
    fixture.detectChanges();
    expect(component.isAdmin).toBeTrue();
    expect(component.error).toContain('session');
  });

  it('should show forbidden for 403', () => {
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'token') return adminToken;
      if (key === 'tenant_id') return 'test-tenant';
      return null;
    });
    userServiceSpy.getUserStats.and.returnValue(throwError({ status: 403 }));
    fixture.detectChanges();
    expect(component.isAdmin).toBeTrue();
    expect(component.error).toContain('permission');
  });
});
