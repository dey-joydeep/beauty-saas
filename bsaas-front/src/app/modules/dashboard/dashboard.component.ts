import { Component, Inject } from '@angular/core';
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
  breakpoint: number;

  constructor(@Inject(ErrorService) protected override errorService: ErrorService) {
    super(errorService);
    this.tenantId = localStorage.getItem('tenantId') || DashboardComponent.tenantId;
  }
}
