import { Component, Input, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { BaseComponent } from '../../../../core/base.component';
import { ErrorService } from '../../../../core/error.service';
import { ProductSales } from '../../models/dashboard.model';
import { DashboardService } from '../../../dashboard/dashboard.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-product-sales-widget',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatListModule, MatProgressSpinnerModule, TranslateModule],
  templateUrl: './product-sales-widget.component.html',
  styleUrls: ['./product-sales-widget.component.scss'],
})
export class ProductSalesWidgetComponent extends BaseComponent implements OnInit, OnDestroy {
  @Input() tenantId!: string;
  @Input() title = 'Product Sales';
  @Input() subtitle = 'View product sales statistics';

  productSales: ProductSales[] = [];

  constructor(
    @Inject(ErrorService) protected override errorService: ErrorService,
    private dashboardService: DashboardService,
  ) {
    super(errorService);
  }

  override ngOnInit(): void {
    this.loadSalesData();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  private async loadSalesData(): Promise<void> {
    this.loading = true;
    try {
      this.productSales = await this.dashboardService.getProductSales(this.tenantId);
    } catch (error) {
      this.handleError(error);
    } finally {
      this.loading = false;
    }
  }

  getTotalRevenue(): number {
    return this.productSales.reduce((total, sale) => total + sale.revenue, 0);
  }

  getTopRevenuePercentage(max: number): number {
    const top = this.getTopProduct();
    return top ? (top.revenue / max) * 100 : 0;
  }

  getTopProduct(): ProductSales | null {
    if (!this.productSales.length) return null;
    return this.productSales.reduce((a, b) => (a.revenue > b.revenue ? a : b));
  }
}
