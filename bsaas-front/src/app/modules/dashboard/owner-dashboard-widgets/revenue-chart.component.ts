import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartData, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { DashboardApiService, RevenueData } from '../../../shared/dashboard-api.service';

@Component({
  selector: 'app-revenue-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './revenue-chart.component.html',
  styleUrls: ['./revenue-chart.component.scss'],
})
export class RevenueChartComponent {
  @Input() tenantId = '';
  data = signal<ChartData<'line'>>({ labels: [], datasets: [] });
  options: ChartOptions<'line'> = { responsive: true };
  loading = signal(true);
  error = signal<string | null>(null);

  private api = inject(DashboardApiService);

  ngOnInit() {
    if (!this.tenantId) return;
    this.loading.set(true);
    this.api.getRevenue(this.tenantId).subscribe({
      next: (res) => {
        this.data.set(res);
        this.loading.set(false);
        this.error.set(null);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load revenue');
        this.loading.set(false);
      },
    });
  }
}
