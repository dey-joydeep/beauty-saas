import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { BaseComponent } from '../../../../core/base.component';
import { ErrorService } from '../../../../core/error.service';
import { RevenueData } from '../../../../models/dashboard.model';

@Component({
  selector: 'app-revenue-chart',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, TranslateModule],
  templateUrl: './revenue-chart.component.html',
  styleUrls: ['./revenue-chart.component.scss'],
})
export class RevenueChartComponent extends BaseComponent {
  @Input() revenueData!: RevenueData[];

  constructor(protected errorService: ErrorService) {
    super(errorService);
  }

  ngOnInit(): void {
    // No additional initialization needed
  }
}
