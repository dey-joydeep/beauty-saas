import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { StaffManagementComponent } from './staff-management.component';
import { StaffService } from './staff.service';
import { of, throwError } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';

describe('StaffManagementComponent', () => {
  let component: StaffManagementComponent;
  let fixture: ComponentFixture<StaffManagementComponent>;
  let staffServiceSpy: jasmine.SpyObj<StaffService>;

  beforeEach(async () => {
    staffServiceSpy = jasmine.createSpyObj('StaffService', ['addStaff', 'getStaffList']);
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [StaffManagementComponent],
      providers: [{ provide: StaffService, useValue: staffServiceSpy }],
    }).compileComponents();
    fixture = TestBed.createComponent(StaffManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display error on failed staff add', fakeAsync(() => {
    staffServiceSpy.addStaff.and.returnValue(throwError(() => ({ userMessage: 'Failed to add staff.' })));
    component.staffForm.setValue({ name: 'Test', email: 'test@test.com', contact: '123', nickname: '', profilePicture: null });
    component.salonId = 'salon1';
    component.onSubmit();
    tick();
    expect(component.error).toBe('Failed to add staff.');
  }));

  it('should display error if required fields missing', () => {
    component.staffForm.setValue({ name: '', email: '', contact: '', nickname: '', profilePicture: null });
    component.onSubmit();
    expect(component.error).toBe('All fields are required.');
  });

  it('should call addStaff on valid submit', fakeAsync(() => {
    staffServiceSpy.addStaff.and.returnValue(of({ success: true }));
    component.staffForm.setValue({ name: 'Test', email: 'test@test.com', contact: '123', nickname: '', profilePicture: null });
    component.salonId = 'salon1';
    component.onSubmit();
    tick();
    expect(staffServiceSpy.addStaff).toHaveBeenCalled();
  }));
});
