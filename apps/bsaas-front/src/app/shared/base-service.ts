import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export abstract class BaseService {
  protected baseUrl: string;

  constructor(protected http: HttpClient) {
    this.baseUrl = environment.apiUrl;
  }

  protected getFullUrl(endpoint: string): string {
    return `${this.baseUrl}/${endpoint}`;
  }

  protected handleError(error: any): Promise<any> {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
}
