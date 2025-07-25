import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PortfolioManagementComponent } from './portfolio-management.component';
import { PortfolioService } from './portfolio.service';
import { of, throwError } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';

describe('PortfolioManagementComponent', () => {
  let component: PortfolioManagementComponent;
  let fixture: ComponentFixture<PortfolioManagementComponent>;
  let portfolioServiceSpy: jasmine.SpyObj<PortfolioService>;

  beforeEach(async () => {
    portfolioServiceSpy = jasmine.createSpyObj('PortfolioService', ['savePortfolio']);
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [PortfolioManagementComponent],
      providers: [
        { provide: PortfolioService, useValue: portfolioServiceSpy }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(PortfolioManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display error on failed portfolio save', fakeAsync(() => {
    portfolioServiceSpy.savePortfolio.and.returnValue(throwError(() => ({ userMessage: 'Failed to save portfolio.' })));
    component.portfolioForm.setValue({ title: 'Title', description: 'Desc', image: null });
    component.onSubmit();
    tick();
    expect(component.error).toBe('Failed to save portfolio.');
  }));

  it('should display error if required fields missing', () => {
    component.portfolioForm.setValue({ title: '', description: '', image: null });
    component.onSubmit();
    expect(component.error).toBe('Title and description are required.');
  });

  it('should call savePortfolio on valid submit', fakeAsync(() => {
    portfolioServiceSpy.savePortfolio.and.returnValue(of({ success: true }));
    component.portfolioForm.setValue({ title: 'Title', description: 'Desc', image: null });
    component.onSubmit();
    tick();
    expect(portfolioServiceSpy.savePortfolio).toHaveBeenCalled();
  }));
});
