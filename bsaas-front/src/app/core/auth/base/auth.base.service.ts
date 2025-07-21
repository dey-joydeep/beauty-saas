import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { BaseService } from '../../../shared/base-service';

@Injectable({
  providedIn: 'root',
})
export abstract class AuthBaseService extends BaseService {
  protected authState = new BehaviorSubject<boolean>(false);

  constructor(@Inject(HttpClient) protected override http: HttpClient) {
    super(http);
  }

  get isAuthenticated(): boolean {
    return this.authState.value;
  }

  protected abstract login(username: string, password: string): Promise<any>;
  protected abstract logout(): Promise<void>;
  protected abstract register(user: any): Promise<any>;
  protected abstract forgotPassword(email: string): Promise<any>;
}
