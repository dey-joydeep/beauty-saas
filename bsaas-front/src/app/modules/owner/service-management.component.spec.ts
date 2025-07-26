import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ServiceManagementComponent } from './service-management.component';
import { ServiceService } from './service.service';
import { of, throwError } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';

describe('ServiceManagementComponent', () => {
  let component: ServiceManagementComponent;
  let fixture: ComponentFixture<ServiceManagementComponent>;
  let serviceServiceSpy: jasmine.SpyObj<ServiceService>;

  beforeEach(async () => {
    serviceServiceSpy = jasmine.createSpyObj('ServiceService', ['saveService']);
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [ServiceManagementComponent],
      providers: [{ provide: ServiceService, useValue: serviceServiceSpy }],
    }).compileComponents();
    fixture = TestBed.createComponent(ServiceManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display error on failed service save', fakeAsync(() => {
    const errorResponse = { userMessage: 'Failed to save service.' };
    serviceServiceSpy.saveService.and.returnValue(throwError(() => errorResponse));
    component.serviceForm.setValue({ name: 'Test', description: 'Desc', duration: '30', price: '50', salonId: 'test-salon-123' });
    
    // Mock the auth service or set the required properties directly
    Object.defineProperty(component, 'currentUser', {
      get: () => ({ id: 'user-123' })
    });
    
    component.onSubmit();
    tick();
    
    expect(serviceServiceSpy.saveService).toHaveBeenCalledWith(jasmine.objectContaining({
      name: 'Test',
      description: 'Desc',
      duration: 30,
      price: 50,
      createdBy: 'user-123',
      salonId: jasmine.any(String)
    }));
    expect(component.error).toBe('Failed to save service.');
  }));

  it('should display error if required fields missing', () => {
    component.serviceForm.setValue({ name: '', description: '', duration: '', price: '', salonId: '' });
    component.onSubmit();
    expect(component.error).toBe('All fields are required.');
  });

  it('should call saveService on valid submit', fakeAsync(() => {
    const mockResponse = { success: true };
    serviceServiceSpy.saveService.and.returnValue(of(mockResponse));
    
    // Mock the auth service or set the required properties directly
    Object.defineProperty(component, 'currentUser', {
      get: () => ({ id: 'user-123' })
    });
    
    component.serviceForm.setValue({ name: 'Test', description: 'Desc', duration: '30', price: '50', salonId: 'test-salon-123' });
    component.onSubmit();
    tick();
    
    expect(serviceServiceSpy.saveService).toHaveBeenCalledWith(jasmine.objectContaining({
      name: 'Test',
      description: 'Desc',
      duration: 30,
      price: 50,
      createdBy: 'user-123',
      salonId: jasmine.any(String)
    }));
  }));
});
