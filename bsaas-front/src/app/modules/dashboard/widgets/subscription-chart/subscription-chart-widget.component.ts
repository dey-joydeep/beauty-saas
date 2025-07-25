import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { BaseComponent } from '../../../../core/base.component';
import { ErrorService } from '../../../../core/error.service';
import { SubscriptionData } from '../../../../models/dashboard.model';

interface ChartData {
  month: string;
  retentionRate: number;
}
import { Chart, ChartConfiguration } from 'chart.js';

interface ChartData {
  month: string;
  retentionRate: number;
}

@Component({
  selector: 'app-subscription-chart-widget',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule, TranslateModule],
  templateUrl: './subscription-chart-widget.component.html',
  styleUrls: ['./subscription-chart-widget.component.scss'],
})
export class SubscriptionChartWidgetComponent extends BaseComponent {
  @Input() subscriptionData!: SubscriptionData[];
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart!: Chart;
  protected override get loading(): boolean {
    return super.loading;
  }

  protected override set loading(value: boolean) {
    super.loading = value;
  }

  protected override get error(): string | null {
    return super.error;
  }

  protected override set error(value: string | null) {
    super.error = value;
  }

  constructor(protected override errorService: ErrorService) {
    super(errorService);
  }

  public override ngOnInit(): void {
    super.ngOnInit();
    this.setupErrorSubscription();
  }

  public override ngOnDestroy(): void {
    super.ngOnDestroy();
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private errorSubscription: Subscription | null = null;

  protected override setupErrorSubscription(): void {
    super.setupErrorSubscription();
    this.errorSubscription = this.errorService.error$.subscribe((errorState) => {
      if (errorState) {
        this.loading = false;
        this.error = errorState.message;
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.subscriptionData && this.subscriptionData.length > 0) {
      this.initializeChart();
    }
  }

  private initializeChart(): void {
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const chartData = this.subscriptionData.map((data) => ({
      month: new Date(data.month).toLocaleDateString('en-US', { month: 'short' }),
      retentionRate: data.retentionRate,
    }));

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: chartData.map((data) => data.month),
        datasets: [
          {
            label: 'Customer Retention Rate',
            data: chartData.map((data) => data.retentionRate),
            borderColor: 'var(--mat-primary)',
            backgroundColor: 'rgba(13, 110, 253, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: 'var(--mat-primary)',
            pointBorderColor: 'var(--mat-primary)',
            pointHoverBackgroundColor: 'var(--mat-primary)',
            pointHoverBorderColor: 'var(--mat-primary)',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top' as const,
            labels: {
              color: 'var(--bsaas-text-primary)',
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const rate = context.raw as number;
                return `${rate.toFixed(1)}%`;
              },
            },
            backgroundColor: 'var(--mat-primary)',
            titleColor: 'white',
            bodyColor: 'white',
            borderColor: 'rgba(13, 110, 253, 0.2)',
            borderWidth: 1,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              stepSize: 20,
              callback: (value) => `${value}%`,
              color: 'var(--bsaas-text-secondary)',
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
            },
          },
          x: {
            ticks: {
              color: 'var(--bsaas-text-secondary)',
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
            },
          },
        },
      },
    };

    this.chart = new Chart(ctx, config);
  }
}
