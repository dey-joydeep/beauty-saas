import { ApplicationConfig, ErrorHandler } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { tempRoutes } from './temp.routes';

// Simple error handler for minimal setup
class SimpleErrorHandler implements ErrorHandler {
  handleError(error: any) {
    console.error('An error occurred:', error);
  }
}

export const tempAppConfig: ApplicationConfig = {
  providers: [
    provideRouter(tempRoutes),
    provideClientHydration(),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: ErrorHandler, useClass: SimpleErrorHandler },
  ],
};
