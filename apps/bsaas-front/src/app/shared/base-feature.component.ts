import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../core/base.component';
import { ErrorService } from '../core/error.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: '',
})
export abstract class BaseFeatureComponent extends BaseComponent implements OnInit, OnDestroy {
  constructor(@Inject(ErrorService) protected override errorService: ErrorService) {
    super(errorService);
  }

  public override ngOnInit(): void {
    super.ngOnInit();
    this.setupErrorSubscription();
  }

  public override ngOnDestroy(): void {
    super.ngOnDestroy();
    // Optional cleanup
  }

  protected abstract override setupErrorSubscription(): void;

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
}
