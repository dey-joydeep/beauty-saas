import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export interface CurrentUserPort {
  readonly currentUser$: Observable<unknown | null>;
  readonly isAuthenticated$: Observable<boolean>;
  redirectUrl: string | null;
}

export const CURRENT_USER = new InjectionToken<CurrentUserPort>('CURRENT_USER');
