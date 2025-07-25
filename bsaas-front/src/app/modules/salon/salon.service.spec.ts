import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SalonService } from './salon.service';
import { Salon } from '../../models/salon.model';
import { CreateSalonParams, UpdateSalonParams } from '../../models/salon-params.model';

describe('SalonService', () => {
  let service: SalonService;
  let httpMock: HttpTestingController;

  const mockSalon: Salon = {
    id: '1',
    name: 'Test Salon',
    address: '123 Main St',
    zipCode: '12345',
    city: 'Test City',
    latitude: 0,
    longitude: 0,
    services: [],
    staff: [],
    ownerId: 'owner1',
    imageUrl: '',
    images: [],
    reviews: [],
    phone: '555-1234',
    description: 'A test salon',
    rating: 5,
    reviewCount: 10,
  };

  const createParams: CreateSalonParams = {
    name: mockSalon.name,
    address: mockSalon.address,
    city: mockSalon.city!,
    latitude: mockSalon.latitude,
    longitude: mockSalon.longitude,
    services: [],
    ownerId: mockSalon.ownerId,
  };

  const updateParams: UpdateSalonParams = {
    id: mockSalon.id,
    name: 'Updated',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SalonService],
    });
    service = TestBed.inject(SalonService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch salons', () => {
    service.getSalons().subscribe((salons) => {
      expect(salons.length).toBe(1);
      expect(salons[0]).toEqual(mockSalon);
    });
    const req = httpMock.expectOne('/api/salons');
    expect(req.request.method).toBe('GET');
    req.flush([mockSalon]);
  });

  it('should fetch a salon by id', () => {
    service.getSalon('1').subscribe((salon) => {
      expect(salon).toEqual(mockSalon);
    });
    const req = httpMock.expectOne('/api/salons/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockSalon);
  });

  it('should create a salon', () => {
    service.createSalon(createParams).subscribe((salon) => {
      expect(salon).toEqual(mockSalon);
    });
    const req = httpMock.expectOne('/api/salons');
    expect(req.request.method).toBe('POST');
    req.flush(mockSalon);
  });

  it('should update a salon', () => {
    service.updateSalon('1', updateParams).subscribe((salon) => {
      expect(salon).toEqual({ ...mockSalon, name: 'Updated' });
    });
    const req = httpMock.expectOne('/api/salons/1');
    expect(req.request.method).toBe('PUT');
    req.flush({ ...mockSalon, name: 'Updated' });
  });

  it('should delete a salon', () => {
    service.deleteSalon('1').subscribe((result) => {
      expect(result).toBeNull();
    });
    const req = httpMock.expectOne('/api/salons/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
