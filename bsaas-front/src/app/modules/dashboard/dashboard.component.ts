import { Component, HostListener, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

import { StatsWidgetComponent } from './widgets/stats/stats-widget.component';
import { RevenueChartWidgetComponent } from './widgets/revenue-chart/revenue-chart-widget.component';
import { CustomerStatsWidgetComponent } from './widgets/customer-stats/customer-stats-widget.component';
import { ProductSalesWidgetComponent } from './widgets/product-sales/product-sales-widget.component';
import { SubscriptionChartWidgetComponent } from './widgets/subscription-chart/subscription-chart-widget.component';
import { RenewalsListWidgetComponent } from './widgets/renewals-list/renewals-list-widget.component';
import { BaseComponent } from '../../core/base.component';
import { ErrorService } from '../../core/error.service';

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
export class DashboardComponent extends BaseComponent {
  static tenantId = 'demo-tenant';
  tenantId: string;

  // Define the dashboard layout
  dashboardLayout = {
    columns: 1,
    rowHeight: '500px',
    gutterSize: '16px',
  };

  // Breakpoint configuration for responsive design
  breakpoint: number = 1; // Default to 1 column

  constructor(@Inject(ErrorService) protected override errorService: ErrorService) {
    super(errorService);
    this.tenantId = localStorage.getItem('tenantId') || DashboardComponent.tenantId;
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
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.setBreakpoint(event.target.innerWidth);
  }
}
