import { OnDestroy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorService } from './error.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: '',
})
export abstract class BaseComponent implements OnInit, OnDestroy {
  private _error: string | null = null;
  private _loading = false;

  constructor(protected errorService: ErrorService) {}

  ngOnInit(): void {
    this.setupErrorSubscription();
  }

  protected setupErrorSubscription(): void {
    this.errorService.error$.subscribe((errorState) => {
      if (errorState) {
        this.loading = false;
        this.error = errorState.message;
        // Clear error after 5 seconds
        setTimeout(() => {
          this.error = null;
        }, 5000);
      }
    });
  }

  ngOnDestroy(): void {
    // This is optional if we want to unsubscribe from the error stream
    // In this case, we're not storing the subscription, but we could if needed
  }

  // Helper method for error handling
  protected handleError(error: any): void {
    this.error = this.errorService.getErrorMessage(error);
    this.loading = false;
  }

  protected get loading(): boolean {
    return this._loading;
  }

  protected set loading(value: boolean) {
    this._loading = value;
  }

  protected get error(): string | null {
    return this._error;
  }

  protected set error(value: string | null) {
    this._error = value;
  }
}
