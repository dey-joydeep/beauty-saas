import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardApiService, Renewal } from '../../../shared/dashboard-api.service';

@Component({
  selector: 'app-renewals-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './renewals-list.component.html',
  styleUrls: ['./renewals-list.component.scss'],
})
export class RenewalsListComponent {
  @Input() tenantId = '';
  renewals = signal<Renewal[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  private api = inject(DashboardApiService);

  ngOnInit() {
    if (!this.tenantId) return;
    this.loading.set(true);
    this.api.getRenewals(this.tenantId).subscribe({
      next: (res: Renewal[]) => {
        this.renewals.set(res);
        this.loading.set(false);
        this.error.set(null);
      },
      error: (err: Error) => {
        this.error.set(err.message || 'Failed to load renewals');
        this.loading.set(false);
      },
    });
  }
}
