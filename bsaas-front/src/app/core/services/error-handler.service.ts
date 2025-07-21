import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService implements ErrorHandler {
  constructor(private injector: Injector) {}

  handleError(error: Error | HttpErrorResponse): void {
    const snackBar = this.injector.get(MatSnackBar);
    const translate = this.injector.get(TranslateService);

    console.error('Error occurred:', error);

    let errorMessage = 'ERRORS.GENERIC';
    
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        errorMessage = 'ERRORS.NETWORK';
      } else if (error.status >= 400 && error.status < 500) {
        errorMessage = 'ERRORS.CLIENT';
      } else if (error.status >= 500) {
        errorMessage = 'ERRORS.SERVER';
      }
    }

    snackBar.open(
      translate.instant(errorMessage),
      translate.instant('COMMON.CLOSE'),
      { duration: 5000, panelClass: ['error-snackbar'] }
    );
  }
}
