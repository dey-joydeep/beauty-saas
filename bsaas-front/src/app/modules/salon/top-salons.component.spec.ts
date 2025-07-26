import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { TopSalonsComponent } from './top-salons.component';
import { SalonService } from './salon.service';
import { of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

describe('TopSalonsComponent', () => {
  let component: TopSalonsComponent;
  let fixture: ComponentFixture<TopSalonsComponent>;
  let salonServiceSpy: jasmine.SpyObj<SalonService>;

  beforeEach(waitForAsync(() => {
    salonServiceSpy = jasmine.createSpyObj('SalonService', ['getTopSalons']);
    TestBed.configureTestingModule({
      imports: [TopSalonsComponent],
      providers: [
        { provide: SalonService, useValue: salonServiceSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopSalonsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load salons on init (success)', fakeAsync(() => {
    const salons = [{
      id: '1',
      name: 'Salon A',
      slug: 'salon-a',
      description: 'Test salon',
      email: 'test@example.com',
      phone: '1234567890',
      address: '123 Test St',
      city: 'Test City',
      isOpen: true,
      isFeatured: false,
      averageRating: 4.5,
      reviewCount: 10,
      featuredImage: 'test.jpg',
      imageUrl: 'test.jpg',
      services: [{
        id: '1',
        name: 'Test Service',
        price: 50,
        duration: 60,
        description: 'Test service description'
      }],
      gallery: []
    }];
    
    salonServiceSpy.getTopSalons.and.returnValue(of(salons));
    component.fetchTopSalons(); // Call directly to avoid geolocation
    tick();
    fixture.detectChanges();
    expect(component.salons.length).toBe(1);
    expect(component.salons[0].name).toBe('Salon A');
    expect(component.loading).toBeFalse();
  }));

  it('should handle error on salon load', fakeAsync(() => {
    salonServiceSpy.getTopSalons.and.returnValue(throwError(() => ({ error: { error: 'fail' } })));
    component.fetchTopSalons(); // Call directly to avoid geolocation
    tick();
    fixture.detectChanges();
    console.log('component.error:', component.error);
    console.log('component.loading:', component.loading);
    expect(component.error).toBe('fail');
    expect(component.loading).toBeFalse();
  }));
});
