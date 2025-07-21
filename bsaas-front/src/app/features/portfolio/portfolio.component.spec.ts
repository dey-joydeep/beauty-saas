import { TestBed, ComponentFixture } from '@angular/core/testing';
import { PortfolioComponent } from './portfolio.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { PortfolioService } from './portfolio.service';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

class MockPortfolioService {
  getPortfolioItems = jasmine.createSpy('getPortfolioItems').and.returnValue(of([]));
  createPortfolioItem = jasmine.createSpy('createPortfolioItem').and.returnValue(of({}));
  updatePortfolioItem = jasmine.createSpy('updatePortfolioItem').and.returnValue(of({}));
  deletePortfolioItem = jasmine.createSpy('deletePortfolioItem').and.returnValue(of({}));
}

describe('PortfolioComponent', () => {
  let component: PortfolioComponent;
  let fixture: ComponentFixture<PortfolioComponent>;
  let service: MockPortfolioService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, ReactiveFormsModule, PortfolioComponent, TranslateModule.forRoot()],
      providers: [
        { provide: PortfolioService, useClass: MockPortfolioService },
        provideHttpClient(),
        provideRouter([]),
        provideAnimations(),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PortfolioComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(PortfolioService) as any;
    component.ngOnInit(); // Ensure form is initialized before tests
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load portfolio items on init', () => {
    expect(service.getPortfolioItems).toHaveBeenCalled();
  });

  it('should show error on load failure', () => {
    service.getPortfolioItems.and.returnValue(throwError(() => ({ error: { message: 'fail' } })));
    component.ngOnInit();
    expect(component.error).toBe('fail');
  });

  it('should add a portfolio item', () => {
    component.addForm.setValue({
      tenantId: 't',
      userId: 'u',
      imagePath: 'some/path.jpg',
      description: 'desc',
    });
    component.selectedImage = new File([''], 'test.jpg', { type: 'image/jpeg' });
    service.createPortfolioItem.and.returnValue(
      of({ id: '1', imagePath: 'some/path.jpg', description: 'desc', tenantId: 't', userId: 'u' }),
    );
    component.addPortfolioItem();
    expect(service.createPortfolioItem).toHaveBeenCalled();
  });

  it('should handle add error', () => {
    component.addForm.setValue({
      tenantId: 't',
      userId: 'u',
      imagePath: 'some/path.jpg',
      description: 'desc',
    });
    component.selectedImage = new File([''], 'test.jpg', { type: 'image/jpeg' });
    service.createPortfolioItem.and.returnValue(throwError(() => ({ error: { message: 'fail' } })));
    component.addPortfolioItem();
    expect(component.error).toBe('fail');
  });
});
