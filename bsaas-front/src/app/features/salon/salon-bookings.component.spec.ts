import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SalonBookingsComponent } from './salon-bookings.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

describe('SalonBookingsComponent', () => {
  let component: SalonBookingsComponent;
  let fixture: ComponentFixture<SalonBookingsComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalonBookingsComponent, HttpClientTestingModule],
    }).compileComponents();
    fixture = TestBed.createComponent(SalonBookingsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should display error if salonId missing', () => {
    component.salonId = undefined;
    component.ngOnInit();
    expect(component.error).toBe('Salon ID is required.');
  });

  it('should display error on failed bookings fetch', fakeAsync(() => {
    component.salonId = 'salon1';
    fixture.detectChanges();
    const req = httpMock.expectOne('/api/salon/salon1/bookings');
    req.flush({ userMessage: 'Failed to load bookings.' }, { status: 500, statusText: 'Server Error' });
    tick();
    expect(component.error).toBe('Failed to load bookings.');
  }));

  it('should fetch bookings successfully', fakeAsync(() => {
    component.salonId = 'salon1';
    fixture.detectChanges();
    const req = httpMock.expectOne('/api/salon/salon1/bookings');
    req.flush([{ id: 1 }]);
    tick();
    expect(component.bookings.length).toBe(1);
    expect(component.error).toBeNull();
  }));
});
