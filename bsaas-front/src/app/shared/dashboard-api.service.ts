import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, catchError, of } from 'rxjs';

export interface DashboardStats {
  businessCount: number;
  customerCount: number;
  activeBusiness: number;
  activeCustomer: number;
}

export interface SubscriptionData {
  labels: string[];
  datasets: any[];
}
export interface RevenueData {
  labels: string[];
  datasets: any[];
}
export interface ProductSalesData {
  labels: string[];
  datasets: any[];
}
export interface Renewal {
  salonName: string;
  renewalDate: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  private http = inject(HttpClient);

  getUserStats(tenantId: string) {
    return this.http.get<DashboardStats>(`/api/user/stats?tenant_id=${tenantId}`);
  }

  getSubscriptions(tenantId: string) {
    return this.http.get<SubscriptionData>(`/api/dashboard/subscriptions?tenant_id=${tenantId}`);
  }

  getRevenue(tenantId: string) {
    return this.http.get<RevenueData>(`/api/dashboard/revenue?tenant_id=${tenantId}`);
  }

  getProductSales(tenantId: string) {
    return this.http.get<ProductSalesData>(`/api/dashboard/product-sales?tenant_id=${tenantId}`);
  }

  getRenewals(tenantId: string) {
    return this.http.get<Renewal[]>(`/api/dashboard/renewals?tenant_id=${tenantId}`);
  }
}
