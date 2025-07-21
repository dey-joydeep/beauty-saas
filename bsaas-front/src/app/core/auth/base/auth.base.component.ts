import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseFeatureComponent } from '../../../shared/base-feature.component';
import { ErrorService } from '../../../core/error.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: '',
})
export abstract class AuthBaseComponent extends BaseFeatureComponent implements OnInit, OnDestroy {
  constructor(@Inject(ErrorService) protected override errorService: ErrorService) {
    super(errorService);
  }

  protected override setupErrorSubscription(): void {
    this.errorService.error$.subscribe((errorState) => {
      if (errorState) {
        this.loading = false;
        this.error = errorState.message;
      }
    });
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  public override ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
