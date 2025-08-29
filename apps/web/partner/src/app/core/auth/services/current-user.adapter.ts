import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { type CurrentUserPort, type CurrentUserMin } from '@cthub-bsaas/web-core/auth';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class CurrentUserAdapter implements CurrentUserPort {
    public redirectUrl: string | null = null;

    public readonly currentUser$: Observable<CurrentUserMin | null>;

    public readonly isAuthenticated$: Observable<boolean>;

    constructor(private readonly authService: AuthService) {
        this.currentUser$ = this.authService.currentUser$.pipe(
            map((u) => (u ? { id: u.id, role: u.role } : null)),
        );

        this.isAuthenticated$ = this.authService.currentUser$.pipe(map((u) => !!u));
    }
}
