import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';

import { DashboardService } from '../../services/dashboard.service';
import { ProductSale } from '../../models/dashboard.model';
import { BaseComponent } from '../../../core/base.component';
import { DateRange } from '../../../shared/models/date-range.model';

@Component({
  selector: 'app-product-sales-widget',
  standalone: true,
  imports: [
    CommonModule,
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
export class ProductSalesWidgetComponent extends BaseComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  isLoading = false;
  error: string | null = null;

  // Table data
  displayedColumns: string[] = ['productName', 'quantity', 'unitPrice', 'totalAmount', 'saleDate', 'soldBy'];
  dataSource: ProductSale[] = [];
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;
  sortField = 'saleDate';
  sortDirection = 'desc';

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
    private dashboardService: DashboardService,
    private translate: TranslateService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadData();
    this.loadSummary();

    // Subscribe to date range changes
    this.dateRange.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.pageIndex = 0;
      this.loadData();
      this.loadSummary();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    this.isLoading = true;
    this.error = null;

    const { start, end } = this.dateRange.value;

    this.dashboardService
      .getProductSales({
        page: this.pageIndex + 1,
        pageSize: this.pageSize,
        sortField: this.sortField,
        sortDirection: this.sortDirection,
        startDate: start ? start.toISOString() : undefined,
        endDate: end ? end.toISOString() : undefined,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.dataSource = response.items;
          this.totalItems = response.total;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading product sales:', err);
          this.error = this.translate.instant('DASHBOARD.PRODUCT_SALES.ERROR_LOADING');
          this.isLoading = false;
        },
      });
  }

  loadSummary(): void {
    const { start, end } = this.dateRange.value;

    this.dashboardService
      .getProductSalesSummary({
        startDate: start ? start.toISOString() : undefined,
        endDate: end ? end.toISOString() : undefined,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (summary) => {
          this.summary = {
            totalSales: summary.totalSales,
            totalRevenue: summary.totalRevenue,
            totalItems: summary.totalItemsSold,
            averageSale: summary.averageSaleValue,
            topSellingProducts: summary.salesByProduct.slice(0, 5).map((p) => ({ name: p.productName, quantity: p.quantity })),
          };
        },
        error: (err) => {
          console.error('Error loading product sales summary:', err);
        },
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadData();
  }

  onSortChange(sort: Sort): void {
    if (sort.active) {
      this.sortField = sort.active;
      this.sortDirection = sort.direction;
      this.loadData();
    }
  }

  onDateRangeSelected(range: DateRange): void {
    this.dateRange.patchValue({
      start: range.start,
      end: range.end,
    });
  }

  refresh(): void {
    this.loadData();
    this.loadSummary();
  }

  exportToCSV(): void {
    // TODO: Implement CSV export
    console.log('Exporting to CSV...');
  }
}
