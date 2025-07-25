import { Component, OnDestroy, Input, ViewChild, ElementRef, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { DashboardService } from '../../../dashboard/dashboard.service';
import { BaseComponent } from '../../../../core/base.component';
import { Renewal } from '../../../../models/renewal.model';
import { ErrorService } from '../../../../core/error.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-renewals-list-widget',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatListModule, MatButtonModule, MatProgressSpinnerModule, TranslateModule],
  templateUrl: './renewals-list-widget.component.html',
  styleUrls: ['./renewals-list-widget.component.scss'],
})
export class RenewalsListWidgetComponent extends BaseComponent {
  @Input() tenantId!: string;
  @Input() title = 'Upcoming Renewals';
  @Input() subtitle = 'View all upcoming subscription renewals';

  renewals: Renewal[] = [];

  constructor(
    @Inject(ErrorService) protected override errorService: ErrorService,
    private dashboardService: DashboardService,
  ) {
    super(errorService);
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  override handleError(error: any): void {
    super.handleError(error);
  }

  private async loadRenewals() {
    try {
      this.loading = true;
      this.error = null;
      const renewals = await this.dashboardService.getUpcomingRenewals();
      this.renewals = renewals;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Failed to load renewals';
      this.handleError(error);
    } finally {
      this.loading = false;
    }
  }

  public override ngOnInit(): void {
    this.loadRenewals();
  }

  formatRenewalDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatRenewalStatus(status: 'pending' | 'completed' | 'overdue'): string {
    const statusMap = {
      pending: 'DASHBOARD.RENEWALS.STATUS.PENDING',
      completed: 'DASHBOARD.RENEWALS.STATUS.COMPLETED',
      overdue: 'DASHBOARD.RENEWALS.STATUS.OVERDUE',
    };
    return statusMap[status];
  }

  getStatusColor(status: 'pending' | 'completed' | 'overdue'): string {
    const colorMap = {
      pending: 'var(--mat-warning)',
      completed: 'var(--mat-success)',
      overdue: 'var(--mat-error)',
    };
    return colorMap[status];
  }

  getDaysUntilRenewal(renewalDate: Date): number {
    const today = new Date();
    const renewal = new Date(renewalDate);
    return Math.ceil((renewal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  getRenewalCountByStatus(status: 'pending' | 'completed' | 'overdue'): number {
    return this.renewals.filter((renewal) => renewal.status === status).length;
  }

  getStatusIcon(status: 'pending' | 'completed' | 'overdue'): string {
    const iconMap = {
      pending: 'pending_actions',
      completed: 'done',
      overdue: 'error_outline',
    };
    return iconMap[status];
  }
}
