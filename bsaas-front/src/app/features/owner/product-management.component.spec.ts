import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ProductManagementComponent } from './product-management.component';
import { ProductService } from './product.service';
import { of, throwError } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';

describe('ProductManagementComponent', () => {
  let component: ProductManagementComponent;
  let fixture: ComponentFixture<ProductManagementComponent>;
  let productServiceSpy: jasmine.SpyObj<ProductService>;

  beforeEach(async () => {
    productServiceSpy = jasmine.createSpyObj('ProductService', ['saveProduct']);
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [ProductManagementComponent],
      providers: [
        { provide: ProductService, useValue: productServiceSpy }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ProductManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display error on failed product save', fakeAsync(() => {
    productServiceSpy.saveProduct.and.returnValue(throwError(() => ({ userMessage: 'Failed to save product.' })));
    component.productForm.setValue({ name: 'Test', description: 'Desc', price: 10, stock: 5 });
    component.onSubmit();
    tick();
    expect(component.error).toBe('Failed to save product.');
  }));

  it('should display error if required fields missing', () => {
    component.productForm.setValue({ name: '', description: '', price: '', stock: '' });
    component.onSubmit();
    expect(component.error).toBe('All fields are required.');
  });

  it('should call saveProduct on valid submit', fakeAsync(() => {
    productServiceSpy.saveProduct.and.returnValue(of({ success: true }));
    component.productForm.setValue({ name: 'Test', description: 'Desc', price: 10, stock: 5 });
    component.onSubmit();
    tick();
    expect(productServiceSpy.saveProduct).toHaveBeenCalled();
  }));
});
