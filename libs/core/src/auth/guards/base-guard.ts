import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export abstract class BaseGuard implements CanActivate {
  constructor(protected router: Router) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkAccess(next, state);
  }

  protected abstract checkAccess(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean> | Promise<boolean> | boolean;

  protected redirectToLogin(): Observable<boolean> {
    this.router.navigate(['/auth/login']);
    return of(false);
  }
}
