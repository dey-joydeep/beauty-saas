import { Component, OnDestroy, Input, ViewChild, ElementRef, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { BaseComponent } from '../../../../core/base.component';
import { ErrorService } from '../../../../core/error.service';
import { Subscription } from 'rxjs';
import { DashboardApiService } from '../../../../shared/dashboard-api.service';

interface ApiRenewal {
  salonName: string;
  renewalDate: string;
}

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

  renewals: Array<ApiRenewal & { status: 'pending' | 'completed' | 'overdue' }> = [];
  private subscriptions = new Subscription();

  constructor(
    @Inject(ErrorService) protected override errorService: ErrorService,
    private dashboardApiService: DashboardApiService,
  ) {
    super(errorService);
  }

  override ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    super.ngOnDestroy();
  }

  override handleError(error: any): void {
    super.handleError(error);
  }

  private loadRenewals() {
    if (!this.tenantId) {
      this.error = 'Tenant ID is required';
      return;
    }
    
    this.loading = true;
    this.error = null;
    
    const sub = this.dashboardApiService.getRenewals(this.tenantId).subscribe({
      next: (renewals) => {
        this.renewals = renewals.map(renewal => ({
          ...renewal,
          status: this.getRenewalStatus(renewal.renewalDate),
          renewalDate: renewal.renewalDate // Keep as string to match the interface
        }));
        this.loading = false;
      },
      error: (error) => {
        this.error = error instanceof Error ? error.message : 'Failed to load renewals';
        this.handleError(error);
        this.loading = false;
      }
    });
    
    this.subscriptions.add(sub);
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

  getDaysUntilRenewal(renewalDate: string): number {
    const today = new Date();
    const renewal = new Date(renewalDate);
    return Math.ceil((renewal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  private getRenewalStatus(renewalDate: string): 'pending' | 'completed' | 'overdue' {
    const daysUntilRenewal = this.getDaysUntilRenewal(renewalDate);
    if (daysUntilRenewal < 0) return 'overdue';
    if (daysUntilRenewal <= 7) return 'pending';
    return 'completed';
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
