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
    const salons = [{ name: 'Salon A', id: 1, averageRating: 4.5, reviewCount: 10 }];
    salonServiceSpy.getTopSalons.and.returnValue(of(salons));
    component.fetchTopSalons(); // Call directly to avoid geolocation
    tick();
    fixture.detectChanges();
    expect(component.salons.length).toBe(1);
    expect(component.salons[0]).toEqual(salons[0]);
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
