import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SalonManagementComponent } from './salon-management.component';
import { SalonService } from './salon.service';
import { of, throwError } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';

describe('SalonManagementComponent', () => {
  let component: SalonManagementComponent;
  let fixture: ComponentFixture<SalonManagementComponent>;
  let salonServiceSpy: jasmine.SpyObj<SalonService>;

  beforeEach(async () => {
    salonServiceSpy = jasmine.createSpyObj('SalonService', ['saveSalon']);
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [SalonManagementComponent],
      providers: [{ provide: SalonService, useValue: salonServiceSpy }],
    }).compileComponents();
    fixture = TestBed.createComponent(SalonManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display error on failed salon save', fakeAsync(() => {
    salonServiceSpy.saveSalon.and.returnValue(throwError(() => ({ userMessage: 'Failed to save salon.' })));
    component.salonForm.setValue({
      name: 'Test',
      address: 'Addr',
      contact: '123',
      email: 'e@e.com',
      city: 'City',
      latitude: 1,
      longitude: 2,
      services: ['svc'],
      ownerId: 'owner',
    });
    component.onSubmit();
    tick();
    expect(component.error).toBe('Failed to save salon.');
  }));

  it('should display error if required fields missing', () => {
    component.salonForm.setValue({
      name: '',
      address: '',
      contact: '',
      email: '',
      city: '',
      latitude: '',
      longitude: '',
      services: '',
      ownerId: '',
    });
    component.onSubmit();
    expect(component.error).toBe('All fields are required.');
  });

  it('should call saveSalon on valid submit', fakeAsync(() => {
    salonServiceSpy.saveSalon.and.returnValue(of({ success: true }));
    component.salonForm.setValue({
      name: 'Test',
      address: 'Addr',
      contact: '123',
      email: 'e@e.com',
      city: 'City',
      latitude: 1,
      longitude: 2,
      services: ['svc'],
      ownerId: 'owner',
    });
    component.onSubmit();
    tick();
    expect(salonServiceSpy.saveSalon).toHaveBeenCalled();
  }));
});
