import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartData, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { DashboardApiService, ProductSalesData } from '../../../shared/dashboard-api.service';

@Component({
  selector: 'app-product-sales-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './product-sales-chart.component.html',
  styleUrls: ['./product-sales-chart.component.scss'],
})
export class ProductSalesChartComponent {
  @Input() tenantId = '';
  data = signal<ChartData<'bar'>>({ labels: [], datasets: [] });
  options: ChartOptions<'bar'> = { responsive: true };
  loading = signal(true);
  error = signal<string | null>(null);

  private api = inject(DashboardApiService);

  ngOnInit() {
    if (!this.tenantId) return;
    this.loading.set(true);
    this.api.getProductSales(this.tenantId).subscribe({
      next: (res) => {
        this.data.set(res);
        this.loading.set(false);
        this.error.set(null);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load product sales');
        this.loading.set(false);
      },
    });
  }
}
