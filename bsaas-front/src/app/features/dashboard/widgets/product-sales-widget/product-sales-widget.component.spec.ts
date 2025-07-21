import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { ProductSalesWidgetComponent } from './product-sales-widget.component';
import { DashboardService } from '../../services/dashboard.service';
import { ProductSale, ProductSalesSummary } from '../../models/dashboard.model';

const mockProductSales: ProductSale[] = [
  {
    id: '1',
    productId: 'p1',
    productName: 'Test Product 1',
    quantity: 2,
    unitPrice: 25,
    totalAmount: 50,
    saleDate: new Date('2023-01-01T00:00:00.000Z'),
    soldById: 'u1',
    soldByName: 'Test User 1',
  },
  {
    id: '2',
    productId: 'p2',
    productName: 'Test Product 2',
    quantity: 1,
    unitPrice: 100,
    totalAmount: 100,
    saleDate: new Date('2023-01-02T00:00:00.000Z'),
    soldById: 'u2',
    soldByName: 'Test User 2',
  },
];

const mockSummary: ProductSalesSummary = {
  totalSales: 2,
  totalRevenue: 150,
  totalItemsSold: 3,
  averageSaleValue: 75,
  salesByProduct: [
    { productId: 'p1', productName: 'Test Product 1', quantity: 2, revenue: 50 },
    { productId: 'p2', productName: 'Test Product 2', quantity: 1, revenue: 100 },
  ],
  salesByDate: [
    { date: '2023-01-01', sales: 50, items: 2 },
    { date: '2023-01-02', sales: 100, items: 1 },
  ],
};

