import { PageableResponse } from '../../../shared/models/pageable-response.model';

export interface ProductSale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  saleDate: Date;
  soldById: string;
  soldByName: string;
  customerId?: string;
  customerName?: string;
  bookingId?: string;
  notes?: string;
}

export interface ProductSalesSummary {
  totalSales: number;
  totalRevenue: number;
  totalItemsSold: number;
  averageSaleValue: number;
  salesByProduct: Array<{
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }>;
  salesByDate: Array<{
    date: string;
    sales: number;
    items: number;
  }>;
}

export interface ProductSalesFilter {
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
  productId?: string;
  soldById?: string;
  customerId?: string;
}

export interface DashboardStats {
  totalCustomers: number;
  totalAppointments: number;
  totalRevenue: number;
  newCustomers: number;
  pendingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  topServices: Array<{ name: string; count: number }>;
  topStaff: Array<{ name: string; appointments: number }>;
}

export type ProductSalesResponse = PageableResponse<ProductSale>;
