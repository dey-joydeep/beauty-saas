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
    serviceServiceSpy.saveService.and.returnValue(throwError(() => ({ userMessage: 'Failed to save service.' })));
    component.serviceForm.setValue({ name: 'Test', description: 'Desc', duration: 30, price: 50 });
    component.onSubmit();
    tick();
    expect(component.error).toBe('Failed to save service.');
  }));

  it('should display error if required fields missing', () => {
    component.serviceForm.setValue({ name: '', description: '', duration: '', price: '' });
    component.onSubmit();
    expect(component.error).toBe('All fields are required.');
  });

  it('should call saveService on valid submit', fakeAsync(() => {
    serviceServiceSpy.saveService.and.returnValue(of({ success: true }));
    component.serviceForm.setValue({ name: 'Test', description: 'Desc', duration: 30, price: 50 });
    component.onSubmit();
    tick();
    expect(serviceServiceSpy.saveService).toHaveBeenCalled();
  }));
});
