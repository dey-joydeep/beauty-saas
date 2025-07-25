import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HomeService } from './home.service';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';

const mockHomeData = {
  featuredSalons: [{ id: '1', name: 'Test Salon', rating: 4.5, reviewCount: 10, imageUrl: 'test.jpg' }],
  featuredServices: [{ id: '1', name: 'Haircut', price: 30, duration: 30 }],
  testimonials: [{ id: '1', author: 'Test User', content: 'Great service!', rating: 5 }],
  cities: [{ id: '1', name: 'Test City' }],
};

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let homeService: jasmine.SpyObj<HomeService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(waitForAsync(() => {
    const homeServiceSpy = jasmine.createSpyObj('HomeService', ['getHomeData', 'searchSalons']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      imports: [HomeComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: HomeService, useValue: homeServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA], // Ignore child components
    }).compileComponents();

    homeService = TestBed.inject(HomeService) as jasmine.SpyObj<HomeService>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    homeService.getHomeData.and.returnValue(of(mockHomeData));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load home data on init', () => {
    expect(homeService.getHomeData).toHaveBeenCalled();
    expect(component.featuredSalons).toEqual(mockHomeData.featuredSalons);
    expect(component.featuredServices).toEqual(mockHomeData.featuredServices);
    expect(component.testimonials).toEqual(mockHomeData.testimonials);
    expect(component.cities).toEqual(mockHomeData.cities);
  });

  it('should handle error when loading home data fails', () => {
    const errorMessage = 'Failed to load data';
    homeService.getHomeData.and.returnValue(throwError(() => ({ error: errorMessage })));

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(snackBar.open).toHaveBeenCalledWith('Failed to load home data. Please try again later.', 'Close', jasmine.any(Object));
  });

  it('should format rating correctly', () => {
    expect(component.formatRating(4.5)).toBe('4.5');
    expect(component.formatRating(null)).toBe('N/A');
  });

  it('should format price correctly', () => {
    expect(component.formatPrice(30)).toBe('$30');
    expect(component.formatPrice(null)).toBe('N/A');
  });

  it('should format duration correctly', () => {
    expect(component.formatDuration(90)).toBe('1h 30m');
    expect(component.formatDuration(30)).toBe('30m');
    expect(component.formatDuration(null)).toBe('N/A');
  });

  it('should navigate to salon details', () => {
    const routerSpy = spyOn(component['router'], 'navigate');
    const salonId = '123';
    component.viewSalonDetails(salonId);
    expect(routerSpy).toHaveBeenCalledWith(['/salon', salonId]);
  });

  it('should navigate to search with query', () => {
    const routerSpy = spyOn(component['router'], 'navigate');
    const query = 'test';
    component.searchSalons(query);
    expect(routerSpy).toHaveBeenCalledWith(['/search'], { queryParams: { q: query } });
  });
});
