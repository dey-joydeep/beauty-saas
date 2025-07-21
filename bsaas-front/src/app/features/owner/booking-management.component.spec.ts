import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BookingManagementComponent } from './booking-management.component';
import { BookingService } from './booking.service';
import { of, throwError } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';

describe('BookingManagementComponent', () => {
  let component: BookingManagementComponent;
  let fixture: ComponentFixture<BookingManagementComponent>;
  let bookingServiceSpy: jasmine.SpyObj<BookingService>;

  beforeEach(async () => {
    bookingServiceSpy = jasmine.createSpyObj('BookingService', ['saveBooking']);
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [BookingManagementComponent],
      providers: [{ provide: BookingService, useValue: bookingServiceSpy }],
    }).compileComponents();
    fixture = TestBed.createComponent(BookingManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display error on failed booking save', fakeAsync(() => {
    bookingServiceSpy.saveBooking.and.returnValue(throwError(() => ({ userMessage: 'Failed to save booking.' })));
    component.bookingForm.setValue({ customer: 'user1', service: 'salon1', staff: 'staff1', date: '2023-01-01', time: '10:00', note: '' });
    component.onSubmit();
    tick();
    expect(component.error).toBe('Failed to save booking.');
  }));

  it('should display error if required fields missing', () => {
    component.bookingForm.setValue({ customer: '', service: '', staff: '', date: '', time: '', note: '' });
    component.onSubmit();
    expect(component.error).toBe('All fields except note are required.');
  });

  it('should call saveBooking on valid submit', fakeAsync(() => {
    bookingServiceSpy.saveBooking.and.returnValue(of({ success: true }));
    component.bookingForm.setValue({ customer: 'user1', service: 'salon1', staff: 'staff1', date: '2023-01-01', time: '10:00', note: '' });
    component.onSubmit();
    tick();
    expect(bookingServiceSpy.saveBooking).toHaveBeenCalled();
  }));
});
