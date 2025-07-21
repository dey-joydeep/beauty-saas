import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreatePortfolioParams, UpdatePortfolioParams } from '../../models/portfolio-params.model';

export interface PortfolioItem {
  id?: string;
  tenantId: string;
  userId: string;
  imagePath: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private apiUrl = '/api/portfolio';

  constructor(private http: HttpClient) {}

  getPortfolioItems(tenantId: string): Observable<PortfolioItem[]> {
    return this.http.get<PortfolioItem[]>(`${this.apiUrl}?tenant_id=${tenantId}`);
  }

  createPortfolioItem(params: CreatePortfolioParams | FormData): Observable<PortfolioItem> {
    return this.http.post<PortfolioItem>(this.apiUrl, params);
  }

  updatePortfolioItem(id: string, params: UpdatePortfolioParams | FormData): Observable<PortfolioItem> {
    return this.http.put<PortfolioItem>(`${this.apiUrl}/${id}`, params);
  }

  deletePortfolioItem(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getPortfolioImage(id: string): string {
    return `${this.apiUrl}/${id}/image`;
  }
}
