import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs';

import { AbstractBaseComponent } from '@beauty-saas/web-core/http';
import { DateRange } from '@beauty-saas/ui';
import { ErrorService } from '@beauty-saas/web-core/http';
import { DashboardService } from '../../dashboard.service';
import { ProductSale } from '../../models/dashboard.model';

@Component({
  selector: 'app-product-sales-widget',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
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
    TranslateModule,
  ],
  templateUrl: './product-sales-widget.component.html',
  styleUrls: ['./product-sales-widget.component.scss'],
})
export class ProductSalesWidgetComponent extends AbstractBaseComponent implements OnInit {
  // Loading and error states are managed by AbstractBaseComponent

  // Table data
  displayedColumns: string[] = ['productName', 'quantity', 'unitPrice', 'totalAmount', 'saleDate', 'soldBy'];
  dataSource: ProductSale[] = [];
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;
  sortField = 'saleDate';
  sortDirection: 'asc' | 'desc' | undefined = 'desc';

  // Date range filter
  dateRange = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  // Summary data
  summary: {
    totalSales: number;
    totalRevenue: number;
    totalItems: number;
    averageSale: number;
    topSellingProducts: Array<{ name: string; quantity: number }>;
  } | null = null;

  constructor(
    @Inject(DashboardService) private dashboardService: DashboardService,
    @Inject(TranslateService) private translate: TranslateService,
    @Inject(ErrorService) protected override errorService: ErrorService,
  ) {
    super(errorService);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.loadData();
    this.loadSummary();

    // Subscribe to date range changes
    this.dateRange.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.pageIndex = 0;
      this.loadData();
      this.loadSummary();
    });
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  loadData(): void {
    this.loading = true;
    const { start, end } = this.dateRange.value;
    const tenantId = 'default-tenant'; // TODO: Get tenant ID from auth service or config

    // Convert date range to query params
    const params = new URLSearchParams();
    if (start) params.set('startDate', start.toISOString());
    if (end) params.set('endDate', end.toISOString());
    params.set('page', (this.pageIndex + 1).toString());
    params.set('pageSize', this.pageSize.toString());
    params.set('sortField', this.sortField);
    if (this.sortDirection) {
      params.set('sortDirection', this.sortDirection);
    }

    // Call the service with the tenant ID and query params
    this.dashboardService
      .getProductSales(tenantId + '?' + params.toString())
      .then((data: any) => {
        this.dataSource = Array.isArray(data) ? data : [];
        this.totalItems = Array.isArray(data) ? data.length : 0;
        this.loading = false;
      })
      .catch((err: any) => {
        console.error('Error loading product sales:', err);
        this.handleError(err);
        const errorMessage = this.translate.instant('DASHBOARD.PRODUCT_SALES.ERROR_LOADING');
        this.errorService.handleError(new Error(errorMessage));
        this.loading = false;
      });
  }

  loadSummary(): void {
    const { start, end } = this.dateRange.value;
    const tenantId = 'default-tenant'; // TODO: Get tenant ID from auth service or config

    // Convert date range to query params
    const params = new URLSearchParams();
    if (start) params.set('startDate', start.toISOString());
    if (end) params.set('endDate', end.toISOString());
    params.set('page', '1');
    params.set('pageSize', '5');
    params.set('sortField', 'quantity');
    params.set('sortDirection', 'desc');

    // Call the service with the tenant ID and query params
    this.dashboardService
      .getProductSales(tenantId + '?' + params.toString())
      .then((items: any) => {
        const validItems = Array.isArray(items) ? items : [];
        const totalRevenue = validItems.reduce((sum: number, item: any) => sum + (item.totalAmount || 0), 0);
        const totalItems = validItems.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);

        this.summary = {
          totalSales: validItems.length,
          totalRevenue,
          totalItems,
          averageSale: validItems.length > 0 ? totalRevenue / validItems.length : 0,
          topSellingProducts: validItems.slice(0, 5).map((item: any) => ({
            name: item.productName || 'Unknown',
            quantity: item.quantity || 0,
          })),
        };
      })
      .catch((err: any) => {
        console.error('Error loading product sales summary:', err);
        this.handleError(err);
      });
  }

  onPageChange(event: PageEvent): void {
    if (event) {
      this.pageIndex = event.pageIndex;
      this.pageSize = event.pageSize;
      this.loadData();
    }
  }

  onSortChange(sort: Sort): void {
    if (sort && sort.active) {
      this.sortField = sort.active;
      // Convert empty string to undefined, otherwise use the direction
      this.sortDirection = sort.direction === '' ? undefined : sort.direction;
      this.loadData();
    }
  }

  onDateRangeSelected(range: DateRange): void {
    if (range) {
      this.dateRange.patchValue({
        start: range.start,
        end: range.end,
      });
    }
  }

  refresh(): void {
    this.loadData();
    this.loadSummary();
  }

  exportToCSV(): void {
    // TODO: Implement CSV export functionality
    console.log('Exporting to CSV...');
    // Implementation would go here
  }
}
