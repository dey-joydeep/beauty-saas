import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, HostListener, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AbstractBaseComponent } from '@frontend-shared/core/base/abstract-base.component';
import { ErrorService } from '@frontend-shared/core/services/error/error.service';
import { StorageService } from '@frontend-shared/core/services/storage/storage.service';
import type { IPlatformUtils } from '@frontend-shared/core/utils/platform-utils';
import { PLATFORM_UTILS_TOKEN } from '@frontend-shared/core/utils/platform-utils';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

// Widget Components
import { CustomerStatsWidgetComponent } from './widgets/customer-stats/customer-stats-widget.component';
import { ProductSalesWidgetComponent } from './widgets/product-sales-widget/product-sales-widget.component';
import { RenewalsListWidgetComponent } from './widgets/renewals-list/renewals-list-widget.component';
import { RevenueChartComponent } from './widgets/revenue-chart/revenue-chart.component';
import { StatsWidgetComponent } from './widgets/stats/stats-widget.component';
import { SubscriptionChartWidgetComponent } from './widgets/subscription-chart/subscription-chart-widget.component';

// Services

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    TranslateModule,
    StatsWidgetComponent,
    RevenueChartComponent,
    CustomerStatsWidgetComponent,
    ProductSalesWidgetComponent,
    SubscriptionChartWidgetComponent,
    RenewalsListWidgetComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent extends AbstractBaseComponent implements OnInit {
  static tenantId = 'demo-tenant';
  tenantId: string;
  private isBrowser: boolean;

  // Define the dashboard layout
  dashboardLayout = {
    columns: 1,
    rowHeight: '500px',
    gutterSize: '16px',
  };

  // Breakpoint configuration for responsive design
  breakpoint: number = 1; // Default to 1 column

  constructor(
    @Inject(StorageService) private storageService: StorageService,
    @Inject(ErrorService) protected override errorService: ErrorService,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(PLATFORM_UTILS_TOKEN) private platformUtils: IPlatformUtils,
  ) {
    super(errorService);
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.tenantId = DashboardComponent.tenantId; // Default value, will be updated in ngOnInit

    // Safely get initial window width
    const initialWidth = this.isBrowser && this.platformUtils.window ? this.platformUtils.window.innerWidth : 0;
    this.setBreakpoint(initialWidth);
  }

  /**
   * Sets the number of columns based on screen width
   * @param width The current window width in pixels
   */
  private setBreakpoint(width: number): void {
    if (width <= 768) {
      this.breakpoint = 1; // 1 column on mobile
    } else if (width <= 1200) {
      this.breakpoint = 2; // 2 columns on tablet
    } else {
      this.breakpoint = 3; // 3 columns on desktop
    }
  }

  // Handle window resize events
  override async ngOnInit(): Promise<void> {
    super.ngOnInit();

    // Load tenant ID from storage if in browser environment
    if (this.isBrowser) {
      try {
        // Use getItem$ which returns an Observable
        const tenantId$ = this.storageService.getItem$<string>('tenantId');
        const savedTenantId = await firstValueFrom(tenantId$);
        if (savedTenantId) {
          this.tenantId = savedTenantId;
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn('Failed to load tenant ID:', errorMessage);
        this.errorService.handleError(error as Error);
      }

      // Set initial breakpoint based on current window width
      if (this.platformUtils.window) {
        this.setBreakpoint(this.platformUtils.window.innerWidth);
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    if (this.isBrowser && this.platformUtils.window) {
      const target = event.target as Window;
      this.setBreakpoint(target.innerWidth);
    }
  }
}
