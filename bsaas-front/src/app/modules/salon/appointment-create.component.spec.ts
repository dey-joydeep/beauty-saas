import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AppointmentCreateComponent } from './appointment-create.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

describe('AppointmentCreateComponent', () => {
  let component: AppointmentCreateComponent;
  let fixture: ComponentFixture<AppointmentCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentCreateComponent, HttpClientTestingModule, ReactiveFormsModule],
    }).compileComponents();
    fixture = TestBed.createComponent(AppointmentCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display error if required fields missing', () => {
    component.appointmentForm.setValue({ 
      salonId: '', 
      serviceId: '', 
      staffId: '', 
      startTime: '', 
      endTime: '', 
      notes: '' 
    });
    component.appointmentForm.patchValue({ customerId: 'user1' });
    component.submit();
    expect(component.error).toBe('Salon, service, and time are required.');
  });

  it('should display error on failed appointment create', fakeAsync(() => {
    spyOn(component['http'], 'post').and.returnValue(throwError(() => ({ error: { userMessage: 'Failed to create appointment.' } })));
    component.appointmentForm.setValue({ 
      salonId: 'salon1', 
      serviceId: 'svc1', 
      staffId: 'staff1', 
      startTime: '2023-01-01T10:00:00', 
      endTime: '2023-01-01T11:00:00', 
      notes: '',
      status: 'PENDING'
    });
    component.appointmentForm.patchValue({ customerId: 'user1' });
    component.submit();
    tick();
    expect(component.error).toBe('Failed to create appointment.');
  }));

  it('should create appointment successfully', fakeAsync(() => {
    const mockResponse = { id: 'apt1' };
    spyOn(component['http'], 'post').and.returnValue(of(mockResponse));
    spyOn(component['router'], 'navigate');
    
    component.appointmentForm.setValue({ 
      salonId: 'salon1', 
      serviceId: 'svc1', 
      staffId: 'staff1', 
      startTime: '2023-01-01T10:00:00', 
      endTime: '2023-01-01T11:00:00', 
      notes: '',
      status: 'PENDING',
      customerId: 'user1'
    });
    component.submit();
    tick();
    expect(component['router'].navigate).toHaveBeenCalledWith(['/appointments']);
    expect(component.success).toBe('Appointment created!');
  }));
});
