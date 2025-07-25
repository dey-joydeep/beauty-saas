import { Component, Input, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartData, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { DashboardApiService, SubscriptionData } from '../../../shared/dashboard-api.service';

@Component({
  selector: 'app-subscription-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './subscription-chart.component.html',
  styleUrls: ['./subscription-chart.component.scss'],
})
export class SubscriptionChartComponent implements OnInit {
  @Input() tenantId = '';
  data = signal<ChartData<'bar'>>({ labels: [], datasets: [] });
  options: ChartOptions<'bar'> = { responsive: true };
  loading = signal(true);
  error = signal<string | null>(null);

  private api = inject(DashboardApiService);

  ngOnInit() {
    if (!this.tenantId) return;
    this.loading.set(true);
    this.api.getSubscriptions(this.tenantId).subscribe({
      next: (res) => {
        this.data.set(res);
        this.loading.set(false);
        this.error.set(null);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load subscriptions');
        this.loading.set(false);
      },
    });
  }
}
