import { Component, OnInit, OnDestroy, Inject, ViewChild, ElementRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../../../../core/base.component';
import { ErrorService } from '../../../../core/error.service';
import { Subscription } from 'rxjs';
import { DashboardService } from '../../../dashboard/dashboard.service';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Chart, ChartConfiguration } from 'chart.js';

@Component({
  standalone: true,
  imports: [CommonModule, TranslateModule, MatCardModule, MatButtonModule, MatIconModule, MatTooltipModule, MatProgressSpinnerModule],
  selector: 'app-revenue-chart-widget',
  templateUrl: './revenue-chart-widget.component.html',
  styleUrls: ['./revenue-chart-widget.component.scss'],
})
export class RevenueChartWidgetComponent extends BaseComponent implements OnInit, OnDestroy {
  @Input() revenueData: any[] = [];
  constructor(
    @Inject(ErrorService) protected override errorService: ErrorService,
    private dashboardService: DashboardService,
  ) {
    super(errorService);
  }

  chartData: ChartConfiguration['data'] | undefined;
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart!: Chart;
  chartOptions: ChartConfiguration['options'] | undefined;

  public override ngOnInit(): void {
    this.setupChart();
    this.loadData();
  }

  public override ngOnDestroy(): void {
    super.setupErrorSubscription();
    if (this.chart) {
      this.chart.destroy();
    }
    super.ngOnDestroy();
  }

  private setupChart(): void {
    this.chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Monthly Revenue',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return '$' + value.toLocaleString();
            },
          },
        },
      },
    };
  }

  private loadData(): void {
    this.loading = true;
    this.error = null;

    this.dashboardService.getRevenueChart().subscribe({
      next: (data) => {
        this.loading = false;
        this.chartData = {
          labels: data.map((item) => new Date(item.date).toLocaleDateString()),
          datasets: [
            {
              label: 'Revenue',
              data: data.map((item) => item.amount),
              fill: false,
              borderColor: '#4CAF50',
              tension: 0.1,
            },
          ],
        };
      },
      error: (error) => {
        this.loading = false;
        this.error = error.message;
      },
    });
  }

  protected ngAfterViewInit(): void {
    if (this.chartData && this.chartOptions && this.chartCanvas.nativeElement) {
      const ctx = this.chartCanvas.nativeElement.getContext('2d');
      if (ctx) {
        this.chart = new Chart(ctx, {
          type: 'line',
          data: this.chartData,
          options: this.chartOptions,
        });
      }
    }
  }

  private errorSubscription: Subscription | null = null;

  protected override setupErrorSubscription(): void {
    this.errorSubscription = this.errorService.error$.subscribe((errorState) => {
      if (errorState) {
        this.loading = false;
        this.error = errorState.message;
      }
    });
  }
}
