import { Injectable, Inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { BaseGuard } from '../../../shared/base-guard';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export abstract class AuthBaseGuard extends BaseGuard implements CanActivate {
  constructor(@Inject(Router) protected override router: Router) {
    super(router);
  }

  protected abstract canActivateInternal(): boolean | Promise<boolean> | Observable<boolean>;

  override canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Promise<boolean> | Observable<boolean> {
    return this.canActivateInternal();
  }
}
