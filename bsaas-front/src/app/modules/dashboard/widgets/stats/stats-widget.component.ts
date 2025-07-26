import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { BaseComponent } from '../../../../core/base.component';
import { ErrorService } from '../../../../core/error.service';
import { DashboardStats } from '../../models/dashboard.model';

@Component({
  selector: 'app-stats-widget',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, TranslateModule],
  templateUrl: './stats-widget.component.html',
  styleUrls: ['./stats-widget.component.scss'],
})
export class StatsWidgetComponent extends BaseComponent {
  @Input() stats!: DashboardStats;

  constructor(protected override errorService: ErrorService) {
    super(errorService);
  }

  public override ngOnInit(): void {
    // No additional initialization needed
  }
}
