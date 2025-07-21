import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BookingCreateComponent } from './booking-create.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

describe('BookingCreateComponent', () => {
  let component: BookingCreateComponent;
  let fixture: ComponentFixture<BookingCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingCreateComponent, HttpClientTestingModule, ReactiveFormsModule],
    }).compileComponents();
    fixture = TestBed.createComponent(BookingCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display error if required fields missing', () => {
    component.bookingForm.setValue({ salonId: '', services: [], staffId: '', date: '', note: '' });
    component.userId = 'user1';
    component.onSubmit();
    expect(component.error).toBe('Salon, services, and date are required.');
  });

  it('should display error on failed booking create', fakeAsync(() => {
    spyOn(component['http'], 'post').and.returnValue(throwError(() => ({ error: { userMessage: 'Failed to create booking.' } })));
    component.bookingForm.setValue({ salonId: 'salon1', services: ['svc1'], staffId: 'staff1', date: '2023-01-01', note: '' });
    component.userId = 'user1';
    component.onSubmit();
    tick();
    expect(component.error).toBe('Failed to create booking.');
  }));

  it('should call API on valid submit', fakeAsync(() => {
    spyOn(component['http'], 'post').and.returnValue(of({ success: true }));
    spyOn(component['router'], 'navigate');
    component.bookingForm.setValue({ salonId: 'salon1', services: ['svc1'], staffId: 'staff1', date: '2023-01-01', note: '' });
    component.userId = 'user1';
    component.onSubmit();
    tick();
    expect(component['http'].post).toHaveBeenCalled();
    expect(component.success).toBe('Booking created!');
    expect(component['router'].navigate).toHaveBeenCalledWith(['/user/bookings']);
  }));
});
