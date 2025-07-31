import { Component, HostListener, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

import { StatsWidgetComponent } from './widgets/stats/stats-widget.component';
import { RevenueChartWidgetComponent } from './widgets/revenue-chart/revenue-chart-widget.component';
import { CustomerStatsWidgetComponent } from './widgets/customer-stats/customer-stats-widget.component';
import { ProductSalesWidgetComponent } from './widgets/product-sales/product-sales-widget.component';
import { SubscriptionChartWidgetComponent } from './widgets/subscription-chart/subscription-chart-widget.component';
import { RenewalsListWidgetComponent } from './widgets/renewals-list/renewals-list-widget.component';
import { BaseComponent } from '../../core/base.component';
import { ErrorService } from '../../core/error.service';
import { StorageService } from '../../core/services/storage.service';
import { IPlatformUtils, PLATFORM_UTILS_TOKEN } from '../../core/utils/platform-utils';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    TranslateModule,
    StatsWidgetComponent,
    RevenueChartWidgetComponent,
    CustomerStatsWidgetComponent,
    ProductSalesWidgetComponent,
    SubscriptionChartWidgetComponent,
    RenewalsListWidgetComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent extends BaseComponent implements OnInit {
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
    @Inject(ErrorService) protected override errorService: ErrorService,
    private storageService: StorageService,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(PLATFORM_UTILS_TOKEN) private platformUtils: IPlatformUtils
  ) {
    super(errorService);
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.tenantId = DashboardComponent.tenantId; // Default value, will be updated in ngOnInit
    this.setBreakpoint(window.innerWidth);
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
        const savedTenantId = await firstValueFrom(this.storageService.getItem<string>('tenantId'));
        if (savedTenantId) {
          this.tenantId = savedTenantId;
        }
      } catch (error) {
        console.warn('Failed to load tenant ID:', error);
      }
      
      // Set initial breakpoint based on current window width
      this.setBreakpoint(this.platformUtils.window?.innerWidth || 0);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    if (this.isBrowser) {
      const target = event.target as Window;
      this.setBreakpoint(target.innerWidth);
    }
  }
}