describe('ProductSalesWidgetComponent', () => {
  let component: ProductSalesWidgetComponent;
  let fixture: ComponentFixture<ProductSalesWidgetComponent>;
  let dashboardService: jasmine.SpyObj<DashboardService>;
  let translateService: jasmine.SpyObj<TranslateService>;

  beforeEach(async () => {
    const dashboardServiceSpy = jasmine.createSpyObj('DashboardService', ['getProductSales', 'getProductSalesSummary']);

    const translateServiceSpy = jasmine.createSpyObj('TranslateService', ['instant']);

    await TestBed.configureTestingModule({
      declarations: [ProductSalesWidgetComponent],
      imports: [
        NoopAnimationsModule,
        HttpClientTestingModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatTooltipModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatMenuModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: DashboardService, useValue: dashboardServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy },
      ],
    }).compileComponents();

    dashboardService = TestBed.inject(DashboardService) as jasmine.SpyObj<DashboardService>;
    translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;

    // Setup mock responses
    dashboardService.getProductSales.and.returnValue(
      of({
        items: mockProductSales,
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      }),
    );

    dashboardService.getProductSalesSummary.and.returnValue(of(mockSummary));

    // Setup translation mocks
    translateService.instant.and.callFake((key: string) => key);

    fixture = TestBed.createComponent(ProductSalesWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load product sales and summary on init', () => {
    expect(dashboardService.getProductSales).toHaveBeenCalled();
    expect(dashboardService.getProductSalesSummary).toHaveBeenCalled();
    expect(component.dataSource.length).toBe(2);
    expect(component.summary).toBeTruthy();
  });

  it('should display loading state while fetching data', () => {
    // Reset the component with a delayed response
    dashboardService.getProductSales.and.returnValue(
      of({
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
      }),
    );

    component.ngOnInit();
    fixture.detectChanges();

    const loadingElement = fixture.nativeElement.querySelector('mat-spinner');
    expect(loadingElement).toBeTruthy();
  });

  it('should handle error when loading product sales', fakeAsync(() => {
    const errorMessage = 'Error loading product sales';
    dashboardService.getProductSales.and.returnValue(throwError(() => new Error(errorMessage)));

    component.ngOnInit();
    tick();
    fixture.detectChanges();

    expect(component.error).toBe('DASHBOARD.PRODUCT_SALES.ERROR_LOADING');

    const errorElement = fixture.nativeElement.querySelector('.error-container');
    expect(errorElement).toBeTruthy();
    expect(errorElement.textContent).toContain('DASHBOARD.PRODUCT_SALES.ERROR_LOADING');
  }));

  it('should update table when page changes', () => {
    const pageEvent = new PageEvent();
    pageEvent.pageIndex = 1;
    pageEvent.pageSize = 20;

    component.onPageChange(pageEvent);

    expect(component.pageIndex).toBe(1);
    expect(component.pageSize).toBe(20);
    expect(dashboardService.getProductSales).toHaveBeenCalledWith({
      page: 2, // pageIndex + 1
      pageSize: 20,
      sortField: 'saleDate',
      sortDirection: 'desc',
    });
  });

  it('should update table when sort changes', () => {
    const sortEvent: Sort = {
      active: 'productName',
      direction: 'asc',
      sortables: [],
    };

    component.onSortChange(sortEvent);

    expect(component.sortField).toBe('productName');
    expect(component.sortDirection).toBe('asc');
    expect(dashboardService.getProductSales).toHaveBeenCalledWith({
      page: 1,
      pageSize: 10,
      sortField: 'productName',
      sortDirection: 'asc',
    });
  });

  it('should refresh data when refresh is called', () => {
    // Reset call count
    (dashboardService.getProductSales as jasmine.Spy).calls.reset();
    (dashboardService.getProductSalesSummary as jasmine.Spy).calls.reset();

    component.refresh();

    expect(dashboardService.getProductSales).toHaveBeenCalledTimes(1);
    expect(dashboardService.getProductSalesSummary).toHaveBeenCalledTimes(1);
  });

  it('should filter data by date range', fakeAsync(() => {
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2023-01-31');

    // Simulate date range selection
    component.dateRange.setValue({ start: startDate, end: endDate });
    tick(300); // Debounce time

    expect(dashboardService.getProductSales).toHaveBeenCalledWith({
      page: 1,
      pageSize: 10,
      sortField: 'saleDate',
      sortDirection: 'desc',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    expect(dashboardService.getProductSalesSummary).toHaveBeenCalledWith({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  }));

  it('should display summary cards with correct data', () => {
    fixture.detectChanges();

    const summaryCards = fixture.nativeElement.querySelectorAll('.summary-card');
    expect(summaryCards.length).toBe(4); // Total Sales, Total Revenue, Average Sale, Items Sold

    // Check if summary values are displayed correctly
    const totalSalesCard = summaryCards[0];
    expect(totalSalesCard.textContent).toContain('2'); // mockSummary.totalSales

    const totalRevenueCard = summaryCards[1];
    expect(totalRevenueCard.textContent).toContain('150'); // mockSummary.totalRevenue
  });

  it('should display top selling products', () => {
    fixture.detectChanges();

    const topProductsSection = fixture.nativeElement.querySelector('.top-products');
    expect(topProductsSection).toBeTruthy();

    const productItems = topProductsSection.querySelectorAll('.product-item');
    expect(productItems.length).toBe(2); // 2 products in mockSummary.salesByProduct

    // Check if product names and quantities are displayed
    expect(productItems[0].textContent).toContain('Test Product 1');
    expect(productItems[0].textContent).toContain('2'); // quantity
    expect(productItems[1].textContent).toContain('Test Product 2');
    expect(productItems[1].textContent).toContain('1'); // quantity
  });

  it('should display product sales table with correct data', () => {
    fixture.detectChanges();

    const tableRows = fixture.nativeElement.querySelectorAll('table tbody tr');
    expect(tableRows.length).toBe(2); // 2 items in mockProductSales

    // Check if first row contains correct data
    const firstRowCells = tableRows[0].querySelectorAll('td');
    expect(firstRowCells[0].textContent).toContain('Test Product 1');
    expect(firstRowCells[1].textContent).toContain('2'); // quantity
    expect(firstRowCells[2].textContent).toContain('25.00'); // unitPrice
    expect(firstRowCells[3].textContent).toContain('50.00'); // totalAmount
  });
});
