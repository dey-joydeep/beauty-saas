import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User } from '../core/shared/current-user.service';

@Injectable({ providedIn: 'root' })
export class CurrentUserService {
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$: Observable<User | null> = this.userSubject.asObservable();
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Loads the current user from the backend using the /user/me endpoint.
   * Sets user to null if not authenticated.
   */
  loadCurrentUser(): void {
    this.loadingSubject.next(true);
    this.http
      .get<{ user: User }>('/api/user/me', { withCredentials: true })
      .pipe(
        tap((response) => this.userSubject.next(response.user)),
        catchError(() => {
          this.userSubject.next(null);
          return of(null);
        }),
        tap(() => this.loadingSubject.next(false)),
      )
      .subscribe();
  }

  /**
   * Returns the current user value (synchronously).
   */
  get currentUser(): User | null {
    return this.userSubject.value;
  }

  /**
   * Returns true if the user is logged in.
   */
  get isAuthenticated(): boolean {
    return !!this.userSubject.value;
  }

  /**
   * Call after logout to clear user state.
   */
  clearUser(): void {
    this.userSubject.next(null);
  }
}
