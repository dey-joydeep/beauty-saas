import { Component, Input, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { BaseComponent } from '../../../../core/base.component';
import { ErrorService } from '../../../../core/error.service';
import { DashboardService } from '../../dashboard.service';
import { DashboardStats } from '../../../../models/dashboard.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-customer-stats-widget',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule, MatButtonModule, MatTooltipModule, TranslateModule],
  templateUrl: './customer-stats-widget.component.html',
  styleUrls: ['./customer-stats-widget.component.scss'],
})
export class CustomerStatsWidgetComponent extends BaseComponent {
  stats: DashboardStats = {
    totalCustomers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    count: 0,
    newCustomers: 0,
    returningCustomers: 0,
  };

  private statsSubscription?: Subscription;

  constructor(
    @Inject(ErrorService) protected override errorService: ErrorService,
    private dashboardService: DashboardService,
  ) {
    super(errorService);
  }

  public override ngOnInit(): void {
    super.ngOnInit();
    this.loadStats();
  }

  public override ngOnDestroy(): void {
    this.statsSubscription?.unsubscribe();
    super.ngOnDestroy();
  }

  loadStats(): void {
    this.loading = true;
    this.error = '';

    // Store the promise in a variable to avoid TypeScript error
    const statsPromise = this.dashboardService.getStats();

    // Handle the promise
    statsPromise
      .then((stats) => {
        this.stats = { ...this.stats, ...stats };
        this.loading = false;
      })
      .catch((error) => {
        this.error = 'Failed to load customer statistics. Please try again later.';
        this.loading = false;
        console.error('Error loading customer stats:', error);
      });

    // Store the subscription for cleanup
    this.statsSubscription = new Subscription(() => {
      // Cleanup logic if needed when component is destroyed
    });
  }

  refresh(): void {
    this.loadStats();
  }
}
