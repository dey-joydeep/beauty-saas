import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';

export interface AuthStatePort {
  // May be synchronous or asynchronous depending on app implementation
  isAuthenticated(): boolean | Promise<boolean>;
  // Optional reactive auth state the core can subscribe to (preferred if available)
  authState$?: Observable<boolean>;
}

export const AUTH_STATE_PORT = new InjectionToken<AuthStatePort>('AUTH_STATE_PORT');
